import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';
import { broadcastDigest } from '@/lib/email';

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
    const result = await query('SELECT * FROM digests WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Digest not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, digest: result.rows[0] });
  } catch (error) {
    console.error('Failed to fetch digest:', error);
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
    const currentRes = await query('SELECT * FROM digests WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Digest not found' }, { status: 404 });
    }
    const currentDigest = currentRes.rows[0];

    const {
      arb_title, arb_summary, arb_source_name, arb_source_url, arb_source_date,
      treaty_title, treaty_summary, treaty_source_name, treaty_source_url, treaty_source_date,
      inst_title, inst_summary, inst_source_name, inst_source_url, inst_source_date,
      verified_arb, verified_treaty, verified_inst,
      editors_note, editors_insight,
      tags,
      status, // 'pending' | 'published'
      custom_title
    } = body;

    // Enforce server-side verification checks on publish
    const targetStatus = status || currentDigest.status;
    const isPublishing = targetStatus === 'published';

    const checkArb = verified_arb !== undefined ? verified_arb : currentDigest.verified_arb;
    const checkTreaty = verified_treaty !== undefined ? verified_treaty : currentDigest.verified_treaty;
    const checkInst = verified_inst !== undefined ? verified_inst : currentDigest.verified_inst;

    if (isPublishing && (!checkArb || !checkTreaty || !checkInst)) {
      return NextResponse.json({ 
        error: 'Sourcing enforcement error: All source verification checkboxes must be checked before publishing.' 
      }, { status: 400 });
    }

    let publishedAt = currentDigest.published_at;
    let lastEditedAt = currentDigest.last_edited_at;

    const previousStatus = currentDigest.status;

    if (isPublishing) {
      if (previousStatus === 'pending') {
        publishedAt = new Date();
      } else if (previousStatus === 'published') {
        lastEditedAt = new Date();
      }
    } else {
      // Reverting to pending / unpublishing
      publishedAt = null;
    }

    const sql = `
      UPDATE digests SET
        arb_title = $1, arb_summary = $2, arb_source_name = $3, arb_source_url = $4, arb_source_date = $5,
        treaty_title = $6, treaty_summary = $7, treaty_source_name = $8, treaty_source_url = $9, treaty_source_date = $10,
        inst_title = $11, inst_summary = $12, inst_source_name = $13, inst_source_url = $14, inst_source_date = $15,
        verified_arb = $16, verified_treaty = $17, verified_inst = $18,
        editors_note = $19, editors_insight = $20,
        tags = $21,
        status = $22,
        published_at = $23,
        last_edited_at = $24,
        custom_title = $25
      WHERE id = $26
      RETURNING *
    `;

    const cleanTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : []);

    const paramsArray = [
      arb_title || currentDigest.arb_title,
      arb_summary || currentDigest.arb_summary,
      arb_source_name || currentDigest.arb_source_name,
      arb_source_url || currentDigest.arb_source_url,
      arb_source_date ? new Date(arb_source_date) : currentDigest.arb_source_date,
      
      treaty_title || currentDigest.treaty_title,
      treaty_summary || currentDigest.treaty_summary,
      treaty_source_name || currentDigest.treaty_source_name,
      treaty_source_url || currentDigest.treaty_source_url,
      treaty_source_date ? new Date(treaty_source_date) : currentDigest.treaty_source_date,
      
      inst_title || currentDigest.inst_title,
      inst_summary || currentDigest.inst_summary,
      inst_source_name || currentDigest.inst_source_name,
      inst_source_url || currentDigest.inst_source_url,
      inst_source_date ? new Date(inst_source_date) : currentDigest.inst_source_date,
      
      checkArb,
      checkTreaty,
      checkInst,
      
      editors_note !== undefined ? editors_note : currentDigest.editors_note,
      editors_insight !== undefined ? editors_insight : currentDigest.editors_insight,
      cleanTags,
      targetStatus,
      publishedAt,
      lastEditedAt,
      custom_title !== undefined ? custom_title : currentDigest.custom_title,
      id
    ];

    const updateRes = await query(sql, paramsArray);
    const updatedDigest = updateRes.rows[0];

    // Trigger newsletter delivery on publish (only if transition from pending to published)
    if (previousStatus === 'pending' && targetStatus === 'published') {
      try {
        const subRes = await query('SELECT email FROM subscribers');
        const emails = subRes.rows.map((r: { email: string }) => r.email);
        // Call broadcast asynchronously
        broadcastDigest(updatedDigest, emails).catch(err => {
          console.error('Asynchronous Resend mailing list dispatch failed:', err);
        });
      } catch (err) {
        console.error('Failed to retrieve subscribers list for dispatch:', err);
      }
    }

    return NextResponse.json({ success: true, digest: updatedDigest });

  } catch (error) {
    console.error('Failed to update digest:', error);
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
    const result = await query('DELETE FROM digests WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Digest not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Digest deleted successfully' });
  } catch (error) {
    console.error('Failed to delete digest:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
