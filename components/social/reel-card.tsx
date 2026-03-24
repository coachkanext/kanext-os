/**
 * ReelCard — single full-screen reel with video playback + side actions + bottom info.
 * Uses expo-av Video for actual video playback. Single-tap pause/play, double-tap like.
 */

import React, { useRef, useState, useCallback, useEffect, useMemo, Component } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  const insets = useSafeAreaInsets();
  const lastTapRef = useRef(0);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [showTapIcon, setShowTapIcon] = useState<'play' | 'pause' | null>(null);
  const [progress, setProgress] = useState(0);
  const tapIconAnim = useRef(new Animated.Value(0)).current;
  const vinylAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<any>(null);

  const likeCount = isLiked && !reel.isLiked
    ? reel.likeCount + 1
    : !isLiked && reel.isLiked
      ? reel.likeCount - 1
      : reel.likeCount;

  // Control playback based on visibility and paused state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive && !paused) {
      videoRef.current.playAsync?.()?.catch?.(() => {});
    } else {
      videoRef.current.pauseAsync?.()?.catch?.(() => {});
    }
  }, [isActive, paused]);

  // Spinning vinyl animation
  useEffect(() => {
    if (!reel.musicTrack || !isActive) return;
    const anim = Animated.loop(
      Animated.timing(vinylAnim, { toValue: 1, duration: 4000, useNativeDriver: true, easing: Easing.linear })
    );
    anim.start();
    return () => anim.stop();
  }, [reel.musicTrack, isActive, vinylAnim]);

  const vinylSpin = vinylAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // double-tap: like
      if (!isLiked) onLikeToggle();
      setShowLikeAnim(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      // single-tap: pause/play
      setPaused(v => {
        const next = !v;
        setShowTapIcon(next ? 'pause' : 'play');
        Animated.sequence([
          Animated.timing(tapIconAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(500),
          Animated.timing(tapIconAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setShowTapIcon(null));
        return next;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    lastTapRef.current = now;
  }, [isLiked, onLikeToggle, tapIconAnim]);

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
        {reel.posterUri ? (
          <Image
            source={{ uri: reel.posterUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null}

        {/* Video layer */}
        {Video ? (
          <VideoBoundary fallback={posterFallback}>
            <Video
              ref={videoRef}
              source={{ uri: reel.videoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER ?? 'cover'}
              shouldPlay={isActive && !paused}
              isLooping
              isMuted={muted}
              onError={() => {}}
              onPlaybackStatusUpdate={(status: any) => {
                if (status.isLoaded && status.durationMillis) {
                  setProgress(status.positionMillis / status.durationMillis);
                }
              }}
            />
          </VideoBoundary>
        ) : (
          !reel.posterUri ? (
            <Image
              source={{ uri: reel.videoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : null
        )}

        {/* Like animation overlay */}
        <LikeAnimation
          visible={showLikeAnim}
          onComplete={() => setShowLikeAnim(false)}
        />

        {/* Tap icon flash (center screen) */}
        {showTapIcon ? (
          <Animated.View style={[styles.tapIcon, { opacity: tapIconAnim }]} pointerEvents="none">
            <IconSymbol
              name={showTapIcon === 'pause' ? 'pause.fill' : 'play.fill'}
              size={56}
              color="rgba(255,255,255,0.85)"
            />
          </Animated.View>
        ) : null}

        {/* Mute button — below the 52px top nav bar */}
        <Pressable
          style={[styles.muteBtn, { top: insets.top + 62 }]}
          onPress={() => setMuted(v => !v)}
        >
          <IconSymbol
            name={muted ? 'speaker.slash.fill' : 'speaker.wave.2.fill'}
            size={18}
            color="#fff"
          />
        </Pressable>

        {/* Three-dot menu */}
        <Pressable
          style={[styles.menuBtn, { top: insets.top + 106 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="ellipsis" size={18} color="#fff" />
        </Pressable>

        {/* Right side action stack */}
        <View style={[styles.sideActions, { bottom: 160, right: 12 }]}>
          {/* Creator avatar */}
          <View style={styles.sideItem}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarText}>{reel.creator.initials}</Text>
            </View>
          </View>

          {/* Follow button */}
          <View style={styles.sideItem}>
            <Pressable
              style={[styles.followBtn, { backgroundColor: C.accent }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="plus" size={14} color="#fff" />
            </Pressable>
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
              color={isLiked ? '#FF3B30' : '#fff'}
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
            <IconSymbol name="bubble.right" size={28} color="#fff" />
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
            <IconSymbol name="paperplane" size={26} color="#fff" />
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
              color="#fff"
            />
          </Pressable>
        </View>

        {/* Bottom gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.bottomGradient}
        >
          <Text style={styles.creatorName}>{reel.creator.name}</Text>
          <Text style={styles.creatorUsername}>{reel.creator.username}</Text>
          <Text style={styles.caption} numberOfLines={captionExpanded ? undefined : 2}>
            {reel.caption}
          </Text>
          {!captionExpanded && reel.caption.length > 80 ? (
            <Pressable onPress={() => setCaptionExpanded(true)}>
              <Text style={styles.captionMore}>more</Text>
            </Pressable>
          ) : null}
          {reel.musicTrack ? (
            <View style={styles.musicRow}>
              <Animated.View style={[styles.vinylDisc, { transform: [{ rotate: vinylSpin }] }]}>
                <IconSymbol name="music.note" size={9} color="#fff" />
              </Animated.View>
              <Text style={styles.musicTrack} numberOfLines={1}>{reel.musicTrack}</Text>
            </View>
          ) : null}
        </LinearGradient>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    backgroundColor: '#000',
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
    color: '#fff',
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  creatorAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  followBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  muteBtn: {
    position: 'absolute',
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    position: 'absolute',
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 60,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  creatorUsername: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  caption: {
    fontSize: 14,
    color: '#fff',
    marginTop: 6,
    lineHeight: 20,
  },
  captionMore: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  vinylDisc: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicTrack: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  tapIcon: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '42%' as any,
    alignItems: 'center',
  },
  progressBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    zIndex: 5,
  },
  progressFill: {
    height: 2,
    backgroundColor: '#fff',
  },
});
