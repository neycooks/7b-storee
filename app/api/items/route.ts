import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';

async function getAssetDetails(assetIds: string[]): Promise<any[]> {
  if (assetIds.length === 0) return [];
  
  try {
    const idsString = assetIds.join(',');
    const url = `https://catalog.roblox.com/v1/assets?assetIds=${idsString}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
  } catch (error) {
    console.error('Asset details error:', error);
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
    const allItems: any[] = [];
    let cursor = '';
    let fetchedCount = 0;
    const maxItems = 100;

    do {
      const searchUrl = `https://catalog.roblox.com/v1/search/items?category=Clothing&creatorType=Group&creatorTargetId=${GROUP_ID}&limit=100${cursor ? `&cursor=${cursor}` : ''}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        console.error('Roblox API error:', response.status);
        return NextResponse.json({ error: 'Failed to fetch from Roblox' }, { status: 500 });
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        allItems.push(...data.data);
        fetchedCount += data.data.length;
      }

      cursor = data.nextPageCursor || '';
      
    } while (cursor && fetchedCount < maxItems);

    console.log('Raw items from Roblox:', allItems.length);

    if (allItems.length === 0) {
      return NextResponse.json({
        items: [],
        page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
      });
    }

    const assetIds = allItems.map((item: any) => String(item.id));
    
    const assetDetails = await getAssetDetails(assetIds);
    const thumbnails = await getThumbnails(assetIds);

    console.log('Asset details received:', assetDetails.length);
    console.log('Thumbnails received:', Object.keys(thumbnails).length);

    const detailMap: Record<string, any> = {};
    for (const detail of assetDetails) {
      detailMap[String(detail.id)] = detail;
    }

    const formattedItems = allItems.map((item: any) => {
      const detail = detailMap[String(item.id)] || {};
      return {
        id: item.id,
        name: detail.name || `Item ${item.id}`,
        description: detail.description || '',
        price: detail.price || null,
        link: `https://www.roblox.com/catalog/${item.id}/`,
        icon: thumbnails[String(item.id)] || '',
      };
    });

    console.log('Formatted items:', formattedItems.length);

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
