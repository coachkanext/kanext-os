/**
 * Context Switch Broadcast
 * Lightweight pub/sub so switchContext() can force a home re-render
 * regardless of React Compiler memoization behavior.
 */

let _cb: (() => void) | null = null;

/** Called from switchContext in app-context.tsx after dispatch */
export function notifyContextSwitch(): void {
  _cb?.();
}

/** Register / unregister the listener (home screen) */
export function registerContextSwitchListener(cb: (() => void) | null): void {
  _cb = cb;
}
