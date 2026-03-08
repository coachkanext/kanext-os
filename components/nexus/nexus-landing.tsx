/**
 * Nexus Landing — Empty state with the Nexus "N" logo.
 * Uses the same footer-nexus.png asset as the universal footer.
 * Shown when no active conversation is selected (15+ min idle or first use).
 * Just the logo and nothing else. No quotes, no chips, no suggestions.
 * Logo fades out when the user starts interacting (fadeOut prop).
 */

import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Props {
  /** When true, the logo fades out smoothly */
  fadeOut?: boolean;
}

export function NexusLanding({ fadeOut = false }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fadeOut) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeOut]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('@/assets/images/footer-nexus.png')}
        style={[styles.logo, { opacity: Animated.multiply(opacity, 0.35) }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
