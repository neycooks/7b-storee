import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, roblox_id, name, price, thumbnail_url, link, type
      FROM shop_items
      WHERE type = 'gamepass'
      ORDER BY created_at DESC;
    `;
    
    const items = rows.map((row: any) => ({
      id: Number(row.roblox_id),
      name: row.name,
      description: '',
      price: row.price,
      link: row.link || `https://www.roblox.com/game-pass/${row.roblox_id}`,
      icon: row.thumbnail_url || null,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[Gamepasses] Error:', error);
    return NextResponse.json({ items: [] });
  }
}
