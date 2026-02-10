/**
 * Global KX Transition Controller
 * Module-level state to trigger the KX micro-flash from anywhere.
 * Follows the same pattern as global-drawer.ts.
 */

let _triggerHandler: (() => void) | null = null;
let _enabled = true;

export function registerTransitionHandler(trigger: () => void) {
  _triggerHandler = trigger;
}

export function triggerKXTransition() {
  if (_enabled) {
    _triggerHandler?.();
  }
}

export function setTransitionEnabled(enabled: boolean) {
  _enabled = enabled;
}
