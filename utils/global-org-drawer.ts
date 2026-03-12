/**
 * Global Org Drawer Controller
 * Singleton open/close API for the org drawer bottom sheet.
 */

let _openDrawer: (() => void) | null = null;
let _closeDrawer: (() => void) | null = null;

export function registerOrgDrawerHandlers(open: () => void, close: () => void) {
  _openDrawer = open;
  _closeDrawer = close;
}

export function openOrgDrawer() {
  _openDrawer?.();
}

export function closeOrgDrawer() {
  _closeDrawer?.();
}
