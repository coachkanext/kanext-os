/**
 * Agenda — Mode-aware calendar screen.
 * Supports all 5 modes (personal, business, education, community, sports)
 * with admin and member role variants per mode.
 * Monochrome design system. No blue. No accent.
 */

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useAppContext } from '@/context/app-context';

// ── Color constants ───────────────────────────────────────────────────────────

const EMBER   = '#8B2500';
const DRIFT   = '#9C9790';
const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const MIST    = '#C7C1BB';

// ── Types ─────────────────────────────────────────────────────────────────────

type Cat = { key: string; label: string; color: string; icon: string };
type Ev  = { id: number; type: string; title: string; time: string; subtitle: string; day: string; dayKey: string };
type DayGroup = { day: string; dayKey: string; events: Ev[] };

type ModeConfig = {
  roleKey: string;
  adminCats: Cat[];
  memberCats: Cat[];
  adminEvents: Ev[];
  memberEvents: Ev[];
  adminDipsonChips: string[];
  memberDipsonChips: string[];
  adminFabOptions: string[];
  memberFabOptions: string[];
};

// ── Week strip ────────────────────────────────────────────────────────────────

const WEEK_DAYS = [
  { key: '2026-04-12', abbr: 'SUN', num: '12' },
  { key: '2026-04-13', abbr: 'MON', num: '13' },
  { key: '2026-04-14', abbr: 'TUE', num: '14' },
  { key: '2026-04-15', abbr: 'WED', num: '15' },
  { key: '2026-04-16', abbr: 'THU', num: '16' },
  { key: '2026-04-17', abbr: 'FRI', num: '17' },
  { key: '2026-04-18', abbr: 'SAT', num: '18' },
];

// ── Mode configs ──────────────────────────────────────────────────────────────

const MODE_CONFIGS: Record<string, ModeConfig> = {

  // ── PERSONAL ────────────────────────────────────────────────────────────────
  personal: {
    roleKey: 'personal:agenda',
    adminCats: [
      { key: 'content',  label: 'Content',  color: EMBER,   icon: 'rectangle.stack' },
      { key: 'meetings', label: 'Meetings', color: DRIFT,   icon: 'phone' },
      { key: 'bookings', label: 'Bookings', color: GAIN,    icon: 'calendar.badge.checkmark' },
      { key: 'deals',    label: 'Deals',    color: CAUTION, icon: 'briefcase' },
      { key: 'personal', label: 'Personal', color: MIST,    icon: 'person.fill' },
    ],
    memberCats: [
      { key: 'events', label: 'Events', color: EMBER, icon: 'star.fill' },
    ],
    adminEvents: [
      // SUN APR 12
      { id: 1,  type: 'content',  title: 'YouTube Video Shoot',    time: '10:00 AM', subtitle: 'Studio session — Spring collection', day: 'SUN APR 12', dayKey: '2026-04-12' },
      { id: 2,  type: 'meetings', title: 'Brand Call — Nike',       time: '2:00 PM',  subtitle: 'Partnership discussion',             day: 'SUN APR 12', dayKey: '2026-04-12' },
      // MON APR 13
      { id: 3,  type: 'content',  title: 'Podcast Recording',       time: '9:00 AM',  subtitle: 'Episode 42 — Guest: Alex Chen',      day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 4,  type: 'bookings', title: 'Coaching Session',        time: '1:00 PM',  subtitle: 'Marcus J. · 60 min',                 day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 5,  type: 'deals',    title: 'Proposal Due — Adidas',   time: '5:00 PM',  subtitle: 'Spring campaign pitch',              day: 'MON APR 13', dayKey: '2026-04-13' },
      // TUE APR 14
      { id: 6,  type: 'content',  title: 'Instagram Reel Shoot',    time: '11:00 AM', subtitle: 'Product collab content',             day: 'TUE APR 14', dayKey: '2026-04-14' },
      { id: 7,  type: 'meetings', title: 'Team Weekly Sync',        time: '3:00 PM',  subtitle: 'All hands · 45 min',                 day: 'TUE APR 14', dayKey: '2026-04-14' },
      // WED APR 15
      { id: 8,  type: 'bookings', title: '1:1 Consultation',        time: '10:00 AM', subtitle: 'Taylor S. · Strategy session',       day: 'WED APR 15', dayKey: '2026-04-15' },
      { id: 9,  type: 'content',  title: 'Newsletter Draft',        time: '2:00 PM',  subtitle: 'April Edition',                      day: 'WED APR 15', dayKey: '2026-04-15' },
      { id: 10, type: 'personal', title: 'Dentist Appointment',     time: '4:30 PM',  subtitle: 'Annual checkup',                     day: 'WED APR 15', dayKey: '2026-04-15' },
      // THU APR 16
      { id: 11, type: 'deals',    title: 'Contract Review — Puma',  time: '11:00 AM', subtitle: 'Legal + manager call',               day: 'THU APR 16', dayKey: '2026-04-16' },
      { id: 12, type: 'content',  title: 'TikTok Shoot',            time: '3:00 PM',  subtitle: 'Trending audio · 3 clips',           day: 'THU APR 16', dayKey: '2026-04-16' },
      // FRI APR 17
      { id: 13, type: 'bookings', title: 'Group Coaching Call',     time: '12:00 PM', subtitle: '8 subscribers · Zoom',              day: 'FRI APR 17', dayKey: '2026-04-17' },
      { id: 14, type: 'meetings', title: 'Press Interview',         time: '3:00 PM',  subtitle: 'Complex Magazine',                   day: 'FRI APR 17', dayKey: '2026-04-17' },
      // SAT APR 18
      { id: 15, type: 'content',  title: 'BTS Photoshoot',          time: '10:00 AM', subtitle: 'NYC photoshoot day',                 day: 'SAT APR 18', dayKey: '2026-04-18' },
      { id: 16, type: 'personal', title: 'Family Dinner',           time: '7:00 PM',  subtitle: '',                                   day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    memberEvents: [
      { id: 101, type: 'events', title: 'Live Stream — Q&A Session',  time: '7:00 PM',  subtitle: 'YouTube · All subscribers', day: 'SUN APR 12', dayKey: '2026-04-12' },
      { id: 102, type: 'events', title: 'Webinar — Brand Building 101',time: '12:00 PM', subtitle: 'Inner Circle members · Zoom', day: 'TUE APR 14', dayKey: '2026-04-14' },
      { id: 103, type: 'events', title: 'Appearance — Sneaker Summit', time: '2:00 PM',  subtitle: 'NYC · Public event',        day: 'THU APR 16', dayKey: '2026-04-16' },
      { id: 104, type: 'events', title: 'Live Stream — Product Drop',  time: '6:00 PM',  subtitle: 'IG Live · Public',          day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    adminDipsonChips:  ["What's my content schedule this week?", "When's my next brand call?"],
    memberDipsonChips: ["What events are happening this week?", "When's my next live stream?"],
    adminFabOptions:   ['Content', 'Meeting', 'Booking', 'Deal', 'Personal'],
    memberFabOptions:  ['Event'],
  },

  // ── BUSINESS ────────────────────────────────────────────────────────────────
  business: {
    roleKey: 'business',
    adminCats: [
      { key: 'clients',  label: 'Clients',  color: EMBER,   icon: 'person.2.fill' },
      { key: 'team',     label: 'Team',     color: DRIFT,   icon: 'person.3.fill' },
      { key: 'projects', label: 'Projects', color: GAIN,    icon: 'folder.fill' },
      { key: 'hiring',   label: 'Hiring',   color: CAUTION, icon: 'person.badge.plus' },
      { key: 'board',    label: 'Board',    color: MIST,    icon: 'building.2.fill' },
      { key: 'personal', label: 'Personal', color: MIST,    icon: 'person.fill' },
    ],
    memberCats: [
      { key: 'meetings',  label: 'Meetings',  color: EMBER,   icon: 'phone' },
      { key: 'deadlines', label: 'Deadlines', color: CAUTION, icon: 'clock.badge.exclamationmark' },
    ],
    adminEvents: [
      // SUN APR 12
      { id: 1,  type: 'clients',  title: 'Client Meeting — Lincoln University', time: '10:00 AM', subtitle: 'Quarterly check-in',              day: 'SUN APR 12', dayKey: '2026-04-12' },
      { id: 2,  type: 'team',     title: 'Team Standup',                        time: '9:00 AM',  subtitle: 'Daily · 15 min',                  day: 'SUN APR 12', dayKey: '2026-04-12' },
      // MON APR 13
      { id: 3,  type: 'projects', title: 'Project Deadline — OS V3',            time: '5:00 PM',  subtitle: 'Final delivery',                  day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 4,  type: 'hiring',   title: 'Interview — Frontend Dev',            time: '2:00 PM',  subtitle: 'Round 2 · Technical',             day: 'MON APR 13', dayKey: '2026-04-13' },
      // TUE APR 14
      { id: 5,  type: 'team',     title: 'Product Roadmap Review',              time: '3:00 PM',  subtitle: 'Q2 planning',                     day: 'TUE APR 14', dayKey: '2026-04-14' },
      { id: 6,  type: 'clients',  title: 'Client Onboarding — ICCLA',          time: '11:00 AM', subtitle: 'New account setup',               day: 'TUE APR 14', dayKey: '2026-04-14' },
      // WED APR 15
      { id: 7,  type: 'board',    title: 'Board Meeting',                       time: '2:00 PM',  subtitle: 'Q1 results + Q2 plan',            day: 'WED APR 15', dayKey: '2026-04-15' },
      // THU APR 16
      { id: 8,  type: 'hiring',   title: 'Interview — Product Designer',        time: '10:00 AM', subtitle: 'Round 1 · Portfolio review',      day: 'THU APR 16', dayKey: '2026-04-16' },
      { id: 9,  type: 'projects', title: 'Sprint Planning',                     time: '1:00 PM',  subtitle: 'Engineering · 2 hrs',             day: 'THU APR 16', dayKey: '2026-04-16' },
      // FRI APR 17
      { id: 10, type: 'clients',  title: 'Client Demo — LU Athletic Dept',     time: '11:00 AM', subtitle: 'Feature walkthrough',             day: 'FRI APR 17', dayKey: '2026-04-17' },
      { id: 11, type: 'team',     title: 'Quarterly Review',                    time: '3:00 PM',  subtitle: 'All hands · 90 min',              day: 'FRI APR 17', dayKey: '2026-04-17' },
      // SAT APR 18
      { id: 12, type: 'personal', title: 'Personal — Rest Day',                 time: '6:00 PM',  subtitle: '',                                day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    memberEvents: [
      { id: 101, type: 'meetings',  title: 'Project Kickoff Call',    time: '10:00 AM', subtitle: 'KaNeXT team · Zoom',      day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 102, type: 'deadlines', title: 'Invoice Due — April',     time: '5:00 PM',  subtitle: 'Net-30 · $4,200',         day: 'WED APR 15', dayKey: '2026-04-15' },
      { id: 103, type: 'meetings',  title: 'Product Demo Review',     time: '2:00 PM',  subtitle: 'Feedback session',        day: 'THU APR 16', dayKey: '2026-04-16' },
      { id: 104, type: 'deadlines', title: 'Proposal Deadline',       time: '12:00 PM', subtitle: 'Q2 project bid',          day: 'FRI APR 17', dayKey: '2026-04-17' },
    ],
    adminDipsonChips:  ["What client meetings do I have today?", "When's the board meeting?"],
    memberDipsonChips: ["What meetings do I have today?", "When's my next deadline?"],
    adminFabOptions:   ['Client', 'Team', 'Project', 'Hiring', 'Board', 'Personal'],
    memberFabOptions:  ['Meeting', 'Deadline'],
  },

  // ── EDUCATION ───────────────────────────────────────────────────────────────
  education: {
    roleKey: 'education',
    adminCats: [
      { key: 'classes',       label: 'Classes',       color: EMBER,   icon: 'book.fill' },
      { key: 'faculty',       label: 'Faculty',       color: DRIFT,   icon: 'person.badge.clock.fill' },
      { key: 'accreditation', label: 'Accreditation', color: GAIN,    icon: 'checkmark.shield.fill' },
      { key: 'enrollment',    label: 'Enrollment',    color: CAUTION, icon: 'tray.fill' },
      { key: 'events',        label: 'Events',        color: MIST,    icon: 'star.fill' },
      { key: 'personal',      label: 'Personal',      color: MIST,    icon: 'person.fill' },
    ],
    memberCats: [
      { key: 'classes',  label: 'Classes',  color: EMBER,   icon: 'book.fill' },
      { key: 'exams',    label: 'Exams',    color: CAUTION, icon: 'pencil.and.outline' },
      { key: 'clubs',    label: 'Clubs',    color: GAIN,    icon: 'person.3.fill' },
      { key: 'events',   label: 'Events',   color: MIST,    icon: 'star.fill' },
      { key: 'personal', label: 'Personal', color: DRIFT,   icon: 'person.fill' },
    ],
    adminEvents: [
      // SUN APR 12
      { id: 1,  type: 'classes',       title: 'BUSN 301 Lecture',            time: '10:00 AM', subtitle: 'Strategic Management · BUS 204',       day: 'SUN APR 12', dayKey: '2026-04-12' },
      { id: 2,  type: 'faculty',       title: 'Faculty Senate Meeting',      time: '2:00 PM',  subtitle: 'Monthly · All faculty',                 day: 'SUN APR 12', dayKey: '2026-04-12' },
      // MON APR 13
      { id: 3,  type: 'accreditation', title: 'WSCUC Report Due',            time: '5:00 PM',  subtitle: 'Annual compliance submission',           day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 4,  type: 'enrollment',    title: 'Admissions Review',           time: '9:00 AM',  subtitle: 'Spring 2027 applicants',                 day: 'MON APR 13', dayKey: '2026-04-13' },
      // TUE APR 14
      { id: 5,  type: 'events',        title: 'Open House',                  time: '10:00 AM', subtitle: 'Prospective students · Campus',          day: 'TUE APR 14', dayKey: '2026-04-14' },
      // WED APR 15
      { id: 6,  type: 'classes',       title: 'MBA 501 Lecture',             time: '2:00 PM',  subtitle: 'Managerial Economics · GRD 101',        day: 'WED APR 15', dayKey: '2026-04-15' },
      { id: 7,  type: 'faculty',       title: 'Department Chair Meeting',    time: '4:00 PM',  subtitle: 'Academic Affairs',                       day: 'WED APR 15', dayKey: '2026-04-15' },
      // THU APR 16
      { id: 8,  type: 'enrollment',    title: 'Registration Opens',          time: '8:00 AM',  subtitle: 'Fall 2026 priority window',              day: 'THU APR 16', dayKey: '2026-04-16' },
      // FRI APR 17
      { id: 9,  type: 'classes',       title: 'DIAG 410 Lab',                time: '9:00 AM',  subtitle: 'Advanced Imaging Tech · LAB 3',         day: 'FRI APR 17', dayKey: '2026-04-17' },
      { id: 10, type: 'events',        title: 'Commencement Rehearsal',      time: '1:00 PM',  subtitle: 'Class of 2026 · Main auditorium',        day: 'FRI APR 17', dayKey: '2026-04-17' },
      // SAT APR 18
      { id: 11, type: 'accreditation', title: 'IACBE Self-Study Review',     time: '10:00 AM', subtitle: 'Business school compliance',             day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    memberEvents: [
      { id: 101, type: 'classes',  title: 'BUSN 301 — Strategic Management', time: '10:00 AM', subtitle: 'Mon/Wed · BUS 204',       day: 'SUN APR 12', dayKey: '2026-04-12' },
      { id: 102, type: 'exams',    title: 'MBA 501 Midterm',                 time: '2:00 PM',  subtitle: 'GRD 101 · Bring ID',      day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 103, type: 'classes',  title: 'MBA 510 — Leadership',            time: '1:00 PM',  subtitle: 'Mon/Wed · GRD 105',       day: 'WED APR 15', dayKey: '2026-04-15' },
      { id: 104, type: 'clubs',    title: 'Business Club Meeting',           time: '5:00 PM',  subtitle: 'BUS 202 · Monthly',       day: 'THU APR 16', dayKey: '2026-04-16' },
      { id: 105, type: 'events',   title: 'Career Fair',                     time: '10:00 AM', subtitle: 'Campus Center · All majors', day: 'FRI APR 17', dayKey: '2026-04-17' },
      { id: 106, type: 'exams',    title: 'DIAG 410 Practical',              time: '9:00 AM',  subtitle: 'LAB 3 · 2 hrs',           day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    adminDipsonChips:  ["When's the next accreditation deadline?", "Show me this week's classes"],
    memberDipsonChips: ["When's my next exam?", "Show me my classes this week"],
    adminFabOptions:   ['Class', 'Faculty', 'Accreditation', 'Enrollment', 'Event', 'Personal'],
    memberFabOptions:  ['Class', 'Exam', 'Club', 'Event', 'Personal'],
  },

  // ── COMMUNITY ───────────────────────────────────────────────────────────────
  community: {
    roleKey: 'community:agenda',
    adminCats: [
      { key: 'services',  label: 'Services',  color: EMBER,   icon: 'music.note.list' },
      { key: 'ministry',  label: 'Ministry',  color: DRIFT,   icon: 'heart.fill' },
      { key: 'volunteers',label: 'Volunteers',color: GAIN,    icon: 'hands.sparkles.fill' },
      { key: 'events',    label: 'Events',    color: CAUTION, icon: 'star.fill' },
      { key: 'personal',  label: 'Personal',  color: MIST,    icon: 'person.fill' },
    ],
    memberCats: [
      { key: 'services',  label: 'Services',  color: EMBER,   icon: 'music.note.list' },
      { key: 'groups',    label: 'Groups',    color: DRIFT,   icon: 'person.3.fill' },
      { key: 'events',    label: 'Events',    color: CAUTION, icon: 'star.fill' },
      { key: 'personal',  label: 'Personal',  color: MIST,    icon: 'person.fill' },
    ],
    adminEvents: [
      // SUN APR 12
      { id: 1,  type: 'services',   title: 'Easter Sunday Service',        time: '10:00 AM', subtitle: 'Main auditorium · All welcome',  day: 'SUN APR 12', dayKey: '2026-04-12' },
      { id: 2,  type: 'ministry',   title: 'Deacon Board Meeting',         time: '2:00 PM',  subtitle: 'Leadership · Conference room',   day: 'SUN APR 12', dayKey: '2026-04-12' },
      // MON APR 13
      { id: 3,  type: 'volunteers', title: 'Volunteer Briefing',           time: '8:00 AM',  subtitle: 'Setup crew · 20 volunteers',     day: 'MON APR 13', dayKey: '2026-04-13' },
      // TUE APR 14
      { id: 4,  type: 'ministry',   title: 'Youth Night',                  time: '6:00 PM',  subtitle: 'Ages 13–18 · Fellowship hall',   day: 'TUE APR 14', dayKey: '2026-04-14' },
      // WED APR 15
      { id: 5,  type: 'services',   title: 'Wednesday Bible Study',        time: '7:00 PM',  subtitle: 'Series: Acts of Faith',          day: 'WED APR 15', dayKey: '2026-04-15' },
      // THU APR 16
      { id: 6,  type: 'volunteers', title: 'Sheepfold Volunteer Training', time: '9:00 AM',  subtitle: '12 new volunteers',              day: 'THU APR 16', dayKey: '2026-04-16' },
      { id: 7,  type: 'ministry',   title: 'Worship Team Rehearsal',       time: '6:00 PM',  subtitle: 'Easter Sunday prep',             day: 'THU APR 16', dayKey: '2026-04-16' },
      // FRI APR 17
      { id: 8,  type: 'personal',   title: 'Personal — Rest',              time: '4:00 PM',  subtitle: '',                               day: 'FRI APR 17', dayKey: '2026-04-17' },
      // SAT APR 18
      { id: 9,  type: 'events',     title: 'Outreach Saturday',            time: '9:00 AM',  subtitle: 'Hawthorne Community Center',     day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    memberEvents: [
      { id: 101, type: 'services', title: 'Easter Sunday Service',   time: '10:00 AM', subtitle: 'Main auditorium · All welcome', day: 'SUN APR 12', dayKey: '2026-04-12' },
      { id: 102, type: 'groups',   title: "Men's Bible Study",        time: '7:00 PM',  subtitle: 'Room 204 · Bring your Bible',   day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 103, type: 'services', title: 'Wednesday Bible Study',    time: '7:00 PM',  subtitle: 'Series: Acts of Faith',         day: 'WED APR 15', dayKey: '2026-04-15' },
      { id: 104, type: 'events',   title: 'Outreach Saturday',        time: '9:00 AM',  subtitle: 'Hawthorne Community Center',    day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    adminDipsonChips:  ["What's the volunteer coverage for Sunday?", "When's the next ministry meeting?"],
    memberDipsonChips: ["What services are this week?", "When's my small group?"],
    adminFabOptions:   ['Service', 'Ministry', 'Volunteer', 'Event', 'Personal'],
    memberFabOptions:  ['Service', 'Group', 'Event', 'Personal'],
  },

  // ── SPORTS ──────────────────────────────────────────────────────────────────
  sports: {
    roleKey: 'sports:agenda',
    adminCats: [
      { key: 'games',     label: 'Games',     color: EMBER,   icon: 'basketball.fill' },
      { key: 'practice',  label: 'Practice',  color: DRIFT,   icon: 'figure.run' },
      { key: 'recruiting',label: 'Recruiting',color: GAIN,    icon: 'person.badge.plus' },
      { key: 'travel',    label: 'Travel',    color: CAUTION, icon: 'airplane' },
      { key: 'film',      label: 'Film',      color: MIST,    icon: 'film.fill' },
      { key: 'personal',  label: 'Personal',  color: MIST,    icon: 'person.fill' },
    ],
    memberCats: [
      { key: 'games',    label: 'Games',    color: EMBER,   icon: 'basketball.fill' },
      { key: 'practice', label: 'Practice', color: DRIFT,   icon: 'figure.run' },
      { key: 'classes',  label: 'Classes',  color: GAIN,    icon: 'book.fill' },
      { key: 'workouts', label: 'Workouts', color: CAUTION, icon: 'dumbbell.fill' },
      { key: 'personal', label: 'Personal', color: MIST,    icon: 'person.fill' },
    ],
    adminEvents: [
      // SUN APR 12
      { id: 1,  type: 'games',      title: 'vs Cal Maritime',                     time: '3:00 PM',  subtitle: 'Home · GNAC',                       day: 'SUN APR 12', dayKey: '2026-04-12' },
      // MON APR 13
      { id: 2,  type: 'practice',   title: 'Practice — Transition Defense',       time: '9:00 AM',  subtitle: 'Main gym · 2 hrs',                  day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 3,  type: 'recruiting', title: 'Recruiting Visit — J. Randolph',      time: '2:00 PM',  subtitle: 'Campus tour + film review',          day: 'MON APR 13', dayKey: '2026-04-13' },
      // TUE APR 14
      { id: 4,  type: 'film',       title: 'Film Session',                        time: '8:00 AM',  subtitle: 'vs Cal Maritime breakdown',          day: 'TUE APR 14', dayKey: '2026-04-14' },
      // WED APR 15
      { id: 5,  type: 'practice',   title: 'Practice — Offensive Sets',           time: '3:00 PM',  subtitle: 'Main gym · 2 hrs',                  day: 'WED APR 15', dayKey: '2026-04-15' },
      // THU APR 16
      { id: 6,  type: 'travel',     title: 'Depart — Long Beach',                 time: '7:00 AM',  subtitle: 'Team bus · 4 hr drive',             day: 'THU APR 16', dayKey: '2026-04-16' },
      // FRI APR 17
      { id: 7,  type: 'games',      title: 'vs Cal State Dominguez Hills',        time: '7:00 PM',  subtitle: 'Away · GNAC',                       day: 'FRI APR 17', dayKey: '2026-04-17' },
      // SAT APR 18
      { id: 8,  type: 'travel',     title: 'Return — Oakland',                    time: '2:00 PM',  subtitle: 'Team bus',                          day: 'SAT APR 18', dayKey: '2026-04-18' },
      { id: 9,  type: 'recruiting', title: 'Coaches Meeting — Recruits',          time: '4:00 PM',  subtitle: 'Board room · Staff only',            day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    memberEvents: [
      { id: 101, type: 'games',    title: 'vs Cal Maritime',                  time: '3:00 PM',  subtitle: 'Home · Dress + 2 hrs early',         day: 'SUN APR 12', dayKey: '2026-04-12' },
      { id: 102, type: 'practice', title: 'Practice — Transition Defense',    time: '9:00 AM',  subtitle: 'Main gym · Full pads',               day: 'MON APR 13', dayKey: '2026-04-13' },
      { id: 103, type: 'classes',  title: 'BUSN 301 — Strategic Mgmt',       time: '10:00 AM', subtitle: 'BUS 204',                             day: 'TUE APR 14', dayKey: '2026-04-14' },
      { id: 104, type: 'workouts', title: 'Weight Room',                      time: '7:00 AM',  subtitle: 'Strength & Conditioning',            day: 'WED APR 15', dayKey: '2026-04-15' },
      { id: 105, type: 'practice', title: 'Practice — Offensive Sets',        time: '3:00 PM',  subtitle: 'Main gym',                           day: 'WED APR 15', dayKey: '2026-04-15' },
      { id: 106, type: 'games',    title: 'vs Cal State Dominguez Hills',     time: '7:00 PM',  subtitle: 'Away · Team bus departs 3 PM',       day: 'FRI APR 17', dayKey: '2026-04-17' },
      { id: 107, type: 'personal', title: 'Academic Check-In',                time: '11:00 AM', subtitle: 'Athletic advisor · 30 min',          day: 'SAT APR 18', dayKey: '2026-04-18' },
    ],
    adminDipsonChips:  ["When's our next game?", "What's practice focus tomorrow?"],
    memberDipsonChips: ["When's my next game?", "What's practice tomorrow?"],
    adminFabOptions:   ['Game', 'Practice', 'Recruiting', 'Travel', 'Film', 'Personal'],
    memberFabOptions:  ['Game', 'Practice', 'Class', 'Workout', 'Personal'],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDayGroups(events: Ev[], filter: string, catMap: Record<string, Cat>): DayGroup[] {
  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter.toLowerCase());

  const map = new Map<string, DayGroup>();
  for (const ev of filtered) {
    if (!map.has(ev.dayKey)) {
      map.set(ev.dayKey, { day: ev.day, dayKey: ev.dayKey, events: [] });
    }
    map.get(ev.dayKey)!.events.push(ev);
  }

  return Array.from(map.values()).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

function getDotsForDay(dayKey: string, filter: string, events: Ev[]): string[] {
  const filtered = filter === 'All'
    ? events.filter(e => e.dayKey === dayKey)
    : events.filter(e => e.dayKey === dayKey && e.type === filter.toLowerCase());
  const seen = new Set<string>();
  const dots: string[] = [];
  for (const ev of filtered) {
    if (!seen.has(ev.type) && dots.length < 3) {
      seen.add(ev.type);
      dots.push(ev.type);
    }
  }
  return dots;
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({ event, catMap, C, s }: { event: Ev; catMap: Record<string, Cat>; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  const cat = catMap[event.type];
  const borderColor = cat?.color ?? DRIFT;
  const iconName = cat?.icon ?? 'calendar';

  return (
    <Pressable
      style={[s.eventCard, { backgroundColor: C.surface, borderLeftColor: borderColor }]}
      onPress={() => Haptics.selectionAsync()}
    >
      <View style={s.eventCardInner}>
        <View style={s.eventCardLeft}>
          <View style={s.eventCardIconRow}>
            <IconSymbol name={iconName as any} size={14} color={borderColor} />
            <Text style={[s.eventCardTitle, { color: C.label }]}>{event.title}</Text>
          </View>
          {event.subtitle ? (
            <Text style={[s.eventCardSubtitle, { color: C.secondary }]}>{event.subtitle}</Text>
          ) : null}
        </View>
        <Text style={[s.eventCardTime, { color: C.secondary }]}>{event.time}</Text>
      </View>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AgendaScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const { state } = useAppContext();

  const mode = (state.activeContext?.mode ?? 'personal') as string;
  const config = MODE_CONFIGS[mode] ?? MODE_CONFIGS.personal;

  const [role, cycleRole, roleCycles] = useDemoRole(config.roleKey);
  const isAdmin = role === roleCycles[0];

  const cats         = isAdmin ? config.adminCats         : config.memberCats;
  const events       = isAdmin ? config.adminEvents       : config.memberEvents;
  const dipsonChips  = isAdmin ? config.adminDipsonChips  : config.memberDipsonChips;
  const fabOptions   = isAdmin ? config.adminFabOptions   : config.memberFabOptions;

  // Build a color/icon lookup from cats (covers both roles so cross-mode event
  // types can always resolve a color even if a filter shows the other role's data)
  const catMap = useMemo(() => {
    const m: Record<string, Cat> = {};
    [...config.adminCats, ...config.memberCats].forEach(c => { m[c.key] = c; });
    return m;
  }, [config]);

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedDayKey, setSelectedDayKey] = useState<string>('2026-04-12');

  // Reset filter when mode changes
  useEffect(() => { setActiveFilter('All'); }, [mode]);

  const scrollRef = useRef<ScrollView>(null);
  const dayOffsets = useRef<Map<string, number>>(new Map());

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const dayGroups = useMemo(
    () => buildDayGroups(events, activeFilter, catMap),
    [events, activeFilter, catMap],
  );

  const handleDayPress = useCallback((dayKey: string) => {
    Haptics.selectionAsync();
    setSelectedDayKey(dayKey);
    const offset = dayOffsets.current.get(dayKey);
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: offset, animated: true });
    }
  }, []);

  const contentBottom = insets.bottom + 80;

  // Filter chips: 'All' first, then category labels for current role
  const allChips = ['All', ...cats.map(c => c.label)];

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.kBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Calendar</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isAdmin} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 52 + 8, paddingBottom: contentBottom }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Filter Pills ─────────────────────────────────────────────────────── */}
        <View style={[s.filterRow, { borderBottomColor: C.separator }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterScrollContent}
          >
            {allChips.map((chip) => {
              const active = activeFilter.toLowerCase() === chip.toLowerCase();
              // For non-All chips, look up the cat by its label (case-insensitive)
              const cat = chip === 'All' ? null : cats.find(c => c.label.toLowerCase() === chip.toLowerCase());
              const dotColor = cat?.color ?? null;
              return (
                <Pressable
                  key={chip}
                  style={[
                    s.filterPill,
                    {
                      backgroundColor: active ? C.label : 'transparent',
                      borderColor: active ? C.label : C.separator,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveFilter(chip);
                  }}
                >
                  {dotColor ? (
                    <View style={[s.filterDot, { backgroundColor: active ? C.bg : dotColor }]} />
                  ) : null}
                  <Text style={[s.filterPillText, { color: active ? C.bg : C.label }]}>
                    {chip}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Ask Dipson Card ──────────────────────────────────────────────────── */}
        <Pressable
          style={[s.dipsonCard, { backgroundColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDipsonSheet('Calendar');
          }}
        >
          <View style={s.dipsonRow}>
            <IconSymbol name="sparkles" size={18} color={C.bg} />
            <View style={{ flex: 1 }}>
              <Text style={[s.dipsonTitle, { color: C.bg }]}>Ask Dipson</Text>
              <Text style={[s.dipsonSub, { color: C.bg + 'AA' }]}>Tap to ask about your schedule</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.bg + '66'} />
          </View>

          {/* Suggestion chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.dipsonChipsContent}
          >
            {dipsonChips.map((chip) => (
              <Pressable
                key={chip}
                style={[s.dipsonChip, { borderColor: C.bg + '33' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  openDipsonSheet(chip);
                }}
              >
                <Text style={[s.dipsonChipText, { color: C.bg + 'CC' }]}>{chip}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>

        {/* ── Week Strip ───────────────────────────────────────────────────────── */}
        <View style={[s.weekStripContainer, { borderBottomColor: C.separator }]}>
          <View style={s.weekDayRow}>
            {WEEK_DAYS.map((day) => {
              const selected = selectedDayKey === day.key;
              const dots = getDotsForDay(day.key, activeFilter, events);
              return (
                <Pressable
                  key={day.key}
                  style={s.weekDayCell}
                  onPress={() => handleDayPress(day.key)}
                >
                  <Text style={[s.weekDayAbbr, { color: selected ? C.label : C.secondary }]}>
                    {day.abbr}
                  </Text>
                  <View style={[
                    s.weekDayNum,
                    selected && { backgroundColor: C.label },
                  ]}>
                    <Text style={[
                      s.weekDayNumText,
                      { color: selected ? C.bg : C.label },
                    ]}>
                      {day.num}
                    </Text>
                  </View>
                  <View style={s.weekDotsRow}>
                    {dots.map((type, i) => (
                      <View
                        key={i}
                        style={[s.weekDot, { backgroundColor: catMap[type]?.color ?? DRIFT }]}
                      />
                    ))}
                    {dots.length === 0 && <View style={s.weekDotEmpty} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Event List ───────────────────────────────────────────────────────── */}
        <View style={s.eventList}>
          {dayGroups.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={[s.emptyText, { color: C.secondary }]}>No events for this category.</Text>
            </View>
          ) : (
            dayGroups.map((group) => (
              <View
                key={group.dayKey}
                onLayout={(e) => {
                  dayOffsets.current.set(group.dayKey, e.nativeEvent.layout.y);
                }}
              >
                {/* Day header */}
                <View style={[s.dayHeader, { borderBottomColor: C.separator }]}>
                  <Text style={[s.dayHeaderText, { color: C.secondary }]}>
                    {group.day}
                  </Text>
                </View>

                {/* Event cards */}
                <View style={s.dayCardStack}>
                  {group.events.map((ev) => (
                    <EventCard key={ev.id} event={ev} catMap={catMap} C={C} s={s} />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 65 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('Add', 'What would you like to add?', [
            ...fabOptions.map(opt => ({ text: opt, onPress: () => {} })),
            { text: 'Cancel', style: 'cancel' as const },
          ]);
        }}
      >
        <IconSymbol name="plus" size={24} color={C.bg} />
      </Pressable>

    </View>
  );
}

// ── makeStyles ────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    // Top bar
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    topBar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderWidth: 1,
    },
    titleText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    rolePillWrap: { alignItems: 'flex-end', justifyContent: 'center' },

    // Scroll
    scrollContent: {
      gap: 0,
    },

    // Filter row
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    filterScrollContent: {
      paddingLeft: 16,
      paddingRight: 16,
      gap: 8,
      flexGrow: 0,
    },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: 20,
      borderWidth: 1.5,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    filterDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    filterPillText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Dipson card
    dipsonCard: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 16,
      padding: 14,
    },
    dipsonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    dipsonTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2,
    },
    dipsonSub: {
      fontSize: 12,
      lineHeight: 16,
    },
    dipsonChipsContent: {
      gap: 8,
      paddingRight: 4,
    },
    dipsonChip: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    dipsonChipText: {
      fontSize: 11,
      fontWeight: '500',
    },

    // Week strip
    weekStripContainer: {
      marginTop: 12,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    weekDayRow: {
      flexDirection: 'row',
      paddingHorizontal: 8,
    },
    weekDayCell: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    weekDayAbbr: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.4,
    },
    weekDayNum: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekDayNumText: {
      fontSize: 14,
      fontWeight: '600',
    },
    weekDotsRow: {
      flexDirection: 'row',
      gap: 3,
      height: 6,
      alignItems: 'center',
    },
    weekDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    weekDotEmpty: {
      width: 5,
      height: 5,
    },

    // Event list
    eventList: {
      paddingTop: 8,
    },
    emptyState: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
    },

    // Day header
    dayHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      marginTop: 4,
    },
    dayHeaderText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },

    // Day card stack
    dayCardStack: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },

    // Event card
    eventCard: {
      borderRadius: 12,
      borderLeftWidth: 4,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    eventCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    eventCardLeft: {
      flex: 1,
      gap: 3,
    },
    eventCardIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    eventCardTitle: {
      fontSize: 14,
      fontWeight: '700',
      flexShrink: 1,
    },
    eventCardSubtitle: {
      fontSize: 12,
      lineHeight: 16,
    },
    eventCardTime: {
      fontSize: 12,
      flexShrink: 0,
    },

    // FAB
    fab: {
      position: 'absolute',
      right: 16,
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
