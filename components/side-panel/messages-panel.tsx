/**
 * Messages Side Panel — FINAL spec.
 * No scroll. Everything visible at once.
 * Top: mode filter pills (single row).
 * Bottom: 5 menu rows (icon + label, no chevrons).
 */

import React, { useState } from 'react';
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
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  labelDark: '#000000',
};

type ModeFilter = 'all' | 'sports' | 'business' | 'church' | 'education';

const MODE_PILLS: { key: ModeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'sports', label: 'Sports' },
  { key: 'business', label: 'Business' },
  { key: 'church', label: 'Faith' },
  { key: 'education', label: 'Education' },
];

const MENU_ITEMS = [
  { icon: 'number', label: 'Channel Management', route: '/(tabs)/(main)/messages/channels' },
  { icon: 'archivebox.fill', label: 'Archived', route: '/(tabs)/(main)/messages/archived' },
  { icon: 'hand.raised.fill', label: 'Blocked', route: '/(tabs)/(main)/messages/blocked' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/messages/notifications' },
  { icon: 'phone.fill', label: 'My Numbers', route: null },
] as const;

export function MessagesPanel() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<ModeFilter>('all');

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
      {/* ── MODE FILTER PILLS ── */}
      <View style={styles.pillRow}>
        {MODE_PILLS.map((pill) => {
          const active = activeFilter === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(pill.key);
              }}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {pill.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── 20px SPACER ── */}
      <View style={{ height: 20 }} />

      {/* ── MENU ROWS ── */}
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.menuRow,
            pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (item.route) navigateTo(item.route);
          }}
        >
          <IconSymbol name={item.icon as any} size={20} color={C.label} />
          <Text style={styles.menuLabel}>{item.label}</Text>
        </Pressable>
      ))}

      {/* ── 32px BOTTOM PADDING ── */}
      <View style={{ height: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: C.surface,
  },
  pillActive: {
    backgroundColor: '#FFFFFF',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.label,
  },
  pillTextActive: {
    color: C.labelDark,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  menuLabel: {
    fontSize: 16,
    color: C.label,
  },
});
