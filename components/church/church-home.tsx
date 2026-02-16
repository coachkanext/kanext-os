/**
 * Church Home — ICCLA Dashboard
 * 10 swipeable hub tabs with paged tab bar + edge-hold advance
 * Dashboard | Calendar | Worship | Community | Serve | Give | Events | Prayer | Messages | Discipleship
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { TabPlaceholderPage } from '@/components/ui/tab-placeholder-page';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CalendarHub } from '@/components/schedule/calendar-hub';
import { RailsSection } from '@/components/rails/rails-section';
import { DashboardRenderer } from '@/components/dashboard/dashboard-renderer';
import { buildChurchDashboard } from '@/data/dashboard-payloads';
import {
  CAMPUSES,
  MINISTRIES,
  MESSAGES,
  GIVING_OPTIONS,
  CHURCH_LEADERSHIP,
  formatServiceTime,
  formatMessageDate,
} from '@/data/mock-church';

const ACCENT_GOLD = '#FFFFFF';

// =============================================================================
// HUB TABS
// =============================================================================

const CHURCH_HUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'worship', label: 'Worship' },
  { id: 'community', label: 'Community' },
  { id: 'serve', label: 'Serve' },
  { id: 'give', label: 'Give' },
  { id: 'events', label: 'Events' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'messages', label: 'Messages' },
  { id: 'discipleship', label: 'Discipleship' },
];

// =============================================================================
// TAB CONTENT COMPONENTS
// =============================================================================

function HomeTab({ colors }: { colors: typeof Colors.light }) {
  const payload = buildChurchDashboard();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <DashboardRenderer payload={payload} renderAsFragment />
      <RailsSection />
    </ScrollView>
  );
}

function MessagesTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>All Messages</ThemedText>
        {MESSAGES.map((msg) => (
          <View key={msg.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listTitle, { color: colors.text }]}>{msg.title}</ThemedText>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary }]}>
                {msg.speaker} · {formatMessageDate(msg.date)} · {msg.duration}
              </ThemedText>
              {msg.seriesName && (
                <ThemedText style={[styles.listMeta, { color: colors.textSecondary }]}>
                  Series: {msg.seriesName}
                </ThemedText>
              )}
            </View>
            <IconSymbol name="play.circle.fill" size={20} color={ACCENT_GOLD} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function GivingTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {GIVING_OPTIONS.map((option) => (
        <View key={option.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <IconSymbol name="heart.fill" size={14} color={ACCENT_GOLD} />
            <ThemedText style={[styles.cardTitleText, { color: ACCENT_GOLD }]}>{option.name}</ThemedText>
          </View>
          <ThemedText style={[styles.messageDetail, { color: colors.textSecondary }]}>
            {option.description}
          </ThemedText>
          <Pressable
            style={[styles.actionButton, { borderColor: ACCENT_GOLD }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={[styles.actionButtonText, { color: ACCENT_GOLD }]}>Give Now</ThemedText>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

function CampusesTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {CAMPUSES.map((campus) => (
        <View key={campus.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.cardTitleText, { color: colors.text }]}>{campus.name}</ThemedText>
          <ThemedText style={[styles.messageDetail, { color: colors.textSecondary }]}>
            {campus.location}
          </ThemedText>
          <ThemedText style={[styles.listMeta, { color: colors.textTertiary, marginTop: 4 }]}>
            {campus.address}
          </ThemedText>
          <ThemedText style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>Service Times</ThemedText>
          {campus.serviceTimes.map((st, i) => (
            <View key={i} style={[styles.serviceRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.listTitle, { color: colors.text }]}>{st.service}</ThemedText>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary }]}>
                {formatServiceTime(st)}
              </ThemedText>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function MinistriesTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Ministries</ThemedText>
        {MINISTRIES.map((ministry) => (
          <View key={ministry.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHeader}>
                <IconSymbol name={ministry.icon as any} size={16} color={ACCENT_GOLD} />
                <ThemedText style={[styles.listTitle, { color: colors.text }]}>{ministry.name}</ThemedText>
              </View>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary, marginLeft: 22 }]}>
                {ministry.description}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function LeadershipTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Church Leadership</ThemedText>
        {CHURCH_LEADERSHIP.map((leader) => (
          <View key={leader.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listTitle, { color: colors.text }]}>{leader.name}</ThemedText>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary }]}>
                {leader.title}
              </ThemedText>
              {leader.bio && (
                <ThemedText style={[styles.listMeta, { color: colors.textSecondary }]} numberOfLines={2}>
                  {leader.bio}
                </ThemedText>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// CALENDAR SUB-PILLS
// =============================================================================

type ChurchCalendarPill = 'agenda' | 'schedule' | 'serve' | 'events';
const CHURCH_CAL_PILLS: { key: ChurchCalendarPill; label: string }[] = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'serve', label: 'Serve' },
  { key: 'events', label: 'Events' },
];

function ChurchCalendarPage({ colors, router }: { colors: typeof Colors.light; router: any }) {
  const [activePill, setActivePill] = useState<ChurchCalendarPill>('agenda');

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.calPillRow}>
        {CHURCH_CAL_PILLS.map((pill) => {
          const isActive = activePill === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[styles.calPill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActivePill(pill.key); }}
            >
              <ThemedText style={[styles.calPillText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {activePill === 'agenda' ? (
        <CalendarHub colors={colors} router={router} />
      ) : (
        <ScrollView contentContainerStyle={styles.calScrollContent} showsVerticalScrollIndicator={false}>
          {activePill === 'schedule' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Week at a Glance</ThemedText>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary }]}>
                Service schedules and weekly programming will appear here.
              </ThemedText>
            </View>
          )}
          {activePill === 'serve' && (
            <MinistriesTab colors={colors} />
          )}
          {activePill === 'events' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Events</ThemedText>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary }]}>
                Upcoming church events, retreats, and special services will appear here.
              </ThemedText>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* ===== HUB TAB BAR (paged, scrollable) ===== */}
      <PagedTabBar tabs={CHURCH_HUB_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />

      {/* ===== TAB CONTENT (PagerView — swipeable) ===== */}
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={CHURCH_HUB_TABS.length} onAdvance={handleTabPress}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="dashboard" style={{ flex: 1 }}>
            <HomeTab colors={colors} />
          </View>
          <View key="calendar" style={{ flex: 1 }}>
            <ChurchCalendarPage colors={colors} router={router} />
          </View>
          <View key="worship" style={{ flex: 1 }}>
            <MessagesTab colors={colors} />
          </View>
          <View key="community" style={{ flex: 1 }}>
            <CampusesTab colors={colors} />
          </View>
          <View key="serve" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Serve" />
          </View>
          <View key="give" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Give" />
          </View>
          <View key="events" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Events" />
          </View>
          <View key="prayer" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Prayer" />
          </View>
          <View key="messages" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Messages" />
          </View>
          <View key="discipleship" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Discipleship" />
          </View>
        </PagerView>
      </EdgeHoldAdvance>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Tab Content
  tabContent: {
    padding: Spacing.md,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  serviceTime: {
    fontSize: 20,
    fontWeight: '700',
  },
  serviceDetail: {
    fontSize: 14,
    marginTop: 4,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  messageDetail: {
    fontSize: 14,
    marginTop: 4,
  },
  seriesBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  seriesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  serviceRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Calendar sub-pills
  calPillRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 16, gap: 6 },
  calPill: { flex: 1, paddingVertical: 6, borderRadius: 18, alignItems: 'center' },
  calPillText: { fontSize: 13, fontWeight: '600' },
  calScrollContent: { paddingHorizontal: Spacing.md, paddingTop: 0, paddingBottom: 40 },
});
