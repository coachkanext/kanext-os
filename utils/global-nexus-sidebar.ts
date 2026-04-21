/**
 * Global Nexus Sidebar Controller
 * Notifies _layout.tsx to push the footer when the Nexus sidebar opens/closes.
 * Same pattern as global-side-panel.ts.
 */

let _onOpen: (() => void) | null = null;
let _onClose: (() => void) | null = null;

export function registerNexusSidebarHandlers(onOpen: () => void, onClose: () => void) {
  _onOpen = onOpen;
  _onClose = onClose;
}

export function notifyNexusSidebarOpen() { _onOpen?.(); }
export function notifyNexusSidebarClose() { _onClose?.(); }
