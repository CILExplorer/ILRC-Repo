import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Use ON CONFLICT DO NOTHING to handle duplicates gracefully
    const sql = `
      INSERT INTO subscribers (email)
      VALUES ($1)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    const result = await query(sql, [trimmedEmail]);

    const alreadySubscribed = result.rows.length === 0;

    return NextResponse.json({
      success: true,
      message: alreadySubscribed
        ? 'You are already subscribed to the ILRC mailing list.'
        : 'Thank you for subscribing to the International Law Research Collective!',
    });
  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
