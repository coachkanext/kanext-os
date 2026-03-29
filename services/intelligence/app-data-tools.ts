/**
 * App Data Tools — Claude-callable handlers for live app data.
 * These read from the same mock data that powers the UI screens.
 *
 * Available for both basketball tier (Sonnet) and general tier (Haiku).
 * Answers questions about schedule, team stats, calendar, payments, analytics.
 */

import {
  PLAYERS, TEAM_INFO, TEAM_KR, TEAM_SYSTEM, NEXT_GAME, NIL_ACTIVITY,
  getUpcomingGames, getPastGames, rosterHealthSummary,
} from '@/data/mock-sports-hub';
import {
  AGENDA_ITEMS, getScheduleGames, getStandings,
} from '@/data/mock-calendar-v2';
import {
  BALANCE, BILLERS, CARD_INFO, SAVINGS_VAULTS, getTransactions,
} from '@/data/mock-wallet';

// ── Tool Definitions ──────────────────────────────────────────────────────────

export const APP_DATA_TOOLS = [
  {
    name: 'get_schedule',
    description:
      'Get the team schedule — upcoming games, past results with scores. ' +
      'Use when asked about games, schedule, opponent, record, or "when do we play".',
    input_schema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Optional: "upcoming", "past", "all", or a specific opponent name',
          default: 'all',
        },
      },
    },
  },
  {
    name: 'get_team_stats',
    description:
      'Get team-level statistics, KR ratings, system identity, and roster overview. ' +
      'Use when asked about team performance, analytics, system, or roster composition.',
    input_schema: {
      type: 'object',
      properties: {
        stat_type: {
          type: 'string',
          description: 'Optional: "overview", "roster", "system", "kr", or "all"',
          default: 'all',
        },
      },
    },
  },
  {
    name: 'get_calendar_events',
    description:
      'Get calendar and agenda events — practices, games, meetings, film sessions, recruiting visits. ' +
      'Use when asked about schedule, "when is practice", "what\'s on the calendar", etc.',
    input_schema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Optional: event type filter — "Practice", "Game", "Film", "Meeting", "Lift", "Recruiting", "Travel", or "all"',
          default: 'all',
        },
      },
    },
  },
  {
    name: 'get_kaypay_info',
    description:
      'Get KayPay financial information — balance, recent transactions, bills, savings vaults, card info. ' +
      'Use when asked about payments, balance, financial aid, transactions, or billing.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'What to retrieve: "balance", "transactions", "bills", "savings", "card", or "all"',
          default: 'all',
        },
      },
    },
  },
  {
    name: 'get_hub_analytics',
    description:
      'Get hub performance data — team record, KR trend, conference standing, NIL activity feed. ' +
      'Use when asked about "how are we doing", analytics, growth, program health, or NIL.',
    input_schema: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          description: 'Optional: "record", "kr", "nil", "standings", or "all"',
          default: 'all',
        },
      },
    },
  },
];

// ── Dispatcher ────────────────────────────────────────────────────────────────

export function handleAppDataTool(toolName: string, input: Record<string, unknown>): string {
  try {
    switch (toolName) {
      case 'get_schedule':        return getSchedule(input);
      case 'get_team_stats':      return getTeamStats(input);
      case 'get_calendar_events': return getCalendarEvents(input);
      case 'get_kaypay_info':     return getKayPayInfo(input);
      case 'get_hub_analytics':   return getHubAnalytics(input);
      default:
        return JSON.stringify({ error: `Unknown app data tool: ${toolName}` });
    }
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function getSchedule(input: Record<string, unknown>): string {
  const filter = typeof input.filter === 'string' ? input.filter.toLowerCase() : 'all';

  const upcoming = getUpcomingGames().map(g => ({
    opponent: g.opponent,
    date: g.date,
    time: g.time,
    location: g.location === 'H' ? 'Home' : g.location === 'A' ? 'Away' : 'Neutral',
    venue: g.venue,
    isConference: g.isConference,
    tv: g.tv ?? null,
  }));

  const past = getPastGames().map(g => ({
    opponent: g.opponent,
    date: g.date,
    result: g.result,
    score: `${g.score ?? '?'}-${g.oppScore ?? '?'}`,
    location: g.location === 'H' ? 'Home' : g.location === 'A' ? 'Away' : 'Neutral',
    isConference: g.isConference,
  }));

  const nextGame = {
    opponent:   NEXT_GAME.opponent,
    date:       NEXT_GAME.date,
    time:       NEXT_GAME.time,
    venue:      NEXT_GAME.venue,
    location:   NEXT_GAME.location === 'H' ? 'Home' : 'Away',
    oppRecord:  NEXT_GAME.oppRecord,
    countdown:  NEXT_GAME.countdown,
    isConference: NEXT_GAME.isConference,
  };

  if (filter === 'upcoming') return JSON.stringify({ nextGame, upcoming });
  if (filter === 'past')     return JSON.stringify({ past });

  // Specific opponent search
  if (filter !== 'all') {
    const allGames = getScheduleGames();
    const match = allGames.filter(g => g.opponent.toLowerCase().includes(filter));
    return JSON.stringify({ results: match });
  }

  return JSON.stringify({
    team: TEAM_INFO.name,
    record: TEAM_INFO.record,
    conferenceRecord: TEAM_INFO.conferenceRec,
    nextGame,
    upcoming: upcoming.slice(0, 5),
    recentResults: past,
  });
}

function getTeamStats(input: Record<string, unknown>): string {
  const type = typeof input.stat_type === 'string' ? input.stat_type : 'all';

  const rosterSummary = PLAYERS.map(p => ({
    name:     p.name,
    number:   p.number,
    position: p.position,
    class:    p.classYear,
    height:   p.heightFt,
    role:     p.role,
    kr:       p.kr.overall,
    ppg:      p.stats.ppg,
    rpg:      p.stats.rpg,
    apg:      p.stats.apg,
    mpg:      p.stats.mpg,
    medical:  p.medical,
  }));

  if (type === 'roster') return JSON.stringify({ players: rosterSummary, health: rosterHealthSummary() });

  if (type === 'system') {
    return JSON.stringify({
      offense: TEAM_SYSTEM.offense,
      defense: TEAM_SYSTEM.defense,
      offDescription: TEAM_SYSTEM.offDesc,
      defDescription: TEAM_SYSTEM.defDesc,
      strengths: { offense: TEAM_SYSTEM.offCover, defense: TEAM_SYSTEM.defCover },
      gaps:      { offense: TEAM_SYSTEM.offGaps,  defense: TEAM_SYSTEM.defGaps },
      fragility: TEAM_SYSTEM.fragility,
    });
  }

  if (type === 'kr') {
    return JSON.stringify({
      teamKR: TEAM_KR,
      playerKRs: PLAYERS.map(p => ({ name: p.name, position: p.position, kr: p.kr.overall, archetype: p.archetype })),
    });
  }

  // 'overview' or 'all'
  return JSON.stringify({
    team: TEAM_INFO,
    teamKR: TEAM_KR,
    system: { offense: TEAM_SYSTEM.offense.name, defense: TEAM_SYSTEM.defense.name },
    health: rosterHealthSummary(),
    players: rosterSummary,
  });
}

function getCalendarEvents(input: Record<string, unknown>): string {
  const filter = typeof input.filter === 'string' ? input.filter : 'all';

  const items = filter === 'all'
    ? AGENDA_ITEMS
    : AGENDA_ITEMS.filter(e => e.type.toLowerCase() === filter.toLowerCase());

  return JSON.stringify({
    count: items.length,
    events: items.map(e => ({
      date:      e.date,
      dayLabel:  e.dayLabel,
      time:      e.time,
      title:     e.title,
      type:      e.type,
      location:  e.location,
      attendees: e.attendees ?? null,
      notes:     e.notes ?? null,
    })),
  });
}

function getKayPayInfo(input: Record<string, unknown>): string {
  const query = typeof input.query === 'string' ? input.query : 'all';

  if (query === 'balance') {
    return JSON.stringify({ balance: BALANCE, card: CARD_INFO });
  }

  if (query === 'transactions') {
    const txns = getTransactions('all').slice(0, 10);
    return JSON.stringify({ recentTransactions: txns });
  }

  if (query === 'bills') {
    return JSON.stringify({ bills: BILLERS });
  }

  if (query === 'savings') {
    return JSON.stringify({ savingsVaults: SAVINGS_VAULTS });
  }

  if (query === 'card') {
    return JSON.stringify({ card: CARD_INFO });
  }

  // 'all'
  const txns = getTransactions('all').slice(0, 5);
  return JSON.stringify({
    balance: BALANCE,
    card: CARD_INFO,
    recentTransactions: txns,
    bills: BILLERS,
    savingsVaults: SAVINGS_VAULTS,
  });
}

function getHubAnalytics(input: Record<string, unknown>): string {
  const metric = typeof input.metric === 'string' ? input.metric : 'all';

  const standings = getStandings().slice(0, 8);
  const nilRecent = NIL_ACTIVITY.slice(0, 5);

  if (metric === 'record') {
    return JSON.stringify({ team: TEAM_INFO.name, record: TEAM_INFO.record, conference: TEAM_INFO.conference, standing: TEAM_INFO.confStanding });
  }
  if (metric === 'kr') {
    return JSON.stringify({ teamKR: TEAM_KR });
  }
  if (metric === 'nil') {
    return JSON.stringify({ nilActivity: nilRecent });
  }
  if (metric === 'standings') {
    return JSON.stringify({ standings });
  }

  return JSON.stringify({
    team:       TEAM_INFO,
    teamKR:     TEAM_KR,
    standings:  standings,
    nilActivity: nilRecent,
  });
}
