/**
 * Sports RBAC — Role-Based Context Access for Universal Sports Sheets
 *
 * Maps membership_id → Sports Role Lens (R1–R5), then provides declarative
 * visibility matrices for every tab/section across Player, Team, and Game sheets.
 *
 * "One sheet, many lenses" — never create per-role UI pages. RBAC gating is
 * declarative: tabs/sections hide/show based on the active sports role lens.
 */

// =============================================================================
// ROLE LENS
// =============================================================================

export type SportsRoleLens = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

/**
 * R1 = AD + HC/GM (Full)
 * R2 = Player (Self-only)
 * R3 = Asst Coach + RC (Limited)
 * R4 = Scout / Analyst (Limited eval)
 * R5 = Fan (Public only)
 */
const SPORTS_ROLE_MAP: Record<string, SportsRoleLens> = {
  mem_sports_fmu_admin: 'R1',
};

export function getSportsRole(membershipId: string): SportsRoleLens {
  return SPORTS_ROLE_MAP[membershipId] ?? 'R1';
}

// =============================================================================
// VISIBILITY LEVELS
// =============================================================================

export type Visibility = 'full' | 'limited' | 'self' | 'shared' | 'hidden';

export type KRVisibility = 'full' | 'bands' | 'partial_self' | 'hidden';

// =============================================================================
// PLAYER SHEET — 9 CANONICAL TABS
// =============================================================================

export type PlayerTab =
  | 'overview'
  | 'performance'
  | 'film'
  | 'kanext_eval'
  | 'fit_role'
  | 'development'
  | 'health'
  | 'admin'
  | 'recruiting';

export const PLAYER_TAB_LABELS: Record<PlayerTab, string> = {
  overview: 'Overview',
  performance: 'Performance',
  film: 'Film',
  kanext_eval: 'KaNeXT Eval',
  fit_role: 'Fit + Role',
  development: 'Development',
  health: 'Health',
  admin: 'Admin',
  recruiting: 'Recruiting',
};

export const PLAYER_TAB_ORDER: PlayerTab[] = [
  'overview', 'performance', 'film', 'kanext_eval', 'fit_role',
  'development', 'health', 'admin', 'recruiting',
];

/** Player Sheet visibility matrix: Tab → Role → Visibility */
const PLAYER_SHEET_MATRIX: Record<PlayerTab, Record<SportsRoleLens, Visibility>> = {
  overview:     { R1: 'full', R2: 'self',    R3: 'limited', R4: 'shared',  R5: 'limited' },
  performance:  { R1: 'full', R2: 'self',    R3: 'limited', R4: 'shared',  R5: 'limited' },
  film:         { R1: 'full', R2: 'self',    R3: 'limited', R4: 'shared',  R5: 'limited' },
  kanext_eval:  { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  fit_role:     { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  development:  { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  health:       { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  admin:        { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  recruiting:   { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
};

// =============================================================================
// TEAM SHEET — 10 CANONICAL TABS
// =============================================================================

export type TeamTab =
  | 'overview'
  | 'roster'
  | 'systems'
  | 'performance'
  | 'lineups'
  | 'schedule'
  | 'staff'
  | 'operations'
  | 'finance'
  | 'compliance';

export const TEAM_TAB_LABELS: Record<TeamTab, string> = {
  overview: 'Overview',
  roster: 'Roster',
  systems: 'Systems',
  performance: 'Performance',
  lineups: 'Lineups',
  schedule: 'Schedule',
  staff: 'Staff',
  operations: 'Operations',
  finance: 'Finance',
  compliance: 'Compliance',
};

export const TEAM_TAB_ORDER: TeamTab[] = [
  'overview', 'roster', 'systems', 'performance', 'lineups',
  'schedule', 'staff', 'operations', 'finance', 'compliance',
];

/** Team Sheet visibility matrix */
const TEAM_SHEET_MATRIX: Record<TeamTab, Record<SportsRoleLens, Visibility>> = {
  overview:     { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  roster:       { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  systems:      { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  performance:  { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  lineups:      { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  schedule:     { R1: 'full', R2: 'limited', R3: 'limited', R4: 'limited', R5: 'limited' },
  staff:        { R1: 'full', R2: 'limited', R3: 'limited', R4: 'limited', R5: 'limited' },
  operations:   { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  finance:      { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  compliance:   { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
};

// =============================================================================
// GAME SHEET — 5 CANONICAL TABS
// =============================================================================

export type GameTab =
  | 'pregame'
  | 'live'
  | 'postgame'
  | 'ad_overlay'
  | 'incidents';

export const GAME_TAB_LABELS: Record<GameTab, string> = {
  pregame: 'Pregame',
  live: 'Live',
  postgame: 'Postgame',
  ad_overlay: 'AD Overlay',
  incidents: 'Incidents',
};

export const GAME_TAB_ORDER: GameTab[] = [
  'pregame', 'live', 'postgame', 'ad_overlay', 'incidents',
];

/** Game Sheet visibility matrix */
const GAME_SHEET_MATRIX: Record<GameTab, Record<SportsRoleLens, Visibility>> = {
  pregame:    { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  live:       { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  postgame:   { R1: 'full', R2: 'limited', R3: 'limited', R4: 'shared',  R5: 'limited' },
  ad_overlay: { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  incidents:  { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
};

// =============================================================================
// TAB FILTER FUNCTIONS
// =============================================================================

/** Returns visible Player Sheet tabs for a role (in canonical order) */
export function getPlayerSheetTabs(role: SportsRoleLens): { key: PlayerTab; label: string }[] {
  return PLAYER_TAB_ORDER
    .filter((tab) => PLAYER_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: PLAYER_TAB_LABELS[tab] }));
}

/** Returns visible Team Sheet tabs for a role (in canonical order) */
export function getTeamSheetTabs(role: SportsRoleLens): { key: TeamTab; label: string }[] {
  return TEAM_TAB_ORDER
    .filter((tab) => TEAM_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: TEAM_TAB_LABELS[tab] }));
}

/** Returns visible Game Sheet tabs for a role (in canonical order) */
export function getGameSheetTabs(role: SportsRoleLens): { key: GameTab; label: string }[] {
  return GAME_TAB_ORDER
    .filter((tab) => GAME_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: GAME_TAB_LABELS[tab] }));
}

/** Get the visibility level for a specific player tab + role */
export function getPlayerTabVisibility(tab: PlayerTab, role: SportsRoleLens): Visibility {
  return PLAYER_SHEET_MATRIX[tab][role];
}

/** Get the visibility level for a specific team tab + role */
export function getTeamTabVisibility(tab: TeamTab, role: SportsRoleLens): Visibility {
  return TEAM_SHEET_MATRIX[tab][role];
}

/** Get the visibility level for a specific game tab + role */
export function getGameTabVisibility(tab: GameTab, role: SportsRoleLens): Visibility {
  return GAME_SHEET_MATRIX[tab][role];
}

// =============================================================================
// KR VISIBILITY POLICY
// =============================================================================

/**
 * R1 = full (exact numbers + confidence + coverage tier)
 * R3 = bands (e.g. 88–90)
 * R2 = partial_self (clusters only, own data)
 * R4 = hidden
 * R5 = hidden
 */
const KR_VISIBILITY_MAP: Record<SportsRoleLens, KRVisibility> = {
  R1: 'full',
  R2: 'partial_self',
  R3: 'bands',
  R4: 'hidden',
  R5: 'hidden',
};

export function getKRVisibility(role: SportsRoleLens): KRVisibility {
  return KR_VISIBILITY_MAP[role];
}

/** Format a KR value according to visibility policy */
export function formatKR(value: number, visibility: KRVisibility): string {
  switch (visibility) {
    case 'full':
      return `${value}`;
    case 'bands': {
      const low = Math.floor(value / 3) * 3;
      return `${low}–${low + 2}`;
    }
    case 'partial_self':
      return `${value}`;
    case 'hidden':
      return '—';
  }
}

// =============================================================================
// STATS HUB — 7 CANONICAL TABS
// =============================================================================

export type StatsTab =
  | 'dashboard'
  | 'traditional'
  | 'kr_intelligence'
  | 'clusters'
  | 'lineups'
  | 'play_types'
  | 'players';

export const STATS_TAB_LABELS: Record<StatsTab, string> = {
  dashboard: 'Dashboard',
  traditional: 'Traditional',
  kr_intelligence: 'KR Intelligence',
  clusters: 'Clusters',
  lineups: 'Lineups',
  play_types: 'Play Types',
  players: 'Players',
};

export const STATS_TAB_ORDER: StatsTab[] = [
  'dashboard', 'traditional', 'kr_intelligence', 'clusters',
  'lineups', 'play_types', 'players',
];

/** Stats Hub visibility matrix: Tab → Role → Visibility */
const STATS_HUB_MATRIX: Record<StatsTab, Record<SportsRoleLens, Visibility>> = {
  dashboard:       { R1: 'full',    R2: 'full',    R3: 'full',    R4: 'full',    R5: 'full' },
  traditional:     { R1: 'full',    R2: 'limited', R3: 'full',    R4: 'full',    R5: 'full' },
  kr_intelligence: { R1: 'full',    R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  clusters:        { R1: 'full',    R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  lineups:         { R1: 'full',    R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  play_types:      { R1: 'full',    R2: 'hidden',  R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  players:         { R1: 'full',    R2: 'limited', R3: 'full',    R4: 'full',    R5: 'full' },
};

/** Returns visible Stats Hub tabs for a role (in canonical order) */
export function getStatsHubTabs(role: SportsRoleLens): { key: StatsTab; label: string }[] {
  return STATS_TAB_ORDER
    .filter((tab) => STATS_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: STATS_TAB_LABELS[tab] }));
}

/** Get the visibility level for a specific stats tab + role */
export function getStatsTabVisibility(tab: StatsTab, role: SportsRoleLens): Visibility {
  return STATS_HUB_MATRIX[tab][role];
}

// =============================================================================
// SENSITIVE DATA POLICY
// =============================================================================

/**
 * Only R1 can see: NIL amounts, aid details, health timelines,
 * compliance records, revenue/finance data.
 */
export function canSeeSensitive(role: SportsRoleLens): boolean {
  return role === 'R1';
}

/** R1 + R3 can see compare / coaching actions */
export function canSeeCoachActions(role: SportsRoleLens): boolean {
  return role === 'R1' || role === 'R3';
}

/** R1 only: offer, aid, NIL buttons */
export function canSeeAdminActions(role: SportsRoleLens): boolean {
  return role === 'R1';
}

// =============================================================================
// ROSTER VIEW RBAC
// =============================================================================

export type RosterViewMode = 'list' | 'system' | 'cards';

const ROSTER_VIEW_MATRIX: Record<SportsRoleLens, RosterViewMode[]> = {
  R1: ['list', 'system', 'cards'],
  R2: ['cards'],
  R3: ['list', 'system', 'cards'],
  R4: ['list', 'system', 'cards'],
  R5: ['cards'],
};

const ROSTER_DEFAULT_VIEW: Record<SportsRoleLens, RosterViewMode> = {
  R1: 'list',
  R2: 'cards',
  R3: 'list',
  R4: 'cards',
  R5: 'cards',
};

/** Returns visible roster view modes for a given role */
export function getVisibleRosterViews(role: SportsRoleLens): RosterViewMode[] {
  return ROSTER_VIEW_MATRIX[role];
}

/** Returns the default roster view mode for a given role */
export function getDefaultRosterView(role: SportsRoleLens): RosterViewMode {
  return ROSTER_DEFAULT_VIEW[role];
}

// =============================================================================
// VIDEO SECTION — 16 RBAC-GATED SECTIONS (Explore + Film Room + Library)
// =============================================================================

export type VideoSection =
  // Explore shelves (8)
  | 'explore_official_releases'
  | 'explore_game_center'
  | 'explore_player_hub'
  | 'explore_practice_install'
  | 'explore_scouting_opponent'
  | 'explore_recruiting_targets'
  | 'explore_development_clips'
  | 'explore_conference_league'
  // Film Room tabs (4)
  | 'filmroom_workspaces'
  | 'filmroom_cutups'
  | 'filmroom_assignments'
  | 'filmroom_notes'
  // Library sections (4)
  | 'library_official_games'
  | 'library_practices_install'
  | 'library_player_development'
  | 'library_public_media';

const VIDEO_SECTION_MATRIX: Record<VideoSection, Record<SportsRoleLens, Visibility>> = {
  // Explore
  explore_official_releases:    { R1: 'full', R2: 'full',    R3: 'full',    R4: 'shared',  R5: 'full' },
  explore_game_center:          { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'limited' },
  explore_player_hub:           { R1: 'full', R2: 'self',    R3: 'full',    R4: 'shared',  R5: 'limited' },
  explore_practice_install:     { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  explore_scouting_opponent:    { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'shared',  R5: 'hidden' },
  explore_recruiting_targets:   { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  explore_development_clips:    { R1: 'full', R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  explore_conference_league:    { R1: 'full', R2: 'full',    R3: 'full',    R4: 'shared',  R5: 'full' },
  // Film Room
  filmroom_workspaces:          { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'hidden' },
  filmroom_cutups:              { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'hidden' },
  filmroom_assignments:         { R1: 'full', R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  filmroom_notes:               { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'hidden' },
  // Library
  library_official_games:       { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'limited' },
  library_practices_install:    { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  library_player_development:   { R1: 'full', R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  library_public_media:         { R1: 'full', R2: 'full',    R3: 'full',    R4: 'full',    R5: 'full' },
};

export function getVideoSectionVisibility(section: VideoSection, role: SportsRoleLens): Visibility {
  return VIDEO_SECTION_MATRIX[section][role];
}

// =============================================================================
// MESSAGES SECTION — 20 RBAC-GATED SECTIONS (Inbox + Rooms + Requests + Pinned)
// =============================================================================

export type MessagesSection =
  // Inbox types (5)
  | 'inbox_blockers'
  | 'inbox_approvals'
  | 'inbox_recruiting'
  | 'inbox_nil'
  | 'inbox_eligibility'
  // Room categories (7)
  | 'rooms_command'
  | 'rooms_staff'
  | 'rooms_player'
  | 'rooms_recruiting'
  | 'rooms_ops_travel'
  | 'rooms_media'
  | 'rooms_compliance'
  // Request types (7)
  | 'requests_approval'
  | 'requests_roster'
  | 'requests_schedule'
  | 'requests_recruiting'
  | 'requests_eligibility'
  | 'requests_finance'
  | 'requests_incident'
  // Pinned
  | 'pinned_full';

const MESSAGES_SECTION_MATRIX: Record<MessagesSection, Record<SportsRoleLens, Visibility>> = {
  // Inbox
  inbox_blockers:       { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  inbox_approvals:      { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  inbox_recruiting:     { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  inbox_nil:            { R1: 'full', R2: 'limited', R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  inbox_eligibility:    { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  // Rooms
  rooms_command:        { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  rooms_staff:          { R1: 'full', R2: 'hidden',  R3: 'full',    R4: 'limited', R5: 'hidden' },
  rooms_player:         { R1: 'full', R2: 'full',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  rooms_recruiting:     { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  rooms_ops_travel:     { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  rooms_media:          { R1: 'full', R2: 'limited', R3: 'full',    R4: 'shared',  R5: 'hidden' },
  rooms_compliance:     { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  // Requests
  requests_approval:    { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  requests_roster:      { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  requests_schedule:    { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  requests_recruiting:  { R1: 'full', R2: 'hidden',  R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  requests_eligibility: { R1: 'full', R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  requests_finance:     { R1: 'full', R2: 'hidden',  R3: 'hidden',  R4: 'hidden',  R5: 'hidden' },
  requests_incident:    { R1: 'full', R2: 'limited', R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  // Pinned
  pinned_full:          { R1: 'full', R2: 'limited', R3: 'limited', R4: 'hidden',  R5: 'hidden' },
};

export function getMessagesSectionVisibility(section: MessagesSection, role: SportsRoleLens): Visibility {
  return MESSAGES_SECTION_MATRIX[section][role];
}
