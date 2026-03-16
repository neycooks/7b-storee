import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const cookie = process.env.ROBLOX_SECURITY_COOKIE;
    if (!cookie) {
      return NextResponse.json({ error: 'Server not configured with Roblox cookie' }, { status: 500 });
    }

    const headers = {
      'Cookie': `.ROBLOSECURITY=${cookie}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    const searchRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`, { headers });
    const searchData = await searchRes.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = searchData.data[0].id;
    const userName = searchData.data[0].name;

    const [avatarRes, thumbRes] = await Promise.all([
      fetch(`https://avatar.roblox.com/v1/users/${userId}/avatar`, { headers }),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=352x352&format=Png&isCircular=false`, { headers })
    ]);

    const avatar = await avatarRes.json();
    const thumbnail = await thumbRes.json();

    if (!avatar || avatar.errors) {
      return NextResponse.json({ error: 'Failed to fetch avatar' }, { status: 500 });
    }

    const accessories: Array<{
      id: number;
      assetType: string;
      name: string;
    }> = [];

    if (avatar.assets) {
      for (const asset of avatar.assets) {
        if (asset.assetType === 'Hat' || asset.assetType === 'Hair' || 
            asset.assetType === 'FaceAccessory' || asset.assetType === 'NeckAccessory' ||
            asset.assetType === 'ShoulderAccessory' || asset.assetType === 'FrontAccessory' ||
            asset.assetType === 'BackAccessory' || asset.assetType === 'WaistAccessory') {
          accessories.push({
            id: asset.id,
            assetType: asset.assetType,
            name: asset.name
          });
        }
      }
    }

    return NextResponse.json({
      userId,
      userName,
      shirtAssetId: avatar.shirt?.id,
      pantsAssetId: avatar.pants?.id,
      accessories,
      thumbnailUrl: thumbnail.data?.[0]?.imageUrl || ''
    });
  } catch (error) {
    console.error('[Roblox API] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
