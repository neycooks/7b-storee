import { NextResponse } from 'next/server';

type GroupKitItem = {
  id: number;
  name: string;
  price: number | null;
  creatorName: string;
  thumbnailUrl: string | null;
};

export async function GET() {
  try {
    const url = 'https://catalog.roblox.com/v1/search/items/details?' +
      new URLSearchParams({
        Category: '3',
        CreatorType: '2',
        CreatorTargetId: '35515756',
        IncludeNotForSale: 'true',
        Limit: '30',
        SortType: '3',
      });

    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[GroupKits] Roblox API error:', response.status, response.statusText);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch group kits from Roblox.' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.data)) {
      console.error('[GroupKits] Unexpected response structure:', Object.keys(data || {}));
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch group kits from Roblox.' },
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

    return NextResponse.json(
      { ok: true, items: simplifiedItems },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GroupKits] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch group kits from Roblox.' },
      { status: 500 }
    );
  }
}
