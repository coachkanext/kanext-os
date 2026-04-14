/**
 * Earnings — Personal Mode Owner earnings management screen.
 * Displays earnings summary, revenue by source, trend chart,
 * recent transactions, payouts, and tax summary.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 44;

const REVENUE_SOURCES = [
  { id: 'subs',     name: 'Subscriptions',    pct: 43, amount: 2470, color: '#5A8A6E',
    items: [{ name: 'Free tier', amount: 0 }, { name: 'Supporter (197×$10)', amount: 1970 }, { name: 'Inner Circle (50×$25)', amount: 1250 }] },
  { id: 'digital',  name: 'Digital Products', pct: 19, amount: 1100, color: '#B8943E',
    items: [{ name: 'Recruiting Guide PDF', amount: 640 }, { name: 'Athlete Brand Blueprint', amount: 460 }] },
  { id: 'deals',    name: 'Brand Deals',      pct: 16, amount: 920,  color: '#1A1714',
    items: [{ name: 'Nike partnership Q1', amount: 920 }] },
  { id: 'services', name: 'Services',         pct: 10, amount: 580,  color: '#9C9790',
    items: [{ name: '1-on-1 Coaching (4×$145)', amount: 580 }] },
  { id: 'courses',  name: 'Courses',          pct: 6,  amount: 340,  color: '#C4B8A8',
    items: [{ name: 'Speed & Agility Program', amount: 340 }] },
  { id: 'affiliate',name: 'Affiliate',        pct: 4,  amount: 230,  color: '#D4C9BC',
    items: [{ name: 'Training equipment links', amount: 230 }] },
  { id: 'tips',     name: 'Tips',             pct: 2,  amount: 120,  color: '#E0DBD4',
    items: [{ name: 'Community tips', amount: 120 }] },
];

const MONTHLY = [
  { month: 'Jan', amount: 2800 },
  { month: 'Feb', amount: 3100 },
  { month: 'Mar', amount: 3750 },
  { month: 'Apr', amount: 3400 },
];

const TRANSACTIONS = [
  { id: 't1',  icon: 'star.fill',          desc: 'Jordan W. renewed Inner Circle',      amount: 25,  time: '2h ago'  },
  { id: 't2',  icon: 'star.fill',          desc: 'Devon C. renewed Inner Circle',       amount: 25,  time: '5h ago'  },
  { id: 't3',  icon: 'cart.fill',          desc: 'Recruiting Guide PDF sale',           amount: 40,  time: '1d ago'  },
  { id: 't4',  icon: 'star.fill',          desc: 'Tyler B. subscribed to Supporter',    amount: 10,  time: '1d ago'  },
  { id: 't5',  icon: 'dollarsign',         desc: 'Tip from community member',           amount: 20,  time: '2d ago'  },
  { id: 't6',  icon: 'cart.fill',          desc: 'Athlete Brand Blueprint course sale', amount: 120, time: '2d ago'  },
  { id: 't7',  icon: 'star.fill',          desc: 'Nia T. renewed Supporter',            amount: 10,  time: '3d ago'  },
  { id: 't8',  icon: 'graduationcap.fill', desc: 'Speed & Agility enrollment',          amount: 85,  time: '3d ago'  },
  { id: 't9',  icon: 'cart.fill',          desc: 'Recruiting Guide PDF sale',           amount: 40,  time: '4d ago'  },
  { id: 't10', icon: 'handshake',          desc: 'Nike Q1 partnership payment',         amount: 920, time: '5d ago'  },
];

const PAYOUTS = [
  { id: 'p1', date: 'Apr 1, 2024', amount: 2800, status: 'Completed', bank: 'Chase ••4521' },
  { id: 'p2', date: 'Mar 1, 2024', amount: 3100, status: 'Completed', bank: 'Chase ••4521' },
  { id: 'p3', date: 'Feb 1, 2024', amount: 2100, status: 'Completed', bank: 'Chase ••4521' },
  { id: 'p4', date: 'Jan 1, 2024', amount: 1850, status: 'Completed', bank: 'Chase ••4521' },
];

function fmtMoney(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtMoneyDecimals(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function statusColor(status: string): string {
  if (status === 'Completed') return GAIN;
  if (status === 'Processing') return CAUTION;
  if (status === 'Failed') return HEAT;
  return '#9C9790';
}

export default function EarningsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const scrollRef   = useRef<ScrollView>(null);
  const payoutsY    = useRef(0);

  const [expandedRevSource, setExpandedRevSource] = useState<string | null>(null);
  const [tooltipBarIdx,     setTooltipBarIdx]     = useState<number | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (section !== 'payouts') return;
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: payoutsY.current, animated: true });
    }, 350);
    return () => clearTimeout(t);
  }, [section]);

  const maxMonthly = useMemo(() => Math.max(...MONTHLY.map(m => m.amount)), []);

  function toggleRevSource(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedRevSource(prev => (prev === id ? null : id));
  }

  function tapBar(idx: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTooltipBarIdx(prev => (prev === idx ? null : idx));
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8} style={s.topBarBtn}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.topBarPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.topBarPillText, { color: C.label }]}>Earnings</Text>
            </View>
          </View>
          <View style={s.topBarBtn} />
        </View>
      </Animated.View>
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={s.scroll}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Summary Card */}
        <GlassView tier={1} style={s.summaryCard}>
          <View style={s.summaryHeroRow}>
            <Text style={[s.summaryHeroAmount, { color: C.label }]}>$3,400</Text>
            <View style={s.gainBadge}>
              <Text style={s.gainBadgeText}>+12.4%</Text>
            </View>
          </View>
          <Text style={[s.summarySubtitle, { color: C.secondary }]}>this month</Text>
          <View style={s.summaryMetricsRow}>
            {[
              { label: 'This Week',  value: '$820'    },
              { label: 'This Month', value: '$3,400'  },
              { label: 'This Year',  value: '$22,600' },
            ].map((m, i) => (
              <View key={i} style={s.summaryMetric}>
                <Text style={[s.summaryMetricValue, { color: C.label }]}>{m.value}</Text>
                <Text style={[s.summaryMetricLabel, { color: C.secondary }]}>{m.label}</Text>
              </View>
            ))}
          </View>
        </GlassView>

        {/* 2. Revenue by Source */}
        <View style={s.section}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Revenue by Source</Text>
          <View style={[s.stackedBar, { backgroundColor: C.separator }]}>
            {REVENUE_SOURCES.map(src => (
              <View key={src.id} style={{ flex: src.pct, backgroundColor: src.color }} />
            ))}
          </View>
          <GlassView tier={1} style={s.sourceList}>
            {REVENUE_SOURCES.map((src, i) => (
              <View key={src.id}>
                {i > 0 && <View style={[s.divider, { backgroundColor: C.separator }]} />}
                <Pressable onPress={() => toggleRevSource(src.id)} style={s.sourceRow}>
                  <View style={[s.sourceDot, { backgroundColor: src.color }]} />
                  <Text style={[s.sourceName, { color: C.label }]} numberOfLines={1}>{src.name}</Text>
                  <Text style={[s.sourcePct, { color: C.secondary }]}>{src.pct}%</Text>
                  <Text style={[s.sourceAmount, { color: C.label }]}>{fmtMoney(src.amount)}</Text>
                </Pressable>
                {expandedRevSource === src.id && src.items.map((item, j) => (
                  <View key={j} style={[s.subRow, { borderTopColor: C.separator }]}>
                    <View style={s.subRowIndent} />
                    <Text style={[s.subRowName, { color: C.secondary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[s.subRowAmount, { color: C.label }]}>
                      {item.amount === 0 ? '—' : fmtMoney(item.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </GlassView>
        </View>

        {/* 3. Earnings Trend Chart */}
        <View style={s.section}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Earnings Trend</Text>
          <GlassView tier={1} style={s.chartCard}>
            <View style={s.chartBarsRow}>
              {MONTHLY.map((m, idx) => {
                const barH     = Math.round((m.amount / maxMonthly) * 100);
                const isActive = tooltipBarIdx === idx;
                return (
                  <Pressable key={m.month} style={s.chartBarWrapper} onPress={() => tapBar(idx)}>
                    {isActive && (
                      <View style={[s.tooltip, { backgroundColor: C.label }]}>
                        <Text style={[s.tooltipText, { color: C.bg }]}>{fmtMoney(m.amount)}</Text>
                      </View>
                    )}
                    <View style={s.chartBarContainer}>
                      <View style={[s.chartBar, { height: barH, backgroundColor: C.label, opacity: isActive ? 1 : 0.72 }]} />
                    </View>
                    <Text style={[s.chartMonthLabel, { color: C.secondary }]}>{m.month}</Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassView>
        </View>

        {/* 4. Recent Transactions */}
        <View style={s.section}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Recent Transactions</Text>
          <GlassView tier={1} style={s.txList}>
            {TRANSACTIONS.map((tx, i) => (
              <View key={tx.id}>
                {i > 0 && <View style={[s.divider, { backgroundColor: C.separator }]} />}
                <Pressable
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  style={s.txRow}
                >
                  <View style={[s.txIconCircle, { backgroundColor: C.bg }]}>
                    <IconSymbol name={tx.icon as any} size={16} color={C.label} />
                  </View>
                  <View style={s.txInfo}>
                    <Text style={[s.txDesc, { color: C.label }]} numberOfLines={1}>{tx.desc}</Text>
                    <Text style={[s.txTime, { color: C.secondary }]}>{tx.time}</Text>
                  </View>
                  <Text style={[s.txAmount, { color: GAIN }]}>+{fmtMoneyDecimals(tx.amount)}</Text>
                </Pressable>
              </View>
            ))}
          </GlassView>
        </View>

        {/* 5. Payouts */}
        <View style={s.section} onLayout={e => { payoutsY.current = e.nativeEvent.layout.y; }}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Payouts</Text>
          <GlassView tier={1} style={s.payoutBalanceCard}>
            <View style={s.payoutBalanceRow}>
              <Text style={[s.payoutBalanceAmount, { color: C.label }]}>$340.00</Text>
              <Text style={[s.payoutBalanceLabel, { color: C.secondary }]}> available</Text>
            </View>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={[s.cashOutBtn, { backgroundColor: C.label }]}
            >
              <Text style={[s.cashOutBtnText, { color: C.bg }]}>Cash Out</Text>
            </Pressable>
            <Text style={[s.payoutNextText, { color: C.secondary }]}>
              Next payout: Apr 15 · $340.00 (auto)
            </Text>
          </GlassView>

          <GlassView tier={1} style={[s.payoutHistoryList, { marginTop: 12 }]}>
            <Text style={[s.payoutHistoryHeader, { color: C.secondary }]}>Payout History</Text>
            {PAYOUTS.map((p, i) => (
              <View key={p.id}>
                {i > 0 && <View style={[s.divider, { backgroundColor: C.separator }]} />}
                <View style={s.payoutRow}>
                  <Text style={[s.payoutDate, { color: C.secondary }]}>{p.date}</Text>
                  <Text style={[s.payoutAmount, { color: C.label }]}>{fmtMoney(p.amount)}</Text>
                  <View style={[s.statusPill, { backgroundColor: statusColor(p.status) + '22', borderColor: statusColor(p.status) + '44' }]}>
                    <Text style={[s.statusPillText, { color: statusColor(p.status) }]}>{p.status}</Text>
                  </View>
                  <Text style={[s.payoutBank, { color: C.secondary }]}>{p.bank}</Text>
                </View>
              </View>
            ))}
          </GlassView>
        </View>

        {/* 6. Tax Summary */}
        <View style={[s.section, { marginBottom: 8 }]}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Tax</Text>
          <GlassView tier={1} style={s.taxCard}>
            <Text style={[s.taxYtdLabel, { color: C.secondary }]}>Year-to-date earnings</Text>
            <Text style={[s.taxYtdAmount, { color: C.label }]}>$22,600</Text>
            <View style={s.taxEstRow}>
              <Text style={[s.taxEstLabel, { color: C.secondary }]}>Est. quarterly tax (24% bracket):</Text>
              <Text style={[s.taxEstValue, { color: CAUTION }]}> $5,424</Text>
            </View>
            <Text style={[s.taxDueText, { color: C.secondary }]}>Next estimated tax due: Jun 15, 2024</Text>
            <View style={s.taxButtonRow}>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={[s.taxBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
              >
                <Text style={[s.taxBtnText, { color: C.label }]}>Download 1099</Text>
              </Pressable>
              <Pressable
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={[s.taxBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
              >
                <Text style={[s.taxBtnText, { color: C.label }]}>Export for Accountant</Text>
              </Pressable>
            </View>
          </GlassView>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16,
    },
    topBarBtn:           { width: 36, height: TOP_BAR_H, justifyContent: 'center' },
    topBarPill:          { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    topBarPillText:      { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    scroll:              { flex: 1 },
    divider:             { height: StyleSheet.hairlineWidth },
    section:             { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader:       { fontSize: 17, fontWeight: '800', marginBottom: 12 },
    summaryCard:         { marginHorizontal: 16, marginTop: 16, padding: 16 },
    summaryHeroRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
    summaryHeroAmount:   { fontSize: 36, fontWeight: '800' },
    gainBadge:           { backgroundColor: GAIN, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
    gainBadgeText:       { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    summarySubtitle:     { fontSize: 13, marginTop: 2, marginBottom: 16 },
    summaryMetricsRow:   { flexDirection: 'row' },
    summaryMetric:       { flex: 1, alignItems: 'center' },
    summaryMetricValue:  { fontSize: 17, fontWeight: '700' },
    summaryMetricLabel:  { fontSize: 11, marginTop: 2 },
    stackedBar:          { height: 12, borderRadius: 6, overflow: 'hidden', flexDirection: 'row', marginBottom: 16 },
    sourceList:          { overflow: 'hidden' },
    sourceRow:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
    sourceDot:           { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    sourceName:          { flex: 1, fontSize: 15, fontWeight: '600' },
    sourcePct:           { fontSize: 13, marginRight: 12 },
    sourceAmount:        { fontSize: 15, fontWeight: '700', minWidth: 60, textAlign: 'right' },
    subRow:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
    subRowIndent:        { width: 30 },
    subRowName:          { flex: 1, fontSize: 13 },
    subRowAmount:        { fontSize: 13, fontWeight: '600', minWidth: 60, textAlign: 'right' },
    chartCard:           { padding: 16 },
    chartBarsRow:        { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
    chartBarWrapper:     { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
    tooltip:             { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, marginBottom: 4 },
    tooltipText:         { fontSize: 11, fontWeight: '700' },
    chartBarContainer:   { width: '100%', height: 100, justifyContent: 'flex-end' },
    chartBar:            { width: '100%', borderRadius: 4, minHeight: 4 },
    chartMonthLabel:     { fontSize: 12, marginTop: 6 },
    txList:              { overflow: 'hidden' },
    txRow:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
    txIconCircle:        { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    txInfo:              { flex: 1, marginRight: 8 },
    txDesc:              { fontSize: 14, fontWeight: '500' },
    txTime:              { fontSize: 12, marginTop: 2 },
    txAmount:            { fontSize: 15, fontWeight: '700' },
    payoutBalanceCard:   { padding: 16 },
    payoutBalanceRow:    { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
    payoutBalanceAmount: { fontSize: 28, fontWeight: '800' },
    payoutBalanceLabel:  { fontSize: 14 },
    cashOutBtn:          { width: '100%', height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    cashOutBtnText:      { fontSize: 16, fontWeight: '700' },
    payoutNextText:      { fontSize: 13, textAlign: 'center' },
    payoutHistoryList:   { overflow: 'hidden' },
    payoutHistoryHeader: { fontSize: 14, fontWeight: '700', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
    payoutRow:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 8 },
    payoutDate:          { fontSize: 13, flex: 1 },
    payoutAmount:        { fontSize: 15, fontWeight: '700' },
    statusPill:          { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
    statusPillText:      { fontSize: 11, fontWeight: '600' },
    payoutBank:          { fontSize: 12, minWidth: 80, textAlign: 'right' },
    taxCard:             { padding: 16 },
    taxYtdLabel:         { fontSize: 13, marginBottom: 4 },
    taxYtdAmount:        { fontSize: 28, fontWeight: '800', marginBottom: 14 },
    taxEstRow:           { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 },
    taxEstLabel:         { fontSize: 14 },
    taxEstValue:         { fontSize: 14, fontWeight: '700' },
    taxDueText:          { fontSize: 13, marginBottom: 16 },
    taxButtonRow:        { flexDirection: 'row', gap: 10 },
    taxBtn:              { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    taxBtnText:          { fontSize: 13, fontWeight: '600' },
  });
}
