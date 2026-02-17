/**
 * S01 — Decision Summary
 * 3 domain-icon bullets (defensive/offensive/volatility) + red "Do Not Break" card
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { DecisionBullet, DoNotBreakRule, DomainIcon } from '../game-plan-types';

interface Props {
  bullets: DecisionBullet[];
  doNotBreak: DoNotBreakRule[];
  onLayout?: (y: number) => void;
}

const DOMAIN_ICONS: Record<DomainIcon, { icon: string; color: string }> = {
  defensive: { icon: 'shield.fill', color: Brand.precision },
  offensive: { icon: 'flame.fill', color: Brand.warning },
  volatility: { icon: 'exclamationmark.triangle.fill', color: Brand.error },
};

export function S01DecisionSummary({ bullets, doNotBreak, onLayout }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}>
      {/* Decision Bullets */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {bullets.map((b, i) => {
          const domain = DOMAIN_ICONS[b.domain];
          return (
            <View key={i} style={styles.bulletRow}>
              <IconSymbol name={domain.icon as any} size={16} color={domain.color} />
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>{b.text}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Do Not Break */}
      {doNotBreak.length > 0 && (
        <View style={[styles.card, styles.dnbCard, { backgroundColor: Brand.error + '10', borderColor: Brand.error + '30' }]}>
          <View style={styles.dnbHeader}>
            <IconSymbol name="xmark.octagon.fill" size={14} color={Brand.error} />
            <ThemedText style={[styles.dnbTitle, { color: Brand.error }]}>DO NOT BREAK</ThemedText>
          </View>
          {doNotBreak.map((rule, i) => (
            <View key={i} style={styles.dnbRow}>
              <ThemedText style={[styles.dnbRule, { color: colors.text }]}>{rule.rule}</ThemedText>
              <ThemedText style={[styles.dnbConsequence, { color: colors.textTertiary }]}>
                Risk: {rule.consequence}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
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
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm + 2,
    paddingVertical: 6,
  },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  dnbCard: { marginTop: Spacing.xs },
  dnbHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  dnbTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  dnbRow: { paddingVertical: 5 },
  dnbRule: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  dnbConsequence: { fontSize: 12, marginTop: 2, lineHeight: 16 },
});
