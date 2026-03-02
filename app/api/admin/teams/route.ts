import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get('leagueId');
    
    if (leagueId) {
      const rows = await sql`
        SELECT * FROM teams WHERE league_id = ${parseInt(leagueId)} ORDER BY created_at DESC;
      `;
      return NextResponse.json({ teams: rows });
    }
    
    const rows = await sql`SELECT * FROM teams ORDER BY created_at DESC;`;
    return NextResponse.json({ teams: rows });
  } catch (error) {
    console.error('[Teams] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leagueId, name, logoUrl } = body;

    if (body.id) {
      await sql`
        UPDATE teams SET name = ${name}, logo_url = ${logoUrl} WHERE id = ${body.id}
      `;
    } else {
      await sql`
        INSERT INTO teams (league_id, name, logo_url) VALUES (${leagueId}, ${name}, ${logoUrl})
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Teams] POST error:', error);
    return NextResponse.json({ error: 'Failed to save team' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      await sql`DELETE FROM team_kits WHERE team_id = ${parseInt(id)}`;
      await sql`DELETE FROM teams WHERE id = ${parseInt(id)}`;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Teams] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
