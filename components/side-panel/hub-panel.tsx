/**
 * Hub Side Panel — role-aware.
 * Owner:    Manage items
 * Follower: (nothing)
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Nav items ─────────────────────────────────────────────────────────────────

type NavItem = { icon: string; label: string; route: string | null; tab: string | null };

const MANAGE_ITEMS: NavItem[] = [
  { icon: 'rectangle.stack.fill', label: 'Content',   route: '/(tabs)/(main)/hub', tab: 'Content'   },
  { icon: 'chart.bar.fill',       label: 'Analytics', route: '/(tabs)/(main)/hub', tab: 'Analytics' },
  { icon: 'doc.richtext',         label: 'Media Kit', route: '/(tabs)/(main)/hub/media-kit',    tab: null },
  { icon: 'qrcode',               label: 'QR Code',   route: '/(tabs)/(main)/hub/qr-code', tab: null },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function HubPanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:hub');
  const isOwner = role === roleCycles[0];

  const go = (route: string | null, tab: string | null, params?: Record<string, string>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    if (!route) return;
    setTimeout(() => {
      const merged = { ...(params ?? {}) };
      if (tab) {
        router.navigate({ pathname: route as any, params: { ...merged, tab } });
      } else if (Object.keys(merged).length > 0) {
        router.navigate({ pathname: route as any, params: merged });
      } else {
        router.navigate(route as any);
      }
    }, 80);
  };

  if (!isOwner) return null;

  // ── Owner view ─────────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Home ── */}
        <Pressable
          style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
          onPress={() => go('/(tabs)/(main)/hub', null, {})}
        >
          <IconSymbol name="person.crop.rectangle.fill" size={18} color={C.label} />
          <Text style={[s.rowLabel, { color: C.label }]}>Profile</Text>
        </Pressable>

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
            onPress={() => go(item.route, item.tab)}
          >
            <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}


      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { flex: 1 },
  content: { paddingTop: 8, paddingBottom: 8 },

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
  rowBorder:  { borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel:   { flex: 1, fontSize: 15 },

});
