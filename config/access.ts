/**
 * KaNeXT OS — Access Tier Configuration (v1 Locked)
 *
 * Tier Resolver priority (strict):
 *   1. Email in founderAllowlist → FOUNDER
 *   2. Email in cofounderAllowlist → COFOUNDER
 *   3. Valid pendingInviteCode → INVESTOR
 *   4. Else → PUBLIC
 *
 * v1: static allowlists. Backend-driven in future versions.
 */

export type AccessTier = 'founder' | 'cofounder' | 'investor' | 'public';

/**
 * Emails that automatically resolve to FOUNDER tier.
 * Case-insensitive matching.
 */
export const FOUNDER_ALLOWLIST: string[] = [
  'sammy@kanext.com',
  'sammy@osk.group',
];

/**
 * Emails that automatically resolve to COFOUNDER tier.
 * PBD (Patrick Bet-David) patch.
 * Case-insensitive matching.
 */
export const COFOUNDER_ALLOWLIST: string[] = [
  'patrick@valuetainment.com',
];

/**
 * Resolve an access tier from email + optional invite code.
 * Strict priority: founder → cofounder → invite code → public.
 */
export function resolveTier(
  email: string,
  pendingInviteCode?: string | null,
  validInviteCodes?: string[],
): AccessTier {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Founder allowlist
  if (FOUNDER_ALLOWLIST.some((e) => e.toLowerCase() === normalizedEmail)) {
    return 'founder';
  }

  // 2. CoFounder allowlist (PBD)
  if (COFOUNDER_ALLOWLIST.some((e) => e.toLowerCase() === normalizedEmail)) {
    return 'cofounder';
  }

  // 3. Valid invite code
  if (pendingInviteCode && validInviteCodes?.includes(pendingInviteCode)) {
    return 'investor';
  }

  // 4. Default
  return 'public';
}
