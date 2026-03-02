import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  try {
    const auth = req.cookies.get('admin-auth')?.value;
    if (auth !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await sql`DELETE FROM shop_items WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[ShopItems] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
