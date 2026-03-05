/**
 * Global Semi-Circle Controller
 * Tracks current tab so the semi-circle knows whether to navigate Home or Nexus.
 */

let _currentTab = '(main)';

export function setCurrentTab(tab: string) {
  _currentTab = tab;
}

export function getCurrentTab(): string {
  return _currentTab;
}
