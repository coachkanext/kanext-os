/**
 * ReelCard — single full-screen reel with side action buttons + bottom info.
 * Poster image fills screen. Double-tap for like animation.
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LikeAnimation } from './like-animation';
import type { SocialReel } from '@/data/mock-social';

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

interface ReelCardProps {
  reel: SocialReel;
  isLiked: boolean;
  isBookmarked: boolean;
  onLikeToggle: () => void;
  onBookmarkToggle: () => void;
}

export function ReelCard({
  reel,
  isLiked,
  isBookmarked,
  onLikeToggle,
  onBookmarkToggle,
}: ReelCardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const lastTapRef = useRef(0);
  const [showLikeAnim, setShowLikeAnim] = useState(false);

  const likeCount = isLiked && !reel.isLiked
    ? reel.likeCount + 1
    : !isLiked && reel.isLiked
      ? reel.likeCount - 1
      : reel.likeCount;

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) onLikeToggle();
      setShowLikeAnim(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastTapRef.current = now;
  }, [isLiked, onLikeToggle]);

  return (
    <Pressable onPress={handleTap} style={{ width: screenWidth, height: screenHeight }}>
      <View style={[styles.container, { width: screenWidth, height: screenHeight }]}>
        {/* Background image (reel poster) */}
        <Image
          source={{ uri: reel.videoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Like animation overlay */}
        <LikeAnimation
          visible={showLikeAnim}
          onComplete={() => setShowLikeAnim(false)}
        />

        {/* Right side action stack */}
        <View style={[styles.sideActions, { bottom: 160, right: 12 }]}>
          {/* Creator avatar */}
          <View style={styles.sideItem}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarText}>{reel.creator.initials}</Text>
            </View>
          </View>

          {/* Like */}
          <Pressable
            style={styles.sideItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onLikeToggle();
            }}
          >
            <IconSymbol
              name={isLiked ? 'heart.fill' : 'heart'}
              size={28}
              color={isLiked ? '#FF3B30' : '#FFFFFF'}
            />
            <Text style={styles.sideCount}>{formatCount(likeCount)}</Text>
          </Pressable>

          {/* Comment */}
          <View style={styles.sideItem}>
            <IconSymbol name="bubble.right" size={28} color="#FFFFFF" />
            <Text style={styles.sideCount}>{formatCount(reel.commentCount)}</Text>
          </View>

          {/* Share */}
          <View style={styles.sideItem}>
            <IconSymbol name="paperplane" size={26} color="#FFFFFF" />
            <Text style={styles.sideCount}>{formatCount(reel.shareCount)}</Text>
          </View>

          {/* Bookmark */}
          <Pressable
            style={styles.sideItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onBookmarkToggle();
            }}
          >
            <IconSymbol
              name={isBookmarked ? 'bookmark.fill' : 'bookmark'}
              size={26}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* Bottom overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.bottomGradient}>
            <Text style={styles.creatorName}>{reel.creator.name}</Text>
            <Text style={styles.creatorUsername}>{reel.creator.username}</Text>
            <Text style={styles.caption} numberOfLines={2}>
              {reel.caption}
            </Text>
            {reel.musicTrack && (
              <View style={styles.musicRow}>
                <IconSymbol name="music.note" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.musicTrack} numberOfLines={1}>
                  {reel.musicTrack}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  sideActions: {
    position: 'absolute',
    alignItems: 'center',
    gap: 20,
  },
  sideItem: {
    alignItems: 'center',
    gap: 4,
  },
  sideCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  creatorAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80,
  },
  bottomGradient: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  creatorUsername: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  caption: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 6,
    lineHeight: 20,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  musicTrack: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
});
