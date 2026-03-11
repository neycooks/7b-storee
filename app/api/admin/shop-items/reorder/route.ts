import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, type } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    for (const item of items) {
      await sql`
        UPDATE shop_items 
        SET sort_order = ${item.sort_order}
        WHERE id = ${item.id} AND type = ${type}
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Reorder] Error:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
