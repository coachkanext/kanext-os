/**
 * Giving Dashboard — Pastor only.
 * Redirects Member to give/index in useFocusEffect.
 * Shows YTD totals, fund breakdown, campaign performance, trend, recent gifts.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useScrollHeader } from '@/hooks/use-scroll-header';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN = '#5A8A6E';
const TOP_BAR_H = 52;

const FUND_BREAKDOWN = [
  { name: 'General / Tithe', pct: 58 },
  { name: 'Building Fund',   pct: 24 },
  { name: 'Missions',        pct: 11 },
  { name: 'Special Needs',   pct: 7  },
];

const ACTIVE_CAMPAIGNS = [
  { name: 'Annual Fund',      raised: 91200,  goal: 125000, pct: 73 },
  { name: 'Capital Campaign', raised: 68000,  goal: 165000, pct: 41 },
  { name: 'Missions Fund',    raised: 41300,  goal: 60000,  pct: 69 },
];

const TREND_MONTHS = [
  { month: 'Nov', rel: 0.65 },
  { month: 'Dec', rel: 1.00 },
  { month: 'Jan', rel: 0.72 },
  { month: 'Feb', rel: 0.78 },
  { month: 'Mar', rel: 0.88 },
  { month: 'Apr', rel: 0.56 },
];

const RECENT_GIFTS = [
  { name: 'Marcus Johnson',  amount: 500,  fund: 'General / Tithe', date: 'Apr 9' },
  { name: 'Aisha Williams',  amount: 250,  fund: 'Building Fund',   date: 'Apr 9' },
  { name: 'David Chen',      amount: 1000, fund: 'Missions',        date: 'Apr 8' },
  { name: 'Sarah Thompson',  amount: 150,  fund: 'General / Tithe', date: 'Apr 8' },
  { name: 'James Okafor',    amount: 75,   fund: 'Special Needs',   date: 'Apr 7' },
];

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

export default function GivingDashboardScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/give' as any);
    }
  }, [isPastor]));

  const BAR_MAX = 160;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Giving Dashboard</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Giving YTD */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.cardLabel, { color: C.secondary }]}>Total Giving YTD</Text>
          <Text style={[s.ytdAmount, { color: C.label }]}>$287,400</Text>
          <Text style={[s.budgetLabel, { color: C.secondary }]}>82% toward $350K annual budget</Text>
          <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
            <View style={[s.progressFill, { backgroundColor: C.label, width: '82%' }]} />
          </View>
          <View style={s.statsRow}>
            <View style={s.statCell}>
              <Text style={[s.statValue, { color: C.label }]}>$28.4K</Text>
              <Text style={[s.statSub, { color: C.secondary }]}>This Month</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.separator }]} />
            <View style={s.statCell}>
              <Text style={[s.statValue, { color: C.label }]}>234</Text>
              <Text style={[s.statSub, { color: C.secondary }]}>Givers</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.separator }]} />
            <View style={s.statCell}>
              <Text style={[s.statValue, { color: C.label }]}>$121</Text>
              <Text style={[s.statSub, { color: C.secondary }]}>Avg Gift</Text>
            </View>
          </View>
        </View>

        {/* Fund Breakdown */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Fund Breakdown</Text>
          <Text style={[s.cardSub, { color: C.secondary }]}>Restricted vs Unrestricted</Text>
          {FUND_BREAKDOWN.map((f, i) => (
            <View key={f.name} style={[s.fundRow, i < FUND_BREAKDOWN.length - 1 && { marginBottom: 12 }]}>
              <View style={s.fundMeta}>
                <Text style={[s.fundName, { color: C.label }]}>{f.name}</Text>
                <Text style={[s.fundPct, { color: C.secondary }]}>{f.pct}%</Text>
              </View>
              <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                <View style={[s.progressFill, { backgroundColor: C.label, width: `${f.pct}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Campaign Performance */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Campaign Performance</Text>
          {ACTIVE_CAMPAIGNS.map((c, i) => (
            <View key={c.name} style={[s.campaignRow, i < ACTIVE_CAMPAIGNS.length - 1 && { marginBottom: 14 }]}>
              <View style={s.campaignMeta}>
                <Text style={[s.campaignName, { color: C.label }]}>{c.name}</Text>
                <Text style={[s.campaignPct, { color: C.secondary }]}>{c.pct}% · {fmt(c.raised)} / {fmt(c.goal)}</Text>
              </View>
              <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                <View style={[s.progressFill, { backgroundColor: C.label, width: `${c.pct}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Giving Trend */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Giving Trend</Text>
          <View style={s.trendChart}>
            {TREND_MONTHS.map(m => (
              <View key={m.month} style={s.trendBarWrap}>
                <View
                  style={[
                    s.trendBar,
                    { backgroundColor: C.label, height: Math.round(m.rel * BAR_MAX) },
                  ]}
                />
                <Text style={[s.trendLabel, { color: C.secondary }]}>{m.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Gifts */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Recent Gifts</Text>
          {RECENT_GIFTS.map((g, i) => (
            <View
              key={g.name}
              style={[
                s.giftRow,
                i < RECENT_GIFTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.giftName, { color: C.label }]}>{g.name}</Text>
                <Text style={[s.giftFund, { color: C.secondary }]}>{g.fund} · {g.date}</Text>
              </View>
              <Text style={[s.giftAmount, { color: GAIN }]}>${g.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    card:        { borderRadius: 12, padding: 16, gap: 4 },
    cardLabel:   { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
    cardSub:     { fontSize: 13, marginBottom: 8 },
    sectionTitle:{ fontSize: 15, fontWeight: '700', marginBottom: 8 },

    ytdAmount:   { fontSize: 36, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
    budgetLabel: { fontSize: 13, marginBottom: 8 },

    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
    progressFill:  { height: 6, borderRadius: 3 },

    statsRow:   { flexDirection: 'row', marginTop: 12 },
    statCell:   { flex: 1, alignItems: 'center' },
    statValue:  { fontSize: 17, fontWeight: '700' },
    statSub:    { fontSize: 11, marginTop: 2 },
    statDivider:{ width: StyleSheet.hairlineWidth, marginVertical: 4 },

    fundRow:  { gap: 4 },
    fundMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    fundName: { fontSize: 13, fontWeight: '500' },
    fundPct:  { fontSize: 13 },

    campaignRow:  { gap: 4 },
    campaignMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    campaignName: { fontSize: 13, fontWeight: '600' },
    campaignPct:  { fontSize: 12 },

    trendChart:   { flexDirection: 'row', alignItems: 'flex-end', height: 180, gap: 8, paddingTop: 8 },
    trendBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
    trendBar:     { width: '100%', borderRadius: 3, minHeight: 4 },
    trendLabel:   { fontSize: 10 },

    giftRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
    giftName:   { fontSize: 14, fontWeight: '500' },
    giftFund:   { fontSize: 12, marginTop: 1 },
    giftAmount: { fontSize: 15, fontWeight: '700' },
  });
}
