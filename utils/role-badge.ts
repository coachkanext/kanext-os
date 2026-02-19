/**
 * Role Badge Derivation Engine
 * Computes the derived role badge string for display in the avatar drawer
 * and context switcher. Rules are membership + program specific.
 */
import { getMembershipById } from '@/data/mock-memberships';

// Specific overrides keyed by membership_id
const BADGE_OVERRIDES: Record<string, Record<string, string> | string> = {
  // ── Sports / FMU ──
  mem_sports_fmu_admin: {
    fmu_mbb: 'AD · Head Coach · GM',
    fmu_dev1: 'Head of Basketball Ops · Head Coach · GM',
    fmu_dev2: 'Head of Basketball Ops · Head Coach · GM',
    _default: 'Athletic Director',
  },

  // ── Church / ICCLA LA ──
  mem_church_iccla: 'Senior Pastor',

  // ── Business ──
  mem_biz_kanext_founder: 'Founder/CEO',

  // ── Competition ──
  mem_comp_k1_owner_commish: 'League Owner · Commissioner',

  // ── Education ──
  mem_edu_fmu_president: 'President',
};

/**
 * Derives the role badge string for a given membership + program combination.
 * Returns a human-readable string like "AD · Head Coach · GM".
 */
export function deriveRoleBadge(membership_id: string, program_id: string): string {
  const override = BADGE_OVERRIDES[membership_id];

  if (typeof override === 'string') {
    return override;
  }

  if (typeof override === 'object' && override !== null) {
    if (program_id in override) {
      return override[program_id];
    }
    if ('_default' in override) {
      return override._default;
    }
  }

  // Fallback: join role_titles from membership
  const membership = getMembershipById(membership_id);
  if (membership) {
    return membership.role_titles.join(' · ');
  }

  return 'Member';
}
