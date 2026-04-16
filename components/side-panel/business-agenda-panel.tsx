/**
 * Business Agenda Side Panel — CEO vs Customer.
 * CEO:      Calendar · Reminders · Tasks · Availability
 * Customer: Calendar · Reminders · Tasks · Availability
 * Both: divider → Dipson · Settings · Help
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

type NavItem = { icon: string; label: string; route?: string; isDipson?: boolean };

const OWNER_NAV_ITEMS: NavItem[] = [
  { icon: 'calendar',         label: 'Calendar',     route: '/(tabs)/(main)/agenda'              },
  { icon: 'bell',             label: 'Reminders',    route: '/(tabs)/(main)/agenda/reminders'    },
  { icon: 'checkmark.circle', label: 'Tasks',        route: '/(tabs)/(main)/agenda/tasks'        },
  { icon: 'clock',            label: 'Availability', route: '/(tabs)/(main)/agenda/availability' },
];

const MEMBER_NAV_ITEMS: NavItem[] = [
  { icon: 'calendar',         label: 'Calendar',     route: '/(tabs)/(main)/agenda'              },
  { icon: 'bell',             label: 'Reminders',    route: '/(tabs)/(main)/agenda/reminders'    },
  { icon: 'checkmark.circle', label: 'Tasks',        route: '/(tabs)/(main)/agenda/tasks'        },
  { icon: 'clock',            label: 'Availability', route: '/(tabs)/(main)/agenda/availability' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   isDipson: true                              },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/agenda/settings'     },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/agenda/help'         },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function BusinessAgendaPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('business');
  const isCEO = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isDipson) {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Calendar'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => { if (item.route) router.navigate(item.route as any); }, 80);
  }, [router]);

  const navItems = isCEO ? OWNER_NAV_ITEMS : MEMBER_NAV_ITEMS;

  return (
    <View style={s.root}>

      {/* Identity header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <IconSymbol name="person.fill" size={20} color={C.secondary} />
        </View>
        <Text style={[s.name, { color: C.label }]}>KaNeXT</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@kanext</Text>
      </View>

      {/* Main nav */}
      <View style={s.nav}>
        {navItems.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.bg }]}
            onPress={() => go(item)}
          >
            <IconSymbol name={item.icon as any} size={24} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Divider + bottom utilities */}
      <View style={[s.divider, { backgroundColor: C.separator }]} />
      <View style={s.nav}>
        {BOTTOM_ITEMS.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.bg }]}
            onPress={() => go(item)}
          >
            <IconSymbol name={item.icon as any} size={24} color={C.label} />
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
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: C.separator },
  name: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  handle: { fontSize: 14, fontWeight: '400', marginBottom: 6 },
  nav: { paddingHorizontal: 8 },
  navRow: { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel: { fontSize: 16, fontWeight: '500' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
