/**
 * Organization Operations Tab v2 — 14-tab Operations Hub.
 * Dashboard, Cadence, Tasks, Work Orders, Issues, Assets, Vendors,
 * Facilities, Travel, People Ops, SOPs, Reports, Audit, Settings.
 * Replaces the original org-operations-tab.tsx.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, StyleSheet, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
;
import type { Mode } from '@/types';
import {
  OPS_TABS,
  OPS_SCOPE_CHIPS,
  getOpsData,
  filterTasks,
  sortTasks,
  STATUS_COLOR_MAP,
  SEVERITY_COLOR_MAP,
  PRIORITY_COLOR_MAP,
  CONDITION_COLOR_MAP,
} from '@/data/mock-ops-v2';
import type {
  OpsTabId,
  OpsTask,
  OpsWorkOrder,
  OpsIssue,
  OpsAsset,
  OpsVendor,
  OpsFacility,
  OpsTravelItem,
  OpsSOP,
  OpsReport,
  OpsAuditEntry,
  OpsCadenceMeeting,
  DashboardBlock,
  OpsStatus,
  OpsPriority,
  IssueSeverity,
  AssetCondition,
  SortOption,
} from '@/data/mock-ops-v2';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// SUB-COMPONENTS — Badges
// =============================================================================

function PriorityBadge({ priority }: { priority: OpsPriority }) {
  const fg = PRIORITY_COLOR_MAP[priority];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{priority}</ThemedText>
    </View>
  );
}

function StatusBadge({ status }: { status: OpsStatus }) {
  const fg = STATUS_COLOR_MAP[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  const fg = SEVERITY_COLOR_MAP[severity];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg, textTransform: 'capitalize' }]}>{severity}</ThemedText>
    </View>
  );
}

function ConditionBadge({ condition }: { condition: AssetCondition }) {
  const fg = CONDITION_COLOR_MAP[condition];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg, textTransform: 'capitalize' }]}>{condition}</ThemedText>
    </View>
  );
}

function EmptyState({ icon, text, colors }: { icon: string; text: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyState}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

// =============================================================================
// ASSET ICON HELPER
// =============================================================================

function assetCategoryIcon(category: OpsAsset['category']): string {
  switch (category) {
    case 'device': return 'rectangle.stack.fill';
    case 'camera': return 'camera.fill';
    case 'furniture': return 'tablecells.fill';
    case 'vehicle': return 'airplane';
    case 'equipment': return 'doc.on.clipboard';
    case 'infrastructure': return 'building.2';
    default: return 'rectangle.stack.fill';
  }
}

// =============================================================================
// FACILITY STATUS COLORS
// =============================================================================

const FACILITY_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  operational: { bg: '#22C55E20', fg: '#22C55E' },
  partial: { bg: '#F59E0B20', fg: '#F59E0B' },
  offline: { bg: '#EF444420', fg: '#EF4444' },
};

// =============================================================================
// TRAVEL STATUS COLORS
// =============================================================================

const TRAVEL_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  planned: { bg: '#A1A1AA20', fg: '#A1A1AA' },
  booked: { bg: '#22C55E20', fg: '#22C55E' },
  'in-transit': { bg: '#F59E0B20', fg: '#F59E0B' },
  completed: { bg: `${accent}20`, fg: accent },
};

// =============================================================================
// VENDOR STATUS COLORS
// =============================================================================

const VENDOR_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  active: { bg: '#22C55E20', fg: '#22C55E' },
  'pending-renewal': { bg: '#F59E0B20', fg: '#F59E0B' },
  expired: { bg: '#EF444420', fg: '#EF4444' },
};

// =============================================================================
// TIMESTAMP FORMATTER
// =============================================================================

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// =============================================================================
// MODE LABEL
// =============================================================================

const MODE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  business: 'Business',
  church: 'Church',
  education: 'Education',
  competition: 'Competition',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OrgOperationsTab({ mode, colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<OpsTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter state
  const [filterSort, setFilterSort] = useState<SortOption>('due-soonest');
  const [filterStatuses, setFilterStatuses] = useState<OpsStatus[]>([]);
  const [filterPriorities, setFilterPriorities] = useState<OpsPriority[]>([]);

  // Settings toggles (visual only)
  const [settingAutoCreate, setSettingAutoCreate] = useState(true);
  const [settingTravelApprovals, setSettingTravelApprovals] = useState(false);
  const [settingWOApproval, setSettingWOApproval] = useState(true);

  // === Data ===
  const data = useMemo(() => getOpsData(mode), [mode]);
  const scopeChips = OPS_SCOPE_CHIPS[mode];

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: OpsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleFilterToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterVisible(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterSort('due-soonest');
    setFilterStatuses([]);
    setFilterPriorities([]);
  }, []);

  const toggleFilterStatus = useCallback((st: OpsStatus) => {
    setFilterStatuses((prev) =>
      prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st],
    );
  }, []);

  const toggleFilterPriority = useCallback((pr: OpsPriority) => {
    setFilterPriorities((prev) =>
      prev.includes(pr) ? prev.filter((x) => x !== pr) : [...prev, pr],
    );
  }, []);

  // === Derived ===
  const filteredTasks = useMemo(() => {
    const filtered = filterTasks(data.tasks, searchQuery, filterStatuses, filterPriorities);
    return sortTasks(filtered, filterSort);
  }, [data.tasks, filterStatuses, filterPriorities, searchQuery, filterSort]);

  const p0p1Count = useMemo(() => {
    const p0 = data.tasks.filter((t) => t.priority === 'P0' && t.status !== 'complete').length;
    const p1 = data.tasks.filter((t) => t.priority === 'P1' && t.status !== 'complete').length;
    return { p0, p1 };
  }, [data.tasks]);

  const criticalIssueCount = useMemo(
    () => data.issues.filter((i) => i.severity === 'critical' && i.status !== 'complete').length,
    [data.issues],
  );

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'cadence':
        return renderCadence();
      case 'tasks':
        return renderTasks();
      case 'work-orders':
        return renderWorkOrders();
      case 'issues':
        return renderIssues();
      case 'assets':
        return renderAssets();
      case 'vendors':
        return renderVendors();
      case 'facilities':
        return renderFacilities();
      case 'travel':
        return renderTravel();
      case 'people-ops':
        return renderPeopleOps();
      case 'sops':
        return renderSOPs();
      case 'reports':
        return renderReports();
      case 'audit':
        return renderAudit();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  // === Tab 1: Dashboard ===
  const renderDashboard = () => (
    <View style={s.tabContent}>
      <View style={s.dashboardGrid}>
        {data.dashboard.map((block) => (
          <View
            key={block.id}
            style={[s.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.dashIconCircle, { backgroundColor: block.color + '26' }]}>
              <IconSymbol name={block.icon as any} size={16} color={block.color} />
            </View>
            <ThemedText style={[s.dashLabel, { color: colors.textSecondary }]}>{block.label}</ThemedText>
            <ThemedText style={[s.dashValue, { color: block.color }]}>{block.value}</ThemedText>
            {block.subValue && (
              <ThemedText style={[s.dashSub, { color: colors.textTertiary }]}>{block.subValue}</ThemedText>
            )}
          </View>
        ))}
      </View>

      {/* Quick stats below grid */}
      <View style={[s.quickStatsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.quickStat}>
          <ThemedText style={[s.quickStatLabel, { color: colors.textSecondary }]}>Open Tasks</ThemedText>
          <ThemedText style={s.quickStatValue}>
            {data.tasks.filter((t) => t.status !== 'complete' && t.status !== 'archived').length}
          </ThemedText>
          {(p0p1Count.p0 > 0 || p0p1Count.p1 > 0) && (
            <ThemedText style={[s.quickStatHighlight, { color: '#EF4444' }]}>
              {p0p1Count.p0} P0 / {p0p1Count.p1} P1
            </ThemedText>
          )}
        </View>
        <View style={[s.quickStatDivider, { backgroundColor: colors.divider }]} />
        <View style={s.quickStat}>
          <ThemedText style={[s.quickStatLabel, { color: colors.textSecondary }]}>Issues</ThemedText>
          <ThemedText style={s.quickStatValue}>
            {data.issues.filter((i) => i.status !== 'complete' && i.status !== 'archived').length}
          </ThemedText>
          {criticalIssueCount > 0 && (
            <ThemedText style={[s.quickStatHighlight, { color: '#EF4444' }]}>
              {criticalIssueCount} critical
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );

  // === Tab 2: Cadence ===
  const renderCadence = () => (
    <FlatList<OpsCadenceMeeting>
      data={data.cadence}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="calendar" text="No cadence meetings" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.listIconCircle, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name="calendar" size={16} color={accentColor} />
            </View>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <View style={s.listCardMeta}>
                <View style={[s.categoryChip, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.categoryChipText, { color: accentColor }]}>{item.frequency}</ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  {item.nextDate} · {item.time}
                </ThemedText>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.attendees.length} attendees
              </ThemedText>
              {item.agenda && (
                <ThemedText style={[s.listCardAgenda, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.agenda}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 3: Tasks ===
  const renderTasks = () => (
    <FlatList<OpsTask>
      data={filteredTasks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="checkmark.circle.fill" text="No tasks match filters" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <PriorityBadge priority={item.priority} />
            <View style={[s.listCardInfo, { marginLeft: Spacing.sm }]}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <View style={s.taskOwnerRow}>
                <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                  <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.ownerInitials}</ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.owner}</ThemedText>
              </View>
              <View style={s.taskBottomRow}>
                <ThemedText style={[s.taskDue, { color: colors.textTertiary }]}>Due {item.dueDate}</ThemedText>
                <StatusBadge status={item.status} />
              </View>
              <ThemedText style={[s.unitLine, { color: colors.textTertiary }]}>{item.unit}</ThemedText>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 4: Work Orders ===
  const renderWorkOrders = () => (
    <FlatList<OpsWorkOrder>
      data={data.workOrders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="doc.on.clipboard" text="No work orders" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={s.listCardInfo}>
              <View style={s.woTopRow}>
                <View style={[s.categoryChip, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.categoryChipText, { color: accentColor }]}>{item.category}</ThemedText>
                </View>
                <PriorityBadge priority={item.priority} />
              </View>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                Requested: {item.requestedBy} · Assigned: {item.assignedTo}
              </ThemedText>
              <View style={s.taskBottomRow}>
                <ThemedText style={[s.taskDue, { color: colors.textTertiary }]}>Due {item.dueDate}</ThemedText>
                <StatusBadge status={item.status} />
              </View>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 5: Issues ===
  const renderIssues = () => (
    <FlatList<OpsIssue>
      data={data.issues}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="exclamationmark.triangle.fill" text="No issues" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <SeverityBadge severity={item.severity} />
            <View style={[s.listCardInfo, { marginLeft: Spacing.sm }]}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                {item.owner} · {item.category}
              </ThemedText>
              <View style={s.taskBottomRow}>
                <ThemedText style={[s.taskDue, { color: colors.textTertiary }]}>Reported {item.reportedAt}</ThemedText>
                <StatusBadge status={item.status} />
              </View>
              {item.resolution && (
                <ThemedText style={[s.resolutionLine, { color: colors.textTertiary }]}>
                  Resolution: {item.resolution}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 6: Assets ===
  const renderAssets = () => (
    <FlatList<OpsAsset>
      data={data.assets}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="rectangle.stack.fill" text="No assets tracked" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.listIconCircle, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name={assetCategoryIcon(item.category) as any} size={16} color={accentColor} />
            </View>
            <View style={s.listCardInfo}>
              <View style={s.woTopRow}>
                <ThemedText style={s.listCardTitle}>{item.name}</ThemedText>
                <View style={[s.categoryChip, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.categoryChipText, { color: accentColor }]}>{item.category}</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                {item.assignedTo ?? 'Unassigned'}
              </ThemedText>
              <View style={s.taskBottomRow}>
                <ThemedText style={[s.taskDue, { color: colors.textTertiary }]}>{item.location}</ThemedText>
                <ConditionBadge condition={item.condition} />
              </View>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 7: Vendors ===
  const renderVendors = () => (
    <FlatList<OpsVendor>
      data={data.vendors}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="building.2" text="No vendors" colors={colors} />}
      renderItem={({ item }) => {
        const statusColor = VENDOR_STATUS_COLORS[item.status] ?? { bg: colors.backgroundTertiary, fg: colors.textSecondary };
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={s.listCardInfo}>
                <View style={s.woTopRow}>
                  <ThemedText style={s.listCardTitle}>{item.name}</ThemedText>
                  <View style={[s.categoryChip, { backgroundColor: accentColor + '18' }]}>
                    <ThemedText style={[s.categoryChipText, { color: accentColor }]}>{item.category}</ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  Contract ends: {item.contractEnd}
                </ThemedText>
                <View style={s.taskBottomRow}>
                  <ThemedText
                    style={[
                      s.taskDue,
                      { color: item.activeTickets > 0 ? '#F59E0B' : colors.textTertiary, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.activeTickets} active ticket{item.activeTickets !== 1 ? 's' : ''}
                  </ThemedText>
                  <View style={[s.badge, { backgroundColor: statusColor.bg }]}>
                    <ThemedText style={[s.badgeText, { color: statusColor.fg }]}>{item.status}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 8: Facilities ===
  const renderFacilities = () => (
    <FlatList<OpsFacility>
      data={data.facilities}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="building.columns.fill" text="No facilities" colors={colors} />}
      renderItem={({ item }) => {
        const statusColor = FACILITY_STATUS_COLORS[item.status] ?? { bg: colors.backgroundTertiary, fg: colors.textSecondary };
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={s.listCardInfo}>
                <View style={s.woTopRow}>
                  <ThemedText style={s.listCardTitle}>{item.name}</ThemedText>
                  <View style={[s.categoryChip, { backgroundColor: accentColor + '18' }]}>
                    <ThemedText style={[s.categoryChipText, { color: accentColor }]}>{item.type}</ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.location}</ThemedText>
                <View style={s.taskBottomRow}>
                  <ThemedText
                    style={[
                      s.taskDue,
                      { color: item.maintenanceQueue > 0 ? '#F59E0B' : colors.textTertiary, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.maintenanceQueue} in maintenance queue
                  </ThemedText>
                  <View style={[s.badge, { backgroundColor: statusColor.bg }]}>
                    <ThemedText style={[s.badgeText, { color: statusColor.fg }]}>{item.status}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 9: Travel ===
  const renderTravel = () => (
    <FlatList<OpsTravelItem>
      data={data.travel}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="airplane" text="No travel plans" colors={colors} />}
      renderItem={({ item }) => {
        const statusColor = TRAVEL_STATUS_COLORS[item.status] ?? { bg: colors.backgroundTertiary, fg: colors.textSecondary };
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={[s.listIconCircle, { backgroundColor: `${accent}15` }]}>
                <IconSymbol name="airplane" size={16} color={accent} />
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.destination}</ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  {item.departDate} → {item.returnDate}
                </ThemedText>
                <View style={s.taskBottomRow}>
                  <ThemedText style={[s.taskDue, { color: colors.textTertiary, fontVariant: ['tabular-nums'] }]}>
                    {item.travelers} travelers
                  </ThemedText>
                  <View style={[s.badge, { backgroundColor: statusColor.bg }]}>
                    <ThemedText style={[s.badgeText, { color: statusColor.fg }]}>{item.status}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 10: People Ops (placeholder) ===
  const renderPeopleOps = () => (
    <EmptyState icon="person.3.fill" text="People operations, staffing, and HR tasks" colors={colors} />
  );

  // === Tab 11: SOPs ===
  const renderSOPs = () => (
    <FlatList<OpsSOP>
      data={data.sops}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="doc.text.fill" text="No SOPs" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.listIconCircle, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name="doc.text.fill" size={16} color={accentColor} />
            </View>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <View style={[s.categoryChip, { backgroundColor: accentColor + '18', alignSelf: 'flex-start' }]}>
                <ThemedText style={[s.categoryChipText, { color: accentColor }]}>{item.category}</ThemedText>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary, fontVariant: ['tabular-nums'] }]}>
                {item.steps} steps · Updated {item.lastUpdated}
              </ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.owner}</ThemedText>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 12: Reports ===
  const renderReports = () => (
    <FlatList<OpsReport>
      data={data.reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="chart.bar.fill" text="No reports" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.listIconCircle, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name="chart.bar.fill" size={16} color={accentColor} />
            </View>
            <View style={s.listCardInfo}>
              <View style={s.woTopRow}>
                <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
                <View style={[s.categoryChip, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.categoryChipText, { color: accentColor }]}>{item.type}</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Generated {item.generatedAt} · {item.owner}
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 13: Audit ===
  const renderAudit = () => {
    const sorted = [...data.audit].sort((a, b) => b.timestampMs - a.timestampMs);
    return (
      <FlatList<OpsAuditEntry>
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={<EmptyState icon="clock.fill" text="No audit entries" colors={colors} />}
        renderItem={({ item }) => {
          const auditColor = item.action.includes('issue') ? '#EF4444'
            : item.action.includes('task') ? '#22C55E'
            : item.action.includes('sop') || item.action.includes('report') ? accent
            : item.action.includes('vendor') || item.action.includes('asset') ? '#F59E0B'
            : '#A1A1AA';
          const auditIcon = item.action.includes('issue') ? 'exclamationmark.triangle.fill'
            : item.action.includes('task') ? 'checkmark.circle.fill'
            : item.action.includes('work-order') ? 'doc.on.clipboard'
            : item.action.includes('travel') ? 'airplane'
            : item.action.includes('sop') ? 'doc.text.fill'
            : item.action.includes('vendor') ? 'building.2'
            : item.action.includes('asset') ? 'rectangle.stack.fill'
            : item.action.includes('report') ? 'chart.bar.fill'
            : 'clock.fill';
          return (
          <View style={s.auditRow}>
            <View style={[s.auditIconCircle, { backgroundColor: auditColor + '20' }]}>
              <IconSymbol name={auditIcon as any} size={14} color={auditColor} />
            </View>
            <View style={s.auditInfo}>
              <ThemedText style={s.auditDesc}>{item.description}</ThemedText>
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {item.actor} · {formatTimestamp(item.timestampMs)}
              </ThemedText>
            </View>
          </View>
          );
        }}
      />
    );
  };

  // === Tab 14: Settings ===
  const renderSettings = () => (
    <View style={s.tabContent}>
      <ThemedText style={[s.settingsHeader, { color: colors.textSecondary }]}>
        {MODE_LABELS[mode]} Operations Settings
      </ThemedText>
      <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.settingsRow}>
          <ThemedText style={s.settingsLabel}>Auto-create game day tasks</ThemedText>
          <Switch
            value={settingAutoCreate}
            onValueChange={setSettingAutoCreate}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={settingAutoCreate ? accentColor : colors.textTertiary}
          />
        </View>
        <View style={[s.settingsDivider, { backgroundColor: colors.divider }]} />
        <View style={s.settingsRow}>
          <ThemedText style={s.settingsLabel}>Enable travel approvals</ThemedText>
          <Switch
            value={settingTravelApprovals}
            onValueChange={setSettingTravelApprovals}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={settingTravelApprovals ? accentColor : colors.textTertiary}
          />
        </View>
        <View style={[s.settingsDivider, { backgroundColor: colors.divider }]} />
        <View style={s.settingsRow}>
          <ThemedText style={s.settingsLabel}>Require work order approval</ThemedText>
          <Switch
            value={settingWOApproval}
            onValueChange={setSettingWOApproval}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={settingWOApproval ? accentColor : colors.textTertiary}
          />
        </View>
      </View>
    </View>
  );

  // ===================================================================
  // RENDER — MAIN
  // ===================================================================

  return (
    <View style={s.container}>
      {/* === Header === */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <ThemedText style={s.headerTitle}>Operations</ThemedText>
          <View style={s.headerActions}>
            <Pressable
              style={({ pressed }) => [s.filterBtn, pressed && { opacity: 0.7 }]}
              onPress={handleFilterToggle}
            >
              <IconSymbol name="slider.horizontal.3" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.createBtn, { backgroundColor: accentColor }, pressed && { opacity: 0.8 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="plus" size={14} color="#000" />
              <ThemedText style={s.createBtnText}>Create</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Scope chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.scopeBar}
        >
          {scopeChips.map((chip, i) => (
            <Pressable
              key={chip.key}
              style={[
                s.scopeChip,
                i === activeScope
                  ? { backgroundColor: accentColor }
                  : { backgroundColor: colors.backgroundTertiary },
              ]}
              onPress={() => handleScopePress(i)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: i === activeScope ? '#000' : colors.textSecondary },
                ]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search bar */}
        <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search ops..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* === Tab Nav === */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabBar}
        style={s.tabBarContainer}
      >
        {OPS_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              s.tabPill,
              activeTab === tab.id
                ? { backgroundColor: accentColor }
                : { backgroundColor: colors.backgroundTertiary },
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <ThemedText
              style={[
                s.tabPillText,
                { color: activeTab === tab.id ? '#000' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* === Tab Content === */}
      <View style={s.contentArea}>
        {renderTabContent()}
      </View>

      {/* === Filter Bottom Sheet === */}
      <BottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title="Filter Operations"
        useModal
      >
        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Sort</ThemedText>
          {([
            { key: 'due-soonest' as SortOption, label: 'Due soonest' },
            { key: 'recent-activity' as SortOption, label: 'Recent activity' },
            { key: 'a-z' as SortOption, label: 'A–Z' },
          ]).map((opt) => (
            <Pressable
              key={opt.key}
              style={s.filterRadioRow}
              onPress={() => setFilterSort(opt.key)}
            >
              <View
                style={[
                  s.radioOuter,
                  { borderColor: filterSort === opt.key ? accentColor : colors.textTertiary },
                ]}
              >
                {filterSort === opt.key && (
                  <View style={[s.radioInner, { backgroundColor: accentColor }]} />
                )}
              </View>
              <ThemedText style={s.filterRadioLabel}>{opt.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Status</ThemedText>
          <View style={s.filterChipsWrap}>
            {(['draft', 'active', 'blocked', 'complete', 'archived'] as OpsStatus[]).map((st) => {
              const fg = STATUS_COLOR_MAP[st];
              const selected = filterStatuses.includes(st);
              return (
                <Pressable
                  key={st}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: selected ? fg + '20' : colors.backgroundTertiary,
                      borderColor: selected ? fg + '40' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleFilterStatus(st)}
                >
                  <View style={[s.filterDot, { backgroundColor: fg }]} />
                  <ThemedText
                    style={[s.filterChipText, { color: selected ? fg : colors.textSecondary }]}
                  >
                    {st}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Priority</ThemedText>
          <View style={s.filterChipsWrap}>
            {(['P0', 'P1', 'P2', 'P3'] as OpsPriority[]).map((pr) => {
              const fg = PRIORITY_COLOR_MAP[pr];
              const selected = filterPriorities.includes(pr);
              return (
                <Pressable
                  key={pr}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: selected ? fg + '20' : colors.backgroundTertiary,
                      borderColor: selected ? fg + '40' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleFilterPriority(pr)}
                >
                  <View style={[s.filterDot, { backgroundColor: fg }]} />
                  <ThemedText
                    style={[s.filterChipText, { color: selected ? fg : colors.textSecondary }]}
                  >
                    {pr}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.filterFooter}>
          <Pressable
            style={({ pressed }) => [s.filterClearBtn, pressed && { opacity: 0.7 }]}
            onPress={handleClearFilters}
          >
            <ThemedText style={[s.filterClearText, { color: colors.textSecondary }]}>Clear</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              s.filterApplyBtn,
              { backgroundColor: accentColor },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setFilterVisible(false)}
          >
            <ThemedText style={s.filterApplyText}>Apply</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // === Layout ===
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },

  // === Scope Chips ===
  scopeBar: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Search ===
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 36,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // === Tab Bar ===
  tabBarContainer: {
    flexGrow: 0,
    marginTop: Spacing.sm,
  },
  tabBar: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Content Area ===
  contentArea: {
    flex: 1,
    marginTop: Spacing.sm,
  },
  tabContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // === Dashboard ===
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dashboardCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  dashIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  dashValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dashSub: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

  // === Quick Stats ===
  quickStatsRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.sm,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  quickStatHighlight: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },

  // === List Cards ===
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  listCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  listCardInfo: {
    flex: 1,
    gap: 4,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  listCardSub: {
    fontSize: 12,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  listCardAgenda: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  listIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  // === Task-specific ===
  taskOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
  },
  taskBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  taskDue: {
    fontSize: 12,
  },
  unitLine: {
    fontSize: 11,
    marginTop: 2,
  },
  resolutionLine: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // === Work Orders ===
  woTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },

  // === Category Chip ===
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // === Badges ===
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // === Audit ===
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  auditIconCircle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  auditInfo: {
    flex: 1,
    gap: 2,
  },
  auditDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  auditMeta: {
    fontSize: 11,
  },

  // === Settings ===
  settingsHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // === Empty State ===
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 240,
  },

  // === Filter Sheet ===
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  filterRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  filterRadioLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  filterClearBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  filterClearText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterApplyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  filterApplyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
});
