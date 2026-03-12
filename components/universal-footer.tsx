/**
 * Universal Footer — 5-icon persistent footer bar
 * Always visible on every page (hard wall). TAP ONLY — no footer-specific swipe gestures.
 * Horizontal swipes pass through to root layout (open panels) like the rest of the screen.
 *
 * Layout: 1px divider + 5 icons evenly spaced
 * 49px height + safe area bottom padding
 *
 * Icons (all use existing image assets):
 *   Home (1):         footer-home.png    — tap → navigate home
 *   Phone (2):        footer-phone.png   — tap → push phone
 *   Nexus (center):   footer-nexus.png   — tap, double-tap (multitasking), hold (search), swipe-up (split screen)
 *   Messages (4):     footer-messages.png — tap → push messages
 *   Profile (5):      footer-profile.png — tap → push profile, swipe-up → org drawer
 */

import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable, PanResponder, Animated, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus, closeSplitNexus, isSplitNexusOpen } from '@/utils/global-split-nexus';
import { openMultitasking, closeMultitasking, isMultitaskingOpen } from '@/utils/global-multitasking';
import { startGlobalVoice } from '@/utils/global-voice';
import { openOrgDrawer } from '@/utils/global-org-drawer';
import { subscribeFooterVisibility, resetFooter } from '@/utils/global-footer-hide';
import { popInnerToHome } from '@/utils/global-inner-nav';
const FOOTER_HEIGHT = 49;

export function UniversalFooter() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const lastTapRef = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return subscribeFooterVisibility((visible, instant) => {
      if (visible) {
        if (instant) {
          // Screen transition — snap immediately (like X)
          translateY.stopAnimation();
          Animated.timing(translateY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }).start();
        } else {
          // Scroll-driven — spring back
          Animated.spring(translateY, {
            toValue: 0,
            tension: 120,
            friction: 14,
            useNativeDriver: true,
          }).start();
        }
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

    if (now - lastTapRef.current < 300) {
      // Double tap → Multitasking
      lastTapRef.current = 0;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (isMultitaskingOpen()) {
        closeMultitasking();
      } else {
        openMultitasking();
      }
      return;
    }
    lastTapRef.current = now;
    setTimeout(() => {
      if (lastTapRef.current !== now) return;
      // Single tap → Nexus fullscreen (dead tap if already on Nexus)
      if (pathnameRef.current === '/nexus' || pathnameRef.current.startsWith('/nexus/')) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isMultitaskingOpen()) closeMultitasking();
      if (isSplitNexusOpen()) closeSplitNexus();

      router.navigate('/nexus' as any);
    }, 300);
  };

  // ── Nexus long press → voice + search ──
  const handleNexusLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGlobalVoice();
    openSearchOverlay();
  };

  // ── Nexus swipe-up PanResponder (split screen toggle) ──
  // Footer has NO special horizontal swipe gestures — those pass through
  // to the root layout's panelOpenPanResponder like the rest of the screen.
  const nexusPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_evt, gs) =>
          gs.dy < -15 && Math.abs(gs.dy) > Math.abs(gs.dx),
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dy < -50) {
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

  // ── Profile swipe-up → org drawer ──
  const profilePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_evt, gs) =>
          gs.dy < -15 && Math.abs(gs.dy) > Math.abs(gs.dx),
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dy < -50) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            openOrgDrawer();
          }
        },
      }),
    [],
  );

  /** Shared pre-nav: haptic + footer reset + close split */
  const preNav = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetFooter();
    if (isSplitNexusOpen()) closeSplitNexus();
  }, []);

  const pIncludes = (s: string) => pathnameRef.current.includes(s);
  const pIs = (s: string) => pathnameRef.current === s;
  const isOnNexus = () => {
    const p = pathnameRef.current;
    return p === '/nexus' || p.startsWith('/nexus/');
  };

  const handleHomePress = () => {
    const p = pathnameRef.current;
    // Dead tap only when already on the home index
    if (p === '/' || p === '/(tabs)' || p === '/(tabs)/(main)' || p === '/(main)') return;
    preNav();
    popInnerToHome();
    if (isOnNexus()) router.dismissAll();
  };
  const handleMessagesPress = () => {
    if (pIncludes('messages')) return;
    preNav();
    router.navigate('/(tabs)/(main)/messages' as any);
    if (isOnNexus()) router.dismissAll();
  };
  const handlePhonePress = () => {
    if (pIncludes('phone')) return;
    preNav();
    router.navigate('/(tabs)/(main)/phone' as any);
    if (isOnNexus()) router.dismissAll();
  };
  const handleProfilePress = () => {
    if (pIncludes('profile')) return;
    preNav();
    router.navigate('/(tabs)/(main)/profile' as any);
    if (isOnNexus()) router.dismissAll();
  };
  const handleProfileLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openOrgDrawer();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }] }]}>
      {/* 1px divider */}
      <View style={[styles.divider, { backgroundColor: C.footerDivider }]} />

      {/* 5-icon row — tap only, no footer-specific swipe gestures */}
      <View style={[styles.footer, { backgroundColor: C.footer }]}>
        {/* 1. Home */}
        <Pressable
          style={styles.iconButton}
          onPress={handleHomePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-home.png')}
            style={styles.iconImage}
          />
        </Pressable>

        {/* 2. Phone */}
        <Pressable
          style={styles.iconButton}
          onPress={handlePhonePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-phone.png')}
            style={styles.iconImage}
          />
        </Pressable>

        {/* 3. Nexus (center) — tap, double-tap, hold, swipe-up */}
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

        {/* 4. Messages */}
        <Pressable
          style={styles.iconButton}
          onPress={handleMessagesPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-messages.png')}
            style={styles.iconImage}
          />
        </Pressable>

        {/* 5. Profile — tap → profile page, swipe-up → org drawer */}
        <View style={styles.iconButton} {...profilePanResponder.panHandlers}>
          <Pressable
            style={styles.pressableInner}
            onPress={handleProfilePress}
            onLongPress={handleProfileLongPress}
            delayLongPress={400}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image
              source={require('@/assets/images/footer-profile.png')}
              style={styles.iconImage}
            />
          </Pressable>
        </View>
      </View>

      {/* Safe area fill — extends behind home indicator */}
      <View style={{ height: insets.bottom, backgroundColor: C.footer }} />
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
  },
  footer: {
    height: FOOTER_HEIGHT,
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
  iconImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  } as any,
  nexusImage: {
    width: '96%',
    height: (FOOTER_HEIGHT - 8) * 1.2,
    resizeMode: 'contain',
  } as any,
});
