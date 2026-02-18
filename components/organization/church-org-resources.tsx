/**
 * Church Organization Resources — Inventory, equipment, supplies.
 * Sub-tabs: Summary | By Category | Checkouts | Overdue | Valuation
 * RBAC: C1 (Senior Pastor) full, C2 (Elder) full, C3 (Staff) full, C4 (Member) limited, C5 hidden.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isSeniorPastor, isElderLevel, isStaffLevel } from '@/utils/church-rbac';
import {
  getChurchResourcesData,
  getResourceById,
  formatCurrency,
  RESOURCE_CATEGORY_LABELS,
  RESOURCE_CATEGORY_ICONS,
  RESOURCE_CATEGORY_COLORS,
  CONDITION_COLOR,
  CONDITION_LABELS,
  CHECKOUT_STATUS_COLOR,
  CHECKOUT_STATUS_LABELS,
} from '@/data/mock-church-org-resources';
import type {
  ChurchResource,
  ResourceCheckout,
  ResourceCategory,
  ResourceCondition,
} from '@/data/mock-church-org-resources';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'by-category', label: 'By Category' },
  { id: 'checkouts', label: 'Checkouts' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'valuation', label: 'Valuation' },
];

const CATEGORY_FILTER_CHIPS: { id: ResourceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'av_equipment', label: 'AV' },
  { id: 'musical_instruments', label: 'Music' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'supplies', label: 'Supplies' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'technology', label: 'Tech' },
  { id: 'kitchen', label: 'Kitchen' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: ChurchRoleLens;
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
// SUMMARY SUB-TAB
// =============================================================================

function SummaryTab({
  colors,
  accentColor,
  resources,
  checkouts,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  resources: ChurchResource[];
  checkouts: ResourceCheckout[];
}) {
  const totalItems = resources.reduce((sum, r) => sum + r.quantity, 0);
  const checkedOut = resources.reduce((sum, r) => sum + (r.quantity - r.available), 0);
  const needsRepair = resources.filter((r) => r.condition === 'needs_repair').length;
  const totalValue = resources.reduce((sum, r) => sum + r.value, 0);
  const overdueCheckouts = checkouts.filter((c) => c.status === 'overdue');

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<ResourceCategory, { count: number; value: number }>();
    resources.forEach((r) => {
      const existing = map.get(r.category) || { count: 0, value: 0 };
      map.set(r.category, { count: existing.count + r.quantity, value: existing.value + r.value });
    });
    return Array.from(map.entries())
      .map(([cat, data]) => ({ category: cat, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [resources]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Row */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{totalItems}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Items</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#6AA9FF' }]}>{checkedOut}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Checked Out</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: '#EF4444' }]}>{needsRepair}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Needs Repair</ThemedText>
        </View>
      </View>

      {/* Total Valuation */}
      <View style={[s.valuationBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.valuationBannerRow}>
          <IconSymbol name="dollarsign.circle.fill" size={20} color={accentColor} />
          <ThemedText style={[s.valuationBannerLabel, { color: colors.textSecondary }]}>Total Inventory Value</ThemedText>
        </View>
        <ThemedText style={[s.valuationBannerValue, { color: colors.text }]}>
          {formatCurrency(totalValue)}
        </ThemedText>
      </View>

      {/* Overdue Alert */}
      {overdueCheckouts.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Overdue Items
          </ThemedText>
          {overdueCheckouts.map((co) => (
            <View
              key={co.id}
              style={[s.alertCard, { backgroundColor: '#EF444410', borderColor: '#EF444430' }]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
              <View style={s.alertTextCol}>
                <ThemedText style={[s.alertTitle, { color: colors.text }]}>{co.resourceName}</ThemedText>
                <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]}>
                  Checked out by {co.checkedOutBy} — Due {formatDate(co.returnDate)}
                </ThemedText>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Category Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Resources by Category
      </ThemedText>
      <View style={[s.categoryBreakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {categoryBreakdown.map((item, index) => {
          const catColor = RESOURCE_CATEGORY_COLORS[item.category];
          const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          return (
            <View
              key={item.category}
              style={[
                s.categoryRow,
                index < categoryBreakdown.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[s.categoryDot, { backgroundColor: catColor }]} />
              <View style={s.categoryTextCol}>
                <ThemedText style={[s.categoryName, { color: colors.text }]}>
                  {RESOURCE_CATEGORY_LABELS[item.category]}
                </ThemedText>
                <ThemedText style={[s.categoryCount, { color: colors.textTertiary }]}>
                  {item.count} items
                </ThemedText>
              </View>
              <View style={s.categoryRight}>
                <ThemedText style={[s.categoryValue, { color: colors.text }]}>
                  {formatCurrency(item.value)}
                </ThemedText>
                <ThemedText style={[s.categoryPct, { color: colors.textTertiary }]}>
                  {pct.toFixed(1)}%
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Active Checkouts */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Active Checkouts
      </ThemedText>
      {checkouts
        .filter((c) => c.status === 'active')
        .slice(0, 3)
        .map((co) => (
          <View
            key={co.id}
            style={[s.checkoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.checkoutCardTop}>
              <ThemedText style={[s.checkoutName, { color: colors.text }]} numberOfLines={1}>
                {co.resourceName}
              </ThemedText>
              <StatusBadge label="ACTIVE" color="#6AA9FF" />
            </View>
            <View style={s.checkoutMeta}>
              <ThemedText style={[s.checkoutMetaText, { color: colors.textSecondary }]}>
                {co.checkedOutBy} — {co.ministry}
              </ThemedText>
              <ThemedText style={[s.checkoutMetaText, { color: colors.textTertiary }]}>
                Due: {formatDate(co.returnDate)}
              </ThemedText>
            </View>
          </View>
        ))}
    </ScrollView>
  );
}

// =============================================================================
// BY CATEGORY SUB-TAB
// =============================================================================

function ByCategoryTab({
  colors,
  accentColor,
  resources,
  filterCategory,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onSelectResource,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  resources: ChurchResource[];
  filterCategory: ResourceCategory | 'all';
  searchQuery: string;
  onFilterChange: (cat: ResourceCategory | 'all') => void;
  onSearchChange: (q: string) => void;
  onSelectResource: (resource: ChurchResource) => void;
}) {
  const filtered = useMemo(() => {
    let list = resources;
    if (filterCategory !== 'all') {
      list = list.filter((r) => r.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          RESOURCE_CATEGORY_LABELS[r.category].toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q),
      );
    }
    return list;
  }, [resources, filterCategory, searchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: ChurchResource }) => {
      const catColor = RESOURCE_CATEGORY_COLORS[item.category];
      const condColor = CONDITION_COLOR[item.condition];
      const availPct = item.quantity > 0 ? (item.available / item.quantity) * 100 : 0;
      return (
        <Pressable
          style={[s.resourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectResource(item);
          }}
        >
          <View style={s.resourceCardTop}>
            <View style={[s.resourceIconCircle, { backgroundColor: catColor + '18' }]}>
              <IconSymbol name={RESOURCE_CATEGORY_ICONS[item.category] as any} size={18} color={catColor} />
            </View>
            <View style={s.resourceNameCol}>
              <ThemedText style={[s.resourceName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={s.resourceBadgeRow}>
                <StatusBadge
                  label={RESOURCE_CATEGORY_LABELS[item.category].toUpperCase()}
                  color={catColor}
                />
                <StatusBadge
                  label={CONDITION_LABELS[item.condition].toUpperCase()}
                  color={condColor}
                />
              </View>
            </View>
          </View>

          {/* Availability Bar */}
          <View style={s.resourceAvailRow}>
            <ThemedText style={[s.resourceAvailText, { color: colors.textSecondary }]}>
              {item.available}/{item.quantity} available
            </ThemedText>
            <ThemedText style={[s.resourceAvailValue, { color: colors.text }]}>
              {formatCurrency(item.value)}
            </ThemedText>
          </View>
          <ProgressBar percent={availPct} color={availPct > 50 ? '#22C55E' : availPct > 20 ? '#F59E0B' : '#EF4444'} />

          {/* Location */}
          <View style={[s.resourceFooter, { borderTopColor: colors.border }]}>
            <IconSymbol name="mappin" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.resourceLocationText, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.location}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [colors, onSelectResource],
  );

  return (
    <View style={s.flex1}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterChipRow}
      >
        {CATEGORY_FILTER_CHIPS.map((chip) => {
          const isActive = chip.id === filterCategory;
          return (
            <Pressable
              key={chip.id}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFilterChange(chip.id);
              }}
            >
              <ThemedText
                style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search */}
      <View style={s.searchContainer}>
        <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search resources..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Resource FlatList */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="shippingbox.fill" label="No resources match filter" colors={colors} />
        }
      />
    </View>
  );
}

// =============================================================================
// CHECKOUTS SUB-TAB
// =============================================================================

function CheckoutsTab({
  colors,
  accentColor,
  checkouts,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  checkouts: ResourceCheckout[];
}) {
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { overdue: 0, active: 1, returned: 2 };
    return [...checkouts].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [checkouts]);

  const renderItem = useCallback(
    ({ item }: { item: ResourceCheckout }) => {
      const sColor = CHECKOUT_STATUS_COLOR[item.status];
      return (
        <View style={[s.checkoutDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.checkoutDetailHeader}>
            <ThemedText style={[s.checkoutDetailName, { color: colors.text }]} numberOfLines={1}>
              {item.resourceName}
            </ThemedText>
            <StatusBadge label={CHECKOUT_STATUS_LABELS[item.status].toUpperCase()} color={sColor} />
          </View>
          <View style={s.checkoutDetailBody}>
            <View style={s.checkoutDetailRow}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.checkoutDetailText, { color: colors.textSecondary }]}>
                {item.checkedOutBy}
              </ThemedText>
            </View>
            <View style={s.checkoutDetailRow}>
              <IconSymbol name="heart.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.checkoutDetailText, { color: colors.textSecondary }]}>
                {item.ministry}
              </ThemedText>
            </View>
            <View style={s.checkoutDetailRow}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.checkoutDetailText, { color: colors.textSecondary }]}>
                {formatDate(item.checkoutDate)} — {formatDate(item.returnDate)}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.left.arrow.right" label="No checkouts" colors={colors} />
      }
    />
  );
}

// =============================================================================
// OVERDUE SUB-TAB
// =============================================================================

function OverdueTab({
  colors,
  accentColor,
  checkouts,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  checkouts: ResourceCheckout[];
}) {
  const overdueItems = useMemo(() => {
    return checkouts.filter((c) => c.status === 'overdue');
  }, [checkouts]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Alert banner */}
      {overdueItems.length > 0 && (
        <View style={[s.overdueBanner, { backgroundColor: '#EF444410', borderColor: '#EF444430' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#EF4444" />
          <View style={s.overdueBannerText}>
            <ThemedText style={[s.overdueBannerTitle, { color: colors.text }]}>
              {overdueItems.length} Overdue Item{overdueItems.length !== 1 ? 's' : ''}
            </ThemedText>
            <ThemedText style={[s.overdueBannerSubtitle, { color: colors.textSecondary }]}>
              These items are past their expected return date
            </ThemedText>
          </View>
        </View>
      )}

      {overdueItems.map((co) => (
        <Pressable
          key={co.id}
          style={[s.overdueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[s.overdueCardBar, { backgroundColor: '#EF4444' }]} />
          <View style={s.overdueCardContent}>
            <ThemedText style={[s.overdueCardName, { color: colors.text }]}>{co.resourceName}</ThemedText>
            <View style={s.overdueCardMeta}>
              <View style={s.overdueCardMetaRow}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.overdueCardMetaText, { color: colors.textSecondary }]}>
                  {co.checkedOutBy}
                </ThemedText>
              </View>
              <View style={s.overdueCardMetaRow}>
                <IconSymbol name="heart.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.overdueCardMetaText, { color: colors.textSecondary }]}>
                  {co.ministry}
                </ThemedText>
              </View>
            </View>
            <View style={[s.overdueCardFooter, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.overdueCardDue, { color: '#EF4444' }]}>
                Due: {formatDate(co.returnDate)}
              </ThemedText>
              <Pressable
                style={[s.overdueActionButton, { backgroundColor: '#EF444418' }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <ThemedText style={[s.overdueActionText, { color: '#EF4444' }]}>Send Reminder</ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      ))}

      {overdueItems.length === 0 && (
        <View style={s.emptyContainer}>
          <IconSymbol name="checkmark.circle.fill" size={48} color="#22C55E" />
          <ThemedText style={[s.emptyText, { color: colors.text, marginTop: Spacing.md }]}>
            No Overdue Items
          </ThemedText>
          <ThemedText style={[s.emptySubtext, { color: colors.textSecondary }]}>
            All checked-out resources are within their return window
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

// =============================================================================
// VALUATION SUB-TAB
// =============================================================================

function ValuationTab({
  colors,
  accentColor,
  resources,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  resources: ChurchResource[];
}) {
  const totalValue = resources.reduce((sum, r) => sum + r.value, 0);

  // Sort by value desc
  const sorted = useMemo(() => [...resources].sort((a, b) => b.value - a.value), [resources]);

  // Category totals
  const categoryTotals = useMemo(() => {
    const map = new Map<ResourceCategory, number>();
    resources.forEach((r) => {
      map.set(r.category, (map.get(r.category) || 0) + r.value);
    });
    return Array.from(map.entries())
      .map(([cat, value]) => ({ category: cat, value }))
      .sort((a, b) => b.value - a.value);
  }, [resources]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Total Value Header */}
      <View style={[s.valuationHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.valuationHeaderLabel, { color: colors.textSecondary }]}>
          Total Inventory Valuation
        </ThemedText>
        <ThemedText style={[s.valuationHeaderValue, { color: colors.text }]}>
          {formatCurrency(totalValue)}
        </ThemedText>
        <ThemedText style={[s.valuationHeaderCount, { color: colors.textTertiary }]}>
          {resources.length} resource types — {resources.reduce((s, r) => s + r.quantity, 0)} total items
        </ThemedText>
      </View>

      {/* Category Value Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Value by Category
      </ThemedText>
      <View style={[s.categoryBreakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {categoryTotals.map((item, index) => {
          const catColor = RESOURCE_CATEGORY_COLORS[item.category];
          const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          return (
            <View key={item.category}>
              <View
                style={[
                  s.categoryRow,
                  index < categoryTotals.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[s.categoryDot, { backgroundColor: catColor }]} />
                <View style={s.categoryTextCol}>
                  <ThemedText style={[s.categoryName, { color: colors.text }]}>
                    {RESOURCE_CATEGORY_LABELS[item.category]}
                  </ThemedText>
                </View>
                <View style={s.categoryRight}>
                  <ThemedText style={[s.categoryValue, { color: colors.text }]}>
                    {formatCurrency(item.value)}
                  </ThemedText>
                  <ThemedText style={[s.categoryPct, { color: colors.textTertiary }]}>
                    {pct.toFixed(1)}%
                  </ThemedText>
                </View>
              </View>
              <View style={{ paddingHorizontal: Spacing.sm, paddingBottom: Spacing.xs }}>
                <ProgressBar percent={pct} color={catColor} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Top Assets by Value */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Highest-Value Assets
      </ThemedText>
      {sorted.slice(0, 5).map((item, index) => {
        const catColor = RESOURCE_CATEGORY_COLORS[item.category];
        return (
          <View
            key={item.id}
            style={[s.valuationAssetRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.valuationRank, { backgroundColor: accentColor + '12' }]}>
              <ThemedText style={[s.valuationRankText, { color: accentColor }]}>{index + 1}</ThemedText>
            </View>
            <View style={s.valuationAssetText}>
              <ThemedText style={[s.valuationAssetName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={s.valuationAssetMeta}>
                <StatusBadge label={RESOURCE_CATEGORY_LABELS[item.category].toUpperCase()} color={catColor} />
                <ThemedText style={[s.valuationAssetQty, { color: colors.textTertiary }]}>
                  Qty: {item.quantity}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[s.valuationAssetValue, { color: colors.text }]}>
              {formatCurrency(item.value)}
            </ThemedText>
          </View>
        );
      })}
    </ScrollView>
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
  checkouts,
}: {
  visible: boolean;
  onClose: () => void;
  resource: ChurchResource | null;
  colors: typeof Colors.light;
  accentColor: string;
  checkouts: ResourceCheckout[];
}) {
  if (!resource) return null;

  const catColor = RESOURCE_CATEGORY_COLORS[resource.category];
  const condColor = CONDITION_COLOR[resource.condition];
  const resourceCheckouts = checkouts.filter((c) => c.resourceId === resource.id);
  const availPct = resource.quantity > 0 ? (resource.available / resource.quantity) * 100 : 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={resource.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={RESOURCE_CATEGORY_LABELS[resource.category].toUpperCase()} color={catColor} />
        <StatusBadge label={CONDITION_LABELS[resource.condition].toUpperCase()} color={condColor} />
      </View>

      {/* Availability */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Availability</ThemedText>
        <View style={s.sheetAvailRow}>
          <View style={s.sheetAvailItem}>
            <ThemedText style={[s.sheetAvailValue, { color: colors.text }]}>{resource.available}</ThemedText>
            <ThemedText style={[s.sheetAvailLabel, { color: colors.textSecondary }]}>Available</ThemedText>
          </View>
          <View style={s.sheetAvailItem}>
            <ThemedText style={[s.sheetAvailValue, { color: colors.text }]}>{resource.quantity - resource.available}</ThemedText>
            <ThemedText style={[s.sheetAvailLabel, { color: colors.textSecondary }]}>Checked Out</ThemedText>
          </View>
          <View style={s.sheetAvailItem}>
            <ThemedText style={[s.sheetAvailValue, { color: colors.text }]}>{resource.quantity}</ThemedText>
            <ThemedText style={[s.sheetAvailLabel, { color: colors.textSecondary }]}>Total</ThemedText>
          </View>
        </View>
        <ProgressBar percent={availPct} color={availPct > 50 ? '#22C55E' : availPct > 20 ? '#F59E0B' : '#EF4444'} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailRow}>
          <IconSymbol name="mappin" size={13} color={colors.textTertiary} />
          <ThemedText style={[s.sheetDetailText, { color: colors.textSecondary }]}>{resource.location}</ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <IconSymbol name="dollarsign.circle.fill" size={13} color={colors.textTertiary} />
          <ThemedText style={[s.sheetDetailText, { color: colors.textSecondary }]}>Value: {formatCurrency(resource.value)}</ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <IconSymbol name="calendar" size={13} color={colors.textTertiary} />
          <ThemedText style={[s.sheetDetailText, { color: colors.textSecondary }]}>Last Checked: {formatDate(resource.lastChecked)}</ThemedText>
        </View>
      </View>

      {/* Active Checkouts */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Checkouts ({resourceCheckouts.length})
        </ThemedText>
        {resourceCheckouts.map((co) => {
          const sColor = CHECKOUT_STATUS_COLOR[co.status];
          return (
            <View key={co.id} style={s.sheetCheckoutRow}>
              <View style={[s.sheetCheckoutDot, { backgroundColor: sColor }]} />
              <View style={s.sheetCheckoutTextCol}>
                <ThemedText style={[s.sheetCheckoutName, { color: colors.text }]}>
                  {co.checkedOutBy} — {co.ministry}
                </ThemedText>
                <ThemedText style={[s.sheetCheckoutDate, { color: colors.textTertiary }]}>
                  {formatDate(co.checkoutDate)} — {formatDate(co.returnDate)}
                </ThemedText>
              </View>
              <StatusBadge label={CHECKOUT_STATUS_LABELS[co.status].toUpperCase()} color={sColor} />
            </View>
          );
        })}
        {resourceCheckouts.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No active checkouts
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
          <ThemedText style={s.sheetActionButtonText}>Check Out Resource</ThemedText>
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

export function ChurchOrgResources({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C5 hidden ===
  if (role === 'C5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Resources</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          This section is restricted. Contact church staff for access.
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('summary');
  const [selectedResource, setSelectedResource] = useState<ChurchResource | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ResourceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // === Data ===
  const data = useMemo(() => getChurchResourcesData(), []);

  // === Callbacks ===
  const handleSelectResource = useCallback((resource: ChurchResource) => {
    setSelectedResource(resource);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isStaffLevel(role)) return SUB_TABS;
    // C4 (Member): summary + by-category only
    return SUB_TABS.filter((t) => t.id === 'summary' || t.id === 'by-category');
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'summary':
        return (
          <SummaryTab
            colors={colors}
            accentColor={accentColor}
            resources={data.resources}
            checkouts={data.checkouts}
          />
        );
      case 'by-category':
        return (
          <ByCategoryTab
            colors={colors}
            accentColor={accentColor}
            resources={data.resources}
            filterCategory={filterCategory}
            searchQuery={searchQuery}
            onFilterChange={setFilterCategory}
            onSearchChange={setSearchQuery}
            onSelectResource={handleSelectResource}
          />
        );
      case 'checkouts':
        if (!isStaffLevel(role)) return null;
        return (
          <CheckoutsTab
            colors={colors}
            accentColor={accentColor}
            checkouts={data.checkouts}
          />
        );
      case 'overdue':
        if (!isStaffLevel(role)) return null;
        return (
          <OverdueTab
            colors={colors}
            accentColor={accentColor}
            checkouts={data.checkouts}
          />
        );
      case 'valuation':
        if (!isStaffLevel(role)) return null;
        return (
          <ValuationTab
            colors={colors}
            accentColor={accentColor}
            resources={data.resources}
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

      {/* Resource Detail Bottom Sheet */}
      <ResourceDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        resource={selectedResource}
        colors={colors}
        accentColor={accentColor}
        checkouts={data.checkouts}
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
  flex1: {
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
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.xs,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- KPI Row --
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
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

  // -- Valuation Banner --
  valuationBanner: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  valuationBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  valuationBannerLabel: {
    fontSize: 12,
  },
  valuationBannerValue: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Alert Card --
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Category Breakdown --
  categoryBreakdownCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryTextCol: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 11,
    marginTop: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  categoryPct: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Checkout Card (summary) --
  checkoutCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkoutCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkoutName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  checkoutMeta: {
    gap: 2,
  },
  checkoutMetaText: {
    fontSize: 12,
  },

  // -- Filter Chips --
  filterChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
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

  // -- Resource Card --
  resourceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  resourceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  resourceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceNameCol: {
    flex: 1,
  },
  resourceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  resourceAvailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resourceAvailText: {
    fontSize: 12,
  },
  resourceAvailValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  resourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  resourceLocationText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Checkout Detail Card --
  checkoutDetailCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkoutDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  checkoutDetailName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  checkoutDetailBody: {
    gap: 4,
  },
  checkoutDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkoutDetailText: {
    fontSize: 12,
  },

  // -- Overdue --
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  overdueBannerText: {
    flex: 1,
  },
  overdueBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  overdueBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  overdueCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  overdueCardBar: {
    width: 4,
  },
  overdueCardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  overdueCardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  overdueCardMeta: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  overdueCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overdueCardMetaText: {
    fontSize: 12,
  },
  overdueCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  overdueCardDue: {
    fontSize: 12,
    fontWeight: '700',
  },
  overdueActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  overdueActionText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // -- Valuation Tab --
  valuationHeader: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  valuationHeaderLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  valuationHeaderValue: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  valuationHeaderCount: {
    fontSize: 12,
    marginTop: 4,
  },
  valuationAssetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  valuationRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuationRankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  valuationAssetText: {
    flex: 1,
  },
  valuationAssetName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  valuationAssetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  valuationAssetQty: {
    fontSize: 11,
  },
  valuationAssetValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
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
  sheetAvailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  sheetAvailItem: {
    alignItems: 'center',
  },
  sheetAvailValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetAvailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  sheetDetailText: {
    fontSize: 13,
    flex: 1,
  },
  sheetCheckoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetCheckoutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sheetCheckoutTextCol: {
    flex: 1,
  },
  sheetCheckoutName: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetCheckoutDate: {
    fontSize: 11,
    marginTop: 1,
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
});
