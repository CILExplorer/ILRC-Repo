import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await query('SELECT * FROM case_notes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Case note not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, caseNote: result.rows[0] });
  } catch (error) {
    console.error('Failed to fetch case note:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    
    // Fetch current state
    const currentRes = await query('SELECT * FROM case_notes WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Case note not found' }, { status: 404 });
    }
    const currentNote = currentRes.rows[0];

    const {
      title, citation_tribunal, facts, legal_issues, reasoning, critical_analysis, significance,
      editors_commentary, tags, status, verified, source_url
    } = body;

    const targetStatus = status || currentNote.status;
    const isPublishing = targetStatus === 'published';

    const checkVerified = verified !== undefined ? verified : currentNote.verified;

    // Enforce server-side sourcing validation on publish
    if (isPublishing && !checkVerified) {
      return NextResponse.json({
        error: 'Sourcing enforcement error: The source verification checkbox must be checked before publishing.'
      }, { status: 400 });
    }

    let publishedAt = currentNote.published_at;
    let lastEditedAt = currentNote.last_edited_at;

    const previousStatus = currentNote.status;

    if (isPublishing) {
      if (previousStatus === 'draft') {
        publishedAt = new Date();
      } else if (previousStatus === 'published') {
        lastEditedAt = new Date();
      }
    } else {
      // Revert to draft
      publishedAt = null;
    }

    const sql = `
      UPDATE case_notes SET
        title = $1,
        citation_tribunal = $2,
        facts = $3,
        legal_issues = $4,
        reasoning = $5,
        critical_analysis = $6,
        significance = $7,
        editors_commentary = $8,
        tags = $9,
        status = $10,
        verified = $11,
        published_at = $12,
        last_edited_at = $13,
        source_url = $14
      WHERE id = $15
      RETURNING *
    `;

    const cleanTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : []);

    const paramsArray = [
      title || currentNote.title,
      citation_tribunal !== undefined ? citation_tribunal : currentNote.citation_tribunal,
      facts !== undefined ? facts : currentNote.facts,
      legal_issues !== undefined ? legal_issues : currentNote.legal_issues,
      reasoning !== undefined ? reasoning : currentNote.reasoning,
      critical_analysis !== undefined ? critical_analysis : currentNote.critical_analysis,
      significance !== undefined ? significance : currentNote.significance,
      editors_commentary !== undefined ? editors_commentary : currentNote.editors_commentary,
      cleanTags,
      targetStatus,
      checkVerified,
      publishedAt,
      lastEditedAt,
      source_url || currentNote.source_url,
      id
    ];

    const updateRes = await query(sql, paramsArray);
    return NextResponse.json({ success: true, caseNote: updateRes.rows[0] });

  } catch (error) {
    console.error('Failed to update case note:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await query('DELETE FROM case_notes WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Case note not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Case note deleted successfully' });
  } catch (error) {
    console.error('Failed to delete case note:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
