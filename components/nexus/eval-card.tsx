/**
 * Eval Card Component
 * Compact player evaluation result card for inline display in chat.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { EvalSnapshot } from '@/types';

const EVAL_COLOR = '#ffffff';

interface EvalCardProps {
  evalSnapshot: EvalSnapshot;
  onViewFull?: (evalSnapshot: EvalSnapshot) => void;
  onSave?: (evalSnapshot: EvalSnapshot) => void;
}

interface ImpactMeterProps {
  value: number;
  colors: typeof Colors.light;
}

function ImpactMeter({ value, colors }: ImpactMeterProps) {
  const getImpactColor = (v: number) => {
    if (v >= 80) return '#FFFFFF';
    if (v >= 60) return '#A1A1AA';
    if (v >= 40) return '#A1A1AA';
    return '#52525B';
  };

  return (
    <View style={[styles.impactContainer, { backgroundColor: colors.backgroundSecondary }]}>
      <ThemedText style={[styles.impactLabel, { color: colors.textSecondary }]}>
        Projected Impact
      </ThemedText>
      <View style={styles.impactRow}>
        <View style={[styles.impactBar, { backgroundColor: colors.backgroundTertiary }]}>
          <View
            style={[
              styles.impactFill,
              { width: `${value}%`, backgroundColor: getImpactColor(value) },
            ]}
          />
        </View>
        <ThemedText style={[styles.impactValue, { color: getImpactColor(value) }]}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

interface TraitListProps {
  title: string;
  items: string[];
  icon: string;
  iconColor: string;
  colors: typeof Colors.light;
}

function TraitList({ title, items, icon, iconColor, colors }: TraitListProps) {
  return (
    <View style={styles.traitSection}>
      <View style={styles.traitHeader}>
        <IconSymbol name={icon as any} size={12} color={iconColor} />
        <ThemedText style={[styles.traitTitle, { color: colors.textSecondary }]}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.traitList}>
        {items.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.traitItem}>
            <View style={[styles.traitBullet, { backgroundColor: iconColor }]} />
            <ThemedText style={styles.traitText} numberOfLines={1}>
              {item}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

export function EvalCard({ evalSnapshot, onViewFull, onSave }: EvalCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="person.text.rectangle" size={16} color={EVAL_COLOR} />
          <ThemedText style={styles.headerTitle}>Player Evaluation</ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: EVAL_COLOR + '20' }]}>
          <ThemedText style={[styles.badgeText, { color: EVAL_COLOR }]}>
            AI Generated
          </ThemedText>
        </View>
      </View>

      {/* Player Name */}
      <ThemedText style={styles.playerName}>{evalSnapshot.playerName}</ThemedText>

      {/* Summary */}
      <ThemedText style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
        {evalSnapshot.summary}
      </ThemedText>

      {/* Impact Meter */}
      <ImpactMeter value={evalSnapshot.projectedImpact} colors={colors} />

      {/* Traits */}
      <View style={styles.traitsContainer}>
        <TraitList
          title="Strengths"
          items={evalSnapshot.strengths}
          icon="checkmark.circle.fill"
          iconColor="#FFFFFF"
          colors={colors}
        />
        <TraitList
          title="Growth Areas"
          items={evalSnapshot.areasForGrowth}
          icon="arrow.up.circle.fill"
          iconColor="#A1A1AA"
          colors={colors}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onViewFull && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryAction,
              { backgroundColor: EVAL_COLOR, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => onViewFull(evalSnapshot)}
          >
            <IconSymbol name="arrow.up.right.square" size={14} color="#FFFFFF" />
            <ThemedText style={styles.primaryActionText}>View Full</ThemedText>
          </Pressable>
        )}
        {onSave && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => onSave(evalSnapshot)}
          >
            <IconSymbol name="square.and.arrow.down" size={14} color={colors.text} />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>Save</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Player
  playerName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },

  // Impact
  impactContainer: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  impactLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  impactBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  impactFill: {
    height: '100%',
    borderRadius: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    width: 30,
    textAlign: 'right',
  },

  // Traits
  traitsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  traitSection: {
    flex: 1,
  },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  traitTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  traitList: {
    gap: 3,
  },
  traitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  traitBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  traitText: {
    fontSize: 12,
    flex: 1,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  primaryAction: {},
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
