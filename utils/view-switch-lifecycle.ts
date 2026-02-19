/**
 * View Switch Lifecycle
 * Pub/sub for view-switch events. Components register callbacks
 * to reset state (pager position, caches, etc.) when the active view changes.
 */

import type { ActiveView } from '@/types';

type ViewSwitchCallback = (newView: ActiveView, prevKey: string) => void;

const _callbacks = new Set<ViewSwitchCallback>();

/**
 * Called from setActiveView in app-context.
 * Fires all registered callbacks with the new view and previous key.
 */
export function notifyViewSwitch(newView: ActiveView, prevKey: string): void {
  for (const cb of _callbacks) {
    try {
      cb(newView, prevKey);
    } catch (e) {
      console.error('[view-switch-lifecycle] callback error:', e);
    }
  }
}

/**
 * Register a callback to be invoked on every view switch.
 * Returns an unsubscribe function.
 */
export function registerViewSwitchCallback(cb: ViewSwitchCallback): () => void {
  _callbacks.add(cb);
  return () => {
    _callbacks.delete(cb);
  };
}
