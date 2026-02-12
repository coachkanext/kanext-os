/**
 * Global Home Reset
 * Flag + callback approach: TabFooter/HomeTab sets the flag, SportsHome
 * checks it on focus. If SportsHome is already focused, the registered
 * callback fires immediately so the PagerView resets without a re-focus.
 */

let _pendingHomeReset = false;
let _resetCallback: (() => void) | null = null;

/** Called from TabFooter / HomeTabButton when Home is pressed */
export function requestHomeReset() {
  _pendingHomeReset = true;
  if (_resetCallback) {
    _resetCallback();
    _pendingHomeReset = false; // consumed by callback
  }
}

/** Called from SportsHome on focus to check and consume the flag */
export function consumeHomeReset(): boolean {
  if (_pendingHomeReset) {
    _pendingHomeReset = false;
    return true;
  }
  return false;
}

/** Register / unregister the immediate-reset callback (SportsHome) */
export function registerHomeResetCallback(cb: (() => void) | null) {
  _resetCallback = cb;
}
