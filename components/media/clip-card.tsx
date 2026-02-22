/**
 * Clip Card — individual clip card.
 * Horizontal row: small thumbnail + title + duration + source badge.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { formatDuration } from '@/data/mock-video';
import type { VideoClip } from '@/data/mock-video';

interface ClipCardProps {
  clip: VideoClip;
  variant?: 'row' | 'grid';
}

export function ClipCard({ clip, variant = 'row' }: ClipCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (variant === 'grid') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.gridCard,
          { backgroundColor: pressed ? '#0B0F14' : '#111' },
        ]}
        onPress={handlePress}
      >
        <View style={[styles.gridThumb, { backgroundColor: clip.thumbnailColor }]}>
          <View style={styles.gridPlayCircle}>
            <IconSymbol name="play.fill" size={14} color="#fff" />
          </View>
          <View style={styles.gridDuration}>
            <ThemedText style={styles.gridDurationText}>{formatDuration(clip.duration)}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.gridTitle} numberOfLines={2}>{clip.title}</ThemedText>
        <ThemedText style={styles.gridSource}>{clip.source}</ThemedText>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.rowCard,
        { backgroundColor: pressed ? '#0B0F14' : 'transparent' },
      ]}
      onPress={handlePress}
    >
      {/* Small Thumbnail */}
      <View style={[styles.rowThumb, { backgroundColor: clip.thumbnailColor }]}>
        <IconSymbol name="play.fill" size={12} color="#fff" />
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <ThemedText style={styles.rowTitle} numberOfLines={1}>{clip.title}</ThemedText>
        <View style={styles.rowMeta}>
          <ThemedText style={styles.rowDuration}>{formatDuration(clip.duration)}</ThemedText>
          <View style={styles.sourceBadge}>
            <ThemedText style={styles.sourceText}>{clip.source}</ThemedText>
          </View>
        </View>
      </View>

      {/* Type indicator */}
      <View style={styles.typeBadge}>
        <ThemedText style={styles.typeText}>{clip.type}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Row variant
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
  },
  rowThumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm + 4,
  },
  rowContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowDuration: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  sourceBadge: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 10,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  typeBadge: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  // Grid variant
  gridCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    margin: 4,
  },
  gridThumb: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridPlayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  gridDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  gridDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    paddingHorizontal: 6,
    paddingTop: 6,
    lineHeight: 16,
  },
  gridSource: {
    fontSize: 10,
    color: '#A1A1AA',
    paddingHorizontal: 6,
    paddingBottom: 6,
    paddingTop: 2,
  },
});
