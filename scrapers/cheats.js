export async function cheatsScraper(db) {
    console.log('🔍 Loading Cheat Database...');

    let totalScraped = 0;

    const cheats = [
        // --- VPN REGIONAL PRICING HACKS ---
        {
            title: 'YouTube Premium for ~$1.50/month (Cheapest)',
            description: 'Get YouTube Premium family plan for extremely cheap by subscribing from Ukraine, Turkey, or Argentina.',
            url: 'https://youtube.com/premium',
            category: 'Software',
            country: 'Ukraine',
            source: 'Cheat Sheet',
            tags: 'vpn, streaming, cheap, youtube',
            promo_code: null,
            instructions: '1. Connect VPN to Ukraine (cheapest currently) or Turkey.\n2. Open YouTube Premium page in Incognito.\n3. Login with a new Google Account (recommended) or existing one.\n4. Pay using a card that supports international transactions (Revolut, Wise, or some local digital banks).\n5. Once subscribed, you can use it without VPN anywhere.'
        },
        {
            title: 'Adobe Creative Cloud All Apps ~$5/month',
            description: 'Get the full Adobe CC suite for a fraction of the price by buying the Student/Teacher edition from Lebanon.',
            url: 'https://www.adobe.com/lb_en/creativecloud/buy/students.html',
            category: 'Design Tools',
            country: 'Lebanon',
            source: 'Cheat Sheet',
            tags: 'design, adobe, cheap, vpn',
            promo_code: null,
            instructions: '1. Connect VPN to Lebanon.\n2. Go to Adobe Lebanon Students page.\n3. Buy the "Creative Cloud All Apps" plan (pricing is often in LBP or heavily discounted USD).\n4. Use a random school name if asked, no verification usually required for this specific region/link.'
        },
        {
            title: 'Netflix 4K Plan for ~$3-4/month',
            description: 'Subscribe to Netflix Premium via Turkey or Pakistan for massive savings.',
            url: 'https://www.netflix.com',
            category: 'Software',
            country: 'Turkey',
            source: 'Cheat Sheet',
            tags: 'netflix, streaming, vpn',
            promo_code: null,
            instructions: '1. Buy Netflix Gift Cards for Turkey (TRY) from sites like G2A or Eneba.\n2. Connect VPN to Turkey.\n3. Create account and use Gift Card as payment method (Credit cards often blocked).\n4. You may need to use VPN for the first 30 days to watch, after that it becomes region-free.'
        },
        {
            title: 'Spotify Premium Individual ~$1.50/month',
            description: 'Get Spotify Premium cheap via India, Philippines, or Turkey.',
            url: 'https://spotify.com/premium',
            category: 'Software',
            country: 'India',
            source: 'Cheat Sheet',
            tags: 'music, spotify, vpn',
            promo_code: null,
            instructions: '1. Connect VPN to India/Turkey.\n2. Buy Spotify Gift Card for that region (e.g., Amazon India or resellers).\n3. Change account region in profile settings.\n4. Redeem code. Note: Family plans are harder to share across regions now.'
        },

        // --- STARTUP & CLOUD CREDITS (High Value) ---
        {
            title: 'AWS Activate Founders - $1,000 Free Credits',
            description: 'Get $1,000 in AWS credits, valid for 2 years. Free developer support plan included.',
            url: 'https://aws.amazon.com/activate/founders/',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'aws, cloud, credits, startup',
            promo_code: null,
            instructions: '1. Need a LinkedIn profile and a company website (can be a simple landing page).\n2. Apply as "Bootstrapped".\n3. Describe your "startup" idea convincingly using AI to write the pitch.\n4. Approval usually takes 7-14 days.'
        },
        {
            title: 'Google Cloud for Startups - $2,000+ Credits',
            description: 'Google gives massive credits to early stage setups. Web3 startups get even more.',
            url: 'https://cloud.google.com/startup',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'gcp, cloud, credits, startup',
            promo_code: null,
            instructions: 'Apply via verified partners (e.g., Y Combinator run Startup School, or local incubators). Joining "Startup School" (free) often grants eligibility for initial tier.'
        },
        {
            title: 'DigitalOcean Hatch - $1,000 Credits',
            description: '12 months of infrastructure credit for your new projects.',
            url: 'https://www.digitalocean.com/hatch',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'hosting, cloud, credits',
            promo_code: null,
            instructions: 'Often available via GitHub Student Pack (smaller amount) or by applying as a startup via partners like Stripe Atlas or YC Startup School.'
        },
        {
            title: 'Azure for Students (No Credit Card) - $100',
            description: 'Get $100 credit without needing a credit card verification. Hard to find these days.',
            url: 'https://azure.microsoft.com/en-us/free/students/',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'azure, cloud, student, no-cc',
            promo_code: null,
            instructions: 'Strictly requires .edu email. Cheat: If you don\'t have one, search eBay or specialized forums for "Azure edu account" (Grey hat methods).'
        },

        // --- SOFTWARE & TRIALS ---
        {
            title: 'WinRAR "Free" Forever',
            description: 'The legendary infinite 40-day trial.',
            url: 'https://www.rarlab.com/download.htm',
            category: 'Software',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'utility, comedy, classic',
            promo_code: null,
            instructions: 'Just ignore the payment popup. It never actually locks you out. Alternatively, use 7-Zip (Open Source & Better).'
        },
        {
            title: 'Unlimited Free temporary Email for Trials',
            description: 'Generate infinite emails to abuse free trials for services.',
            url: 'https://temp-mail.org/',
            category: 'Other',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'hack, trial, email',
            promo_code: null,
            instructions: 'Pro tip: Use Gmail "dot trick" (my.name@gmail -> m.y.name@gmail) for sites that block temp mail domains. All aliases go to your main inbox.'
        },
        {
            title: 'Oracle Cloud "Always Free" (Highest Value)',
            description: 'Get 4 ARM Ampere CPUs and 24GB RAM VPS forever for free. Best free tier in existence.',
            url: 'https://www.oracle.com/cloud/free/',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'vps, server, cloud, oracle',
            promo_code: null,
            instructions: '1. Sign up requires credit card for verification (charged ~$1 then refunded).\n2. Choose "Home Region" carefully (cannot change later).\n3. Singapore/Tokyo regions are often out of stock. Choose US West or Germany for better availability.'
        },
        {
            title: 'Kaspersky / Bitdefender 90-180 Days Extended Trials',
            description: 'Get almost half a year of top-tier antivirus for free using promo links.',
            url: 'https://www.comss.ru/list.php?c=promo',
            category: 'Software',
            country: 'Russia',
            source: 'Cheat Sheet',
            tags: 'security, antivirus, trial',
            promo_code: null,
            instructions: 'Use Google Translate on the site "comss.ru". They aggregate legitimate extended trial keys often not published elsewhere. Many keys are global.'
        },

        // --- AI TOOLS HACKS ---
        {
            title: 'Midjourney Free Alternative (BlueWillow/Leonardo)',
            description: 'Since MJ stopped free trials, use these powerful free alternatives.',
            url: 'https://app.leonardo.ai/',
            category: 'AI Tools',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'ai, art, generation',
            promo_code: null,
            instructions: 'Leonardo.ai gives 150 free credits DAILY. Sufficient for ~40-70 images/day. High quality stable diffusion models.'
        },
        {
            title: 'GPT-4 for Free via Bing/Copilot',
            description: 'Access the power of GPT-4 without paying $20/month.',
            url: 'https://copilot.microsoft.com/',
            category: 'AI Tools',
            country: 'Global',
            source: 'Cheat Sheet',
            tags: 'ai, gpt-4, microsoft',
            promo_code: null,
            instructions: 'Use "Creative" or "Precise" mode in Microsoft Copilot to trigger GPT-4. Logged in users get more turns.'
        }
    ];

    for (const cheat of cheats) {
        try {
            const stmt = db.prepare(`
        INSERT OR IGNORE INTO promos 
        (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

            const result = stmt.run(
                cheat.title,
                cheat.description,
                cheat.url,
                cheat.category,
                cheat.country,
                cheat.source,
                null,
                null,
                cheat.tags,
                cheat.promo_code,
                cheat.instructions
            );

            if (result.changes > 0) totalScraped++;
        } catch (err) {
            // Ignore
        }
    }

    return totalScraped;
}
