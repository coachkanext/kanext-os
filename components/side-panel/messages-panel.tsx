/**
 * Messages Side Panel — Menu rows that each open a full page.
 * Search, Filters, Channel Management, Notification Settings, Archived, Blocked.
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
import { closeSidePanel } from '@/utils/global-side-panel';

const C = {
  bg: '#000000',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
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

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
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
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={styles.menuLabel}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: C.label,
  },
});
