/**
 * Community Side Panel (Personal Mode)
 *
 * Owner:    Home · Browse (Spaces, Connect, Members) · MANAGE (Moderation Queue, Weekly Prompt)
 * Follower: Home · Browse (Spaces, Connect, Members)
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Data ──────────────────────────────────────────────────────────────────────

type NavItem = { icon: string; label: string; route: string; badge?: number };

const BROWSE_ITEMS: NavItem[] = [
  { icon: 'bubble.left.and.bubble.right.fill', label: 'Spaces',  route: '/(tabs)/(main)/network/spaces'  },
  { icon: 'person.2.fill',                     label: 'Connect', route: '/(tabs)/(main)/network/connect' },
  { icon: 'person.3.fill',                     label: 'Members', route: '/(tabs)/(main)/network/members' },
];

const MANAGE_ITEMS: NavItem[] = [
  { icon: 'shield.fill', label: 'Moderation Queue', badge: 2, route: '/(tabs)/(main)/network/moderation'    },
  { icon: 'mic.fill',    label: 'Weekly Prompt',             route: '/(tabs)/(main)/network/weekly-prompt' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function NetworkPanel() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:network');
  const isOwner = role === roleCycles[0];

  const goRoute = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
    setTimeout(() => router.navigate(route as any), 80);
  };

  return (
    <View style={[s.root, { backgroundColor: C.surface }]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Home ── */}
        <Pressable
          style={({ pressed }) => [s.row, s.rowBorder, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.bg }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            closeSidePanel();
            setTimeout(() => router.navigate('/(tabs)/(main)/network' as any), 80);
          }}
        >
          <IconSymbol name="house.fill" size={18} color={C.label} />
          <Text style={[s.rowLabel, { color: C.label }]}>Home</Text>
        </Pressable>

        <View style={[s.divider, { backgroundColor: C.separator }]} />

        {BROWSE_ITEMS.map((item, idx) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              s.row,
              pressed && { backgroundColor: C.bg },
              idx < BROWSE_ITEMS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => goRoute(item.route)}
          >
            <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
            <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
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
                onPress={() => goRoute(item.route)}
              >
                <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
                <Text style={[s.rowLabel, { color: C.label }]}>{item.label}</Text>
                {item.badge ? (
                  <View style={[s.badge, { backgroundColor: C.ember }]}>
                    <Text style={s.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </>
        )}

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

  badge: {
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
});
