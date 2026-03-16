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
import { View, Text, StyleSheet, useWindowDimensions, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { useMultitasking } from '@/context/multitasking-context';
import type { Mode } from '@/types';
import type { GridIcon } from './home-types';

/** Row 2 labels shift per mode */
const MODE_LABELS: Record<string, Partial<Record<Mode, string>>> = {
  p4: { personal: 'Network', business: 'Team',  education: 'Students', sports: 'Roster',   community: 'Members'  },
  p5: { personal: 'Deals',   business: 'Leads', education: 'Admissions', sports: 'Recruits', community: 'Outreach' },
  p6: { personal: 'Earn',    business: 'Sales', education: 'Fund',     sports: 'Booster',  community: 'Give'     },
};

const ROWS: GridIcon[][] = [
  // Row 1 — universal
  [
    { id: 'agenda',  icon: 'calendar.badge.clock',  label: 'Agenda', route: '/agenda' },
    { id: 'hub',     icon: 'square.grid.2x2.fill',  label: 'Hub',    route: '/(tabs)/(main)/season' },
    { id: 'social',  icon: 'globe',                 label: 'Social', route: '/social' },
  ],
  // Row 2 — mode-dependent labels
  [
    { id: 'p4', icon: 'person.3.fill',   label: 'Roster',    route: '/(tabs)/(main)/roster' },
    { id: 'p5', icon: 'person.badge.plus', label: 'Recruits', route: '/(tabs)/(main)/recruits' },
    { id: 'p6', icon: 'bag.fill',        label: 'Booster',   route: '/(tabs)/(main)/store' },
  ],
  // Row 3 — universal
  [
    { id: 'media',  icon: 'play.rectangle.fill', label: 'KayTV',      route: '/(tabs)/(main)/kaytv' },
    { id: 'wallet', icon: 'creditcard.fill',     label: 'KayPay',     route: '/wallet' },
    { id: 'gm',     icon: 'gamecontroller.fill', label: 'KayStudios', route: '/studios' },
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
      <Animated.View style={{ transform: [{ scale }] }}>
        <IconSymbol name={item.icon} size={36} color={C.muted} />
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
    router.push(item.route as any);
  }, [addScreen, router]);

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => {
            const label = MODE_LABELS[item.id]?.[mode] ?? item.label;
            return (
              <GridTile
                key={item.id}
                item={{ ...item, label }}
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
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: C.label,
  },
});
