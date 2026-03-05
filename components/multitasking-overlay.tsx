/**
 * Multitasking Overlay
 * Full-screen overlay with horizontal card row of open screens.
 * Triggered by swipe-up on Nexus semi-circle.
 * Tap card → navigate to that screen. Swipe card up → remove it.
 * Tap backdrop → close overlay → return to Home.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMultitasking, type MultitaskingScreen } from '@/context/multitasking-context';
import { registerMultitaskingHandlers } from '@/utils/global-multitasking';

const CARD_WIDTH = 140;
const CARD_HEIGHT = 200;

function MultitaskingCard({
  screen,
  onTap,
  onRemove,
}: {
  screen: MultitaskingScreen;
  onTap: () => void;
  onRemove: () => void;
}) {
  const panY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handleSwipeUp = () => {
    Animated.parallel([
      Animated.timing(panY, { toValue: -300, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRemove();
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateY: panY },
            { rotateY: '-3deg' },
            { perspective: 1000 },
          ],
          opacity,
        },
      ]}
    >
      <Pressable
        style={styles.cardInner}
        onPress={onTap}
        onLongPress={handleSwipeUp}
      >
        <View style={styles.cardIconCircle}>
          <IconSymbol name={screen.icon} size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {screen.title}
        </Text>
        <Pressable
          style={styles.closeButton}
          onPress={(e) => {
            e.stopPropagation?.();
            handleSwipeUp();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol name="xmark.circle.fill" size={20} color="#52525B" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export function MultitaskingOverlay() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { screens, removeScreen } = useMultitasking();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    registerMultitaskingHandlers(
      () => {
        setVisible(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      },
      () => dismiss(),
    );
  }, []);

  const dismiss = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setVisible(false);
    });
  }, [fadeAnim]);

  const handleCardTap = useCallback((screen: MultitaskingScreen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismiss();
    router.push(screen.route as any);
  }, [dismiss, router]);

  const handleRemove = useCallback((id: string) => {
    removeScreen(id);
  }, [removeScreen]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Pressable style={styles.backdrop} onPress={dismiss} />

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.heading}>Open Screens</Text>

        {screens.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="rectangle.stack" size={40} color="#52525B" />
            <Text style={styles.emptyText}>No open screens</Text>
            <Text style={styles.emptySubtext}>
              Tap icons on the Home grid to open screens
            </Text>
          </View>
        ) : (
          <FlatList
            data={screens}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MultitaskingCard
                screen={item}
                onTap={() => handleCardTap(item)}
                onRemove={() => handleRemove(item.id)}
              />
            )}
          />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#0B0F14',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#A1A1AA',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#52525B',
    textAlign: 'center',
    marginTop: 6,
  },
});
