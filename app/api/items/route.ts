import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;

const MANUAL_ITEMS = [
  {
    id: '1',
    name: 'Image Permissions',
    price: '25R$',
    description: 'Official image usage permissions for content creators.',
    icon: '',
    url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store`,
  },
  {
    id: '2', 
    name: 'VIP Bundle',
    price: '100R$',
    description: 'Premium VIP access bundle with exclusive perks.',
    icon: '',
    url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store`,
  },
  {
    id: '3',
    name: 'Premium Access',
    price: '250R$',
    description: 'Full premium access to all group benefits.',
    icon: '',
    url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store`,
  },
];

export async function GET() {
  try {
    const response = await fetch(
      `https://groups.roblox.com/v1/groups/${GROUP_ID}/ownerships/assets`,
      {
        headers: {
          'x-api-key': ROBLOX_API_KEY || '',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const items = data.data.map((item: any) => ({
          id: String(item.assetId),
          name: item.name || 'Item',
          price: item.price ? `${item.price}R$` : 'N/A',
          description: item.description || 'Group item',
          icon: item.thumbnailUrl || '',
          url: `https://www.roblox.com/catalog/${item.assetId}/`,
        }));

        return NextResponse.json({ items });
      }
    }

    return NextResponse.json({ items: MANUAL_ITEMS });
  } catch (error) {
    return NextResponse.json({ items: MANUAL_ITEMS });
  }
}
