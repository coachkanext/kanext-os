/**
 * Home icon grid — 3×3 (9 icons).
 * Flat + clean: white squircle tiles with subtle border, no shadows.
 * Icons monochrome black. Blue badge dots only (interactive indicator).
 * Dark mode: #111111 tiles with faint border glow.
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { useMultitasking } from '@/context/multitasking-context';
import type { Mode } from '@/types';
import type { GridIcon } from './home-types';


/** Route overrides per mode */
const MODE_ROUTES: Record<string, Partial<Record<string, string>>> = {
  hub: { personal: '/(tabs)/(main)/hub', community: '/(tabs)/(main)/hub/community', education: '/(tabs)/(main)/hub/education', sports: '/(tabs)/(main)/hub', business: '/(tabs)/(main)/hub/business' },
  p4:  { personal: '/(tabs)/(main)/network', community: '/(tabs)/(main)/members', education: '/(tabs)/(main)/hub/campus', business: '/(tabs)/(main)/team' },
  p5:  { personal: '/(tabs)/(main)/deals', community: '/(tabs)/(main)/outreach', education: '/(tabs)/(main)/admissions', business: '/(tabs)/(main)/inquiries' },
  p6:  { personal: '/(tabs)/(main)/store', community: '/(tabs)/(main)/give', education: '/(tabs)/(main)/fund', sports: '/(tabs)/(main)/booster', business: '/(tabs)/(main)/business-store' },
};

/** Row 2 labels shift per mode */
const MODE_LABELS: Record<string, Partial<Record<Mode, string>>> = {
  p4: { personal: 'Community', business: 'Team',     education: 'Campus',     sports: 'Roster',   community: 'Members'  },
  p5: { personal: 'Deals',   business: 'Inquiries', education: 'Admissions', sports: 'Recruits', community: 'Outreach' },
  p6: { personal: 'Store',   business: 'Store',    education: 'Fund',       sports: 'Booster',  community: 'Give'     },
};

/** Row 2 icons shift per mode to match labels */
const MODE_ICONS: Record<string, Partial<Record<Mode, string>>> = {
  p4: { personal: 'person.3.fill', business: 'person.2.fill', education: 'building.fill', sports: 'person.3.fill', community: 'person.2.fill' },
  p5: { personal: 'tag.fill',      business: 'envelope.fill', education: 'doc.text.fill', sports: 'person.badge.plus', community: 'megaphone.fill' },
  p6: { personal: 'bag.fill',               business: 'storefront.fill', education: 'dollarsign.circle.fill', sports: 'bag.fill', community: 'heart.fill' },
};


const ROWS: GridIcon[][] = [
  // Row 1 — universal
  [
    { id: 'hub',    icon: 'square.grid.2x2.fill', label: 'Hub',    route: '/(tabs)/(main)/season' },
    { id: 'agenda', icon: 'calendar.badge.clock', label: 'Agenda', route: '/agenda'               },
    { id: 'social', icon: 'globe',                label: 'Social', route: '/social'               },
  ],
  // Row 2 — mode-dependent labels
  [
    { id: 'p4', icon: 'person.3.fill',   label: 'Roster',    route: '/(tabs)/(main)/roster' },
    { id: 'p5', icon: 'person.badge.plus', label: 'Recruits', route: '/(tabs)/(main)/recruits' },
    { id: 'p6', icon: 'bag.fill',        label: 'Booster',   route: '/(tabs)/(main)/store' },
  ],
  // Row 3 — universal
  [
    { id: 'media',  icon: 'play.rectangle.fill', label: 'KTV',   route: '/(tabs)/(main)/kaytv'  },
    { id: 'gm',     icon: 'gamecontroller.fill', label: 'KPlay', route: '/studios'               },
    { id: 'wallet', icon: 'creditcard.fill',     label: 'KPay',  route: '/(tabs)/(main)/kaypay' },
  ],
];

/** Single grid tile with scale-up glow on press */
function GridTile({
  item,
  accent,
  onPress,
  onLongPress,
  styles,
}: {
  item: GridIcon;
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
      style={styles.cell}
      onPress={() => onPress(item)}
      onLongPress={onLongPress ? () => onLongPress(item) : undefined}
      delayLongPress={400}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.tileWrap, { transform: [{ scale }] }]}>
        <IconSymbol name={item.icon} size={36} color={C.label} />
        {item.badgeCount != null && item.badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{item.badgeCount}</Text>
          </View>
        )}
      </Animated.View>
      <Text style={styles.labelText} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export function IconGrid() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const accent = useAccentColor();
  const router = useRouter();
  const mode = useMode();
  const { addScreen } = useMultitasking();

  const handlePress = useCallback((item: GridIcon) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const route = MODE_ROUTES[item.id]?.[mode] ?? item.route;
    addScreen({
      id: item.id,
      route,
      title: item.label,
      icon: item.icon,
    });
    router.push(route as any);
  }, [addScreen, router, mode]);

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => {
            const label = MODE_LABELS[item.id]?.[mode] ?? item.label;
            const icon  = MODE_ICONS[item.id]?.[mode] ?? item.icon;
            return (
              <GridTile
                key={item.id}
                item={{ ...item, label, icon }}
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
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  tileWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
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
    color: '#FFFFFF',
  },
  labelText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: C.label,
  },
});
