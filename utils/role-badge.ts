/**
 * Role Badge Derivation Engine
 * Computes the derived role badge string for display in the avatar drawer
 * and context switcher. Rules are membership + program specific.
 */
import { getMembershipById } from '@/data/mock-memberships';

// Specific overrides keyed by membership_id
const BADGE_OVERRIDES: Record<string, Record<string, string> | string> = {
  // ── Founder (all modes) — SYSTEM_OWNER identity ──
  mem_sports_kx: 'System Owner',
  mem_biz_kx: 'System Owner',
  mem_church_kx: 'System Owner',
  mem_edu_kx: 'System Owner',
  mem_comp_kx: 'System Owner',
};

/**
 * Derives the role badge string for a given membership + program combination.
 * Returns a human-readable string like "System Owner".
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
    return membership.role_titles.join(' \u00B7 ');
  }

  return 'Member';
}
