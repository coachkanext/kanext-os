/**
 * Sports Organization Facilities V2 — 6-view sub-tab hub.
 * Sub-tabs: Overview | Spaces | Schedule | Work Orders | Game Day | Access
 * RBAC: R1 full 6-tab, R2 (Player) Overview + Schedule + Game Day,
 *        R3 (Asst Coach) all except Access, R4/R5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { SportsRoleLens } from '@/utils/sports-rbac';
import { canSeeSensitive, canSeeCoachActions, canSeeAdminActions } from '@/utils/sports-rbac';
import {
  getFacilitiesOverview,
  getFacilities,
  getFacilitySchedule,
  getWorkOrders,
  getGameDayItems,
  getAccessRecords,
  FACILITY_TYPE_LABEL,
  FACILITY_TYPE_COLOR,
  WORK_ORDER_SEVERITY_LABEL,
  WORK_ORDER_SEVERITY_COLOR,
  WORK_ORDER_STATUS_LABEL,
  WORK_ORDER_STATUS_COLOR,
  GAME_DAY_CATEGORY_LABEL,
  GAME_DAY_CATEGORY_COLOR,
  GAME_DAY_STATUS_LABEL,
  GAME_DAY_STATUS_COLOR,
} from '@/data/mock-sports-org-facilities-v2';
import type {
  Facility,
  FacilityScheduleItem,
  WorkOrder,
  GameDayItem,
  AccessRecord,
} from '@/data/mock-sports-org-facilities-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'spaces', label: 'Spaces' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'work-orders', label: 'Work Orders' },
  { id: 'game-day', label: 'Game Day' },
  { id: 'access', label: 'Access' },
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
  const overview = useMemo(() => getFacilitiesOverview(), []);
  const gameDayItems = useMemo(() => getGameDayItems(), []);
  const gameDayPending = gameDayItems.filter((g) => g.status !== 'ready').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Grid */}
      <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.kpiCardTitle, { color: colors.text }]}>Facilities Overview</ThemedText>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>{overview.total}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Facilities</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#22c55e' }]}>{overview.active}</ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.conflicts > 0 ? '#ef4444' : '#22c55e' }]}>
              {overview.conflicts}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Schedule Conflicts</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.workOrders > 0 ? '#f59e0b' : '#22c55e' }]}>
              {overview.workOrders}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Open Work Orders</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: gameDayPending > 0 ? '#f59e0b' : '#22c55e' }]}>
              {gameDayPending}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Game Day Pending</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.safety > 0 ? '#ef4444' : '#22c55e' }]}>
              {overview.safety}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>High-Risk Access</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// SPACES SUB-TAB
// =============================================================================

function SpacesTab({
  colors,
  accentColor,
  facilities,
  onSelectFacility,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  facilities: Facility[];
  onSelectFacility: (facility: Facility) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Facility }) => {
      const typeColor = FACILITY_TYPE_COLOR[item.type];
      const typeLabel = FACILITY_TYPE_LABEL[item.type];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectFacility(item);
          }}
        >
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={`CAP ${item.capacity}`} color={colors.textSecondary} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.accessOwner}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.hours}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectFacility],
  );

  return (
    <FlatList
      data={facilities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No facilities available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SCHEDULE SUB-TAB
// =============================================================================

function ScheduleTab({
  colors,
  accentColor,
  scheduleItems,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  scheduleItems: FacilityScheduleItem[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: FacilityScheduleItem }) => {
      return (
        <View
          style={[
            s.card,
            {
              backgroundColor: colors.card,
              borderColor: item.conflict ? '#ef4444' : colors.border,
              borderWidth: item.conflict ? 2 : 1,
            },
          ]}
        >
          <View style={s.scheduleHeader}>
            <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {item.facilityName}
            </ThemedText>
            {item.conflict && (
              <StatusBadge label="CONFLICT" color="#ef4444" />
            )}
          </View>
          <ThemedText style={[s.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.purpose}
          </ThemedText>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{formatDate(item.date)}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.timeSlot}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="person.2.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.team}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={scheduleItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="calendar" label="No schedule items" colors={colors} />
      }
    />
  );
}

// =============================================================================
// WORK ORDERS SUB-TAB
// =============================================================================

function WorkOrdersTab({
  colors,
  accentColor,
  workOrders,
  onSelectWorkOrder,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  workOrders: WorkOrder[];
  onSelectWorkOrder: (wo: WorkOrder) => void;
}) {
  const sorted = useMemo(() => {
    const sevOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
    const statusOrder: Record<string, number> = { new: 0, 'in-progress': 1, blocked: 2, complete: 3 };
    return [...workOrders].sort((a, b) => {
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return sevOrder[a.severity] - sevOrder[b.severity];
    });
  }, [workOrders]);

  const renderItem = useCallback(
    ({ item }: { item: WorkOrder }) => {
      const sevColor = WORK_ORDER_SEVERITY_COLOR[item.severity];
      const sevLabel = WORK_ORDER_SEVERITY_LABEL[item.severity];
      const statusColor = WORK_ORDER_STATUS_COLOR[item.status];
      const statusLabel = WORK_ORDER_STATUS_LABEL[item.status];
      return (
        <Pressable
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectWorkOrder(item);
          }}
        >
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.issueType}
          </ThemedText>
          <ThemedText style={[s.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.location}
          </ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>SLA {formatDate(item.slaDate)}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectWorkOrder],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="wrench.and.screwdriver.fill" label="No work orders" colors={colors} />
      }
    />
  );
}

// =============================================================================
// GAME DAY SUB-TAB
// =============================================================================

function GameDayTab({
  colors,
  accentColor,
  gameDayItems,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  gameDayItems: GameDayItem[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: GameDayItem }) => {
      const catColor = GAME_DAY_CATEGORY_COLOR[item.category];
      const catLabel = GAME_DAY_CATEGORY_LABEL[item.category];
      const statusColor = GAME_DAY_STATUS_COLOR[item.status];
      const statusLabel = GAME_DAY_STATUS_LABEL[item.status];
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.item}
          </ThemedText>
          <View style={s.badgeRow}>
            <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.owner}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={gameDayItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="sportscourt.fill" label="No game day items" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ACCESS SUB-TAB
// =============================================================================

function AccessTab({
  colors,
  accentColor,
  accessRecords,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  accessRecords: AccessRecord[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: AccessRecord }) => {
      return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.accessHeader}>
            <ThemedText style={[s.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {item.person}
            </ThemedText>
            {item.highRisk && (
              <StatusBadge label="HIGH RISK" color="#ef4444" />
            )}
            {!item.highRisk && (
              <StatusBadge label="STANDARD" color="#22c55e" />
            )}
          </View>
          <ThemedText style={[s.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.facilityName}
          </ThemedText>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>{item.accessWindow}</ThemedText>
            </View>
            <View style={s.metaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>Changed {formatDate(item.lastChanged)}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={accessRecords}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="key.fill" label="No access records" colors={colors} />
      }
    />
  );
}

// =============================================================================
// FACILITY DETAIL BOTTOM SHEET
// =============================================================================

function FacilityDetailSheet({
  visible,
  onClose,
  facility,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  facility: Facility | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!facility) return null;

  const typeColor = FACILITY_TYPE_COLOR[facility.type];
  const typeLabel = FACILITY_TYPE_LABEL[facility.type];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={facility.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={`CAPACITY ${facility.capacity}`} color={accentColor} />
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
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{facility.capacity}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Capacity</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{facility.accessOwner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Access Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{facility.hours}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Hours</ThemedText>
          </View>
        </View>
      </View>

      {/* Notes / Constraints */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Notes</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {facility.constraints}
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
// WORK ORDER DETAIL BOTTOM SHEET
// =============================================================================

function WorkOrderDetailSheet({
  visible,
  onClose,
  workOrder,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!workOrder) return null;

  const sevColor = WORK_ORDER_SEVERITY_COLOR[workOrder.severity];
  const sevLabel = WORK_ORDER_SEVERITY_LABEL[workOrder.severity];
  const statusColor = WORK_ORDER_STATUS_COLOR[workOrder.status];
  const statusLabel = WORK_ORDER_STATUS_LABEL[workOrder.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Work Order" useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Issue */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Issue</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {workOrder.issueType}
        </ThemedText>
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{workOrder.location}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Facility</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{workOrder.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Assigned To</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{workOrder.reporter}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Reporter</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(workOrder.reportDate)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Reported</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(workOrder.slaDate)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>SLA Date</ThemedText>
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
// MAIN EXPORT
// =============================================================================

export function SportsOrgFacilitiesV2({ colors, accentColor, role = 'R3' }: Props) {
  // === RBAC Gate: non-coaching roles locked ===
  if (!canSeeCoachActions(role)) {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Facilities</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Facility information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilitySheetVisible, setFacilitySheetVisible] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [workOrderSheetVisible, setWorkOrderSheetVisible] = useState(false);

  // === Data ===
  const facilities = useMemo(() => getFacilities(), []);
  const scheduleItems = useMemo(() => getFacilitySchedule(), []);
  const workOrders = useMemo(() => getWorkOrders(), []);
  const gameDayItems = useMemo(() => getGameDayItems(), []);
  const accessRecords = useMemo(() => getAccessRecords(), []);

  // === Callbacks ===
  const handleSelectFacility = useCallback((facility: Facility) => {
    setSelectedFacility(facility);
    setFacilitySheetVisible(true);
  }, []);

  const handleCloseFacilitySheet = useCallback(() => {
    setFacilitySheetVisible(false);
  }, []);

  const handleSelectWorkOrder = useCallback((wo: WorkOrder) => {
    setSelectedWorkOrder(wo);
    setWorkOrderSheetVisible(true);
  }, []);

  const handleCloseWorkOrderSheet = useCallback(() => {
    setWorkOrderSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (canSeeSensitive(role)) return SUB_TABS; // R0-R3: full 6 tabs
    if (role === 'R4') {
      // R4 (Assistant Coach/RC): all except Access
      return SUB_TABS.filter((t) => t.id !== 'access');
    }
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'spaces':
        return (
          <SpacesTab
            colors={colors}
            accentColor={accentColor}
            facilities={facilities}
            onSelectFacility={handleSelectFacility}
          />
        );
      case 'schedule':
        return (
          <ScheduleTab
            colors={colors}
            accentColor={accentColor}
            scheduleItems={scheduleItems}
          />
        );
      case 'work-orders':
        return (
          <WorkOrdersTab
            colors={colors}
            accentColor={accentColor}
            workOrders={workOrders}
            onSelectWorkOrder={handleSelectWorkOrder}
          />
        );
      case 'game-day':
        return (
          <GameDayTab
            colors={colors}
            accentColor={accentColor}
            gameDayItems={gameDayItems}
          />
        );
      case 'access':
        if (!canSeeAdminActions(role)) return null;
        return (
          <AccessTab
            colors={colors}
            accentColor={accentColor}
            accessRecords={accessRecords}
          />
        );
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

      {/* Facility Detail Bottom Sheet */}
      <FacilityDetailSheet
        visible={facilitySheetVisible}
        onClose={handleCloseFacilitySheet}
        facility={selectedFacility}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Work Order Detail Bottom Sheet */}
      <WorkOrderDetailSheet
        visible={workOrderSheetVisible}
        onClose={handleCloseWorkOrderSheet}
        workOrder={selectedWorkOrder}
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

  // -- Overview / Drill mode --
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

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
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

  // -- KPI Card --
  kpiCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  kpiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiItem: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Card --
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },

  // -- Schedule --
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },

  // -- Access --
  accessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 14,
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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  sheetDetailLabel: {
    fontSize: 11,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sheetGhostButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
