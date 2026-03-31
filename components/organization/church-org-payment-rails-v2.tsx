/**
 * Church Organization Payment Rails V2 — Money-movement execution layer.
 * Sub-tabs: Now | Wallets | Batches | Approvals | Releases | Exceptions | Returns | Receipts | Admin
 * RBAC: C1/C2 full 9-tab access, C3 limited (Now + Wallets), C4/C5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isElderLevel, isStaffLevel } from '@/utils/church-rbac';
import {
  getChurchPaymentRailsData,
  getWalletByFund,
  getTransactionById,
  RAILS_STATUS_COLORS,
  RAIL_METHOD_LABELS,
  RAIL_METHOD_ICONS,
  TRANSACTION_STATE_LABELS,
  TRANSACTION_STATE_COLORS,
  BATCH_TYPE_LABELS,
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_TYPE_COLORS,
  EXCEPTION_CAUSE_LABELS,
} from '@/data/mock-church-org-payment-rails';
import type {
  RailsWallet,
  RailsTransaction,
  RailsBatch,
  RailsApprovalItem,
  RailsReleaseItem,
  RailsException,
  RailsReturn,
  RailsReceipt,
  GivingAllocation,
  TransactionState,
  FundType,
} from '@/data/mock-church-org-payment-rails';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.church;
const SUB_TABS = [
  { id: 'control_tower', label: 'Now' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'batches', label: 'Batches' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'releases', label: 'Releases' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'returns', label: 'Returns' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'admin', label: 'Admin' },
];

const FUND_COLORS: Record<FundType, string> = {
  general: ACCENT,
  missions: '#5A8A6E',
  benevolence: ACCENT,
  building: '#B8943E',
  youth: ACCENT,
};

const FUND_LABELS: Record<FundType, string> = {
  general: 'General',
  missions: 'Missions',
  benevolence: 'Benevolence',
  building: 'Building',
  youth: 'Youth',
};

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

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
// RAILS HEALTH STRIP
// =============================================================================

function RailsHealthStrip({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: ReturnType<typeof getChurchPaymentRailsData>;
}) {
  const health = data.healthStatus;
  const statusColor = RAILS_STATUS_COLORS[health.status];
  const statusLabel = health.status.toUpperCase();

  return (
    <View style={[s.healthStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Status line */}
      <View style={s.healthRow}>
        <View style={[s.healthDot, { backgroundColor: statusColor }]} />
        <ThemedText style={[s.healthLabel, { color: colors.text }]}>
          Rails: {statusLabel}
        </ThemedText>
      </View>

      {/* Connected methods */}
      <View style={s.healthMethodsRow}>
        {health.connectedMethods.map((cm) => (
          <View key={cm.method} style={s.healthMethodItem}>
            <View
              style={[
                s.healthMethodDot,
                { backgroundColor: cm.active ? '#5A8A6E' : '#B85C5C' },
              ]}
            />
            <ThemedText style={[s.healthMethodText, { color: colors.textSecondary }]}>
              {RAIL_METHOD_LABELS[cm.method]}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Next settlement */}
      <ThemedText style={[s.healthSettlement, { color: colors.textSecondary }]}>
        Next settlement: {health.nextSettlementWindow}
      </ThemedText>

      {/* Compact stats */}
      <View style={s.healthStatsRow}>
        <ThemedText style={[s.healthStat, { color: colors.textTertiary }]}>
          Holds: {health.holdsCount}
        </ThemedText>
        <ThemedText style={[s.healthStatDivider, { color: colors.textTertiary }]}>|</ThemedText>
        <ThemedText style={[s.healthStat, { color: health.failedCount24h > 0 ? '#B85C5C' : colors.textTertiary }]}>
          Failed: {health.failedCount24h}
        </ThemedText>
        <ThemedText style={[s.healthStatDivider, { color: colors.textTertiary }]}>|</ThemedText>
        <ThemedText style={[s.healthStat, { color: colors.textTertiary }]}>
          Disputes: {health.disputesCount}
        </ThemedText>
        <ThemedText style={[s.healthStatDivider, { color: colors.textTertiary }]}>|</ThemedText>
        <ThemedText style={[s.healthStat, { color: colors.textTertiary }]}>
          Audit: {health.auditCompleteness}%
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// CONTROL TOWER TAB ("Now")
// =============================================================================

function ControlTowerTab({
  colors,
  accentColor,
  data,
  onSelectTransaction,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchPaymentRailsData>;
  onSelectTransaction: (txn: RailsTransaction) => void;
}) {
  const needsApproval = data.transactions.filter(
    (t) => t.state === 'proposed' || t.state === 'rule_checked',
  );
  const readyToRelease = data.transactions.filter(
    (t) => t.state === 'authorized' || t.state === 'scheduled',
  );
  const inFlight = data.transactions.filter((t) => t.state === 'in_flight');
  const exceptions = data.transactions.filter(
    (t) => t.state === 'held' || t.state === 'failed' || t.state === 'returned' || t.state === 'disputed',
  );

  const renderLane = (
    title: string,
    laneColor: string,
    items: RailsTransaction[],
    maxShow: number,
  ) => (
    <View style={[s.laneSection, { borderLeftColor: laneColor }]}>
      <View style={s.laneHeader}>
        <ThemedText style={[s.laneTitle, { color: colors.text }]}>{title}</ThemedText>
        <View style={[s.countBadge, { backgroundColor: laneColor + '20' }]}>
          <ThemedText style={[s.countBadgeText, { color: laneColor }]}>{items.length}</ThemedText>
        </View>
      </View>

      {items.slice(0, maxShow).map((txn) => {
        const stateColor = TRANSACTION_STATE_COLORS[txn.state];
        return (
          <Pressable
            key={txn.id}
            style={[s.laneCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectTransaction(txn);
            }}
          >
            <View style={s.laneCardTop}>
              <IconSymbol
                name={RAIL_METHOD_ICONS[txn.method] as any}
                size={16}
                color={accentColor}
              />
              <ThemedText style={[s.laneAmount, { color: colors.text }]}>
                {formatCurrency(txn.amount)}
              </ThemedText>
              <StatusBadge
                label={TRANSACTION_STATE_LABELS[txn.state].toUpperCase()}
                color={stateColor}
              />
            </View>
            <ThemedText style={[s.lanePayee, { color: colors.textSecondary }]} numberOfLines={1}>
              {FUND_LABELS[txn.fromFund]} {'\u2192'} {txn.toPayeeMasked ? '***' : txn.toPayee}
            </ThemedText>
            <ThemedText style={[s.laneImpact, { color: colors.textTertiary }]} numberOfLines={1}>
              {txn.impact}
            </ThemedText>
            <View style={s.laneCardBottom}>
              <ThemedText style={[s.laneOwner, { color: colors.textTertiary }]}>
                {txn.nextOwner}
              </ThemedText>
              {txn.deadline && (
                <ThemedText style={[s.laneDeadline, { color: colors.textTertiary }]}>
                  Due: {formatDate(txn.deadline)}
                </ThemedText>
              )}
            </View>
          </Pressable>
        );
      })}

      {items.length > maxShow && (
        <Pressable
          style={s.viewAllButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <ThemedText style={[s.viewAllText, { color: accentColor }]}>
            View All ({items.length})
          </ThemedText>
        </Pressable>
      )}

      {items.length === 0 && (
        <ThemedText style={[s.laneEmpty, { color: colors.textTertiary }]}>
          No items
        </ThemedText>
      )}
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {renderLane('Needs Approval', '#B8943E', needsApproval, 3)}
      {renderLane('Ready to Release', ACCENT, readyToRelease, 3)}
      {renderLane('In Flight', '#5A8A6E', inFlight, 3)}
      {renderLane('Exceptions', '#B85C5C', exceptions, 3)}
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
  const renderItem = useCallback(
    ({ item }: { item: RailsWallet }) => {
      const fundColor = FUND_COLORS[item.fundType] || accentColor;
      return (
        <Pressable
          style={[s.walletCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectWallet(item);
          }}
        >
          <View style={s.walletCardTop}>
            <View style={[s.walletIconCircle, { backgroundColor: fundColor + '18' }]}>
              <IconSymbol name="banknote.fill" size={18} color={fundColor} />
            </View>
            <View style={s.walletNameCol}>
              <ThemedText style={[s.walletName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <StatusBadge label={FUND_LABELS[item.fundType].toUpperCase()} color={fundColor} />
            </View>
          </View>

          {/* Balance breakdown */}
          <View style={[s.walletBalances, { borderTopColor: colors.border }]}>
            <View style={s.walletBalanceItem}>
              <ThemedText style={[s.walletBalanceValue, { color: '#5A8A6E' }]}>
                {formatCurrency(item.available)}
              </ThemedText>
              <ThemedText style={[s.walletBalanceLabel, { color: colors.textTertiary }]}>
                Available
              </ThemedText>
            </View>
            <View style={s.walletBalanceItem}>
              <ThemedText style={[s.walletBalanceValue, { color: '#B8943E' }]}>
                {formatCurrency(item.committed)}
              </ThemedText>
              <ThemedText style={[s.walletBalanceLabel, { color: colors.textTertiary }]}>
                Committed
              </ThemedText>
            </View>
            <View style={s.walletBalanceItem}>
              <ThemedText style={[s.walletBalanceValue, { color: ACCENT }]}>
                {formatCurrency(item.pendingInflows)}
              </ThemedText>
              <ThemedText style={[s.walletBalanceLabel, { color: colors.textTertiary }]}>
                Pending In
              </ThemedText>
            </View>
            <View style={s.walletBalanceItem}>
              <ThemedText style={[s.walletBalanceValue, { color: '#B8943E' }]}>
                {formatCurrency(item.pendingOutflows)}
              </ThemedText>
              <ThemedText style={[s.walletBalanceLabel, { color: colors.textTertiary }]}>
                Pending Out
              </ThemedText>
            </View>
          </View>

          {/* Controls */}
          <ThemedText style={[s.walletControls, { color: colors.textTertiary }]} numberOfLines={1}>
            {item.controls}
          </ThemedText>

          {/* Bottom row: exceptions + rail methods */}
          <View style={s.walletBottomRow}>
            {item.exceptionsCount > 0 && (
              <StatusBadge
                label={`${item.exceptionsCount} EXCEPTION${item.exceptionsCount > 1 ? 'S' : ''}`}
                color="#B85C5C"
              />
            )}
            <View style={s.walletRailIcons}>
              {item.allowedRails.map((rail) => (
                <IconSymbol
                  key={rail}
                  name={RAIL_METHOD_ICONS[rail] as any}
                  size={14}
                  color={colors.textSecondary}
                />
              ))}
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectWallet],
  );

  return (
    <FlatList
      data={wallets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="banknote.fill" label="No wallets configured" colors={colors} />
      }
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
  onSelectBatch,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  batches: RailsBatch[];
  onSelectBatch: (batch: RailsBatch) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: RailsBatch }) => {
      const stateColor = TRANSACTION_STATE_COLORS[item.state];
      const typeLabel = BATCH_TYPE_LABELS[item.type];
      return (
        <Pressable
          style={[s.batchCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectBatch(item);
          }}
        >
          <View style={s.batchCardTop}>
            <View style={s.batchNameCol}>
              <ThemedText style={[s.batchName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={s.batchBadgeRow}>
                <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
                <StatusBadge
                  label={TRANSACTION_STATE_LABELS[item.state].toUpperCase()}
                  color={stateColor}
                />
              </View>
            </View>
          </View>

          <View style={[s.batchDetails, { borderTopColor: colors.border }]}>
            <View style={s.batchDetailItem}>
              <ThemedText style={[s.batchDetailValue, { color: colors.text }]}>
                {item.recipientCount}
              </ThemedText>
              <ThemedText style={[s.batchDetailLabel, { color: colors.textTertiary }]}>
                Recipients
              </ThemedText>
            </View>
            <View style={s.batchDetailItem}>
              <ThemedText style={[s.batchDetailValue, { color: colors.text }]}>
                {formatCurrency(item.totalAmount)}
              </ThemedText>
              <ThemedText style={[s.batchDetailLabel, { color: colors.textTertiary }]}>
                Total
              </ThemedText>
            </View>
            <View style={s.batchDetailItem}>
              <ThemedText
                style={[
                  s.batchDetailValue,
                  { color: item.exceptionsCount > 0 ? '#B85C5C' : colors.text },
                ]}
              >
                {item.exceptionsCount}
              </ThemedText>
              <ThemedText style={[s.batchDetailLabel, { color: colors.textTertiary }]}>
                Exceptions
              </ThemedText>
            </View>
          </View>

          <View style={s.batchFooter}>
            <ThemedText style={[s.batchSchedule, { color: colors.textTertiary }]}>
              {item.scheduledWindow}
            </ThemedText>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectBatch],
  );

  return (
    <FlatList
      data={batches}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="tray.2.fill" label="No batches" colors={colors} />
      }
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
}: {
  colors: typeof Colors.light;
  accentColor: string;
  approvals: RailsApprovalItem[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Pending Approvals</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        {approvals.length} item{approvals.length !== 1 ? 's' : ''} awaiting decision
      </ThemedText>

      {approvals.map((appr) => {
        const fundColor = FUND_COLORS[appr.fund] || accentColor;
        return (
          <Pressable
            key={appr.id}
            style={[s.approvalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={[s.approvalAmount, { color: colors.text }]}>
              {formatCurrency(appr.amount)}
            </ThemedText>
            <View style={s.approvalBadgeRow}>
              <StatusBadge label={FUND_LABELS[appr.fund].toUpperCase()} color={fundColor} />
              <StatusBadge label={appr.category.toUpperCase()} color={colors.textSecondary} />
            </View>
            <ThemedText style={[s.approvalRequestor, { color: colors.textSecondary }]}>
              Requested by: {appr.requestor}
            </ThemedText>

            {appr.missingRequirements.length > 0 && (
              <View style={s.approvalMissing}>
                {appr.missingRequirements.map((req, i) => (
                  <ThemedText key={`req-${i}`} style={[s.approvalMissingText, { color: '#B85C5C' }]}>
                    {'\u2022'} {req}
                  </ThemedText>
                ))}
              </View>
            )}

            {appr.auditNote && (
              <View style={[s.approvalAuditNote, { backgroundColor: '#B8943E18' }]}>
                <IconSymbol name="doc.text.fill" size={12} color="#B8943E" />
                <ThemedText style={[s.approvalAuditNoteText, { color: '#B8943E' }]}>
                  {appr.auditNote}
                </ThemedText>
              </View>
            )}

            <View style={s.approvalActions}>
              <View style={[s.approvalActionBadge, { backgroundColor: '#5A8A6E20' }]}>
                <ThemedText style={[s.approvalActionText, { color: '#5A8A6E' }]}>Approve</ThemedText>
              </View>
              <View style={[s.approvalActionBadge, { backgroundColor: '#B85C5C20' }]}>
                <ThemedText style={[s.approvalActionText, { color: '#B85C5C' }]}>Reject</ThemedText>
              </View>
            </View>
          </Pressable>
        );
      })}

      {approvals.length === 0 && (
        <EmptyState icon="checkmark.seal.fill" label="No pending approvals" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RELEASES TAB
// =============================================================================

function ReleasesTab({
  colors,
  accentColor,
  releases,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  releases: RailsReleaseItem[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Ready for Release</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Approved items awaiting execution
      </ThemedText>

      {releases.map((rel) => {
        const fundColor = FUND_COLORS[rel.fund] || accentColor;
        return (
          <Pressable
            key={rel.id}
            style={[s.releaseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.releaseCardTop}>
              <ThemedText style={[s.releaseAmount, { color: colors.text }]}>
                {formatCurrency(rel.amount)}
              </ThemedText>
              <View style={s.releaseBadges}>
                <StatusBadge label={FUND_LABELS[rel.fund].toUpperCase()} color={fundColor} />
                <StatusBadge
                  label={RAIL_METHOD_LABELS[rel.method].toUpperCase()}
                  color={accentColor}
                />
              </View>
            </View>
            <ThemedText style={[s.releaseApprovedBy, { color: colors.textSecondary }]}>
              Approved by: {rel.approvedBy}
            </ThemedText>
            {rel.scheduledTime && (
              <ThemedText style={[s.releaseScheduled, { color: colors.textTertiary }]}>
                Scheduled: {rel.scheduledTime}
              </ThemedText>
            )}
            {rel.requiresSecondApprover && (
              <View style={[s.releaseWarning, { backgroundColor: '#B8943E18' }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#B8943E" />
                <ThemedText style={[s.releaseWarningText, { color: '#B8943E' }]}>
                  Requires 2nd Approver
                </ThemedText>
              </View>
            )}
            <View style={[s.releaseActionBadge, { backgroundColor: accentColor + '20' }]}>
              <ThemedText style={[s.releaseActionText, { color: accentColor }]}>Release</ThemedText>
            </View>
          </Pressable>
        );
      })}

      {releases.length === 0 && (
        <EmptyState icon="arrow.up.circle.fill" label="No items ready for release" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// EXCEPTIONS TAB
// =============================================================================

function ExceptionsTab({
  colors,
  accentColor,
  exceptions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  exceptions: RailsException[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Exceptions</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        {exceptions.length} open exception{exceptions.length !== 1 ? 's' : ''}
      </ThemedText>

      {exceptions.map((exc) => {
        const typeColor = EXCEPTION_TYPE_COLORS[exc.type];
        const causeLabel = EXCEPTION_CAUSE_LABELS[exc.cause];
        return (
          <View
            key={exc.id}
            style={[s.exceptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Left color bar */}
            <View style={[s.exceptionBar, { backgroundColor: typeColor }]} />
            <View style={s.exceptionContent}>
              <View style={s.exceptionHeader}>
                <StatusBadge
                  label={EXCEPTION_TYPE_LABELS[exc.type].toUpperCase()}
                  color={typeColor}
                />
                <StatusBadge label={causeLabel.toUpperCase()} color={colors.textSecondary} />
              </View>

              <ThemedText style={[s.exceptionRule, { color: colors.text }]} numberOfLines={2}>
                {exc.failingRule}
              </ThemedText>

              <ThemedText style={[s.exceptionFixTitle, { color: colors.textSecondary }]}>
                Required fix:
              </ThemedText>
              <ThemedText style={[s.exceptionFixText, { color: colors.textSecondary }]} numberOfLines={2}>
                {exc.requiredFix}
              </ThemedText>

              <View style={s.exceptionMeta}>
                <View style={s.exceptionMetaItem}>
                  <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.exceptionMetaText, { color: colors.textTertiary }]}>
                    {exc.owner}
                  </ThemedText>
                </View>
                <View style={s.exceptionMetaItem}>
                  <IconSymbol name="arrow.up.right" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.exceptionMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                    {exc.escalationPath}
                  </ThemedText>
                </View>
              </View>

              <View style={s.exceptionFooter}>
                <StatusBadge label={`${exc.evidence.length} EVIDENCE`} color={colors.textSecondary} />
                <ThemedText style={[s.exceptionAmount, { color: colors.text }]}>
                  {formatCurrency(exc.amount)}
                </ThemedText>
                <StatusBadge label={FUND_LABELS[exc.fund].toUpperCase()} color={FUND_COLORS[exc.fund]} />
              </View>

              <View style={s.exceptionActions}>
                <View style={[s.exceptionActionChip, { backgroundColor: colors.border }]}>
                  <ThemedText style={[s.exceptionActionText, { color: colors.textSecondary }]}>
                    Request Info
                  </ThemedText>
                </View>
                <View style={[s.exceptionActionChip, { backgroundColor: colors.border }]}>
                  <ThemedText style={[s.exceptionActionText, { color: colors.textSecondary }]}>
                    Retry
                  </ThemedText>
                </View>
                <View style={[s.exceptionActionChip, { backgroundColor: colors.border }]}>
                  <ThemedText style={[s.exceptionActionText, { color: colors.textSecondary }]}>
                    Reroute
                  </ThemedText>
                </View>
                <View style={[s.exceptionActionChip, { backgroundColor: colors.border }]}>
                  <ThemedText style={[s.exceptionActionText, { color: colors.textSecondary }]}>
                    Escalate
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        );
      })}

      {exceptions.length === 0 && (
        <EmptyState icon="exclamationmark.triangle.fill" label="No open exceptions" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RETURNS TAB
// =============================================================================

function ReturnsTab({
  colors,
  accentColor,
  returns,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  returns: RailsReturn[];
}) {
  const STAGE_ORDER: RailsReturn['stage'][] = ['received', 'evidence_requested', 'submitted', 'resolved'];
  const STAGE_LABELS: Record<RailsReturn['stage'], string> = {
    received: 'Received',
    evidence_requested: 'Evidence Requested',
    submitted: 'Submitted',
    resolved: 'Resolved',
  };
  const STAGE_COLORS: Record<RailsReturn['stage'], string> = {
    received: '#B85C5C',
    evidence_requested: '#B8943E',
    submitted: ACCENT,
    resolved: '#5A8A6E',
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Returns & Disputes</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        {returns.length} return{returns.length !== 1 ? 's' : ''} in progress
      </ThemedText>

      {returns.map((ret) => {
        const stageColor = STAGE_COLORS[ret.stage];
        const stageIdx = STAGE_ORDER.indexOf(ret.stage);
        const progress = ((stageIdx + 1) / STAGE_ORDER.length) * 100;
        return (
          <Pressable
            key={ret.id}
            style={[s.returnCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.returnCardTop}>
              <ThemedText style={[s.returnAmount, { color: colors.text }]}>
                {formatCurrency(ret.amount)}
              </ThemedText>
              <StatusBadge label={STAGE_LABELS[ret.stage].toUpperCase()} color={stageColor} />
            </View>
            <ThemedText style={[s.returnAging, { color: colors.textTertiary }]}>
              Aging: {ret.aging} day{ret.aging !== 1 ? 's' : ''}
            </ThemedText>
            <ThemedText style={[s.returnDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {ret.description}
            </ThemedText>
            <ProgressBar percent={progress} color={stageColor} />

            {/* Stage indicators */}
            <View style={s.returnStages}>
              {STAGE_ORDER.map((stage, idx) => {
                const reached = idx <= stageIdx;
                const sColor = reached ? STAGE_COLORS[stage] : colors.textTertiary;
                return (
                  <View key={stage} style={s.returnStageItem}>
                    <View style={[s.returnStageDot, { backgroundColor: reached ? sColor : 'transparent', borderColor: sColor }]} />
                    <ThemedText style={[s.returnStageLabel, { color: sColor }]}>
                      {STAGE_LABELS[stage]}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </Pressable>
        );
      })}

      {returns.length === 0 && (
        <EmptyState icon="arrow.uturn.backward.circle.fill" label="No returns in progress" colors={colors} />
      )}
    </ScrollView>
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
  receipts: RailsReceipt[];
}) {
  const CHAIN_STEPS = ['Request', 'Rules', 'Approval', 'Release', 'Settlement', 'Ledger'];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Settled Receipts</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Immutable audit trail for completed transactions
      </ThemedText>

      {receipts.map((rcp) => (
        <View
          key={rcp.id}
          style={[s.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.receiptHeader}>
            <ThemedText style={[s.receiptAmount, { color: colors.text }]}>
              {formatCurrency(rcp.amount)}
            </ThemedText>
            <ThemedText style={[s.receiptDate, { color: colors.textSecondary }]}>
              Settled: {formatDate(rcp.settledDate)}
            </ThemedText>
          </View>
          <ThemedText style={[s.receiptRef, { color: colors.textTertiary }]}>
            Ref: {rcp.transactionId}
          </ThemedText>

          {/* Chain visualization */}
          <View style={s.receiptChain}>
            {CHAIN_STEPS.map((step, idx) => {
              const isCompleted = idx < CHAIN_STEPS.length; // All steps are shown
              return (
                <View key={step} style={s.receiptChainStep}>
                  <View style={s.receiptChainDotCol}>
                    <View
                      style={[
                        s.receiptChainDot,
                        { backgroundColor: isCompleted ? '#5A8A6E' : colors.textTertiary },
                      ]}
                    >
                      {isCompleted && (
                        <IconSymbol name="checkmark" size={8} color="#000" />
                      )}
                    </View>
                    {idx < CHAIN_STEPS.length - 1 && (
                      <View style={[s.receiptChainLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <ThemedText style={[s.receiptChainLabel, { color: colors.textSecondary }]}>
                    {step}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          <View style={s.receiptFooter}>
            {rcp.immutable && (
              <StatusBadge label="IMMUTABLE" color={ACCENT} />
            )}
            <View style={[s.receiptExportButton, { borderColor: colors.border }]}>
              <ThemedText style={[s.receiptExportText, { color: colors.textSecondary }]}>
                Export
              </ThemedText>
            </View>
          </View>
        </View>
      ))}

      {receipts.length === 0 && (
        <EmptyState icon="doc.text.fill" label="No settled receipts" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// ADMIN TAB
// =============================================================================

function AdminTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const adminCards = [
    {
      title: 'Connected Processors',
      icon: 'bolt.fill',
      description: 'ACH, Card, Wire, Internal, Check processor connections and status',
    },
    {
      title: 'Routing Rules',
      icon: 'arrow.triangle.branch',
      description: 'Configure transaction routing, fund-to-method mappings, and fallback paths',
    },
    {
      title: 'Limits',
      icon: 'gauge.medium',
      description: 'Per fund, per batch, and per payee disbursement limits and caps',
    },
    {
      title: 'Approval Chains',
      icon: 'person.2.fill',
      description: 'Define multi-level approval workflows by amount and fund type',
    },
    {
      title: 'Hold Triggers',
      icon: 'hand.raised.fill',
      description: 'Configure automatic hold rules for compliance, new payees, and thresholds',
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Finance Administration</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Payment rails configuration and policy management
      </ThemedText>

      {adminCards.map((card, idx) => (
        <Pressable
          key={`admin-${idx}`}
          style={[s.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[s.adminIconCircle, { backgroundColor: accentColor + '18' }]}>
            <IconSymbol name={card.icon as any} size={20} color={accentColor} />
          </View>
          <View style={s.adminTextCol}>
            <ThemedText style={[s.adminTitle, { color: colors.text }]}>{card.title}</ThemedText>
            <ThemedText style={[s.adminDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {card.description}
            </ThemedText>
          </View>
          <View style={[s.adminConfigBadge, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[s.adminConfigText, { color: accentColor }]}>Configure</ThemedText>
          </View>
        </Pressable>
      ))}
    </ScrollView>
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
  accentColor,
  transactions,
  exceptions,
}: {
  visible: boolean;
  onClose: () => void;
  wallet: RailsWallet | null;
  colors: typeof Colors.light;
  accentColor: string;
  transactions: RailsTransaction[];
  exceptions: RailsException[];
}) {
  if (!wallet) return null;

  const fundColor = FUND_COLORS[wallet.fundType] || accentColor;
  const walletTxns = transactions.filter((t) => t.fromFund === wallet.fundType).slice(0, 5);
  const walletExc = exceptions.filter((e) => e.fund === wallet.fundType);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={wallet.name} useModal>
      {/* Balance breakdown */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Balance Breakdown</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#5A8A6E' }]}>
              {formatCurrency(wallet.available)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Available</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#B8943E' }]}>
              {formatCurrency(wallet.committed)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Committed</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: ACCENT }]}>
              {formatCurrency(wallet.pendingInflows)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Pending In</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#B8943E' }]}>
              {formatCurrency(wallet.pendingOutflows)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Pending Out</ThemedText>
          </View>
        </View>
      </View>

      {/* Controls & Limits */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Controls & Limits</ThemedText>
        <ThemedText style={[s.sheetControlsText, { color: colors.textSecondary }]}>
          {wallet.controls}
        </ThemedText>
      </View>

      {/* Allowed Rails */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Allowed Rails</ThemedText>
        <View style={s.sheetRailsRow}>
          {wallet.allowedRails.map((rail) => (
            <View key={rail} style={[s.sheetRailChip, { backgroundColor: accentColor + '12' }]}>
              <IconSymbol name={RAIL_METHOD_ICONS[rail] as any} size={14} color={accentColor} />
              <ThemedText style={[s.sheetRailLabel, { color: accentColor }]}>
                {RAIL_METHOD_LABELS[rail]}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Linked Ministries */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Linked Ministries</ThemedText>
        <View style={s.sheetRailsRow}>
          {wallet.linkedMinistries.map((ministry, i) => (
            <View key={`min-${i}`} style={[s.sheetRailChip, { backgroundColor: fundColor + '12' }]}>
              <ThemedText style={[s.sheetRailLabel, { color: fundColor }]}>{ministry}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Recent Transactions ({walletTxns.length})
        </ThemedText>
        {walletTxns.map((txn) => (
          <View key={txn.id} style={s.sheetListRow}>
            <View style={[s.priorityDot, { backgroundColor: TRANSACTION_STATE_COLORS[txn.state] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {txn.toPayee} — {formatCurrency(txn.amount)}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {TRANSACTION_STATE_LABELS[txn.state]}
              </ThemedText>
            </View>
          </View>
        ))}
        {walletTxns.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No recent transactions
          </ThemedText>
        )}
      </View>

      {/* Active Holds/Exceptions */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Active Exceptions ({walletExc.length})
        </ThemedText>
        {walletExc.map((exc) => (
          <View key={exc.id} style={s.sheetListRow}>
            <View style={[s.priorityDot, { backgroundColor: EXCEPTION_TYPE_COLORS[exc.type] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {EXCEPTION_TYPE_LABELS[exc.type]} — {formatCurrency(exc.amount)}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {exc.failingRule}
              </ThemedText>
            </View>
          </View>
        ))}
        {walletExc.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No active exceptions
          </ThemedText>
        )}
      </View>

      {/* Close button */}
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
// BATCH DETAIL BOTTOM SHEET
// =============================================================================

function BatchDetailSheet({
  visible,
  onClose,
  batch,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  batch: RailsBatch | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!batch) return null;

  const stateColor = TRANSACTION_STATE_COLORS[batch.state];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={batch.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={BATCH_TYPE_LABELS[batch.type].toUpperCase()} color={accentColor} />
        <StatusBadge
          label={TRANSACTION_STATE_LABELS[batch.state].toUpperCase()}
          color={stateColor}
        />
      </View>

      {/* Quick stats */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Summary</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {batch.recipientCount}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Recipients</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(batch.totalAmount)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Total Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {batch.approvalStatus}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Approval</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {batch.scheduledWindow}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Schedule</ThemedText>
          </View>
        </View>
      </View>

      {/* Items list */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Items ({batch.items.length})
        </ThemedText>
        {batch.items.map((item) => (
          <View key={item.id} style={s.sheetListRow}>
            <View style={[s.priorityDot, { backgroundColor: TRANSACTION_STATE_COLORS[item.state] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {item.toPayeeMasked ? '***' : item.toPayee} — {formatCurrency(item.amount)}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {TRANSACTION_STATE_LABELS[item.state]} via {RAIL_METHOD_LABELS[item.method]}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Close */}
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
  transaction: RailsTransaction | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!transaction) return null;

  const stateColor = TRANSACTION_STATE_COLORS[transaction.state];
  const STATE_MACHINE: TransactionState[] = [
    'draft', 'proposed', 'rule_checked', 'authorized', 'scheduled', 'released', 'in_flight', 'settled',
  ];

  // Determine how far we are in the timeline
  const currentIdx = STATE_MACHINE.indexOf(transaction.state);
  const isException = transaction.state === 'held' || transaction.state === 'failed' ||
    transaction.state === 'returned' || transaction.state === 'disputed';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} — ${formatCurrency(transaction.amount)}`}
      useModal
    >
      {/* From / To */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
          {FUND_LABELS[transaction.fromFund]} {'\u2192'} {transaction.toPayeeMasked ? '***' : transaction.toPayee}
        </ThemedText>
      </View>

      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge
          label={TRANSACTION_STATE_LABELS[transaction.state].toUpperCase()}
          color={stateColor}
        />
        <StatusBadge
          label={RAIL_METHOD_LABELS[transaction.method].toUpperCase()}
          color={accentColor}
        />
      </View>

      {/* State machine timeline */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Transaction Timeline</ThemedText>
        <View style={s.timelineRow}>
          {STATE_MACHINE.map((state, idx) => {
            const reached = !isException && idx <= currentIdx;
            const isCurrent = !isException && idx === currentIdx;
            const dotColor = reached ? '#5A8A6E' : colors.textTertiary;
            return (
              <View key={state} style={s.timelineStep}>
                <View style={s.timelineDotRow}>
                  <View
                    style={[
                      s.timelineDot,
                      {
                        backgroundColor: reached ? dotColor : 'transparent',
                        borderColor: dotColor,
                        borderWidth: isCurrent ? 2 : 1,
                      },
                    ]}
                  />
                  {idx < STATE_MACHINE.length - 1 && (
                    <View
                      style={[
                        s.timelineConnector,
                        { backgroundColor: reached ? '#5A8A6E' : colors.border },
                      ]}
                    />
                  )}
                </View>
                <ThemedText
                  style={[
                    s.timelineLabel,
                    { color: reached ? colors.text : colors.textTertiary, fontSize: 8 },
                  ]}
                  numberOfLines={1}
                >
                  {TRANSACTION_STATE_LABELS[state]}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {isException && (
          <View style={[s.timelineException, { backgroundColor: stateColor + '18' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color={stateColor} />
            <ThemedText style={[s.timelineExceptionText, { color: stateColor }]}>
              {TRANSACTION_STATE_LABELS[transaction.state]}
              {transaction.holdReason ? `: ${transaction.holdReason}` : ''}
              {transaction.failReason ? `: ${transaction.failReason}` : ''}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Impact */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Impact</ThemedText>
        <ThemedText style={[s.sheetControlsText, { color: colors.textSecondary }]}>
          {transaction.impact}
        </ThemedText>
      </View>

      {/* Close */}
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

export function ChurchOrgPaymentRails({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C3-C11 locked (hidden per RBAC matrix — pastoral only) ===
  if (!isElderLevel(role)) {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Payment Rails</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Payment Rails is not available for public access
        </ThemedText>
      </View>
    );
  }

  if (role === 'C3' || role === 'C4') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Payment Rails</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Submit reimbursements through your ministry leader
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('control_tower');
  const [selectedWallet, setSelectedWallet] = useState<RailsWallet | null>(null);
  const [walletSheetVisible, setWalletSheetVisible] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<RailsBatch | null>(null);
  const [batchSheetVisible, setBatchSheetVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RailsTransaction | null>(null);
  const [transactionSheetVisible, setTransactionSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getChurchPaymentRailsData(), []);

  // === Callbacks ===
  const handleSelectWallet = useCallback((wallet: RailsWallet) => {
    setSelectedWallet(wallet);
    setWalletSheetVisible(true);
  }, []);

  const handleCloseWalletSheet = useCallback(() => {
    setWalletSheetVisible(false);
  }, []);

  const handleSelectBatch = useCallback((batch: RailsBatch) => {
    setSelectedBatch(batch);
    setBatchSheetVisible(true);
  }, []);

  const handleCloseBatchSheet = useCallback(() => {
    setBatchSheetVisible(false);
  }, []);

  const handleSelectTransaction = useCallback((txn: RailsTransaction) => {
    setSelectedTransaction(txn);
    setTransactionSheetVisible(true);
  }, []);

  const handleCloseTransactionSheet = useCallback(() => {
    setTransactionSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS; // C1/C2: all 9 tabs
    if (isStaffLevel(role)) {
      // C3: Now + Wallets only
      return SUB_TABS.filter((t) => t.id === 'control_tower' || t.id === 'wallets');
    }
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'control_tower':
        return (
          <ControlTowerTab
            colors={colors}
            accentColor={accentColor}
            data={data}
            onSelectTransaction={handleSelectTransaction}
          />
        );
      case 'wallets':
        return (
          <WalletsTab
            colors={colors}
            accentColor={accentColor}
            wallets={data.wallets}
            onSelectWallet={handleSelectWallet}
          />
        );
      case 'batches':
        if (!isElderLevel(role)) return null;
        return (
          <BatchesTab
            colors={colors}
            accentColor={accentColor}
            batches={data.batches}
            onSelectBatch={handleSelectBatch}
          />
        );
      case 'approvals':
        if (!isElderLevel(role)) return null;
        return (
          <ApprovalsTab
            colors={colors}
            accentColor={accentColor}
            approvals={data.approvalsQueue}
          />
        );
      case 'releases':
        if (!isElderLevel(role)) return null;
        return (
          <ReleasesTab
            colors={colors}
            accentColor={accentColor}
            releases={data.releaseQueue}
          />
        );
      case 'exceptions':
        if (!isElderLevel(role)) return null;
        return (
          <ExceptionsTab
            colors={colors}
            accentColor={accentColor}
            exceptions={data.exceptions}
          />
        );
      case 'returns':
        if (!isElderLevel(role)) return null;
        return (
          <ReturnsTab
            colors={colors}
            accentColor={accentColor}
            returns={data.returns}
          />
        );
      case 'receipts':
        if (!isElderLevel(role)) return null;
        return (
          <ReceiptsTab
            colors={colors}
            accentColor={accentColor}
            receipts={data.receipts}
          />
        );
      case 'admin':
        if (!isElderLevel(role)) return null;
        return (
          <AdminTab
            colors={colors}
            accentColor={accentColor}
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

      {/* Fixed Rails Health Strip */}
      <RailsHealthStrip colors={colors} data={data} />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Wallet Detail Bottom Sheet */}
      <WalletDetailSheet
        visible={walletSheetVisible}
        onClose={handleCloseWalletSheet}
        wallet={selectedWallet}
        colors={colors}
        accentColor={accentColor}
        transactions={data.transactions}
        exceptions={data.exceptions}
      />

      {/* Batch Detail Bottom Sheet */}
      <BatchDetailSheet
        visible={batchSheetVisible}
        onClose={handleCloseBatchSheet}
        batch={selectedBatch}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Transaction Detail Bottom Sheet */}
      <TransactionDetailSheet
        visible={transactionSheetVisible}
        onClose={handleCloseTransactionSheet}
        transaction={selectedTransaction}
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

  // -- Health strip --
  healthStrip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderWidth: 0,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  healthLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  healthMethodsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 4,
  },
  healthMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  healthMethodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthMethodText: {
    fontSize: 11,
  },
  healthSettlement: {
    fontSize: 11,
    marginBottom: 4,
  },
  healthStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  healthStat: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  healthStatDivider: {
    fontSize: 11,
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

  // -- Count Badge --
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Priority dot --
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // -- Control Tower Lane --
  laneSection: {
    borderLeftWidth: 4,
    paddingLeft: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  laneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  laneTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  laneCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  laneCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  laneAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    flex: 1,
  },
  lanePayee: {
    fontSize: 12,
    marginBottom: 2,
  },
  laneImpact: {
    fontSize: 11,
    marginBottom: 4,
  },
  laneCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  laneOwner: {
    fontSize: 10,
  },
  laneDeadline: {
    fontSize: 10,
  },
  laneEmpty: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  viewAllButton: {
    paddingVertical: Spacing.xs,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Wallet Card --
  walletCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  walletCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletNameCol: {
    flex: 1,
    gap: 4,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '600',
  },
  walletBalances: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  walletBalanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  walletBalanceValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  walletBalanceLabel: {
    fontSize: 9,
    marginTop: 1,
  },
  walletControls: {
    fontSize: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  walletBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  walletRailIcons: {
    flexDirection: 'row',
    gap: 6,
  },

  // -- Batch Card --
  batchCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  batchCardTop: {
    padding: Spacing.md,
  },
  batchNameCol: {
    gap: 4,
  },
  batchName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  batchBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  batchDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  batchDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  batchDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  batchDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  batchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  batchSchedule: {
    fontSize: 11,
  },

  // -- Approval Card --
  approvalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  approvalAmount: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  approvalBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  approvalRequestor: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  approvalMissing: {
    marginBottom: Spacing.xs,
  },
  approvalMissingText: {
    fontSize: 11,
    marginBottom: 2,
  },
  approvalAuditNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  approvalAuditNoteText: {
    fontSize: 11,
    flex: 1,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  approvalActionBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  approvalActionText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // -- Release Card --
  releaseCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  releaseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  releaseAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  releaseBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  releaseApprovedBy: {
    fontSize: 12,
    marginBottom: 2,
  },
  releaseScheduled: {
    fontSize: 11,
    marginBottom: Spacing.xs,
  },
  releaseWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  releaseWarningText: {
    fontSize: 11,
  },
  releaseActionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  releaseActionText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // -- Exception Card --
  exceptionCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  exceptionBar: {
    width: 4,
  },
  exceptionContent: {
    flex: 1,
    padding: Spacing.md,
  },
  exceptionHeader: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  exceptionRule: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  exceptionFixTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  exceptionFixText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  exceptionMeta: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  exceptionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exceptionMetaText: {
    fontSize: 11,
    flex: 1,
  },
  exceptionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  exceptionAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    flex: 1,
  },
  exceptionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exceptionActionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  exceptionActionText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Return Card --
  returnCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  returnCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  returnAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  returnAging: {
    fontSize: 11,
    marginBottom: 4,
  },
  returnDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  returnStages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  returnStageItem: {
    alignItems: 'center',
    gap: 4,
  },
  returnStageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  returnStageLabel: {
    fontSize: 8,
    fontWeight: '600',
  },

  // -- Receipt Card --
  receiptCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  receiptDate: {
    fontSize: 12,
  },
  receiptRef: {
    fontSize: 10,
    marginBottom: Spacing.sm,
  },
  receiptChain: {
    marginBottom: Spacing.sm,
  },
  receiptChainStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  receiptChainDotCol: {
    alignItems: 'center',
    width: 16,
  },
  receiptChainDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptChainLine: {
    width: 2,
    height: 12,
  },
  receiptChainLabel: {
    fontSize: 12,
    paddingTop: 1,
  },
  receiptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptExportButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  receiptExportText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Admin Card --
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  adminIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminTextCol: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  adminDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  adminConfigBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  adminConfigText: {
    fontSize: 11,
    fontWeight: '700',
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
  sheetControlsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sheetRailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sheetRailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  sheetRailLabel: {
    fontSize: 12,
    fontWeight: '500',
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
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
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

  // -- Transaction Timeline --
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineConnector: {
    height: 2,
    flex: 1,
  },
  timelineLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
  timelineException: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  timelineExceptionText: {
    fontSize: 12,
    flex: 1,
  },
});
