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
 *   Messages (2):     footer-messages.png — tap → push messages
 *   Nexus (center):   footer-nexus.png   — tap, double-tap, hold, swipe-up (multitasking)
 *   Phone (4):        footer-phone.png   — tap → push phone
 *   Organization (5): footer-org.png     — tap → push organization, long press → mode switcher
 */

import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Image, Pressable, PanResponder, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus, closeSplitNexus, isSplitNexusOpen } from '@/utils/global-split-nexus';
import { openMultitasking, closeMultitasking, isMultitaskingOpen } from '@/utils/global-multitasking';
import { startGlobalVoice } from '@/utils/global-voice';
import { openModeSwitcher } from '@/utils/global-mode-switcher';
import { subscribeFooterVisibility, resetFooter } from '@/utils/global-footer-hide';
import { useMode } from '@/context/app-context';
import type { Mode } from '@/types';

const ORG_ICONS: Record<string, any> = {
  sports: require('@/assets/images/footer-org.png'),
  business: require('@/assets/images/footer-org-business.png'),
  church: require('@/assets/images/footer-org-church.png'),
  education: require('@/assets/images/footer-org-education.png'),
};

const FOOTER_HEIGHT = 49;

export function UniversalFooter() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const mode = useMode();
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
      // Single tap → Nexus fullscreen (dead tap if already on Nexus)
      if (pathnameRef.current === '/nexus' || pathnameRef.current.startsWith('/nexus/')) return;
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

  // ── Nexus swipe-up PanResponder (multitasking) ──
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
            openMultitasking();
          }
        },
      }),
    [],
  );

  /** Shared pre-nav: haptic + footer reset + close split + dismiss root screens */
  const preNav = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetFooter();
    if (isSplitNexusOpen()) closeSplitNexus();
    if (router.canDismiss()) router.dismissAll();
  }, [router]);

  const pIncludes = (s: string) => pathnameRef.current.includes(s);
  const pIs = (s: string) => pathnameRef.current === s;

  const handleHomePress = () => {
    if ((pIs('/') || pIs('/(tabs)') || pIs('/(tabs)/(main)') || pIs('/(main)')) && !pIncludes('messages') && !pIncludes('phone') && !pIncludes('section')) return;
    preNav(); router.navigate('/(tabs)/(main)' as any);
  };
  const handleMessagesPress = () => { if (pIncludes('messages')) return; preNav(); router.navigate('/(tabs)/(main)/messages' as any); };
  const handlePhonePress = () => { if (pIncludes('phone')) return; preNav(); router.navigate('/(tabs)/(main)/phone' as any); };
  const handleOrgPress = () => { if (pIncludes('section') && pIncludes('Organization')) return; preNav(); router.navigate('/(tabs)/(main)/section?title=Organization' as any); };

  // ── Organization long press → mode switcher ──
  const handleOrgLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openModeSwitcher();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }] }]}>
      {/* 1px divider */}
      <View style={styles.divider} />

      {/* 5-icon row — tap only, no footer-specific swipe gestures */}
      <View style={styles.footer}>
        {/* 1. Home */}
        <Pressable
          style={styles.iconButton}
          onPress={handleHomePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-home.png')}
            style={styles.homeImage}
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
            style={styles.messagesImage}
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

        {/* 4. Phone */}
        <Pressable
          style={styles.iconButton}
          onPress={handlePhonePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/images/footer-phone.png')}
            style={styles.phoneImage}
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
            source={ORG_ICONS[mode]}
            style={styles.orgImage}
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
  homeImage: {
    width: 67,
    height: 67,
    resizeMode: 'contain',
  } as any,
  messagesImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  } as any,
  footerImage: {
    width: 75,
    height: 75,
    resizeMode: 'contain',
  } as any,
  orgImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  } as any,
  phoneImage: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  } as any,
  nexusImage: {
    width: '96%',
    height: (FOOTER_HEIGHT - 8) * 1.2,
    resizeMode: 'contain',
  } as any,
  phoneEmoji: {
    fontSize: 28,
  },
});
