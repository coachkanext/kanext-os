/**
 * Global Dipson Half-Sheet Controller
 * Singleton open API — sidebar panels call openDipsonSheet() after closing.
 * Same pattern as global-side-panel.ts.
 */

type OpenFn = (context?: string) => void;
let _open: OpenFn | null = null;

export function registerDipsonSheet(fn: OpenFn) {
  _open = fn;
}

export function openDipsonSheet(context = '') {
  _open?.(context);
}
