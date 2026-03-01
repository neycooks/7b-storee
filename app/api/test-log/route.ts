import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[Test] /api/test-log called');
  return NextResponse.json({ ok: true });
}
