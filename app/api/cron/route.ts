import { NextResponse } from 'next/server';
import { pollGroupSalesOnce } from '@/lib/groupSalesWatcher';

export async function GET() {
  console.log('[Cron] /api/cron called');
  await pollGroupSalesOnce();
  return NextResponse.json({ ok: true });
}
