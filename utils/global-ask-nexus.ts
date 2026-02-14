/**
 * Global Ask Nexus Controller
 * Module-level state to open/close Ask Nexus from anywhere.
 * Same pattern as global-drawer.ts / global-voice.ts.
 */

import type { AskNexusContext } from '@/data/mock-ask-nexus';

let _open: ((context?: AskNexusContext) => void) | null = null;
let _close: (() => void) | null = null;

export function registerAskNexusHandlers(
  open: (context?: AskNexusContext) => void,
  close: () => void,
) {
  _open = open;
  _close = close;
}

export function openAskNexus(context?: AskNexusContext) {
  _open?.(context);
}

export function closeAskNexus() {
  _close?.();
}
