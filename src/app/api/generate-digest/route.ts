import { NextResponse } from 'next/server';
import { generateDigestFromSources } from '@/lib/digest-generator';
import { query } from '@/lib/db';

async function handleGenerate(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret');

  const authHeader = request.headers.get('authorization');
  const secretHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.warn('CRON_SECRET environment variable is missing on the server.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (secretParam !== expectedSecret && secretHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await generateDigestFromSources();

    const sql = `
      INSERT INTO digests (
        status,
        arb_title, arb_summary, arb_source_name, arb_source_url, arb_source_date,
        treaty_title, treaty_summary, treaty_source_name, treaty_source_url, treaty_source_date,
        inst_title, inst_summary, inst_source_name, inst_source_url, inst_source_date,
        editors_note
      ) VALUES (
        'pending',
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16
      ) RETURNING id, issue_number
    `;

    // Make sure we parse dates correctly or fallback to now
    const parseDate = (dStr: string) => {
      const d = new Date(dStr);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    const params = [
      data.arbitration_development.title,
      data.arbitration_development.summary,
      data.arbitration_development.source_name,
      data.arbitration_development.source_url,
      parseDate(data.arbitration_development.source_date),

      data.treaty_update.title,
      data.treaty_update.summary,
      data.treaty_update.source_name,
      data.treaty_update.source_url,
      parseDate(data.treaty_update.source_date),

      data.institution_update.title,
      data.institution_update.summary,
      data.institution_update.source_name,
      data.institution_update.source_url,
      parseDate(data.institution_update.source_date),

      data.editors_note_draft,
    ];

    const dbResult = await query(sql, params);

    return NextResponse.json({
      success: true,
      message: 'Digest generated and stored as pending.',
      id: dbResult.rows[0].id,
      issue_number: dbResult.rows[0].issue_number,
    });
  } catch (error) {
    console.error('Error during digest generation:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleGenerate(request);
}

export async function POST(request: Request) {
  return handleGenerate(request);
}
