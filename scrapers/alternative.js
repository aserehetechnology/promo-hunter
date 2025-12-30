import axios from 'axios';

export async function alternativeScraper(db) {
    console.log('🔍 Scraping Alternative Sources...');

    let totalScraped = 0;

    // Curated list with "Cheats" and Instructions
    const curatedPromos = [
        {
            title: 'GitHub Copilot Free for Students',
            description: 'Get GitHub Copilot, the AI pair programmer, completely free. Usually costs $10/month.',
            url: 'https://education.github.com/pack',
            category: 'AI Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'ai, coding, student, github',
            promo_code: null,
            instructions: 'Requires a valid student email (.edu) or proof of enrollment. Sign up for GitHub Student Developer Pack first.'
        },
        {
            title: 'Azure for Students - $100 Credit + Free Services',
            description: 'Build in the cloud with free Azure credit and 25+ permanently free services.',
            url: 'https://azure.microsoft.com/en-us/free/students/',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'cloud, azure, student, credit',
            promo_code: null,
            instructions: 'No credit card required. Just verify with your student email address.'
        },
        {
            title: 'Notion Pro Free for Students',
            description: 'Get the Personal Pro plan for free indefinitely. Unlimited file uploads and version history.',
            url: 'https://www.notion.so/product/notion-for-education',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'productivity, student, notion',
            promo_code: null,
            instructions: 'Sign up with your school email address (.edu, .ac.id, etc.) and the upgrade will be automatic.'
        },
        {
            title: 'JetBrains All Products Pack - Free License',
            description: 'Free access to IntelliJ IDEA, PyCharm, WebStorm, and all other JetBrains IDEs.',
            url: 'https://www.jetbrains.com/community/education/#students',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'ide, coding, student, jetbrains',
            promo_code: null,
            instructions: 'Apply with your university email or ISIC card. Needs yearly renewal (also free).'
        },
        {
            title: 'Adobe Creative Cloud - 60% Off',
            description: 'Significant discount for students on the entire collection of Adobe creative apps.',
            url: 'https://www.adobe.com/creativecloud/buy/students.html',
            category: 'Design Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'design, adobe, student, discount',
            promo_code: null,
            instructions: 'Verify enrollment. Tip: In some countries the discount is larger, use VPN to check prices in Turkey or Argentina if legal in your jurisdiction.'
        },
        {
            title: 'Canva Pro - Free for Education',
            description: 'Canva Pro features for free for K-12 teachers and their students.',
            url: 'https://www.canva.com/education/',
            category: 'Design Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'design, education, teacher',
            promo_code: null,
            instructions: 'Requires proof of teaching certification or school employment.'
        },
        {
            title: 'Autodesk (AutoCAD, Maya) - Free Education License',
            description: 'Free 1-year educational access to Autodesk products and services, renewable as long as you remain eligible.',
            url: 'https://www.autodesk.com/education/edu-software/overview',
            category: 'Design Tools',
            country: 'Global',
            source: 'Curated',
            tags: '3d, cad, engineering, student',
            promo_code: null,
            instructions: 'Create an account and verify student/educator status with valid documentation.'
        },
        {
            title: 'Spotify Premium - 1 Month Free',
            description: 'Try Spotify Premium free for 1 month. Ad-free music listening.',
            url: 'https://www.spotify.com/premium/',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'music, streaming, trial',
            promo_code: null,
            instructions: 'New accounts only. Tip: Some regions like India, Indonesia, or Philippines might offer 3 months free trial occasionally. Use VPN to check pages.'
        },
        {
            title: 'YouTube Premium - 1 Month Free',
            description: 'Ad-free YouTube and YouTube Music. Background play and downloads.',
            url: 'https://www.youtube.com/premium',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'video, streaming, trial',
            promo_code: null,
            instructions: 'New accounts only. Tip: Use VPN to Turkey or Argentina for significantly cheaper subscription rates (Digital Nomad Cheat).'
        },
        {
            title: 'Apple Music - Up to 6 Months Free',
            description: 'Free Apple Music subscription for new subscribers, often bundled with AirPods or Beats.',
            url: 'https://offers.applemusic.apple/',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'music, apple, trial',
            promo_code: null,
            instructions: 'Check BestBuy (US) for free 3-month codes usually given without purchase.'
        },
        {
            title: 'Amazon Prime Student - 6 Months Free',
            description: 'Free 6-month trial of Amazon Prime for students. Includes Prime Video.',
            url: 'https://www.amazon.com/prime-student',
            category: 'Software',
            country: 'US',
            source: 'Curated',
            tags: 'amazon, prime, student, trial',
            promo_code: null,
            instructions: 'Requires US .edu email. Tip: Use a "dot edu" email generator if you just want to test (use at own risk).'
        },
        {
            title: 'Unity Pro - Free for Students',
            description: 'Get Unity Pro plan for free to learn game development with professional tools.',
            url: 'https://unity.com/products/unity-student',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'gamedev, unity, student',
            promo_code: null,
            instructions: 'Verify student status via GitHub Student Developer Pack.'
        },
        {
            title: 'Tableau for Students - Free license',
            description: 'Free one-year license of Tableau Desktop for students.',
            url: 'https://www.tableau.com/academic/students',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'data, analytics, student',
            promo_code: null,
            instructions: 'Fill out the form on their website with student details.'
        },
        {
            title: 'Namecheap - Free Domain for Students',
            description: 'Free .me domain name for one year and discounted hosting.',
            url: 'https://nc.me/',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'domain, hosting, student',
            promo_code: null,
            instructions: 'Verify with a valid university email address.'
        },
        {
            title: 'LastPass Premium - Free for 6 Months',
            description: 'Password manager premium features for free.',
            url: 'https://lastpass.com/partner/humblebundle',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'security, password, trial',
            promo_code: 'HUMBLE',
            instructions: 'Sometimes available via Humble Bundle deals. Check for active codes like "HUMBLE" or similar partner codes.'
        },
        {
            title: '1Password - Free for 6 months (Developer Deal)',
            description: 'Secure password manager for free for developers.',
            url: 'https://1password.com/promo/canary',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'security, password, promo',
            promo_code: 'CANARY',
            instructions: 'Use the link provided. Often intended for developers or canary testing.'
        },
        {
            title: 'Bitdefender Total Security - 90 Days Free',
            description: 'Top-rated antivirus and security suite free extended trial.',
            url: 'https://www.bitdefender.com/media/html/consumer/new/get-your-90-day-trial-opt/index.html',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'security, antivirus, trial',
            promo_code: null,
            instructions: 'Use the specific landing page for extended trial usually meant for partners. Requires VPN to Germany (DE) sometimes if link redirects.'
        },
        {
            title: 'Udemy - 100% Off Coupons',
            description: 'Various paid courses available for free with specific coupons.',
            url: 'https://www.udemy.com',
            category: 'Education',
            country: 'Global',
            source: 'Curated',
            tags: 'course, learning, coupon',
            promo_code: 'VARIES',
            instructions: 'Cheat: Search "Udemy 100% off coupon [current month]" on Google or check r/UdemyFreeebies. Coupons expire very fast (1000 redemptions limit).'
        },
        {
            title: 'Microsoft 365 Developer Program',
            description: 'Get a free Microsoft 365 E5 instant sandbox for development purposes (renewed automatically if used).',
            url: 'https://developer.microsoft.com/en-us/microsoft-365/dev-program',
            category: 'Developer Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'office, microsoft, developer',
            promo_code: null,
            instructions: 'Sign up for the dev program. You get Word, Excel, PowerPoint, etc. for "development use". Cheat: Just use it to manage a personal project.'
        },
        {
            title: 'Setapp - 1 Month Free (Mac/iOS)',
            description: 'Curated subscription for Mac and iOS apps. Access 240+ apps.',
            url: 'https://setapp.com',
            category: 'Software',
            country: 'Global',
            source: 'Curated',
            tags: 'mac, ios, apps, trial',
            promo_code: 'podcast',
            instructions: 'Use promo code "podcast" or "snazzy" during sign up for extended trial.'
        },
        {
            title: 'ElevenLabs - Free Text to Speech',
            description: 'High quality AI voice generation.',
            url: 'https://elevenlabs.io',
            category: 'AI Tools',
            country: 'Global',
            source: 'Curated',
            tags: 'ai, voice, tts',
            promo_code: null,
            instructions: 'Free tier includes 10,000 characters per month. Cheat: Use temporary emails to create new accounts for more characters (not recommended for long term projects).'
        }
    ];

    for (const promo of curatedPromos) {
        try {
            // Note: Updated query to include promo_code and instructions
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

            if (result.changes > 0) {
                totalScraped++;
            }
        } catch (err) {
            console.error(`Error inserting ${promo.title}:`, err.message);
        }
    }

    return totalScraped;
}
