/**
 * Full-bleed video area — auto-playing, muted, looping.
 * Edge-to-edge, no margins, no borders, no rounded corners.
 * Dots overlaid on gradient. Tap → toggle mute/unmute.
 * Swipeable 3 pages via PanResponder + Animated.View. Default = page 1 (middle).
 * Self-contained swipe zone — edges are dead ends, no external navigation.
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
import { PageDots } from '@/components/ui/page-dots';

const DEFAULT_PAGE = 1; // Middle page
const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 0.5;

export function VisualArea() {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(DEFAULT_PAGE);
  const [muted, setMuted] = useState(true);
  const pages = getVideoPages();
  const activeRef = useRef(DEFAULT_PAGE);
  const translateX = useRef(new Animated.Value(-DEFAULT_PAGE * screenWidth)).current;

  // Refs for values accessed inside PanResponder callbacks (avoids stale closures)
  const screenWidthRef = useRef(screenWidth);
  screenWidthRef.current = screenWidth;
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
  // Self-contained: edges are dead ends (snap back, no external triggers)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) =>
          Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
        onPanResponderMove: (_evt, gs) => {
          const base = -activeRef.current * screenWidthRef.current;
          const raw = base + gs.dx;
          // Clamp so pager doesn't overscroll past edges
          const maxTranslate = -maxPageRef.current * screenWidthRef.current;
          const clamped = Math.max(maxTranslate, Math.min(0, raw));
          translateX.setValue(clamped);
        },
        onPanResponderRelease: (_evt, gs) => {
          const page = activeRef.current;
          const maxPage = maxPageRef.current;
          const goPage = animateToPageRef.current;

          if (gs.dx > SWIPE_THRESHOLD || gs.vx > VELOCITY_THRESHOLD) {
            // Swipe right → previous page or snap back at edge
            goPage(page > 0 ? page - 1 : 0);
          } else if (gs.dx < -SWIPE_THRESHOLD || gs.vx < -VELOCITY_THRESHOLD) {
            // Swipe left → next page or snap back at edge
            goPage(page < maxPage ? page + 1 : maxPage);
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

      <PageDots count={pages.length} activeIndex={activeIndex} style={{ top: insets.top }} />
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
});
