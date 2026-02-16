/**
 * Dashboard Payload Builders
 * Each builder produces a DashboardTruthPayload for one mode.
 * Builders are pure functions — no hooks, no navigation.
 */

import type { DashboardTruthPayload } from '@/types/dashboard';

import {
  FMU_GAMES,
  FMU_RECORD,
  FMU_NEXT_GAME,
  FMU_LAST_GAME,
  FMU_SEASON_COMPLETE,
  FMU_NEWS,
  FMU_STANDINGS,
} from '@/data/fmu';

import {
  ICC_ORGANIZATION,
  CAMPUSES,
  MINISTRIES,
  MESSAGES,
  formatServiceTime,
  formatMessageDate,
} from '@/data/mock-church';

import {
  FMU_ORGANIZATION,
  INSTITUTIONAL_METRICS,
  getCurrentTerm,
  getUpcomingEvents,
} from '@/data/mock-education';

import {
  getMetricsForRole,
  TODAY_NEXT,
  TOP_3_MOVES,
  WEDGES,
  type RoleView,
} from '@/data/mock-business';

import {
  K1_TEAMS,
  K1_DRIVERS,
  K1_EVENTS,
  K1_STANDINGS,
} from '@/data/mock-community';

// =============================================================================
// SPORTS
// =============================================================================

export function buildSportsDashboard(
  liveTeamKR: number,
  liveOffKR: number,
  liveDefKR: number,
): DashboardTruthPayload {
  const liveGame = FMU_GAMES.find((g) => g.status === 'live');
  const upcomingGames = FMU_GAMES.filter((g) => g.status === 'upcoming').slice(0, 2);
  const recentGames = FMU_GAMES.filter((g) => g.status === 'final' && g.score).slice(-3).reverse();

  return {
    heroVideo: {
      title: 'FMU Lions 2025-26 Season Highlights',
      subtitle: 'Top plays and moments from this season',
      liveBadge: liveGame ? 'LIVE' : undefined,
    },
    contextSnapshot: [
      { id: 'kr-team', label: 'Team KR', value: liveTeamKR },
      { id: 'kr-off', label: 'Offense', value: liveOffKR, sublabel: 'Off KR' },
      { id: 'kr-def', label: 'Defense', value: liveDefKR, sublabel: 'Def KR' },
    ],
    todayNext: [
      ...(FMU_NEXT_GAME
        ? [{
            id: 'next-game',
            type: 'next' as const,
            title: `${FMU_NEXT_GAME.location === 'Home' ? 'vs' : '@'} ${FMU_NEXT_GAME.opponent}`,
            subtitle: FMU_NEXT_GAME.date,
            metadata: FMU_NEXT_GAME.location,
          }]
        : []),
      ...(FMU_LAST_GAME
        ? [{
            id: 'last-game',
            type: 'today' as const,
            title: `${FMU_LAST_GAME.location === 'Home' ? 'vs' : '@'} ${FMU_LAST_GAME.opponent}`,
            subtitle: `${FMU_LAST_GAME.result} ${FMU_LAST_GAME.score}`,
          }]
        : []),
    ],
    alerts: FMU_SEASON_COMPLETE
      ? [{ id: 'season-end', severity: 'info', title: 'Season Complete', message: `Final record: ${FMU_RECORD.overall}` }]
      : undefined,
    quickActions: [
      { id: 'qa-schedule', label: 'Schedule', icon: 'calendar' },
      { id: 'qa-roster', label: 'Roster', icon: 'person.3.fill' },
      { id: 'qa-stats', label: 'Stats', icon: 'chart.bar.fill' },
    ],
    feedPreview: {
      title: 'Recent Games',
      items: recentGames.slice(0, 3).map((g) => ({
        id: g.id,
        title: `${g.location === 'Home' ? 'vs' : '@'} ${g.opponent}`,
        subtitle: g.score?.replace('-', '–') ?? '',
        timestamp: g.date,
        metadata: g.gameType ?? 'NON-CONF',
      })),
      viewAllLabel: 'View full schedule',
    },
    pinnedShelf: undefined,
  };
}

// =============================================================================
// CHURCH
// =============================================================================

export function buildChurchDashboard(): DashboardTruthPayload {
  const nextService = CAMPUSES[0]?.serviceTimes[0];
  const latestMessage = MESSAGES[0];
  const recentMessages = MESSAGES.slice(0, 3);

  return {
    heroVideo: {
      title: 'Sunday Worship Service',
      subtitle: 'Watch the latest message from Pastor Johnson',
    },
    contextSnapshot: [
      { id: 'campuses', label: 'Campuses', value: CAMPUSES.length },
      { id: 'ministries', label: 'Ministries', value: MINISTRIES.length },
      { id: 'messages', label: 'Messages', value: MESSAGES.length },
    ],
    todayNext: [
      ...(nextService
        ? [{
            id: 'next-service',
            type: 'next' as const,
            title: `Next Service`,
            subtitle: formatServiceTime(nextService),
            metadata: `${nextService.service} · ${CAMPUSES[0].shortName}`,
          }]
        : []),
      ...(latestMessage
        ? [{
            id: 'latest-message',
            type: 'today' as const,
            title: latestMessage.title,
            subtitle: `${latestMessage.speaker} · ${formatMessageDate(latestMessage.date)}`,
            metadata: latestMessage.seriesName ?? undefined,
          }]
        : []),
    ],
    quickActions: [
      { id: 'qa-watch', label: 'Watch', icon: 'play.circle.fill' },
      { id: 'qa-give', label: 'Give', icon: 'heart.fill' },
      { id: 'qa-connect', label: 'Connect', icon: 'person.2.fill' },
    ],
    feedPreview: {
      title: 'Recent Messages',
      items: recentMessages.map((msg) => ({
        id: msg.id,
        title: msg.title,
        subtitle: `${msg.speaker} · ${msg.duration}`,
        icon: 'play.circle.fill',
      })),
      viewAllLabel: 'View all messages',
    },
    pinnedShelf: undefined,
  };
}

// =============================================================================
// EDUCATION
// =============================================================================

export function buildEducationDashboard(): DashboardTruthPayload {
  const currentTerm = getCurrentTerm();
  const upcoming = getUpcomingEvents(3);

  return {
    heroVideo: {
      title: 'FMU Campus Life 2025-26',
      subtitle: 'Welcome to Florida Memorial University',
    },
    contextSnapshot: [
      { id: 'enrolled', label: 'Enrolled', value: INSTITUTIONAL_METRICS.enrollment.total },
      { id: 'programs', label: 'Programs', value: INSTITUTIONAL_METRICS.academics.programs },
      { id: 'faculty', label: 'Faculty', value: INSTITUTIONAL_METRICS.academics.facultyCount },
    ],
    todayNext: [
      ...(currentTerm
        ? [{
            id: 'current-term',
            type: 'today' as const,
            title: currentTerm.name,
            subtitle: `In Session`,
            metadata: `${INSTITUTIONAL_METRICS.academics.studentFacultyRatio} student-faculty ratio`,
          }]
        : []),
      ...(upcoming.length > 0
        ? [{
            id: 'next-event',
            type: 'next' as const,
            title: upcoming[0].title,
            subtitle: upcoming[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            metadata: upcoming[0].description ?? undefined,
          }]
        : []),
    ],
    quickActions: [
      { id: 'qa-calendar', label: 'Calendar', icon: 'calendar' },
      { id: 'qa-academics', label: 'Academics', icon: 'graduationcap.fill' },
      { id: 'qa-people', label: 'People', icon: 'person.2.fill' },
    ],
    feedPreview: {
      title: 'Upcoming Events',
      items: upcoming.map((evt) => ({
        id: evt.id,
        title: evt.title,
        subtitle: evt.description ?? undefined,
        timestamp: evt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })),
      viewAllLabel: 'View academic calendar',
    },
    pinnedShelf: undefined,
  };
}

// =============================================================================
// BUSINESS
// =============================================================================

export function buildBusinessDashboard(
  role: RoleView,
  isPBD: boolean,
): DashboardTruthPayload {
  const metrics = getMetricsForRole(role);
  const topMetrics = metrics.slice(0, 3);

  return {
    heroVideo: {
      title: 'KaNeXT Investor Preview',
      subtitle: 'Investor Preview — FY 2026',
    },
    contextSnapshot: [
      {
        id: topMetrics[0]?.id ?? 'bm-1',
        label: topMetrics[0]?.label ?? 'Pipeline',
        value: topMetrics[0]?.value ?? '—',
        trend: topMetrics[0]?.deltaType === 'up' ? 'up' : topMetrics[0]?.deltaType === 'down' ? 'down' : undefined,
      },
      {
        id: topMetrics[1]?.id ?? 'bm-2',
        label: topMetrics[1]?.label ?? 'Events',
        value: topMetrics[1]?.value ?? '—',
      },
      {
        id: topMetrics[2]?.id ?? 'bm-3',
        label: topMetrics[2]?.label ?? 'Mandates',
        value: topMetrics[2]?.value ?? '—',
      },
    ],
    todayNext: TODAY_NEXT.slice(0, 2).map((item) => ({
      id: item.id,
      type: item.status === 'in_progress' ? 'today' as const : 'next' as const,
      title: item.title,
      subtitle: item.time ?? '',
      metadata: item.type.toUpperCase(),
    })),
    alerts: undefined,
    quickActions: [
      { id: 'qa-roadmap', label: 'Roadmap', icon: 'map.fill' },
      { id: 'qa-proof', label: 'Proof', icon: 'checkmark.seal.fill' },
      { id: 'qa-capital', label: 'Capital', icon: 'dollarsign.circle.fill' },
    ],
    feedPreview: {
      title: role === 'founder' ? 'Top 3 Moves' : 'Proof Wedges',
      items: role === 'founder'
        ? TOP_3_MOVES.map((move, i) => ({
            id: `move-${i}`,
            title: move,
          }))
        : WEDGES.slice(0, 3).map((w) => ({
            id: w.id,
            title: w.name,
            subtitle: w.orgName,
          })),
      viewAllLabel: role === 'founder' ? 'View roadmap' : 'View all wedges',
    },
    pinnedShelf: undefined,
  };
}

// =============================================================================
// COMPETITION (K-1)
// =============================================================================

export function buildCompetitionDashboard(): DashboardTruthPayload {
  const nextEvent = K1_EVENTS.find((e) => e.status === 'upcoming');
  const lastEvent = [...K1_EVENTS].reverse().find((e) => e.status === 'completed');
  const topDrivers = K1_STANDINGS.slice(0, 5);

  return {
    heroVideo: {
      title: 'K-1 Season 1 Race Highlights',
      subtitle: 'Top moments from the 2026 championship',
    },
    contextSnapshot: [
      { id: 'teams', label: 'Teams', value: K1_TEAMS.length },
      { id: 'drivers', label: 'Drivers', value: K1_DRIVERS.length },
      { id: 'races', label: 'Races', value: K1_EVENTS.length },
    ],
    todayNext: [
      ...(nextEvent
        ? [{
            id: 'next-race',
            type: 'next' as const,
            title: nextEvent.name,
            subtitle: `${nextEvent.track} · ${nextEvent.location}`,
            metadata: `${nextEvent.date} · ${nextEvent.laps} laps`,
          }]
        : []),
      ...(lastEvent
        ? [{
            id: 'last-race',
            type: 'today' as const,
            title: lastEvent.name,
            subtitle: lastEvent.winner
              ? `Winner: ${lastEvent.winner} (${lastEvent.winnerTeam})`
              : lastEvent.track,
            metadata: lastEvent.date,
          }]
        : []),
    ],
    quickActions: [
      { id: 'qa-calendar', label: 'Calendar', icon: 'calendar' },
      { id: 'qa-standings', label: 'Standings', icon: 'list.number' },
      { id: 'qa-teams', label: 'Teams', icon: 'flag.checkered' },
    ],
    feedPreview: {
      title: 'Championship',
      items: topDrivers.map((entry) => ({
        id: entry.driverId,
        title: `P${entry.position} — ${entry.driverName}`,
        subtitle: `${entry.teamName} · ${entry.wins}W · ${entry.podiums}P`,
        metadata: `${entry.points} pts`,
      })),
      viewAllLabel: 'View full standings',
    },
    pinnedShelf: undefined,
  };
}
