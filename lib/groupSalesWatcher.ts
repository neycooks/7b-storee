'server-only';

const GROUP_ID = '35515756';
const API_URL = `https://economy.roblox.com/v2/groups/${GROUP_ID}/transactions?limit=25&sortOrder=Asc&transactionType=Sale&cursor=`;

let lastTransactionId: string | null = null;
let warnedAboutCookie = false;
let warnedAboutWebhook = false;

async function pollOnce(): Promise<void> {
  const cookie = process.env.ROBLOX_SECURITY_COOKIE;
  
  if (!cookie && !warnedAboutCookie) {
    console.warn('[GroupSalesWatcher] ROBLOX_SECURITY_COOKIE not set. Request may be rate-limited.');
    warnedAboutCookie = true;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (cookie) {
    headers['Cookie'] = `.ROBLOSECURITY=${cookie}`;
  }

  try {
    const response = await fetch(API_URL, { headers });
    
    if (!response.ok) {
      console.error(`[GroupSalesWatcher] Failed to fetch transactions: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.data)) {
      return;
    }

    const transactions = data.data;

    if (lastTransactionId === null) {
      if (transactions.length > 0) {
        const newestTransaction = transactions[transactions.length - 1];
        lastTransactionId = newestTransaction.id;
        console.log(`[GroupSalesWatcher] Initialized with latest transaction ID: ${lastTransactionId}`);
      }
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

    if (newTransactions.length === 0) {
      return;
    }

    for (const sale of newTransactions) {
      await sendDiscordWebhookForSale(sale);
    }

    const latestTransaction = transactions[transactions.length - 1];
    lastTransactionId = latestTransaction.id;
    
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

  const buyerName = sale.agent?.name || sale.user?.username || 'Unknown';
  const itemName = sale.product?.name || sale.item?.name || 'Unknown Item';
  const price = sale.currency?.amount || sale.price || 0;
  const timestamp = sale.createdAt || new Date().toISOString();

  const payload = {
    content: '**New group sale detected**',
    embeds: [
      {
        title: 'Item purchased',
        description: `${buyerName} bought **${itemName}** for ${price} Robux`,
        color: 5814783,
        timestamp: timestamp,
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

    if (response.ok) {
      console.log(`[GroupSalesWebhook] Sent webhook for sale: ${itemName} - ${price} Robux`);
    } else {
      console.error(`[GroupSalesWebhook] Failed to send webhook: ${response.status}`);
    }
  } catch (error) {
    console.error('[GroupSalesWebhook] Error sending webhook:', error);
  }
}

export function startGroupSalesWatcher(): void {
  const intervalMs = parseInt(process.env.POLL_INTERVAL_MS || '', 10);
  const pollInterval = isNaN(intervalMs) ? 30000 : intervalMs;

  console.log(`[GroupSalesWatcher] Starting watcher with poll interval: ${pollInterval}ms`);

  pollOnce();

  setInterval(() => {
    pollOnce();
  }, pollInterval);
}
