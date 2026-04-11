/**
 * Sports Social Side Panel — role-aware.
 * Head Coach: Feed · BROWSE (Explore) · MANAGE (Drafts, Scheduled, Posting Policy)
 * Player:     Feed · BROWSE (Explore)
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

const BROWSE_ITEMS: NavItem[] = [
  { icon: 'magnifyingglass', label: 'Explore', route: '/(tabs)/(main)/social/explore' },
];

const MANAGE_ITEMS: NavItem[] = [
  { icon: 'doc.on.doc',   label: 'Drafts',         route: '/(tabs)/(main)/social/drafts'         },
  { icon: 'clock',        label: 'Scheduled',      route: '/(tabs)/(main)/social/scheduled'      },
  { icon: 'shield.fill',  label: 'Posting Policy', route: '/(tabs)/(main)/social/posting-policy' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function SportsSocialPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('sports:social');
  const isHeadCoach = role === roleCycles[0];

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>

      {/* ── Feed ── */}
      <Pressable
        style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
        onPress={() => go('/(tabs)/(main)/social')}
      >
        <IconSymbol name="house.fill" size={18} color={C.label} />
        <Text style={[s.rowLabel, { color: C.label, fontWeight: '600' }]}>Feed</Text>
      </Pressable>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {/* ── BROWSE ── */}
      <Text style={[s.sectionLabel, { color: C.secondary }]}>Browse</Text>
      {BROWSE_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < BROWSE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => go(item.route)}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

      {/* ── MANAGE (Head Coach only) ── */}
      {isHeadCoach && (
        <>
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
              onPress={() => go(item.route)}
            >
              <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
              <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
            </Pressable>
          ))}
        </>
      )}

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
