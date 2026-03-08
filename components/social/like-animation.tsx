/**
 * LikeAnimation — double-tap heart animation overlay.
 * Scales 0→1.3 (spring) then fades out (400ms).
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface LikeAnimationProps {
  visible: boolean;
  onComplete: () => void;
}

export function LikeAnimation({ visible, onComplete }: LikeAnimationProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    scale.setValue(0);
    opacity.setValue(1);

    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.3,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale }], opacity },
      ]}
      pointerEvents="none"
    >
      <IconSymbol name="heart.fill" size={80} color="#FF3B30" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
