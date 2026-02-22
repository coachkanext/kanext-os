/**
 * ChurchCalendar — Calendar tab for Church Home.
 * 4 view pills: Agenda | Services | News | Calendar
 *
 * RBAC:
 *   C1/C2/C3 — All 4 views, full detail
 *   C4       — Agenda, Services, News (no calendar grid)
 *   C5       — Services + News only
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
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isElderLevel,
  isStaffLevel,
} from '@/utils/church-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}

type CalendarView = 'agenda' | 'services' | 'news' | 'calendar';

interface ViewDef { id: CalendarView; label: string }

// =============================================================================
// VIEW PILL DEFINITIONS (RBAC-gated)
// =============================================================================

const ALL_VIEWS: ViewDef[] = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'services', label: 'Services' },
  { id: 'news', label: 'News' },
  { id: 'calendar', label: 'Calendar' },
];

function getAvailableViews(role: ChurchRoleLens): ViewDef[] {
  // C5: Services + News only
  if (role === 'C5') return ALL_VIEWS.filter((v) => v.id === 'services' || v.id === 'news');
  // C4: Agenda, Services, News (no calendar grid)
  if (role === 'C4') return ALL_VIEWS.filter((v) => v.id !== 'calendar');
  // C1/C2/C3: All 4 views
  return ALL_VIEWS;
}

// =============================================================================
// INLINE MOCK DATA — AGENDA
// =============================================================================

type AgendaEventType = 'service' | 'ministry' | 'class' | 'volunteer' | 'deadline' | 'facility';

interface AgendaEvent {
  id: string;
  time: string;
  endTime: string;
  title: string;
  type: AgendaEventType;
  location?: string;
  assignedTo?: string;
  notes?: string;
  staffOnly?: boolean;
  leaderOnly?: boolean;
  isBlocked?: boolean;
  decisionRequired?: boolean;
  dueWithin24h?: boolean;
}

function sortAgendaByPriority(events: AgendaEvent[]): AgendaEvent[] {
  return [...events].sort((a, b) => {
    const scoreA = (a.isBlocked ? 100 : 0) + (a.decisionRequired ? 50 : 0) + (a.dueWithin24h ? 25 : 0) + (a.type === 'service' ? 10 : 0);
    const scoreB = (b.isBlocked ? 100 : 0) + (b.decisionRequired ? 50 : 0) + (b.dueWithin24h ? 25 : 0) + (b.type === 'service' ? 10 : 0);
    return scoreB - scoreA;
  });
}

const EVENT_TYPE_COLOR: Record<AgendaEventType, string> = {
  service: '#8B5CF6',
  ministry: '#3B82F6',
  class: '#22C55E',
  volunteer: '#F97316',
  deadline: '#EF4444',
  facility: '#8F8F8F',
};

const EVENT_TYPE_LABEL: Record<AgendaEventType, string> = {
  service: 'SERVICE',
  ministry: 'MINISTRY',
  class: 'CLASS',
  volunteer: 'VOLUNTEER',
  deadline: 'DEADLINE',
  facility: 'FACILITY',
};

const TODAY_AGENDA: AgendaEvent[] = [
  { id: 'ca-1', time: '6:00 AM', endTime: '6:45 AM', title: 'Pastoral Prayer Walk', type: 'service', location: 'Main Sanctuary', assignedTo: 'Pastor Carter', leaderOnly: true },
  { id: 'ca-2', time: '7:00 AM', endTime: '7:30 AM', title: 'AV System Check & Sound Test', type: 'facility', location: 'Main Sanctuary', assignedTo: 'Media Team', staffOnly: true, isBlocked: true },
  { id: 'ca-3', time: '7:30 AM', endTime: '8:00 AM', title: 'Worship Team Rehearsal (Early)', type: 'volunteer', location: 'Main Sanctuary', assignedTo: 'Worship Team' },
  { id: 'ca-4', time: '8:00 AM', endTime: '9:15 AM', title: 'Sunday Early Service', type: 'service', location: 'Main Sanctuary', assignedTo: 'Pastor Carter', notes: 'Communion Sunday' },
  { id: 'ca-5', time: '9:15 AM', endTime: '9:45 AM', title: 'Greeter & Usher Setup', type: 'volunteer', location: 'Lobby / Entrance', assignedTo: 'Hospitality Team' },
  { id: 'ca-6', time: '9:30 AM', endTime: '9:50 AM', title: "Children's Ministry Room Prep", type: 'facility', location: 'Children\'s Wing', assignedTo: 'Kids Ministry Lead' },
  { id: 'ca-7', time: '10:00 AM', endTime: '11:30 AM', title: 'Sunday Main Worship', type: 'service', location: 'Main Sanctuary', assignedTo: 'Pastor Carter', notes: 'Sermon: "Walking by Faith" — Hebrews 11' },
  { id: 'ca-8', time: '10:00 AM', endTime: '11:30 AM', title: "Children's Church", type: 'ministry', location: 'Children\'s Wing', assignedTo: 'Sis. Adeola Johnson' },
  { id: 'ca-9', time: '11:30 AM', endTime: '12:00 PM', title: 'New Members Meet & Greet', type: 'ministry', location: 'Fellowship Hall', assignedTo: 'Assimilation Team' },
  { id: 'ca-10', time: '12:00 PM', endTime: '12:00 PM', title: 'Bulletin Submission Deadline', type: 'deadline', notes: 'All announcements for next Sunday due by noon today', staffOnly: true, dueWithin24h: true },
  { id: 'ca-11', time: '4:00 PM', endTime: '5:30 PM', title: 'New Believers Class (Session 4)', type: 'class', location: 'Room 201', assignedTo: 'Min. David Okafor', notes: 'Topic: "The Power of Prayer"' },
  { id: 'ca-12', time: '6:00 PM', endTime: '7:30 PM', title: 'Sunday Evening Service', type: 'service', location: 'Main Sanctuary', assignedTo: 'Associate Pastor' },
];

const TOMORROW_AGENDA: AgendaEvent[] = [
  { id: 'ca-t1', time: '6:00 PM', endTime: '7:30 PM', title: "Men's Bible Study", type: 'class', location: 'Room 103', assignedTo: 'Bro. Marcus Williams', notes: 'Book of James — Chapter 3' },
  { id: 'ca-t2', time: '7:00 PM', endTime: '8:30 PM', title: 'Worship Team Practice', type: 'volunteer', location: 'Main Sanctuary', assignedTo: 'Worship Director' },
  { id: 'ca-t3', time: '7:00 PM', endTime: '8:00 PM', title: 'Elder Board Financial Review', type: 'deadline', location: 'Board Room', assignedTo: 'Finance Committee', leaderOnly: true, notes: 'Monthly financial statements review', decisionRequired: true },
];

const THIS_WEEK_AGENDA: AgendaEvent[] = [
  { id: 'ca-w1', time: '10:00 AM', endTime: '11:30 AM', title: "Women's Prayer Circle", type: 'ministry', location: 'Prayer Room', assignedTo: 'Sis. Grace Adeyemi', notes: 'Tuesday' },
  { id: 'ca-w2', time: '7:00 PM', endTime: '8:30 PM', title: 'Choir Rehearsal', type: 'volunteer', location: 'Music Room', assignedTo: 'Choir Director', notes: 'Tuesday' },
  { id: 'ca-w3', time: '7:00 PM', endTime: '8:30 PM', title: 'Midweek Bible Study & Prayer', type: 'service', location: 'Main Sanctuary', assignedTo: 'Pastor Carter', notes: 'Wednesday — "Spiritual Warfare" series' },
  { id: 'ca-w4', time: '6:30 PM', endTime: '8:00 PM', title: 'Youth Group Night', type: 'ministry', location: 'Youth Center', assignedTo: 'Youth Pastor T. Banks', notes: 'Thursday' },
  { id: 'ca-w5', time: '5:00 PM', endTime: '5:00 PM', title: 'Easter Planning Docs Due', type: 'deadline', notes: 'Thursday — All ministry heads submit Easter event proposals', staffOnly: true, dueWithin24h: true, decisionRequired: true },
  { id: 'ca-w6', time: '7:00 PM', endTime: '9:00 PM', title: 'Friday Night Worship', type: 'service', location: 'Main Sanctuary', assignedTo: 'Worship Director', notes: 'Friday' },
  { id: 'ca-w7', time: '9:00 AM', endTime: '12:00 PM', title: 'Community Outreach — Food Distribution', type: 'ministry', location: 'Parking Lot / Fellowship Hall', assignedTo: 'Outreach Team', notes: 'Saturday' },
  { id: 'ca-w8', time: '10:00 AM', endTime: '12:00 PM', title: 'Sanctuary Deep Clean & Setup', type: 'facility', location: 'Main Sanctuary', assignedTo: 'Facilities Team', notes: 'Saturday', staffOnly: true },
];

const NEXT_WEEK_AGENDA: AgendaEvent[] = [
  { id: 'ca-n1', time: '8:00 AM', endTime: '9:15 AM', title: 'Sunday Early Service', type: 'service', location: 'Main Sanctuary', notes: 'Next Sunday' },
  { id: 'ca-n2', time: '10:00 AM', endTime: '11:30 AM', title: 'Sunday Main Worship', type: 'service', location: 'Main Sanctuary', notes: 'Next Sunday — Guest Speaker: Bishop Carter' },
  { id: 'ca-n3', time: '6:00 PM', endTime: '8:00 PM', title: 'Singles Ministry Mixer', type: 'ministry', location: 'Fellowship Hall', notes: 'Next Friday' },
  { id: 'ca-n4', time: '9:00 AM', endTime: '3:00 PM', title: 'Leadership Retreat (Staff)', type: 'class', location: 'Conference Center', assignedTo: 'Pastor Carter', notes: 'Next Saturday', staffOnly: true },
];

// =============================================================================
// INLINE MOCK DATA — SERVICES
// =============================================================================

type ConfirmStatus = 'confirmed' | 'partial' | 'pending';

interface ServiceTeam {
  name: string;
  status: ConfirmStatus;
  lead?: string;
}

interface ServiceEntry {
  id: string;
  name: string;
  day: string;
  time: string;
  campus: string;
  expectedAttendance: number;
  readinessScore: number;
  worshipLeader: string;
  pastor: string;
  teams: ServiceTeam[];
  staffGap?: string;
  keyAssets: { name: string; status: 'ready' | 'pending' | 'issue' }[];
}

const CONFIRM_COLOR: Record<ConfirmStatus, string> = {
  confirmed: '#22C55E',
  partial: '#F59E0B',
  pending: '#EF4444',
};

const WEEKLY_SERVICES: ServiceEntry[] = [
  {
    id: 'svc-1',
    name: 'Sunday Early Service',
    day: 'Sunday',
    time: '8:00 AM',
    campus: 'Main Campus',
    expectedAttendance: 180,
    readinessScore: 82,
    worshipLeader: 'Min. Sarah Owens',
    pastor: 'Pastor Carter',
    teams: [
      { name: 'Worship', status: 'confirmed', lead: 'Min. Sarah Owens' },
      { name: 'AV / Media', status: 'confirmed', lead: 'Bro. James Obi' },
      { name: 'Ushers', status: 'confirmed', lead: 'Dea. Frank Mensah' },
      { name: "Children's", status: 'partial', lead: 'Sis. Adeola Johnson' },
    ],
    staffGap: "Children's ministry needs 1 more volunteer",
    keyAssets: [
      { name: 'Sermon Slides', status: 'ready' },
      { name: 'Worship Charts', status: 'ready' },
      { name: 'Kids Curriculum', status: 'pending' },
      { name: 'Livestream', status: 'ready' },
    ],
  },
  {
    id: 'svc-2',
    name: 'Sunday Main Worship',
    day: 'Sunday',
    time: '10:00 AM',
    campus: 'Main Campus',
    expectedAttendance: 450,
    readinessScore: 74,
    worshipLeader: 'Min. Sarah Owens',
    pastor: 'Pastor Carter',
    teams: [
      { name: 'Worship', status: 'confirmed', lead: 'Min. Sarah Owens' },
      { name: 'AV / Media', status: 'confirmed', lead: 'Bro. James Obi' },
      { name: 'Ushers', status: 'confirmed', lead: 'Dea. Frank Mensah' },
      { name: "Children's", status: 'confirmed', lead: 'Sis. Adeola Johnson' },
      { name: 'Greeting', status: 'confirmed', lead: 'Sis. Angela Parks' },
      { name: 'Parking', status: 'partial', lead: 'Bro. Tony Elam' },
    ],
    staffGap: 'Parking team needs 2 more volunteers',
    keyAssets: [
      { name: 'Sermon Slides', status: 'ready' },
      { name: 'Worship Charts', status: 'ready' },
      { name: 'Kids Curriculum', status: 'ready' },
      { name: 'Livestream', status: 'issue' },
      { name: 'Parking Plan', status: 'pending' },
    ],
  },
  {
    id: 'svc-3',
    name: 'Sunday Evening Service',
    day: 'Sunday',
    time: '6:00 PM',
    campus: 'Main Campus',
    expectedAttendance: 120,
    readinessScore: 65,
    worshipLeader: 'Min. David Okafor',
    pastor: 'Associate Pastor',
    teams: [
      { name: 'Worship', status: 'confirmed', lead: 'Min. David Okafor' },
      { name: 'AV / Media', status: 'pending', lead: 'TBD' },
      { name: 'Ushers', status: 'confirmed', lead: 'Dea. Frank Mensah' },
    ],
    staffGap: 'AV operator not yet assigned',
    keyAssets: [
      { name: 'Sermon Slides', status: 'pending' },
      { name: 'Worship Charts', status: 'ready' },
    ],
  },
  {
    id: 'svc-4',
    name: 'Wednesday Midweek Service',
    day: 'Wednesday',
    time: '7:00 PM',
    campus: 'Main Campus',
    expectedAttendance: 200,
    readinessScore: 95,
    worshipLeader: 'Min. Sarah Owens',
    pastor: 'Pastor Carter',
    teams: [
      { name: 'Worship', status: 'confirmed', lead: 'Min. Sarah Owens' },
      { name: 'AV / Media', status: 'confirmed', lead: 'Bro. James Obi' },
      { name: 'Ushers', status: 'confirmed', lead: 'Bro. Paul Adekunle' },
    ],
    keyAssets: [
      { name: 'Study Notes', status: 'ready' },
      { name: 'Worship Charts', status: 'ready' },
    ],
  },
  {
    id: 'svc-5',
    name: 'Friday Night Worship',
    day: 'Friday',
    time: '7:00 PM',
    campus: 'Main Campus',
    expectedAttendance: 150,
    readinessScore: 88,
    worshipLeader: 'Min. David Okafor',
    pastor: 'Youth Pastor T. Banks',
    teams: [
      { name: 'Worship', status: 'confirmed', lead: 'Min. David Okafor' },
      { name: 'AV / Media', status: 'partial', lead: 'Bro. James Obi' },
      { name: 'Youth Greeters', status: 'confirmed', lead: 'Sis. Tasha Lewis' },
    ],
    staffGap: 'Need backup camera operator',
    keyAssets: [
      { name: 'Worship Charts', status: 'ready' },
      { name: 'Youth Slides', status: 'ready' },
    ],
  },
];

// =============================================================================
// INLINE MOCK DATA — NEWS
// =============================================================================

type NewsCategory = 'announcement' | 'event' | 'testimony' | 'update';

type NewsAction = 'RSVP' | 'Serve' | 'Give' | 'Join' | 'Learn More';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  author: string;
  authorRole: string;
  preview: string;
  category: NewsCategory;
  appliesToDate?: string;
  actionCta?: NewsAction;
}

const NEWS_CATEGORY_COLOR: Record<NewsCategory, string> = {
  announcement: '#3B82F6',
  event: '#8B5CF6',
  testimony: '#F59E0B',
  update: '#22C55E',
};

const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  announcement: 'ANNOUNCEMENT',
  event: 'EVENT',
  testimony: 'TESTIMONY',
  update: 'UPDATE',
};

const CHURCH_NEWS: NewsItem[] = [
  {
    id: 'nw-1',
    title: 'Easter 2026 Planning — All Hands Meeting',
    date: 'Feb 18, 2026',
    author: 'Pastor Carter',
    authorRole: 'Senior Pastor',
    preview: 'All ministry leaders, please mark your calendars for our Easter planning meeting this Saturday at 10 AM. We will finalize service times, volunteer assignments, outreach events, and the Easter production schedule.',
    category: 'announcement',
    appliesToDate: 'Feb 22, 2026',
    actionCta: 'RSVP',
  },
  {
    id: 'nw-2',
    title: 'New Small Group Launch — "Faith in the Marketplace"',
    date: 'Feb 17, 2026',
    author: 'Min. David Okafor',
    authorRole: 'Small Groups Director',
    preview: 'Excited to announce a new small group for working professionals starting March 4th. We will meet every Wednesday at 6 PM in Room 103 to discuss integrating faith into our professional lives.',
    category: 'event',
    appliesToDate: 'Mar 4 – ongoing',
    actionCta: 'Join',
  },
  {
    id: 'nw-3',
    title: 'Mission Trip Report — Honduras 2026',
    date: 'Feb 16, 2026',
    author: 'Sis. Grace Adeyemi',
    authorRole: 'Missions Director',
    preview: 'Our team of 12 just returned from Tegucigalpa where we served over 500 families through medical clinics, VBS for children, and community development. God moved mightily — 47 people gave their lives to Christ.',
    category: 'testimony',
  },
  {
    id: 'nw-4',
    title: 'Baptism Celebration — March 1st',
    date: 'Feb 15, 2026',
    author: 'Associate Pastor',
    authorRole: 'Pastoral Staff',
    preview: 'We are thrilled to celebrate baptism with 8 new believers during the March 1st main worship service. If you have not yet been baptized and would like to participate, please contact the church office.',
    category: 'announcement',
    appliesToDate: 'Mar 1, 2026',
    actionCta: 'RSVP',
  },
  {
    id: 'nw-5',
    title: 'Building Fund Update — Phase 2 at 67%',
    date: 'Feb 14, 2026',
    author: 'Dea. Frank Mensah',
    authorRole: 'Finance Committee Chair',
    preview: 'Praise God! Our Building Fund has reached $670,000 of our $1M Phase 2 goal for the Youth Center expansion. We are on track to break ground in August 2026. Thank you for your generous giving.',
    category: 'update',
    actionCta: 'Give',
  },
  {
    id: 'nw-6',
    title: 'Youth Summer Camp Registration Now Open',
    date: 'Feb 13, 2026',
    author: 'Youth Pastor T. Banks',
    authorRole: 'Youth Ministry',
    preview: 'Camp Springs 2026 is June 15-19! Early bird registration is $175 (regular $225). Scholarships available. Sign up at the youth desk or online. Space is limited to 80 campers.',
    category: 'event',
    appliesToDate: 'Jun 15–19, 2026',
    actionCta: 'RSVP',
  },
  {
    id: 'nw-7',
    title: "Women's Conference 2026 — \"Crowned with Purpose\"",
    date: 'Feb 12, 2026',
    author: 'Sis. Angela Parks',
    authorRole: 'Women\'s Ministry Director',
    preview: 'Save the date! March 7-8 in the Main Sanctuary. Keynote speaker: Pastor Lisa Thompson from Grace Community Church. Breakout sessions, worship, and fellowship. Registration: $35.',
    category: 'event',
  },
  {
    id: 'nw-8',
    title: "Men's Retreat — Iron Sharpens Iron",
    date: 'Feb 10, 2026',
    author: 'Bro. Marcus Williams',
    authorRole: "Men's Ministry Leader",
    preview: 'Join us April 17-19 at Mountain Lodge for a weekend of worship, teaching, and brotherhood. Speaker: Coach Robert James. Activities include hiking, basketball, and fireside devotions. Cost: $150.',
    category: 'event',
  },
  {
    id: 'nw-9',
    title: 'Volunteer Appreciation Sunday — Thank You!',
    date: 'Feb 9, 2026',
    author: 'Pastor Carter',
    authorRole: 'Senior Pastor',
    preview: 'Last Sunday we honored over 120 volunteers who faithfully serve across 15 ministries. Your dedication to the body of Christ does not go unnoticed. You are the hands and feet of Jesus in our community.',
    category: 'testimony',
  },
  {
    id: 'nw-10',
    title: 'Parking Lot Expansion Complete',
    date: 'Feb 8, 2026',
    author: 'Bro. Tony Elam',
    authorRole: 'Facilities Manager',
    preview: 'The north parking lot expansion is now open with 60 additional spaces. New LED lighting and accessible paths have been installed. Please use the new north entrance for overflow parking.',
    category: 'update',
  },
];

// =============================================================================
// INLINE MOCK DATA — CALENDAR GRID (FEBRUARY 2026)
// =============================================================================

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: { title: string; type: AgendaEventType }[];
}

function buildFebruary2026(): CalendarDay[] {
  const days: CalendarDay[] = [];
  // Feb 1, 2026 is a Sunday (weekday index 0). No leading blank days needed.
  for (let d = 1; d <= 28; d++) {
    const events: { title: string; type: AgendaEventType }[] = [];

    // Sundays: 1, 8, 15, 22
    if (d === 1 || d === 8 || d === 15 || d === 22) {
      events.push({ title: 'Sunday Early Service', type: 'service' });
      events.push({ title: 'Sunday Main Worship', type: 'service' });
      events.push({ title: 'Evening Service', type: 'service' });
    }
    // Wednesdays: 4, 11, 18, 25
    if (d === 4 || d === 11 || d === 18 || d === 25) {
      events.push({ title: 'Midweek Service', type: 'service' });
    }
    // Fridays: 6, 13, 20, 27
    if (d === 6 || d === 13 || d === 20 || d === 27) {
      events.push({ title: 'Friday Night Worship', type: 'service' });
    }
    // Specific events
    if (d === 2) events.push({ title: "Men's Bible Study", type: 'class' });
    if (d === 3) events.push({ title: "Women's Prayer", type: 'ministry' }, { title: 'Choir Rehearsal', type: 'volunteer' });
    if (d === 5) events.push({ title: 'Youth Group', type: 'ministry' });
    if (d === 7) events.push({ title: 'Community Outreach', type: 'ministry' });
    if (d === 9) events.push({ title: "Men's Bible Study", type: 'class' });
    if (d === 10) events.push({ title: "Women's Prayer", type: 'ministry' });
    if (d === 12) events.push({ title: 'Youth Group', type: 'ministry' }, { title: 'Easter Planning Docs Due', type: 'deadline' });
    if (d === 14) events.push({ title: "Valentine's Day Fellowship", type: 'ministry' });
    if (d === 16) events.push({ title: "Men's Bible Study", type: 'class' });
    if (d === 17) events.push({ title: "Women's Prayer", type: 'ministry' }, { title: 'Choir Rehearsal', type: 'volunteer' });
    if (d === 18) events.push({ title: 'New Believers Class', type: 'class' }, { title: 'Bulletin Deadline', type: 'deadline' });
    if (d === 19) events.push({ title: 'Youth Group', type: 'ministry' });
    if (d === 21) events.push({ title: 'Community Outreach', type: 'ministry' }, { title: 'Sanctuary Deep Clean', type: 'facility' });
    if (d === 23) events.push({ title: "Men's Bible Study", type: 'class' });
    if (d === 24) events.push({ title: "Women's Prayer", type: 'ministry' }, { title: 'Choir Rehearsal', type: 'volunteer' });
    if (d === 26) events.push({ title: 'Youth Group', type: 'ministry' });
    if (d === 28) events.push({ title: 'Singles Ministry Mixer', type: 'ministry' }, { title: 'Building Fund Report Due', type: 'deadline' });

    days.push({ date: d, isCurrentMonth: true, isToday: d === 18, events });
  }
  return days;
}

const MONTH_DAYS = buildFebruary2026();
const MONTH_LABEL = 'February 2026';
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    <View style={[sh.card, { backgroundColor: colors.card, borderColor: highlight ? '#8B5CF6' : colors.border }]}>
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

function AgendaDayBlock({ dayLabel, events, colors, role }: { dayLabel: string; events: AgendaEvent[]; colors: typeof Colors.light; role: ChurchRoleLens }) {
  const filtered = sortAgendaByPriority(events.filter((ev) => {
    if (ev.staffOnly && !isStaffLevel(role)) return false;
    if (ev.leaderOnly && !isElderLevel(role)) return false;
    return true;
  }));

  if (filtered.length === 0) return null;

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
              {ev.assignedTo && isStaffLevel(role) && (
                <ThemedText style={[s.agendaAssigned, { color: colors.textTertiary }]}>
                  {ev.assignedTo}
                </ThemedText>
              )}
              {ev.notes && (
                <ThemedText style={[s.agendaNotes, { color: colors.textTertiary }]} numberOfLines={1}>
                  {ev.notes}
                </ThemedText>
              )}
              {ev.staffOnly && (
                <View style={[s.staffBadge, { backgroundColor: '#EC489920' }]}>
                  <ThemedText style={[s.staffBadgeText, { color: '#EC4899' }]}>STAFF</ThemedText>
                </View>
              )}
              {ev.leaderOnly && (
                <View style={[s.staffBadge, { backgroundColor: '#F59E0B20' }]}>
                  <ThemedText style={[s.staffBadgeText, { color: '#F59E0B' }]}>LEADERSHIP</ThemedText>
                </View>
              )}
              {ev.isBlocked && (
                <View style={[s.staffBadge, { backgroundColor: '#EF444420' }]}>
                  <ThemedText style={[s.staffBadgeText, { color: '#EF4444' }]}>BLOCKED</ThemedText>
                </View>
              )}
              {ev.decisionRequired && (
                <View style={[s.staffBadge, { backgroundColor: '#F59E0B20' }]}>
                  <ThemedText style={[s.staffBadgeText, { color: '#F59E0B' }]}>DECISION REQ.</ThemedText>
                </View>
              )}
              {ev.dueWithin24h && (
                <View style={[s.staffBadge, { backgroundColor: '#EF444420' }]}>
                  <ThemedText style={[s.staffBadgeText, { color: '#EF4444' }]}>DUE &lt;24H</ThemedText>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

function AgendaView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const todayFiltered = TODAY_AGENDA.filter((e) => {
    if (e.staffOnly && !isStaffLevel(role)) return false;
    if (e.leaderOnly && !isElderLevel(role)) return false;
    return true;
  });
  const serviceCount = todayFiltered.filter((e) => e.type === 'service').length;
  const volunteerCount = todayFiltered.filter((e) => e.type === 'volunteer').length;
  const deadlineCount = [...TODAY_AGENDA, ...TOMORROW_AGENDA, ...THIS_WEEK_AGENDA].filter((e) => {
    if (e.staffOnly && !isStaffLevel(role)) return false;
    if (e.leaderOnly && !isElderLevel(role)) return false;
    return e.type === 'deadline';
  }).length;

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
                {todayFiltered.length}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Today</ThemedText>
            </View>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: '#8B5CF6' }]}>
                {serviceCount}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Services</ThemedText>
            </View>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: '#F97316' }]}>
                {volunteerCount}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Volunteer</ThemedText>
            </View>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: '#EF4444' }]}>
                {deadlineCount}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Deadlines</ThemedText>
            </View>
          </View>
        </Card>
      </View>

      <AgendaDayBlock dayLabel="TODAY \u2014 SUNDAY, FEB 18" events={TODAY_AGENDA} colors={colors} role={role} />
      <AgendaDayBlock dayLabel="TOMORROW \u2014 MONDAY, FEB 19" events={TOMORROW_AGENDA} colors={colors} role={role} />
      <AgendaDayBlock dayLabel="THIS WEEK" events={THIS_WEEK_AGENDA} colors={colors} role={role} />
      <AgendaDayBlock dayLabel="NEXT WEEK" events={NEXT_WEEK_AGENDA} colors={colors} role={role} />

      {/* Legend */}
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
// SERVICES VIEW
// =============================================================================

function ServicesView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [expandedService, setExpandedService] = useState<string | null>('svc-2');

  const totalServices = WEEKLY_SERVICES.length;
  const gapCount = WEEKLY_SERVICES.filter((sv) => sv.staffGap).length;

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Service summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="WEEKLY SERVICE SCHEDULE" colors={colors} icon="music.note.list" />
        <Card colors={colors}>
          <View style={s.agendaSummaryRow}>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: colors.text }]}>{totalServices}</ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Services</ThemedText>
            </View>
            <View style={s.agendaSummaryStat}>
              <ThemedText style={[s.agendaSummaryValue, { color: colors.text }]}>
                {WEEKLY_SERVICES.reduce((sum, sv) => sum + sv.expectedAttendance, 0).toLocaleString()}
              </ThemedText>
              <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Expected</ThemedText>
            </View>
            {isElderLevel(role) && (
              <View style={s.agendaSummaryStat}>
                <ThemedText style={[s.agendaSummaryValue, { color: gapCount > 0 ? '#F59E0B' : '#22C55E' }]}>
                  {gapCount}
                </ThemedText>
                <ThemedText style={[s.agendaSummaryLabel, { color: colors.textSecondary }]}>Gaps</ThemedText>
              </View>
            )}
          </View>
        </Card>
      </View>

      {/* Service cards */}
      <View style={s.moduleContainer}>
        {WEEKLY_SERVICES.map((svc) => {
          const isExpanded = expandedService === svc.id;
          const hasGap = !!svc.staffGap;
          return (
            <Pressable
              key={svc.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedService(isExpanded ? null : svc.id);
              }}
            >
              <Card colors={colors} highlight={hasGap && isElderLevel(role)}>
                {/* Service header */}
                <View style={s.serviceHeader}>
                  <View style={s.serviceHeaderLeft}>
                    <ThemedText style={[s.serviceName, { color: colors.text }]}>{svc.name}</ThemedText>
                    <ThemedText style={[s.serviceMeta, { color: colors.textSecondary }]}>
                      {svc.day} {'\u00B7'} {svc.time} {'\u00B7'} {svc.campus}
                    </ThemedText>
                  </View>
                  <View style={s.serviceHeaderRight}>
                    <ThemedText style={[s.serviceAttendance, { color: colors.text }]}>
                      {svc.expectedAttendance}
                    </ThemedText>
                    <ThemedText style={[s.serviceAttLabel, { color: colors.textTertiary }]}>expected</ThemedText>
                  </View>
                </View>

                {/* Readiness score (staff+) */}
                {isStaffLevel(role) && (
                  <View style={s.readinessRow}>
                    <ThemedText style={[s.readinessLabel, { color: colors.textTertiary }]}>Readiness</ThemedText>
                    <View style={[s.readinessTrack, { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={[s.readinessFill, {
                        width: `${svc.readinessScore}%`,
                        backgroundColor: svc.readinessScore >= 85 ? '#22C55E' : svc.readinessScore >= 70 ? '#F59E0B' : '#EF4444',
                      }]} />
                    </View>
                    <ThemedText style={[s.readinessValue, {
                      color: svc.readinessScore >= 85 ? '#22C55E' : svc.readinessScore >= 70 ? '#F59E0B' : '#EF4444',
                    }]}>{svc.readinessScore}%</ThemedText>
                  </View>
                )}

                {/* Volunteer coverage strip */}
                {isStaffLevel(role) && (
                  <View style={s.coverageStrip}>
                    {svc.teams.map((team) => (
                      <View key={team.name} style={[s.coveragePip, { backgroundColor: CONFIRM_COLOR[team.status] }]} />
                    ))}
                  </View>
                )}

                {/* Key people */}
                <View style={s.serviceKeyPeople}>
                  <View style={s.servicePersonRow}>
                    <ThemedText style={[s.servicePersonLabel, { color: colors.textTertiary }]}>Worship:</ThemedText>
                    <ThemedText style={[s.servicePersonValue, { color: colors.textSecondary }]}>{svc.worshipLeader}</ThemedText>
                  </View>
                  <View style={s.servicePersonRow}>
                    <ThemedText style={[s.servicePersonLabel, { color: colors.textTertiary }]}>Pastor:</ThemedText>
                    <ThemedText style={[s.servicePersonValue, { color: colors.textSecondary }]}>{svc.pastor}</ThemedText>
                  </View>
                </View>

                {/* Gap warning for C1/C2 */}
                {hasGap && isElderLevel(role) && (
                  <View style={[s.gapBanner, { backgroundColor: '#F59E0B15' }]}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#F59E0B" />
                    <ThemedText style={[s.gapText, { color: '#F59E0B' }]}>{svc.staffGap}</ThemedText>
                  </View>
                )}

                {/* Expanded: team assignments + key assets */}
                {isExpanded && (
                  <View style={[s.serviceTeamsContainer, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                    {/* Key assets status */}
                    {svc.keyAssets.length > 0 && (
                      <>
                        <ThemedText style={[s.serviceTeamsTitle, { color: colors.textSecondary }]}>KEY ASSETS</ThemedText>
                        <View style={s.assetsRow}>
                          {svc.keyAssets.map((asset) => {
                            const assetColor = asset.status === 'ready' ? '#22C55E' : asset.status === 'pending' ? '#F59E0B' : '#EF4444';
                            return (
                              <View key={asset.name} style={[s.assetChip, { backgroundColor: assetColor + '15', borderColor: assetColor + '30' }]}>
                                <View style={[s.assetDot, { backgroundColor: assetColor }]} />
                                <ThemedText style={[s.assetLabel, { color: assetColor }]}>{asset.name}</ThemedText>
                              </View>
                            );
                          })}
                        </View>
                      </>
                    )}
                    <ThemedText style={[s.serviceTeamsTitle, { color: colors.textSecondary }]}>ASSIGNED TEAMS</ThemedText>
                    {svc.teams.map((team, idx) => (
                      <View
                        key={team.name}
                        style={[
                          s.serviceTeamRow,
                          idx < svc.teams.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        ]}
                      >
                        <View style={s.serviceTeamLeft}>
                          <ThemedText style={[s.serviceTeamName, { color: colors.text }]}>{team.name}</ThemedText>
                          {team.lead && (
                            <ThemedText style={[s.serviceTeamLead, { color: colors.textTertiary }]}>{team.lead}</ThemedText>
                          )}
                        </View>
                        <View style={[s.serviceTeamStatusBadge, { backgroundColor: CONFIRM_COLOR[team.status] + '20' }]}>
                          <View style={[s.serviceTeamStatusDot, { backgroundColor: CONFIRM_COLOR[team.status] }]} />
                          <ThemedText style={[s.serviceTeamStatusText, { color: CONFIRM_COLOR[team.status] }]}>
                            {team.status.toUpperCase()}
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
// NEWS VIEW
// =============================================================================

function NewsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [categoryFilter, setCategoryFilter] = useState<NewsCategory | 'all'>('all');

  const filtered = CHURCH_NEWS.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.newsFilterScroll}>
        {(['all', 'announcement', 'event', 'testimony', 'update'] as const).map((cat) => {
          const isActive = categoryFilter === cat;
          return (
            <Pressable
              key={cat}
              style={[s.newsFilterPill, {
                backgroundColor: isActive
                  ? (cat === 'all' ? colors.text + '15' : NEWS_CATEGORY_COLOR[cat as NewsCategory] + '20')
                  : 'transparent',
                borderColor: isActive
                  ? (cat === 'all' ? colors.text + '30' : NEWS_CATEGORY_COLOR[cat as NewsCategory] + '40')
                  : colors.border,
              }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategoryFilter(cat); }}
            >
              <ThemedText style={[s.newsFilterText, {
                color: isActive
                  ? (cat === 'all' ? colors.text : NEWS_CATEGORY_COLOR[cat as NewsCategory])
                  : colors.textSecondary,
              }]}>
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* News articles */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CHURCH NEWS & ANNOUNCEMENTS" colors={colors} count={filtered.length} icon="megaphone.fill" />
        {filtered.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Card colors={colors}>
              <View style={s.newsItemHeader}>
                <View style={[s.newsCategoryBadge, { backgroundColor: NEWS_CATEGORY_COLOR[item.category] + '20' }]}>
                  <ThemedText style={[s.newsCategoryText, { color: NEWS_CATEGORY_COLOR[item.category] }]}>
                    {NEWS_CATEGORY_LABEL[item.category]}
                  </ThemedText>
                </View>
                <ThemedText style={[s.newsDate, { color: colors.textTertiary }]}>{item.date}</ThemedText>
              </View>
              <ThemedText style={[s.newsTitle, { color: colors.text }]}>{item.title}</ThemedText>
              <View style={s.newsAuthorRow}>
                <ThemedText style={[s.newsAuthor, { color: colors.textSecondary }]}>{item.author}</ThemedText>
                <ThemedText style={[s.newsAuthorRole, { color: colors.textTertiary }]}>{'\u00B7'} {item.authorRole}</ThemedText>
              </View>
              <ThemedText style={[s.newsPreview, { color: colors.textTertiary }]} numberOfLines={3}>
                {item.preview}
              </ThemedText>
              {(item.appliesToDate || item.actionCta) && (
                <View style={s.newsActionRow}>
                  {item.appliesToDate && (
                    <ThemedText style={[s.newsAppliesTo, { color: colors.textTertiary }]}>
                      {item.appliesToDate}
                    </ThemedText>
                  )}
                  {item.actionCta && (
                    <Pressable
                      style={[s.newsCtaButton, { backgroundColor: NEWS_CATEGORY_COLOR[item.category] }]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    >
                      <ThemedText style={s.newsCtaText}>{item.actionCta}</ThemedText>
                    </Pressable>
                  )}
                </View>
              )}
            </Card>
          </Pressable>
        ))}
      </View>

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// CALENDAR GRID VIEW
// =============================================================================

function CalendarGridView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(18);
  const [monthOffset, setMonthOffset] = useState(0);

  const selectedDayData = MONTH_DAYS.find((d) => d.date === selectedDay && d.isCurrentMonth);
  const filteredSelectedEvents = selectedDayData?.events || [];

  // Build grid rows — Feb 1, 2026 is Sunday (index 0)
  const gridDays: (CalendarDay | null)[] = [];
  MONTH_DAYS.forEach((d) => gridDays.push(d));
  // Fill trailing nulls to complete last week row
  while (gridDays.length % 7 !== 0) gridDays.push(null);

  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < gridDays.length; i += 7) {
    weeks.push(gridDays.slice(i, i + 7));
  }

  return (
    <ScrollView
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Month header with navigation */}
      <View style={s.moduleContainer}>
        <View style={s.monthNav}>
          <Pressable
            style={({ pressed }) => [s.monthNavArrow, { opacity: pressed ? 0.5 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMonthOffset((prev) => prev - 1);
            }}
          >
            <IconSymbol name="chevron.left" size={18} color={colors.text} />
          </Pressable>
          <ThemedText style={[s.monthNavLabel, { color: colors.text }]}>{MONTH_LABEL.toUpperCase()}</ThemedText>
          <Pressable
            style={({ pressed }) => [s.monthNavArrow, { opacity: pressed ? 0.5 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMonthOffset((prev) => prev + 1);
            }}
          >
            <IconSymbol name="chevron.right" size={18} color={colors.text} />
          </Pressable>
        </View>

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
                const isSelected = selectedDay === day.date;
                return (
                  <Pressable
                    key={day.date}
                    style={[
                      s.monthDayCell,
                      day.isToday && { backgroundColor: '#8B5CF620', borderRadius: 8 },
                      isSelected && !day.isToday && { backgroundColor: colors.backgroundTertiary, borderRadius: 8 },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDay(day.date);
                    }}
                  >
                    <ThemedText style={[
                      s.monthDayNumber,
                      { color: day.isToday ? '#8B5CF6' : colors.text },
                      day.isToday && { fontWeight: '800' },
                    ]}>
                      {day.date}
                    </ThemedText>
                    <View style={s.monthDotRow}>
                      {day.events.slice(0, 3).map((ev, ei) => (
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

      {/* Legend */}
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

      {/* Admin controls — C1/C2 only */}
      {isElderLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="CALENDAR MANAGEMENT" colors={colors} icon="gearshape.fill" />
          <Card colors={colors}>
            <View style={s.mgmtGrid}>
              {[
                { label: 'Add Event', icon: 'plus.circle.fill', desc: 'Create a new calendar event' },
                { label: 'Recurring Events', icon: 'arrow.2.circlepath', desc: 'Manage repeating events' },
                { label: 'Sync Settings', icon: 'arrow.triangle.2.circlepath', desc: 'Calendar sync & integrations' },
                { label: 'Event Reports', icon: 'chart.bar.fill', desc: 'Attendance & event analytics' },
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
// MAIN COMPONENT
// =============================================================================

export function ChurchCalendar({ colors, role = 'C1', onSwitchTab }: Props) {
  const visibleViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<CalendarView>('agenda');

  // Ensure current view is valid for the role
  const resolvedView = visibleViews.some((v) => v.id === activeView) ? activeView : visibleViews[0].id;

  return (
    <View style={{ flex: 1 }}>
      {/* View pill toggle row */}
      <View style={s.pillRow}>
        {visibleViews.map((pill) => {
          const isActive = resolvedView === pill.id;
          return (
            <Pressable
              key={pill.id}
              style={[s.pill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveView(pill.id);
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
      {resolvedView === 'services' && <ServicesView colors={colors} role={role} />}
      {resolvedView === 'news' && <NewsView colors={colors} role={role} />}
      {resolvedView === 'calendar' && <CalendarGridView colors={colors} role={role} />}
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
  agendaAssigned: { fontSize: 11, marginBottom: 1 },
  agendaNotes: { fontSize: 11, fontStyle: 'italic' },
  staffBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm, alignSelf: 'flex-start', marginTop: 4 },
  staffBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },

  // Services
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  readinessLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, width: 60 },
  readinessTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  readinessFill: { height: '100%', borderRadius: 3 },
  readinessValue: { fontSize: 12, fontWeight: '800', width: 36, textAlign: 'right' },
  coverageStrip: { flexDirection: 'row', gap: 3, marginBottom: 8 },
  coveragePip: { width: 16, height: 4, borderRadius: 2 },
  assetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  assetChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm, borderWidth: StyleSheet.hairlineWidth },
  assetDot: { width: 5, height: 5, borderRadius: 2.5 },
  assetLabel: { fontSize: 10, fontWeight: '600' },
  serviceHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  serviceHeaderLeft: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  serviceMeta: { fontSize: 12 },
  serviceHeaderRight: { alignItems: 'flex-end', marginLeft: 12 },
  serviceAttendance: { fontSize: 20, fontWeight: '700' },
  serviceAttLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3 },
  serviceKeyPeople: { marginBottom: 6 },
  servicePersonRow: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  servicePersonLabel: { fontSize: 11, fontWeight: '500', width: 58 },
  servicePersonValue: { fontSize: 11, fontWeight: '600', flex: 1 },
  gapBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.sm, marginTop: 4 },
  gapText: { fontSize: 11, fontWeight: '600', flex: 1 },
  serviceTeamsContainer: { marginTop: 10, paddingTop: 10 },
  serviceTeamsTitle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  serviceTeamRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  serviceTeamLeft: { flex: 1 },
  serviceTeamName: { fontSize: 13, fontWeight: '600' },
  serviceTeamLead: { fontSize: 11, marginTop: 1 },
  serviceTeamStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  serviceTeamStatusDot: { width: 5, height: 5, borderRadius: 2.5 },
  serviceTeamStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // News
  newsFilterScroll: { flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  newsFilterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  newsFilterText: { fontSize: 11, fontWeight: '600' },
  newsItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  newsCategoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  newsCategoryText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  newsDate: { fontSize: 11 },
  newsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  newsAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  newsAuthor: { fontSize: 12, fontWeight: '600' },
  newsAuthorRole: { fontSize: 12 },
  newsPreview: { fontSize: 12, lineHeight: 18 },
  newsActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  newsAppliesTo: { fontSize: 11, fontStyle: 'italic' },
  newsCtaButton: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.sm },
  newsCtaText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Calendar grid
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  monthNavArrow: { padding: 8 },
  monthNavLabel: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
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

  // Legend
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, fontWeight: '500' },

  // Management grid
  mgmtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  mgmtItem: { width: '47%', padding: Spacing.md, borderRadius: BorderRadius.md, gap: 6 },
  mgmtItemLabel: { fontSize: 13, fontWeight: '600' },
  mgmtItemDesc: { fontSize: 10 },
});
