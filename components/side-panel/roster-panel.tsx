/**
 * Roster Side Panel — swipe right on any roster page.
 * Mode circles + org switcher at top (handled by parent SidePanel).
 * Content: 6 nav rows → full pages.
 *   Depth Chart, Staff, Transfers, Analytics, Archive, Settings.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';

const C = {
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  separator: 'rgba(255,255,255,0.08)',
};

const ROSTER_NAV = [
  { icon: 'rectangle.stack.fill', label: 'Depth Chart', route: '/(tabs)/(main)/roster/depth-chart' },
  { icon: 'person.2.fill', label: 'Staff', route: '/(tabs)/(main)/roster/staff' },
  { icon: 'shuffle', label: 'Transfers', route: '/(tabs)/(main)/roster/transfers' },
  { icon: 'chart.bar.fill', label: 'Analytics', route: '/(tabs)/(main)/roster/analytics' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/roster/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/roster/settings' },
] as const;

export function RosterPanel() {
  const router = useRouter();

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roster</Text>

      {/* ── NAV ROWS ── */}
      {ROSTER_NAV.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && styles.navRowPressed,
            idx < ROSTER_NAV.length - 1 && styles.navRowBorder,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigateTo(item.route);
          }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={styles.navLabel}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
        </Pressable>
      ))}

      <View style={{ height: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  navLabel: {
    flex: 1,
    fontSize: 16,
    color: C.label,
  },
});
