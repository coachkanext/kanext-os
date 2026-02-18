/**
 * EduCalendar — Calendar tab for Education Home.
 * 5 view pills: Agenda | Week | Month | Rooms | Deadlines
 *
 * RBAC:
 *   E1/E2 — All views, admin events, room management controls
 *   E3    — All views, can book rooms, faculty-specific events
 *   E4    — Agenda/Week/Month/Deadlines, limited room booking
 *   E5    — Agenda/Deadlines only (public calendar)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import {
  isPresident,
  isDeanLevel,
  isFacultyLevel,
  isStudent,
  isEnrolled,
} from '@/utils/education-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: EducationRoleLens;
  onSwitchTab?: (index: number) => void;
}

type CalendarView = 'agenda' | 'week' | 'month' | 'rooms' | 'deadlines';

// =============================================================================
// VIEW PILL DEFINITIONS (RBAC-gated)
// =============================================================================

const ALL_VIEWS: { key: CalendarView; label: string }[] = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'deadlines', label: 'Deadlines' },
];

function getVisibleViews(role: EducationRoleLens): { key: CalendarView; label: string }[] {
  // E5: Agenda + Deadlines only
  if (role === 'E5') return ALL_VIEWS.filter((v) => v.key === 'agenda' || v.key === 'deadlines');
  // E4: All except Rooms
  if (role === 'E4') return ALL_VIEWS.filter((v) => v.key !== 'rooms');
  // E1/E2/E3: All views
  return ALL_VIEWS;
}

// =============================================================================
// INLINE MOCK DATA — AGENDA
// =============================================================================

type AgendaEventType = 'class' | 'meeting' | 'event' | 'deadline' | 'office-hours' | 'admin' | 'chapel';

interface AgendaEvent {
  id: string;
  time: string;
  endTime: string;
  title: string;
  location?: string;
  type: AgendaEventType;
  instructor?: string;
  notes?: string;
  adminOnly?: boolean;
  facultyOnly?: boolean;
}

const EVENT_TYPE_COLOR: Record<AgendaEventType, string> = {
  class: '#3B82F6',
  meeting: '#8B5CF6',
  event: '#F59E0B',
  deadline: '#EF4444',
  'office-hours': '#22C55E',
  admin: '#EC4899',
  chapel: '#6366F1',
};

const EVENT_TYPE_LABEL: Record<AgendaEventType, string> = {
  class: 'CLASS',
  meeting: 'MEETING',
  event: 'EVENT',
  deadline: 'DEADLINE',
  'office-hours': 'OFFICE HRS',
  admin: 'ADMIN',
  chapel: 'CHAPEL',
};

const TODAY_AGENDA: AgendaEvent[] = [
  { id: 'ag-1', time: '7:30 AM', endTime: '8:00 AM', title: 'Morning Chapel', location: 'University Chapel', type: 'chapel', notes: 'Speaker: Rev. Dr. Angela Brooks' },
  { id: 'ag-2', time: '8:00 AM', endTime: '8:50 AM', title: 'English Composition 101', location: 'Humanities Hall 204', type: 'class', instructor: 'Dr. Patricia Williams', notes: 'Essay draft due' },
  { id: 'ag-3', time: '9:00 AM', endTime: '9:50 AM', title: 'Calculus II', location: 'Science Building 310', type: 'class', instructor: 'Dr. James Chen' },
  { id: 'ag-4', time: '10:00 AM', endTime: '10:50 AM', title: 'Introduction to Psychology', location: 'Social Sciences 105', type: 'class', instructor: 'Dr. Maria Santos' },
  { id: 'ag-5', time: '11:00 AM', endTime: '11:30 AM', title: 'Academic Advising', location: 'Advising Center', type: 'meeting', notes: 'Spring schedule review' },
  { id: 'ag-6', time: '12:00 PM', endTime: '1:00 PM', title: 'Student Government Lunch Meeting', location: 'Student Center Room B', type: 'meeting', notes: 'Spring Fling planning' },
  { id: 'ag-7', time: '1:00 PM', endTime: '2:50 PM', title: 'Biology Lab', location: 'Life Sciences Lab 2', type: 'class', instructor: 'Dr. Robert Anderson', notes: 'Microscopy practical' },
  { id: 'ag-8', time: '3:00 PM', endTime: '4:00 PM', title: 'Office Hours — Dr. Williams', location: 'Humanities Hall 312', type: 'office-hours', instructor: 'Dr. Patricia Williams' },
  { id: 'ag-9', time: '4:00 PM', endTime: '5:00 PM', title: 'Budget Committee Meeting', location: 'Admin Building Conf A', type: 'admin', adminOnly: true, notes: 'FY27 preliminary review' },
  { id: 'ag-10', time: '4:30 PM', endTime: '5:30 PM', title: 'Department Chair Meeting', location: 'Provost Office', type: 'admin', facultyOnly: true, notes: 'Curriculum revision discussion' },
  { id: 'ag-11', time: '5:00 PM', endTime: '6:30 PM', title: 'Intramural Basketball', location: 'Gymnasium', type: 'event' },
  { id: 'ag-12', time: '7:00 PM', endTime: '9:00 PM', title: 'Black History Month Film Screening', location: 'Auditorium', type: 'event', notes: '"Selma" — Discussion to follow' },
];

const TOMORROW_AGENDA: AgendaEvent[] = [
  { id: 'ag-t1', time: '8:30 AM', endTime: '9:20 AM', title: 'African American Literature', location: 'Humanities Hall 108', type: 'class', instructor: 'Dr. Linda Foster' },
  { id: 'ag-t2', time: '9:30 AM', endTime: '10:20 AM', title: 'Statistics 201', location: 'Science Building 215', type: 'class', instructor: 'Dr. James Chen' },
  { id: 'ag-t3', time: '10:30 AM', endTime: '11:30 AM', title: 'Faculty Senate Meeting', location: 'Board Room', type: 'admin', facultyOnly: true, notes: 'Tenure review procedures' },
  { id: 'ag-t4', time: '11:00 AM', endTime: '12:00 PM', title: 'Career Services Workshop', location: 'Career Center', type: 'event', notes: 'Resume writing for spring grads' },
  { id: 'ag-t5', time: '1:00 PM', endTime: '1:50 PM', title: 'World History Since 1945', location: 'Social Sciences 202', type: 'class', instructor: 'Prof. David King' },
  { id: 'ag-t6', time: '2:00 PM', endTime: '3:00 PM', title: 'Research Lab Meeting', location: 'Science Building 410', type: 'meeting', instructor: 'Dr. Robert Anderson', facultyOnly: true },
  { id: 'ag-t7', time: '3:00 PM', endTime: '5:00 PM', title: 'Accreditation Self-Study Working Group', location: 'Admin Building Conf B', type: 'admin', adminOnly: true, notes: 'SACSCOC preparation' },
  { id: 'ag-t8', time: '5:00 PM', endTime: '5:00 PM', title: 'Financial Aid Appeal Deadline', location: '', type: 'deadline', notes: 'Last day to submit spring appeals' },
  { id: 'ag-t9', time: '6:00 PM', endTime: '8:00 PM', title: 'Spring Concert Rehearsal', location: 'Fine Arts Auditorium', type: 'event', notes: 'University Choir & Jazz Ensemble' },
];

// =============================================================================
// INLINE MOCK DATA — WEEK VIEW
// =============================================================================

interface WeekDaySchedule {
  day: string;
  shortDay: string;
  date: string;
  events: { time: string; title: string; type: AgendaEventType; location: string; adminOnly?: boolean; facultyOnly?: boolean }[];
}

const WEEK_SCHEDULE: WeekDaySchedule[] = [
  {
    day: 'Monday', shortDay: 'Mon', date: 'Feb 16',
    events: [
      { time: '7:30 AM', title: 'Chapel', type: 'chapel', location: 'Chapel' },
      { time: '8:00 AM', title: 'English 101', type: 'class', location: 'HH 204' },
      { time: '9:00 AM', title: 'Calculus II', type: 'class', location: 'SB 310' },
      { time: '10:00 AM', title: 'Intro Psychology', type: 'class', location: 'SS 105' },
      { time: '1:00 PM', title: 'Biology Lab', type: 'class', location: 'LSL 2' },
      { time: '3:00 PM', title: 'Office Hours', type: 'office-hours', location: 'HH 312' },
      { time: '4:00 PM', title: 'Budget Committee', type: 'admin', location: 'Admin A', adminOnly: true },
    ],
  },
  {
    day: 'Tuesday', shortDay: 'Tue', date: 'Feb 17',
    events: [
      { time: '8:30 AM', title: 'African Amer. Lit.', type: 'class', location: 'HH 108' },
      { time: '9:30 AM', title: 'Statistics 201', type: 'class', location: 'SB 215' },
      { time: '10:30 AM', title: 'Faculty Senate', type: 'admin', location: 'Board Room', facultyOnly: true },
      { time: '1:00 PM', title: 'World History', type: 'class', location: 'SS 202' },
      { time: '2:00 PM', title: 'Research Lab', type: 'meeting', location: 'SB 410', facultyOnly: true },
      { time: '5:00 PM', title: 'Aid Appeal Deadline', type: 'deadline', location: '' },
    ],
  },
  {
    day: 'Wednesday', shortDay: 'Wed', date: 'Feb 18',
    events: [
      { time: '7:30 AM', title: 'Chapel', type: 'chapel', location: 'Chapel' },
      { time: '8:00 AM', title: 'English 101', type: 'class', location: 'HH 204' },
      { time: '9:00 AM', title: 'Calculus II', type: 'class', location: 'SB 310' },
      { time: '10:00 AM', title: 'Intro Psychology', type: 'class', location: 'SS 105' },
      { time: '12:00 PM', title: 'Convocation', type: 'event', location: 'Auditorium' },
      { time: '1:00 PM', title: 'Chemistry Lab', type: 'class', location: 'SB 120' },
      { time: '3:00 PM', title: 'Faculty Meeting', type: 'admin', location: 'Provost Office', facultyOnly: true },
      { time: '7:00 PM', title: 'Film Screening', type: 'event', location: 'Auditorium' },
    ],
  },
  {
    day: 'Thursday', shortDay: 'Thu', date: 'Feb 19',
    events: [
      { time: '8:30 AM', title: 'African Amer. Lit.', type: 'class', location: 'HH 108' },
      { time: '9:30 AM', title: 'Statistics 201', type: 'class', location: 'SB 215' },
      { time: '11:00 AM', title: 'Student Success Mtg', type: 'meeting', location: 'Advising Ctr' },
      { time: '1:00 PM', title: 'World History', type: 'class', location: 'SS 202' },
      { time: '3:00 PM', title: 'Research Group', type: 'meeting', location: 'SB 410' },
      { time: '4:00 PM', title: 'Board Prep Session', type: 'admin', location: 'Admin A', adminOnly: true },
    ],
  },
  {
    day: 'Friday', shortDay: 'Fri', date: 'Feb 20',
    events: [
      { time: '7:30 AM', title: 'Chapel', type: 'chapel', location: 'Chapel' },
      { time: '9:00 AM', title: 'Convocation', type: 'event', location: 'Auditorium' },
      { time: '10:00 AM', title: 'Study Hall', type: 'class', location: 'Library' },
      { time: '12:00 PM', title: 'Registration Deadline', type: 'deadline', location: '' },
      { time: '1:00 PM', title: 'Athletics', type: 'event', location: 'Gymnasium' },
      { time: '5:00 PM', title: 'Spring Mixer', type: 'event', location: 'Student Center' },
    ],
  },
  {
    day: 'Saturday', shortDay: 'Sat', date: 'Feb 21',
    events: [
      { time: '10:00 AM', title: 'SAT Prep Session', type: 'event', location: 'Library' },
      { time: '1:00 PM', title: 'Men\'s Basketball', type: 'event', location: 'Arena' },
      { time: '4:00 PM', title: 'Community Service', type: 'event', location: 'Off-campus' },
    ],
  },
  {
    day: 'Sunday', shortDay: 'Sun', date: 'Feb 22',
    events: [
      { time: '10:00 AM', title: 'University Church', type: 'chapel', location: 'Chapel' },
      { time: '2:00 PM', title: 'Study Groups', type: 'class', location: 'Library' },
      { time: '6:00 PM', title: 'Vespers', type: 'chapel', location: 'Chapel' },
    ],
  },
];

// =============================================================================
// INLINE MOCK DATA — MONTH VIEW
// =============================================================================

interface MonthDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: { title: string; type: AgendaEventType; adminOnly?: boolean }[];
}

function buildFebruary2026(): MonthDay[] {
  const days: MonthDay[] = [];
  // Feb 2026 starts on Sunday (day 0). Fill previous month's trailing days.
  // Jan 26-31 (Mon-Sat before Feb 1 which is Sunday)
  // Actually Feb 1, 2026 = Sunday
  // No leading days needed since Feb 1 is Sunday
  for (let d = 1; d <= 28; d++) {
    const events: { title: string; type: AgendaEventType; adminOnly?: boolean }[] = [];
    // Sprinkle events
    if (d === 1) events.push({ title: 'Black History Month Begins', type: 'event' });
    if (d === 2) events.push({ title: 'Groundhog Day Assembly', type: 'event' });
    if (d === 3) events.push({ title: 'English 101', type: 'class' }, { title: 'Calculus II', type: 'class' });
    if (d === 4) events.push({ title: 'Statistics 201', type: 'class' }, { title: 'Faculty Senate', type: 'admin', adminOnly: true });
    if (d === 5) events.push({ title: 'Chapel', type: 'chapel' }, { title: 'Convocation', type: 'event' });
    if (d === 6) events.push({ title: 'Career Fair', type: 'event' });
    if (d === 7) events.push({ title: 'Study Groups', type: 'class' });
    if (d === 10) events.push({ title: 'English 101', type: 'class' }, { title: 'Biology Lab', type: 'class' });
    if (d === 11) events.push({ title: 'Statistics 201', type: 'class' });
    if (d === 12) events.push({ title: 'Chapel', type: 'chapel' }, { title: 'Midterm Review', type: 'class' });
    if (d === 13) events.push({ title: 'Budget Hearing', type: 'admin', adminOnly: true });
    if (d === 14) events.push({ title: 'Valentine\'s Day Social', type: 'event' });
    if (d === 15) events.push({ title: 'Men\'s Basketball', type: 'event' });
    if (d === 16) events.push({ title: 'Presidents Day', type: 'event' });
    if (d === 17) events.push({ title: 'English 101', type: 'class' }, { title: 'Calculus II', type: 'class' });
    if (d === 18) events.push({ title: 'Statistics 201', type: 'class' }, { title: 'Film Screening', type: 'event' });
    if (d === 19) events.push({ title: 'Chapel', type: 'chapel' }, { title: 'Faculty Meeting', type: 'admin' });
    if (d === 20) events.push({ title: 'Registration Deadline', type: 'deadline' }, { title: 'Board Prep', type: 'admin', adminOnly: true });
    if (d === 21) events.push({ title: 'Community Service Day', type: 'event' });
    if (d === 22) events.push({ title: 'Vespers', type: 'chapel' });
    if (d === 23) events.push({ title: 'English 101', type: 'class' });
    if (d === 24) events.push({ title: 'Statistics 201', type: 'class' }, { title: 'Research Lab', type: 'meeting' });
    if (d === 25) events.push({ title: 'Chapel', type: 'chapel' }, { title: 'Convocation', type: 'event' });
    if (d === 26) events.push({ title: 'Midterm Exams Begin', type: 'deadline' });
    if (d === 27) events.push({ title: 'Midterms', type: 'deadline' });
    if (d === 28) events.push({ title: 'Black History Gala', type: 'event' }, { title: 'Aid Docs Deadline', type: 'deadline' });
    days.push({ date: d, isCurrentMonth: true, isToday: d === 18, events });
  }
  return days;
}

const MONTH_DAYS = buildFebruary2026();
const MONTH_LABEL = 'February 2026';
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// =============================================================================
// INLINE MOCK DATA — ROOMS
// =============================================================================

type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

interface CampusRoom {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  type: 'classroom' | 'conference' | 'lab' | 'auditorium' | 'study' | 'office';
  equipment: string[];
  status: RoomStatus;
  currentBooking?: string;
  nextAvailable?: string;
  bookable: boolean;
  adminOnly?: boolean;
}

const ROOM_STATUS_COLOR: Record<RoomStatus, string> = {
  available: '#22C55E',
  occupied: '#EF4444',
  reserved: '#F59E0B',
  maintenance: '#8F8F8F',
};

const CAMPUS_ROOMS: CampusRoom[] = [
  { id: 'rm-1', name: 'Humanities Hall 204', building: 'Humanities Hall', floor: '2nd', capacity: 40, type: 'classroom', equipment: ['Projector', 'Whiteboard', 'AV System'], status: 'occupied', currentBooking: 'English 101 — Dr. Williams', nextAvailable: '9:00 AM', bookable: true },
  { id: 'rm-2', name: 'Science Building 310', building: 'Science Building', floor: '3rd', capacity: 35, type: 'classroom', equipment: ['Projector', 'Smart Board', 'Lab Desks'], status: 'occupied', currentBooking: 'Calculus II — Dr. Chen', nextAvailable: '10:00 AM', bookable: true },
  { id: 'rm-3', name: 'Library Study Room A', building: 'Main Library', floor: '1st', capacity: 8, type: 'study', equipment: ['Whiteboard', 'Monitor'], status: 'available', bookable: true },
  { id: 'rm-4', name: 'Library Study Room B', building: 'Main Library', floor: '1st', capacity: 8, type: 'study', equipment: ['Whiteboard', 'Monitor'], status: 'reserved', currentBooking: 'Study Group — Biology 201', nextAvailable: '11:00 AM', bookable: true },
  { id: 'rm-5', name: 'Admin Conference Room A', building: 'Administration Building', floor: '3rd', capacity: 20, type: 'conference', equipment: ['Projector', 'Video Conf', 'Whiteboard', 'Phone'], status: 'reserved', currentBooking: 'Budget Committee', nextAvailable: '5:00 PM', bookable: true, adminOnly: true },
  { id: 'rm-6', name: 'Board Room', building: 'Administration Building', floor: '4th', capacity: 30, type: 'conference', equipment: ['Projector', 'Video Conf', 'Recording', 'Podium'], status: 'available', bookable: true, adminOnly: true },
  { id: 'rm-7', name: 'Life Sciences Lab 2', building: 'Life Sciences', floor: '1st', capacity: 24, type: 'lab', equipment: ['Microscopes', 'Fume Hood', 'Emergency Shower'], status: 'available', nextAvailable: 'Now', bookable: false },
  { id: 'rm-8', name: 'Computer Lab 1', building: 'Technology Center', floor: '2nd', capacity: 32, type: 'lab', equipment: ['32 PCs', 'Printer', 'Scanner'], status: 'occupied', currentBooking: 'CS 101 — Prof. Thompson', nextAvailable: '11:00 AM', bookable: false },
  { id: 'rm-9', name: 'Fine Arts Auditorium', building: 'Fine Arts Center', floor: '1st', capacity: 450, type: 'auditorium', equipment: ['Stage', 'Sound System', 'Lighting Rig', 'Grand Piano'], status: 'available', bookable: true },
  { id: 'rm-10', name: 'Social Sciences 105', building: 'Social Sciences', floor: '1st', capacity: 50, type: 'classroom', equipment: ['Projector', 'Microphone', 'Whiteboard'], status: 'occupied', currentBooking: 'Intro Psychology — Dr. Santos', nextAvailable: '11:00 AM', bookable: true },
  { id: 'rm-11', name: 'Provost Conference Room', building: 'Administration Building', floor: '3rd', capacity: 12, type: 'conference', equipment: ['Video Conf', 'Whiteboard', 'Monitor'], status: 'available', bookable: true, adminOnly: true },
  { id: 'rm-12', name: 'Student Center Room B', building: 'Student Center', floor: '2nd', capacity: 25, type: 'conference', equipment: ['Projector', 'Whiteboard'], status: 'reserved', currentBooking: 'SGA Lunch Meeting', nextAvailable: '1:30 PM', bookable: true },
  { id: 'rm-13', name: 'Music Practice Room 3', building: 'Fine Arts Center', floor: '2nd', capacity: 4, type: 'study', equipment: ['Piano', 'Sound Dampening'], status: 'available', bookable: true },
  { id: 'rm-14', name: 'Chemistry Lab 120', building: 'Science Building', floor: '1st', capacity: 28, type: 'lab', equipment: ['Fume Hoods', 'Emergency Shower', 'Chemical Storage'], status: 'maintenance', bookable: false },
  { id: 'rm-15', name: 'Gymnasium', building: 'Athletics Complex', floor: '1st', capacity: 3000, type: 'auditorium', equipment: ['Basketball Courts', 'Bleachers', 'Scoreboard'], status: 'available', bookable: true, adminOnly: true },
];

// --- Room booking log (admin/faculty) ---

interface RoomBooking {
  id: string;
  room: string;
  bookedBy: string;
  date: string;
  time: string;
  purpose: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const RECENT_BOOKINGS: RoomBooking[] = [
  { id: 'bk-1', room: 'Admin Conference Room A', bookedBy: 'Dr. Sarah Miller', date: 'Feb 18', time: '10:00 AM – 12:00 PM', purpose: 'Accreditation Review', status: 'confirmed' },
  { id: 'bk-2', room: 'Library Study Room A', bookedBy: 'Marcus Johnson (Student)', date: 'Feb 18', time: '2:00 PM – 4:00 PM', purpose: 'Group Study', status: 'confirmed' },
  { id: 'bk-3', room: 'Fine Arts Auditorium', bookedBy: 'Prof. Angela Davis', date: 'Feb 19', time: '6:00 PM – 9:00 PM', purpose: 'Spring Concert Rehearsal', status: 'confirmed' },
  { id: 'bk-4', room: 'Board Room', bookedBy: 'Office of the President', date: 'Feb 20', time: '9:00 AM – 12:00 PM', purpose: 'Board of Trustees Prep', status: 'pending' },
  { id: 'bk-5', room: 'Student Center Room B', bookedBy: 'SGA', date: 'Feb 21', time: '11:00 AM – 1:00 PM', purpose: 'Spring Fling Planning', status: 'confirmed' },
  { id: 'bk-6', room: 'Gymnasium', bookedBy: 'Athletics Department', date: 'Feb 22', time: '1:00 PM – 5:00 PM', purpose: 'Men\'s Basketball vs. Riverside', status: 'confirmed' },
];

const BOOKING_STATUS_COLOR: Record<string, string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  cancelled: '#EF4444',
};

// =============================================================================
// INLINE MOCK DATA — DEADLINES
// =============================================================================

type DeadlineCategory = 'academic' | 'registration' | 'financial' | 'administrative' | 'ceremony';

interface AcademicDeadline {
  id: string;
  title: string;
  date: string;
  category: DeadlineCategory;
  description: string;
  urgent: boolean;
  daysAway: number;
  adminOnly?: boolean;
  appliesTo: ('students' | 'faculty' | 'staff' | 'all')[];
}

const DEADLINE_CATEGORY_COLOR: Record<DeadlineCategory, string> = {
  academic: '#3B82F6',
  registration: '#8B5CF6',
  financial: '#22C55E',
  administrative: '#F97316',
  ceremony: '#EC4899',
};

const ACADEMIC_DEADLINES: AcademicDeadline[] = [
  { id: 'dl-1', title: 'Spring Registration Deadline', date: 'Feb 20, 2026', category: 'registration', description: 'Last day to add/drop classes without penalty for Spring 2026 semester.', urgent: true, daysAway: 2, appliesTo: ['students'] },
  { id: 'dl-2', title: 'Financial Aid Appeal Deadline', date: 'Feb 19, 2026', category: 'financial', description: 'Final day to submit Spring 2026 financial aid appeals.', urgent: true, daysAway: 1, appliesTo: ['students'] },
  { id: 'dl-3', title: 'Faculty Mid-Semester Grade Reports', date: 'Feb 27, 2026', category: 'academic', description: 'Faculty must submit midterm progress grades via portal.', urgent: false, daysAway: 9, appliesTo: ['faculty'], adminOnly: false },
  { id: 'dl-4', title: 'FAFSA Priority Deadline', date: 'Mar 1, 2026', category: 'financial', description: 'Priority deadline for 2026-27 FAFSA submission.', urgent: true, daysAway: 11, appliesTo: ['students'] },
  { id: 'dl-5', title: 'Midterm Examinations Begin', date: 'Mar 2, 2026', category: 'academic', description: 'Spring 2026 midterm examination period: Mar 2–6.', urgent: false, daysAway: 12, appliesTo: ['all'] },
  { id: 'dl-6', title: 'Course Withdrawal Deadline (W Grade)', date: 'Mar 20, 2026', category: 'registration', description: 'Last day to withdraw from a course with a W grade.', urgent: false, daysAway: 30, appliesTo: ['students'] },
  { id: 'dl-7', title: 'Spring Break', date: 'Mar 23\u201327, 2026', category: 'academic', description: 'No classes. Residence halls remain open.', urgent: false, daysAway: 33, appliesTo: ['all'] },
  { id: 'dl-8', title: 'FY27 Budget Proposals Due', date: 'Mar 15, 2026', category: 'administrative', description: 'All departments must submit FY27 budget proposals to the CFO.', urgent: false, daysAway: 25, adminOnly: true, appliesTo: ['staff'] },
  { id: 'dl-9', title: 'Tenure & Promotion Files Due', date: 'Mar 28, 2026', category: 'administrative', description: 'Faculty tenure and promotion dossiers due to Provost Office.', urgent: false, daysAway: 38, adminOnly: false, appliesTo: ['faculty'] },
  { id: 'dl-10', title: 'Thesis/Dissertation Submission', date: 'Apr 15, 2026', category: 'academic', description: 'Final submission deadline for spring graduates.', urgent: false, daysAway: 56, appliesTo: ['students'] },
  { id: 'dl-11', title: 'Housing Application Deadline (Fall 2026)', date: 'Apr 1, 2026', category: 'registration', description: 'Priority deadline for Fall 2026 residence hall assignments.', urgent: false, daysAway: 42, appliesTo: ['students'] },
  { id: 'dl-12', title: 'Summer Registration Opens', date: 'Apr 7, 2026', category: 'registration', description: 'Registration portal opens for Summer 2026 terms.', urgent: false, daysAway: 48, appliesTo: ['all'] },
  { id: 'dl-13', title: 'Last Day of Classes', date: 'May 1, 2026', category: 'academic', description: 'Final day of instruction for Spring 2026.', urgent: false, daysAway: 72, appliesTo: ['all'] },
  { id: 'dl-14', title: 'Final Examinations', date: 'May 4\u20138, 2026', category: 'academic', description: 'Spring 2026 final examination period.', urgent: false, daysAway: 75, appliesTo: ['all'] },
  { id: 'dl-15', title: 'Final Grades Due', date: 'May 12, 2026', category: 'academic', description: 'Faculty must submit all final grades within 72 hours of last exam.', urgent: false, daysAway: 83, appliesTo: ['faculty'] },
  { id: 'dl-16', title: 'Commencement', date: 'May 15, 2026', category: 'ceremony', description: 'Spring 2026 Commencement Ceremony at Eagle Stadium.', urgent: false, daysAway: 86, appliesTo: ['all'] },
  { id: 'dl-17', title: 'SACSCOC Compliance Report Due', date: 'Jun 1, 2026', category: 'administrative', description: 'Annual compliance report to SACSCOC for accreditation.', urgent: false, daysAway: 103, adminOnly: true, appliesTo: ['staff'] },
];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, icon }: { title: string; colors: typeof Colors.light; count?: number; icon?: string }) {
  return (
    <View style={sh.headerRow}>
      {icon && <IconSymbol name={icon as any} size={14} color={colors.textSecondary} />}
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
    </View>
  );
}

function Card({ colors, children, highlight }: { colors: typeof Colors.light; children: React.ReactNode; highlight?: boolean }) {
  return (
    <View style={[sh.card, { backgroundColor: colors.card, borderColor: highlight ? '#3B82F6' : colors.border }]}>
      {children}
    </View>
  );
}

const sh = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
});

// =============================================================================
// AGENDA VIEW
// =============================================================================

function AgendaDayBlock({ dayLabel, events, colors, role }: { dayLabel: string; events: AgendaEvent[]; colors: typeof Colors.light; role: EducationRoleLens }) {
  const filtered = events.filter((ev) => {
    if (ev.adminOnly && !isDeanLevel(role)) return false;
    if (ev.facultyOnly && !isFacultyLevel(role)) return false;
    return true;
  });

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title={dayLabel} colors={colors} count={filtered.length} icon="calendar" />
      <Card colors={colors}>
        {filtered.map((ev, idx) => (
          <Pressable
            key={ev.id}
            style={[
              s.agendaRow,
              idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.agendaTimeCol}>
              <ThemedText style={[s.agendaTime, { color: colors.text }]}>{ev.time}</ThemedText>
              <ThemedText style={[s.agendaEndTime, { color: colors.textTertiary }]}>{ev.endTime}</ThemedText>
            </View>
            <View style={[s.agendaTypeLine, { backgroundColor: EVENT_TYPE_COLOR[ev.type] }]} />
            <View style={s.agendaContent}>
              <View style={s.agendaTitleRow}>
                <ThemedText style={[s.agendaTitle, { color: colors.text }]} numberOfLines={1}>
                  {ev.title}
                </ThemedText>
                <View style={[s.agendaTypeBadge, { backgroundColor: EVENT_TYPE_COLOR[ev.type] + '20' }]}>
                  <ThemedText style={[s.agendaTypeText, { color: EVENT_TYPE_COLOR[ev.type] }]}>
                    {EVENT_TYPE_LABEL[ev.type]}
                  </ThemedText>
                </View>
              </View>
              {ev.location ? (
                <ThemedText style={[s.agendaLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                  {ev.location}
                </ThemedText>
              ) : null}
              {ev.instructor && isFacultyLevel(role) && (
                <ThemedText style={[s.agendaInstructor, { color: colors.textTertiary }]}>
                  {ev.instructor}
                </ThemedText>
              )}
              {ev.notes && (
                <ThemedText style={[s.agendaNotes, { color: colors.textTertiary }]} numberOfLines={1}>
                  {ev.notes}
                </ThemedText>
              )}
              {ev.adminOnly && (
                <View style={[s.adminBadge, { backgroundColor: '#EC489920' }]}>
                  <ThemedText style={[s.adminBadgeText, { color: '#EC4899' }]}>ADMIN</ThemedText>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

function AgendaView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Today's summary stats */}
      <View style={s.moduleContainer}>
        <Card colors={colors}>
          <View style={s.agendaSummaryRow}>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: colors.text }]}>
                {TODAY_AGENDA.filter((e) => {
                  if (e.adminOnly && !isDeanLevel(role)) return false;
                  if (e.facultyOnly && !isFacultyLevel(role)) return false;
                  return true;
                }).length}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Today</ThemedText>
            </View>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: colors.text }]}>
                {TODAY_AGENDA.filter((e) => e.type === 'class').length}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Classes</ThemedText>
            </View>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: '#EF4444' }]}>
                {TODAY_AGENDA.filter((e) => e.type === 'deadline').length + TOMORROW_AGENDA.filter((e) => e.type === 'deadline').length}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Deadlines</ThemedText>
            </View>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: colors.text }]}>
                {TODAY_AGENDA.filter((e) => e.type === 'meeting').length}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Meetings</ThemedText>
            </View>
          </View>
        </Card>
      </View>

      <AgendaDayBlock dayLabel="TODAY \u2014 TUESDAY, FEB 18" events={TODAY_AGENDA} colors={colors} role={role} />
      <AgendaDayBlock dayLabel="TOMORROW \u2014 WEDNESDAY, FEB 19" events={TOMORROW_AGENDA} colors={colors} role={role} />

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// WEEK VIEW
// =============================================================================

function WeekView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedDay, setExpandedDay] = useState<string | null>('Wednesday');

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.moduleContainer}>
        <SectionHeader title="WEEK OF FEB 16 \u2013 22, 2026" colors={colors} icon="calendar" />

        {WEEK_SCHEDULE.map((day) => {
          const filteredEvents = day.events.filter((ev) => {
            if (ev.adminOnly && !isDeanLevel(role)) return false;
            if (ev.facultyOnly && !isFacultyLevel(role)) return false;
            return true;
          });
          const isExpanded = expandedDay === day.day;
          const isToday = day.date === 'Feb 18';

          return (
            <Pressable
              key={day.day}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedDay(isExpanded ? null : day.day);
              }}
            >
              <Card colors={colors} highlight={isToday}>
                <View style={s.weekDayHeader}>
                  <View style={s.weekDayLeft}>
                    <View style={[s.weekDayBadge, { backgroundColor: isToday ? '#3B82F6' : colors.backgroundTertiary }]}>
                      <ThemedText style={[s.weekDayShort, { color: isToday ? '#FFFFFF' : colors.text }]}>
                        {day.shortDay}
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedText style={[s.weekDayName, { color: colors.text }]}>
                        {day.day} {isToday ? '(Today)' : ''}
                      </ThemedText>
                      <ThemedText style={[s.weekDayDate, { color: colors.textSecondary }]}>{day.date}</ThemedText>
                    </View>
                  </View>
                  <View style={s.weekDayRight}>
                    <View style={s.weekDotRow}>
                      {filteredEvents.slice(0, 5).map((ev, i) => (
                        <View key={i} style={[s.weekEventDot, { backgroundColor: EVENT_TYPE_COLOR[ev.type] }]} />
                      ))}
                      {filteredEvents.length > 5 && (
                        <ThemedText style={[s.weekEventMore, { color: colors.textTertiary }]}>+{filteredEvents.length - 5}</ThemedText>
                      )}
                    </View>
                    <ThemedText style={[s.weekEventCount, { color: colors.textSecondary }]}>
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                </View>

                {isExpanded && (
                  <View style={[s.weekEventsList, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                    {filteredEvents.map((ev, idx) => (
                      <View
                        key={idx}
                        style={[
                          s.weekEventRow,
                          idx < filteredEvents.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        ]}
                      >
                        <ThemedText style={[s.weekEventTime, { color: colors.textSecondary }]}>{ev.time}</ThemedText>
                        <View style={[s.weekEventLine, { backgroundColor: EVENT_TYPE_COLOR[ev.type] }]} />
                        <View style={s.weekEventContent}>
                          <ThemedText style={[s.weekEventTitle, { color: colors.text }]} numberOfLines={1}>{ev.title}</ThemedText>
                          {ev.location ? (
                            <ThemedText style={[s.weekEventLocation, { color: colors.textTertiary }]}>{ev.location}</ThemedText>
                          ) : null}
                        </View>
                        <View style={[s.weekTypeBadge, { backgroundColor: EVENT_TYPE_COLOR[ev.type] + '20' }]}>
                          <ThemedText style={[s.weekTypeText, { color: EVENT_TYPE_COLOR[ev.type] }]}>
                            {EVENT_TYPE_LABEL[ev.type]}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// MONTH VIEW
// =============================================================================

function MonthView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(18);

  const selectedDayData = MONTH_DAYS.find((d) => d.date === selectedDay && d.isCurrentMonth);
  const filteredSelectedEvents = selectedDayData?.events.filter((ev) => {
    if (ev.adminOnly && !isDeanLevel(role)) return false;
    return true;
  }) || [];

  // Feb 2026 starts on Sunday (index 0). Build grid rows.
  const gridDays: (MonthDay | null)[] = [];
  // Feb 1 2026 is a Sunday, so no leading nulls needed
  MONTH_DAYS.forEach((d) => gridDays.push(d));
  // Fill trailing nulls to complete last week row
  while (gridDays.length % 7 !== 0) gridDays.push(null);

  const weeks: (MonthDay | null)[][] = [];
  for (let i = 0; i < gridDays.length; i += 7) {
    weeks.push(gridDays.slice(i, i + 7));
  }

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.moduleContainer}>
        <SectionHeader title={MONTH_LABEL.toUpperCase()} colors={colors} icon="calendar" />

        <Card colors={colors}>
          {/* Day headers */}
          <View style={s.monthHeaderRow}>
            {DAY_HEADERS.map((dh) => (
              <View key={dh} style={s.monthHeaderCell}>
                <ThemedText style={[s.monthHeaderText, { color: colors.textTertiary }]}>{dh}</ThemedText>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          {weeks.map((week, wi) => (
            <View key={wi} style={s.monthWeekRow}>
              {week.map((day, di) => {
                if (!day) {
                  return <View key={`empty-${di}`} style={s.monthDayCell} />;
                }
                const dayEvents = day.events.filter((ev) => {
                  if (ev.adminOnly && !isDeanLevel(role)) return false;
                  return true;
                });
                const isSelected = selectedDay === day.date;
                return (
                  <Pressable
                    key={day.date}
                    style={[
                      s.monthDayCell,
                      day.isToday && { backgroundColor: '#3B82F620', borderRadius: 8 },
                      isSelected && !day.isToday && { backgroundColor: colors.backgroundTertiary, borderRadius: 8 },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDay(day.date);
                    }}
                  >
                    <ThemedText style={[
                      s.monthDayNumber,
                      { color: day.isToday ? '#3B82F6' : colors.text },
                      day.isToday && { fontWeight: '800' },
                    ]}>
                      {day.date}
                    </ThemedText>
                    <View style={s.monthDotRow}>
                      {dayEvents.slice(0, 3).map((ev, ei) => (
                        <View key={ei} style={[s.monthEventDot, { backgroundColor: EVENT_TYPE_COLOR[ev.type] }]} />
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Card>
      </View>

      {/* Selected day detail */}
      {selectedDay && selectedDayData && (
        <View style={s.moduleContainer}>
          <SectionHeader
            title={`FEBRUARY ${selectedDay}${selectedDayData.isToday ? ' (TODAY)' : ''}`}
            colors={colors}
            count={filteredSelectedEvents.length}
          />
          {filteredSelectedEvents.length > 0 ? (
            <Card colors={colors}>
              {filteredSelectedEvents.map((ev, idx) => (
                <View
                  key={idx}
                  style={[
                    s.monthDetailRow,
                    idx < filteredSelectedEvents.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={[s.monthDetailDot, { backgroundColor: EVENT_TYPE_COLOR[ev.type] }]} />
                  <View style={s.monthDetailContent}>
                    <ThemedText style={[s.monthDetailTitle, { color: colors.text }]}>{ev.title}</ThemedText>
                    <View style={[s.monthDetailBadge, { backgroundColor: EVENT_TYPE_COLOR[ev.type] + '20' }]}>
                      <ThemedText style={[s.monthDetailBadgeText, { color: EVENT_TYPE_COLOR[ev.type] }]}>
                        {EVENT_TYPE_LABEL[ev.type]}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          ) : (
            <Card colors={colors}>
              <View style={s.emptyState}>
                <IconSymbol name="calendar" size={24} color={colors.textTertiary} />
                <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No events scheduled</ThemedText>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Monthly event legend */}
      <View style={s.moduleContainer}>
        <SectionHeader title="LEGEND" colors={colors} />
        <Card colors={colors}>
          <View style={s.legendGrid}>
            {(Object.keys(EVENT_TYPE_COLOR) as AgendaEventType[]).map((type) => (
              <View key={type} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: EVENT_TYPE_COLOR[type] }]} />
                <ThemedText style={[s.legendLabel, { color: colors.textSecondary }]}>
                  {EVENT_TYPE_LABEL[type]}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// ROOMS VIEW
// =============================================================================

function RoomsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'classroom' | 'conference' | 'lab' | 'study' | 'auditorium'>('all');

  const filtered = CAMPUS_ROOMS
    .filter((rm) => {
      if (rm.adminOnly && !isDeanLevel(role)) return false;
      return true;
    })
    .filter((rm) => filter === 'all' || rm.status === filter)
    .filter((rm) => typeFilter === 'all' || rm.type === typeFilter);

  const availableCount = CAMPUS_ROOMS.filter((rm) => rm.status === 'available' && (!rm.adminOnly || isDeanLevel(role))).length;
  const totalVisible = CAMPUS_ROOMS.filter((rm) => !rm.adminOnly || isDeanLevel(role)).length;

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Room summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ROOM AVAILABILITY" colors={colors} icon="building.2.fill" />
        <Card colors={colors}>
          <View style={s.roomSummaryRow}>
            <View style={s.roomSummaryStat}>
              <ThemedText style={[s.roomSummaryValue, { color: '#22C55E' }]}>{availableCount}</ThemedText>
              <ThemedText style={[s.roomSummaryLabel, { color: colors.textSecondary }]}>Available</ThemedText>
            </View>
            <View style={s.roomSummaryStat}>
              <ThemedText style={[s.roomSummaryValue, { color: '#EF4444' }]}>
                {CAMPUS_ROOMS.filter((rm) => rm.status === 'occupied' && (!rm.adminOnly || isDeanLevel(role))).length}
              </ThemedText>
              <ThemedText style={[s.roomSummaryLabel, { color: colors.textSecondary }]}>Occupied</ThemedText>
            </View>
            <View style={s.roomSummaryStat}>
              <ThemedText style={[s.roomSummaryValue, { color: '#F59E0B' }]}>
                {CAMPUS_ROOMS.filter((rm) => rm.status === 'reserved' && (!rm.adminOnly || isDeanLevel(role))).length}
              </ThemedText>
              <ThemedText style={[s.roomSummaryLabel, { color: colors.textSecondary }]}>Reserved</ThemedText>
            </View>
            <View style={s.roomSummaryStat}>
              <ThemedText style={[s.roomSummaryValue, { color: colors.text }]}>{totalVisible}</ThemedText>
              <ThemedText style={[s.roomSummaryLabel, { color: colors.textSecondary }]}>Total</ThemedText>
            </View>
          </View>
        </Card>
      </View>

      {/* Status filters */}
      <View style={s.filterRow}>
        {(['all', 'available', 'occupied', 'reserved'] as const).map((f) => (
          <Pressable
            key={f}
            style={[s.filterPill, { backgroundColor: filter === f ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
          >
            <ThemedText style={[s.filterPillText, { color: filter === f ? colors.text : colors.textSecondary }]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Type filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeFilterScroll}>
        {(['all', 'classroom', 'conference', 'lab', 'study', 'auditorium'] as const).map((t) => (
          <Pressable
            key={t}
            style={[s.typeFilterPill, { backgroundColor: typeFilter === t ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTypeFilter(t); }}
          >
            <ThemedText style={[s.typeFilterText, { color: typeFilter === t ? colors.text : colors.textSecondary }]}>
              {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Room list */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CAMPUS ROOMS" colors={colors} count={filtered.length} />
        <Card colors={colors}>
          {filtered.map((room, idx) => (
            <Pressable
              key={room.id}
              style={[
                s.roomRow,
                idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={s.roomContent}>
                <View style={s.roomNameRow}>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>{room.name}</ThemedText>
                  <View style={[s.roomStatusBadge, { backgroundColor: ROOM_STATUS_COLOR[room.status] + '20' }]}>
                    <View style={[s.roomStatusDot, { backgroundColor: ROOM_STATUS_COLOR[room.status] }]} />
                    <ThemedText style={[s.roomStatusText, { color: ROOM_STATUS_COLOR[room.status] }]}>
                      {room.status.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.roomMeta, { color: colors.textSecondary }]}>
                  {room.building} {'\u00B7'} {room.floor} Floor {'\u00B7'} Capacity: {room.capacity}
                </ThemedText>
                <ThemedText style={[s.roomEquipment, { color: colors.textTertiary }]} numberOfLines={1}>
                  {room.equipment.join(' \u00B7 ')}
                </ThemedText>
                {room.currentBooking && (
                  <ThemedText style={[s.roomBooking, { color: colors.textSecondary }]} numberOfLines={1}>
                    Current: {room.currentBooking}
                  </ThemedText>
                )}
                {room.nextAvailable && room.status !== 'available' && (
                  <ThemedText style={[s.roomNextAvail, { color: '#22C55E' }]}>
                    Next available: {room.nextAvailable}
                  </ThemedText>
                )}
                <View style={s.roomActionRow}>
                  <View style={[s.roomTypeBadge, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.roomTypeText, { color: colors.textSecondary }]}>
                      {room.type.toUpperCase()}
                    </ThemedText>
                  </View>
                  {room.bookable && room.status === 'available' && (isFacultyLevel(role) || (isStudent(role) && (room.type === 'study' || room.type === 'conference'))) && (
                    <Pressable
                      style={({ pressed }) => [s.bookButton, { borderColor: '#3B82F6', opacity: pressed ? 0.7 : 1 }]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    >
                      <ThemedText style={[s.bookButtonText, { color: '#3B82F6' }]}>Book</ThemedText>
                    </Pressable>
                  )}
                  {room.adminOnly && (
                    <View style={[s.adminRoomBadge, { backgroundColor: '#EC489920' }]}>
                      <ThemedText style={[s.adminRoomText, { color: '#EC4899' }]}>ADMIN</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Recent bookings — faculty/admin only */}
      {isFacultyLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="RECENT BOOKINGS" colors={colors} count={RECENT_BOOKINGS.length} />
          <Card colors={colors}>
            {RECENT_BOOKINGS.map((bk, idx) => (
              <View
                key={bk.id}
                style={[
                  s.bookingRow,
                  idx < RECENT_BOOKINGS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.bookingContent}>
                  <View style={s.bookingNameRow}>
                    <ThemedText style={[s.bookingRoom, { color: colors.text }]}>{bk.room}</ThemedText>
                    <View style={[s.bookingStatusBadge, { backgroundColor: BOOKING_STATUS_COLOR[bk.status] + '20' }]}>
                      <ThemedText style={[s.bookingStatusText, { color: BOOKING_STATUS_COLOR[bk.status] }]}>
                        {bk.status.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.bookingMeta, { color: colors.textSecondary }]}>
                    {bk.date} {'\u00B7'} {bk.time}
                  </ThemedText>
                  <ThemedText style={[s.bookingPurpose, { color: colors.textTertiary }]}>
                    {bk.bookedBy} {'\u2014'} {bk.purpose}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Management controls — admin only */}
      {isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="ROOM MANAGEMENT" colors={colors} icon="gearshape.fill" />
          <Card colors={colors}>
            <View style={s.mgmtGrid}>
              {[
                { label: 'Manage Rooms', icon: 'building.2.fill', desc: 'Add, edit, or deactivate rooms' },
                { label: 'Booking Policies', icon: 'doc.text.fill', desc: 'Set booking rules and limits' },
                { label: 'Maintenance Log', icon: 'wrench.fill', desc: 'Track room maintenance status' },
                { label: 'Usage Reports', icon: 'chart.bar.fill', desc: 'Room utilization analytics' },
              ].map((item) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [s.mgmtItem, { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name={item.icon as any} size={18} color={colors.text} />
                  <ThemedText style={[s.mgmtItemLabel, { color: colors.text }]}>{item.label}</ThemedText>
                  <ThemedText style={[s.mgmtItemDesc, { color: colors.textSecondary }]}>{item.desc}</ThemedText>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>
      )}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// DEADLINES VIEW
// =============================================================================

function DeadlinesView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [categoryFilter, setCategoryFilter] = useState<DeadlineCategory | 'all'>('all');

  const filtered = ACADEMIC_DEADLINES
    .filter((dl) => {
      if (dl.adminOnly && !isDeanLevel(role)) return false;
      // Filter by target audience
      if (isStudent(role) && !dl.appliesTo.includes('students') && !dl.appliesTo.includes('all')) return false;
      if (role === 'E5' && !dl.appliesTo.includes('all')) return false;
      return true;
    })
    .filter((dl) => categoryFilter === 'all' || dl.category === categoryFilter);

  const urgentDeadlines = filtered.filter((dl) => dl.urgent);
  const upcomingDeadlines = filtered.filter((dl) => !dl.urgent && dl.daysAway <= 30);
  const laterDeadlines = filtered.filter((dl) => !dl.urgent && dl.daysAway > 30);

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Urgent alert banner */}
      {urgentDeadlines.length > 0 && (
        <View style={s.moduleContainer}>
          <Card colors={colors} highlight>
            <View style={s.urgentBanner}>
              <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#EF4444" />
              <View style={s.urgentBannerContent}>
                <ThemedText style={[s.urgentBannerTitle, { color: '#EF4444' }]}>
                  {urgentDeadlines.length} Urgent Deadline{urgentDeadlines.length !== 1 ? 's' : ''}
                </ThemedText>
                <ThemedText style={[s.urgentBannerSub, { color: colors.textSecondary }]}>
                  Action required within the next few days
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.deadlineFilterScroll}>
        {(['all', 'academic', 'registration', 'financial', 'administrative', 'ceremony'] as const).map((cat) => {
          // Hide admin-only category for non-admin
          if (cat === 'administrative' && !isFacultyLevel(role)) return null;
          const isActive = categoryFilter === cat;
          return (
            <Pressable
              key={cat}
              style={[s.deadlineFilterPill, {
                backgroundColor: isActive ? (cat === 'all' ? colors.text + '15' : DEADLINE_CATEGORY_COLOR[cat as DeadlineCategory] + '20') : 'transparent',
                borderColor: isActive ? (cat === 'all' ? colors.text + '30' : DEADLINE_CATEGORY_COLOR[cat as DeadlineCategory] + '40') : colors.border,
              }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategoryFilter(cat); }}
            >
              <ThemedText style={[s.deadlineFilterText, {
                color: isActive ? (cat === 'all' ? colors.text : DEADLINE_CATEGORY_COLOR[cat as DeadlineCategory]) : colors.textSecondary,
              }]}>
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Urgent deadlines */}
      {urgentDeadlines.length > 0 && (
        <View style={s.moduleContainer}>
          <SectionHeader title="URGENT" colors={colors} count={urgentDeadlines.length} icon="exclamationmark.triangle.fill" />
          <Card colors={colors}>
            {urgentDeadlines.map((dl, idx) => (
              <Pressable
                key={dl.id}
                style={[
                  s.deadlineRow,
                  idx < urgentDeadlines.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[s.deadlineDateBox, { backgroundColor: '#EF444420' }]}>
                  <ThemedText style={[s.deadlineDaysAway, { color: '#EF4444' }]}>
                    {dl.daysAway === 0 ? 'TODAY' : dl.daysAway === 1 ? '1 day' : `${dl.daysAway} days`}
                  </ThemedText>
                </View>
                <View style={s.deadlineContent}>
                  <ThemedText style={[s.deadlineTitle, { color: colors.text }]}>{dl.title}</ThemedText>
                  <ThemedText style={[s.deadlineDate, { color: colors.textSecondary }]}>{dl.date}</ThemedText>
                  <ThemedText style={[s.deadlineDesc, { color: colors.textTertiary }]} numberOfLines={2}>
                    {dl.description}
                  </ThemedText>
                  <View style={[s.deadlineCatBadge, { backgroundColor: DEADLINE_CATEGORY_COLOR[dl.category] + '20' }]}>
                    <ThemedText style={[s.deadlineCatText, { color: DEADLINE_CATEGORY_COLOR[dl.category] }]}>
                      {dl.category.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </Card>
        </View>
      )}

      {/* Upcoming deadlines (within 30 days) */}
      {upcomingDeadlines.length > 0 && (
        <View style={s.moduleContainer}>
          <SectionHeader title="UPCOMING (WITHIN 30 DAYS)" colors={colors} count={upcomingDeadlines.length} />
          <Card colors={colors}>
            {upcomingDeadlines.map((dl, idx) => (
              <Pressable
                key={dl.id}
                style={[
                  s.deadlineRow,
                  idx < upcomingDeadlines.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[s.deadlineDateBox, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.deadlineDaysAway, { color: colors.text }]}>
                    {dl.daysAway} days
                  </ThemedText>
                </View>
                <View style={s.deadlineContent}>
                  <ThemedText style={[s.deadlineTitle, { color: colors.text }]}>{dl.title}</ThemedText>
                  <ThemedText style={[s.deadlineDate, { color: colors.textSecondary }]}>{dl.date}</ThemedText>
                  <ThemedText style={[s.deadlineDesc, { color: colors.textTertiary }]} numberOfLines={2}>
                    {dl.description}
                  </ThemedText>
                  <View style={s.deadlineBadgeRow}>
                    <View style={[s.deadlineCatBadge, { backgroundColor: DEADLINE_CATEGORY_COLOR[dl.category] + '20' }]}>
                      <ThemedText style={[s.deadlineCatText, { color: DEADLINE_CATEGORY_COLOR[dl.category] }]}>
                        {dl.category.toUpperCase()}
                      </ThemedText>
                    </View>
                    {dl.adminOnly && (
                      <View style={[s.adminBadge, { backgroundColor: '#EC489920' }]}>
                        <ThemedText style={[s.adminBadgeText, { color: '#EC4899' }]}>ADMIN</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </Card>
        </View>
      )}

      {/* Later deadlines */}
      {laterDeadlines.length > 0 && (
        <View style={s.moduleContainer}>
          <SectionHeader title="LATER THIS SEMESTER" colors={colors} count={laterDeadlines.length} />
          <Card colors={colors}>
            {laterDeadlines.map((dl, idx) => (
              <View
                key={dl.id}
                style={[
                  s.deadlineCompactRow,
                  idx < laterDeadlines.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={[s.deadlineCatDot, { backgroundColor: DEADLINE_CATEGORY_COLOR[dl.category] }]} />
                <View style={s.deadlineCompactContent}>
                  <ThemedText style={[s.deadlineCompactTitle, { color: colors.text }]}>{dl.title}</ThemedText>
                  <ThemedText style={[s.deadlineCompactDate, { color: colors.textSecondary }]}>{dl.date}</ThemedText>
                </View>
                <ThemedText style={[s.deadlineCompactDays, { color: colors.textTertiary }]}>
                  {dl.daysAway}d
                </ThemedText>
              </View>
            ))}
          </Card>
        </View>
      )}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduCalendar({ colors, role = 'E1', onSwitchTab }: Props) {
  const visibleViews = getVisibleViews(role);
  const [activeView, setActiveView] = useState<CalendarView>('agenda');

  // Ensure current view is valid for the role
  const resolvedView = visibleViews.some((v) => v.key === activeView) ? activeView : visibleViews[0].key;

  return (
    <View style={{ flex: 1 }}>
      {/* View pill toggle row */}
      <View style={s.pillRow}>
        {visibleViews.map((pill) => {
          const isActive = resolvedView === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[s.pill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveView(pill.key);
              }}
            >
              <ThemedText style={[s.pillText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* View content */}
      {resolvedView === 'agenda' && <AgendaView colors={colors} role={role} />}
      {resolvedView === 'week' && <WeekView colors={colors} role={role} />}
      {resolvedView === 'month' && <MonthView colors={colors} role={role} />}
      {resolvedView === 'rooms' && <RoomsView colors={colors} role={role} />}
      {resolvedView === 'deadlines' && <DeadlinesView colors={colors} role={role} />}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 120 },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },

  // Pill row
  pillRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 12, gap: 6 },
  pill: { flex: 1, paddingVertical: 6, borderRadius: 18, alignItems: 'center' },
  pillText: { fontSize: 13, fontWeight: '600' },

  // Agenda
  agendaSummaryRow: { flexDirection: 'row', gap: Spacing.md },
  agendaSummaryStat: { flex: 1, alignItems: 'center' },
  agendaSummaryValue: { fontSize: 22, fontWeight: '700' },
  agendaSummaryLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  agendaRow: { flexDirection: 'row', paddingVertical: 10, gap: 10 },
  agendaTimeCol: { width: 58, alignItems: 'flex-end' },
  agendaTime: { fontSize: 12, fontWeight: '600' },
  agendaEndTime: { fontSize: 10, marginTop: 1 },
  agendaTypeLine: { width: 3, borderRadius: 1.5, minHeight: 36 },
  agendaContent: { flex: 1 },
  agendaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  agendaTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  agendaTypeBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  agendaTypeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  agendaLocation: { fontSize: 12, marginBottom: 1 },
  agendaInstructor: { fontSize: 11, marginBottom: 1 },
  agendaNotes: { fontSize: 11, fontStyle: 'italic' },
  adminBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm, alignSelf: 'flex-start', marginTop: 4 },
  adminBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },

  // Week view
  weekDayHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  weekDayLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  weekDayBadge: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  weekDayShort: { fontSize: 12, fontWeight: '700' },
  weekDayName: { fontSize: 14, fontWeight: '600' },
  weekDayDate: { fontSize: 11, marginTop: 1 },
  weekDayRight: { alignItems: 'flex-end' },
  weekDotRow: { flexDirection: 'row', gap: 3, marginBottom: 4 },
  weekEventDot: { width: 6, height: 6, borderRadius: 3 },
  weekEventMore: { fontSize: 9, fontWeight: '600' },
  weekEventCount: { fontSize: 10 },
  weekEventsList: { marginTop: 10, paddingTop: 8 },
  weekEventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  weekEventTime: { fontSize: 11, fontWeight: '500', width: 62, textAlign: 'right' },
  weekEventLine: { width: 3, height: 24, borderRadius: 1.5 },
  weekEventContent: { flex: 1 },
  weekEventTitle: { fontSize: 13, fontWeight: '600' },
  weekEventLocation: { fontSize: 10, marginTop: 1 },
  weekTypeBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  weekTypeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },

  // Month view
  monthHeaderRow: { flexDirection: 'row', marginBottom: 4 },
  monthHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  monthHeaderText: { fontSize: 10, fontWeight: '600' },
  monthWeekRow: { flexDirection: 'row' },
  monthDayCell: { flex: 1, alignItems: 'center', paddingVertical: 6, minHeight: 46 },
  monthDayNumber: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  monthDotRow: { flexDirection: 'row', gap: 2, minHeight: 6 },
  monthEventDot: { width: 5, height: 5, borderRadius: 2.5 },
  monthDetailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  monthDetailDot: { width: 8, height: 8, borderRadius: 4 },
  monthDetailContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthDetailTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  monthDetailBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  monthDetailBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 8 },
  emptyText: { fontSize: 13 },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, fontWeight: '500' },

  // Rooms
  roomSummaryRow: { flexDirection: 'row', gap: Spacing.md },
  roomSummaryStat: { flex: 1, alignItems: 'center' },
  roomSummaryValue: { fontSize: 22, fontWeight: '700' },
  roomSummaryLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  typeFilterScroll: { flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  typeFilterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  typeFilterText: { fontSize: 11, fontWeight: '600' },
  roomRow: { paddingVertical: 10 },
  roomContent: {},
  roomNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  roomName: { fontSize: 14, fontWeight: '600', flex: 1 },
  roomStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  roomStatusDot: { width: 5, height: 5, borderRadius: 2.5 },
  roomStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  roomMeta: { fontSize: 12, marginBottom: 2 },
  roomEquipment: { fontSize: 11, marginBottom: 2 },
  roomBooking: { fontSize: 11, marginBottom: 2 },
  roomNextAvail: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  roomActionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  roomTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  roomTypeText: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  bookButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm, borderWidth: 1 },
  bookButtonText: { fontSize: 11, fontWeight: '700' },
  adminRoomBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  adminRoomText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Bookings
  bookingRow: { paddingVertical: 10 },
  bookingContent: {},
  bookingNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  bookingRoom: { fontSize: 13, fontWeight: '600', flex: 1 },
  bookingStatusBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  bookingStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  bookingMeta: { fontSize: 12, marginBottom: 2 },
  bookingPurpose: { fontSize: 11 },

  // Management grid
  mgmtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  mgmtItem: { width: '47%', padding: Spacing.md, borderRadius: BorderRadius.md, gap: 6 },
  mgmtItemLabel: { fontSize: 13, fontWeight: '600' },
  mgmtItemDesc: { fontSize: 10 },

  // Deadlines
  deadlineFilterScroll: { flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  deadlineFilterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  deadlineFilterText: { fontSize: 11, fontWeight: '600' },
  urgentBanner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  urgentBannerContent: { flex: 1 },
  urgentBannerTitle: { fontSize: 14, fontWeight: '700' },
  urgentBannerSub: { fontSize: 12, marginTop: 2 },
  deadlineRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  deadlineDateBox: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', minWidth: 52 },
  deadlineDaysAway: { fontSize: 11, fontWeight: '700' },
  deadlineContent: { flex: 1 },
  deadlineTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  deadlineDate: { fontSize: 12, marginBottom: 3 },
  deadlineDesc: { fontSize: 11, lineHeight: 16, marginBottom: 4 },
  deadlineBadgeRow: { flexDirection: 'row', gap: 6 },
  deadlineCatBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  deadlineCatText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  deadlineCompactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  deadlineCatDot: { width: 8, height: 8, borderRadius: 4 },
  deadlineCompactContent: { flex: 1 },
  deadlineCompactTitle: { fontSize: 13, fontWeight: '600', marginBottom: 1 },
  deadlineCompactDate: { fontSize: 11 },
  deadlineCompactDays: { fontSize: 11, fontWeight: '600' },
});
