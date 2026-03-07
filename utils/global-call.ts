/**
 * Global call controller — pub-sub for initiating and managing VoIP calls.
 * Any screen can call `initiateCall()` to start a call.
 * The root layout subscribes to render the call overlay.
 */

import type { Mode } from '@/types';

export type CallType = 'audio' | 'video';
export type CallState = 'ringing' | 'connected' | 'ended';

export interface CallInfo {
  contactName: string;
  contactInitials: string;
  mode: Mode;
  type: CallType;
}

export interface ActiveCall extends CallInfo {
  state: CallState;
  startedAt: number;
  minimized: boolean;
}

type CallListener = (call: ActiveCall | null) => void;

let _activeCall: ActiveCall | null = null;
const _listeners = new Set<CallListener>();

function _notify() {
  _listeners.forEach((cb) => cb(_activeCall));
}

export function initiateCall(info: CallInfo) {
  _activeCall = {
    ...info,
    state: 'ringing',
    startedAt: Date.now(),
    minimized: false,
  };
  _notify();

  // Auto-connect after 2s (simulated)
  setTimeout(() => {
    if (_activeCall && _activeCall.state === 'ringing') {
      _activeCall = { ..._activeCall, state: 'connected' };
      _notify();
    }
  }, 2000);
}

export function endCall() {
  if (!_activeCall) return;
  _activeCall = { ..._activeCall, state: 'ended' };
  _notify();
  setTimeout(() => {
    _activeCall = null;
    _notify();
  }, 300);
}

export function toggleCallMinimize() {
  if (!_activeCall) return;
  _activeCall = { ..._activeCall, minimized: !_activeCall.minimized };
  _notify();
}

export function toggleCallType() {
  if (!_activeCall) return;
  _activeCall = {
    ..._activeCall,
    type: _activeCall.type === 'audio' ? 'video' : 'audio',
  };
  _notify();
}

export function getActiveCall(): ActiveCall | null {
  return _activeCall;
}

export function subscribeCall(cb: CallListener): () => void {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}

// ── Incoming call simulation ──

export interface IncomingCall {
  contactName: string;
  contactInitials: string;
  mode: Mode;
}

type IncomingListener = (call: IncomingCall | null) => void;

let _incomingCall: IncomingCall | null = null;
const _incomingListeners = new Set<IncomingListener>();

function _notifyIncoming() {
  _incomingListeners.forEach((cb) => cb(_incomingCall));
}

export function simulateIncomingCall(call: IncomingCall) {
  _incomingCall = call;
  _notifyIncoming();
}

export function acceptIncomingCall(type: CallType) {
  if (!_incomingCall) return;
  initiateCall({
    contactName: _incomingCall.contactName,
    contactInitials: _incomingCall.contactInitials,
    mode: _incomingCall.mode,
    type,
  });
  _incomingCall = null;
  _notifyIncoming();
}

export function declineIncomingCall() {
  _incomingCall = null;
  _notifyIncoming();
}

export function subscribeIncomingCall(cb: IncomingListener): () => void {
  _incomingListeners.add(cb);
  return () => { _incomingListeners.delete(cb); };
}
