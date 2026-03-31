/**
 * Sports Organization Program V2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Identity | Leadership | Context | Rules | Calendar | Decisions | Assets | Partners | Admin
 * RBAC: R1 full 10-tab, R2 limited (Overview + Identity + Context + Calendar), R3 all except Admin, R4/R5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { SportsRoleLens } from '@/utils/sports-rbac';
import { canSeeSensitive, canSeeCoachActions, canSeeAdminActions } from '@/utils/sports-rbac';
import {
  PROGRAM_SUB_TABS,
  PROGRAM_IDENTITY,
  LEADERSHIP_SEATS,
  PROGRAM_CONTEXT_ITEMS,
  OPERATING_RULES,
  CALENDAR_MILESTONES,
  PENDING_DECISIONS,
  PROGRAM_ASSETS,
  PROGRAM_PARTNERS,
  getProgramOverview,
  COVERAGE_LABELS,
  COVERAGE_COLORS,
  CONTEXT_CATEGORY_LABELS,
  CONTEXT_CATEGORY_COLORS,
  RULE_CATEGORY_LABELS,
  RULE_CATEGORY_COLORS,
  RULE_SEVERITY_LABELS,
  RULE_SEVERITY_COLORS,
  MILESTONE_TYPE_LABELS,
  MILESTONE_TYPE_COLORS,
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_COLORS,
  DECISION_CATEGORY_LABELS,
  DECISION_CATEGORY_COLORS,
  DECISION_URGENCY_LABELS,
  DECISION_URGENCY_COLORS,
  ASSET_CATEGORY_LABELS,
  ASSET_CATEGORY_COLORS,
  ASSET_CONDITION_LABELS,
  ASSET_CONDITION_COLORS,
  PARTNER_TYPE_LABELS,
  PARTNER_TYPE_COLORS,
  PARTNER_STATUS_LABELS,
  PARTNER_STATUS_COLORS,
} from '@/data/mock-sports-org-program-v2';
import type {
  PendingDecision,
  ProgramAsset,
  ProgramPartner,
  LeadershipSeat,
  CalendarMilestone,
  OperatingRule,
} from '@/data/mock-sports-org-program-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.sports;
const SUB_TABS = PROGRAM_SUB_TABS;

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: SportsRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// SUB-TAB BAR
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
      style={{ flexGrow: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const overview = getProgramOverview();
  const identity = PROGRAM_IDENTITY;
  const leadershipPct = Math.round((overview.filledSeats / overview.totalSeats) * 100);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Program Headline */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.cardHeader}>
          <View style={[s.programDot, { backgroundColor: identity.colors.primary }]} />
          <ThemedText style={[s.cardTitle, { color: colors.text }]}>{identity.programName}</ThemedText>
        </View>
        <View style={s.cardRow}>
          <ThemedText style={[s.cardMeta, { color: colors.textSecondary }]}>
            {identity.conference} — {identity.level}
          </ThemedText>
        </View>
        <ThemedText style={[s.cardMeta, { color: colors.textSecondary }]}>
          Season: {identity.season}
        </ThemedText>
      </View>

      {/* Leadership Coverage */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Leadership Coverage
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>{overview.filledSeats}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Filled</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.vacantSeats > 0 ? '#B85C5C' : '#5A8A6E' }]}>
              {overview.vacantSeats}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Vacant</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.overloadedSeats > 0 ? '#B8943E' : '#5A8A6E' }]}>
              {overview.overloadedSeats}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Overloaded</ThemedText>
          </View>
        </View>
        <View style={{ marginTop: Spacing.sm }}>
          <View style={s.progressLabelRow}>
            <ThemedText style={[s.progressLabelText, { color: colors.text }]}>Coverage</ThemedText>
            <ThemedText style={[s.progressPercent, { color: accentColor }]}>{leadershipPct}%</ThemedText>
          </View>
          <ProgressBar percent={leadershipPct} color={accentColor} />
        </View>
      </View>

      {/* Key Metrics */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Key Metrics
      </ThemedText>
      <View style={s.metricsStrip}>
        <View style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.metricValue, { color: overview.upcomingMilestones > 0 ? ACCENT : '#5A8A6E' }]}>
            {overview.upcomingMilestones}
          </ThemedText>
          <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Upcoming</ThemedText>
        </View>
        <View style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.metricValue, { color: overview.pendingDecisions > 0 ? '#B8943E' : '#5A8A6E' }]}>
            {overview.pendingDecisions}
          </ThemedText>
          <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Decisions</ThemedText>
        </View>
        <View style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.metricValue, { color: overview.criticalDecisions > 0 ? '#B85C5C' : '#5A8A6E' }]}>
            {overview.criticalDecisions}
          </ThemedText>
          <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Critical</ThemedText>
        </View>
      </View>
      <View style={s.metricsStrip}>
        <View style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.metricValue, { color: accentColor }]}>{overview.totalAssets}</ThemedText>
          <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Assets</ThemedText>
        </View>
        <View style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.metricValue, { color: overview.assetsNeedingReplacement > 0 ? '#B85C5C' : '#5A8A6E' }]}>
            {overview.assetsNeedingReplacement}
          </ThemedText>
          <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Replace</ThemedText>
        </View>
        <View style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.metricValue, { color: overview.expiringPartners > 0 ? '#B8943E' : '#5A8A6E' }]}>
            {overview.expiringPartners}
          </ThemedText>
          <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>At-Risk Partners</ThemedText>
        </View>
      </View>

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionGrid}>
        {[
          { id: 'qa-1', label: 'View Decisions', icon: 'arrow.triangle.branch' },
          { id: 'qa-2', label: 'View Calendar', icon: 'calendar' },
          { id: 'qa-3', label: 'Check Assets', icon: 'archivebox.fill' },
          { id: 'qa-4', label: 'Review Partners', icon: 'handshake.fill' },
        ].map((action) => (
          <Pressable
            key={action.id}
            style={[s.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={action.icon as any} size={22} color={accentColor} />
            <ThemedText style={[s.quickActionLabel, { color: colors.text }]}>{action.label}</ThemedText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// IDENTITY SUB-TAB
// =============================================================================

function IdentityTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const identity = PROGRAM_IDENTITY;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Color Strip */}
        <View style={s.identityColorStrip}>
          <View style={[s.identityColorSwatch, { backgroundColor: identity.colors.primary }]} />
          <View style={[s.identityColorSwatch, { backgroundColor: identity.colors.secondary }]} />
        </View>

        <ThemedText style={[s.identityName, { color: colors.text }]}>{identity.programName}</ThemedText>
        <ThemedText style={[s.identityOrg, { color: colors.textSecondary }]}>{identity.orgName}</ThemedText>

        <View style={[s.identityDetailsSection, { borderTopColor: colors.border }]}>
          <View style={s.identityDetailRow}>
            <IconSymbol name="building.2.fill" size={14} color={colors.textTertiary} />
            <ThemedText style={[s.identityDetailLabel, { color: colors.textTertiary }]}>Level</ThemedText>
            <ThemedText style={[s.identityDetailValue, { color: colors.text }]}>{identity.level}</ThemedText>
          </View>
          <View style={s.identityDetailRow}>
            <IconSymbol name="sportscourt.fill" size={14} color={colors.textTertiary} />
            <ThemedText style={[s.identityDetailLabel, { color: colors.textTertiary }]}>Conference</ThemedText>
            <ThemedText style={[s.identityDetailValue, { color: colors.text }]}>{identity.conference}</ThemedText>
          </View>
          <View style={s.identityDetailRow}>
            <IconSymbol name="calendar" size={14} color={colors.textTertiary} />
            <ThemedText style={[s.identityDetailLabel, { color: colors.textTertiary }]}>Season</ThemedText>
            <ThemedText style={[s.identityDetailValue, { color: colors.text }]}>{identity.season}</ThemedText>
          </View>
          <View style={s.identityDetailRow}>
            <IconSymbol name="link" size={14} color={colors.textTertiary} />
            <ThemedText style={[s.identityDetailLabel, { color: colors.textTertiary }]}>Website</ThemedText>
            <ThemedText style={[s.identityDetailValue, { color: accentColor }]} numberOfLines={1}>
              {identity.websiteUrl}
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// LEADERSHIP SUB-TAB
// =============================================================================

function LeadershipTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const seats = LEADERSHIP_SEATS;

  // Group by department
  const grouped = useMemo(() => {
    const map: Record<string, LeadershipSeat[]> = {};
    seats.forEach((seat) => {
      if (!map[seat.department]) map[seat.department] = [];
      map[seat.department].push(seat);
    });
    return Object.entries(map);
  }, [seats]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {grouped.map(([dept, members]) => (
        <View key={dept}>
          <View style={s.leadershipGroupHeader}>
            <IconSymbol name="person.3.fill" size={14} color={accentColor} />
            <ThemedText style={[s.leadershipGroupTitle, { color: colors.text }]}>{dept}</ThemedText>
            <ThemedText style={[s.leadershipGroupCount, { color: colors.textTertiary }]}>
              {members.length}
            </ThemedText>
          </View>
          {members.map((seat) => {
            const coverageColor = COVERAGE_COLORS[seat.coverage];
            const coverageLabel = COVERAGE_LABELS[seat.coverage];
            const isVacant = seat.coverage === 'vacant';
            return (
              <View
                key={seat.id}
                style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
              >
                <View style={s.leadershipCardTop}>
                  <View style={s.leadershipTextCol}>
                    <ThemedText style={[s.leadershipTitle, { color: colors.text }]}>{seat.title}</ThemedText>
                    <ThemedText style={[s.leadershipName, { color: isVacant ? '#B85C5C' : colors.textSecondary }]}>
                      {seat.name || 'VACANT'}
                    </ThemedText>
                  </View>
                  <StatusBadge label={coverageLabel.toUpperCase()} color={coverageColor} />
                </View>
                <View style={[s.leadershipMeta, { borderTopColor: colors.border }]}>
                  <View style={s.leadershipMetaItem}>
                    <IconSymbol name="envelope.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.leadershipMetaText, { color: colors.textTertiary }]}>{seat.email}</ThemedText>
                  </View>
                  {seat.backupName && (
                    <View style={s.leadershipMetaItem}>
                      <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                      <ThemedText style={[s.leadershipMetaText, { color: colors.textTertiary }]}>
                        Backup: {seat.backupName}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}

      {seats.length === 0 && (
        <EmptyState icon="person.3.fill" label="No leadership seats defined" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// CONTEXT SUB-TAB
// =============================================================================

function ContextTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const items = PROGRAM_CONTEXT_ITEMS;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {items.map((item) => {
        const catColor = CONTEXT_CATEGORY_COLORS[item.category];
        const catLabel = CONTEXT_CATEGORY_LABELS[item.category];
        return (
          <View
            key={item.id}
            style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
          >
            <View style={s.contextCardTop}>
              <View style={s.contextTextCol}>
                <ThemedText style={[s.contextKey, { color: colors.text }]}>{item.key}</ThemedText>
                <ThemedText style={[s.contextValue, { color: colors.textSecondary }]}>{item.value}</ThemedText>
              </View>
              <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
            </View>
            <ThemedText style={[s.contextDescription, { color: colors.textSecondary }]} numberOfLines={3}>
              {item.description}
            </ThemedText>
            <View style={[s.contextFooter, { borderTopColor: colors.border }]}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.contextFooterText, { color: colors.textTertiary }]}>
                Updated {formatDate(item.lastUpdated)}
              </ThemedText>
            </View>
          </View>
        );
      })}

      {items.length === 0 && (
        <EmptyState icon="brain.fill" label="No context items defined" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RULES SUB-TAB
// =============================================================================

function RulesTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const rules = OPERATING_RULES;

  const renderItem = useCallback(
    ({ item }: { item: OperatingRule }) => {
      const catColor = RULE_CATEGORY_COLORS[item.category];
      const catLabel = RULE_CATEGORY_LABELS[item.category];
      const sevColor = RULE_SEVERITY_COLORS[item.severity];
      const sevLabel = RULE_SEVERITY_LABELS[item.severity];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <ThemedText style={[s.ruleTitle, { color: colors.text }]}>{item.title}</ThemedText>
          <ThemedText style={[s.ruleDescription, { color: colors.textSecondary }]} numberOfLines={3}>
            {item.description}
          </ThemedText>
          <View style={s.ruleBadgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
            <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
            {item.exceptions > 0 && (
              <StatusBadge label={`${item.exceptions} EXCEPTION${item.exceptions > 1 ? 'S' : ''}`} color="#B8943E" />
            )}
          </View>
          <View style={[s.ruleFooter, { borderTopColor: colors.border }]}>
            <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.ruleFooterText, { color: colors.textTertiary }]}>
              Reviewed {formatDate(item.lastReviewed)}
            </ThemedText>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={rules}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="checklist" label="No operating rules defined" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CALENDAR SUB-TAB
// =============================================================================

function CalendarTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const milestones = useMemo(() => {
    const statusOrder: Record<string, number> = { overdue: 0, upcoming: 1, completed: 2 };
    return [...CALENDAR_MILESTONES].sort(
      (a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3),
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CalendarMilestone }) => {
      const typeColor = MILESTONE_TYPE_COLORS[item.type];
      const typeLabel = MILESTONE_TYPE_LABELS[item.type];
      const statusColor = MILESTONE_STATUS_COLORS[item.status];
      const statusLabel = MILESTONE_STATUS_LABELS[item.status];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
          <View style={s.milestoneCardTop}>
            <View style={[s.milestoneDateBadge, { backgroundColor: typeColor + '18' }]}>
              <ThemedText style={[s.milestoneDateText, { color: typeColor }]}>{formatDate(item.date)}</ThemedText>
            </View>
            <View style={s.milestoneTextCol}>
              <ThemedText style={[s.milestoneTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </ThemedText>
              <View style={s.milestoneBadgeRow}>
                <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
                <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
              </View>
            </View>
          </View>
          <View style={[s.milestoneFooter, { borderTopColor: colors.border }]}>
            <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.milestoneOwner, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={milestones}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="calendar" label="No milestones scheduled" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DECISIONS SUB-TAB
// =============================================================================

function DecisionsTab({
  colors,
  accentColor,
  onSelectDecision,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectDecision: (decision: PendingDecision) => void;
}) {
  const decisions = useMemo(() => {
    const urgOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...PENDING_DECISIONS].sort((a, b) => (urgOrder[a.urgency] ?? 4) - (urgOrder[b.urgency] ?? 4));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PendingDecision }) => {
      const catColor = DECISION_CATEGORY_COLORS[item.category];
      const catLabel = DECISION_CATEGORY_LABELS[item.category];
      const urgColor = DECISION_URGENCY_COLORS[item.urgency];
      const urgLabel = DECISION_URGENCY_LABELS[item.urgency];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectDecision(item);
          }}
        >
          <ThemedText style={[s.decisionTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <View style={s.decisionBadgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
            <StatusBadge label={urgLabel.toUpperCase()} color={urgColor} />
          </View>
          <View style={s.decisionMetaRow}>
            <View style={s.decisionMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.decisionMetaText, { color: colors.textTertiary }]}>{item.requestedBy}</ThemedText>
            </View>
            <View style={s.decisionMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.decisionMetaText, { color: colors.textTertiary }]}>{formatDate(item.requestDate)}</ThemedText>
            </View>
          </View>
          <ThemedText style={[s.decisionDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectDecision],
  );

  return (
    <FlatList
      data={decisions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.triangle.branch" label="No pending decisions" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ASSETS SUB-TAB
// =============================================================================

function AssetsTab({
  colors,
  accentColor,
  onSelectAsset,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectAsset: (asset: ProgramAsset) => void;
}) {
  const assets = PROGRAM_ASSETS;

  const renderItem = useCallback(
    ({ item }: { item: ProgramAsset }) => {
      const catColor = ASSET_CATEGORY_COLORS[item.category];
      const catLabel = ASSET_CATEGORY_LABELS[item.category];
      const condColor = ASSET_CONDITION_COLORS[item.condition];
      const condLabel = ASSET_CONDITION_LABELS[item.condition];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectAsset(item);
          }}
        >
          <View style={s.assetCardTop}>
            <View style={s.assetTextCol}>
              <ThemedText style={[s.assetName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.assetQuantity, { color: colors.textSecondary }]}>
                Qty: {item.quantity}
              </ThemedText>
            </View>
          </View>
          <View style={s.assetBadgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
            <StatusBadge label={condLabel.toUpperCase()} color={condColor} />
          </View>
          <View style={[s.assetFooter, { borderTopColor: colors.border }]}>
            <View style={s.assetMetaItem}>
              <IconSymbol name="magnifyingglass" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.assetMetaText, { color: colors.textTertiary }]}>
                Inspected {formatDate(item.lastInspected)}
              </ThemedText>
            </View>
            {item.replacementDate && (
              <View style={s.assetMetaItem}>
                <IconSymbol name="arrow.triangle.2.circlepath" size={11} color="#B85C5C" />
                <ThemedText style={[s.assetMetaText, { color: '#B85C5C' }]}>
                  Replace by {formatDate(item.replacementDate)}
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectAsset],
  );

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="archivebox.fill" label="No assets tracked" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PARTNERS SUB-TAB
// =============================================================================

function PartnersTab({
  colors,
  accentColor,
  onSelectPartner,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectPartner: (partner: ProgramPartner) => void;
}) {
  const partners = PROGRAM_PARTNERS;

  const renderItem = useCallback(
    ({ item }: { item: ProgramPartner }) => {
      const typeColor = PARTNER_TYPE_COLORS[item.type];
      const typeLabel = PARTNER_TYPE_LABELS[item.type];
      const statusColor = PARTNER_STATUS_COLORS[item.status];
      const statusLabel = PARTNER_STATUS_LABELS[item.status];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPartner(item);
          }}
        >
          <View style={s.partnerCardTop}>
            <ThemedText style={[s.partnerName, { color: colors.text }]}>{item.name}</ThemedText>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.partnerBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
          </View>
          <View style={[s.partnerFooter, { borderTopColor: colors.border }]}>
            <View style={s.partnerMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.partnerMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.contact}
              </ThemedText>
            </View>
            <View style={s.partnerMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.partnerMetaText, { color: colors.textTertiary }]}>
                Ends {formatDate(item.contractEnd)}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectPartner],
  );

  return (
    <FlatList
      data={partners}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="handshake.fill" label="No partners listed" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ADMIN SUB-TAB
// =============================================================================

function AdminTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.adminHeader}>
          <IconSymbol name="gearshape.fill" size={24} color={accentColor} />
          <ThemedText style={[s.adminTitle, { color: colors.text }]}>Program Administration</ThemedText>
        </View>
        <ThemedText style={[s.adminDescription, { color: colors.textSecondary }]}>
          Manage program settings, permissions, integrations, and data exports. Only available to AD and Head Coach roles.
        </ThemedText>
        <View style={[s.adminActionsSection, { borderTopColor: colors.border }]}>
          {[
            { id: 'a1', label: 'Edit Program Identity', icon: 'pencil.circle.fill' },
            { id: 'a2', label: 'Manage Leadership Seats', icon: 'person.badge.plus' },
            { id: 'a3', label: 'Configure Notifications', icon: 'bell.fill' },
            { id: 'a4', label: 'Export Program Data', icon: 'arrow.down.doc.fill' },
            { id: 'a5', label: 'Archive Season', icon: 'archivebox.fill' },
          ].map((action) => (
            <Pressable
              key={action.id}
              style={[s.adminActionRow, { borderBottomColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={action.icon as any} size={18} color={accentColor} />
              <ThemedText style={[s.adminActionLabel, { color: colors.text }]}>{action.label}</ThemedText>
              <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// DECISION DETAIL BOTTOM SHEET
// =============================================================================

function DecisionDetailSheet({
  visible,
  onClose,
  decision,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  decision: PendingDecision | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!decision) return null;

  const catColor = DECISION_CATEGORY_COLORS[decision.category];
  const catLabel = DECISION_CATEGORY_LABELS[decision.category];
  const urgColor = DECISION_URGENCY_COLORS[decision.urgency];
  const urgLabel = DECISION_URGENCY_LABELS[decision.urgency];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={decision.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
        <StatusBadge label={urgLabel.toUpperCase()} color={urgColor} />
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{decision.description}</ThemedText>
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{decision.requestedBy}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Requested By</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(decision.requestDate)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Request Date</ThemedText>
          </View>
        </View>
      </View>

      {/* Required Approvers */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Required Approvers ({decision.requiredApprovers.length})
        </ThemedText>
        {decision.requiredApprovers.map((approver, i) => (
          <View key={`approver-${i}`} style={s.sheetListRow}>
            <IconSymbol name="person.fill.checkmark" size={14} color={accentColor} />
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>{approver}</ThemedText>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// ASSET DETAIL BOTTOM SHEET
// =============================================================================

function AssetDetailSheet({
  visible,
  onClose,
  asset,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  asset: ProgramAsset | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!asset) return null;

  const catColor = ASSET_CATEGORY_COLORS[asset.category];
  const catLabel = ASSET_CATEGORY_LABELS[asset.category];
  const condColor = ASSET_CONDITION_COLORS[asset.condition];
  const condLabel = ASSET_CONDITION_LABELS[asset.condition];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={asset.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
        <StatusBadge label={condLabel.toUpperCase()} color={condColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{asset.quantity}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Quantity</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{condLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Condition</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(asset.lastInspected)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Inspected</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: asset.replacementDate ? '#B85C5C' : '#5A8A6E' }]}>
              {asset.replacementDate ? formatDate(asset.replacementDate) : 'N/A'}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Replacement Date</ThemedText>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// PARTNER DETAIL BOTTOM SHEET
// =============================================================================

function PartnerDetailSheet({
  visible,
  onClose,
  partner,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  partner: ProgramPartner | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!partner) return null;

  const typeColor = PARTNER_TYPE_COLORS[partner.type];
  const typeLabel = PARTNER_TYPE_LABELS[partner.type];
  const statusColor = PARTNER_STATUS_COLORS[partner.status];
  const statusLabel = PARTNER_STATUS_LABELS[partner.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={partner.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{typeLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Relationship</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: statusColor }]}>{statusLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Status</ThemedText>
          </View>
        </View>
      </View>

      {/* Contact */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contact</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="person.fill" size={14} color={accentColor} />
          <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>{partner.contact}</ThemedText>
        </View>
      </View>

      {/* Contract */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contract</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="calendar" size={14} color={accentColor} />
          <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>
            Ends {formatDate(partner.contractEnd)}
          </ThemedText>
        </View>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SportsOrgProgramV2({ colors, accentColor, role = 'R3' }: Props) {
  // === RBAC Gate: non-coaching roles locked ===
  if (!canSeeCoachActions(role)) {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Program</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Program information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<PendingDecision | null>(null);
  const [decisionSheetVisible, setDecisionSheetVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ProgramAsset | null>(null);
  const [assetSheetVisible, setAssetSheetVisible] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<ProgramPartner | null>(null);
  const [partnerSheetVisible, setPartnerSheetVisible] = useState(false);

  // === Callbacks ===
  const handleSelectDecision = useCallback((decision: PendingDecision) => {
    setSelectedDecision(decision);
    setDecisionSheetVisible(true);
  }, []);

  const handleCloseDecisionSheet = useCallback(() => {
    setDecisionSheetVisible(false);
  }, []);

  const handleSelectAsset = useCallback((asset: ProgramAsset) => {
    setSelectedAsset(asset);
    setAssetSheetVisible(true);
  }, []);

  const handleCloseAssetSheet = useCallback(() => {
    setAssetSheetVisible(false);
  }, []);

  const handleSelectPartner = useCallback((partner: ProgramPartner) => {
    setSelectedPartner(partner);
    setPartnerSheetVisible(true);
  }, []);

  const handleClosePartnerSheet = useCallback(() => {
    setPartnerSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (canSeeSensitive(role)) return SUB_TABS; // R0-R3: full 10 tabs
    if (role === 'R4') {
      // R4 (Assistant Coach/RC): all except Admin (settings)
      return SUB_TABS.filter((t) => t.id !== 'settings');
    }
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'identity':
        return <IdentityTab colors={colors} accentColor={accentColor} />;
      case 'leadership':
        return <LeadershipTab colors={colors} accentColor={accentColor} />;
      case 'context':
        return <ContextTab colors={colors} accentColor={accentColor} />;
      case 'rules':
        return <RulesTab colors={colors} accentColor={accentColor} />;
      case 'calendar':
        return <CalendarTab colors={colors} accentColor={accentColor} />;
      case 'decisions':
        return (
          <DecisionsTab
            colors={colors}
            accentColor={accentColor}
            onSelectDecision={handleSelectDecision}
          />
        );
      case 'assets':
        return (
          <AssetsTab
            colors={colors}
            accentColor={accentColor}
            onSelectAsset={handleSelectAsset}
          />
        );
      case 'partners':
        return (
          <PartnersTab
            colors={colors}
            accentColor={accentColor}
            onSelectPartner={handleSelectPartner}
          />
        );
      case 'settings':
        if (!canSeeAdminActions(role)) return null;
        return <AdminTab colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar — hidden until drill mode */}
      {drillMode ? (
        <>
          <Pressable
            style={[s.overviewBackBar, { borderBottomColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDrillMode(false);
              setActiveSubTab('overview');
            }}
          >
            <IconSymbol name="chevron.left" size={14} color={accentColor} />
            <ThemedText style={[s.overviewBackText, { color: accentColor }]}>Overview</ThemedText>
          </Pressable>
          <SubTabBar
            tabs={visibleSubTabs}
            activeId={activeSubTab}
            onSelect={setActiveSubTab}
            accentColor={accentColor}
            colors={colors}
          />
        </>
      ) : null}

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Explore bar — overview-only mode */}
      {!drillMode && (
        <Pressable
          style={[s.exploreBar, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDrillMode(true);
          }}
        >
          <IconSymbol name="rectangle.grid.1x2.fill" size={16} color="#FFFFFF" />
          <ThemedText style={s.exploreBarText}>Explore All Sections</ThemedText>
          <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Decision Detail Bottom Sheet */}
      <DecisionDetailSheet
        visible={decisionSheetVisible}
        onClose={handleCloseDecisionSheet}
        decision={selectedDecision}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Asset Detail Bottom Sheet */}
      <AssetDetailSheet
        visible={assetSheetVisible}
        onClose={handleCloseAssetSheet}
        asset={selectedAsset}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Partner Detail Bottom Sheet */}
      <PartnerDetailSheet
        visible={partnerSheetVisible}
        onClose={handleClosePartnerSheet}
        partner={selectedPartner}
        colors={colors}
        accentColor={accentColor}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Overview back bar / Explore bar --
  overviewBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overviewBackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exploreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  exploreBarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Generic Card --
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  cardRow: {
    marginBottom: Spacing.xs,
  },
  cardMeta: {
    fontSize: 13,
  },

  // -- Program Dot --
  programDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // -- KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  kpiItem: {
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Progress label row --
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressLabelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Metrics Strip --
  metricsStrip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Quick Actions --
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickActionCard: {
    width: '47%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // -- Identity --
  identityColorStrip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  identityColorSwatch: {
    width: 40,
    height: 20,
    borderRadius: BorderRadius.sm,
  },
  identityName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  identityOrg: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  identityDetailsSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  identityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  identityDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 80,
  },
  identityDetailValue: {
    fontSize: 13,
    flex: 1,
  },

  // -- Leadership --
  leadershipGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  leadershipGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  leadershipGroupCount: {
    fontSize: 12,
  },
  leadershipCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  leadershipTextCol: {
    flex: 1,
  },
  leadershipTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  leadershipName: {
    fontSize: 13,
    marginTop: 2,
  },
  leadershipMeta: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  leadershipMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  leadershipMetaText: {
    fontSize: 11,
  },

  // -- Context --
  contextCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  contextTextCol: {
    flex: 1,
  },
  contextKey: {
    fontSize: 14,
    fontWeight: '700',
  },
  contextValue: {
    fontSize: 13,
    marginTop: 2,
  },
  contextDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  contextFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  contextFooterText: {
    fontSize: 11,
  },

  // -- Rules --
  ruleTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  ruleDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  ruleBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  ruleFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ruleFooterText: {
    fontSize: 11,
  },

  // -- Calendar / Milestones --
  milestoneCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  milestoneDateBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  milestoneDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  milestoneTextCol: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  milestoneBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  milestoneFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  milestoneOwner: {
    fontSize: 11,
  },

  // -- Decisions --
  decisionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  decisionBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  decisionMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  decisionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  decisionMetaText: {
    fontSize: 11,
  },
  decisionDescription: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Assets --
  assetCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  assetTextCol: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '700',
  },
  assetQuantity: {
    fontSize: 12,
    marginTop: 2,
  },
  assetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  assetFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  assetMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  assetMetaText: {
    fontSize: 11,
  },

  // -- Partners --
  partnerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  partnerBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  partnerFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  partnerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  partnerMetaText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Admin --
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  adminDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  adminActionsSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  adminActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  adminActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // -- Bottom Sheet shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  sheetSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sheetBodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sheetDetailItem: {
    width: '47%',
    marginBottom: Spacing.sm,
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  sheetActions: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sheetGhostButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
