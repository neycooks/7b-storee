import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type') ?? 'item';

    const normalizedGetType = typeParam === 'gamepass' ? 'gamepass' : 
                             typeParam === 'shirt' ? 'shirt' : 
                             typeParam === 'pants' ? 'pants' : 'item';

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
    const auth = req.cookies.get('admin-auth')?.value;
    if (auth !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, robloxId, name, price, iconUrl, link } = body;

    let thumbnailUrl = iconUrl || null;
    let itemName = name;
    let itemPrice = price;
    let itemLink = link;

    let normalizedType: string;
    if (type === 'gamepass') {
      normalizedType = 'gamepass';
    } else if (type === 'shirt') {
      normalizedType = 'shirt';
    } else if (type === 'pants') {
      normalizedType = 'pants';
    } else {
      normalizedType = 'item';
    }

    if (!thumbnailUrl) {
      try {
        const thumbnailUrlFetch = `https://thumbnails.roblox.com/v1/assets?assetIds=${robloxId}&returnPolicy=PlaceHolder&size=150x150&format=Png&aspectRatio=1x1`;
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

    if (!itemLink) {
      itemLink = normalizedType === 'gamepass' 
        ? `https://www.roblox.com/game-pass/${robloxId}`
        : `https://www.roblox.com/catalog/${robloxId}`;
    }

    await sql`
      INSERT INTO shop_items (roblox_id, name, price, thumbnail_url, link, type)
      VALUES (${robloxId}, ${itemName}, ${itemPrice}, ${thumbnailUrl}, ${itemLink}, ${normalizedType})
      ON CONFLICT (roblox_id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        thumbnail_url = EXCLUDED.thumbnail_url,
        link = EXCLUDED.link,
        type = EXCLUDED.type;
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[ShopItems] POST error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
