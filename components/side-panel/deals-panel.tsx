/**
 * Deals Side Panel — personal CRM navigation.
 * Owner:      MANAGE (Customize Stages · Templates).
 * Subscriber: (nothing)
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
  { icon: 'person.2.fill',       label: 'Contacts',       route: '/(tabs)/(main)/deals/contacts'       },
  { icon: 'chart.bar.fill',      label: 'Insights',       route: '/(tabs)/(main)/deals/insights'       },
  { icon: 'doc.plaintext',       label: 'Rate Card',      route: '/(tabs)/(main)/deals/rate-card'      },
  { icon: 'megaphone.fill',      label: 'Brand Outreach', route: '/(tabs)/(main)/deals/brand-outreach' },
];

const MANAGE_ITEMS: NavItem[] = [
  { icon: 'slider.horizontal.3', label: 'Customize Stages', route: '/(tabs)/(main)/deals/customize-stages' },
  { icon: 'doc.text',            label: 'Templates',         route: '/(tabs)/(main)/deals/templates'        },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function DealsPanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();

  const [role, , roleCycles] = useDemoRole('personal:deals');
  const isOwner = role === roleCycles[0];

  const goPage = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => {
      router.navigate(route as any);
    }, 80);
  };

  if (!isOwner) return null;

  // ── Owner view ──────────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>

      {/* ── Home ── */}
      <Pressable
        style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          closeSidePanel();
          setTimeout(() => router.navigate('/(tabs)/(main)/deals' as any), 80);
        }}
      >
        <IconSymbol name="chart.bar.fill" size={18} color={C.label} />
        <Text style={[s.rowLabel, { color: C.label }]}>Pipeline</Text>
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
