/**
 * EdgeHoldAdvance — Edge-hold auto-advance gesture wrapper.
 * Hold left/right screen edge (28px zone) for 300ms to begin
 * auto-advancing through tabs with haptic feedback.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, Dimensions, Keyboard, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const EDGE_ZONE = 28;
const HOLD_DELAY = 300;
const INITIAL_INTERVAL = 550;
const FAST_INTERVAL = 450;
const FAST_AFTER_STEPS = 3;
const VERTICAL_THRESHOLD = 10;

export interface EdgeHoldAdvanceProps {
  activeIndex: number;
  tabCount: number;
  onAdvance: (newIndex: number) => void;
  children: React.ReactNode;
  enabled?: boolean;
}

export function EdgeHoldAdvance({
  activeIndex,
  tabCount,
  onAdvance,
  children,
  enabled = true,
}: EdgeHoldAdvanceProps) {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const directionRef = useRef<'left' | 'right' | null>(null);
  const stepsRef = useRef(0);
  const indexRef = useRef(activeIndex);
  const startYRef = useRef(0);

  // Keep ref in sync
  useEffect(() => {
    indexRef.current = activeIndex;
  }, [activeIndex]);

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    directionRef.current = null;
    stepsRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => clearTimers, [clearTimers]);

  const startAdvancing = useCallback(() => {
    const dir = directionRef.current;
    if (!dir) return;

    const step = () => {
      const current = indexRef.current;
      const next = dir === 'right'
        ? Math.min(current + 1, tabCount - 1)
        : Math.max(current - 1, 0);

      if (next !== current) {
        indexRef.current = next;
        stepsRef.current += 1;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onAdvance(next);
      }

      // Accelerate after threshold
      if (stepsRef.current === FAST_AFTER_STEPS && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(step, FAST_INTERVAL);
      }
    };

    // First step immediately
    step();
    intervalRef.current = setInterval(step, INITIAL_INTERVAL);
  }, [tabCount, onAdvance]);

  const gesture = Gesture.Manual()
    .onTouchesDown((event, manager) => {
      if (!enabled) {
        manager.fail();
        return;
      }
      if (Keyboard.isVisible()) {
        manager.fail();
        return;
      }

      const touch = event.allTouches[0];
      if (!touch) {
        manager.fail();
        return;
      }

      const screenWidth = Dimensions.get('window').width;
      const x = touch.absoluteX;
      startYRef.current = touch.absoluteY;

      if (x <= EDGE_ZONE) {
        directionRef.current = 'left';
      } else if (x >= screenWidth - EDGE_ZONE) {
        directionRef.current = 'right';
      } else {
        manager.fail();
        return;
      }

      // Start hold timer
      holdTimerRef.current = setTimeout(() => {
        startAdvancing();
      }, HOLD_DELAY);
    })
    .onTouchesMove((event, manager) => {
      const touch = event.allTouches[0];
      if (!touch) return;

      // Cancel if vertical movement exceeds threshold (user is scrolling)
      if (Math.abs(touch.absoluteY - startYRef.current) > VERTICAL_THRESHOLD) {
        clearTimers();
        manager.fail();
      }
    })
    .onTouchesUp((_event, manager) => {
      clearTimers();
      manager.fail();
    })
    .onTouchesCancelled((_event, manager) => {
      clearTimers();
      manager.fail();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.wrapper}>
        {children}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
