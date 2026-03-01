import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';

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
  {
    id: '4',
    name: 'Gold Pass',
    price: '500R$',
    description: 'Gold membership pass with exclusive benefits.',
    icon: '',
    url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store`,
  },
  {
    id: '5',
    name: 'Platinum Bundle',
    price: '1,000R$',
    description: 'Complete platinum package with all perks.',
    icon: '',
    url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store`,
  },
];

export async function GET() {
  return NextResponse.json({ items: MANUAL_ITEMS });
}
