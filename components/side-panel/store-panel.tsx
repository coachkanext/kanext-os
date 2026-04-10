/**
 * Store Side Panel — Personal Mode (Creator's product store).
 * Owner:    Home · Subscriptions · MANAGE (Coupons · Settings)
 * Follower: no panel (Follower sees no side panel on Store)
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Data ──────────────────────────────────────────────────────────────────────

type NavItem = { icon: string; label: string; route: string };

const NAV_ITEMS: NavItem[] = [
  { icon: 'rectangle.stack.badge.person.crop', label: 'Subscriptions', route: '/(tabs)/(main)/store/subscriptions' },
];

const MANAGE_ITEMS: NavItem[] = [
  { icon: 'tag.fill',      label: 'Coupons',  route: '/(tabs)/(main)/store/coupons'  },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/store/settings' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function StorePanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();

  const [role, , roleCycles] = useDemoRole('personal:store');
  const isOwner = role === roleCycles[0];

  const goPage = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => { router.navigate(route as any); }, 80);
  };

  if (!isOwner) return null;

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>

      {/* ── Home ── */}
      <Pressable
        style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          closeSidePanel();
          setTimeout(() => router.navigate('/(tabs)/(main)/store' as any), 80);
        }}
      >
        <IconSymbol name="bag.fill" size={18} color={C.label} />
        <Text style={[s.rowLabel, { color: C.label }]}>Products</Text>
      </Pressable>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {NAV_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < NAV_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => goPage(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

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
          onPress={() => goPage(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12, marginHorizontal: 16 },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 2, marginTop: 4,
  },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 8,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel:  { flex: 1, fontSize: 15 },
});
