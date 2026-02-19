/**
 * ActiveView Utilities
 * Converts ViewDefinitions to ActiveView objects and provides key generation.
 */

import type { ActiveView, ActiveViewKey, Mode } from '@/types';
import type { ViewDefinition } from '@/data/views';
import { CANONICAL_VIEWS, getViewsForMode } from '@/data/views';
import { resolveRoleLens } from '@/utils/unified-rbac';

/**
 * Convert a canonical ViewDefinition into an ActiveView.
 * Maps the flat view data to the richer ActiveView structure.
 */
export function buildActiveView(view: ViewDefinition): ActiveView {
  const roleLens = resolveRoleLens(view.membership_id, view.mode);

  // Derive scope_type from mode
  let scopeType: ActiveView['scope_type'] = null;
  switch (view.mode) {
    case 'sports':
      scopeType = 'program';
      break;
    case 'church':
      scopeType = 'ministry';
      break;
    case 'education':
      scopeType = 'department';
      break;
    case 'competition':
      scopeType = 'league';
      break;
    case 'business':
      scopeType = 'workspace';
      break;
  }

  return {
    view_id: view.view_id,
    mode: view.mode,
    org_id: view.org_id,
    org_name: view.org_display_name,
    membership_id: view.membership_id,
    role_label: view.role_title,
    rbac_level: view.rbca_tier,
    scope_type: scopeType,
    scope_id: view.program_id,
    scope_name: view.scope_line,
    season_id: view.season_id,
    season_label: view.season_chip,
    derived_role_badge: view.derived_role_badge,
  };
}

/**
 * Generate a unique composite key for dedup and cache scoping.
 */
export function getActiveViewKey(view: ActiveView): ActiveViewKey {
  return `${view.mode}:${view.org_id}:${view.scope_id}:${view.season_id}:${view.membership_id}`;
}

/**
 * Get the default ActiveView for a given mode (first canonical view).
 */
export function getDefaultActiveViewForMode(mode: Mode): ActiveView | null {
  const views = getViewsForMode(mode);
  if (views.length === 0) return null;
  return buildActiveView(views[0]);
}
