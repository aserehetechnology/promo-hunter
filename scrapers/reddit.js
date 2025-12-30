import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

// Create axios instance with SSL handling
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 10000
});

export async function redditScraper(db) {
    console.log('🔍 Scraping Reddit...');

    const subreddits = [
        'freebies',
        'eFreebies',
        'FreeGameFindings',
        'FreeGamesOnSteam',
        'DealsReddit'
    ];

    let totalScraped = 0;

    for (const subreddit of subreddits) {
        try {
            // Use reddit.com JSON API
            const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`;

            const response = await axiosInstance.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            // Validate response structure
            if (!response.data || !response.data.data || !response.data.data.children) {
                console.log(`⚠️ r/${subreddit}: Invalid response structure, skipping...`);
                continue;
            }

            const posts = response.data.data.children;

            if (posts.length === 0) {
                console.log(`⚠️ r/${subreddit}: No posts found`);
                continue;
            }

            for (const post of posts) {
                const data = post.data;

                // Skip stickied posts
                if (data.stickied) continue;

                // Determine category based on title and subreddit
                let category = 'Other';
                const titleLower = data.title.toLowerCase();

                if (titleLower.includes('ai') || titleLower.includes('gpt') || titleLower.includes('chatbot')) {
                    category = 'AI Tools';
                } else if (titleLower.includes('game') || subreddit.includes('Game')) {
                    category = 'Games';
                } else if (titleLower.includes('software') || titleLower.includes('app')) {
                    category = 'Software';
                } else if (titleLower.includes('course') || titleLower.includes('learning') || titleLower.includes('udemy')) {
                    category = 'Education';
                }

                // Extract country if mentioned
                let country = 'Global';
                const countryPatterns = {
                    'US': /\b(us|usa|united states|america)\b/i,
                    'UK': /\b(uk|united kingdom|britain)\b/i,
                    'CA': /\b(canada|canadian)\b/i,
                    'AU': /\b(australia|australian)\b/i,
                    'IN': /\b(india|indian)\b/i,
                    'ID': /\b(indonesia|indonesian)\b/i,
                    'SG': /\b(singapore)\b/i,
                    'MY': /\b(malaysia|malaysian)\b/i,
                };

                for (const [countryCode, pattern] of Object.entries(countryPatterns)) {
                    if (pattern.test(data.title) || pattern.test(data.selftext)) {
                        country = countryCode;
                        break;
                    }
                }

                // Prepare promo data
                const promo = {
                    title: data.title,
                    description: data.selftext ? data.selftext.substring(0, 500) : '',
                    url: data.url.startsWith('/r/') ? `https://reddit.com${data.url}` : data.url,
                    category: category,
                    country: country,
                    source: 'Reddit',
                    image_url: data.thumbnail && data.thumbnail.startsWith('http') ? data.thumbnail : null,
                    expiry_date: null,
                    tags: `r/${subreddit}, ${data.link_flair_text || ''}`
                };

                // Insert into database
                try {
                    const stmt = db.prepare(`
            INSERT OR IGNORE INTO promos 
            (title, description, url, category, country, source, image_url, expiry_date, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

                    const result = stmt.run(
                        promo.title,
                        promo.description,
                        promo.url,
                        promo.category,
                        promo.country,
                        promo.source,
                        promo.image_url,
                        promo.expiry_date,
                        promo.tags
                    );

                    if (result.changes > 0) {
                        totalScraped++;
                    }
                } catch (err) {
                    console.error('Error inserting promo:', err.message);
                }
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`Error scraping r/${subreddit}:`, error.message);
        }
    }

    return totalScraped;
}
