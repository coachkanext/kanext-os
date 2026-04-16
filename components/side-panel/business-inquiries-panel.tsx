/**
 * Business Inquiries Side Panel
 * CEO: Pipeline · Leads · Contacts · Analytics + Dipson · Settings · Help
 * Client: Support + Dipson · Settings · Help
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

const CEO_NAV: NavItem[] = [
  { icon: 'chart.bar.fill',            label: 'Pipeline',  route: '/(tabs)/(main)/inquiries/pipeline'  },
  { icon: 'person.badge.plus',         label: 'Leads',     route: '/(tabs)/(main)/inquiries/leads'     },
  { icon: 'person.2.fill',             label: 'Contacts',  route: '/(tabs)/(main)/inquiries/contacts'  },
  { icon: 'chart.line.uptrend.xyaxis', label: 'Analytics', route: '/(tabs)/(main)/inquiries/analytics' },
];

const CLIENT_NAV: NavItem[] = [
  { icon: 'bubble.left.and.bubble.right.fill', label: 'Support', route: '/(tabs)/(main)/inquiries/support' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/inquiries/settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/inquiries/help'     },
];

export function BusinessInquiriesPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();

  const [role, , roleCycles] = useDemoRole('business:inquiries');
  const isCEO = role === roleCycles[0];
  const nav = isCEO ? CEO_NAV : CLIENT_NAV;

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Inquiries'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => { if (item.route) router.navigate(item.route as any); }, 80);
  }, [router]);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.label }]}>
          <Text style={[s.avatarText, { color: C.bg }]}>KN</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>KaNeXT Inc.</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@kanext</Text>
      </View>

      <View style={s.nav}>
        {nav.map(item => (
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
  handle:     { fontSize: 14 },
  nav:        { paddingHorizontal: 8 },
  navRow:     { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel:   { fontSize: 16, fontWeight: '500' },
  divider:    { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
