/**
 * Global Split Nexus Controller — singleton open/close handlers.
 * Triggered from Nexus double-tap (toggle).
 * Locks footer visible while split is open.
 */

import { lockFooter, unlockFooter } from '@/utils/global-footer-hide';

let _open: (() => void) | null = null;
let _close: (() => void) | null = null;
let _isOpen = false;

export function registerSplitNexusHandlers(
  open: () => void,
  close: () => void,
) {
  _open = open;
  _close = close;
}

export function openSplitNexus() {
  _isOpen = true;
  lockFooter();
  _open?.();
}

export function closeSplitNexus() {
  _isOpen = false;
  unlockFooter();
  _close?.();
}

export function isSplitNexusOpen(): boolean {
  return _isOpen;
}

let _pendingQuery: string | null = null;

export function setSplitNexusPendingQuery(query: string): void {
  _pendingQuery = query;
}

export function consumeSplitNexusPendingQuery(): string | null {
  const q = _pendingQuery;
  _pendingQuery = null;
  return q;
}
