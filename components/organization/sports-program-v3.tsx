/**
 * Sports Program V3 — A2 (Assistant Coach) Single-Scroll Page
 * 8 blocks: Header, Team Rating, Team System, Recruiting Constraints,
 *           Availability, Schedule, Coach Ops, Data Coverage
 *
 * Interactive: Coach Ops drill into domain pages, events open Event Sheet,
 * Next Game taps into Game Plan, players open Player Sheet.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { PROGRAM_IDENTITY } from '@/data/mock-sports-org-program-v2';
import { KaNeXT_NEXT_GAME, KaNeXT_SEASON_COMPLETE } from '@/data/fmu';
import { getKRColor } from '@/utils/kr-display';
import { openPlayerCard, openEventSheet } from '@/utils/global-entity-sheets';
import { StatisticsPage } from '@/components/stats/statistics-page';
import { GamePlanPage } from '@/components/game-plan/game-plan-page';
import { SimulationPage } from '@/components/simulation/simulation-page';
import { DevelopmentPage } from '@/components/development/development-page';
import {
  TEAM_RATING,
  TEAM_SYSTEM,
  RECRUITING_CONSTRAINTS,
  AVAILABILITY,
  UPCOMING_EVENTS,
  COACH_OPS_SHORTCUTS,
  DATA_COVERAGE,
  AVAILABILITY_STATUS_COLORS,
  EVENT_TYPE_ICONS,
} from '@/data/mock-program-page';
import type { RotationPlayer, UpcomingEvent } from '@/data/mock-program-page';

// =============================================================================
// TYPES
// =============================================================================

type DrillTarget = 'stats' | 'game-plan' | 'simulation' | 'development' | null;

/** Maps Coach Ops shortcut labels → drill-down targets */
const OPS_DRILL_MAP: Record<string, DrillTarget> = {
  Statistics: 'stats',
  'Game Plan': 'game-plan',
  Simulation: 'simulation',
  Development: 'development',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function SectionHeader({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function Card({ colors, children, style }: { colors: typeof Colors.light; children: React.ReactNode; style?: object }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

function ProgressBar({ value, max, color, colors }: { value: number; max: number; color: string; colors: typeof Colors.light }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
      <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// BLOCK 0 — HEADER
// =============================================================================

function HeaderBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <View style={s.headerBlock}>
      <ThemedText style={[s.headerTitle, { color: colors.text }]}>
        {PROGRAM_IDENTITY.programName}
      </ThemedText>
      <ThemedText style={[s.headerSub, { color: colors.textSecondary }]}>
        {PROGRAM_IDENTITY.orgName} · {PROGRAM_IDENTITY.level} · {PROGRAM_IDENTITY.conference}
      </ThemedText>
      <View style={[s.seasonChip, { backgroundColor: accentColor + '20' }]}>
        <ThemedText style={[s.seasonChipText, { color: accentColor }]}>
          {PROGRAM_IDENTITY.season}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — TEAM RATING
// =============================================================================

function TeamRatingBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const krColor = getKRColor(TEAM_RATING.teamKR);
  const rankings = [
    { label: 'Conference', rank: TEAM_RATING.rankings.conference.rank, total: TEAM_RATING.rankings.conference.total },
    { label: 'Division', rank: TEAM_RATING.rankings.division.rank, total: TEAM_RATING.rankings.division.total },
    { label: 'Universal', rank: TEAM_RATING.rankings.universal.rank, total: TEAM_RATING.rankings.universal.total },
  ];

  return (
    <>
      <SectionHeader label="TEAM RATING" colors={colors} />
      <Card colors={colors}>
        {/* 3-column KR display */}
        <View style={s.krRow}>
          <View style={s.krMain}>
            <ThemedText style={[s.krValue, { color: krColor }]}>
              {TEAM_RATING.teamKR}
            </ThemedText>
            <ThemedText style={[s.krLabel, { color: colors.textSecondary }]}>Team KR</ThemedText>
          </View>
          <View style={s.krSub}>
            <ThemedText style={[s.krSubValue, { color: getKRColor(TEAM_RATING.offKR) }]}>
              {TEAM_RATING.offKR}
            </ThemedText>
            <ThemedText style={[s.krSubLabel, { color: colors.textSecondary }]}>Off</ThemedText>
          </View>
          <View style={s.krSub}>
            <ThemedText style={[s.krSubValue, { color: getKRColor(TEAM_RATING.defKR) }]}>
              {TEAM_RATING.defKR}
            </ThemedText>
            <ThemedText style={[s.krSubLabel, { color: colors.textSecondary }]}>Def</ThemedText>
          </View>
        </View>

        {/* Fit & Confidence mini bars */}
        <View style={s.miniBarsRow}>
          <View style={s.miniBarCol}>
            <View style={s.miniBarHeader}>
              <ThemedText style={[s.miniBarLabel, { color: colors.textSecondary }]}>Fit</ThemedText>
              <ThemedText style={[s.miniBarPct, { color: colors.text }]}>{TEAM_RATING.fitPct}%</ThemedText>
            </View>
            <ProgressBar value={TEAM_RATING.fitPct} max={100} color="#22C55E" colors={colors} />
          </View>
          <View style={s.miniBarCol}>
            <View style={s.miniBarHeader}>
              <ThemedText style={[s.miniBarLabel, { color: colors.textSecondary }]}>Confidence</ThemedText>
              <ThemedText style={[s.miniBarPct, { color: colors.text }]}>{TEAM_RATING.confidencePct}%</ThemedText>
            </View>
            <ProgressBar value={TEAM_RATING.confidencePct} max={100} color={accentColor} colors={colors} />
          </View>
        </View>

        {/* Where We Rank */}
        <View style={[s.rankSection, { borderTopColor: colors.border }]}>
          <ThemedText style={[s.rankTitle, { color: colors.textSecondary }]}>WHERE WE RANK</ThemedText>
          {rankings.map((r) => (
            <Pressable
              key={r.label}
              style={({ pressed }) => [s.rankRow, pressed && { opacity: 0.7 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <ThemedText style={[s.rankLabel, { color: colors.text }]}>{r.label}</ThemedText>
              <View style={s.rankRight}>
                <ThemedText style={[s.rankValue, { color: accentColor }]}>
                  #{r.rank}
                </ThemedText>
                <ThemedText style={[s.rankTotal, { color: colors.textSecondary }]}>
                  /{r.total}
                </ThemedText>
                <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
              </View>
            </Pressable>
          ))}
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 2 — TEAM SYSTEM
// =============================================================================

function TeamSystemBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const statusColor = TEAM_SYSTEM.status === 'PROVISIONAL' ? '#F59E0B' : '#22C55E';

  return (
    <>
      <SectionHeader label="TEAM SYSTEM" colors={colors} />
      <Card colors={colors}>
        <View style={s.systemRow}>
          <IconSymbol name="sportscourt.fill" size={16} color={accentColor} />
          <View style={s.systemInfo}>
            <ThemedText style={[s.systemLabel, { color: colors.textSecondary }]}>Offense</ThemedText>
            <ThemedText style={[s.systemValue, { color: colors.text }]}>{TEAM_SYSTEM.offense}</ThemedText>
          </View>
        </View>
        <View style={[s.systemRow, { marginTop: 12 }]}>
          <IconSymbol name="shield.fill" size={16} color={accentColor} />
          <View style={s.systemInfo}>
            <ThemedText style={[s.systemLabel, { color: colors.textSecondary }]}>Defense</ThemedText>
            <ThemedText style={[s.systemValue, { color: colors.text }]}>{TEAM_SYSTEM.defense}</ThemedText>
          </View>
        </View>

        <View style={[s.systemMeta, { borderTopColor: colors.border }]}>
          <View style={s.tempoRow}>
            <IconSymbol name="gauge.medium" size={14} color={colors.textSecondary} />
            <ThemedText style={[s.tempoText, { color: colors.text }]}>{TEAM_SYSTEM.tempo}</ThemedText>
          </View>
          <View style={[s.statusChip, { backgroundColor: statusColor + '20' }]}>
            <ThemedText style={[s.statusChipText, { color: statusColor }]}>{TEAM_SYSTEM.status}</ThemedText>
          </View>
        </View>

        <ThemedText style={[s.helperText, { color: colors.textTertiary }]}>
          Ask Nexus to suggest system changes
        </ThemedText>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 3 — RECRUITING CONSTRAINTS
// =============================================================================

function RecruitingConstraintsBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const rc = RECRUITING_CONSTRAINTS;
  const nilRemaining = rc.nilBudget - rc.nilSpent;
  const scholarshipPct = rc.scholarshipsUsed / rc.scholarshipsTotal;
  const scholarshipColor = scholarshipPct >= 0.9 ? '#F59E0B' : '#22C55E';

  return (
    <>
      <SectionHeader label="RECRUITING CONSTRAINTS" colors={colors} />
      <Card colors={colors}>
        {/* Scholarships */}
        <View style={s.constraintRow}>
          <View style={s.constraintHeader}>
            <ThemedText style={[s.constraintLabel, { color: colors.text }]}>Scholarships</ThemedText>
            <ThemedText style={[s.constraintValue, { color: colors.textSecondary }]}>
              {rc.scholarshipsUsed}/{rc.scholarshipsTotal}
            </ThemedText>
          </View>
          <ProgressBar value={rc.scholarshipsUsed} max={rc.scholarshipsTotal} color={scholarshipColor} colors={colors} />
        </View>

        {/* NIL Budget */}
        <View style={[s.constraintRow, { marginTop: 14 }]}>
          <View style={s.constraintHeader}>
            <ThemedText style={[s.constraintLabel, { color: colors.text }]}>NIL Budget</ThemedText>
            <ThemedText style={[s.constraintValue, { color: colors.textSecondary }]}>
              ${(rc.nilSpent / 1000).toFixed(1)}K / ${(rc.nilBudget / 1000).toFixed(0)}K
            </ThemedText>
          </View>
          <ProgressBar value={rc.nilSpent} max={rc.nilBudget} color={accentColor} colors={colors} />
          <ThemedText style={[s.remainingText, { color: colors.textTertiary }]}>
            ${(nilRemaining / 1000).toFixed(1)}K remaining
          </ThemedText>
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 4 — AVAILABILITY
// =============================================================================

function AvailabilityBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const counts = [
    { label: 'Available', value: AVAILABILITY.available, color: '#22C55E' },
    { label: 'Injured', value: AVAILABILITY.injured, color: '#EF4444' },
    { label: 'Out', value: AVAILABILITY.out, color: '#F59E0B' },
    { label: 'Redshirt', value: AVAILABILITY.redshirt, color: '#A1A1AA' },
  ];

  const handlePlayerTap = (player: RotationPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openPlayerCard({
      name: player.name,
      number: player.number,
      position: player.position,
      height: '',
      weight: 0,
      classYear: '',
      kr: player.kr,
      teamColor: accentColor,
    });
  };

  return (
    <>
      <SectionHeader label="AVAILABILITY" colors={colors} />
      <Card colors={colors}>
        {/* Count row */}
        <View style={s.countRow}>
          {counts.map((c) => (
            <View key={c.label} style={s.countItem}>
              <ThemedText style={[s.countValue, { color: c.color }]}>{c.value}</ThemedText>
              <ThemedText style={[s.countLabel, { color: colors.textSecondary }]}>{c.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Rotation list */}
        <View style={[s.rotationSection, { borderTopColor: colors.border }]}>
          <ThemedText style={[s.rotationTitle, { color: colors.textSecondary }]}>ROTATION</ThemedText>
          {AVAILABILITY.rotation.map((player) => (
            <Pressable
              key={player.id}
              style={({ pressed }) => [s.playerRow, pressed && { opacity: 0.7 }]}
              onPress={() => handlePlayerTap(player)}
            >
              <ThemedText style={[s.playerNumber, { color: colors.textTertiary }]}>
                #{player.number}
              </ThemedText>
              <ThemedText style={[s.playerName, { color: colors.text }]} numberOfLines={1}>
                {player.name}
              </ThemedText>
              <ThemedText style={[s.playerPos, { color: colors.textSecondary }]}>
                {player.position}
              </ThemedText>
              <ThemedText style={[s.playerKR, { color: getKRColor(player.kr) }]}>
                {player.kr}
              </ThemedText>
              <View
                style={[
                  s.statusDot,
                  { backgroundColor: AVAILABILITY_STATUS_COLORS[player.status] },
                ]}
              />
            </Pressable>
          ))}
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 5 — SCHEDULE
// =============================================================================

function ScheduleBlock({ colors, accentColor, onDrill }: { colors: typeof Colors.light; accentColor: string; onDrill: (t: DrillTarget) => void }) {
  const handleEventTap = (event: UpcomingEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openEventSheet({
      title: event.title,
      time: event.time,
      type: event.type === 'game' ? 'game' : event.type === 'practice' ? 'practice' : 'other',
    });
  };

  const handleNextGameTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDrill('game-plan');
  };

  return (
    <>
      <SectionHeader label="SCHEDULE" colors={colors} />
      {/* Next Game */}
      {KaNeXT_SEASON_COMPLETE ? (
        <Card colors={colors}>
          <View style={s.nextGameRow}>
            <IconSymbol name="trophy.fill" size={18} color={accentColor} />
            <ThemedText style={[s.nextGameTitle, { color: colors.text }]}>Season Complete</ThemedText>
          </View>
        </Card>
      ) : KaNeXT_NEXT_GAME ? (
        <Pressable
          onPress={handleNextGameTap}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Card colors={colors}>
            <ThemedText style={[s.nextGameLabel, { color: colors.textSecondary }]}>NEXT GAME</ThemedText>
            <View style={s.nextGameRow}>
              <IconSymbol name="sportscourt.fill" size={18} color={accentColor} />
              <View style={s.nextGameInfo}>
                <ThemedText style={[s.nextGameTitle, { color: colors.text }]}>
                  vs. {KaNeXT_NEXT_GAME.opponent}
                </ThemedText>
                <ThemedText style={[s.nextGameDetail, { color: colors.textSecondary }]}>
                  {KaNeXT_NEXT_GAME.date} · {KaNeXT_NEXT_GAME.location}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </View>
          </Card>
        </Pressable>
      ) : null}

      {/* Upcoming Events */}
      <Card colors={colors} style={{ marginTop: 0 }}>
        <ThemedText style={[s.upcomingLabel, { color: colors.textSecondary }]}>UPCOMING</ThemedText>
        {UPCOMING_EVENTS.map((event, idx) => (
          <Pressable
            key={event.id}
            onPress={() => handleEventTap(event)}
            style={({ pressed }) => [
              s.eventRow,
              idx < UPCOMING_EVENTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol
              name={EVENT_TYPE_ICONS[event.type] as any}
              size={14}
              color={colors.textTertiary}
            />
            <View style={s.eventInfo}>
              <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={1}>
                {event.title}
              </ThemedText>
              <ThemedText style={[s.eventTime, { color: colors.textSecondary }]}>
                {event.time}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 6 — COACH OPS
// =============================================================================

function CoachOpsBlock({ colors, accentColor, onDrill }: { colors: typeof Colors.light; accentColor: string; onDrill: (t: DrillTarget) => void }) {
  const handlePress = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const target = OPS_DRILL_MAP[label];
    if (target) onDrill(target);
  };

  return (
    <>
      <SectionHeader label="COACH OPS" colors={colors} />
      <View style={s.opsGrid}>
        {COACH_OPS_SHORTCUTS.map((shortcut) => {
          const hasDrill = !!OPS_DRILL_MAP[shortcut.label];
          return (
            <Pressable
              key={shortcut.id}
              style={({ pressed }) => [
                s.opsButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handlePress(shortcut.label)}
            >
              <IconSymbol name={shortcut.icon as any} size={22} color={accentColor} />
              <ThemedText style={[s.opsLabel, { color: colors.text }]}>{shortcut.label}</ThemedText>
              {hasDrill && (
                <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

// =============================================================================
// BLOCK 7 — DATA COVERAGE
// =============================================================================

function DataCoverageBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <>
      <SectionHeader label="DATA COVERAGE" colors={colors} />
      <Card colors={colors}>
        {/* Tier badge */}
        <View style={s.tierRow}>
          <View style={[s.tierBadge, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[s.tierBadgeText, { color: accentColor }]}>
              {DATA_COVERAGE.tier}
            </ThemedText>
          </View>
          <ThemedText style={[s.tierHelp, { color: colors.textTertiary }]}>Coverage Tier</ThemedText>
        </View>

        {/* Timestamps */}
        {DATA_COVERAGE.timestamps.map((ts) => (
          <View key={ts.label} style={s.tsRow}>
            <ThemedText style={[s.tsLabel, { color: colors.textSecondary }]}>{ts.label}</ThemedText>
            <ThemedText style={[s.tsDate, { color: colors.text }]}>{ts.date}</ThemedText>
          </View>
        ))}

        {/* Missing data notes */}
        {DATA_COVERAGE.missingNotes.length > 0 && (
          <View style={[s.missingSection, { borderTopColor: colors.border }]}>
            {DATA_COVERAGE.missingNotes.map((note, idx) => (
              <View key={idx} style={s.missingRow}>
                <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#F59E0B" />
                <ThemedText style={[s.missingText, { color: '#F59E0B' }]}>{note}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </Card>
    </>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsProgram({ colors, accentColor, role }: Props) {
  const [drillDown, setDrillDown] = useState<DrillTarget>(null);

  const handleDrill = useCallback((target: DrillTarget) => {
    setDrillDown(target);
  }, []);

  const handleBack = useCallback(() => {
    setDrillDown(null);
  }, []);

  // ── Drill-down: render full-screen domain page ──
  if (drillDown) {
    switch (drillDown) {
      case 'stats':
        return <StatisticsPage onBack={handleBack} />;
      case 'game-plan':
        return <GamePlanPage onBack={handleBack} />;
      case 'simulation':
        return <SimulationPage onBack={handleBack} />;
      case 'development':
        return <DevelopmentPage onBack={handleBack} />;
    }
  }

  // ── Default: 8-block scroll ──
  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scroll}
    >
      <HeaderBlock colors={colors} accentColor={accentColor} />
      <TeamRatingBlock colors={colors} accentColor={accentColor} />
      <TeamSystemBlock colors={colors} accentColor={accentColor} />
      <RecruitingConstraintsBlock colors={colors} accentColor={accentColor} />
      <AvailabilityBlock colors={colors} accentColor={accentColor} />
      <ScheduleBlock colors={colors} accentColor={accentColor} onDrill={handleDrill} />
      <CoachOpsBlock colors={colors} accentColor={accentColor} onDrill={handleDrill} />
      <DataCoverageBlock colors={colors} accentColor={accentColor} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: 120 },

  // ── Section Header ──
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },

  // ── Card ──
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 12,
  },

  // ── Block 0 — Header ──
  headerBlock: {
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  seasonChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: 8,
  },
  seasonChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Block 1 — Team Rating ──
  krRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 16,
  },
  krMain: {
    alignItems: 'center',
    flex: 1,
  },
  krValue: {
    fontSize: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 48,
  },
  krLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  krSub: {
    alignItems: 'center',
    flex: 0.6,
  },
  krSubValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  krSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },

  // Mini bars (Fit / Confidence)
  miniBarsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  miniBarCol: { flex: 1 },
  miniBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  miniBarPct: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Rankings
  rankSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  rankTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rankLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  rankRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rankValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  rankTotal: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },

  // ── Block 2 — Team System ──
  systemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  systemInfo: { flex: 1 },
  systemLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  systemValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  systemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 12,
  },
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tempoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  helperText: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },

  // ── Block 3 — Recruiting Constraints ──
  constraintRow: {},
  constraintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  constraintLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  constraintValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  remainingText: {
    fontSize: 11,
    marginTop: 4,
  },

  // ── Block 4 — Availability ──
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  countItem: { alignItems: 'center' },
  countValue: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  rotationSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  rotationTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 8,
  },
  playerNumber: {
    fontSize: 12,
    fontWeight: '600',
    width: 28,
    fontVariant: ['tabular-nums'],
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  playerPos: {
    fontSize: 12,
    fontWeight: '500',
    width: 28,
    textAlign: 'center',
  },
  playerKR: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 28,
    textAlign: 'right',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Block 5 — Schedule ──
  nextGameLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  nextGameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nextGameInfo: { flex: 1 },
  nextGameTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  nextGameDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  upcomingLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── Block 6 — Coach Ops ──
  opsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  opsButton: {
    width: '31%',
    aspectRatio: 1.1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  opsLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── Block 7 — Data Coverage ──
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tierHelp: {
    fontSize: 11,
  },
  tsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tsLabel: {
    fontSize: 12,
  },
  tsDate: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  missingSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
    paddingTop: 10,
    gap: 6,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  missingText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
});
