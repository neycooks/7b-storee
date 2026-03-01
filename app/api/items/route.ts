import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';

async function getCatalogDetails(assetIds: string[]): Promise<any[]> {
  if (assetIds.length === 0) return [];
  
  try {
    const response = await fetch('https://catalog.roblox.com/v1/catalog/items/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        items: assetIds.map(id => ({ itemType: 'Asset', id: parseInt(id) }))
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
  } catch (error) {
    console.error('Catalog details error:', error);
  }
  
  return [];
}

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    const allSearchItems: any[] = [];
    let cursor: string | null = null;

    // Step 1: Fetch ALL items from search API with pagination
    do {
      const searchUrl = `https://catalog.roblox.com/v1/search/items?category=Clothing&creatorType=Group&creatorTargetId=${GROUP_ID}&limit=100${cursor ? `&cursor=${cursor}` : ''}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        console.error('Roblox search error:', response.status);
        break;
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        allSearchItems.push(...data.data);
      }

      cursor = data.nextPageCursor || null;
      
    } while (cursor);

    console.log('Total search items:', allSearchItems.length);

    if (allSearchItems.length === 0) {
      return NextResponse.json({
        items: [],
        page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
      });
    }

    // Step 2: Get catalog details for all items
    const assetIds = allSearchItems.map((item: any) => String(item.id));
    const catalogDetails = await getCatalogDetails(assetIds);
    
    console.log('Total detail records:', catalogDetails.length);
    if (catalogDetails.length > 0) {
      console.log('Example detail:', JSON.stringify(catalogDetails[0]).slice(0, 500));
    }

    // Step 3: Get thumbnails
    const thumbnails = await getThumbnails(assetIds);
    console.log('Thumbnails received:', Object.keys(thumbnails).length);

    // Step 4: Map details to items
    const detailMap: Record<string, any> = {};
    for (const detail of catalogDetails) {
      detailMap[String(detail.id)] = detail;
    }

    // Step 5: Filter for shirts and pants only
    // AssetTypeId: 11 = Shirt, 12 = Pants
    const clothingItems = catalogDetails.filter((item: any) => {
      const assetTypeId = item.assetTypeId;
      return assetTypeId === 11 || assetTypeId === 12; // Shirt or Pants
    });

    console.log('Filtered clothing count:', clothingItems.length);
    if (clothingItems.length > 0) {
      console.log('Example clothing item:', JSON.stringify(clothingItems[0]).slice(0, 500));
    }

    // Step 6: Format items
    const formattedItems = clothingItems.map((item: any) => {
      // Determine price - check multiple possible fields
      let price: number | null = null;
      if (item.price !== undefined && item.price !== null) {
        price = item.price;
      } else if (item.priceInRobux !== undefined && item.priceInRobux !== null) {
        price = item.priceInRobux;
      } else if (item.lowestPrice !== undefined && item.lowestPrice !== null) {
        price = item.lowestPrice;
      }
      
      // If price is 0, check if it's actually free or offsale
      const isOffsale = item.isOffsale === true || item.purchasable === false;
      if (isOffsale && price === null) {
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

    // Step 7: Pagination
    const totalItems = formattedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = formattedItems.slice(start, end);

    return NextResponse.json({
      items: paginatedItems,
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
