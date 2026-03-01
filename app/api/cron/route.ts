import { NextResponse } from 'next/server';
import { pollGroupSalesOnce } from '@/lib/groupSalesWatcher';

export async function GET() {
  try {
    console.log('[Cron] /api/cron called');
    await pollGroupSalesOnce();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Cron] Error in /api/cron:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
