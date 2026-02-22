/**
 * Church Community — Relationship, belonging, and care coordination.
 * 5-view pill toggle: Overview, People, Groups, Care, Serve.
 *
 * RBAC:
 *   C1 (Senior Pastor) — All 5 views, full detail
 *   C2 (Elder / Board) — All 5 views, full detail
 *   C3 (Staff)         — Overview, People, Groups, Care (no Serve analytics)
 *   C4 (Member)        — Overview, Groups (member-level community access)
 *   C5 (Visitor)       — Overview only (public community info)
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
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

type CommunityView = 'overview' | 'people' | 'groups' | 'care' | 'serve';

interface ViewDef {
  id: CommunityView;
  label: string;
}

const ALL_VIEWS: ViewDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'people', label: 'People' },
  { id: 'groups', label: 'Groups' },
  { id: 'care', label: 'Care' },
  { id: 'serve', label: 'Serve' },
];

function getAvailableViews(role: ChurchRoleLens): ViewDef[] {
  switch (role) {
    case 'C1':
    case 'C2':
      return ALL_VIEWS; // all 5
    case 'C3':
      return ALL_VIEWS.filter((v) => v.id !== 'serve'); // overview, people, groups, care
    case 'C4':
      return ALL_VIEWS.filter((v) => v.id === 'overview' || v.id === 'groups'); // overview, groups
    case 'C5':
    default:
      return ALL_VIEWS.filter((v) => v.id === 'overview'); // overview only
  }
}

function canAccessView(viewId: CommunityView, role: ChurchRoleLens): boolean {
  return getAvailableViews(role).some((v) => v.id === viewId);
}

// =============================================================================
// INLINE MOCK DATA — OVERVIEW
// =============================================================================

interface HealthKPI {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const HEALTH_KPIS: HealthKPI[] = [
  { label: 'Total Members', value: '4,200', icon: 'person.3.fill', color: '#3B82F6' },
  { label: 'Active Small Groups', value: '42', icon: 'person.2.circle.fill', color: '#8B5CF6' },
  { label: 'Weekly Attendance', value: '2,850', icon: 'building.2.fill', color: '#F59E0B' },
  { label: 'New Members (Q1)', value: '38', icon: 'person.badge.plus', color: '#22C55E' },
  { label: 'Baptisms YTD', value: '12', icon: 'drop.fill', color: '#06B6D4' },
  { label: 'Connected Rate', value: '78%', icon: 'link', color: '#EC4899' },
];

interface SpotlightStory {
  name: string;
  campus: string;
  story: string;
  memberSince: string;
}

const COMMUNITY_SPOTLIGHT: SpotlightStory = {
  name: 'Marcus & Angela Johnson',
  campus: 'Downtown Campus',
  story: 'After attending for two years as visitors, Marcus and Angela joined a marriage enrichment group that transformed their relationship. They were baptized together in January and now lead a young couples\' small group. "This church didn\'t just welcome us \u2014 it became our family."',
  memberSince: 'Member since 2024',
};

interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: string;
  typeColor: string;
}

const RECENT_EVENTS: CommunityEvent[] = [
  { id: 'evt-1', title: 'Community Dinner & Fellowship', date: 'Feb 21, 2026 \u00B7 6:00 PM', location: 'Downtown Campus \u2014 Fellowship Hall', type: 'Fellowship', typeColor: '#F59E0B' },
  { id: 'evt-2', title: 'New Members Luncheon', date: 'Feb 22, 2026 \u00B7 12:30 PM', location: 'Westside Campus \u2014 Lounge', type: 'Welcome', typeColor: '#22C55E' },
  { id: 'evt-3', title: 'Marriage Retreat Weekend', date: 'Mar 7\u20138, 2026', location: 'Lake Arrowhead Conference Center', type: 'Retreat', typeColor: '#8B5CF6' },
];

// =============================================================================
// INLINE MOCK DATA — OVERVIEW ALERTS
// =============================================================================

interface CommunityAlert {
  id: string;
  label: string;
  detail: string;
  severity: 'warning' | 'info';
  icon: string;
}

const OVERVIEW_ALERTS: CommunityAlert[] = [
  { id: 'al-1', label: 'Visitor follow-up overdue', detail: '3 visitors from last Sunday have not been contacted (48h SLA expired)', severity: 'warning', icon: 'exclamationmark.triangle.fill' },
  { id: 'al-2', label: 'Care request unresponded', detail: '1 care request pending assignment for 36h', severity: 'warning', icon: 'heart.text.square.fill' },
  { id: 'al-3', label: '2 new members awaiting group placement', detail: 'James & Kathy Lee and Fatima Al-Hassan need small group connection', severity: 'info', icon: 'person.badge.plus' },
];

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const OVERVIEW_QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1', label: 'Log Visit', icon: 'person.fill.checkmark', color: '#22C55E' },
  { id: 'qa-2', label: 'New Care Case', icon: 'heart.text.square.fill', color: '#EF4444' },
  { id: 'qa-3', label: 'Send Message', icon: 'paperplane.fill', color: '#3B82F6' },
  { id: 'qa-4', label: 'Schedule Follow-up', icon: 'calendar.badge.plus', color: '#8B5CF6' },
];

// =============================================================================
// INLINE MOCK DATA — PEOPLE (DIRECTORY)
// =============================================================================

type FollowUpStatus = 'none' | 'due' | 'in-progress' | 'completed';
type Sensitivity = 'normal' | 'restricted';

interface PersonEntry {
  id: string;
  name: string;
  role: string;
  ministry: string;
  campus: string;
  memberSince: string;
  category: 'leader' | 'staff' | 'member' | 'new-member' | 'visitor';
  email: string;
  phone: string;
  notes?: string;
  followUpStatus?: FollowUpStatus;
  sensitivity?: Sensitivity;
}

const FOLLOW_UP_COLORS: Record<FollowUpStatus, string> = {
  none: '#8F8F8F',
  due: '#EF4444',
  'in-progress': '#F59E0B',
  completed: '#22C55E',
};

const FOLLOW_UP_LABELS: Record<FollowUpStatus, string> = {
  none: 'None',
  due: 'Due',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const PEOPLE_DIRECTORY: PersonEntry[] = [
  // Leaders
  { id: 'p-1', name: 'Pastor David Chen', role: 'Senior Pastor', ministry: 'Pastoral', campus: 'Downtown', memberSince: 'Jan 2008', category: 'leader', email: 'dchen@gracechurch.org', phone: '(213) 555-0101', notes: 'Founding pastor. Leads vision and teaching.' },
  { id: 'p-2', name: 'Elder Robert Thompson', role: 'Elder / Board Chair', ministry: 'Governance', campus: 'Downtown', memberSince: 'Mar 2010', category: 'leader', email: 'rthompson@gracechurch.org', phone: '(213) 555-0102', notes: 'Oversees elder board meetings and church discipline.' },
  { id: 'p-3', name: 'Pastor Maria Santos', role: 'Campus Pastor', ministry: 'Pastoral', campus: 'Westside', memberSince: 'Jun 2014', category: 'leader', email: 'msantos@gracechurch.org', phone: '(310) 555-0201', notes: 'Leads Westside campus operations and teaching rotation.' },
  { id: 'p-4', name: 'Deaconess Mia Torres', role: 'Deaconess / Care Lead', ministry: 'Care & Counseling', campus: 'Downtown', memberSince: 'Sep 2011', category: 'leader', email: 'smitchell@gracechurch.org', phone: '(213) 555-0103' },
  // Staff
  { id: 'p-5', name: 'Alex Kim', role: 'Young Adults Director', ministry: 'Young Adults', campus: 'Westside', memberSince: 'Aug 2018', category: 'staff', email: 'akim@gracechurch.org', phone: '(310) 555-0202' },
  { id: 'p-6', name: 'Jessica Williams', role: 'Worship Director', ministry: 'Worship', campus: 'Downtown', memberSince: 'Feb 2016', category: 'staff', email: 'jwilliams@gracechurch.org', phone: '(213) 555-0104' },
  { id: 'p-7', name: 'Marcus Rivera', role: 'Children\'s Ministry Director', ministry: 'Children', campus: 'Downtown', memberSince: 'May 2017', category: 'staff', email: 'mrivera@gracechurch.org', phone: '(213) 555-0105' },
  { id: 'p-8', name: 'Chaplain Davis', role: 'Pastoral Counselor', ministry: 'Care & Counseling', campus: 'All Campuses', memberSince: 'Nov 2015', category: 'staff', email: 'cdavis@gracechurch.org', phone: '(213) 555-0106' },
  { id: 'p-9', name: 'Linda Park', role: 'Office Manager', ministry: 'Administration', campus: 'Downtown', memberSince: 'Apr 2013', category: 'staff', email: 'lpark@gracechurch.org', phone: '(213) 555-0107' },
  // Members
  { id: 'p-10', name: 'Angela Johnson', role: 'Small Group Leader', ministry: 'Young Couples', campus: 'Downtown', memberSince: 'Jan 2024', category: 'member', email: 'ajohnson@gmail.com', phone: '(213) 555-7001' },
  { id: 'p-11', name: 'Terrance Brooks', role: 'Usher Team Lead', ministry: 'Hospitality', campus: 'Downtown', memberSince: 'Mar 2019', category: 'member', email: 'tbrooks@gmail.com', phone: '(213) 555-7002' },
  { id: 'p-12', name: 'Priya Sharma', role: 'Choir Member', ministry: 'Worship', campus: 'Westside', memberSince: 'Jul 2020', category: 'member', email: 'psharma@gmail.com', phone: '(310) 555-7003' },
  { id: 'p-13', name: 'Carlos Martinez', role: 'Tech Team Volunteer', ministry: 'Production', campus: 'South Bay', memberSince: 'Oct 2021', category: 'member', email: 'cmartinez@gmail.com', phone: '(424) 555-7004' },
  { id: 'p-14', name: 'Dorothy Mae Harris', role: 'Intercessory Prayer', ministry: 'Prayer', campus: 'Downtown', memberSince: 'Jun 1984', category: 'member', email: 'dharris@gmail.com', phone: '(213) 555-7005' },
  // New Members
  { id: 'p-15', name: 'James & Kathy Lee', role: 'New Member', ministry: '\u2014', campus: 'Westside', memberSince: 'Jan 2026', category: 'new-member', email: 'jklee@gmail.com', phone: '(310) 555-8001', followUpStatus: 'in-progress' },
  { id: 'p-16', name: 'Fatima Al-Hassan', role: 'New Member', ministry: '\u2014', campus: 'Downtown', memberSince: 'Feb 2026', category: 'new-member', email: 'falhassan@gmail.com', phone: '(213) 555-8002', followUpStatus: 'due' },
  { id: 'p-17', name: 'Devon & Crystal Washington', role: 'New Member', ministry: 'Children (exploring)', campus: 'South Bay', memberSince: 'Jan 2026', category: 'new-member', email: 'dwashington@gmail.com', phone: '(424) 555-8003', followUpStatus: 'completed' },
  // Visitors
  { id: 'p-18', name: 'Michael Torres', role: 'Visitor', ministry: '\u2014', campus: 'Downtown', memberSince: 'Feb 2026', category: 'visitor', email: 'mtorres@gmail.com', phone: '(213) 555-9001', followUpStatus: 'due', sensitivity: 'restricted' },
  { id: 'p-19', name: 'Sophia Grant', role: 'Visitor', ministry: '\u2014', campus: 'Westside', memberSince: 'Feb 2026', category: 'visitor', email: 'sgrant@gmail.com', phone: '(310) 555-9002', followUpStatus: 'due' },
  { id: 'p-20', name: 'Robert & Yolanda Simmons', role: 'Visitor', ministry: '\u2014', campus: 'South Bay', memberSince: 'Feb 2026', category: 'visitor', email: 'rsimmons@gmail.com', phone: '(424) 555-9003', followUpStatus: 'none' },
];

const PEOPLE_FILTER_CHIPS = ['All', 'Leaders', 'Staff', 'New Members', 'Visitors'] as const;
type PeopleFilter = typeof PEOPLE_FILTER_CHIPS[number];

const FILTER_TO_CATEGORY: Record<PeopleFilter, PersonEntry['category'] | 'all'> = {
  All: 'all',
  Leaders: 'leader',
  Staff: 'staff',
  'New Members': 'new-member',
  Visitors: 'visitor',
};

// =============================================================================
// INLINE MOCK DATA — GROUPS
// =============================================================================

type GroupType = 'Bible Study' | 'Life Group' | 'Recovery' | 'Men\'s' | 'Women\'s' | 'Young Adults' | 'Couples' | 'Prayer' | 'Foundations' | 'Support' | 'Outreach' | 'Seniors';

type GroupHealth = 'healthy' | 'at-risk' | 'inactive';

interface SmallGroup {
  id: string;
  name: string;
  leader: string;
  dayTime: string;
  location: string;
  type: GroupType;
  currentMembers: number;
  capacity: number;
  status: 'open' | 'closed';
  campus: string;
  avgAttendance?: number; // staff+ only
  trend?: 'up' | 'down' | 'stable'; // staff+ only
  health?: GroupHealth;
}

const GROUP_HEALTH_COLOR: Record<GroupHealth, string> = {
  healthy: '#22C55E',
  'at-risk': '#F59E0B',
  inactive: '#EF4444',
};

const GROUP_HEALTH_LABEL: Record<GroupHealth, string> = {
  healthy: 'HEALTHY',
  'at-risk': 'AT RISK',
  inactive: 'INACTIVE',
};

const GROUPS: SmallGroup[] = [
  { id: 'g-1', name: 'Men of Purpose', leader: 'Elder Robert Thompson', dayTime: 'Tue 7:00 PM', location: 'Downtown \u2014 Room 204', type: 'Men\'s', currentMembers: 12, capacity: 15, status: 'open', campus: 'Downtown', avgAttendance: 88, trend: 'up', health: 'healthy' },
  { id: 'g-2', name: 'Women of Grace', leader: 'Deaconess Mia Torres', dayTime: 'Wed 10:00 AM', location: 'Downtown \u2014 Fellowship Hall', type: 'Women\'s', currentMembers: 18, capacity: 20, status: 'open', campus: 'Downtown', avgAttendance: 92, trend: 'stable', health: 'healthy' },
  { id: 'g-3', name: 'Young Adults Connect', leader: 'Pastor Alex Kim', dayTime: 'Thu 7:30 PM', location: 'Westside \u2014 Lounge', type: 'Young Adults', currentMembers: 25, capacity: 30, status: 'open', campus: 'Westside', avgAttendance: 78, trend: 'up', health: 'healthy' },
  { id: 'g-4', name: 'Marriage Enrichment', leader: 'Pastor & Mrs. Williams', dayTime: 'Fri 7:00 PM', location: 'Downtown \u2014 Room 110', type: 'Couples', currentMembers: 8, capacity: 10, status: 'open', campus: 'Downtown', avgAttendance: 95, trend: 'stable', health: 'healthy' },
  { id: 'g-5', name: 'Grief & Hope', leader: 'Chaplain Davis', dayTime: 'Sat 10:00 AM', location: 'Downtown \u2014 Chapel', type: 'Support', currentMembers: 6, capacity: 12, status: 'open', campus: 'Downtown', avgAttendance: 82, trend: 'up', health: 'healthy' },
  { id: 'g-6', name: 'New Believers Foundations', leader: 'Deacon Martinez', dayTime: 'Sun 12:00 PM', location: 'All Campuses', type: 'Foundations', currentMembers: 14, capacity: 20, status: 'open', campus: 'All', avgAttendance: 70, trend: 'down', health: 'at-risk' },
  { id: 'g-7', name: 'Intercessory Prayer Warriors', leader: 'Mother Johnson', dayTime: 'Daily 6:00 AM', location: 'Downtown \u2014 Prayer Room', type: 'Prayer', currentMembers: 20, capacity: 20, status: 'closed', campus: 'Downtown', avgAttendance: 96, trend: 'stable', health: 'healthy' },
  { id: 'g-8', name: 'Genesis Bible Study', leader: 'Pastor David Chen', dayTime: 'Wed 7:00 PM', location: 'Downtown \u2014 Sanctuary', type: 'Bible Study', currentMembers: 45, capacity: 60, status: 'open', campus: 'Downtown', avgAttendance: 85, trend: 'up', health: 'healthy' },
  { id: 'g-9', name: 'Freedom Recovery', leader: 'Minister Thomas', dayTime: 'Mon 7:00 PM', location: 'Downtown \u2014 Room 106', type: 'Recovery', currentMembers: 10, capacity: 15, status: 'open', campus: 'Downtown', avgAttendance: 74, trend: 'up', health: 'at-risk' },
  { id: 'g-10', name: 'Community Outreach Team', leader: 'Deacon Marcus Rivera', dayTime: 'Sat 9:00 AM', location: 'Rotating Locations', type: 'Outreach', currentMembers: 22, capacity: 30, status: 'open', campus: 'All', avgAttendance: 68, trend: 'stable', health: 'at-risk' },
  { id: 'g-11', name: 'Wisdom Circle (Seniors)', leader: 'Elder Patricia Moore', dayTime: 'Thu 11:00 AM', location: 'Downtown \u2014 Fellowship Hall', type: 'Seniors', currentMembers: 16, capacity: 20, status: 'open', campus: 'Downtown', avgAttendance: 91, trend: 'stable', health: 'healthy' },
  { id: 'g-12', name: 'South Bay Life Group', leader: 'Pastor James Okafor', dayTime: 'Tue 7:00 PM', location: 'South Bay \u2014 Main Room', type: 'Life Group', currentMembers: 15, capacity: 18, status: 'open', campus: 'South Bay', avgAttendance: 80, trend: 'up', health: 'healthy' },
];

const GROUP_TYPE_COLORS: Record<string, string> = {
  'Bible Study': '#3B82F6',
  'Life Group': '#6AA9FF',
  Recovery: '#06B6D4',
  'Men\'s': '#3B82F6',
  'Women\'s': '#EC4899',
  'Young Adults': '#8B5CF6',
  Couples: '#F59E0B',
  Prayer: '#F97316',
  Foundations: '#22C55E',
  Support: '#06B6D4',
  Outreach: '#10B981',
  Seniors: '#A78BFA',
};

// =============================================================================
// INLINE MOCK DATA — CARE & FOLLOW-UP
// =============================================================================

type CareType = 'hospital' | 'grief' | 'counseling' | 'new-member-followup' | 'prayer-request' | 'homebound' | 'crisis';
type CarePriority = 'high' | 'medium' | 'low';
type CareStatus = 'active' | 'pending' | 'resolved';

interface CareCase {
  id: string;
  personName: string;
  type: CareType;
  typeLabel: string;
  assignedTo: string;
  status: CareStatus;
  lastContact: string;
  priority: CarePriority;
  notes?: string;
}

const CARE_CASES: CareCase[] = [
  { id: 'cc-1', personName: 'Sister Dorothy Mae Harris', type: 'homebound', typeLabel: 'Homebound Visit', assignedTo: 'Deaconess Mia Torres', status: 'active', lastContact: 'Feb 15, 2026', priority: 'high', notes: 'Weekly visits. Needs communion and prayer.' },
  { id: 'cc-2', personName: 'Brother Thomas Reed', type: 'hospital', typeLabel: 'Hospital Visit', assignedTo: 'Chaplain Davis', status: 'active', lastContact: 'Feb 16, 2026', priority: 'high', notes: 'Admitted to Cedars-Sinai. Heart surgery scheduled Feb 20.' },
  { id: 'cc-3', personName: 'Karen Thompson', type: 'grief', typeLabel: 'Grief Support', assignedTo: 'Chaplain Davis', status: 'active', lastContact: 'Feb 12, 2026', priority: 'medium', notes: 'Lost her mother last month. Connected to Grief & Hope group.' },
  { id: 'cc-4', personName: 'James & Kathy Lee', type: 'new-member-followup', typeLabel: 'New Member Follow-up', assignedTo: 'Pastor Maria Santos', status: 'active', lastContact: 'Feb 10, 2026', priority: 'medium', notes: 'Joined in January. Exploring small groups and children\'s ministry.' },
  { id: 'cc-5', personName: 'Fatima Al-Hassan', type: 'new-member-followup', typeLabel: 'New Member Follow-up', assignedTo: 'Alex Kim', status: 'pending', lastContact: 'Feb 5, 2026', priority: 'medium', notes: 'Completed membership class. Awaiting baptism scheduling.' },
  { id: 'cc-6', personName: 'Anonymous Request #47', type: 'prayer-request', typeLabel: 'Prayer Request', assignedTo: 'Intercessory Prayer Team', status: 'active', lastContact: 'Feb 14, 2026', priority: 'low', notes: 'Requesting prayer for family restoration.' },
  { id: 'cc-7', personName: 'Michael Torres', type: 'counseling', typeLabel: 'Pastoral Counseling', assignedTo: 'Chaplain Davis', status: 'active', lastContact: 'Feb 13, 2026', priority: 'medium', notes: 'First-time visitor seeking spiritual guidance. Session 2 of 6.' },
  { id: 'cc-8', personName: 'Devon Washington', type: 'crisis', typeLabel: 'Crisis Intervention', assignedTo: 'Pastor David Chen', status: 'active', lastContact: 'Feb 17, 2026', priority: 'high', notes: 'Job loss and housing instability. Connected to benevolence fund.' },
  { id: 'cc-9', personName: 'Elder Marcus Brown', type: 'hospital', typeLabel: 'Hospital Visit', assignedTo: 'Deaconess Mia Torres', status: 'resolved', lastContact: 'Feb 8, 2026', priority: 'low', notes: 'Knee replacement. Discharged and recovering well.' },
  { id: 'cc-10', personName: 'Crystal Washington', type: 'new-member-followup', typeLabel: 'New Member Follow-up', assignedTo: 'Marcus Rivera', status: 'pending', lastContact: 'Feb 3, 2026', priority: 'low', notes: 'Interested in children\'s ministry volunteering. Needs follow-up call.' },
];

const CARE_STATS = {
  activeCases: 7,
  resolvedThisMonth: 4,
  avgResponseTime: '18 hours',
  pendingAssignment: 2,
};

const CARE_TYPE_COLORS: Record<CareType, string> = {
  hospital: '#EF4444',
  grief: '#8B5CF6',
  counseling: '#3B82F6',
  'new-member-followup': '#22C55E',
  'prayer-request': '#F97316',
  homebound: '#EC4899',
  crisis: '#EF4444',
};

const PRIORITY_COLORS: Record<CarePriority, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

const STATUS_COLORS: Record<CareStatus, string> = {
  active: '#3B82F6',
  pending: '#F59E0B',
  resolved: '#22C55E',
};

// =============================================================================
// INLINE MOCK DATA — SERVE (VOLUNTEERS)
// =============================================================================

interface VolunteerTeam {
  id: string;
  name: string;
  headcount: number;
  needed: number;
  lead: string;
  color: string;
}

const VOLUNTEER_TEAMS: VolunteerTeam[] = [
  { id: 'vt-1', name: 'Worship & Music', headcount: 34, needed: 4, lead: 'Jessica Williams', color: '#8B5CF6' },
  { id: 'vt-2', name: 'Children\'s Ministry', headcount: 28, needed: 6, lead: 'Marcus Rivera', color: '#EC4899' },
  { id: 'vt-3', name: 'Hospitality & Ushers', headcount: 22, needed: 3, lead: 'Terrance Brooks', color: '#F59E0B' },
  { id: 'vt-4', name: 'Production & Tech', headcount: 16, needed: 5, lead: 'Carlos Martinez', color: '#3B82F6' },
  { id: 'vt-5', name: 'Community Outreach', headcount: 22, needed: 8, lead: 'Deacon Marcus Rivera', color: '#10B981' },
  { id: 'vt-6', name: 'Parking & Security', headcount: 14, needed: 2, lead: 'Deacon Williams', color: '#6B7280' },
  { id: 'vt-7', name: 'Prayer Ministry', headcount: 20, needed: 0, lead: 'Mother Johnson', color: '#F97316' },
  { id: 'vt-8', name: 'Media & Communications', headcount: 8, needed: 4, lead: 'Linda Park', color: '#06B6D4' },
];

const SERVE_STATS = {
  totalVolunteers: 164,
  openPositionsThisWeek: 32,
  avgHoursPerMonth: '12.4',
  retentionRate: '86%',
  newVolunteersThisMonth: 8,
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, icon, action }: {
  title: string; colors: typeof Colors.light; count?: number; icon?: string; action?: string;
}) {
  return (
    <View style={sh.headerRow}>
      <View style={sh.headerLeft}>
        {icon && <IconSymbol name={icon as any} size={12} color={colors.textSecondary} />}
        <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
        {count != null && (
          <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
          </View>
        )}
      </View>
      {action && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <ThemedText style={[sh.actionText, { color: colors.textTertiary }]}>{action}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function Card({ colors, children, style }: { colors: typeof Colors.light; children: React.ReactNode; style?: any }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

const sh = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  actionText: { fontSize: 12, fontWeight: '500' },
});

// =============================================================================
// VIEW TOGGLE PILL BAR
// =============================================================================

function ViewToggle({
  colors,
  activeView,
  onSelect,
  role,
}: {
  colors: typeof Colors.light;
  activeView: CommunityView;
  onSelect: (v: CommunityView) => void;
  role: ChurchRoleLens;
}) {
  const accessibleViews = getAvailableViews(role);

  return (
    <View style={vt.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={vt.scrollContent}>
        <View style={[vt.pillRow, { borderColor: colors.border }]}>
          {accessibleViews.map((v) => {
            const isActive = v.id === activeView;
            return (
              <Pressable
                key={v.id}
                style={[
                  vt.pill,
                  { backgroundColor: isActive ? '#FFFFFF20' : 'transparent' },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(v.id);
                }}
              >
                <ThemedText
                  style={[vt.pillText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}
                >
                  {v.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const vt = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  scrollContent: { paddingHorizontal: 0 },
  pillRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// =============================================================================
// VIEW 1: OVERVIEW
// =============================================================================

function OverviewView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  return (
    <View>
      {/* Alerts (staff+) */}
      {isStaffLevel(role) && OVERVIEW_ALERTS.length > 0 && (
        <View style={s.moduleContainer}>
          <SectionHeader title="ALERTS" colors={colors} icon="exclamationmark.triangle.fill" count={OVERVIEW_ALERTS.length} />
          {OVERVIEW_ALERTS.map((alert) => (
            <Card key={alert.id} colors={colors} style={{ borderColor: alert.severity === 'warning' ? '#F59E0B40' : colors.border }}>
              <View style={s.alertRow}>
                <View style={[s.alertIconWrap, { backgroundColor: alert.severity === 'warning' ? '#F59E0B20' : '#3B82F620' }]}>
                  <IconSymbol name={alert.icon as any} size={14} color={alert.severity === 'warning' ? '#F59E0B' : '#3B82F6'} />
                </View>
                <View style={s.alertContent}>
                  <ThemedText style={[s.alertLabel, { color: colors.text }]}>{alert.label}</ThemedText>
                  <ThemedText style={[s.alertDetail, { color: colors.textSecondary }]}>{alert.detail}</ThemedText>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Quick Actions (staff+) */}
      {isStaffLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="QUICK ACTIONS" colors={colors} />
          <View style={s.quickActionsGrid}>
            {OVERVIEW_QUICK_ACTIONS.map((qa) => (
              <Pressable
                key={qa.id}
                style={({ pressed }) => [s.quickActionTile, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[s.quickActionIcon, { backgroundColor: qa.color + '20' }]}>
                  <IconSymbol name={qa.icon as any} size={16} color={qa.color} />
                </View>
                <ThemedText style={[s.quickActionLabel, { color: colors.text }]}>{qa.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Connection Health Snapshot */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CONNECTION HEALTH SNAPSHOT" colors={colors} icon="heart.fill" />
        <Card colors={colors}>
          <View style={s.kpiGrid}>
            {HEALTH_KPIS.map((kpi) => (
              <View key={kpi.label} style={s.kpiCell}>
                <View style={[s.kpiIconCircle, { backgroundColor: kpi.color + '18' }]}>
                  <IconSymbol name={kpi.icon as any} size={14} color={kpi.color} />
                </View>
                <ThemedText style={[s.kpiValue, { color: colors.text }]}>{kpi.value}</ThemedText>
                <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
              </View>
            ))}
          </View>
          {isStaffLevel(role) && (
            <View style={s.kpiExtraRow}>
              <ThemedText style={[s.kpiExtraText, { color: colors.textSecondary }]}>
                52% of members in a small group {'\u00B7'} 34% serving regularly {'\u00B7'} 4 campuses active
              </ThemedText>
            </View>
          )}
        </Card>
      </View>

      {/* Community Spotlight */}
      <View style={s.moduleContainer}>
        <SectionHeader title="COMMUNITY SPOTLIGHT" colors={colors} icon="sparkles" />
        <Card colors={colors} style={{ borderColor: '#F59E0B40' }}>
          <View style={s.spotlightHeader}>
            <View style={[s.spotlightAvatar, { backgroundColor: '#F59E0B20' }]}>
              <ThemedText style={[s.spotlightInitials, { color: '#F59E0B' }]}>MJ</ThemedText>
            </View>
            <View style={s.spotlightHeaderText}>
              <ThemedText style={[s.spotlightName, { color: colors.text }]}>{COMMUNITY_SPOTLIGHT.name}</ThemedText>
              <ThemedText style={[s.spotlightCampus, { color: colors.textTertiary }]}>
                {COMMUNITY_SPOTLIGHT.campus} {'\u00B7'} {COMMUNITY_SPOTLIGHT.memberSince}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[s.spotlightStory, { color: colors.textSecondary }]}>
            {COMMUNITY_SPOTLIGHT.story}
          </ThemedText>
        </Card>
      </View>

      {/* Recent Community Events */}
      <View style={s.moduleContainer}>
        <SectionHeader title="UPCOMING EVENTS" colors={colors} action="See All" />
        {RECENT_EVENTS.map((evt) => (
          <Card key={evt.id} colors={colors}>
            <View style={s.eventRow}>
              <View style={[s.eventTypeBadge, { backgroundColor: evt.typeColor + '20' }]}>
                <ThemedText style={[s.eventTypeText, { color: evt.typeColor }]}>{evt.type}</ThemedText>
              </View>
              <View style={s.eventInfo}>
                <ThemedText style={[s.eventTitle, { color: colors.text }]}>{evt.title}</ThemedText>
                <ThemedText style={[s.eventDate, { color: colors.textSecondary }]}>{evt.date}</ThemedText>
                <ThemedText style={[s.eventLocation, { color: colors.textTertiary }]}>{evt.location}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </View>
          </Card>
        ))}
      </View>

      {/* Get Connected CTA */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GET CONNECTED" colors={colors} />
        <Card colors={colors}>
          <ThemedText style={[s.ctaDescription, { color: colors.textSecondary }]}>
            There is a place for you here. Whether you are looking for community, want to grow in your faith, or are ready to serve \u2014 we would love to help you take your next step.
          </ThemedText>
          <View style={s.ctaButtonRow}>
            <Pressable
              style={({ pressed }) => [s.ctaButton, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="person.2.fill" size={14} color="#8B5CF6" />
              <ThemedText style={[s.ctaButtonText, { color: colors.text }]}>Join a Small Group</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.ctaButton, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="heart.fill" size={14} color="#22C55E" />
              <ThemedText style={[s.ctaButtonText, { color: colors.text }]}>Start Serving</ThemedText>
            </Pressable>
          </View>
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW 2: PEOPLE
// =============================================================================

function PeopleView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<PeopleFilter>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showContactInfo = isStaffLevel(role); // C1/C2/C3 see contact info + notes
  const showNotes = isElderLevel(role); // C1/C2 see pastoral notes
  const isLimitedDirectory = !isStaffLevel(role); // C4 sees limited directory

  // C4 sees only leaders and staff (limited info)
  const baseList = useMemo(() => {
    if (isLimitedDirectory) return PEOPLE_DIRECTORY.filter((p) => p.category === 'leader' || p.category === 'staff');
    return PEOPLE_DIRECTORY;
  }, [isLimitedDirectory]);

  const filtered = useMemo(() => {
    let list = baseList;

    // Apply category filter
    if (filter !== 'All') {
      const cat = FILTER_TO_CATEGORY[filter];
      if (cat !== 'all') list = list.filter((p) => p.category === cat);
    }

    // Apply search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.ministry.toLowerCase().includes(q) ||
          p.campus.toLowerCase().includes(q)
      );
    }
    return list;
  }, [baseList, filter, searchText]);

  // Available filter chips for role
  const availableFilters = useMemo(() => {
    if (isLimitedDirectory) return ['All', 'Leaders', 'Staff'] as PeopleFilter[];
    return [...PEOPLE_FILTER_CHIPS] as PeopleFilter[];
  }, [isLimitedDirectory]);

  const categoryColor = (cat: PersonEntry['category']): string => {
    switch (cat) {
      case 'leader': return '#F59E0B';
      case 'staff': return '#3B82F6';
      case 'member': return '#22C55E';
      case 'new-member': return '#8B5CF6';
      case 'visitor': return '#EC4899';
      default: return '#6B7280';
    }
  };

  return (
    <View>
      {/* People Summary */}
      {isStaffLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="PEOPLE OVERVIEW" colors={colors} />
          <Card colors={colors}>
            <View style={s.summaryGrid}>
              {[
                { v: '4,200', l: 'Members' },
                { v: '48', l: 'Staff' },
                { v: '38', l: 'New (Q1)' },
                { v: '3', l: 'Campuses' },
              ].map((item) => (
                <View key={item.l} style={s.summaryStat}>
                  <ThemedText style={[s.summaryValue, { color: colors.text }]}>{item.v}</ThemedText>
                  <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
                </View>
              ))}
            </View>
            {isElderLevel(role) && (
              <View style={s.summaryExtraRow}>
                <ThemedText style={[s.summaryExtraText, { color: colors.textSecondary }]}>
                  78% connected rate {'\u00B7'} 86% volunteer retention {'\u00B7'} 47 new visitors (MTD)
                </ThemedText>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Search bar */}
      <View style={s.moduleContainer}>
        <View style={[s.searchContainer, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={14} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search by name, role, or ministry..."
            placeholderTextColor={colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <IconSymbol name="xmark.circle.fill" size={14} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
          {availableFilters.map((chip) => (
            <Pressable
              key={chip}
              style={[
                s.filterChip,
                {
                  backgroundColor: chip === filter ? '#FFFFFF18' : colors.backgroundTertiary,
                  borderColor: chip === filter ? colors.text : colors.border,
                },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(chip); }}
            >
              <ThemedText style={[s.filterChipText, { color: chip === filter ? colors.text : colors.textSecondary }]}>
                {chip}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Directory Results */}
      <View style={s.moduleContainer}>
        <SectionHeader title="DIRECTORY" colors={colors} count={filtered.length} />
        <Card colors={colors}>
          {filtered.length === 0 && (
            <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
              No results found. Try adjusting your search or filters.
            </ThemedText>
          )}
          {filtered.map((person, idx) => {
            const isExpanded = expandedId === person.id;
            const initials = person.name.split(' ').filter((n) => n.length > 0 && n[0] !== '&').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
            const catColor = categoryColor(person.category);
            const catLabel = person.category === 'new-member' ? 'NEW' : person.category === 'leader' ? 'LEADER' : person.category.toUpperCase();

            return (
              <Pressable
                key={person.id}
                style={[
                  s.personRow,
                  idx < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedId(isExpanded ? null : person.id);
                }}
              >
                <View style={[s.avatarCircle, { backgroundColor: catColor + '20' }]}>
                  <ThemedText style={[s.avatarText, { color: catColor }]}>{initials}</ThemedText>
                </View>
                <View style={s.personContent}>
                  <View style={s.personNameRow}>
                    <ThemedText style={[s.personName, { color: colors.text }]} numberOfLines={1}>
                      {person.name}
                    </ThemedText>
                    <View style={[s.roleBadge, { backgroundColor: catColor + '20' }]}>
                      <ThemedText style={[s.roleBadgeText, { color: catColor }]}>{catLabel}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.personTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {person.role}
                  </ThemedText>
                  <ThemedText style={[s.personDept, { color: colors.textTertiary }]}>
                    {person.ministry} {'\u00B7'} {person.campus} {'\u00B7'} Since {person.memberSince}
                  </ThemedText>

                  {/* Follow-up status + sensitivity badges (staff+) */}
                  {showContactInfo && (person.followUpStatus || person.sensitivity === 'restricted') && (
                    <View style={s.personBadgeRow}>
                      {person.followUpStatus && person.followUpStatus !== 'none' && (
                        <View style={[s.fuBadge, { backgroundColor: FOLLOW_UP_COLORS[person.followUpStatus] + '20' }]}>
                          <ThemedText style={[s.fuBadgeText, { color: FOLLOW_UP_COLORS[person.followUpStatus] }]}>
                            {FOLLOW_UP_LABELS[person.followUpStatus].toUpperCase()}
                          </ThemedText>
                        </View>
                      )}
                      {person.sensitivity === 'restricted' && (
                        <View style={[s.fuBadge, { backgroundColor: '#EF444420' }]}>
                          <IconSymbol name="lock.fill" size={8} color="#EF4444" />
                          <ThemedText style={[s.fuBadgeText, { color: '#EF4444' }]}>RESTRICTED</ThemedText>
                        </View>
                      )}
                    </View>
                  )}

                  {isExpanded && (
                    <View style={s.expandedDetails}>
                      {showContactInfo && (
                        <>
                          <View style={s.detailRow}>
                            <IconSymbol name="envelope.fill" size={11} color={colors.textSecondary} />
                            <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.email}</ThemedText>
                          </View>
                          <View style={s.detailRow}>
                            <IconSymbol name="phone.fill" size={11} color={colors.textSecondary} />
                            <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.phone}</ThemedText>
                          </View>
                        </>
                      )}
                      {!showContactInfo && (
                        <View style={s.detailRow}>
                          <IconSymbol name="envelope.fill" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.email}</ThemedText>
                        </View>
                      )}
                      <View style={s.detailRow}>
                        <IconSymbol name="building.2.fill" size={11} color={colors.textSecondary} />
                        <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>Campus: {person.campus}</ThemedText>
                      </View>
                      {showNotes && person.notes && (
                        <View style={s.detailRow}>
                          <IconSymbol name="note.text" size={11} color={colors.textSecondary} />
                          <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{person.notes}</ThemedText>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down' as any}
                  size={12}
                  color={colors.textTertiary}
                />
              </Pressable>
            );
          })}
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW 3: GROUPS
// =============================================================================

function GroupsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showHealthMetrics = isElderLevel(role); // C1/C2 see attendance trends

  const filtered = useMemo(() => {
    if (!searchText.trim()) return GROUPS;
    const q = searchText.toLowerCase();
    return GROUPS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.leader.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q) ||
        g.campus.toLowerCase().includes(q)
    );
  }, [searchText]);

  const openGroups = GROUPS.filter((g) => g.status === 'open').length;
  const totalMembers = GROUPS.reduce((sum, g) => sum + g.currentMembers, 0);

  return (
    <View>
      {/* Groups Summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GROUPS OVERVIEW" colors={colors} />
        <Card colors={colors}>
          <View style={s.summaryGrid}>
            {[
              { v: String(GROUPS.length), l: 'Total Groups' },
              { v: String(openGroups), l: 'Open' },
              { v: String(totalMembers), l: 'Total Members' },
              { v: String(GROUPS.length - openGroups), l: 'Closed/Full' },
            ].map((item) => (
              <View key={item.l} style={s.summaryStat}>
                <ThemedText style={[s.summaryValue, { color: colors.text }]}>{item.v}</ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
              </View>
            ))}
          </View>
          {showHealthMetrics && (
            <View style={s.summaryExtraRow}>
              <ThemedText style={[s.summaryExtraText, { color: colors.textSecondary }]}>
                Avg attendance: 83% {'\u00B7'} 6 groups trending up {'\u00B7'} 4 new groups this year
              </ThemedText>
            </View>
          )}
        </Card>
      </View>

      {/* Search */}
      <View style={s.moduleContainer}>
        <View style={[s.searchContainer, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={14} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Find a group by name, type, or leader..."
            placeholderTextColor={colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <IconSymbol name="xmark.circle.fill" size={14} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Group List */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ALL GROUPS" colors={colors} count={filtered.length} />
        {filtered.map((group) => {
          const isExpanded = expandedId === group.id;
          const isFull = group.currentMembers >= group.capacity;
          const typeColor = GROUP_TYPE_COLORS[group.type] ?? '#6B7280';
          const fillPct = Math.round((group.currentMembers / group.capacity) * 100);

          return (
            <Pressable
              key={group.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedId(isExpanded ? null : group.id);
              }}
            >
              <Card colors={colors}>
                <View style={s.groupHeader}>
                  <View style={[s.groupTypeDot, { backgroundColor: typeColor }]} />
                  <View style={s.groupInfo}>
                    <View style={s.groupNameRow}>
                      <ThemedText style={[s.groupName, { color: colors.text }]} numberOfLines={1}>
                        {group.name}
                      </ThemedText>
                      <View style={[s.groupTypeBadge, { backgroundColor: typeColor + '20' }]}>
                        <ThemedText style={[s.groupTypeText, { color: typeColor }]}>{group.type}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={[s.groupLeader, { color: colors.textSecondary }]}>{group.leader}</ThemedText>
                    <ThemedText style={[s.groupSchedule, { color: colors.textTertiary }]}>
                      {group.dayTime} {'\u00B7'} {group.location}
                    </ThemedText>
                  </View>
                </View>

                <View style={s.groupBottomRow}>
                  <ThemedText style={[s.groupMembers, { color: colors.textTertiary }]}>
                    {group.currentMembers}/{group.capacity} members
                  </ThemedText>
                  {group.health && (
                    <View style={[s.groupHealthBadge, { backgroundColor: GROUP_HEALTH_COLOR[group.health] + '20' }]}>
                      <View style={[s.groupHealthDot, { backgroundColor: GROUP_HEALTH_COLOR[group.health] }]} />
                      <ThemedText style={[s.groupHealthBadgeText, { color: GROUP_HEALTH_COLOR[group.health] }]}>
                        {GROUP_HEALTH_LABEL[group.health]}
                      </ThemedText>
                    </View>
                  )}
                  {isFull ? (
                    <View style={[s.groupStatusBadge, { backgroundColor: '#EF444420' }]}>
                      <ThemedText style={[s.groupStatusText, { color: '#EF4444' }]}>FULL</ThemedText>
                    </View>
                  ) : group.status === 'open' ? (
                    <View style={[s.groupStatusBadge, { backgroundColor: '#22C55E20' }]}>
                      <ThemedText style={[s.groupStatusText, { color: '#22C55E' }]}>OPEN</ThemedText>
                    </View>
                  ) : (
                    <View style={[s.groupStatusBadge, { backgroundColor: '#F59E0B20' }]}>
                      <ThemedText style={[s.groupStatusText, { color: '#F59E0B' }]}>CLOSED</ThemedText>
                    </View>
                  )}
                </View>

                {/* Fill bar */}
                <View style={[s.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.progressBarFill, { width: `${fillPct}%`, backgroundColor: isFull ? '#EF4444' : typeColor }]} />
                </View>

                {/* Expanded details */}
                {isExpanded && (
                  <View style={s.groupExpandedDetails}>
                    <View style={s.detailRow}>
                      <IconSymbol name="building.2.fill" size={11} color={colors.textSecondary} />
                      <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>Campus: {group.campus}</ThemedText>
                    </View>
                    {showHealthMetrics && group.avgAttendance != null && (
                      <View style={s.detailRow}>
                        <IconSymbol name="chart.bar.fill" size={11} color={colors.textSecondary} />
                        <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>
                          Avg attendance: {group.avgAttendance}%
                        </ThemedText>
                      </View>
                    )}
                    {showHealthMetrics && group.trend && (
                      <View style={s.detailRow}>
                        <IconSymbol
                          name={group.trend === 'up' ? 'arrow.up.right' : group.trend === 'down' ? 'arrow.down.right' : 'arrow.right' as any}
                          size={11}
                          color={group.trend === 'up' ? '#22C55E' : group.trend === 'down' ? '#EF4444' : '#F59E0B'}
                        />
                        <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>
                          Trend: {group.trend === 'up' ? 'Growing' : group.trend === 'down' ? 'Declining' : 'Stable'}
                        </ThemedText>
                      </View>
                    )}
                    {!isFull && group.status === 'open' && (
                      <Pressable
                        style={({ pressed }) => [s.groupJoinCTA, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      >
                        <IconSymbol name="person.badge.plus" size={12} color={typeColor} />
                        <ThemedText style={[s.groupJoinText, { color: colors.text }]}>Request to Join</ThemedText>
                      </Pressable>
                    )}
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// =============================================================================
// VIEW 4: CARE & FOLLOW-UP
// =============================================================================

function CareView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<CareStatus | 'all'>('all');

  // C3 sees only their assigned cases (mock: show first 5)
  const isAssignedOnly = !isElderLevel(role);

  const baseCases = useMemo(() => {
    if (isAssignedOnly) {
      // Staff sees a limited set (mock: filter to 5 cases assigned to generic staff)
      return CARE_CASES.filter((_c, idx) => idx < 5);
    }
    return CARE_CASES;
  }, [isAssignedOnly]);

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return baseCases;
    return baseCases.filter((c) => c.status === filterStatus);
  }, [baseCases, filterStatus]);

  const statusFilters: { id: CareStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <View>
      {/* Care Stats */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CARE DASHBOARD" colors={colors} icon="heart.text.square.fill" />
        <Card colors={colors}>
          <View style={s.summaryGrid}>
            {[
              { v: String(CARE_STATS.activeCases), l: 'Active Cases', c: '#3B82F6' },
              { v: String(CARE_STATS.resolvedThisMonth), l: 'Resolved (Mo)', c: '#22C55E' },
              { v: CARE_STATS.avgResponseTime, l: 'Avg Response', c: colors.text },
              { v: String(CARE_STATS.pendingAssignment), l: 'Pending', c: '#F59E0B' },
            ].map((item) => (
              <View key={item.l} style={s.summaryStat}>
                <ThemedText style={[s.summaryValue, { color: item.c }]}>{item.v}</ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
              </View>
            ))}
          </View>
          {isElderLevel(role) && (
            <View style={s.summaryExtraRow}>
              <ThemedText style={[s.summaryExtraText, { color: colors.textSecondary }]}>
                3 high priority {'\u00B7'} 2 hospital visits active {'\u00B7'} 3 new member follow-ups in progress
              </ThemedText>
            </View>
          )}
        </Card>
      </View>

      {/* Status Filter */}
      <View style={s.moduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
          {statusFilters.map((chip) => (
            <Pressable
              key={chip.id}
              style={[
                s.filterChip,
                {
                  backgroundColor: chip.id === filterStatus ? '#FFFFFF18' : colors.backgroundTertiary,
                  borderColor: chip.id === filterStatus ? colors.text : colors.border,
                },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilterStatus(chip.id); }}
            >
              <ThemedText style={[s.filterChipText, { color: chip.id === filterStatus ? colors.text : colors.textSecondary }]}>
                {chip.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Limited notice for staff */}
      {isAssignedOnly && (
        <View style={s.moduleContainer}>
          <Card colors={colors}>
            <View style={s.limitedNotice}>
              <IconSymbol name="info.circle.fill" size={14} color={colors.textTertiary} />
              <ThemedText style={[s.limitedNoticeText, { color: colors.textTertiary }]}>
                Showing cases assigned to you. Full care dashboard requires Elder-level access.
              </ThemedText>
            </View>
          </Card>
        </View>
      )}

      {/* 3 Named Queues */}
      {(() => {
        const newVisitors = filtered.filter((c) => c.type === 'new-member-followup');
        const followUps = filtered.filter((c) => c.type !== 'new-member-followup' && c.type !== 'counseling' && c.type !== 'crisis');
        const careRestricted = filtered.filter((c) => c.type === 'counseling' || c.type === 'crisis');

        const renderCareCard = (cc: CareCase) => {
          const isExpanded = expandedId === cc.id;
          const typeColor = CARE_TYPE_COLORS[cc.type] ?? '#6B7280';
          const priorityColor = PRIORITY_COLORS[cc.priority];
          const statusColor = STATUS_COLORS[cc.status];

          return (
            <Pressable
              key={cc.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedId(isExpanded ? null : cc.id);
              }}
            >
              <Card colors={colors}>
                <View style={s.caseHeader}>
                  <View style={[s.casePriorityDot, { backgroundColor: priorityColor }]} />
                  <View style={s.caseHeaderContent}>
                    <View style={s.caseNameRow}>
                      <ThemedText style={[s.caseName, { color: colors.text }]} numberOfLines={1}>
                        {cc.personName}
                      </ThemedText>
                      <View style={[s.caseStatusBadge, { backgroundColor: statusColor + '20' }]}>
                        <ThemedText style={[s.caseStatusText, { color: statusColor }]}>
                          {cc.status.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={s.caseTypeRow}>
                      <View style={[s.caseTypeBadge, { backgroundColor: typeColor + '20' }]}>
                        <ThemedText style={[s.caseTypeText, { color: typeColor }]}>{cc.typeLabel}</ThemedText>
                      </View>
                      <View style={[s.casePriorityBadge, { backgroundColor: priorityColor + '20' }]}>
                        <ThemedText style={[s.casePriorityText, { color: priorityColor }]}>
                          {cc.priority.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={[s.caseAssigned, { color: colors.textSecondary }]}>
                      Assigned to: {cc.assignedTo}
                    </ThemedText>
                    <ThemedText style={[s.caseLastContact, { color: colors.textTertiary }]}>
                      Last contact: {cc.lastContact}
                    </ThemedText>
                  </View>
                </View>

                {isExpanded && cc.notes && (
                  <View style={s.caseExpandedNotes}>
                    <View style={s.detailRow}>
                      <IconSymbol name="note.text" size={11} color={colors.textSecondary} />
                      <ThemedText style={[s.detailText, { color: colors.textSecondary }]}>{cc.notes}</ThemedText>
                    </View>
                    {isElderLevel(role) && (
                      <Pressable
                        style={({ pressed }) => [s.caseAction, { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      >
                        <IconSymbol name="phone.fill" size={12} color={colors.textSecondary} />
                        <ThemedText style={[s.caseActionText, { color: colors.textSecondary }]}>Log Follow-up</ThemedText>
                      </Pressable>
                    )}
                  </View>
                )}
              </Card>
            </Pressable>
          );
        };

        return (
          <>
            {/* Queue 1: New Visitor Queue */}
            {newVisitors.length > 0 && (
              <View style={s.moduleContainer}>
                <SectionHeader title="NEW VISITOR QUEUE" colors={colors} count={newVisitors.length} icon="person.badge.plus" />
                <View style={[s.slaBanner, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B30' }]}>
                  <IconSymbol name="clock.fill" size={11} color="#F59E0B" />
                  <ThemedText style={[s.slaBannerText, { color: '#F59E0B' }]}>48h SLA — contact within 48 hours of first visit</ThemedText>
                </View>
                {newVisitors.map(renderCareCard)}
              </View>
            )}

            {/* Queue 2: Follow-up Queue */}
            {followUps.length > 0 && (
              <View style={s.moduleContainer}>
                <SectionHeader title="FOLLOW-UP QUEUE" colors={colors} count={followUps.length} icon="arrow.uturn.forward" />
                {followUps.map(renderCareCard)}
              </View>
            )}

            {/* Queue 3: Care Requests (restricted — elder+ only) */}
            {careRestricted.length > 0 && isElderLevel(role) && (
              <View style={s.moduleContainer}>
                <SectionHeader title="CARE REQUESTS" colors={colors} count={careRestricted.length} icon="lock.fill" />
                <View style={[s.slaBanner, { backgroundColor: '#EF444415', borderColor: '#EF444430' }]}>
                  <IconSymbol name="lock.fill" size={11} color="#EF4444" />
                  <ThemedText style={[s.slaBannerText, { color: '#EF4444' }]}>Restricted — pastoral care cases visible to C1/C2 only</ThemedText>
                </View>
                {careRestricted.map(renderCareCard)}
              </View>
            )}

            {filtered.length === 0 && (
              <View style={s.moduleContainer}>
                <Card colors={colors}>
                  <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>
                    No cases match your current filter.
                  </ThemedText>
                </Card>
              </View>
            )}
          </>
        );
      })()}
    </View>
  );
}

// =============================================================================
// VIEW 5: SERVE (VOLUNTEERS)
// =============================================================================

function ServeView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const showAnalytics = isElderLevel(role); // C1/C2 see volunteer analytics

  return (
    <View>
      {/* Serve Stats */}
      <View style={s.moduleContainer}>
        <SectionHeader title="VOLUNTEER DASHBOARD" colors={colors} icon="hand.raised.fill" />
        <Card colors={colors}>
          <View style={s.summaryGrid}>
            {[
              { v: String(SERVE_STATS.totalVolunteers), l: 'Total Volunteers', c: colors.text },
              { v: String(SERVE_STATS.openPositionsThisWeek), l: 'Open This Week', c: '#F59E0B' },
              { v: String(SERVE_STATS.newVolunteersThisMonth), l: 'New (Mo)', c: '#22C55E' },
              ...(showAnalytics ? [{ v: SERVE_STATS.retentionRate, l: 'Retention', c: '#3B82F6' }] : [{ v: SERVE_STATS.avgHoursPerMonth, l: 'Avg Hrs/Mo', c: colors.text }]),
            ].map((item) => (
              <View key={item.l} style={s.summaryStat}>
                <ThemedText style={[s.summaryValue, { color: item.c }]}>{item.v}</ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
              </View>
            ))}
          </View>
          {showAnalytics && (
            <View style={s.summaryExtraRow}>
              <ThemedText style={[s.summaryExtraText, { color: colors.textSecondary }]}>
                Avg {SERVE_STATS.avgHoursPerMonth} hrs/mo {'\u00B7'} 32 open positions {'\u00B7'} 8 teams active
              </ThemedText>
            </View>
          )}
        </Card>
      </View>

      {/* Volunteer Teams */}
      <View style={s.moduleContainer}>
        <SectionHeader title="VOLUNTEER TEAMS" colors={colors} count={VOLUNTEER_TEAMS.length} />
        {VOLUNTEER_TEAMS.map((team) => {
          const totalNeeded = team.headcount + team.needed;
          const fillPct = Math.round((team.headcount / totalNeeded) * 100);

          return (
            <Card key={team.id} colors={colors}>
              <View style={s.teamHeader}>
                <View style={[s.teamColorBar, { backgroundColor: team.color }]} />
                <View style={s.teamInfo}>
                  <View style={s.teamNameRow}>
                    <ThemedText style={[s.teamName, { color: colors.text }]}>{team.name}</ThemedText>
                    <ThemedText style={[s.teamHeadcount, { color: colors.textSecondary }]}>
                      {team.headcount} volunteers
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.teamLead, { color: colors.textTertiary }]}>
                    Lead: {team.lead}
                  </ThemedText>
                </View>
              </View>

              {/* Fill bar */}
              <View style={[s.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View style={[s.progressBarFill, { width: `${fillPct}%`, backgroundColor: team.color }]} />
              </View>

              {team.needed > 0 && (
                <View style={s.teamNeededRow}>
                  <IconSymbol name="exclamationmark.circle.fill" size={11} color="#F59E0B" />
                  <ThemedText style={[s.teamNeededText, { color: '#F59E0B' }]}>
                    {team.needed} position{team.needed !== 1 ? 's' : ''} needed
                  </ThemedText>
                </View>
              )}

              {showAnalytics && (
                <View style={s.teamAnalyticsRow}>
                  <ThemedText style={[s.teamAnalyticsText, { color: colors.textTertiary }]}>
                    Fill rate: {fillPct}% {'\u00B7'} {team.headcount}/{totalNeeded} positions
                  </ThemedText>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Sign Up CTA */}
      <View style={s.moduleContainer}>
        <Card colors={colors}>
          <View style={s.serveCTAContent}>
            <IconSymbol name="heart.fill" size={24} color="#22C55E" />
            <ThemedText style={[s.serveCTATitle, { color: colors.text }]}>Ready to Serve?</ThemedText>
            <ThemedText style={[s.serveCTADescription, { color: colors.textSecondary }]}>
              Use your gifts to make a difference. Every team needs people like you. Sign up and we will connect you to the right ministry.
            </ThemedText>
            <Pressable
              style={({ pressed }) => [s.serveCTAButton, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="hand.raised.fill" size={14} color="#22C55E" />
              <ThemedText style={[s.serveCTAButtonText, { color: colors.text }]}>Sign Up to Serve</ThemedText>
            </Pressable>
          </View>
        </Card>
      </View>

      {/* Volunteer Analytics (C1/C2 only) */}
      {showAnalytics && (
        <View style={s.moduleContainer}>
          <SectionHeader title="VOLUNTEER ANALYTICS" colors={colors} icon="chart.bar.fill" />
          <Card colors={colors}>
            <View style={s.analyticsGrid}>
              {[
                { label: 'Total Hrs (MTD)', value: '2,034', color: '#3B82F6' },
                { label: 'Avg Engagement', value: '4.2/wk', color: '#8B5CF6' },
                { label: 'New Sign-ups (Q1)', value: '24', color: '#22C55E' },
                { label: 'Burnout Risk', value: '6%', color: '#EF4444' },
                { label: 'First-Time Servers', value: '12', color: '#F59E0B' },
                { label: 'Returning Rate', value: '91%', color: '#06B6D4' },
              ].map((item) => (
                <View key={item.label} style={[s.analyticsCell, { borderColor: colors.border }]}>
                  <ThemedText style={[s.analyticsValue, { color: item.color }]}>{item.value}</ThemedText>
                  <ThemedText style={[s.analyticsLabel, { color: colors.textSecondary }]}>{item.label}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// BLOCK: HIDDEN NOTICE (C5 fallback for restricted views)
// =============================================================================

function HiddenNotice({ colors, message }: { colors: typeof Colors.light; message?: string }) {
  return (
    <View style={s.hiddenContainer}>
      <Card colors={colors}>
        <View style={s.hiddenContent}>
          <IconSymbol name="lock.fill" size={28} color={colors.textTertiary} />
          <ThemedText style={[s.hiddenTitle, { color: colors.text }]}>
            Community Access Limited
          </ThemedText>
          <ThemedText style={[s.hiddenText, { color: colors.textSecondary }]}>
            {message ?? 'This section is available to church members and staff. Visit us on Sunday or fill out a connect card to get started.'}
          </ThemedText>
        </View>
      </Card>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchCommunity({ colors, role = 'C1', onSwitchTab }: Props) {
  const [activeView, setActiveView] = useState<CommunityView>('overview');

  // Ensure active view is accessible for current role
  const effectiveView = canAccessView(activeView, role) ? activeView : 'overview';

  const renderActiveView = () => {
    switch (effectiveView) {
      case 'overview':
        return <OverviewView colors={colors} role={role} />;
      case 'people':
        return <PeopleView colors={colors} role={role} />;
      case 'groups':
        return <GroupsView colors={colors} role={role} />;
      case 'care':
        return <CareView colors={colors} role={role} />;
      case 'serve':
        return <ServeView colors={colors} role={role} />;
      default:
        return <OverviewView colors={colors} role={role} />;
    }
  };

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Pill toggle */}
      <ViewToggle
        colors={colors}
        activeView={effectiveView}
        onSelect={setActiveView}
        role={role}
      />

      {/* Active view */}
      {renderActiveView()}

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

  // Card
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },

  // Summary Grid (shared)
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.sm },
  summaryStat: { alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700' },
  summaryLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  summaryExtraRow: { marginTop: Spacing.sm },
  summaryExtraText: { fontSize: 11, textAlign: 'center' },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: Spacing.lg },

  // Search
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 10,
    borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // Filters
  filterRow: { marginBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full,
    marginRight: Spacing.xs, borderWidth: StyleSheet.hairlineWidth,
  },
  filterChipText: { fontSize: 11, fontWeight: '600' },

  // ---- Overview: KPI Grid ----
  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
  },
  kpiCell: {
    width: '33.33%', alignItems: 'center', paddingVertical: 12,
  },
  kpiIconCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  kpiValue: { fontSize: 18, fontWeight: '800' },
  kpiLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2, textAlign: 'center' },
  kpiExtraRow: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#FFFFFF10' },
  kpiExtraText: { fontSize: 11, textAlign: 'center' },

  // ---- Overview: Spotlight ----
  spotlightHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm },
  spotlightAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  spotlightInitials: { fontSize: 16, fontWeight: '800' },
  spotlightHeaderText: { flex: 1 },
  spotlightName: { fontSize: 15, fontWeight: '700' },
  spotlightCampus: { fontSize: 11, marginTop: 2 },
  spotlightStory: { fontSize: 13, lineHeight: 19 },

  // ---- Overview: Events ----
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventTypeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  eventTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  eventDate: { fontSize: 12, marginBottom: 1 },
  eventLocation: { fontSize: 11 },

  // ---- Overview: CTA ----
  ctaDescription: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.md },
  ctaButtonRow: { flexDirection: 'row', gap: Spacing.sm },
  ctaButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
  },
  ctaButtonText: { fontSize: 12, fontWeight: '600' },

  // ---- People: Person rows ----
  personRow: { flexDirection: 'row', paddingVertical: 12, gap: Spacing.sm },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700' },
  personContent: { flex: 1 },
  personNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1, flexWrap: 'wrap' },
  personName: { fontSize: 14, fontWeight: '600' },
  personTitle: { fontSize: 12, marginBottom: 1 },
  personDept: { fontSize: 11 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  roleBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Expanded details (shared)
  expandedDetails: { marginTop: Spacing.sm, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  detailText: { fontSize: 12, flex: 1 },

  // ---- Groups ----
  groupHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: Spacing.sm },
  groupTypeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  groupInfo: { flex: 1 },
  groupNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  groupName: { fontSize: 14, fontWeight: '600', flex: 1 },
  groupTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  groupTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  groupLeader: { fontSize: 12, marginBottom: 2 },
  groupSchedule: { fontSize: 11, lineHeight: 15 },
  groupBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  groupMembers: { fontSize: 11 },
  groupStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  groupStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  groupExpandedDetails: { marginTop: Spacing.sm, gap: 6 },
  groupJoinCTA: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm,
  },
  groupJoinText: { fontSize: 12, fontWeight: '600' },

  // Progress bar
  progressBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },

  // ---- Care ----
  caseHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  casePriorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  caseHeaderContent: { flex: 1 },
  caseNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  caseName: { fontSize: 14, fontWeight: '600', flex: 1 },
  caseStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  caseStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  caseTypeRow: { flexDirection: 'row', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  caseTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  caseTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  casePriorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  casePriorityText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  caseAssigned: { fontSize: 12, marginBottom: 2 },
  caseLastContact: { fontSize: 11 },
  caseExpandedNotes: { marginTop: Spacing.sm, gap: 8 },
  caseAction: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md, marginTop: 4,
  },
  caseActionText: { fontSize: 12, fontWeight: '600' },

  // Limited notice
  limitedNotice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  limitedNoticeText: { fontSize: 12, flex: 1 },

  // ---- Serve: Teams ----
  teamHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: Spacing.sm },
  teamColorBar: { width: 4, height: 36, borderRadius: 2 },
  teamInfo: { flex: 1 },
  teamNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamName: { fontSize: 14, fontWeight: '600' },
  teamHeadcount: { fontSize: 11 },
  teamLead: { fontSize: 11, marginTop: 2 },
  teamNeededRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  teamNeededText: { fontSize: 11, fontWeight: '600' },
  teamAnalyticsRow: { marginTop: 4 },
  teamAnalyticsText: { fontSize: 10 },

  // ---- Serve: CTA ----
  serveCTAContent: { alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  serveCTATitle: { fontSize: 18, fontWeight: '700' },
  serveCTADescription: { fontSize: 13, lineHeight: 18, textAlign: 'center', paddingHorizontal: Spacing.sm },
  serveCTAButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm,
  },
  serveCTAButtonText: { fontSize: 14, fontWeight: '600' },

  // ---- Serve: Analytics Grid ----
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  analyticsCell: {
    width: '50%', paddingVertical: 12, paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  analyticsValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  analyticsLabel: { fontSize: 11, fontWeight: '500' },

  // ---- Hidden notice ----
  hiddenContainer: { marginTop: Spacing.xl },
  hiddenContent: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  hiddenTitle: { fontSize: 16, fontWeight: '700' },
  hiddenText: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: Spacing.md },

  // ---- Overview: Alerts ----
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  alertIconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  alertContent: { flex: 1 },
  alertLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  alertDetail: { fontSize: 11, lineHeight: 15 },

  // ---- Overview: Quick Actions ----
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickActionTile: {
    width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
  },
  quickActionIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 12, fontWeight: '600' },

  // ---- People: Follow-up + Sensitivity badges ----
  personBadgeRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  fuBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  fuBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },

  // ---- Groups: Health badge ----
  groupHealthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  groupHealthDot: { width: 5, height: 5, borderRadius: 2.5 },
  groupHealthBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },

  // ---- Care: SLA banner ----
  slaBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.sm, paddingVertical: 8,
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  slaBannerText: { fontSize: 11, fontWeight: '500', flex: 1 },
});
