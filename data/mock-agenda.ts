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

// Type → dot color mapping
const TYPE_COLORS: Record<PersonalAgendaItem['type'], string> = {
  meeting: '#3B82F6',
  call: '#8B5CF6',
  deadline: '#EF4444',
  event: '#F59E0B',
  practice: '#10B981',
  service: '#F97316',
  personal: '#6366F1',
};

export function getAgendaTypeColor(type: PersonalAgendaItem['type']): string {
  return TYPE_COLORS[type] ?? '#A1A1AA';
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
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateHeader(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}
