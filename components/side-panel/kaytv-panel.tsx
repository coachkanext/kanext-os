/**
 * KayTV Side Panel — role-aware.
 * Owner:    My Channel · Explore · Library · MANAGE (Manage Videos · Analytics)
 * Follower: My Channel · Explore · Library
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
  { icon: 'tv',                  label: 'My Channel', route: '/(tabs)/(main)/kaytv/my-channel' },
  { icon: 'safari.fill',         label: 'Explore',    route: '/(tabs)/(main)/kaytv/explore'    },
  { icon: 'books.vertical.fill', label: 'Library',    route: '/(tabs)/(main)/kaytv/library'    },
];

const MANAGE_ITEMS: NavItem[] = [
  { icon: 'film.stack',  label: 'Manage Videos', route: '/(tabs)/(main)/kaytv/manage-videos' },
  { icon: 'chart.bar',   label: 'Analytics',      route: '/(tabs)/(main)/kaytv/analytics'     },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function KayTVPanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];

  const goPage = (item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => { router.navigate(item.route as any); }, 80);
  };

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>

      {/* ── Browse ── */}
      {BROWSE_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            s.row,
            pressed && { backgroundColor: C.bg },
            idx < BROWSE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => goPage(item)}
        >
          <IconSymbol name={item.icon as any} size={18} color={idx === 0 ? C.label : C.secondary} />
          <Text style={[s.rowLabel, { color: C.label, fontWeight: idx === 0 ? '600' : '400' }]}>{item.label}</Text>
        </Pressable>
      ))}

      {/* ── Manage (Owner only) ── */}
      {isOwner && (
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
              onPress={() => goPage(item)}
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

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:    { flex: 1 },

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
