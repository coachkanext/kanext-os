/**
 * Global profile sheet — open from anywhere in the app.
 * openProfileSheet(info) → shows the universal profile bottom sheet.
 */

import type { Mode } from '@/types';

export interface ProfileSheetInfo {
  name: string;
  handle?: string;
  role?: string;
  brand?: string;      // org / team name
  initials: string;
  avatarUri?: string;
  phone?: string;
  email?: string;
  mode?: Mode;
}

type Listener = (info: ProfileSheetInfo | null) => void;

let _info: ProfileSheetInfo | null = null;
const _listeners = new Set<Listener>();

function _notify() { _listeners.forEach(cb => cb(_info)); }

export function openProfileSheet(info: ProfileSheetInfo) {
  _info = info;
  _notify();
}

export function closeProfileSheet() {
  _info = null;
  _notify();
}

export function subscribeProfileSheet(cb: Listener): () => void {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}
