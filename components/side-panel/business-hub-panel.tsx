/**
 * Business Hub Side Panel.
 * CEO:      Overview · Projects · Documents · Clients · Team · Reports + Dipson/Settings/Help
 * Customer: Overview · My Projects · Invoices + Dipson/Settings/Help
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

type NavItem = {
  icon: string;
  label: string;
  route?: string;
  isDipson?: boolean;
};

const CEO_NAV: NavItem[] = [
  { icon: 'square.grid.2x2.fill',      label: 'Profile',    route: '/(tabs)/(main)/hub/business'      },
  { icon: 'folder.fill',               label: 'Projects',   route: '/(tabs)/(main)/hub/biz-projects'  },
  { icon: 'doc.fill',                  label: 'Documents',  route: '/(tabs)/(main)/hub/biz-documents' },
  { icon: 'person.2.fill',             label: 'Clients',    route: '/(tabs)/(main)/hub/biz-clients'   },
  { icon: 'person.3.fill',             label: 'Team',       route: '/(tabs)/(main)/hub/biz-team'      },
  { icon: 'chart.bar.fill',            label: 'Reports',    route: '/(tabs)/(main)/hub/reports'       },
];

const CUSTOMER_NAV: NavItem[] = [
  { icon: 'square.grid.2x2.fill',      label: 'Profile',    route: '/(tabs)/(main)/hub/business'      },
  { icon: 'folder.fill',               label: 'Projects',    route: '/(tabs)/(main)/hub/biz-projects'  },
  { icon: 'doc.text.fill',             label: 'Invoices',    route: '/(tabs)/(main)/hub/biz-invoices'  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/hub/biz-settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/hub/biz-help'     },
];

export function BusinessHubPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('business:hub');
  const isCEO = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Business'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => {
      if (item.route) router.navigate(item.route as any);
    }, 80);
  }, [router]);

  const navItems = isCEO ? CEO_NAV : CUSTOMER_NAV;

  return (
    <View style={s.root}>

      {/* Identity header */}
      <View style={s.header}>
        <View style={[s.logo, { backgroundColor: C.label }]}>
          <Text style={[s.logoK, { color: C.bg }]}>K</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>KaNeXT</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@kanext</Text>
      </View>

      {/* Role-specific nav */}
      <View style={s.nav}>
        {navItems.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.separator }]}
            onPress={() => go(item)}
          >
            <IconSymbol name={item.icon as any} size={22} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {/* Bottom utilities — all roles */}
      <View style={s.nav}>
        {BOTTOM_ITEMS.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.separator }]}
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
  root: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  logo: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  logoK:   { fontSize: 20, fontWeight: '900' },
  name:    { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  handle:  { fontSize: 14, fontWeight: '400' },

  nav:      { paddingHorizontal: 8 },
  navRow:   { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel: { fontSize: 16, fontWeight: '500' },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
