/**
 * Global Settings Panel Controller
 * Singleton open/close API for the X/Twitter-style side panel on Home.
 */

let _openPanel: (() => void) | null = null;
let _closePanel: (() => void) | null = null;
let _isOpen = false;

export function registerSettingsPanelHandlers(open: () => void, close: () => void) {
  _openPanel = open;
  _closePanel = close;
}

export function openSettingsPanel() {
  _openPanel?.();
  _isOpen = true;
}

export function closeSettingsPanel() {
  _closePanel?.();
  _isOpen = false;
}

export function isSettingsPanelOpen() {
  return _isOpen;
}
