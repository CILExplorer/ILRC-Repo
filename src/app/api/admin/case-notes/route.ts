import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query('SELECT * FROM case_notes ORDER BY created_at DESC');
    return NextResponse.json({ success: true, caseNotes: result.rows });
  } catch (error) {
    console.error('Failed to fetch case notes:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      source_url, fetch_date, title,
      citation_tribunal, facts, legal_issues, reasoning, critical_analysis, significance,
      editors_commentary, tags, status
    } = body;

    if (!source_url) {
      return NextResponse.json({ error: 'Source URL is required.' }, { status: 400 });
    }

    const cleanTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : []);

    const sql = `
      INSERT INTO case_notes (
        source_url, fetch_date, title,
        citation_tribunal, facts, legal_issues, reasoning, critical_analysis, significance,
        editors_commentary, tags, status, verified
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, FALSE
      ) RETURNING *
    `;

    const parseDate = (dStr: string) => {
      const d = new Date(dStr);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    const params = [
      source_url,
      parseDate(fetch_date),
      title || 'Untitled Case Note',
      citation_tribunal || '',
      facts || '',
      legal_issues || '',
      reasoning || '',
      critical_analysis || '',
      significance || '',
      editors_commentary || '',
      cleanTags,
      status || 'draft'
    ];

    const result = await query(sql, params);
    return NextResponse.json({ success: true, caseNote: result.rows[0] });

  } catch (error) {
    console.error('Failed to create case note:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
