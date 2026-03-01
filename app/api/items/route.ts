import { NextResponse } from 'next/server';
import ids from '@/app/data/groupClothingIds.json';

interface Item {
  id: number;
  name: string;
  description: string;
  price: number | null;
  link: string;
  icon: string;
}

async function getDetails(assetIds: number[]): Promise<Map<number, any>> {
  const detailsMap = new Map<number, any>();
  
  for (let i = 0; i < assetIds.length; i += 50) {
    const batch = assetIds.slice(i, i + 50);
    
    try {
      const response = await fetch('https://catalog.roblox.com/v1/catalog/items/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
          items: batch.map(id => ({ itemType: 'Asset', id }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          for (const detail of data.data) {
            detailsMap.set(detail.id, detail);
          }
        }
      }
    } catch (error) {
      console.error('Details batch error:', error);
    }
  }
  
  return detailsMap;
}

async function getThumbnails(assetIds: string[]): Promise<Record<string, string>> {
  const thumbnailMap: Record<string, string> = {};
  
  for (let i = 0; i < assetIds.length; i += 100) {
    const batch = assetIds.slice(i, i + 100);
    const url = `https://thumbnails.roblox.com/v1/assets?assetIds=${batch.join(',')}&returnPolicy=PlaceHolder&size=150x150&format=Png&aspectRatio=1x1`;
    
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '20');

  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  try {
    // Normalize IDs to number[]
    const allIds: number[] = (ids as (string | number)[]).map((id) =>
      typeof id === 'string' ? Number(id) : id
    );

    console.log('Total IDs:', allIds.length);

    if (allIds.length === 0) {
      return NextResponse.json({
        items: [],
        page: 1,
        pageSize: safePageSize,
        totalItems: 0,
        totalPages: 0,
      });
    }

    // Fetch details
    const detailsMap = await getDetails(allIds);
    console.log('Details fetched:', detailsMap.size);

    // Fetch thumbnails
    const thumbnails = await getThumbnails(allIds.map(String));
    console.log('Thumbnails fetched:', Object.keys(thumbnails).length);

    // Build items
    const allItems: Item[] = allIds.map((id) => {
      const detail = detailsMap.get(id);
      
      // Determine price
      let price: number | null = null;
      if (typeof detail?.price === 'number' && detail.price > 0) {
        price = detail.price;
      } else if (typeof detail?.priceInRobux === 'number' && detail.priceInRobux > 0) {
        price = detail.priceInRobux;
      }
      
      // Offsale check
      if (detail?.isOffsale === true || detail?.purchasable === false) {
        price = null;
      }

      return {
        id,
        name: detail?.name ?? `(Item ${id})`,
        description: detail?.description ?? '',
        price: price,
        link: `https://www.roblox.com/catalog/${id}/`,
        icon: thumbnails[String(id)] || '',
      };
    });

    // Sort by ID
    allItems.sort((a, b) => a.id - b.id);

    console.log('Total items built:', allItems.length);

    // Local pagination
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

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      items: [],
      page: 1,
      pageSize: safePageSize,
      totalItems: 0,
      totalPages: 0,
    });
  }
}
