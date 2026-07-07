import { Pool } from '@neondatabase/serverless';

let pool: Pool | null = null;
let dbInitialized = false;

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS digests (
    id SERIAL PRIMARY KEY,
    issue_number SERIAL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    last_edited_at TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    
    arb_title TEXT NOT NULL DEFAULT 'Pending Title',
    arb_summary TEXT NOT NULL DEFAULT 'Pending Summary',
    arb_source_name TEXT NOT NULL DEFAULT 'Pending Source',
    arb_source_url TEXT NOT NULL,
    arb_source_date DATE NOT NULL,
    verified_arb BOOLEAN DEFAULT FALSE,
    
    treaty_title TEXT NOT NULL DEFAULT 'Pending Title',
    treaty_summary TEXT NOT NULL DEFAULT 'Pending Summary',
    treaty_source_name TEXT NOT NULL DEFAULT 'Pending Source',
    treaty_source_url TEXT NOT NULL,
    treaty_source_date DATE NOT NULL,
    verified_treaty BOOLEAN DEFAULT FALSE,
    
    inst_title TEXT NOT NULL DEFAULT 'Pending Title',
    inst_summary TEXT NOT NULL DEFAULT 'Pending Summary',
    inst_source_name TEXT NOT NULL DEFAULT 'Pending Source',
    inst_source_url TEXT NOT NULL,
    inst_source_date DATE NOT NULL,
    verified_inst BOOLEAN DEFAULT FALSE,
    
    editors_note TEXT,
    editors_insight TEXT,
    custom_title TEXT
);

CREATE TABLE IF NOT EXISTS case_notes (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    last_edited_at TIMESTAMP,
    source_url TEXT NOT NULL,
    fetch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL DEFAULT 'Pending Title',
    
    citation_tribunal TEXT NOT NULL DEFAULT '',
    facts TEXT NOT NULL DEFAULT '',
    legal_issues TEXT NOT NULL DEFAULT '',
    reasoning TEXT NOT NULL DEFAULT '',
    critical_analysis TEXT NOT NULL DEFAULT '',
    significance TEXT NOT NULL DEFAULT '',
    
    editors_commentary TEXT,
    tags TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    pool = new Pool({
      connectionString,
    });
  }
  return pool;
}

export async function ensureSchema() {
  if (dbInitialized) return;
  const p = getPool();
  try {
    await p.query(INIT_SQL);
    // Dynamic database migration to add custom_title column to existing databases
    await p.query('ALTER TABLE digests ADD COLUMN IF NOT EXISTS custom_title TEXT;');
    dbInitialized = true;
    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
}

export async function query(text: string, params?: any[]) {
  await ensureSchema();
  const p = getPool();
  return p.query(text, params);
}
