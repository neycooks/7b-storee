'server-only';

import { startGroupSalesWatcher } from './groupSalesWatcher';

let started = false;

export function initBackgroundJobs() {
  if (!started) {
    started = true;
    startGroupSalesWatcher();
  }
}
