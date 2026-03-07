/**
 * Global Footer Hide Controller
 * Pub-sub for scroll-driven footer hiding (X/Twitter pattern).
 * Screens call hideFooter()/showFooter() on scroll direction change.
 * UniversalFooter subscribes and animates translateY.
 */

let _visible = true;
const _listeners = new Set<(visible: boolean) => void>();

export function hideFooter() {
  if (!_visible) return;
  _visible = false;
  _listeners.forEach((cb) => cb(false));
}

export function showFooter() {
  if (_visible) return;
  _visible = true;
  _listeners.forEach((cb) => cb(true));
}

/** Force-show footer (called on screen transitions). */
export function resetFooter() {
  _visible = true;
  _listeners.forEach((cb) => cb(true));
}

export function subscribeFooterVisibility(
  callback: (visible: boolean) => void,
): () => void {
  _listeners.add(callback);
  return () => {
    _listeners.delete(callback);
  };
}
