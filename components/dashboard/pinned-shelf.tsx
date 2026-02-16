/**
 * Block 6 — Pinned Shelf
 * Horizontal FlatList of cards (width ~160). Type badge, title, subtitle.
 * Hidden if empty.
 */

import React from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DashboardPinnedItem } from '@/types/dashboard';

const TYPE_LABELS: Record<DashboardPinnedItem['type'], string> = {
  eval_snapshot: 'EVAL',
  sim_result: 'SIM',
  scout_packet: 'SCOUT',
  doc_link: 'DOC',
  video_clip: 'VIDEO',
};

export function PinnedShelf({ items }: { items?: DashboardPinnedItem[] }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  if (!items || items.length === 0) return null;

  return (
    <View>
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>PINNED</ThemedText>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              if (item.routeTarget) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.routeTarget as any);
              }
            }}
            disabled={!item.routeTarget}
          >
            <View style={[styles.typeBadge, { backgroundColor: colors.text + '12' }]}>
              <ThemedText style={[styles.typeBadgeText, { color: colors.textTertiary }]}>
                {TYPE_LABELS[item.type]}
              </ThemedText>
            </View>
            <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            {item.subtitle != null && (
              <ThemedText style={[styles.subtitle, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.subtitle}
              </ThemedText>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  listContent: {
    gap: Spacing.sm,
  },
  card: {
    width: 160,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});
