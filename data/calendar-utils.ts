/**
 * Calendar Utilities
 * Date helpers and game-to-event mapper for the Program Calendar.
 */

import type { KaNeXTGame } from './fmu';
import type { ProgramCalendarEvent, ProgramCalendarEventType } from '@/types';

// ── Event type badge colors ──
export const EVENT_TYPE_COLORS: Record<ProgramCalendarEventType, string> = {
  game: '#B85C5C',
  practice: '#5A8A6E',
  lift: '#B8943E',
  travel: '#1A1714',
  meeting: '#1A1714',
  recruiting: '#B8943E',
  academic: '#1A1714',
  admin_deadline: '#9C9790',
};

export const EVENT_TYPE_LABELS: Record<ProgramCalendarEventType, string> = {
  game: 'Game',
  practice: 'Practice',
  lift: 'Lift',
  travel: 'Travel',
  meeting: 'Meeting',
  recruiting: 'Recruiting',
  academic: 'Academic',
  admin_deadline: 'Admin',
};

// ── Date helpers (all native JS Date, no library) ──

/** Get array of 7 dates (Mon–Sun) for the week containing `date` */
export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  // Shift so Monday = 0
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    dates.push(dd);
  }
  return dates;
}

/** Get 42-cell grid (6 weeks × 7 days) for the month containing `date` */
export function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based
  const gridStart = new Date(firstDay);
  gridStart.setDate(1 - startOffset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const dd = new Date(gridStart);
    dd.setDate(gridStart.getDate() + i);
    cells.push(dd);
  }
  return cells;
}

/** Get array of hour slots from 6am to 10pm (17 slots) */
export function getHourSlots(): number[] {
  const slots: number[] = [];
  for (let h = 6; h <= 22; h++) slots.push(h);
  return slots;
}

/** Check if two dates are the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Parse game time string ("7PM", "7:30PM") into hours and minutes */
export function parseGameTime(timeStr: string): { hours: number; minutes: number } {
  const upper = timeStr.toUpperCase().trim();
  const isPM = upper.includes('PM');
  const cleaned = upper.replace(/[APM]/g, '');
  const parts = cleaned.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return { hours, minutes };
}

/** Format hour number to display label (e.g. 6 → "6 AM", 14 → "2 PM") */
export function formatHourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/** Format date range for header display */
export function formatDateRange(dates: Date[]): string {
  if (dates.length === 0) return '';
  if (dates.length === 1) {
    return formatDate(dates[0]);
  }
  const first = dates[0];
  const last = dates[dates.length - 1];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (first.getMonth() === last.getMonth()) {
    return `${months[first.getMonth()]} ${first.getDate()}–${last.getDate()}, ${first.getFullYear()}`;
  }
  return `${months[first.getMonth()]} ${first.getDate()} – ${months[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
}

/** Format single date */
export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Format month header */
export function formatMonthYear(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ── Game date parser (re-exported from fmu.ts pattern) ──

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Oct: 9, Nov: 10, Dec: 11,
};

function parseGameDateLocal(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split(' ');
  if (parts.length < 2) return null;
  const month = MONTH_MAP[parts[0]];
  const day = parseInt(parts[1]);
  if (month == null || isNaN(day)) return null;
  const year = month >= 9 ? 2025 : 2026;
  return new Date(year, month, day);
}

// ── Game-to-Calendar event mapper (Spec 3) ──

export function gamesToCalendarEvents(games: KaNeXTGame[]): ProgramCalendarEvent[] {
  return games.map((game) => {
    const parsedDate = parseGameDateLocal(game.date);
    if (!parsedDate) return null;
    const time = parseGameTime(game.gameTime ?? '7PM');
    const startDatetime = new Date(parsedDate);
    startDatetime.setHours(time.hours, time.minutes, 0, 0);
    const endDatetime = new Date(startDatetime.getTime() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000); // + 2h15m

    const prefix = game.location === 'Home' ? 'vs' : '@';

    return {
      id: `cal-game-${game.id}`,
      type: 'game' as const,
      title: `${prefix} ${game.opponent}`,
      startDatetime,
      endDatetime,
      location: game.venue ?? game.location,
      description: `${game.gameType ?? 'NON-CONF'} game`,
      visibilityScope: 'all_program' as const,
      routeTarget: game.id,
      isReadOnly: true,
      gameScore: game.score,
      gameStatus: game.status,
    };
  }).filter(Boolean) as ProgramCalendarEvent[];
}

/** Format time for event display */
export function formatEventTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return minutes > 0 ? `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}` : `${hours} ${ampm}`;
}
