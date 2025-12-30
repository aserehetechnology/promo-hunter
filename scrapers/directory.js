export async function directoryScraper(db) {
    console.log('🔍 Importing User Directory Sources...');

    let totalScraped = 0;

    // Data provided by user
    const userSources = {
        "directories": [
            {
                "name": "Product Hunt",
                "url": "https://www.producthunt.com",
                "category": "product-launches",
                "desc": "The best place to find new products every day."
            },
            {
                "name": "FreeForDev",
                "url": "https://freestuff.dev",
                "category": "developer-free-tier",
                "desc": "A huge list of software (SaaS, PaaS, IaaS) and other offerings that have free tiers for developers."
            },
            {
                "name": "SaaSHub",
                "url": "https://www.saashub.com",
                "category": "software-discovery",
                "desc": "The independent software marketplace. Find alternatives and reviews."
            },
            {
                "name": "AlternativeTo",
                "url": "https://alternativeto.net",
                "category": "software-alternatives",
                "desc": "Crowdsourced software recommendations. Find free alternatives to paid software."
            },
            {
                "name": "Futurepedia",
                "url": "https://www.futurepedia.io",
                "category": "ai-tools-directory",
                "desc": "The largest AI tools directory, updated daily."
            }
        ],
        "deal_marketplaces": [
            {
                "name": "AppSumo",
                "url": "https://appsumo.com",
                "category": "lifetime-deals",
                "desc": "The #1 marketplace for entrepreneurs. Famous for Lifetime Deals."
            },
            {
                "name": "PitchGround",
                "url": "https://pitchground.com",
                "category": "lifetime-deals",
                "desc": "SaaS marketplace for lifetime deals and growth hacks."
            },
            {
                "name": "Dealify",
                "url": "https://dealify.com",
                "category": "saas-deals",
                "desc": "Growth hacking tools and software for marketers."
            },
            {
                "name": "DealMirror",
                "url": "https://dealmirror.com",
                "category": "lifetime-deals",
                "desc": "B2B Software Lifetime Deals."
            },
            {
                "name": "StackSocial",
                "url": "https://stacksocial.com",
                "category": "software-bundles",
                "desc": "Tech deals, apps, and gadgets. Check their 'Free' section."
            },
            {
                "name": "NachoNacho",
                "url": "https://www.nachonacho.com",
                "category": "software-discounts",
                "desc": "B2B SaaS marketplace with massive discounts (up to 30%)."
            },
            {
                "name": "SaaS Mantra",
                "url": "https://saasmantra.co",
                "category": "community-deals",
                "desc": "Community-driven SaaS deals platform."
            },
            {
                "name": "Secret",
                "url": "https://www.joinsecret.com",
                "category": "startup-discounts",
                "desc": "Get up to $1,000,000 in savings on SaaS for your startup (AWS, Notion, etc)."
            }
        ],
        "cloud_free_tier": [
            {
                "name": "AWS Free Tier",
                "url": "https://aws.amazon.com/free",
                "category": "cloud-credits",
                "desc": "12 months free and always free services from Amazon Web Services."
            },
            {
                "name": "Google Cloud Free Tier",
                "url": "https://cloud.google.com/free",
                "category": "cloud-credits",
                "desc": "$300 in free credits for new customers + 20+ always free products."
            },
            {
                "name": "Microsoft Azure Free",
                "url": "https://azure.microsoft.com/free",
                "category": "cloud-credits",
                "desc": "Popular services free for 12 months + $200 credit."
            }
        ],
        "communities": [
            {
                "name": "Indie Hackers",
                "url": "https://www.indiehackers.com",
                "category": "startup-community",
                "desc": "Community of developers sharing revenue numbers and strategies."
            },
            {
                "name": "Hugging Face",
                "url": "https://huggingface.co",
                "category": "ai-models-free",
                "desc": "The AI community building the future. Thousands of free models."
            },
            {
                "name": "GitHub",
                "url": "https://github.com",
                "category": "open-source",
                "desc": "The world's leading software development platform."
            }
        ],
        "newsletters": [
            {
                "name": "Ben's Bites",
                "url": "https://bensbites.com",
                "category": "ai-news-deals",
                "desc": "Daily AI news and product launches. Good for finding early bird deals."
            },
            {
                "name": "TLDR",
                "url": "https://tldr.tech",
                "category": "tech-news-deals",
                "desc": "Byte sized tech news. Often contains developer tool promos."
            }
        ]
    };

    // Flatten and process
    const allSources = [
        ...userSources.directories.map(i => ({ ...i, type: 'Directory' })),
        ...userSources.deal_marketplaces.map(i => ({ ...i, type: 'Marketplace' })),
        ...userSources.cloud_free_tier.map(i => ({ ...i, type: 'Cloud' })),
        ...userSources.communities.map(i => ({ ...i, type: 'Community' })),
        ...userSources.newsletters.map(i => ({ ...i, type: 'Newsletter' }))
    ];

    for (const item of allSources) {
        let category = 'Other';
        if (item.category.includes('ai')) category = 'AI Tools';
        else if (item.category.includes('dev') || item.category.includes('cloud') || item.category.includes('open-source')) category = 'Developer Tools';
        else if (item.category.includes('software') || item.category.includes('saas')) category = 'Software';

        // Custom instructions based on type
        let instructions = `Visit the ${item.type} and search for your specific needs.`;
        if (item.name === 'Secret') instructions = 'Requires a startup website/proof. High value savings.';
        if (item.name === 'AppSumo') instructions = 'Filter by "Freebies" or look for "Lifetime Deals" under $50 for best value.';
        if (item.name === 'AWS Free Tier') instructions = 'Watch out for usage limits! Set up a "Budget Alert" immediately to avoid surprise bills.';

        const promo = {
            title: `${item.name} (${item.type})`,
            description: item.desc || `Access thousands of deals and tools on ${item.name}.`,
            url: item.url,
            category: category,
            country: 'Global',
            source: 'Directory',
            tags: `${item.category}, ${item.type.toLowerCase()}`,
            promo_code: null,
            instructions: instructions
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
            // Ignore
        }
    }

    return totalScraped;
}
