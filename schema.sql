-- Schema for International Law Research Collective (ILRC)

CREATE TABLE IF NOT EXISTS digests (
    id SERIAL PRIMARY KEY,
    issue_number SERIAL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'published'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    last_edited_at TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    
    -- Arbitration Development (required to have source url and date non-nullable)
    arb_title TEXT NOT NULL DEFAULT 'Pending Title',
    arb_summary TEXT NOT NULL DEFAULT 'Pending Summary',
    arb_source_name TEXT NOT NULL DEFAULT 'Pending Source',
    arb_source_url TEXT NOT NULL,
    arb_source_date DATE NOT NULL,
    verified_arb BOOLEAN DEFAULT FALSE,
    
    -- Treaty Update (required to have source url and date non-nullable)
    treaty_title TEXT NOT NULL DEFAULT 'Pending Title',
    treaty_summary TEXT NOT NULL DEFAULT 'Pending Summary',
    treaty_source_name TEXT NOT NULL DEFAULT 'Pending Source',
    treaty_source_url TEXT NOT NULL,
    treaty_source_date DATE NOT NULL,
    verified_treaty BOOLEAN DEFAULT FALSE,
    
    -- Institution Update (required to have source url and date non-nullable)
    inst_title TEXT NOT NULL DEFAULT 'Pending Title',
    inst_summary TEXT NOT NULL DEFAULT 'Pending Summary',
    inst_source_name TEXT NOT NULL DEFAULT 'Pending Source',
    inst_source_url TEXT NOT NULL,
    inst_source_date DATE NOT NULL,
    verified_inst BOOLEAN DEFAULT FALSE,
    
    -- Editor's input
    editors_note TEXT, -- Suggested draft or final
    editors_insight TEXT -- 100-200 words, bylined 'Ananyaa Joshi'
);

CREATE TABLE IF NOT EXISTS case_notes (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'published'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    last_edited_at TIMESTAMP,
    source_url TEXT NOT NULL,
    fetch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL DEFAULT 'Pending Title',
    
    -- Structured sections
    citation_tribunal TEXT NOT NULL DEFAULT '',
    facts TEXT NOT NULL DEFAULT '',
    legal_issues TEXT NOT NULL DEFAULT '',
    reasoning TEXT NOT NULL DEFAULT '',
    critical_analysis TEXT NOT NULL DEFAULT '',
    significance TEXT NOT NULL DEFAULT '',
    
    editors_commentary TEXT, -- optional, bylined Ananyaa Joshi
    tags TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
