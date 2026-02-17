/**
 * Mock Simulation V2 \u2014 Full Simulation OS.
 * Run types: Single Game, Series, Season, Tournament, Box Score, Line Translation.
 * Confidence Gate, Interaction Traces, Driver Summaries.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SimRunType = 'single_game' | 'series' | 'season' | 'tournament' | 'box_score_projection' | 'line_translation';
export type SimEnvironment = 'home' | 'away' | 'neutral';
export type SimVersion = 'V1' | 'V2' | 'V3';

export const SIM_RUN_TYPES: { id: SimRunType; label: string; icon: string }[] = [
  { id: 'single_game', label: 'Single Game', icon: 'sportscourt.fill' },
  { id: 'series', label: 'Series', icon: 'arrow.triangle.2.circlepath' },
  { id: 'season', label: 'Season', icon: 'calendar' },
  { id: 'tournament', label: 'Tournament', icon: 'trophy.fill' },
  { id: 'box_score_projection', label: 'Box Score', icon: 'tablecells.fill' },
  { id: 'line_translation', label: 'Line Translation', icon: 'chart.bar.fill' },
];

export interface ConfidenceGateRow {
  tier: string;
  label: string;
  minPct: number;
  maxPct: number;
}

export const CONFIDENCE_GATE: ConfidenceGateRow[] = [
  { tier: 'V1 stats-only', label: 'Stats Only', minPct: 55, maxPct: 70 },
  { tier: 'V1+system', label: 'Stats + System', minPct: 60, maxPct: 75 },
  { tier: 'V1+confirmed', label: 'Confirmed Intel', minPct: 65, maxPct: 80 },
  { tier: 'V2 granular', label: 'Granular Model', minPct: 75, maxPct: 88 },
  { tier: 'V2+trend', label: 'Granular + Trend', minPct: 80, maxPct: 92 },
  { tier: 'V3 film', label: 'Film-Augmented', minPct: 85, maxPct: 95 },
  { tier: 'V3+deep', label: 'Deep Film + Intel', minPct: 90, maxPct: 97 },
];

export interface SingleGameOutput {
  run_id: string;
  team_a: string;
  team_b: string;
  environment: SimEnvironment;
  sim_version: SimVersion;
  sim_confidence_pct: number;
  win_pct: { low: number; mid: number; high: number };
  margin: { low: number; mid: number; high: number };
  projected_pace: number;
  five_factors: { factor: string; team_a: number; team_b: number; advantage: 'A' | 'B' | 'even' }[];
  top_drivers: string[];
}

export interface BoxScorePlayerLine {
  name: string;
  position: string;
  minutes: number;
  points: number;
  fg: string;
  three_pt: string;
  rebounds: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
}

export interface SimDriver {
  rank: number;
  driver: string;
  explanation: string;
  impact_direction: 'positive' | 'negative';
}

export interface InteractionTrace {
  id: string;
  source_doc: string;
  key: string;
  targets_modified: string[];
  raw_delta: number;
  bounded_delta: number;
  step_order: number;
}

export interface SimRun {
  id: string;
  type: SimRunType;
  label: string;
  team_a: string;
  team_b: string;
  environment: SimEnvironment;
  version: SimVersion;
  confidence: number;
  win_pct: number;
  margin: number;
  created: string;
  locked: boolean;
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const MOCK_SINGLE_GAME: SingleGameOutput = {
  run_id: 'sim-sg-001',
  team_a: 'Florida Memorial',
  team_b: 'Lincoln (PA)',
  environment: 'home',
  sim_version: 'V2',
  sim_confidence_pct: 82,
  win_pct: { low: 62, mid: 71, high: 79 },
  margin: { low: 2, mid: 7, high: 14 },
  projected_pace: 68.4,
  five_factors: [
    { factor: 'Effective FG%', team_a: 51.2, team_b: 45.8, advantage: 'A' },
    { factor: 'Turnover Rate', team_a: 14.8, team_b: 17.2, advantage: 'A' },
    { factor: 'Offensive Reb%', team_a: 28.4, team_b: 30.1, advantage: 'B' },
    { factor: 'FT Rate', team_a: 32.6, team_b: 29.4, advantage: 'A' },
    { factor: 'Opp eFG%', team_a: 44.2, team_b: 49.6, advantage: 'A' },
  ],
  top_drivers: [
    'FMU pack line limits Lincoln PnR efficiency (-4.2 PPP adjustment)',
    'FMU transition offense creates 6.3 additional fast break points',
    'Kalejaiye rim protection forces 14% more contested shots at rim',
    'Williams PnR reads exploit Lincoln drop coverage (1.12 PPP projected)',
    'Lincoln 3PT variance is high \u2014 could swing margin by +/- 5 points',
  ],
};

export const MOCK_BOX_SCORE_A: BoxScorePlayerLine[] = [
  { name: 'B. Williams', position: 'PG', minutes: 33, points: 18, fg: '7-14', three_pt: '2-5', rebounds: 4, assists: 7, turnovers: 3, steals: 2, blocks: 0 },
  { name: 'C. Plantey', position: 'SG', minutes: 30, points: 12, fg: '4-10', three_pt: '3-7', rebounds: 3, assists: 2, turnovers: 1, steals: 1, blocks: 0 },
  { name: 'N. Chtelan', position: 'SF', minutes: 28, points: 10, fg: '4-9', three_pt: '1-3', rebounds: 5, assists: 2, turnovers: 1, steals: 1, blocks: 1 },
  { name: 'P. Diomande', position: 'PF', minutes: 27, points: 11, fg: '5-10', three_pt: '0-2', rebounds: 8, assists: 1, turnovers: 2, steals: 0, blocks: 1 },
  { name: 'L. Kalejaiye', position: 'C', minutes: 29, points: 14, fg: '6-9', three_pt: '0-0', rebounds: 10, assists: 1, turnovers: 2, steals: 1, blocks: 3 },
  { name: 'D. Blake', position: 'PG', minutes: 7, points: 2, fg: '1-3', three_pt: '0-1', rebounds: 1, assists: 2, turnovers: 1, steals: 0, blocks: 0 },
  { name: 'M. Collins', position: 'SG', minutes: 10, points: 5, fg: '2-5', three_pt: '1-3', rebounds: 1, assists: 0, turnovers: 0, steals: 1, blocks: 0 },
  { name: 'A. Hernandez', position: 'SF', minutes: 12, points: 4, fg: '2-4', three_pt: '0-1', rebounds: 3, assists: 1, turnovers: 1, steals: 1, blocks: 0 },
];

export const MOCK_DRIVERS: SimDriver[] = [
  { rank: 1, driver: 'Pack Line Paint Protection', explanation: 'FMU pack line forces Lincoln to take 62% of shots from mid-range and perimeter, where they shoot 38.2% combined.', impact_direction: 'positive' },
  { rank: 2, driver: 'Transition Offense Advantage', explanation: 'FMU averages 14.8 fast break points vs Lincoln allowing 16.2. Projected +6.3 transition margin.', impact_direction: 'positive' },
  { rank: 3, driver: 'Kalejaiye Rim Presence', explanation: 'Kalejaiye alters 4.2 shots/game at the rim. Lincoln relies on rim attacks for 38% of scoring.', impact_direction: 'positive' },
  { rank: 4, driver: 'Harris Isolation Scoring', explanation: 'Lincoln PG Harris scores 22.4 PPG and can create against pack line hedges. If Harris scores 25+, FMU win% drops to 58%.', impact_direction: 'negative' },
  { rank: 5, driver: 'FMU 3PT Variance', explanation: 'FMU 3PT% has 6.8% standard deviation game-to-game. A cold night shrinks margin to +2.', impact_direction: 'negative' },
];

export const MOCK_TRACES: InteractionTrace[] = [
  { id: 'tr-1', source_doc: 'Motion Read & React vs Containment Man', key: 'PnR coverage mismatch', targets_modified: ['eFG%', 'assist_rate'], raw_delta: 3.2, bounded_delta: 2.8, step_order: 1 },
  { id: 'tr-2', source_doc: 'Pack Line vs Spread Pick & Roll', key: 'Paint protection vs driving lanes', targets_modified: ['rim_fg%', 'ft_rate'], raw_delta: -2.1, bounded_delta: -1.9, step_order: 2 },
  { id: 'tr-3', source_doc: 'Primary Ball Handler vs Containment Man', key: 'Williams PnR exploit', targets_modified: ['pnr_ppp', 'ast_rate'], raw_delta: 4.5, bounded_delta: 3.8, step_order: 3 },
  { id: 'tr-4', source_doc: 'Rim Protector vs Spread PnR', key: 'Kalejaiye contests at rim', targets_modified: ['opp_rim_fg%', 'block_rate'], raw_delta: -3.4, bounded_delta: -3.0, step_order: 4 },
  { id: 'tr-5', source_doc: '3-and-D Wing vs Spread PnR', key: 'Plantey denies wing actions', targets_modified: ['opp_catch_shoot_pct'], raw_delta: -2.6, bounded_delta: -2.2, step_order: 5 },
];

export const SAVED_SIM_RUNS: SimRun[] = [
  { id: 'sim-sg-001', type: 'single_game', label: 'FMU vs Lincoln \u2014 Single Game', team_a: 'Florida Memorial', team_b: 'Lincoln (PA)', environment: 'home', version: 'V2', confidence: 82, win_pct: 71, margin: 7, created: 'Feb 16, 2026', locked: false },
  { id: 'sim-bs-001', type: 'box_score_projection', label: 'FMU vs Lincoln \u2014 Box Score', team_a: 'Florida Memorial', team_b: 'Lincoln (PA)', environment: 'home', version: 'V2', confidence: 78, win_pct: 71, margin: 7, created: 'Feb 16, 2026', locked: false },
  { id: 'sim-lt-001', type: 'line_translation', label: 'FMU vs Lincoln \u2014 Lines', team_a: 'Florida Memorial', team_b: 'Lincoln (PA)', environment: 'home', version: 'V2', confidence: 82, win_pct: 71, margin: 7, created: 'Feb 16, 2026', locked: true },
];

export const MOCK_CONSTRAINTS = {
  minutes_constraints: [
    { playerName: 'L. Kalejaiye', minMinutes: 24, maxMinutes: 32, note: 'Foul trouble risk \u2014 cap at 32' },
    { playerName: 'J. Washington', minMinutes: 4, maxMinutes: 10, note: 'Development minutes only' },
    { playerName: 'D. Blake', minMinutes: 6, maxMinutes: 14, note: 'Ankle soreness \u2014 monitor' },
  ],
  availability_flags: [{ player: 'D. Blake', flag: 'Questionable \u2014 Left ankle' }],
  what_if_toggles: [
    { id: 'wif-1', label: 'Blake sits (DNP)', enabled: false },
    { id: 'wif-2', label: 'Push pace (+5 possessions)', enabled: true },
    { id: 'wif-3', label: 'Zone defense (switch DSIE)', enabled: false },
    { id: 'wif-4', label: 'Small-ball lineup emphasis', enabled: false },
  ],
};
