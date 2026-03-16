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

    const avatarRes = await fetch(`https://avatar.roblox.com/v1/users/${userId}/avatar`, { headers });
    const avatar = await avatarRes.json();

    if (!avatar || avatar.errors) {
      return NextResponse.json({ error: 'Failed to fetch avatar' }, { status: 500 });
    }

    let shirtAssetId: number | undefined;
    let pantsAssetId: number | undefined;
    const accessories: Array<{
      id: number;
      assetType: string;
      name: string;
    }> = [];

    if (avatar.assets && Array.isArray(avatar.assets)) {
      for (const asset of avatar.assets) {
        const assetTypeName = asset.assetType?.name;
        
        if (assetTypeName === 'Shirt') {
          shirtAssetId = asset.id;
        } else if (assetTypeName === 'Pants') {
          pantsAssetId = asset.id;
        } else if (assetTypeName === 'HairAccessory') {
          accessories.push({
            id: asset.id,
            assetType: 'Hair',
            name: asset.name
          });
        } else if (assetTypeName === 'Hat') {
          accessories.push({
            id: asset.id,
            assetType: 'Hat',
            name: asset.name
          });
        } else if (assetTypeName === 'FaceAccessory') {
          accessories.push({
            id: asset.id,
            assetType: 'FaceAccessory',
            name: asset.name
          });
        } else if (assetTypeName === 'NeckAccessory') {
          accessories.push({
            id: asset.id,
            assetType: 'NeckAccessory',
            name: asset.name
          });
        } else if (assetTypeName === 'ShoulderAccessory') {
          accessories.push({
            id: asset.id,
            assetType: 'ShoulderAccessory',
            name: asset.name
          });
        } else if (assetTypeName === 'BackAccessory') {
          accessories.push({
            id: asset.id,
            assetType: 'BackAccessory',
            name: asset.name
          });
        } else if (assetTypeName === 'FrontAccessory') {
          accessories.push({
            id: asset.id,
            assetType: 'FrontAccessory',
            name: asset.name
          });
        } else if (assetTypeName === 'WaistAccessory') {
          accessories.push({
            id: asset.id,
            assetType: 'WaistAccessory',
            name: asset.name
          });
        }
      }
    }

    return NextResponse.json({
      userId,
      userName,
      shirtAssetId,
      pantsAssetId,
      accessories
    });
  } catch (error) {
    console.error('[Roblox API] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
