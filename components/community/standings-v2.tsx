/**
 * Standings V2 — CEO / Commissioner level standings hub for K-1 motorsport league.
 * 3 CEO lens tabs (Story / Integrity / Money) + 4 view tabs (Drivers / Teams / Constructors / Crew)
 * + 3 collapsible analysis sections (Points Swing Simulator, Penalties Ledger, Leverage Battles).
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// CEO competition data
import {
  STANDINGS_CEO_KPIS,
  CEO_DRIVER_STANDINGS,
  ROUND_BY_ROUND,
  CEO_LENS_TABS,
  FORM_COLOR,
  PAYOUT_TIER_COLOR,
} from '@/data/mock-ceo-competition';
import type {
  CEOStandingsLens,
  CEODriverStanding,
  StandingsCEOKPI,
} from '@/data/mock-ceo-competition';

// Competition v2 data
import {
  TEAM_STANDINGS,
  CREW_STANDINGS,
  POINTS_SWING_SCENARIOS,
  PENALTY_LEDGER,
  LEVERAGE_BATTLES,
} from '@/data/mock-competition-v2';
import type {
  StandingsView,
  TeamStanding,
  CrewStanding,
  PointsSwingScenario,
  PenaltyLedgerEntry,
  LeverageBattle,
} from '@/data/mock-competition-v2';

// Community data
import { K1_STANDINGS } from '@/data/mock-community';
import type { K1StandingEntry } from '@/data/mock-community';

// =============================================================================
// CONSTANTS
// =============================================================================

const ACCENT_GOLD = '#F59E0B';

const VIEW_PILLS: { key: StandingsView; label: string }[] = [
  { key: 'drivers', label: 'Drivers' },
  { key: 'teams', label: 'Teams' },
  { key: 'constructors', label: 'Constructors' },
  { key: 'crew', label: 'Crew' },
];

const PROBABILITY_COLORS: Record<string, string> = {
  high: '#22C55E',
  medium: '#F59E0B',
  low: '#EF4444',
};

// =============================================================================
// CEO KPI STRIP
// =============================================================================

function CEOKPIStrip({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.kpiRow}>
      {STANDINGS_CEO_KPIS.map((kpi: StandingsCEOKPI) => (
        <View
          key={kpi.id}
          style={[
            styles.kpiCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <ThemedText style={[styles.kpiLabel, { color: colors.textTertiary }]}>
            {kpi.label}
          </ThemedText>
          <ThemedText style={[styles.kpiValue, { color: kpi.color }]}>
            {kpi.value}
          </ThemedText>
          <ThemedText style={[styles.kpiSublabel, { color: colors.textTertiary }]}>
            {kpi.sublabel}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// COLLAPSIBLE SECTION
// =============================================================================

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  colors,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        style={styles.collapsibleHeader}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
      >
        <ThemedText style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.chevron, { color: colors.textTertiary }]}>
          {expanded ? '\u25B2' : '\u25BC'}
        </ThemedText>
      </Pressable>
      {expanded && <View style={styles.collapsibleBody}>{children}</View>}
    </View>
  );
}

// =============================================================================
// FORM BADGES (last 5 results)
// =============================================================================

function FormBadges({ form }: { form: string[] }) {
  return (
    <View style={styles.formRow}>
      {form.slice(-5).map((result, idx) => {
        const bg = FORM_COLOR[result] ?? '#6B7280';
        return (
          <View key={idx} style={[styles.formSquare, { backgroundColor: bg }]}>
            <ThemedText style={styles.formSquareText}>
              {result === 'DNF' || result === 'DNS' ? result[0] : ''}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// DELTA INDICATOR
// =============================================================================

function DeltaIndicator({ delta, colors }: { delta: number; colors: typeof Colors.light }) {
  if (delta === 0) {
    return (
      <ThemedText style={[styles.deltaText, { color: colors.textTertiary }]}>
        {'\u2013'}
      </ThemedText>
    );
  }
  const isUp = delta > 0;
  const color = isUp ? '#22C55E' : '#EF4444';
  const arrow = isUp ? '\u25B2' : '\u25BC';
  return (
    <ThemedText style={[styles.deltaText, { color }]}>
      {arrow}{Math.abs(delta)}
    </ThemedText>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[styles.statusBadgeText, { color }]}>
        {label.toUpperCase()}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// DRIVERS VIEW — STORY LENS
// =============================================================================

function DriversStoryView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Driver Championship
      </ThemedText>
      {CEO_DRIVER_STANDINGS.map((entry: CEODriverStanding) => (
        <View key={entry.driverId} style={styles.standingRow}>
          <ThemedText
            style={[
              styles.positionBadge,
              { color: entry.position <= 3 ? ACCENT_GOLD : colors.textTertiary },
            ]}
          >
            P{entry.position}
          </ThemedText>
          <View style={[styles.teamDot, { backgroundColor: entry.teamColor }]} />
          <View style={styles.standingInfo}>
            <ThemedText style={[styles.standingName, { color: colors.text }]}>
              #{entry.driverNumber} {entry.driverName}
            </ThemedText>
            <ThemedText style={[styles.standingMeta, { color: colors.textTertiary }]}>
              {entry.teamName} · {entry.wins}W · {entry.podiums}P
            </ThemedText>
            {entry.clinchStatus ? (
              <ThemedText style={[styles.clinchText, { color: ACCENT_GOLD }]}>
                {entry.clinchStatus}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.standingRightExtended}>
            <View style={styles.standingPtsRow}>
              <ThemedText style={[styles.standingPts, { color: colors.text }]}>
                {entry.points}
              </ThemedText>
              <DeltaIndicator delta={entry.delta} colors={colors} />
            </View>
            <ThemedText style={[styles.standingGap, { color: colors.textTertiary }]}>
              {entry.gap}
            </ThemedText>
            <FormBadges form={entry.form} />
          </View>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// DRIVERS VIEW — INTEGRITY LENS
// =============================================================================

function DriversIntegrityView({ colors }: { colors: typeof Colors.light }) {
  const sorted = [...CEO_DRIVER_STANDINGS].sort((a, b) => b.penaltyPoints - a.penaltyPoints);
  const flaggedDrivers = sorted.filter((d) => d.penaltyPoints > 0);

  return (
    <View style={{ gap: 12 }}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Integrity Standings
        </ThemedText>
        {sorted.map((entry: CEODriverStanding, idx: number) => (
          <View key={entry.driverId} style={styles.standingRow}>
            <ThemedText
              style={[
                styles.positionBadge,
                { color: entry.penaltyPoints > 0 ? '#EF4444' : colors.textTertiary },
              ]}
            >
              {idx + 1}
            </ThemedText>
            <View style={[styles.teamDot, { backgroundColor: entry.teamColor }]} />
            <View style={styles.standingInfo}>
              <ThemedText style={[styles.standingName, { color: colors.text }]}>
                {entry.driverName}
              </ThemedText>
              <ThemedText style={[styles.standingMeta, { color: colors.textTertiary }]}>
                {entry.teamName}
              </ThemedText>
            </View>
            <View style={styles.standingRightExtended}>
              <View style={styles.integrityRightRow}>
                {entry.penaltyPoints > 0 ? (
                  <StatusBadge label={`${entry.penaltyPoints} PEN`} color="#EF4444" />
                ) : (
                  <ThemedText style={[styles.cleanBadge, { color: colors.textTertiary }]}>
                    CLEAN
                  </ThemedText>
                )}
              </View>
              <FormBadges form={entry.form} />
            </View>
          </View>
        ))}
      </View>

      {/* Integrity Strip */}
      {flaggedDrivers.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: '#EF4444' + '10', borderColor: '#EF4444' + '40' },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: '#EF4444' }]}>
            Integrity Watch
          </ThemedText>
          {flaggedDrivers.map((d) => (
            <View key={d.driverId} style={styles.integrityStripRow}>
              <View style={[styles.teamDot, { backgroundColor: d.teamColor }]} />
              <ThemedText style={[styles.integrityStripName, { color: colors.text }]}>
                {d.driverName}
              </ThemedText>
              <StatusBadge label={`${d.penaltyPoints} pts`} color="#EF4444" />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// =============================================================================
// DRIVERS VIEW — MONEY LENS
// =============================================================================

function DriversMoneyView({ colors }: { colors: typeof Colors.light }) {
  const sorted = [...CEO_DRIVER_STANDINGS].sort((a, b) => {
    const tierOrder = { A: 0, B: 1, C: 2 };
    if (tierOrder[a.payoutTier] !== tierOrder[b.payoutTier]) {
      return tierOrder[a.payoutTier] - tierOrder[b.payoutTier];
    }
    // Within same tier, sort by points descending
    return b.points - a.points;
  });

  // Compute summary
  const totalPayout = sorted.reduce((sum, d) => {
    const num = parseInt(d.estimatedPayout.replace(/[^0-9]/g, ''), 10) * 1000;
    return sum + num;
  }, 0);
  const tierBreakdown = { A: 0, B: 0, C: 0 };
  const tierCounts = { A: 0, B: 0, C: 0 };
  sorted.forEach((d) => {
    const num = parseInt(d.estimatedPayout.replace(/[^0-9]/g, ''), 10) * 1000;
    tierBreakdown[d.payoutTier] += num;
    tierCounts[d.payoutTier] += 1;
  });

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Payout Standings
        </ThemedText>
        {sorted.map((entry: CEODriverStanding, idx: number) => {
          const tierColor = PAYOUT_TIER_COLOR[entry.payoutTier] ?? '#6B7280';
          return (
            <View key={entry.driverId} style={styles.standingRow}>
              <ThemedText
                style={[
                  styles.positionBadge,
                  { color: colors.textTertiary },
                ]}
              >
                {idx + 1}
              </ThemedText>
              <View style={[styles.teamDot, { backgroundColor: entry.teamColor }]} />
              <View style={styles.standingInfo}>
                <ThemedText style={[styles.standingName, { color: colors.text }]}>
                  {entry.driverName}
                </ThemedText>
                <ThemedText style={[styles.standingMeta, { color: colors.textTertiary }]}>
                  {entry.teamName}
                </ThemedText>
              </View>
              <View style={styles.standingRightExtended}>
                <View style={styles.moneyRightRow}>
                  <StatusBadge label={`Tier ${entry.payoutTier}`} color={tierColor} />
                  <ThemedText style={[styles.payoutValue, { color: colors.text }]}>
                    {entry.estimatedPayout}
                  </ThemedText>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Prize Pool Summary */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Prize Pool Summary
        </ThemedText>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textTertiary }]}>
              Total Estimated
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(totalPayout)}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: colors.textTertiary }]}>
              Funded
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#3B82F6' }]}>
              77%
            </ThemedText>
          </View>
        </View>
        <View style={[styles.tierBreakdownRow, { borderTopColor: colors.border }]}>
          {(['A', 'B', 'C'] as const).map((tier) => {
            const tierColor = PAYOUT_TIER_COLOR[tier];
            return (
              <View key={tier} style={styles.tierBreakdownItem}>
                <StatusBadge label={`Tier ${tier}`} color={tierColor} />
                <ThemedText style={[styles.tierBreakdownCount, { color: colors.textSecondary }]}>
                  {tierCounts[tier]} drivers
                </ThemedText>
                <ThemedText style={[styles.tierBreakdownAmount, { color: colors.text }]}>
                  {formatCurrency(tierBreakdown[tier])}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// =============================================================================
// TEAMS VIEW
// =============================================================================

function TeamsView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Team Championship
      </ThemedText>
      {TEAM_STANDINGS.map((team: TeamStanding) => (
        <View key={team.teamId} style={styles.standingRow}>
          <ThemedText
            style={[
              styles.positionBadge,
              { color: team.position <= 3 ? ACCENT_GOLD : colors.textTertiary },
            ]}
          >
            P{team.position}
          </ThemedText>
          <View style={[styles.abbrBadge, { backgroundColor: team.teamColor + '20' }]}>
            <ThemedText style={[styles.abbrText, { color: team.teamColor }]}>
              {team.abbreviation}
            </ThemedText>
          </View>
          <View style={styles.standingInfo}>
            <ThemedText style={[styles.standingName, { color: colors.text }]}>
              {team.teamName}
            </ThemedText>
            <ThemedText style={[styles.standingMeta, { color: colors.textTertiary }]}>
              {team.wins}W · Rel: {team.reliability}%
            </ThemedText>
          </View>
          <View style={styles.standingRight}>
            <ThemedText style={[styles.standingPts, { color: colors.text }]}>
              {team.points}
            </ThemedText>
            <ThemedText style={[styles.standingGap, { color: colors.textTertiary }]}>
              {team.gap}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// CONSTRUCTORS VIEW
// =============================================================================

function ConstructorsView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Constructor Championship
      </ThemedText>
      {TEAM_STANDINGS.map((team: TeamStanding) => (
        <View key={team.teamId} style={styles.standingRow}>
          <ThemedText
            style={[
              styles.positionBadge,
              { color: team.position <= 3 ? ACCENT_GOLD : colors.textTertiary },
            ]}
          >
            P{team.position}
          </ThemedText>
          <View style={[styles.abbrBadge, { backgroundColor: team.teamColor + '20' }]}>
            <ThemedText style={[styles.abbrText, { color: team.teamColor }]}>
              {team.abbreviation}
            </ThemedText>
          </View>
          <View style={styles.standingInfo}>
            <ThemedText style={[styles.standingName, { color: colors.text }]}>
              {team.teamName}
            </ThemedText>
            <ThemedText style={[styles.standingMeta, { color: colors.textTertiary }]}>
              {team.wins}W · {team.podiums}P · Rel: {team.reliability}%
            </ThemedText>
          </View>
          <View style={styles.standingRight}>
            <ThemedText style={[styles.standingPts, { color: colors.text }]}>
              {team.points}
            </ThemedText>
            <ThemedText style={[styles.standingGap, { color: colors.textTertiary }]}>
              {team.gap}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// CREW VIEW
// =============================================================================

function CrewView({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
        Crew Championship
      </ThemedText>
      {CREW_STANDINGS.map((crew: CrewStanding) => (
        <View key={`${crew.name}-${crew.position}`} style={styles.standingRow}>
          <ThemedText
            style={[
              styles.positionBadge,
              { color: crew.position <= 3 ? ACCENT_GOLD : colors.textTertiary },
            ]}
          >
            P{crew.position}
          </ThemedText>
          <View style={[styles.teamDot, { backgroundColor: crew.teamColor }]} />
          <View style={styles.standingInfo}>
            <ThemedText style={[styles.standingName, { color: colors.text }]}>
              {crew.name}
            </ThemedText>
            <ThemedText style={[styles.standingMeta, { color: colors.textTertiary }]}>
              {crew.role} · {crew.teamName}
            </ThemedText>
          </View>
          <View style={styles.standingRight}>
            <ThemedText style={[styles.standingPts, { color: colors.text }]}>
              {crew.points}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// POINTS SWING SIMULATOR
// =============================================================================

function PointsSwingContent({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.scenarioList}>
      {POINTS_SWING_SCENARIOS.map((scenario: PointsSwingScenario) => {
        const probColor = PROBABILITY_COLORS[scenario.probability] ?? colors.textTertiary;
        return (
          <View
            key={scenario.id}
            style={[styles.scenarioCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          >
            {/* Scenario header */}
            <View style={styles.scenarioHeader}>
              <ThemedText style={[styles.scenarioTitle, { color: colors.text }]}>
                {scenario.title}
              </ThemedText>
              <View style={[styles.probabilityBadge, { backgroundColor: probColor + '20' }]}>
                <ThemedText style={[styles.probabilityText, { color: probColor }]}>
                  {scenario.probability.toUpperCase()}
                </ThemedText>
              </View>
            </View>

            {/* Description */}
            <ThemedText style={[styles.scenarioDesc, { color: colors.textSecondary }]}>
              {scenario.description}
            </ThemedText>

            {/* Impact table */}
            <View style={styles.impactTable}>
              {/* Table header */}
              <View style={[styles.impactHeaderRow, { borderBottomColor: colors.border }]}>
                <ThemedText style={[styles.impactHeaderCell, styles.impactDriverCol, { color: colors.textTertiary }]}>
                  Driver
                </ThemedText>
                <ThemedText style={[styles.impactHeaderCell, styles.impactPosCol, { color: colors.textTertiary }]}>
                  Now
                </ThemedText>
                <ThemedText style={[styles.impactHeaderCell, styles.impactArrowCol, { color: colors.textTertiary }]} />
                <ThemedText style={[styles.impactHeaderCell, styles.impactPosCol, { color: colors.textTertiary }]}>
                  Proj
                </ThemedText>
                <ThemedText style={[styles.impactHeaderCell, styles.impactDeltaCol, { color: colors.textTertiary }]}>
                  Delta
                </ThemedText>
              </View>
              {/* Table rows */}
              {scenario.impacts.map((impact, idx) => {
                const deltaColor = impact.delta > 0 ? '#22C55E' : impact.delta < 0 ? '#EF4444' : colors.textTertiary;
                const deltaPrefix = impact.delta > 0 ? '+' : '';
                return (
                  <View key={idx} style={styles.impactRow}>
                    <View style={[styles.impactDriverCol, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                      <View style={[styles.teamDotSmall, { backgroundColor: impact.teamColor }]} />
                      <ThemedText style={[styles.impactDriverName, { color: colors.text }]} numberOfLines={1}>
                        {impact.driverName}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.impactPosText, styles.impactPosCol, { color: colors.textSecondary }]}>
                      P{impact.currentPos}
                    </ThemedText>
                    <ThemedText style={[styles.impactArrow, styles.impactArrowCol, { color: colors.textTertiary }]}>
                      {'\u2192'}
                    </ThemedText>
                    <ThemedText style={[styles.impactPosText, styles.impactPosCol, { color: colors.text }]}>
                      P{impact.projectedPos}
                    </ThemedText>
                    <ThemedText style={[styles.impactDelta, styles.impactDeltaCol, { color: deltaColor }]}>
                      {deltaPrefix}{impact.delta}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// PENALTIES LEDGER
// =============================================================================

function PenaltiesContent({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.ledgerList}>
      {PENALTY_LEDGER.map((entry: PenaltyLedgerEntry) => (
        <View
          key={entry.id}
          style={[styles.penaltyRow, { borderBottomColor: colors.border }]}
        >
          <View style={styles.penaltyTop}>
            <ThemedText style={[styles.penaltyDate, { color: colors.textTertiary }]}>
              {entry.date}
            </ThemedText>
            <View style={styles.penaltyDriverWrap}>
              <View style={[styles.teamDotSmall, { backgroundColor: entry.teamColor }]} />
              <ThemedText style={[styles.penaltyDriverName, { color: colors.text }]}>
                {entry.driverName}
              </ThemedText>
            </View>
            {entry.pointsDeducted > 0 && (
              <ThemedText style={styles.penaltyPointsDeducted}>
                -{entry.pointsDeducted} pts
              </ThemedText>
            )}
          </View>
          <ThemedText style={[styles.penaltyInfraction, { color: colors.textSecondary }]}>
            {entry.infraction}
          </ThemedText>
          <View style={styles.penaltyBottom}>
            <ThemedText style={[styles.penaltyType, { color: colors.textTertiary }]}>
              {entry.penalty}
            </ThemedText>
            <ThemedText style={[styles.penaltyRace, { color: colors.textTertiary }]}>
              {entry.race}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// LEVERAGE BATTLES
// =============================================================================

function LeverageBattlesContent({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={styles.battlesContainer}>
      {LEVERAGE_BATTLES.map((battle: LeverageBattle) => (
        <View
          key={battle.id}
          style={[styles.battleCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
        >
          {/* Battle title */}
          <ThemedText style={[styles.battleTitle, { color: colors.text }]}>
            {battle.title}
          </ThemedText>

          {/* Driver 1 */}
          <View style={styles.battleDriverRow}>
            <View style={[styles.teamDot, { backgroundColor: battle.driver1.color }]} />
            <View style={styles.battleDriverInfo}>
              <ThemedText style={[styles.battleDriverName, { color: colors.text }]}>
                {battle.driver1.name}
              </ThemedText>
              <ThemedText style={[styles.battleDriverTeam, { color: colors.textTertiary }]}>
                {battle.driver1.team}
              </ThemedText>
            </View>
            <ThemedText style={[styles.battleDriverPts, { color: colors.text }]}>
              {battle.driver1.points}
            </ThemedText>
          </View>

          {/* VS + gap */}
          <View style={styles.battleVsRow}>
            <View style={[styles.battleVsDivider, { backgroundColor: colors.border }]} />
            <View style={[styles.gapBadge, { backgroundColor: ACCENT_GOLD + '20' }]}>
              <ThemedText style={[styles.gapBadgeText, { color: ACCENT_GOLD }]}>
                GAP: {battle.gap}
              </ThemedText>
            </View>
            <View style={[styles.battleVsDivider, { backgroundColor: colors.border }]} />
          </View>

          {/* Driver 2 */}
          <View style={styles.battleDriverRow}>
            <View style={[styles.teamDot, { backgroundColor: battle.driver2.color }]} />
            <View style={styles.battleDriverInfo}>
              <ThemedText style={[styles.battleDriverName, { color: colors.text }]}>
                {battle.driver2.name}
              </ThemedText>
              <ThemedText style={[styles.battleDriverTeam, { color: colors.textTertiary }]}>
                {battle.driver2.team}
              </ThemedText>
            </View>
            <ThemedText style={[styles.battleDriverPts, { color: colors.text }]}>
              {battle.driver2.points}
            </ThemedText>
          </View>

          {/* Races remaining + clinch scenario */}
          <View style={[styles.battleFooter, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.battleRacesLeft, { color: colors.textSecondary }]}>
              {battle.racesRemaining} races remaining
            </ThemedText>
            <ThemedText style={[styles.battleClinch, { color: colors.textTertiary }]}>
              {battle.clinchScenario}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function StandingsV2({ colors }: { colors: typeof Colors.light }) {
  const [activeView, setActiveView] = useState<StandingsView>('drivers');
  const [activeLens, setActiveLens] = useState<CEOStandingsLens>('story');
  const [swingExpanded, setSwingExpanded] = useState(false);
  const [penaltiesExpanded, setPenaltiesExpanded] = useState(false);
  const [leverageExpanded, setLeverageExpanded] = useState(false);

  // Resolve which drivers view to show based on lens
  const renderDriversView = () => {
    switch (activeLens) {
      case 'integrity':
        return <DriversIntegrityView colors={colors} />;
      case 'money':
        return <DriversMoneyView colors={colors} />;
      case 'story':
      default:
        return <DriversStoryView colors={colors} />;
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* -- CEO KPI Strip -- */}
      <CEOKPIStrip colors={colors} />

      {/* -- CEO Lens Toggle -- */}
      <View style={styles.pillRow}>
        {CEO_LENS_TABS.map((tab) => {
          const isActive = activeLens === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.pill,
                { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveLens(tab.key);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? colors.background : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* -- View Toggle Pills -- */}
      <View style={styles.pillRow}>
        {VIEW_PILLS.map((pill) => {
          const isActive = activeView === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[
                styles.pill,
                { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveView(pill.key);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? colors.background : colors.textSecondary },
                ]}
              >
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* -- Active View -- */}
      {activeView === 'drivers' && renderDriversView()}
      {activeView === 'teams' && <TeamsView colors={colors} />}
      {activeView === 'constructors' && <ConstructorsView colors={colors} />}
      {activeView === 'crew' && <CrewView colors={colors} />}

      {/* -- Points Swing Simulator -- */}
      <CollapsibleSection
        title="Points Swing Simulator"
        expanded={swingExpanded}
        onToggle={() => setSwingExpanded((prev) => !prev)}
        colors={colors}
      >
        <PointsSwingContent colors={colors} />
      </CollapsibleSection>

      {/* -- Penalties Ledger -- */}
      <CollapsibleSection
        title="Penalties Ledger"
        expanded={penaltiesExpanded}
        onToggle={() => setPenaltiesExpanded((prev) => !prev)}
        colors={colors}
      >
        <PenaltiesContent colors={colors} />
      </CollapsibleSection>

      {/* -- Leverage Battles -- */}
      <CollapsibleSection
        title="Leverage Battles"
        expanded={leverageExpanded}
        onToggle={() => setLeverageExpanded((prev) => !prev)}
        colors={colors}
      >
        <LeverageBattlesContent colors={colors} />
      </CollapsibleSection>
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Layout
  container: {
    padding: Spacing.md,
    paddingBottom: 120,
    gap: 12,
  },

  // CEO KPI Strip
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiSublabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Pill toggles
  pillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Cards
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Collapsible
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 12,
  },
  collapsibleBody: {
    marginTop: 12,
  },

  // Standings rows (shared)
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  positionBadge: {
    fontSize: 14,
    fontWeight: '700',
    width: 28,
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teamDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  standingInfo: {
    flex: 1,
  },
  standingName: {
    fontSize: 14,
    fontWeight: '600',
  },
  standingMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  standingRight: {
    alignItems: 'flex-end',
  },
  standingRightExtended: {
    alignItems: 'flex-end',
    gap: 4,
  },
  standingPtsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  standingPts: {
    fontSize: 15,
    fontWeight: '700',
  },
  standingGap: {
    fontSize: 11,
    marginTop: 1,
  },

  // Clinch status
  clinchText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },

  // Form badges
  formRow: {
    flexDirection: 'row',
    gap: 3,
  },
  formSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSquareText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Delta indicator
  deltaText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Integrity lens
  integrityRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cleanBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  integrityStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  integrityStripName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  // Money lens
  moneyRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payoutValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  tierBreakdownRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    gap: 8,
  },
  tierBreakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tierBreakdownCount: {
    fontSize: 11,
  },
  tierBreakdownAmount: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Abbreviation badge (Teams/Constructors)
  abbrBadge: {
    width: 36,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  abbrText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // Points Swing Simulator
  scenarioList: {
    gap: 12,
  },
  scenarioCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scenarioTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  probabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  probabilityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scenarioDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },

  // Impact table
  impactTable: {
    gap: 0,
  },
  impactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  impactHeaderCell: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  impactDriverCol: {
    flex: 1,
  },
  impactPosCol: {
    width: 32,
    textAlign: 'center',
  },
  impactArrowCol: {
    width: 20,
    textAlign: 'center',
  },
  impactDeltaCol: {
    width: 40,
    textAlign: 'right',
  },
  impactDriverName: {
    fontSize: 13,
    fontWeight: '600',
  },
  impactPosText: {
    fontSize: 13,
    fontWeight: '600',
  },
  impactArrow: {
    fontSize: 12,
  },
  impactDelta: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Penalties Ledger
  ledgerList: {
    gap: 0,
  },
  penaltyRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  penaltyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  penaltyDate: {
    fontSize: 12,
    fontWeight: '600',
    width: 48,
  },
  penaltyDriverWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  penaltyDriverName: {
    fontSize: 14,
    fontWeight: '600',
  },
  penaltyPointsDeducted: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  penaltyInfraction: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    paddingLeft: 56,
  },
  penaltyBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 56,
  },
  penaltyType: {
    fontSize: 12,
  },
  penaltyRace: {
    fontSize: 12,
  },

  // Leverage Battles
  battlesContainer: {
    gap: 12,
  },
  battleCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  battleTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  battleDriverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  battleDriverInfo: {
    flex: 1,
  },
  battleDriverName: {
    fontSize: 14,
    fontWeight: '600',
  },
  battleDriverTeam: {
    fontSize: 12,
    marginTop: 1,
  },
  battleDriverPts: {
    fontSize: 16,
    fontWeight: '800',
  },
  battleVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  battleVsDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  gapBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  gapBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  battleFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  battleRacesLeft: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  battleClinch: {
    fontSize: 12,
    lineHeight: 17,
  },
});
