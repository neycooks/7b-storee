import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import clothingData from '@/app/data/clothing.json';

export async function GET(req: Request) {
  try {
    const url = new URL('/api/group-kits', req.url);
    url.searchParams.set('limit', '100');

    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    });

    let items: any[] = [];
    let source = 'json';

    if (response.ok) {
      const data = await response.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        items = data.items;
        source = 'roblox';
      }
    }

    if (items.length === 0) {
      console.log('[Sync] Roblox fetch failed or empty, using JSON fallback');
      items = clothingData.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        thumbnailUrl: item.icon || null,
        link: item.link || `https://www.roblox.com/catalog/${item.id}`,
      }));
      source = 'json';
    }

    let synced = 0;
    
    for (const item of items) {
      const robloxId = item.id;
      const name = item.name;
      const price = item.price ?? null;
      const thumbnailUrl = item.thumbnailUrl || item.thumbnail_url || item.icon || null;
      const link = item.link || `https://www.roblox.com/catalog/${robloxId}`;
      const type = 'item';

      await sql`
        INSERT INTO shop_items (roblox_id, name, price, thumbnail_url, link, type)
        VALUES (${robloxId}, ${name}, ${price}, ${thumbnailUrl}, ${link}, ${type})
        ON CONFLICT (roblox_id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          thumbnail_url = EXCLUDED.thumbnail_url,
          link = EXCLUDED.link,
          type = EXCLUDED.type;
      `;
      synced++;
    }

    return NextResponse.json({ ok: true, source, syncedCount: synced });
  } catch (error: any) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
