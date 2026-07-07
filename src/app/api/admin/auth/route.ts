import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn('ADMIN_PASSWORD is not defined in environment variables.');
      return NextResponse.json({ error: 'Server authentication is unconfigured' }, { status: 500 });
    }

    if (password === adminPassword) {
      await createSession();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Incorrect credentials' }, { status: 401 });
  } catch (error) {
    console.error('Authentication API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
