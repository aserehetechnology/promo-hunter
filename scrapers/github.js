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

export async function githubScraper(db) {
    console.log('🔍 Scraping GitHub...');

    let totalScraped = 0;

    const awesomeRepos = [
        'ripienaar/free-for-dev', // Free services for developers
        'serhii-londar/open-source-mac-os-apps', // Free Mac apps
        'trimstray/the-book-of-secret-knowledge', // Various free tools
        'sindresorhus/awesome', // Awesome lists
    ];

    for (const repo of awesomeRepos) {
        try {
            const url = `https://github.com/${repo}`;

            const response = await axiosInstance.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Get repo description
            const repoDescription = $('p[class*="f4"]').first().text().trim();

            // Get README content
            const readme = $('#readme').text();

            // Extract links from README
            $('#readme a[href]').each((i, elem) => {
                if (i >= 15) return false; // Limit per repo

                const $elem = $(elem);
                const href = $elem.attr('href');
                const text = $elem.text().trim();

                if (!text || text.length < 5) return;
                if (!href || href.startsWith('#')) return;

                // Make URL absolute
                let fullUrl = href;
                if (href.startsWith('/')) {
                    fullUrl = `https://github.com${href}`;
                }

                // Determine category
                let category = 'Developer Tools';
                const textLower = text.toLowerCase();

                if (textLower.includes('ai') || textLower.includes('ml') || textLower.includes('gpt')) {
                    category = 'AI Tools';
                } else if (textLower.includes('game')) {
                    category = 'Games';
                } else if (textLower.includes('education') || textLower.includes('course')) {
                    category = 'Education';
                } else if (textLower.includes('design')) {
                    category = 'Design Tools';
                }

                const promo = {
                    title: text,
                    description: `From ${repo.split('/')[1]} - ${repoDescription.substring(0, 200)}`,
                    url: fullUrl,
                    category: category,
                    country: 'Global',
                    source: 'GitHub',
                    image_url: null,
                    expiry_date: null,
                    tags: `github, free, open-source, ${repo.split('/')[1]}`
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

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`Error scraping ${repo}:`, error.message);
        }
    }

    // Also scrape GitHub Education Pack
    try {
        const url = 'https://education.github.com/pack';
        const response = await axiosInstance.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        $('a[href*="offer"]').each((i, elem) => {
            if (i >= 10) return false;

            const $elem = $(elem);
            const title = $elem.text().trim();
            const href = $elem.attr('href');

            if (!title || title.length < 5) return;

            const promo = {
                title: `GitHub Education: ${title}`,
                description: 'Free for students via GitHub Education Pack',
                url: href.startsWith('http') ? href : `https://education.github.com${href}`,
                category: 'Education',
                country: 'Global',
                source: 'GitHub',
                image_url: null,
                expiry_date: null,
                tags: 'github, education, student'
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
        console.error('Error scraping GitHub Education:', error.message);
    }

    return totalScraped;
}
