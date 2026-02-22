/**
 * ComparisonView — Side-by-side 2-3 simulation run comparison.
 * Checkbox selection, delta highlighting, attach-to-game-plan action.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RECENT_SIM_RUNS, formatMargin } from '@/data/mock-simulations';
import type { SimRun } from '@/components/simulation/simulation-types';

const ACCENT = '#FFFFFF';
const MAX_COMPARE = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deltaColor(value: number, higherIsBetter: boolean): string {
  if (value === 0) return '#A1A1AA';
  if (higherIsBetter) return value > 0 ? Brand.success : Brand.error;
  return value < 0 ? Brand.success : Brand.error;
}

function formatDelta(value: number): string {
  if (value === 0) return '—';
  return value > 0 ? `+${value}` : `${value}`;
}

// ---------------------------------------------------------------------------
// Section label
// ---------------------------------------------------------------------------

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

// ---------------------------------------------------------------------------
// Selection Checkbox Row
// ---------------------------------------------------------------------------

function RunCheckbox({
  run,
  selected,
  onToggle,
  disabled,
  colors,
}: {
  run: SimRun;
  selected: boolean;
  onToggle: () => void;
  disabled: boolean;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable
      style={[
        styles.checkboxRow,
        {
          backgroundColor: selected ? ACCENT + '08' : colors.card,
          borderColor: selected ? ACCENT : colors.border,
        },
      ]}
      onPress={() => {
        if (!disabled || selected) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }
      }}
      disabled={disabled && !selected}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: selected ? ACCENT : 'transparent',
            borderColor: selected ? ACCENT : colors.textTertiary,
          },
        ]}
      >
        {selected && <IconSymbol name="checkmark" size={12} color="#000000" />}
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.checkboxTitle, { color: colors.text }]}>{run.title}</ThemedText>
        <ThemedText style={[styles.checkboxMeta, { color: colors.textTertiary }]}>
          {run.simType} &middot; {run.winProbability}% win
        </ThemedText>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Comparison Table
// ---------------------------------------------------------------------------

function ComparisonTable({ runs, colors }: { runs: SimRun[]; colors: typeof Colors.light }) {
  // Compute deltas relative to first selected run
  const baseRun = runs[0];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Column Headers */}
      <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
        <View style={styles.labelCol} />
        {runs.map((run) => (
          <View key={run.id} style={styles.valueCol}>
            <ThemedText style={[styles.colHeader, { color: Brand.precision }]} numberOfLines={2}>
              {run.title}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Row: Win % */}
      <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
        <View style={styles.labelCol}>
          <ThemedText style={[styles.rowLabel, { color: colors.textSecondary }]}>Win %</ThemedText>
        </View>
        {runs.map((run, i) => {
          const delta = i === 0 ? 0 : run.winProbability - baseRun.winProbability;
          return (
            <View key={run.id} style={styles.valueCol}>
              <ThemedText style={[styles.rowValue, { color: colors.text }]}>{run.winProbability}%</ThemedText>
              {i > 0 && (
                <ThemedText style={[styles.deltaText, { color: deltaColor(delta, true) }]}>
                  {formatDelta(delta)}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>

      {/* Row: Projected Score */}
      <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
        <View style={styles.labelCol}>
          <ThemedText style={[styles.rowLabel, { color: colors.textSecondary }]}>Score</ThemedText>
        </View>
        {runs.map((run) => (
          <View key={run.id} style={styles.valueCol}>
            <ThemedText style={[styles.rowValue, { color: colors.text }]}>
              {run.projectedScore.home > 0 || run.projectedScore.away > 0
                ? `${run.projectedScore.home}-${run.projectedScore.away}`
                : '—'}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Row: Margin */}
      <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
        <View style={styles.labelCol}>
          <ThemedText style={[styles.rowLabel, { color: colors.textSecondary }]}>Margin</ThemedText>
        </View>
        {runs.map((run, i) => {
          const delta = i === 0 ? 0 : run.projectedMargin - baseRun.projectedMargin;
          return (
            <View key={run.id} style={styles.valueCol}>
              <ThemedText
                style={[
                  styles.rowValue,
                  { color: run.projectedMargin > 0 ? Brand.success : run.projectedMargin < 0 ? Brand.error : colors.text },
                ]}
              >
                {formatMargin(run.projectedMargin)}
              </ThemedText>
              {i > 0 && (
                <ThemedText style={[styles.deltaText, { color: deltaColor(delta, true) }]}>
                  {formatDelta(delta)}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>

      {/* Row: Confidence */}
      <View style={[styles.tableRow, { borderBottomColor: colors.border }]}>
        <View style={styles.labelCol}>
          <ThemedText style={[styles.rowLabel, { color: colors.textSecondary }]}>Confidence</ThemedText>
        </View>
        {runs.map((run, i) => {
          const delta = i === 0 ? 0 : run.confidence - baseRun.confidence;
          return (
            <View key={run.id} style={styles.valueCol}>
              <ThemedText style={[styles.rowValue, { color: Brand.precision }]}>{run.confidence}%</ThemedText>
              {i > 0 && (
                <ThemedText style={[styles.deltaText, { color: deltaColor(delta, true) }]}>
                  {formatDelta(delta)}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>

      {/* Row: Key Drivers */}
      <View style={styles.driversTableRow}>
        <View style={styles.labelCol}>
          <ThemedText style={[styles.rowLabel, { color: colors.textSecondary }]}>Drivers</ThemedText>
        </View>
        {runs.map((run) => (
          <View key={run.id} style={styles.valueCol}>
            {run.drivers.map((d, j) => (
              <View key={j} style={styles.driverItem}>
                <View style={[styles.driverDot, { backgroundColor: Brand.precision }]} />
                <ThemedText style={[styles.driverText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {d}
                </ThemedText>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ComparisonView (main export)
// ---------------------------------------------------------------------------

export function ComparisonView() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Pre-select the first 2 runs
  const [selectedIds, setSelectedIds] = useState<string[]>(
    RECENT_SIM_RUNS.slice(0, 2).map((r) => r.id)
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const selectedRuns = RECENT_SIM_RUNS.filter((r) => selectedIds.includes(r.id));
  const atLimit = selectedIds.length >= MAX_COMPARE;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Selection */}
      <SectionLabel title="SELECT RUNS TO COMPARE (2-3)" colors={colors} />
      {RECENT_SIM_RUNS.map((run) => (
        <RunCheckbox
          key={run.id}
          run={run}
          selected={selectedIds.includes(run.id)}
          onToggle={() => toggleSelection(run.id)}
          disabled={atLimit}
          colors={colors}
        />
      ))}

      {/* Comparison Table */}
      {selectedRuns.length >= 2 && (
        <>
          <SectionLabel title="COMPARISON" colors={colors} />
          <ComparisonTable runs={selectedRuns} colors={colors} />

          {/* Attach to Game Plan */}
          <Pressable
            style={({ pressed }) => [
              styles.attachButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={styles.attachButtonText}>Attach to Game Plan</ThemedText>
          </Pressable>
        </>
      )}

      {selectedRuns.length < 2 && (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            Select at least 2 runs to compare
          </ThemedText>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },

  // Checkbox selection
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTitle: { fontSize: 14, fontWeight: '600' },
  checkboxMeta: { fontSize: 12, marginTop: 2 },

  // Comparison Table
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  driversTableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  labelCol: { width: 80 },
  valueCol: { flex: 1, alignItems: 'center' },
  colHeader: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  rowLabel: { fontSize: 12, fontWeight: '600' },
  rowValue: { fontSize: 14, fontWeight: '700' },
  deltaText: { fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Drivers in table
  driverItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 2, paddingHorizontal: 2 },
  driverDot: { width: 4, height: 4, borderRadius: 2, marginTop: 5, marginRight: 6 },
  driverText: { flex: 1, fontSize: 11, lineHeight: 16 },

  // Attach button
  attachButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  attachButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },

  // Empty state
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14 },
});
