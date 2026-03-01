import { NextResponse } from 'next/server';

const GROUP_ID = '35515756';
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;

export async function GET() {
  if (!ROBLOX_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://groups.roblox.com/v1/groups/${GROUP_ID}`,
      {
        headers: {
          'x-api-key': ROBLOX_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch group');
    }

    const data = await response.json();

    return NextResponse.json({
      name: data.name || '7B Store',
      members: data.memberCount || 0,
      sales: 0,
      products: 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}
