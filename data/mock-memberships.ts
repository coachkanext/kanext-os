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
  { org_id: 'sports_kx', org_name: 'Lincoln University', mode: 'sports', location: 'Oakland, CA', org_type: 'college_athletics' },
  { org_id: 'sports_chs', org_name: 'Cathedral HS', mode: 'sports', location: 'Los Angeles, CA', org_type: 'high_school' },
  { org_id: 'sports_gsac', org_name: 'GSAC', mode: 'sports', location: 'Costa Mesa, CA', org_type: 'conference' },

  // ── Business ──
  { org_id: 'biz_kx', org_name: 'KaNeXT', mode: 'business', location: 'Atlanta, GA', org_type: 'platform', view_variant: 'Founder' },

  // ── Church ──
  { org_id: 'church_kx', org_name: 'ICC', mode: 'church', location: 'Los Angeles, CA', org_type: 'faith' },
  { org_id: 'church_grace', org_name: 'Grace Community', mode: 'church', location: 'Sun Valley, CA', org_type: 'faith' },

  // ── Education ──
  { org_id: 'edu_kx', org_name: 'Howard University', mode: 'education', location: 'Washington, DC', org_type: 'university' },

  // ── Competition ──
  { org_id: 'comp_kx', org_name: 'Adidas 3SSB', mode: 'competition', location: 'Rock Hill, SC', org_type: 'grassroots_basketball' },

  // ── Pulse ──
  { org_id: 'pb_kx', org_name: 'Pulse', mode: 'pulse', location: '', org_type: 'personal' },
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
    role_titles: ['Head Coach', 'GM', 'Recruiting Coordinator'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_sports_chs',
    mode: 'sports',
    org_id: 'sports_chs',
    role_titles: ['Parent'],
    permission_tier: 'View',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_sports_gsac',
    mode: 'sports',
    org_id: 'sports_gsac',
    role_titles: ['Conference Admin'],
    permission_tier: 'Full',
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
    role_titles: ['Ministry Leader'],
    permission_tier: 'Admin',
    program_scopes: ['*'],
  },
  {
    membership_id: 'mem_church_grace',
    mode: 'church',
    org_id: 'church_grace',
    role_titles: ['Member'],
    permission_tier: 'View',
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

  // ── Pulse ──
  {
    membership_id: 'mem_pb_kx',
    mode: 'pulse',
    org_id: 'pb_kx',
    role_titles: ['Owner'],
    permission_tier: 'Full',
    program_scopes: ['*'],
  },
];

// =============================================================================
// PROGRAMS
// =============================================================================

export const V2_PROGRAMS: V2Program[] = [
  // ── Lincoln University Oaklanders ──
  { program_id: 'kx_mbb', org_id: 'sports_kx', mode: 'sports', program_name: "Men's Basketball", program_type: 'Varsity', source_tag: 'KX_OFFICIAL', status: 'Active' },

  // ── Cathedral HS ──
  { program_id: 'chs_bball', org_id: 'sports_chs', mode: 'sports', program_name: 'Boys Basketball', program_type: 'Varsity', source_tag: 'OFFICIAL', status: 'Active' },

  // ── GSAC ──
  { program_id: 'gsac_conf', org_id: 'sports_gsac', mode: 'sports', program_name: 'Conference Operations', program_type: 'Conference', source_tag: 'OFFICIAL', status: 'Active' },

  // ── KaNeXT ──
  { program_id: 'biz_kx_ops', org_id: 'biz_kx', mode: 'business', program_name: 'KaNeXT Operations', program_type: 'Platform', source_tag: 'OFFICIAL', status: 'Active' },

  // ── ICC ──
  { program_id: 'church_kx_main', org_id: 'church_kx', mode: 'church', program_name: 'Sunday Worship', program_type: 'Campus', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Grace Community ──
  { program_id: 'church_grace_main', org_id: 'church_grace', mode: 'church', program_name: 'Main Campus', program_type: 'Campus', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Howard University (4 programs) ──
  { program_id: 'edu_kx_main', org_id: 'edu_kx', mode: 'education', program_name: 'Academic Programs', program_type: 'Institution', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'edu_kx_stem', org_id: 'edu_kx', mode: 'education', program_name: 'College of Engineering & Architecture', program_type: 'Division', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'edu_kx_arts', org_id: 'edu_kx', mode: 'education', program_name: 'College of Arts & Sciences', program_type: 'Division', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'edu_kx_business', org_id: 'edu_kx', mode: 'education', program_name: 'School of Business', program_type: 'Division', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Pulse ──
  { program_id: 'pb_kx_main', org_id: 'pb_kx', mode: 'pulse', program_name: 'Pulse', program_type: 'Personal', source_tag: 'OFFICIAL', status: 'Active' },

  // ── Adidas 3SSB (3 programs) ──
  { program_id: 'comp_kx_main', org_id: 'comp_kx', mode: 'competition', program_name: '3SSB Championship Circuit', program_type: 'League', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'comp_kx_qualifier', org_id: 'comp_kx', mode: 'competition', program_name: 'Jr. 3SSB', program_type: 'League', source_tag: 'OFFICIAL', status: 'Active' },
  { program_id: 'comp_kx_dev', org_id: 'comp_kx', mode: 'competition', program_name: '3SGB (3Stripes Gold)', program_type: 'League', source_tag: 'OFFICIAL', status: 'Active' },
];

// =============================================================================
// SEASONS
// =============================================================================

export const V2_SEASONS: V2Season[] = [
  // Lincoln University
  { season_id: 'kx_2025_26', org_id: 'sports_kx', mode: 'sports', season_name: '2025\u201326', start_date: '2025-10-01', end_date: '2026-04-01', is_current: true },

  // Cathedral HS
  { season_id: 'chs_2025_26', org_id: 'sports_chs', mode: 'sports', season_name: '2025\u201326', start_date: '2025-11-01', end_date: '2026-03-15', is_current: true },

  // GSAC
  { season_id: 'gsac_2025_26', org_id: 'sports_gsac', mode: 'sports', season_name: '2025\u201326', start_date: '2025-10-01', end_date: '2026-04-01', is_current: true },

  // KaNeXT
  { season_id: 'biz_kx_fy2026', org_id: 'biz_kx', mode: 'business', season_name: 'FY 2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // ICC
  { season_id: 'church_kx_2026', org_id: 'church_kx', mode: 'church', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // Grace Community
  { season_id: 'church_grace_2026', org_id: 'church_grace', mode: 'church', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

  // Howard University
  { season_id: 'edu_kx_2025_26', org_id: 'edu_kx', mode: 'education', season_name: '2025\u201326 Academic Year', start_date: '2025-08-18', end_date: '2026-05-10', is_current: true },

  // Pulse
  { season_id: 'pb_kx_2026', org_id: 'pb_kx', mode: 'pulse', season_name: '2026', start_date: '2026-01-01', end_date: '2026-12-31', is_current: true },

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
