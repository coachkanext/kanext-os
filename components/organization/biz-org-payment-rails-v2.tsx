/**
 * Business Organization Payment Rails Tab — V2 Rewrite
 * 9-tab Payment Rails Hub: NOW | Wallets | Batches | Approvals | Release |
 * Exceptions | Disputes | Receipts | Admin
 *
 * Fixed sticky header (3 rows) above sub-tabs:
 *   Row 1 — Health strip (3 dots)
 *   Row 2 — CTA buttons (New Batch, Quick Pay, Reconcile)
 *   Row 3 — Filter chips (All | Pending | In Flight | Settled | Exceptions)
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
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
} from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel } from '@/utils/business-rbac';
import {
  BIZ_TXN_STATE_LABELS,
  BIZ_TXN_STATE_COLORS,
  TRAFFIC_LIGHT_COLORS,
  SEEDED_ENTITY_NAMES,
  formatCurrency,
  getBizPaymentRailsData,
  RAILS_SUB_TABS,
  RAILS_FILTER_CHIPS,
  WALLET_TYPE_LABELS,
  WALLET_TYPE_COLORS,
  WALLET_STATUS_COLORS,
  URGENCY_COLORS,
  URGENCY_LABELS,
  EXCEPTION_TYPE_COLORS,
  EXCEPTION_TYPE_LABELS,
  DISPUTE_STATUS_COLORS,
  DISPUTE_STATUS_LABELS,
  ADMIN_CATEGORY_COLORS,
  ADMIN_CATEGORY_LABELS,
  RECEIPT_TYPE_LABELS,
  RECEIPT_TYPE_COLORS,
} from '@/data/mock-biz-org-payment-rails';
import type {
  RailsSubTabId,
  RailsFilterChip,
  RailsHealthDot,
  RailsWallet,
  RailsBatch,
  RailsBatchItem,
  RailsApproval,
  RailsReleaseItem,
  RailsException,
  RailsDispute,
  RailsAdminConfig,
  RailsNowSummary,
  BizTxnState,
  BizReceipt,
  TrafficLight,
} from '@/data/mock-biz-org-payment-rails';

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function stateIsException(state: BizTxnState): boolean {
  return state === 'failed' || state === 'disputed' || state === 'returned' || state === 'reversed';
}

function stateIsPending(state: BizTxnState): boolean {
  return state === 'draft' || state === 'proposed' || state === 'rule_checked' || state === 'authorized' || state === 'scheduled' || state === 'hold';
}

function matchesFilter(state: BizTxnState, filter: RailsFilterChip): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return stateIsPending(state);
  if (filter === 'in_flight') return state === 'in_flight' || state === 'released';
  if (filter === 'settled') return state === 'settled';
  if (filter === 'exceptions') return stateIsException(state);
  return true;
}

function txnStateVariant(state: BizTxnState): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (state) {
    case 'settled': return 'success';
    case 'in_flight':
    case 'released': return 'info';
    case 'draft':
    case 'proposed':
    case 'rule_checked':
    case 'scheduled':
    case 'hold': return 'warning';
    case 'authorized': return 'info';
    case 'failed':
    case 'disputed':
    case 'returned':
    case 'reversed': return 'error';
    default: return 'neutral';
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
// DOT INDICATOR
// =============================================================================

function DotIndicator({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}

// =============================================================================
// SECTION DIVIDER
// =============================================================================

function SectionDivider() {
  return <View style={s.sectionDivider} />;
}

// =============================================================================
// ROLE INDICATOR BADGE
// =============================================================================

function RoleIndicator({ roles }: { roles: string }) {
  return (
    <View style={s.roleIndicator}>
      <IconSymbol name="lock.fill" size={9} color={BP.ash} />
      <ThemedText style={s.roleIndicatorText}>{roles}</ThemedText>
    </View>
  );
}

// =============================================================================
// HEALTH STRIP (Row 1 of sticky header)
// =============================================================================

function HealthStrip({ dots }: { dots: RailsHealthDot[] }) {
  return (
    <View style={s.healthStrip}>
      {dots.map((dot) => (
        <View key={dot.id} style={s.healthDotItem}>
          <DotIndicator color={TRAFFIC_LIGHT_COLORS[dot.status]} size={10} />
          <ThemedText style={s.healthDotLabel}>{dot.label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// CTA BUTTONS (Row 2 of sticky header)
// =============================================================================

function CTAButtons({
  onNewBatch,
  onQuickPay,
  onReconcile,
}: {
  onNewBatch: () => void;
  onQuickPay: () => void;
  onReconcile: () => void;
}) {
  const buttons = [
    { label: 'New Batch', icon: 'plus.circle.fill', action: onNewBatch },
    { label: 'Quick Pay', icon: 'bolt.fill', action: onQuickPay },
    { label: 'Reconcile', icon: 'arrow.triangle.2.circlepath', action: onReconcile },
  ];

  return (
    <View style={s.ctaRow}>
      {buttons.map((btn) => (
        <Pressable
          key={btn.label}
          style={s.ctaButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            btn.action();
          }}
        >
          <IconSymbol name={btn.icon as any} size={14} color={BP.champagneGold} />
          <ThemedText style={s.ctaButtonText}>{btn.label}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

// =============================================================================
// FILTER CHIPS (Row 3 of sticky header)
// =============================================================================

function FilterChips({
  activeFilter,
  onSelect,
}: {
  activeFilter: RailsFilterChip;
  onSelect: (id: RailsFilterChip) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterChipRow}
    >
      {RAILS_FILTER_CHIPS.map((chip) => {
        const isActive = chip.id === activeFilter;
        return (
          <Pressable
            key={chip.id}
            style={[
              s.filterChip,
              {
                backgroundColor: isActive ? BP.champagneGold + '18' : BP.glass,
                borderColor: isActive ? BP.champagneGold + '40' : BP.graphite,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(chip.id);
            }}
          >
            <ThemedText
              style={[
                s.filterChipText,
                { color: isActive ? BP.champagneGold : BP.ash },
              ]}
            >
              {chip.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// NOW TAB — Live Control Tower
// =============================================================================

function NowTab({
  colors,
  accentColor,
  data,
  activeFilter,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getBizPaymentRailsData>;
  activeFilter: RailsFilterChip;
}) {
  const filteredBatches = useMemo(
    () => data.batches.filter((b) => matchesFilter(b.state, activeFilter)),
    [data.batches, activeFilter]
  );

  const inFlightBatches = useMemo(
    () => data.batches.filter((b) => b.state === 'in_flight' || b.state === 'released'),
    [data.batches]
  );

  const inFlightTotal = useMemo(
    () => inFlightBatches.reduce((sum, b) => sum + b.totalAmount, 0),
    [inFlightBatches]
  );

  const openExceptions = useMemo(
    () => data.exceptions.filter((e) => !e.resolution),
    [data.exceptions]
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Summary Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        Real-Time Summary
      </ThemedText>
      <View style={s.kpiGrid}>
        {data.nowSummaries.map((item) => (
          <View
            key={item.id}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.kpiHeader}>
              <IconSymbol name={item.icon as any} size={18} color={item.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                {item.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{item.value}</ThemedText>
            {item.delta ? (
              <ThemedText style={[s.kpiDelta, { color: colors.textTertiary }]}>
                {item.delta}
              </ThemedText>
            ) : null}
          </View>
        ))}
      </View>

      <SectionDivider />

      {/* In-Flight Batches */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        In-Flight Batches
      </ThemedText>
      {inFlightBatches.length === 0 ? (
        <EmptyState icon="paperplane" label="No batches in flight" colors={colors} />
      ) : (
        inFlightBatches.map((batch) => (
          <BizCard key={batch.id}>
            <View style={s.cardRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.cardName, { color: BP.smoke }]}>{batch.name}</ThemedText>
                <ThemedText style={[s.cardSub, { color: BP.ash }]}>
                  {batch.entityName} / {batch.itemCount} items
                </ThemedText>
              </View>
              <View style={s.cardRight}>
                <ThemedText style={[s.cardAmount, { color: colors.text }]}>
                  {formatCurrency(batch.totalAmount)}
                </ThemedText>
                <StatusBadge
                  label={BIZ_TXN_STATE_LABELS[batch.state]}
                  color={BIZ_TXN_STATE_COLORS[batch.state]}
                />
              </View>
            </View>
            <View style={s.etaRow}>
              <IconSymbol name="clock.fill" size={12} color={BP.ash} />
              <ThemedText style={[s.etaText, { color: BP.ash }]}>
                Settlement ETA: ~1-2 business days
              </ThemedText>
            </View>
          </BizCard>
        ))
      )}

      <SectionDivider />

      {/* Exception Alerts */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        Exception Alerts
      </ThemedText>
      {openExceptions.length === 0 ? (
        <EmptyState icon="checkmark.shield" label="No open exceptions" colors={colors} />
      ) : (
        openExceptions.map((exc) => (
          <BizAlertCard
            key={exc.id}
            icon="exclamationmark.triangle.fill"
            title={exc.description}
            subtitle={`${EXCEPTION_TYPE_LABELS[exc.type]} / ${formatCurrency(exc.amount)} / ${exc.entityName}`}
            variant="error"
          />
        ))
      )}

      <SectionDivider />

      {/* Batch Status Overview */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        Batch Status Overview
      </ThemedText>
      {filteredBatches.length === 0 ? (
        <EmptyState icon="tray" label="No batches match current filter" colors={colors} />
      ) : (
        filteredBatches.map((batch) => (
          <BizCard key={batch.id}>
            <View style={s.cardRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.cardName, { color: BP.smoke }]}>{batch.name}</ThemedText>
                <ThemedText style={[s.cardSub, { color: BP.ash }]}>
                  {batch.entityName} / {batch.createdBy}
                </ThemedText>
              </View>
              <View style={s.cardRight}>
                <ThemedText style={[s.cardAmount, { color: colors.text }]}>
                  {formatCurrency(batch.totalAmount)}
                </ThemedText>
                <StatusBadge
                  label={BIZ_TXN_STATE_LABELS[batch.state]}
                  color={BIZ_TXN_STATE_COLORS[batch.state]}
                />
              </View>
            </View>
          </BizCard>
        ))
      )}

      {/* Pending Approvals Quick View */}
      {data.approvals.length > 0 && (
        <>
          <SectionDivider />
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
            Pending Approvals ({data.approvals.length})
          </ThemedText>
          {data.approvals.slice(0, 3).map((appr) => (
            <BizAlertCard
              key={appr.id}
              icon="clock.badge.exclamationmark.fill"
              title={appr.batchName}
              subtitle={`${formatCurrency(appr.amount)} / ${URGENCY_LABELS[appr.urgency]} / ${appr.requestedBy}`}
              variant={appr.urgency === 'critical' ? 'error' : appr.urgency === 'high' ? 'warning' : 'info'}
            />
          ))}
        </>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// WALLETS TAB
// =============================================================================

function WalletsTab({
  colors,
  accentColor,
  wallets,
  onSelectWallet,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  wallets: RailsWallet[];
  onSelectWallet: (wallet: RailsWallet) => void;
}) {
  const totalBalance = useMemo(
    () => wallets.reduce((sum, w) => sum + w.balance, 0),
    [wallets]
  );

  const renderWallet = useCallback(
    ({ item }: { item: RailsWallet }) => (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectWallet(item);
        }}
      >
        <BizCard>
          <View style={s.cardRow}>
            <View style={{ flex: 1 }}>
              <View style={s.walletNameRow}>
                <DotIndicator color={WALLET_STATUS_COLORS[item.status]} size={8} />
                <ThemedText style={[s.cardName, { color: BP.smoke }]}>{item.name}</ThemedText>
              </View>
              <View style={s.chipRow}>
                <StatusBadge
                  label={item.entityName}
                  color="#8B5CF6"
                />
                <StatusBadge
                  label={WALLET_TYPE_LABELS[item.type]}
                  color={WALLET_TYPE_COLORS[item.type]}
                />
              </View>
            </View>
            <View style={s.cardRight}>
              <ThemedText style={[s.walletBalance, { color: colors.text }]}>
                {formatCurrency(item.balance)}
              </ThemedText>
            </View>
          </View>
          <View style={s.walletFooter}>
            <ThemedText style={[s.walletFooterText, { color: BP.ash }]}>
              Provider: {item.provider}
            </ThemedText>
            <ThemedText style={[s.walletFooterText, { color: BP.ash }]}>
              Reconciled: {formatDate(item.lastReconciled)}
            </ThemedText>
          </View>
        </BizCard>
      </Pressable>
    ),
    [colors, onSelectWallet]
  );

  return (
    <FlatList
      data={wallets}
      keyExtractor={(item) => item.id}
      renderItem={renderWallet}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
      ListHeaderComponent={
        <BizCard style={{ marginBottom: Spacing.md }}>
          <View style={s.cardRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.totalLabel, { color: BP.ash }]}>
                Total Wallet Balance
              </ThemedText>
              <ThemedText style={[s.totalValue, { color: colors.text }]}>
                {formatCurrency(totalBalance)}
              </ThemedText>
            </View>
            <IconSymbol name="banknote.fill" size={28} color={BP.champagneGold} />
          </View>
          <ThemedText style={[s.walletCount, { color: BP.ash }]}>
            {wallets.length} wallets connected
          </ThemedText>
        </BizCard>
      }
      ListEmptyComponent={
        <EmptyState icon="wallet.pass" label="No wallets configured" colors={colors} />
      }
      ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
    />
  );
}

// =============================================================================
// BATCHES TAB
// =============================================================================

function BatchesTab({
  colors,
  accentColor,
  batches,
  activeFilter,
  onSelectBatch,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  batches: RailsBatch[];
  activeFilter: RailsFilterChip;
  onSelectBatch: (batch: RailsBatch) => void;
}) {
  const filtered = useMemo(
    () => batches.filter((b) => matchesFilter(b.state, activeFilter)),
    [batches, activeFilter]
  );

  const renderBatch = useCallback(
    ({ item }: { item: RailsBatch }) => (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectBatch(item);
        }}
      >
        <BizCard>
          <View style={s.cardRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.cardName, { color: BP.smoke }]}>{item.name}</ThemedText>
              <View style={s.chipRow}>
                <StatusBadge
                  label={BIZ_TXN_STATE_LABELS[item.state]}
                  color={BIZ_TXN_STATE_COLORS[item.state]}
                />
                <StatusBadge label={item.entityName} color="#8B5CF6" />
              </View>
            </View>
            <View style={s.cardRight}>
              <ThemedText style={[s.cardAmount, { color: colors.text }]}>
                {formatCurrency(item.totalAmount)}
              </ThemedText>
            </View>
          </View>
          <View style={s.batchMeta}>
            <View style={s.batchMetaItem}>
              <IconSymbol name="doc.on.doc" size={12} color={BP.ash} />
              <ThemedText style={[s.batchMetaText, { color: BP.ash }]}>
                {item.itemCount} items
              </ThemedText>
            </View>
            <View style={s.batchMetaItem}>
              <IconSymbol name="person.fill" size={12} color={BP.ash} />
              <ThemedText style={[s.batchMetaText, { color: BP.ash }]}>
                {item.createdBy}
              </ThemedText>
            </View>
            <View style={s.batchMetaItem}>
              <IconSymbol name="calendar" size={12} color={BP.ash} />
              <ThemedText style={[s.batchMetaText, { color: BP.ash }]}>
                {formatDate(item.createdDate)}
              </ThemedText>
            </View>
          </View>
        </BizCard>
      </Pressable>
    ),
    [colors, onSelectBatch]
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderBatch}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
      ListHeaderComponent={
        <ThemedText style={[s.resultCount, { color: BP.ash }]}>
          {filtered.length} batch{filtered.length !== 1 ? 'es' : ''}
        </ThemedText>
      }
      ListEmptyComponent={
        <EmptyState icon="tray" label="No batches match current filter" colors={colors} />
      }
      ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
    />
  );
}

// =============================================================================
// APPROVALS TAB
// =============================================================================

function ApprovalsTab({
  colors,
  accentColor,
  approvals,
  onApprove,
  onReject,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  approvals: RailsApproval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const renderApproval = useCallback(
    ({ item }: { item: RailsApproval }) => (
      <BizCard>
        <View style={s.cardRow}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.cardName, { color: BP.smoke }]}>{item.batchName}</ThemedText>
            <View style={s.chipRow}>
              <StatusBadge
                label={URGENCY_LABELS[item.urgency]}
                color={URGENCY_COLORS[item.urgency]}
              />
              <StatusBadge label={item.entityName} color="#8B5CF6" />
            </View>
          </View>
          <View style={s.cardRight}>
            <ThemedText style={[s.cardAmount, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
        </View>
        <View style={s.approvalMeta}>
          <ThemedText style={[s.approvalMetaText, { color: BP.ash }]}>
            Requested by {item.requestedBy} on {formatDate(item.requestDate)}
          </ThemedText>
        </View>
        <View style={s.actionRow}>
          <Pressable
            style={[s.actionButton, s.approveButton]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onApprove(item.id);
            }}
          >
            <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
            <ThemedText style={[s.actionButtonText, { color: '#22C55E' }]}>
              Approve
            </ThemedText>
          </Pressable>
          <Pressable
            style={[s.actionButton, s.rejectButton]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              onReject(item.id);
            }}
          >
            <IconSymbol name="xmark.circle.fill" size={16} color="#EF4444" />
            <ThemedText style={[s.actionButtonText, { color: '#EF4444' }]}>
              Reject
            </ThemedText>
          </Pressable>
        </View>
        <RoleIndicator roles="B1 / B2b" />
      </BizCard>
    ),
    [colors, onApprove, onReject]
  );

  return (
    <FlatList
      data={approvals}
      keyExtractor={(item) => item.id}
      renderItem={renderApproval}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
      ListHeaderComponent={
        <BizCard style={{ marginBottom: Spacing.md }}>
          <View style={s.cardRow}>
            <IconSymbol name="clock.badge.exclamationmark.fill" size={24} color={BP.amber} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[s.totalLabel, { color: BP.ash }]}>
                Pending Approvals
              </ThemedText>
              <ThemedText style={[s.totalValue, { color: colors.text }]}>
                {approvals.length} item{approvals.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            <ThemedText style={[s.cardAmount, { color: colors.text }]}>
              {formatCurrency(approvals.reduce((sum, a) => sum + a.amount, 0))}
            </ThemedText>
          </View>
        </BizCard>
      }
      ListEmptyComponent={
        <EmptyState icon="checkmark.seal" label="No pending approvals" colors={colors} />
      }
      ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
    />
  );
}

// =============================================================================
// RELEASE TAB
// =============================================================================

function ReleaseTab({
  colors,
  accentColor,
  releaseQueue,
  onRelease,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  releaseQueue: RailsReleaseItem[];
  onRelease: (id: string) => void;
}) {
  const renderRelease = useCallback(
    ({ item }: { item: RailsReleaseItem }) => (
      <BizCard>
        <View style={s.cardRow}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.cardName, { color: BP.smoke }]}>{item.batchName}</ThemedText>
            <View style={s.chipRow}>
              <StatusBadge label="Authorized" color="#8B5CF6" />
              <StatusBadge label={item.entityName} color="#3B82F6" />
            </View>
          </View>
          <View style={s.cardRight}>
            <ThemedText style={[s.cardAmount, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
        </View>
        <View style={s.approvalMeta}>
          <ThemedText style={[s.approvalMetaText, { color: BP.ash }]}>
            Authorized by {item.authorizedBy} on {formatDate(item.authorizedDate)}
          </ThemedText>
        </View>
        <View style={s.actionRow}>
          <Pressable
            style={[s.actionButton, s.releaseButton]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onRelease(item.id);
            }}
          >
            <IconSymbol name="arrow.up.circle.fill" size={16} color="#14B8A6" />
            <ThemedText style={[s.actionButtonText, { color: '#14B8A6' }]}>
              Release
            </ThemedText>
          </Pressable>
        </View>
        <RoleIndicator roles="B1 only" />
      </BizCard>
    ),
    [colors, onRelease]
  );

  return (
    <FlatList
      data={releaseQueue}
      keyExtractor={(item) => item.id}
      renderItem={renderRelease}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
      ListHeaderComponent={
        <BizCard style={{ marginBottom: Spacing.md }}>
          <View style={s.cardRow}>
            <IconSymbol name="arrow.up.circle.fill" size={24} color="#6366F1" />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[s.totalLabel, { color: BP.ash }]}>
                Release Queue
              </ThemedText>
              <ThemedText style={[s.totalValue, { color: colors.text }]}>
                {releaseQueue.length} batch{releaseQueue.length !== 1 ? 'es' : ''} awaiting release
              </ThemedText>
            </View>
            <ThemedText style={[s.cardAmount, { color: colors.text }]}>
              {formatCurrency(releaseQueue.reduce((sum, r) => sum + r.amount, 0))}
            </ThemedText>
          </View>
        </BizCard>
      }
      ListEmptyComponent={
        <EmptyState icon="tray" label="No batches awaiting release" colors={colors} />
      }
      ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
    />
  );
}

// =============================================================================
// EXCEPTIONS TAB
// =============================================================================

function ExceptionsTab({
  colors,
  accentColor,
  exceptions,
  activeFilter,
  onSelectException,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  exceptions: RailsException[];
  activeFilter: RailsFilterChip;
  onSelectException: (exc: RailsException) => void;
}) {
  const filtered = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'exceptions') return exceptions;
    return exceptions;
  }, [exceptions, activeFilter]);

  const openCount = useMemo(() => filtered.filter((e) => !e.resolution).length, [filtered]);
  const resolvedCount = useMemo(() => filtered.filter((e) => !!e.resolution).length, [filtered]);

  const renderException = useCallback(
    ({ item }: { item: RailsException }) => (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectException(item);
        }}
      >
        <BizCard>
          <View style={s.cardRow}>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={[s.cardName, { color: BP.smoke }]}
                numberOfLines={2}
              >
                {item.description}
              </ThemedText>
              <View style={s.chipRow}>
                <StatusBadge
                  label={EXCEPTION_TYPE_LABELS[item.type]}
                  color={EXCEPTION_TYPE_COLORS[item.type]}
                />
                <StatusBadge label={item.entityName} color="#8B5CF6" />
              </View>
            </View>
            <View style={s.cardRight}>
              <ThemedText style={[s.cardAmount, { color: EXCEPTION_TYPE_COLORS[item.type] }]}>
                {formatCurrency(item.amount)}
              </ThemedText>
            </View>
          </View>
          <View style={s.exceptionFooter}>
            <View style={s.batchMetaItem}>
              <IconSymbol name="calendar" size={12} color={BP.ash} />
              <ThemedText style={[s.batchMetaText, { color: BP.ash }]}>
                {formatDate(item.date)}
              </ThemedText>
            </View>
            <View style={s.batchMetaItem}>
              {item.resolution ? (
                <>
                  <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
                  <ThemedText
                    style={[s.batchMetaText, { color: '#22C55E' }]}
                    numberOfLines={1}
                  >
                    Resolution in progress
                  </ThemedText>
                </>
              ) : (
                <>
                  <IconSymbol name="exclamationmark.circle.fill" size={12} color="#EF4444" />
                  <ThemedText style={[s.batchMetaText, { color: '#EF4444' }]}>
                    Unresolved
                  </ThemedText>
                </>
              )}
            </View>
          </View>
        </BizCard>
      </Pressable>
    ),
    [colors, onSelectException]
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderException}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
      ListHeaderComponent={
        <View style={s.exceptionSummaryRow}>
          <BizCard style={{ flex: 1, marginRight: Spacing.sm }}>
            <View style={s.exceptionSummaryCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#EF4444" />
              <ThemedText style={[s.exceptionSummaryValue, { color: '#EF4444' }]}>
                {openCount}
              </ThemedText>
              <ThemedText style={[s.exceptionSummaryLabel, { color: BP.ash }]}>
                Open
              </ThemedText>
            </View>
          </BizCard>
          <BizCard style={{ flex: 1, marginLeft: Spacing.sm }}>
            <View style={s.exceptionSummaryCard}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#22C55E" />
              <ThemedText style={[s.exceptionSummaryValue, { color: '#22C55E' }]}>
                {resolvedCount}
              </ThemedText>
              <ThemedText style={[s.exceptionSummaryLabel, { color: BP.ash }]}>
                Resolving
              </ThemedText>
            </View>
          </BizCard>
        </View>
      }
      ListEmptyComponent={
        <EmptyState icon="checkmark.shield" label="No exceptions" colors={colors} />
      }
      ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
    />
  );
}

// =============================================================================
// DISPUTES TAB
// =============================================================================

function DisputesTab({
  colors,
  accentColor,
  disputes,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  disputes: RailsDispute[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderDispute = useCallback(
    ({ item }: { item: RailsDispute }) => {
      const isExpanded = expandedId === item.id;

      return (
        <Pressable onPress={() => toggleExpand(item.id)}>
          <BizCard>
            <View style={s.cardRow}>
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={[s.cardName, { color: BP.smoke }]}
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {item.description}
                </ThemedText>
                <View style={s.chipRow}>
                  <StatusBadge
                    label={DISPUTE_STATUS_LABELS[item.status]}
                    color={DISPUTE_STATUS_COLORS[item.status]}
                  />
                  <StatusBadge label={item.entityName} color="#8B5CF6" />
                </View>
              </View>
              <View style={s.cardRight}>
                <ThemedText style={[s.cardAmount, { color: colors.text }]}>
                  {formatCurrency(item.amount)}
                </ThemedText>
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down'}
                  size={14}
                  color={BP.ash}
                />
              </View>
            </View>

            <View style={s.disputeMetaRow}>
              <ThemedText style={[s.batchMetaText, { color: BP.ash }]}>
                Filed: {formatDate(item.filedDate)}
              </ThemedText>
            </View>

            {isExpanded && (
              <View style={s.disputeExpandedContent}>
                {/* Timeline */}
                <ThemedText style={[s.disputeSectionLabel, { color: BP.smoke }]}>
                  Timeline
                </ThemedText>
                {item.timeline.map((event, idx) => (
                  <View key={idx} style={s.timelineItem}>
                    <View style={s.timelineDotLine}>
                      <DotIndicator
                        color={idx === item.timeline.length - 1 ? BP.champagneGold : BP.ash}
                        size={8}
                      />
                      {idx < item.timeline.length - 1 && (
                        <View style={s.timelineLine} />
                      )}
                    </View>
                    <View style={s.timelineContent}>
                      <ThemedText style={[s.timelineDate, { color: BP.ash }]}>
                        {formatDate(event.date)}
                      </ThemedText>
                      <ThemedText style={[s.timelineAction, { color: BP.smoke }]}>
                        {event.action}
                      </ThemedText>
                    </View>
                  </View>
                ))}

                {/* Receipt Chain */}
                {item.receiptChain.length > 0 && (
                  <>
                    <ThemedText
                      style={[s.disputeSectionLabel, { color: BP.smoke, marginTop: Spacing.md }]}
                    >
                      Receipt Chain
                    </ThemedText>
                    <View style={s.receiptChainRow}>
                      {item.receiptChain.map((rcpId, idx) => (
                        <View key={rcpId} style={s.receiptChainItem}>
                          <IconSymbol name="doc.text.fill" size={14} color={BP.champagneGold} />
                          <ThemedText style={[s.receiptChainText, { color: BP.ash }]}>
                            {rcpId}
                          </ThemedText>
                          {idx < item.receiptChain.length - 1 && (
                            <IconSymbol
                              name="arrow.right"
                              size={10}
                              color={BP.graphite}
                            />
                          )}
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}
          </BizCard>
        </Pressable>
      );
    },
    [colors, expandedId, toggleExpand]
  );

  return (
    <FlatList
      data={disputes}
      keyExtractor={(item) => item.id}
      renderItem={renderDispute}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
      ListHeaderComponent={
        <BizCard style={{ marginBottom: Spacing.md }}>
          <View style={s.cardRow}>
            <IconSymbol name="exclamationmark.bubble.fill" size={24} color={BP.amber} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[s.totalLabel, { color: BP.ash }]}>
                Active Disputes
              </ThemedText>
              <ThemedText style={[s.totalValue, { color: colors.text }]}>
                {disputes.filter((d) => d.status !== 'closed').length} open
              </ThemedText>
            </View>
            <ThemedText style={[s.cardAmount, { color: colors.text }]}>
              {formatCurrency(
                disputes
                  .filter((d) => d.status !== 'closed' && d.status !== 'resolved')
                  .reduce((sum, d) => sum + d.amount, 0)
              )}
            </ThemedText>
          </View>
        </BizCard>
      }
      ListEmptyComponent={
        <EmptyState icon="checkmark.bubble" label="No disputes on file" colors={colors} />
      }
      ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
    />
  );
}

// =============================================================================
// RECEIPTS TAB
// =============================================================================

function ReceiptsTab({
  colors,
  accentColor,
  receipts,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  receipts: BizReceipt[];
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return receipts;
    const q = search.toLowerCase();
    return receipts.filter(
      (r) =>
        r.action.toLowerCase().includes(q) ||
        r.actor.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }, [receipts, search]);

  const renderReceipt = useCallback(
    ({ item }: { item: BizReceipt }) => {
      const entityName = SEEDED_ENTITY_NAMES[item.linkedEntity] ?? item.linkedEntity;
      return (
        <BizCard>
          <View style={s.cardRow}>
            <View style={s.receiptIconWrap}>
              <IconSymbol
                name="doc.text.fill"
                size={16}
                color={RECEIPT_TYPE_COLORS[item.type]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={[s.cardName, { color: BP.smoke }]}
                numberOfLines={2}
              >
                {item.action}
              </ThemedText>
              <View style={s.chipRow}>
                <StatusBadge
                  label={RECEIPT_TYPE_LABELS[item.type]}
                  color={RECEIPT_TYPE_COLORS[item.type]}
                />
                <StatusBadge label={entityName} color="#8B5CF6" />
              </View>
            </View>
          </View>
          <View style={s.receiptFooter}>
            <View style={s.batchMetaItem}>
              <IconSymbol name="person.fill" size={12} color={BP.ash} />
              <ThemedText style={[s.batchMetaText, { color: BP.ash }]}>
                {item.actor}
              </ThemedText>
            </View>
            <View style={s.batchMetaItem}>
              <IconSymbol name="clock.fill" size={12} color={BP.ash} />
              <ThemedText style={[s.batchMetaText, { color: BP.ash }]}>
                {formatTimestamp(item.timestamp)}
              </ThemedText>
            </View>
          </View>
          <View style={s.immutableBadge}>
            <IconSymbol name="lock.fill" size={9} color={BP.ash} />
            <ThemedText style={s.immutableText}>Immutable</ThemedText>
          </View>
        </BizCard>
      );
    },
    [colors]
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderReceipt}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
      ListHeaderComponent={
        <View style={{ marginBottom: Spacing.md }}>
          <View style={[s.searchContainer, { borderColor: colors.border }]}>
            <IconSymbol name="magnifyingglass" size={16} color={BP.ash} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Search receipts..."
              placeholderTextColor={BP.ash}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <IconSymbol name="xmark.circle.fill" size={16} color={BP.ash} />
              </Pressable>
            )}
          </View>
          <ThemedText style={[s.resultCount, { color: BP.ash }]}>
            {filtered.length} receipt{filtered.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>
      }
      ListEmptyComponent={
        <EmptyState icon="doc.text.magnifyingglass" label="No receipts found" colors={colors} />
      }
      ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
    />
  );
}

// =============================================================================
// ADMIN TAB
// =============================================================================

function AdminTab({
  colors,
  accentColor,
  adminConfig,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  adminConfig: RailsAdminConfig[];
}) {
  const grouped = useMemo(() => {
    const groups: Record<string, RailsAdminConfig[]> = {};
    for (const cfg of adminConfig) {
      if (!groups[cfg.category]) groups[cfg.category] = [];
      groups[cfg.category].push(cfg);
    }
    return groups;
  }, [adminConfig]);

  const categoryOrder = ['provider', 'webhook', 'limit', 'general'] as const;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <BizAlertCard
        icon="lock.shield.fill"
        title="Admin Configuration"
        subtitle="Changes require B1 (Founder/CEO) authorization"
        variant="info"
      />

      {categoryOrder.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        return (
          <View key={cat}>
            <View style={s.adminCategoryHeader}>
              <StatusBadge
                label={ADMIN_CATEGORY_LABELS[cat]}
                color={ADMIN_CATEGORY_COLORS[cat]}
              />
              <ThemedText style={[s.adminCategoryCount, { color: BP.ash }]}>
                {items.length} setting{items.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            {items.map((cfg) => (
              <BizCard key={cfg.id}>
                <View style={s.adminConfigRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.adminConfigLabel, { color: BP.smoke }]}>
                      {cfg.label}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[s.adminConfigValue, { color: BP.champagneGold }]}
                    numberOfLines={1}
                  >
                    {cfg.value}
                  </ThemedText>
                </View>
              </BizCard>
            ))}
          </View>
        );
      })}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// BATCH DETAIL BOTTOM SHEET
// =============================================================================

function BatchDetailSheet({
  visible,
  onClose,
  batch,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  batch: RailsBatch | null;
  colors: typeof Colors.light;
}) {
  if (!batch) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={batch.name} useModal>
      <View style={s.sheetContent}>
        {/* Batch Summary */}
        <View style={s.sheetSummary}>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>State</ThemedText>
            <StatusBadge
              label={BIZ_TXN_STATE_LABELS[batch.state]}
              color={BIZ_TXN_STATE_COLORS[batch.state]}
            />
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Entity</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {batch.entityName}
            </ThemedText>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Total</ThemedText>
            <ThemedText style={[s.sheetValueBold, { color: colors.text }]}>
              {formatCurrency(batch.totalAmount)}
            </ThemedText>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Created By</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {batch.createdBy}
            </ThemedText>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Date</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {formatDate(batch.createdDate)}
            </ThemedText>
          </View>
        </View>

        <SectionDivider />

        {/* Batch Items */}
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
          Items ({batch.items.length})
        </ThemedText>
        {batch.items.map((item) => (
          <View
            key={item.id}
            style={[s.batchItemCard, { borderColor: colors.border }]}
          >
            <View style={s.cardRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.batchItemDesc, { color: BP.smoke }]}>
                  {item.description}
                </ThemedText>
                <ThemedText style={[s.batchItemRecipient, { color: BP.ash }]}>
                  {item.recipient}
                </ThemedText>
              </View>
              <View style={s.cardRight}>
                <ThemedText style={[s.cardAmount, { color: colors.text }]}>
                  {formatCurrency(item.amount)}
                </ThemedText>
                <StatusBadge
                  label={BIZ_TXN_STATE_LABELS[item.state]}
                  color={BIZ_TXN_STATE_COLORS[item.state]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// WALLET DETAIL BOTTOM SHEET
// =============================================================================

function WalletDetailSheet({
  visible,
  onClose,
  wallet,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  wallet: RailsWallet | null;
  colors: typeof Colors.light;
}) {
  if (!wallet) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={wallet.name} useModal>
      <View style={s.sheetContent}>
        <View style={s.walletDetailBalance}>
          <ThemedText style={[s.walletDetailBalanceLabel, { color: BP.ash }]}>
            Current Balance
          </ThemedText>
          <ThemedText style={[s.walletDetailBalanceValue, { color: colors.text }]}>
            ${wallet.balance.toLocaleString()}
          </ThemedText>
        </View>

        <SectionDivider />

        <View style={s.sheetSummary}>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Entity</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {wallet.entityName}
            </ThemedText>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Type</ThemedText>
            <StatusBadge
              label={WALLET_TYPE_LABELS[wallet.type]}
              color={WALLET_TYPE_COLORS[wallet.type]}
            />
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Provider</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {wallet.provider}
            </ThemedText>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Status</ThemedText>
            <View style={s.walletStatusRow}>
              <DotIndicator color={WALLET_STATUS_COLORS[wallet.status]} size={8} />
              <ThemedText style={[s.sheetValue, { color: BP.smoke, textTransform: 'capitalize' }]}>
                {wallet.status}
              </ThemedText>
            </View>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Last Reconciled</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {formatDate(wallet.lastReconciled)}
            </ThemedText>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// EXCEPTION DETAIL BOTTOM SHEET
// =============================================================================

function ExceptionDetailSheet({
  visible,
  onClose,
  exception,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  exception: RailsException | null;
  colors: typeof Colors.light;
}) {
  if (!exception) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Exception Detail" useModal>
      <View style={s.sheetContent}>
        <View style={s.sheetSummary}>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Type</ThemedText>
            <StatusBadge
              label={EXCEPTION_TYPE_LABELS[exception.type]}
              color={EXCEPTION_TYPE_COLORS[exception.type]}
            />
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Amount</ThemedText>
            <ThemedText
              style={[s.sheetValueBold, { color: EXCEPTION_TYPE_COLORS[exception.type] }]}
            >
              {formatCurrency(exception.amount)}
            </ThemedText>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Entity</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {exception.entityName}
            </ThemedText>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Date</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {formatDate(exception.date)}
            </ThemedText>
          </View>
          <View style={s.sheetSummaryRow}>
            <ThemedText style={[s.sheetLabel, { color: BP.ash }]}>Batch ID</ThemedText>
            <ThemedText style={[s.sheetValue, { color: BP.smoke }]}>
              {exception.batchId}
            </ThemedText>
          </View>
        </View>

        <SectionDivider />

        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.exceptionDescText, { color: BP.smoke }]}>
          {exception.description}
        </ThemedText>

        <SectionDivider />

        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Resolution</ThemedText>
        {exception.resolution ? (
          <View style={s.resolutionBox}>
            <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
            <ThemedText style={[s.resolutionText, { color: BP.smoke }]}>
              {exception.resolution}
            </ThemedText>
          </View>
        ) : (
          <View style={s.resolutionBox}>
            <IconSymbol name="exclamationmark.circle.fill" size={14} color="#EF4444" />
            <ThemedText style={[s.resolutionText, { color: BP.ash }]}>
              No resolution yet. Awaiting action.
            </ThemedText>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// NEW BATCH BOTTOM SHEET
// =============================================================================

function NewBatchSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  const [batchName, setBatchName] = useState('');
  const [batchEntity, setBatchEntity] = useState('KaNeXT OpsCo');

  const entities = ['KaNeXT HoldCo', 'KaNeXT OpsCo', 'Sponsor Bank'];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New Batch" useModal>
      <View style={s.sheetContent}>
        <ThemedText style={[s.sheetLabel, { color: BP.ash, marginBottom: Spacing.xs }]}>
          Batch Name
        </ThemedText>
        <View style={[s.searchContainer, { borderColor: colors.border, marginBottom: Spacing.md }]}>
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Enter batch name..."
            placeholderTextColor={BP.ash}
            value={batchName}
            onChangeText={setBatchName}
            autoCapitalize="words"
          />
        </View>

        <ThemedText style={[s.sheetLabel, { color: BP.ash, marginBottom: Spacing.xs }]}>
          Entity
        </ThemedText>
        <View style={s.entityPicker}>
          {entities.map((ent) => (
            <Pressable
              key={ent}
              style={[
                s.entityPickerItem,
                {
                  backgroundColor: batchEntity === ent ? BP.champagneGold + '18' : BP.glass,
                  borderColor: batchEntity === ent ? BP.champagneGold + '40' : BP.graphite,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setBatchEntity(ent);
              }}
            >
              <ThemedText
                style={[
                  s.entityPickerText,
                  { color: batchEntity === ent ? BP.champagneGold : BP.ash },
                ]}
              >
                {ent}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[
            s.sheetActionButton,
            { opacity: batchName.trim() ? 1 : 0.4 },
          ]}
          onPress={() => {
            if (batchName.trim()) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onClose();
            }
          }}
          disabled={!batchName.trim()}
        >
          <IconSymbol name="plus.circle.fill" size={18} color={BP.obsidian} />
          <ThemedText style={s.sheetActionButtonText}>Create Batch</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// QUICK PAY BOTTOM SHEET
// =============================================================================

function QuickPaySheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Quick Pay" useModal>
      <View style={s.sheetContent}>
        <ThemedText style={[s.sheetLabel, { color: BP.ash, marginBottom: Spacing.xs }]}>
          Recipient
        </ThemedText>
        <View style={[s.searchContainer, { borderColor: colors.border, marginBottom: Spacing.md }]}>
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Recipient name..."
            placeholderTextColor={BP.ash}
            value={recipient}
            onChangeText={setRecipient}
            autoCapitalize="words"
          />
        </View>

        <ThemedText style={[s.sheetLabel, { color: BP.ash, marginBottom: Spacing.xs }]}>
          Amount ($)
        </ThemedText>
        <View style={[s.searchContainer, { borderColor: colors.border, marginBottom: Spacing.md }]}>
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={BP.ash}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <ThemedText style={[s.sheetLabel, { color: BP.ash, marginBottom: Spacing.xs }]}>
          Description
        </ThemedText>
        <View style={[s.searchContainer, { borderColor: colors.border, marginBottom: Spacing.md }]}>
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Payment description..."
            placeholderTextColor={BP.ash}
            value={description}
            onChangeText={setDescription}
            autoCapitalize="sentences"
          />
        </View>

        <Pressable
          style={[
            s.sheetActionButton,
            { opacity: recipient.trim() && amount.trim() ? 1 : 0.4 },
          ]}
          onPress={() => {
            if (recipient.trim() && amount.trim()) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onClose();
            }
          }}
          disabled={!recipient.trim() || !amount.trim()}
        >
          <IconSymbol name="bolt.fill" size={18} color={BP.obsidian} />
          <ThemedText style={s.sheetActionButtonText}>Send Payment</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// RECONCILE BOTTOM SHEET
// =============================================================================

function ReconcileSheet({
  visible,
  onClose,
  wallets,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  wallets: RailsWallet[];
  colors: typeof Colors.light;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Reconcile Wallets" useModal>
      <View style={s.sheetContent}>
        <BizAlertCard
          icon="arrow.triangle.2.circlepath"
          title="Wallet Reconciliation"
          subtitle="Sync all wallet balances with providers"
          variant="info"
        />

        {wallets.map((wallet) => (
          <BizCard key={wallet.id}>
            <View style={s.cardRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.cardName, { color: BP.smoke }]}>{wallet.name}</ThemedText>
                <ThemedText style={[s.cardSub, { color: BP.ash }]}>
                  Last: {formatDate(wallet.lastReconciled)}
                </ThemedText>
              </View>
              <View style={s.cardRight}>
                <DotIndicator color={WALLET_STATUS_COLORS[wallet.status]} size={8} />
                <ThemedText
                  style={[s.sheetValue, { color: BP.smoke, textTransform: 'capitalize' }]}
                >
                  {wallet.status}
                </ThemedText>
              </View>
            </View>
          </BizCard>
        ))}

        <Pressable
          style={s.sheetActionButton}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onClose();
          }}
        >
          <IconSymbol name="arrow.triangle.2.circlepath" size={18} color={BP.obsidian} />
          <ThemedText style={s.sheetActionButtonText}>Run Reconciliation</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BizOrgPaymentRailsV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: Only B1 and B2b (board) can access payment rails ===
  if (!isBoardLevel(role)) {
    return <BizEmptyLock title="Payment Rails" message="This section is restricted. Contact the Founder for access." />;
  }

  // --- Data ---
  const data = useMemo(() => getBizPaymentRailsData(), []);

  // --- State ---
  const [activeSubTab, setActiveSubTab] = useState<RailsSubTabId>('now');
  const [activeFilter, setActiveFilter] = useState<RailsFilterChip>('all');

  // Bottom sheets
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [showQuickPay, setShowQuickPay] = useState(false);
  const [showReconcile, setShowReconcile] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<RailsBatch | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<RailsWallet | null>(null);
  const [selectedExc, setSelectedExc] = useState<RailsException | null>(null);

  // --- Callbacks ---
  const handleNewBatch = useCallback(() => setShowNewBatch(true), []);
  const handleQuickPay = useCallback(() => setShowQuickPay(true), []);
  const handleReconcile = useCallback(() => setShowReconcile(true), []);

  const handleApprove = useCallback((id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleReject = useCallback((id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const handleRelease = useCallback((id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // --- Sub-tab render ---
  const renderContent = useMemo(() => {
    switch (activeSubTab) {
      case 'now':
        return (
          <NowTab
            colors={colors}
            accentColor={accentColor}
            data={data}
            activeFilter={activeFilter}
          />
        );
      case 'wallets':
        return (
          <WalletsTab
            colors={colors}
            accentColor={accentColor}
            wallets={data.wallets}
            onSelectWallet={setSelectedWallet}
          />
        );
      case 'batches':
        return (
          <BatchesTab
            colors={colors}
            accentColor={accentColor}
            batches={data.batches}
            activeFilter={activeFilter}
            onSelectBatch={setSelectedBatch}
          />
        );
      case 'approvals':
        return (
          <ApprovalsTab
            colors={colors}
            accentColor={accentColor}
            approvals={data.approvals}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        );
      case 'release':
        return (
          <ReleaseTab
            colors={colors}
            accentColor={accentColor}
            releaseQueue={data.releaseQueue}
            onRelease={handleRelease}
          />
        );
      case 'exceptions':
        return (
          <ExceptionsTab
            colors={colors}
            accentColor={accentColor}
            exceptions={data.exceptions}
            activeFilter={activeFilter}
            onSelectException={setSelectedExc}
          />
        );
      case 'disputes':
        return (
          <DisputesTab
            colors={colors}
            accentColor={accentColor}
            disputes={data.disputes}
          />
        );
      case 'receipts':
        return (
          <ReceiptsTab
            colors={colors}
            accentColor={accentColor}
            receipts={data.receipts}
          />
        );
      case 'admin':
        return (
          <AdminTab
            colors={colors}
            accentColor={accentColor}
            adminConfig={data.adminConfig}
          />
        );
      default:
        return null;
    }
  }, [
    activeSubTab,
    activeFilter,
    colors,
    accentColor,
    data,
    handleApprove,
    handleReject,
    handleRelease,
  ]);

  return (
    <View style={s.root}>
      {/* ── STICKY HEADER ── */}
      <View style={s.stickyHeader}>
        {/* Row 1: Health Strip */}
        <HealthStrip dots={data.healthDots} />

        {/* Row 2: CTA Buttons */}
        <CTAButtons
          onNewBatch={handleNewBatch}
          onQuickPay={handleQuickPay}
          onReconcile={handleReconcile}
        />

        {/* Row 3: Filter Chips */}
        <FilterChips activeFilter={activeFilter} onSelect={setActiveFilter} />
      </View>

      {/* ── SUB-TAB BAR ── */}
      <BizSubTabBar
        tabs={RAILS_SUB_TABS.map((t) => ({ id: t.id, label: t.label }))}
        activeId={activeSubTab}
        onSelect={(id) => setActiveSubTab(id as RailsSubTabId)}
      />

      {/* ── CONTENT ── */}
      <View style={s.contentContainer}>
        {renderContent}
      </View>

      {/* ── BOTTOM SHEETS ── */}
      <BatchDetailSheet
        visible={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        batch={selectedBatch}
        colors={colors}
      />
      <WalletDetailSheet
        visible={!!selectedWallet}
        onClose={() => setSelectedWallet(null)}
        wallet={selectedWallet}
        colors={colors}
      />
      <ExceptionDetailSheet
        visible={!!selectedExc}
        onClose={() => setSelectedExc(null)}
        exception={selectedExc}
        colors={colors}
      />
      <NewBatchSheet
        visible={showNewBatch}
        onClose={() => setShowNewBatch(false)}
        colors={colors}
      />
      <QuickPaySheet
        visible={showQuickPay}
        onClose={() => setShowQuickPay(false)}
        colors={colors}
      />
      <ReconcileSheet
        visible={showReconcile}
        onClose={() => setShowReconcile(false)}
        wallets={data.wallets}
        colors={colors}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Root
  root: {
    flex: 1,
  },

  // Sticky Header
  stickyHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: BP.graphite,
    backgroundColor: BP.obsidian,
  },

  // Health Strip
  healthStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
  },
  healthDotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthDotLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BP.ash,
  },

  // CTA Buttons
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  ctaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BP.champagneGold + '30',
    backgroundColor: BP.champagneGold + '08',
  },
  ctaButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: BP.champagneGold,
    letterSpacing: 0.3,
  },

  // Filter Chips
  filterChipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Content Container
  contentContainer: {
    flex: 1,
  },

  // Tab Scroll
  tabScroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  // Section Divider
  sectionDivider: {
    height: 1,
    backgroundColor: BP.graphite,
    marginVertical: Spacing.md,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  kpiDelta: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Card Shared
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Chip Row
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ETA Row
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BP.graphite,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Wallet
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BP.graphite,
  },
  walletFooterText: {
    fontSize: 11,
    fontWeight: '500',
  },
  walletCount: {
    fontSize: 12,
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // Batch Meta
  batchMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BP.graphite,
  },
  batchMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batchMetaText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Result Count
  resultCount: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },

  // Approval
  approvalMeta: {
    marginTop: Spacing.sm,
  },
  approvalMetaText: {
    fontSize: 12,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BP.graphite,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  approveButton: {
    borderColor: '#22C55E30',
    backgroundColor: '#22C55E10',
  },
  rejectButton: {
    borderColor: '#EF444430',
    backgroundColor: '#EF444410',
  },
  releaseButton: {
    borderColor: '#14B8A630',
    backgroundColor: '#14B8A610',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Role Indicator
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    alignSelf: 'flex-end',
  },
  roleIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    letterSpacing: 0.3,
  },

  // Exception
  exceptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BP.graphite,
  },
  exceptionSummaryRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  exceptionSummaryCard: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  exceptionSummaryValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  exceptionSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Dispute
  disputeMetaRow: {
    marginTop: Spacing.sm,
  },
  disputeExpandedContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BP.graphite,
  },
  disputeSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineDotLine: {
    alignItems: 'center',
    width: 20,
    paddingTop: 4,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: BP.graphite,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  timelineDate: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineAction: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Receipt Chain
  receiptChainRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  receiptChainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptChainText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },

  // Receipts Tab
  receiptIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BP.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BP.graphite,
  },
  immutableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    alignSelf: 'flex-end',
  },
  immutableText: {
    fontSize: 9,
    fontWeight: '700',
    color: BP.ash,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: Spacing.sm,
    backgroundColor: BP.carbon,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },

  // Admin
  adminCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  adminCategoryCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  adminConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  adminConfigLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminConfigValue: {
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '50%',
    textAlign: 'right',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },

  // Sheet
  sheetContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sheetSummary: {
    gap: Spacing.sm,
  },
  sheetSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  sheetValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Batch Detail Item
  batchItemCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: BP.glass,
  },
  batchItemDesc: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  batchItemRecipient: {
    fontSize: 12,
  },

  // Wallet Detail
  walletDetailBalance: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  walletDetailBalanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  walletDetailBalanceValue: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  walletStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Exception Detail
  exceptionDescText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  resolutionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: BP.glass,
  },
  resolutionText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  // Sheet Action Button
  sheetActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: BP.champagneGold,
    marginTop: Spacing.lg,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: BP.obsidian,
  },

  // Entity Picker
  entityPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  entityPickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  entityPickerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default BizOrgPaymentRailsV2;
