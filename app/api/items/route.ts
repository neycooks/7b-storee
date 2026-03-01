import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';

async function getThumbnails(assetIds: string[]): Promise<Record<string, string>> {
  if (assetIds.length === 0) return {};
  
  const thumbnailMap: Record<string, string> = {};
  
  // Process in batches of 100
  for (let i = 0; i < assetIds.length; i += 100) {
    const batch = assetIds.slice(i, i + 100);
    const idsString = batch.join(',');
    const thumbnailUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${idsString}&returnPolicy=PlaceHolder&size=150x150&format=Png&aspectRatio=1x1`;
    
    try {
      const thumbResponse = await fetch(thumbnailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      if (thumbResponse.ok) {
        const thumbData = await thumbResponse.json();
        
        if (thumbData.data) {
          for (const thumb of thumbData.data) {
            thumbnailMap[thumb.targetId] = thumb.imageUrl || '';
          }
        }
      }
    } catch (error) {
      console.error('Thumbnail batch error:', error);
    }
  }
  
  return thumbnailMap;
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
    // Fetch both shirts and pants separately - ONCE per request
    const allShirts = await fetchClothing('ClassicShirts');
    const allPants = await fetchClothing('ClassicPants');
    
    // Combine and sort consistently by id
    let allItems = allShirts.concat(allPants);
    allItems.sort((a, b) => a.id - b.id);

    console.log('Total items before pagination:', allItems.length);
    if (allItems.length > 0) {
      console.log('First item raw:', JSON.stringify(allItems[0]).slice(0, 500));
    }

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

    // Map to output format with proper price/description handling
    const formattedItems = allItems.map((item: any) => {
      // Price: check multiple fields in order of priority
      let price: number | null = null;
      
      if (item.price !== undefined && typeof item.price === 'number' && item.price > 0) {
        price = item.price;
      } else if (item.priceInRobux !== undefined && typeof item.priceInRobux === 'number' && item.priceInRobux > 0) {
        price = item.priceInRobux;
      } else if (item.lowestPrice !== undefined && typeof item.lowestPrice === 'number' && item.lowestPrice > 0) {
        price = item.lowestPrice;
      }
      
      // Check if offsale - price should be null
      if (item.isOffsale === true || item.purchasable === false) {
        price = null;
      }

      // Description: use actual description or empty string
      const description = (item.description && item.description.trim && item.description.trim().length > 0) 
        ? item.description 
        : '';

      return {
        id: item.id,
        name: item.name || `Item ${item.id}`,
        description: description,
        price: price,
        link: `https://www.roblox.com/catalog/${item.id}/`,
        icon: thumbnails[String(item.id)] || '',
      };
    });

    // Calculate pagination AFTER all items are fetched
    const totalItems = formattedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedItems = formattedItems.slice(start, end);

    console.log('Example mapped item:', pagedItems[0] ? JSON.stringify(pagedItems[0]) : 'none');

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
