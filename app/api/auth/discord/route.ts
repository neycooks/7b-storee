import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI || 'https://7b-store.vercel.app/api/auth/discord/callback');
  
  if (!clientId) {
    return NextResponse.json({ error: 'Discord client not configured' }, { status: 500 });
  }

  const scope = encodeURIComponent('identify');
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}
