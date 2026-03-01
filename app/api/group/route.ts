import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;

const FALLBACK_DATA = {
  name: '7B Store',
  members: 1500,
  sales: 619,
  products: 21,
};

export async function GET() {
  try {
    const headers: Record<string, string> = {};
    if (ROBLOX_API_KEY) {
      headers['x-api-key'] = ROBLOX_API_KEY;
    }

    const response = await fetch(
      `https://groups.roblox.com/v1/groups/${GROUP_ID}`,
      { headers }
    );

    if (!response.ok) {
      return NextResponse.json(FALLBACK_DATA);
    }

    const data = await response.json();

    return NextResponse.json({
      name: data.name || FALLBACK_DATA.name,
      members: data.memberCount || FALLBACK_DATA.members,
      sales: FALLBACK_DATA.sales,
      products: FALLBACK_DATA.products,
    });
  } catch (error) {
    return NextResponse.json(FALLBACK_DATA);
  }
}
