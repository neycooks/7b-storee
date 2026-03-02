import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const url = new URL('/api/group-kits', req.url);
    url.searchParams.set('limit', '100');

    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch group-kits', status: response.status }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (!data.ok || !Array.isArray(data.items)) {
      return NextResponse.json({ error: 'Invalid group-kits response', data }, { status: 500 });
    }

    let synced = 0;
    
    for (const item of data.items) {
      await sql`
        INSERT INTO shop_items (roblox_id, name, price, thumbnail_url, type, description)
        VALUES (${item.id}, ${item.name}, ${item.price}, ${item.thumbnailUrl}, 'shirt', ${item.description || ''})
        ON CONFLICT (roblox_id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          thumbnail_url = EXCLUDED.thumbnail_url,
          type = EXCLUDED.type,
          description = EXCLUDED.description;
      `;
      synced++;
    }

    return NextResponse.json({ ok: true, syncedCount: synced });
  } catch (error: any) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
