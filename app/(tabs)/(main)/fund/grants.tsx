/**
 * Fund — Grants (President only).
 * Government and foundation grant management. Filter, list, detail, FAB.
 */

import React, { useState, useCallback, useMemo } from 'react';
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

type GrantStatus = 'Active' | 'Applied' | 'Draft' | 'Completed';
type Grant = {
  id: string; name: string; funder: string; amount: number;
  status: GrantStatus; deadline: string; type: string; description: string;
  reportDue?: string; endDate?: string;
};

const GRANTS: Grant[] = [
  {
    id: '1', name: 'WSCUC Institutional Support Grant', funder: 'Western Association of Schools & Colleges',
    amount: 75_000, status: 'Active', type: 'Regional Accreditor', deadline: 'Ongoing',
    description: 'Supports institutional effectiveness, accreditation compliance, and faculty development initiatives.',
    reportDue: 'Jun 15', endDate: 'Aug 31',
  },
  {
    id: '2', name: 'California Community Development Grant', funder: 'CA Department of Education',
    amount: 150_000, status: 'Applied', type: 'State Government', deadline: 'Decision May 30',
    description: 'HBCU community development initiative supporting Oakland-area workforce training and certificate programs.',
  },
  {
    id: '3', name: 'Oakland STEM Initiative', funder: 'Oakland Education Foundation',
    amount: 30_000, status: 'Active', type: 'Local Foundation', deadline: 'Renewal Aug 2026',
    description: 'Supports STEM curriculum development, lab equipment, and student tutoring in Diagnostic Imaging and Health Sciences.',
    reportDue: 'May 1', endDate: 'Jul 31',
  },
  {
    id: '4', name: 'HHS Title III HBCU Grant', funder: 'U.S. Dept. of Health & Human Services',
    amount: 85_000, status: 'Active', type: 'Federal', deadline: 'Compliance Sep 30',
    description: 'Federal HBCU capacity-building grant. Supports Diagnostic Imaging program accreditation and clinical partnerships.',
    reportDue: 'Jul 15', endDate: 'Sep 30',
  },
  {
    id: '5', name: 'East Bay Community Foundation Grant', funder: 'East Bay Community Foundation',
    amount: 25_000, status: 'Applied', type: 'Regional Foundation', deadline: 'Decision Jun 1',
    description: 'Supports student emergency funds and wraparound services for first-generation college students.',
  },
  {
    id: '6', name: 'National Medical Imaging Education Grant', funder: 'ASRT Foundation',
    amount: 120_000, status: 'Draft', type: 'Professional Association', deadline: 'Submission Jun 30',
    description: 'Multi-year grant to establish a regional simulation lab for radiologic technology education.',
  },
];

type FilterKey = 'all' | 'Active' | 'Applied' | 'upcoming' | 'Completed';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'Active',    label: 'Active' },
  { key: 'Applied',   label: 'Applied' },
  { key: 'upcoming',  label: 'Upcoming Deadlines' },
  { key: 'Completed', label: 'Completed' },
];

const STATUS_COLOR: Record<GrantStatus, string> = {
  Active:    GAIN,
  Applied:   CAUTION,
  Draft:     '#9C9790',
  Completed: '#9C9790',
};

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n}`;

export default function GrantsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:fund');
  const isPresident = role === roleCycles[0];
  const [filter, setFilter] = useState<FilterKey>('all');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPresident) router.replace('/(tabs)/(main)/fund/scholarships' as any);
  }, [isPresident, router]));

  if (!isPresident) return null;

  const filtered = useMemo(() => {
    if (filter === 'upcoming') return GRANTS.filter(g => g.reportDue !== undefined);
    if (filter === 'all') return GRANTS;
    return GRANTS.filter(g => g.status === filter);
  }, [filter]);

  const totalActive = GRANTS.filter(g => g.status === 'Active').reduce((a, g) => a + g.amount, 0);

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
              <Text style={[s.titleText, { color: C.label }]}>Grants</Text>
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
        {/* Stats */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <View style={[s.statsRow, { backgroundColor: C.surface }]}>
            {[
              { label: 'Active',  value: String(GRANTS.filter(g => g.status === 'Active').length),  color: GAIN   },
              { label: 'Applied', value: String(GRANTS.filter(g => g.status === 'Applied').length), color: CAUTION },
              { label: 'Total Active', value: fmt(totalActive), color: C.label },
            ].map((st, idx, arr) => (
              <View key={st.label} style={[s.statCol, idx < arr.length - 1 && [s.statBorder, { borderRightColor: C.separator }]]}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: st.color }}>{st.value}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming deadlines callout */}
        {GRANTS.some(g => g.reportDue) && (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <View style={[s.card, { backgroundColor: C.surface }]}>
              {GRANTS.filter(g => g.reportDue).map((g, idx, arr) => (
                <View key={g.id} style={[s.row, idx < arr.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
                  <IconSymbol name="calendar.badge.clock" size={16} color={CAUTION} style={{ flexShrink: 0 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{g.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Report due: {g.reportDue}</Text>
                  </View>
                  <Pressable
                    style={[s.actionBtn, { backgroundColor: CAUTION + '22', borderColor: CAUTION }]}
                    onPress={() => Alert.alert('Set Reminder', `Set a reminder for the ${g.name} report due ${g.reportDue}.`)}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: CAUTION }}>Remind</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {FILTERS.map(f => (
            <Pressable key={f.key} onPress={() => { setFilter(f.key); Haptics.selectionAsync(); }}
              style={[s.filterPill, { backgroundColor: filter === f.key ? C.label : C.surface, borderColor: C.separator }]}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f.key ? C.bg : C.secondary }}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Grant list */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>
            {filter === 'all' ? `All Grants (${filtered.length})` : `${filtered.length} Result${filtered.length !== 1 ? 's' : ''}`}
          </Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {filtered.map((g, idx) => (
              <Pressable
                key={g.id}
                style={[s.row, { alignItems: 'flex-start' }, idx < filtered.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                onPress={() => Alert.alert(g.name,
                  `Funder: ${g.funder}\nType: ${g.type}\nAmount: ${fmt(g.amount)}\nStatus: ${g.status}\nDeadline: ${g.deadline}${g.reportDue ? `\nReport Due: ${g.reportDue}` : ''}${g.endDate ? `\nEnd Date: ${g.endDate}` : ''}\n\n${g.description}`,
                  [
                    { text: 'Upload Document', onPress: () => {} },
                    { text: 'Submit Report', onPress: () => {} },
                    { text: 'Set Reminder', onPress: () => {} },
                    { text: 'Close', style: 'cancel' },
                  ]
                )}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 2 }}>{g.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 6 }}>{g.funder} · {g.type}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[g.status] + '22', borderColor: STATUS_COLOR[g.status] }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: STATUS_COLOR[g.status] }}>{g.status.toUpperCase()}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{g.deadline}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, paddingTop: 2 }}>{fmt(g.amount)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Dipson integration hint */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Pressable
            style={[s.dipsonCard, { backgroundColor: C.surface, borderColor: C.separator }]}
            onPress={() => Alert.alert('Ask Dipson', 'Open Dipson to search: "Find HBCU grants for diagnostic imaging programs in California"')}
          >
            <IconSymbol name="sparkles" size={16} color={C.label} />
            <Text style={{ flex: 1, fontSize: 13, color: C.label }}>
              <Text style={{ fontWeight: '700' }}>Ask Dipson</Text> to find new grant opportunities for HBCU diagnostic imaging programs
            </Text>
            <IconSymbol name="chevron.right" size={13} color={C.secondary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 64 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('Add Grant', 'Log a new grant:\n\nName · Funder · Amount · Type · Timeline · Requirements');
        }}
      >
        <IconSymbol name="plus" size={24} color={C.bg} />
      </Pressable>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:       { flex: 1 },
  topBarOuter:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:    { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:         { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
  statsRow:     { flexDirection: 'row', borderRadius: 14, overflow: 'hidden' },
  statCol:      { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder:   { borderRightWidth: StyleSheet.hairlineWidth },
  filterPill:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, flexShrink: 0 },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, flexShrink: 0 },
  actionBtn:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1 },
  dipsonCard:   { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  fab:          { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 4 },
});
