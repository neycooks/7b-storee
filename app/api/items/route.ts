import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';

async function getThumbnails(assetIds: string[]): Promise<Record<string, string>> {
  if (assetIds.length === 0) return {};
  
  const idsString = assetIds.join(',');
  const thumbnailUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${idsString}&returnPolicy=PlaceHolder&size=150x150&format=Png&aspectRatio=1x1`;
  
  try {
    const thumbResponse = await fetch(thumbnailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (thumbResponse.ok) {
      const thumbData = await thumbResponse.json();
      const thumbnailMap: Record<string, string> = {};
      
      if (thumbData.data) {
        for (const thumb of thumbData.data) {
          thumbnailMap[thumb.targetId] = thumb.imageUrl || '';
        }
      }
      
      return thumbnailMap;
    }
  } catch (error) {
    console.error('Thumbnail fetch error:', error);
  }
  
  return {};
}

async function fetchClothing(subcategory: string): Promise<any[]> {
  const allItems: any[] = [];
  let cursor: string | null = null;
  
  do {
    const url = `https://catalog.roblox.com/v1/search/items?category=Clothing&creatorType=Group&creatorTargetId=${GROUP_ID}&subcategory=${subcategory}&limit=120${cursor ? `&cursor=${cursor}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Roblox API error for ${subcategory}:`, response.status);
      break;
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      allItems.push(...data.data);
    }

    cursor = data.nextPageCursor || null;
    
  } while (cursor);
  
  return allItems;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    // Fetch both shirts and pants separately
    const allShirts = await fetchClothing('ClassicShirts');
    const allPants = await fetchClothing('ClassicPants');
    
    const allItems = allShirts.concat(allPants);

    console.log('Total shirts:', allShirts.length);
    console.log('Total pants:', allPants.length);
    console.log('Example item:', allItems[0] ? JSON.stringify(allItems[0]).slice(0, 300) : 'none');

    if (allItems.length === 0) {
      return NextResponse.json({
        items: [],
        page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
      });
    }

    // Get thumbnails
    const assetIds = allItems.map((item: any) => String(item.id));
    const thumbnails = await getThumbnails(assetIds);
    console.log('Thumbnails received:', Object.keys(thumbnails).length);

    // Map to output format
    const formattedItems = allItems.map((item: any) => {
      // Determine price
      let price: number | null = null;
      if (item.price !== undefined && item.price !== null && item.price > 0) {
        price = item.price;
      } else if (item.priceInRobux !== undefined && item.priceInRobux !== null && item.priceInRobux > 0) {
        price = item.priceInRobux;
      } else if (item.lowestPrice !== undefined && item.lowestPrice !== null && item.lowestPrice > 0) {
        price = item.lowestPrice;
      }
      
      // Check if offsale
      const isOffsale = item.isOffsale === true || item.purchasable === false;
      if (isOffsale) {
        price = null;
      }

      return {
        id: item.id,
        name: item.name || `Item ${item.id}`,
        description: item.description || '',
        price: price,
        link: `https://www.roblox.com/catalog/${item.id}/`,
        icon: thumbnails[String(item.id)] || '',
      };
    });

    // Pagination
    const totalItems = formattedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedItems = formattedItems.slice(start, end);

    console.log('API response items length:', pagedItems.length);

    return NextResponse.json({
      items: pagedItems,
      page,
      pageSize,
      totalItems,
      totalPages,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Roblox' }, { status: 500 });
  }
}
