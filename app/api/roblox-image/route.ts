import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const cookie = process.env.ROBLOX_SECURITY_COOKIE;
    if (!cookie) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const headers = {
      'Cookie': `.ROBLOSECURITY=${cookie}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    const assetRes = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${id}`, {
      headers,
      redirect: 'follow'
    });

    if (!assetRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch asset' }, { status: assetRes.status });
    }

    const contentType = assetRes.headers.get('content-type') || 'image/png';
    
    const arrayBuffer = await assetRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Roblox Image] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
