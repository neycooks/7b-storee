import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 0;

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    console.log('[ShopItems DELETE] Deleting id:', parsedId);
    
    await sql`DELETE FROM shop_items WHERE id = ${parsedId}`;
    
    console.log('[ShopItems DELETE] Deleted successfully');
    return NextResponse.json({ ok: true, deletedId: parsedId });
  } catch (error) {
    console.error('[ShopItems DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete item', details: String(error) }, { status: 500 });
  }
}
