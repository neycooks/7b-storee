import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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
        SET rank = ${item.rank}
        WHERE id = ${item.id}
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Rankings] PUT error:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
