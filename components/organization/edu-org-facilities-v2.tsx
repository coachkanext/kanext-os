/**
 * Education Organization Facilities V2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Buildings | Rooms | Assets | Work Orders |
 *           Maintenance | Inspections | Vendors | Safety & Access | Projects
 * RBAC:
 *   E5 (Public): Locked
 *   E4 (Student): Overview + Buildings + Rooms (read-only)
 *   E3 (Faculty/Staff): All except restricted admin areas
 *   E2 (Provost/Dean): Full 10 sub-tabs
 *   E1 (President/Chancellor): Full 10 sub-tabs
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel, isEnrolled } from '@/utils/education-rbac';
import {
  getEduFacilitiesData,
  BUILDING_TYPE_LABELS,
  BUILDING_TYPE_ICONS,
  BUILDING_TYPE_COLORS,
  BUILDING_STATUS_LABELS,
  BUILDING_STATUS_COLORS,
  BUILDING_STATUS_ICONS,
  SYSTEM_TYPE_LABELS,
  SYSTEM_TYPE_COLORS,
  ROOM_TYPE_LABELS,
  ROOM_TYPE_ICONS,
  ROOM_TYPE_COLORS,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
  ACCESS_LEVEL_LABELS,
  ACCESS_LEVEL_COLORS,
  ASSET_CATEGORY_LABELS,
  ASSET_CATEGORY_ICONS,
  ASSET_CATEGORY_COLORS,
  ASSET_CONDITION_LABELS,
  ASSET_CONDITION_COLORS,
  WORK_ORDER_CATEGORY_LABELS,
  WORK_ORDER_CATEGORY_ICONS,
  WORK_ORDER_CATEGORY_COLORS,
  WORK_ORDER_PRIORITY_LABELS,
  WORK_ORDER_PRIORITY_COLORS,
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_COLORS,
  INSPECTION_TYPE_LABELS,
  INSPECTION_TYPE_ICONS,
  INSPECTION_TYPE_COLORS,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_COLORS,
  VENDOR_STATUS_LABELS,
  VENDOR_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from '@/data/mock-edu-org-facilities-v2';
import type {
  Building,
  FacilityRoom,
  FacilityAsset,
  WorkOrder,
  MaintenanceTask,
  Inspection,
  FacilityVendor,
  SafetyZone,
  AccessGroup,
  CapitalProject,
  TodayImpact,
} from '@/data/mock-edu-org-facilities-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'buildings', label: 'Buildings' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'assets', label: 'Assets' },
  { id: 'work-orders', label: 'Work Orders' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'inspections', label: 'Inspections' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'safety-access', label: 'Safety & Access' },
  { id: 'projects', label: 'Projects' },
];

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
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date('2026-02-18');
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getBuildingName(buildingId: string, buildings: Building[]): string {
  return buildings.find((b) => b.id === buildingId)?.name ?? buildingId;
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
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getEduFacilitiesData>;
}) {
  const posture = data.posture;
  const postureColor = BUILDING_STATUS_COLORS[posture.status];

  // Health tiles
  const healthTiles: { label: string; value: number; color: string; icon: string }[] = [
    { label: 'Critical WOs', value: posture.criticalWorkOrders, color: '#EF4444', icon: 'exclamationmark.triangle.fill' },
    { label: 'Inspections Due', value: posture.inspectionsDue, color: '#1D9BF0', icon: 'checkmark.shield.fill' },
    { label: 'Areas Down', value: posture.areasDown, color: '#EF4444', icon: 'nosign' },
    { label: 'Buildings', value: data.buildings.length, color: '#22C55E', icon: 'building.2.fill' },
    { label: 'Open WOs', value: data.workOrders.filter((w) => w.status !== 'complete' && w.status !== 'closed').length, color: '#F59E0B', icon: 'wrench.and.screwdriver.fill' },
    { label: 'Vendors', value: data.vendors.length, color: '#1D9BF0', icon: 'person.2.fill' },
  ];

  // Today's Impact
  const todayImpact = data.todayImpact;

  // Top Risks
  const riskFlags: { label: string; color: string }[] = [];
  if (posture.criticalWorkOrders > 0) {
    riskFlags.push({ label: `${posture.criticalWorkOrders} critical work order(s)`, color: '#EF4444' });
  }
  const failedInspections = data.inspections.filter((i) => i.status === 'failed');
  if (failedInspections.length > 0) {
    riskFlags.push({ label: `${failedInspections.length} failed inspection(s)`, color: '#EF4444' });
  }
  const dueInspections = data.inspections.filter((i) => i.status === 'due');
  if (dueInspections.length > 0) {
    riskFlags.push({ label: `${dueInspections.length} inspection(s) coming due`, color: '#F59E0B' });
  }
  const expiringVendors = data.vendors.filter((v) => v.status === 'expiring');
  if (expiringVendors.length > 0) {
    riskFlags.push({ label: `${expiringVendors.length} vendor contract(s) expiring`, color: '#F59E0B' });
  }
  const missedMaint = data.maintenance.filter((m) => m.status === 'missed');
  if (missedMaint.length > 0) {
    riskFlags.push({ label: `${missedMaint.length} missed maintenance task(s)`, color: '#EF4444' });
  }
  const unverifiedVendors = data.vendors.filter((v) => !v.insuranceVerified);
  if (unverifiedVendors.length > 0) {
    riskFlags.push({ label: `${unverifiedVendors.length} vendor(s) insurance not verified`, color: '#EF4444' });
  }

  // Quick Actions
  const quickActions = [
    { label: 'New Work Order', icon: 'plus.circle.fill' },
    { label: 'Schedule Inspection', icon: 'checkmark.shield.fill' },
    { label: 'View Maintenance', icon: 'wrench.fill' },
    { label: 'Campus Map', icon: 'map.fill' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Posture Card */}
      <View style={[s.postureCard, { backgroundColor: colors.card, borderColor: postureColor + '40' }]}>
        <View style={s.postureHeader}>
          <View style={[s.postureIconCircle, { backgroundColor: postureColor + '18' }]}>
            <IconSymbol name={BUILDING_STATUS_ICONS[posture.status] as any} size={20} color={postureColor} />
          </View>
          <View style={s.postureTextCol}>
            <ThemedText style={[s.postureTitle, { color: colors.text }]}>Campus Facilities</ThemedText>
            <ThemedText style={[s.postureStatus, { color: postureColor }]}>
              Status: {BUILDING_STATUS_LABELS[posture.status].toUpperCase()}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Health Strip */}
      <View style={s.healthStrip}>
        {healthTiles.map((tile, i) => (
          <View key={i} style={[s.healthTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={tile.icon as any} size={14} color={tile.color} />
            <ThemedText style={[s.healthTileValue, { color: tile.value > 0 ? tile.color : colors.text }]}>
              {tile.value}
            </ThemedText>
            <ThemedText style={[s.healthTileLabel, { color: colors.textTertiary }]} numberOfLines={1}>
              {tile.label}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Today's Impact */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Today's Impact</ThemedText>
      {todayImpact.length > 0 ? (
        todayImpact.map((item) => {
          const sevColor = WORK_ORDER_PRIORITY_COLORS[item.severity];
          return (
            <View
              key={item.id}
              style={[s.impactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[s.impactSeverityBar, { backgroundColor: sevColor }]} />
              <View style={s.impactContent}>
                <View style={s.impactHeader}>
                  <ThemedText style={[s.impactTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <StatusBadge
                    label={WORK_ORDER_PRIORITY_LABELS[item.severity].toUpperCase()}
                    color={sevColor}
                  />
                </View>
                <ThemedText style={[s.impactDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <ThemedText style={[s.impactBuilding, { color: colors.textTertiary }]}>
                  {getBuildingName(item.buildingId, data.buildings)}
                </ThemedText>
              </View>
            </View>
          );
        })
      ) : (
        <ThemedText style={[s.emptyInlineText, { color: colors.textSecondary }]}>
          No impact items today.
        </ThemedText>
      )}

      {/* Top Risks */}
      {riskFlags.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Top Risks
          </ThemedText>
          {riskFlags.map((flag, i) => (
            <View
              key={i}
              style={[s.riskFlagRow, { borderColor: colors.border }]}
            >
              <View style={[s.riskFlagDot, { backgroundColor: flag.color }]} />
              <ThemedText style={[s.riskFlagText, { color: colors.text }]}>{flag.label}</ThemedText>
            </View>
          ))}
        </>
      )}

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionsRow}>
        {quickActions.map((action, i) => (
          <Pressable
            key={i}
            style={[s.quickActionBtn, { backgroundColor: accentColor + '12', borderColor: accentColor + '30' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={action.icon as any} size={18} color={accentColor} />
            <ThemedText style={[s.quickActionText, { color: accentColor }]}>{action.label}</ThemedText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// BUILDINGS SUB-TAB
// =============================================================================

function BuildingsTab({
  colors,
  accentColor,
  buildings,
  onSelectBuilding,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  buildings: Building[];
  onSelectBuilding: (building: Building) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Building }) => {
      const typeColor = BUILDING_TYPE_COLORS[item.type];
      const statusColor = BUILDING_STATUS_COLORS[item.status];
      const conditionColor = item.condition >= 80 ? '#22C55E' : item.condition >= 60 ? '#F59E0B' : '#EF4444';
      return (
        <Pressable
          style={[s.buildingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectBuilding(item);
          }}
        >
          {/* Top Row */}
          <View style={s.buildingCardTop}>
            <View style={[s.buildingIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name={BUILDING_TYPE_ICONS[item.type] as any} size={18} color={typeColor} />
            </View>
            <View style={s.buildingNameCol}>
              <ThemedText style={[s.buildingName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.buildingCampus, { color: colors.textSecondary }]}>
                {item.campus}
              </ThemedText>
            </View>
          </View>

          {/* Badge Row */}
          <View style={s.buildingBadgeRow}>
            <StatusBadge label={BUILDING_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
            <StatusBadge label={BUILDING_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
          </View>

          {/* Condition Bar */}
          <View style={s.conditionRow}>
            <ThemedText style={[s.conditionLabel, { color: colors.textTertiary }]}>Condition</ThemedText>
            <ThemedText style={[s.conditionValue, { color: conditionColor }]}>{item.condition}%</ThemedText>
          </View>
          <ProgressBar percent={item.condition} color={conditionColor} />

          {/* System Status Badges */}
          <View style={s.systemBadgeRow}>
            {item.systems.map((sys, i) => {
              const sysColor = BUILDING_STATUS_COLORS[sys.status];
              return (
                <View key={i} style={[s.systemBadge, { backgroundColor: sysColor + '15', borderColor: sysColor + '30' }]}>
                  <View style={[s.systemDot, { backgroundColor: sysColor }]} />
                  <ThemedText style={[s.systemBadgeText, { color: sysColor }]}>
                    {SYSTEM_TYPE_LABELS[sys.type]}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          {/* Details Row */}
          <View style={[s.buildingDetails, { borderTopColor: colors.border }]}>
            <View style={s.buildingDetailItem}>
              <ThemedText style={[s.buildingDetailValue, { color: colors.text }]}>{item.workOrderCount}</ThemedText>
              <ThemedText style={[s.buildingDetailLabel, { color: colors.textTertiary }]}>Work Orders</ThemedText>
            </View>
            <View style={s.buildingDetailItem}>
              <ThemedText style={[s.buildingDetailValue, { color: colors.text }]}>
                {formatDate(item.nextInspection)}
              </ThemedText>
              <ThemedText style={[s.buildingDetailLabel, { color: colors.textTertiary }]}>Next Inspection</ThemedText>
            </View>
            <View style={s.buildingDetailItem}>
              <ThemedText style={[s.buildingDetailValue, { color: colors.text }]}>{item.yearBuilt}</ThemedText>
              <ThemedText style={[s.buildingDetailLabel, { color: colors.textTertiary }]}>Year Built</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectBuilding],
  );

  return (
    <FlatList
      data={buildings}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No buildings found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ROOMS SUB-TAB
// =============================================================================

function RoomsTab({
  colors,
  accentColor,
  rooms,
  buildings,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  rooms: FacilityRoom[];
  buildings: Building[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: FacilityRoom }) => {
      const typeColor = ROOM_TYPE_COLORS[item.type];
      const statusColor = ROOM_STATUS_COLORS[item.status];
      const accessColor = ACCESS_LEVEL_COLORS[item.accessLevel];
      const buildingName = getBuildingName(item.buildingId, buildings);
      return (
        <View style={[s.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Top Row */}
          <View style={s.roomCardTop}>
            <View style={[s.roomIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name={ROOM_TYPE_ICONS[item.type] as any} size={18} color={typeColor} />
            </View>
            <View style={s.roomNameCol}>
              <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.roomBuilding, { color: colors.textSecondary }]}>
                {buildingName}
              </ThemedText>
            </View>
          </View>

          {/* Badge Row */}
          <View style={s.roomBadgeRow}>
            <StatusBadge label={ROOM_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
            <StatusBadge label={ROOM_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
            <StatusBadge label={ACCESS_LEVEL_LABELS[item.accessLevel].toUpperCase()} color={accessColor} />
          </View>

          {/* Details Row */}
          <View style={[s.roomDetails, { borderTopColor: colors.border }]}>
            <View style={s.roomDetailItem}>
              <ThemedText style={[s.roomDetailValue, { color: colors.text }]}>{item.capacity}</ThemedText>
              <ThemedText style={[s.roomDetailLabel, { color: colors.textTertiary }]}>Capacity</ThemedText>
            </View>
            <View style={s.roomDetailItem}>
              <ThemedText style={[s.roomDetailValue, { color: colors.text }]}>Floor {item.floor}</ThemedText>
              <ThemedText style={[s.roomDetailLabel, { color: colors.textTertiary }]}>Level</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, buildings],
  );

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="door.left.hand.open" label="No rooms found" colors={colors} />
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
  assets,
  buildings,
  role,
  onSelectAsset,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  assets: FacilityAsset[];
  buildings: Building[];
  role: EducationRoleLens;
  onSelectAsset: (asset: FacilityAsset) => void;
}) {
  const showValue = isDeanLevel(role);

  const renderItem = useCallback(
    ({ item }: { item: FacilityAsset }) => {
      const catColor = ASSET_CATEGORY_COLORS[item.category];
      const condColor = ASSET_CONDITION_COLORS[item.condition];
      const warrantyDays = daysUntil(item.warrantyExpiry);
      const warrantyExpired = warrantyDays < 0;
      return (
        <Pressable
          style={[s.assetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectAsset(item);
          }}
        >
          {/* Header */}
          <View style={s.assetHeader}>
            <View style={[s.assetIconCircle, { backgroundColor: catColor + '18' }]}>
              <IconSymbol name={ASSET_CATEGORY_ICONS[item.category] as any} size={16} color={catColor} />
            </View>
            <View style={s.assetNameCol}>
              <ThemedText style={[s.assetName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.assetLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.location}
              </ThemedText>
            </View>
          </View>

          {/* Badge Row */}
          <View style={s.assetBadgeRow}>
            <StatusBadge
              label={ASSET_CATEGORY_LABELS[item.category].toUpperCase()}
              color={catColor}
            />
            <StatusBadge
              label={ASSET_CONDITION_LABELS[item.condition].toUpperCase()}
              color={condColor}
            />
          </View>

          {/* Details */}
          <View style={s.assetDetailsGrid}>
            <View style={s.assetDetailCol}>
              <ThemedText style={[s.assetDetailLabel, { color: colors.textTertiary }]}>Warranty</ThemedText>
              <ThemedText style={[s.assetDetailValue, { color: warrantyExpired ? '#EF4444' : colors.text }]}>
                {warrantyExpired ? 'EXPIRED' : formatDate(item.warrantyExpiry)}
              </ThemedText>
            </View>
            <View style={s.assetDetailCol}>
              <ThemedText style={[s.assetDetailLabel, { color: colors.textTertiary }]}>Maintenance</ThemedText>
              <ThemedText style={[s.assetDetailValue, { color: colors.text }]}>{item.maintenanceCadence}</ThemedText>
            </View>
            <View style={s.assetDetailCol}>
              <ThemedText style={[s.assetDetailLabel, { color: colors.textTertiary }]}>Last Service</ThemedText>
              <ThemedText style={[s.assetDetailValue, { color: colors.text }]}>{formatDate(item.lastService)}</ThemedText>
            </View>
          </View>

          {/* Value (RBAC-gated) */}
          {showValue && (
            <ThemedText style={[s.assetValueText, { color: accentColor }]}>
              Value: {formatCurrency(item.value)}
            </ThemedText>
          )}
        </Pressable>
      );
    },
    [colors, accentColor, showValue, onSelectAsset],
  );

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="archivebox.fill" label="No assets on record" colors={colors} />
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
  buildings,
  onSelectWorkOrder,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  workOrders: WorkOrder[];
  buildings: Building[];
  onSelectWorkOrder: (wo: WorkOrder) => void;
}) {
  const sorted = useMemo(() => {
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, normal: 2 };
    return [...workOrders]
      .filter((w) => w.status !== 'complete' && w.status !== 'closed')
      .sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
  }, [workOrders]);

  const renderItem = useCallback(
    ({ item }: { item: WorkOrder }) => {
      const prioColor = WORK_ORDER_PRIORITY_COLORS[item.priority];
      const statusColor = WORK_ORDER_STATUS_COLORS[item.status];
      const catColor = WORK_ORDER_CATEGORY_COLORS[item.category];
      const slaDays = daysUntil(item.dueDate);
      const buildingName = getBuildingName(item.buildingId, buildings);
      return (
        <Pressable
          style={[s.woCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectWorkOrder(item);
          }}
        >
          {/* Priority bar */}
          <View style={[s.woSeverityBar, { backgroundColor: prioColor }]} />
          <View style={s.woContent}>
            <View style={s.woHeader}>
              <ThemedText style={[s.woTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <StatusBadge
                label={WORK_ORDER_STATUS_LABELS[item.status].toUpperCase()}
                color={statusColor}
              />
            </View>
            <View style={s.woBadgeRow}>
              <StatusBadge
                label={WORK_ORDER_CATEGORY_LABELS[item.category].toUpperCase()}
                color={catColor}
              />
              <StatusBadge
                label={WORK_ORDER_PRIORITY_LABELS[item.priority].toUpperCase()}
                color={prioColor}
              />
            </View>
            <ThemedText style={[s.woMeta, { color: colors.textSecondary }]}>
              {buildingName} — {item.assignee}
            </ThemedText>
            <ThemedText style={[s.woDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
            <View style={s.woFooter}>
              <ThemedText style={[s.woSla, { color: slaDays <= 1 ? '#EF4444' : colors.textTertiary }]}>
                SLA: {item.slaHours}h — Due: {formatDate(item.dueDate)}
              </ThemedText>
              {item.requiresEvidence && (
                <View style={s.woEvidenceRow}>
                  <IconSymbol name="camera.fill" size={10} color="#F59E0B" />
                  <ThemedText style={[s.woEvidenceText, { color: '#F59E0B' }]}>
                    Evidence required
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, buildings, onSelectWorkOrder],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="wrench.and.screwdriver.fill" label="No open work orders" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MAINTENANCE SUB-TAB
// =============================================================================

function MaintenanceTab({
  colors,
  accentColor,
  maintenance,
  buildings,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  maintenance: MaintenanceTask[];
  buildings: Building[];
}) {
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { missed: 0, scheduled: 1, done: 2 };
    return [...maintenance].sort(
      (a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9),
    );
  }, [maintenance]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Preventive Maintenance Schedule</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Sorted by urgency — missed tasks first
      </ThemedText>

      {sorted.map((task) => {
        const statusColor = MAINTENANCE_STATUS_COLORS[task.status];
        const sysColor = SYSTEM_TYPE_COLORS[task.system];
        const buildingName = getBuildingName(task.buildingId, buildings);
        const isMissed = task.status === 'missed';
        return (
          <View
            key={task.id}
            style={[
              s.maintCard,
              {
                backgroundColor: isMissed ? '#EF444408' : colors.card,
                borderColor: isMissed ? '#EF444430' : colors.border,
              },
            ]}
          >
            {/* Left indicator */}
            <View style={[s.maintIndicator, { backgroundColor: statusColor }]} />
            <View style={s.maintContent}>
              <View style={s.maintHeader}>
                <ThemedText style={[s.maintTitle, { color: colors.text }]} numberOfLines={1}>
                  {task.title}
                </ThemedText>
                <StatusBadge
                  label={MAINTENANCE_STATUS_LABELS[task.status].toUpperCase()}
                  color={statusColor}
                />
              </View>
              <View style={s.maintBadgeRow}>
                <StatusBadge label={SYSTEM_TYPE_LABELS[task.system].toUpperCase()} color={sysColor} />
                <StatusBadge label={task.frequency.toUpperCase()} color={accentColor} />
              </View>
              <ThemedText style={[s.maintMeta, { color: colors.textSecondary }]}>
                {buildingName}
              </ThemedText>
              <View style={s.maintFooter}>
                <ThemedText style={[s.maintDate, { color: colors.textTertiary }]}>
                  Scheduled: {formatDate(task.scheduledDate)}
                </ThemedText>
                <ThemedText style={[s.maintAssignee, { color: colors.textTertiary }]}>
                  {task.assignee}
                </ThemedText>
              </View>
              {isMissed && (
                <View style={s.maintAlertRow}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#EF4444" />
                  <ThemedText style={[s.maintAlertText, { color: '#EF4444' }]}>
                    MISSED — Requires immediate rescheduling
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {sorted.length === 0 && (
        <EmptyState icon="wrench.fill" label="No maintenance tasks" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// INSPECTIONS SUB-TAB
// =============================================================================

function InspectionsTab({
  colors,
  accentColor,
  inspections,
  buildings,
  onSelectInspection,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  inspections: Inspection[];
  buildings: Building[];
  onSelectInspection: (insp: Inspection) => void;
}) {
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { failed: 0, due: 1, scheduled: 2, completed: 3 };
    return [...inspections].sort(
      (a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9),
    );
  }, [inspections]);

  const renderItem = useCallback(
    ({ item }: { item: Inspection }) => {
      const statusColor = INSPECTION_STATUS_COLORS[item.status];
      const typeColor = INSPECTION_TYPE_COLORS[item.type];
      const buildingName = getBuildingName(item.buildingId, buildings);
      const isFailed = item.status === 'failed';
      return (
        <Pressable
          style={[
            s.inspectionCard,
            {
              backgroundColor: isFailed ? '#EF444408' : colors.card,
              borderColor: isFailed ? '#EF444430' : colors.border,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectInspection(item);
          }}
        >
          <View style={[s.inspectionIcon, { backgroundColor: typeColor + '18' }]}>
            <IconSymbol name={INSPECTION_TYPE_ICONS[item.type] as any} size={20} color={typeColor} />
          </View>
          <View style={s.inspectionTextCol}>
            <ThemedText style={[s.inspectionType, { color: colors.text }]}>
              {INSPECTION_TYPE_LABELS[item.type]}
            </ThemedText>
            <ThemedText style={[s.inspectionBuilding, { color: colors.textSecondary }]}>
              {buildingName}
            </ThemedText>
            <View style={s.inspectionBadgeRow}>
              <StatusBadge
                label={INSPECTION_STATUS_LABELS[item.status].toUpperCase()}
                color={statusColor}
              />
            </View>
            <ThemedText style={[s.inspectionMeta, { color: colors.textTertiary }]}>
              Due: {formatDate(item.dueDate)}
              {item.inspector ? ` — ${item.inspector}` : ''}
            </ThemedText>
            {item.result && (
              <ThemedText style={[s.inspectionResult, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.result}
              </ThemedText>
            )}
            {isFailed && item.remediationWorkOrderId && (
              <View style={s.inspectionComplianceRow}>
                <IconSymbol name="link" size={11} color="#EF4444" />
                <ThemedText style={[s.inspectionComplianceText, { color: '#EF4444' }]}>
                  Linked to Work Order {item.remediationWorkOrderId}
                </ThemedText>
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [colors, buildings, onSelectInspection],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="checkmark.shield.fill" label="No inspections on record" colors={colors} />
      }
    />
  );
}

// =============================================================================
// VENDORS SUB-TAB
// =============================================================================

function VendorsTab({
  colors,
  accentColor,
  vendors,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  vendors: FacilityVendor[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: FacilityVendor }) => {
      const statusColor = VENDOR_STATUS_COLORS[item.status];
      return (
        <View style={[s.vendorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.vendorHeader}>
            <View style={s.vendorNameCol}>
              <ThemedText style={[s.vendorName, { color: colors.text }]}>{item.name}</ThemedText>
              <ThemedText style={[s.vendorSpecialty, { color: colors.textSecondary }]}>{item.specialty}</ThemedText>
            </View>
            <StatusBadge
              label={VENDOR_STATUS_LABELS[item.status].toUpperCase()}
              color={statusColor}
            />
          </View>
          <ThemedText style={[s.vendorSla, { color: colors.textSecondary }]} numberOfLines={1}>
            SLA: {item.slaTarget}
          </ThemedText>
          <View style={[s.vendorFooter, { borderTopColor: colors.border }]}>
            <View style={s.vendorFooterItem}>
              <ThemedText style={[s.vendorFooterValue, { color: colors.text }]}>
                {formatDate(item.contractExpiry)}
              </ThemedText>
              <ThemedText style={[s.vendorFooterLabel, { color: colors.textTertiary }]}>Contract Exp.</ThemedText>
            </View>
            <View style={s.vendorFooterItem}>
              <ThemedText style={[s.vendorFooterValue, { color: colors.text }]}>
                {item.jobsCompleted}
              </ThemedText>
              <ThemedText style={[s.vendorFooterLabel, { color: colors.textTertiary }]}>Jobs Done</ThemedText>
            </View>
            <View style={s.vendorFooterItem}>
              <View style={[s.coiIndicator, { backgroundColor: item.insuranceVerified ? '#22C55E20' : '#EF444420' }]}>
                <IconSymbol
                  name={item.insuranceVerified ? 'checkmark.shield.fill' : 'xmark.shield.fill'}
                  size={14}
                  color={item.insuranceVerified ? '#22C55E' : '#EF4444'}
                />
              </View>
              <ThemedText style={[s.vendorFooterLabel, { color: colors.textTertiary }]}>Insurance</ThemedText>
            </View>
          </View>
          {/* Risk Flags */}
          {item.riskFlags.length > 0 && (
            <View style={s.vendorRiskRow}>
              {item.riskFlags.map((flag, i) => (
                <StatusBadge key={i} label={flag.replace(/_/g, ' ').toUpperCase()} color="#F59E0B" />
              ))}
            </View>
          )}
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={vendors}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="building.2.fill" label="No vendors on file" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SAFETY & ACCESS SUB-TAB
// =============================================================================

function SafetyAccessTab({
  colors,
  accentColor,
  safetyZones,
  accessGroups,
  buildings,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  safetyZones: SafetyZone[];
  accessGroups: AccessGroup[];
  buildings: Building[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Safety Zones */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Safety Zones</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Restricted and hazardous areas across campus
      </ThemedText>

      {safetyZones.map((zone) => {
        const buildingName = getBuildingName(zone.buildingId, buildings);
        const typeColor = zone.type === 'hazmat' ? '#EF4444' : zone.type === 'secured' ? '#1D9BF0' : '#F59E0B';
        return (
          <View
            key={zone.id}
            style={[s.safetyZoneCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.safetyZoneHeader}>
              <View style={[s.safetyZoneIconCircle, { backgroundColor: typeColor + '18' }]}>
                <IconSymbol name="shield.fill" size={16} color={typeColor} />
              </View>
              <View style={s.safetyZoneNameCol}>
                <ThemedText style={[s.safetyZoneName, { color: colors.text }]}>{zone.name}</ThemedText>
                <ThemedText style={[s.safetyZoneBuilding, { color: colors.textSecondary }]}>
                  {buildingName}
                </ThemedText>
              </View>
              <StatusBadge label={zone.type.toUpperCase()} color={typeColor} />
            </View>
            <ThemedText style={[s.safetyZoneDesc, { color: colors.textSecondary }]} numberOfLines={3}>
              {zone.description}
            </ThemedText>
          </View>
        );
      })}

      {safetyZones.length === 0 && (
        <EmptyState icon="shield.fill" label="No safety zones defined" colors={colors} />
      )}

      {/* Access Groups */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>
        Access Groups
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Badge access group membership and zone assignments
      </ThemedText>

      {accessGroups.map((group) => (
        <View
          key={group.id}
          style={[s.accessGroupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.accessGroupHeader}>
            <View style={[s.accessGroupIconCircle, { backgroundColor: accentColor + '18' }]}>
              <IconSymbol name="person.3.fill" size={16} color={accentColor} />
            </View>
            <View style={s.accessGroupNameCol}>
              <ThemedText style={[s.accessGroupName, { color: colors.text }]}>{group.name}</ThemedText>
              <ThemedText style={[s.accessGroupMembers, { color: colors.textSecondary }]}>
                {group.members} member{group.members !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
          <View style={s.accessGroupZonesRow}>
            <ThemedText style={[s.accessGroupZonesLabel, { color: colors.textTertiary }]}>Zones:</ThemedText>
            <View style={s.accessGroupZonesList}>
              {group.zones.map((zoneId, i) => {
                const bName = getBuildingName(zoneId, buildings);
                return (
                  <View key={i} style={[s.accessGroupZoneChip, { backgroundColor: accentColor + '10' }]}>
                    <ThemedText style={[s.accessGroupZoneText, { color: accentColor }]}>{bName}</ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      ))}

      {accessGroups.length === 0 && (
        <EmptyState icon="person.3.fill" label="No access groups defined" colors={colors} />
      )}

      {/* Emergency Procedures */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>
        Emergency Procedures
      </ThemedText>
      <View style={[s.stubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#EF4444" />
        <View style={s.stubTextCol}>
          <ThemedText style={[s.stubTitle, { color: colors.text }]}>Emergency Response Plan</ThemedText>
          <ThemedText style={[s.stubText, { color: colors.textSecondary }]}>
            Fire evacuation routes, severe weather shelter locations, active threat lockdown procedures, and medical emergency protocols are maintained by Campus Safety.
          </ThemedText>
        </View>
      </View>
      <View style={[s.stubCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.sm }]}>
        <IconSymbol name="phone.fill" size={24} color="#F59E0B" />
        <View style={s.stubTextCol}>
          <ThemedText style={[s.stubTitle, { color: colors.text }]}>Emergency Contacts</ThemedText>
          <ThemedText style={[s.stubText, { color: colors.textSecondary }]}>
            Campus Police, Fire Department, Poison Control, and Facilities Emergency Hotline numbers are posted in every building and available through the campus app.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// PROJECTS SUB-TAB
// =============================================================================

function ProjectsTab({
  colors,
  accentColor,
  projects,
  buildings,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  projects: CapitalProject[];
  buildings: Building[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Capital Projects</ThemedText>

      {projects.map((project) => {
        const statusColor = PROJECT_STATUS_COLORS[project.status];
        const buildingName = getBuildingName(project.buildingId, buildings);
        const spentPercent = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;
        const budgetColor = spentPercent >= 90 ? '#EF4444' : spentPercent >= 70 ? '#F59E0B' : accentColor;
        return (
          <View
            key={project.id}
            style={[s.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.projectHeader}>
              <ThemedText style={[s.projectName, { color: colors.text }]}>{project.name}</ThemedText>
              <StatusBadge
                label={PROJECT_STATUS_LABELS[project.status].toUpperCase()}
                color={statusColor}
              />
            </View>
            <ThemedText style={[s.projectBuilding, { color: colors.textSecondary }]}>
              {buildingName}
            </ThemedText>

            {/* Timeline */}
            <View style={s.projectMetaRow}>
              <View style={s.projectMetaItem}>
                <IconSymbol name="calendar" size={12} color={accentColor} />
                <ThemedText style={[s.projectMetaText, { color: colors.textSecondary }]}>
                  {formatDate(project.startDate)} — {formatDate(project.endDate)}
                </ThemedText>
              </View>
            </View>

            {/* Budget Progress */}
            <View style={s.projectBudgetRow}>
              <ThemedText style={[s.projectBudgetLabel, { color: colors.textTertiary }]}>Budget</ThemedText>
              <ThemedText style={[s.projectBudgetValue, { color: colors.text }]}>
                {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
              </ThemedText>
              <ThemedText style={[s.projectBudgetPercent, { color: budgetColor }]}>
                {spentPercent}%
              </ThemedText>
            </View>
            <ProgressBar percent={spentPercent} color={budgetColor} />

            {/* Description */}
            <ThemedText style={[s.projectDesc, { color: colors.textSecondary }]} numberOfLines={3}>
              {project.description}
            </ThemedText>

            {/* Risks */}
            {project.risks.length > 0 && (
              <View style={[s.projectRisks, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.projectLabel, { color: colors.textTertiary }]}>Risks:</ThemedText>
                {project.risks.map((risk, i) => (
                  <View key={i} style={s.projectRiskRow}>
                    <View style={[s.projectRiskDot, { backgroundColor: '#F59E0B' }]} />
                    <ThemedText style={[s.projectRiskText, { color: colors.textSecondary }]}>{risk}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {projects.length === 0 && (
        <EmptyState icon="hammer.fill" label="No capital projects" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// BUILDING DETAIL BOTTOM SHEET
// =============================================================================

function BuildingDetailSheet({
  visible,
  onClose,
  building,
  colors,
  accentColor,
  rooms,
  workOrders,
}: {
  visible: boolean;
  onClose: () => void;
  building: Building | null;
  colors: typeof Colors.light;
  accentColor: string;
  rooms: FacilityRoom[];
  workOrders: WorkOrder[];
}) {
  if (!building) return null;

  const typeColor = BUILDING_TYPE_COLORS[building.type];
  const statusColor = BUILDING_STATUS_COLORS[building.status];
  const conditionColor = building.condition >= 80 ? '#22C55E' : building.condition >= 60 ? '#F59E0B' : '#EF4444';
  const buildingRooms = rooms.filter((r) => r.buildingId === building.id);
  const buildingWorkOrders = workOrders.filter(
    (w) => w.buildingId === building.id && w.status !== 'complete' && w.status !== 'closed',
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={building.name} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={BUILDING_TYPE_LABELS[building.type].toUpperCase()} color={typeColor} />
        <StatusBadge label={BUILDING_STATUS_LABELS[building.status].toUpperCase()} color={statusColor} />
      </View>

      {/* Building Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{building.campus}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Campus</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{building.yearBuilt}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Year Built</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {building.sqft.toLocaleString()} sq ft
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Size</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: conditionColor }]}>{building.condition}%</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Condition</ThemedText>
          </View>
        </View>
      </View>

      {/* Systems */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Systems</ThemedText>
        {building.systems.map((sys, i) => {
          const sysStatusColor = BUILDING_STATUS_COLORS[sys.status];
          return (
            <View key={i} style={s.sheetListRow}>
              <View style={[s.systemDot, { backgroundColor: sysStatusColor }]} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>
                  {SYSTEM_TYPE_LABELS[sys.type]}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {BUILDING_STATUS_LABELS[sys.status]} — Last Service: {formatDate(sys.lastService)}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Rooms */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Rooms ({buildingRooms.length})
        </ThemedText>
        {buildingRooms.map((room) => {
          const roomStatusColor = ROOM_STATUS_COLORS[room.status];
          return (
            <View key={room.id} style={s.sheetListRow}>
              <IconSymbol name={ROOM_TYPE_ICONS[room.type] as any} size={14} color={ROOM_TYPE_COLORS[room.type]} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {room.name}
                </ThemedText>
                <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                  {ROOM_TYPE_LABELS[room.type]} — Cap: {room.capacity} — {ROOM_STATUS_LABELS[room.status]}
                </ThemedText>
              </View>
              <View style={[s.sheetListDot, { backgroundColor: roomStatusColor }]} />
            </View>
          );
        })}
        {buildingRooms.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No rooms mapped
          </ThemedText>
        )}
      </View>

      {/* Work Orders */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Open Work Orders ({buildingWorkOrders.length})
        </ThemedText>
        {buildingWorkOrders.map((wo) => (
          <View key={wo.id} style={s.sheetListRow}>
            <View style={[s.priorityDot, { backgroundColor: WORK_ORDER_PRIORITY_COLORS[wo.priority] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {wo.title}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {WORK_ORDER_PRIORITY_LABELS[wo.priority].toUpperCase()} — {WORK_ORDER_STATUS_LABELS[wo.status]}
              </ThemedText>
            </View>
          </View>
        ))}
        {buildingWorkOrders.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No open work orders
          </ThemedText>
        )}
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
          <ThemedText style={s.sheetActionButtonText}>View Full Details</ThemedText>
        </Pressable>
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
  buildings,
  role,
}: {
  visible: boolean;
  onClose: () => void;
  asset: FacilityAsset | null;
  colors: typeof Colors.light;
  accentColor: string;
  buildings: Building[];
  role: EducationRoleLens;
}) {
  if (!asset) return null;

  const catColor = ASSET_CATEGORY_COLORS[asset.category];
  const condColor = ASSET_CONDITION_COLORS[asset.condition];
  const showValue = isDeanLevel(role);
  const warrantyDays = daysUntil(asset.warrantyExpiry);
  const warrantyExpired = warrantyDays < 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={asset.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={ASSET_CATEGORY_LABELS[asset.category].toUpperCase()} color={catColor} />
        <StatusBadge label={ASSET_CONDITION_LABELS[asset.condition].toUpperCase()} color={condColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{asset.location}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Location</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: warrantyExpired ? '#EF4444' : colors.text }]}>
              {warrantyExpired ? 'Expired' : formatDate(asset.warrantyExpiry)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Warranty</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{asset.maintenanceCadence}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Maint. Cadence</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(asset.lastService)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Service</ThemedText>
          </View>
        </View>
      </View>

      {/* Value (RBAC-gated) */}
      {showValue && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Financial</ThemedText>
          <ThemedText style={[s.assetSheetValue, { color: accentColor }]}>
            Replacement Value: {formatCurrency(asset.value)}
          </ThemedText>
        </View>
      )}

      {/* Service Log Stub */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Service Log</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="wrench.fill" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Last Service</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {formatDate(asset.lastService)} — {asset.maintenanceCadence} schedule
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[s.sheetEmptyText, { color: colors.textTertiary, marginTop: Spacing.sm }]}>
          Full service history available in asset management system.
        </ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Details</ThemedText>
        </Pressable>
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
  buildings,
}: {
  visible: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  colors: typeof Colors.light;
  accentColor: string;
  buildings: Building[];
}) {
  if (!workOrder) return null;

  const prioColor = WORK_ORDER_PRIORITY_COLORS[workOrder.priority];
  const statusColor = WORK_ORDER_STATUS_COLORS[workOrder.status];
  const catColor = WORK_ORDER_CATEGORY_COLORS[workOrder.category];
  const buildingName = getBuildingName(workOrder.buildingId, buildings);
  const slaDays = daysUntil(workOrder.dueDate);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={workOrder.title} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={WORK_ORDER_PRIORITY_LABELS[workOrder.priority].toUpperCase()} color={prioColor} />
        <StatusBadge label={WORK_ORDER_STATUS_LABELS[workOrder.status].toUpperCase()} color={statusColor} />
        <StatusBadge label={WORK_ORDER_CATEGORY_LABELS[workOrder.category].toUpperCase()} color={catColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{buildingName}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Building</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{workOrder.assignee}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Assignee</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(workOrder.createdDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Created</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: slaDays <= 1 ? '#EF4444' : colors.text }]}>
              {formatDate(workOrder.dueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
          </View>
        </View>
      </View>

      {/* SLA */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>SLA</ThemedText>
        <ThemedText style={[s.woSheetSlaText, { color: slaDays <= 1 ? '#EF4444' : colors.textSecondary }]}>
          {workOrder.slaHours}-hour SLA target — {slaDays <= 0 ? 'OVERDUE' : `${slaDays} day(s) remaining`}
        </ThemedText>
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.woSheetDesc, { color: colors.textSecondary }]}>
          {workOrder.description}
        </ThemedText>
      </View>

      {/* Evidence Requirement */}
      {workOrder.requiresEvidence && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <View style={s.woEvidenceIndicator}>
            <IconSymbol name="camera.fill" size={14} color="#F59E0B" />
            <ThemedText style={[s.woEvidenceIndicatorText, { color: '#F59E0B' }]}>
              Photo/video evidence required to close this work order
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
          <ThemedText style={s.sheetActionButtonText}>Update Status</ThemedText>
        </Pressable>
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
// INSPECTION DETAIL BOTTOM SHEET
// =============================================================================

function InspectionDetailSheet({
  visible,
  onClose,
  inspection,
  colors,
  accentColor,
  buildings,
}: {
  visible: boolean;
  onClose: () => void;
  inspection: Inspection | null;
  colors: typeof Colors.light;
  accentColor: string;
  buildings: Building[];
}) {
  if (!inspection) return null;

  const statusColor = INSPECTION_STATUS_COLORS[inspection.status];
  const typeColor = INSPECTION_TYPE_COLORS[inspection.type];
  const buildingName = getBuildingName(inspection.buildingId, buildings);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={INSPECTION_TYPE_LABELS[inspection.type] + ' Inspection'} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={INSPECTION_TYPE_LABELS[inspection.type].toUpperCase()} color={typeColor} />
        <StatusBadge label={INSPECTION_STATUS_LABELS[inspection.status].toUpperCase()} color={statusColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{buildingName}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Building</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(inspection.dueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
          </View>
          {inspection.completedDate && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
                {formatDate(inspection.completedDate)}
              </ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Completed</ThemedText>
            </View>
          )}
          {inspection.inspector && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{inspection.inspector}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Inspector</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Result */}
      {inspection.result && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Result</ThemedText>
          <ThemedText style={[s.inspSheetResult, { color: colors.textSecondary }]}>
            {inspection.result}
          </ThemedText>
        </View>
      )}

      {/* Compliance Linkage */}
      {inspection.status === 'failed' && inspection.remediationWorkOrderId && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Compliance</ThemedText>
          <View style={s.inspComplianceRow}>
            <IconSymbol name="link" size={14} color="#EF4444" />
            <ThemedText style={[s.inspComplianceText, { color: '#EF4444' }]}>
              Remediation Work Order: {inspection.remediationWorkOrderId}
            </ThemedText>
          </View>
          <ThemedText style={[s.inspComplianceNote, { color: colors.textTertiary }]}>
            This failed inspection has generated a remediation work order that must be completed before reinspection.
          </ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Details</ThemedText>
        </Pressable>
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

export function EduOrgFacilitiesV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: E5 locked ===
  if (role === 'E5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Facilities</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          This section is restricted. Contact university administration for access.
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildingSheetVisible, setBuildingSheetVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<FacilityAsset | null>(null);
  const [assetSheetVisible, setAssetSheetVisible] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [workOrderSheetVisible, setWorkOrderSheetVisible] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [inspectionSheetVisible, setInspectionSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduFacilitiesData(), []);

  // === Callbacks ===
  const handleSelectBuilding = useCallback((building: Building) => {
    setSelectedBuilding(building);
    setBuildingSheetVisible(true);
  }, []);

  const handleCloseBuildingSheet = useCallback(() => {
    setBuildingSheetVisible(false);
  }, []);

  const handleSelectAsset = useCallback((asset: FacilityAsset) => {
    setSelectedAsset(asset);
    setAssetSheetVisible(true);
  }, []);

  const handleCloseAssetSheet = useCallback(() => {
    setAssetSheetVisible(false);
  }, []);

  const handleSelectWorkOrder = useCallback((wo: WorkOrder) => {
    setSelectedWorkOrder(wo);
    setWorkOrderSheetVisible(true);
  }, []);

  const handleCloseWorkOrderSheet = useCallback(() => {
    setWorkOrderSheetVisible(false);
  }, []);

  const handleSelectInspection = useCallback((insp: Inspection) => {
    setSelectedInspection(insp);
    setInspectionSheetVisible(true);
  }, []);

  const handleCloseInspectionSheet = useCallback(() => {
    setInspectionSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isDeanLevel(role)) return SUB_TABS; // E1/E2: full 10
    if (isFacultyLevel(role)) {
      // E3: all except restricted admin areas (vendors, safety-access, projects are admin)
      return SUB_TABS.filter((t) =>
        ['overview', 'buildings', 'rooms', 'assets', 'work-orders', 'maintenance', 'inspections'].includes(t.id),
      );
    }
    // E4: Overview + Buildings + Rooms (read-only)
    return SUB_TABS.filter((t) =>
      ['overview', 'buildings', 'rooms'].includes(t.id),
    );
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'buildings':
        return (
          <BuildingsTab
            colors={colors}
            accentColor={accentColor}
            buildings={data.buildings}
            onSelectBuilding={handleSelectBuilding}
          />
        );
      case 'rooms':
        return (
          <RoomsTab
            colors={colors}
            accentColor={accentColor}
            rooms={data.rooms}
            buildings={data.buildings}
          />
        );
      case 'assets':
        if (!isFacultyLevel(role)) return null;
        return (
          <AssetsTab
            colors={colors}
            accentColor={accentColor}
            assets={data.assets}
            buildings={data.buildings}
            role={role}
            onSelectAsset={handleSelectAsset}
          />
        );
      case 'work-orders':
        if (!isFacultyLevel(role)) return null;
        return (
          <WorkOrdersTab
            colors={colors}
            accentColor={accentColor}
            workOrders={data.workOrders}
            buildings={data.buildings}
            onSelectWorkOrder={handleSelectWorkOrder}
          />
        );
      case 'maintenance':
        if (!isFacultyLevel(role)) return null;
        return (
          <MaintenanceTab
            colors={colors}
            accentColor={accentColor}
            maintenance={data.maintenance}
            buildings={data.buildings}
          />
        );
      case 'inspections':
        if (!isFacultyLevel(role)) return null;
        return (
          <InspectionsTab
            colors={colors}
            accentColor={accentColor}
            inspections={data.inspections}
            buildings={data.buildings}
            onSelectInspection={handleSelectInspection}
          />
        );
      case 'vendors':
        if (!isDeanLevel(role)) return null;
        return (
          <VendorsTab
            colors={colors}
            accentColor={accentColor}
            vendors={data.vendors}
          />
        );
      case 'safety-access':
        if (!isDeanLevel(role)) return null;
        return (
          <SafetyAccessTab
            colors={colors}
            accentColor={accentColor}
            safetyZones={data.safetyZones}
            accessGroups={data.accessGroups}
            buildings={data.buildings}
          />
        );
      case 'projects':
        if (!isDeanLevel(role)) return null;
        return (
          <ProjectsTab
            colors={colors}
            accentColor={accentColor}
            projects={data.capitalProjects}
            buildings={data.buildings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Building Detail Bottom Sheet */}
      <BuildingDetailSheet
        visible={buildingSheetVisible}
        onClose={handleCloseBuildingSheet}
        building={selectedBuilding}
        colors={colors}
        accentColor={accentColor}
        rooms={data.rooms}
        workOrders={data.workOrders}
      />

      {/* Asset Detail Bottom Sheet */}
      <AssetDetailSheet
        visible={assetSheetVisible}
        onClose={handleCloseAssetSheet}
        asset={selectedAsset}
        colors={colors}
        accentColor={accentColor}
        buildings={data.buildings}
        role={role}
      />

      {/* Work Order Detail Bottom Sheet */}
      <WorkOrderDetailSheet
        visible={workOrderSheetVisible}
        onClose={handleCloseWorkOrderSheet}
        workOrder={selectedWorkOrder}
        colors={colors}
        accentColor={accentColor}
        buildings={data.buildings}
      />

      {/* Inspection Detail Bottom Sheet */}
      <InspectionDetailSheet
        visible={inspectionSheetVisible}
        onClose={handleCloseInspectionSheet}
        inspection={selectedInspection}
        colors={colors}
        accentColor={accentColor}
        buildings={data.buildings}
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
  emptyInlineText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
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

  // -- Posture Card (Overview) --
  postureCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  postureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  postureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postureTextCol: {
    flex: 1,
  },
  postureTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  postureStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // -- Health Strip (Overview) --
  healthStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  healthTile: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 2,
  },
  healthTileValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  healthTileLabel: {
    fontSize: 10,
    textAlign: 'center',
  },

  // -- Impact Card (Overview) --
  impactCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  impactSeverityBar: {
    width: 4,
  },
  impactContent: {
    flex: 1,
    padding: Spacing.md,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  impactDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  impactBuilding: {
    fontSize: 11,
  },

  // -- Risk Flags --
  riskFlagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  riskFlagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskFlagText: {
    fontSize: 13,
  },

  // -- Quick Actions --
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Building Card --
  buildingCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  buildingCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  buildingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildingNameCol: {
    flex: 1,
  },
  buildingName: {
    fontSize: 15,
    fontWeight: '600',
  },
  buildingCampus: {
    fontSize: 11,
    marginTop: 1,
  },
  buildingBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  conditionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
  },
  conditionLabel: {
    fontSize: 11,
  },
  conditionValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  systemBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  systemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  systemBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  buildingDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  buildingDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  buildingDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  buildingDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Room Card --
  roomCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  roomCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  roomIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomNameCol: {
    flex: 1,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '600',
  },
  roomBuilding: {
    fontSize: 11,
    marginTop: 1,
  },
  roomBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roomDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  roomDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  roomDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  roomDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Asset Card --
  assetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  assetIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetNameCol: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
  },
  assetLocation: {
    fontSize: 11,
    marginTop: 1,
  },
  assetBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  assetDetailsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  assetDetailCol: {
    flex: 1,
  },
  assetDetailLabel: {
    fontSize: 10,
    marginBottom: 1,
  },
  assetDetailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  assetValueText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  // -- Work Order Card --
  woCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  woSeverityBar: {
    width: 4,
  },
  woContent: {
    flex: 1,
    padding: Spacing.md,
  },
  woHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  woTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  woBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  woMeta: {
    fontSize: 12,
  },
  woDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  woFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  woSla: {
    fontSize: 11,
    fontWeight: '600',
  },
  woEvidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  woEvidenceText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // -- Maintenance Card --
  maintCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  maintIndicator: {
    width: 4,
  },
  maintContent: {
    flex: 1,
    padding: Spacing.md,
  },
  maintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  maintTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  maintBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  maintMeta: {
    fontSize: 12,
  },
  maintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  maintDate: {
    fontSize: 11,
  },
  maintAssignee: {
    fontSize: 11,
  },
  maintAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  maintAlertText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // -- Inspection Card --
  inspectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  inspectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectionTextCol: {
    flex: 1,
  },
  inspectionType: {
    fontSize: 15,
    fontWeight: '600',
  },
  inspectionBuilding: {
    fontSize: 12,
    marginTop: 1,
  },
  inspectionBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  inspectionMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  inspectionResult: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  inspectionComplianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  inspectionComplianceText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // -- Vendor Card --
  vendorCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  vendorNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  vendorSpecialty: {
    fontSize: 12,
    marginTop: 1,
  },
  vendorSla: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  vendorFooter: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  vendorFooterItem: {
    flex: 1,
    alignItems: 'center',
  },
  vendorFooterValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  vendorFooterLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  coiIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorRiskRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.sm,
  },

  // -- Safety Zone Card --
  safetyZoneCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  safetyZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  safetyZoneIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyZoneNameCol: {
    flex: 1,
  },
  safetyZoneName: {
    fontSize: 14,
    fontWeight: '600',
  },
  safetyZoneBuilding: {
    fontSize: 11,
    marginTop: 1,
  },
  safetyZoneDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Access Group Card --
  accessGroupCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  accessGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  accessGroupIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessGroupNameCol: {
    flex: 1,
  },
  accessGroupName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accessGroupMembers: {
    fontSize: 11,
    marginTop: 1,
  },
  accessGroupZonesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  accessGroupZonesLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingTop: 2,
  },
  accessGroupZonesList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  accessGroupZoneChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  accessGroupZoneText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // -- Stub Card --
  stubCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  stubTextCol: {
    flex: 1,
  },
  stubTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stubText: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Capital Project Card --
  projectCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  projectBuilding: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  projectMetaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  projectMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectMetaText: {
    fontSize: 12,
  },
  projectBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  projectBudgetLabel: {
    fontSize: 11,
  },
  projectBudgetValue: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  projectBudgetPercent: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  projectDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: Spacing.sm,
  },
  projectRisks: {
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  projectLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  projectRiskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  projectRiskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  projectRiskText: {
    fontSize: 12,
  },

  // -- Priority Dot --
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sheetDetailItem: {
    width: '45%',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetListDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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

  // -- Asset Sheet Specific --
  assetSheetValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // -- Work Order Sheet Specific --
  woSheetSlaText: {
    fontSize: 13,
    lineHeight: 18,
  },
  woSheetDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  woEvidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  woEvidenceIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // -- Inspection Sheet Specific --
  inspSheetResult: {
    fontSize: 13,
    lineHeight: 19,
  },
  inspComplianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  inspComplianceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inspComplianceNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
});
