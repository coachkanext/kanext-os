/**
 * Global Multitasking Controller
 * Handler registration for opening/closing the multitasking overlay.
 */

let _open: (() => void) | null = null;
let _close: (() => void) | null = null;

export function registerMultitaskingHandlers(open: () => void, close: () => void) {
  _open = open;
  _close = close;
}

export function openMultitasking() {
  _open?.();
}

export function closeMultitasking() {
  _close?.();
}
