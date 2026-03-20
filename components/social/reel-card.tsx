/**
 * ReelCard — single full-screen reel with video playback + side actions + bottom info.
 * Uses expo-av Video for actual video playback. Double-tap for like animation.
 */

import React, { useRef, useState, useCallback, useEffect, useMemo, Component } from 'react';
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
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { SocialReel } from '@/data/mock-social';

// Graceful fallback if expo-av native module isn't linked
let Video: any = null;
let ResizeMode: any = {};
try {
  const av = require('expo-av');
  Video = av.Video;
  ResizeMode = av.ResizeMode;
} catch {}

/** Catches native view registration errors */
class VideoBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

interface ReelCardProps {
  reel: SocialReel;
  isLiked: boolean;
  isBookmarked: boolean;
  isActive: boolean;
  onLikeToggle: () => void;
  onBookmarkToggle: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
}

export function ReelCard({
  reel,
  isLiked,
  isBookmarked,
  isActive,
  onLikeToggle,
  onBookmarkToggle,
  onCommentPress,
  onSharePress,
}: ReelCardProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const lastTapRef = useRef(0);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const videoRef = useRef<any>(null);

  const likeCount = isLiked && !reel.isLiked
    ? reel.likeCount + 1
    : !isLiked && reel.isLiked
      ? reel.likeCount - 1
      : reel.likeCount;

  // Control playback based on visibility
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.playAsync?.()?.catch?.(() => {});
    } else {
      videoRef.current.pauseAsync?.()?.catch?.(() => {});
    }
  }, [isActive]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) onLikeToggle();
      setShowLikeAnim(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastTapRef.current = now;
  }, [isLiked, onLikeToggle]);

  const posterFallback = reel.posterUri ? (
    <Image
      source={{ uri: reel.posterUri }}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    />
  ) : null;

  return (
    <Pressable onPress={handleTap} style={{ width: screenWidth, height: screenHeight }}>
      <View style={[styles.container, { width: screenWidth, height: screenHeight }]}>
        {/* Poster image (shown while video loads) */}
        {reel.posterUri && (
          <Image
            source={{ uri: reel.posterUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}

        {/* Video layer */}
        {Video ? (
          <VideoBoundary fallback={posterFallback}>
            <Video
              ref={videoRef}
              source={{ uri: reel.videoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER ?? 'cover'}
              shouldPlay={isActive}
              isLooping
              isMuted
              onError={() => {}}
            />
          </VideoBoundary>
        ) : (
          /* Fallback: show poster as static image if no Video module */
          !reel.posterUri && (
            <Image
              source={{ uri: reel.videoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )
        )}

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
              color={isLiked ? '#FF3B30' : C.label}
            />
            <Text style={styles.sideCount}>{formatCount(likeCount)}</Text>
          </Pressable>

          {/* Comment */}
          <Pressable
            style={styles.sideItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCommentPress?.();
            }}
          >
            <IconSymbol name="bubble.right" size={28} color={C.label} />
            <Text style={styles.sideCount}>{formatCount(reel.commentCount)}</Text>
          </Pressable>

          {/* Share */}
          <Pressable
            style={styles.sideItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSharePress?.();
            }}
          >
            <IconSymbol name="paperplane" size={26} color={C.label} />
            <Text style={styles.sideCount}>{formatCount(reel.shareCount)}</Text>
          </Pressable>

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
              color={C.label}
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

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    backgroundColor: C.bg,
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
    color: C.label,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: C.label,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  creatorAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
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
    color: C.label,
  },
  creatorUsername: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  caption: {
    fontSize: 14,
    color: C.label,
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
