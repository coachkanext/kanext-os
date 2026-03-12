/**
 * Office — 3-page swipeable layout for business mode.
 * Page 0: Projects — summary strip, filter pills, project cards.
 * Page 1: Workflows — approvals banner, board/list toggle, kanban board.
 * Page 2: Performance — time range pills, KPI grid, activity list.
 * Identical SwipeablePages / LongPressContextMenu patterns as Season.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  WORKFLOW_TASKS,
  PENDING_APPROVALS,
  PERFORMANCE_ACTIVITY,
  getProjects,
  getProjectSummary,
  getKpis,
  type ProjectItem,
  type ProjectFilter,
  type ProjectStatus,
  type WorkflowTask,
  type TaskStatus,
  type WorkflowView,
  type TimeRange,
  type KpiCard as KpiCardType,
  type PerformanceActivity,
} from '@/data/mock-office';

import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const SCREEN_WIDTH = Dimensions.get('window').width;

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: '#3B82F6',
  'on-hold': '#F59E0B',
  completed: '#22C55E',
  'at-risk': '#EF4444',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  'at-risk': 'At Risk',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

// ─── Page Top Bar ────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ────────────────────────────────────────────────

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Project Summary Strip ──────────────────────────────────────────────────

function ProjectSummaryStrip({ summary }: { summary: { total: number; active: number; onHold: number; atRisk: number } }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.summaryCard}>
      <View style={s.summaryRow}>
        <View style={s.summaryStat}>
          <Text style={s.summaryValue}>{summary.total}</Text>
          <Text style={s.summaryLabel}>Total</Text>
        </View>
        <View style={[s.summaryStat, s.summaryStatBorder]}>
          <Text style={[s.summaryValue, { color: C.blue }]}>{summary.active}</Text>
          <Text style={s.summaryLabel}>Active</Text>
        </View>
        <View style={[s.summaryStat, s.summaryStatBorder]}>
          <Text style={[s.summaryValue, { color: C.red }]}>{summary.atRisk}</Text>
          <Text style={s.summaryLabel}>At Risk</Text>
        </View>
        <View style={s.summaryStat}>
          <Text style={[s.summaryValue, { color: C.amber }]}>{summary.onHold}</Text>
          <Text style={s.summaryLabel}>On Hold</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Stacked Avatars ────────────────────────────────────────────────────────

function StackedAvatars({ members, max = 4 }: { members: { initials: string }[]; max?: number }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const shown = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <View style={s.stackedRow}>
      {shown.map((m, i) => (
        <View key={i} style={[s.stackedAvatar, { marginLeft: i === 0 ? 0 : -8 }]}>
          <Text style={s.stackedInitials}>{m.initials}</Text>
        </View>
      ))}
      {overflow > 0 && (
        <View style={[s.stackedAvatar, { marginLeft: -8, backgroundColor: C.muted }]}>
          <Text style={s.stackedInitials}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Project Card ───────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onLongPress,
}: {
  project: ProjectItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const statusColor = STATUS_COLORS[project.status];
  const statusLabel = STATUS_LABELS[project.status];

  return (
    <Pressable
      style={({ pressed }) => [s.projectCard, pressed && s.projectCardPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      {/* Header: name + status */}
      <View style={s.projectHeader}>
        <Text style={s.projectName} numberOfLines={1}>{project.name}</Text>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.progressBarBg}>
        <View style={[s.progressBarFill, { width: `${project.progressPercent}%`, backgroundColor: statusColor }]} />
      </View>
      <Text style={s.progressText}>{project.progressPercent}% complete</Text>

      {/* Owner + due date */}
      <View style={s.projectMeta}>
        <View style={s.ownerRow}>
          <View style={s.ownerAvatar}>
            <Text style={s.ownerInitials}>{project.ownerInitials}</Text>
          </View>
          <Text style={s.ownerName}>{project.ownerName}</Text>
        </View>
        <Text style={s.dueDate}>Due {project.dueDate}</Text>
      </View>

      {/* Team + last activity */}
      <View style={s.projectFooter}>
        <StackedAvatars members={project.teamMembers} />
        <Text style={s.lastActivity}>{project.lastActivity}</Text>
      </View>
    </Pressable>
  );
}

// ─── Approvals Queue ────────────────────────────────────────────────────────

function ApprovalsQueue({ approvals }: { approvals: typeof PENDING_APPROVALS }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.approvalsCard}>
      <View style={s.approvalsHeader}>
        <IconSymbol name="exclamationmark.triangle.fill" size={14} color={C.amber} />
        <Text style={s.approvalsTitle}>{approvals.length} Pending Approval{approvals.length !== 1 ? 's' : ''}</Text>
      </View>
      {approvals.map((item) => (
        <View key={item.id} style={s.approvalRow}>
          <View style={s.approvalAvatar}>
            <Text style={s.approvalInitials}>{item.requestedByInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.approvalTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={s.approvalMeta}>{item.requestedBy} · {item.timestamp}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Workflow View Toggle ───────────────────────────────────────────────────

function WorkflowViewToggle({
  active,
  onSelect,
}: {
  active: WorkflowView;
  onSelect: (v: WorkflowView) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.viewToggleRow}>
      <Pressable
        style={[s.viewTogglePill, active === 'board' && s.viewTogglePillActive]}
        onPress={() => onSelect('board')}
      >
        <Text style={[s.viewToggleText, active === 'board' && s.viewToggleTextActive]}>Board</Text>
      </Pressable>
      <Pressable
        style={[s.viewTogglePill, active === 'list' && s.viewTogglePillActive]}
        onPress={() => onSelect('list')}
      >
        <Text style={[s.viewToggleText, active === 'list' && s.viewToggleTextActive]}>List</Text>
      </Pressable>
    </View>
  );
}

// ─── Kanban Task Card ───────────────────────────────────────────────────────

function KanbanTaskCard({
  task,
  onLongPress,
}: {
  task: WorkflowTask;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const priorityColor = PRIORITY_COLORS[task.priority];

  return (
    <Pressable
      style={({ pressed }) => [s.kanbanCard, pressed && { opacity: 0.85 }]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <Text style={s.kanbanCardTitle} numberOfLines={2}>{task.title}</Text>
      <View style={s.kanbanCardMeta}>
        <View style={[s.priorityDot, { backgroundColor: priorityColor }]} />
        <View style={s.kanbanAssignee}>
          <Text style={s.kanbanAssigneeText}>{task.assigneeInitials}</Text>
        </View>
        <Text style={s.kanbanDue}>{task.dueDate}</Text>
      </View>
      <View style={s.projectTagBadge}>
        <Text style={s.projectTagText} numberOfLines={1}>{task.projectTag}</Text>
      </View>
    </Pressable>
  );
}

// ─── Kanban Column ──────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  tasks,
  onLongPressTask,
}: {
  status: TaskStatus;
  tasks: WorkflowTask[];
  onLongPressTask: (task: WorkflowTask, pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.kanbanColumn}>
      <View style={s.kanbanColumnHeader}>
        <Text style={s.kanbanColumnLabel}>{TASK_STATUS_LABELS[status]}</Text>
        <View style={s.kanbanColumnCount}>
          <Text style={s.kanbanColumnCountText}>{tasks.length}</Text>
        </View>
      </View>
      {tasks.map((task) => (
        <KanbanTaskCard
          key={task.id}
          task={task}
          onLongPress={(pageY) => onLongPressTask(task, pageY)}
        />
      ))}
    </View>
  );
}

// ─── Kanban Board ───────────────────────────────────────────────────────────

const COLUMN_ORDER: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

function KanbanBoard({
  tasks,
  onLongPressTask,
}: {
  tasks: WorkflowTask[];
  onLongPressTask: (task: WorkflowTask, pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, WorkflowTask[]> = { todo: [], 'in-progress': [], review: [], done: [] };
    tasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [tasks]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.kanbanScroll}
    >
      {COLUMN_ORDER.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={grouped[status]}
          onLongPressTask={onLongPressTask}
        />
      ))}
    </ScrollView>
  );
}

// ─── Task List Row ──────────────────────────────────────────────────────────

function TaskListRow({
  task,
  onLongPress,
}: {
  task: WorkflowTask;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const priorityColor = PRIORITY_COLORS[task.priority];

  return (
    <Pressable
      style={({ pressed }) => [s.taskListRow, pressed && s.taskListRowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={[s.priorityDot, { backgroundColor: priorityColor }]} />
      <Text style={s.taskListTitle} numberOfLines={1}>{task.title}</Text>
      <View style={s.taskListAssignee}>
        <Text style={s.taskListAssigneeText}>{task.assigneeInitials}</Text>
      </View>
      <Text style={s.taskListDue}>{task.dueDate}</Text>
    </Pressable>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCardView({ kpi }: { kpi: KpiCardType }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const isPositive = kpi.invertTrend
    ? kpi.trend === 'down'
    : kpi.trend === 'up';
  const isNegative = kpi.invertTrend
    ? kpi.trend === 'up'
    : kpi.trend === 'down';
  const trendColor = isPositive ? C.green : isNegative ? C.red : C.secondary;
  const trendArrow = kpi.trend === 'up' ? '▲' : kpi.trend === 'down' ? '▼' : '─';
  const maxBar = Math.max(...kpi.sparkBars, 1);

  return (
    <View style={s.kpiCard}>
      <Text style={s.kpiMetricName}>{kpi.metricName}</Text>
      <Text style={s.kpiValue}>{kpi.currentValue}</Text>
      <View style={s.kpiTrendRow}>
        <Text style={[s.kpiTrendArrow, { color: trendColor }]}>{trendArrow}</Text>
        <Text style={[s.kpiTrendPercent, { color: trendColor }]}>{kpi.changePercent}</Text>
      </View>
      {/* Spark bars */}
      <View style={s.sparkBarRow}>
        {kpi.sparkBars.map((val, i) => (
          <View key={i} style={s.sparkBarContainer}>
            <View
              style={[
                s.sparkBar,
                {
                  height: Math.max((val / maxBar) * 28, 2),
                  backgroundColor: trendColor + '66',
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── KPI Grid ───────────────────────────────────────────────────────────────

function KpiGrid({ kpis }: { kpis: KpiCardType[] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.kpiGrid}>
      {kpis.map((kpi) => (
        <KpiCardView key={kpi.id} kpi={kpi} />
      ))}
    </View>
  );
}

// ─── Performance Activity Row ───────────────────────────────────────────────

function PerformanceActivityRow({ activity }: { activity: PerformanceActivity }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.activityRow}>
      <View style={s.activityIcon}>
        <IconSymbol name={activity.icon as any} size={16} color={C.secondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.activityDescription}>{activity.description}</Text>
        <Text style={s.activityTimestamp}>{activity.timestamp}</Text>
      </View>
    </View>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title}</Text>
    </View>
  );
}

// ─── FAB ────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

// ─── Filter Data ────────────────────────────────────────────────────────────

const PROJECT_FILTERS: { key: ProjectFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'on-hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
];

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export function OfficeContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('all');
  const [workflowView, setWorkflowView] = useState<WorkflowView>('board');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // ── Data ──
  const summary = useMemo(() => getProjectSummary(), []);
  const filteredProjects = useMemo(() => getProjects(projectFilter), [projectFilter]);
  const kpis = useMemo(() => getKpis(timeRange), [timeRange]);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Project ──
  const longPressProject = useCallback((project: ProjectItem, pageY: number) => {
    setMenuData({
      title: project.name,
      subtitle: `${STATUS_LABELS[project.status]} · ${project.progressPercent}%`,
      initials: project.ownerInitials,
      pageY,
      actions: [
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill' },
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Task ──
  const longPressTask = useCallback((task: WorkflowTask, pageY: number) => {
    setMenuData({
      title: task.title,
      subtitle: `${task.assigneeName} · ${task.dueDate}`,
      initials: task.assigneeInitials,
      pageY,
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'reassign', label: 'Reassign', icon: 'person.fill' },
        { key: 'priority', label: 'Change Priority', icon: 'flag.fill' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}

      >
        {/* ── PAGE 0: PROJECTS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Projects" />
            <FilterPills items={PROJECT_FILTERS} active={projectFilter} onSelect={setProjectFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <ProjectSummaryStrip summary={summary} />
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onLongPress={(pageY) => longPressProject(project, pageY)}
              />
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: WORKFLOWS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Workflows" />
            {PENDING_APPROVALS.length > 0 && <ApprovalsQueue approvals={PENDING_APPROVALS} />}
            <WorkflowViewToggle active={workflowView} onSelect={setWorkflowView} />
          </View>
          {workflowView === 'board' ? (
            <KanbanBoard
              tasks={WORKFLOW_TASKS}
              onLongPressTask={longPressTask}
            />
          ) : (
            <ScrollView
              style={s.pageScroll}
              contentContainerStyle={{ paddingBottom: 100 }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
            >
              {WORKFLOW_TASKS.map((task, idx) => (
                <View key={task.id}>
                  {idx > 0 && <View style={s.separator} />}
                  <TaskListRow
                    task={task}
                    onLongPress={(pageY) => longPressTask(task, pageY)}
                  />
                </View>
              ))}
            </ScrollView>
          )}
          {pageIndex === 1 && <FAB onPress={() => {}} />}
        </View>

        {/* ── PAGE 2: PERFORMANCE ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Performance" />
            <FilterPills items={TIME_RANGES} active={timeRange} onSelect={setTimeRange} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <KpiGrid kpis={kpis} />
            <SectionHeader title="Activity" />
            {PERFORMANCE_ACTIVITY.map((activity, idx) => (
              <View key={activity.id}>
                {idx > 0 && <View style={s.separator} />}
                <PerformanceActivityRow activity={activity} />
              </View>
            ))}
          </ScrollView>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: '#000000',
  },

  // Project summary strip
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStatBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: C.secondary,
    marginTop: 2,
  },

  // Project card
  projectCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },
  projectCardPressed: {
    opacity: 0.85,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 10,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitials: {
    fontSize: 9,
    fontWeight: '700',
    color: C.label,
  },
  ownerName: {
    fontSize: 13,
    color: C.secondary,
  },
  dueDate: {
    fontSize: 12,
    color: C.muted,
  },
  projectFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastActivity: {
    fontSize: 11,
    color: C.muted,
  },

  // Stacked avatars
  stackedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.surface,
  },
  stackedInitials: {
    fontSize: 8,
    fontWeight: '700',
    color: C.label,
  },

  // Approvals
  approvalsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: C.surface,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.amber,
    padding: 12,
  },
  approvalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  approvalsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.amber,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  approvalAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalInitials: {
    fontSize: 9,
    fontWeight: '700',
    color: C.label,
  },
  approvalTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: C.label,
  },
  approvalMeta: {
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },

  // View toggle
  viewToggleRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 0,
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 2,
    alignSelf: 'flex-start',
  },
  viewTogglePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewTogglePillActive: {
    backgroundColor: C.label,
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
  },
  viewToggleTextActive: {
    color: '#000000',
  },

  // Kanban
  kanbanScroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  kanbanColumn: {
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 10,
    alignSelf: 'flex-start',
  },
  kanbanColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  kanbanColumnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  kanbanColumnCount: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  kanbanColumnCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
  },
  kanbanCard: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  kanbanCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: C.label,
    marginBottom: 8,
  },
  kanbanCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  kanbanAssignee: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kanbanAssigneeText: {
    fontSize: 8,
    fontWeight: '700',
    color: C.label,
  },
  kanbanDue: {
    fontSize: 11,
    color: C.muted,
  },
  projectTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.blue + '26',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  projectTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.blue,
  },

  // Task list row
  taskListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  taskListRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  taskListTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  taskListAssignee: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskListAssigneeText: {
    fontSize: 9,
    fontWeight: '700',
    color: C.label,
  },
  taskListDue: {
    fontSize: 12,
    color: C.muted,
    width: 48,
    textAlign: 'right',
  },

  // KPI card
  kpiCard: {
    width: '48%',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  kpiMetricName: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: C.label,
    marginBottom: 4,
  },
  kpiTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  kpiTrendArrow: {
    fontSize: 10,
    fontWeight: '700',
  },
  kpiTrendPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  sparkBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
  },
  sparkBarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    height: 28,
  },
  sparkBar: {
    borderRadius: 2,
    minHeight: 2,
  },

  // KPI grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: C.label,
  },
  activityTimestamp: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Separator
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
    marginLeft: 58,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
