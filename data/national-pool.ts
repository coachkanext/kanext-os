/**
 * National Player Pool Data Adapter
 *
 * Loads the exported JSON from PostgreSQL and provides query functions
 * for the React Native UI. Drop-in replacement for mock data.
 *
 * Usage:
 *   import { nationalPool } from '@/data/national-pool';
 *   const results = nationalPool.search({ query: 'Bradley', level: 'naia' });
 *   const player = nationalPool.getById('some-uuid');
 */

import rawData from './national-pool.json';
import {
  getKRColor,
  getKRTierLabel,
  getArchetypeDisplay,
  CLUSTER_ORDER,
} from '@/utils/kr-display';
import { computePlayerBadges, type PlayerBadge } from '@/utils/player-badges';
import type { ClusterType } from '@/types';

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
  // KR
  kr: number | null;
  offKR: number | null;
  defKR: number | null;
  archetype: string;
  secondaryArchetypes: string[];
  confidence: number | null;
  // Clusters
  clusters: Record<string, number>;
  // Stats
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
  bprAvg: number | null;
  bprTrend: number | null;
  // Scholarship/NIL
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
  minKR?: number;
  maxKR?: number;
  minHeight?: number; // inches
  maxHeight?: number;
  archetype?: string;
  hasPortalEntry?: boolean;
  hasBadge?: string;     // badge name
  badgeLevel?: string;   // 'Gold' | 'Silver' | 'Bronze'
  sortBy?: 'kr' | 'ppg' | 'rpg' | 'apg' | 'name' | 'height';
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
// QUERY FUNCTIONS
// =============================================================================

export const nationalPool = {
  /** Total counts */
  get counts() { return data.counts; },

  /** Get all players (use sparingly — 9K+ records) */
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
   * Search and filter players.
   * All filters are optional and combine with AND logic.
   */
  search(filters: SearchFilters = {}): NationalPlayer[] {
    let results = data.players;

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

    // KR range
    if (filters.minKR != null) {
      results = results.filter(p => p.kr != null && p.kr >= filters.minKR!);
    }
    if (filters.maxKR != null) {
      results = results.filter(p => p.kr != null && p.kr <= filters.maxKR!);
    }

    // Height range (inches)
    if (filters.minHeight != null) {
      results = results.filter(p => p.heightInches != null && p.heightInches >= filters.minHeight!);
    }
    if (filters.maxHeight != null) {
      results = results.filter(p => p.heightInches != null && p.heightInches <= filters.maxHeight!);
    }

    // Archetype
    if (filters.archetype) {
      const arch = filters.archetype.toLowerCase();
      results = results.filter(p => p.archetype.toLowerCase().includes(arch));
    }

    // Portal entry
    if (filters.hasPortalEntry) {
      results = results.filter(p => p.portalEntryDate != null);
    }

    // Sort
    const sortBy = filters.sortBy ?? 'kr';
    const sortDir = filters.sortDir ?? 'desc';
    const mult = sortDir === 'asc' ? 1 : -1;

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'kr': return mult * ((a.kr ?? 0) - (b.kr ?? 0));
        case 'ppg': return mult * ((a.ppg ?? 0) - (b.ppg ?? 0));
        case 'rpg': return mult * ((a.rpg ?? 0) - (b.rpg ?? 0));
        case 'apg': return mult * ((a.apg ?? 0) - (b.apg ?? 0));
        case 'height': return mult * ((a.heightInches ?? 0) - (b.heightInches ?? 0));
        case 'name': return mult * a.fullName.localeCompare(b.fullName);
        default: return 0;
      }
    });

    // Pagination
    if (filters.offset) {
      results = results.slice(filters.offset);
    }
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  },

  /**
   * Get enriched player data with display-ready KR info.
   * Returns everything needed for the Player Card sheet.
   */
  getPlayerCard(id: string): PlayerCardData | undefined {
    const p = playerIndex.get(id);
    if (!p) return undefined;

    const clusters = p.clusters as Record<ClusterType, number>;

    // Compute badges from cluster scores
    const badges = computePlayerBadges(
      clusters as any,
      (clusterKey: string) => {
        // We don't have trait-level data yet (player_kr_traits is empty)
        // Return cluster score as a single "trait" for badge eligibility
        const score = clusters[clusterKey as ClusterType] ?? 50;
        return [{ name: clusterKey, rating: score }];
      },
    );

    return {
      ...p,
      krColor: getKRColor(p.kr),
      krTierLabel: getKRTierLabel(p.kr, p.levelKey),
      archetypeDisplay: getArchetypeDisplay(p.archetype),
      badges,
      clusterScores: CLUSTER_ORDER.map(key => ({
        key,
        score: clusters[key] ?? 50,
        color: getKRColor(clusters[key] ?? 50),
      })),
      statLine: buildStatLine(p),
    };
  },

  /**
   * Top N players by KR, optionally filtered by level.
   * For Nexus queries like "top 10 NAIA guards by KR".
   */
  topByKR(n: number, filters?: { level?: string; position?: string }): NationalPlayer[] {
    return nationalPool.search({
      ...filters,
      sortBy: 'kr',
      sortDir: 'desc',
      limit: n,
      minKR: 1, // exclude unrated
    });
  },

  /**
   * Nexus-friendly search: returns formatted text results.
   * Used when Nexus needs to present player data in chat.
   */
  nexusSearch(query: string, filters: SearchFilters = {}): string {
    const results = nationalPool.search({ ...filters, query, limit: 20 });
    if (results.length === 0) return 'No players found matching your criteria.';

    const lines = results.map((p, i) => {
      const kr = p.kr != null ? `KR ${Math.round(p.kr)}` : 'Unrated';
      const tier = p.kr != null ? getKRTierLabel(p.kr, p.levelKey) : '';
      const stats = p.ppg != null ? `${p.ppg.toFixed(1)}/${p.rpg?.toFixed(1)}/${p.apg?.toFixed(1)}` : 'No stats';
      const arch = getArchetypeDisplay(p.archetype);
      return `${i + 1}. ${p.fullName} · ${p.position} · ${p.height} · ${p.school} (${p.levelKey.replace(/_/g, ' ').toUpperCase()}) · ${kr} ${tier} · ${arch} · ${stats} PPG/RPG/APG`;
    });

    return `Found ${results.length} player${results.length > 1 ? 's' : ''}:\n${lines.join('\n')}`;
  },
};

// =============================================================================
// ENRICHED TYPES
// =============================================================================

export interface PlayerCardData extends NationalPlayer {
  krColor: string;
  krTierLabel: string;
  archetypeDisplay: string;
  badges: PlayerBadge[];
  clusterScores: { key: string; score: number; color: string }[];
  statLine: string;
}

function buildStatLine(p: NationalPlayer): string {
  const parts: string[] = [];
  if (p.ppg != null) parts.push(`${p.ppg.toFixed(1)} PPG`);
  if (p.rpg != null) parts.push(`${p.rpg.toFixed(1)} RPG`);
  if (p.apg != null) parts.push(`${p.apg.toFixed(1)} APG`);
  return parts.join(' / ') || 'No stats';
}

// =============================================================================
// GLOBAL PLAYER CARD ADAPTER
// =============================================================================

import type { PlayerCardData as GlobalPlayerCardData } from '@/utils/global-entity-sheets';

/** Convert a NationalPlayer to the global entity sheet PlayerCardData format */
export function toGlobalPlayerCard(p: NationalPlayer): GlobalPlayerCardData {
  return {
    name: p.fullName,
    number: p.jerseyNumber,
    position: p.position,
    height: p.height,
    weight: p.weight ?? 0,
    classYear: p.classYear,
    hometown: [p.city, p.state].filter(Boolean).join(', ') || undefined,
    previousSchool: p.highSchool || undefined,
    kr: p.kr ?? undefined,
    ppg: p.ppg ?? undefined,
    rpg: p.rpg ?? undefined,
    apg: p.apg ?? undefined,
    playerId: p.id,
    school: p.school,
    conference: p.conference,
    levelKey: p.levelKey,
    levelDisplay: p.levelDisplay,
    offKR: p.offKR ?? undefined,
    defKR: p.defKR ?? undefined,
    archetype: p.archetype,
    confidence: p.confidence ?? undefined,
    clusters: p.clusters,
    spg: p.spg ?? undefined,
    bpg: p.bpg ?? undefined,
    topg: p.topg ?? undefined,
    fgPct: p.fgPct ?? undefined,
    threePct: p.threePct ?? undefined,
    ftPct: p.ftPct ?? undefined,
    mpg: p.mpg ?? undefined,
    gp: p.gp ?? undefined,
    bprAvg: p.bprAvg ?? undefined,
    portalEntryDate: p.portalEntryDate,
    scholarshipPct: p.scholarship?.scholarshipPct ?? undefined,
    nilAmount: p.scholarship?.nilAmount ?? undefined,
    overallFitPct: p.scholarship?.overallFitPct ?? undefined,
  };
}

export default nationalPool;
