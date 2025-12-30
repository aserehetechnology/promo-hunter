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

export async function productHuntScraper(db) {
    console.log('🔍 Scraping Product Hunt...');

    let totalScraped = 0;

    try {
        // Scrape Product Hunt homepage
        const url = 'https://www.producthunt.com/';

        const response = await axiosInstance.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Product Hunt has dynamic content, but we can scrape some basic info
        // Note: For better results, we'd need to use Puppeteer for dynamic content

        // Look for links to products
        $('a[href^="/posts/"]').each((i, elem) => {
            if (i >= 20) return false; // Limit to 20 items

            const $elem = $(elem);
            const href = $elem.attr('href');
            const title = $elem.text().trim();

            if (!title || title.length < 5) return;

            // Determine category
            let category = 'Software';
            const titleLower = title.toLowerCase();

            if (titleLower.includes('ai') || titleLower.includes('gpt') || titleLower.includes('ml')) {
                category = 'AI Tools';
            } else if (titleLower.includes('design') || titleLower.includes('ui')) {
                category = 'Design Tools';
            } else if (titleLower.includes('dev') || titleLower.includes('code')) {
                category = 'Developer Tools';
            }

            const promo = {
                title: title,
                description: `Featured on Product Hunt`,
                url: `https://www.producthunt.com${href}`,
                category: category,
                country: 'Global',
                source: 'Product Hunt',
                image_url: null,
                expiry_date: null,
                tags: 'trending, new'
            };

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
                // Ignore duplicates
            }
        });

    } catch (error) {
        console.error('Error scraping Product Hunt:', error.message);
    }

    return totalScraped;
}
