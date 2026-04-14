/**
 * Community Give — role-aware entry screen.
 * Pastor view: Giving Dashboard inline (YTD, fund breakdown, campaigns, trend, recent gifts).
 * Member view: Give Now form (amount input, fund pills, frequency, Give button) + recurring + pledges + YTD.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useScrollHeader } from '@/hooks/use-scroll-header';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';

const TOP_BAR_H = 52;

// ── Mock data ──────────────────────────────────────────────────────────────────

const PRESET_AMOUNTS = ['$25', '$50', '$100', '$250', '$500'];
const FUNDS = ['General / Tithe', 'Building Fund', 'Missions', 'Special Needs'];
const FREQUENCIES = ['One-Time', 'Weekly', 'Monthly'];

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
  { name: 'Aisha Williams',  amount: 250,  fund: 'Building Fund',    date: 'Apr 9' },
  { name: 'David Chen',      amount: 1000, fund: 'Missions',         date: 'Apr 8' },
  { name: 'Sarah Thompson',  amount: 150,  fund: 'General / Tithe', date: 'Apr 8' },
  { name: 'James Okafor',    amount: 75,   fund: 'Special Needs',    date: 'Apr 7' },
];

const MY_RECURRING = [
  { amount: 200, fund: 'General / Tithe', freq: 'Monthly',  next: 'May 1, 2026' },
  { amount: 50,  fund: 'Missions',        freq: 'Monthly',  next: 'May 1, 2026' },
];

const MY_PLEDGES_DATA = [
  { name: 'Capital Campaign', pledged: 2400, fulfilled: 1200, pct: 50 },
  { name: 'Annual Fund',      pledged: 600,  fulfilled: 438,  pct: 73 },
];

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

// ── Pastor Dashboard ───────────────────────────────────────────────────────────

function PastorDashboard({ C, s }: { C: any; s: any }) {
  const BAR_MAX = 160;
  return (
    <>
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
    </>
  );
}

// ── Member Give View ───────────────────────────────────────────────────────────

function MemberGiveView({ C, s }: { C: any; s: any }) {
  const [selectedAmount, setSelectedAmount] = useState('$50');
  const [selectedFund,   setSelectedFund]   = useState('General / Tithe');
  const [selectedFreq,   setSelectedFreq]   = useState('Monthly');

  return (
    <>
      {/* Give Now card */}
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <Text style={[s.giveAmountDisplay, { color: C.label }]}>$0.00</Text>
        <Text style={[s.cardSub, { color: C.secondary, textAlign: 'center', marginBottom: 16 }]}>
          Tap a preset or enter your amount
        </Text>

        {/* Preset amounts */}
        <View style={s.presetRow}>
          {PRESET_AMOUNTS.map(amt => (
            <Pressable
              key={amt}
              onPress={() => { Haptics.selectionAsync(); setSelectedAmount(amt); }}
              style={[
                s.presetPill,
                {
                  backgroundColor: selectedAmount === amt ? C.label : C.bg,
                  borderColor: selectedAmount === amt ? C.label : C.separator,
                },
              ]}
            >
              <Text style={[s.presetText, { color: selectedAmount === amt ? C.bg : C.secondary }]}>
                {amt}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Fund selector */}
        <Text style={[s.inputLabel, { color: C.secondary }]}>Fund</Text>
        <View style={s.pillWrap}>
          {FUNDS.map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setSelectedFund(f); }}
              style={[
                s.filterPill,
                {
                  backgroundColor: selectedFund === f ? C.label : C.bg,
                  borderColor: selectedFund === f ? C.label : C.separator,
                },
              ]}
            >
              <Text style={[s.filterPillText, { color: selectedFund === f ? C.bg : C.secondary }]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Frequency selector */}
        <Text style={[s.inputLabel, { color: C.secondary }]}>Frequency</Text>
        <View style={[s.pillWrap, { flexDirection: 'row' }]}>
          {FREQUENCIES.map(freq => (
            <Pressable
              key={freq}
              onPress={() => { Haptics.selectionAsync(); setSelectedFreq(freq); }}
              style={[
                s.freqPill,
                {
                  backgroundColor: selectedFreq === freq ? C.label : C.bg,
                  borderColor: selectedFreq === freq ? C.label : C.separator,
                },
              ]}
            >
              <Text style={[s.filterPillText, { color: selectedFreq === freq ? C.bg : C.secondary }]}>
                {freq}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Give button */}
        <Pressable
          style={[s.giveBtn, { backgroundColor: C.label }]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Gift Submitted', `${selectedAmount} to ${selectedFund} (${selectedFreq}) — thank you!`);
          }}
        >
          <Text style={[s.giveBtnText, { color: C.bg }]}>Give</Text>
        </Pressable>
      </View>

      {/* My Recurring */}
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <Text style={[s.sectionTitle, { color: C.label }]}>My Recurring</Text>
        {MY_RECURRING.map((r, i) => (
          <View
            key={i}
            style={[
              s.recurringRow,
              i < MY_RECURRING.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[s.giftName, { color: C.label }]}>${r.amount} / {r.freq.toLowerCase()} — {r.fund}</Text>
              <Text style={[s.giftFund, { color: C.secondary }]}>Next: {r.next}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: GAIN + '22', borderColor: GAIN + '44' }]}>
              <Text style={[s.statusText, { color: GAIN }]}>Active</Text>
            </View>
          </View>
        ))}
      </View>

      {/* My Pledges */}
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <Text style={[s.sectionTitle, { color: C.label }]}>My Pledges</Text>
        {MY_PLEDGES_DATA.map((p, i) => (
          <View
            key={p.name}
            style={[i < MY_PLEDGES_DATA.length - 1 && { marginBottom: 14 }]}
          >
            <View style={s.campaignMeta}>
              <Text style={[s.campaignName, { color: C.label }]}>{p.name}</Text>
              <Text style={[s.campaignPct, { color: C.secondary }]}>{p.pct}% · ${p.fulfilled.toLocaleString()} / ${p.pledged.toLocaleString()}</Text>
            </View>
            <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
              <View style={[s.progressFill, { backgroundColor: GAIN, width: `${p.pct}%` }]} />
            </View>
          </View>
        ))}
      </View>

      {/* YTD Summary */}
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <Text style={[s.sectionTitle, { color: C.label }]}>YTD Summary</Text>
        <View style={s.statsRow}>
          <View style={s.statCell}>
            <Text style={[s.statValue, { color: GAIN }]}>$2,850</Text>
            <Text style={[s.statSub, { color: C.secondary }]}>Total Given</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: C.separator }]} />
          <View style={s.statCell}>
            <Text style={[s.statValue, { color: C.label }]}>2</Text>
            <Text style={[s.statSub, { color: C.secondary }]}>Recurring</Text>
          </View>
        </View>
      </View>
    </>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function CommunityGiveScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>{isPastor ? 'Giving Dashboard' : 'Give'}</Text>
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
        {isPastor
          ? <PastorDashboard C={C} s={s} />
          : <MemberGiveView C={C} s={s} />
        }
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

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
    kBtn:        { width: 44, height: 36, justifyContent: 'center' },
    titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:   { fontSize: 13, fontWeight: '700' },
    rolePillWrap:{ width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    // Card
    card:        { borderRadius: 12, padding: 16, gap: 4 },
    cardLabel:   { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
    cardSub:     { fontSize: 13 },
    sectionTitle:{ fontSize: 15, fontWeight: '700', marginBottom: 8 },

    // YTD
    ytdAmount:   { fontSize: 36, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
    budgetLabel: { fontSize: 13, marginBottom: 8 },

    // Progress
    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
    progressFill:  { height: 6, borderRadius: 3 },

    // Stats row
    statsRow:   { flexDirection: 'row', marginTop: 12 },
    statCell:   { flex: 1, alignItems: 'center' },
    statValue:  { fontSize: 17, fontWeight: '700' },
    statSub:    { fontSize: 11, marginTop: 2 },
    statDivider:{ width: StyleSheet.hairlineWidth, marginVertical: 4 },

    // Fund breakdown
    fundRow:  { gap: 4 },
    fundMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    fundName: { fontSize: 13, fontWeight: '500' },
    fundPct:  { fontSize: 13 },

    // Campaigns
    campaignRow:  { gap: 4 },
    campaignMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    campaignName: { fontSize: 13, fontWeight: '600' },
    campaignPct:  { fontSize: 12 },

    // Trend chart
    trendChart:   { flexDirection: 'row', alignItems: 'flex-end', height: 180, gap: 8, paddingTop: 8 },
    trendBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
    trendBar:     { width: '100%', borderRadius: 3, minHeight: 4 },
    trendLabel:   { fontSize: 10 },

    // Recent gifts
    giftRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
    giftName:   { fontSize: 14, fontWeight: '500' },
    giftFund:   { fontSize: 12, marginTop: 1 },
    giftAmount: { fontSize: 15, fontWeight: '700' },

    // Member give form
    giveAmountDisplay: { fontSize: 44, fontWeight: '800', textAlign: 'center', letterSpacing: -1, marginBottom: 4 },
    presetRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    presetPill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
    presetText: { fontSize: 14, fontWeight: '600' },
    inputLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
    pillWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    filterPill: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
    freqPill:   { flex: 1, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
    filterPillText: { fontSize: 13, fontWeight: '500' },
    giveBtn:    { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    giveBtnText:{ fontSize: 16, fontWeight: '700' },

    // Recurring
    recurringRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
    statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
    statusText:  { fontSize: 11, fontWeight: '600' },
  });
}
