/**
 * useScrollHeader — attach to any ScrollView/FlatList to auto-hide the top
 * bar on scroll-down and re-show it on scroll-up.
 *
 * Usage:
 *   const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
 *
 *   <Animated.View style={[s.topBar, { opacity }]} />
 *   <ScrollView onScroll={onScroll} scrollEventThrottle={scrollEventThrottle} ... />
 */

import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const THRESHOLD = 8; // px of scroll delta before triggering hide/show

// barHeight kept as optional param so existing call sites don't break
export function useScrollHeader(_barHeight?: number) {
  const opacity = useRef(new Animated.Value(1)).current;
  const lastY   = useRef(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;

      if (y <= 0) {
        // At the top — snap visible instantly, no animation
        opacity.setValue(1);
      } else if (y > lastY.current + THRESHOLD) {
        // Scrolling down — fade out
        Animated.spring(opacity, {
          toValue: 0,
          useNativeDriver: true,
          tension: 400,
          friction: 30,
        }).start();
      }
      // Scrolling up mid-page: stays hidden

      lastY.current = y;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // translateY kept for backward compat — points to the opacity value
  // so old destructuring `{ translateY }` still compiles
  return { opacity, translateY: opacity, onScroll, scrollEventThrottle: 16 } as const;
}
