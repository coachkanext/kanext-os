/**
 * Members — Households (Pastor only).
 * Member role redirects to members/index.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Alert, Animated,
} from 'react-native';
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

const TOP_BAR_H = 52;

const HOUSEHOLDS = [
  {
    id: 'h1',
    familyName: 'The Kalejaiye Family',
    members: [
      { initials: 'EK', hue: 210 },
      { initials: 'AK', hue: 210 },
      { initials: 'MK', hue: 210 },
    ],
    memberCount: 4,
    primaryContact: 'Emmanuel Kalejaiye',
  },
  {
    id: 'h2',
    familyName: 'The Johnson Family',
    members: [
      { initials: 'NJ', hue: 150 },
      { initials: 'TJ', hue: 150 },
      { initials: 'CJ', hue: 150 },
    ],
    memberCount: 3,
    primaryContact: 'Nia Johnson',
  },
  {
    id: 'h3',
    familyName: 'The Santos Family',
    members: [
      { initials: 'DS', hue: 30 },
      { initials: 'MS', hue: 30 },
    ],
    memberCount: 5,
    primaryContact: 'David Santos',
  },
  {
    id: 'h4',
    familyName: 'The Park Family',
    members: [
      { initials: 'LP', hue: 260 },
      { initials: 'JP', hue: 260 },
      { initials: 'SP', hue: 260 },
      { initials: 'EP', hue: 260 },
    ],
    memberCount: 4,
    primaryContact: 'Lydia Park',
  },
  {
    id: 'h5',
    familyName: 'The Adebayo Family',
    members: [
      { initials: 'OA', hue: 0 },
      { initials: 'FA', hue: 0 },
    ],
    memberCount: 2,
    primaryContact: 'Ola Adebayo',
  },
];

export default function HouseholdsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const [search, setSearch] = useState('');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/members' as any);
    }
  }, [isPastor, router]));

  const filtered = useMemo(() => {
    if (!search.trim()) return HOUSEHOLDS;
    const q = search.toLowerCase();
    return HOUSEHOLDS.filter(h =>
      h.familyName.toLowerCase().includes(q) ||
      h.primaryContact.toLowerCase().includes(q)
    );
  }, [search]);

  if (!isPastor) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Households</Text>
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search households..."
            placeholderTextColor={C.secondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Household list */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {filtered.map((h, idx) => (
            <Pressable
              key={h.id}
              style={({ pressed }) => [
                s.householdRow,
                pressed && { backgroundColor: C.bg },
                idx < filtered.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => Alert.alert(h.familyName, `${h.memberCount} members\nPrimary Contact: ${h.primaryContact}`, [
                { text: 'Edit Household', onPress: () => {} },
                { text: 'Close', style: 'cancel' },
              ])}
            >
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={[s.familyName, { color: C.label }]}>{h.familyName}</Text>
                {/* Initials row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: -8 }}>
                  {h.members.map((m, i) => (
                    <View
                      key={i}
                      style={[
                        s.memberCircle,
                        { backgroundColor: `hsl(${m.hue},42%,32%)`, marginLeft: i === 0 ? 0 : -10, zIndex: h.members.length - i },
                      ]}
                    >
                      <Text style={s.memberCircleText}>{m.initials}</Text>
                    </View>
                  ))}
                  {h.memberCount > h.members.length && (
                    <View style={[s.memberCircle, { backgroundColor: C.separator, marginLeft: -10, zIndex: 0 }]}>
                      <Text style={[s.memberCircleText, { color: C.secondary }]}>+{h.memberCount - h.members.length}</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.primaryContact, { color: C.secondary }]}>
                  {h.memberCount} members · {h.primaryContact}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* + Create Household FAB */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Create Household', 'Open household creation form?', [{ text: 'Cancel' }, { text: 'Create' }]); }}
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

  searchBar:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, gap: 8, marginBottom: 16, height: 44 },
  searchInput: { flex: 1, fontSize: 15 },

  card:         { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  householdRow: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
  familyName:   { fontSize: 15, fontWeight: '700' },

  memberCircle:     { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.bg },
  memberCircleText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  primaryContact: { fontSize: 12 },

  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
