/**
 * Members — Role Definitions (Pastor only).
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

const ROLES = [
  { id: 'admin',     name: 'Admin',     description: 'Full access to all features, settings, and member records. Manages the entire community platform.', count: 2 },
  { id: 'staff',     name: 'Staff',     description: 'Paid and commissioned staff members. Access to pastoral tools, attendance, and communications.',   count: 8 },
  { id: 'leader',    name: 'Leader',    description: 'Ministry department heads and small group leaders. Manage their own department roster.',            count: 14 },
  { id: 'volunteer', name: 'Volunteer', description: 'Serve in specific ministries. Limited access to their ministry scheduling and resources.',          count: 47 },
  { id: 'member',    name: 'Member',    description: 'Registered congregation members. Access to directory, events, groups, and giving.',                count: 176 },
];

export default function RoleDefinitionsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/members' as any);
    }
  }, [isPastor, router]));

  const topBarH = insets.top + TOP_BAR_H;

  if (!isPastor) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 20, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {ROLES.map((r, idx) => (
            <Pressable
              key={r.id}
              style={({ pressed }) => [
                s.roleRow,
                pressed && { backgroundColor: C.bg },
                idx < ROLES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(r.name, r.description, [
                  { text: 'Edit Role', onPress: () => {} },
                  { text: 'Close', style: 'cancel' },
                ]);
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={[s.roleName, { color: C.label }]}>{r.name}</Text>
                  <View style={[s.countBadge, { backgroundColor: C.separator }]}>
                    <Text style={[s.countBadgeText, { color: C.label }]}>{r.count}</Text>
                  </View>
                </View>
                <Text style={[s.roleDesc, { color: C.secondary }]}>{r.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Top bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <Text style={[s.topBarTitle, { color: C.label }]}>Role Definitions</Text>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarWrap:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  topBarTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },

  card:     { borderRadius: 14, overflow: 'hidden' },
  roleRow:  { padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowBorder:{ borderBottomWidth: StyleSheet.hairlineWidth },

  roleName: { fontSize: 15, fontWeight: '700' },
  roleDesc: { fontSize: 13, lineHeight: 18 },

  countBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countBadgeText: { fontSize: 12, fontWeight: '700' },
});
