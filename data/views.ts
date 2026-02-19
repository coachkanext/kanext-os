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

export const DRAWER_MODES = ['sports', 'church', 'competition', 'business', 'education'] as const;
export type DrawerMode = (typeof DRAWER_MODES)[number];

// =============================================================================
// MODE CHIP DEFINITIONS
// =============================================================================

export const MODE_CHIP_CONFIG: { mode: DrawerMode; label: string; icon: string }[] = [
  { mode: 'sports', label: 'Sports', icon: 'basketball.fill' },
  { mode: 'church', label: 'Church', icon: 'building.columns.fill' },
  { mode: 'competition', label: 'Competition', icon: 'flag.checkered' },
  { mode: 'business', label: 'Business', icon: 'briefcase.fill' },
  { mode: 'education', label: 'Education', icon: 'graduationcap.fill' },
];

// =============================================================================
// CANONICAL 5 VIEWS
// =============================================================================

export const CANONICAL_VIEWS: ViewDefinition[] = [
  // ── SPORTS (1 view) ──
  {
    view_id: 'v_sports_fmu',
    mode: 'sports',
    org_id: 'sports_fmu',
    program_id: 'fmu_mbb',
    season_id: 'fmu_2025_26',
    membership_id: 'mem_sports_fmu_admin',
    derived_role_badge: 'AD · Head Coach · GM',
    org_display_name: 'FMU Lions',
    role_title: 'AD + Head Coach/GM (MBB)',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2025\u201326',
  },

  // ── CHURCH (1 view) ──
  {
    view_id: 'v_church_iccla',
    mode: 'church',
    org_id: 'church_iccla_la',
    program_id: 'iccla_la_main',
    season_id: 'iccla_2026',
    membership_id: 'mem_church_iccla',
    derived_role_badge: 'Senior Pastor',
    org_display_name: 'ICCLA (LA)',
    role_title: 'Senior Pastor',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: 'This Week',
  },

  // ── COMPETITION (1 view) ──
  {
    view_id: 'v_comp_k1',
    mode: 'competition',
    org_id: 'comp_k1_hypercar',
    program_id: 'k1_main',
    season_id: 'k1_s1_2026',
    membership_id: 'mem_comp_k1_owner_commish',
    derived_role_badge: 'League Owner · Commissioner',
    org_display_name: 'K-1 Hypercar',
    role_title: 'Owner + Commissioner',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2026',
  },

  // ── BUSINESS (1 view) ──
  {
    view_id: 'v_biz_kanext_founder',
    mode: 'business',
    org_id: 'biz_kanext_founder',
    program_id: 'biz_kanext_ops',
    season_id: 'biz_fy2026',
    membership_id: 'mem_biz_kanext_founder',
    derived_role_badge: 'Founder/CEO',
    org_display_name: 'KaNeXT (Founder)',
    role_title: 'CEO + Founder',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: 'FY2026',
  },

  // ── EDUCATION (1 view) ──
  {
    view_id: 'v_edu_fmu_president',
    mode: 'education',
    org_id: 'edu_fmu',
    program_id: 'edu_fmu_main',
    season_id: 'edu_fmu_2025_26',
    membership_id: 'mem_edu_fmu_president',
    derived_role_badge: 'President',
    org_display_name: 'FMU',
    role_title: 'President',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: 'Fall 2026',
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
