/**
 * Church Organization Ministries — Ministry management & health monitoring.
 * Sub-tabs: Directory | Coverage | Calendar | Health
 * RBAC: C1 (Senior Pastor) all, C2 (Elder) all, C3 (Staff) directory+coverage+calendar,
 *        C4 (Member) directory only, C5 (Visitor) locked.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isStaffLevel, isElderLevel, isMember } from '@/utils/church-rbac';
import { OrgMinistriesTab } from '@/components/organization/org-ministries-tab';
import {
  getChurchMinistriesData,
  MINISTRY_STATUS_COLORS,
  SEAT_STATUS_COLORS,
  SEAT_STATUS_LABELS,
  HEALTH_COLORS,
  STAFFING_STATUS_COLORS,
  STAFFING_STATUS_LABELS,
} from '@/data/mock-church-org-ministries';
import type {
  MinistryCoverage,
  MinistryCalendarEvent,
  MinistryHealthCard,
  MinistrySeat,
} from '@/data/mock-church-org-ministries';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'directory', label: 'Directory' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'calendar', label: 'Schedule' },
  { id: 'health', label: 'Health' },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: ChurchRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

/** Get the current week's dates starting from Monday of today's week. */
function getCurrentWeekDates(): { dayLabel: string; date: string; dayOfMonth: number }[] {
  const today = new Date('2026-02-18');
  const dayOfWeek = today.getDay(); // 0 = Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return WEEK_DAYS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return { dayLabel: label, date: `${yyyy}-${mm}-${dd}`, dayOfMonth: d.getDate() };
  });
}

function groupEventsByDate(events: MinistryCalendarEvent[]): Record<string, MinistryCalendarEvent[]> {
  const grouped: Record<string, MinistryCalendarEvent[]> = {};
  for (const ev of events) {
    if (!grouped[ev.date]) grouped[ev.date] = [];
    grouped[ev.date].push(ev);
  }
  return grouped;
}

// =============================================================================
// SUB-TAB BAR
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
      style={{ flexGrow: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// DIRECTORY SUB-TAB
// =============================================================================

function DirectoryTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  return (
    <View style={s.flex1}>
      <OrgMinistriesTab colors={colors} accentColor={accentColor} />
    </View>
  );
}

// =============================================================================
// COVERAGE SUB-TAB
// =============================================================================

function CoverageTab({
  colors,
  accentColor,
  data,
  onSelectMinistry,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchMinistriesData>;
  onSelectMinistry: (ministry: MinistryCoverage) => void;
}) {
  const { tiles, coverage } = data;

  const renderCoverageItem = useCallback(
    ({ item }: { item: MinistryCoverage }) => {
      const fillPercent = item.totalSeats > 0
        ? Math.round((item.filledSeats / item.totalSeats) * 100)
        : 0;
      const barColor = fillPercent >= 80 ? '#22C55E' : fillPercent >= 50 ? '#F59E0B' : '#EF4444';

      return (
        <Pressable
          style={[s.coverageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectMinistry(item);
          }}
        >
          {/* Header */}
          <View style={s.coverageHeader}>
            <View style={[s.coverageIconCircle, { backgroundColor: accentColor + '18' }]}>
              <IconSymbol name={item.icon as any} size={18} color={accentColor} />
            </View>
            <View style={s.coverageNameCol}>
              <ThemedText style={[s.coverageName, { color: colors.text }]} numberOfLines={1}>
                {item.ministryName}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>

          {/* Progress bar */}
          <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
            <ProgressBar percent={fillPercent} color={barColor} />
          </View>

          {/* Stats row */}
          <View style={s.coverageStats}>
            <View style={s.coverageStat}>
              <ThemedText style={[s.coverageStatValue, { color: colors.text }]}>
                {item.filledSeats}/{item.totalSeats}
              </ThemedText>
              <ThemedText style={[s.coverageStatLabel, { color: colors.textTertiary }]}>
                Seats Filled
              </ThemedText>
            </View>
            <View style={s.coverageStat}>
              <ThemedText
                style={[
                  s.coverageStatValue,
                  { color: item.vacantLeadership > 0 ? '#EF4444' : colors.text },
                ]}
              >
                {item.vacantLeadership}
              </ThemedText>
              <ThemedText style={[s.coverageStatLabel, { color: colors.textTertiary }]}>
                Vacant Leadership
              </ThemedText>
            </View>
            <View style={s.coverageStat}>
              <ThemedText
                style={[
                  s.coverageStatValue,
                  { color: item.volunteerGaps > 0 ? '#F59E0B' : colors.text },
                ]}
              >
                {item.volunteerGaps}
              </ThemedText>
              <ThemedText style={[s.coverageStatLabel, { color: colors.textTertiary }]}>
                Volunteer Gaps
              </ThemedText>
            </View>
          </View>

          {/* Leadership vacancy flag */}
          {item.vacantLeadership > 0 && (
            <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
              <View style={s.coverageFlagRow}>
                <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
                <ThemedText style={s.coverageFlagText}>Leadership vacancy</ThemedText>
              </View>
            </View>
          )}
        </Pressable>
      );
    },
    [colors, accentColor, onSelectMinistry],
  );

  return (
    <FlatList
      data={coverage}
      keyExtractor={(item) => item.ministryId}
      renderItem={renderCoverageItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* KPI Tiles — 2x2 grid */}
          <View style={s.kpiGrid}>
            <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.kpiValue, { color: accentColor }]}>
                {tiles.activeMinistries}
              </ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                Active Ministries
              </ThemedText>
            </View>
            <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.kpiValue, { color: '#EF4444' }]}>
                {tiles.vacantLeadership}
              </ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                Vacant Leadership
              </ThemedText>
            </View>
            <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.kpiValue, { color: '#F59E0B' }]}>
                {tiles.volunteerGaps}
              </ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                Volunteer Gaps
              </ThemedText>
            </View>
            <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText
                style={[
                  s.kpiValue,
                  { color: tiles.complianceFlags > 0 ? '#EF4444' : '#22C55E' },
                ]}
              >
                {tiles.complianceFlags}
              </ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                Compliance Flags
              </ThemedText>
            </View>
          </View>

          {/* Section title */}
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
            Seat Coverage by Ministry
          </ThemedText>
        </>
      }
      ListEmptyComponent={
        <EmptyState icon="person.crop.rectangle.stack.fill" label="No ministries found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CALENDAR SUB-TAB
// =============================================================================

function CalendarTab({
  colors,
  accentColor,
  events,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  events: MinistryCalendarEvent[];
}) {
  const weekDates = useMemo(() => getCurrentWeekDates(), []);
  const todayStr = '2026-02-18';
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);

  // All events for the selected date
  const dayEvents = useMemo(() => {
    return groupedEvents[selectedDate] || [];
  }, [groupedEvents, selectedDate]);

  // Also show upcoming events for the rest of the week if viewing a day with no events
  const weekEvents = useMemo(() => {
    const dates = weekDates.map((d) => d.date).sort();
    const allWeek: MinistryCalendarEvent[] = [];
    for (const date of dates) {
      if (groupedEvents[date]) {
        allWeek.push(...groupedEvents[date]);
      }
    }
    return allWeek;
  }, [weekDates, groupedEvents]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Week Day Strip */}
      <View style={s.calendarDayRow}>
        {weekDates.map((wd) => {
          const isActive = wd.date === selectedDate;
          const isToday = wd.date === todayStr;
          const hasEvents = !!(groupedEvents[wd.date] && groupedEvents[wd.date].length > 0);
          return (
            <Pressable
              key={wd.date}
              style={[
                s.dayPill,
                isActive && [s.dayPillActive, { backgroundColor: accentColor }],
                !isActive && { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDate(wd.date);
              }}
            >
              <ThemedText
                style={[
                  s.dayPillLabel,
                  { color: isActive ? '#000' : colors.textTertiary },
                ]}
              >
                {wd.dayLabel}
              </ThemedText>
              <ThemedText
                style={[
                  s.dayPillNumber,
                  { color: isActive ? '#000' : colors.text },
                ]}
              >
                {wd.dayOfMonth}
              </ThemedText>
              {hasEvents && !isActive && (
                <View style={[s.dayPillDot, { backgroundColor: accentColor }]} />
              )}
              {isToday && !isActive && (
                <View style={[s.dayPillTodayBar, { backgroundColor: accentColor + '60' }]} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Date Header */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>
        {formatDate(selectedDate)}
      </ThemedText>

      {/* Events for selected date */}
      {dayEvents.length > 0 ? (
        dayEvents.map((ev) => {
          const staffColor = STAFFING_STATUS_COLORS[ev.staffingStatus] || '#A1A1AA';
          const staffLabel = STAFFING_STATUS_LABELS[ev.staffingStatus] || ev.staffingStatus;
          return (
            <View
              key={ev.id}
              style={[s.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={s.eventHeader}>
                <View style={[s.eventMinistryIcon, { backgroundColor: accentColor + '18' }]}>
                  <IconSymbol name="calendar" size={14} color={accentColor} />
                </View>
                <View style={s.eventInfo}>
                  <ThemedText style={[s.eventMinistryName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {ev.ministryName}
                  </ThemedText>
                  <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={2}>
                    {ev.title}
                  </ThemedText>
                </View>
                <StatusBadge label={staffLabel.toUpperCase()} color={staffColor} />
              </View>
              <View style={s.eventMeta}>
                <View style={s.eventMetaItem}>
                  <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.eventTime, { color: colors.textTertiary }]}>
                    {ev.time}
                  </ThemedText>
                </View>
                <View style={s.eventMetaItem}>
                  <IconSymbol name="mappin.circle.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.eventRoom, { color: colors.textTertiary }]}>
                    {ev.room}
                  </ThemedText>
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <EmptyState icon="calendar" label="No events scheduled for this day" colors={colors} />
      )}

      {/* Upcoming This Week — if viewing a day with no events, show full week */}
      {dayEvents.length === 0 && weekEvents.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            This Week
          </ThemedText>
          <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
            All ministry events for this week
          </ThemedText>
          {weekEvents.map((ev) => {
            const staffColor = STAFFING_STATUS_COLORS[ev.staffingStatus] || '#A1A1AA';
            const staffLabel = STAFFING_STATUS_LABELS[ev.staffingStatus] || ev.staffingStatus;
            return (
              <View
                key={ev.id}
                style={[s.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.eventHeader}>
                  <View style={[s.eventMinistryIcon, { backgroundColor: accentColor + '18' }]}>
                    <IconSymbol name="calendar" size={14} color={accentColor} />
                  </View>
                  <View style={s.eventInfo}>
                    <ThemedText style={[s.eventMinistryName, { color: colors.textSecondary }]} numberOfLines={1}>
                      {ev.ministryName}
                    </ThemedText>
                    <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={2}>
                      {ev.title}
                    </ThemedText>
                  </View>
                  <StatusBadge label={staffLabel.toUpperCase()} color={staffColor} />
                </View>
                <View style={s.eventMeta}>
                  <View style={s.eventMetaItem}>
                    <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.eventTime, { color: colors.textTertiary }]}>
                      {formatDate(ev.date)}
                    </ThemedText>
                  </View>
                  <View style={s.eventMetaItem}>
                    <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.eventTime, { color: colors.textTertiary }]}>
                      {ev.time}
                    </ThemedText>
                  </View>
                  <View style={s.eventMetaItem}>
                    <IconSymbol name="mappin.circle.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.eventRoom, { color: colors.textTertiary }]}>
                      {ev.room}
                    </ThemedText>
                  </View>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Staffing Summary */}
      {weekEvents.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Staffing Overview
          </ThemedText>
          <View style={s.staffingSummaryRow}>
            <View style={[s.staffingSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.staffingSummaryDot, { backgroundColor: '#22C55E' }]} />
              <ThemedText style={[s.staffingSummaryValue, { color: colors.text }]}>
                {weekEvents.filter((e) => e.staffingStatus === 'fully_staffed').length}
              </ThemedText>
              <ThemedText style={[s.staffingSummaryLabel, { color: colors.textSecondary }]}>
                Fully Staffed
              </ThemedText>
            </View>
            <View style={[s.staffingSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.staffingSummaryDot, { backgroundColor: '#F59E0B' }]} />
              <ThemedText style={[s.staffingSummaryValue, { color: colors.text }]}>
                {weekEvents.filter((e) => e.staffingStatus === 'needs_volunteers').length}
              </ThemedText>
              <ThemedText style={[s.staffingSummaryLabel, { color: colors.textSecondary }]}>
                Needs Volunteers
              </ThemedText>
            </View>
            <View style={[s.staffingSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.staffingSummaryDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText style={[s.staffingSummaryValue, { color: colors.text }]}>
                {weekEvents.filter((e) => e.staffingStatus === 'critical').length}
              </ThemedText>
              <ThemedText style={[s.staffingSummaryLabel, { color: colors.textSecondary }]}>
                Critical
              </ThemedText>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// =============================================================================
// HEALTH SUB-TAB
// =============================================================================

function HealthTab({
  colors,
  accentColor,
  healthCards,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  healthCards: MinistryHealthCard[];
}) {
  // Sort by health: red first, then yellow, then green
  const sorted = useMemo(() => {
    const order: Record<string, number> = { red: 0, yellow: 1, green: 2 };
    return [...healthCards].sort(
      (a, b) => (order[a.overallHealth] ?? 2) - (order[b.overallHealth] ?? 2),
    );
  }, [healthCards]);

  // Ministries with risks, sorted by severity (red > yellow > green), by number of risk notes
  const riskyMinistries = useMemo(() => {
    return sorted.filter((m) => m.riskNotes.length > 0);
  }, [sorted]);

  const renderHealthItem = useCallback(
    ({ item }: { item: MinistryHealthCard }) => {
      const healthColor = HEALTH_COLORS[item.overallHealth];
      const trendPositive = item.attendanceTrend >= 0;
      const trendColor = trendPositive ? '#22C55E' : '#EF4444';
      const trendIcon = trendPositive ? 'arrow.up.right' : 'arrow.down.right';
      const coverageColor = item.volunteerCoverage >= 75 ? '#22C55E' : item.volunteerCoverage >= 50 ? '#F59E0B' : '#EF4444';
      const followUpColor = item.followUpThroughput >= 75 ? '#22C55E' : item.followUpThroughput >= 50 ? '#F59E0B' : '#EF4444';
      const budgetColor = item.budgetVariance >= 0 ? '#22C55E' : '#EF4444';

      return (
        <View style={[s.healthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={s.healthHeader}>
            <View style={[s.healthIconCircle, { backgroundColor: healthColor + '18' }]}>
              <IconSymbol name={item.icon as any} size={18} color={healthColor} />
            </View>
            <View style={s.healthNameCol}>
              <ThemedText style={[s.healthName, { color: colors.text }]} numberOfLines={1}>
                {item.ministryName}
              </ThemedText>
            </View>
            <View style={[s.healthDot, { backgroundColor: healthColor }]} />
          </View>

          {/* Metrics */}
          <View style={s.healthMetrics}>
            {/* Attendance Trend */}
            <View style={s.healthMetricRow}>
              <ThemedText style={[s.healthMetricLabel, { color: colors.textSecondary }]}>
                Attendance Trend
              </ThemedText>
              <View style={s.healthMetricValueRow}>
                <IconSymbol name={trendIcon as any} size={12} color={trendColor} />
                <ThemedText style={[s.healthMetricValue, { color: trendColor }]}>
                  {trendPositive ? '+' : ''}{item.attendanceTrend}%
                </ThemedText>
              </View>
            </View>

            {/* Volunteer Coverage */}
            <View style={s.healthMetricRow}>
              <ThemedText style={[s.healthMetricLabel, { color: colors.textSecondary }]}>
                Volunteer Coverage
              </ThemedText>
              <View style={s.healthMetricProgressCol}>
                <ThemedText style={[s.healthMetricPercent, { color: coverageColor }]}>
                  {item.volunteerCoverage}%
                </ThemedText>
                <View style={s.healthProgressTrack}>
                  <View
                    style={[
                      s.healthProgressFill,
                      {
                        width: `${Math.min(item.volunteerCoverage, 100)}%`,
                        backgroundColor: coverageColor,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Follow-Up Throughput */}
            <View style={s.healthMetricRow}>
              <ThemedText style={[s.healthMetricLabel, { color: colors.textSecondary }]}>
                Follow-Up Throughput
              </ThemedText>
              <View style={s.healthMetricProgressCol}>
                <ThemedText style={[s.healthMetricPercent, { color: followUpColor }]}>
                  {item.followUpThroughput}%
                </ThemedText>
                <View style={s.healthProgressTrack}>
                  <View
                    style={[
                      s.healthProgressFill,
                      {
                        width: `${Math.min(item.followUpThroughput, 100)}%`,
                        backgroundColor: followUpColor,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Budget Variance */}
            <View style={s.healthMetricRow}>
              <ThemedText style={[s.healthMetricLabel, { color: colors.textSecondary }]}>
                Budget Variance
              </ThemedText>
              <ThemedText style={[s.healthMetricValue, { color: budgetColor }]}>
                {item.budgetVariance >= 0 ? '+' : ''}{item.budgetVariance}%
              </ThemedText>
            </View>
          </View>

          {/* Risk Notes */}
          {item.riskNotes.length > 0 && (
            <View style={[s.healthRiskSection, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.healthRiskTitle, { color: colors.textSecondary }]}>
                Risk Notes
              </ThemedText>
              {item.riskNotes.map((note, idx) => (
                <View key={`risk-${idx}`} style={s.healthRiskItem}>
                  <IconSymbol name="exclamationmark.circle.fill" size={12} color="#EF4444" />
                  <ThemedText style={[s.healthRiskText, { color: '#EF4444' }]} numberOfLines={3}>
                    {note}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.ministryId}
      renderItem={renderHealthItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* Health Summary KPIs */}
          <View style={s.healthSummaryRow}>
            <View style={[s.healthSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.healthSummaryDot, { backgroundColor: '#22C55E' }]} />
              <ThemedText style={[s.healthSummaryValue, { color: colors.text }]}>
                {healthCards.filter((h) => h.overallHealth === 'green').length}
              </ThemedText>
              <ThemedText style={[s.healthSummaryLabel, { color: colors.textSecondary }]}>
                Healthy
              </ThemedText>
            </View>
            <View style={[s.healthSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.healthSummaryDot, { backgroundColor: '#F59E0B' }]} />
              <ThemedText style={[s.healthSummaryValue, { color: colors.text }]}>
                {healthCards.filter((h) => h.overallHealth === 'yellow').length}
              </ThemedText>
              <ThemedText style={[s.healthSummaryLabel, { color: colors.textSecondary }]}>
                Watch
              </ThemedText>
            </View>
            <View style={[s.healthSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.healthSummaryDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText style={[s.healthSummaryValue, { color: colors.text }]}>
                {healthCards.filter((h) => h.overallHealth === 'red').length}
              </ThemedText>
              <ThemedText style={[s.healthSummaryLabel, { color: colors.textSecondary }]}>
                Critical
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
            Ministry Scorecards
          </ThemedText>
          <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
            Sorted by health — most critical first
          </ThemedText>
        </>
      }
      ListFooterComponent={
        riskyMinistries.length > 0 ? (
          <View style={s.riskSection}>
            <ThemedText style={[s.riskTitle, { color: colors.text }]}>
              Risk Register
            </ThemedText>
            <ThemedText style={[s.riskSubtitle, { color: colors.textSecondary }]}>
              Ministries with active risk notes — ranked by severity
            </ThemedText>
            {riskyMinistries.map((ministry) => {
              const healthColor = HEALTH_COLORS[ministry.overallHealth];
              return (
                <View
                  key={`risk-reg-${ministry.ministryId}`}
                  style={[s.riskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={s.riskCardHeader}>
                    <View style={[s.riskCardDot, { backgroundColor: healthColor }]} />
                    <ThemedText style={[s.riskCardName, { color: colors.text }]} numberOfLines={1}>
                      {ministry.ministryName}
                    </ThemedText>
                    <StatusBadge
                      label={ministry.overallHealth.toUpperCase()}
                      color={healthColor}
                    />
                  </View>
                  {ministry.riskNotes.map((note, idx) => (
                    <View key={`rr-note-${idx}`} style={s.riskCardNoteRow}>
                      <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#EF4444" />
                      <ThemedText style={[s.riskCardNote, { color: colors.textSecondary }]} numberOfLines={2}>
                        {note}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState icon="heart.text.square.fill" label="No ministry health data available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MINISTRY SEAT DETAIL BOTTOM SHEET
// =============================================================================

function MinistrySeatSheet({
  visible,
  onClose,
  ministry,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  ministry: MinistryCoverage | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!ministry) return null;

  const filledCount = ministry.seats.filter((s) => s.status === 'filled').length;
  const vacantCount = ministry.seats.filter((s) => s.status === 'vacant').length;
  const interimCount = ministry.seats.filter((s) => s.status === 'interim').length;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`${ministry.ministryName} — Seat Coverage`}
      useModal
    >
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge
          label={`${ministry.filledSeats}/${ministry.totalSeats} FILLED`}
          color={accentColor}
        />
        {vacantCount > 0 && (
          <StatusBadge
            label={`${vacantCount} VACANT`}
            color="#EF4444"
          />
        )}
        {interimCount > 0 && (
          <StatusBadge
            label={`${interimCount} INTERIM`}
            color="#F59E0B"
          />
        )}
      </View>

      {/* Divider */}
      <View style={[s.sheetDivider, { backgroundColor: colors.border }]} />

      {/* Seat List */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Seat Roster
        </ThemedText>
        {ministry.seats.map((seat) => {
          const seatColor = SEAT_STATUS_COLORS[seat.status];
          const seatLabel = SEAT_STATUS_LABELS[seat.status];
          return (
            <View
              key={seat.id}
              style={[s.sheetSeatRow, { borderBottomColor: colors.border }]}
            >
              <View style={s.sheetSeatInfo}>
                <View style={s.sheetSeatRoleRow}>
                  <ThemedText style={[s.sheetSeatRole, { color: colors.text }]}>
                    {seat.role}
                  </ThemedText>
                  {seat.critical && (
                    <View style={s.sheetCriticalIcon}>
                      <IconSymbol name="exclamationmark.shield.fill" size={12} color="#EF4444" />
                    </View>
                  )}
                </View>
                <ThemedText
                  style={[
                    s.sheetSeatHolder,
                    {
                      color: seat.holder ? colors.textSecondary : '#EF4444',
                      fontWeight: seat.holder ? '400' : '700',
                    },
                  ]}
                >
                  {seat.holder || 'VACANT'}
                </ThemedText>
              </View>
              <StatusBadge label={seatLabel.toUpperCase()} color={seatColor} />
            </View>
          );
        })}
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Close
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchOrgMinistries({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C11 (Visitor) locked ===
  if (role === 'C11') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Ministries</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          This section is restricted. Contact church staff for access.
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('directory');
  const [selectedMinistry, setSelectedMinistry] = useState<MinistryCoverage | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getChurchMinistriesData(), []);

  // === Callbacks ===
  const handleSelectMinistry = useCallback((ministry: MinistryCoverage) => {
    setSelectedMinistry(ministry);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS;
    if (isStaffLevel(role)) return SUB_TABS.filter((t) => t.id !== 'health');
    return SUB_TABS.filter((t) => t.id === 'directory');
  }, [role]);

  // Reset to first visible tab if current tab is not visible
  const effectiveTab = useMemo(() => {
    const isVisible = visibleSubTabs.some((t) => t.id === activeSubTab);
    return isVisible ? activeSubTab : visibleSubTabs[0]?.id ?? 'directory';
  }, [activeSubTab, visibleSubTabs]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (effectiveTab) {
      case 'directory':
        return <DirectoryTab colors={colors} accentColor={accentColor} />;
      case 'coverage':
        if (!isStaffLevel(role)) return null;
        return (
          <CoverageTab
            colors={colors}
            accentColor={accentColor}
            data={data}
            onSelectMinistry={handleSelectMinistry}
          />
        );
      case 'calendar':
        if (!isStaffLevel(role)) return null;
        return (
          <CalendarTab
            colors={colors}
            accentColor={accentColor}
            events={data.calendar}
          />
        );
      case 'health':
        if (!isElderLevel(role)) return null;
        return (
          <HealthTab
            colors={colors}
            accentColor={accentColor}
            healthCards={data.health}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={effectiveTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Ministry Seat Detail Bottom Sheet */}
      <MinistrySeatSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        ministry={selectedMinistry}
        colors={colors}
        accentColor={accentColor}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // -- KPI Grid (2x2) --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Coverage Card --
  coverageCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  coverageIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverageNameCol: {
    flex: 1,
  },
  coverageName: {
    fontSize: 15,
    fontWeight: '600',
  },
  coverageStats: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  coverageStat: {
    flex: 1,
    alignItems: 'center',
  },
  coverageStatValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  coverageStatLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  coverageFlagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coverageFlagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },

  // -- Calendar: Day Row --
  calendarDayRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    position: 'relative',
  },
  dayPillActive: {
    borderWidth: 0,
  },
  dayPillLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dayPillNumber: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  dayPillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  dayPillTodayBar: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
  },

  // -- Calendar: Event Card --
  eventCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  eventMinistryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventMinistryName: {
    fontSize: 11,
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTime: {
    fontSize: 11,
  },
  eventRoom: {
    fontSize: 11,
  },

  // -- Calendar: Staffing Summary --
  staffingSummaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  staffingSummaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  staffingSummaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  staffingSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  staffingSummaryLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Health Card --
  healthCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  healthIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthNameCol: {
    flex: 1,
  },
  healthName: {
    fontSize: 15,
    fontWeight: '600',
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // -- Health Metrics --
  healthMetrics: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  healthMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  healthMetricLabel: {
    fontSize: 12,
    flex: 1,
  },
  healthMetricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  healthMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  healthMetricProgressCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  healthMetricPercent: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 36,
    textAlign: 'right',
  },
  healthProgressTrack: {
    height: 4,
    width: 80,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
  },
  healthProgressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Health Risk Notes --
  healthRiskSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  healthRiskTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  healthRiskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  healthRiskText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },

  // -- Health Summary Row --
  healthSummaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  healthSummaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  healthSummaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  healthSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  healthSummaryLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Risk Register Section --
  riskSection: {
    marginTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  riskTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  riskSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  riskCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  riskCardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskCardName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  riskCardNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
    paddingLeft: 16,
  },
  riskCardNote: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },

  // -- Bottom Sheet: Badge Row --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },

  // -- Bottom Sheet: Divider --
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },

  // -- Bottom Sheet: Section --
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // -- Bottom Sheet: Seat Rows --
  sheetSeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSeatInfo: {
    flex: 1,
  },
  sheetSeatRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetSeatRole: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetSeatHolder: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetCriticalIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Bottom Sheet: Actions --
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
