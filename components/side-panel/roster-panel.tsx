/**
 * Roster Side Panel — swipe right on any roster page.
 * Mode circles + org switcher at top (handled by parent SidePanel).
 * Sports: Depth Chart, Staff, Transfers, Analytics, Archive, Settings.
 * Business: Org Chart, Payroll, Analytics, Archive, Settings.
 * Education: Housing, Involvement, Analytics, Archive, Settings.
 * Church: Master Schedule, Sign-Ups, Analytics, Archive, Settings.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useMode } from '@/context/app-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const SPORTS_NAV = [
  { icon: 'rectangle.stack.fill', label: 'Depth Chart', route: '/(tabs)/(main)/roster/depth-chart' },
  { icon: 'person.2.fill', label: 'Staff', route: '/(tabs)/(main)/roster/staff' },
  { icon: 'shuffle', label: 'Transfers', route: '/(tabs)/(main)/roster/transfers' },
  { icon: 'chart.bar.fill', label: 'Analytics', route: '/(tabs)/(main)/roster/analytics' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/roster/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/roster/settings' },
] as const;

const TEAM_NAV = [
  { icon: 'rectangle.stack.fill', label: 'Org Chart', route: '/(tabs)/(main)/roster/org-chart' },
  { icon: 'dollarsign.circle.fill', label: 'Payroll', route: '/(tabs)/(main)/roster/payroll' },
  { icon: 'chart.bar.fill', label: 'Analytics', route: '/(tabs)/(main)/roster/analytics' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/roster/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/roster/settings' },
] as const;

const COMMUNITY_NAV = [
  { icon: 'building.2.fill', label: 'Housing', route: '/(tabs)/(main)/roster/housing' },
  { icon: 'trophy.fill', label: 'Involvement', route: '/(tabs)/(main)/roster/involvement' },
  { icon: 'chart.bar.fill', label: 'Analytics', route: '/(tabs)/(main)/roster/analytics' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/roster/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/roster/settings' },
] as const;

const MINISTRIES_NAV = [
  { icon: 'calendar', label: 'Master Schedule', route: '/(tabs)/(main)/roster/master-schedule' },
  { icon: 'doc.text.fill', label: 'Sign-Ups', route: '/(tabs)/(main)/roster/sign-ups' },
  { icon: 'chart.bar.fill', label: 'Analytics', route: '/(tabs)/(main)/roster/analytics' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/roster/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/roster/settings' },
] as const;

export function RosterPanel() {
  const router = useRouter();
  const mode = useMode();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const isTeam = mode === 'business';
  const isCommunity = mode === 'education';
  const isMinistries = mode === 'church';
  const title = isMinistries ? 'Ministries' : isCommunity ? 'Community' : isTeam ? 'Team' : 'Roster';
  const navItems = isMinistries ? MINISTRIES_NAV : isCommunity ? COMMUNITY_NAV : isTeam ? TEAM_NAV : SPORTS_NAV;

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* ── NAV ROWS ── */}
      {navItems.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && styles.navRowPressed,
            idx < navItems.length - 1 && styles.navRowBorder,
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

const makeStyles = (C: ComponentColors) => StyleSheet.create({
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
