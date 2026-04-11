/**
 * Community Members Side Panel — simple nav panel.
 * Pastor: Directory, Households, Visitors + MANAGE section.
 * Member: Directory only.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

export function CommunityMembersPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const NAV_ITEMS = isPastor ? [
    { icon: 'person.2.fill', label: 'Directory', route: '/(tabs)/(main)/members' },
    { icon: 'house.fill',    label: 'Households', route: '/(tabs)/(main)/members/households' },
    { icon: 'figure.walk',   label: 'Visitors',   route: '/(tabs)/(main)/members/visitors' },
  ] : [
    { icon: 'person.2.fill', label: 'Directory', route: '/(tabs)/(main)/members' },
  ];

  const MANAGE_ITEMS = [
    { icon: 'arrow.up.arrow.down',        label: 'Import/Export',       route: '/(tabs)/(main)/members/import-export' },
    { icon: 'shield.fill',                label: 'Role Definitions',     route: '/(tabs)/(main)/members/role-definitions' },
    { icon: 'calendar.badge.checkmark',   label: 'Attendance Policies',  route: '/(tabs)/(main)/members/attendance-policies' },
    { icon: 'lock.fill',                  label: 'Privacy Settings',     route: '/(tabs)/(main)/members/privacy-settings' },
  ];

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      {NAV_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < NAV_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => go(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

      {isPastor && (
        <>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Manage</Text>
          {MANAGE_ITEMS.map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                s.row,
                pressed && { backgroundColor: C.bg },
                idx < MANAGE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => go(item.route)}
            >
              <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
              <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:         { flex: 1 },
    divider:      { height: StyleSheet.hairlineWidth, marginVertical: 12, marginHorizontal: 16 },
    sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 2, marginTop: 4 },
    row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8 },
    rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
    rowLabel:     { flex: 1, fontSize: 15 },
  });
}
