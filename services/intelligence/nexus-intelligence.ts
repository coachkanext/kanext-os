/**
 * Nexus Intelligence — System Prompt Builder
 *
 * Assembles the Claude system prompt from the intelligence corpus without
 * running any TypeScript evaluation engine. Claude reads the files and
 * reasons through the protocol directly — the same way it works in Claude Projects.
 *
 * Token budget:
 *   Player eval (specific level):       SKILL + File 01 + 1 legend  ≈ 11.5K tokens
 *   Player eval (unknown level):        SKILL + File 01 + 7 common  ≈ 17.7K tokens
 *   General basketball:                 SKILL + 7 legends            ≈ 8.5K tokens
 *   + validated profile (Laolu/Lincoln): +3.7K or +4.3K tokens
 *
 * Keeps each request well under the 30K TPM org limit.
 */

import {
  SKILL_MD, FILE_01,
  LEGEND_NCAA_D1_HM, LEGEND_NCAA_D1_MM, LEGEND_NCAA_D1_LM,
  LEGEND_NCAA_D2, LEGEND_NAIA, LEGEND_NCCAA_D1, LEGEND_USCAA,
  LEVEL_LEGENDS,
  TEST_CASE_LAOLU, TEST_CASE_LINCOLN,
} from './corpus';
import { nationalPool, formatForEval } from '@/data/national-pool';

// ── Common-level fallback when the level is not detectable ───────────────────
// 7 levels covering the most frequent evaluation contexts, including NCCAA/USCAA
// which appear often in validated test cases. ~7K tokens total.
const COMMON_LEGENDS =
  LEGEND_NCAA_D1_HM + '\n\n---\n\n' +
  LEGEND_NCAA_D1_MM + '\n\n---\n\n' +
  LEGEND_NCAA_D1_LM + '\n\n---\n\n' +
  LEGEND_NCAA_D2    + '\n\n---\n\n' +
  LEGEND_NAIA       + '\n\n---\n\n' +
  LEGEND_NCCAA_D1   + '\n\n---\n\n' +
  LEGEND_USCAA;

// ── Level Detection ──────────────────────────────────────────────────────────

export function detectLevel(msg: string): string | null {
  const m = msg.toLowerCase();

  // NCAA D1 sub-class
  if (/\bhigh[\s-]?major\b|\bhm\b|power\s?5\b|big\s?(ten|east|12|sec)\b/.test(m))
    return 'ncaa_d1_high_major';
  if (/\blow[\s-]?major\b|\blm\b|big\s?(south|sky|west)\b|\bswac\b|\bmeac\b|\bnec\b/.test(m))
    return 'ncaa_d1_low_major';
  if (/\bmid[\s-]?major\b|\bmm\b|\baac\b|\ba-?10\b|mountain\s?west|wcc\b|mvc\b/.test(m))
    return 'ncaa_d1_mid_major';

  // Other NCAA
  if (/\bncaa\s*d2\b|\bdivision[\s-]?ii\b/.test(m)) return 'ncaa_d2';
  if (/\bncaa\s*d3\b|\bdivision[\s-]?iii\b/.test(m)) return 'ncaa_d3';

  // NJCAA / JUCO
  if (/\bnjcaa\s*d1\b|\bjuco\s*d1\b/.test(m)) return 'njcaa_d1';
  if (/\bnjcaa\s*d2\b|\bjuco\s*d2\b/.test(m)) return 'njcaa_d2';
  if (/\bnjcaa\s*d3\b|\bjuco\s*d3\b/.test(m)) return 'njcaa_d3';
  if (/\b(njcaa|juco)\b/.test(m)) return 'njcaa_d1';

  // NCCAA / USCAA
  if (/\bnccaa\s*d1\b/.test(m)) return 'nccaa_d1';
  if (/\bnccaa\s*d2\b/.test(m)) return 'nccaa_d2';
  if (/\bnccaa\b/.test(m))      return 'nccaa_d1';
  if (/\buscaa\b/.test(m))      return 'uscaa';

  // NAIA / CCCAA
  if (/\bnaia\b/.test(m))  return 'naia';
  if (/\bcccaa\b/.test(m)) return 'cccaa';

  // School-name shortcuts (calibrated programs in the legends)
  // D1 Low-Major programs
  if (/\bhigh\s*point\b|\bweber\s*state\b|\blong\s*beach\s*state\b|\blbsu\b|\buc\s*irvine\b|\buci\b/.test(m))
    return 'ncaa_d1_low_major';
  // D1 Mid-Major programs
  if (/\bpepperdine\b|\bsaint\s*mary'?s\b|\bsant\s*mary\b|\bsdsu\b|\bsan\s*diego\s*state\b|\bmemphis\b/.test(m))
    return 'ncaa_d1_mid_major';
  // D1 High-Major programs
  if (/\bkansas\b|\bariz(?:ona)?\b|\bflorida\b|\bmichiganb|\barkansas\b|\bkentucky\b|\blouisville\b|\bduke\b|\bnorth\s*carolina\b|\bunc\b/.test(m))
    return 'ncaa_d1_high_major';

  return null;
}

// ── Query-type Detection ─────────────────────────────────────────────────────
// File 01 (the eval process, 37K chars / ~9K tokens) is only included when
// the query is clearly a player or team evaluation. For legend lookups, general
// basketball questions, or scouting/simulation queries, skip File 01.

function isEvalQuery(msg: string): boolean {
  // Explicit eval keywords
  if (/\bevaluat|\bcontextual\s+mode|\bkr\s+for\b|phase\s+[36]\b|v1\s+protocol/i.test(msg)) return true;
  // "rate / how good is"
  if (/\brate\s+(a\s+|this\s+)?\w|\bhow\s+good\s+is\b/i.test(msg)) return true;
  // "what is/what's X's KR" — but NOT "what is KR 84" / "KR of 89" (legend lookups)
  const isLegendLookup = /\bkr\s*(of\s*)?\d{2,3}\b/i.test(msg);
  if (!isLegendLookup && /\b(what'?s?|get|find)\s+.{0,40}\bkr\b/i.test(msg)) return true;
  return false;
}

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

// ── Pool Player Data Injection ────────────────────────────────────────────────
// When a user asks to evaluate a specific player, look them up in the national
// pool and inject their real stats so Claude computes KR live via SKILL.md.

/**
 * Extract a proper name from eval queries like:
 *   "evaluate Marcus Thompson"
 *   "what's the KR for Jordan Wells"
 *   "rate John Smith from Kentucky"
 */
function extractPlayerName(msg: string): string | null {
  // Helper: reject names that don't start with a capital letter (filters "the top players", "a player", etc.)
  const cap = (s: string | undefined) => (s && /^[A-Z]/.test(s) ? s : null);

  // "evaluate/eval/rate/assess/grade/scout <Name>" — keyword case-insensitive, name must be capitalized
  const m1 = msg.match(
    /(?:evaluate|eval|rate|assess|grade|scout)\s+([A-Z][a-z]+(?:\s+[A-Za-z'-]+)+)/i
  );
  if (m1) { const n = cap(m1[1]); if (n) return n; }

  // "KR for/of <Name>"
  const m2 = msg.match(/\bkr\s+(?:for|of)\s+([A-Z][a-z]+(?:\s+[A-Za-z'-]+)+)/i);
  if (m2) { const n = cap(m2[1]); if (n) return n; }

  // "what('s| is) <Name>'s KR"
  const m3 = msg.match(/\bwhat'?s?\s+([A-Z][a-z]+(?:\s+[A-Za-z'-]+)+)'s?\s+KR/i);
  if (m3) { const n = cap(m3[1]); if (n) return n; }

  // "<Name> from <School>" — player mentioned before school context
  const m4 = msg.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+from\s+[A-Z]/);
  if (m4) return m4[1];

  return null;
}

/** Look up a player in the national pool and return formatted stats for eval. */
function getPoolPlayerData(msg: string): string {
  const name = extractPlayerName(msg);
  if (!name) return '';
  const results = nationalPool.search({ query: name, limit: 1 });
  if (results.length === 0) return '';
  return formatForEval(results[0]);
}

// ── System Prompt Builder ────────────────────────────────────────────────────

/**
 * Static content: SKILL_MD + FILE_01 (eval only) + KR LEGENDS.
 * Identical across queries of the same type — safe to cache via Anthropic
 * prompt caching (cache_control: { type: "ephemeral" }, 5-min TTL).
 *
 * Dynamic content: pool player data + validated profiles.
 * Changes per query — must NOT be cached.
 */
export interface SystemPromptParts {
  staticContent:  string;  // cacheable
  dynamicContent: string;  // not cacheable (may be empty)
}

export function buildIntelligenceSystemPrompt(msg: string): SystemPromptParts {
  const levelKey      = detectLevel(msg);
  const legendContent = levelKey ? (LEVEL_LEGENDS[levelKey] ?? COMMON_LEGENDS) : COMMON_LEGENDS;
  const includeFile01 = isEvalQuery(msg);

  // Static parts (cached across queries with identical config)
  const staticParts: string[] = [SKILL_MD];
  if (includeFile01) staticParts.push(FILE_01);
  staticParts.push('## KR LEGENDS\n\n' + legendContent);

  // Dynamic parts (per-query — player lookup, validated profiles)
  const dynamicParts: string[] = [];
  const validatedData = getValidatedProfiles(msg);
  if (validatedData) dynamicParts.push(validatedData);
  // +~250 tokens when player found; well under 30K TPM limit
  const poolData = includeFile01 ? getPoolPlayerData(msg) : '';
  if (poolData) dynamicParts.push(poolData);

  return {
    staticContent:  staticParts.join('\n\n---\n\n'),
    dynamicContent: dynamicParts.join('\n\n---\n\n'),
  };
}
