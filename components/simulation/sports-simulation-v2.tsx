/**
 * Sports Simulation V2 — Full Simulation OS
 * Pill tabs: Overview, Box Score, Drivers, Traces, Saved Runs
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  SIM_RUN_TYPES,
  CONFIDENCE_GATE,
  MOCK_SINGLE_GAME,
  MOCK_BOX_SCORE_A,
  MOCK_DRIVERS,
  MOCK_TRACES,
  SAVED_SIM_RUNS,
  MOCK_CONSTRAINTS,
  type BoxScorePlayerLine,
  type SimDriver,
  type InteractionTrace,
  type SimRun,
} from '@/data/mock-simulation-v2';

const PILLS = ['Overview', 'Box Score', 'Drivers', 'Traces', 'Saved Runs'] as const;
type PillTab = (typeof PILLS)[number];

export function SportsSimulationV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.sports.primary;
  const [activeTab, setActiveTab] = useState<PillTab>('Overview');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable key={pill} style={[styles.pill, activeTab === pill && { backgroundColor: accent }]} onPress={() => setActiveTab(pill)}>
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#fff' : colors.textSecondary }]}>{pill}</ThemedText>
          </Pressable>
        ))}
      </View>

      {activeTab === 'Overview' && <OverviewView colors={colors} accent={accent} />}
      {activeTab === 'Box Score' && <BoxScoreView colors={colors} accent={accent} />}
      {activeTab === 'Drivers' && <DriversView colors={colors} accent={accent} />}
      {activeTab === 'Traces' && <TracesView colors={colors} accent={accent} />}
      {activeTab === 'Saved Runs' && <SavedRunsView colors={colors} accent={accent} />}
    </View>
  );
}

function OverviewView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const sg = MOCK_SINGLE_GAME;
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Matchup Header */}
      <View style={[styles.matchupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.matchupTitle, { color: colors.text }]}>{sg.team_a} vs {sg.team_b}</ThemedText>
        <ThemedText style={[styles.matchupMeta, { color: colors.textSecondary }]}>{sg.environment.toUpperCase()} · {sg.sim_version} · {sg.sim_confidence_pct}% confidence</ThemedText>
      </View>

      {/* Win Probability */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>WIN PROBABILITY</ThemedText>
      <View style={styles.rangeRow}>
        <RangeChip label="Low" value={`${sg.win_pct.low}%`} color="#EF4444" colors={colors} />
        <RangeChip label="Mid" value={`${sg.win_pct.mid}%`} color="#22C55E" colors={colors} />
        <RangeChip label="High" value={`${sg.win_pct.high}%`} color={accent} colors={colors} />
      </View>

      {/* Projected Margin */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PROJECTED MARGIN</ThemedText>
      <View style={styles.rangeRow}>
        <RangeChip label="Low" value={`+${sg.margin.low}`} color="#F59E0B" colors={colors} />
        <RangeChip label="Mid" value={`+${sg.margin.mid}`} color="#22C55E" colors={colors} />
        <RangeChip label="High" value={`+${sg.margin.high}`} color={accent} colors={colors} />
      </View>

      {/* Five Factors */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>FIVE FACTORS</ThemedText>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.tableHeader}>
          <ThemedText style={[styles.thText, { flex: 0.4, color: colors.textSecondary }]}>Factor</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>FMU</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>OPP</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>Adv</ThemedText>
        </View>
        {sg.five_factors.map((f) => (
          <View key={f.factor} style={styles.tableRow}>
            <ThemedText style={[styles.tdText, { flex: 0.4, color: colors.text }]}>{f.factor}</ThemedText>
            <ThemedText style={[styles.tdText, { flex: 0.2, textAlign: 'center', color: colors.text }]}>{f.team_a}</ThemedText>
            <ThemedText style={[styles.tdText, { flex: 0.2, textAlign: 'center', color: colors.text }]}>{f.team_b}</ThemedText>
            <ThemedText style={[styles.tdText, { flex: 0.2, textAlign: 'center', color: f.advantage === 'A' ? '#22C55E' : f.advantage === 'B' ? '#EF4444' : '#F59E0B', fontWeight: '700' }]}>{f.advantage === 'A' ? 'FMU' : f.advantage === 'B' ? 'OPP' : 'EVEN'}</ThemedText>
          </View>
        ))}
      </View>

      {/* Confidence Gate */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>CONFIDENCE GATE</ThemedText>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {CONFIDENCE_GATE.map((row) => (
          <View key={row.tier} style={[styles.gateRow, sg.sim_version === 'V2' && row.tier.startsWith('V2') && { backgroundColor: accent + '12' }]}>
            <ThemedText style={[styles.gateLabel, { color: colors.text }]}>{row.label}</ThemedText>
            <ThemedText style={[styles.gateRange, { color: colors.textSecondary }]}>{row.minPct}–{row.maxPct}%</ThemedText>
          </View>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function BoxScoreView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PROJECTED BOX SCORE — FMU</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.boxTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.boxHeader}>
            {['Player', 'Pos', 'Min', 'Pts', 'FG', '3PT', 'Reb', 'Ast', 'TO', 'Stl', 'Blk'].map((h) => (
              <ThemedText key={h} style={[styles.boxHeaderText, { color: colors.textSecondary, width: h === 'Player' ? 90 : h === 'FG' || h === '3PT' ? 50 : 36 }]}>{h}</ThemedText>
            ))}
          </View>
          {MOCK_BOX_SCORE_A.map((p) => (
            <View key={p.name} style={styles.boxRow}>
              <ThemedText style={[styles.boxCell, { width: 90, color: colors.text, fontWeight: '600' }]}>{p.name}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 36, color: colors.textSecondary }]}>{p.position}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 36, color: colors.text }]}>{p.minutes}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 36, color: accent, fontWeight: '700' }]}>{p.points}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 50, color: colors.text }]}>{p.fg}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 50, color: colors.text }]}>{p.three_pt}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 36, color: colors.text }]}>{p.rebounds}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 36, color: colors.text }]}>{p.assists}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 36, color: colors.text }]}>{p.turnovers}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 36, color: colors.text }]}>{p.steals}</ThemedText>
              <ThemedText style={[styles.boxCell, { width: 36, color: colors.text }]}>{p.blocks}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Constraints */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>CONSTRAINTS</ThemedText>
      {MOCK_CONSTRAINTS.minutes_constraints.map((c, i) => (
        <View key={i} style={[styles.constraintRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.constraintName, { color: colors.text }]}>{c.playerName}</ThemedText>
          <ThemedText style={[styles.constraintRange, { color: accent }]}>{c.minMinutes}–{c.maxMinutes} min</ThemedText>
          <ThemedText style={[styles.constraintNote, { color: colors.textSecondary }]}>{c.note}</ThemedText>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function DriversView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>TOP DRIVERS</ThemedText>
      {MOCK_DRIVERS.map((d) => (
        <View key={d.rank} style={[styles.driverCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.driverHeader}>
            <View style={[styles.rankBadge, { backgroundColor: accent + '22' }]}>
              <ThemedText style={[styles.rankText, { color: accent }]}>#{d.rank}</ThemedText>
            </View>
            <ThemedText style={[styles.driverTitle, { color: colors.text }]}>{d.driver}</ThemedText>
            <View style={[styles.impactBadge, { backgroundColor: d.impact_direction === 'positive' ? '#22C55E22' : '#EF444422' }]}>
              <ThemedText style={[styles.impactText, { color: d.impact_direction === 'positive' ? '#22C55E' : '#EF4444' }]}>
                {d.impact_direction === 'positive' ? '+' : '−'}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.driverExplanation, { color: colors.textSecondary }]}>{d.explanation}</ThemedText>
        </View>
      ))}

      {/* What-If Toggles */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>WHAT-IF TOGGLES</ThemedText>
      {MOCK_CONSTRAINTS.what_if_toggles.map((t) => (
        <View key={t.id} style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>{t.label}</ThemedText>
          <View style={[styles.toggleIndicator, { backgroundColor: t.enabled ? '#22C55E' : '#8F8F8F' }]}>
            <ThemedText style={styles.toggleText}>{t.enabled ? 'ON' : 'OFF'}</ThemedText>
          </View>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function TracesView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>INTERACTION TRACES</ThemedText>
      {MOCK_TRACES.map((trace) => (
        <View key={trace.id} style={[styles.traceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.traceHeader}>
            <View style={[styles.stepBadge, { backgroundColor: accent + '22' }]}>
              <ThemedText style={[styles.stepText, { color: accent }]}>Step {trace.step_order}</ThemedText>
            </View>
            <ThemedText style={[styles.traceKey, { color: colors.text }]}>{trace.key}</ThemedText>
          </View>
          <ThemedText style={[styles.traceSource, { color: colors.textSecondary }]}>{trace.source_doc}</ThemedText>
          <View style={styles.traceDeltaRow}>
            <ThemedText style={[styles.traceDeltaLabel, { color: colors.textSecondary }]}>Raw: </ThemedText>
            <ThemedText style={[styles.traceDelta, { color: trace.raw_delta > 0 ? '#22C55E' : '#EF4444' }]}>{trace.raw_delta > 0 ? '+' : ''}{trace.raw_delta}</ThemedText>
            <ThemedText style={[styles.traceDeltaLabel, { color: colors.textSecondary }]}>  Bounded: </ThemedText>
            <ThemedText style={[styles.traceDelta, { color: trace.bounded_delta > 0 ? '#22C55E' : '#EF4444' }]}>{trace.bounded_delta > 0 ? '+' : ''}{trace.bounded_delta}</ThemedText>
          </View>
          <View style={styles.traceTargets}>
            {trace.targets_modified.map((t) => (
              <View key={t} style={[styles.targetChip, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.targetText, { color: colors.textSecondary }]}>{t}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function SavedRunsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>RUN TYPES</ThemedText>
      <View style={styles.runTypesGrid}>
        {SIM_RUN_TYPES.map((rt) => (
          <Pressable key={rt.id} style={[styles.runTypeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={rt.icon as any} size={20} color={accent} />
            <ThemedText style={[styles.runTypeLabel, { color: colors.text }]}>{rt.label}</ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>SAVED RUNS</ThemedText>
      {SAVED_SIM_RUNS.map((run) => (
        <View key={run.id} style={[styles.savedRunCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.savedRunHeader}>
            <ThemedText style={[styles.savedRunLabel, { color: colors.text }]}>{run.label}</ThemedText>
            {run.locked && (
              <IconSymbol name="lock.fill" size={12} color="#22C55E" />
            )}
          </View>
          <View style={styles.savedRunMeta}>
            <ThemedText style={[styles.savedRunDetail, { color: colors.textSecondary }]}>{run.version} · {run.confidence}% conf</ThemedText>
            <ThemedText style={[styles.savedRunDetail, { color: '#22C55E' }]}>{run.win_pct}% win · +{run.margin}</ThemedText>
          </View>
          <ThemedText style={[styles.savedRunDate, { color: colors.textSecondary }]}>{run.created}</ThemedText>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function RangeChip({ label, value, color, colors }: { label: string; value: string; color: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.rangeChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.rangeValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.rangeLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  pillBar: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText: { fontSize: 13, fontWeight: '600' },

  sectionTitle: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  matchupCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  matchupTitle: { fontSize: 18, fontWeight: '800' },
  matchupMeta: { fontSize: 11, marginTop: 4 },

  rangeRow: { flexDirection: 'row', gap: 8 },
  rangeChip: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1 },
  rangeValue: { fontSize: 20, fontWeight: '800' },
  rangeLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  tableCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  thText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8 },
  tdText: { fontSize: 13 },

  gateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  gateLabel: { fontSize: 13, fontWeight: '600' },
  gateRange: { fontSize: 12 },

  boxTable: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', minWidth: 520 },
  boxHeader: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  boxHeaderText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  boxRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6 },
  boxCell: { fontSize: 12 },

  constraintRow: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  constraintName: { fontSize: 14, fontWeight: '700' },
  constraintRange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  constraintNote: { fontSize: 11, marginTop: 2 },

  driverCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  driverHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rankText: { fontSize: 12, fontWeight: '800' },
  driverTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  impactBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  impactText: { fontSize: 14, fontWeight: '800' },
  driverExplanation: { fontSize: 12, marginTop: 8, lineHeight: 18 },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  toggleLabel: { fontSize: 13, fontWeight: '600' },
  toggleIndicator: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  toggleText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  traceCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  traceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  stepBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stepText: { fontSize: 10, fontWeight: '700' },
  traceKey: { fontSize: 14, fontWeight: '700', flex: 1 },
  traceSource: { fontSize: 11, marginBottom: 6 },
  traceDeltaRow: { flexDirection: 'row', alignItems: 'center' },
  traceDeltaLabel: { fontSize: 11 },
  traceDelta: { fontSize: 13, fontWeight: '700' },
  traceTargets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  targetChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  targetText: { fontSize: 10, fontWeight: '600' },

  runTypesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  runTypeCard: { width: '47%', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, gap: 6 },
  runTypeLabel: { fontSize: 12, fontWeight: '600' },

  savedRunCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  savedRunHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savedRunLabel: { fontSize: 14, fontWeight: '700', flex: 1 },
  savedRunMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  savedRunDetail: { fontSize: 12 },
  savedRunDate: { fontSize: 10, marginTop: 4 },
});
