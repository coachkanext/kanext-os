/**
 * Fund — Donors (President only).
 * Donor directory and relationship management. Search, filter, donor detail.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, Animated, Alert,
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

type DonorType = 'Alumni' | 'Corporate' | 'Foundation' | 'Individual';
type DonorTrend = 'up' | 'down' | 'flat';
type Donor = {
  id: string; name: string; type: DonorType;
  lifetime: number; lastGift: string; lastGiftDate: string;
  frequency: string; trend: DonorTrend; lapsed?: boolean; isMajor?: boolean;
  initials: string; classYear?: string;
};

const DONORS: Donor[] = [
  { id: '1',  name: 'Dr. Theodore Brodsky',         initials: 'TB', type: 'Individual',  lifetime: 28_500, lastGift: '$10,000', lastGiftDate: 'Apr 15',   frequency: 'Annual',   trend: 'up',   isMajor: true  },
  { id: '2',  name: 'Oakland Community Foundation', initials: 'OC', type: 'Foundation',  lifetime: 75_000, lastGift: '$25,000', lastGiftDate: 'Apr 12',   frequency: 'Annual',   trend: 'up',   isMajor: true  },
  { id: '3',  name: 'BioMedical Tech Solutions',    initials: 'BT', type: 'Corporate',   lifetime: 45_000, lastGift: '$8,500',  lastGiftDate: 'Apr 10',   frequency: 'Annual',   trend: 'flat' },
  { id: '4',  name: 'Patricia Hayes',               initials: 'PH', type: 'Individual',  lifetime: 18_000, lastGift: '$5,000',  lastGiftDate: 'Jan 14',   frequency: 'Annual',   trend: 'down', isMajor: true, lapsed: true },
  { id: '5',  name: 'HBCU Collegiate Foundation',  initials: 'HC', type: 'Foundation',  lifetime: 30_000, lastGift: '$15,000', lastGiftDate: 'Mar 2',    frequency: 'Biennial', trend: 'up',   isMajor: true  },
  { id: '6',  name: 'Golden State Diagnostics',     initials: 'GS', type: 'Corporate',   lifetime: 22_000, lastGift: '$12,000', lastGiftDate: 'Feb 20',   frequency: 'Annual',   trend: 'up' },
  { id: '7',  name: 'DeShawn Coleman',              initials: 'DC', type: 'Alumni',      lifetime: 8_000,  lastGift: '$1,000',  lastGiftDate: 'Apr 1',    frequency: 'Monthly',  trend: 'up',   classYear: "'15" },
  { id: '8',  name: 'East Bay Commerce Group',      initials: 'EB', type: 'Corporate',   lifetime: 12_000, lastGift: '$3,000',  lastGiftDate: 'Apr 3',    frequency: 'Annual',   trend: 'flat' },
  { id: '9',  name: 'Dr. Amara Osei',               initials: 'AO', type: 'Individual',  lifetime: 4_000,  lastGift: '$2,000',  lastGiftDate: 'Dec 2025', frequency: 'Annual',   trend: 'flat' },
  { id: '10', name: 'Linda Richardson',              initials: 'LR', type: 'Alumni',      lifetime: 5_000,  lastGift: '$1,500',  lastGiftDate: 'Mar 25',   frequency: 'Annual',   trend: 'flat', classYear: "'08" },
  { id: '11', name: 'First Community Bank of Oakland', initials: 'FC', type: 'Corporate', lifetime: 8_500, lastGift: '$8,500',  lastGiftDate: 'Apr 8',    frequency: 'One-time', trend: 'flat' },
  { id: '12', name: 'Laolu Kalejaiye',               initials: 'LK', type: 'Alumni',      lifetime: 3_250,  lastGift: '$250',    lastGiftDate: 'Apr 8',    frequency: 'Monthly',  trend: 'up',   classYear: "'22" },
  { id: '13', name: 'Jennifer Park',                 initials: 'JP', type: 'Individual',  lifetime: 2_500,  lastGift: '$500',    lastGiftDate: 'Mar 10',   frequency: 'Annual',   trend: 'flat' },
  { id: '14', name: 'Marcus Webb',                   initials: 'MW', type: 'Alumni',      lifetime: 1_500,  lastGift: '$500',    lastGiftDate: 'Mar 28',   frequency: 'Annual',   trend: 'flat', classYear: "'19" },
  { id: '15', name: 'Jordan Williams',               initials: 'JW', type: 'Alumni',      lifetime: 100,    lastGift: '$100',    lastGiftDate: 'Apr 16',   frequency: 'One-time', trend: 'flat', classYear: "'24" },
];

type FilterKey = 'all' | 'Alumni' | 'Corporate' | 'Foundation' | 'Individual' | 'major' | 'lapsed' | 'new';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'Alumni',     label: 'Alumni' },
  { key: 'Corporate',  label: 'Corporate' },
  { key: 'Foundation', label: 'Foundation' },
  { key: 'Individual', label: 'Individual' },
  { key: 'major',      label: 'Major ($10K+)' },
  { key: 'lapsed',     label: 'Lapsed' },
  { key: 'new',        label: 'New' },
];

const TREND_ICON: Record<DonorTrend, string> = { up: 'arrow.up', down: 'arrow.down', flat: 'minus' };
const TREND_COLOR: Record<DonorTrend, string> = { up: GAIN, down: HEAT, flat: '#9C9790' };
const TYPE_COLOR: Record<DonorType, string> = {
  Alumni: '#1A2E4A', Corporate: '#1E3A28', Foundation: '#3A2E1A', Individual: '#3A1A2E',
};

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n}`;

export default function DonorsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:fund');
  const isPresident = role === roleCycles[0];
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPresident) router.replace('/(tabs)/(main)/fund/scholarships' as any);
  }, [isPresident, router]));

  if (!isPresident) return null;

  const filtered = useMemo(() => {
    let list = DONORS;
    if (filter === 'major')  list = list.filter(d => d.isMajor);
    else if (filter === 'lapsed') list = list.filter(d => d.lapsed);
    else if (filter === 'new') list = list.filter(d => d.classYear === "'24" || d.lastGiftDate.includes('Apr 16'));
    else if (filter !== 'all') list = list.filter(d => d.type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.lifetime - a.lifetime);
  }, [filter, query]);

  const totalLifetime = DONORS.reduce((a, d) => a + d.lifetime, 0);

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
              <Text style={[s.titleText, { color: C.label }]}>Donors</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Stats */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <View style={[s.statsRow, { backgroundColor: C.surface }]}>
            {[
              { label: 'Total Donors', value: String(DONORS.length) },
              { label: 'Major ($10K+)', value: String(DONORS.filter(d => d.isMajor).length), color: GAIN },
              { label: 'Lifetime',     value: fmt(totalLifetime) },
            ].map((st, idx, arr) => (
              <View key={st.label} style={[s.statCol, idx < arr.length - 1 && [s.statBorder, { borderRightColor: C.separator }]]}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: st.color ?? C.label }}>{st.value}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Search */}
        <View style={[s.searchRow, { backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 10 }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            value={query} onChangeText={setQuery}
            placeholder="Search donors..." placeholderTextColor={C.secondary}
            style={[{ flex: 1, fontSize: 15, color: C.label }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {FILTERS.map(f => (
            <Pressable key={f.key} onPress={() => { setFilter(f.key); Haptics.selectionAsync(); }}
              style={[s.filterPill, { backgroundColor: filter === f.key ? C.label : C.surface, borderColor: C.separator }]}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f.key ? C.bg : C.secondary }}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Donor list */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>
            {filtered.length === DONORS.length ? `All Donors (${filtered.length})` : `${filtered.length} Result${filtered.length !== 1 ? 's' : ''}`}
          </Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {filtered.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: C.secondary }}>No donors match this filter.</Text>
              </View>
            ) : filtered.map((d, idx) => (
              <Pressable
                key={d.id}
                style={[s.row, idx < filtered.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                onPress={() => Alert.alert(d.name,
                  `Type: ${d.type}${d.classYear ? ` · Class ${d.classYear}` : ''}\nLifetime giving: ${fmt(d.lifetime)}\nLast gift: ${d.lastGift} on ${d.lastGiftDate}\nFrequency: ${d.frequency}${d.lapsed ? '\n⚠️ LAPSED' : ''}`,
                  [
                    { text: 'Call', onPress: () => {} },
                    { text: 'Message', onPress: () => {} },
                    { text: 'Log Interaction', onPress: () => {} },
                    { text: 'Close', style: 'cancel' },
                  ]
                )}
              >
                <View style={[s.initials, { backgroundColor: TYPE_COLOR[d.type] + '22' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: TYPE_COLOR[d.type] }}>{d.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{d.name}</Text>
                    {d.lapsed && <IconSymbol name="exclamationmark.circle.fill" size={13} color={HEAT} />}
                    {d.isMajor && !d.lapsed && <IconSymbol name="star.fill" size={11} color={CAUTION} />}
                  </View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>
                    {d.type}{d.classYear ? ` '${d.classYear.replace("'", '')}` : ''} · {d.frequency} · Last: {d.lastGiftDate}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{fmt(d.lifetime)}</Text>
                  <IconSymbol name={TREND_ICON[d.trend] as any} size={13} color={TREND_COLOR[d.trend]} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Dr. Brodsky Society callout */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={[s.societyCard, { backgroundColor: '#3A2E1A', }]}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#F0E8DC', marginBottom: 4 }}>Dr. Brodsky Society</Text>
            <Text style={{ fontSize: 12, color: '#F0E8DC' + 'BB', lineHeight: 18 }}>
              Donors with $25,000+ in lifetime giving. {DONORS.filter(d => d.lifetime >= 25_000).length} member{DONORS.filter(d => d.lifetime >= 25_000).length !== 1 ? 's' : ''} currently.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },
  sectionLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:        { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:   { borderBottomWidth: StyleSheet.hairlineWidth },
  statsRow:    { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', marginBottom: 0 },
  statCol:     { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder:  { borderRightWidth: StyleSheet.hairlineWidth },
  searchRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  filterPill:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, flexShrink: 0 },
  initials:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  societyCard: { borderRadius: 14, padding: 16 },
});
