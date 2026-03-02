import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS shop_items (
        id SERIAL PRIMARY KEY,
        roblox_id BIGINT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        price INTEGER,
        thumbnail_url TEXT,
        link TEXT,
        type TEXT CHECK (type IN ('item', 'gamepass', 'shirt', 'pants')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    try {
      await sql`ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS link TEXT;`;
    } catch (e) {
      // column may already exist
    }

    try {
      await sql`ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('item', 'gamepass', 'shirt', 'pants'));`;
    } catch (e) {
      // column may already exist
    }

    return NextResponse.json({ ok: true, message: 'shop_items table ready' });
  } catch (error) {
    console.error('[Setup] Error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
