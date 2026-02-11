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

type GameStatus = 'upcoming' | 'live' | 'final';

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
  opponentRecord?: string;
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
  return `${ovrW}-${ovrL}`;
}

const TODAY_END = new Date(TODAY_START.getTime() + 86400000); // midnight tonight

export const FMU_GAMES: FMUGame[] = tgl2526.map((g, i) => {
  const d = parseGameDate(g.game_date);
  const isFuture = d != null && d >= TODAY_START && g.result == null;
  const isToday = d != null && d >= TODAY_START && d < TODAY_END;
  const isLive = isToday && g.result == null;
  return {
    id: `fmu-2526-${String(i).padStart(2, '0')}`,
    opponent: g.opponent ?? 'Unknown',
    date: g.game_date ?? '',
    location: g.home_away === 'H' ? 'Home' : 'Away',
    status: (isLive ? 'live' : isFuture ? 'upcoming' : 'final') as GameStatus,
    score:
      isLive ? '38-32'
      : g.result && g.fmu_score != null && g.opp_score != null
        ? `${g.result} ${g.fmu_score}-${g.opp_score}`
        : undefined,
    clock: isLive ? '2H 14:22' : undefined,
    gameType: isConfGame(g.opponent) ? 'CONF' : 'NON-CONF',
    opponentRecord: isFuture || isLive ? placeholderRecord(g.opponent ?? '', isConfGame(g.opponent)) : undefined,
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

// Match individual game_ids to team game logs by date+opponent
for (const rawId of individualGameIds) {
  const sample = gameLogs.find((gl) => gl.game_id === rawId);
  if (!sample) continue;
  // Find matching team game log by date and opponent
  const tglIdx = tgl2526.findIndex(
    (t) => t.game_date === sample.game_date && t.opponent === sample.opponent,
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

// ── 6) News (auto-generated from game results) ──

export interface NewsItem {
  id: string;
  headline: string;
  date: string;
  type: string;
}

export const FMU_NEWS: NewsItem[] = tgl2526
  .filter((g) => g.result && g.opponent)
  .map((g, i) => {
    const isWin = g.result === 'W';
    const headline = isWin
      ? `FMU Defeats ${g.opponent} ${g.fmu_score}-${g.opp_score}`
      : `FMU Falls to ${g.opponent} ${g.fmu_score}-${g.opp_score}`;
    return {
      id: `news-${i}`,
      headline,
      date: g.game_date ?? '',
      type: 'Recap',
    };
  })
  .reverse(); // Most recent first

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

/** Last 3 completed games for a player (most recent first) */
export interface Last3Game {
  opponent: string;
  pts: number;
  reb: number;
  ast: number;
}

export function getFmuLast3(jerseyNumber: string): Last3Game[] {
  const playerId = jerseyToPlayerId2526.get(normalizeJersey(jerseyNumber));
  if (!playerId) return [];

  // Filter to this player's 2025-26 game logs, sorted by date
  const playerLogs = gameLogs
    .filter((gl) => gl.player_id === playerId && gl.season === '2025-26' && gl.points != null)
    .reverse(); // gameLogs are chronological, reverse for most-recent-first

  return playerLogs.slice(0, 3).map((gl) => ({
    opponent: gl.opponent ?? 'Unknown',
    pts: gl.points ?? 0,
    reb: gl.total_rebounds ?? 0,
    ast: gl.assists ?? 0,
  }));
}

/** Career season entry */
export interface FmuCareerSeason {
  year: string;
  school: string;
  division: string;
  current: boolean;
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

export function getFmuCareer(jerseyNumber: string): FmuCareerSeason[] {
  const playerId = jerseyToPlayerId2526.get(normalizeJersey(jerseyNumber));
  if (!playerId) return [];

  const stats = individualSeasonStats.filter((s) => s.player_id === playerId);
  return stats.map((s) => {
    const gp = s.games_played ?? 0;
    return {
      year: s.season,
      school: 'Florida Memorial',
      division: 'NAIA',
      current: s.season === '2025-26',
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
    };
  });
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
