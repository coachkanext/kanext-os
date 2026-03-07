/**
 * Global Footer Hide Controller
 * Pub-sub for scroll-driven footer hiding (X/Twitter pattern).
 * Screens call hideFooter()/showFooter() on scroll direction change.
 * UniversalFooter subscribes and animates translateY.
 *
 * `instant` flag: true = snap immediately (screen transitions),
 *                 false = animate (scroll-driven show/hide).
 */

let _visible = true;
const _listeners = new Set<(visible: boolean, instant: boolean) => void>();

export function hideFooter() {
  if (!_visible) return;
  _visible = false;
  _listeners.forEach((cb) => cb(false, false));
}

export function showFooter() {
  if (_visible) return;
  _visible = true;
  _listeners.forEach((cb) => cb(true, false));
}

/** Force-show footer instantly (called on screen transitions). */
export function resetFooter() {
  _visible = true;
  _listeners.forEach((cb) => cb(true, true));
}

export function subscribeFooterVisibility(
  callback: (visible: boolean, instant: boolean) => void,
): () => void {
  _listeners.add(callback);
  return () => {
    _listeners.delete(callback);
  };
}
