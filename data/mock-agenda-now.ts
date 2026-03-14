/**
 * Mock data for Agenda — Now view.
 * All times relative to "now" for realistic demo.
 */

export type AgendaPriority = 'critical' | 'high' | 'normal' | 'low';
export type AgendaStatus = 'in-progress' | 'upcoming' | 'delayed' | 'done' | 'conflict';
export type AgendaBlockType = 'meeting' | 'call' | 'practice' | 'game' | 'deadline' | 'task' | 'travel' | 'reminder' | 'prep' | 'event' | 'lift' | 'service';
export type CriticalChangeType = 'cancelled' | 'moved' | 'urgent' | 'blocked';
export type PrepType = 'film' | 'sermon' | 'meeting' | 'class' | 'content';

export interface NowItem {
  id: string;
  title: string;
  type: AgendaBlockType;
  time: string;
  endTime: string;
  org: string;
  priority: AgendaPriority;
  status: AgendaStatus;
  isLate?: boolean;
  hasConflict?: boolean;
  conflictNote?: string;
  countdownMin?: number;
}

export interface CriticalUpdate {
  id: string;
  changeType: CriticalChangeType;
  title: string;
  detail: string;
  action: string;
}

export interface TimelineBlock {
  id: string;
  startMin: number; // minutes from midnight
  time: string;
  endTime: string;
  title: string;
  type: AgendaBlockType;
  org: string;
  priority: AgendaPriority;
  status: AgendaStatus;
}

export interface MissedItem {
  id: string;
  title: string;
  time: string;
  type: AgendaBlockType;
}

export interface PriorityItem {
  id: string;
  title: string;
  type: AgendaBlockType;
  priority: AgendaPriority;
  action: string;
}

export interface PrepBlock {
  id: string;
  prepType: PrepType;
  linkedTo: string;
  time: string;
  duration: string;
}

// ─── Now / Next ──────────────────────────────────────────────────────────────

export const NOW_ITEM: NowItem = {
  id: 'now-1',
  title: 'Team Film Review',
  type: 'meeting',
  time: '7:00 PM',
  endTime: '9:00 PM',
  org: 'Lincoln U — Varsity',
  priority: 'high',
  status: 'in-progress',
  isLate: false,
  hasConflict: false,
};

export const NEXT_ITEM: NowItem = {
  id: 'next-1',
  title: 'Staff Debrief',
  type: 'meeting',
  time: '9:00 PM',
  endTime: '9:45 PM',
  org: 'Lincoln U — Coaching Staff',
  priority: 'normal',
  status: 'upcoming',
  countdownMin: 45,
};

// ─── Critical Updates ─────────────────────────────────────────────────────────

export const CRITICAL_UPDATES: CriticalUpdate[] = [
  {
    id: 'cu-1',
    changeType: 'moved',
    title: 'Friday Home Game',
    detail: 'Moved from 6 PM → 3 PM',
    action: 'Update',
  },
  {
    id: 'cu-2',
    changeType: 'cancelled',
    title: 'Recruit Visit — J. Williams',
    detail: 'Cancelled by recruit',
    action: 'Reschedule',
  },
  {
    id: 'cu-3',
    changeType: 'urgent',
    title: 'Compliance Form Due',
    detail: 'Deadline moved to tomorrow',
    action: 'Open',
  },
  {
    id: 'cu-4',
    changeType: 'blocked',
    title: 'Travel Bus Booking',
    detail: 'Waiting on admin approval',
    action: 'Follow Up',
  },
];

// ─── Daily Timeline ───────────────────────────────────────────────────────────
// startMin = minutes from midnight

export const TIMELINE_BLOCKS: TimelineBlock[] = [
  {
    id: 'tb-1',
    startMin: 19 * 60,       // 7:00 PM
    time: '7:00 PM',
    endTime: '9:00 PM',
    title: 'Team Film Review',
    type: 'meeting',
    org: 'Lincoln U',
    priority: 'high',
    status: 'in-progress',
  },
  {
    id: 'tb-2',
    startMin: 21 * 60,       // 9:00 PM
    time: '9:00 PM',
    endTime: '9:45 PM',
    title: 'Staff Debrief',
    type: 'meeting',
    org: 'Coaching Staff',
    priority: 'normal',
    status: 'upcoming',
  },
  {
    id: 'tb-3',
    startMin: 21 * 60 + 45,  // 9:45 PM
    time: '9:45 PM',
    endTime: '10:00 PM',
    title: 'Prep: Game Plan Notes',
    type: 'prep',
    org: 'Personal',
    priority: 'high',
    status: 'upcoming',
  },
  {
    id: 'tb-4',
    startMin: 22 * 60,       // 10:00 PM
    time: '10:00 PM',
    endTime: '10:30 PM',
    title: 'Recruiting Call — D. Carter',
    type: 'call',
    org: 'Lincoln U — Recruiting',
    priority: 'high',
    status: 'upcoming',
  },
  {
    id: 'tb-5',
    startMin: 23 * 60,       // 11:00 PM
    time: '11:00 PM',
    endTime: '11:15 PM',
    title: 'End-of-Day Reminder',
    type: 'reminder',
    org: 'Personal',
    priority: 'low',
    status: 'upcoming',
  },
];

// ─── Missed / Overdue ─────────────────────────────────────────────────────────

export const MISSED_ITEMS: MissedItem[] = [
  { id: 'mi-1', title: 'Morning Lift Check-In', time: '6:00 AM', type: 'lift' },
  { id: 'mi-2', title: 'Booster Club Call', time: '2:00 PM', type: 'call' },
  { id: 'mi-3', title: 'Practice Report Submit', time: '4:00 PM', type: 'deadline' },
];

// ─── Priority Stack ───────────────────────────────────────────────────────────

export const PRIORITY_ITEMS: PriorityItem[] = [
  { id: 'pi-1', title: 'Submit Game-Day Roster', type: 'deadline', priority: 'critical', action: 'Open' },
  { id: 'pi-2', title: 'Review Scouting Report', type: 'task', priority: 'high', action: 'Review' },
  { id: 'pi-3', title: 'Update Depth Chart', type: 'task', priority: 'high', action: 'Edit' },
  { id: 'pi-4', title: 'Send Parent Comm Email', type: 'task', priority: 'normal', action: 'Draft' },
  { id: 'pi-5', title: 'Log Film Hours', type: 'task', priority: 'low', action: 'Log' },
];

// ─── Prep Blocks ──────────────────────────────────────────────────────────────

export const PREP_BLOCKS: PrepBlock[] = [
  { id: 'pb-1', prepType: 'film', linkedTo: 'Friday Home Game', time: '9:45 PM', duration: '15 min' },
  { id: 'pb-2', prepType: 'meeting', linkedTo: 'Staff Debrief', time: '8:50 PM', duration: '10 min' },
  { id: 'pb-3', prepType: 'content', linkedTo: 'Booster Newsletter', time: 'Tomorrow 8:00 AM', duration: '30 min' },
];
