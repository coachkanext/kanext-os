/**
 * Global Side Panel Controller
 * Singleton open/close API for the contextual right-side panel.
 * Same pattern as global-settings-panel.ts.
 */

let _openPanel: (() => void) | null = null;
let _closePanel: (() => void) | null = null;
let _isOpen = false;

export function registerSidePanelHandlers(open: () => void, close: () => void) {
  _openPanel = open;
  _closePanel = close;
}

export function openSidePanel() {
  _openPanel?.();
  _isOpen = true;
}

export function closeSidePanel() {
  _closePanel?.();
  _isOpen = false;
}

export function isSidePanelOpen() {
  return _isOpen;
}
