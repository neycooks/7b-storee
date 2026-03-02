import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    
    if (leagueId) {
      const rows = await sql`SELECT * FROM teams WHERE league_id = ${parseInt(leagueId)} ORDER BY created_at DESC;`;
      return NextResponse.json({ teams: rows });
    }
    
    const rows = await sql`SELECT * FROM teams ORDER BY created_at DESC;`;
    return NextResponse.json({ teams: rows });
  } catch (error) {
    return NextResponse.json({ teams: [] });
  }
}
