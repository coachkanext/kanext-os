/**
 * ExploreShelfItemCard — Individual video card inside a shelf carousel.
 * Thumbnail color block + title + subtitle + duration + views + source.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ExploreShelfItem } from '@/data/mock-sports-explore-v2';

interface ExploreShelfItemCardProps {
  item: ExploreShelfItem;
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function ExploreShelfItemCard({ item }: ExploreShelfItemCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      {/* Thumbnail */}
      <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]}>
        <View style={styles.playIcon}>
          <IconSymbol name="play.fill" size={14} color="#fff" />
        </View>
        {item.badge && (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
          </View>
        )}
        <View style={styles.duration}>
          <ThemedText style={styles.durationText}>{item.duration}</ThemedText>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.subtitle}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.source, { color: colors.textTertiary }]} numberOfLines={1}>
            {item.source}
          </ThemedText>
          <View style={styles.viewsRow}>
            <IconSymbol name="eye.fill" size={10} color={colors.textTertiary} />
            <ThemedText style={[styles.views, { color: colors.textTertiary }]}>
              {formatViews(item.viewCount)}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.date, { color: colors.textTertiary }]}>{item.date}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  duration: {
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
  info: {
    padding: 8,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  source: {
    fontSize: 10,
    flex: 1,
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  views: {
    fontSize: 10,
  },
  date: {
    fontSize: 10,
    marginTop: 1,
  },
});
