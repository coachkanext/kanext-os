/**
 * Canonical 5-View Matrix
 * One view per mode — all full control (tier 5).
 */

import type { Mode } from '@/types';
import type { RBCATier } from '@/data/rbca';

// =============================================================================
// VIEW DEFINITION
// =============================================================================

export interface ViewDefinition {
  view_id: string;
  mode: Mode;
  org_id: string;
  program_id: string;
  season_id: string;
  membership_id: string;
  derived_role_badge: string;
  org_display_name: string;
  role_title: string;
  scope_line: string;
  rbca_tier: RBCATier;
  season_chip: string;
}

// =============================================================================
// DRAWER MODES
// =============================================================================

export const DRAWER_MODES = ['sports', 'church', 'business', 'education', 'competition'] as const;
export type DrawerMode = (typeof DRAWER_MODES)[number];

// =============================================================================
// MODE CHIP DEFINITIONS
// =============================================================================

export const MODE_CHIP_CONFIG: { mode: DrawerMode; label: string; icon: string }[] = [
  { mode: 'sports', label: 'Sports', icon: 'basketball.fill' },
  { mode: 'church', label: 'Church', icon: 'building.columns.fill' },
  { mode: 'business', label: 'Business', icon: 'briefcase.fill' },
  { mode: 'education', label: 'Education', icon: 'graduationcap.fill' },
  { mode: 'competition', label: 'Competition', icon: 'trophy.fill' },
];

// =============================================================================
// CANONICAL 5 VIEWS
// =============================================================================

export const CANONICAL_VIEWS: ViewDefinition[] = [
  // ── SPORTS: Carroll College Fighting Saints ──
  {
    view_id: 'v_sports_kx',
    mode: 'sports',
    org_id: 'sports_kx',
    program_id: 'kx_mbb',
    season_id: 'kx_2025_26',
    membership_id: 'mem_sports_kx',
    derived_role_badge: 'System Owner',
    org_display_name: 'Carroll College',
    role_title: 'System Owner',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2025\u201326',
  },

  // ── BUSINESS: Valuetainment ──
  {
    view_id: 'v_biz_kx',
    mode: 'business',
    org_id: 'biz_kx',
    program_id: 'biz_kx_ops',
    season_id: 'biz_kx_fy2026',
    membership_id: 'mem_biz_kx',
    derived_role_badge: 'System Owner',
    org_display_name: 'Valuetainment',
    role_title: 'System Owner',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: 'FY2026',
  },

  // ── CHURCH: 2819 Church ──
  {
    view_id: 'v_church_kx',
    mode: 'church',
    org_id: 'church_kx',
    program_id: 'church_kx_main',
    season_id: 'church_kx_2026',
    membership_id: 'mem_church_kx',
    derived_role_badge: 'System Owner',
    org_display_name: '2819 Church',
    role_title: 'System Owner',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: 'This Week',
  },

  // ── EDUCATION: Howard University ──
  {
    view_id: 'v_edu_kx',
    mode: 'education',
    org_id: 'edu_kx',
    program_id: 'edu_kx_main',
    season_id: 'edu_kx_2025_26',
    membership_id: 'mem_edu_kx',
    derived_role_badge: 'System Owner',
    org_display_name: 'Howard University',
    role_title: 'System Owner',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2025\u201326',
  },

  // ── COMPETITION: Adidas 3SSB ──
  {
    view_id: 'v_comp_kx',
    mode: 'competition',
    org_id: 'comp_kx',
    program_id: 'comp_kx_main',
    season_id: 'comp_kx_s1_2026',
    membership_id: 'mem_comp_kx',
    derived_role_badge: 'System Owner',
    org_display_name: 'Adidas 3SSB',
    role_title: 'System Owner',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2025\u201326',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/** Get all views for a given mode */
export function getViewsForMode(mode: Mode): ViewDefinition[] {
  return CANONICAL_VIEWS.filter((v) => v.mode === mode);
}

/** Get a view by its membership_id */
export function getViewByMembershipId(membershipId: string): ViewDefinition | undefined {
  return CANONICAL_VIEWS.find((v) => v.membership_id === membershipId);
}

/** Count views per mode */
export function getViewCountPerMode(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const mode of DRAWER_MODES) {
    counts[mode] = CANONICAL_VIEWS.filter((v) => v.mode === mode).length;
  }
  return counts;
}
