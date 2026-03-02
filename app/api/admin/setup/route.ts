import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('[Setup] Creating tables...');
    
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
    console.log('[Setup] shop_items table created');

    try {
      await sql`ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS link TEXT;`;
    } catch (e) {}

    try {
      await sql`ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('item', 'gamepass', 'shirt', 'pants'));`;
    } catch (e) {}

    await sql`
      CREATE TABLE IF NOT EXISTS leagues (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        icon_url TEXT,
        join_link TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('[Setup] leagues table created');

    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        league_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        logo_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('[Setup] teams table created');

    await sql`
      CREATE TABLE IF NOT EXISTS team_kits (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        roblox_id BIGINT,
        price INTEGER,
        thumbnail_url TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('[Setup] team_kits table created');

    return NextResponse.json({ ok: true, message: 'All tables ready' });
  } catch (error) {
    console.error('[Setup] Error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
