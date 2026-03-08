/**
 * BrowseVideoCard — single video thumbnail card for category rows.
 * 180px wide, 16:9 thumbnail, duration/LIVE badge, title, creator, view count + timestamp.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatViewCount, formatVideoTime } from '@/data/mock-media';
import type { BrowseVideo } from '@/data/mock-media';

interface BrowseVideoCardProps {
  video: BrowseVideo;
  onLongPress?: (pageY: number) => void;
}

export function BrowseVideoCard({ video, onLongPress }: BrowseVideoCardProps) {
  return (
    <Pressable
      style={styles.container}
      onLongPress={(e) => onLongPress?.(e.nativeEvent.pageY)}
      delayLongPress={400}
    >
      {/* Thumbnail */}
      <View style={[styles.thumbnail, { backgroundColor: video.thumbnailColor }]}>
        {/* Play icon */}
        <View style={styles.playOverlay}>
          <IconSymbol name="play.fill" size={20} color="#FFFFFF" />
        </View>

        {/* Duration or LIVE badge */}
        {video.isLive ? (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatVideoTime(video.duration)}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
      <Text style={styles.creator} numberOfLines={1}>{video.creator}</Text>
      <Text style={styles.meta} numberOfLines={1}>
        {formatViewCount(video.viewCount)} · {video.timestamp}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
  },
  thumbnail: {
    width: 180,
    height: 101, // 16:9
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  playOverlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  creator: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  meta: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 1,
  },
});
