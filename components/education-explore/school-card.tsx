/**
 * SchoolCard — School tile with logo initials, name, location, type badges.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, BorderRadius } from '@/constants/theme';

interface SchoolCardProps {
  initials: string;
  name: string;
  location: string;
  type: string;
  badges: string[];
  thumbnailColor: string;
  colors: typeof Colors.light;
}

export function SchoolCard({ initials, name, location, type, badges, thumbnailColor, colors }: SchoolCardProps) {
  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.avatar, { backgroundColor: thumbnailColor }]}>
        <ThemedText style={styles.initials}>{initials}</ThemedText>
      </View>
      <ThemedText style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</ThemedText>
      <ThemedText style={[styles.location, { color: colors.textTertiary }]} numberOfLines={1}>{location}</ThemedText>
      <View style={styles.badgeRow}>
        {badges.map((badge, i) => (
          <View key={i} style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.badgeText, { color: colors.textSecondary }]}>{badge}</ThemedText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  location: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
