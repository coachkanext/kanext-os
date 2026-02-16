/**
 * Global More Menu Controller
 * Triggered by double-tap on Ops tab — opens the active screen's More overflow menu.
 */

let _openMore: (() => void) | null = null;
let _closeMore: (() => void) | null = null;

export function registerMoreHandlers(open: () => void, close: () => void) {
  _openMore = open;
  _closeMore = close;
}

export function unregisterMoreHandlers() {
  _openMore = null;
  _closeMore = null;
}

export function openGlobalMore() {
  _openMore?.();
}

export function closeGlobalMore() {
  _closeMore?.();
}
