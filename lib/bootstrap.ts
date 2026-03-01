'server-only';

import { startGroupSalesWatcher } from './groupSalesWatcher';

let started = false;

export function initBackgroundJobs() {
  console.log('[Bootstrap] initBackgroundJobs called');
  if (!started) {
    started = true;
    startGroupSalesWatcher();
  }
}
