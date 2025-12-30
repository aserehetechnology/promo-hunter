import axios from 'axios';
import * as cheerio from 'cheerio';

export async function productHuntScraper(db) {
    console.log('🔍 Scraping Product Hunt...');
    let totalScraped = 0;

    try {
        const response = await axios.get('https://www.producthunt.com/');
        const $ = cheerio.load(response.data);

        // Product Hunt structure changes often, using generic selectors
        $('div[data-test^="post-item"]').each(async (i, elem) => {
            const title = $(elem).find('h3, a[data-test*="title"]').text().trim();
            const desc = $(elem).find('div[data-test*="tagline"]').text().trim();
            const link = $(elem).find('a').attr('href');

            if (!title || !link) return;

            const fullUrl = `https://www.producthunt.com${link}`;

            try {
                await db.execute({
                    sql: `INSERT INTO promos (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        `[PH] ${title}`,
                        desc,
                        fullUrl,
                        'Software',
                        'Global',
                        'Product Hunt',
                        null,
                        null,
                        'producthunt, new-launch',
                        null,
                        'Check Product Hunt for launch deal details.'
                    ]
                });
                totalScraped++;
            } catch (err) {
                // Ignore duplicates
            }
        });

    } catch (error) {
        console.error('Error scraping Product Hunt:', error.message);
    }

    return totalScraped;
}
