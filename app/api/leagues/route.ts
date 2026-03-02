import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('[Leagues API] Fetching leagues...');
    const rows = await sql`SELECT * FROM leagues ORDER BY created_at DESC;`;
    console.log('[Leagues API] Found:', rows.length, 'leagues');
    return NextResponse.json({ leagues: rows });
  } catch (error) {
    console.error('[Leagues API] Error:', error);
    return NextResponse.json({ leagues: [], error: String(error) });
  }
}
