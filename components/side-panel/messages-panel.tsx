/**
 * Messages Side Panel — phone-panel format.
 * Identity header + nav rows + divider + bottom items.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Data ──────────────────────────────────────────────────────────────────────

type NavItem = {
  icon: string;
  label: string;
  route?: string;
  isDipson?: boolean;
};

const MAIN_NAV: NavItem[] = [
  { icon: 'envelope.fill',       label: 'Inbox',         route: '/(tabs)/(main)/messages' },
  { icon: 'archivebox.fill',     label: 'Archived',      route: '/(tabs)/(main)/messages/archived' },
  { icon: 'hand.raised.fill',    label: 'Blocked',       route: '/(tabs)/(main)/messages/blocked' },
  { icon: 'bell.fill',           label: 'Notifications', route: '/(tabs)/(main)/messages/notifications' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',  label: 'Dipson',   isDipson: true },
  { icon: 'gearshape', label: 'Settings', route: '/(tabs)/(main)/settings/notifications' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function MessagesPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Messages'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => {
      if (item.route) router.navigate(item.route as any);
    }, 80);
  }, [router]);

  return (
    <View style={s.root}>

      {/* ── Identity header ── */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.label }]}>
          <Text style={[s.avatarText, { color: C.bg }]}>SK</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@sammyk</Text>
      </View>

      {/* ── Nav items ── */}
      <View style={s.nav}>
        {MAIN_NAV.map(item => (
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

      {/* ── Bottom utilities ── */}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 15, fontWeight: '700' },
  name:   { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  handle: { fontSize: 14, fontWeight: '400' },

  nav:     { paddingHorizontal: 8 },
  navRow:  { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel:{ fontSize: 16, fontWeight: '500' },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
