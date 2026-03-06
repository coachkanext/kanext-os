/**
 * Global Semi-Circle Controller
 * Tracks current tab so the footer can highlight active icons.
 * Set-based listener registry for tab change notifications.
 */

let _currentTab = '(main)';
const _listeners = new Set<(tab: string) => void>();

export function setCurrentTab(tab: string) {
  _currentTab = tab;
  _listeners.forEach((cb) => cb(tab));
}

export function getCurrentTab(): string {
  return _currentTab;
}

export function subscribeCurrentTab(callback: (tab: string) => void): () => void {
  _listeners.add(callback);
  return () => {
    _listeners.delete(callback);
  };
}
