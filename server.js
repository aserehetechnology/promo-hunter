import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { redditScraper } from './scrapers/reddit.js';
import { productHuntScraper } from './scrapers/producthunt.js';
import { githubScraper } from './scrapers/github.js';
import { alternativeScraper } from './scrapers/alternative.js';
import { rssScraper } from './scrapers/rss.js';
import { cheatsScraper } from './scrapers/cheats.js';
import { directoryScraper } from './scrapers/directory.js';
import { appSumoScraper } from './scrapers/appsumo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Initialize database
const db = new Database('promos.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS promos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category TEXT,
    country TEXT,
    source TEXT,
    image_url TEXT,
    expiry_date TEXT,
    tags TEXT,
    promo_code TEXT,
    instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(url)
  )
`);

app.use(cors());
app.use(express.json());

// Get all promos with filters
app.get('/api/promos', (req, res) => {
    const { category, country, search, source } = req.query;

    let query = 'SELECT * FROM promos WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
    }

    if (country && country !== 'all') {
        query += ' AND country = ?';
        params.push(country);
    }

    if (source && source !== 'all') {
        query += ' AND source = ?';
        params.push(source);
    }

    if (search) {
        query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const stmt = db.prepare(query);
    const promos = stmt.all(...params);

    res.json(promos);
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const totalPromos = db.prepare('SELECT COUNT(*) as count FROM promos').get();
    const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM promos GROUP BY category').all();
    const bySource = db.prepare('SELECT source, COUNT(*) as count FROM promos GROUP BY source').all();
    // Fix: Use single quotes for string literals in SQLite
    const recentCount = db.prepare("SELECT COUNT(*) as count FROM promos WHERE created_at > datetime('now', '-24 hours')").get();

    res.json({
        total: totalPromos.count,
        byCategory,
        bySource,
        last24h: recentCount.count
    });
});

// Trigger scraping
app.post('/api/scrape', async (req, res) => {
    try {
        res.json({ message: 'Scraping started in background' });

        // Run scrapers in background
        setTimeout(async () => {
            await runScrapers();
        }, 0);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all promos
app.delete('/api/promos', (req, res) => {
    db.prepare('DELETE FROM promos').run();
    res.json({ message: 'All promos deleted' });
});

async function runScrapers() {
    console.log('🚀 Starting scrapers...');

    try {
        // Run all scrapers in parallel
        const results = await Promise.allSettled([
            rssScraper(db),
            cheatsScraper(db),
            directoryScraper(db), // Updates sources directory
            appSumoScraper(db),   // Specific scraping
            alternativeScraper(db), // Keep original curated list too
            redditScraper(db),
            productHuntScraper(db),
            githubScraper(db)
        ]);

        results.forEach((result, index) => {
            const scraperNames = ['RSS Feeds', 'Cheat Database', 'User Directory', 'AppSumo Freebies', 'Curated List', 'Reddit', 'Product Hunt', 'GitHub'];
            if (result.status === 'fulfilled') {
                console.log(`✅ ${scraperNames[index]}: ${result.value} items scraped`);
            } else {
                console.error(`❌ ${scraperNames[index]}: ${result.reason}`);
            }
        });

        console.log('✅ All scrapers completed');
    } catch (error) {
        console.error('❌ Scraping error:', error);
    }
}

// Auto-scrape every 30 minutes
setInterval(() => {
    console.log('⏰ Auto-scraping triggered...');
    runScrapers();
}, 30 * 60 * 1000);

// Initial scrape on startup
runScrapers();

// Export for Vercel
export default app;

// Only listen if run directly (local development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
