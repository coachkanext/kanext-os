/**
 * Community Agenda Side Panel — role-aware.
 * Pastor: Calendar · MANAGE (Reminders, Tasks, Availability, Reports)
 * Member: Calendar · MANAGE (Reminders, Tasks)
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Nav items ─────────────────────────────────────────────────────────────────

type NavItem = { icon: string; label: string; route: string };

const SHARED_MANAGE_ITEMS: NavItem[] = [
  { icon: 'bell.fill',             label: 'Reminders',   route: '/(tabs)/(main)/agenda/reminders'    },
  { icon: 'checkmark.circle.fill', label: 'Tasks',       route: '/(tabs)/(main)/agenda/tasks'        },
];

const PASTOR_MANAGE_ITEMS: NavItem[] = [
  { icon: 'bell.fill',                label: 'Reminders',   route: '/(tabs)/(main)/agenda/reminders'    },
  { icon: 'checkmark.circle.fill',    label: 'Tasks',       route: '/(tabs)/(main)/agenda/tasks'        },
  { icon: 'clock.arrow.2.circlepath', label: 'Availability',route: '/(tabs)/(main)/agenda/availability' },
  { icon: 'chart.bar.fill',           label: 'Reports',     route: '/(tabs)/(main)/agenda/reports'      },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function CommunityAgendaPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('community:agenda');
  const isPastor = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const manageItems = isPastor ? PASTOR_MANAGE_ITEMS : SHARED_MANAGE_ITEMS;

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>

      {/* ── Calendar ── */}
      <Pressable
        style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
        onPress={() => go('/(tabs)/(main)/agenda/index')}
      >
        <IconSymbol name="calendar" size={18} color={C.label} />
        <Text style={[s.rowLabel, { color: C.label, fontWeight: '600' }]}>Calendar</Text>
      </Pressable>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {/* ── MANAGE ── */}
      <Text style={[s.sectionLabel, { color: C.secondary }]}>Manage</Text>
      {manageItems.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < manageItems.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => go(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:         { flex: 1 },
    divider:      { height: StyleSheet.hairlineWidth, marginVertical: 12, marginHorizontal: 16 },
    sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 2, marginTop: 4 },
    row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8 },
    rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
    rowLabel:     { flex: 1, fontSize: 15 },
  });
}
