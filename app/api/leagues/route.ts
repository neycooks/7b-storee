import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM leagues ORDER BY created_at DESC;`;
    return NextResponse.json({ leagues: rows });
  } catch (error) {
    return NextResponse.json({ leagues: [] });
  }
}
