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
  { org_id: 'sports_kx', org_name: 'Carroll College', mode: 'sports', location: 'Helena, MT', org_type: 'college_athletics' },

  // ── Business ──
  { org_id: 'biz_kx', org_name: 'Valuetainment', mode: 'business', location: 'Fort Lauderdale, FL', org_type: 'platform', view_variant: 'Founder' },

  // ── Church ──
  { org_id: 'church_kx', org_name: '2819 Church', mode: 'church', location: 'Atlanta, GA', org_type: 'faith' },

  // ── Education ──
  { org_id: 'edu_kx', org_name: 'Howard University', mode: 'education', location: 'Washington, DC', org_type: 'university' },

  // ── Competition ──
  { org_id: 'comp_kx', org_name: 'Adidas 3SSB', mode: 'competition', location: 'Rock Hill, SC', org_type: 'grassroots_basketball' },
];

// =============================================================================
// MEMBERSHIPS
// =============================================================================

export const V2_MEMBERSHIPS: V2Membership[] = [
  // ── Sports ──
  {
    membership_id: 'mem_sports_kx',
    mode: 'sports',
    org_id: 'sports_kx',
    role_titles: ['System Owner'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },

  // ── Business ──
  {
    membership_id: 'mem_biz_kx',
    mode: 'business',
    org_id: 'biz_kx',
    role_titles: ['System Owner'],
    permission_tier: 'Full',
    program_scopes: ['*'],
  },

  // ── Church ──
  {
    membership_id: 'mem_church_kx',
    mode: 'church',
    org_id: 'church_kx',
    role_titles: ['System Owner'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },

  // ── Education ──
  {
    membership_id: 'mem_edu_kx',
    mode: 'education',
    org_id: 'edu_kx',
    role_titles: ['System Owner'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },

  // ── Competition ──
  {
    membership_id: 'mem_comp_kx',
    mode: 'competition',
    org_id: 'comp_kx',
    role_titles: ['System Owner'],
    permission_tier: 'Full',
    program_scopes: ['*'],
  },
];

// =============================================================================
// PROGRAMS
// =============================================================================

export const V2_PROGRAMS: V2Program[] = [
  // ── Carroll College Fighting Saints (NAIA — 17 varsity sports) ──
  { program_id: 'kx_mbb', org_id: 'sports_kx', mode: 'sports', program_name: "Men's Basketball", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_wbb', org_id: 'sports_kx', mode: 'sports', program_name: "Women's Basketball", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_football', org_id: 'sports_kx', mode: 'sports', program_name: 'Football', program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_msoc', org_id: 'sports_kx', mode: 'sports', program_name: "Men's Soccer", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_wsoc', org_id: 'sports_kx', mode: 'sports', program_name: "Women's Soccer", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_wvb', org_id: 'sports_kx', mode: 'sports', program_name: "Women's Volleyball", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_mtf', org_id: 'sports_kx', mode: 'sports', program_name: "Men's Track & Field", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_wtf', org_id: 'sports_kx', mode: 'sports', program_name: "Women's Track & Field", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_mgolf', org_id: 'sports_kx', mode: 'sports', program_name: "Men's Golf", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_wgolf', org_id: 'sports_kx', mode: 'sports', program_name: "Women's Golf", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_softball', org_id: 'sports_kx', mode: 'sports', program_name: 'Softball', program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_swim', org_id: 'sports_kx', mode: 'sports', program_name: 'Swimming', program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_cheer', org_id: 'sports_kx', mode: 'sports', program_name: 'Competitive Cheer', program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },
  { program_id: 'kx_esports', org_id: 'sports_kx', mode: 'sports', program_name: 'Esports', program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },

  // ── Valuetainment (3 programs) ──
  { program_id: 'biz_kx_ops', org_id: 'biz_kx', mode: 'business', program_name: 'Valuetainment Media', program_type: 'Platform', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'biz_kx_product', org_id: 'biz_kx', mode: 'business', program_name: 'Bet-David Consulting', program_type: 'Consulting', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'biz_kx_growth', org_id: 'biz_kx', mode: 'business', program_name: 'Minnect', program_type: 'Technology', source_tag: 'OFFICIAL', status: 'Active' },

  // ── 2819 Church (5 programs) ──
  { program_id: 'church_kx_main', org_id: 'church_kx', mode: 'church', program_name: 'Sunday Worship', program_type: 'Campus', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'church_kx_youth', org_id: 'church_kx', mode: 'church', program_name: 'Youth Ministry', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'church_kx_kids', org_id: 'church_kx', mode: 'church', program_name: 'Formation Kids', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'church_kx_groups', org_id: 'church_kx', mode: 'church', program_name: 'Squads', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'church_kx_outreach', org_id: 'church_kx', mode: 'church', program_name: '2819 Ministries', program_type: 'Ministry', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Howard University (4 programs) ──
  { program_id: 'edu_kx_main', org_id: 'edu_kx', mode: 'education', program_name: 'Academic Programs', program_type: 'Institution', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'edu_kx_stem', org_id: 'edu_kx', mode: 'education', program_name: 'College of Engineering & Architecture', program_type: 'Division', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'edu_kx_arts', org_id: 'edu_kx', mode: 'education', program_name: 'College of Arts & Sciences', program_type: 'Division', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'edu_kx_business', org_id: 'edu_kx', mode: 'education', program_name: 'School of Business', program_type: 'Division', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Adidas 3SSB (3 programs) ──
  { program_id: 'comp_kx_main', org_id: 'comp_kx', mode: 'competition', program_name: '3SSB Championship Circuit', program_type: 'League', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'comp_kx_qualifier', org_id: 'comp_kx', mode: 'competition', program_name: 'Jr. 3SSB', program_type: 'League', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'comp_kx_dev', org_id: 'comp_kx', mode: 'competition', program_name: '3SGB (3Stripes Gold)', program_type: 'League', source_tag: 'OFFICIAL', status: 'Active' },
];

// =============================================================================
// SEASONS
// =============================================================================

export const V2_SEASONS: V2Season[] = [
  // Carroll College Fighting Saints
  { season_id: 'kx_2025_26', org_id: 'sports_kx', mode: 'sports', season_name: '2025\u201326', start_date: '2025-10-01', end_date: '2026-04-01', is_current: true },
  { season_id: 'kx_2024_25', org_id: 'sports_kx', mode: 'sports', season_name: '2024\u201325', start_date: '2024-10-01', end_date: '2025-04-01', is_current: false },

  // Valuetainment
  { season_id: 'biz_kx_fy2026', org_id: 'biz_kx', mode: 'business', season_name: 'FY 2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // 2819 Church
  { season_id: 'church_kx_2026', org_id: 'church_kx', mode: 'church', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // Howard University
  { season_id: 'edu_kx_2025_26', org_id: 'edu_kx', mode: 'education', season_name: '2025\u201326 Academic Year', start_date: '2025-08-18', end_date: '2026-05-10', is_current: true },

  // Adidas 3SSB
  { season_id: 'comp_kx_s1_2026', org_id: 'comp_kx', mode: 'competition', season_name: '2025\u201326 Circuit', start_date: '2025-10-01', end_date: '2026-07-31', is_current: true },
];

// =============================================================================
// DEFAULT ACTIVE CONTEXT
// =============================================================================

export const DEFAULT_ACTIVE_CONTEXT: ActiveContext = {
  mode: 'sports',
  org_id: 'sports_kx',
  program_id: 'kx_mbb',
  season_id: 'kx_2025_26',
  membership_id: 'mem_sports_kx',
  derived_role_badge: 'System Owner',
};

// =============================================================================
// SEEDED RECENT CONTEXTS
// =============================================================================

export const SEEDED_RECENT_CONTEXTS: RecentContext[] = [
  {
    mode: 'sports', org_id: 'sports_kx', program_id: 'kx_mbb', season_id: 'kx_2025_26',
    membership_id: 'mem_sports_kx', derived_role_badge: 'System Owner', timestamp: Date.now() - 1000,
  },
  {
    mode: 'business', org_id: 'biz_kx', program_id: 'biz_kx_ops', season_id: 'biz_kx_fy2026',
    membership_id: 'mem_biz_kx', derived_role_badge: 'System Owner', timestamp: Date.now() - 2000,
  },
  {
    mode: 'church', org_id: 'church_kx', program_id: 'church_kx_main', season_id: 'church_kx_2026',
    membership_id: 'mem_church_kx', derived_role_badge: 'System Owner', timestamp: Date.now() - 3000,
  },
  {
    mode: 'education', org_id: 'edu_kx', program_id: 'edu_kx_main', season_id: 'edu_kx_2025_26',
    membership_id: 'mem_edu_kx', derived_role_badge: 'System Owner', timestamp: Date.now() - 4000,
  },
  {
    mode: 'competition', org_id: 'comp_kx', program_id: 'comp_kx_main', season_id: 'comp_kx_s1_2026',
    membership_id: 'mem_comp_kx', derived_role_badge: 'System Owner', timestamp: Date.now() - 5000,
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
  const badge = membership.role_titles.join(' \u00B7 ');

  return {
    mode,
    org_id: org.org_id,
    program_id: program.program_id,
    season_id: season.season_id,
    membership_id: membership.membership_id,
    derived_role_badge: badge,
  };
}
