import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = req.cookies.get('admin-auth')?.value;
  return NextResponse.json({ authenticated: auth === 'true' });
}
