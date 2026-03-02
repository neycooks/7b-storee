import { NextResponse } from 'next/server';

type GroupKitItem = {
  id: number;
  name: string;
  price: number | null;
  creatorName: string;
  thumbnailUrl: string | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const cursor = searchParams.get('cursor');

    const limit = Math.min(parseInt(limitParam || '30', 10) || 30, 100);
    
    const params: Record<string, string> = {
      Category: '3',
      CreatorType: '2',
      CreatorTargetId: '35515756',
      IncludeNotForSale: 'true',
      Limit: limit.toString(),
      SortType: '3',
    };

    if (cursor) {
      params.Cursor = cursor;
    }

    const url = 'https://catalog.roblox.com/v1/search/items/details?' + new URLSearchParams(params);

    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[GroupKits] Roblox API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'group-kits failed', details: `Roblox API returned ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.data)) {
      console.error('[GroupKits] Unexpected response structure:', Object.keys(data || {}));
      return NextResponse.json(
        { error: 'group-kits failed', details: 'Invalid response structure from Roblox' },
        { status: 500 }
      );
    }

    const simplifiedItems: GroupKitItem[] = data.data.map((item: any) => {
      const price = item.price ?? item.lowestPrice ?? null;
      const creatorName = item.creatorName ?? item.creator?.name ?? 'Unknown';
      
      let thumbnailUrl: string | null = null;
      if (item.imageUrl) {
        thumbnailUrl = item.imageUrl;
      } else if (item.thumbnailImageUrl) {
        thumbnailUrl = item.thumbnailImageUrl;
      } else if (item.thumbnails && Array.isArray(item.thumbnails) && item.thumbnails.length > 0) {
        thumbnailUrl = item.thumbnails[0].imageUrl ?? null;
      }

      return {
        id: item.id,
        name: item.name,
        price: price,
        creatorName: creatorName,
        thumbnailUrl: thumbnailUrl,
      };
    });

    return NextResponse.json({
      items: simplifiedItems,
      nextCursor: data.nextPageCursor ?? null,
    });
  } catch (error: any) {
    console.error('[GroupKits] Error:', error);
    return NextResponse.json(
      { error: 'group-kits failed', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
