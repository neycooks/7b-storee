import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM leagues ORDER BY created_at DESC;
    `;
    return NextResponse.json({ leagues: rows });
  } catch (error) {
    console.error('[Leagues] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch leagues' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, iconUrl, joinLink } = body;

      if (body.id) {
      await sql`
        UPDATE leagues SET name = ${name}, icon_url = ${iconUrl}, join_link = ${joinLink} WHERE id = ${body.id}
      `;
    } else {
      const result = await sql`
        INSERT INTO leagues (name, icon_url, join_link) VALUES (${name}, ${iconUrl || null}, ${joinLink || null})
        RETURNING id, name
      `;
      console.log('[Leagues] Created:', result);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Leagues] POST error:', error);
    return NextResponse.json({ error: 'Failed to save league' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      await sql`DELETE FROM team_kits WHERE team_id IN (SELECT id FROM teams WHERE league_id = ${parseInt(id)})`;
      await sql`DELETE FROM teams WHERE league_id = ${parseInt(id)}`;
      await sql`DELETE FROM leagues WHERE id = ${parseInt(id)}`;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Leagues] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete league' }, { status: 500 });
  }
}
