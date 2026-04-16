/**
 * Recruits — Analytics (Head Coach only).
 * Recruiting class summary, budget, pipeline funnel, historical classes.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
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
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';
const HEAT      = '#B85C5C';

const PIPELINE_FUNNEL = [
  { stage: 'Identified', count: 8,  pct: 100 },
  { stage: 'Watching',   count: 5,  pct: 62  },
  { stage: 'Contact',    count: 4,  pct: 50  },
  { stage: 'Evaluating', count: 3,  pct: 38  },
  { stage: 'Offer',      count: 2,  pct: 25  },
  { stage: 'Committed',  count: 1,  pct: 12  },
  { stage: 'Signed',     count: 1,  pct: 12  },
];

const HISTORICAL_CLASSES = [
  { year: '2024-25', commits: 4, avgKR: 68.2, retention: '75%', outcome: '22-8 · GAAC Champs' },
  { year: '2023-24', commits: 3, avgKR: 65.4, retention: '100%', outcome: '18-11 · GAAC Semi' },
  { year: '2022-23', commits: 5, avgKR: 63.1, retention: '60%', outcome: '14-14 · Missed playoffs' },
];

const SCHOLARSHIP_DATA = {
  limit: 11, allocated: 9, available: 2,
  breakdown: [
    { name: 'Jordan Shaw',   pos: 'PG', amount: '$18,000', status: 'Committed' },
    { name: 'Tavion Howard', pos: 'PG', amount: '$16,500', status: 'Signed' },
    { name: 'Terrance Bell', pos: 'SG', amount: '$20,000', status: 'Offer Extended' },
  ],
};

export default function AnalyticsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:recruits');
  const isCoach = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isCoach) router.replace('/(tabs)/(main)/recruits/program' as any);
  }, [isCoach, router]));

  if (!isCoach) return null;

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
              <Text style={[s.titleText, { color: C.label }]}>Analytics</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current class summary */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Current Class</Text>
        <View style={[s.card, { backgroundColor: '#1A1714', marginBottom: 20 }]}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>2025-26 Recruiting Class</Text>
          <View style={{ flexDirection: 'row', gap: 0 }}>
            {[
              { label: 'Commits', value: '2', color: GAIN },
              { label: 'Avg KR', value: '68.0', color: CAUTION },
              { label: 'Team KR Δ', value: '+1.8', color: GAIN },
              { label: 'Schol. Cost', value: '$34.5K', color: '#fff' },
            ].map((stat, i, arr) => (
              <View key={stat.label} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRightWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderRightColor: 'rgba(255,255,255,0.15)' }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: stat.color }}>{stat.value}</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pipeline conversion funnel */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Pipeline Conversion</Text>
        <View style={[s.card, { backgroundColor: C.surface, padding: 16, marginBottom: 20 }]}>
          {PIPELINE_FUNNEL.map((item, idx) => (
            <View key={item.stage} style={{ marginBottom: idx < PIPELINE_FUNNEL.length - 1 ? 10 : 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: C.label, fontWeight: '500' }}>{item.stage}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{item.count}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, width: 34, textAlign: 'right' }}>{item.pct}%</Text>
                </View>
              </View>
              <View style={{ height: 5, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: `${item.pct}%` as any, height: '100%', backgroundColor: item.pct >= 50 ? GAIN : item.pct >= 25 ? CAUTION : '#9C9790', borderRadius: 3 }} />
              </View>
            </View>
          ))}
        </View>

        {/* Scholarship budget */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Scholarship Budget</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
          <View style={{ padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: C.secondary }}>NAIA Limit</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{SCHOLARSHIP_DATA.limit}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: C.secondary }}>Allocated</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{SCHOLARSHIP_DATA.allocated}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: C.secondary }}>Available</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: GAIN }}>{SCHOLARSHIP_DATA.available}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden', marginTop: 10 }}>
              <View style={{ width: `${(SCHOLARSHIP_DATA.allocated / SCHOLARSHIP_DATA.limit) * 100}%` as any, height: '100%', backgroundColor: CAUTION, borderRadius: 3 }} />
            </View>
          </View>
          {SCHOLARSHIP_DATA.breakdown.map((row, idx) => (
            <View key={row.name} style={[{ flexDirection: 'row', alignItems: 'center', padding: 14 }, idx < SCHOLARSHIP_DATA.breakdown.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <View style={[s.posBadge, { backgroundColor: '#1A1714' + '18', marginRight: 10 }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#1A1714' }}>{row.pos}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{row.name}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginRight: 10 }}>{row.amount}</Text>
              <View style={[s.badge, { backgroundColor: row.status === 'Signed' ? GAIN + '22' : row.status === 'Committed' ? GAIN + '18' : CAUTION + '22' }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: row.status === 'Signed' ? GAIN : row.status === 'Committed' ? GAIN : CAUTION }}>{row.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Historical classes */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Historical Classes</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
          {HISTORICAL_CLASSES.map((cls, idx) => (
            <View key={cls.year} style={[{ padding: 14 }, idx < HISTORICAL_CLASSES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{cls.year}</Text>
                <Text style={{ fontSize: 13, color: GAIN, fontWeight: '600' }}>{cls.outcome}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Commits</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{cls.commits}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Avg KR</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{cls.avgKR}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Retention</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: cls.retention === '100%' ? GAIN : cls.retention === '75%' ? CAUTION : HEAT }}>{cls.retention}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Export */}
        <Pressable
          style={[s.exportBtn, { borderColor: C.separator }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Export Report', 'Export recruiting analytics as PDF or CSV?', [{ text: 'PDF' }, { text: 'CSV' }, { text: 'Cancel', style: 'cancel' }]); }}
        >
          <IconSymbol name="arrow.down.doc" size={14} color={C.label} />
          <Text style={[{ fontSize: 13, fontWeight: '600', color: C.label }]}>Export Recruiting Report</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },
  sectionLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:        { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  rowBorder:   { borderBottomWidth: StyleSheet.hairlineWidth },
  posBadge:    { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badge:       { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  exportBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
});
