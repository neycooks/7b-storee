import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 0;

export async function GET() {
  try {
    console.log('[Leagues API] Fetching leagues...');
    const rows = await sql`SELECT * FROM leagues ORDER BY created_at DESC;`;
    console.log('[Leagues API] DB rows:', rows.length);
    return NextResponse.json({ leagues: rows });
  } catch (error) {
    console.error('[Leagues API] Error:', error);
    return NextResponse.json({ leagues: [], error: String(error) });
  }
}
