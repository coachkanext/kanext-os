/**
 * Global Split Nexus Controller — singleton open/close handlers.
 * Triggered from Nexus tab double-tap.
 */

let _open: (() => void) | null = null;
let _close: (() => void) | null = null;

export function registerSplitNexusHandlers(
  open: () => void,
  close: () => void,
) {
  _open = open;
  _close = close;
}

export function openSplitNexus() {
  _open?.();
}

export function closeSplitNexus() {
  _close?.();
}

export function isSplitNexusOpen(): boolean {
  return false; // Stateless — actual state lives in the overlay component
}
