/**
 * Unified RBAC — Single cross-mode dispatcher for membership → role lens.
 * Resolves a membership_id + mode to the correct per-mode role lens.
 */

import type { Mode } from '@/types';
import { getSportsRole, type SportsRoleLens } from '@/utils/sports-rbac';
import { getChurchRole, type ChurchRoleLens } from '@/utils/church-rbac';
import { getBusinessRole, type BusinessRoleLens } from '@/utils/business-rbac';
import { getEducationRole, type EducationRoleLens } from '@/utils/education-rbac';
import { getCompetitionRole, type CompetitionRoleLens } from '@/utils/competition-rbac';
import { isSystemOwner, getSystemOwnerLensForMode } from '@/utils/system-rbac';

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
