/**
 * Community Hub Side Panel — admin-only, swipe right on Community Hub screen.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { COMMUNITY_PROFILE, COMMUNITY_ANALYTICS } from '@/data/mock-community-hub';

const SETTINGS_ITEMS = [
  { icon: 'person.crop.circle', label: 'Community Profile' },
  { icon: 'lock.shield',        label: 'Permissions' },
  { icon: 'bell.fill',          label: 'Notification Settings' },
] as const;

export function CommunityHubPanel() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const a = COMMUNITY_ANALYTICS;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `hsl(${COMMUNITY_PROFILE.coverHue},55%,30%)` }]}>
          <Text style={styles.avatarText}>{COMMUNITY_PROFILE.avatarInitials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: C.label }]}>{COMMUNITY_PROFILE.name}</Text>
          <Text style={[styles.headerSub, { color: C.secondary }]}>{COMMUNITY_PROFILE.location}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={[styles.statsRow, { backgroundColor: C.surfacePressed, borderRadius: 12 }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: C.label }]}>{a.memberCount}</Text>
          <Text style={[styles.statLabel, { color: C.secondary }]}>Members</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: C.separator }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: C.label }]}>{a.attendance}</Text>
          <Text style={[styles.statLabel, { color: C.secondary }]}>Attendance</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: C.separator }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#1A1714' }]}>{a.careRequests}</Text>
          <Text style={[styles.statLabel, { color: C.secondary }]}>Care Reqs</Text>
        </View>
      </View>

      {/* ── Home ── */}
      <Pressable
        style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: C.surfacePressed }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          closeSidePanel();
          router.setParams({ manage: undefined });
        }}
      >
        <IconSymbol name="house.fill" size={18} color={C.secondary} />
        <Text style={[styles.navLabel, { color: C.label }]}>Home</Text>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: C.separator }]} />

      {/* Quick Actions */}
      <Text style={[styles.sectionLabel, { color: C.secondary }]}>Quick Actions</Text>
      {[
        { icon: 'megaphone.fill',        label: 'Send Announcement', action: () => { closeSidePanel(); setTimeout(() => router.push('/(tabs)/(main)/hub/announcement-compose' as any), 80); } },
        { icon: 'calendar.badge.plus',   label: 'Create Event',      action: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); } },
        { icon: 'heart.text.square.fill',label: 'Care Requests',     action: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigate('Overview'); } },
      ].map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && { backgroundColor: C.surfacePressed },
            idx < 2 && [styles.navRowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            item.action();
          }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.accent} />
          <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
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
  avatarText:  { fontSize: 15, fontWeight: '800', color: '#fff' },
  headerInfo:  { flex: 1 },
  headerName:  { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  headerSub:   { fontSize: 12 },

  statsRow:    { flexDirection: 'row', marginHorizontal: 0, marginBottom: 20, padding: 12 },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 18, fontWeight: '800' },
  statLabel:   { fontSize: 10, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28, alignSelf: 'center' },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.5,
    textTransform: 'uppercase', paddingHorizontal: 16,
    marginBottom: 4, marginTop: 4,
  },
  divider:     { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  navRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8 },
  navRowBorder:{ borderBottomWidth: StyleSheet.hairlineWidth },
  navLabel:    { flex: 1, fontSize: 15 },
});
