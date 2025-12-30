export async function cheatsScraper(db) {
    console.log('🔍 Importing Cheat Sheet Hacks...');
    let totalScraped = 0;

    const cheats = [
        {
            title: 'YouTube Premium for ~$1.50/month (Cheapest)',
            description: 'Get YouTube Premium family plan for extremely cheap by subscribing from Ukraine, Turkey, or Argentina.',
            category: 'Software',
            tags: 'streaming, vpn, youtube',
            country: 'Ukraine',
            instructions: '1. Connect VPN to Ukraine (cheapest currently) or Turkey. 2. Open YouTube Premium page in Incognito. 3. Login with a new Google Account (recommended) or existing one. 4. Pay using a card that supports international transactions (Revolut, Wise, or some local digital banks). 5. Turn off VPN. Works globally without VPN afterwards.'
        },
        {
            title: 'Adobe Creative Cloud All Apps ~$5/month',
            description: 'Get the full Adobe CC suite for a fraction of the price by buying the Student/Teacher edition from Lebanon.',
            category: 'Design Tools',
            tags: 'adobe, design, lebanon',
            country: 'Lebanon',
            instructions: '1. Connect VPN to Lebanon. 2. Go to Adobe Lebanon Students page. 3. Buy the "Creative Cloud All Apps" plan (pricing is often in LBP or heavily discounted USD). 4. Use a random school name if asked, no verification usually required for this specific region/link.'
        },
        {
            title: 'Netflix 4K Plan for ~$3-4/month',
            description: 'Subscribe to Netflix Premium via Turkey or Pakistan for massive savings.',
            category: 'Software',
            tags: 'netflix, streaming',
            country: 'Turkey',
            instructions: '1. Buy Netflix Gift Cards for Turkey (TRY) from sites like G2A or Eneba. 2. Connect VPN to Turkey. 3. Create account and use Gift Card as payment method (Credit cards often blocked). 4. You may need to use VPN for the first 30 days to watch, after that it becomes region-free.'
        },
        {
            title: 'Spotify Premium for ~$1-2/month',
            description: 'Get Spotify Individual or Family plan cheaper via India, Turkey, or Philippines.',
            category: 'Software',
            tags: 'spotify, music',
            country: 'India',
            instructions: '1. Connect VPN to India. 2. Buy a Spotify Gift Card (INR) from Amazon India or Eneba. 3. Redeem on Spotify India account. 4. Use VPN to login every 14 days if using free tier, or just once for Premium.'
        },
        {
            title: 'Canva Pro (Lifetime) for Free via Education',
            description: 'Join a shared Canva for Education team link (often shared on Reddit/Telegram) to get Pro features for free.',
            category: 'Design Tools',
            tags: 'canva, design',
            country: 'Global',
            instructions: 'Search "Canva Pro Team Invite Link" on Reddit or Telegram channels. Click the link to join an existing team. Your designs remain private to you.'
        },
        {
            title: 'Microsoft Office 365 E5 Developer (Free)',
            description: 'Get a free Microsoft 365 E5 renewable subscription for development purposes.',
            category: 'Developer Tools',
            tags: 'microsoft, office, dev',
            country: 'Global',
            instructions: 'Join the Microsoft 365 Developer Program. You get a renewable 90-day subscription including Office apps, SharePoint, etc. It auto-renews if it detects development activity (or use a script to simulate activity).'
        },
        {
            title: 'JetBrains All Products Pack (Free for Students)',
            description: 'Free access to IntelliJ, PyCharm, WebStorm, etc. for students and teachers.',
            category: 'Developer Tools',
            tags: 'jetbrains, coding',
            country: 'Global',
            instructions: 'Apply with a valid .edu email address or ISIC card on the JetBrains website. Renewed annually.'
        },
        {
            title: 'GitHub Student Developer Pack (Massive Value)',
            description: 'Free access to Copilot, DigitalOcean credits ($200), Namecheap domains, and 100+ other tools.',
            category: 'Developer Tools',
            tags: 'github, student',
            country: 'Global',
            instructions: 'Apply for the GitHub Student Pack with proof of enrollment (Student ID/Transcripts). Takes a few days to approve.'
        },
        {
            title: 'Notion Plus (Free for Students)',
            description: 'Unlimited blocks and page history for students.',
            category: 'Software',
            tags: 'notion, productivity',
            country: 'Global',
            instructions: 'Sign up for Notion with a student email (.edu) to automatically qualify for the Plus plan education upgrade.'
        },
        {
            title: 'Figma Professional (Free for Students)',
            description: 'Free Figma Professional plan for students and educators.',
            category: 'Design Tools',
            tags: 'figma, design',
            country: 'Global',
            instructions: 'Verify your student status on Figma\'s education page to get the Pro plan for free.'
        },
        {
            title: 'Unlimited Google Drive Storage (Shared Drives)',
            description: 'Get access to a Shared Drive (Team Drive) with unlimited storage.',
            category: 'Software',
            tags: 'google, storage',
            country: 'Global',
            instructions: 'Search for "Google Team Drive generator" or join university shared drives. Note: Admin can see files, so encrypt sensitive data (Cryptomator).'
        },
        {
            title: 'Windows 10/11 Pro Activation (Free Script)',
            description: 'Activate Windows safely using the open-source MAS (Microsoft Activation Scripts).',
            category: 'Software',
            tags: 'windows, activation',
            country: 'Global',
            instructions: 'Open PowerShell as Admin. Type: "irm https://massgrave.dev/get | iex". Select HWID activation. Permanent and safe.'
        },
        {
            title: 'IDM (Internet Download Manager) Lifetime Activation',
            description: 'Activate IDM permanently using open-source scripts.',
            category: 'Software',
            tags: 'idm, download',
            country: 'Global',
            instructions: 'Search for "IDM Activation Script" on GitHub (look for user "massgrave" or similar trusted repos). Run the script to freeze the trial or activate.'
        },
        {
            title: 'Coursera Courses for Free (Audit)',
            description: 'Access almost all Coursera course content for free by Auditing.',
            category: 'Education',
            tags: 'coursera, learning',
            country: 'Global',
            instructions: 'On any course page, click "Enroll". Look for a small "Audit" link (usually at the bottom of the popup). You get content but no certificate.'
        }
    ];

    for (const item of cheats) {
        try {
            await db.execute({
                sql: `INSERT INTO promos (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    item.title,
                    item.description,
                    'https://google.com/search?q=' + encodeURIComponent(item.title),
                    item.category,
                    item.country,
                    'Cheat Sheet',
                    null,
                    null,
                    item.tags,
                    null,
                    item.instructions
                ]
            });
            totalScraped++;
        } catch (err) { }
    }

    return totalScraped;
}
