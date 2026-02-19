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

// =============================================================================
// SIMULATION 2: Season Projection — Remaining Games → 22-8 Final Record
// =============================================================================

export interface SeasonProjectionOutput {
  run_id: string;
  team: string;
  current_record: { wins: number; losses: number };
  projected_record: { wins: number; losses: number };
  remaining_games: { opponent: string; date: string; environment: SimEnvironment; win_pct: number; projected_result: 'W' | 'L' }[];
  tournament_probability: number;
  conference_finish: { projected_seed: number; range: string };
  sim_version: SimVersion;
  sim_confidence_pct: number;
  top_drivers: string[];
  data_source?: string;
}

export const MOCK_SEASON_PROJECTION: SeasonProjectionOutput = {
  run_id: 'sim-season-001',
  team: 'Florida Memorial',
  current_record: { wins: 18, losses: 6 },
  projected_record: { wins: 22, losses: 8 },
  remaining_games: [
    { opponent: 'Keiser University', date: 'Feb 19', environment: 'away', win_pct: 64, projected_result: 'W' },
    { opponent: 'Webber International', date: 'Feb 21', environment: 'away', win_pct: 72, projected_result: 'W' },
    { opponent: 'Southeastern University', date: 'Feb 22', environment: 'home', win_pct: 58, projected_result: 'W' },
    { opponent: 'Ave Maria University', date: 'Feb 26', environment: 'home', win_pct: 81, projected_result: 'W' },
    { opponent: 'Warner University', date: 'Mar 1', environment: 'away', win_pct: 55, projected_result: 'L' },
    { opponent: 'Thomas University', date: 'Mar 4', environment: 'home', win_pct: 74, projected_result: 'W' },
  ],
  tournament_probability: 68,
  conference_finish: { projected_seed: 3, range: '2-4' },
  sim_version: 'V2',
  sim_confidence_pct: 74,
  top_drivers: [
    'FMU home record (11-1) anchors projected wins at Wellness Center',
    'Pack line defense ranks top-3 in Sun Conference — sustains low-scoring opponents',
    'Williams + Kalejaiye two-man game is conference-best PnR combo (1.14 PPP)',
    'Road games at Warner and Keiser are swing games — both projected within 3 pts',
    '3PT% regression risk: if team drops below 33% from deep, projected record falls to 20-10',
    'Bench depth (Blake ankle, Collins slump) is key vulnerability for late-season fatigue',
  ],
  data_source: 'demo_seed',
};

export const SEASON_PROJECTION_DRIVERS: SimDriver[] = [
  { rank: 1, driver: 'Home Court Advantage', explanation: 'FMU is 11-1 at home. Wellness Center provides a 4.8-point home boost per game. 3 of 6 remaining games are at home.', impact_direction: 'positive' },
  { rank: 2, driver: 'Pack Line Defense Consistency', explanation: 'FMU defensive rating has been below 95 in 7 of last 10 games. Sustained defensive effort projects well for remaining schedule.', impact_direction: 'positive' },
  { rank: 3, driver: 'Kalejaiye Foul Trouble Risk', explanation: 'Kalejaiye has 4+ fouls in 6 games this season. In those games, FMU is 3-3. If foul trouble continues, projected wins drop.', impact_direction: 'negative' },
  { rank: 4, driver: 'Road Schedule Difficulty', explanation: 'Three road games remain including Keiser and Warner — both projected within 3 points. Road record is 7-5.', impact_direction: 'negative' },
  { rank: 5, driver: 'Conference Tournament Seeding', explanation: 'A 3-seed or better guarantees home-court in first round. FMU needs 3 more wins to clinch no worse than 3-seed.', impact_direction: 'positive' },
];

// =============================================================================
// SIMULATION 3: Next Game vs Keiser — Single Game Deep Dive
// =============================================================================

export const MOCK_KEISER_GAME: SingleGameOutput = {
  run_id: 'sim-sg-keiser-001',
  team_a: 'Florida Memorial',
  team_b: 'Keiser University',
  environment: 'away',
  sim_version: 'V2',
  sim_confidence_pct: 78,
  win_pct: { low: 56, mid: 64, high: 72 },
  margin: { low: -2, mid: 4, high: 11 },
  projected_pace: 70.2,
  five_factors: [
    { factor: 'Effective FG%', team_a: 49.8, team_b: 47.2, advantage: 'A' },
    { factor: 'Turnover Rate', team_a: 15.1, team_b: 16.8, advantage: 'A' },
    { factor: 'Offensive Reb%', team_a: 26.2, team_b: 31.4, advantage: 'B' },
    { factor: 'FT Rate', team_a: 31.8, team_b: 28.6, advantage: 'A' },
    { factor: 'Opp eFG%', team_a: 45.6, team_b: 48.2, advantage: 'A' },
  ],
  top_drivers: [
    'Keiser drops on PnR — Williams pull-up at nail is projected 48% (1.12 PPP)',
    'FMU transition offense vs Keiser transition D creates +5.8 fast break point margin',
    'Keiser OREB% (31.4%) is their biggest edge — Carter crashes hard, must box out',
    'Away environment reduces FMU win% by ~4.8% based on season road splits',
    'If Williams held under 14 pts, FMU win% drops to 51% — he must be the engine',
  ],
};

export const MOCK_BOX_SCORE_KEISER_FMU: BoxScorePlayerLine[] = [
  { name: 'B. Williams', position: 'PG', minutes: 34, points: 19, fg: '7-15', three_pt: '2-6', rebounds: 3, assists: 6, turnovers: 3, steals: 2, blocks: 0 },
  { name: 'C. Plantey', position: 'SG', minutes: 31, points: 11, fg: '4-11', three_pt: '2-6', rebounds: 4, assists: 1, turnovers: 1, steals: 1, blocks: 0 },
  { name: 'N. Chtelan', position: 'SF', minutes: 28, points: 8, fg: '3-8', three_pt: '1-3', rebounds: 5, assists: 3, turnovers: 2, steals: 0, blocks: 1 },
  { name: 'P. Diomande', position: 'PF', minutes: 26, points: 10, fg: '4-9', three_pt: '0-1', rebounds: 7, assists: 1, turnovers: 1, steals: 0, blocks: 1 },
  { name: 'L. Kalejaiye', position: 'C', minutes: 30, points: 13, fg: '5-8', three_pt: '0-0', rebounds: 9, assists: 1, turnovers: 2, steals: 0, blocks: 3 },
  { name: 'D. Blake', position: 'PG', minutes: 6, points: 2, fg: '1-2', three_pt: '0-1', rebounds: 0, assists: 2, turnovers: 1, steals: 0, blocks: 0 },
  { name: 'M. Collins', position: 'SG', minutes: 11, points: 5, fg: '2-5', three_pt: '1-3', rebounds: 2, assists: 0, turnovers: 0, steals: 0, blocks: 0 },
  { name: 'A. Hernandez', position: 'SF', minutes: 14, points: 3, fg: '1-3', three_pt: '0-0', rebounds: 2, assists: 1, turnovers: 0, steals: 2, blocks: 0 },
];

export const MOCK_BOX_SCORE_KEISER_OPP: BoxScorePlayerLine[] = [
  { name: 'D. Harris', position: 'PG', minutes: 35, points: 21, fg: '8-18', three_pt: '1-5', rebounds: 3, assists: 6, turnovers: 4, steals: 1, blocks: 0 },
  { name: 'T. Mitchell', position: 'SG', minutes: 30, points: 10, fg: '4-12', three_pt: '2-7', rebounds: 2, assists: 2, turnovers: 2, steals: 1, blocks: 0 },
  { name: 'R. Davis', position: 'SF', minutes: 27, points: 8, fg: '3-7', three_pt: '1-3', rebounds: 4, assists: 1, turnovers: 1, steals: 0, blocks: 0 },
  { name: 'K. Jones', position: 'PF', minutes: 25, points: 7, fg: '3-8', three_pt: '0-2', rebounds: 5, assists: 1, turnovers: 2, steals: 0, blocks: 0 },
  { name: 'J. Carter', position: 'C', minutes: 30, points: 12, fg: '5-9', three_pt: '0-0', rebounds: 11, assists: 0, turnovers: 1, steals: 0, blocks: 2 },
  { name: 'A. Phillips', position: 'PG', minutes: 5, points: 2, fg: '1-2', three_pt: '0-0', rebounds: 0, assists: 1, turnovers: 1, steals: 0, blocks: 0 },
  { name: 'L. Brown', position: 'SF', minutes: 12, points: 4, fg: '2-4', three_pt: '0-1', rebounds: 3, assists: 0, turnovers: 0, steals: 1, blocks: 0 },
  { name: 'M. Thompson', position: 'PF', minutes: 8, points: 3, fg: '1-3', three_pt: '1-2', rebounds: 2, assists: 0, turnovers: 1, steals: 0, blocks: 0 },
];

export const MOCK_KEISER_DRIVERS: SimDriver[] = [
  { rank: 1, driver: 'Williams PnR Exploitation', explanation: 'Keiser drops on PnR 74% of possessions. Williams pull-up from nail is projected at 48% (1.12 PPP). This is FMU\'s primary advantage.', impact_direction: 'positive' },
  { rank: 2, driver: 'Transition Offense Edge', explanation: 'Keiser ranks 142nd nationally in transition D. FMU projected for 16.2 fast break points. This is the biggest single-factor edge.', impact_direction: 'positive' },
  { rank: 3, driver: 'Kalejaiye Rim Protection', explanation: 'Kalejaiye projects for 3 blocks and 14% additional contested shots at the rim. This suppresses Keiser\'s paint scoring.', impact_direction: 'positive' },
  { rank: 4, driver: 'Keiser OREB Crashing', explanation: 'Carter grabs 4.2 OREB/game. Keiser is top-20 nationally in OREB%. Projected second-chance points: 11.4 (FMU avg allows 8.2).', impact_direction: 'negative' },
  { rank: 5, driver: 'Away Court Factor', explanation: 'FMU road record is 7-5 this season. Away environment projected to reduce FMU efficiency by 2.1% on both ends.', impact_direction: 'negative' },
  { rank: 6, driver: 'Harris ISO Ability', explanation: 'Harris scores 22.4 PPG and can create against pack line hedges. If Harris exceeds 25 pts, FMU win probability drops to 52%.', impact_direction: 'negative' },
];

export const MOCK_KEISER_TRACES: InteractionTrace[] = [
  { id: 'tr-k-1', source_doc: 'Motion Read & React vs Drop PnR Coverage', key: 'Williams pull-up at nail', targets_modified: ['eFG%', 'pnr_ppp', 'ast_rate'], raw_delta: 4.2, bounded_delta: 3.6, step_order: 1 },
  { id: 'tr-k-2', source_doc: 'Pack Line vs Spread Pick & Roll (Keiser)', key: 'Paint protection vs Harris drives', targets_modified: ['rim_fg%', 'ft_rate', 'opp_paint_pts'], raw_delta: -2.8, bounded_delta: -2.4, step_order: 2 },
  { id: 'tr-k-3', source_doc: 'Transition Offense vs Slow Transition D', key: 'Fast break advantage', targets_modified: ['fast_break_pts', 'pace_factor'], raw_delta: 5.8, bounded_delta: 4.9, step_order: 3 },
  { id: 'tr-k-4', source_doc: 'Rim Protector vs Interior Attack', key: 'Kalejaiye contests', targets_modified: ['opp_rim_fg%', 'block_rate', 'opp_paint_pts'], raw_delta: -3.6, bounded_delta: -3.1, step_order: 4 },
  { id: 'tr-k-5', source_doc: 'Offensive Rebounding Rate', key: 'Carter crash OREB', targets_modified: ['opp_oreb%', 'second_chance_pts'], raw_delta: 3.2, bounded_delta: 2.8, step_order: 5 },
  { id: 'tr-k-6', source_doc: 'Away Environment Adjustment', key: 'Road game factor', targets_modified: ['eFG%', 'ft%', 'to_rate'], raw_delta: -2.1, bounded_delta: -1.8, step_order: 6 },
];

// =============================================================================
// SIMULATION 4: Transfer Portal Impact — "What if we add Player X?"
// =============================================================================

export interface TransferPortalImpactOutput {
  run_id: string;
  team: string;
  portal_player: {
    name: string;
    position: string;
    kr_rating: number;
    origin: string;
    key_skills: string[];
    projected_minutes: number;
  };
  team_kr_before: number;
  team_kr_after: number;
  team_kr_delta: number;
  win_projection_before: { wins: number; losses: number };
  win_projection_after: { wins: number; losses: number };
  lineup_impact: {
    displaced_player: string;
    displaced_minutes_lost: number;
    new_lineup_rating: number;
    old_lineup_rating: number;
  }[];
  skill_gaps_filled: string[];
  fit_score: number; // 0-100
  sim_version: SimVersion;
  sim_confidence_pct: number;
  top_drivers: string[];
  data_source?: string;
}

export const MOCK_TRANSFER_PORTAL_IMPACT: TransferPortalImpactOutput = {
  run_id: 'sim-portal-001',
  team: 'Florida Memorial',
  portal_player: {
    name: 'Jaylen Cross',
    position: 'Wing (SF/SG)',
    kr_rating: 82,
    origin: 'Division I — mid-major transfer',
    key_skills: ['Catch-and-shoot 3PT (39.2%)', 'Wing defense (1.4 STL/game)', 'Off-ball movement', 'Transition finishing'],
    projected_minutes: 22,
  },
  team_kr_before: 71.4,
  team_kr_after: 74.8,
  team_kr_delta: 3.4,
  win_projection_before: { wins: 22, losses: 8 },
  win_projection_after: { wins: 25, losses: 5 },
  lineup_impact: [
    { displaced_player: 'N. Chtelan', displaced_minutes_lost: 10, new_lineup_rating: 76.2, old_lineup_rating: 72.8 },
    { displaced_player: 'M. Collins', displaced_minutes_lost: 8, new_lineup_rating: 74.1, old_lineup_rating: 70.4 },
    { displaced_player: 'A. Hernandez', displaced_minutes_lost: 4, new_lineup_rating: 75.8, old_lineup_rating: 73.2 },
  ],
  skill_gaps_filled: [
    'Perimeter shooting consistency — team 3PT% projects to jump from 34.1% to 36.8%',
    'Wing depth — Cross provides reliable 2-way wing behind Plantey',
    'Off-ball movement — Cross runs off screens at 1.18 PPP (top-10% nationally)',
    'Defensive versatility — can guard 1-through-3, improves switching capability',
  ],
  fit_score: 84,
  sim_version: 'V2',
  sim_confidence_pct: 68,
  top_drivers: [
    'Cross 3PT% (39.2%) directly addresses FMU top team priority: perimeter shooting consistency',
    'Adding a KR 82 wing raises closing lineup rating from 72.8 to 76.2 — significant for crunch time',
    'Cross wing defense (1.4 STL) allows Hernandez to stay as specialist rather than primary wing defender',
    'Projected lineup versatility: can run Cross at SG in "big" lineups or SF in "small" lineups',
    'Risk: Cross needs time to learn Motion Read & React system — full integration by mid-season',
  ],
  data_source: 'demo_seed',
};

export const MOCK_PORTAL_DRIVERS: SimDriver[] = [
  { rank: 1, driver: '3PT Shooting Upgrade', explanation: 'Cross shoots 39.2% from 3 on 5.4 attempts/game. FMU team 3PT% projects from 34.1% to 36.8%, directly addressing top priority.', impact_direction: 'positive' },
  { rank: 2, driver: 'Closing Lineup Improvement', explanation: 'Cross in closing lineup (Williams, Plantey, Cross, Diomande, Kalejaiye) rates 76.2 KR vs 72.8 current. +3.4 rating swing.', impact_direction: 'positive' },
  { rank: 3, driver: 'Defensive Versatility', explanation: 'Cross can guard 1-3 at 6\'5" with 6\'9" wingspan. Allows more switching schemes and reduces reliance on Hernandez.', impact_direction: 'positive' },
  { rank: 4, driver: 'System Learning Curve', explanation: 'Motion Read & React requires 4-6 weeks of practice reps for full integration. Cross would be limited initially.', impact_direction: 'negative' },
  { rank: 5, driver: 'Chemistry Disruption Risk', explanation: 'Adding a high-usage wing could disrupt existing Plantey/Chtelan minutes balance. Requires careful rotation management.', impact_direction: 'negative' },
];

export const MOCK_PORTAL_TRACES: InteractionTrace[] = [
  { id: 'tr-p-1', source_doc: 'Portal Player KR Rating Integration', key: 'Cross KR 82 → team KR uplift', targets_modified: ['team_kr', 'closing_lineup_kr'], raw_delta: 3.4, bounded_delta: 3.0, step_order: 1 },
  { id: 'tr-p-2', source_doc: '3PT Shooting Model', key: 'Cross catch-and-shoot impact', targets_modified: ['team_3pt_pct', 'eFG%', 'spacing_score'], raw_delta: 2.7, bounded_delta: 2.4, step_order: 2 },
  { id: 'tr-p-3', source_doc: 'Minutes Redistribution Model', key: 'Chtelan/Collins minutes reduction', targets_modified: ['chtelan_mpg', 'collins_mpg', 'bench_depth_score'], raw_delta: -1.2, bounded_delta: -1.0, step_order: 3 },
  { id: 'tr-p-4', source_doc: 'Defensive Versatility Model', key: 'Switch-everything capability', targets_modified: ['def_rating', 'switch_pct', 'opp_eFG%'], raw_delta: -1.8, bounded_delta: -1.5, step_order: 4 },
  { id: 'tr-p-5', source_doc: 'System Integration Penalty', key: 'Motion Read & React learning curve', targets_modified: ['ast_rate', 'to_rate', 'offensive_rating'], raw_delta: -2.4, bounded_delta: -2.0, step_order: 5 },
];

// — Append new runs to SAVED_SIM_RUNS (keep original 3 + add 3 new) —
export const SAVED_SIM_RUNS_ALL: SimRun[] = [
  ...SAVED_SIM_RUNS,
  {
    id: 'sim-season-001',
    type: 'season',
    label: 'FMU 2025-26 Season Projection',
    team_a: 'Florida Memorial',
    team_b: '(remaining schedule)',
    environment: 'neutral',
    version: 'V2',
    confidence: 74,
    win_pct: 73,
    margin: 4,
    created: 'Feb 17, 2026',
    locked: false,
  },
  {
    id: 'sim-sg-keiser-001',
    type: 'single_game',
    label: 'FMU vs Keiser — Feb 19 Preview',
    team_a: 'Florida Memorial',
    team_b: 'Keiser University',
    environment: 'away',
    version: 'V2',
    confidence: 78,
    win_pct: 64,
    margin: 4,
    created: 'Feb 18, 2026',
    locked: false,
  },
  {
    id: 'sim-portal-001',
    type: 'box_score_projection',
    label: 'Transfer Portal: Jaylen Cross (KR 82 Wing)',
    team_a: 'Florida Memorial',
    team_b: 'Florida Memorial + Cross',
    environment: 'neutral',
    version: 'V2',
    confidence: 68,
    win_pct: 83,
    margin: 3,
    created: 'Feb 18, 2026',
    locked: false,
  },
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
