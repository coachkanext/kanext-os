/**
 * Global Universal Finder Controller
 * Module-level state to open/close the Universal Finder from anywhere.
 * Same pattern as global-drawer.ts / global-voice.ts.
 */

let _open: (() => void) | null = null;
let _close: (() => void) | null = null;

export function registerFinderHandlers(open: () => void, close: () => void) {
  _open = open;
  _close = close;
}

export function openFinder() {
  _open?.();
}

export function closeFinder() {
  _close?.();
}
