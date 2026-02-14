/**
 * Synergy-style play type efficiency data
 * Offense + Defense play types, shot profiles, coverage breakdown
 */

// ── Types ──

export interface PlayTypeRow {
  type: string;
  possPct: number;   // % of possessions
  ppp: number;       // points per possession
  percentile: number; // 0–99
  toPct: number;     // turnover %
  ftRate: number;    // FTA / FGA
}

export interface ShotZone {
  zone: string;
  freq: number;      // % of attempts
  ppp: number;
  efg: number;       // eFG% for that zone
}

export interface CoverageRow {
  scheme: string;
  freq: number;      // % of possessions covered this way
  pppAllowed: number;
}

export interface SynergyTeamSummary {
  offPPP: number;
  defPPP: number;
  tempo: number; // possessions per game
}

// ── Offense play types ──

export const OFFENSE_PLAY_TYPES: PlayTypeRow[] = [
  { type: 'P&R Ball Handler', possPct: 22.4, ppp: 0.91, percentile: 68, toPct: 14.2, ftRate: 0.31 },
  { type: 'Spot Up',          possPct: 18.7, ppp: 1.04, percentile: 72, toPct: 6.1,  ftRate: 0.12 },
  { type: 'Transition',       possPct: 14.3, ppp: 1.12, percentile: 81, toPct: 10.8, ftRate: 0.28 },
  { type: 'Isolation',        possPct: 9.8,  ppp: 0.84, percentile: 45, toPct: 12.5, ftRate: 0.34 },
  { type: 'P&R Roll Man',     possPct: 8.2,  ppp: 1.08, percentile: 74, toPct: 8.1,  ftRate: 0.22 },
  { type: 'Cut',              possPct: 7.6,  ppp: 1.24, percentile: 85, toPct: 4.3,  ftRate: 0.26 },
  { type: 'Off Screen',       possPct: 6.1,  ppp: 0.93, percentile: 56, toPct: 7.8,  ftRate: 0.14 },
  { type: 'Post Up',          possPct: 5.4,  ppp: 0.88, percentile: 52, toPct: 11.4, ftRate: 0.38 },
  { type: 'Handoff',          possPct: 4.3,  ppp: 0.96, percentile: 62, toPct: 9.2,  ftRate: 0.18 },
  { type: 'Putbacks',         possPct: 3.2,  ppp: 1.18, percentile: 70, toPct: 3.1,  ftRate: 0.42 },
];

// ── Defense play types (PPP allowed) ──

export const DEFENSE_PLAY_TYPES: PlayTypeRow[] = [
  { type: 'P&R Ball Handler', possPct: 24.1, ppp: 0.86, percentile: 71, toPct: 15.3, ftRate: 0.29 },
  { type: 'Spot Up',          possPct: 19.2, ppp: 0.94, percentile: 64, toPct: 5.8,  ftRate: 0.10 },
  { type: 'Transition',       possPct: 13.8, ppp: 1.06, percentile: 55, toPct: 9.4,  ftRate: 0.24 },
  { type: 'Isolation',        possPct: 10.5, ppp: 0.79, percentile: 76, toPct: 14.1, ftRate: 0.30 },
  { type: 'P&R Roll Man',     possPct: 7.9,  ppp: 0.98, percentile: 58, toPct: 7.2,  ftRate: 0.20 },
  { type: 'Cut',              possPct: 6.8,  ppp: 1.14, percentile: 42, toPct: 3.8,  ftRate: 0.24 },
  { type: 'Off Screen',       possPct: 5.7,  ppp: 0.87, percentile: 68, toPct: 8.1,  ftRate: 0.12 },
  { type: 'Post Up',          possPct: 5.1,  ppp: 0.82, percentile: 72, toPct: 12.6, ftRate: 0.36 },
  { type: 'Handoff',          possPct: 3.9,  ppp: 0.91, percentile: 60, toPct: 10.1, ftRate: 0.16 },
  { type: 'Putbacks',         possPct: 3.0,  ppp: 1.10, percentile: 52, toPct: 2.8,  ftRate: 0.40 },
];

// ── Shot profile (offense) ──

export const OFFENSE_SHOT_PROFILE: ShotZone[] = [
  { zone: 'Rim',      freq: 38.2, ppp: 1.22, efg: 61.0 },
  { zone: 'Mid-Range', freq: 18.4, ppp: 0.81, efg: 40.5 },
  { zone: '3-Point',  freq: 39.2, ppp: 1.02, efg: 34.0 },
  { zone: 'FT',       freq: 4.2,  ppp: 0.75, efg: 75.2 },
];

// ── Shot profile (defense allowed) ──

export const DEFENSE_SHOT_PROFILE: ShotZone[] = [
  { zone: 'Rim',      freq: 34.8, ppp: 1.14, efg: 57.0 },
  { zone: 'Mid-Range', freq: 20.1, ppp: 0.78, efg: 39.0 },
  { zone: '3-Point',  freq: 41.2, ppp: 0.96, efg: 32.0 },
  { zone: 'FT',       freq: 3.9,  ppp: 0.71, efg: 71.0 },
];

// ── Offense tempo breakdown ──

export const TEMPO_BREAKDOWN = {
  transition: { ppp: 1.12, freq: 14.3 },
  earlyOffense: { ppp: 1.01, freq: 22.1 },
  halfcourt: { ppp: 0.89, freq: 63.6 },
};

// ── Defense coverage breakdown ──

export const BALL_SCREEN_COVERAGE: CoverageRow[] = [
  { scheme: 'Drop',   freq: 42.3, pppAllowed: 0.88 },
  { scheme: 'Hedge',  freq: 24.1, pppAllowed: 0.92 },
  { scheme: 'Switch', freq: 18.7, pppAllowed: 0.84 },
  { scheme: 'ICE',    freq: 14.9, pppAllowed: 0.79 },
];

export const POST_COVERAGE: CoverageRow[] = [
  { scheme: 'Single',  freq: 55.4, pppAllowed: 0.86 },
  { scheme: 'Dig',     freq: 28.2, pppAllowed: 0.81 },
  { scheme: 'Double',  freq: 16.4, pppAllowed: 0.74 },
];

// ── Rim protection ──

export const RIM_PROTECTION = {
  fgPct: 54.2,
  freq: 34.8,
  blocksPerGame: 2.8,
};

// ── 3PT defense ──

export const THREE_PT_DEFENSE = {
  freq: 41.2,
  fgPct: 32.0,
  contestedPct: 68.4,
};

// ── Team summary ──

export const SYNERGY_SUMMARY: SynergyTeamSummary = {
  offPPP: 0.97,
  defPPP: 0.91,
  tempo: 68.4,
};

// ── Catch & Shoot vs Off Dribble 3s ──

export const THREE_PT_BREAKDOWN = {
  catchAndShoot: { freq: 71.2, efg: 36.8 },
  offDribble: { freq: 28.8, efg: 28.4 },
};

// ── Assisted % ──

export const ASSISTED_PCT = {
  rim: 52.4,
  mid: 34.1,
  three: 78.6,
};

// ── Per-player Synergy summary (top 8 by usage) ──

export interface PlayerSynergyRow {
  playerId: string;
  name: string;
  number: string;
  position: string;
  usagePct: number;
  ppp: number;
  percentile: number;
  topPlayType: string;
  topPlayTypePPP: number;
}

export const PLAYER_SYNERGY: PlayerSynergyRow[] = [
  { playerId: 'p0',  name: 'Thomas, J.',   number: '0',  position: 'CG', usagePct: 24.8, ppp: 1.02, percentile: 71, topPlayType: 'P&R BH',    topPlayTypePPP: 0.96 },
  { playerId: 'p1',  name: 'Asceric, N.',  number: '1',  position: 'F',  usagePct: 18.2, ppp: 0.94, percentile: 58, topPlayType: 'Post Up',    topPlayTypePPP: 0.92 },
  { playerId: 'p3',  name: 'Hicks, D.',    number: '3',  position: 'W',  usagePct: 16.5, ppp: 0.98, percentile: 64, topPlayType: 'Spot Up',    topPlayTypePPP: 1.08 },
  { playerId: 'p5',  name: 'Smith, K.',    number: '5',  position: 'PG', usagePct: 21.3, ppp: 0.89, percentile: 48, topPlayType: 'P&R BH',    topPlayTypePPP: 0.88 },
  { playerId: 'p9',  name: 'Rolle, M.',    number: '9',  position: 'B',  usagePct: 12.4, ppp: 1.06, percentile: 73, topPlayType: 'Cut',        topPlayTypePPP: 1.28 },
  { playerId: 'p10', name: 'Pierre, A.',   number: '10', position: 'CG', usagePct: 15.7, ppp: 0.91, percentile: 52, topPlayType: 'Isolation',  topPlayTypePPP: 0.86 },
  { playerId: 'p12', name: 'Guerrier, E.', number: '12', position: 'F',  usagePct: 14.1, ppp: 0.96, percentile: 61, topPlayType: 'Spot Up',    topPlayTypePPP: 1.04 },
  { playerId: 'p22', name: 'Williams, T.', number: '22', position: 'W',  usagePct: 13.8, ppp: 0.93, percentile: 55, topPlayType: 'Transition', topPlayTypePPP: 1.14 },
];

// ── Per-player shot profiles ──

export interface PlayerShotProfile {
  playerId: string;
  rim: { freq: number; efg: number };
  mid: { freq: number; efg: number };
  three: { freq: number; efg: number };
  catchAndShoot: { freq: number; efg: number };
  offDribble: { freq: number; efg: number };
  assistedPct: number;
}

export const PLAYER_SHOT_PROFILES: Record<string, PlayerShotProfile> = {
  'p0':  { playerId: 'p0',  rim: { freq: 32.4, efg: 58.2 }, mid: { freq: 22.1, efg: 42.8 }, three: { freq: 45.5, efg: 36.4 }, catchAndShoot: { freq: 62.0, efg: 38.1 }, offDribble: { freq: 38.0, efg: 33.2 }, assistedPct: 48.2 },
  'p1':  { playerId: 'p1',  rim: { freq: 48.2, efg: 62.4 }, mid: { freq: 24.6, efg: 44.1 }, three: { freq: 27.2, efg: 31.8 }, catchAndShoot: { freq: 78.0, efg: 34.2 }, offDribble: { freq: 22.0, efg: 24.6 }, assistedPct: 62.1 },
  'p3':  { playerId: 'p3',  rim: { freq: 28.6, efg: 55.8 }, mid: { freq: 14.2, efg: 38.4 }, three: { freq: 57.2, efg: 38.6 }, catchAndShoot: { freq: 72.0, efg: 40.2 }, offDribble: { freq: 28.0, efg: 34.1 }, assistedPct: 71.4 },
  'p5':  { playerId: 'p5',  rim: { freq: 36.8, efg: 54.2 }, mid: { freq: 20.4, efg: 40.2 }, three: { freq: 42.8, efg: 32.6 }, catchAndShoot: { freq: 55.0, efg: 35.4 }, offDribble: { freq: 45.0, efg: 28.8 }, assistedPct: 38.6 },
  'p9':  { playerId: 'p9',  rim: { freq: 58.4, efg: 68.2 }, mid: { freq: 22.8, efg: 48.4 }, three: { freq: 18.8, efg: 28.4 }, catchAndShoot: { freq: 82.0, efg: 30.2 }, offDribble: { freq: 18.0, efg: 22.4 }, assistedPct: 74.8 },
  'p10': { playerId: 'p10', rim: { freq: 34.2, efg: 56.8 }, mid: { freq: 18.6, efg: 41.2 }, three: { freq: 47.2, efg: 34.8 }, catchAndShoot: { freq: 58.0, efg: 36.8 }, offDribble: { freq: 42.0, efg: 31.2 }, assistedPct: 44.2 },
  'p12': { playerId: 'p12', rim: { freq: 42.4, efg: 60.2 }, mid: { freq: 20.2, efg: 42.6 }, three: { freq: 37.4, efg: 35.2 }, catchAndShoot: { freq: 68.0, efg: 37.4 }, offDribble: { freq: 32.0, efg: 30.8 }, assistedPct: 58.6 },
  'p22': { playerId: 'p22', rim: { freq: 30.8, efg: 54.6 }, mid: { freq: 16.4, efg: 39.8 }, three: { freq: 52.8, efg: 36.2 }, catchAndShoot: { freq: 66.0, efg: 38.4 }, offDribble: { freq: 34.0, efg: 32.2 }, assistedPct: 64.2 },
};
