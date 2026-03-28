/**
 * Universal Footer — 5-icon persistent footer bar
 * Always visible on every page (hard wall). TAP ONLY — no footer-specific swipe gestures.
 * Horizontal swipes pass through to root layout (open panels) like the rest of the screen.
 *
 * Layout: 1px divider + 5 icons evenly spaced
 * 49px height + safe area bottom padding
 *
 * Icons (all use existing image assets):
 *   Home (1):         footer-home.png    — tap → navigate home, swipe-up → org drawer, hold → settings
 *   Phone (2):        footer-phone.png   — tap → push phone
 *   Nexus (center):   footer-nexus.png   — tap, double-tap (multitasking), hold (search), swipe-up (split screen)
 *   Messages (4):     footer-messages.png — tap → push messages
 *   Profile (5):      footer-profile.png — tap → push profile, swipe-up → org drawer
 */

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, PanResponder, StyleSheet, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { openSearchOverlay } from '@/utils/global-search-overlay';
import { openSplitNexus, closeSplitNexus, isSplitNexusOpen } from '@/utils/global-split-nexus';
import { openMultitasking, closeMultitasking, isMultitaskingOpen } from '@/utils/global-multitasking';
import { startGlobalVoice } from '@/utils/global-voice';
import { openOrgDrawer } from '@/utils/global-org-drawer';
import { openModeSwitcher } from '@/utils/global-mode-switcher';
import { resetFooter, subscribeFooterVisibility, getFooterVisible } from '@/utils/global-footer-hide';
import { popInnerToHome } from '@/utils/global-inner-nav';
import { subscribePulseBadge } from '@/utils/global-pulse-badge';
const FOOTER_HEIGHT = 49;

export function UniversalFooter() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const lastTapRef = useRef(0);

  const [pulseBadge, setPulseBadge] = useState(0);

  useEffect(() => subscribePulseBadge(setPulseBadge), []);

  const translateY = useRef(new Animated.Value(0)).current;
  const insetsRef = useRef(insets);
  insetsRef.current = insets;

  useEffect(() => {
    // Sync translateY to current module state (fixes hot-reload drift)
    const initial = getFooterVisible() ? 0 : FOOTER_HEIGHT + insetsRef.current.bottom + 1;
    Animated.timing(translateY, { toValue: initial, duration: 0, useNativeDriver: true }).start();

    return subscribeFooterVisibility((visible, instant) => {
      const toValue = visible ? 0 : FOOTER_HEIGHT + insetsRef.current.bottom + 1;
      if (instant) {
        Animated.timing(translateY, { toValue, duration: 0, useNativeDriver: true }).start();
      } else {
        Animated.spring(translateY, {
          toValue,
          useNativeDriver: true,
          tension: 200,
          friction: 25,
        }).start();
      }
    });
  }, [translateY]);

  // Reset footer on every route change — ensures footer is always visible after navigation
  // (fixes stuck-hidden state on iOS/New Architecture where setValue() race-conditions can occur)
  useEffect(() => {
    resetFooter();
  }, [pathname]);

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
    // Dead tap when already on home index
    if (p === '/' || p === '/(tabs)/(main)') return;
    preNav();
    popInnerToHome();
    // Fallback: direct navigation in case the inner nav ref isn't ready
    router.navigate('/' as any);
  };
  const handleMessagesPress = () => {
    const p = pathnameRef.current;
    // Dead tap — already on messages list
    if (p === '/(tabs)/(main)/messages') return;
    preNav();
    // Inside a messages sub-screen — navigate pops back to root within the stack
    if (p.startsWith('/(tabs)/(main)/messages')) {
      router.navigate({ pathname: '/(tabs)/(main)/messages' } as any);
      return;
    }
    // From any other context (home, phone, nexus, etc.) — push
    router.push({ pathname: '/(tabs)/(main)/messages' } as any);
  };
  const handlePhonePress = () => {
    if (pIncludes('phone')) return;
    preNav();
    router.navigate({ pathname: '/(tabs)/(main)/phone' } as any);
  };
  const handlePulsePress = () => {
    if (pIncludes('pulse')) return;
    preNav();
    router.push({ pathname: '/(tabs)/(main)/pulse' } as any);
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }] }]}>
      {/* 1px divider */}
      <View style={[styles.divider, { backgroundColor: C.footerDivider }]} />

      {/* 5-icon row */}
      <View style={[styles.footer, { backgroundColor: C.footer }]}>
        {/* 1. Home */}
        <Pressable
          style={[styles.iconButton, styles.pressableInner]}
          onPress={handleHomePress}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            openOrgDrawer();
          }}
          delayLongPress={400}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol name="house" size={22} color={C.label} />
        </Pressable>

        {/* 2. Phone */}
        <Pressable
          style={styles.iconButton}
          onPress={handlePhonePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol name="phone" size={22} color={C.label} />
        </Pressable>

        {/* 3. Nexus (center) */}
        <View style={styles.iconButton} {...nexusPanResponder.panHandlers}>
          <Pressable
            style={styles.pressableInner}
            onPress={handleNexusPress}
            onLongPress={handleNexusLongPress}
            delayLongPress={400}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="sparkles" size={24} color={C.label} />
          </Pressable>
        </View>

        {/* 4. Messages */}
        <Pressable
          style={styles.iconButton}
          onPress={handleMessagesPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol name="message" size={22} color={C.label} />
        </Pressable>

        {/* 5. Pulse */}
        <Pressable
          style={styles.iconButton}
          onPress={handlePulsePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View>
            <IconSymbol name="bolt" size={22} color={pulseBadge > 0 ? C.accent : C.label} />
            {pulseBadge > 0 && (
              <View style={[styles.badge, { backgroundColor: C.red }]}>
                <Text style={styles.badgeText}>{pulseBadge > 99 ? '99+' : pulseBadge}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>

      {/* Safe area fill */}
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
    shadowColor: '#8B6343',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});
