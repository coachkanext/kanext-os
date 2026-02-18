/**
 * Organization Payment Rails Tab — 14-tab Payment Rails Hub.
 * Overview, Accounts, Collect, Payouts, Transfers, Settlement,
 * Refunds, Reconciliation, Disputes, Tax/Forms, Exports,
 * Controls, Audit, Settings.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { Mode } from '@/types';
import {
  PAYRAILS_TABS,
  PAYRAILS_SCOPE_CHIPS,
  getPayRailsData,
  formatCurrency,
  PAYRAILS_STATUS_COLOR,
  SETTLEMENT_STATUS_COLOR,
  DISPUTE_STATUS_COLOR,
  RECON_STATUS_COLOR,
} from '@/data/mock-payment-rails-v2';
import type {
  PayRailsTabId,
  PayRailsOverviewBlock,
  PayRailsAccount,
  PayRailsCharge,
  PayRailsPayout,
  PayRailsTransfer,
  PayRailsSettlement,
  PayRailsRefund,
  PayRailsReconciliation,
  PayRailsDispute,
  PayRailsTaxForm,
  PayRailsExport,
  PayRailsControl,
  PayRailsAuditEntry,
  PayRailsStatus,
  PayRailsSortOption,
  PayRailsSettingToggle,
} from '@/data/mock-payment-rails-v2';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// SUB-COMPONENTS — Badges
// =============================================================================

function PayRailsStatusBadge({ status }: { status: PayRailsStatus }) {
  const fg = PAYRAILS_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function SettlementStatusBadge({ status }: { status: PayRailsSettlement['status'] }) {
  const fg = SETTLEMENT_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function DisputeStatusBadge({ status }: { status: PayRailsDispute['status'] }) {
  const fg = DISPUTE_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status.replace('-', ' ')}</ThemedText>
    </View>
  );
}

function ReconStatusBadge({ status }: { status: PayRailsReconciliation['status'] }) {
  const fg = RECON_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function EmptyState({ icon, text, colors: c }: { icon: string; text: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyState}>
      <IconSymbol name={icon as any} size={40} color={c.textTertiary} />
      <ThemedText style={[s.emptyText, { color: c.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

// =============================================================================
// MODE LABEL
// =============================================================================

const MODE_LABELS: Record<Mode, string> = {
  sports: 'Sports',
  business: 'Business',
  church: 'Church',
  education: 'Education',
  competition: 'Competition',
};

// =============================================================================
// ACCOUNT STATUS COLORS
// =============================================================================

const ACCOUNT_STATUS_COLOR: Record<PayRailsAccount['status'], string> = {
  active: '#22C55E',
  frozen: '#EF4444',
  'pending-verification': '#F59E0B',
};

// =============================================================================
// TAX FORM STATUS COLORS
// =============================================================================

const TAX_FORM_STATUS_COLOR: Record<PayRailsTaxForm['status'], string> = {
  draft: '#9CA3AF',
  ready: '#3B82F6',
  filed: '#22C55E',
  corrected: '#F59E0B',
};

// =============================================================================
// DISPUTE TYPE COLORS
// =============================================================================

const DISPUTE_TYPE_COLOR: Record<PayRailsDispute['type'], string> = {
  chargeback: '#F59E0B',
  inquiry: '#3B82F6',
  'failed-payout': '#EF4444',
};

// =============================================================================
// EXPORT FORMAT COLORS
// =============================================================================

const EXPORT_FORMAT_COLOR: Record<PayRailsExport['format'], string> = {
  PDF: '#3B82F6',
  CSV: '#22C55E',
  XLSX: '#F59E0B',
};

// =============================================================================
// AUDIT ICON MAP
// =============================================================================

function auditIcon(action: string): string {
  switch (action) {
    case 'charge_received': return 'arrow.down.circle.fill';
    case 'payout_initiated': return 'arrow.up.circle.fill';
    case 'settlement_closed': return 'checkmark.seal.fill';
    case 'refund_processed': return 'arrow.uturn.backward.circle.fill';
    case 'control_updated': return 'gearshape.fill';
    case 'account_created': return 'plus.circle.fill';
    case 'transfer_completed': return 'arrow.left.arrow.right.circle.fill';
    case 'dispute_opened': return 'exclamationmark.triangle.fill';
    default: return 'clock.fill';
  }
}

function auditColor(action: string): string {
  switch (action) {
    case 'charge_received': return '#22C55E';
    case 'payout_initiated': return '#EF4444';
    case 'settlement_closed': return '#6366F1';
    case 'refund_processed': return '#F59E0B';
    case 'control_updated': return '#8F8F8F';
    case 'account_created': return '#3B82F6';
    case 'transfer_completed': return '#6AA9FF';
    case 'dispute_opened': return '#F97316';
    default: return '#8F8F8F';
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OrgPaymentRailsTab({ mode, colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<PayRailsTabId>('overview');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter state
  const [filterSort, setFilterSort] = useState<PayRailsSortOption>('recent');
  const [filterStatuses, setFilterStatuses] = useState<PayRailsStatus[]>([]);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);

  // Settings toggles (local visual state)
  const [settingToggles, setSettingToggles] = useState<Record<string, boolean>>({});

  // === Data ===
  const data = useMemo(() => getPayRailsData(mode), [mode]);
  const scopeChips = PAYRAILS_SCOPE_CHIPS[mode];

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: PayRailsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleFilterToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterVisible(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterSort('recent');
    setFilterStatuses([]);
    setFilterTypes([]);
  }, []);

  const toggleFilterStatus = useCallback((st: PayRailsStatus) => {
    setFilterStatuses((prev) =>
      prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st],
    );
  }, []);

  const toggleFilterType = useCallback((t: string) => {
    setFilterTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }, []);

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'accounts':
        return renderAccounts();
      case 'collect':
        return renderCollect();
      case 'payouts':
        return renderPayouts();
      case 'transfers':
        return renderTransfers();
      case 'settlement':
        return renderSettlement();
      case 'refunds':
        return renderRefunds();
      case 'reconciliation':
        return renderReconciliation();
      case 'disputes':
        return renderDisputes();
      case 'tax-forms':
        return renderTaxForms();
      case 'exports':
        return renderExports();
      case 'controls':
        return renderControls();
      case 'audit':
        return renderAudit();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  // === Tab 1: Overview ===
  const renderOverview = () => (
    <View style={s.tabContent}>
      <View style={s.overviewGrid}>
        {data.overview.map((block: PayRailsOverviewBlock) => (
          <View
            key={block.id}
            style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <ThemedText style={[s.overviewLabel, { color: colors.textTertiary }]}>{block.label}</ThemedText>
            <ThemedText style={[s.overviewValue, { color: colors.text }]}>{block.value}</ThemedText>
            {block.trend != null && (
              <View style={s.overviewTrendRow}>
                <IconSymbol
                  name={block.trendUp ? 'arrow.up.right' : 'arrow.down.right' as any}
                  size={12}
                  color={block.trendUp ? '#22C55E' : '#EF4444'}
                />
                <ThemedText
                  style={[
                    s.overviewTrendText,
                    { color: block.trendUp ? '#22C55E' : '#EF4444' },
                  ]}
                >
                  {block.trend}
                </ThemedText>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  // === Tab 2: Accounts ===
  const renderAccounts = () => (
    <FlatList<PayRailsAccount>
      data={data.accounts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="building.columns" text="No accounts" colors={colors} />}
      renderItem={({ item }) => {
        const statusColor = ACCOUNT_STATUS_COLOR[item.status];
        const isPrimary = item.type === 'primary';
        return (
          <View
            style={[
              s.listCard,
              { backgroundColor: colors.card, borderColor: isPrimary ? accentColor + '40' : colors.border },
            ]}
          >
            <View style={s.listCardInfo}>
              <View style={s.accountTopRow}>
                <ThemedText style={s.listCardTitle}>{item.name}</ThemedText>
                <View
                  style={[
                    s.badge,
                    { backgroundColor: isPrimary ? '#22C55E20' : '#3B82F620' },
                  ]}
                >
                  <ThemedText
                    style={[
                      s.badgeText,
                      { color: isPrimary ? '#22C55E' : '#3B82F6' },
                    ]}
                  >
                    {item.type}
                  </ThemedText>
                </View>
              </View>
              <View style={s.accountScopeRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.scope}</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.accountBalance, { color: colors.text }]}>
                {formatCurrency(item.balance)}
              </ThemedText>
              <View style={s.accountBottomRow}>
                <View style={s.accountStatusRow}>
                  <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                  <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                    {item.status.replace('-', ' ')}
                  </ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  {item.lastActivity}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 3: Collect (Charges) ===
  const renderCollect = () => (
    <FlatList<PayRailsCharge>
      data={data.charges}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="arrow.down.circle" text="No charges" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.payerInitials}</ThemedText>
            </View>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle} numberOfLines={1}>{item.description}</ThemedText>
              <View style={s.chargeAmountRow}>
                <ThemedText style={s.chargeAmount}>
                  {formatCurrency(item.amount)}
                </ThemedText>
                <ThemedText style={[s.chargeFee, { color: colors.textTertiary }]}>
                  fee: {formatCurrency(item.fee)}
                </ThemedText>
              </View>
              <View style={s.chargeMetaRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.product}</ThemedText>
                </View>
                <PayRailsStatusBadge status={item.status} />
              </View>
              <View style={s.chargeBottomRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.date}</ThemedText>
                {item.receiptRef != null && (
                  <View style={s.receiptRow}>
                    <IconSymbol name="paperclip" size={12} color={colors.textTertiary} />
                    <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.receiptRef}</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 4: Payouts ===
  const renderPayouts = () => (
    <FlatList<PayRailsPayout>
      data={data.payouts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="arrow.up.circle" text="No payouts" colors={colors} />}
      renderItem={({ item }) => {
        const isOverdue = item.status === 'pending' && new Date(item.dueDate) < new Date();
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.recipientInitials}</ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={s.listCardTitle} numberOfLines={1}>{item.description}</ThemedText>
                <ThemedText style={s.payoutAmount}>
                  {formatCurrency(item.amount)}
                </ThemedText>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.purpose}
                </ThemedText>
                <View style={s.payoutMetaRow}>
                  <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                    <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.category}</ThemedText>
                  </View>
                  <PayRailsStatusBadge status={item.status} />
                </View>
                <View style={s.payoutBottomRow}>
                  <ThemedText
                    style={[
                      s.listCardSub,
                      { color: isOverdue ? '#EF4444' : colors.textTertiary },
                    ]}
                  >
                    Due: {item.dueDate}{isOverdue ? ' (OVERDUE)' : ''}
                  </ThemedText>
                  {item.evidence != null && (
                    <IconSymbol name="paperclip" size={12} color={colors.textTertiary} />
                  )}
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 5: Transfers ===
  const renderTransfers = () => (
    <FlatList<PayRailsTransfer>
      data={data.transfers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="arrow.left.arrow.right" text="No transfers" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <View style={s.transferAccountRow}>
              <ThemedText style={[s.transferAccount, { color: colors.text }]}>{item.fromAccount}</ThemedText>
              <IconSymbol name="arrow.right" size={14} color={colors.textTertiary} />
              <ThemedText style={[s.transferAccount, { color: colors.text }]}>{item.toAccount}</ThemedText>
            </View>
            <ThemedText style={s.transferAmount}>
              {formatCurrency(item.amount)}
            </ThemedText>
            <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </ThemedText>
            <View style={s.transferBottomRow}>
              <PayRailsStatusBadge status={item.status} />
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.date}</ThemedText>
            </View>
            <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
              {item.initiator}
            </ThemedText>
          </View>
        </View>
      )}
    />
  );

  // === Tab 6: Settlement ===
  const renderSettlement = () => (
    <FlatList<PayRailsSettlement>
      data={data.settlements}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="checkmark.seal" text="No settlements" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <View style={s.settlementTopRow}>
              <ThemedText style={s.settlementTitle}>{item.title}</ThemedText>
              <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.type}</ThemedText>
              </View>
            </View>
            <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.period}</ThemedText>
            <View style={s.settlementBreakdown}>
              <View style={s.settlementBreakdownRow}>
                <ThemedText style={[s.settlementLabel, { color: colors.textSecondary }]}>Gross</ThemedText>
                <ThemedText style={[s.settlementValue, { color: colors.text }]}>
                  {formatCurrency(item.grossAmount)}
                </ThemedText>
              </View>
              <View style={s.settlementBreakdownRow}>
                <ThemedText style={[s.settlementLabel, { color: colors.textSecondary }]}>Fees</ThemedText>
                <ThemedText style={[s.settlementValue, { color: '#EF4444' }]}>
                  -{formatCurrency(item.fees)}
                </ThemedText>
              </View>
              <View style={s.settlementBreakdownRow}>
                <ThemedText style={[s.settlementLabel, { color: colors.textSecondary }]}>Net</ThemedText>
                <ThemedText style={s.settlementNet}>
                  {formatCurrency(item.netAmount)}
                </ThemedText>
              </View>
            </View>
            <View style={s.settlementBottomRow}>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.itemCount} items
              </ThemedText>
              <SettlementStatusBadge status={item.status} />
            </View>
            {item.settledDate != null && (
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Settled: {item.settledDate}
              </ThemedText>
            )}
          </View>
        </View>
      )}
    />
  );

  // === Tab 7: Refunds ===
  const renderRefunds = () => (
    <FlatList<PayRailsRefund>
      data={data.refunds}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="arrow.uturn.backward.circle" text="No refunds" colors={colors} />}
      renderItem={({ item }) => {
        const typeColor = item.type === 'full' ? '#EF4444' : '#F59E0B';
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle} numberOfLines={1}>{item.originalDescription}</ThemedText>
              <ThemedText style={s.refundAmount}>
                -{formatCurrency(item.amount)}
              </ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.reason}
              </ThemedText>
              <View style={s.refundMetaRow}>
                <View style={[s.badge, { backgroundColor: typeColor + '20' }]}>
                  <ThemedText style={[s.badgeText, { color: typeColor }]}>{item.type}</ThemedText>
                </View>
                <PayRailsStatusBadge status={item.status} />
              </View>
              <View style={s.refundBottomRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Requested: {item.requestedDate}
                </ThemedText>
                {item.processedDate != null && (
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    Processed: {item.processedDate}
                  </ThemedText>
                )}
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                By: {item.requestedBy}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 8: Reconciliation ===
  const renderReconciliation = () => (
    <FlatList<PayRailsReconciliation>
      data={data.reconciliations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="checkmark.circle" text="No reconciliation records" colors={colors} />}
      renderItem={({ item }) => {
        const varianceColor = item.variance < 0 ? '#EF4444' : '#22C55E';
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <ThemedText style={s.reconPeriod}>{item.period}</ThemedText>
              <View style={s.reconBreakdown}>
                <View style={s.reconBreakdownRow}>
                  <ThemedText style={[s.reconLabel, { color: colors.textSecondary }]}>Expected</ThemedText>
                  <ThemedText style={[s.reconValue, { color: colors.text }]}>
                    {formatCurrency(item.expectedAmount)}
                  </ThemedText>
                </View>
                <View style={s.reconBreakdownRow}>
                  <ThemedText style={[s.reconLabel, { color: colors.textSecondary }]}>Actual</ThemedText>
                  <ThemedText style={[s.reconValue, { color: colors.text }]}>
                    {formatCurrency(item.actualAmount)}
                  </ThemedText>
                </View>
                <View style={s.reconBreakdownRow}>
                  <ThemedText style={[s.reconLabel, { color: colors.textSecondary }]}>Variance</ThemedText>
                  <ThemedText style={[s.reconValue, { color: varianceColor }]}>
                    {item.variance === 0 ? '$0.00' : formatCurrency(item.variance)}
                  </ThemedText>
                </View>
              </View>
              <View style={s.reconCountRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  Matched: {item.itemsMatched}
                </ThemedText>
                <ThemedText style={[s.listCardSub, { color: item.itemsUnmatched > 0 ? '#EF4444' : colors.textSecondary }]}>
                  Unmatched: {item.itemsUnmatched}
                </ThemedText>
              </View>
              <View style={s.reconBottomRow}>
                <ReconStatusBadge status={item.status} />
                {item.reconciledDate != null && (
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    {item.reconciledDate}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 9: Disputes ===
  const renderDisputes = () => (
    <FlatList<PayRailsDispute>
      data={data.disputes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="exclamationmark.triangle" text="No disputes" colors={colors} />}
      renderItem={({ item }) => {
        const typeColor = DISPUTE_TYPE_COLOR[item.type];
        const respondBySoon = item.respondBy != null && new Date(item.respondBy).getTime() - Date.now() < 7 * 86400000;
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle} numberOfLines={1}>{item.chargeDescription}</ThemedText>
              <ThemedText style={s.disputeAmount}>
                {formatCurrency(item.amount)}
              </ThemedText>
              <View style={s.disputeMetaRow}>
                <View style={[s.badge, { backgroundColor: typeColor + '20' }]}>
                  <ThemedText style={[s.badgeText, { color: typeColor }]}>{item.type.replace('-', ' ')}</ThemedText>
                </View>
                <DisputeStatusBadge status={item.status} />
              </View>
              <View style={s.disputeDateRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Filed: {item.filedDate}
                </ThemedText>
                {item.respondBy != null && (
                  <ThemedText
                    style={[
                      s.listCardSub,
                      { color: respondBySoon ? '#EF4444' : colors.textTertiary },
                    ]}
                  >
                    Respond by: {item.respondBy}
                  </ThemedText>
                )}
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.disputant}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 10: Tax / Forms ===
  const renderTaxForms = () => (
    <FlatList<PayRailsTaxForm>
      data={data.taxForms}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="doc.text" text="No tax forms" colors={colors} />}
      renderItem={({ item }) => {
        const statusColor = TAX_FORM_STATUS_COLOR[item.status];
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.recipientInitials}</ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={s.listCardTitle}>{item.recipientName}</ThemedText>
                <View style={s.taxMetaRow}>
                  <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                    <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.formType}</ThemedText>
                  </View>
                  <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.year}</ThemedText>
                </View>
                <ThemedText style={s.taxAmount}>
                  {formatCurrency(item.totalAmount)}
                </ThemedText>
                <View style={s.taxBottomRow}>
                  <View style={[s.badge, { backgroundColor: statusColor + '20' }]}>
                    <ThemedText style={[s.badgeText, { color: statusColor }]}>{item.status}</ThemedText>
                  </View>
                  <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                    Due: {item.dueDate}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 11: Exports ===
  const renderExports = () => (
    <FlatList<PayRailsExport>
      data={data.exports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="square.and.arrow.up" text="No exports" colors={colors} />}
      renderItem={({ item }) => {
        const formatColor = EXPORT_FORMAT_COLOR[item.format];
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <View style={s.exportMetaRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.type}</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.period}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                Generated: {item.generatedAt}
              </ThemedText>
              <View style={s.exportBottomRow}>
                <View style={[s.badge, { backgroundColor: formatColor + '20' }]}>
                  <ThemedText style={[s.badgeText, { color: formatColor }]}>{item.format}</ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.size}</ThemedText>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 12: Controls ===
  const renderControls = () => (
    <FlatList<PayRailsControl>
      data={data.controls}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="slider.horizontal.3" text="No controls configured" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.controlRow}>
            <View style={s.controlInfo}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <View style={s.controlMetaRow}>
                {item.threshold != null && (
                  <ThemedText style={[s.controlThreshold, { color: colors.textTertiary }]}>
                    {formatCurrency(item.threshold)}
                  </ThemedText>
                )}
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.scope}</ThemedText>
                </View>
              </View>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
              thumbColor={item.enabled ? accentColor : colors.textTertiary}
            />
          </View>
        </View>
      )}
    />
  );

  // === Tab 13: Audit ===
  const renderAudit = () => (
    <FlatList<PayRailsAuditEntry>
      data={data.audit}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="clock.fill" text="No audit entries" colors={colors} />}
      renderItem={({ item }) => {
        const aColor = auditColor(item.action);
        const aIcon = auditIcon(item.action);
        return (
          <View style={s.auditRow}>
            <View style={[s.auditIconCircle, { backgroundColor: aColor + '20' }]}>
              <IconSymbol name={aIcon as any} size={14} color={aColor} />
            </View>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.actorInitials}</ThemedText>
            </View>
            <View style={s.auditInfo}>
              <ThemedText style={s.auditAction}>{item.action.replace(/_/g, ' ')}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.target}
              </ThemedText>
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {item.actor} · {item.timestamp}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 14: Settings ===
  const renderSettings = () => (
    <View style={s.tabContent}>
      <ThemedText style={[s.settingsHeader, { color: colors.textSecondary }]}>
        {MODE_LABELS[mode]} Payment Rails Settings
      </ThemedText>
      <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.settings.map((setting: PayRailsSettingToggle, index: number) => {
          const toggled = settingToggles[setting.id] ?? setting.enabled;
          return (
            <React.Fragment key={setting.id}>
              {index > 0 && (
                <View style={[s.settingsDivider, { backgroundColor: colors.divider }]} />
              )}
              <View style={s.settingsRow}>
                <View style={s.settingsLabelGroup}>
                  <ThemedText style={s.settingsLabel}>{setting.label}</ThemedText>
                  <ThemedText style={[s.settingsDesc, { color: colors.textTertiary }]}>
                    {setting.description}
                  </ThemedText>
                </View>
                <Switch
                  value={toggled}
                  onValueChange={(val) =>
                    setSettingToggles((prev) => ({ ...prev, [setting.id]: val }))
                  }
                  trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
                  thumbColor={toggled ? accentColor : colors.textTertiary}
                />
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );

  // ===================================================================
  // RENDER — MAIN
  // ===================================================================

  return (
    <View style={s.container}>
      {/* === Header === */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <ThemedText style={s.headerTitle}>Payment Rails</ThemedText>
          <Pressable
            style={({ pressed }) => [s.filterBtn, pressed && { opacity: 0.7 }]}
            onPress={handleFilterToggle}
          >
            <IconSymbol name="slider.horizontal.3" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Scope chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.scopeBar}
        >
          {scopeChips.map((chip, i) => (
            <Pressable
              key={chip.key}
              style={[
                s.scopeChip,
                i === activeScope
                  ? { backgroundColor: accentColor }
                  : { backgroundColor: colors.backgroundTertiary },
              ]}
              onPress={() => handleScopePress(i)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: i === activeScope ? '#000' : colors.textSecondary },
                ]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search bar */}
        <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search payments..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* === Tab Nav === */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabBar}
        style={s.tabBarContainer}
      >
        {PAYRAILS_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              s.tabPill,
              activeTab === tab.id
                ? { backgroundColor: accentColor }
                : { backgroundColor: colors.backgroundTertiary },
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <ThemedText
              style={[
                s.tabPillText,
                { color: activeTab === tab.id ? '#000' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* === Tab Content === */}
      <View style={s.contentArea}>
        {renderTabContent()}
      </View>

      {/* === Filter Bottom Sheet === */}
      <BottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title="Filter Payment Rails"
        useModal
      >
        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Type</ThemedText>
          <View style={s.filterChipsWrap}>
            {(['charge', 'payout', 'transfer', 'settlement', 'refund']).map((t) => {
              const selected = filterTypes.includes(t);
              return (
                <Pressable
                  key={t}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: selected ? accentColor + '20' : colors.backgroundTertiary,
                      borderColor: selected ? accentColor + '40' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleFilterType(t)}
                >
                  <ThemedText
                    style={[s.filterChipText, { color: selected ? accentColor : colors.textSecondary }]}
                  >
                    {t}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Status</ThemedText>
          <View style={s.filterChipsWrap}>
            {(['pending', 'succeeded', 'failed', 'disputed', 'reconciled'] as PayRailsStatus[]).map((st) => {
              const fg = PAYRAILS_STATUS_COLOR[st];
              const selected = filterStatuses.includes(st);
              return (
                <Pressable
                  key={st}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: selected ? fg + '20' : colors.backgroundTertiary,
                      borderColor: selected ? fg + '40' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleFilterStatus(st)}
                >
                  <View style={[s.filterDot, { backgroundColor: fg }]} />
                  <ThemedText
                    style={[s.filterChipText, { color: selected ? fg : colors.textSecondary }]}
                  >
                    {st}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Sort</ThemedText>
          {([
            { key: 'recent' as PayRailsSortOption, label: 'Recent' },
            { key: 'largest' as PayRailsSortOption, label: 'Largest amount' },
            { key: 'due-soon' as PayRailsSortOption, label: 'Due soon' },
          ]).map((opt) => (
            <Pressable
              key={opt.key}
              style={s.filterRadioRow}
              onPress={() => setFilterSort(opt.key)}
            >
              <View
                style={[
                  s.radioOuter,
                  { borderColor: filterSort === opt.key ? accentColor : colors.textTertiary },
                ]}
              >
                {filterSort === opt.key && (
                  <View style={[s.radioInner, { backgroundColor: accentColor }]} />
                )}
              </View>
              <ThemedText style={s.filterRadioLabel}>{opt.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={s.filterFooter}>
          <Pressable
            style={({ pressed }) => [s.filterClearBtn, pressed && { opacity: 0.7 }]}
            onPress={handleClearFilters}
          >
            <ThemedText style={[s.filterClearText, { color: colors.textSecondary }]}>Clear</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              s.filterApplyBtn,
              { backgroundColor: accentColor },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setFilterVisible(false)}
          >
            <ThemedText style={s.filterApplyText}>Apply</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // === Layout ===
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },

  // === Scope Chips ===
  scopeBar: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Search ===
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 36,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // === Tab Bar ===
  tabBarContainer: {
    flexGrow: 0,
    marginTop: Spacing.sm,
  },
  tabBar: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Content Area ===
  contentArea: {
    flex: 1,
    marginTop: Spacing.sm,
  },
  tabContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // === Overview ===
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  overviewCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  overviewTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  overviewTrendText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // === List Cards ===
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  listCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  listCardInfo: {
    flex: 1,
    gap: 4,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  listCardSub: {
    fontSize: 12,
  },

  // === Avatar ===
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // === Badges ===
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // === Status Dot ===
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },

  // === Accounts ===
  accountTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  accountScopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  accountBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  accountStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // === Charges (Collect) ===
  chargeAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: '#22C55E',
  },
  chargeFee: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  chargeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chargeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  // === Payouts ===
  payoutAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: '#EF4444',
  },
  payoutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  payoutBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Transfers ===
  transferAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  transferAccount: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  transferAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  transferBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Settlement ===
  settlementTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  settlementTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  settlementBreakdown: {
    gap: 2,
    marginTop: 4,
  },
  settlementBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementLabel: {
    fontSize: 12,
  },
  settlementValue: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  settlementNet: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  settlementBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  // === Refunds ===
  refundAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: '#EF4444',
  },
  refundMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  refundBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Reconciliation ===
  reconPeriod: {
    fontSize: 14,
    fontWeight: '600',
  },
  reconBreakdown: {
    gap: 2,
    marginTop: 4,
  },
  reconBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reconLabel: {
    fontSize: 12,
  },
  reconValue: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  reconCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 4,
  },
  reconBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  // === Disputes ===
  disputeAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  disputeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  disputeDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Tax / Forms ===
  taxMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  taxAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  taxBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Exports ===
  exportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exportBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },

  // === Controls ===
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlInfo: {
    flex: 1,
    gap: 4,
  },
  controlMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  controlThreshold: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },

  // === Audit ===
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  auditIconCircle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  auditInfo: {
    flex: 1,
    gap: 2,
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  auditMeta: {
    fontSize: 11,
  },

  // === Settings ===
  settingsHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingsLabelGroup: {
    flex: 1,
    marginRight: Spacing.sm,
    gap: 2,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsDesc: {
    fontSize: 11,
  },
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // === Empty State ===
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 240,
  },

  // === Filter Sheet ===
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  filterRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  filterRadioLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  filterClearBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  filterClearText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterApplyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  filterApplyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
});
