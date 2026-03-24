/**
 * Hub Side Panel — owner-only, swipe right on Hub screen.
 * Navigate, view notifications, and access settings.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { HUB_PROFILE } from '@/data/mock-hub';

const NAV_ITEMS = [
  { icon: 'square.grid.2x2',    label: 'Overview' },
  { icon: 'doc.richtext',        label: 'Page' },
  { icon: 'person.2.fill',       label: 'Members' },
] as const;

const SETTINGS_ITEMS = [
  { icon: 'star.fill',          label: 'Subscription Settings' },
  { icon: 'dollarsign.circle',  label: 'Payout Settings' },
  { icon: 'person.crop.circle', label: 'Profile Settings' },
] as const;

const NOTIFICATIONS = [
  { icon: 'person.fill.badge.plus', label: '12 new followers',   color: '#5A8A6E' },
  { icon: 'star.fill',              label: '2 new subscribers',  color: '#D97757' },
  { icon: 'dollarsign.circle.fill', label: '$340 payout ready',  color: '#5A8A6E' },
] as const;

export function HubPanel() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const navigate = (tab?: string) => {
    closeSidePanel();
    if (tab) {
      setTimeout(() => router.push({ pathname: '/(tabs)/(main)/hub' as any, params: { tab } }), 80);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: C.surfacePressed }]}>
          <Text style={[styles.avatarText, { color: C.label }]}>{HUB_PROFILE.avatarInitials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: C.label }]}>{HUB_PROFILE.name}</Text>
          <Text style={[styles.headerHandle, { color: C.secondary }]}>{HUB_PROFILE.handle}</Text>
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
            navigate(item.label);
          }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
      ))}

      <View style={[styles.divider, { backgroundColor: C.separator }]} />

      {/* Notifications */}
      <Text style={[styles.sectionLabel, { color: C.secondary }]}>Notifications</Text>
      {NOTIFICATIONS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && { backgroundColor: C.surfacePressed },
            idx < NOTIFICATIONS.length - 1 && [styles.navRowBorder, { borderBottomColor: C.separator }],
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name={item.icon as any} size={18} color={item.color} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  headerHandle: { fontSize: 13 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 4,
    marginTop: 4,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16, marginHorizontal: 0 },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 8,
  },
  navRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navLabel: { flex: 1, fontSize: 15 },
});
