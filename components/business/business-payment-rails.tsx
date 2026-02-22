/**
 * Business Payment Rails — 9-section RBAC-gated Payment Rails tab.
 * Fixed sticky header concept: overall status banner, health strip, CTA buttons,
 * status-based filter pills.
 * Sub-tabs: Now | Wallets | Batches | Approvals | Release Queue | Exceptions |
 *           Disputes & Returns | Receipts | Admin
 *
 * RBAC:
 *   B1 (Founder): Full access to all 9 sections.
 *   B2b (Board): Board Rails Health — health strip, major exceptions, governance receipts, monthly summaries.
 *   B2a (Retail): Curated proof — health indicator, monthly flows, compliance proof.
 *   B3 (Public): Locked with optional branding.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, BusinessPalette , MODE_ACCENT } from '@/constants/theme';
import { EntityScopeBar } from '@/components/business/entity-scope-bar';
import {
  BizCard,
  BizCardTitle,
  BizSubTabBar,
  BizStatusChip,
  BizEmptyLock,
  statusColor,
  statusVariant,
} from '@/components/business/business-shared';
import { isFounder } from '@/utils/business-rbac';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { DEFAULT_ENTITY } from '@/data/mock-business-v3';

import {
  RAILS_HEALTH,
  RAILS_OVERALL_STATUS,
  NOW_ITEMS,
  WALLET_ACCOUNTS,
  PAYOUT_BATCHES,
  RAILS_APPROVALS,
  EXCEPTIONS,
  DISPUTES,
  RECEIPTS,
  ADMIN_SETTINGS,
  RAILS_SUB_TABS,
  STATUS_FILTERS,
  RELEASE_QUEUE_ITEMS,
  RETURN_ITEMS,
  nowStatusLabel,
  batchStatusLabel,
  approvalStatusLabel,
  exceptionTypeLabel,
  disputeStatusLabel,
  walletStatusLabel,
  walletTypeLabel,
  adminSettingTypeIcon,
  returnStatusLabel,
  nowItemTxnState,
  releaseQueueTxnState,
} from '@/data/mock-biz-payment-rails';
import type {
  RailsSubTab,
  StatusFilter,
  RailsHealthMetric,
  RailsOverallStatus,
  NowItem,
  WalletAccount,
  PayoutBatch,
  RailsApproval,
  ExceptionItem,
  DisputeItem,
  ReceiptItem,
  AdminSetting,
  ReleaseQueueItem,
  ReturnItem,
  RailsTxnState,
} from '@/data/mock-biz-payment-rails';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.business;
const BP = BusinessPalette;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
}

// =============================================================================
// HELPER: Status-to-variant mapping for Payment Rails statuses
// =============================================================================

function nowStatusVariant(status: NowItem['status']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'processing': return 'info';
    case 'pending_approval': return 'warning';
    case 'scheduled': return 'neutral';
    case 'failed': return 'error';
    default: return 'neutral';
  }
}

function batchStatusVariant(status: PayoutBatch['status']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'draft': return 'neutral';
    case 'pending_approval': return 'warning';
    case 'approved': return 'success';
    case 'processing': return 'info';
    case 'settled': return 'success';
    default: return 'neutral';
  }
}

function approvalStatusVariant(status: RailsApproval['status']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default: return 'neutral';
  }
}

function exceptionSeverityVariant(severity: ExceptionItem['severity']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'neutral';
    default: return 'neutral';
  }
}

function exceptionStatusVariant(status: ExceptionItem['status']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'open': return 'error';
    case 'investigating': return 'warning';
    case 'resolved': return 'success';
    default: return 'neutral';
  }
}

function disputeStatusVariant(status: DisputeItem['status']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'open': return 'warning';
    case 'under_review': return 'info';
    case 'resolved': return 'success';
    case 'escalated': return 'error';
    default: return 'neutral';
  }
}

function walletStatusVariant(status: WalletAccount['status']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'connected': return 'success';
    case 'limited': return 'warning';
    case 'offline': return 'error';
    default: return 'neutral';
  }
}

function returnStatusVariant(status: ReturnItem['status']): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'pending': return 'warning';
    case 'processed': return 'info';
    case 'credited': return 'success';
    default: return 'neutral';
  }
}

function overallStatusColor(status: RailsOverallStatus): string {
  switch (status) {
    case 'GREEN': return BP.emerald;
    case 'YELLOW': return BP.amber;
    case 'RED': return BP.red;
    default: return BP.ash;
  }
}

function overallStatusText(status: RailsOverallStatus): string {
  switch (status) {
    case 'GREEN': return 'All Systems Operational';
    case 'YELLOW': return 'Attention Needed';
    case 'RED': return 'Critical Issues';
    default: return status;
  }
}

function txnStateBadgeColor(state: RailsTxnState): string {
  switch (state) {
    case 'Draft': return BP.ash;
    case 'Proposed': return BP.platinum;
    case 'Rule-Checked': return BP.platinum;
    case 'Authorized': return BP.champagneGold;
    case 'Scheduled': return ACCENT;
    case 'Released': return BP.emerald;
    case 'In Flight': return BP.amber;
    case 'Settled': return BP.emerald;
    case 'Held': return BP.amber;
    case 'Failed': return BP.red;
    case 'Disputed': return BP.red;
    case 'Returned': return BP.amber;
    case 'Reversed': return BP.red;
    default: return BP.ash;
  }
}

/**
 * Map NowItem status to a StatusFilter id for filtering.
 */
function nowStatusToFilter(status: NowItem['status']): StatusFilter | null {
  switch (status) {
    case 'pending_approval': return 'needs_approval';
    case 'processing': return 'in_flight';
    case 'scheduled': return 'scheduled';
    case 'failed': return 'failed';
    default: return null;
  }
}

function healthStatusColor(status: RailsHealthMetric['status']): string {
  switch (status) {
    case 'green': return BP.emerald;
    case 'yellow': return BP.amber;
    case 'red': return BP.red;
    default: return BP.ash;
  }
}

function railBadgeColor(rail: NowItem['rail']): string {
  switch (rail) {
    case 'ACH': return BP.emerald;
    case 'Wire': return BP.champagneGold;
    case 'Card': return BP.amber;
    case 'Crypto': return ACCENT;
    default: return BP.ash;
  }
}

function approvalTypeBadgeColor(type: RailsApproval['type']): string {
  switch (type) {
    case 'payout': return BP.champagneGold;
    case 'vendor': return BP.emerald;
    case 'refund': return BP.amber;
    case 'transfer': return ACCENT;
    default: return BP.ash;
  }
}

// =============================================================================
// FIXED STICKY HEADER — Health Strip + CTAs + Rail Filter
// =============================================================================

function RailsHeader({
  statusFilter,
  onStatusFilterChange,
}: {
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;
}) {
  const statusColor = overallStatusColor(RAILS_OVERALL_STATUS);

  return (
    <View style={s.headerContainer}>
      {/* Overall Status Banner */}
      <View style={[s.overallStatusBanner, { backgroundColor: statusColor + '12', borderColor: statusColor + '30' }]}>
        <View style={[s.overallStatusDot, { backgroundColor: statusColor }]} />
        <ThemedText style={[s.overallStatusText, { color: statusColor }]}>
          {overallStatusText(RAILS_OVERALL_STATUS)}
        </ThemedText>
        <ThemedText style={[s.overallStatusLabel, { color: statusColor }]}>
          {RAILS_OVERALL_STATUS}
        </ThemedText>
      </View>

      {/* Health Strip */}
      <View style={s.healthStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.healthStripScroll}
        >
          {RAILS_HEALTH.map((metric) => (
            <View key={metric.id} style={s.healthMetric}>
              <View style={s.healthMetricTop}>
                <View style={[s.healthDot, { backgroundColor: healthStatusColor(metric.status) }]} />
                <ThemedText style={[s.healthLabel, { color: BP.ash }]}>{metric.label}</ThemedText>
              </View>
              <ThemedText style={[s.healthValue, { color: BP.smoke }]}>{metric.value}</ThemedText>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* CTA Buttons */}
      <View style={s.ctaRow}>
        <Pressable
          style={({ pressed }) => [
            s.ctaButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus.circle.fill" size={14} color={BP.champagneGold} />
          <ThemedText style={[s.ctaButtonText, { color: BP.champagneGold }]}>New Payout</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            s.ctaButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="checkmark.circle.fill" size={14} color={BP.emerald} />
          <ThemedText style={[s.ctaButtonText, { color: BP.emerald }]}>Approve Queue</ThemedText>
        </Pressable>
      </View>

      {/* Status-Based Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterPillRow}
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter.id === statusFilter;
          return (
            <Pressable
              key={filter.id}
              style={[
                s.filterPill,
                {
                  backgroundColor: isActive ? BP.champagneGold + '20' : BP.glass,
                  borderColor: isActive ? BP.champagneGold + '40' : BP.graphite,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onStatusFilterChange(filter.id);
              }}
            >
              <ThemedText
                style={[s.filterPillText, { color: isActive ? BP.champagneGold : BP.ash }]}
              >
                {filter.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// SECTION: NOW — Live Transaction Feed
// =============================================================================

function NowItemCard({ item }: { item: NowItem }) {
  const txnState = nowItemTxnState(item.status);
  return (
    <BizCard style={s.nowCard}>
      <View style={s.nowCardHeader}>
        <ThemedText style={[s.nowTitle, { color: BP.smoke }]} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={[s.nowAmount, { color: BP.champagneGold }]}>
          {item.amount}
        </ThemedText>
      </View>

      <View style={s.nowCardMeta}>
        {/* Status Pill */}
        <BizStatusChip label={nowStatusLabel(item.status)} variant={nowStatusVariant(item.status)} />

        {/* TXN State Badge */}
        <View style={[s.txnStateBadge, { backgroundColor: txnStateBadgeColor(txnState) + '15' }]}>
          <ThemedText style={[s.txnStateBadgeText, { color: txnStateBadgeColor(txnState) }]}>
            {txnState}
          </ThemedText>
        </View>

        {/* Rail Type Badge */}
        <View style={[s.railBadge, { backgroundColor: railBadgeColor(item.rail) + '15' }]}>
          <ThemedText style={[s.railBadgeText, { color: railBadgeColor(item.rail) }]}>
            {item.rail}
          </ThemedText>
        </View>
      </View>

      <View style={s.nowCardFooter}>
        <ThemedText style={[s.nowCounterparty, { color: BP.ash }]} numberOfLines={1}>
          {item.counterparty}
        </ThemedText>
        <ThemedText style={[s.nowEta, { color: BP.platinum }]}>
          {item.eta}
        </ThemedText>
      </View>
    </BizCard>
  );
}

function NowLane({ label, items }: { label: string; items: NowItem[] }) {
  return (
    <View style={s.nowLane}>
      <ThemedText style={[s.nowLaneLabel, { color: BP.platinum }]}>{label}</ThemedText>
      {items.length === 0 ? (
        <ThemedText style={[s.nowLaneEmpty, { color: BP.ash }]}>None</ThemedText>
      ) : (
        items.map((item) => <NowItemCard key={item.id} item={item} />)
      )}
    </View>
  );
}

function NowSection({ statusFilter }: { statusFilter: StatusFilter }) {
  // Apply status filter across all items
  const filtered = statusFilter === 'all'
    ? NOW_ITEMS
    : NOW_ITEMS.filter((item) => nowStatusToFilter(item.status) === statusFilter);

  // Partition into 4 lanes
  const laneA = filtered.filter((item) => item.status === 'pending_approval');
  const laneB = filtered.filter((item) => item.status === 'scheduled');
  const laneC = filtered.filter((item) => item.status === 'processing');
  const laneD = filtered.filter((item) => item.status === 'failed');

  if (filtered.length === 0) {
    return (
      <BizCard>
        <View style={s.emptyState}>
          <IconSymbol name="tray" size={24} color={BP.ash} />
          <ThemedText style={[s.emptyText, { color: BP.ash }]}>
            No transactions for this status filter.
          </ThemedText>
        </View>
      </BizCard>
    );
  }

  return (
    <View>
      <BizCardTitle text="LIVE TRANSACTIONS" />
      <NowLane label="Needs Approval" items={laneA} />
      <NowLane label="Needs Release" items={laneB} />
      <NowLane label="In Flight" items={laneC} />
      <NowLane label="Exceptions" items={laneD} />
    </View>
  );
}

// =============================================================================
// SECTION: WALLETS — Connected Accounts
// =============================================================================

function WalletsSection() {
  return (
    <View>
      <BizCardTitle text="CONNECTED ACCOUNTS" />
      {WALLET_ACCOUNTS.map((wallet) => (
        <BizCard key={wallet.id} style={s.walletCard}>
          <View style={s.walletCardHeader}>
            {/* Institution Logo Placeholder */}
            <View style={s.institutionLogo}>
              <IconSymbol name="building.columns.fill" size={18} color={BP.platinum} />
            </View>

            <View style={s.walletInfo}>
              <ThemedText style={[s.walletName, { color: BP.smoke }]} numberOfLines={1}>
                {wallet.name}
              </ThemedText>
              <ThemedText style={[s.walletInstitution, { color: BP.ash }]}>
                {wallet.institution}
              </ThemedText>
            </View>

            {/* Status Dot */}
            <View style={[
              s.walletStatusDot,
              { backgroundColor: walletStatusVariant(wallet.status) === 'success'
                  ? BP.emerald
                  : walletStatusVariant(wallet.status) === 'warning'
                    ? BP.amber
                    : BP.red },
            ]} />
          </View>

          <View style={s.walletCardBody}>
            <View style={s.walletBalanceBlock}>
              <ThemedText style={[s.walletBalanceLabel, { color: BP.ash }]}>Balance</ThemedText>
              <ThemedText style={[s.walletBalance, { color: BP.champagneGold }]}>
                {wallet.balance}
              </ThemedText>
            </View>

            <View style={s.walletMetaBlock}>
              {/* Type Badge */}
              <View style={[s.walletTypeBadge, { backgroundColor: BP.glass }]}>
                <ThemedText style={[s.walletTypeBadgeText, { color: BP.platinum }]}>
                  {walletTypeLabel(wallet.type)}
                </ThemedText>
              </View>

              {/* Status chip */}
              <BizStatusChip
                label={walletStatusLabel(wallet.status)}
                variant={walletStatusVariant(wallet.status)}
              />
            </View>
          </View>

          <ThemedText style={[s.walletLastActivity, { color: BP.ash }]}>
            Last activity: {wallet.lastActivity}
          </ThemedText>
        </BizCard>
      ))}
    </View>
  );
}

// =============================================================================
// SECTION: BATCHES — Payout Batch Cards
// =============================================================================

function BatchesSection() {
  return (
    <View>
      <BizCardTitle text="PAYOUT BATCHES" />
      {PAYOUT_BATCHES.map((batch) => (
        <BizCard key={batch.id} style={s.batchCard}>
          <View style={s.batchCardHeader}>
            <ThemedText style={[s.batchLabel, { color: BP.smoke }]} numberOfLines={1}>
              {batch.label}
            </ThemedText>
            <BizStatusChip
              label={batchStatusLabel(batch.status)}
              variant={batchStatusVariant(batch.status)}
            />
          </View>

          <View style={s.batchCardBody}>
            <View style={s.batchAmountBlock}>
              <ThemedText style={[s.batchAmountLabel, { color: BP.ash }]}>Total</ThemedText>
              <ThemedText style={[s.batchAmount, { color: BP.champagneGold }]}>
                {batch.totalAmount}
              </ThemedText>
            </View>
            <View style={s.batchItemCountBlock}>
              <ThemedText style={[s.batchItemCountLabel, { color: BP.ash }]}>Items</ThemedText>
              <ThemedText style={[s.batchItemCount, { color: BP.smoke }]}>
                {batch.itemCount}
              </ThemedText>
            </View>
          </View>

          <View style={s.batchCardFooter}>
            <ThemedText style={[s.batchCreator, { color: BP.ash }]}>
              {batch.createdBy}
            </ThemedText>
            <ThemedText style={[s.batchDate, { color: BP.platinum }]}>
              {batch.createdAt}
            </ThemedText>
          </View>
        </BizCard>
      ))}
    </View>
  );
}

// =============================================================================
// SECTION: APPROVALS — Pending Approvals
// =============================================================================

function ApprovalsSection() {
  return (
    <View>
      <BizCardTitle text="APPROVAL QUEUE" />
      {RAILS_APPROVALS.map((approval) => (
        <BizCard key={approval.id} style={s.approvalCard}>
          <View style={s.approvalCardHeader}>
            <ThemedText style={[s.approvalTitle, { color: BP.smoke }]} numberOfLines={1}>
              {approval.title}
            </ThemedText>
            <ThemedText style={[s.approvalAmount, { color: BP.champagneGold }]}>
              {approval.amount}
            </ThemedText>
          </View>

          <View style={s.approvalCardMeta}>
            {/* Type Badge */}
            <View style={[s.approvalTypeBadge, { backgroundColor: approvalTypeBadgeColor(approval.type) + '15' }]}>
              <ThemedText style={[s.approvalTypeBadgeText, { color: approvalTypeBadgeColor(approval.type) }]}>
                {approval.type.toUpperCase()}
              </ThemedText>
            </View>

            {/* Status Chip */}
            <BizStatusChip
              label={approvalStatusLabel(approval.status)}
              variant={approvalStatusVariant(approval.status)}
            />
          </View>

          <View style={s.approvalCardFooter}>
            <ThemedText style={[s.approvalRequester, { color: BP.ash }]}>
              Requested by {approval.requester}
            </ThemedText>
            <ThemedText style={[s.approvalDate, { color: BP.platinum }]}>
              {approval.submittedAt}
            </ThemedText>
          </View>

          {/* Action Buttons Placeholder (visible for pending only) */}
          {approval.status === 'pending' && (
            <View style={s.approvalActions}>
              <Pressable
                style={({ pressed }) => [
                  s.approvalActionBtn,
                  s.approvalApproveBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="checkmark" size={12} color={BP.emerald} />
                <ThemedText style={[s.approvalActionText, { color: BP.emerald }]}>
                  Approve
                </ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  s.approvalActionBtn,
                  s.approvalRejectBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="xmark" size={12} color={BP.red} />
                <ThemedText style={[s.approvalActionText, { color: BP.red }]}>
                  Reject
                </ThemedText>
              </Pressable>
            </View>
          )}
        </BizCard>
      ))}
    </View>
  );
}

// =============================================================================
// SECTION: EXCEPTIONS — Exception Items
// =============================================================================

function ExceptionsSection() {
  return (
    <View>
      <BizCardTitle text="EXCEPTIONS" />
      {EXCEPTIONS.map((item) => (
        <BizCard key={item.id} style={s.exceptionCard}>
          <View style={s.exceptionCardHeader}>
            {/* Severity Dot */}
            <View style={[
              s.severityDot,
              {
                backgroundColor: item.severity === 'critical'
                  ? BP.red
                  : item.severity === 'high'
                    ? BP.amber
                    : BP.platinum,
              },
            ]} />
            <ThemedText style={[s.exceptionTitle, { color: BP.smoke }]} numberOfLines={1}>
              {item.title}
            </ThemedText>
          </View>

          <View style={s.exceptionCardMeta}>
            {/* Type Badge */}
            <View style={[s.exceptionTypeBadge, { backgroundColor: BP.glass }]}>
              <ThemedText style={[s.exceptionTypeBadgeText, { color: BP.platinum }]}>
                {exceptionTypeLabel(item.type)}
              </ThemedText>
            </View>

            {/* Severity Chip */}
            <BizStatusChip
              label={item.severity.toUpperCase()}
              variant={exceptionSeverityVariant(item.severity)}
            />

            {/* Status Chip */}
            <BizStatusChip
              label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              variant={exceptionStatusVariant(item.status)}
            />
          </View>

          <View style={s.exceptionCardFooter}>
            <ThemedText style={[s.exceptionAmount, { color: BP.champagneGold }]}>
              {item.amount}
            </ThemedText>
            <ThemedText style={[s.exceptionDate, { color: BP.ash }]}>
              {item.date}
            </ThemedText>
          </View>
        </BizCard>
      ))}
    </View>
  );
}

// =============================================================================
// SECTION: DISPUTES — Dispute List
// =============================================================================

function DisputesSection() {
  return (
    <View>
      {/* Disputes subsection */}
      <BizCardTitle text="DISPUTES & RETURNS" />
      <ThemedText style={[s.subsectionLabel, { color: BP.platinum }]}>Disputes</ThemedText>
      {DISPUTES.map((dispute) => (
        <BizCard key={dispute.id} style={s.disputeCard}>
          <View style={s.disputeCardHeader}>
            <ThemedText style={[s.disputeTitle, { color: BP.smoke }]} numberOfLines={1}>
              {dispute.title}
            </ThemedText>
            <ThemedText style={[s.disputeAmount, { color: BP.champagneGold }]}>
              {dispute.amount}
            </ThemedText>
          </View>

          <View style={s.disputeCardMeta}>
            <BizStatusChip
              label={disputeStatusLabel(dispute.status)}
              variant={disputeStatusVariant(dispute.status)}
            />
            <View style={[s.disputeCategoryPill, { backgroundColor: BP.glass }]}>
              <ThemedText style={[s.disputeCategoryText, { color: BP.platinum }]}>
                {dispute.category}
              </ThemedText>
            </View>
          </View>

          <View style={s.disputeCardFooter}>
            <ThemedText style={[s.disputeCounterparty, { color: BP.ash }]} numberOfLines={1}>
              {dispute.counterparty}
            </ThemedText>
            <ThemedText style={[s.disputeDate, { color: BP.platinum }]}>
              Filed {dispute.filedDate}
            </ThemedText>
          </View>
        </BizCard>
      ))}

      {/* Returns subsection */}
      <ThemedText style={[s.subsectionLabel, { color: BP.platinum, marginTop: Spacing.md }]}>Returns</ThemedText>
      {RETURN_ITEMS.map((ret) => (
        <BizCard key={ret.id} style={s.disputeCard}>
          <View style={s.disputeCardHeader}>
            <ThemedText style={[s.disputeTitle, { color: BP.smoke }]} numberOfLines={1}>
              {ret.title}
            </ThemedText>
            <ThemedText style={[s.disputeAmount, { color: BP.champagneGold }]}>
              {ret.amount}
            </ThemedText>
          </View>

          <View style={s.disputeCardMeta}>
            <BizStatusChip
              label={returnStatusLabel(ret.status)}
              variant={returnStatusVariant(ret.status)}
            />
            <View style={[s.disputeCategoryPill, { backgroundColor: BP.glass }]}>
              <ThemedText style={[s.disputeCategoryText, { color: BP.platinum }]}>
                {ret.reason}
              </ThemedText>
            </View>
          </View>

          <View style={s.disputeCardFooter}>
            <ThemedText style={[s.disputeCounterparty, { color: BP.ash }]} numberOfLines={1}>
              {ret.counterparty}
            </ThemedText>
            <ThemedText style={[s.disputeDate, { color: BP.platinum }]}>
              {ret.returnDate}
            </ThemedText>
          </View>
        </BizCard>
      ))}
    </View>
  );
}

// =============================================================================
// SECTION: RECEIPTS — Receipt List
// =============================================================================

function ReceiptsSection() {
  return (
    <View>
      <BizCardTitle text="RECEIPTS" />
      {RECEIPTS.map((receipt) => (
        <BizCard key={receipt.id} style={s.receiptCard}>
          <View style={s.receiptCardHeader}>
            <ThemedText style={[s.receiptDescription, { color: BP.smoke }]} numberOfLines={1}>
              {receipt.description}
            </ThemedText>
            <ThemedText style={[s.receiptAmount, { color: BP.champagneGold }]}>
              {receipt.amount}
            </ThemedText>
          </View>

          <View style={s.receiptCardMeta}>
            <ThemedText style={[s.receiptDate, { color: BP.ash }]}>
              {receipt.date}
            </ThemedText>
            <View style={[s.receiptCategoryPill, { backgroundColor: BP.glass }]}>
              <ThemedText style={[s.receiptCategoryText, { color: BP.platinum }]}>
                {receipt.category}
              </ThemedText>
            </View>
          </View>

          <View style={s.receiptCardFooter}>
            <ThemedText style={[s.receiptEntity, { color: BP.ash }]}>
              {receipt.entity}
            </ThemedText>
            {receipt.receiptUrl && (
              <View style={s.receiptLinkRow}>
                <IconSymbol name="doc.text" size={10} color={BP.platinum} />
                <ThemedText style={[s.receiptLinkText, { color: BP.platinum }]}>
                  View Receipt
                </ThemedText>
              </View>
            )}
          </View>
        </BizCard>
      ))}
    </View>
  );
}

// =============================================================================
// SECTION: ADMIN — Settings List
// =============================================================================

function AdminSection() {
  return (
    <View>
      <BizCardTitle text="RAILS ADMIN" />
      <BizCard>
        {ADMIN_SETTINGS.map((setting, idx) => (
          <View
            key={setting.id}
            style={[
              s.adminRow,
              idx < ADMIN_SETTINGS.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: BP.graphite,
              },
            ]}
          >
            {/* Type Indicator Icon */}
            <View style={s.adminIconWrap}>
              <IconSymbol
                name={adminSettingTypeIcon(setting.type) as any}
                size={14}
                color={BP.platinum}
              />
            </View>

            {/* Label + Category */}
            <View style={s.adminLabelBlock}>
              <ThemedText style={[s.adminLabel, { color: BP.smoke }]}>{setting.label}</ThemedText>
              <ThemedText style={[s.adminCategory, { color: BP.ash }]}>{setting.category}</ThemedText>
            </View>

            {/* Current Value */}
            <View style={s.adminValueBlock}>
              {setting.type === 'toggle' ? (
                <View style={[
                  s.adminToggleChip,
                  {
                    backgroundColor: setting.value === 'Enabled'
                      ? BP.emerald + '15'
                      : BP.red + '15',
                  },
                ]}>
                  <ThemedText style={[
                    s.adminToggleText,
                    {
                      color: setting.value === 'Enabled' ? BP.emerald : BP.red,
                    },
                  ]}>
                    {setting.value}
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={[s.adminValue, { color: BP.champagneGold }]} numberOfLines={1}>
                  {setting.value}
                </ThemedText>
              )}
            </View>

            {/* Chevron */}
            <IconSymbol name="chevron.right" size={10} color={BP.ash} />
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: RELEASE QUEUE — Approved items awaiting release
// =============================================================================

function ReleaseQueueSection() {
  return (
    <View>
      <BizCardTitle text="RELEASE QUEUE" />
      {RELEASE_QUEUE_ITEMS.map((item) => {
        const txnState = releaseQueueTxnState(item.status);
        return (
          <BizCard key={item.id} style={s.releaseCard}>
            <View style={s.releaseCardHeader}>
              <ThemedText style={[s.releaseTitle, { color: BP.smoke }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText style={[s.releaseAmount, { color: BP.champagneGold }]}>
                {item.amount}
              </ThemedText>
            </View>

            <View style={s.releaseCardMeta}>
              {/* TXN State Badge */}
              <View style={[s.txnStateBadge, { backgroundColor: txnStateBadgeColor(txnState) + '15' }]}>
                <ThemedText style={[s.txnStateBadgeText, { color: txnStateBadgeColor(txnState) }]}>
                  {txnState}
                </ThemedText>
              </View>

              {/* Rail Badge */}
              <View style={[s.railBadge, { backgroundColor: BP.glass }]}>
                <ThemedText style={[s.railBadgeText, { color: BP.platinum }]}>
                  {item.rail}
                </ThemedText>
              </View>

              {/* Status Badge */}
              {item.status === 'released' ? (
                <BizStatusChip label="Released" variant="success" />
              ) : (
                <BizStatusChip label="Awaiting Release" variant="warning" />
              )}
            </View>

            <View style={s.releaseCardFooter}>
              <ThemedText style={[s.releaseDetail, { color: BP.ash }]}>
                Approved by {item.approvedBy} on {item.approvedAt}
              </ThemedText>
              <ThemedText style={[s.releaseDetail, { color: BP.ash }]}>
                Authority: {item.releaseAuthority}
              </ThemedText>
            </View>

            {item.auditNote !== '' && (
              <ThemedText style={[s.releaseAuditNote, { color: BP.platinum }]}>
                Note: {item.auditNote}
              </ThemedText>
            )}

            {/* Release CTA for awaiting items */}
            {item.status === 'awaiting_release' && (
              <View style={s.releaseActions}>
                <ThemedText style={[s.releaseAuditHint, { color: BP.ash }]}>
                  Add audit note before releasing
                </ThemedText>
                <Pressable
                  style={({ pressed }) => [
                    s.releaseCta,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <IconSymbol name="arrow.up.circle.fill" size={14} color={BP.emerald} />
                  <ThemedText style={[s.releaseCtaText, { color: BP.emerald }]}>
                    Release
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </BizCard>
        );
      })}
    </View>
  );
}

// =============================================================================
// CONTENT SWITCHER — Renders active sub-tab
// =============================================================================

function TabContent({ activeTab, statusFilter }: { activeTab: RailsSubTab; statusFilter: StatusFilter }) {
  switch (activeTab) {
    case 'now':
      return <NowSection statusFilter={statusFilter} />;
    case 'wallets':
      return <WalletsSection />;
    case 'batches':
      return <BatchesSection />;
    case 'approvals':
      return <ApprovalsSection />;
    case 'release_queue':
      return <ReleaseQueueSection />;
    case 'exceptions':
      return <ExceptionsSection />;
    case 'disputes':
      return <DisputesSection />;
    case 'receipts':
      return <ReceiptsSection />;
    case 'admin':
      return <AdminSection />;
    default:
      return null;
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessPaymentRails({ colors, role = 'B1' }: Props) {
  const [activeTab, setActiveTab] = useState<RailsSubTab>('now');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // ---- RBAC Gate: Tiered access ----
  // B3+ (Public): Fully locked
  if (role === 'B3') {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <View style={s.contentContainer}>
          <EntityScopeBar
            entityId={DEFAULT_ENTITY.id}
            entityName={DEFAULT_ENTITY.name}
            entityType={DEFAULT_ENTITY.type}
            status={DEFAULT_ENTITY.status}
            colors={colors}
          />
          <BizEmptyLock
            title="Payment Rails"
            message="Payment infrastructure details are private."
          />
          <View style={s.poweredBranding}>
            <ThemedText style={[s.poweredText, { color: BP.ash }]}>Payments powered by KaNeXT</ThemedText>
          </View>
        </View>
      </View>
    );
  }

  // B2a (Retail Investor): Curated proof — health indicator, monthly flows, compliance proof
  if (role === 'B2a') {
    const statusClr = overallStatusColor(RAILS_OVERALL_STATUS);
    const majorExceptions = EXCEPTIONS.filter((e) => e.severity === 'critical' && e.status !== 'resolved');
    const settledBatches = PAYOUT_BATCHES.filter((b) => b.status === 'settled');
    return (
      <ScrollView
        style={[s.container, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <EntityScopeBar
          entityId={DEFAULT_ENTITY.id}
          entityName={DEFAULT_ENTITY.name}
          entityType={DEFAULT_ENTITY.type}
          status={DEFAULT_ENTITY.status}
          colors={colors}
        />

        {/* Rails Health Indicator */}
        <BizCard>
          <BizCardTitle>Rails Health</BizCardTitle>
          <View style={[s.overallStatusBanner, { backgroundColor: statusClr + '12', borderColor: statusClr + '30' }]}>
            <View style={[s.overallStatusDot, { backgroundColor: statusClr }]} />
            <ThemedText style={[s.overallStatusText, { color: statusClr }]}>
              {overallStatusText(RAILS_OVERALL_STATUS)}
            </ThemedText>
            <ThemedText style={[s.overallStatusLabel, { color: statusClr }]}>
              {RAILS_OVERALL_STATUS}
            </ThemedText>
          </View>
          <View style={s.retailHealthRow}>
            {RAILS_HEALTH.filter((m) => ['Settlement Clock', 'Connected Processors', 'Audit'].includes(m.label)).map((metric) => (
              <View key={metric.id} style={s.retailHealthItem}>
                <View style={[s.healthDot, { backgroundColor: healthStatusColor(metric.status) }]} />
                <ThemedText style={[s.retailHealthLabel, { color: BP.ash }]}>{metric.label}</ThemedText>
                <ThemedText style={[s.retailHealthValue, { color: BP.smoke }]}>{metric.value}</ThemedText>
              </View>
            ))}
          </View>
        </BizCard>

        {/* Monthly Flows Summary */}
        <BizCard>
          <BizCardTitle>Monthly Settlement Summary</BizCardTitle>
          {settledBatches.length > 0 ? settledBatches.map((batch) => (
            <View key={batch.id} style={s.retailFlowRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.retailFlowTitle, { color: BP.smoke }]}>{batch.label}</ThemedText>
                <ThemedText style={[s.retailFlowSub, { color: BP.ash }]}>{batch.createdAt}</ThemedText>
              </View>
              <ThemedText style={[s.retailFlowAmount, { color: BP.champagneGold }]}>{batch.totalAmount}</ThemedText>
            </View>
          )) : (
            <ThemedText style={[s.retailFlowSub, { color: BP.ash }]}>No settled batches this period.</ThemedText>
          )}
        </BizCard>

        {/* Compliance Proof */}
        <BizCard>
          <BizCardTitle>Compliance & Status</BizCardTitle>
          <View style={s.retailProofGrid}>
            <View style={s.retailProofItem}>
              <IconSymbol name="checkmark.seal.fill" size={18} color={BP.emerald} />
              <ThemedText style={[s.retailProofLabel, { color: BP.smoke }]}>Rails Active</ThemedText>
            </View>
            <View style={s.retailProofItem}>
              <IconSymbol name="shield.fill" size={18} color={BP.emerald} />
              <ThemedText style={[s.retailProofLabel, { color: BP.smoke }]}>Fraud Monitoring On</ThemedText>
            </View>
            <View style={s.retailProofItem}>
              <IconSymbol name="doc.text.fill" size={18} color={BP.emerald} />
              <ThemedText style={[s.retailProofLabel, { color: BP.smoke }]}>Audit Score: 94%</ThemedText>
            </View>
            {majorExceptions.length > 0 && (
              <View style={s.retailProofItem}>
                <IconSymbol name="exclamationmark.triangle.fill" size={18} color={BP.red} />
                <ThemedText style={[s.retailProofLabel, { color: BP.red }]}>
                  {majorExceptions.length} Critical Exception{majorExceptions.length > 1 ? 's' : ''}
                </ThemedText>
              </View>
            )}
          </View>
        </BizCard>

        <View style={s.bottomSpacer} />
      </ScrollView>
    );
  }

  // B2b (Board/Strategic Investor): Board Rails Health — health strip, major exceptions, governance receipts, monthly summaries
  if (role === 'B2b') {
    const statusClr = overallStatusColor(RAILS_OVERALL_STATUS);
    const majorExceptions = EXCEPTIONS.filter((e) => e.severity === 'critical' || e.severity === 'high');
    const governanceReceipts = RECEIPTS.filter((r) => ['Partnership', 'Donations', 'Banking'].includes(r.category));
    const recentBatches = PAYOUT_BATCHES.slice(0, 4);
    return (
      <ScrollView
        style={[s.container, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <EntityScopeBar
          entityId={DEFAULT_ENTITY.id}
          entityName={DEFAULT_ENTITY.name}
          entityType={DEFAULT_ENTITY.type}
          status={DEFAULT_ENTITY.status}
          colors={colors}
        />

        {/* Overall Status + Full Health Strip */}
        <View style={s.headerContainer}>
          <View style={[s.overallStatusBanner, { backgroundColor: statusClr + '12', borderColor: statusClr + '30' }]}>
            <View style={[s.overallStatusDot, { backgroundColor: statusClr }]} />
            <ThemedText style={[s.overallStatusText, { color: statusClr }]}>
              {overallStatusText(RAILS_OVERALL_STATUS)}
            </ThemedText>
            <ThemedText style={[s.overallStatusLabel, { color: statusClr }]}>
              {RAILS_OVERALL_STATUS}
            </ThemedText>
          </View>
          <View style={s.healthStrip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.healthStripScroll}>
              {RAILS_HEALTH.map((metric) => (
                <View key={metric.id} style={s.healthMetric}>
                  <View style={s.healthMetricTop}>
                    <View style={[s.healthDot, { backgroundColor: healthStatusColor(metric.status) }]} />
                    <ThemedText style={[s.healthLabel, { color: BP.ash }]}>{metric.label}</ThemedText>
                  </View>
                  <ThemedText style={[s.healthValue, { color: BP.smoke }]}>{metric.value}</ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Major Exceptions (critical + high only) */}
        <BizCard>
          <BizCardTitle>Major Exceptions</BizCardTitle>
          {majorExceptions.length === 0 ? (
            <ThemedText style={[s.retailFlowSub, { color: BP.ash }]}>No major exceptions.</ThemedText>
          ) : majorExceptions.map((ex) => (
            <View key={ex.id} style={s.boardExceptionRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.boardExceptionTitle, { color: BP.smoke }]}>{ex.title}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                  <BizStatusChip label={exceptionTypeLabel(ex.type)} variant={exceptionSeverityVariant(ex.severity)} />
                  <BizStatusChip label={ex.status} variant={exceptionStatusVariant(ex.status)} />
                </View>
              </View>
              <ThemedText style={[s.boardExceptionAmount, { color: BP.champagneGold }]}>{ex.amount}</ThemedText>
            </View>
          ))}
        </BizCard>

        {/* Monthly Settlement Summaries */}
        <BizCard>
          <BizCardTitle>Monthly Settlement Summary</BizCardTitle>
          {recentBatches.map((batch) => (
            <View key={batch.id} style={s.retailFlowRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.retailFlowTitle, { color: BP.smoke }]}>{batch.label}</ThemedText>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                  <ThemedText style={[s.retailFlowSub, { color: BP.ash }]}>{batch.createdAt}</ThemedText>
                  <BizStatusChip label={batchStatusLabel(batch.status)} variant={batchStatusVariant(batch.status)} />
                </View>
              </View>
              <ThemedText style={[s.retailFlowAmount, { color: BP.champagneGold }]}>{batch.totalAmount}</ThemedText>
            </View>
          ))}
        </BizCard>

        {/* Governance Receipts */}
        <BizCard>
          <BizCardTitle>Governance Receipts</BizCardTitle>
          {governanceReceipts.length === 0 ? (
            <ThemedText style={[s.retailFlowSub, { color: BP.ash }]}>No governance receipts.</ThemedText>
          ) : governanceReceipts.map((receipt) => (
            <View key={receipt.id} style={s.retailFlowRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.retailFlowTitle, { color: BP.smoke }]}>{receipt.description}</ThemedText>
                <ThemedText style={[s.retailFlowSub, { color: BP.ash }]}>{receipt.date} · {receipt.entity}</ThemedText>
              </View>
              <ThemedText style={[s.retailFlowAmount, { color: BP.champagneGold }]}>{receipt.amount}</ThemedText>
            </View>
          ))}
        </BizCard>

        <View style={s.bottomSpacer} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Entity Scope Bar */}
      <EntityScopeBar
        entityId={DEFAULT_ENTITY.id}
        entityName={DEFAULT_ENTITY.name}
        entityType={DEFAULT_ENTITY.type}
        status={DEFAULT_ENTITY.status}
        colors={colors}
      />

      {/* Fixed Sticky Header Concept */}
      <RailsHeader
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* 9-Section Sub-Tab Bar */}
      <BizSubTabBar
        tabs={RAILS_SUB_TABS}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as RailsSubTab)}
      />

      {/* Content Area */}
      <TabContent activeTab={activeTab} statusFilter={statusFilter} />

      {/* Bottom spacer */}
      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // ---- Layout ----
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  bottomSpacer: {
    height: 120,
  },

  // ---- Header: Overall Status Banner ----
  overallStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  overallStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  overallStatusText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  overallStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ---- Header: Health Strip ----
  headerContainer: {
    marginBottom: Spacing.md,
  },
  healthStrip: {
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  healthStripScroll: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  healthMetric: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 72,
  },
  healthMetricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  healthValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ---- Header: CTA Buttons ----
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
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
    borderColor: BP.graphite,
    backgroundColor: BP.carbon,
  },
  ctaButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ---- Header: Status Filter Pills ----
  filterPillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- Now Section ----
  nowCard: {
    marginBottom: Spacing.sm,
  },
  nowCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  nowTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  nowAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  nowCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  railBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  railBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nowCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nowCounterparty: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  nowEta: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ---- TXN State Badges ----
  txnStateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  txnStateBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // ---- Now Lanes ----
  nowLane: {
    marginBottom: Spacing.md,
  },
  nowLaneLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    paddingLeft: 2,
  },
  nowLaneEmpty: {
    fontSize: 12,
    paddingVertical: Spacing.sm,
    paddingLeft: 2,
  },

  // ---- Empty State ----
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },

  // ---- Subsection Labels ----
  subsectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    paddingLeft: 2,
  },

  // ---- Release Queue Section ----
  releaseCard: {
    marginBottom: Spacing.sm,
  },
  releaseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  releaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  releaseAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  releaseCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  releaseCardFooter: {
    marginBottom: Spacing.xs,
  },
  releaseDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  releaseAuditNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  releaseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  releaseAuditHint: {
    fontSize: 11,
    flex: 1,
  },
  releaseCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BP.emerald + '40',
    backgroundColor: BP.emerald + '10',
  },
  releaseCtaText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- Wallets Section ----
  walletCard: {
    marginBottom: Spacing.sm,
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  institutionLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BP.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BP.graphite,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 14,
    fontWeight: '600',
  },
  walletInstitution: {
    fontSize: 12,
    marginTop: 1,
  },
  walletStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walletCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  walletBalanceBlock: {},
  walletBalanceLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  walletMetaBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  walletTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  walletTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  walletLastActivity: {
    fontSize: 11,
  },

  // ---- Batches Section ----
  batchCard: {
    marginBottom: Spacing.sm,
  },
  batchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  batchLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  batchCardBody: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  batchAmountBlock: {},
  batchAmountLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  batchAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  batchItemCountBlock: {},
  batchItemCountLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  batchItemCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  batchCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batchCreator: {
    fontSize: 12,
  },
  batchDate: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ---- Approvals Section ----
  approvalCard: {
    marginBottom: Spacing.sm,
  },
  approvalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  approvalTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  approvalAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  approvalCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  approvalTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  approvalTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  approvalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  approvalRequester: {
    fontSize: 12,
    flex: 1,
  },
  approvalDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  approvalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  approvalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  approvalApproveBtn: {
    borderColor: BP.emerald + '40',
    backgroundColor: BP.emerald + '10',
  },
  approvalRejectBtn: {
    borderColor: BP.red + '40',
    backgroundColor: BP.red + '10',
  },
  approvalActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- Exceptions Section ----
  exceptionCard: {
    marginBottom: Spacing.sm,
  },
  exceptionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exceptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  exceptionCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  exceptionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  exceptionTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  exceptionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exceptionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  exceptionDate: {
    fontSize: 11,
  },

  // ---- Disputes Section ----
  disputeCard: {
    marginBottom: Spacing.sm,
  },
  disputeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  disputeTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  disputeAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  disputeCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  disputeCategoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  disputeCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disputeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disputeCounterparty: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  disputeDate: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ---- Receipts Section ----
  receiptCard: {
    marginBottom: Spacing.sm,
  },
  receiptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  receiptDescription: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  receiptAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  receiptCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  receiptDate: {
    fontSize: 12,
  },
  receiptCategoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  receiptCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  receiptCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptEntity: {
    fontSize: 12,
  },
  receiptLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  receiptLinkText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ---- Admin Section ----
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
  },
  adminIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BP.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminLabelBlock: {
    flex: 1,
  },
  adminLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  adminCategory: {
    fontSize: 11,
    marginTop: 1,
  },
  adminValueBlock: {
    alignItems: 'flex-end',
    marginRight: Spacing.xs,
    maxWidth: 160,
  },
  adminToggleChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  adminToggleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  adminValue: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ---- B3 Powered Branding ----
  poweredBranding: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  poweredText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // ---- B2a Retail View ----
  retailHealthRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  retailHealthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retailHealthLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  retailHealthValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  retailFlowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  retailFlowTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  retailFlowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  retailFlowAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  retailProofGrid: {
    gap: Spacing.sm,
  },
  retailProofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retailProofLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ---- B2b Board View ----
  boardExceptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  boardExceptionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  boardExceptionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
