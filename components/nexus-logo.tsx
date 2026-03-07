/**
 * Nexus Logo — 3-state animated whistle icon
 * Replaces the semi-circle. No background, border, shadow, or fill.
 * Just the tinted whistle image floating at bottom-center.
 *
 * States:
 *   home   → 96px, aligned with icon-grid row 4 center gap
 *   screen → 72px, bottom-center above safe area
 *   nexus  → 72px, bottom-center above safe area
 *   hidden → not rendered
 *
 * 5 Gestures (all states):
 *   Tap         → Nexus text (navigate to Nexus fullscreen)
 *   Long press  → Nexus voice + global search
 *   Double tap  → Split screen
 *   Swipe UP    → Multitasking
 *   Swipe RIGHT → Go back (universal previous screen)
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, Image, Pressable, PanResponder, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus, closeSplitNexus, isSplitNexusOpen } from '@/utils/global-split-nexus';
import { openMultitasking, closeMultitasking, isMultitaskingOpen } from '@/utils/global-multitasking';
import { startGlobalVoice } from '@/utils/global-voice';
import {
  subscribeNexusLogoState,
  getNexusLogoState,
  type NexusLogoState,
} from '@/utils/global-nexus-state';

// Swap to nexus-whistle.png when the asset is added
const LOGO_SOURCE = require('@/assets/images/nexus-logo.png');

const HOME_SIZE = 96;
const COMPACT_SIZE = 72;
const HOME_BOTTOM_OFFSET = 24; // above safe area, aligned with grid row 4 gap
const COMPACT_BOTTOM_OFFSET = 8; // tight to safe area

export function NexusLogo() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const lastTapRef = useRef(0);
  const [logoState, setLogoState] = useState<NexusLogoState>(getNexusLogoState);

  // Animated values
  const sizeAnim = useRef(new Animated.Value(HOME_SIZE)).current;
  const bottomAnim = useRef(
    new Animated.Value(insets.bottom + HOME_BOTTOM_OFFSET),
  ).current;

  // Subscribe to state changes
  useEffect(() => {
    const unsub = subscribeNexusLogoState((state) => {
      setLogoState(state);

      const targetSize = state === 'home' ? HOME_SIZE : COMPACT_SIZE;
      const targetBottom =
        insets.bottom +
        (state === 'home' ? HOME_BOTTOM_OFFSET : COMPACT_BOTTOM_OFFSET);

      Animated.parallel([
        Animated.spring(sizeAnim, {
          toValue: targetSize,
          tension: 65,
          friction: 11,
          useNativeDriver: false,
        }),
        Animated.spring(bottomAnim, {
          toValue: targetBottom,
          tension: 65,
          friction: 11,
          useNativeDriver: false,
        }),
      ]).start();
    });
    return unsub;
  }, [insets.bottom, sizeAnim, bottomAnim]);

  // ── Tap → Nexus text (with double-tap detection for split screen) ──
  const handlePress = () => {
    const now = Date.now();

    if (now - lastTapRef.current < 350) {
      // Double tap → Split screen
      lastTapRef.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (isSplitNexusOpen()) {
        closeSplitNexus();
      } else {
        openSplitNexus();
      }
      return;
    }
    lastTapRef.current = now;
    setTimeout(() => {
      if (lastTapRef.current !== now) return;
      // Single tap → Nexus text (navigate to Nexus fullscreen)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isMultitaskingOpen()) closeMultitasking();
      if (isSplitNexusOpen()) closeSplitNexus();
      router.push('/nexus' as any);
    }, 350);
  };

  // ── Long press → Nexus voice + global search ─────────────────────
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGlobalVoice();
    openSearchOverlay();
  };

  // ── PanResponder: swipe-up, swipe-right, swipe-left ───────────────
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) => {
          return Math.abs(gs.dx) > 15 || Math.abs(gs.dy) > 15;
        },
        onPanResponderRelease: (_evt, gs) => {
          const absX = Math.abs(gs.dx);
          const absY = Math.abs(gs.dy);

          if (absY > absX && gs.dy < -50) {
            // Swipe UP → Multitasking
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openMultitasking();
          } else if (absX > absY && gs.dx > 40) {
            // Swipe RIGHT → Go back to previous screen
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (router.canGoBack()) {
              router.back();
            }
          }
        },
      }),
    [],
  );

  if (logoState === 'hidden') return null;

  const isCompact = logoState !== 'home';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          bottom: bottomAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.divider} />
      <View {...panResponder.panHandlers}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
          hitSlop={isCompact ? { top: 10, bottom: 10, left: 10, right: 10 } : undefined}
        >
          <Animated.Image
            source={LOGO_SOURCE}
            style={{
              width: sizeAnim,
              height: sizeAnim,
              tintColor: '#FFFFFF',
            }}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10001,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#38383A',
    marginBottom: 8,
  },
});
