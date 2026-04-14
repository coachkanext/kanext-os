/**
 * Outreach — Campaigns (Pastor only).
 * Member redirects to outreach/index.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Animated } from 'react-native';
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

// ── Constants ──────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';

// ── Mock data ─────────────────────────────────────────────────────────────────

const ACTIVE_CAMPAIGNS = [
  {
    id: 'c1',
    name: 'Easter Community Outreach',
    type: 'Community Event',
    status: 'Active',
    dateRange: 'Apr 10–20',
    reach: '2,400',
    engagements: '380',
    firstVisits: '42',
  },
  {
    id: 'c2',
    name: 'Social Media Spring Push',
    type: 'Digital',
    status: 'Active',
    dateRange: 'Apr 1–30',
    reach: '8,100',
    engagements: '620',
    firstVisits: '18',
  },
  {
    id: 'c3',
    name: 'Neighborhood Door Canvass',
    type: 'Door-to-Door',
    status: 'Planning',
    dateRange: 'Apr 25–26',
    reach: '—',
    engagements: '—',
    firstVisits: '—',
  },
];

const PAST_CAMPAIGNS = [
  {
    id: 'c4',
    name: 'New Year Community Launch',
    type: 'Community Event',
    status: 'Completed',
    dateRange: 'Jan 1–15',
    reach: '1,800',
    engagements: '245',
    firstVisits: '29',
  },
  {
    id: 'c5',
    name: 'Winter Warmth Drive',
    type: 'Community Event',
    status: 'Completed',
    dateRange: 'Dec 1–31',
    reach: '950',
    engagements: '140',
    firstVisits: '17',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusColor(status: string): string {
  if (status === 'Active')    return GAIN;
  if (status === 'Planning')  return CAUTION;
  return '#8A837C';
}

function statusTextColor(status: string): string {
  if (status === 'Completed') return '#8A837C';
  return '#fff';
}

type Campaign = typeof ACTIVE_CAMPAIGNS[0];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CampaignsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  const [search, setSearch] = useState('');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/outreach' as any);
    }
  }, [isPastor, router]));

  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  if (!isPastor) return null;

  const filterCampaigns = (list: Campaign[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q));
  };

  const renderCampaignCard = (c: Campaign, isLast: boolean) => (
    <Pressable
      key={c.id}
      style={({ pressed }) => [
        s.campaignCard,
        { backgroundColor: C.surface },
        !isLast && { marginBottom: 12 },
        isLast && { marginBottom: 0 },
        pressed && { opacity: 0.85 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
          c.name,
          `Type: ${c.type}\nStatus: ${c.status}\nDate: ${c.dateRange}\nReach: ${c.reach}\nEngagements: ${c.engagements}\nFirst Visits: ${c.firstVisits}`,
          [{ text: 'OK' }],
        );
      }}
    >
      {/* Header row */}
      <View style={s.campaignHeader}>
        <Text style={[s.campaignName, { color: C.label }]} numberOfLines={2}>{c.name}</Text>
        <View style={[s.statusBadge, { backgroundColor: statusColor(c.status) }]}>
          <Text style={[s.statusBadgeText, { color: statusTextColor(c.status) }]}>{c.status}</Text>
        </View>
      </View>

      {/* Type badge + date */}
      <View style={s.campaignMeta}>
        <View style={[s.typeBadge, { backgroundColor: C.separator }]}>
          <Text style={[s.typeBadgeText, { color: C.label }]}>{c.type}</Text>
        </View>
        <Text style={[s.dateText, { color: C.secondary }]}>{c.dateRange}</Text>
      </View>

      {/* Metrics row */}
      <View style={[s.metricsRow, { borderTopColor: C.separator }]}>
        <View style={s.metricItem}>
          <IconSymbol name="person.fill" size={12} color={C.secondary} />
          <Text style={[s.metricValue, { color: C.label }]}>{c.reach}</Text>
          <Text style={[s.metricLabel, { color: C.secondary }]}>Reach</Text>
        </View>
        <View style={[s.metricDivider, { backgroundColor: C.separator }]} />
        <View style={s.metricItem}>
          <IconSymbol name="hand.tap.fill" size={12} color={C.secondary} />
          <Text style={[s.metricValue, { color: C.label }]}>{c.engagements}</Text>
          <Text style={[s.metricLabel, { color: C.secondary }]}>Engagements</Text>
        </View>
        <View style={[s.metricDivider, { backgroundColor: C.separator }]} />
        <View style={s.metricItem}>
          <IconSymbol name="figure.walk" size={12} color={C.secondary} />
          <Text style={[s.metricValue, { color: C.label }]}>{c.firstVisits}</Text>
          <Text style={[s.metricLabel, { color: C.secondary }]}>First Visits</Text>
        </View>
      </View>
    </Pressable>
  );

  const filteredActive = filterCampaigns(ACTIVE_CAMPAIGNS);
  const filteredPast   = filterCampaigns(PAST_CAMPAIGNS);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topBarH + 12,
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Search bar */}
        <View style={[s.searchBar, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search campaigns..."
            placeholderTextColor={C.secondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Active Campaigns */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>Active Campaigns</Text>
        {filteredActive.length > 0
          ? filteredActive.map((c, idx) => renderCampaignCard(c, idx === filteredActive.length - 1))
          : (
            <View style={[s.emptyState, { backgroundColor: C.surface }]}>
              <Text style={[s.emptyText, { color: C.secondary }]}>No campaigns match your search</Text>
            </View>
          )
        }

        {/* Thin separator */}
        <View style={[s.divider, { backgroundColor: C.separator }]} />

        {/* Past Campaigns */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>Past Campaigns</Text>
        {filteredPast.length > 0
          ? filteredPast.map((c, idx) => renderCampaignCard(c, idx === filteredPast.length - 1))
          : (
            <View style={[s.emptyState, { backgroundColor: C.surface }]}>
              <Text style={[s.emptyText, { color: C.secondary }]}>No past campaigns match your search</Text>
            </View>
          )
        }

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Top bar — position absolute */}
      <Animated.View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openSidePanel();
              }}
              hitSlop={12}
            >
              <KMenuButton />
            </Pressable>
          </View>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titlePillText, { color: C.label }]}>Campaigns</Text>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      {/* FAB — Create Campaign */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('Create Campaign', 'Open campaign creation form?', [
            { text: 'Cancel' },
            { text: 'Create' },
          ]);
        }}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:     { flex: 1 },
  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:     { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 80, justifyContent: 'center' },
  titlePill: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  titlePillText: { fontSize: 13, fontWeight: '700' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 14 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 20 },

  campaignCard:   { borderRadius: 14, padding: 16 },
  campaignHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  campaignName:   { flex: 1, fontSize: 15, fontWeight: '700' },
  statusBadge:    { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText:{ fontSize: 11, fontWeight: '700' },

  campaignMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  typeBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeText:{ fontSize: 11, fontWeight: '600' },
  dateText:     { fontSize: 12 },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metricItem:    { flex: 1, alignItems: 'center', gap: 3 },
  metricValue:   { fontSize: 15, fontWeight: '700' },
  metricLabel:   { fontSize: 10 },
  metricDivider: { width: StyleSheet.hairlineWidth, height: 28 },

  emptyState: { borderRadius: 14, padding: 20, alignItems: 'center' },
  emptyText:  { fontSize: 13 },

  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});
