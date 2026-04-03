/**
 * Global Demo/Live Mode — module-level state shared across the entire app.
 *
 * "demo" = investor RBAC demo with role cycling
 * "live" = real brands, public/lowest-access view, no role pill
 *
 * Usage:
 *   const dataMode = useDataMode();           // reactive
 *   setDataMode('live');                      // set from anywhere
 */

import { useState, useEffect } from 'react';

let _mode: 'demo' | 'live' = 'demo';
const _listeners: Set<() => void> = new Set();

export function getDataMode(): 'demo' | 'live' {
  return _mode;
}

export function setDataMode(mode: 'demo' | 'live'): void {
  _mode = mode;
  _listeners.forEach(fn => fn());
}

/** Reactive hook — re-renders component when mode changes */
export function useDataMode(): 'demo' | 'live' {
  const [mode, setMode] = useState<'demo' | 'live'>(() => getDataMode());

  useEffect(() => {
    const fn = () => setMode(getDataMode());
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  return mode;
}
