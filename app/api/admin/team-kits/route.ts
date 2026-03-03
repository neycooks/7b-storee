import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    
    if (teamId) {
      const rows = await sql`
        SELECT * FROM team_kits WHERE team_id = ${parseInt(teamId)} ORDER BY created_at DESC;
      `;
      return NextResponse.json({ kits: rows });
    }
    
    const rows = await sql`SELECT * FROM team_kits ORDER BY created_at DESC;`;
    return NextResponse.json({ kits: rows });
  } catch (error) {
    console.error('[TeamKits] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch kits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, name, robloxId, price, thumbnailUrl, link } = body;

    if (body.id) {
      await sql`
        UPDATE team_kits SET name = ${name}, roblox_id = ${robloxId}, price = ${price}, thumbnail_url = ${thumbnailUrl}, link = ${link} WHERE id = ${body.id}
      `;
    } else {
      await sql`
        INSERT INTO team_kits (team_id, name, roblox_id, price, thumbnail_url, link) VALUES (${teamId}, ${name}, ${robloxId}, ${price}, ${thumbnailUrl}, ${link})
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[TeamKits] POST error:', error);
    return NextResponse.json({ error: 'Failed to save kit' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      await sql`DELETE FROM team_kits WHERE id = ${parseInt(id)}`;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[TeamKits] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete kit' }, { status: 500 });
  }
}
