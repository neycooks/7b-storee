import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
    }

    const cookie = process.env.ROBLOX_SECURITY_COOKIE;
    if (!cookie) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const headers = {
      'Cookie': `.ROBLOSECURITY=${cookie}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=512x512&format=Png&isCircular=false`, { headers });
    const thumbData = await thumbRes.json();

    if (!thumbData.data || !thumbData.data[0]?.imageUrl) {
      return NextResponse.json({ error: 'No thumbnail found' }, { status: 404 });
    }

    const imageUrl = thumbData.data[0].imageUrl;
    
    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Roblox Thumbnail] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
