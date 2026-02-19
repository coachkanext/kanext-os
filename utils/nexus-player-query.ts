/**
 * Nexus Player Query Preprocessor
 *
 * Detects player-related queries in user messages and enriches
 * the GPT context with real data from the national player pool.
 * This runs BEFORE sending to GPT so the model has real data to reason about.
 */

import { nationalPool, type NationalPlayer, type SearchFilters } from '@/data/national-pool';
import {
  getKRColor,
  getKRTierLabel,
  getArchetypeDisplay,
  LEVEL_DISPLAY_SHORT,
  CLUSTER_LABELS,
  CLUSTER_ORDER,
} from '@/utils/kr-display';

// =============================================================================
// DETECTION — Is this a player/recruiting/scouting query?
// =============================================================================

const PLAYER_KEYWORDS = [
  'player', 'recruit', 'prospect', 'transfer', 'portal',
  'roster', 'scout', 'scouting', 'evaluate', 'evaluation',
  'kr', 'rating', 'ranked', 'ranking',
  'top', 'best', 'worst', 'highest', 'lowest',
  'archetype', 'badge', 'cluster',
  'scholarship', 'nil',
  'shooting', 'finishing', 'playmaking', 'defense', 'rebounding',
];

const POSITION_KEYWORDS = [
  'pg', 'sg', 'sf', 'pf', 'center',
  'guard', 'wing', 'forward', 'big',
  'point guard', 'shooting guard', 'small forward', 'power forward',
];

const LEVEL_KEYWORDS = [
  'naia', 'juco', 'njcaa', 'cccaa', 'd1', 'd2', 'd3',
  'division', 'ncaa', 'college',
];

const QUERY_PATTERNS = [
  /who (?:is|are) the/i,
  /show me/i,
  /find (?:me )?(?:a |the |some )?player/i,
  /search (?:for )?player/i,
  /look up/i,
  /compare/i,
  /tell me about/i,
  /what.+kr/i,
  /top \d+/i,
  /(?:best|highest|lowest|tallest|shortest).+(?:player|guard|wing|forward|big|center)/i,
  /how (?:good|tall|many) (?:is|are)/i,
];

export interface PlayerQueryResult {
  isPlayerQuery: boolean;
  contextBlock: string;
  playerCount: number;
}

/**
 * Detect whether a user message is about players/recruiting.
 * Returns false for clearly non-player queries.
 */
export function isPlayerRelatedQuery(text: string): boolean {
  const lower = text.toLowerCase();

  // Check query patterns
  for (const pattern of QUERY_PATTERNS) {
    if (pattern.test(lower)) return true;
  }

  // Check keyword density — need at least one player keyword + context
  let keywordHits = 0;
  for (const kw of PLAYER_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }
  for (const kw of POSITION_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }
  for (const kw of LEVEL_KEYWORDS) {
    if (lower.includes(kw)) keywordHits++;
  }

  return keywordHits >= 2;
}

// =============================================================================
// EXTRACTION — Pull search parameters from natural language
// =============================================================================

interface ExtractedFilters {
  query?: string;
  level?: string[];
  position?: string[];
  minKR?: number;
  limit?: number;
  sortBy?: SearchFilters['sortBy'];
  hasPortalEntry?: boolean;
}

function extractFilters(text: string): ExtractedFilters {
  const lower = text.toLowerCase();
  const filters: ExtractedFilters = {};

  // Level extraction
  const levels: string[] = [];
  if (/\bnaia\b/i.test(lower)) levels.push('naia');
  if (/\bnjcaa\s*d1\b|\bjuco\s*d1\b/i.test(lower)) levels.push('njcaa_d1');
  if (/\bnjcaa\s*d2\b|\bjuco\s*d2\b/i.test(lower)) levels.push('njcaa_d2');
  if (/\bnjcaa\s*d3\b|\bjuco\s*d3\b/i.test(lower)) levels.push('njcaa_d3');
  if (/\bcccaa\b|\b3c2a\b/i.test(lower)) levels.push('cccaa');
  if (levels.length > 0) filters.level = levels;

  // Position extraction
  const positions: string[] = [];
  if (/\bpg\b|\bpoint guard/i.test(lower)) positions.push('PG');
  if (/\bsg\b|\bshooting guard/i.test(lower)) positions.push('SG');
  if (/\bsf\b|\bsmall forward/i.test(lower)) positions.push('SF');
  if (/\bpf\b|\bpower forward/i.test(lower)) positions.push('PF');
  if (/\bcenter\b|\b\bc\b/i.test(lower) && /player|position|big/i.test(lower)) positions.push('C');
  if (/\bguard/i.test(lower) && !positions.length) { positions.push('PG'); positions.push('SG'); }
  if (/\bwing/i.test(lower) && !positions.length) positions.push('SF');
  if (/\bforward/i.test(lower) && !positions.length) positions.push('PF');
  if (/\bbig/i.test(lower) && !positions.length) positions.push('C');
  if (positions.length > 0) filters.position = positions;

  // KR threshold
  const krMatch = lower.match(/kr\s*(?:above|over|>=?|at least)\s*(\d+)/i);
  if (krMatch) filters.minKR = parseInt(krMatch[1], 10);
  if (/top\s*\d/i.test(lower)) filters.minKR = filters.minKR ?? 1; // exclude unrated

  // Limit
  const limitMatch = lower.match(/top\s+(\d+)/i);
  if (limitMatch) filters.limit = Math.min(parseInt(limitMatch[1], 10), 25);
  if (!filters.limit) filters.limit = 15; // default

  // Portal
  if (/portal|transfer/i.test(lower)) filters.hasPortalEntry = true;

  // Sort
  if (/tallest|height/i.test(lower)) filters.sortBy = 'height';
  else if (/scorer|ppg|point/i.test(lower)) filters.sortBy = 'ppg';
  else if (/rebound|rpg/i.test(lower)) filters.sortBy = 'rpg';
  else if (/assist|apg/i.test(lower)) filters.sortBy = 'apg';
  else filters.sortBy = 'kr';

  // Name search — extract quoted names or proper nouns
  const nameMatch = text.match(/"([^"]+)"|'([^']+)'/);
  if (nameMatch) {
    filters.query = nameMatch[1] || nameMatch[2];
  } else {
    // Try to detect a school or player name (capitalized words not in keyword lists)
    const words = text.split(/\s+/);
    const possibleNames = words.filter((w) => {
      const wl = w.toLowerCase().replace(/[^a-z]/g, '');
      return w.length > 2 &&
        w[0] === w[0].toUpperCase() &&
        !PLAYER_KEYWORDS.includes(wl) &&
        !POSITION_KEYWORDS.includes(wl) &&
        !LEVEL_KEYWORDS.includes(wl) &&
        !['the', 'who', 'are', 'what', 'how', 'top', 'best', 'find', 'show', 'tell', 'about', 'from', 'with'].includes(wl);
    });
    if (possibleNames.length > 0 && possibleNames.length <= 4) {
      filters.query = possibleNames.join(' ');
    }
  }

  return filters;
}

// =============================================================================
// FORMATTING — Build context block for GPT
// =============================================================================

function formatPlayerForGPT(p: NationalPlayer, rank: number): string {
  const kr = p.kr != null ? `KR ${Math.round(p.kr)}` : 'Unrated';
  const tier = p.kr != null ? getKRTierLabel(p.kr, p.levelKey) : '';
  const arch = getArchetypeDisplay(p.archetype);
  const level = LEVEL_DISPLAY_SHORT[p.levelKey] ?? p.levelKey;
  const stats = p.ppg != null
    ? `${p.ppg.toFixed(1)}/${p.rpg?.toFixed(1) ?? '0.0'}/${p.apg?.toFixed(1) ?? '0.0'} PPG/RPG/APG`
    : 'No stats';
  const portal = p.portalEntryDate ? ` [PORTAL: ${p.portalEntryDate}]` : '';
  const clusters = p.clusters
    ? CLUSTER_ORDER.map((k) => {
        const score = (p.clusters as any)[k];
        return score != null ? `${CLUSTER_LABELS[k]?.label ?? k}: ${Math.round(score)}` : null;
      }).filter(Boolean).join(', ')
    : '';
  const scholarshipInfo = p.scholarship
    ? ` | Scholarship: ${p.scholarship.scholarshipPct ?? 0}%, NIL: $${(p.scholarship.nilAmount ?? 0).toLocaleString()}, Fit: ${p.scholarship.overallFitPct ?? 0}%`
    : '';

  let line = `${rank}. ${p.fullName} · ${p.position} · ${p.height}${p.weight ? ` / ${p.weight}lbs` : ''} · ${p.classYear} · ${p.school} (${level})`;
  line += ` · ${kr}${tier ? ` (${tier})` : ''} · ${arch} · ${stats}${portal}`;
  if (clusters) line += `\n   Clusters: ${clusters}`;
  if (scholarshipInfo) line += `\n   ${scholarshipInfo}`;

  return line;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Process a user message for player-related content.
 * Returns enriched context to inject into the GPT system prompt.
 */
export function processPlayerQuery(userMessage: string): PlayerQueryResult {
  if (!isPlayerRelatedQuery(userMessage)) {
    return { isPlayerQuery: false, contextBlock: '', playerCount: 0 };
  }

  const filters = extractFilters(userMessage);

  const results = nationalPool.search({
    query: filters.query,
    level: filters.level,
    position: filters.position,
    minKR: filters.minKR,
    hasPortalEntry: filters.hasPortalEntry,
    sortBy: filters.sortBy ?? 'kr',
    sortDir: filters.sortBy === 'name' ? 'asc' : 'desc',
    limit: filters.limit ?? 15,
  });

  if (results.length === 0) {
    return {
      isPlayerQuery: true,
      contextBlock: '\n[PLAYER DATA] No players found matching the query. The database contains ' +
        `${nationalPool.counts.players.toLocaleString()} players across ${nationalPool.getLevels().length} competitive levels ` +
        `(${nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}). ` +
        `${nationalPool.counts.withKR.toLocaleString()} have computed KR ratings.`,
      playerCount: 0,
    };
  }

  // Total matching (without limit)
  const totalMatching = nationalPool.search({
    query: filters.query,
    level: filters.level,
    position: filters.position,
    minKR: filters.minKR,
    hasPortalEntry: filters.hasPortalEntry,
  }).length;

  const lines = results.map((p, i) => formatPlayerForGPT(p, i + 1));

  const filterDesc = [
    filters.level ? `Level: ${filters.level.map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}` : null,
    filters.position ? `Position: ${filters.position.join(', ')}` : null,
    filters.minKR ? `Min KR: ${filters.minKR}` : null,
    filters.hasPortalEntry ? 'Portal entries only' : null,
    filters.query ? `Search: "${filters.query}"` : null,
  ].filter(Boolean).join(' | ');

  const contextBlock = [
    `\n[PLAYER DATA] Found ${totalMatching} players${filterDesc ? ` (${filterDesc})` : ''}. Showing top ${results.length}:`,
    ...lines,
    totalMatching > results.length ? `\n... and ${totalMatching - results.length} more matching players.` : '',
    `\nDatabase: ${nationalPool.counts.players.toLocaleString()} total players, ${nationalPool.counts.withKR.toLocaleString()} with KR, across ${nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ')}.`,
  ].join('\n');

  return {
    isPlayerQuery: true,
    contextBlock,
    playerCount: results.length,
  };
}

/**
 * Build the national pool awareness section for the system prompt.
 * This is always included in sports mode so Nexus knows it can answer player questions.
 */
export function buildPoolAwarenessPrompt(): string {
  const counts = nationalPool.counts;
  const levels = nationalPool.getLevels().map(l => LEVEL_DISPLAY_SHORT[l] ?? l).join(', ');

  return [
    `\n## National Player Pool Intelligence`,
    `You have access to a real national player database with ${counts.players.toLocaleString()} players across these levels: ${levels}.`,
    `- ${counts.withKR.toLocaleString()} players have computed KaNeXT Ratings (KR, 0-100 scale)`,
    `- ${counts.withStats.toLocaleString()} have season statistics`,
    `- ${counts.withScholarship.toLocaleString()} have scholarship & NIL allocation recommendations`,
    `- ${counts.teamSystems} teams have OSIE/DSIE system identity profiles`,
    ``,
    `KR is level-aware — the same score means different things at different levels. Always reference the player's level when discussing KR.`,
    `Each player has 7 cluster scores (Shooting, Finishing, Playmaking, Perimeter D, Interior D, Rebounding, Physical) and a primary archetype.`,
    ``,
    `When the user asks about players, real data will be provided in [PLAYER DATA] blocks. Use this data to give specific, data-driven answers.`,
    `If no [PLAYER DATA] block is present, you can still discuss player evaluation concepts, KR methodology, or suggest queries.`,
    ``,
    `When referencing specific players, use [LINK:player:ID:Name] format for tappable links (e.g. [LINK:player:abc123:John Smith]).`,
  ].join('\n');
}
