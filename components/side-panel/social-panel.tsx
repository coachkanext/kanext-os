/**
 * Social Side Panel — role-aware.
 * Owner:    Browse (Explore) + Manage (Drafts, Scheduled)
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

type NavItem = { icon: string; label: string; route: string };

const BROWSE_ITEMS: NavItem[] = [
  { icon: 'magnifyingglass', label: 'Explore', route: '/(tabs)/(main)/social/explore' },
];

const MANAGE_ITEMS: NavItem[] = [
  { icon: 'doc.text',                 label: 'Drafts',     route: '/(tabs)/(main)/social/drafts'     },
  { icon: 'clock',                    label: 'Scheduled',  route: '/(tabs)/(main)/social/scheduled'  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function SocialPanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:social');
  const isOwner = role === roleCycles[0];

  const goRoute = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.navigate(route as any), 80);
  };

  if (!isOwner) return null;

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Home ── */}
        <Pressable
          style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            closeSidePanel();
            setTimeout(() => router.navigate('/(tabs)/(main)/social' as any), 80);
          }}
        >
          <IconSymbol name="newspaper.fill" size={18} color={C.label} />
          <Text style={[s.rowLabel, { color: C.label }]}>Feed</Text>
        </Pressable>

        <View style={[s.divider, { backgroundColor: C.separator }]} />

        <Text style={[s.sectionLabel, { color: C.secondary }]}>Browse</Text>
        {BROWSE_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.row, pressed && { backgroundColor: C.bg }]}
            onPress={() => goRoute(item.route)}
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
            onPress={() => goRoute(item.route)}
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
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel:  { flex: 1, fontSize: 15 },
});
