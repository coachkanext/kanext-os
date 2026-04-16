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
 *   sports:roster   → ['Head Coach', 'Player']
 *   sports:recruits → ['Head Coach', 'Player']
 *   sports:kaypay   → ['Coach', 'Player']
 *   sports:kaystudios → ['Coach', 'Player']
 *   education       → ['President', 'Student']
 *   education:admissions → ['President', 'Student']
 *   education:kaystudios → ['President', 'Student']
 *   community       → ['Pastor', 'Member']
 *   community:outreach → ['Pastor', 'Member']
 *   business        → ['CEO', 'Client']
 *   business:team   → ['CEO', 'Employee']
 *   business:kaypay → ['CEO', 'Employee']
 */

import { useState, useEffect } from 'react';

// Default role (index 0) for each key
const DEFAULTS: Record<string, string[]> = {
  sports:               ['Coach',   'Fan'],
  'sports:hub':         ['Head Coach', 'Player'],
  'sports:agenda':      ['Head Coach', 'Player'],
  'sports:roster':      ['Head Coach', 'Player'],
  'sports:recruits':    ['Head Coach', 'Player'],
  'sports:booster':     ['Head Coach', 'Fan'],
  'sports:kaypay':      ['Coach',   'Player'],
  'sports:kaystudios':  ['Head Coach', 'Player'],
  education:              ['President', 'Student'],
  'education:hub':        ['President', 'Student'],
  'education:admissions': ['President', 'Student'],
  'education:fund':       ['President', 'Student'],
  'education:kaystudios': ['President', 'Student'],
  'education:campus':     ['President', 'Student'],
  community:              ['Pastor',  'Member'],
  'community:hub':        ['Pastor',  'Member'],
  'community:members':    ['Pastor',  'Member'],
  'community:outreach':   ['Pastor',  'Member'],
  'community:give':       ['Pastor',  'Member'],
  'community:social':     ['Pastor',  'Member'],
  'community:kaystudios': ['Pastor',  'Member'],
  'community:kaypay':     ['Pastor',  'Member'],
  'sports:social':        ['Head Coach', 'Player'],
  'business:social':      ['CEO',    'Client'],
  'education:social':     ['President', 'Student'],
  'community:agenda':     ['Pastor',  'Member'],
  'community:kaytv':      ['Pastor',  'Member'],
  business:               ['CEO',     'Client'],
  'business:hub':         ['CEO',     'Client'],
  'business:inquiries':   ['CEO',     'Client'],
  'business:store':       ['CEO',     'Client'],
  'business:team':        ['CEO',     'Employee'],
  'business:kaypay':      ['CEO',     'Employee'],
  'business:kaystudios':  ['CEO',     'Client'],
  personal:               ['Owner',   'Follower'],
  'personal:hub':         ['Owner',   'Follower'],
  'personal:my-page':     ['Owner',   'Follower'],
  'personal:agenda':      ['Owner',   'Follower'],
  'personal:social':      ['Owner',   'Follower'],
  'personal:portfolio':   ['Owner',   'Follower'],
  'personal:inquiries':   ['Owner',   'Follower'],
  'personal:network':     ['Owner',   'Follower'],
  'personal:deals':       ['Owner',   'Follower'],
  'personal:store':       ['Owner',   'Follower'],
  'personal:kaytv':       ['Owner',   'Follower'],
  'personal:kaypay':      ['Owner',   'Follower'],
  'personal:kaystudios':  ['Owner',   'Follower'],
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
  const cycles = DEFAULTS[key] ?? ['Admin', 'User'];
  const stored = _state[key];
  if (stored && cycles.includes(stored)) return stored;
  return cycles[0];
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
    // When key changes (mode switch), immediately sync to the new key's role
    setLocalRole(getDemoRole(key));
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
  sports:    '#1A1714',
  education: '#1A1714',
  community: '#1A1714',
  business:  '#1A1714',
  personal:  '#1A1714',
};
