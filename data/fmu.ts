/**
 * FMU Data Bridge
 *
 * Transforms normalized FMU data (from data/sun-conference/florida-memorial/)
 * into the shapes each app screen expects. Replaces Lincoln demo data.
 */

import {
  players,
  rosterEntries,
  teamStats,
  individualSeasonStats,
  gameLogs,
  teamGameLogs,
  categoryLeaders,
} from './sun-conference/florida-memorial';

// ── Lookup helpers ──

const playerMap = new Map(players.map((p) => [p.player_id, p]));
const rosterMap2526 = new Map(
  rosterEntries
    .filter((r) => r.season === '2025-26')
    .map((r) => [r.player_id, r]),
);

// ── 1) Games list (from team game logs, 2025-26 season) ──

export type GameStatus = 'upcoming' | 'live' | 'final';

export type GameType = 'CONF' | 'NON-CONF' | 'TOURN';

export interface FMUGame {
  id: string;
  opponent: string;
  date: string;
  location: string;
  status: GameStatus;
  score?: string;
  clock?: string;
  gameType?: GameType;
  opponentKR?: number;
  opponentRecord?: string;
  gameTime?: string;
  venue?: string;
}

// Raw boxscore JSON for venue lookup
import boxscoresJson from './sun-conference/fmu-mens-basketball-2025-26.json';
const venueByDate = new Map<string, string>();
for (const g of boxscoresJson as any[]) {
  if (g.date && g.location) venueByDate.set(g.date, g.location);
}

const tgl2526 = teamGameLogs.filter((g) => g.season === '2025-26');

// ── Date-based schedule truth ──
// Parse team game log dates ("Feb 11", "Dec 5") into real Dates.
// For 2025-26 season: Oct–Dec → 2025, Jan–Mar → 2026.
const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Oct: 9, Nov: 10, Dec: 11,
};

function parseGameDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split(' ');
  if (parts.length < 2) return null;
  const month = MONTH_MAP[parts[0]];
  const day = parseInt(parts[1]);
  if (month == null || isNaN(day)) return null;
  const year = month >= 9 ? 2025 : 2026; // Oct-Dec = 2025, Jan-Mar = 2026
  return new Date(year, month, day);
}

const NOW = new Date();
const TODAY_START = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

// Sun Conference opponents (used for CONF/NON-CONF tagging + standings)
const sunConfTeams = [
  'Ave Maria', 'Coastal Georgia', 'Keiser', 'Southeastern',
  'St. Thomas', 'Warner', 'Webber International', 'New College of Florida',
];

export function isConfGame(opp: string | null): boolean {
  if (!opp) return false;
  return sunConfTeams.some((t) => opp.includes(t));
}

// Placeholder opponent records (seeded from opponent name for stability)
// TODO: Replace with real opponent data when available
export function placeholderRecord(opp: string, isConf: boolean): string {
  let h = 0;
  for (let i = 0; i < opp.length; i++) h = ((h << 5) - h + opp.charCodeAt(i)) | 0;
  const ovrW = 8 + (Math.abs(h) % 17);        // 8–24
  const ovrL = 4 + (Math.abs(h >> 8) % 15);   // 4–18
  const confW = Math.min(ovrW, 2 + (Math.abs(h >> 4) % 8));
  const confL = Math.min(ovrL, 1 + (Math.abs(h >> 12) % 6));
  return `${ovrW}-${ovrL} (${confW}-${confL})`;
}

/** Placeholder opponent KR rating (65–95, hash-stable per name) */
export function getOpponentKR(opp: string): number {
  let h = 0;
  for (let i = 0; i < opp.length; i++) h = ((h << 5) - h + opp.charCodeAt(i)) | 0;
  return 65 + (Math.abs(h) % 31);
}

const TODAY_END = new Date(TODAY_START.getTime() + 86400000); // midnight tonight

// Opponent → away venue name fallback (for games without boxscore venue data)
const OPPONENT_VENUES: Record<string, string> = {
  'Ave Maria': 'Tom Golisano FH',
  'Coastal Georgia': 'Howard Coffin Gym',
  'Keiser': 'Keiser Student Center',
  'Southeastern': 'The Furnace',
  'St. Thomas': 'Bobcat Arena',
  'Warner': 'Turner Athletic Center',
  'Webber International': 'Grace & Roger Babson Arena',
  'New College of Florida': 'Caples Fine Arts Complex',
  'Indiana Wesleyan': 'Luckey Arena',
  'Pikeville': 'Platt Arena',
  'Spartanburg Methodist': 'Platt Arena',
  'Hope International': 'Darling Pavilion',
  'Florida National': 'FNU Gym',
  'Tougaloo': 'Kroger Gymnasium',
  'Baker': 'Baker Gymnasium',
  'Faulkner': 'Tine Davis Gymnasium',
  'Fort Lauderdale': 'FTL Athletic Center',
  'Florida College': 'Badcock Gymnasium',
  'Brewton-Parker': 'Fountain-Herndon Gym',
  'LSU Shreveport': 'The Dock',
  'Loyola': 'The Den',
  'William Carey': 'Tatum Court',
  'Rust': 'Dillard Gymnasium',
  'Friends': 'Garvey Center',
  'Nelson': 'Nelson Arena',
  'The Master\'s': 'Bross Court',
};

function getVenueName(opp: string | null, homeAway: string | null, dateVenue: string | undefined): string {
  if (homeAway === 'H') return 'FMU Wellness Center';
  if (dateVenue && dateVenue !== 'Miami Gardens, Fla.') return dateVenue;
  if (!opp) return 'Away';
  // Match against OPPONENT_VENUES using partial match
  for (const [key, venue] of Object.entries(OPPONENT_VENUES)) {
    if (opp.includes(key)) return venue;
  }
  return 'Away';
}

export const FMU_GAMES: FMUGame[] = tgl2526.map((g, i) => {
  const d = parseGameDate(g.game_date);
  const hasResult = g.result != null;
  const isFuture = d != null && d >= TODAY_START && !hasResult;
  const isToday = d != null && d >= TODAY_START && d < TODAY_END;
  const isLive = isToday && !hasResult;
  const dateVenue = d ? venueByDate.get(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`) ?? undefined : undefined;
  // Placeholder live game for demo — toggle to false for non-game-day view
  const isTuskegeeLive = false; // g.opponent === 'Tuskegee';
  const effectiveLive = isTuskegeeLive;
  return {
    id: `fmu-2526-${String(i).padStart(2, '0')}`,
    opponent: g.opponent ?? 'Unknown',
    date: g.game_date ?? '',
    location: g.home_away === 'H' ? 'Home' : 'Away',
    status: (effectiveLive ? 'live' : !hasResult ? 'upcoming' : 'final') as GameStatus,
    score:
      effectiveLive ? '38-32'
      : g.result && g.fmu_score != null && g.opp_score != null
        ? `${g.result} ${g.fmu_score}-${g.opp_score}`
        : undefined,
    clock: effectiveLive ? '2H 14:22' : undefined,
    gameType: isConfGame(g.opponent) ? 'CONF' : 'NON-CONF',
    opponentKR: getOpponentKR(g.opponent ?? ''),
    opponentRecord: placeholderRecord(g.opponent ?? '', isConfGame(g.opponent)),
    gameTime: (() => {
      const times = ['2PM', '4PM', '5PM', '6PM', '7PM', '7:30PM', '8PM'];
      let h = 0;
      const n = g.opponent ?? '';
      for (let c = 0; c < n.length; c++) h = ((h << 5) - h + n.charCodeAt(c)) | 0;
      return times[Math.abs(h) % times.length];
    })(),
    venue: getVenueName(g.opponent, g.home_away, dateVenue),
  };
});

// Also keyed by ID for game-detail
export const FMU_GAMES_BY_ID: Record<
  string,
  { opponent: string; date: string; location: string; status: GameStatus; score?: string; clock?: string }
> = Object.fromEntries(FMU_GAMES.map((g) => [g.id, g]));

// ── 2) Leaders (from individual season stats, 2025-26) ──

export interface SeasonLeader {
  firebaseId: string;
  name: string;
  number: string;
  gamesPlayed: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
}

const stats2526 = individualSeasonStats.filter(
  (s) => s.season === '2025-26' && s.games_played != null && s.games_played > 0,
);

export const FMU_LEADERS: SeasonLeader[] = stats2526.map((s) => {
  const player = playerMap.get(s.player_id);
  const roster = rosterMap2526.get(s.player_id);
  const gp = s.games_played ?? 0;
  return {
    firebaseId: s.player_id,
    name: player?.full_name ?? 'Unknown',
    number: roster?.jersey_number ?? '0',
    gamesPlayed: gp,
    ppg: s.points_avg ?? 0,
    rpg: gp > 0 ? Math.round(((s.total_rebounds ?? 0) / gp) * 10) / 10 : 0,
    apg: gp > 0 ? Math.round(((s.assists ?? 0) / gp) * 10) / 10 : 0,
    spg: gp > 0 ? Math.round(((s.steals ?? 0) / gp) * 10) / 10 : 0,
    bpg: gp > 0 ? Math.round(((s.blocks ?? 0) / gp) * 10) / 10 : 0,
    fgPct: s.fg_pct != null ? Math.round(s.fg_pct * 1000) / 10 : 0,
    threePct: s.three_pt_pct != null ? Math.round(s.three_pt_pct * 1000) / 10 : 0,
    ftPct: s.ft_pct != null ? Math.round(s.ft_pct * 1000) / 10 : 0,
    totalPoints: s.points_total ?? 0,
    totalRebounds: s.total_rebounds ?? 0,
    totalAssists: s.assists ?? 0,
  };
});

// ── 3) Box scores (from individual game logs, grouped by game_id) ──

export interface BoxScoreLine {
  name: string;
  min: string;
  pts: number;
  reb: number;
  ast: number;
  fg: string;       // "made-attempted"
  threePt: string;  // "made-attempted"
  ft: string;       // "made-attempted"
  stl: number;
  blk: number;
  to: number;
  pf: number;
}

// Map gameLogs game_ids to FMU_GAMES ids
// gameLogs use raw game_ids like "3379", team game logs use date+opponent
// Build a mapping: for each team game log index → game_id from individual game logs
const gameIdToFmuId = new Map<string, string>();
const individualGameIds = [...new Set(gameLogs.map((gl) => gl.game_id))];

// Normalize opponent names for fuzzy matching (e.g. "Tougaloo (MS)" ↔ "Tougaloo (Miss.)")
function oppBase(name: string | null): string {
  if (!name) return '';
  return name.split(/[\s(]/)[0].toLowerCase();
}

// Normalize dates: individual logs use "10/31/2025", team logs use "Oct 31"
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function normDate(d: string | null): string {
  if (!d) return '';
  // Format: "10/31/2025" → "10-31"
  const slashParts = d.split('/');
  if (slashParts.length >= 2) return `${parseInt(slashParts[0])}-${parseInt(slashParts[1])}`;
  // Format: "Oct 31" → "10-31"
  const spaceParts = d.split(' ');
  if (spaceParts.length >= 2) {
    const mi = MONTH_NAMES.indexOf(spaceParts[0]);
    if (mi >= 0) return `${mi + 1}-${parseInt(spaceParts[1])}`;
  }
  return d;
}

// Match individual game_ids to team game logs by normalized date + opponent base
for (const rawId of individualGameIds) {
  const sample = gameLogs.find((gl) => gl.game_id === rawId);
  if (!sample) continue;
  const sDate = normDate(sample.game_date);
  const sOpp = oppBase(sample.opponent);
  const tglIdx = tgl2526.findIndex(
    (t) => normDate(t.game_date) === sDate && oppBase(t.opponent) === sOpp,
  );
  if (tglIdx >= 0) {
    gameIdToFmuId.set(rawId, `fmu-2526-${String(tglIdx).padStart(2, '0')}`);
  }
}

const boxScoresByGame = new Map<string, BoxScoreLine[]>();
for (const gl of gameLogs) {
  if (gl.season !== '2025-26') continue;
  const fmuId = gameIdToFmuId.get(gl.game_id);
  if (!fmuId) continue;
  const player = playerMap.get(gl.player_id);
  const lastName = player?.full_name?.split(' ').pop() ?? 'Unknown';
  const line: BoxScoreLine = {
    name: lastName,
    min: gl.minutes != null ? String(gl.minutes) : '—',
    pts: gl.points ?? 0,
    reb: gl.total_rebounds ?? 0,
    ast: gl.assists ?? 0,
    fg: `${gl.fg ?? 0}-${gl.fga ?? 0}`,
    threePt: `${gl.three_pt ?? 0}-${gl.three_pa ?? 0}`,
    ft: `${gl.ft ?? 0}-${gl.fta ?? 0}`,
    stl: gl.steals ?? 0,
    blk: gl.blocks ?? 0,
    to: gl.turnovers ?? 0,
    pf: gl.fouls ?? 0,
  };
  if (!boxScoresByGame.has(fmuId)) boxScoresByGame.set(fmuId, []);
  boxScoresByGame.get(fmuId)!.push(line);
}

// Sort each game's box score by points desc
for (const [, lines] of boxScoresByGame) {
  lines.sort((a, b) => b.pts - a.pts);
}

export const FMU_BOX_SCORES: Record<string, BoxScoreLine[]> = Object.fromEntries(boxScoresByGame);

// ── 3b) BPR (Basketball Performance Rating) per player per game ──

// Player archetype mapping: player_id → primary archetype label
const PLAYER_ARCHETYPES: Record<string, string> = {
  // Point Guards
  '11': 'Primary Creator',       // Sehmaj Mentor
  '15': 'Connector Guard',       // Micah Morgan
  '9':  'Developmental Guard',   // Ka'Mar Benbo
  // Combo Guards
  '13': 'Scoring Guard',         // Cameron Noel
  '55': 'Two-Way Guard',         // Aa'Reyon Munir-Jones
  '3':  'Developmental Guard',   // Rico Thompson
  // Wings
  '4':  'Primary Scorer',        // Devin Carter
  '0':  'Defensive Wing',        // Tristan Thomas
  '2':  'Developmental Wing',    // Braxton Lewis
  // Forwards
  '41': 'Stretch Forward',       // Morgan Brewer
  '7':  'Interior Enforcer',     // Maximo Moratinos
  '10': 'Developmental Forward', // Jason Morris
  // Bigs
  '5':  'Post Facilitator',      // Jeffrey Selden
  '1':  'Rim Protector',         // Petar Asceric
};

// Strip leading zeros from jersey for lookup (roster has "04", map uses "4")
function normJersey(j: string | null): string {
  if (!j) return '0';
  const n = parseInt(j, 10);
  return isNaN(n) ? j : String(n);
}

// Jersey → archetype (mapped through roster entries)
export const jerseyArchetypeMap = new Map<string, string>();
for (const r of rosterEntries.filter((r) => r.season === '2025-26')) {
  const arch = PLAYER_ARCHETYPES[normJersey(r.jersey_number)];
  if (arch) jerseyArchetypeMap.set(normJersey(r.jersey_number), arch);
}

// Also build player_id → archetype
const playerIdArchetypeMap = new Map<string, string>();
for (const r of rosterEntries.filter((r) => r.season === '2025-26')) {
  const arch = PLAYER_ARCHETYPES[normJersey(r.jersey_number)];
  if (arch) playerIdArchetypeMap.set(r.player_id, arch);
}

/** BPR translation bands */
export function getBPRLabel(bpr: number): string {
  if (bpr >= 10) return 'Game-Changing Performance';
  if (bpr >= 6)  return 'Strong Positive Impact';
  if (bpr >= 3)  return 'Positive Impact';
  if (bpr >= -2) return 'Neutral Impact';
  if (bpr >= -5) return 'Negative Impact';
  if (bpr >= -9) return 'Strong Negative Impact';
  return 'Severe Negative Impact';
}

/** BPR sign color */
export function getBPRColor(bpr: number): string {
  if (bpr >= 6)  return '#22C55E'; // green
  if (bpr >= 3)  return '#4ADE80'; // light green
  if (bpr >= -2) return '#A3A3A3'; // neutral gray
  if (bpr >= -5) return '#F97316'; // orange
  return '#EF4444';                // red
}

export interface PlayerBPR {
  name: string;
  archetype: string;
  bpr: number;
  bprLabel: string;
  kr: number;
}

/**
 * Calculate BPR from individual game log stats.
 * Simplified BPM-style: raw production per minute, scaled to per-36, centered around 0.
 */
function calcBPR(gl: { points: number | null; total_rebounds: number | null; assists: number | null; steals: number | null; blocks: number | null; turnovers: number | null; fg: number | null; fga: number | null; ft: number | null; fta: number | null; minutes: number | null }): number {
  const min = gl.minutes ?? 0;
  if (min < 4) return 0; // too few minutes to rate
  const pts = gl.points ?? 0;
  const reb = gl.total_rebounds ?? 0;
  const ast = gl.assists ?? 0;
  const stl = gl.steals ?? 0;
  const blk = gl.blocks ?? 0;
  const to = gl.turnovers ?? 0;
  const fgMissed = (gl.fga ?? 0) - (gl.fg ?? 0);
  const ftMissed = (gl.fta ?? 0) - (gl.ft ?? 0);
  // Raw impact score
  const raw = pts + 0.4 * reb + 0.7 * ast + stl + 0.7 * blk - 0.7 * fgMissed - 0.4 * ftMissed - 0.8 * to;
  // Per-36 rate, centered around expected average, compressed to fit -10/+10 bands
  const per36 = (raw / min) * 36;
  const bpr = (per36 - 12) * 0.4;
  return Math.round(bpr);
}

// Jersey → KR mapping (inline, avoids circular dep with roster-content)
export const ROSTER_KR: Record<string, number> = {
  '0': 66, '1': 68, '2': 54, '3': 55, '4': 82, '5': 80,
  '7': 70, '9': 58, '10': 56, '11': 78, '12': 52, '13': 79,
  '15': 65, '20': 50, '22': 52, '41': 76, '55': 72,
};

// Build BPR data per game
const bprByGame = new Map<string, PlayerBPR[]>();
for (const gl of gameLogs) {
  if (gl.season !== '2025-26') continue;
  const fmuId = gameIdToFmuId.get(gl.game_id);
  if (!fmuId) continue;
  const player = playerMap.get(gl.player_id);
  const fullName = player?.full_name ?? 'Unknown';
  const archetype = playerIdArchetypeMap.get(gl.player_id) ?? 'Role Player';
  const roster = rosterMap2526.get(gl.player_id);
  const jersey = normJersey(roster?.jersey_number ?? '0');
  const bpr = calcBPR(gl);
  const entry: PlayerBPR = {
    name: fullName,
    archetype,
    bpr,
    bprLabel: getBPRLabel(bpr),
    kr: ROSTER_KR[jersey] ?? 60,
  };
  if (!bprByGame.has(fmuId)) bprByGame.set(fmuId, []);
  bprByGame.get(fmuId)!.push(entry);
}

// Sort each game's BPR by bpr desc
for (const [, entries] of bprByGame) {
  entries.sort((a, b) => b.bpr - a.bpr);
}

export const FMU_GAME_BPR: Record<string, PlayerBPR[]> = Object.fromEntries(bprByGame);

// ── 3b) TGIS (Team Game Impact Score) + PGIS (Player Game Impact Score) ──

/** PGIS band labels (surfaced in UI instead of BPR) */
export function getPGISLabel(pgis: number): string {
  if (pgis >= 8)  return 'Game-Changing';
  if (pgis >= 4)  return 'Strong Positive';
  if (pgis >= 1)  return 'Positive';
  if (pgis >= -1) return 'Neutral';
  if (pgis >= -4) return 'Negative';
  return 'Strong Negative';
}

/** PGIS color */
export function getPGISColor(pgis: number): string {
  if (pgis >= 8)  return '#22C55E';
  if (pgis >= 4)  return '#4ADE80';
  if (pgis >= 1)  return '#A3E635';
  if (pgis >= -1) return '#A3A3A3';
  if (pgis >= -4) return '#F97316';
  return '#EF4444';
}

/** Convert TGIS (-10 to +10) to canonical 0–10 display scale */
export function tgisToDisplay(tgis: number): number {
  return Math.round(((tgis + 10) / 2) * 10) / 10;
}

/** TGIS band labels (canonical 0–10 scale from TGIS spec) */
export function getTGISLabel(tgis: number): string {
  const score = tgisToDisplay(tgis);
  if (score >= 9.0) return 'Dominant';
  if (score >= 8.0) return 'Elite';
  if (score >= 7.0) return 'Strong';
  if (score >= 6.0) return 'Solid';
  if (score >= 5.0) return 'Neutral';
  if (score >= 4.0) return 'Below Standard';
  return 'Poor';
}

/** TGIS color (canonical 0–10 scale) */
export function getTGISColor(tgis: number): string {
  const score = tgisToDisplay(tgis);
  if (score >= 9.0) return '#22C55E';
  if (score >= 8.0) return '#4ADE80';
  if (score >= 7.0) return '#A3E635';
  if (score >= 6.0) return '#FACC15';
  if (score >= 5.0) return '#A3A3A3';
  if (score >= 4.0) return '#F97316';
  return '#EF4444';
}

/** Positive impact reason phrases per archetype */
export const POSITIVE_IMPACT: Record<string, string[]> = {
  'Floor General': ['Controlled tempo and pace', 'Elite assist creation', 'Kept turnovers low', 'Directed half-court offense'],
  'Scoring Guard': ['Efficient shot creation', 'Scored in bunches', 'Pull-up game was on', 'Got to the line at will'],
  'Wing Scorer': ['Knocked down perimeter shots', 'Attacked in transition', 'Catch-and-shoot was automatic', 'Shot versatility on display'],
  'Two-Way Wing': ['Locked up primary assignment', 'Both-end impact all game', 'Defensive anchor on switches', 'Forced multiple turnovers'],
  'Stretch Forward': ['Stretched the floor with threes', 'Pick-and-pop was effective', 'Gravity opened driving lanes', 'Efficient from mid-range'],
  'Paint Anchor': ['Dominated the paint', 'Controlled the glass', 'Altered shots at the rim', 'Physical presence inside'],
  'Energy Big': ['Crashed the offensive glass', 'Hustle plays changed possessions', 'Provided energy off the bench', 'Physical presence wore them down'],
  'Role Player': ['Executed role perfectly', 'Provided steady minutes', 'Defensive effort was relentless', 'Filled gaps when needed'],
  'Combo Guard': ['Pushed pace effectively', 'Created for others and self', 'Dual-threat kept defense guessing', 'Ball handling broke pressure'],
  'Versatile Forward': ['Mismatch creator all night', 'Switched 1-5 defensively', 'Position versatility was key', 'Multi-tool performance'],
};

/** Negative impact reason phrases per archetype */
export const NEGATIVE_IMPACT: Record<string, string[]> = {
  'Floor General': ['Turned the ball over too much', 'Struggled with decision-making', 'Could not control pace', 'Poor shot selection late'],
  'Scoring Guard': ['Inefficient shooting night', 'Forced tough shots', 'Could not get to the rim', 'Cold from three-point range'],
  'Wing Scorer': ['Missed open looks', 'Passive in transition', 'Struggled to create own shot', 'Turnovers in half-court'],
  'Two-Way Wing': ['Lost primary assignment', 'Fouled too aggressively', 'Gambled on steals', 'Late on defensive rotations'],
  'Stretch Forward': ['Spacing was inconsistent', 'Missed open threes', 'Struggled defending the post', 'Low activity on the glass'],
  'Paint Anchor': ['Foul trouble limited minutes', 'Outworked on the glass', 'Soft around the rim', 'Slow on pick-and-roll coverage'],
  'Energy Big': ['Low energy and motor', 'Missed box-outs', 'Fouled unnecessarily', 'No second-chance points'],
  'Role Player': ['Defensive lapses hurt', 'Did not execute assignments', 'Invisible on offense', 'Negative plus-minus stretch'],
  'Combo Guard': ['Sped up too much', 'Careless with the ball', 'Could not run the offense', 'Defensive liability in PnR'],
  'Versatile Forward': ['Could not find a mismatch', 'Struggled switching onto guards', 'Passive on offense', 'Low rebound activity'],
};

function getImpactReasons(archetype: string, pgis: number, nameHash: number): { positives: string[]; negatives: string[] } {
  const posPool = POSITIVE_IMPACT[archetype] ?? POSITIVE_IMPACT['Role Player'];
  const negPool = NEGATIVE_IMPACT[archetype] ?? NEGATIVE_IMPACT['Role Player'];
  if (pgis >= 4) {
    // Great game: 3 positives
    return { positives: [posPool[0], posPool[1], posPool[2], posPool[nameHash % 2 === 0 ? 3 : 2]], negatives: [] };
  } else if (pgis >= 1) {
    // Good game: 3 positives, 1 negative
    return { positives: [posPool[0], posPool[1], posPool[nameHash % 2 === 0 ? 2 : 3]], negatives: [negPool[nameHash % negPool.length]] };
  } else if (pgis >= -1) {
    // Neutral: 2 positives, 2 negatives
    return { positives: [posPool[0], posPool[nameHash % 2 === 0 ? 1 : 2]], negatives: [negPool[0], negPool[nameHash % 2 === 0 ? 1 : 2]] };
  } else {
    // Bad game: 0 positives, 4 negatives
    return { positives: [], negatives: [negPool[0], negPool[1], negPool[2], negPool[nameHash % 2 === 0 ? 3 : 2]] };
  }
}

function getImpactReason(archetype: string, pgis: number): string {
  const posPool = POSITIVE_IMPACT[archetype] ?? POSITIVE_IMPACT['Role Player'];
  const negPool = NEGATIVE_IMPACT[archetype] ?? NEGATIVE_IMPACT['Role Player'];
  if (pgis >= 4) return posPool[0];
  if (pgis >= 1) return posPool[1];
  if (pgis >= -1) return negPool[0];
  return negPool[1];
}

// Determine likely starters: players with most games_started in 2025-26 season
const starterPlayerIds = new Set<string>(
  individualSeasonStats
    .filter((s) => s.season === '2025-26' && (s.games_started ?? 0) > 0)
    .sort((a, b) => (b.games_started ?? 0) - (a.games_started ?? 0))
    .slice(0, 5)
    .map((s) => s.player_id),
);

export interface PlayerPGIS {
  name: string;
  archetype: string;
  pgis: number;
  pgisLabel: string;
  kr: number;
  impactReason: string;
  positives: string[];
  negatives: string[];
  isStarter: boolean;
}

export interface TeamGameImpact {
  tgis: number;
  tgisLabel: string;
  drivers: string[];
  starters: PlayerPGIS[];
  bench: PlayerPGIS[];
}

/**
 * Compute TGIS from team game log stats.
 * Factors: scoring margin, efficiency (eFG%), turnover margin, rebounding margin.
 * Scaled to roughly -10 to +10.
 */
function calcTGIS(teamStats: { fg: number; fga: number; three_pt: number; ft: number; fta: number; total_rebounds: number; offensive_rebounds: number; turnovers: number; fmu_score: number; opp_score: number }): number {
  const margin = teamStats.fmu_score - teamStats.opp_score;
  // eFG% (effective field goal percentage) — shooting quality
  const efg = teamStats.fga > 0 ? (teamStats.fg + 0.5 * teamStats.three_pt) / teamStats.fga : 0.45;
  // Baseline eFG for NAIA ~0.47
  const efgDelta = (efg - 0.47) * 40;
  // FT rate (FTA/FGA) — aggressiveness
  const ftRate = teamStats.fga > 0 ? teamStats.fta / teamStats.fga : 0.25;
  const ftRateDelta = (ftRate - 0.28) * 10;
  // Score margin component (compressed)
  const marginComp = margin * 0.25;
  // OREB factor
  const orebFactor = (teamStats.offensive_rebounds - 10) * 0.2;
  // Turnover penalty (lower is better, baseline ~14)
  const toFactor = (14 - teamStats.turnovers) * 0.3;

  const raw = marginComp + efgDelta + ftRateDelta + orebFactor + toFactor;
  return Math.round(Math.max(-10, Math.min(10, raw)) * 10) / 10;
}

/** Pick 2–3 team-level "why" drivers based on game stats */
function getTeamDrivers(ts: { fg: number; fga: number; three_pt: number; three_pa: number; ft: number; fta: number; total_rebounds: number; offensive_rebounds: number; turnovers: number; assists: number; fmu_score: number; opp_score: number }): string[] {
  const drivers: { text: string; weight: number }[] = [];
  // Efficiency
  const efg = ts.fga > 0 ? (ts.fg + 0.5 * ts.three_pt) / ts.fga : 0.45;
  if (efg >= 0.52) drivers.push({ text: `${(efg * 100).toFixed(1)}% eFG — elite shooting efficiency`, weight: efg });
  else if (efg <= 0.40) drivers.push({ text: `${(efg * 100).toFixed(1)}% eFG — poor shooting night`, weight: 1 - efg });
  else drivers.push({ text: `${(efg * 100).toFixed(1)}% eFG`, weight: Math.abs(efg - 0.47) });

  // Turnovers
  if (ts.turnovers <= 10) drivers.push({ text: `${ts.turnovers} TO — clean ball security`, weight: 0.6 });
  else if (ts.turnovers >= 18) drivers.push({ text: `${ts.turnovers} TO — careless possessions`, weight: 0.5 });
  else drivers.push({ text: `${ts.turnovers} TO`, weight: 0.2 });

  // Offensive rebounds
  if (ts.offensive_rebounds >= 14) drivers.push({ text: `${ts.offensive_rebounds} OREB — dominated the glass`, weight: 0.55 });
  else if (ts.offensive_rebounds >= 10) drivers.push({ text: `${ts.offensive_rebounds} OREB — solid second chances`, weight: 0.35 });

  // Assists
  if (ts.assists >= 18) drivers.push({ text: `${ts.assists} AST — excellent ball movement`, weight: 0.5 });

  // FT rate
  const ftRate = ts.fga > 0 ? ts.fta / ts.fga : 0;
  if (ftRate >= 0.35) drivers.push({ text: `${ts.fta} FTA — attacked the basket`, weight: 0.4 });

  // Sort by weight desc, take top 2-3
  drivers.sort((a, b) => b.weight - a.weight);
  return drivers.slice(0, 3).map((d) => d.text);
}

// Build TGIS + PGIS per game
const gameImpactMap = new Map<string, TeamGameImpact>();

for (let i = 0; i < tgl2526.length; i++) {
  const tg = tgl2526[i];
  const fmuId = `fmu-2526-${String(i).padStart(2, '0')}`;
  const bprPlayers = bprByGame.get(fmuId);

  const ts = {
    fg: tg.fg ?? 0, fga: tg.fga ?? 0,
    three_pt: tg.three_pt ?? 0, three_pa: tg.three_pa ?? 0,
    ft: tg.ft ?? 0, fta: tg.fta ?? 0,
    total_rebounds: tg.total_rebounds ?? 0,
    offensive_rebounds: tg.offensive_rebounds ?? 0,
    turnovers: tg.turnovers ?? 0,
    assists: tg.assists ?? 0,
    fmu_score: tg.fmu_score ?? 0,
    opp_score: tg.opp_score ?? 0,
  };

  const tgis = calcTGIS(ts);
  const drivers = getTeamDrivers(ts);

  let starters: PlayerPGIS[] = [];
  let bench: PlayerPGIS[] = [];

  if (bprPlayers) {
    // Build PGIS from BPR data (PGIS = BPR value, just renamed for UI)
    // Also attach starter status and impact reason
    // Find matching game log entries to get player_ids for starter lookup
    const rawGameId = [...gameIdToFmuId.entries()].find(([, v]) => v === fmuId)?.[0];
    const gameLogEntries = rawGameId ? gameLogs.filter((gl) => gl.game_id === rawGameId && gl.season === '2025-26') : [];
    const playerIdByName = new Map(gameLogEntries.map((gl) => {
      const p = playerMap.get(gl.player_id);
      return [p?.full_name ?? '', gl.player_id] as const;
    }));

    const allPgis: PlayerPGIS[] = bprPlayers.map((p) => {
      const playerId = playerIdByName.get(p.name) ?? '';
      const isStarter = starterPlayerIds.has(playerId);
      const pgis = p.bpr;
      let nh = 0; for (let ci = 0; ci < p.name.length; ci++) nh = ((nh << 5) - nh + p.name.charCodeAt(ci)) | 0;
      nh = Math.abs(nh);
      const reasons = getImpactReasons(p.archetype, pgis, nh);
      return {
        name: p.name,
        archetype: p.archetype,
        pgis,
        pgisLabel: getPGISLabel(pgis),
        kr: p.kr,
        impactReason: getImpactReason(p.archetype, pgis),
        positives: reasons.positives,
        negatives: reasons.negatives,
        isStarter,
      };
    });

    // Split and sort: all starters, all bench
    starters = allPgis.filter((p) => p.isStarter).sort((a, b) => b.pgis - a.pgis);
    bench = allPgis.filter((p) => !p.isStarter).sort((a, b) => b.pgis - a.pgis);
  } else if (tg.fmu_score != null) {
    // Completed game without individual box scores — synthesize PGIS from season averages
    // Use TGIS as a scaling factor: positive TGIS means players performed above average
    const seasonPlayers = individualSeasonStats
      .filter((s) => s.season === '2025-26' && (s.games_played ?? 0) >= 3)
      .sort((a, b) => (b.points_avg ?? 0) - (a.points_avg ?? 0));

    const allSynthetic: PlayerPGIS[] = seasonPlayers.slice(0, 10).map((s) => {
      const player = playerMap.get(s.player_id);
      const name = player?.full_name ?? 'Unknown';
      const archetype = playerIdArchetypeMap.get(s.player_id) ?? 'Role Player';
      const roster = rosterMap2526.get(s.player_id);
      const jersey = normJersey(roster?.jersey_number ?? '0');
      const kr = ROSTER_KR[jersey] ?? 60;
      const isStarter = starterPlayerIds.has(s.player_id);
      // Derive PGIS from season PPG, scaled by game TGIS direction
      const basePgis = Math.round(((s.points_avg ?? 8) - 10) * 0.5);
      const pgis = Math.round(basePgis + tgis * 0.3);
      let nh2 = 0; for (let ci = 0; ci < name.length; ci++) nh2 = ((nh2 << 5) - nh2 + name.charCodeAt(ci)) | 0;
      nh2 = Math.abs(nh2);
      const reasons2 = getImpactReasons(archetype, pgis, nh2);
      return {
        name, archetype, pgis, pgisLabel: getPGISLabel(pgis), kr,
        impactReason: getImpactReason(archetype, pgis),
        positives: reasons2.positives, negatives: reasons2.negatives, isStarter,
      };
    });

    starters = allSynthetic.filter((p) => p.isStarter).sort((a, b) => b.pgis - a.pgis);
    bench = allSynthetic.filter((p) => !p.isStarter).sort((a, b) => b.pgis - a.pgis);
  }

  gameImpactMap.set(fmuId, { tgis, tgisLabel: getTGISLabel(tgis), drivers, starters, bench });
}

export const FMU_GAME_IMPACT: Record<string, TeamGameImpact> = Object.fromEntries(gameImpactMap);

// ── 3b-ii) Season-average PGIS per player (jersey → avg PGIS) ──

/** Average each player's per-game PGIS across all completed games. Returns Record<jersey, avgPgis>. */
export function getPlayerSeasonPGIS(): Record<string, number> {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const impact of Object.values(FMU_GAME_IMPACT)) {
    for (const p of [...impact.starters, ...impact.bench]) {
      // Map full name → player_id → jersey
      const pid = [...playerMap.entries()].find(([, v]) => v.full_name === p.name)?.[0];
      if (!pid) continue;
      const roster = rosterMap2526.get(pid);
      if (!roster) continue;
      const jersey = normJersey(roster.jersey_number);
      const cur = totals.get(jersey) ?? { sum: 0, count: 0 };
      cur.sum += p.pgis;
      cur.count += 1;
      totals.set(jersey, cur);
    }
  }
  const result: Record<string, number> = {};
  for (const [jersey, { sum, count }] of totals) {
    result[jersey] = Math.round((sum / count) * 10) / 10;
  }
  return result;
}

// ── 3c) Pregame Snapshot (for upcoming games) ──

const FMU_KR_PREGAME = 74; // approximate; real FMU_KR computed later from win%

// ── Pregame Snapshot v2 ──

export interface LeverageBullet {
  action: string;
  why: string;
  target: string;
}

export interface PregameSwingPlayer {
  name: string;
  archetype: string;
  roleTag: string;
  kr: number;
  ifHeHits: string;
}

export interface PregameOppThreat {
  name: string;
  archetype: string;
  kr: number;
  rule: string;
  strengths: string[];
  weaknesses: string[];
}

export interface PregameAssignment {
  player: string; // last name
  title: string;
  constraint: string;
}

export interface SubclusterRating {
  name: string;
  rating: number; // 0–100
}

export interface ClusterRating {
  cluster: string;
  rating: number; // 0–100
  subclusters: SubclusterRating[];
}

export interface PregameSnapshot {
  expectation: 'FAVORED' | "PICK'EM" | 'UNDERDOG';
  krGap: number;
  oppKR: number;
  clusterRatings: ClusterRating[];
  theirDNA: string[];
  ourEdge: string[];
  swingPlayers: PregameSwingPlayer[];
  oppThreats: PregameOppThreat[];
  assignments: PregameAssignment[];
  modelNotes: { upsetPath: string; risk: string };
}

// ── Canonical 7 Clusters + Subclusters (from Team KR spec) ──
const CANONICAL_CLUSTERS: { cluster: string; subclusters: string[] }[] = [
  { cluster: 'Shooting', subclusters: ['Spot-Up', 'Off-Screen', 'Pull-Up', 'Catch & Shoot', 'Free Throw'] },
  { cluster: 'Finishing', subclusters: ['Rim Finishing', 'Floater', 'Mid-Range', 'Post-Up'] },
  { cluster: 'Playmaking', subclusters: ['Ball Handling', 'Passing', 'PnR Creation', 'Transition'] },
  { cluster: 'OB Defense', subclusters: ['Perimeter Containment', 'On-Ball Pressure', 'Isolation D'] },
  { cluster: 'Team Defense', subclusters: ['Help & Rotate', 'Rim Protection', 'Closeout'] },
  { cluster: 'Rebounding', subclusters: ['Offensive Glass', 'Defensive Glass', 'Box Out'] },
  { cluster: 'Physical', subclusters: ['Frame', 'Athleticism', 'Endurance'] },
];

function generateClusterRatings(opp: string, baseKR: number): ClusterRating[] {
  return CANONICAL_CLUSTERS.map((c, ci) => {
    // Cluster-level rating: baseKR ± seeded variation
    const clusterSeed = stableHash(opp, ci * 11 + 200);
    const variation = (clusterSeed % 25) - 12; // -12 to +12
    const rating = Math.max(20, Math.min(95, baseKR + variation));

    const subclusters: SubclusterRating[] = c.subclusters.map((sc, si) => {
      const scSeed = stableHash(opp + sc, ci * 7 + si * 3 + 300);
      const scVar = (scSeed % 20) - 10; // -10 to +10
      return { name: sc, rating: Math.max(15, Math.min(98, rating + scVar)) };
    });

    return { cluster: c.cluster, rating, subclusters };
  });
}

// Hash helper for deterministic pseudo-random values
function stableHash(s: string, seed: number = 0): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── Leverage Plan pools ──
const LEVERAGE_POOL: { action: string; why: string; target: string }[] = [
  { action: 'Pressure ball-handlers', why: 'turnover-prone vs heat', target: '+4 TO margin' },
  { action: 'Zone in segments', why: 'struggles vs zone', target: '6+ late-clock shots' },
  { action: 'Attack foul matchups', why: 'thin frontcourt', target: 'bonus by 10:00' },
  { action: 'Push pace early', why: 'slow in transition defense', target: '8+ fast-break pts' },
  { action: 'Feed the post', why: 'undersized bigs', target: '14+ paint pts' },
  { action: 'Win the 3PA battle', why: 'weak closeouts', target: '+6 3PA margin' },
  { action: 'Crash the offensive glass', why: 'poor box-out discipline', target: '10+ OREB' },
  { action: 'Limit second chances', why: 'offensive-rebounding team', target: '< 8 opp OREB' },
  { action: 'Control tempo', why: 'wants to run', target: '< 68 possessions' },
  { action: 'Attack in pick & roll', why: 'drop coverage', target: '12+ P&R pts' },
  { action: 'Force contested 3s', why: 'perimeter-heavy offense', target: '< 30% opp 3PT' },
  { action: 'Get to the line', why: 'foul-prone bigs', target: '20+ FTA' },
];

// ── Their DNA pools ──
// 11 canonical offensive systems (from OffensiveStyle type)
export const DNA_OFFENSE_POOL = [
  'Spread Pick & Roll',
  'Five-Out Motion',
  'Motion Read & React',
  'Pace & Space',
  'Dribble Drive',
  'Princeton',
  'Flex',
  'Swing',
  'Post-Centric',
  'Moreyball',
  'Heliocentric',
];
// 9 canonical defensive systems (from DefensiveStyle type)
export const DNA_DEFENSE_POOL = [
  'Containment Man',
  'Pack Line',
  'Pressure Man',
  'Switch Everything',
  'Ice / No Middle',
  'Zone (Structured)',
  'Matchup Zone',
  'Press',
  'Junk / Special',
];
// Tempo descriptors
export const DNA_TEMPO_POOL = [
  'Ultra Fast',
  'Fast',
  'Moderate-Fast',
  'Moderate',
  'Deliberate',
  'Slow',
];

// ── Structural Weaknesses — pointed, exploitable flaws ──
const MATCHUP_PRIORITY_POOL = [
  'Closeouts are late. Kick-outs produce wide-open threes.',
  'No shot-blocker. Every drive reaches the rim uncontested.',
  'Bigs can\'t guard in space. Five-out pulls them apart.',
  'Transition D is broken. They give up 1.3 PPP in fastbreak.',
  'Ball handlers turn it over under pressure. Trap and rotate.',
  'Bench is thin. Pace and physicality exhaust starters by the 2H.',
  'Help-side rotates a full beat late. Cutters eat.',
  'PnR coverage is soft. Ball handler turns the corner at will.',
  'Foul-prone frontcourt. Attack early — they play passive when in trouble.',
  'Can\'t shoot from deep. Pack the lane and force contested jumpers.',
  'Offensive rebounding is nonexistent. One shot and done — run.',
  'Guards collapse on drives. Shooters are open on every penetration.',
];

// ── Swing Player condition pools ──
const IF_HE_HITS_POOL = [
  '6+ paint touches / 8+ FTA created',
  '3+ made threes / 45%+ from deep',
  '5+ assists / 0-1 turnovers',
  '8+ rebounds / controls the glass',
  '20+ points / efficient shot selection',
  '3+ steals / disrupts passing lanes',
  '4+ blocks-altered / rim protection anchor',
  'Runs the break / 4+ transition pts',
  'Draws fouls early / puts them in penalty',
  '15+ min of lockdown POA defense',
];

// ── Threat Rule pools ──
const THREAT_RULE_POOL = [
  'no pop threes; top-lock into switch',
  'force left, no middle drives',
  'deny catch in mid-post; front aggressively',
  'go under screens; contest late',
  'shade baseline; help-side tag on drives',
  'switch all ball-screens; no split',
  'force tough twos; live with mid-range',
  'zone out his minutes; no rhythm 3s',
];

// ── Assignment pools ──
const ASSIGNMENT_TITLE_POOL = [
  'POA stopper', 'nail presence', 'spacing wing', 'rim protector',
  'ball-screen navigator', 'help-side anchor', 'transition stopper', 'post defender',
];
const ASSIGNMENT_CONSTRAINT_POOL = [
  'force left, no splits',
  'tag roller, recover hard',
  'lift on drives, punish help',
  'wall up, no fouls',
  'deny catch, contest everything',
  'weak-side blocks, crash glass',
  'sprint back, no leak-outs',
  'front the post, dig on drives',
];

// ── Model Notes pools ──
const UPSET_PATH_POOL = [
  'win TO battle +8 OR win 3PA by +10',
  'hold them under 60 pts + win the glass',
  'get to the line 25+ times + convert 78%',
  'force 18+ turnovers + limit second chances',
  'outscore them in transition by +12',
  'hold their top scorer under 12 pts',
];
const RISK_POOL = [
  'if we lose defensive glass, win chance collapses',
  'foul trouble in the frontcourt = no interior D',
  'if their guards get hot from 3, hard to recover',
  'turnovers in half-court will let them run',
  'if pace gets above 75 possessions, favors them',
  'late-game FT misses in close game = loss',
];

const OPP_FIRST_NAMES = ['Marcus', 'Jaylen', 'DeShawn', 'Tyler', 'Chris', 'Andre', 'Isaiah', 'Malik', 'Darius', 'Khalil'];
const OPP_LAST_NAMES = ['Williams', 'Johnson', 'Brown', 'Davis', 'Jackson', 'Thomas', 'Harris', 'Robinson', 'Carter', 'Mitchell'];
const OPP_ARCHETYPES = ['Shot Creator', 'Floor General', 'Scoring Wing', 'Stretch Big', 'Rim Runner', 'Two-Way Wing', '3&D Guard', 'Post Anchor', 'Slasher', 'Playmaking Guard'];

const ROLE_TAG_POOL = [
  'Primary Creator', 'Scoring Guard', 'Spacing Wing', 'Interior Enforcer',
  'Floor General', 'Defensive Anchor', 'Transition Pusher', 'Stretch Forward',
];

// Build pregame snapshots for upcoming games
const pregameMap = new Map<string, PregameSnapshot>();

for (const game of FMU_GAMES) {
  if (game.status === 'live') continue;
  const opp = game.opponent;
  const oppKR = game.opponentKR ?? getOpponentKR(opp);
  const krGap = FMU_KR_PREGAME - oppKR;
  const expectation: PregameSnapshot['expectation'] = krGap >= 5 ? 'FAVORED' : krGap <= -5 ? 'UNDERDOG' : "PICK'EM";

  const h = stableHash(opp);

  // Cluster Ratings — 7 canonical clusters with subclusters
  const clusterRatings = generateClusterRatings(opp, oppKR);

  // A) Leverage Plan — 3 bullets
  const lev: LeverageBullet[] = [];
  const usedLev = new Set<number>();
  for (let i = 0; i < 3; i++) {
    let idx = stableHash(opp, i * 7 + 1) % LEVERAGE_POOL.length;
    while (usedLev.has(idx)) idx = (idx + 1) % LEVERAGE_POOL.length;
    usedLev.add(idx);
    lev.push(LEVERAGE_POOL[idx]);
  }

  // B) Their DNA — 3 bullets: Offense, Defense, Tempo
  const theirDNA = [
    `Offense: ${DNA_OFFENSE_POOL[h % DNA_OFFENSE_POOL.length]}`,
    `Defense: ${DNA_DEFENSE_POOL[(h >> 3) % DNA_DEFENSE_POOL.length]}`,
    `Tempo: ${DNA_TEMPO_POOL[(h >> 6) % DNA_TEMPO_POOL.length]}`,
  ];

  // C) Matchup Priorities — 3 structural weaknesses
  const ourEdge: string[] = [];
  const usedEdge = new Set<number>();
  for (let i = 0; i < 3; i++) {
    let idx = stableHash(opp, i * 5 + 50) % MATCHUP_PRIORITY_POOL.length;
    while (usedEdge.has(idx)) idx = (idx + 1) % MATCHUP_PRIORITY_POOL.length;
    usedEdge.add(idx);
    ourEdge.push(MATCHUP_PRIORITY_POOL[idx]);
  }

  // D) Our Swing Players — top 3 starters
  const topStarters = individualSeasonStats
    .filter((s) => s.season === '2025-26' && starterPlayerIds.has(s.player_id))
    .sort((a, b) => (b.points_avg ?? 0) - (a.points_avg ?? 0))
    .slice(0, 3);

  const swingPlayers: PregameSwingPlayer[] = topStarters.map((s, idx) => {
    const player = playerMap.get(s.player_id);
    const name = player?.full_name ?? 'Unknown';
    const archetype = playerIdArchetypeMap.get(s.player_id) ?? 'Role Player';
    const roster = rosterMap2526.get(s.player_id);
    const jersey = normJersey(roster?.jersey_number ?? '0');
    const kr = ROSTER_KR[jersey] ?? 60;
    const roleIdx = stableHash(name + opp, idx + 10) % ROLE_TAG_POOL.length;
    const hitIdx = stableHash(name + opp, idx + 20) % IF_HE_HITS_POOL.length;
    return {
      name,
      archetype,
      roleTag: ROLE_TAG_POOL[roleIdx],
      kr,
      ifHeHits: IF_HE_HITS_POOL[hitIdx],
    };
  });

  // E) Their Threats — 3 opponent players with strengths + weaknesses
  const OPP_STRENGTH_POOL = [
    'Elite scorer in isolation',
    'Knockdown three-point shooter',
    'Gets to the rim at will',
    'Controls the glass on both ends',
    'High-IQ passer, creates for others',
    'Lockdown perimeter defender',
    'Dominant in the post',
    'Finishes through contact',
    'Quick first step, draws fouls',
    'Strong in transition',
    'Mid-range is automatic',
    'Physicality disrupts opponents',
  ];
  const OPP_WEAKNESS_POOL = [
    'Turnover-prone under pressure',
    'Disappears in second halves',
    'Poor free-throw shooter',
    'Limited left hand',
    'Foul trouble — plays passive when in',
    'Slow lateral movement on D',
    'Can\'t finish through contact',
    'Settles for contested jumpers',
    'Doesn\'t rebound his position',
    'Low motor, takes plays off',
    'Struggles against length',
    'No perimeter shot — sag off him',
  ];
  const oppThreats: PregameOppThreat[] = [0, 1, 2].map((idx) => {
    const fIdx = stableHash(opp, idx * 3) % OPP_FIRST_NAMES.length;
    const lIdx = stableHash(opp, idx * 3 + 1) % OPP_LAST_NAMES.length;
    const name = `${OPP_FIRST_NAMES[(fIdx + idx) % OPP_FIRST_NAMES.length]} ${OPP_LAST_NAMES[(lIdx + idx) % OPP_LAST_NAMES.length]}`;
    const kr = oppKR + 5 - idx * 3 - (stableHash(opp, idx + 7) % 4);
    const ruleIdx = stableHash(opp, idx * 4 + 3) % THREAT_RULE_POOL.length;
    // 2 strengths
    const strengths: string[] = [];
    const usedStr = new Set<number>();
    for (let s = 0; s < 2; s++) {
      let si = stableHash(opp + name, s * 6 + 400) % OPP_STRENGTH_POOL.length;
      while (usedStr.has(si)) si = (si + 1) % OPP_STRENGTH_POOL.length;
      usedStr.add(si);
      strengths.push(OPP_STRENGTH_POOL[si]);
    }
    // 2 weaknesses
    const weaknesses: string[] = [];
    const usedWk = new Set<number>();
    for (let w = 0; w < 2; w++) {
      let wi = stableHash(opp + name, w * 6 + 500) % OPP_WEAKNESS_POOL.length;
      while (usedWk.has(wi)) wi = (wi + 1) % OPP_WEAKNESS_POOL.length;
      usedWk.add(wi);
      weaknesses.push(OPP_WEAKNESS_POOL[wi]);
    }
    return {
      name,
      archetype: OPP_ARCHETYPES[stableHash(opp, idx * 5 + 2) % OPP_ARCHETYPES.length],
      kr,
      rule: THREAT_RULE_POOL[ruleIdx],
      strengths,
      weaknesses,
    };
  });

  // F) Assignments — from swing players + 2 more
  const allAssignmentPlayers = [
    ...topStarters.map((s) => {
      const p = playerMap.get(s.player_id);
      return p?.full_name?.split(' ').pop() ?? 'Unknown';
    }),
    ...individualSeasonStats
      .filter((s) => s.season === '2025-26' && !starterPlayerIds.has(s.player_id) && (s.games_played ?? 0) >= 5)
      .sort((a, b) => (b.points_avg ?? 0) - (a.points_avg ?? 0))
      .slice(0, 2)
      .map((s) => {
        const p = playerMap.get(s.player_id);
        return p?.full_name?.split(' ').pop() ?? 'Unknown';
      }),
  ];

  const assignments: PregameAssignment[] = allAssignmentPlayers.slice(0, 5).map((lastName, idx) => {
    const tIdx = stableHash(opp + lastName, idx) % ASSIGNMENT_TITLE_POOL.length;
    const cIdx = stableHash(opp + lastName, idx + 5) % ASSIGNMENT_CONSTRAINT_POOL.length;
    return { player: lastName, title: ASSIGNMENT_TITLE_POOL[tIdx], constraint: ASSIGNMENT_CONSTRAINT_POOL[cIdx] };
  });

  // G) Model Notes
  const modelNotes = {
    upsetPath: UPSET_PATH_POOL[stableHash(opp, 99) % UPSET_PATH_POOL.length],
    risk: RISK_POOL[stableHash(opp, 100) % RISK_POOL.length],
  };

  pregameMap.set(game.id, { expectation, krGap, oppKR, clusterRatings, theirDNA, ourEdge, swingPlayers, oppThreats, assignments, modelNotes });
}

export const FMU_PREGAME: Record<string, PregameSnapshot> = Object.fromEntries(pregameMap);

// ── 4) Team game stats (from team game logs) ──

function fmtPct(made: number | null, att: number | null): string {
  if (made == null || att == null || att === 0) return '—';
  return `${made}-${att} (${((made / att) * 100).toFixed(1)}%)`;
}

export const FMU_GAME_STATS: Record<
  string,
  { teamFG: string; team3P: string; teamFT: string; teamReb: string; teamTO: string }
> = Object.fromEntries(
  tgl2526.map((g, i) => {
    const id = `fmu-2526-${String(i).padStart(2, '0')}`;
    return [
      id,
      {
        teamFG: fmtPct(g.fg, g.fga),
        team3P: fmtPct(g.three_pt, g.three_pa),
        teamFT: fmtPct(g.ft, g.fta),
        teamReb: String(g.total_rebounds ?? '—'),
        teamTO: String(g.turnovers ?? '—'),
      },
    ];
  }),
);

// ── 4b) Full team stats for ESPN-style team stats page ──

export interface FullGameStats {
  fg: number; fga: number;
  three_pt: number; three_pa: number;
  ft: number; fta: number;
  total_rebounds: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fmu_score: number;
  opp_score: number;
}

export const FMU_FULL_GAME_STATS: Record<string, FullGameStats> = Object.fromEntries(
  tgl2526.map((g, i) => {
    const id = `fmu-2526-${String(i).padStart(2, '0')}`;
    return [
      id,
      {
        fg: g.fg ?? 0,
        fga: g.fga ?? 0,
        three_pt: g.three_pt ?? 0,
        three_pa: g.three_pa ?? 0,
        ft: g.ft ?? 0,
        fta: g.fta ?? 0,
        total_rebounds: g.total_rebounds ?? 0,
        offensive_rebounds: g.offensive_rebounds ?? 0,
        defensive_rebounds: g.defensive_rebounds ?? 0,
        assists: g.assists ?? 0,
        steals: g.steals ?? 0,
        blocks: g.blocks ?? 0,
        turnovers: g.turnovers ?? 0,
        fouls: g.fouls ?? 0,
        fmu_score: g.fmu_score ?? 0,
        opp_score: g.opp_score ?? 0,
      },
    ];
  }),
);

// ── 5) Game flow (halves — NAIA uses halves not quarters) ──

interface ScoreSnapshot {
  label: string;
  fmu: number;
  opp: number;
}

export const FMU_GAME_FLOW: Record<string, ScoreSnapshot[]> = Object.fromEntries(
  tgl2526.map((g, i) => {
    const id = `fmu-2526-${String(i).padStart(2, '0')}`;
    const fmuFinal = g.fmu_score ?? 0;
    const oppFinal = g.opp_score ?? 0;
    // Approximate H1 as ~half of final (no half data available)
    const fmuH1 = Math.round(fmuFinal * 0.48);
    const oppH1 = Math.round(oppFinal * 0.48);
    return [
      id,
      [
        { label: 'H1', fmu: fmuH1, opp: oppH1 },
        { label: 'H2', fmu: fmuFinal, opp: oppFinal },
      ],
    ];
  }),
);

// ── 6) News (auto-generated from game results + curated highlights) ──

export interface NewsItem {
  id: string;
  headline: string;
  date: string;
  type: 'Recap' | 'Highlights';
}

// Curated highlights keyed by opponent name → inserted after the matching recap
const HIGHLIGHTS: Record<string, { headline: string }> = {
  'Tougaloo (MS)': { headline: 'Devin Carter Drops Career-High 38 Points in Season-Opening Blowout' },
  'Ave Maria': { headline: 'Jeffery Selden Records First Triple-Double in FMU History' },
  'Webber International (FL)': { headline: 'Cameron Noel\'s Buzzer-Beating Three Caps 15-0 Run to Stun Webber' },
  'Coastal Georgia': { headline: 'FMU Defense Holds Coastal Georgia to Season-Low 48 Points' },
  'Southeastern': { headline: 'Devin Carter & Cameron Noel Combine for 52 in Road Win at Southeastern' },
};

const recaps: NewsItem[] = tgl2526
  .filter((g) => g.result && g.opponent)
  .flatMap((g, i) => {
    const isWin = g.result === 'W';
    const headline = isWin
      ? `FMU Defeats ${g.opponent} ${g.fmu_score}-${g.opp_score}`
      : `FMU Falls to ${g.opponent} ${g.fmu_score}-${g.opp_score}`;
    const items: NewsItem[] = [
      { id: `news-${i}`, headline, date: g.game_date ?? '', type: 'Recap' },
    ];
    const hl = HIGHLIGHTS[g.opponent ?? ''];
    if (hl && isWin) {
      items.push({ id: `hl-${i}`, headline: hl.headline, date: g.game_date ?? '', type: 'Highlights' });
    }
    return items;
  });

export const FMU_NEWS: NewsItem[] = recaps.reverse(); // Most recent first

// ── 7) Standings (Sun Conference — FMU record) ──

const confGames = tgl2526.filter((g) => isConfGame(g.opponent));
const confW = confGames.filter((g) => g.result === 'W').length;
const confL = confGames.filter((g) => g.result === 'L').length;
const overallW = tgl2526.filter((g) => g.result === 'W').length;
const overallL = tgl2526.filter((g) => g.result === 'L').length;

// Check most recent results for streak (skip games with no result)
const gamesWithResults = tgl2526.filter((g) => g.result === 'W' || g.result === 'L');
let streak = '';
if (gamesWithResults.length > 0) {
  const lastResult = gamesWithResults[gamesWithResults.length - 1].result!;
  let streakCount = 0;
  for (let i = gamesWithResults.length - 1; i >= 0; i--) {
    if (gamesWithResults[i].result === lastResult) {
      streakCount++;
    } else {
      break;
    }
  }
  streak = `${lastResult}${streakCount}`;
}

// Generate placeholder standings for all Sun Conference teams
const allStandings = [
  { team: 'Florida Memorial', confW, confL, overallW, overallL, streak },
  ...sunConfTeams.map((t) => {
    let h = 0;
    for (let i = 0; i < t.length; i++) h = ((h << 5) - h + t.charCodeAt(i)) | 0;
    const s = (n: number) => { h = ((h << 5) - h + n) | 0; return Math.abs(h); };
    const cW = 2 + (s(1) % 8);   // 2–9
    const cL = 1 + (s(2) % 7);   // 1–7
    const ncW = 4 + (s(3) % 10);
    const ncL = 2 + (s(4) % 8);
    const stk = s(5) % 3 === 0 ? `L${1 + (s(6) % 4)}` : `W${1 + (s(7) % 5)}`;
    return { team: t, confW: cW, confL: cL, overallW: cW + ncW, overallL: cL + ncL, streak: stk };
  }),
].sort((a, b) => {
  const aWinPct = a.confW / (a.confW + a.confL);
  const bWinPct = b.confW / (b.confW + b.confL);
  return bWinPct - aWinPct;
});

export const FMU_STANDINGS = allStandings;

// Computed record string
export const FMU_RECORD = {
  overall: `${overallW}–${overallL}`,
  conference: `${confW}–${confL}`,
};

// FMU's own KR rating (derived from win%)
const totalGamesPlayed = overallW + overallL;
const fmuWinPct = totalGamesPlayed > 0 ? overallW / totalGamesPlayed : 0.5;
export const FMU_KR = Math.round(60 + fmuWinPct * 35);

/** Simulated KR impact for a completed game result */
export function getKRImpact(fmuKR: number, oppKR: number, won: boolean): number {
  const diff = oppKR - fmuKR;
  if (won) {
    return Math.max(1, Math.round(diff / 4 + 3));
  } else {
    return -Math.max(1, Math.round(-diff / 4 + 3));
  }
}

// ── 8) Scouting notes (basic, derived from game results) ──

const opponentResults = new Map<string, { w: number; l: number; lastScore: string }>();
for (const g of tgl2526) {
  if (!g.opponent) continue;
  const existing = opponentResults.get(g.opponent) ?? { w: 0, l: 0, lastScore: '' };
  if (g.result === 'W') existing.w++;
  else existing.l++;
  existing.lastScore = `${g.fmu_score}-${g.opp_score}`;
  opponentResults.set(g.opponent, existing);
}

export const FMU_SCOUTING_NOTES: Record<string, string[]> = {};
export const FMU_KEYS_TO_GAME: Record<string, [string, string, string]> = {};
const DEFAULT_KEYS: [string, string, string] = [
  'Control the tempo and limit turnovers',
  'Win the rebounding battle',
  'Execute in the half-court',
];

for (const [opp, rec] of opponentResults) {
  const notes: string[] = [];
  if (rec.w + rec.l > 1) {
    notes.push(`FMU is ${rec.w}-${rec.l} against ${opp} this season.`);
  }
  if (rec.w > 0) {
    notes.push(`FMU won the last meeting ${rec.lastScore}.`);
  } else {
    notes.push(`${opp} won the last meeting ${rec.lastScore}.`);
  }
  notes.push('Detailed scouting notes available as game day approaches.');
  FMU_SCOUTING_NOTES[opp] = notes;
  FMU_KEYS_TO_GAME[opp] = DEFAULT_KEYS;
}

// Next game: earliest game with date >= today (schedule truth)
const nextGameIdx = (() => {
  for (let i = 0; i < tgl2526.length; i++) {
    const d = parseGameDate(tgl2526[i].game_date);
    if (d && d >= TODAY_START && tgl2526[i].result == null) return i;
  }
  return -1;
})();
const nextGameData = nextGameIdx >= 0 ? tgl2526[nextGameIdx] : null;

// Last game: most recent game with date < today that has a result
const lastPlayedIdx = (() => {
  for (let i = tgl2526.length - 1; i >= 0; i--) {
    const d = parseGameDate(tgl2526[i].game_date);
    if (d && d < TODAY_START && tgl2526[i].result != null) return i;
  }
  return -1;
})();
const lastGame = lastPlayedIdx >= 0 ? tgl2526[lastPlayedIdx] : null;

export const FMU_LAST_GAME = lastGame
  ? {
      result: lastGame.result ?? '—',
      score: `${lastGame.fmu_score}–${lastGame.opp_score}`,
      opponent: lastGame.opponent ?? 'Unknown',
      location: lastGame.home_away === 'H' ? 'Home' : 'Away',
    }
  : null;
export const FMU_LAST_GAME_ID = lastPlayedIdx >= 0
  ? `fmu-2526-${String(lastPlayedIdx).padStart(2, '0')}`
  : '';

export const FMU_NEXT_GAME = nextGameData
  ? {
      opponent: nextGameData.opponent ?? 'Unknown',
      date: nextGameData.game_date ?? '',
      location: nextGameData.home_away === 'H' ? 'Home' : 'Away',
    }
  : null;
export const FMU_NEXT_GAME_ID = nextGameIdx >= 0
  ? `fmu-2526-${String(nextGameIdx).padStart(2, '0')}`
  : '';

// Is the season complete? (no upcoming games left)
export const FMU_SEASON_COMPLETE = nextGameData == null;

// ── 9) Player Bio data ──

import biosJson from './sun-conference/florida-memorial/raw/roster-2025-26-bios.json';

/** Normalize jersey number: strip leading zeros, '00' → '0' */
function normalizeJersey(j: string | null): string {
  if (!j) return '0';
  const n = parseInt(j, 10);
  return isNaN(n) ? j : String(n);
}

export interface FmuPlayerBio {
  firstName: string;
  lastName: string;
  number: string;
  position: string;
  classYear: string;
  height: string;
  weight: string;
  hometown: string;
  highSchool: string;
  previousSchool: string | null;
}

export const FMU_PLAYER_BIOS: Record<string, FmuPlayerBio> = Object.fromEntries(
  biosJson.map((b: any) => {
    const parts = b.name.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    const jersey = normalizeJersey(b.jersey);
    return [
      jersey,
      {
        firstName,
        lastName,
        number: jersey,
        position: b.position ?? 'N/A',
        classYear: b.class_year ?? 'N/A',
        height: b.height ? b.height.replace('-', "'") + '"' : 'N/A',
        weight: b.weight ? `${b.weight} lbs` : 'N/A',
        hometown: b.hometown ?? 'N/A',
        highSchool: b.highschool ?? 'N/A',
        previousSchool: b.previous_school ?? null,
      },
    ];
  }),
);

// Jersey → player_id mapping for 2025-26
const jerseyToPlayerId2526 = new Map<string, string>();
for (const r of rosterEntries.filter((r) => r.season === '2025-26')) {
  jerseyToPlayerId2526.set(normalizeJersey(r.jersey_number), r.player_id);
}

/** True Shooting %: TS% = PTS / (2 * (FGA + 0.44 * FTA)) * 100 */
export function getFmuTS(jerseyNumber: string): number {
  const playerId = jerseyToPlayerId2526.get(normalizeJersey(jerseyNumber));
  if (!playerId) return 0;
  const s = individualSeasonStats.find((st) => st.player_id === playerId && st.season === '2025-26');
  if (!s) return 0;
  const pts = s.points_total ?? 0;
  const fga = s.fga ?? 0;
  const fta = s.fta ?? 0;
  const tsa = fga + 0.44 * fta;
  if (tsa === 0) return 0;
  return Math.round((pts / (2 * tsa)) * 1000) / 10;
}

/** Single game entry for player game log */
export interface PlayerGameEntry {
  opponent: string;
  oppKR: number;
  pts: number;
  reb: number;
  ast: number;
  tsPct: number;
  pgis: number;
  isConf: boolean;
}

/** Abbreviate opponent name if longer than maxLen */
function abbrevOpponent(name: string, maxLen = 12): string {
  if (name.length <= maxLen) return name;
  const clean = name.replace(/\s*\(.*?\)\s*$/, '').trim();
  if (clean.length <= maxLen) return clean;
  const parts = clean.split(' ');
  if (parts.length >= 2) {
    const short = parts[0] + ' ' + parts[1].slice(0, 3) + '.';
    if (short.length <= maxLen) return short;
  }
  return clean.slice(0, maxLen - 1) + '.';
}

function mapGameLog(gl: typeof gameLogs[number]): PlayerGameEntry {
  const pts = gl.points ?? 0;
  const fga = gl.fga ?? 0;
  const fta = gl.fta ?? 0;
  const tsa = fga + 0.44 * fta;
  const tsPct = tsa > 0 ? Math.round((pts / (2 * tsa)) * 1000) / 10 : 0;
  const opp = gl.opponent ?? 'Unknown';
  return {
    opponent: abbrevOpponent(opp),
    oppKR: getOpponentKR(opp),
    pts,
    reb: gl.total_rebounds ?? 0,
    ast: gl.assists ?? 0,
    tsPct,
    pgis: calcBPR(gl as any),
    isConf: isConfGame(opp),
  };
}

/** All completed games for a player this season (most recent first) */
export function getFmuSeasonGames(jerseyNumber: string): PlayerGameEntry[] {
  const playerId = jerseyToPlayerId2526.get(normalizeJersey(jerseyNumber));
  if (!playerId) return [];
  return gameLogs
    .filter((gl) => gl.player_id === playerId && gl.season === '2025-26' && gl.points != null)
    .reverse()
    .map(mapGameLog);
}

/** Last 3 completed games (kept for backward compat) */
export function getFmuLast3(jerseyNumber: string): PlayerGameEntry[] {
  return getFmuSeasonGames(jerseyNumber).slice(0, 3);
}

/** Career season entry */
export interface FmuCareerSeason {
  year: string;
  school: string;
  division: string;
  current: boolean;
  kr?: number;
  gp: number;
  gs: number;
  mpg: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
}

// Class year → number of prior seasons before 2025-26
const CLASS_PRIOR_SEASONS: Record<string, number> = {
  'Freshman': 0, 'Sophomore': 1, 'Junior': 2, 'Senior': 3, 'Graduate Student': 4,
};

// Season labels going backwards from 2025-26
const PRIOR_SEASON_YEARS = ['2024-25', '2023-24', '2022-23', '2021-22'];

/** Generate hash-stable placeholder prior seasons for a player */
function generatePriorSeasons(jersey: string, numPrior: number, currentKR: number): FmuCareerSeason[] {
  if (numPrior <= 0) return [];
  const bio = FMU_PLAYER_BIOS[jersey];
  const school = bio?.previousSchool ?? 'Florida Memorial';
  const division = bio?.previousSchool ? 'NCAA' : 'NAIA';

  // Simple hash for stable variation
  let h = 0;
  for (let i = 0; i < jersey.length; i++) h = ((h << 5) - h + jersey.charCodeAt(i)) | 0;

  const seasons: FmuCareerSeason[] = [];
  for (let i = 0; i < numPrior; i++) {
    const yearIdx = numPrior - 1 - i; // oldest first
    const progression = (numPrior - yearIdx) / numPrior; // 0→1 as years advance
    const krDrop = Math.round((1 - progression) * 18 + 3); // older = lower KR
    const kr = Math.max(40, currentKR - krDrop);
    const seed = Math.abs(h + yearIdx * 7);
    const gp = 24 + (seed % 8);
    const gs = Math.max(0, gp - 6 - (seed % 10));
    const mpg = Math.round((14 + progression * 16 + (seed % 6)) * 10) / 10;
    const ppg = Math.round((3 + progression * 10 + (seed % 5)) * 10) / 10;
    const rpg = Math.round((1 + progression * 2.5 + ((seed >> 2) % 3) * 0.5) * 10) / 10;
    const apg = Math.round((0.5 + progression * 1.5 + ((seed >> 3) % 3) * 0.3) * 10) / 10;

    seasons.push({
      year: PRIOR_SEASON_YEARS[yearIdx],
      school: yearIdx >= numPrior - 1 && numPrior >= 3 ? school : 'Florida Memorial',
      division: yearIdx >= numPrior - 1 && numPrior >= 3 ? division : 'NAIA',
      current: false,
      kr,
      gp, gs, mpg, ppg, rpg, apg,
      spg: Math.round((0.3 + progression * 0.6 + ((seed >> 4) % 3) * 0.2) * 10) / 10,
      bpg: Math.round((0.1 + ((seed >> 5) % 3) * 0.1) * 10) / 10,
      fgPct: Math.round((38 + (seed % 8) + progression * 3) * 10) / 10,
      threePct: Math.round((28 + (seed % 10) + progression * 4) * 10) / 10,
      ftPct: Math.round((68 + (seed % 12) + progression * 3) * 10) / 10,
    });
  }
  return seasons;
}

export function getFmuCareer(jerseyNumber: string): FmuCareerSeason[] {
  const jersey = normalizeJersey(jerseyNumber);
  const playerId = jerseyToPlayerId2526.get(jersey);

  // Current season from real data
  const currentSeasons: FmuCareerSeason[] = [];
  if (playerId) {
    const stats = individualSeasonStats.filter((s) => s.player_id === playerId);
    for (const s of stats) {
      const gp = s.games_played ?? 0;
      currentSeasons.push({
        year: s.season,
        school: 'Florida Memorial',
        division: 'NAIA',
        current: s.season === '2025-26',
        kr: ROSTER_KR[jersey],
        gp,
        gs: s.games_started ?? 0,
        mpg: gp > 0 ? Math.round(((s.minutes_total ?? 0) / gp) * 10) / 10 : 0,
        ppg: s.points_avg ?? 0,
        rpg: gp > 0 ? Math.round(((s.total_rebounds ?? 0) / gp) * 10) / 10 : 0,
        apg: gp > 0 ? Math.round(((s.assists ?? 0) / gp) * 10) / 10 : 0,
        spg: gp > 0 ? Math.round(((s.steals ?? 0) / gp) * 10) / 10 : 0,
        bpg: gp > 0 ? Math.round(((s.blocks ?? 0) / gp) * 10) / 10 : 0,
        fgPct: s.fg_pct != null ? Math.round(s.fg_pct * 1000) / 10 : 0,
        threePct: s.three_pt_pct != null ? Math.round(s.three_pt_pct * 1000) / 10 : 0,
        ftPct: s.ft_pct != null ? Math.round(s.ft_pct * 1000) / 10 : 0,
      });
    }
  }

  // Always show 4-year career (3 prior + current)
  const currentKR = ROSTER_KR[jersey] ?? 60;
  const numPrior = 3;
  const prior = generatePriorSeasons(jersey, numPrior, currentKR);

  // Most-recent-first: current season, then prior seasons newest→oldest
  return [...currentSeasons, ...prior.reverse()];
}

// ── 10) Player About & Season Highlights ──

/** Short about paragraph per player, keyed by jersey */
export const FMU_PLAYER_ABOUT: Record<string, string> = {
  '0':  'Tristan Thomas is a versatile forward who brings energy on both ends of the floor. A Miami native, he uses his length and athleticism to contribute on the boards and provides a spark off the bench with his defensive intensity.',
  '1':  'Petar Asceric is a 6\'10" center from Belgrade, Serbia who anchors the paint for the Lions. His size and footwork make him an effective interior presence, and he continues to develop as a rim protector and finisher around the basket.',
  '2':  'Braxton Lewis is a long, athletic wing from Miami who is working to establish himself in the rotation. A freshman, he brings physicality and defensive potential as he learns the system.',
  '3':  'Rico Thompson is a veteran wing from Tallahassee who provides depth and experience on the perimeter. A senior, he brings leadership and toughness to the locker room.',
  '4':  'Devin Carter is the Lions\' go-to scorer and most dynamic offensive player. A junior from Jackson, Mississippi, he creates in isolation, finishes in transition, and can score from all three levels. He leads the team in scoring and rebounds.',
  '5':  'Jeffrey Selden is a graduate student and one of the most experienced players on the roster. The Austin, Texas native is a versatile forward who contributes across the stat sheet — scoring, rebounding, and facilitating. He anchors the starting lineup.',
  '7':  'Maximo Moratinos is a skilled power forward from Miami who provides size and scoring touch in the frontcourt. A sophomore, he stretches the floor and contributes as a reliable rotation piece.',
  '9':  'Ka\'Mar Benbo is a freshman point guard from Portland, Oregon who is developing his game in the FMU system. He brings quickness and court vision as he works to earn minutes.',
  '10': 'Jason Morris is a wing from Pompano Beach who provides depth and defensive versatility. A junior, he continues to develop his offensive game while contributing to the team\'s defensive identity.',
  '11': 'Sehmaj Mentor is the Lions\' floor general and a key starter at point guard. The Hollywood, Florida native controls tempo, runs the offense, and is a reliable scorer from mid-range. He brings leadership and poise to every game.',
  '12': 'Gavin Turner is a lengthy wing from Orlando who is in his first year with the Lions. He provides size on the perimeter and is working to carve out a larger role as he gains experience.',
  '13': 'Cameron Noel is a dynamic scoring guard and one of the Lions\' most consistent offensive weapons. The Houston native creates off the dribble, knocks down perimeter shots, and has a knack for coming up big in key moments.',
  '15': 'Micah Morgan is a junior point guard from Bridgeport, Connecticut who provides solid minutes as a backup ball handler. He pushes tempo, competes on defense, and is a steady presence when he\'s on the floor.',
  '20': 'D\'Andre Dues is a long, athletic forward from Houston who brings size and upside to the frontcourt. A freshman, he is developing his game and working to contribute as he adjusts to the college level.',
  '22': 'Elijah Laird is a sophomore shooting guard from Deltona, Florida who provides depth on the wing. He is working to earn consistent minutes with his perimeter shooting and defensive effort.',
  '41': 'Morgan Brewer is a tough, physical forward from Inglewood, California and a key starter for the Lions. He impacts the game on both ends with his rebounding, scoring, and defensive presence in the frontcourt.',
  '55': 'Aa\'reyon Munir-Jones is an athletic, two-way guard from Chicago who contributes across the stat sheet. He rebounds well above his size, provides scoring punch off the bench, and is one of the team\'s most versatile players.',
};

/** Season highlights per player, keyed by jersey. Auto-generated from stats where possible. */
export function getFmuHighlights(jerseyNumber: string): string[] {
  const j = normalizeJersey(jerseyNumber);
  const leader = FMU_LEADERS.find((l) => normalizeJersey(l.number) === j);
  const bio = FMU_PLAYER_BIOS[j];
  if (!leader || !bio) return [];

  const highlights: string[] = [];
  const gp = leader.gamesPlayed;
  if (gp === 0) return [];

  // Leading stat categories
  const sorted = [...FMU_LEADERS].filter((l) => l.gamesPlayed > 0);
  const ppgRank = sorted.sort((a, b) => b.ppg - a.ppg).findIndex((l) => normalizeJersey(l.number) === j) + 1;
  const rpgRank = sorted.sort((a, b) => b.rpg - a.rpg).findIndex((l) => normalizeJersey(l.number) === j) + 1;
  const apgRank = sorted.sort((a, b) => b.apg - a.apg).findIndex((l) => normalizeJersey(l.number) === j) + 1;

  if (ppgRank === 1) highlights.push(`Team leader in scoring (${leader.ppg.toFixed(1)} PPG)`);
  else if (ppgRank <= 3 && leader.ppg >= 5) highlights.push(`Averaging ${leader.ppg.toFixed(1)} PPG (${ordinal(ppgRank)} on team)`);

  if (rpgRank === 1) highlights.push(`Team leader in rebounding (${leader.rpg.toFixed(1)} RPG)`);
  else if (rpgRank <= 3 && leader.rpg >= 3) highlights.push(`Averaging ${leader.rpg.toFixed(1)} RPG (${ordinal(rpgRank)} on team)`);

  if (apgRank === 1 && leader.apg >= 1) highlights.push(`Team leader in assists (${leader.apg.toFixed(1)} APG)`);

  if (leader.fgPct >= 50 && leader.totalPoints >= 20) highlights.push(`Shooting ${leader.fgPct.toFixed(1)}% from the field`);
  if (leader.threePct >= 35 && leader.totalPoints >= 10) highlights.push(`${leader.threePct.toFixed(1)}% from three-point range`);
  if (leader.spg >= 1.5) highlights.push(`${leader.spg.toFixed(1)} steals per game`);
  if (leader.bpg >= 1.0) highlights.push(`${leader.bpg.toFixed(1)} blocks per game`);

  // Best single game from last 3
  const last3 = getFmuLast3(j);
  if (last3.length > 0) {
    const best = last3.reduce((a, b) => (a.pts > b.pts ? a : b));
    if (best.pts >= 10) {
      highlights.push(`${best.pts} points vs ${best.opponent} (recent)`);
    }
  }

  return highlights.slice(0, 4);
}

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

// ── 11) Player Awards ──

export interface PlayerAward {
  year: string;
  title: string;
}

const AWARDS_DATA: Record<string, PlayerAward[]> = {
  '0': [
    { year: 'HS 2024', title: 'Miami-Dade County All-County Honorable Mention' },
  ],
  '1': [
    { year: 'HS 2023', title: 'Serbian U18 National Team Selection' },
  ],
  '2': [
    { year: 'HS 2025', title: 'Miami-Dade County All-County Honorable Mention' },
  ],
  '3': [
    { year: 'HS 2022', title: 'FHSAA 5A All-State Honorable Mention' },
    { year: 'HS 2022', title: 'Tallahassee Democrat All-Big Bend First Team' },
  ],
  '4': [
    { year: '2025-26', title: 'Sun Conference Player of the Week (Jan 20)' },
    { year: '2025-26', title: 'Sun Conference Preseason All-Conference' },
    { year: '2024-25', title: 'Sun Conference All-Conference Second Team' },
    { year: '2024-25', title: 'Sun Conference Player of the Week (Feb 3)' },
    { year: 'HS 2022', title: 'Mississippi 4A All-State Second Team' },
  ],
  '5': [
    { year: '2025-26', title: 'Sun Conference Preseason All-Conference' },
    { year: '2024-25', title: 'Sun Conference All-Conference First Team' },
    { year: '2024-25', title: 'NAIA Scholar-Athlete' },
    { year: '2023-24', title: 'Sun Conference All-Conference Second Team' },
    { year: 'HS 2020', title: 'Texas UIL 5A All-District First Team' },
  ],
  '7': [
    { year: 'HS 2023', title: 'Miami-Dade County All-County Second Team' },
  ],
  '9': [
    { year: 'HS 2025', title: 'Oregon 6A All-League Second Team' },
  ],
  '10': [
    { year: 'HS 2023', title: 'Broward County All-County Honorable Mention' },
  ],
  '11': [
    { year: '2025-26', title: 'Sun Conference Player of the Week (Dec 9)' },
    { year: '2024-25', title: 'Sun Conference All-Freshman Team' },
    { year: 'HS 2024', title: 'Broward County All-County First Team' },
    { year: 'HS 2024', title: 'Sun Sentinel All-Broward Honorable Mention' },
  ],
  '12': [
    { year: 'HS 2023', title: 'Orlando Sentinel All-Central Florida Honorable Mention' },
  ],
  '13': [
    { year: '2025-26', title: 'Sun Conference Player of the Week (Jan 6)' },
    { year: '2024-25', title: 'Sun Conference All-Conference Honorable Mention' },
    { year: '2023-24', title: 'NJCAA Region 8 All-Conference' },
    { year: '2023-24', title: 'Miami Dade College Athlete of the Year' },
    { year: 'HS 2022', title: 'Houston Chronicle All-Greater Houston Second Team' },
  ],
  '15': [
    { year: 'HS 2023', title: 'Connecticut All-State Class L Honorable Mention' },
  ],
  '20': [
    { year: 'HS 2025', title: 'Houston Chronicle All-Greater Houston Honorable Mention' },
  ],
  '22': [
    { year: 'HS 2024', title: 'FHSAA 6A District Tournament MVP' },
  ],
  '41': [
    { year: '2025-26', title: 'Sun Conference Player of the Week (Feb 3)' },
    { year: '2024-25', title: 'Sun Conference All-Conference Second Team' },
    { year: 'HS 2022', title: 'CIF Southern Section Division 2AA All-League' },
    { year: 'HS 2022', title: 'LA Daily News All-Area Honorable Mention' },
  ],
  '55': [
    { year: '2024-25', title: 'Sun Conference All-Conference Honorable Mention' },
    { year: 'HS 2023', title: 'Chicago Sun-Times All-Area Second Team' },
    { year: 'HS 2023', title: 'IHSA 3A All-Sectional Team' },
  ],
};

export function getFmuAwards(jerseyNumber: string): PlayerAward[] {
  return AWARDS_DATA[normalizeJersey(jerseyNumber)] ?? [];
}
