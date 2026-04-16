/**
 * Education KPay Side Panel.
 * President: Institutional Finances · Pay · Invest · Card + Dipson/Settings/Help
 * Student:   Wallet                 · Pay · Invest · Card + Dipson/Settings/Help
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

const ADMIN_NAV: NavItem[] = [
  { icon: 'building.columns.fill',     label: 'Institutional Finances', route: '/(tabs)/(main)/kaypay/institutional-finances' },
  { icon: 'paperplane.fill',           label: 'Pay',                    route: '/(tabs)/(main)/kaypay/pay'                   },
  { icon: 'chart.line.uptrend.xyaxis', label: 'Invest',                 route: '/(tabs)/(main)/kaypay/invest'                },
  { icon: 'creditcard.fill',           label: 'Card',                   route: '/(tabs)/(main)/kaypay/card'                  },
];

const MEMBER_NAV: NavItem[] = [
  { icon: 'wallet.bifold.fill',        label: 'Wallet',  route: '/(tabs)/(main)/kaypay/wallet'  },
  { icon: 'paperplane.fill',           label: 'Pay',     route: '/(tabs)/(main)/kaypay/pay'     },
  { icon: 'chart.line.uptrend.xyaxis', label: 'Invest',  route: '/(tabs)/(main)/kaypay/invest'  },
  { icon: 'creditcard.fill',           label: 'Card',    route: '/(tabs)/(main)/kaypay/card'    },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/kaypay/settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/kaypay/help'     },
];

export function EducationKPayPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('education');
  const isAdmin = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('KPay'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => { if (item.route) router.navigate(item.route as any); }, 80);
  }, [router]);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.separator }]}>
          <Text style={[s.avatarText, { color: C.label }]}>LU</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>Lincoln University (CA)</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@lincolnu</Text>
      </View>
      <View style={s.nav}>
        {(isAdmin ? ADMIN_NAV : MEMBER_NAV).map(item => (
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
  root:     { flex: 1 },
  header:   { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  avatar:   { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 15, fontWeight: '700' },
  name:     { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  handle:   { fontSize: 14 },
  nav:      { paddingHorizontal: 8 },
  navRow:   { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel: { fontSize: 16, fontWeight: '500' },
  divider:  { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
