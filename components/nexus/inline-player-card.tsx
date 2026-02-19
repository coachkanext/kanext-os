/**
 * Inline Player Card — compact card rendered inside a Nexus chat message.
 * Shows: name, position, team, KR badge. Tap → openPlayerCard().
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getKRColor } from '@/utils/kr-display';
import { openPlayerCard } from '@/utils/global-entity-sheets';
import type { PlayerCardPayload } from '@/types/nexus-v2';

interface Props {
  data: PlayerCardPayload;
}

export function InlinePlayerCard({ data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const krColor = data.kr != null ? getKRColor(data.kr) : colors.textTertiary;

  const handlePress = () => {
    openPlayerCard({
      playerId: data.playerId,
      name: data.name,
      position: data.position,
      height: '',
      classYear: '',
      kr: data.kr ?? 0,
      school: data.team,
      levelKey: data.levelKey,
      archetype: data.archetype,
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={handlePress}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {data.name}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
            {data.position} · {data.team}
          </Text>
        </View>
        {data.kr != null && (
          <View style={[styles.krBadge, { backgroundColor: krColor }]}>
            <Text style={styles.krText}>{Math.round(data.kr)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
  },
  krBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  krText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },
});
