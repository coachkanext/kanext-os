/**
 * Education Organization Operations v2 — 5-view sub-tab hub.
 * Sub-tabs: Ops Dashboard | Initiatives | Workflows | Queue | Scorecards
 * RBAC: E1/E2 full, E3 Dashboard+Queue+Scorecards, E4 Scorecards (summary), E5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel } from '@/utils/education-rbac';
import {
  getEduOpsV2Data,
  INITIATIVE_STATUS_LABELS,
  INITIATIVE_STATUS_COLORS,
  WORKFLOW_STATUS_LABELS,
  WORKFLOW_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  GATE_STATUS_LABELS,
  GATE_STATUS_COLORS,
  OPS_DOMAIN_LABELS,
  OPS_DOMAIN_COLORS,
  OPS_DOMAIN_ICONS,
} from '@/data/mock-edu-org-operations-v2';
import type {
  OpsInitiative,
  OpsWorkflow,
  OpsTask,
  DecisionGate,
  DomainScorecard,
  ScorecardKPI,
} from '@/data/mock-edu-org-operations-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.education;
const SUB_TABS = [
  { id: 'dashboard', label: 'Ops Dashboard' },
  { id: 'initiatives', label: 'Initiatives' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'queue', label: 'Queue' },
  { id: 'scorecards', label: 'Scorecards' },
];

const HEALTH_DOT_COLORS: Record<string, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: EducationRoleLens;
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

function formatBudget(val: string): string {
  return val || '--';
}

// =============================================================================
// LOCAL PRIMITIVES
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

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
// OPS DASHBOARD SUB-TAB
// =============================================================================

function DashboardTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getEduOpsV2Data>;
}) {
  const { dashboardTiles } = data;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Today / Next 7 Days */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{dashboardTiles.todayTasks}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Today</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{dashboardTiles.next7DaysTasks}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Next 7 Days</ThemedText>
        </View>
      </View>

      {/* Risk Strip */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#EF4444' }]}>{dashboardTiles.blockedInitiatives}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Blocked</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#F59E0B' }]}>{dashboardTiles.atRiskInitiatives}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>At Risk</ThemedText>
        </View>
      </View>

      {/* Domain Health */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>Domain Health</ThemedText>
      <View style={s.domainGrid}>
        {dashboardTiles.domainHealth.map((dh) => {
          const domainIcon = OPS_DOMAIN_ICONS[dh.domain];
          const domainLabel = OPS_DOMAIN_LABELS[dh.domain];
          const healthColor = HEALTH_DOT_COLORS[dh.health];
          return (
            <View key={dh.domain} style={[s.domainTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.domainTileTop}>
                <IconSymbol name={domainIcon as any} size={18} color={OPS_DOMAIN_COLORS[dh.domain]} />
                <View style={[s.healthDot, { backgroundColor: healthColor }]} />
              </View>
              <ThemedText style={[s.domainTileLabel, { color: colors.text }]}>{domainLabel}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Approval Pressure & Owner Coverage */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>Operations Pulse</ThemedText>
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: dashboardTiles.approvalPressure > 3 ? '#F59E0B' : colors.text }]}>
            {dashboardTiles.approvalPressure}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Approval Pressure</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: dashboardTiles.ownerCoverage >= 90 ? '#22C55E' : '#F59E0B' }]}>
            {dashboardTiles.ownerCoverage}%
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Owner Coverage</ThemedText>
        </View>
      </View>

      {/* SLA Breaches */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.sm }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="exclamationmark.triangle.fill" size={16} color={dashboardTiles.slaBreaches > 0 ? '#EF4444' : '#22C55E'} />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>SLA Breaches</ThemedText>
          <ThemedText style={[s.percentLabel, { color: dashboardTiles.slaBreaches > 0 ? '#EF4444' : '#22C55E' }]}>
            {dashboardTiles.slaBreaches}
          </ThemedText>
        </View>
        <ThemedText style={[s.sectionCardBody, { color: colors.textSecondary }]}>
          {dashboardTiles.slaBreaches > 0
            ? `${dashboardTiles.slaBreaches} workflow SLA breaches across all domains`
            : 'All workflows within SLA targets'}
        </ThemedText>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// INITIATIVES SUB-TAB
// =============================================================================

function InitiativesTab({
  colors,
  accentColor,
  initiatives,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  initiatives: OpsInitiative[];
  onSelect: (item: OpsInitiative) => void;
}) {
  const sorted = useMemo(() => {
    return [...initiatives].sort((a, b) => {
      const rank = (i: OpsInitiative): number => {
        if (i.status === 'blocked') return 0;
        if (i.status === 'at_risk') return 1;
        if (i.complianceLinked) return 2;
        const budgetNum = parseInt(i.budgetAllocated.replace(/[^0-9]/g, ''), 10) || 0;
        if (budgetNum >= 200) return 3;
        return 4;
      };
      return rank(a) - rank(b);
    });
  }, [initiatives]);

  const renderItem = useCallback(
    ({ item }: { item: OpsInitiative }) => {
      const statusColor = INITIATIVE_STATUS_COLORS[item.status];
      const statusLabel = INITIATIVE_STATUS_LABELS[item.status];
      const domainColor = OPS_DOMAIN_COLORS[item.domain];
      const domainLabel = OPS_DOMAIN_LABELS[item.domain];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(item);
          }}
        >
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.name}</ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={domainLabel.toUpperCase()} color={domainColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          {item.institution && (
            <ThemedText style={[s.cardMeta, { color: colors.textTertiary }]}>{item.institution}</ThemedText>
          )}
          <View style={s.cardDetailRow}>
            <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
            <ThemedText style={[s.cardDetailValue, { color: colors.text }]}>{item.owner}</ThemedText>
          </View>
          <View style={s.cardDetailRow}>
            <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>Dates</ThemedText>
            <ThemedText style={[s.cardDetailValue, { color: colors.text }]}>
              {formatDate(item.startDate)} - {formatDate(item.targetDate)}
            </ThemedText>
          </View>
          <View style={s.cardDetailRow}>
            <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>Budget</ThemedText>
            <ThemedText style={[s.cardDetailValue, { color: colors.text }]}>
              {formatBudget(item.budgetAllocated)} / {formatBudget(item.budgetSpent)} spent
            </ThemedText>
          </View>

          {/* KPI Progress */}
          {item.kpis.map((kpi, i) => {
            const pct = kpi.target > 0 ? Math.round((kpi.current / kpi.target) * 100) : 0;
            return (
              <View key={`${item.id}-kpi-${i}`} style={s.kpiProgressRow}>
                <View style={s.kpiProgressHeader}>
                  <ThemedText style={[s.kpiProgressLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
                  <ThemedText style={[s.kpiProgressValue, { color: colors.text }]}>
                    {kpi.current}{kpi.unit} / {kpi.target}{kpi.unit}
                  </ThemedText>
                </View>
                <ProgressBar percent={pct} color={accentColor} />
              </View>
            );
          })}

          {/* Blockers */}
          {item.blockers.length > 0 && (
            <View style={[s.blockersSection, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.blockerTitle, { color: '#EF4444' }]}>Blockers</ThemedText>
              {item.blockers.map((b, i) => (
                <View key={`${item.id}-blocker-${i}`} style={s.blockerRow}>
                  <IconSymbol name="xmark.octagon.fill" size={12} color="#EF4444" />
                  <ThemedText style={[s.blockerText, { color: colors.textSecondary }]} numberOfLines={2}>{b}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Next Action */}
          <View style={[s.nextActionRow, { borderTopColor: colors.border }]}>
            <IconSymbol name="arrow.right.circle.fill" size={14} color={accentColor} />
            <ThemedText style={[s.nextActionText, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.nextAction}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelect],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState icon="chart.bar.doc.horizontal.fill" label="No initiatives" colors={colors} />}
    />
  );
}

// =============================================================================
// WORKFLOWS SUB-TAB
// =============================================================================

function WorkflowsTab({
  colors,
  accentColor,
  workflows,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  workflows: OpsWorkflow[];
  onSelect: (item: OpsWorkflow) => void;
}) {
  const grouped = useMemo(() => {
    const map: Record<string, OpsWorkflow[]> = {};
    workflows.forEach((w) => {
      if (!map[w.domain]) map[w.domain] = [];
      map[w.domain].push(w);
    });
    return map;
  }, [workflows]);

  const domains = Object.keys(grouped) as (keyof typeof OPS_DOMAIN_LABELS)[];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {domains.map((domain) => {
        const domainColor = OPS_DOMAIN_COLORS[domain];
        const domainLabel = OPS_DOMAIN_LABELS[domain];
        const domainIcon = OPS_DOMAIN_ICONS[domain];
        const items = grouped[domain];
        return (
          <View key={domain}>
            <View style={s.domainGroupHeader}>
              <IconSymbol name={domainIcon as any} size={16} color={domainColor} />
              <ThemedText style={[s.domainGroupLabel, { color: colors.text }]}>
                {domainLabel} ({items.length})
              </ThemedText>
            </View>
            {items.map((wf) => {
              const statusColor = WORKFLOW_STATUS_COLORS[wf.status];
              const statusLabel = WORKFLOW_STATUS_LABELS[wf.status];
              const stepPct = wf.totalSteps > 0 ? Math.round((wf.completedSteps / wf.totalSteps) * 100) : 0;
              return (
                <Pressable
                  key={wf.id}
                  style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelect(wf);
                  }}
                >
                  <ThemedText style={[s.cardTitle, { color: colors.text }]}>{wf.name}</ThemedText>
                  <View style={s.badgeRow}>
                    <StatusBadge label={domainLabel.toUpperCase()} color={domainColor} />
                    <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
                  </View>
                  {wf.institution && (
                    <ThemedText style={[s.cardMeta, { color: colors.textTertiary }]}>{wf.institution}</ThemedText>
                  )}
                  <View style={s.cardDetailRow}>
                    <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>Steps</ThemedText>
                    <ThemedText style={[s.cardDetailValue, { color: colors.text }]}>
                      {wf.completedSteps} / {wf.totalSteps}
                    </ThemedText>
                  </View>
                  <ProgressBar percent={stepPct} color={accentColor} />
                  <View style={s.cardDetailRow}>
                    <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>Avg Days</ThemedText>
                    <ThemedText style={[s.cardDetailValue, { color: wf.avgCompletionDays > wf.slaTarget ? '#EF4444' : colors.text }]}>
                      {wf.avgCompletionDays}d / {wf.slaTarget}d SLA
                    </ThemedText>
                  </View>
                  {wf.slaBreaches > 0 && (
                    <View style={s.cardDetailRow}>
                      <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>SLA Breaches</ThemedText>
                      <ThemedText style={[s.cardDetailValue, { color: '#EF4444', fontWeight: '700' }]}>
                        {wf.slaBreaches}
                      </ThemedText>
                    </View>
                  )}
                  <View style={s.cardDetailRow}>
                    <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>Current Runs</ThemedText>
                    <ThemedText style={[s.cardDetailValue, { color: colors.text }]}>{wf.currentRuns}</ThemedText>
                  </View>
                  {wf.bottleneckStep && (
                    <View style={[s.bottleneckRow, { borderTopColor: colors.border }]}>
                      <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
                      <ThemedText style={[s.bottleneckText, { color: '#EF4444' }]}>
                        Bottleneck: {wf.bottleneckStep}
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        );
      })}
      {workflows.length === 0 && (
        <EmptyState icon="arrow.triangle.branch" label="No workflows" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// QUEUE SUB-TAB
// =============================================================================

type QueueItem =
  | { type: 'task'; data: OpsTask }
  | { type: 'gate'; data: DecisionGate };

function QueueTab({
  colors,
  accentColor,
  tasks,
  gates,
  initiatives,
  workflows,
  onSelectTask: onTask,
  onSelectGate: onGate,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  tasks: OpsTask[];
  gates: DecisionGate[];
  initiatives: OpsInitiative[];
  workflows: OpsWorkflow[];
  onSelectTask: (t: OpsTask) => void;
  onSelectGate: (g: DecisionGate) => void;
}) {
  const merged = useMemo(() => {
    const items: QueueItem[] = [
      ...tasks.filter((t) => t.status !== 'completed').map((t) => ({ type: 'task' as const, data: t })),
      ...gates.filter((g) => g.status !== 'approved').map((g) => ({ type: 'gate' as const, data: g })),
    ];

    const taskRank = (t: OpsTask): number => {
      if (t.status === 'overdue') return 0;
      if (t.priority === 'critical') return 1;
      if (t.priority === 'high') return 2;
      if (t.status === 'blocked') return 3;
      if (t.status === 'pending') return 4;
      if (t.status === 'in_progress') return 5;
      return 6;
    };

    const gateRank = (g: DecisionGate): number => {
      if (g.status === 'escalated') return 1;
      if (g.status === 'pending') return 2;
      return 7;
    };

    items.sort((a, b) => {
      const ra = a.type === 'task' ? taskRank(a.data as OpsTask) : gateRank(a.data as DecisionGate);
      const rb = b.type === 'task' ? taskRank(b.data as OpsTask) : gateRank(b.data as DecisionGate);
      return ra - rb;
    });

    return items;
  }, [tasks, gates]);

  const getLinkedName = useCallback(
    (item: OpsTask) => {
      if (item.linkedInitiative) {
        const init = initiatives.find((i) => i.id === item.linkedInitiative);
        return init?.name;
      }
      if (item.linkedWorkflow) {
        const wf = workflows.find((w) => w.id === item.linkedWorkflow);
        return wf?.name;
      }
      return undefined;
    },
    [initiatives, workflows],
  );

  const getGateLinkedName = useCallback(
    (gate: DecisionGate) => {
      if (gate.linkedInitiative) {
        const init = initiatives.find((i) => i.id === gate.linkedInitiative);
        return init?.name;
      }
      return undefined;
    },
    [initiatives],
  );

  const renderItem = useCallback(
    ({ item }: { item: QueueItem }) => {
      if (item.type === 'task') {
        const t = item.data as OpsTask;
        const statusColor = TASK_STATUS_COLORS[t.status];
        const statusLabel = TASK_STATUS_LABELS[t.status];
        const priorityColor = TASK_PRIORITY_COLORS[t.priority];
        const priorityLabel = TASK_PRIORITY_LABELS[t.priority];
        const domainColor = OPS_DOMAIN_COLORS[t.domain];
        const domainLabel = OPS_DOMAIN_LABELS[t.domain];
        const linkedName = getLinkedName(t);
        return (
          <Pressable
            style={[s.queueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTask(t);
            }}
          >
            <View style={s.queueCardTop}>
              <IconSymbol name="checklist" size={14} color={accentColor} />
              <ThemedText style={[s.queueCardTitle, { color: colors.text }]} numberOfLines={2}>{t.title}</ThemedText>
            </View>
            <View style={s.badgeRow}>
              <StatusBadge label={domainLabel.toUpperCase()} color={domainColor} />
              <StatusBadge label={priorityLabel.toUpperCase()} color={priorityColor} />
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            </View>
            <View style={s.queueMeta}>
              <ThemedText style={[s.queueMetaText, { color: colors.textSecondary }]}>{t.assignee}</ThemedText>
              <ThemedText style={[s.queueMetaText, { color: t.status === 'overdue' ? '#EF4444' : colors.textTertiary }]}>
                Due {formatDate(t.dueDate)}
              </ThemedText>
            </View>
            {linkedName && (
              <ThemedText style={[s.queueLinked, { color: colors.textTertiary }]} numberOfLines={1}>
                {linkedName}
              </ThemedText>
            )}
          </Pressable>
        );
      }

      // Gate
      const g = item.data as DecisionGate;
      const gateStatusColor = GATE_STATUS_COLORS[g.status];
      const gateStatusLabel = GATE_STATUS_LABELS[g.status];
      const domainColor = OPS_DOMAIN_COLORS[g.domain];
      const domainLabel = OPS_DOMAIN_LABELS[g.domain];
      const linkedName = getGateLinkedName(g);
      return (
        <Pressable
          style={[s.queueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onGate(g);
          }}
        >
          <View style={s.queueCardTop}>
            <IconSymbol name="checkmark.seal.fill" size={14} color={ACCENT} />
            <ThemedText style={[s.queueCardTitle, { color: colors.text }]} numberOfLines={2}>{g.title}</ThemedText>
          </View>
          <View style={s.badgeRow}>
            <StatusBadge label={domainLabel.toUpperCase()} color={domainColor} />
            <StatusBadge label={gateStatusLabel.toUpperCase()} color={gateStatusColor} />
          </View>
          <View style={s.queueMeta}>
            <ThemedText style={[s.queueMetaText, { color: colors.textSecondary }]}>{g.requestor}</ThemedText>
            <ThemedText style={[s.queueMetaText, { color: colors.textTertiary }]}>
              By {formatDate(g.requiredBy)}
            </ThemedText>
          </View>
          <View style={s.approverRow}>
            <ThemedText style={[s.approverLabel, { color: colors.textTertiary }]}>Approvers:</ThemedText>
            <ThemedText style={[s.approverNames, { color: colors.textSecondary }]} numberOfLines={1}>
              {g.approvers.join(', ')}
            </ThemedText>
          </View>
          {linkedName && (
            <ThemedText style={[s.queueLinked, { color: colors.textTertiary }]} numberOfLines={1}>
              {linkedName}
            </ThemedText>
          )}
        </Pressable>
      );
    },
    [colors, accentColor, onTask, onGate, getLinkedName, getGateLinkedName],
  );

  return (
    <FlatList
      data={merged}
      keyExtractor={(item) => (item.type === 'task' ? (item.data as OpsTask).id : (item.data as DecisionGate).id)}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState icon="tray.fill" label="Queue is empty" colors={colors} />}
    />
  );
}

// =============================================================================
// SCORECARDS SUB-TAB
// =============================================================================

function ScorecardsTab({
  colors,
  accentColor,
  scorecards,
  simplified,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  scorecards: DomainScorecard[];
  simplified: boolean;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Domain Scorecards</ThemedText>
      {scorecards.map((sc) => {
        const domainColor = OPS_DOMAIN_COLORS[sc.domain];
        const domainLabel = OPS_DOMAIN_LABELS[sc.domain];
        const domainIcon = OPS_DOMAIN_ICONS[sc.domain];
        const healthColor = HEALTH_DOT_COLORS[sc.health];

        if (simplified) {
          // E4: simplified scorecard — domain + health + summary line
          const summary = sc.kpis.length > 0
            ? `${sc.kpis.filter((k) => {
                const pct = k.target !== 0 ? (k.current / k.target) * 100 : 100;
                return pct >= 80;
              }).length} of ${sc.kpis.length} KPIs on target`
            : 'No KPIs';
          return (
            <View key={sc.domain} style={[s.scorecardSimple, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.scorecardSimpleLeft}>
                <IconSymbol name={domainIcon as any} size={18} color={domainColor} />
                <ThemedText style={[s.scorecardSimpleName, { color: colors.text }]}>{domainLabel}</ThemedText>
              </View>
              <View style={s.scorecardSimpleRight}>
                <ThemedText style={[s.scorecardSimpleSummary, { color: colors.textSecondary }]}>{summary}</ThemedText>
                <View style={[s.healthDot, { backgroundColor: healthColor }]} />
              </View>
            </View>
          );
        }

        // Full scorecard
        return (
          <View key={sc.domain} style={[s.scorecardCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.scorecardHeader}>
              <IconSymbol name={domainIcon as any} size={18} color={domainColor} />
              <ThemedText style={[s.scorecardName, { color: colors.text }]}>{domainLabel}</ThemedText>
              <View style={[s.healthDot, { backgroundColor: healthColor }]} />
            </View>
            {sc.kpis.map((kpi, i) => {
              const pct = kpi.target !== 0 ? Math.round((kpi.current / Math.abs(kpi.target)) * 100) : 100;
              const clampedPct = Math.min(Math.max(pct, 0), 100);
              const trendIcon = kpi.trend === 'up' ? 'arrow.up' : kpi.trend === 'down' ? 'arrow.down' : 'arrow.right';
              const trendColor = kpi.trend === 'up' ? '#22C55E' : kpi.trend === 'down' ? '#EF4444' : '#A1A1AA';
              return (
                <View key={`${sc.domain}-kpi-${i}`} style={s.scorecardKpiRow}>
                  <View style={s.scorecardKpiHeader}>
                    <ThemedText style={[s.scorecardKpiLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
                    <View style={s.scorecardKpiRight}>
                      <ThemedText style={[s.scorecardKpiValues, { color: colors.text }]}>
                        {kpi.current}{kpi.unit} / {kpi.target}{kpi.unit}
                      </ThemedText>
                      <IconSymbol name={trendIcon as any} size={10} color={trendColor} />
                    </View>
                  </View>
                  <ProgressBar percent={clampedPct} color={accentColor} />
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// INITIATIVE DETAIL SHEET
// =============================================================================

function InitiativeDetailSheet({
  visible,
  onClose,
  initiative,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  initiative: OpsInitiative | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!initiative) return null;

  const statusColor = INITIATIVE_STATUS_COLORS[initiative.status];
  const statusLabel = INITIATIVE_STATUS_LABELS[initiative.status];
  const domainColor = OPS_DOMAIN_COLORS[initiative.domain];
  const domainLabel = OPS_DOMAIN_LABELS[initiative.domain];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={initiative.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={domainLabel.toUpperCase()} color={domainColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        {initiative.complianceLinked && <StatusBadge label="COMPLIANCE" color={ACCENT} />}
      </View>

      {/* Overview */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Overview</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{initiative.description}</ThemedText>
        {initiative.institution && (
          <View style={s.sheetDetailRow}>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Institution</ThemedText>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{initiative.institution}</ThemedText>
          </View>
        )}
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Owner</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{initiative.owner}</ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Dates</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
            {formatDate(initiative.startDate)} - {formatDate(initiative.targetDate)}
          </ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Budget</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
            {formatBudget(initiative.budgetAllocated)} allocated / {formatBudget(initiative.budgetSpent)} spent
          </ThemedText>
        </View>
      </View>

      {/* KPIs */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>KPIs</ThemedText>
        {initiative.kpis.map((kpi, i) => {
          const pct = kpi.target > 0 ? Math.round((kpi.current / kpi.target) * 100) : 0;
          return (
            <View key={`sheet-kpi-${i}`} style={s.kpiProgressRow}>
              <View style={s.kpiProgressHeader}>
                <ThemedText style={[s.kpiProgressLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
                <ThemedText style={[s.kpiProgressValue, { color: colors.text }]}>
                  {kpi.current}{kpi.unit} / {kpi.target}{kpi.unit}
                </ThemedText>
              </View>
              <ProgressBar percent={pct} color={accentColor} />
            </View>
          );
        })}
      </View>

      {/* Blockers */}
      {initiative.blockers.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Blockers</ThemedText>
          {initiative.blockers.map((b, i) => (
            <View key={`sheet-blocker-${i}`} style={s.sheetListRow}>
              <IconSymbol name="xmark.octagon.fill" size={14} color="#EF4444" />
              <ThemedText style={[s.sheetListText, { color: colors.textSecondary }]}>{b}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Next Action */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Next Action</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="arrow.right.circle.fill" size={14} color={accentColor} />
          <ThemedText style={[s.sheetListText, { color: colors.textSecondary }]}>{initiative.nextAction}</ThemedText>
        </View>
      </View>

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
// WORKFLOW DETAIL SHEET
// =============================================================================

function WorkflowDetailSheet({
  visible,
  onClose,
  workflow,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  workflow: OpsWorkflow | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!workflow) return null;

  const statusColor = WORKFLOW_STATUS_COLORS[workflow.status];
  const statusLabel = WORKFLOW_STATUS_LABELS[workflow.status];
  const domainColor = OPS_DOMAIN_COLORS[workflow.domain];
  const domainLabel = OPS_DOMAIN_LABELS[workflow.domain];
  const stepPct = workflow.totalSteps > 0 ? Math.round((workflow.completedSteps / workflow.totalSteps) * 100) : 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={workflow.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={domainLabel.toUpperCase()} color={domainColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Overview */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Overview</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{workflow.description}</ThemedText>
        {workflow.institution && (
          <View style={s.sheetDetailRow}>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Institution</ThemedText>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{workflow.institution}</ThemedText>
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Progress</ThemedText>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Steps</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
            {workflow.completedSteps} / {workflow.totalSteps}
          </ThemedText>
        </View>
        <ProgressBar percent={stepPct} color={accentColor} />
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Avg Completion</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: workflow.avgCompletionDays > workflow.slaTarget ? '#EF4444' : colors.text }]}>
            {workflow.avgCompletionDays} days (SLA: {workflow.slaTarget}d)
          </ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>SLA Breaches</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: workflow.slaBreaches > 0 ? '#EF4444' : '#22C55E' }]}>
            {workflow.slaBreaches}
          </ThemedText>
        </View>
      </View>

      {/* Bottleneck */}
      {workflow.bottleneckStep && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Bottleneck</ThemedText>
          <View style={s.sheetListRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#EF4444" />
            <ThemedText style={[s.sheetListText, { color: '#EF4444' }]}>{workflow.bottleneckStep}</ThemedText>
          </View>
        </View>
      )}

      {/* Current Runs */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Current Runs</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {workflow.currentRuns} active run{workflow.currentRuns !== 1 ? 's' : ''}
        </ThemedText>
      </View>

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
// TASK DETAIL SHEET
// =============================================================================

function TaskDetailSheet({
  visible,
  onClose,
  task,
  initiatives,
  workflows,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  task: OpsTask | null;
  initiatives: OpsInitiative[];
  workflows: OpsWorkflow[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!task) return null;

  const statusColor = TASK_STATUS_COLORS[task.status];
  const statusLabel = TASK_STATUS_LABELS[task.status];
  const priorityColor = TASK_PRIORITY_COLORS[task.priority];
  const priorityLabel = TASK_PRIORITY_LABELS[task.priority];
  const domainColor = OPS_DOMAIN_COLORS[task.domain];
  const domainLabel = OPS_DOMAIN_LABELS[task.domain];

  const linkedInit = task.linkedInitiative ? initiatives.find((i) => i.id === task.linkedInitiative) : undefined;
  const linkedWf = task.linkedWorkflow ? workflows.find((w) => w.id === task.linkedWorkflow) : undefined;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={task.title} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={domainLabel.toUpperCase()} color={domainColor} />
        <StatusBadge label={priorityLabel.toUpperCase()} color={priorityColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{task.description}</ThemedText>
        {task.institution && (
          <View style={s.sheetDetailRow}>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Institution</ThemedText>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{task.institution}</ThemedText>
          </View>
        )}
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Assignee</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{task.assignee}</ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Due Date</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: task.status === 'overdue' ? '#EF4444' : colors.text }]}>
            {formatDate(task.dueDate)}
          </ThemedText>
        </View>
      </View>

      {(linkedInit || linkedWf) && (
        <View style={s.sheetSection}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Linked To</ThemedText>
          {linkedInit && (
            <View style={s.sheetListRow}>
              <IconSymbol name="chart.bar.doc.horizontal.fill" size={14} color={accentColor} />
              <ThemedText style={[s.sheetListText, { color: colors.textSecondary }]}>{linkedInit.name}</ThemedText>
            </View>
          )}
          {linkedWf && (
            <View style={s.sheetListRow}>
              <IconSymbol name="arrow.triangle.branch" size={14} color={accentColor} />
              <ThemedText style={[s.sheetListText, { color: colors.textSecondary }]}>{linkedWf.name}</ThemedText>
            </View>
          )}
        </View>
      )}

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
// DECISION GATE DETAIL SHEET
// =============================================================================

function GateDetailSheet({
  visible,
  onClose,
  gate,
  initiatives,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  gate: DecisionGate | null;
  initiatives: OpsInitiative[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!gate) return null;

  const gateStatusColor = GATE_STATUS_COLORS[gate.status];
  const gateStatusLabel = GATE_STATUS_LABELS[gate.status];
  const domainColor = OPS_DOMAIN_COLORS[gate.domain];
  const domainLabel = OPS_DOMAIN_LABELS[gate.domain];
  const linkedInit = gate.linkedInitiative ? initiatives.find((i) => i.id === gate.linkedInitiative) : undefined;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={gate.title} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={domainLabel.toUpperCase()} color={domainColor} />
        <StatusBadge label={gateStatusLabel.toUpperCase()} color={gateStatusColor} />
      </View>

      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Overview</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{gate.description}</ThemedText>
        {gate.institution && (
          <View style={s.sheetDetailRow}>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Institution</ThemedText>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{gate.institution}</ThemedText>
          </View>
        )}
      </View>

      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Required By</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(gate.requiredBy)}</ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary }]}>Requestor</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{gate.requestor}</ThemedText>
        </View>
        <View style={{ marginTop: Spacing.sm }}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textTertiary, marginBottom: Spacing.xs }]}>Approvers</ThemedText>
          {gate.approvers.map((a, i) => (
            <View key={`approver-${i}`} style={s.sheetListRow}>
              <IconSymbol name="person.fill" size={14} color={accentColor} />
              <ThemedText style={[s.sheetListText, { color: colors.textSecondary }]}>{a}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {linkedInit && (
        <View style={s.sheetSection}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Linked Initiative</ThemedText>
          <View style={s.sheetListRow}>
            <IconSymbol name="chart.bar.doc.horizontal.fill" size={14} color={accentColor} />
            <ThemedText style={[s.sheetListText, { color: colors.textSecondary }]}>{linkedInit.name}</ThemedText>
          </View>
        </View>
      )}

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

export function EduOrgOperationsV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: E5 locked ===
  if (role === 'E5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Operations</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Operations data is not available for public access
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [selectedInitiative, setSelectedInitiative] = useState<OpsInitiative | null>(null);
  const [initiativeSheetVisible, setInitiativeSheetVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<OpsWorkflow | null>(null);
  const [workflowSheetVisible, setWorkflowSheetVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OpsTask | null>(null);
  const [taskSheetVisible, setTaskSheetVisible] = useState(false);
  const [selectedGate, setSelectedGate] = useState<DecisionGate | null>(null);
  const [gateSheetVisible, setGateSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduOpsV2Data(), []);

  // === Callbacks ===
  const handleSelectInitiative = useCallback((item: OpsInitiative) => {
    setSelectedInitiative(item);
    setInitiativeSheetVisible(true);
  }, []);

  const handleCloseInitiativeSheet = useCallback(() => {
    setInitiativeSheetVisible(false);
  }, []);

  const handleSelectWorkflow = useCallback((item: OpsWorkflow) => {
    setSelectedWorkflow(item);
    setWorkflowSheetVisible(true);
  }, []);

  const handleCloseWorkflowSheet = useCallback(() => {
    setWorkflowSheetVisible(false);
  }, []);

  const handleSelectTask = useCallback((item: OpsTask) => {
    setSelectedTask(item);
    setTaskSheetVisible(true);
  }, []);

  const handleCloseTaskSheet = useCallback(() => {
    setTaskSheetVisible(false);
  }, []);

  const handleSelectGate = useCallback((item: DecisionGate) => {
    setSelectedGate(item);
    setGateSheetVisible(true);
  }, []);

  const handleCloseGateSheet = useCallback(() => {
    setGateSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  // E1/E2: all 5 tabs
  // E3: Dashboard + Queue + Scorecards
  // E4: Scorecards only (simplified)
  const visibleSubTabs = useMemo(() => {
    if (isDeanLevel(role)) return SUB_TABS;
    if (isFacultyLevel(role)) {
      return SUB_TABS.filter((t) => t.id === 'dashboard' || t.id === 'queue' || t.id === 'scorecards');
    }
    // E4: scorecards only
    return SUB_TABS.filter((t) => t.id === 'scorecards');
  }, [role]);

  // Ensure active sub-tab is valid for current role
  const effectiveSubTab = useMemo(() => {
    if (visibleSubTabs.find((t) => t.id === activeSubTab)) return activeSubTab;
    return visibleSubTabs[0]?.id ?? 'dashboard';
  }, [activeSubTab, visibleSubTabs]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (effectiveSubTab) {
      case 'dashboard':
        return <DashboardTab colors={colors} accentColor={accentColor} data={data} />;
      case 'initiatives':
        if (!isDeanLevel(role)) return null;
        return <InitiativesTab colors={colors} accentColor={accentColor} initiatives={data.initiatives} onSelect={handleSelectInitiative} />;
      case 'workflows':
        if (!isDeanLevel(role)) return null;
        return <WorkflowsTab colors={colors} accentColor={accentColor} workflows={data.workflows} onSelect={handleSelectWorkflow} />;
      case 'queue':
        return (
          <QueueTab
            colors={colors}
            accentColor={accentColor}
            tasks={data.tasks}
            gates={data.gates}
            initiatives={data.initiatives}
            workflows={data.workflows}
            onSelectTask={handleSelectTask}
            onSelectGate={handleSelectGate}
          />
        );
      case 'scorecards':
        return (
          <ScorecardsTab
            colors={colors}
            accentColor={accentColor}
            scorecards={data.scorecards}
            simplified={role === 'E4'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={effectiveSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />
      <View style={s.contentContainer}>
        {renderContent()}
      </View>
      <InitiativeDetailSheet
        visible={initiativeSheetVisible}
        onClose={handleCloseInitiativeSheet}
        initiative={selectedInitiative}
        colors={colors}
        accentColor={accentColor}
      />
      <WorkflowDetailSheet
        visible={workflowSheetVisible}
        onClose={handleCloseWorkflowSheet}
        workflow={selectedWorkflow}
        colors={colors}
        accentColor={accentColor}
      />
      <TaskDetailSheet
        visible={taskSheetVisible}
        onClose={handleCloseTaskSheet}
        task={selectedTask}
        initiatives={data.initiatives}
        workflows={data.workflows}
        colors={colors}
        accentColor={accentColor}
      />
      <GateDetailSheet
        visible={gateSheetVisible}
        onClose={handleCloseGateSheet}
        gate={selectedGate}
        initiatives={data.initiatives}
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
  container: { flex: 1 },
  contentContainer: { flex: 1 },

  // Locked
  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  lockedTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  lockedMessage: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm },

  // Sub-tab bar
  subTabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.md },
  subTab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs },
  subTabText: { fontSize: 13, fontWeight: '600' },

  // Scroll containers
  tabScroll: { padding: Spacing.md, paddingBottom: 120 },
  tabListContent: { padding: Spacing.md, paddingBottom: 120 },

  // Section titles
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.xs },

  // Empty state
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },

  // Progress bar
  progressTrack: { height: 4, backgroundColor: '#2F3336', borderRadius: 2, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: 4, borderRadius: 2 },

  // KPI
  kpiRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  kpiCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1 },
  kpiValue: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  kpiLabel: { fontSize: 11, marginTop: 2 },

  // Section card
  sectionCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md },
  sectionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionCardTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  sectionCardBody: { fontSize: 12, lineHeight: 17 },
  percentLabel: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },

  // Domain health grid
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  domainTile: { width: '31%', borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.sm, alignItems: 'center' },
  domainTileTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  domainTileLabel: { fontSize: 11, fontWeight: '600' },
  healthDot: { width: 10, height: 10, borderRadius: 5 },

  // Card (shared by initiatives, workflows)
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  cardMeta: { fontSize: 11, marginBottom: Spacing.sm },
  cardDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardDetailLabel: { fontSize: 11 },
  cardDetailValue: { fontSize: 12, fontWeight: '500', fontVariant: ['tabular-nums'] },

  // KPI progress (inline)
  kpiProgressRow: { marginTop: Spacing.xs },
  kpiProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  kpiProgressLabel: { fontSize: 11 },
  kpiProgressValue: { fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },

  // Blockers
  blockersSection: { paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm },
  blockerTitle: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  blockerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 3 },
  blockerText: { flex: 1, fontSize: 12 },

  // Next action
  nextActionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm },
  nextActionText: { flex: 1, fontSize: 12 },

  // Bottleneck
  bottleneckRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm },
  bottleneckText: { flex: 1, fontSize: 12, fontWeight: '600' },

  // Domain group header
  domainGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm, marginTop: Spacing.md },
  domainGroupLabel: { fontSize: 15, fontWeight: '700' },

  // Queue card
  queueCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  queueCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  queueCardTitle: { flex: 1, fontSize: 13, fontWeight: '600' },
  queueMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  queueMetaText: { fontSize: 11 },
  queueLinked: { fontSize: 11, marginTop: 2 },
  approverRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 2 },
  approverLabel: { fontSize: 10 },
  approverNames: { flex: 1, fontSize: 11 },

  // Scorecard — full
  scorecardCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  scorecardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  scorecardName: { fontSize: 15, fontWeight: '700', flex: 1 },
  scorecardKpiRow: { marginBottom: Spacing.xs },
  scorecardKpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  scorecardKpiLabel: { fontSize: 11 },
  scorecardKpiRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  scorecardKpiValues: { fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },

  // Scorecard — simplified (E4)
  scorecardSimple: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  scorecardSimpleLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scorecardSimpleName: { fontSize: 14, fontWeight: '600' },
  scorecardSimpleRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scorecardSimpleSummary: { fontSize: 11 },

  // Bottom Sheet
  sheetBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  sheetSection: { paddingBottom: Spacing.md, marginBottom: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetSectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  sheetBodyText: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.sm },
  sheetDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  sheetDetailLabel: { fontSize: 11 },
  sheetDetailValue: { fontSize: 12, fontWeight: '500' },
  sheetListRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  sheetListText: { flex: 1, fontSize: 13, lineHeight: 19 },
  sheetActions: { gap: Spacing.sm, marginTop: Spacing.sm },
  sheetGhostButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: 1 },
  sheetGhostButtonText: { fontSize: 14, fontWeight: '600' },
});
