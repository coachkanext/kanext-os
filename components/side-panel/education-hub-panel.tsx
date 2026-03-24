/**
 * Education Hub Side Panel — admin sees dean tools, student sees quick nav.
 * Content adapts based on isAdmin prop (determined by screen state — passed via
 * a simple export/import of shared state is beyond the panel's scope, so this
 * always renders the admin panel since only admins have sidebar access).
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { EDUCATION_PROFILE, EDUCATION_ANALYTICS } from '@/data/mock-education-hub';

const NAV_ITEMS = [
  { icon: 'square.grid.2x2',   label: 'Overview',     tab: 'Overview'     },
  { icon: 'book.fill',          label: 'Academics',    tab: 'Academics'    },
  { icon: 'figure.walk',        label: 'Student Life', tab: 'Student Life' },
] as const;

const QUICK_ACTIONS = [
  { icon: 'megaphone.fill',          label: 'Send Announcement' },
  { icon: 'tray.fill',               label: 'View Applications' },
  { icon: 'chart.bar.doc.horizontal',label: 'Run Report' },
] as const;

const SETTINGS_ITEMS = [
  { icon: 'calendar',               label: 'Academic Calendar' },
  { icon: 'doc.badge.gearshape',    label: 'Grading Policies' },
  { icon: 'building.columns',       label: 'Department Management' },
] as const;

export function EducationHubPanel() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const a = EDUCATION_ANALYTICS;

  const navigate = (tab: string) => {
    closeSidePanel();
    setTimeout(() => router.push({ pathname: '/(tabs)/(main)/hub/education' as any, params: { tab } }), 80);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `hsl(${EDUCATION_PROFILE.coverHue},55%,30%)` }]}>
          <Text style={styles.avatarText}>{EDUCATION_PROFILE.avatarInitials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: C.label }]}>{EDUCATION_PROFILE.name}</Text>
          <Text style={[styles.headerSub, { color: C.secondary }]}>{EDUCATION_PROFILE.location}</Text>
        </View>
      </View>

      {/* Quick stats */}
      <View style={[styles.statsRow, { backgroundColor: C.surfacePressed, borderRadius: 12 }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: C.label }]}>{a.totalEnrollment.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: C.secondary }]}>Enrolled</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: C.separator }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: C.label }]}>{a.retentionRate}%</Text>
          <Text style={[styles.statLabel, { color: C.secondary }]}>Retention</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: C.separator }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#D97757' }]}>{a.applicationsPending}</Text>
          <Text style={[styles.statLabel, { color: C.secondary }]}>Pending Apps</Text>
        </View>
      </View>

      {/* Navigate */}
      <Text style={[styles.sectionLabel, { color: C.secondary }]}>Navigate</Text>
      {NAV_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && { backgroundColor: C.surfacePressed },
            idx < NAV_ITEMS.length - 1 && [styles.navRowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigate(item.tab);
          }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
      ))}

      <View style={[styles.divider, { backgroundColor: C.separator }]} />

      {/* Quick Actions */}
      <Text style={[styles.sectionLabel, { color: C.secondary }]}>Quick Actions</Text>
      {QUICK_ACTIONS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && { backgroundColor: C.surfacePressed },
            idx < QUICK_ACTIONS.length - 1 && [styles.navRowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (item.label === 'Send Announcement') {
              closeSidePanel();
              setTimeout(() => router.push('/(tabs)/(main)/hub/edu-announcement' as any), 80);
            } else {
              closeSidePanel();
            }
          }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.accent} />
          <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
        </Pressable>
      ))}

      <View style={[styles.divider, { backgroundColor: C.separator }]} />

      {/* Settings */}
      {SETTINGS_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && { backgroundColor: C.surfacePressed },
            idx < SETTINGS_ITEMS.length - 1 && [styles.navRowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            closeSidePanel();
          }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
      ))}

      <View style={{ height: 24 }} />
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, marginBottom: 16,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  headerSub:  { fontSize: 12 },

  statsRow:    { flexDirection: 'row', marginBottom: 20, padding: 12 },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 16, fontWeight: '800' },
  statLabel:   { fontSize: 10, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28, alignSelf: 'center' },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.5,
    textTransform: 'uppercase', paddingHorizontal: 16,
    marginBottom: 4, marginTop: 4,
  },
  divider:      { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  navRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8 },
  navRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  navLabel:     { flex: 1, fontSize: 15 },
});
