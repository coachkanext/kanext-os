/**
 * Sports Organization Finance v2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Budget | Spend | Approvals | Vendors | Travel Spend | Roster Costs | Purchasing | Reporting | Settings
 * RBAC: R1 full 10-tab, R2 Overview only, R3 Overview + Budget + Travel Spend + Purchasing, R4/R5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { SportsRoleLens } from '@/utils/sports-rbac';
import {
  FINANCE_SUB_TABS,
  BUDGET_BUCKETS,
  SPEND_TRANSACTIONS,
  FINANCE_APPROVALS,
  VENDOR_COMMITMENTS,
  TRIP_COSTS,
  ROSTER_COST_ITEMS,
  PURCHASE_REQUESTS,
  getFinanceOverview,
  BUDGET_CATEGORY_LABELS,
  BUDGET_CATEGORY_COLORS,
  SPEND_STATUS_LABELS,
  SPEND_STATUS_COLORS,
  FINANCE_APPROVAL_URGENCY_LABELS,
  FINANCE_APPROVAL_URGENCY_COLORS,
  FINANCE_APPROVAL_STATUS_LABELS,
  FINANCE_APPROVAL_STATUS_COLORS,
  VENDOR_COMMITMENT_STATUS_LABELS,
  VENDOR_COMMITMENT_STATUS_COLORS,
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_COLORS,
} from '@/data/mock-sports-org-finance-v2';
import type {
  BudgetBucket,
  SpendTransaction,
  FinanceApproval,
  VendorCommitment,
  TripCost,
  RosterCostItem,
  PurchaseRequest,
} from '@/data/mock-sports-org-finance-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.sports;
const SUB_TABS = FINANCE_SUB_TABS.map((t) => ({ id: t.id, label: t.label }));

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

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
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
  const overview = useMemo(() => getFinanceOverview(), []);

  const varianceColor = overview.variancePercent >= 0 ? '#22C55E' : '#EF4444';
  const budgetUsedPercent = overview.totalBudget > 0
    ? Math.round((overview.totalActual / overview.totalBudget) * 100)
    : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Budget Summary Card */}
      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.overviewCardTitle, { color: colors.text }]}>Budget Summary</ThemedText>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>
              {formatCurrency(overview.totalBudget)}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Budget</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>
              {formatCurrency(overview.totalActual)}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Actual</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: varianceColor }]}>
              {overview.variancePercent}%
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Variance</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.bucketsOverBudget > 0 ? '#EF4444' : '#22C55E' }]}>
              {overview.bucketsOverBudget}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Over Budget</ThemedText>
          </View>
        </View>
        <View style={s.overviewProgressRow}>
          <View style={s.overviewProgressLabel}>
            <IconSymbol name="chart.pie.fill" size={14} color={accentColor} />
            <ThemedText style={[s.overviewProgressText, { color: colors.text }]}>Budget Used</ThemedText>
            <ThemedText style={[s.overviewProgressPercent, { color: accentColor }]}>{budgetUsedPercent}%</ThemedText>
          </View>
          <ProgressBar percent={budgetUsedPercent} color={accentColor} />
        </View>
      </View>

      {/* Approvals & Flags */}
      <View style={[s.statusStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#F59E0B' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.pendingApprovals}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#EF4444' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.flaggedTransactions}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Flagged</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: ACCENT }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{formatCurrency(overview.pendingApprovalAmount)}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Pending Amt</ThemedText>
        </View>
      </View>

      {/* Vendor & Operations KPIs */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Vendor & Operations
      </ThemedText>
      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.vendorsExpiring > 0 ? '#F59E0B' : '#22C55E' }]}>
              {overview.vendorsExpiring}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Expiring Vendors</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.vendorsPastDue > 0 ? '#EF4444' : '#22C55E' }]}>
              {overview.vendorsPastDue}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Past Due</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>
              {formatCurrency(overview.totalTravelSpend)}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Travel Spend</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>
              {formatCurrency(overview.totalRosterCost)}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Roster Cost</ThemedText>
          </View>
        </View>
      </View>

      {/* Purchase Requests */}
      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.md }]}>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.openPurchaseRequests > 0 ? '#F59E0B' : '#22C55E' }]}>
              {overview.openPurchaseRequests}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Open Purchase Requests</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// BUDGET SUB-TAB
// =============================================================================

function BudgetTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: BudgetBucket }) => {
      const percent = item.planned > 0 ? Math.round((item.actual / item.planned) * 100) : 0;
      const isOverBudget = item.actual > item.planned;
      const catColor = BUDGET_CATEGORY_COLORS[item.category];
      const catLabel = BUDGET_CATEGORY_LABELS[item.category];
      const barColor = isOverBudget ? '#EF4444' : catColor;

      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <StatusBadge label={catLabel.toUpperCase()} color={catColor} />
          </View>
          <View style={s.budgetAmountsRow}>
            <View style={s.budgetAmountItem}>
              <ThemedText style={[s.budgetAmountLabel, { color: colors.textTertiary }]}>Planned</ThemedText>
              <ThemedText style={[s.budgetAmountValue, { color: colors.text }]}>{formatCurrency(item.planned)}</ThemedText>
            </View>
            <View style={s.budgetAmountItem}>
              <ThemedText style={[s.budgetAmountLabel, { color: colors.textTertiary }]}>Actual</ThemedText>
              <ThemedText style={[s.budgetAmountValue, { color: isOverBudget ? '#EF4444' : colors.text }]}>
                {formatCurrency(item.actual)}
              </ThemedText>
            </View>
            <View style={s.budgetAmountItem}>
              <ThemedText style={[s.budgetAmountLabel, { color: colors.textTertiary }]}>Used</ThemedText>
              <ThemedText style={[s.budgetAmountValue, { color: isOverBudget ? '#EF4444' : accentColor }]}>
                {percent}%
              </ThemedText>
            </View>
          </View>
          <ProgressBar percent={percent} color={barColor} />
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={BUDGET_BUCKETS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="chart.pie.fill" label="No budget buckets" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SPEND SUB-TAB
// =============================================================================

function SpendTab({
  colors,
  accentColor,
  onSelectTransaction,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectTransaction: (txn: SpendTransaction) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: SpendTransaction }) => {
      const statusColor = SPEND_STATUS_COLORS[item.status];
      const statusLabel = SPEND_STATUS_LABELS[item.status];

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectTransaction(item);
          }}
        >
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: colors.text }]}>{formatCurrency(item.amount)}</ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="storefront.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.vendor}</ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{formatDate(item.date)}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectTransaction],
  );

  return (
    <FlatList
      data={SPEND_TRANSACTIONS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.down.circle.fill" label="No spend transactions" colors={colors} />
      }
    />
  );
}

// =============================================================================
// APPROVALS SUB-TAB
// =============================================================================

function ApprovalsTab({
  colors,
  accentColor,
  onSelectApproval,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectApproval: (approval: FinanceApproval) => void;
}) {
  const sorted = useMemo(() => {
    const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder: Record<string, number> = { pending: 0, approved: 1, denied: 2 };
    return [...FINANCE_APPROVALS].sort((a, b) => {
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FinanceApproval }) => {
      const urgencyColor = FINANCE_APPROVAL_URGENCY_COLORS[item.urgency];
      const urgencyLabel = FINANCE_APPROVAL_URGENCY_LABELS[item.urgency];
      const statusColor = FINANCE_APPROVAL_STATUS_COLORS[item.status];
      const statusLabel = FINANCE_APPROVAL_STATUS_LABELS[item.status];

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectApproval(item);
          }}
        >
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: colors.text }]}>{formatCurrency(item.amount)}</ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
            <StatusBadge label={urgencyLabel.toUpperCase()} color={urgencyColor} />
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.requestedBy}</ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{formatDate(item.requestDate)}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectApproval],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="checkmark.seal.fill" label="No finance approvals" colors={colors} />
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
  onSelectVendor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectVendor: (vendor: VendorCommitment) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: VendorCommitment }) => {
      const statusColor = VENDOR_COMMITMENT_STATUS_COLORS[item.status];
      const statusLabel = VENDOR_COMMITMENT_STATUS_LABELS[item.status];

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectVendor(item);
          }}
        >
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.vendor}
            </ThemedText>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <ThemedText style={[s.listCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.service}
          </ThemedText>
          <View style={[s.listCardMeta, { marginTop: Spacing.sm }]}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="dollarsign.circle.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>
                {formatCurrency(item.annualCost)}/yr
              </ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="arrow.clockwise" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>
                {item.paymentCadence}
              </ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>
                Renew {formatDate(item.renewalDate)}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectVendor],
  );

  return (
    <FlatList
      data={VENDOR_COMMITMENTS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="storefront.fill" label="No vendor commitments" colors={colors} />
      }
    />
  );
}

// =============================================================================
// TRAVEL SPEND SUB-TAB
// =============================================================================

function TravelSpendTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: TripCost }) => {
      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.tripName}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: accentColor }]}>{formatCurrency(item.totalCost)}</ThemedText>
          </View>
          <View style={s.costBreakdownRow}>
            {item.lodging > 0 && (
              <View style={[s.costChip, { backgroundColor: `${ACCENT}20` }]}>
                <ThemedText style={[s.costChipText, { color: ACCENT }]}>Lodging {formatCurrency(item.lodging)}</ThemedText>
              </View>
            )}
            {item.airfare > 0 && (
              <View style={[s.costChip, { backgroundColor: `${ACCENT}20` }]}>
                <ThemedText style={[s.costChipText, { color: ACCENT }]}>Airfare {formatCurrency(item.airfare)}</ThemedText>
              </View>
            )}
            {item.ground > 0 && (
              <View style={[s.costChip, { backgroundColor: '#22C55E20' }]}>
                <ThemedText style={[s.costChipText, { color: '#22C55E' }]}>Ground {formatCurrency(item.ground)}</ThemedText>
              </View>
            )}
            {item.meals > 0 && (
              <View style={[s.costChip, { backgroundColor: '#F59E0B20' }]}>
                <ThemedText style={[s.costChipText, { color: '#F59E0B' }]}>Meals {formatCurrency(item.meals)}</ThemedText>
              </View>
            )}
          </View>
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{formatDate(item.date)}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={TRIP_COSTS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="airplane" label="No travel costs recorded" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ROSTER COSTS SUB-TAB
// =============================================================================

function RosterCostsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: RosterCostItem }) => {
      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.playerName}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: accentColor }]}>{formatCurrency(item.totalCost)}</ThemedText>
          </View>
          <View style={s.rosterBreakdownRow}>
            <View style={s.rosterBreakdownItem}>
              <ThemedText style={[s.rosterBreakdownLabel, { color: colors.textTertiary }]}>Scholarship</ThemedText>
              <ThemedText style={[s.rosterBreakdownValue, { color: colors.text }]}>{formatCurrency(item.scholarship)}</ThemedText>
            </View>
            <View style={s.rosterBreakdownItem}>
              <ThemedText style={[s.rosterBreakdownLabel, { color: colors.textTertiary }]}>Stipend</ThemedText>
              <ThemedText style={[s.rosterBreakdownValue, { color: colors.text }]}>{formatCurrency(item.stipend)}</ThemedText>
            </View>
            <View style={s.rosterBreakdownItem}>
              <ThemedText style={[s.rosterBreakdownLabel, { color: colors.textTertiary }]}>Per Diem</ThemedText>
              <ThemedText style={[s.rosterBreakdownValue, { color: colors.text }]}>{formatCurrency(item.perDiem)}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={ROSTER_COST_ITEMS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.3.fill" label="No roster cost data" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PURCHASING SUB-TAB
// =============================================================================

function PurchasingTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: PurchaseRequest }) => {
      const statusColor = PURCHASE_STATUS_COLORS[item.status];
      const statusLabel = PURCHASE_STATUS_LABELS[item.status];

      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.item}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: colors.text }]}>{formatCurrency(item.amount)}</ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            {item.receiptAttached && (
              <StatusBadge label="RECEIPT" color="#22C55E" />
            )}
          </View>
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.requestedBy}</ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{formatDate(item.date)}</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={PURCHASE_REQUESTS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="cart.fill" label="No purchase requests" colors={colors} />
      }
    />
  );
}

// =============================================================================
// REPORTING SUB-TAB (FORECASTS)
// =============================================================================

function ReportingTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const overview = useMemo(() => getFinanceOverview(), []);
  const projectedEndOfYear = overview.totalActual * 1.5; // Simple projection for mock
  const burnRate = overview.totalBudget > 0
    ? Math.round((overview.totalActual / overview.totalBudget) * 100)
    : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Financial Forecasts</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Projected end-of-season figures based on current spending pace
      </ThemedText>

      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.overviewCardTitle, { color: colors.text }]}>Season Projection</ThemedText>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>
              {formatCurrency(overview.totalBudget)}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total Budget</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>
              {formatCurrency(overview.totalActual)}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Spent to Date</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: projectedEndOfYear > overview.totalBudget ? '#EF4444' : '#22C55E' }]}>
              {formatCurrency(Math.round(projectedEndOfYear))}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Projected EOY</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: burnRate > 75 ? '#F59E0B' : accentColor }]}>
              {burnRate}%
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Burn Rate</ThemedText>
          </View>
        </View>
      </View>

      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.md }]}>
        <ThemedText style={[s.overviewCardTitle, { color: colors.text }]}>Key Insights</ThemedText>
        <View style={s.insightRow}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={14} color={accentColor} />
          <ThemedText style={[s.insightText, { color: colors.textSecondary }]}>
            Travel spending is the largest category at {formatCurrency(overview.totalTravelSpend)} across {TRIP_COSTS.length} trips
          </ThemedText>
        </View>
        <View style={s.insightRow}>
          <IconSymbol name="person.3.fill" size={14} color={accentColor} />
          <ThemedText style={[s.insightText, { color: colors.textSecondary }]}>
            Roster costs total {formatCurrency(overview.totalRosterCost)} for {ROSTER_COST_ITEMS.length} scholarship players
          </ThemedText>
        </View>
        <View style={s.insightRow}>
          <IconSymbol name="exclamationmark.triangle.fill" size={14} color={overview.pendingApprovals > 0 ? '#F59E0B' : '#22C55E'} />
          <ThemedText style={[s.insightText, { color: colors.textSecondary }]}>
            {overview.pendingApprovals} pending approval{overview.pendingApprovals !== 1 ? 's' : ''} totaling {formatCurrency(overview.pendingApprovalAmount)}
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// SETTINGS SUB-TAB (ADMIN)
// =============================================================================

function SettingsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const adminActions = [
    { id: 'fa-1', label: 'Budget Settings', icon: 'chart.pie.fill' },
    { id: 'fa-2', label: 'Approval Chains', icon: 'checkmark.seal.fill' },
    { id: 'fa-3', label: 'Vendor Management', icon: 'storefront.fill' },
    { id: 'fa-4', label: 'Export Reports', icon: 'arrow.down.doc.fill' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Finance Administration</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Finance administration tools
      </ThemedText>
      <View style={s.quickActionGrid}>
        {adminActions.map((action) => (
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
// TRANSACTION DETAIL BOTTOM SHEET
// =============================================================================

function TransactionDetailSheet({
  visible,
  onClose,
  transaction,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  transaction: SpendTransaction | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!transaction) return null;

  const statusColor = SPEND_STATUS_COLORS[transaction.status];
  const statusLabel = SPEND_STATUS_LABELS[transaction.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={transaction.description} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={transaction.category.toUpperCase()} color={accentColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatCurrency(transaction.amount)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{transaction.vendor}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Vendor</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{transaction.category}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Category</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(transaction.date)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Date</ThemedText>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {statusLabel}
          </ThemedText>
        </View>
      </View>

      {/* Notes */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Notes</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {transaction.description}
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
// APPROVAL DETAIL BOTTOM SHEET
// =============================================================================

function ApprovalDetailSheet({
  visible,
  onClose,
  approval,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  approval: FinanceApproval | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!approval) return null;

  const urgencyColor = FINANCE_APPROVAL_URGENCY_COLORS[approval.urgency];
  const urgencyLabel = FINANCE_APPROVAL_URGENCY_LABELS[approval.urgency];
  const statusColor = FINANCE_APPROVAL_STATUS_COLORS[approval.status];
  const statusLabel = FINANCE_APPROVAL_STATUS_LABELS[approval.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={approval.title} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={approval.category.toUpperCase()} color={accentColor} />
        <StatusBadge label={urgencyLabel.toUpperCase()} color={urgencyColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatCurrency(approval.amount)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{approval.requestedBy}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Submitter</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{approval.category}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Type</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(approval.requestDate)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Requested</ThemedText>
          </View>
        </View>
      </View>

      {/* Approvers */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Approvers ({approval.approvers.length})
        </ThemedText>
        {approval.approvers.map((approver, i) => (
          <View key={`approver-${i}`} style={s.sheetListRow}>
            <IconSymbol name="person.fill" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>{approver}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Notes */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Notes</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {approval.title} — requested by {approval.requestedBy} on {formatDate(approval.requestDate)}
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
// VENDOR DETAIL BOTTOM SHEET
// =============================================================================

function VendorDetailSheet({
  visible,
  onClose,
  vendor,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  vendor: VendorCommitment | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!vendor) return null;

  const statusColor = VENDOR_COMMITMENT_STATUS_COLORS[vendor.status];
  const statusLabel = VENDOR_COMMITMENT_STATUS_LABELS[vendor.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={vendor.vendor} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{vendor.vendor}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Name</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{vendor.service}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Service</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatCurrency(vendor.annualCost)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Annual Cost</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{vendor.paymentCadence}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Payment</ThemedText>
          </View>
        </View>
      </View>

      {/* Renewal */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Renewal</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="calendar" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>
              Renewal Date: {formatDate(vendor.renewalDate)}
            </ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              Status: {statusLabel}
            </ThemedText>
          </View>
          <View style={[s.timelineDot, { backgroundColor: statusColor }]} />
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

export function SportsOrgFinanceV2({ colors, accentColor, role = 'R1' }: Props) {
  // === RBAC Gate: R4/R5 locked ===
  if (role === 'R4' || role === 'R5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Finance</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Finance information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SpendTransaction | null>(null);
  const [transactionSheetVisible, setTransactionSheetVisible] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<FinanceApproval | null>(null);
  const [approvalSheetVisible, setApprovalSheetVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorCommitment | null>(null);
  const [vendorSheetVisible, setVendorSheetVisible] = useState(false);

  // === Callbacks ===
  const handleSelectTransaction = useCallback((txn: SpendTransaction) => {
    setSelectedTransaction(txn);
    setTransactionSheetVisible(true);
  }, []);

  const handleCloseTransactionSheet = useCallback(() => {
    setTransactionSheetVisible(false);
  }, []);

  const handleSelectApproval = useCallback((approval: FinanceApproval) => {
    setSelectedApproval(approval);
    setApprovalSheetVisible(true);
  }, []);

  const handleCloseApprovalSheet = useCallback(() => {
    setApprovalSheetVisible(false);
  }, []);

  const handleSelectVendor = useCallback((vendor: VendorCommitment) => {
    setSelectedVendor(vendor);
    setVendorSheetVisible(true);
  }, []);

  const handleCloseVendorSheet = useCallback(() => {
    setVendorSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (role === 'R1') return SUB_TABS; // R1 (AD/HC): full 10 tabs
    if (role === 'R2') {
      // R2 (Player): Overview only
      return SUB_TABS.filter((t) => t.id === 'overview');
    }
    if (role === 'R3') {
      // R3 (Asst Coach): Overview + Budget + Travel Spend + Purchasing
      return SUB_TABS.filter(
        (t) =>
          t.id === 'overview' ||
          t.id === 'budget' ||
          t.id === 'travel-spend' ||
          t.id === 'purchasing',
      );
    }
    // R4/R5 already handled by locked gate above
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'budget':
        return <BudgetTab colors={colors} accentColor={accentColor} />;
      case 'spend':
        return (
          <SpendTab
            colors={colors}
            accentColor={accentColor}
            onSelectTransaction={handleSelectTransaction}
          />
        );
      case 'approvals':
        return (
          <ApprovalsTab
            colors={colors}
            accentColor={accentColor}
            onSelectApproval={handleSelectApproval}
          />
        );
      case 'vendors':
        return (
          <VendorsTab
            colors={colors}
            accentColor={accentColor}
            onSelectVendor={handleSelectVendor}
          />
        );
      case 'travel-spend':
        return <TravelSpendTab colors={colors} accentColor={accentColor} />;
      case 'roster-costs':
        return <RosterCostsTab colors={colors} accentColor={accentColor} />;
      case 'purchasing':
        return <PurchasingTab colors={colors} accentColor={accentColor} />;
      case 'reporting':
        return <ReportingTab colors={colors} accentColor={accentColor} />;
      case 'settings':
        return <SettingsTab colors={colors} accentColor={accentColor} />;
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

      {/* Transaction Detail Bottom Sheet */}
      <TransactionDetailSheet
        visible={transactionSheetVisible}
        onClose={handleCloseTransactionSheet}
        transaction={selectedTransaction}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Approval Detail Bottom Sheet */}
      <ApprovalDetailSheet
        visible={approvalSheetVisible}
        onClose={handleCloseApprovalSheet}
        approval={selectedApproval}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Vendor Detail Bottom Sheet */}
      <VendorDetailSheet
        visible={vendorSheetVisible}
        onClose={handleCloseVendorSheet}
        vendor={selectedVendor}
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

  // -- Overview back bar / Explore bar --
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

  // -- Overview Card --
  overviewCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  overviewCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  overviewProgressRow: {
    marginTop: Spacing.xs,
  },
  overviewProgressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  overviewProgressText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  overviewProgressPercent: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
  },

  // -- Status Strip --
  statusStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
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

  // -- List Card (generic) --
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listCardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  listCardSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  listCardBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  listCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  listCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listCardMetaText: {
    fontSize: 11,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Budget amounts --
  budgetAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  budgetAmountItem: {
    alignItems: 'center',
  },
  budgetAmountLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  budgetAmountValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Cost breakdown chips --
  costBreakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  costChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  costChipText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // -- Roster breakdown --
  rosterBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  rosterBreakdownItem: {
    alignItems: 'center',
  },
  rosterBreakdownLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  rosterBreakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
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

  // -- Insights --
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  sheetBodyText: {
    fontSize: 13,
    lineHeight: 19,
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
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
