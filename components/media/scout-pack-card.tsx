/**
 * Scout Pack Card — scout pack cover with opponent name and clip count.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/theme';
import type { ScoutPack } from '@/data/mock-video';

interface ScoutPackCardProps {
  pack: ScoutPack;
  onPress: () => void;
}

export function ScoutPackCard({ pack, onPress }: ScoutPackCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={handlePress}
    >
      <View style={[styles.cover, { backgroundColor: pack.coverColor }]}>
        <IconSymbol name="binoculars.fill" size={24} color="rgba(255,255,255,0.4)" />
        <ThemedText style={styles.opponent}>{pack.opponent}</ThemedText>
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.date}>{pack.date}</ThemedText>
        <ThemedText style={styles.clips}>{pack.clipCount} clips</ThemedText>
      </View>
      {pack.tags.includes('Next Game') && (
        <View style={styles.nextBadge}>
          <ThemedText style={styles.nextText}>Next</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#111',
    marginRight: Spacing.sm,
  },
  cover: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  opponent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    padding: Spacing.sm,
  },
  date: {
    fontSize: 12,
    color: '#9C9790',
    marginBottom: 2,
  },
  clips: {
    fontSize: 11,
    color: '#555',
  },
  nextBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A8A6E',
  },
});
