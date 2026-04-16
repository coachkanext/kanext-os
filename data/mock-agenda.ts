/**
 * Mock data for Agenda screen — personal calendar items.
 * Cross-mode: items span all 4 modes.
 */

import type { Mode } from '@/types';

export interface PersonalAgendaItem {
  id: string;
  title: string;
  type: 'meeting' | 'call' | 'deadline' | 'event' | 'practice' | 'service' | 'personal';
  mode: Mode;
  date: Date;
  time: string;
  endTime?: string;
  location?: string;
  notes?: string;
  isAllDay?: boolean;
}

// Source derivation — replaces per-type color coding
export type AgendaSource = 'season' | 'messages' | 'store' | 'manual';

export function deriveSource(item: PersonalAgendaItem): AgendaSource {
  if (item.type === 'personal') return 'manual';
  if (item.type === 'call') return 'messages';
  return 'season'; // practice, meeting, event, service, deadline all map to season
}

const SOURCE_ICONS: Record<AgendaSource, string | null> = {
  season: 'calendar',
  messages: 'bubble.left.fill',
  store: 'bag.fill',
  manual: null,
};

export function getSourceIcon(source: AgendaSource): string | null {
  return SOURCE_ICONS[source] ?? null;
}

// Helper: create a date relative to today
function d(daysOffset: number, hour: number, min = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, min, 0, 0);
  return date;
}

function fmt(h: number, m = 0): string {
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m > 0 ? `${hour}:${m.toString().padStart(2, '0')} ${period}` : `${hour} ${period}`;
}

export const AGENDA_ITEMS: PersonalAgendaItem[] = [
  // Today
  { id: 'a1', title: 'Morning Film Review', type: 'meeting', mode: 'sports', date: d(0, 8, 30), time: fmt(8, 30), endTime: fmt(9, 30), location: 'Film Room A' },
  { id: 'a2', title: 'Team Practice', type: 'practice', mode: 'sports', date: d(0, 10), time: fmt(10), endTime: fmt(12), location: 'Main Court' },
  { id: 'a3', title: 'Recruiting Call — Jaylen Carter', type: 'call', mode: 'sports', date: d(0, 13), time: fmt(1), endTime: fmt(1, 30) },
  { id: 'a4', title: 'Strength & Conditioning', type: 'practice', mode: 'sports', date: d(0, 14, 30), time: fmt(2, 30), endTime: fmt(4), location: 'Weight Room' },
  { id: 'a5', title: 'Budget Review Q1', type: 'meeting', mode: 'business', date: d(0, 16), time: fmt(4), endTime: fmt(5), location: 'Conference Room B' },
  { id: 'a6', title: 'Bible Study', type: 'service', mode: 'church', date: d(0, 19), time: fmt(7), endTime: fmt(8, 30), location: 'Fellowship Hall' },

  // Tomorrow (+1)
  { id: 'a7', title: 'Scouting Report Deadline', type: 'deadline', mode: 'sports', date: d(1, 9), time: fmt(9), notes: 'Submit to Coach Williams' },
  { id: 'a8', title: 'Individual Player Reviews', type: 'meeting', mode: 'sports', date: d(1, 10), time: fmt(10), endTime: fmt(12), location: 'Office' },
  { id: 'a9', title: 'Lunch with AD', type: 'meeting', mode: 'sports', date: d(1, 12, 30), time: fmt(12, 30), endTime: fmt(1, 30), location: 'Faculty Club' },
  { id: 'a10', title: 'Practice', type: 'practice', mode: 'sports', date: d(1, 15), time: fmt(3), endTime: fmt(5), location: 'Main Court' },

  // +2
  { id: 'a11', title: 'Staff Meeting', type: 'meeting', mode: 'business', date: d(2, 9), time: fmt(9), endTime: fmt(10) },
  { id: 'a12', title: 'Game Prep — vs. Wildcats', type: 'practice', mode: 'sports', date: d(2, 10, 30), time: fmt(10, 30), endTime: fmt(12, 30), location: 'Main Court' },
  { id: 'a13', title: 'Donor Call', type: 'call', mode: 'business', date: d(2, 14), time: fmt(2) },

  // +3
  { id: 'a14', title: 'Team Travel Day', type: 'event', mode: 'sports', date: d(3, 8), time: fmt(8), isAllDay: true, notes: 'Bus departs 8 AM sharp' },
  { id: 'a15', title: 'Pre-Game Walkthrough', type: 'practice', mode: 'sports', date: d(3, 16), time: fmt(4), endTime: fmt(5), location: 'Away Arena' },

  // +4
  { id: 'a16', title: 'Game Day — vs. Wildcats', type: 'event', mode: 'sports', date: d(4, 19), time: fmt(7), location: 'Away Arena' },

  // +5
  { id: 'a17', title: 'Recovery Day', type: 'personal', mode: 'sports', date: d(5, 10), time: fmt(10), isAllDay: true },
  { id: 'a18', title: 'Sunday Service', type: 'service', mode: 'church', date: d(5, 10), time: fmt(10), endTime: fmt(12), location: 'Main Sanctuary' },

  // +6
  { id: 'a19', title: 'Video Review — Wildcats Game', type: 'meeting', mode: 'sports', date: d(6, 9), time: fmt(9), endTime: fmt(11), location: 'Film Room A' },
  { id: 'a20', title: 'Recruiting Meeting', type: 'meeting', mode: 'sports', date: d(6, 13), time: fmt(1), endTime: fmt(2) },

  // +7
  { id: 'a21', title: 'Practice', type: 'practice', mode: 'sports', date: d(7, 10), time: fmt(10), endTime: fmt(12), location: 'Main Court' },
  { id: 'a22', title: 'Board Meeting', type: 'meeting', mode: 'business', date: d(7, 14), time: fmt(2), endTime: fmt(4), location: 'Boardroom' },

  // +8-14 scattered
  { id: 'a23', title: 'Home Game — vs. Eagles', type: 'event', mode: 'sports', date: d(9, 19), time: fmt(7), location: 'Home Arena' },
  { id: 'a24', title: 'Midweek Service', type: 'service', mode: 'church', date: d(10, 19), time: fmt(7), endTime: fmt(8, 30), location: 'Chapel' },
  { id: 'a25', title: 'End-of-Quarter Reports Due', type: 'deadline', mode: 'business', date: d(11, 17), time: fmt(5), notes: 'Submit all department reports' },
  { id: 'a26', title: 'Coaching Clinic', type: 'event', mode: 'sports', date: d(12, 9), time: fmt(9), endTime: fmt(16), location: 'Conference Center', notes: 'Annual coaching development day' },
  { id: 'a27', title: 'Easter Service Rehearsal', type: 'service', mode: 'church', date: d(13, 18), time: fmt(6), endTime: fmt(8), location: 'Main Sanctuary' },
  { id: 'a28', title: 'Semester Grades Review', type: 'meeting', mode: 'education', date: d(14, 10), time: fmt(10), endTime: fmt(11, 30) },
];

/** Get agenda items grouped by date key (YYYY-MM-DD) */
export function getAgendaItemsByDate(): Map<string, PersonalAgendaItem[]> {
  const map = new Map<string, PersonalAgendaItem[]>();
  const sorted = [...AGENDA_ITEMS].sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const item of sorted) {
    const key = dateKey(item.date);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

/** Get items for a given month (for calendar dot indicators) */
export function getAgendaItemsForMonth(year: number, month: number): Map<number, PersonalAgendaItem[]> {
  const map = new Map<number, PersonalAgendaItem[]>();
  for (const item of AGENDA_ITEMS) {
    if (item.date.getFullYear() === year && item.date.getMonth() === month) {
      const day = item.date.getDate();
      const list = map.get(day) ?? [];
      list.push(item);
      map.set(day, list);
    }
  }
  return map;
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function formatDateHeader(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getFullYear() === tomorrow.getFullYear() && date.getMonth() === tomorrow.getMonth() && date.getDate() === tomorrow.getDate();
}

/** Parse a time string like "9:30 AM" or "10 AM" back to a Date on the given reference date */
export function parseTimeString(timeStr: string, refDate: Date): Date {
  const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return refDate;
  let hour = parseInt(match[1], 10);
  const min = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  const result = new Date(refDate);
  result.setHours(hour, min, 0, 0);
  return result;
}

/** Get the next upcoming event after now (or null) */
export function getNextUpcomingEvent(): PersonalAgendaItem | null {
  const now = new Date();
  const sorted = [...AGENDA_ITEMS].sort((a, b) => a.date.getTime() - b.date.getTime());
  return sorted.find((item) => item.date.getTime() > now.getTime()) ?? null;
}

/** Get event happening right now (start <= now < end), or null */
export function getCurrentEvent(): PersonalAgendaItem | null {
  const now = new Date();
  for (const item of AGENDA_ITEMS) {
    if (!item.endTime) continue;
    const start = item.date;
    const end = parseTimeString(item.endTime, item.date);
    if (start.getTime() <= now.getTime() && now.getTime() < end.getTime()) {
      return item;
    }
  }
  return null;
}

/** Get sorted events for a specific date key (YYYY-MM-DD) */
export function getEventsForDate(key: string): PersonalAgendaItem[] {
  return [...AGENDA_ITEMS]
    .filter((item) => dateKey(item.date) === key)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Get deduplicated type labels for category chips */
export function getUniqueTypesForDate(key: string): string[] {
  const events = getEventsForDate(key);
  const types = new Set(events.map((e) => e.type));
  return Array.from(types);
}

// ─── Activity Feed ───────────────────────────────────────────────────────────

export type ActivityCategory = 'messages' | 'calls' | 'payments' | 'schedule' | 'prospects';

export interface ActivityItem {
  id: string;
  category: ActivityCategory;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

/** Relative time labels for mock feed */
function ago(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const ACTIVITY_ITEMS: ActivityItem[] = [
  // Messages
  { id: 'act1', category: 'messages', icon: 'at', title: '@sammy mentioned you in #coaches', description: 'Check the updated game plan for Saturday', timestamp: ago(8), read: false },
  { id: 'act2', category: 'messages', icon: 'bubble.left.fill', title: 'New message from Marcus Johnson', description: 'Hey coach, wanted to follow up on...', timestamp: ago(25), read: false },
  { id: 'act3', category: 'messages', icon: 'at', title: '@sammy mentioned you in #staff', description: 'Budget approval needed for equipment', timestamp: ago(90), read: true },

  // Calls
  { id: 'act4', category: 'calls', icon: 'phone.arrow.down.left', title: 'Missed call from Marcus Johnson', description: 'Athletics', timestamp: ago(15), read: false },
  { id: 'act5', category: 'calls', icon: 'phone.fill', title: 'Voicemail from Athletic Director', description: '0:42 — regarding facility schedule', timestamp: ago(120), read: true },
  { id: 'act6', category: 'calls', icon: 'phone.arrow.down.left', title: 'Missed call from Sarah Williams', description: 'Business', timestamp: ago(180), read: true },

  // Payments
  { id: 'act7', category: 'payments', icon: 'dollarsign.circle.fill', title: 'Payment received: $1,000', description: 'From Parent — Tuition', timestamp: ago(45), read: false },
  { id: 'act8', category: 'payments', icon: 'dollarsign.circle.fill', title: 'Payment received: $250', description: 'Tithe — Johnson Family', timestamp: ago(300), read: true },
  { id: 'act9', category: 'payments', icon: 'bag.fill', title: 'Merch order #4521 shipped', description: 'Nike Dri-FIT polo × 24 units', timestamp: ago(360), read: true },
  { id: 'act10', category: 'payments', icon: 'exclamationmark.circle.fill', title: 'Invoice overdue: Facility rental', description: '$2,400 — 15 days past due', timestamp: ago(480), read: false },

  // Schedule
  { id: 'act11', category: 'schedule', icon: 'clock.arrow.circlepath', title: 'Howard game moved to 7:00 PM', description: 'Was 5:00 PM — conference scheduling change', timestamp: ago(55), read: false },
  { id: 'act12', category: 'schedule', icon: 'person.badge.plus', title: 'New player added to roster', description: 'Jaylen Carter — Guard — Class of 2027', timestamp: ago(200), read: true },
  { id: 'act13', category: 'schedule', icon: 'film.fill', title: 'New film uploaded', description: 'Wildcats game — full broadcast + coaches cut', timestamp: ago(240), read: false },
  { id: 'act14', category: 'schedule', icon: 'calendar.badge.exclamationmark', title: 'New compliance deadline', description: 'NCAA APR report due March 15', timestamp: ago(400), read: true },
  { id: 'act15', category: 'schedule', icon: 'chart.bar.fill', title: 'KR ratings updated', description: 'Team overall: 84.2 (+1.3)', timestamp: ago(500), read: true },

  // Prospects
  { id: 'act16', category: 'prospects', icon: 'door.left.hand.open', title: 'Marcus entered the portal', description: 'Transfer prospect — PG — 6\'2" — 3.4 GPA', timestamp: ago(30), read: false },
  { id: 'act17', category: 'prospects', icon: 'eye.fill', title: '3 prospects viewed your program', description: 'Jaylen Carter, DeMarcus Hall, Isaiah Brooks', timestamp: ago(150), read: false },
  { id: 'act18', category: 'prospects', icon: 'envelope.fill', title: 'Prospect replied to outreach', description: 'Isaiah Brooks — interested in campus visit', timestamp: ago(420), read: true },
];

/** Get activity items, optionally filtered by category */
export function getActivityItems(category?: ActivityCategory): ActivityItem[] {
  if (!category) return ACTIVITY_ITEMS;
  return ACTIVITY_ITEMS.filter((item) => item.category === category);
}

/** Count unread activity items */
export function getUnreadActivityCount(): number {
  return ACTIVITY_ITEMS.filter((item) => !item.read).length;
}
