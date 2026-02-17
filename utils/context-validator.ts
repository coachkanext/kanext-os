/**
 * Context Validator (Mode Fixer)
 * Validates whether a proposed ActiveContext is valid.
 * Prevents invalid context combinations.
 */
import type { ActiveContext, V2Membership } from '@/types';
import {
  getMembershipsForOrg,
  getMembershipsForOrgProgram,
  getProgramsForOrg,
  getOrgById,
  getProgramById,
  getSeasonById,
} from '@/data/mock-memberships';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  requiresRoleLens?: boolean;
  matchingMemberships?: V2Membership[];
}

/**
 * Validates a proposed context switch.
 * Returns { valid: true } if the context is valid.
 * Returns { valid: false, error } if invalid.
 * Returns { requiresRoleLens: true, matchingMemberships } when multiple
 * memberships can access the same org+program (e.g., KaNeXT Academy admin vs athlete).
 */
export function validateContext(ctx: Partial<ActiveContext>): ValidationResult {
  const { mode, org_id, program_id, season_id, membership_id } = ctx;

  // 1. Check org exists
  if (org_id) {
    const org = getOrgById(org_id);
    if (!org) {
      return { valid: false, error: 'Organization not found.' };
    }
    if (mode && org.mode !== mode) {
      return { valid: false, error: 'Organization does not belong to this mode.' };
    }
  }

  // 2. Check membership exists for org
  if (org_id) {
    const memberships = getMembershipsForOrg(org_id);
    if (memberships.length === 0) {
      return { valid: false, error: "You don't have access to this organization." };
    }
  }

  // 3. Check program belongs to org
  if (org_id && program_id) {
    const programs = getProgramsForOrg(org_id);
    const programExists = programs.some((p) => p.program_id === program_id);
    if (!programExists) {
      return { valid: false, error: 'This program does not belong to this organization.' };
    }
  }

  // 4. Check membership has access to program
  if (org_id && program_id) {
    const matching = getMembershipsForOrgProgram(org_id, program_id);
    if (matching.length === 0) {
      return {
        valid: false,
        error: "You don't have access to this program in this role.",
      };
    }

    // 5. If multiple memberships match, require role lens selection
    if (matching.length > 1 && !membership_id) {
      return {
        valid: false,
        requiresRoleLens: true,
        matchingMemberships: matching,
      };
    }

    // 6. If membership specified, verify it's in the matching set
    if (membership_id) {
      const membershipValid = matching.some((m) => m.membership_id === membership_id);
      if (!membershipValid) {
        return {
          valid: false,
          error: "You don't have access to this program in this role.",
        };
      }
    }
  }

  // 7. Check season belongs to org
  if (org_id && season_id) {
    const season = getSeasonById(season_id);
    if (!season || season.org_id !== org_id) {
      return { valid: false, error: 'This season does not belong to this organization.' };
    }
  }

  return { valid: true };
}
