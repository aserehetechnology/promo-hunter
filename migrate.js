import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

// Config
const LOCAL_DB_PATH = 'promos.db';
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL) {
    console.error('❌ Error: TURSO_DATABASE_URL not found in .env');
    process.exit(1);
}

// Connections
const local = new Database(LOCAL_DB_PATH);
const remote = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function migrate() {
    console.log('📦 Reading local data...');
    const rows = local.prepare('SELECT * FROM promos').all();
    console.log(`📊 Found ${rows.length} items to migrate.`);

    console.log('🚀 Sending to Turso...');

    let success = 0;
    let failed = 0;

    // Create table first just in case
    await remote.execute(`
    CREATE TABLE IF NOT EXISTS promos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      category TEXT,
      country TEXT,
      source TEXT,
      image_url TEXT,
      expiry_date TEXT,
      tags TEXT,
      promo_code TEXT,
      instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(url)
    )
    `);

    for (const row of rows) {
        try {
            await remote.execute({
                sql: `INSERT INTO promos (title, description, url, category, country, source, image_url, expiry_date, tags, promo_code, instructions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    row.title,
                    row.description,
                    row.url,
                    row.category,
                    row.country,
                    row.source,
                    row.image_url,
                    row.expiry_date,
                    row.tags,
                    row.promo_code,
                    row.instructions,
                    row.created_at
                ]
            });
            success++;
            process.stdout.write('.');
        } catch (e) {
            failed++; // Likely duplicate
        }
    }

    console.log(`\n\n✅ Migration Complete!`);
    console.log(`Success: ${success}`);
    console.log(`Skipped/Failed: ${failed}`);
}

migrate();
