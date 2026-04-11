/**
 * Campaigns — role-aware.
 * Pastor: Active + Past campaigns with detail tap, + Create Campaign FAB.
 * Member: Browse active campaigns with "Give to This Campaign" CTA.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN = '#5A8A6E';
const TOP_BAR_H = 52;

const ACTIVE_CAMPAIGNS = [
  {
    name: 'Annual Fund',
    goal: 125000, raised: 91200, pct: 73,
    givers: 187, start: 'Jan 1, 2026', end: 'Dec 31, 2026',
    description: 'Supports our annual operating budget and ministry programs.',
  },
  {
    name: 'Capital Campaign',
    goal: 165000, raised: 68000, pct: 41,
    givers: 94, start: 'Feb 15, 2026', end: 'Dec 31, 2026',
    description: 'Funding the renovation of our main sanctuary and fellowship hall.',
  },
  {
    name: 'Missions Fund',
    goal: 60000, raised: 41300, pct: 69,
    givers: 112, start: 'Jan 1, 2026', end: 'Jun 30, 2026',
    description: 'Supports our global and local missionary partnerships.',
  },
];

const PAST_CAMPAIGNS = [
  {
    name: 'Christmas Offering 2025',
    goal: 40000, raised: 43200, pct: 108,
    givers: 221, start: 'Dec 1, 2025', end: 'Dec 31, 2025',
  },
  {
    name: 'Summer Youth Camp',
    goal: 15000, raised: 15000, pct: 100,
    givers: 67, start: 'May 1, 2025', end: 'Jul 15, 2025',
  },
];

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

export default function CampaignsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  function showCampaignDetail(campaign: typeof ACTIVE_CAMPAIGNS[0]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      campaign.name,
      `Goal: ${fmt(campaign.goal)}\nRaised: ${fmt(campaign.raised)} (${campaign.pct}%)\nGivers: ${campaign.givers}\nPeriod: ${campaign.start} – ${campaign.end}${campaign.description ? '\n\n' + campaign.description : ''}`,
      [{ text: 'Close', style: 'cancel' }],
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>Campaigns</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Campaigns */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Active Campaigns</Text>
        {ACTIVE_CAMPAIGNS.map((c, i) => (
          <Pressable
            key={c.name}
            style={({ pressed }) => [s.card, { backgroundColor: C.surface, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => showCampaignDetail(c)}
          >
            <View style={s.campaignHeader}>
              <Text style={[s.campaignName, { color: C.label }]}>{c.name}</Text>
              <Text style={[s.campaignPct, { color: C.secondary }]}>{c.pct}%</Text>
            </View>
            <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
              <View style={[s.progressFill, { backgroundColor: C.label, width: `${Math.min(100, c.pct)}%` }]} />
            </View>
            <View style={s.campaignMeta}>
              <Text style={[s.metaText, { color: C.secondary }]}>{fmt(c.raised)} raised of {fmt(c.goal)}</Text>
              <Text style={[s.metaText, { color: C.secondary }]}>{c.givers} givers</Text>
            </View>
            {isPastor && (
              <Text style={[s.dateRange, { color: C.secondary }]}>{c.start} – {c.end}</Text>
            )}
            {!isPastor && c.description && (
              <Text style={[s.description, { color: C.secondary }]} numberOfLines={2}>{c.description}</Text>
            )}
            {!isPastor && (
              <Pressable
                style={[s.giveBtn, { backgroundColor: C.label }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert('Give to Campaign', `You're giving to: ${c.name}\n\nThis will open the giving form.`, [{ text: 'OK' }]);
                }}
              >
                <Text style={[s.giveBtnText, { color: C.bg }]}>Give to This Campaign</Text>
              </Pressable>
            )}
          </Pressable>
        ))}

        {/* Past Campaigns (Pastor only) */}
        {isPastor && (
          <>
            <Text style={[s.sectionHeader, { color: C.secondary }]}>Past Campaigns</Text>
            {PAST_CAMPAIGNS.map(c => (
              <Pressable
                key={c.name}
                style={({ pressed }) => [s.card, { backgroundColor: C.surface, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => showCampaignDetail(c)}
              >
                <View style={s.campaignHeader}>
                  <Text style={[s.campaignName, { color: C.label }]}>{c.name}</Text>
                  <View style={[s.completedBadge, { backgroundColor: GAIN + '22', borderColor: GAIN + '44' }]}>
                    <Text style={[s.completedText, { color: GAIN }]}>Completed</Text>
                  </View>
                </View>
                <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                  <View style={[s.progressFill, { backgroundColor: GAIN, width: `${Math.min(100, c.pct)}%` }]} />
                </View>
                <View style={s.campaignMeta}>
                  <Text style={[s.metaText, { color: C.secondary }]}>{fmt(c.raised)} raised of {fmt(c.goal)} ({c.pct}%)</Text>
                  <Text style={[s.metaText, { color: C.secondary }]}>{c.givers} givers</Text>
                </View>
                <Text style={[s.dateRange, { color: C.secondary }]}>{c.start} – {c.end}</Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      {/* FAB — Pastor only */}
      {isPastor && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 64 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Create Campaign', 'Campaign creation form coming soon.', [{ text: 'OK' }]);
          }}
        >
          <IconSymbol name="plus" size={20} color={C.bg} />
          <Text style={[s.fabLabel, { color: C.bg }]}>Create Campaign</Text>
        </Pressable>
      )}
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 },
    card:          { borderRadius: 12, padding: 16, gap: 8 },
    campaignHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    campaignName:  { fontSize: 15, fontWeight: '700', flex: 1 },
    campaignPct:   { fontSize: 15, fontWeight: '600' },

    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill:  { height: 6, borderRadius: 3 },

    campaignMeta:  { flexDirection: 'row', justifyContent: 'space-between' },
    metaText:      { fontSize: 12 },
    dateRange:     { fontSize: 12 },
    description:   { fontSize: 13 },

    completedBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
    completedText:  { fontSize: 11, fontWeight: '600' },

    giveBtn:     { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
    giveBtnText: { fontSize: 14, fontWeight: '700' },

    fab: {
      position: 'absolute', right: 20,
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingVertical: 12, paddingHorizontal: 18,
      borderRadius: 24, elevation: 4,
      shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    },
    fabLabel: { fontSize: 14, fontWeight: '700' },
  });
}
