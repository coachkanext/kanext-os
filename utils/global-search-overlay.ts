/**
 * Global Search Overlay Controller — singleton open/close handlers.
 * Triggered from Nexus tab long-press.
 */

let _open: (() => void) | null = null;
let _close: (() => void) | null = null;

export function registerSearchOverlayHandlers(
  open: () => void,
  close: () => void,
) {
  _open = open;
  _close = close;
}

export function openSearchOverlay() {
  _open?.();
}

export function closeSearchOverlay() {
  _close?.();
}
