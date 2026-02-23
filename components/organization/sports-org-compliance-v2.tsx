/**
 * Sports Organization Compliance V2 — 7-view sub-tab hub.
 * Sub-tabs: Overview | Controls | Holds | Deadlines | Evidence | Exceptions | Admin
 * RBAC: R1 full 7-tab, R2 (Player) Overview + Deadlines,
 *        R3 (Asst Coach) all except Admin + Exceptions, R4/R5 locked.
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
  getComplianceOverview,
  getComplianceControls,
  getComplianceHolds,
  getComplianceDeadlines,
  getComplianceEvidence,
  getComplianceExceptions,
  CONTROL_CATEGORY_LABEL,
  CONTROL_CATEGORY_COLOR,
  CONTROL_STATUS_LABEL,
  CONTROL_STATUS_COLOR,
  HOLD_TYPE_LABEL,
  HOLD_TYPE_COLOR,
  HOLD_SEVERITY_LABEL,
  HOLD_SEVERITY_COLOR,
  DEADLINE_AUDIENCE_LABEL,
  DEADLINE_AUDIENCE_COLOR,
  DEADLINE_TYPE_LABEL,
  DEADLINE_TYPE_COLOR,
  EVIDENCE_TYPE_LABEL,
  EVIDENCE_TYPE_COLOR,
  EVIDENCE_STATUS_LABEL,
  EVIDENCE_STATUS_COLOR,
  EXCEPTION_STATUS_LABEL,
  EXCEPTION_STATUS_COLOR,
} from '@/data/mock-sports-org-compliance-v2';
import type {
  ComplianceControl,
  ComplianceHold,
  ComplianceDeadline,
  EvidenceItem,
  ComplianceException,
} from '@/data/mock-sports-org-compliance-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.sports;
const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'controls', label: 'Controls' },
  { id: 'holds', label: 'Holds' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'admin', label: 'Admin' },
];

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

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysRemainingLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `${days}d remaining`;
}

function daysRemainingColor(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return '#EF4444';
  if (days <= 3) return '#F59E0B';
  return '#22C55E';
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
  const overview = useMemo(() => getComplianceOverview(), []);
  const holds = useMemo(() => getComplianceHolds(), []);
  const deadlines = useMemo(() => getComplianceDeadlines(), []);
  const evidence = useMemo(() => getComplianceEvidence(), []);

  // Severity breakdown for holds
  const criticalHolds = holds.filter((h) => h.severity === 'critical').length;
  const highHolds = holds.filter((h) => h.severity === 'high').length;
  const mediumHolds = holds.filter((h) => h.severity === 'medium').length;
  const lowHolds = holds.filter((h) => h.severity === 'low').length;

  // Upcoming deadlines (7 days)
  const upcoming7 = deadlines.filter((d) => {
    const days = daysUntil(d.dueDate);
    return days >= 0 && days <= 7;
  }).length;

  // Evidence needing review
  const needsReview = evidence.filter((e) => e.status === 'needs-review' || e.status === 'missing').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Control Status Strip */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Controls Summary</ThemedText>
      <View style={[s.statusStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#22C55E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.ok}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>On Track</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#F59E0B' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.atRisk}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>At Risk</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#EF4444' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.overdue}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Overdue</ThemedText>
        </View>
      </View>

      {/* KPI Grid */}
      <View style={s.kpiGrid}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color={overview.holds > 0 ? '#EF4444' : '#22C55E'} />
          <ThemedText style={[s.kpiValue, { color: overview.holds > 0 ? '#EF4444' : '#22C55E' }]}>
            {overview.holds}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active Holds</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="calendar.badge.clock" size={20} color={upcoming7 > 3 ? '#F59E0B' : accentColor} />
          <ThemedText style={[s.kpiValue, { color: upcoming7 > 3 ? '#F59E0B' : accentColor }]}>
            {upcoming7}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Due in 7 Days</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="doc.text.magnifyingglass" size={20} color={needsReview > 0 ? '#F59E0B' : '#22C55E'} />
          <ThemedText style={[s.kpiValue, { color: needsReview > 0 ? '#F59E0B' : '#22C55E' }]}>
            {needsReview}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Evidence Review</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="shield.lefthalf.filled" size={20} color={accentColor} />
          <ThemedText style={[s.kpiValue, { color: accentColor }]}>
            {overview.ok + overview.atRisk + overview.overdue}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Controls</ThemedText>
        </View>
      </View>

      {/* Hold Severity Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Hold Severity Breakdown
      </ThemedText>
      <View style={[s.severityPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.severityRow}>
          <View style={s.severityItem}>
            <View style={[s.statusDot, { backgroundColor: '#EF4444' }]} />
            <ThemedText style={[s.severityValue, { color: criticalHolds > 0 ? '#EF4444' : colors.text }]}>
              {criticalHolds}
            </ThemedText>
            <ThemedText style={[s.severityLabel, { color: colors.textSecondary }]}>Critical</ThemedText>
          </View>
          <View style={s.severityItem}>
            <View style={[s.statusDot, { backgroundColor: '#F59E0B' }]} />
            <ThemedText style={[s.severityValue, { color: highHolds > 0 ? '#F59E0B' : colors.text }]}>
              {highHolds}
            </ThemedText>
            <ThemedText style={[s.severityLabel, { color: colors.textSecondary }]}>High</ThemedText>
          </View>
          <View style={s.severityItem}>
            <View style={[s.statusDot, { backgroundColor: ACCENT }]} />
            <ThemedText style={[s.severityValue, { color: colors.text }]}>
              {mediumHolds}
            </ThemedText>
            <ThemedText style={[s.severityLabel, { color: colors.textSecondary }]}>Medium</ThemedText>
          </View>
          <View style={s.severityItem}>
            <View style={[s.statusDot, { backgroundColor: '#A1A1AA' }]} />
            <ThemedText style={[s.severityValue, { color: colors.text }]}>
              {lowHolds}
            </ThemedText>
            <ThemedText style={[s.severityLabel, { color: colors.textSecondary }]}>Low</ThemedText>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionGrid}>
        {[
          { id: 'qa-1', label: 'Review Holds', icon: 'exclamationmark.triangle.fill' },
          { id: 'qa-2', label: 'Upload Evidence', icon: 'arrow.up.doc.fill' },
          { id: 'qa-3', label: 'Check Deadlines', icon: 'calendar.badge.clock' },
          { id: 'qa-4', label: 'Run Audit', icon: 'magnifyingglass.circle.fill' },
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
// CONTROLS SUB-TAB
// =============================================================================

function ControlsTab({
  colors,
  accentColor,
  controls,
  onSelectControl,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  controls: ComplianceControl[];
  onSelectControl: (ctrl: ComplianceControl) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: ComplianceControl }) => {
      const catColor = CONTROL_CATEGORY_COLOR[item.category];
      const catLabel = CONTROL_CATEGORY_LABEL[item.category];
      const statusColor = CONTROL_STATUS_COLOR[item.status];
      const statusLabel = CONTROL_STATUS_LABEL[item.status];
      return (
        <Pressable
          style={[s.controlCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectControl(item);
          }}
        >
          <ThemedText style={[s.controlName, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <View style={s.controlBadgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.controlMetaRow}>
            <View style={s.controlMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.controlMetaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.controlMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.controlMetaText, { color: colors.textTertiary }]}>
                Due {formatDate(item.nextDueDate)}
              </ThemedText>
            </View>
          </View>
          <View style={[s.controlFooter, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.controlFooterText, { color: colors.textTertiary }]}>
              Last checked: {formatDate(item.lastChecked)}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectControl],
  );

  return (
    <FlatList
      data={controls}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="slider.horizontal.3" label="No controls available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// HOLDS SUB-TAB
// =============================================================================

function HoldsTab({
  colors,
  accentColor,
  holds,
  onSelectHold,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  holds: ComplianceHold[];
  onSelectHold: (hold: ComplianceHold) => void;
}) {
  // Sort by severity: critical first
  const sorted = useMemo(() => {
    const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...holds].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
  }, [holds]);

  const renderItem = useCallback(
    ({ item }: { item: ComplianceHold }) => {
      const typeColor = HOLD_TYPE_COLOR[item.type];
      const typeLabel = HOLD_TYPE_LABEL[item.type];
      const sevColor = HOLD_SEVERITY_COLOR[item.severity];
      const sevLabel = HOLD_SEVERITY_LABEL[item.severity];
      return (
        <Pressable
          style={[s.holdCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectHold(item);
          }}
        >
          <View style={[s.holdSeverityBar, { backgroundColor: sevColor }]} />
          <View style={s.holdContent}>
            <View style={s.holdHeader}>
              <ThemedText style={[s.holdPerson, { color: colors.text }]}>
                {item.impactedPerson}
              </ThemedText>
              {item.escalated && (
                <StatusBadge label="ESCALATED" color="#EF4444" />
              )}
            </View>
            <ThemedText style={[s.holdImpact, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.impactType}
            </ThemedText>
            <View style={s.holdBadgeRow}>
              <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
              <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
            </View>
            <View style={s.holdMetaRow}>
              <View style={s.holdMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.holdMetaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
              </View>
              <View style={s.holdMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.holdMetaText, { color: daysRemainingColor(item.dueDate) }]}>
                  {daysRemainingLabel(item.dueDate)}
                </ThemedText>
              </View>
            </View>
            <View style={[s.holdNextStep, { borderTopColor: colors.border }]}>
              <IconSymbol name="arrow.right.circle.fill" size={12} color={accentColor} />
              <ThemedText style={[s.holdNextStepText, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.nextStep}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectHold],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="exclamationmark.triangle.fill" label="No active holds" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DEADLINES SUB-TAB
// =============================================================================

function DeadlinesTab({
  colors,
  accentColor,
  deadlines,
  onSelectDeadline,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  deadlines: ComplianceDeadline[];
  onSelectDeadline: (dl: ComplianceDeadline) => void;
}) {
  // Sort by due date ascending
  const sorted = useMemo(() => {
    return [...deadlines].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  }, [deadlines]);

  const renderItem = useCallback(
    ({ item }: { item: ComplianceDeadline }) => {
      const audColor = DEADLINE_AUDIENCE_COLOR[item.audience];
      const audLabel = DEADLINE_AUDIENCE_LABEL[item.audience];
      const typeColor = DEADLINE_TYPE_COLOR[item.type];
      const typeLabel = DEADLINE_TYPE_LABEL[item.type];
      const rateColor = item.completionRate < 80 ? '#EF4444' : '#22C55E';
      const dayColor = daysRemainingColor(item.dueDate);
      return (
        <Pressable
          style={[s.deadlineCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectDeadline(item);
          }}
        >
          <ThemedText style={[s.deadlineTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <View style={s.deadlineBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={audLabel.toUpperCase()} color={audColor} />
            <StatusBadge label={daysRemainingLabel(item.dueDate).toUpperCase()} color={dayColor} />
          </View>

          {/* Completion Rate */}
          <View style={s.completionRow}>
            <ThemedText style={[s.completionLabel, { color: colors.textSecondary }]}>
              Completion
            </ThemedText>
            <ThemedText style={[s.completionPercent, { color: rateColor }]}>
              {item.completionRate}%
            </ThemedText>
          </View>
          <ProgressBar percent={item.completionRate} color={rateColor} />

          <View style={[s.deadlineMeta, { borderTopColor: colors.border }]}>
            <View style={s.deadlineMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.deadlineMetaText, { color: colors.textTertiary }]}>
                Due {formatDate(item.dueDate)}
              </ThemedText>
            </View>
            <View style={s.deadlineMetaItem}>
              <IconSymbol name="person.2.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.deadlineMetaText, { color: colors.textTertiary }]}>
                {item.completedCount}/{item.totalRequired} completed
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectDeadline],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="calendar.badge.clock" label="No upcoming deadlines" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EVIDENCE SUB-TAB
// =============================================================================

function EvidenceTab({
  colors,
  accentColor,
  evidenceItems,
  controls,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  evidenceItems: EvidenceItem[];
  controls: ComplianceControl[];
}) {
  // Sort: needs-review and missing first
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { missing: 0, 'needs-review': 1, stale: 2, accepted: 3 };
    return [...evidenceItems].sort((a, b) => (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4));
  }, [evidenceItems]);

  // Build a lookup from control id to control title
  const controlTitleMap = useMemo(() => {
    const map: Record<string, string> = {};
    controls.forEach((c) => { map[c.id] = c.title; });
    return map;
  }, [controls]);

  const renderItem = useCallback(
    ({ item }: { item: EvidenceItem }) => {
      const typeColor = EVIDENCE_TYPE_COLOR[item.type];
      const typeLabel = EVIDENCE_TYPE_LABEL[item.type];
      const statusColor = EVIDENCE_STATUS_COLOR[item.status];
      const statusLabel = EVIDENCE_STATUS_LABEL[item.status];
      const controlTitle = controlTitleMap[item.linkedControl] || item.linkedControl;
      return (
        <View
          style={[s.evidenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.evidenceCardTop}>
            <IconSymbol name="paperclip" size={16} color={accentColor} />
            <View style={s.evidenceTextCol}>
              <ThemedText style={[s.evidenceName, { color: colors.text }]} numberOfLines={2}>
                {controlTitle}
              </ThemedText>
              <ThemedText style={[s.evidenceSubmitter, { color: colors.textSecondary }]}>
                {item.owner} — {formatDate(item.timestamp)}
              </ThemedText>
            </View>
          </View>
          <View style={s.evidenceBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
        </View>
      );
    },
    [colors, accentColor, controlTitleMap],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="paperclip" label="No evidence items" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EXCEPTIONS SUB-TAB
// =============================================================================

function ExceptionsTab({
  colors,
  accentColor,
  exceptions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  exceptions: ComplianceException[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {exceptions.map((exc) => {
        const statusColor = EXCEPTION_STATUS_COLOR[exc.status];
        const statusLabel = EXCEPTION_STATUS_LABEL[exc.status];
        return (
          <View
            key={exc.id}
            style={[s.exceptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.exceptionHeader}>
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            </View>
            <ThemedText style={[s.exceptionTitle, { color: colors.text }]} numberOfLines={2}>
              {exc.title}
            </ThemedText>
            <ThemedText style={[s.exceptionReason, { color: colors.textSecondary }]} numberOfLines={3}>
              {exc.reason}
            </ThemedText>

            <View style={[s.exceptionMeta, { borderTopColor: colors.border }]}>
              <View style={s.exceptionMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.exceptionMetaText, { color: colors.textTertiary }]}>
                  {exc.requestedBy}
                </ThemedText>
              </View>
              <View style={s.exceptionMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.exceptionMetaText, { color: colors.textTertiary }]}>
                  {formatDate(exc.requestDate)}
                </ThemedText>
              </View>
            </View>

            {/* Approver chain */}
            <View style={s.approverRow}>
              <ThemedText style={[s.approverLabel, { color: colors.textTertiary }]}>Approvers:</ThemedText>
              {exc.requiredApprovers.map((approver, i) => (
                <ThemedText key={`${exc.id}-approver-${i}`} style={[s.approverName, { color: colors.textSecondary }]}>
                  {approver}{i < exc.requiredApprovers.length - 1 ? ', ' : ''}
                </ThemedText>
              ))}
            </View>
          </View>
        );
      })}

      {exceptions.length === 0 && (
        <EmptyState icon="hand.raised.fill" label="No exceptions on record" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// ADMIN SUB-TAB
// =============================================================================

function AdminTab({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const adminItems = [
    { id: 'a1', label: 'Compliance Policies', icon: 'doc.text.fill', desc: 'Manage compliance policy definitions and versioning' },
    { id: 'a2', label: 'Control Templates', icon: 'slider.horizontal.3', desc: 'Define reusable control templates for new seasons' },
    { id: 'a3', label: 'Hold Rules', icon: 'exclamationmark.triangle.fill', desc: 'Configure auto-hold triggers and escalation thresholds' },
    { id: 'a4', label: 'Deadline Calendar', icon: 'calendar.badge.clock', desc: 'Set recurring compliance deadlines and reminders' },
    { id: 'a5', label: 'Evidence Requirements', icon: 'paperclip', desc: 'Map required evidence types to each control' },
    { id: 'a6', label: 'Audit Configuration', icon: 'magnifyingglass.circle.fill', desc: 'Schedule automated audit runs and define scope' },
    { id: 'a7', label: 'Exception Workflow', icon: 'hand.raised.fill', desc: 'Configure approval chains for compliance exceptions' },
    { id: 'a8', label: 'Notifications', icon: 'bell.fill', desc: 'Compliance alert routing and escalation preferences' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Compliance Administration</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Compliance administration tools
      </ThemedText>

      {adminItems.map((item) => (
        <Pressable
          key={item.id}
          style={[s.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={s.adminCardTop}>
            <IconSymbol name={item.icon as any} size={18} color={accentColor} />
            <View style={s.adminTextCol}>
              <ThemedText style={[s.adminLabel, { color: colors.text }]}>{item.label}</ThemedText>
              <ThemedText style={[s.adminDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.desc}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// CONTROL DETAIL BOTTOM SHEET
// =============================================================================

function ControlDetailSheet({
  visible,
  onClose,
  control,
  evidence,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  control: ComplianceControl | null;
  evidence: EvidenceItem[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!control) return null;

  const catColor = CONTROL_CATEGORY_COLOR[control.category];
  const catLabel = CONTROL_CATEGORY_LABEL[control.category];
  const statusColor = CONTROL_STATUS_COLOR[control.status];
  const statusLabel = CONTROL_STATUS_LABEL[control.status];
  const linkedEvidence = evidence.filter((e) => e.linkedControl === control.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={control.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{control.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{catLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(control.nextDueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Next Due</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(control.lastChecked)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Checked</ThemedText>
          </View>
        </View>
      </View>

      {/* Linked Evidence */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Linked Evidence ({linkedEvidence.length})
        </ThemedText>
        {linkedEvidence.map((ev) => {
          const evStatusColor = EVIDENCE_STATUS_COLOR[ev.status];
          const evStatusLabel = EVIDENCE_STATUS_LABEL[ev.status];
          return (
            <View key={ev.id} style={s.sheetListRow}>
              <IconSymbol name="paperclip" size={14} color={accentColor} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {EVIDENCE_TYPE_LABEL[ev.type]} — {ev.owner}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {formatDate(ev.timestamp)}
                </ThemedText>
              </View>
              <StatusBadge label={evStatusLabel.toUpperCase()} color={evStatusColor} />
            </View>
          );
        })}
        {linkedEvidence.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No evidence items linked
          </ThemedText>
        )}
      </View>

      {/* Status Timeline */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {statusLabel}
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
// HOLD DETAIL BOTTOM SHEET
// =============================================================================

function HoldDetailSheet({
  visible,
  onClose,
  hold,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  hold: ComplianceHold | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!hold) return null;

  const typeColor = HOLD_TYPE_COLOR[hold.type];
  const typeLabel = HOLD_TYPE_LABEL[hold.type];
  const sevColor = HOLD_SEVERITY_COLOR[hold.severity];
  const sevLabel = HOLD_SEVERITY_LABEL[hold.severity];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Hold Details" useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
        {hold.escalated && <StatusBadge label="ESCALATED" color="#EF4444" />}
      </View>

      {/* Person */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Impacted Person</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.text, fontWeight: '600' }]}>
          {hold.impactedPerson}
        </ThemedText>
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Impact</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {hold.impactType}
        </ThemedText>
      </View>

      {/* Details Grid */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{hold.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: daysRemainingColor(hold.dueDate) }]}>
              {daysRemainingLabel(hold.dueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: sevColor }]}>{sevLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Severity</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(hold.dueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Target Date</ThemedText>
          </View>
        </View>
      </View>

      {/* Resolution Steps */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Resolution Steps</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="arrow.right.circle.fill" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Next Step</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {hold.nextStep}
            </ThemedText>
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
// DEADLINE DETAIL BOTTOM SHEET
// =============================================================================

function DeadlineDetailSheet({
  visible,
  onClose,
  deadline,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  deadline: ComplianceDeadline | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!deadline) return null;

  const audColor = DEADLINE_AUDIENCE_COLOR[deadline.audience];
  const audLabel = DEADLINE_AUDIENCE_LABEL[deadline.audience];
  const typeColor = DEADLINE_TYPE_COLOR[deadline.type];
  const typeLabel = DEADLINE_TYPE_LABEL[deadline.type];
  const rateColor = deadline.completionRate < 80 ? '#EF4444' : '#22C55E';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={deadline.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={audLabel.toUpperCase()} color={audColor} />
        <StatusBadge
          label={daysRemainingLabel(deadline.dueDate).toUpperCase()}
          color={daysRemainingColor(deadline.dueDate)}
        />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{typeLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Type</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{audLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Audience</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(deadline.dueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: daysRemainingColor(deadline.dueDate) }]}>
              {daysRemainingLabel(deadline.dueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Status</ThemedText>
          </View>
        </View>
      </View>

      {/* Completion */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Completion</ThemedText>
        <View style={s.sheetCompletionRow}>
          <ThemedText style={[s.sheetCompletionLabel, { color: colors.textSecondary }]}>
            {deadline.completedCount} of {deadline.totalRequired} completed
          </ThemedText>
          <ThemedText style={[s.sheetCompletionPercent, { color: rateColor }]}>
            {deadline.completionRate}%
          </ThemedText>
        </View>
        <ProgressBar percent={deadline.completionRate} color={rateColor} />
      </View>

      {/* Notes */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Notes</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {deadline.completionRate >= 80
            ? 'Completion rate is on track. Continue monitoring for full compliance.'
            : 'Completion rate is below the 80% threshold. Immediate follow-up is recommended to ensure compliance before the due date.'}
        </ThemedText>
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
// MAIN EXPORT
// =============================================================================

export function SportsOrgComplianceV2({ colors, accentColor, role = 'R3' }: Props) {
  // === RBAC Gate: non-coaching roles locked ===
  if (!canSeeCoachActions(role)) {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Compliance</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Compliance information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ComplianceControl | null>(null);
  const [controlSheetVisible, setControlSheetVisible] = useState(false);
  const [selectedHold, setSelectedHold] = useState<ComplianceHold | null>(null);
  const [holdSheetVisible, setHoldSheetVisible] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<ComplianceDeadline | null>(null);
  const [deadlineSheetVisible, setDeadlineSheetVisible] = useState(false);

  // === Data ===
  const controls = useMemo(() => getComplianceControls(), []);
  const holds = useMemo(() => getComplianceHolds(), []);
  const deadlines = useMemo(() => getComplianceDeadlines(), []);
  const evidenceItems = useMemo(() => getComplianceEvidence(), []);
  const exceptions = useMemo(() => getComplianceExceptions(), []);

  // === Callbacks ===
  const handleSelectControl = useCallback((ctrl: ComplianceControl) => {
    setSelectedControl(ctrl);
    setControlSheetVisible(true);
  }, []);

  const handleCloseControlSheet = useCallback(() => {
    setControlSheetVisible(false);
  }, []);

  const handleSelectHold = useCallback((hold: ComplianceHold) => {
    setSelectedHold(hold);
    setHoldSheetVisible(true);
  }, []);

  const handleCloseHoldSheet = useCallback(() => {
    setHoldSheetVisible(false);
  }, []);

  const handleSelectDeadline = useCallback((dl: ComplianceDeadline) => {
    setSelectedDeadline(dl);
    setDeadlineSheetVisible(true);
  }, []);

  const handleCloseDeadlineSheet = useCallback(() => {
    setDeadlineSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (canSeeSensitive(role)) return SUB_TABS; // R0-R3: full 7 tabs
    if (role === 'R4') {
      // R4 (Assistant Coach/RC): all except Admin + Exceptions
      return SUB_TABS.filter(
        (t) => t.id !== 'admin' && t.id !== 'exceptions',
      );
    }
    // Non-coaching roles already handled by locked gate above
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'controls':
        return (
          <ControlsTab
            colors={colors}
            accentColor={accentColor}
            controls={controls}
            onSelectControl={handleSelectControl}
          />
        );
      case 'holds':
        return (
          <HoldsTab
            colors={colors}
            accentColor={accentColor}
            holds={holds}
            onSelectHold={handleSelectHold}
          />
        );
      case 'deadlines':
        return (
          <DeadlinesTab
            colors={colors}
            accentColor={accentColor}
            deadlines={deadlines}
            onSelectDeadline={handleSelectDeadline}
          />
        );
      case 'evidence':
        return (
          <EvidenceTab
            colors={colors}
            accentColor={accentColor}
            evidenceItems={evidenceItems}
            controls={controls}
          />
        );
      case 'exceptions':
        if (!canSeeAdminActions(role)) return null;
        return <ExceptionsTab colors={colors} accentColor={accentColor} exceptions={exceptions} />;
      case 'admin':
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

      {/* Control Detail Bottom Sheet */}
      <ControlDetailSheet
        visible={controlSheetVisible}
        onClose={handleCloseControlSheet}
        control={selectedControl}
        evidence={evidenceItems}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Hold Detail Bottom Sheet */}
      <HoldDetailSheet
        visible={holdSheetVisible}
        onClose={handleCloseHoldSheet}
        hold={selectedHold}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Deadline Detail Bottom Sheet */}
      <DeadlineDetailSheet
        visible={deadlineSheetVisible}
        onClose={handleCloseDeadlineSheet}
        deadline={selectedDeadline}
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
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
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

  // -- Status Strip --
  statusStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusStripItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusCount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statusLabel: {
    fontSize: 11,
  },

  // -- KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    textAlign: 'center',
  },

  // -- Severity Panel --
  severityPanel: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  severityItem: {
    alignItems: 'center',
    gap: 4,
  },
  severityValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  severityLabel: {
    fontSize: 11,
  },

  // -- Quick Actions --
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Control Card --
  controlCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  controlName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  controlBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  controlMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  controlMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlMetaText: {
    fontSize: 11,
  },
  controlFooter: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  controlFooterText: {
    fontSize: 11,
  },

  // -- Hold Card --
  holdCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  holdSeverityBar: {
    width: 4,
  },
  holdContent: {
    flex: 1,
    padding: Spacing.md,
  },
  holdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  holdPerson: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  holdImpact: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  holdBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  holdMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  holdMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  holdMetaText: {
    fontSize: 11,
  },
  holdNextStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  holdNextStepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Deadline Card --
  deadlineCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  deadlineBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  completionLabel: {
    fontSize: 12,
  },
  completionPercent: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  deadlineMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  deadlineMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineMetaText: {
    fontSize: 11,
  },

  // -- Evidence Card --
  evidenceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  evidenceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  evidenceTextCol: {
    flex: 1,
  },
  evidenceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  evidenceSubmitter: {
    fontSize: 11,
  },
  evidenceBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },

  // -- Exception Card --
  exceptionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exceptionHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  exceptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  exceptionReason: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  exceptionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  exceptionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exceptionMetaText: {
    fontSize: 11,
  },
  approverRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  approverLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  approverName: {
    fontSize: 11,
  },

  // -- Admin Card --
  adminCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  adminCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  adminTextCol: {
    flex: 1,
  },
  adminLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  adminDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Bottom Sheet Shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sheetBodyText: {
    fontSize: 13,
    lineHeight: 19,
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
    marginBottom: 2,
  },
  sheetDetailLabel: {
    fontSize: 11,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetCompletionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sheetCompletionLabel: {
    fontSize: 12,
  },
  sheetCompletionPercent: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetActions: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sheetGhostButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
