import { NextResponse } from 'next/server';

interface Item {
  id: number;
  name: string;
  description: string;
  price: number | null;
  link: string;
  icon: string | null;
}

async function fetchGroupKits(limit: number = 60): Promise<Item[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const url = `${baseUrl}/api/group-kits?limit=${limit}`;
    
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      console.error('[Items] Failed to fetch group-kits:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.ok || !Array.isArray(data.items)) {
      console.error('[Items] Invalid group-kits response:', data);
      return [];
    }
    
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: '',
      price: item.price,
      link: `https://www.roblox.com/catalog/${item.id}/`,
      icon: item.thumbnailUrl || null,
    }));
  } catch (error) {
    console.error('[Items] Error fetching group-kits:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '20');

  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const allItems = await fetchGroupKits(60);

  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const clampedPage = Math.min(safePage, totalPages);
  const start = (clampedPage - 1) * safePageSize;
  const end = start + safePageSize;
  const items = allItems.slice(start, end);

  return NextResponse.json({
    items,
    page: clampedPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
  });
}
