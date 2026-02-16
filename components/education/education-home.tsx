/**
 * Education Home — SDCC Dashboard
 * 10 swipeable hub tabs with paged tab bar + edge-hold advance
 * Dashboard | Calendar | Academics | Campus | People | Admissions | Athletics | Financial | Housing | Policies
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
import { PagedTabBar } from '@/components/ui/paged-tab-bar';
import { EdgeHoldAdvance } from '@/components/ui/edge-hold-advance';
import { TabPlaceholderPage } from '@/components/ui/tab-placeholder-page';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CalendarHub } from '@/components/schedule/calendar-hub';
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
  { id: 'calendar', label: 'Calendar' },
  { id: 'academics', label: 'Academics' },
  { id: 'campus', label: 'Campus' },
  { id: 'people', label: 'People' },
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
// CALENDAR SUB-PILLS
// =============================================================================

type EduCalendarPill = 'agenda' | 'schedule' | 'deadlines' | 'events';
const EDU_CAL_PILLS: { key: EduCalendarPill; label: string }[] = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'deadlines', label: 'Deadlines' },
  { key: 'events', label: 'Events' },
];

function EduCalendarPage({ colors, router }: { colors: typeof Colors.light; router: any }) {
  const [activePill, setActivePill] = useState<EduCalendarPill>('agenda');

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.calPillRow}>
        {EDU_CAL_PILLS.map((pill) => {
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
                Class schedules and weekly academic programming will appear here.
              </ThemedText>
            </View>
          )}
          {activePill === 'deadlines' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Academic Deadlines</ThemedText>
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
                  </View>
                </View>
              ))}
            </View>
          )}
          {activePill === 'events' && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Events</ThemedText>
              <ThemedText style={[styles.listSubtitle, { color: colors.textTertiary }]}>
                Campus events, commencement, and special programs will appear here.
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

export function EducationHome() {
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
      <PagedTabBar tabs={EDU_HUB_TABS} activeIndex={activeIndex} onTabPress={handleTabPress} />

      {/* ===== TAB CONTENT (PagerView — swipeable) ===== */}
      <EdgeHoldAdvance activeIndex={activeIndex} tabCount={EDU_HUB_TABS.length} onAdvance={handleTabPress}>
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
            <EduCalendarPage colors={colors} router={router} />
          </View>
          <View key="academics" style={{ flex: 1 }}>
            <CalendarTab colors={colors} />
          </View>
          <View key="campus" style={{ flex: 1 }}>
            <MetricsTab colors={colors} />
          </View>
          <View key="people" style={{ flex: 1 }}>
            <TabPlaceholderPage title="People" />
          </View>
          <View key="admissions" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Admissions" />
          </View>
          <View key="athletics" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Athletics" />
          </View>
          <View key="financial" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Financial" />
          </View>
          <View key="housing" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Housing" />
          </View>
          <View key="policies" style={{ flex: 1 }}>
            <TabPlaceholderPage title="Policies" />
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

  // Calendar sub-pills
  calPillRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 16, gap: 6 },
  calPill: { flex: 1, paddingVertical: 6, borderRadius: 18, alignItems: 'center' },
  calPillText: { fontSize: 13, fontWeight: '600' },
  calScrollContent: { paddingHorizontal: Spacing.md, paddingTop: 0, paddingBottom: 40 },
});
