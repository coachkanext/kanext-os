/**
 * Universal Footer — 5-icon persistent footer bar
 * Always visible on every page (hard wall).
 *
 * Layout: 1px divider + 5 icons evenly spaced
 * 49px height + safe area bottom padding
 *
 * Icons (all use existing image assets):
 *   Home (1):         footer-home.png    — tap → navigate home
 *   Messages (2):     icon-messages.png  — tap → push messages
 *   Nexus (center):   footer-nexus.png   — 6 gestures via PanResponder + Pressable
 *   Media (4):        icon-media.png     — tap → push media
 *   Organization (5): icon-program.png   — tap → push organization
 */

import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Image, Pressable, PanResponder, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus, closeSplitNexus, isSplitNexusOpen } from '@/utils/global-split-nexus';
import { openMultitasking, closeMultitasking, isMultitaskingOpen } from '@/utils/global-multitasking';
import { startGlobalVoice } from '@/utils/global-voice';
import { openModeSwitcher } from '@/utils/global-mode-switcher';
import { subscribeFooterVisibility } from '@/utils/global-footer-hide';

const FOOTER_HEIGHT = 49;

export function UniversalFooter() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const lastTapRef = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return subscribeFooterVisibility((visible) => {
      if (visible) {
        Animated.spring(translateY, {
          toValue: 0,
          tension: 120,
          friction: 14,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(translateY, {
          toValue: FOOTER_HEIGHT + insets.bottom + 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [insets.bottom]);

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
      router.navigate('/nexus' as any);
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

  // ── Home tap → go home ──
  const handleHomePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate('/(tabs)/(main)' as any);
  };

  // ── Messages tap → navigate (no-op if already there) ──
  const handleMessagesPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate('/messages' as any);
  };

  // ── Media tap → navigate (no-op if already there) ──
  const handleMediaPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate('/section?title=Media' as any);
  };

  // ── Organization tap → navigate (no-op if already there) ──
  const handleOrgPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate('/section?title=Organization' as any);
  };

  // ── Organization long press → mode switcher ──
  const handleOrgLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openModeSwitcher();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }] }]}>
      {/* 1px divider */}
      <View style={styles.divider} />

      {/* 5-icon row */}
      <View style={styles.footer}>
        {/* 1. Home */}
        <Pressable
          style={styles.iconButton}
          onPress={handleHomePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-home.png')}
            style={styles.footerImage}
          />
        </Pressable>

        {/* 2. Messages */}
        <Pressable
          style={styles.iconButton}
          onPress={handleMessagesPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-messages.png')}
            style={styles.footerImage}
          />
        </Pressable>

        {/* 3. Nexus (center) — 6 gestures */}
        <View style={styles.iconButton} {...nexusPanResponder.panHandlers}>
          <Pressable
            style={styles.pressableInner}
            onPress={handleNexusPress}
            onLongPress={handleNexusLongPress}
            delayLongPress={400}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image
              source={require('@/assets/images/footer-nexus.png')}
              style={styles.nexusImage}
            />
          </Pressable>
        </View>

        {/* 4. Media */}
        <Pressable
          style={styles.iconButton}
          onPress={handleMediaPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-media.png')}
            style={styles.footerImage}
          />
        </Pressable>

        {/* 5. Organization — long press → mode switcher */}
        <Pressable
          style={styles.iconButton}
          onPress={handleOrgPress}
          onLongPress={handleOrgLongPress}
          delayLongPress={400}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-org.png')}
            style={styles.footerImage}
          />
        </Pressable>
      </View>

      {/* Safe area fill — extends black behind home indicator */}
      <View style={{ height: insets.bottom, backgroundColor: '#000000' }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10001,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
  footerImage: {
    width: 75,
    height: 75,
    resizeMode: 'contain',
  } as any,
  nexusImage: {
    width: '80%',
    height: FOOTER_HEIGHT - 8,
    resizeMode: 'contain',
  } as any,
});
