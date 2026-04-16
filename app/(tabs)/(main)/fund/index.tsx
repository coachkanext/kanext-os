/**
 * Fund Dashboard — President only.
 * Institutional fundraising health: total raised, revenue by source,
 * fund breakdown, monthly trend chart, recent gifts, alerts.
 * Student → redirect to scholarships.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOTAL_RAISED = 1_240_000;
const TOTAL_GOAL   = 2_000_000;
const LAST_YEAR    = 890_000;
const GOAL_PCT     = Math.round((TOTAL_RAISED / TOTAL_GOAL) * 100);
const YOY_DELTA    = Math.round(((TOTAL_RAISED - LAST_YEAR) / LAST_YEAR) * 100);

const SOURCES = [
  { label: 'Alumni Giving',          amount: 420_000 },
  { label: 'Foundation Grants',      amount: 255_000 },
  { label: 'Individual Donors',      amount: 198_000 },
  { label: 'Corporate Sponsorships', amount: 185_000 },
  { label: 'Endowment Income',       amount: 142_000 },
  { label: 'Events',                 amount:  40_000 },
];

const NAMED_FUNDS = [
  { name: 'General Fund',             balance: 380_000, goal: 600_000, restricted: false },
  { name: 'Scholarship Fund',         balance: 295_000, goal: 500_000, restricted: true  },
  { name: 'Building / Capital Fund',  balance: 180_000, goal: 400_000, restricted: false },
  { name: 'Athletics Fund',           balance: 245_000, goal: 350_000, restricted: false },
  { name: 'Diagnostic Imaging Fund',  balance: 140_000, goal: 150_000, restricted: true  },
];

const MONTHLY = [
  { m: 'Oct', v: 68 }, { m: 'Nov', v: 145 }, { m: 'Dec', v: 210 },
  { m: 'Jan', v: 85 }, { m: 'Feb', v: 78  }, { m: 'Mar', v: 98  },
  { m: 'Apr', v: 116 },
];

const RECENT_GIFTS = [
  { name: 'Oakland Community Foundation', amount: 25_000, fund: 'General Fund',         date: 'Apr 12' },
  { name: 'Dr. Theodore Brodsky',         amount: 10_000, fund: 'Athletic Scholarship', date: 'Apr 15' },
  { name: 'BioMedical Tech Solutions',    amount:  8_500, fund: 'Diagnostic Imaging',   date: 'Apr 10' },
  { name: 'Patricia Hayes',               amount:  5_000, fund: 'Scholarship Fund',     date: 'Apr 5'  },
  { name: 'East Bay Commerce Group',      amount:  3_000, fund: 'Athletics Fund',       date: 'Apr 3'  },
  { name: 'DeShawn Coleman',              amount:  1_000, fund: 'General Fund',         date: 'Apr 1'  },
  { name: 'Anonymous',                    amount:    500, fund: 'Scholarship Fund',     date: 'Apr 9'  },
  { name: 'Laolu Kalejaiye',              amount:    250, fund: 'General Fund',         date: 'Apr 8'  },
  { name: 'Marcus Webb',                  amount:    500, fund: 'Scholarship Fund',     date: 'Mar 28' },
  { name: 'Linda Richardson',             amount:  1_500, fund: 'General Fund',         date: 'Mar 25' },
];

const ALERTS = [
  { icon: 'exclamationmark.triangle.fill', color: CAUTION, text: 'Diagnostic Imaging Lab campaign at 38% — deadline Jun 1' },
  { icon: 'person.fill.xmark',             color: HEAT,    text: 'Major donor Patricia Hayes lapsed since Jan 2026' },
  { icon: 'calendar.badge.clock',          color: CAUTION, text: 'Oakland STEM Initiative grant report due May 1' },
  { icon: 'banknote',                      color: GAIN,    text: 'Endowment distribution of $142K scheduled May 15' },
];

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n}`;

function Bar({ pct, color, C }: { pct: number; color: string; C: ComponentColors }) {
  return (
    <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ height: 4, width: `${Math.min(100, pct)}%` as any, backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

export default function FundDashboardScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:fund');
  const isPresident = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPresident) router.replace('/(tabs)/(main)/fund/scholarships' as any);
  }, [isPresident, router]));

  if (!isPresident) return null;

  const chartMax = Math.max(...MONTHLY.map(d => d.v));

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Fund Dashboard</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={true} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <View style={[s.heroCard, { backgroundColor: C.label }]}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.bg + 'BB', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>2025–26 Total Raised</Text>
            <Text style={{ fontSize: 44, fontWeight: '900', color: C.bg, letterSpacing: -1.5, lineHeight: 50 }}>$1.24M</Text>
            <View style={{ height: 4, backgroundColor: C.bg + '30', borderRadius: 2, marginVertical: 16, overflow: 'hidden' }}>
              <View style={{ height: 4, width: `${GOAL_PCT}%` as any, backgroundColor: C.bg, borderRadius: 2 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 11, color: C.bg + 'AA', marginBottom: 2 }}>Annual Goal</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>{fmt(TOTAL_GOAL)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: C.bg + 'AA', marginBottom: 2 }}>Progress</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>{GOAL_PCT}%</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, color: C.bg + 'AA', marginBottom: 2 }}>vs Last Year</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: GAIN }}>+{YOY_DELTA}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Alerts ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Alerts</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {ALERTS.map((a, idx) => (
              <Pressable
                key={idx}
                style={[s.row, idx < ALERTS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name={a.icon as any} size={16} color={a.color} style={{ flexShrink: 0 }} />
                <Text style={{ flex: 1, fontSize: 13, color: C.label, lineHeight: 18 }}>{a.text}</Text>
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Revenue by Source ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Revenue by Source</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {SOURCES.map((src, idx) => {
              const pct = Math.round((src.amount / TOTAL_RAISED) * 100);
              return (
                <View key={src.label} style={[{ padding: 14, gap: 6 },
                  idx < SOURCES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{src.label}</Text>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{pct}%</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, minWidth: 56, textAlign: 'right' }}>{fmt(src.amount)}</Text>
                    </View>
                  </View>
                  <Bar pct={pct * 3} color={C.label} C={C} />
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Fund Breakdown ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Fund Breakdown</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {NAMED_FUNDS.map((fund, idx) => {
              const pct = Math.round((fund.balance / fund.goal) * 100);
              return (
                <View key={fund.name} style={[{ padding: 14, gap: 6 },
                  idx < NAMED_FUNDS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{fund.name}</Text>
                      {fund.restricted && (
                        <View style={[s.badge, { borderColor: CAUTION }]}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: CAUTION }}>RESTRICTED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{fmt(fund.balance)}</Text>
                  </View>
                  <Bar pct={pct} color={fund.restricted ? CAUTION : GAIN} C={C} />
                  <Text style={{ fontSize: 11, color: C.secondary }}>{pct}% of {fmt(fund.goal)} goal</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Monthly Trend ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Monthly Giving — FY 2025–26</Text>
          <View style={[s.card, { backgroundColor: C.surface, padding: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 72, marginBottom: 4 }}>
              {MONTHLY.map(d => (
                <View key={d.m} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <View style={{
                    width: '100%',
                    height: Math.max(4, Math.round((d.v / chartMax) * 56)),
                    backgroundColor: d.m === 'Apr' ? C.secondary : C.label,
                    borderRadius: 3,
                  }} />
                  <Text style={{ fontSize: 9, color: C.secondary }}>{d.m}</Text>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 11, color: C.secondary }}>Apr is partial (through Apr 16) · Values in $K</Text>
          </View>
        </View>

        {/* ── Recent Gifts ── */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Recent Gifts</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {RECENT_GIFTS.map((g, idx) => (
              <Pressable
                key={idx}
                style={[s.row, idx < RECENT_GIFTS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                onPress={() => Alert.alert(g.name, `Amount: ${fmt(g.amount)}\nFund: ${g.fund}\nDate: ${g.date}`)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{g.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{g.fund} · {g.date}</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{fmt(g.amount)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:   { borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 11, fontWeight: '700' },
  sectionLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:        { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:   { borderBottomWidth: StyleSheet.hairlineWidth },
  heroCard:    { borderRadius: 16, padding: 20 },
  badge:       { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
});
