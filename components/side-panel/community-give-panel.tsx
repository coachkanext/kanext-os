/**
 * Community Give Side Panel — role-aware nav panel (Pastor vs Member).
 * Pastor: Giving Dashboard, Campaigns, Donors, History + Manage section.
 * Member: Give, My History, Campaigns.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

export function CommunityGivePanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const PASTOR_NAV_ITEMS = [
    { icon: 'chart.bar.fill',  label: 'Giving Dashboard', route: '/(tabs)/(main)/give/giving-dashboard' },
    { icon: 'flag.fill',       label: 'Campaigns',        route: '/(tabs)/(main)/give/campaigns' },
    { icon: 'person.2.fill',   label: 'Donors',           route: '/(tabs)/(main)/give/donors' },
    { icon: 'clock.fill',      label: 'History',          route: '/(tabs)/(main)/give/history' },
  ];

  const PASTOR_MANAGE_ITEMS = [
    { icon: 'building.columns.fill', label: 'Fund Management', route: '/(tabs)/(main)/give/fund-management' },
    { icon: 'doc.text.fill',         label: 'Tax Receipts',    route: '/(tabs)/(main)/give/tax-receipts' },
    { icon: 'gearshape.fill',        label: 'Settings',        route: '/(tabs)/(main)/give/give-settings' },
  ];

  const MEMBER_NAV_ITEMS = [
    { icon: 'heart.fill',  label: 'Give',       route: '/(tabs)/(main)/give' },
    { icon: 'clock.fill',  label: 'My History', route: '/(tabs)/(main)/give/my-history' },
    { icon: 'flag.fill',   label: 'Campaigns',  route: '/(tabs)/(main)/give/campaigns' },
  ];

  const navItems = isPastor ? PASTOR_NAV_ITEMS : MEMBER_NAV_ITEMS;

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      {navItems.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < navItems.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
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
          {PASTOR_MANAGE_ITEMS.map((item, idx) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                s.row,
                pressed && { backgroundColor: C.bg },
                idx < PASTOR_MANAGE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
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
