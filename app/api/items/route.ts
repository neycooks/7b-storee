import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 0;

interface Item {
  id: number;
  name: string;
  description: string;
  price: number | null;
  link: string;
  icon: string | null;
}

async function getThumbnails(assetIds: number[]): Promise<Record<number, string>> {
  const thumbnailMap: Record<number, string> = {};
  
  for (let i = 0; i < assetIds.length; i += 100) {
    const batch = assetIds.slice(i, i + 100);
    const idsString = batch.join(',');
    const url = `https://thumbnails.roblox.com/v1/assets?assetIds=${idsString}&returnPolicy=PlaceHolder&size=150x150&format=Png&aspectRatio=1x1`;
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          for (const thumb of data.data) {
            thumbnailMap[thumb.targetId] = thumb.imageUrl || '';
          }
        }
      }
    } catch (error) {
      console.error('Thumbnail error:', error);
    }
  }
  
  return thumbnailMap;
}

async function getItemsFromDB(): Promise<Item[]> {
  try {
    const rows = await sql`
      SELECT id, roblox_id, name, price, thumbnail_url, link
      FROM shop_items
      WHERE type IN ('item', 'shirt', 'pants')
      ORDER BY created_at DESC;
    `;
    
    console.log('[Items API] DB rows:', rows.length);
    
    if (rows.length === 0) {
      console.log('[Items API] No items in DB');
      return [];
    }
    
    return rows.map((row: any) => ({
      id: row.id,
      roblox_id: Number(row.roblox_id),
      name: row.name,
      description: '',
      price: row.price,
      link: row.link || `https://www.roblox.com/catalog/${row.roblox_id}`,
      icon: row.thumbnail_url || null,
    }));
  } catch (error) {
    console.error('[Items API] DB error:', error);
    return [];
  }
}

async function getItemsFromJSON(): Promise<Item[]> {
  const { default: clothingData } = await import('@/app/data/clothing.json');
  const allIds = clothingData.map((item: any) => item.id);
  const thumbnails = await getThumbnails(allIds);

  return clothingData.map((item: any) => ({
    id: item.id,
    name: item.name || `(Item ${item.id})`,
    description: item.description || '',
    price: typeof item.price === 'number' ? item.price : null,
    link: item.link || `https://www.roblox.com/catalog/${item.id}/`,
    icon: thumbnails[item.id] || null,
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '20');

  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  console.log('[Items API] Fetching items...');
  let allItems = await getItemsFromDB();
  
  if (allItems.length === 0) {
    console.log('[Items API] DB empty, using JSON fallback');
    allItems = await getItemsFromJSON();
  }

  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const clampedPage = Math.min(safePage, totalPages);
  const start = (clampedPage - 1) * safePageSize;
  const end = start + safePageSize;
  const items = allItems.slice(start, end);

  return NextResponse.json({
    items,
    page: clampedPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
  });
}
