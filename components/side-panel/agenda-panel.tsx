/**
 * Agenda Side Panel
 *
 * Owner:    MANAGE (Availability · Reports)
 * Follower: (nothing)
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

const MANAGE_ITEMS: NavItem[] = [
  { icon: 'bell.fill',                label: 'Reminders',   route: '/(tabs)/(main)/agenda/reminders'   },
  { icon: 'checkmark.circle.fill',    label: 'Tasks',       route: '/(tabs)/(main)/agenda/tasks'       },
  { icon: 'clock.arrow.2.circlepath', label: 'Availability',route: '/(tabs)/(main)/agenda/availability'},
  { icon: 'chart.bar.fill',           label: 'Reports',     route: '/(tabs)/(main)/agenda/reports'     },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function AgendaPanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:agenda');
  const isOwner = role === roleCycles[0];

  const go = (item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => {
      router.navigate({ pathname: item.route as any, params: { section: item.label } });
    }, 80);
  };

  const renderRows = (items: NavItem[]) =>
    items.map((item, idx) => (
      <Pressable
        key={item.label}
        style={({ pressed }) => [
          s.row,
          pressed && { backgroundColor: C.bg },
          idx < items.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
        ]}
        onPress={() => go(item)}
      >
        <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
        <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
      </Pressable>
    ));

  if (!isOwner) return null;

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>

      {/* ── Home ── */}
      <Pressable
        style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          closeSidePanel();
          setTimeout(() => router.navigate('/(tabs)/(main)/agenda' as any), 80);
        }}
      >
        <IconSymbol name="calendar" size={18} color={C.label} />
        <Text style={[s.rowLabel, { color: C.label }]}>Calendar</Text>
      </Pressable>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      <Text style={[s.sectionLabel, { color: C.secondary }]}>Manage</Text>
      {renderRows(MANAGE_ITEMS)}

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
