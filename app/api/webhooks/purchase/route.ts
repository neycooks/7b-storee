import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

function getDiscordUser(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/discord_user=([^;]+)/);
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return null;
    }
  }
  return null;
}

async function sendPurchaseWebhook(
  type: 'clothing' | 'gamepass' | 'league',
  item: {
    id?: number;
    name: string;
    price?: number | null;
    link?: string;
    thumbnail_url?: string | null;
    icon?: string | null;
  },
  user: { username?: string; avatar?: string } | null,
  leagueInfo?: { leagueName?: string; teamName?: string }
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('[PurchaseWebhook] DISCORD_WEBHOOK_URL not set');
    return { success: false, error: 'Webhook not configured' };
  }

  const themeColor = 0x81A7FA;
  const itemIcon = item.thumbnail_url || item.icon || '';
  const itemPrice = item.price ?? 0;
  const itemLink = item.link || '#';
  const userDisplay = user?.username || 'Guest';

  let title = '';
  let description = '';

  switch (type) {
    case 'clothing':
      title = '👕 Clothing Clicked!';
      description = `**${userDisplay}** clicked on clothing item`;
      break;
    case 'gamepass':
      title = '🎮 Gamepass Clicked!';
      description = `**${userDisplay}** clicked on gamepass`;
      break;
    case 'league':
      title = '🏆 League Kit Clicked!';
      description = `**${userDisplay}** clicked on league kit`;
      break;
  }

  const fields = [
    {
      name: '📦 Item Name',
      value: `\`\`\`\n${item.name}\n\`\`\``,
      inline: false
    },
    {
      name: '💰 Price',
      value: itemPrice === 0 ? '`Free`' : `\`${itemPrice}R\$\``,
      inline: true
    },
    {
      name: '👤 User',
      value: user ? `**${user.username}**` : '`Guest`',
      inline: true
    }
  ];

  if (type === 'league' && leagueInfo) {
    fields.push({
      name: '⚽ League',
      value: `\`${leagueInfo.leagueName || 'N/A'}\``,
      inline: true
    });
    fields.push({
      name: '👥 Team',
      value: `\`${leagueInfo.teamName || 'N/A'}\``,
      inline: true
    });
  }

  const payload = {
    embeds: [
      {
        title: title,
        description: description,
        color: themeColor,
        thumbnail: itemIcon ? { url: itemIcon } : undefined,
        fields: fields,
        footer: {
          text: '7B STORE • Click Notification',
          icon_url: 'https://i.imgur.com/4ausQA1.png'
        },
        timestamp: new Date().toISOString()
      }
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: '👀 See Item',
            url: itemLink
          },
          {
            type: 2,
            style: 5,
            label: '📊 Check Sales',
            url: 'https://www.roblox.com/communities/configure?id=35515756#!/revenue/sales'
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('[PurchaseWebhook] Sent successfully for', type, item.name);
      return { success: true };
    } else {
      const error = await response.text();
      console.error('[PurchaseWebhook] Failed:', response.status, error);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('[PurchaseWebhook] Error:', error);
    return { success: false, error: String(error) };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, item, leagueInfo } = body;

    if (!type || !item) {
      return NextResponse.json({ error: 'Missing type or item' }, { status: 400 });
    }

    const validTypes = ['clothing', 'gamepass', 'league'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const user = getDiscordUser(req);

    console.log('[PurchaseWebhook] Processing click:', type, item.name, user?.username || 'Guest');

    const result = await sendPurchaseWebhook(type, item, user, leagueInfo);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[PurchaseWebhook] Error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
