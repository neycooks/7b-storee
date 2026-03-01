import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      console.error('Discord callback: Missing code');
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://7b-store.vercel.app/api/auth/discord/callback';

    if (!clientId || !clientSecret) {
      console.error('Discord callback: Missing env vars', { clientId: !!clientId, clientSecret: !!clientSecret });
      return NextResponse.redirect(new URL('/?error=discord_not_configured', request.url));
    }

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Discord callback: Token exchange failed', { status: tokenResponse.status, body: errorText });
      return NextResponse.redirect(new URL('/?error=token_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token || !tokenData.token_type) {
      console.error('Discord callback: Invalid token response', tokenData);
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }

    const accessToken = tokenData.access_token;
    const tokenType = tokenData.token_type;

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Discord callback: User fetch failed', { status: userResponse.status, body: errorText });
      return NextResponse.redirect(new URL('/?error=user_fetch_failed', request.url));
    }

    const user = await userResponse.json();

    if (!user.id || !user.username) {
      console.error('Discord callback: Invalid user response', user);
      return NextResponse.redirect(new URL('/?error=invalid_user', request.url));
    }

    const discordUser = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      global_name: user.global_name || user.username,
    };

    const response = NextResponse.redirect(new URL('/products?logged_in=true', request.url));
    
    response.cookies.set('discord_user', JSON.stringify(discordUser), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Discord callback: Unexpected error', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }
}
