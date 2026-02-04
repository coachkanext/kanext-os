/**
 * KaNeXT OS Splash Screen
 * App launch sequence: black → KaNeXT logo with "Powered by Nexus" → fade out
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Phase 1: Fade in logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // Phase 2: Fade in subtitle after logo appears
      Animated.timing(subtitleFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Phase 3: Hold, then complete
        setTimeout(() => {
          onAnimationComplete();
        }, 800);
      });
    });
  }, [fadeAnim, subtitleFadeAnim, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* KaNeXT Logo */}
        <Animated.Text
          style={[
            styles.logo,
            { opacity: fadeAnim },
          ]}
        >
          KaNeXT
        </Animated.Text>

        {/* Powered by Nexus */}
        <Animated.Text
          style={[
            styles.subtitle,
            { opacity: subtitleFadeAnim },
          ]}
        >
          Powered by Nexus
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 12,
    letterSpacing: 0.5,
  },
});
