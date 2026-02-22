/**
 * Sports Simulation V2 — Full Simulation OS (6 RBAC-gated tabs)
 * Tabs: Overview, System×System, Possession Engine, Matchup Interactions, Box Score Projection, Scenarios
 * Opponent selector at top — all tabs re-render when opponent changes.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMembershipId } from '@/context/app-context';
import { getSportsRole, getSimulationHubTabs, getKRVisibility, type SimulationTab } from '@/utils/sports-rbac';

import {
  SIM_RUN_TYPES,
  CONFIDENCE_GATE,
  MOCK_SINGLE_GAME,
  MOCK_BOX_SCORE_A,
  MOCK_DRIVERS,
  MOCK_TRACES,
  SAVED_SIM_RUNS_ALL,
  MOCK_CONSTRAINTS,
  MOCK_KEISER_GAME,
  MOCK_BOX_SCORE_KEISER_KaNeXT,
  MOCK_BOX_SCORE_KEISER_OPP,
  MOCK_KEISER_DRIVERS,
  MOCK_KEISER_TRACES,
  MOCK_SEASON_PROJECTION,
  MOCK_TRANSFER_PORTAL_IMPACT,
  type SingleGameOutput,
  type BoxScorePlayerLine,
  type SimDriver,
  type InteractionTrace,
} from '@/data/mock-simulation-v2';

const accent = useAccentColor();

// ---------------------------------------------------------------------------
// Simulation Context — one per available opponent sim
// ---------------------------------------------------------------------------

interface SimContext {
  id: string;
  label: string;
  game: SingleGameOutput;
  boxFMU: BoxScorePlayerLine[];
  boxOpp: BoxScorePlayerLine[] | null;
  drivers: SimDriver[];
  traces: InteractionTrace[];
  fmuOffense: string;
  fmuDefense: string;
  oppOffense: string;
  oppDefense: string;
}

const SIM_CONTEXTS: SimContext[] = [
  {
    id: 'lincoln',
    label: 'vs MSU-Northern (PA)',
    game: MOCK_SINGLE_GAME,
    boxFMU: MOCK_BOX_SCORE_A,
    boxOpp: null,
    drivers: MOCK_DRIVERS,
    traces: MOCK_TRACES,
    fmuOffense: 'Motion Read & React',
    fmuDefense: 'Pack Line',
    oppOffense: 'Spread Pick & Roll',
    oppDefense: 'Containment Man',
  },
  {
    id: 'keiser',
    label: 'vs University of Providence',
    game: MOCK_KEISER_GAME,
    boxFMU: MOCK_BOX_SCORE_KEISER_KaNeXT,
    boxOpp: MOCK_BOX_SCORE_KEISER_OPP,
    drivers: MOCK_KEISER_DRIVERS,
    traces: MOCK_KEISER_TRACES,
    fmuOffense: 'Motion Read & React',
    fmuDefense: 'Pack Line',
    oppOffense: 'Spread Pick & Roll',
    oppDefense: 'Drop PnR Coverage',
  },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SportsSimulationV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.sports.primary;
  const membershipId = useMembershipId();
  const role = getSportsRole(membershipId);
  const krVis = getKRVisibility(role);
  const tabs = useMemo(() => getSimulationHubTabs(role), [role]);
  const [activeTab, setActiveTab] = useState<SimulationTab>(tabs[0]?.key ?? 'overview');

  // Opponent selector
  const [ctxIndex, setCtxIndex] = useState(0);
  const ctx = SIM_CONTEXTS[ctxIndex] ?? SIM_CONTEXTS[0];
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Opponent Selector */}
      <View style={styles.selectorRow}>
        <Pressable
          style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setDropOpen(!dropOpen)}
        >
          <Text style={[styles.selectorText, { color: colors.text }]}>{ctx.label}</Text>
          <IconSymbol name="chevron.down" size={12} color={colors.textSecondary} />
        </Pressable>
        <View style={[styles.versionBadge, { backgroundColor: accent + '22' }]}>
          <Text style={[styles.versionText, { color: accent }]}>{ctx.game.sim_version} · {ctx.game.sim_confidence_pct}%</Text>
        </View>
      </View>
      {dropOpen && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SIM_CONTEXTS.map((sc, i) => (
            <Pressable
              key={sc.id}
              style={[styles.dropdownItem, i === ctxIndex && { backgroundColor: accent + '18' }]}
              onPress={() => { setCtxIndex(i); setDropOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>{sc.label}</Text>
              <Text style={[styles.dropdownItemMeta, { color: colors.textSecondary }]}>{sc.game.sim_version} · {sc.game.sim_confidence_pct}% conf</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Pill Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillBar}>
        {tabs.map((t) => (
          <Pressable key={t.key} style={[styles.pill, activeTab === t.key && { backgroundColor: accent }]} onPress={() => setActiveTab(t.key)}>
            <Text style={[styles.pillText, { color: activeTab === t.key ? '#000' : colors.textSecondary }]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab ctx={ctx} colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'system_x_system' && <SystemTab ctx={ctx} colors={colors} accent={accent} />}
      {activeTab === 'possession_engine' && <PossessionTab ctx={ctx} colors={colors} accent={accent} />}
      {activeTab === 'matchup_interactions' && <MatchupTab ctx={ctx} colors={colors} accent={accent} krVis={krVis} />}
      {activeTab === 'box_score_projection' && <BoxScoreTab ctx={ctx} colors={colors} accent={accent} />}
      {activeTab === 'scenarios' && <ScenariosTab ctx={ctx} colors={colors} accent={accent} />}
    </View>
  );
}

type TabProps = { ctx: SimContext; colors: typeof Colors.light; accent: string; krVis?: string };

// ---------------------------------------------------------------------------
// Tab 1: Overview
// ---------------------------------------------------------------------------

function OverviewTab({ ctx, colors, accent, krVis }: TabProps) {
  const sg = ctx.game;
  const positiveDrivers = ctx.drivers.filter((d) => d.impact_direction === 'positive').slice(0, 3);
  const risks = ctx.drivers.filter((d) => d.impact_direction === 'negative').slice(0, 3);

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
        <RangeChip label="Base" value={`${sg.win_pct.mid}%`} color="#22C55E" colors={colors} />
        <RangeChip label="High" value={`${sg.win_pct.high}%`} color={accent} colors={colors} />
      </View>

      {/* Projected Score / Pace */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PROJECTED MARGIN & PACE</ThemedText>
      <View style={styles.rangeRow}>
        <RangeChip label="Margin Low" value={`${sg.margin.low > 0 ? '+' : ''}${sg.margin.low}`} color="#F59E0B" colors={colors} />
        <RangeChip label="Margin Mid" value={`+${sg.margin.mid}`} color="#22C55E" colors={colors} />
        <RangeChip label="Pace" value={`${sg.projected_pace}`} color={accent} colors={colors} />
      </View>

      {/* Five Factors */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>FIVE-FACTOR PROJECTION</ThemedText>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.tableHeader}>
          <ThemedText style={[styles.thText, { flex: 0.4, color: colors.textSecondary }]}>Factor</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>KXT</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>OPP</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>Adv</ThemedText>
        </View>
        {sg.five_factors.map((f) => (
          <View key={f.factor} style={styles.tableRow}>
            <ThemedText style={[styles.tdText, { flex: 0.4, color: colors.text }]}>{f.factor}</ThemedText>
            <ThemedText style={[styles.tdText, { flex: 0.2, textAlign: 'center', color: colors.text }]}>{f.team_a}</ThemedText>
            <ThemedText style={[styles.tdText, { flex: 0.2, textAlign: 'center', color: colors.text }]}>{f.team_b}</ThemedText>
            <ThemedText style={[styles.tdText, { flex: 0.2, textAlign: 'center', color: f.advantage === 'A' ? '#22C55E' : f.advantage === 'B' ? '#EF4444' : '#F59E0B', fontWeight: '700' }]}>
              {f.advantage === 'A' ? 'Carroll' : f.advantage === 'B' ? 'OPP' : 'EVEN'}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Top 3 Drivers */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>TOP DRIVERS</ThemedText>
      {positiveDrivers.map((d) => (
        <View key={d.rank} style={[styles.driverRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.driverDot, { backgroundColor: '#22C55E' }]} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.driverLabel, { color: colors.text }]}>{d.driver}</ThemedText>
            <ThemedText style={[styles.driverNote, { color: colors.textSecondary }]}>{d.explanation}</ThemedText>
          </View>
        </View>
      ))}

      {/* Top 3 Risks */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>KEY RISKS</ThemedText>
      {risks.map((d) => (
        <View key={d.rank} style={[styles.driverRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.driverDot, { backgroundColor: '#EF4444' }]} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.driverLabel, { color: colors.text }]}>{d.driver}</ThemedText>
            <ThemedText style={[styles.driverNote, { color: colors.textSecondary }]}>{d.explanation}</ThemedText>
          </View>
        </View>
      ))}

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

// ---------------------------------------------------------------------------
// Tab 2: System × System
// ---------------------------------------------------------------------------

function SystemTab({ ctx, colors, accent }: TabProps) {
  const [swapSystems, setSwapSystems] = useState(false);

  const fmuOff = swapSystems ? 'Zone Motion' : ctx.fmuOffense;
  const fmuDef = swapSystems ? 'Switch Everything' : ctx.fmuDefense;

  // Traces related to offense vs defense
  const offTraces = ctx.traces.filter((_, i) => i % 2 === 0);
  const defTraces = ctx.traces.filter((_, i) => i % 2 === 1);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* KaNeXT Offense vs Opponent Defense */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>CARROLL OFFENSE vs OPP DEFENSE</ThemedText>
      <View style={[styles.systemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.systemVsRow}>
          <View style={styles.systemSide}>
            <ThemedText style={[styles.systemTeam, { color: accent }]}>KXT</ThemedText>
            <ThemedText style={[styles.systemLabel, { color: colors.text }]}>{fmuOff}</ThemedText>
          </View>
          <ThemedText style={[styles.vsText, { color: colors.textSecondary }]}>vs</ThemedText>
          <View style={styles.systemSide}>
            <ThemedText style={[styles.systemTeam, { color: '#EF4444' }]}>OPP</ThemedText>
            <ThemedText style={[styles.systemLabel, { color: colors.text }]}>{ctx.oppDefense}</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.systemInteraction, { color: colors.textSecondary }]}>
          Interaction: {fmuOff} creates spacing advantages against {ctx.oppDefense}
        </ThemedText>
        {offTraces.slice(0, 2).map((t) => (
          <View key={t.id} style={styles.miniTraceRow}>
            <ThemedText style={[styles.miniTraceKey, { color: colors.text }]}>{t.key}</ThemedText>
            <ThemedText style={[styles.miniTraceDelta, { color: t.bounded_delta > 0 ? '#22C55E' : '#EF4444' }]}>
              {t.bounded_delta > 0 ? '+' : ''}{t.bounded_delta}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Opponent Offense vs KaNeXT Defense */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>OPP OFFENSE vs CARROLL DEFENSE</ThemedText>
      <View style={[styles.systemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.systemVsRow}>
          <View style={styles.systemSide}>
            <ThemedText style={[styles.systemTeam, { color: '#EF4444' }]}>OPP</ThemedText>
            <ThemedText style={[styles.systemLabel, { color: colors.text }]}>{ctx.oppOffense}</ThemedText>
          </View>
          <ThemedText style={[styles.vsText, { color: colors.textSecondary }]}>vs</ThemedText>
          <View style={styles.systemSide}>
            <ThemedText style={[styles.systemTeam, { color: accent }]}>KXT</ThemedText>
            <ThemedText style={[styles.systemLabel, { color: colors.text }]}>{fmuDef}</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.systemInteraction, { color: colors.textSecondary }]}>
          Interaction: {fmuDef} disrupts {ctx.oppOffense} flow patterns
        </ThemedText>
        {defTraces.slice(0, 2).map((t) => (
          <View key={t.id} style={styles.miniTraceRow}>
            <ThemedText style={[styles.miniTraceKey, { color: colors.text }]}>{t.key}</ThemedText>
            <ThemedText style={[styles.miniTraceDelta, { color: t.bounded_delta > 0 ? '#22C55E' : '#EF4444' }]}>
              {t.bounded_delta > 0 ? '+' : ''}{t.bounded_delta}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* System Swap Tool */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>SYSTEM SWAP TOOL</ThemedText>
      <View style={[styles.swapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.swapDesc, { color: colors.textSecondary }]}>
          Test alternative Carroll systems against the opponent
        </ThemedText>
        <Pressable
          style={[styles.swapBtn, { backgroundColor: swapSystems ? '#EF4444' + '22' : accent + '22' }]}
          onPress={() => setSwapSystems(!swapSystems)}
        >
          <Text style={[styles.swapBtnText, { color: swapSystems ? '#EF4444' : accent }]}>
            {swapSystems ? 'Reset to Default' : 'Try: Zone Motion + Switch'}
          </Text>
        </Pressable>
        {swapSystems && (
          <ThemedText style={[styles.swapNote, { color: '#F59E0B' }]}>
            Projected win% change: -3.2% (Zone Motion less effective vs {ctx.oppDefense})
          </ThemedText>
        )}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Possession Engine
// ---------------------------------------------------------------------------

function PossessionTab({ ctx, colors, accent }: TabProps) {
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);

  // Mock outcome distribution
  const outcomes = [
    { label: 'Carroll Win (Comfortable)', pct: 32, color: '#22C55E' },
    { label: 'Carroll Win (Close)', pct: 26, color: '#22C55E' },
    { label: 'Toss-Up', pct: 14, color: '#F59E0B' },
    { label: 'OPP Win (Close)', pct: 18, color: '#EF4444' },
    { label: 'OPP Win (Comfortable)', pct: 10, color: '#EF4444' },
  ];

  // Mock possession sample
  const possessions = [
    { id: 'p1', action: 'PnR (Williams)', result: 'Pull-up mid-range — Make', pts: 2, ppp: 1.12 },
    { id: 'p2', action: 'Spot-up 3 (Plantey)', result: 'Catch-and-shoot 3 — Miss', pts: 0, ppp: 0.0 },
    { id: 'p3', action: 'Post-up (Carter)', result: 'Hook shot — Make + And-1', pts: 3, ppp: 1.5 },
    { id: 'p4', action: 'Transition', result: 'Fast break layup — Make', pts: 2, ppp: 1.33 },
    { id: 'p5', action: 'PnR (Williams)', result: 'Kick to Quinn corner 3 — Make', pts: 3, ppp: 1.28 },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Outcome Distribution */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>OUTCOME DISTRIBUTION (1,000 SIMS)</ThemedText>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {outcomes.map((o) => (
          <View key={o.label} style={styles.outcomeRow}>
            <ThemedText style={[styles.outcomeLabel, { color: colors.text }]}>{o.label}</ThemedText>
            <View style={styles.outcomeBarBg}>
              <View style={[styles.outcomeBarFill, { width: `${o.pct}%`, backgroundColor: o.color }]} />
            </View>
            <ThemedText style={[styles.outcomePct, { color: colors.textSecondary }]}>{o.pct}%</ThemedText>
          </View>
        ))}
      </View>

      {/* Possession Sample */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>POSSESSION SAMPLE (5 OF 68)</ThemedText>
      {possessions.map((p) => (
        <View key={p.id} style={[styles.possessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.possessionHeader}>
            <ThemedText style={[styles.possessionAction, { color: colors.text }]}>{p.action}</ThemedText>
            <ThemedText style={[styles.possessionPts, { color: p.pts > 0 ? '#22C55E' : '#EF4444' }]}>{p.pts} pts</ThemedText>
          </View>
          <ThemedText style={[styles.possessionResult, { color: colors.textSecondary }]}>{p.result}</ThemedText>
          <ThemedText style={[styles.possessionPPP, { color: accent }]}>{p.ppp.toFixed(2)} PPP</ThemedText>
        </View>
      ))}

      {/* Trace Panel */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>INTERACTION TRACES</ThemedText>
      {ctx.traces.map((trace) => {
        const expanded = expandedTrace === trace.id;
        return (
          <Pressable
            key={trace.id}
            style={[styles.traceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setExpandedTrace(expanded ? null : trace.id)}
          >
            <View style={styles.traceHeader}>
              <View style={[styles.stepBadge, { backgroundColor: accent + '22' }]}>
                <ThemedText style={[styles.stepText, { color: accent }]}>Step {trace.step_order}</ThemedText>
              </View>
              <ThemedText style={[styles.traceKey, { color: colors.text }]}>{trace.key}</ThemedText>
              <ThemedText style={[styles.traceDeltaSmall, { color: trace.bounded_delta > 0 ? '#22C55E' : '#EF4444' }]}>
                {trace.bounded_delta > 0 ? '+' : ''}{trace.bounded_delta}
              </ThemedText>
            </View>
            {expanded && (
              <View style={styles.traceExpanded}>
                <ThemedText style={[styles.traceSource, { color: colors.textSecondary }]}>{trace.source_doc}</ThemedText>
                <View style={styles.traceDeltaRow}>
                  <ThemedText style={[styles.traceDeltaLabel, { color: colors.textSecondary }]}>Raw: </ThemedText>
                  <ThemedText style={[styles.traceDeltaVal, { color: trace.raw_delta > 0 ? '#22C55E' : '#EF4444' }]}>{trace.raw_delta > 0 ? '+' : ''}{trace.raw_delta}</ThemedText>
                  <ThemedText style={[styles.traceDeltaLabel, { color: colors.textSecondary }]}>  Bounded: </ThemedText>
                  <ThemedText style={[styles.traceDeltaVal, { color: trace.bounded_delta > 0 ? '#22C55E' : '#EF4444' }]}>{trace.bounded_delta > 0 ? '+' : ''}{trace.bounded_delta}</ThemedText>
                </View>
                <View style={styles.traceTargets}>
                  {trace.targets_modified.map((t) => (
                    <View key={t} style={[styles.targetChip, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.targetText, { color: colors.textSecondary }]}>{t}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Pressable>
        );
      })}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: Matchup Interactions
// ---------------------------------------------------------------------------

function MatchupTab({ ctx, colors, accent, krVis }: TabProps) {
  // Derive player matchup impact from box score data
  const players = ctx.boxKaNeXT.slice(0, 5); // starters

  // Mock archetype interactions
  const offArchetypes = [
    { archetype: 'Primary Ball Handler', system: ctx.fmuOffense, netImpact: 4.2, player: 'Williams' },
    { archetype: '3-and-D Wing', system: ctx.fmuOffense, netImpact: 2.1, player: 'Plantey' },
    { archetype: 'Rim Protector', system: ctx.fmuDefense, netImpact: 3.6, player: 'Carter' },
    { archetype: 'Stretch 4', system: ctx.fmuOffense, netImpact: 1.4, player: 'Diomande' },
    { archetype: 'Versatile Wing', system: ctx.fmuOffense, netImpact: 0.8, player: 'Quinn' },
  ];

  const defArchetypes = [
    { archetype: 'Pack Line Anchor', system: ctx.fmuDefense, netImpact: -3.8, player: 'Carter' },
    { archetype: 'Perimeter Pest', system: ctx.fmuDefense, netImpact: -2.4, player: 'Plantey' },
    { archetype: 'Help Defender', system: ctx.fmuDefense, netImpact: -1.9, player: 'Quinn' },
    { archetype: 'PnR Navigator', system: ctx.fmuDefense, netImpact: -1.2, player: 'Williams' },
    { archetype: 'Post Defender', system: ctx.fmuDefense, netImpact: -0.8, player: 'Diomande' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Offensive Archetype Interactions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>OFFENSIVE ARCHETYPE × SYSTEM</ThemedText>
      {offArchetypes.map((a, i) => (
        <View key={i} style={[styles.archetypeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.archetypeHeader}>
            <View>
              <ThemedText style={[styles.archetypeName, { color: colors.text }]}>{a.player}</ThemedText>
              <ThemedText style={[styles.archetypeType, { color: colors.textSecondary }]}>{a.archetype}</ThemedText>
            </View>
            <View style={[styles.impactChip, { backgroundColor: a.netImpact > 0 ? '#22C55E22' : '#EF444422' }]}>
              <ThemedText style={[styles.impactValue, { color: a.netImpact > 0 ? '#22C55E' : '#EF4444' }]}>
                {a.netImpact > 0 ? '+' : ''}{a.netImpact}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.archetypeSystem, { color: accent }]}>{a.system}</ThemedText>
        </View>
      ))}

      {/* Defensive Archetype Interactions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>DEFENSIVE ARCHETYPE × SYSTEM</ThemedText>
      {defArchetypes.map((a, i) => (
        <View key={i} style={[styles.archetypeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.archetypeHeader}>
            <View>
              <ThemedText style={[styles.archetypeName, { color: colors.text }]}>{a.player}</ThemedText>
              <ThemedText style={[styles.archetypeType, { color: colors.textSecondary }]}>{a.archetype}</ThemedText>
            </View>
            <View style={[styles.impactChip, { backgroundColor: '#22C55E22' }]}>
              <ThemedText style={[styles.impactValue, { color: '#22C55E' }]}>{a.netImpact}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.archetypeSystem, { color: accent }]}>{a.system}</ThemedText>
        </View>
      ))}

      {/* Net Player Impact Ranking */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>NET PLAYER IMPACT RANKING</ThemedText>
      <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.tableHeader}>
          <ThemedText style={[styles.thText, { flex: 0.1, color: colors.textSecondary }]}>#</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.35, color: colors.textSecondary }]}>Player</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>Off</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>Def</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.15, textAlign: 'center', color: colors.textSecondary }]}>Net</ThemedText>
        </View>
        {players.map((p, i) => {
          const offImpact = offArchetypes.find((a) => a.player === p.name.split('. ')[1])?.netImpact ?? 0;
          const defImpact = Math.abs(defArchetypes.find((a) => a.player === p.name.split('. ')[1])?.netImpact ?? 0);
          const net = offImpact + defImpact;
          return (
            <View key={p.name} style={styles.tableRow}>
              <ThemedText style={[styles.tdText, { flex: 0.1, color: colors.textSecondary }]}>{i + 1}</ThemedText>
              <ThemedText style={[styles.tdText, { flex: 0.35, color: colors.text, fontWeight: '600' }]}>{p.name}</ThemedText>
              <ThemedText style={[styles.tdText, { flex: 0.2, textAlign: 'center', color: '#22C55E' }]}>+{offImpact.toFixed(1)}</ThemedText>
              <ThemedText style={[styles.tdText, { flex: 0.2, textAlign: 'center', color: '#22C55E' }]}>+{defImpact.toFixed(1)}</ThemedText>
              <ThemedText style={[styles.tdText, { flex: 0.15, textAlign: 'center', color: accent, fontWeight: '700' }]}>+{net.toFixed(1)}</ThemedText>
            </View>
          );
        })}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Tab 5: Box Score Projection
// ---------------------------------------------------------------------------

function BoxScoreTab({ ctx, colors, accent }: TabProps) {
  const [showOpp, setShowOpp] = useState(false);
  const boxData = showOpp && ctx.boxOpp ? ctx.boxOpp : ctx.boxFMU;
  const teamLabel = showOpp ? ctx.game.team_b : 'Carroll';

  // Compute team totals
  const totals = boxData.reduce(
    (acc, p) => ({
      pts: acc.pts + p.points,
      reb: acc.reb + p.rebounds,
      ast: acc.ast + p.assists,
      to: acc.to + p.turnovers,
      stl: acc.stl + p.steals,
      blk: acc.blk + p.blocks,
      min: acc.min + p.minutes,
    }),
    { pts: 0, reb: 0, ast: 0, to: 0, stl: 0, blk: 0, min: 0 },
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Team Toggle */}
      {ctx.boxOpp && (
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, !showOpp && { backgroundColor: accent }]}
            onPress={() => setShowOpp(false)}
          >
            <Text style={[styles.toggleBtnText, { color: !showOpp ? '#000' : colors.textSecondary }]}>KXT</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, showOpp && { backgroundColor: accent }]}
            onPress={() => setShowOpp(true)}
          >
            <Text style={[styles.toggleBtnText, { color: showOpp ? '#000' : colors.textSecondary }]}>{ctx.game.team_b}</Text>
          </Pressable>
        </View>
      )}

      {/* Team Totals */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>TEAM TOTALS — {teamLabel}</ThemedText>
      <View style={styles.rangeRow}>
        <RangeChip label="PTS" value={`${totals.pts}`} color={accent} colors={colors} />
        <RangeChip label="REB" value={`${totals.reb}`} color="#22C55E" colors={colors} />
        <RangeChip label="AST" value={`${totals.ast}`} color={accent} colors={colors} />
        <RangeChip label="TO" value={`${totals.to}`} color="#EF4444" colors={colors} />
      </View>

      {/* Player Box Score Table */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>PROJECTED BOX SCORE — {teamLabel}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.boxTable, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.boxHeader}>
            {['Player', 'Pos', 'Min', 'Pts', 'FG', '3PT', 'Reb', 'Ast', 'TO', 'Stl', 'Blk'].map((h) => (
              <ThemedText key={h} style={[styles.boxHeaderText, { color: colors.textSecondary, width: h === 'Player' ? 90 : h === 'FG' || h === '3PT' ? 50 : 36 }]}>{h}</ThemedText>
            ))}
          </View>
          {boxData.map((p) => (
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

      {/* Sensitivity Panel */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>SENSITIVITY — WHAT-IF TOGGLES</ThemedText>
      {MOCK_CONSTRAINTS.what_if_toggles.map((t) => (
        <View key={t.id} style={[styles.toggleItemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.toggleItemLabel, { color: colors.text }]}>{t.label}</ThemedText>
          <View style={[styles.toggleIndicator, { backgroundColor: t.enabled ? '#22C55E' : '#A1A1AA' }]}>
            <ThemedText style={styles.toggleIndicatorText}>{t.enabled ? 'ON' : 'OFF'}</ThemedText>
          </View>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Tab 6: Scenarios
// ---------------------------------------------------------------------------

function ScenariosTab({ ctx, colors, accent }: TabProps) {
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Run Types */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>RUN TYPES</ThemedText>
      <View style={styles.runTypesGrid}>
        {SIM_RUN_TYPES.map((rt) => (
          <Pressable key={rt.id} style={[styles.runTypeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={rt.icon as any} size={20} color={accent} />
            <ThemedText style={[styles.runTypeLabel, { color: colors.text }]}>{rt.label}</ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Season Projection Summary */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>SEASON PROJECTION</ThemedText>
      <View style={[styles.projCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.projRow}>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.projValue, { color: accent }]}>{MOCK_SEASON_PROJECTION.projected_record.wins}-{MOCK_SEASON_PROJECTION.projected_record.losses}</ThemedText>
            <ThemedText style={[styles.projLabel, { color: colors.textSecondary }]}>Projected</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.projValue, { color: '#22C55E' }]}>{MOCK_SEASON_PROJECTION.tournament_probability}%</ThemedText>
            <ThemedText style={[styles.projLabel, { color: colors.textSecondary }]}>Tournament</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.projValue, { color: colors.text }]}>#{MOCK_SEASON_PROJECTION.conference_finish.projected_seed}</ThemedText>
            <ThemedText style={[styles.projLabel, { color: colors.textSecondary }]}>Conf Seed</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.projMeta, { color: colors.textSecondary }]}>
          {MOCK_SEASON_PROJECTION.sim_version} · {MOCK_SEASON_PROJECTION.sim_confidence_pct}% confidence
        </ThemedText>
      </View>

      {/* Portal Impact */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>TRANSFER PORTAL IMPACT</ThemedText>
      <View style={[styles.portalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.portalPlayer, { color: colors.text }]}>{MOCK_TRANSFER_PORTAL_IMPACT.portal_player.name}</ThemedText>
        <ThemedText style={[styles.portalDetail, { color: colors.textSecondary }]}>
          {MOCK_TRANSFER_PORTAL_IMPACT.portal_player.position} · KR {MOCK_TRANSFER_PORTAL_IMPACT.portal_player.kr_rating} · {MOCK_TRANSFER_PORTAL_IMPACT.portal_player.origin}
        </ThemedText>
        <View style={styles.portalKRRow}>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.portalKRValue, { color: colors.textSecondary }]}>{MOCK_TRANSFER_PORTAL_IMPACT.team_kr_before}</ThemedText>
            <ThemedText style={[styles.portalKRLabel, { color: colors.textSecondary }]}>Before</ThemedText>
          </View>
          <ThemedText style={[styles.portalArrow, { color: accent }]}>→</ThemedText>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.portalKRValue, { color: '#22C55E' }]}>{MOCK_TRANSFER_PORTAL_IMPACT.team_kr_after}</ThemedText>
            <ThemedText style={[styles.portalKRLabel, { color: colors.textSecondary }]}>After</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.portalKRValue, { color: '#22C55E' }]}>+{MOCK_TRANSFER_PORTAL_IMPACT.team_kr_delta}</ThemedText>
            <ThemedText style={[styles.portalKRLabel, { color: colors.textSecondary }]}>Delta</ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={[styles.portalKRValue, { color: accent }]}>{MOCK_TRANSFER_PORTAL_IMPACT.fit_score}%</ThemedText>
            <ThemedText style={[styles.portalKRLabel, { color: colors.textSecondary }]}>Fit</ThemedText>
          </View>
        </View>
      </View>

      {/* Saved Runs */}
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>SAVED RUNS</ThemedText>
      {SAVED_SIM_RUNS_ALL.map((run) => {
        const expanded = expandedRun === run.id;
        return (
          <Pressable
            key={run.id}
            style={[styles.savedRunCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setExpandedRun(expanded ? null : run.id)}
          >
            <View style={styles.savedRunHeader}>
              <ThemedText style={[styles.savedRunLabel, { color: colors.text }]}>{run.label}</ThemedText>
              {run.locked && <IconSymbol name="lock.fill" size={12} color="#22C55E" />}
            </View>
            <View style={styles.savedRunMeta}>
              <ThemedText style={[styles.savedRunDetail, { color: colors.textSecondary }]}>{run.version} · {run.confidence}% conf</ThemedText>
              <ThemedText style={[styles.savedRunDetail, { color: '#22C55E' }]}>{run.win_pct}% win · +{run.margin}</ThemedText>
            </View>
            <ThemedText style={[styles.savedRunDate, { color: colors.textSecondary }]}>{run.created}</ThemedText>
            {expanded && (
              <View style={styles.savedRunExpanded}>
                <ThemedText style={[styles.savedRunExpandedText, { color: colors.textSecondary }]}>
                  {run.team_a} vs {run.team_b} · {run.environment} · {run.type.replace(/_/g, ' ')}
                </ThemedText>
              </View>
            )}
          </Pressable>
        );
      })}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Shared Components
// ---------------------------------------------------------------------------

function RangeChip({ label, value, color, colors }: { label: string; value: string; color: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.rangeChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.rangeValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.rangeLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Selector
  selectorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  selectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  selectorText: { fontSize: 15, fontWeight: '700' },
  versionBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  versionText: { fontSize: 11, fontWeight: '700' },
  dropdown: { marginHorizontal: 16, borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginTop: 4 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemText: { fontSize: 14, fontWeight: '600' },
  dropdownItemMeta: { fontSize: 11, marginTop: 2 },

  // Pills
  pillBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },

  // Section
  sectionTitle: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Matchup
  matchupCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  matchupTitle: { fontSize: 18, fontWeight: '800' },
  matchupMeta: { fontSize: 11, marginTop: 4 },

  // Range Chip
  rangeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  rangeChip: { flex: 1, minWidth: 70, alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1 },
  rangeValue: { fontSize: 20, fontWeight: '800' },
  rangeLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  // Table
  tableCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2F3336' },
  thText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8 },
  tdText: { fontSize: 13 },

  // Driver row
  driverRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  driverDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  driverLabel: { fontSize: 13, fontWeight: '700' },
  driverNote: { fontSize: 11, marginTop: 2, lineHeight: 16 },

  // Gate
  gateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  gateLabel: { fontSize: 13, fontWeight: '600' },
  gateRange: { fontSize: 12 },

  // System × System
  systemCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  systemVsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  systemSide: { flex: 1, alignItems: 'center' },
  systemTeam: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  systemLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  vsText: { fontSize: 12, fontWeight: '600', marginHorizontal: 8 },
  systemInteraction: { fontSize: 11, marginTop: 10, lineHeight: 16 },
  miniTraceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  miniTraceKey: { fontSize: 12, fontWeight: '600', flex: 1 },
  miniTraceDelta: { fontSize: 12, fontWeight: '700' },
  swapCard: { padding: 14, borderRadius: 12, borderWidth: 1 },
  swapDesc: { fontSize: 12, marginBottom: 10 },
  swapBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  swapBtnText: { fontSize: 13, fontWeight: '700' },
  swapNote: { fontSize: 11, marginTop: 8, textAlign: 'center' },

  // Possession Engine
  outcomeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  outcomeLabel: { fontSize: 12, flex: 0.4 },
  outcomeBarBg: { flex: 0.45, height: 8, borderRadius: 4, backgroundColor: '#2F3336' },
  outcomeBarFill: { height: 8, borderRadius: 4 },
  outcomePct: { flex: 0.15, fontSize: 12, fontWeight: '700', textAlign: 'right' },

  possessionCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  possessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  possessionAction: { fontSize: 13, fontWeight: '700' },
  possessionPts: { fontSize: 14, fontWeight: '800' },
  possessionResult: { fontSize: 11, marginTop: 2 },
  possessionPPP: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Traces
  traceCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  traceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stepText: { fontSize: 10, fontWeight: '700' },
  traceKey: { fontSize: 13, fontWeight: '700', flex: 1 },
  traceDeltaSmall: { fontSize: 13, fontWeight: '700' },
  traceExpanded: { marginTop: 10 },
  traceSource: { fontSize: 11, marginBottom: 6 },
  traceDeltaRow: { flexDirection: 'row', alignItems: 'center' },
  traceDeltaLabel: { fontSize: 11 },
  traceDeltaVal: { fontSize: 13, fontWeight: '700' },
  traceTargets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  targetChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  targetText: { fontSize: 10, fontWeight: '600' },

  // Matchup Interactions
  archetypeCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  archetypeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  archetypeName: { fontSize: 14, fontWeight: '700' },
  archetypeType: { fontSize: 11, marginTop: 1 },
  impactChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  impactValue: { fontSize: 13, fontWeight: '800' },
  archetypeSystem: { fontSize: 11, fontWeight: '600', marginTop: 4 },

  // Box Score
  boxTable: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', minWidth: 520 },
  boxHeader: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2F3336' },
  boxHeaderText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  boxRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6 },
  boxCell: { fontSize: 12 },

  // Toggle
  toggleRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  toggleBtnText: { fontSize: 13, fontWeight: '600' },

  // Constraints
  constraintRow: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  constraintName: { fontSize: 14, fontWeight: '700' },
  constraintRange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  constraintNote: { fontSize: 11, marginTop: 2 },

  // What-if toggles
  toggleItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  toggleItemLabel: { fontSize: 13, fontWeight: '600' },
  toggleIndicator: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  toggleIndicatorText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Scenarios
  runTypesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  runTypeCard: { width: '47%', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, gap: 6 },
  runTypeLabel: { fontSize: 12, fontWeight: '600' },

  projCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  projRow: { flexDirection: 'row', justifyContent: 'space-around' },
  projValue: { fontSize: 22, fontWeight: '800' },
  projLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  projMeta: { fontSize: 11, textAlign: 'center', marginTop: 10 },

  portalCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  portalPlayer: { fontSize: 16, fontWeight: '800' },
  portalDetail: { fontSize: 11, marginTop: 4 },
  portalKRRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, alignItems: 'center' },
  portalKRValue: { fontSize: 18, fontWeight: '800' },
  portalKRLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  portalArrow: { fontSize: 20, fontWeight: '800' },

  savedRunCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  savedRunHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savedRunLabel: { fontSize: 14, fontWeight: '700', flex: 1 },
  savedRunMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  savedRunDetail: { fontSize: 12 },
  savedRunDate: { fontSize: 10, marginTop: 4 },
  savedRunExpanded: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2F3336' },
  savedRunExpandedText: { fontSize: 11 },
});
