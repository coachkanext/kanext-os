/**
 * Global call controller — pub-sub for initiating and managing VoIP calls.
 * Supports one active call + one held call (swap / merge).
 * Video calls support multi-participant group with per-participant ringing state.
 */

import type { Mode } from '@/types';

export type CallType = 'audio' | 'video';
export type CallState = 'ringing' | 'connected' | 'ended';
export type ParticipantState = 'ringing' | 'connected' | 'declined';

export interface CallInfo {
  contactName: string;
  contactInitials: string;
  mode: Mode;
  type: CallType;
}

export interface CallParticipant {
  contactName: string;
  contactInitials: string;
  mode: Mode;
  state: ParticipantState;
}

export interface ActiveCall extends CallInfo {
  state: CallState;
  startedAt: number;
  minimized: boolean;
  participants?: CallParticipant[];
}

export interface DeclineInfo {
  contactName: string;
}

type CallListener = (call: ActiveCall | null) => void;
type DeclineListener = (info: DeclineInfo) => void;

let _activeCall: ActiveCall | null = null;
let _heldCall: ActiveCall | null = null;

const _listeners = new Set<CallListener>();
const _heldListeners = new Set<CallListener>();
const _declineListeners = new Set<DeclineListener>();

function _notify() { _listeners.forEach(cb => cb(_activeCall)); }
function _notifyHeld() { _heldListeners.forEach(cb => cb(_heldCall)); }
function _notifyDecline(info: DeclineInfo) { _declineListeners.forEach(cb => cb(info)); }

export function initiateCall(info: CallInfo) {
  _activeCall = { ...info, state: 'ringing', startedAt: Date.now(), minimized: false };
  _notify();
  setTimeout(() => {
    if (_activeCall && _activeCall.state === 'ringing') {
      _activeCall = { ..._activeCall, state: 'connected' };
      _notify();
    }
  }, 2000);
}

/**
 * Audio: put current call on hold, start new active call (swap/merge pattern).
 * Video: add directly as a group participant with ringing state.
 */
export function addToCall(info: CallInfo) {
  if (!_activeCall) { initiateCall(info); return; }

  if (_activeCall.type === 'video') {
    // Video group — add as ringing participant, no hold
    addVideoParticipant({ contactName: info.contactName, contactInitials: info.contactInitials, mode: info.mode });
  } else {
    // Audio — hold current, start new
    _heldCall = { ..._activeCall };
    _notifyHeld();
    _activeCall = { ...info, state: 'ringing', startedAt: Date.now(), minimized: false };
    _notify();
    setTimeout(() => {
      if (_activeCall && _activeCall.state === 'ringing') {
        _activeCall = { ..._activeCall, state: 'connected' };
        _notify();
      }
    }, 2000);
  }
}

/**
 * Video group add — participant goes ringing then connected (or declined).
 */
export function addVideoParticipant(info: Omit<CallParticipant, 'state'>) {
  if (!_activeCall) return;
  const newP: CallParticipant = { ...info, state: 'ringing' };
  _activeCall = { ..._activeCall, participants: [...(_activeCall.participants ?? []), newP] };
  _notify();

  const name = info.contactName;
  const willDecline = Math.random() < 0.25;
  const delay = willDecline ? 1400 + Math.random() * 800 : 2000 + Math.random() * 1000;

  setTimeout(() => {
    if (!_activeCall) return;
    const parts = _activeCall.participants ?? [];
    let idx = -1;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].contactName === name && parts[i].state === 'ringing') { idx = i; break; }
    }
    if (idx === -1) return;
    const updated = [...parts];
    if (willDecline) {
      updated[idx] = { ...updated[idx], state: 'declined' };
      _activeCall = { ..._activeCall, participants: updated };
      _notify();
      _notifyDecline({ contactName: name });
      setTimeout(() => {
        if (!_activeCall) return;
        _activeCall = { ..._activeCall, participants: (_activeCall.participants ?? []).filter((_, i) => i !== idx) };
        _notify();
      }, 3000);
    } else {
      updated[idx] = { ...updated[idx], state: 'connected' };
      _activeCall = { ..._activeCall, participants: updated };
      _notify();
    }
  }, delay);
}

/** Swap active ↔ held (audio only) */
export function swapCalls() {
  if (!_heldCall) return;
  const prev = _activeCall;
  _activeCall = { ..._heldCall, minimized: false };
  _heldCall = prev ?? null;
  _notify();
  _notifyHeld();
}

/** Merge held into active as connected group participant (audio only) */
export function mergeCalls() {
  if (!_activeCall || !_heldCall) return;
  _activeCall = {
    ..._activeCall,
    participants: [
      ...(_activeCall.participants ?? []),
      { contactName: _heldCall.contactName, contactInitials: _heldCall.contactInitials, mode: _heldCall.mode, state: 'connected' as ParticipantState },
    ],
  };
  _heldCall = null;
  _notify();
  _notifyHeld();
}

export function endCall() {
  if (!_activeCall) return;
  _activeCall = { ..._activeCall, state: 'ended' };
  _notify();
  setTimeout(() => {
    _activeCall = null;
    _notify();
    if (_heldCall) {
      _activeCall = { ..._heldCall, minimized: false };
      _heldCall = null;
      _notify();
      _notifyHeld();
    }
  }, 300);
}

export function toggleCallMinimize() {
  if (!_activeCall) return;
  _activeCall = { ..._activeCall, minimized: !_activeCall.minimized };
  _notify();
}

export function toggleCallType() {
  if (!_activeCall) return;
  _activeCall = { ..._activeCall, type: _activeCall.type === 'audio' ? 'video' : 'audio' };
  _notify();
}

export function getActiveCall(): ActiveCall | null { return _activeCall; }
export function getHeldCall(): ActiveCall | null { return _heldCall; }

export function subscribeCall(cb: CallListener): () => void {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}
export function subscribeHeld(cb: CallListener): () => void {
  _heldListeners.add(cb);
  return () => { _heldListeners.delete(cb); };
}
export function subscribeDecline(cb: DeclineListener): () => void {
  _declineListeners.add(cb);
  return () => { _declineListeners.delete(cb); };
}

// ── Incoming call simulation ──────────────────────────────────────────────────

export interface IncomingCall {
  contactName: string;
  contactInitials: string;
  mode: Mode;
}

type IncomingListener = (call: IncomingCall | null) => void;
let _incomingCall: IncomingCall | null = null;
const _incomingListeners = new Set<IncomingListener>();
function _notifyIncoming() { _incomingListeners.forEach(cb => cb(_incomingCall)); }

export function simulateIncomingCall(call: IncomingCall) { _incomingCall = call; _notifyIncoming(); }
export function acceptIncomingCall(type: CallType) {
  if (!_incomingCall) return;
  initiateCall({ contactName: _incomingCall.contactName, contactInitials: _incomingCall.contactInitials, mode: _incomingCall.mode, type });
  _incomingCall = null;
  _notifyIncoming();
}
export function declineIncomingCall() { _incomingCall = null; _notifyIncoming(); }
export function subscribeIncomingCall(cb: IncomingListener): () => void {
  _incomingListeners.add(cb);
  return () => { _incomingListeners.delete(cb); };
}
