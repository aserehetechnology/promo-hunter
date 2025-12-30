import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:promos.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`🔌 Database connecting to: ${url.startsWith('file:') ? 'Local SQLite' : 'Turso Cloud'}`);

export const db = createClient({
    url,
    authToken,
});

// Helper to initialize table
export async function initDB() {
    await db.execute(`
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
}
