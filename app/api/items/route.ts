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
    
    console.log('RAW search items count:', allSearchItems.length);

    if (allSearchItems.length === 0) {
      return NextResponse.json({ items: [], page, pageSize, totalItems: 0, totalPages: 0 });
    }

    // Step 2: Get details for all items
    const assetIds = allSearchItems.map((item: any) => item.id);
    const detailsMap = await getDetails(assetIds);
    
    console.log('RAW details count:', Object.keys(detailsMap).length);
    const rawExample = Object.values(detailsMap)[0];
    console.log('RAW example detail:', rawExample ? JSON.stringify(rawExample).slice(0, 500) : 'none');

    // Phase 1: No filtering - map ALL items
    // Step 3: Get thumbnails
    const thumbnails = await getThumbnails(assetIds.map(String));
    console.log('Thumbnails received:', Object.keys(thumbnails).length);

    // Map ALL items (no filter)
    let allItems = Object.values(detailsMap).map((detail: any) => {
      // Determine price
      let price: number | null = null;
      if (typeof detail.price === 'number' && detail.price > 0) {
        price = detail.price;
      } else if (typeof detail.priceInRobux === 'number' && detail.priceInRobux > 0) {
        price = detail.priceInRobux;
      }
      
      // Offsale check
      if (detail.isOffsale === true || detail.purchasable === false) {
        price = null;
      }

      return {
        id: detail.id,
        name: detail.name || '(Unnamed item)',
        description: detail.description || '',
        price: price,
        link: `https://www.roblox.com/catalog/${detail.id}/`,
        icon: thumbnails[String(detail.id)] || '',
      };
    });

    console.log('All mapped items:', allItems.length);
    console.log('Example final item:', allItems[0] ? JSON.stringify(allItems[0]) : 'none');

    // Sort by ID
    allItems.sort((a, b) => a.id - b.id);

    // Phase 2: Simple clothing filter (if we have items)
    // Filter by checking if item has price or is purchasable (likely clothing)
    // or check assetType if available
    const clothingFilter = (detail: any) => {
      const assetType = (detail.assetType || '').toLowerCase();
      const assetTypeId = detail.assetTypeId;
      // Keep shirts, pants, or items with price (likely clothing)
      return assetType === 'shirt' || 
             assetType === 'pants' || 
             assetTypeId === 11 || 
             assetTypeId === 12 ||
             (detail.price && detail.price > 0);
    };

    const clothingItems = allItems.filter((item: any, index: number) => {
      const detail = Object.values(detailsMap)[index];
      return clothingFilter(detail);
    });

    console.log('Filtered clothing count:', clothingItems.length);

    // Use clothing items if available, otherwise use all items
    const finalItems = clothingItems.length > 0 ? clothingItems : allItems;

    // Paginate
    const totalItems = finalItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pagedItems = finalItems.slice(start, end);

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
