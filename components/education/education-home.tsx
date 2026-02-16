/**
 * Education Home — SDCC Dashboard
 * 4 swipeable hub tabs + More overflow (v1 LOCKED)
 * Dashboard | Academics | People | Campus + More
 */

import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/core';
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
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerMoreHandlers, unregisterMoreHandlers } from '@/utils/global-more';
import { RailsSection } from '@/components/rails/rails-section';
import { DashboardRenderer } from '@/components/dashboard/dashboard-renderer';
import { buildEducationDashboard } from '@/data/dashboard-payloads';
import {
  ACADEMIC_CALENDAR,
  DEPARTMENTS,
  FACULTY_LEADERSHIP,
  INSTITUTIONAL_METRICS,
  getUpcomingEvents,
  formatCalendarEventDate,
  getCalendarEventTypeLabel,
  getFacultyRoleLabel,
  getArchivedYears,
} from '@/data/mock-education';

const ACCENT_GOLD = '#FFFFFF';

// =============================================================================
// HUB TABS
// =============================================================================

const EDU_HUB_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'academics', label: 'Academics' },
  { id: 'people', label: 'People' },
  { id: 'campus', label: 'Campus' },
];

const EDU_MORE_ITEMS = [
  { id: 'admissions', label: 'Admissions' },
  { id: 'athletics', label: 'Athletics' },
  { id: 'financial', label: 'Financial' },
  { id: 'housing', label: 'Housing' },
  { id: 'policies', label: 'Policies' },
];

// =============================================================================
// TAB CONTENT COMPONENTS
// =============================================================================

function HomeTab({ colors }: { colors: typeof Colors.light }) {
  const payload = buildEducationDashboard();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <DashboardRenderer payload={payload} renderAsFragment />
      <RailsSection />
    </ScrollView>
  );
}

function CalendarTab({ colors }: { colors: typeof Colors.light }) {
  const events = getUpcomingEvents(20);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Academic Calendar</ThemedText>
        {ACADEMIC_CALENDAR.map((evt) => (
          <View key={evt.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.dateBadge, { backgroundColor: ACCENT_GOLD + '15' }]}>
              <ThemedText style={[styles.dateBadgeText, { color: ACCENT_GOLD }]}>
                {formatCalendarEventDate(evt)}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listTitle, { color: colors.text }]}>{evt.title}</ThemedText>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary }]}>
                {getCalendarEventTypeLabel(evt.type)}
              </ThemedText>
              {evt.description && (
                <ThemedText style={[styles.listMeta, { color: colors.textSecondary }]}>
                  {evt.description}
                </ThemedText>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DepartmentsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {DEPARTMENTS.map((dept) => (
        <View key={dept.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.cardTitleText, { color: colors.text }]}>{dept.name}</ThemedText>
          <ThemedText style={[styles.termDetail, { color: colors.textSecondary }]}>
            {dept.description}
          </ThemedText>
          <View style={[styles.deptMeta, { backgroundColor: colors.text + '08' }]}>
            <ThemedText style={[styles.deptMetaText, { color: colors.textTertiary }]}>
              {dept.programCount} Programs
            </ThemedText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function FacultyTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Faculty & Leadership</ThemedText>
        {FACULTY_LEADERSHIP.map((faculty) => (
          <View key={faculty.id} style={[styles.listRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listTitle, { color: colors.text }]}>{faculty.name}</ThemedText>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary }]}>
                {faculty.title}
              </ThemedText>
              {faculty.bio && (
                <ThemedText style={[styles.listMeta, { color: colors.textSecondary }]} numberOfLines={2}>
                  {faculty.bio}
                </ThemedText>
              )}
            </View>
            <View style={[styles.roleBadge, { backgroundColor: ACCENT_GOLD + '15' }]}>
              <ThemedText style={{ fontSize: 11, fontWeight: '600', color: ACCENT_GOLD }}>
                {getFacultyRoleLabel(faculty.role)}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function MetricsTab({ colors }: { colors: typeof Colors.light }) {
  const m = INSTITUTIONAL_METRICS;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Enrollment */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Enrollment</ThemedText>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{m.enrollment.total}</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Total</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{m.enrollment.undergraduate}</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Undergrad</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{m.enrollment.graduate}</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Graduate</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: '#22C55E' }]}>
              +{m.enrollment.yearOverYearChange}%
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>YoY Growth</ThemedText>
          </View>
        </View>
      </View>

      {/* Academics */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Academics</ThemedText>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{m.academics.programs}</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Programs</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{m.academics.facultyCount}</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Faculty</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{m.academics.studentFacultyRatio}</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Ratio</ThemedText>
          </View>
        </View>
      </View>

      {/* Outcomes */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Student Outcomes</ThemedText>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: '#22C55E' }]}>{m.outcomes.graduationRate}%</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Graduation</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{m.outcomes.retentionRate}%</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Retention</ThemedText>
          </View>
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>{m.outcomes.employmentRate}%</ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Employment</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function ArchiveTab({ colors }: { colors: typeof Colors.light }) {
  const archive = getArchivedYears();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {archive.map((year) => (
        <View key={year.year} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.cardTitleText, { color: colors.text }]}>{year.year}</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>{year.enrollment}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>Enrolled</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>{year.graduates}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>Graduates</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>{year.graduationRate}%</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>Grad Rate</ThemedText>
            </View>
          </View>
          {year.highlights.length > 0 && (
            <View style={{ marginTop: 12, gap: 4 }}>
              {year.highlights.map((h, i) => (
                <ThemedText key={i} style={[styles.listMeta, { color: colors.textSecondary }]}>
                  {'\u2022'} {h}
                </ThemedText>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EducationHome() {
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
      {/* ===== HUB TAB BAR (top, like Sports) ===== */}
      <View style={[styles.tabBarContainer, { borderBottomColor: colors.divider }]}>
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {EDU_HUB_TABS.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <Pressable
                key={tab.id}
                style={[
                  styles.hubTab,
                  isActive && [styles.hubTabActive, { borderBottomColor: colors.text }],
                ]}
                onPress={() => handleTabPress(index)}
              >
                <ThemedText
                  style={[
                    styles.hubTabLabel,
                    { color: isActive ? colors.text : colors.textTertiary },
                    isActive && styles.hubTabLabelActive,
                  ]}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
          {/* More — overflow trigger */}
          <Pressable
            style={[styles.hubTab]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMoreMenuVisible(true);
            }}
          >
            <ThemedText style={[styles.hubTabLabel, { color: colors.textTertiary }]}>
              More
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>

      {/* ===== TAB CONTENT (PagerView — swipeable) ===== */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <View key="dashboard" style={{ flex: 1 }}>
          <HomeTab colors={colors} />
        </View>
        <View key="academics" style={{ flex: 1 }}>
          <CalendarTab colors={colors} />
        </View>
        <View key="people" style={{ flex: 1 }}>
          <FacultyTab colors={colors} />
        </View>
        <View key="campus" style={{ flex: 1 }}>
          <MetricsTab colors={colors} />
        </View>
      </PagerView>

      {/* ===== MORE OVERFLOW MENU ===== */}
      <BottomSheet visible={moreMenuVisible} onClose={() => setMoreMenuVisible(false)}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}>
          <ThemedText style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 16 }}>More</ThemedText>
          {EDU_MORE_ITEMS.map((item) => (
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
  tabBarContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
  },
  tabBarContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  hubTab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  hubTabActive: {
    borderBottomWidth: 2.5,
  },
  hubTabLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  hubTabLabelActive: {
    fontWeight: '700',
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
  termName: {
    fontSize: 20,
    fontWeight: '700',
  },
  termDetail: {
    fontSize: 14,
    marginTop: 4,
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
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deptMeta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
  },
  deptMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
