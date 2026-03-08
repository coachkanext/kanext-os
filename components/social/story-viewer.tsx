/**
 * StoryViewer — full-screen Modal overlay for viewing stories.
 * Progress bars at top. Tap right = next, tap left = prev.
 * Auto-advance per frame duration. Swipe down = close.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPostTime } from '@/data/mock-social';
import type { StoryUser } from '@/data/mock-social';

interface StoryViewerProps {
  visible: boolean;
  stories: StoryUser[];
  initialUserIndex: number;
  onClose: () => void;
}

export function StoryViewer({
  visible,
  stories,
  initialUserIndex,
  onClose,
}: StoryViewerProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Only include users with frames
  const usersWithStories = stories.filter((u) => u.storyFrames.length > 0);
  const startIdx = Math.max(
    0,
    usersWithStories.findIndex((u) => u.id === stories[initialUserIndex]?.id),
  );

  const [userIdx, setUserIdx] = useState(startIdx);
  const [frameIdx, setFrameIdx] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const currentUser = usersWithStories[userIdx];
  const currentFrame = currentUser?.storyFrames[frameIdx];

  // Reset state when opened
  useEffect(() => {
    if (visible) {
      setUserIdx(startIdx >= 0 ? startIdx : 0);
      setFrameIdx(0);
    }
  }, [visible, startIdx]);

  // Auto-advance timer
  useEffect(() => {
    if (!visible || !currentFrame) return;

    progressAnim.setValue(0);
    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: currentFrame.duration,
      useNativeDriver: false,
    });

    anim.start(({ finished }) => {
      if (finished) goNext();
    });

    return () => {
      anim.stop();
    };
  }, [visible, userIdx, frameIdx, currentFrame?.id]);

  const goNext = useCallback(() => {
    if (!currentUser) return;
    if (frameIdx < currentUser.storyFrames.length - 1) {
      setFrameIdx((f) => f + 1);
    } else if (userIdx < usersWithStories.length - 1) {
      setUserIdx((u) => u + 1);
      setFrameIdx(0);
    } else {
      onClose();
    }
  }, [currentUser, frameIdx, userIdx, usersWithStories.length, onClose]);

  const goPrev = useCallback(() => {
    if (frameIdx > 0) {
      setFrameIdx((f) => f - 1);
    } else if (userIdx > 0) {
      setUserIdx((u) => u - 1);
      const prevUser = usersWithStories[userIdx - 1];
      setFrameIdx(prevUser ? prevUser.storyFrames.length - 1 : 0);
    }
  }, [frameIdx, userIdx, usersWithStories]);

  const handleTap = useCallback(
    (x: number) => {
      if (x < screenWidth * 0.3) {
        goPrev();
      } else {
        goNext();
      }
    },
    [screenWidth, goPrev, goNext],
  );

  // Swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, gs) =>
        gs.dy > 10 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_e, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_e, gs) => {
        if (gs.dy > 100 || gs.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 60,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible || !currentUser || !currentFrame) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Animated.View
        style={[styles.overlay, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        {/* Background image */}
        <Image
          source={{ uri: currentFrame.uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Top gradient */}
        <View style={[styles.topGradient, { paddingTop: insets.top + 8 }]}>
          {/* Progress bars */}
          <View style={styles.progressRow}>
            {currentUser.storyFrames.map((frame, i) => (
              <View key={frame.id} style={styles.progressBarBg}>
                {i < frameIdx ? (
                  <View style={[styles.progressBarFill, { width: '100%' }]} />
                ) : i === frameIdx ? (
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                ) : null}
              </View>
            ))}
          </View>

          {/* User info */}
          <View style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{currentUser.initials}</Text>
            </View>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userTime}>
              {formatPostTime(currentFrame.timestamp)}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Tap zones */}
        <View style={styles.tapZones}>
          <Pressable
            style={styles.tapZoneLeft}
            onPress={(e) => handleTap(e.nativeEvent.locationX)}
          />
          <Pressable
            style={styles.tapZoneRight}
            onPress={(e) =>
              handleTap(screenWidth * 0.3 + e.nativeEvent.locationX)
            }
          />
        </View>

        {/* Bottom gradient */}
        <View style={[styles.bottomGradient, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.bottomName}>{currentUser.name}</Text>
          <Text style={styles.bottomUsername}>{currentUser.username}</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  userTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 8,
  },
  closeBtn: {
    marginLeft: 'auto',
    padding: 8,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapZoneLeft: {
    flex: 3,
  },
  tapZoneRight: {
    flex: 7,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomUsername: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
});
