/**
 * Global Footer Hide Controller
 * Pub-sub for scroll-driven footer hiding (X/Twitter pattern).
 * Screens call hideFooter()/showFooter() on scroll direction change.
 * UniversalFooter subscribes and animates translateY.
 *
 * `instant` flag: true = snap immediately (screen transitions),
 *                 false = animate (scroll-driven show/hide).
 *
 * `forceHideFooter()` / `releaseForceHide()`:
 *   Immersive screens (StatKeeper live) call forceHideFooter() to prevent
 *   resetFooter() (which fires on every route change) from re-showing the footer.
 */

let _visible = true;
let _locked = false;
let _forcedHidden = false;
const _listeners = new Set<(visible: boolean, instant: boolean) => void>();

/** Lock footer visible (e.g. split screen open). Scroll events are ignored. */
export function lockFooter() {
  _locked = true;
  if (!_visible) {
    _visible = true;
    _listeners.forEach((cb) => cb(true, true));
  }
}

/** Unlock footer so scroll events can hide it again. */
export function unlockFooter() {
  _locked = false;
}

export function hideFooter() {
  if (_locked || !_visible) return;
  _visible = false;
  _listeners.forEach((cb) => cb(false, false));
}

/**
 * Force-hide footer for immersive screens.
 * Bypasses lock; resetFooter() will not re-show while this is active.
 */
export function forceHideFooter() {
  _forcedHidden = true;
  _locked = false;
  _visible = false;
  _listeners.forEach((cb) => cb(false, true));
}

/** Release the force-hide so normal show/hide and resetFooter() work again. */
export function releaseForceHide() {
  _forcedHidden = false;
}

export function showFooter() {
  if (_visible) return;
  _visible = true;
  _listeners.forEach((cb) => cb(true, false));
}

/** Force-show footer instantly (called on screen transitions). Ignored if force-hidden. */
export function resetFooter() {
  if (_forcedHidden) return;
  _visible = true;
  _listeners.forEach((cb) => cb(true, true));
}

export function getFooterVisible(): boolean {
  return _visible;
}

export function subscribeFooterVisibility(
  callback: (visible: boolean, instant: boolean) => void,
): () => void {
  _listeners.add(callback);
  return () => {
    _listeners.delete(callback);
  };
}

// Keep old name as alias for existing callers
export { forceHideFooter as hideFooterInstant };
