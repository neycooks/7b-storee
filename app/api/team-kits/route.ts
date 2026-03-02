import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    
    if (teamId) {
      const rows = await sql`SELECT * FROM team_kits WHERE team_id = ${parseInt(teamId)} ORDER BY created_at DESC;`;
      return NextResponse.json({ kits: rows });
    }
    
    const rows = await sql`SELECT * FROM team_kits ORDER BY created_at DESC;`;
    return NextResponse.json({ kits: rows });
  } catch (error) {
    return NextResponse.json({ kits: [] });
  }
}
