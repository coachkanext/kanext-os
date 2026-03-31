/**
 * Simulation Page — Pregame Simulation Output (Blocks 0–7)
 *
 * Route: SportsHomeDashboard → SimulationPage(gameId = nextGameId)
 *
 * RBAC: Assistant Coach / Recruiting Coordinator (execution-level).
 * Can: View sim results, run/request sims via Nexus, view scenario deltas,
 *      view lineup + matchup lenses, view snapshot history, share output.
 * Cannot: Modify constraints, edit roster assumptions, override confidence,
 *         delete snapshots. Constraint-layer renders read-only.
 *
 * Snapshots are immutable. New runs never replace prior runs.
 * Only Program Leadership may "Lock" a simulation snapshot.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { KaNeXT_NEXT_GAME_ID, KaNeXT_LAST_GAME_ID, KaNeXT_GAMES } from '@/data/fmu';
import {
  MOCK_SINGLE_GAME,
  MOCK_DRIVERS,
  MOCK_BOX_SCORE_A,
  MOCK_CONSTRAINTS,
  MOCK_TRACES,
  SAVED_SIM_RUNS_ALL,
  CONFIDENCE_GATE,
  type SingleGameOutput,
  type SimDriver,
  type BoxScorePlayerLine,
  type InteractionTrace,
} from '@/data/mock-simulation-v2';

// =============================================================================
// HELPERS
// =============================================================================

function getConfidenceColor(pct: number): string {
  if (pct >= 85) return Brand.success;
  if (pct >= 70) return Brand.primary;
  if (pct >= 55) return Brand.warning;
  return Brand.error;
}

function getWinColor(pct: number): string {
  if (pct >= 55) return Brand.success;
  if (pct >= 45) return '#9C9790';
  return Brand.error;
}

function getMarginColor(margin: number): string {
  if (margin > 0) return Brand.success;
  if (margin === 0) return '#9C9790';
  return Brand.error;
}

/** Map confidence pct to data tier label */
function getDataTier(pct: number): string {
  for (const gate of [...CONFIDENCE_GATE].reverse()) {
    if (pct >= gate.minPct) return gate.label;
  }
  return 'Stats Only';
}

// =============================================================================
// SCENARIO DEFINITIONS
// =============================================================================

interface ScenarioDef {
  id: string;
  label: string;
  winDelta: number;
  marginDelta: number;
  swingFactor: string;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'base',
    label: 'Base',
    winDelta: 0,
    marginDelta: 0,
    swingFactor: '',  // uses sim.top_drivers[0]
  },
  {
    id: 'foul-trouble',
    label: 'Foul Trouble',
    winDelta: -8,
    marginDelta: -4,
    swingFactor: 'Carter in foul trouble reduces rim protection — opponent paint scoring rises 18%.',
  },
  {
    id: 'hot-cold',
    label: 'Hot / Cold Shooting',
    winDelta: -12,
    marginDelta: -5,
    swingFactor: 'Carroll 3PT% variance is 6.8% game-to-game. A cold night shrinks margin to near coin-flip.',
  },
  {
    id: 'to-spike',
    label: 'Turnover Spike',
    winDelta: -6,
    marginDelta: -3,
    swingFactor: 'Turnover rate spikes to 19% — gifts 6 extra possessions to opponent.',
  },
  {
    id: 'rebound',
    label: 'Rebound Battle',
    winDelta: +4,
    marginDelta: +2,
    swingFactor: 'Carroll dominates the glass with +8 rebound differential — second-chance points tilt margin.',
  },
  {
    id: 'endgame',
    label: 'Endgame',
    winDelta: +3,
    marginDelta: +2,
    swingFactor: 'Carroll clutch FT% (78%) and Carter rim protection close tight games — last 4 minutes favor us.',
  },
];

// =============================================================================
// PROJECTED LINEUP DATA (sim output)
// =============================================================================

interface ProjectedLineup {
  id: string;
  players: string[];
  label: string;
  netMargin: number;
  pace: number;
  toPct: number;
  rebPct: number;
  threeRate: number;
  projMinutes: number;
}

const PROJECTED_LINEUPS: ProjectedLineup[] = [
  {
    id: 'lu-1',
    players: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Carter'],
    label: 'Starting 5',
    netMargin: +8.4,
    pace: 68.2,
    toPct: 14.1,
    rebPct: 52.4,
    threeRate: 38.2,
    projMinutes: 18,
  },
  {
    id: 'lu-2',
    players: ['Blake', 'Plantey', 'Quinn', 'Diomande', 'Carter'],
    label: 'PG Sub',
    netMargin: +2.1,
    pace: 66.8,
    toPct: 16.8,
    rebPct: 50.8,
    threeRate: 35.4,
    projMinutes: 4,
  },
  {
    id: 'lu-3',
    players: ['Williams', 'Collins', 'Quinn', 'Diomande', 'Carter'],
    label: 'CG Sub',
    netMargin: +5.6,
    pace: 70.4,
    toPct: 13.2,
    rebPct: 48.6,
    threeRate: 42.1,
    projMinutes: 7,
  },
  {
    id: 'lu-4',
    players: ['Williams', 'Plantey', 'Hernandez', 'Diomande', 'Carter'],
    label: 'Wing Sub',
    netMargin: +4.2,
    pace: 67.6,
    toPct: 15.4,
    rebPct: 54.2,
    threeRate: 34.8,
    projMinutes: 6,
  },
];

// =============================================================================
// PROJECTED MATCHUP DATA (sim output)
// =============================================================================

interface ProjectedMatchup {
  id: string;
  defender: string;
  attacker: string;
  risk: string;
  leverage: string;
}

const PROJECTED_MATCHUPS: ProjectedMatchup[] = [
  {
    id: 'mu-1',
    defender: 'C. Plantey',
    attacker: 'D. Harris (PG)',
    risk: 'Harris averages 22.4 PPG and creates off isolation — Plantey gives up 2\u201d in height.',
    leverage: 'Force left hand, deny middle screen. Funnel into Carter rim protection.',
  },
  {
    id: 'mu-2',
    defender: 'N. Quinn',
    attacker: 'T. Mitchell (CG)',
    risk: 'Mitchell shoots 38% from corner 3 — Quinn must close out under control.',
    leverage: 'Contest without fouling. Mitchell is turnover-prone under pressure (18.4 TO%).',
  },
  {
    id: 'mu-3',
    defender: 'L. Carter',
    attacker: 'J. Rivera (B)',
    risk: 'Rivera is physical at 6\u20199\u201d 240 — draws fouls at rim. Carter foul trouble risk.',
    leverage: 'Vertical contest only. Box out every possession — Rivera crashes OREB hard.',
  },
  {
    id: 'mu-4',
    defender: 'P. Diomande',
    attacker: 'K. Brooks (F)',
    risk: 'Brooks can stretch to 3PT line (31%) — pulls Diomande away from paint.',
    leverage: 'Let Brooks shoot contested 3s (31% is below average). Switch only on ball screens.',
  },
];

// =============================================================================
// SIM DATA LOOKUP
// =============================================================================

/**
 * Returns the simulation snapshot for a given game.
 * In production this would query the backend; here we map to mock data.
 * Returns null if no simulation has been run for this game.
 */
function getSimForGame(_gameId: string): {
  sim: SingleGameOutput;
  drivers: SimDriver[];
  boxScore: BoxScorePlayerLine[];
  traces: InteractionTrace[];
} | null {
  // For the demo, always return the MSU-Northern sim data.
  // A null return triggers the empty state.
  return {
    sim: MOCK_SINGLE_GAME,
    drivers: MOCK_DRIVERS,
    boxScore: MOCK_BOX_SCORE_A,
    traces: MOCK_TRACES,
  };
}

// =============================================================================
// PROPS
// =============================================================================

interface SimulationPageProps {
  onBack: () => void;
  gameId?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SimulationPage({ onBack, gameId: gameIdProp }: SimulationPageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // ── Game Selector State ──
  const upcomingGames = useMemo(
    () => KaNeXT_GAMES.filter(g => g.status === 'upcoming').slice(0, 8),
    [],
  );
  const fallbackGameId =
    KaNeXT_NEXT_GAME_ID || KaNeXT_LAST_GAME_ID || KaNeXT_GAMES[KaNeXT_GAMES.length - 1]?.id || '';
  const [selectedGameId, setSelectedGameId] = useState(gameIdProp || fallbackGameId);
  const selectorGames = useMemo(
    () =>
      upcomingGames.length > 0
        ? upcomingGames
        : KaNeXT_GAMES.filter(g => g.status === 'final').slice(-8).reverse(),
    [upcomingGames],
  );
  const [selectorOpen, setSelectorOpen] = useState(false);

  const selectedGame = useMemo(
    () => KaNeXT_GAMES.find(g => g.id === selectedGameId),
    [selectedGameId],
  );

  // ── Sim Data ──
  const simData = useMemo(() => getSimForGame(selectedGameId), [selectedGameId]);
  const sim = simData?.sim ?? null;
  const drivers = simData?.drivers ?? [];
  const traces = simData?.traces ?? [];

  // ── Locked status ──
  const isLocked = SAVED_SIM_RUNS_ALL.some(r => r.locked);

  // ── Scenario State ──
  const [activeScenario, setActiveScenario] = useState('base');
  const scenario = SCENARIOS.find(s => s.id === activeScenario) ?? SCENARIOS[0];

  // ── Lineup / Matchup Tab ──
  const [lineupTab, setLineupTab] = useState<'lineups' | 'matchups'>('lineups');

  // ── Constraints Collapse ──
  const [constraintsOpen, setConstraintsOpen] = useState(false);

  // ── Derived sim values (scenario-adjusted) ──
  const baseWinPct = sim?.win_pct.mid ?? 0;
  const baseMargin = sim?.margin.mid ?? 0;
  const effectiveWinPct = Math.max(0, Math.min(100, baseWinPct + scenario.winDelta));
  const effectiveMargin = baseMargin + scenario.marginDelta;

  // Projected score derived from base margin + pace context
  const baseScoreA = 76;
  const baseScoreB = baseScoreA - baseMargin; // 69
  const projScoreA = baseScoreA + Math.ceil(scenario.marginDelta / 2);
  const projScoreB = baseScoreB - Math.floor(scenario.marginDelta / 2);

  const confColor = sim ? getConfidenceColor(sim.sim_confidence_pct) : '#9C9790';
  const dataTier = sim ? getDataTier(sim.sim_confidence_pct) : 'Stats Only';
  const swingFactor =
    scenario.id === 'base'
      ? sim?.top_drivers[0] ?? ''
      : scenario.swingFactor;

  // ── Share ──
  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!sim || !selectedGame) return;
    try {
      await Share.share({
        message: `Simulation: ${selectedGame.location === 'Home' ? 'vs' : '@'} ${selectedGame.opponent} — Win: ${effectiveWinPct}%, Projected Margin: ${effectiveMargin > 0 ? '+' : ''}${effectiveMargin}`,
      });
    } catch {}
  }, [sim, selectedGame, effectiveWinPct, effectiveMargin]);

  // ════════════════════════════════════════════════════════════════════════════
  // EMPTY STATE — no sim data for this game
  // ════════════════════════════════════════════════════════════════════════════

  if (!sim) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={20} color={accent} />
          </Pressable>
          <Text style={[styles.headerTitleOnly, { color: colors.text }]}>Simulation</Text>
          <View style={{ width: 72 }} />
        </View>
        <View style={styles.emptyState}>
          <IconSymbol name="play.circle.fill" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No simulation run yet.</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Run a simulation in Nexus to see pregame projections.
          </Text>
          <Pressable style={[styles.nexusBtn, { backgroundColor: accent }]} onPress={() => {}}>
            <IconSymbol name="brain" size={14} color="#fff" />
            <Text style={styles.nexusBtnText}>Run in Nexus</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ═══════ BLOCK 0 — STICKY HEADER ═══════ */}
      <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {/* Left: Back chevron → Dashboard */}
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={accent} />
        </Pressable>

        {/* Center: Opponent Name + Date/Time + Home/Away */}
        <View style={styles.headerCenter}>
          <Text style={[styles.headerOpponent, { color: colors.text }]} numberOfLines={1}>
            {selectedGame
              ? `${selectedGame.location === 'Home' ? 'vs' : '@'} ${selectedGame.opponent}`
              : sim.team_b}
          </Text>
          <Text style={[styles.headerMeta, { color: colors.textSecondary }]}>
            {selectedGame
              ? `${selectedGame.date}${selectedGame.gameTime ? ' · ' + selectedGame.gameTime : ''} · ${selectedGame.location}`
              : `${sim.environment}`}
          </Text>
        </View>

        {/* Right: Run in Nexus (primary) + Share (secondary) */}
        <View style={styles.headerRight}>
          <Pressable onPress={() => {}} hitSlop={8} accessibilityLabel="Run in Nexus">
            <IconSymbol name="brain" size={18} color={accent} />
          </Pressable>
          <Pressable onPress={handleShare} hitSlop={8} accessibilityLabel="Share simulation">
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
      </View>

      {/* Chips: sim_version | sim_confidence_pct | last_run_timestamp | LOCKED */}
      <View style={[styles.chipRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {isLocked && (
          <View style={[styles.chip, { backgroundColor: Brand.success + '20' }]}>
            <Text style={[styles.chipText, { color: Brand.success }]}>LOCKED</Text>
          </View>
        )}
        <View style={[styles.chip, { backgroundColor: colors.card }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>{sim.sim_version}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: confColor + '20' }]}>
          <Text style={[styles.chipText, { color: confColor }]}>{sim.sim_confidence_pct}%</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.card }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>Feb 16, 2026 · 9:42 PM</Text>
        </View>
      </View>

      {/* ═══════ SCROLLABLE CONTENT ═══════ */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ═══════ BLOCK 1 — GAME SELECTOR (only if no gameId prop) ═══════ */}
        {!gameIdProp && selectorGames.length > 1 && (
          <View style={styles.block}>
            <Pressable
              style={[styles.selectorBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setSelectorOpen(!selectorOpen)}
            >
              <Text style={[styles.selectorText, { color: colors.text }]}>
                {selectedGameId === fallbackGameId
                  ? upcomingGames.length > 0 ? 'Next Game' : 'Most Recent'
                  : selectedGame ? `vs ${selectedGame.opponent}` : 'Select Game'}
              </Text>
              <IconSymbol
                name={selectorOpen ? 'chevron.up' : 'chevron.down'}
                size={12}
                color={colors.textSecondary}
              />
            </Pressable>
            {selectorOpen && (
              <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {selectorGames.map(g => (
                  <Pressable
                    key={g.id}
                    style={[
                      styles.dropdownItem,
                      g.id === selectedGameId && { backgroundColor: accent + '18' },
                    ]}
                    onPress={() => {
                      setSelectedGameId(g.id);
                      setSelectorOpen(false);
                      setActiveScenario('base');
                    }}
                  >
                    <Text style={[styles.dropdownText, { color: colors.text }]}>
                      {g.location === 'Home' ? 'vs' : '@'} {g.opponent}
                    </Text>
                    <Text style={[styles.dropdownMeta, { color: colors.textSecondary }]}>
                      {g.date} · {g.location}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ═══════ BLOCK 2 — LATEST SIMULATION SUMMARY ═══════ */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Primary metrics row */}
          <View style={styles.summaryRow}>
            {/* Win % */}
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Win Probability</Text>
              <Text style={[styles.summaryWinPct, { color: getWinColor(effectiveWinPct) }]}>
                {effectiveWinPct}%
              </Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

            {/* Projected Score */}
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Projected Score</Text>
              <Text style={[styles.summaryScore, { color: colors.text }]}>
                {projScoreA}–{projScoreB}
              </Text>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

            {/* Projected Margin */}
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Projected Margin</Text>
              <Text style={[styles.summaryMargin, { color: getMarginColor(effectiveMargin) }]}>
                {effectiveMargin > 0 ? '+' : ''}{effectiveMargin}
              </Text>
            </View>
          </View>

          {/* Key Swing Factor */}
          <View style={[styles.swingRow, { borderTopColor: colors.border }]}>
            <IconSymbol name="bolt.fill" size={12} color={Brand.warning} />
            <Text style={[styles.swingText, { color: colors.textSecondary }]} numberOfLines={2}>
              {swingFactor}
            </Text>
          </View>

          {/* Scenario active indicator */}
          {activeScenario !== 'base' && (
            <View style={[styles.scenarioIndicator, { backgroundColor: Brand.warning + '12' }]}>
              <Text style={[styles.scenarioIndicatorText, { color: Brand.warning }]}>
                Viewing: {scenario.label} scenario
              </Text>
              <Pressable onPress={() => setActiveScenario('base')} hitSlop={8}>
                <Text style={[styles.scenarioResetText, { color: accent }]}>Reset</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ═══════ BLOCK 3 — SCENARIO STRIP ═══════ */}
        <BlockHeader title="Scenarios" colors={colors} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scenarioStrip}
          contentContainerStyle={styles.scenarioStripContent}
        >
          {SCENARIOS.map(s => {
            const isActive = s.id === activeScenario;
            return (
              <Pressable
                key={s.id}
                style={[
                  styles.scenarioPill,
                  {
                    backgroundColor: isActive ? accent + '20' : colors.card,
                    borderColor: isActive ? accent : colors.border,
                  },
                ]}
                onPress={() => {
                  setActiveScenario(s.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[styles.scenarioPillLabel, { color: isActive ? accent : colors.text }]}
                >
                  {s.label}
                </Text>
                {s.winDelta !== 0 && (
                  <Text
                    style={[
                      styles.scenarioPillDelta,
                      { color: s.winDelta > 0 ? Brand.success : Brand.error },
                    ]}
                  >
                    {s.winDelta > 0 ? '+' : ''}{s.winDelta}%
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ═══════ BLOCK 4 — WHAT THE SIM THINKS MATTERS (TOP DRIVERS) ═══════ */}
        <BlockHeader title="What the Sim Thinks Matters" colors={colors} />
        {drivers.map(d => (
          <DriverRow key={d.rank} driver={d} colors={colors} />
        ))}

        {/* ═══════ BLOCK 5 — LINEUP / MATCHUP LENS ═══════ */}
        <BlockHeader title="Lineup / Matchup Lens" colors={colors} />

        {/* Segment Control */}
        <View style={[styles.segmentRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={[styles.segmentBtn, lineupTab === 'lineups' && { backgroundColor: accent + '20' }]}
            onPress={() => setLineupTab('lineups')}
          >
            <Text style={[styles.segmentText, { color: lineupTab === 'lineups' ? accent : colors.textSecondary }]}>
              Our Lineups
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, lineupTab === 'matchups' && { backgroundColor: accent + '20' }]}
            onPress={() => setLineupTab('matchups')}
          >
            <Text style={[styles.segmentText, { color: lineupTab === 'matchups' ? accent : colors.textSecondary }]}>
              Matchups
            </Text>
          </Pressable>
        </View>

        {lineupTab === 'lineups' ? (
          /* Tab A — Our Lineups */
          <View style={styles.lineupsContainer}>
            {PROJECTED_LINEUPS.map(lu => (
              <View key={lu.id} style={[styles.lineupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.lineupHeader}>
                  <Text style={[styles.lineupLabel, { color: colors.text }]}>{lu.label}</Text>
                  <Text style={[styles.lineupMinutes, { color: colors.textTertiary }]}>~{lu.projMinutes} min</Text>
                </View>
                <Text style={[styles.lineupPlayers, { color: colors.textSecondary }]}>
                  {lu.players.join(' · ')}
                </Text>
                {/* Stat strip */}
                <View style={styles.lineupStats}>
                  <LineupStat
                    label="Net"
                    value={`${lu.netMargin > 0 ? '+' : ''}${lu.netMargin.toFixed(1)}`}
                    color={lu.netMargin > 0 ? Brand.success : Brand.error}
                  />
                  <LineupStat label="Pace" value={lu.pace.toFixed(1)} color={colors.textSecondary} />
                  <LineupStat label="TO%" value={`${lu.toPct.toFixed(1)}%`} color={colors.textSecondary} />
                  <LineupStat label="Reb%" value={`${lu.rebPct.toFixed(1)}%`} color={colors.textSecondary} />
                  <LineupStat label="3PA Rate" value={`${lu.threeRate.toFixed(1)}%`} color={colors.textSecondary} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Tab B — Matchups */
          <View style={styles.matchupsContainer}>
            {PROJECTED_MATCHUPS.map(mu => (
              <View key={mu.id} style={[styles.matchupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.matchupTitle, { color: colors.text }]}>
                  {mu.defender} <Text style={{ color: colors.textTertiary }}>guards</Text> {mu.attacker}
                </Text>
                <View style={styles.matchupSection}>
                  <Text style={[styles.matchupSectionLabel, { color: Brand.error }]}>Risk</Text>
                  <Text style={[styles.matchupSectionValue, { color: colors.textSecondary }]}>{mu.risk}</Text>
                </View>
                <View style={styles.matchupSection}>
                  <Text style={[styles.matchupSectionLabel, { color: Brand.success }]}>Leverage</Text>
                  <Text style={[styles.matchupSectionValue, { color: colors.textSecondary }]}>{mu.leverage}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ═══════ BLOCK 6 — CONSTRAINTS & ASSUMPTIONS (Collapsed) ═══════ */}
        <Pressable
          style={[
            styles.collapseHeader,
            { backgroundColor: colors.card, borderColor: colors.border },
            constraintsOpen && styles.collapseHeaderOpen,
          ]}
          onPress={() => setConstraintsOpen(!constraintsOpen)}
        >
          <View style={styles.collapseHeaderLeft}>
            <Text style={[styles.collapseTitle, { color: colors.text }]}>Constraints & Assumptions</Text>
            <View style={[styles.chip, { backgroundColor: colors.background }]}>
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>Read-Only</Text>
            </View>
          </View>
          <IconSymbol
            name={constraintsOpen ? 'chevron.up' : 'chevron.down'}
            size={14}
            color={colors.textSecondary}
          />
        </Pressable>
        {constraintsOpen && (
          <View style={[styles.collapseBody, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Roster Availability */}
            <Text style={[styles.constraintLabel, { color: colors.textSecondary }]}>ROSTER AVAILABILITY</Text>
            {MOCK_CONSTRAINTS.availability_flags.map((af, i) => (
              <View key={i} style={styles.constraintRow}>
                <View style={[styles.constraintDot, { backgroundColor: Brand.warning }]} />
                <Text style={[styles.constraintItem, { color: Brand.warning }]}>
                  {af.player}: {af.flag}
                </Text>
              </View>
            ))}

            {/* Minutes Caps */}
            <Text style={[styles.constraintLabel, { color: colors.textSecondary, marginTop: 14 }]}>
              MINUTES CAP ASSUMPTIONS
            </Text>
            {MOCK_CONSTRAINTS.minutes_constraints.map((mc, i) => (
              <Text key={i} style={[styles.constraintItem, { color: colors.text }]}>
                {mc.playerName}: {mc.minMinutes}–{mc.maxMinutes} min — {mc.note}
              </Text>
            ))}

            {/* System Identity */}
            <Text style={[styles.constraintLabel, { color: colors.textSecondary, marginTop: 14 }]}>
              SYSTEM IDENTITY USED
            </Text>
            <Text style={[styles.constraintItem, { color: colors.text }]}>
              Our OSIE: Motion Read & React (Moderate pace)
            </Text>
            <Text style={[styles.constraintItem, { color: colors.text }]}>
              Our DSIE: Pack Line (Contain pressure)
            </Text>
            <Text style={[styles.constraintItem, { color: colors.text }]}>
              Opp OSIE: Spread Pick & Roll (Up-tempo)
            </Text>
            <Text style={[styles.constraintItem, { color: colors.text }]}>
              Opp DSIE: Containment Man (Switch-heavy)
            </Text>

            {/* Data Coverage */}
            <Text style={[styles.constraintLabel, { color: colors.textSecondary, marginTop: 14 }]}>
              DATA COVERAGE
            </Text>
            <Text style={[styles.constraintItem, { color: colors.text }]}>
              Tier: {dataTier} · Confidence: {sim.sim_confidence_pct}%
            </Text>

            {/* What-If Toggles */}
            <Text style={[styles.constraintLabel, { color: colors.textSecondary, marginTop: 14 }]}>
              WHAT-IF TOGGLES
            </Text>
            {MOCK_CONSTRAINTS.what_if_toggles.map(wt => (
              <View key={wt.id} style={styles.constraintRow}>
                <View
                  style={[
                    styles.constraintDot,
                    { backgroundColor: wt.enabled ? Brand.success : colors.textTertiary },
                  ]}
                />
                <Text
                  style={[
                    styles.constraintItem,
                    { color: wt.enabled ? colors.text : colors.textTertiary },
                  ]}
                >
                  {wt.label}
                </Text>
              </View>
            ))}

            {/* Trace Notes */}
            {traces.length > 0 && (
              <>
                <Text style={[styles.constraintLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                  TRACE NOTES ({traces.length})
                </Text>
                {traces.map(tr => (
                  <Text key={tr.id} style={[styles.traceItem, { color: colors.textTertiary }]}>
                    Step {tr.step_order}: {tr.key} — {tr.source_doc} (delta: {tr.bounded_delta > 0 ? '+' : ''}{tr.bounded_delta.toFixed(1)})
                  </Text>
                ))}
              </>
            )}
          </View>
        )}

        {/* ═══════ BLOCK 7 — SNAPSHOT HISTORY ═══════ */}
        <BlockHeader title="Snapshot History" colors={colors} />
        <Text style={[styles.historySubtitle, { color: colors.textTertiary }]}>
          Snapshots are immutable and versioned. Tap to view.
        </Text>
        {SAVED_SIM_RUNS_ALL.map(run => (
          <Pressable
            key={run.id}
            style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.historyLabel, { color: colors.text }]} numberOfLines={1}>
                {run.label}
              </Text>
              <View style={styles.historyMeta}>
                <Text style={[styles.historyDate, { color: colors.textTertiary }]}>{run.created}</Text>
                <Text style={[styles.historyScenario, { color: colors.textSecondary }]}>
                  {run.type.replace('_', ' ')}
                </Text>
                <Text style={[styles.historyWin, { color: getWinColor(run.win_pct) }]}>
                  {run.win_pct}%
                </Text>
                <View style={[styles.chip, { backgroundColor: getConfidenceColor(run.confidence) + '20' }]}>
                  <Text style={[styles.chipText, { color: getConfidenceColor(run.confidence) }]}>
                    {run.confidence}%
                  </Text>
                </View>
                {run.locked && (
                  <View style={[styles.chip, { backgroundColor: Brand.success + '20' }]}>
                    <Text style={[styles.chipText, { color: Brand.success }]}>LOCKED</Text>
                  </View>
                )}
              </View>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Section header used between blocks */
function BlockHeader({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.blockHeader}>
      <Text style={[styles.blockTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

/** Single driver row in Block 4 */
function DriverRow({ driver, colors }: { driver: SimDriver; colors: typeof Colors.light }) {
  const isPositive = driver.impact_direction === 'positive';
  const barColor = isPositive ? Brand.success : Brand.error;
  // Impact magnitude: rank 1 = strongest. Bar width scales inversely with rank.
  const barWidth = Math.max(20, 100 - (driver.rank - 1) * 15);

  return (
    <View style={[styles.driverRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Rank badge */}
      <View style={[styles.driverRank, { backgroundColor: barColor + '20' }]}>
        <Text style={[styles.driverRankText, { color: barColor }]}>{driver.rank}</Text>
      </View>
      <View style={styles.driverContent}>
        {/* Driver name */}
        <Text style={[styles.driverName, { color: colors.text }]}>{driver.driver}</Text>
        {/* Relative impact bar */}
        <View style={styles.driverBarTrack}>
          <View style={[styles.driverBarFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
        </View>
        {/* One-line coaching translation */}
        <Text style={[styles.driverExplanation, { color: colors.textSecondary }]} numberOfLines={2}>
          {driver.explanation}
        </Text>
      </View>
    </View>
  );
}

/** Small stat cell used in lineup cards */
function LineupStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.lineupStatCell}>
      <Text style={[styles.lineupStatLabel, { color: '#52525B' }]}>{label}</Text>
      <Text style={[styles.lineupStatValue, { color }]}>{value}</Text>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Block 0 — Sticky Header ──
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerOpponent: { fontSize: 16, fontWeight: '700' },
  headerMeta: { fontSize: 12, marginTop: 2 },
  headerTitleOnly: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerRight: {
    flexDirection: 'row',
    gap: 14,
    width: 72,
    justifyContent: 'flex-end',
  },

  // ── Chip Row ──
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  // ── Block 1 — Game Selector ──
  block: { marginBottom: Spacing.sm },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectorText: { fontSize: 14, fontWeight: '700' },
  dropdown: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownText: { fontSize: 13, fontWeight: '600' },
  dropdownMeta: { fontSize: 11, marginTop: 2 },

  // ── Block 2 — Summary Card ──
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryCell: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 44, marginHorizontal: 4 },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  summaryWinPct: { fontSize: 30, fontWeight: '800' },
  summaryScore: { fontSize: 22, fontWeight: '700' },
  summaryMargin: { fontSize: 24, fontWeight: '800' },
  swingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  swingText: { fontSize: 12, lineHeight: 18, flex: 1 },
  scenarioIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  scenarioIndicatorText: { fontSize: 11, fontWeight: '600' },
  scenarioResetText: { fontSize: 11, fontWeight: '700' },

  // ── Block 3 — Scenario Strip ──
  blockHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  blockTitle: { fontSize: 16, fontWeight: '700' },
  scenarioStrip: { marginBottom: Spacing.sm },
  scenarioStripContent: { gap: 8 },
  scenarioPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  scenarioPillLabel: { fontSize: 12, fontWeight: '600' },
  scenarioPillDelta: { fontSize: 10, fontWeight: '700', marginTop: 2 },

  // ── Block 4 — Top Drivers ──
  driverRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  driverRank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  driverRankText: { fontSize: 13, fontWeight: '800' },
  driverContent: { flex: 1 },
  driverName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  driverBarTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    marginBottom: 6,
  },
  driverBarFill: { height: 4, borderRadius: 2 },
  driverExplanation: { fontSize: 11, lineHeight: 16 },

  // ── Block 5 — Lineup / Matchup Lens ──
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '600' },

  // Lineup cards
  lineupsContainer: { gap: 8, marginBottom: Spacing.sm },
  lineupCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  lineupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lineupLabel: { fontSize: 14, fontWeight: '700' },
  lineupMinutes: { fontSize: 11 },
  lineupPlayers: { fontSize: 12, marginBottom: 8 },
  lineupStats: { flexDirection: 'row' },
  lineupStatCell: { flex: 1, alignItems: 'center' },
  lineupStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  lineupStatValue: { fontSize: 13, fontWeight: '600' },

  // Matchup cards
  matchupsContainer: { gap: 8, marginBottom: Spacing.sm },
  matchupCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  matchupTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  matchupSection: { marginTop: 6 },
  matchupSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  matchupSectionValue: { fontSize: 12, lineHeight: 18 },

  // ── Block 6 — Constraints & Assumptions ──
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: Spacing.lg,
    marginBottom: 1,
  },
  collapseHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  collapseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  collapseTitle: { fontSize: 14, fontWeight: '700' },
  collapseBody: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  constraintLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  constraintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  constraintDot: { width: 8, height: 8, borderRadius: 4 },
  constraintItem: { fontSize: 12, lineHeight: 18, marginBottom: 2 },
  traceItem: { fontSize: 11, lineHeight: 16, marginBottom: 3 },

  // ── Block 7 — Snapshot History ──
  historySubtitle: { fontSize: 11, marginBottom: Spacing.sm },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyLabel: { fontSize: 13, fontWeight: '600' },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  historyDate: { fontSize: 11 },
  historyScenario: { fontSize: 11 },
  historyWin: { fontSize: 12, fontWeight: '700' },

  // ── Empty State ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  nexusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nexusBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
