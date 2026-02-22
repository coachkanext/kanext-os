/**
 * Education Organization Resources Tab — 6-tab Resources Hub.
 * Library, Technology, Equipment, Software, Checkout, Budget.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isPresident, isDeanLevel, isFacultyLevel } from '@/utils/education-rbac';
import {
  EDU_RESOURCES_TABS,
  EDU_RESOURCES_SCOPE_CHIPS,
  RESOURCE_CATEGORY_COLOR,
  RESOURCE_CATEGORY_LABEL,
  CONDITION_COLOR,
  CONDITION_LABEL,
  CHECKOUT_STATUS_COLOR,
  CHECKOUT_STATUS_LABEL,
  getEduResourcesData,
  formatCurrency,
  formatNumber,
} from '@/data/mock-edu-org-resources';
import type {
  EduResourcesTabId,
  EduResource,
  LibraryStats,
  TechInventory,
  CheckoutRequest,
  ResourceBudget,
} from '@/data/mock-edu-org-resources';

// =============================================================================
// PROPS
// =============================================================================


const ACCENT = MODE_ACCENT.education;
interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: EducationRoleLens;
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
// LIBRARY TAB
// =============================================================================

function LibraryTab({
  colors,
  accentColor,
  stats,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  stats: LibraryStats;
}) {
  const kpis = [
    { id: 'volumes', label: 'Total Volumes', value: formatNumber(stats.totalVolumes), icon: 'book.fill', color: ACCENT },
    { id: 'digital', label: 'Digital Resources', value: formatNumber(stats.digitalResources), icon: 'icloud.fill', color: ACCENT },
    { id: 'loans', label: 'Active Loans', value: formatNumber(stats.activeLoans), icon: 'arrow.right.circle.fill', color: '#22C55E' },
    { id: 'overdue', label: 'Overdue Items', value: `${stats.overdueItems}`, icon: 'exclamationmark.triangle.fill', color: '#EF4444' },
    { id: 'visitors', label: 'Daily Visitors', value: `${stats.dailyVisitors}`, icon: 'person.3.fill', color: '#F59E0B' },
    { id: 'study', label: 'Study Rooms', value: `${stats.studyRoomsAvailable}/${stats.studyRooms}`, icon: 'door.left.hand.open', color: ACCENT },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Library Dashboard</ThemedText>
      <View style={s.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.id} style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.kpiHeader}>
              <IconSymbol name={kpi.icon as any} size={18} color={kpi.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{kpi.value}</ThemedText>
          </View>
        ))}
      </View>

      {/* Collection Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Collection Breakdown
      </ThemedText>
      <View style={[s.collectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.collectionRow}>
          <View style={s.collectionItem}>
            <View style={[s.collectionDot, { backgroundColor: ACCENT }]} />
            <ThemedText style={[s.collectionLabel, { color: colors.textSecondary }]}>Physical</ThemedText>
          </View>
          <ThemedText style={[s.collectionValue, { color: colors.text }]}>
            {formatNumber(stats.totalVolumes - stats.digitalResources)}
          </ThemedText>
        </View>
        <View style={[s.collectionRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
          <View style={s.collectionItem}>
            <View style={[s.collectionDot, { backgroundColor: ACCENT }]} />
            <ThemedText style={[s.collectionLabel, { color: colors.textSecondary }]}>Digital</ThemedText>
          </View>
          <ThemedText style={[s.collectionValue, { color: colors.text }]}>
            {formatNumber(stats.digitalResources)}
          </ThemedText>
        </View>
      </View>

      {/* Loan Status */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Loan Activity
      </ThemedText>
      <View style={[s.loanSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.loanSummaryRow}>
          <View style={s.loanSummaryItem}>
            <ThemedText style={[s.loanSummaryValue, { color: '#22C55E' }]}>
              {formatNumber(stats.activeLoans)}
            </ThemedText>
            <ThemedText style={[s.loanSummaryLabel, { color: colors.textTertiary }]}>Active</ThemedText>
          </View>
          <View style={s.loanSummaryItem}>
            <ThemedText style={[s.loanSummaryValue, { color: '#EF4444' }]}>
              {stats.overdueItems}
            </ThemedText>
            <ThemedText style={[s.loanSummaryLabel, { color: colors.textTertiary }]}>Overdue</ThemedText>
          </View>
          <View style={s.loanSummaryItem}>
            <ThemedText style={[s.loanSummaryValue, { color: accentColor }]}>
              {Math.round((1 - stats.overdueItems / stats.activeLoans) * 100)}%
            </ThemedText>
            <ThemedText style={[s.loanSummaryLabel, { color: colors.textTertiary }]}>On Time</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// TECHNOLOGY TAB
// =============================================================================

function TechnologyTab({
  colors,
  accentColor,
  inventory,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  inventory: TechInventory;
}) {
  const devices = [
    { label: 'Laptops', ...inventory.laptops, icon: 'laptopcomputer', color: ACCENT },
    { label: 'Tablets', ...inventory.tablets, icon: 'ipad', color: ACCENT },
    { label: 'Projectors', ...inventory.projectors, icon: 'rectangle.inset.filled', color: '#F59E0B' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Device Inventory</ThemedText>
      {devices.map((device) => {
        const usagePct = device.total > 0 ? Math.round((device.loaned / device.total) * 100) : 0;
        return (
          <View
            key={device.label}
            style={[s.deviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.deviceCardTop}>
              <View style={[s.deviceIconCircle, { backgroundColor: device.color + '18' }]}>
                <IconSymbol name={device.icon as any} size={18} color={device.color} />
              </View>
              <View style={s.deviceCardInfo}>
                <ThemedText style={[s.deviceName, { color: colors.text }]}>{device.label}</ThemedText>
                <ThemedText style={[s.deviceSubtext, { color: colors.textTertiary }]}>
                  {device.available} available of {device.total}
                </ThemedText>
              </View>
            </View>
            <View style={s.deviceBarContainer}>
              <View style={s.deviceBar}>
                <View style={[s.deviceBarFill, { backgroundColor: device.color, width: `${usagePct}%` }]} />
              </View>
              <ThemedText style={[s.deviceBarText, { color: colors.textSecondary }]}>
                {usagePct}% in use
              </ThemedText>
            </View>
            <View style={s.deviceStats}>
              <View style={s.deviceStatItem}>
                <ThemedText style={[s.deviceStatValue, { color: '#22C55E' }]}>{device.available}</ThemedText>
                <ThemedText style={[s.deviceStatLabel, { color: colors.textTertiary }]}>Available</ThemedText>
              </View>
              <View style={s.deviceStatItem}>
                <ThemedText style={[s.deviceStatValue, { color: ACCENT }]}>{device.loaned}</ThemedText>
                <ThemedText style={[s.deviceStatLabel, { color: colors.textTertiary }]}>Loaned</ThemedText>
              </View>
              <View style={s.deviceStatItem}>
                <ThemedText style={[s.deviceStatValue, { color: colors.text }]}>{device.total}</ThemedText>
                <ThemedText style={[s.deviceStatLabel, { color: colors.textTertiary }]}>Total</ThemedText>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// EQUIPMENT TAB
// =============================================================================

function EquipmentTab({
  colors,
  accentColor,
  data,
  onSelectResource,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: EduResource[];
  onSelectResource: (resource: EduResource) => void;
}) {
  // Group by department
  const grouped = useMemo(() => {
    const departments: Record<string, EduResource[]> = {};
    data.forEach((r) => {
      if (!departments[r.department]) departments[r.department] = [];
      departments[r.department].push(r);
    });
    return Object.entries(departments).map(([dept, items]) => ({
      department: dept,
      items,
      totalValue: items.reduce((sum, i) => sum + i.value, 0),
    }));
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.department}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => (
        <View style={s.deptGroup}>
          <View style={s.deptHeader}>
            <ThemedText style={[s.deptName, { color: colors.text }]}>{group.department}</ThemedText>
            <ThemedText style={[s.deptValue, { color: colors.textTertiary }]}>
              {formatCurrency(group.totalValue)}
            </ThemedText>
          </View>
          {group.items.map((resource) => {
            const catColor = RESOURCE_CATEGORY_COLOR[resource.category];
            const condColor = CONDITION_COLOR[resource.condition];
            return (
              <Pressable
                key={resource.id}
                style={[s.resourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectResource(resource);
                }}
              >
                <View style={s.resourceCardTop}>
                  <View style={s.resourceCardInfo}>
                    <ThemedText style={[s.resourceName, { color: colors.text }]} numberOfLines={1}>
                      {resource.name}
                    </ThemedText>
                    <View style={s.resourceCardBadgeRow}>
                      <StatusBadge label={RESOURCE_CATEGORY_LABEL[resource.category]} color={catColor} />
                      <StatusBadge label={CONDITION_LABEL[resource.condition]} color={condColor} />
                    </View>
                  </View>
                </View>
                <View style={[s.resourceCardMeta, { borderTopColor: colors.border }]}>
                  <View style={s.resourceMetaItem}>
                    <ThemedText style={[s.resourceMetaValue, { color: colors.text }]}>
                      {resource.available}/{resource.quantity}
                    </ThemedText>
                    <ThemedText style={[s.resourceMetaLabel, { color: colors.textTertiary }]}>
                      Available
                    </ThemedText>
                  </View>
                  <View style={s.resourceMetaItem}>
                    <ThemedText style={[s.resourceMetaValue, { color: colors.text }]}>
                      {formatCurrency(resource.value)}
                    </ThemedText>
                    <ThemedText style={[s.resourceMetaLabel, { color: colors.textTertiary }]}>
                      Value
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="wrench.and.screwdriver.fill" label="No equipment found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SOFTWARE TAB
// =============================================================================

function SoftwareTab({
  colors,
  accentColor,
  licenses,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  licenses: TechInventory['softwareLicenses'];
}) {
  return (
    <FlatList
      data={licenses}
      keyExtractor={(item) => item.name}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.md }]}>
          Software Licenses
        </ThemedText>
      }
      renderItem={({ item }) => {
        const usagePct = item.total > 0 ? Math.round((item.used / item.total) * 100) : 0;
        const barColor = usagePct > 90 ? '#EF4444' : usagePct > 70 ? '#F59E0B' : '#22C55E';
        return (
          <View style={[s.licenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.licenseCardTop}>
              <View style={s.licenseCardInfo}>
                <ThemedText style={[s.licenseName, { color: colors.text }]}>{item.name}</ThemedText>
                <ThemedText style={[s.licenseSubtext, { color: colors.textSecondary }]}>
                  {item.used} of {item.total} licenses used
                </ThemedText>
              </View>
              <ThemedText style={[s.licensePercent, { color: barColor }]}>
                {usagePct}%
              </ThemedText>
            </View>
            <View style={s.licenseBarContainer}>
              <View style={s.licenseBar}>
                <View style={[s.licenseBarFill, { backgroundColor: barColor, width: `${usagePct}%` }]} />
              </View>
            </View>
            <View style={s.licenseStats}>
              <View style={s.licenseStatItem}>
                <ThemedText style={[s.licenseStatValue, { color: '#22C55E' }]}>
                  {item.total - item.used}
                </ThemedText>
                <ThemedText style={[s.licenseStatLabel, { color: colors.textTertiary }]}>Available</ThemedText>
              </View>
              <View style={s.licenseStatItem}>
                <ThemedText style={[s.licenseStatValue, { color: ACCENT }]}>
                  {item.used}
                </ThemedText>
                <ThemedText style={[s.licenseStatLabel, { color: colors.textTertiary }]}>In Use</ThemedText>
              </View>
              <View style={s.licenseStatItem}>
                <ThemedText style={[s.licenseStatValue, { color: colors.text }]}>
                  {item.total}
                </ThemedText>
                <ThemedText style={[s.licenseStatLabel, { color: colors.textTertiary }]}>Total</ThemedText>
              </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="app.badge.fill" label="No software licenses" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CHECKOUT TAB
// =============================================================================

function CheckoutTab({
  colors,
  accentColor,
  data,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: CheckoutRequest[];
  role?: EducationRoleLens;
}) {
  // Group by status
  const grouped = useMemo(() => {
    const statusOrder: CheckoutRequest['status'][] = ['overdue', 'checked_out', 'pending', 'returned'];
    return statusOrder.map((status) => ({
      status,
      items: data.filter((co) => co.status === status),
    })).filter((g) => g.items.length > 0);
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.status}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => {
        const grpColor = CHECKOUT_STATUS_COLOR[group.status];
        return (
          <View style={s.checkoutGroup}>
            <View style={s.checkoutGroupHeader}>
              <View style={[s.checkoutGroupDot, { backgroundColor: grpColor }]} />
              <ThemedText style={[s.checkoutGroupTitle, { color: colors.text }]}>
                {CHECKOUT_STATUS_LABEL[group.status]}
              </ThemedText>
              <ThemedText style={[s.checkoutGroupCount, { color: colors.textTertiary }]}>
                {group.items.length}
              </ThemedText>
            </View>
            {group.items.map((item) => (
              <View
                key={item.id}
                style={[s.checkoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.checkoutCardTop}>
                  <ThemedText style={[s.checkoutResourceName, { color: colors.text }]} numberOfLines={1}>
                    {item.resourceName}
                  </ThemedText>
                  <StatusBadge label={CHECKOUT_STATUS_LABEL[item.status]} color={grpColor} />
                </View>
                <View style={s.checkoutCardMeta}>
                  <ThemedText style={[s.checkoutRequestedBy, { color: colors.textSecondary }]}>
                    {item.requestedBy}
                  </ThemedText>
                  <ThemedText style={[s.checkoutDept, { color: colors.textTertiary }]}>
                    {item.department}
                  </ThemedText>
                </View>
                <View style={s.checkoutCardFooter}>
                  <ThemedText style={[s.checkoutDate, { color: colors.textTertiary }]}>
                    Out: {item.date}
                  </ThemedText>
                  <ThemedText style={[s.checkoutDate, { color: colors.textTertiary }]}>
                    Due: {item.returnDate}
                  </ThemedText>
                </View>

                {/* Admin action */}
                {role && isFacultyLevel(role) && item.status === 'overdue' && (
                  <View style={s.checkoutActionRow}>
                    <Pressable
                      style={[s.checkoutActionBtn, { borderColor: '#EF4444' }]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <ThemedText style={[s.checkoutActionBtnText, { color: '#EF4444' }]}>
                        Send Reminder
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="arrow.right.circle.fill" label="No checkout requests" colors={colors} />
      }
    />
  );
}

// =============================================================================
// BUDGET TAB
// =============================================================================

function BudgetTab({
  colors,
  accentColor,
  data,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ResourceBudget[];
  role?: EducationRoleLens;
}) {
  // Only show budget to dean-level+ roles
  if (role && !isDeanLevel(role)) {
    return (
      <View style={s.restrictedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.restrictedText, { color: colors.textSecondary }]}>
          Budget data requires Dean-level access or above.
        </ThemedText>
      </View>
    );
  }

  const totalAllocated = data.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = data.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = data.reduce((sum, b) => sum + b.remaining, 0);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={s.budgetSummary}>
          <View style={[s.budgetSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.budgetSummaryRow}>
              <View style={s.budgetSummaryItem}>
                <ThemedText style={[s.budgetSummaryValue, { color: colors.text }]}>
                  {formatCurrency(totalAllocated)}
                </ThemedText>
                <ThemedText style={[s.budgetSummaryLabel, { color: colors.textTertiary }]}>
                  Allocated
                </ThemedText>
              </View>
              <View style={s.budgetSummaryItem}>
                <ThemedText style={[s.budgetSummaryValue, { color: '#EF4444' }]}>
                  {formatCurrency(totalSpent)}
                </ThemedText>
                <ThemedText style={[s.budgetSummaryLabel, { color: colors.textTertiary }]}>
                  Spent
                </ThemedText>
              </View>
              <View style={s.budgetSummaryItem}>
                <ThemedText style={[s.budgetSummaryValue, { color: '#22C55E' }]}>
                  {formatCurrency(totalRemaining)}
                </ThemedText>
                <ThemedText style={[s.budgetSummaryLabel, { color: colors.textTertiary }]}>
                  Remaining
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const spentPct = item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0;
        const barColor = spentPct > 90 ? '#EF4444' : spentPct > 70 ? '#F59E0B' : '#22C55E';
        return (
          <View style={[s.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.budgetCardTop}>
              <View style={s.budgetCardInfo}>
                <ThemedText style={[s.budgetDeptName, { color: colors.text }]}>{item.department}</ThemedText>
                <StatusBadge label={item.category.toUpperCase()} color={colors.textTertiary} />
              </View>
            </View>
            <View style={s.budgetBarContainer}>
              <View style={s.budgetBar}>
                <View style={[s.budgetBarFill, { backgroundColor: barColor, width: `${spentPct}%` }]} />
              </View>
              <ThemedText style={[s.budgetBarText, { color: colors.textSecondary }]}>
                {spentPct}% spent
              </ThemedText>
            </View>
            <View style={s.budgetStats}>
              <View style={s.budgetStatItem}>
                <ThemedText style={[s.budgetStatValue, { color: colors.text }]}>
                  {formatCurrency(item.allocated)}
                </ThemedText>
                <ThemedText style={[s.budgetStatLabel, { color: colors.textTertiary }]}>Budget</ThemedText>
              </View>
              <View style={s.budgetStatItem}>
                <ThemedText style={[s.budgetStatValue, { color: '#EF4444' }]}>
                  {formatCurrency(item.spent)}
                </ThemedText>
                <ThemedText style={[s.budgetStatLabel, { color: colors.textTertiary }]}>Spent</ThemedText>
              </View>
              <View style={s.budgetStatItem}>
                <ThemedText style={[s.budgetStatValue, { color: '#22C55E' }]}>
                  {formatCurrency(item.remaining)}
                </ThemedText>
                <ThemedText style={[s.budgetStatLabel, { color: colors.textTertiary }]}>Left</ThemedText>
              </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="dollarsign.circle.fill" label="No budget data" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RESOURCE DETAIL BOTTOM SHEET
// =============================================================================

function ResourceDetailSheet({
  visible,
  onClose,
  resource,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  resource: EduResource | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!resource) return null;

  const catColor = RESOURCE_CATEGORY_COLOR[resource.category];
  const condColor = CONDITION_COLOR[resource.condition];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={resource.name} useModal>
      {/* Category + Condition */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={RESOURCE_CATEGORY_LABEL[resource.category]} color={catColor} />
        <StatusBadge label={CONDITION_LABEL[resource.condition]} color={condColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {resource.available}/{resource.quantity}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Available</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatCurrency(resource.value)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Total Value</ThemedText>
        </View>
      </View>

      {/* Department */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Department</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {resource.department}
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
          <ThemedText style={s.sheetActionButtonText}>Request Checkout</ThemedText>
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

export function EduOrgResources({ colors, accentColor, role }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<EduResourcesTabId>('library');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<EduResource | null>(null);
  const [showResourceDetail, setShowResourceDetail] = useState(false);

  // === Data ===
  const scopeLabel = EDU_RESOURCES_SCOPE_CHIPS[activeScope] ?? 'All Resources';
  const data = useMemo(() => getEduResourcesData(scopeLabel), [scopeLabel]);

  // === Filtered data ===
  const filteredResources = useMemo(() => {
    let result = data.resources;
    // Apply scope filter
    if (activeScope === 1) result = result.filter((r) => r.category === 'library');
    else if (activeScope === 2) result = result.filter((r) => r.category === 'technology');
    else if (activeScope === 3) result = result.filter((r) => r.category === 'lab_equipment');
    else if (activeScope === 4) result = result.filter((r) => r.category === 'media');
    else if (activeScope === 5) result = result.filter((r) => r.category === 'athletic_equipment');

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }, [data.resources, searchQuery, activeScope]);

  const filteredCheckouts = useMemo(() => {
    if (!searchQuery.trim()) return data.checkoutQueue;
    const q = searchQuery.toLowerCase();
    return data.checkoutQueue.filter(
      (co) =>
        co.resourceName.toLowerCase().includes(q) ||
        co.requestedBy.toLowerCase().includes(q) ||
        co.department.toLowerCase().includes(q),
    );
  }, [data.checkoutQueue, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: EduResourcesTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectResource = useCallback((resource: EduResource) => {
    setSelectedResource(resource);
    setShowResourceDetail(true);
  }, []);

  // === Visible tabs — hide budget from non-admin ===
  const visibleTabs = useMemo(() => {
    if (role && !isDeanLevel(role)) {
      return EDU_RESOURCES_TABS.filter((t) => t.id !== 'budget');
    }
    return EDU_RESOURCES_TABS;
  }, [role]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'library':
        return <LibraryTab colors={colors} accentColor={accentColor} stats={data.libraryStats} />;
      case 'technology':
        return <TechnologyTab colors={colors} accentColor={accentColor} inventory={data.techInventory} />;
      case 'equipment':
        return (
          <EquipmentTab
            colors={colors}
            accentColor={accentColor}
            data={filteredResources}
            onSelectResource={handleSelectResource}
          />
        );
      case 'software':
        return (
          <SoftwareTab
            colors={colors}
            accentColor={accentColor}
            licenses={data.techInventory.softwareLicenses}
          />
        );
      case 'checkout':
        return (
          <CheckoutTab
            colors={colors}
            accentColor={accentColor}
            data={filteredCheckouts}
            role={role}
          />
        );
      case 'budget':
        return (
          <BudgetTab
            colors={colors}
            accentColor={accentColor}
            data={data.budgetAllocations}
            role={role}
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
        contentContainerStyle={s.tabPillRow}
      >
        {visibleTabs.map((tab) => {
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
        contentContainerStyle={s.scopeChipRow}
      >
        {EDU_RESOURCES_SCOPE_CHIPS.map((chip, index) => {
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
            placeholder="Search resources\u2026"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheet */}
      <ResourceDetailSheet
        visible={showResourceDetail}
        onClose={() => setShowResourceDetail(false)}
        resource={selectedResource}
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

  // -- Restricted access --
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  restrictedText: {
    fontSize: 14,
    marginTop: Spacing.md,
    textAlign: 'center',
    lineHeight: 20,
  },

  // -- KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
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

  // -- Library: Collection --
  collectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  collectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  collectionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  collectionValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Library: Loan Summary --
  loanSummary: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  loanSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loanSummaryItem: {
    alignItems: 'center',
  },
  loanSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  loanSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Technology: Devices --
  deviceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  deviceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  deviceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceCardInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  deviceBarContainer: {
    marginBottom: Spacing.sm,
  },
  deviceBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A1A1AA',
    marginBottom: 4,
    overflow: 'hidden',
  },
  deviceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  deviceBarText: {
    fontSize: 11,
  },
  deviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deviceStatItem: {
    alignItems: 'center',
  },
  deviceStatValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  deviceStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Equipment: Department groups --
  deptGroup: {
    marginBottom: Spacing.lg,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '700',
  },
  deptValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Equipment: Resource cards --
  resourceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  resourceCardTop: {
    padding: Spacing.sm,
  },
  resourceCardInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  resourceCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  resourceMetaItem: {
    alignItems: 'center',
  },
  resourceMetaValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  resourceMetaLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Software: License cards --
  licenseCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  licenseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  licenseCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  licenseName: {
    fontSize: 15,
    fontWeight: '600',
  },
  licenseSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  licensePercent: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  licenseBarContainer: {
    marginBottom: Spacing.sm,
  },
  licenseBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A1A1AA',
    overflow: 'hidden',
  },
  licenseBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  licenseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  licenseStatItem: {
    alignItems: 'center',
  },
  licenseStatValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  licenseStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Checkout: Groups --
  checkoutGroup: {
    marginBottom: Spacing.lg,
  },
  checkoutGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checkoutGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkoutGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  checkoutGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  checkoutCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checkoutCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkoutResourceName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  checkoutCardMeta: {
    marginBottom: 4,
  },
  checkoutRequestedBy: {
    fontSize: 13,
  },
  checkoutDept: {
    fontSize: 12,
    marginTop: 1,
  },
  checkoutCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutDate: {
    fontSize: 11,
  },
  checkoutActionRow: {
    marginTop: 6,
    alignItems: 'flex-start',
  },
  checkoutActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  checkoutActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Budget --
  budgetSummary: {
    marginBottom: Spacing.md,
  },
  budgetSummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  budgetSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  budgetSummaryItem: {
    alignItems: 'center',
  },
  budgetSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  budgetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  budgetCardTop: {
    marginBottom: Spacing.sm,
  },
  budgetCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetDeptName: {
    fontSize: 15,
    fontWeight: '600',
  },
  budgetBarContainer: {
    marginBottom: Spacing.sm,
  },
  budgetBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A1A1AA',
    marginBottom: 4,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetBarText: {
    fontSize: 11,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  budgetStatItem: {
    alignItems: 'center',
  },
  budgetStatValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Bottom Sheet shared --
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
    fontSize: 20,
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
