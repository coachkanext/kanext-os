/**
 * Booster — Campaigns (Coach only)
 * Fundraising campaigns: progress, tiers, donors, status.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }    from '@/components/ui/icon-symbol';
import { KMenuButton }   from '@/components/ui/k-menu-button';
import { RolePill }      from '@/components/ui/role-pill';
import { GlassView }     from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel }  from '@/utils/global-side-panel';
import { resetFooter }    from '@/utils/global-footer-hide';
import { useDemoRole }    from '@/utils/demo-role-store';
import { BOOSTER_CAMPAIGNS, type Campaign, type CampaignStatus } from '@/data/mock-sports-hub';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

// Supplement mock data with additional campaigns
const LOCAL_CAMPAIGNS: Campaign[] = [
  { id: 'bc4', name: '2026-27 Scholarship Fund',   goal: 60000,  raised: 14200,  donors: 82,  status: 'active',    deadline: 'Jun 30',  desc: 'Provide scholarship funding for incoming student-athletes joining the program next season.', fundId: 'scholarship' },
  { id: 'bc5', name: '2026-27 Travel Fund',         goal: 22000,  raised: 11660,  donors: 106, status: 'active',    deadline: 'Jun 1',   desc: 'Cover road travel and lodging expenses for the full 2026-27 season schedule.', fundId: 'travel' },
  { id: 'bc6', name: 'Scoreboard Upgrade',          goal: 45000,  raised: 45000,  donors: 312, status: 'completed', deadline: 'Mar 15',  desc: 'New LED scoreboard at Laney College. Fully funded — thank you to our boosters!', fundId: 'facilities' },
];

const ALL_CAMPAIGNS = [...BOOSTER_CAMPAIGNS, ...LOCAL_CAMPAIGNS];

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active:    'Active',
  completed: 'Funded',
  upcoming:  'Upcoming',
};
const STATUS_COLOR: Record<CampaignStatus, string> = {
  active:    GAIN,
  completed: CAUTION,
  upcoming:  '#8A837C',
};

export default function CampaignsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('sports:booster');
  const isCoach = role === roleCycles[0];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCoach) router.replace('/(tabs)/(main)/booster/my-nil' as any);
  }, [isCoach, router]);

  if (!isCoach) return null;

  const active    = ALL_CAMPAIGNS.filter(c => c.status === 'active').length;
  const completed = ALL_CAMPAIGNS.filter(c => c.status === 'completed').length;
  const totalRaised = ALL_CAMPAIGNS.reduce((sum, c) => sum + c.raised, 0);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Campaigns</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Summary stats */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 20 }]}>
          {[
            { label: 'Total Raised', value: `$${(totalRaised / 1000).toFixed(1)}K`, color: GAIN },
            { label: 'Active',       value: `${active}`,                            color: C.label },
            { label: 'Completed',    value: `${completed}`,                         color: C.label },
          ].map(stat => (
            <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Campaign cards */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {ALL_CAMPAIGNS.map(campaign => {
            const pct     = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
            const isOpen  = expandedId === campaign.id;
            const sColor  = STATUS_COLOR[campaign.status];

            return (
              <GlassView key={campaign.id} tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
                {/* Header row */}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedId(isOpen ? null : campaign.id);
                  }}
                  style={({ pressed }) => [
                    { paddingVertical: 14, paddingHorizontal: 14, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={[s.row, { marginBottom: 8 }]}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }} numberOfLines={1}>{campaign.name}</Text>
                    <View style={[s.statusPill, { backgroundColor: sColor + '18', borderColor: sColor + '60', marginLeft: 8 }]}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: sColor }}>{STATUS_LABEL[campaign.status]}</Text>
                    </View>
                    <IconSymbol name={isOpen ? 'chevron.up' : 'chevron.down'} size={13} color={C.secondary} style={{ marginLeft: 8 }} />
                  </View>

                  {/* Progress bar */}
                  <View style={[s.progressTrack, { backgroundColor: C.separator, marginBottom: 8 }]}>
                    <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: campaign.status === 'completed' ? CAUTION : GAIN }]} />
                  </View>

                  {/* Amount + pct */}
                  <View style={[s.row, { justifyContent: 'space-between' }]}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: GAIN }}>${campaign.raised.toLocaleString()} raised</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{pct}% of ${(campaign.goal / 1000).toFixed(0)}K goal</Text>
                  </View>
                </Pressable>

                {/* Expanded details */}
                {isOpen && (
                  <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}>
                    {/* Description */}
                    <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                      <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>{campaign.desc}</Text>
                    </View>

                    {/* Meta row */}
                    <View style={[s.row, { paddingHorizontal: 14, paddingBottom: 12, gap: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: C.secondary, marginBottom: 2 }}>DONORS</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{campaign.donors}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: C.secondary, marginBottom: 2 }}>DEADLINE</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{campaign.deadline}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: C.secondary, marginBottom: 2 }}>GOAL</Text>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>${campaign.goal.toLocaleString()}</Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={[s.row, { paddingHorizontal: 14, paddingBottom: 14, gap: 10 }]}>
                      <Pressable
                        style={({ pressed }) => [s.actionBtn, { backgroundColor: C.surface, borderColor: C.separator, flex: 1, opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Edit Campaign', `Editing "${campaign.name}" — coming soon`); }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [s.actionBtn, { backgroundColor: C.surface, borderColor: C.separator, flex: 1, opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Share Campaign', `Share link for "${campaign.name}" — coming soon`); }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Share</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </GlassView>
            );
          })}
        </View>

        {/* Create FAB */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Pressable
            style={({ pressed }) => [s.fab, { backgroundColor: C.label, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Campaign', 'Campaign builder — coming soon'); }}
          >
            <IconSymbol name="plus" size={18} color={C.bg} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg, marginLeft: 8 }}>New Campaign</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    statCard:      { alignItems: 'center', padding: 12, borderRadius: 12 },
    statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
    progressFill:  { height: 5, borderRadius: 3 },
    actionBtn:     { height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: StyleSheet.hairlineWidth },
    fab:           { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  });
}
