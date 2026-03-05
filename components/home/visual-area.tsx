/**
 * Full-bleed video area — auto-playing, muted, looping.
 * Edge-to-edge, no margins, no borders, no rounded corners.
 * Text + dots overlaid on gradient. Tap → fullscreen with audio.
 * Swipeable if multiple pages. Max 4.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';

import { getVideoPages } from '@/utils/home-widgets';
import { VideoSlide } from './video-slide';

const C = {
  dotActive: '#FFFFFF',
  dotInactive: '#52525B',
};

export function VisualArea() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const pages = getVideoPages();

  if (pages.length === 0) return null;

  // Single page — no PagerView needed
  if (pages.length === 1) {
    const page = pages[0];
    return (
      <Pressable
        style={styles.container}
        onPress={() => {
          if (page.route) router.push(page.route as any);
        }}
      >
        <VideoSlide page={page} isActive />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <PagerView
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        {pages.map((page, i) => (
          <Pressable
            key={page.id}
            onPress={() => {
              if (page.route) router.push(page.route as any);
            }}
          >
            <View style={styles.page}>
              <VideoSlide page={page} isActive={i === activeIndex} />
            </View>
          </Pressable>
        ))}
      </PagerView>

      {/* Dots overlaid at bottom of video */}
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
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  dots: {
    position: 'absolute',
    bottom: 10,
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
