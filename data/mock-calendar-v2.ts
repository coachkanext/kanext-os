/**
 * Mock Calendar v2 Data — Sports Mode Calendar Tab
 * Sub-tabs: Agenda, Schedule, Standings, News
 */

import { KaNeXT_GAMES, KaNeXT_STANDINGS } from '@/data/fmu';

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
  { id: 'ag-1', date: '2026-02-17', dayLabel: 'Today', time: '7:00 AM', title: 'Pre-Game Lift', type: 'Lift', location: 'KaNeXT Weight Room', attendees: 'Full Team' },
  { id: 'ag-2', date: '2026-02-17', dayLabel: 'Today', time: '10:00 AM', title: 'Film Review \u2014 Lakewood Scouting', type: 'Film', location: 'Film Room A', attendees: 'Coaching Staff' },
  { id: 'ag-3', date: '2026-02-17', dayLabel: 'Today', time: '2:00 PM', title: 'Practice \u2014 Half-Court Sets', type: 'Practice', location: 'Wellness Center', attendees: 'Full Team' },
  { id: 'ag-4', date: '2026-02-18', dayLabel: 'Tomorrow', time: '9:00 AM', title: 'Recruiting Call \u2014 Alex Morgan', type: 'Recruiting', location: 'Virtual', notes: 'PG, 6-2, Class of 2026' },
  { id: 'ag-5', date: '2026-02-18', dayLabel: 'Tomorrow', time: '1:00 PM', title: 'Shootaround', type: 'Practice', location: 'Wellness Center', attendees: 'Travel Roster' },
  { id: 'ag-6', date: '2026-02-18', dayLabel: 'Tomorrow', time: '3:30 PM', title: 'Staff Meeting \u2014 Game Prep', type: 'Meeting', location: 'Conference Room', attendees: 'Coaching Staff' },
  { id: 'ag-7', date: '2026-02-19', dayLabel: 'Wed', time: '5:00 PM', title: 'Bus Departure', type: 'Travel', location: 'KaNeXT Campus', notes: 'Away game at Lakewood' },
  { id: 'ag-8', date: '2026-02-19', dayLabel: 'Wed', time: '7:30 PM', title: 'vs Lakewood University', type: 'Game', location: 'Lakewood (Away)', attendees: 'Travel Roster' },
  { id: 'ag-9', date: '2026-02-20', dayLabel: 'Thu', time: 'All Day', title: 'Recovery Day', type: 'Off', location: '\u2014' },
  { id: 'ag-10', date: '2026-02-21', dayLabel: 'Fri', time: '7:00 AM', title: 'Lift \u2014 Upper Body', type: 'Lift', location: 'KaNeXT Weight Room', attendees: 'Full Team' },
  { id: 'ag-11', date: '2026-02-21', dayLabel: 'Fri', time: '10:00 AM', title: 'Film Review \u2014 Lakewood Post-Game', type: 'Film', location: 'Film Room A' },
  { id: 'ag-12', date: '2026-02-21', dayLabel: 'Fri', time: '2:00 PM', title: 'Practice \u2014 Transition D Focus', type: 'Practice', location: 'Wellness Center' },
  { id: 'ag-13', date: '2026-02-22', dayLabel: 'Sat', time: '11:00 AM', title: 'Shootaround', type: 'Practice', location: 'Wellness Center' },
  { id: 'ag-14', date: '2026-02-22', dayLabel: 'Sat', time: '2:00 PM', title: 'vs Summit University', type: 'Game', location: 'Wellness Center (Home)' },
  { id: 'ag-15', date: '2026-02-23', dayLabel: 'Sun', time: 'All Day', title: 'Off Day', type: 'Off', location: '\u2014' },
  { id: 'ag-16', date: '2026-02-24', dayLabel: 'Mon', time: '7:00 AM', title: 'Lift \u2014 Lower Body', type: 'Lift', location: 'KaNeXT Weight Room' },
  { id: 'ag-17', date: '2026-02-24', dayLabel: 'Mon', time: '10:00 AM', title: 'Recruiting Board Review', type: 'Meeting', location: 'Conference Room' },
  { id: 'ag-18', date: '2026-02-24', dayLabel: 'Mon', time: '2:00 PM', title: 'Practice \u2014 Zone Offense', type: 'Practice', location: 'Wellness Center' },
  { id: 'ag-19', date: '2026-02-25', dayLabel: 'Tue', time: '10:00 AM', title: 'Film \u2014 Westfield Scout', type: 'Film', location: 'Film Room A' },
  { id: 'ag-20', date: '2026-02-25', dayLabel: 'Tue', time: '2:00 PM', title: 'Practice \u2014 PnR Coverage', type: 'Practice', location: 'Wellness Center' },

  // ─── Seeded entries (ag-21 through ag-28) ─── data_source: demo_seed ───
  // Recruiting visits
  { id: 'ag-21', date: '2026-02-28', dayLabel: 'Sat', time: '10:00 AM', title: 'Campus Visit \u2014 Terrell Washington', type: 'Recruiting', location: 'KaNeXT Campus', attendees: 'Coach Davis, Coach Williams', notes: 'SF portal transfer from Pinecrest. Official visit \u2014 full itinerary: campus tour, practice, dinner with team. Top priority recruit.' },
  { id: 'ag-22', date: '2026-03-07', dayLabel: 'Sat', time: '11:00 AM', title: 'Campus Visit \u2014 Kendrick Brooks', type: 'Recruiting', location: 'KaNeXT Campus', attendees: 'Coach Williams', notes: 'C from Chipola College. Unofficial visit \u2014 tour and film session. Bring academic support staff to meeting.' },

  // Compliance deadline
  { id: 'ag-23', date: '2026-02-28', dayLabel: 'Sat', time: '5:00 PM', title: 'NAIA Eligibility Window Closes', type: 'Event', location: 'Compliance Office', notes: 'Final deadline for spring transfer eligibility filings. 3 incoming transfers need clearance: Harris, Okafor, Williams. All paperwork must be submitted by EOD.' },

  // Travel itinerary
  { id: 'ag-24', date: '2026-03-04', dayLabel: 'Wed', time: '12:00 PM', title: 'Bus Departure \u2014 Westfield Away', type: 'Travel', location: 'KaNeXT Campus', attendees: 'Travel Roster', notes: 'Away game at Westfield University. ~2hr drive to Westfield, FL. Pre-game meal at 4:00 PM. Tipoff 7:00 PM.' },

  // Academic checkpoints
  { id: 'ag-25', date: '2026-03-02', dayLabel: 'Mon', time: '9:00 AM', title: 'Mid-Semester Grade Check \u2014 Freshmen', type: 'Meeting', location: 'Academic Center', attendees: 'Academic Advisor, Freshmen', notes: 'Mandatory mid-semester academic review for all freshmen student-athletes. Bring updated progress reports. Flag any players below 2.0 GPA.' },
  { id: 'ag-26', date: '2026-03-03', dayLabel: 'Tue', time: '9:00 AM', title: 'Mid-Semester Grade Check \u2014 Upperclassmen', type: 'Meeting', location: 'Academic Center', attendees: 'Academic Advisor, Upperclassmen', notes: 'Upperclassmen academic review. Focus on graduation timeline for seniors and credit transfer verification for portal players.' },

  // Team events
  { id: 'ag-27', date: '2026-02-26', dayLabel: 'Wed', time: '7:00 PM', title: 'Film Session \u2014 Southeastern Breakdown', type: 'Event', location: 'Film Room A', attendees: 'Full Team', notes: 'Full-team film breakdown of Southeastern game (Feb 22 result). Focus on transition defense and late-game execution. Mandatory attendance.' },
  { id: 'ag-28', date: '2026-03-01', dayLabel: 'Sun', time: '6:00 PM', title: 'Team Dinner \u2014 End of Regular Season', type: 'Event', location: 'Red Rooster (Opa-Locka)', attendees: 'Full Team + Coaching Staff', notes: 'End-of-regular-season team dinner. Celebrate the grind. Awards: Hardest Worker, Best Teammate, Most Improved. Dress code: business casual.' },
];

export function getAgendaTypeColor(type: AgendaType): string {
  const colors: Record<AgendaType, string> = {
    Practice: '#1D9BF0', Game: '#ef4444', Film: '#1D9BF0', Meeting: '#f59e0b',
    Lift: '#22c55e', Travel: '#1D9BF0', Off: '#A1A1AA', Event: '#1D9BF0', Recruiting: '#F59E0B',
  };
  return colors[type] ?? '#A1A1AA';
}

// =============================================================================
// SCHEDULE (from KaNeXT_GAMES)
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
  return KaNeXT_GAMES.map((g) => ({
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
// STANDINGS (from KaNeXT_STANDINGS)
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
  return KaNeXT_STANDINGS.map((r, i) => ({
    rank: i + 1,
    team: r.team,
    confW: r.confW,
    confL: r.confL,
    overallW: r.overallW,
    overallL: r.overallL,
    streak: r.streak,
    isUs: r.team === 'KaNeXT Sports',
  }));
}

// =============================================================================
// NEWS
// =============================================================================

export type NewsBadge = 'action-required' | 'info' | 'alert' | 'none';

export type NewsCategoryTag = 'Recap' | 'Announcement' | 'Recruiting' | 'Program';

export interface NewsPost {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  badge: NewsBadge;
  summary: string;
  linkedObject?: string;
  category?: NewsCategoryTag;
}

export const NEWS_POSTS: NewsPost[] = [
  { id: 'news-1', title: 'NAIA Eligibility Window Closes Feb 28', source: 'Compliance', timestamp: '2h ago', badge: 'action-required', summary: '3 transfer students need final clearance before deadline.', linkedObject: 'Compliance', category: 'Announcement' },
  { id: 'news-2', title: 'KaNeXT Conference Standings Update', source: 'Conference', timestamp: '4h ago', badge: 'info', summary: 'KaNeXT moves to 2nd in KaNeXT Conference after Pinecrest win.', category: 'Recap' },
  { id: 'news-3', title: 'Lakewood Scouting Report Posted', source: 'Film Room', timestamp: '6h ago', badge: 'none', summary: 'Full scout report and film breakdown available in Film Room.', linkedObject: 'Film Room', category: 'Program' },
  { id: 'news-4', title: 'Travel Roster Needs Confirmation', source: 'Operations', timestamp: '1d ago', badge: 'action-required', summary: 'Away game at Lakewood on Wed \u2014 travel roster not yet locked.', linkedObject: 'Operations', category: 'Program' },
  { id: 'news-5', title: 'D. Cole Named KaNeXT Conference Player of the Week', source: 'Conference', timestamp: '2d ago', badge: 'info', summary: '22.5 PPG, 7.0 APG in 2 wins last week.', category: 'Recap' },
  { id: 'news-6', title: 'Facility Scheduling Conflict: Feb 22', source: 'Facilities', timestamp: '2d ago', badge: 'alert', summary: 'MBB and WBB both requesting Wellness Center 2-4 PM on Saturday.', linkedObject: 'Facilities', category: 'Announcement' },
  { id: 'news-7', title: 'Recruiting: Alex Morgan Visit Scheduled', source: 'Recruiting', timestamp: '3d ago', badge: 'none', summary: 'PG, 6-2, Class of 2026 \u2014 official visit Feb 28-Mar 1.', linkedObject: 'Recruiting', category: 'Recruiting' },
  { id: 'news-8', title: 'Budget Review: MBB at 68% Utilization', source: 'Finance', timestamp: '4d ago', badge: 'info', summary: 'On track for season budget. Travel costs slightly above projection.', category: 'Program' },
  { id: 'news-9', title: 'Pregame Media Request: Local TV Interview', source: 'Media', timestamp: '5d ago', badge: 'action-required', summary: 'Local ABC affiliate requesting Coach K interview before Lakewood game.', category: 'Announcement' },
  { id: 'news-10', title: 'Development: Carter Shooting Progress Update', source: 'Development', timestamp: '1w ago', badge: 'none', summary: 'Pull-up 3PT% improved from 28% to 34% over 4-week drill cycle.', linkedObject: 'Development', category: 'Program' },
];

export function getNewsBadgeColor(badge: NewsBadge): string {
  const colors: Record<NewsBadge, string> = { 'action-required': '#ef4444', info: '#1D9BF0', alert: '#f59e0b', none: 'transparent' };
  return colors[badge];
}

// =============================================================================
// NAIA TOP 25 RANKINGS
// =============================================================================

export interface RankingRow {
  rank: number;
  team: string;
  record: string;
  kr?: number;
  isUs: boolean;
  level?: string;
}

export const NAIA_TOP_25: RankingRow[] = [
  { rank: 1, team: 'Heartland', record: '26-2', kr: 89, isUs: false },
  { rank: 2, team: 'Loyola (LA)', record: '25-3', kr: 87, isUs: false },
  { rank: 3, team: 'Georgetown (KY)', record: '24-3', kr: 86, isUs: false },
  { rank: 4, team: 'Oklahoma Wesleyan', record: '24-4', kr: 85, isUs: false },
  { rank: 5, team: 'Summit', record: '23-4', kr: 84, isUs: false },
  { rank: 6, team: 'William Carey', record: '22-5', kr: 83, isUs: false },
  { rank: 7, team: "Valley View", record: '22-4', kr: 83, isUs: false },
  { rank: 8, team: 'College of Idaho', record: '21-5', kr: 82, isUs: false },
  { rank: 9, team: 'Ridgemont (FL)', record: '21-6', kr: 81, isUs: false },
  { rank: 10, team: 'Highland', record: '22-5', kr: 81, isUs: false },
  { rank: 11, team: 'Wayland Baptist', record: '21-6', kr: 80, isUs: false },
  { rank: 12, team: 'Dordt', record: '21-5', kr: 80, isUs: false },
  { rank: 13, team: 'Lakewood', record: '20-7', kr: 79, isUs: false },
  { rank: 14, team: 'Mid-America Nazarene', record: '20-6', kr: 79, isUs: false },
  { rank: 15, team: 'Westmont', record: '19-7', kr: 78, isUs: false },
  { rank: 16, team: 'Avila', record: '20-7', kr: 78, isUs: false },
  { rank: 17, team: 'Cedarville University', record: '19-8', kr: 77, isUs: false },
  { rank: 18, team: 'Vanguard', record: '19-7', kr: 77, isUs: false },
  { rank: 19, team: 'William Penn', record: '19-8', kr: 76, isUs: false },
  { rank: 20, team: 'Antelope Valley', record: '18-8', kr: 76, isUs: false },
  { rank: 21, team: 'Carroll (MT)', record: '18-9', kr: 75, isUs: false },
  { rank: 22, team: 'Campbellsville', record: '18-8', kr: 75, isUs: false },
  { rank: 23, team: 'Science & Arts (OK)', record: '18-9', kr: 74, isUs: false },
  { rank: 24, team: 'Thomas More', record: '17-9', kr: 74, isUs: false },
  { rank: 25, team: 'Clearwater', record: '17-10', kr: 73, isUs: false },
];

/** KaNeXT position in NAIA poll — outside top 25, shown with separator */
export const KaNeXT_NAIA_POSITION: RankingRow = {
  rank: 37, team: 'KaNeXT Sports', record: '18-8', kr: 74, isUs: true,
};

// =============================================================================
// KANEXT NATIONAL RANKINGS (cross-level by KR)
// =============================================================================

export const KANEXT_NATIONAL_TOP_50: RankingRow[] = [
  { rank: 1, team: 'Heartland', record: '26-2', kr: 89, isUs: false, level: 'NAA' },
  { rank: 2, team: 'Randolph-Macon', record: '25-1', kr: 88, isUs: false, level: 'D3' },
  { rank: 3, team: 'Northwest Ridgemont St.', record: '27-2', kr: 88, isUs: false, level: 'NJCAA D1' },
  { rank: 4, team: 'Loyola (LA)', record: '25-3', kr: 87, isUs: false, level: 'NAA' },
  { rank: 5, team: 'Vincennes', record: '26-3', kr: 87, isUs: false, level: 'NJCAA D1' },
  { rank: 6, team: 'Yavapai', record: '25-3', kr: 86, isUs: false, level: 'NJCAA D1' },
  { rank: 7, team: 'Georgetown (KY)', record: '24-3', kr: 86, isUs: false, level: 'NAA' },
  { rank: 8, team: 'Christopher Newport', record: '23-2', kr: 85, isUs: false, level: 'D3' },
  { rank: 9, team: 'Oklahoma Wesleyan', record: '24-4', kr: 85, isUs: false, level: 'NAA' },
  { rank: 10, team: 'Summit', record: '23-4', kr: 84, isUs: false, level: 'NAA' },
  { rank: 11, team: 'Coffeyville', record: '24-4', kr: 84, isUs: false, level: 'NJCAA D1' },
  { rank: 12, team: 'William Carey', record: '22-5', kr: 83, isUs: false, level: 'NAA' },
  { rank: 13, team: "Valley View", record: '22-4', kr: 83, isUs: false, level: 'NAA' },
  { rank: 14, team: 'College of Idaho', record: '21-5', kr: 82, isUs: false, level: 'NAA' },
  { rank: 15, team: 'Illinois Central', record: '23-5', kr: 82, isUs: false, level: 'NJCAA D1' },
  { rank: 16, team: 'Ridgemont (FL)', record: '21-6', kr: 81, isUs: false, level: 'NAA' },
  { rank: 17, team: 'Highland', record: '22-5', kr: 81, isUs: false, level: 'NAA' },
  { rank: 18, team: 'Kilgore', record: '22-5', kr: 81, isUs: false, level: 'NJCAA D1' },
  { rank: 19, team: 'Wayland Baptist', record: '21-6', kr: 80, isUs: false, level: 'NAA' },
  { rank: 20, team: 'Dordt', record: '21-5', kr: 80, isUs: false, level: 'NAA' },
];

export const KaNeXT_NATIONAL_POSITION: RankingRow = {
  rank: 42, team: 'KaNeXT Sports', record: '18-8', kr: 74, isUs: true, level: 'NAA',
};

export function getNewsCategoryColor(category: NewsCategoryTag): string {
  const colors: Record<NewsCategoryTag, string> = {
    Recap: '#1D9BF0',
    Announcement: '#f59e0b',
    Recruiting: '#F59E0B',
    Program: '#1D9BF0',
  };
  return colors[category];
}
