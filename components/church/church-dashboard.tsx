/**
 * Church Dashboard — 9-block RBAC-gated Church Mode home dashboard.
 * Default demo role: C1 (Senior Pastor) — full access.
 *
 * Blocks:
 *   0 — Hero Video (badge types: NEW/LIVE/REPLAY, deterministic priority, role-differentiated tap)
 *   1 — Weekly Theme Card (sermon series, memory verse, prayer focus)
 *   2 — Today + Next (location, prepRequired, volunteerGaps, 72h guard on NEXT)
 *   3 — Service Readiness (0-100 score, volunteer coverage by team, critical assets, C3/C4/C5 views)
 *   4 — Ministry Pulse (extends to C3-C5 with role-specific views)
 *   5 — Alerts Strip (type taxonomy, severity+due sort, RBAC filtering)
 *   6 — Quick Actions (role-specific action grid via RBAC)
 *   7 — Feed Preview (8-12 items, RBAC filtering, compact one-line format)
 *   8 — Pinned Shelf (ministry object types, blocker/dueDate sort)
 *
 * Block 9 (Giving Snapshot) — REMOVED per spec.
 */

import React from 'react';
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isSeniorPastor,
  isElderLevel,
  isStaffLevel,
  isMember,
  getChurchQuickActions,
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

// =============================================================================
// INLINE MOCK DATA
// =============================================================================

// --- Block 0: Hero Video ---

type HeroBadge = 'NEW' | 'LIVE' | 'REPLAY';

interface HeroVideoInfo {
  title: string;
  subtitle: string;
  duration: string;
  badge: HeroBadge;
  contentField: string;
  tickerItems: string[];
}

function getHeroPriority(badge: HeroBadge): number {
  switch (badge) {
    case 'LIVE': return 0;
    case 'NEW': return 1;
    case 'REPLAY': return 2;
  }
}

const HERO_VIDEO: HeroVideoInfo = {
  title: 'Unshakeable Faith — Week 4',
  subtitle: 'Sunday Morning Worship Experience',
  duration: '1:12:34',
  badge: 'REPLAY',
  contentField: 'Pastor Philip Anthony Mitchell explores Hebrews 11:32–40 — faith through fire',
  tickerItems: [
    'Baptism class begins this Saturday \u2014 10 AM Fellowship Hall',
    'Women\'s Conference registration closes Friday',
    'Building fund milestone: $780K of $1M raised!',
  ],
};

// --- Block 1: Weekly Theme Card ---

interface SermonSeries {
  name: string;
  scripture: string;
  currentWeek: number;
  totalWeeks: number;
  theme: string;
}

const SERMON_SERIES: SermonSeries = {
  name: 'Unshakeable Faith',
  scripture: 'Hebrews 11:1\u201340',
  currentWeek: 4,
  totalWeeks: 8,
  theme: 'Walking by faith through seasons of uncertainty',
};

interface MemoryVerse {
  text: string;
  reference: string;
}

const MEMORY_VERSE: MemoryVerse = {
  text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
  reference: 'Hebrews 11:1 (NIV)',
};

const PRAYER_FOCUS = 'our missionaries in East Africa and for the families affected by recent storms in our community';

// --- Block 2: Today + Next ---

interface TodayItem {
  id: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  owner: string;
  time: string;
  location?: string;
  prepRequired?: boolean;
  volunteerGaps?: number;
}

const TODAY_STAFF: TodayItem[] = [
  { id: 'ts-1', title: 'Staff Prayer Meeting', badge: 'DAILY', badgeColor: ACCENT, owner: 'Pastoral Team', time: '8:00 AM', location: 'Room 201' },
  { id: 'ts-2', title: 'Worship Rehearsal', badge: 'REHEARSAL', badgeColor: ACCENT, owner: 'Praise Team', time: '4:00 PM', location: 'Sanctuary', prepRequired: true, volunteerGaps: 1 },
  { id: 'ts-3', title: 'Facilities Setup', badgeColor: '#F59E0B', owner: 'Operations', time: '5:00 PM', location: 'Main Campus' },
  { id: 'ts-4', title: 'Marriage Counseling \u2014 Jones Family', badge: 'PASTORAL', badgeColor: ACCENT, owner: 'Pastor Williams', time: '6:00 PM', location: 'Office 104' },
  { id: 'ts-5', title: 'Elder Board Call', badge: 'LEADERSHIP', badgeColor: '#EF4444', owner: 'Elder Board', time: '7:00 PM', location: 'Zoom' },
];

const TODAY_MEMBER: TodayItem[] = [
  { id: 'tm-1', title: 'Small Group \u2014 West Side', badge: 'GROUP', badgeColor: '#22C55E', owner: 'Michael Chen', time: '7:00 PM', location: 'Chen Home' },
  { id: 'tm-2', title: 'Serve: Parking Team', badge: 'SERVE', badgeColor: ACCENT, owner: 'Operations Ministry', time: 'Sunday 9:00 AM', location: 'Lot B' },
  { id: 'tm-3', title: 'Youth Bible Study', badge: 'WEEKLY', badgeColor: ACCENT, owner: 'Youth Ministry', time: '6:30 PM', location: 'Youth Room' },
];

const TODAY_VISITOR: TodayItem[] = [
  { id: 'tv-1', title: 'Sunday Morning Worship', badge: 'SERVICE', badgeColor: ACCENT, owner: 'All Campuses', time: 'Sunday 10:00 AM', location: 'Main Sanctuary' },
];

interface NextEvent {
  id: string;
  title: string;
  participants: string;
  countdown: string;
  countdownHours: number;
  readiness: string;
  readinessColor: string;
}

const NEXT_EVENT_STAFF: NextEvent = {
  id: 'next-s1',
  title: 'Sunday Morning Worship',
  participants: 'All Campuses \u00B7 Full Team',
  countdown: '4 days',
  countdownHours: 96,
  readiness: 'At Risk',
  readinessColor: '#F59E0B',
};

const NEXT_EVENT_MEMBER: NextEvent = {
  id: 'next-m1',
  title: 'Sunday Morning Worship',
  participants: 'Main Campus',
  countdown: '4 days',
  countdownHours: 96,
  readiness: 'Confirmed',
  readinessColor: '#22C55E',
};

const NEXT_EVENT_VISITOR: NextEvent = {
  id: 'next-v1',
  title: 'Sunday Worship Service',
  participants: 'Open to All',
  countdown: '4 days',
  countdownHours: 96,
  readiness: 'Open',
  readinessColor: ACCENT,
};

// --- Block 3: Service Readiness ---

interface VolunteerTeamCoverage {
  id: string;
  team: string;
  required: number;
  filled: number;
}

interface CriticalAsset {
  id: string;
  name: string;
  status: 'ready' | 'pending' | 'issue';
}

const VOLUNTEER_COVERAGE: VolunteerTeamCoverage[] = [
  { id: 'vc-1', team: 'Worship', required: 8, filled: 8 },
  { id: 'vc-2', team: 'AV / Tech', required: 4, filled: 4 },
  { id: 'vc-3', team: 'Ushers / Greeters', required: 12, filled: 10 },
  { id: 'vc-4', team: 'Children\'s', required: 8, filled: 6 },
  { id: 'vc-5', team: 'Parking', required: 4, filled: 4 },
  { id: 'vc-6', team: 'Hospitality', required: 6, filled: 6 },
  { id: 'vc-7', team: 'Prayer', required: 3, filled: 3 },
];

const CRITICAL_ASSETS: CriticalAsset[] = [
  { id: 'ca-1', name: 'Sermon notes finalized', status: 'ready' },
  { id: 'ca-2', name: 'Worship set approved', status: 'ready' },
  { id: 'ca-3', name: 'Slides / lyrics uploaded', status: 'pending' },
  { id: 'ca-4', name: 'Communion prepared', status: 'pending' },
  { id: 'ca-5', name: 'Livestream tested', status: 'ready' },
  { id: 'ca-6', name: 'HVAC operational', status: 'issue' },
];

const SERVICE_INFO = {
  time: 'Sunday 10:00 AM',
  campus: 'Main Campus \u2014 Sanctuary',
  expectedAttendance: '~1,300',
};

function computeReadinessScore(volunteers: VolunteerTeamCoverage[], assets: CriticalAsset[]): number {
  const volTotal = volunteers.reduce((s, v) => s + v.required, 0);
  const volFilled = volunteers.reduce((s, v) => s + Math.min(v.filled, v.required), 0);
  const volPct = volTotal > 0 ? volFilled / volTotal : 1;
  const assetReady = assets.filter((a) => a.status === 'ready').length;
  const assetPct = assets.length > 0 ? assetReady / assets.length : 1;
  return Math.round((volPct * 0.6 + assetPct * 0.4) * 100);
}

const READINESS_SCORE = computeReadinessScore(VOLUNTEER_COVERAGE, CRITICAL_ASSETS);

const READINESS_STATUS_ICON: Record<string, string> = {
  ready: 'checkmark.circle.fill',
  pending: 'clock.fill',
  issue: 'exclamationmark.triangle.fill',
};

const READINESS_STATUS_COLOR: Record<string, string> = {
  ready: '#22C55E',
  pending: '#F59E0B',
  issue: '#EF4444',
};

// Service times data for C4/C5 views
const SERVICE_TIMES = [
  { id: 'st-1', label: 'Sunday 8:00 AM', campus: 'Main Campus', type: 'Traditional' },
  { id: 'st-2', label: 'Sunday 10:00 AM', campus: 'Main Campus', type: 'Contemporary' },
  { id: 'st-3', label: 'Sunday 6:00 PM', campus: 'West Campus', type: 'Evening' },
];

const LIVESTREAM_URL = 'https://2819church.org/live';

// --- Block 4: Ministry Pulse ---

interface MinistryKPI {
  id: string;
  label: string;
  value: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
}

const MINISTRY_KPIS: MinistryKPI[] = [
  { id: 'mk-1', label: 'Total Ministries', value: '24', icon: 'heart.fill', trend: '+2 this quarter', trendUp: true },
  { id: 'mk-2', label: 'Active Volunteers', value: '312', icon: 'person.3.fill', trend: '+18 this month', trendUp: true },
  { id: 'mk-3', label: 'Weekly Attendance', value: '1,284', icon: 'person.2.fill', trend: '+8%', trendUp: true },
  { id: 'mk-4', label: 'New Members', value: '23', icon: 'person.badge.plus', trend: 'This month', trendUp: true },
];

interface TopMinistry {
  id: string;
  name: string;
  volunteers: number;
  trend: 'up' | 'down' | 'stable';
  engagement: string;
  nextMeeting?: string;
  needsCount?: number;
  deepLink?: string;
}

const TOP_MINISTRIES: TopMinistry[] = [
  { id: 'tm-1', name: 'Worship Ministry', volunteers: 48, trend: 'up', engagement: '96%', nextMeeting: 'Thu 4 PM', needsCount: 1, deepLink: 'worship' },
  { id: 'tm-2', name: 'Children\'s Ministry', volunteers: 42, trend: 'up', engagement: '94%', nextMeeting: 'Sun 9 AM', needsCount: 2, deepLink: 'children' },
  { id: 'tm-3', name: 'Small Groups', volunteers: 36, trend: 'stable', engagement: '92%', nextMeeting: 'Wed 7 PM', needsCount: 0, deepLink: 'groups' },
];

// C3 — assigned teams
const MY_TEAMS_C3: TopMinistry[] = [
  { id: 'mt-1', name: 'Worship Ministry', volunteers: 48, trend: 'up', engagement: '96%', nextMeeting: 'Thu 4 PM', needsCount: 1, deepLink: 'worship' },
  { id: 'mt-2', name: 'Youth Ministry', volunteers: 18, trend: 'stable', engagement: '90%', nextMeeting: 'Sat 10 AM', needsCount: 0, deepLink: 'youth' },
];

// C4 — joined groups
const MY_GROUPS_C4: TopMinistry[] = [
  { id: 'mg-1', name: 'West Side Small Group', volunteers: 12, trend: 'stable', engagement: '88%', nextMeeting: 'Wed 7 PM', needsCount: 0, deepLink: 'group-west' },
  { id: 'mg-2', name: 'Men\'s Bible Study', volunteers: 8, trend: 'up', engagement: '92%', nextMeeting: 'Sat 8 AM', needsCount: 0, deepLink: 'mens-study' },
];

// --- Block 5: Alerts Strip ---

type AlertLevel = 'red' | 'amber' | 'blue';
type AlertType = 'Service Blocker' | 'Pastoral Care' | 'Volunteer Gap' | 'Facility Issue' | 'Finance Exception' | 'Compliance' | 'Due <24h';

interface AlertItem {
  id: string;
  level: AlertLevel;
  type: AlertType;
  title: string;
  detail: string;
  dueDate?: string;
  financeGated?: boolean;
}

const ALERT_ITEMS: AlertItem[] = [
  { id: 'al-1', level: 'red', type: 'Volunteer Gap', title: 'Children\'s Ministry', detail: '2 volunteers needed Sunday', dueDate: '2026-02-22' },
  { id: 'al-2', level: 'red', type: 'Compliance', title: 'Background Checks', detail: '12 volunteer renewals overdue', dueDate: '2026-02-20' },
  { id: 'al-3', level: 'red', type: 'Pastoral Care', title: 'Care Request', detail: '1 urgent pastoral care request unresponded' },
  { id: 'al-4', level: 'amber', type: 'Facility Issue', title: 'HVAC Repair', detail: 'Sanctuary unit scheduled for Thursday', dueDate: '2026-02-20' },
  { id: 'al-5', level: 'amber', type: 'Finance Exception', title: 'Building Fund', detail: 'At 78% of $1M goal', financeGated: true },
  { id: 'al-6', level: 'blue', type: 'Due <24h', title: 'Baptism Class', detail: 'Enrollment open \u2014 14 registered', dueDate: '2026-02-19' },
  { id: 'al-7', level: 'blue', type: 'Service Blocker', title: 'Youth Retreat', detail: 'Registration opens tomorrow' },
];

// Sort: severity (red > amber > blue) then due date ascending
function sortAlerts(alerts: AlertItem[]): AlertItem[] {
  const sevOrder: Record<AlertLevel, number> = { red: 0, amber: 1, blue: 2 };
  return [...alerts].sort((a, b) => {
    const sevDiff = sevOrder[a.level] - sevOrder[b.level];
    if (sevDiff !== 0) return sevDiff;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

const ALERT_LEVEL_COLOR: Record<AlertLevel, string> = {
  red: '#EF4444',
  amber: '#F59E0B',
  blue: ACCENT,
};

// --- Block 6: Quick Actions ---

const QUICK_ACTION_TAB_MAP: Record<string, number> = {
  'worship-plan': 2,
  'sermon-prep': 8,
  'staff-meeting': 4,
  'budget-review': 5,
  'prayer-wall': 7,
  'post-announcement': 8,
  'approve-requests': 8,
  'pin-hero-video': 0,
  'open-payment-rails': 5,
  'open-announcements': 8,
  'create-event': 6,
  'manage-volunteers': 4,
  'post-update': 8,
  'request-budget': 5,
  'open-my-ministry': 3,
  'open-check-in': 6,
  'schedule-event': 1,
  'my-ministries': 4,
  'events': 6,
  'volunteer-schedule': 4,
  'submit-request': 8,
  'worship': 2,
  'give': 5,
  'prayer': 7,
  'visit': 3,
};

// --- Block 7: Feed Preview ---

interface FeedPost {
  id: string;
  title: string;
  author: string;
  date: string;
  type: 'announcement' | 'devotional' | 'update' | 'ministry' | 'prayer' | 'event';
  visibility: 'all' | 'members' | 'staff' | 'leadership';
  role?: ChurchRoleLens;
}

const FEED_POSTS: FeedPost[] = [
  { id: 'fp-1', title: 'New Sermon Series: Unshakeable Faith — starting Sunday', author: 'Pastor Philip Anthony Mitchell', date: '1h ago', type: 'announcement', visibility: 'all' },
  { id: 'fp-2', title: 'Morning Devotional — Feb 18', author: 'Devotional Team', date: '4h ago', type: 'devotional', visibility: 'all' },
  { id: 'fp-3', title: 'Building Fund Update — $780K of $1M raised', author: 'Finance Team', date: '8h ago', type: 'update', visibility: 'all' },
  { id: 'fp-4', title: 'Community Food Drive: 2,400 lbs collected, 180 families served', author: 'Outreach Ministry', date: '1d ago', type: 'announcement', visibility: 'all' },
  { id: 'fp-5', title: 'Small Group Leaders Training — new curriculum materials', author: 'Discipleship', date: '1d ago', type: 'ministry', visibility: 'staff' },
  { id: 'fp-6', title: 'Baptism class Saturday 10 AM — 14 registered', author: 'Membership', date: '2d ago', type: 'event', visibility: 'all' },
  { id: 'fp-7', title: 'Worship team rehearsal schedule updated for March', author: 'Worship Ministry', date: '2d ago', type: 'ministry', visibility: 'members' },
  { id: 'fp-8', title: 'Youth retreat registration opens tomorrow', author: 'Youth Ministry', date: '2d ago', type: 'event', visibility: 'all' },
  { id: 'fp-9', title: 'Q1 giving report prepared — board review pending', author: 'Finance', date: '3d ago', type: 'update', visibility: 'leadership' },
  { id: 'fp-10', title: 'Prayer chain activated for storm-affected families', author: 'Prayer Ministry', date: '3d ago', type: 'prayer', visibility: 'members' },
  { id: 'fp-11', title: 'Easter service planning kickoff — Mar 1 all-staff', author: 'Operations', date: '4d ago', type: 'ministry', visibility: 'staff' },
  { id: 'fp-12', title: 'Women\'s Conference early-bird ends Friday', author: 'Women\'s Ministry', date: '5d ago', type: 'event', visibility: 'all' },
];

const FEED_TYPE_COLOR: Record<string, string> = {
  announcement: ACCENT,
  devotional: ACCENT,
  update: '#22C55E',
  ministry: '#F59E0B',
  prayer: ACCENT,
  event: ACCENT,
};

function filterFeedByRole(posts: FeedPost[], role: ChurchRoleLens): FeedPost[] {
  return posts.filter((p) => {
    if (p.visibility === 'all') return true;
    if (p.visibility === 'members' && isMember(role)) return true;
    if (p.visibility === 'staff' && isStaffLevel(role)) return true;
    if (p.visibility === 'leadership' && isElderLevel(role)) return true;
    return false;
  });
}

// --- Block 8: Pinned Shelf ---

type PinnedType = 'ministry' | 'service-plan' | 'worship-plan' | 'kids-curriculum' | 'volunteer-roster' | 'facility-checklist' | 'prayer-list';

interface PinnedItem {
  id: string;
  title: string;
  type: PinnedType;
  date: string;
  icon: string;
  isBlocker?: boolean;
  dueDate?: string;
}

const PINNED_ITEMS: PinnedItem[] = [
  { id: 'pi-1', title: 'Sunday Service Plan', type: 'service-plan', date: 'Feb 22', icon: 'doc.text.fill', isBlocker: true, dueDate: '2026-02-22' },
  { id: 'pi-2', title: 'Worship Set — Wk 4', type: 'worship-plan', date: 'Feb 22', icon: 'music.note.list', isBlocker: false, dueDate: '2026-02-22' },
  { id: 'pi-3', title: 'Kids Curriculum Q1', type: 'kids-curriculum', date: 'Mar 1', icon: 'book.fill', isBlocker: true, dueDate: '2026-03-01' },
  { id: 'pi-4', title: 'Volunteer Roster', type: 'volunteer-roster', date: 'Updated', icon: 'person.3.fill' },
  { id: 'pi-5', title: 'Facility Checklist', type: 'facility-checklist', date: 'Weekly', icon: 'checklist' },
  { id: 'pi-6', title: 'Prayer List — Feb', type: 'prayer-list', date: 'Active', icon: 'hands.sparkles.fill' },
];

// Sort: blockers first, then by dueDate ascending
function sortPinned(items: PinnedItem[]): PinnedItem[] {
  return [...items].sort((a, b) => {
    if (a.isBlocker && !b.isBlocker) return -1;
    if (!a.isBlocker && b.isBlocker) return 1;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

const PINNED_TYPE_COLOR: Record<PinnedType, string> = {
  'ministry': ACCENT,
  'service-plan': ACCENT,
  'worship-plan': '#F59E0B',
  'kids-curriculum': '#22C55E',
  'volunteer-roster': ACCENT,
  'facility-checklist': '#EF4444',
  'prayer-list': ACCENT,
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count }: { title: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={sh.headerRow}>
      <ThemedText style={[sh.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
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
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
});

// =============================================================================
// BLOCK 0 — HERO VIDEO
// =============================================================================

const HERO_BADGE_COLOR: Record<HeroBadge, string> = {
  LIVE: '#EF4444',
  NEW: '#22C55E',
  REPLAY: ACCENT,
};

function HeroVideoBlock({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];

  // Role-differentiated tap behavior
  let ctaLabel = 'Open Media Center';
  let ctaSecondary = 'Watch This Week\'s Sermon';
  if (role === 'C7' || role === 'C8') {
    // Volunteer/Member: simplified sermon access
    ctaLabel = 'Watch This Week\'s Sermon';
    ctaSecondary = '';
  } else if (role === 'C9' || role === 'C10' || role === 'C11') {
    // Attendee/New Believer/Visitor: featured content only
    ctaLabel = 'Watch Featured Sermon';
    ctaSecondary = '';
  }

  return (
    <View style={s.heroContainer}>
      <Pressable
        style={({ pressed }) => [
          s.heroCard,
          { backgroundColor: '#0B0F14', opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        {/* Badge (NEW / LIVE / REPLAY) */}
        <View style={[s.heroBadge, { backgroundColor: HERO_BADGE_COLOR[HERO_VIDEO.badge] }]}>
          {HERO_VIDEO.badge === 'LIVE' && <View style={s.liveDot} />}
          <ThemedText style={s.heroBadgeText}>{HERO_VIDEO.badge}</ThemedText>
        </View>

        {/* Center play icon */}
        <View style={s.playOverlay}>
          <View style={s.playCircle}>
            <IconSymbol name="play.fill" size={28} color="#fff" />
          </View>
        </View>

        {/* Duration badge */}
        <View style={s.durationBadge}>
          <ThemedText style={s.durationText}>{HERO_VIDEO.duration}</ThemedText>
        </View>

        {/* Bottom overlay — content field, not org metadata */}
        <View style={s.bottomOverlay}>
          <ThemedText style={s.heroTitle} numberOfLines={2}>
            {HERO_VIDEO.title}
          </ThemedText>
          <ThemedText style={s.heroSubtitle} numberOfLines={2}>
            {HERO_VIDEO.contentField}
          </ThemedText>
        </View>
      </Pressable>

      {/* Announcements ticker below video */}
      {HERO_VIDEO.tickerItems.length > 0 && (
        <View style={[s.tickerRow, { backgroundColor: c.backgroundTertiary, borderColor: c.border }]}>
          <IconSymbol name="megaphone.fill" size={12} color={c.textSecondary} />
          <ThemedText style={[s.tickerText, { color: c.text }]} numberOfLines={1}>
            {HERO_VIDEO.tickerItems[0]}
          </ThemedText>
        </View>
      )}

      {/* CTA row */}
      <Pressable
        style={({ pressed }) => [
          s.heroCTARow,
          { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <IconSymbol name="play.rectangle.fill" size={16} color={c.text} />
        <ThemedText style={[s.heroCTAText, { color: c.text }]}>{ctaLabel}</ThemedText>
        <IconSymbol name="chevron.right" size={12} color={c.textSecondary} />
      </Pressable>

      {/* Secondary CTA for staff roles */}
      {ctaSecondary.length > 0 && isStaffLevel(role) && (
        <Pressable
          style={({ pressed }) => [
            s.heroCTARow,
            { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="tv.fill" size={16} color={c.text} />
          <ThemedText style={[s.heroCTAText, { color: c.text }]}>{ctaSecondary}</ThemedText>
          <IconSymbol name="chevron.right" size={12} color={c.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

// =============================================================================
// BLOCK 1 — WEEKLY THEME CARD
// =============================================================================

function WeeklyThemeBlock({ colors }: { colors: typeof Colors.light }) {
  const progress = SERMON_SERIES.currentWeek / SERMON_SERIES.totalWeeks;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="WEEKLY THEME CARD" colors={colors} />
      <Card colors={colors}>
        {/* Sermon series */}
        <View style={s.seriesHeader}>
          <IconSymbol name="book.fill" size={16} color={ACCENT} />
          <ThemedText style={[s.seriesName, { color: colors.text }]}>
            {SERMON_SERIES.name}
          </ThemedText>
        </View>
        <ThemedText style={[s.seriesScripture, { color: colors.textSecondary }]}>
          {SERMON_SERIES.scripture}
        </ThemedText>
        <ThemedText style={[s.seriesTheme, { color: colors.textSecondary }]} numberOfLines={2}>
          {SERMON_SERIES.theme}
        </ThemedText>
        <View style={s.seriesProgressRow}>
          <ThemedText style={[s.seriesWeekLabel, { color: colors.textSecondary }]}>
            Week {SERMON_SERIES.currentWeek} of {SERMON_SERIES.totalWeeks}
          </ThemedText>
          <View style={[s.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
            <View style={[s.progressBarFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: ACCENT }]} />
          </View>
        </View>

        {/* Divider */}
        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* Memory verse */}
        <View style={s.verseContainer}>
          <IconSymbol name="text.quote" size={14} color="#F59E0B" />
          <View style={s.verseTextBlock}>
            <ThemedText style={[s.verseText, { color: colors.text }]} numberOfLines={3}>
              {'\u201C'}{MEMORY_VERSE.text}{'\u201D'}
            </ThemedText>
            <ThemedText style={[s.verseRef, { color: colors.textSecondary }]}>
              {MEMORY_VERSE.reference}
            </ThemedText>
          </View>
        </View>

        {/* Divider */}
        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {/* Prayer focus — with "This week we're praying for:" prefix */}
        <View style={s.prayerContainer}>
          <IconSymbol name="hands.sparkles.fill" size={14} color={ACCENT} />
          <View style={s.prayerTextBlock}>
            <ThemedText style={[s.prayerLabel, { color: colors.textSecondary }]}>
              PRAYER FOCUS THIS WEEK
            </ThemedText>
            <ThemedText style={[s.prayerText, { color: colors.text }]} numberOfLines={3}>
              This week we're praying for: {PRAYER_FOCUS}.
            </ThemedText>
          </View>
        </View>
      </Card>

      {/* Daily Devotional CTA */}
      <Pressable
        style={({ pressed }) => [
          s.devoCTA,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <IconSymbol name="sun.max.fill" size={16} color="#F59E0B" />
        <ThemedText style={[s.devoCTAText, { color: colors.text }]}>Daily Devotional</ThemedText>
        <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

// =============================================================================
// BLOCK 2 — TODAY + NEXT
// =============================================================================

function TodayNextBlock({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  let todayItems: TodayItem[];
  let nextEvent: NextEvent;

  if (isStaffLevel(role)) {
    todayItems = TODAY_STAFF;
    nextEvent = NEXT_EVENT_STAFF;
  } else if (isMember(role)) {
    todayItems = TODAY_MEMBER;
    nextEvent = NEXT_EVENT_MEMBER;
  } else {
    todayItems = TODAY_VISITOR;
    nextEvent = NEXT_EVENT_VISITOR;
  }

  // 72h countdown guard — only show NEXT card if within 72 hours
  const showNext = nextEvent.countdownHours <= 72;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="TODAY + NEXT" colors={colors} />
      <View style={s.todayNextRow}>
        {/* TODAY card */}
        <View style={[s.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardHeading, { color: colors.text }]}>Today</ThemedText>
          {todayItems.map((item) => (
            <View key={item.id} style={s.todayItem}>
              <View style={s.todayItemTop}>
                <ThemedText style={[s.todayItemTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                {item.badge && (
                  <View style={[s.todayBadge, { backgroundColor: (item.badgeColor ?? ACCENT) + '20' }]}>
                    <ThemedText style={[s.todayBadgeText, { color: item.badgeColor ?? ACCENT }]}>
                      {item.badge}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={[s.todayItemMeta, { color: colors.textSecondary }]}>
                {item.owner} {'\u00B7'} {item.time}
                {item.location ? ` \u00B7 ${item.location}` : ''}
              </ThemedText>
              {(item.prepRequired || (item.volunteerGaps != null && item.volunteerGaps > 0)) && (
                <View style={s.todayFlagsRow}>
                  {item.prepRequired && (
                    <View style={[s.todayFlag, { backgroundColor: '#F59E0B20' }]}>
                      <ThemedText style={[s.todayFlagText, { color: '#F59E0B' }]}>PREP</ThemedText>
                    </View>
                  )}
                  {item.volunteerGaps != null && item.volunteerGaps > 0 && (
                    <View style={[s.todayFlag, { backgroundColor: '#EF444420' }]}>
                      <ThemedText style={[s.todayFlagText, { color: '#EF4444' }]}>{item.volunteerGaps} GAP</ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* NEXT card — 72h guard */}
        {showNext ? (
          <View style={[s.nextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.cardHeading, { color: colors.text }]}>Next</ThemedText>
            <ThemedText style={[s.nextTitle, { color: colors.text }]} numberOfLines={2}>
              {nextEvent.title}
            </ThemedText>
            <ThemedText style={[s.nextSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {nextEvent.participants}
            </ThemedText>
            <View style={s.nextCountdownRow}>
              <IconSymbol name="clock.fill" size={12} color={colors.textSecondary} />
              <ThemedText style={[s.nextCountdown, { color: colors.text }]}>
                {nextEvent.countdown}
              </ThemedText>
            </View>
            <View style={s.nextReadinessRow}>
              <ThemedText style={[s.nextReadinessLabel, { color: colors.textSecondary }]}>
                Status:
              </ThemedText>
              <View style={[s.readinessBadgeSm, { backgroundColor: nextEvent.readinessColor + '20' }]}>
                <ThemedText style={[s.readinessBadgeSmText, { color: nextEvent.readinessColor }]}>
                  {nextEvent.readiness}
                </ThemedText>
              </View>
            </View>
          </View>
        ) : (
          <View style={[s.nextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.cardHeading, { color: colors.text }]}>Next</ThemedText>
            <ThemedText style={[s.nextTitle, { color: colors.textSecondary }]}>
              No upcoming events within 72 hours
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 3 — SERVICE READINESS
// =============================================================================

function ServiceReadinessBlock({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  // C9-C11: service times only. C7-C8: service times + "how to serve" CTA. C3-C6: team-scoped.
  // C0/C1/C2: full view with score + volunteer coverage + critical assets.

  if (role === 'C9' || role === 'C10' || role === 'C11') {
    // Attendee/New Believer/Visitor: service times + livestream link
    return (
      <View style={s.moduleContainer}>
        <SectionHeader title="SERVICE TIMES" colors={colors} />
        <Card colors={colors}>
          {SERVICE_TIMES.map((st) => (
            <View key={st.id} style={s.serviceTimeRow}>
              <IconSymbol name="clock.fill" size={14} color={colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.serviceTimeLabel, { color: colors.text }]}>{st.label}</ThemedText>
                <ThemedText style={[s.serviceTimeMeta, { color: colors.textSecondary }]}>{st.campus} \u00B7 {st.type}</ThemedText>
              </View>
            </View>
          ))}
        </Card>
        <Pressable
          style={({ pressed }) => [s.devoCTA, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="video.fill" size={16} color={ACCENT} />
          <ThemedText style={[s.devoCTAText, { color: colors.text }]}>Watch Livestream</ThemedText>
          <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
        </Pressable>
      </View>
    );
  }

  if (role === 'C7' || role === 'C8') {
    // Volunteer/Member: service times + "how to serve" CTA
    return (
      <View style={s.moduleContainer}>
        <SectionHeader title="SERVICE TIMES" colors={colors} />
        <Card colors={colors}>
          {SERVICE_TIMES.map((st) => (
            <View key={st.id} style={s.serviceTimeRow}>
              <IconSymbol name="clock.fill" size={14} color={colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.serviceTimeLabel, { color: colors.text }]}>{st.label}</ThemedText>
                <ThemedText style={[s.serviceTimeMeta, { color: colors.textSecondary }]}>{st.campus} \u00B7 {st.type}</ThemedText>
              </View>
            </View>
          ))}
        </Card>
        <Pressable
          style={({ pressed }) => [s.devoCTA, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="hands.sparkles.fill" size={16} color="#22C55E" />
          <ThemedText style={[s.devoCTAText, { color: colors.text }]}>How to Serve</ThemedText>
          <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
        </Pressable>
      </View>
    );
  }

  // C0-C6 — full readiness view (staff level)
  const scoreColor = READINESS_SCORE >= 80 ? '#22C55E' : READINESS_SCORE >= 60 ? '#F59E0B' : '#EF4444';

  // C3-C6: only show teams they're assigned to (filter mock — show first 3)
  const visibleTeams = (isStaffLevel(role) && !isElderLevel(role)) ? VOLUNTEER_COVERAGE.slice(0, 3) : VOLUNTEER_COVERAGE;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="SERVICE READINESS" colors={colors} />

      {/* Service info strip */}
      <View style={[s.serviceInfoStrip, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
        <View style={s.serviceInfoItem}>
          <IconSymbol name="clock.fill" size={12} color={colors.textSecondary} />
          <ThemedText style={[s.serviceInfoText, { color: colors.text }]}>{SERVICE_INFO.time}</ThemedText>
        </View>
        <View style={s.serviceInfoItem}>
          <IconSymbol name="building.2.fill" size={12} color={colors.textSecondary} />
          <ThemedText style={[s.serviceInfoText, { color: colors.text }]}>{SERVICE_INFO.campus}</ThemedText>
        </View>
        <View style={s.serviceInfoItem}>
          <IconSymbol name="person.2.fill" size={12} color={colors.textSecondary} />
          <ThemedText style={[s.serviceInfoText, { color: colors.text }]}>{SERVICE_INFO.expectedAttendance}</ThemedText>
        </View>
      </View>

      {/* Readiness Score */}
      <Card colors={colors}>
        <View style={s.readinessScoreRow}>
          <View style={[s.readinessScoreCircle, { borderColor: scoreColor }]}>
            <ThemedText style={[s.readinessScoreText, { color: scoreColor }]}>{READINESS_SCORE}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.readinessScoreLabel, { color: colors.text }]}>
              Readiness Score
            </ThemedText>
            <View style={[s.readinessProgressBg, { backgroundColor: colors.backgroundTertiary }]}>
              <View
                style={[
                  s.readinessProgressFill,
                  { width: `${READINESS_SCORE}%`, backgroundColor: scoreColor },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Volunteer Coverage by Team */}
        <ThemedText style={[s.readinessSubHeading, { color: colors.textSecondary }]}>
          VOLUNTEER COVERAGE
        </ThemedText>
        {visibleTeams.map((team, idx) => {
          const full = team.filled >= team.required;
          const teamColor = full ? '#22C55E' : '#EF4444';
          return (
            <View
              key={team.id}
              style={[
                s.readinessRow,
                idx < visibleTeams.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.readinessLabel, { color: colors.text }]}>{team.team}</ThemedText>
              <View style={[s.readinessStatusBadge, { backgroundColor: teamColor + '20' }]}>
                <ThemedText style={[s.readinessStatusText, { color: teamColor }]}>
                  {team.filled}/{team.required}
                </ThemedText>
              </View>
            </View>
          );
        })}

        {/* Critical Assets Status — only for C1/C2 */}
        {isElderLevel(role) && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border, marginTop: Spacing.sm }]} />
            <ThemedText style={[s.readinessSubHeading, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              CRITICAL ASSETS
            </ThemedText>
            {CRITICAL_ASSETS.map((asset, idx) => (
              <View
                key={asset.id}
                style={[
                  s.readinessRow,
                  idx < CRITICAL_ASSETS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <IconSymbol
                  name={READINESS_STATUS_ICON[asset.status] as any}
                  size={16}
                  color={READINESS_STATUS_COLOR[asset.status]}
                />
                <ThemedText style={[s.readinessLabel, { color: colors.text }]}>{asset.name}</ThemedText>
                <View style={[s.readinessStatusBadge, { backgroundColor: READINESS_STATUS_COLOR[asset.status] + '20' }]}>
                  <ThemedText style={[s.readinessStatusText, { color: READINESS_STATUS_COLOR[asset.status] }]}>
                    {asset.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            ))}
          </>
        )}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 4 — MINISTRY PULSE
// =============================================================================

function MinistryPulseBlock({ colors, role, onSwitchTab }: { colors: typeof Colors.light; role: ChurchRoleLens; onSwitchTab?: (index: number) => void }) {
  // C9-C11 (Attendee/New Believer/Visitor): "Get connected" CTA
  if (role === 'C9' || role === 'C10' || role === 'C11') {
    return (
      <View style={s.moduleContainer}>
        <SectionHeader title="GET CONNECTED" colors={colors} />
        <Card colors={colors}>
          <ThemedText style={[s.connectedText, { color: colors.text }]}>
            Discover ministries, small groups, and ways to get involved at 2819 Church.
          </ThemedText>
        </Card>
        <Pressable
          style={({ pressed }) => [s.ministryCTA, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (onSwitchTab) onSwitchTab(3); }}
        >
          <IconSymbol name="person.2.fill" size={16} color={colors.text} />
          <ThemedText style={[s.ministryCTAText, { color: colors.text }]}>Explore Ministries</ThemedText>
          <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
        </Pressable>
      </View>
    );
  }

  // C7-C8 (Volunteer/Member): joined groups
  if (role === 'C7' || role === 'C8') {
    return (
      <View style={s.moduleContainer}>
        <SectionHeader title="MY GROUPS" colors={colors} />
        <Card colors={colors}>
          {MY_GROUPS_C4.map((group, idx) => (
            <View
              key={group.id}
              style={[
                s.topMinistryRow,
                idx < MY_GROUPS_C4.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.topMinistryContent}>
                <ThemedText style={[s.topMinistryName, { color: colors.text }]}>{group.name}</ThemedText>
                <ThemedText style={[s.topMinistryMeta, { color: colors.textSecondary }]}>
                  Next: {group.nextMeeting ?? 'TBD'}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
            </View>
          ))}
        </Card>
        <Pressable
          style={({ pressed }) => [s.ministryCTA, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (onSwitchTab) onSwitchTab(3); }}
        >
          <IconSymbol name="heart.fill" size={16} color={colors.text} />
          <ThemedText style={[s.ministryCTAText, { color: colors.text }]}>Browse All Groups</ThemedText>
          <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
        </Pressable>
      </View>
    );
  }

  // C3-C6 (staff/ministry level): assigned teams
  if (isStaffLevel(role) && !isElderLevel(role)) {
    return (
      <View style={s.moduleContainer}>
        <SectionHeader title="MY TEAMS" colors={colors} />
        <Card colors={colors}>
          {MY_TEAMS_C3.map((team, idx) => (
            <View
              key={team.id}
              style={[
                s.topMinistryRow,
                idx < MY_TEAMS_C3.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.topMinistryContent}>
                <ThemedText style={[s.topMinistryName, { color: colors.text }]}>{team.name}</ThemedText>
                <ThemedText style={[s.topMinistryMeta, { color: colors.textSecondary }]}>
                  Next: {team.nextMeeting ?? 'TBD'}{team.needsCount ? ` \u00B7 ${team.needsCount} need${team.needsCount > 1 ? 's' : ''}` : ''}
                </ThemedText>
              </View>
              <IconSymbol
                name={team.trend === 'up' ? 'arrow.up.right' : team.trend === 'down' ? 'arrow.down.right' : ('arrow.right' as any)}
                size={14}
                color={team.trend === 'up' ? '#22C55E' : team.trend === 'down' ? '#EF4444' : colors.textSecondary}
              />
            </View>
          ))}
        </Card>
      </View>
    );
  }

  // C0/C1/C2: full KPIs + top ministries (pastoral level)
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="MINISTRY PULSE" colors={colors} />

      {/* KPI chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.kpiScroll}
      >
        {MINISTRY_KPIS.map((kpi) => (
          <View
            key={kpi.id}
            style={[s.kpiChip, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
          >
            <View style={s.kpiChipHeader}>
              <IconSymbol name={kpi.icon as any} size={12} color={colors.textSecondary} />
              <ThemedText style={[s.kpiChipLabel, { color: colors.textSecondary }]}>
                {kpi.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.kpiChipValue, { color: colors.text }]} numberOfLines={1}>
              {kpi.value}
            </ThemedText>
            {kpi.trend && (
              <View style={s.kpiTrendRow}>
                <IconSymbol
                  name={kpi.trendUp ? 'arrow.up.right' : ('arrow.down.right' as any)}
                  size={9}
                  color={kpi.trendUp ? '#22C55E' : '#EF4444'}
                />
                <ThemedText
                  style={[s.kpiTrendText, { color: kpi.trendUp ? '#22C55E' : '#EF4444' }]}
                >
                  {kpi.trend}
                </ThemedText>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Top 3 ministries */}
      <Card colors={colors}>
        <ThemedText style={[s.topMinistriesHeading, { color: colors.text }]}>
          Top Ministries by Engagement
        </ThemedText>
        {TOP_MINISTRIES.map((ministry, idx) => (
          <View
            key={ministry.id}
            style={[
              s.topMinistryRow,
              idx < TOP_MINISTRIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.topMinistryRank}>
              <ThemedText style={[s.topMinistryRankText, { color: colors.textSecondary }]}>
                {idx + 1}
              </ThemedText>
            </View>
            <View style={s.topMinistryContent}>
              <ThemedText style={[s.topMinistryName, { color: colors.text }]}>
                {ministry.name}
              </ThemedText>
              <ThemedText style={[s.topMinistryMeta, { color: colors.textSecondary }]}>
                {ministry.volunteers} vol {'\u00B7'} {ministry.engagement} active{ministry.nextMeeting ? ` \u00B7 Next: ${ministry.nextMeeting}` : ''}
                {ministry.needsCount ? ` \u00B7 ${ministry.needsCount} need${ministry.needsCount > 1 ? 's' : ''}` : ''}
              </ThemedText>
            </View>
            <IconSymbol
              name={ministry.trend === 'up' ? 'arrow.up.right' : ministry.trend === 'down' ? 'arrow.down.right' : ('arrow.right' as any)}
              size={14}
              color={ministry.trend === 'up' ? '#22C55E' : ministry.trend === 'down' ? '#EF4444' : colors.textSecondary}
            />
          </View>
        ))}
      </Card>

      {/* View All Ministries CTA */}
      <Pressable
        style={({ pressed }) => [
          s.ministryCTA,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (onSwitchTab) onSwitchTab(4);
        }}
      >
        <IconSymbol name="heart.fill" size={16} color={colors.text} />
        <ThemedText style={[s.ministryCTAText, { color: colors.text }]}>View All Ministries</ThemedText>
        <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

// =============================================================================
// BLOCK 5 — ALERTS STRIP (C1/C2/C3 — RBAC type-filtering)
// =============================================================================

function AlertsStripBlock({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  if (!isStaffLevel(role)) return null;

  // RBAC filtering: Finance gated to C1/C2
  const filteredAlerts = sortAlerts(
    ALERT_ITEMS.filter((a) => {
      if (a.financeGated && !isElderLevel(role)) return false;
      return true;
    }),
  );

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="ALERTS" colors={colors} count={filteredAlerts.length} />
      <Card colors={colors}>
        {filteredAlerts.map((alert, idx) => (
          <Pressable
            key={alert.id}
            style={[
              s.alertRow,
              idx < filteredAlerts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.alertDot, { backgroundColor: ALERT_LEVEL_COLOR[alert.level] }]} />
            <View style={s.alertContent}>
              <View style={s.alertTitleRow}>
                <ThemedText style={[s.alertTitle, { color: colors.text }]} numberOfLines={1}>
                  {alert.title}
                </ThemedText>
                <View style={[s.alertTypeBadge, { backgroundColor: ALERT_LEVEL_COLOR[alert.level] + '15' }]}>
                  <ThemedText style={[s.alertTypeText, { color: ALERT_LEVEL_COLOR[alert.level] }]}>
                    {alert.type}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.alertDetail, { color: colors.textSecondary }]} numberOfLines={1}>
                {alert.detail}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 6 — QUICK ACTIONS
// =============================================================================

function QuickActionsBlock({
  colors,
  role,
  onSwitchTab,
}: {
  colors: typeof Colors.light;
  role: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}) {
  const actions = getChurchQuickActions(role);

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="QUICK ACTIONS" colors={colors} />
      <View style={s.actionGrid}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              s.actionTile,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const tabIndex = QUICK_ACTION_TAB_MAP[action.id];
              if (tabIndex != null && onSwitchTab) {
                onSwitchTab(tabIndex);
              }
            }}
          >
            <IconSymbol name={action.icon as any} size={20} color={colors.textSecondary} />
            <ThemedText style={[s.actionTileLabel, { color: colors.text }]} numberOfLines={2}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 7 — FEED PREVIEW (8-12 items, RBAC, compact one-line)
// =============================================================================

function FeedPreviewBlock({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const visiblePosts = filterFeedByRole(FEED_POSTS, role);

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="RECENT POSTS" colors={colors} count={visiblePosts.length} />
      <Card colors={colors}>
        {visiblePosts.map((post, idx) => (
          <Pressable
            key={post.id}
            style={[
              s.feedRowCompact,
              idx < visiblePosts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.feedDot, { backgroundColor: FEED_TYPE_COLOR[post.type] ?? ACCENT }]} />
            <ThemedText style={[s.feedTitleCompact, { color: colors.text }]} numberOfLines={1}>
              {post.title}
            </ThemedText>
            <ThemedText style={[s.feedDateCompact, { color: colors.textTertiary }]}>
              {post.date}
            </ThemedText>
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 8 — PINNED SHELF (ministry object types, blocker/due sort)
// =============================================================================

function PinnedShelfBlock({ colors }: { colors: typeof Colors.light }) {
  const sorted = sortPinned(PINNED_ITEMS);

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="PINNED" colors={colors} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pinnedScroll}
      >
        {sorted.map((item) => {
          const typeColor = PINNED_TYPE_COLOR[item.type] ?? ACCENT;
          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                s.pinnedCard,
                {
                  backgroundColor: colors.card,
                  borderColor: item.isBlocker ? '#EF4444' : colors.border,
                  borderWidth: item.isBlocker ? 1.5 : StyleSheet.hairlineWidth,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {item.isBlocker && (
                <View style={s.blockerFlag}>
                  <ThemedText style={s.blockerFlagText}>BLOCKER</ThemedText>
                </View>
              )}
              <View style={[s.pinnedThumb, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name={item.icon as any} size={24} color={typeColor} />
              </View>
              <ThemedText style={[s.pinnedTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </ThemedText>
              <View style={s.pinnedMeta}>
                <View style={[s.pinnedTypeBadge, { backgroundColor: typeColor + '20' }]}>
                  <ThemedText style={[s.pinnedTypeBadgeText, { color: typeColor }]}>
                    {item.type.replace(/-/g, ' ').toUpperCase()}
                  </ThemedText>
                </View>
                <ThemedText style={[s.pinnedDate, { color: colors.textTertiary }]}>
                  {item.date}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchDashboard({ colors, role = 'C1', onSwitchTab }: Props) {
  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Block 0 — Hero Video (All roles) */}
      <HeroVideoBlock colors={colors} role={role} />

      {/* Block 1 — Weekly Theme Card (All roles) */}
      <WeeklyThemeBlock colors={colors} />

      {/* Block 2 — Today + Next (All roles, content varies) */}
      <TodayNextBlock colors={colors} role={role} />

      {/* Block 3 — Service Readiness (role-variant views) */}
      <ServiceReadinessBlock colors={colors} role={role} />

      {/* Block 4 — Ministry Pulse (role-variant views) */}
      <MinistryPulseBlock colors={colors} role={role} onSwitchTab={onSwitchTab} />

      {/* Block 5 — Alerts Strip (C1/C2/C3 only, RBAC-filtered) */}
      <AlertsStripBlock colors={colors} role={role} />

      {/* Block 6 — Quick Actions (All roles, role-specific actions) */}
      <QuickActionsBlock colors={colors} role={role} onSwitchTab={onSwitchTab} />

      {/* Block 7 — Feed Preview (All roles, RBAC-filtered) */}
      <FeedPreviewBlock colors={colors} role={role} />

      {/* Block 8 — Pinned Shelf (All roles) */}
      <PinnedShelfBlock colors={colors} />

      {/* Bottom spacer */}
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
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },
  cardHeading: { fontSize: 15, fontWeight: '600', marginBottom: Spacing.sm },

  // ---- Block 0: Hero Video ----
  heroContainer: { marginBottom: Spacing.lg },
  heroCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  playOverlay: { alignItems: 'center', justifyContent: 'center' },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, lineHeight: 15 },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  tickerText: { fontSize: 12, fontWeight: '500', flex: 1 },
  heroCTARow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  heroCTAText: { fontSize: 13, fontWeight: '600', flex: 1 },

  // ---- Block 1: Weekly Theme Card ----
  seriesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  seriesName: { fontSize: 15, fontWeight: '700' },
  seriesScripture: { fontSize: 12, marginBottom: 4 },
  seriesTheme: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  seriesProgressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  seriesWeekLabel: { fontSize: 11, fontWeight: '600', minWidth: 80 },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.sm },
  verseContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  verseTextBlock: { flex: 1 },
  verseText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic', lineHeight: 19, marginBottom: 4 },
  verseRef: { fontSize: 11, fontWeight: '600' },
  prayerContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  prayerTextBlock: { flex: 1 },
  prayerLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  prayerText: { fontSize: 12, lineHeight: 17 },
  devoCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  devoCTAText: { fontSize: 13, fontWeight: '600', flex: 1 },

  // ---- Block 2: Today + Next ----
  todayNextRow: { flexDirection: 'row', gap: Spacing.sm },
  todayCard: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: StyleSheet.hairlineWidth },
  nextCard: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: StyleSheet.hairlineWidth },
  todayItem: { marginBottom: Spacing.sm },
  todayItemTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  todayItemTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  todayBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  todayBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  todayItemMeta: { fontSize: 11 },
  todayFlagsRow: { flexDirection: 'row', gap: 4, marginTop: 3 },
  todayFlag: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  todayFlagText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  nextTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2, lineHeight: 18 },
  nextSubtitle: { fontSize: 11, marginBottom: Spacing.sm },
  nextCountdownRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  nextCountdown: { fontSize: 14, fontWeight: '700' },
  nextReadinessRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextReadinessLabel: { fontSize: 11 },
  readinessBadgeSm: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  readinessBadgeSmText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // ---- Block 3: Service Readiness ----
  serviceInfoStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  serviceInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  serviceInfoText: { fontSize: 12, fontWeight: '500' },
  serviceTimeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  serviceTimeLabel: { fontSize: 14, fontWeight: '600' },
  serviceTimeMeta: { fontSize: 11, marginTop: 2 },
  readinessScoreRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  readinessScoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readinessScoreText: { fontSize: 18, fontWeight: '800' },
  readinessScoreLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  readinessProgressBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  readinessProgressFill: { height: '100%', borderRadius: 3 },
  readinessSubHeading: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: Spacing.sm },
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  readinessLabel: { fontSize: 13, fontWeight: '500', flex: 1 },
  readinessStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  readinessStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ---- Block 4: Ministry Pulse ----
  kpiScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2, marginBottom: Spacing.sm },
  kpiChip: { minWidth: 100, paddingHorizontal: 12, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  kpiChipHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  kpiChipLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  kpiChipValue: { fontSize: 14, fontWeight: '700' },
  kpiTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  kpiTrendText: { fontSize: 10, fontWeight: '600' },
  topMinistriesHeading: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  topMinistryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  topMinistryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topMinistryRankText: { fontSize: 12, fontWeight: '700' },
  topMinistryContent: { flex: 1 },
  topMinistryName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  topMinistryMeta: { fontSize: 11 },
  ministryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  ministryCTAText: { fontSize: 13, fontWeight: '600', flex: 1 },
  connectedText: { fontSize: 13, lineHeight: 19 },

  // ---- Block 5: Alerts Strip ----
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: 10 },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  alertContent: { flex: 1 },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  alertTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  alertTypeBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  alertTypeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  alertDetail: { fontSize: 11 },

  // ---- Block 6: Quick Actions Grid ----
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionTile: {
    width: '31%',
    aspectRatio: 1.1,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  actionTileLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 14 },

  // ---- Block 7: Feed Preview (compact one-line) ----
  feedRowCompact: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: Spacing.sm },
  feedDot: { width: 6, height: 6, borderRadius: 3 },
  feedTitleCompact: { fontSize: 13, fontWeight: '500', flex: 1 },
  feedDateCompact: { fontSize: 10, fontWeight: '500' },

  // ---- Block 8: Pinned Shelf ----
  pinnedScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  pinnedCard: {
    width: 130,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pinnedThumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
  pinnedMeta: { alignItems: 'center', gap: 4 },
  pinnedTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  pinnedTypeBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  pinnedDate: { fontSize: 10 },
  blockerFlag: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    zIndex: 1,
  },
  blockerFlagText: { color: '#fff', fontSize: 7, fontWeight: '700', letterSpacing: 0.3 },
});
