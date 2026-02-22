/**
 * Competition Organization Assets Tab — 10-tab Assets Hub.
 * Dashboard, Physical, Digital, Equipment, Venues, Inventory, Maintenance, Insurance, Reports, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import {
  COMP_ASSETS_TABS,
  COMP_ASSETS_SCOPE_CHIPS,
  CONDITION_COLOR,
  MAINTENANCE_STATUS_COLOR,
  INSURANCE_STATUS_COLOR,
  LEASE_COLOR,
  DIGITAL_TYPE_COLOR,
  EQUIPMENT_CATEGORY_COLOR,
  INVENTORY_CATEGORY_COLOR,
  REPORT_FORMAT_COLOR,
  formatCurrency,
  getCompAssetsData,
} from '@/data/mock-comp-org-assets';
import type {
  CompAssetsTabId,
  AssetsDashboardBlock,
  PhysicalAsset,
  DigitalAsset,
  EquipmentAsset,
  VenueAsset,
  InventoryItem,
  MaintenanceRecord,
  InsurancePolicy,
  AssetReport,
  AssetSettingToggle,
} from '@/data/mock-comp-org-assets';

// =============================================================================
// PROPS
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function conditionLabel(condition: PhysicalAsset['condition']): string {
  switch (condition) {
    case 'excellent': return 'EXCELLENT';
    case 'good': return 'GOOD';
    case 'fair': return 'FAIR';
    case 'needs-repair': return 'NEEDS REPAIR';
    case 'retired': return 'RETIRED';
  }
}

function maintenanceStatusLabel(status: MaintenanceRecord['status']): string {
  switch (status) {
    case 'completed': return 'COMPLETED';
    case 'scheduled': return 'SCHEDULED';
    case 'overdue': return 'OVERDUE';
    case 'in-progress': return 'IN PROGRESS';
  }
}

function insuranceStatusLabel(status: InsurancePolicy['status']): string {
  switch (status) {
    case 'active': return 'ACTIVE';
    case 'expiring-soon': return 'EXPIRING SOON';
    case 'expired': return 'EXPIRED';
    case 'pending-renewal': return 'PENDING RENEWAL';
  }
}

function leaseLabel(ownedOrLeased: VenueAsset['ownedOrLeased']): string {
  switch (ownedOrLeased) {
    case 'owned': return 'OWNED';
    case 'leased': return 'LEASED';
    case 'partnership': return 'PARTNERSHIP';
  }
}

function venueTypeLabel(type: VenueAsset['type']): string {
  switch (type) {
    case 'arena': return 'Arena';
    case 'stadium': return 'Stadium';
    case 'field': return 'Field';
    case 'court': return 'Court';
    case 'training-facility': return 'Training Facility';
  }
}

function maintenanceTypeLabel(type: MaintenanceRecord['type']): string {
  switch (type) {
    case 'scheduled': return 'Scheduled';
    case 'repair': return 'Repair';
    case 'inspection': return 'Inspection';
    case 'upgrade': return 'Upgrade';
  }
}

function stockLevel(item: InventoryItem): 'ok' | 'low' | 'critical' {
  if (item.quantity <= item.minStock) return 'critical';
  if (item.quantity <= item.reorderPoint) return 'low';
  return 'ok';
}

function stockLevelColor(level: 'ok' | 'low' | 'critical'): string {
  switch (level) {
    case 'ok': return '#22C55E';
    case 'low': return '#F59E0B';
    case 'critical': return '#EF4444';
  }
}

function stockLevelLabel(level: 'ok' | 'low' | 'critical'): string {
  switch (level) {
    case 'ok': return 'IN STOCK';
    case 'low': return 'LOW STOCK';
    case 'critical': return 'CRITICAL';
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
// DASHBOARD TAB
// =============================================================================

function DashboardTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getCompAssetsData>;
}) {
  // Derive quick summary items from data
  const physicalNeedsRepair = data.physical.filter((a) => a.condition === 'needs-repair').length;
  const overdueMaintenances = data.maintenance.filter((m) => m.status === 'overdue').length;
  const expiringInsurance = data.insurance.filter((p) => p.status === 'expiring-soon' || p.status === 'expired').length;
  const lowStockItems = data.inventory.filter((i) => stockLevel(i) !== 'ok').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: AssetsDashboardBlock) => (
          <View
            key={block.id}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.kpiHeader}>
              <IconSymbol name={block.icon as any} size={18} color={block.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                {block.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{block.value}</ThemedText>
            <ThemedText style={[s.kpiDelta, { color: colors.textTertiary }]}>{block.delta}</ThemedText>
          </View>
        ))}
      </View>

      {/* Alert Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Alerts
      </ThemedText>
      <View style={[s.alertsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[s.alertRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <View style={[s.alertDot, { backgroundColor: '#EF4444' }]} />
          <ThemedText style={[s.alertText, { color: colors.text }]}>
            {physicalNeedsRepair} physical asset{physicalNeedsRepair !== 1 ? 's' : ''} need repair
          </ThemedText>
        </View>
        <View style={[s.alertRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <View style={[s.alertDot, { backgroundColor: '#EF4444' }]} />
          <ThemedText style={[s.alertText, { color: colors.text }]}>
            {overdueMaintenances} overdue maintenance task{overdueMaintenances !== 1 ? 's' : ''}
          </ThemedText>
        </View>
        <View style={[s.alertRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
          <View style={[s.alertDot, { backgroundColor: '#F59E0B' }]} />
          <ThemedText style={[s.alertText, { color: colors.text }]}>
            {expiringInsurance} insurance polic{expiringInsurance !== 1 ? 'ies' : 'y'} need attention
          </ThemedText>
        </View>
        <View style={s.alertRow}>
          <View style={[s.alertDot, { backgroundColor: '#F59E0B' }]} />
          <ThemedText style={[s.alertText, { color: colors.text }]}>
            {lowStockItems} inventory item{lowStockItems !== 1 ? 's' : ''} below reorder point
          </ThemedText>
        </View>
      </View>

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionsGrid}>
        {[
          { id: 'qa-1', label: 'Add Asset', icon: 'plus.circle', color: '#22C55E' },
          { id: 'qa-2', label: 'Run Audit', icon: 'checkmark.shield', color: ACCENT },
          { id: 'qa-3', label: 'Schedule Maintenance', icon: 'hammer', color: '#F59E0B' },
          { id: 'qa-4', label: 'Upload Digital', icon: 'arrow.up.doc', color: ACCENT },
          { id: 'qa-5', label: 'Reorder Inventory', icon: 'shippingbox', color: '#EF4444' },
          { id: 'qa-6', label: 'Export Report', icon: 'square.and.arrow.up', color: '#A1A1AA' },
        ].map((action) => (
          <Pressable
            key={action.id}
            style={[s.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.quickActionIconCircle, { backgroundColor: action.color + '18' }]}>
              <IconSymbol name={action.icon as any} size={20} color={action.color} />
            </View>
            <ThemedText style={[s.quickActionLabel, { color: colors.text }]} numberOfLines={1}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Recent Maintenance */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Maintenance
      </ThemedText>
      <View style={[s.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.maintenance.slice(0, 5).map((item, index) => {
          const mtColor = MAINTENANCE_STATUS_COLOR[item.status];
          return (
            <View
              key={item.id}
              style={[
                s.activityRow,
                index < 4 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.activityDot, { backgroundColor: mtColor }]} />
              <View style={s.activityTextCol}>
                <ThemedText style={[s.activityText, { color: colors.text }]} numberOfLines={2}>
                  {item.assetName}
                </ThemedText>
                <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>
                  {maintenanceTypeLabel(item.type)} — {item.date}
                </ThemedText>
              </View>
              <StatusBadge label={maintenanceStatusLabel(item.status)} color={mtColor} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// PHYSICAL ASSETS TAB
// =============================================================================

function PhysicalTab({
  colors,
  accentColor,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: PhysicalAsset[];
  onSelect: (asset: PhysicalAsset) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const cColor = CONDITION_COLOR[item.condition];
        return (
          <Pressable
            style={[s.assetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.assetCardTop}>
              <View style={s.assetCardInfo}>
                <View style={[s.assetIconCircle, { backgroundColor: cColor + '18' }]}>
                  <IconSymbol name="cube" size={18} color={cColor} />
                </View>
                <View style={s.assetCardMid}>
                  <ThemedText style={[s.assetCardName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.assetCardBadgeRow}>
                    <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
                    <StatusBadge label={conditionLabel(item.condition)} color={cColor} />
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.assetCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.assetDetailItem}>
                <ThemedText style={[s.assetDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.value)}
                </ThemedText>
                <ThemedText style={[s.assetDetailLabel, { color: colors.textTertiary }]}>
                  Value
                </ThemedText>
              </View>
              <View style={s.assetDetailItem}>
                <ThemedText style={[s.assetDetailValue, { color: colors.text }]}>
                  {item.acquiredDate}
                </ThemedText>
                <ThemedText style={[s.assetDetailLabel, { color: colors.textTertiary }]}>
                  Acquired
                </ThemedText>
              </View>
            </View>

            <View style={s.assetCardFooter}>
              <View style={s.assetFooterRow}>
                <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.assetFooterText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.location}
                </ThemedText>
              </View>
              <View style={s.assetFooterRow}>
                <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.assetFooterText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.assignedTo}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="cube" label="No physical assets found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DIGITAL ASSETS TAB
// =============================================================================

function DigitalTab({
  colors,
  accentColor,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: DigitalAsset[];
  onSelect: (asset: DigitalAsset) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const typeColor = DIGITAL_TYPE_COLOR[item.type];
        return (
          <Pressable
            style={[s.digitalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.digitalCardTop}>
              <View style={[s.digitalIconCircle, { backgroundColor: typeColor + '18' }]}>
                <IconSymbol name="doc.on.doc" size={18} color={typeColor} />
              </View>
              <View style={s.digitalCardMid}>
                <ThemedText style={[s.digitalCardName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={s.digitalCardBadgeRow}>
                  <StatusBadge label={item.type.toUpperCase()} color={typeColor} />
                  <StatusBadge label={'v' + item.version} color={accentColor} />
                </View>
              </View>
            </View>

            <View style={[s.digitalCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.digitalMetaItem}>
                <ThemedText style={[s.digitalMetaLabel, { color: colors.textTertiary }]}>Format</ThemedText>
                <ThemedText style={[s.digitalMetaValue, { color: colors.text }]}>{item.format}</ThemedText>
              </View>
              <View style={s.digitalMetaItem}>
                <ThemedText style={[s.digitalMetaLabel, { color: colors.textTertiary }]}>Size</ThemedText>
                <ThemedText style={[s.digitalMetaValue, { color: colors.text }]}>{item.size}</ThemedText>
              </View>
              <View style={s.digitalMetaItem}>
                <ThemedText style={[s.digitalMetaLabel, { color: colors.textTertiary }]}>Uploaded</ThemedText>
                <ThemedText style={[s.digitalMetaValue, { color: colors.text }]}>{item.uploadDate}</ThemedText>
              </View>
            </View>

            <View style={s.digitalCardFooter}>
              <View style={s.digitalFooterRow}>
                <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.digitalFooterText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.owner}
                </ThemedText>
              </View>
              <View style={s.tagsRow}>
                {item.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={[s.tagChip, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.tagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
                  </View>
                ))}
                {item.tags.length > 3 && (
                  <ThemedText style={[s.tagMore, { color: colors.textTertiary }]}>
                    +{item.tags.length - 3}
                  </ThemedText>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="doc.on.doc" label="No digital assets found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EQUIPMENT TAB
// =============================================================================

function EquipmentTab({
  colors,
  accentColor,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: EquipmentAsset[];
  onSelect: (asset: EquipmentAsset) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const catColor = EQUIPMENT_CATEGORY_COLOR[item.category];
        const cColor = CONDITION_COLOR[item.condition];
        const isOverdue = item.nextService === 'OVERDUE';
        return (
          <Pressable
            style={[s.equipmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.equipmentCardTop}>
              <View style={[s.equipmentIconCircle, { backgroundColor: catColor + '18' }]}>
                <IconSymbol name="wrench.and.screwdriver" size={18} color={catColor} />
              </View>
              <View style={s.equipmentCardMid}>
                <ThemedText style={[s.equipmentCardName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={s.equipmentCardBadgeRow}>
                  <StatusBadge label={item.category.toUpperCase()} color={catColor} />
                  <StatusBadge label={conditionLabel(item.condition)} color={cColor} />
                </View>
              </View>
            </View>

            <View style={[s.equipmentCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.equipmentMetaItem}>
                <ThemedText style={[s.equipmentMetaLabel, { color: colors.textTertiary }]}>Serial</ThemedText>
                <ThemedText style={[s.equipmentMetaValue, { color: colors.text }]} numberOfLines={1}>
                  {item.serialNumber}
                </ThemedText>
              </View>
              <View style={s.equipmentMetaItem}>
                <ThemedText style={[s.equipmentMetaLabel, { color: colors.textTertiary }]}>Location</ThemedText>
                <ThemedText style={[s.equipmentMetaValue, { color: colors.text }]} numberOfLines={1}>
                  {item.location}
                </ThemedText>
              </View>
            </View>

            <View style={s.equipmentCardFooter}>
              <View style={s.equipmentServiceRow}>
                <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.equipmentServiceText, { color: colors.textSecondary }]}>
                  Last: {item.lastServiced}
                </ThemedText>
              </View>
              <View style={s.equipmentServiceRow}>
                <IconSymbol
                  name="exclamationmark.triangle.fill"
                  size={12}
                  color={isOverdue ? '#EF4444' : colors.textTertiary}
                />
                <ThemedText
                  style={[
                    s.equipmentServiceText,
                    { color: isOverdue ? '#EF4444' : colors.textSecondary },
                    isOverdue && { fontWeight: '700' },
                  ]}
                >
                  Next: {item.nextService}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="wrench.and.screwdriver" label="No equipment found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// VENUES TAB
// =============================================================================

function VenuesTab({
  colors,
  accentColor,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: VenueAsset[];
  onSelect: (venue: VenueAsset) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const lColor = LEASE_COLOR[item.ownedOrLeased];
        return (
          <Pressable
            style={[s.venueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.venueCardTop}>
              <View style={s.venueCardInfo}>
                <View style={[s.venueIconCircle, { backgroundColor: lColor + '18' }]}>
                  <IconSymbol name="building.2" size={18} color={lColor} />
                </View>
                <View style={s.venueCardMid}>
                  <ThemedText style={[s.venueCardName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.venueCardBadgeRow}>
                    <StatusBadge label={venueTypeLabel(item.type).toUpperCase()} color={accentColor} />
                    <StatusBadge label={leaseLabel(item.ownedOrLeased)} color={lColor} />
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.venueCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.venueDetailItem}>
                <ThemedText style={[s.venueDetailValue, { color: colors.text }]}>
                  {item.capacity.toLocaleString()}
                </ThemedText>
                <ThemedText style={[s.venueDetailLabel, { color: colors.textTertiary }]}>
                  Capacity
                </ThemedText>
              </View>
              <View style={s.venueDetailItem}>
                <ThemedText style={[s.venueDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.annualCost)}
                </ThemedText>
                <ThemedText style={[s.venueDetailLabel, { color: colors.textTertiary }]}>
                  Annual Cost
                </ThemedText>
              </View>
              <View style={s.venueDetailItem}>
                <ThemedText style={[s.venueDetailValue, { color: colors.text }]}>
                  {item.leaseExpiry}
                </ThemedText>
                <ThemedText style={[s.venueDetailLabel, { color: colors.textTertiary }]}>
                  Lease Expiry
                </ThemedText>
              </View>
            </View>

            <View style={s.venueCardFooter}>
              <View style={s.venueFooterRow}>
                <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.venueFooterText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.address}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="building.2" label="No venues found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INVENTORY TAB
// =============================================================================

function InventoryTab({
  colors,
  accentColor,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: InventoryItem[];
  onSelect: (item: InventoryItem) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const catColor = INVENTORY_CATEGORY_COLOR[item.category];
        const sLevel = stockLevel(item);
        const slColor = stockLevelColor(sLevel);
        const totalValue = item.quantity * item.unitCost;
        return (
          <Pressable
            style={[s.inventoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.inventoryCardTop}>
              <View style={[s.inventoryIconCircle, { backgroundColor: catColor + '18' }]}>
                <IconSymbol name="shippingbox" size={18} color={catColor} />
              </View>
              <View style={s.inventoryCardMid}>
                <ThemedText style={[s.inventoryCardName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={s.inventoryCardBadgeRow}>
                  <StatusBadge label={item.category.toUpperCase()} color={catColor} />
                  <StatusBadge label={stockLevelLabel(sLevel)} color={slColor} />
                </View>
              </View>
            </View>

            <View style={[s.inventoryCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.inventoryDetailItem}>
                <ThemedText style={[s.inventoryDetailValue, { color: colors.text }]}>
                  {item.quantity}
                </ThemedText>
                <ThemedText style={[s.inventoryDetailLabel, { color: colors.textTertiary }]}>
                  Qty
                </ThemedText>
              </View>
              <View style={s.inventoryDetailItem}>
                <ThemedText style={[s.inventoryDetailValue, { color: colors.text }]}>
                  {item.minStock}
                </ThemedText>
                <ThemedText style={[s.inventoryDetailLabel, { color: colors.textTertiary }]}>
                  Min
                </ThemedText>
              </View>
              <View style={s.inventoryDetailItem}>
                <ThemedText style={[s.inventoryDetailValue, { color: colors.text }]}>
                  {item.reorderPoint}
                </ThemedText>
                <ThemedText style={[s.inventoryDetailLabel, { color: colors.textTertiary }]}>
                  Reorder
                </ThemedText>
              </View>
              <View style={s.inventoryDetailItem}>
                <ThemedText style={[s.inventoryDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.unitCost)}
                </ThemedText>
                <ThemedText style={[s.inventoryDetailLabel, { color: colors.textTertiary }]}>
                  Unit Cost
                </ThemedText>
              </View>
            </View>

            {/* Stock bar */}
            <View style={s.stockBarContainer}>
              <View style={[s.stockBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    s.stockBarFill,
                    {
                      backgroundColor: slColor,
                      width: `${Math.min((item.quantity / (item.reorderPoint * 1.5)) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={s.inventoryCardFooter}>
              <View style={s.inventoryFooterRow}>
                <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.inventoryFooterText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.location}
                </ThemedText>
              </View>
              <ThemedText style={[s.inventoryTotalValue, { color: colors.textSecondary }]}>
                Total: {formatCurrency(totalValue)}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="shippingbox" label="No inventory items found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MAINTENANCE TAB
// =============================================================================

function MaintenanceTab({
  colors,
  accentColor,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: MaintenanceRecord[];
  onSelect: (record: MaintenanceRecord) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = MAINTENANCE_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.maintenanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.maintenanceCardTop}>
              <View style={[s.maintenanceIconCircle, { backgroundColor: stColor + '18' }]}>
                <IconSymbol name="hammer" size={18} color={stColor} />
              </View>
              <View style={s.maintenanceCardMid}>
                <ThemedText style={[s.maintenanceCardName, { color: colors.text }]} numberOfLines={1}>
                  {item.assetName}
                </ThemedText>
                <View style={s.maintenanceCardBadgeRow}>
                  <StatusBadge label={maintenanceTypeLabel(item.type).toUpperCase()} color={accentColor} />
                  <StatusBadge label={maintenanceStatusLabel(item.status)} color={stColor} />
                </View>
              </View>
            </View>

            <View style={[s.maintenanceCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.maintenanceMetaItem}>
                <ThemedText style={[s.maintenanceMetaLabel, { color: colors.textTertiary }]}>Date</ThemedText>
                <ThemedText style={[s.maintenanceMetaValue, { color: colors.text }]}>{item.date}</ThemedText>
              </View>
              <View style={s.maintenanceMetaItem}>
                <ThemedText style={[s.maintenanceMetaLabel, { color: colors.textTertiary }]}>Cost</ThemedText>
                <ThemedText style={[s.maintenanceMetaValue, { color: colors.text }]}>
                  {item.cost > 0 ? formatCurrency(item.cost) : 'N/A'}
                </ThemedText>
              </View>
              <View style={s.maintenanceMetaItem}>
                <ThemedText style={[s.maintenanceMetaLabel, { color: colors.textTertiary }]}>Technician</ThemedText>
                <ThemedText style={[s.maintenanceMetaValue, { color: colors.text }]} numberOfLines={1}>
                  {item.technician}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="hammer" label="No maintenance records found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INSURANCE TAB
// =============================================================================

function InsuranceTab({
  colors,
  accentColor,
  data,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: InsurancePolicy[];
  onSelect: (policy: InsurancePolicy) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = INSURANCE_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.insuranceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
          >
            <View style={s.insuranceCardTop}>
              <View style={[s.insuranceIconCircle, { backgroundColor: stColor + '18' }]}>
                <IconSymbol name="shield.checkered" size={18} color={stColor} />
              </View>
              <View style={s.insuranceCardMid}>
                <ThemedText style={[s.insuranceCardName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <StatusBadge label={insuranceStatusLabel(item.status)} color={stColor} />
              </View>
            </View>

            <View style={[s.insuranceCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.insuranceDetailItem}>
                <ThemedText style={[s.insuranceDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.coverage)}
                </ThemedText>
                <ThemedText style={[s.insuranceDetailLabel, { color: colors.textTertiary }]}>
                  Coverage
                </ThemedText>
              </View>
              <View style={s.insuranceDetailItem}>
                <ThemedText style={[s.insuranceDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.premium)}
                </ThemedText>
                <ThemedText style={[s.insuranceDetailLabel, { color: colors.textTertiary }]}>
                  Premium
                </ThemedText>
              </View>
            </View>

            <View style={s.insuranceCardMeta}>
              <View style={s.insuranceMetaRow}>
                <ThemedText style={[s.insuranceMetaLabel, { color: colors.textTertiary }]}>Provider</ThemedText>
                <ThemedText style={[s.insuranceMetaValue, { color: colors.textSecondary }]}>{item.provider}</ThemedText>
              </View>
              <View style={s.insuranceMetaRow}>
                <ThemedText style={[s.insuranceMetaLabel, { color: colors.textTertiary }]}>Period</ThemedText>
                <ThemedText style={[s.insuranceMetaValue, { color: colors.textSecondary }]}>
                  {item.startDate} {'\u2013'} {item.endDate}
                </ThemedText>
              </View>
            </View>

            <View style={[s.insuranceAssetsRow, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.insuranceAssetsLabel, { color: colors.textTertiary }]}>
                Covers:
              </ThemedText>
              <View style={s.insuranceAssetsList}>
                {item.assets.slice(0, 3).map((asset) => (
                  <View key={asset} style={[s.insuranceAssetChip, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[s.insuranceAssetChipText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {asset}
                    </ThemedText>
                  </View>
                ))}
                {item.assets.length > 3 && (
                  <ThemedText style={[s.insuranceAssetMore, { color: colors.textTertiary }]}>
                    +{item.assets.length - 3}
                  </ThemedText>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="shield.checkered" label="No insurance policies found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// REPORTS TAB
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: AssetReport[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const fmtColor = REPORT_FORMAT_COLOR[item.format];
        return (
          <Pressable
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.reportCardLeft}>
              <View style={[s.reportFormatBadge, { backgroundColor: fmtColor + '20' }]}>
                <ThemedText style={[s.reportFormatText, { color: fmtColor }]}>{item.format}</ThemedText>
              </View>
            </View>
            <View style={s.reportCardContent}>
              <ThemedText style={[s.reportName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </ThemedText>
              <View style={s.reportCardMeta}>
                <StatusBadge label={item.type.toUpperCase()} color={accentColor} />
                <ThemedText style={[s.reportDate, { color: colors.textTertiary }]}>{item.date}</ThemedText>
              </View>
            </View>
            <View style={s.reportCardAction}>
              <IconSymbol name="arrow.down.circle" size={20} color={accentColor} />
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="chart.bar.fill" label="No reports available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SETTINGS TAB
// =============================================================================

function SettingsTab({
  colors,
  accentColor,
  data,
  onToggle,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: AssetSettingToggle[];
  onToggle: (id: string) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.settingRow, { borderBottomColor: colors.border }]}>
          <View style={s.settingInfo}>
            <ThemedText style={[s.settingLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <ThemedText style={[s.settingDescription, { color: colors.textTertiary }]}>
              {item.description}
            </ThemedText>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={item.enabled ? accentColor : colors.textTertiary}
          />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="gearshape" label="No settings available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PHYSICAL ASSET DETAIL BOTTOM SHEET
// =============================================================================

function PhysicalDetailSheet({
  visible,
  onClose,
  asset,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  asset: PhysicalAsset | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!asset) return null;

  const cColor = CONDITION_COLOR[asset.condition];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={asset.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={asset.category.toUpperCase()} color={accentColor} />
        <StatusBadge label={conditionLabel(asset.condition)} color={cColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(asset.value)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Value</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{asset.acquiredDate}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Acquired</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Location</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {asset.location}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Assigned To</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {asset.assignedTo}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Edit Asset</ThemedText>
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
// DIGITAL ASSET DETAIL BOTTOM SHEET
// =============================================================================

function DigitalDetailSheet({
  visible,
  onClose,
  asset,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  asset: DigitalAsset | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!asset) return null;

  const typeColor = DIGITAL_TYPE_COLOR[asset.type];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={asset.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={asset.type.toUpperCase()} color={typeColor} />
        <StatusBadge label={'v' + asset.version} color={accentColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{asset.format}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Format</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{asset.size}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Size</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Owner</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {asset.owner}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Uploaded</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {asset.uploadDate}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Tags</ThemedText>
        <View style={s.sheetTagsRow}>
          {asset.tags.map((tag) => (
            <View key={tag} style={[s.sheetTagChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.sheetTagText, { color: colors.textSecondary }]}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Download</ThemedText>
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
// EQUIPMENT DETAIL BOTTOM SHEET
// =============================================================================

function EquipmentDetailSheet({
  visible,
  onClose,
  asset,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  asset: EquipmentAsset | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!asset) return null;

  const catColor = EQUIPMENT_CATEGORY_COLOR[asset.category];
  const cColor = CONDITION_COLOR[asset.condition];
  const isOverdue = asset.nextService === 'OVERDUE';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={asset.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={asset.category.toUpperCase()} color={catColor} />
        <StatusBadge label={conditionLabel(asset.condition)} color={cColor} />
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Serial Number</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {asset.serialNumber}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Location</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {asset.location}
        </ThemedText>
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{asset.lastServiced}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Last Serviced</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText
            style={[
              s.sheetKpiValue,
              { color: isOverdue ? '#EF4444' : colors.text },
              isOverdue && { fontWeight: '800' },
            ]}
          >
            {asset.nextService}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Next Service</ThemedText>
        </View>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Schedule Service</ThemedText>
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
// VENUE DETAIL BOTTOM SHEET
// =============================================================================

function VenueDetailSheet({
  visible,
  onClose,
  venue,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  venue: VenueAsset | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!venue) return null;

  const lColor = LEASE_COLOR[venue.ownedOrLeased];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={venue.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={venueTypeLabel(venue.type).toUpperCase()} color={accentColor} />
        <StatusBadge label={leaseLabel(venue.ownedOrLeased)} color={lColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {venue.capacity.toLocaleString()}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Capacity</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(venue.annualCost)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Annual Cost</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Address</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {venue.address}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Lease Expiry</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {venue.leaseExpiry}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Schedule</ThemedText>
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
// INVENTORY DETAIL BOTTOM SHEET
// =============================================================================

function InventoryDetailSheet({
  visible,
  onClose,
  item,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!item) return null;

  const catColor = INVENTORY_CATEGORY_COLOR[item.category];
  const sLevel = stockLevel(item);
  const slColor = stockLevelColor(sLevel);
  const totalValue = item.quantity * item.unitCost;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={item.category.toUpperCase()} color={catColor} />
        <StatusBadge label={stockLevelLabel(sLevel)} color={slColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.quantity}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>In Stock</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.minStock}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Min Stock</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{item.reorderPoint}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Reorder Pt</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Unit Cost</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {formatCurrency(item.unitCost)}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Total Value</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {formatCurrency(totalValue)}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Location</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {item.location}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Place Reorder</ThemedText>
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
// MAINTENANCE DETAIL BOTTOM SHEET
// =============================================================================

function MaintenanceDetailSheet({
  visible,
  onClose,
  record,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  record: MaintenanceRecord | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!record) return null;

  const stColor = MAINTENANCE_STATUS_COLOR[record.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={record.assetName} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={maintenanceTypeLabel(record.type).toUpperCase()} color={accentColor} />
        <StatusBadge label={maintenanceStatusLabel(record.status)} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{record.date}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Date</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {record.cost > 0 ? formatCurrency(record.cost) : 'N/A'}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Cost</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Technician</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {record.technician}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Asset ID</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {record.assetId}
        </ThemedText>
      </View>

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
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// INSURANCE DETAIL BOTTOM SHEET
// =============================================================================

function InsuranceDetailSheet({
  visible,
  onClose,
  policy,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  policy: InsurancePolicy | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!policy) return null;

  const stColor = INSURANCE_STATUS_COLOR[policy.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={policy.name} useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={insuranceStatusLabel(policy.status)} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(policy.coverage)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Coverage</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(policy.premium)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Premium</ThemedText>
        </View>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Provider</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {policy.provider}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Policy Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {policy.startDate} {'\u2013'} {policy.endDate}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Covered Assets</ThemedText>
        {policy.assets.map((asset) => (
          <View key={asset} style={s.sheetCoveredAssetRow}>
            <View style={[s.sheetCoveredAssetDot, { backgroundColor: accentColor }]} />
            <ThemedText style={[s.sheetCoveredAssetText, { color: colors.textSecondary }]}>
              {asset}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Renew Policy</ThemedText>
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

export function CompAssetsV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompAssetsTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Detail sheet state
  const [selectedPhysical, setSelectedPhysical] = useState<PhysicalAsset | null>(null);
  const [showPhysicalDetail, setShowPhysicalDetail] = useState(false);
  const [selectedDigital, setSelectedDigital] = useState<DigitalAsset | null>(null);
  const [showDigitalDetail, setShowDigitalDetail] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentAsset | null>(null);
  const [showEquipmentDetail, setShowEquipmentDetail] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueAsset | null>(null);
  const [showVenueDetail, setShowVenueDetail] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [showInventoryDetail, setShowInventoryDetail] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);
  const [showMaintenanceDetail, setShowMaintenanceDetail] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<InsurancePolicy | null>(null);
  const [showInsuranceDetail, setShowInsuranceDetail] = useState(false);

  // Settings state (local toggle tracking)
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_ASSETS_SCOPE_CHIPS[activeScope] ?? 'All Assets';
  const data = useMemo(() => getCompAssetsData(scopeLabel), [scopeLabel]);

  // Settings with overrides applied
  const settingsWithOverrides = useMemo(() => {
    return data.settings.map((setting) => ({
      ...setting,
      enabled: settingOverrides[setting.id] !== undefined
        ? settingOverrides[setting.id]
        : setting.enabled,
    }));
  }, [data.settings, settingOverrides]);

  // === Filtered data based on search ===
  const filteredPhysical = useMemo(() => {
    if (!searchQuery.trim()) return data.physical;
    const q = searchQuery.toLowerCase();
    return data.physical.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.assignedTo.toLowerCase().includes(q),
    );
  }, [data.physical, searchQuery]);

  const filteredDigital = useMemo(() => {
    if (!searchQuery.trim()) return data.digital;
    const q = searchQuery.toLowerCase();
    return data.digital.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [data.digital, searchQuery]);

  const filteredEquipment = useMemo(() => {
    if (!searchQuery.trim()) return data.equipment;
    const q = searchQuery.toLowerCase();
    return data.equipment.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q),
    );
  }, [data.equipment, searchQuery]);

  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return data.venues;
    const q = searchQuery.toLowerCase();
    return data.venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q),
    );
  }, [data.venues, searchQuery]);

  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return data.inventory;
    const q = searchQuery.toLowerCase();
    return data.inventory.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q),
    );
  }, [data.inventory, searchQuery]);

  const filteredMaintenance = useMemo(() => {
    if (!searchQuery.trim()) return data.maintenance;
    const q = searchQuery.toLowerCase();
    return data.maintenance.filter(
      (m) =>
        m.assetName.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.technician.toLowerCase().includes(q) ||
        m.status.toLowerCase().includes(q),
    );
  }, [data.maintenance, searchQuery]);

  const filteredInsurance = useMemo(() => {
    if (!searchQuery.trim()) return data.insurance;
    const q = searchQuery.toLowerCase();
    return data.insurance.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.provider.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.assets.some((a) => a.toLowerCase().includes(q)),
    );
  }, [data.insurance, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return data.reports;
    const q = searchQuery.toLowerCase();
    return data.reports.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q),
    );
  }, [data.reports, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompAssetsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectPhysical = useCallback((asset: PhysicalAsset) => {
    setSelectedPhysical(asset);
    setShowPhysicalDetail(true);
  }, []);

  const handleSelectDigital = useCallback((asset: DigitalAsset) => {
    setSelectedDigital(asset);
    setShowDigitalDetail(true);
  }, []);

  const handleSelectEquipment = useCallback((asset: EquipmentAsset) => {
    setSelectedEquipment(asset);
    setShowEquipmentDetail(true);
  }, []);

  const handleSelectVenue = useCallback((venue: VenueAsset) => {
    setSelectedVenue(venue);
    setShowVenueDetail(true);
  }, []);

  const handleSelectInventory = useCallback((item: InventoryItem) => {
    setSelectedInventory(item);
    setShowInventoryDetail(true);
  }, []);

  const handleSelectMaintenance = useCallback((record: MaintenanceRecord) => {
    setSelectedMaintenance(record);
    setShowMaintenanceDetail(true);
  }, []);

  const handleSelectInsurance = useCallback((policy: InsurancePolicy) => {
    setSelectedInsurance(policy);
    setShowInsuranceDetail(true);
  }, []);

  const handleToggleSetting = useCallback((id: string) => {
    setSettingOverrides((prev) => {
      const currentVal = prev[id] !== undefined
        ? prev[id]
        : data.settings.find((st) => st.id === id)?.enabled ?? false;
      return { ...prev, [id]: !currentVal };
    });
  }, [data.settings]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab colors={colors} accentColor={accentColor} data={data} />;
      case 'physical':
        return (
          <PhysicalTab
            colors={colors}
            accentColor={accentColor}
            data={filteredPhysical}
            onSelect={handleSelectPhysical}
          />
        );
      case 'digital':
        return (
          <DigitalTab
            colors={colors}
            accentColor={accentColor}
            data={filteredDigital}
            onSelect={handleSelectDigital}
          />
        );
      case 'equipment':
        return (
          <EquipmentTab
            colors={colors}
            accentColor={accentColor}
            data={filteredEquipment}
            onSelect={handleSelectEquipment}
          />
        );
      case 'venues':
        return (
          <VenuesTab
            colors={colors}
            accentColor={accentColor}
            data={filteredVenues}
            onSelect={handleSelectVenue}
          />
        );
      case 'inventory':
        return (
          <InventoryTab
            colors={colors}
            accentColor={accentColor}
            data={filteredInventory}
            onSelect={handleSelectInventory}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceTab
            colors={colors}
            accentColor={accentColor}
            data={filteredMaintenance}
            onSelect={handleSelectMaintenance}
          />
        );
      case 'insurance':
        return (
          <InsuranceTab
            colors={colors}
            accentColor={accentColor}
            data={filteredInsurance}
            onSelect={handleSelectInsurance}
          />
        );
      case 'reports':
        return <ReportsTab colors={colors} accentColor={accentColor} data={filteredReports} />;
      case 'settings':
        return (
          <SettingsTab
            colors={colors}
            accentColor={accentColor}
            data={settingsWithOverrides}
            onToggle={handleToggleSetting}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab pill bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.tabPillRow}
      >
        {COMP_ASSETS_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.tabPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.id)}
            >
              <ThemedText
                style={[
                  s.tabPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Scope chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.scopeChipRow}
      >
        {COMP_ASSETS_SCOPE_CHIPS.map((chip, index) => {
          const isActive = index === activeScope;
          return (
            <Pressable
              key={chip}
              style={[
                s.scopeChip,
                { backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary },
                isActive && { borderColor: accentColor, borderWidth: 1 },
              ]}
              onPress={() => handleScopePress(index)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: isActive ? accentColor : colors.textSecondary },
                ]}
              >
                {chip}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar */}
      <View style={s.searchContainer}>
        <View
          style={[
            s.searchBar,
            { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search\u2026"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
            >
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheets */}
      <PhysicalDetailSheet
        visible={showPhysicalDetail}
        onClose={() => setShowPhysicalDetail(false)}
        asset={selectedPhysical}
        colors={colors}
        accentColor={accentColor}
      />
      <DigitalDetailSheet
        visible={showDigitalDetail}
        onClose={() => setShowDigitalDetail(false)}
        asset={selectedDigital}
        colors={colors}
        accentColor={accentColor}
      />
      <EquipmentDetailSheet
        visible={showEquipmentDetail}
        onClose={() => setShowEquipmentDetail(false)}
        asset={selectedEquipment}
        colors={colors}
        accentColor={accentColor}
      />
      <VenueDetailSheet
        visible={showVenueDetail}
        onClose={() => setShowVenueDetail(false)}
        venue={selectedVenue}
        colors={colors}
        accentColor={accentColor}
      />
      <InventoryDetailSheet
        visible={showInventoryDetail}
        onClose={() => setShowInventoryDetail(false)}
        item={selectedInventory}
        colors={colors}
        accentColor={accentColor}
      />
      <MaintenanceDetailSheet
        visible={showMaintenanceDetail}
        onClose={() => setShowMaintenanceDetail(false)}
        record={selectedMaintenance}
        colors={colors}
        accentColor={accentColor}
      />
      <InsuranceDetailSheet
        visible={showInsuranceDetail}
        onClose={() => setShowInsuranceDetail(false)}
        policy={selectedInsurance}
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

  // -- Tab pills --
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scope chips --
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Search --
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
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

  // -- Dashboard: KPI --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiDelta: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Dashboard: Alerts --
  alertsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertText: {
    fontSize: 13,
    flex: 1,
  },

  // -- Dashboard: Quick Actions --
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 80,
  },
  quickActionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // -- Dashboard: Activity --
  activityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  activityTextCol: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Physical / Generic Asset Card --
  assetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  assetCardTop: {
    padding: Spacing.md,
  },
  assetCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  assetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetCardMid: {
    flex: 1,
  },
  assetCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  assetCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  assetCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  assetDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  assetDetailValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  assetDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  assetCardFooter: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  assetFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assetFooterText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Digital Asset Card --
  digitalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  digitalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  digitalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitalCardMid: {
    flex: 1,
  },
  digitalCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  digitalCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  digitalCardMeta: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  digitalMetaItem: {
    flex: 1,
  },
  digitalMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  digitalMetaValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  digitalCardFooter: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 6,
  },
  digitalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  digitalFooterText: {
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagMore: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },

  // -- Equipment Card --
  equipmentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  equipmentCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  equipmentIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentCardMid: {
    flex: 1,
  },
  equipmentCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  equipmentCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  equipmentCardMeta: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  equipmentMetaItem: {
    flex: 1,
  },
  equipmentMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  equipmentMetaValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  equipmentCardFooter: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  equipmentServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  equipmentServiceText: {
    fontSize: 12,
  },

  // -- Venue Card --
  venueCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  venueCardTop: {
    padding: Spacing.md,
  },
  venueCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  venueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueCardMid: {
    flex: 1,
  },
  venueCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  venueCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  venueCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  venueDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  venueDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  venueDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  venueCardFooter: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  venueFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueFooterText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Inventory Card --
  inventoryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  inventoryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  inventoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inventoryCardMid: {
    flex: 1,
  },
  inventoryCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  inventoryCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  inventoryCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  inventoryDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  inventoryDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  inventoryDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  stockBarContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  stockBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: 6,
    borderRadius: 3,
  },
  inventoryCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  inventoryFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  inventoryFooterText: {
    fontSize: 12,
  },
  inventoryTotalValue: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Maintenance Card --
  maintenanceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  maintenanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  maintenanceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintenanceCardMid: {
    flex: 1,
  },
  maintenanceCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  maintenanceCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  maintenanceCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  maintenanceMetaItem: {
    flex: 1,
    minWidth: '28%',
  },
  maintenanceMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  maintenanceMetaValue: {
    fontSize: 12,
    fontWeight: '500',
  },

  // -- Insurance Card --
  insuranceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  insuranceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  insuranceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insuranceCardMid: {
    flex: 1,
    gap: 6,
  },
  insuranceCardName: {
    fontSize: 15,
    fontWeight: '600',
  },
  insuranceCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  insuranceDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  insuranceDetailValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  insuranceDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  insuranceCardMeta: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  insuranceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insuranceMetaLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  insuranceMetaValue: {
    fontSize: 12,
  },
  insuranceAssetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  insuranceAssetsLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  insuranceAssetsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
    alignItems: 'center',
  },
  insuranceAssetChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  insuranceAssetChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  insuranceAssetMore: {
    fontSize: 10,
    fontWeight: '600',
  },

  // -- Report Card --
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  reportCardLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportFormatBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportFormatText: {
    fontSize: 12,
    fontWeight: '800',
  },
  reportCardContent: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  reportCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reportDate: {
    fontSize: 11,
  },
  reportCardAction: {
    padding: 4,
  },

  // -- Settings --
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // -- Bottom Sheet shared styles --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetKpiLabel: {
    fontSize: 11,
    marginTop: 2,
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
  sheetTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  sheetTagChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  sheetTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sheetCoveredAssetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  sheetCoveredAssetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sheetCoveredAssetText: {
    fontSize: 13,
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
