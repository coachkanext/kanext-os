/**
 * Donors — Pastor only.
 * Redirects Member to give/index in useFocusEffect.
 * Insights row, filter pills, search bar, donor list with giving history on tap.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useScrollHeader } from '@/hooks/use-scroll-header';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const TOP_BAR_H = 52;

const FILTER_PILLS = ['All', 'Active', 'Lapsed', 'First-Time', 'Top Givers'];

const DONORS = [
  { name: 'Marcus Johnson',  ytd: 3600, lastGift: 'Apr 9',  freq: 'Weekly',     trend: 'up'   },
  { name: 'Aisha Williams',  ytd: 2400, lastGift: 'Apr 9',  freq: 'Monthly',    trend: 'up'   },
  { name: 'David Chen',      ytd: 6000, lastGift: 'Apr 8',  freq: 'Monthly',    trend: 'up'   },
  { name: 'Sarah Thompson',  ytd: 900,  lastGift: 'Apr 8',  freq: 'Occasional', trend: 'down' },
  { name: 'James Okafor',    ytd: 1200, lastGift: 'Apr 7',  freq: 'Monthly',    trend: 'up'   },
  { name: 'Linda Pearson',   ytd: 450,  lastGift: 'Feb 14', freq: 'One-Time',   trend: 'down' },
];

export default function DonorsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/give' as any);
    }
  }, [isPastor]));

  function showDonorHistory(donor: typeof DONORS[0]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      donor.name,
      `YTD Given: $${donor.ytd.toLocaleString()}\nLast Gift: ${donor.lastGift}\nFrequency: ${donor.freq}\nTrend: ${donor.trend === 'up' ? 'Increasing' : 'Declining'}\n\nSample History:\nApr 9 — $300 · General / Tithe\nMar 9 — $300 · General / Tithe\nFeb 9 — $250 · Missions`,
      [{ text: 'Close', style: 'cancel' }],
    );
  }

  const filtered = DONORS.filter(d => {
    if (search) return d.name.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return d.freq !== 'One-Time';
    if (activeFilter === 'Lapsed') return d.trend === 'down';
    if (activeFilter === 'First-Time') return d.freq === 'One-Time';
    if (activeFilter === 'Top Givers') return d.ytd >= 2400;
    return true;
  });

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Donors</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Insights row */}
        <View style={[s.insightsRow, { backgroundColor: C.surface }]}>
          {[
            { label: 'Active Donors', value: '234' },
            { label: 'New This Month', value: '12' },
            { label: 'Lapsed', value: '18' },
            { label: 'Avg Gift', value: '$121' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <View style={s.insightCell}>
                <Text style={[s.insightValue, { color: C.label }]}>{item.value}</Text>
                <Text style={[s.insightLabel, { color: C.secondary }]}>{item.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={[s.insightDivider, { backgroundColor: C.separator }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search donors..."
            placeholderTextColor={C.secondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {FILTER_PILLS.map(pill => (
            <Pressable
              key={pill}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(pill); }}
              style={[
                s.filterPill,
                {
                  backgroundColor: activeFilter === pill ? C.label : C.surface,
                  borderColor: activeFilter === pill ? C.label : C.separator,
                },
              ]}
            >
              <Text style={[s.filterPillText, { color: activeFilter === pill ? C.bg : C.secondary }]}>
                {pill}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Donor list */}
        <View style={[s.listCard, { backgroundColor: C.surface }]}>
          {filtered.map((d, i) => (
            <Pressable
              key={d.name}
              style={({ pressed }) => [
                s.donorRow,
                pressed && { backgroundColor: C.bg },
                i < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
              onPress={() => showDonorHistory(d)}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.donorName, { color: C.label }]}>{d.name}</Text>
                <Text style={[s.donorMeta, { color: C.secondary }]}>Last gift: {d.lastGift}</Text>
              </View>
              <View style={s.donorRight}>
                <Text style={[s.donorYtd, { color: GAIN }]}>${d.ytd.toLocaleString()}</Text>
                <View style={[s.freqBadge, { borderColor: C.separator }]}>
                  <Text style={[s.freqText, { color: C.secondary }]}>{d.freq}</Text>
                </View>
                <Text style={{ fontSize: 14, color: d.trend === 'up' ? GAIN : HEAT }}>
                  {d.trend === 'up' ? '↑' : '↓'}
                </Text>
              </View>
            </Pressable>
          ))}
          {filtered.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={[s.donorMeta, { color: C.secondary }]}>No donors match this filter.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    insightsRow:   { borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
    insightCell:   { flex: 1, alignItems: 'center' },
    insightValue:  { fontSize: 17, fontWeight: '700' },
    insightLabel:  { fontSize: 10, marginTop: 2, textAlign: 'center' },
    insightDivider:{ width: StyleSheet.hairlineWidth, height: 32 },

    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
    },
    searchInput: { flex: 1, fontSize: 14 },

    filterPill:     { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
    filterPillText: { fontSize: 13, fontWeight: '500' },

    listCard:  { borderRadius: 12, overflow: 'hidden' },
    donorRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    donorName: { fontSize: 14, fontWeight: '600' },
    donorMeta: { fontSize: 12 },
    donorRight:{ alignItems: 'flex-end', gap: 4 },
    donorYtd:  { fontSize: 15, fontWeight: '700' },
    freqBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
    freqText:  { fontSize: 10 },
  });
}
