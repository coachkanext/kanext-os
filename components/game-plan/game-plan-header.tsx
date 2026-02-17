/**
 * Game Plan V2 — Sticky header with opponent info and scout confidence.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Alert, Share } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ScoutConfidenceGate } from './game-plan-types';

interface Props {
  opponent: string;
  date: string;
  homeAway: 'Home' | 'Away';
  scoutConfidence: ScoutConfidenceGate;
  onShare?: () => void;
}

function getConfidenceColor(pct: number): string {
  if (pct >= 85) return Brand.success;
  if (pct >= 70) return Brand.precision;
  if (pct >= 55) return Brand.warning;
  return Brand.error;
}

export function GamePlanHeader({ opponent, date, homeAway, scoutConfidence, onShare }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const confColor = getConfidenceColor(scoutConfidence.pct);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onShare) {
      onShare();
      return;
    }
    try {
      await Share.share({ message: `Game Plan: ${homeAway === 'Home' ? 'vs' : '@'} ${opponent} — ${date}` });
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {/* Left: Opponent info */}
      <View style={styles.leftSection}>
        <View style={[styles.oppCircle, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[styles.oppInitial, { color: colors.textSecondary }]}>
            {opponent.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.oppInfo}>
          <ThemedText style={styles.oppName} numberOfLines={1}>
            {homeAway === 'Home' ? 'vs' : '@'} {opponent}
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>{date}</ThemedText>
            <View style={[styles.homeBadge, { backgroundColor: homeAway === 'Home' ? Brand.success + '20' : Brand.precision + '20' }]}>
              <ThemedText style={[styles.homeBadgeText, { color: homeAway === 'Home' ? Brand.success : Brand.precision }]}>
                {homeAway === 'Home' ? 'HOME' : 'AWAY'}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Right: Confidence + actions */}
      <View style={styles.rightSection}>
        <View style={styles.confBlock}>
          <ThemedText style={[styles.confPct, { color: confColor }]}>{scoutConfidence.pct}%</ThemedText>
          <View style={[styles.tierChip, { backgroundColor: confColor + '20' }]}>
            <ThemedText style={[styles.tierText, { color: confColor }]}>{scoutConfidence.dataTier}</ThemedText>
          </View>
        </View>
        <View style={styles.actionRow}>
          <Pressable onPress={handleShare} hitSlop={8}>
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.textTertiary} />
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Locked', 'Game plan locked for game day.'); }} hitSlop={8}>
            <IconSymbol name="lock.fill" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: Spacing.sm },
  oppCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
  },
  oppInitial: { fontSize: 20, fontWeight: '700' },
  oppInfo: { flex: 1 },
  oppName: { fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dateText: { fontSize: 12 },
  homeBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  homeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  rightSection: { alignItems: 'flex-end' },
  confBlock: { alignItems: 'flex-end', marginBottom: 4 },
  confPct: { fontSize: 20, fontWeight: '800' },
  tierChip: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm, marginTop: 1 },
  tierText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', gap: 12 },
});
