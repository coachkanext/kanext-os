/**
 * Agenda — Calendar view with shared timeline.
 * Day view: week row + shared timeline. Pull down week row → Month view.
 * Month view: month grid + shared timeline. Pull up month grid → Day view.
 * Both views share an identical timeline for the selected day.
 * List view: chronological sticky-header list, no calendar, no timeline.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, SectionList, TextInput, StyleSheet,
  PanResponder, useWindowDimensions, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { openSidePanel } from '@/utils/global-side-panel';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { useDemoRole, MODE_ACCENTS } from '@/utils/demo-role-store';
import { useDataMode } from '@/utils/global-demo-mode';
import { KMenuButton } from '@/components/ui/k-menu-button';

// ── Types ─────────────────────────────────────────────────────────────────────

type AgendaView = 'Day' | 'Week' | 'Month' | 'List';
type EventType =
  | 'game' | 'practice' | 'travel' | 'meeting' | 'recruiting'
  | 'call' | 'deadline' | 'class' | 'exam' | 'service' | 'event'
  | 'registration' | 'volunteer' | 'reminder' | 'other';
type FilterKey = 'all' | EventType;

interface AgendaEvent {
  id: string;
  title: string;
  type: EventType;
  mode: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  location?: string;
  description?: string;
  attendees?: { initials: string; hue: number }[];
  virtual?: boolean;
}

interface LaidOutEvent extends AgendaEvent {
  colIndex: number;
  totalCols: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const HOUR_H     = 64;
const T_START    = 6;
const T_END      = 22;
const TL_LEFT    = 56;   // hour-label column width
const VIEWS: AgendaView[] = ['Day', 'Week', 'Month', 'List'];
const FOOTER_H   = 49;
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MODE_FILTERS: Record<string, { key: FilterKey; label: string; color?: string }[]> = {
  sports: [
    { key: 'all',        label: 'All' },
    { key: 'game',       label: 'Games' },
    { key: 'practice',   label: 'Practices' },
    { key: 'travel',     label: 'Travel' },
    { key: 'meeting',    label: 'Meetings' },
    { key: 'recruiting', label: 'Recruiting Visits' },
  ],
  business: [
    { key: 'all',      label: 'All' },
    { key: 'meeting',  label: 'Meetings' },
    { key: 'deadline', label: 'Deadlines' },
    { key: 'travel',   label: 'Travel' },
    { key: 'event',    label: 'Team Events' },
  ],
  education: [
    { key: 'all',          label: 'All' },
    { key: 'class',        label: 'Classes' },
    { key: 'exam',         label: 'Exams' },
    { key: 'event',        label: 'Events' },
    { key: 'registration', label: 'Registration' },
  ],
  community: [
    { key: 'all',       label: 'All' },
    { key: 'service',   label: 'Services' },
    { key: 'meeting',   label: 'Meetings' },
    { key: 'event',     label: 'Events' },
    { key: 'volunteer', label: 'Volunteer' },
  ],
  personal: [
    { key: 'all',      label: 'All' },
    { key: 'event',    label: 'Content',   color: '#1A1714' },
    { key: 'meeting',  label: 'Meetings',  color: '#E0DBD4' },
    { key: 'deadline', label: 'Deadlines', color: '#B8943E' },
    { key: 'reminder', label: 'Personal',  color: '#9C9790' },
    { key: 'call',     label: 'Bookings',  color: '#5A8A6E' },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function sod(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function getWeekDays(date: Date): Date[] {
  const sw = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(sw, i));
}
function getMonthGrid(date: Date): (Date | null)[][] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const rows: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= last.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) { rows.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    rows.push(week);
  }
  return rows;
}
function fmtHour(h: number): string {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}
function fmtTime(date: Date): string {
  const h = date.getHours() % 12 || 12;
  const m = date.getMinutes();
  const ampm = date.getHours() < 12 ? 'AM' : 'PM';
  return m === 0 ? `${h} ${ampm}` : `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}
function fmtMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
function fmtListDate(date: Date): string {
  const t = today();
  if (isSameDay(date, t)) return 'Today';
  if (isSameDay(date, addDays(t, 1))) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function timeTop(date: Date): number {
  return (date.getHours() - T_START + date.getMinutes() / 60) * HOUR_H;
}
function timeDuration(start: Date, end: Date): number {
  return Math.max(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * HOUR_H, 28);
}
function eventColor(type: EventType, mode?: string): string {
  if (mode === 'personal') {
    switch (type) {
      case 'event':    return '#1A1714'; // Carbon — Content
      case 'meeting':  return '#E0DBD4'; // Mist — Meetings
      case 'deadline': return '#B8943E'; // Caution — Deadlines
      case 'reminder': return '#9C9790'; // Drift — Personal
      default:         return '#1A1714';
    }
  }
  switch (type) {
    case 'game':                                       return '#1A1714';
    case 'deadline': case 'exam':                      return '#B85C5C';
    case 'service': case 'call': case 'volunteer':     return '#5A8A6E';
    case 'class': case 'registration':                 return '#1A1714';
    default:                                           return '#1A1714';
  }
}

/** Greedy column-assignment for overlapping timed events */
function layoutDayEvents(events: AgendaEvent[]): LaidOutEvent[] {
  const sorted = [...events]
    .filter(e => !e.allDay)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const colEnds: Date[] = [];
  const withCols = sorted.map(ev => {
    let ci = colEnds.findIndex(end => end <= ev.start);
    if (ci === -1) { ci = colEnds.length; colEnds.push(new Date(ev.end)); }
    else colEnds[ci] = new Date(ev.end);
    return { ...ev, colIndex: ci };
  });

  return withCols.map(ev => ({
    ...ev,
    totalCols: Math.max(
      ...withCols
        .filter(o => o.start < ev.end && o.end > ev.start)
        .map(o => o.colIndex + 1),
    ),
  }));
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const _today = today();
function dn(days: number, hour: number, min = 0): Date {
  const d = addDays(_today, days);
  d.setHours(hour, min, 0, 0);
  return d;
}

const MOCK_EVENTS: AgendaEvent[] = [
  // Sports — today has two overlapping events to demonstrate column layout
  { id: 's1',  title: 'Morning Practice',        type: 'practice',   mode: 'sports',    start: dn(0, 7),      end: dn(0, 9),      location: 'Main Gym',           description: 'Full-team warm-up and drills' },
  { id: 's2',  title: 'Film Session',            type: 'meeting',    mode: 'sports',    start: dn(0, 14),     end: dn(0, 15, 30), location: 'Film Room' },
  { id: 's2b', title: 'Strength Review',         type: 'meeting',    mode: 'sports',    start: dn(0, 14),     end: dn(0, 15),     location: 'Staff Room' },
  { id: 'sd1', title: 'Conference Day',          type: 'event',      mode: 'sports',    start: dn(0, 0),      end: dn(0, 23, 59), allDay: true, location: 'Regional Center' },
  { id: 's3',  title: 'Travel to Westview',      type: 'travel',     mode: 'sports',    start: dn(2, 13),     end: dn(2, 16),     location: 'Bus Departs Facility' },
  { id: 's4',  title: 'Away Game vs. Westview',  type: 'game',       mode: 'sports',    start: dn(2, 18),     end: dn(2, 21),     location: 'Westview Arena',     description: 'Conference game — must win' },
  { id: 's5',  title: 'Recruiting Visit',        type: 'recruiting', mode: 'sports',    start: dn(3, 10),     end: dn(3, 12),     location: 'Athletic Center',    description: 'Prospect: J. Davis, PG' },
  { id: 's6',  title: 'Afternoon Practice',      type: 'practice',   mode: 'sports',    start: dn(4, 15, 30), end: dn(4, 17, 30), location: 'Main Gym' },
  { id: 's7',  title: 'Home Game vs. Riverside', type: 'game',       mode: 'sports',    start: dn(5, 19),     end: dn(5, 21, 30), location: 'Home Arena',        description: 'Senior night' },
  { id: 's8',  title: 'Coaches Meeting',         type: 'meeting',    mode: 'sports',    start: dn(6, 9),      end: dn(6, 10),     location: 'Conference Room' },
  { id: 's9',  title: 'Practice',                type: 'practice',   mode: 'sports',    start: dn(7, 8),      end: dn(7, 10),     location: 'Main Gym' },
  { id: 's10', title: 'Away Game vs. Northside', type: 'game',       mode: 'sports',    start: dn(9, 17, 30), end: dn(9, 20),     location: 'Northside Gym' },
  { id: 's11', title: 'Team Dinner',             type: 'event',      mode: 'sports',    start: dn(10, 18, 30), end: dn(10, 20, 30), location: 'Booster Club Hall' },
  { id: 's12', title: 'Strength & Conditioning', type: 'practice',   mode: 'sports',    start: dn(11, 7),     end: dn(11, 8, 30), location: 'Weight Room' },
  // Business — full week (Thu Mar 26 → Thu Apr 2)
  { id: 'bd1', title: 'Q1 Close Sprint',          type: 'deadline',   mode: 'business',  start: dn(0, 0),      end: dn(4, 23, 59), allDay: true },
  // Today (Thu Mar 26)
  { id: 'b1',  title: 'Daily Standup',            type: 'meeting',    mode: 'business',  start: dn(0, 9),      end: dn(0, 9, 30),  location: 'Zoom',             virtual: true,  attendees: [{ initials: 'MW', hue: 140 }, { initials: 'DC', hue: 300 }, { initials: 'TO', hue: 30 }], description: 'All-hands sync · blockers + priorities' },
  { id: 'b1b', title: '1:1 — Marcus Webb',        type: 'meeting',    mode: 'business',  start: dn(0, 10),     end: dn(0, 10, 30), location: 'Zoom',             virtual: true,  attendees: [{ initials: 'MW', hue: 140 }], description: 'Product roadmap check-in' },
  { id: 'b1c', title: 'Engineering Sync',         type: 'meeting',    mode: 'business',  start: dn(0, 14),     end: dn(0, 15),     location: 'Zoom',             virtual: true,  attendees: [{ initials: 'DC', hue: 300 }, { initials: 'JL', hue: 180 }, { initials: 'PN', hue: 240 }, { initials: 'ZP', hue: 20 }], description: 'V2 sprint review + unblocking' },
  // Fri Mar 27
  { id: 'b2',  title: 'Daily Standup',            type: 'meeting',    mode: 'business',  start: dn(1, 9),      end: dn(1, 9, 30),  location: 'Zoom',             virtual: true,  attendees: [{ initials: 'MW', hue: 140 }, { initials: 'DC', hue: 300 }, { initials: 'TO', hue: 30 }] },
  { id: 'b2b', title: 'Client Call — TechCorp',   type: 'call',       mode: 'business',  start: dn(1, 11),     end: dn(1, 12),     location: 'Zoom',             virtual: true,  attendees: [{ initials: 'SK', hue: 200 }, { initials: 'TO', hue: 30 }], description: 'Q2 partnership scope + contract review' },
  { id: 'b2c', title: 'Legal Review',             type: 'meeting',    mode: 'business',  start: dn(1, 15),     end: dn(1, 16),     location: 'Zoom',             virtual: true,  attendees: [{ initials: 'KM', hue: 100 }], description: 'Contract redlines with outside counsel' },
  // Mon Mar 30
  { id: 'b3',  title: 'Daily Standup',            type: 'meeting',    mode: 'business',  start: dn(4, 9),      end: dn(4, 9, 30),  location: 'Zoom',             virtual: true,  attendees: [{ initials: 'MW', hue: 140 }, { initials: 'DC', hue: 300 }, { initials: 'TO', hue: 30 }] },
  { id: 'b3b', title: 'Sprint Planning',          type: 'meeting',    mode: 'business',  start: dn(4, 10),     end: dn(4, 11, 30), location: 'Conference Room',                  attendees: [{ initials: 'MW', hue: 140 }, { initials: 'DC', hue: 300 }, { initials: 'AB', hue: 60 }], description: 'Scope Apr 1–14 sprint tasks' },
  { id: 'b3c', title: 'Investor Call — Sequoia',  type: 'call',       mode: 'business',  start: dn(4, 14),     end: dn(4, 15),     location: 'Zoom',             virtual: true,  attendees: [{ initials: 'SK', hue: 200 }], description: 'Series A update + traction metrics' },
  { id: 'b3d', title: 'Q1 Review',                type: 'meeting',    mode: 'business',  start: dn(4, 16),     end: dn(4, 18),     location: 'Board Room',                       attendees: [{ initials: 'SK', hue: 200 }, { initials: 'KM', hue: 100 }, { initials: 'MW', hue: 140 }], description: 'Full Q1 performance walkthrough' },
  // Tue Mar 31
  { id: 'b4',  title: 'Daily Standup',            type: 'meeting',    mode: 'business',  start: dn(5, 9),      end: dn(5, 9, 30),  location: 'Zoom',             virtual: true,  attendees: [{ initials: 'MW', hue: 140 }, { initials: 'DC', hue: 300 }, { initials: 'TO', hue: 30 }] },
  { id: 'b4b', title: 'Design Review',            type: 'meeting',    mode: 'business',  start: dn(5, 10),     end: dn(5, 11),     location: 'Zoom',             virtual: true,  attendees: [{ initials: 'AB', hue: 60 }, { initials: 'CD', hue: 160 }], description: 'Business Hub screens — polish pass' },
  { id: 'b4c', title: 'Lunch w/ Advisor',         type: 'event',      mode: 'business',  start: dn(5, 12, 30), end: dn(5, 14),     location: 'The Porch',                        attendees: [{ initials: 'SK', hue: 200 }], description: 'Strategy session w/ David Moore (mentor)' },
  { id: 'b4d', title: 'Product Roadmap Review',   type: 'meeting',    mode: 'business',  start: dn(5, 15),     end: dn(5, 16, 30), location: 'Conference Room',                  attendees: [{ initials: 'MW', hue: 140 }, { initials: 'AB', hue: 60 }, { initials: 'DC', hue: 300 }], description: 'Finalize Q2 roadmap for investor deck' },
  // Wed Apr 1
  { id: 'b5',  title: 'Daily Standup',            type: 'meeting',    mode: 'business',  start: dn(6, 9),      end: dn(6, 9, 30),  location: 'Zoom',             virtual: true,  attendees: [{ initials: 'MW', hue: 140 }, { initials: 'DC', hue: 300 }, { initials: 'TO', hue: 30 }] },
  { id: 'b5b', title: '1:1 — Deja Collins',       type: 'meeting',    mode: 'business',  start: dn(6, 10),     end: dn(6, 10, 30), location: 'Zoom',             virtual: true,  attendees: [{ initials: 'DC', hue: 300 }], description: 'Engineering capacity + Q2 hiring' },
  { id: 'b5c', title: 'Board Prep',               type: 'meeting',    mode: 'business',  start: dn(6, 14),     end: dn(6, 16),     location: 'Board Room',                       attendees: [{ initials: 'SK', hue: 200 }, { initials: 'KM', hue: 100 }], description: 'Prep materials for April board meeting' },
  // Thu Apr 2
  { id: 'b6',  title: 'Daily Standup',            type: 'meeting',    mode: 'business',  start: dn(7, 9),      end: dn(7, 9, 30),  location: 'Zoom',             virtual: true,  attendees: [{ initials: 'MW', hue: 140 }, { initials: 'DC', hue: 300 }, { initials: 'TO', hue: 30 }] },
  { id: 'b6b', title: 'Content Recording',        type: 'event',      mode: 'business',  start: dn(7, 11),     end: dn(7, 13),     location: 'Studio B',                         attendees: [{ initials: 'MG', hue: 270 }, { initials: 'TO', hue: 30 }], description: 'KaNeXT brand launch video + social reels' },
  { id: 'b6c', title: '1:1 — Tyler Okafor',       type: 'meeting',    mode: 'business',  start: dn(7, 14),     end: dn(7, 14, 30), location: 'Zoom',             virtual: true,  attendees: [{ initials: 'TO', hue: 30 }], description: 'Growth targets + NAIA outreach status' },
  // Education — Student events (visible to Student role)
  { id: 'e1',  title: 'English Literature',      type: 'class',      mode: 'education', start: dn(0, 10),     end: dn(0, 11),     location: 'Room 204' },
  { id: 'e2',  title: 'Calculus',                type: 'class',      mode: 'education', start: dn(1, 9),      end: dn(1, 10),     location: 'Room 101' },
  { id: 'e3',  title: 'Mid-Term Exam',           type: 'exam',       mode: 'education', start: dn(4, 9),      end: dn(4, 11),     location: 'Exam Hall',          description: 'Covers chapters 1–8' },
  { id: 'e4',  title: 'Biology Lab',             type: 'class',      mode: 'education', start: dn(2, 13),     end: dn(2, 15),     location: 'Science Hall 108',   description: 'Lab: Cell division and mitosis' },
  { id: 'e5',  title: 'Fall 2026 Registration',  type: 'registration', mode: 'education', start: dn(2, 0),   end: dn(2, 23, 59), allDay: true, location: 'Student Portal' },
  { id: 'e6',  title: 'English Literature',      type: 'class',      mode: 'education', start: dn(5, 10),     end: dn(5, 11),     location: 'Room 204' },
  { id: 'e7',  title: 'Calculus',                type: 'class',      mode: 'education', start: dn(6, 9),      end: dn(6, 10),     location: 'Room 101' },
  { id: 'e8',  title: 'Academic Advisor Appt',   type: 'event',      mode: 'education', start: dn(6, 14),     end: dn(6, 14, 30), location: 'Advising Center',    description: 'Course selection for Fall 2026' },
  { id: 'e9',  title: 'English Literature',      type: 'class',      mode: 'education', start: dn(7, 10),     end: dn(7, 11),     location: 'Room 204' },
  { id: 'e10', title: 'Calculus',                type: 'class',      mode: 'education', start: dn(8, 9),      end: dn(8, 10),     location: 'Room 101' },
  { id: 'e11', title: 'Biology Lab',             type: 'class',      mode: 'education', start: dn(9, 13),     end: dn(9, 15),     location: 'Science Hall 108' },
  { id: 'e12', title: 'Research Paper Draft Due',type: 'deadline',   mode: 'education', start: dn(9, 23, 59), end: dn(9, 23, 59), location: 'Submit Online',      description: 'ENGL 301 — upload to course portal' },
  { id: 'e13', title: 'Campus Career Fair',      type: 'event',      mode: 'education', start: dn(10, 10),    end: dn(10, 15),    location: 'Student Union',      description: '50+ employers on-site — business casual' },
  { id: 'e14', title: 'English Literature',      type: 'class',      mode: 'education', start: dn(12, 10),    end: dn(12, 11),    location: 'Room 204' },
  { id: 'e15', title: 'Calculus',                type: 'class',      mode: 'education', start: dn(13, 9),     end: dn(13, 10),    location: 'Room 101' },
  { id: 'e16', title: 'Spring Convocation',      type: 'event',      mode: 'education', start: dn(14, 13),    end: dn(14, 16),    location: 'Lincoln Hall',       description: 'Honors and awards ceremony' },
  { id: 'e17', title: 'Spring Break',            type: 'event',      mode: 'education', start: dn(16, 0),     end: dn(23, 23, 59), allDay: true, location: 'Campus Closed' },
  { id: 'e18', title: 'English Literature',      type: 'class',      mode: 'education', start: dn(19, 10),    end: dn(19, 11),    location: 'Room 204' },
  { id: 'e19', title: 'Calculus',                type: 'class',      mode: 'education', start: dn(20, 9),     end: dn(20, 10),    location: 'Room 101' },
  { id: 'e20', title: 'Biology Lab',             type: 'class',      mode: 'education', start: dn(23, 13),    end: dn(23, 15),    location: 'Science Hall 108' },
  { id: 'e21', title: 'Calculus Final Exam',     type: 'exam',       mode: 'education', start: dn(28, 9),     end: dn(28, 11),    location: 'Exam Hall',          description: 'Comprehensive final — chapters 1–12' },
  { id: 'e22', title: 'ENGL 301 Final Exam',     type: 'exam',       mode: 'education', start: dn(30, 14),    end: dn(30, 16),    location: 'Room 204',           description: 'Final essay exam — open notes' },
  { id: 'e23', title: 'Registration Closes',     type: 'registration', mode: 'education', start: dn(35, 0),  end: dn(35, 23, 59), allDay: true },
  { id: 'e24', title: 'Graduation Ceremony',     type: 'event',      mode: 'education', start: dn(42, 10),    end: dn(42, 13),    location: 'Lincoln Stadium',    description: 'Class of 2026 Commencement' },
  // Education — President-only events (visible to President/admin role)
  { id: 'ep1',  title: 'Registration Opens',          type: 'registration', mode: 'education', start: dn(0, 0),      end: dn(12, 23, 59), allDay: true,  location: 'Student Portal',     description: 'Spring registration window: Apr 1–15' },
  { id: 'ep2',  title: 'Dept Chair Meeting',          type: 'meeting',      mode: 'education', start: dn(5, 10),     end: dn(5, 11),      location: 'Room 201',           attendees: [{ initials: 'MB', hue: 220 }, { initials: 'AR', hue: 140 }], description: 'Q2 curriculum review — all department chairs' },
  { id: 'ep3',  title: 'Board of Trustees Meeting',   type: 'meeting',      mode: 'education', start: dn(12, 14),    end: dn(12, 16),     location: 'Board Room 400',     attendees: [{ initials: 'MB', hue: 220 }], description: 'Budget approval + FY2027 planning' },
  { id: 'ep4',  title: 'Registration Closes',         type: 'registration', mode: 'education', start: dn(12, 23, 59), end: dn(12, 23, 59), allDay: true, location: 'Student Portal' },
  { id: 'ep5',  title: 'Add/Drop Deadline',           type: 'deadline',     mode: 'education', start: dn(17, 23, 59), end: dn(17, 23, 59), allDay: true, description: 'Last day to add or drop courses without penalty' },
  { id: 'ep6',  title: 'Budget Review — Academic',    type: 'meeting',      mode: 'education', start: dn(19, 9),     end: dn(19, 11),     location: 'President\'s Office', attendees: [{ initials: 'MB', hue: 220 }, { initials: 'CF', hue: 60 }], description: 'Academic affairs budget mid-year review' },
  { id: 'ep7',  title: 'WSCUC Site Visit — Day 1',    type: 'event',        mode: 'education', start: dn(29, 8),     end: dn(29, 18),     location: 'Lincoln University',  description: 'WSCUC accreditation review team on-site' },
  { id: 'ep8',  title: 'WSCUC Site Visit — Day 2',    type: 'event',        mode: 'education', start: dn(30, 8),     end: dn(30, 18),     location: 'Lincoln University',  description: 'WSCUC exit interview at 3 PM' },
  { id: 'ep9',  title: 'WSCUC Site Visit — Day 3',    type: 'event',        mode: 'education', start: dn(31, 8),     end: dn(31, 16),     location: 'Lincoln University',  description: 'Final debrief session with accreditation team' },
  { id: 'ep10', title: 'Midterms Begin',              type: 'exam',         mode: 'education', start: dn(30, 0),     end: dn(30, 23, 59), allDay: true,  description: 'Midterm exam period: May 3–10' },
  { id: 'ep11', title: 'Midterms End',                type: 'exam',         mode: 'education', start: dn(37, 0),     end: dn(37, 23, 59), allDay: true,  description: 'End of midterm exam window' },
  { id: 'ep12', title: 'Faculty Senate Meeting',      type: 'meeting',      mode: 'education', start: dn(40, 13),    end: dn(40, 14, 30), location: 'Faculty Lounge',     description: 'End-of-semester faculty governance session' },
  { id: 'ep13', title: 'Finals Begin',                type: 'exam',         mode: 'education', start: dn(66, 0),     end: dn(66, 23, 59), allDay: true,  description: 'Final exam period: Jun 8–15' },
  { id: 'ep14', title: 'Commencement Ceremony',       type: 'event',        mode: 'education', start: dn(70, 10),    end: dn(70, 13),     location: 'Lincoln University Lawn', description: 'Class of 2026 Commencement — Dr. Brodsky presiding' },
  { id: 'ep15', title: 'Finals End',                  type: 'exam',         mode: 'education', start: dn(73, 0),     end: dn(73, 23, 59), allDay: true,  description: 'End of final exam window' },
  // Community
  { id: 'c1',  title: 'Sunday Service',          type: 'service',    mode: 'community', start: dn(4, 10),     end: dn(4, 12),     location: 'Main Sanctuary',     description: '10 AM Worship & Message — all are welcome' },
  { id: 'c2',  title: 'Youth Meeting',           type: 'meeting',    mode: 'community', start: dn(2, 18),     end: dn(2, 19, 30), location: 'Fellowship Hall',    description: 'Weekly youth leadership meeting' },
  { id: 'c3',  title: 'Community Outreach',      type: 'event',      mode: 'community', start: dn(8, 9),      end: dn(8, 13),     location: 'City Park',          description: 'Food drive & neighborhood cleanup' },
  { id: 'c4',  title: 'Evening Prayer Service',  type: 'service',    mode: 'community', start: dn(0, 19),     end: dn(0, 20),     location: 'Sanctuary',          description: 'Open prayer — all welcome' },
  { id: 'c5',  title: 'Worship Team Rehearsal',  type: 'meeting',    mode: 'community', start: dn(1, 17),     end: dn(1, 19),     location: 'Worship Center',     description: 'Sunday set run-through' },
  { id: 'c6',  title: "Women's Circle",          type: 'meeting',    mode: 'community', start: dn(3, 18),     end: dn(3, 19, 30), location: 'Room 204',           description: 'Bi-weekly fellowship' },
  { id: 'c7',  title: "Men's Fellowship",        type: 'meeting',    mode: 'community', start: dn(3, 19),     end: dn(3, 20, 30), location: 'Fellowship Hall',    description: 'Men\'s accountability group' },
  { id: 'c8',  title: 'Deacons Meeting',         type: 'meeting',    mode: 'community', start: dn(5, 18),     end: dn(5, 19),     location: 'Conference Room' },
  { id: 'c9',  title: 'Bible Study',             type: 'service',    mode: 'community', start: dn(5, 19),     end: dn(5, 20, 30), location: 'Room 101',           description: 'Book of Romans — Chapter 8' },
  { id: 'c10', title: 'Volunteer Training',      type: 'volunteer',  mode: 'community', start: dn(6, 14),     end: dn(6, 16),     location: 'Fellowship Hall',    description: 'New volunteer orientation' },
  { id: 'c11', title: 'Sunday Service',          type: 'service',    mode: 'community', start: dn(11, 10),    end: dn(11, 12),    location: 'Main Sanctuary' },
  { id: 'c12', title: 'Leadership Council',      type: 'meeting',    mode: 'community', start: dn(10, 14),    end: dn(10, 16),    location: 'Conference Room',    description: 'Monthly leadership alignment' },
  { id: 'c13', title: 'Prayer Warriors',         type: 'service',    mode: 'community', start: dn(7, 6),      end: dn(7, 7),      location: 'Prayer Room',        description: 'Early morning intercession' },
  { id: 'c14', title: 'Young Adults Night',      type: 'event',      mode: 'community', start: dn(9, 19),     end: dn(9, 21),     location: 'Fellowship Hall',    description: 'Game night + fellowship' },
  { id: 'c15', title: 'Food Pantry',             type: 'volunteer',  mode: 'community', start: dn(12, 9),     end: dn(12, 12),    location: 'Outreach Center' },
  { id: 'c16', title: 'Sunday Service',          type: 'service',    mode: 'community', start: dn(18, 10),    end: dn(18, 12),    location: 'Main Sanctuary' },
  { id: 'cd1', title: 'Easter Sunday',           type: 'event',      mode: 'community', start: dn(11, 0),     end: dn(11, 23, 59), allDay: true, location: 'Main Campus' },
  // Personal
  { id: 'p1',  title: 'Coffee with Marcus',      type: 'meeting',    mode: 'personal',  start: dn(0, 9),      end: dn(0, 10),     location: 'Blue Bottle Coffee',  description: 'Catch up + brand strategy chat' },
  { id: 'p2',  title: 'Content Shoot',           type: 'event',      mode: 'personal',  start: dn(0, 13),     end: dn(0, 16),     location: 'Studio 4',            description: 'Spring campaign photos + reels' },
  { id: 'p3',  title: 'Brand Review Call',       type: 'meeting',    mode: 'personal',  start: dn(1, 11),     end: dn(1, 12),     location: 'Zoom',                description: 'Q2 sponsorship check-in' },
  { id: 'p4',  title: 'Post Content',            type: 'reminder',   mode: 'personal',  start: dn(1, 17),     end: dn(1, 17, 15) },
  { id: 'p5',  title: 'Podcast Recording',       type: 'event',      mode: 'personal',  start: dn(3, 14),     end: dn(3, 16),     location: 'Studio B',            description: 'Episode 42 — guest: Coach Reeves' },
  { id: 'p6',  title: 'Weekly Planning',         type: 'reminder',   mode: 'personal',  start: dn(4, 8),      end: dn(4, 8, 30) },
  { id: 'p7',  title: 'Sponsorship Dinner',      type: 'event',      mode: 'personal',  start: dn(5, 19),     end: dn(5, 21, 30), location: 'The Capital Grille',  description: 'Nike partnership kickoff' },
  { id: 'p8',  title: 'Content Calendar Review', type: 'meeting',    mode: 'personal',  start: dn(7, 10),     end: dn(7, 11),     location: 'Zoom' },
  { id: 'p9',  title: 'Media Day',               type: 'event',      mode: 'personal',  start: dn(9, 9),      end: dn(9, 17),     location: 'Convention Center',   description: 'Annual athlete media appearances' },
  { id: 'p10', title: 'Reply to DMs',            type: 'reminder',   mode: 'personal',  start: dn(10, 18),    end: dn(10, 18, 15) },
];

// ── WeekRow ───────────────────────────────────────────────────────────────────

function WeekRow({
  selectedDate, onSelectDate, onNavigate, onPullDown, events, C, styles,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onNavigate: (weeks: number) => void;
  onPullDown: () => void;
  events: AgendaEvent[];
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const t = today();
  const hasEvent = useCallback(
    (d: Date) => events.some(e => isSameDay(e.start, d) && !e.allDay),
    [events],
  );

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder:  () => false,
    onMoveShouldSetPanResponder:   (_, gs) =>
      (Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy)) ||
      (gs.dy > 12 && gs.dy > Math.abs(gs.dx) * 1.5),
    onPanResponderRelease: (_, gs) => {
      if (Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 40) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onNavigate(gs.dx < 0 ? 1 : -1);
      } else if (gs.dy > 60) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPullDown();
      }
    },
  }), [onNavigate, onPullDown]);

  return (
    <View style={styles.weekRowWrap} {...pan.panHandlers}>
      <View style={styles.weekRow}>
        {weekDays.map((d, i) => {
          const isSel   = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, t);
          return (
            <Pressable key={i} style={styles.dayCell} onPress={() => onSelectDate(d)}>
              <Text style={[styles.dayLabel, isToday && { color: C.accent }]}>{DAY_LABELS[i]}</Text>
              <View style={[styles.dayNum, isSel && { backgroundColor: C.activePill }]}>
                <Text style={[
                  styles.dayNumText,
                  isSel    && { color: C.activePillText },
                  isToday  && !isSel && { color: C.accent },
                ]}>
                  {d.getDate()}
                </Text>
              </View>
              {hasEvent(d) && !isSel && (
                <View style={[styles.eventDot, { backgroundColor: C.accent }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── MonthGrid ─────────────────────────────────────────────────────────────────

function MonthGrid({
  selectedDate, onSelectDate, onNavigate, onPullUp, events, C, styles,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onNavigate: (months: number) => void;
  onPullUp: () => void;
  events: AgendaEvent[];
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const grid = useMemo(() => getMonthGrid(selectedDate), [selectedDate]);
  const t = today();
  const evtsForDay = useCallback(
    (d: Date) => events.filter(e => isSameDay(e.start, d) && !e.allDay),
    [events],
  );

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder:  () => false,
    onMoveShouldSetPanResponder:   (_, gs) =>
      (Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy)) ||
      (gs.dy < -12 && Math.abs(gs.dy) > Math.abs(gs.dx) * 1.5),
    onPanResponderRelease: (_, gs) => {
      if (Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 40) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onNavigate(gs.dx < 0 ? 1 : -1);
      } else if (gs.dy < -60) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPullUp();
      }
    },
  }), [onNavigate, onPullUp]);

  return (
    <View style={styles.monthGridWrap} {...pan.panHandlers}>
      <Text style={styles.monthGridTitle}>{fmtMonthYear(selectedDate)}</Text>
      <View style={styles.weekRow}>
        {DAY_LABELS.map(l => (
          <View key={l} style={styles.monthHeaderCell}>
            <Text style={styles.dayLabel}>{l}</Text>
          </View>
        ))}
      </View>
      {grid.map((week, ri) => (
        <View key={ri} style={styles.monthWeekRow}>
          {week.map((d, ci) => {
            if (!d) return <View key={ci} style={styles.monthCell} />;
            const isSel   = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, t);
            const dots    = evtsForDay(d);
            return (
              <Pressable
                key={ci}
                style={[styles.monthCell, isSel && { backgroundColor: C.surfacePressed }]}
                onPress={() => onSelectDate(d)}
              >
                <View style={[styles.dayNum, { width: 26, height: 26 }, isSel && { backgroundColor: C.activePill }]}>
                  <Text style={[
                    styles.dayNumText, { fontSize: 13 },
                    isSel   && { color: C.activePillText },
                    isToday && !isSel && { color: C.accent },
                  ]}>
                    {d.getDate()}
                  </Text>
                </View>
                <View style={styles.monthDots}>
                  {dots.slice(0, 3).map(ev => (
                    <View key={ev.id} style={[styles.eventDot, { backgroundColor: eventColor(ev.type, ev.mode) }]} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── SharedTimeline ────────────────────────────────────────────────────────────

function SharedTimeline({
  selectedDate, events, expandedId, onExpand, onCreateAtTime, C, styles, evAreaWidth, role,
}: {
  selectedDate: Date;
  events: AgendaEvent[];
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  onCreateAtTime: (time: Date) => void;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
  evAreaWidth: number;
  role: string;
  isAdmin: boolean;
}) {
  const scrollRef  = useRef<ScrollView>(null);
  const isToday    = isSameDay(selectedDate, today());
  const now        = new Date();

  // Auto-scroll to current time (or 7am) when selected date changes
  useEffect(() => {
    const target = isToday
      ? Math.max(0, timeTop(now) - 100)
      : (7 - T_START) * HOUR_H;
    const t = setTimeout(() => scrollRef.current?.scrollTo({ y: target, animated: false }), 80);
    return () => clearTimeout(t);
  }, [selectedDate]);

  const allDayEvts = useMemo(
    () => events.filter(e => e.allDay && isSameDay(e.start, selectedDate)),
    [events, selectedDate],
  );
  const laid = useMemo(
    () => layoutDayEvents(events.filter(e => isSameDay(e.start, selectedDate))),
    [events, selectedDate],
  );
  const hours  = Array.from({ length: T_END - T_START + 1 }, (_, i) => T_START + i);
  const nowTop = isToday ? timeTop(now) : -1;

  return (
    <View style={{ flex: 1, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
      {/* All-day bar */}
      {allDayEvts.length > 0 && (
        <View style={styles.allDayBar}>
          <Text style={styles.allDayLabel}>all-day</Text>
          <View style={styles.allDayList}>
            {allDayEvts.map(ev => {
              const color = eventColor(ev.type, ev.mode);
              return (
                <View key={ev.id} style={[styles.allDayChip, { backgroundColor: color + '20', borderLeftColor: color }]}>
                  <Text style={[styles.allDayText, { color }]} numberOfLines={1}>{ev.title}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Timeline */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={{ height: (T_END - T_START) * HOUR_H + 8, marginTop: 4 }}>

          {/* Hour lines */}
          {hours.map(h => (
            <View key={h} style={[styles.hourRow, { top: (h - T_START) * HOUR_H }]}>
              <Text style={styles.hourLabel}>{fmtHour(h)}</Text>
              <View style={styles.hourLine} />
            </View>
          ))}

          {/* Current time indicator */}
          {nowTop >= 0 && nowTop <= (T_END - T_START) * HOUR_H && (
            <View style={[styles.nowLine, { top: nowTop }]}>
              <View style={[styles.nowDot, { backgroundColor: C.accent }]} />
              <View style={[styles.nowBar, { backgroundColor: C.accent }]} />
            </View>
          )}

          {/* Empty-slot tap layer — behind events */}
          <Pressable
            style={{ position: 'absolute', left: TL_LEFT, right: 0, top: 0, bottom: 0, zIndex: 1 }}
            onPress={e => {
              const y    = e.nativeEvent.locationY;
              const hour = Math.min(Math.floor(y / HOUR_H) + T_START, T_END - 1);
              const min  = Math.round((y % HOUR_H) / HOUR_H * 60 / 15) * 15 % 60;
              const time = new Date(selectedDate);
              time.setHours(hour, min, 0, 0);
              onCreateAtTime(time);
            }}
          />

          {/* Event blocks */}
          {laid.map(ev => {
            const top    = timeTop(ev.start);
            const height = timeDuration(ev.start, ev.end);
            const isExp  = expandedId === ev.id;
            const color  = eventColor(ev.type, ev.mode);
            const colW   = evAreaWidth / ev.totalCols;
            const left   = TL_LEFT + ev.colIndex * colW + 2;
            const width  = colW - 4;

            return (
              <Pressable
                key={ev.id}
                style={[
                  styles.tlEvent,
                  {
                    top, left, width,
                    minHeight: isExp ? Math.max(height, 100) : height,
                    backgroundColor: color + '1A',
                    borderLeftColor: color,
                    zIndex: isExp ? 10 : 2,
                  },
                ]}
                onPress={() => onExpand(isExp ? null : ev.id)}
              >
                <Text style={[styles.evTitle, { color }]} numberOfLines={isExp ? undefined : 1}>{ev.title}</Text>
                <Text style={[styles.evTime,  { color: color + 'CC' }]}>{fmtTime(ev.start)} – {fmtTime(ev.end)}</Text>
                {ev.location && <Text style={[styles.evLoc, { color: color + '88' }]} numberOfLines={1}>{ev.location}</Text>}
                {isExp && ev.description && <Text style={[styles.evDesc, { color: color + 'AA' }]}>{ev.description}</Text>}
                {isExp && (
                  <View style={styles.evActions}>
                    {isAdmin ? (
                      <>
                        <Pressable style={[styles.evBtn, { borderColor: color + '44' }]}>
                          <Text style={[styles.evBtnText, { color }]}>Edit</Text>
                        </Pressable>
                        <Pressable style={[styles.evBtn, { borderColor: C.separator }]}>
                          <Text style={[styles.evBtnText, { color: C.red }]}>Delete</Text>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Pressable style={[styles.evBtn, { borderColor: C.accent + '44' }]}>
                          <Text style={[styles.evBtnText, { color: C.accent }]}>Accept</Text>
                        </Pressable>
                        <Pressable style={[styles.evBtn, { borderColor: C.separator }]}>
                          <Text style={[styles.evBtnText, { color: C.secondary }]}>Decline</Text>
                        </Pressable>
                        <Pressable style={[styles.evBtn, { borderColor: C.separator }]}>
                          <Text style={[styles.evBtnText, { color: C.secondary }]}>+ Calendar</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}

          {laid.length === 0 && (
            <View style={styles.emptyDay}>
              <Text style={styles.emptyText}>No events</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── ListView ──────────────────────────────────────────────────────────────────

function ListView({ events, C, styles }: {
  events: AgendaEvent[];
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const sections = useMemo(() => {
    const sorted = [...events]
      .filter(e => !e.allDay)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    const map = new Map<string, AgendaEvent[]>();
    for (const ev of sorted) {
      const key = sod(ev.start).toISOString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return Array.from(map.entries()).map(([key, data]) => ({ date: new Date(key), data }));
  }, [events]);

  const upcomingCount = useMemo(() => events.filter(e => !e.allDay).length, [events]);
  const thisWeekCount = useMemo(
    () => events.filter(e => !e.allDay && e.start <= addDays(_today, 7)).length,
    [events],
  );
  const nextEvent = useMemo(
    () => events.filter(e => !e.allDay).sort((a, b) => a.start.getTime() - b.start.getTime())[0],
    [events],
  );

  const busyDays = useMemo(() => {
    const dayCounts = new Map<string, number>();
    events.filter(e => !e.allDay).forEach(e => {
      const k = sod(e.start).toISOString();
      dayCounts.set(k, (dayCounts.get(k) ?? 0) + 1);
    });
    let max = 0; let busyKey = '';
    dayCounts.forEach((v, k) => { if (v > max) { max = v; busyKey = k; } });
    return busyKey ? new Date(busyKey).toLocaleDateString('en-US', { weekday: 'long' }) : 'N/A';
  }, [events]);

  const totalMeetingMins = useMemo(() =>
    events.filter(e => !e.allDay && e.start >= _today && e.start <= addDays(_today, 7))
      .reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / 60000, 0),
    [events]);

  const DEADLINES = [
    { title: 'Q1 Report',      due: 'Friday', icon: 'doc.text.fill',       color: '#B85C5C' },
    { title: 'Investor Deck',  due: 'Monday', icon: 'chart.bar.fill',       color: '#1A1714' },
    { title: 'Tax Filing',     due: 'Apr 15', icon: 'dollarsign.circle.fill', color: '#5A8A6E' },
  ];

  const ListHeader = (
    <View style={{ paddingTop: 8, paddingBottom: 4, gap: 8 }}>
      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: C.label, lineHeight: 30 }}>{upcomingCount}</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Upcoming</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: C.label, lineHeight: 30 }}>{thisWeekCount}</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>This week</Text>
        </View>
      </View>
      {/* Next Up — full width prominent card */}
      {nextEvent && (
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: eventColor(nextEvent.type, nextEvent.mode) }} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Next Up</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }} numberOfLines={1}>{nextEvent.title}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginTop: 3 }}>
                {fmtTime(nextEvent.start)} – {fmtTime(nextEvent.end)}{nextEvent.location ? `  ·  ${nextEvent.location}` : ''}
              </Text>
              {nextEvent.attendees && nextEvent.attendees.length > 0 && (
                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  {nextEvent.attendees.slice(0, 4).map((a, i) => (
                    <View key={i} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: `hsl(${a.hue},50%,50%)`, alignItems: 'center', justifyContent: 'center', marginLeft: i > 0 ? -6 : 0, borderWidth: 1.5, borderColor: C.surface }}>
                      <Text style={{ fontSize: 8, fontWeight: '700', color: '#fff' }}>{a.initials}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {nextEvent.virtual && (
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: C.accent, marginLeft: 12 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Join</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const ListFooter = (
    <View style={{ gap: 16, paddingTop: 8, paddingBottom: 32 }}>
      {/* This Week Summary */}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>This Week Summary</Text>
        {[
          { label: 'Total meetings',  value: `${thisWeekCount}` },
          { label: 'Meeting time',    value: `${Math.round(totalMeetingMins / 60)}h ${Math.round(totalMeetingMins % 60)}m` },
          { label: 'Busiest day',     value: busyDays },
          { label: 'Virtual / In-person', value: `${events.filter(e => e.virtual && e.start >= _today && e.start <= addDays(_today, 7)).length} / ${events.filter(e => !e.virtual && !e.allDay && e.start >= _today && e.start <= addDays(_today, 7)).length}` },
        ].map((item, i) => (
          <View key={item.label} style={[{ flexDirection: 'row', justifyContent: 'space-between' }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 8 }]}>
            <Text style={{ fontSize: 13, color: C.secondary }}>{item.label}</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Deadlines */}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Upcoming Deadlines</Text>
        {DEADLINES.map((d, i) => (
          <View key={d.title} style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 8 }]}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${d.color}18`, alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name={d.icon as any} size={15} color={d.color} />
            </View>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: C.label }}>{d.title}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: d.color }}>Due {d.due}</Text>
          </View>
        ))}
      </View>

      {/* Quick Add suggestions */}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Quick Add</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['Block focus time', 'Schedule 1:1', 'Add deadline', 'Team lunch'].map(label => (
            <Pressable
              key={label}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={({ pressed }) => ({ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.inputBorder, backgroundColor: pressed ? C.surfacePressed : 'transparent' })}
            >
              <Text style={{ fontSize: 13, color: C.label }}>+ {label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  if (sections.length === 0) {
    return <View style={styles.emptyDay}><Text style={styles.emptyText}>No upcoming events</Text></View>;
  }

  return (
    <SectionList
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      sections={sections}
      keyExtractor={ev => ev.id}
      stickySectionHeadersEnabled
      renderSectionHeader={({ section: { date } }) => (
        <View style={[styles.listHeader, { backgroundColor: C.bg }]}>
          <Text style={styles.listHeaderText}>{fmtListDate(date)}</Text>
        </View>
      )}
      renderSectionFooter={() => <View style={{ height: 6 }} />}
      renderItem={({ item: ev, index, section }) => {
        const color   = eventColor(ev.type, ev.mode);
        const isFirst = index === 0;
        const isLast  = index === section.data.length - 1;
        return (
          <Pressable
            style={[
              styles.listRow,
              { backgroundColor: C.surface, alignItems: 'flex-start', paddingVertical: 12 },
              isFirst && { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
              isLast  && { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
              !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            {/* Time column */}
            <View style={{ width: 52 }}>
              <Text style={styles.listTime}>{fmtTime(ev.start)}</Text>
              <Text style={[styles.listTime, { fontSize: 10, color: C.muted }]}>{fmtTime(ev.end)}</Text>
            </View>
            <View style={[styles.listBar, { backgroundColor: color, marginTop: 2 }]} />
            {/* Content */}
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{ev.title}</Text>
              {ev.location && <Text style={styles.listLoc}>{ev.location}</Text>}
              {/* Attendee avatars */}
              {ev.attendees && ev.attendees.length > 0 && (
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                  {ev.attendees.slice(0, 5).map((a, i) => (
                    <View key={i} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: `hsl(${a.hue},50%,50%)`, alignItems: 'center', justifyContent: 'center', marginLeft: i > 0 ? -5 : 0, borderWidth: 1.5, borderColor: C.surface }}>
                      <Text style={{ fontSize: 7, fontWeight: '700', color: '#fff' }}>{a.initials}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {/* Join button for virtual or chevron */}
            {ev.virtual ? (
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: color + '20', borderWidth: 1, borderColor: color, marginTop: 1 }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color }}> Join</Text>
              </Pressable>
            ) : (
              <IconSymbol name="chevron.right" size={12} color={C.muted} style={{ marginTop: 3 }} />
            )}
          </Pressable>
        );
      }}
    />
  );
}

// ── WeekView ──────────────────────────────────────────────────────────────────

function WeekView({
  selectedDate, onSelectDate, onNavigate, events, C, styles,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onNavigate: (weeks: number) => void;
  events: AgendaEvent[];
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const t = today();

  return (
    <View style={{ flex: 1 }}>
      <WeekRow
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onNavigate={onNavigate}
        onPullDown={() => {}}
        events={events}
        C={C}
        styles={styles}
      />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
      >
        {weekDays.map((day, dayIdx) => {
          const allDayEvts = events.filter(e => e.allDay && isSameDay(e.start, day));
          const timedEvts  = events
            .filter(e => !e.allDay && isSameDay(e.start, day))
            .sort((a, b) => a.start.getTime() - b.start.getTime());
          if (timedEvts.length === 0 && allDayEvts.length === 0) return null;
          const isToday = isSameDay(day, t);
          return (
            <View key={dayIdx} style={{ marginBottom: 4 }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: isToday ? C.accent : C.secondary }}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day.getDay()]} {day.getDate()}
                </Text>
              </View>
              {allDayEvts.map(ev => {
                const color = eventColor(ev.type, ev.mode);
                return (
                  <View key={ev.id} style={{ marginHorizontal: 16, marginBottom: 4, borderRadius: 8, backgroundColor: color + '20', borderLeftWidth: 3, borderLeftColor: color, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color }} numberOfLines={1}>{ev.title}</Text>
                  </View>
                );
              })}
              {timedEvts.map(ev => {
                const color = eventColor(ev.type, ev.mode);
                return (
                  <Pressable
                    key={ev.id}
                    style={({ pressed }) => ({
                      marginHorizontal: 16, marginBottom: 6, borderRadius: 10,
                      backgroundColor: pressed ? C.surfacePressed : C.surface,
                      borderLeftWidth: 3, borderLeftColor: color,
                      paddingHorizontal: 12, paddingVertical: 10,
                    })}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{ev.title}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{fmtTime(ev.start)} – {fmtTime(ev.end)}</Text>
                    {ev.location && <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }} numberOfLines={1}>{ev.location}</Text>}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        {weekDays.every(day => {
          const all = events.filter(e => isSameDay(e.start, day));
          return all.length === 0;
        }) && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 14, color: C.muted }}>No events this week</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── CreateEventSheet ──────────────────────────────────────────────────────────

type RepeatOption   = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
type ReminderOption = 'none' | '5min' | '15min' | '30min' | '1hr' | '1day';
interface Attendee  { id: string; name: string; handle: string; role: string; brand: string; }

const REPEAT_OPTIONS: { key: RepeatOption; label: string }[] = [
  { key: 'none', label: 'None' }, { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' }, { key: 'monthly', label: 'Monthly' },
  { key: 'custom', label: 'Custom' },
];

const REMINDER_OPTIONS: { key: ReminderOption; label: string }[] = [
  { key: 'none', label: 'None' }, { key: '5min', label: '5 min' },
  { key: '15min', label: '15 min' }, { key: '30min', label: '30 min' },
  { key: '1hr', label: '1 hour' }, { key: '1day', label: '1 day' },
];

// Cross-brand contact pool — searched globally regardless of active brand.
const MOCK_ATTENDEES: Attendee[] = [
  // KaNeXT — Business
  { id: 'at01', name: 'Marcus Webb',       handle: '@mwebb',     role: 'Product Lead',     brand: 'KaNeXT' },
  { id: 'at02', name: 'Priya Sharma',      handle: '@psharma',   role: 'Engineer',         brand: 'KaNeXT' },
  { id: 'at03', name: 'Devon Hughes',      handle: '@dhughes',   role: 'Designer',         brand: 'KaNeXT' },
  { id: 'at04', name: 'Nia Okonkwo',       handle: '@nokonkwo',  role: 'Marketing',        brand: 'KaNeXT' },
  // LU Men's Basketball — Sports
  { id: 'at05', name: 'Jordan Hayes',      handle: '@jhayes',    role: 'Guard',            brand: "LU Men's Basketball" },
  { id: 'at06', name: 'Trey Coleman',      handle: '@tcoleman',  role: 'Forward',          brand: "LU Men's Basketball" },
  { id: 'at07', name: 'Marcus Price',      handle: '@mprice',    role: 'Head Coach',       brand: "LU Men's Basketball" },
  { id: 'at08', name: 'Riley Johnson',     handle: '@rjohnson',  role: 'Athletic Trainer', brand: "LU Men's Basketball" },
  // Lincoln University — Education
  { id: 'at09', name: 'Dr. Angela Ross',   handle: '@aross',     role: 'Professor',        brand: 'Lincoln University' },
  { id: 'at10', name: 'Sam Chen',          handle: '@schen',     role: 'Student',          brand: 'Lincoln University' },
  { id: 'at11', name: 'Morgan Davis',      handle: '@mdavis',    role: 'Advisor',          brand: 'Lincoln University' },
  // ICCLA — Community
  { id: 'at12', name: 'Pastor Leon King',  handle: '@lking',     role: 'Senior Pastor',    brand: 'ICCLA' },
  { id: 'at13', name: 'Casey Brown',       handle: '@cbrown',    role: 'Worship Director', brand: 'ICCLA' },
  { id: 'at14', name: 'Quinn Martinez',    handle: '@qmartinez', role: 'Youth Minister',   brand: 'ICCLA' },
  { id: 'at15', name: 'Taylor Kim',        handle: '@tkim',      role: 'Volunteer',        brand: 'ICCLA' },
  // Sammy Kalejaiye — Personal
  { id: 'at16', name: 'Alex Rivera',       handle: '@arivera',   role: 'Owner',            brand: 'Sammy Kalejaiye' },
];

const CATEGORY_OPTIONS: { type: EventType; label: string }[] = [
  { type: 'game', label: 'Game' }, { type: 'practice', label: 'Practice' },
  { type: 'travel', label: 'Travel' }, { type: 'meeting', label: 'Meeting' },
  { type: 'recruiting', label: 'Recruiting' }, { type: 'call', label: 'Call' },
  { type: 'deadline', label: 'Deadline' }, { type: 'class', label: 'Class' },
  { type: 'exam', label: 'Exam' }, { type: 'service', label: 'Service' },
  { type: 'event', label: 'Event' }, { type: 'registration', label: 'Registration' },
  { type: 'volunteer', label: 'Volunteer' }, { type: 'reminder', label: 'Reminder' },
  { type: 'other', label: 'Other' },
];

function CreateEventSheet({ selectedDate, initialTime, onClose, C }: {
  selectedDate: Date;
  initialTime: Date | null;
  onClose: () => void;
  C: ComponentColors;
}) {
  const [title,        setTitle]        = useState('');
  const [loc,          setLoc]          = useState('');
  const [notes,        setNotes]        = useState('');
  const [allDay,       setAllDay]       = useState(false);
  const [category,     setCategory]     = useState<EventType>('event');
  const [repeat,       setRepeat]       = useState<RepeatOption>('none');
  const [showRepeat,   setShowRepeat]   = useState(false);
  const [reminder,     setReminder]     = useState<ReminderOption>('none');
  const [showReminder, setShowReminder] = useState(false);
  const [attendeeQ,    setAttendeeQ]    = useState('');
  const [attendees,    setAttendees]    = useState<Attendee[]>([]);

  const displayTime = initialTime
    ? `${fmtTime(initialTime)} – ${fmtTime(new Date(initialTime.getTime() + 3600000))}`
    : '9:00 AM – 10:00 AM';

  const attendeeResults = useMemo(() => {
    if (!attendeeQ.trim()) return [];
    const q = attendeeQ.toLowerCase();
    return MOCK_ATTENDEES.filter(a =>
      !attendees.find(s => s.id === a.id) &&
      (a.name.toLowerCase().includes(q) ||
       a.handle.toLowerCase().includes(q) ||
       a.role.toLowerCase().includes(q) ||
       a.brand.toLowerCase().includes(q))
    );
  }, [attendeeQ, attendees]);

  const addAttendee    = (a: Attendee) => { setAttendees(p => [...p, a]); setAttendeeQ(''); };
  const removeAttendee = (id: string)  => setAttendees(p => p.filter(a => a.id !== id));

  // Shared card container + row styles
  const card = {
    backgroundColor: C.surfacePressed, borderWidth: 1, borderColor: C.inputBorder,
    borderRadius: 14, overflow: 'hidden',
  } as const;
  const row = {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
  } as const;
  const lastRow = { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 } as const;

  const SectionLabel = ({ text }: { text: string }) => (
    <Text style={{ fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 20, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {text}
    </Text>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Nav */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Pressable onPress={onClose}>
          <Text style={{ fontSize: 16, color: C.secondary }}>Cancel</Text>
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '600', color: C.label }}>New Event</Text>
        <Pressable onPress={onClose}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: C.accent }}>Add</Text>
        </Pressable>
      </View>

      {/* Title */}
      <SectionLabel text="Title" />
      <View style={card}>
        <TextInput
          style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingVertical: 13 }}
          placeholder="Event title"
          placeholderTextColor={C.muted}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
      </View>

      {/* Date & Time */}
      <SectionLabel text="Date & Time" />
      <View style={card}>
        <View style={row}>
          <Text style={{ flex: 1, fontSize: 15, color: C.label }}>All Day</Text>
          <Switch
            value={allDay}
            onValueChange={setAllDay}
            trackColor={{ false: C.separator, true: C.accent }}
            thumbColor="#fff"
          />
        </View>
        <View style={allDay ? lastRow : row}>
          <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Date</Text>
          <Text style={{ fontSize: 15, color: C.secondary }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        {!allDay && (
          <View style={lastRow}>
            <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Time</Text>
            <Text style={{ fontSize: 15, color: C.secondary }}>{displayTime}</Text>
          </View>
        )}
      </View>

      {/* Category */}
      <SectionLabel text="Category" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {CATEGORY_OPTIONS.map(opt => {
          const color    = eventColor(opt.type);
          const isActive = category === opt.type;
          return (
            <Pressable
              key={opt.type}
              onPress={() => setCategory(opt.type)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, flexShrink: 0,
                backgroundColor: isActive ? color + '20' : C.surfacePressed,
                borderWidth: 1.5, borderColor: isActive ? color : C.separator,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
              <Text style={{ fontSize: 13, fontWeight: isActive ? '600' : '500', color: isActive ? color : C.secondary }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Schedule (Repeat + Reminder) */}
      <SectionLabel text="Schedule" />
      <View style={card}>
        {/* Repeat */}
        <Pressable
          style={({ pressed }) => [row, pressed && { backgroundColor: C.surfacePressed }]}
          onPress={() => { setShowRepeat(v => !v); setShowReminder(false); }}
        >
          <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Repeat</Text>
          <Text style={{ fontSize: 15, color: C.secondary, marginRight: 6 }}>
            {REPEAT_OPTIONS.find(o => o.key === repeat)?.label}
          </Text>
          <IconSymbol name={showRepeat ? 'chevron.up' : 'chevron.down'} size={12} color={C.muted} />
        </Pressable>
        {showRepeat && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingVertical: 10 }}
            style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}
          >
            {REPEAT_OPTIONS.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => { setRepeat(opt.key); setShowRepeat(false); }}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, flexShrink: 0,
                  backgroundColor: repeat === opt.key ? C.label : 'transparent',
                  borderWidth: 1.5, borderColor: repeat === opt.key ? C.label : C.separator,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: repeat === opt.key ? C.bg : C.secondary }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        {/* Reminder */}
        <Pressable
          style={({ pressed }) => [lastRow, pressed && { backgroundColor: C.surfacePressed }]}
          onPress={() => { setShowReminder(v => !v); setShowRepeat(false); }}
        >
          <Text style={{ flex: 1, fontSize: 15, color: C.label }}>Reminder</Text>
          <Text style={{ fontSize: 15, color: C.secondary, marginRight: 6 }}>
            {REMINDER_OPTIONS.find(o => o.key === reminder)?.label}
          </Text>
          <IconSymbol name={showReminder ? 'chevron.up' : 'chevron.down'} size={12} color={C.muted} />
        </Pressable>
        {showReminder && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingVertical: 10 }}
          >
            {REMINDER_OPTIONS.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => { setReminder(opt.key); setShowReminder(false); }}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, flexShrink: 0,
                  backgroundColor: reminder === opt.key ? C.label : 'transparent',
                  borderWidth: 1.5, borderColor: reminder === opt.key ? C.label : C.separator,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: reminder === opt.key ? C.bg : C.secondary }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Invite Attendees */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 6 }}>
        <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Invite Attendees
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.green + '18', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 }}>
          <IconSymbol name="person.2.fill" size={10} color={C.green} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.green }}>Admin · All brands</Text>
        </View>
      </View>
      <View style={card}>
        {/* Search input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11 }}>
          <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: C.label, padding: 0 }}
            placeholder="Search name, @handle, role, or brand"
            placeholderTextColor={C.muted}
            value={attendeeQ}
            onChangeText={setAttendeeQ}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {attendeeQ.length > 0 && (
            <Pressable onPress={() => setAttendeeQ('')} hitSlop={6}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* Selected pills — below search */}
        {attendees.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 10 }}>
            {attendees.map(a => (
              <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.accent + '18', borderWidth: 1, borderColor: C.accent + '44', borderRadius: 14, paddingLeft: 10, paddingRight: 7, paddingVertical: 5 }}>
                <Text style={{ fontSize: 13, color: C.accent, fontWeight: '500' }}>{a.name}</Text>
                <Pressable onPress={() => removeAttendee(a.id)} hitSlop={8}>
                  <IconSymbol name="xmark.circle.fill" size={14} color={C.accent + 'AA'} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Inline search results */}
        {attendeeResults.map(a => (
          <Pressable
            key={a.id}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 14, paddingVertical: 11,
              borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
            })}
            onPress={() => addAttendee(a)}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.accent + '20', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.accent }}>{a.name[0]}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{a.name}</Text>
                <Text style={{ fontSize: 12, color: C.muted }}>{a.handle}</Text>
              </View>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }} numberOfLines={1}>
                {a.role} · {a.brand}
              </Text>
            </View>
            <IconSymbol name="plus.circle.fill" size={22} color={C.accent} />
          </Pressable>
        ))}

        {/* Empty search state */}
        {attendeeQ.length > 0 && attendeeResults.length === 0 && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: C.muted }}>No contacts found</Text>
          </View>
        )}
      </View>

      {/* Location */}
      <SectionLabel text="Location" />
      <View style={card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 13 }}>
          <IconSymbol name="mappin" size={15} color={C.muted} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: C.label, padding: 0 }}
            placeholder="Add location"
            placeholderTextColor={C.muted}
            value={loc}
            onChangeText={setLoc}
          />
        </View>
      </View>

      {/* Notes */}
      <SectionLabel text="Notes" />
      <View style={card}>
        <TextInput
          style={{ fontSize: 15, color: C.label, paddingHorizontal: 14, paddingVertical: 13, minHeight: 80 }}
          placeholder="Add notes"
          placeholderTextColor={C.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>
    </ScrollView>
  );
}

// ── EditCategoriesSheet ───────────────────────────────────────────────────────

interface PersonalCat { id: string; name: string; color: string; eventCount: number; visible: boolean }

const PERSONAL_CATS_DEFAULT: PersonalCat[] = [
  { id: 'cat1', name: 'Content',   color: '#1A1714', eventCount: 14, visible: true },
  { id: 'cat2', name: 'Meetings',  color: '#E0DBD4', eventCount: 8,  visible: true },
  { id: 'cat3', name: 'Deadlines', color: '#B8943E', eventCount: 3,  visible: true },
  { id: 'cat4', name: 'Personal',  color: '#9C9790', eventCount: 7,  visible: true },
  { id: 'cat5', name: 'Bookings',  color: '#5A8A6E', eventCount: 11, visible: true },
];

const CAT_COLOR_CHOICES = ['#1A1714','#9C9790','#E0DBD4','#B8943E','#5A8A6E','#B85C5C','#8B2500'];

function EditCategoriesSheet({ visible, onClose, C }: { visible: boolean; onClose: () => void; C: ComponentColors }) {
  const [cats, setCats] = React.useState<PersonalCat[]>(PERSONAL_CATS_DEFAULT);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editColor, setEditColor] = React.useState('');
  const [editVisible, setEditVisible] = React.useState(true);

  const openEdit = (cat: PersonalCat) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditVisible(cat.visible);
  };

  const saveEdit = () => {
    setCats(prev => prev.map(c => c.id === editId ? { ...c, name: editName, color: editColor, visible: editVisible } : c));
    setEditId(null);
  };

  const deleteCat = (id: string) => {
    setCats(prev => prev.filter(c => c.id !== id));
    setEditId(null);
  };

  const addCat = () => {
    const id = `cat${Date.now()}`;
    const newCat: PersonalCat = { id, name: 'New Category', color: '#9C9790', eventCount: 0, visible: true };
    setCats(prev => [...prev, newCat]);
    openEdit(newCat);
  };

  const handleClose = () => { setEditId(null); onClose(); };

  return (
    <BottomSheet visible={visible} onClose={handleClose} useModal snapPoints={['55%', '90%']} backgroundColor={C.bg}>
      <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          {editId && (
            <Pressable onPress={() => setEditId(null)} style={{ marginRight: 10, padding: 4 }}>
              <IconSymbol name="chevron.left" size={16} color={C.label} />
            </Pressable>
          )}
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, flex: 1 }}>
            {editId ? 'Edit Category' : 'Categories'}
          </Text>
        </View>

        {editId === null ? (
          /* ── List view ── */
          <>
            {cats.map((cat, idx) => (
              <Pressable
                key={cat.id}
                onPress={() => openEdit(cat)}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingVertical: 13, paddingHorizontal: 4,
                  borderBottomWidth: idx < cats.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                  backgroundColor: pressed ? C.surface : 'transparent',
                  borderRadius: 10,
                })}
              >
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cat.color }} />
                <Text style={{ flex: 1, fontSize: 15, color: cat.visible ? C.label : C.muted }}>
                  {cat.name}
                </Text>
                <Text style={{ fontSize: 13, color: C.secondary, marginRight: 6 }}>
                  {cat.eventCount} events
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={addCat}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 8,
                marginTop: 16, paddingVertical: 12, paddingHorizontal: 4,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <IconSymbol name="plus.circle.fill" size={18} color={C.label} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Add Category</Text>
            </Pressable>
          </>
        ) : (
          /* ── Edit view ── */
          <>
            {/* Name */}
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: C.label, backgroundColor: C.surface, marginBottom: 16 }}
              placeholderTextColor={C.muted}
            />

            {/* Color */}
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Color</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {CAT_COLOR_CHOICES.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setEditColor(c)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, alignItems: 'center', justifyContent: 'center',
                    borderWidth: editColor === c ? 2.5 : 0, borderColor: C.label }}
                >
                  {editColor === c && <IconSymbol name="checkmark" size={13} color={c === '#E0DBD4' ? C.label : '#fff'} />}
                </Pressable>
              ))}
            </View>

            {/* Visibility */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginBottom: 12 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Show on calendar</Text>
              <Switch
                value={editVisible}
                onValueChange={setEditVisible}
                trackColor={{ false: C.separator, true: C.label }}
                thumbColor={C.bg}
              />
            </View>

            {/* Save */}
            <Pressable
              onPress={saveEdit}
              style={({ pressed }) => ({ backgroundColor: C.label, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginBottom: 10, opacity: pressed ? 0.8 : 1 })}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.bg }}>Save</Text>
            </Pressable>

            {/* Delete */}
            <Pressable
              onPress={() => deleteCat(editId)}
              style={({ pressed }) => ({ paddingVertical: 12, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#B85C5C' }}>Delete Category</Text>
            </Pressable>
          </>
        )}
      </View>
    </BottomSheet>
  );
}

// ── SportsHeadCoachAgendaView ─────────────────────────────────────────────────

function SportsHeadCoachAgendaView({ C, insets, cycleRole, role }: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  cycleRole: () => void;
  role: string;
}) {
  const accent = C.label;

  const COACH_EVENTS = [
    // Apr 7 Mon
    { id: 'ch1',  date: 'Apr 7',  time: '7:00 AM',  title: 'Morning Practice',                 evType: 'practice'   as const },
    { id: 'ch2',  date: 'Apr 7',  time: '2:00 PM',  title: 'Film Session',                     evType: 'practice'   as const },
    { id: 'ch3',  date: 'Apr 7',  time: '9:00 PM',  title: 'Coaches Meeting',                  evType: 'coaching'   as const },
    // Apr 8 Tue
    { id: 'ch4',  date: 'Apr 8',  time: '10:00 AM', title: 'Recruiting Visit — J. Davis PG',   evType: 'recruiting' as const },
    { id: 'ch5',  date: 'Apr 8',  time: '3:00 PM',  title: 'Strength & Conditioning',          evType: 'practice'   as const },
    // Apr 9 Wed
    { id: 'ch6',  date: 'Apr 9',  time: '1:00 PM',  title: 'Travel Departs',                   evType: 'travel'     as const },
    { id: 'ch7',  date: 'Apr 9',  time: '6:00 PM',  title: 'Away Game vs. Westview',           evType: 'game'       as const },
    // Apr 11 Fri
    { id: 'ch8',  date: 'Apr 11', time: '11:00 AM', title: 'Academic Check-In',                evType: 'academic'   as const },
    // Apr 14 Mon
    { id: 'ch9',  date: 'Apr 14', time: '7:00 AM',  title: 'Morning Practice',                 evType: 'practice'   as const },
    { id: 'ch10', date: 'Apr 14', time: '2:00 PM',  title: 'Compliance Review',                evType: 'compliance' as const },
    // Apr 15 Tue
    { id: 'ch11', date: 'Apr 15', time: 'All Day',  title: 'Recruiting Contact Period Ends',   evType: 'recruiting' as const },
    // Apr 16 Wed
    { id: 'ch12', date: 'Apr 16', time: '7:00 PM',  title: 'Home Game vs. Riverside',          evType: 'game'       as const },
    // Apr 21 Mon
    { id: 'ch13', date: 'Apr 21', time: '7:00 AM',  title: 'Practice',                         evType: 'practice'   as const },
  ] as const;

  type CoachEventType = 'game' | 'practice' | 'recruiting' | 'travel' | 'academic' | 'compliance' | 'coaching';

  const COACH_DOT_COLORS: Record<CoachEventType, string> = {
    game:       C.label,
    practice:   C.secondary,
    recruiting: '#B8943E',
    travel:     C.separator,
    academic:   '#5A8A6E',
    compliance: '#B85C5C',
    coaching:   C.label,
  };

  const LEGEND_ITEMS: { label: string; evType: CoachEventType }[] = [
    { label: 'Games',      evType: 'game'       },
    { label: 'Practices',  evType: 'practice'   },
    { label: 'Recruiting', evType: 'recruiting' },
    { label: 'Travel',     evType: 'travel'     },
    { label: 'Academic',   evType: 'academic'   },
    { label: 'Compliance', evType: 'compliance' },
  ];

  const grouped: Record<string, typeof COACH_EVENTS[number][]> = {};
  for (const ev of COACH_EVENTS) {
    if (!grouped[ev.date]) grouped[ev.date] = [];
    grouped[ev.date].push(ev);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable style={{ flex: 1, alignItems: 'flex-start' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.separator }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>April 2026</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 120, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

        {/* Legend */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
          {LEGEND_ITEMS.map(li => (
            <View key={li.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COACH_DOT_COLORS[li.evType] }} />
              <Text style={{ fontSize: 11, color: C.secondary }}>{li.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Events list grouped by date */}
        {Object.entries(grouped).map(([date, evs]) => (
          <View key={date} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{date}</Text>
            {evs.map(ev => {
              const dotColor = COACH_DOT_COLORS[ev.evType as CoachEventType] ?? C.label;
              return (
                <View key={ev.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                  <View style={{ marginRight: 12, alignItems: 'center', justifyContent: 'center', width: 12 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{ev.title}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{ev.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

      </ScrollView>

      {/* FAB */}
      <Pressable
        style={{ position: 'absolute', right: 20, bottom: 49 + insets.bottom + 20, width: 52, height: 52, borderRadius: 26, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <IconSymbol name="plus" size={24} color={C.bg} />
      </Pressable>
    </View>
  );
}

// ── SportsPlayerAgendaView ────────────────────────────────────────────────────

function SportsPlayerAgendaView({ C, insets, cycleRole, role }: {
  C: ComponentColors;
  insets: { top: number; bottom: number };
  cycleRole: () => void;
  role: string;
}) {
  const accent = C.label;

  // Week Apr 7–13 (player-visible events only — no recruiting, compliance, coaching)
  const WEEK_EVENTS = [
    { id: 'pl1', day: 'Mon Apr 7',  time: '7:00 AM',  title: 'Morning Practice',  location: 'Main Gym',       evType: 'practice' as const },
    { id: 'pl2', day: 'Mon Apr 7',  time: '2:00 PM',  title: 'Film Session',      location: 'Film Room',      evType: 'practice' as const },
    { id: 'pl3', day: 'Wed Apr 9',  time: '1:00 PM',  title: 'Bus Departs',       location: 'Travel',         evType: 'travel'   as const },
    { id: 'pl4', day: 'Wed Apr 9',  time: '6:00 PM',  title: 'Away Game',         location: 'Westview Arena', evType: 'game'     as const, note: 'Bring: Away uniform, bus boards 1pm' },
    { id: 'pl5', day: 'Fri Apr 11', time: '3:00 PM',  title: 'Team Meeting',      location: 'Locker Room',    evType: 'meeting'  as const },
  ] as const;

  type PlayerEventType = 'game' | 'practice' | 'travel' | 'meeting';

  const PLAYER_DOT_COLORS: Record<PlayerEventType, string> = {
    game:     C.label,
    practice: C.secondary,
    travel:   C.separator,
    meeting:  C.label,
  };

  const grouped: Record<string, typeof WEEK_EVENTS[number][]> = {};
  for (const ev of WEEK_EVENTS) {
    if (!grouped[ev.day]) grouped[ev.day] = [];
    grouped[ev.day].push(ev);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable style={{ flex: 1, alignItems: 'flex-start' }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
          <KMenuButton />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: C.separator }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>My Schedule</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

        {/* Week header */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>WEEK OF APR 7 – 13</Text>

        {/* Events grouped by day */}
        {Object.entries(grouped).map(([day, evs]) => (
          <View key={day} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{day}</Text>
            {evs.map(ev => {
              const dotColor = PLAYER_DOT_COLORS[ev.evType as PlayerEventType] ?? C.label;
              return (
                <View key={ev.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginRight: 12, width: 12, alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{ev.title}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{ev.time} · {ev.location}</Text>
                      {'note' in ev && ev.note ? (
                        <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{ev.note}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Upcoming games */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 12 }}>UPCOMING GAMES</Text>
        {[
          { id: 'pg1', date: 'Wed Apr 9',  title: 'Away Game vs. Westview',  time: '6:00 PM', location: 'Westview Arena' },
          { id: 'pg2', date: 'Wed Apr 16', title: 'Home Game vs. Riverside', time: '7:00 PM', location: 'Home Arena'     },
        ].map(g => (
          <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.label, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{g.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{g.date} · {g.time} · {g.location}</Text>
            </View>
          </View>
        ))}

        {/* Academic deadlines */}
        <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 12 }}>ACADEMIC DEADLINES</Text>
        {[
          { id: 'pa1', title: 'Grade Check Submission', due: 'Apr 11' },
          { id: 'pa2', title: 'Eligibility Form Due',   due: 'Apr 18' },
        ].map(a => (
          <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5A8A6E', marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{a.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Due {a.due}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

// ── Live mode public data ─────────────────────────────────────────────────────

const LIVE_AGENDA_DATA: Record<string, Array<{ id: string; title: string; date: string; time: string; location: string; type: string; hasRsvp?: boolean }>> = {
  personal: [
    { id: '1', title: 'Creator Masterclass — AI for Creators', date: 'Apr 8, 2026', time: '7:00 PM ET', location: 'Zoom (Link sent on RSVP)', type: 'Webinar', hasRsvp: true },
    { id: '2', title: 'Live Q&A: KaNeXT OS Overview', date: 'Apr 15, 2026', time: '6:00 PM PT', location: 'YouTube Live', type: 'Live Stream', hasRsvp: true },
    { id: '3', title: 'Podcast Appearance — Sports Tech Today', date: 'Apr 22, 2026', time: 'TBD', location: 'Online', type: 'Appearance' },
  ],
  business: [
    { id: '1', title: 'KaNeXT Product Demo — Open Registration', date: 'Apr 10, 2026', time: '2:00 PM ET', location: 'Zoom', type: 'Webinar', hasRsvp: true },
    { id: '2', title: 'Investor Office Hours', date: 'Apr 17, 2026', time: '11:00 AM ET', location: 'Virtual', type: 'Meeting', hasRsvp: true },
    { id: '3', title: 'KaNeXT Partner Summit 2026', date: 'May 1, 2026', time: '9:00 AM PT', location: 'Miami, FL', type: 'Conference', hasRsvp: true },
  ],
  education: [
    { id: '1', title: 'Open House', date: 'Apr 15, 2026', time: '10:00 AM PT', location: 'Lincoln University Campus', type: 'Open House', hasRsvp: true },
    { id: '2', title: 'Info Session — Graduate Programs', date: 'Apr 22, 2026', time: '5:00 PM PT', location: 'Zoom', type: 'Info Session', hasRsvp: true },
    { id: '3', title: 'Summer Registration Opens', date: 'May 1, 2026', time: 'All Day', location: 'Online', type: 'Academic Calendar' },
    { id: '4', title: 'Commencement 2026', date: 'May 10, 2026', time: '2:00 PM PT', location: 'Oakland, CA', type: 'Ceremony' },
    { id: '5', title: 'Fall 2026 Classes Begin', date: 'Aug 24, 2026', time: 'All Day', location: 'On Campus', type: 'Academic Calendar' },
  ],
  community: [
    { id: '1', title: 'Sunday Service (AM)', date: 'Every Sunday', time: '9:00 AM', location: 'ICCLA Main Sanctuary', type: 'Service' },
    { id: '2', title: 'Sunday Service (PM)', date: 'Every Sunday', time: '6:00 PM', location: 'ICCLA Main Sanctuary', type: 'Service' },
    { id: '3', title: 'Wednesday Bible Study', date: 'Every Wednesday', time: '7:00 PM', location: 'ICCLA Fellowship Hall', type: 'Bible Study' },
    { id: '4', title: 'Easter Sunday Celebration', date: 'Apr 5, 2026', time: '9:00 AM & 6:00 PM', location: 'ICCLA Main Sanctuary', type: 'Special Service', hasRsvp: true },
    { id: '5', title: 'Community Outreach Day', date: 'Apr 19, 2026', time: '10:00 AM', location: 'Los Angeles, CA', type: 'Outreach', hasRsvp: true },
    { id: '6', title: 'Youth Conference 2026', date: 'May 23-25, 2026', time: 'All Day', location: 'ICCLA Campus', type: 'Conference', hasRsvp: true },
  ],
  sports: [
    { id: '1', title: 'vs. Holy Names University', date: 'Apr 5, 2026', time: '3:00 PM PT', location: 'Lincoln University Gym', type: 'Home Game' },
    { id: '2', title: '@ Dominican University', date: 'Apr 8, 2026', time: '7:00 PM PT', location: 'San Rafael, CA', type: 'Away Game' },
    { id: '3', title: 'vs. Notre Dame de Namur', date: 'Apr 12, 2026', time: '2:00 PM PT', location: 'Lincoln University Gym', type: 'Home Game' },
    { id: '4', title: 'GAAC Championship Game', date: 'Apr 18, 2026', time: 'TBD', location: 'TBD', type: 'Conference Championship' },
  ],
};

function LiveAgendaView({ mode, C, insets }: { mode: string; C: any; insets: any }) {
  const events = LIVE_AGENDA_DATA[mode] ?? LIVE_AGENDA_DATA.personal;
  const typeColors: Record<string, string> = {
    'Home Game': '#5A8A6E',
    'Away Game': '#B85C5C',
    'Conference Championship': '#B8943E',
    'Service': '#5A8A6E',
    'Special Service': '#B8943E',
    default: C.secondary,
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: insets.top + 52, backgroundColor: C.bg }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.label, paddingTop: 8, paddingBottom: 4 }}>Schedule</Text>
        {events.map(ev => (
          <View key={ev.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1, marginRight: 8 }}>{ev.title}</Text>
              <View style={{ backgroundColor: C.separator, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, color: typeColors[ev.type] ?? typeColors.default, fontWeight: '600' }}>{ev.type}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary }}>{ev.date} · {ev.time}</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>{ev.location}</Text>
            {ev.hasRsvp && (
              <Pressable style={{ backgroundColor: C.label, borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>RSVP</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── AgendaScreen ──────────────────────────────────────────────────────────────

// ── RBAC event type visibility for non-admin roles ───────────────────────────
const ROLE_VISIBLE_TYPES_AGENDA: Record<string, EventType[]> = {
  sports:    ['game'],
  education: ['class', 'exam', 'registration', 'event'],
  community: ['service', 'event'],
  business:  ['meeting', 'call', 'event'],
  personal:  ['event', 'meeting', 'reminder'],
};

// ── RBAC role pairs per mode (for Agenda: default pair) ─────────────────────
const AGENDA_ROLE_KEYS: Record<string, string> = {
  sports:    'sports:agenda',
  education: 'education',
  community: 'community:agenda',
  community: 'community',
  business:  'business',
  personal:  'personal:agenda',
};

export default function AgendaScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { state } = useAppContext();
  const mode   = state.activeContext?.mode ?? state.mode ?? 'business';
  const styles = useMemo(() => makeStyles(C), [C]);
  const dataMode = useDataMode();

  const roleKey = AGENDA_ROLE_KEYS[mode] ?? 'business';
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isAdmin = role === roleCycles[0];
  const accent  = MODE_ACCENTS[mode] ?? C.accent;

  const [eduTab,        setEduTab]        = useState<'Calendar' | 'Reminders' | 'Tasks'>('Calendar');
  const [communityTab,  setCommunityTab]  = useState<'Calendar' | 'Reminders' | 'Tasks'>('Calendar');
  const [view,          setView]          = useState<AgendaView>('Week');
  const [showViewDD,    setShowViewDD]    = useState(false);
  const [selectedDate,  setSelectedDate]  = useState(today);
  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [activeFilter,  setActiveFilter]  = useState<FilterKey>('all');
  const [createVisible, setCreateVisible] = useState(false);
  const [createTime,    setCreateTime]    = useState<Date | null>(null);
  const [editCatVisible, setEditCatVisible] = useState(false);
  const [rsvped,         setRsvped]         = useState<Set<string>>(new Set(['pe2']));
  const [communityRsvped, setCommunityRsvped] = useState<Set<string>>(new Set());
  const [rsvpStatus,     setRsvpStatus]     = useState<Record<string, 'going' | 'maybe' | 'no'>>({ pe2: 'going' });
  const [expandedPubId,  setExpandedPubId]  = useState<string | null>(null);

  const filterPills  = MODE_FILTERS[mode] ?? MODE_FILTERS.personal;

  const modeEvents = useMemo(() => {
    return MOCK_EVENTS.filter(e =>
      e.mode === mode &&
      (activeFilter === 'all' || e.type === activeFilter) &&
      (isAdmin || ROLE_VISIBLE_TYPES_AGENDA[mode]?.includes(e.type as EventType) === true),
    );
  }, [mode, activeFilter, isAdmin]);
  const evAreaWidth  = screenWidth - TL_LEFT - 12;

  const handleSelectDate    = useCallback((d: Date) => { setSelectedDate(d); setExpandedId(null); }, []);
  const handleNavigateWeek  = useCallback((n: number) => { setSelectedDate(p => addDays(p, n * 7)); setExpandedId(null); }, []);
  const handleNavigateMonth = useCallback((n: number) => { setSelectedDate(p => addMonths(p, n)); setExpandedId(null); }, []);
  const handleCreateAtTime  = useCallback((time: Date) => { setCreateTime(time); setCreateVisible(true); }, []);

  const router = useRouter();

  useFocusEffect(useCallback(() => {
    if (mode === 'sports') {
      router.replace(isAdmin
        ? '/(tabs)/(main)/agenda/sports-coach-calendar' as any
        : '/(tabs)/(main)/agenda/sports-player-calendar' as any
      );
    }
  }, [mode, isAdmin]));

  if (dataMode === 'live') return <LiveAgendaView mode={mode} C={C} insets={insets} />;

  if (mode === 'sports') return null;

  // ── Business CEO: full calendar with all event types ──────────────────────
  if (mode === 'business' && isAdmin) {
    const CEO_EVENTS = [
      // Apr 7 Mon
      { id: 'cx1',  date: 'Apr 7',  time: '9:00 AM',  title: 'Team Standup',                  type: 'internal',  dotStyle: 'solid' as const },
      { id: 'cx2',  date: 'Apr 7',  time: '2:00 PM',  title: 'Product Review',                type: 'internal',  dotStyle: 'solid' as const },
      { id: 'cx3',  date: 'Apr 7',  time: '4:00 PM',  title: 'Client Call — LU Oakland',      type: 'client',    dotStyle: 'solid' as const },
      // Apr 8 Tue
      { id: 'cx4',  date: 'Apr 8',  time: '10:00 AM', title: 'Investor Meeting — Tiger Global', type: 'board',   dotStyle: 'ring' as const  },
      { id: 'cx5',  date: 'Apr 8',  time: '1:00 PM',  title: 'Sprint Planning',               type: 'internal',  dotStyle: 'solid' as const },
      // Apr 9 Wed
      { id: 'cx6',  date: 'Apr 9',  time: '11:00 AM', title: 'Hiring Interview — Senior Engineer', type: 'hiring', dotStyle: 'solid' as const },
      { id: 'cx7',  date: 'Apr 9',  time: '3:00 PM',  title: 'Client Demo — NAIA Mandate',    type: 'client',    dotStyle: 'solid' as const },
      // Apr 14 Mon
      { id: 'cx8',  date: 'Apr 14', time: '9:00 AM',  title: 'Board Meeting',                 type: 'board',     dotStyle: 'ring' as const  },
      { id: 'cx9',  date: 'Apr 14', time: '4:00 PM',  title: 'All-Hands',                     type: 'internal',  dotStyle: 'solid' as const },
      // Apr 15 Tue
      { id: 'cx10', date: 'Apr 15', time: 'All Day',  title: 'Investor Demo Day',             type: 'board',     dotStyle: 'ring' as const  },
      // Apr 21 Mon
      { id: 'cx11', date: 'Apr 21', time: 'All Day',  title: 'Travel — Chicago Conference',   type: 'travel',    dotStyle: 'solid' as const },
    ] as const;
    type DotStyle = 'solid' | 'ring';
    type CeoEventType = 'internal' | 'client' | 'board' | 'hiring' | 'travel' | 'deadline';
    const CEO_DOT_COLORS: Record<CeoEventType, string> = {
      internal: C.label,
      client:   C.muted,
      board:    C.label,
      hiring:   '#5A8A6E',
      travel:   C.separator,
      deadline: '#B8943E',
    };
    type DotIndicatorProps = { evType: CeoEventType; dotStyle: DotStyle };
    const DotIndicator = ({ evType, dotStyle }: DotIndicatorProps) => {
      const color = CEO_DOT_COLORS[evType] ?? C.label;
      if (dotStyle === 'ring') {
        return (
          <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: color, backgroundColor: 'transparent' }} />
        );
      }
      return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />;
    };
    const LEGEND_ITEMS: { label: string; evType: CeoEventType; dotStyle: DotStyle }[] = [
      { label: 'Internal',        evType: 'internal', dotStyle: 'solid' },
      { label: 'Client',          evType: 'client',   dotStyle: 'solid' },
      { label: 'Board/Investor',  evType: 'board',    dotStyle: 'ring'  },
      { label: 'Hiring',          evType: 'hiring',   dotStyle: 'solid' },
      { label: 'Travel',          evType: 'travel',   dotStyle: 'solid' },
      { label: 'Deadline',        evType: 'deadline', dotStyle: 'solid' },
    ];
    return (
      <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.topLeft} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={styles.viewPill}>
            <Text style={styles.viewPillText}>April 2026</Text>
          </View>
          <View style={[styles.topRight, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 120, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

          {/* Legend */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
            {LEGEND_ITEMS.map(li => (
              <View key={li.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <DotIndicator evType={li.evType} dotStyle={li.dotStyle} />
                <Text style={{ fontSize: 11, color: C.secondary }}>{li.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Events list grouped by date */}
          {(() => {
            const grouped: Record<string, typeof CEO_EVENTS[number][]> = {};
            for (const ev of CEO_EVENTS) {
              if (!grouped[ev.date]) grouped[ev.date] = [];
              grouped[ev.date].push(ev);
            }
            return Object.entries(grouped).map(([date, evs]) => (
              <View key={date} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{date}</Text>
                {evs.map(ev => (
                  <View key={ev.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                    <View style={{ marginRight: 12, alignItems: 'center', justifyContent: 'center', width: 12 }}>
                      <DotIndicator evType={ev.type as CeoEventType} dotStyle={ev.dotStyle} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{ev.title}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{ev.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ));
          })()}

        </ScrollView>

        {/* FAB */}
        <Pressable
          style={[styles.fab, { bottom: 49 + insets.bottom + 20 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={24} color={C.bg} />
        </Pressable>
      </View>
    );
  }

  // ── Business Customer: meeting list + deliverables ──────────────────────────
  if (mode === 'business') {
    const UPCOMING_MEETINGS = [
      { id: 'bm1', date: 'Apr 9',  time: '3:00 PM',  topic: 'Product Demo & Q&A',  meetType: 'Video',     attendee: 'Sammy Kalejaiye' },
      { id: 'bm2', date: 'Apr 16', time: '11:00 AM', topic: 'Monthly Check-In',     meetType: 'Video',     attendee: 'Sammy Kalejaiye' },
    ];
    const PAST_MEETINGS = [
      { id: 'bmp1', date: 'Mar 26', topic: 'Onboarding Kickoff', notes: 'Notes shared', actionItems: 2 },
    ];
    const DELIVERABLES = [
      { id: 'bd1', date: 'Apr 12', title: 'V2 Integration Docs' },
      { id: 'bd2', date: 'Apr 19', title: 'Q1 Analytics Report' },
    ];
    const MEET_TYPE_ICON: Record<string, string> = { Video: 'video', Call: 'phone', 'In-Person': 'person' };
    return (
      <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.topLeft} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={styles.viewPill}>
            <Text style={styles.viewPillText}>Meetings</Text>
          </View>
          <View style={[styles.topRight, { alignItems: 'flex-end' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: C.surface }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Request</Text>
              </Pressable>
              <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

          {/* Upcoming Meetings */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>UPCOMING MEETINGS</Text>
          {UPCOMING_MEETINGS.map(m => (
            <View key={m.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={(MEET_TYPE_ICON[m.meetType] ?? 'calendar') as any} size={15} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{m.topic}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{m.date} · {m.time} · {m.meetType}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: C.bg }}>SK</Text>
                </View>
                <Text style={{ fontSize: 12, color: C.secondary }}>{m.attendee}</Text>
              </View>
            </View>
          ))}

          {/* Past Meetings */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 10 }}>PAST MEETINGS</Text>
          {PAST_MEETINGS.map(m => (
            <View key={m.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, marginBottom: 4 }}>{m.topic}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 8 }}>{m.date}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="doc.text" size={12} color={C.muted} />
                  <Text style={{ fontSize: 12, color: C.secondary }}>{m.notes}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="checkmark.circle" size={12} color={C.muted} />
                  <Text style={{ fontSize: 12, color: C.secondary }}>{m.actionItems} action items</Text>
                </View>
              </View>
            </View>
          ))}

          {/* Deliverable Deadlines */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 10 }}>DELIVERABLE DEADLINES</Text>
          {DELIVERABLES.map(d => (
            <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#B8943E', marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{d.title}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{d.date}</Text>
              </View>
            </View>
          ))}

        </ScrollView>
      </View>
    );
  }

  // ── Education President: full calendar with TabPill ──────────────────────────
  if (mode === 'education' && isAdmin) {
    const EDU_EVENTS = [
      // Apr 7 Mon
      { id: 'ep_a1', date: 'Apr 7',  time: '10:00 AM', title: 'Registration Opens',           type: 'registration' as const },
      { id: 'ep_a2', date: 'Apr 7',  time: '2:00 PM',  title: 'Dept Chair Meeting',           type: 'meeting'      as const },
      // Apr 8 Tue
      { id: 'ep_a3', date: 'Apr 8',  time: '9:00 AM',  title: 'Budget Review — Academic',     type: 'meeting'      as const },
      // Apr 9 Wed
      { id: 'ep_a4', date: 'Apr 9',  time: '11:00 AM', title: 'Faculty Senate Meeting',       type: 'meeting'      as const },
      // Apr 14 Mon
      { id: 'ep_a5', date: 'Apr 14', time: '2:00 PM',  title: 'Board of Trustees Meeting',   type: 'meeting'      as const },
      { id: 'ep_a6', date: 'Apr 14', time: '10:00 AM', title: 'Add/Drop Deadline',            type: 'deadline'     as const },
      // Apr 21 Mon
      { id: 'ep_a7', date: 'Apr 21', time: 'All Day',  title: 'WSCUC Site Visit — Day 1',    type: 'event'        as const },
    ] as const;
    type EduAdminEventType = 'registration' | 'meeting' | 'deadline' | 'event' | 'exam';
    const EDU_DOT_COLORS: Record<EduAdminEventType, string> = {
      registration: '#B8943E',
      meeting:      C.label,
      deadline:     '#B85C5C',
      event:        C.secondary,
      exam:         '#B85C5C',
    };
    const grouped: Record<string, typeof EDU_EVENTS[number][]> = {};
    for (const ev of EDU_EVENTS) {
      if (!grouped[ev.date]) grouped[ev.date] = [];
      grouped[ev.date].push(ev);
    }
    return (
      <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.topLeft} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          {/* TabPill */}
          <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3, gap: 2 }}>
            {(['Calendar', 'Reminders', 'Tasks'] as const).map(t => {
              const active = eduTab === t;
              return (
                <Pressable key={t} onPress={() => { Haptics.selectionAsync(); setEduTab(t); }} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 17, backgroundColor: active ? C.activePill : 'transparent' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.activePillText : C.secondary }}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.topRight, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary />
          </View>
        </View>

        {/* Reminders placeholder */}
        {eduTab === 'Reminders' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 }}>
            <Text style={{ fontSize: 16, color: C.secondary, fontWeight: '600' }}>Reminders</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginTop: 6, opacity: 0.6 }}>No reminders yet</Text>
          </View>
        )}

        {/* Tasks placeholder */}
        {eduTab === 'Tasks' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 }}>
            <Text style={{ fontSize: 16, color: C.secondary, fontWeight: '600' }}>Tasks</Text>
            <Text style={{ fontSize: 13, color: C.secondary, marginTop: 6, opacity: 0.6 }}>No tasks yet</Text>
          </View>
        )}

        {/* Calendar content */}
        {eduTab === 'Calendar' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 120, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
            {Object.entries(grouped).map(([date, evs]) => (
              <View key={date} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{date}</Text>
                {evs.map(ev => {
                  const dotColor = EDU_DOT_COLORS[ev.type as EduAdminEventType] ?? C.label;
                  return (
                    <View key={ev.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                      <View style={{ marginRight: 12, alignItems: 'center', justifyContent: 'center', width: 12 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{ev.title}</Text>
                        <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{ev.time}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )}

        {/* FAB */}
        <Pressable
          style={[styles.fab, { bottom: 49 + insets.bottom + 20 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={24} color={C.bg} />
        </Pressable>
      </View>
    );
  }

  // ── Education Student: personal class schedule + assignments ────────────────
  if (mode === 'education' && !isAdmin) {
    const MY_COURSES = [
      { id: 'sc1', code: 'BUS 401', title: 'Strategic Management',      days: 'Mon / Wed', time: '6:00 PM – 8:00 PM', room: 'Room 201',  nextClass: 'Mon Apr 7 · 6:00 PM' },
      { id: 'sc2', code: 'MKT 350', title: 'Consumer Behavior',         days: 'Tue / Thu', time: '6:00 PM – 8:00 PM', room: 'Room 105',  nextClass: 'Tue Apr 8 · 6:00 PM' },
      { id: 'sc3', code: 'MBA 520', title: 'Finance & Accounting',      days: 'Monday',    time: '7:00 PM – 9:00 PM', room: 'Room 302',  nextClass: 'Mon Apr 7 · 7:00 PM' },
      { id: 'sc4', code: 'MBA 510', title: 'Organizational Behavior',   days: 'Wednesday', time: '7:00 PM – 9:00 PM', room: 'Room 201',  nextClass: 'Wed Apr 9 · 7:00 PM' },
    ];
    const ASSIGNMENTS = [
      { id: 'as1', course: 'BUS 401', title: 'Case Study: Apple Supply Chain',  due: 'Apr 10 · 11:59 PM', status: 'pending' },
      { id: 'as2', course: 'MBA 520', title: 'Financial Ratios Problem Set',    due: 'Apr 14 · 11:59 PM', status: 'pending' },
      { id: 'as3', course: 'MKT 350', title: 'Consumer Survey Analysis',        due: 'Apr 17 · 11:59 PM', status: 'pending' },
      { id: 'as4', course: 'MBA 510', title: 'Org Culture Reflection Paper',    due: 'Apr 21 · 11:59 PM', status: 'pending' },
    ];
    const CAMPUS_EVENTS = [
      { id: 'ce1', title: 'Lincoln University Info Night',  date: 'Apr 9 · 6:00 PM',  location: 'Student Union' },
      { id: 'ce2', title: 'MBA Networking Mixer',          date: 'Apr 11 · 7:00 PM', location: 'Room 400' },
      { id: 'ce3', title: 'Career Center: Resume Workshop', date: 'Apr 16 · 5:00 PM', location: 'Career Center' },
    ];
    return (
      <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.topLeft} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <KMenuButton />
          </Pressable>
          {/* Static non-tappable pill */}
          <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: C.activePill }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.activePillText }}>Schedule</Text>
          </View>
          <View style={[styles.topRight, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
          </View>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

          {/* Weekly Classes */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{"THIS WEEK'S CLASSES"}</Text>
          {MY_COURSES.map(c => (
            <View key={c.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, letterSpacing: 0.3 }}>{c.code}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{c.room}</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, marginBottom: 6 }}>{c.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <IconSymbol name="calendar" size={12} color={C.muted} />
                <Text style={{ fontSize: 12, color: C.secondary }}>{c.days} · {c.time}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <IconSymbol name="clock" size={12} color={C.muted} />
                <Text style={{ fontSize: 12, color: C.muted }}>Next: {c.nextClass}</Text>
              </View>
            </View>
          ))}

          {/* Assignments Due */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 10 }}>UPCOMING ASSIGNMENTS</Text>
          {ASSIGNMENTS.map(a => (
            <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.label, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{a.title}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{a.course} · Due {a.due}</Text>
              </View>
            </View>
          ))}

          {/* Campus Events */}
          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 10 }}>CAMPUS EVENTS</Text>
          {CAMPUS_EVENTS.map(ev => (
            <View key={ev.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, marginBottom: 4 }}>{ev.title}</Text>
              <Text style={{ fontSize: 13, color: C.secondary }}>{ev.date} · {ev.location}</Text>
            </View>
          ))}

        </ScrollView>
      </View>
    );
  }

  // ── Personal Subscriber: public events list ──────────────────────────────────
  if (mode === 'personal' && !isAdmin) {
    const publicEvents = [
      { id: 'pe1', title: 'Live Stream: Q&A Session',   date: 'Apr 10', time: '7:00 PM',  type: 'Live',       location: 'YouTube Live',           description: 'Monthly subscriber Q&A. Submit questions in the comments.' },
      { id: 'pe2', title: 'Brand Meetup — NYC',          date: 'Apr 18', time: '2:00 PM',  type: 'In-Person',  location: 'Soho House, New York',    description: 'Casual meetup with the community. Tickets required.' },
      { id: 'pe3', title: 'Content Strategy Webinar',   date: 'Apr 25', time: '6:00 PM',  type: 'Webinar',    location: 'Zoom',                    description: 'Deep dive on content planning and distribution strategy.' },
      { id: 'pe4', title: 'Creator Summit Panel',        date: 'May 3',  time: '10:00 AM', type: 'In-Person',  location: 'LA Convention Center',    description: 'Panel discussion on the future of the creator economy.' },
      { id: 'pe5', title: 'Subscriber Meet-and-Greet',  date: 'May 15', time: '5:00 PM',  type: 'In-Person',  location: 'TBD',                     description: 'Exclusive event for subscribers only. Details coming soon.' },
    ];
    return (
      <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.topLeft} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <KMenuButton />
          </Pressable>
          <View style={styles.viewPill}>
            <Text style={styles.viewPillText}>Events</Text>
          </View>
          <View style={[styles.topRight, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={accent} isPrimary={false} />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 120, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>

          {/* Book a Session card */}
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <IconSymbol name="calendar.badge.plus" size={20} color={C.label} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Book a 1:1 Session</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18, marginBottom: 14 }}>
              Coaching, Q&A, or consultation — book directly on my calendar.
            </Text>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? C.surfacePressed : C.label,
                borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20,
                alignSelf: 'flex-start',
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Book Now</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 11, color: C.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>UPCOMING EVENTS</Text>

          {publicEvents.map(ev => {
            const isExpanded = expandedPubId === ev.id;
            const myRsvp     = rsvpStatus[ev.id] ?? null;
            return (
              <Pressable
                key={ev.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedPubId(prev => prev === ev.id ? null : ev.id);
                }}
                style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10 }}
              >
                {/* Type badge + title row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <View style={{ backgroundColor: C.surfacePressed, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{ev.type}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: C.label }}>{ev.title}</Text>
                </View>

                <Text style={{ fontSize: 13, color: C.secondary, marginBottom: isExpanded ? 12 : 0 }}>
                  {ev.date} · {ev.time}
                </Text>

                {/* Expanded detail */}
                {isExpanded && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <IconSymbol name="location.fill" size={13} color={C.secondary} />
                      <Text style={{ fontSize: 13, color: C.secondary }}>{ev.location}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: C.label, lineHeight: 18, marginBottom: 14 }}>{ev.description}</Text>

                    {/* RSVP buttons */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['going', 'maybe', 'no'] as const).map(opt => {
                        const labels: Record<string, string> = { going: 'Going', maybe: 'Maybe', no: 'Not Going' };
                        const isActive = myRsvp === opt;
                        return (
                          <Pressable
                            key={opt}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setRsvpStatus(prev => {
                                const next = { ...prev };
                                if (isActive) { delete next[ev.id]; } else { next[ev.id] = opt; }
                                return next;
                              });
                            }}
                            style={{
                              flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
                              backgroundColor: isActive ? C.label : C.surfacePressed,
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: isActive ? C.bg : C.label }}>
                              {labels[opt]}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* RSVP status badge when collapsed */}
                {!isExpanded && myRsvp && (
                  <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color={C.label} />
                    <Text style={{ fontSize: 12, color: C.secondary }}>
                      {myRsvp === 'going' ? 'Going' : myRsvp === 'maybe' ? 'Maybe' : 'Not Going'}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <View style={[styles.topLeft, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={12}
          >
            <KMenuButton />
          </Pressable>
          {!isSameDay(selectedDate, today()) && (
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDate(today()); setExpandedId(null); }}>
              <Text style={styles.todayBtn}>Today</Text>
            </Pressable>
          )}
        </View>
        <Pressable
          style={styles.viewPill}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowViewDD(v => !v); }}
        >
          <Text style={styles.viewPillText}>Calendar</Text>
          <IconSymbol name="chevron.down" size={11} color={C.label} />
        </Pressable>
        <View style={[styles.topRight, { alignItems: 'flex-end' }]}>
          <RolePill
            role={role}
            onPress={cycleRole}
            accentColor={accent}
            isPrimary={isAdmin}
          />
        </View>
      </View>

      {/* ── Filter pills ── */}
      {(
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.pillsScroll, { flex: 1 }]} contentContainerStyle={styles.pillsContent}>
          {filterPills.map(p => {
            const active = p.key === activeFilter;
            return (
              <Pressable
                key={p.key}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveFilter(p.key); }}
              >
                {!active && p.color && (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: p.color, flexShrink: 0 }} />
                )}
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {mode === 'personal' && isAdmin && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setEditCatVisible(true); }}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <IconSymbol name="gearshape" size={16} color={C.secondary} />
          </Pressable>
        )}
      </View>
      )}

      {/* ── Calendar views ── */}
      {(<>

      {/* ── Week view ── */}
      {view === 'Week' && (
        <WeekView
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onNavigate={handleNavigateWeek}
          events={modeEvents}
          C={C}
          styles={styles}
        />
      )}

      {/* ── Week row (Day view) ── */}
      {view === 'Day' && (
        <WeekRow
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onNavigate={handleNavigateWeek}
          onPullDown={() => setView('Month')}
          events={modeEvents}
          C={C}
          styles={styles}
        />
      )}

      {/* ── Month grid (Month view) ── */}
      {view === 'Month' && (
        <MonthGrid
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onNavigate={handleNavigateMonth}
          onPullUp={() => setView('Day')}
          events={modeEvents}
          C={C}
          styles={styles}
        />
      )}

      {/* ── Shared timeline (Day + Month) ── */}
      {(view === 'Day' || view === 'Month') && (
        <SharedTimeline
          selectedDate={selectedDate}
          events={modeEvents}
          expandedId={expandedId}
          onExpand={setExpandedId}
          onCreateAtTime={handleCreateAtTime}
          C={C}
          styles={styles}
          evAreaWidth={evAreaWidth}
          role={role}
          isAdmin={isAdmin}
        />
      )}

      {/* ── List view ── */}
      {view === 'List' && (
        <ListView
          events={modeEvents.filter(e => e.start >= _today)}
          C={C}
          styles={styles}
        />
      )}

      {/* ── FAB (admin only) ── */}
      {isAdmin && (
        <Pressable
          style={[styles.fab, { bottom: FOOTER_H + insets.bottom + 16 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setCreateTime(null); setCreateVisible(true); }}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}

      </>)}

      {/* ── View dropdown backdrop ── */}
      {showViewDD && (
        <Pressable style={[StyleSheet.absoluteFill, { zIndex: 10 }]} onPress={() => setShowViewDD(false)} />
      )}

      {/* ── View dropdown ── */}
      {showViewDD && (
        <View style={[styles.dropdown, styles.viewDDPos]}>
          {VIEWS.map(v => (
            <Pressable
              key={v}
              style={[styles.ddItem, v === view && { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setView(v); setShowViewDD(false); }}
            >
              <Text style={[styles.ddText, v === view && { fontWeight: '600' }]}>{v}</Text>
              {v === view && <IconSymbol name="checkmark" size={13} color={C.label} />}
            </Pressable>
          ))}
        </View>
      )}

      {/* ── Create event sheet ── */}
      <BottomSheet visible={createVisible} onClose={() => setCreateVisible(false)} useModal snapPoints={['50%', '90%']} backgroundColor={C.bg}>
        <CreateEventSheet
          selectedDate={selectedDate}
          initialTime={createTime}
          onClose={() => setCreateVisible(false)}
          C={C}
        />
      </BottomSheet>

      {/* ── Edit categories sheet ── */}
      <EditCategoriesSheet visible={editCatVisible} onClose={() => setEditCatVisible(false)} C={C} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // Top bar
  topBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  topLeft:     { flex: 1, alignItems: 'flex-start' },
  topRight:    { flex: 1, alignItems: 'flex-end' },
  todayBtn:    { fontSize: 15, fontWeight: '500', color: C.accent },
  cancelBtn:   { fontSize: 15, fontWeight: '500', color: C.secondary },
  editBtn:     { fontSize: 15, fontWeight: '500', color: C.secondary },
  rbacPill:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  rbacPillText: { fontSize: 12, fontWeight: '600' },
  viewPill:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 32, borderRadius: 16, borderWidth: 1, borderColor: C.separator, backgroundColor: C.surface, marginHorizontal: 10 },
  viewPillText: { fontSize: 14, fontWeight: '700', color: C.label },

  // Filter pills
  pillsScroll:    { flexShrink: 0, flexGrow: 0, height: 44 },
  pillsContent:   { flexDirection: 'row', gap: 8, paddingHorizontal: 16, alignItems: 'center', height: 44 },
  pill:           { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: C.separator, flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillActive:     { backgroundColor: C.activePill, borderColor: C.activePill },
  pillText:       { fontSize: 13, fontWeight: '500', color: C.secondary },
  pillTextActive: { color: C.activePillText, fontWeight: '600' },

  // Week row (Day view)
  weekRowWrap: { paddingHorizontal: 4, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
  weekRow:     { flexDirection: 'row' },
  dayCell:     { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayLabel:    { fontSize: 11, fontWeight: '500', color: C.muted, marginBottom: 4 },
  dayNum:      { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayNumText:  { fontSize: 14, fontWeight: '500', color: C.label },
  eventDot:    { width: 5, height: 5, borderRadius: 3, marginTop: 3 },

  // Month grid (Month view)
  monthGridWrap:  { paddingHorizontal: 4, paddingBottom: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
  monthGridTitle: { fontSize: 15, fontWeight: '600', color: C.label, paddingHorizontal: 8, paddingTop: 4, paddingBottom: 6 },
  monthHeaderCell: { flex: 1, alignItems: 'center', paddingBottom: 4 },
  monthWeekRow:   { flexDirection: 'row' },
  monthCell:      { flex: 1, alignItems: 'center', paddingVertical: 5, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, minHeight: 48 },
  monthDots:      { flexDirection: 'row', gap: 3, marginTop: 3 },

  // All-day bar
  allDayBar:  { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
  allDayLabel: { width: 46, fontSize: 10, fontWeight: '500', color: C.muted, paddingTop: 3, textAlign: 'right', paddingRight: 6 },
  allDayList:  { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  allDayChip:  { borderRadius: 5, borderLeftWidth: 2.5, paddingHorizontal: 7, paddingVertical: 3 },
  allDayText:  { fontSize: 12, fontWeight: '500' },

  // Timeline
  hourRow:   { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' },
  hourLabel: { width: TL_LEFT, fontSize: 10, color: C.muted, textAlign: 'right', paddingRight: 8 },
  hourLine:  { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: C.separator },
  nowLine:   { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 5 },
  nowDot:    { width: 8, height: 8, borderRadius: 4, marginLeft: TL_LEFT - 4, marginRight: 0 },
  nowBar:    { flex: 1, height: 1.5 },
  tlEvent:   { position: 'absolute', borderRadius: 6, borderLeftWidth: 3, padding: 6, overflow: 'hidden' },

  // Event content
  evTitle:   { fontSize: 12, fontWeight: '700', marginBottom: 1 },
  evTime:    { fontSize: 10, marginBottom: 1 },
  evLoc:     { fontSize: 10 },
  evDesc:    { fontSize: 11, marginTop: 5, lineHeight: 15 },
  evActions: { flexDirection: 'row', gap: 6, marginTop: 6 },
  evBtn:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 7, borderWidth: 1 },
  evBtnText: { fontSize: 11, fontWeight: '600' },
  emptyDay:  { position: 'absolute', left: TL_LEFT, right: 0, top: 80, alignItems: 'center' },
  emptyText: { fontSize: 13, color: C.muted },

  // List view
  listHeader:     { paddingTop: 10, paddingBottom: 6 },
  listHeaderText: { fontSize: 15, fontWeight: '600', color: C.label },
  listRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  listTime:       { width: 52, fontSize: 12, color: C.secondary, fontVariant: ['tabular-nums'] },
  listBar:        { width: 3, height: 36, borderRadius: 2, marginRight: 10 },
  listTitle:      { fontSize: 14, fontWeight: '500', color: C.label },
  listLoc:        { fontSize: 12, color: C.muted, marginTop: 2 },

  // Dropdowns
  dropdown:   { position: 'absolute', zIndex: 20, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.separator, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, overflow: 'hidden', minWidth: 180 },
  viewDDPos:  { top: 56, alignSelf: 'center', left: '50%', marginLeft: -90 },
  editDDPos:  { top: 56, right: 12 },
  ddItem:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
  ddText:     { fontSize: 15, color: C.label, flex: 1 },

  // FAB
  fab: { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', shadowColor: C.accent, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
});
