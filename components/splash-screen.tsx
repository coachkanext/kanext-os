/**
 * KaNeXT OS Boot Splash Screen
 * Full-screen black with pulsating center watermark and bottom tag.
 *
 * Only shows on cold start, not when resuming from background.
 *
 * IMPORTANT: This component should only ever be mounted ONCE per app session.
 * The parent layout (app/_layout.tsx) controls this via a module-level guard.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';

const KX_LOGO = require('@/assets/images/k1-logo.png');

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
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const hasStartedRef = useRef(false);
  const hasFadedOutRef = useRef(false);

  // Derived animated values for the pulse
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.95, 1.05, 0.95],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1, 0.7],
  });

  // Fade in content + start pulse loop on mount
  useEffect(() => {
    if (ANIMATION_STARTED || hasStartedRef.current) {
      onReady();
      return;
    }

    ANIMATION_STARTED = true;
    hasStartedRef.current = true;

    // Fade in content
    Animated.timing(contentFadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Start heartbeat pulse loop
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [contentFadeAnim, pulseAnim, onReady]);

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
      {/* Center watermark with pulse */}
      <Animated.View
        style={[
          styles.centerMark,
          {
            opacity: Animated.multiply(contentFadeAnim, pulseOpacity),
            transform: [{ scale: pulseScale }],
          },
        ]}
      >
        <Image source={KX_LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      {/* Bottom tag */}
      <Animated.View style={[styles.bottomTag, { opacity: contentFadeAnim }]}>
        <Text style={styles.poweredBy}>powered by </Text>
        <Text style={styles.nexus}>Nexus</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMark: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  bottomTag: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  poweredBy: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  nexus: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
