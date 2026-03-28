/**
 * National Player Pool Data Adapter
 *
 * Loads the exported JSON from PostgreSQL and provides query functions
 * for the React Native UI. Drop-in replacement for mock data.
 *
 * Usage:
 *   import { nationalPool, formatForEval } from '@/data/national-pool';
 *   const results = nationalPool.search({ query: 'Bradley', level: 'naia' });
 *   const player = nationalPool.getById('some-uuid');
 */

import rawData from './national-pool.json';
import type { PlayerCardData as GlobalPlayerCardData } from '@/utils/global-entity-sheets';

// =============================================================================
// TYPES
// =============================================================================

export interface NationalPlayer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  height: string;
  heightInches: number | null;
  weight: number | null;
  classYear: string;
  jerseyNumber: string;
  school: string;
  conference: string;
  levelKey: string;
  levelDisplay: string;
  state: string;
  country: string;
  city: string;
  highSchool: string;
  portalEntryDate: string | null;
  // Stats (raw — KR is computed live by Claude via SKILL.md)
  gp: number | null;
  gs: number | null;
  mpg: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  threePct: number | null;
  ftPct: number | null;
  orebPg: number | null;
  drebPg: number | null;
  fgaPg: number | null;
  threePaPg: number | null;
  ftaPg: number | null;
  pfPg: number | null;
  usageRate: number | null;
  // Legacy fields — present in JSON but not used in new UI code
  kr?: number | null;
  offKR?: number | null;
  defKR?: number | null;
  archetype?: string;
  secondaryArchetypes?: string[];
  confidence?: number | null;
  clusters?: Record<string, number>;
  bprAvg?: number | null;
  bprTrend?: number | null;
  scholarship?: {
    tier: string;
    scholarshipPct: number | null;
    scholarshipEquivalent: number | null;
    nilAmount: number | null;
    offFitPct: number | null;
    defFitPct: number | null;
    overallFitPct: number | null;
    needScarcity: string | null;
    scholarshipJustification: string | null;
    nilJustification: string | null;
    warnings: string[];
  };
}

export interface TeamSystem {
  offSystem: string | null;
  offSystemScore: number | null;
  defSystem: string | null;
  defSystemScore: number | null;
  pace100: number | null;
  paceBand: string | null;
}

export interface SearchFilters {
  query?: string;
  level?: string | string[];
  position?: string | string[];
  conference?: string;
  minHeight?: number; // inches
  maxHeight?: number;
  hasPortalEntry?: boolean;
  sortBy?: 'ppg' | 'rpg' | 'apg' | 'name' | 'height';
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// =============================================================================
// DATA LOADING
// =============================================================================

const data = rawData as {
  players: NationalPlayer[];
  teamSystems: Record<string, TeamSystem>;
  counts: {
    players: number;
    withKR: number;
    withStats: number;
    withScholarship: number;
    teamSystems: number;
  };
};

// Index by ID for O(1) lookup
const playerIndex = new Map<string, NationalPlayer>();
for (const p of data.players) {
  playerIndex.set(p.id, p);
}

// Index by school for team roster lookups
const schoolIndex = new Map<string, NationalPlayer[]>();
for (const p of data.players) {
  if (p.school) {
    const key = p.school.toLowerCase();
    if (!schoolIndex.has(key)) schoolIndex.set(key, []);
    schoolIndex.get(key)!.push(p);
  }
}

// Collect unique values for filters
const _conferences = new Set<string>();
const _levels = new Set<string>();
for (const p of data.players) {
  if (p.conference) _conferences.add(p.conference);
  if (p.levelKey) _levels.add(p.levelKey);
}

// =============================================================================
// FILTER HELPER
// =============================================================================

function filterPlayers(players: NationalPlayer[], filters: SearchFilters): NationalPlayer[] {
  let results = players;

  // Text search
  if (filters.query && filters.query.length > 0) {
    const q = filters.query.toLowerCase();
    results = results.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.school.toLowerCase().includes(q) ||
      p.conference.toLowerCase().includes(q)
    );
  }

  // Level filter
  if (filters.level) {
    const levels = Array.isArray(filters.level) ? filters.level : [filters.level];
    results = results.filter(p => levels.includes(p.levelKey));
  }

  // Position filter
  if (filters.position) {
    const positions = Array.isArray(filters.position) ? filters.position : [filters.position];
    results = results.filter(p => positions.includes(p.position));
  }

  // Conference filter
  if (filters.conference) {
    const conf = filters.conference.toLowerCase();
    results = results.filter(p => p.conference.toLowerCase().includes(conf));
  }

  // Height range (inches)
  if (filters.minHeight != null) {
    results = results.filter(p => p.heightInches != null && p.heightInches >= filters.minHeight!);
  }
  if (filters.maxHeight != null) {
    results = results.filter(p => p.heightInches != null && p.heightInches <= filters.maxHeight!);
  }

  // Portal entry
  if (filters.hasPortalEntry) {
    results = results.filter(p => p.portalEntryDate != null);
  }

  return results;
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

export const nationalPool = {
  /** Total counts */
  get counts() { return data.counts; },

  /** Get all players (use sparingly — 38K+ records) */
  getAll(): NationalPlayer[] {
    return data.players;
  },

  /** Get player by ID */
  getById(id: string): NationalPlayer | undefined {
    return playerIndex.get(id);
  },

  /** Get team roster by school name */
  getTeamRoster(school: string): NationalPlayer[] {
    return schoolIndex.get(school.toLowerCase()) ?? [];
  },

  /** Get team system identity */
  getTeamSystem(teamName: string): TeamSystem | undefined {
    return data.teamSystems[teamName];
  },

  /** Get unique conferences for filter UI */
  getConferences(): string[] {
    return Array.from(_conferences).sort();
  },

  /** Get unique levels for filter UI */
  getLevels(): string[] {
    return Array.from(_levels).sort();
  },

  /**
   * Count players matching filters (without pagination).
   * Use for result count headers: nationalPool.count({ query, level, position })
   */
  count(filters: Omit<SearchFilters, 'sortBy' | 'sortDir' | 'limit' | 'offset'> = {}): number {
    return filterPlayers(data.players, filters).length;
  },

  /**
   * Search and filter players.
   * All filters are optional and combine with AND logic.
   */
  search(filters: SearchFilters = {}): NationalPlayer[] {
    let results = filterPlayers(data.players, filters);

    // Sort
    const sortBy  = filters.sortBy  ?? 'ppg';
    const sortDir = filters.sortDir ?? 'desc';
    const mult    = sortDir === 'asc' ? 1 : -1;

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'ppg':    return mult * ((a.ppg ?? 0) - (b.ppg ?? 0));
        case 'rpg':    return mult * ((a.rpg ?? 0) - (b.rpg ?? 0));
        case 'apg':    return mult * ((a.apg ?? 0) - (b.apg ?? 0));
        case 'height': return mult * ((a.heightInches ?? 0) - (b.heightInches ?? 0));
        case 'name':   return mult * a.fullName.localeCompare(b.fullName);
        default:       return 0;
      }
    });

    // Pagination
    if (filters.offset) results = results.slice(filters.offset);
    if (filters.limit)  results = results.slice(0, filters.limit);

    return results;
  },

  /**
   * Nexus-friendly search: returns formatted text results.
   * Used when Nexus needs to present player data in chat.
   */
  nexusSearch(query: string, filters: SearchFilters = {}): string {
    const results = nationalPool.search({ ...filters, query, limit: 20 });
    if (results.length === 0) return 'No players found matching your criteria.';

    const lines = results.map((p, i) => {
      const stats = p.ppg != null
        ? `${p.ppg.toFixed(1)}/${p.rpg?.toFixed(1) ?? '-'}/${p.apg?.toFixed(1) ?? '-'}`
        : 'No stats';
      return `${i + 1}. ${p.fullName} · ${p.position} · ${p.height} · ${p.school} (${p.levelDisplay}) · ${stats} PPG/RPG/APG`;
    });

    return `Found ${results.length} player${results.length > 1 ? 's' : ''}:\n${lines.join('\n')}`;
  },
};

// =============================================================================
// EVAL FORMATTER
// =============================================================================

/**
 * Format a player's stats for injection into a Claude system prompt.
 * Claude then computes KR live via SKILL.md + V1 Protocol.
 */
export function formatForEval(p: NationalPlayer): string {
  const pct = (v: number | null) => {
    if (v == null) return '-';
    // Values < 1.0 are stored as fractions (0.456 → 45.6%)
    const display = v < 1.0 ? v * 100 : v;
    return `${display.toFixed(1)}%`;
  };
  const n = (v: number | null, d = 1) => v != null ? v.toFixed(d) : '-';

  return [
    `## PLAYER DATA FOR EVALUATION (National Pool)`,
    `**${p.fullName} · ${p.position} · ${p.height}${p.weight ? ` · ${p.weight} lbs` : ''}**`,
    `**${p.school}** | **${p.levelDisplay}** | **${p.conference || 'Unknown conf.'}**`,
    `**Class:** ${p.classYear}${p.portalEntryDate ? ` | **Portal Entry:** ${p.portalEntryDate}` : ''}`,
    ``,
    `Season Stats:`,
    `GP ${n(p.gp, 0)} / GS ${n(p.gs, 0)} / MPG ${n(p.mpg)}`,
    `PPG ${n(p.ppg)} / FG% ${pct(p.fgPct)} / 3P% ${pct(p.threePct)} / FT% ${pct(p.ftPct)}`,
    `RPG ${n(p.rpg)} (Off ${n(p.orebPg)} / Def ${n(p.drebPg)}) / APG ${n(p.apg)} / SPG ${n(p.spg)} / BPG ${n(p.bpg)} / TOPG ${n(p.topg)}`,
    `Usage Rate: ${n(p.usageRate)}`,
  ].join('\n');
}

// =============================================================================
// GLOBAL PLAYER CARD ADAPTER
// =============================================================================

/** Convert a NationalPlayer to the global entity sheet PlayerCardData format */
export function toGlobalPlayerCard(p: NationalPlayer): GlobalPlayerCardData {
  return {
    name:            p.fullName,
    number:          p.jerseyNumber,
    position:        p.position,
    height:          p.height,
    weight:          p.weight ?? 0,
    classYear:       p.classYear,
    hometown:        [p.city, p.state].filter(Boolean).join(', ') || undefined,
    previousSchool:  p.highSchool || undefined,
    ppg:             p.ppg ?? undefined,
    rpg:             p.rpg ?? undefined,
    apg:             p.apg ?? undefined,
    playerId:        p.id,
    school:          p.school,
    conference:      p.conference,
    levelKey:        p.levelKey,
    levelDisplay:    p.levelDisplay,
    spg:             p.spg ?? undefined,
    bpg:             p.bpg ?? undefined,
    topg:            p.topg ?? undefined,
    fgPct:           p.fgPct ?? undefined,
    threePct:        p.threePct ?? undefined,
    ftPct:           p.ftPct ?? undefined,
    mpg:             p.mpg ?? undefined,
    gp:              p.gp ?? undefined,
    portalEntryDate: p.portalEntryDate,
  };
}

export default nationalPool;
