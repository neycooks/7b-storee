import { NextResponse } from 'next/server';
import clothingData from '@/app/data/clothing.json';

interface Item {
  id: number;
  name: string;
  description: string;
  price: number | null;
  link: string;
  icon: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '20');

  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const allItems: Item[] = clothingData.map((item: any) => ({
    id: item.id,
    name: item.name || `(Item ${item.id})`,
    description: item.description || '',
    price: typeof item.price === 'number' ? item.price : null,
    link: item.link || `https://www.roblox.com/catalog/${item.id}/`,
    icon: item.icon || null,
  }));

  // Sort by ID
  allItems.sort((a, b) => a.id - b.id);

  // Local pagination
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
