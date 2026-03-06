/**
 * Global Split Nexus Controller — singleton open/close handlers.
 * Triggered from semi-circle swipe-right (toggle).
 */

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
  _open?.();
}

export function closeSplitNexus() {
  _isOpen = false;
  _close?.();
}

export function isSplitNexusOpen(): boolean {
  return _isOpen;
}
