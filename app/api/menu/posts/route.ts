import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 0;

const ALLOWED_CATEGORIES = ['gfx', 'shirts', 'logos', 'building', 'ugc', 'assets', 'lessons', 'edits', 'web'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, category, title, description, image_url, created_at
      FROM menu_posts
      WHERE category = ${category}
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({ posts: rows });
  } catch (error) {
    console.error('[Menu Posts] GET error:', error);
    return NextResponse.json({ posts: [], error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, title, description, image_url } = body;

    if (!category || !title || !description || !image_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO menu_posts (category, title, description, image_url)
      VALUES (${category}, ${title}, ${description}, ${image_url})
      RETURNING id, category, title, description, image_url, created_at;
    `;

    return NextResponse.json({ post: result[0], ok: true });
  } catch (error) {
    console.error('[Menu Posts] POST error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
