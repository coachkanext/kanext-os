/**
 * Global Voice Controller
 * Module-level state to trigger voice overlay from anywhere (e.g. Nexus tab long-press).
 * Same pattern as global-drawer.ts.
 */

let _startVoice: (() => void) | null = null;
let _stopVoice: (() => void) | null = null;

export function registerVoiceHandlers(start: () => void, stop: () => void) {
  _startVoice = start;
  _stopVoice = stop;
}

export function startGlobalVoice() {
  _startVoice?.();
}

export function stopGlobalVoice() {
  _stopVoice?.();
}
