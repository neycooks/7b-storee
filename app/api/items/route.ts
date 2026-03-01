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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 30;

  try {
    const allItems: any[] = [];
    let cursor = '';
    let pageCount = 0;
    const maxPages = 10;

    do {
      const searchUrl = `https://catalog.roblox.com/v1/search/items?category=Clothing&creatorType=Group&creatorTargetId=${GROUP_ID}&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        break;
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const clothingItems = data.data.filter((item: any) => 
          item.assetType === 'Shirt' || item.assetType === 'Pants'
        );
        
        allItems.push(...clothingItems);
      }

      cursor = data.nextPageCursor || '';
      pageCount++;
      
    } while (cursor && pageCount < maxPages);

    if (allItems.length === 0) {
      return NextResponse.json({
        items: [],
        total: 0,
        page,
        totalPages: 1,
        hasMore: false,
      });
    }

    const assetIds = allItems.map((item: any) => String(item.id));
    const thumbnails = await getThumbnails(assetIds);

    const formattedItems = allItems.map((item: any) => ({
      id: String(item.id),
      name: item.name || 'Untitled',
      description: item.description || '',
      price: item.price || null,
      icon: thumbnails[String(item.id)] || '',
      url: `https://www.roblox.com/catalog/${item.id}/`,
    }));

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = formattedItems.slice(start, end);

    return NextResponse.json({
      items: paginatedItems,
      total: formattedItems.length,
      page,
      totalPages: Math.ceil(formattedItems.length / limit),
      hasMore: end < formattedItems.length,
    });

  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({
      items: [],
      total: 0,
      page,
      totalPages: 1,
      hasMore: false,
      error: 'Failed to fetch from Roblox',
    });
  }
}
