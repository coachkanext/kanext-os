/**
 * Workforce — Performance (CEO only)
 * Review cycles · Team goals · Individual performance
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const HEAT    = '#B85C5C';

const TEAM_GOALS = [
  { id: 'g1', desc: 'Ship OS v3.0 by June',         owner: 'Engineering', pct: 65, status: 'On Track' as const },
  { id: 'g2', desc: 'Close $500K pipeline',          owner: 'Sales',       pct: 42, status: 'Behind'   as const },
  { id: 'g3', desc: 'Reach 10K platform users',      owner: 'Product',     pct: 78, status: 'On Track' as const },
] as const;

type GoalStatus = 'On Track' | 'Behind' | 'Achieved';

const STATUS_COLOR: Record<GoalStatus, string> = {
  'On Track': GAIN,
  'Behind':   HEAT,
  'Achieved': GAIN,
};

const TEAM_PERF = [
  { id: 'tp1', name: 'Marcus Rivera',    score: '4.8', goals: '3/3', trend: 'up'   as const },
  { id: 'tp2', name: 'Priya Nair',       score: '4.6', goals: '2/3', trend: 'up'   as const },
  { id: 'tp3', name: 'Jordan Kim',       score: '4.9', goals: '3/3', trend: 'up'   as const },
  { id: 'tp4', name: 'Carlos Mendez',    score: '3.8', goals: '1/3', trend: 'down' as const },
  { id: 'tp5', name: 'Tamara West',      score: '4.5', goals: '2/2', trend: 'flat' as const },
  { id: 'tp6', name: 'Devon Brooks',     score: '4.2', goals: '2/3', trend: 'up'   as const },
];

export default function PerformanceScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business');
  const isCEO = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/workforce/contact' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.iconBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Performance</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
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

        {/* Active Review Cycle */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Review Cycles</Text>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Q2 2026 Review', 'Manage cycle — coming soon'); }}>
            <View style={[s.cycleCard, { backgroundColor: C.surface }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>Q2 2026 Review</Text>
                <Text style={{ fontSize: 13, color: C.secondary, marginTop: 4 }}>Deadline: May 15, 2026</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View style={[s.statusPill, { backgroundColor: CAUTION + '18', borderColor: CAUTION + '60' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: CAUTION }}>In Progress</Text>
                </View>
                <Text style={{ fontSize: 13, color: C.secondary }}>8 / 12 submitted</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Team Goals */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Team Goals</Text>
          <View style={{ gap: 10 }}>
            {TEAM_GOALS.map(goal => (
              <View key={goal.id} style={[s.goalCard, { backgroundColor: C.surface }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1, marginRight: 12 }}>{goal.desc}</Text>
                  <View style={[s.statusPill, { backgroundColor: STATUS_COLOR[goal.status] + '18', borderColor: STATUS_COLOR[goal.status] + '60' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: STATUS_COLOR[goal.status] }}>{goal.status}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 8 }}>{goal.owner}</Text>
                <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                  <View style={[s.progressFill, { width: `${goal.pct}%` as any, backgroundColor: STATUS_COLOR[goal.status] }]} />
                </View>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>{goal.pct}% complete</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Individual Performance */}
        <View style={{ marginTop: 24, paddingHorizontal: 16, paddingBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Individual Performance</Text>
          <View style={[s.perfTable, { backgroundColor: C.surface }]}>
            {TEAM_PERF.map((p, idx) => (
              <Pressable
                key={p.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(p.name, `Score: ${p.score}/5.0\nGoals: ${p.goals}`); }}
              >
                <View style={[s.perfRow, {
                  borderBottomColor: C.separator,
                  borderBottomWidth: idx < TEAM_PERF.length - 1 ? StyleSheet.hairlineWidth : 0,
                }]}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1 }}>{p.name}</Text>
                  <Text style={{ fontSize: 13, color: C.secondary, marginRight: 16 }}>{p.goals} goals</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: GAIN, marginRight: 10 }}>{p.score}</Text>
                  <IconSymbol
                    name={p.trend === 'up' ? 'arrow.up.right' : p.trend === 'down' ? 'arrow.down.right' : 'arrow.right'}
                    size={14}
                    color={p.trend === 'up' ? GAIN : p.trend === 'down' ? HEAT : C.secondary}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* FAB — new review cycle */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 72 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Review Cycle', 'Coming soon'); }}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    cycleCard:     { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12 },
    statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    goalCard:      { borderRadius: 12, padding: 14 },
    progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
    progressFill:  { height: 4, borderRadius: 2 },
    perfTable:     { borderRadius: 12, overflow: 'hidden' },
    perfRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14 },
    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8,
      elevation: 4,
    },
  });
}
