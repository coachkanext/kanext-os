/**
 * Pending New Org — module-level handoff between the onboarding flow and Nexus.
 *
 * Auth modal sets this before calling completeOnboarding() + navigating to /nexus.
 * Nexus reads and clears it once on mount via consumePendingNewOrg().
 */

export type NewOrgMode = 'sports' | 'business' | 'faith' | 'education';

export interface PendingNewOrg {
  mode: NewOrgMode;
  displayName: string;
}

let _pending: PendingNewOrg | null = null;

export function setPendingNewOrg(mode: NewOrgMode, displayName: string) {
  _pending = { mode, displayName };
}

/** Reads and clears the pending org. Returns null if none. */
export function consumePendingNewOrg(): PendingNewOrg | null {
  const val = _pending;
  _pending = null;
  return val;
}
