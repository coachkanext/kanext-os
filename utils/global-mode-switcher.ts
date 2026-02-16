/**
 * Global Mode Switcher Controller
 * Triggered by long-press on Ops tab — shows mode picker popup above tab bar.
 */

let _openSwitcher: (() => void) | null = null;
let _closeSwitcher: (() => void) | null = null;

export function registerModeSwitcherHandlers(open: () => void, close: () => void) {
  _openSwitcher = open;
  _closeSwitcher = close;
}

export function openModeSwitcher() {
  _openSwitcher?.();
}

export function closeModeSwitcher() {
  _closeSwitcher?.();
}
