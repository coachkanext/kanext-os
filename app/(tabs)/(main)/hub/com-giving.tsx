/**
 * Community Giving — ICCLA.
 * Pastor-only: This week's giving, MTD/YTD summary, fund breakdown, 12-month trend, top donors, alerts.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H = 52;

// ─── Data ─────────────────────────────────────────────────────────────────────

const THIS_WEEK = {
  total:    4280,
  lastWeek: 3960,
  changeP:  8,
};

const SUMMARY = {
  mtd:     18420,
  mtdGoal: 22000,
  mtdPct:  84,
  ytd:     142800,
  ytdGoal: 264000,
  ytdPct:  54,
};

const FUNDS = [
  { name: 'General Offering', amount: 11840, goal: 14000, pct: 85, icon: 'building.columns.fill' },
  { name: 'Building Fund',    amount: 5200,  goal: 6000,  pct: 87, icon: 'hammer.fill'           },
  { name: 'Missions',         amount: 1380,  goal: 1800,  pct: 77, icon: 'airplane'              },
  { name: 'Benevolence',      amount: 200,   goal: 500,   pct: 40, icon: 'heart.fill'            },
];

const TREND = [
  { month: 'Jan', amount: 12400 },
  { month: 'Feb', amount: 14200 },
  { month: 'Mar', amount: 11800 },
  { month: 'Apr', amount: 15600 },
  { month: 'May', amount: 18200 },
  { month: 'Jun', amount: 16400 },
  { month: 'Jul', amount: 13800 },
  { month: 'Aug', amount: 17200 },
  { month: 'Sep', amount: 15400 },
  { month: 'Oct', amount: 19800 },
  { month: 'Nov', amount: 16200 },
  { month: 'Dec', amount: 18420 },
];

const TOP_DONORS = [
  { initials: 'JA', name: 'James & Ada Okonkwo',  amount: '$1,200', frequency: 'Monthly'  },
  { initials: 'EM', name: 'Elder Emmanuel Mensah', amount: '$800',   frequency: 'Weekly'   },
  { initials: 'GW', name: 'Grace & William Addo',  amount: '$750',   frequency: 'Monthly'  },
  { initials: 'TK', name: 'Tobi Kalejaiye',        amount: '$600',   frequency: 'Monthly'  },
  { initials: 'RO', name: 'Ruth Osei',              amount: '$500',   frequency: 'One-time' },
];

const ALERTS = [
  { text: 'Building Fund is 12% below monthly target',  severity: 'caution' },
  { text: '3 regular givers haven\'t given this month', severity: 'caution' },
  { text: '2 pledges are overdue for follow-up',        severity: 'heat'    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
      {title}
    </Text>
  );
}

function ProgressBar({ pct, color, C }: { pct: number; color?: string; C: ComponentColors }) {
  const barColor = color ?? (pct >= 80 ? GAIN : pct >= 60 ? CAUTION : HEAT);
  return (
    <View style={{ height: 5, borderRadius: 3, backgroundColor: C.separator, overflow: 'hidden' }}>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: barColor, width: `${Math.min(pct, 100)}%` as any }} />
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ComGivingScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, toggleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const trendMax = Math.max(...TREND.map(t => t.amount));

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Giving</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 120, paddingHorizontal: 16 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >

        {/* ── THIS WEEK ── */}
        <View style={{ marginTop: 20, marginBottom: 28 }}>
          <SH title="This Week" C={C} />
          <View style={styles.card}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: C.label, marginBottom: 8 }}>
              ${THIS_WEEK.total.toLocaleString()}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ backgroundColor: GAIN + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>+{THIS_WEEK.changeP}% vs last week</Text>
              </View>
              <Text style={{ fontSize: 12, color: C.muted }}>Last week: ${THIS_WEEK.lastWeek.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* ── SUMMARY ── */}
        <View style={{ marginBottom: 28 }}>
          <SH title="Summary" C={C} />
          <View style={styles.card}>
            {/* MTD */}
            <View style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: C.secondary, fontWeight: '600' }}>Month to Date</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>${SUMMARY.mtd.toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, color: C.muted }}>/ ${SUMMARY.mtdGoal.toLocaleString()}</Text>
                </View>
              </View>
              <ProgressBar pct={SUMMARY.mtdPct} C={C} />
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{SUMMARY.mtdPct}% of goal</Text>
            </View>
            {/* YTD */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: C.secondary, fontWeight: '600' }}>Year to Date</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>${SUMMARY.ytd.toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, color: C.muted }}>/ ${SUMMARY.ytdGoal.toLocaleString()}</Text>
                </View>
              </View>
              <ProgressBar pct={SUMMARY.ytdPct} color={CAUTION} C={C} />
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{SUMMARY.ytdPct}% of annual goal</Text>
            </View>
          </View>
        </View>

        {/* ── FUND BREAKDOWN ── */}
        <View style={{ marginBottom: 28 }}>
          <SH title="Fund Breakdown" C={C} />
          {FUNDS.map((fund, i) => (
            <View key={i} style={[styles.card, { marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <IconSymbol name={fund.icon as any} size={14} color={C.label} />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{fund.name}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>${fund.amount.toLocaleString()}</Text>
              </View>
              <ProgressBar pct={fund.pct} C={C} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: C.muted }}>{fund.pct}% of goal</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>Goal: ${fund.goal.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── 12-MONTH TREND ── */}
        <View style={{ marginBottom: 28 }}>
          <SH title="12-Month Trend" C={C} />
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4, marginBottom: 6 }}>
              {TREND.map((item, i) => {
                const barH = Math.max(6, (item.amount / trendMax) * 80);
                const isLast = i === TREND.length - 1;
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ width: '100%', height: barH, borderRadius: 3, backgroundColor: isLast ? C.label : C.separator }} />
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {TREND.map((item, i) => (
                <Text key={i} style={{ flex: 1, fontSize: 8, color: C.muted, textAlign: 'center' }}>{item.month}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* ── TOP DONORS ── */}
        <View style={{ marginBottom: 28 }}>
          <SH title="Top Donors This Month" C={C} />
          <View style={{ backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 18 }}>
              For pastoral awareness and thank-you. This is not a ranking.
            </Text>
          </View>
          {TOP_DONORS.map((donor, i) => (
            <View key={i} style={[styles.card, { marginBottom: 6, flexDirection: 'row', alignItems: 'center' }]}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>{donor.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{donor.name}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{donor.frequency}</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{donor.amount}</Text>
            </View>
          ))}
        </View>

        {/* ── ALERTS ── */}
        <View style={{ marginBottom: 28 }}>
          <SH title="Alerts" C={C} />
          {ALERTS.map((alert, i) => {
            const color = alert.severity === 'heat' ? HEAT : CAUTION;
            return (
              <View key={i} style={{ backgroundColor: color + '18', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color={color} />
                <Text style={{ flex: 1, fontSize: 13, color: color, fontWeight: '600', lineHeight: 18 }}>{alert.text}</Text>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1 },
  topBar:    { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  card:      { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 },
});
