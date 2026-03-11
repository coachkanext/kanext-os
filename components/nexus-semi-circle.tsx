/**
 * Nexus Semi-Circle
 * True half-circle that bleeds into the bottom of the screen.
 * Flat edge faces DOWN, flush with/below the screen bottom.
 * Curved edge faces UP into the content area.
 * Jet black fill — feels like the screen curves inward.
 * Subtle accent glow on the curved top arc.
 *
 * 6 gestures (scoped to this element only):
 *   Tap         → always Nexus fullscreen
 *   Double-tap  → mode switcher (3 icons, excludes current)
 *   Long-press  → search + voice
 *   Swipe UP    → multitasking overlay
 *   Swipe RIGHT → toggle split Nexus on/off
 *   Swipe LEFT  → nothing
 *   Swipe DOWN  → nothing (reserved for iOS system)
 */

import React, { useRef, useMemo } from 'react';
import { View, Pressable, PanResponder, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus, closeSplitNexus, isSplitNexusOpen } from '@/utils/global-split-nexus';
import { openMultitasking, closeMultitasking, isMultitaskingOpen } from '@/utils/global-multitasking';
import { openModeSwitcher } from '@/utils/global-mode-switcher';
import { startGlobalVoice } from '@/utils/global-voice';

const DIAMETER = 120;
const RADIUS = DIAMETER / 2;
const BLEED = RADIUS;

export function NexusSemiCircle() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const lastTapRef = useRef(0);

  // ── Tap with double-tap detection ──────────────────────────────────
  const handlePress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      // Double tap → mode switcher
      lastTapRef.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      openModeSwitcher();
      return;
    }
    lastTapRef.current = now;
    setTimeout(() => {
      if (lastTapRef.current !== now) return;
      // Single tap → always navigate to Nexus fullscreen
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Close multitasking or split if open
      if (isMultitaskingOpen()) closeMultitasking();
      if (isSplitNexusOpen()) closeSplitNexus();
      router.push('/nexus' as any);
    }, 350);
  };

  // ── Long press → Search + Voice ────────────────────────────────────
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openSearchOverlay();
    startGlobalVoice();
  };

  // ── PanResponder: swipe-up, swipe-right (toggle split) ─────────────
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
            // Swipe UP → multitasking
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openMultitasking();
          } else if (absX > absY && gs.dx > 40) {
            // Swipe RIGHT only → toggle split Nexus
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (isSplitNexusOpen()) {
              closeSplitNexus();
            } else {
              openSplitNexus();
            }
          }
          // Swipe LEFT → nothing
          // Swipe DOWN → nothing (iOS system gesture)
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
            <IconSymbol name="sparkles" size={30} color={C.label} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10001,
    },
    circle: {
      width: DIAMETER,
      height: DIAMETER,
      borderRadius: RADIUS,
      backgroundColor: C.bg,
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
