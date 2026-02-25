/**
 * Unified RBAC Dispatcher — Single cross-mode resolver for membership → role lens.
 * Resolves a membership_id + mode to the correct per-mode role lens and
 * optionally returns the full UniversalRoleDefinition.
 */

import type { Mode } from '@/types';
import type { UniversalRoleDefinition } from './constitution';
import { getSportsRole, SPORTS_ROLES, type SportsRoleLens } from './sports-registry';
import { getChurchRole, CHURCH_ROLES, type ChurchRoleLens } from './church-registry';
import { getBusinessRole, BUSINESS_ROLES, type BusinessRoleLens } from './business-registry';
import { getEducationRole, EDUCATION_ROLES, type EducationRoleLens } from './education-registry';
import { getCompetitionRole, COMPETITION_ROLES, type CompetitionRoleLens } from './competition-registry';
import { isSystemOwner, getSystemOwnerLensForMode } from './system';

export type AnyRoleLens =
  | { mode: 'sports'; lens: SportsRoleLens }
  | { mode: 'church'; lens: ChurchRoleLens }
  | { mode: 'business'; lens: BusinessRoleLens }
  | { mode: 'education'; lens: EducationRoleLens }
  | { mode: 'competition'; lens: CompetitionRoleLens };

/**
 * Resolve a membership_id to its mode-specific role lens.
 */
export function resolveRoleLens(membershipId: string, mode: Mode): AnyRoleLens {
  // SYSTEM_OWNER bypass — founder gets highest-privilege lens in every mode
  if (isSystemOwner(membershipId)) {
    return getSystemOwnerLensForMode(mode);
  }

  switch (mode) {
    case 'sports':
      return { mode, lens: getSportsRole(membershipId) };
    case 'church':
      return { mode, lens: getChurchRole(membershipId) };
    case 'business':
      return { mode, lens: getBusinessRole(membershipId) };
    case 'education':
      return { mode, lens: getEducationRole(membershipId) };
    case 'competition':
      return { mode, lens: getCompetitionRole(membershipId) };
  }
}

/**
 * Resolve a membership_id to its role lens AND full constitutional definition.
 */
export function resolveRoleDefinition(
  membershipId: string,
  mode: Mode,
): { anyLens: AnyRoleLens; definition: UniversalRoleDefinition } {
  const anyLens = resolveRoleLens(membershipId, mode);

  switch (anyLens.mode) {
    case 'sports':
      return { anyLens, definition: SPORTS_ROLES[anyLens.lens] };
    case 'church':
      return { anyLens, definition: CHURCH_ROLES[anyLens.lens] };
    case 'business':
      return { anyLens, definition: BUSINESS_ROLES[anyLens.lens] };
    case 'education':
      return { anyLens, definition: EDUCATION_ROLES[anyLens.lens] };
    case 'competition':
      return { anyLens, definition: COMPETITION_ROLES[anyLens.lens] };
  }
}
