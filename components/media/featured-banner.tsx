/**
 * FeaturedBanner — large featured/live banner at top of Media Browse page.
 * Full-width, 200px height, rounded corners. Play icon overlay.
 * If live: pulsing red LIVE badge top-left.
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, Animated, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { BrowseVideo } from '@/data/mock-media';

interface FeaturedBannerProps {
  video: BrowseVideo;
}

export function FeaturedBanner({ video }: FeaturedBannerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!video.isLive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [video.isLive, pulseAnim]);

  return (
    <Pressable style={styles.container}>
      <View style={[styles.thumbnail, { backgroundColor: video.thumbnailColor }]}>
        {video.thumbnailUrl && (
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
        {/* Play icon overlay */}
        <View style={styles.playOverlay}>
          <IconSymbol name="play.fill" size={36} color="#FFFFFF" />
        </View>

        {/* LIVE badge */}
        {video.isLive && (
          <Animated.View style={[styles.liveBadge, { opacity: pulseAnim }]}>
            <Text style={styles.liveText}>LIVE</Text>
          </Animated.View>
        )}

        {/* Bottom gradient area */}
        <View style={styles.bottomGradient}>
          <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
          <Text style={styles.creator} numberOfLines={1}>{video.creator}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  thumbnail: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  creator: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: 2,
  },
});
