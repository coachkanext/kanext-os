/**
 * Voice Overlay Component
 * Full-screen ChatGPT-style voice mode with animated circle responding to audio amplitude.
 * Shows listening state with pulsing circle, then processing state with spinner.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { VoiceState } from '@/hooks/use-speech-recognition';

const CIRCLE_SIZE = 160;

interface VoiceOverlayProps {
  visible: boolean;
  voiceState: VoiceState;
  audioLevel: number;
  onStop: () => void;
}

export function VoiceOverlay({ visible, voiceState, audioLevel, onStop }: VoiceOverlayProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const audioScale = useRef(new Animated.Value(1)).current;

  // Fade in/out backdrop + circle entry/exit
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(circleScale, {
          toValue: 1,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, circleScale]);

  // Audio level drives circle scale (listening only)
  useEffect(() => {
    if (voiceState === 'listening') {
      // Map audioLevel 0-1 to scale 1.0-1.5
      const targetScale = 1 + audioLevel * 0.5;
      Animated.spring(audioScale, {
        toValue: targetScale,
        damping: 12,
        stiffness: 200,
        mass: 0.5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(audioScale, {
        toValue: voiceState === 'processing' ? 0.6 : 1,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [audioLevel, voiceState, audioScale]);

  if (!visible) return null;

  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
      {/* Backdrop */}
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]} />

      {/* Center content */}
      <View style={styles.centerContainer}>
        {/* Animated circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: Brand.nexus,
              transform: [
                { scale: Animated.multiply(circleScale, audioScale) },
              ],
            },
          ]}
        >
          {isProcessing && (
            <ActivityIndicator size="large" color="#FFFFFF" />
          )}
        </Animated.View>

        {/* State label */}
        <ThemedText style={styles.stateLabel}>
          {isListening ? 'Listening...' : isProcessing ? 'Processing...' : ''}
        </ThemedText>
      </View>

      {/* Bottom stop button */}
      {isListening && (
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 60 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.stopButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onStop}
            accessibilityLabel="Stop listening"
            accessibilityRole="button"
          >
            <View style={styles.stopIcon} />
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateLabel: {
    marginTop: 32,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
