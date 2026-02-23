/**
 * Church Serve — 6-view pill-toggled volunteer + coverage + scheduling control plane.
 * Views: Overview | Teams | Schedule | Volunteers | Training | Requests
 *
 * RBAC:
 *   C0/C1/C2    — All 6 views, full admin (pastoral level)
 *   C3-C5       — Overview, Teams, Schedule, Volunteers, Requests (5 views)
 *   C6-C7       — Overview, Schedule (own), Requests (own) (3 views)
 *   C8-C11      — Overview only (member through visitor)
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
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';

// RBAC
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isElderLevel,
  isStaffLevel,
  isMember,
} from '@/utils/church-rbac';

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}

type ServeView = 'overview' | 'teams' | 'schedule' | 'volunteers' | 'training' | 'requests';

interface ViewDef {
  id: ServeView;
  label: string;
}

const ALL_VIEWS: ViewDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'teams', label: 'Teams' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'volunteers', label: 'Volunteers' },
  { id: 'training', label: 'Training' },
  { id: 'requests', label: 'Requests' },
];

function getAvailableViews(role: ChurchRoleLens): ViewDef[] {
  // C0/C1/C2: all 6 views (pastoral level — full admin)
  if (isElderLevel(role)) return ALL_VIEWS;
  // C3-C5: overview, teams, schedule, volunteers, requests (ministry/worship level)
  if (role === 'C3' || role === 'C4' || role === 'C5') return ALL_VIEWS.filter((v) =>
    ['overview', 'teams', 'schedule', 'volunteers', 'requests'].includes(v.id),
  );
  // C6-C7: overview, schedule, requests (volunteer coordinator / volunteer — own serve + swap requests)
  if (role === 'C6' || role === 'C7') return ALL_VIEWS.filter((v) =>
    ['overview', 'schedule', 'requests'].includes(v.id),
  );
  // C8-C11: overview only (member through visitor)
  return ALL_VIEWS.filter((v) => v.id === 'overview');
}

// =============================================================================
// INLINE MOCK DATA — OVERVIEW KPIs
// =============================================================================

interface ServeKPI {
  label: string;
  value: string;
  icon: string;
  color?: string;
}

const SERVE_KPIS: ServeKPI[] = [
  { label: 'Active Volunteers', value: '320', icon: 'person.2.fill' },
  { label: 'Ministry Teams', value: '28', icon: 'rectangle.3.group.fill' },
  { label: 'Open Positions', value: '14', icon: 'exclamationmark.circle.fill', color: '#F59E0B' },
  { label: 'Serve Hours (Month)', value: '2,400', icon: 'clock.fill' },
  { label: 'Retention Rate', value: '84%', icon: 'arrow.triangle.2.circlepath' },
  { label: 'New Volunteers (Qtr)', value: '18', icon: 'person.badge.plus' },
];

// Coverage status data
interface CoverageSlot {
  ministry: string;
  filled: number;
  total: number;
}

const NEXT_SUNDAY_COVERAGE: CoverageSlot[] = [
  { ministry: 'Greeting Team', filled: 10, total: 12 },
  { ministry: 'Parking Team', filled: 5, total: 8 },
  { ministry: 'Children\'s Ministry', filled: 20, total: 24 },
  { ministry: 'Youth Ministry', filled: 14, total: 16 },
  { ministry: 'Worship Team', filled: 15, total: 15 },
  { ministry: 'AV/Media', filled: 4, total: 6 },
  { ministry: 'Hospitality/Ushers', filled: 8, total: 10 },
  { ministry: 'Prayer Team', filled: 6, total: 8 },
  { ministry: 'Outreach', filled: 8, total: 10 },
  { ministry: 'Campus Care', filled: 3, total: 6 },
];

// =============================================================================
// INLINE MOCK DATA — VOLUNTEER PIPELINE
// =============================================================================

interface PipelineStage {
  label: string;
  count: number;
  color: string;
}

const VOLUNTEER_PIPELINE: PipelineStage[] = [
  { label: 'Prospects', count: 24, color: '#A1A1AA' },
  { label: 'Applied', count: 16, color: ACCENT },
  { label: 'BGC', count: 8, color: '#F59E0B' },
  { label: 'Trained', count: 6, color: ACCENT },
  { label: 'Active', count: 320, color: '#22C55E' },
];

// =============================================================================
// INLINE MOCK DATA — TEAMS
// =============================================================================

type TeamHealth = 'fully-staffed' | 'understaffed' | 'critical';

interface TeamRole {
  role: string;
  required: number;
  filled: number;
}

interface ServeTeam {
  id: string;
  name: string;
  ministry: string;
  leader: string;
  activeMembers: number;
  capacity: number;
  meetingCadence: string;
  description: string;
  health: TeamHealth;
  icon: string;
  color: string;
  roles?: TeamRole[];
}

const SERVE_TEAMS: ServeTeam[] = [
  { id: 'st-1', name: 'Greeting Team', ministry: 'Hospitality', leader: 'Deacon Martinez', activeMembers: 12, capacity: 12, meetingCadence: 'Monthly', description: 'Welcome guests at all entrance points before and after services. First impression ministry.', health: 'fully-staffed', icon: 'hand.wave.fill', color: '#22C55E', roles: [{ role: 'Lead Greeter', required: 2, filled: 2 }, { role: 'Greeter', required: 8, filled: 8 }, { role: 'Info Desk', required: 2, filled: 2 }] },
  { id: 'st-2', name: 'Parking Team', ministry: 'Hospitality', leader: 'Brother Williams', activeMembers: 5, capacity: 8, meetingCadence: 'Quarterly', description: 'Direct traffic, assist with parking, and welcome guests in the lot. Rain or shine servants.', health: 'understaffed', icon: 'car.fill', color: '#F59E0B', roles: [{ role: 'Lot Captain', required: 1, filled: 1 }, { role: 'Lot Attendant', required: 5, filled: 3 }, { role: 'Shuttle Driver', required: 2, filled: 1 }] },
  { id: 'st-3', name: 'Children\'s Ministry', ministry: 'Next Gen', leader: 'Sister Angela Davis', activeMembers: 20, capacity: 24, meetingCadence: 'Weekly', description: 'Nursery through 5th grade care and curriculum. Background check required for all volunteers.', health: 'understaffed', icon: 'figure.and.child.holdinghands', color: ACCENT, roles: [{ role: 'Director', required: 1, filled: 1 }, { role: 'Nursery Lead', required: 2, filled: 2 }, { role: 'Nursery Helper', required: 4, filled: 3 }, { role: 'K-2nd Lead', required: 2, filled: 2 }, { role: '3rd-5th Lead', required: 2, filled: 2 }, { role: 'Check-In', required: 3, filled: 2 }] },
  { id: 'st-4', name: 'Youth Ministry', ministry: 'Next Gen', leader: 'Pastor Alex Kim', activeMembers: 14, capacity: 16, meetingCadence: 'Weekly', description: 'Middle school, high school, and young adult programming. Small group leaders and event support.', health: 'understaffed', icon: 'person.3.fill', color: ACCENT, roles: [{ role: 'Youth Pastor', required: 1, filled: 1 }, { role: 'MS Lead', required: 2, filled: 2 }, { role: 'HS Lead', required: 2, filled: 2 }, { role: 'Young Adult Lead', required: 2, filled: 1 }, { role: 'Small Group Leader', required: 6, filled: 5 }, { role: 'Event Support', required: 3, filled: 3 }] },
  { id: 'st-5', name: 'Worship Team', ministry: 'Worship & Creative Arts', leader: 'Marcus Johnson', activeMembers: 15, capacity: 15, meetingCadence: 'Weekly', description: 'Praise band, vocalists, choir, and dance ministry. Rehearsals every Thursday 7PM.', health: 'fully-staffed', icon: 'music.note.list', color: ACCENT, roles: [{ role: 'Worship Leader', required: 1, filled: 1 }, { role: 'Vocalist', required: 4, filled: 4 }, { role: 'Keys', required: 2, filled: 2 }, { role: 'Guitar', required: 2, filled: 2 }, { role: 'Bass', required: 1, filled: 1 }, { role: 'Drums', required: 1, filled: 1 }, { role: 'Choir', required: 4, filled: 4 }] },
  { id: 'st-6', name: 'AV/Media', ministry: 'Worship & Creative Arts', leader: 'David Park', activeMembers: 4, capacity: 6, meetingCadence: 'Bi-weekly', description: 'Sound engineering, livestream, cameras, projection, and social media. Technical training provided.', health: 'critical', icon: 'video.fill', color: '#EF4444', roles: [{ role: 'FOH', required: 1, filled: 1 }, { role: 'Livestream', required: 1, filled: 1 }, { role: 'Camera Op', required: 2, filled: 1 }, { role: 'Slides', required: 1, filled: 1 }, { role: 'Tracks', required: 1, filled: 0 }] },
  { id: 'st-7', name: 'Hospitality/Ushers', ministry: 'Hospitality', leader: 'Elder Thompson', activeMembers: 8, capacity: 10, meetingCadence: 'Monthly', description: 'Seat guests, collect offerings, distribute bulletins, and maintain sanctuary order during services.', health: 'understaffed', icon: 'heart.fill', color: ACCENT, roles: [{ role: 'Head Usher', required: 1, filled: 1 }, { role: 'Usher', required: 6, filled: 5 }, { role: 'Offering Counter', required: 2, filled: 1 }, { role: 'Bulletin Prep', required: 1, filled: 1 }] },
  { id: 'st-8', name: 'Prayer Team', ministry: 'Prayer Ministry', leader: 'Mother Johnson', activeMembers: 8, capacity: 8, meetingCadence: 'Weekly', description: 'Altar call prayer, intercessory prayer meetings, and prayer chain coordination.', health: 'fully-staffed', icon: 'hands.sparkles.fill', color: '#F59E0B', roles: [{ role: 'Prayer Lead', required: 1, filled: 1 }, { role: 'Altar Ministry', required: 3, filled: 3 }, { role: 'Intercessor', required: 3, filled: 3 }, { role: 'Prayer Chain Coord', required: 1, filled: 1 }] },
  { id: 'st-9', name: 'Outreach', ministry: 'Missions & Outreach', leader: 'Minister Lewis', activeMembers: 8, capacity: 10, meetingCadence: 'Monthly', description: 'Community food pantry, neighborhood outreach, evangelism, and missions trip coordination.', health: 'understaffed', icon: 'globe.americas.fill', color: ACCENT, roles: [{ role: 'Director', required: 1, filled: 1 }, { role: 'Food Pantry', required: 3, filled: 3 }, { role: 'Neighborhood', required: 3, filled: 2 }, { role: 'Missions Coord', required: 1, filled: 1 }, { role: 'Evangelism', required: 2, filled: 1 }] },
  { id: 'st-10', name: 'Campus Care', ministry: 'Facilities', leader: 'Brother Harris', activeMembers: 3, capacity: 6, meetingCadence: 'As needed', description: 'Building setup/teardown, maintenance requests, grounds keeping, and security coordination.', health: 'critical', icon: 'wrench.fill', color: '#EF4444', roles: [{ role: 'Setup Lead', required: 1, filled: 1 }, { role: 'Teardown', required: 2, filled: 1 }, { role: 'Maintenance', required: 1, filled: 0 }, { role: 'Grounds', required: 1, filled: 1 }, { role: 'Security', required: 1, filled: 0 }] },
];

const TEAM_HEALTH_COLOR: Record<TeamHealth, string> = {
  'fully-staffed': '#22C55E',
  understaffed: '#F59E0B',
  critical: '#EF4444',
};

const TEAM_HEALTH_LABEL: Record<TeamHealth, string> = {
  'fully-staffed': 'FULLY STAFFED',
  understaffed: 'UNDERSTAFFED',
  critical: 'CRITICAL',
};

// =============================================================================
// INLINE MOCK DATA — SCHEDULE
// =============================================================================

type ConfirmStatus = 'confirmed' | 'pending' | 'declined';

interface ScheduleAssignment {
  id: string;
  personName: string;
  team: string;
  role: string;
  serviceTime: string;
  campus: string;
  status: ConfirmStatus;
}

interface ScheduleDay {
  date: string;
  dayLabel: string;
  assignments: ScheduleAssignment[];
  coverageGaps: string[];
}

const SCHEDULE_DAYS: ScheduleDay[] = [
  {
    date: 'Feb 22, 2026',
    dayLabel: 'This Sunday',
    assignments: [
      { id: 'sa-1', personName: 'Marcus Johnson', team: 'Worship Team', role: 'Worship Leader', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-2', personName: 'David Park', team: 'AV/Media', role: 'Sound Engineer', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-3', personName: 'Deacon Martinez', team: 'Greeting Team', role: 'Lead Greeter', serviceTime: '9:00 AM - 11:00 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-4', personName: 'Sister Angela Davis', team: 'Children\'s Ministry', role: 'Director', serviceTime: '8:00 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-5', personName: 'Tamika Williams', team: 'Children\'s Ministry', role: 'Nursery Lead', serviceTime: '8:00 AM - 12:30 PM', campus: 'Downtown', status: 'pending' },
      { id: 'sa-6', personName: 'Brother Williams', team: 'Parking Team', role: 'Lot Captain', serviceTime: '7:30 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-7', personName: 'Elder Thompson', team: 'Hospitality/Ushers', role: 'Head Usher', serviceTime: '9:00 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-8', personName: 'Mother Johnson', team: 'Prayer Team', role: 'Prayer Lead', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-9', personName: 'James Carter', team: 'AV/Media', role: 'Camera Operator', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'declined' },
      { id: 'sa-10', personName: 'Lisa Morgan', team: 'Greeting Team', role: 'Greeter', serviceTime: '10:00 AM - 11:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-11', personName: 'Pastor Alex Kim', team: 'Youth Ministry', role: 'Youth Pastor', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-12', personName: 'Nicole Foster', team: 'Hospitality/Ushers', role: 'Usher', serviceTime: '8:00 AM Service', campus: 'Downtown', status: 'pending' },
      { id: 'sa-13', personName: 'Robert Chen', team: 'Campus Care', role: 'Setup Lead', serviceTime: '6:30 AM - 8:00 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-14', personName: 'Mia Torres', team: 'Worship Team', role: 'Vocalist', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-15', personName: 'Kevin Brooks', team: 'Parking Team', role: 'Lot Attendant', serviceTime: '7:30 AM - 12:30 PM', campus: 'Downtown', status: 'pending' },
    ],
    coverageGaps: ['AV/Media: Camera Op (10:30 AM)', 'Parking Team: 2 attendants needed', 'Campus Care: Teardown help'],
  },
  {
    date: 'Mar 1, 2026',
    dayLabel: 'Next Sunday',
    assignments: [
      { id: 'sa-16', personName: 'Marcus Johnson', team: 'Worship Team', role: 'Worship Leader', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-17', personName: 'Sandra Lee', team: 'AV/Media', role: 'Sound Engineer', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'pending' },
      { id: 'sa-18', personName: 'Deacon Martinez', team: 'Greeting Team', role: 'Lead Greeter', serviceTime: '9:00 AM - 11:00 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-19', personName: 'Sister Angela Davis', team: 'Children\'s Ministry', role: 'Director', serviceTime: '8:00 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-20', personName: 'Michael Torres', team: 'Children\'s Ministry', role: 'K-2nd Lead', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-21', personName: 'Brother Williams', team: 'Parking Team', role: 'Lot Captain', serviceTime: '7:30 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-22', personName: 'Elder Thompson', team: 'Hospitality/Ushers', role: 'Head Usher', serviceTime: '9:00 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-23', personName: 'Mother Johnson', team: 'Prayer Team', role: 'Prayer Lead', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-24', personName: 'Jasmine Wright', team: 'Worship Team', role: 'Vocalist', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'pending' },
      { id: 'sa-25', personName: 'Robert Chen', team: 'Campus Care', role: 'Setup Lead', serviceTime: '6:30 AM - 8:00 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-26', personName: 'Pastor Alex Kim', team: 'Youth Ministry', role: 'Youth Pastor', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-27', personName: 'Hannah Davis', team: 'Children\'s Ministry', role: 'Nursery', serviceTime: '8:00 AM - 12:30 PM', campus: 'Downtown', status: 'pending' },
      { id: 'sa-28', personName: 'Andre Jackson', team: 'Hospitality/Ushers', role: 'Usher', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-29', personName: 'Lisa Morgan', team: 'Greeting Team', role: 'Greeter', serviceTime: '10:00 AM - 11:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-30', personName: 'Chris Adams', team: 'Parking Team', role: 'Lot Attendant', serviceTime: '7:30 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
    ],
    coverageGaps: ['Parking Team: 1 attendant needed', 'Children\'s Ministry: 3-5yr room helper'],
  },
  {
    date: 'Mar 8, 2026',
    dayLabel: 'Sun, Mar 8',
    assignments: [
      { id: 'sa-31', personName: 'Marcus Johnson', team: 'Worship Team', role: 'Worship Leader', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-32', personName: 'David Park', team: 'AV/Media', role: 'Sound Engineer', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-33', personName: 'Deacon Martinez', team: 'Greeting Team', role: 'Lead Greeter', serviceTime: '9:00 AM - 11:00 AM', campus: 'Downtown', status: 'pending' },
      { id: 'sa-34', personName: 'Sister Angela Davis', team: 'Children\'s Ministry', role: 'Director', serviceTime: '8:00 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-35', personName: 'Brother Williams', team: 'Parking Team', role: 'Lot Captain', serviceTime: '7:30 AM - 12:30 PM', campus: 'Downtown', status: 'pending' },
      { id: 'sa-36', personName: 'Elder Thompson', team: 'Hospitality/Ushers', role: 'Head Usher', serviceTime: '9:00 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-37', personName: 'Mother Johnson', team: 'Prayer Team', role: 'Prayer Lead', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-38', personName: 'Robert Chen', team: 'Campus Care', role: 'Setup Lead', serviceTime: '6:30 AM - 8:00 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-39', personName: 'Tamika Williams', team: 'Children\'s Ministry', role: 'Nursery Lead', serviceTime: '8:00 AM - 12:30 PM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-40', personName: 'Mia Torres', team: 'Worship Team', role: 'Vocalist', serviceTime: '8:00 AM & 10:30 AM', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-41', personName: 'Nicole Foster', team: 'Hospitality/Ushers', role: 'Usher', serviceTime: '8:00 AM Service', campus: 'Downtown', status: 'pending' },
      { id: 'sa-42', personName: 'Kevin Brooks', team: 'Parking Team', role: 'Lot Attendant', serviceTime: '7:30 AM - 12:30 PM', campus: 'Downtown', status: 'pending' },
      { id: 'sa-43', personName: 'James Carter', team: 'AV/Media', role: 'Camera Operator', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'pending' },
      { id: 'sa-44', personName: 'Pastor Alex Kim', team: 'Youth Ministry', role: 'Youth Pastor', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'confirmed' },
      { id: 'sa-45', personName: 'Andre Jackson', team: 'Hospitality/Ushers', role: 'Usher', serviceTime: '10:30 AM Service', campus: 'Downtown', status: 'confirmed' },
    ],
    coverageGaps: ['Campus Care: Teardown crew (2 needed)', 'Children\'s Ministry: 3-5yr room helper'],
  },
];

const CONFIRM_STATUS_COLOR: Record<ConfirmStatus, string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  declined: '#EF4444',
};

// =============================================================================
// INLINE MOCK DATA — VOLUNTEERS
// =============================================================================

type VolunteerFilter = 'all' | 'active' | 'inactive' | 'new' | 'training';

interface Volunteer {
  id: string;
  name: string;
  teams: string[];
  roles: string[];
  joinedDate: string;
  totalHours: number;
  availability: string;
  lastServed: string;
  reliabilityScore: number;
  status: 'active' | 'inactive' | 'new' | 'training';
  attendanceRate?: number;
}

const VOLUNTEERS: Volunteer[] = [
  { id: 'v-1', name: 'Marcus Johnson', teams: ['Worship Team'], roles: ['Worship Leader'], joinedDate: 'Jan 2019', totalHours: 1420, availability: 'Every Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 98, status: 'active', attendanceRate: 97 },
  { id: 'v-2', name: 'David Park', teams: ['AV/Media'], roles: ['Sound Engineer'], joinedDate: 'Mar 2020', totalHours: 980, availability: 'Every other Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 95, status: 'active', attendanceRate: 94 },
  { id: 'v-3', name: 'Deacon Martinez', teams: ['Greeting Team', 'Hospitality/Ushers'], roles: ['Lead Greeter', 'Usher'], joinedDate: 'Jun 2016', totalHours: 2100, availability: 'Every Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 99, status: 'active', attendanceRate: 98 },
  { id: 'v-4', name: 'Sister Angela Davis', teams: ['Children\'s Ministry'], roles: ['Director'], joinedDate: 'Sep 2017', totalHours: 1860, availability: 'Every Sunday + Wed', lastServed: 'Feb 16, 2026', reliabilityScore: 97, status: 'active', attendanceRate: 96 },
  { id: 'v-5', name: 'Brother Williams', teams: ['Parking Team', 'Campus Care'], roles: ['Lot Captain', 'Facilities'], joinedDate: 'Feb 2018', totalHours: 1540, availability: 'Every Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 96, status: 'active', attendanceRate: 95 },
  { id: 'v-6', name: 'Elder Thompson', teams: ['Hospitality/Ushers', 'Outreach'], roles: ['Head Usher', 'Outreach Coord'], joinedDate: 'Jan 2015', totalHours: 2450, availability: 'Every Sunday + Sat', lastServed: 'Feb 16, 2026', reliabilityScore: 99, status: 'active', attendanceRate: 98 },
  { id: 'v-7', name: 'Mother Johnson', teams: ['Prayer Team'], roles: ['Prayer Lead'], joinedDate: 'Mar 2014', totalHours: 2800, availability: 'Every Sunday + Wed + Fri', lastServed: 'Feb 16, 2026', reliabilityScore: 100, status: 'active', attendanceRate: 99 },
  { id: 'v-8', name: 'Pastor Alex Kim', teams: ['Youth Ministry'], roles: ['Youth Pastor'], joinedDate: 'Aug 2021', totalHours: 920, availability: 'Every Sunday + Wed', lastServed: 'Feb 16, 2026', reliabilityScore: 96, status: 'active', attendanceRate: 95 },
  { id: 'v-9', name: 'Tamika Williams', teams: ['Children\'s Ministry'], roles: ['Nursery Lead'], joinedDate: 'Jan 2022', totalHours: 640, availability: 'Every Sunday', lastServed: 'Feb 9, 2026', reliabilityScore: 88, status: 'active', attendanceRate: 86 },
  { id: 'v-10', name: 'Robert Chen', teams: ['Campus Care'], roles: ['Setup Lead'], joinedDate: 'Apr 2023', totalHours: 380, availability: 'Every Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 92, status: 'active', attendanceRate: 90 },
  { id: 'v-11', name: 'Lisa Morgan', teams: ['Greeting Team'], roles: ['Greeter'], joinedDate: 'Sep 2023', totalHours: 220, availability: 'Every other Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 90, status: 'active', attendanceRate: 88 },
  { id: 'v-12', name: 'Mia Torres', teams: ['Worship Team'], roles: ['Vocalist'], joinedDate: 'Nov 2022', totalHours: 480, availability: 'Every Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 94, status: 'active', attendanceRate: 93 },
  { id: 'v-13', name: 'Kevin Brooks', teams: ['Parking Team'], roles: ['Lot Attendant'], joinedDate: 'Jun 2024', totalHours: 140, availability: 'Every other Sunday', lastServed: 'Feb 9, 2026', reliabilityScore: 82, status: 'active', attendanceRate: 78 },
  { id: 'v-14', name: 'Nicole Foster', teams: ['Hospitality/Ushers'], roles: ['Usher'], joinedDate: 'Aug 2024', totalHours: 96, availability: 'Monthly', lastServed: 'Feb 2, 2026', reliabilityScore: 80, status: 'active', attendanceRate: 76 },
  { id: 'v-15', name: 'James Carter', teams: ['AV/Media'], roles: ['Camera Operator'], joinedDate: 'Oct 2024', totalHours: 64, availability: 'Every other Sunday', lastServed: 'Jan 26, 2026', reliabilityScore: 72, status: 'active', attendanceRate: 68 },
  { id: 'v-16', name: 'Andre Jackson', teams: ['Hospitality/Ushers'], roles: ['Usher'], joinedDate: 'Jan 2025', totalHours: 48, availability: 'Every Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 90, status: 'active', attendanceRate: 88 },
  { id: 'v-17', name: 'Sandra Lee', teams: ['AV/Media'], roles: ['Livestream Operator'], joinedDate: 'Nov 2025', totalHours: 24, availability: 'Every other Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 85, status: 'new' },
  { id: 'v-18', name: 'Michael Torres', teams: ['Children\'s Ministry'], roles: ['K-2nd Lead'], joinedDate: 'Dec 2025', totalHours: 18, availability: 'Every Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 88, status: 'new' },
  { id: 'v-19', name: 'Hannah Davis', teams: ['Children\'s Ministry'], roles: ['Nursery Helper'], joinedDate: 'Jan 2026', totalHours: 8, availability: 'Every other Sunday', lastServed: 'Feb 9, 2026', reliabilityScore: 0, status: 'training' },
  { id: 'v-20', name: 'Chris Adams', teams: ['Parking Team'], roles: ['Lot Attendant'], joinedDate: 'Jan 2026', totalHours: 12, availability: 'Every Sunday', lastServed: 'Feb 16, 2026', reliabilityScore: 0, status: 'training' },
  { id: 'v-21', name: 'Jasmine Wright', teams: ['Worship Team'], roles: ['Vocalist'], joinedDate: 'Feb 2026', totalHours: 4, availability: 'TBD', lastServed: 'Feb 16, 2026', reliabilityScore: 0, status: 'new' },
  { id: 'v-22', name: 'Patricia Evans', teams: ['Outreach'], roles: ['Food Pantry'], joinedDate: 'May 2023', totalHours: 340, availability: 'Saturdays', lastServed: 'Dec 14, 2025', reliabilityScore: 60, status: 'inactive' },
  { id: 'v-23', name: 'Daniel Wright', teams: ['Campus Care'], roles: ['Maintenance'], joinedDate: 'Feb 2024', totalHours: 120, availability: 'As needed', lastServed: 'Nov 10, 2025', reliabilityScore: 55, status: 'inactive' },
  { id: 'v-24', name: 'Maria Gonzalez', teams: ['Prayer Team'], roles: ['Intercessor'], joinedDate: 'Jun 2022', totalHours: 520, availability: 'Wed + Fri', lastServed: 'Jan 19, 2026', reliabilityScore: 78, status: 'active', attendanceRate: 74 },
  { id: 'v-25', name: 'Minister Lewis', teams: ['Outreach'], roles: ['Outreach Director'], joinedDate: 'Apr 2018', totalHours: 1680, availability: 'Every Sunday + Sat', lastServed: 'Feb 16, 2026', reliabilityScore: 96, status: 'active', attendanceRate: 94 },
];

const VOLUNTEER_STATUS_COLOR: Record<string, string> = {
  active: '#22C55E',
  inactive: '#A1A1AA',
  new: ACCENT,
  training: ACCENT,
};

// =============================================================================
// INLINE MOCK DATA — TRAINING & READINESS
// =============================================================================

type ReadinessLevel = 'ready' | 'needs-training' | 'in-training' | 'expired';

interface TrainingProgram {
  id: string;
  name: string;
  requiredFor: string[];
  completionRate: number;
  totalEnrolled: number;
  totalCompleted: number;
  nextSessionDate: string;
  duration: string;
  description: string;
  expiresAfter: string;
}

const TRAINING_PROGRAMS: TrainingProgram[] = [
  { id: 'tp-1', name: 'Child Safety & Protection', requiredFor: ['Children\'s Ministry', 'Youth Ministry'], completionRate: 92, totalEnrolled: 40, totalCompleted: 37, nextSessionDate: 'Mar 15, 2026', duration: '3 hours', description: 'Background checks, mandated reporter training, safe environment protocols, and emergency procedures.', expiresAfter: '2 years' },
  { id: 'tp-2', name: 'First Aid & CPR', requiredFor: ['Children\'s Ministry', 'Youth Ministry', 'Campus Care'], completionRate: 78, totalEnrolled: 46, totalCompleted: 36, nextSessionDate: 'Apr 5, 2026', duration: '4 hours', description: 'American Red Cross First Aid/CPR/AED certification for ministry leaders and volunteers.', expiresAfter: '2 years' },
  { id: 'tp-3', name: 'General Safety Orientation', requiredFor: ['All Teams'], completionRate: 88, totalEnrolled: 320, totalCompleted: 282, nextSessionDate: 'Mar 1, 2026', duration: '1 hour', description: 'Emergency exits, fire extinguisher locations, evacuation plan, and reporting procedures.', expiresAfter: '1 year' },
  { id: 'tp-4', name: 'AV/Media Technical Training', requiredFor: ['AV/Media'], completionRate: 67, totalEnrolled: 6, totalCompleted: 4, nextSessionDate: 'Feb 28, 2026', duration: '6 hours', description: 'Sound board operation, camera angles, livestream software, projection system, and troubleshooting.', expiresAfter: 'None' },
  { id: 'tp-5', name: 'Hospitality & Welcome Training', requiredFor: ['Greeting Team', 'Hospitality/Ushers'], completionRate: 95, totalEnrolled: 22, totalCompleted: 21, nextSessionDate: 'Apr 12, 2026', duration: '2 hours', description: 'Guest engagement, accessibility awareness, emergency protocols, and de-escalation basics.', expiresAfter: '1 year' },
  { id: 'tp-6', name: 'Worship Ministry Onboarding', requiredFor: ['Worship Team'], completionRate: 100, totalEnrolled: 15, totalCompleted: 15, nextSessionDate: 'N/A', duration: '2 hours', description: 'Song preparation workflow, rehearsal expectations, stage etiquette, and spiritual preparation.', expiresAfter: 'None' },
];

interface VolunteerTrainingRecord {
  volunteerId: string;
  volunteerName: string;
  programId: string;
  programName: string;
  completedDate: string | null;
  evidenceLink?: string;
  expiryDate?: string;
  status: ReadinessLevel;
}

const VOLUNTEER_TRAINING_RECORDS: VolunteerTrainingRecord[] = [
  { volunteerId: 'v-4', volunteerName: 'Sister Angela Davis', programId: 'tp-1', programName: 'Child Safety & Protection', completedDate: 'Jun 12, 2025', evidenceLink: 'cert-cs-001.pdf', expiryDate: 'Jun 12, 2027', status: 'ready' },
  { volunteerId: 'v-4', volunteerName: 'Sister Angela Davis', programId: 'tp-2', programName: 'First Aid & CPR', completedDate: 'Aug 20, 2025', evidenceLink: 'cert-fa-001.pdf', expiryDate: 'Aug 20, 2027', status: 'ready' },
  { volunteerId: 'v-9', volunteerName: 'Tamika Williams', programId: 'tp-1', programName: 'Child Safety & Protection', completedDate: 'Jan 15, 2025', evidenceLink: 'cert-cs-002.pdf', expiryDate: 'Jan 15, 2027', status: 'ready' },
  { volunteerId: 'v-9', volunteerName: 'Tamika Williams', programId: 'tp-2', programName: 'First Aid & CPR', completedDate: null, status: 'needs-training' },
  { volunteerId: 'v-19', volunteerName: 'Hannah Davis', programId: 'tp-1', programName: 'Child Safety & Protection', completedDate: null, status: 'in-training' },
  { volunteerId: 'v-19', volunteerName: 'Hannah Davis', programId: 'tp-2', programName: 'First Aid & CPR', completedDate: null, status: 'needs-training' },
  { volunteerId: 'v-2', volunteerName: 'David Park', programId: 'tp-4', programName: 'AV/Media Technical Training', completedDate: 'Sep 5, 2024', evidenceLink: 'cert-av-001.pdf', status: 'ready' },
  { volunteerId: 'v-15', volunteerName: 'James Carter', programId: 'tp-4', programName: 'AV/Media Technical Training', completedDate: null, status: 'in-training' },
  { volunteerId: 'v-3', volunteerName: 'Deacon Martinez', programId: 'tp-5', programName: 'Hospitality & Welcome', completedDate: 'Mar 10, 2025', evidenceLink: 'cert-hw-001.pdf', expiryDate: 'Mar 10, 2026', status: 'ready' },
  { volunteerId: 'v-3', volunteerName: 'Deacon Martinez', programId: 'tp-3', programName: 'General Safety', completedDate: 'Feb 1, 2025', expiryDate: 'Feb 1, 2026', status: 'expired' },
];

interface ReadinessCount {
  level: ReadinessLevel;
  count: number;
  label: string;
}

const READINESS_COUNTS: ReadinessCount[] = [
  { level: 'ready', count: 262, label: 'Ready to Serve' },
  { level: 'needs-training', count: 28, label: 'Needs Training' },
  { level: 'in-training', count: 18, label: 'In Training' },
  { level: 'expired', count: 12, label: 'Certification Expired' },
];

const READINESS_COLOR: Record<ReadinessLevel, string> = {
  ready: '#22C55E',
  'needs-training': '#F59E0B',
  'in-training': ACCENT,
  expired: '#EF4444',
};

// =============================================================================
// INLINE MOCK DATA — REQUESTS & SWAPS
// =============================================================================

type RequestType = 'swap' | 'cover' | 'time-off';
type RequestStatus = 'pending' | 'approved' | 'denied';

interface ServeRequest {
  id: string;
  requesterName: string;
  type: RequestType;
  date: string;
  currentAssignment: string;
  requestedChange: string;
  status: RequestStatus;
  submittedDate: string;
  note?: string;
}

const SERVE_REQUESTS: ServeRequest[] = [
  { id: 'sr-1', requesterName: 'James Carter', type: 'swap', date: 'Feb 22, 2026', currentAssignment: 'Camera Operator (10:30 AM)', requestedChange: 'Swap with Sandra Lee for Mar 1', status: 'pending', submittedDate: 'Feb 16, 2026', note: 'Family event that Sunday' },
  { id: 'sr-2', requesterName: 'Kevin Brooks', type: 'time-off', date: 'Mar 8, 2026', currentAssignment: 'Parking Team (7:30 AM)', requestedChange: 'Time off - traveling out of state', status: 'pending', submittedDate: 'Feb 15, 2026' },
  { id: 'sr-3', requesterName: 'Tamika Williams', type: 'cover', date: 'Mar 1, 2026', currentAssignment: 'Nursery Lead (8:00 AM)', requestedChange: 'Need coverage - sick child', status: 'approved', submittedDate: 'Feb 14, 2026', note: 'Hannah Davis agreed to cover' },
  { id: 'sr-4', requesterName: 'Nicole Foster', type: 'swap', date: 'Mar 8, 2026', currentAssignment: 'Usher (8:00 AM)', requestedChange: 'Swap to 10:30 AM service', status: 'approved', submittedDate: 'Feb 13, 2026' },
  { id: 'sr-5', requesterName: 'Patricia Evans', type: 'time-off', date: 'Feb 22 - Mar 15, 2026', currentAssignment: 'Food Pantry (Saturdays)', requestedChange: 'Extended leave - medical recovery', status: 'approved', submittedDate: 'Feb 10, 2026' },
  { id: 'sr-6', requesterName: 'Lisa Morgan', type: 'cover', date: 'Mar 8, 2026', currentAssignment: 'Greeter (10:00 AM)', requestedChange: 'Need coverage - work conflict', status: 'pending', submittedDate: 'Feb 17, 2026' },
  { id: 'sr-7', requesterName: 'Daniel Wright', type: 'time-off', date: 'Indefinite', currentAssignment: 'Campus Care / Maintenance', requestedChange: 'Stepping down from serve team', status: 'denied', submittedDate: 'Feb 5, 2026', note: 'Pastor reached out for follow-up conversation' },
  { id: 'sr-8', requesterName: 'Chris Adams', type: 'swap', date: 'Mar 1, 2026', currentAssignment: 'Parking Team (7:30 AM)', requestedChange: 'Swap with Kevin Brooks for Feb 22', status: 'pending', submittedDate: 'Feb 17, 2026' },
];

const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  swap: 'Swap',
  cover: 'Cover Request',
  'time-off': 'Time Off',
};

const REQUEST_TYPE_COLOR: Record<RequestType, string> = {
  swap: ACCENT,
  cover: '#F59E0B',
  'time-off': ACCENT,
};

const REQUEST_STATUS_COLOR: Record<RequestStatus, string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  denied: '#EF4444',
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count }: { title: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={shrd.headerRow}>
      <ThemedText style={[shrd.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[shrd.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[shrd.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
    </View>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[shrd.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[shrd.statusBadge, { backgroundColor: color + '20' }]}>
      <View style={[shrd.statusDot, { backgroundColor: color }]} />
      <ThemedText style={[shrd.statusText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function KPIStat({ value, label, colors, valueColor }: { value: string; label: string; colors: typeof Colors.light; valueColor?: string }) {
  return (
    <View style={shrd.kpiStat}>
      <ThemedText style={[shrd.kpiValue, { color: valueColor ?? colors.text }]}>{value}</ThemedText>
      <ThemedText style={[shrd.kpiLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

const shrd = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  kpiStat: { alignItems: 'center', minWidth: 60 },
  kpiValue: { fontSize: 20, fontWeight: '700' },
  kpiLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' },
});

// =============================================================================
// VIEW 1: OVERVIEW
// =============================================================================

function OverviewView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const isAdmin = isElderLevel(role);
  const isStaff = isStaffLevel(role);

  // Calculate coverage totals
  const totalFilled = NEXT_SUNDAY_COVERAGE.reduce((sum, c) => sum + c.filled, 0);
  const totalSlots = NEXT_SUNDAY_COVERAGE.reduce((sum, c) => sum + c.total, 0);
  const coveragePct = Math.round((totalFilled / totalSlots) * 100);

  // Find ministry with most need
  const sortedByNeed = [...NEXT_SUNDAY_COVERAGE].sort(
    (a, b) => (a.filled / a.total) - (b.filled / b.total),
  );
  const mostNeeded = sortedByNeed[0];

  return (
    <>
      {/* KPI row — visible to C1-C3 */}
      {isStaff && (
        <View style={s.moduleContainer}>
          <SectionHeader title="SERVE KPIs" colors={colors} />
          <Card colors={colors}>
            <View style={s.kpiGrid}>
              {SERVE_KPIS.slice(0, 3).map((kpi) => (
                <KPIStat key={kpi.label} value={kpi.value} label={kpi.label} colors={colors} valueColor={kpi.color} />
              ))}
            </View>
            <View style={s.kpiGrid}>
              {SERVE_KPIS.slice(3).map((kpi) => (
                <KPIStat key={kpi.label} value={kpi.value} label={kpi.label} colors={colors} valueColor={kpi.color} />
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* Next Sunday Coverage */}
      <View style={s.moduleContainer}>
        <SectionHeader title="NEXT SUNDAY COVERAGE" colors={colors} />
        <Card colors={colors}>
          {/* Summary row */}
          <View style={s.coverageSummaryRow}>
            <View style={s.coveragePieContainer}>
              <View style={[s.coveragePieOuter, { borderColor: coveragePct >= 90 ? '#22C55E' : coveragePct >= 70 ? '#F59E0B' : '#EF4444' }]}>
                <ThemedText style={[s.coveragePiePct, { color: colors.text }]}>{coveragePct}%</ThemedText>
                <ThemedText style={[s.coveragePieLabel, { color: colors.textSecondary }]}>filled</ThemedText>
              </View>
            </View>
            <View style={s.coverageSummaryStats}>
              <View style={s.coverageStat}>
                <ThemedText style={[s.coverageStatValue, { color: '#22C55E' }]}>{totalFilled}</ThemedText>
                <ThemedText style={[s.coverageStatLabel, { color: colors.textSecondary }]}>Filled</ThemedText>
              </View>
              <View style={s.coverageStat}>
                <ThemedText style={[s.coverageStatValue, { color: '#EF4444' }]}>{totalSlots - totalFilled}</ThemedText>
                <ThemedText style={[s.coverageStatLabel, { color: colors.textSecondary }]}>Open</ThemedText>
              </View>
              <View style={s.coverageStat}>
                <ThemedText style={[s.coverageStatValue, { color: colors.text }]}>{totalSlots}</ThemedText>
                <ThemedText style={[s.coverageStatLabel, { color: colors.textSecondary }]}>Total</ThemedText>
              </View>
            </View>
          </View>

          {/* Per-ministry breakdown (staff+) */}
          {isStaff && (
            <View style={s.coverageBreakdown}>
              {NEXT_SUNDAY_COVERAGE.map((slot) => {
                const pct = Math.round((slot.filled / slot.total) * 100);
                const barColor = pct >= 100 ? '#22C55E' : pct >= 75 ? '#F59E0B' : '#EF4444';
                return (
                  <View key={slot.ministry} style={s.coverageRow}>
                    <ThemedText style={[s.coverageMinistry, { color: colors.text }]} numberOfLines={1}>
                      {slot.ministry}
                    </ThemedText>
                    <View style={s.coverageBarContainer}>
                      <View style={[s.coverageBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                        <View style={[s.coverageBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                      </View>
                    </View>
                    <ThemedText style={[s.coverageCount, { color: colors.textSecondary }]}>
                      {slot.filled}/{slot.total}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      </View>

      {/* Ministry with most need */}
      {mostNeeded && (
        <View style={s.moduleContainer}>
          <SectionHeader title="MOST NEEDED" colors={colors} />
          <Card colors={colors}>
            <View style={s.mostNeededRow}>
              <View style={[s.mostNeededIcon, { backgroundColor: '#EF444420' }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#EF4444" />
              </View>
              <View style={s.mostNeededInfo}>
                <ThemedText style={[s.mostNeededTeam, { color: colors.text }]}>{mostNeeded.ministry}</ThemedText>
                <ThemedText style={[s.mostNeededDetail, { color: colors.textSecondary }]}>
                  {mostNeeded.total - mostNeeded.filled} positions still open for this Sunday
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Volunteer Pipeline (staff+) */}
      {isStaff && (
        <View style={s.moduleContainer}>
          <SectionHeader title="VOLUNTEER PIPELINE" colors={colors} />
          <Card colors={colors}>
            <View style={s.pipelineRow}>
              {VOLUNTEER_PIPELINE.map((stage, idx) => (
                <React.Fragment key={stage.label}>
                  <View style={s.pipelineStage}>
                    <View style={[s.pipelineBubble, { backgroundColor: stage.color + '20', borderColor: stage.color + '40' }]}>
                      <ThemedText style={[s.pipelineBubbleValue, { color: stage.color }]}>{stage.count}</ThemedText>
                    </View>
                    <ThemedText style={[s.pipelineStageLabel, { color: colors.textSecondary }]}>{stage.label}</ThemedText>
                  </View>
                  {idx < VOLUNTEER_PIPELINE.length - 1 && (
                    <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* Sign Up CTA */}
      {isMember(role) && (
        <View style={s.moduleContainer}>
          <Pressable
            style={[s.ctaButton, { backgroundColor: colors.text }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="hand.raised.fill" size={16} color={colors.background} />
            <ThemedText style={[s.ctaButtonText, { color: colors.background }]}>Sign Up to Serve</ThemedText>
          </Pressable>
        </View>
      )}
    </>
  );
}

// =============================================================================
// VIEW 2: TEAMS
// =============================================================================

function TeamsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="SERVE TEAMS" colors={colors} count={SERVE_TEAMS.length} />
        {SERVE_TEAMS.map((team) => {
          const healthColor = TEAM_HEALTH_COLOR[team.health];
          const healthLabel = TEAM_HEALTH_LABEL[team.health];
          const fillPct = Math.round((team.activeMembers / team.capacity) * 100);

          return (
            <Pressable
              key={team.id}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Card colors={colors}>
                <View style={s.teamHeader}>
                  <View style={[s.teamIconWrap, { backgroundColor: team.color + '20' }]}>
                    <IconSymbol name={team.icon as any} size={18} color={team.color} />
                  </View>
                  <View style={s.teamInfo}>
                    <ThemedText style={[s.teamName, { color: colors.text }]}>{team.name}</ThemedText>
                    <ThemedText style={[s.teamMinistry, { color: colors.textSecondary }]}>
                      {team.ministry} {'\u00B7'} Led by {team.leader}
                    </ThemedText>
                  </View>
                  <StatusBadge label={healthLabel} color={healthColor} />
                </View>

                <ThemedText style={[s.teamDesc, { color: colors.textTertiary }]} numberOfLines={2}>
                  {team.description}
                </ThemedText>

                {/* Capacity bar */}
                <View style={s.teamCapacityRow}>
                  <View style={s.teamCapacityBarContainer}>
                    <View style={[s.teamCapacityBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={[s.teamCapacityBarFill, { width: `${fillPct}%`, backgroundColor: healthColor }]} />
                    </View>
                  </View>
                  <ThemedText style={[s.teamCapacityText, { color: colors.textSecondary }]}>
                    {team.activeMembers}/{team.capacity}
                  </ThemedText>
                </View>

                {/* Role breakdown (staff+) */}
                {isStaffLevel(role) && team.roles && team.roles.length > 0 && (
                  <View style={s.roleBreakdown}>
                    {team.roles.map((r) => {
                      const isFull = r.filled >= r.required;
                      const roleColor = isFull ? '#22C55E' : r.filled === 0 ? '#EF4444' : '#F59E0B';
                      return (
                        <View key={r.role} style={s.roleRow}>
                          <View style={[s.roleDot, { backgroundColor: roleColor }]} />
                          <ThemedText style={[s.roleName, { color: colors.text }]} numberOfLines={1}>{r.role}</ThemedText>
                          <ThemedText style={[s.roleCount, { color: roleColor }]}>{r.filled}/{r.required}</ThemedText>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Meta row */}
                <View style={s.teamMetaRow}>
                  <View style={s.teamMetaItem}>
                    <IconSymbol name="arrow.triangle.2.circlepath" size={10} color={colors.textTertiary} />
                    <ThemedText style={[s.teamMetaText, { color: colors.textTertiary }]}>{team.meetingCadence}</ThemedText>
                  </View>
                  {isStaffLevel(role) && (
                    <View style={s.teamMetaItem}>
                      <IconSymbol name="person.2.fill" size={10} color={colors.textTertiary} />
                      <ThemedText style={[s.teamMetaText, { color: colors.textTertiary }]}>{team.activeMembers} active</ThemedText>
                    </View>
                  )}
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

// =============================================================================
// VIEW 3: SCHEDULE
// =============================================================================

type ScheduleScope = 'day' | 'week' | 'month';

function ScheduleView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [expandedDay, setExpandedDay] = useState<string | null>(SCHEDULE_DAYS[0]?.date ?? null);
  const [scope, setScope] = useState<ScheduleScope>('day');

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="SERVE SCHEDULE" colors={colors} count={SCHEDULE_DAYS.length} />

        {/* Scope toggle */}
        <View style={s.scopeToggleRow}>
          {(['day', 'week', 'month'] as ScheduleScope[]).map((sc) => (
            <Pressable
              key={sc}
              style={[s.scopeToggle, { backgroundColor: scope === sc ? colors.text : 'transparent', borderColor: scope === sc ? colors.text : colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setScope(sc); }}
            >
              <ThemedText style={[s.scopeToggleText, { color: scope === sc ? colors.background : colors.textSecondary }]}>
                {sc.charAt(0).toUpperCase() + sc.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {SCHEDULE_DAYS.map((day) => {
          const isExpanded = expandedDay === day.date;
          const confirmedCount = day.assignments.filter((a) => a.status === 'confirmed').length;
          const pendingCount = day.assignments.filter((a) => a.status === 'pending').length;
          const declinedCount = day.assignments.filter((a) => a.status === 'declined').length;

          return (
            <Card key={day.date} colors={colors}>
              <Pressable
                style={s.scheduleDayHeader}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedDay(isExpanded ? null : day.date);
                }}
              >
                <View style={s.scheduleDayDateBlock}>
                  <ThemedText style={[s.scheduleDayLabel, { color: colors.text }]}>{day.dayLabel}</ThemedText>
                  <ThemedText style={[s.scheduleDayDate, { color: colors.textSecondary }]}>{day.date}</ThemedText>
                </View>
                <View style={s.scheduleDaySummary}>
                  <View style={[s.scheduleStatusChip, { backgroundColor: '#22C55E20' }]}>
                    <ThemedText style={[s.scheduleStatusChipText, { color: '#22C55E' }]}>{confirmedCount}</ThemedText>
                  </View>
                  {pendingCount > 0 && (
                    <View style={[s.scheduleStatusChip, { backgroundColor: '#F59E0B20' }]}>
                      <ThemedText style={[s.scheduleStatusChipText, { color: '#F59E0B' }]}>{pendingCount}</ThemedText>
                    </View>
                  )}
                  {declinedCount > 0 && (
                    <View style={[s.scheduleStatusChip, { backgroundColor: '#EF444420' }]}>
                      <ThemedText style={[s.scheduleStatusChipText, { color: '#EF4444' }]}>{declinedCount}</ThemedText>
                    </View>
                  )}
                  <IconSymbol
                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                    size={12}
                    color={colors.textTertiary}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <>
                  {/* Coverage gaps */}
                  {day.coverageGaps.length > 0 && isStaffLevel(role) && (
                    <View style={[s.coverageGapsContainer, { backgroundColor: '#EF444410', borderColor: '#EF444430' }]}>
                      <View style={s.coverageGapsHeader}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
                        <ThemedText style={[s.coverageGapsTitle, { color: '#EF4444' }]}>COVERAGE GAPS</ThemedText>
                      </View>
                      {day.coverageGaps.map((gap, idx) => (
                        <ThemedText key={idx} style={[s.coverageGapItem, { color: '#EF4444' }]}>
                          {'\u2022'} {gap}
                        </ThemedText>
                      ))}
                    </View>
                  )}

                  {/* Assignments */}
                  {day.assignments.map((asgn, idx) => {
                    const statusColor = CONFIRM_STATUS_COLOR[asgn.status];
                    return (
                      <View
                        key={asgn.id}
                        style={[
                          s.assignmentRow,
                          idx < day.assignments.length - 1 && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: colors.border,
                          },
                        ]}
                      >
                        <View style={[s.assignmentStatusDot, { backgroundColor: statusColor }]} />
                        <View style={s.assignmentInfo}>
                          <ThemedText style={[s.assignmentName, { color: colors.text }]} numberOfLines={1}>
                            {asgn.personName}
                          </ThemedText>
                          <ThemedText style={[s.assignmentRole, { color: colors.textSecondary }]}>
                            {asgn.team} {'\u00B7'} {asgn.role}
                          </ThemedText>
                          <ThemedText style={[s.assignmentTime, { color: colors.textTertiary }]}>
                            {asgn.serviceTime} {'\u00B7'} {asgn.campus}
                          </ThemedText>
                        </View>
                        <StatusBadge label={asgn.status} color={statusColor} />
                      </View>
                    );
                  })}
                </>
              )}
            </Card>
          );
        })}
      </View>
    </>
  );
}

// =============================================================================
// VIEW 4: VOLUNTEERS
// =============================================================================

function VolunteersView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [filter, setFilter] = useState<VolunteerFilter>('all');
  const isAdmin = isElderLevel(role);

  const filtered = filter === 'all'
    ? VOLUNTEERS
    : VOLUNTEERS.filter((v) => v.status === filter);

  const filterCounts: Record<VolunteerFilter, number> = {
    all: VOLUNTEERS.length,
    active: VOLUNTEERS.filter((v) => v.status === 'active').length,
    inactive: VOLUNTEERS.filter((v) => v.status === 'inactive').length,
    new: VOLUNTEERS.filter((v) => v.status === 'new').length,
    training: VOLUNTEERS.filter((v) => v.status === 'training').length,
  };

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="VOLUNTEER DIRECTORY" colors={colors} count={filtered.length} />

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {(['all', 'active', 'inactive', 'new', 'training'] as VolunteerFilter[]).map((f) => (
            <Pressable
              key={f}
              style={[s.filterPill, { backgroundColor: filter === f ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
            >
              <ThemedText style={[s.filterPillText, { color: filter === f ? colors.text : colors.textSecondary }]}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({filterCounts[f]})
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Volunteer list */}
        <Card colors={colors}>
          {filtered.map((vol, idx) => {
            const statusColor = VOLUNTEER_STATUS_COLOR[vol.status];
            const reliabilityColor = vol.reliabilityScore >= 90 ? '#22C55E' : vol.reliabilityScore >= 70 ? '#F59E0B' : vol.reliabilityScore > 0 ? '#EF4444' : '#A1A1AA';

            return (
              <Pressable
                key={vol.id}
                style={[
                  s.volunteerRow,
                  idx < filtered.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                {/* Avatar */}
                <View style={[s.volunteerAvatar, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[s.volunteerInitials, { color: statusColor }]}>
                    {vol.name.split(' ').map((n) => n[0]).join('')}
                  </ThemedText>
                </View>

                <View style={s.volunteerInfo}>
                  <View style={s.volunteerNameRow}>
                    <ThemedText style={[s.volunteerName, { color: colors.text }]} numberOfLines={1}>
                      {vol.name}
                    </ThemedText>
                    <StatusBadge label={vol.status} color={statusColor} />
                  </View>

                  <ThemedText style={[s.volunteerTeams, { color: colors.textSecondary }]} numberOfLines={1}>
                    {vol.teams.join(', ')} {'\u00B7'} {vol.roles.join(', ')}
                  </ThemedText>

                  <View style={s.volunteerMeta}>
                    <ThemedText style={[s.volunteerMetaText, { color: colors.textTertiary }]}>
                      Since {vol.joinedDate}
                    </ThemedText>
                    <ThemedText style={[s.volunteerMetaText, { color: colors.textTertiary }]}>
                      {'\u00B7'} {vol.totalHours} hrs
                    </ThemedText>
                    <ThemedText style={[s.volunteerMetaText, { color: colors.textTertiary }]}>
                      {'\u00B7'} Last: {vol.lastServed}
                    </ThemedText>
                  </View>

                  {/* Reliability + engagement analytics (C1/C2 only) */}
                  {isAdmin && vol.reliabilityScore > 0 && (
                    <View style={s.volunteerAnalytics}>
                      <View style={s.volunteerAnalyticItem}>
                        <ThemedText style={[s.volunteerAnalyticLabel, { color: colors.textTertiary }]}>Reliability</ThemedText>
                        <ThemedText style={[s.volunteerAnalyticValue, { color: reliabilityColor }]}>{vol.reliabilityScore}%</ThemedText>
                      </View>
                      {vol.attendanceRate != null && (
                        <View style={s.volunteerAnalyticItem}>
                          <ThemedText style={[s.volunteerAnalyticLabel, { color: colors.textTertiary }]}>Attendance</ThemedText>
                          <ThemedText style={[s.volunteerAnalyticValue, { color: vol.attendanceRate >= 90 ? '#22C55E' : vol.attendanceRate >= 70 ? '#F59E0B' : '#EF4444' }]}>
                            {vol.attendanceRate}%
                          </ThemedText>
                        </View>
                      )}
                      <View style={s.volunteerAnalyticItem}>
                        <ThemedText style={[s.volunteerAnalyticLabel, { color: colors.textTertiary }]}>Availability</ThemedText>
                        <ThemedText style={[s.volunteerAnalyticValue, { color: colors.textSecondary }]}>{vol.availability}</ThemedText>
                      </View>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </Card>
      </View>
    </>
  );
}

// =============================================================================
// VIEW 5: TRAINING & READINESS
// =============================================================================

function TrainingView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  return (
    <>
      {/* Readiness summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="VOLUNTEER READINESS" colors={colors} />
        <Card colors={colors}>
          <View style={s.kpiGrid}>
            {READINESS_COUNTS.map((rc) => (
              <KPIStat
                key={rc.level}
                value={String(rc.count)}
                label={rc.label}
                colors={colors}
                valueColor={READINESS_COLOR[rc.level]}
              />
            ))}
          </View>
        </Card>
      </View>

      {/* Training programs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="TRAINING PROGRAMS" colors={colors} count={TRAINING_PROGRAMS.length} />

        {TRAINING_PROGRAMS.map((prog) => {
          const completionColor = prog.completionRate >= 90 ? '#22C55E' : prog.completionRate >= 70 ? '#F59E0B' : '#EF4444';

          return (
            <Card key={prog.id} colors={colors}>
              <View style={s.trainingHeader}>
                <View style={s.trainingTitleRow}>
                  <ThemedText style={[s.trainingName, { color: colors.text }]}>{prog.name}</ThemedText>
                </View>
                <View style={[shrd.statusBadge, { backgroundColor: completionColor + '20' }]}>
                  <ThemedText style={[shrd.statusText, { color: completionColor }]}>
                    {prog.completionRate}%
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={[s.trainingDesc, { color: colors.textTertiary }]} numberOfLines={2}>
                {prog.description}
              </ThemedText>

              {/* Completion bar */}
              <View style={s.trainingProgressContainer}>
                <View style={[s.trainingProgressBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.trainingProgressFill, { width: `${prog.completionRate}%`, backgroundColor: completionColor }]} />
                </View>
                <ThemedText style={[s.trainingProgressLabel, { color: colors.textSecondary }]}>
                  {prog.totalCompleted}/{prog.totalEnrolled} completed
                </ThemedText>
              </View>

              {/* Required for tags */}
              <View style={s.trainingTagsRow}>
                {prog.requiredFor.map((team, idx) => (
                  <View key={idx} style={[s.trainingTag, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.trainingTagText, { color: colors.textSecondary }]}>{team}</ThemedText>
                  </View>
                ))}
              </View>

              {/* Meta info */}
              <View style={s.trainingMetaRow}>
                <View style={s.trainingMetaItem}>
                  <IconSymbol name="calendar" size={10} color={colors.textTertiary} />
                  <ThemedText style={[s.trainingMetaText, { color: colors.textTertiary }]}>
                    Next: {prog.nextSessionDate}
                  </ThemedText>
                </View>
                <View style={s.trainingMetaItem}>
                  <IconSymbol name="clock.fill" size={10} color={colors.textTertiary} />
                  <ThemedText style={[s.trainingMetaText, { color: colors.textTertiary }]}>{prog.duration}</ThemedText>
                </View>
                <View style={s.trainingMetaItem}>
                  <IconSymbol name="arrow.triangle.2.circlepath" size={10} color={colors.textTertiary} />
                  <ThemedText style={[s.trainingMetaText, { color: colors.textTertiary }]}>Expires: {prog.expiresAfter}</ThemedText>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Per-volunteer training records (admin only) */}
      {isElderLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="VOLUNTEER TRAINING RECORDS" colors={colors} count={VOLUNTEER_TRAINING_RECORDS.length} />
          <Card colors={colors}>
            {VOLUNTEER_TRAINING_RECORDS.map((rec, idx) => {
              const statusColor = READINESS_COLOR[rec.status];
              const statusLabel = rec.status === 'ready' ? 'COMPLETE' : rec.status === 'needs-training' ? 'NEEDED' : rec.status === 'in-training' ? 'IN PROGRESS' : 'EXPIRED';
              return (
                <View
                  key={`${rec.volunteerId}-${rec.programId}`}
                  style={[s.trainingRecordRow, idx < VOLUNTEER_TRAINING_RECORDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                >
                  <View style={s.trainingRecordInfo}>
                    <ThemedText style={[s.trainingRecordName, { color: colors.text }]}>{rec.volunteerName}</ThemedText>
                    <ThemedText style={[s.trainingRecordProgram, { color: colors.textSecondary }]}>{rec.programName}</ThemedText>
                    <View style={s.trainingRecordMeta}>
                      {rec.completedDate && (
                        <ThemedText style={[s.trainingRecordDate, { color: colors.textTertiary }]}>
                          Completed: {rec.completedDate}
                        </ThemedText>
                      )}
                      {rec.expiryDate && (
                        <ThemedText style={[s.trainingRecordDate, { color: rec.status === 'expired' ? '#EF4444' : colors.textTertiary }]}>
                          {rec.status === 'expired' ? 'Expired' : 'Expires'}: {rec.expiryDate}
                        </ThemedText>
                      )}
                      {rec.evidenceLink && (
                        <View style={s.trainingRecordEvidence}>
                          <IconSymbol name="doc.fill" size={9} color={colors.textTertiary} />
                          <ThemedText style={[s.trainingRecordDate, { color: colors.textTertiary }]}>{rec.evidenceLink}</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                  <StatusBadge label={statusLabel} color={statusColor} />
                </View>
              );
            })}
          </Card>
        </View>
      )}
    </>
  );
}

// =============================================================================
// VIEW 6: REQUESTS & SWAPS
// =============================================================================

function RequestsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  const canApprove = isStaffLevel(role);

  const filtered = filter === 'all'
    ? SERVE_REQUESTS
    : SERVE_REQUESTS.filter((r) => r.status === filter);

  return (
    <>
      <View style={s.moduleContainer}>
        <SectionHeader title="REQUESTS & SWAPS" colors={colors} count={filtered.length} />

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {(['all', 'pending', 'approved', 'denied'] as const).map((f) => {
            const cnt = f === 'all' ? SERVE_REQUESTS.length : SERVE_REQUESTS.filter((r) => r.status === f).length;
            return (
              <Pressable
                key={f}
                style={[s.filterPill, { backgroundColor: filter === f ? colors.text + '15' : 'transparent', borderColor: colors.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
              >
                <ThemedText style={[s.filterPillText, { color: filter === f ? colors.text : colors.textSecondary }]}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({cnt})
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Request list */}
        <Card colors={colors}>
          {filtered.map((req, idx) => {
            const typeColor = REQUEST_TYPE_COLOR[req.type];
            const statusColor = REQUEST_STATUS_COLOR[req.status];

            return (
              <View
                key={req.id}
                style={[
                  s.requestRow,
                  idx < filtered.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                {/* Type badge */}
                <View style={[s.requestTypeIcon, { backgroundColor: typeColor + '20' }]}>
                  <IconSymbol
                    name={
                      req.type === 'swap' ? 'arrow.triangle.swap' as any :
                      req.type === 'cover' ? 'person.fill.questionmark' as any :
                      'calendar.badge.minus' as any
                    }
                    size={14}
                    color={typeColor}
                  />
                </View>

                <View style={s.requestInfo}>
                  <View style={s.requestNameRow}>
                    <ThemedText style={[s.requestName, { color: colors.text }]} numberOfLines={1}>
                      {req.requesterName}
                    </ThemedText>
                    <StatusBadge label={req.status} color={statusColor} />
                  </View>

                  <View style={s.requestTypeDateRow}>
                    <View style={[s.requestTypeBadge, { backgroundColor: typeColor + '20' }]}>
                      <ThemedText style={[s.requestTypeText, { color: typeColor }]}>
                        {REQUEST_TYPE_LABEL[req.type]}
                      </ThemedText>
                    </View>
                    <ThemedText style={[s.requestDate, { color: colors.textTertiary }]}>{req.date}</ThemedText>
                  </View>

                  <ThemedText style={[s.requestAssignment, { color: colors.textSecondary }]} numberOfLines={1}>
                    Current: {req.currentAssignment}
                  </ThemedText>
                  <ThemedText style={[s.requestChange, { color: colors.textSecondary }]} numberOfLines={2}>
                    {req.requestedChange}
                  </ThemedText>

                  {req.note && (
                    <ThemedText style={[s.requestNote, { color: colors.textTertiary }]} numberOfLines={1}>
                      Note: {req.note}
                    </ThemedText>
                  )}

                  {/* Approve/Deny buttons for staff+ on pending requests */}
                  {canApprove && req.status === 'pending' && (
                    <View style={s.requestActions}>
                      <Pressable
                        style={[s.requestActionBtn, { backgroundColor: '#22C55E20', borderColor: '#22C55E30' }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                      >
                        <IconSymbol name="checkmark" size={12} color="#22C55E" />
                        <ThemedText style={[s.requestActionText, { color: '#22C55E' }]}>Approve</ThemedText>
                      </Pressable>
                      <Pressable
                        style={[s.requestActionBtn, { backgroundColor: '#EF444420', borderColor: '#EF444430' }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                      >
                        <IconSymbol name="xmark" size={12} color="#EF4444" />
                        <ThemedText style={[s.requestActionText, { color: '#EF4444' }]}>Deny</ThemedText>
                      </Pressable>
                    </View>
                  )}

                  <ThemedText style={[s.requestSubmitted, { color: colors.textTertiary }]}>
                    Submitted {req.submittedDate}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Submit request CTA for volunteers/members (C6-C7) */}
        {(role === 'C6' || role === 'C7') && (
          <Pressable
            style={[s.submitRequestBtn, { borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="plus.circle.fill" size={16} color={colors.text} />
            <ThemedText style={[s.submitRequestText, { color: colors.text }]}>Submit a Request</ThemedText>
          </Pressable>
        )}
      </View>
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchServe({ colors, role = 'C1', onSwitchTab }: Props) {
  const visibleViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<ServeView>(visibleViews[0]?.id ?? 'overview');

  // Ensure activeView is valid for current role
  const safeView = visibleViews.some((v) => v.id === activeView) ? activeView : visibleViews[0]?.id ?? 'overview';

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Pill toggle row */}
      {visibleViews.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillToggleRow}
        >
          {visibleViews.map((view) => {
            const active = safeView === view.id;
            return (
              <Pressable
                key={view.id}
                style={[
                  s.pillToggle,
                  {
                    backgroundColor: active ? colors.text : 'transparent',
                    borderColor: active ? colors.text : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveView(view.id);
                }}
              >
                <ThemedText
                  style={[
                    s.pillToggleText,
                    { color: active ? colors.background : colors.textSecondary },
                  ]}
                >
                  {view.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Active view content */}
      {safeView === 'overview' && <OverviewView colors={colors} role={role} />}
      {safeView === 'teams' && <TeamsView colors={colors} role={role} />}
      {safeView === 'schedule' && <ScheduleView colors={colors} role={role} />}
      {safeView === 'volunteers' && <VolunteersView colors={colors} role={role} />}
      {safeView === 'training' && <TrainingView colors={colors} role={role} />}
      {safeView === 'requests' && <RequestsView colors={colors} role={role} />}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },

  // Pill toggle
  pillToggleRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2, marginBottom: Spacing.lg },
  pillToggle: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  pillToggleText: { fontSize: 12, fontWeight: '600' },

  // Filters (within views)
  filterScroll: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, paddingVertical: 2 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },

  // KPI grid
  kpiGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.sm },

  // Coverage (Overview)
  coverageSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  coveragePieContainer: { alignItems: 'center' },
  coveragePieOuter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  coveragePiePct: { fontSize: 18, fontWeight: '800' },
  coveragePieLabel: { fontSize: 9, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  coverageSummaryStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  coverageStat: { alignItems: 'center' },
  coverageStatValue: { fontSize: 22, fontWeight: '800' },
  coverageStatLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  coverageBreakdown: { gap: 6 },
  coverageRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coverageMinistry: { fontSize: 11, fontWeight: '500', width: 120 },
  coverageBarContainer: { flex: 1 },
  coverageBarBg: { height: 5, borderRadius: 2.5, overflow: 'hidden' },
  coverageBarFill: { height: '100%', borderRadius: 2.5 },
  coverageCount: { fontSize: 10, fontWeight: '600', width: 36, textAlign: 'right' },

  // Most needed (Overview)
  mostNeededRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mostNeededIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  mostNeededInfo: { flex: 1 },
  mostNeededTeam: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  mostNeededDetail: { fontSize: 12 },

  // CTA button (Overview)
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: BorderRadius.md },
  ctaButtonText: { fontSize: 15, fontWeight: '700' },

  // Teams view
  teamHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  teamIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  teamMinistry: { fontSize: 11 },
  teamDesc: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  teamCapacityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  teamCapacityBarContainer: { flex: 1 },
  teamCapacityBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  teamCapacityBarFill: { height: '100%', borderRadius: 2 },
  teamCapacityText: { fontSize: 11, fontWeight: '500', minWidth: 44, textAlign: 'right' },
  teamMetaRow: { flexDirection: 'row', gap: 16 },
  teamMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  teamMetaText: { fontSize: 10 },

  // Schedule view
  scheduleDayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scheduleDayDateBlock: { flex: 1 },
  scheduleDayLabel: { fontSize: 15, fontWeight: '700' },
  scheduleDayDate: { fontSize: 12 },
  scheduleDaySummary: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scheduleStatusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  scheduleStatusChipText: { fontSize: 11, fontWeight: '700' },
  coverageGapsContainer: { marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  coverageGapsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  coverageGapsTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  coverageGapItem: { fontSize: 11, marginLeft: 4, marginBottom: 2 },
  assignmentRow: { flexDirection: 'row', paddingVertical: 10, gap: 10, alignItems: 'flex-start' },
  assignmentStatusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  assignmentInfo: { flex: 1 },
  assignmentName: { fontSize: 14, fontWeight: '600', marginBottom: 1 },
  assignmentRole: { fontSize: 12, marginBottom: 1 },
  assignmentTime: { fontSize: 11 },

  // Volunteers view
  volunteerRow: { flexDirection: 'row', paddingVertical: 12, gap: 10, alignItems: 'flex-start' },
  volunteerAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  volunteerInitials: { fontSize: 12, fontWeight: '700' },
  volunteerInfo: { flex: 1 },
  volunteerNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 },
  volunteerName: { fontSize: 14, fontWeight: '600', flex: 1 },
  volunteerTeams: { fontSize: 12, marginBottom: 2 },
  volunteerMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  volunteerMetaText: { fontSize: 10 },
  volunteerAnalytics: { flexDirection: 'row', gap: 16, marginTop: 6, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128,128,128,0.15)' },
  volunteerAnalyticItem: { alignItems: 'center' },
  volunteerAnalyticLabel: { fontSize: 9, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 1 },
  volunteerAnalyticValue: { fontSize: 12, fontWeight: '700' },

  // Training view
  trainingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  trainingTitleRow: { flex: 1, marginRight: 8 },
  trainingName: { fontSize: 15, fontWeight: '700' },
  trainingDesc: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  trainingProgressContainer: { marginBottom: Spacing.sm },
  trainingProgressBg: { height: 6, borderRadius: 3, marginBottom: 3, overflow: 'hidden' },
  trainingProgressFill: { height: '100%', borderRadius: 3 },
  trainingProgressLabel: { fontSize: 10 },
  trainingTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  trainingTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  trainingTagText: { fontSize: 10, fontWeight: '500' },
  trainingMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  trainingMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trainingMetaText: { fontSize: 10 },

  // Pipeline (Overview)
  pipelineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm },
  pipelineStage: { alignItems: 'center', gap: 4, minWidth: 48 },
  pipelineBubble: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  pipelineBubbleValue: { fontSize: 14, fontWeight: '800' },
  pipelineStageLabel: { fontSize: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  // Role breakdown (Teams)
  roleBreakdown: { marginBottom: Spacing.sm, gap: 3 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleDot: { width: 5, height: 5, borderRadius: 2.5 },
  roleName: { fontSize: 11, flex: 1 },
  roleCount: { fontSize: 11, fontWeight: '700', minWidth: 28, textAlign: 'right' },

  // Scope toggle (Schedule)
  scopeToggleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  scopeToggle: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  scopeToggleText: { fontSize: 12, fontWeight: '600' },

  // Training records
  trainingRecordRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: 8 },
  trainingRecordInfo: { flex: 1 },
  trainingRecordName: { fontSize: 13, fontWeight: '600', marginBottom: 1 },
  trainingRecordProgram: { fontSize: 11, marginBottom: 3 },
  trainingRecordMeta: { gap: 1 },
  trainingRecordDate: { fontSize: 10 },
  trainingRecordEvidence: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // Requests view
  requestRow: { flexDirection: 'row', paddingVertical: 12, gap: 10, alignItems: 'flex-start' },
  requestTypeIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  requestInfo: { flex: 1 },
  requestNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  requestName: { fontSize: 14, fontWeight: '600', flex: 1 },
  requestTypeDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  requestTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  requestTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  requestDate: { fontSize: 11 },
  requestAssignment: { fontSize: 12, marginBottom: 2 },
  requestChange: { fontSize: 12, marginBottom: 2 },
  requestNote: { fontSize: 11, fontStyle: 'italic', marginBottom: 4 },
  requestActions: { flexDirection: 'row', gap: 8, marginTop: 6, marginBottom: 4 },
  requestActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  requestActionText: { fontSize: 12, fontWeight: '600' },
  requestSubmitted: { fontSize: 10, marginTop: 2 },
  submitRequestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm },
  submitRequestText: { fontSize: 14, fontWeight: '600' },
});
