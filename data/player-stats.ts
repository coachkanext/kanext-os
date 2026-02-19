/**
 * Per-recruit season statistics (traditional box score stats).
 * Keyed by PoolPlayer.id. Generated deterministically from keyStatLine where
 * possible, with remaining stats filled via hash for stability.
 */

import { PLAYER_POOL } from '@/data/playerPool';

export interface PlayerSeasonStats {
  min: number;    // Minutes per game
  pts: number;    // Points per game
  fgPct: number;  // Field goal %
  threePct: number; // 3PT %
  ftPct: number;  // Free throw %
  reb: number;    // Total rebounds per game
  oreb: number;   // Offensive rebounds per game
  dreb: number;   // Defensive rebounds per game
  ast: number;    // Assists per game
  to: number;     // Turnovers per game
  stl: number;    // Steals per game
  blk: number;    // Blocks per game
  pf: number;     // Personal fouls per game
  plusMinus: number; // +/- per game
}

// Stat metadata for display
export type StatKey = keyof PlayerSeasonStats;

export interface StatMeta {
  key: StatKey;
  label: string;
  short: string;   // Abbreviation for chip pills
  format: (v: number) => string;
}

const pctFmt = (v: number) => `${v.toFixed(1)}%`;
const decFmt = (v: number) => v.toFixed(1);
const intFmt = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`;

export const STAT_META: StatMeta[] = [
  { key: 'pts',      label: 'Points',             short: 'PTS',  format: decFmt },
  { key: 'fgPct',    label: 'Field Goal %',        short: 'FG%',  format: pctFmt },
  { key: 'threePct', label: '3-Point %',           short: '3PT%', format: pctFmt },
  { key: 'ftPct',    label: 'Free Throw %',        short: 'FT%',  format: pctFmt },
  { key: 'reb',      label: 'Rebounds',            short: 'REB',  format: decFmt },
  { key: 'oreb',     label: 'Offensive Rebounds',  short: 'OREB', format: decFmt },
  { key: 'dreb',     label: 'Defensive Rebounds',  short: 'DREB', format: decFmt },
  { key: 'ast',      label: 'Assists',             short: 'AST',  format: decFmt },
  { key: 'to',       label: 'Turnovers',           short: 'TO',   format: decFmt },
  { key: 'stl',      label: 'Steals',              short: 'STL',  format: decFmt },
  { key: 'blk',      label: 'Blocks',              short: 'BLK',  format: decFmt },
  { key: 'min',      label: 'Minutes',             short: 'MIN',  format: decFmt },
  { key: 'pf',       label: 'Personal Fouls',      short: 'PF',   format: decFmt },
  { key: 'plusMinus', label: 'Plus/Minus',          short: '+/-',  format: intFmt },
];

// Stat groups for the hierarchical filter
export interface StatGroup {
  key: string;
  label: string;
  stats: StatKey[];
}

export const STAT_GROUPS: StatGroup[] = [
  { key: 'scoring',     label: 'Scoring',     stats: ['pts', 'fgPct', 'threePct', 'ftPct'] },
  { key: 'rebounding',  label: 'Rebounding',  stats: ['reb', 'oreb', 'dreb'] },
  { key: 'playmaking',  label: 'Playmaking',  stats: ['ast', 'to'] },
  { key: 'defense',     label: 'Defense',      stats: ['stl', 'blk'] },
  { key: 'general',     label: 'General',      stats: ['min', 'pf', 'plusMinus'] },
];

// ── Deterministic hash for stable mock generation ──
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Parse PPG, RPG, APG, BPG from keyStatLine
function parseStatLine(line: string): { ppg?: number; rpg?: number; apg?: number; bpg?: number } {
  const result: { ppg?: number; rpg?: number; apg?: number; bpg?: number } = {};
  const parts = line.split('/').map((s) => s.trim());
  for (const part of parts) {
    const match = part.match(/([\d.]+)\s*(PPG|RPG|APG|BPG)/i);
    if (match) {
      const val = parseFloat(match[1]);
      const type = match[2].toUpperCase();
      if (type === 'PPG') result.ppg = val;
      else if (type === 'RPG') result.rpg = val;
      else if (type === 'APG') result.apg = val;
      else if (type === 'BPG') result.bpg = val;
    }
  }
  return result;
}

// Generate stable stats for a player
function generateStats(id: string, keyStatLine: string, position: string): PlayerSeasonStats {
  const parsed = parseStatLine(keyStatLine);
  const h = hash(id);

  const pts = parsed.ppg ?? 10 + (h % 15);
  const reb = parsed.rpg ?? 3 + (h % 8);
  const ast = parsed.apg ?? 1 + (h % 7);
  const blk = parsed.bpg ?? 0.2 + ((h % 20) / 10);

  // Derive splits from totals
  const orebPct = position === 'B' || position === 'F' ? 0.3 + (h % 10) / 100 : 0.15 + (h % 10) / 100;
  const oreb = Math.round(reb * orebPct * 10) / 10;
  const dreb = Math.round((reb - oreb) * 10) / 10;

  const fgPct = 38 + (hash(id + 'fg') % 22);    // 38-60%
  const threePct = 25 + (hash(id + '3p') % 22);  // 25-47%
  const ftPct = 60 + (hash(id + 'ft') % 30);     // 60-90%
  const min = 18 + (hash(id + 'min') % 18);      // 18-36
  const to = 1.0 + (hash(id + 'to') % 30) / 10;  // 1.0-4.0
  const stl = 0.5 + (hash(id + 'stl') % 20) / 10; // 0.5-2.5
  const pf = 1.5 + (hash(id + 'pf') % 20) / 10;  // 1.5-3.5
  const plusMinus = -8 + (hash(id + 'pm') % 24);   // -8 to +16

  return {
    min: Math.round(min * 10) / 10,
    pts: Math.round(pts * 10) / 10,
    fgPct: Math.round(fgPct * 10) / 10,
    threePct: Math.round(threePct * 10) / 10,
    ftPct: Math.round(ftPct * 10) / 10,
    reb: Math.round(reb * 10) / 10,
    oreb: Math.round(oreb * 10) / 10,
    dreb: Math.round(dreb * 10) / 10,
    ast: Math.round(ast * 10) / 10,
    to: Math.round(to * 10) / 10,
    stl: Math.round(stl * 10) / 10,
    blk: Math.round(blk * 10) / 10,
    pf: Math.round(pf * 10) / 10,
    plusMinus: Math.round(plusMinus * 10) / 10,
  };
}

// Pre-computed stats for all pool players
export const PLAYER_SEASON_STATS: Record<string, PlayerSeasonStats> = Object.fromEntries(
  PLAYER_POOL.map((p) => [p.id, generateStats(p.id, p.keyStatLine, p.position)]),
);

// Lookup helper
export function getPlayerStats(playerId: string): PlayerSeasonStats | undefined {
  return PLAYER_SEASON_STATS[playerId];
}

// Get stat meta by key
export function getStatMeta(key: StatKey): StatMeta | undefined {
  return STAT_META.find((m) => m.key === key);
}
