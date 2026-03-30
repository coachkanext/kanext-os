/**
 * Demo Role Store — per-mode, per-tile role state for RBAC investor demo.
 *
 * Stores role as module-level state (persists across navigation within a session).
 * Each screen subscribes by calling `useDemoRole(key, cycles)`.
 *
 * Key format:
 *   - mode-wide:  'sports', 'education', 'community', 'business'
 *   - tile-level: 'sports:roster', 'sports:recruits', 'education:admissions', etc.
 *
 * Role cycle pairs (Role A = admin, Role B = lower-tier):
 *   sports          → ['Coach', 'Fan']
 *   sports:roster   → ['Coach', 'Player']
 *   sports:recruits → ['Coach', 'Recruit']
 *   sports:kaypay   → ['Coach', 'Player']
 *   sports:kaystudios → ['Coach', 'Player']
 *   education       → ['Dean', 'Student']
 *   education:admissions → ['Dean', 'Prospective']
 *   education:kaystudios → ['Faculty', 'Student']
 *   community       → ['Pastor', 'Member']
 *   community:outreach → ['Pastor', 'Visitor']
 *   business        → ['CEO', 'Client']
 *   business:team   → ['CEO', 'Employee']
 *   business:kaypay → ['CEO', 'Employee']
 */

import { useState, useEffect } from 'react';

// Default role (index 0) for each key
const DEFAULTS: Record<string, string[]> = {
  sports:               ['Coach',   'Fan'],
  'sports:roster':      ['Coach',   'Player'],
  'sports:recruits':    ['Coach',   'Recruit'],
  'sports:booster':     ['Coach',   'Fan'],
  'sports:kaypay':      ['Coach',   'Player'],
  'sports:kaystudios':  ['Coach',   'Player'],
  education:              ['Dean',    'Student'],
  'education:admissions': ['Dean',    'Prospective'],
  'education:fund':       ['Dean',    'Student'],
  'education:kaystudios': ['Faculty', 'Student'],
  community:              ['Pastor',  'Member'],
  'community:members':    ['Pastor',  'Member'],
  'community:outreach':   ['Pastor',  'Visitor'],
  'community:give':       ['Pastor',  'Member'],
  business:               ['CEO',     'Client'],
  'business:store':       ['CEO',     'Client'],
  'business:team':        ['CEO',     'Employee'],
  'business:kaypay':      ['CEO',     'Employee'],
};

const _state: Record<string, string> = {};
const _listeners: Map<string, Set<() => void>> = new Map();

function subscribe(key: string, fn: () => void): () => void {
  if (!_listeners.has(key)) _listeners.set(key, new Set());
  _listeners.get(key)!.add(fn);
  return () => _listeners.get(key)!.delete(fn);
}

function notify(key: string): void {
  _listeners.get(key)?.forEach(fn => fn());
}

export function getDemoRole(key: string): string {
  return _state[key] ?? DEFAULTS[key]?.[0] ?? 'Admin';
}

export function setDemoRole(key: string, role: string): void {
  _state[key] = role;
  notify(key);
}

/** Returns [currentRole, cycleToNextRole, cycles] */
export function useDemoRole(key: string): [string, () => void, string[]] {
  const cycles = DEFAULTS[key] ?? ['Admin', 'User'];
  const [role, setLocalRole] = useState<string>(() => getDemoRole(key));

  useEffect(() => {
    const unsub = subscribe(key, () => setLocalRole(getDemoRole(key)));
    return unsub;
  }, [key]);

  const cycle = () => {
    const idx = cycles.indexOf(role);
    const next = cycles[(idx + 1) % cycles.length];
    setDemoRole(key, next);
  };

  return [role, cycle, cycles];
}

/** Whether the current role is the "primary" (admin) role for this key */
export function isAdminRole(key: string, role: string): boolean {
  return (DEFAULTS[key]?.[0] ?? 'Admin') === role;
}

/** Mode accent hex for role pill coloring */
export const MODE_ACCENTS: Record<string, string> = {
  sports:    '#990000',
  education: '#003A63',
  community: '#7B68A0',
  business:  '#1D9BF0',
  personal:  '#3B82F6',
};
