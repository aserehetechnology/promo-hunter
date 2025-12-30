import Parser from 'rss-parser';

export async function rssScraper(db) {
    console.log('🔍 Scraping RSS Feeds...');
    let totalScraped = 0;
    const parser = new Parser();

    const feeds = [
        { url: 'https://sharewareonsale.com/feed', source: 'SharewareOnSale', cat: 'Software' },
        { url: 'https://game.giveawayoftheday.com/feed/', source: 'Giveaway of the Day', cat: 'Games' },
        { url: 'https://indiegamebundles.com/feed/', source: 'Indie Game Bundles', cat: 'Games' }
    ];

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);
            // Limit to last 5 items
            const items = feedData.items.slice(0, 5);

            for (const item of items) {
                try {
                    await db.execute({
                        sql: `INSERT INTO promos (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        args: [
                            item.title,
                            item.contentSnippet || item.content || '',
                            item.link,
                            feed.cat,
                            'Global',
                            feed.source,
                            null,
                            null,
                            'rss, freebie',
                            null,
                            `Visit ${feed.source} to claim.`
                        ]
                    });
                    totalScraped++;
                } catch (err) { }
            }
        } catch (error) {
            console.error(`Error scraping RSS ${feed.source}:`, error.message);
        }
    }

    return totalScraped;
}
