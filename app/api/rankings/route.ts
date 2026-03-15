import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, username, icon_url, thumbnail_url, rank, category, created_at
      FROM rankings
      ORDER BY 
        CASE rank 
          WHEN 'ELT' THEN 1 
          WHEN 'PRO' THEN 2 
          WHEN 'ADV' THEN 3 
          WHEN 'INT' THEN 4 
          WHEN 'NOR' THEN 5 
          WHEN 'AMT' THEN 6 
          ELSE 7 
        END,
        category ASC,
        created_at DESC;
    `;
    return NextResponse.json({ rankings: rows });
  } catch (error) {
    console.error('[Rankings] GET error:', error);
    return NextResponse.json({ rankings: [], error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, icon_url, thumbnail_url, rank, category } = body;

    if (!name || !username) {
      return NextResponse.json({ error: 'Name and username required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO rankings (name, username, icon_url, thumbnail_url, rank, category)
      VALUES (${name}, ${username}, ${icon_url || null}, ${thumbnail_url || null}, ${rank || 'Beginner'}, ${category || 'CLOTHING'})
      RETURNING id, name, username, icon_url, thumbnail_url, rank, category, created_at;
    `;

    return NextResponse.json({ ranking: result[0], ok: true });
  } catch (error) {
    console.error('[Rankings] POST error:', error);
    return NextResponse.json({ error: 'Failed to create ranking' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    for (const item of items) {
      await sql`
        UPDATE rankings 
        SET rank = ${item.rank}, category = ${item.category}
        WHERE id = ${item.id}
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Rankings] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ranking ID' }, { status: 400 });
    }

    await sql`DELETE FROM rankings WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Rankings] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete ranking' }, { status: 500 });
  }
}
