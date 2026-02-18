/**
 * Business Organization Operations Tab — v2 CEO Command Center
 * Sub-tabs: Triage | Initiatives | Projects | Tasks | Blockers | Decisions
 *
 * Command Header: 3x2 summary tile grid (always visible above sub-tabs)
 * Triage: 4-lane CEO view — Critical Blockers, Decisions Needed, Due Soon, Recently Changed
 * Initiatives: FlatList with progress bars, entity badges, linked project counts
 * Projects: FlatList with initiative link, task completion bars, timelines
 * Tasks: FlatList with priority filter, assignee, due date, project link
 * Blockers: FlatList with severity badges, linked initiative, resolution status
 * Decisions: FlatList with voter list, receipt badge, entity name
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import {
  BizCard,
  BizSubTabBar,
  BizStatusChip,
  BizAlertCard,
  BizEmptyLock,
  statusVariant,
  statusColor,
} from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel } from '@/utils/business-rbac';
import type { BizReceipt, CrossTabLink } from '@/data/biz-org-shared-types';
import { KANEXT_HOLDCO, KANEXT_OPSCO, SEEDED_ENTITY_NAMES } from '@/data/biz-org-shared-types';
import {
  OPS_SUB_TABS,
  INITIATIVE_STATUS_COLOR,
  PROJECT_STATUS_COLOR,
  TASK_PRIORITY_COLOR,
  TASK_STATUS_COLOR,
  BLOCKER_SEVERITY_COLOR,
  BLOCKER_STATUS_COLOR,
  DECISION_STATUS_COLOR,
  getBizOpsData,
} from '@/data/mock-biz-org-operations';
import type {
  OpsSubTabId,
  OpsSummaryTile,
  OpsInitiative,
  OpsProject,
  OpsTask,
  OpsBlocker,
  OpsDecision,
  TriageItem,
  BizOpsV2Data,
} from '@/data/mock-biz-org-operations';

const BP = BusinessPalette;

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: BusinessRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function progressColor(progress: number): string {
  if (progress >= 75) return '#22C55E';
  if (progress >= 40) return '#3B82F6';
  if (progress >= 15) return '#F59E0B';
  return '#6B7280';
}

function priorityLabel(priority: OpsTask['priority']): string {
  switch (priority) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'medium': return 'MEDIUM';
    case 'low': return 'LOW';
  }
}

function taskStatusLabel(status: OpsTask['status']): string {
  switch (status) {
    case 'todo': return 'TODO';
    case 'in_progress': return 'IN PROGRESS';
    case 'review': return 'REVIEW';
    case 'done': return 'DONE';
  }
}

function blockerSeverityLabel(severity: OpsBlocker['severity']): string {
  switch (severity) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'medium': return 'MEDIUM';
  }
}

function blockerStatusLabel(status: OpsBlocker['status']): string {
  switch (status) {
    case 'open': return 'OPEN';
    case 'investigating': return 'INVESTIGATING';
    case 'resolved': return 'RESOLVED';
  }
}

function decisionStatusLabel(status: OpsDecision['status']): string {
  switch (status) {
    case 'draft': return 'DRAFT';
    case 'open': return 'OPEN';
    case 'approved': return 'APPROVED';
    case 'rejected': return 'REJECTED';
  }
}

function initiativeStatusLabel(status: OpsInitiative['status']): string {
  switch (status) {
    case 'active': return 'ACTIVE';
    case 'paused': return 'PAUSED';
    case 'completed': return 'COMPLETED';
  }
}

function projectStatusLabel(status: OpsProject['status']): string {
  switch (status) {
    case 'active': return 'ACTIVE';
    case 'at_risk': return 'AT RISK';
    case 'blocked': return 'BLOCKED';
    case 'completed': return 'COMPLETED';
  }
}

function initiativeStatusVariant(status: OpsInitiative['status']): 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'active': return 'success';
    case 'paused': return 'warning';
    case 'completed': return 'neutral';
  }
}

function projectStatusVariant(status: OpsProject['status']): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'active': return 'success';
    case 'at_risk': return 'warning';
    case 'blocked': return 'error';
    case 'completed': return 'neutral';
  }
}

function taskPriorityVariant(priority: OpsTask['priority']): 'error' | 'warning' | 'info' | 'neutral' {
  switch (priority) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'neutral';
  }
}

function taskStatusVariant(status: OpsTask['status']): 'neutral' | 'info' | 'warning' | 'success' {
  switch (status) {
    case 'todo': return 'neutral';
    case 'in_progress': return 'info';
    case 'review': return 'warning';
    case 'done': return 'success';
  }
}

function blockerSeverityVariant(severity: OpsBlocker['severity']): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
  }
}

function blockerStatusVariant(status: OpsBlocker['status']): 'error' | 'warning' | 'success' {
  switch (status) {
    case 'open': return 'error';
    case 'investigating': return 'warning';
    case 'resolved': return 'success';
  }
}

function decisionStatusVariant(status: OpsDecision['status']): 'neutral' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'draft': return 'neutral';
    case 'open': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'error';
  }
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

function ProgressBar({
  progress,
  color,
  trackColor,
  showLabel,
}: {
  progress: number;
  color: string;
  trackColor?: string;
  showLabel?: boolean;
}) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  return (
    <View style={s.progressBarContainer}>
      <View style={[s.progressBarTrack, { backgroundColor: trackColor ?? BP.graphite }]}>
        <View style={[s.progressBarFill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>
      {showLabel !== false && (
        <ThemedText style={[s.progressBarLabel, { color }]}>{clamped}%</ThemedText>
      )}
    </View>
  );
}

// =============================================================================
// ENTITY BADGE
// =============================================================================

function EntityBadge({ name }: { name: string }) {
  return (
    <View style={s.entityBadge}>
      <IconSymbol name="building.2.fill" size={10} color={BP.ash} />
      <ThemedText style={s.entityBadgeText} numberOfLines={1}>{name}</ThemedText>
    </View>
  );
}

// =============================================================================
// COMMAND HEADER — 3x2 Summary Tile Grid
// =============================================================================

function CommandHeader({
  tiles,
  colors,
  accentColor,
}: {
  tiles: OpsSummaryTile[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  return (
    <View style={s.commandHeader}>
      <View style={s.tileGrid}>
        {tiles.map((tile) => (
          <View
            key={tile.id}
            style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.tileIconRow}>
              <View style={[s.tileIconCircle, { backgroundColor: tile.color + '18' }]}>
                <IconSymbol name={tile.icon as any} size={16} color={tile.color} />
              </View>
            </View>
            <ThemedText style={[s.tileValue, { color: colors.text }]}>{tile.value}</ThemedText>
            <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]} numberOfLines={1}>
              {tile.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// TRIAGE TAB — CEO View
// =============================================================================

function TriageLaneHeader({
  title,
  count,
  icon,
  color,
  colors,
}: {
  title: string;
  count: number;
  icon: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.triageLaneHeader}>
      <View style={[s.triageLaneIconCircle, { backgroundColor: color + '18' }]}>
        <IconSymbol name={icon as any} size={14} color={color} />
      </View>
      <ThemedText style={[s.triageLaneTitle, { color: colors.text }]}>{title}</ThemedText>
      <View style={[s.triageLaneCount, { backgroundColor: color + '20' }]}>
        <ThemedText style={[s.triageLaneCountText, { color }]}>{count}</ThemedText>
      </View>
    </View>
  );
}

function TriageCard({
  item,
  colors,
  onPress,
}: {
  item: TriageItem;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[s.triageCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: item.urgencyColor }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={s.triageCardTop}>
        <ThemedText style={[s.triageCardTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </ThemedText>
      </View>
      <ThemedText style={[s.triageCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
        {item.subtitle}
      </ThemedText>
      <View style={s.triageCardMeta}>
        <EntityBadge name={item.entityName} />
        {item.initiativeName.length > 0 && (
          <View style={s.triageInitiativeBadge}>
            <IconSymbol name="flag.fill" size={10} color={BP.platinum} />
            <ThemedText style={s.triageInitiativeText} numberOfLines={1}>
              {item.initiativeName}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function TriageTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: BizOpsV2Data;
}) {
  const { criticalBlockers, decisionsNeeded, dueSoon, recentlyChanged } = data.triage;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Lane 1: Critical Blockers */}
      <TriageLaneHeader
        title="Critical Blockers"
        count={criticalBlockers.length}
        icon="exclamationmark.octagon.fill"
        color="#EF4444"
        colors={colors}
      />
      {criticalBlockers.length === 0 ? (
        <View style={s.triageEmptyLane}>
          <ThemedText style={[s.triageEmptyText, { color: colors.textTertiary }]}>
            No critical blockers
          </ThemedText>
        </View>
      ) : (
        criticalBlockers.map((item) => (
          <TriageCard key={item.id} item={item} colors={colors} onPress={() => {}} />
        ))
      )}

      {/* Lane 2: Decisions Needed */}
      <TriageLaneHeader
        title="Decisions Needed"
        count={decisionsNeeded.length}
        icon="hand.raised.fill"
        color="#F59E0B"
        colors={colors}
      />
      {decisionsNeeded.length === 0 ? (
        <View style={s.triageEmptyLane}>
          <ThemedText style={[s.triageEmptyText, { color: colors.textTertiary }]}>
            No pending decisions
          </ThemedText>
        </View>
      ) : (
        decisionsNeeded.map((item) => (
          <TriageCard key={item.id} item={item} colors={colors} onPress={() => {}} />
        ))
      )}

      {/* Lane 3: Due Soon */}
      <TriageLaneHeader
        title="Due Soon"
        count={dueSoon.length}
        icon="clock.fill"
        color="#F97316"
        colors={colors}
      />
      {dueSoon.length === 0 ? (
        <View style={s.triageEmptyLane}>
          <ThemedText style={[s.triageEmptyText, { color: colors.textTertiary }]}>
            Nothing due soon
          </ThemedText>
        </View>
      ) : (
        dueSoon.map((item) => (
          <TriageCard key={item.id} item={item} colors={colors} onPress={() => {}} />
        ))
      )}

      {/* Lane 4: Recently Changed */}
      <TriageLaneHeader
        title="Recently Changed"
        count={recentlyChanged.length}
        icon="arrow.triangle.2.circlepath"
        color="#8B5CF6"
        colors={colors}
      />
      {recentlyChanged.length === 0 ? (
        <View style={s.triageEmptyLane}>
          <ThemedText style={[s.triageEmptyText, { color: colors.textTertiary }]}>
            No recent changes
          </ThemedText>
        </View>
      ) : (
        recentlyChanged.map((item) => (
          <TriageCard key={item.id} item={item} colors={colors} onPress={() => {}} />
        ))
      )}
    </ScrollView>
  );
}

// =============================================================================
// INITIATIVES TAB
// =============================================================================

function InitiativesTab({
  colors,
  accentColor,
  data,
  onSelectInitiative,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OpsInitiative[];
  onSelectInitiative: (initiative: OpsInitiative) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: OpsInitiative }) => {
      const stColor = INITIATIVE_STATUS_COLOR[item.status];
      const pColor = progressColor(item.progress);
      return (
        <Pressable
          style={[s.initiativeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectInitiative(item);
          }}
        >
          {/* Top row: name + status */}
          <View style={s.initiativeCardTop}>
            <ThemedText style={[s.initiativeCardName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </ThemedText>
            <BizStatusChip label={initiativeStatusLabel(item.status)} variant={initiativeStatusVariant(item.status)} />
          </View>

          {/* Description */}
          <ThemedText style={[s.initiativeCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>

          {/* Progress bar */}
          <ProgressBar progress={item.progress} color={pColor} />

          {/* Meta row */}
          <View style={s.initiativeMetaRow}>
            <View style={s.initiativeMetaItem}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.initiativeMetaText, { color: colors.textSecondary }]}>
                {item.owner}
              </ThemedText>
            </View>
            <View style={s.initiativeMetaItem}>
              <IconSymbol name="folder.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.initiativeMetaText, { color: colors.textSecondary }]}>
                {item.projectCount} project{item.projectCount !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>

          {/* Bottom row: entity + timeline */}
          <View style={[s.initiativeBottomRow, { borderTopColor: colors.border }]}>
            <EntityBadge name={item.entityName} />
            <ThemedText style={[s.initiativeTimeline, { color: colors.textTertiary }]}>
              {item.startDate} \u2013 {item.targetDate}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectInitiative],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="flag.fill" label="No initiatives found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PROJECTS TAB
// =============================================================================

function ProjectsTab({
  colors,
  accentColor,
  data,
  onSelectProject,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OpsProject[];
  onSelectProject: (project: OpsProject) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: OpsProject }) => {
      const stColor = PROJECT_STATUS_COLOR[item.status];
      const pColor = progressColor(item.taskCompletion);
      return (
        <Pressable
          style={[s.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectProject(item);
          }}
        >
          {/* Top row: name + status */}
          <View style={s.projectCardTop}>
            <ThemedText style={[s.projectCardName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </ThemedText>
            <BizStatusChip label={projectStatusLabel(item.status)} variant={projectStatusVariant(item.status)} />
          </View>

          {/* Initiative link */}
          <View style={s.projectInitiativeRow}>
            <IconSymbol name="flag.fill" size={11} color={BP.platinum} />
            <ThemedText style={[s.projectInitiativeText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.initiativeName}
            </ThemedText>
          </View>

          {/* Task completion bar */}
          <View style={s.projectCompletionSection}>
            <ThemedText style={[s.projectCompletionLabel, { color: colors.textTertiary }]}>
              Task Completion
            </ThemedText>
            <ProgressBar progress={item.taskCompletion} color={pColor} />
          </View>

          {/* Owner + timeline */}
          <View style={s.projectMetaRow}>
            <View style={s.projectMetaItem}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.projectMetaText, { color: colors.textSecondary }]}>
                {item.owner}
              </ThemedText>
            </View>
            <ThemedText style={[s.projectTimelineText, { color: colors.textTertiary }]}>
              {item.startDate} \u2192 {item.dueDate}
            </ThemedText>
          </View>

          {/* Entity */}
          <View style={[s.projectEntityRow, { borderTopColor: colors.border }]}>
            <EntityBadge name={item.entityName} />
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectProject],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="folder.fill" label="No projects found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// TASKS TAB — with Priority Filter
// =============================================================================

const TASK_PRIORITY_FILTERS: Array<{ id: OpsTask['priority'] | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

function TasksTab({
  colors,
  accentColor,
  data,
  onSelectTask,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OpsTask[];
  onSelectTask: (task: OpsTask) => void;
}) {
  const [activePriority, setActivePriority] = useState<OpsTask['priority'] | 'all'>('all');

  const filteredTasks = useMemo(() => {
    if (activePriority === 'all') return data;
    return data.filter((t) => t.priority === activePriority);
  }, [data, activePriority]);

  const renderItem = useCallback(
    ({ item }: { item: OpsTask }) => {
      const priColor = TASK_PRIORITY_COLOR[item.priority];
      const stColor = TASK_STATUS_COLOR[item.status];
      return (
        <Pressable
          style={[s.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectTask(item);
          }}
        >
          {/* Priority stripe */}
          <View style={[s.taskStripe, { backgroundColor: priColor }]} />
          <View style={s.taskCardContent}>
            {/* Title */}
            <ThemedText style={[s.taskCardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>

            {/* Assignee + Due Date */}
            <View style={s.taskAssigneeRow}>
              <View style={s.taskAssigneeItem}>
                <View style={[s.taskAvatarCircle, { backgroundColor: accentColor + '20' }]}>
                  <ThemedText style={[s.taskAvatarText, { color: accentColor }]}>
                    {item.assignee.charAt(0)}
                  </ThemedText>
                </View>
                <ThemedText style={[s.taskAssigneeText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.assignee}
                </ThemedText>
              </View>
              <View style={s.taskDueDateItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.taskDueDateText, { color: colors.textTertiary }]}>
                  {item.dueDate}
                </ThemedText>
              </View>
            </View>

            {/* Chips: priority + status + project link */}
            <View style={s.taskChipRow}>
              <BizStatusChip label={priorityLabel(item.priority)} variant={taskPriorityVariant(item.priority)} />
              <BizStatusChip label={taskStatusLabel(item.status)} variant={taskStatusVariant(item.status)} />
            </View>

            {/* Project link */}
            <View style={s.taskProjectRow}>
              <IconSymbol name="folder.fill" size={10} color={BP.ash} />
              <ThemedText style={s.taskProjectText} numberOfLines={1}>
                {item.projectName}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectTask],
  );

  return (
    <View style={s.tasksContainer}>
      {/* Priority filter row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.taskFilterRow}
      >
        {TASK_PRIORITY_FILTERS.map((filter) => {
          const isActive = filter.id === activePriority;
          const filterColor = filter.id === 'all' ? accentColor : (TASK_PRIORITY_COLOR as any)[filter.id] ?? accentColor;
          return (
            <Pressable
              key={filter.id}
              style={[
                s.taskFilterPill,
                {
                  backgroundColor: isActive ? filterColor + '20' : BP.glass,
                  borderColor: isActive ? filterColor + '40' : BP.graphite,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActivePriority(filter.id);
              }}
            >
              {filter.id !== 'all' && (
                <View style={[s.taskFilterDot, { backgroundColor: filterColor }]} />
              )}
              <ThemedText
                style={[
                  s.taskFilterText,
                  { color: isActive ? filterColor : BP.ash },
                ]}
              >
                {filter.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="checkmark.circle.fill" label="No tasks match the filter" colors={colors} />
        }
      />
    </View>
  );
}

// =============================================================================
// BLOCKERS TAB
// =============================================================================

function BlockersTab({
  colors,
  accentColor,
  data,
  onSelectBlocker,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OpsBlocker[];
  onSelectBlocker: (blocker: OpsBlocker) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: OpsBlocker }) => {
      const sevColor = BLOCKER_SEVERITY_COLOR[item.severity];
      const stColor = BLOCKER_STATUS_COLOR[item.status];
      return (
        <Pressable
          style={[s.blockerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectBlocker(item);
          }}
        >
          {/* Severity stripe */}
          <View style={[s.blockerStripe, { backgroundColor: sevColor }]} />
          <View style={s.blockerCardContent}>
            {/* Severity badge + title */}
            <View style={s.blockerTopRow}>
              <BizStatusChip
                label={blockerSeverityLabel(item.severity)}
                variant={blockerSeverityVariant(item.severity)}
              />
              <BizStatusChip
                label={blockerStatusLabel(item.status)}
                variant={blockerStatusVariant(item.status)}
              />
            </View>

            <ThemedText style={[s.blockerTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>

            {/* Description (2 lines) */}
            <ThemedText style={[s.blockerDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>

            {/* Linked initiative */}
            <View style={s.blockerInitiativeRow}>
              <IconSymbol name="flag.fill" size={11} color={BP.platinum} />
              <ThemedText style={[s.blockerInitiativeText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.initiativeName}
              </ThemedText>
            </View>

            {/* Owner + Date */}
            <View style={[s.blockerMetaRow, { borderTopColor: colors.border }]}>
              <View style={s.blockerMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.blockerMetaText, { color: colors.textSecondary }]}>
                  {item.owner}
                </ThemedText>
              </View>
              <EntityBadge name={item.entityName} />
              <ThemedText style={[s.blockerDateText, { color: colors.textTertiary }]}>
                {item.createdDate}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectBlocker],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="exclamationmark.octagon.fill" label="No blockers found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DECISIONS TAB
// =============================================================================

function DecisionsTab({
  colors,
  accentColor,
  data,
  receipts,
  onSelectDecision,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OpsDecision[];
  receipts: BizReceipt[];
  onSelectDecision: (decision: OpsDecision) => void;
}) {
  const receiptMap = useMemo(() => {
    const map: Record<string, BizReceipt> = {};
    for (const r of receipts) {
      map[r.id] = r;
    }
    return map;
  }, [receipts]);

  const renderItem = useCallback(
    ({ item }: { item: OpsDecision }) => {
      const stColor = DECISION_STATUS_COLOR[item.status];
      const hasReceipt = item.receiptId != null && receiptMap[item.receiptId] != null;
      return (
        <Pressable
          style={[s.decisionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectDecision(item);
          }}
        >
          {/* Top row: title + status */}
          <View style={s.decisionTopRow}>
            <ThemedText style={[s.decisionTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <BizStatusChip
              label={decisionStatusLabel(item.status)}
              variant={decisionStatusVariant(item.status)}
            />
          </View>

          {/* Description */}
          <ThemedText style={[s.decisionDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>

          {/* Proposed by + Date */}
          <View style={s.decisionProposedRow}>
            <ThemedText style={[s.decisionProposedText, { color: colors.textTertiary }]}>
              Proposed by {item.proposedBy} \u2022 {item.date}
            </ThemedText>
          </View>

          {/* Voters */}
          {item.voters.length > 0 && (
            <View style={s.decisionVotersRow}>
              <IconSymbol name="person.2.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.decisionVotersText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.voters.join(', ')}
              </ThemedText>
            </View>
          )}

          {/* Bottom row: receipt badge + entity */}
          <View style={[s.decisionBottomRow, { borderTopColor: colors.border }]}>
            <EntityBadge name={item.entityName} />
            {hasReceipt && (
              <View style={s.receiptBadge}>
                <IconSymbol name="checkmark.seal.fill" size={12} color={BP.emerald} />
                <ThemedText style={s.receiptBadgeText}>RECEIPT</ThemedText>
              </View>
            )}
            {item.linkedInitiativeId && (
              <View style={s.decisionInitiativeBadge}>
                <IconSymbol name="flag.fill" size={10} color={BP.platinum} />
                <ThemedText style={s.decisionInitiativeText} numberOfLines={1}>
                  Linked
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, receiptMap, onSelectDecision],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="hand.raised.fill" label="No decisions found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INITIATIVE DETAIL BOTTOM SHEET
// =============================================================================

function InitiativeDetailSheet({
  visible,
  onClose,
  initiative,
  projects,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  initiative: OpsInitiative | null;
  projects: OpsProject[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!initiative) return null;

  const pColor = progressColor(initiative.progress);
  const linkedProjects = projects.filter((p) => p.initiativeId === initiative.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={initiative.name} useModal>
      {/* Status */}
      <View style={s.sheetBadgeRow}>
        <BizStatusChip label={initiativeStatusLabel(initiative.status)} variant={initiativeStatusVariant(initiative.status)} />
        <EntityBadge name={initiative.entityName} />
      </View>

      {/* Description */}
      <ThemedText style={[s.sheetDescription, { color: colors.textSecondary }]}>
        {initiative.description}
      </ThemedText>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: pColor }]}>{initiative.progress}%</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Progress</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{initiative.projectCount}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Projects</ThemedText>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.sheetProgressSection}>
        <ProgressBar progress={initiative.progress} color={pColor} />
      </View>

      {/* Owner */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Owner</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {initiative.owner}
        </ThemedText>
      </View>

      {/* Timeline */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Timeline</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {initiative.startDate} \u2013 {initiative.targetDate}
        </ThemedText>
      </View>

      {/* Linked Projects */}
      {linkedProjects.length > 0 && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
            Linked Projects ({linkedProjects.length})
          </ThemedText>
          {linkedProjects.map((proj) => {
            const projStColor = PROJECT_STATUS_COLOR[proj.status];
            return (
              <View key={proj.id} style={s.sheetLinkedProject}>
                <View style={[s.sheetLinkedDot, { backgroundColor: projStColor }]} />
                <ThemedText style={[s.sheetLinkedName, { color: colors.text }]} numberOfLines={1}>
                  {proj.name}
                </ThemedText>
                <ThemedText style={[s.sheetLinkedStatus, { color: projStColor }]}>
                  {proj.taskCompletion}%
                </ThemedText>
              </View>
            );
          })}
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Initiative</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// PROJECT DETAIL BOTTOM SHEET
// =============================================================================

function ProjectDetailSheet({
  visible,
  onClose,
  project,
  tasks,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  project: OpsProject | null;
  tasks: OpsTask[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!project) return null;

  const pColor = progressColor(project.taskCompletion);
  const linkedTasks = tasks.filter((t) => t.projectId === project.id);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={project.name} useModal>
      {/* Status */}
      <View style={s.sheetBadgeRow}>
        <BizStatusChip label={projectStatusLabel(project.status)} variant={projectStatusVariant(project.status)} />
        <EntityBadge name={project.entityName} />
      </View>

      {/* Initiative link */}
      <View style={s.sheetInitiativeLink}>
        <IconSymbol name="flag.fill" size={12} color={BP.platinum} />
        <ThemedText style={[s.sheetInitiativeLinkText, { color: colors.textSecondary }]}>
          {project.initiativeName}
        </ThemedText>
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: pColor }]}>{project.taskCompletion}%</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Completion</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{linkedTasks.length}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Tasks</ThemedText>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.sheetProgressSection}>
        <ProgressBar progress={project.taskCompletion} color={pColor} />
      </View>

      {/* Owner */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Owner</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {project.owner}
        </ThemedText>
      </View>

      {/* Timeline */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Timeline</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {project.startDate} \u2192 {project.dueDate}
        </ThemedText>
      </View>

      {/* Linked Tasks */}
      {linkedTasks.length > 0 && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
            Tasks ({linkedTasks.length})
          </ThemedText>
          {linkedTasks.slice(0, 5).map((task) => {
            const priColor = TASK_PRIORITY_COLOR[task.priority];
            return (
              <View key={task.id} style={s.sheetLinkedProject}>
                <View style={[s.sheetLinkedDot, { backgroundColor: priColor }]} />
                <ThemedText style={[s.sheetLinkedName, { color: colors.text }]} numberOfLines={1}>
                  {task.title}
                </ThemedText>
                <StatusBadge label={taskStatusLabel(task.status)} color={TASK_STATUS_COLOR[task.status]} />
              </View>
            );
          })}
          {linkedTasks.length > 5 && (
            <ThemedText style={[s.sheetMoreText, { color: colors.textTertiary }]}>
              +{linkedTasks.length - 5} more tasks
            </ThemedText>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Project</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// TASK DETAIL BOTTOM SHEET
// =============================================================================

function TaskDetailSheet({
  visible,
  onClose,
  task,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  task: OpsTask | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!task) return null;

  const priColor = TASK_PRIORITY_COLOR[task.priority];
  const stColor = TASK_STATUS_COLOR[task.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={task.title} useModal>
      {/* Chips */}
      <View style={s.sheetBadgeRow}>
        <BizStatusChip label={priorityLabel(task.priority)} variant={taskPriorityVariant(task.priority)} />
        <BizStatusChip label={taskStatusLabel(task.status)} variant={taskStatusVariant(task.status)} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{task.assignee}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Assignee</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{task.dueDate}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Due Date</ThemedText>
        </View>
      </View>

      {/* Project */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Project</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {task.projectName}
        </ThemedText>
      </View>

      {/* Entity */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Entity</ThemedText>
        <EntityBadge name={task.entityName} />
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Task</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// BLOCKER DETAIL BOTTOM SHEET
// =============================================================================

function BlockerDetailSheet({
  visible,
  onClose,
  blocker,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  blocker: OpsBlocker | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!blocker) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={blocker.title} useModal>
      {/* Status chips */}
      <View style={s.sheetBadgeRow}>
        <BizStatusChip
          label={blockerSeverityLabel(blocker.severity)}
          variant={blockerSeverityVariant(blocker.severity)}
        />
        <BizStatusChip
          label={blockerStatusLabel(blocker.status)}
          variant={blockerStatusVariant(blocker.status)}
        />
      </View>

      {/* Description */}
      <ThemedText style={[s.sheetDescription, { color: colors.textSecondary }]}>
        {blocker.description}
      </ThemedText>

      {/* Initiative link */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Linked Initiative</ThemedText>
        <View style={s.sheetInitiativeLink}>
          <IconSymbol name="flag.fill" size={12} color={BP.platinum} />
          <ThemedText style={[s.sheetInitiativeLinkText, { color: colors.textSecondary }]}>
            {blocker.initiativeName}
          </ThemedText>
        </View>
      </View>

      {/* Owner */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Owner</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {blocker.owner}
        </ThemedText>
      </View>

      {/* Entity + Date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailRow}>
          <EntityBadge name={blocker.entityName} />
          <ThemedText style={[s.sheetDetailDate, { color: colors.textTertiary }]}>
            Created {blocker.createdDate}
          </ThemedText>
        </View>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Blocker Details</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// DECISION DETAIL BOTTOM SHEET
// =============================================================================

function DecisionDetailSheet({
  visible,
  onClose,
  decision,
  receipts,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  decision: OpsDecision | null;
  receipts: BizReceipt[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!decision) return null;

  const receipt = decision.receiptId
    ? receipts.find((r) => r.id === decision.receiptId)
    : undefined;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={decision.title} useModal>
      {/* Status */}
      <View style={s.sheetBadgeRow}>
        <BizStatusChip
          label={decisionStatusLabel(decision.status)}
          variant={decisionStatusVariant(decision.status)}
        />
        <EntityBadge name={decision.entityName} />
      </View>

      {/* Description */}
      <ThemedText style={[s.sheetDescription, { color: colors.textSecondary }]}>
        {decision.description}
      </ThemedText>

      {/* Proposed by */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Proposed By</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {decision.proposedBy} \u2022 {decision.date}
        </ThemedText>
      </View>

      {/* Voters */}
      {decision.voters.length > 0 && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
            Voters ({decision.voters.length})
          </ThemedText>
          {decision.voters.map((voter, idx) => (
            <View key={idx} style={s.sheetVoterRow}>
              <View style={[s.sheetVoterAvatar, { backgroundColor: accentColor + '20' }]}>
                <ThemedText style={[s.sheetVoterAvatarText, { color: accentColor }]}>
                  {voter.charAt(0)}
                </ThemedText>
              </View>
              <ThemedText style={[s.sheetVoterName, { color: colors.text }]}>{voter}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Receipt (if approved) */}
      {receipt && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Immutable Receipt</ThemedText>
          <View style={[s.sheetReceiptCard, { backgroundColor: BP.emerald + '10', borderColor: BP.emerald + '30' }]}>
            <View style={s.sheetReceiptTop}>
              <IconSymbol name="checkmark.seal.fill" size={16} color={BP.emerald} />
              <ThemedText style={[s.sheetReceiptType, { color: BP.emerald }]}>
                {receipt.type.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={[s.sheetReceiptAction, { color: colors.text }]}>
              {receipt.action}
            </ThemedText>
            <ThemedText style={[s.sheetReceiptActor, { color: colors.textSecondary }]}>
              {receipt.actor} \u2022 {new Date(receipt.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Decision Details</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizOrgOperationsV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: B3+ and B2a locked (operations are internal) ===
  if (!isBoardLevel(role)) {
    return <BizEmptyLock title="Operations" message="This section is restricted. Contact the Founder for access." />;
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState<OpsSubTabId>('triage');

  // Detail sheet states
  const [selectedInitiative, setSelectedInitiative] = useState<OpsInitiative | null>(null);
  const [showInitiativeDetail, setShowInitiativeDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState<OpsProject | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OpsTask | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedBlocker, setSelectedBlocker] = useState<OpsBlocker | null>(null);
  const [showBlockerDetail, setShowBlockerDetail] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<OpsDecision | null>(null);
  const [showDecisionDetail, setShowDecisionDetail] = useState(false);

  // === Data ===
  const data = useMemo(() => getBizOpsData(), []);

  // === Sub-tab definitions for BizSubTabBar ===
  const subTabs = useMemo(
    () => OPS_SUB_TABS.map((t) => ({ id: t.id, label: t.label })),
    [],
  );

  // === Callbacks ===
  const handleSubTabSelect = useCallback((id: string) => {
    setActiveSubTab(id as OpsSubTabId);
  }, []);

  const handleSelectInitiative = useCallback((initiative: OpsInitiative) => {
    setSelectedInitiative(initiative);
    setShowInitiativeDetail(true);
  }, []);

  const handleSelectProject = useCallback((project: OpsProject) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  }, []);

  const handleSelectTask = useCallback((task: OpsTask) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  }, []);

  const handleSelectBlocker = useCallback((blocker: OpsBlocker) => {
    setSelectedBlocker(blocker);
    setShowBlockerDetail(true);
  }, []);

  const handleSelectDecision = useCallback((decision: OpsDecision) => {
    setSelectedDecision(decision);
    setShowDecisionDetail(true);
  }, []);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeSubTab) {
      case 'triage':
        return <TriageTab colors={colors} accentColor={accentColor} data={data} />;
      case 'initiatives':
        return (
          <InitiativesTab
            colors={colors}
            accentColor={accentColor}
            data={data.initiatives}
            onSelectInitiative={handleSelectInitiative}
          />
        );
      case 'projects':
        return (
          <ProjectsTab
            colors={colors}
            accentColor={accentColor}
            data={data.projects}
            onSelectProject={handleSelectProject}
          />
        );
      case 'tasks':
        return (
          <TasksTab
            colors={colors}
            accentColor={accentColor}
            data={data.tasks}
            onSelectTask={handleSelectTask}
          />
        );
      case 'blockers':
        return (
          <BlockersTab
            colors={colors}
            accentColor={accentColor}
            data={data.blockers}
            onSelectBlocker={handleSelectBlocker}
          />
        );
      case 'decisions':
        return (
          <DecisionsTab
            colors={colors}
            accentColor={accentColor}
            data={data.decisions}
            receipts={data.receipts}
            onSelectDecision={handleSelectDecision}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Command Header — Summary Tiles */}
      <CommandHeader tiles={data.summaryTiles} colors={colors} accentColor={accentColor} />

      {/* Sub-tab bar */}
      <BizSubTabBar
        tabs={subTabs}
        activeId={activeSubTab}
        onSelect={handleSubTabSelect}
      />

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheets */}
      <InitiativeDetailSheet
        visible={showInitiativeDetail}
        onClose={() => setShowInitiativeDetail(false)}
        initiative={selectedInitiative}
        projects={data.projects}
        colors={colors}
        accentColor={accentColor}
      />
      <ProjectDetailSheet
        visible={showProjectDetail}
        onClose={() => setShowProjectDetail(false)}
        project={selectedProject}
        tasks={data.tasks}
        colors={colors}
        accentColor={accentColor}
      />
      <TaskDetailSheet
        visible={showTaskDetail}
        onClose={() => setShowTaskDetail(false)}
        task={selectedTask}
        colors={colors}
        accentColor={accentColor}
      />
      <BlockerDetailSheet
        visible={showBlockerDetail}
        onClose={() => setShowBlockerDetail(false)}
        blocker={selectedBlocker}
        colors={colors}
        accentColor={accentColor}
      />
      <DecisionDetailSheet
        visible={showDecisionDetail}
        onClose={() => setShowDecisionDetail(false)}
        decision={selectedDecision}
        receipts={data.receipts}
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

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
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

  // -- Badges --
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
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 32,
    textAlign: 'right',
  },

  // -- Entity badge --
  entityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BP.glass,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: BP.graphite,
  },
  entityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    maxWidth: 120,
  },

  // ==========================================================================
  // COMMAND HEADER
  // ==========================================================================
  commandHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tileCard: {
    flexGrow: 1,
    flexBasis: '30%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  tileIconRow: {
    marginBottom: 4,
  },
  tileIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },

  // ==========================================================================
  // TRIAGE TAB
  // ==========================================================================
  triageLaneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  triageLaneIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triageLaneTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  triageLaneCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  triageLaneCountText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  triageEmptyLane: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  triageEmptyText: {
    fontSize: 13,
  },
  triageCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  triageCardTop: {
    marginBottom: 4,
  },
  triageCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  triageCardSubtitle: {
    fontSize: 12,
    marginBottom: 6,
  },
  triageCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  triageInitiativeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BP.glass,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: BP.graphite,
  },
  triageInitiativeText: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    maxWidth: 140,
  },

  // ==========================================================================
  // INITIATIVES TAB
  // ==========================================================================
  initiativeCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  initiativeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: Spacing.sm,
  },
  initiativeCardName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 21,
  },
  initiativeCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  initiativeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 8,
  },
  initiativeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  initiativeMetaText: {
    fontSize: 12,
  },
  initiativeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  initiativeTimeline: {
    fontSize: 11,
  },

  // ==========================================================================
  // PROJECTS TAB
  // ==========================================================================
  projectCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  projectCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: Spacing.sm,
  },
  projectCardName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 21,
  },
  projectInitiativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  projectInitiativeText: {
    fontSize: 12,
    flex: 1,
  },
  projectCompletionSection: {
    marginBottom: 8,
  },
  projectCompletionLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  projectMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  projectMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectMetaText: {
    fontSize: 12,
  },
  projectTimelineText: {
    fontSize: 11,
  },
  projectEntityRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // ==========================================================================
  // TASKS TAB
  // ==========================================================================
  tasksContainer: {
    flex: 1,
  },
  taskFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  taskFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 5,
  },
  taskFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  taskStripe: {
    width: 4,
  },
  taskCardContent: {
    flex: 1,
    padding: Spacing.sm,
  },
  taskCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    marginBottom: 6,
  },
  taskAssigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskAssigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  taskAvatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskAvatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskAssigneeText: {
    fontSize: 12,
    flex: 1,
  },
  taskDueDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDueDateText: {
    fontSize: 11,
  },
  taskChipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  taskProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskProjectText: {
    fontSize: 11,
    fontWeight: '500',
    color: BP.ash,
    flex: 1,
  },

  // ==========================================================================
  // BLOCKERS TAB
  // ==========================================================================
  blockerCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  blockerStripe: {
    width: 4,
  },
  blockerCardContent: {
    flex: 1,
    padding: Spacing.sm,
  },
  blockerTopRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  blockerTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  blockerDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  blockerInitiativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  blockerInitiativeText: {
    fontSize: 12,
    flex: 1,
  },
  blockerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  blockerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blockerMetaText: {
    fontSize: 12,
  },
  blockerDateText: {
    fontSize: 11,
    marginLeft: 'auto',
  },

  // ==========================================================================
  // DECISIONS TAB
  // ==========================================================================
  decisionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  decisionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: Spacing.sm,
  },
  decisionTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  decisionDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  decisionProposedRow: {
    marginBottom: 6,
  },
  decisionProposedText: {
    fontSize: 11,
  },
  decisionVotersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  decisionVotersText: {
    fontSize: 12,
    flex: 1,
  },
  decisionBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BP.emerald + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  receiptBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BP.emerald,
    letterSpacing: 0.3,
  },
  decisionInitiativeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BP.glass,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: BP.graphite,
  },
  decisionInitiativeText: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
  },

  // ==========================================================================
  // BOTTOM SHEET SHARED
  // ==========================================================================
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  sheetDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  sheetKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  sheetKpiItem: {
    alignItems: 'center',
  },
  sheetKpiValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetKpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetProgressSection: {
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetInitiativeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sheetInitiativeLinkText: {
    fontSize: 13,
  },
  sheetLinkedProject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 5,
  },
  sheetLinkedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetLinkedName: {
    fontSize: 13,
    flex: 1,
  },
  sheetLinkedStatus: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetMoreText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  sheetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sheetDetailDate: {
    fontSize: 12,
  },
  sheetVoterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  sheetVoterAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetVoterAvatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sheetVoterName: {
    fontSize: 14,
  },
  sheetReceiptCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginTop: 4,
  },
  sheetReceiptTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sheetReceiptType: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sheetReceiptAction: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  sheetReceiptActor: {
    fontSize: 11,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
