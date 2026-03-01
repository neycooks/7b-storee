import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';
const GROUP_NAME = '7B Store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const start = (page - 1) * limit;

  try {
    const response = await fetch(
      `https://catalog.roblox.com/v1/search/items/details?category=All&limit=${limit}&sortOrder=Desc&start=${start}&sellerType=Group&sellerId=${GROUP_ID}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const items = data.data.map((item: any) => ({
        id: String(item.id),
        name: item.name || 'Item',
        price: item.price ? `${item.price}R$` : 'Free',
        description: item.description || `${GROUP_NAME} exclusive item`,
        icon: item.thumbnailUrl || '',
        url: item.url || `https://www.roblox.com/catalog/${item.id}/`,
      }));

      return NextResponse.json({
        items,
        total: data.totalCount || 0,
        page,
        totalPages: Math.ceil((data.totalCount || 0) / limit),
        hasMore: start + limit < (data.totalCount || 0),
      });
    }

    return NextResponse.json({
      items: [],
      total: 0,
      page,
      totalPages: 1,
      hasMore: false,
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
