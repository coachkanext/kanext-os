/**
 * Business Hub — Reports screen. CEO only.
 * Revenue dashboard, project profitability, client breakdown, team utilization.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
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

const PERIODS = ['Month', 'Quarter', 'Year'] as const;
type Period = typeof PERIODS[number];

const REVENUE: Record<Period, { value: number; change: number }> = {
  Month:   { value: 48500,  change: 12  },
  Quarter: { value: 138000, change: 8   },
  Year:    { value: 512000, change: 22  },
};

const PROJECT_PROFITABILITY = [
  { name: 'KaNeXT OS v2.0',        revenue: 120000, cost: 68000 },
  { name: 'Nike Partnership',       revenue: 84000,  cost: 31000 },
  { name: 'Coaching App',           revenue: 55000,  cost: 28000 },
  { name: 'Brand Identity Refresh', revenue: 42000,  cost: 22000 },
  { name: 'Q1 Analytics Report',    revenue: 28000,  cost: 9000  },
];

const CLIENT_REVENUE = [
  { name: 'Nike',        revenue: 84000,  percent: 40 },
  { name: 'ESPN Digital', revenue: 55000,  percent: 26 },
  { name: 'Gatorade',    revenue: 42000,  percent: 20 },
  { name: 'Forbes',      revenue: 28000,  percent: 13 },
];

const TEAM_UTIL = [
  { name: 'Jordan Davis',  initials: 'JD', utilization: 95, projects: 2 },
  { name: 'Luis Martinez', initials: 'LM', utilization: 88, projects: 2 },
  { name: 'Alex Rivera',   initials: 'AR', utilization: 72, projects: 2 },
  { name: 'Maya Kim',      initials: 'MK', utilization: 60, projects: 1 },
  { name: 'Casey Brooks',  initials: 'CB', utilization: 45, projects: 1 },
  { name: 'Dana Okafor',   initials: 'DO', utilization: 0,  projects: 0 },
];

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.9, color: C.secondary, textTransform: 'uppercase', marginBottom: 12, marginTop: 4 }}>
      {title}
    </Text>
  );
}

export default function ReportsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('business:hub');
  const isCEO  = role === roleCycles[0];

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/hub/business' as any);
  }, [isCEO]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [period, setPeriod] = useState<Period>('Month');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const rev = REVENUE[period];
  const maxRevenue = Math.max(...PROJECT_PROFITABILITY.map(p => p.revenue));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Reports</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── REVENUE ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SectionHeader title="Revenue" C={C} />
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {PERIODS.map(p => {
              const active = period === p;
              return (
                <Pressable
                  key={p}
                  style={[s.periodPill, active
                    ? { backgroundColor: C.activePill }
                    : { backgroundColor: C.surface, borderColor: C.separator }
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setPeriod(p); }}
                >
                  <Text style={[s.periodPillText, { color: active ? C.activePillText : C.secondary }]}>{p}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[s.revenueCard, { backgroundColor: C.surface }]}>
          <Text style={[s.revenueAmount, { color: C.label }]}>${rev.value.toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <IconSymbol name={rev.change >= 0 ? 'arrow.up.right' : 'arrow.down.right'} size={12} color={rev.change >= 0 ? GAIN : HEAT} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: rev.change >= 0 ? GAIN : HEAT }}>
              {rev.change >= 0 ? '+' : ''}{rev.change}% vs last {period.toLowerCase()}
            </Text>
          </View>

          {/* Simple bar chart — monthly breakdown */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 60 }}>
              {[38, 52, 45, 61, 48, 70, 65, 78, 55, 82, 75, 90].slice(0, period === 'Month' ? 4 : period === 'Quarter' ? 8 : 12).map((h, i) => (
                <View key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: C.label, borderRadius: 3, opacity: i === (period === 'Month' ? 3 : period === 'Quarter' ? 7 : 11) ? 1 : 0.25 }} />
              ))}
            </View>
          </View>
        </View>

        {/* ── PROJECT PROFITABILITY ── */}
        <View style={{ marginTop: 28, marginBottom: 0 }}>
          <SectionHeader title="Project Profitability" C={C} />
          {PROJECT_PROFITABILITY.map(proj => {
            const margin = Math.round(((proj.revenue - proj.cost) / proj.revenue) * 100);
            const revenueBar = Math.round((proj.revenue / maxRevenue) * 100);
            return (
              <View key={proj.name} style={[s.profCard, { backgroundColor: C.surface }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={[s.profName, { color: C.label }]} numberOfLines={1}>{proj.name}</Text>
                  <Text style={[s.profMargin, { color: margin >= 50 ? GAIN : margin >= 30 ? CAUTION : HEAT }]}>{margin}% margin</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.profLabel, { color: C.secondary }]}>Revenue</Text>
                    <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginTop: 4 }}>
                      <View style={{ height: 4, width: `${revenueBar}%`, backgroundColor: GAIN, borderRadius: 2 }} />
                    </View>
                    <Text style={[s.profValue, { color: GAIN }]}>${proj.revenue.toLocaleString()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.profLabel, { color: C.secondary }]}>Cost</Text>
                    <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginTop: 4 }}>
                      <View style={{ height: 4, width: `${Math.round((proj.cost / maxRevenue) * 100)}%`, backgroundColor: HEAT, borderRadius: 2 }} />
                    </View>
                    <Text style={[s.profValue, { color: HEAT }]}>${proj.cost.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── CLIENT REVENUE ── */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader title="Client Revenue" C={C} />
          {CLIENT_REVENUE.map(client => (
            <View key={client.name} style={[s.clientRow, { backgroundColor: C.surface }]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={[s.clientName, { color: C.label }]}>{client.name}</Text>
                  <Text style={[s.clientRev, { color: C.label }]}>${client.revenue.toLocaleString()}</Text>
                </View>
                <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2 }}>
                  <View style={{ height: 4, width: `${client.percent}%`, backgroundColor: C.label, borderRadius: 2 }} />
                </View>
                <Text style={[s.clientPct, { color: C.secondary }]}>{client.percent}% of revenue</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── TEAM UTILIZATION ── */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader title="Team Utilization" C={C} />
          {TEAM_UTIL.map(member => {
            const utilColor = member.utilization >= 85 ? HEAT : member.utilization >= 60 ? GAIN : CAUTION;
            return (
              <View key={member.name} style={[s.utilRow, { backgroundColor: C.surface }]}>
                <View style={[s.utilAvatar, { backgroundColor: C.separator }]}>
                  <Text style={[s.utilAvatarText, { color: C.label }]}>{member.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={[s.utilName, { color: C.label }]}>{member.name}</Text>
                    <Text style={[s.utilPct, { color: utilColor }]}>{member.utilization}%</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2 }}>
                    <View style={{ height: 4, width: `${member.utilization}%`, backgroundColor: utilColor, borderRadius: 2 }} />
                  </View>
                  <Text style={[s.utilProjects, { color: C.secondary }]}>{member.projects} active {member.projects === 1 ? 'project' : 'projects'}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Export */}
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => [s.exportBtn, { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 }]}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={C.label} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Export Report</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  periodPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  periodPillText: { fontSize: 11, fontWeight: '600' },
  revenueCard: { borderRadius: 14, padding: 20, marginBottom: 4 },
  revenueAmount: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  profCard: { borderRadius: 12, padding: 14, marginBottom: 8 },
  profName: { fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 },
  profMargin: { fontSize: 12, fontWeight: '700' },
  profLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  profValue: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  clientRow: { borderRadius: 12, padding: 14, marginBottom: 8 },
  clientName: { fontSize: 14, fontWeight: '600' },
  clientRev: { fontSize: 14, fontWeight: '700' },
  clientPct: { fontSize: 11, marginTop: 4 },
  utilRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 8 },
  utilAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  utilAvatarText: { fontSize: 11, fontWeight: '800' },
  utilName: { fontSize: 13, fontWeight: '600' },
  utilPct: { fontSize: 13, fontWeight: '700' },
  utilProjects: { fontSize: 11, marginTop: 4 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 14, marginTop: 20 },
});
