/**
 * Sports Recruits Side Panel — Lincoln Men's Basketball.
 * Head Coach: Board · Search · Portal · Analytics + divider + Dipson · Settings · Help
 * Player: Program · Questionnaire · Visit + divider + Dipson · Settings · Help
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

const COACH_NAV: NavItem[] = [
  { icon: 'rectangle.3.group.fill', label: 'Board',     route: '/(tabs)/(main)/recruits' },
  { icon: 'magnifyingglass',         label: 'Search',    route: '/(tabs)/(main)/recruits/search' },
  { icon: 'arrow.left.arrow.right',  label: 'Portal',    route: '/(tabs)/(main)/recruits/portal' },
  { icon: 'chart.bar.fill',          label: 'Analytics', route: '/(tabs)/(main)/recruits/analytics' },
];

const PLAYER_NAV: NavItem[] = [
  { icon: 'building.2.fill',        label: 'Program',       route: '/(tabs)/(main)/recruits/program' },
  { icon: 'doc.text.fill',          label: 'Questionnaire', route: '/(tabs)/(main)/recruits/questionnaire' },
  { icon: 'calendar.badge.plus',    label: 'Visit',         route: '/(tabs)/(main)/recruits/visit' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/recruits/settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/recruits/help' },
];

export function SportsRecruitsPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('sports:recruits');
  const isCoach = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Recruits'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => { if (item.route) router.navigate(item.route as any); }, 80);
  }, [router]);

  const navItems = isCoach ? COACH_NAV : PLAYER_NAV;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: '#1A2E4A' }]}>
          <Text style={[s.avatarText, { color: '#F0E8DC' }]}>LM</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>Lincoln Men's Basketball</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@lincolnmbb</Text>
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
