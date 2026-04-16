/**
 * Outreach — Campaigns (Pastor only).
 */

import React, { useCallback, useMemo } from 'react';
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

type CampaignStatus = 'Active' | 'Planned' | 'Completed' | 'Recurring';

type Campaign = {
  id: string; name: string; status: CampaignStatus;
  dateRange: string; leads: number; conversions: number;
  description: string; targetAudience: string; type: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: 'c1', name: 'Spring Block Party', status: 'Completed',
    dateRange: 'Mar 15, 2026', leads: 15, conversions: 5,
    description: '120 attendees from the neighborhood. Connect cards collected at the welcome table. Follow-up calls assigned to The Harvesters team.',
    targetAudience: 'Local community within 1 mile', type: 'Event',
  },
  {
    id: 'c2', name: 'Bring a Friend Sunday', status: 'Active',
    dateRange: 'Apr 13 – Apr 27, 2026', leads: 8, conversions: 2,
    description: '45 invites sent by members. 8 guests attended. Personalized follow-up in progress.',
    targetAudience: 'Friends and family of current members', type: 'Invite',
  },
  {
    id: 'c3', name: 'Harvesters Saturday Outreach', status: 'Recurring',
    dateRange: 'Every Saturday', leads: 4, conversions: 1,
    description: 'Weekly neighborhood canvassing by The Harvesters ministry. Door-to-door invitations and prayer in the community.',
    targetAudience: 'Surrounding neighborhood', type: 'Community Service',
  },
  {
    id: 'c4', name: 'Easter Sunday Campaign', status: 'Planned',
    dateRange: 'Apr 20, 2026', leads: 0, conversions: 0,
    description: 'High-visibility push for Easter Sunday. Digital ads, member invites, and community flyers.',
    targetAudience: 'Unchurched community broadly', type: 'Digital + Event',
  },
];

function statusColor(s: CampaignStatus): string {
  if (s === 'Active')    return GAIN;
  if (s === 'Planned')   return CAUTION;
  if (s === 'Recurring') return '#9C9790';
  return '#9C9790';
}

export default function CampaignsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) router.replace('/(tabs)/(main)/outreach/invite' as any);
  }, [isPastor, router]));

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
              <Text style={[s.titleText, { color: C.label }]}>Campaigns</Text>
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {CAMPAIGNS.map((c, idx) => (
          <Pressable
            key={c.id}
            style={({ pressed }) => [s.campaignCard, { backgroundColor: C.surface }, pressed && { opacity: 0.88 }]}
            onPress={() => Alert.alert(c.name, `Type: ${c.type}\nTarget: ${c.targetAudience}\nDates: ${c.dateRange}\nLeads: ${c.leads}  Conversions: ${c.conversions}\n\n${c.description}`, [
              { text: 'Edit', onPress: () => {} },
              { text: 'Close', style: 'cancel' },
            ])}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <Text style={[s.campaignName, { color: C.label, flex: 1, marginRight: 10 }]} numberOfLines={1}>{c.name}</Text>
              <View style={[s.statusPill, { backgroundColor: statusColor(c.status) + '22', borderColor: statusColor(c.status) + '55' }]}>
                <Text style={[s.statusPillText, { color: statusColor(c.status) }]}>{c.status}</Text>
              </View>
            </View>
            <Text style={[s.campaignDate, { color: C.secondary }]}>{c.dateRange} · {c.type}</Text>
            <Text style={[s.campaignDesc, { color: C.secondary }]} numberOfLines={2}>{c.description}</Text>
            <View style={s.metricsRow}>
              <View style={s.metricChip}>
                <Text style={[s.metricNum, { color: CAUTION }]}>{c.leads}</Text>
                <Text style={[s.metricLbl, { color: C.secondary }]}>Leads</Text>
              </View>
              <View style={s.metricChip}>
                <Text style={[s.metricNum, { color: GAIN }]}>{c.conversions}</Text>
                <Text style={[s.metricLbl, { color: C.secondary }]}>Converted</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Campaign', 'Create a new outreach campaign?', [{ text: 'Cancel' }, { text: 'Create' }]); }}
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

  campaignCard: { borderRadius: 14, padding: 16, marginBottom: 12 },
  campaignName: { fontSize: 15, fontWeight: '700' },
  campaignDate: { fontSize: 12, marginBottom: 6 },
  campaignDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },

  statusPill:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusPillText: { fontSize: 10, fontWeight: '700' },

  metricsRow: { flexDirection: 'row', gap: 12 },
  metricChip: { alignItems: 'center' },
  metricNum:  { fontSize: 18, fontWeight: '800' },
  metricLbl:  { fontSize: 10, marginTop: 1 },

  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
