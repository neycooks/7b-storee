import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';

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

    if (!response.ok) break;

    const data = await response.json();
    if (data.data?.length > 0) {
      allItems.push(...data.data);
    }
    cursor = data.nextPageCursor || null;
  } while (cursor);
  
  return allItems;
}

async function getDetails(assetIds: number[]): Promise<Map<number, any>> {
  const detailsMap = new Map<number, any>();
  
  // Batch requests - 50 IDs per request
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
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    // Step 1: Get all search items (shirts + pants)
    const allShirts = await fetchClothing('ClassicShirts');
    const allPants = await fetchClothing('ClassicPants');
    const allSearchItems = [...allShirts, ...allPants];
    
    console.log('Search items total:', allSearchItems.length);

    if (allSearchItems.length === 0) {
      return NextResponse.json({ items: [], page, pageSize, totalItems: 0, totalPages: 0 });
    }

    // Step 2: Get details for all items
    const assetIds = allSearchItems.map((item: any) => item.id);
    const detailsMap = await getDetails(assetIds);
    
    console.log('Detail records total:', detailsMap.size);
    const firstDetail = Array.from(detailsMap.values())[0];
    console.log('Example detail:', firstDetail ? JSON.stringify(firstDetail).slice(0, 300) : 'none');

    // Step 3: Filter to shirts/pants only (assetTypeId 11=Shirt, 12=Pants)
    const clothingItems: any[] = [];
    detailsMap.forEach((detail, id) => {
      if (detail.assetTypeId === 11 || detail.assetTypeId === 12) {
        clothingItems.push({ ...detail, searchItem: allSearchItems.find((s: any) => s.id === id) });
      }
    });

    // Step 4: Get thumbnails
    const thumbnails = await getThumbnails(clothingItems.map((item: any) => String(item.id)));
    console.log('Thumbnails received:', Object.keys(thumbnails).length);

    // Step 5: Build final items
    const formattedItems = clothingItems.map((item: any) => {
      // Determine price
      let price: number | null = null;
      if (item.price !== undefined && typeof item.price === 'number') {
        price = item.price > 0 ? item.price : null;
      } else if (item.priceInRobux !== undefined && typeof item.priceInRobux === 'number') {
        price = item.priceInRobux > 0 ? item.priceInRobux : null;
      }
      
      // Offsale check
      if (item.isOffsale === true || item.purchasable === false) {
        price = null;
      }

      return {
        id: item.id,
        name: item.name || '(Unnamed item)',
        description: item.description || '',
        price: price,
        link: `https://www.roblox.com/catalog/${item.id}/`,
        icon: thumbnails[String(item.id)] || '',
      };
    });

    // Sort by ID for consistency
    formattedItems.sort((a, b) => a.id - b.id);

    console.log('Final items length:', formattedItems.length);
    console.log('Example final item:', formattedItems[0] ? JSON.stringify(formattedItems[0]) : 'none');

    // Step 6: Paginate
    const totalItems = formattedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedItems = formattedItems.slice(start, end);

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
