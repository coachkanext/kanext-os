/**
 * Members & Roles — Settings detail screen.
 * Owner view: member list, pending invites, invite options, bulk import.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

type MemberStatus = 'active' | 'inactive';
type Member = {
  id: string; initials: string; name: string; handle: string;
  role: string; joined: string; active: string; status: MemberStatus;
};
type PendingInvite = { id: string; email: string; sentDate: string };

const MEMBERS: Member[] = [
  { id: 'm1', initials: 'MT', name: 'Marcus Thompson',  handle: '@marcust',    role: 'Subscriber', joined: 'Mar 2024', active: '2h ago',   status: 'active'   },
  { id: 'm2', initials: 'AB', name: 'Aaliyah Brooks',   handle: '@aaliyahb',   role: 'Subscriber', joined: 'Feb 2024', active: '1d ago',   status: 'active'   },
  { id: 'm3', initials: 'DM', name: 'DeShawn Miller',   handle: '@deshawn_m',  role: 'Subscriber', joined: 'Jan 2024', active: '3d ago',   status: 'active'   },
  { id: 'm4', initials: 'PS', name: 'Priya Sharma',     handle: '@priyasfit',  role: 'Subscriber', joined: 'Apr 2024', active: '5h ago',   status: 'active'   },
  { id: 'm5', initials: 'JH', name: 'Jordan Hayes',     handle: '@j_hayes23',  role: 'Subscriber', joined: 'Dec 2023', active: '1wk ago',  status: 'inactive' },
];

const PENDING_INVITES: PendingInvite[] = [
  { id: 'pi1', email: 'coach.brown@gmail.com',    sentDate: 'Apr 4, 2024' },
  { id: 'pi2', email: 'nadia.clarke@outlook.com', sentDate: 'Apr 2, 2024' },
];

const INVITE_OPTIONS = [
  { icon: 'at',                 label: 'By Handle'         },
  { icon: 'envelope.fill',      label: 'By Email'          },
  { icon: 'phone.fill',         label: 'By Phone Number'   },
  { icon: 'link',               label: 'Share Invite Link' },
  { icon: 'qrcode',             label: 'QR Code'           },
  { icon: 'number',             label: 'Brand Code'        },
] as const;

export default function MembersSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [search, setSearch] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return MEMBERS;
    const q = search.trim().toLowerCase();
    return MEMBERS.filter(m => m.name.toLowerCase().includes(q) || m.handle.toLowerCase().includes(q));
  }, [search]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.pillText, { color: C.label }]}>Members &amp; Roles</Text>
            </View>
          </View>
          <View style={s.topBarBtn} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── STATS + INVITE ─────────────────────────────────────────────── */}
        <GlassView tier={1} style={[s.statsCard]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>1,247 members</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>Personal Brand</Text>
            </View>
            <Pressable
              onPress={() => haptic()}
              style={[s.inviteBtn, { backgroundColor: C.label }]}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>+ Invite</Text>
            </Pressable>
          </View>
        </GlassView>

        {/* ── SEARCH BAR ─────────────────────────────────────────────────── */}
        <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: C.label }}
            value={search}
            onChangeText={setSearch}
            placeholder="Search members…"
            placeholderTextColor={C.muted}
          />
        </View>

        {/* ── MEMBERS ────────────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>MEMBERS</Text>
        <GlassView tier={1} style={s.card}>
          {filteredMembers.map((member, idx) => (
            <Pressable
              key={member.id}
              onPress={() => haptic()}
              style={({ pressed }) => [
                s.memberRow,
                { backgroundColor: pressed ? C.bg : C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              {/* Avatar */}
              <View style={[s.avatar, { backgroundColor: C.bg, borderColor: C.separator }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>{member.initials}</Text>
              </View>

              {/* Name + meta */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{member.name}</Text>
                  <View style={[s.roleBadge, { backgroundColor: C.bg, borderColor: C.separator }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary }}>{member.role}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                  {member.handle} · joined {member.joined} · {member.active}
                </Text>
              </View>

              {/* Inactive badge */}
              {member.status === 'inactive' && (
                <View style={[s.inactiveBadge, { backgroundColor: CAUTION + '22' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: CAUTION }}>Inactive</Text>
                </View>
              )}

              <IconSymbol name="chevron.right" size={13} color={C.muted} />
            </Pressable>
          ))}

          {/* View all row */}
          <Pressable
            onPress={() => haptic()}
            style={({ pressed }) => [
              s.memberRow,
              { backgroundColor: pressed ? C.bg : C.surface },
              { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
            ]}
          >
            <Text style={{ flex: 1, fontSize: 13, color: C.secondary }}>View all 1,247 members</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>

        {/* ── PENDING INVITES ────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>PENDING INVITES</Text>
        <GlassView tier={1} style={s.card}>
          {PENDING_INVITES.map((invite, idx) => (
            <View
              key={invite.id}
              style={[
                s.inviteRow,
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <IconSymbol name="envelope.fill" size={16} color={C.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: C.label }}>{invite.email}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Sent {invite.sentDate}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={() => haptic()}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Resend</Text>
                </Pressable>
                <Pressable onPress={() => haptic()}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: HEAT }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </GlassView>

        {/* ── INVITE OPTIONS ─────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>INVITE OPTIONS</Text>
        <GlassView tier={1} style={s.card}>
          {INVITE_OPTIONS.map((opt, idx) => (
            <Pressable
              key={opt.label}
              onPress={() => haptic()}
              style={({ pressed }) => [
                s.optionRow,
                { backgroundColor: pressed ? C.bg : C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <IconSymbol name={opt.icon as any} size={18} color={C.secondary} />
              <Text style={{ flex: 1, fontSize: 15, color: C.label }}>{opt.label}</Text>
              <IconSymbol name="chevron.right" size={13} color={C.muted} />
            </Pressable>
          ))}
        </GlassView>

        {/* ── BULK IMPORT ────────────────────────────────────────────────── */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BULK IMPORT</Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={() => haptic()}
            style={({ pressed }) => [s.optionRow, { backgroundColor: pressed ? C.bg : C.surface }]}
          >
            <IconSymbol name="arrow.up.doc.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: C.label }}>Upload CSV</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Invite up to 500 members at once</Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </GlassView>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, paddingBottom: 6, height: TOP_BAR_H,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:      { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    pillText:  { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase', paddingHorizontal: 16,
      marginBottom: 6, marginTop: 24,
    },
    card: { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },

    statsCard: { borderRadius: 12, padding: 16, marginTop: 16, marginHorizontal: 16 },
    inviteBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },

    searchBar: {
      marginHorizontal: 16, marginTop: 12,
      borderRadius: 10, borderWidth: 1,
      flexDirection: 'row', alignItems: 'center',
      gap: 8, paddingHorizontal: 12, height: 40,
    },

    memberRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 14, paddingVertical: 11,
    },
    avatar: {
      width: 36, height: 36, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, flexShrink: 0,
    },
    roleBadge: {
      paddingHorizontal: 7, paddingVertical: 2,
      borderRadius: 5, borderWidth: 1,
    },
    inactiveBadge: {
      borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    },

    inviteRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 12,
      backgroundColor: C.surface,
    },

    optionRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 14,
    },
  });
}
