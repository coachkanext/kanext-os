/**
 * KaNeXT OS Boot Splash Screen
 * Full-screen #F8F7F4 with centered K logo — static fade in/out.
 *
 * Only shows on cold start, not when resuming from background.
 *
 * IMPORTANT: This component should only ever be mounted ONCE per app session.
 * The parent layout (app/_layout.tsx) controls this via a module-level guard.
 */

import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

const SPLASH_ICON = require('@/assets/images/kx-logo.png');

/**
 * Module-level guard: prevents animation from running more than once per session.
 */
let ANIMATION_STARTED = false;

interface SplashScreenProps {
  onReady: () => void;
  isAppReady: boolean;
}

export function SplashScreen({ onReady, isAppReady }: SplashScreenProps) {
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const containerFadeAnim = useRef(new Animated.Value(1)).current;
  const hasStartedRef = useRef(false);
  const hasFadedOutRef = useRef(false);

  // Fade in content on mount
  useEffect(() => {
    if (ANIMATION_STARTED || hasStartedRef.current) {
      onReady();
      return;
    }

    ANIMATION_STARTED = true;
    hasStartedRef.current = true;

    Animated.timing(contentFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [contentFadeAnim, onReady]);

  // Fade out when app is ready
  useEffect(() => {
    if (isAppReady && hasStartedRef.current && !hasFadedOutRef.current) {
      hasFadedOutRef.current = true;

      Animated.timing(containerFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onReady();
      });
    }
  }, [isAppReady, containerFadeAnim, onReady]);

  return (
    <Animated.View style={[styles.container, { opacity: containerFadeAnim }]}>
      <Animated.View style={{ opacity: contentFadeAnim }}>
        <Image source={SPLASH_ICON} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});
