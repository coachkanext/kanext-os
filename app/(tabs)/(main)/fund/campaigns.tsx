/**
 * Fund — Campaigns (President only).
 * Active and past campaigns with progress bars, tap for detail, FAB to create.
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

type CampaignStatus = 'Active' | 'Planned' | 'Completed';
type Campaign = {
  id: string; name: string; goal: number; raised: number;
  status: CampaignStatus; dateRange: string; description: string;
  audience: string; fund: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: '1', name: 'Annual Fund 2025–26', goal: 500_000, raised: 320_000,
    status: 'Active', dateRange: 'Jul 2025 – Jun 2026',
    description: 'Our cornerstone campaign supporting unrestricted operating needs across all programs, faculty, and student services.',
    audience: 'All alumni, parents, and community supporters', fund: 'General Fund',
  },
  {
    id: '2', name: 'Oaklanders Athletic Scholarship Endowment', goal: 1_000_000, raised: 180_000,
    status: 'Active', dateRange: 'Jan 2025 – Dec 2027 (Multi-Year)',
    description: 'Building a permanent endowment to fund full athletic scholarships for Lincoln student-athletes in perpetuity.',
    audience: 'Major donors, alumni athletes, Oakland community', fund: 'Scholarship Fund',
  },
  {
    id: '3', name: 'New Diagnostic Imaging Lab Equipment', goal: 250_000, raised: 95_000,
    status: 'Active', dateRange: 'Sep 2025 – Jun 2026',
    description: 'Capital campaign to purchase state-of-the-art imaging equipment for the Diagnostic Imaging program — the only HBCU offering this degree.',
    audience: 'Healthcare industry partners, foundations, alumni', fund: 'Diagnostic Imaging Fund',
  },
  {
    id: '4', name: 'Class of 2025 Senior Gift', goal: 10_000, raised: 6_500,
    status: 'Completed', dateRange: 'Jan 2025 – May 2025',
    description: 'The Class of 2025\'s collective legacy gift, designated to the General Scholarship Fund.',
    audience: 'Class of 2025 seniors', fund: 'Scholarship Fund',
  },
  {
    id: '5', name: 'Giving Tuesday 2025', goal: 40_000, raised: 45_000,
    status: 'Completed', dateRange: 'Dec 3, 2025',
    description: '24-hour giving day. Exceeded goal with 847 unique donors — a Lincoln record.',
    audience: 'All supporters', fund: 'General Fund',
  },
  {
    id: '6', name: 'Summer Enrichment Fund 2026', goal: 30_000, raised: 0,
    status: 'Planned', dateRange: 'Apr 2026 – Aug 2026',
    description: 'Funding stipends for students who participate in summer internship and research programs.',
    audience: 'Alumni, faculty, corporate partners', fund: 'General Fund',
  },
];

const STATUS_COLOR: Record<CampaignStatus, string> = {
  Active:    GAIN,
  Planned:   CAUTION,
  Completed: '#9C9790',
};

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n}`;

export default function CampaignsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:fund');
  const isPresident = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPresident) router.replace('/(tabs)/(main)/fund/scholarships' as any);
  }, [isPresident, router]));

  if (!isPresident) return null;

  const active    = CAMPAIGNS.filter(c => c.status === 'Active');
  const other     = CAMPAIGNS.filter(c => c.status !== 'Active');

  const openDetail = (c: Campaign) => {
    const pct = c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 100;
    Alert.alert(c.name,
      `Status: ${c.status}\nGoal: ${fmt(c.goal)}\nRaised: ${fmt(c.raised)} (${pct}%)\nFund: ${c.fund}\nDates: ${c.dateRange}\n\n${c.description}\n\nAudience: ${c.audience}`,
      [
        { text: 'Edit Goal', onPress: () => {} },
        { text: 'Extend Deadline', onPress: () => {} },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

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
              <Text style={[s.titleText, { color: C.label }]}>Campaigns</Text>
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
        {/* Stats row */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <View style={[s.statsRow, { backgroundColor: C.surface }]}>
            {[
              { label: 'Active',    value: String(active.length),    color: GAIN    },
              { label: 'Planned',   value: String(CAMPAIGNS.filter(c => c.status === 'Planned').length),   color: CAUTION },
              { label: 'Completed', value: String(CAMPAIGNS.filter(c => c.status === 'Completed').length), color: C.secondary },
            ].map((st, idx, arr) => (
              <View key={st.label} style={[s.statCol, idx < arr.length - 1 && [s.statBorder, { borderRightColor: C.separator }]]}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: st.color }}>{st.value}</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Active campaigns */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Active Campaigns ({active.length})</Text>
          {active.map(c => {
            const pct = Math.round((c.raised / c.goal) * 100);
            return (
              <Pressable key={c.id} style={[s.campaignCard, { backgroundColor: C.surface }]} onPress={() => openDetail(c)}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1, marginRight: 10 }}>{c.name}</Text>
                  <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[c.status] + '22', borderColor: STATUS_COLOR[c.status] }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: STATUS_COLOR[c.status] }}>{c.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{fmt(c.raised)}</Text>
                  <Text style={{ fontSize: 14, color: C.secondary, alignSelf: 'flex-end' }}>of {fmt(c.goal)}</Text>
                </View>
                <View style={{ height: 5, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                  <View style={{ height: 5, width: `${Math.min(100, pct)}%` as any, backgroundColor: pct >= 100 ? GAIN : C.label, borderRadius: 3 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{c.dateRange}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: pct >= 80 ? GAIN : C.secondary }}>{pct}% to goal</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Planned + Completed */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>All Campaigns</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {other.map((c, idx) => {
              const pct = c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 100;
              return (
                <Pressable
                  key={c.id}
                  style={[s.row, idx < other.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => openDetail(c)}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1 }}>{c.name}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{fmt(c.raised)} raised · {c.dateRange}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[s.statusBadge, { backgroundColor: STATUS_COLOR[c.status] + '22', borderColor: STATUS_COLOR[c.status] }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: STATUS_COLOR[c.status] }}>{c.status.toUpperCase()}</Text>
                    </View>
                    {c.status === 'Completed' && (
                      <Text style={{ fontSize: 12, fontWeight: '600', color: pct >= 100 ? GAIN : C.secondary }}>{pct}%</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 64 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('New Campaign', 'Create a new fundraising campaign:\n\nName · Description · Goal · Donation Tiers · Dates · Fund Designation · Target Audience');
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
  campaignCard: { borderRadius: 14, padding: 16, marginBottom: 10 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
  statsRow:     { flexDirection: 'row', borderRadius: 14, overflow: 'hidden' },
  statCol:      { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder:   { borderRightWidth: StyleSheet.hairlineWidth },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, flexShrink: 0 },
  fab:          { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 4 },
});
