/**
 * S02 — Opp Offense → Our D
 * OSIE card, shot diet bars, pressure points, defensive counters, if-then cards, matchup overlays
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { OppOffenseData } from '../game-plan-types';

interface Props {
  data: OppOffenseData;
  onLayout?: (y: number) => void;
}

export function S02OppOffense({ data, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expandedIfThen, setExpandedIfThen] = useState<number | null>(null);
  const [showOverlays, setShowOverlays] = useState(false);

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {/* OSIE Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>OFFENSIVE IDENTITY</ThemedText>
        <View style={styles.osieRow}>
          <View style={styles.osieItem}>
            <ThemedText style={[styles.osieLabel, { color: colors.textTertiary }]}>System</ThemedText>
            <ThemedText style={[styles.osieValue, { color: Brand.precision }]}>{data.osie.system}</ThemedText>
          </View>
          <View style={styles.osieItem}>
            <ThemedText style={[styles.osieLabel, { color: colors.textTertiary }]}>Pace</ThemedText>
            <ThemedText style={styles.osieValue}>{data.osie.pace}</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.osieLabel, { color: colors.textTertiary, marginTop: 6 }]}>Initiators</ThemedText>
        <ThemedText style={styles.osieValue}>{data.osie.initiators.join(', ')}</ThemedText>
      </View>

      {/* Shot Diet */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>SHOT DIET</ThemedText>
        {data.shotDiet.map((entry, i) => (
          <View key={i} style={styles.dietRow}>
            <ThemedText style={[styles.dietZone, { color: colors.text }]}>{entry.zone}</ThemedText>
            <View style={styles.dietBarWrap}>
              <View style={[styles.dietBar, { width: `${entry.freqPct}%`, backgroundColor: Brand.precision + '60' }]} />
            </View>
            <ThemedText style={[styles.dietPct, { color: colors.textSecondary }]}>{entry.freqPct}%</ThemedText>
            <ThemedText style={[styles.dietFg, { color: colors.textTertiary }]}>{entry.fgPct}% FG</ThemedText>
          </View>
        ))}
      </View>

      {/* Pressure Points */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>PRESSURE POINTS</ThemedText>
        {data.pressurePoints.map((p, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bulletDot, { backgroundColor: Brand.error }]} />
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{p}</ThemedText>
          </View>
        ))}
      </View>

      {/* Defensive Counters */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>OUR DEFENSIVE COUNTERS</ThemedText>
        {data.defensiveCounters.map((c, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bulletDot, { backgroundColor: Brand.success }]} />
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{c}</ThemedText>
          </View>
        ))}
      </View>

      {/* If-Then Cards */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.textSecondary }]}>IF → THEN</ThemedText>
        {data.ifThen.map((card, i) => (
          <Pressable
            key={i}
            style={[styles.ifThenCard, { backgroundColor: colors.backgroundTertiary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedIfThen(expandedIfThen === i ? null : i);
            }}
          >
            <View style={styles.ifThenHeader}>
              <ThemedText style={[styles.ifLabel, { color: Brand.warning }]}>IF</ThemedText>
              <ThemedText style={[styles.ifText, { color: colors.text }]} numberOfLines={expandedIfThen === i ? undefined : 1}>
                {card.ifCondition}
              </ThemedText>
              <IconSymbol
                name={expandedIfThen === i ? 'chevron.down' : 'chevron.right'}
                size={12}
                color={colors.textTertiary}
              />
            </View>
            {expandedIfThen === i && (
              <View style={styles.thenRow}>
                <ThemedText style={[styles.ifLabel, { color: Brand.success }]}>THEN</ThemedText>
                <ThemedText style={[styles.ifText, { color: colors.text }]}>{card.thenResponse}</ThemedText>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Matchup Overlays */}
      <Pressable
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowOverlays(!showOverlays);
        }}
      >
        <View style={styles.expandHeader}>
          <ThemedText style={[styles.cardTitle, { color: colors.textSecondary, marginBottom: 0 }]}>
            MATCHUP OVERLAYS ({data.matchupOverlays.length})
          </ThemedText>
          <IconSymbol name={showOverlays ? 'chevron.down' : 'chevron.right'} size={12} color={colors.textTertiary} />
        </View>
        {showOverlays && data.matchupOverlays.map((m, i) => (
          <View key={i} style={[styles.overlayRow, { borderTopColor: colors.border }]}>
            <View style={styles.overlayPlayers}>
              <ThemedText style={[styles.overlayOur, { color: Brand.precision }]}>{m.ourPlayer}</ThemedText>
              <ThemedText style={[styles.overlayVs, { color: colors.textTertiary }]}>→</ThemedText>
              <ThemedText style={[styles.overlayTheir, { color: Brand.error }]}>{m.theirPlayer}</ThemedText>
            </View>
            <ThemedText style={[styles.overlayNote, { color: colors.textSecondary }]}>{m.note}</ThemedText>
          </View>
        ))}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  osieRow: { flexDirection: 'row', gap: Spacing.lg },
  osieItem: { flex: 1 },
  osieLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  osieValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  dietRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 6 },
  dietZone: { fontSize: 12, width: 90 },
  dietBarWrap: { flex: 1, height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden' },
  dietBar: { height: '100%', borderRadius: 4 },
  dietPct: { fontSize: 12, width: 32, textAlign: 'right', fontWeight: '600' },
  dietFg: { fontSize: 11, width: 50, textAlign: 'right' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, marginRight: 10 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  ifThenCard: { borderRadius: BorderRadius.md, padding: Spacing.sm + 2, marginBottom: 6 },
  ifThenHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ifLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, width: 36 },
  ifText: { flex: 1, fontSize: 13, lineHeight: 18 },
  thenRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  expandHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overlayRow: { paddingTop: Spacing.sm, marginTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  overlayPlayers: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overlayOur: { fontSize: 13, fontWeight: '600' },
  overlayVs: { fontSize: 12 },
  overlayTheir: { fontSize: 13, fontWeight: '600' },
  overlayNote: { fontSize: 12, marginTop: 2, lineHeight: 16 },
});
