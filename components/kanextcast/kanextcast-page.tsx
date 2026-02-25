/**
 * KaNeXTCast — Game Lifecycle Viewer
 *
 * Three states: Preview (Upcoming) | Live | Final
 * Each state renders deterministic intel from saved snapshots.
 *
 * RBAC: Assistant Coach / Recruiting Coordinator (execution-level).
 * Can: View all states, open Nexus for adjustments.
 * Cannot: Alter game status, edit official stats, overwrite snapshots,
 *         modify KR model. All lifecycle states are read-only surfaces.
 * Writes occur only via Nexus.
 *
 * Canonical routing rule: All game lifecycle flows route through KaNeXTCast.
 * GameCards never open Game Plan or Simulation directly.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import type { KaNeXTGame } from '@/data/fmu';
import { KaNeXT_BOX_SCORES, KaNeXT_PREGAME } from '@/data/fmu';
import type { BoxScoreLine } from '@/data/fmu';
import {
  KANEXTCAST_INTEL,
  DEFAULT_PREVIEW_INTEL,
  DEFAULT_FINAL_INTEL,
} from '@/data/mock-kanextcast';
import type {
  IntelBullet,
  PlanVsProfile,
  PlanVsReality,
  LiveRiskFlag,
  PlayByPlayEntry,
  PreviewIntel,
  LiveIntel,
  FinalIntel,
} from '@/data/mock-kanextcast';

// =============================================================================
// CONSTANTS
// =============================================================================

type TimelineFilter = 'all' | 'scoring' | 'foul' | 'turnover';
type FinalSubnav = 'timeline' | 'box' | 'intel';

// =============================================================================
// PROPS
// =============================================================================

interface KaNeXTCastPageProps {
  game: KaNeXTGame;
  onBack: () => void;
  onOpenGamePlan?: () => void;
  onOpenSimulation?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function KaNeXTCastPage({ game, onBack, onOpenGamePlan, onOpenSimulation }: KaNeXTCastPageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();

  // Timeline filter state (used by Live + Final)
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all');

  // Final subnav state
  const [finalSubnav, setFinalSubnav] = useState<FinalSubnav>('timeline');

  // Box score expanded state
  const [boxExpanded, setBoxExpanded] = useState(false);

  // Resolve intel data
  const intel = KANEXTCAST_INTEL[game.id];
  const pregame = KaNeXT_PREGAME[game.id];
  const boxScore = KaNeXT_BOX_SCORES[game.id];

  const homeAway = game.location === 'Home' ? 'Home' : 'Away';

  // Status colors
  const statusColor = game.status === 'live' ? Brand.error
    : game.status === 'final' ? colors.textSecondary
    : Brand.primary;
  const statusLabel = game.status === 'live' ? 'LIVE'
    : game.status === 'final' ? 'FINAL'
    : 'UPCOMING';

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* ═══════ BLOCK 0 — STICKY HEADER ═══════ */}
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} hitSlop={12} style={s.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={accent} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, { color: colors.text }]} numberOfLines={1}>
            vs {game.opponent}
          </Text>
          <Text style={[s.headerSub, { color: colors.textTertiary }]}>
            {game.date} · {game.gameTime ?? ''} · {homeAway}
          </Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: statusColor + '18' }]}>
          {game.status === 'live' && <View style={s.liveRedDot} />}
          <Text style={[s.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {game.status === 'upcoming' && (
          <PreviewState
            game={game}
            intel={intel?.preview ?? DEFAULT_PREVIEW_INTEL}
            pregame={pregame}
            colors={colors}
            accent={accent}
            onOpenGamePlan={onOpenGamePlan}
            onOpenSimulation={onOpenSimulation}
          />
        )}

        {game.status === 'live' && (
          <LiveState
            game={game}
            intel={intel?.live ?? null}
            colors={colors}
            accent={accent}
            timelineFilter={timelineFilter}
            setTimelineFilter={setTimelineFilter}
            boxExpanded={boxExpanded}
            setBoxExpanded={setBoxExpanded}
            boxScore={boxScore}
          />
        )}

        {game.status === 'final' && (
          <FinalState
            game={game}
            intel={intel?.final ?? DEFAULT_FINAL_INTEL}
            colors={colors}
            accent={accent}
            finalSubnav={finalSubnav}
            setFinalSubnav={setFinalSubnav}
            timelineFilter={timelineFilter}
            setTimelineFilter={setTimelineFilter}
            boxScore={boxScore}
            onOpenGamePlan={onOpenGamePlan}
            onOpenSimulation={onOpenSimulation}
          />
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// PREVIEW STATE
// =============================================================================

function PreviewState({
  game, intel, pregame, colors, accent, onOpenGamePlan, onOpenSimulation,
}: {
  game: KaNeXTGame;
  intel: PreviewIntel;
  pregame?: ReturnType<typeof KaNeXT_PREGAME extends Record<string, infer T> ? () => T : never>;
  colors: typeof Colors.light;
  accent: string;
  onOpenGamePlan?: () => void;
  onOpenSimulation?: () => void;
}) {
  return (
    <>
      {/* ═══════ BLOCK 1 — MATCHUP HERO ═══════ */}
      <View style={[s.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.heroLogos}>
          <View style={[s.heroLogo, { backgroundColor: accent + '20' }]}>
            <Text style={[s.heroLogoText, { color: accent }]}>FMU</Text>
          </View>
          <Text style={[s.heroVs, { color: colors.textTertiary }]}>vs</Text>
          <View style={[s.heroLogo, { backgroundColor: colors.border }]}>
            <Text style={[s.heroLogoText, { color: colors.textSecondary }]}>
              {game.opponent.charAt(0)}
            </Text>
          </View>
        </View>
        <Text style={[s.heroOpponent, { color: colors.text }]}>{game.opponent}</Text>
        <Text style={[s.heroMeta, { color: colors.textTertiary }]}>
          {game.date} · {game.gameTime ?? ''} · {game.location === 'Home' ? 'Home' : 'Away'} · {game.venue ?? ''}
        </Text>
        {/* Chips */}
        <View style={s.heroChips}>
          <Pressable
            style={[s.heroChip, { backgroundColor: accent + '15', borderColor: accent + '30' }]}
            onPress={() => {
              onOpenGamePlan?.();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol name="doc.text.fill" size={12} color={accent} />
            <Text style={[s.heroChipText, { color: accent }]}>Game Plan</Text>
          </Pressable>
          <Pressable
            style={[s.heroChip, { backgroundColor: Brand.primary + '15', borderColor: Brand.primary + '30' }]}
            onPress={() => {
              onOpenSimulation?.();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol name="chart.bar.fill" size={12} color={Brand.primary} />
            <Text style={[s.heroChipText, { color: Brand.primary }]}>Simulation</Text>
          </Pressable>
        </View>
      </View>

      {/* ═══════ BLOCK 2 — KANEXT INTEL STRIP (Preview) ═══════ */}
      <SectionLabel text="KANEXT INTEL" colors={colors} />

      {/* Card 1 — Top 3 Keys */}
      <IntelCard
        title="Top 3 Keys"
        icon="key.fill"
        bullets={intel.topKeys}
        emptyText="Generate Game Plan to populate."
        colors={colors}
        accent={accent}
      />

      {/* Card 2 — Mismatch Targets */}
      <IntelCard
        title="Mismatch Targets"
        icon="target"
        bullets={intel.mismatchTargets}
        emptyText="No mismatches identified."
        colors={colors}
        accent={Brand.success}
      />

      {/* Card 3 — Risk Flags */}
      <IntelCard
        title="Risk Flags"
        icon="exclamationmark.triangle.fill"
        bullets={intel.riskFlags}
        emptyText="No risk flags identified."
        colors={colors}
        accent={Brand.warning}
      />

      {/* ═══════ BLOCK 3 — PLAN vs PROFILE ═══════ */}
      <SectionLabel text="PLAN VS PROFILE" colors={colors} />
      <PlanVsProfileCard profile={intel.planVsProfile} colors={colors} accent={accent} />

      {/* ═══════ BLOCK 4 — PREGAME FEED ═══════ */}
      <SectionLabel text="PREGAME STATUS" colors={colors} />
      <View style={[s.feedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {intel.statusChips.map((chip, i) => (
          <View key={i} style={[s.feedChip, { backgroundColor: Brand.success + '15' }]}>
            <IconSymbol name="checkmark.circle.fill" size={12} color={Brand.success} />
            <Text style={[s.feedChipText, { color: Brand.success }]}>{chip}</Text>
          </View>
        ))}
        {intel.statusChips.length === 0 && (
          <View style={[s.feedChip, { backgroundColor: colors.border + '40' }]}>
            <IconSymbol name="info.circle.fill" size={12} color={colors.textTertiary} />
            <Text style={[s.feedChipText, { color: colors.textTertiary }]}>No intel generated yet</Text>
          </View>
        )}
      </View>

      {/* RBAC footer */}
      <Text style={[s.rbacFooter, { color: colors.textTertiary }]}>
        All modifications route through Nexus.
      </Text>
    </>
  );
}

// =============================================================================
// LIVE STATE
// =============================================================================

function LiveState({
  game, intel, colors, accent, timelineFilter, setTimelineFilter, boxExpanded, setBoxExpanded, boxScore,
}: {
  game: KaNeXTGame;
  intel: LiveIntel | null;
  colors: typeof Colors.light;
  accent: string;
  timelineFilter: TimelineFilter;
  setTimelineFilter: (v: TimelineFilter) => void;
  boxExpanded: boolean;
  setBoxExpanded: (v: boolean) => void;
  boxScore?: BoxScoreLine[];
}) {
  const scoreParts = game.score?.replace(/^[WL]\s*/, '').split('-') ?? [];

  return (
    <>
      {/* ═══════ BLOCK 1 — LIVE SCORE STRIP ═══════ */}
      <View style={[s.liveScoreCard, { backgroundColor: colors.card, borderColor: Brand.error + '30' }]}>
        <View style={s.liveScoreRow}>
          <View style={s.liveTeamCol}>
            <Text style={[s.liveTeamLabel, { color: colors.textSecondary }]}>FMU</Text>
            <Text style={[s.liveScoreNum, { color: colors.text }]}>{scoreParts[0] ?? '0'}</Text>
          </View>
          <View style={s.liveDivider}>
            <Text style={[s.liveDividerText, { color: colors.textTertiary }]}>–</Text>
          </View>
          <View style={s.liveTeamCol}>
            <Text style={[s.liveTeamLabel, { color: colors.textSecondary }]}>{game.opponent.split(' ').pop()}</Text>
            <Text style={[s.liveScoreNum, { color: colors.text }]}>{scoreParts[1] ?? '0'}</Text>
          </View>
        </View>
        {game.clock && (
          <Text style={[s.liveClock, { color: Brand.error }]}>{game.clock}</Text>
        )}
      </View>

      {/* ═══════ BLOCK 2 — HERO ═══════ */}
      <View style={[s.liveHeroPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="play.rectangle.fill" size={32} color={colors.textTertiary} />
        <Text style={[s.liveHeroText, { color: colors.textTertiary }]}>Stats-only live</Text>
      </View>

      {/* ═══════ BLOCK 3 — KANEXT INTEL STRIP (Live) ═══════ */}
      <SectionLabel text="KANEXT INTEL" colors={colors} />

      {intel ? (
        <>
          {/* Card 1 — Plan vs Reality */}
          <PlanVsRealityCard pvr={intel.planVsReality} colors={colors} accent={accent} />

          {/* Card 2 — Live Risk Flags */}
          <View style={[s.intelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.intelCardHeader}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color={Brand.error} />
              <Text style={[s.intelCardTitle, { color: colors.text }]}>Live Risk Flags</Text>
            </View>
            {intel.riskFlags.map(f => (
              <View key={f.id} style={s.riskFlagRow}>
                <View style={[s.riskDot, { backgroundColor: f.severity === 'high' ? Brand.error : Brand.warning }]} />
                <Text style={[s.riskFlagText, { color: colors.textSecondary }]}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Card 3 — Next Dead Ball */}
          <View style={[s.intelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.intelCardHeader}>
              <IconSymbol name="hand.raised.fill" size={14} color={Brand.primary} />
              <Text style={[s.intelCardTitle, { color: colors.text }]}>Next Dead Ball</Text>
            </View>
            {intel.nextDeadBall.map(b => (
              <View key={b.id} style={s.bulletRow}>
                <Text style={[s.bulletDot, { color: accent }]}>{'\u2022'}</Text>
                <Text style={[s.bulletText, { color: colors.textSecondary }]}>{b.text}</Text>
              </View>
            ))}
            <Pressable
              style={[s.askNexusBtn, { backgroundColor: accent + '15' }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="brain" size={14} color={accent} />
              <Text style={[s.askNexusText, { color: accent }]}>Ask Nexus</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={[s.intelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.emptyIntelText, { color: colors.textTertiary }]}>
            Live intel requires a pregame simulation.
          </Text>
        </View>
      )}

      {/* ═══════ BLOCK 4 — TIMELINE ═══════ */}
      {intel && (
        <>
          <SectionLabel text="TIMELINE" colors={colors} />
          <TimelineFilterPills
            filter={timelineFilter}
            setFilter={setTimelineFilter}
            colors={colors}
            accent={accent}
          />
          <TimelineList
            entries={intel.timeline}
            filter={timelineFilter}
            colors={colors}
          />
        </>
      )}

      {/* ═══════ BLOCK 5 — BOX (Collapsed) ═══════ */}
      {boxScore && (
        <>
          <SectionLabel text="BOX SCORE" colors={colors} />
          <CollapsibleBox
            boxScore={boxScore}
            expanded={boxExpanded}
            setExpanded={setBoxExpanded}
            colors={colors}
            accent={accent}
          />
        </>
      )}

      <Text style={[s.rbacFooter, { color: colors.textTertiary }]}>
        All modifications route through Nexus.
      </Text>
    </>
  );
}

// =============================================================================
// FINAL STATE
// =============================================================================

function FinalState({
  game, intel, colors, accent, finalSubnav, setFinalSubnav, timelineFilter, setTimelineFilter, boxScore, onOpenGamePlan, onOpenSimulation,
}: {
  game: KaNeXTGame;
  intel: FinalIntel;
  colors: typeof Colors.light;
  accent: string;
  finalSubnav: FinalSubnav;
  setFinalSubnav: (v: FinalSubnav) => void;
  timelineFilter: TimelineFilter;
  setTimelineFilter: (v: TimelineFilter) => void;
  boxScore?: BoxScoreLine[];
  onOpenGamePlan?: () => void;
  onOpenSimulation?: () => void;
}) {
  const scoreParts = game.score?.replace(/^[WL]\s*/, '').split('-') ?? [];
  const isWin = game.score?.startsWith('W');
  const isLoss = game.score?.startsWith('L');

  return (
    <>
      {/* ═══════ BLOCK 1 — FINAL SCORE HERO ═══════ */}
      <View style={[s.finalScoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.liveScoreRow}>
          <View style={s.liveTeamCol}>
            <Text style={[s.liveTeamLabel, { color: colors.textSecondary }]}>FMU</Text>
            <Text style={[s.liveScoreNum, { color: colors.text }]}>{scoreParts[0] ?? '—'}</Text>
          </View>
          <View style={s.liveDivider}>
            <Text style={[s.liveDividerText, { color: colors.textTertiary }]}>–</Text>
          </View>
          <View style={s.liveTeamCol}>
            <Text style={[s.liveTeamLabel, { color: colors.textSecondary }]}>{game.opponent.split(' ').pop()}</Text>
            <Text style={[s.liveScoreNum, { color: colors.text }]}>{scoreParts[1] ?? '—'}</Text>
          </View>
        </View>
        {(isWin || isLoss) && (
          <View style={[s.wlChip, { backgroundColor: isWin ? Brand.success + '20' : Brand.error + '20' }]}>
            <Text style={[s.wlChipText, { color: isWin ? Brand.success : Brand.error }]}>
              {isWin ? 'W' : 'L'}
            </Text>
          </View>
        )}
        <Text style={[s.finalMeta, { color: colors.textTertiary }]}>
          {game.date} · {game.location === 'Home' ? 'Home' : 'Away'} · {game.venue ?? ''}
        </Text>
        {/* Chips */}
        <View style={s.heroChips}>
          <Pressable
            style={[s.heroChip, { backgroundColor: colors.border + '40', borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="play.rectangle.fill" size={12} color={colors.textSecondary} />
            <Text style={[s.heroChipText, { color: colors.textSecondary }]}>Recap Film</Text>
          </Pressable>
        </View>
      </View>

      {/* ═══════ BLOCK 2 — KANEXT INTEL STRIP (Final) ═══════ */}
      <SectionLabel text="KANEXT INTEL" colors={colors} />

      {/* Card 1 — What Decided the Game */}
      <IntelCard
        title="What Decided the Game"
        icon="flame.fill"
        bullets={intel.whatDecided}
        emptyText="Import box score to populate."
        colors={colors}
        accent={Brand.warning}
      />

      {/* Card 2 — Plan vs Reality */}
      <PlanVsRealityCard pvr={intel.planVsReality} colors={colors} accent={accent} />

      {/* Card 3 — Next Game Fix List */}
      <IntelCard
        title="Next Game Fix List"
        icon="wrench.and.screwdriver.fill"
        bullets={intel.nextGameFix}
        emptyText="No fixes generated yet."
        colors={colors}
        accent={accent}
      />

      {/* ═══════ BLOCK 3 — SUBNAV PILLS ═══════ */}
      <View style={[s.subnavRow, { borderBottomColor: colors.border }]}>
        {(['timeline', 'box', 'intel'] as FinalSubnav[]).map(tab => {
          const active = finalSubnav === tab;
          const label = tab === 'timeline' ? 'Timeline' : tab === 'box' ? 'Box' : 'Intel';
          return (
            <Pressable
              key={tab}
              style={[s.subnavPill, { backgroundColor: active ? accent + '20' : colors.card, borderColor: active ? accent : colors.border }]}
              onPress={() => {
                setFinalSubnav(tab);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[s.subnavPillText, { color: active ? accent : colors.textSecondary }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Subnav Content */}
      {finalSubnav === 'timeline' && (
        <>
          <TimelineFilterPills filter={timelineFilter} setFilter={setTimelineFilter} colors={colors} accent={accent} />
          <TimelineList entries={intel.timeline} filter={timelineFilter} colors={colors} />
        </>
      )}

      {finalSubnav === 'box' && boxScore && (
        <BoxScoreTable boxScore={boxScore} colors={colors} accent={accent} />
      )}
      {finalSubnav === 'box' && !boxScore && (
        <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.emptyIntelText, { color: colors.textTertiary }]}>Box score not available.</Text>
        </View>
      )}

      {finalSubnav === 'intel' && (
        <View style={s.intelLinks}>
          <Pressable
            style={[s.intelLinkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              onOpenGamePlan?.();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol name="doc.text.fill" size={16} color={accent} />
            <Text style={[s.intelLinkText, { color: colors.text }]}>Game Plan Snapshot</Text>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
          <Pressable
            style={[s.intelLinkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              onOpenSimulation?.();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol name="chart.bar.fill" size={16} color={Brand.primary} />
            <Text style={[s.intelLinkText, { color: colors.text }]}>Simulation Snapshot</Text>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
          <Pressable
            style={[s.intelLinkCard, { backgroundColor: accent + '10', borderColor: accent + '30' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="brain" size={16} color={accent} />
            <Text style={[s.intelLinkText, { color: accent }]}>Create Postgame Review in Nexus</Text>
            <IconSymbol name="chevron.right" size={12} color={accent} />
          </Pressable>
        </View>
      )}

      <Text style={[s.rbacFooter, { color: colors.textTertiary }]}>
        All modifications route through Nexus.
      </Text>
    </>
  );
}

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionLabel({ text, colors }: { text: string; colors: typeof Colors.light }) {
  return (
    <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>{text}</Text>
  );
}

function IntelCard({
  title, icon, bullets, emptyText, colors, accent,
}: {
  title: string;
  icon: string;
  bullets: IntelBullet[];
  emptyText: string;
  colors: typeof Colors.light;
  accent: string;
}) {
  return (
    <View style={[s.intelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={s.intelCardHeader}>
        <IconSymbol name={icon as any} size={14} color={accent} />
        <Text style={[s.intelCardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {bullets.length > 0 ? bullets.map(b => (
        <View key={b.id} style={s.bulletRow}>
          <Text style={[s.bulletDot, {
            color: b.impact === 'positive' ? Brand.success
              : b.impact === 'negative' ? Brand.error
              : accent,
          }]}>{'\u2022'}</Text>
          <Text style={[s.bulletText, { color: colors.textSecondary }]}>{b.text}</Text>
        </View>
      )) : (
        <Text style={[s.emptyIntelText, { color: colors.textTertiary }]}>{emptyText}</Text>
      )}
    </View>
  );
}

function PlanVsProfileCard({
  profile, colors, accent,
}: {
  profile: PlanVsProfile;
  colors: typeof Colors.light;
  accent: string;
}) {
  const rows: { label: string; ours: string; theirs: string }[] = [
    { label: 'Pace', ours: profile.pace.plan, theirs: profile.pace.opponent },
    { label: 'Shot Diet', ours: profile.shotDiet.plan, theirs: profile.shotDiet.opponent },
    { label: 'Pressure', ours: profile.pressure.plan, theirs: profile.pressure.opponent },
  ];

  return (
    <View style={[s.pvpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Column headers */}
      <View style={s.pvpHeaderRow}>
        <View style={s.pvpLabelCol} />
        <Text style={[s.pvpColHeader, { color: accent }]}>Our Plan</Text>
        <Text style={[s.pvpColHeader, { color: colors.textTertiary }]}>Opponent</Text>
      </View>
      {rows.map(r => (
        <View key={r.label} style={s.pvpRow}>
          <Text style={[s.pvpLabel, { color: colors.textTertiary }]}>{r.label}</Text>
          <Text style={[s.pvpValue, { color: colors.text }]}>{r.ours}</Text>
          <Text style={[s.pvpValue, { color: colors.textSecondary }]}>{r.theirs}</Text>
        </View>
      ))}
      {/* System labels */}
      <View style={[s.pvpSystemRow, { borderTopColor: colors.border }]}>
        <Text style={[s.pvpSystemLabel, { color: colors.textTertiary }]}>OSIE</Text>
        <Text style={[s.pvpSystemValue, { color: colors.textSecondary }]}>{profile.osie}</Text>
      </View>
      <View style={s.pvpSystemRow}>
        <Text style={[s.pvpSystemLabel, { color: colors.textTertiary }]}>DSIE</Text>
        <Text style={[s.pvpSystemValue, { color: colors.textSecondary }]}>{profile.dsie}</Text>
      </View>
    </View>
  );
}

function PlanVsRealityCard({
  pvr, colors, accent,
}: {
  pvr: PlanVsReality;
  colors: typeof Colors.light;
  accent: string;
}) {
  const rows: { label: string; planned: string; actual: string; delta: string }[] = [
    { label: 'Pace', ...pvr.pace },
    { label: 'Shot Diet', ...pvr.shotDiet },
    { label: 'Turnovers', ...pvr.turnovers },
    { label: 'Rebounds', ...pvr.rebounds },
    { label: 'Free Throws', ...pvr.freeThrows },
  ];

  return (
    <View style={[s.intelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={s.intelCardHeader}>
        <IconSymbol name="arrow.left.arrow.right" size={14} color={accent} />
        <Text style={[s.intelCardTitle, { color: colors.text }]}>Plan vs Reality</Text>
      </View>
      {/* Column headers */}
      <View style={s.pvrHeaderRow}>
        <View style={s.pvrLabelCol} />
        <Text style={[s.pvrColHeader, { color: colors.textTertiary }]}>Plan</Text>
        <Text style={[s.pvrColHeader, { color: colors.textTertiary }]}>Actual</Text>
        <Text style={[s.pvrColHeader, { color: colors.textTertiary }]}>Delta</Text>
      </View>
      {rows.map(r => {
        const isNeg = r.delta.startsWith('-') || r.delta.startsWith('+') && r.label === 'Turnovers';
        const deltaColor = r.delta === '—' ? colors.textTertiary
          : r.delta.startsWith('+') && r.label !== 'Turnovers' ? Brand.success
          : r.delta.startsWith('-') && r.label !== 'Turnovers' ? Brand.error
          : r.delta.startsWith('+') && r.label === 'Turnovers' ? Brand.error
          : r.delta.startsWith('-') && r.label === 'Turnovers' ? Brand.success
          : colors.textSecondary;
        return (
          <View key={r.label} style={s.pvrRow}>
            <Text style={[s.pvrLabel, { color: colors.textTertiary }]}>{r.label}</Text>
            <Text style={[s.pvrValue, { color: colors.textSecondary }]}>{r.planned}</Text>
            <Text style={[s.pvrValue, { color: colors.text }]}>{r.actual}</Text>
            <Text style={[s.pvrValue, { color: deltaColor, fontWeight: '700' }]}>{r.delta}</Text>
          </View>
        );
      })}
    </View>
  );
}

function TimelineFilterPills({
  filter, setFilter, colors, accent,
}: {
  filter: TimelineFilter;
  setFilter: (v: TimelineFilter) => void;
  colors: typeof Colors.light;
  accent: string;
}) {
  return (
    <View style={s.filterRow}>
      {(['all', 'scoring', 'foul', 'turnover'] as TimelineFilter[]).map(f => {
        const active = filter === f;
        const label = f === 'all' ? 'All' : f === 'scoring' ? 'Scoring' : f === 'foul' ? 'Fouls' : 'TO';
        return (
          <Pressable
            key={f}
            style={[s.filterPill, { backgroundColor: active ? accent + '20' : colors.card, borderColor: active ? accent : colors.border }]}
            onPress={() => {
              setFilter(f);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[s.filterPillText, { color: active ? accent : colors.textSecondary }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TimelineList({
  entries, filter, colors,
}: {
  entries: PlayByPlayEntry[];
  filter: TimelineFilter;
  colors: typeof Colors.light;
}) {
  const filtered = filter === 'all' ? entries : entries.filter(e => e.tag === filter);

  if (filtered.length === 0) {
    return (
      <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[s.emptyIntelText, { color: colors.textTertiary }]}>No matching plays.</Text>
      </View>
    );
  }

  return (
    <View style={s.timelineList}>
      {filtered.map(e => {
        const tagColor = e.tag === 'scoring' ? Brand.success
          : e.tag === 'foul' ? Brand.warning
          : e.tag === 'turnover' ? Brand.error
          : colors.textTertiary;
        return (
          <View key={e.id} style={[s.timelineRow, { borderBottomColor: colors.border }]}>
            <Text style={[s.timelineTime, { color: colors.textTertiary }]}>{e.time}</Text>
            <View style={s.timelineContent}>
              <Text style={[s.timelineAction, { color: colors.text }]}>{e.action}</Text>
              <View style={s.timelineMeta}>
                <Text style={[s.timelineScore, { color: colors.textSecondary }]}>{e.scoreAfter}</Text>
                <View style={[s.timelineTag, { backgroundColor: tagColor + '18' }]}>
                  <Text style={[s.timelineTagText, { color: tagColor }]}>{e.tag}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function CollapsibleBox({
  boxScore, expanded, setExpanded, colors, accent,
}: {
  boxScore: BoxScoreLine[];
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  colors: typeof Colors.light;
  accent: string;
}) {
  // Team totals
  const totals = useMemo(() => {
    let pts = 0, reb = 0, ast = 0, stl = 0, blk = 0, to = 0;
    for (const p of boxScore) {
      pts += p.pts; reb += p.reb; ast += p.ast; stl += p.stl; blk += p.blk; to += p.to;
    }
    return { pts, reb, ast, stl, blk, to };
  }, [boxScore]);

  return (
    <View style={[s.boxCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        style={s.boxHeaderPress}
        onPress={() => {
          setExpanded(!expanded);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={[s.boxHeaderText, { color: colors.text }]}>
          Team: {totals.pts} PTS · {totals.reb} REB · {totals.ast} AST
        </Text>
        <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={colors.textTertiary} />
      </Pressable>

      {expanded && (
        <BoxScoreTable boxScore={boxScore} colors={colors} accent={accent} />
      )}
    </View>
  );
}

function BoxScoreTable({
  boxScore, colors, accent,
}: {
  boxScore: BoxScoreLine[];
  colors: typeof Colors.light;
  accent: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.boxTableScroll}>
      <View>
        {/* Header */}
        <View style={[s.boxRow, { borderBottomColor: colors.border }]}>
          <Text style={[s.boxCellName, s.boxHeaderCell, { color: colors.textTertiary }]}>Player</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>MIN</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>PTS</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>REB</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>AST</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>FG</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>3PT</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>STL</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>BLK</Text>
          <Text style={[s.boxCell, s.boxHeaderCell, { color: colors.textTertiary }]}>TO</Text>
        </View>
        {/* Player rows */}
        {boxScore.map((p, i) => (
          <View key={i} style={[s.boxRow, { borderBottomColor: colors.border }]}>
            <Text style={[s.boxCellName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
            <Text style={[s.boxCell, { color: colors.textSecondary }]}>{p.min}</Text>
            <Text style={[s.boxCell, { color: colors.text, fontWeight: '700' }]}>{p.pts}</Text>
            <Text style={[s.boxCell, { color: colors.textSecondary }]}>{p.reb}</Text>
            <Text style={[s.boxCell, { color: colors.textSecondary }]}>{p.ast}</Text>
            <Text style={[s.boxCell, { color: colors.textSecondary }]}>{p.fg}</Text>
            <Text style={[s.boxCell, { color: colors.textSecondary }]}>{p.threePt}</Text>
            <Text style={[s.boxCell, { color: colors.textSecondary }]}>{p.stl}</Text>
            <Text style={[s.boxCell, { color: colors.textSecondary }]}>{p.blk}</Text>
            <Text style={[s.boxCell, { color: colors.textSecondary }]}>{p.to}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
    gap: 8,
  },
  backBtn: { width: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 1 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  liveRedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Brand.error },

  scroll: { flex: 1 },

  // ── Hero (Preview) ──
  heroCard: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  heroLogos: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  heroLogo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  heroLogoText: { fontSize: 16, fontWeight: '800' },
  heroVs: { fontSize: 12, fontWeight: '600' },
  heroOpponent: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  heroMeta: { fontSize: 12, textAlign: 'center', marginBottom: 12 },
  heroChips: { flexDirection: 'row', gap: 8 },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  heroChipText: { fontSize: 12, fontWeight: '600' },

  // ── Section Label ──
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: 8,
    marginHorizontal: Spacing.md,
  },

  // ── Intel Cards ──
  intelCard: {
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  intelCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  intelCardTitle: { fontSize: 14, fontWeight: '700' },

  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6, paddingRight: 8 },
  bulletDot: { fontSize: 14, lineHeight: 20 },
  bulletText: { fontSize: 13, lineHeight: 20, flex: 1 },

  emptyIntelText: { fontSize: 13, fontStyle: 'italic' },
  emptyCard: {
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },

  // ── Risk Flags ──
  riskFlagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskFlagText: { fontSize: 13, flex: 1 },

  // ── Ask Nexus ──
  askNexusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  askNexusText: { fontSize: 13, fontWeight: '700' },

  // ── Plan vs Profile ──
  pvpCard: {
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  pvpHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  pvpLabelCol: { width: 80 },
  pvpColHeader: { flex: 1, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  pvpRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pvpLabel: { width: 80, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  pvpValue: { flex: 1, fontSize: 13, fontWeight: '600' },
  pvpSystemRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  pvpSystemLabel: { width: 80, fontSize: 10, fontWeight: '700' },
  pvpSystemValue: { flex: 1, fontSize: 12, fontWeight: '500' },

  // ── Plan vs Reality ──
  pvrHeaderRow: { flexDirection: 'row', marginBottom: 6 },
  pvrLabelCol: { width: 80 },
  pvrColHeader: { flex: 1, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
  pvrRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  pvrLabel: { width: 80, fontSize: 11, fontWeight: '600' },
  pvrValue: { flex: 1, fontSize: 12, fontWeight: '500', textAlign: 'center' },

  // ── Feed Card ──
  feedCard: {
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  feedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  feedChipText: { fontSize: 12, fontWeight: '600' },

  // ── Live Score ──
  liveScoreCard: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  liveScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  liveTeamCol: { alignItems: 'center' },
  liveTeamLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  liveScoreNum: { fontSize: 36, fontWeight: '900' },
  liveDivider: { paddingHorizontal: 4 },
  liveDividerText: { fontSize: 24, fontWeight: '300' },
  liveClock: { fontSize: 14, fontWeight: '700', marginTop: 8 },

  // ── Live Hero ──
  liveHeroPlaceholder: {
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  liveHeroText: { fontSize: 13, fontWeight: '600' },

  // ── Final Score ──
  finalScoreCard: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  wlChip: { paddingHorizontal: 12, paddingVertical: 3, borderRadius: BorderRadius.sm, marginTop: 8 },
  wlChipText: { fontSize: 13, fontWeight: '800' },
  finalMeta: { fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 10 },

  // ── Subnav ──
  subnavRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginTop: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subnavPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  subnavPillText: { fontSize: 12, fontWeight: '600' },

  // ── Filter pills (timeline) ──
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 11, fontWeight: '600' },

  // ── Timeline ──
  timelineList: { marginHorizontal: Spacing.md },
  timelineRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timelineTime: { width: 56, fontSize: 11, fontWeight: '600' },
  timelineContent: { flex: 1 },
  timelineAction: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  timelineMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineScore: { fontSize: 12, fontWeight: '700' },
  timelineTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  timelineTagText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },

  // ── Box Score ──
  boxCard: {
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  boxHeaderPress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  boxHeaderText: { fontSize: 14, fontWeight: '700' },
  boxTableScroll: { paddingHorizontal: 10, paddingBottom: 10 },
  boxRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 6 },
  boxCellName: { width: 120, fontSize: 12, fontWeight: '600', paddingRight: 8 },
  boxCell: { width: 44, fontSize: 12, textAlign: 'center' },
  boxHeaderCell: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  // ── Intel Links (Final) ──
  intelLinks: { marginHorizontal: Spacing.md, marginTop: 8, gap: 8 },
  intelLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  intelLinkText: { fontSize: 14, fontWeight: '600', flex: 1 },

  // ── RBAC Footer ──
  rbacFooter: { fontSize: 11, textAlign: 'center', marginTop: Spacing.lg, marginBottom: Spacing.md },
});
