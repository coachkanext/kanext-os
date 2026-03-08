/**
 * Global inner (main) Stack navigation control.
 * Pops the inner Stack to home before dismissing Nexus,
 * so the underlying screen is always home (not a stale screen).
 *
 * Uses StackActions.popToTop() instead of CommonActions.reset
 * to preserve the existing home screen instance (no remount/black screen).
 */

import { router } from 'expo-router';

type PopCallback = () => void;
let _popCallback: PopCallback | null = null;

/** Called by (main) layout to register the pop handler */
export function registerInnerPopToTop(cb: PopCallback): () => void {
  _popCallback = cb;
  return () => { if (_popCallback === cb) _popCallback = null; };
}

/** Pop inner Stack to home (preserves home screen instance) */
export function popInnerToHome(): void {
  _popCallback?.();
}

/**
 * Push to Nexus from an inner Stack screen.
 * Just pushes directly — the dismiss handler (footer) handles
 * popping the inner Stack to home before dismissing Nexus.
 */
export function pushNexusFromInner(): void {
  router.push('/nexus' as any);
}
