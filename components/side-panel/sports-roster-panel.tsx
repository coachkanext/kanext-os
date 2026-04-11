/**
 * Sports Roster Side Panel — role-aware nav panel (Coach vs Player).
 * Coach: Players (home), BROWSE section (Depth Chart, Gap Analysis, Staff),
 *        MANAGE section (Scholarships, Medical, Export).
 * Player: Roster (home), My Profile.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

export function SportsRosterPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('sports:roster');
  const isCoach = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const COACH_BROWSE_ITEMS = [
    { icon: 'chart.bar.fill',    label: 'Depth Chart',  route: '/(tabs)/(main)/roster/depth-chart' },
    { icon: 'magnifyingglass',   label: 'Gap Analysis', route: '/(tabs)/(main)/roster/gap-analysis' },
    { icon: 'person.3.fill',     label: 'Staff',        route: '/(tabs)/(main)/roster/staff' },
  ];

  const COACH_MANAGE_ITEMS = [
    { icon: 'dollarsign.circle.fill',  label: 'Scholarships', route: '/(tabs)/(main)/roster/scholarships' },
    { icon: 'cross.fill',              label: 'Medical',      route: '/(tabs)/(main)/roster/medical' },
  ];

  const PLAYER_ITEMS = [
    { icon: 'person.fill', label: 'My Profile', route: '/(tabs)/(main)/roster/my-profile' },
  ];

  return (
    <View style={s.root}>

      {/* Top home item */}
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <Pressable
          style={({ pressed }) => [s.row, s.rowBold, pressed && { backgroundColor: C.bg }]}
          onPress={() => go('/(tabs)/(main)/roster')}
        >
          <IconSymbol name="house.fill" size={18} color={C.secondary} />
          <Text style={[s.rowLabelBold, { color: C.label }]}>
            {isCoach ? 'Players' : 'Roster'}
          </Text>
          <IconSymbol name="chevron.right" size={12} color={C.secondary} />
        </Pressable>
      </View>

      {isCoach ? (
        <>
          {/* BROWSE section */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>BROWSE</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {COACH_BROWSE_ITEMS.map((item, idx) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  s.row,
                  idx < COACH_BROWSE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                  pressed && { backgroundColor: C.bg },
                ]}
                onPress={() => go(item.route)}
              >
                <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
                <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
                <IconSymbol name="chevron.right" size={12} color={C.secondary} />
              </Pressable>
            ))}
          </View>

          {/* MANAGE section */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>MANAGE</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {COACH_MANAGE_ITEMS.map((item, idx) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  s.row,
                  idx < COACH_MANAGE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                  pressed && { backgroundColor: C.bg },
                ]}
                onPress={() => go(item.route)}
              >
                <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
                <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
                <IconSymbol name="chevron.right" size={12} color={C.secondary} />
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [s.row, pressed && { backgroundColor: C.bg }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Export coming soon');
              }}
            >
              <IconSymbol name="square.and.arrow.up" size={18} color={C.secondary} />
              <Text style={[s.rowLabel, { color: C.label }]}>Export</Text>
              <IconSymbol name="chevron.right" size={12} color={C.secondary} />
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {/* Player items — no section header */}
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {PLAYER_ITEMS.map((item, idx) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  s.row,
                  idx < PLAYER_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                  pressed && { backgroundColor: C.bg },
                ]}
                onPress={() => go(item.route)}
              >
                <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
                <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
                <IconSymbol name="chevron.right" size={12} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        </>
      )}

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:         { gap: 8 },
    card:         { borderRadius: 12, overflow: 'hidden' },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      paddingHorizontal: 4,
      paddingTop: 4,
      paddingBottom: 2,
    },
    row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
    rowBold:      { borderBottomWidth: StyleSheet.hairlineWidth },
    rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
    rowLabel:     { flex: 1, fontSize: 15 },
    rowLabelBold: { flex: 1, fontSize: 15, fontWeight: '600' },
  });
}
