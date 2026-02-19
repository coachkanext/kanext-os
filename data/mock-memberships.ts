/**
 * V2 Avatar Drawer — Mock Memberships, Organizations, Programs, Seasons
 * Central seed data for multi-mode, multi-org context switching.
 */
import type {
  Mode,
  V2Organization,
  V2Membership,
  V2Program,
  V2Season,
  ActiveContext,
  RecentContext,
} from '@/types';

// =============================================================================
// ORGANIZATIONS
// =============================================================================

export const V2_ORGANIZATIONS: V2Organization[] = [
  // ── Sports ──
  { org_id: 'sports_fmu', org_name: 'Florida Memorial University', mode: 'sports', location: 'Miami Gardens, FL', org_type: 'college_athletics' },

  // ── Competition ──
  { org_id: 'comp_k1_hypercar', org_name: 'K-1 Hypercar Championship', mode: 'competition', location: 'Global' },

  // ── Church ──
  { org_id: 'church_iccla_la', org_name: 'ICCLA \u2014 Los Angeles', mode: 'church', location: 'Los Angeles, CA' },

  // ── Business ──
  { org_id: 'biz_kanext_founder', org_name: 'KaNeXT', mode: 'business', view_variant: 'Founder' },

  // ── Education ──
  { org_id: 'edu_fmu', org_name: 'Florida Memorial University', mode: 'education', location: 'Miami Gardens, FL', org_type: 'university' },
];

// =============================================================================
// MEMBERSHIPS
// =============================================================================

export const V2_MEMBERSHIPS: V2Membership[] = [
  // ── Sports ──
  {
    membership_id: 'mem_sports_fmu_admin',
    mode: 'sports',
    org_id: 'sports_fmu',
    role_titles: ['Athletic Director', "Men's Basketball Head Coach", "Men's Basketball GM"],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },

  // ── Competition ──
  {
    membership_id: 'mem_comp_k1_owner_commish',
    mode: 'competition',
    org_id: 'comp_k1_hypercar',
    role_titles: ['League Owner', 'Commissioner'],
    permission_tier: 'Full',
    program_scopes: ['*'],
  },

  // ── Church ──
  {
    membership_id: 'mem_church_iccla',
    mode: 'church',
    org_id: 'church_iccla_la',
    role_titles: ['Senior Pastor'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },

  // ── Business ──
  {
    membership_id: 'mem_biz_kanext_founder',
    mode: 'business',
    org_id: 'biz_kanext_founder',
    role_titles: ['Founder', 'CEO'],
    permission_tier: 'Full',
    program_scopes: ['*'],
  },

  // ── Education ──
  {
    membership_id: 'mem_edu_fmu_president',
    mode: 'education',
    org_id: 'edu_fmu',
    role_titles: ['President'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },
];

// =============================================================================
// PROGRAMS
// =============================================================================

export const V2_PROGRAMS: V2Program[] = [
  // ── FMU Sports (13 varsity + 2 dev = 15) ──
  { program_id: 'fmu_baseball', org_id: 'sports_fmu', mode: 'sports', program_name: 'Baseball (Men)', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_mbb', org_id: 'sports_fmu', mode: 'sports', program_name: "Men's Basketball", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_football', org_id: 'sports_fmu', mode: 'sports', program_name: 'Football', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_msoc', org_id: 'sports_fmu', mode: 'sports', program_name: "Men's Soccer", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_mtf', org_id: 'sports_fmu', mode: 'sports', program_name: "Men's Track & Field", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wbb', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Basketball", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_beachvb', org_id: 'sports_fmu', mode: 'sports', program_name: 'Beach Volleyball', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wflag', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Flag Football", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wsoc', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Soccer", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_softball', org_id: 'sports_fmu', mode: 'sports', program_name: 'Softball', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wtf', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Track & Field", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_wvb', org_id: 'sports_fmu', mode: 'sports', program_name: "Women's Volleyball", program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_cheer', org_id: 'sports_fmu', mode: 'sports', program_name: 'Competitive Cheer', program_type: 'Varsity', source_tag: 'FMU_OFFICIAL', status: 'Active' },
  { program_id: 'fmu_dev1', org_id: 'sports_fmu', mode: 'sports', program_name: 'Basketball Development Team 1', program_type: 'Development', source_tag: 'KANEXT_OPERATED', status: 'Active' },
  { program_id: 'fmu_dev2', org_id: 'sports_fmu', mode: 'sports', program_name: 'Basketball Development Team 2', program_type: 'Development', source_tag: 'KANEXT_OPERATED', status: 'Active' },

  // ── Competition ──
  { program_id: 'k1_main', org_id: 'comp_k1_hypercar', mode: 'competition', program_name: 'K-1 Championship', program_type: 'League', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Church (ICCLA — 4 programs) ──
  { program_id: 'iccla_la_main', org_id: 'church_iccla_la', mode: 'church', program_name: 'Sunday Service / Main Church', program_type: 'Campus', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'iccla_la_kids', org_id: 'church_iccla_la', mode: 'church', program_name: "Children's Church", program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'iccla_la_freshfire', org_id: 'church_iccla_la', mode: 'church', program_name: 'Fresh Fire Youth Ministry', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'iccla_la_singles', org_id: 'church_iccla_la', mode: 'church', program_name: 'Singles Ministry', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Business ──
  { program_id: 'biz_kanext_ops', org_id: 'biz_kanext_founder', mode: 'business', program_name: 'KaNeXT Operations', program_type: 'Platform', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Education ──
  { program_id: 'edu_fmu_main', org_id: 'edu_fmu', mode: 'education', program_name: 'FMU Academic Programs', program_type: 'Institution', source_tag: 'OFFICIAL', status: 'Active' },
];

// =============================================================================
// SEASONS
// =============================================================================

export const V2_SEASONS: V2Season[] = [
  // Sports
  { season_id: 'fmu_2025_26', org_id: 'sports_fmu', mode: 'sports', season_name: '2025\u201326', start_date: '2025-10-01', end_date: '2026-04-01', is_current: true },
  { season_id: 'fmu_2024_25', org_id: 'sports_fmu', mode: 'sports', season_name: '2024\u201325', start_date: '2024-10-01', end_date: '2025-04-01', is_current: false },

  // Competition
  { season_id: 'k1_s1_2026', org_id: 'comp_k1_hypercar', mode: 'competition', season_name: 'Season 1 · 2026', start_date: '2026-03-01', end_date: '2026-11-30', is_current: true },

  // Church
  { season_id: 'iccla_2026', org_id: 'church_iccla_la', mode: 'church', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // Business
  { season_id: 'biz_fy2026', org_id: 'biz_kanext_founder', mode: 'business', season_name: 'FY 2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // Education
  { season_id: 'edu_fmu_2025_26', org_id: 'edu_fmu', mode: 'education', season_name: 'Fall 2026', start_date: '2025-08-18', end_date: '2026-05-10', is_current: true },
];

// =============================================================================
// DEFAULT ACTIVE CONTEXT
// =============================================================================

export const DEFAULT_ACTIVE_CONTEXT: ActiveContext = {
  mode: 'sports',
  org_id: 'sports_fmu',
  program_id: 'fmu_mbb',
  season_id: 'fmu_2025_26',
  membership_id: 'mem_sports_fmu_admin',
  derived_role_badge: 'AD · Head Coach · GM',
};

// =============================================================================
// SEEDED RECENT CONTEXTS
// =============================================================================

export const SEEDED_RECENT_CONTEXTS: RecentContext[] = [
  {
    mode: 'sports', org_id: 'sports_fmu', program_id: 'fmu_mbb', season_id: 'fmu_2025_26',
    membership_id: 'mem_sports_fmu_admin', derived_role_badge: 'AD · Head Coach · GM', timestamp: Date.now() - 1000,
  },
  {
    mode: 'church', org_id: 'church_iccla_la', program_id: 'iccla_la_main', season_id: 'iccla_2026',
    membership_id: 'mem_church_iccla', derived_role_badge: 'Senior Pastor', timestamp: Date.now() - 2000,
  },
  {
    mode: 'competition', org_id: 'comp_k1_hypercar', program_id: 'k1_main', season_id: 'k1_s1_2026',
    membership_id: 'mem_comp_k1_owner_commish', derived_role_badge: 'League Owner · Commissioner', timestamp: Date.now() - 3000,
  },
  {
    mode: 'business', org_id: 'biz_kanext_founder', program_id: 'biz_kanext_ops', season_id: 'biz_fy2026',
    membership_id: 'mem_biz_kanext_founder', derived_role_badge: 'Founder/CEO', timestamp: Date.now() - 4000,
  },
  {
    mode: 'education', org_id: 'edu_fmu', program_id: 'edu_fmu_main', season_id: 'edu_fmu_2025_26',
    membership_id: 'mem_edu_fmu_president', derived_role_badge: 'President', timestamp: Date.now() - 5000,
  },
];

// =============================================================================
// LOOKUP HELPERS
// =============================================================================

export function getOrgsForModeV2(mode: Mode): V2Organization[] {
  return V2_ORGANIZATIONS.filter((o) => o.mode === mode);
}

export function getMembershipsForOrg(org_id: string): V2Membership[] {
  return V2_MEMBERSHIPS.filter((m) => m.org_id === org_id);
}

export function getMembershipsForMode(mode: Mode): V2Membership[] {
  return V2_MEMBERSHIPS.filter((m) => m.mode === mode);
}

export function getProgramsForOrg(org_id: string): V2Program[] {
  return V2_PROGRAMS.filter((p) => p.org_id === org_id);
}

export function getSeasonsForOrg(org_id: string): V2Season[] {
  return V2_SEASONS.filter((s) => s.org_id === org_id);
}

export function getCurrentSeasonForOrg(org_id: string): V2Season | undefined {
  return V2_SEASONS.find((s) => s.org_id === org_id && s.is_current);
}

export function getOrgById(org_id: string): V2Organization | undefined {
  return V2_ORGANIZATIONS.find((o) => o.org_id === org_id);
}

export function getProgramById(program_id: string): V2Program | undefined {
  return V2_PROGRAMS.find((p) => p.program_id === program_id);
}

export function getSeasonById(season_id: string): V2Season | undefined {
  return V2_SEASONS.find((s) => s.season_id === season_id);
}

export function getMembershipById(membership_id: string): V2Membership | undefined {
  return V2_MEMBERSHIPS.find((m) => m.membership_id === membership_id);
}

/** Find memberships that can access a given program within an org */
export function getMembershipsForOrgProgram(org_id: string, program_id: string): V2Membership[] {
  return V2_MEMBERSHIPS.filter((m) => {
    if (m.org_id !== org_id) return false;
    if (m.program_scopes.includes('*')) return true;
    return m.program_scopes.includes(program_id);
  });
}

/** Get default context for a mode (first org, first program, current season) */
export function getDefaultContextForMode(mode: Mode): ActiveContext | null {
  const orgs = getOrgsForModeV2(mode);
  if (orgs.length === 0) return null;

  const org = orgs[0];
  const programs = getProgramsForOrg(org.org_id);
  if (programs.length === 0) return null;

  const program = programs[0];
  const season = getCurrentSeasonForOrg(org.org_id);
  if (!season) return null;

  const memberships = getMembershipsForOrgProgram(org.org_id, program.program_id);
  if (memberships.length === 0) return null;

  const membership = memberships[0];

  // Import deriveRoleBadge lazily to avoid circular deps
  const badge = membership.role_titles.join(' · ');

  return {
    mode,
    org_id: org.org_id,
    program_id: program.program_id,
    season_id: season.season_id,
    membership_id: membership.membership_id,
    derived_role_badge: badge,
  };
}
