/**
 * Video Thumbnail — reusable thumbnail placeholder.
 * Colored rectangle with play icon overlay, duration badge, optional tag pills.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius } from '@/constants/theme';
import { formatDuration } from '@/data/mock-video';

interface VideoThumbnailProps {
  color: string;
  duration: number;
  tags?: string[];
  aspectRatio?: number; // default 16/9
}

export function VideoThumbnail({ color, duration, tags, aspectRatio = 16 / 9 }: VideoThumbnailProps) {
  return (
    <View style={[styles.container, { backgroundColor: color, aspectRatio }]}>
      {/* Play Icon */}
      <View style={styles.playOverlay}>
        <View style={styles.playCircle}>
          <IconSymbol name="play.fill" size={20} color="#fff" />
        </View>
      </View>

      {/* Duration Badge */}
      <View style={styles.durationBadge}>
        <ThemedText style={styles.durationText}>{formatDuration(duration)}</ThemedText>
      </View>

      {/* Tag Pills */}
      {tags && tags.length > 0 && (
        <View style={styles.tagRow}>
          {tags.slice(0, 2).map((tag, i) => (
            <View key={i} style={styles.tagPill}>
              <ThemedText style={styles.tagText}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  tagRow: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    gap: 4,
  },
  tagPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
});
