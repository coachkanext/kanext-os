/**
 * Player Pool Data Bridge
 *
 * Reads from the PostgreSQL kanext_player_pool database and outputs data in
 * the EXACT same shape/interface as the existing mock data files:
 *   - playerPool.ts     -> PoolPlayer[], POOL_PLAYER_AWARDS
 *   - playerRatings.ts  -> PlayerRatings[], getPoolPlayerSubclusters(), getTeamClusterAverages()
 *   - playerSeasons.ts  -> PlayerSeason[], getPlayerSeasons(), getLatestSeason(), getSeasonTotals()
 *   - player-stats.ts   -> Record<string, PlayerSeasonStats>, STAT_META, STAT_GROUPS
 *
 * This module is a drop-in replacement for mock data. Existing components
 * (PlayerPoolContent, recruiting workspace, KaNeXT Database view) consume
 * real player data with zero UI changes.
 *
 * Usage:
 *   import { bridge } from '@/services/player-pool/bridge';
 *   const players = await bridge.getPlayerPool();
 *   const ratings = await bridge.getPlayerRatings();
 *   const subclusters = await bridge.getPoolPlayerSubclusters(playerId, 'shooting');
 *   const stats = await bridge.getPlayerStats();
 */

// ─── Re-export canonical types (unchanged from mock files) ───

export type PoolLevel =
  | 'NAIA' | 'NCAA' | 'NCAA D1' | 'NCAA D2' | 'NCAA D3'
  | 'JUCO' | 'JUCO D1' | 'JUCO D2' | 'JUCO D3'
  | 'USCAA' | 'NCCAA' | 'NCCAA D1' | 'NCCAA D2'
  | '3C2A' | 'International' | 'HS';

export type PoolPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type ClusterType =
  | 'shooting' | 'finishing' | 'playmaking'
  | 'perimeter_defense' | 'interior_defense'
  | 'rebounding' | 'frame';

// ─── Interface definitions (matching mock data shapes exactly) ───

export interface PoolPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: PoolPosition;
  height: string;
  weight?: number;
  classYear: string;
  currentSchool: string;
  level: PoolLevel;
  conference: string;
  state: string;
  keyStatLine: string;
  hasFilm: boolean;
  lastUpdated: string; // ISO date
  archetype: string;
}

export interface PlayerRatings {
  playerId: string;
  overall: number;
  clusters: Record<ClusterType, number>;
}

export interface PlayerSeason {
  playerId: string;
  season: string;
  school: string;
  level: string;
  gp: number;
  mpg: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  kr?: number;
}

export interface PlayerSeasonStats {
  min: number;
  pts: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  reb: number;
  oreb: number;
  dreb: number;
  ast: number;
  to: number;
  stl: number;
  blk: number;
  pf: number;
  plusMinus: number;
}

// ─── Stat metadata (matching data/player-stats.ts exactly) ───

export type StatKey = keyof PlayerSeasonStats;

export interface StatMeta {
  key: StatKey;
  label: string;
  short: string;
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

/** Weekly update period options (matching data/playerRatings.ts) */
export const WEEKLY_UPDATE_OPTIONS = [
  { value: 'preseason', label: 'Preseason' },
  { value: 'week_1', label: 'Week 1' },
  { value: 'week_2', label: 'Week 2' },
  { value: 'week_3', label: 'Week 3' },
  { value: 'week_4', label: 'Week 4' },
  { value: 'week_5', label: 'Week 5' },
  { value: 'week_6', label: 'Week 6' },
  { value: 'week_7', label: 'Week 7' },
  { value: 'week_8', label: 'Week 8' },
  { value: 'midseason', label: 'Midseason' },
  { value: 'week_9', label: 'Week 9' },
  { value: 'week_10', label: 'Week 10' },
  { value: 'week_11', label: 'Week 11' },
  { value: 'week_12', label: 'Week 12' },
  { value: 'week_13', label: 'Week 13' },
  { value: 'week_14', label: 'Week 14' },
  { value: 'week_15', label: 'Week 15' },
  { value: 'week_16', label: 'Week 16' },
  { value: 'postseason', label: 'Postseason' },
  { value: 'final', label: 'Final' },
];

// ─── Database configuration ───

const DB_CONFIG = {
  host: process.env.PLAYER_POOL_DB_HOST ?? 'localhost',
  port: parseInt(process.env.PLAYER_POOL_DB_PORT ?? '5432', 10),
  database: process.env.PLAYER_POOL_DB_NAME ?? 'kanext_player_pool',
  user: process.env.PLAYER_POOL_DB_USER ?? process.env.USER ?? 'sammy',
  password: process.env.PLAYER_POOL_DB_PASSWORD ?? '',
};

// ─── Lightweight query runner (uses pg via dynamic import) ───
// pg is a peer dependency -- install via: npm install pg @types/pg
// Uses connection pooling to avoid overhead of connect/disconnect per query.

type QueryResult = { rows: Record<string, unknown>[] };

let _pool: any = null;

async function getPool(): Promise<any> {
  if (_pool) return _pool;
  const { default: pg } = await import('pg');
  _pool = new pg.Pool({
    ...DB_CONFIG,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  return _pool;
}

async function query(sql: string, params: unknown[] = []): Promise<QueryResult> {
  // Dynamic import to avoid bundling pg in the React Native app build.
  // The bridge is only called from Node.js scripts or API routes.
  const pool = await getPool();
  const result = await pool.query(sql, params);
  return { rows: result.rows };
}

/** Gracefully close the connection pool (call on process shutdown). */
export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

// ─── Level key -> PoolLevel mapping ───

const LEVEL_KEY_TO_POOL_LEVEL: Record<string, PoolLevel> = {
  hs_prep_postgrad: 'HS',
  njcaa_d3: 'JUCO D3',
  njcaa_d2: 'JUCO D2',
  njcaa_d1: 'JUCO D1',
  cccaa: '3C2A',
  naia: 'NAIA',
  uscaa: 'USCAA',
  nccaa_d2: 'NCCAA D2',
  nccaa_d1: 'NCCAA D1',
  ncaa_d3: 'NCAA D3',
  ncaa_d2: 'NCAA D2',
  ncaa_d1_low_major: 'NCAA D1',
  ncaa_d1_mid_major: 'NCAA D1',
  ncaa_d1_high_major: 'NCAA D1',
  professional: 'International', // closest mapping
};

// ─── DB cluster name -> app ClusterType mapping ───

const DB_CLUSTER_TO_APP: Record<string, ClusterType> = {
  shooting: 'shooting',
  finishing: 'finishing',
  playmaking: 'playmaking',
  on_ball_defense: 'perimeter_defense',
  team_defense: 'interior_defense',
  rebounding: 'rebounding',
  physical: 'frame',
};

const APP_CLUSTER_TO_DB: Record<ClusterType, string> = {
  shooting: 'shooting',
  finishing: 'finishing',
  playmaking: 'playmaking',
  perimeter_defense: 'on_ball_defense',
  interior_defense: 'team_defense',
  rebounding: 'rebounding',
  frame: 'physical',
};

// ─── Position mapping (declared_positions[0] -> traditional) ───

function toPoolPosition(positions: string[] | null): PoolPosition {
  if (!positions || positions.length === 0) return 'SF';
  const primary = positions[0].toUpperCase();
  const map: Record<string, PoolPosition> = {
    PG: 'PG', SG: 'SG', SF: 'SF', PF: 'PF', C: 'C',
    G: 'PG', F: 'PF',
    // Heliocentric -> traditional
    CG: 'SG', W: 'SF', B: 'C',
  };
  return map[primary] ?? 'SF';
}

// ─── Height formatting (inches -> display string) ───

function formatHeight(inches: number | null): string {
  if (!inches) return '6\'0"';
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${feet}'${rem}"`;
}

// ─── Key stat line builder ───

function buildKeyStatLine(stats: {
  ppg?: number; rpg?: number; apg?: number; bpg?: number;
}): string {
  const parts: string[] = [];
  if (stats.ppg != null) parts.push(`${stats.ppg.toFixed(1)} PPG`);
  if (stats.rpg != null) parts.push(`${stats.rpg.toFixed(1)} RPG`);
  if (stats.apg != null) parts.push(`${stats.apg.toFixed(1)} APG`);
  if (stats.bpg != null && stats.bpg >= 1.0) parts.push(`${stats.bpg.toFixed(1)} BPG`);
  return parts.join(' / ') || 'No stats';
}

// ─── Default cluster ratings ───

const DEFAULT_CLUSTERS: Record<ClusterType, number> = {
  shooting: 50, finishing: 50, playmaking: 50,
  perimeter_defense: 50, interior_defense: 50,
  rebounding: 50, frame: 50,
};

// ─── Bridge API ───

export const bridge = {
  // =========================================================================
  // playerPool.ts replacements
  // =========================================================================

  /**
   * Returns all players in the national pool as PoolPlayer[].
   * Matches the shape of PLAYER_POOL from data/playerPool.ts.
   */
  async getPlayerPool(season?: string): Promise<PoolPlayer[]> {
    const targetSeason = season ?? '2025-26';

    const { rows } = await query(`
      SELECT
        p.id,
        p.full_name,
        p.height_inches,
        p.weight_lbs,
        p.declared_positions,
        p.state_origin,
        p.country_origin,
        p.updated_at,
        pts.class_year,
        t.name AS school_name,
        c.name AS conference_name,
        cl.level_key,
        kr.overall_kr,
        kr.primary_archetype,
        pss.pts_per_game,
        pss.reb_per_game,
        pss.ast_per_game,
        pss.blk_per_game
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN teams t ON t.id = ts.team_id
      LEFT JOIN conferences c ON c.id = t.conference_id
      LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
      LEFT JOIN player_kr kr ON kr.player_team_season_id = pts.id
      LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
      WHERE ts.season = $1
      ORDER BY kr.overall_kr DESC NULLS LAST, p.full_name
    `, [targetSeason]);

    return rows.map((r) => {
      const nameParts = (r.full_name as string).split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') ?? '';
      const levelKey = r.level_key as string | null;
      const level: PoolLevel = levelKey
        ? (LEVEL_KEY_TO_POOL_LEVEL[levelKey] ?? 'JUCO')
        : 'JUCO';

      return {
        id: r.id as string,
        firstName,
        lastName,
        position: toPoolPosition(r.declared_positions as string[] | null),
        height: formatHeight(r.height_inches as number | null),
        weight: (r.weight_lbs as number) ?? undefined,
        classYear: (r.class_year as string) ?? '2025',
        currentSchool: (r.school_name as string) ?? 'Unknown',
        level,
        conference: (r.conference_name as string) ?? '',
        state: (r.country_origin as string) !== 'USA'
          ? (r.country_origin as string) ?? ''
          : (r.state_origin as string) ?? '',
        keyStatLine: buildKeyStatLine({
          ppg: r.pts_per_game as number | undefined,
          rpg: r.reb_per_game as number | undefined,
          apg: r.ast_per_game as number | undefined,
          bpg: r.blk_per_game as number | undefined,
        }),
        hasFilm: false, // Film data not in scraper pipeline yet
        lastUpdated: r.updated_at
          ? new Date(r.updated_at as string).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        archetype: (r.primary_archetype as string) ?? 'two_way_wing',
      };
    });
  },

  /**
   * Returns a single player by ID.
   * Matches looking up PLAYER_POOL.find(p => p.id === id).
   */
  async getPlayerById(playerId: string, season?: string): Promise<PoolPlayer | null> {
    const targetSeason = season ?? '2025-26';

    const { rows } = await query(`
      SELECT
        p.id,
        p.full_name,
        p.height_inches,
        p.weight_lbs,
        p.declared_positions,
        p.state_origin,
        p.country_origin,
        p.updated_at,
        pts.class_year,
        t.name AS school_name,
        c.name AS conference_name,
        cl.level_key,
        kr.overall_kr,
        kr.primary_archetype,
        pss.pts_per_game,
        pss.reb_per_game,
        pss.ast_per_game,
        pss.blk_per_game
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN teams t ON t.id = ts.team_id
      LEFT JOIN conferences c ON c.id = t.conference_id
      LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
      LEFT JOIN player_kr kr ON kr.player_team_season_id = pts.id
      LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
      WHERE p.id = $1 AND ts.season = $2
      LIMIT 1
    `, [playerId, targetSeason]);

    if (rows.length === 0) return null;

    const r = rows[0];
    const nameParts = (r.full_name as string).split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') ?? '';
    const levelKey = r.level_key as string | null;
    const level: PoolLevel = levelKey
      ? (LEVEL_KEY_TO_POOL_LEVEL[levelKey] ?? 'JUCO')
      : 'JUCO';

    return {
      id: r.id as string,
      firstName,
      lastName,
      position: toPoolPosition(r.declared_positions as string[] | null),
      height: formatHeight(r.height_inches as number | null),
      weight: (r.weight_lbs as number) ?? undefined,
      classYear: (r.class_year as string) ?? '2025',
      currentSchool: (r.school_name as string) ?? 'Unknown',
      level,
      conference: (r.conference_name as string) ?? '',
      state: (r.country_origin as string) !== 'USA'
        ? (r.country_origin as string) ?? ''
        : (r.state_origin as string) ?? '',
      keyStatLine: buildKeyStatLine({
        ppg: r.pts_per_game as number | undefined,
        rpg: r.reb_per_game as number | undefined,
        apg: r.ast_per_game as number | undefined,
        bpg: r.blk_per_game as number | undefined,
      }),
      hasFilm: false,
      lastUpdated: r.updated_at
        ? new Date(r.updated_at as string).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      archetype: (r.primary_archetype as string) ?? 'two_way_wing',
    };
  },

  /**
   * Returns player awards keyed by player ID.
   * Matches POOL_PLAYER_AWARDS from data/playerPool.ts.
   *
   * Awards are not currently in the scraper pipeline, so this queries
   * secondary_archetypes as a stand-in. When a player_awards table is
   * added, this query will be updated to read from it.
   */
  async getPlayerAwards(season?: string): Promise<Record<string, string[]>> {
    const targetSeason = season ?? '2025-26';

    // For now, return empty awards. When a player_awards table exists in the
    // pipeline, we will query it here. The shape is the same as POOL_PLAYER_AWARDS.
    const { rows } = await query(`
      SELECT
        p.id AS player_id,
        kr.secondary_archetypes
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      LEFT JOIN player_kr kr ON kr.player_team_season_id = pts.id
      WHERE ts.season = $1
    `, [targetSeason]);

    const awards: Record<string, string[]> = {};
    for (const r of rows) {
      const pid = r.player_id as string;
      // secondary_archetypes is VARCHAR[] in the DB; use as placeholder awards
      const archArr = r.secondary_archetypes as string[] | null;
      if (archArr && archArr.length > 0) {
        awards[pid] = archArr;
      }
    }
    return awards;
  },

  // =========================================================================
  // playerRatings.ts replacements
  // =========================================================================

  /**
   * Returns KR ratings for all players as PlayerRatings[].
   * Matches the shape of PLAYER_RATINGS from data/playerRatings.ts.
   */
  async getPlayerRatings(season?: string): Promise<PlayerRatings[]> {
    const targetSeason = season ?? '2025-26';

    const { rows } = await query(`
      SELECT
        p.id AS player_id,
        kr.overall_kr,
        krc.cluster,
        krc.score
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN player_kr kr ON kr.player_team_season_id = pts.id
      LEFT JOIN player_kr_clusters krc ON krc.player_kr_id = kr.id
      WHERE ts.season = $1
      ORDER BY p.id, krc.cluster
    `, [targetSeason]);

    // Group by player
    const grouped = new Map<string, { overall: number; clusters: Partial<Record<ClusterType, number>> }>();

    for (const r of rows) {
      const pid = r.player_id as string;
      if (!grouped.has(pid)) {
        grouped.set(pid, {
          overall: Math.round(r.overall_kr as number) ?? 50,
          clusters: {},
        });
      }
      const entry = grouped.get(pid)!;
      if (r.cluster && r.score != null) {
        const mapped = DB_CLUSTER_TO_APP[r.cluster as string];
        if (mapped) {
          entry.clusters[mapped] = Math.round(r.score as number);
        }
      }
    }

    return Array.from(grouped.entries()).map(([playerId, data]) => ({
      playerId,
      overall: data.overall,
      clusters: { ...DEFAULT_CLUSTERS, ...data.clusters },
    }));
  },

  /**
   * Returns a single player's ratings by ID.
   * Matches getPlayerRatings(playerId) from data/playerRatings.ts.
   */
  async getPlayerRatingsById(playerId: string, season?: string): Promise<PlayerRatings | null> {
    const targetSeason = season ?? '2025-26';

    const { rows } = await query(`
      SELECT
        kr.overall_kr,
        krc.cluster,
        krc.score
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN player_kr kr ON kr.player_team_season_id = pts.id
      LEFT JOIN player_kr_clusters krc ON krc.player_kr_id = kr.id
      WHERE p.id = $1 AND ts.season = $2
      ORDER BY krc.cluster
    `, [playerId, targetSeason]);

    if (rows.length === 0) return null;

    const clusters: Partial<Record<ClusterType, number>> = {};
    let overall = 50;

    for (const r of rows) {
      overall = Math.round(r.overall_kr as number) ?? 50;
      if (r.cluster && r.score != null) {
        const mapped = DB_CLUSTER_TO_APP[r.cluster as string];
        if (mapped) {
          clusters[mapped] = Math.round(r.score as number);
        }
      }
    }

    return {
      playerId,
      overall,
      clusters: { ...DEFAULT_CLUSTERS, ...clusters },
    };
  },

  /**
   * Returns subclusters (trait-level scores) for a player's cluster.
   * Matches getPoolPlayerSubclusters() from data/playerRatings.ts.
   * Returns array of { name, rating } pairs for the specified cluster.
   */
  async getPoolPlayerSubclusters(
    playerId: string,
    clusterKey: ClusterType,
    season?: string,
  ): Promise<{ name: string; rating: number }[]> {
    const targetSeason = season ?? '2025-26';
    const dbCluster = APP_CLUSTER_TO_DB[clusterKey];

    const { rows } = await query(`
      SELECT
        krt.trait_key,
        krt.klvn_score,
        krt.raw_score
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN player_kr kr ON kr.player_team_season_id = pts.id
      JOIN player_kr_traits krt ON krt.player_kr_id = kr.id
      WHERE p.id = $1 AND ts.season = $2 AND krt.cluster = $3
      ORDER BY krt.trait_key
    `, [playerId, targetSeason, dbCluster]);

    return rows.map((r) => ({
      name: formatTraitKey(r.trait_key as string),
      rating: Math.round((r.klvn_score as number) ?? (r.raw_score as number) ?? 50),
    }));
  },

  /**
   * Returns team-level cluster averages from a set of player IDs.
   * Matches getTeamClusterAverages() from data/playerRatings.ts.
   */
  async getTeamClusterAverages(
    playerIds: string[],
    season?: string,
  ): Promise<{
    clusters: Record<ClusterType, number>;
    overall: number;
    offKR: number;
    defKR: number;
  }> {
    if (playerIds.length === 0) {
      return {
        clusters: { ...DEFAULT_CLUSTERS },
        overall: 0,
        offKR: 0,
        defKR: 0,
      };
    }

    const targetSeason = season ?? '2025-26';
    const placeholders = playerIds.map((_, i) => `$${i + 2}`).join(', ');

    const { rows } = await query(`
      SELECT
        p.id AS player_id,
        kr.overall_kr,
        kr.base_off_kr,
        kr.base_def_kr,
        krc.cluster,
        krc.score
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN player_kr kr ON kr.player_team_season_id = pts.id
      LEFT JOIN player_kr_clusters krc ON krc.player_kr_id = kr.id
      WHERE ts.season = $1 AND p.id IN (${placeholders})
      ORDER BY p.id, krc.cluster
    `, [targetSeason, ...playerIds]);

    // Accumulate per-cluster sums
    const clusterSums: Record<ClusterType, number> = { ...DEFAULT_CLUSTERS };
    const clusterCounts: Record<ClusterType, number> = {
      shooting: 0, finishing: 0, playmaking: 0,
      perimeter_defense: 0, interior_defense: 0,
      rebounding: 0, frame: 0,
    };
    const overallValues: number[] = [];
    const offKRValues: number[] = [];
    const defKRValues: number[] = [];
    const seenPlayers = new Set<string>();

    for (const r of rows) {
      const pid = r.player_id as string;
      if (!seenPlayers.has(pid)) {
        seenPlayers.add(pid);
        if (r.overall_kr != null) overallValues.push(r.overall_kr as number);
        if (r.base_off_kr != null) offKRValues.push(r.base_off_kr as number);
        if (r.base_def_kr != null) defKRValues.push(r.base_def_kr as number);
      }

      if (r.cluster && r.score != null) {
        const mapped = DB_CLUSTER_TO_APP[r.cluster as string];
        if (mapped) {
          clusterSums[mapped] = (clusterSums[mapped] || 0) + (r.score as number);
          clusterCounts[mapped] = (clusterCounts[mapped] || 0) + 1;
        }
      }
    }

    const avg = (vals: number[]) => vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const clusters = {} as Record<ClusterType, number>;
    for (const key of Object.keys(clusterSums) as ClusterType[]) {
      clusters[key] = clusterCounts[key] > 0
        ? Math.round(clusterSums[key] / clusterCounts[key])
        : 50;
    }

    return {
      clusters,
      overall: Math.round(avg(overallValues)),
      offKR: Math.round(avg(offKRValues)),
      defKR: Math.round(avg(defKRValues)),
    };
  },

  // =========================================================================
  // playerSeasons.ts replacements
  // =========================================================================

  /**
   * Returns season-by-season stats as PlayerSeason[].
   * Matches the shape of PLAYER_SEASONS from data/playerSeasons.ts.
   */
  async getPlayerSeasons(playerId?: string): Promise<PlayerSeason[]> {
    const whereClause = playerId ? 'AND p.id = $1' : '';
    const params = playerId ? [playerId] : [];

    const { rows } = await query(`
      SELECT
        p.id AS player_id,
        ts.season,
        t.name AS school_name,
        cl.level_key,
        pss.games_played,
        pss.minutes_per_game,
        pss.pts_per_game,
        pss.reb_per_game,
        pss.ast_per_game,
        pss.stl_per_game,
        pss.blk_per_game,
        pss.fg_pct,
        pss.three_pct,
        pss.ft_pct,
        kr.overall_kr
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN teams t ON t.id = ts.team_id
      LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
      LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
      LEFT JOIN player_kr kr ON kr.player_team_season_id = pts.id
      WHERE pss.games_played IS NOT NULL ${whereClause}
      ORDER BY p.id, ts.season DESC
    `, params);

    return rows.map((r) => {
      const levelKey = r.level_key as string | null;
      const level = levelKey ? (LEVEL_KEY_TO_POOL_LEVEL[levelKey] ?? 'JUCO') : 'JUCO';
      return {
        playerId: r.player_id as string,
        season: r.season as string,
        school: r.school_name as string,
        level,
        gp: (r.games_played as number) ?? 0,
        mpg: (r.minutes_per_game as number) ?? 0,
        ppg: (r.pts_per_game as number) ?? 0,
        rpg: (r.reb_per_game as number) ?? 0,
        apg: (r.ast_per_game as number) ?? 0,
        spg: (r.stl_per_game as number) ?? 0,
        bpg: (r.blk_per_game as number) ?? 0,
        fgPct: (r.fg_pct as number) ?? 0,
        threePct: (r.three_pct as number) ?? 0,
        ftPct: (r.ft_pct as number) ?? 0,
        kr: r.overall_kr != null ? Math.round(r.overall_kr as number) : undefined,
      };
    });
  },

  /**
   * Returns all seasons for a player, sorted most recent first.
   * Matches getPlayerSeasons(playerId) from data/playerSeasons.ts.
   */
  async getPlayerSeasonsById(playerId: string): Promise<PlayerSeason[]> {
    return bridge.getPlayerSeasons(playerId);
  },

  /**
   * Returns the most recent season for a player, or null if none exist.
   * Matches getLatestSeason(playerId) from data/playerSeasons.ts.
   */
  async getLatestSeason(playerId: string): Promise<PlayerSeason | null> {
    const seasons = await bridge.getPlayerSeasons(playerId);
    if (seasons.length === 0) return null;
    // Already sorted most recent first by the query
    return seasons[0];
  },

  /**
   * Returns aggregated career averages across all seasons for a player.
   * Matches getSeasonTotals(playerId) from data/playerSeasons.ts.
   */
  async getSeasonTotals(playerId: string): Promise<{
    gp: number;
    ppg: number;
    rpg: number;
    apg: number;
  } | null> {
    const seasons = await bridge.getPlayerSeasons(playerId);
    if (seasons.length === 0) return null;

    const totalGp = seasons.reduce((sum, s) => sum + s.gp, 0);
    if (totalGp === 0) return null;

    const weightedPpg = seasons.reduce((sum, s) => sum + s.ppg * s.gp, 0) / totalGp;
    const weightedRpg = seasons.reduce((sum, s) => sum + s.rpg * s.gp, 0) / totalGp;
    const weightedApg = seasons.reduce((sum, s) => sum + s.apg * s.gp, 0) / totalGp;

    return {
      gp: totalGp,
      ppg: Math.round(weightedPpg * 10) / 10,
      rpg: Math.round(weightedRpg * 10) / 10,
      apg: Math.round(weightedApg * 10) / 10,
    };
  },

  // =========================================================================
  // player-stats.ts replacements
  // =========================================================================

  /**
   * Returns per-player season stats as Record<string, PlayerSeasonStats>.
   * Matches the shape of PLAYER_SEASON_STATS from data/player-stats.ts.
   */
  async getPlayerStats(season?: string): Promise<Record<string, PlayerSeasonStats>> {
    const targetSeason = season ?? '2025-26';

    const { rows } = await query(`
      SELECT
        p.id AS player_id,
        pss.minutes_per_game,
        pss.pts_per_game,
        pss.fg_pct,
        pss.three_pct,
        pss.ft_pct,
        pss.reb_per_game,
        pss.oreb_per_game,
        pss.dreb_per_game,
        pss.ast_per_game,
        pss.to_per_game,
        pss.stl_per_game,
        pss.blk_per_game,
        pss.pf_per_game
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
      WHERE ts.season = $1 AND pss.games_played IS NOT NULL
    `, [targetSeason]);

    const result: Record<string, PlayerSeasonStats> = {};

    for (const r of rows) {
      result[r.player_id as string] = {
        min: (r.minutes_per_game as number) ?? 0,
        pts: (r.pts_per_game as number) ?? 0,
        fgPct: (r.fg_pct as number) ?? 0,
        threePct: (r.three_pct as number) ?? 0,
        ftPct: (r.ft_pct as number) ?? 0,
        reb: (r.reb_per_game as number) ?? 0,
        oreb: (r.oreb_per_game as number) ?? 0,
        dreb: (r.dreb_per_game as number) ?? 0,
        ast: (r.ast_per_game as number) ?? 0,
        to: (r.to_per_game as number) ?? 0,
        stl: (r.stl_per_game as number) ?? 0,
        blk: (r.blk_per_game as number) ?? 0,
        pf: (r.pf_per_game as number) ?? 0,
        plusMinus: 0, // Not computed yet in pipeline
      };
    }

    return result;
  },

  /**
   * Returns a single player's stats by ID.
   * Matches getPlayerStats(playerId) from data/player-stats.ts.
   */
  async getPlayerStatsById(playerId: string, season?: string): Promise<PlayerSeasonStats | undefined> {
    const targetSeason = season ?? '2025-26';

    const { rows } = await query(`
      SELECT
        pss.minutes_per_game,
        pss.pts_per_game,
        pss.fg_pct,
        pss.three_pct,
        pss.ft_pct,
        pss.reb_per_game,
        pss.oreb_per_game,
        pss.dreb_per_game,
        pss.ast_per_game,
        pss.to_per_game,
        pss.stl_per_game,
        pss.blk_per_game,
        pss.pf_per_game
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
      WHERE p.id = $1 AND ts.season = $2 AND pss.games_played IS NOT NULL
      LIMIT 1
    `, [playerId, targetSeason]);

    if (rows.length === 0) return undefined;

    const r = rows[0];
    return {
      min: (r.minutes_per_game as number) ?? 0,
      pts: (r.pts_per_game as number) ?? 0,
      fgPct: (r.fg_pct as number) ?? 0,
      threePct: (r.three_pct as number) ?? 0,
      ftPct: (r.ft_pct as number) ?? 0,
      reb: (r.reb_per_game as number) ?? 0,
      oreb: (r.oreb_per_game as number) ?? 0,
      dreb: (r.dreb_per_game as number) ?? 0,
      ast: (r.ast_per_game as number) ?? 0,
      to: (r.to_per_game as number) ?? 0,
      stl: (r.stl_per_game as number) ?? 0,
      blk: (r.blk_per_game as number) ?? 0,
      pf: (r.pf_per_game as number) ?? 0,
      plusMinus: 0,
    };
  },

  // =========================================================================
  // Stat metadata helpers
  // =========================================================================

  /** Get stat metadata by key. Matches getStatMeta() from data/player-stats.ts. */
  getStatMeta(key: StatKey): StatMeta | undefined {
    return STAT_META.find((m) => m.key === key);
  },

  // =========================================================================
  // Dashboard / Summary
  // =========================================================================

  /**
   * Quick summary stats for dashboard display.
   */
  async getSummary(): Promise<{
    totalPlayers: number;
    totalTeams: number;
    totalGames: number;
    totalPlayerGameStats: number;
    failedScrapes: number;
  }> {
    const { rows } = await query(`
      SELECT
        (SELECT count(*) FROM players) AS total_players,
        (SELECT count(*) FROM teams) AS total_teams,
        (SELECT count(*) FROM games) AS total_games,
        (SELECT count(*) FROM player_game_stats) AS total_player_game_stats,
        (SELECT count(*) FROM scrape_log WHERE status = 'failed') AS failed_scrapes
    `);
    const r = rows[0];
    return {
      totalPlayers: Number(r.total_players),
      totalTeams: Number(r.total_teams),
      totalGames: Number(r.total_games),
      totalPlayerGameStats: Number(r.total_player_game_stats),
      failedScrapes: Number(r.failed_scrapes),
    };
  },

  // =========================================================================
  // Team-level queries (for team detail views)
  // =========================================================================

  /**
   * Returns all players for a specific team in a season.
   * Useful for team-detail views that list roster by school.
   */
  async getTeamRoster(teamName: string, season?: string): Promise<PoolPlayer[]> {
    const targetSeason = season ?? '2025-26';

    const { rows } = await query(`
      SELECT
        p.id,
        p.full_name,
        p.height_inches,
        p.weight_lbs,
        p.declared_positions,
        p.state_origin,
        p.country_origin,
        p.updated_at,
        pts.class_year,
        t.name AS school_name,
        c.name AS conference_name,
        cl.level_key,
        kr.overall_kr,
        kr.primary_archetype,
        pss.pts_per_game,
        pss.reb_per_game,
        pss.ast_per_game,
        pss.blk_per_game
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN teams t ON t.id = ts.team_id
      LEFT JOIN conferences c ON c.id = t.conference_id
      LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
      LEFT JOIN player_kr kr ON kr.player_team_season_id = pts.id
      LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
      WHERE t.name ILIKE $1 AND ts.season = $2
      ORDER BY kr.overall_kr DESC NULLS LAST
    `, [`%${teamName}%`, targetSeason]);

    return rows.map((r) => {
      const nameParts = (r.full_name as string).split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') ?? '';
      const levelKey = r.level_key as string | null;
      const level: PoolLevel = levelKey
        ? (LEVEL_KEY_TO_POOL_LEVEL[levelKey] ?? 'JUCO')
        : 'JUCO';

      return {
        id: r.id as string,
        firstName,
        lastName,
        position: toPoolPosition(r.declared_positions as string[] | null),
        height: formatHeight(r.height_inches as number | null),
        weight: (r.weight_lbs as number) ?? undefined,
        classYear: (r.class_year as string) ?? '2025',
        currentSchool: (r.school_name as string) ?? 'Unknown',
        level,
        conference: (r.conference_name as string) ?? '',
        state: (r.country_origin as string) !== 'USA'
          ? (r.country_origin as string) ?? ''
          : (r.state_origin as string) ?? '',
        keyStatLine: buildKeyStatLine({
          ppg: r.pts_per_game as number | undefined,
          rpg: r.reb_per_game as number | undefined,
          apg: r.ast_per_game as number | undefined,
          bpg: r.blk_per_game as number | undefined,
        }),
        hasFilm: false,
        lastUpdated: r.updated_at
          ? new Date(r.updated_at as string).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        archetype: (r.primary_archetype as string) ?? 'two_way_wing',
      };
    });
  },

  /**
   * Returns all available seasons in the database, sorted most recent first.
   */
  async getAvailableSeasons(): Promise<string[]> {
    const { rows } = await query(`
      SELECT DISTINCT season
      FROM team_seasons
      ORDER BY season DESC
    `);
    return rows.map((r) => r.season as string);
  },

  /**
   * Search players by name (partial match).
   * Useful for the search bar in KaNeXT Database view.
   */
  async searchPlayers(searchTerm: string, season?: string, limit = 50): Promise<PoolPlayer[]> {
    const targetSeason = season ?? '2025-26';

    const { rows } = await query(`
      SELECT
        p.id,
        p.full_name,
        p.height_inches,
        p.weight_lbs,
        p.declared_positions,
        p.state_origin,
        p.country_origin,
        p.updated_at,
        pts.class_year,
        t.name AS school_name,
        c.name AS conference_name,
        cl.level_key,
        kr.overall_kr,
        kr.primary_archetype,
        pss.pts_per_game,
        pss.reb_per_game,
        pss.ast_per_game,
        pss.blk_per_game
      FROM players p
      JOIN player_team_seasons pts ON pts.player_id = p.id
      JOIN team_seasons ts ON ts.id = pts.team_season_id
      JOIN teams t ON t.id = ts.team_id
      LEFT JOIN conferences c ON c.id = t.conference_id
      LEFT JOIN competitive_levels cl ON cl.id = t.competitive_level_id
      LEFT JOIN player_kr kr ON kr.player_team_season_id = pts.id
      LEFT JOIN player_season_stats pss ON pss.player_team_season_id = pts.id
      WHERE ts.season = $1 AND p.full_name ILIKE $2
      ORDER BY kr.overall_kr DESC NULLS LAST
      LIMIT $3
    `, [targetSeason, `%${searchTerm}%`, limit]);

    return rows.map((r) => {
      const nameParts = (r.full_name as string).split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') ?? '';
      const levelKey = r.level_key as string | null;
      const level: PoolLevel = levelKey
        ? (LEVEL_KEY_TO_POOL_LEVEL[levelKey] ?? 'JUCO')
        : 'JUCO';

      return {
        id: r.id as string,
        firstName,
        lastName,
        position: toPoolPosition(r.declared_positions as string[] | null),
        height: formatHeight(r.height_inches as number | null),
        weight: (r.weight_lbs as number) ?? undefined,
        classYear: (r.class_year as string) ?? '2025',
        currentSchool: (r.school_name as string) ?? 'Unknown',
        level,
        conference: (r.conference_name as string) ?? '',
        state: (r.country_origin as string) !== 'USA'
          ? (r.country_origin as string) ?? ''
          : (r.state_origin as string) ?? '',
        keyStatLine: buildKeyStatLine({
          ppg: r.pts_per_game as number | undefined,
          rpg: r.reb_per_game as number | undefined,
          apg: r.ast_per_game as number | undefined,
          bpg: r.blk_per_game as number | undefined,
        }),
        hasFilm: false,
        lastUpdated: r.updated_at
          ? new Date(r.updated_at as string).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        archetype: (r.primary_archetype as string) ?? 'two_way_wing',
      };
    });
  },
};

// ─── Helper: Format trait_key from snake_case to display label ───

function formatTraitKey(traitKey: string): string {
  return traitKey
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default bridge;
