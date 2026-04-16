/**
 * Outreach — Pipeline (Pastor only).
 * Visitor funnel + prospect list. Member redirects to invite.
 */

import React, { useState, useCallback, useMemo } from 'react';
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
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

type Stage = 'Explorer' | 'First Visit' | 'Returned' | 'Connected' | 'Became Member';

type Prospect = {
  id: string; initials: string; name: string; hue: number;
  stage: Stage; source: string; dateEntered: string; assignedTo: string;
};

const FUNNEL = [
  { stage: 'Explorer',      count: 25, rate: '72%' },
  { stage: 'First Visit',   count: 18, rate: '61%' },
  { stage: 'Returned',      count: 11, rate: '64%' },
  { stage: 'Connected',     count:  7, rate: '57%' },
  { stage: 'Became Member', count:  4, rate: null  },
];

const PROSPECTS: Prospect[] = [
  { id: 'p01', initials: 'KM', name: 'Kevin Mensah',    hue: 120, stage: 'First Visit',   source: 'Member invite',  dateEntered: 'Mar 30', assignedTo: 'James Osei'    },
  { id: 'p02', initials: 'RA', name: 'Rachel Adeyemi',  hue: 60,  stage: 'First Visit',   source: 'Social media',   dateEntered: 'Mar 23', assignedTo: 'Faith Stewart' },
  { id: 'p03', initials: 'PO', name: 'Peter Okafor',    hue: 190, stage: 'Returned',      source: 'Event',          dateEntered: 'Mar 16', assignedTo: 'James Osei'    },
  { id: 'p04', initials: 'LB', name: 'Linda Brown',     hue: 330, stage: 'Returned',      source: 'Drive-by',       dateEntered: 'Mar 9',  assignedTo: 'Nia Johnson'   },
  { id: 'p05', initials: 'SN', name: 'Samuel Nkrumah',  hue: 280, stage: 'Returned',      source: 'Online',         dateEntered: 'Mar 2',  assignedTo: 'David Santos'  },
  { id: 'p06', initials: 'AB', name: 'Amara Bello',     hue: 45,  stage: 'Connected',     source: 'Member invite',  dateEntered: 'Feb 22', assignedTo: 'Ola Adebayo'   },
  { id: 'p07', initials: 'TD', name: 'Tunde Dada',      hue: 240, stage: 'Connected',     source: 'Event',          dateEntered: 'Feb 15', assignedTo: 'James Osei'    },
  { id: 'p08', initials: 'IJ', name: 'Ifeoma James',    hue: 170, stage: 'Connected',     source: 'Member invite',  dateEntered: 'Feb 8',  assignedTo: 'Faith Stewart' },
  { id: 'p09', initials: 'CT', name: 'Chidi Thomas',    hue: 155, stage: 'Became Member', source: 'Event',          dateEntered: 'Jan 20', assignedTo: 'Emmanuel K.'   },
  { id: 'p10', initials: 'EO', name: 'Emeka Okafor',    hue: 30,  stage: 'Explorer',      source: 'Online',         dateEntered: 'Apr 8',  assignedTo: 'James Osei'    },
  { id: 'p11', initials: 'ZA', name: 'Zara Adeleke',    hue: 200, stage: 'Explorer',      source: 'Drive-by',       dateEntered: 'Apr 5',  assignedTo: 'Faith Stewart' },
  { id: 'p12', initials: 'MB', name: 'Moses Brown',     hue: 90,  stage: 'Explorer',      source: 'Social media',   dateEntered: 'Apr 3',  assignedTo: 'David Santos'  },
];

const STAGE_FILTERS: (Stage | 'All')[] = ['All', 'Explorer', 'First Visit', 'Returned', 'Connected', 'Became Member'];

function stageColor(stage: Stage): string {
  if (stage === 'Explorer')      return '#9C9790';
  if (stage === 'First Visit')   return CAUTION;
  if (stage === 'Returned')      return CAUTION;
  if (stage === 'Connected')     return GAIN;
  return GAIN;
}

export default function PipelineScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  const [filter, setFilter] = useState<Stage | 'All'>('All');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) router.replace('/(tabs)/(main)/outreach/invite' as any);
  }, [isPastor, router]));

  const filtered = useMemo(() =>
    filter === 'All' ? PROSPECTS : PROSPECTS.filter(p => p.stage === filter),
  [filter]);

  if (!isPastor) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Pipeline</Text>
            </View>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
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

        {/* Funnel */}
        <View style={[s.card, { backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 24 }]}>
          {FUNNEL.map((f, idx) => {
            const barW = `${20 + (FUNNEL.length - idx) * 14}%` as any;
            return (
              <View key={f.stage} style={[s.funnelRow, idx < FUNNEL.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
                <View style={{ width: 120 }}>
                  <Text style={[s.funnelStage, { color: C.label }]}>{f.stage}</Text>
                  {f.rate && <Text style={[s.funnelRate, { color: C.secondary }]}>{f.rate} →</Text>}
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <View style={[s.funnelBar, { width: barW, backgroundColor: C.separator }]}>
                    <View style={[s.funnelFill, { backgroundColor: GAIN }]} />
                  </View>
                </View>
                <Text style={[s.funnelCount, { color: C.label }]}>{f.count}</Text>
              </View>
            );
          })}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {STAGE_FILTERS.map(f => {
            const active = f === filter;
            return (
              <Pressable key={f} style={[s.filterPill, active ? { backgroundColor: C.label } : { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]} onPress={() => { Haptics.selectionAsync(); setFilter(f); }}>
                <Text style={[s.filterPillText, { color: active ? C.bg : C.secondary }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Prospect list */}
        <View style={[s.card, { backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 24 }]}>
          {filtered.map((p, idx) => (
            <Pressable
              key={p.id}
              style={({ pressed }) => [s.prospectRow, pressed && { backgroundColor: C.bg }, idx < filtered.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
              onPress={() => Alert.alert(p.name, `Stage: ${p.stage}\nSource: ${p.source}\nEntered: ${p.dateEntered}\nAssigned to: ${p.assignedTo}`, [
                { text: 'Call', onPress: () => {} },
                { text: 'Message', onPress: () => {} },
                { text: 'Close', style: 'cancel' },
              ])}
            >
              <View style={[s.avatar, { backgroundColor: `hsl(${p.hue},42%,32%)` }]}>
                <Text style={s.avatarText}>{p.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.prospectName, { color: C.label }]}>{p.name}</Text>
                <Text style={[s.prospectSub, { color: C.secondary }]}>{p.source} · {p.dateEntered}</Text>
                <Text style={[s.prospectSub, { color: C.secondary }]}>→ {p.assignedTo}</Text>
              </View>
              <View style={[s.stagePill, { backgroundColor: stageColor(p.stage) + '22', borderColor: stageColor(p.stage) + '44' }]}>
                <Text style={[s.stagePillText, { color: stageColor(p.stage) }]}>{p.stage}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Metrics */}
        <Text style={[s.sectionLabel, { color: C.secondary, paddingHorizontal: 16 }]}>Pipeline Metrics</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
          {[
            { label: 'Total Prospects',          value: '25'  },
            { label: 'Avg. First Visit → Member', value: '6 weeks' },
            { label: 'Top Source',               value: 'Member Invite' },
            { label: 'This Month Converted',     value: '4'   },
          ].map((m, idx, arr) => (
            <View key={m.label} style={[s.metricRow, idx < arr.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <Text style={[s.metricLabel, { color: C.secondary }]}>{m.label}</Text>
              <Text style={[s.metricValue, { color: C.label }]}>{m.value}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Prospect', 'Add a new prospect to the pipeline?', [{ text: 'Cancel' }, { text: 'Add' }]); }}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>
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

  card:      { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  funnelRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  funnelStage: { fontSize: 13, fontWeight: '600' },
  funnelRate:  { fontSize: 11, marginTop: 1 },
  funnelBar:   { height: 6, borderRadius: 3, overflow: 'hidden' },
  funnelFill:  { position: 'absolute', left: 0, top: 0, bottom: 0, right: 0 },
  funnelCount: { fontSize: 15, fontWeight: '800', width: 28, textAlign: 'right' },

  filterPill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  prospectRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  prospectName: { fontSize: 14, fontWeight: '600' },
  prospectSub:  { fontSize: 11, marginTop: 2 },

  stagePill:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  stagePillText: { fontSize: 10, fontWeight: '700' },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  metricRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  metricLabel:  { fontSize: 13 },
  metricValue:  { fontSize: 14, fontWeight: '700' },

  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
