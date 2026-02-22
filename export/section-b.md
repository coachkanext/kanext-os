## Section B: RBAC / Permissions

### B1. utils/unified-rbac.ts

```typescript
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
```

### B2. utils/sports-rbac.ts

```typescript
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
// GAME PLAN HUB — 7 CANONICAL TABS
// =============================================================================

export type GamePlanTab =
  | 'overview'
  | 'offense'
  | 'defense'
  | 'matchups'
  | 'rotation'
  | 'scout'
  | 'staff';

export const GAME_PLAN_TAB_LABELS: Record<GamePlanTab, string> = {
  overview: 'Overview',
  offense: 'Offense',
  defense: 'Defense',
  matchups: 'Matchups',
  rotation: 'Rotation',
  scout: 'Scout',
  staff: 'Staff',
};

export const GAME_PLAN_TAB_ORDER: GamePlanTab[] = [
  'overview', 'offense', 'defense', 'matchups', 'rotation', 'scout', 'staff',
];

/**
 * Game Plan RBAC:
 * R1 (AD/HC): Full access all 7 tabs
 * R2 (Player): Overview only (limited — sees win prob, matchup header, own assignment)
 * R3 (Asst Coach): All tabs, KR values as bands
 * R4 (Medical): No access — competitive intelligence
 * R5 (Fan): No access
 */
const GAME_PLAN_HUB_MATRIX: Record<GamePlanTab, Record<SportsRoleLens, Visibility>> = {
  overview:  { R1: 'full',   R2: 'limited', R3: 'full',    R4: 'hidden', R5: 'hidden' },
  offense:   { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  defense:   { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  matchups:  { R1: 'full',   R2: 'limited', R3: 'full',    R4: 'hidden', R5: 'hidden' },
  rotation:  { R1: 'full',   R2: 'hidden',  R3: 'limited', R4: 'hidden', R5: 'hidden' },
  scout:     { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  staff:     { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
};

export function getGamePlanHubTabs(role: SportsRoleLens): { key: GamePlanTab; label: string }[] {
  return GAME_PLAN_TAB_ORDER
    .filter((tab) => GAME_PLAN_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: GAME_PLAN_TAB_LABELS[tab] }));
}

export function getGamePlanTabVisibility(tab: GamePlanTab, role: SportsRoleLens): Visibility {
  return GAME_PLAN_HUB_MATRIX[tab][role];
}

// =============================================================================
// SIMULATION HUB — 6 CANONICAL TABS
// =============================================================================

export type SimulationTab =
  | 'overview'
  | 'system_x_system'
  | 'possession_engine'
  | 'matchup_interactions'
  | 'box_score_projection'
  | 'scenarios';

export const SIMULATION_TAB_LABELS: Record<SimulationTab, string> = {
  overview: 'Overview',
  system_x_system: 'System x System',
  possession_engine: 'Possession Engine',
  matchup_interactions: 'Matchup Interactions',
  box_score_projection: 'Box Score',
  scenarios: 'Scenarios',
};

export const SIMULATION_TAB_ORDER: SimulationTab[] = [
  'overview', 'system_x_system', 'possession_engine',
  'matchup_interactions', 'box_score_projection', 'scenarios',
];

/**
 * Simulation RBAC:
 * R1 (AD): Full access all 6, sees exact KRs, line translation
 * R2 (Player): Overview only — win prob, pace, five factors
 * R3 (Asst Coach): All tabs, KR as bands, no line translation
 * R4-R5: No access
 */
const SIMULATION_HUB_MATRIX: Record<SimulationTab, Record<SportsRoleLens, Visibility>> = {
  overview:              { R1: 'full',   R2: 'limited', R3: 'full',    R4: 'hidden', R5: 'hidden' },
  system_x_system:       { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  possession_engine:     { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  matchup_interactions:  { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  box_score_projection:  { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden', R5: 'hidden' },
  scenarios:             { R1: 'full',   R2: 'hidden',  R3: 'limited', R4: 'hidden', R5: 'hidden' },
};

export function getSimulationHubTabs(role: SportsRoleLens): { key: SimulationTab; label: string }[] {
  return SIMULATION_TAB_ORDER
    .filter((tab) => SIMULATION_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: SIMULATION_TAB_LABELS[tab] }));
}

export function getSimulationTabVisibility(tab: SimulationTab, role: SportsRoleLens): Visibility {
  return SIMULATION_HUB_MATRIX[tab][role];
}

// =============================================================================
// DEVELOPMENT HUB — 7 CANONICAL TABS
// =============================================================================

export type DevelopmentTab =
  | 'overview'
  | 'player_kr_profile'
  | 'pathway'
  | 'weekly_plan'
  | 'evidence'
  | 'pro_readiness'
  | 'transfer_portal';

export const DEVELOPMENT_TAB_LABELS: Record<DevelopmentTab, string> = {
  overview: 'Overview',
  player_kr_profile: 'KR Profile',
  pathway: 'Pathway',
  weekly_plan: 'Weekly Plan',
  evidence: 'Evidence',
  pro_readiness: 'Pro Readiness',
  transfer_portal: 'Transfer',
};

export const DEVELOPMENT_TAB_ORDER: DevelopmentTab[] = [
  'overview', 'player_kr_profile', 'pathway', 'weekly_plan',
  'evidence', 'pro_readiness', 'transfer_portal',
];

/**
 * Development RBAC:
 * R1 (AD/HC): Full access all 7, all players
 * R2 (Player): Own profile (tabs 2-6 self only), no overview, no transfer
 * R3 (Asst Coach): All tabs, KR as bands, no economic projections
 * R4 (Medical): Overview + weekly plan + evidence (limited)
 * R5 (Fan): No access
 */
const DEVELOPMENT_HUB_MATRIX: Record<DevelopmentTab, Record<SportsRoleLens, Visibility>> = {
  overview:          { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'limited', R5: 'hidden' },
  player_kr_profile: { R1: 'full',   R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  pathway:           { R1: 'full',   R2: 'self',    R3: 'full',    R4: 'hidden',  R5: 'hidden' },
  weekly_plan:       { R1: 'full',   R2: 'self',    R3: 'full',    R4: 'limited', R5: 'hidden' },
  evidence:          { R1: 'full',   R2: 'self',    R3: 'full',    R4: 'limited', R5: 'hidden' },
  pro_readiness:     { R1: 'full',   R2: 'self',    R3: 'limited', R4: 'hidden',  R5: 'hidden' },
  transfer_portal:   { R1: 'full',   R2: 'hidden',  R3: 'full',    R4: 'hidden',  R5: 'hidden' },
};

export function getDevelopmentHubTabs(role: SportsRoleLens): { key: DevelopmentTab; label: string }[] {
  return DEVELOPMENT_TAB_ORDER
    .filter((tab) => DEVELOPMENT_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: DEVELOPMENT_TAB_LABELS[tab] }));
}

export function getDevelopmentTabVisibility(tab: DevelopmentTab, role: SportsRoleLens): Visibility {
  return DEVELOPMENT_HUB_MATRIX[tab][role];
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
```

### B3. utils/church-rbac.ts

```typescript
/**
 * Church Mode RBAC — 11-level role lens visibility matrix.
 *
 * C1:  Senior Pastor           (spec CH1)
 * C2:  Elder / Board           (spec CH3)
 * C3:  Staff                   (spec CH5)
 * C4:  Member                  (spec CH8)
 * C5:  Visitor / Public        (spec CH11)
 * C6:  Lead / Executive Pastor (spec CH2)
 * C7:  Ministry Leader         (spec CH4)
 * C8:  Worship Team            (spec CH6)
 * C9:  Volunteer               (spec CH7)
 * C10: Regular Attendee        (spec CH10)
 * C11: New Believer            (spec CH9)
 *
 * Privilege order: C1 > C6 > C2 > C7 > C3 > C8 > C9 > C4 > C11 > C10 > C5
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type ChurchRoleLens =
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  | 'C6' | 'C7' | 'C8' | 'C9' | 'C10' | 'C11';

export type ChurchVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const CHURCH_ROLE_LABELS: Record<ChurchRoleLens, string> = {
  C1: 'Senior Pastor',
  C2: 'Elder / Board',
  C3: 'Staff',
  C4: 'Member',
  C5: 'Visitor / Public',
  C6: 'Lead / Executive Pastor',
  C7: 'Ministry Leader',
  C8: 'Worship Team',
  C9: 'Volunteer',
  C10: 'Regular Attendee',
  C11: 'New Believer',
};

// Helper to build an 11-column row concisely
type V = ChurchVisibility;
function r(c1: V, c2: V, c3: V, c4: V, c5: V, c6: V, c7: V, c8: V, c9: V, c10: V, c11: V): Record<ChurchRoleLens, V> {
  return { C1: c1, C2: c2, C3: c3, C4: c4, C5: c5, C6: c6, C7: c7, C8: c8, C9: c9, C10: c10, C11: c11 };
}

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type ChurchHomeTab =
  | 'dashboard' | 'calendar' | 'worship' | 'community' | 'serve'
  | 'give' | 'events' | 'prayer' | 'messages' | 'discipleship';

//                                                         C1      C2      C3      C4       C5        C6      C7      C8      C9       C10      C11
const CHURCH_HOME_TAB_MATRIX: Record<ChurchHomeTab, Record<ChurchRoleLens, V>> = {
  dashboard:    r('full',    'full',    'full',    'limited', 'limited', 'full',    'full',    'full',    'limited', 'limited', 'limited'),
  calendar:     r('full',    'full',    'full',    'limited', 'limited', 'full',    'full',    'full',    'limited', 'limited', 'limited'),
  worship:      r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  community:    r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  serve:        r('full',    'full',    'limited', 'limited', 'hidden',  'full',    'full',    'limited', 'limited', 'hidden',  'hidden'),
  give:         r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  events:       r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  prayer:       r('full',    'full',    'limited', 'full',    'hidden',  'full',    'full',    'limited', 'full',    'hidden',  'full'),
  messages:     r('full',    'full',    'full',    'full',    'limited', 'full',    'full',    'full',    'full',    'limited', 'full'),
  discipleship: r('full',    'full',    'limited', 'limited', 'hidden',  'full',    'limited', 'limited', 'limited', 'hidden',  'limited'),
};

export function getChurchHomeTabVisibility(tab: ChurchHomeTab, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_HOME_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type ChurchHomePill = 'dashboard' | 'calendar' | 'ministries' | 'connect';

//                                                           C1     C2     C3     C4       C5       C6     C7     C8     C9       C10      C11
const CHURCH_HOME_PILL_MATRIX: Record<ChurchHomePill, Record<ChurchRoleLens, V>> = {
  dashboard:  r('full', 'full', 'full',   'full',   'full',   'full', 'full', 'full',   'full',   'full',   'full'),
  calendar:   r('full', 'full', 'full',   'full',   'full',   'full', 'full', 'full',   'full',   'full',   'full'),
  ministries: r('full', 'full', 'full',   'full',   'hidden', 'full', 'full', 'full',   'full',   'hidden', 'full'),
  connect:    r('full', 'full', 'full',   'hidden', 'hidden', 'full', 'full', 'full',   'hidden', 'hidden', 'hidden'),
};

export function getChurchVisiblePills(role: ChurchRoleLens): ChurchHomePill[] {
  return (Object.keys(CHURCH_HOME_PILL_MATRIX) as ChurchHomePill[])
    .filter((pill) => CHURCH_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY
// =============================================================================

export type ChurchDashboardSection =
  | 'video_hero' | 'next_service' | 'commerce_row'
  | 'ministry_health' | 'growth_metrics';

//                                                                      C1     C2      C3      C4       C5       C6     C7      C8       C9       C10      C11
const CHURCH_DASHBOARD_SECTION_MATRIX: Record<ChurchDashboardSection, Record<ChurchRoleLens, V>> = {
  video_hero:       r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  next_service:     r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  commerce_row:     r('full', 'full',    'full',    'full',    'full',    'full', 'full',    'full',    'full',    'full',    'full'),
  ministry_health:  r('full', 'limited', 'limited', 'hidden', 'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  growth_metrics:   r('full', 'full',    'limited', 'limited', 'hidden', 'full', 'limited', 'limited', 'limited', 'limited', 'limited'),
};

export function canSeeChurchDashboardSection(section: ChurchDashboardSection, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_DASHBOARD_SECTION_MATRIX[section]?.[role] ?? 'hidden';
}

// =============================================================================
// ORG TAB VISIBILITY
// =============================================================================

export type ChurchOrgTab =
  | 'ministries' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'facilities' | 'resources' | 'donations';

//                                                         C1     C2      C3       C4       C5       C6     C7      C8       C9       C10      C11
const CHURCH_ORG_TAB_MATRIX: Record<ChurchOrgTab, Record<ChurchRoleLens, V>> = {
  ministries:      r('full', 'full',    'full',    'limited', 'limited', 'full', 'full',    'full',    'limited', 'limited', 'limited'),
  people:          r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  rooms:           r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'full',    'limited', 'hidden',  'hidden',  'hidden'),
  operations:      r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden'),
  finance:         r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  'payment-rails': r('full', 'full',    'hidden',  'hidden',  'hidden',  'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  compliance:      r('full', 'full',    'limited', 'hidden',  'hidden',  'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden'),
  facilities:      r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  resources:       r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
  donations:       r('full', 'full',    'limited', 'limited', 'hidden',  'full', 'full',    'limited', 'limited', 'hidden',  'hidden'),
};

export function getChurchOrgTabVisibility(tab: ChurchOrgTab, role: ChurchRoleLens): ChurchVisibility {
  return CHURCH_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleChurchOrgTabs(role: ChurchRoleLens): ChurchOrgTab[] {
  return (Object.keys(CHURCH_ORG_TAB_MATRIX) as ChurchOrgTab[])
    .filter((tab) => CHURCH_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface ChurchQuickAction {
  id: string;
  label: string;
  icon: string;
}

const CHURCH_QUICK_ACTIONS: Record<ChurchRoleLens, ChurchQuickAction[]> = {
  C1: [
    { id: 'worship-plan', label: 'Worship Plan', icon: 'music.note.list' },
    { id: 'sermon-prep', label: 'Sermon Prep', icon: 'book.fill' },
    { id: 'staff-meeting', label: 'Staff Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'prayer-wall', label: 'Prayer Wall', icon: 'hands.sparkles.fill' },
    { id: 'post-announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'approve-requests', label: 'Approve Requests', icon: 'checkmark.seal.fill' },
    { id: 'pin-hero-video', label: 'Pin Hero Video', icon: 'pin.fill' },
    { id: 'open-payment-rails', label: 'Payment Rails', icon: 'creditcard.fill' },
    { id: 'open-announcements', label: 'Announcements', icon: 'bell.fill' },
  ],
  C6: [
    { id: 'worship-plan', label: 'Worship Plan', icon: 'music.note.list' },
    { id: 'sermon-prep', label: 'Sermon Prep', icon: 'book.fill' },
    { id: 'staff-meeting', label: 'Staff Meeting', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'prayer-wall', label: 'Prayer Wall', icon: 'hands.sparkles.fill' },
    { id: 'post-announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'approve-requests', label: 'Approve Requests', icon: 'checkmark.seal.fill' },
  ],
  C2: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar.badge.plus' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'post-update', label: 'Post Update', icon: 'square.and.pencil' },
    { id: 'request-budget', label: 'Request Budget', icon: 'dollarsign.circle.fill' },
    { id: 'open-my-ministry', label: 'Open My Ministry', icon: 'heart.fill' },
    { id: 'open-check-in', label: 'Open Check-In', icon: 'checkmark.circle.fill' },
    { id: 'schedule-event', label: 'Schedule Event', icon: 'clock.fill' },
  ],
  C7: [
    { id: 'create-event', label: 'Create Event', icon: 'calendar.badge.plus' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: 'person.3.fill' },
    { id: 'open-my-ministry', label: 'Open My Ministry', icon: 'heart.fill' },
    { id: 'open-check-in', label: 'Open Check-In', icon: 'checkmark.circle.fill' },
    { id: 'post-update', label: 'Post Update', icon: 'square.and.pencil' },
  ],
  C3: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'submit-request', label: 'Submit Request', icon: 'paperplane.fill' },
    { id: 'open-check-in', label: 'Check-In', icon: 'checkmark.circle.fill' },
  ],
  C8: [
    { id: 'my-ministries', label: 'My Ministries', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
  ],
  C9: [
    { id: 'volunteer-schedule', label: 'Volunteer Schedule', icon: 'clock.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C4: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C11: [
    { id: 'worship', label: 'Watch Worship', icon: 'play.circle.fill' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'prayer', label: 'Prayer Request', icon: 'hands.sparkles.fill' },
  ],
  C10: [
    { id: 'worship', label: 'Watch Online', icon: 'play.circle.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'give', label: 'Give', icon: 'heart.fill' },
  ],
  C5: [
    { id: 'visit', label: 'Plan a Visit', icon: 'mappin.and.ellipse' },
    { id: 'worship', label: 'Watch Online', icon: 'play.circle.fill' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ],
};

export function getChurchQuickActions(role: ChurchRoleLens): ChurchQuickAction[] {
  return CHURCH_QUICK_ACTIONS[role] || CHURCH_QUICK_ACTIONS.C5;
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

const MEMBER_LEVEL_ROLES: Set<ChurchRoleLens> = new Set(['C4', 'C5', 'C9', 'C10', 'C11']);

export function isSeniorPastor(role: ChurchRoleLens): boolean {
  return role === 'C1';
}

export function isElderLevel(role: ChurchRoleLens): boolean {
  return role === 'C1' || role === 'C2' || role === 'C6';
}

export function isStaffLevel(role: ChurchRoleLens): boolean {
  return role === 'C1' || role === 'C2' || role === 'C3' || role === 'C6' || role === 'C7' || role === 'C8';
}

export function isMember(role: ChurchRoleLens): boolean {
  return role !== 'C5';
}

// =============================================================================
// BACKWARD COMPAT — used by universal-member-sheet, universal-ministry-sheet,
// universal-service-sheet from previous session
// =============================================================================

export type MemberTab = 'overview' | 'giving' | 'groups' | 'notes' | 'ministry_involvement' | 'schedule_attendance' | 'care_followup' | 'tasks_workflow' | 'messages' | 'safety_compliance' | 'admin';
export type MinistryTab = 'overview' | 'members' | 'schedule' | 'budget' | 'people' | 'operations' | 'safety_compliance' | 'content_media' | 'notes';
export type ServiceTab = 'overview' | 'team' | 'setlist' | 'notes' | 'agenda' | 'assignments' | 'run_of_show' | 'ops_checklist' | 'attendance' | 'incidents' | 'recap_followup';

export function getMemberSheetTabs(role: ChurchRoleLens): { id: MemberTab; label: string }[] {
  const all: { id: MemberTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'giving', label: 'Giving' },
    { id: 'groups', label: 'Groups' },
    { id: 'notes', label: 'Notes' },
  ];
  if (MEMBER_LEVEL_ROLES.has(role)) return all.filter((t) => t.id === 'overview' || t.id === 'groups');
  return all;
}

export function getMinistrySheetTabs(role: ChurchRoleLens): { id: MinistryTab; label: string }[] {
  const all: { id: MinistryTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'budget', label: 'Budget' },
  ];
  if (MEMBER_LEVEL_ROLES.has(role)) return all.filter((t) => t.id === 'overview');
  return all;
}

export function getServiceSheetTabs(role: ChurchRoleLens): { id: ServiceTab; label: string }[] {
  const all: { id: ServiceTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'setlist', label: 'Setlist' },
    { id: 'notes', label: 'Notes' },
  ];
  if (role === 'C5') return all.filter((t) => t.id === 'overview');
  return all;
}

export function isMinistryLevel(role: ChurchRoleLens): boolean {
  return isStaffLevel(role);
}

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const CHURCH_MEMBERSHIP_MAP: Record<string, ChurchRoleLens> = {
  mem_church_iccla: 'C1',
};

export function getChurchRole(membershipId: string): ChurchRoleLens {
  return CHURCH_MEMBERSHIP_MAP[membershipId] ?? 'C1';
}

export function mapRoleToChurchLens(role: string): ChurchRoleLens {
  switch (role) {
    case 'senior_pastor':
    case 'pastor':
      return 'C1';
    case 'lead_pastor':
    case 'executive_pastor':
      return 'C6';
    case 'elder':
    case 'board':
    case 'deacon':
      return 'C2';
    case 'ministry_leader':
      return 'C7';
    case 'staff':
    case 'youth_pastor':
      return 'C3';
    case 'worship_leader':
    case 'worship_team':
      return 'C8';
    case 'volunteer':
      return 'C9';
    case 'member':
      return 'C4';
    case 'new_believer':
      return 'C11';
    case 'regular':
    case 'attendee':
      return 'C10';
    case 'visitor':
    case 'public':
    case 'guest':
      return 'C5';
    default:
      return 'C5';
  }
}
```

### B4. utils/education-rbac.ts

```typescript
/**
 * Education Mode RBAC — 13-level role lens visibility matrix.
 * E1:  President / Chancellor
 * E2:  Provost / Dean
 * E3:  Department Chair / Faculty
 * E4:  Student Services / Counseling
 * E5:  Registrar / Compliance
 * E6:  Facilities / Campus Ops
 * E7:  Student
 * E8:  Parent / Guardian
 * E9:  Alumnus
 * E10: Prospective Student
 * E11: Donor / Endowment
 * E12: Accreditor / External Evaluator
 * E13: Board of Trustees
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type EducationRoleLens =
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7'
  | 'E8' | 'E9' | 'E10' | 'E11' | 'E12' | 'E13';

export type EducationVisibility = 'full' | 'exact' | 'limited' | 'hidden';

export const EDUCATION_ROLE_LABELS: Record<EducationRoleLens, string> = {
  E1: 'President / Chancellor',
  E2: 'Provost / Dean',
  E3: 'Department Chair / Faculty',
  E4: 'Student Services / Counseling',
  E5: 'Registrar / Compliance',
  E6: 'Facilities / Campus Ops',
  E7: 'Student',
  E8: 'Parent / Guardian',
  E9: 'Alumnus',
  E10: 'Prospective Student',
  E11: 'Donor / Endowment',
  E12: 'Accreditor / External Evaluator',
  E13: 'Board of Trustees',
};

// Helper to build a 13-column row concisely
type V = EducationVisibility;
function r(e1: V, e2: V, e3: V, e4: V, e5: V, e6: V, e7: V, e8: V, e9: V, e10: V, e11: V, e12: V, e13: V): Record<EducationRoleLens, V> {
  return { E1: e1, E2: e2, E3: e3, E4: e4, E5: e5, E6: e6, E7: e7, E8: e8, E9: e9, E10: e10, E11: e11, E12: e12, E13: e13 };
}

// =============================================================================
// HOME TAB VISIBILITY
// =============================================================================

export type EducationHomeTab =
  | 'dashboard' | 'calendar' | 'academics' | 'campus' | 'people'
  | 'admissions' | 'athletics' | 'financial' | 'housing' | 'policies';

//                                                  E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_HOME_TAB_MATRIX: Record<EducationHomeTab, Record<EducationRoleLens, V>> = {
  dashboard:  r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  calendar:   r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  academics:  r('full',    'full',    'full',    'full',    'full',    'hidden',  'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
  campus:     r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  people:     r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  admissions: r('full',    'full',    'limited', 'limited', 'full',    'hidden',  'limited', 'limited', 'hidden',  'full',    'hidden',  'hidden',  'full'),
  athletics:  r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  financial:  r('full',    'full',    'limited', 'limited', 'full',    'hidden',  'limited', 'limited', 'hidden',  'hidden',  'limited', 'hidden',  'full'),
  housing:    r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'limited', 'hidden',  'hidden',  'full'),
  policies:   r('full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
};

export function getEduHomeTabVisibility(tab: EducationHomeTab, role: EducationRoleLens): EducationVisibility {
  return EDU_HOME_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

// =============================================================================
// ORG TAB VISIBILITY
// =============================================================================

export type EducationOrgTab =
  | 'institutions' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'facilities' | 'resources' | 'sponsors';

//                                                E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_ORG_TAB_MATRIX: Record<EducationOrgTab, Record<EducationRoleLens, V>> = {
  institutions:    r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'full'),
  people:          r('full', 'full',    'full',    'full',    'full',    'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  rooms:           r('full', 'full',    'full',    'full',    'full',    'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  operations:      r('full', 'full',    'limited', 'limited', 'limited', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  finance:         r('full', 'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'full'),
  'payment-rails': r('full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  compliance:      r('full', 'full',    'limited', 'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'full'),
  facilities:      r('full', 'full',    'full',    'limited', 'limited', 'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'full'),
  resources:       r('full', 'full',    'full',    'full',    'full',    'full',    'full',    'limited', 'limited', 'limited', 'limited', 'hidden',  'full'),
  sponsors:        r('full', 'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'full',    'hidden',  'full'),
};

export function getEduOrgTabVisibility(tab: EducationOrgTab, role: EducationRoleLens): EducationVisibility {
  return EDU_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleEduOrgTabs(role: EducationRoleLens): EducationOrgTab[] {
  return (Object.keys(EDU_ORG_TAB_MATRIX) as EducationOrgTab[])
    .filter((tab) => EDU_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY
// =============================================================================

export type EduDashboardSection =
  | 'video_hero' | 'next_event' | 'action_row' | 'institutional_metrics'
  | 'academic_health' | 'student_success' | 'campus_life' | 'advancement' | 'accreditation';

//                                                             E1      E2      E3        E4        E5        E6        E7        E8        E9        E10       E11       E12       E13
const EDU_DASHBOARD_SECTION_MATRIX: Record<EduDashboardSection, Record<EducationRoleLens, V>> = {
  video_hero:             r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  next_event:             r('full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  action_row:             r('full',    'full',    'full',    'full',    'full',    'hidden',  'full',    'limited', 'limited', 'full',    'hidden',  'hidden',  'full'),
  institutional_metrics:  r('full',    'full',    'limited', 'limited', 'limited', 'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'hidden',  'full'),
  academic_health:        r('full',    'full',    'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited'),
  student_success:        r('full',    'full',    'limited', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  campus_life:            r('full',    'full',    'full',    'full',    'hidden',  'limited', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'full'),
  advancement:            r('full',    'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'limited', 'hidden',  'full'),
  accreditation:          r('full',    'full',    'hidden',  'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'full'),
};

export function canSeeEduDashboardSection(section: EduDashboardSection, role: EducationRoleLens): EducationVisibility {
  return EDU_DASHBOARD_SECTION_MATRIX[section]?.[role] ?? 'hidden';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface EducationQuickAction {
  id: string;
  label: string;
  icon: string;
}

const EDU_QUICK_ACTIONS: Partial<Record<EducationRoleLens, EducationQuickAction[]>> = {
  E1: [
    { id: 'enrollment', label: 'Enrollment', icon: 'person.3.fill' },
    { id: 'budget', label: 'Budget Overview', icon: 'dollarsign.circle.fill' },
    { id: 'strategic-plan', label: 'Strategic Plan', icon: 'map.fill' },
    { id: 'accreditation', label: 'Accreditation', icon: 'checkmark.seal.fill' },
    { id: 'board-report', label: 'Board Report', icon: 'doc.text.fill' },
    { id: 'campus-safety', label: 'Campus Safety', icon: 'shield.fill' },
  ],
  E2: [
    { id: 'academic-programs', label: 'Academic Programs', icon: 'book.fill' },
    { id: 'faculty-hiring', label: 'Faculty Hiring', icon: 'person.badge.plus' },
    { id: 'curriculum', label: 'Curriculum Review', icon: 'doc.text.fill' },
    { id: 'research', label: 'Research Grants', icon: 'magnifyingglass' },
  ],
  E3: [
    { id: 'my-courses', label: 'My Courses', icon: 'book.fill' },
    { id: 'grading', label: 'Grading', icon: 'checkmark.circle.fill' },
    { id: 'office-hours', label: 'Office Hours', icon: 'clock.fill' },
    { id: 'research', label: 'Research', icon: 'magnifyingglass' },
  ],
  E7: [
    { id: 'my-schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'grades', label: 'Grades', icon: 'chart.bar.fill' },
    { id: 'financial-aid', label: 'Financial Aid', icon: 'dollarsign.circle.fill' },
    { id: 'campus-map', label: 'Campus Map', icon: 'map.fill' },
  ],
  E10: [
    { id: 'apply', label: 'Apply Now', icon: 'pencil.and.outline' },
    { id: 'visit', label: 'Plan a Visit', icon: 'mappin.and.ellipse' },
    { id: 'programs', label: 'Programs', icon: 'book.fill' },
  ],
};

export function getEduQuickActions(role: EducationRoleLens): EducationQuickAction[] {
  return EDU_QUICK_ACTIONS[role] || EDU_QUICK_ACTIONS.E10 || [];
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isPresident(role: EducationRoleLens): boolean {
  return role === 'E1';
}

export function isDeanLevel(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2';
}

export function isFacultyLevel(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2' || role === 'E3';
}

export function isStudent(role: EducationRoleLens): boolean {
  return role === 'E7';
}

export function isEnrolled(role: EducationRoleLens): boolean {
  return role === 'E1' || role === 'E2' || role === 'E3' || role === 'E4'
    || role === 'E5' || role === 'E6' || role === 'E7';
}

// =============================================================================
// BACKWARD COMPAT — used by universal-course-sheet, universal-program-sheet,
// universal-student-sheet from previous session
// =============================================================================

export type CourseTab = 'overview' | 'roster' | 'grades' | 'assignments' | 'syllabus' | 'sessions' | 'attendance' | 'operations' | 'compliance';
export type ProgramTab = 'overview' | 'curriculum' | 'students' | 'outcomes' | 'people' | 'courses' | 'calendar' | 'operations' | 'finance' | 'payment_rails' | 'compliance' | 'notes';
export type StudentTab = 'overview' | 'academics' | 'financial' | 'housing' | 'activities' | 'enrollment' | 'attendance' | 'grades' | 'notes' | 'compliance';

export function getCourseSheetTabs(role: EducationRoleLens): { id: CourseTab; label: string }[] {
  const all: { id: CourseTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'roster', label: 'Roster' },
    { id: 'grades', label: 'Grades' },
    { id: 'assignments', label: 'Assignments' },
  ];
  // External roles see overview only
  if (role === 'E10' || role === 'E12') return all.filter((t) => t.id === 'overview');
  // Students see everything except roster
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'roster');
  return all;
}

export function getProgramSheetTabs(role: EducationRoleLens): { id: ProgramTab; label: string }[] {
  const all: { id: ProgramTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'students', label: 'Students' },
    { id: 'outcomes', label: 'Outcomes' },
  ];
  if (role === 'E10' || role === 'E12') return all.filter((t) => t.id === 'overview');
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'students');
  return all;
}

export function getStudentSheetTabs(role: EducationRoleLens): { id: StudentTab; label: string }[] {
  const all: { id: StudentTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'academics', label: 'Academics' },
    { id: 'financial', label: 'Financial' },
    { id: 'housing', label: 'Housing' },
    { id: 'activities', label: 'Activities' },
  ];
  if (role === 'E10' || role === 'E12') return [];
  if (role === 'E7' || role === 'E8') return all.filter((t) => t.id !== 'financial');
  return all;
}

export function isFullAccess(role: EducationRoleLens): boolean {
  return role === 'E1';
}

export function isProgramDirector(role: EducationRoleLens): boolean {
  return isDeanLevel(role);
}

export function isStudentOrParent(role: EducationRoleLens): boolean {
  return role === 'E7' || role === 'E8';
}

export function canViewGrades(role: EducationRoleLens): boolean {
  return role !== 'E10' && role !== 'E12';
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const EDUCATION_MEMBERSHIP_MAP: Record<string, EducationRoleLens> = {
  mem_edu_fmu_president: 'E1',
  mem_edu_fmu_provost: 'E2',
  mem_edu_fmu_chair: 'E3',
  mem_edu_fmu_student_services: 'E4',
  mem_edu_fmu_registrar: 'E5',
  mem_edu_fmu_facilities: 'E6',
  mem_edu_fmu_student: 'E7',
  mem_edu_fmu_parent: 'E8',
  mem_edu_fmu_alumnus: 'E9',
  mem_edu_fmu_prospect: 'E10',
  mem_edu_fmu_donor: 'E11',
  mem_edu_fmu_accreditor: 'E12',
  mem_edu_fmu_trustee: 'E13',
};

export function getEducationRole(membershipId: string): EducationRoleLens {
  return EDUCATION_MEMBERSHIP_MAP[membershipId] ?? 'E10';
}

export function mapRoleToEducationLens(role: string): EducationRoleLens {
  switch (role) {
    case 'president':
    case 'chancellor':
    case 'superintendent':
      return 'E1';
    case 'provost':
    case 'dean':
    case 'vp_academic':
      return 'E2';
    case 'faculty':
    case 'professor':
    case 'department_chair':
    case 'instructor':
      return 'E3';
    case 'student_services':
    case 'counselor':
    case 'advisor':
      return 'E4';
    case 'registrar':
    case 'compliance_officer':
      return 'E5';
    case 'facilities':
    case 'campus_ops':
    case 'staff':
      return 'E6';
    case 'student':
    case 'undergraduate':
    case 'graduate':
      return 'E7';
    case 'parent':
    case 'guardian':
      return 'E8';
    case 'alumnus':
    case 'alumni':
      return 'E9';
    case 'prospective':
    case 'applicant':
    case 'visitor':
    case 'public':
      return 'E10';
    case 'donor':
    case 'endowment':
      return 'E11';
    case 'accreditor':
    case 'evaluator':
      return 'E12';
    case 'trustee':
    case 'board_member':
      return 'E13';
    default:
      return 'E10';
  }
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type EducationHomePill = 'dashboard' | 'calendar' | 'faculty' | 'admissions';

//                                                        E1     E2     E3     E4     E5     E6     E7     E8     E9     E10    E11    E12    E13
const EDU_HOME_PILL_MATRIX: Record<EducationHomePill, Record<EducationRoleLens, V>> = {
  dashboard:  r('full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  calendar:   r('full', 'full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'hidden',  'full'),
  faculty:    r('full', 'full', 'full', 'full', 'full', 'limited', 'full',    'limited', 'limited', 'limited', 'hidden',  'hidden',  'full'),
  admissions: r('full', 'full', 'full', 'full', 'full', 'hidden',  'limited', 'limited', 'hidden',  'full',    'hidden',  'hidden',  'full'),
};

export function getEducationVisiblePills(role: EducationRoleLens): EducationHomePill[] {
  return (Object.keys(EDU_HOME_PILL_MATRIX) as EducationHomePill[])
    .filter((pill) => EDU_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
```

### B5. utils/competition-rbac.ts

```typescript
/**
 * Competition Mode RBAC — 7-level role lens visibility matrix (CO1-CO11).
 * CO1:  Owner / Commissioner — sees everything including financials
 * CO2:  Race Director — everything except financials
 * CO3:  Team Principal — standings, Race Ops, own-team Technical, Entries
 * CO4:  Driver — standings, own schedule/results only
 * CO5:  Crew — standings, own team Technical
 * CO10: Fan — Hero, Next Race, Commerce, Standings only
 * CO11: Sponsor — same as Fan + health metrics
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type CompetitionRoleLens = 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5' | 'CO10' | 'CO11';

export type Visibility = 'full' | 'limited' | 'hidden';

export const COMPETITION_ROLE_LABELS: Record<CompetitionRoleLens, string> = {
  CO1: 'Owner / Commissioner',
  CO2: 'Race Director',
  CO3: 'Team Principal',
  CO4: 'Driver',
  CO5: 'Crew',
  CO10: 'Fan',
  CO11: 'Sponsor',
};

// =============================================================================
// SERIES SHEET TAB VISIBILITY
// =============================================================================

export type SeriesTab =
  | 'dashboard' | 'standings' | 'calendar' | 'events' | 'ops'
  | 'rules' | 'tech_compliance' | 'finance' | 'payment_rails'
  | 'venues' | 'sponsors' | 'media';

const SERIES_TAB_MATRIX: Record<SeriesTab, Record<CompetitionRoleLens, Visibility>> = {
  dashboard:       { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  standings:       { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  calendar:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  events:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops:             { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  rules:           { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  tech_compliance: { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  finance:         { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  payment_rails:   { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  venues:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  sponsors:        { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  media:           { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
};

export function getSeriesSheetTabs(role: CompetitionRoleLens): { id: SeriesTab; label: string; visibility: Visibility }[] {
  const labels: Record<SeriesTab, string> = {
    dashboard: 'Dashboard', standings: 'Standings', calendar: 'Calendar',
    events: 'Events', ops: 'Ops', rules: 'Rules', tech_compliance: 'Tech + Compliance',
    finance: 'Finance', payment_rails: 'Payment Rails', venues: 'Venues',
    sponsors: 'Sponsors', media: 'Media',
  };
  return (Object.keys(SERIES_TAB_MATRIX) as SeriesTab[])
    .filter((tab) => SERIES_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: SERIES_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// ENTRANT SHEET TAB VISIBILITY
// =============================================================================

export type EntrantTab =
  | 'overview' | 'roster' | 'performance' | 'compliance' | 'payouts' | 'media_obligations';

const ENTRANT_TAB_MATRIX: Record<EntrantTab, Record<CompetitionRoleLens, Visibility>> = {
  overview:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  roster:             { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  performance:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  compliance:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  payouts:            { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  media_obligations:  { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
};

export function getEntrantSheetTabs(role: CompetitionRoleLens): { id: EntrantTab; label: string; visibility: Visibility }[] {
  const labels: Record<EntrantTab, string> = {
    overview: 'Overview', roster: 'Roster / Personnel', performance: 'Performance',
    compliance: 'Compliance', payouts: 'Payouts', media_obligations: 'Media Obligations',
  };
  return (Object.keys(ENTRANT_TAB_MATRIX) as EntrantTab[])
    .filter((tab) => ENTRANT_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: ENTRANT_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// EVENT SHEET TAB VISIBILITY
// =============================================================================

export type EventTab =
  | 'agenda' | 'sessions' | 'ops' | 'live_control' | 'results'
  | 'incidents' | 'payouts' | 'media_deliverables';

const EVENT_TAB_MATRIX: Record<EventTab, Record<CompetitionRoleLens, Visibility>> = {
  agenda:             { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  sessions:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops:                { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  live_control:       { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  results:            { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  incidents:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  payouts:            { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  media_deliverables: { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
};

export function getEventSheetTabs(role: CompetitionRoleLens): { id: EventTab; label: string; visibility: Visibility }[] {
  const labels: Record<EventTab, string> = {
    agenda: 'Agenda', sessions: 'Sessions', ops: 'Ops', live_control: 'Live Control',
    results: 'Results', incidents: 'Incidents', payouts: 'Payouts',
    media_deliverables: 'Media Deliverables',
  };
  return (Object.keys(EVENT_TAB_MATRIX) as EventTab[])
    .filter((tab) => EVENT_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: EVENT_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DASHBOARD MODULE VISIBILITY
// =============================================================================

export type DashboardModule =
  | 'header' | 'today_next' | 'live_status' | 'format_snapshot'
  | 'standings_bracket' | 'schedule_snapshot' | 'media_storylines'
  | 'announcements' | 'ops_taskboard' | 'staff_contacts'
  | 'officials_compliance' | 'sponsors_revenue' | 'governance' | 'audit_trail';

const DASHBOARD_MODULE_MATRIX: Record<DashboardModule, Record<CompetitionRoleLens, Visibility>> = {
  header:               { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  today_next:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  live_status:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  format_snapshot:      { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  standings_bracket:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  schedule_snapshot:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  media_storylines:     { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  announcements:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  ops_taskboard:        { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  staff_contacts:       { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  officials_compliance: { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  sponsors_revenue:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
  governance:           { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  audit_trail:          { CO1: 'full', CO2: 'full', CO3: 'hidden',  CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
};

export function getDashboardModules(role: CompetitionRoleLens): { id: DashboardModule; visibility: Visibility }[] {
  return (Object.keys(DASHBOARD_MODULE_MATRIX) as DashboardModule[])
    .filter((mod) => DASHBOARD_MODULE_MATRIX[mod][role] !== 'hidden')
    .map((mod) => ({ id: mod, visibility: DASHBOARD_MODULE_MATRIX[mod][role] }));
}

// =============================================================================
// DASHBOARD SECTION VISIBILITY (Home dashboard sections)
// =============================================================================

export type CompDashboardSection =
  | 'video_hero' | 'next_race' | 'commerce_row'
  | 'driver_standings' | 'team_standings'
  | 'race_ops' | 'technical' | 'entries';

const COMP_DASHBOARD_SECTION_MATRIX: Record<CompDashboardSection, Record<CompetitionRoleLens, Visibility>> = {
  video_hero:        { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  next_race:         { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  commerce_row:      { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  driver_standings:  { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  team_standings:    { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'full',    CO5: 'full',    CO10: 'full',    CO11: 'full' },
  race_ops:          { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  technical:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  entries:           { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
};

export function canSeeDashboardSection(section: CompDashboardSection, role: CompetitionRoleLens): boolean {
  return COMP_DASHBOARD_SECTION_MATRIX[section][role] !== 'hidden';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
}

const QUICK_ACTIONS: Record<CompetitionRoleLens, QuickAction[]> = {
  CO1: [
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'publish-schedule', label: 'Publish Schedule', icon: 'calendar.badge.plus' },
    { id: 'update-bracket', label: 'Update Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'staff-invites', label: 'Staff / Invites', icon: 'person.badge.plus' },
    { id: 'finance', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance Docs', icon: 'doc.text.fill' },
  ],
  CO2: [
    { id: 'live-ops', label: 'Open Live Ops', icon: 'antenna.radiowaves.left.and.right' },
    { id: 'publish-schedule', label: 'Publish Schedule', icon: 'calendar.badge.plus' },
    { id: 'update-bracket', label: 'Update Bracket', icon: 'chart.bar.fill' },
    { id: 'announcement', label: 'Post Announcement', icon: 'megaphone.fill' },
    { id: 'staff', label: 'Staff / Assignments', icon: 'person.2.fill' },
    { id: 'incident-log', label: 'Incident Log', icon: 'exclamationmark.triangle.fill' },
  ],
  CO3: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'team-tech', label: 'Team Technical', icon: 'wrench.and.screwdriver.fill' },
    { id: 'entries', label: 'Entry List', icon: 'person.crop.rectangle.stack.fill' },
  ],
  CO4: [
    { id: 'schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'results', label: 'My Results', icon: 'flag.checkered' },
  ],
  CO5: [
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'standings', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'technical', label: 'Team Technical', icon: 'wrench.and.screwdriver.fill' },
  ],
  CO10: [
    { id: 'bracket', label: 'View Bracket/Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
  ],
  CO11: [
    { id: 'bracket', label: 'View Standings', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'View Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Watch Highlights', icon: 'play.rectangle.fill' },
    { id: 'metrics', label: 'Health Metrics', icon: 'chart.line.uptrend.xyaxis' },
  ],
};

export function getQuickActions(role: CompetitionRoleLens): QuickAction[] {
  return QUICK_ACTIONS[role] || QUICK_ACTIONS.CO10;
}

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const COMPETITION_MEMBERSHIP_MAP: Record<string, CompetitionRoleLens> = {
  mem_comp_k1_owner_commish: 'CO1',
  mem_comp_k1_race_director: 'CO2',
  mem_comp_k1_team_principal: 'CO3',
  mem_comp_k1_driver: 'CO4',
  mem_comp_k1_crew: 'CO5',
  mem_comp_k1_fan: 'CO10',
  mem_comp_k1_sponsor: 'CO11',
};

export function getCompetitionRole(membershipId: string): CompetitionRoleLens {
  return COMPETITION_MEMBERSHIP_MAP[membershipId] ?? 'CO10';
}

export function mapRoleToCompetitionLens(role: string): CompetitionRoleLens {
  switch (role) {
    case 'league_admin':
    case 'commissioner':
    case 'owner':
      return 'CO1';
    case 'tournament_director':
    case 'event_director':
    case 'race_director':
      return 'CO2';
    case 'team_principal':
      return 'CO3';
    case 'driver':
      return 'CO4';
    case 'crew':
    case 'mechanic':
    case 'engineer':
      return 'CO5';
    case 'sponsor':
      return 'CO11';
    case 'fan':
    case 'viewer':
    case 'public':
    default:
      return 'CO10';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function canSeeModule(module: DashboardModule, role: CompetitionRoleLens): boolean {
  return DASHBOARD_MODULE_MATRIX[module][role] !== 'hidden';
}

export function isFullAccess(role: CompetitionRoleLens): boolean {
  return role === 'CO1' || role === 'CO2';
}

export function isStaffOrAbove(role: CompetitionRoleLens): boolean {
  return role === 'CO1' || role === 'CO2' || role === 'CO3';
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Competition Organization)
// =============================================================================

export type CompOrgTab =
  | 'series' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'compliance' | 'assets' | 'reports' | 'sponsors';

const COMP_ORG_TAB_MATRIX: Record<CompOrgTab, Record<CompetitionRoleLens, Visibility>> = {
  series:         { CO1: 'full', CO2: 'full', CO3: 'full',    CO4: 'limited', CO5: 'limited', CO10: 'limited', CO11: 'limited' },
  people:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  rooms:          { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  operations:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  finance:        { CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  'payment-rails':{ CO1: 'full', CO2: 'hidden', CO3: 'hidden', CO4: 'hidden', CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  compliance:     { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'limited', CO10: 'hidden',  CO11: 'hidden' },
  assets:         { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  reports:        { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'hidden',  CO11: 'hidden' },
  sponsors:       { CO1: 'full', CO2: 'full', CO3: 'limited', CO4: 'hidden',  CO5: 'hidden',  CO10: 'limited', CO11: 'limited' },
};

export function getCompOrgTabVisibility(tab: CompOrgTab, role: CompetitionRoleLens): Visibility {
  return COMP_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleCompOrgTabs(role: CompetitionRoleLens): CompOrgTab[] {
  return (Object.keys(COMP_ORG_TAB_MATRIX) as CompOrgTab[])
    .filter((tab) => COMP_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type CompetitionHomePill = 'dashboard' | 'calendar' | 'grid' | 'entries';

const COMP_HOME_PILL_MATRIX: Record<CompetitionHomePill, Record<CompetitionRoleLens, Visibility>> = {
  dashboard: { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  calendar:  { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  grid:      { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
  entries:   { CO1: 'full', CO2: 'full', CO3: 'full', CO4: 'full', CO5: 'full', CO10: 'full', CO11: 'full' },
};

export function getCompetitionVisiblePills(role: CompetitionRoleLens): CompetitionHomePill[] {
  return (Object.keys(COMP_HOME_PILL_MATRIX) as CompetitionHomePill[])
    .filter((pill) => COMP_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}
```

### B6. utils/business-rbac.ts

```typescript
/**
 * Business Mode RBAC — 8-level role lens visibility matrix.
 * B1:  Founder / CEO (Full access)
 * B2a: Investor (Retail) — Curated data room
 * B2b: Investor (Strategic/Board) — Board-level data room
 * B3:  Public
 * B4:  Subscriber (Public only)
 * B5:  Prospective Acquirer (Acquisition workspace scoped)
 * B8:  Advisor / Board Member
 * B13: Holding Company / Parent
 */

// =============================================================================
// ROLE LEVELS
// =============================================================================

export type BusinessRoleLens = 'B1' | 'B2a' | 'B2b' | 'B3' | 'B4' | 'B5' | 'B8' | 'B13';

export type InvestorTier = 'retail' | 'board';

export type BusinessVisibility = 'full' | 'exact' | 'banded' | 'limited' | 'hidden';

export type MetricVisibility = 'exact' | 'banded' | 'hidden';

export type DocAccessTag = 'public' | 'retail' | 'board' | 'founder_only' | 'workspace_only';

export const BUSINESS_ROLE_LABELS: Record<BusinessRoleLens, string> = {
  B1: 'Founder / CEO',
  B2a: 'Investor (Retail)',
  B2b: 'Investor (Strategic/Board)',
  B3: 'Public',
  B4: 'Subscriber',
  B5: 'Prospective Acquirer',
  B8: 'Advisor / Board',
  B13: 'Holding Company / Parent',
};

// =============================================================================
// COMPANY SHEET TAB VISIBILITY
// =============================================================================

export type CompanyTab =
  | 'overview' | 'product' | 'traction' | 'roadmap'
  | 'finance' | 'governance' | 'people' | 'comms';

const COMPANY_TAB_MATRIX: Record<CompanyTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  overview:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'full',    B13: 'full' },
  product:    { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'full',    B13: 'full' },
  traction:   { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  roadmap:    { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  finance:    { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  governance: { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  people:     { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'limited', B5: 'limited', B8: 'exact',   B13: 'full' },
  comms:      { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'limited', B5: 'limited', B8: 'exact',   B13: 'full' },
};

export function getCompanySheetTabs(role: BusinessRoleLens): { id: CompanyTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<CompanyTab, string> = {
    overview: 'Overview', product: 'Product', traction: 'Traction',
    roadmap: 'Roadmap', finance: 'Finance', governance: 'Governance',
    people: 'People', comms: 'Comms',
  };
  return (Object.keys(COMPANY_TAB_MATRIX) as CompanyTab[])
    .filter((tab) => COMPANY_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: COMPANY_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DATA ROOM SHEET TAB VISIBILITY
// =============================================================================

export type DataRoomTab =
  | 'start_here' | 'pitch_pack' | 'product_demo'
  | 'financials' | 'legal' | 'board_pack' | 'decision_log';

const DATA_ROOM_TAB_MATRIX: Record<DataRoomTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  start_here:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  pitch_pack:   { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  product_demo: { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'limited', B13: 'full' },
  financials:   { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  legal:        { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  board_pack:   { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
  decision_log: { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',   B13: 'full' },
};

export function getDataRoomTabs(role: BusinessRoleLens): { id: DataRoomTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<DataRoomTab, string> = {
    start_here: 'Start Here', pitch_pack: 'Pitch Pack', product_demo: 'Product Demo',
    financials: 'Financials', legal: 'Legal', board_pack: 'Board Pack',
    decision_log: 'Decision Log',
  };
  return (Object.keys(DATA_ROOM_TAB_MATRIX) as DataRoomTab[])
    .filter((tab) => DATA_ROOM_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: DATA_ROOM_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// DEAL / ASSET SHEET TAB VISIBILITY
// =============================================================================

export type DealTab =
  | 'overview' | 'pipeline' | 'diligence' | 'financial_model'
  | 'risks' | 'offer_terms' | 'approvals' | 'audit_log';

const DEAL_TAB_MATRIX: Record<DealTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  overview:        { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  pipeline:        { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  diligence:       { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  financial_model: { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  risks:           { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  offer_terms:     { B1: 'full', B2a: 'hidden', B2b: 'exact',   B3: 'hidden', B4: 'hidden', B5: 'full',    B8: 'exact',   B13: 'full' },
  approvals:       { B1: 'full', B2a: 'hidden', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'limited', B8: 'limited', B13: 'full' },
  audit_log:       { B1: 'full', B2a: 'hidden', B2b: 'limited', B3: 'hidden', B4: 'hidden', B5: 'limited', B8: 'limited', B13: 'full' },
};

export function getDealSheetTabs(role: BusinessRoleLens): { id: DealTab; label: string; visibility: BusinessVisibility }[] {
  const labels: Record<DealTab, string> = {
    overview: 'Overview', pipeline: 'Pipeline', diligence: 'Diligence',
    financial_model: 'Financial Model', risks: 'Risks', offer_terms: 'Offer / Terms',
    approvals: 'Approvals', audit_log: 'Audit Log',
  };
  return (Object.keys(DEAL_TAB_MATRIX) as DealTab[])
    .filter((tab) => DEAL_TAB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ id: tab, label: labels[tab], visibility: DEAL_TAB_MATRIX[tab][role] }));
}

// =============================================================================
// METRIC VISIBILITY
// =============================================================================

export function getMetricVisibility(role: BusinessRoleLens): MetricVisibility {
  switch (role) {
    case 'B1':
    case 'B2b':
    case 'B8':
    case 'B13':
      return 'exact';
    case 'B2a':
      return 'banded';
    case 'B5':
      return 'banded';
    case 'B3':
    case 'B4':
    default:
      return 'hidden';
  }
}

// =============================================================================
// DOCUMENT ACCESS
// =============================================================================

export function canAccessDoc(tag: DocAccessTag, role: BusinessRoleLens, tier?: InvestorTier): boolean {
  // Founder and holding company see everything
  if (role === 'B1' || role === 'B13') return true;

  // Workspace-only docs are restricted to B5 acquirers
  if (tag === 'workspace_only') return role === 'B5';

  // Public docs are visible to everyone
  if (tag === 'public') return true;

  // Founder-only docs are restricted to B1/B13 (handled above)
  if (tag === 'founder_only') return false;

  // Retail docs: accessible by B2a, B2b, B5, B8
  if (tag === 'retail') {
    return role === 'B2a' || role === 'B2b' || role === 'B5' || role === 'B8';
  }

  // Board docs: accessible by B2b and B8
  if (tag === 'board') {
    return role === 'B2b' || role === 'B8';
  }

  return false;
}

// =============================================================================
// ROLE MAPPING
// =============================================================================

// =============================================================================
// MEMBERSHIP → LENS (direct membership_id mapping for ActiveView)
// =============================================================================

const BUSINESS_MEMBERSHIP_MAP: Record<string, BusinessRoleLens> = {
  mem_biz_kanext_founder: 'B1',
};

export function getBusinessRole(membershipId: string): BusinessRoleLens {
  return BUSINESS_MEMBERSHIP_MAP[membershipId] ?? 'B1';
}

export function mapRoleToBusinessLens(role: string): BusinessRoleLens {
  switch (role) {
    case 'founder':
    case 'ceo':
    case 'owner':
      return 'B1';
    case 'retail_investor':
    case 'angel':
    case 'investor_retail':
      return 'B2a';
    case 'board_member':
    case 'strategic_investor':
    case 'investor_board':
    case 'board':
      return 'B2b';
    case 'public':
    case 'visitor':
      return 'B3';
    case 'subscriber':
    case 'follower':
      return 'B4';
    case 'acquirer':
    case 'prospective_acquirer':
    case 'buyer':
      return 'B5';
    case 'advisor':
    case 'board_advisor':
      return 'B8';
    case 'holding_company':
    case 'parent':
    case 'parent_org':
      return 'B13';
    default:
      return 'B3';
  }
}

// =============================================================================
// VISIBILITY HELPERS
// =============================================================================

export function isFounder(role: BusinessRoleLens): boolean {
  return role === 'B1';
}

export function isBoardLevel(role: BusinessRoleLens): boolean {
  return role === 'B1' || role === 'B2b' || role === 'B8' || role === 'B13';
}

export function isInvestor(role: BusinessRoleLens): boolean {
  return role === 'B2a' || role === 'B2b';
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface BusinessQuickAction {
  id: string;
  label: string;
  icon: string;
}

const BUSINESS_QUICK_ACTIONS: Record<BusinessRoleLens, BusinessQuickAction[]> = {
  B1: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
    { id: 'finance-snapshot', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'investor-update', label: 'Draft Investor Update', icon: 'envelope.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B2a: [
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'traction', label: 'View Traction', icon: 'chart.line.uptrend.xyaxis' },
    { id: 'updates', label: 'Investor Updates', icon: 'envelope.fill' },
    { id: 'team', label: 'Meet the Team', icon: 'person.2.fill' },
  ],
  B2b: [
    { id: 'data-room', label: 'Open Data Room', icon: 'folder.fill' },
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'decision-log', label: 'Decision Log', icon: 'list.bullet.clipboard.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
  ],
  B3: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'team', label: 'Team', icon: 'person.2.fill' },
  ],
  B4: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'comms', label: 'Updates', icon: 'megaphone.fill' },
    { id: 'team', label: 'Team', icon: 'person.2.fill' },
  ],
  B5: [
    { id: 'deal-workspace', label: 'Acquisition Workspace', icon: 'briefcase.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'product', label: 'Product Info', icon: 'app.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
  B8: [
    { id: 'board-pack', label: 'Board Pack', icon: 'doc.richtext.fill' },
    { id: 'data-room', label: 'Data Room', icon: 'folder.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
  ],
  B13: [
    { id: 'company-overview', label: 'Company Overview', icon: 'building.2.fill' },
    { id: 'data-room', label: 'Data Room', icon: 'folder.fill' },
    { id: 'finance', label: 'Financials', icon: 'dollarsign.circle.fill' },
    { id: 'governance', label: 'Governance', icon: 'doc.text.fill' },
    { id: 'deal-workspace', label: 'Deal Workspaces', icon: 'briefcase.fill' },
    { id: 'team', label: 'Team & People', icon: 'person.2.fill' },
  ],
};

export function getBusinessQuickActions(role: BusinessRoleLens): BusinessQuickAction[] {
  return BUSINESS_QUICK_ACTIONS[role] || BUSINESS_QUICK_ACTIONS.B3;
}

// =============================================================================
// ORG TAB VISIBILITY (10 tabs in Business Organization)
// =============================================================================

export type BizOrgTab =
  | 'entities' | 'people' | 'rooms' | 'operations' | 'finance'
  | 'payment-rails' | 'legal' | 'compliance' | 'assets' | 'reports';

const BIZ_ORG_TAB_MATRIX: Record<BizOrgTab, Record<BusinessRoleLens, BusinessVisibility>> = {
  entities:       { B1: 'full', B2a: 'limited', B2b: 'limited', B3: 'limited', B4: 'limited', B5: 'limited', B8: 'limited', B13: 'full' },
  people:         { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'limited', B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  rooms:          { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  operations:     { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  finance:        { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  'payment-rails':{ B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  legal:          { B1: 'full', B2a: 'hidden',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'exact',   B13: 'full' },
  compliance:     { B1: 'full', B2a: 'hidden',  B2b: 'limited', B3: 'hidden',  B4: 'hidden',  B5: 'hidden',  B8: 'limited', B13: 'full' },
  assets:         { B1: 'full', B2a: 'limited', B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
  reports:        { B1: 'full', B2a: 'banded',  B2b: 'exact',   B3: 'hidden',  B4: 'hidden',  B5: 'limited', B8: 'exact',   B13: 'full' },
};

export function getBizOrgTabVisibility(tab: BizOrgTab, role: BusinessRoleLens): BusinessVisibility {
  return BIZ_ORG_TAB_MATRIX[tab]?.[role] ?? 'hidden';
}

export function getVisibleBizOrgTabs(role: BusinessRoleLens): BizOrgTab[] {
  return (Object.keys(BIZ_ORG_TAB_MATRIX) as BizOrgTab[])
    .filter((tab) => BIZ_ORG_TAB_MATRIX[tab][role] !== 'hidden');
}

// =============================================================================
// HOME PILL VISIBILITY (4-pill layout)
// =============================================================================

export type BusinessHomePill = 'dashboard' | 'calendar' | 'vault' | 'deals';

const BIZ_HOME_PILL_MATRIX: Record<BusinessHomePill, Record<BusinessRoleLens, BusinessVisibility>> = {
  dashboard: { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  calendar:  { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  vault:     { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
  deals:     { B1: 'full', B2a: 'full', B2b: 'full', B3: 'full', B4: 'full', B5: 'full', B8: 'full', B13: 'full' },
};

export function getBusinessVisiblePills(role: BusinessRoleLens): BusinessHomePill[] {
  return (Object.keys(BIZ_HOME_PILL_MATRIX) as BusinessHomePill[])
    .filter((pill) => BIZ_HOME_PILL_MATRIX[pill][role] !== 'hidden');
}

// =============================================================================
// DASHBOARD BLOCK VISIBILITY (7 blocks)
// =============================================================================

export type DashboardBlock =
  | 'video_hero' | 'next_event' | 'action_row' | 'pipeline'
  | 'proof' | 'top_deals' | 'domain_cards';

const DASHBOARD_BLOCK_MATRIX: Record<DashboardBlock, Record<BusinessRoleLens, boolean>> = {
  video_hero:   { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  next_event:   { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: false, B8: true,  B13: true },
  action_row:   { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  pipeline:     { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  proof:        { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  top_deals:    { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: false, B8: true,  B13: true },
  domain_cards: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
};

export function isDashboardBlockVisible(block: DashboardBlock, role: BusinessRoleLens): boolean {
  return DASHBOARD_BLOCK_MATRIX[block]?.[role] ?? false;
}

// =============================================================================
// ACTION CARD VISIBILITY (3 cards in action row)
// =============================================================================

import type { BizActionCardId } from '@/data/mock-business-home';

const ACTION_CARD_MATRIX: Record<BizActionCardId, Record<BusinessRoleLens, boolean>> = {
  deck:      { B1: true,  B2a: true,  B2b: true,  B3: true,  B4: true,  B5: true,  B8: true,  B13: true },
  data_room: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  invest:    { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: false, B8: false, B13: true },
};

export function isActionCardVisible(card: BizActionCardId, role: BusinessRoleLens): boolean {
  return ACTION_CARD_MATRIX[card]?.[role] ?? false;
}

// =============================================================================
// PIPELINE METRIC VISIBILITY (4 metrics)
// =============================================================================

export type PipelineMetric = 'total_value' | 'active_deals' | 'win_rate' | 'raised';

const PIPELINE_METRIC_MATRIX: Record<PipelineMetric, Record<BusinessRoleLens, MetricVisibility>> = {
  total_value:  { B1: 'exact', B2a: 'hidden',  B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
  active_deals: { B1: 'exact', B2a: 'exact',   B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
  win_rate:     { B1: 'exact', B2a: 'hidden',  B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'hidden', B8: 'exact',  B13: 'exact' },
  raised:       { B1: 'exact', B2a: 'exact',   B2b: 'exact',  B3: 'hidden', B4: 'hidden', B5: 'banded', B8: 'exact',  B13: 'exact' },
};

export function getPipelineMetricVisibility(metric: PipelineMetric, role: BusinessRoleLens): MetricVisibility {
  return PIPELINE_METRIC_MATRIX[metric]?.[role] ?? 'hidden';
}

// =============================================================================
// DOMAIN CARD VISIBILITY (3 cards)
// =============================================================================

import type { BizDomainCardId } from '@/data/mock-business-home';

const DOMAIN_CARD_MATRIX: Record<BizDomainCardId, Record<BusinessRoleLens, boolean>> = {
  cap_table: { B1: true,  B2a: true,  B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  metrics:   { B1: true,  B2a: false, B2b: true,  B3: false, B4: false, B5: true,  B8: true,  B13: true },
  updates:   { B1: true,  B2a: true,  B2b: true,  B3: false, B4: true,  B5: false, B8: true,  B13: true },
};

export function isBizDomainCardVisible(card: BizDomainCardId, role: BusinessRoleLens): boolean {
  return DOMAIN_CARD_MATRIX[card]?.[role] ?? false;
}
```

### B7. utils/nexus-rbac.ts

```typescript
/**
 * Nexus RBAC — 9-level x 9-capability matrix.
 * Determines what a user can do inside Nexus based on their role level.
 */

import type { Mode } from '@/types';
import type { RBACLevel, NexusCapability } from '@/types/nexus-v2';

// =============================================================================
// CAPABILITY MATRIX
// =============================================================================

const CAPABILITY_MATRIX: Record<RBACLevel, NexusCapability[]> = {
  R1: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room', 'C7_approve_deny', 'C8_high_impact', 'C9_cross_context'],
  R2: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room', 'C7_approve_deny'],
  R3: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room'],
  R4: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room'],
  R5: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R6: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request'],
  R7: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R8: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R9: ['C1_ask', 'C2_navigate'],
};

export function getUserCapabilities(role: RBACLevel): NexusCapability[] {
  return CAPABILITY_MATRIX[role] || [];
}

export function canPerform(role: RBACLevel, capability: NexusCapability): boolean {
  return CAPABILITY_MATRIX[role]?.includes(capability) ?? false;
}

// =============================================================================
// REFUSAL MESSAGES (Doc 8 tone — calm, decisive, never leak details)
// =============================================================================

const CAPABILITY_LABELS: Record<NexusCapability, string> = {
  C1_ask: 'ask questions',
  C2_navigate: 'navigate',
  C3_create_task: 'create tasks',
  C4_create_request: 'create requests',
  C5_post_room: 'post to rooms',
  C6_summarize_room: 'summarize rooms',
  C7_approve_deny: 'approve or deny requests',
  C8_high_impact: 'execute high-impact actions',
  C9_cross_context: 'search across all contexts',
};

export function getRefusalMessage(capability: NexusCapability): string {
  const label = CAPABILITY_LABELS[capability];
  return `I can't ${label} at your current access level.\nI can:\n1. Create a request to the right owner\n2. Save as open question\nReply 1 or 2.`;
}

// =============================================================================
// ACTION → CAPABILITY MAPPING
// =============================================================================

const ACTION_CAPABILITY_MAP: Record<string, NexusCapability> = {
  create_task: 'C3_create_task',
  create_request: 'C4_create_request',
  post_room: 'C5_post_room',
  summarize_room: 'C6_summarize_room',
  approve: 'C7_approve_deny',
  deny: 'C7_approve_deny',
  escalate: 'C4_create_request',
  generate_packet: 'C8_high_impact',
  navigate: 'C2_navigate',
  switch_context: 'C2_navigate',
  show_contexts: 'C1_ask',
  show_workspaces: 'C1_ask',
  create_workspace: 'C3_create_task',
  add_to_board: 'C3_create_task',
  remove_from_board: 'C3_create_task',
  change_pipeline_stage: 'C3_create_task',
  flag_player: 'C3_create_task',
  create_calendar_event: 'C3_create_task',
  update_scholarship: 'C8_high_impact',
  adjust_budget: 'C8_high_impact',
  send_dm: 'C5_post_room',
  pin_conversation: 'C1_ask',
  unpin_conversation: 'C1_ask',
};

export function getRequiredCapability(actionType: string): NexusCapability | null {
  return ACTION_CAPABILITY_MAP[actionType] ?? null;
}

// =============================================================================
// HIGH-IMPACT ACTION CHECK
// =============================================================================

const HIGH_IMPACT_ACTIONS = new Set([
  'approve', 'deny', 'generate_packet', 'post_room',
  'add_to_board', 'remove_from_board', 'change_pipeline_stage',
  'update_scholarship', 'adjust_budget', 'send_dm',
]);

export function isHighImpactAction(actionType: string): boolean {
  return HIGH_IMPACT_ACTIONS.has(actionType);
}

export function requiresAuditNote(actionType: string): boolean {
  return actionType === 'approve' || actionType === 'deny';
}

// =============================================================================
// ROLE MAPPING (bridge from existing app roles)
// =============================================================================

export function mapRoleToRBAC(role: string, mode: Mode): RBACLevel {
  // Sports mode
  if (mode === 'sports') {
    switch (role) {
      case 'admin':
      case 'head_coach':
      case 'gm': return 'R1';
      case 'assistant_coach': return 'R4';
      case 'scout': return 'R4';
      case 'student_athlete': return 'R6';
      case 'fan': return 'R9';
      case 'donor': return 'R5';
      case 'media': return 'R4';
      case 'agent': return 'R5';
      default: return 'R9';
    }
  }
  // Competition mode
  if (mode === 'competition') {
    switch (role) {
      case 'league_admin': return 'R1';
      case 'team_owner': return 'R2';
      case 'driver': return 'R6';
      default: return 'R9';
    }
  }
  // Church mode
  if (mode === 'church') {
    switch (role) {
      case 'leadership': return 'R1';
      case 'staff': return 'R3';
      case 'member': return 'R7';
      default: return 'R9';
    }
  }
  // Business mode
  if (mode === 'business') {
    switch (role) {
      case 'founder': return 'R1';
      case 'investor': return 'R5';
      case 'viewer': return 'R9';
      default: return 'R9';
    }
  }
  // Education mode
  if (mode === 'education') {
    switch (role) {
      case 'faculty': return 'R2';
      case 'student': return 'R7';
      default: return 'R9';
    }
  }
  return 'R9';
}
```
