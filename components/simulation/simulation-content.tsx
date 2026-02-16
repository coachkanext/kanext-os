/**
 * Simulation Content — Game simulation dashboard hub tab.
 * Shows season projection, next-game sim, player impact, saved sims.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AskNexusCTA } from '@/components/ui/ask-nexus-cta';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SAMPLE_SIMULATIONS, SAVED_SIMULATIONS, getConfidenceLabel, getVolatilityLabel, formatMargin } from '@/data/mock-simulations';
import { SEASON_PROJECTION } from '@/data/stats/projections';
import type { SimulationResult, SavedSimulation, PlayerImpact } from '@/types';

const ACCENT_GOLD = '#FFFFFF';

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

function SeasonProjectionCard({ colors }: { colors: typeof Colors.light }) {
  const proj = SEASON_PROJECTION;
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.projRow}>
        <View style={styles.projItem}>
          <ThemedText style={[styles.projValue, { color: ACCENT_GOLD }]}>{proj.projectedTotal}</ThemedText>
          <ThemedText style={[styles.projLabel, { color: colors.textTertiary }]}>Projected</ThemedText>
        </View>
        <View style={[styles.projDivider, { backgroundColor: colors.border }]} />
        <View style={styles.projItem}>
          <ThemedText style={[styles.projValue, { color: Brand.precision }]}>{proj.projectedSeed}</ThemedText>
          <ThemedText style={[styles.projLabel, { color: colors.textTertiary }]}>Seed</ThemedText>
        </View>
        <View style={[styles.projDivider, { backgroundColor: colors.border }]} />
        <View style={styles.projItem}>
          <ThemedText style={[styles.projValue, { color: Brand.success }]}>{proj.playoffProbability}%</ThemedText>
          <ThemedText style={[styles.projLabel, { color: colors.textTertiary }]}>Playoff</ThemedText>
        </View>
      </View>
      <View style={[styles.projFooter, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.projFooterText, { color: colors.textTertiary }]}>
          Current: {proj.currentRecord} • {proj.gamesRemaining} games remaining • {proj.simConfidence}% confidence
        </ThemedText>
      </View>
    </View>
  );
}

function NextGameSimCard({ sim, colors }: { sim: SimulationResult; colors: typeof Colors.light }) {
  const winColor = sim.winProbability >= 55 ? Brand.success : sim.winProbability >= 45 ? ACCENT_GOLD : Brand.error;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={styles.simMatchup}>{sim.matchupText}</ThemedText>

      {/* Win probability bar */}
      <View style={styles.winProbRow}>
        <ThemedText style={[styles.winProbValue, { color: winColor }]}>{sim.winProbability}%</ThemedText>
        <View style={[styles.winProbBarBg, { backgroundColor: colors.backgroundTertiary }]}>
          <View style={[styles.winProbBarFill, { width: `${sim.winProbability}%`, backgroundColor: winColor }]} />
        </View>
      </View>

      {/* Projected score */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Projected</ThemedText>
          <ThemedText style={styles.scoreValue}>
            {sim.projectedScore?.home ?? '—'} – {sim.projectedScore?.away ?? '—'}
          </ThemedText>
        </View>
        <View style={styles.scoreItem}>
          <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Margin</ThemedText>
          <ThemedText style={[styles.scoreValue, { color: (sim.projectedMargin ?? 0) > 0 ? Brand.success : Brand.error }]}>
            {formatMargin(sim.projectedMargin ?? 0)}
          </ThemedText>
        </View>
        <View style={styles.scoreItem}>
          <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Confidence</ThemedText>
          <ThemedText style={[styles.scoreValue, { color: Brand.precision }]}>
            {getConfidenceLabel(sim.confidence ?? 'medium')}
          </ThemedText>
        </View>
      </View>

      {/* Volatility */}
      <View style={[styles.volatilityRow, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.volatilityText, { color: colors.textTertiary }]}>
          {getVolatilityLabel(sim.volatility ?? 'medium')}
        </ThemedText>
      </View>
    </View>
  );
}

function DriversSection({ drivers, colors }: { drivers: string[]; colors: typeof Colors.light }) {
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

function PlayerImpactTable({ players, colors }: { players: PlayerImpact[]; colors: typeof Colors.light }) {
  const sorted = [...players].sort((a, b) => b.impactRating - a.impactRating);
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {sorted.map((p, i) => (
        <View key={p.playerId} style={[styles.impactRow, i < sorted.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <View style={styles.impactInfo}>
            <ThemedText style={styles.impactName}>{p.playerName}</ThemedText>
            <ThemedText style={[styles.impactPos, { color: colors.textTertiary }]}>{p.position}</ThemedText>
          </View>
          <View style={styles.impactStats}>
            <ThemedText style={[styles.impactStat, { color: colors.textSecondary }]}>
              {p.projectedPoints.toFixed(1)}p
            </ThemedText>
            <ThemedText style={[styles.impactStat, { color: colors.textSecondary }]}>
              {p.projectedRebounds.toFixed(1)}r
            </ThemedText>
            <ThemedText style={[styles.impactStat, { color: colors.textSecondary }]}>
              {p.projectedAssists.toFixed(1)}a
            </ThemedText>
          </View>
          <View style={[styles.impactBarBg, { backgroundColor: colors.backgroundTertiary }]}>
            <View style={[styles.impactBarFill, { width: `${p.impactRating}%`, backgroundColor: ACCENT_GOLD }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function SavedSimCard({ sim, colors, expanded, onToggle }: { sim: SavedSimulation; colors: typeof Colors.light; expanded: boolean; onToggle: () => void }) {
  const winColor = sim.winProbability >= 55 ? Brand.success : sim.winProbability >= 45 ? ACCENT_GOLD : Brand.error;
  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
    >
      <View style={styles.savedHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.savedTitle}>{sim.title}</ThemedText>
          <ThemedText style={[styles.savedMeta, { color: colors.textTertiary }]}>
            {sim.matchupText} • {sim.savedAt instanceof Date ? sim.savedAt.toLocaleDateString() : sim.savedAt}
          </ThemedText>
        </View>
        <View style={[styles.savedWinBadge, { backgroundColor: winColor + '20' }]}>
          <ThemedText style={[styles.savedWinText, { color: winColor }]}>{sim.winProbability}%</ThemedText>
        </View>
        <IconSymbol name={expanded ? 'chevron.down' : 'chevron.right'} size={14} color={colors.textTertiary} />
      </View>
      {expanded && (
        <View style={[styles.savedDetails, { borderTopColor: colors.border }]}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Score</ThemedText>
              <ThemedText style={styles.scoreValue}>
                {sim.projectedScore?.home ?? '—'} – {sim.projectedScore?.away ?? '—'}
              </ThemedText>
            </View>
            <View style={styles.scoreItem}>
              <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Margin</ThemedText>
              <ThemedText style={styles.scoreValue}>{formatMargin(sim.projectedMargin ?? 0)}</ThemedText>
            </View>
          </View>
          {sim.drivers && sim.drivers.map((d, i) => (
            <View key={i} style={styles.driverRow}>
              <View style={[styles.driverDot, { backgroundColor: Brand.precision }]} />
              <ThemedText style={[styles.driverText, { color: colors.textSecondary }]}>{d}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

export function SimulationContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expandedSim, setExpandedSim] = useState<string | null>(null);

  const nextGameSim = SAMPLE_SIMULATIONS[0];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Season Projection */}
      <SectionLabel title="SEASON PROJECTION" colors={colors} />
      <SeasonProjectionCard colors={colors} />

      {/* Next Game Sim */}
      {nextGameSim && (
        <>
          <SectionLabel title="NEXT GAME SIMULATION" colors={colors} />
          <NextGameSimCard sim={nextGameSim} colors={colors} />
        </>
      )}

      {/* Key Drivers */}
      {nextGameSim?.drivers && nextGameSim.drivers.length > 0 && (
        <>
          <SectionLabel title="KEY DRIVERS" colors={colors} />
          <DriversSection drivers={nextGameSim.drivers} colors={colors} />
        </>
      )}

      {/* Player Impact */}
      {nextGameSim?.playerImpact && nextGameSim.playerImpact.length > 0 && (
        <>
          <SectionLabel title="PLAYER IMPACT" colors={colors} />
          <PlayerImpactTable players={nextGameSim.playerImpact} colors={colors} />
        </>
      )}

      {/* Saved Simulations */}
      {SAVED_SIMULATIONS.length > 0 && (
        <>
          <SectionLabel title="SAVED SIMULATIONS" colors={colors} />
          {SAVED_SIMULATIONS.map((sim) => (
            <SavedSimCard
              key={sim.id}
              sim={sim}
              colors={colors}
              expanded={expandedSim === sim.id}
              onToggle={() => setExpandedSim(expandedSim === sim.id ? null : sim.id)}
            />
          ))}
        </>
      )}

      {/* Ask Nexus */}
      <AskNexusCTA label="Run New Simulation" engineContext="simulation" />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

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

  // Season Projection
  projRow: { flexDirection: 'row', alignItems: 'center' },
  projItem: { flex: 1, alignItems: 'center' },
  projValue: { fontSize: 18, fontWeight: '700' },
  projLabel: { fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  projDivider: { width: 1, height: 32 },
  projFooter: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  projFooterText: { fontSize: 12, textAlign: 'center' },

  // Next Game Sim
  simMatchup: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  winProbRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  winProbValue: { fontSize: 24, fontWeight: '800', width: 56 },
  winProbBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  winProbBarFill: { height: '100%', borderRadius: 4 },
  scoreRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  scoreItem: {},
  scoreLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  scoreValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  volatilityRow: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  volatilityText: { fontSize: 12 },

  // Drivers
  driverRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  driverDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, marginRight: 10 },
  driverText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Player Impact
  impactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  impactInfo: { flex: 1 },
  impactName: { fontSize: 14, fontWeight: '600' },
  impactPos: { fontSize: 11, marginTop: 1 },
  impactStats: { flexDirection: 'row', gap: 8, marginRight: Spacing.sm },
  impactStat: { fontSize: 12, fontWeight: '500' },
  impactBarBg: { width: 60, height: 6, borderRadius: 3, overflow: 'hidden' },
  impactBarFill: { height: '100%', borderRadius: 3 },

  // Saved Sims
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  savedTitle: { fontSize: 15, fontWeight: '600' },
  savedMeta: { fontSize: 12, marginTop: 2 },
  savedWinBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  savedWinText: { fontSize: 13, fontWeight: '800' },
  savedDetails: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm, paddingTop: Spacing.sm },
});
