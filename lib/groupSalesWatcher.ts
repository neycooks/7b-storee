'server-only';

const GROUP_ID = '35515756';
const API_URL = `https://economy.roblox.com/v2/groups/${GROUP_ID}/transactions?limit=25&sortOrder=Desc&transactionType=Sale&cursor=`;

let lastTransactionId: string | null = null;
let warnedAboutCookie = false;
let warnedAboutWebhook = false;

async function pollGroupSalesOnce(): Promise<void> {
  const cookie = process.env.ROBLOX_SECURITY_COOKIE;
  
  if (!cookie && !warnedAboutCookie) {
    console.warn('[GroupSalesWatcher] ROBLOX_SECURITY_COOKIE not set. Request may be rate-limited.');
    warnedAboutCookie = true;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  if (cookie) {
    headers['Cookie'] = `.ROBLOSECURITY=${cookie}`;
  }

  try {
    console.log('[GroupSalesWatcher] Calling Roblox API for group 35515756');
    const response = await fetch(API_URL, { headers });
    
    console.log('[GroupSalesWatcher] Roblox API status:', response.status);

    if (response.status === 401 || response.status === 403) {
      console.warn('[GroupSalesWatcher] 401/403 - .ROBLOSECURITY cookie may be invalid or not allowed for this group.');
      return;
    }

    if (response.status === 429) {
      console.warn('[GroupSalesWatcher] Rate limited (429). Skipping this poll.');
      return;
    }

    if (!response.ok) {
      console.error(`[GroupSalesWatcher] Failed to fetch transactions: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.data)) {
      console.log('[GroupSalesWatcher] Transactions count: no data array');
      console.log('[GroupSalesWatcher] Response keys:', Object.keys(data || {}));
      return;
    }

    const transactions = data.data;
    console.log('[GroupSalesWatcher] Transactions count:', transactions.length);

    if (transactions.length === 0) {
      return;
    }

    if (lastTransactionId === null) {
      const newestTransaction = transactions[0];
      lastTransactionId = newestTransaction.id;
      console.log(`[GroupSalesWatcher] Initialized with latest transaction ID: ${lastTransactionId}`);
      return;
    }

    const newTransactions: typeof transactions = [];
    
    for (const transaction of transactions) {
      if (transaction.id !== lastTransactionId) {
        newTransactions.push(transaction);
      } else {
        break;
      }
    }

    console.log('[GroupSalesWatcher] New transactions found:', newTransactions.length);

    if (newTransactions.length === 0) {
      return;
    }

    for (const sale of newTransactions) {
      await sendDiscordWebhookForSale(sale);
    }

    if (transactions.length > 0) {
      lastTransactionId = transactions[0].id;
    }
    
  } catch (error) {
    console.error('[GroupSalesWatcher] Error polling transactions:', error);
  }
}

async function sendDiscordWebhookForSale(sale: any): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    if (!warnedAboutWebhook) {
      console.warn('[GroupSalesWatcher] DISCORD_WEBHOOK_URL not set. Skipping webhook.');
      warnedAboutWebhook = true;
    }
    return;
  }

  const transactionId = sale.id || 'unknown';
  const buyerName = sale.agent?.name || sale.user?.name || sale.user?.username || sale.agent?.username || 'Unknown';
  const itemName = sale.product?.name || sale.item?.name || sale.name || 'Unknown Item';
  const price = sale.currency?.amount || sale.price || sale.amount || 0;
  const timestamp = sale.createdAt || new Date().toISOString();

  console.log('[GroupSalesWebhook] Sending webhook for sale:', transactionId);

  const payload = {
    content: '**New group sale detected**',
    embeds: [
      {
        title: 'Item purchased',
        description: `${buyerName} bought **${itemName}** for ${price} Robux`,
        color: 5814783,
        timestamp: timestamp,
        fields: [
          {
            name: 'Transaction ID',
            value: transactionId,
            inline: true
          }
        ]
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[GroupSalesWebhook] Discord response status:', response.status);

    if (response.ok) {
      console.log(`[GroupSalesWebhook] Sent Discord webhook for sale ${transactionId}`);
    } else {
      console.error('[GroupSalesWebhook] Failed to send webhook:', response.status);
    }
  } catch (error) {
    console.error('[GroupSalesWebhook] Failed to send webhook:', error);
  }
}

export { pollGroupSalesOnce };
