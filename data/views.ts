/**
 * Canonical 21-View Matrix
 * Every view is a pre-resolved ActiveContext ready for instant switching.
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
// CANONICAL 21 VIEWS
// =============================================================================

export const CANONICAL_VIEWS: ViewDefinition[] = [
  // ── SPORTS (5 views) ──
  {
    view_id: 'v_sports_fmu',
    mode: 'sports',
    org_id: 'sports_fmu',
    program_id: 'fmu_mbb',
    season_id: 'fmu_2025_26',
    membership_id: 'mem_sports_fmu_admin',
    derived_role_badge: 'AD \u00b7 Head Coach \u00b7 GM',
    org_display_name: 'FMU Lions',
    role_title: 'AD + Head Coach/GM (MBB)',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2025\u201326',
  },
  {
    view_id: 'v_sports_kxa_athlete',
    mode: 'sports',
    org_id: 'sports_kanext_academy',
    program_id: 'kxa_basketball_flagship',
    season_id: 'kxa_2025_26',
    membership_id: 'mem_sports_kxa_athlete',
    derived_role_badge: 'Player (Athlete)',
    org_display_name: 'KaNeXT Academy',
    role_title: 'Player',
    scope_line: 'Academy Basketball',
    rbca_tier: 2,
    season_chip: '2025\u201326',
  },
  {
    view_id: 'v_sports_lincoln',
    mode: 'sports',
    org_id: 'sports_lincoln',
    program_id: 'lincoln_mbb',
    season_id: 'lincoln_2025_26',
    membership_id: 'mem_sports_lincoln_coach',
    derived_role_badge: 'Assistant Coach \u00b7 Recruiting Coordinator',
    org_display_name: 'Lincoln University',
    role_title: 'Asst Coach + RC',
    scope_line: "Men's Basketball",
    rbca_tier: 3,
    season_chip: '2025\u201326',
  },
  {
    view_id: 'v_sports_salima',
    mode: 'sports',
    org_id: 'sports_salima_wanderers',
    program_id: 'salima_first_team',
    season_id: 'salima_2025_26',
    membership_id: 'mem_sports_salima_limited',
    derived_role_badge: 'Scout \u00b7 External Analyst (Limited)',
    org_display_name: 'Sliema Wanderers FC',
    role_title: 'Scout / Ext Analyst',
    scope_line: 'First Team (Limited)',
    rbca_tier: 3,
    season_chip: '2025\u201326',
  },
  {
    view_id: 'v_sports_yankees',
    mode: 'sports',
    org_id: 'sports_yankees_fan',
    program_id: 'nyy_mlb',
    season_id: 'nyy_2026',
    membership_id: 'mem_sports_yankees_viewer',
    derived_role_badge: 'Viewer (Fan)',
    org_display_name: 'New York Yankees',
    role_title: 'Fan',
    scope_line: 'Public',
    rbca_tier: 0,
    season_chip: '2026',
  },

  // ── CHURCH (3 views) ──
  {
    view_id: 'v_church_iccla',
    mode: 'church',
    org_id: 'church_iccla_la',
    program_id: 'iccla_la_main',
    season_id: 'iccla_2026',
    membership_id: 'mem_church_iccla',
    derived_role_badge: 'Ministry Teacher',
    org_display_name: 'ICCLA (LA)',
    role_title: "Children's + Youth + Singles Min",
    scope_line: 'Staff Access',
    rbca_tier: 3,
    season_chip: 'This Week',
  },
  {
    view_id: 'v_church_icc_ie_teacher',
    mode: 'church',
    org_id: 'church_icc_ie',
    program_id: 'icc_ie_kids',
    season_id: 'icc_ie_2026',
    membership_id: 'mem_church_icc_ie_teacher',
    derived_role_badge: "Children's Church Teacher",
    org_display_name: 'ICCIE (IE)',
    role_title: "Children's Church Teacher",
    scope_line: 'Staff Access',
    rbca_tier: 3,
    season_chip: 'This Week',
  },
  {
    view_id: 'v_church_icc_ie_pastor',
    mode: 'church',
    org_id: 'church_icc_ie',
    program_id: 'icc_ie_main',
    season_id: 'icc_ie_2026',
    membership_id: 'mem_church_icc_ie',
    derived_role_badge: 'Pastor',
    org_display_name: 'ICCIE (Dad)',
    role_title: 'Senior Pastor',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: 'This Week',
  },

  // ── COMPETITION (4 views) ──
  {
    view_id: 'v_comp_k1',
    mode: 'competition',
    org_id: 'comp_k1_hypercar',
    program_id: 'k1_main',
    season_id: 'k1_s1_2026',
    membership_id: 'mem_comp_k1_owner_commish',
    derived_role_badge: 'League Owner \u00b7 Commissioner',
    org_display_name: 'K-1 Hypercar',
    role_title: 'Owner + Commissioner',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2026',
  },
  {
    view_id: 'v_comp_btw',
    mode: 'competition',
    org_id: 'comp_btw_memorial',
    program_id: 'btw_tournament',
    season_id: 'btw_2026',
    membership_id: 'mem_comp_btw_director',
    derived_role_badge: 'Tournament Director',
    org_display_name: 'BTW Memorial',
    role_title: 'Tournament Director',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2026',
  },
  {
    view_id: 'v_comp_mlk',
    mode: 'competition',
    org_id: 'comp_mlk_truth',
    program_id: 'mlk_tournament',
    season_id: 'mlk_2026',
    membership_id: 'mem_comp_mlk_advisor',
    derived_role_badge: 'Speaker \u00b7 Tournament Advisor (Limited)',
    org_display_name: 'MLK Truth',
    role_title: 'Speaker + Advisor',
    scope_line: 'Limited Access',
    rbca_tier: 3,
    season_chip: '2026',
  },
  {
    view_id: 'v_comp_valuetainment',
    mode: 'competition',
    org_id: 'comp_valuetainment_classic',
    program_id: 'vt_classic',
    season_id: 'vt_classic_2026',
    membership_id: 'mem_comp_valuetainment_public',
    derived_role_badge: 'Fan \u00b7 General Viewer (Public)',
    org_display_name: 'Valuetainment Classic',
    role_title: 'Fan',
    scope_line: 'Public',
    rbca_tier: 0,
    season_chip: '2026',
  },

  // ── BUSINESS (5 views) ──
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
  {
    view_id: 'v_biz_kanext_investor',
    mode: 'business',
    org_id: 'biz_kanext_investor',
    program_id: 'biz_kanext_dataroom',
    season_id: 'biz_inv_fy2026',
    membership_id: 'mem_biz_kanext_investor',
    derived_role_badge: 'Investor (Data Room)',
    org_display_name: 'KaNeXT (Investor)',
    role_title: 'Investor',
    scope_line: 'Data Room Access',
    rbca_tier: 2,
    season_chip: 'FY2026',
  },
  {
    view_id: 'v_biz_kanext_public',
    mode: 'business',
    org_id: 'biz_kanext_public',
    program_id: 'biz_kanext_overview',
    season_id: 'biz_pub_fy2026',
    membership_id: 'mem_biz_kanext_public',
    derived_role_badge: 'Public (Overview)',
    org_display_name: 'KaNeXT (Public)',
    role_title: 'Public',
    scope_line: 'Public',
    rbca_tier: 0,
    season_chip: 'FY2026',
  },
  {
    view_id: 'v_biz_valuetainment',
    mode: 'business',
    org_id: 'biz_valuetainment',
    program_id: 'biz_vt_content',
    season_id: 'biz_vt_fy2026',
    membership_id: 'mem_biz_valuetainment_subscriber',
    derived_role_badge: 'Subscriber',
    org_display_name: 'Valuetainment',
    role_title: 'Subscriber',
    scope_line: 'Content Access',
    rbca_tier: 1,
    season_chip: 'FY2026',
  },
  {
    view_id: 'v_biz_sliema',
    mode: 'business',
    org_id: 'biz_sliema_acquisition',
    program_id: 'biz_sliema_workspace',
    season_id: 'biz_sliema_fy2026',
    membership_id: 'mem_biz_sliema_prospective_acquirer',
    derived_role_badge: 'Prospective Acquirer',
    org_display_name: 'Sliema (Asset)',
    role_title: 'Prospective Acquirer',
    scope_line: 'Acquisition Workspace',
    rbca_tier: 2,
    season_chip: 'FY2026',
  },

  // ── EDUCATION (4 views) ──
  {
    view_id: 'v_edu_fmu_pd',
    mode: 'education',
    org_id: 'edu_fmu',
    program_id: 'edu_fmu_main',
    season_id: 'edu_fmu_2025_26',
    membership_id: 'mem_edu_fmu_pd',
    derived_role_badge: 'Program Director \u00b7 AD Academic Liaison',
    org_display_name: 'FMU',
    role_title: 'Program Director + AD Liaison',
    scope_line: 'Full Access',
    rbca_tier: 4,
    season_chip: 'Fall 2026',
  },
  {
    view_id: 'v_edu_fmu_student',
    mode: 'education',
    org_id: 'edu_fmu',
    program_id: 'edu_fmu_main',
    season_id: 'edu_fmu_2025_26',
    membership_id: 'mem_edu_fmu_student',
    derived_role_badge: 'Student',
    org_display_name: 'FMU',
    role_title: 'Student',
    scope_line: 'Student Access',
    rbca_tier: 2,
    season_chip: 'Fall 2026',
  },
  {
    view_id: 'v_edu_kxa_founder',
    mode: 'education',
    org_id: 'edu_kanext_academy',
    program_id: 'edu_kxa_main',
    season_id: 'edu_kxa_2025_26',
    membership_id: 'mem_edu_kxa_founder',
    derived_role_badge: 'Founder \u00b7 Head of Basketball Ops',
    org_display_name: 'KaNeXT Academy',
    role_title: 'Founder + Head of BBall Ops',
    scope_line: 'Full Access',
    rbca_tier: 5,
    season_chip: '2025\u201326',
  },
  {
    view_id: 'v_edu_lincoln_parent',
    mode: 'education',
    org_id: 'edu_lincoln',
    program_id: 'edu_lincoln_main',
    season_id: 'edu_lincoln_2025_26',
    membership_id: 'mem_edu_lincoln_parent',
    derived_role_badge: 'Parent / Guardian',
    org_display_name: 'Lincoln University',
    role_title: 'Parent / Guardian',
    scope_line: 'Limited Access',
    rbca_tier: 2,
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
