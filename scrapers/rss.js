import Parser from 'rss-parser';

export async function rssScraper(db) {
    console.log('🔍 Scraping Real-time RSS Feeds...');
    const parser = new Parser();
    let totalScraped = 0;

    const feeds = [
        {
            url: 'https://www.sharewareonsale.com/feed',
            source: 'SharewareOnSale',
            category: 'Software'
        },
        {
            url: 'https://game.giveawayoftheday.com/feed/',
            source: 'Giveaway of the Day',
            category: 'Games'
        },
        {
            url: 'https://www.giveawayoftheday.com/feed/',
            source: 'Giveaway of the Day',
            category: 'Software'
        },
        {
            url: 'https://www.indiegamebundles.com/feed/',
            source: 'Indie Game Bundles',
            category: 'Games'
        },
        {
            url: 'https://feeds.feedburner.com/GiveawayRadar',
            source: 'Giveaway Radar',
            category: 'Software'
        },
        {
            url: 'https://www.dealnews.com/rss/c/Software/225.xml',
            source: 'DealNews',
            category: 'Software'
        }
    ];

    for (const feed of feeds) {
        try {
            const result = await parser.parseURL(feed.url);

            for (const item of result.items) {
                // Filter: only get free or 100% off items
                const titleLower = item.title.toLowerCase();
                const contentLower = (item.content || '').toLowerCase();

                const isFree = titleLower.includes('free') ||
                    titleLower.includes('100%') ||
                    titleLower.includes('giveaway') ||
                    titleLower.includes('$0');

                if (!isFree) continue;

                const promo = {
                    title: item.title,
                    description: (item.contentSnippet || item.content || '').substring(0, 500) + '...',
                    url: item.link,
                    category: feed.category,
                    country: 'Global',
                    source: feed.source,
                    tags: 'giveaway, limited-time, rss',
                    promo_code: null,
                    instructions: 'Limited time offer! Click "View Deal" and follow instructions on the landing page immediately before it expires.'
                };

                try {
                    const stmt = db.prepare(`
            INSERT OR IGNORE INTO promos 
            (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

                    const insertResult = stmt.run(
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

                    if (insertResult.changes > 0) totalScraped++;
                } catch (err) {
                    // Ignore duplicates
                }
            }
        } catch (error) {
            console.error(`Error scraping RSS ${feed.source}:`, error.message);
        }
    }

    return totalScraped;
}
