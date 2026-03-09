/**
 * Season Side Panel — swipe right on any season page.
 * Mode circles + org switcher at top (handled by parent SidePanel).
 * Content: 7 nav rows → full pages.
 *   Full Stats, Scorekeeper, Scouting, Travel, Standings, Archive, Settings.
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

import { useMode } from '@/context/app-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';

const C = {
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  separator: 'rgba(255,255,255,0.08)',
};

const SPORTS_NAV = [
  { icon: 'chart.bar.fill', label: 'Full Stats', route: '/(tabs)/(main)/season/stats' },
  { icon: 'sportscourt.fill', label: 'Scorekeeper', route: '/(tabs)/(main)/season/scorekeeper' },
  { icon: 'scope', label: 'Scouting', route: '/(tabs)/(main)/season/scouting' },
  { icon: 'airplane', label: 'Travel', route: '/(tabs)/(main)/season/travel' },
  { icon: 'trophy.fill', label: 'Standings', route: '/(tabs)/(main)/season/standings' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/season/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/season/settings' },
] as const;

const OFFICE_NAV = [
  { icon: 'chart.bar.fill', label: 'Full Analytics', route: '/(tabs)/(main)/season/analytics' },
  { icon: 'doc.on.doc.fill', label: 'Templates', route: '/(tabs)/(main)/season/templates' },
  { icon: 'bolt.fill', label: 'Automations', route: '/(tabs)/(main)/season/automations' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/season/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/season/settings' },
] as const;

const CAMPUS_NAV = [
  { icon: 'book.fill', label: 'Gradebook', route: '/(tabs)/(main)/season/gradebook' },
  { icon: 'checklist', label: 'Attendance', route: '/(tabs)/(main)/season/attendance' },
  { icon: 'doc.text.fill', label: 'Transcripts', route: '/(tabs)/(main)/season/transcripts' },
  { icon: 'pencil', label: 'Lesson Planner', route: '/(tabs)/(main)/season/lesson-planner' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/season/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/season/settings' },
] as const;

const PARISH_NAV = [
  { icon: 'person.3.fill', label: 'Volunteer Manager', route: '/(tabs)/(main)/season/volunteers' },
  { icon: 'figure.and.child.holdinghands', label: 'Check-In', route: '/(tabs)/(main)/season/checkin' },
  { icon: 'person.2.fill', label: 'Groups', route: '/(tabs)/(main)/season/groups' },
  { icon: 'archivebox.fill', label: 'Archive', route: '/(tabs)/(main)/season/archive' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/season/settings' },
] as const;

export function SeasonPanel() {
  const router = useRouter();
  const mode = useMode();
  const isOffice = mode === 'business';
  const isCampus = mode === 'education';
  const isParish = mode === 'church';
  const title = isParish ? 'Parish' : isCampus ? 'Campus' : isOffice ? 'Office' : 'Season';
  const navItems = isParish ? PARISH_NAV : isCampus ? CAMPUS_NAV : isOffice ? OFFICE_NAV : SPORTS_NAV;

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
