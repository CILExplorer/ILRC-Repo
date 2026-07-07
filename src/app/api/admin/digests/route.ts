import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query('SELECT * FROM digests ORDER BY issue_number DESC, created_at DESC');
    return NextResponse.json({ success: true, digests: result.rows });
  } catch (error) {
    console.error('Failed to fetch digests:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
