import axios from 'axios';
import * as cheerio from 'cheerio';

export async function appSumoScraper(db) {
    console.log('🔍 Scraping AppSumo Freebies...');
    let totalScraped = 0;

    try {
        // URL for AppSumo Freebies collection
        const url = 'https://appsumo.com/collections/freebies-software/';

        // Header mimicking a real browser
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });

        const $ = cheerio.load(response.data);

        // AppSumo changes classes often, so we try to target generic structures usually found in their cards
        // This selector targets the product card links
        $('div[class*="product-card"]').each((i, elem) => {
            const title = $(elem).find('h3, div[class*="title"]').text().trim();
            const description = $(elem).find('p, div[class*="description"]').text().trim();
            const relativeLink = $(elem).find('a').attr('href');

            if (!title || !relativeLink) return;

            const fullUrl = relativeLink.startsWith('http') ? relativeLink : `https://appsumo.com${relativeLink}`;

            const promo = {
                title: `AppSumo Freebie: ${title}`,
                description: description || 'Free lifetime deal from AppSumo. Grab it before it expires.',
                url: fullUrl,
                category: 'Software',
                country: 'Global',
                source: 'AppSumo',
                tags: 'lifetime-deal, freebie, appsumo, software',
                promo_code: null,
                instructions: '1. Create a free AppSumo account.\n2. Click "Get Now" or "Buy Now" ($0).\n3. Redeem the code on the partner website instructions.'
            };

            try {
                const stmt = db.prepare(`
          INSERT OR IGNORE INTO promos 
          (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

                const result = stmt.run(
                    promo.title,
                    promo.description,
                    promo.url,
                    promo.category,
                    promo.country,
                    promo.source,
                    null,
                    null,
                    promo.tags,
                    promo.promo_code,
                    promo.instructions
                );

                if (result.changes > 0) totalScraped++;
            } catch (err) {
                // Ignore duplicates
            }
        });

    } catch (error) {
        console.error('Error scraping AppSumo:', error.message);
    }

    return totalScraped;
}
