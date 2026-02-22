/**
 * System RBAC — SYSTEM_OWNER role for the founder account.
 *
 * SYSTEM_OWNER is a KaNeXT-internal-only role:
 * - Mode-agnostic, org-agnostic, company-agnostic
 * - Sits above all existing mode roles
 * - Single instance — founder account only
 * - Never visible to or assignable by any org
 *
 * The unified dispatcher (`resolveRoleLens`) checks `isSystemOwner()` first
 * and short-circuits to the highest-privilege lens for the active mode.
 * No underlying mode-specific role assignments are needed.
 */

import type { Mode } from '@/types';
import type { AnyRoleLens } from '@/utils/unified-rbac';

// =============================================================================
// SYSTEM_OWNER IDENTITY
// =============================================================================

/** All membership IDs belonging to the founder account (one per mode). */
const SYSTEM_OWNER_MEMBERSHIP_IDS: Set<string> = new Set([
  'mem_sports_kx',   // Sports  → R1
  'mem_biz_kx',      // Business → B1
  'mem_church_kx',   // Church  → C1
  'mem_edu_kx',      // Education → E1
  'mem_comp_kx',     // Competition → CO1
]);

/** Returns true if the membership belongs to the system owner. */
export function isSystemOwner(membershipId: string): boolean {
  return SYSTEM_OWNER_MEMBERSHIP_IDS.has(membershipId);
}

/** Returns true if the email belongs to a system owner. Re-export for convenience. */
export { isSystemOwnerEmail } from '@/config/access';

// =============================================================================
// SYSTEM_OWNER CAPABILITIES
// =============================================================================

export const SYSTEM_OWNER_CAPABILITIES = {
  /** Access all 5 modes */
  allModes: true,
  /** Switch between any org or program */
  crossOrg: true,
  /** View-as any role in any mode */
  lensSwitch: true,
  /** Override for debugging and demos */
  debugOverride: true,
  /** View global audit logs and all transactions */
  globalAudit: true,
} as const;

export type SystemOwnerCapabilities = typeof SYSTEM_OWNER_CAPABILITIES;

// =============================================================================
// MODE → HIGHEST-PRIVILEGE LENS
// =============================================================================

/**
 * Returns the highest-privilege `AnyRoleLens` for a given mode.
 * Used by `resolveRoleLens()` to bypass per-mode membership lookups.
 */
export function getSystemOwnerLensForMode(mode: Mode): AnyRoleLens {
  switch (mode) {
    case 'sports':
      return { mode, lens: 'R1' };
    case 'church':
      return { mode, lens: 'C1' };
    case 'business':
      return { mode, lens: 'B1' };
    case 'education':
      return { mode, lens: 'E1' };
    case 'competition':
      return { mode, lens: 'CO1' };
  }
}
