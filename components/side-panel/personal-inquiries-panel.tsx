/**
 * Personal Inquiries Side Panel.
 * Owner: status filter nav + Dipson / Settings / Help.
 * Follower: no sidebar (returns null — "Work with me" page has no sidebar).
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

type NavItem = {
  icon: string;
  label: string;
  status?: string;    // routes to the screen with a status filter param
  route?: string;
};

const STATUS_ITEMS: NavItem[] = [
  { icon: 'tray.and.arrow.down.fill', label: 'Inquiries', status: 'All'     },
  { icon: 'archivebox.fill',          label: 'Archive',   status: 'Archive' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: 'sparkles',            label: 'Dipson',   route: '/nexus'                       },
  { icon: 'gearshape',           label: 'Settings', route: '/(tabs)/(main)/personal-inquiries/settings' },
  { icon: 'questionmark.circle', label: 'Help',     route: '/(tabs)/(main)/personal-inquiries/help' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function PersonalInquiriesPanel() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, , roleCycles] = useDemoRole('personal:inquiries');
  const isOwner = role === roleCycles[0];

  const go = useCallback((item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.label === 'Dipson') {
      closeSidePanel();
      setTimeout(() => openDipsonSheet('Inquiries'), 300);
      return;
    }
    closeSidePanel();
    setTimeout(() => {
      if (item.status) {
        router.navigate({
          pathname: '/(tabs)/(main)/personal-inquiries' as any,
          params: { status: item.status },
        });
      } else if (item.route) {
        router.navigate(item.route as any);
      }
    }, 80);
  }, [router]);

  if (!isOwner) return null;

  return (
    <View style={s.root}>

      {/* ── Identity header ── */}
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }]}>
          <Text style={[s.avatarInitials, { color: C.label }]}>SK</Text>
        </View>
        <Text style={[s.name, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[s.handle, { color: C.secondary }]}>@sammyk</Text>
      </View>

      {/* ── Status nav ── */}
      <View style={s.nav}>
        {STATUS_ITEMS.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.bg }]}
            onPress={() => go(item)}
          >
            <IconSymbol name={item.icon as any} size={22} color={C.label} />
            <Text style={[s.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[s.divider, { backgroundColor: C.separator }]} />

      {/* ── Bottom utilities ── */}
      <View style={s.nav}>
        {BOTTOM_ITEMS.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.bg }]}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarInitials: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  name:    { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, marginBottom: 2 },
  handle:  { fontSize: 14, fontWeight: '400' },

  nav:     { paddingHorizontal: 8 },
  navRow:  { flexDirection: 'row', alignItems: 'center', height: 44, gap: 16, paddingHorizontal: 12, borderRadius: 8 },
  navLabel:{ fontSize: 16, fontWeight: '500' },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 20 },
});
