import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

export const revalidate = 0;

async function getThumbnails(assetIds: number[]): Promise<Record<number, string>> {
  const thumbnailMap: Record<number, string> = {};
  
  for (let i = 0; i < assetIds.length; i += 100) {
    const batch = assetIds.slice(i, i + 100);
    const idsString = batch.join(',');
    const url = `https://thumbnails.roblox.com/v1/assets?assetIds=${idsString}&returnPolicy=PlaceHolder&size=150x150&format=Png&aspectRatio=1x1`;
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          for (const thumb of data.data) {
            thumbnailMap[thumb.targetId] = thumb.imageUrl || '';
          }
        }
      }
    } catch (error) {
      console.error('Thumbnail error:', error);
    }
  }
  
  return thumbnailMap;
}

export async function GET() {
  try {
    console.log('[Sync] Starting clothing sync...');
    
    // Read JSON file
    const filePath = path.join(process.cwd(), 'app', 'newcloth.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    const items = jsonData.items;
    
    console.log('[Sync] Total items to sync:', items.length);
    
    // Get all roblox_ids
    const robloxIds = items.map((item: any) => parseInt(item.roblox_id));
    
    // Fetch thumbnails
    console.log('[Sync] Fetching thumbnails for', robloxIds.length, 'items...');
    const thumbnails = await getThumbnails(robloxIds);
    console.log('[Sync] Got', Object.keys(thumbnails).length, 'thumbnails');
    
    // Delete existing clothing items (not gamepass)
    console.log('[Sync] Deleting existing clothing items...');
    await sql`DELETE FROM shop_items WHERE type IN ('item', 'shirt', 'pants')`;
    
    // Insert new items
    console.log('[Sync] Inserting new items...');
    let inserted = 0;
    
    for (const item of items) {
      const robloxId = parseInt(item.roblox_id);
      const name = item.name || `Item ${item.roblox_id}`;
      const price = typeof item.price === 'number' ? item.price : null;
      const link = item.link || `https://www.roblox.com/catalog/${item.roblox_id}`;
      const thumbnailUrl = thumbnails[robloxId] || null;
      
      await sql`
        INSERT INTO shop_items (roblox_id, name, price, link, thumbnail_url, type)
        VALUES (${robloxId}, ${name}, ${price}, ${link}, ${thumbnailUrl}, 'item')
      `;
      inserted++;
      
      if (inserted % 100 === 0) {
        console.log('[Sync] Inserted', inserted, 'items...');
      }
    }
    
    console.log('[Sync] Done! Total inserted:', inserted);
    
    return NextResponse.json({ 
      ok: true, 
      message: `Synced ${inserted} clothing items`,
      inserted 
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    return NextResponse.json({ error: 'Sync failed', details: String(error) }, { status: 500 });
  }
}
