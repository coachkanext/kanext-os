/**
 * Outreach — Invite (standalone page, Member default, Pastor also accessible).
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Constants ──────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';

// ── Mock data ─────────────────────────────────────────────────────────────────

type InviteStatus = 'Joined' | 'Visited' | 'Invited';

const MY_INVITES: { id: string; name: string; status: InviteStatus; hue: number }[] = [
  { id: 'i1', name: 'Chris Adeyemi',  status: 'Joined',  hue: 120 },
  { id: 'i2', name: 'Dana Morrison',  status: 'Visited', hue: 60  },
  { id: 'i3', name: 'Frank Nwosu',    status: 'Invited', hue: 200 },
];

const UPCOMING_EVENTS = [
  {
    id: 'e1',
    name: 'Community BBQ',
    date: 'Apr 20',
    location: 'Church Grounds',
  },
  {
    id: 'e2',
    name: 'Easter Sunday Drive',
    date: 'Apr 13',
    location: 'Main Auditorium',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusStyle(status: InviteStatus, C: ComponentColors) {
  if (status === 'Joined')  return { bg: GAIN,         text: '#fff'       };
  if (status === 'Visited') return { bg: CAUTION,      text: '#fff'       };
  return                           { bg: C.separator,  text: C.secondary  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OutreachInviteScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const topBarH = insets.top + TOP_BAR_H;

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
      >
        {/* Invite a Friend card */}
        <View style={[s.inviteCard, { backgroundColor: C.surface }]}>
          <Text style={[s.inviteTitle, { color: C.label }]}>Invite a Friend</Text>
          <Text style={[s.inviteDesc, { color: C.secondary }]}>
            Share your personal invite link and track who joins through you
          </Text>

          {/* Share buttons row */}
          <View style={s.shareRow}>
            {(['Text', 'Email', 'Social'] as const).map(method => (
              <Pressable
                key={method}
                style={({ pressed }) => [
                  s.shareBtn,
                  { backgroundColor: C.surface, borderColor: C.separator },
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(`Share via ${method}`, `Opening ${method.toLowerCase()} share…`);
                }}
              >
                <Text style={[s.shareBtnText, { color: C.label }]}>{method}</Text>
              </Pressable>
            ))}
          </View>

          {/* Referral stat row */}
          <View style={s.referralRow}>
            <IconSymbol name="person.2.fill" size={13} color={C.secondary} />
            <Text style={[s.referralText, { color: C.secondary }]}>
              3 people visited through your link
            </Text>
          </View>
        </View>

        {/* My Invites */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>My Invites</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {MY_INVITES.map((inv, idx) => {
            const st = statusStyle(inv.status, C);
            return (
              <View
                key={inv.id}
                style={[
                  s.inviteRow,
                  idx < MY_INVITES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                ]}
              >
                <View style={[s.avatar, { backgroundColor: `hsl(${inv.hue},42%,32%)` }]}>
                  <Text style={s.avatarText}>
                    {inv.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <Text style={[s.inviteeName, { color: C.label }]}>{inv.name}</Text>
                <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                  <Text style={[s.statusBadgeText, { color: st.text }]}>{inv.status}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Upcoming Events */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>Upcoming Events</Text>
        {UPCOMING_EVENTS.map(evt => (
          <View key={evt.id} style={[s.eventCard, { backgroundColor: C.surface }]}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[s.eventName, { color: C.label }]}>{evt.name}</Text>
              <Text style={[s.eventDetail, { color: C.secondary }]}>
                {evt.date} · {evt.location}
              </Text>
            </View>
            <View style={s.eventBtns}>
              <Pressable
                style={({ pressed }) => [
                  s.eventBtn,
                  { backgroundColor: C.label },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('RSVP', `RSVP confirmed for ${evt.name}`);
                }}
              >
                <Text style={[s.eventBtnText, { color: C.bg }]}>RSVP</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  s.eventBtn,
                  { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Volunteer',
                    `Sign up to volunteer for ${evt.name}?`,
                    [{ text: 'Cancel' }, { text: 'Sign Up' }],
                  );
                }}
              >
                <Text style={[s.eventBtnText, { color: C.label }]}>Volunteer</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Top bar — position absolute */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, height: topBarH, backgroundColor: C.bg }]}>
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
            <Text style={[s.titlePillText, { color: C.label }]}>Invite</Text>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:     { flex: 1 },
  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:     { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
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

  inviteCard:  { borderRadius: 14, padding: 16, marginBottom: 20 },
  inviteTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  inviteDesc:  { fontSize: 13, lineHeight: 18, marginBottom: 14, color: '#8A837C' },

  shareRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  shareBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 13, fontWeight: '600' },

  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  referralText: { fontSize: 12 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  card:      { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  avatar:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  inviteeName: { flex: 1, fontSize: 14, fontWeight: '600' },

  statusBadge:     { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },

  eventCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  eventName:   { fontSize: 15, fontWeight: '700' },
  eventDetail: { fontSize: 13 },
  eventBtns:   { flexDirection: 'row', gap: 8, marginTop: 10 },
  eventBtn:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  eventBtnText:{ fontSize: 13, fontWeight: '600' },
});
