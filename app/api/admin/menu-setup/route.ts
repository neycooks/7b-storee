import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 0;

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS menu_posts (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    console.log('[Menu Setup] Table created');
    return NextResponse.json({ ok: true, message: 'Menu tables ready' });
  } catch (error) {
    console.error('[Menu Setup] Error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
