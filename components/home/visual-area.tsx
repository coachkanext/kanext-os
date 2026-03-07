/**
 * Full-bleed video area — auto-playing, muted, looping.
 * Edge-to-edge, no margins, no borders, no rounded corners.
 * Text + dots overlaid on gradient. Tap → toggle mute/unmute.
 * Swipeable if multiple pages. Max 2.
 * Registers global pager handlers so horizontal swipes anywhere on
 * the home screen can page through videos.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { getVideoPages } from '@/utils/home-widgets';
import { registerVideoPagerHandlers, setVideoPage } from '@/utils/global-video-pager';
import { VideoSlide } from './video-slide';

const C = {
  dotActive: '#FFFFFF',
  dotInactive: '#52525B',
};

export function VisualArea() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const insets = useSafeAreaInsets();
  const pages = getVideoPages();
  const pagerRef = useRef<PagerView>(null);
  const activeRef = useRef(0);

  // Keep a ref in sync for the global handlers + report to global pager
  useEffect(() => {
    activeRef.current = activeIndex;
    setVideoPage(activeIndex);
  }, [activeIndex]);

  // Register global pager controls
  useEffect(() => {
    const maxIndex = Math.max(0, pages.length - 1);
    registerVideoPagerHandlers(
      () => {
        const next = Math.min(activeRef.current + 1, maxIndex);
        if (next !== activeRef.current) {
          pagerRef.current?.setPage(next);
        }
      },
      () => {
        const prev = Math.max(activeRef.current - 1, 0);
        if (prev !== activeRef.current) {
          pagerRef.current?.setPage(prev);
        }
      },
      maxIndex,
    );
  }, [pages.length]);

  if (pages.length === 0) return null;

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMuted((m) => !m);
  };

  // Single page — no PagerView needed
  if (pages.length === 1) {
    const page = pages[0];
    return (
      <Pressable style={styles.container} onPress={toggleMute}>
        <VideoSlide page={page} isActive muted={muted} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        scrollEnabled={false}
        overdrag={false}
        overScrollMode="never"
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        {pages.map((page, i) => (
          <Pressable
            key={page.id}
            onPress={toggleMute}
          >
            <View style={styles.page}>
              <VideoSlide page={page} isActive={i === activeIndex} muted={muted} />
            </View>
          </Pressable>
        ))}
      </PagerView>

      {/* 2 dots always shown — pinned under the Dynamic Island */}
      <View style={[styles.dots, { top: insets.top + 4 }]}>
        {[0, 1].map((i) => (
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
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
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
