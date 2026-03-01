'server-only';

const GROUP_ID = '35515756';
const API_URL = `https://economy.roblox.com/v2/groups/${GROUP_ID}/transactions?limit=25&sortOrder=Desc&transactionType=Sale&cursor=`;

let lastTransactionId: string | null = null;
let warnedAboutCookie = false;
let warnedAboutWebhook = false;
let hasLoggedSample = false;
let initialized = false;

async function pollOnce(): Promise<void> {
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
    console.log('[GroupSalesWatcher] Polling for transactions...');
    const response = await fetch(API_URL, { headers });
    
    console.log(`[GroupSalesWatcher] Response status: ${response.status} ${response.statusText}`);

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
    
    console.log('[GroupSalesWatcher] Response keys:', Object.keys(data));
    console.log('[GroupSalesWatcher] Is data.data array:', Array.isArray(data.data));

    if (!data || !Array.isArray(data.data)) {
      console.log('[GroupSalesWatcher] No transaction data found or unexpected structure.');
      return;
    }

    const transactions = data.data;
    console.log(`[GroupSalesWatcher] Transactions count: ${transactions.length}`);
    
    if (transactions.length > 0) {
      console.log('[GroupSalesWatcher] First transaction ID:', transactions[0].id);
      console.log('[GroupSalesWatcher] Last transaction ID:', transactions[transactions.length - 1].id);

      if (hasLoggedSample === false) {
        console.log('[GroupSalesWatcher] Sample transaction structure:');
        console.dir(transactions[0], { depth: 3 });
        hasLoggedSample = true;
      }
    }

    if (lastTransactionId === null) {
      if (transactions.length > 0) {
        const newestTransaction = transactions[0];
        lastTransactionId = newestTransaction.id;
        console.log(`[GroupSalesWatcher] Initialized with latest transaction ID: ${lastTransactionId}`);
        initialized = true;
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

    console.log(`[GroupSalesWatcher] New transactions found: ${newTransactions.length}`);

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

  console.log(`[GroupSalesWebhook] Processing sale - Buyer: ${buyerName}, Item: ${itemName}, Price: ${price}`);

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

    if (response.ok) {
      console.log(`[GroupSalesWebhook] Sent Discord webhook for sale ${transactionId}`);
    } else {
      console.error(`[GroupSalesWebhook] Failed to send webhook: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('[GroupSalesWebhook] Error sending webhook:', error);
  }
}

export function startGroupSalesWatcher(): void {
  console.log('[GroupSalesWatcher] Starting watcher for group 35515756');
  
  const intervalMs = parseInt(process.env.POLL_INTERVAL_MS || '', 10);
  const pollInterval = isNaN(intervalMs) ? 30000 : intervalMs;

  console.log(`[GroupSalesWatcher] Poll interval: ${pollInterval}ms`);

  pollOnce();

  setInterval(() => {
    pollOnce();
  }, pollInterval);
}
