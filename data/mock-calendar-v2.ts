/**
 * Mock Calendar v2 Data — Sports Mode Calendar Tab
 * Sub-tabs: Agenda, Schedule, Standings, News
 */

import { FMU_GAMES, FMU_STANDINGS } from '@/data/fmu';

// =============================================================================
// AGENDA
// =============================================================================

export type AgendaType = 'Practice' | 'Game' | 'Film' | 'Meeting' | 'Lift' | 'Travel' | 'Off' | 'Event' | 'Recruiting';

export interface AgendaItem {
  id: string;
  date: string;
  dayLabel: string;
  time: string;
  title: string;
  type: AgendaType;
  location: string;
  attendees?: string;
  notes?: string;
}

export const AGENDA_ITEMS: AgendaItem[] = [
  { id: 'ag-1', date: '2026-02-17', dayLabel: 'Today', time: '7:00 AM', title: 'Pre-Game Lift', type: 'Lift', location: 'FMU Weight Room', attendees: 'Full Team' },
  { id: 'ag-2', date: '2026-02-17', dayLabel: 'Today', time: '10:00 AM', title: 'Film Review \u2014 Keiser Scouting', type: 'Film', location: 'Film Room A', attendees: 'Coaching Staff' },
  { id: 'ag-3', date: '2026-02-17', dayLabel: 'Today', time: '2:00 PM', title: 'Practice \u2014 Half-Court Sets', type: 'Practice', location: 'Wellness Center', attendees: 'Full Team' },
  { id: 'ag-4', date: '2026-02-18', dayLabel: 'Tomorrow', time: '9:00 AM', title: 'Recruiting Call \u2014 Marcus Thompson', type: 'Recruiting', location: 'Virtual', notes: 'PG, 6-2, Class of 2026' },
  { id: 'ag-5', date: '2026-02-18', dayLabel: 'Tomorrow', time: '1:00 PM', title: 'Shootaround', type: 'Practice', location: 'Wellness Center', attendees: 'Travel Roster' },
  { id: 'ag-6', date: '2026-02-18', dayLabel: 'Tomorrow', time: '3:30 PM', title: 'Staff Meeting \u2014 Game Prep', type: 'Meeting', location: 'Conference Room', attendees: 'Coaching Staff' },
  { id: 'ag-7', date: '2026-02-19', dayLabel: 'Wed', time: '5:00 PM', title: 'Bus Departure', type: 'Travel', location: 'FMU Campus', notes: 'Away game at Keiser' },
  { id: 'ag-8', date: '2026-02-19', dayLabel: 'Wed', time: '7:30 PM', title: 'vs Keiser University', type: 'Game', location: 'Keiser (Away)', attendees: 'Travel Roster' },
  { id: 'ag-9', date: '2026-02-20', dayLabel: 'Thu', time: 'All Day', title: 'Recovery Day', type: 'Off', location: '\u2014' },
  { id: 'ag-10', date: '2026-02-21', dayLabel: 'Fri', time: '7:00 AM', title: 'Lift \u2014 Upper Body', type: 'Lift', location: 'FMU Weight Room', attendees: 'Full Team' },
  { id: 'ag-11', date: '2026-02-21', dayLabel: 'Fri', time: '10:00 AM', title: 'Film Review \u2014 Keiser Post-Game', type: 'Film', location: 'Film Room A' },
  { id: 'ag-12', date: '2026-02-21', dayLabel: 'Fri', time: '2:00 PM', title: 'Practice \u2014 Transition D Focus', type: 'Practice', location: 'Wellness Center' },
  { id: 'ag-13', date: '2026-02-22', dayLabel: 'Sat', time: '11:00 AM', title: 'Shootaround', type: 'Practice', location: 'Wellness Center' },
  { id: 'ag-14', date: '2026-02-22', dayLabel: 'Sat', time: '2:00 PM', title: 'vs Southeastern University', type: 'Game', location: 'Wellness Center (Home)' },
  { id: 'ag-15', date: '2026-02-23', dayLabel: 'Sun', time: 'All Day', title: 'Off Day', type: 'Off', location: '\u2014' },
  { id: 'ag-16', date: '2026-02-24', dayLabel: 'Mon', time: '7:00 AM', title: 'Lift \u2014 Lower Body', type: 'Lift', location: 'FMU Weight Room' },
  { id: 'ag-17', date: '2026-02-24', dayLabel: 'Mon', time: '10:00 AM', title: 'Recruiting Board Review', type: 'Meeting', location: 'Conference Room' },
  { id: 'ag-18', date: '2026-02-24', dayLabel: 'Mon', time: '2:00 PM', title: 'Practice \u2014 Zone Offense', type: 'Practice', location: 'Wellness Center' },
  { id: 'ag-19', date: '2026-02-25', dayLabel: 'Tue', time: '10:00 AM', title: 'Film \u2014 Ave Maria Scout', type: 'Film', location: 'Film Room A' },
  { id: 'ag-20', date: '2026-02-25', dayLabel: 'Tue', time: '2:00 PM', title: 'Practice \u2014 PnR Coverage', type: 'Practice', location: 'Wellness Center' },
];

export function getAgendaTypeColor(type: AgendaType): string {
  const colors: Record<AgendaType, string> = {
    Practice: '#8b5cf6', Game: '#ef4444', Film: '#3b82f6', Meeting: '#f59e0b',
    Lift: '#22c55e', Travel: '#06b6d4', Off: '#6b7280', Event: '#ec4899', Recruiting: '#f97316',
  };
  return colors[type] ?? '#6b7280';
}

// =============================================================================
// SCHEDULE (from FMU_GAMES)
// =============================================================================

export interface ScheduleGame {
  id: string;
  date: string;
  opponent: string;
  location: string;
  status: 'upcoming' | 'live' | 'final';
  result?: string;
  score?: string;
  gameType: string;
}

export function getScheduleGames(): ScheduleGame[] {
  return FMU_GAMES.map((g) => ({
    id: g.id,
    date: g.date,
    opponent: g.opponent,
    location: g.location,
    status: g.status,
    result: (g as any).result,
    score: (g as any).score,
    gameType: g.gameType,
  }));
}

// =============================================================================
// STANDINGS (from FMU_STANDINGS)
// =============================================================================

export interface StandingsRow {
  rank: number;
  team: string;
  confW: number;
  confL: number;
  overallW: number;
  overallL: number;
  streak: string;
  isUs: boolean;
}

export function getStandings(): StandingsRow[] {
  return FMU_STANDINGS.map((r, i) => ({
    rank: i + 1,
    team: r.team,
    confW: r.confW,
    confL: r.confL,
    overallW: r.overallW,
    overallL: r.overallL,
    streak: r.streak,
    isUs: r.team === 'Florida Memorial',
  }));
}

// =============================================================================
// NEWS
// =============================================================================

export type NewsBadge = 'action-required' | 'info' | 'alert' | 'none';

export interface NewsPost {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  badge: NewsBadge;
  summary: string;
  linkedObject?: string;
}

export const NEWS_POSTS: NewsPost[] = [
  { id: 'news-1', title: 'NAIA Eligibility Window Closes Feb 28', source: 'Compliance', timestamp: '2h ago', badge: 'action-required', summary: '3 transfer students need final clearance before deadline.', linkedObject: 'Compliance' },
  { id: 'news-2', title: 'Sun Conference Standings Update', source: 'Conference', timestamp: '4h ago', badge: 'info', summary: 'FMU moves to 2nd in Sun Conference after Webber win.' },
  { id: 'news-3', title: 'Keiser Scouting Report Posted', source: 'Film Room', timestamp: '6h ago', badge: 'none', summary: 'Full scout report and film breakdown available in Film Room.', linkedObject: 'Film Room' },
  { id: 'news-4', title: 'Travel Roster Needs Confirmation', source: 'Operations', timestamp: '1d ago', badge: 'action-required', summary: 'Away game at Keiser on Wed \u2014 travel roster not yet locked.', linkedObject: 'Operations' },
  { id: 'news-5', title: 'D. Cole Named Sun Conference Player of the Week', source: 'Conference', timestamp: '2d ago', badge: 'info', summary: '22.5 PPG, 7.0 APG in 2 wins last week.' },
  { id: 'news-6', title: 'Facility Scheduling Conflict: Feb 22', source: 'Facilities', timestamp: '2d ago', badge: 'alert', summary: 'MBB and WBB both requesting Wellness Center 2-4 PM on Saturday.', linkedObject: 'Facilities' },
  { id: 'news-7', title: 'Recruiting: Marcus Thompson Visit Scheduled', source: 'Recruiting', timestamp: '3d ago', badge: 'none', summary: 'PG, 6-2, Class of 2026 \u2014 official visit Feb 28-Mar 1.', linkedObject: 'Recruiting' },
  { id: 'news-8', title: 'Budget Review: MBB at 68% Utilization', source: 'Finance', timestamp: '4d ago', badge: 'info', summary: 'On track for season budget. Travel costs slightly above projection.' },
  { id: 'news-9', title: 'Pregame Media Request: Local TV Interview', source: 'Media', timestamp: '5d ago', badge: 'action-required', summary: 'Local ABC affiliate requesting Coach K interview before Keiser game.' },
  { id: 'news-10', title: 'Development: Carter Shooting Progress Update', source: 'Development', timestamp: '1w ago', badge: 'none', summary: 'Pull-up 3PT% improved from 28% to 34% over 4-week drill cycle.', linkedObject: 'Development' },
];

export function getNewsBadgeColor(badge: NewsBadge): string {
  const colors: Record<NewsBadge, string> = { 'action-required': '#ef4444', info: '#3b82f6', alert: '#f59e0b', none: 'transparent' };
  return colors[badge];
}
