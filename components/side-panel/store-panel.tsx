/**
 * Store Side Panel — Personal Mode.
 * Owner:    All Products · Orders · Customers · Coupons · Analytics + Dipson/Settings/Help
 * Follower: Store · My Purchases
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

// ── Data ──────────────────────────────────────────────────────────────────────

type NavItem = {
  icon: string;
  label: string;
  route?: string;
  isDipson?: boolean;
};

const OWNER_NAV: NavItem[] = [
  { icon: 'square.grid.2x2.fill',    label: 'All Products', route: '/(tabs)/(main)/store' },
  { icon: 'shippingbox.fill',         label: 'Orders',       route: '/(tabs)/(main)/store' },
  { icon: 'person.2.fill',            label: 'Customers',    route: '/(tabs)/(main)/store' },
  { icon: 'tag.fill',                 label: 'Coupons',      route: '/(tabs)/(main)/store' },
  { icon: 'chart.bar.fill',           label: 'Analytics',    route: '/(tabs)/(main)/store' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/store/settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/store/help' },
];

const FOLLOWER_NAV: NavItem[] = [
  { icon: 'bag.fill',               label: 'Store',        route: '/(tabs)/(main)/store' },
  { icon: 'clock.arrow.circlepath', label: 'My Purchases', route: '/(tabs)/(main)/store' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function StorePanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:store');
  const isOwner = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Store'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => {
      if (item.route) router.navigate(item.route as any);
    }, 80);
  }, [router]);

  const navItems = isOwner ? OWNER_NAV : FOLLOWER_NAV;

  return (
    <View style={s.root}>

      {/* ── Identity header ── */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.separator }]}>
          <IconSymbol name="bag.fill" size={18} color={C.secondary} />
        </View>
        <Text style={[s.name, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[s.handle, { color: C.secondary }]}>Creator Store</Text>
      </View>

      {/* ── Nav items ── */}
      <View style={s.nav}>
        {navItems.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.bg }]}
            onPress={() => go(item)}
          >
            <IconSymbol name={item.icon as any} size={22} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── Bottom utilities (Owner only) ── */}
      {isOwner && (
        <>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          <View style={s.nav}>
            {BOTTOM_ITEMS.map(item => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.bg }]}
                onPress={() => go(item)}
              >
                <IconSymbol name={item.icon as any} size={22} color={C.label} />
                <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  name:   { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  handle: { fontSize: 14, fontWeight: '400' },

  nav:     { paddingHorizontal: 8 },
  navRow:  { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel:{ fontSize: 16, fontWeight: '500' },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
