/**
 * Corpus Tools — Claude-callable handlers for the Intelligence Framework files.
 * These return markdown string content (protocol text, legends, reference sections)
 * so Claude can pull exactly what it needs instead of receiving everything upfront.
 *
 * FILE_01 (eval protocol) and all KR Legends are fully available.
 * FILE_02–06 are stubs until those files are added to the project.
 */

import { FILE_01, LEVEL_LEGENDS } from './corpus';

// ── Tool Definitions ──────────────────────────────────────────────────────────

export const CORPUS_TOOLS = [
  {
    name: 'get_eval_protocol',
    description:
      'Get the player evaluation protocol (V1 Protocol / File 01). Contains: Coach Context Setup, ' +
      'Player Profile template, Confidence Gate, Master Execution Flow, Contextual Mode, ' +
      'Suppression Detection, Multi-Level Protocol. Call this when evaluating a player.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description:
            'Optional — specific section to retrieve: "coach_context", "confidence_gate", ' +
            '"execution_flow", "contextual_mode", "suppression", "multi_level", "v1_protocol", ' +
            'or "full" for everything. Defaults to "full".',
          default: 'full',
        },
      },
    },
  },
  {
    name: 'get_reference',
    description:
      'Look up specific reference data from File 02: trait definitions and scoring bands, ' +
      'archetype gate rules, system demand profiles, badge specs, overrides, system risks, ' +
      'KLVN tables, position trait weighting. Use during evaluations to check specific bands.',
    input_schema: {
      type: 'object',
      properties: {
        lookup: {
          type: 'string',
          description:
            'What to look up. Examples: "trait Rim Pressure", "archetype Pick-and-Roll Operator", ' +
            '"system demand Spread Pick-and-Roll", "badge Sniper", "KLVN table", "position weights PG"',
        },
      },
      required: ['lookup'],
    },
  },
  {
    name: 'get_legend',
    description:
      'Get the KR Legend for a specific competitive level. Shows what each KR range means at that level. ' +
      'Use this to interpret KR scores and calibrate evaluations to the correct level.',
    input_schema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          description:
            'Level key: "ncaa_d1_hm", "ncaa_d1_mm", "ncaa_d1_lm", "ncaa_d2", "ncaa_d3", ' +
            '"naia", "njcaa_d1", "njcaa_d2", "njcaa_d3", "cccaa", "uscaa", "nccaa_d1", ' +
            '"nccaa_d2", or "all" for the 7 most common levels',
        },
      },
      required: ['level'],
    },
  },
  {
    name: 'get_team_intelligence',
    description:
      'Get team intelligence protocol (File 03). Contains: Team KR Pipeline, OSIE/DSIE system ' +
      'inference, Team KR Legends, Scholarship/NIL Allocation Engine, Roster Decision Intelligence. ' +
      'Pull this for team evaluations, roster analysis, or system identification.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description:
            'Optional: "team_kr_pipeline", "osie", "dsie", "team_legends", "scholarship_nil", ' +
            '"roster_decision", or "full"',
          default: 'full',
        },
      },
    },
  },
  {
    name: 'get_simulation',
    description:
      'Get simulation engine data (File 04). Contains: System×System interaction tables (120 entries), ' +
      'Archetype×System interactions (462 entries), possession simulation math, physical mismatch modifiers. ' +
      'Pull this for matchup analysis or game simulation.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description:
            'Optional: "system_interactions", "archetype_interactions", "simulation_math", ' +
            '"mismatch_modifiers", or "full"',
          default: 'full',
        },
      },
    },
  },
  {
    name: 'get_scouting',
    description:
      'Get scouting & game ops protocol (File 05). Contains: Pregame Scout Packet, In-Game Live Ops, ' +
      'Halftime Staff Packet, Postgame Staff Packet. Pull this for game preparation questions.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description:
            'Optional: "pregame", "ingame", "halftime", "postgame", "confidence_gates", or "full"',
          default: 'full',
        },
      },
    },
  },
  {
    name: 'get_downstream',
    description:
      'Get downstream engines (File 06). Contains: Development Intelligence Engine (placement, portal, ' +
      'development roadmap), Pro Transition Intelligence Engine (draft projection, pro KR translation), ' +
      'Coaching Impact Modifier. Pull this for development plans or pro projections.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          description: 'Optional: "development", "pro_transition", "coaching_impact", or "full"',
          default: 'full',
        },
      },
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
      case 'get_team_intelligence': return getStub('team_intelligence', 'File 03', section);
      case 'get_simulation':       return getStub('simulation', 'File 04', section);
      case 'get_scouting':         return getStub('scouting', 'File 05', section);
      case 'get_downstream':       return getStub('downstream', 'File 06', section);
      default:
        return JSON.stringify({ error: `Unknown corpus tool: ${toolName}` });
    }
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function getEvalProtocol(section: string): string {
  if (section === 'full' || !section) return FILE_01;

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

  // Find first matching header in FILE_01 and return ~6000 chars from there
  for (const kw of keywords) {
    const idx = FILE_01.indexOf(kw);
    if (idx >= 0) {
      return FILE_01.slice(idx, idx + 6000);
    }
  }

  return FILE_01; // fallback to full
}

function getReference(lookup: string): string {
  // FILE_02 is not yet added to this project build.
  // Return a helpful stub with guidance for Claude.
  return [
    '## Reference Data (File 02) — Not Yet Loaded',
    '',
    `You requested: "${lookup}"`,
    '',
    'File 02 (272K characters of trait bands, archetype gates, KLVN tables, system demand profiles) ',
    'is not yet bundled in this build. Use the following fallback approach:',
    '',
    '- For trait scoring bands: apply the general tier-adjusted ranges from the V1 Protocol (File 01)',
    '- For archetype gates: use your knowledge of the KaNeXT archetype definitions',
    '- For KLVN adjustments: standard KLVN lambda values — NAIA ≈ 0.82–0.88, NJCAA D1 ≈ 0.78–0.84',
    '- For system demand profiles: reference the system type descriptions in SKILL_MD',
    '- For exact values: note the gap and flag for the user',
  ].join('\n');
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

function getStub(toolKey: string, fileLabel: string, section: string): string {
  return [
    `## ${fileLabel} — Not Yet Loaded`,
    '',
    `The ${toolKey} protocol (${fileLabel}) is not yet bundled in this build.`,
    section !== 'full' ? `Requested section: "${section}"` : '',
    '',
    'Answer using your training knowledge. Note any limitations in your response.',
  ].filter(Boolean).join('\n');
}
