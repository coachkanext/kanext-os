/**
 * Sports Organization Payment Rails V2 — Money-movement execution surface.
 * Sub-tabs: Now | Streams | Approvals | Exceptions | Audit | Disbursements | Settings
 * RBAC: R1 full 7-tab; R2 Now+Streams+Approvals (initiate only); R3 Now+Streams (view);
 *       R4 Disbursements only (own); R5 locked.
 *
 * Spec: "What's pending/failed/blocked, who can initiate vs approve, payment streams,
 *        exceptions & holds, audit-lite."
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { SportsRoleLens } from '@/utils/sports-rbac';
import { canSeeSensitive, canSeeCoachActions, canSeeAdminActions } from '@/utils/sports-rbac';
import {
  PAYMENT_RAILS_SUB_TABS,
  getRailsHealth,
  ACTION_QUEUE,
  PAYMENT_STREAMS,
  PAYMENT_APPROVALS,
  PAYMENT_EXCEPTIONS,
  AUDIT_ENTRIES,
  DISBURSEMENTS,
  RAIL_SETTINGS,
  STREAM_STATUS_LABELS,
  STREAM_STATUS_COLORS,
  STREAM_CATEGORY_LABELS,
  STREAM_CATEGORY_COLORS,
  METHOD_LABELS,
  METHOD_ICONS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_TYPE_COLORS,
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_COLORS,
  DISBURSEMENT_STATUS_LABELS,
  DISBURSEMENT_STATUS_COLORS,
  DISBURSEMENT_TYPE_LABELS,
} from '@/data/mock-sports-org-payment-rails-v2';
import type {
  PaymentAction,
  PaymentStream,
  PaymentApproval,
  PaymentException,
  AuditEntry,
  Disbursement,
  RailSetting,
} from '@/data/mock-sports-org-payment-rails-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.sports;
const SUB_TABS = PAYMENT_RAILS_SUB_TABS.map((t) => ({ id: t.id, label: t.label }));

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
// RAILS HEALTH STRIP (Block 0 — sticky header)
// =============================================================================

function RailsHealthStrip({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const health = useMemo(() => getRailsHealth(), []);

  return (
    <View style={[s.healthStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={s.healthRow}>
        <View style={s.healthStatsRow}>
          <View style={[s.countBadge, { backgroundColor: '#F59E0B20' }]}>
            <ThemedText style={[s.countBadgeText, { color: '#F59E0B' }]}>
              Pending {formatCurrency(health.pendingAmount)}
            </ThemedText>
          </View>
          <View style={[s.countBadge, { backgroundColor: '#EF444420' }]}>
            <ThemedText style={[s.countBadgeText, { color: '#EF4444' }]}>
              Failed {health.failedCount}
            </ThemedText>
          </View>
          <View style={[s.countBadge, { backgroundColor: `${ACCENT}20` }]}>
            <ThemedText style={[s.countBadgeText, { color: ACCENT }]}>
              Blocked {health.blockedCount}
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={s.healthRow}>
        <View style={s.healthStatsRow}>
          <View style={[s.countBadge, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[s.countBadgeText, { color: accentColor }]}>
              Approvals {health.approvalsNeeded}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[s.healthSettlement, { color: colors.textTertiary }]}>
          Last: {formatTimestamp(health.lastSettlement)}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// NOW TAB (Block 0 health + Block 1 action queue)
// =============================================================================

function NowTab({
  colors,
  accentColor,
  onSelectAction,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectAction: (action: PaymentAction) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: PaymentAction }) => {
      const priorityColor = PRIORITY_COLORS[item.priority];
      const isBlocked = item.type === 'blocked';

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectAction(item);
          }}
        >
          <View style={s.listCardHeader}>
            <View style={[s.actionTypeDot, { backgroundColor: isBlocked ? '#EF4444' : '#F59E0B' }]} />
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge
              label={isBlocked ? 'BLOCKED' : 'APPROVAL'}
              color={isBlocked ? '#EF4444' : '#F59E0B'}
            />
            <StatusBadge label={PRIORITY_LABELS[item.priority].toUpperCase()} color={priorityColor} />
          </View>
          <View style={s.listCardMeta}>
            <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
              {item.owner}
            </ThemedText>
            <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
              Due {formatDate(item.dueDate)}
            </ThemedText>
          </View>
          <ThemedText style={[s.reasonText, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.reason}
          </ThemedText>
        </Pressable>
      );
    },
    [colors, onSelectAction],
  );

  return (
    <FlatList
      data={ACTION_QUEUE}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Action Queue</ThemedText>
      }
      ListEmptyComponent={
        <EmptyState icon="checkmark.circle.fill" label="No pending actions" colors={colors} />
      }
    />
  );
}

// =============================================================================
// STREAMS TAB (Block 2 — payment streams)
// =============================================================================

function StreamsTab({
  colors,
  accentColor,
  onSelectStream,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectStream: (stream: PaymentStream) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: PaymentStream }) => {
      const statusColor = STREAM_STATUS_COLORS[item.status];
      const catColor = STREAM_CATEGORY_COLORS[item.category];

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectStream(item);
          }}
        >
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={STREAM_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
            <StatusBadge label={STREAM_CATEGORY_LABELS[item.category].toUpperCase()} color={catColor} />
            <StatusBadge label={METHOD_LABELS[item.method]} color={colors.textSecondary} />
          </View>
          <View style={s.listCardMeta}>
            <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
              {item.cadence === 'one-time' ? 'One-time' : item.cadence.charAt(0).toUpperCase() + item.cadence.slice(1)}
            </ThemedText>
            <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
              {item.nextPayment ? `Next: ${formatDate(item.nextPayment)}` : 'Not scheduled'}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={PAYMENT_STREAMS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.triangle.branch" label="No payment streams" colors={colors} />
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
  onSelectApproval,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectApproval: (a: PaymentApproval) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: PaymentApproval }) => {
      const statusColor = APPROVAL_STATUS_COLORS[item.status];
      const priorityColor = PRIORITY_COLORS[item.priority];
      const catColor = STREAM_CATEGORY_COLORS[item.category];

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
            <ThemedText style={[s.amountText, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={APPROVAL_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
            <StatusBadge label={PRIORITY_LABELS[item.priority].toUpperCase()} color={priorityColor} />
            <StatusBadge label={STREAM_CATEGORY_LABELS[item.category].toUpperCase()} color={catColor} />
          </View>
          <View style={s.listCardMeta}>
            <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
              By {item.requestedBy}
            </ThemedText>
            <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
              Due {formatDate(item.dueDate)}
            </ThemedText>
          </View>
          {item.notes ? (
            <ThemedText style={[s.reasonText, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.notes}
            </ThemedText>
          ) : null}
        </Pressable>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={PAYMENT_APPROVALS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="checkmark.seal.fill" label="No approvals" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EXCEPTIONS TAB (Block 3 — holds)
// =============================================================================

function ExceptionsTab({
  colors,
  accentColor,
  onSelectException,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectException: (e: PaymentException) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: PaymentException }) => {
      const typeColor = EXCEPTION_TYPE_COLORS[item.type];

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectException(item);
          }}
        >
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: '#EF4444' }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={EXCEPTION_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
          </View>
          <View style={s.listCardMeta}>
            <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
              Blocked since {formatDate(item.blockedSince)}
            </ThemedText>
            <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
              {item.assignee}
            </ThemedText>
          </View>
          <ThemedText style={[s.reasonText, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.reason}
          </ThemedText>
        </Pressable>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={PAYMENT_EXCEPTIONS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="exclamationmark.triangle.fill" label="No exceptions" colors={colors} />
      }
    />
  );
}

// =============================================================================
// AUDIT TAB (Block 4 — audit-lite)
// =============================================================================

function AuditTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: AuditEntry }) => {
      const actionColor = AUDIT_ACTION_COLORS[item.action];

      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <View style={s.auditHeaderLeft}>
              <View style={[s.actionTypeDot, { backgroundColor: actionColor }]} />
              <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
            </View>
            <ThemedText style={[s.amountText, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={AUDIT_ACTION_LABELS[item.action].toUpperCase()} color={actionColor} />
          </View>
          <View style={s.listCardMeta}>
            <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
              {item.initiatedBy}
              {item.approvedBy ? ` → ${item.approvedBy}` : ''}
            </ThemedText>
            <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
              {formatTimestamp(item.timestamp)}
            </ThemedText>
          </View>
          <ThemedText style={[s.refText, { color: colors.textTertiary }]}>
            {item.reference}
          </ThemedText>
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={AUDIT_ENTRIES}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="list.bullet.clipboard.fill" label="No audit entries" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DISBURSEMENTS TAB (player-facing)
// =============================================================================

function DisbursementsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Disbursement }) => {
      const statusColor = DISBURSEMENT_STATUS_COLORS[item.status];
      const typeLabel = DISBURSEMENT_TYPE_LABELS[item.type];

      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
            <ThemedText style={[s.amountText, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={DISBURSEMENT_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
            <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
            <StatusBadge label={METHOD_LABELS[item.method]} color={colors.textSecondary} />
          </View>
          <View style={s.listCardMeta}>
            <ThemedText style={[s.metaText, { color: colors.textSecondary }]}>
              {item.recipient}
            </ThemedText>
            <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
              {formatDate(item.date)}
            </ThemedText>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={DISBURSEMENTS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="banknote.fill" label="No disbursements" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SETTINGS TAB (admin rail config)
// =============================================================================

function SettingsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Rail Configuration</ThemedText>
      {RAIL_SETTINGS.map((setting) => (
        <View
          key={setting.id}
          style={[s.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.settingInfo}>
            <ThemedText style={[s.settingLabel, { color: colors.text }]}>{setting.label}</ThemedText>
            <ThemedText style={[s.settingDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {setting.description}
            </ThemedText>
          </View>
          <View style={s.settingValueWrap}>
            <ThemedText style={[s.settingValue, { color: accentColor }]}>{setting.value}</ThemedText>
            {setting.editable && (
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// LOCKED STATE
// =============================================================================

function LockedState({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.lockedContainer}>
      <IconSymbol name="lock.fill" size={48} color={colors.textTertiary} />
      <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Payment Rails Locked</ThemedText>
      <ThemedText style={[s.lockedDesc, { color: colors.textSecondary }]}>
        Your current role does not have access to payment rails. Contact your program administrator.
      </ThemedText>
    </View>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function PaymentOverviewTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const health = getRailsHealth();

  const failedCount = ACTION_QUEUE.filter((a) => a.type === 'blocked').length;
  const pendingCount = PAYMENT_APPROVALS.filter((a) => a.status === 'pending').length;
  const activeStreams = PAYMENT_STREAMS.filter((s) => s.status === 'active').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Rails Health */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Rails Health</ThemedText>
      <View style={s.kpiGrid}>
        {health.rails.map((rail) => (
          <View
            key={rail.name}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View
              style={[
                s.healthDot,
                {
                  backgroundColor:
                    rail.status === 'green' ? '#22C55E' : rail.status === 'yellow' ? '#F59E0B' : '#EF4444',
                },
              ]}
            />
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{rail.name}</ThemedText>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>
              {rail.status.charAt(0).toUpperCase() + rail.status.slice(1)}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Key Metrics */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: 20 }]}>Key Metrics</ThemedText>
      <View style={s.kpiGrid}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: activeStreams > 0 ? accentColor : '#A1A1AA' }]}>
            {activeStreams}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active Streams</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: failedCount > 0 ? '#EF4444' : '#22C55E' }]}>
            {failedCount}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Blocked</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: pendingCount > 0 ? '#F59E0B' : '#22C55E' }]}>
            {pendingCount}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Pending Approval</ThemedText>
        </View>
      </View>

      {/* Next Settlement Window */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: 20 }]}>
        Next Settlement
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardDetailValue, { color: colors.text }]}>
          {health.nextSettlementWindow}
        </ThemedText>
        <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>Settlement Window</ThemedText>
      </View>

      {/* Total Volume */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
        <ThemedText style={[s.cardDetailValue, { color: accentColor }]}>
          {health.totalVolume}
        </ThemedText>
        <ThemedText style={[s.cardDetailLabel, { color: colors.textSecondary }]}>Total Volume (30d)</ThemedText>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SportsOrgPaymentRailsV2({ colors, accentColor, role = 'R3' }: Props) {
  // ----- RBAC gate -----
  if (!canSeeCoachActions(role)) return <LockedState colors={colors} />;

  // ----- state -----
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [approvalSheetVisible, setApprovalSheetVisible] = useState(false);
  const [exceptionSheetVisible, setExceptionSheetVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentAction | PaymentStream | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<PaymentApproval | null>(null);
  const [selectedException, setSelectedException] = useState<PaymentException | null>(null);

  // ----- visible sub-tabs by role -----
  const visibleSubTabs = useMemo(() => {
    if (canSeeSensitive(role)) return SUB_TABS; // R0-R3: full 8
    if (role === 'R4') return SUB_TABS.filter((t) => ['overview', 'now', 'streams'].includes(t.id)); // R4 (Asst Coach/RC)
    return SUB_TABS;
  }, [role]);

  // Clamp active tab if role changed
  const effectiveTab = useMemo(() => {
    if (visibleSubTabs.find((t) => t.id === activeSubTab)) return activeSubTab;
    return visibleSubTabs[0]?.id ?? 'overview';
  }, [activeSubTab, visibleSubTabs]);

  // ----- handlers -----
  const handleSelectAction = useCallback((action: PaymentAction) => {
    setSelectedPayment(action);
    setPaymentSheetVisible(true);
  }, []);

  const handleSelectStream = useCallback((stream: PaymentStream) => {
    setSelectedPayment(stream);
    setPaymentSheetVisible(true);
  }, []);

  const handleSelectApproval = useCallback((a: PaymentApproval) => {
    setSelectedApproval(a);
    setApprovalSheetVisible(true);
  }, []);

  const handleSelectException = useCallback((e: PaymentException) => {
    setSelectedException(e);
    setExceptionSheetVisible(true);
  }, []);

  // ----- render content -----
  const renderContent = () => {
    switch (effectiveTab) {
      case 'overview':
        return <PaymentOverviewTab colors={colors} accentColor={accentColor} />;
      case 'now':
        return <NowTab colors={colors} accentColor={accentColor} onSelectAction={handleSelectAction} />;
      case 'streams':
        return <StreamsTab colors={colors} accentColor={accentColor} onSelectStream={handleSelectStream} />;
      case 'approvals':
        return <ApprovalsTab colors={colors} accentColor={accentColor} onSelectApproval={handleSelectApproval} />;
      case 'exceptions':
        return <ExceptionsTab colors={colors} accentColor={accentColor} onSelectException={handleSelectException} />;
      case 'audit':
        return <AuditTab colors={colors} accentColor={accentColor} />;
      case 'disbursements':
        return <DisbursementsTab colors={colors} accentColor={accentColor} />;
      case 'settings':
        return <SettingsTab colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.root}>
      {/* Health strip (sticky Block 0) */}
      <RailsHealthStrip colors={colors} accentColor={accentColor} />

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
            activeId={effectiveTab}
            onSelect={setActiveSubTab}
            accentColor={accentColor}
            colors={colors}
          />
        </>
      ) : null}

      {/* Content */}
      <View style={s.content}>{renderContent()}</View>

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

      {/* ===== Bottom Sheet: Payment / Action Detail ===== */}
      <BottomSheet
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
        title={
          selectedPayment && 'type' in selectedPayment
            ? (selectedPayment as PaymentAction).title
            : selectedPayment
              ? (selectedPayment as PaymentStream).name
              : 'Payment Detail'
        }
        useModal
      >
        {selectedPayment && 'type' in selectedPayment ? (
          // PaymentAction detail
          <View style={s.sheetContent}>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatCurrency((selectedPayment as PaymentAction).amount)}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Type</ThemedText>
              <StatusBadge
                label={(selectedPayment as PaymentAction).type === 'blocked' ? 'BLOCKED' : 'APPROVAL'}
                color={(selectedPayment as PaymentAction).type === 'blocked' ? '#EF4444' : '#F59E0B'}
              />
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Priority</ThemedText>
              <StatusBadge
                label={PRIORITY_LABELS[(selectedPayment as PaymentAction).priority].toUpperCase()}
                color={PRIORITY_COLORS[(selectedPayment as PaymentAction).priority]}
              />
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {(selectedPayment as PaymentAction).owner}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Due</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatDate((selectedPayment as PaymentAction).dueDate)}
              </ThemedText>
            </View>
            <View style={s.sheetSection}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Reason</ThemedText>
              <ThemedText style={[s.sheetDesc, { color: colors.text }]}>
                {(selectedPayment as PaymentAction).reason}
              </ThemedText>
            </View>
          </View>
        ) : selectedPayment ? (
          // PaymentStream detail
          <View style={s.sheetContent}>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatCurrency((selectedPayment as PaymentStream).amount)}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Status</ThemedText>
              <StatusBadge
                label={STREAM_STATUS_LABELS[(selectedPayment as PaymentStream).status].toUpperCase()}
                color={STREAM_STATUS_COLORS[(selectedPayment as PaymentStream).status]}
              />
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Category</ThemedText>
              <StatusBadge
                label={STREAM_CATEGORY_LABELS[(selectedPayment as PaymentStream).category].toUpperCase()}
                color={STREAM_CATEGORY_COLORS[(selectedPayment as PaymentStream).category]}
              />
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Method</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {METHOD_LABELS[(selectedPayment as PaymentStream).method]}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Cadence</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {(selectedPayment as PaymentStream).cadence}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Recipient</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {(selectedPayment as PaymentStream).recipient}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Last Payment</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatDate((selectedPayment as PaymentStream).lastPayment)}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Next Payment</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatDate((selectedPayment as PaymentStream).nextPayment)}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </BottomSheet>

      {/* ===== Bottom Sheet: Approval Detail ===== */}
      <BottomSheet
        visible={approvalSheetVisible}
        onClose={() => setApprovalSheetVisible(false)}
        title={selectedApproval?.title ?? 'Approval Detail'}
        useModal
      >
        {selectedApproval && (
          <View style={s.sheetContent}>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatCurrency(selectedApproval.amount)}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Status</ThemedText>
              <StatusBadge
                label={APPROVAL_STATUS_LABELS[selectedApproval.status].toUpperCase()}
                color={APPROVAL_STATUS_COLORS[selectedApproval.status]}
              />
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Priority</ThemedText>
              <StatusBadge
                label={PRIORITY_LABELS[selectedApproval.priority].toUpperCase()}
                color={PRIORITY_COLORS[selectedApproval.priority]}
              />
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Category</ThemedText>
              <StatusBadge
                label={STREAM_CATEGORY_LABELS[selectedApproval.category].toUpperCase()}
                color={STREAM_CATEGORY_COLORS[selectedApproval.category]}
              />
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Requested By</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {selectedApproval.requestedBy}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Request Date</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatDate(selectedApproval.requestDate)}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatDate(selectedApproval.dueDate)}
              </ThemedText>
            </View>
            {selectedApproval.notes ? (
              <View style={s.sheetSection}>
                <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Notes</ThemedText>
                <ThemedText style={[s.sheetDesc, { color: colors.text }]}>
                  {selectedApproval.notes}
                </ThemedText>
              </View>
            ) : null}
          </View>
        )}
      </BottomSheet>

      {/* ===== Bottom Sheet: Exception Detail ===== */}
      <BottomSheet
        visible={exceptionSheetVisible}
        onClose={() => setExceptionSheetVisible(false)}
        title={selectedException?.title ?? 'Exception Detail'}
        useModal
      >
        {selectedException && (
          <View style={s.sheetContent}>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Amount Blocked</ThemedText>
              <ThemedText style={[s.sheetValue, { color: '#EF4444' }]}>
                {formatCurrency(selectedException.amount)}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Type</ThemedText>
              <StatusBadge
                label={EXCEPTION_TYPE_LABELS[selectedException.type].toUpperCase()}
                color={EXCEPTION_TYPE_COLORS[selectedException.type]}
              />
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Blocked Since</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {formatDate(selectedException.blockedSince)}
              </ThemedText>
            </View>
            <View style={[s.sheetRow, { borderColor: colors.border }]}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Assignee</ThemedText>
              <ThemedText style={[s.sheetValue, { color: colors.text }]}>
                {selectedException.assignee}
              </ThemedText>
            </View>
            <View style={s.sheetSection}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Reason</ThemedText>
              <ThemedText style={[s.sheetDesc, { color: colors.text }]}>
                {selectedException.reason}
              </ThemedText>
            </View>
            <View style={s.sheetSection}>
              <ThemedText style={[s.sheetLabel, { color: colors.textSecondary }]}>Resolution</ThemedText>
              <ThemedText style={[s.sheetDesc, { color: colors.text }]}>
                {selectedException.resolution}
              </ThemedText>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },

  // Sub-tab bar
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Health strip
  healthStrip: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  healthSettlement: {
    fontSize: 11,
  },

  // Count badge
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // List content
  tabListContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
  tabScroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.sm,
  },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // List card
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  listCardBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  listCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  // Action dot
  actionTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 6,
  },

  // Amount
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Meta
  metaText: {
    fontSize: 12,
  },
  reasonText: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  refText: {
    fontSize: 11,
    marginTop: 6,
    fontFamily: 'monospace',
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Audit header
  auditHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: Spacing.md,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
  },

  // Locked
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  lockedDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Overview drill-mode
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

  // Overview KPI
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cardDetailValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardDetailLabel: {
    fontSize: 12,
    marginTop: 4,
  },

  // Bottom sheet
  sheetContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetSection: {
    paddingVertical: Spacing.sm,
  },
  sheetDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
