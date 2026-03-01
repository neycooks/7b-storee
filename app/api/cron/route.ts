import { NextResponse } from 'next/server';
import { pollGroupSalesOnce } from '@/lib/groupSalesWatcher';

export async function GET() {
  await pollGroupSalesOnce();
  return NextResponse.json({ ok: true });
}
