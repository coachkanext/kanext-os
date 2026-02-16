/**
 * Block 2 — Today / Next Cards
 * Two stacked cards showing TODAY and NEXT items.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DashboardTodayNextItem } from '@/types/dashboard';

export function TodayNextCards({ items }: { items: DashboardTodayNextItem[] }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isToday = item.type === 'today';
        return (
          <Pressable
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              if (item.routeTarget) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.routeTarget as any);
              }
            }}
            disabled={!item.routeTarget}
          >
            <View style={[styles.typeBadge, { backgroundColor: isToday ? colors.text + '15' : colors.text + '0A' }]}>
              <ThemedText style={[styles.typeBadgeText, { color: isToday ? colors.text : colors.textTertiary }]}>
                {item.type.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={[styles.title, { color: colors.text }]}>{item.title}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>{item.subtitle}</ThemedText>
            {item.metadata != null && (
              <ThemedText style={[styles.metadata, { color: colors.textTertiary }]}>{item.metadata}</ThemedText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  metadata: {
    fontSize: 12,
    marginTop: 4,
  },
});
