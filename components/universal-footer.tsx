/**
 * Universal Footer — 5-icon persistent footer bar (Section 12, KaNeXT Product Spec)
 * Always visible. Hides on scroll-down, reappears on scroll-up.
 *
 * Gesture system (only Home and Nexus have multi-gesture):
 *   Home (1)    — tap → Home screen · hold → Brand Drawer
 *   Phone (2)   — tap → Phone page
 *   Nexus (3)   — tap → full Nexus chat · double-tap → half-screen overlay · hold → voice mode
 *   Messages (4)— tap → Messages page
 *   Pulse (5)   — tap → Pulse page · badge = unread count
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { openSplitNexus, closeSplitNexus, isSplitNexusOpen } from '@/utils/global-split-nexus';
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
      // Double tap → Split Nexus overlay
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
      if (isSplitNexusOpen()) closeSplitNexus();

      router.navigate('/nexus' as any);
    }, 300);
  };

  // ── Nexus long press → voice only ──
  const handleNexusLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startGlobalVoice();
  };

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

  // Active route detection — exactly one icon is active at a time
  const p = pathname;
  const activePhone    = p.includes('phone');
  const activeNexus    = p === '/nexus' || p.startsWith('/nexus/');
  const activeMessages = p.includes('messages');
  const activePulse    = p.includes('pulse');
  const activeHome     = !activePhone && !activeNexus && !activeMessages && !activePulse;

  const ic = (active: boolean, filled: string, outline: string) =>
    ({ name: (active ? filled : outline) as any, color: active ? C.label : C.muted });

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
          <IconSymbol size={22} {...ic(activeHome, 'house.fill', 'house')} />
        </Pressable>

        {/* 2. Phone */}
        <Pressable
          style={styles.iconButton}
          onPress={handlePhonePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol size={22} {...ic(activePhone, 'phone.fill', 'phone')} />
        </Pressable>

        {/* 3. Nexus (center) */}
        <Pressable
          style={[styles.iconButton, styles.pressableInner]}
          onPress={handleNexusPress}
          onLongPress={handleNexusLongPress}
          delayLongPress={400}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image
            source={require('@/assets/nexus-icon.png')}
            style={{ width: 24, height: 24, tintColor: activeNexus ? C.label : C.muted }}
            resizeMode="contain"
          />
        </Pressable>

        {/* 4. Messages */}
        <Pressable
          style={styles.iconButton}
          onPress={handleMessagesPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol size={22} {...ic(activeMessages, 'message.fill', 'message')} />
        </Pressable>

        {/* 5. Pulse */}
        <Pressable
          style={styles.iconButton}
          onPress={handlePulsePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View>
            <IconSymbol size={22} {...ic(activePulse, 'bolt.fill', 'bolt')} />
            {pulseBadge > 0 && (
              <View style={[styles.badge, { backgroundColor: C.ember }]}>
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
