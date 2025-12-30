import axios from 'axios';
import * as cheerio from 'cheerio';

export async function appSumoScraper(db) {
    console.log('🔍 Scraping AppSumo Freebies...');
    let totalScraped = 0;

    try {
        const url = 'https://appsumo.com/collections/freebies-software/';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        $('div[class*="product-card"]').each(async (i, elem) => {
            const title = $(elem).find('h3, div[class*="title"]').text().trim();
            const desc = $(elem).find('p, div[class*="description"]').text().trim();
            const relativeLink = $(elem).find('a').attr('href');

            if (!title || !relativeLink) return;

            const fullUrl = relativeLink.startsWith('http') ? relativeLink : `https://appsumo.com${relativeLink}`;

            try {
                await db.execute({
                    sql: `INSERT INTO promos (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        `AppSumo Freebie: ${title}`,
                        desc || 'Free lifetime deal from AppSumo.',
                        fullUrl,
                        'Software',
                        'Global',
                        'AppSumo',
                        null,
                        null,
                        'lifetime-deal, appsumo',
                        null,
                        '1. Create free account. 2. Click "Get Now".'
                    ]
                });
                totalScraped++;
            } catch (err) { }
        });

    } catch (error) {
        console.error('Error scraping AppSumo:', error.message);
    }

    return totalScraped;
}
