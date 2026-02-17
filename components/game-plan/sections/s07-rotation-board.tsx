/**
 * S07 — Rotation Board
 * Horizontal-scroll table: name/posGroup/offKR/defKR/archetype/threat/rule/minutes
 * Starter/bench divider. Foul fragility warning.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { RotationPlayer } from '../game-plan-types';

interface Props {
  players: RotationPlayer[];
  onLayout?: (y: number) => void;
}

export function S07RotationBoard({ players, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const starters = players.filter((p) => p.starter);
  const bench = players.filter((p) => !p.starter);

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.hCell, styles.nameCol, { color: colors.textTertiary }]}>PLAYER</ThemedText>
            <ThemedText style={[styles.hCell, styles.posCol, { color: colors.textTertiary }]}>POS</ThemedText>
            <ThemedText style={[styles.hCell, styles.krCol, { color: colors.textTertiary }]}>OFF</ThemedText>
            <ThemedText style={[styles.hCell, styles.krCol, { color: colors.textTertiary }]}>DEF</ThemedText>
            <ThemedText style={[styles.hCell, styles.archCol, { color: colors.textTertiary }]}>ARCHETYPE</ThemedText>
            <ThemedText style={[styles.hCell, styles.threatCol, { color: colors.textTertiary }]}>THREAT</ThemedText>
            <ThemedText style={[styles.hCell, styles.ruleCol, { color: colors.textTertiary }]}>RULE</ThemedText>
            <ThemedText style={[styles.hCell, styles.minCol, { color: colors.textTertiary }]}>MIN</ThemedText>
          </View>

          {/* Starters */}
          {starters.map((p) => (
            <PlayerRow key={p.jersey} player={p} colors={colors} />
          ))}

          {/* Divider */}
          <View style={[styles.divider, { borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.dividerText, { color: colors.textTertiary }]}>BENCH</ThemedText>
          </View>

          {/* Bench */}
          {bench.map((p) => (
            <PlayerRow key={p.jersey} player={p} colors={colors} />
          ))}
        </View>
      </ScrollView>

      {/* Foul Fragility Warning */}
      {players.some((p) => p.foulFragile) && (
        <View style={[styles.warningCard, { backgroundColor: Brand.warning + '10', borderColor: Brand.warning + '30' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={14} color={Brand.warning} />
          <ThemedText style={[styles.warningText, { color: Brand.warning }]}>
            Foul fragile: {players.filter((p) => p.foulFragile).map((p) => `#${p.jersey} ${p.name.split(' ').pop()}`).join(', ')}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

function PlayerRow({ player, colors }: { player: RotationPlayer; colors: typeof Colors.light }) {
  return (
    <View style={styles.row}>
      <View style={styles.nameCol}>
        <ThemedText style={[styles.jersey, { color: colors.textTertiary }]}>#{player.jersey}</ThemedText>
        <ThemedText style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
          {player.name.split(' ').pop()}
        </ThemedText>
        {player.foulFragile && (
          <IconSymbol name="exclamationmark.triangle.fill" size={10} color={Brand.warning} />
        )}
      </View>
      <ThemedText style={[styles.cell, styles.posCol, { color: colors.textSecondary }]}>{player.posGroup}</ThemedText>
      <ThemedText style={[styles.cell, styles.krCol, { color: Brand.precision, fontWeight: '700' }]}>{player.offKR}</ThemedText>
      <ThemedText style={[styles.cell, styles.krCol, { color: Brand.success, fontWeight: '700' }]}>{player.defKR}</ThemedText>
      <ThemedText style={[styles.cell, styles.archCol, { color: colors.textSecondary }]} numberOfLines={1}>{player.archetype}</ThemedText>
      <ThemedText style={[styles.cell, styles.threatCol, { color: colors.textSecondary }]} numberOfLines={1}>{player.threat}</ThemedText>
      <ThemedText style={[styles.cell, styles.ruleCol, { color: colors.textSecondary }]} numberOfLines={1}>{player.rule}</ThemedText>
      <ThemedText style={[styles.cell, styles.minCol, { color: colors.text, fontWeight: '600' }]}>{player.minutes}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
  },
  hCell: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
  },
  cell: { fontSize: 12 },
  nameCol: { width: 110, flexDirection: 'row', alignItems: 'center', gap: 3 },
  posCol: { width: 36, textAlign: 'center' },
  krCol: { width: 36, textAlign: 'center' },
  archCol: { width: 110 },
  threatCol: { width: 130 },
  ruleCol: { width: 140 },
  minCol: { width: 36, textAlign: 'center' },
  jersey: { fontSize: 11, fontWeight: '600' },
  playerName: { fontSize: 12, fontWeight: '500' },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
  },
  dividerText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  warningText: { flex: 1, fontSize: 12, fontWeight: '600' },
});
