/**
 * Corpus Tools — Claude-callable handlers for the Intelligence Framework files.
 * These return markdown string content (protocol text, legends, reference sections)
 * so Claude can pull exactly what it needs instead of receiving everything upfront.
 *
 * FILE_01 (eval protocol) and all KR Legends are fully available.
 * FILE_02–06 are stubs until those files are added to the project.
 */

import { FILE_01, FILE_02, FILE_03, FILE_04, FILE_05, FILE_06, FILE_07, LEVEL_LEGENDS } from './corpus';

// ── Tool Definitions ──────────────────────────────────────────────────────────

export const CORPUS_TOOLS = [
  {
    name: 'get_eval_protocol',
    description: 'Player evaluation protocol (File 01). Use section="v1_protocol" for player evals.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: '"v1_protocol" (default), "coach_context", "confidence_gate", "execution_flow", "contextual_mode", "suppression", "multi_level", or "full"',
          default: 'v1_protocol',
        },
      },
    },
  },
  {
    name: 'get_reference',
    description: 'Reference data from File 02: trait bands, archetype gates, KLVN tables, system demand profiles, badges, position weights.',
    input_schema: {
      type: 'object',
      properties: {
        lookup: {
          type: 'string',
          description: 'What to look up, e.g. "trait Rim Pressure", "archetype Pick-and-Roll Operator", "KLVN table", "position weights PG"',
        },
      },
      required: ['lookup'],
    },
  },
  {
    name: 'get_legend',
    description: 'KR Legend for a competitive level — what each KR range means at that level.',
    input_schema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          description: '"ncaa_d1_hm", "ncaa_d1_mm", "ncaa_d1_lm", "ncaa_d2", "ncaa_d3", "naia", "njcaa_d1", "njcaa_d2", "njcaa_d3", "cccaa", "uscaa", or "all"',
        },
      },
      required: ['level'],
    },
  },
  {
    name: 'get_team_intelligence',
    description: 'Team intelligence protocol (File 03): Team KR Pipeline, OSIE/DSIE, Scholarship/NIL Engine, Roster Decision Intelligence.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: '"team_kr_pipeline", "osie", "dsie", "team_legends", "scholarship_nil", "roster_decision", or "full"',
          default: 'full',
        },
      },
    },
  },
  {
    name: 'get_simulation',
    description: 'Simulation engine (File 04): system×system tables, archetype×system interactions, possession math, mismatch modifiers.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: '"system_interactions", "archetype_interactions", "simulation_math", "mismatch_modifiers", or "full"',
          default: 'full',
        },
      },
    },
  },
  {
    name: 'get_scouting',
    description: 'Scouting & game ops (File 05): pregame scout, in-game ops, halftime/postgame packets.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: '"pregame", "ingame", "halftime", "postgame", "confidence_gates", or "full"',
          default: 'full',
        },
      },
    },
  },
  {
    name: 'get_downstream',
    description: 'Downstream engines (File 06): development roadmap, pro transition, draft projection, coaching impact.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: '"development", "pro_transition", "coaching_impact", or "full"',
          default: 'full',
        },
      },
    },
  },
  {
    name: 'get_pro_calibration',
    description: 'Pro KR Calibration Reference (File 07): 12 NBA players calibrated across 5 tiers. Component KRs, aging curves, system fit insights, key findings. Use for pro transition anchoring and calibration checks.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
];

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function handleCorpusTool(toolName: string, input: Record<string, unknown>): string {
  try {
    const section = typeof input.section === 'string' ? input.section : 'full';
    const lookup  = typeof input.lookup  === 'string' ? input.lookup  : '';
    const level   = typeof input.level   === 'string' ? input.level   : 'all';

    switch (toolName) {
      case 'get_eval_protocol':    return getEvalProtocol(section);
      case 'get_reference':        return getReference(lookup);
      case 'get_legend':           return getLegend(level);
      case 'get_team_intelligence': return getTeamIntelligence(section);
      case 'get_simulation':       return getSimulation(section);
      case 'get_scouting':         return getScouting(section);
      case 'get_downstream':       return getDownstream(section);
      case 'get_pro_calibration':  return FILE_07;
      default:
        return JSON.stringify({ error: `Unknown corpus tool: ${toolName}` });
    }
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────

// Max chars returned for 'full' requests — prevents blowing the 30K TPM limit.
// At ~4 chars/token, 32K chars ≈ 8K tokens, leaving room for pool data + tools.
const FILE_01_FULL_CAP = 32_000;

function getEvalProtocol(section: string): string {
  if (section === 'full' || !section) return FILE_01.slice(0, FILE_01_FULL_CAP);

  // Section-based extraction: split FILE_01 by major header lines and find matching section
  const sectionMap: Record<string, string[]> = {
    coach_context:   ['Coach Context', 'COACH CONTEXT'],
    confidence_gate: ['Confidence Gate', 'CONFIDENCE', 'Gate'],
    execution_flow:  ['Master Execution', 'Execution Flow', 'EXECUTION FLOW'],
    contextual_mode: ['Contextual Mode', 'CONTEXTUAL MODE'],
    suppression:     ['Suppression', 'SUPPRESSION'],
    multi_level:     ['Multi-Level', 'MULTI-LEVEL', 'Multi Level'],
    v1_protocol:     ['V1 Protocol', 'V1 PROTOCOL', '## V1'],
  };

  const keywords = sectionMap[section] ?? [];
  if (keywords.length === 0) return FILE_01;

  // v1_protocol gets a larger slice (the full V1 section); others get 6000 chars
  const sliceSize = section === 'v1_protocol' ? 12_000 : 6_000;

  for (const kw of keywords) {
    const idx = FILE_01.indexOf(kw);
    if (idx >= 0) {
      return FILE_01.slice(idx, idx + sliceSize);
    }
  }

  return FILE_01.slice(0, FILE_01_FULL_CAP); // capped fallback
}

// ── Section keyword → header text in FILE_02 ─────────────────────────────────
const FILE02_SECTIONS: Array<[string[], string]> = [
  [['trait library', 'trait cluster', 'shooting cluster', 'finishing cluster',
    'playmaking cluster', 'poa defense cluster', 'team defense cluster',
    'rebounding cluster', 'tools cluster', 'iq cluster'],   '# TRAIT LIBRARY'],
  [['archetype library', 'archetype gate'],                 '# ARCHETYPE LIBRARY'],
  [['system demand', 'system demands', 'offense demand', 'defense demand',
    'spread pick-and-roll demand', 'motion demand'],        '# SYSTEM DEMAND PROFILES'],
  [['badges', 'badge list', 'badge specs', 'badge gates',
    'shooting badge', 'finishing badge', 'playmaking badge',
    'defense badge', 'rebounding badge', 'tools badge'],    '# BADGES'],
  [['overrides', 'override rules'],                        '# OVERRIDES'],
  [['system risk', 'system risks'],                        '# SYSTEM RISKS'],
  [['impact modifier', 'impact modifiers'],                '# IMPACT MODIFIERS'],
  [['klvn', 'lambda', 'level normalization'],              '# KLVN'],
  [['college player kr legend', 'college legend', 'kr legend college'],
                                                            '# COLLEGE PLAYER KR LEGENDS'],
  [['pro player kr legend', 'pro legend', 'pro kr'],       '# PRO PLAYER KR LEGEND'],
  [['position weighting', 'position trait weight', 'position weights',
    'pg weight', 'sg weight', 'sf weight', 'pf weight', 'center weight',
    'point guard weight', 'shooting guard weight', 'power forward weight'],
                                                            'Position Weighting'],
  [['ui system set', 'system set', 'offensive system', 'defensive system',
    'system list'],                                         '# UI SYSTEM SET'],
];

const FILE02_MAX_CHARS = 8000;

function getReference(lookup: string): string {
  const lower = lookup.toLowerCase().trim();
  const lowerFile = FILE_02.toLowerCase();

  // 1. Check against known section keywords
  for (const [keywords, header] of FILE02_SECTIONS) {
    if (keywords.some(kw => lower.includes(kw))) {
      const idx = FILE_02.indexOf(header);
      if (idx >= 0) return sliceFile02(idx, lower);
    }
  }

  // 2. Try "definition-style" line-start match: e.g. "1) Rim Pressure" or just "Rim Pressure\n"
  const candidates: number[] = [];

  // Numbered list entries like "1) Rim Pressure" up to 60 items
  for (let n = 1; n <= 60; n++) {
    const pattern = `\n${n}) ${lower}`;
    const idx = lowerFile.indexOf(pattern);
    if (idx >= 0) { candidates.push(idx + 1); break; }
  }

  // Bare line start: "\nRim Pressure\n" or "\nRim Pressure "
  for (const suffix of ['\n', ' ', '—', ':']) {
    const pattern = `\n${lower}${suffix}`;
    const idx = lowerFile.indexOf(pattern);
    if (idx >= 0) { candidates.push(idx + 1); break; }
  }

  // 3. Fallback: first occurrence anywhere in the file
  const anyIdx = lowerFile.indexOf(lower);
  if (anyIdx >= 0) candidates.push(anyIdx);

  if (candidates.length > 0) {
    // Prefer earliest definition-style match (first in candidates array)
    return sliceFile02(candidates[0], lower);
  }

  return [
    `## File 02 — "${lookup}" not found`,
    '',
    'Available sections: Trait Library, Archetype Library, System Demand Profiles, Badges,',
    'Overrides, System Risks, Impact Modifiers, KLVN, Position Weighting,',
    'College Player KR Legends, Pro Player KR Legend, UI System Set',
    '',
    'For specific items, try: trait name (e.g. "Rim Pressure"), archetype name',
    '(e.g. "Pick-and-Roll Operator"), system name (e.g. "Spread Pick-and-Roll"),',
    'or badge name (e.g. "Spot-Up Sniper").',
  ].join('\n');
}

function sliceFile02(startIdx: number, lookup: string): string {
  const slice = FILE_02.slice(startIdx, startIdx + FILE02_MAX_CHARS);
  const remaining = FILE_02.length - startIdx - FILE02_MAX_CHARS;
  if (remaining > 0) {
    return (
      slice +
      `\n\n[... ${remaining.toLocaleString()} chars remaining in this section —` +
      ` call get_reference with a more specific term (e.g. a trait, archetype, or badge name) to go deeper ...]`
    );
  }
  return slice;
}

function getLegend(level: string): string {
  if (level === 'all') {
    const common = ['ncaa_d1_hm', 'ncaa_d1_mm', 'ncaa_d1_lm', 'ncaa_d2', 'naia', 'nccaa_d1', 'uscaa'];
    const parts = common.map(k => LEVEL_LEGENDS[k]).filter(Boolean);
    if (parts.length === 0) return 'Legend data not found.';
    return parts.join('\n\n---\n\n');
  }

  const legend = LEVEL_LEGENDS[level];
  if (legend) return legend;

  const available = Object.keys(LEVEL_LEGENDS).join(', ');
  return `Legend for level "${level}" not found.\nAvailable levels: ${available}`;
}

// ── Generic file-search helper (shared by all handlers) ──────────────────────

const MAX_CHARS = 8000;

function searchFile(file: string, searchTerm: string, toolName: string): string {
  const lower = searchTerm.toLowerCase().trim();
  const lowerFile = file.toLowerCase();

  const idx = lowerFile.indexOf(lower);
  if (idx < 0) {
    return `"${searchTerm}" not found in ${toolName} corpus. Try a different section or term.`;
  }

  const slice = file.slice(idx, idx + MAX_CHARS);
  const remaining = file.length - idx - MAX_CHARS;
  if (remaining > 0) {
    return slice + `\n\n[... ${remaining.toLocaleString()} more chars — use a more specific section name to narrow results ...]`;
  }
  return slice;
}

function sectionFromFile(
  file: string,
  sectionMap: Record<string, string>,
  sectionKey: string,
  toolName: string,
): string {
  const header = sectionMap[sectionKey];
  if (!header) {
    const available = Object.keys(sectionMap).join(', ');
    return `Unknown section "${sectionKey}" for ${toolName}.\nAvailable sections: ${available}`;
  }
  return searchFile(file, header, toolName);
}

// ── File 03 — Team Intelligence ───────────────────────────────────────────────

const FILE03_SECTIONS: Record<string, string> = {
  full:                   'Team KR Eval Order',
  team_kr_pipeline:       'Team KR — MATH',
  team_kr_math:           'Team KR — MATH',
  team_legends:           'Team KR Legend',
  osie:                   'System Inference Engine',
  dsie:                   'System Inference Engine',
  system_inference:       'System Inference Engine',
  global_database:        'Global Player + Team Database',
  scholarship_nil:        'SCHOLARSHIP CAPS',
  roster_decision:        'Roster Decision Intelligence',
};

function getTeamIntelligence(section: string): string {
  if (section === 'full') {
    const slice = FILE_03.slice(0, MAX_CHARS);
    return slice + `\n\n[... ${(FILE_03.length - MAX_CHARS).toLocaleString()} more chars — use section= one of: ${Object.keys(FILE03_SECTIONS).filter(k => k !== 'full').join(', ')} ...]`;
  }
  return sectionFromFile(FILE_03, FILE03_SECTIONS, section, 'get_team_intelligence');
}

// ── File 04 — Simulation Engine ───────────────────────────────────────────────

const FILE04_SECTIONS: Record<string, string> = {
  full:                      'Interaction Library',
  system_interactions:       'PART 1: SYSTEM × SYSTEM',
  archetype_interactions:    'PART 2: OFFENS',
  offense_archetype:         'PART 2: OFFENS',
  defense_archetype:         'PART 3: DEFEN',
  simulation_math:           'Simulation Engine — Master',
  mismatch_modifiers:        'Physical Mismatch Modifiers',
};

function getSimulation(section: string): string {
  if (section === 'full') {
    const slice = FILE_04.slice(0, MAX_CHARS);
    return slice + `\n\n[... ${(FILE_04.length - MAX_CHARS).toLocaleString()} more chars — use section= one of: ${Object.keys(FILE04_SECTIONS).filter(k => k !== 'full').join(', ')} ...]`;
  }
  // Allow free-text matchup lookups like "Spread Pick-and-Roll vs Switch Everything"
  if (section.toLowerCase().includes(' vs ')) {
    return searchFile(FILE_04, section, 'get_simulation');
  }
  return sectionFromFile(FILE_04, FILE04_SECTIONS, section, 'get_simulation');
}

// ── File 05 — Scouting & Game Ops ────────────────────────────────────────────

const FILE05_SECTIONS: Record<string, string> = {
  full:               'Scouting Confidence Gates',
  confidence_gates:   'Scouting Confidence Gates',
  pregame:            '1. Pregame Scout Packet',
  ingame:             '2. In-Game Live Ops',
  halftime:           '3. Halftime Staff Packet',
  postgame:           '4. Postgame Staff Packet',
};

function getScouting(section: string): string {
  // File 05 is small (~19K chars) — full returns more content
  if (section === 'full') {
    const slice = FILE_05.slice(0, MAX_CHARS * 2);
    const remaining = FILE_05.length - MAX_CHARS * 2;
    return remaining > 0
      ? slice + `\n\n[... ${remaining.toLocaleString()} more chars — sections: ${Object.keys(FILE05_SECTIONS).filter(k => k !== 'full').join(', ')} ...]`
      : FILE_05;
  }
  return sectionFromFile(FILE_05, FILE05_SECTIONS, section, 'get_scouting');
}

// ── File 06 — Downstream Engines ─────────────────────────────────────────────

const FILE06_SECTIONS: Record<string, string> = {
  full:               'Development Intelligence Engine',
  development:        'Development Intelligence Engine',
  pro_transition:     'Pro Transition Intelligence Engine',
  coaching_impact:    'Coaching Impact Modifier',
};

function getDownstream(section: string): string {
  if (section === 'full') {
    const slice = FILE_06.slice(0, MAX_CHARS);
    return slice + `\n\n[... ${(FILE_06.length - MAX_CHARS).toLocaleString()} more chars — use section= one of: ${Object.keys(FILE06_SECTIONS).filter(k => k !== 'full').join(', ')} ...]`;
  }
  return sectionFromFile(FILE_06, FILE06_SECTIONS, section, 'get_downstream');
}
