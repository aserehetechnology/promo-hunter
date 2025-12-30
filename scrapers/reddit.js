import axios from 'axios';

export async function redditScraper(db) {
    console.log('🔍 Scraping Reddit (r/software + r/giveaways)...');
    let totalScraped = 0;

    const subreddits = ['software', 'giveaways', 'freebies'];

    for (const sub of subreddits) {
        try {
            const response = await axios.get(`https://www.reddit.com/r/${sub}/new.json?limit=10`, {
                headers: { 'User-Agent': 'PromoHunter/1.0' }
            });

            const posts = response.data.data.children;

            for (const post of posts) {
                const p = post.data;
                const title = p.title;

                if (!title) continue;

                // Simple keyword filter
                if (!title.toLowerCase().includes('free') && !title.includes('100%') && !title.includes('giveaway')) {
                    continue;
                }

                const promo = {
                    title: `[Reddit] ${title.substring(0, 100)}`,
                    description: p.selftext ? p.selftext.substring(0, 200) + '...' : 'Check link for details.',
                    url: p.url || `https://reddit.com${p.permalink}`,
                    category: 'Other',
                    country: 'Global',
                    source: 'Reddit',
                    tags: 'reddit, community',
                    promo_code: null,
                    instructions: 'Visit the Reddit thread for instructions.'
                };

                try {
                    await db.execute({
                        sql: `INSERT INTO promos (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        args: [
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
                        ]
                    });
                    totalScraped++;
                } catch (err) {
                    // Ignore duplicates (LibSQL throws error on unique constraint violation)
                }
            }
        } catch (error) {
            console.error(`Error scraping r/${sub}:`, error.message);
        }
    }

    return totalScraped;
}
