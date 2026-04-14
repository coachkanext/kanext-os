/**
 * Group Detail — members, schedule, recent activity, and join/leave.
 * Navigated to by tapping a GroupCard in the community hub.
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { COMMUNITY_GROUPS } from '@/data/mock-community-hub';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;

const MOCK_GROUP_MEMBERS: Record<string, { name: string; role: string; initials: string }[]> = {
  grp1: [
    { name: 'Pastor Marcus Davis', role: 'Group Leader', initials: 'MD' },
    { name: 'Sammy Johnson', role: 'Member', initials: 'SJ' },
    { name: 'Andre Jackson', role: 'Member', initials: 'AJ' },
    { name: 'Kevin Park', role: 'Member', initials: 'KP' },
    { name: 'Isaiah Thomas', role: 'Member', initials: 'IT' },
  ],
  grp2: [
    { name: 'Deacon Keisha Williams', role: 'Group Leader', initials: 'KW' },
    { name: 'Priya Nair', role: 'Co-Leader', initials: 'PN' },
    { name: 'Jade Williams', role: 'Member', initials: 'JW' },
    { name: 'Fatima Diallo', role: 'Member', initials: 'FD' },
    { name: 'Hannah Lee', role: 'Member', initials: 'HL' },
  ],
  grp3: [
    { name: 'Nia Sanders', role: 'Group Leader', initials: 'NS' },
    { name: 'Tyler Brooks', role: 'Member', initials: 'TB' },
    { name: 'Dominic Reyes', role: 'Member', initials: 'DR' },
    { name: 'Alicia Moore', role: 'Member', initials: 'AM' },
    { name: 'Rosa Martinez', role: 'Member', initials: 'RM' },
  ],
  grp4: [
    { name: 'Elder Robert Chen', role: 'Group Leader', initials: 'RC' },
    { name: 'Samuel Okonkwo', role: 'Member', initials: 'SO' },
    { name: 'Claire Thompson', role: 'Member', initials: 'CT' },
    { name: 'Nathan Obi', role: 'Member', initials: 'NO' },
  ],
  grp5: [
    { name: 'Jordan Williams', role: 'Group Leader', initials: 'JW' },
    { name: 'Sophia Grant', role: 'Member', initials: 'SG' },
    { name: 'Marcus Thompson', role: 'Member', initials: 'MT' },
    { name: 'Amara Osei', role: 'Member', initials: 'AO' },
  ],
};

const MOCK_ACTIVITY = [
  { id: 'a1', text: 'New discussion post added', time: '2h ago', icon: 'bubble.left' },
  { id: 'a2', text: 'Meeting notes from last week shared', time: '3d ago', icon: 'doc.text' },
  { id: 'a3', text: 'Next session topic announced', time: '5d ago', icon: 'megaphone' },
];

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const group = COMMUNITY_GROUPS.find(g => g.id === id);
  if (!group) return null;

  const fillPct   = group.memberCount / group.capacity;
  const isFull    = group.memberCount >= group.capacity;
  const isPaused  = group.status === 'paused';
  const isNew     = group.status === 'new';
  const barColor  = fillPct >= 0.9 ? C.red : C.accent;
  const members   = MOCK_GROUP_MEMBERS[group.id] ?? MOCK_GROUP_MEMBERS['grp1'];

  return (
    <View style={[ds.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[ds.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={ds.topBar}>
          <KMenuButton onPress={openSidePanel} />
          <Text style={[ds.topBarTitle, { color: C.label }]} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={{ width: 44 }} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Hero */}
        <View style={ds.hero}>
          <View style={[ds.heroIcon, { backgroundColor: `hsl(${group.hue},42%,28%)` }]}>
            <Text style={ds.heroInitials}>{group.leaderInitials}</Text>
          </View>
          <Text style={[ds.heroName, { color: C.label }]}>{group.name}</Text>
          <Text style={[ds.heroSub, { color: C.secondary }]}>
            {group.leaderName} · {group.departmentName}
          </Text>
          <View style={[ds.meetingPill, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="calendar" size={12} color={C.muted} />
            <Text style={[ds.meetingText, { color: C.secondary }]}>{group.schedule} · {group.frequency}</Text>
          </View>
          {(isPaused || isNew) && (
            <View style={[
              ds.statusPill,
              { backgroundColor: isPaused ? C.surfacePressed : '#5A8A6E22' },
            ]}>
              <Text style={[ds.statusText, { color: isPaused ? C.muted : '#5A8A6E' }]}>
                {isPaused ? 'Temporarily Paused' : 'New Group'}
              </Text>
            </View>
          )}
        </View>

        {/* Capacity */}
        <View style={[ds.card, { backgroundColor: C.surface }]}>
          <View style={ds.capRow}>
            <Text style={[ds.capLabel, { color: C.secondary }]}>
              {group.memberCount}/{group.capacity} members
            </Text>
            <Text style={[ds.capPct, { color: isFull ? C.red : C.accent }]}>
              {isFull ? 'Full' : `${group.capacity - group.memberCount} spots open`}
            </Text>
          </View>
          <View style={[ds.capTrack, { backgroundColor: C.separator }]}>
            <View style={[ds.capFill, {
              width: `${Math.min(100, fillPct * 100)}%` as any,
              backgroundColor: barColor,
            }]} />
          </View>
        </View>

        {/* About */}
        <View style={[ds.card, { backgroundColor: C.surface }]}>
          <Text style={[ds.cardText, { color: C.secondary }]}>{group.description}</Text>
        </View>

        {/* Join / Message */}
        <View style={ds.actionRow}>
          {!isFull && !isPaused ? (
            <Pressable
              style={[ds.actionBtn, { backgroundColor: C.accent, flex: 2 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="person.badge.plus" size={16} color="#fff" />
              <Text style={ds.actionBtnTextWhite}>Join Group</Text>
            </Pressable>
          ) : (
            <View style={[ds.actionBtn, { backgroundColor: C.surfacePressed, flex: 2 }]}>
              <Text style={[ds.actionBtnTextMuted, { color: C.muted }]}>
                {isPaused ? 'Group Paused' : 'Group Full'}
              </Text>
            </View>
          )}
          <Pressable
            style={[ds.actionBtn, { borderWidth: 1.5, borderColor: C.separator, flex: 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/(main)/messages' as any);
            }}
          >
            <IconSymbol name="bubble.left" size={16} color={C.secondary} />
            <Text style={[ds.actionBtnTextMuted, { color: C.secondary }]}>Room</Text>
          </Pressable>
        </View>

        {/* Members */}
        <Text style={[ds.sectionTitle, { color: C.label }]}>Members</Text>
        <View style={[ds.card, { backgroundColor: C.surface }]}>
          {members.map((m, idx) => (
            <View
              key={m.name}
              style={[
                ds.memberRow,
                idx < members.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={[ds.avatar, { backgroundColor: `hsl(${group.hue},38%,82%)` }]}>
                <Text style={[ds.avatarText, { color: `hsl(${group.hue},42%,28%)` }]}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[ds.memberName, { color: C.label }]}>{m.name}</Text>
                <Text style={[ds.memberRole, { color: C.secondary }]}>{m.role}</Text>
              </View>
            </View>
          ))}
          {group.memberCount > members.length && (
            <Text style={[ds.viewAll, { color: C.accent }]}>
              +{group.memberCount - members.length} more members
            </Text>
          )}
        </View>

        {/* Recent Activity */}
        <Text style={[ds.sectionTitle, { color: C.label }]}>Recent Activity</Text>
        <View style={[ds.card, { backgroundColor: C.surface }]}>
          {MOCK_ACTIVITY.map((item, idx) => (
            <View
              key={item.id}
              style={[
                ds.actRow,
                idx < MOCK_ACTIVITY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <IconSymbol name={item.icon as any} size={16} color={C.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[ds.actText, { color: C.label }]}>{item.text}</Text>
                <Text style={[ds.actTime, { color: C.muted }]}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const ds = StyleSheet.create({
  screen:       { flex: 1 },

  topBarOuter:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn:      { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  topBarTitle:  { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },

  hero:         { alignItems: 'center', paddingTop: 20, paddingBottom: 24, gap: 6 },
  heroIcon:     { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroInitials: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroName:     { fontSize: 22, fontWeight: '800' },
  heroSub:      { fontSize: 14 },
  meetingPill:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginTop: 2 },
  meetingText:  { fontSize: 12 },
  statusPill:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusText:   { fontSize: 12, fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  card:         { borderRadius: 16, padding: 16, marginBottom: 20 },
  cardText:     { fontSize: 14, lineHeight: 21 },

  capRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  capLabel:     { fontSize: 13 },
  capPct:       { fontSize: 13, fontWeight: '700' },
  capTrack:     { height: 5, borderRadius: 3, overflow: 'hidden' },
  capFill:      { height: 5, borderRadius: 3 },

  actionRow:    { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12 },
  actionBtnTextWhite: { fontSize: 14, fontWeight: '700', color: '#fff' },
  actionBtnTextMuted: { fontSize: 14, fontWeight: '600' },

  memberRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  avatar:       { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 13, fontWeight: '700' },
  memberName:   { fontSize: 14, fontWeight: '600' },
  memberRole:   { fontSize: 12 },
  viewAll:      { fontSize: 13, fontWeight: '600', textAlign: 'center', paddingTop: 10 },

  actRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 11 },
  actText:      { fontSize: 13 },
  actTime:      { fontSize: 11, marginTop: 2 },
});
