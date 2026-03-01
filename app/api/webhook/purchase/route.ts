import { NextResponse } from 'next/server';

interface PurchaseData {
  userId: string;
  username: string;
  avatar: string;
  itemName: string;
  itemPrice: string;
  itemLink: string;
  itemIcon: string;
}

export async function POST(request: Request) {
  try {
    const data: PurchaseData = await request.json();
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const embed = {
      title: '🛒 New Purchase!',
      description: `A user just made a purchase!`,
      color: 0x81A7FA,
      fields: [
        {
          name: '👤 Buyer',
          value: `**${data.username}**`,
          inline: true,
        },
        {
          name: '👕 Item Name',
          value: `\`${data.itemName}\``,
          inline: true,
        },
        {
          name: '💰 Price',
          value: `\`${data.itemPrice}\``,
          inline: true,
        },
        {
          name: '🔗 Item Link',
          value: `[Click Here](${data.itemLink})`,
          inline: false,
        },
      ],
      thumbnail: data.itemIcon ? {
        url: data.itemIcon,
      } : undefined,
      footer: {
        text: '7B STORE',
        icon_url: 'https://i.imgur.com/4ausQA1.png',
      },
      timestamp: new Date().toISOString(),
    };

    const payload = {
      username: '7B STORE',
      avatar_url: 'https://i.imgur.com/4ausQA1.png',
      embeds: [embed],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook failed:', await response.text());
      return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
