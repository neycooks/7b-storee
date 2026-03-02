import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeShopItemType } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type') ?? 'item';

    const normalizedGetType = normalizeShopItemType(typeParam);

    const rows = await sql`
      SELECT id, roblox_id, name, price, thumbnail_url, link, type
      FROM shop_items
      WHERE type = ${normalizedGetType}
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error('[ShopItems] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, robloxId, name, price, iconUrl, link } = body;

    const normalizedType = normalizeShopItemType(type);
    
    let thumbnailUrl = iconUrl || null;
    let itemName = name;
    let itemPrice = price;
    let itemLink = link;
    let itemRobloxId = robloxId;

    if (id && !robloxId) {
      const existing = await sql`SELECT roblox_id FROM shop_items WHERE id = ${id}`;
      if (existing.length > 0) {
        itemRobloxId = existing[0].roblox_id;
      }
    }

    if (!thumbnailUrl && itemRobloxId) {
      try {
        const thumbnailUrlFetch = `https://thumbnails.roblox.com/v1/assets?assetIds=${itemRobloxId}&returnPolicy=PlaceHolder&size=150x150&format=Png&aspectRatio=1x1`;
        const thumbRes = await fetch(thumbnailUrlFetch, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (thumbRes.ok) {
          const thumbData = await thumbRes.json();
          if (thumbData.data && thumbData.data[0]) {
            thumbnailUrl = thumbData.data[0].imageUrl;
          }
        }
      } catch (e) {
        console.error('[ShopItems] Thumbnail fetch error:', e);
      }
    }

    if (!itemLink && itemRobloxId) {
      itemLink = normalizedType === 'gamepass' 
        ? `https://www.roblox.com/game-pass/${itemRobloxId}`
        : `https://www.roblox.com/catalog/${itemRobloxId}`;
    }

    if (id) {
      await sql`
        UPDATE shop_items 
        SET name = ${itemName}, price = ${itemPrice}, thumbnail_url = ${thumbnailUrl}, link = ${itemLink}, type = ${normalizedType}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO shop_items (roblox_id, name, price, thumbnail_url, link, type)
        VALUES (${itemRobloxId}, ${itemName}, ${itemPrice}, ${thumbnailUrl}, ${itemLink}, ${normalizedType})
        ON CONFLICT (roblox_id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          thumbnail_url = EXCLUDED.thumbnail_url,
          link = EXCLUDED.link,
          type = EXCLUDED.type;
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[ShopItems] POST error:', error);
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
  }
}
