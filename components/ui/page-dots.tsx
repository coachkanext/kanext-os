/**
 * PageDots — reusable animated dot indicator for swipeable page containers.
 * 7px dots, animated opacity transitions (200ms ease-out).
 * Optional badge indicators (4px white circles above dots).
 */

import React, { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

interface PageDotsProps {
  count: number;
  activeIndex: number;
  badges?: Set<number>;
  style?: ViewStyle;
}

export function PageDots({ count, activeIndex, badges, style }: PageDotsProps) {
  const anims = useRef<Animated.Value[]>(
    Array.from({ length: count }, (_, i) => new Animated.Value(i === activeIndex ? 1 : 0)),
  ).current;

  useEffect(() => {
    Animated.parallel(
      anims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: i === activeIndex ? 1 : 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [activeIndex, anims]);

  return (
    <View style={[styles.container, style]}>
      {anims.map((anim, i) => (
        <View key={i} style={styles.dotWrapper}>
          {badges?.has(i) && <View style={styles.badge} />}
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dotWrapper: {
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  badge: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: -6,
  },
});
