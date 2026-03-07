/**
 * Messages Side Panel — My Numbers + Menu rows.
 * 1. My Numbers — reusable component with phone-number + colored pills
 * 2. Menu — Search, Filters, Channel Management, Notification Settings, Archived, Blocked
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { MyNumbersSection } from '@/components/side-panel/my-numbers-section';
import { closeSidePanel } from '@/utils/global-side-panel';
import type { Mode } from '@/types';

const C = {
  bg: '#000000',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  divider: '#2F3336',
};

const MENU_ITEMS = [
  { icon: 'magnifyingglass', label: 'Search', route: '/(tabs)/(main)/messages/search' },
  { icon: 'line.3.horizontal.decrease.circle', label: 'Filters', route: '/(tabs)/(main)/messages/filters' },
  { icon: 'number', label: 'Channel Management', route: '/(tabs)/(main)/messages/channels' },
  { icon: 'bell.fill', label: 'Notification Settings', route: '/(tabs)/(main)/messages/notifications' },
  { icon: 'archivebox.fill', label: 'Archived', route: '/(tabs)/(main)/messages/archived' },
  { icon: 'hand.raised.fill', label: 'Blocked Users', route: '/(tabs)/(main)/messages/blocked' },
] as const;

export function MessagesPanel() {
  const router = useRouter();

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const handleFilter = (mode: Mode) => {
    closeSidePanel();
    // Filter messages by mode — behavior TBD
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── MY NUMBERS ── */}
      <MyNumbersSection onFilter={handleFilter} />

      {/* ── DIVIDER ── */}
      <View style={styles.divider} />

      {/* ── MENU ── */}
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.menuRow,
            pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigateTo(item.route);
          }}
        >
          <IconSymbol name={item.icon as any} size={20} color={C.secondary} />
          <Text style={styles.menuLabel}>{item.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: C.label,
  },
});
