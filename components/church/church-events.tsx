/**
 * Church Events — 7-view pill-toggled Events tab.
 *
 * Views: Browse, My Events, Ministries, Service Plan, Volunteers, Check-In,
 *        Attendance & Follow-Up.
 *
 * RBAC:
 *   C1/C2 — All 7 views, full admin
 *   C3    — 6 views (all except Attendance & Follow-Up)
 *   C4    — Browse, My Events
 *   C5    — Browse only
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

// RBAC
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isSeniorPastor,
  isElderLevel,
  isStaffLevel,
  isMember,
} from '@/utils/church-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}

type EventsView =
  | 'browse'
  | 'my-events'
  | 'ministries'
  | 'service-plan'
  | 'volunteers'
  | 'check-in'
  | 'attendance';

interface ViewDef {
  id: EventsView;
  label: string;
  roles: ChurchRoleLens[];
}

const VIEW_DEFS: ViewDef[] = [
  { id: 'browse',       label: 'Browse',              roles: ['C1', 'C2', 'C3', 'C4', 'C5'] },
  { id: 'my-events',    label: 'My Events',           roles: ['C1', 'C2', 'C3', 'C4'] },
  { id: 'ministries',   label: 'Ministries',          roles: ['C1', 'C2', 'C3'] },
  { id: 'service-plan', label: 'Service Plan',        roles: ['C1', 'C2', 'C3'] },
  { id: 'volunteers',   label: 'Volunteers',          roles: ['C1', 'C2', 'C3'] },
  { id: 'check-in',     label: 'Check-In',            roles: ['C1', 'C2', 'C3'] },
  { id: 'attendance',   label: 'Attendance & Follow-Up', roles: ['C1', 'C2'] },
];

function getAvailableViews(role: ChurchRoleLens): ViewDef[] {
  return VIEW_DEFS.filter((v) => v.roles.includes(role));
}

// =============================================================================
// INLINE MOCK DATA — BROWSE
// =============================================================================

type EventType = 'worship' | 'fellowship' | 'outreach' | 'conference' | 'class' | 'retreat';
type FilterChip = 'all' | 'this-week' | 'this-month' | 'worship' | 'fellowship' | 'outreach' | 'youth' | 'kids';

type EventVisibility = 'public' | 'members' | 'leaders';

interface BrowseEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  ministry: string;
  type: EventType;
  visibility: EventVisibility;
  registrationStatus: 'open' | 'full' | 'waitlist';
  attendeeCount: number;
  capacity: number;
  chip: FilterChip[];
}

const BROWSE_EVENTS: BrowseEvent[] = [
  {
    id: 'be-1',
    title: 'Easter Celebration Service',
    date: 'Sun, Apr 5, 2026',
    time: '8:00 AM, 10:00 AM, 12:00 PM',
    location: 'Main Sanctuary',
    ministry: 'Worship Ministry',
    type: 'worship',
    visibility: 'public',
    registrationStatus: 'open',
    attendeeCount: 620,
    capacity: 1200,
    chip: ['all', 'this-month', 'worship'],
  },
  {
    id: 'be-2',
    title: "Women's Conference: Unshakable",
    date: 'Fri-Sat, Mar 20-21, 2026',
    time: '6:00 PM - 4:00 PM',
    location: 'Fellowship Hall',
    ministry: "Women's Ministry",
    type: 'conference',
    visibility: 'members',
    registrationStatus: 'open',
    attendeeCount: 145,
    capacity: 200,
    chip: ['all', 'this-month'],
  },
  {
    id: 'be-3',
    title: "Men's Retreat: Iron Sharpens Iron",
    date: 'Fri-Sun, Apr 17-19, 2026',
    time: 'Fri 5:00 PM - Sun 12:00 PM',
    location: 'Pine Ridge Conference Center',
    ministry: "Men's Ministry",
    type: 'retreat',
    visibility: 'members',
    registrationStatus: 'open',
    attendeeCount: 52,
    capacity: 80,
    chip: ['all'],
  },
  {
    id: 'be-4',
    title: 'Youth Game Night',
    date: 'Fri, Feb 20, 2026',
    time: '7:00 PM - 10:00 PM',
    location: 'Youth Center',
    ministry: 'Youth Ministry',
    type: 'fellowship',
    visibility: 'members',
    registrationStatus: 'open',
    attendeeCount: 38,
    capacity: 60,
    chip: ['all', 'this-week', 'fellowship', 'youth'],
  },
  {
    id: 'be-5',
    title: 'Community Outreach Day',
    date: 'Sat, Mar 1, 2026',
    time: '9:00 AM - 2:00 PM',
    location: 'Church Parking Lot & Figueroa Corridor',
    ministry: 'Outreach Ministry',
    type: 'outreach',
    visibility: 'public',
    registrationStatus: 'open',
    attendeeCount: 67,
    capacity: 100,
    chip: ['all', 'this-month', 'outreach'],
  },
  {
    id: 'be-6',
    title: 'Vacation Bible School',
    date: 'Mon-Fri, Jun 15-19, 2026',
    time: '9:00 AM - 12:00 PM',
    location: "Children's Wing",
    ministry: "Children's Ministry",
    type: 'class',
    visibility: 'public',
    registrationStatus: 'waitlist',
    attendeeCount: 200,
    capacity: 200,
    chip: ['all', 'kids'],
  },
  {
    id: 'be-7',
    title: 'Marriage Enrichment Workshop',
    date: 'Sat, Mar 22, 2026',
    time: '6:00 PM - 9:00 PM',
    location: 'Garden Room',
    ministry: 'Couples Ministry',
    type: 'class',
    visibility: 'members',
    registrationStatus: 'open',
    attendeeCount: 28,
    capacity: 40,
    chip: ['all', 'this-month'],
  },
  {
    id: 'be-8',
    title: 'Prayer Night',
    date: 'Wed, Feb 19, 2026',
    time: '7:00 PM - 9:00 PM',
    location: 'Chapel',
    ministry: 'Prayer Ministry',
    type: 'worship',
    visibility: 'members',
    registrationStatus: 'open',
    attendeeCount: 48,
    capacity: 120,
    chip: ['all', 'this-week', 'worship'],
  },
  {
    id: 'be-9',
    title: 'Baptism Celebration Sunday',
    date: 'Sun, Mar 8, 2026',
    time: '10:00 AM Service',
    location: 'Main Sanctuary - Baptismal',
    ministry: 'Pastoral Team',
    type: 'worship',
    visibility: 'public',
    registrationStatus: 'open',
    attendeeCount: 12,
    capacity: 30,
    chip: ['all', 'this-month', 'worship'],
  },
  {
    id: 'be-10',
    title: 'Leadership Summit 2026',
    date: 'Fri-Sat, May 8-9, 2026',
    time: '9:00 AM - 5:00 PM',
    location: 'Conference Room A&B',
    ministry: 'Pastoral Team',
    type: 'conference',
    visibility: 'leaders',
    registrationStatus: 'open',
    attendeeCount: 34,
    capacity: 60,
    chip: ['all'],
  },
  {
    id: 'be-11',
    title: 'New Member Orientation',
    date: 'Sun, Mar 1, 2026',
    time: '12:30 PM - 2:00 PM',
    location: 'Room 201',
    ministry: 'Membership',
    type: 'class',
    visibility: 'members',
    registrationStatus: 'open',
    attendeeCount: 15,
    capacity: 30,
    chip: ['all', 'this-month'],
  },
  {
    id: 'be-12',
    title: 'Small Group Kickoff Night',
    date: 'Wed, Mar 4, 2026',
    time: '7:00 PM - 8:30 PM',
    location: 'Fellowship Hall',
    ministry: 'Small Groups',
    type: 'fellowship',
    visibility: 'members',
    registrationStatus: 'open',
    attendeeCount: 92,
    capacity: 150,
    chip: ['all', 'this-month', 'fellowship'],
  },
  {
    id: 'be-13',
    title: 'Kids Worship Experience',
    date: 'Sun, Feb 23, 2026',
    time: '10:00 AM - 11:30 AM',
    location: "Children's Wing",
    ministry: "Children's Ministry",
    type: 'worship',
    visibility: 'public',
    registrationStatus: 'full',
    attendeeCount: 80,
    capacity: 80,
    chip: ['all', 'this-week', 'worship', 'kids'],
  },
  {
    id: 'be-14',
    title: 'Youth Outreach: Feed the Hungry',
    date: 'Sat, Mar 15, 2026',
    time: '8:00 AM - 12:00 PM',
    location: 'Downtown Shelter',
    ministry: 'Youth Ministry',
    type: 'outreach',
    visibility: 'public',
    registrationStatus: 'open',
    attendeeCount: 22,
    capacity: 40,
    chip: ['all', 'this-month', 'outreach', 'youth'],
  },
  {
    id: 'be-15',
    title: 'Senior Saints Luncheon',
    date: 'Thu, Feb 27, 2026',
    time: '11:30 AM - 1:30 PM',
    location: 'Fellowship Hall',
    ministry: 'Senior Ministry',
    type: 'fellowship',
    visibility: 'members',
    registrationStatus: 'open',
    attendeeCount: 38,
    capacity: 50,
    chip: ['all', 'this-week', 'fellowship'],
  },
];

const FILTER_CHIPS: { id: FilterChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'this-week', label: 'This Week' },
  { id: 'this-month', label: 'This Month' },
  { id: 'worship', label: 'Worship' },
  { id: 'fellowship', label: 'Fellowship' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'youth', label: 'Youth' },
  { id: 'kids', label: 'Kids' },
];

const EVENT_TYPE_COLOR: Record<EventType, string> = {
  worship: '#8B5CF6',
  fellowship: '#22C55E',
  outreach: '#06B6D4',
  conference: '#F59E0B',
  class: '#3B82F6',
  retreat: '#F97316',
};

const REG_STATUS_COLOR: Record<string, string> = {
  open: '#22C55E',
  full: '#EF4444',
  waitlist: '#F59E0B',
};

const VISIBILITY_COLOR: Record<EventVisibility, string> = {
  public: '#22C55E',
  members: '#3B82F6',
  leaders: '#F59E0B',
};

// =============================================================================
// INLINE MOCK DATA — MY EVENTS
// =============================================================================

interface MyEvent {
  id: string;
  title: string;
  date: string;
  role: 'attendee' | 'volunteer' | 'host';
  rsvpStatus: 'going' | 'maybe' | 'declined';
  reminderOn: boolean;
}

const MY_EVENTS_UPCOMING: MyEvent[] = [
  { id: 'me-1', title: 'Easter Celebration Service', date: 'Sun, Apr 5, 2026', role: 'attendee', rsvpStatus: 'going', reminderOn: true },
  { id: 'me-2', title: 'Prayer Night', date: 'Wed, Feb 19, 2026', role: 'attendee', rsvpStatus: 'going', reminderOn: true },
  { id: 'me-3', title: 'Community Outreach Day', date: 'Sat, Mar 1, 2026', role: 'volunteer', rsvpStatus: 'going', reminderOn: true },
  { id: 'me-4', title: 'Small Group Kickoff Night', date: 'Wed, Mar 4, 2026', role: 'host', rsvpStatus: 'going', reminderOn: false },
  { id: 'me-5', title: "Men's Retreat: Iron Sharpens Iron", date: 'Apr 17-19, 2026', role: 'attendee', rsvpStatus: 'maybe', reminderOn: false },
  { id: 'me-6', title: 'Leadership Summit 2026', date: 'May 8-9, 2026', role: 'volunteer', rsvpStatus: 'going', reminderOn: true },
  { id: 'me-7', title: 'Baptism Celebration Sunday', date: 'Sun, Mar 8, 2026', role: 'attendee', rsvpStatus: 'going', reminderOn: true },
];

interface RecurringCommitment {
  id: string;
  title: string;
  schedule: string;
  role: 'attendee' | 'volunteer' | 'host';
}

const RECURRING_COMMITMENTS: RecurringCommitment[] = [
  { id: 'rc-1', title: 'Sunday Morning Worship', schedule: 'Every Sunday, 10:00 AM', role: 'attendee' },
  { id: 'rc-2', title: 'Wednesday Prayer Night', schedule: 'Every Wednesday, 7:00 PM', role: 'attendee' },
  { id: 'rc-3', title: 'Sunday Greeter Rotation', schedule: '1st & 3rd Sundays, 9:15 AM', role: 'volunteer' },
  { id: 'rc-4', title: 'Small Group: Men of Faith', schedule: 'Every Thursday, 7:00 PM', role: 'host' },
];

interface PastMyEvent {
  id: string;
  title: string;
  date: string;
  role: 'attendee' | 'volunteer' | 'host';
}

const MY_EVENTS_PAST: PastMyEvent[] = [
  { id: 'mep-1', title: 'Super Bowl Sunday Fellowship', date: 'Feb 9, 2026', role: 'attendee' },
  { id: 'mep-2', title: "Valentine's Couples Dinner", date: 'Feb 14, 2026', role: 'volunteer' },
  { id: 'mep-3', title: 'Youth Winter Retreat', date: 'Jan 17-19, 2026', role: 'host' },
  { id: 'mep-4', title: "New Year's Prayer Vigil", date: 'Dec 31, 2025', role: 'attendee' },
];

const RSVP_COLOR: Record<string, string> = {
  going: '#22C55E',
  maybe: '#F59E0B',
  declined: '#EF4444',
};

const ROLE_BADGE_COLOR: Record<string, string> = {
  attendee: '#3B82F6',
  volunteer: '#8B5CF6',
  host: '#F97316',
};

// =============================================================================
// INLINE MOCK DATA — MINISTRIES
// =============================================================================

interface MinistryEvents {
  id: string;
  name: string;
  upcomingCount: number;
  nextEventDate: string;
  events: { id: string; title: string; date: string; time: string }[];
}

const MINISTRY_EVENTS: MinistryEvents[] = [
  {
    id: 'min-1', name: 'Worship Ministry', upcomingCount: 3, nextEventDate: 'Feb 19',
    events: [
      { id: 'me-w1', title: 'Prayer Night', date: 'Wed, Feb 19', time: '7:00 PM' },
      { id: 'me-w2', title: 'Easter Celebration Service', date: 'Sun, Apr 5', time: '8:00 AM' },
      { id: 'me-w3', title: 'Spring Worship Night', date: 'Fri, Mar 28', time: '7:00 PM' },
    ],
  },
  {
    id: 'min-2', name: 'Youth Ministry', upcomingCount: 3, nextEventDate: 'Feb 20',
    events: [
      { id: 'me-y1', title: 'Youth Game Night', date: 'Fri, Feb 20', time: '7:00 PM' },
      { id: 'me-y2', title: 'Youth Outreach: Feed the Hungry', date: 'Sat, Mar 15', time: '8:00 AM' },
      { id: 'me-y3', title: 'Youth Summer Camp Registration', date: 'Sun, Apr 12', time: '12:00 PM' },
    ],
  },
  {
    id: 'min-3', name: "Children's Ministry", upcomingCount: 2, nextEventDate: 'Feb 23',
    events: [
      { id: 'me-c1', title: 'Kids Worship Experience', date: 'Sun, Feb 23', time: '10:00 AM' },
      { id: 'me-c2', title: 'Vacation Bible School', date: 'Jun 15-19', time: '9:00 AM' },
    ],
  },
  {
    id: 'min-4', name: "Women's Ministry", upcomingCount: 2, nextEventDate: 'Mar 20',
    events: [
      { id: 'me-wm1', title: "Women's Conference: Unshakable", date: 'Mar 20-21', time: '6:00 PM' },
      { id: 'me-wm2', title: "Women's Bible Study Kickoff", date: 'Tue, Apr 7', time: '10:00 AM' },
    ],
  },
  {
    id: 'min-5', name: "Men's Ministry", upcomingCount: 2, nextEventDate: 'Mar 7',
    events: [
      { id: 'me-mm1', title: "Men's Breakfast", date: 'Sat, Mar 7', time: '8:00 AM' },
      { id: 'me-mm2', title: "Men's Retreat: Iron Sharpens Iron", date: 'Apr 17-19', time: '5:00 PM' },
    ],
  },
  {
    id: 'min-6', name: 'Young Adults', upcomingCount: 2, nextEventDate: 'Feb 21',
    events: [
      { id: 'me-ya1', title: 'Young Adults Gathering', date: 'Fri, Feb 21', time: '7:30 PM' },
      { id: 'me-ya2', title: 'Career Workshop', date: 'Sat, Mar 14', time: '10:00 AM' },
    ],
  },
  {
    id: 'min-7', name: 'Couples Ministry', upcomingCount: 2, nextEventDate: 'Mar 22',
    events: [
      { id: 'me-cp1', title: 'Marriage Enrichment Workshop', date: 'Sat, Mar 22', time: '6:00 PM' },
      { id: 'me-cp2', title: 'Date Night Event', date: 'Sat, Apr 25', time: '6:30 PM' },
    ],
  },
  {
    id: 'min-8', name: 'Outreach Ministry', upcomingCount: 2, nextEventDate: 'Mar 1',
    events: [
      { id: 'me-o1', title: 'Community Outreach Day', date: 'Sat, Mar 1', time: '9:00 AM' },
      { id: 'me-o2', title: 'Back-to-School Supply Drive', date: 'Jul 18-19', time: '9:00 AM' },
    ],
  },
  {
    id: 'min-9', name: 'Missions Ministry', upcomingCount: 2, nextEventDate: 'Mar 9',
    events: [
      { id: 'me-ms1', title: 'Missions Sunday', date: 'Sun, Mar 9', time: '10:00 AM' },
      { id: 'me-ms2', title: 'Short-Term Trip Info Session', date: 'Wed, Apr 2', time: '7:00 PM' },
    ],
  },
  {
    id: 'min-10', name: 'Prayer Ministry', upcomingCount: 3, nextEventDate: 'Feb 19',
    events: [
      { id: 'me-p1', title: 'Prayer Night', date: 'Wed, Feb 19', time: '7:00 PM' },
      { id: 'me-p2', title: 'Prayer Walk: Downtown', date: 'Sat, Mar 8', time: '7:00 AM' },
      { id: 'me-p3', title: '40-Day Prayer Chain', date: 'Feb 26 - Apr 5', time: 'Daily' },
    ],
  },
];

// =============================================================================
// INLINE MOCK DATA — SERVICE PLAN
// =============================================================================

interface ServiceElement {
  id: string;
  label: string;
  timeAllocation: string;
  assignedPerson: string;
  notes: string;
  status: 'confirmed' | 'TBD';
}

interface ServicePlan {
  id: string;
  date: string;
  serviceName: string;
  worshipSetLink?: string;
  elements: ServiceElement[];
}

const SERVICE_PLANS: ServicePlan[] = [
  {
    id: 'sp-1',
    date: 'Sun, Feb 23, 2026',
    serviceName: '10:00 AM Morning Worship',
    worshipSetLink: 'Goodness of God, Way Maker, Holy Spirit, Great Is Thy Faithfulness',
    elements: [
      { id: 'el-1', label: 'Pre-Service Music', timeAllocation: '15 min', assignedPerson: 'Marcus Jenkins', notes: 'Instrumental worship mix', status: 'confirmed' },
      { id: 'el-2', label: 'Welcome', timeAllocation: '3 min', assignedPerson: 'Deacon Williams', notes: 'Welcome visitors, announcements', status: 'confirmed' },
      { id: 'el-3', label: 'Opening Prayer', timeAllocation: '3 min', assignedPerson: 'Elder Thompson', notes: 'Corporate prayer for the service', status: 'confirmed' },
      { id: 'el-4', label: 'Worship Set', timeAllocation: '25 min', assignedPerson: 'Worship Team', notes: 'Goodness of God, Way Maker, Holy Spirit', status: 'confirmed' },
      { id: 'el-5', label: 'Scripture Reading', timeAllocation: '3 min', assignedPerson: 'Sister Davis', notes: 'Psalm 23', status: 'confirmed' },
      { id: 'el-6', label: 'Sermon', timeAllocation: '35 min', assignedPerson: 'Pastor Kalejaiye', notes: '"Walking in Purpose" - Series Part 3', status: 'confirmed' },
      { id: 'el-7', label: 'Altar Call', timeAllocation: '10 min', assignedPerson: 'Pastor Kalejaiye', notes: 'Invitation to accept Christ', status: 'confirmed' },
      { id: 'el-8', label: 'Announcements', timeAllocation: '5 min', assignedPerson: 'Minister Clarke', notes: 'Upcoming events, small groups', status: 'confirmed' },
      { id: 'el-9', label: 'Offering', timeAllocation: '5 min', assignedPerson: 'Deacon Harris', notes: 'Tithes and offering collection', status: 'confirmed' },
      { id: 'el-10', label: 'Closing Song', timeAllocation: '5 min', assignedPerson: 'Worship Team', notes: 'Great Is Thy Faithfulness', status: 'confirmed' },
      { id: 'el-11', label: 'Benediction', timeAllocation: '2 min', assignedPerson: 'Pastor Kalejaiye', notes: 'Closing blessing', status: 'confirmed' },
      { id: 'el-12', label: 'Dismissal', timeAllocation: '2 min', assignedPerson: 'Deacon Williams', notes: 'Exit instructions, meet & greet', status: 'confirmed' },
    ],
  },
  {
    id: 'sp-2',
    date: 'Sun, Mar 1, 2026',
    serviceName: '10:00 AM Morning Worship',
    elements: [
      { id: 'el-21', label: 'Pre-Service Music', timeAllocation: '15 min', assignedPerson: 'Marcus Jenkins', notes: 'Soft worship piano', status: 'confirmed' },
      { id: 'el-22', label: 'Welcome', timeAllocation: '3 min', assignedPerson: 'Minister Clarke', notes: 'First Sunday welcome, new member intro', status: 'TBD' },
      { id: 'el-23', label: 'Opening Prayer', timeAllocation: '3 min', assignedPerson: 'TBD', notes: '', status: 'TBD' },
      { id: 'el-24', label: 'Worship Set', timeAllocation: '25 min', assignedPerson: 'Worship Team', notes: 'To be finalized', status: 'TBD' },
      { id: 'el-25', label: 'Scripture Reading', timeAllocation: '3 min', assignedPerson: 'TBD', notes: 'Ephesians 2:8-10', status: 'TBD' },
      { id: 'el-26', label: 'Sermon', timeAllocation: '35 min', assignedPerson: 'Pastor Kalejaiye', notes: '"Walking in Purpose" - Series Part 4', status: 'confirmed' },
      { id: 'el-27', label: 'Altar Call', timeAllocation: '10 min', assignedPerson: 'Pastor Kalejaiye', notes: '', status: 'confirmed' },
      { id: 'el-28', label: 'Announcements', timeAllocation: '5 min', assignedPerson: 'TBD', notes: 'New member orientation, outreach day', status: 'TBD' },
      { id: 'el-29', label: 'Offering', timeAllocation: '5 min', assignedPerson: 'Deacon Harris', notes: '', status: 'confirmed' },
      { id: 'el-30', label: 'Closing Song', timeAllocation: '5 min', assignedPerson: 'Worship Team', notes: 'TBD', status: 'TBD' },
      { id: 'el-31', label: 'Benediction', timeAllocation: '2 min', assignedPerson: 'Pastor Kalejaiye', notes: '', status: 'confirmed' },
      { id: 'el-32', label: 'Dismissal', timeAllocation: '2 min', assignedPerson: 'TBD', notes: '', status: 'TBD' },
    ],
  },
];

// =============================================================================
// INLINE MOCK DATA — VOLUNTEERS
// =============================================================================

type CoverageStatus = 'covered' | 'needs-help' | 'critical';

interface VolunteerSlot {
  id: string;
  role: string;
  person: string | null;
  shiftTime: string;
}

interface VolunteerEvent {
  id: string;
  eventName: string;
  date: string;
  neededVolunteers: number;
  confirmed: number;
  pending: number;
  coverageStatus: CoverageStatus;
  slots: VolunteerSlot[];
}

const VOLUNTEER_EVENTS: VolunteerEvent[] = [
  {
    id: 've-1',
    eventName: 'Sunday Morning Worship (Feb 23)',
    date: 'Sun, Feb 23, 2026',
    neededVolunteers: 25,
    confirmed: 22,
    pending: 2,
    coverageStatus: 'needs-help',
    slots: [
      { id: 'vs-1', role: 'Greeter - Main Entrance', person: 'James Robinson', shiftTime: '9:15 AM - 11:30 AM' },
      { id: 'vs-2', role: 'Greeter - South Entrance', person: 'Linda Foster', shiftTime: '9:15 AM - 11:30 AM' },
      { id: 'vs-3', role: 'Usher - Left Section', person: 'Marcus Davis', shiftTime: '9:30 AM - 12:00 PM' },
      { id: 'vs-4', role: 'Usher - Right Section', person: 'Anthony Bridges', shiftTime: '9:30 AM - 12:00 PM' },
      { id: 'vs-5', role: 'Usher - Center Section', person: null, shiftTime: '9:30 AM - 12:00 PM' },
      { id: 'vs-6', role: 'Sound Tech', person: 'Kevin Park', shiftTime: '8:30 AM - 12:30 PM' },
      { id: 'vs-7', role: 'Media / ProPresenter', person: 'Sarah Chen', shiftTime: '8:30 AM - 12:30 PM' },
      { id: 'vs-8', role: 'Camera Operator', person: 'DeAndre Mitchell', shiftTime: '9:00 AM - 12:00 PM' },
      { id: 'vs-9', role: 'Live Stream Director', person: 'Rachel Kim', shiftTime: '9:00 AM - 12:30 PM' },
      { id: 'vs-10', role: 'Nursery (0-1 yr)', person: 'Grace Thompson', shiftTime: '9:45 AM - 11:45 AM' },
      { id: 'vs-11', role: 'Nursery (0-1 yr)', person: 'Maria Lopez', shiftTime: '9:45 AM - 11:45 AM' },
      { id: 'vs-12', role: 'Toddler Room (1-3 yr)', person: 'Angela Brown', shiftTime: '9:45 AM - 11:45 AM' },
      { id: 'vs-13', role: 'Toddler Room (1-3 yr)', person: null, shiftTime: '9:45 AM - 11:45 AM' },
      { id: 'vs-14', role: 'PreK Class (3-5 yr)', person: 'Christine Moore', shiftTime: '9:45 AM - 11:45 AM' },
      { id: 'vs-15', role: 'PreK Class (3-5 yr)', person: 'David Allen', shiftTime: '9:45 AM - 11:45 AM' },
      { id: 'vs-16', role: 'Elementary (K-2nd)', person: 'Tiffany Scott', shiftTime: '9:45 AM - 11:45 AM' },
      { id: 'vs-17', role: 'Elementary (3rd-5th)', person: 'Brian Washington', shiftTime: '9:45 AM - 11:45 AM' },
      { id: 'vs-18', role: 'Check-In Station', person: 'Patrice Hall', shiftTime: '9:15 AM - 10:15 AM' },
      { id: 'vs-19', role: 'Parking Lot', person: 'Robert Taylor', shiftTime: '8:45 AM - 10:15 AM' },
      { id: 'vs-20', role: 'Parking Lot', person: 'Derek Johnson', shiftTime: '8:45 AM - 10:15 AM' },
      { id: 'vs-21', role: 'Coffee / Hospitality', person: 'Nicole Adams', shiftTime: '8:30 AM - 11:00 AM' },
      { id: 'vs-22', role: 'Coffee / Hospitality', person: 'Janet Williams', shiftTime: '8:30 AM - 11:00 AM' },
      { id: 'vs-23', role: 'Security - Lobby', person: 'Officer K. Brown', shiftTime: '8:30 AM - 12:30 PM' },
      { id: 'vs-24', role: 'Security - Parking', person: null, shiftTime: '8:30 AM - 12:30 PM' },
      { id: 'vs-25', role: 'Altar Prayer Team', person: 'Elder Martha Reed', shiftTime: '10:00 AM - 12:00 PM' },
    ],
  },
  {
    id: 've-2',
    eventName: 'Community Outreach Day (Mar 1)',
    date: 'Sat, Mar 1, 2026',
    neededVolunteers: 18,
    confirmed: 10,
    pending: 3,
    coverageStatus: 'critical',
    slots: [
      { id: 'vs-30', role: 'Team Lead - Food Distribution', person: 'Deacon Harris', shiftTime: '8:00 AM - 2:00 PM' },
      { id: 'vs-31', role: 'Team Lead - Clothing Sort', person: 'Sister Davis', shiftTime: '8:00 AM - 2:00 PM' },
      { id: 'vs-32', role: 'Registration Table', person: 'Patrice Hall', shiftTime: '8:30 AM - 1:00 PM' },
      { id: 'vs-33', role: 'Registration Table', person: null, shiftTime: '8:30 AM - 1:00 PM' },
      { id: 'vs-34', role: 'Food Packing', person: 'Nicole Adams', shiftTime: '8:00 AM - 12:00 PM' },
      { id: 'vs-35', role: 'Food Packing', person: 'Brian Washington', shiftTime: '8:00 AM - 12:00 PM' },
      { id: 'vs-36', role: 'Food Packing', person: null, shiftTime: '8:00 AM - 12:00 PM' },
      { id: 'vs-37', role: 'Food Distribution', person: 'James Robinson', shiftTime: '9:00 AM - 2:00 PM' },
      { id: 'vs-38', role: 'Food Distribution', person: null, shiftTime: '9:00 AM - 2:00 PM' },
      { id: 'vs-39', role: 'Clothing Sort & Distribute', person: 'Angela Brown', shiftTime: '8:00 AM - 1:00 PM' },
      { id: 'vs-40', role: 'Clothing Sort & Distribute', person: null, shiftTime: '8:00 AM - 1:00 PM' },
      { id: 'vs-41', role: 'Prayer Station', person: 'Elder Martha Reed', shiftTime: '9:00 AM - 2:00 PM' },
      { id: 'vs-42', role: 'Prayer Station', person: null, shiftTime: '9:00 AM - 2:00 PM' },
      { id: 'vs-43', role: 'Kids Activity Zone', person: 'Tiffany Scott', shiftTime: '9:00 AM - 1:00 PM' },
      { id: 'vs-44', role: 'Kids Activity Zone', person: null, shiftTime: '9:00 AM - 1:00 PM' },
      { id: 'vs-45', role: 'Setup / Teardown', person: 'Derek Johnson', shiftTime: '7:00 AM - 3:00 PM' },
      { id: 'vs-46', role: 'Setup / Teardown', person: null, shiftTime: '7:00 AM - 3:00 PM' },
      { id: 'vs-47', role: 'Photography / Social Media', person: null, shiftTime: '9:00 AM - 2:00 PM' },
    ],
  },
];

const COVERAGE_CONFIG: Record<CoverageStatus, { label: string; color: string; icon: string }> = {
  covered: { label: 'Fully Covered', color: '#22C55E', icon: 'checkmark.circle.fill' },
  'needs-help': { label: 'Needs Help', color: '#F59E0B', icon: 'exclamationmark.triangle.fill' },
  critical: { label: 'Critical', color: '#EF4444', icon: 'xmark.circle.fill' },
};

// =============================================================================
// INLINE MOCK DATA — CHECK-IN
// =============================================================================

interface CheckInStation {
  id: string;
  name: string;
  status: 'active' | 'idle';
  checkedIn: number;
}

interface RecentCheckIn {
  id: string;
  name: string;
  time: string;
  location: string;
  type: 'member' | 'child' | 'visitor';
}

const CHECKIN_STATS = {
  totalCheckedIn: 347,
  childrenCheckedIn: 82,
  firstTimeVisitors: 11,
};

const CHECKIN_STATIONS: CheckInStation[] = [
  { id: 'cs-1', name: 'Main Entrance', status: 'active', checkedIn: 218 },
  { id: 'cs-2', name: "Children's Wing", status: 'active', checkedIn: 82 },
  { id: 'cs-3', name: 'Youth Room', status: 'active', checkedIn: 47 },
];

const RECENT_CHECKINS: RecentCheckIn[] = [
  { id: 'rc-1', name: 'James Robinson', time: '9:42 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-2', name: 'Sarah Chen', time: '9:41 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-3', name: 'Elijah Foster (age 7)', time: '9:40 AM', location: "Children's Wing", type: 'child' },
  { id: 'rc-4', name: 'David & Maria Lopez', time: '9:39 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-5', name: 'Sophia Davis (age 4)', time: '9:38 AM', location: "Children's Wing", type: 'child' },
  { id: 'rc-6', name: 'Michael Turner', time: '9:37 AM', location: 'Main Entrance', type: 'visitor' },
  { id: 'rc-7', name: 'Angela & Brian Washington', time: '9:36 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-8', name: 'Isaiah Washington (age 9)', time: '9:36 AM', location: "Children's Wing", type: 'child' },
  { id: 'rc-9', name: 'Patricia Hall', time: '9:35 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-10', name: 'Daniel Kim', time: '9:34 AM', location: 'Youth Room', type: 'member' },
  { id: 'rc-11', name: 'Jasmine Wright', time: '9:33 AM', location: 'Main Entrance', type: 'visitor' },
  { id: 'rc-12', name: 'Caleb Moore (age 11)', time: '9:32 AM', location: "Children's Wing", type: 'child' },
  { id: 'rc-13', name: 'Robert & Nicole Adams', time: '9:31 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-14', name: 'Grace Thompson', time: '9:30 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-15', name: 'Derek Johnson', time: '9:29 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-16', name: 'Emily Parker', time: '9:28 AM', location: 'Main Entrance', type: 'visitor' },
  { id: 'rc-17', name: 'Noah Allen (age 6)', time: '9:27 AM', location: "Children's Wing", type: 'child' },
  { id: 'rc-18', name: 'Tiffany Scott', time: '9:26 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-19', name: 'Marcus & Linda Davis', time: '9:25 AM', location: 'Main Entrance', type: 'member' },
  { id: 'rc-20', name: 'Andrew Phillips', time: '9:24 AM', location: 'Youth Room', type: 'visitor' },
];

const CHECKIN_TYPE_COLOR: Record<string, string> = {
  member: '#3B82F6',
  child: '#8B5CF6',
  visitor: '#22C55E',
};

// =============================================================================
// INLINE MOCK DATA — ATTENDANCE & FOLLOW-UP
// =============================================================================

interface WeeklyAttendance {
  week: string;
  attendance: number;
  adults: number;
  children: number;
  visitors: number;
}

const WEEKLY_ATTENDANCE: WeeklyAttendance[] = [
  { week: 'Jan 12', attendance: 412, adults: 326, children: 72, visitors: 14 },
  { week: 'Jan 19', attendance: 438, adults: 345, children: 78, visitors: 15 },
  { week: 'Jan 26', attendance: 425, adults: 332, children: 75, visitors: 18 },
  { week: 'Feb 2', attendance: 458, adults: 358, children: 82, visitors: 18 },
  { week: 'Feb 9', attendance: 510, adults: 398, children: 90, visitors: 22 },
  { week: 'Feb 16', attendance: 445, adults: 348, children: 82, visitors: 15 },
];

interface AttendanceBreakdown {
  label: string;
  value: number;
  color: string;
}

const ATTENDANCE_BREAKDOWN: AttendanceBreakdown[] = [
  { label: 'Adults', value: 348, color: '#3B82F6' },
  { label: 'Children', value: 82, color: '#8B5CF6' },
  { label: 'First-Time Visitors', value: 11, color: '#22C55E' },
  { label: 'Returning Visitors', value: 4, color: '#06B6D4' },
];

interface ServiceAttendance {
  id: string;
  service: string;
  time: string;
  attendance: number;
  capacity: number;
}

const SERVICE_ATTENDANCE: ServiceAttendance[] = [
  { id: 'sa-1', service: 'Early Morning Prayer', time: '7:00 AM', attendance: 28, capacity: 80 },
  { id: 'sa-2', service: 'Morning Worship', time: '10:00 AM', attendance: 380, capacity: 500 },
  { id: 'sa-3', service: 'Youth Service', time: '10:00 AM', attendance: 47, capacity: 80 },
  { id: 'sa-4', service: 'Evening Bible Study', time: '7:00 PM', attendance: 92, capacity: 150 },
];

type FollowUpType = 'first-time' | 'absent' | 'returning';

interface FollowUpItem {
  id: string;
  name: string;
  type: FollowUpType;
  event: string;
  lastAttendance: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  notes: string;
}

const FOLLOWUP_ITEMS: FollowUpItem[] = [
  { id: 'fu-1', name: 'Michael Turner', type: 'first-time', event: 'Sunday Morning Worship', lastAttendance: 'Feb 16, 2026', assignedTo: 'Minister Clarke', status: 'pending', notes: 'Came with a friend; interested in small groups' },
  { id: 'fu-2', name: 'Jasmine Wright', type: 'first-time', event: 'Sunday Morning Worship', lastAttendance: 'Feb 16, 2026', assignedTo: 'Deacon Williams', status: 'pending', notes: 'Left before service ended; send welcome packet' },
  { id: 'fu-3', name: 'Emily Parker', type: 'first-time', event: 'Sunday Morning Worship', lastAttendance: 'Feb 16, 2026', assignedTo: 'Sister Davis', status: 'in-progress', notes: 'Called Tuesday; scheduling coffee meeting' },
  { id: 'fu-4', name: 'Andrew Phillips', type: 'first-time', event: 'Youth Service', lastAttendance: 'Feb 16, 2026', assignedTo: 'Elder Thompson', status: 'pending', notes: 'College student; new to area' },
  { id: 'fu-5', name: 'Karen Mitchell', type: 'absent', event: 'Sunday Morning Worship', lastAttendance: 'Jan 19, 2026', assignedTo: 'Deacon Harris', status: 'in-progress', notes: 'Recovering from surgery; sent card' },
  { id: 'fu-6', name: 'Victor Okonkwo', type: 'absent', event: 'Sunday Morning Worship', lastAttendance: 'Jan 12, 2026', assignedTo: 'Minister Clarke', status: 'pending', notes: 'No response to calls; try home visit' },
  { id: 'fu-7', name: 'Lisa Hernandez', type: 'absent', event: 'Sunday Morning Worship', lastAttendance: 'Dec 29, 2025', assignedTo: 'Elder Martha Reed', status: 'pending', notes: 'Family issues; needs pastoral care referral' },
  { id: 'fu-8', name: 'Raymond Foster', type: 'returning', event: 'Sunday Morning Worship', lastAttendance: 'Feb 9, 2026', assignedTo: 'Deacon Williams', status: 'completed', notes: 'Rejoined men\'s small group' },
  { id: 'fu-9', name: 'Denise Brooks', type: 'absent', event: 'Evening Bible Study', lastAttendance: 'Jan 5, 2026', assignedTo: 'Sister Davis', status: 'in-progress', notes: 'Work schedule conflict; exploring online options' },
  { id: 'fu-10', name: 'Carlos Rivera', type: 'returning', event: 'Sunday Morning Worship', lastAttendance: 'Feb 16, 2026', assignedTo: 'Deacon Harris', status: 'completed', notes: 'Back from military deployment; reconnected' },
];

const FOLLOWUP_TYPE_COLOR: Record<FollowUpType, string> = {
  'first-time': '#22C55E',
  absent: '#F59E0B',
  returning: '#3B82F6',
};

const FOLLOWUP_STATUS_COLOR: Record<string, string> = {
  pending: '#F59E0B',
  'in-progress': '#3B82F6',
  completed: '#22C55E',
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, action }: { title: string; colors: typeof Colors.light; count?: number; action?: string }) {
  return (
    <View style={shrd.headerRow}>
      <ThemedText style={[shrd.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[shrd.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[shrd.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
      {action && (
        <Pressable
          style={{ marginLeft: 'auto' }}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <ThemedText style={[shrd.actionText, { color: colors.textTertiary }]}>{action}</ThemedText>
        </Pressable>
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

function StatBox({ label, value, colors, valueColor }: { label: string; value: string; colors: typeof Colors.light; valueColor?: string }) {
  return (
    <View style={shrd.statBox}>
      <ThemedText style={[shrd.statValue, { color: valueColor || colors.text }]}>{value}</ThemedText>
      <ThemedText style={[shrd.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function ProgressBar({ percentage, color, colors }: { percentage: number; color: string; colors: typeof Colors.light }) {
  return (
    <View style={[shrd.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
      <View style={[shrd.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

const shrd = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  actionText: { fontSize: 12, fontWeight: '500' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});

// =============================================================================
// VIEW 1: BROWSE
// =============================================================================

function BrowseView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [activeChip, setActiveChip] = useState<FilterChip>('all');

  const filtered = activeChip === 'all'
    ? BROWSE_EVENTS
    : BROWSE_EVENTS.filter((ev) => ev.chip.includes(activeChip));

  // Summary stats for staff+
  const totalEvents = BROWSE_EVENTS.length;
  const openEvents = BROWSE_EVENTS.filter((e) => e.registrationStatus === 'open').length;
  const fullEvents = BROWSE_EVENTS.filter((e) => e.registrationStatus === 'full').length;
  const totalRegistered = BROWSE_EVENTS.reduce((a, b) => a + b.attendeeCount, 0);

  return (
    <View>
      {/* Event summary stats (staff+) */}
      {isStaffLevel(role) && (
        <>
          <SectionHeader title="EVENT OVERVIEW" colors={colors} />
          <Card colors={colors}>
            <View style={s.statsRow}>
              <StatBox label="Total Events" value={String(totalEvents)} colors={colors} />
              <StatBox label="Open Reg." value={String(openEvents)} colors={colors} valueColor="#22C55E" />
              <StatBox label="Full" value={String(fullEvents)} colors={colors} valueColor="#EF4444" />
              <StatBox label="Registered" value={totalRegistered.toLocaleString()} colors={colors} valueColor="#3B82F6" />
            </View>
          </Card>
        </>
      )}

      {/* Featured event hero */}
      <Pressable
        style={({ pressed }) => [
          s.featuredCard,
          { backgroundColor: '#1e1a3e', opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <View style={[s.featuredCatBadge, { backgroundColor: '#8B5CF640' }]}>
          <ThemedText style={s.featuredCatText}>WORSHIP</ThemedText>
        </View>
        <ThemedText style={s.featuredTitle}>Easter Celebration 2026</ThemedText>
        <ThemedText style={s.featuredSubtitle}>He Is Risen -- A Service of Hope and Renewal</ThemedText>
        <View style={s.featuredDetailRow}>
          <IconSymbol name="calendar" size={12} color="rgba(255,255,255,0.6)" />
          <ThemedText style={s.featuredDetailText}>Sunday, April 5, 2026</ThemedText>
        </View>
        <View style={s.featuredDetailRow}>
          <IconSymbol name="clock.fill" size={12} color="rgba(255,255,255,0.6)" />
          <ThemedText style={s.featuredDetailText}>8:00 AM, 10:00 AM, & 12:00 PM</ThemedText>
        </View>
        <View style={s.featuredDetailRow}>
          <IconSymbol name="mappin.circle.fill" size={12} color="rgba(255,255,255,0.6)" />
          <ThemedText style={s.featuredDetailText}>Main Sanctuary</ThemedText>
        </View>
        <View style={s.featuredRegRow}>
          <View style={s.featuredRegBadge}>
            <ThemedText style={s.featuredRegText}>REGISTRATION OPEN</ThemedText>
          </View>
          <ThemedText style={s.featuredSpotsText}>580 / 1200 registered</ThemedText>
        </View>
      </Pressable>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterRowContent}>
        {FILTER_CHIPS.map((chip) => {
          const isActive = activeChip === chip.id;
          return (
            <Pressable
              key={chip.id}
              style={[
                s.filterPill,
                {
                  backgroundColor: isActive ? colors.text + '12' : 'transparent',
                  borderColor: isActive ? colors.text + '25' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveChip(chip.id);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? colors.text : colors.textSecondary }]}>
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionHeader title="UPCOMING EVENTS" colors={colors} count={filtered.length} />

      {filtered.length === 0 ? (
        <Card colors={colors}>
          <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No events match this filter.</ThemedText>
        </Card>
      ) : (
        filtered.map((event) => {
          const typeColor = EVENT_TYPE_COLOR[event.type];
          const regColor = REG_STATUS_COLOR[event.registrationStatus];
          const visColor = VISIBILITY_COLOR[event.visibility];
          const fillPct = Math.round((event.attendeeCount / event.capacity) * 100);
          const canRsvp = event.registrationStatus !== 'full';

          return (
            <Pressable key={event.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Card colors={colors}>
                {/* Badge row: type + visibility */}
                <View style={s.browseBadgeRow}>
                  <View style={[s.typeBadge, { backgroundColor: typeColor + '20' }]}>
                    <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>
                      {event.type.toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={[s.visBadge, { backgroundColor: visColor + '20' }]}>
                    <IconSymbol name={event.visibility === 'public' ? 'globe' : event.visibility === 'members' ? 'person.2.fill' : 'lock.fill' as any} size={8} color={visColor} />
                    <ThemedText style={[s.visBadgeText, { color: visColor }]}>
                      {event.visibility.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>

                {/* Title row */}
                <View style={s.browseHeader}>
                  <View style={[s.catDot, { backgroundColor: typeColor }]} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.browseTitle, { color: colors.text }]}>{event.title}</ThemedText>
                    <ThemedText style={[s.browseDatetime, { color: colors.textSecondary }]}>
                      {event.date} {'\u00B7'} {event.time}
                    </ThemedText>
                  </View>
                </View>

                {/* Location & ministry */}
                <View style={s.browseDetailRow}>
                  <IconSymbol name="mappin.circle.fill" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.browseDetailText, { color: colors.textTertiary }]}>{event.location}</ThemedText>
                </View>
                <View style={s.browseDetailRow}>
                  <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.browseDetailText, { color: colors.textTertiary }]}>{event.ministry}</ThemedText>
                </View>

                {/* Bottom row: registration + capacity + RSVP */}
                <View style={s.browseBottomRow}>
                  <View style={[s.regBadge, { backgroundColor: regColor + '20' }]}>
                    <View style={[s.regDot, { backgroundColor: regColor }]} />
                    <ThemedText style={[s.regText, { color: regColor }]}>
                      {event.registrationStatus.toUpperCase()}
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.capacityText, { color: colors.textTertiary }]}>
                    {event.attendeeCount} / {event.capacity} ({fillPct}%)
                  </ThemedText>
                  <Pressable
                    style={[s.rsvpButton, { backgroundColor: canRsvp ? '#3B82F6' : colors.backgroundTertiary }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  >
                    <ThemedText style={[s.rsvpButtonText, { color: canRsvp ? '#fff' : colors.textTertiary }]}>
                      {canRsvp ? 'RSVP' : 'FULL'}
                    </ThemedText>
                  </Pressable>
                </View>
              </Card>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

// =============================================================================
// VIEW 2: MY EVENTS
// =============================================================================

function MyEventsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [showPast, setShowPast] = useState(false);

  // Split upcoming events into RSVPs vs Serving Assignments
  const rsvpEvents = MY_EVENTS_UPCOMING.filter((e) => e.role === 'attendee');
  const servingEvents = MY_EVENTS_UPCOMING.filter((e) => e.role === 'volunteer' || e.role === 'host');

  const renderEventCard = (event: typeof MY_EVENTS_UPCOMING[0]) => {
    const roleColor = ROLE_BADGE_COLOR[event.role];
    const rsvpColor = RSVP_COLOR[event.rsvpStatus];
    return (
      <Pressable key={event.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
        <Card colors={colors}>
          <View style={s.myEventHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.myEventTitle, { color: colors.text }]}>{event.title}</ThemedText>
              <ThemedText style={[s.myEventDate, { color: colors.textSecondary }]}>{event.date}</ThemedText>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={[s.roleBadge, { backgroundColor: roleColor + '20' }]}>
                <ThemedText style={[s.roleBadgeText, { color: roleColor }]}>{event.role.toUpperCase()}</ThemedText>
              </View>
              <View style={[s.rsvpBadge, { backgroundColor: rsvpColor + '20' }]}>
                <View style={[s.rsvpDot, { backgroundColor: rsvpColor }]} />
                <ThemedText style={[s.rsvpText, { color: rsvpColor }]}>{event.rsvpStatus.toUpperCase()}</ThemedText>
              </View>
            </View>
          </View>
          <View style={s.reminderRow}>
            <IconSymbol name={event.reminderOn ? 'bell.fill' : 'bell.slash' as any} size={12} color={event.reminderOn ? '#22C55E' : colors.textTertiary} />
            <ThemedText style={[s.reminderText, { color: event.reminderOn ? '#22C55E' : colors.textTertiary }]}>
              Reminder {event.reminderOn ? 'On' : 'Off'}
            </ThemedText>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <View>
      {/* Section 1: RSVPs */}
      <SectionHeader title="MY RSVPs" colors={colors} count={rsvpEvents.length} />
      {rsvpEvents.length === 0 ? (
        <Card colors={colors}>
          <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No upcoming RSVPs.</ThemedText>
        </Card>
      ) : rsvpEvents.map(renderEventCard)}

      {/* Section 2: Serving Assignments */}
      <SectionHeader title="SERVING ASSIGNMENTS" colors={colors} count={servingEvents.length} />
      {servingEvents.length === 0 ? (
        <Card colors={colors}>
          <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No upcoming serving assignments.</ThemedText>
        </Card>
      ) : servingEvents.map(renderEventCard)}

      {/* Section 3: Recurring Commitments */}
      <SectionHeader title="RECURRING COMMITMENTS" colors={colors} count={RECURRING_COMMITMENTS.length} />
      {RECURRING_COMMITMENTS.map((item) => {
        const roleColor = ROLE_BADGE_COLOR[item.role];
        return (
          <Card key={item.id} colors={colors}>
            <View style={s.myEventHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.myEventTitle, { color: colors.text }]}>{item.title}</ThemedText>
                <ThemedText style={[s.myEventDate, { color: colors.textSecondary }]}>{item.schedule}</ThemedText>
              </View>
              <View style={[s.roleBadge, { backgroundColor: roleColor + '20' }]}>
                <ThemedText style={[s.roleBadgeText, { color: roleColor }]}>{item.role.toUpperCase()}</ThemedText>
              </View>
            </View>
          </Card>
        );
      })}

      {/* Past events collapsible */}
      <Pressable
        style={s.pastToggle}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowPast(!showPast);
        }}
      >
        <ThemedText style={[shrd.sectionLabel, { color: colors.textSecondary }]}>PAST EVENTS</ThemedText>
        <IconSymbol name={showPast ? 'chevron.up' : 'chevron.down' as any} size={12} color={colors.textTertiary} />
      </Pressable>

      {showPast && (
        <Card colors={colors}>
          {MY_EVENTS_PAST.map((event, idx) => {
            const roleColor = ROLE_BADGE_COLOR[event.role];
            return (
              <View
                key={event.id}
                style={[
                  s.pastRow,
                  idx < MY_EVENTS_PAST.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.pastTitle, { color: colors.text }]} numberOfLines={1}>{event.title}</ThemedText>
                  <ThemedText style={[s.pastDate, { color: colors.textTertiary }]}>{event.date}</ThemedText>
                </View>
                <View style={[s.roleBadge, { backgroundColor: roleColor + '20' }]}>
                  <ThemedText style={[s.roleBadgeText, { color: roleColor }]}>{event.role.toUpperCase()}</ThemedText>
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </View>
  );
}

// =============================================================================
// VIEW 3: MINISTRIES
// =============================================================================

function MinistriesView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View>
      <SectionHeader title="EVENTS BY MINISTRY" colors={colors} count={MINISTRY_EVENTS.length} />

      {MINISTRY_EVENTS.map((ministry) => {
        const isExpanded = expandedId === ministry.id;

        return (
          <Pressable
            key={ministry.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedId(isExpanded ? null : ministry.id);
            }}
          >
            <Card colors={colors}>
              <View style={s.ministryHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.ministryName, { color: colors.text }]}>{ministry.name}</ThemedText>
                  <ThemedText style={[s.ministryMeta, { color: colors.textSecondary }]}>
                    {ministry.upcomingCount} upcoming {'\u00B7'} Next: {ministry.nextEventDate}
                  </ThemedText>
                </View>
                <View style={[shrd.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[shrd.countText, { color: colors.textSecondary }]}>{ministry.upcomingCount}</ThemedText>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down' as any} size={12} color={colors.textTertiary} />
              </View>

              {isExpanded && (
                <View style={s.ministryExpanded}>
                  {ministry.events.map((event, idx) => (
                    <View
                      key={event.id}
                      style={[
                        s.ministryEventRow,
                        idx < ministry.events.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={[s.catDot, { backgroundColor: '#8B5CF6' }]} />
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[s.ministryEventTitle, { color: colors.text }]}>{event.title}</ThemedText>
                        <ThemedText style={[s.ministryEventMeta, { color: colors.textTertiary }]}>
                          {event.date} {'\u00B7'} {event.time}
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
  );
}

// =============================================================================
// VIEW 4: SERVICE PLAN
// =============================================================================

function ServicePlanView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(SERVICE_PLANS[0]?.id ?? null);

  return (
    <View>
      <SectionHeader title="UPCOMING SERVICE PLANS" colors={colors} count={SERVICE_PLANS.length} />

      {SERVICE_PLANS.map((plan) => {
        const isExpanded = expandedPlan === plan.id;
        const confirmedCount = plan.elements.filter((el) => el.status === 'confirmed').length;
        const tbdCount = plan.elements.filter((el) => el.status === 'TBD').length;

        return (
          <Pressable
            key={plan.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedPlan(isExpanded ? null : plan.id);
            }}
          >
            <Card colors={colors}>
              {/* Plan header */}
              <View style={s.planHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.planServiceName, { color: colors.text }]}>{plan.serviceName}</ThemedText>
                  <ThemedText style={[s.planDate, { color: colors.textSecondary }]}>{plan.date}</ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={s.planStatusRow}>
                    <View style={[s.statusBadgeSm, { backgroundColor: '#22C55E20' }]}>
                      <ThemedText style={[s.statusBadgeSmText, { color: '#22C55E' }]}>{confirmedCount} confirmed</ThemedText>
                    </View>
                    {tbdCount > 0 && (
                      <View style={[s.statusBadgeSm, { backgroundColor: '#F59E0B20' }]}>
                        <ThemedText style={[s.statusBadgeSmText, { color: '#F59E0B' }]}>{tbdCount} TBD</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down' as any} size={12} color={colors.textTertiary} />
              </View>

              {/* Worship set link */}
              {plan.worshipSetLink && (
                <Pressable
                  style={s.worshipSetLink}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="music.note.list" size={12} color="#8B5CF6" />
                  <ThemedText style={s.worshipSetLinkText} numberOfLines={1}>
                    Worship Set: {plan.worshipSetLink}
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
                </Pressable>
              )}

              {/* Expanded: order of service */}
              {isExpanded && (
                <View style={s.planExpanded}>
                  <ThemedText style={[s.planOrderLabel, { color: colors.text }]}>Order of Service:</ThemedText>
                  {plan.elements.map((element, idx) => {
                    const isConfirmed = element.status === 'confirmed';
                    const statusColor = isConfirmed ? '#22C55E' : '#F59E0B';

                    return (
                      <View
                        key={element.id}
                        style={[
                          s.elementRow,
                          idx < plan.elements.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        ]}
                      >
                        <View style={s.elementIndexCol}>
                          <ThemedText style={[s.elementIndex, { color: colors.textTertiary }]}>{idx + 1}</ThemedText>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={s.elementTitleRow}>
                            <ThemedText style={[s.elementLabel, { color: colors.text }]}>{element.label}</ThemedText>
                            <ThemedText style={[s.elementTime, { color: colors.textTertiary }]}>{element.timeAllocation}</ThemedText>
                          </View>
                          <ThemedText style={[s.elementPerson, { color: colors.textSecondary }]}>
                            {element.assignedPerson}
                          </ThemedText>
                          {element.notes ? (
                            <ThemedText style={[s.elementNotes, { color: colors.textTertiary }]} numberOfLines={1}>
                              {element.notes}
                            </ThemedText>
                          ) : null}
                        </View>
                        <View style={[s.elementStatusDot, { backgroundColor: statusColor }]} />
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// VIEW 5: VOLUNTEERS
// =============================================================================

function VolunteersView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(VOLUNTEER_EVENTS[0]?.id ?? null);

  return (
    <View>
      <SectionHeader title="VOLUNTEER MANAGEMENT" colors={colors} count={VOLUNTEER_EVENTS.length} />

      {VOLUNTEER_EVENTS.map((event) => {
        const isExpanded = expandedId === event.id;
        const coverage = COVERAGE_CONFIG[event.coverageStatus];
        const openSlots = event.slots.filter((sl) => sl.person === null).length;

        return (
          <View key={event.id}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedId(isExpanded ? null : event.id);
              }}
            >
              <Card colors={colors}>
                {/* Event header */}
                <View style={s.volHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.volEventName, { color: colors.text }]}>{event.eventName}</ThemedText>
                    <ThemedText style={[s.volDate, { color: colors.textSecondary }]}>{event.date}</ThemedText>
                  </View>
                  <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down' as any} size={12} color={colors.textTertiary} />
                </View>

                {/* Stats strip */}
                <View style={s.volStatsRow}>
                  <StatBox label="Needed" value={String(event.neededVolunteers)} colors={colors} />
                  <StatBox label="Confirmed" value={String(event.confirmed)} colors={colors} valueColor="#22C55E" />
                  <StatBox label="Pending" value={String(event.pending)} colors={colors} valueColor="#F59E0B" />
                  <StatBox label="Open" value={String(openSlots)} colors={colors} valueColor={openSlots > 0 ? '#EF4444' : '#22C55E'} />
                </View>

                {/* Coverage badge */}
                <View style={s.volCoverageRow}>
                  <IconSymbol name={coverage.icon as any} size={14} color={coverage.color} />
                  <ThemedText style={[s.volCoverageText, { color: coverage.color }]}>{coverage.label}</ThemedText>
                  <View style={s.volProgressWrap}>
                    <ProgressBar percentage={Math.round((event.confirmed / event.neededVolunteers) * 100)} color={coverage.color} colors={colors} />
                  </View>
                  <ThemedText style={[s.volCoveragePct, { color: coverage.color }]}>
                    {Math.round((event.confirmed / event.neededVolunteers) * 100)}%
                  </ThemedText>
                </View>

                {/* Expanded: all slots */}
                {isExpanded && (
                  <View style={s.volExpanded}>
                    <ThemedText style={[s.volSlotsLabel, { color: colors.text }]}>Volunteer Roster ({event.slots.length} positions):</ThemedText>
                    {event.slots.map((slot, idx) => {
                      const isFilled = slot.person !== null;
                      return (
                        <View
                          key={slot.id}
                          style={[
                            s.slotRow,
                            idx < event.slots.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                          ]}
                        >
                          <IconSymbol
                            name={isFilled ? 'checkmark.circle.fill' : 'circle' as any}
                            size={14}
                            color={isFilled ? '#22C55E' : '#EF4444'}
                          />
                          <View style={{ flex: 1 }}>
                            <ThemedText style={[s.slotRole, { color: colors.text }]}>{slot.role}</ThemedText>
                            <ThemedText style={[s.slotPerson, { color: isFilled ? colors.textSecondary : '#EF4444' }]}>
                              {slot.person ?? 'Open - Needs Volunteer'}
                            </ThemedText>
                          </View>
                          <ThemedText style={[s.slotTime, { color: colors.textTertiary }]}>{slot.shiftTime}</ThemedText>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Card>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// VIEW 6: CHECK-IN
// =============================================================================

const CHECKIN_EVENTS = [
  { id: 'ce-1', label: 'Sunday Morning Worship — 10:00 AM', capacity: 500 },
  { id: 'ce-2', label: 'Youth Service — 10:00 AM', capacity: 80 },
  { id: 'ce-3', label: 'Evening Bible Study — 7:00 PM', capacity: 150 },
];

function CheckInView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [selectedEvent, setSelectedEvent] = useState(CHECKIN_EVENTS[0].id);
  const liveNow = CHECKIN_STATIONS.some((st) => st.status === 'active');

  const currentEvent = CHECKIN_EVENTS.find((e) => e.id === selectedEvent) ?? CHECKIN_EVENTS[0];
  const totalCheckedIn = CHECKIN_STATIONS.reduce((a, b) => a + b.checkedIn, 0);
  const capacityPct = Math.round((totalCheckedIn / currentEvent.capacity) * 100);
  const capacityColor = capacityPct >= 90 ? '#EF4444' : capacityPct >= 70 ? '#F59E0B' : '#22C55E';

  return (
    <View>
      {/* Event Selector */}
      <SectionHeader title="SELECT EVENT" colors={colors} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterRowContent}>
        {CHECKIN_EVENTS.map((ev) => {
          const isActive = selectedEvent === ev.id;
          return (
            <Pressable
              key={ev.id}
              style={[s.filterPill, { backgroundColor: isActive ? colors.text + '12' : 'transparent', borderColor: isActive ? colors.text + '25' : colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedEvent(ev.id); }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? colors.text : colors.textSecondary }]}>{ev.label}</ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Live indicator */}
      {liveNow && (
        <View style={s.liveBanner}>
          <View style={s.liveDot} />
          <ThemedText style={s.liveText}>LIVE CHECK-IN ACTIVE</ThemedText>
          <ThemedText style={[s.liveServiceText, { color: 'rgba(255,255,255,0.6)' }]}>
            {currentEvent.label}
          </ThemedText>
        </View>
      )}

      {/* Live capacity counter */}
      <Card colors={colors}>
        <View style={s.capacityHeader}>
          <ThemedText style={[shrd.sectionLabel, { color: colors.textSecondary }]}>LIVE CAPACITY</ThemedText>
          <ThemedText style={[s.capacityPctLabel, { color: capacityColor }]}>{capacityPct}%</ThemedText>
        </View>
        <ProgressBar percentage={capacityPct} color={capacityColor} colors={colors} />
        <View style={[s.statsRow, { marginTop: Spacing.sm }]}>
          <StatBox label="Checked In" value={String(totalCheckedIn)} colors={colors} valueColor="#3B82F6" />
          <StatBox label="Capacity" value={String(currentEvent.capacity)} colors={colors} />
          <StatBox label="Remaining" value={String(Math.max(0, currentEvent.capacity - totalCheckedIn))} colors={colors} valueColor={capacityColor} />
        </View>
      </Card>

      {/* Stats strip */}
      <Card colors={colors}>
        <View style={s.statsRow}>
          <StatBox label="Total Checked In" value={String(CHECKIN_STATS.totalCheckedIn)} colors={colors} valueColor="#3B82F6" />
          <StatBox label="Children" value={String(CHECKIN_STATS.childrenCheckedIn)} colors={colors} valueColor="#8B5CF6" />
          <StatBox label="First-Time" value={String(CHECKIN_STATS.firstTimeVisitors)} colors={colors} valueColor="#22C55E" />
        </View>
      </Card>

      {/* New attendee quick-add */}
      {isStaffLevel(role) && (
        <>
          <SectionHeader title="QUICK ADD ATTENDEE" colors={colors} />
          <Card colors={colors}>
            <Pressable
              style={s.quickAddButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="plus.circle.fill" size={18} color="#3B82F6" />
              <ThemedText style={[s.quickAddText, { color: '#3B82F6' }]}>Add New Attendee</ThemedText>
            </Pressable>
            <ThemedText style={[s.quickAddHint, { color: colors.textTertiary }]}>
              For walk-ins or visitors not yet in the system
            </ThemedText>
          </Card>
        </>
      )}

      {/* Stations */}
      <SectionHeader title="CHECK-IN STATIONS" colors={colors} count={CHECKIN_STATIONS.length} />
      <Card colors={colors}>
        {CHECKIN_STATIONS.map((station, idx) => {
          const isActive = station.status === 'active';
          return (
            <View
              key={station.id}
              style={[
                s.stationRow,
                idx < CHECKIN_STATIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.stationDot, { backgroundColor: isActive ? '#22C55E' : '#EF4444' }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.stationName, { color: colors.text }]}>{station.name}</ThemedText>
                <ThemedText style={[s.stationStatus, { color: isActive ? '#22C55E' : '#EF4444' }]}>
                  {isActive ? 'Active' : 'Idle'}
                </ThemedText>
              </View>
              <ThemedText style={[s.stationCount, { color: colors.text }]}>{station.checkedIn}</ThemedText>
              <ThemedText style={[s.stationCountLabel, { color: colors.textTertiary }]}>checked in</ThemedText>
            </View>
          );
        })}
      </Card>

      {/* Recent check-ins */}
      <SectionHeader title="RECENT CHECK-INS" colors={colors} count={RECENT_CHECKINS.length} />
      <Card colors={colors}>
        {RECENT_CHECKINS.map((entry, idx) => {
          const typeColor = CHECKIN_TYPE_COLOR[entry.type];
          return (
            <View
              key={entry.id}
              style={[
                s.checkinRow,
                idx < RECENT_CHECKINS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.checkinName, { color: colors.text }]} numberOfLines={1}>{entry.name}</ThemedText>
                <ThemedText style={[s.checkinLocation, { color: colors.textTertiary }]}>{entry.location}</ThemedText>
              </View>
              <View style={[s.checkinTypeBadge, { backgroundColor: typeColor + '20' }]}>
                <ThemedText style={[s.checkinTypeText, { color: typeColor }]}>{entry.type.toUpperCase()}</ThemedText>
              </View>
              <ThemedText style={[s.checkinTime, { color: colors.textSecondary }]}>{entry.time}</ThemedText>
            </View>
          );
        })}
      </Card>
    </View>
  );
}

// =============================================================================
// VIEW 7: ATTENDANCE & FOLLOW-UP
// =============================================================================

function AttendanceView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [typeFilter, setTypeFilter] = useState<FollowUpType | 'all'>('all');

  // Attendance chart data
  const maxAttendance = Math.max(...WEEKLY_ATTENDANCE.map((w) => w.attendance));
  const avgAttendance = Math.round(WEEKLY_ATTENDANCE.reduce((a, b) => a + b.attendance, 0) / WEEKLY_ATTENDANCE.length);

  // Follow-up filtering
  const filteredFollowUp = typeFilter === 'all'
    ? FOLLOWUP_ITEMS
    : FOLLOWUP_ITEMS.filter((item) => item.type === typeFilter);

  // Summary counts
  const firstTimeCount = FOLLOWUP_ITEMS.filter((i) => i.type === 'first-time').length;
  const absentCount = FOLLOWUP_ITEMS.filter((i) => i.type === 'absent').length;
  const returningCount = FOLLOWUP_ITEMS.filter((i) => i.type === 'returning').length;
  const pendingCount = FOLLOWUP_ITEMS.filter((i) => i.status === 'pending').length;

  return (
    <View>
      {/* Attendance summary */}
      <Card colors={colors}>
        <View style={s.statsRow}>
          <StatBox label="6-Week Avg" value={String(avgAttendance)} colors={colors} valueColor="#3B82F6" />
          <StatBox label="Last Sunday" value={String(WEEKLY_ATTENDANCE[WEEKLY_ATTENDANCE.length - 1]?.attendance ?? 0)} colors={colors} />
          <StatBox label="Peak" value={String(maxAttendance)} colors={colors} valueColor="#22C55E" />
          <StatBox label="Pending F/U" value={String(pendingCount)} colors={colors} valueColor="#F59E0B" />
        </View>
      </Card>

      {/* Weekly attendance chart (mock bar chart) */}
      <SectionHeader title="WEEKLY ATTENDANCE TREND" colors={colors} />
      <Card colors={colors}>
        <View style={s.chartContainer}>
          {WEEKLY_ATTENDANCE.map((week, idx) => {
            const barHeight = Math.round((week.attendance / maxAttendance) * 80);
            return (
              <View key={idx} style={s.chartBarWrap}>
                <ThemedText style={[s.chartBarValue, { color: colors.textSecondary }]}>{week.attendance}</ThemedText>
                <View style={[s.chartBar, { height: barHeight, backgroundColor: '#3B82F6' }]} />
                <ThemedText style={[s.chartBarLabel, { color: colors.textTertiary }]}>{week.week}</ThemedText>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Attendance breakdown (last Sunday) */}
      <SectionHeader title="LAST SUNDAY BREAKDOWN" colors={colors} />
      <Card colors={colors}>
        {ATTENDANCE_BREAKDOWN.map((item, idx) => {
          const pct = Math.round((item.value / (WEEKLY_ATTENDANCE[WEEKLY_ATTENDANCE.length - 1]?.attendance ?? 1)) * 100);
          return (
            <View
              key={idx}
              style={[
                s.breakdownRow,
                idx < ATTENDANCE_BREAKDOWN.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.breakdownDot, { backgroundColor: item.color }]} />
              <ThemedText style={[s.breakdownLabel, { color: colors.textSecondary }]}>{item.label}</ThemedText>
              <View style={s.breakdownBarWrap}>
                <ProgressBar percentage={pct} color={item.color} colors={colors} />
              </View>
              <ThemedText style={[s.breakdownValue, { color: colors.text }]}>{item.value}</ThemedText>
            </View>
          );
        })}
      </Card>

      {/* Service-by-service attendance */}
      <SectionHeader title="ATTENDANCE BY SERVICE" colors={colors} count={SERVICE_ATTENDANCE.length} />
      <Card colors={colors}>
        {SERVICE_ATTENDANCE.map((svc, idx) => {
          const fillPct = Math.round((svc.attendance / svc.capacity) * 100);
          const fillColor = fillPct >= 80 ? '#F59E0B' : fillPct >= 50 ? '#3B82F6' : '#8F8F8F';
          return (
            <View
              key={svc.id}
              style={[
                s.svcAttRow,
                idx < SERVICE_ATTENDANCE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.svcAttName, { color: colors.text }]}>{svc.service}</ThemedText>
                <ThemedText style={[s.svcAttTime, { color: colors.textTertiary }]}>{svc.time}</ThemedText>
              </View>
              <View style={s.svcAttBarWrap}>
                <ProgressBar percentage={fillPct} color={fillColor} colors={colors} />
              </View>
              <View style={s.svcAttNumbers}>
                <ThemedText style={[s.svcAttCount, { color: colors.text }]}>{svc.attendance}</ThemedText>
                <ThemedText style={[s.svcAttCapacity, { color: colors.textTertiary }]}>/ {svc.capacity}</ThemedText>
              </View>
            </View>
          );
        })}
      </Card>

      {/* Follow-up queue */}
      <SectionHeader title="FOLLOW-UP QUEUE" colors={colors} count={FOLLOWUP_ITEMS.length} />

      {/* Summary strip */}
      <Card colors={colors}>
        <View style={s.statsRow}>
          <StatBox label="First-Time" value={String(firstTimeCount)} colors={colors} valueColor="#22C55E" />
          <StatBox label="Absent (3+ wk)" value={String(absentCount)} colors={colors} valueColor="#F59E0B" />
          <StatBox label="Returning" value={String(returningCount)} colors={colors} valueColor="#3B82F6" />
        </View>
      </Card>

      {/* Type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterRowContent}>
        {(['all', 'first-time', 'absent', 'returning'] as const).map((ft) => {
          const isActive = typeFilter === ft;
          const chipColor = ft === 'all' ? colors.text : FOLLOWUP_TYPE_COLOR[ft as FollowUpType] || colors.text;
          return (
            <Pressable
              key={ft}
              style={[
                s.filterPill,
                {
                  backgroundColor: isActive ? chipColor + '15' : 'transparent',
                  borderColor: isActive ? chipColor + '30' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTypeFilter(ft);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? chipColor : colors.textSecondary }]}>
                {ft === 'all' ? 'All' : ft.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Follow-up items */}
      {filteredFollowUp.map((item) => {
        const typeColor = FOLLOWUP_TYPE_COLOR[item.type];
        const statusColor = FOLLOWUP_STATUS_COLOR[item.status];

        return (
          <Card key={item.id} colors={colors}>
            <View style={s.fuHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.fuName, { color: colors.text }]}>{item.name}</ThemedText>
                <ThemedText style={[s.fuMeta, { color: colors.textTertiary }]}>
                  {item.event} {'\u00B7'} Last: {item.lastAttendance}
                </ThemedText>
                <ThemedText style={[s.fuMeta, { color: colors.textTertiary }]}>
                  Assigned: {item.assignedTo}
                </ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={[s.fuTypeBadge, { backgroundColor: typeColor + '20' }]}>
                  <ThemedText style={[s.fuTypeText, { color: typeColor }]}>
                    {item.type.replace(/-/g, ' ').toUpperCase()}
                  </ThemedText>
                </View>
                <View style={[s.fuStatusBadge, { backgroundColor: statusColor + '20' }]}>
                  <View style={[s.fuStatusDot, { backgroundColor: statusColor }]} />
                  <ThemedText style={[s.fuStatusText, { color: statusColor }]}>
                    {item.status.replace(/-/g, ' ').toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
            {item.notes ? (
              <View style={s.fuNotesRow}>
                <IconSymbol name="note.text" size={10} color={colors.textTertiary} />
                <ThemedText style={[s.fuNotesText, { color: colors.textTertiary }]} numberOfLines={2}>
                  {item.notes}
                </ThemedText>
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchEvents({ colors, role = 'C1', onSwitchTab }: Props) {
  const visibleViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<EventsView>(visibleViews[0]?.id ?? 'browse');

  // If the active view is no longer visible for this role, resolve to first available
  const currentView = visibleViews.find((v) => v.id === activeView) ? activeView : visibleViews[0]?.id ?? 'browse';

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* View toggle pills */}
      {visibleViews.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.pillBar}
          contentContainerStyle={s.pillBarContent}
        >
          {visibleViews.map((view) => {
            const isActive = currentView === view.id;
            return (
              <Pressable
                key={view.id}
                style={[
                  s.viewPill,
                  {
                    backgroundColor: isActive ? colors.text + '12' : 'transparent',
                    borderColor: isActive ? colors.text + '25' : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveView(view.id);
                }}
              >
                <ThemedText style={[s.viewPillText, { color: isActive ? colors.text : colors.textSecondary }]}>
                  {view.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Active view content */}
      {currentView === 'browse' && <BrowseView colors={colors} role={role} />}
      {currentView === 'my-events' && <MyEventsView colors={colors} role={role} />}
      {currentView === 'ministries' && <MinistriesView colors={colors} role={role} />}
      {currentView === 'service-plan' && <ServicePlanView colors={colors} role={role} />}
      {currentView === 'volunteers' && <VolunteersView colors={colors} role={role} />}
      {currentView === 'check-in' && <CheckInView colors={colors} role={role} />}
      {currentView === 'attendance' && <AttendanceView colors={colors} role={role} />}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  bottomSpacer: { height: 120 },

  // Pill bar
  pillBar: { marginBottom: Spacing.md },
  pillBarContent: { gap: 8, paddingRight: Spacing.md },
  viewPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  viewPillText: { fontSize: 12, fontWeight: '600' },

  // Filter pills (reusable)
  filterRow: { marginBottom: Spacing.sm },
  filterRowContent: { gap: 8, paddingRight: Spacing.md },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: Spacing.lg },

  // Stats row
  statsRow: { flexDirection: 'row', gap: Spacing.sm },

  // Status badges
  statusBadgeSm: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  statusBadgeSmText: { fontSize: 9, fontWeight: '600' },

  // Featured card
  featuredCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: 4,
  },
  featuredCatBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  featuredCatText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  featuredTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  featuredSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500', marginBottom: 12 },
  featuredDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  featuredDetailText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  featuredRegRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  featuredRegBadge: { backgroundColor: 'rgba(34,197,94,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  featuredRegText: { color: '#22C55E', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  featuredSpotsText: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },

  // ============= Browse View =============
  browseBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  visBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  visBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  rsvpButton: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm, marginLeft: 'auto' },
  rsvpButtonText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  browseHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  catDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  browseTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  browseDatetime: { fontSize: 12 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  typeBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  browseDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 16 },
  browseDetailText: { fontSize: 12 },
  browseBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 16, marginTop: 6 },
  regBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  regDot: { width: 5, height: 5, borderRadius: 2.5 },
  regText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  capacityText: { fontSize: 11, fontWeight: '500', marginLeft: 'auto' },

  // ============= My Events View =============
  myEventHeader: { flexDirection: 'row', gap: Spacing.sm },
  myEventTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  myEventDate: { fontSize: 12 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  roleBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  rsvpBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  rsvpDot: { width: 5, height: 5, borderRadius: 2.5 },
  rsvpText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  reminderText: { fontSize: 11, fontWeight: '500' },
  pastToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  pastRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  pastTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  pastDate: { fontSize: 11 },

  // ============= Ministries View =============
  ministryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ministryName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  ministryMeta: { fontSize: 12 },
  ministryExpanded: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  ministryEventRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  ministryEventTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  ministryEventMeta: { fontSize: 11 },

  // ============= Service Plan View =============
  worshipSetLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  worshipSetLinkText: { flex: 1, fontSize: 12, fontWeight: '500', color: '#8B5CF6' },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  planServiceName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  planDate: { fontSize: 12 },
  planStatusRow: { flexDirection: 'row', gap: 4 },
  planExpanded: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  planOrderLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  elementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8 },
  elementIndexCol: { width: 20, alignItems: 'center' },
  elementIndex: { fontSize: 11, fontWeight: '700' },
  elementTitleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  elementLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  elementTime: { fontSize: 10, fontWeight: '500' },
  elementPerson: { fontSize: 12, marginBottom: 2 },
  elementNotes: { fontSize: 11, fontStyle: 'italic' },
  elementStatusDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },

  // ============= Volunteers View =============
  volHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  volEventName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  volDate: { fontSize: 12 },
  volStatsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  volCoverageRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  volCoverageText: { fontSize: 12, fontWeight: '600' },
  volProgressWrap: { flex: 1 },
  volCoveragePct: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  volExpanded: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  volSlotsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  slotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8 },
  slotRole: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  slotPerson: { fontSize: 12 },
  slotTime: { fontSize: 10, fontWeight: '500' },

  // ============= Check-In View =============
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  capacityPctLabel: { fontSize: 16, fontWeight: '800' },
  quickAddButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  quickAddText: { fontSize: 14, fontWeight: '600' },
  quickAddHint: { fontSize: 11, marginTop: 4 },
  liveBanner: {
    backgroundColor: '#22C55E20',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  liveText: { color: '#22C55E', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  liveServiceText: { fontSize: 11 },
  stationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  stationDot: { width: 8, height: 8, borderRadius: 4 },
  stationName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  stationStatus: { fontSize: 11, fontWeight: '500' },
  stationCount: { fontSize: 16, fontWeight: '700' },
  stationCountLabel: { fontSize: 10, width: 55 },
  checkinRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  checkinName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  checkinLocation: { fontSize: 11 },
  checkinTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  checkinTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  checkinTime: { fontSize: 11, fontWeight: '500', width: 56, textAlign: 'right' },

  // ============= Attendance & Follow-Up View =============
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, paddingTop: Spacing.sm },
  chartBarWrap: { alignItems: 'center', gap: 4, flex: 1 },
  chartBarValue: { fontSize: 10, fontWeight: '600' },
  chartBar: { width: 24, borderRadius: 4 },
  chartBarLabel: { fontSize: 9, fontWeight: '500' },
  fuHeader: { flexDirection: 'row', gap: Spacing.sm },
  fuName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  fuMeta: { fontSize: 11 },
  fuTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  fuTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  fuStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  fuStatusDot: { width: 5, height: 5, borderRadius: 2.5 },
  fuStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  fuNotesRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  fuNotesText: { flex: 1, fontSize: 11, fontStyle: 'italic' },

  // Attendance breakdown
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 12, width: 110 },
  breakdownBarWrap: { flex: 1 },
  breakdownValue: { fontSize: 14, fontWeight: '700', width: 36, textAlign: 'right' },

  // Service attendance
  svcAttRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  svcAttName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  svcAttTime: { fontSize: 11 },
  svcAttBarWrap: { width: 80 },
  svcAttNumbers: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  svcAttCount: { fontSize: 14, fontWeight: '700' },
  svcAttCapacity: { fontSize: 11 },
});
