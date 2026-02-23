/**
 * Church Prayer — 5-view pill-toggled Prayer tab.
 * Views: Feed | My Requests | Queue | Teams | Praise
 *
 * RBAC:
 *   C1 — All 5 views, sees all privacy levels including Private
 *   C2 — All 5 views, sees Leadership + Church + Public prayers
 *   C3 — Feed, My Requests, Queue, Praise (processes queue, limited team mgmt)
 *   C4 — Feed (Church + Public), My Requests, Praise
 *   C5 — Feed only (Public prayers only)
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
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isSeniorPastor,
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

type PrayerView = 'feed' | 'my-requests' | 'queue' | 'teams' | 'praise';

interface ViewDef {
  key: PrayerView;
  label: string;
}

const ALL_PRAYER_PILLS: ViewDef[] = [
  { key: 'feed', label: 'Feed' },
  { key: 'my-requests', label: 'My Requests' },
  { key: 'queue', label: 'Queue' },
  { key: 'teams', label: 'Teams' },
  { key: 'praise', label: 'Praise' },
];

function getAvailableViews(role: ChurchRoleLens): ViewDef[] {
  // C0/C1: all 5 views (system owner / senior pastor — full access including private queue & teams)
  if (role === 'C0' || role === 'C1') return ALL_PRAYER_PILLS;
  // C2: all 5 views (executive pastor — pastoral care role)
  if (role === 'C2') return ALL_PRAYER_PILLS;
  // C3-C6: feed, my-requests, queue, praise (ministry/staff level — can process prayer queue)
  if (role === 'C3' || role === 'C4' || role === 'C5' || role === 'C6') return ALL_PRAYER_PILLS.filter((v) => v.key !== 'teams');
  // C7-C8: feed, my-requests, praise (volunteer/member — submit & browse public prayers)
  if (role === 'C7' || role === 'C8') return ALL_PRAYER_PILLS.filter((v) => v.key === 'feed' || v.key === 'my-requests' || v.key === 'praise');
  // C9-C11: feed only (attendee/new believer/visitor — public prayer wall only)
  return ALL_PRAYER_PILLS.filter((v) => v.key === 'feed');
}

// =============================================================================
// INLINE MOCK DATA — FEED
// =============================================================================

type PrayerPrivacy = 'public' | 'church' | 'leadership' | 'private';
type PrayerCategory = 'health' | 'family' | 'financial' | 'guidance' | 'gratitude' | 'church' | 'world' | 'other';

interface FeedPrayer {
  id: string;
  author: string;
  isAnonymous: boolean;
  datePosted: string;
  text: string;
  category: PrayerCategory;
  privacy: PrayerPrivacy;
  prayedCount: number;
  commentCount: number;
  isUrgent: boolean;
}

const CATEGORY_COLORS: Record<PrayerCategory, string> = {
  health: '#EF4444',
  family: ACCENT,
  financial: '#22C55E',
  guidance: ACCENT,
  gratitude: '#F59E0B',
  church: ACCENT,
  world: ACCENT,
  other: '#A1A1AA',
};

const CATEGORY_LABELS: Record<PrayerCategory, string> = {
  health: 'Health',
  family: 'Family',
  financial: 'Financial',
  guidance: 'Guidance',
  gratitude: 'Gratitude',
  church: 'Church',
  world: 'World',
  other: 'Other',
};

const PRIVACY_LABELS: Record<PrayerPrivacy, string> = {
  public: 'Public',
  church: 'Church',
  leadership: 'Leadership',
  private: 'Private',
};

const PRIVACY_COLORS: Record<PrayerPrivacy, string> = {
  public: '#22C55E',
  church: ACCENT,
  leadership: '#F59E0B',
  private: '#EF4444',
};

const FEED_PRAYERS: FeedPrayer[] = [
  {
    id: 'fp-1', author: 'Sister Johnson', isAnonymous: false, datePosted: 'Feb 18, 2026',
    text: 'Please pray for my mother who is in the hospital recovering from surgery. She needs strength and healing during this difficult time.',
    category: 'health', privacy: 'public', prayedCount: 47, commentCount: 8, isUrgent: true,
  },
  {
    id: 'fp-2', author: 'Brother Martinez', isAnonymous: false, datePosted: 'Feb 17, 2026',
    text: 'Praying for a job opportunity. I was laid off two weeks ago and have a family to support. God is faithful and I trust His timing.',
    category: 'financial', privacy: 'public', prayedCount: 62, commentCount: 12, isUrgent: false,
  },
  {
    id: 'fp-3', author: 'Anonymous', isAnonymous: true, datePosted: 'Feb 17, 2026',
    text: 'Going through a difficult season in my marriage. Asking for prayer for reconciliation, patience, and wisdom for both of us.',
    category: 'family', privacy: 'church', prayedCount: 38, commentCount: 5, isUrgent: false,
  },
  {
    id: 'fp-4', author: 'Youth Group', isAnonymous: false, datePosted: 'Feb 16, 2026',
    text: 'Pray for our youth retreat next month. That God would move powerfully and young lives would be transformed for His kingdom.',
    category: 'church', privacy: 'public', prayedCount: 85, commentCount: 14, isUrgent: false,
  },
  {
    id: 'fp-5', author: 'Deaconess Williams', isAnonymous: false, datePosted: 'Feb 16, 2026',
    text: 'Pastoral concern: Family experiencing domestic hardship. Need prayer cover and practical support coordination from leadership.',
    category: 'family', privacy: 'private', prayedCount: 6, commentCount: 3, isUrgent: true,
  },
  {
    id: 'fp-6', author: 'Brother Kim', isAnonymous: false, datePosted: 'Feb 15, 2026',
    text: 'My father was just diagnosed with cancer. Asking the church family to stand with us in prayer for healing and peace.',
    category: 'health', privacy: 'public', prayedCount: 112, commentCount: 22, isUrgent: true,
  },
  {
    id: 'fp-7', author: 'Elder Thompson', isAnonymous: false, datePosted: 'Feb 15, 2026',
    text: 'Praying for wisdom as the board navigates building expansion decisions. Need discernment for stewardship of resources.',
    category: 'guidance', privacy: 'leadership', prayedCount: 14, commentCount: 4, isUrgent: false,
  },
  {
    id: 'fp-8', author: 'Sister Davis', isAnonymous: false, datePosted: 'Feb 14, 2026',
    text: 'Grateful for God\'s provision! Asking for continued guidance as I start my new role at work. Pray for favor and wisdom.',
    category: 'gratitude', privacy: 'public', prayedCount: 56, commentCount: 9, isUrgent: false,
  },
  {
    id: 'fp-9', author: 'Anonymous', isAnonymous: true, datePosted: 'Feb 14, 2026',
    text: 'Struggling with anxiety and depression. Please lift me up in prayer. I know God is near to the brokenhearted.',
    category: 'health', privacy: 'church', prayedCount: 73, commentCount: 16, isUrgent: false,
  },
  {
    id: 'fp-10', author: 'Missions Team', isAnonymous: false, datePosted: 'Feb 13, 2026',
    text: 'Pray for our missionaries in East Africa. They are facing supply challenges and need supernatural provision and protection.',
    category: 'world', privacy: 'public', prayedCount: 91, commentCount: 7, isUrgent: false,
  },
  {
    id: 'fp-11', author: 'Pastor Williams', isAnonymous: false, datePosted: 'Feb 12, 2026',
    text: 'Confidential: Staff member going through personal crisis. Please hold them in prayer. Details shared in leadership meeting.',
    category: 'other', privacy: 'leadership', prayedCount: 11, commentCount: 2, isUrgent: true,
  },
  {
    id: 'fp-12', author: 'Sister Thompson', isAnonymous: false, datePosted: 'Feb 12, 2026',
    text: 'Traveling mercies for my daughter studying abroad in South Korea. Missing her greatly but trusting God for her safety.',
    category: 'family', privacy: 'public', prayedCount: 33, commentCount: 6, isUrgent: false,
  },
  {
    id: 'fp-13', author: 'Brother Jackson', isAnonymous: false, datePosted: 'Feb 11, 2026',
    text: 'Pray for the upcoming community outreach event. That we would show the love of Christ to our neighbors and the lost.',
    category: 'church', privacy: 'public', prayedCount: 44, commentCount: 5, isUrgent: false,
  },
  {
    id: 'fp-14', author: 'Anonymous', isAnonymous: true, datePosted: 'Feb 10, 2026',
    text: 'Need financial breakthrough. Behind on mortgage and facing possible foreclosure. Believing God for a miracle.',
    category: 'financial', privacy: 'private', prayedCount: 4, commentCount: 1, isUrgent: true,
  },
  {
    id: 'fp-15', author: 'Women\'s Ministry', isAnonymous: false, datePosted: 'Feb 10, 2026',
    text: 'Lifting up all the mothers in our congregation. Pray for strength, patience, and joy in this season of raising the next generation.',
    category: 'family', privacy: 'public', prayedCount: 78, commentCount: 11, isUrgent: false,
  },
];

// =============================================================================
// INLINE MOCK DATA — MY REQUESTS
// =============================================================================

type RequestStatus = 'active' | 'answered' | 'archived';

interface MyPrayerRequest {
  id: string;
  dateSubmitted: string;
  text: string;
  category: PrayerCategory;
  privacy: PrayerPrivacy;
  status: RequestStatus;
  prayedCount: number;
  responses: number;
}

const MY_REQUESTS: MyPrayerRequest[] = [
  {
    id: 'mr-1', dateSubmitted: 'Feb 16, 2026',
    text: 'Pray for my upcoming surgery on March 1st. Trusting God for the surgeon\'s hands and a full recovery.',
    category: 'health', privacy: 'church', status: 'active', prayedCount: 34, responses: 6,
  },
  {
    id: 'mr-2', dateSubmitted: 'Feb 10, 2026',
    text: 'Seeking God\'s direction for a career change. Doors seem to be opening but I want to make sure it\'s His will.',
    category: 'guidance', privacy: 'public', status: 'active', prayedCount: 28, responses: 4,
  },
  {
    id: 'mr-3', dateSubmitted: 'Jan 28, 2026',
    text: 'Praying for my son\'s college admissions process. He\'s worked so hard and we trust God for the right school.',
    category: 'family', privacy: 'public', status: 'answered', prayedCount: 52, responses: 9,
  },
  {
    id: 'mr-4', dateSubmitted: 'Jan 15, 2026',
    text: 'Financial provision for unexpected car repairs. Trusting God to make a way where there seems to be no way.',
    category: 'financial', privacy: 'church', status: 'answered', prayedCount: 41, responses: 7,
  },
  {
    id: 'mr-5', dateSubmitted: 'Jan 5, 2026',
    text: 'Lifting up my neighbor who doesn\'t know Christ. Pray that God opens doors for gospel conversations.',
    category: 'world', privacy: 'public', status: 'active', prayedCount: 19, responses: 3,
  },
  {
    id: 'mr-6', dateSubmitted: 'Dec 20, 2025',
    text: 'Pray for family unity during the holidays. Some relationships need healing and forgiveness.',
    category: 'family', privacy: 'church', status: 'archived', prayedCount: 37, responses: 5,
  },
  {
    id: 'mr-7', dateSubmitted: 'Dec 8, 2025',
    text: 'Grateful for healing! Wanted to keep this as a record of God\'s faithfulness through my health journey.',
    category: 'gratitude', privacy: 'public', status: 'archived', prayedCount: 65, responses: 12,
  },
];

const STATUS_COLORS: Record<RequestStatus, string> = {
  active: ACCENT,
  answered: '#22C55E',
  archived: '#A1A1AA',
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  active: 'Active',
  answered: 'Answered',
  archived: 'Archived',
};

// =============================================================================
// INLINE MOCK DATA — QUEUE
// =============================================================================

type QueueUrgency = 'urgent' | 'normal' | 'low';
type FollowUpStatus = 'new' | 'in-progress' | 'contacted' | 'resolved' | 'escalated';

interface QueueItem {
  id: string;
  personName: string;
  requestSummary: string;
  category: PrayerCategory;
  urgency: QueueUrgency;
  submittedDate: string;
  assignedTo: string | null;
  followUpStatus: FollowUpStatus;
  privacy: PrayerPrivacy;
  escalated?: boolean;
  needsFollowUp?: boolean;
}

type QueueNamedFilter = 'all' | 'urgent' | 'new' | 'needs-followup' | 'my-team' | 'escalations' | 'closed';

const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'qi-1', personName: 'Deaconess Williams', requestSummary: 'Family experiencing domestic hardship — needs pastoral visit and support coordination.',
    category: 'family', urgency: 'urgent', submittedDate: 'Feb 16, 2026', assignedTo: 'Pastor Williams', followUpStatus: 'in-progress', privacy: 'private',
  },
  {
    id: 'qi-2', personName: 'Brother Chen', requestSummary: 'Suicidal ideation — crisis referral needed. Member reached out via prayer line.',
    category: 'health', urgency: 'urgent', submittedDate: 'Feb 17, 2026', assignedTo: null, followUpStatus: 'escalated', privacy: 'private', escalated: true,
  },
  {
    id: 'qi-3', personName: 'Sister Adams', requestSummary: 'Hospitalized after car accident. Family requesting pastoral visit and meal train.',
    category: 'health', urgency: 'urgent', submittedDate: 'Feb 15, 2026', assignedTo: 'Elder Thompson', followUpStatus: 'contacted', privacy: 'leadership',
  },
  {
    id: 'qi-4', personName: 'Garcia Family', requestSummary: 'Facing eviction — need benevolence fund review and community support.',
    category: 'financial', urgency: 'urgent', submittedDate: 'Feb 14, 2026', assignedTo: 'Deacon Roberts', followUpStatus: 'in-progress', privacy: 'leadership', needsFollowUp: true,
  },
  {
    id: 'qi-5', personName: 'Anonymous Member', requestSummary: 'Struggling with addiction recovery. Requesting ongoing accountability partner and prayer.',
    category: 'health', urgency: 'normal', submittedDate: 'Feb 13, 2026', assignedTo: 'Pastor Alex Kim', followUpStatus: 'in-progress', privacy: 'private',
  },
  {
    id: 'qi-6', personName: 'Brother Park', requestSummary: 'Marriage counseling request. Wife has agreed to attend sessions together.',
    category: 'family', urgency: 'normal', submittedDate: 'Feb 12, 2026', assignedTo: 'Pastor Williams', followUpStatus: 'contacted', privacy: 'private',
  },
  {
    id: 'qi-7', personName: 'Sister Okafor', requestSummary: 'Bereavement support — mother passed away last week. Needs grief counseling referral.',
    category: 'family', urgency: 'normal', submittedDate: 'Feb 11, 2026', assignedTo: null, followUpStatus: 'new', privacy: 'leadership', needsFollowUp: true,
  },
  {
    id: 'qi-8', personName: 'Youth Leader Mike', requestSummary: 'Student disclosed abuse at home. Mandatory reporting protocol initiated.',
    category: 'other', urgency: 'urgent', submittedDate: 'Feb 10, 2026', assignedTo: 'Pastor Williams', followUpStatus: 'resolved', privacy: 'private',
  },
  {
    id: 'qi-9', personName: 'Brother Lewis', requestSummary: 'Recently divorced. Requesting prayer and connection to men\'s support group.',
    category: 'family', urgency: 'low', submittedDate: 'Feb 8, 2026', assignedTo: 'Elder Thompson', followUpStatus: 'contacted', privacy: 'church',
  },
  {
    id: 'qi-10', personName: 'New Member (Visitor Card)', requestSummary: 'First-time visitor prayer card — requesting follow-up call and welcome packet.',
    category: 'church', urgency: 'low', submittedDate: 'Feb 9, 2026', assignedTo: null, followUpStatus: 'new', privacy: 'leadership',
  },
];

const URGENCY_COLORS: Record<QueueUrgency, string> = {
  urgent: '#EF4444',
  normal: '#F59E0B',
  low: '#A1A1AA',
};

const FOLLOW_UP_COLORS: Record<FollowUpStatus, string> = {
  new: ACCENT,
  'in-progress': '#F59E0B',
  contacted: ACCENT,
  resolved: '#22C55E',
  escalated: '#EF4444',
};

const FOLLOW_UP_LABELS: Record<FollowUpStatus, string> = {
  new: 'New',
  'in-progress': 'In Progress',
  contacted: 'Contacted',
  resolved: 'Resolved',
  escalated: 'Escalated',
};

const QUEUE_STATS = {
  newThisWeek: 4,
  inProgress: 5,
  resolvedThisMonth: 12,
};

// =============================================================================
// INLINE MOCK DATA — TEAMS
// =============================================================================

interface OnCallSlot {
  day: string;
  person: string;
  phone: string;
}

interface PrayerTeam {
  id: string;
  name: string;
  leader: string;
  membersCount: number;
  meetingSchedule: string;
  focusArea: string;
  attendanceRate: number;
  activeRate: number;
  onCallRotation?: OnCallSlot[];
}

const PRAYER_TEAMS: PrayerTeam[] = [
  {
    id: 'pt-1', name: 'Intercessory Prayer', leader: 'Mother Johnson', membersCount: 12,
    meetingSchedule: 'Mon 6:00 AM', focusArea: 'Corporate intercession for church body and leadership',
    attendanceRate: 83, activeRate: 92,
  },
  {
    id: 'pt-2', name: 'Pastoral Prayer Team', leader: 'Elder Thompson', membersCount: 8,
    meetingSchedule: 'On-Call', focusArea: 'Altar call, hospital visits, crisis prayer support',
    attendanceRate: 90, activeRate: 100,
    onCallRotation: [
      { day: 'Mon-Tue', person: 'Elder Thompson', phone: '(213) 555-0101' },
      { day: 'Wed-Thu', person: 'Deaconess Williams', phone: '(213) 555-0102' },
      { day: 'Fri-Sat', person: 'Mother Johnson', phone: '(213) 555-0103' },
      { day: 'Sunday', person: 'Pastor Williams', phone: '(213) 555-0100' },
    ],
  },
  {
    id: 'pt-3', name: 'Youth Prayer Warriors', leader: 'Pastor Alex Kim', membersCount: 6,
    meetingSchedule: 'Wed 5:00 PM', focusArea: 'Youth-led prayer, campus ministry intercession',
    attendanceRate: 72, activeRate: 85,
  },
  {
    id: 'pt-4', name: 'Hospital Visitation Prayer', leader: 'Deaconess Williams', membersCount: 4,
    meetingSchedule: 'As Needed', focusArea: 'Bedside prayer, family support during hospitalization',
    attendanceRate: 95, activeRate: 100,
    onCallRotation: [
      { day: 'Mon-Wed', person: 'Deaconess Williams', phone: '(213) 555-0102' },
      { day: 'Thu-Sun', person: 'Sister Adams', phone: '(213) 555-0104' },
    ],
  },
  {
    id: 'pt-5', name: 'Missions Prayer', leader: 'Sister Nguyen', membersCount: 10,
    meetingSchedule: 'Fri 7:00 AM', focusArea: 'Unreached peoples, missionary families, global church',
    attendanceRate: 68, activeRate: 78,
  },
];

// =============================================================================
// INLINE MOCK DATA — PRAISE
// =============================================================================

interface PraiseReport {
  id: string;
  title: string;
  person: string;
  isAnonymous: boolean;
  date: string;
  testimony: string;
  originalPrayerRef: string;
  category: PrayerCategory;
  praiseCount: number;
  hallelujahCount: number;
  amenCount: number;
  consentLinked: boolean; // whether the person consented to link this praise to their original prayer
}

const PRAISE_REPORTS: PraiseReport[] = [
  {
    id: 'pr-1', title: 'Healing After Surgery', person: 'Brother Jackson', isAnonymous: false,
    date: 'Feb 15, 2026', testimony: 'After 3 months of recovery from my car accident, I am walking again! The doctors said it would take 6 months minimum. God is a healer and I give Him all the glory.',
    originalPrayerRef: 'Prayer for healing after car accident (Nov 2025)', category: 'health',
    praiseCount: 156, hallelujahCount: 89, amenCount: 134, consentLinked: true,
  },
  {
    id: 'pr-2', title: 'Job Provision Beyond Expectations', person: 'Sister Nguyen', isAnonymous: false,
    date: 'Feb 12, 2026', testimony: 'God opened an incredible door. I start my new position next Monday with a 30% salary increase. He gave me more than what I asked for! Exceedingly, abundantly above.',
    originalPrayerRef: 'Prayer for employment (Jan 2026)', category: 'financial',
    praiseCount: 89, hallelujahCount: 52, amenCount: 71, consentLinked: true,
  },
  {
    id: 'pr-3', title: 'Family Restoration', person: 'Mother Williams', isAnonymous: false,
    date: 'Feb 10, 2026', testimony: 'After 5 years away from the church, my son came back last Sunday and rededicated his life to Christ. He said he felt the prayers of the saints pulling him back. God is faithful!',
    originalPrayerRef: 'Prayer for prodigal son to return (ongoing since 2021)', category: 'family',
    praiseCount: 234, hallelujahCount: 178, amenCount: 201, consentLinked: true,
  },
  {
    id: 'pr-4', title: 'Addiction Breakthrough', person: 'Anonymous', isAnonymous: true,
    date: 'Feb 8, 2026', testimony: 'One year sober today. I could not have done this without the prayer covering of this church and my accountability partners. If you are struggling, there is hope.',
    originalPrayerRef: 'Confidential prayer request (Feb 2025)', category: 'health',
    praiseCount: 198, hallelujahCount: 145, amenCount: 167, consentLinked: false,
  },
  {
    id: 'pr-5', title: 'Financial Miracle — Mortgage Saved', person: 'Garcia Family', isAnonymous: false,
    date: 'Feb 5, 2026', testimony: 'The church benevolence fund and an anonymous donor covered our back payments. We are keeping our home! The body of Christ is real.',
    originalPrayerRef: 'Prayer for housing crisis (Jan 2026)', category: 'financial',
    praiseCount: 67, hallelujahCount: 43, amenCount: 58, consentLinked: true,
  },
  {
    id: 'pr-6', title: 'Pregnancy After Years of Prayer', person: 'The Parkers', isAnonymous: false,
    date: 'Feb 2, 2026', testimony: 'After 4 years of trying and two miscarriages, we are 12 weeks pregnant with a healthy baby! Every prayer, every tear, every faith-filled word was heard by God.',
    originalPrayerRef: 'Prayer for conception (ongoing since 2022)', category: 'family',
    praiseCount: 312, hallelujahCount: 245, amenCount: 289, consentLinked: true,
  },
  {
    id: 'pr-7', title: 'Reconciliation With Estranged Father', person: 'Anonymous', isAnonymous: true,
    date: 'Jan 28, 2026', testimony: 'My father and I spoke for the first time in 8 years. We both cried. He apologized. I forgave him. God healed what seemed impossible to heal.',
    originalPrayerRef: 'Prayer for family reconciliation (2024)', category: 'family',
    praiseCount: 145, hallelujahCount: 98, amenCount: 122, consentLinked: false,
  },
  {
    id: 'pr-8', title: 'College Acceptance — Full Scholarship', person: 'Sister Davis', isAnonymous: false,
    date: 'Jan 22, 2026', testimony: 'My son got accepted to his dream medical school with a full scholarship! We prayed over every application. God ordered his steps.',
    originalPrayerRef: 'Prayer for college admissions (Oct 2025)', category: 'guidance',
    praiseCount: 94, hallelujahCount: 67, amenCount: 81, consentLinked: true,
  },
  {
    id: 'pr-9', title: 'Cancer Free — Clean Scans', person: 'Brother Kim', isAnonymous: false,
    date: 'Jan 18, 2026', testimony: 'My father\'s latest scans came back completely clean. The oncologist called it remarkable. We call it a miracle. Thank you prayer warriors!',
    originalPrayerRef: 'Prayer for father\'s cancer diagnosis (2025)', category: 'health',
    praiseCount: 267, hallelujahCount: 198, amenCount: 234, consentLinked: true,
  },
  {
    id: 'pr-10', title: 'Community Outreach Impact', person: 'Missions Team', isAnonymous: false,
    date: 'Jan 15, 2026', testimony: 'Our neighborhood outreach last Saturday reached 200+ families. 14 people gave their lives to Christ. The harvest is plentiful!',
    originalPrayerRef: 'Prayer for community outreach event (Jan 2026)', category: 'church',
    praiseCount: 178, hallelujahCount: 134, amenCount: 156, consentLinked: true,
  },
];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, action }: { title: string; colors: typeof Colors.light; count?: number; action?: string }) {
  return (
    <View style={sh.headerRow}>
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
      {action && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <ThemedText style={[sh.actionText, { color: colors.textTertiary }]}>{action}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[sh.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

const sh = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  actionText: { fontSize: 12, fontWeight: '500', marginLeft: 'auto' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
});

// =============================================================================
// PRIVACY FILTER HELPER
// =============================================================================

function canSeePrivacy(privacy: PrayerPrivacy, role: ChurchRoleLens): boolean {
  if (privacy === 'public') return true;
  if (privacy === 'church') return isMember(role); // C1-C4
  if (privacy === 'leadership') return isStaffLevel(role); // C1-C3
  if (privacy === 'private') return isSeniorPastor(role); // C1 only
  return false;
}

// =============================================================================
// VIEW: FEED
// =============================================================================

function FeedView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [privacyFilter, setPrivacyFilter] = useState<PrayerPrivacy | 'all'>('all');

  // Filter by role-permitted privacy levels
  const roleVisible = FEED_PRAYERS.filter((p) => canSeePrivacy(p.privacy, role));
  // Then apply user-selected privacy filter
  const visiblePrayers = privacyFilter === 'all'
    ? roleVisible
    : roleVisible.filter((p) => p.privacy === privacyFilter);

  // Build available privacy filters based on what this role can see
  const availablePrivacyFilters: (PrayerPrivacy | 'all')[] = ['all'];
  if (canSeePrivacy('public', role)) availablePrivacyFilters.push('public');
  if (canSeePrivacy('church', role)) availablePrivacyFilters.push('church');
  if (canSeePrivacy('leadership', role)) availablePrivacyFilters.push('leadership');
  if (canSeePrivacy('private', role)) availablePrivacyFilters.push('private');

  const handlePray = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrayedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={s.viewContainer}>
      <SectionHeader title="COMMUNITY PRAYER WALL" colors={colors} count={visiblePrayers.length} />

      {/* Privacy filter chips */}
      {availablePrivacyFilters.length > 2 && (
        <View style={s.filterRow}>
          {availablePrivacyFilters.map((pf) => {
            const isActive = privacyFilter === pf;
            const label = pf === 'all' ? 'All' : PRIVACY_LABELS[pf];
            const chipColor = pf === 'all' ? colors.text : PRIVACY_COLORS[pf];
            return (
              <Pressable
                key={pf}
                style={[s.filterPill, { backgroundColor: isActive ? chipColor + '20' : colors.backgroundSecondary }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPrivacyFilter(pf); }}
              >
                <ThemedText style={[s.filterPillText, { color: isActive ? chipColor : colors.textSecondary }]}>
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}

      {visiblePrayers.map((prayer) => {
        const catColor = CATEGORY_COLORS[prayer.category];
        const privColor = PRIVACY_COLORS[prayer.privacy];
        const hasPrayed = prayedIds.has(prayer.id);
        const displayCount = prayer.prayedCount + (hasPrayed ? 1 : 0);

        return (
          <Card key={prayer.id} colors={colors}>
            {/* Header: author, date, badges */}
            <View style={s.feedHeader}>
              <View style={[s.feedAvatar, { backgroundColor: catColor + '20' }]}>
                <ThemedText style={[s.feedAvatarText, { color: catColor }]}>
                  {prayer.isAnonymous ? 'AN' : prayer.author.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </ThemedText>
              </View>
              <View style={s.feedHeaderInfo}>
                <ThemedText style={[s.feedAuthor, { color: colors.text }]}>
                  {prayer.isAnonymous ? 'Anonymous' : prayer.author}
                </ThemedText>
                <ThemedText style={[s.feedDate, { color: colors.textTertiary }]}>{prayer.datePosted}</ThemedText>
              </View>
              <View style={s.feedBadgeRow}>
                {prayer.isUrgent && (
                  <View style={[s.badgeSmall, { backgroundColor: '#EF444420' }]}>
                    <ThemedText style={[s.badgeSmallText, { color: '#EF4444' }]}>URGENT</ThemedText>
                  </View>
                )}
                <View style={[s.badgeSmall, { backgroundColor: privColor + '20' }]}>
                  <ThemedText style={[s.badgeSmallText, { color: privColor }]}>{PRIVACY_LABELS[prayer.privacy].toUpperCase()}</ThemedText>
                </View>
              </View>
            </View>

            {/* Prayer text */}
            <ThemedText style={[s.feedText, { color: colors.textSecondary }]} numberOfLines={3}>
              {prayer.text}
            </ThemedText>

            {/* Category badge */}
            <View style={[s.categoryBadge, { backgroundColor: catColor + '20' }]}>
              <ThemedText style={[s.categoryBadgeText, { color: catColor }]}>
                {CATEGORY_LABELS[prayer.category].toUpperCase()}
              </ThemedText>
            </View>

            {/* Action row */}
            <View style={s.feedActionRow}>
              <Pressable
                style={[
                  s.iPrayedButton,
                  {
                    backgroundColor: hasPrayed ? catColor + '20' : 'transparent',
                    borderColor: hasPrayed ? catColor + '40' : colors.border,
                  },
                ]}
                onPress={() => handlePray(prayer.id)}
              >
                <IconSymbol name="hands.sparkles.fill" size={14} color={hasPrayed ? catColor : colors.textSecondary} />
                <ThemedText style={[s.iPrayedText, { color: hasPrayed ? catColor : colors.text }]}>
                  I Prayed {'\u00B7'} {displayCount}
                </ThemedText>
              </Pressable>
              <View style={s.feedCommentRow}>
                <IconSymbol name="bubble.left.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.feedCommentCount, { color: colors.textTertiary }]}>{prayer.commentCount}</ThemedText>
              </View>
            </View>
          </Card>
        );
      })}

      {/* Floating CTA */}
      {isMember(role) && (
        <Pressable
          style={({ pressed }) => [s.floatingCta, { backgroundColor: ACCENT, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={16} color="#FFFFFF" />
          <ThemedText style={s.floatingCtaText}>Submit Prayer Request</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// =============================================================================
// VIEW: MY REQUESTS
// =============================================================================

function MyRequestsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  const filtered = statusFilter === 'all'
    ? MY_REQUESTS
    : MY_REQUESTS.filter((r) => r.status === statusFilter);

  return (
    <View style={s.viewContainer}>
      {/* Status toggle */}
      <View style={s.filterRow}>
        {(['all', 'active', 'answered', 'archived'] as const).map((status) => {
          const isActive = statusFilter === status;
          const label = status === 'all' ? 'All' : STATUS_LABELS[status as RequestStatus];
          return (
            <Pressable
              key={status}
              style={[s.filterPill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStatusFilter(status);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="MY PRAYER REQUESTS" colors={colors} count={filtered.length} />

      {filtered.map((req) => {
        const catColor = CATEGORY_COLORS[req.category];
        const statColor = STATUS_COLORS[req.status];
        const privColor = PRIVACY_COLORS[req.privacy];

        return (
          <Card key={req.id} colors={colors}>
            <View style={s.myReqHeader}>
              <ThemedText style={[s.myReqDate, { color: colors.textTertiary }]}>{req.dateSubmitted}</ThemedText>
              <View style={s.myReqBadgeRow}>
                <View style={[s.badgeSmall, { backgroundColor: statColor + '20' }]}>
                  <ThemedText style={[s.badgeSmallText, { color: statColor }]}>{STATUS_LABELS[req.status].toUpperCase()}</ThemedText>
                </View>
                <View style={[s.badgeSmall, { backgroundColor: privColor + '20' }]}>
                  <ThemedText style={[s.badgeSmallText, { color: privColor }]}>{PRIVACY_LABELS[req.privacy].toUpperCase()}</ThemedText>
                </View>
              </View>
            </View>

            <ThemedText style={[s.myReqText, { color: colors.textSecondary }]}>{req.text}</ThemedText>

            <View style={[s.categoryBadge, { backgroundColor: catColor + '20' }]}>
              <ThemedText style={[s.categoryBadgeText, { color: catColor }]}>
                {CATEGORY_LABELS[req.category].toUpperCase()}
              </ThemedText>
            </View>

            <View style={s.myReqMetaRow}>
              <View style={s.myReqMetaItem}>
                <IconSymbol name="hands.sparkles.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.myReqMetaText, { color: colors.textTertiary }]}>
                  {req.prayedCount} prayed
                </ThemedText>
              </View>
              <View style={s.myReqMetaItem}>
                <IconSymbol name="bubble.left.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.myReqMetaText, { color: colors.textTertiary }]}>
                  {req.responses} responses
                </ThemedText>
              </View>
            </View>

            {/* Edit window — editable within 2h of submission or while still active (not yet assigned) */}
            {req.status === 'active' && (
              <View style={s.myReqEditRow}>
                <Pressable
                  style={[s.myReqEditBtn, { borderColor: colors.border }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="pencil" size={11} color={colors.textSecondary} />
                  <ThemedText style={[s.myReqEditText, { color: colors.textSecondary }]}>Edit</ThemedText>
                </Pressable>
                <Pressable
                  style={[s.myReqEditBtn, { borderColor: '#EF444430' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="trash" size={11} color="#EF4444" />
                  <ThemedText style={[s.myReqEditText, { color: '#EF4444' }]}>Delete</ThemedText>
                </Pressable>
              </View>
            )}
          </Card>
        );
      })}

      {/* New request CTA */}
      <Pressable
        style={({ pressed }) => [s.floatingCta, { backgroundColor: ACCENT, opacity: pressed ? 0.8 : 1 }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <IconSymbol name="plus" size={16} color="#FFFFFF" />
        <ThemedText style={s.floatingCtaText}>New Request</ThemedText>
      </Pressable>
    </View>
  );
}

// =============================================================================
// VIEW: PRAYER QUEUE (C1/C2/C3)
// =============================================================================

function QueueView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [namedFilter, setNamedFilter] = useState<QueueNamedFilter>('all');

  // Sort: escalated first, then urgent, then by date
  const sorted = [...QUEUE_ITEMS].sort((a, b) => {
    if (a.escalated && !b.escalated) return -1;
    if (!a.escalated && b.escalated) return 1;
    const urgencyOrder: Record<QueueUrgency, number> = { urgent: 0, normal: 1, low: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    return 0;
  });

  // Filter by privacy (C3 can't see private)
  const privacyFiltered = sorted.filter((item) => canSeePrivacy(item.privacy, role));

  // Apply named filter
  const filtered = (() => {
    switch (namedFilter) {
      case 'urgent': return privacyFiltered.filter((i) => i.urgency === 'urgent');
      case 'new': return privacyFiltered.filter((i) => i.followUpStatus === 'new');
      case 'needs-followup': return privacyFiltered.filter((i) => i.needsFollowUp || i.followUpStatus === 'new' || i.followUpStatus === 'in-progress');
      case 'my-team': return privacyFiltered.filter((i) => i.assignedTo != null);
      case 'escalations': return privacyFiltered.filter((i) => i.escalated || i.followUpStatus === 'escalated');
      case 'closed': return privacyFiltered.filter((i) => i.followUpStatus === 'resolved');
      default: return privacyFiltered;
    }
  })();

  const NAMED_FILTER_LABELS: Record<QueueNamedFilter, string> = {
    all: 'All',
    urgent: 'Urgent',
    new: 'New',
    'needs-followup': 'Needs Follow-Up',
    'my-team': 'Assigned',
    escalations: 'Escalations',
    closed: 'Closed',
  };

  return (
    <View style={s.viewContainer}>
      {/* Queue stats */}
      <SectionHeader title="PASTORAL PRAYER QUEUE" colors={colors} />
      <Card colors={colors}>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: ACCENT }]}>{QUEUE_STATS.newThisWeek}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>New This Week</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: '#F59E0B' }]}>{QUEUE_STATS.inProgress}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>In Progress</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: '#22C55E' }]}>{QUEUE_STATS.resolvedThisMonth}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Resolved (Month)</ThemedText>
          </View>
        </View>
      </Card>

      {/* 6 named filter views */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {(['all', 'urgent', 'new', 'needs-followup', 'my-team', 'escalations', 'closed'] as QueueNamedFilter[]).map((nf) => {
          const isActive = namedFilter === nf;
          return (
            <Pressable
              key={nf}
              style={[s.filterPill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNamedFilter(nf);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {NAMED_FILTER_LABELS[nf]}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Queue items */}
      <SectionHeader title="REQUESTS REQUIRING FOLLOW-UP" colors={colors} count={filtered.length} />
      {filtered.map((item) => {
        const urgColor = URGENCY_COLORS[item.urgency];
        const followColor = FOLLOW_UP_COLORS[item.followUpStatus];
        const catColor = CATEGORY_COLORS[item.category];
        const privColor = PRIVACY_COLORS[item.privacy];

        return (
          <Card key={item.id} colors={colors}>
            <View style={s.queueHeader}>
              <View style={[s.urgencyDot, { backgroundColor: urgColor }]} />
              <View style={s.queueHeaderInfo}>
                <ThemedText style={[s.queueName, { color: colors.text }]}>{item.personName}</ThemedText>
                <ThemedText style={[s.queueDate, { color: colors.textTertiary }]}>{item.submittedDate}</ThemedText>
              </View>
              <View style={s.queueBadgeCol}>
                <View style={[s.badgeSmall, { backgroundColor: urgColor + '20' }]}>
                  <ThemedText style={[s.badgeSmallText, { color: urgColor }]}>{item.urgency.toUpperCase()}</ThemedText>
                </View>
                <View style={[s.badgeSmall, { backgroundColor: followColor + '20' }]}>
                  <ThemedText style={[s.badgeSmallText, { color: followColor }]}>{FOLLOW_UP_LABELS[item.followUpStatus].toUpperCase()}</ThemedText>
                </View>
              </View>
            </View>

            <ThemedText style={[s.queueSummary, { color: colors.textSecondary }]}>{item.requestSummary}</ThemedText>

            <View style={s.queueMetaRow}>
              <View style={[s.categoryBadge, { backgroundColor: catColor + '20' }]}>
                <ThemedText style={[s.categoryBadgeText, { color: catColor }]}>
                  {CATEGORY_LABELS[item.category].toUpperCase()}
                </ThemedText>
              </View>
              <View style={[s.badgeSmall, { backgroundColor: privColor + '20' }]}>
                <ThemedText style={[s.badgeSmallText, { color: privColor }]}>{PRIVACY_LABELS[item.privacy].toUpperCase()}</ThemedText>
              </View>
            </View>

            {item.assignedTo && (
              <View style={s.assignedRow}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.assignedText, { color: colors.textTertiary }]}>
                  Assigned: {item.assignedTo}
                </ThemedText>
              </View>
            )}

            {/* Action buttons */}
            {isElderLevel(role) && item.followUpStatus !== 'resolved' && (
              <View style={s.queueActions}>
                <Pressable
                  style={[s.queueActionBtn, { borderColor: colors.border }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="phone.fill" size={12} color={colors.textSecondary} />
                  <ThemedText style={[s.queueActionText, { color: colors.textSecondary }]}>Contact</ThemedText>
                </Pressable>
                {!item.assignedTo && (
                  <Pressable
                    style={[s.queueActionBtn, { borderColor: colors.border }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <IconSymbol name="person.badge.plus" size={12} color={colors.textSecondary} />
                    <ThemedText style={[s.queueActionText, { color: colors.textSecondary }]}>Assign</ThemedText>
                  </Pressable>
                )}
                <Pressable
                  style={[s.queueActionBtn, { borderColor: '#22C55E40' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
                  <ThemedText style={[s.queueActionText, { color: '#22C55E' }]}>Resolve</ThemedText>
                </Pressable>
              </View>
            )}

            {/* C3-C6 staff sees limited action buttons */}
            {isStaffLevel(role) && !isElderLevel(role) && item.followUpStatus !== 'resolved' && (
              <View style={s.queueActions}>
                <Pressable
                  style={[s.queueActionBtn, { borderColor: colors.border }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="phone.fill" size={12} color={colors.textSecondary} />
                  <ThemedText style={[s.queueActionText, { color: colors.textSecondary }]}>Contact</ThemedText>
                </Pressable>
                <Pressable
                  style={[s.queueActionBtn, { borderColor: '#22C55E40' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
                  <ThemedText style={[s.queueActionText, { color: '#22C55E' }]}>Mark Resolved</ThemedText>
                </Pressable>
              </View>
            )}
          </Card>
        );
      })}
    </View>
  );
}

// =============================================================================
// VIEW: TEAMS (C1/C2)
// =============================================================================

function TeamsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  return (
    <View style={s.viewContainer}>
      <SectionHeader title="PRAYER MINISTRY TEAMS" colors={colors} count={PRAYER_TEAMS.length} />

      {PRAYER_TEAMS.map((team) => {
        const attendanceOk = team.attendanceRate >= 75;
        const activeOk = team.activeRate >= 80;

        return (
          <Card key={team.id} colors={colors}>
            <View style={s.teamHeader}>
              <View style={s.teamHeaderInfo}>
                <ThemedText style={[s.teamName, { color: colors.text }]}>{team.name}</ThemedText>
                <ThemedText style={[s.teamLeader, { color: colors.textTertiary }]}>
                  Led by {team.leader}
                </ThemedText>
              </View>
              <View style={[s.teamMembersBadge, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.teamMembersCount, { color: colors.text }]}>{team.membersCount}</ThemedText>
                <ThemedText style={[s.teamMembersLabel, { color: colors.textTertiary }]}>members</ThemedText>
              </View>
            </View>

            <ThemedText style={[s.teamFocus, { color: colors.textSecondary }]}>{team.focusArea}</ThemedText>

            <View style={s.teamScheduleRow}>
              <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.teamScheduleText, { color: colors.textTertiary }]}>{team.meetingSchedule}</ThemedText>
            </View>

            {/* Team health metrics */}
            <View style={[s.teamHealthRow, { borderTopColor: colors.border }]}>
              <View style={s.teamHealthItem}>
                <ThemedText style={[s.teamHealthLabel, { color: colors.textTertiary }]}>Attendance</ThemedText>
                <View style={s.teamHealthValueRow}>
                  <View style={[s.teamHealthDot, { backgroundColor: attendanceOk ? '#22C55E' : '#F59E0B' }]} />
                  <ThemedText style={[s.teamHealthValue, { color: attendanceOk ? '#22C55E' : '#F59E0B' }]}>
                    {team.attendanceRate}%
                  </ThemedText>
                </View>
              </View>
              <View style={s.teamHealthItem}>
                <ThemedText style={[s.teamHealthLabel, { color: colors.textTertiary }]}>Active Rate</ThemedText>
                <View style={s.teamHealthValueRow}>
                  <View style={[s.teamHealthDot, { backgroundColor: activeOk ? '#22C55E' : '#F59E0B' }]} />
                  <ThemedText style={[s.teamHealthValue, { color: activeOk ? '#22C55E' : '#F59E0B' }]}>
                    {team.activeRate}%
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* On-call rotation */}
            {team.onCallRotation && team.onCallRotation.length > 0 && (
              <View style={[s.onCallSection, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.onCallTitle, { color: colors.textSecondary }]}>ON-CALL ROTATION</ThemedText>
                {team.onCallRotation.map((slot) => (
                  <View key={slot.day} style={s.onCallRow}>
                    <ThemedText style={[s.onCallDay, { color: colors.textTertiary }]}>{slot.day}</ThemedText>
                    <ThemedText style={[s.onCallPerson, { color: colors.text }]}>{slot.person}</ThemedText>
                    <ThemedText style={[s.onCallPhone, { color: colors.textTertiary }]}>{slot.phone}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* Join / Leave action */}
            <View style={s.teamActionRow}>
              <Pressable
                style={[s.teamJoinBtn, { borderColor: `${ACCENT}40` }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="person.badge.plus" size={12} color={ACCENT} />
                <ThemedText style={[s.teamJoinText, { color: ACCENT }]}>Join Team</ThemedText>
              </Pressable>
              <Pressable
                style={[s.teamJoinBtn, { borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="rectangle.portrait.and.arrow.right" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.teamJoinText, { color: colors.textTertiary }]}>Leave</ThemedText>
              </Pressable>
            </View>
          </Card>
        );
      })}

      {/* Summary stats */}
      <SectionHeader title="MINISTRY OVERVIEW" colors={colors} />
      <Card colors={colors}>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {PRAYER_TEAMS.reduce((sum, t) => sum + t.membersCount, 0)}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Total Members</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{PRAYER_TEAMS.length}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Active Teams</ThemedText>
          </View>
          <View style={s.statBox}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {Math.round(PRAYER_TEAMS.reduce((sum, t) => sum + t.attendanceRate, 0) / PRAYER_TEAMS.length)}%
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Avg Attendance</ThemedText>
          </View>
        </View>
      </Card>
    </View>
  );
}

// =============================================================================
// VIEW: PRAISE REPORTS
// =============================================================================

function PraiseView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  return (
    <View style={s.viewContainer}>
      <SectionHeader title="ANSWERED PRAYERS & TESTIMONIES" colors={colors} count={PRAISE_REPORTS.length} />

      {PRAISE_REPORTS.map((report) => {
        const catColor = CATEGORY_COLORS[report.category];

        return (
          <Card key={report.id} colors={colors}>
            {/* Title & author */}
            <View style={s.praiseHeader}>
              <IconSymbol name="star.fill" size={16} color="#F59E0B" />
              <View style={s.praiseHeaderInfo}>
                <ThemedText style={[s.praiseTitle, { color: colors.text }]}>{report.title}</ThemedText>
                <ThemedText style={[s.praiseAuthor, { color: colors.textTertiary }]}>
                  {report.isAnonymous ? 'Anonymous' : report.person} {'\u00B7'} {report.date}
                </ThemedText>
              </View>
            </View>

            {/* Testimony */}
            <ThemedText style={[s.praiseTestimony, { color: colors.textSecondary }]} numberOfLines={3}>
              {report.testimony}
            </ThemedText>

            {/* Original prayer reference — only shown when consent is granted */}
            {report.consentLinked ? (
              <View style={[s.praiseOriginalRef, { borderColor: colors.border }]}>
                <View style={s.praiseConsentRow}>
                  <IconSymbol name="link" size={10} color={colors.textTertiary} />
                  <ThemedText style={[s.praiseOriginalLabel, { color: colors.textTertiary }]}>Linked Prayer Request:</ThemedText>
                </View>
                <ThemedText style={[s.praiseOriginalText, { color: colors.textTertiary }]}>{report.originalPrayerRef}</ThemedText>
              </View>
            ) : (
              <View style={[s.praiseOriginalRef, { borderColor: colors.border }]}>
                <View style={s.praiseConsentRow}>
                  <IconSymbol name="lock.fill" size={10} color={colors.textTertiary} />
                  <ThemedText style={[s.praiseOriginalLabel, { color: colors.textTertiary }]}>Original prayer kept private</ThemedText>
                </View>
              </View>
            )}

            {/* Category badge */}
            <View style={[s.categoryBadge, { backgroundColor: catColor + '20' }]}>
              <ThemedText style={[s.categoryBadgeText, { color: catColor }]}>
                {CATEGORY_LABELS[report.category].toUpperCase()}
              </ThemedText>
            </View>

            {/* Reaction row */}
            <View style={s.praiseReactionRow}>
              <Pressable
                style={[s.praiseReactionBtn, { borderColor: '#F59E0B40' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <ThemedText style={s.praiseEmoji}>Praise</ThemedText>
                <ThemedText style={[s.praiseReactionCount, { color: '#F59E0B' }]}>{report.praiseCount}</ThemedText>
              </Pressable>
              <Pressable
                style={[s.praiseReactionBtn, { borderColor: `${ACCENT}40` }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <ThemedText style={s.praiseEmoji}>Hallelujah</ThemedText>
                <ThemedText style={[s.praiseReactionCount, { color: ACCENT }]}>{report.hallelujahCount}</ThemedText>
              </Pressable>
              <Pressable
                style={[s.praiseReactionBtn, { borderColor: `${ACCENT}40` }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <ThemedText style={s.praiseEmoji}>Amen</ThemedText>
                <ThemedText style={[s.praiseReactionCount, { color: ACCENT }]}>{report.amenCount}</ThemedText>
              </Pressable>
            </View>
          </Card>
        );
      })}

      {/* Share Testimony CTA */}
      {isMember(role) && (
        <Pressable
          style={({ pressed }) => [s.floatingCta, { backgroundColor: '#F59E0B', opacity: pressed ? 0.8 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="star.fill" size={16} color="#FFFFFF" />
          <ThemedText style={s.floatingCtaText}>Share Testimony</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchPrayer({ colors, role = 'C1', onSwitchTab }: Props) {
  const [activeView, setActiveView] = useState<PrayerView>('feed');

  const visiblePills = getAvailableViews(role);

  // Reset active view if current view not available for role
  const effectiveView = visiblePills.some((p) => p.key === activeView) ? activeView : visiblePills[0].key;

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Pill toggle row */}
      {visiblePills.length > 1 && (
        <View style={s.pillRow}>
          {visiblePills.map((pill) => {
            const isActive = effectiveView === pill.key;
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
      )}

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {effectiveView === 'feed' && <FeedView colors={colors} role={role} />}
        {effectiveView === 'my-requests' && <MyRequestsView colors={colors} role={role} />}
        {effectiveView === 'queue' && <QueueView colors={colors} role={role} />}
        {effectiveView === 'teams' && <TeamsView colors={colors} role={role} />}
        {effectiveView === 'praise' && <PraiseView colors={colors} role={role} />}
        <View style={s.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  viewContainer: { gap: Spacing.sm },
  bottomSpacer: { height: 120 },

  // Pill toggle
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  statBox: { width: '30%', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // Filter pills
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  filterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full },
  filterPillText: { fontSize: 11, fontWeight: '600' },

  // Shared badges
  badgeSmall: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeSmallText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm, marginBottom: Spacing.sm },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // Floating CTA
  floatingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  floatingCtaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // ---- FEED VIEW ----
  feedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.sm },
  feedAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  feedAvatarText: { fontSize: 12, fontWeight: '700' },
  feedHeaderInfo: { flex: 1 },
  feedAuthor: { fontSize: 14, fontWeight: '600', marginBottom: 1 },
  feedDate: { fontSize: 11 },
  feedBadgeRow: { flexDirection: 'row', gap: 4 },
  feedText: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.sm },
  feedActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iPrayedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iPrayedText: { fontSize: 12, fontWeight: '600' },
  feedCommentRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  feedCommentCount: { fontSize: 12 },

  // ---- MY REQUESTS VIEW (edit window) ----
  myReqEditRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  myReqEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  myReqEditText: { fontSize: 11, fontWeight: '600' },

  // ---- MY REQUESTS VIEW ----
  myReqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  myReqDate: { fontSize: 12 },
  myReqBadgeRow: { flexDirection: 'row', gap: 4 },
  myReqText: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.sm },
  myReqMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  myReqMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  myReqMetaText: { fontSize: 11 },

  // ---- QUEUE VIEW ----
  queueHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.sm },
  urgencyDot: { width: 10, height: 10, borderRadius: 5 },
  queueHeaderInfo: { flex: 1 },
  queueName: { fontSize: 14, fontWeight: '600', marginBottom: 1 },
  queueDate: { fontSize: 11 },
  queueBadgeCol: { alignItems: 'flex-end', gap: 3 },
  queueSummary: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.sm },
  queueMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  assignedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  assignedText: { fontSize: 11 },
  queueActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  queueActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  queueActionText: { fontSize: 11, fontWeight: '600' },

  // ---- TEAMS VIEW ----
  teamHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  teamHeaderInfo: { flex: 1 },
  teamName: { fontSize: 15, fontWeight: '700' },
  teamLeader: { fontSize: 12, marginTop: 2 },
  teamMembersBadge: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md },
  teamMembersCount: { fontSize: 18, fontWeight: '800' },
  teamMembersLabel: { fontSize: 9, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  teamFocus: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  teamScheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  teamScheduleText: { fontSize: 12 },
  teamHealthRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  teamHealthItem: { gap: 2 },
  teamHealthLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  teamHealthValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  teamHealthDot: { width: 6, height: 6, borderRadius: 3 },
  teamHealthValue: { fontSize: 14, fontWeight: '700' },

  // ---- TEAMS VIEW (on-call + join/leave) ----
  onCallSection: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  onCallTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  onCallRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  onCallDay: { fontSize: 11, fontWeight: '600', width: 60 },
  onCallPerson: { fontSize: 11, flex: 1 },
  onCallPhone: { fontSize: 10 },
  teamActionRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.sm },
  teamJoinBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  teamJoinText: { fontSize: 11, fontWeight: '600' },

  // ---- PRAISE VIEW ----
  praiseHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: Spacing.sm },
  praiseHeaderInfo: { flex: 1 },
  praiseTitle: { fontSize: 15, fontWeight: '700' },
  praiseAuthor: { fontSize: 12, marginTop: 2 },
  praiseTestimony: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.sm },
  praiseOriginalRef: {
    borderLeftWidth: 2,
    paddingLeft: 10,
    marginBottom: Spacing.sm,
  },
  praiseConsentRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  praiseOriginalLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  praiseOriginalText: { fontSize: 12, fontStyle: 'italic' },
  praiseReactionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  praiseReactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  praiseEmoji: { fontSize: 11, fontWeight: '600' },
  praiseReactionCount: { fontSize: 11, fontWeight: '700' },
});
