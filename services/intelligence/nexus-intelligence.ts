/**
 * Nexus Intelligence — System Prompt Builder
 *
 * Builds a minimal cached system prompt: SKILL_MD + TOOLS_INSTRUCTION (~2K tokens).
 * All protocol files (FILE_01, legends, reference data) are fetched by Claude
 * on-demand via corpus tools — no pre-loading.
 *
 * Per-query dynamic content: validated calibration profiles (Laolu, Lincoln).
 */

import {
  SKILL_MD,
  TEST_CASE_LAOLU, TEST_CASE_LINCOLN,
} from './corpus';
import { DATA_ROOM_KB } from './corpus-dataroom';

// ── Validated Profile Detection ──────────────────────────────────────────────
// When a query mentions a player or team we have a validated eval for, inject
// that profile so Claude can reference the locked calibration data directly.

interface ValidatedProfile {
  keywords: RegExp;
  content:  string;
  label:    string;
}

const VALIDATED_PROFILES: ValidatedProfile[] = [
  {
    keywords: /\blaolu\b|\bkalejaiye\b/i,
    content:  TEST_CASE_LAOLU,
    label:    'VALIDATED PLAYER PROFILE — Laolu Kalejaiye',
  },
  {
    keywords: /\blincoln\s*university\b|\blincoln\s*oakland\b|\blu\s*oakland\b/i,
    content:  TEST_CASE_LINCOLN,
    label:    'VALIDATED TEAM EVAL — Lincoln University Oakland 2025-26',
  },
];

function getValidatedProfiles(msg: string): string {
  return VALIDATED_PROFILES
    .filter(p => p.keywords.test(msg))
    .map(p => `## ${p.label}\n\n${p.content}`)
    .join('\n\n---\n\n');
}

// ── System Prompt Builder ────────────────────────────────────────────────────

/**
 * Static content: SKILL_MD + TOOLS_INSTRUCTION only (~2K tokens, always cached).
 * FILE_01, KR legends, and reference data are fetched by Claude on-demand via corpus tools.
 *
 * Dynamic content: validated calibration profiles (Laolu, Lincoln) — per-query, not cached.
 */
export interface SystemPromptParts {
  staticContent:  string;  // cacheable
  dynamicContent: string;  // not cacheable (may be empty)
}

const TOOLS_INSTRUCTION = `## TOOLS

You have access to:

### Player Pool (search_players, get_team_roster, get_player_details)
37,000+ college basketball players, 2025-26 season stats. PRIMARY source for any player or team query. Always check here first.

### Intelligence Framework
- **get_eval_protocol** — V1 Player Evaluation Protocol. Call this when evaluating any player.
- **get_legend** — KR Legend for a specific competitive level. Call this to calibrate KR scores.
- **get_team_intelligence** — Team KR pipeline, OSIE/DSIE, scholarship/NIL engine.
- **get_simulation** — System×system and archetype×system interaction tables for matchup analysis.
- **get_scouting** — Pregame scout, in-game ops, halftime/postgame packets.
- **get_downstream** — Development roadmap, pro transition, coaching impact engine.
- **get_reference** — Trait bands, archetype gates, KLVN tables, position weights (File 02).

### App Data (get_schedule, get_team_stats, get_calendar_events, get_kaypay_info, get_hub_analytics)
Live data from the KaNeXT app — team schedule, roster stats, calendar agenda, payments, analytics.

### Web Search (web_search)
For information not in the pool: current game results, portal news, historical stats, missing height/weight. Always cite sources.`;

export function buildIntelligenceSystemPrompt(msg: string): SystemPromptParts {
  // Static — same for every basketball query; small and cheaply cacheable (~2K tokens)
  const staticContent = [SKILL_MD, TOOLS_INSTRUCTION].join('\n\n---\n\n');

  // Dynamic — validated calibration profiles only (Laolu / Lincoln)
  const dynamicParts: string[] = [];
  const validatedData = getValidatedProfiles(msg);
  if (validatedData) dynamicParts.push(validatedData);

  return {
    staticContent,
    dynamicContent: dynamicParts.join('\n\n---\n\n'),
  };
}

// ── Data Room Intelligence ────────────────────────────────────────────────────

/**
 * Detects investor / business queries that should route to the data room KB.
 * Covers: fund terms, revenue model, valuation, IOA, mandate, acquisitions,
 * regulatory (SACSCOC/Title IV), FMU, governance, brand architecture, etc.
 */
const DATA_ROOM_PATTERNS =
  /\b(invest|revenue|valuat|fund(?:ing)?|capital|term[\s-]?sheet|IOA|mandate|enrollment|tuition|operat\w*[\s-]?budget|acquisition|bank[\s-]?charter|SACSCOC|accredit|FMU|Florida[\s-]?Memorial|governance|asset[\s-]?coverage|cap[\s-]?table|return\b|LP\b|data[\s-]?room|competitive|market[\s-]?size|title[\s-]?IV|institution\w*|brand[\s-]?archit|KayTV|KayPay|KayStudios|KayVision|campus[\s-]?land|founder|ARR\b|AUM\b|GMP\b|EFC\b|deploy\w*|commerciali\w*|data[\s-]?rights|privacy[\s-]?compli|intelligence[\s-]?commerc|fulfillment|VoIP|fanbase|NIL[\s-]?platform)\b/i;

export function isDataRoomQuery(msg: string): boolean {
  return DATA_ROOM_PATTERNS.test(msg);
}

const DATA_ROOM_HEADER =
  `You are Nexus, KaNeXT's AI assistant with full access to the KaNeXT investor data room. ` +
  `Answer investor and business questions accurately, citing specific documents when relevant. ` +
  `Be direct, precise, and concise. Do not speculate beyond what the data room documents state.`;

/**
 * Builds the system prompt for data room / investor queries.
 * Static block only — the full KB is the cache target (large, static, ideal for caching).
 */
export function buildDataRoomSystemPrompt(): SystemPromptParts {
  return {
    staticContent:  [DATA_ROOM_HEADER, DATA_ROOM_KB].join('\n\n---\n\n'),
    dynamicContent: '',
  };
}
