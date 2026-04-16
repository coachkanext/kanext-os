/**
 * Community Members — Household (Member view of their own family unit).
 * Pastor is redirected to Households list.
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

const MY_HOUSEHOLD = {
  name: 'The Adebayo Family',
  members: [
    { id: 'f1', initials: 'OA', name: 'Ola Adebayo',   relationship: 'You',     hue: 0   },
    { id: 'f2', initials: 'FA', name: 'Funke Adebayo', relationship: 'Spouse',  hue: 340 },
    { id: 'f3', initials: 'DA', name: 'Dami Adebayo',  relationship: 'Child',   hue: 30  },
    { id: 'f4', initials: 'SA', name: 'Seun Adebayo',  relationship: 'Child',   hue: 60  },
  ],
};

export default function HouseholdScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (isPastor) {
      router.replace('/(tabs)/(main)/members/households' as any);
    }
  }, [isPastor, router]));

  if (isPastor) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Household</Text>
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

        {/* Household name */}
        <Text style={[s.householdName, { color: C.label }]}>{MY_HOUSEHOLD.name}</Text>
        <Text style={[s.householdSub, { color: C.secondary }]}>{MY_HOUSEHOLD.members.length} members</Text>

        {/* Family members */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {MY_HOUSEHOLD.members.map((m, idx) => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [s.memberRow, pressed && { backgroundColor: C.bg }, idx < MY_HOUSEHOLD.members.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
              onPress={() => {
                if (m.relationship === 'You') return;
                Alert.alert(m.name, `Relationship: ${m.relationship}`, [{ text: 'View Profile', onPress: () => {} }, { text: 'Close', style: 'cancel' }]);
              }}
            >
              <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                <Text style={s.avatarText}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.memberName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.relationship, { color: C.secondary }]}>{m.relationship}</Text>
              </View>
              {m.relationship !== 'You' && <IconSymbol name="chevron.right" size={14} color={C.secondary} />}
            </Pressable>
          ))}
        </View>

        {/* Add family member */}
        <Pressable
          style={[s.addBtn, { backgroundColor: C.surface }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Add Family Member', 'Send an invite to link a family member?', [{ text: 'Cancel' }, { text: 'Send Invite' }]); }}
        >
          <IconSymbol name="person.badge.plus" size={18} color={C.label} />
          <Text style={[s.addBtnText, { color: C.label }]}>Add Family Member</Text>
        </Pressable>

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

  householdName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  householdSub:  { fontSize: 13, marginBottom: 20 },

  card:       { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  memberRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:  { borderBottomWidth: StyleSheet.hairlineWidth },

  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  memberName:   { fontSize: 15, fontWeight: '600' },
  relationship: { fontSize: 12, marginTop: 2 },

  addBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, padding: 14 },
  addBtnText: { fontSize: 15, fontWeight: '600' },
});
