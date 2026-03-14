/**
 * Profile — Personal Brand Home Grid
 *
 * Matches the Home screen layout exactly:
 *   VideoHero → "Personal Brand" pill → 3×3 icon grid
 *
 * Row 1: Agenda | Portfolio | Community
 * Row 2: Deals  | Support   | Social
 * Row 3: KayTV  | KayPay    | KayStudios
 */

import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { VideoHero } from '@/components/home/video-hero';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// =============================================================================
// GRID DEFINITION — locked 3×3
// =============================================================================

const ROWS = [
  [
    { id: 'agenda',    label: 'Agenda',     image: require('@/assets/images/icon-agenda.png') },
    { id: 'portfolio', label: 'Portfolio',  image: require('@/assets/images/icon-portfolio.png') },
    { id: 'community', label: 'Community',  image: require('@/assets/images/icon-community.png') },
  ],
  [
    { id: 'deals',     label: 'Deals',      image: require('@/assets/images/icon-deals.png') },
    { id: 'support',   label: 'Support',    image: require('@/assets/images/icon-support.png') },
    { id: 'social',    label: 'Social',     image: require('@/assets/images/icon-social.png') },
  ],
  [
    { id: 'media',     label: 'KayTV',      image: require('@/assets/images/icon-media.png') },
    { id: 'wallet',    label: 'KayPay',     image: require('@/assets/images/icon-wallet.png') },
    { id: 'gm',        label: 'KayStudios', image: require('@/assets/images/icon-gm.png') },
  ],
];

// =============================================================================
// TILE — identical to HomeGrid GridTile
// =============================================================================

function GridTile({
  item,
  cellWidth,
  accent,
  styles,
}: {
  item: (typeof ROWS)[0][0];
  cellWidth: number;
  accent: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scale, { toValue: 1.05, duration: 150, useNativeDriver: true }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`Profile tile pressed: ${item.label}`);
  }, [item.label]);

  return (
    <Pressable
      style={[styles.cell, { width: cellWidth }]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale }], shadowColor: accent, shadowOpacity: 0.0 },
        ]}
      >
        <Image source={item.image} style={styles.tileImage} />
      </Animated.View>
      <View style={styles.labelPill}>
        <Text style={styles.labelText} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
    </Pressable>
  );
}

// =============================================================================
// SCREEN
// =============================================================================

export default function ProfileScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const accent = useAccentColor();
  const { width: screenWidth } = useWindowDimensions();
  const cellWidth = screenWidth / 3;

  return (
    <View style={styles.container}>
      {/* Video hero — flush to top, bleeds under status bar */}
      <VideoHero />

      {/* Personal Brand pill */}
      <View style={styles.pillWrap}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Personal Brand</Text>
        </View>
      </View>

      {/* Icon grid fills remaining space */}
      <View style={styles.gridWrapper}>
        <View style={styles.grid}>
          {ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((tile) => (
                <GridTile
                  key={tile.id}
                  item={tile}
                  cellWidth={cellWidth}
                  accent={accent}
                  styles={styles}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={{ height: 50 }} />
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },

    // Pill
    pillWrap: {
      alignItems: 'center',
      paddingTop: 14,
      paddingBottom: 6,
    },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: '#F4F4F5',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    pillText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#52525B',
      textAlign: 'center',
    },

    // Grid — mirrors IconGrid exactly
    gridWrapper: {
      flex: 1,
      justifyContent: 'center',
    },
    grid: {
      flex: 1,
      justifyContent: 'space-evenly',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cell: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 18,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
    },
    tileImage: {
      width: 72,
      height: 72,
      resizeMode: 'contain',
    },
    labelPill: {
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: '#F4F4F5',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 58,
    },
    labelText: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      color: '#52525B',
    },
  });
