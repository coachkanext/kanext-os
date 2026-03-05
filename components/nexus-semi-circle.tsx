/**
 * Nexus Semi-Circle
 * True half-circle that bleeds into the bottom of the screen.
 * Flat edge faces DOWN, flush with/below the screen bottom.
 * Curved edge faces UP into the content area.
 * Jet black fill — feels like the screen curves inward.
 * Subtle accent glow on the curved top arc.
 *
 * 6 gestures (scoped to this element only):
 *   Tap         → toggle Home/Nexus
 *   Double-tap  → split Nexus
 *   Long-press  → search + voice
 *   Swipe UP    → multitasking overlay
 *   Swipe LEFT  → mode switcher (forward)
 *   Swipe RIGHT → mode switcher (backward)
 *   Swipe DOWN  → nothing (reserved for iOS system)
 */

import React, { useRef, useMemo } from 'react';
import { View, Pressable, PanResponder, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { getCurrentTab } from '@/utils/global-semi-circle';
import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus } from '@/utils/global-split-nexus';
import { openMultitasking } from '@/utils/global-multitasking';
import { openModeSwitcher } from '@/utils/global-mode-switcher';
import { startGlobalVoice } from '@/utils/global-voice';

const DIAMETER = 120;
const RADIUS = DIAMETER / 2;
const BLEED = RADIUS;

export function NexusSemiCircle() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();
  const lastTapRef = useRef(0);

  // ── Tap with double-tap detection ──────────────────────────────────
  const handlePress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      lastTapRef.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      openSplitNexus();
      return;
    }
    lastTapRef.current = now;
    setTimeout(() => {
      if (lastTapRef.current !== now) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = getCurrentTab();
      if (current === 'nexus') {
        router.navigate('/(tabs)/(main)' as any);
      } else {
        router.navigate('/(tabs)/nexus' as any);
      }
    }, 350);
  };

  // ── Long press → Search + Voice ────────────────────────────────────
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openSearchOverlay();
    startGlobalVoice();
  };

  // ── PanResponder: swipe-up, swipe-left, swipe-right ────────────────
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) => {
          // Claim gesture if either axis exceeds threshold
          return Math.abs(gs.dx) > 15 || Math.abs(gs.dy) > 15;
        },
        onPanResponderRelease: (_evt, gs) => {
          const absX = Math.abs(gs.dx);
          const absY = Math.abs(gs.dy);

          if (absY > absX && gs.dy < -50) {
            // Swipe UP → multitasking
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openMultitasking();
          } else if (absX > absY && absX > 40) {
            // Swipe LEFT or RIGHT → mode switcher
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openModeSwitcher();
          }
          // Swipe DOWN → intentionally nothing (iOS system gesture)
        },
      }),
    [],
  );

  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom - BLEED }]}
      pointerEvents="box-none"
    >
      <View {...panResponder.panHandlers}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
          style={[styles.circle, { shadowColor: accent }]}
        >
          <View style={[styles.glowArc, { borderTopColor: accent }]} />
          <View style={styles.iconArea}>
            <IconSymbol name="sparkles" size={30} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  circle: {
    width: DIAMETER,
    height: DIAMETER,
    borderRadius: RADIUS,
    backgroundColor: '#000000',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 16,
  },
  glowArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  iconArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
