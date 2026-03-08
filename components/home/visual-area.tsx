/**
 * Full-bleed video area — auto-playing, muted, looping.
 * Edge-to-edge, no margins, no borders, no rounded corners.
 * Text + dots overlaid on gradient. Tap → toggle mute/unmute.
 * Swipeable 3 pages via horizontal ScrollView. Default = center page.
 * Edge overscroll triggers onEdgeLeft (settings) / onEdgeRight (nexus).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { getVideoPages } from '@/utils/home-widgets';
import { registerVideoPagerHandlers, setVideoPage } from '@/utils/global-video-pager';
import { VideoSlide } from './video-slide';

const C = {
  dotActive: '#FFFFFF',
  dotInactive: '#52525B',
};

const DEFAULT_PAGE = 1; // Center page

interface VisualAreaProps {
  onEdgeLeft?: () => void;
  onEdgeRight?: () => void;
}

export function VisualArea({ onEdgeLeft, onEdgeRight }: VisualAreaProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(DEFAULT_PAGE);
  const [muted, setMuted] = useState(true);
  const pages = getVideoPages();
  const scrollRef = useRef<ScrollView>(null);
  const activeRef = useRef(DEFAULT_PAGE);
  const edgeTriggered = useRef(false);

  // Sync ref + global pager
  useEffect(() => {
    activeRef.current = activeIndex;
    setVideoPage(activeIndex);
  }, [activeIndex]);

  // Scroll to center page on mount
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: DEFAULT_PAGE * screenWidth, animated: false });
  }, [screenWidth]);

  // Register global pager controls (for programmatic page changes)
  useEffect(() => {
    const maxIndex = Math.max(0, pages.length - 1);
    registerVideoPagerHandlers(
      () => {
        const next = Math.min(activeRef.current + 1, maxIndex);
        if (next !== activeRef.current) {
          scrollRef.current?.scrollTo({ x: next * screenWidth, animated: true });
        }
      },
      () => {
        const prev = Math.max(activeRef.current - 1, 0);
        if (prev !== activeRef.current) {
          scrollRef.current?.scrollTo({ x: prev * screenWidth, animated: true });
        }
      },
      maxIndex,
    );
  }, [pages.length, screenWidth]);

  const toggleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMuted((m) => !m);
  }, []);

  // Track current page during scroll (smooth dot updates)
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const page = Math.round(x / screenWidth);
      const clamped = Math.max(0, Math.min(page, pages.length - 1));
      if (clamped !== activeRef.current) {
        activeRef.current = clamped;
        setActiveIndex(clamped);
        setVideoPage(clamped);
      }
    },
    [screenWidth, pages.length],
  );

  // Detect edge overscroll on drag end → trigger settings / nexus
  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const vx = e.nativeEvent.velocity?.x ?? 0;
      const maxX = (pages.length - 1) * screenWidth;

      // Left edge: overscroll past page 0 (iOS bounce) or velocity-based (Android)
      if (x < -30 || (x <= 5 && vx < -0.3)) {
        if (!edgeTriggered.current) {
          edgeTriggered.current = true;
          onEdgeLeft?.();
          // Reset after a short delay
          setTimeout(() => { edgeTriggered.current = false; }, 500);
        }
        return;
      }

      // Right edge: overscroll past last page (iOS bounce) or velocity-based (Android)
      if (x > maxX + 30 || (x >= maxX - 5 && vx > 0.3)) {
        if (!edgeTriggered.current) {
          edgeTriggered.current = true;
          onEdgeRight?.();
          setTimeout(() => { edgeTriggered.current = false; }, 500);
        }
        return;
      }
    },
    [screenWidth, pages.length, onEdgeLeft, onEdgeRight],
  );

  // Final page settle
  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const page = Math.round(x / screenWidth);
      const clamped = Math.max(0, Math.min(page, pages.length - 1));
      activeRef.current = clamped;
      setActiveIndex(clamped);
      setVideoPage(clamped);
    },
    [screenWidth, pages.length],
  );

  if (pages.length === 0) return null;

  // Single page — no scrolling needed
  if (pages.length === 1) {
    return (
      <Pressable style={styles.container} onPress={toggleMute}>
        <VideoSlide page={pages[0]} isActive muted={muted} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumEnd}
        contentOffset={{ x: DEFAULT_PAGE * screenWidth, y: 0 }}
      >
        {pages.map((page, i) => (
          <Pressable
            key={page.id}
            onPress={toggleMute}
            style={{ width: screenWidth }}
          >
            <View style={styles.page}>
              <VideoSlide page={page} isActive={i === activeIndex} muted={muted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* 3 dots — centered below the video hero, above the grid */}
      <View style={styles.dots}>
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
  },
  page: {
    flex: 1,
  },
  dots: {
    position: 'absolute',
    bottom: 8,
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
