/**
 * Outreach — Invite (Member only).
 * Personal invitation tools. Pastor redirects to pipeline.
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
const CAUTION   = '#B8943E';

const INVITE_TEMPLATES = [
  { id: 't1', label: 'Sunday Service',        text: "Hey! I'd love for you to come check out my church this Sunday. It's a great community and I think you'd enjoy it. Let me know if you want to come with me!" },
  { id: 't2', label: 'Easter Sunday',          text: "Easter Sunday is Apr 20 and we're doing something special. Would love for you to join me — it's a great time to visit. Here's my invite link." },
  { id: 't3', label: 'Community Health Fair',  text: "My church is hosting a free community health fair on May 3rd. Free screenings, food, and activities for everyone. Come through!" },
  { id: 't4', label: 'Bible Study',            text: "We have a Bible study on Wed nights that I really love. It's low-pressure and a great group. Would you want to come check it out sometime?" },
];

const MY_INVITES = [
  { id: 'i1', name: 'Kofi Mensah',    inviteDate: 'Apr 8',  status: 'Attended' },
  { id: 'i2', name: 'Tayo Williams',  inviteDate: 'Apr 1',  status: 'Clicked'  },
  { id: 'i3', name: 'Bola Adesanya',  inviteDate: 'Mar 25', status: 'Sent'     },
  { id: 'i4', name: 'Grace Eze',      inviteDate: 'Mar 18', status: 'Returned' },
];

const UPCOMING_EVENTS = [
  { id: 'e1', name: 'Easter Sunday Invite Push', date: 'Apr 20' },
  { id: 'e2', name: 'Harvesters Saturday Outreach', date: 'Apr 19' },
  { id: 'e3', name: 'Bring a Friend Sunday', date: 'Apr 27' },
];

function statusColor(status: string): string {
  if (status === 'Attended' || status === 'Returned') return GAIN;
  if (status === 'Clicked')  return CAUTION;
  return '#9C9790';
}

export default function InviteScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (isPastor) router.replace('/(tabs)/(main)/outreach' as any);
  }, [isPastor, router]));

  if (isPastor) return null;

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
              <Text style={[s.titleText, { color: C.label }]}>Invite</Text>
            </View>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
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

        {/* Personal Invite Link */}
        <View style={[s.linkCard, { backgroundColor: C.surface }]}>
          <Text style={[s.linkTitle, { color: C.label }]}>Your Personal Invite Link</Text>
          <Text style={[s.linkUrl, { color: C.secondary }]}>iccla.church/invite/ola-adebayo</Text>
          <View style={s.linkStats}>
            <View style={s.linkStat}>
              <Text style={[s.linkStatNum, { color: CAUTION }]}>12</Text>
              <Text style={[s.linkStatLbl, { color: C.secondary }]}>Clicked</Text>
            </View>
            <View style={s.linkStat}>
              <Text style={[s.linkStatNum, { color: GAIN }]}>4</Text>
              <Text style={[s.linkStatLbl, { color: C.secondary }]}>Attended</Text>
            </View>
          </View>
          <View style={s.shareRow}>
            <Pressable style={[s.shareBtn, { backgroundColor: C.label }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Share', 'Share your invite link', [{ text: 'Copy Link', onPress: () => {} }, { text: 'Share via Messages', onPress: () => {} }, { text: 'Cancel', style: 'cancel' }]); }}>
              <IconSymbol name="square.and.arrow.up" size={14} color={C.bg} />
              <Text style={[s.shareBtnText, { color: C.bg }]}>Share</Text>
            </Pressable>
            <Pressable style={[s.shareBtn, { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('QR Code', 'Your personal QR code for in-person sharing'); }}>
              <IconSymbol name="qrcode" size={14} color={C.label} />
              <Text style={[s.shareBtnText, { color: C.label }]}>QR Code</Text>
            </Pressable>
          </View>
        </View>

        {/* Invite Templates */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Invite Templates</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginBottom: 24 }]}>
          {INVITE_TEMPLATES.map((t, idx) => (
            <View key={t.id} style={[s.templateRow, idx < INVITE_TEMPLATES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.templateLabel, { color: C.label }]}>{t.label}</Text>
                <Text style={[s.templateText, { color: C.secondary }]} numberOfLines={2}>{t.text}</Text>
              </View>
              <Pressable
                style={[s.copyBtn, { backgroundColor: C.separator }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Copied!', 'Invite message copied to clipboard'); }}
              >
                <Text style={[s.copyBtnText, { color: C.label }]}>Copy</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* My Invites Tracker */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>My Invites</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginBottom: 24 }]}>
          {MY_INVITES.map((inv, idx) => (
            <View key={inv.id} style={[s.inviteRow, idx < MY_INVITES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.inviteName, { color: C.label }]}>{inv.name}</Text>
                <Text style={[s.inviteDate, { color: C.secondary }]}>Invited {inv.inviteDate}</Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: statusColor(inv.status) + '22' }]}>
                <Text style={[s.statusBadgeText, { color: statusColor(inv.status) }]}>{inv.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Upcoming Events to Invite To */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Upcoming Events</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {UPCOMING_EVENTS.map((e, idx) => (
            <View key={e.id} style={[s.eventRow, idx < UPCOMING_EVENTS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.eventName, { color: C.label }]}>{e.name}</Text>
                <Text style={[s.eventDate, { color: C.secondary }]}>{e.date}</Text>
              </View>
              <Pressable
                style={[s.shareEventBtn, { backgroundColor: C.label }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Share Invite', `Share invite for ${e.name}`, [{ text: 'Copy Link', onPress: () => {} }, { text: 'Share', onPress: () => {} }, { text: 'Cancel', style: 'cancel' }]); }}
              >
                <Text style={[s.shareEventBtnText, { color: C.bg }]}>Share Invite</Text>
              </Pressable>
            </View>
          ))}
        </View>

      </ScrollView>
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

  linkCard:     { borderRadius: 14, padding: 16, marginBottom: 24 },
  linkTitle:    { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  linkUrl:      { fontSize: 13, marginBottom: 14 },
  linkStats:    { flexDirection: 'row', gap: 24, marginBottom: 14 },
  linkStat:     { alignItems: 'center' },
  linkStatNum:  { fontSize: 22, fontWeight: '800' },
  linkStatLbl:  { fontSize: 11, marginTop: 2 },
  shareRow:     { flexDirection: 'row', gap: 10 },
  shareBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  shareBtnText: { fontSize: 14, fontWeight: '600' },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },

  card:      { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  templateRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  templateLabel:{ fontSize: 13, fontWeight: '700', marginBottom: 3 },
  templateText: { fontSize: 12, lineHeight: 17 },
  copyBtn:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  copyBtnText:  { fontSize: 12, fontWeight: '600' },

  inviteRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  inviteName:   { fontSize: 14, fontWeight: '600' },
  inviteDate:   { fontSize: 12, marginTop: 2 },
  statusBadge:  { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  eventRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  eventName:        { fontSize: 14, fontWeight: '600' },
  eventDate:        { fontSize: 12, marginTop: 2 },
  shareEventBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  shareEventBtnText:{ fontSize: 12, fontWeight: '700' },
});
