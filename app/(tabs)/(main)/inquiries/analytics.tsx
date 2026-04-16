/**
 * Inquiries — Analytics (CEO only)
 * Sales KPIs, pipeline by stage, revenue trend, lead source ROI
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import {
  DEALS, formatCurrency, stageColor,
  type DealStage,
} from '@/data/mock-business-ops';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type Period = 'This Month' | 'This Quarter' | 'This Year' | 'Custom';

const PIPELINE_STAGES: DealStage[] = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const SOURCE_ROI = [
  { source: 'Referral',      leads: 12, qualified: 9,  closed: 4, revenue: 348000 },
  { source: 'Website',       leads: 28, qualified: 11, closed: 3, revenue: 124000 },
  { source: 'Event',         leads: 8,  qualified: 5,  closed: 2, revenue: 98000  },
  { source: 'Inbound Email', leads: 15, qualified: 6,  closed: 1, revenue: 48000  },
  { source: 'Cold Outreach', leads: 45, qualified: 8,  closed: 1, revenue: 22000  },
];

const VELOCITY = [
  { stage: 'New → Qualified',        days: 4.2  },
  { stage: 'Qualified → Proposal',   days: 8.5  },
  { stage: 'Proposal → Negotiation', days: 12.1 },
  { stage: 'Negotiation → Won',      days: 18.3 },
];

export default function AnalyticsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:inquiries');
  const isCEO = role === roleCycles[0];

  const [period, setPeriod] = useState<Period>('This Quarter');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/inquiries/support' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  const openDeals    = DEALS.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const wonDeals     = DEALS.filter(d => d.stage === 'Won');
  const pipelineVal  = openDeals.reduce((s, d) => s + d.value, 0);
  const closedRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
  const avgDealSize  = wonDeals.length > 0 ? Math.round(closedRevenue / wonDeals.length) : 0;
  const winRate      = DEALS.length > 0 ? Math.round((wonDeals.length / DEALS.length) * 100) : 0;

  const maxSourceRevenue = Math.max(...SOURCE_ROI.map(s => s.revenue));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Analytics</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => Alert.alert('Export', 'CSV / PDF — coming soon')} style={s.iconBtn}>
              <IconSymbol name="square.and.arrow.up" size={20} color={C.label} />
            </Pressable>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Period pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}>
          {(['This Month', 'This Quarter', 'This Year', 'Custom'] as Period[]).map(p => (
            <Pressable
              key={p}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPeriod(p); }}
              style={[s.filterPill, { backgroundColor: period === p ? C.label : C.surface, borderColor: period === p ? C.label : C.separator }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: period === p ? C.bg : C.secondary }}>{p}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* KPI cards */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 24 }]}>
          {[
            { label: 'Pipeline',    value: formatCurrency(pipelineVal, true),    trend: '+12%', up: true  },
            { label: 'Closed',      value: formatCurrency(closedRevenue, true),  trend: '+8%',  up: true  },
            { label: 'Avg Deal',    value: formatCurrency(avgDealSize, true),    trend: '-3%',  up: false },
            { label: 'Win Rate',    value: `${winRate}%`,                        trend: '+5%',  up: true  },
          ].map(kpi => (
            <GlassView key={kpi.label} tier={1} style={[s.kpiCard, { flex: 1 }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>{kpi.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{kpi.label}</Text>
              <View style={[s.row, { gap: 3, marginTop: 4 }]}>
                <IconSymbol
                  name={kpi.up ? 'arrow.up.right' : 'arrow.down.right'}
                  size={10}
                  color={kpi.up ? GAIN : HEAT}
                />
                <Text style={{ fontSize: 10, fontWeight: '700', color: kpi.up ? GAIN : HEAT }}>{kpi.trend}</Text>
              </View>
            </GlassView>
          ))}
        </View>

        {/* Deals by stage */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Deals by Stage</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 14 }}>
            {PIPELINE_STAGES.map(stage => {
              const stageDeals = DEALS.filter(d => d.stage === stage);
              const stageVal   = stageDeals.reduce((a, d) => a + d.value, 0);
              const maxVal     = Math.max(...PIPELINE_STAGES.map(st => DEALS.filter(d => d.stage === st).reduce((a, d) => a + d.value, 0)));
              const pct        = maxVal > 0 ? (stageVal / maxVal) * 100 : 0;
              return (
                <View key={stage} style={{ marginBottom: 10 }}>
                  <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{stage}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{stageDeals.length} deals · {formatCurrency(stageVal, true)}</Text>
                  </View>
                  <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                    <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: stageColor(stage) }]} />
                  </View>
                </View>
              );
            })}
          </GlassView>
        </View>

        {/* Pipeline Velocity */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Pipeline Velocity</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {VELOCITY.map((v, i) => (
              <View key={v.stage} style={[s.row, { padding: 14 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{v.stage}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: v.days > 14 ? CAUTION : GAIN }}>{v.days}d avg</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Lead Source ROI */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Lead Source ROI</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 14 }}>
            {SOURCE_ROI.map((src, i) => {
              const barPct = (src.revenue / maxSourceRevenue) * 100;
              return (
                <View key={src.source} style={{ marginBottom: i < SOURCE_ROI.length - 1 ? 14 : 0 }}>
                  <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{src.source}</Text>
                    <View style={s.row}>
                      <Text style={{ fontSize: 11, color: C.secondary, marginRight: 8 }}>{src.leads} leads → {src.closed} closed</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>{formatCurrency(src.revenue, true)}</Text>
                    </View>
                  </View>
                  <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                    <View style={[s.progressFill, { width: `${barPct}%` as any, backgroundColor: GAIN }]} />
                  </View>
                </View>
              );
            })}
          </GlassView>
        </View>

        {/* Forecast */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Revenue Forecast</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 12 }}>Weighted pipeline by stage probability</Text>
            {[
              { label: 'Committed (Won)',      value: closedRevenue,               prob: 100 },
              { label: 'Best Case (Negotiating)', value: openDeals.filter(d => d.stage === 'Negotiation').reduce((a,d) => a+d.value, 0), prob: 75 },
              { label: 'Pipeline (Proposal)',  value: openDeals.filter(d => d.stage === 'Proposal').reduce((a,d) => a+d.value, 0), prob: 40 },
              { label: 'Upside (Earlier)',     value: openDeals.filter(d => d.stage === 'New' || d.stage === 'Qualified').reduce((a,d) => a+d.value, 0), prob: 15 },
            ].map((f, i) => (
              <View key={f.label} style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{f.label}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginRight: 10 }}>{f.prob}% prob</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: GAIN }}>{formatCurrency(Math.round(f.value * f.prob / 100), true)}</Text>
              </View>
            ))}
          </GlassView>
        </View>

      </ScrollView>

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    kpiCard:       { alignItems: 'center', padding: 12, borderRadius: 12 },
    progressTrack: { height: 5, borderRadius: 2.5, overflow: 'hidden' },
    progressFill:  { height: 5, borderRadius: 2.5 },
  });
}
