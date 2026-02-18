/**
 * Church Dashboard — 10-block RBAC-gated Church Mode home dashboard.
 * Default demo role: C1 (Senior Pastor) — full access.
 *
 * Blocks:
 *   0 — Hero Video (Sunday Worship Experience — video-first, matches edu-dashboard pattern)
 *   1 — Spiritual Focus (sermon series, memory verse, prayer focus)
 *   2 — Today + Next (role-varied schedule & event countdown)
 *   3 — Service Readiness (C1/C2/C3 — next-service checklist)
 *   4 — Ministry Pulse (C1/C2 — KPI chips + top ministries)
 *   5 — Alerts Strip (C1/C2/C3 — color-coded alerts)
 *   6 — Quick Actions (role-specific action grid)
 *   7 — Feed Preview (recent announcements/posts)
 *   8 — Pinned Shelf (saved sermons, verses, events)
 *   9 — Giving Snapshot (C1/C2 — YTD giving, building/missions fund)
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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isSeniorPastor,
  isElderLevel,
  isStaffLevel,
  isMember,
  getChurchQuickActions,
} from '@/utils/church-rbac';

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

interface HeroVideoInfo {
  title: string;
  subtitle: string;
  duration: string;
  orgName: string;
  term: string;
  todayDate: string;
  tickerItems: string[];
}

const HERO_VIDEO: HeroVideoInfo = {
  title: 'ICCLA \u2014 Sunday Worship Experience',
  subtitle: 'Worship \u00B7 Praise \u00B7 Fellowship \u00B7 The Word',
  duration: '1:12:34',
  orgName: 'International Church of Christ LA',
  term: 'Spring 2026',
  todayDate: 'Tuesday, Feb 18',
  tickerItems: [
    'Baptism class begins this Saturday \u2014 10 AM Fellowship Hall',
    'Women\'s Conference registration closes Friday',
    'Building fund milestone: $780K of $1M raised!',
  ],
};

// --- Block 1: Spiritual Focus ---

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

const PRAYER_FOCUS = 'Pray for our missionaries in East Africa and for the families affected by recent storms in our community.';

// --- Block 2: Today + Next ---

interface TodayItem {
  id: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  owner: string;
  time: string;
}

const TODAY_STAFF: TodayItem[] = [
  { id: 'ts-1', title: 'Staff Prayer Meeting', badge: 'DAILY', badgeColor: '#8B5CF6', owner: 'Pastoral Team', time: '8:00 AM' },
  { id: 'ts-2', title: 'Worship Rehearsal', badge: 'REHEARSAL', badgeColor: '#3B82F6', owner: 'Praise Team', time: '4:00 PM' },
  { id: 'ts-3', title: 'Facilities Setup', badgeColor: '#F59E0B', owner: 'Operations', time: '5:00 PM' },
  { id: 'ts-4', title: 'Marriage Counseling \u2014 Jones Family', badge: 'PASTORAL', badgeColor: '#EC4899', owner: 'Pastor Williams', time: '6:00 PM' },
  { id: 'ts-5', title: 'Elder Board Call', badge: 'LEADERSHIP', badgeColor: '#EF4444', owner: 'Elder Board', time: '7:00 PM' },
];

const TODAY_MEMBER: TodayItem[] = [
  { id: 'tm-1', title: 'Small Group \u2014 West Side', badge: 'GROUP', badgeColor: '#22C55E', owner: 'Michael Chen', time: '7:00 PM' },
  { id: 'tm-2', title: 'Serve: Parking Team', badge: 'SERVE', badgeColor: '#3B82F6', owner: 'Operations Ministry', time: 'Sunday 9:00 AM' },
  { id: 'tm-3', title: 'Youth Bible Study', badge: 'WEEKLY', badgeColor: '#8B5CF6', owner: 'Youth Ministry', time: '6:30 PM' },
];

const TODAY_VISITOR: TodayItem[] = [
  { id: 'tv-1', title: 'Sunday Morning Worship', badge: 'SERVICE', badgeColor: '#3B82F6', owner: 'All Campuses', time: 'Sunday 10:00 AM' },
];

interface NextEvent {
  id: string;
  title: string;
  participants: string;
  countdown: string;
  readiness: string;
  readinessColor: string;
}

const NEXT_EVENT_STAFF: NextEvent = {
  id: 'next-s1',
  title: 'Sunday Morning Worship',
  participants: 'All Campuses \u00B7 Full Team',
  countdown: '4 days',
  readiness: 'On Track',
  readinessColor: '#22C55E',
};

const NEXT_EVENT_MEMBER: NextEvent = {
  id: 'next-m1',
  title: 'Sunday Morning Worship',
  participants: 'Main Campus',
  countdown: '4 days',
  readiness: 'Confirmed',
  readinessColor: '#22C55E',
};

const NEXT_EVENT_VISITOR: NextEvent = {
  id: 'next-v1',
  title: 'Sunday Worship Service',
  participants: 'Open to All',
  countdown: '4 days',
  readiness: 'Open',
  readinessColor: '#3B82F6',
};

// --- Block 3: Service Readiness ---

interface ReadinessItem {
  id: string;
  label: string;
  status: 'ready' | 'pending' | 'issue';
}

const SERVICE_READINESS: ReadinessItem[] = [
  { id: 'sr-1', label: 'Worship team confirmed', status: 'ready' },
  { id: 'sr-2', label: 'AV check completed', status: 'ready' },
  { id: 'sr-3', label: 'Ushers assigned', status: 'ready' },
  { id: 'sr-4', label: 'Children\'s ministry staffed', status: 'issue' },
  { id: 'sr-5', label: 'Communion prep', status: 'pending' },
  { id: 'sr-6', label: 'Sermon notes finalized', status: 'ready' },
  { id: 'sr-7', label: 'Parking team confirmed', status: 'ready' },
];

const SERVICE_INFO = {
  time: 'Sunday 10:00 AM',
  campus: 'Main Campus \u2014 Sanctuary',
  expectedAttendance: '~1,300',
};

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
}

const TOP_MINISTRIES: TopMinistry[] = [
  { id: 'tm-1', name: 'Worship Ministry', volunteers: 48, trend: 'up', engagement: '96%' },
  { id: 'tm-2', name: 'Children\'s Ministry', volunteers: 42, trend: 'up', engagement: '94%' },
  { id: 'tm-3', name: 'Small Groups', volunteers: 36, trend: 'stable', engagement: '92%' },
];

// --- Block 5: Alerts Strip ---

type AlertLevel = 'red' | 'amber' | 'blue';

interface AlertItem {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
}

const ALERT_ITEMS: AlertItem[] = [
  { id: 'al-1', level: 'red', title: 'Children\'s Ministry', detail: '2 volunteers needed Sunday' },
  { id: 'al-2', level: 'amber', title: 'Building Fund', detail: 'At 78% of $1M goal' },
  { id: 'al-3', level: 'blue', title: 'Baptism Class', detail: 'Enrollment open \u2014 14 registered' },
  { id: 'al-4', level: 'red', title: 'Background Checks', detail: '12 volunteer renewals overdue' },
  { id: 'al-5', level: 'amber', title: 'HVAC Repair', detail: 'Sanctuary unit scheduled for Thursday' },
  { id: 'al-6', level: 'blue', title: 'Youth Retreat', detail: 'Registration opens tomorrow' },
];

const ALERT_LEVEL_COLOR: Record<AlertLevel, string> = {
  red: '#EF4444',
  amber: '#F59E0B',
  blue: '#3B82F6',
};

const ALERT_LEVEL_LABEL: Record<AlertLevel, string> = {
  red: 'URGENT',
  amber: 'ATTENTION',
  blue: 'INFO',
};

// --- Block 6: Quick Actions ---

const QUICK_ACTION_TAB_MAP: Record<string, number> = {
  'worship-plan': 2,
  'sermon-prep': 8,
  'staff-meeting': 4,
  'budget-review': 5,
  'prayer-wall': 7,
  'announcements': 0,
  'board-meeting': 4,
  'policy-review': 4,
  'staff-oversight': 4,
  'my-ministries': 4,
  'events': 6,
  'volunteer-schedule': 4,
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
  preview: string;
  type: 'announcement' | 'devotional' | 'update';
}

const FEED_POSTS: FeedPost[] = [
  {
    id: 'fp-1',
    title: 'New Sermon Series: Unshakeable Faith',
    author: 'Pastor Johnson',
    date: '1h ago',
    preview: 'Starting this Sunday we embark on an 8-week journey through Hebrews 11, exploring what it means to walk by faith in every season of life.',
    type: 'announcement',
  },
  {
    id: 'fp-2',
    title: 'Morning Devotional \u2014 Feb 18',
    author: 'Devotional Team',
    date: '4h ago',
    preview: 'Let us fix our eyes on Jesus, the pioneer and perfecter of faith. For the joy set before Him He endured the cross.',
    type: 'devotional',
  },
  {
    id: 'fp-3',
    title: 'Building Fund Update',
    author: 'Finance Team',
    date: '8h ago',
    preview: 'We have reached $780K of our $1M building fund goal! Thank you for your faithful generosity. Phase 2 construction begins in March.',
    type: 'update',
  },
  {
    id: 'fp-4',
    title: 'Community Food Drive Results',
    author: 'Outreach Ministry',
    date: '1d ago',
    preview: 'Our food drive collected 2,400 lbs of food, serving 180 families in our community. Thank you to all 47 volunteers who made this possible.',
    type: 'announcement',
  },
];

const FEED_TYPE_COLOR: Record<string, string> = {
  announcement: '#3B82F6',
  devotional: '#8B5CF6',
  update: '#22C55E',
};

// --- Block 8: Pinned Shelf ---

interface PinnedItem {
  id: string;
  title: string;
  type: 'sermon' | 'verse' | 'event' | 'document';
  date: string;
  icon: string;
}

const PINNED_ITEMS: PinnedItem[] = [
  { id: 'pi-1', title: 'Unshakeable Faith Wk 3', type: 'sermon', date: 'Feb 9', icon: 'play.circle.fill' },
  { id: 'pi-2', title: 'Hebrews 11:1', type: 'verse', date: 'Saved', icon: 'book.fill' },
  { id: 'pi-3', title: 'Women\'s Conference', type: 'event', date: 'Mar 15', icon: 'calendar' },
  { id: 'pi-4', title: 'Easter Service Plan', type: 'document', date: 'Apr 20', icon: 'doc.text.fill' },
  { id: 'pi-5', title: 'The Cost of Discipleship', type: 'sermon', date: 'Jan 26', icon: 'play.circle.fill' },
];

const PINNED_TYPE_COLOR: Record<string, string> = {
  sermon: '#3B82F6',
  verse: '#8B5CF6',
  event: '#F59E0B',
  document: '#22C55E',
};

// --- Block 9: Giving Snapshot ---

interface GivingKPI {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

const GIVING_KPIS: GivingKPI[] = [
  { label: 'YTD Giving', value: '$284,600', trend: '+12% vs last year', trendUp: true },
  { label: 'This Month', value: '$42,800', trend: '+$3,200 vs last month', trendUp: true },
];

interface FundProgress {
  id: string;
  name: string;
  current: number;
  goal: number;
  color: string;
}

const FUND_PROGRESS: FundProgress[] = [
  { id: 'fund-1', name: 'Building Fund', current: 780000, goal: 1000000, color: '#3B82F6' },
  { id: 'fund-2', name: 'Missions Fund', current: 48000, goal: 75000, color: '#22C55E' },
];

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

function HeroVideoBlock({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];

  // CTA by role
  let ctaLabel = 'Open Media Center';
  let ctaSecondary = 'Watch This Week\'s Sermon';
  if (role === 'C4') {
    ctaLabel = 'Watch This Week\'s Sermon';
    ctaSecondary = '';
  } else if (role === 'C5') {
    ctaLabel = 'Watch Featured Sermon';
    ctaSecondary = '';
  }

  return (
    <View style={s.heroContainer}>
      <Pressable
        style={({ pressed }) => [
          s.heroCard,
          { backgroundColor: '#1a1a2e', opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        {/* PINNED badge */}
        <View style={s.pinnedBadge}>
          <IconSymbol name="pin.fill" size={10} color="#fff" />
          <ThemedText style={s.pinnedText}>PINNED</ThemedText>
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

        {/* Bottom overlay — org name, term, today date */}
        <View style={s.bottomOverlay}>
          <ThemedText style={s.heroTitle} numberOfLines={2}>
            {HERO_VIDEO.title}
          </ThemedText>
          <ThemedText style={s.heroSubtitle} numberOfLines={1}>
            {HERO_VIDEO.orgName} {'\u00B7'} {HERO_VIDEO.term} {'\u00B7'} Today: {HERO_VIDEO.todayDate}
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
// BLOCK 1 — SPIRITUAL FOCUS
// =============================================================================

function SpiritualFocusBlock({ colors }: { colors: typeof Colors.light }) {
  const progress = SERMON_SERIES.currentWeek / SERMON_SERIES.totalWeeks;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="SPIRITUAL FOCUS" colors={colors} />
      <Card colors={colors}>
        {/* Sermon series */}
        <View style={s.seriesHeader}>
          <IconSymbol name="book.fill" size={16} color="#8B5CF6" />
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
            <View style={[s.progressBarFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: '#8B5CF6' }]} />
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

        {/* Prayer focus */}
        <View style={s.prayerContainer}>
          <IconSymbol name="hands.sparkles.fill" size={14} color="#EC4899" />
          <View style={s.prayerTextBlock}>
            <ThemedText style={[s.prayerLabel, { color: colors.textSecondary }]}>
              PRAYER FOCUS THIS WEEK
            </ThemedText>
            <ThemedText style={[s.prayerText, { color: colors.text }]} numberOfLines={3}>
              {PRAYER_FOCUS}
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
                  <View style={[s.todayBadge, { backgroundColor: (item.badgeColor ?? '#3B82F6') + '20' }]}>
                    <ThemedText style={[s.todayBadgeText, { color: item.badgeColor ?? '#3B82F6' }]}>
                      {item.badge}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={[s.todayItemMeta, { color: colors.textSecondary }]}>
                {item.owner} {'\u00B7'} {item.time}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* NEXT card */}
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
            <View style={[s.readinessBadge, { backgroundColor: nextEvent.readinessColor + '20' }]}>
              <ThemedText style={[s.readinessBadgeText, { color: nextEvent.readinessColor }]}>
                {nextEvent.readiness}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 3 — SERVICE READINESS (C1/C2/C3)
// =============================================================================

function ServiceReadinessBlock({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  if (!isStaffLevel(role)) return null;

  const readyCount = SERVICE_READINESS.filter((r) => r.status === 'ready').length;
  const totalCount = SERVICE_READINESS.length;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="SERVICE READINESS" colors={colors} count={readyCount} />

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

      {/* Checklist */}
      <Card colors={colors}>
        <View style={s.readinessOverview}>
          <ThemedText style={[s.readinessOverviewText, { color: colors.text }]}>
            {readyCount}/{totalCount} Ready
          </ThemedText>
          <View style={[s.readinessProgressBg, { backgroundColor: colors.backgroundTertiary }]}>
            <View
              style={[
                s.readinessProgressFill,
                {
                  width: `${Math.round((readyCount / totalCount) * 100)}%`,
                  backgroundColor: readyCount === totalCount ? '#22C55E' : '#F59E0B',
                },
              ]}
            />
          </View>
        </View>
        {SERVICE_READINESS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.readinessRow,
              idx < SERVICE_READINESS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol
              name={READINESS_STATUS_ICON[item.status] as any}
              size={16}
              color={READINESS_STATUS_COLOR[item.status]}
            />
            <ThemedText style={[s.readinessLabel, { color: colors.text }]}>
              {item.label}
            </ThemedText>
            <View style={[s.readinessStatusBadge, { backgroundColor: READINESS_STATUS_COLOR[item.status] + '20' }]}>
              <ThemedText style={[s.readinessStatusText, { color: READINESS_STATUS_COLOR[item.status] }]}>
                {item.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 4 — MINISTRY PULSE (C1/C2)
// =============================================================================

function MinistryPulseBlock({ colors, role, onSwitchTab }: { colors: typeof Colors.light; role: ChurchRoleLens; onSwitchTab?: (index: number) => void }) {
  if (!isElderLevel(role)) return null;

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

      {/* Top 3 ministries by engagement */}
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
                {ministry.volunteers} volunteers {'\u00B7'} {ministry.engagement} active
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
// BLOCK 5 — ALERTS STRIP (C1/C2/C3)
// =============================================================================

function AlertsStripBlock({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  if (!isStaffLevel(role)) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="ALERTS" colors={colors} count={ALERT_ITEMS.length} />
      <Card colors={colors}>
        {ALERT_ITEMS.map((alert, idx) => (
          <Pressable
            key={alert.id}
            style={[
              s.alertRow,
              idx < ALERT_ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.alertDot, { backgroundColor: ALERT_LEVEL_COLOR[alert.level] }]} />
            <View style={[s.alertLevelBadge, { backgroundColor: ALERT_LEVEL_COLOR[alert.level] + '20' }]}>
              <ThemedText style={[s.alertLevelText, { color: ALERT_LEVEL_COLOR[alert.level] }]}>
                {ALERT_LEVEL_LABEL[alert.level]}
              </ThemedText>
            </View>
            <View style={s.alertContent}>
              <ThemedText style={[s.alertTitle, { color: colors.text }]} numberOfLines={1}>
                {alert.title}
              </ThemedText>
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
// BLOCK 7 — FEED PREVIEW
// =============================================================================

function FeedPreviewBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="RECENT POSTS" colors={colors} count={FEED_POSTS.length} />
      <Card colors={colors}>
        {FEED_POSTS.map((post, idx) => (
          <Pressable
            key={post.id}
            style={[
              s.feedRow,
              idx < FEED_POSTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.feedContent}>
              <View style={s.feedTitleRow}>
                <ThemedText style={[s.feedTitle, { color: colors.text }]} numberOfLines={1}>
                  {post.title}
                </ThemedText>
                <View style={[s.feedTypeBadge, { backgroundColor: (FEED_TYPE_COLOR[post.type] ?? '#3B82F6') + '20' }]}>
                  <ThemedText style={[s.feedTypeBadgeText, { color: FEED_TYPE_COLOR[post.type] ?? '#3B82F6' }]}>
                    {post.type.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.feedAuthorDate, { color: colors.textSecondary }]}>
                {post.author} {'\u00B7'} {post.date}
              </ThemedText>
              <ThemedText style={[s.feedPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                {post.preview}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 8 — PINNED SHELF
// =============================================================================

function PinnedShelfBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="PINNED" colors={colors} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pinnedScroll}
      >
        {PINNED_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              s.pinnedCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            {/* Thumbnail placeholder */}
            <View style={[s.pinnedThumb, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name={item.icon as any} size={24} color={PINNED_TYPE_COLOR[item.type] ?? colors.textSecondary} />
            </View>
            <ThemedText style={[s.pinnedTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <View style={s.pinnedMeta}>
              <View style={[s.pinnedTypeBadge, { backgroundColor: (PINNED_TYPE_COLOR[item.type] ?? '#3B82F6') + '20' }]}>
                <ThemedText style={[s.pinnedTypeBadgeText, { color: PINNED_TYPE_COLOR[item.type] ?? '#3B82F6' }]}>
                  {item.type.toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={[s.pinnedDate, { color: colors.textTertiary }]}>
                {item.date}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// BLOCK 9 — GIVING SNAPSHOT (C1/C2)
// =============================================================================

function GivingSnapshotBlock({ colors, role, onSwitchTab }: { colors: typeof Colors.light; role: ChurchRoleLens; onSwitchTab?: (index: number) => void }) {
  if (!isElderLevel(role)) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="GIVING SNAPSHOT" colors={colors} />

      {/* KPI row */}
      <View style={s.givingKPIRow}>
        {GIVING_KPIS.map((kpi, idx) => (
          <View key={idx} style={[s.givingKPITile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.givingKPIValue, { color: colors.text }]}>{kpi.value}</ThemedText>
            <ThemedText style={[s.givingKPILabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
            {kpi.trend && (
              <View style={s.givingTrendRow}>
                <IconSymbol
                  name={kpi.trendUp ? 'arrow.up.right' : ('arrow.down.right' as any)}
                  size={9}
                  color={kpi.trendUp ? '#22C55E' : '#EF4444'}
                />
                <ThemedText style={[s.givingTrendText, { color: kpi.trendUp ? '#22C55E' : '#EF4444' }]}>
                  {kpi.trend}
                </ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Fund progress bars */}
      <Card colors={colors}>
        {FUND_PROGRESS.map((fund, idx) => {
          const pct = Math.round((fund.current / fund.goal) * 100);
          return (
            <View
              key={fund.id}
              style={[
                s.fundRow,
                idx < FUND_PROGRESS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.fundLabelCol}>
                <ThemedText style={[s.fundName, { color: colors.text }]}>{fund.name}</ThemedText>
                <ThemedText style={[s.fundAmounts, { color: colors.textSecondary }]}>
                  ${(fund.current / 1000).toFixed(0)}K / ${(fund.goal / 1000).toFixed(0)}K
                </ThemedText>
              </View>
              <View style={s.fundBarCol}>
                <View style={[s.fundBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.fundBarFill, { width: `${pct}%`, backgroundColor: fund.color }]} />
                </View>
                <ThemedText style={[s.fundPct, { color: fund.color }]}>{pct}%</ThemedText>
              </View>
            </View>
          );
        })}
      </Card>

      {/* View Full Finance CTA */}
      <Pressable
        style={({ pressed }) => [
          s.financeCTA,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (onSwitchTab) onSwitchTab(5);
        }}
      >
        <IconSymbol name="dollarsign.circle.fill" size={16} color={colors.text} />
        <ThemedText style={[s.financeCTAText, { color: colors.text }]}>View Full Finance</ThemedText>
        <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
      </Pressable>
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

      {/* Block 1 — Spiritual Focus (All roles) */}
      <SpiritualFocusBlock colors={colors} />

      {/* Block 2 — Today + Next (All roles, content varies) */}
      <TodayNextBlock colors={colors} role={role} />

      {/* Block 3 — Service Readiness (C1/C2/C3 only) */}
      <ServiceReadinessBlock colors={colors} role={role} />

      {/* Block 4 — Ministry Pulse (C1/C2 only) */}
      <MinistryPulseBlock colors={colors} role={role} onSwitchTab={onSwitchTab} />

      {/* Block 5 — Alerts Strip (C1/C2/C3 only) */}
      <AlertsStripBlock colors={colors} role={role} />

      {/* Block 6 — Quick Actions (All roles, role-specific actions) */}
      <QuickActionsBlock colors={colors} role={role} onSwitchTab={onSwitchTab} />

      {/* Block 7 — Feed Preview (All roles) */}
      <FeedPreviewBlock colors={colors} />

      {/* Block 8 — Pinned Shelf (All roles) */}
      <PinnedShelfBlock colors={colors} />

      {/* Block 9 — Giving Snapshot (C1/C2 only) */}
      <GivingSnapshotBlock colors={colors} role={role} onSwitchTab={onSwitchTab} />

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
  pinnedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pinnedText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
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
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
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

  // ---- Block 1: Spiritual Focus ----
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
  nextTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2, lineHeight: 18 },
  nextSubtitle: { fontSize: 11, marginBottom: Spacing.sm },
  nextCountdownRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  nextCountdown: { fontSize: 14, fontWeight: '700' },
  nextReadinessRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextReadinessLabel: { fontSize: 11 },
  readinessBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  readinessBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

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
  readinessOverview: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  readinessOverviewText: { fontSize: 13, fontWeight: '600', minWidth: 70 },
  readinessProgressBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  readinessProgressFill: { height: '100%', borderRadius: 3 },
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

  // ---- Block 5: Alerts Strip ----
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertLevelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  alertLevelText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
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

  // ---- Block 7: Feed Preview ----
  feedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  feedContent: { flex: 1 },
  feedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  feedTitle: { fontSize: 13, fontWeight: '600', flex: 1 },
  feedTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  feedTypeBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  feedAuthorDate: { fontSize: 11, marginBottom: 4 },
  feedPreview: { fontSize: 12, lineHeight: 17 },

  // ---- Block 8: Pinned Shelf ----
  pinnedScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  pinnedCard: {
    width: 130,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
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

  // ---- Block 9: Giving Snapshot ----
  givingKPIRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  givingKPITile: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 4,
  },
  givingKPIValue: { fontSize: 18, fontWeight: '700' },
  givingKPILabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  givingTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  givingTrendText: { fontSize: 10, fontWeight: '600' },
  fundRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  fundLabelCol: { width: 110 },
  fundName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  fundAmounts: { fontSize: 10 },
  fundBarCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  fundBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fundBarFill: { height: '100%', borderRadius: 4 },
  fundPct: { fontSize: 12, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  financeCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  financeCTAText: { fontSize: 13, fontWeight: '600', flex: 1 },
});
