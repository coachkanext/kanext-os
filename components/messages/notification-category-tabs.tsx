/**
 * NotificationCategoryTabs — 6-category horizontal chip tabs for Notifications screen.
 */

import React from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/theme';
import { NOTIFICATION_CATEGORIES } from '@/data/mock-messages';
import type { NotificationCategory } from '@/data/mock-messages';

interface NotificationCategoryTabsProps {
  activeCategory: NotificationCategory;
  onCategoryChange: (category: NotificationCategory) => void;
}

export function NotificationCategoryTabs({
  activeCategory,
  onCategoryChange,
}: NotificationCategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      style={styles.scroll}
    >
      {NOTIFICATION_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.key;
        return (
          <Pressable
            key={cat.key}
            style={[
              styles.chip,
              { backgroundColor: isActive ? '#FFFFFF' : '#111' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCategoryChange(cat.key);
            }}
          >
            <ThemedText
              style={[styles.chipText, { color: isActive ? '#000' : '#A1A1AA' }]}
            >
              {cat.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
