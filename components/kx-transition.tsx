/**
 * KX Micro-Transition Overlay
 * Brief branded flash (~200ms) triggered on tab switches.
 * Full-screen overlay with centered "KX" text, fade + subtle scale pulse.
 * pointerEvents="none" — never blocks user input.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Animated, Text } from 'react-native';

import { registerTransitionHandler } from '@/utils/global-transition';

export function KXTransition() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const isAnimating = useRef(false);

  const trigger = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    // Reset
    opacity.setValue(0);
    scale.setValue(0.96);

    Animated.sequence([
      // Fade in + scale up (80ms)
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]),
      // Fade out (120ms)
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimating.current = false;
    });
  }, [opacity, scale]);

  useEffect(() => {
    registerTransitionHandler(trigger);
  }, [trigger]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={styles.kx}>KX</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kx: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
});
