/**
 * Biz Vault Cap Table View — Ownership breakdown with stacked bar + detail table
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CAP_TABLE, type CapTableEntry } from '@/data/mock-business-home';
import { openPersonCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const STAKEHOLDER_COLORS: string[] = [
  '#F59E0B', // Founder
  '#1D9BF0', // Advisors
  '#1D9BF0', // Employee pool
  '#22C55E', // Angel investors
  '#EF4444', // Extra
  '#1D9BF0',
];

const CLASS_COLORS: Record<string, string> = {
  common: '#F59E0B',
  preferred: '#22C55E',
  options: '#1D9BF0',
};

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function BizVaultCapTableView({ colors, accent }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Stacked ownership bar */}
      <View style={[styles.barContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionLabel, { color: accent }]}>OWNERSHIP BREAKDOWN</ThemedText>
        <View style={styles.stackedBar}>
          {CAP_TABLE.map((entry: CapTableEntry, idx: number) => (
            <View
              key={entry.id}
              style={[
                styles.barSegment,
                {
                  flex: entry.percentage,
                  backgroundColor: STAKEHOLDER_COLORS[idx % STAKEHOLDER_COLORS.length],
                },
                idx === 0 && { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
                idx === CAP_TABLE.length - 1 && { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
              ]}
            />
          ))}
        </View>
        {/* Legend */}
        <View style={styles.legend}>
          {CAP_TABLE.map((entry: CapTableEntry, idx: number) => (
            <View key={entry.id} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: STAKEHOLDER_COLORS[idx % STAKEHOLDER_COLORS.length] }]}
              />
              <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>
                {entry.name} ({entry.percentage}%)
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Detail table */}
      <ThemedText style={[styles.sectionLabel, { color: accent, marginTop: 16, marginBottom: 8 }]}>
        STAKEHOLDERS
      </ThemedText>
      {CAP_TABLE.map((entry: CapTableEntry, idx: number) => {
        const classColor = CLASS_COLORS[entry.shareClass] ?? '#A1A1AA';
        return (
          <Pressable
            key={entry.id}
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openPersonCard({ name: entry.name, role: entry.shareClass });
            }}
          >
            <View style={styles.rowLeft}>
              <View style={styles.nameRow}>
                <ThemedText style={[styles.stakeholderName, { color: colors.text }]}>
                  {entry.name}
                </ThemedText>
                {entry.boardSeat && (
                  <View style={[styles.boardBadge, { backgroundColor: accent + '22' }]}>
                    <ThemedText style={[styles.boardBadgeText, { color: accent }]}>BOARD</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                <View style={[styles.classBadge, { backgroundColor: classColor + '22' }]}>
                  <ThemedText style={[styles.classBadgeText, { color: classColor }]}>
                    {entry.shareClass.toUpperCase()}
                  </ThemedText>
                </View>
                {entry.date && (
                  <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
                    {entry.date}
                  </ThemedText>
                )}
              </View>
            </View>
            <View style={styles.rowRight}>
              <ThemedText style={[styles.percentage, { color: STAKEHOLDER_COLORS[idx % STAKEHOLDER_COLORS.length] }]}>
                {entry.percentage}%
              </ThemedText>
              {entry.investmentAmount != null && (
                <ThemedText style={[styles.investmentAmount, { color: colors.textSecondary }]}>
                  {formatCurrency(entry.investmentAmount)}
                </ThemedText>
              )}
            </View>
          </Pressable>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  barContainer: { borderRadius: 12, borderWidth: 1, padding: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  stackedBar: { flexDirection: 'row', height: 20, borderRadius: 6, overflow: 'hidden' },
  barSegment: { height: 20 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendText: { fontSize: 10, fontWeight: '500' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  rowLeft: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stakeholderName: { fontSize: 14, fontWeight: '700' },
  boardBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  boardBadgeText: { fontSize: 9, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  classBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  classBadgeText: { fontSize: 9, fontWeight: '700' },
  dateText: { fontSize: 10 },
  rowRight: { alignItems: 'flex-end' },
  percentage: { fontSize: 18, fontWeight: '800' },
  investmentAmount: { fontSize: 11, marginTop: 2 },
});
