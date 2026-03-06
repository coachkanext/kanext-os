/**
 * Multitasking Overlay — iOS App Switcher style.
 * Current screen on the right, older screens staggered to the left.
 * Swipe up on a card to dismiss it. Tap card to switch. Tap outside to go home.
 * Auto-scrolls to the rightmost (current) card on open.
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

// ─── App Card ───────────────────────────────────────────────────────────────

function AppCard({
  screen,
  cardWidth,
  cardHeight,
  isCurrent,
  onTap,
  onRemove,
}: {
  screen: MultitaskingScreen;
  cardWidth: number;
  cardHeight: number;
  isCurrent: boolean;
  onTap: () => void;
  onRemove: () => void;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
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
            cardScale.setValue(1 - progress * 0.1);
            cardOpacity.setValue(1 - progress * 0.6);
          }
        },
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dy < -80 || gs.vy < -0.5) {
            // Fling up → remove
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
            // Snap back
            Animated.spring(translateY, {
              toValue: 0,
              tension: 80,
              friction: 10,
              useNativeDriver: true,
            }).start();
            Animated.spring(cardScale, {
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
    [translateY, cardScale, cardOpacity, onRemove],
  );

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        {
          width: cardWidth,
          transform: [{ translateY }, { scale: cardScale }],
          opacity: cardOpacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Label above the card */}
      <Text style={[styles.cardLabel, isCurrent && styles.cardLabelCurrent]} numberOfLines={1}>
        {screen.title}
      </Text>

      {/* Card surface */}
      <Pressable
        style={[styles.cardSurface, { height: cardHeight }]}
        onPress={onTap}
      >
        <View style={styles.cardPreview}>
          <View style={styles.cardIconCircle}>
            <IconSymbol name={screen.icon} size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.cardScreenTitle}>{screen.title}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Overlay ────────────────────────────────────────────────────────────────

export function MultitaskingOverlay() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { screens, removeScreen } = useMultitasking();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scrollRef = useRef<ScrollView>(null);

  const cardWidth = width * 0.68;
  const cardHeight = height * 0.55;
  const cardGap = 14;

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
        ]).start(() => {
          // Auto-scroll to the rightmost card (current screen)
          scrollRef.current?.scrollToEnd({ animated: false });
        });
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

  // Reverse so newest is on the RIGHT (iOS style)
  const orderedScreens = [...screens].reverse();

  return (
    <AnimatedPressable
      style={[styles.container, { opacity: fadeAnim }]}
      onPress={handleDismissToHome}
    >
      {/* Dark backdrop */}
      <View style={styles.backdrop} pointerEvents="none" />

      {/* Cards area — vertically centered */}
      <View style={[styles.cardArea, { paddingTop: insets.top + 40 }]} pointerEvents="box-none">
        {orderedScreens.length === 0 ? (
          <View style={styles.emptyState} pointerEvents="none">
            <IconSymbol name="rectangle.stack" size={48} color="#3F3F46" />
            <Text style={styles.emptyText}>No Recent Apps</Text>
          </View>
        ) : (
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            pointerEvents="box-none"
          >
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.cardList,
                { gap: cardGap, paddingHorizontal: (width - cardWidth) / 2 },
              ]}
              snapToInterval={cardWidth + cardGap}
              decelerationRate="fast"
              onContentSizeChange={() => {
                scrollRef.current?.scrollToEnd({ animated: false });
              }}
            >
              {orderedScreens.map((screen, idx) => (
                <AppCard
                  key={screen.id}
                  screen={screen}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  isCurrent={idx === orderedScreens.length - 1}
                  onTap={() => handleCardTap(screen)}
                  onRemove={() => handleRemove(screen.id)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </AnimatedPressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
  },
  cardList: {
    alignItems: 'center',
  },

  // Card
  cardWrap: {
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardLabelCurrent: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardSurface: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  cardIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardScreenTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#52525B',
  },

  // Empty
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
