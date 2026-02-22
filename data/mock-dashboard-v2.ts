/**
 * Mock Dashboard v2 Data — Sports Mode Dashboard
 * Blocks: Video Strip, Team Truth Header, Today + Next, Command Center,
 * Conference Pulse, Game Ops Readiness, My Work Queue.
 */

import {
  KaNeXT_GAMES,
  KaNeXT_RECORD,
  KaNeXT_NEXT_GAME,
  KaNeXT_LAST_GAME,
  KaNeXT_SEASON_COMPLETE,
  KaNeXT_STANDINGS,
  KaNeXT_KR,
} from '@/data/fmu';

// =============================================================================
// RBAC
// =============================================================================

export type RBACRole = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';

// =============================================================================
// 1. VIDEO STRIP
// =============================================================================

export type VideoTag = 'SCOUT' | 'PRACTICE' | 'DEV' | 'GAME' | 'CONNECTCAST' | 'MEDIA';

export interface VideoStripCard {
  id: string;
  title: string;
  tag: VideoTag;
  timestamp: string;
  duration: string;
  sourceBadge: string;
  thumbnailColor: string;
  rbac: RBACRole;
}

export const VIDEO_STRIP_CARDS: VideoStripCard[] = [
  { id: 'vs-1', title: 'Providence Scout Breakdown', tag: 'SCOUT', timestamp: '2h ago', duration: '8:42', sourceBadge: 'Staff', thumbnailColor: '#1D9BF0', rbac: 'R5' },
  { id: 'vs-2', title: 'Tuesday Practice \u2014 Half-Court Sets', tag: 'PRACTICE', timestamp: '5h ago', duration: '14:20', sourceBadge: 'Carroll Film', thumbnailColor: '#0B0F14', rbac: 'R5' },
  { id: 'vs-3', title: 'Carter Development \u2014 Pull-Up 3s', tag: 'DEV', timestamp: '1d ago', duration: '6:15', sourceBadge: 'Dev Lab', thumbnailColor: '#0B0F14', rbac: 'R5' },
  { id: 'vs-4', title: KaNeXT_LAST_GAME ? `vs ${KaNeXT_LAST_GAME.opponent} \u2014 Full Game` : 'Season Highlights \u2014 Full Game', tag: 'GAME', timestamp: '3d ago', duration: '1:42:08', sourceBadge: 'Carroll Film', thumbnailColor: '#0B0F14', rbac: 'R4' },
  { id: 'vs-5', title: 'Coach K Pregame \u2014 Weekly Presser', tag: 'CONNECTCAST', timestamp: '4d ago', duration: '22:35', sourceBadge: 'ConnectCast', thumbnailColor: '#0B0F14', rbac: 'R1' },
  { id: 'vs-6', title: 'Fighting Saints Gameday Hype \u2014 Social Cut', tag: 'MEDIA', timestamp: '5d ago', duration: '1:12', sourceBadge: 'Media Dept', thumbnailColor: '#0B0F14', rbac: 'R1' },
  { id: 'vs-7', title: 'Southeastern Film \u2014 Transition D', tag: 'SCOUT', timestamp: '6d ago', duration: '11:05', sourceBadge: 'Staff', thumbnailColor: '#1D9BF0', rbac: 'R5' },
  { id: 'vs-8', title: 'Strength Session \u2014 Pre-Game Lift', tag: 'PRACTICE', timestamp: '1w ago', duration: '18:40', sourceBadge: 'S&C', thumbnailColor: '#0B0F14', rbac: 'R4' },
];

// =============================================================================
// 2. TEAM TRUTH HEADER
// =============================================================================

export interface TeamTruthHeader {
  programName: string;
  sportCode: string;
  season: string;
  level: string;
  conference: string;
  record: string;
  confRecord: string;
  streak: string;
  teamKR: number;
  availability: { available: number; injured: number; out: number; redshirt: number };
  nextGameSummary: string | null;
  rbac: RBACRole;
}

const fmuStreak = KaNeXT_STANDINGS.find((r) => r.team === 'Carroll College')?.streak ?? '--';

export const TEAM_TRUTH_HEADER: TeamTruthHeader = {
  programName: 'Carroll MBB',
  sportCode: 'MBB',
  season: '2025-26',
  level: 'NAIA',
  conference: 'Frontier Conference',
  record: KaNeXT_RECORD.overall,
  confRecord: KaNeXT_RECORD.conference,
  streak: fmuStreak,
  teamKR: KaNeXT_KR,
  availability: { available: 13, injured: 1, out: 1, redshirt: 2 },
  nextGameSummary: KaNeXT_NEXT_GAME
    ? `Next: ${KaNeXT_NEXT_GAME.location === 'Home' ? 'vs' : '@'} ${KaNeXT_NEXT_GAME.opponent} · ${KaNeXT_NEXT_GAME.date}`
    : KaNeXT_SEASON_COMPLETE ? 'Season Complete' : null,
  rbac: 'R1',
};

// =============================================================================
// 3. TODAY + NEXT
// =============================================================================

export type TodayItemType = 'Practice' | 'Lift' | 'Travel' | 'Off' | 'Film' | 'Meeting';

export interface TodayItem {
  id: string;
  type: TodayItemType;
  time: string;
  location: string;
  rbac: RBACRole;
}

export interface MustDoTask {
  id: string;
  title: string;
  done: boolean;
  rbac: RBACRole;
}

export interface NextGameCardData {
  opponent: string;
  date: string;
  location: string;
  countdownDays: number;
  statusChips: { label: string; status: 'done' | 'in-progress' | 'not-started' }[];
  rbac: RBACRole;
}

export const TODAY_SCHEDULE: TodayItem[] = KaNeXT_SEASON_COMPLETE
  ? [{ id: 'td-1', type: 'Off', time: 'All Day', location: '--', rbac: 'R4' }]
  : [
      { id: 'td-1', type: 'Lift', time: '7:00 AM', location: 'Carroll Weight Room', rbac: 'R4' },
      { id: 'td-2', type: 'Film', time: '10:00 AM', location: 'Film Room A', rbac: 'R5' },
      { id: 'td-3', type: 'Practice', time: '2:00 PM', location: 'Wellness Center', rbac: 'R4' },
    ];

export const MUST_DO_TASKS: MustDoTask[] = [
  { id: 'md-1', title: 'Finalize scout report for next opponent', done: false, rbac: 'R5' },
  { id: 'md-2', title: 'Review updated depth chart', done: true, rbac: 'R6' },
  { id: 'md-3', title: 'Confirm travel roster', done: false, rbac: 'R5' },
];

export const NEXT_GAME_CARD: NextGameCardData | null = KaNeXT_NEXT_GAME
  ? {
      opponent: KaNeXT_NEXT_GAME.opponent,
      date: KaNeXT_NEXT_GAME.date,
      location: KaNeXT_NEXT_GAME.location,
      countdownDays: Math.max(0, Math.ceil((new Date(2026, 1, 20).getTime() - Date.now()) / 86400000)),
      statusChips: [
        { label: 'Game Plan', status: 'in-progress' },
        { label: 'Simulation', status: 'done' },
        { label: 'Scout Packet', status: 'done' },
      ],
      rbac: 'R5',
    }
  : null;

// =============================================================================
// 4. COMMAND CENTER TILES
// =============================================================================

export interface CommandTile {
  id: string;
  label: string;
  icon: string;
  count: number | string;
  statusChip: string;
  statusColor: 'green' | 'yellow' | 'red' | 'neutral';
  targetTab?: number;
  rbac: RBACRole;
}

export const COMMAND_TILES: CommandTile[] = [
  { id: 'ct-recruiting', label: 'Recruiting', icon: 'person.badge.plus', count: 42, statusChip: '3 new evals', statusColor: 'yellow', targetTab: 3, rbac: 'R5' },
  { id: 'ct-roster', label: 'Roster', icon: 'person.3.fill', count: 17, statusChip: 'Active', statusColor: 'green', targetTab: 2, rbac: 'R4' },
  { id: 'ct-gameplan', label: 'Game Plan', icon: 'doc.on.clipboard', count: KaNeXT_NEXT_GAME ? 1 : 0, statusChip: KaNeXT_NEXT_GAME ? 'In Progress' : 'Off-Season', statusColor: KaNeXT_NEXT_GAME ? 'yellow' : 'neutral', targetTab: 5, rbac: 'R5' },
  { id: 'ct-simulation', label: 'Simulation', icon: 'play.rectangle.fill', count: 8, statusChip: 'Latest: 72%', statusColor: 'green', targetTab: 6, rbac: 'R5' },
  { id: 'ct-stats', label: 'Stats Pulse', icon: 'chart.bar.fill', count: KaNeXT_RECORD.overall, statusChip: 'Updated', statusColor: 'green', targetTab: 4, rbac: 'R4' },
  { id: 'ct-compliance', label: 'Compliance', icon: 'checkmark.seal.fill', count: 2, statusChip: '2 pending', statusColor: 'yellow', rbac: 'R6' },
  { id: 'ct-media', label: 'Media', icon: 'camera.fill', count: 5, statusChip: '2 scheduled', statusColor: 'neutral', rbac: 'R4' },
  { id: 'ct-development', label: 'Development', icon: 'arrow.up.right', count: 6, statusChip: '3 active plans', statusColor: 'green', targetTab: 7, rbac: 'R5' },
];

// =============================================================================
// 5. CONFERENCE PULSE
// =============================================================================

export interface ConferencePulseRow {
  rank: number;
  team: string;
  confRecord: string;
  overallRecord: string;
  streak: string;
  isUs: boolean;
}

export const CONFERENCE_PULSE_STANDINGS: ConferencePulseRow[] = KaNeXT_STANDINGS.map((r, i) => ({
  rank: i + 1,
  team: r.team,
  confRecord: `${r.confW}-${r.confL}`,
  overallRecord: `${r.overallW}-${r.overallL}`,
  streak: r.streak,
  isUs: r.team === 'Carroll College',
}));

// =============================================================================
// 6. GAME OPS READINESS
// =============================================================================

export interface GameOpsChip {
  id: string;
  label: string;
  ready: boolean;
  rbac: RBACRole;
}

export const GAME_OPS_READINESS: GameOpsChip[] = KaNeXT_NEXT_GAME
  ? [
      { id: 'go-scout', label: 'Scout Packet', ready: true, rbac: 'R5' },
      { id: 'go-gameplan', label: 'Game Plan Locked', ready: false, rbac: 'R5' },
      { id: 'go-sim', label: 'Simulation Run', ready: true, rbac: 'R5' },
      { id: 'go-travel', label: 'Travel Confirmed', ready: KaNeXT_NEXT_GAME.location === 'Home', rbac: 'R4' },
      { id: 'go-media', label: 'Media Plan Confirmed', ready: true, rbac: 'R4' },
    ]
  : [];

// =============================================================================
// 7. MY WORK QUEUE
// =============================================================================

export type WorkItemType = 'recruiting' | 'agenda' | 'ops' | 'media' | 'compliance' | 'development' | 'game-plan' | 'film';
export type WorkPriority = 'high' | 'medium' | 'low';

export interface WorkQueueItem {
  id: string;
  title: string;
  type: WorkItemType;
  dueDate: string;
  owner: string;
  priority: WorkPriority;
  linkedObject?: string;
  rbac: RBACRole;
}

export const MY_WORK_QUEUE: WorkQueueItem[] = [
  { id: 'wq-1', title: 'Eval: Alex Morgan (PG, 6-2, Class of 2026)', type: 'recruiting', dueDate: 'Today', owner: 'Coach Carter', priority: 'high', linkedObject: 'Recruiting Board', rbac: 'R5' },
  { id: 'wq-2', title: 'Review opponent tendencies \u2014 Providence pick-and-roll', type: 'film', dueDate: 'Today', owner: 'Coach Carter', priority: 'high', linkedObject: 'Film Room', rbac: 'R5' },
  { id: 'wq-3', title: 'Approve travel itinerary for away series', type: 'ops', dueDate: 'Tomorrow', owner: 'Ops Staff', priority: 'high', linkedObject: 'Travel Plan', rbac: 'R6' },
  { id: 'wq-4', title: 'Schedule postgame press conference', type: 'media', dueDate: 'Fri, Feb 21', owner: 'Media Dept', priority: 'medium', linkedObject: 'Media Calendar', rbac: 'R4' },
  { id: 'wq-5', title: 'Submit eligibility verification \u2014 3 transfers', type: 'compliance', dueDate: 'Fri, Feb 21', owner: 'Compliance', priority: 'high', linkedObject: 'Compliance Center', rbac: 'R6' },
  { id: 'wq-6', title: 'Dev plan update \u2014 Carter shooting drills', type: 'development', dueDate: 'Sat, Feb 22', owner: 'Coach Pearson', priority: 'medium', linkedObject: 'Development', rbac: 'R5' },
  { id: 'wq-7', title: 'Contact AAU coach for J. Rivera eval', type: 'recruiting', dueDate: 'Mon, Feb 24', owner: 'Coach Carter', priority: 'medium', linkedObject: 'Recruiting Board', rbac: 'R5' },
  { id: 'wq-8', title: 'Lock starters for next game plan', type: 'game-plan', dueDate: 'Tue, Feb 25', owner: 'Coach Carter', priority: 'high', linkedObject: 'Game Plan', rbac: 'R6' },
  { id: 'wq-9', title: 'Gameday content \u2014 hype video edit', type: 'media', dueDate: 'Wed, Feb 26', owner: 'Media Dept', priority: 'low', linkedObject: 'Media', rbac: 'R4' },
  { id: 'wq-10', title: 'Facility reservation \u2014 practice court 2', type: 'ops', dueDate: 'Thu, Feb 27', owner: 'Ops Staff', priority: 'low', linkedObject: 'Facilities', rbac: 'R4' },
  { id: 'wq-11', title: 'Upload practice film \u2014 Tuesday session', type: 'film', dueDate: 'Today', owner: 'Film Coordinator', priority: 'medium', linkedObject: 'Film Room', rbac: 'R4' },
  { id: 'wq-12', title: 'Dev plan update \u2014 Morgan post moves', type: 'development', dueDate: 'Fri, Feb 28', owner: 'Coach Davis', priority: 'medium', linkedObject: 'Development', rbac: 'R5' },
  { id: 'wq-13', title: 'Eval: Jaylen Brooks (SG, 6-4, Class of 2027)', type: 'recruiting', dueDate: 'Sat, Mar 1', owner: 'Coach Carter', priority: 'medium', linkedObject: 'Recruiting Board', rbac: 'R5' },
  { id: 'wq-14', title: 'NAIA compliance form \u2014 financial aid audit', type: 'compliance', dueDate: 'Mon, Mar 3', owner: 'Compliance', priority: 'high', linkedObject: 'Compliance Center', rbac: 'R6' },
  { id: 'wq-15', title: 'Agenda: Team dinner \u2014 end of regular season', type: 'agenda', dueDate: 'Fri, Mar 7', owner: 'Coach Carter', priority: 'low', linkedObject: 'Calendar', rbac: 'R5' },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getVideoTagColor(tag: VideoTag): string {
  const colors: Record<VideoTag, string> = { SCOUT: '#1D9BF0', PRACTICE: '#1D9BF0', DEV: '#22c55e', GAME: '#f59e0b', CONNECTCAST: '#1D9BF0', MEDIA: '#1D9BF0' };
  return colors[tag] ?? '#A1A1AA';
}

export function getWorkItemIcon(type: WorkItemType): string {
  const icons: Record<WorkItemType, string> = { recruiting: 'person.badge.plus', agenda: 'calendar', ops: 'gearshape', media: 'camera.fill', compliance: 'checkmark.seal.fill', development: 'arrow.up.right', 'game-plan': 'doc.on.clipboard', film: 'play.rectangle.fill' };
  return icons[type] ?? 'doc.fill';
}

export function getWorkPriorityColor(priority: WorkPriority): string {
  const colors: Record<WorkPriority, string> = { high: '#ef4444', medium: '#f59e0b', low: '#A1A1AA' };
  return colors[priority] ?? '#A1A1AA';
}
