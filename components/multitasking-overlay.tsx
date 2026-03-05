/**
 * Multitasking Overlay — iOS-style App Switcher
 * Full-screen overlay with horizontally scrollable app preview cards.
 * Cards are phone-screen-shaped, swipe up to dismiss.
 * Tap anywhere outside cards → dismiss + go home.
 * Nexus button stays visible at bottom — tap it to close + go home.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMultitasking, type MultitaskingScreen } from '@/context/multitasking-context';
import { registerMultitaskingHandlers, closeMultitasking } from '@/utils/global-multitasking';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** iOS-style app preview card with swipe-up to dismiss */
function AppCard({
  screen,
  cardWidth,
  cardHeight,
  onTap,
  onRemove,
}: {
  screen: MultitaskingScreen;
  cardWidth: number;
  cardHeight: number;
  onTap: () => void;
  onRemove: () => void;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) =>
          gs.dy < -10 && Math.abs(gs.dy) > Math.abs(gs.dx),
        onPanResponderMove: (_evt, gs) => {
          if (gs.dy < 0) {
            translateY.setValue(gs.dy);
            const progress = Math.min(Math.abs(gs.dy) / 300, 1);
            scale.setValue(1 - progress * 0.15);
            cardOpacity.setValue(1 - progress * 0.5);
          }
        },
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dy < -80 || gs.vy < -0.5) {
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: -600,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(cardOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRemove();
            });
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              tension: 80,
              friction: 10,
              useNativeDriver: true,
            }).start();
            Animated.spring(scale, {
              toValue: 1,
              tension: 80,
              friction: 10,
              useNativeDriver: true,
            }).start();
            Animated.spring(cardOpacity, {
              toValue: 1,
              tension: 80,
              friction: 10,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [translateY, scale, cardOpacity, onRemove],
  );

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width: cardWidth,
          height: cardHeight,
          transform: [{ translateY }, { scale }],
          opacity: cardOpacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable style={styles.cardSurface} onPress={onTap}>
        <View style={styles.cardPreview}>
          <View style={styles.cardIconLarge}>
            <IconSymbol name={screen.icon} size={44} color="#FFFFFF" />
          </View>
        </View>
      </Pressable>

      <Text style={styles.cardLabel} numberOfLines={1}>
        {screen.title}
      </Text>
    </Animated.View>
  );
}

export function MultitaskingOverlay() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { screens, removeScreen } = useMultitasking();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  const cardWidth = width * 0.62;
  const cardHeight = height * 0.48;

  useEffect(() => {
    registerMultitaskingHandlers(
      () => {
        setVisible(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
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
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 60,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [fadeAnim, slideAnim]);

  const handleDismissToHome = useCallback(() => {
    closeMultitasking();
    router.navigate('/(tabs)/(main)' as any);
  }, [router]);

  const handleCardTap = useCallback(
    (screen: MultitaskingScreen) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      closeMultitasking();
      router.push(screen.route as any);
    },
    [router],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeScreen(id);
    },
    [removeScreen],
  );

  if (!visible) return null;

  return (
    <AnimatedPressable
      style={[styles.container, { opacity: fadeAnim }]}
      onPress={handleDismissToHome}
    >
      {/* Dark backdrop (visual only, not interactive) */}
      <View style={styles.backdrop} pointerEvents="none" />

      {/* Top dismiss zone */}
      <View style={{ height: insets.top + 80 }} pointerEvents="none" />

      {/* Cards row — only takes the height it needs */}
      <Animated.View
        style={[
          styles.cardRow,
          { transform: [{ translateY: slideAnim }] },
        ]}
        pointerEvents="box-none"
      >
        {screens.length === 0 ? (
          <View style={styles.emptyState} pointerEvents="none">
            <IconSymbol name="rectangle.stack" size={48} color="#3F3F46" />
            <Text style={styles.emptyText}>No Recent Apps</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.cardList,
              screens.length === 1 && { flex: 1, justifyContent: 'center' },
            ]}
            snapToInterval={cardWidth + 16}
            decelerationRate="fast"
          >
            {screens.map((screen) => (
              <AppCard
                key={screen.id}
                screen={screen}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                onTap={() => handleCardTap(screen)}
                onRemove={() => handleRemove(screen.id)}
              />
            ))}
          </ScrollView>
        )}
      </Animated.View>

      {/* Bottom dismiss zone */}
      <View style={{ flex: 1 }} pointerEvents="none" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  cardRow: {
    alignItems: 'center',
  },
  cardList: {
    paddingHorizontal: 24,
    gap: 16,
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',
  },
  cardSurface: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A1A1AA',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#52525B',
    marginTop: 16,
  },
});
