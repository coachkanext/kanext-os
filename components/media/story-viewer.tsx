/**
 * StoryViewer — Full-screen story overlay with progress bars,
 * tap navigation, auto-advance, and swipe-down-to-close.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { StoryCircle, StoryClip } from '@/data/mock-video-feed';

const { height: SCREEN_H } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface StoryViewerProps {
  visible: boolean;
  onClose: () => void;
  stories: StoryCircle[];
  initialIndex: number;
}

export function StoryViewer({ visible, onClose, stories, initialIndex }: StoryViewerProps) {
  const insets = useSafeAreaInsets();

  // Filter to stories that have clips
  const playableStories = stories.filter((s) => s.clips && s.clips.length > 0 && !s.isYou);

  // Map initialIndex to playable index
  const mappedInitial = (() => {
    const target = stories[initialIndex];
    if (!target) return 0;
    const idx = playableStories.findIndex((s) => s.id === target.id);
    return idx >= 0 ? idx : 0;
  })();

  const [storyIdx, setStoryIdx] = useState(mappedInitial);
  const [clipIdx, setClipIdx] = useState(0);

  // Reset indices when viewer opens
  useEffect(() => {
    if (visible) {
      const target = stories[initialIndex];
      const idx = target ? playableStories.findIndex((s) => s.id === target.id) : 0;
      setStoryIdx(idx >= 0 ? idx : 0);
      setClipIdx(0);
    }
  }, [visible, initialIndex]);

  const currentStory = playableStories[storyIdx];
  const clips = currentStory?.clips ?? [];
  const currentClip: StoryClip | undefined = clips[clipIdx];

  // ── Progress animation ──
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const startProgress = useCallback(() => {
    if (!currentClip) return;
    progressAnim.setValue(0);
    animRef.current?.stop();
    animRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: currentClip.durationSeconds * 1000,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) goNext();
    });
  }, [currentClip, storyIdx, clipIdx]);

  useEffect(() => {
    if (visible && currentClip) {
      startProgress();
    }
    return () => {
      animRef.current?.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, storyIdx, clipIdx]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (clipIdx < clips.length - 1) {
      setClipIdx(clipIdx + 1);
    } else if (storyIdx < playableStories.length - 1) {
      setStoryIdx(storyIdx + 1);
      setClipIdx(0);
    } else {
      onClose();
    }
  }, [clipIdx, clips.length, storyIdx, playableStories.length, onClose]);

  const goPrev = useCallback(() => {
    if (clipIdx > 0) {
      setClipIdx(clipIdx - 1);
    } else if (storyIdx > 0) {
      setStoryIdx(storyIdx - 1);
      const prevClips = playableStories[storyIdx - 1]?.clips ?? [];
      setClipIdx(0);
    } else {
      // Already at very first clip — restart it
      progressAnim.setValue(0);
      startProgress();
    }
  }, [clipIdx, storyIdx, playableStories, progressAnim, startProgress]);

  // ── Swipe down to close ──
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > SWIPE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: SCREEN_H,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible || !currentStory || !currentClip) return null;

  const tagLabel = currentClip.tag;
  const tagColor =
    tagLabel === 'Game' ? '#EF4444' :
    tagLabel === 'Practice' ? '#22C55E' :
    tagLabel === 'Recruiting' ? '#F59E0B' :
    tagLabel === 'Service' ? '#1D9BF0' :
    tagLabel === 'Sermon' ? '#1D9BF0' :
    tagLabel === 'Worship' ? '#8B5CF6' :
    tagLabel === 'Event' ? '#22C55E' :
    tagLabel === 'Training' ? '#F59E0B' :
    tagLabel === 'Announcement' ? '#F59E0B' :
    '#1D9BF0';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={[styles.root, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        {/* Background — clip thumbnail color */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: currentClip.thumbnailColor }]} />

        {/* ── Progress Bars ── */}
        <View style={[styles.progressRow, { paddingTop: insets.top + 8 }]}>
          {clips.map((c, i) => (
            <View key={c.clipId} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width:
                      i < clipIdx ? '100%' :
                      i === clipIdx ? progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }) :
                      '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* ── Author Row ── */}
        <View style={[styles.authorRow, { top: insets.top + 24 }]}>
          <View style={styles.authorAvatar}>
            <ThemedText style={styles.authorInitials}>{currentStory.initials}</ThemedText>
          </View>
          <ThemedText style={styles.authorName}>{currentStory.name}</ThemedText>
          {tagLabel && (
            <View style={[styles.tagBadge, { backgroundColor: tagColor }]}>
              <ThemedText style={styles.tagText}>{tagLabel}</ThemedText>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* ── Tap Zones ── */}
        <View style={styles.tapContainer}>
          <Pressable style={styles.tapLeft} onPress={goPrev} />
          <Pressable style={styles.tapRight} onPress={goNext} />
        </View>

        {/* ── Full-screen video placeholder ── */}
        <View style={[StyleSheet.absoluteFill, styles.videoFill, { backgroundColor: currentClip.thumbnailColor }]}>
          <IconSymbol name="play.fill" size={48} color="rgba(255,255,255,0.2)" />
        </View>

        {/* ── Caption ── */}
        {currentClip.caption && (
          <View style={[styles.captionBar, { paddingBottom: insets.bottom + 16 }]}>
            <ThemedText style={styles.captionText}>{currentClip.caption}</ThemedText>
          </View>
        )}

        {/* ── Bottom Actions ── */}
        <View style={[styles.bottomActions, { bottom: insets.bottom + 16 }]}>
          <Pressable hitSlop={8}>
            <IconSymbol name="paperplane" size={22} color="rgba(255,255,255,0.7)" />
          </Pressable>
          <Pressable hitSlop={8}>
            <IconSymbol name="bookmark" size={22} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 4,
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },

  // Author
  authorRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  tagBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 4,
  },

  // Tap zones
  tapContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 2,
  },

  // Full-screen video
  videoFill: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Caption
  captionBar: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 80,
    zIndex: 10,
  },
  captionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Bottom actions
  bottomActions: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    gap: 20,
    zIndex: 10,
  },
});
