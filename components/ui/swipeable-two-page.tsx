/**
 * SwipeableTwoPage — shared 2-page horizontal swipeable container.
 * Adapted from VisualArea PanResponder + Animated.View pattern.
 * Default page = 0. 2 dots at top. Spring animations.
 *
 * Gesture coordination with root _layout.tsx:
 * - Uses bubble phase (onMoveShouldSetPanResponder) so root capture phase runs first
 * - At page 0, right swipe: don't claim → root captures → opens side panel
 * - At page 1, right swipe: claim → page back to 0
 * - At page 1, left swipe: snap back (no page 2)
 */

import React, { useRef, useMemo, useCallback, useEffect, type ReactNode } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { setSwipeablePageActive, setSwipeablePageIndex } from '@/utils/global-swipeable-page';

const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 0.5;
const CLAIM_THRESHOLD = 15;

interface SwipeableTwoPageProps {
  children: [ReactNode, ReactNode];
  activeIndex: number;
  onPageChange: (index: number) => void;
  onEdgeRight?: () => void;
}

export function SwipeableTwoPage({
  children,
  activeIndex,
  onPageChange,
  onEdgeRight,
}: SwipeableTwoPageProps) {
  const { width: screenWidth } = useWindowDimensions();
  const activeRef = useRef(activeIndex);
  const translateX = useRef(new Animated.Value(-activeIndex * screenWidth)).current;

  const screenWidthRef = useRef(screenWidth);
  screenWidthRef.current = screenWidth;
  const onEdgeRightRef = useRef(onEdgeRight);
  onEdgeRightRef.current = onEdgeRight;
  const edgeTriggered = useRef(false);

  // Register with global state
  useEffect(() => {
    setSwipeablePageActive(true);
    setSwipeablePageIndex(activeIndex);
    return () => {
      setSwipeablePageActive(false);
      setSwipeablePageIndex(0);
    };
  }, []);

  // Sync ref + global on page change
  useEffect(() => {
    activeRef.current = activeIndex;
    setSwipeablePageIndex(activeIndex);
  }, [activeIndex]);

  // Reset position on screen width change
  useEffect(() => {
    translateX.setValue(-activeRef.current * screenWidthRef.current);
  }, [screenWidth, translateX]);

  const animateToPage = useCallback((page: number) => {
    const clamped = Math.max(0, Math.min(page, 1));
    Animated.spring(translateX, {
      toValue: -clamped * screenWidthRef.current,
      tension: 50,
      friction: 12,
      useNativeDriver: true,
    }).start();
    activeRef.current = clamped;
    onPageChange(clamped);
    setSwipeablePageIndex(clamped);
  }, [translateX, onPageChange]);

  const animateToPageRef = useRef(animateToPage);
  animateToPageRef.current = animateToPage;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) => {
          if (Math.abs(gs.dx) < CLAIM_THRESHOLD || Math.abs(gs.dx) < Math.abs(gs.dy) * 1.5) {
            return false;
          }
          const page = activeRef.current;
          // At page 0, right swipe → don't claim (let root handle for side panel)
          if (page === 0 && gs.dx > 0) return false;
          // All other horizontal swipes: claim
          return true;
        },
        onPanResponderMove: (_evt, gs) => {
          const base = -activeRef.current * screenWidthRef.current;
          translateX.setValue(base + gs.dx);
        },
        onPanResponderRelease: (_evt, gs) => {
          const page = activeRef.current;
          const goPage = animateToPageRef.current;

          if (gs.dx > SWIPE_THRESHOLD || gs.vx > VELOCITY_THRESHOLD) {
            // Swipe right
            if (page > 0) {
              goPage(page - 1);
            } else {
              // At page 0, right swipe: edge trigger
              if (!edgeTriggered.current) {
                edgeTriggered.current = true;
                onEdgeRightRef.current?.();
                setTimeout(() => { edgeTriggered.current = false; }, 500);
              }
              goPage(0);
            }
          } else if (gs.dx < -SWIPE_THRESHOLD || gs.vx < -VELOCITY_THRESHOLD) {
            // Swipe left
            if (page < 1) {
              goPage(page + 1);
            } else {
              goPage(1); // snap back
            }
          } else {
            goPage(page); // snap back
          }
        },
        onPanResponderTerminate: () => {
          animateToPageRef.current(activeRef.current);
        },
      }),
    [translateX],
  );

  return (
    <View style={styles.container}>
      {/* Dots */}
      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === activeIndex ? '#FFFFFF' : '#52525B' },
            ]}
          />
        ))}
      </View>

      {/* Pages */}
      <Animated.View
        style={[
          styles.pagerRow,
          {
            width: screenWidth * 2,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={{ width: screenWidth, flex: 1 }}>{children[0]}</View>
        <View style={{ width: screenWidth, flex: 1 }}>{children[1]}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  pagerRow: {
    flex: 1,
    flexDirection: 'row',
  },
});
