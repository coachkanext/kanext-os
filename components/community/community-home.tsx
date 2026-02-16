/**
 * Competition Home — K-1 main dashboard.
 * 4 swipeable hub tabs + More overflow (v1 LOCKED)
 * Dashboard | Race Calendar | Standings | Teams + More
 */

import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerMoreHandlers, unregisterMoreHandlers } from '@/utils/global-more';
import { RailsSection } from '@/components/rails/rails-section';
import { DashboardRenderer } from '@/components/dashboard/dashboard-renderer';
import { buildCompetitionDashboard } from '@/data/dashboard-payloads';

import {
  K1_TEAMS,
  K1_DRIVERS,
  K1_EVENTS,
  K1_STANDINGS,
  K1_RULES,
} from '@/data/mock-community';
import type { K1Team, K1Driver, K1StandingEntry, K1Event, K1Rule } from '@/data/mock-community';

const ACCENT_GOLD = '#FFFFFF';

// Competition Hub Tabs (v1 LOCKED)
// 4 swipeable pages + "More" overflow trigger
const K1_HUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'race-calendar', label: 'Calendar' },
  { id: 'standings', label: 'Standings' },
  { id: 'teams', label: 'Teams' },
];

const K1_MORE_ITEMS = [
  { id: 'raceweek-ops', label: 'Raceweek Ops' },
  { id: 'rules', label: 'Rules' },
  { id: 'tech-compliance', label: 'Tech & Compliance' },
  { id: 'safety', label: 'Safety' },
  { id: 'sponsors', label: 'Sponsors' },
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function HomeTab({ colors }: { colors: typeof Colors.light }) {
  const payload = buildCompetitionDashboard();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <DashboardRenderer payload={payload} renderAsFragment />
      <RailsSection />
    </ScrollView>
  );
}

function StandingsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Driver Championship
        </ThemedText>
        {K1_STANDINGS.map((entry) => (
          <View key={entry.driverId} style={[styles.standingRow, styles.standingRowFull]}>
            <ThemedText style={[styles.standingPos, { color: entry.position <= 3 ? ACCENT_GOLD : colors.textTertiary }]}>
              P{entry.position}
            </ThemedText>
            <View style={[styles.teamDot, { backgroundColor: entry.teamColor }]} />
            <View style={styles.standingInfo}>
              <ThemedText style={[styles.standingName, { color: colors.text }]}>
                #{entry.driverNumber} {entry.driverName}
              </ThemedText>
              <ThemedText style={[styles.standingTeam, { color: colors.textTertiary }]}>
                {entry.teamName} · {entry.wins}W · {entry.podiums}P
              </ThemedText>
            </View>
            <View style={styles.standingRight}>
              <ThemedText style={[styles.standingPts, { color: colors.text }]}>
                {entry.points}
              </ThemedText>
              <ThemedText style={[styles.standingGap, { color: colors.textTertiary }]}>
                {entry.gap}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function TeamsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {K1_TEAMS.map((team) => {
        const teamDrivers = K1_DRIVERS.filter((d) => d.teamId === team.id);
        return (
          <View key={team.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.teamHeader}>
              <View style={[styles.teamBadge, { backgroundColor: team.primaryColor + '20' }]}>
                <ThemedText style={[styles.teamAbbr, { color: team.primaryColor }]}>
                  {team.abbreviation}
                </ThemedText>
              </View>
              <View style={styles.teamInfo}>
                <ThemedText style={[styles.teamName, { color: colors.text }]}>{team.name}</ThemedText>
                <ThemedText style={[styles.teamMeta, { color: colors.textTertiary }]}>
                  {team.homeTrack} · {team.wins}W · {team.points} pts
                </ThemedText>
              </View>
            </View>
            {teamDrivers.map((driver) => (
              <View key={driver.id} style={styles.driverRow}>
                <View style={[styles.driverNumber, { borderColor: team.primaryColor + '40' }]}>
                  <ThemedText style={[styles.driverNumText, { color: colors.text }]}>
                    #{driver.number}
                  </ThemedText>
                </View>
                <View style={styles.driverInfo}>
                  <ThemedText style={[styles.driverName, { color: colors.text }]}>
                    {driver.name}
                  </ThemedText>
                  <ThemedText style={[styles.driverStats, { color: colors.textTertiary }]}>
                    {driver.nationality} · {driver.points} pts · Avg P{driver.avgFinish.toFixed(1)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

function GridTab({ colors }: { colors: typeof Colors.light }) {
  const sorted = [...K1_DRIVERS].sort((a, b) => b.points - a.points);
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Driver Grid</ThemedText>
        <View style={styles.gridContainer}>
          {sorted.map((driver, i) => (
            <View key={driver.id} style={[styles.gridCell, { borderColor: colors.border }]}>
              <View style={[styles.gridColor, { backgroundColor: driver.teamColor }]} />
              <ThemedText style={[styles.gridNumber, { color: colors.text }]}>#{driver.number}</ThemedText>
              <ThemedText style={[styles.gridName, { color: colors.textSecondary }]} numberOfLines={1}>
                {driver.name.split(' ').pop()}
              </ThemedText>
              <ThemedText style={[styles.gridPts, { color: colors.textTertiary }]}>
                {driver.points}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function WeekendTab({ colors }: { colors: typeof Colors.light }) {
  const completed = K1_EVENTS.filter((e) => e.status === 'completed');
  const upcoming = K1_EVENTS.filter((e) => e.status === 'upcoming');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {upcoming.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Upcoming</ThemedText>
          {upcoming.map((event) => (
            <View key={event.id} style={[styles.eventRow, { borderBottomColor: colors.border }]}>
              <View style={styles.eventDateCol}>
                <ThemedText style={[styles.eventDateText, { color: ACCENT_GOLD }]}>{event.date}</ThemedText>
              </View>
              <View style={styles.eventInfoCol}>
                <ThemedText style={[styles.eventRowName, { color: colors.text }]}>{event.name}</ThemedText>
                <ThemedText style={[styles.eventRowTrack, { color: colors.textTertiary }]}>
                  {event.track} · {event.location} · {event.laps} laps
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Completed</ThemedText>
        {completed.map((event) => (
          <View key={event.id} style={[styles.eventRow, { borderBottomColor: colors.border }]}>
            <View style={styles.eventDateCol}>
              <ThemedText style={[styles.eventDateText, { color: colors.textTertiary }]}>{event.date}</ThemedText>
            </View>
            <View style={styles.eventInfoCol}>
              <ThemedText style={[styles.eventRowName, { color: colors.text }]}>{event.name}</ThemedText>
              {event.winner && (
                <ThemedText style={[styles.eventRowTrack, { color: colors.textTertiary }]}>
                  Winner: {event.winner} · {event.track}
                </ThemedText>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function RulesTab({ colors }: { colors: typeof Colors.light }) {
  const categories = ['race', 'sporting', 'technical', 'safety'] as const;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {categories.map((cat) => {
        const rules = K1_RULES.filter((r) => r.category === cat);
        if (rules.length === 0) return null;
        return (
          <View key={cat} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </ThemedText>
            {rules.map((rule) => (
              <View key={rule.id} style={[styles.ruleRow, { borderBottomColor: colors.border }]}>
                <ThemedText style={[styles.ruleTitle, { color: colors.text }]}>{rule.title}</ThemedText>
                <ThemedText style={[styles.ruleSummary, { color: colors.textSecondary }]}>
                  {rule.summary}
                </ThemedText>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

function PlaceholderTab({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.placeholderContainer}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
        <ThemedText style={[styles.placeholderText, { color: colors.textTertiary }]}>
          Coming soon — this section is under development.
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CommunityHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  // Register global More handlers so Org double-tap can open this menu
  useFocusEffect(
    useCallback(() => {
      registerMoreHandlers(
        () => setMoreMenuVisible(true),
        () => setMoreMenuVisible(false)
      );
      return () => unregisterMoreHandlers();
    }, [])
  );

  const pagerRef = useRef<PagerView>(null);
  const tabScrollRef = useRef<ScrollView>(null);

  const handleTabPress = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pagerRef.current?.setPage(index);
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Hub Tab Bar (top, like Sports) */}
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        style={[styles.tabBarScroll, { borderBottomColor: colors.border }]}
      >
        {K1_HUB_TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => handleTabPress(index)}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.text : colors.textTertiary },
                  isActive && { fontWeight: '700' },
                ]}
              >
                {tab.label}
              </ThemedText>
              {isActive && <View style={[styles.tabIndicator, { backgroundColor: ACCENT_GOLD }]} />}
            </Pressable>
          );
        })}
        {/* More — overflow trigger */}
        <Pressable
          style={styles.tabItem}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setMoreMenuVisible(true);
          }}
        >
          <ThemedText style={[styles.tabLabel, { color: colors.textTertiary }]}>
            More
          </ThemedText>
        </Pressable>
      </ScrollView>

      {/* Tab Content (PagerView — swipeable) */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <View key="dashboard" style={{ flex: 1 }}>
          <HomeTab colors={colors} />
        </View>
        <View key="race-calendar" style={{ flex: 1 }}>
          <WeekendTab colors={colors} />
        </View>
        <View key="standings" style={{ flex: 1 }}>
          <StandingsTab colors={colors} />
        </View>
        <View key="teams" style={{ flex: 1 }}>
          <TeamsTab colors={colors} />
        </View>
      </PagerView>

      {/* ===== MORE OVERFLOW MENU ===== */}
      <BottomSheet visible={moreMenuVisible} onClose={() => setMoreMenuVisible(false)}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 16 }}>More</ThemedText>
          {K1_MORE_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                paddingHorizontal: 4,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              }, pressed && { opacity: 0.6 }]}
              onPress={() => setMoreMenuVisible(false)}
            >
              <ThemedText style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{item.label}</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </BottomSheet>
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
  // Tab Bar
  tabBarScroll: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBar: {
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'relative',
  },
  tabItemActive: {},
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2.5,
    borderRadius: 1.5,
  },

  // Content
  contentArea: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.md,
    paddingBottom: 120,
    gap: 12,
  },

  // Cards
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Events
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  eventWeather: {
    fontSize: 13,
    marginTop: 4,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Standings
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  standingRowFull: {
    paddingVertical: 10,
  },
  standingPos: {
    fontSize: 14,
    fontWeight: '700',
    width: 28,
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  standingInfo: {
    flex: 1,
  },
  standingName: {
    fontSize: 14,
    fontWeight: '600',
  },
  standingTeam: {
    fontSize: 12,
    marginTop: 1,
  },
  standingRight: {
    alignItems: 'flex-end',
  },
  standingPts: {
    fontSize: 15,
    fontWeight: '700',
  },
  standingGap: {
    fontSize: 11,
    marginTop: 1,
  },

  // Teams
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  teamBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamAbbr: {
    fontSize: 14,
    fontWeight: '800',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
  },
  teamMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingLeft: 4,
  },
  driverNumber: {
    width: 36,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverNumText: {
    fontSize: 12,
    fontWeight: '700',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
  },
  driverStats: {
    fontSize: 12,
    marginTop: 1,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCell: {
    width: '30%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gridColor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  gridNumber: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  gridName: {
    fontSize: 11,
    marginTop: 2,
  },
  gridPts: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // Weekend events
  eventRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eventDateCol: {
    width: 100,
  },
  eventDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventInfoCol: {
    flex: 1,
  },
  eventRowName: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventRowTrack: {
    fontSize: 12,
    marginTop: 2,
  },

  // Rules
  ruleRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ruleSummary: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Placeholder
  placeholderContainer: {
    padding: Spacing.md,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
