import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';
import { useOwnerGuard } from '@/hooks/use-owner-guard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Period = 'week' | 'month' | 'quarter' | 'custom';

interface CategoryRow {
  name: string;
  color: string;
  hours: number;
  pct: number;
}

interface ReportPeriod {
  categories: CategoryRow[];
  dayEvents: Record<string, number>;
  bookings: {
    total: number;
    revenue: string;
    avgDuration: string;
    popularSlot: string;
    noShow: number;
    noShowPrev: number;
  };
  completion: {
    rate: number;
    completed: number;
    cancelled: number;
    missed: number;
  };
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const REPORT_DATA: Record<Period, ReportPeriod> = {
  week: {
    categories: [
      { name: 'Content',   color: '#1A1714', hours: 14, pct: 35 },
      { name: 'Meetings',  color: '#E0DBD4', hours: 10, pct: 25 },
      { name: 'Personal',  color: '#9C9790', hours: 8,  pct: 20 },
      { name: 'Bookings',  color: '#5A8A6E', hours: 6,  pct: 15 },
      { name: 'Deadlines', color: '#B8943E', hours: 2,  pct: 5  },
    ],
    dayEvents: { Mon: 5, Tue: 3, Wed: 7, Thu: 4, Fri: 6, Sat: 2, Sun: 1 },
    bookings: { total: 6,  revenue: '$480',   avgDuration: '52 min', popularSlot: 'Tue 10 AM', noShow: 4, noShowPrev: 8  },
    completion: { rate: 94, completed: 47,  cancelled: 2,  missed: 1  },
  },
  month: {
    categories: [
      { name: 'Content',   color: '#1A1714', hours: 52, pct: 33 },
      { name: 'Meetings',  color: '#E0DBD4', hours: 40, pct: 25 },
      { name: 'Personal',  color: '#9C9790', hours: 32, pct: 20 },
      { name: 'Bookings',  color: '#5A8A6E', hours: 24, pct: 15 },
      { name: 'Deadlines', color: '#B8943E', hours: 12, pct: 7  },
    ],
    dayEvents: { Mon: 18, Tue: 12, Wed: 22, Thu: 14, Fri: 20, Sat: 7, Sun: 4 },
    bookings: { total: 24, revenue: '$1,920', avgDuration: '55 min', popularSlot: 'Tue 10 AM', noShow: 3, noShowPrev: 7  },
    completion: { rate: 91, completed: 182, cancelled: 10, missed: 8  },
  },
  quarter: {
    categories: [
      { name: 'Content',   color: '#1A1714', hours: 156, pct: 33 },
      { name: 'Meetings',  color: '#E0DBD4', hours: 120, pct: 25 },
      { name: 'Personal',  color: '#9C9790', hours: 96,  pct: 20 },
      { name: 'Bookings',  color: '#5A8A6E', hours: 72,  pct: 15 },
      { name: 'Deadlines', color: '#B8943E', hours: 36,  pct: 7  },
    ],
    dayEvents: { Mon: 54, Tue: 36, Wed: 66, Thu: 42, Fri: 60, Sat: 21, Sun: 12 },
    bookings: { total: 72, revenue: '$5,760', avgDuration: '50 min', popularSlot: 'Mon 9 AM',  noShow: 5, noShowPrev: 9  },
    completion: { rate: 89, completed: 546, cancelled: 30, missed: 24 },
  },
  custom: {
    categories: [
      { name: 'Content',   color: '#1A1714', hours: 14, pct: 35 },
      { name: 'Meetings',  color: '#E0DBD4', hours: 10, pct: 25 },
      { name: 'Personal',  color: '#9C9790', hours: 8,  pct: 20 },
      { name: 'Bookings',  color: '#5A8A6E', hours: 6,  pct: 15 },
      { name: 'Deadlines', color: '#B8943E', hours: 2,  pct: 5  },
    ],
    dayEvents: { Mon: 5, Tue: 3, Wed: 7, Thu: 4, Fri: 6, Sat: 2, Sun: 1 },
    bookings: { total: 6,  revenue: '$480',   avgDuration: '52 min', popularSlot: 'Tue 10 AM', noShow: 4, noShowPrev: 8  },
    completion: { rate: 94, completed: 47,  cancelled: 2,  missed: 1  },
  },
};

const PERIOD_LABELS: { key: Period; label: string }[] = [
  { key: 'week',    label: 'This Week'    },
  { key: 'month',   label: 'This Month'   },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'custom',  label: 'Custom'       },
];

const INSIGHTS = [
  'You had 40% more meetings this month than last. Consider blocking focus time for content creation.',
  'Your Tuesday afternoons are consistently empty — this could be a good time to open booking slots.',
  'Content shoots are your longest events at 3 hrs avg. Scheduling them before meetings may cause delays.',
];

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DOT_COUNT = 10;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:agenda');
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/agenda');
  const [period, setPeriod] = useState<Period>('week');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const scrollFooter = useScrollFooter();

  const data        = REPORT_DATA[period];
  const dayValues   = DAY_ORDER.map(d => data.dayEvents[d] ?? 0);
  const maxDay      = Math.max(...dayValues);
  const filledDots  = Math.round((data.completion.rate / 100) * DOT_COUNT);
  const noShowImproved = data.bookings.noShow < data.bookings.noShowPrev;

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => openSidePanel()} hitSlop={8} style={styles.topBarSide}>
          <KMenuButton />
        </Pressable>
        <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[styles.titleText, { color: C.label }]}>Reports</Text>
        </View>
        <View style={{ minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' }}>
          <RolePill role={role} onPress={guardedCycle} isPrimary={isOwner} />
        </View>
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIOD_LABELS.map(({ key, label }) => {
          const active = period === key;
          return (
            <Pressable
              key={key}
              style={[
                styles.periodPill,
                { backgroundColor: active ? C.activePill : 'transparent', borderColor: active ? C.activePill : C.separator },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPeriod(key); }}
            >
              <Text
                style={[styles.periodPillText, { color: active ? C.activePillText : C.secondary }]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView {...scrollFooter} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

        {/* Card 1: Time Breakdown */}
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <Text style={[styles.cardHeader, { color: C.secondary }]}>Time Breakdown</Text>

          {/* Stacked bar */}
          <View style={styles.stackedBar}>
            {data.categories.map(cat => (
              <View key={cat.name} style={{ flex: cat.pct, backgroundColor: cat.color }} />
            ))}
          </View>

          {data.categories.map(cat => (
            <View key={cat.name} style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.categoryName, { color: C.label }]}>{cat.name}</Text>
              <Text style={[styles.categoryHours, { color: C.label }]}>{cat.hours}h</Text>
              <Text style={[styles.categoryPct, { color: C.secondary }]}>{cat.pct}%</Text>
            </View>
          ))}
        </View>

        {/* Card 2: Busiest Days */}
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <Text style={[styles.cardHeader, { color: C.secondary }]}>Busiest Days</Text>

          <View style={styles.barsContainer}>
            {DAY_ORDER.map((day, idx) => {
              const val       = dayValues[idx];
              const isMax     = val === maxDay;
              const barHeight = maxDay > 0 ? (val / maxDay) * 96 : 0;
              return (
                <View key={day} style={styles.barColumn}>
                  <Text style={[styles.barCountText, { color: C.secondary }]}>{val}</Text>
                  <View style={[styles.barBlock, { height: barHeight, backgroundColor: isMax ? C.label : `${C.label}60` }]} />
                  <Text style={[styles.barDayLabel, { color: C.secondary }]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Card 3: Booking Stats */}
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <Text style={[styles.cardHeader, { color: C.secondary }]}>Booking Stats</Text>

          <View style={styles.bookingGrid}>
            <View style={styles.bookingCell}>
              <Text style={[styles.bookingValue, { color: C.label }]}>{data.bookings.total}</Text>
              <Text style={[styles.bookingLabel, { color: C.secondary }]}>total bookings</Text>
            </View>
            <View style={styles.bookingCell}>
              <Text style={[styles.bookingValue, { color: C.gain }]}>{data.bookings.revenue}</Text>
              <Text style={[styles.bookingLabel, { color: C.secondary }]}>KPay revenue</Text>
            </View>
            <View style={styles.bookingCell}>
              <Text style={[styles.bookingValue, { color: C.label }]}>{data.bookings.avgDuration}</Text>
              <Text style={[styles.bookingLabel, { color: C.secondary }]}>avg duration</Text>
            </View>
            <View style={styles.bookingCell}>
              <Text style={[styles.bookingValue, { color: C.label }]} numberOfLines={1} adjustsFontSizeToFit>
                {data.bookings.popularSlot}
              </Text>
              <Text style={[styles.bookingLabel, { color: C.secondary }]}>most popular</Text>
            </View>
          </View>

          <View style={[styles.noShowRow, { borderTopColor: C.separator }]}>
            <Text style={[styles.noShowMain, { color: C.label }]}>{data.bookings.noShow}% no-show rate</Text>
            <Text style={[styles.noShowTrend, { color: noShowImproved ? C.gain : C.heat }]}>
              {noShowImproved
                ? `↓ down from ${data.bookings.noShowPrev}%`
                : `↑ up from ${data.bookings.noShowPrev}%`}
            </Text>
          </View>
        </View>

        {/* Card 4: Completion Rate */}
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <Text style={[styles.cardHeader, { color: C.secondary }]}>Completion Rate</Text>

          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={[styles.completionRate, { color: C.label }]}>{data.completion.rate}%</Text>
            <Text style={[styles.completionSubLabel, { color: C.secondary }]}>events completed</Text>
          </View>

          <View style={styles.dotsRow}>
            {Array.from({ length: DOT_COUNT }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < filledDots
                    ? { backgroundColor: C.label }
                    : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.separator },
                ]}
              />
            ))}
          </View>

          <View style={styles.completionStatsRow}>
            <View style={styles.completionStat}>
              <View style={[styles.completionStatDot, { backgroundColor: C.gain }]} />
              <Text style={[styles.completionStatText, { color: C.secondary }]}>Completed </Text>
              <Text style={[styles.completionStatCount, { color: C.label }]}>{data.completion.completed}</Text>
            </View>
            <View style={styles.completionStat}>
              <View style={[styles.completionStatDot, { backgroundColor: C.heat }]} />
              <Text style={[styles.completionStatText, { color: C.secondary }]}>Cancelled </Text>
              <Text style={[styles.completionStatCount, { color: C.label }]}>{data.completion.cancelled}</Text>
            </View>
            <View style={styles.completionStat}>
              <View style={[styles.completionStatDot, { backgroundColor: C.muted }]} />
              <Text style={[styles.completionStatText, { color: C.secondary }]}>Missed </Text>
              <Text style={[styles.completionStatCount, { color: C.label }]}>{data.completion.missed}</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={[styles.insightsHeader, { marginHorizontal: 16, marginBottom: 8 }]}>
          <IconSymbol name="lightbulb.fill" size={13} color={C.secondary} />
          <Text style={[styles.insightsHeaderText, { color: C.secondary }]}>Insights</Text>
        </View>

        {INSIGHTS.map((insight, idx) => (
          <Pressable
            key={idx}
            style={[styles.insightCard, { backgroundColor: C.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="lightbulb.fill" size={16} color={C.caution} />
            <Text style={[styles.insightText, { color: C.label }]}>{insight}</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  topBarSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePill: {
    flex: 1,
    marginHorizontal: 10,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: { fontSize: 14, fontWeight: '700' },

  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  periodPill: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  periodPillText: { fontSize: 12, fontWeight: '600' },

  card: {
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  stackedBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { flex: 1, fontSize: 13 },
  categoryHours: { fontSize: 13, fontWeight: '600', marginRight: 6 },
  categoryPct: { fontSize: 12, width: 30, textAlign: 'right' },

  barsContainer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barCountText: { fontSize: 9, marginBottom: 2 },
  barBlock: { width: 28, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barDayLabel: { fontSize: 10, textAlign: 'center', marginTop: 4 },

  bookingGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  bookingCell: { width: '50%', paddingVertical: 10, paddingHorizontal: 4 },
  bookingValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  bookingLabel: { fontSize: 11 },

  noShowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  noShowMain: { fontSize: 13, fontWeight: '600' },
  noShowTrend: { fontSize: 12, fontWeight: '500' },

  completionRate: { fontSize: 48, fontWeight: '800', lineHeight: 56 },
  completionSubLabel: { fontSize: 13, marginTop: 2 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },

  completionStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  completionStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  completionStatDot: { width: 8, height: 8, borderRadius: 4 },
  completionStatText: { fontSize: 12 },
  completionStatCount: { fontSize: 12, fontWeight: '600' },

  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  insightsHeaderText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },

  insightCard: {
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
