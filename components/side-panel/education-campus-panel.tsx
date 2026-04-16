/**
 * Education Campus Side Panel — Lincoln University (CA).
 * President: Students · Organizations · Facilities · Housing + divider + Dipson · Settings · Help
 * Student:   Directory · Organizations · Facilities + divider + Dipson · Settings · Help
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

const PRESIDENT_NAV: NavItem[] = [
  { icon: 'person.2.fill',    label: 'Students',      route: '/(tabs)/(main)/campus' },
  { icon: 'building.2.fill',  label: 'Organizations', route: '/(tabs)/(main)/campus/organizations' },
  { icon: 'building.columns', label: 'Facilities',    route: '/(tabs)/(main)/campus/facilities' },
  { icon: 'house.fill',       label: 'Housing',       route: '/(tabs)/(main)/campus/housing' },
];

const STUDENT_NAV: NavItem[] = [
  { icon: 'list.bullet',      label: 'Directory',     route: '/(tabs)/(main)/campus' },
  { icon: 'building.2.fill',  label: 'Organizations', route: '/(tabs)/(main)/campus/organizations' },
  { icon: 'building.columns', label: 'Facilities',    route: '/(tabs)/(main)/campus/facilities' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/campus/settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/campus/help' },
];

export function EducationCampusPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('education:campus');
  const isPresident = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Campus'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => { if (item.route) router.navigate(item.route as any); }, 80);
  }, [router]);

  const navItems = isPresident ? PRESIDENT_NAV : STUDENT_NAV;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: '#3A2E1A' }]}>
          <Text style={[s.avatarText, { color: '#F0E8DC' }]}>LU</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>Lincoln University (CA)</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@lincolnuca</Text>
        <Text style={[s.followers, { color: C.secondary }]}>436 students · 2.4K followers</Text>
      </View>

      <View style={s.nav}>
        {navItems.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surface }]}
            onPress={() => go(item)}
          >
            <IconSymbol name={item.icon as any} size={22} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      <View style={s.nav}>
        {BOTTOM_ITEMS.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surface }]}
            onPress={() => go(item)}
          >
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
  handle:     { fontSize: 14, fontWeight: '400', marginBottom: 3 },
  followers:  { fontSize: 13 },
  nav:        { paddingHorizontal: 8 },
  navRow:     { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel:   { fontSize: 16, fontWeight: '500' },
  divider:    { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
