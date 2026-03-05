/**
 * Home icon grid — 3x3, iPhone home screen style.
 * All 9 icons visible to ALL roles. No RBAC gating on visibility.
 * 3 columns always. Icons fill available space evenly.
 * White icons, gray labels, accent badges only.
 */

import React from 'react';
import { View, Pressable, Text, StyleSheet, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import type { GridIcon } from './home-types';

// Always-dark palette
const C = {
  icon: '#FFFFFF',
  label: '#A1A1AA',
  badgeText: '#FFFFFF',
};

/**
 * 3x3 grid — same for ALL roles:
 *   Calendar    Messages    Roster
 *   Recruiting  Media       Feed
 *   Store       Program     Profile
 */
const ROWS: GridIcon[][] = [
  [
    { id: 'calendar',   icon: 'calendar',                     label: 'Calendar',   route: '/section?title=Calendar' },
    { id: 'messages',   icon: 'bubble.left.and.bubble.right', label: 'Messages',   route: '/section?title=Messages' },
    { id: 'roster',     icon: 'person.3.fill',                label: 'Roster',     route: '/section?title=Roster' },
  ],
  [
    { id: 'recruiting', icon: 'person.badge.plus',            label: 'Recruiting', route: '/section?title=Recruiting' },
    { id: 'media',      icon: 'play.rectangle.fill',          label: 'Media',      route: '/section?title=Media' },
    { id: 'feed',       icon: 'newspaper.fill',               label: 'Feed',       route: '/section?title=Feed' },
  ],
  [
    { id: 'store',      icon: 'bag.fill',                     label: 'Store',      route: '/section?title=Store' },
    { id: 'program',    icon: 'building.2.fill',              label: 'Program',    route: '/section?title=Program' },
    { id: 'profile',    icon: 'person.circle',                label: 'Profile',    route: '/section?title=Profile' },
  ],
];

export function IconGrid() {
  const accent = useAccentColor();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cellWidth = screenWidth / 3;

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.cell, { width: cellWidth }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
            >
              <View style={styles.iconContainer}>
                <IconSymbol name={item.icon} size={32} color={C.icon} />
                {item.badgeCount != null && item.badgeCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: accent }]}>
                    <Text style={styles.badgeText}>{item.badgeCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
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
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 6,
    textAlign: 'center',
    color: C.label,
  },
});
