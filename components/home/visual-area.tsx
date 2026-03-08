/**
 * Full-bleed video area — auto-playing, muted, looping.
 * Edge-to-edge, no margins, no borders, no rounded corners.
 * Text + dots overlaid on gradient. Tap → toggle mute/unmute.
 * Swipeable 3 pages via PanResponder + Animated.View. Default = center page.
 * Edge overscroll triggers onEdgeLeft (settings) / onEdgeRight (nexus).
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { getVideoPages } from '@/utils/home-widgets';
import { registerVideoPagerHandlers, setVideoPage } from '@/utils/global-video-pager';
import { VideoSlide } from './video-slide';

const C = {
  dotActive: '#FFFFFF',
  dotInactive: '#52525B',
};

const DEFAULT_PAGE = 1; // Center page
const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 0.5;

interface VisualAreaProps {
  onEdgeLeft?: () => void;
  onEdgeRight?: () => void;
}

export function VisualArea({ onEdgeLeft, onEdgeRight }: VisualAreaProps) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(DEFAULT_PAGE);
  const [muted, setMuted] = useState(true);
  const pages = getVideoPages();
  const activeRef = useRef(DEFAULT_PAGE);
  const edgeTriggered = useRef(false);
  const translateX = useRef(new Animated.Value(-DEFAULT_PAGE * screenWidth)).current;

  // Refs for values accessed inside PanResponder callbacks (avoids stale closures)
  const screenWidthRef = useRef(screenWidth);
  screenWidthRef.current = screenWidth;
  const onEdgeLeftRef = useRef(onEdgeLeft);
  onEdgeLeftRef.current = onEdgeLeft;
  const onEdgeRightRef = useRef(onEdgeRight);
  onEdgeRightRef.current = onEdgeRight;
  const maxPageRef = useRef(Math.max(0, pages.length - 1));
  maxPageRef.current = Math.max(0, pages.length - 1);

  // Animate to a specific page index
  const animateToPage = useCallback((page: number) => {
    const clamped = Math.max(0, Math.min(page, maxPageRef.current));
    Animated.spring(translateX, {
      toValue: -clamped * screenWidthRef.current,
      tension: 50,
      friction: 12,
      useNativeDriver: true,
    }).start();
    activeRef.current = clamped;
    setActiveIndex(clamped);
    setVideoPage(clamped);
  }, [translateX]);

  const animateToPageRef = useRef(animateToPage);
  animateToPageRef.current = animateToPage;

  // Sync ref + global pager
  useEffect(() => {
    activeRef.current = activeIndex;
    setVideoPage(activeIndex);
  }, [activeIndex]);

  // Reset position when screen width changes
  useEffect(() => {
    translateX.setValue(-activeRef.current * screenWidthRef.current);
  }, [screenWidth, translateX]);

  // Register global pager controls (for programmatic page changes from grid area)
  useEffect(() => {
    const maxIndex = Math.max(0, pages.length - 1);
    registerVideoPagerHandlers(
      () => {
        const next = Math.min(activeRef.current + 1, maxIndex);
        if (next !== activeRef.current) animateToPage(next);
      },
      () => {
        const prev = Math.max(activeRef.current - 1, 0);
        if (prev !== activeRef.current) animateToPage(prev);
      },
      maxIndex,
    );
  }, [pages.length, animateToPage]);

  const toggleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMuted((m) => !m);
  }, []);

  // PanResponder for horizontal swiping between pages
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) =>
          Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
        onPanResponderMove: (_evt, gs) => {
          const base = -activeRef.current * screenWidthRef.current;
          translateX.setValue(base + gs.dx);
        },
        onPanResponderRelease: (_evt, gs) => {
          const page = activeRef.current;
          const maxPage = maxPageRef.current;
          const goPage = animateToPageRef.current;

          if (gs.dx > SWIPE_THRESHOLD || gs.vx > VELOCITY_THRESHOLD) {
            // Swipe right → previous page or edge trigger
            if (page > 0) {
              goPage(page - 1);
            } else {
              if (!edgeTriggered.current) {
                edgeTriggered.current = true;
                onEdgeLeftRef.current?.();
                setTimeout(() => { edgeTriggered.current = false; }, 500);
              }
              goPage(0); // snap back
            }
          } else if (gs.dx < -SWIPE_THRESHOLD || gs.vx < -VELOCITY_THRESHOLD) {
            // Swipe left → next page or edge trigger
            if (page < maxPage) {
              goPage(page + 1);
            } else {
              if (!edgeTriggered.current) {
                edgeTriggered.current = true;
                onEdgeRightRef.current?.();
                setTimeout(() => { edgeTriggered.current = false; }, 500);
              }
              goPage(maxPage); // snap back
            }
          } else {
            // Not enough movement — snap back to current page
            goPage(page);
          }
        },
        onPanResponderTerminate: () => {
          // If gesture is stolen, snap back
          animateToPageRef.current(activeRef.current);
        },
      }),
    [translateX],
  );

  if (pages.length === 0) return null;

  // Single page — no paging needed
  if (pages.length === 1) {
    return (
      <Pressable style={styles.container} onPress={toggleMute}>
        <VideoSlide page={pages[0]} isActive muted={muted} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pagerRow,
          {
            width: screenWidth * pages.length,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {pages.map((page, i) => (
          <Pressable
            key={page.id}
            onPress={toggleMute}
            style={{ width: screenWidth, flex: 1 }}
          >
            <VideoSlide page={page} isActive={i === activeIndex} muted={muted} />
          </Pressable>
        ))}
      </Animated.View>

      {/* 3 dots — centered at top of video, just below safe area */}
      <View style={[styles.dots, { top: insets.top + 8 }]}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeIndex ? C.dotActive : C.dotInactive,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  pagerRow: {
    flex: 1,
    flexDirection: 'row',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
