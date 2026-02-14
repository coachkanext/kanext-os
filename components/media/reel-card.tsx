/**
 * Reel Card — compact reel thumbnail with duration, caption, tags, and actions.
 * Used in horizontal scroll rows and grids.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/theme';
import { formatDuration } from '@/data/mock-video';
import type { Reel } from '@/data/mock-video';

interface ReelCardProps {
  reel: Reel;
  onPress?: () => void;
  variant?: 'horizontal' | 'grid';
}

export function ReelCard({ reel, onPress, variant = 'horizontal' }: ReelCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  if (variant === 'grid') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.gridCard,
          { backgroundColor: pressed ? '#191919' : '#111' },
        ]}
        onPress={handlePress}
      >
        <View style={[styles.gridThumb, { backgroundColor: reel.thumbnailColor }]}>
          <View style={styles.playCircle}>
            <IconSymbol name="play.fill" size={14} color="#fff" />
          </View>
          <View style={styles.duration}>
            <ThemedText style={styles.durationText}>{formatDuration(reel.duration)}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.gridCaption} numberOfLines={2}>{reel.caption}</ThemedText>
        <View style={styles.gridMeta}>
          <ThemedText style={styles.gridLikes}>{reel.likes} likes</ThemedText>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? '#191919' : '#111' },
      ]}
      onPress={handlePress}
    >
      <View style={[styles.thumb, { backgroundColor: reel.thumbnailColor }]}>
        <View style={styles.playCircle}>
          <IconSymbol name="play.fill" size={12} color="#fff" />
        </View>
        <View style={styles.duration}>
          <ThemedText style={styles.durationText}>{formatDuration(reel.duration)}</ThemedText>
        </View>
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.caption} numberOfLines={1}>{reel.caption}</ThemedText>
        <View style={styles.tagRow}>
          {reel.playerTag && (
            <View style={styles.tag}>
              <ThemedText style={styles.tagText}>
                #{reel.playerTag.number} {reel.playerTag.name}
              </ThemedText>
            </View>
          )}
          {reel.teamTag && !reel.playerTag && (
            <View style={styles.tag}>
              <ThemedText style={styles.tagText}>{reel.teamTag}</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.statsRow}>
          <IconSymbol name="heart.fill" size={10} color="#555" />
          <ThemedText style={styles.statText}>{reel.likes}</ThemedText>
          <IconSymbol name="bookmark.fill" size={10} color="#555" />
          <ThemedText style={styles.statText}>{reel.saves}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Horizontal variant
  card: {
    width: 160,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  thumb: {
    aspectRatio: 9 / 16,
    maxHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
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
  content: {
    padding: 8,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: '#191919',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#6e6e6e',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: '#555',
    marginRight: 4,
  },

  // Grid variant
  gridCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    margin: 4,
  },
  gridThumb: {
    aspectRatio: 9 / 16,
    maxHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridCaption: {
    fontSize: 11,
    fontWeight: '500',
    color: '#f5f5f5',
    paddingHorizontal: 6,
    paddingTop: 6,
    lineHeight: 15,
  },
  gridMeta: {
    paddingHorizontal: 6,
    paddingBottom: 6,
    paddingTop: 2,
  },
  gridLikes: {
    fontSize: 10,
    color: '#6e6e6e',
  },
});
