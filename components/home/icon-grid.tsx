/**
 * Home icon grid — 3×3 (9 icons).
 * All icons visible to ALL roles. No RBAC gating on visibility.
 * 3 columns always. Deep navy rounded-square backgrounds with white glyphs.
 * Wallet and Profile moved to universal footer bar.
 * Tap → scale 1.05 lift + soft glow, 150ms.
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, Alert, Image, StyleSheet, useWindowDimensions, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useMode } from '@/context/app-context';
import { useMultitasking } from '@/context/multitasking-context';
import type { GridIcon } from './home-types';

const C = {
  icon: '#FFFFFF',
  label: '#A1A1AA',
  badgeText: '#FFFFFF',
  tileBg: '#0B1220',
};

const ROWS: GridIcon[][] = [
  [
    { id: 'messages',   icon: 'bubble.left.and.bubble.right', label: 'Messages',   route: '/messages', image: require('@/assets/images/icon-messages.png') },
    { id: 'season',     icon: 'calendar',                     label: 'Season',     route: '/section?title=Season', image: require('@/assets/images/icon-season.png') },
    { id: 'roster',     icon: 'person.3.fill',                label: 'Roster',     route: '/section?title=Roster', image: require('@/assets/images/icon-roster.png') },
  ],
  [
    { id: 'media',      icon: 'play.rectangle.fill',          label: 'Media',      route: '/section?title=Media', image: require('@/assets/images/icon-media.png') },
    { id: 'social',     icon: 'newspaper.fill',               label: 'Social',     route: '/section?title=Social', image: require('@/assets/images/icon-social.png') },
    { id: 'store',      icon: 'bag.fill',                     label: 'Store',      route: '/section?title=Store', image: require('@/assets/images/icon-store.png') },
  ],
  [
    { id: 'wallet',     icon: 'creditcard.fill',              label: 'Wallet',     route: '/wallet', image: require('@/assets/images/icon-wallet.png') },
    { id: 'gm',         icon: 'gamecontroller.fill',          label: 'GM',         route: '/section?title=GM', image: require('@/assets/images/icon-gm.png') },
    { id: 'program',    icon: 'building.2.fill',              label: 'Program',    route: '/section?title=Program', image: require('@/assets/images/icon-program.png') },
  ],
];

/** Single grid tile with scale-up glow on press */
function GridTile({
  item,
  cellWidth,
  accent,
  onPress,
}: {
  item: GridIcon;
  cellWidth: number;
  accent: string;
  onPress: (item: GridIcon) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scale, {
      toValue: 1.05,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Pressable
      style={[styles.cell, { width: cellWidth }]}
      onPress={() => onPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          item.image && styles.iconContainerImage,
          {
            transform: [{ scale }],
            shadowColor: accent,
            shadowOpacity: 0.0,
          },
        ]}
      >
        {item.image ? (
          <Image source={item.image} style={styles.tileImage} />
        ) : (
          <IconSymbol name={item.icon} size={28} color={C.icon} />
        )}
        {item.badgeCount != null && item.badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{item.badgeCount}</Text>
          </View>
        )}
      </Animated.View>
      <Text style={styles.label} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export function IconGrid() {
  const accent = useAccentColor();
  const router = useRouter();
  const mode = useMode();
  const { width: screenWidth } = useWindowDimensions();
  const { addScreen } = useMultitasking();
  const cellWidth = screenWidth / 3;

  const handlePress = useCallback((item: GridIcon) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode !== 'sports') {
      Alert.alert('Coming Soon', 'This feature is not yet available.');
      return;
    }
    addScreen({
      id: item.id,
      route: item.route,
      title: item.label,
      icon: item.icon,
    });
    router.push(item.route as any);
  }, [mode, addScreen, router]);

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => (
            <GridTile
              key={item.id}
              item={item}
              cellWidth={cellWidth}
              accent={accent}
              onPress={handlePress}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: C.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Glow on press (shadow animates with scale)
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainerImage: {
    backgroundColor: 'transparent',
  },
  tileImage: {
    width: 56,
    height: 56,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.badgeText,
  },
  label: {
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
    color: C.label,
  },
});
