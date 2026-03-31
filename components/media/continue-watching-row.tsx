/**
 * Continue Watching Row — horizontal scroll of partially-watched items.
 * Shows progress bar and watch timestamp.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { formatDuration } from '@/data/mock-video';
import type { WatchHistoryItem } from '@/data/mock-video';

interface ContinueWatchingRowProps {
  items: WatchHistoryItem[];
}

export function ContinueWatchingRow({ items }: ContinueWatchingRowProps) {
  const incomplete = items.filter((i) => i.progress < 100);
  if (incomplete.length === 0) return null;

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Continue Watching</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {incomplete.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: pressed ? '#0B0F14' : '#111' },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.thumb, { backgroundColor: item.thumbnailColor }]}>
              <View style={styles.playCircle}>
                <IconSymbol name="play.fill" size={12} color="#fff" />
              </View>
              <View style={styles.durationBadge}>
                <ThemedText style={styles.durationText}>
                  {formatDuration(item.duration)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
            <View style={styles.info}>
              <ThemedText style={styles.title} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={styles.meta}>{item.progress}% watched</ThemedText>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  card: {
    width: 180,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  thumb: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#0B0F14',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#FFFFFF',
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  meta: {
    fontSize: 10,
    color: '#9C9790',
  },
});
