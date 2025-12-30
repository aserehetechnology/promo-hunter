import express from 'express';
import cors from 'cors';
import { db, initDB } from './db.js';

import { redditScraper } from './scrapers/reddit.js';
import { productHuntScraper } from './scrapers/producthunt.js';
import { githubScraper } from './scrapers/github.js';
import { alternativeScraper } from './scrapers/alternative.js';
import { rssScraper } from './scrapers/rss.js';
import { cheatsScraper } from './scrapers/cheats.js';
import { directoryScraper } from './scrapers/directory.js';
import { appSumoScraper } from './scrapers/appsumo.js';

const app = express();
const PORT = 3001;

// Init DB Table
initDB().catch(console.error);

app.use(cors());
app.use(express.json());

// Get all promos with filters
app.get('/api/promos', async (req, res) => {
    const { category, country, search, source, limit } = req.query;

    let query = 'SELECT * FROM promos WHERE 1=1';
    const args = [];

    if (category && category !== 'all') {
        query += ' AND category = ?';
        args.push(category);
    }

    if (country && country !== 'all') {
        query += ' AND country = ?';
        args.push(country);
    }

    if (source && source !== 'all') {
        query += ' AND source = ?';
        args.push(source);
    }

    if (search) {
        query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
        const searchParam = `%${search}%`;
        args.push(searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
        query += ' LIMIT ?';
        args.push(limit);
    } else {
        query += ' LIMIT 100';
    }

    try {
        const result = await db.execute({ sql: query, args });
        res.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const total = await db.execute('SELECT COUNT(*) as count FROM promos');
        const recent = await db.execute("SELECT COUNT(*) as count FROM promos WHERE created_at > datetime('now', '-24 hours')");

        res.json({
            total: total.rows[0].count,
            last24h: recent.rows[0].count
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Stats Error' });
    }
});

const handleScrape = async (req, res) => {
    console.log('⚡ Scraping triggered!');
    try {
        const results = await runScrapers();
        res.json({ message: 'Scraping completed', stats: results });
    } catch (error) {
        console.error('Scraping failed:', error);
        res.status(500).json({ error: 'Scraping failed' });
    }
};

// Trigger scraping (Support GET for Cron, POST for Button)
app.get('/api/scrape', handleScrape);
app.post('/api/scrape', handleScrape);

// Clear all promos (Dev only usually)
app.delete('/api/promos', async (req, res) => {
    await db.execute('DELETE FROM promos');
    res.json({ message: 'All promos deleted' });
});

async function runScrapers() {
    console.log('🧹 Cleaning up old deals (3 days retention)...');
    try {
        // Delete items older than 3 days to keep the feed fresh
        await db.execute("DELETE FROM promos WHERE created_at < datetime('now', '-3 days')");
    } catch (e) {
        console.error('Cleanup failed:', e);
    }

    console.log('🚀 Starting scrapers...');

    const results = await Promise.allSettled([
        rssScraper(db),
        cheatsScraper(db),
        directoryScraper(db),
        appSumoScraper(db),
        alternativeScraper(db),
        redditScraper(db),
        productHuntScraper(db),
        githubScraper(db)
    ]);

    const stats = {};
    const scraperNames = ['RSS', 'Cheats', 'Directory', 'AppSumo', 'Curated', 'Reddit', 'Product Hunt', 'GitHub'];

    results.forEach((result, index) => {
        const name = scraperNames[index];
        if (result.status === 'fulfilled') {
            console.log(`✅ ${name}: ${result.value} items`);
            stats[name] = result.value;
        } else {
            console.error(`❌ ${name}: ${result.reason}`);
            stats[name] = 'failed';
        }
    });

    return stats;
}

// Initial scrape on startup (Only locally)
if (process.env.NODE_ENV !== 'production') {
    // runScrapers(); 
}

export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
