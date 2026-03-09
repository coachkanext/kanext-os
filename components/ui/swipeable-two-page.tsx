/**
 * SwipeablePages — shared N-page horizontal swipeable container.
 * Adapted from VisualArea PanResponder + Animated.View pattern.
 * Default page = 0. N dots at top. Spring animations.
 *
 * Gesture coordination with root _layout.tsx:
 * - Uses bubble phase (onMoveShouldSetPanResponder) so root capture phase runs first
 * - At page 0, right swipe: don't claim → root captures → opens side panel
 * - At last page, left swipe: edge trigger → Nexus
 */

import React, { useRef, useMemo, useCallback, useEffect, type ReactNode } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { setSwipeablePageActive, setSwipeablePageIndex } from '@/utils/global-swipeable-page';
import { enableSlideAnimation } from '@/utils/global-footer-swipe';
import { PageDots } from '@/components/ui/page-dots';

const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 0.5;
const CLAIM_THRESHOLD = 15;

interface SwipeablePagesProps {
  children: ReactNode[];
  activeIndex: number;
  onPageChange: (index: number) => void;
  onEdgeRight?: () => void;
  onEdgeLeft?: () => void;
  badges?: Set<number>;
}

export function SwipeablePages({
  children,
  activeIndex,
  onPageChange,
  onEdgeRight,
  onEdgeLeft,
  badges,
}: SwipeablePagesProps) {
  const { width: screenWidth } = useWindowDimensions();
  const activeRef = useRef(activeIndex);
  const translateX = useRef(new Animated.Value(-activeIndex * screenWidth)).current;

  const childArray = React.Children.toArray(children);
  const pageCount = childArray.length;
  const pageCountRef = useRef(pageCount);
  pageCountRef.current = pageCount;

  const screenWidthRef = useRef(screenWidth);
  screenWidthRef.current = screenWidth;
  const onEdgeRightRef = useRef(onEdgeRight);
  onEdgeRightRef.current = onEdgeRight;
  const onEdgeLeftRef = useRef(onEdgeLeft);
  onEdgeLeftRef.current = onEdgeLeft;
  const edgeTriggered = useRef(false);

  // Register with global state on mount + re-register on focus
  // (freezeOnBlur prevents cleanup, so we must re-register when screen regains focus)
  useFocusEffect(
    useCallback(() => {
      setSwipeablePageActive(true);
      setSwipeablePageIndex(activeRef.current);
      return () => {
        setSwipeablePageActive(false);
        setSwipeablePageIndex(0);
      };
    }, []),
  );

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
    const clamped = Math.max(0, Math.min(page, pageCountRef.current - 1));
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
          const raw = base + gs.dx;
          // Clamp so pager doesn't overscroll past edges
          const maxTranslate = -(pageCountRef.current - 1) * screenWidthRef.current;
          const clamped = Math.max(maxTranslate, Math.min(0, raw));
          translateX.setValue(clamped);
        },
        onPanResponderRelease: (_evt, gs) => {
          const page = activeRef.current;
          const goPage = animateToPageRef.current;
          const lastPage = pageCountRef.current - 1;

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
            if (page < lastPage) {
              goPage(page + 1);
            } else {
              // At last page, left swipe: edge trigger → Nexus (with slide animation)
              if (!edgeTriggered.current) {
                edgeTriggered.current = true;
                // Deactivate swipeable state so Nexus screen's right-swipe can open side panel
                setSwipeablePageActive(false);
                setSwipeablePageIndex(0);
                enableSlideAnimation();
                onEdgeLeftRef.current?.();
                setTimeout(() => { edgeTriggered.current = false; }, 500);
              }
              goPage(lastPage);
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
      <PageDots count={pageCount} activeIndex={activeIndex} badges={badges} />

      {/* Pages */}
      <Animated.View
        style={[
          styles.pagerRow,
          {
            width: screenWidth * pageCount,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {childArray.map((child, i) => (
          <View key={i} style={{ width: screenWidth, flex: 1 }}>{child}</View>
        ))}
      </Animated.View>
    </View>
  );
}

/** Backward-compatible alias */
export { SwipeablePages as SwipeableTwoPage };

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
