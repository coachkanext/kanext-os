/**
 * SimResultView — Universal simulation result display.
 * Adapts to sim type. Shows win probability, projected score,
 * confidence gate, key drivers, and action buttons.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RECENT_SIM_RUNS, SEASON_SIM, CONFERENCE_POSTSEASON, formatMargin } from '@/data/mock-simulations';
import type { SimRun } from '@/components/simulation/simulation-types';

const ACCENT = '#FFFFFF';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWinColor(winProbability: number): string {
  if (winProbability >= 55) return Brand.success;
  if (winProbability >= 45) return ACCENT;
  return Brand.error;
}

function getImpactIcon(impact: 'positive' | 'neutral' | 'negative'): string {
  if (impact === 'positive') return '\u2191';
  if (impact === 'negative') return '\u2193';
  return '\u2014';
}

function getImpactColor(impact: 'positive' | 'neutral' | 'negative'): string {
  if (impact === 'positive') return Brand.success;
  if (impact === 'negative') return Brand.error;
  return '#A1A1AA';
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
// Win Probability Bar (large)
// ---------------------------------------------------------------------------

function WinProbabilityBar({ winProbability, colors }: { winProbability: number; colors: typeof Colors.light }) {
  const winColor = getWinColor(winProbability);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Win Probability</ThemedText>
      <View style={styles.largeProbRow}>
        <ThemedText style={[styles.largeProbValue, { color: winColor }]}>{winProbability}%</ThemedText>
        <View style={[styles.largeProbBarBg, { backgroundColor: colors.backgroundTertiary }]}>
          <View style={[styles.largeProbBarFill, { width: `${winProbability}%`, backgroundColor: winColor }]} />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Projected Score
// ---------------------------------------------------------------------------

function ProjectedScore({ run, colors }: { run: SimRun; colors: typeof Colors.light }) {
  const marginColor = run.projectedMargin > 0 ? Brand.success : run.projectedMargin < 0 ? Brand.error : ACCENT;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Projected Score</ThemedText>
          <ThemedText style={styles.scoreValue}>
            {run.projectedScore.home} – {run.projectedScore.away}
          </ThemedText>
        </View>
        <View style={styles.scoreItem}>
          <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Margin</ThemedText>
          <ThemedText style={[styles.scoreValue, { color: marginColor }]}>
            {formatMargin(run.projectedMargin)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Confidence Gate Section
// ---------------------------------------------------------------------------

function ConfidenceGateSection({ run, colors }: { run: SimRun; colors: typeof Colors.light }) {
  const gate = run.confidenceGate;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Circle indicator + label */}
      <View style={styles.gateHeaderRow}>
        <View style={styles.gateCircleWrap}>
          <View style={[styles.gateCircleBg, { borderColor: colors.backgroundTertiary }]}>
            <View
              style={[
                styles.gateCircleFill,
                {
                  backgroundColor: Brand.precision,
                  height: `${gate.percentage}%`,
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.gatePercText, { color: Brand.precision }]}>{gate.percentage}%</ThemedText>
        </View>
        <View style={styles.gateInfo}>
          <ThemedText style={[styles.gateLabel, { color: colors.text }]}>{gate.label} Confidence</ThemedText>
          <ThemedText style={[styles.gateSubLabel, { color: colors.textTertiary }]}>
            Based on {gate.factors.length} factors
          </ThemedText>
        </View>
      </View>

      {/* Factors table */}
      <View style={[styles.factorsTable, { borderTopColor: colors.border }]}>
        {gate.factors.map((factor, i) => (
          <View
            key={factor.name}
            style={[
              styles.factorRow,
              i < gate.factors.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[styles.factorName, { color: colors.text }]}>{factor.name}</ThemedText>
            <ThemedText style={[styles.factorImpact, { color: getImpactColor(factor.impact) }]}>
              {getImpactIcon(factor.impact)}
            </ThemedText>
            <View style={[styles.factorWeightBg, { backgroundColor: colors.backgroundTertiary }]}>
              <View
                style={[
                  styles.factorWeightFill,
                  { width: `${factor.weight * 100}%`, backgroundColor: getImpactColor(factor.impact) },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Key Drivers
// ---------------------------------------------------------------------------

function KeyDrivers({ drivers, colors }: { drivers: string[]; colors: typeof Colors.light }) {
  if (drivers.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {drivers.map((d, i) => (
        <View key={i} style={styles.driverRow}>
          <View style={[styles.driverDot, { backgroundColor: Brand.precision }]} />
          <ThemedText style={[styles.driverText, { color: colors.text }]}>{d}</ThemedText>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Type Badge
// ---------------------------------------------------------------------------

function SimTypeBadge({ simType, colors }: { simType: string; colors: typeof Colors.light }) {
  // Map type to display name + color
  const typeMap: Record<string, { label: string; color: string }> = {
    game: { label: 'Game Sim', color: ACCENT },
    segment: { label: 'Segment', color: ACCENT },
    'end-game': { label: 'End-Game', color: '#EF4444' },
    'system-sweep': { label: 'System Sweep', color: '#F59E0B' },
    'lineup-sandbox': { label: 'Lineup Sandbox', color: '#22C55E' },
    season: { label: 'Season', color: '#FFFFFF' },
    'conference-postseason': { label: 'Conf / Postseason', color: ACCENT },
    'counterfactual-roster': { label: 'Counterfactual', color: ACCENT },
    'practice-transfer': { label: 'Practice Transfer', color: ACCENT },
  };

  const info = typeMap[simType] ?? { label: simType, color: ACCENT };

  return (
    <View style={[styles.typeBadge, { backgroundColor: info.color + '20' }]}>
      <ThemedText style={[styles.typeBadgeText, { color: info.color }]}>{info.label}</ThemedText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// SimResultView (main export)
// ---------------------------------------------------------------------------

export function SimResultView({ run = RECENT_SIM_RUNS[0] }: { run?: SimRun }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.title}>{run.title}</ThemedText>
          <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
            {run.timestamp instanceof Date ? run.timestamp.toLocaleString() : String(run.timestamp)}
          </ThemedText>
        </View>
        <SimTypeBadge simType={run.simType} colors={colors} />
      </View>

      {/* Win Probability */}
      <SectionLabel title="WIN PROBABILITY" colors={colors} />
      <WinProbabilityBar winProbability={run.winProbability} colors={colors} />

      {/* Projected Score (if applicable — skip for season sims with 0-0) */}
      {(run.projectedScore.home > 0 || run.projectedScore.away > 0) && (
        <>
          <SectionLabel title="PROJECTED SCORE" colors={colors} />
          <ProjectedScore run={run} colors={colors} />
        </>
      )}

      {/* Confidence Gate */}
      <SectionLabel title="CONFIDENCE GATE" colors={colors} />
      <ConfidenceGateSection run={run} colors={colors} />

      {/* Key Drivers */}
      {run.drivers.length > 0 && (
        <>
          <SectionLabel title="KEY DRIVERS" colors={colors} />
          <KeyDrivers drivers={run.drivers} colors={colors} />
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="bookmark.fill" size={16} color={Brand.precision} />
          <ThemedText style={[styles.actionButtonText, { color: Brand.precision }]}>Save to Library</ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="doc.plaintext.fill" size={16} color={ACCENT} />
          <ThemedText style={[styles.actionButtonText, { color: ACCENT }]}>Attach to Game Plan</ThemedText>
        </Pressable>
      </View>

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

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  title: { fontSize: 18, fontWeight: '700' },
  timestamp: { fontSize: 12, marginTop: 2 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },

  // Win probability (large)
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.sm,
  },
  largeProbRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  largeProbValue: { fontSize: 32, fontWeight: '800', width: 72 },
  largeProbBarBg: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  largeProbBarFill: { height: '100%', borderRadius: 6 },

  // Score
  scoreRow: { flexDirection: 'row', gap: Spacing.lg },
  scoreItem: {},
  scoreLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  scoreValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },

  // Confidence Gate
  gateHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  gateCircleWrap: { alignItems: 'center' },
  gateCircleBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  gateCircleFill: {
    width: '100%',
    borderRadius: 0,
  },
  gatePercText: { fontSize: 12, fontWeight: '800', marginTop: 4 },
  gateInfo: { flex: 1 },
  gateLabel: { fontSize: 15, fontWeight: '700' },
  gateSubLabel: { fontSize: 12, marginTop: 2 },

  factorsTable: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  factorName: { flex: 1, fontSize: 13, fontWeight: '500' },
  factorImpact: { fontSize: 16, fontWeight: '700', marginHorizontal: Spacing.sm, width: 20, textAlign: 'center' },
  factorWeightBg: { width: 60, height: 6, borderRadius: 3, overflow: 'hidden' },
  factorWeightFill: { height: '100%', borderRadius: 3 },

  // Key Drivers
  driverRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  driverDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, marginRight: 10 },
  driverText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  actionButtonText: { fontSize: 13, fontWeight: '700' },
});
