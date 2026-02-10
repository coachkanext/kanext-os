/**
 * Global Avatar Drawer Controller
 * Simple module-level state to control the avatar drawer from anywhere.
 */

let _openDrawer: (() => void) | null = null;
let _closeDrawer: (() => void) | null = null;

export function registerDrawerHandlers(open: () => void, close: () => void) {
  _openDrawer = open;
  _closeDrawer = close;
}

export function openAvatarDrawer() {
  _openDrawer?.();
}

export function closeAvatarDrawer() {
  _closeDrawer?.();
}
