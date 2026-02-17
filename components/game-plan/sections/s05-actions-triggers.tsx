/**
 * S05 — Actions Library
 * 8-12 expandable action cards with trigger/primary/counter/bailout/ourCounter + risk badge
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ActionCard, RiskLevel } from '../game-plan-types';

interface Props {
  actions: ActionCard[];
  onLayout?: (y: number) => void;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: Brand.success,
  medium: Brand.warning,
  high: Brand.error,
};

export function S05ActionsTriggers({ actions, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {actions.map((action, i) => {
        const isExpanded = expandedIdx === i;
        return (
          <Pressable
            key={i}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedIdx(isExpanded ? null : i);
            }}
          >
            <View style={styles.headerRow}>
              <ThemedText style={[styles.actionName, { color: colors.text }]}>{action.name}</ThemedText>
              <View style={[styles.riskBadge, { backgroundColor: RISK_COLORS[action.risk] + '20' }]}>
                <ThemedText style={[styles.riskText, { color: RISK_COLORS[action.risk] }]}>
                  {action.risk.toUpperCase()}
                </ThemedText>
              </View>
              <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={12} color={colors.textTertiary} />
            </View>

            {isExpanded && (
              <View style={styles.details}>
                <DetailRow label="Trigger" value={action.trigger} colors={colors} />
                <DetailRow label="Primary" value={action.primaryOption} colors={colors} accent={Brand.precision} />
                <DetailRow label="Counter" value={action.counter} colors={colors} accent={Brand.warning} />
                <DetailRow label="Bailout" value={action.bailout} colors={colors} />
                <DetailRow label="Our Counter" value={action.ourCounter} colors={colors} accent={Brand.success} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function DetailRow({ label, value, colors, accent }: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  accent?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={[styles.detailLabel, { color: accent ?? colors.textTertiary }]}>{label}</ThemedText>
      <ThemedText style={[styles.detailValue, { color: colors.text }]}>{value}</ThemedText>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionName: { flex: 1, fontSize: 15, fontWeight: '600' },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  riskText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  details: { marginTop: Spacing.sm },
  detailRow: { paddingVertical: 4 },
  detailLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  detailValue: { fontSize: 13, lineHeight: 18, marginTop: 1 },
});
