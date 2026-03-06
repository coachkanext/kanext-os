/**
 * Universal Footer — 3-icon persistent footer bar
 * Replaces NexusLogo. Always visible on every page (hard wall).
 *
 * Layout: 1px divider + 3 icons (Wallet, Nexus, Profile) evenly spaced
 * 49px height + safe area bottom padding
 *
 * Icons (all 24px, uniform like Instagram/X/WhatsApp):
 *   Wallet (left):  creditcard.fill — tap → push wallet screen
 *   Nexus (center): sparkles glyph — 6 gestures via PanResponder + Pressable
 *   Profile (right): person.circle — tap → push profile screen, long press → mode switcher
 */

import React, { useRef, useMemo } from 'react';
import { View, Pressable, PanResponder, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus, closeSplitNexus, isSplitNexusOpen } from '@/utils/global-split-nexus';
import { openMultitasking, closeMultitasking, isMultitaskingOpen } from '@/utils/global-multitasking';
import { startGlobalVoice } from '@/utils/global-voice';
import { openModeSwitcher } from '@/utils/global-mode-switcher';

const ICON_SIZE = 24;
const FOOTER_HEIGHT = 49;

export function UniversalFooter() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const lastTapRef = useRef(0);

  // ── Nexus tap → navigate to Nexus fullscreen (with double-tap for split) ──
  const handleNexusPress = () => {
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
      // Single tap → Nexus fullscreen
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isMultitaskingOpen()) closeMultitasking();
      if (isSplitNexusOpen()) closeSplitNexus();
      router.push('/nexus' as any);
    }, 350);
  };

  // ── Nexus long press → voice + search ──
  const handleNexusLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGlobalVoice();
    openSearchOverlay();
  };

  // ── Nexus PanResponder: swipe-up (multitasking), swipe-right (side panel) ──
  const nexusPanResponder = useMemo(
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
            // Swipe RIGHT → Side panel
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (isSplitNexusOpen()) {
              closeSplitNexus();
            } else {
              openSplitNexus();
            }
          }
        },
      }),
    [],
  );

  // ── Wallet tap → push wallet screen ──
  const handleWalletPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/wallet' as any);
  };

  // ── Profile tap → push profile screen ──
  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile' as any);
  };

  // ── Profile long press → mode switcher ──
  const handleProfileLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openModeSwitcher();
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      {/* 1px divider */}
      <View style={styles.divider} />

      {/* 3-icon row */}
      <View style={styles.footer}>
        {/* Wallet (left) */}
        <Pressable
          style={styles.iconButton}
          onPress={handleWalletPress}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
        >
          <IconSymbol
            name="creditcard.fill"
            size={ICON_SIZE}
            color="#FFFFFF"
          />
        </Pressable>

        {/* Nexus (center) — 6 gestures */}
        <View style={styles.iconButton} {...nexusPanResponder.panHandlers}>
          <Pressable
            style={styles.pressableInner}
            onPress={handleNexusPress}
            onLongPress={handleNexusLongPress}
            delayLongPress={400}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          >
            <IconSymbol
              name="sparkles"
              size={ICON_SIZE}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* Profile (right) — tap = profile, long press = mode switcher */}
        <Pressable
          style={styles.iconButton}
          onPress={handleProfilePress}
          onLongPress={handleProfileLongPress}
          delayLongPress={400}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
        >
          <IconSymbol
            name="person.circle"
            size={ICON_SIZE}
            color="#FFFFFF"
          />
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
    bottom: 0,
    zIndex: 10001,
    backgroundColor: '#000000',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#38383A',
  },
  footer: {
    height: FOOTER_HEIGHT,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: FOOTER_HEIGHT,
  },
  pressableInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
