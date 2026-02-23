/**
 * Sports RBAC — Role-Based Context Access for Universal Sports Sheets
 *
 * Maps membership_id → Sports Role Lens (R0–R13), then provides declarative
 * visibility matrices for every tab/section across Player, Team, and Game sheets.
 *
 * R0:  System Owner           R7:  Housing / Meals Operations
 * R1:  Institution Leadership  R8:  Player
 * R2:  Athletic Director       R9:  Family / Advisors
 * R3:  Head Coach / GM         R10: Student (Non-Athlete)
 * R4:  Assistant Coach / RC    R11: Fan
 * R5:  Medical / Performance   R12: Booster / Donor / NIL
 * R6:  Academic / Compliance   R13: Agent / Scout (External)
 *
 * Authority tiers:
 *   R0-R2: Full access (leadership/AD)
 *   R3:    Full competitive access (Head Coach/GM)
 *   R4:    Limited (execution within governed pathways)
 *   R5-R7: Domain-scoped (medical/academic/operations — only their lane)
 *   R8:    Self-only (player sees own data)
 *   R9:    Limited (family — schedules, approved comms)
 *   R10-R11: Public only (student/fan)
 *   R12:   Limited public + program health signals
 *   R13:   Abstracted outputs only (agent/scout)
 */

import { isSystemOwner } from '@/utils/system-rbac';

// =============================================================================
// ROLE LENS
// =============================================================================

export type SportsRoleLens =
  | 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7'
  | 'R8' | 'R9' | 'R10' | 'R11' | 'R12' | 'R13';

export const SPORTS_ROLE_LABELS: Record<SportsRoleLens, string> = {
  R0: 'System Owner',
  R1: 'Institution Leadership',
  R2: 'Athletic Director',
  R3: 'Head Coach / GM',
  R4: 'Assistant Coach / RC',
  R5: 'Medical / Performance',
  R6: 'Academic / Compliance',
  R7: 'Housing / Meals Operations',
  R8: 'Player',
  R9: 'Family / Advisors',
  R10: 'Student (Non-Athlete)',
  R11: 'Fan',
  R12: 'Booster / Donor / NIL',
  R13: 'Agent / Scout (External)',
};

// Helper to build a 14-column row concisely
type V = Visibility;
function r(
  r0: V, r1: V, r2: V, r3: V, r4: V, r5: V, r6: V,
  r7: V, r8: V, r9: V, r10: V, r11: V, r12: V, r13: V,
): Record<SportsRoleLens, V> {
  return {
    R0: r0, R1: r1, R2: r2, R3: r3, R4: r4, R5: r5, R6: r6,
    R7: r7, R8: r8, R9: r9, R10: r10, R11: r11, R12: r12, R13: r13,
  };
}

// =============================================================================
// VISIBILITY LEVELS
// =============================================================================

export type Visibility = 'full' | 'limited' | 'self' | 'shared' | 'hidden';

export type KRVisibility = 'full' | 'bands' | 'partial_self' | 'hidden';

// =============================================================================
// ROLE LOOKUP
// =============================================================================

const SPORTS_ROLE_MAP: Record<string, SportsRoleLens> = {};

export function getSportsRole(membershipId: string): SportsRoleLens {
  if (isSystemOwner(membershipId)) return 'R0';
  return SPORTS_ROLE_MAP[membershipId] ?? 'R3';
}

export function mapRoleToSportsLens(role: string): SportsRoleLens {
  switch (role) {
    case 'system_owner':
      return 'R0';
    case 'president':
    case 'institution_leadership':
      return 'R1';
    case 'athletic_director':
    case 'ad':
    case 'admin':
      return 'R2';
    case 'head_coach':
    case 'gm':
    case 'coach':
      return 'R3';
    case 'assistant_coach':
    case 'recruiting_coordinator':
    case 'rc':
      return 'R4';
    case 'medical':
    case 'trainer':
    case 'performance':
      return 'R5';
    case 'academic':
    case 'compliance':
    case 'academic_compliance':
      return 'R6';
    case 'housing':
    case 'meals':
    case 'operations':
      return 'R7';
    case 'player':
    case 'student_athlete':
    case 'athlete':
      return 'R8';
    case 'family':
    case 'parent':
    case 'advisor':
      return 'R9';
    case 'student':
    case 'non_athlete':
      return 'R10';
    case 'fan':
    case 'public':
    case 'viewer':
      return 'R11';
    case 'booster':
    case 'donor':
    case 'nil':
      return 'R12';
    case 'agent':
    case 'scout':
    case 'external':
      return 'R13';
    default:
      return 'R11';
  }
}

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
  kanext_eval: 'KR Eval',
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

//                                              R0      R1      R2      R3      R4        R5        R6        R7        R8      R9        R10       R11       R12       R13
const PLAYER_SHEET_MATRIX: Record<PlayerTab, Record<SportsRoleLens, Visibility>> = {
  overview:     r('full', 'full', 'full', 'full', 'limited', 'limited', 'limited', 'hidden',  'self',    'limited', 'hidden',  'limited', 'limited', 'shared'),
  performance:  r('full', 'full', 'full', 'full', 'limited', 'limited', 'hidden',  'hidden',  'self',    'limited', 'hidden',  'limited', 'limited', 'shared'),
  film:         r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'self',    'hidden',  'hidden',  'limited', 'hidden',  'shared'),
  kanext_eval:  r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  fit_role:     r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  development:  r('full', 'full', 'full', 'full', 'limited', 'limited', 'hidden',  'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  health:       r('full', 'full', 'full', 'full', 'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  admin:        r('full', 'full', 'full', 'hidden','hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  recruiting:   r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'shared'),
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

//                                            R0      R1      R2      R3      R4        R5        R6        R7        R8        R9        R10       R11       R12       R13
const TEAM_SHEET_MATRIX: Record<TeamTab, Record<SportsRoleLens, Visibility>> = {
  overview:     r('full', 'full', 'full', 'full', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'shared'),
  roster:       r('full', 'full', 'full', 'full', 'limited', 'limited', 'limited', 'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'shared'),
  systems:      r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  performance:  r('full', 'full', 'full', 'full', 'limited', 'limited', 'hidden',  'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'shared'),
  lineups:      r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  schedule:     r('full', 'full', 'full', 'full', 'full',    'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited'),
  staff:        r('full', 'full', 'full', 'full', 'limited', 'limited', 'limited', 'limited', 'limited', 'limited', 'hidden',  'limited', 'limited', 'limited'),
  operations:   r('full', 'full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  finance:      r('full', 'full', 'full', 'hidden','hidden', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  compliance:   r('full', 'full', 'full', 'hidden','hidden', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
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

//                                          R0      R1      R2      R3      R4        R5        R6        R7        R8        R9        R10       R11       R12       R13
const GAME_SHEET_MATRIX: Record<GameTab, Record<SportsRoleLens, Visibility>> = {
  pregame:    r('full', 'full', 'full', 'full', 'limited', 'limited', 'hidden',  'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'shared'),
  live:       r('full', 'full', 'full', 'full', 'limited', 'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited', 'limited', 'limited', 'shared'),
  postgame:   r('full', 'full', 'full', 'full', 'limited', 'limited', 'hidden',  'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'shared'),
  ad_overlay: r('full', 'full', 'full', 'hidden','hidden', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  incidents:  r('full', 'full', 'full', 'full', 'hidden',  'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
};

// =============================================================================
// TAB FILTER FUNCTIONS
// =============================================================================

export function getPlayerSheetTabs(role: SportsRoleLens): { key: PlayerTab; label: string }[] {
  return PLAYER_TAB_ORDER
    .filter((tab) => PLAYER_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: PLAYER_TAB_LABELS[tab] }));
}

export function getTeamSheetTabs(role: SportsRoleLens): { key: TeamTab; label: string }[] {
  return TEAM_TAB_ORDER
    .filter((tab) => TEAM_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: TEAM_TAB_LABELS[tab] }));
}

export function getGameSheetTabs(role: SportsRoleLens): { key: GameTab; label: string }[] {
  return GAME_TAB_ORDER
    .filter((tab) => GAME_SHEET_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: GAME_TAB_LABELS[tab] }));
}

export function getPlayerTabVisibility(tab: PlayerTab, role: SportsRoleLens): Visibility {
  return PLAYER_SHEET_MATRIX[tab][role];
}

export function getTeamTabVisibility(tab: TeamTab, role: SportsRoleLens): Visibility {
  return TEAM_SHEET_MATRIX[tab][role];
}

export function getGameTabVisibility(tab: GameTab, role: SportsRoleLens): Visibility {
  return GAME_SHEET_MATRIX[tab][role];
}

// =============================================================================
// KR VISIBILITY POLICY
// =============================================================================

const KR_VISIBILITY_MAP: Record<SportsRoleLens, KRVisibility> = {
  R0: 'full',
  R1: 'full',
  R2: 'full',
  R3: 'full',
  R4: 'bands',
  R5: 'hidden',
  R6: 'hidden',
  R7: 'hidden',
  R8: 'partial_self',
  R9: 'hidden',
  R10: 'hidden',
  R11: 'hidden',
  R12: 'hidden',
  R13: 'bands',
};

export function getKRVisibility(role: SportsRoleLens): KRVisibility {
  return KR_VISIBILITY_MAP[role];
}

export function formatKR(value: number, visibility: KRVisibility): string {
  switch (visibility) {
    case 'full':
      return `${value}`;
    case 'bands': {
      const low = Math.floor(value / 3) * 3;
      return `${low}\u2013${low + 2}`;
    }
    case 'partial_self':
      return `${value}`;
    case 'hidden':
      return '\u2014';
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

//                                                R0      R1      R2      R3      R4        R5        R6        R7        R8        R9        R10       R11       R12       R13
const STATS_HUB_MATRIX: Record<StatsTab, Record<SportsRoleLens, Visibility>> = {
  dashboard:       r('full', 'full', 'full', 'full', 'full',    'full',    'limited', 'hidden',  'full',    'limited', 'limited', 'full',    'limited', 'full'),
  traditional:     r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited', 'full',    'limited', 'full'),
  kr_intelligence: r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  clusters:        r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  lineups:         r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  play_types:      r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  players:         r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden',  'hidden',  'limited', 'limited', 'limited', 'full',    'limited', 'full'),
};

export function getStatsHubTabs(role: SportsRoleLens): { key: StatsTab; label: string }[] {
  return STATS_TAB_ORDER
    .filter((tab) => STATS_HUB_MATRIX[tab][role] !== 'hidden')
    .map((tab) => ({ key: tab, label: STATS_TAB_LABELS[tab] }));
}

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

//                                                  R0      R1      R2      R3      R4        R5        R6        R7        R8        R9        R10       R11       R12       R13
const GAME_PLAN_HUB_MATRIX: Record<GamePlanTab, Record<SportsRoleLens, Visibility>> = {
  overview:  r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  offense:   r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  defense:   r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  matchups:  r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  rotation:  r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  scout:     r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  staff:     r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
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
  system_x_system: 'System \u00d7 System',
  possession_engine: 'Possession Engine',
  matchup_interactions: 'Matchup Interactions',
  box_score_projection: 'Box Score',
  scenarios: 'Scenarios',
};

export const SIMULATION_TAB_ORDER: SimulationTab[] = [
  'overview', 'system_x_system', 'possession_engine',
  'matchup_interactions', 'box_score_projection', 'scenarios',
];

//                                                        R0      R1      R2      R3      R4        R5        R6        R7        R8        R9        R10       R11       R12       R13
const SIMULATION_HUB_MATRIX: Record<SimulationTab, Record<SportsRoleLens, Visibility>> = {
  overview:              r('full', 'full', 'full', 'full', 'full',    'hidden', 'hidden', 'hidden', 'limited', 'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  system_x_system:       r('full', 'full', 'full', 'full', 'full',    'hidden', 'hidden', 'hidden', 'hidden',  'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  possession_engine:     r('full', 'full', 'full', 'full', 'full',    'hidden', 'hidden', 'hidden', 'hidden',  'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  matchup_interactions:  r('full', 'full', 'full', 'full', 'full',    'hidden', 'hidden', 'hidden', 'hidden',  'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  box_score_projection:  r('full', 'full', 'full', 'full', 'full',    'hidden', 'hidden', 'hidden', 'hidden',  'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  scenarios:             r('full', 'full', 'full', 'full', 'limited', 'hidden', 'hidden', 'hidden', 'hidden',  'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
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

//                                                      R0      R1      R2      R3      R4        R5        R6        R7        R8      R9        R10       R11       R12       R13
const DEVELOPMENT_HUB_MATRIX: Record<DevelopmentTab, Record<SportsRoleLens, Visibility>> = {
  overview:          r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden', 'hidden', 'hidden',  'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  player_kr_profile: r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden', 'hidden', 'self',    'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  pathway:           r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden', 'hidden', 'self',    'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  weekly_plan:       r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden', 'hidden', 'self',    'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  evidence:          r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden', 'hidden', 'self',    'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  pro_readiness:     r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden', 'hidden', 'self',    'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
  transfer_portal:   r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden', 'hidden', 'hidden',  'hidden', 'hidden', 'hidden', 'hidden', 'hidden'),
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

/** R0-R3 can see: NIL amounts, aid details, health timelines, compliance records, revenue/finance data. */
export function canSeeSensitive(role: SportsRoleLens): boolean {
  return role === 'R0' || role === 'R1' || role === 'R2' || role === 'R3';
}

/** R0-R4 can see compare / coaching actions */
export function canSeeCoachActions(role: SportsRoleLens): boolean {
  return role === 'R0' || role === 'R1' || role === 'R2' || role === 'R3' || role === 'R4';
}

/** R0-R2: offer, aid, NIL buttons */
export function canSeeAdminActions(role: SportsRoleLens): boolean {
  return role === 'R0' || role === 'R1' || role === 'R2';
}

// =============================================================================
// ROSTER VIEW RBAC
// =============================================================================

export type RosterViewMode = 'list' | 'system' | 'cards';

const ROSTER_VIEW_MATRIX: Record<SportsRoleLens, RosterViewMode[]> = {
  R0:  ['list', 'system', 'cards'],
  R1:  ['list', 'system', 'cards'],
  R2:  ['list', 'system', 'cards'],
  R3:  ['list', 'system', 'cards'],
  R4:  ['list', 'system', 'cards'],
  R5:  ['list', 'cards'],
  R6:  ['list', 'cards'],
  R7:  ['cards'],
  R8:  ['cards'],
  R9:  ['cards'],
  R10: ['cards'],
  R11: ['cards'],
  R12: ['cards'],
  R13: ['list', 'cards'],
};

const ROSTER_DEFAULT_VIEW: Record<SportsRoleLens, RosterViewMode> = {
  R0:  'list',
  R1:  'list',
  R2:  'list',
  R3:  'list',
  R4:  'list',
  R5:  'list',
  R6:  'list',
  R7:  'cards',
  R8:  'cards',
  R9:  'cards',
  R10: 'cards',
  R11: 'cards',
  R12: 'cards',
  R13: 'cards',
};

export function getVisibleRosterViews(role: SportsRoleLens): RosterViewMode[] {
  return ROSTER_VIEW_MATRIX[role];
}

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

//                                                              R0      R1      R2      R3      R4        R5        R6        R7        R8        R9        R10       R11       R12       R13
const VIDEO_SECTION_MATRIX: Record<VideoSection, Record<SportsRoleLens, Visibility>> = {
  // Explore
  explore_official_releases:    r('full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  explore_game_center:          r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden',  'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'shared'),
  explore_player_hub:           r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden',  'hidden',  'self',    'hidden',  'hidden',  'limited', 'hidden',  'shared'),
  explore_practice_install:     r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  explore_scouting_opponent:    r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'shared'),
  explore_recruiting_targets:   r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  explore_development_clips:    r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden',  'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  explore_conference_league:    r('full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
  // Film Room
  filmroom_workspaces:          r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'shared'),
  filmroom_cutups:              r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'shared'),
  filmroom_assignments:         r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  filmroom_notes:               r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'shared'),
  // Library
  library_official_games:       r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden',  'hidden',  'limited', 'limited', 'hidden',  'limited', 'limited', 'shared'),
  library_practices_install:    r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  library_player_development:   r('full', 'full', 'full', 'full', 'full',    'limited', 'hidden',  'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  library_public_media:         r('full', 'full', 'full', 'full', 'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full',    'full'),
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

//                                                                R0      R1      R2      R3      R4        R5        R6        R7        R8        R9        R10       R11       R12       R13
const MESSAGES_SECTION_MATRIX: Record<MessagesSection, Record<SportsRoleLens, Visibility>> = {
  // Inbox
  inbox_blockers:       r('full', 'full', 'full', 'full', 'full',    'limited', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  inbox_approvals:      r('full', 'full', 'full', 'full', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  inbox_recruiting:     r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  inbox_nil:            r('full', 'full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'limited', 'hidden'),
  inbox_eligibility:    r('full', 'full', 'full', 'full', 'limited', 'hidden',  'full',    'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  // Rooms
  rooms_command:        r('full', 'full', 'full', 'full', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  rooms_staff:          r('full', 'full', 'full', 'full', 'full',    'limited', 'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  rooms_player:         r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  rooms_recruiting:     r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  rooms_ops_travel:     r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'full',    'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  rooms_media:          r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'shared'),
  rooms_compliance:     r('full', 'full', 'full', 'full', 'hidden',  'hidden',  'full',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  // Requests
  requests_approval:    r('full', 'full', 'full', 'full', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  requests_roster:      r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  requests_schedule:    r('full', 'full', 'full', 'full', 'full',    'hidden',  'hidden',  'limited', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  requests_recruiting:  r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  requests_eligibility: r('full', 'full', 'full', 'full', 'limited', 'hidden',  'full',    'hidden',  'self',    'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  requests_finance:     r('full', 'full', 'full', 'hidden','hidden', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  requests_incident:    r('full', 'full', 'full', 'full', 'full',    'limited', 'limited', 'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
  // Pinned
  pinned_full:          r('full', 'full', 'full', 'full', 'limited', 'hidden',  'hidden',  'hidden',  'limited', 'hidden',  'hidden',  'hidden',  'hidden',  'hidden'),
};

export function getMessagesSectionVisibility(section: MessagesSection, role: SportsRoleLens): Visibility {
  return MESSAGES_SECTION_MATRIX[section][role];
}

// =============================================================================
// QUICK ACTIONS BY ROLE
// =============================================================================

export interface SportsQuickAction {
  id: string;
  label: string;
  icon: string;
}

const SPORTS_QUICK_ACTIONS: Partial<Record<SportsRoleLens, SportsQuickAction[]>> = {
  R0: [
    { id: 'system-overview', label: 'System Overview', icon: 'gearshape.fill' },
    { id: 'all-programs', label: 'All Programs', icon: 'sportscourt.fill' },
    { id: 'finance-snapshot', label: 'Finance Snapshot', icon: 'dollarsign.circle.fill' },
    { id: 'audit-log', label: 'Audit Log', icon: 'doc.text.fill' },
  ],
  R1: [
    { id: 'athletic-overview', label: 'Athletic Overview', icon: 'sportscourt.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'compliance', label: 'Compliance', icon: 'checkmark.seal.fill' },
    { id: 'approve-requests', label: 'Approve Requests', icon: 'checkmark.circle.fill' },
  ],
  R2: [
    { id: 'athletic-overview', label: 'Athletic Overview', icon: 'sportscourt.fill' },
    { id: 'roster', label: 'Roster', icon: 'person.3.fill' },
    { id: 'budget-review', label: 'Budget Review', icon: 'dollarsign.circle.fill' },
    { id: 'recruiting', label: 'Recruiting', icon: 'person.badge.plus' },
    { id: 'compliance', label: 'Compliance', icon: 'checkmark.seal.fill' },
  ],
  R3: [
    { id: 'roster', label: 'Roster', icon: 'person.3.fill' },
    { id: 'game-plan', label: 'Game Plan', icon: 'sportscourt.fill' },
    { id: 'recruiting', label: 'Recruiting', icon: 'person.badge.plus' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'stats', label: 'Statistics', icon: 'chart.bar.fill' },
    { id: 'development', label: 'Development', icon: 'arrow.up.right.circle.fill' },
  ],
  R4: [
    { id: 'roster', label: 'Roster', icon: 'person.3.fill' },
    { id: 'game-plan', label: 'Game Plan', icon: 'sportscourt.fill' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'film', label: 'Film Room', icon: 'play.rectangle.fill' },
    { id: 'development', label: 'Development', icon: 'arrow.up.right.circle.fill' },
  ],
  R5: [
    { id: 'player-health', label: 'Player Health', icon: 'heart.fill' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'development', label: 'Development Plans', icon: 'arrow.up.right.circle.fill' },
  ],
  R6: [
    { id: 'eligibility', label: 'Eligibility', icon: 'checkmark.seal.fill' },
    { id: 'compliance', label: 'Compliance', icon: 'doc.text.fill' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
  ],
  R7: [
    { id: 'housing', label: 'Housing', icon: 'house.fill' },
    { id: 'meals', label: 'Meal Plans', icon: 'fork.knife' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
  ],
  R8: [
    { id: 'my-schedule', label: 'My Schedule', icon: 'calendar' },
    { id: 'my-stats', label: 'My Stats', icon: 'chart.bar.fill' },
    { id: 'film', label: 'Film Room', icon: 'play.rectangle.fill' },
    { id: 'development', label: 'My Development', icon: 'arrow.up.right.circle.fill' },
  ],
  R9: [
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'highlights', label: 'Highlights', icon: 'play.rectangle.fill' },
  ],
  R11: [
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'standings', label: 'Standings', icon: 'chart.bar.fill' },
    { id: 'highlights', label: 'Highlights', icon: 'play.rectangle.fill' },
  ],
  R12: [
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'program-health', label: 'Program Health', icon: 'chart.line.uptrend.xyaxis' },
    { id: 'highlights', label: 'Highlights', icon: 'play.rectangle.fill' },
  ],
  R13: [
    { id: 'roster', label: 'Roster', icon: 'person.3.fill' },
    { id: 'stats', label: 'Statistics', icon: 'chart.bar.fill' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
  ],
};

export function getSportsQuickActions(role: SportsRoleLens): SportsQuickAction[] {
  return SPORTS_QUICK_ACTIONS[role] || SPORTS_QUICK_ACTIONS.R11 || [];
}
