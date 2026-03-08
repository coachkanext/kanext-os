/**
 * Global Footer Swipe — Bridges footer swipe gestures with navigation.
 *
 * A module-level flag tells the Stack navigator to use 'slide_from_right'
 * animation for swipe-triggered navigation, while taps stay instant ('none').
 *
 * For pop operations (going back), the flag must trigger a re-render in all
 * Stack navigators BEFORE the navigation executes, so the closing screen's
 * animation option is updated from 'none' to 'slide_from_right'.
 */

/** When true, next navigation uses native slide animation */
let _useSlideAnimation = false;

/** Navigation callbacks registered by _layout.tsx */
let _onBack: (() => void) | null = null;
let _onForward: (() => void) | null = null;

/** Force-rerender callbacks registered by Stack layouts */
let _rerenderCallbacks: (() => void)[] = [];

/** Check if the next navigation should use slide animation */
export function shouldUseSlideAnimation(): boolean {
  return _useSlideAnimation;
}

/**
 * Register a force-rerender callback from a Stack layout.
 * Called by each Stack's layout to ensure screenOptions re-evaluates
 * before a swipe navigation executes.
 */
export function registerAnimRerender(cb: () => void): () => void {
  _rerenderCallbacks.push(cb);
  return () => {
    _rerenderCallbacks = _rerenderCallbacks.filter(c => c !== cb);
  };
}

/** Enable slide animation for the next navigation (called before navigating) */
export function enableSlideAnimation() {
  _useSlideAnimation = true;
  // Force all registered Stack layouts to re-render with updated animation
  _rerenderCallbacks.forEach(cb => cb());
  // Auto-reset after the transition completes
  setTimeout(() => { _useSlideAnimation = false; }, 600);
}

/** Layout registers navigation handlers so footer can trigger them */
export function setSwipeCallbacks(cbs: { onBack: () => void; onForward: () => void }) {
  _onBack = cbs.onBack;
  _onForward = cbs.onForward;
}

/** Fire the back callback — delays navigation one frame so re-render applies first */
export function fireSwipeBack() {
  enableSlideAnimation();
  requestAnimationFrame(() => {
    _onBack?.();
  });
}

/** Fire the forward callback — delays navigation one frame so re-render applies first */
export function fireSwipeForward() {
  enableSlideAnimation();
  requestAnimationFrame(() => {
    _onForward?.();
  });
}
