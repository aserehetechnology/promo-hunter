import axios from 'axios';

export async function githubScraper(db) {
    console.log('🔍 Scraping GitHub Trending...');
    let totalScraped = 0;

    try {
        // GitHub API for trending repositories (search sorted by stars created recently)
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const dateStr = date.toISOString().split('T')[0];

        const response = await axios.get(`https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc`, {
            headers: { 'User-Agent': 'PromoHunter/1.0' }
        });

        const repos = response.data.items.slice(0, 10);

        for (const repo of repos) {
            try {
                await db.execute({
                    sql: `INSERT INTO promos (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        `[GitHub] ${repo.full_name}`,
                        repo.description || 'No description',
                        repo.html_url,
                        'Developer Tools',
                        'Global',
                        'GitHub',
                        null,
                        null,
                        `opensource, ${repo.language || 'code'}`,
                        null,
                        'Clone or Star the repository.'
                    ]
                });
                totalScraped++;
            } catch (err) { }
        }

    } catch (error) {
        console.error('Error scraping GitHub:', error.message);
    }

    return totalScraped;
}
