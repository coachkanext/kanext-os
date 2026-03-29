/**
 * Pool Tools — Claude-callable handlers for the national player pool.
 * These execute locally against national-pool.json — zero network calls.
 *
 * POOL_TOOLS definitions are passed to the Anthropic API `tools` field for
 * basketball-tier queries. When Claude calls a pool tool, handlePoolTool()
 * executes the query and returns a JSON string sent back as a tool_result.
 */

import { nationalPool, formatForEval, type NationalPlayer } from '@/data/national-pool';

// ── Tool Definitions ──────────────────────────────────────────────────────────
// Passed verbatim to the Anthropic API alongside web_search_20250305.

export const POOL_TOOLS = [
  {
    name: 'search_players',
    description:
      'Search the national player pool (37,000+ college basketball players across NCAA D1/D2/D3, ' +
      'NAIA, NJCAA, CCCAA, USCAA). Search by player name, school, conference, position, or any ' +
      'combination. Returns matching players with full stats. This is your primary data source — ' +
      'always check the pool before using web search.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query — player name, school name, or keywords',
        },
        school: {
          type: 'string',
          description: 'Filter by school name (e.g. "Duke", "Arizona", "Lincoln University")',
        },
        conference: {
          type: 'string',
          description: 'Filter by conference (e.g. "ACC", "Big 12", "SEC", "WCC")',
        },
        position: {
          type: 'string',
          description: 'Filter by position (e.g. "G", "F", "C", "PG", "SG", "SF", "PF")',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 10, max 25)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_team_roster',
    description:
      'Get the full current roster for a college basketball team with all player stats, sorted by ' +
      'minutes per game (starters first). Use this when asked about a team\'s players, lineup, ' +
      'roster composition, depth chart, or any team-level question.',
    input_schema: {
      type: 'object',
      properties: {
        school: {
          type: 'string',
          description: 'School name (e.g. "Duke", "University of Arizona", "Lincoln University")',
        },
      },
      required: ['school'],
    },
  },
  {
    name: 'get_player_details',
    description:
      'Get detailed stats and profile for a specific player by name, in eval-ready format. ' +
      'Use this when asked to evaluate, compare, rate, or look up a specific player.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Player full name (e.g. "Cameron Boozer", "Cooper Flagg")',
        },
        school: {
          type: 'string',
          description: 'Optional school name to disambiguate if multiple players share a name',
        },
      },
      required: ['name'],
    },
  },
];

// ── Tool Dispatcher ───────────────────────────────────────────────────────────

export function handlePoolTool(toolName: string, input: Record<string, unknown>): string {
  try {
    switch (toolName) {
      case 'search_players':    return searchPlayers(input);
      case 'get_team_roster':   return getTeamRoster(input);
      case 'get_player_details': return getPlayerDetails(input);
      default:
        return JSON.stringify({ error: `Unknown pool tool: ${toolName}` });
    }
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function searchPlayers(input: Record<string, unknown>): string {
  const query      = typeof input.query === 'string' ? input.query : undefined;
  const school     = typeof input.school === 'string' ? input.school : undefined;
  const conference = typeof input.conference === 'string' ? input.conference : undefined;
  const position   = typeof input.position === 'string' ? input.position : undefined;
  const limit      = typeof input.limit === 'number' ? Math.min(input.limit, 25) : 10;

  // Combine query + school into a single search string (both match against name/school/conf)
  const searchQuery = [query, school].filter(Boolean).join(' ') || undefined;

  const results = nationalPool.search({
    query: searchQuery,
    conference,
    position,
    sortBy: 'ppg',
    sortDir: 'desc',
    limit,
  });

  if (results.length === 0) {
    return JSON.stringify({ found: false, message: 'No players found matching your criteria.' });
  }

  return JSON.stringify({
    source: 'KaNeXT National Player Pool',
    count:   results.length,
    players: results.map(formatCompact),
  });
}

function getTeamRoster(input: Record<string, unknown>): string {
  const school = typeof input.school === 'string' ? input.school.trim() : '';
  if (!school) return JSON.stringify({ error: 'school is required' });

  const lower  = school.toLowerCase();
  const roster = nationalPool.getAll().filter(p => p.school.toLowerCase().includes(lower));

  if (roster.length === 0) {
    return JSON.stringify({ found: false, school });
  }

  roster.sort((a, b) => (b.mpg ?? 0) - (a.mpg ?? 0));

  return JSON.stringify({
    source:  'KaNeXT National Player Pool',
    school,
    count:   roster.length,
    players: roster.slice(0, 20).map(formatCompact),
  });
}

function getPlayerDetails(input: Record<string, unknown>): string {
  const name   = typeof input.name === 'string' ? input.name.trim() : '';
  const school = typeof input.school === 'string' ? input.school.trim() : undefined;
  if (!name) return JSON.stringify({ error: 'name is required' });

  const results = nationalPool.search({ query: name, limit: school ? 5 : 1 });

  let player: NationalPlayer | undefined = results[0];
  if (school && results.length > 1) {
    const sl = school.toLowerCase();
    player = results.find(p => p.school.toLowerCase().includes(sl)) ?? results[0];
  }

  if (!player) {
    return JSON.stringify({ found: false, name });
  }

  // formatForEval returns a markdown string in the format SKILL.md expects for V1 Protocol
  return `Source: KaNeXT National Player Pool\n\n${formatForEval(player)}`;
}

// ── Compact row formatter ─────────────────────────────────────────────────────

function formatCompact(p: NationalPlayer): object {
  return {
    name:       p.fullName,
    position:   p.position,
    height:     p.height,
    weight:     p.weight,
    classYear:  p.classYear,
    school:     p.school,
    conference: p.conference,
    level:      p.levelDisplay,
    gp:       p.gp,
    mpg:      p.mpg,
    ppg:      p.ppg,
    rpg:      p.rpg,
    apg:      p.apg,
    spg:      p.spg,
    bpg:      p.bpg,
    topg:     p.topg,
    fgPct:    p.fgPct,
    threePct: p.threePct,
    ftPct:    p.ftPct,
  };
}
