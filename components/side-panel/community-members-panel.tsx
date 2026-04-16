/**
 * Community Members Side Panel — ICCLA.
 * Pastor: Directory · Households · Visitors · Ministries + divider + Dipson · Settings · Help
 * Member: Directory · Household · Ministries + divider + Dipson · Settings · Help
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

type NavItem = { icon: string; label: string; route?: string; isDipson?: boolean };

const PASTOR_NAV: NavItem[] = [
  { icon: 'person.2.fill',          label: 'Directory',  route: '/(tabs)/(main)/members' },
  { icon: 'house.fill',             label: 'Households', route: '/(tabs)/(main)/members/households' },
  { icon: 'figure.walk',            label: 'Visitors',   route: '/(tabs)/(main)/members/visitors' },
  { icon: 'rectangle.3.group.fill', label: 'Ministries', route: '/(tabs)/(main)/members/ministries' },
];

const MEMBER_NAV: NavItem[] = [
  { icon: 'house.fill',             label: 'Household',  route: '/(tabs)/(main)/members/household' },
  { icon: 'rectangle.3.group.fill', label: 'Ministries', route: '/(tabs)/(main)/members/ministries' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/members/settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/members/help' },
];

export function CommunityMembersPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Members'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => { if (item.route) router.navigate(item.route as any); }, 80);
  }, [router]);

  const navItems = isPastor ? PASTOR_NAV : MEMBER_NAV;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: '#2A3A28' }]}>
          <Text style={[s.avatarText, { color: '#F0E8DC' }]}>IC</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>ICCLA</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@iccla</Text>
      </View>

      <View style={s.nav}>
        {navItems.map(item => (
          <Pressable key={item.label} style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surface }]} onPress={() => go(item)}>
            <IconSymbol name={item.icon as any} size={22} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      <View style={s.nav}>
        {BOTTOM_ITEMS.map(item => (
          <Pressable key={item.label} style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surface }]} onPress={() => go(item)}>
            <IconSymbol name={item.icon as any} size={22} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:       { flex: 1 },
  header:     { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 15, fontWeight: '700' },
  name:       { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  handle:     { fontSize: 14, fontWeight: '400' },
  nav:        { paddingHorizontal: 8 },
  navRow:     { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel:   { fontSize: 16, fontWeight: '500' },
  divider:    { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
