/**
 * Workforce — Directory
 * CEO: full company directory with search, filter, stats, employee list
 * Client: redirects to Contact screen
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
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

type Employee = {
  id: string;
  name: string;
  title: string;
  department: string;
  status: 'active' | 'on-leave' | 'offboarding';
  type: 'Full-Time' | 'Part-Time' | 'Contractor';
  initials: string;
};

const EMPLOYEES: Employee[] = [
  { id: 'e1',  name: 'Marcus Rivera',    title: 'Head of Engineering',    department: 'Engineering', status: 'active',      type: 'Full-Time',  initials: 'MR' },
  { id: 'e2',  name: 'Priya Nair',       title: 'Senior Engineer',        department: 'Engineering', status: 'active',      type: 'Full-Time',  initials: 'PN' },
  { id: 'e3',  name: 'Devon Brooks',     title: 'Mobile Engineer',        department: 'Engineering', status: 'active',      type: 'Full-Time',  initials: 'DB' },
  { id: 'e4',  name: 'Lena Hoffman',     title: 'Backend Contractor',     department: 'Engineering', status: 'active',      type: 'Contractor', initials: 'LH' },
  { id: 'e5',  name: 'Jordan Kim',       title: 'Head of Product',        department: 'Product',     status: 'active',      type: 'Full-Time',  initials: 'JK' },
  { id: 'e6',  name: 'Aisha Thompson',   title: 'Product Designer',       department: 'Product',     status: 'on-leave',    type: 'Full-Time',  initials: 'AT' },
  { id: 'e7',  name: 'Carlos Mendez',    title: 'Head of Sales',          department: 'Sales',       status: 'active',      type: 'Full-Time',  initials: 'CM' },
  { id: 'e8',  name: 'Simone Delacroix', title: 'Account Executive',      department: 'Sales',       status: 'active',      type: 'Full-Time',  initials: 'SD' },
  { id: 'e9',  name: 'Raj Patel',        title: 'Sales Development Rep',  department: 'Sales',       status: 'active',      type: 'Part-Time',  initials: 'RP' },
  { id: 'e10', name: 'Tamara West',      title: 'Head of Operations',     department: 'Operations',  status: 'active',      type: 'Full-Time',  initials: 'TW' },
  { id: 'e11', name: 'Felix Okonkwo',    title: 'Ops Coordinator',        department: 'Operations',  status: 'offboarding', type: 'Full-Time',  initials: 'FO' },
  { id: 'e12', name: 'Sammy Kalejaiye',  title: 'CEO & Founder',          department: 'Executive',   status: 'active',      type: 'Full-Time',  initials: 'SK' },
];

const FILTERS = ['All', 'Active', 'New Hires', 'Contractors', 'By Department'] as const;
type Filter = typeof FILTERS[number];

const STATUS_COLOR: Record<Employee['status'], string> = {
  active:      GAIN,
  'on-leave':  CAUTION,
  offboarding: HEAT,
};

export default function DirectoryScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business');
  const isCEO = role === roleCycles[0];

  const [query, setQuery]   = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/workforce/contact' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  const filtered = EMPLOYEES.filter(e => {
    const matchQuery = query.length === 0 ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase());

    const matchFilter =
      filter === 'All'           ? true :
      filter === 'Active'        ? e.status === 'active' :
      filter === 'New Hires'     ? e.id === 'e3' || e.id === 'e9' :
      filter === 'Contractors'   ? e.type === 'Contractor' :
      true; // By Department — show all, grouped below

    return matchQuery && matchFilter;
  });

  const activeCount      = EMPLOYEES.filter(e => e.status === 'active').length;
  const contractorCount  = EMPLOYEES.filter(e => e.type === 'Contractor').length;

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
              <Text style={[s.titlePillText, { color: C.label }]}>Directory</Text>
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
        keyboardShouldPersistTaps="handled"
      >

        {/* Search */}
        <View style={[s.searchRow, { marginHorizontal: 16, backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search team..."
            placeholderTextColor={C.secondary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View style={[s.statsRow, { marginHorizontal: 16, marginTop: 12 }]}>
          {[
            { label: 'Total', value: EMPLOYEES.length },
            { label: 'Active', value: activeCount },
            { label: 'Open Roles', value: 3 },
          ].map(stat => (
            <View key={stat.label} style={[s.statCard, { backgroundColor: C.surface }]}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}
        >
          {FILTERS.map(f => (
            <Pressable
              key={f}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }}
              style={[s.filterPill, {
                backgroundColor: filter === f ? C.label : C.surface,
                borderColor: filter === f ? C.label : C.separator,
              }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? C.bg : C.secondary }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Employee list */}
        <View style={{ marginHorizontal: 16 }}>
          {filtered.map((emp, idx) => (
            <Pressable
              key={emp.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(emp.name, `${emp.title} · ${emp.department}\n${emp.type}`);
              }}
            >
              <View style={[s.empRow, {
                borderBottomColor: C.separator,
                borderBottomWidth: idx < filtered.length - 1 ? StyleSheet.hairlineWidth : 0,
                backgroundColor: C.surface,
              }]}>
                <View style={[s.avatar, { backgroundColor: C.separator }]}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{emp.initials}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{emp.name}</Text>
                  <Text style={{ fontSize: 13, color: C.secondary, marginTop: 1 }}>{emp.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{emp.department} · {emp.type}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[emp.status] }]} />
                  <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>

      {/* FAB — Add member */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 72 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Team Member', 'Coming soon'); }}
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
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    searchRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 12, height: 42, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
    },
    searchInput: { flex: 1, fontSize: 15 },
    statsRow:    { flexDirection: 'row', gap: 10 },
    statCard:    { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
    filterPill:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    empRow: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14,
      borderRadius: 0,
    },
    avatar:    { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8,
      elevation: 4,
    },
  });
}
