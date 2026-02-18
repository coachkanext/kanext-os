/**
 * Global Organization Reset
 * Same flag + callback pattern as global-home.ts.
 * OpsTabButton sets the flag; the active Organization mode component
 * checks it on focus or fires immediately if already focused.
 */

let _pendingOrgReset = false;
let _resetCallback: (() => void) | null = null;

/** Called from OpsTabButton when Organization tab is pressed */
export function requestOrgReset() {
  _pendingOrgReset = true;
  if (_resetCallback) {
    _resetCallback();
    _pendingOrgReset = false;
  }
}

/** Called from Organization screen on focus to check and consume the flag */
export function consumeOrgReset(): boolean {
  if (_pendingOrgReset) {
    _pendingOrgReset = false;
    return true;
  }
  return false;
}

/** Register / unregister the immediate-reset callback */
export function registerOrgResetCallback(cb: (() => void) | null) {
  _resetCallback = cb;
}
