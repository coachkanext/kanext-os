/**
 * Mode Switcher Overlay
 * Full-screen dimmed overlay with bottom dock row of mode icons.
 * Triggered by long-press on Mode footer icon or swipe-down on Nexus semi-circle.
 * Shows ALL 4 mode icons centered horizontally; current mode highlighted.
 * Spring animation on entry. Backdrop tap dismisses.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ModeColors, MODE_ACCENT } from '@/constants/theme';
import { useAppContext } from '@/context/app-context';
import { registerModeSwitcherHandlers } from '@/utils/global-mode-switcher';
import { popInnerToHome } from '@/utils/global-inner-nav';
import type { Mode } from '@/types';

const ALL_MODES: { mode: Mode; icon: IconSymbolName; label: string; image?: any }[] = [
  { mode: 'education', icon: 'graduationcap.fill', label: 'Education', image: require('@/assets/images/mode-education.png') },
  { mode: 'sports', icon: 'basketball.fill', label: 'Sports', image: require('@/assets/images/mode-sports.png') },
  { mode: 'church', icon: 'building.columns.fill', label: 'Faith', image: require('@/assets/images/mode-church.png') },
  { mode: 'business', icon: 'briefcase.fill', label: 'Business', image: require('@/assets/images/mode-business.png') },
];

export function ModeSwitcherOverlay() {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const { state, switchMode } = useAppContext();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dockTranslateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    registerModeSwitcherHandlers(
      () => {
        setVisible(true);
        // Animate in: backdrop fade + dock spring up
        backdropOpacity.setValue(0);
        dockTranslateY.setValue(100);
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(dockTranslateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }),
        ]).start();
      },
      () => dismiss(),
    );
  }, []);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(dockTranslateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [backdropOpacity, dockTranslateY]);

  const handleSelect = useCallback((selectedMode: Mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchMode(selectedMode);
    popInnerToHome();
    // If on Nexus, dismiss the stack
    if (pathnameRef.current === '/nexus' || pathnameRef.current.startsWith('/nexus/')) {
      router.dismissAll();
    }
    dismiss();
  }, [switchMode, dismiss, router]);

  const otherModes = ALL_MODES.filter((m) => m.mode !== state.mode);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Dimmed backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>

      {/* Bottom dock row */}
      <Animated.View
        style={[
          styles.dock,
          {
            bottom: insets.bottom + 48,
            transform: [{ translateY: dockTranslateY }],
          },
        ]}
      >
        {otherModes.map((m) => {
          const modeColor = MODE_ACCENT[m.mode];
          return (
            <Pressable
              key={m.mode}
              style={({ pressed }) => [
                styles.modeButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleSelect(m.mode)}
            >
              {m.image ? (
                <Image source={m.image} style={styles.modeImage} />
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: modeColor + '30' }]}>
                  <IconSymbol name={m.icon} size={24} color={modeColor} />
                </View>
              )}
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  modeButton: {
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modeImage: {
    width: 52,
    height: 52,
  },
  modeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
});
