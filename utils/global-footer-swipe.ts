/**
 * Global Footer Swipe — Bridges footer swipe gestures with navigation.
 *
 * A module-level flag tells the Stack navigator to use 'slide_from_right'
 * animation for swipe-triggered navigation, while taps stay instant ('none').
 */

/** When true, next navigation uses native slide animation */
let _useSlideAnimation = false;

/** Navigation callbacks registered by _layout.tsx */
let _onBack: (() => void) | null = null;
let _onForward: (() => void) | null = null;

/** Check if the next navigation should use slide animation */
export function shouldUseSlideAnimation(): boolean {
  return _useSlideAnimation;
}

/** Enable slide animation for the next navigation (called by footer before navigating) */
export function enableSlideAnimation() {
  _useSlideAnimation = true;
  // Auto-reset after the transition completes
  setTimeout(() => { _useSlideAnimation = false; }, 600);
}

/** Layout registers navigation handlers so footer can trigger them */
export function setSwipeCallbacks(cbs: { onBack: () => void; onForward: () => void }) {
  _onBack = cbs.onBack;
  _onForward = cbs.onForward;
}

/** Fire the back callback */
export function fireSwipeBack() {
  enableSlideAnimation();
  _onBack?.();
}

/** Fire the forward callback */
export function fireSwipeForward() {
  enableSlideAnimation();
  _onForward?.();
}
