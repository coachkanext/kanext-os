/**
 * EdgeHoldAdvance — Edge-hold auto-advance gesture wrapper.
 * Hold left/right screen edge (28px zone) for 300ms to begin
 * auto-advancing through tabs with haptic feedback.
 *
 * Uses absolutely-positioned Pressable zones instead of
 * Gesture.Manual() to avoid conflicts with PagerView.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

const EDGE_ZONE = 28;
const HOLD_DELAY = 300;
const INITIAL_INTERVAL = 550;
const FAST_INTERVAL = 450;
const FAST_AFTER_STEPS = 3;

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
  const stepsRef = useRef(0);
  const indexRef = useRef(activeIndex);

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
    stepsRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => clearTimers, [clearTimers]);

  const startAdvancing = useCallback((direction: 'left' | 'right') => {
    const step = () => {
      const current = indexRef.current;
      const next = direction === 'right'
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

  const handleEdgePressIn = useCallback((direction: 'left' | 'right') => {
    if (!enabled) return;
    clearTimers();
    holdTimerRef.current = setTimeout(() => {
      startAdvancing(direction);
    }, HOLD_DELAY);
  }, [enabled, clearTimers, startAdvancing]);

  const handleEdgePressOut = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  return (
    <View style={styles.wrapper}>
      {children}
      {/* Left edge zone */}
      <Pressable
        style={styles.leftEdge}
        onPressIn={() => handleEdgePressIn('left')}
        onPressOut={handleEdgePressOut}
      />
      {/* Right edge zone */}
      <Pressable
        style={styles.rightEdge}
        onPressIn={() => handleEdgePressIn('right')}
        onPressOut={handleEdgePressOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  leftEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: EDGE_ZONE,
  },
  rightEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: EDGE_ZONE,
  },
});
