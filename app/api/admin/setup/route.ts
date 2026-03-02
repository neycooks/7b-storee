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
        type TEXT CHECK (type IN ('gamepass', 'shirt', 'pants')),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    return NextResponse.json({ ok: true, message: 'shop_items table created or already exists' });
  } catch (error) {
    console.error('[Setup] Error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
