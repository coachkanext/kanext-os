/**
 * Teams V2 — CEO / Commissioner-level team dossier system for K-1 motorsport league.
 * Two-state UI: team list (default) and team detail view with 8 inner tabs.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  CEO_TEAM_CARDS, TEAMS_CEO_KPIS, TEAM_TYPE_COLOR, READINESS_PILL_COLOR,
} from '@/data/mock-ceo-competition';
import type { CEOTeamCard, TeamsCEOKPI, TeamType } from '@/data/mock-ceo-competition';
import { K1_DRIVERS } from '@/data/mock-community';
import type { K1Driver } from '@/data/mock-community';
import { TEAM_PERSONNEL, TEAM_CARS } from '@/data/mock-competition-v2';
import type { TeamPerson, TeamCar } from '@/data/mock-competition-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

type DetailTab =
  | 'overview'
  | 'people'
  | 'cars'
  | 'compliance'
  | 'ops'
  | 'finance'
  | 'media'
  | 'history';

const DETAIL_PILLS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'people', label: 'People' },
  { key: 'cars', label: 'Cars & Assets' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'ops', label: 'Ops & Logistics' },
  { key: 'finance', label: 'Finance' },
  { key: 'media', label: 'Media & Brand' },
  { key: 'history', label: 'History' },
];

const STATUS_COLORS: Record<string, string> = {
  compliant: '#22C55E',
  warning: '#F59E0B',
  non_compliant: '#EF4444',
  pending: '#9CA3AF',
  fulfilled: '#22C55E',
  overdue: '#EF4444',
  confirmed: '#22C55E',
  issue: '#EF4444',
  valid: '#22C55E',
  expired: '#EF4444',
  delivered: '#22C55E',
  in_transit: '#F59E0B',
  paid: '#22C55E',
  current: '#22C55E',
  delinquent: '#EF4444',
};

const SPONSOR_DOT_COLOR: Record<string, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

const FINANCIAL_STATUS_COLOR: Record<string, string> = {
  current: '#22C55E',
  overdue: '#F59E0B',
  delinquent: '#EF4444',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  elevated: '#F59E0B',
  monitoring: '#9CA3AF',
};

// =============================================================================
// HELPER — StatusBadge
// =============================================================================

function StatusBadge({ label, status, colors }: { label: string; status: string; colors: typeof Colors.light }) {
  const badgeColor = STATUS_COLORS[status] ?? '#9CA3AF';
  return (
    <View style={[styles.statusBadge, { backgroundColor: badgeColor + '20' }]}>
      <ThemedText style={[styles.statusBadgeText, { color: badgeColor }]}>
        {label}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({ team, colors }: { team: CEOTeamCard; colors: typeof Colors.light }) {
  const stats: { label: string; value: string }[] = [
    { label: 'Points', value: String(team.points) },
    { label: 'Wins', value: String(team.wins) },
    { label: 'Budget', value: team.budget },
    { label: 'Utilization', value: `${team.budgetUtilization}%` },
    { label: 'Championships', value: String(team.championships) },
    { label: 'Founded', value: String(team.founded) },
  ];

  return (
    <>
      {/* Key Stats Grid */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Key Stats</ThemedText>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCell}>
              <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
                {stat.label}
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
                {stat.value}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Risk Flags */}
      {team.riskFlags.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Risk Flags</ThemedText>
          {team.riskFlags.map((flag, idx) => (
            <View key={idx} style={[styles.riskFlagRow, idx < team.riskFlags.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <View style={[styles.riskDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText style={[styles.riskFlagText, { color: colors.text }]}>{flag}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

// =============================================================================
// PEOPLE TAB
// =============================================================================

function PeopleTab({ team, colors }: { team: CEOTeamCard; colors: typeof Colors.light }) {
  const teamDrivers = useMemo(
    () => K1_DRIVERS.filter((d) => d.teamId === team.teamId),
    [team.teamId],
  );
  const personnel = TEAM_PERSONNEL[team.teamId] ?? [];

  return (
    <>
      {/* Drivers */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Drivers</ThemedText>
        {teamDrivers.map((driver) => (
          <View key={driver.id} style={[styles.driverRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.driverNumberBadge, { backgroundColor: team.primaryColor + '20' }]}>
              <ThemedText style={[styles.driverNumberText, { color: team.primaryColor }]}>
                #{driver.number}
              </ThemedText>
            </View>
            <View style={styles.driverInfo}>
              <ThemedText style={[styles.driverName, { color: colors.text }]}>
                {driver.name}
              </ThemedText>
              <ThemedText style={[styles.driverMeta, { color: colors.textTertiary }]}>
                {driver.nationality} · {driver.points} pts · Avg P{driver.avgFinish.toFixed(1)}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Key Personnel */}
      {personnel.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Key Personnel</ThemedText>
          {personnel.map((person) => (
            <View key={person.id} style={[styles.personnelRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.personnelAvatar, { backgroundColor: team.primaryColor + '18' }]}>
                <ThemedText style={[styles.personnelInitials, { color: team.primaryColor }]}>
                  {person.initials}
                </ThemedText>
              </View>
              <View style={styles.personnelInfo}>
                <ThemedText style={[styles.personnelName, { color: colors.text }]}>
                  {person.name}
                </ThemedText>
                <View style={styles.personnelMetaRow}>
                  <ThemedText style={[styles.personnelRole, { color: colors.textSecondary }]}>
                    {person.role}
                  </ThemedText>
                  <View style={[styles.departmentBadge, { backgroundColor: colors.backgroundSecondary }]}>
                    <ThemedText style={[styles.departmentBadgeText, { color: colors.textSecondary }]}>
                      {person.department}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.personnelSince, { color: colors.textTertiary }]}>
                  Since {person.since}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

// =============================================================================
// CARS & ASSETS TAB
// =============================================================================

function CarsTab({ team, colors }: { team: CEOTeamCard; colors: typeof Colors.light }) {
  const cars = TEAM_CARS[team.teamId] ?? [];

  return (
    <>
      {cars.map((car) => (
        <View
          key={car.id}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, overflow: 'hidden' }]}
        >
          {/* Livery stripe */}
          <View style={[styles.liveryStripe, { backgroundColor: car.liveryColor }]} />

          <View style={styles.carHeader}>
            <View style={[styles.carNumberBadge, { backgroundColor: team.primaryColor + '20' }]}>
              <ThemedText style={[styles.carNumberText, { color: team.primaryColor }]}>
                #{car.carNumber}
              </ThemedText>
            </View>
            <ThemedText style={[styles.carDriverName, { color: colors.text }]}>
              {car.driverName}
            </ThemedText>
          </View>

          <View style={styles.carSpecsGrid}>
            <View style={styles.carSpecCell}>
              <ThemedText style={[styles.carSpecLabel, { color: colors.textTertiary }]}>Chassis</ThemedText>
              <ThemedText style={[styles.carSpecValue, { color: colors.text }]}>{car.chassis}</ThemedText>
            </View>
            <View style={styles.carSpecCell}>
              <ThemedText style={[styles.carSpecLabel, { color: colors.textTertiary }]}>Engine</ThemedText>
              <ThemedText style={[styles.carSpecValue, { color: colors.text }]}>{car.engine}</ThemedText>
            </View>
            <View style={styles.carSpecCell}>
              <ThemedText style={[styles.carSpecLabel, { color: colors.textTertiary }]}>Weight</ThemedText>
              <ThemedText style={[styles.carSpecValue, { color: colors.text }]}>{car.weight}</ThemedText>
            </View>
            <View style={styles.carSpecCell}>
              <ThemedText style={[styles.carSpecLabel, { color: colors.textTertiary }]}>Top Speed</ThemedText>
              <ThemedText style={[styles.carSpecValue, { color: colors.text }]}>{car.topSpeed}</ThemedText>
            </View>
          </View>
        </View>
      ))}

      {cars.length === 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No car data available.
          </ThemedText>
        </View>
      )}
    </>
  );
}

// =============================================================================
// COMPLIANCE TAB
// =============================================================================

function ComplianceTab({ team, colors }: { team: CEOTeamCard; colors: typeof Colors.light }) {
  const issues = team.detail.complianceIssues;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Compliance Issues</ThemedText>
      {issues.length === 0 ? (
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No compliance data available.
        </ThemedText>
      ) : (
        issues.map((issue, idx) => {
          const statusColor = STATUS_COLORS[issue.status] ?? '#9CA3AF';
          const statusLabel = issue.status === 'non_compliant' ? 'NON-COMPLIANT' : issue.status.toUpperCase();
          return (
            <View key={idx} style={[styles.complianceRow, { borderBottomColor: colors.border }]}>
              <View style={styles.complianceInfo}>
                <ThemedText style={[styles.complianceItemName, { color: colors.text }]}>
                  {issue.item}
                </ThemedText>
                {issue.note && (
                  <ThemedText style={[styles.complianceNote, { color: colors.textTertiary }]}>
                    {issue.note}
                  </ThemedText>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                  {statusLabel}
                </ThemedText>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

// =============================================================================
// OPS & LOGISTICS TAB
// =============================================================================

function OpsTab({ team, colors }: { team: CEOTeamCard; colors: typeof Colors.light }) {
  const { opsLogistics, freight, credentials } = team.detail;

  return (
    <>
      {/* Ops & Logistics */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Operations</ThemedText>
        {opsLogistics.map((item, idx) => {
          const statusColor = STATUS_COLORS[item.status] ?? '#9CA3AF';
          return (
            <View key={idx} style={[styles.opsRow, { borderBottomColor: colors.border }]}>
              <View style={styles.opsInfo}>
                <ThemedText style={[styles.opsItemName, { color: colors.text }]}>
                  {item.item}
                </ThemedText>
                <ThemedText style={[styles.opsDetail, { color: colors.textTertiary }]}>
                  {item.detail}
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                  {item.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Freight */}
      {freight.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Freight</ThemedText>
          {freight.map((item, idx) => {
            const statusColor = STATUS_COLORS[item.status] ?? '#9CA3AF';
            return (
              <View key={idx} style={[styles.opsRow, { borderBottomColor: colors.border }]}>
                <View style={styles.opsInfo}>
                  <ThemedText style={[styles.opsItemName, { color: colors.text }]}>
                    {item.item}
                  </ThemedText>
                  {item.eta && (
                    <ThemedText style={[styles.opsDetail, { color: colors.textTertiary }]}>
                      ETA: {item.eta}
                    </ThemedText>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                    {item.status === 'in_transit' ? 'IN TRANSIT' : item.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Credentials */}
      {credentials.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Credentials</ThemedText>
          {credentials.map((item, idx) => {
            const statusColor = STATUS_COLORS[item.status] ?? '#9CA3AF';
            return (
              <View key={idx} style={[styles.opsRow, { borderBottomColor: colors.border }]}>
                <View style={styles.opsInfo}>
                  <ThemedText style={[styles.opsItemName, { color: colors.text }]}>
                    {item.item}
                  </ThemedText>
                  <ThemedText style={[styles.opsDetail, { color: colors.textTertiary }]}>
                    Expires: {item.expiry}
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                    {item.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

// =============================================================================
// FINANCE TAB
// =============================================================================

function FinanceTab({ team, colors }: { team: CEOTeamCard; colors: typeof Colors.light }) {
  const { financials, fees } = team.detail;

  return (
    <>
      {/* Financial Stats */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Financials</ThemedText>
        {financials.map((stat, idx) => (
          <View key={idx} style={[styles.financeRow, idx < financials.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.financeLabel, { color: colors.textSecondary }]}>
              {stat.label}
            </ThemedText>
            <View style={styles.financeValueRow}>
              <ThemedText style={[styles.financeValue, { color: stat.value === 'OVERDUE' ? '#EF4444' : colors.text }]}>
                {stat.value}
              </ThemedText>
              {stat.trend && (
                <IconSymbol
                  name={stat.trend === 'up' ? 'arrow.up.right' : 'arrow.down.right'}
                  size={12}
                  color={stat.trend === 'up' ? '#F59E0B' : '#EF4444'}
                />
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Fees */}
      {fees.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Fees & Levies</ThemedText>
          {fees.map((fee, idx) => {
            const feeColor = STATUS_COLORS[fee.status] ?? '#9CA3AF';
            return (
              <View key={idx} style={[styles.feeRow, idx < fees.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <View style={styles.feeInfo}>
                  <ThemedText style={[styles.feeLabel, { color: colors.text }]}>{fee.label}</ThemedText>
                  <ThemedText style={[styles.feeAmount, { color: colors.textSecondary }]}>{fee.amount}</ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: feeColor + '20' }]}>
                  <ThemedText style={[styles.statusBadgeText, { color: feeColor }]}>
                    {fee.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

// =============================================================================
// MEDIA & BRAND TAB
// =============================================================================

function MediaTab({ team, colors }: { team: CEOTeamCard; colors: typeof Colors.light }) {
  const obligations = team.detail.mediaObligations;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Media Obligations</ThemedText>
      {obligations.length === 0 ? (
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No media obligations recorded.
        </ThemedText>
      ) : (
        obligations.map((item, idx) => {
          const statusColor = STATUS_COLORS[item.status] ?? '#9CA3AF';
          return (
            <View key={idx} style={[styles.mediaRow, { borderBottomColor: colors.border }]}>
              <View style={styles.mediaInfo}>
                <ThemedText style={[styles.mediaItemName, { color: colors.text }]}>
                  {item.item}
                </ThemedText>
                <ThemedText style={[styles.mediaDate, { color: colors.textTertiary }]}>
                  Due: {item.dueDate}
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                  {item.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

// =============================================================================
// HISTORY TAB
// =============================================================================

function HistoryTab({ team, colors }: { team: CEOTeamCard; colors: typeof Colors.light }) {
  const { historyEntries, risks } = team.detail;

  return (
    <>
      {/* Timeline */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>History</ThemedText>
        {historyEntries.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No history entries recorded.
          </ThemedText>
        ) : (
          historyEntries.map((entry, idx) => (
            <View key={idx} style={[styles.historyRow, idx < historyEntries.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <View style={[styles.historyDateBadge, { backgroundColor: colors.backgroundSecondary }]}>
                <ThemedText style={[styles.historyDateText, { color: colors.textSecondary }]}>
                  {entry.date}
                </ThemedText>
              </View>
              <View style={styles.historyInfo}>
                <ThemedText style={[styles.historyEvent, { color: colors.text }]}>
                  {entry.event}
                </ThemedText>
                <ThemedText style={[styles.historyDetail, { color: colors.textTertiary }]}>
                  {entry.detail}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Risks */}
      {risks.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Active Risks</ThemedText>
          {risks.map((risk) => {
            const sevColor = SEVERITY_COLORS[risk.severity] ?? '#9CA3AF';
            return (
              <View key={risk.id} style={[styles.riskRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.riskSeverityDot, { backgroundColor: sevColor }]} />
                <View style={styles.riskInfo}>
                  <ThemedText style={[styles.riskTitle, { color: colors.text }]}>
                    {risk.title}
                  </ThemedText>
                  <ThemedText style={[styles.riskDetail, { color: colors.textTertiary }]}>
                    {risk.detail}
                  </ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sevColor + '20' }]}>
                  <ThemedText style={[styles.statusBadgeText, { color: sevColor }]}>
                    {risk.severity.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

// =============================================================================
// READINESS PILL STRIP (shared between list & detail)
// =============================================================================

function ReadinessPills({ readiness, size = 'small' }: { readiness: CEOTeamCard['readiness']; size?: 'small' | 'large' }) {
  const pills: { key: string; label: string; score: number }[] = [
    { key: 'T', label: 'T', score: readiness.tech },
    { key: 'C', label: 'C', score: readiness.compliance },
    { key: 'O', label: 'O', score: readiness.ops },
    { key: 'M', label: 'M', score: readiness.media },
  ];
  const isLarge = size === 'large';

  return (
    <View style={styles.readinessPillRow}>
      {pills.map((pill) => {
        const color = READINESS_PILL_COLOR(pill.score);
        return (
          <View
            key={pill.key}
            style={[
              styles.readinessPill,
              { backgroundColor: color + '20' },
              isLarge && styles.readinessPillLarge,
            ]}
          >
            <ThemedText
              style={[
                styles.readinessPillText,
                { color },
                isLarge && styles.readinessPillTextLarge,
              ]}
            >
              {pill.label}:{pill.score}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// TEAM DETAIL VIEW
// =============================================================================

function TeamDetail({
  team,
  colors,
  onBack,
}: {
  team: CEOTeamCard;
  colors: typeof Colors.light;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const teamTypeColor = TEAM_TYPE_COLOR[team.teamType];

  return (
    <View style={styles.detailContainer}>
      {/* Back button + header */}
      <Pressable
        style={styles.backButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onBack();
        }}
      >
        <IconSymbol name="chevron.left" size={18} color={colors.text} />
        <ThemedText style={[styles.backTitle, { color: colors.text }]}>
          {team.name}
        </ThemedText>
      </Pressable>

      {/* Hero card */}
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.heroTop}>
          <View style={[styles.heroBadge, { backgroundColor: team.primaryColor + '20' }]}>
            <ThemedText style={[styles.heroBadgeText, { color: team.primaryColor }]}>
              {team.abbreviation}
            </ThemedText>
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <ThemedText style={[styles.heroName, { color: colors.text }]}>{team.name}</ThemedText>
              <View style={[styles.teamTypeBadge, { backgroundColor: teamTypeColor + '20' }]}>
                <ThemedText style={[styles.teamTypeBadgeText, { color: teamTypeColor }]}>
                  {team.teamType}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.heroMeta, { color: colors.textSecondary }]}>
              Principal: {team.principal}
            </ThemedText>
            <ThemedText style={[styles.heroMeta, { color: colors.textTertiary }]}>
              {team.headquarters} · {team.budget} · {team.championships} title{team.championships !== 1 ? 's' : ''}
            </ThemedText>
          </View>
        </View>

        {/* Readiness strip (larger) */}
        <View style={styles.heroReadinessStrip}>
          <ReadinessPills readiness={team.readiness} size="large" />
        </View>
      </View>

      {/* Inner pill nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillScrollContent}
      >
        {DETAIL_PILLS.map((pill) => {
          const isActive = activeTab === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[
                styles.pill,
                { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(pill.key);
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
      </ScrollView>

      {/* Tab content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {activeTab === 'overview' && <OverviewTab team={team} colors={colors} />}
        {activeTab === 'people' && <PeopleTab team={team} colors={colors} />}
        {activeTab === 'cars' && <CarsTab team={team} colors={colors} />}
        {activeTab === 'compliance' && <ComplianceTab team={team} colors={colors} />}
        {activeTab === 'ops' && <OpsTab team={team} colors={colors} />}
        {activeTab === 'finance' && <FinanceTab team={team} colors={colors} />}
        {activeTab === 'media' && <MediaTab team={team} colors={colors} />}
        {activeTab === 'history' && <HistoryTab team={team} colors={colors} />}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// TEAM LIST VIEW
// =============================================================================

function TeamListView({
  colors,
  onSelectTeam,
}: {
  colors: typeof Colors.light;
  onSelectTeam: (team: CEOTeamCard) => void;
}) {
  const [search, setSearch] = useState('');

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return CEO_TEAM_CARDS;
    const q = search.toLowerCase();
    return CEO_TEAM_CARDS.filter((t) => t.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    >
      {/* CEO KPI Strip */}
      <View style={styles.kpiRow}>
        {TEAMS_CEO_KPIS.map((kpi) => (
          <View
            key={kpi.id}
            style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
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

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search teams..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Team cards */}
      {filteredTeams.map((team) => {
        const typeColor = TEAM_TYPE_COLOR[team.teamType];
        const sponsorDotColor = SPONSOR_DOT_COLOR[team.business.sponsorHealth];
        const financialColor = FINANCIAL_STATUS_COLOR[team.business.financialStatus];

        return (
          <Pressable
            key={team.teamId}
            style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectTeam(team);
            }}
          >
            {/* Color bar */}
            <View style={[styles.teamColorBar, { backgroundColor: team.primaryColor }]} />

            <View style={styles.teamCardBody}>
              {/* Top row: badge | info | chevron */}
              <View style={styles.teamCardTopRow}>
                <View style={[styles.teamCardBadge, { backgroundColor: team.primaryColor + '20' }]}>
                  <ThemedText style={[styles.teamCardAbbr, { color: team.primaryColor }]}>
                    {team.abbreviation}
                  </ThemedText>
                </View>
                <View style={styles.teamCardInfo}>
                  <ThemedText style={[styles.teamCardName, { color: colors.text }]}>
                    {team.name}
                  </ThemedText>
                  <View style={styles.teamTypeRow}>
                    <View style={[styles.teamTypeBadgeSmall, { backgroundColor: typeColor + '20' }]}>
                      <ThemedText style={[styles.teamTypeBadgeSmallText, { color: typeColor }]}>
                        {team.teamType}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.teamCardOwner, { color: colors.textSecondary }]}>
                    {team.owner}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
              </View>

              {/* Stats row */}
              <ThemedText style={[styles.teamCardStats, { color: colors.textTertiary }]}>
                {team.wins}W · {team.points} pts · {team.budget}
              </ThemedText>

              {/* Readiness pills row */}
              <ReadinessPills readiness={team.readiness} />

              {/* Business pills row */}
              <View style={styles.businessPillRow}>
                {/* Sponsor health */}
                <View style={[styles.businessPill, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={[styles.sponsorDot, { backgroundColor: sponsorDotColor }]} />
                  <ThemedText style={[styles.businessPillText, { color: colors.textSecondary }]}>
                    {team.business.sponsorCount} sponsor{team.business.sponsorCount !== 1 ? 's' : ''}
                  </ThemedText>
                </View>

                {/* Financial status */}
                <View style={[styles.businessPill, { backgroundColor: financialColor + '18' }]}>
                  <ThemedText style={[styles.businessPillText, { color: financialColor }]}>
                    {team.business.financialStatus.charAt(0).toUpperCase() + team.business.financialStatus.slice(1)}
                  </ThemedText>
                </View>
              </View>

              {/* Risk flags */}
              {team.riskFlags.length > 0 && (
                <View style={styles.riskBadgeRow}>
                  <View style={[styles.riskCountBadge, { backgroundColor: '#EF4444' + '20' }]}>
                    <ThemedText style={[styles.riskCountText, { color: '#EF4444' }]}>
                      {team.riskFlags.length} risk{team.riskFlags.length !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}

      {filteredTeams.length === 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No teams match your search.
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function TeamsV2({ colors }: { colors: typeof Colors.light }) {
  const [selectedTeam, setSelectedTeam] = useState<CEOTeamCard | null>(null);

  if (selectedTeam) {
    return (
      <TeamDetail
        team={selectedTeam}
        colors={colors}
        onBack={() => setSelectedTeam(null)}
      />
    );
  }

  return (
    <TeamListView
      colors={colors}
      onSelectTeam={setSelectedTeam}
    />
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // ---- List View ----
  listContent: {
    padding: Spacing.md,
    paddingBottom: 120,
    gap: 12,
  },

  // ---- CEO KPI Strip ----
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  kpiLabel: {
    fontSize: 12,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  kpiSublabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // ---- Search Bar ----
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // ---- Team Card (List) ----
  teamCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  teamColorBar: {
    height: 4,
  },
  teamCardBody: {
    padding: 16,
    gap: 10,
  },
  teamCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamCardBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamCardAbbr: {
    fontSize: 14,
    fontWeight: '800',
  },
  teamCardInfo: {
    flex: 1,
  },
  teamCardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  teamTypeRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  teamTypeBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  teamTypeBadgeSmallText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  teamCardOwner: {
    fontSize: 13,
    marginTop: 3,
  },
  teamCardStats: {
    fontSize: 12,
  },

  // ---- Readiness Pills ----
  readinessPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  readinessPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  readinessPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  readinessPillLarge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  readinessPillTextLarge: {
    fontSize: 12,
  },

  // ---- Business Pills ----
  businessPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  businessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  sponsorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  businessPillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ---- Risk Badge ----
  riskBadgeRow: {
    flexDirection: 'row',
  },
  riskCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  riskCountText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ---- Detail View ----
  detailContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: 6,
  },
  backTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  // Hero
  heroCard: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBadgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroInfo: {
    flex: 1,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '700',
  },
  heroMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  heroReadinessStrip: {
    marginTop: 14,
  },

  // Team type badge (detail hero)
  teamTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  teamTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Pill nav (scrollable)
  pillScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: 6,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Tab scroll
  tabScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
    gap: 12,
  },

  // ---- Shared Card ----
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
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // ---- Status Badge (shared) ----
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ---- Overview Stats Grid ----
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCell: {
    width: '50%',
    paddingVertical: 8,
    paddingRight: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },

  // ---- Risk Flags (overview) ----
  riskFlagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskFlagText: {
    fontSize: 14,
    flex: 1,
  },

  // ---- People — Drivers ----
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  driverNumberBadge: {
    width: 40,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverNumberText: {
    fontSize: 13,
    fontWeight: '800',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
  },
  driverMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // ---- People — Personnel ----
  personnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  personnelAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personnelInitials: {
    fontSize: 13,
    fontWeight: '700',
  },
  personnelInfo: {
    flex: 1,
  },
  personnelName: {
    fontSize: 14,
    fontWeight: '600',
  },
  personnelMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  personnelRole: {
    fontSize: 12,
  },
  departmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  departmentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  personnelSince: {
    fontSize: 11,
    marginTop: 2,
  },

  // ---- Cars & Assets ----
  liveryStripe: {
    height: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  carHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  carNumberBadge: {
    width: 44,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carNumberText: {
    fontSize: 14,
    fontWeight: '800',
  },
  carDriverName: {
    fontSize: 15,
    fontWeight: '700',
  },
  carSpecsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  carSpecCell: {
    width: '50%',
    paddingVertical: 6,
    paddingRight: 8,
  },
  carSpecLabel: {
    fontSize: 11,
    marginBottom: 1,
  },
  carSpecValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ---- Compliance ----
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  complianceInfo: {
    flex: 1,
  },
  complianceItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  complianceNote: {
    fontSize: 12,
    marginTop: 2,
  },

  // ---- Ops & Logistics ----
  opsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  opsInfo: {
    flex: 1,
  },
  opsItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  opsDetail: {
    fontSize: 12,
    marginTop: 2,
  },

  // ---- Finance ----
  financeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  financeLabel: {
    fontSize: 13,
  },
  financeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  financeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  feeInfo: {
    flex: 1,
  },
  feeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  feeAmount: {
    fontSize: 12,
    marginTop: 2,
  },

  // ---- Media & Brand ----
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  mediaInfo: {
    flex: 1,
  },
  mediaItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  mediaDate: {
    fontSize: 12,
    marginTop: 2,
  },

  // ---- History ----
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 10,
  },
  historyDateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyDateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyInfo: {
    flex: 1,
  },
  historyEvent: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyDetail: {
    fontSize: 12,
    marginTop: 2,
  },

  // ---- History — Risks ----
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  riskSeverityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskInfo: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskDetail: {
    fontSize: 12,
    marginTop: 2,
  },
});
