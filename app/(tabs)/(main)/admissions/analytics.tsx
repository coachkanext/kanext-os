/**
 * Admissions — Analytics (President only)
 * KPIs, funnel conversion, enrollment by program, source analysis, Dipson forecast.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }    from '@/components/ui/icon-symbol';
import { KMenuButton }   from '@/components/ui/k-menu-button';
import { RolePill }      from '@/components/ui/role-pill';
import { GlassView }     from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel }  from '@/utils/global-side-panel';
import { resetFooter }    from '@/utils/global-footer-hide';
import { useDemoRole }    from '@/utils/demo-role-store';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const KPIS = [
  { label: 'Applications',   value: '30',   trend: '+12%', up: true  },
  { label: 'Acceptance Rate', value: '40%', trend: '+3%',  up: true  },
  { label: 'Yield Rate',      value: '50%', trend: '-2%',  up: false },
  { label: 'Net Tuition/Stu', value: '$4.2K', trend: '+8%', up: true },
];

const FUNNEL_DATA = [
  { stage: 'Inquiry',      count: 45, pct: 100 },
  { stage: 'Applied',      count: 30, pct: 67  },
  { stage: 'Under Review', count: 15, pct: 50  },
  { stage: 'Accepted',     count: 12, pct: 80  },
  { stage: 'Deposited',    count:  8, pct: 67  },
  { stage: 'Enrolled',     count:  6, pct: 75  },
];

const PROGRAMS = [
  { name: 'Computer Science', enrolled: 18, capacity: 30, target: 25 },
  { name: 'Business Admin',   enrolled: 24, capacity: 40, target: 35 },
  { name: 'Nursing',          enrolled: 12, capacity: 20, target: 20 },
  { name: 'Pre-Med',          enrolled:  8, capacity: 15, target: 12 },
  { name: 'Education',        enrolled:  6, capacity: 15, target: 10 },
  { name: 'Data Science',     enrolled:  4, capacity: 10, target:  8 },
];

const SOURCES = [
  { source: 'Campus Visit',   enrolled: 18, pct: 38, cost: 2500 },
  { source: 'Digital',        enrolled: 12, pct: 25, cost: 4200 },
  { source: 'Referral',       enrolled:  8, pct: 17, cost: 800  },
  { source: 'High School',    enrolled:  6, pct: 13, cost: 3100 },
  { source: 'Social Media',   enrolled:  2, pct:  4, cost: 1800 },
  { source: 'Other',          enrolled:  2, pct:  4, cost: 600  },
];

type Period = 'This Cycle' | 'Last Cycle' | 'YoY' | 'Custom';
const PERIODS: Period[] = ['This Cycle', 'Last Cycle', 'YoY'];

export default function AnalyticsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('education:admissions');
  const isPresident = role === roleCycles[0];
  const [activePeriod, setActivePeriod] = useState<Period>('This Cycle');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isPresident) router.replace('/(tabs)/(main)/admissions/my-application' as any);
  }, [isPresident, router]);

  if (!isPresident) return null;

  const maxEnrolled = Math.max(...PROGRAMS.map(p => p.enrolled));

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
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPresident} />
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 20 }}
        >
          {PERIODS.map(p => {
            const active = activePeriod === p;
            return (
              <Pressable
                key={p}
                onPress={() => { Haptics.selectionAsync(); setActivePeriod(p); }}
                style={[s.filterPill, { backgroundColor: active ? C.label : C.surface, borderColor: active ? C.label : C.separator }]}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.bg : C.label }}>{p}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* KPI cards */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={[s.row, { flexWrap: 'wrap', gap: 10 }]}>
            {KPIS.map(kpi => (
              <GlassView key={kpi.label} tier={1} style={{ width: '47%', borderRadius: 12, padding: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: C.label }}>{kpi.value}</Text>
                <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{kpi.label}</Text>
                <View style={[s.row, { marginTop: 6, gap: 4 }]}>
                  <IconSymbol
                    name={kpi.up ? 'arrow.up.right' : 'arrow.down.right'}
                    size={10}
                    color={kpi.up ? GAIN : HEAT}
                  />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: kpi.up ? GAIN : HEAT }}>{kpi.trend} vs last cycle</Text>
                </View>
              </GlassView>
            ))}
          </View>
        </View>

        {/* Funnel conversion */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Funnel Conversion</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            {FUNNEL_DATA.map((row, i) => (
              <View key={row.stage}>
                <View style={[s.row, { marginBottom: 4 }]}>
                  <Text style={{ fontSize: 12, color: C.label, width: 110 }}>{row.stage}</Text>
                  <View style={{ flex: 1, height: 14, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden', marginHorizontal: 8 }}>
                    <View style={{ width: `${row.pct}%`, height: 14, backgroundColor: row.stage === 'Enrolled' ? GAIN : C.label + '60', borderRadius: 3 }} />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: C.label, width: 30, textAlign: 'right' }}>{row.count}</Text>
                </View>
                {i < FUNNEL_DATA.length - 1 && (
                  <View style={{ marginBottom: 4, marginLeft: 8 }}>
                    <Text style={{ fontSize: 10, color: C.secondary }}>
                      {Math.round((FUNNEL_DATA[i + 1].count / row.count) * 100)}% → {FUNNEL_DATA[i + 1].stage}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </GlassView>
        </View>

        {/* Enrollment by program */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Enrollment by Program</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {PROGRAMS.map((prog, i) => {
              const barW = (prog.enrolled / prog.capacity) * 100;
              const atTarget = prog.enrolled >= prog.target;
              return (
                <View key={prog.name} style={[
                  { paddingVertical: 12, paddingHorizontal: 14 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                ]}>
                  <View style={[s.row, { marginBottom: 6 }]}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }}>{prog.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{prog.enrolled}/{prog.capacity}</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: `${barW}%`, height: 6, backgroundColor: atTarget ? GAIN : CAUTION, borderRadius: 3 }} />
                  </View>
                </View>
              );
            })}
          </GlassView>
        </View>

        {/* Source analysis */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Source → Enrolled</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {SOURCES.map((src, i) => (
              <View key={src.source} style={[
                s.row, { paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}>
                <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{src.source}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginRight: 8 }}>{src.pct}%</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: GAIN }}>{src.enrolled} enrolled</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>${Math.round(src.cost / (src.enrolled || 1))}/enroll</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Dipson projection */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Dipson Forecast</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            <View style={[s.row, { marginBottom: 12, gap: 8 }]}>
              <View style={{ backgroundColor: C.label + '14', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: C.label }}>AI</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Fall 2026 Projection</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 20, marginBottom: 12 }}>
              Based on current pipeline velocity, projecting <Text style={{ fontWeight: '700', color: CAUTION }}>48 new enrollments</Text> for Fall 2026 vs target of 55. Recommend increasing digital campaign spend or scheduling an additional open house to close the gap.
            </Text>
            <View style={[s.row, { gap: 16 }]}>
              {[
                { label: 'Projected', value: '48', color: CAUTION },
                { label: 'Target',    value: '55', color: C.label },
                { label: 'Gap',       value: '-7', color: HEAT    },
              ].map(stat => (
                <View key={stat.label} style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: stat.color }}>{stat.value}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary }}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </GlassView>
        </View>

        {/* Export */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Pressable
            style={({ pressed }) => [s.exportBtn, { borderColor: C.separator, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Export Report', 'CSV / PDF export — coming soon'); }}
          >
            <IconSymbol name="square.and.arrow.up" size={15} color={C.label} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Export Board Report</Text>
          </Pressable>
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
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    exportBtn:     { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  });
}
