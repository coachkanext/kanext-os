/**
 * SimHome — Simulation v2 dashboard view.
 * Season projection, next game sim, recent runs, saved sims.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AskNexusCTA } from '@/components/ui/ask-nexus-cta';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  SAMPLE_SIMULATIONS,
  SAVED_SIMULATIONS,
  RECENT_SIM_RUNS,
  SEASON_SIM,
  CONFERENCE_POSTSEASON,
  SIM_TYPE_CARDS,
  formatMargin,
} from '@/data/mock-simulations';
import { SEASON_PROJECTION } from '@/data/stats/projections';
import type { SimRun } from '@/components/simulation/simulation-types';

const ACCENT = '#FFFFFF';

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
// Season Projection Card (same as SimulationContent)
// ---------------------------------------------------------------------------

function SeasonProjectionCard({ colors }: { colors: typeof Colors.light }) {
  const proj = SEASON_PROJECTION;
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.projRow}>
        <View style={styles.projItem}>
          <ThemedText style={[styles.projValue, { color: ACCENT }]}>{proj.projectedTotal}</ThemedText>
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
          Current: {proj.currentRecord} &middot; {proj.gamesRemaining} games remaining &middot; {proj.simConfidence}% confidence
        </ThemedText>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Next Game Card
// ---------------------------------------------------------------------------

function NextGameCard({ colors }: { colors: typeof Colors.light }) {
  const sim = SAMPLE_SIMULATIONS[0];
  if (!sim) return null;

  const winColor = sim.winProbability >= 55 ? Brand.success : sim.winProbability >= 45 ? ACCENT : Brand.error;

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
            {sim.confidence === 'high' ? 'High' : sim.confidence === 'medium' ? 'Medium' : 'Low'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Recent Run Card
// ---------------------------------------------------------------------------

function getSimTypeBadge(simType: string): { label: string; color: string } {
  const card = SIM_TYPE_CARDS.find((c) => c.id === simType);
  return card ? { label: card.name, color: card.color } : { label: simType, color: ACCENT };
}

function RecentRunCard({ run, colors }: { run: SimRun; colors: typeof Colors.light }) {
  const badge = getSimTypeBadge(run.simType);
  const winColor = run.winProbability >= 55 ? Brand.success : run.winProbability >= 45 ? ACCENT : Brand.error;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.runHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.runTitle}>{run.title}</ThemedText>
          <View style={styles.runMeta}>
            <View style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
              <ThemedText style={[styles.badgeText, { color: badge.color }]}>{badge.label}</ThemedText>
            </View>
            <ThemedText style={[styles.runTimestamp, { color: colors.textTertiary }]}>
              {run.timestamp instanceof Date ? run.timestamp.toLocaleDateString() : run.timestamp}
            </ThemedText>
          </View>
        </View>
        <View style={styles.runStats}>
          <ThemedText style={[styles.runWin, { color: winColor }]}>{run.winProbability}%</ThemedText>
          <ThemedText style={[styles.runConfidence, { color: colors.textTertiary }]}>
            {run.confidence}% conf
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Saved Sim Card (expandable)
// ---------------------------------------------------------------------------

function SavedSimCard({
  run,
  colors,
  expanded,
  onToggle,
}: {
  run: SimRun;
  colors: typeof Colors.light;
  expanded: boolean;
  onToggle: () => void;
}) {
  const badge = getSimTypeBadge(run.simType);
  const winColor = run.winProbability >= 55 ? Brand.success : run.winProbability >= 45 ? ACCENT : Brand.error;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
    >
      <View style={styles.savedHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.savedTitle}>{run.title}</ThemedText>
          <ThemedText style={[styles.savedMeta, { color: colors.textTertiary }]}>
            {run.timestamp instanceof Date ? run.timestamp.toLocaleDateString() : run.timestamp}
          </ThemedText>
        </View>
        <View style={[styles.savedWinBadge, { backgroundColor: winColor + '20' }]}>
          <ThemedText style={[styles.savedWinText, { color: winColor }]}>{run.winProbability}%</ThemedText>
        </View>
        <IconSymbol name={expanded ? 'chevron.down' : 'chevron.right'} size={14} color={colors.textTertiary} />
      </View>

      {expanded && (
        <View style={[styles.savedDetails, { borderTopColor: colors.border }]}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Score</ThemedText>
              <ThemedText style={styles.scoreValue}>
                {run.projectedScore.home} – {run.projectedScore.away}
              </ThemedText>
            </View>
            <View style={styles.scoreItem}>
              <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Margin</ThemedText>
              <ThemedText style={[styles.scoreValue, { color: run.projectedMargin > 0 ? Brand.success : Brand.error }]}>
                {formatMargin(run.projectedMargin)}
              </ThemedText>
            </View>
            <View style={styles.scoreItem}>
              <ThemedText style={[styles.scoreLabel, { color: colors.textTertiary }]}>Confidence</ThemedText>
              <ThemedText style={[styles.scoreValue, { color: Brand.precision }]}>{run.confidence}%</ThemedText>
            </View>
          </View>

          {run.drivers.length > 0 && (
            <View style={{ marginTop: Spacing.sm }}>
              {run.drivers.map((d, i) => (
                <View key={i} style={styles.driverRow}>
                  <View style={[styles.driverDot, { backgroundColor: Brand.precision }]} />
                  <ThemedText style={[styles.driverText, { color: colors.textSecondary }]}>{d}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// SimHome (main export)
// ---------------------------------------------------------------------------

export function SimHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expandedSaved, setExpandedSaved] = useState<string | null>(null);

  const savedRuns = RECENT_SIM_RUNS.filter((r) => r.isSaved);

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
      <SectionLabel title="NEXT GAME SIMULATION" colors={colors} />
      <NextGameCard colors={colors} />

      {/* Recent Runs */}
      <SectionLabel title="RECENT RUNS" colors={colors} />
      {RECENT_SIM_RUNS.map((run) => (
        <RecentRunCard key={run.id} run={run} colors={colors} />
      ))}

      {/* Saved */}
      {savedRuns.length > 0 && (
        <>
          <SectionLabel title="SAVED" colors={colors} />
          {savedRuns.map((run) => (
            <SavedSimCard
              key={run.id}
              run={run}
              colors={colors}
              expanded={expandedSaved === run.id}
              onToggle={() => setExpandedSaved(expandedSaved === run.id ? null : run.id)}
            />
          ))}
        </>
      )}

      {/* Ask Nexus CTA */}
      <AskNexusCTA label="Run New Simulation" engineContext="simulation" />

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

  // Season Projection
  projRow: { flexDirection: 'row', alignItems: 'center' },
  projItem: { flex: 1, alignItems: 'center' },
  projValue: { fontSize: 18, fontWeight: '700' },
  projLabel: { fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  projDivider: { width: 1, height: 32 },
  projFooter: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  projFooterText: { fontSize: 12, textAlign: 'center' },

  // Next Game
  simMatchup: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  winProbRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  winProbValue: { fontSize: 24, fontWeight: '800', width: 56 },
  winProbBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  winProbBarFill: { height: '100%', borderRadius: 4 },
  scoreRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  scoreItem: {},
  scoreLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  scoreValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },

  // Recent Runs
  runHeader: { flexDirection: 'row', alignItems: 'center' },
  runTitle: { fontSize: 15, fontWeight: '600' },
  runMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 11, fontWeight: '700' },
  runTimestamp: { fontSize: 11 },
  runStats: { alignItems: 'flex-end' },
  runWin: { fontSize: 18, fontWeight: '800' },
  runConfidence: { fontSize: 11, marginTop: 2 },

  // Saved
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  savedTitle: { fontSize: 15, fontWeight: '600' },
  savedMeta: { fontSize: 12, marginTop: 2 },
  savedWinBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  savedWinText: { fontSize: 13, fontWeight: '800' },
  savedDetails: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm, paddingTop: Spacing.sm },

  // Drivers
  driverRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  driverDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, marginRight: 10 },
  driverText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
