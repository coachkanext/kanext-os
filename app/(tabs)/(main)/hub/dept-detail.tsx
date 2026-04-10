/**
 * Department Detail — roster, schedule, volunteer needs, resources.
 * Navigated to by tapping a DepartmentCard in the community hub.
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { COMMUNITY_DEPARTMENTS } from '@/data/mock-community-hub';
import { resetFooter } from '@/utils/global-footer-hide';

const MOCK_MEMBERS: Record<string, { name: string; role: string; initials: string }[]> = {
  dep1: [
    { name: 'Elder Robert Chen', role: 'Leader', initials: 'RC' },
    { name: 'Amara Osei', role: 'Music Director', initials: 'AO' },
    { name: 'Tyler Brooks', role: 'Sound Engineer', initials: 'TB' },
    { name: 'Priya Nair', role: 'Media / Slides', initials: 'PN' },
    { name: 'Dominic Reyes', role: 'Vocalist', initials: 'DR' },
  ],
  dep2: [
    { name: 'Nia Sanders', role: 'Leader', initials: 'NS' },
    { name: 'Marcus Thompson', role: 'Co-Leader', initials: 'MT' },
    { name: 'Jade Williams', role: 'Youth Mentor', initials: 'JW' },
    { name: 'Kevin Park', role: 'Van Driver', initials: 'KP' },
    { name: 'Alicia Moore', role: 'Youth Mentor', initials: 'AM' },
  ],
  dep3: [
    { name: 'Jordan Williams', role: 'Leader', initials: 'JW' },
    { name: 'Sophia Grant', role: 'Greeter Coordinator', initials: 'SG' },
    { name: 'Isaiah Thomas', role: 'Event Setup', initials: 'IT' },
    { name: 'Fatima Diallo', role: 'Greeter', initials: 'FD' },
  ],
  dep4: [
    { name: 'Deacon Keisha Williams', role: 'Leader', initials: 'KW' },
    { name: 'Samuel Okonkwo', role: 'Food Pantry Lead', initials: 'SO' },
    { name: 'Rosa Martinez', role: 'Community Liaison', initials: 'RM' },
    { name: 'Andre Jackson', role: 'Volunteer', initials: 'AJ' },
  ],
  dep5: [
    { name: 'Pastor Marcus Davis', role: 'Leader', initials: 'MD' },
    { name: 'Claire Thompson', role: 'Curriculum Coordinator', initials: 'CT' },
    { name: 'Nathan Obi', role: 'Group Facilitator', initials: 'NO' },
    { name: 'Hannah Lee', role: 'Group Facilitator', initials: 'HL' },
  ],
};

const MOCK_RESOURCES = [
  { name: 'Department Handbook', icon: 'doc.text.fill' },
  { name: 'Training Materials', icon: 'graduationcap.fill' },
  { name: 'Communication Channel', icon: 'bubble.left.and.bubble.right.fill' },
  { name: 'Shared Documents', icon: 'folder.fill' },
];

export default function DeptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const dept = COMMUNITY_DEPARTMENTS.find(d => d.id === id);
  if (!dept) return null;

  const totalNeeded = dept.volunteerNeeds.reduce((s, n) => s + n.needed, 0);
  const totalFilled = dept.volunteerNeeds.reduce((s, n) => s + n.filled, 0);
  const fillPct = totalNeeded > 0 ? Math.min(1, totalFilled / totalNeeded) : 1;
  const members = MOCK_MEMBERS[dept.id] ?? MOCK_MEMBERS['dep1'];

  return (
    <View style={[ds.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 52, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Hero */}
        <View style={ds.hero}>
          <View style={[ds.heroIcon, { backgroundColor: `hsl(${dept.hue},42%,28%)` }]}>
            <IconSymbol name={dept.icon as any} size={28} color="#fff" />
          </View>
          <Text style={[ds.heroName, { color: C.label }]}>{dept.name}</Text>
          <Text style={[ds.heroSub, { color: C.secondary }]}>
            {dept.leaderName} · {dept.memberCount} members
          </Text>
          <View style={[ds.meetingPill, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="calendar" size={12} color={C.muted} />
            <Text style={[ds.meetingText, { color: C.secondary }]}>{dept.nextMeeting}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={[ds.card, { backgroundColor: C.surface }]}>
          <Text style={[ds.cardText, { color: C.secondary }]}>{dept.description}</Text>
        </View>

        {/* Volunteer Needs */}
        <Text style={[ds.sectionTitle, { color: C.label }]}>Volunteer Needs</Text>
        <View style={[ds.card, { backgroundColor: C.surface }]}>
          <View style={ds.volBar}>
            <View style={[ds.volBarTrack, { backgroundColor: C.separator }]}>
              <View
                style={[ds.volBarFill, {
                  width: `${fillPct * 100}%` as any,
                  backgroundColor: fillPct < 1 ? C.accent : '#5A8A6E',
                }]}
              />
            </View>
            <Text style={[ds.volBarLabel, { color: C.secondary }]}>
              {totalFilled}/{totalNeeded} filled
            </Text>
          </View>
          {dept.volunteerNeeds.map((vn, idx) => (
            <View
              key={vn.role}
              style={[
                ds.volRow,
                idx < dept.volunteerNeeds.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <Text style={[ds.volRole, { color: C.label }]}>{vn.role}</Text>
              <Text style={[ds.volCount, { color: vn.filled < vn.needed ? C.accent : '#5A8A6E' }]}>
                {vn.filled}/{vn.needed} filled
              </Text>
            </View>
          ))}
          <Pressable
            style={[ds.volunteerBtn, { backgroundColor: C.accent }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="hands.and.sparkles" size={16} color="#fff" />
            <Text style={ds.volunteerBtnText}>Volunteer for This Department</Text>
          </Pressable>
        </View>

        {/* Roster */}
        <Text style={[ds.sectionTitle, { color: C.label }]}>Roster</Text>
        <View style={[ds.card, { backgroundColor: C.surface }]}>
          {members.map((m, idx) => (
            <View
              key={m.name}
              style={[
                ds.memberRow,
                idx < members.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={[ds.avatar, { backgroundColor: `hsl(${dept.hue},38%,82%)` }]}>
                <Text style={[ds.avatarText, { color: `hsl(${dept.hue},42%,28%)` }]}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[ds.memberName, { color: C.label }]}>{m.name}</Text>
                <Text style={[ds.memberRole, { color: C.secondary }]}>{m.role}</Text>
              </View>
            </View>
          ))}
          {dept.memberCount > members.length && (
            <Text style={[ds.viewAll, { color: C.accent }]}>
              +{dept.memberCount - members.length} more members
            </Text>
          )}
        </View>

        {/* Resources */}
        <Text style={[ds.sectionTitle, { color: C.label }]}>Resources</Text>
        <View style={[ds.card, { backgroundColor: C.surface }]}>
          {MOCK_RESOURCES.map((r, idx) => (
            <Pressable
              key={r.name}
              style={[
                ds.resourceRow,
                idx < MOCK_RESOURCES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={r.icon as any} size={16} color={C.accent} />
              <Text style={[ds.resourceName, { color: C.label }]}>{r.name}</Text>
              <IconSymbol name="chevron.right" size={12} color={C.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Top bar */}
      <View style={[ds.topBar, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={ds.topBarInner}>
          <KMenuButton onPress={openSidePanel} />
          <Text style={[ds.topBarTitle, { color: C.label }]} numberOfLines={1}>
            {dept.name}
          </Text>
          <View style={{ width: 44 }} />
        </View>
      </View>
    </View>
  );
}

const ds = StyleSheet.create({
  screen:       { flex: 1 },

  topBar:       { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBarInner:  { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn:      { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  topBarTitle:  { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },

  hero:         { alignItems: 'center', paddingTop: 20, paddingBottom: 24, gap: 6 },
  heroIcon:     { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroName:     { fontSize: 22, fontWeight: '800' },
  heroSub:      { fontSize: 14 },
  meetingPill:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginTop: 4 },
  meetingText:  { fontSize: 12 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  card:         { borderRadius: 16, padding: 16, marginBottom: 20 },
  cardText:     { fontSize: 14, lineHeight: 21 },

  volBar:       { marginBottom: 12 },
  volBarTrack:  { height: 4, borderRadius: 2, marginBottom: 5 },
  volBarFill:   { height: 4, borderRadius: 2 },
  volBarLabel:  { fontSize: 12 },
  volRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  volRole:      { fontSize: 14 },
  volCount:     { fontSize: 13, fontWeight: '700' },
  volunteerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, padding: 13, borderRadius: 12 },
  volunteerBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  memberRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  avatar:       { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 13, fontWeight: '700' },
  memberName:   { fontSize: 14, fontWeight: '600' },
  memberRole:   { fontSize: 12 },
  viewAll:      { fontSize: 13, fontWeight: '600', textAlign: 'center', paddingTop: 10 },

  resourceRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  resourceName: { flex: 1, fontSize: 14 },
});
