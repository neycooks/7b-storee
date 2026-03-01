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
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    const allClothingItems: any[] = [];
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
        const clothingItems = data.data.filter((item: any) => 
          item.assetType === 'Shirt' || item.assetType === 'Pants'
        );
        
        allClothingItems.push(...clothingItems);
        fetchedCount += data.data.length;
      }

      cursor = data.nextPageCursor || '';
      
    } while (cursor && fetchedCount < maxItems && allClothingItems.length < maxItems);

    console.log('Total clothing items found:', allClothingItems.length);

    if (allClothingItems.length === 0) {
      return NextResponse.json({
        items: [],
        page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
      });
    }

    const assetIds = allClothingItems.map((item: any) => String(item.id));
    const thumbnails = await getThumbnails(assetIds);

    const formattedItems = allClothingItems.map((item: any) => ({
      id: item.id,
      name: item.name || 'Untitled',
      description: item.description || '',
      price: item.price || null,
      link: `https://www.roblox.com/catalog/${item.id}/`,
      icon: thumbnails[String(item.id)] || '',
    }));

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
