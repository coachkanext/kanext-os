/**
 * KaNeXT OS Boot Splash Screen
 * App launch sequence: black → KaNeXT logo with "Powered by Nexus" → hold → fade out
 *
 * Timing:
 * - Phase 1: Fade in logo (600ms)
 * - Phase 2: Fade in subtitle (400ms)
 * - Phase 3: Hold visible (1500ms) → total 2500ms visible
 * - Phase 4: Fade out entire screen (600ms)
 * - Then callback
 *
 * IMPORTANT: This component should only ever be mounted ONCE per app session.
 * The parent layout (app/_layout.tsx) controls this via a module-level guard.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

/**
 * Module-level guard: prevents animation from running more than once per session.
 * This is a secondary defense in case the component is accidentally remounted.
 */
let ANIMATION_STARTED = false;

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const containerFadeAnim = useRef(new Animated.Value(1)).current;
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Guard: only run animation once per app session
    if (ANIMATION_STARTED || hasStartedRef.current) {
      // Already ran - immediately complete
      onAnimationComplete();
      return;
    }

    ANIMATION_STARTED = true;
    hasStartedRef.current = true;

    // Phase 1: Fade in logo (600ms)
    Animated.timing(logoFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // Phase 2: Fade in subtitle (400ms)
      Animated.timing(subtitleFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Phase 3: Hold visible for 1500ms (total visible time = 600 + 400 + 1500 = 2500ms)
        setTimeout(() => {
          // Phase 4: Fade out entire container (600ms)
          Animated.timing(containerFadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start(() => {
            onAnimationComplete();
          });
        }, 1500);
      });
    });
  }, [logoFadeAnim, subtitleFadeAnim, containerFadeAnim, onAnimationComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: containerFadeAnim }]}>
      <View style={styles.content}>
        {/* KaNeXT Logo */}
        <Animated.Text
          style={[
            styles.logo,
            { opacity: logoFadeAnim },
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
    </Animated.View>
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
