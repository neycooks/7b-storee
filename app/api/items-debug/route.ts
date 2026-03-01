import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://catalog.roblox.com/v1/search/items?category=Clothing&creatorType=Group&creatorTargetId=35515756&limit=25';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const json = await response.json();
    
    console.log('RAW SEARCH SAMPLE:', JSON.stringify(json.data?.slice(0, 3), null, 2));

    return NextResponse.json({
      rawSearchCount: json.data?.length ?? 0,
      rawSearchSample: json.data ? json.data.slice(0, 3) : [],
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
