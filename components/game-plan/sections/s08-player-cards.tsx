/**
 * S08 — Player Guard Cards
 * Expandable per-player: threat type, directionality, shot map, coverage,
 * TO stress, foul profile, guard rules, one-sentence plan
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PlayerGuardCard } from '../game-plan-types';

interface Props {
  cards: PlayerGuardCard[];
  onLayout?: (y: number) => void;
}

const TENDENCY_COLORS: Record<string, string> = {
  hot: Brand.error,
  warm: Brand.warning,
  cold: Brand.precision,
};

export function S08PlayerCards({ cards, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {cards.map((card, i) => {
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
            {/* Header */}
            <View style={styles.headerRow}>
              <ThemedText style={[styles.playerName, { color: colors.text }]}>{card.name}</ThemedText>
              <View style={[styles.threatBadge, { backgroundColor: Brand.error + '20' }]}>
                <ThemedText style={[styles.threatText, { color: Brand.error }]}>{card.threatType}</ThemedText>
              </View>
              <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={12} color={colors.textTertiary} />
            </View>

            {isExpanded && (
              <View style={styles.details}>
                {/* Directionality */}
                <DetailSection label="DIRECTIONALITY" colors={colors}>
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>{card.directionality}</ThemedText>
                </DetailSection>

                {/* Shot Map */}
                <DetailSection label="SHOT MAP" colors={colors}>
                  <View style={styles.shotMap}>
                    {card.shotMapZones.map((z, zi) => (
                      <View key={zi} style={styles.shotZone}>
                        <View style={[styles.shotDot, { backgroundColor: TENDENCY_COLORS[z.tendency] }]} />
                        <ThemedText style={[styles.shotZoneText, { color: colors.textSecondary }]}>{z.zone}</ThemedText>
                      </View>
                    ))}
                  </View>
                </DetailSection>

                {/* Coverage */}
                <DetailSection label="COVERAGE" colors={colors}>
                  <ThemedText style={[styles.detailValue, { color: Brand.precision }]}>{card.coverage}</ThemedText>
                </DetailSection>

                {/* TO Stress */}
                <DetailSection label="TURNOVER STRESS" colors={colors}>
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>{card.toStress}</ThemedText>
                </DetailSection>

                {/* Foul Profile */}
                <DetailSection label="FOUL PROFILE" colors={colors}>
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>{card.foulProfile}</ThemedText>
                </DetailSection>

                {/* Guard Rules */}
                <DetailSection label="GUARD RULES" colors={colors}>
                  {card.guardRules.map((rule, ri) => (
                    <View key={ri} style={styles.ruleRow}>
                      <View style={[styles.ruleDot, { backgroundColor: Brand.warning }]} />
                      <ThemedText style={[styles.detailValue, { color: colors.text }]}>{rule}</ThemedText>
                    </View>
                  ))}
                </DetailSection>

                {/* Plan */}
                <DetailSection label="THE PLAN" colors={colors}>
                  <ThemedText style={[styles.planText, { color: colors.text }]}>{card.plan}</ThemedText>
                </DetailSection>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function DetailSection({ label, colors, children }: {
  label: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
      {children}
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
  playerName: { flex: 1, fontSize: 15, fontWeight: '600' },
  threatBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  threatText: { fontSize: 11, fontWeight: '700' },
  details: { marginTop: Spacing.sm },
  section: { marginTop: Spacing.sm },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontSize: 13, lineHeight: 18 },
  shotMap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  shotZone: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shotDot: { width: 8, height: 8, borderRadius: 4 },
  shotZoneText: { fontSize: 11 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingVertical: 2 },
  ruleDot: { width: 4, height: 4, borderRadius: 2, marginTop: 6 },
  planText: { fontSize: 13, lineHeight: 18, fontWeight: '500', fontStyle: 'italic' },
});
