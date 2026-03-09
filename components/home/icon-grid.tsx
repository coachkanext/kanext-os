/**
 * Home icon grid — 3×3 (9 icons).
 * Messages, Phone, Organization in universal footer bar.
 * All icons visible to ALL roles. No RBAC gating on visibility.
 * 3 columns always. Deep navy rounded-square backgrounds with white glyphs.
 * Positions 2, 3, 6 shift per mode; rest universal.
 * Tap → scale 1.05 lift + soft glow, 150ms.
 * Media in grid position 9 (bottom right). Profile in settings side panel.
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useMode } from '@/context/app-context';
import { useMultitasking } from '@/context/multitasking-context';
import type { Mode } from '@/types';
import type { GridIcon } from './home-types';

const C = {
  icon: '#FFFFFF',
  label: '#A1A1AA',
  badgeText: '#FFFFFF',
  tileBg: '#0B1220',
};

/** Mode-dependent labels for icons that change per mode (positions 2, 3, 6) */
const MODE_LABELS: Record<string, Partial<Record<Mode, string>>> = {
  season:  { sports: 'Season',    business: 'Office',  church: 'Parish',    education: 'Campus' },
  roster:  { sports: 'Roster',    business: 'Team',    church: 'Ministries', education: 'Community' },
  recruits:{ sports: 'Prospects', business: 'Leads',   church: 'Outreach',  education: 'Admissions' },
  store:   { sports: 'Store',     business: 'Store',   church: 'Give',      education: 'Store' },
};

/** Mode-dependent images for icons that swap per mode */
const MODE_IMAGES: Record<string, Partial<Record<Mode, any>>> = {
  season: {
    church: require('@/assets/images/icon-parish.png'),
    business: require('@/assets/images/icon-office.png'),
    education: require('@/assets/images/icon-campus.png'),
  },
  roster: {
    sports: require('@/assets/images/icon-team-sports.png'),
    business: require('@/assets/images/icon-team-sports.png'),
    church: require('@/assets/images/icon-ministries.png'),
    education: require('@/assets/images/icon-community.png'),
  },
  recruits: {
    church: require('@/assets/images/icon-outreach.png'),
    education: require('@/assets/images/icon-admissions.png'),
  },
  store: {
    church: require('@/assets/images/icon-give.png'),
  },
};

const ROWS: GridIcon[][] = [
  [
    { id: 'agenda',   icon: 'calendar.badge.clock', label: 'Agenda',   route: '/agenda',   image: require('@/assets/images/icon-agenda.png') },
    { id: 'season',   icon: 'calendar',             label: 'Season',   route: '/(tabs)/(main)/season',   image: require('@/assets/images/icon-season.png') },
    { id: 'roster',   icon: 'person.3.fill',        label: 'Team',     route: '/(tabs)/(main)/roster',   image: require('@/assets/images/icon-team.png') },
  ],
  [
    { id: 'recruits', icon: 'person.badge.plus',    label: 'Recruits', route: '/section?title=Recruits', image: require('@/assets/images/icon-recruits.png') },
    { id: 'social',   icon: 'newspaper.fill',       label: 'Social',   route: '/social',                 image: require('@/assets/images/icon-social.png') },
    { id: 'store',    icon: 'bag.fill',             label: 'Store',    route: '/section?title=Store',    image: require('@/assets/images/icon-store.png') },
  ],
  [
    { id: 'gm',       icon: 'gamecontroller.fill',  label: 'KayGM',    route: '/section?title=GM',       image: require('@/assets/images/icon-gm.png') },
    { id: 'wallet',   icon: 'creditcard.fill',      label: 'KayPay',   route: '/wallet',                 image: require('@/assets/images/icon-wallet.png') },
    { id: 'media',    icon: 'play.rectangle.fill',  label: 'KayTV',    route: '/media',                  image: require('@/assets/images/icon-media.png') },
  ],
];

/** Single grid tile with scale-up glow on press */
function GridTile({
  item,
  cellWidth,
  accent,
  onPress,
  onLongPress,
}: {
  item: GridIcon;
  cellWidth: number;
  accent: string;
  onPress: (item: GridIcon) => void;
  onLongPress?: (item: GridIcon) => void;
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
      onLongPress={onLongPress ? () => onLongPress(item) : undefined}
      delayLongPress={400}
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
    addScreen({
      id: item.id,
      route: item.route,
      title: item.label,
      icon: item.icon,
    });
    router.navigate(item.route as any);
  }, [addScreen, router]);

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => {
            const label = MODE_LABELS[item.id]?.[mode] ?? item.label;
            const image = MODE_IMAGES[item.id]?.[mode] ?? item.image;
            return (
              <GridTile
                key={item.id}
                item={{ ...item, label, image }}
                cellWidth={cellWidth}
                accent={accent}
                onPress={handlePress}
              />
            );
          })}
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
    backgroundColor: '#000000',
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
