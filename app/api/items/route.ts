import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;

const MANUAL_ITEMS = [
  { id: '1', name: 'Image Permissions', price: '25R$', description: 'Official image usage permissions', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '2', name: 'VIP Bundle', price: '100R$', description: 'Premium VIP access bundle', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '3', name: 'Premium Access', price: '250R$', description: 'Full premium access', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '4', name: 'Gold Pass', price: '500R$', description: 'Gold membership pass', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '5', name: 'Platinum Bundle', price: '1,000R$', description: 'Complete platinum package', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '6', name: 'Diamond Tier', price: '2,000R$', description: 'Diamond tier membership', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '7', name: 'Elite Pass', price: '3,500R$', description: 'Elite exclusive pass', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '8', name: 'Champion Bundle', price: '5,000R$', description: 'Champion package', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '9', name: 'Legendary Access', price: '7,500R$', description: 'Legendary tier access', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '10', name: 'Ultimate Package', price: '10,000R$', description: 'Ultimate everything package', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '11', name: 'Starter Pack', price: '50R$', description: 'Basic starter pack', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '12', name: 'Pro Membership', price: '400R$', description: 'Professional membership', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '13', name: 'Executive Suite', price: '1,500R$', description: 'Executive benefits', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '14', name: 'Royal Access', price: '2,500R$', description: 'Royal treatment access', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
  { id: '15', name: 'Master Bundle', price: '4,000R$', description: 'Master tier package', icon: '', url: `https://www.roblox.com/groups/${GROUP_ID}/7B-STORE#!/store` },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 5;
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedItems = MANUAL_ITEMS.slice(start, end);
  
  const hasMore = end < MANUAL_ITEMS.length;

  return NextResponse.json({ 
    items: paginatedItems,
    total: MANUAL_ITEMS.length,
    page,
    totalPages: Math.ceil(MANUAL_ITEMS.length / limit),
    hasMore
  });
}
