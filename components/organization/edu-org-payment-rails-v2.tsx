/**
 * Education Organization Payment Rails V2 — Money-movement execution layer.
 * Sub-tabs: Now | Wallets | Batches | Approvals | Releases | Exceptions | Returns | Receipts | Admin
 * RBAC: E3/E4/E5 locked; E1/E2 full 9-tab access.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel } from '@/utils/education-rbac';
import {
  getEduPaymentRailsData,
  getEduWalletById,
  getEduTransactionById,
  getEduBatchById,
  EDU_RAILS_STATUS_COLORS,
  EDU_RAIL_METHOD_LABELS,
  EDU_RAIL_METHOD_ICONS,
  EDU_TRANSACTION_STATE_LABELS,
  EDU_TRANSACTION_STATE_COLORS,
  EDU_BATCH_TYPE_LABELS,
  EDU_EXCEPTION_TYPE_LABELS,
  EDU_EXCEPTION_TYPE_COLORS,
  EDU_EXCEPTION_CAUSE_LABELS,
  EDU_WALLET_TYPE_LABELS,
  EDU_WALLET_TYPE_COLORS,
} from '@/data/mock-edu-org-payment-rails';
import type {
  EduRailsWallet,
  EduRailsTransaction,
  EduRailsBatch,
  EduRailsApprovalItem,
  EduRailsReleaseItem,
  EduRailsException,
  EduRailsReturn,
  EduRailsReceipt,
  EduTransactionState,
  EduWalletType,
  EduRailMethod,
} from '@/data/mock-edu-org-payment-rails';

// =============================================================================
// CONSTANTS
// =============================================================================

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
  data: ReturnType<typeof getEduPaymentRailsData>;
}) {
  const health = data.healthStrip;
  const statusColor = EDU_RAILS_STATUS_COLORS[health.status];
  const statusLabel = health.status.toUpperCase();

  return (
    <View style={[s.healthStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Status line */}
      <View style={s.healthRow}>
        <View style={[s.healthDot, { backgroundColor: statusColor }]} />
        <ThemedText style={[s.healthLabel, { color: colors.text }]}>
          Rails: {statusLabel}
        </ThemedText>
        <ThemedText style={[s.healthMethodText, { color: colors.textSecondary, marginLeft: 8 }]}>
          {health.connectedRails} rails connected
        </ThemedText>
      </View>

      {/* Next settlement */}
      <ThemedText style={[s.healthSettlement, { color: colors.textSecondary }]}>
        Next settlement: {health.nextSettlementWindow}
      </ThemedText>

      {/* Compact stats */}
      <View style={s.healthStatsRow}>
        <View style={[s.countBadge, { backgroundColor: '#8B5CF620' }]}>
          <ThemedText style={[s.countBadgeText, { color: '#8B5CF6' }]}>
            Approvals {health.pendingApprovals}
          </ThemedText>
        </View>
        <View style={[s.countBadge, { backgroundColor: '#22C55E20' }]}>
          <ThemedText style={[s.countBadgeText, { color: '#22C55E' }]}>
            Releases {health.pendingReleases}
          </ThemedText>
        </View>
        <View style={[s.countBadge, { backgroundColor: '#F59E0B20' }]}>
          <ThemedText style={[s.countBadgeText, { color: '#F59E0B' }]}>
            In Flight {health.inFlight}
          </ThemedText>
        </View>
        <View style={[s.countBadge, { backgroundColor: '#EF444420' }]}>
          <ThemedText style={[s.countBadgeText, { color: '#EF4444' }]}>
            Exceptions {health.exceptions}
          </ThemedText>
        </View>
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
  data: ReturnType<typeof getEduPaymentRailsData>;
  onSelectTransaction: (txn: EduRailsTransaction) => void;
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
    items: EduRailsTransaction[],
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
        const stateColor = EDU_TRANSACTION_STATE_COLORS[txn.state];
        const walletColor = EDU_WALLET_TYPE_COLORS[txn.fromWallet] || accentColor;
        const isOverdue = txn.deadline ? new Date(txn.deadline) < new Date() : false;
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
              <ThemedText style={[s.laneAmount, { color: colors.text }]}>
                {formatCurrency(txn.amount)}
              </ThemedText>
              <ThemedText style={[s.lanePayee, { color: colors.textSecondary }]} numberOfLines={1}>
                {txn.toPayeeMasked ? '***' : txn.toPayee}
              </ThemedText>
            </View>

            <View style={s.txnBadgeRow}>
              <StatusBadge
                label={EDU_RAIL_METHOD_LABELS[txn.method].toUpperCase()}
                color={accentColor}
              />
              <StatusBadge
                label={EDU_WALLET_TYPE_LABELS[txn.fromWallet].toUpperCase()}
                color={walletColor}
              />
              <StatusBadge
                label={EDU_TRANSACTION_STATE_LABELS[txn.state].toUpperCase()}
                color={stateColor}
              />
            </View>

            <ThemedText style={[s.laneImpact, { color: colors.textTertiary }]} numberOfLines={2}>
              {txn.impact}
            </ThemedText>

            <View style={s.laneCardBottom}>
              <View style={s.txnMetaItem}>
                <IconSymbol name="person.fill" size={10} color={colors.textTertiary} />
                <ThemedText style={[s.txnMetaText, { color: colors.textTertiary }]}>
                  {txn.nextOwner}
                </ThemedText>
              </View>
              {txn.deadline && (
                <ThemedText
                  style={[
                    s.laneDeadline,
                    { color: isOverdue ? '#EF4444' : colors.textTertiary },
                  ]}
                >
                  {isOverdue ? 'OVERDUE ' : 'Due: '}{formatDate(txn.deadline)}
                </ThemedText>
              )}
            </View>

            <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]} numberOfLines={1}>
              {txn.institution}
            </ThemedText>
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
      {renderLane('Needs Approval', '#8B5CF6', needsApproval, 4)}
      {renderLane('Ready to Release', '#22C55E', readyToRelease, 4)}
      {renderLane('In Flight', '#F59E0B', inFlight, 4)}
      {renderLane('Exceptions', '#EF4444', exceptions, 4)}
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
  wallets: EduRailsWallet[];
  onSelectWallet: (wallet: EduRailsWallet) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: EduRailsWallet }) => {
      const walletColor = EDU_WALLET_TYPE_COLORS[item.walletType] || accentColor;
      return (
        <Pressable
          style={[s.walletCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectWallet(item);
          }}
        >
          <View style={s.walletCardTop}>
            <View style={[s.walletIconCircle, { backgroundColor: walletColor + '18' }]}>
              <IconSymbol name="banknote.fill" size={18} color={walletColor} />
            </View>
            <View style={s.walletNameCol}>
              <ThemedText style={[s.walletName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <StatusBadge label={EDU_WALLET_TYPE_LABELS[item.walletType].toUpperCase()} color={walletColor} />
                <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.institution}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Balance breakdown */}
          <View style={[s.walletBalances, { borderTopColor: colors.border }]}>
            <View style={s.walletBalanceItem}>
              <ThemedText style={[s.walletBalanceValue, { color: '#22C55E' }]}>
                {formatCurrency(item.available)}
              </ThemedText>
              <ThemedText style={[s.walletBalanceLabel, { color: colors.textTertiary }]}>
                Available
              </ThemedText>
            </View>
            <View style={s.walletBalanceItem}>
              <ThemedText style={[s.walletBalanceValue, { color: '#F59E0B' }]}>
                {formatCurrency(item.committed)}
              </ThemedText>
              <ThemedText style={[s.walletBalanceLabel, { color: colors.textTertiary }]}>
                Committed
              </ThemedText>
            </View>
            <View style={s.walletBalanceItem}>
              <ThemedText style={[s.walletBalanceValue, { color: '#3B82F6' }]}>
                {formatCurrency(item.pendingInflows)}
              </ThemedText>
              <ThemedText style={[s.walletBalanceLabel, { color: colors.textTertiary }]}>
                Pending In
              </ThemedText>
            </View>
            <View style={s.walletBalanceItem}>
              <ThemedText style={[s.walletBalanceValue, { color: '#F97316' }]}>
                {formatCurrency(item.pendingOutflows)}
              </ThemedText>
              <ThemedText style={[s.walletBalanceLabel, { color: colors.textTertiary }]}>
                Pending Out
              </ThemedText>
            </View>
          </View>

          {/* Allowed rails icons row */}
          <View style={s.walletRailsSection}>
            {item.allowedRails.map((rail) => (
              <View key={rail} style={s.walletRailIconItem}>
                <IconSymbol
                  name={EDU_RAIL_METHOD_ICONS[rail] as any}
                  size={12}
                  color={colors.textSecondary}
                />
                <ThemedText style={[s.walletRailIconLabel, { color: colors.textTertiary }]}>
                  {EDU_RAIL_METHOD_LABELS[rail]}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Controls */}
          <ThemedText style={[s.walletControls, { color: colors.textTertiary }]} numberOfLines={1}>
            {item.controls}
          </ThemedText>

          {/* Bottom row: exceptions */}
          <View style={s.walletBottomRow}>
            {item.exceptionsCount > 0 && (
              <StatusBadge
                label={`${item.exceptionsCount} EXCEPTION${item.exceptionsCount > 1 ? 'S' : ''}`}
                color="#EF4444"
              />
            )}
            <View style={{ flex: 1 }} />
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
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
  batches: EduRailsBatch[];
  onSelectBatch: (batch: EduRailsBatch) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: EduRailsBatch }) => {
      const stateColor = EDU_TRANSACTION_STATE_COLORS[item.state];
      const typeLabel = EDU_BATCH_TYPE_LABELS[item.type];
      const approvalColor =
        item.approvalStatus === 'approved' ? '#22C55E' :
        item.approvalStatus === 'partial' ? '#F59E0B' : '#8B5CF6';
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
                  label={EDU_TRANSACTION_STATE_LABELS[item.state].toUpperCase()}
                  color={stateColor}
                />
                <StatusBadge
                  label={item.approvalStatus.toUpperCase()}
                  color={approvalColor}
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
                  { color: item.exceptionsCount > 0 ? '#EF4444' : colors.text },
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
            <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.institution}
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
  approvals: EduRailsApprovalItem[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Pending Approvals</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        {approvals.length} item{approvals.length !== 1 ? 's' : ''} awaiting decision
      </ThemedText>

      {approvals.map((appr) => {
        const walletColor = EDU_WALLET_TYPE_COLORS[appr.walletType] || accentColor;
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
              <StatusBadge label={appr.category.toUpperCase()} color={colors.textSecondary} />
              <StatusBadge label={EDU_WALLET_TYPE_LABELS[appr.walletType].toUpperCase()} color={walletColor} />
            </View>

            <ThemedText style={[s.approvalRequestor, { color: colors.textSecondary }]}>
              Requested by: {appr.requestor}
            </ThemedText>
            <ThemedText style={[s.approvalRequestor, { color: colors.textSecondary }]}>
              Approver Seat: {appr.approverSeat}
            </ThemedText>

            {appr.missingRequirements.length > 0 && (
              <View style={s.approvalMissing}>
                {appr.missingRequirements.map((req, i) => (
                  <ThemedText key={`req-${i}`} style={[s.approvalMissingText, { color: '#EF4444' }]}>
                    {'\u2022'} {req}
                  </ThemedText>
                ))}
              </View>
            )}

            {appr.auditNote && (
              <View style={[s.approvalAuditNote, { backgroundColor: '#F59E0B18' }]}>
                <IconSymbol name="doc.text.fill" size={12} color="#F59E0B" />
                <ThemedText style={[s.approvalAuditNoteText, { color: '#F59E0B' }]}>
                  {appr.auditNote}
                </ThemedText>
              </View>
            )}

            <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]} numberOfLines={1}>
              {appr.institution}
            </ThemedText>

            <View style={s.approvalActions}>
              <View style={[s.approvalActionBadge, { backgroundColor: '#22C55E20' }]}>
                <ThemedText style={[s.approvalActionText, { color: '#22C55E' }]}>Approve</ThemedText>
              </View>
              <View style={[s.approvalActionBadge, { backgroundColor: '#EF444420' }]}>
                <ThemedText style={[s.approvalActionText, { color: '#EF4444' }]}>Reject</ThemedText>
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
  releases: EduRailsReleaseItem[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Ready for Release</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Approved items awaiting execution
      </ThemedText>

      {releases.map((rel) => {
        const walletColor = EDU_WALLET_TYPE_COLORS[rel.walletType] || accentColor;
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
                <StatusBadge label={EDU_WALLET_TYPE_LABELS[rel.walletType].toUpperCase()} color={walletColor} />
                <StatusBadge
                  label={EDU_RAIL_METHOD_LABELS[rel.method].toUpperCase()}
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
              <View style={[s.releaseWarning, { backgroundColor: '#F59E0B18' }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#F59E0B" />
                <ThemedText style={[s.releaseWarningText, { color: '#F59E0B' }]}>
                  Requires 2nd Approver
                </ThemedText>
              </View>
            )}

            <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]} numberOfLines={1}>
              {rel.institution}
            </ThemedText>

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
  exceptions: EduRailsException[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Exceptions</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        {exceptions.length} open exception{exceptions.length !== 1 ? 's' : ''}
      </ThemedText>

      {exceptions.map((exc) => {
        const typeColor = EDU_EXCEPTION_TYPE_COLORS[exc.type];
        const causeLabel = EDU_EXCEPTION_CAUSE_LABELS[exc.cause];
        const walletColor = EDU_WALLET_TYPE_COLORS[exc.walletType] || accentColor;
        return (
          <View
            key={exc.id}
            style={[s.exceptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Left color bar */}
            <View style={[s.exceptionBar, { backgroundColor: typeColor }]} />
            <View style={s.exceptionContent}>
              <View style={s.exceptionHeader}>
                <ThemedText style={[s.exceptionAmount, { color: colors.text }]}>
                  {formatCurrency(exc.amount)}
                </ThemedText>
              </View>

              <View style={s.exceptionBadgeRow}>
                <StatusBadge
                  label={EDU_EXCEPTION_TYPE_LABELS[exc.type].toUpperCase()}
                  color={typeColor}
                />
                <StatusBadge label={causeLabel.toUpperCase()} color={colors.textSecondary} />
                <StatusBadge
                  label={EDU_WALLET_TYPE_LABELS[exc.walletType].toUpperCase()}
                  color={walletColor}
                />
              </View>

              <ThemedText style={[s.exceptionRule, { color: colors.text }]} numberOfLines={2}>
                {exc.failingRule}
              </ThemedText>

              {/* Governed action chips */}
              <View style={s.exceptionActions}>
                {exc.governedActions.map((action) => (
                  <Pressable
                    key={action}
                    style={[s.exceptionActionChip, { backgroundColor: colors.border }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <ThemedText style={[s.exceptionActionText, { color: colors.textSecondary }]}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

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
                <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]} numberOfLines={1}>
                  {exc.institution}
                </ThemedText>
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
  returns: EduRailsReturn[];
}) {
  const STAGE_ORDER: EduRailsReturn['stage'][] = ['received', 'evidence_requested', 'submitted', 'resolved'];
  const STAGE_LABELS: Record<EduRailsReturn['stage'], string> = {
    received: 'Received',
    evidence_requested: 'Evidence Requested',
    submitted: 'Submitted',
    resolved: 'Resolved',
  };
  const STAGE_COLORS: Record<EduRailsReturn['stage'], string> = {
    received: '#EF4444',
    evidence_requested: '#F59E0B',
    submitted: '#3B82F6',
    resolved: '#22C55E',
  };

  const getAgingColor = (aging: number): string => {
    if (aging > 5) return '#EF4444';
    if (aging > 3) return '#F59E0B';
    return '#22C55E';
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
        const agingColor = getAgingColor(ret.aging);
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

            <View style={s.returnFooter}>
              <ThemedText style={[s.returnAging, { color: agingColor }]}>
                Aging: {ret.aging} day{ret.aging !== 1 ? 's' : ''}
              </ThemedText>
              <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]} numberOfLines={1}>
                {ret.institution}
              </ThemedText>
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
  receipts: EduRailsReceipt[];
}) {
  const CHAIN_STEPS: { key: keyof Omit<EduRailsReceipt, 'id' | 'transactionId' | 'amount' | 'settledDate' | 'immutable' | 'institution'>; label: string }[] = [
    { key: 'requestEvent', label: 'Event' },
    { key: 'rulesApplied', label: 'Rules' },
    { key: 'approvalChain', label: 'Auth' },
    { key: 'releaseAuth', label: 'Payment' },
    { key: 'settlementRecord', label: 'Settlement' },
    { key: 'ledgerPostings', label: 'Ledger' },
  ];

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

          {/* 7-step chain visualization: Event > Rules > Auth > Payment > Settlement > Ledger > Receipt */}
          <View style={s.receiptChain}>
            {CHAIN_STEPS.map((step, idx) => {
              const detail = rcp[step.key] as string;
              return (
                <View key={step.label} style={s.receiptChainStep}>
                  <View style={s.receiptChainDotCol}>
                    <View
                      style={[
                        s.receiptChainDot,
                        { backgroundColor: '#22C55E' },
                      ]}
                    >
                      <IconSymbol name="checkmark" size={8} color="#000" />
                    </View>
                    {idx < CHAIN_STEPS.length - 1 && (
                      <View style={[s.receiptChainLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <View style={s.receiptChainTextCol}>
                    <ThemedText style={[s.receiptChainLabel, { color: colors.textSecondary }]}>
                      {step.label}
                    </ThemedText>
                    <ThemedText style={[s.receiptChainDetail, { color: colors.textTertiary }]} numberOfLines={2}>
                      {detail}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
            {/* Final Receipt step */}
            <View style={s.receiptChainStep}>
              <View style={s.receiptChainDotCol}>
                <View
                  style={[
                    s.receiptChainDot,
                    { backgroundColor: '#22C55E' },
                  ]}
                >
                  <IconSymbol name="checkmark" size={8} color="#000" />
                </View>
              </View>
              <View style={s.receiptChainTextCol}>
                <ThemedText style={[s.receiptChainLabel, { color: colors.textSecondary }]}>
                  Receipt
                </ThemedText>
                <ThemedText style={[s.receiptChainDetail, { color: colors.textTertiary }]}>
                  Immutable receipt generated — audit trail sealed
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={s.receiptFooter}>
            {rcp.immutable && (
              <StatusBadge label="IMMUTABLE" color="#8B5CF6" />
            )}
            <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]} numberOfLines={1}>
              {rcp.institution}
            </ThemedText>
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
  const processors = [
    { name: 'ACH', active: true },
    { name: 'Wire', active: true },
    { name: 'Internal', active: true },
    { name: 'Card', active: true },
    { name: 'Check', active: true },
  ];

  const approvalChains = [
    { label: 'Standard (< $25K)', description: 'Single approver' },
    { label: 'Enhanced ($25K-$100K)', description: 'Dual approval required' },
    { label: 'Board (>$100K)', description: 'Board committee sign-off' },
    { label: 'Emergency', description: 'Expedited single-authority' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Payment Rails Administration</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Configuration and policy management (display only)
      </ThemedText>

      {/* 1. Connected Processors */}
      <View style={[s.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.adminCardHeader}>
          <View style={[s.adminIconCircle, { backgroundColor: accentColor + '18' }]}>
            <IconSymbol name="bolt.fill" size={20} color={accentColor} />
          </View>
          <ThemedText style={[s.adminCardTitle, { color: colors.text }]}>Connected Processors</ThemedText>
        </View>
        <View style={s.adminCardContent}>
          {processors.map((proc) => (
            <View key={proc.name} style={s.adminRow}>
              <View
                style={[
                  s.adminRowDot,
                  { backgroundColor: proc.active ? '#22C55E' : '#EF4444' },
                ]}
              />
              <ThemedText style={[s.adminRowText, { color: colors.textSecondary }]}>
                {proc.name}
              </ThemedText>
              <ThemedText style={[s.adminRowStatus, { color: proc.active ? '#22C55E' : '#EF4444' }]}>
                {proc.active ? 'Active' : 'Inactive'}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* 2. Routing Rules */}
      <View style={[s.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.adminCardHeader}>
          <View style={[s.adminIconCircle, { backgroundColor: accentColor + '18' }]}>
            <IconSymbol name="arrow.triangle.branch" size={20} color={accentColor} />
          </View>
          <ThemedText style={[s.adminCardTitle, { color: colors.text }]}>Routing Rules</ThemedText>
        </View>
        <View style={s.adminCardContent}>
          <ThemedText style={[s.adminDesc, { color: colors.textSecondary }]}>
            7 active rules, last updated Feb 10
          </ThemedText>
          <ThemedText style={[s.adminDescDetail, { color: colors.textTertiary }]}>
            Transaction routing, wallet-to-method mappings, and fallback paths configured for all 7 wallets
          </ThemedText>
        </View>
      </View>

      {/* 3. Transaction Limits */}
      <View style={[s.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.adminCardHeader}>
          <View style={[s.adminIconCircle, { backgroundColor: accentColor + '18' }]}>
            <IconSymbol name="gauge.medium" size={20} color={accentColor} />
          </View>
          <ThemedText style={[s.adminCardTitle, { color: colors.text }]}>Transaction Limits</ThemedText>
        </View>
        <View style={s.adminCardContent}>
          <View style={s.adminRow}>
            <ThemedText style={[s.adminRowText, { color: colors.textSecondary }]}>Single Transaction</ThemedText>
            <ThemedText style={[s.adminRowValue, { color: colors.text }]}>$500,000</ThemedText>
          </View>
          <View style={s.adminRow}>
            <ThemedText style={[s.adminRowText, { color: colors.textSecondary }]}>Daily Limit</ThemedText>
            <ThemedText style={[s.adminRowValue, { color: colors.text }]}>$2,000,000</ThemedText>
          </View>
          <View style={s.adminRow}>
            <ThemedText style={[s.adminRowText, { color: colors.textSecondary }]}>Batch Limit</ThemedText>
            <ThemedText style={[s.adminRowValue, { color: colors.text }]}>$1,500,000</ThemedText>
          </View>
        </View>
      </View>

      {/* 4. Approval Chains */}
      <View style={[s.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.adminCardHeader}>
          <View style={[s.adminIconCircle, { backgroundColor: accentColor + '18' }]}>
            <IconSymbol name="person.2.fill" size={20} color={accentColor} />
          </View>
          <ThemedText style={[s.adminCardTitle, { color: colors.text }]}>Approval Chains</ThemedText>
        </View>
        <View style={s.adminCardContent}>
          <ThemedText style={[s.adminDesc, { color: colors.textSecondary, marginBottom: 8 }]}>
            4 chains configured
          </ThemedText>
          {approvalChains.map((chain) => (
            <View key={chain.label} style={s.adminRow}>
              <View style={[s.adminRowDot, { backgroundColor: accentColor }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.adminRowText, { color: colors.textSecondary }]}>
                  {chain.label}
                </ThemedText>
                <ThemedText style={[s.adminRowSubtext, { color: colors.textTertiary }]}>
                  {chain.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Risk Thresholds */}
      <View style={[s.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.adminCardHeader}>
          <View style={[s.adminIconCircle, { backgroundColor: accentColor + '18' }]}>
            <IconSymbol name="hand.raised.fill" size={20} color={accentColor} />
          </View>
          <ThemedText style={[s.adminCardTitle, { color: colors.text }]}>Risk Thresholds</ThemedText>
        </View>
        <View style={s.adminCardContent}>
          <View style={s.adminRow}>
            <ThemedText style={[s.adminRowText, { color: colors.textSecondary }]}>Auto-hold</ThemedText>
            <ThemedText style={[s.adminRowValue, { color: colors.text }]}>$200,000</ThemedText>
          </View>
          <View style={s.adminRow}>
            <ThemedText style={[s.adminRowText, { color: colors.textSecondary }]}>Velocity Limit</ThemedText>
            <ThemedText style={[s.adminRowValue, { color: colors.text }]}>5 per hour</ThemedText>
          </View>
          <View style={s.adminRow}>
            <ThemedText style={[s.adminRowText, { color: colors.textSecondary }]}>Duplicate Window</ThemedText>
            <ThemedText style={[s.adminRowValue, { color: colors.text }]}>24 hours</ThemedText>
          </View>
        </View>
      </View>
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
  wallet: EduRailsWallet | null;
  colors: typeof Colors.light;
  accentColor: string;
  transactions: EduRailsTransaction[];
  exceptions: EduRailsException[];
}) {
  if (!wallet) return null;

  const walletColor = EDU_WALLET_TYPE_COLORS[wallet.walletType] || accentColor;
  const walletTxns = transactions.filter((t) => t.fromWallet === wallet.walletType).slice(0, 5);
  const walletExc = exceptions.filter((e) => e.walletType === wallet.walletType);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={wallet.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={EDU_WALLET_TYPE_LABELS[wallet.walletType].toUpperCase()} color={walletColor} />
        <ThemedText style={[s.institutionTag, { color: colors.textTertiary }]}>
          {wallet.institution}
        </ThemedText>
      </View>

      {/* Balance breakdown */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Balance Breakdown</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#22C55E' }]}>
              {formatCurrency(wallet.available)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Available</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#F59E0B' }]}>
              {formatCurrency(wallet.committed)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Committed</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#3B82F6' }]}>
              {formatCurrency(wallet.pendingInflows)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Pending In</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: '#F97316' }]}>
              {formatCurrency(wallet.pendingOutflows)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Pending Out</ThemedText>
          </View>
        </View>
      </View>

      {/* Allowed Rails */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Allowed Rails</ThemedText>
        <View style={s.sheetRailsRow}>
          {wallet.allowedRails.map((rail) => (
            <View key={rail} style={[s.sheetRailChip, { backgroundColor: accentColor + '12' }]}>
              <IconSymbol name={EDU_RAIL_METHOD_ICONS[rail] as any} size={14} color={accentColor} />
              <ThemedText style={[s.sheetRailLabel, { color: accentColor }]}>
                {EDU_RAIL_METHOD_LABELS[rail]}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Controls & Limits */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Controls & Limits</ThemedText>
        <ThemedText style={[s.sheetControlsText, { color: colors.textSecondary }]}>
          {wallet.controls}
        </ThemedText>
      </View>

      {/* Recent Transactions */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Recent Transactions ({walletTxns.length})
        </ThemedText>
        {walletTxns.map((txn) => (
          <View key={txn.id} style={s.sheetListRow}>
            <View style={[s.priorityDot, { backgroundColor: EDU_TRANSACTION_STATE_COLORS[txn.state] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {txn.toPayeeMasked ? '***' : txn.toPayee} — {formatCurrency(txn.amount)}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {EDU_TRANSACTION_STATE_LABELS[txn.state]}
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

      {/* Active Exceptions */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Active Exceptions ({walletExc.length})
        </ThemedText>
        {walletExc.map((exc) => (
          <View key={exc.id} style={s.sheetListRow}>
            <View style={[s.priorityDot, { backgroundColor: EDU_EXCEPTION_TYPE_COLORS[exc.type] }]} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {EDU_EXCEPTION_TYPE_LABELS[exc.type]} — {formatCurrency(exc.amount)}
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
  batch: EduRailsBatch | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!batch) return null;

  const stateColor = EDU_TRANSACTION_STATE_COLORS[batch.state];
  const approvalColor =
    batch.approvalStatus === 'approved' ? '#22C55E' :
    batch.approvalStatus === 'partial' ? '#F59E0B' : '#8B5CF6';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={batch.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={EDU_BATCH_TYPE_LABELS[batch.type].toUpperCase()} color={accentColor} />
        <StatusBadge
          label={EDU_TRANSACTION_STATE_LABELS[batch.state].toUpperCase()}
          color={stateColor}
        />
        <StatusBadge
          label={batch.approvalStatus.toUpperCase()}
          color={approvalColor}
        />
      </View>

      <ThemedText style={[s.institutionTag, { color: colors.textTertiary, marginBottom: Spacing.md }]}>
        {batch.institution}
      </ThemedText>

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
            <ThemedText
              style={[
                s.sheetDetailValue,
                { color: batch.exceptionsCount > 0 ? '#EF4444' : colors.text },
              ]}
            >
              {batch.exceptionsCount}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Exceptions</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {batch.scheduledWindow}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Schedule</ThemedText>
          </View>
        </View>
      </View>

      {batch.exceptionsCount > 0 && (
        <View style={s.sheetSection}>
          <View style={[s.releaseWarning, { backgroundColor: '#EF444418' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
            <ThemedText style={[s.releaseWarningText, { color: '#EF4444' }]}>
              {batch.exceptionsCount} exception{batch.exceptionsCount > 1 ? 's' : ''} require resolution before processing
            </ThemedText>
          </View>
        </View>
      )}

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
  transaction: EduRailsTransaction | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!transaction) return null;

  const stateColor = EDU_TRANSACTION_STATE_COLORS[transaction.state];
  const walletColor = EDU_WALLET_TYPE_COLORS[transaction.fromWallet] || accentColor;

  // Full 13-state machine
  const ALL_STATES: EduTransactionState[] = [
    'draft', 'proposed', 'rule_checked', 'authorized', 'scheduled',
    'released', 'in_flight', 'settled', 'held', 'failed',
    'returned', 'disputed', 'reversed',
  ];

  // Happy-path sequence for timeline visualization
  const HAPPY_PATH: EduTransactionState[] = [
    'draft', 'proposed', 'rule_checked', 'authorized', 'scheduled', 'released', 'in_flight', 'settled',
  ];

  // Determine how far we are in the timeline
  const currentIdx = HAPPY_PATH.indexOf(transaction.state);
  const isException = transaction.state === 'held' || transaction.state === 'failed' ||
    transaction.state === 'returned' || transaction.state === 'disputed' || transaction.state === 'reversed';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} — ${formatCurrency(transaction.amount)}`}
      useModal
    >
      {/* Payee */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
          {EDU_WALLET_TYPE_LABELS[transaction.fromWallet]} {'\u2192'} {transaction.toPayeeMasked ? '***' : transaction.toPayee}
        </ThemedText>
      </View>

      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge
          label={EDU_TRANSACTION_STATE_LABELS[transaction.state].toUpperCase()}
          color={stateColor}
        />
        <StatusBadge
          label={EDU_RAIL_METHOD_LABELS[transaction.method].toUpperCase()}
          color={accentColor}
        />
        <StatusBadge
          label={EDU_WALLET_TYPE_LABELS[transaction.fromWallet].toUpperCase()}
          color={walletColor}
        />
      </View>

      <ThemedText style={[s.institutionTag, { color: colors.textTertiary, marginBottom: Spacing.md }]}>
        {transaction.institution}
      </ThemedText>

      {/* Details grid */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(transaction.amount)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(transaction.createdAt)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Created</ThemedText>
          </View>
          {transaction.deadline && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
                {formatDate(transaction.deadline)}
              </ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Deadline</ThemedText>
            </View>
          )}
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {transaction.nextOwner}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Next Owner</ThemedText>
          </View>
        </View>
      </View>

      {/* State machine timeline */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Transaction Timeline</ThemedText>
        <View style={s.stateTimeline}>
          {HAPPY_PATH.map((state, idx) => {
            const reached = !isException && idx <= currentIdx;
            const isCurrent = !isException && idx === currentIdx;
            const dotColor = reached ? '#22C55E' : colors.textTertiary;
            return (
              <View key={state} style={s.stateTimelineStep}>
                <View
                  style={[
                    isCurrent ? s.stateTimelineDotActive : s.stateTimelineDot,
                    {
                      backgroundColor: reached ? dotColor : 'transparent',
                      borderColor: dotColor,
                    },
                  ]}
                />
                {idx < HAPPY_PATH.length - 1 && (
                  <View
                    style={[
                      s.stateTimelineLine,
                      { backgroundColor: reached ? '#22C55E' : colors.border },
                    ]}
                  />
                )}
                <ThemedText
                  style={[
                    s.stateTimelineLabel,
                    { color: reached ? colors.text : colors.textTertiary },
                  ]}
                  numberOfLines={1}
                >
                  {EDU_TRANSACTION_STATE_LABELS[state]}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {isException && (
          <View style={[s.timelineException, { backgroundColor: stateColor + '18' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color={stateColor} />
            <ThemedText style={[s.timelineExceptionText, { color: stateColor }]}>
              {EDU_TRANSACTION_STATE_LABELS[transaction.state]}
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

      {/* Hold/Fail reason */}
      {(transaction.holdReason || transaction.failReason) && (
        <View style={s.sheetSection}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
            {transaction.holdReason ? 'Hold Reason' : 'Fail Reason'}
          </ThemedText>
          <ThemedText style={[s.sheetControlsText, { color: '#EF4444' }]}>
            {transaction.holdReason || transaction.failReason}
          </ThemedText>
        </View>
      )}

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

export function EduOrgPaymentRailsV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: E3/E4/E5 locked ===
  if (role === 'E3') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Payment Rails</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Payment Rails access requires Dean-level authorization or above
        </ThemedText>
      </View>
    );
  }

  if (role === 'E4') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Payment Rails</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Student accounts can submit financial aid inquiries through the Financial Aid Office
        </ThemedText>
      </View>
    );
  }

  if (role === 'E5') {
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

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('control_tower');
  const [selectedWallet, setSelectedWallet] = useState<EduRailsWallet | null>(null);
  const [walletSheetVisible, setWalletSheetVisible] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<EduRailsBatch | null>(null);
  const [batchSheetVisible, setBatchSheetVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<EduRailsTransaction | null>(null);
  const [transactionSheetVisible, setTransactionSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduPaymentRailsData(), []);

  // === Callbacks ===
  const handleSelectWallet = useCallback((wallet: EduRailsWallet) => {
    setSelectedWallet(wallet);
    setWalletSheetVisible(true);
  }, []);

  const handleCloseWalletSheet = useCallback(() => {
    setWalletSheetVisible(false);
  }, []);

  const handleSelectBatch = useCallback((batch: EduRailsBatch) => {
    setSelectedBatch(batch);
    setBatchSheetVisible(true);
  }, []);

  const handleCloseBatchSheet = useCallback(() => {
    setBatchSheetVisible(false);
  }, []);

  const handleSelectTransaction = useCallback((txn: EduRailsTransaction) => {
    setSelectedTransaction(txn);
    setTransactionSheetVisible(true);
  }, []);

  const handleCloseTransactionSheet = useCallback(() => {
    setTransactionSheetVisible(false);
  }, []);

  // === All tabs visible for E1/E2 ===
  const visibleTabs = SUB_TABS;

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
        return (
          <BatchesTab
            colors={colors}
            accentColor={accentColor}
            batches={data.batches}
            onSelectBatch={handleSelectBatch}
          />
        );
      case 'approvals':
        return (
          <ApprovalsTab
            colors={colors}
            accentColor={accentColor}
            approvals={data.approvalsQueue}
          />
        );
      case 'releases':
        return (
          <ReleasesTab
            colors={colors}
            accentColor={accentColor}
            releases={data.releaseQueue}
          />
        );
      case 'exceptions':
        return (
          <ExceptionsTab
            colors={colors}
            accentColor={accentColor}
            exceptions={data.exceptions}
          />
        );
      case 'returns':
        return (
          <ReturnsTab
            colors={colors}
            accentColor={accentColor}
            returns={data.returns}
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
        tabs={visibleTabs}
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
    gap: 6,
    flexWrap: 'wrap',
  },
  healthStat: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  healthStatDivider: {
    fontSize: 11,
  },

  // -- Count Badge --
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Priority dot --
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Institution Tag --
  institutionTag: {
    fontSize: 10,
    marginTop: 4,
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
  },
  lanePayee: {
    fontSize: 12,
    flex: 1,
  },
  laneImpact: {
    fontSize: 11,
    marginBottom: 4,
  },
  laneCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // -- Transaction badges --
  txnBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  txnMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txnMetaText: {
    fontSize: 10,
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
  walletRailsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  walletRailIconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  walletRailIconLabel: {
    fontSize: 9,
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
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
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
    marginTop: Spacing.xs,
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
    marginTop: Spacing.xs,
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
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  exceptionAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    flex: 1,
  },
  exceptionBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  exceptionRule: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  exceptionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
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
  returnAging: {
    fontSize: 11,
  },
  returnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
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
  receiptChainTextCol: {
    flex: 1,
    paddingBottom: 4,
  },
  receiptChainLabel: {
    fontSize: 12,
    fontWeight: '600',
    paddingTop: 1,
  },
  receiptChainDetail: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  adminIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  adminCardContent: {
    gap: 6,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  adminRowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  adminRowText: {
    fontSize: 12,
    flex: 1,
  },
  adminRowValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  adminRowStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  adminRowSubtext: {
    fontSize: 10,
    marginTop: 1,
  },
  adminDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  adminDescDetail: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  adminTextCol: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: '600',
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

  // -- Filter chips --
  filterChipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Section card --
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '600',
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

  // -- State Timeline --
  stateTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  stateTimelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  stateTimelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  stateTimelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  stateTimelineLine: {
    height: 2,
    position: 'absolute',
    top: 5,
    left: '50%',
    right: '-50%',
  },
  stateTimelineLabel: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 8,
  },

  // -- Transaction Timeline (sheet) --
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
