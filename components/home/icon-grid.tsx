/**
 * Home icon grid — 3×3 (9 icons).
 * Messages, Phone, Organization in universal footer bar.
 * All icons visible to ALL roles. No RBAC gating on visibility.
 * 3 columns always. Deep navy rounded-square backgrounds with white glyphs.
 * Positions 2, 3, 6 shift per mode; rest universal.
 * Tap → scale 1.05 lift + soft glow, 150ms.
 * Media in grid position 9 (bottom right). Profile in settings side panel.
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { useMultitasking } from '@/context/multitasking-context';
import type { Mode } from '@/types';
import type { GridIcon } from './home-types';

/** Mode-dependent labels for icons that change per mode (positions 2, 3, 6) */
const MODE_LABELS: Record<string, Partial<Record<Mode, string>>> = {
  roster:  { sports: 'Roster', business: 'Departments', church: 'Ministries', education: 'Community', competition: 'Network' },
  recruits:{ sports: 'Prospects', business: 'Leads',   church: 'Outreach',  education: 'Admissions' },
  store:   { sports: 'Booster',   business: 'Impact',  church: 'Give',      education: 'Fund' },
};

/** Mode-dependent images for icons that swap per mode */
const MODE_IMAGES: Record<string, Partial<Record<Mode, any>>> = {
  roster: {
    sports:      require('@/assets/images/icon-roster-v2.png'),
    business:    require('@/assets/images/icon-departments-v2.png'),
    church:      require('@/assets/images/icon-ministries-v2.png'),
    education:   require('@/assets/images/icon-community-v2.png'),
    competition: require('@/assets/images/icon-network-v2.png'),
  },
  recruits: {
    business: require('@/assets/images/icon-leads.png'),
    church: require('@/assets/images/icon-outreach.png'),
    education: require('@/assets/images/icon-admissions.png'),
  },
  store: {
    sports: require('@/assets/images/icon-booster.png'),
    business: require('@/assets/images/icon-sponsor.png'),
    church: require('@/assets/images/icon-give.png'),
    education: require('@/assets/images/icon-fund.png'),
  },
};

const ROWS: GridIcon[][] = [
  [
    { id: 'agenda',   icon: 'calendar.badge.clock', label: 'Agenda',   route: '/agenda',   image: require('@/assets/images/icon-agenda.png') },
    { id: 'season',   icon: 'calendar',             label: 'Hub',      route: '/(tabs)/(main)/season',   image: require('@/assets/images/icon-hub.png') },
    { id: 'roster',   icon: 'person.3.fill',        label: 'Roster',   route: '/(tabs)/(main)/roster',   image: require('@/assets/images/icon-roster-v2.png') },
  ],
  [
    { id: 'recruits', icon: 'person.badge.plus',    label: 'Prospects', route: '/(tabs)/(main)/recruits', image: require('@/assets/images/icon-recruits.png') },
    { id: 'store',    icon: 'bag.fill',             label: 'Booster',  route: '/(tabs)/(main)/store',    image: require('@/assets/images/icon-booster.png') },
    { id: 'social',   icon: 'newspaper.fill',       label: 'Social',   route: '/social',                 image: require('@/assets/images/icon-social.png') },
  ],
  [
    { id: 'media',    icon: 'play.rectangle.fill',  label: 'KayTV',    route: '/(tabs)/(main)/kaytv',    image: require('@/assets/images/icon-media.png') },
    { id: 'wallet',   icon: 'creditcard.fill',      label: 'KayPay',   route: '/wallet',                 image: require('@/assets/images/icon-wallet.png') },
    { id: 'gm',       icon: 'gamecontroller.fill',  label: 'KayStudios',    route: '/studios',                image: require('@/assets/images/icon-gm.png') },
  ],
];

/** Personal Brand grid — shown when mode = pulse */
const PULSE_ROWS: GridIcon[][] = [
  [
    { id: 'agenda',    icon: 'calendar.badge.clock',    label: 'Agenda',     route: '/agenda',                 image: require('@/assets/images/icon-agenda.png') },
    { id: 'portfolio', icon: 'person.text.rectangle',   label: 'Hub',        route: '/(tabs)/(main)/profile',  image: require('@/assets/images/icon-hub.png') },
    { id: 'community', icon: 'person.3.fill',           label: 'Community',  route: '/community',              image: require('@/assets/images/icon-community.png') },
  ],
  [
    { id: 'deals',   icon: 'dollarsign.circle.fill',   label: 'Deals',    route: '/deals',   image: require('@/assets/images/icon-deals.png') },
    { id: 'support', icon: 'questionmark.circle.fill', label: 'Support',  route: '/support', image: require('@/assets/images/icon-support.png') },
    { id: 'social',  icon: 'newspaper.fill',           label: 'Social',   route: '/social',  image: require('@/assets/images/icon-social.png') },
  ],
  [
    { id: 'media',  icon: 'play.rectangle.fill', label: 'KayTV',      route: '/(tabs)/(main)/kaytv', image: require('@/assets/images/icon-media.png') },
    { id: 'wallet', icon: 'creditcard.fill',     label: 'KayPay',     route: '/wallet',              image: require('@/assets/images/icon-wallet.png') },
    { id: 'gm',     icon: 'gamecontroller.fill', label: 'KayStudios', route: '/studios',             image: require('@/assets/images/icon-gm.png') },
  ],
];

/** Single grid tile with scale-up glow on press */
function GridTile({
  item,
  cellWidth,
  accent,
  onPress,
  onLongPress,
  styles,
}: {
  item: GridIcon;
  cellWidth: number;
  accent: string;
  onPress: (item: GridIcon) => void;
  onLongPress?: (item: GridIcon) => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  const C = useColors();
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
          <IconSymbol name={item.icon} size={36} color="#FFFFFF" />
        )}
        {item.badgeCount != null && item.badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{item.badgeCount}</Text>
          </View>
        )}
      </Animated.View>
      <View style={styles.labelPill}>
        <Text style={styles.labelText} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
    </Pressable>
  );
}

export function IconGrid() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
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

  const activeRows = mode === 'pulse' ? PULSE_ROWS : ROWS;

  return (
    <View style={styles.container}>
      {activeRows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => {
            const label = mode === 'pulse' ? item.label : (MODE_LABELS[item.id]?.[mode] ?? item.label);
            const image = mode === 'pulse' ? item.image : (MODE_IMAGES[item.id]?.[mode] ?? item.image);
            return (
              <GridTile
                key={item.id}
                item={{ ...item, label, image }}
                cellWidth={cellWidth}
                accent={accent}
                onPress={handlePress}
                styles={styles}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    backgroundColor: C.bg,
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
    width: 94,
    height: 94,
    borderRadius: 22,
    backgroundColor: '#0B1220',
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
    width: 94,
    height: 94,
    resizeMode: 'contain',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  labelPill: {
    marginTop: 7,
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
