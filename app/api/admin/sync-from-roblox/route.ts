import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeShopItemType } from '@/lib/utils';
import clothingData from '@/app/data/clothing.json';

async function fetchThumbnail(assetId: number): Promise<string | null> {
  try {
    const url = `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&returnPolicy=PlaceHolder&size=150x150&format=Png&aspectRatio=1x1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data[0]?.imageUrl) {
        return data.data[0].imageUrl;
      }
    }
  } catch (e) {
    console.error('[Sync] Thumbnail fetch error:', e);
  }
  return null;
}

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
        itemType: 'item',
      }));
      source = 'json';
    }

    let synced = 0;
    
    for (const item of items) {
      const robloxId = item.id;
      const name = item.name;
      const price = item.price ?? null;
      let thumbnailUrl = item.thumbnailUrl || item.thumbnail_url || item.icon || null;
      const link = item.link || `https://www.roblox.com/catalog/${robloxId}`;
      
      const rawType = item.type || item.itemType || item.assetType || '';
      const normalizedType = normalizeShopItemType(rawType);

      console.log('[Sync] Processing item:', { id: robloxId, rawType, normalizedType });

      if (!thumbnailUrl) {
        thumbnailUrl = await fetchThumbnail(robloxId);
      }

      await sql`
        INSERT INTO shop_items (roblox_id, name, price, thumbnail_url, link, type)
        VALUES (${robloxId}, ${name}, ${price}, ${thumbnailUrl}, ${link}, ${normalizedType})
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
