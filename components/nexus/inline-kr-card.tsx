/**
 * Inline KR Card — compact KR score + archetype + cluster bars inside a Nexus message.
 * Tap → openPlayerCard().
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getKRColor,
  getKRTierLabel,
  getKRBandLabel,
  getArchetypeDisplay,
  CLUSTER_ORDER,
  CLUSTER_LABELS,
} from '@/utils/kr-display';
import { openPlayerCard } from '@/utils/global-entity-sheets';
import type { KRCardPayload } from '@/types/nexus-v2';

interface Props {
  data: KRCardPayload;
}

export function InlineKRCard({ data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const krColor = getKRColor(data.kr);
  const tierLabel = data.levelKey
    ? getKRTierLabel(data.kr, data.levelKey)
    : getKRBandLabel(data.kr);
  const archDisplay = data.archetype ? getArchetypeDisplay(data.archetype) : null;

  const handlePress = () => {
    openPlayerCard({
      playerId: data.playerId,
      name: data.name,
      position: '',
      height: '',
      classYear: '',
      kr: data.kr,
      levelKey: data.levelKey,
      archetype: data.archetype,
      clusters: data.clusters,
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: krColor + '10', borderColor: krColor + '40', opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={handlePress}
    >
      {/* Header: KR badge + name + tier */}
      <View style={styles.headerRow}>
        <View style={[styles.krBadge, { backgroundColor: krColor }]}>
          <Text style={styles.krNumber}>{Math.round(data.kr)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {data.name}
          </Text>
          <Text style={[styles.tier, { color: krColor }]}>{tierLabel}</Text>
        </View>
      </View>

      {/* Archetype */}
      {archDisplay && (
        <Text style={[styles.archetype, { color: colors.textSecondary }]}>{archDisplay}</Text>
      )}

      {/* Cluster bars */}
      {data.clusters && (
        <View style={styles.clusters}>
          {CLUSTER_ORDER.map((key) => {
            const score = data.clusters![key] ?? 50;
            const clColor = getKRColor(score);
            const label = CLUSTER_LABELS[key]?.label ?? key;
            const pct = Math.min(100, Math.max(0, score));
            return (
              <View key={key} style={styles.clusterRow}>
                <Text style={[styles.clusterLabel, { color: colors.textSecondary }]}>{label}</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: clColor }]} />
                  </View>
                </View>
                <Text style={[styles.clusterScore, { color: clColor }]}>{score}</Text>
              </View>
            );
          })}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginVertical: 4,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  krBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  krNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  tier: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  archetype: {
    fontSize: 12,
    fontWeight: '600',
  },
  clusters: {
    gap: 3,
    marginTop: 2,
  },
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 18,
  },
  clusterLabel: {
    width: 65,
    fontSize: 10,
    fontWeight: '600',
  },
  barContainer: {
    flex: 1,
  },
  barBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  clusterScore: {
    width: 22,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'right',
  },
});
