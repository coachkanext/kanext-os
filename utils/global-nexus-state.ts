/**
 * Global Nexus Logo State
 * Lightweight pub-sub for the 3-state logo: home | screen | nexus.
 * Called from layout files on navigation changes.
 */

export type NexusLogoState = 'home' | 'screen' | 'nexus' | 'hidden';

let _state: NexusLogoState = 'home';
const _listeners = new Set<(state: NexusLogoState) => void>();

export function setNexusLogoState(state: NexusLogoState) {
  if (_state === state) return;
  _state = state;
  _listeners.forEach((cb) => cb(state));
}

export function getNexusLogoState(): NexusLogoState {
  return _state;
}

export function subscribeNexusLogoState(
  callback: (state: NexusLogoState) => void,
): () => void {
  _listeners.add(callback);
  return () => {
    _listeners.delete(callback);
  };
}
