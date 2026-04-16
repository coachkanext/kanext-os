/**
 * Outreach — Events (both roles).
 * Pastor: full event management + FAB.
 * Member: upcoming events + RSVP + Invite a Friend.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
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
const CAUTION   = '#B8943E';

type OutreachEvent = {
  id: string; name: string; date: string; time: string;
  location: string; campaign: string; rsvp: number;
  volunteers: number; volunteersNeeded: number;
  description: string;
};

const EVENTS: OutreachEvent[] = [
  {
    id: 'e1', name: 'Easter Sunday Invite Push',
    date: 'Apr 20, 2026', time: '8:00 AM – 1:00 PM',
    location: 'ICCLA Campus', campaign: 'Easter Sunday Campaign',
    rsvp: 28, volunteers: 12, volunteersNeeded: 15,
    description: 'High-energy Easter service with intentional outreach. Every member encouraged to bring one person.',
  },
  {
    id: 'e2', name: 'Harvesters Saturday Outreach',
    date: 'Apr 19, 2026', time: '8:00 AM – 11:00 AM',
    location: 'Neighborhood Canvass (Meet at church)', campaign: 'Harvesters Saturday Outreach',
    rsvp: 15, volunteers: 8, volunteersNeeded: 10,
    description: 'Weekly door-to-door outreach. Teams of 2-3 go out to invite neighbors and pray with residents.',
  },
  {
    id: 'e3', name: 'Community Health Fair',
    date: 'May 3, 2026', time: '10:00 AM – 3:00 PM',
    location: 'ICCLA Parking Lot', campaign: 'Spring Outreach Series',
    rsvp: 45, volunteers: 18, volunteersNeeded: 25,
    description: 'Free health screenings, food, and activities. Community-facing event with connect card stations.',
  },
  {
    id: 'e4', name: 'Bring a Friend Sunday',
    date: 'Apr 27, 2026', time: '10:00 AM Service',
    location: 'ICCLA Main Auditorium', campaign: 'Bring a Friend Sunday',
    rsvp: 34, volunteers: 10, volunteersNeeded: 10,
    description: 'Dedicated Sunday designed for guests. Hospitality team on full deployment.',
  },
];

export default function OutreachEventsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

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
              <Text style={[s.titleText, { color: C.label }]}>Events</Text>
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
        {EVENTS.map(e => (
          <Pressable
            key={e.id}
            style={({ pressed }) => [s.eventCard, { backgroundColor: C.surface }, pressed && { opacity: 0.88 }]}
            onPress={() => {
              if (isPastor) {
                Alert.alert(e.name, `${e.date}\n${e.time}\n${e.location}\n\nCampaign: ${e.campaign}\nRSVPs: ${e.rsvp}\nVolunteers: ${e.volunteers}/${e.volunteersNeeded}\n\n${e.description}`, [
                  { text: 'Edit', onPress: () => {} },
                  { text: 'Close', style: 'cancel' },
                ]);
              }
            }}
          >
            <Text style={[s.eventName, { color: C.label }]}>{e.name}</Text>
            <Text style={[s.eventMeta, { color: C.secondary }]}>{e.date} · {e.time}</Text>
            <Text style={[s.eventMeta, { color: C.secondary }]}>{e.location}</Text>
            <Text style={[s.eventDesc, { color: C.secondary }]} numberOfLines={2}>{e.description}</Text>

            {isPastor ? (
              <View style={s.pastorStats}>
                <View style={s.statChip}>
                  <Text style={[s.statNum, { color: CAUTION }]}>{e.rsvp}</Text>
                  <Text style={[s.statLbl, { color: C.secondary }]}>RSVPs</Text>
                </View>
                <View style={s.statChip}>
                  <Text style={[s.statNum, { color: e.volunteers >= e.volunteersNeeded ? GAIN : CAUTION }]}>{e.volunteers}/{e.volunteersNeeded}</Text>
                  <Text style={[s.statLbl, { color: C.secondary }]}>Volunteers</Text>
                </View>
                <View style={[s.campaignTag, { backgroundColor: C.separator }]}>
                  <Text style={[s.campaignTagText, { color: C.secondary }]} numberOfLines={1}>{e.campaign}</Text>
                </View>
              </View>
            ) : (
              <View style={s.memberActions}>
                <Pressable
                  style={[s.rsvpBtn, { backgroundColor: C.label }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('RSVP', `RSVP for ${e.name}?`, [{ text: 'Cancel' }, { text: 'Confirm' }]); }}
                >
                  <Text style={[s.rsvpBtnText, { color: C.bg }]}>RSVP</Text>
                </Pressable>
                <Pressable
                  style={[s.inviteBtn, { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Invite a Friend', `Share your personal invite link for ${e.name}`, [{ text: 'Copy Link', onPress: () => {} }, { text: 'Share', onPress: () => {} }, { text: 'Cancel', style: 'cancel' }]); }}
                >
                  <IconSymbol name="square.and.arrow.up" size={14} color={C.label} />
                  <Text style={[s.inviteBtnText, { color: C.label }]}>Invite a Friend</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {isPastor && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Event', 'Create a new outreach event?', [{ text: 'Cancel' }, { text: 'Create' }]); }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}
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

  eventCard: { borderRadius: 14, padding: 16, marginBottom: 12 },
  eventName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  eventMeta: { fontSize: 12, marginBottom: 2 },
  eventDesc: { fontSize: 13, lineHeight: 18, marginTop: 6, marginBottom: 12 },

  pastorStats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statChip:    { alignItems: 'center' },
  statNum:     { fontSize: 17, fontWeight: '800' },
  statLbl:     { fontSize: 10, marginTop: 1 },
  campaignTag: { flex: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  campaignTagText: { fontSize: 11, fontWeight: '500' },

  memberActions: { flexDirection: 'row', gap: 10 },
  rsvpBtn:       { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  rsvpBtnText:   { fontSize: 13, fontWeight: '700' },
  inviteBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10 },
  inviteBtnText: { fontSize: 13, fontWeight: '600' },

  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
