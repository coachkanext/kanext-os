/**
 * Competition Organization Payment Rails Tab — 10-tab Payment Rails Hub.
 * Dashboard, Accounts, Transactions, Payouts, Invoices, Fees, Reconciliation, Disputes, Reports, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  COMP_RAILS_TABS,
  COMP_RAILS_SCOPE_CHIPS,
  ACCOUNT_STATUS_COLOR,
  TRANSACTION_STATUS_COLOR,
  PAYOUT_STATUS_COLOR,
  INVOICE_STATUS_COLOR,
  DISPUTE_STATUS_COLOR,
  REPORT_FORMAT_COLOR,
  formatCurrency,
  getCompRailsData,
} from '@/data/mock-comp-org-payment-rails';
import type {
  CompRailsTabId,
  RailsDashboardBlock,
  PaymentAccount,
  Transaction,
  PayoutBatch,
  Invoice,
  FeeSchedule,
  ReconciliationEntry,
  Dispute,
  RailsReport,
  RailsSettingToggle,
} from '@/data/mock-comp-org-payment-rails';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function accountTypeLabel(type: PaymentAccount['type']): string {
  switch (type) {
    case 'operating': return 'OPERATING';
    case 'escrow': return 'ESCROW';
    case 'prize-fund': return 'PRIZE FUND';
    case 'sponsor-holding': return 'SPONSOR HOLD';
    case 'petty-cash': return 'PETTY CASH';
  }
}

function accountTypeColor(type: PaymentAccount['type']): string {
  switch (type) {
    case 'operating': return '#3B82F6';
    case 'escrow': return '#8B5CF6';
    case 'prize-fund': return '#F59E0B';
    case 'sponsor-holding': return '#06B6D4';
    case 'petty-cash': return '#22C55E';
  }
}

function payoutTypeLabel(type: PayoutBatch['type']): string {
  switch (type) {
    case 'prize': return 'PRIZE';
    case 'official': return 'OFFICIAL';
    case 'vendor': return 'VENDOR';
    case 'refund': return 'REFUND';
  }
}

function payoutTypeColor(type: PayoutBatch['type']): string {
  switch (type) {
    case 'prize': return '#F59E0B';
    case 'official': return '#3B82F6';
    case 'vendor': return '#8B5CF6';
    case 'refund': return '#EF4444';
  }
}

function feeTypeLabel(type: FeeSchedule['type']): string {
  switch (type) {
    case 'entry-fee': return 'ENTRY FEE';
    case 'registration': return 'REGISTRATION';
    case 'licensing': return 'LICENSING';
    case 'facility': return 'FACILITY';
    case 'broadcast': return 'BROADCAST';
  }
}

function feeTypeColor(type: FeeSchedule['type']): string {
  switch (type) {
    case 'entry-fee': return '#22C55E';
    case 'registration': return '#3B82F6';
    case 'licensing': return '#8B5CF6';
    case 'facility': return '#F59E0B';
    case 'broadcast': return '#06B6D4';
  }
}

function frequencyLabel(freq: FeeSchedule['frequency']): string {
  switch (freq) {
    case 'per-event': return 'Per Event';
    case 'per-season': return 'Per Season';
    case 'annual': return 'Annual';
    case 'one-time': return 'One-Time';
  }
}

function reconciliationStatusColor(status: ReconciliationEntry['status']): string {
  switch (status) {
    case 'matched': return '#22C55E';
    case 'variance': return '#EF4444';
    case 'pending': return '#F59E0B';
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
  data: ReturnType<typeof getCompRailsData>;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Financial Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: RailsDashboardBlock) => (
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
            <ThemedText
              style={[
                s.kpiDelta,
                { color: block.delta.startsWith('+') ? '#22C55E' : block.delta.startsWith('-') ? '#EF4444' : colors.textTertiary },
              ]}
            >
              {block.delta}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Recent Transactions Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Transactions
      </ThemedText>
      <View style={[s.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.transactions.slice(0, 5).map((txn, index) => {
          const isCredit = txn.type === 'credit';
          const stColor = TRANSACTION_STATUS_COLOR[txn.status];
          return (
            <View
              key={txn.id}
              style={[
                s.activityRow,
                index < 4 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.activityDot, { backgroundColor: isCredit ? '#22C55E' : '#EF4444' }]} />
              <View style={s.activityTextCol}>
                <ThemedText style={[s.activityText, { color: colors.text }]} numberOfLines={1}>
                  {txn.description}
                </ThemedText>
                <View style={s.activityMetaRow}>
                  <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>
                    {txn.date}
                  </ThemedText>
                  <StatusBadge label={txn.status.toUpperCase()} color={stColor} />
                </View>
              </View>
              <ThemedText
                style={[
                  s.activityAmount,
                  { color: isCredit ? '#22C55E' : '#EF4444' },
                ]}
              >
                {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Account Balances Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Account Balances
      </ThemedText>
      <View style={[s.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.accounts.map((account, index) => {
          const acctColor = accountTypeColor(account.type);
          const stColor = ACCOUNT_STATUS_COLOR[account.status];
          return (
            <View
              key={account.id}
              style={[
                s.activityRow,
                index < data.accounts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.accountDotSquare, { backgroundColor: acctColor + '20' }]}>
                <IconSymbol name="building.columns.fill" size={14} color={acctColor} />
              </View>
              <View style={s.activityTextCol}>
                <ThemedText style={[s.activityText, { color: colors.text }]} numberOfLines={1}>
                  {account.name}
                </ThemedText>
                <View style={s.activityMetaRow}>
                  <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>
                    ****{account.accountLast4} · {account.bank}
                  </ThemedText>
                </View>
              </View>
              <View style={s.accountBalanceCol}>
                <ThemedText style={[s.accountBalance, { color: colors.text }]}>
                  {formatCurrency(account.balance)}
                </ThemedText>
                <View style={[s.accountStatusDot, { backgroundColor: stColor }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Open Disputes Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Active Disputes
      </ThemedText>
      <View style={[s.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.disputes
          .filter((d) => d.status === 'open' || d.status === 'under-review' || d.status === 'escalated')
          .slice(0, 4)
          .map((dispute, index, arr) => {
            const stColor = DISPUTE_STATUS_COLOR[dispute.status];
            return (
              <View
                key={dispute.id}
                style={[
                  s.activityRow,
                  index < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={[s.activityDot, { backgroundColor: stColor }]} />
                <View style={s.activityTextCol}>
                  <ThemedText style={[s.activityText, { color: colors.text }]} numberOfLines={2}>
                    {dispute.reason}
                  </ThemedText>
                  <View style={s.activityMetaRow}>
                    <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>
                      {dispute.date} · {dispute.claimant}
                    </ThemedText>
                  </View>
                </View>
                <View style={s.disputeSummaryCol}>
                  <ThemedText style={[s.disputeSummaryAmount, { color: colors.text }]}>
                    {formatCurrency(dispute.amount)}
                  </ThemedText>
                  <StatusBadge label={dispute.status.toUpperCase().replace('-', ' ')} color={stColor} />
                </View>
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// ACCOUNTS TAB
// =============================================================================

function AccountsTab({
  colors,
  accentColor,
  data,
  onSelectAccount,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: PaymentAccount[];
  onSelectAccount: (account: PaymentAccount) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ACCOUNT_STATUS_COLOR[item.status];
        const typeColor = accountTypeColor(item.type);
        return (
          <Pressable
            style={[s.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectAccount(item);
            }}
          >
            {/* Top row: name + status */}
            <View style={s.accountCardTop}>
              <View style={s.accountCardInfo}>
                <View style={[s.accountIconCircle, { backgroundColor: typeColor + '18' }]}>
                  <IconSymbol name="building.columns.fill" size={20} color={typeColor} />
                </View>
                <View style={s.accountCardMid}>
                  <ThemedText style={[s.accountCardName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.accountCardBadgeRow}>
                    <StatusBadge label={accountTypeLabel(item.type)} color={typeColor} />
                    <StatusBadge label={item.status.toUpperCase().replace('-', ' ')} color={stColor} />
                  </View>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={[s.accountCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.accountDetailItem}>
                <ThemedText style={[s.accountDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.balance)}
                </ThemedText>
                <ThemedText style={[s.accountDetailLabel, { color: colors.textTertiary }]}>
                  Balance
                </ThemedText>
              </View>
              <View style={s.accountDetailItem}>
                <ThemedText style={[s.accountDetailValue, { color: colors.text }]}>
                  {item.currency}
                </ThemedText>
                <ThemedText style={[s.accountDetailLabel, { color: colors.textTertiary }]}>
                  Currency
                </ThemedText>
              </View>
              <View style={s.accountDetailItem}>
                <ThemedText style={[s.accountDetailValue, { color: colors.text }]}>
                  ****{item.accountLast4}
                </ThemedText>
                <ThemedText style={[s.accountDetailLabel, { color: colors.textTertiary }]}>
                  Account
                </ThemedText>
              </View>
            </View>

            {/* Footer: bank */}
            <View style={s.accountCardFooter}>
              <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.accountBankText, { color: colors.textSecondary }]}>
                {item.bank}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="building.columns.fill" label="No accounts found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// TRANSACTIONS TAB
// =============================================================================

function TransactionsTab({
  colors,
  accentColor,
  data,
  onSelectTransaction,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
}) {
  // Summary row
  const totalCredits = data.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = data.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={[s.txnSummaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.txnSummaryItem}>
            <ThemedText style={[s.txnSummaryLabel, { color: colors.textTertiary }]}>Credits</ThemedText>
            <ThemedText style={[s.txnSummaryValue, { color: '#22C55E' }]}>
              +{formatCurrency(totalCredits)}
            </ThemedText>
          </View>
          <View style={[s.txnSummaryDivider, { backgroundColor: colors.border }]} />
          <View style={s.txnSummaryItem}>
            <ThemedText style={[s.txnSummaryLabel, { color: colors.textTertiary }]}>Debits</ThemedText>
            <ThemedText style={[s.txnSummaryValue, { color: '#EF4444' }]}>
              -{formatCurrency(totalDebits)}
            </ThemedText>
          </View>
          <View style={[s.txnSummaryDivider, { backgroundColor: colors.border }]} />
          <View style={s.txnSummaryItem}>
            <ThemedText style={[s.txnSummaryLabel, { color: colors.textTertiary }]}>Net</ThemedText>
            <ThemedText
              style={[
                s.txnSummaryValue,
                { color: totalCredits - totalDebits >= 0 ? '#22C55E' : '#EF4444' },
              ]}
            >
              {totalCredits - totalDebits >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalCredits - totalDebits))}
            </ThemedText>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const isCredit = item.type === 'credit';
        const stColor = TRANSACTION_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.txnCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectTransaction(item);
            }}
          >
            <View style={s.txnCardTop}>
              <View style={[s.txnTypeIndicator, { backgroundColor: isCredit ? '#22C55E' : '#EF4444' }]} />
              <View style={s.txnCardInfo}>
                <ThemedText style={[s.txnDescription, { color: colors.text }]} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <View style={s.txnCardBadgeRow}>
                  <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>
              <ThemedText
                style={[
                  s.txnAmount,
                  { color: isCredit ? '#22C55E' : '#EF4444' },
                ]}
              >
                {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
              </ThemedText>
            </View>
            <View style={[s.txnCardBottom, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.txnDate, { color: colors.textTertiary }]}>
                {item.date}
              </ThemedText>
              <ThemedText style={[s.txnAccount, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.account}
              </ThemedText>
              <ThemedText style={[s.txnRef, { color: colors.textTertiary }]}>
                {item.reference}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="arrow.left.arrow.right" label="No transactions found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PAYOUTS TAB
// =============================================================================

function PayoutsTab({
  colors,
  accentColor,
  data,
  onSelectPayout,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: PayoutBatch[];
  onSelectPayout: (payout: PayoutBatch) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = PAYOUT_STATUS_COLOR[item.status];
        const typeColor = payoutTypeColor(item.type);
        return (
          <Pressable
            style={[s.payoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectPayout(item);
            }}
          >
            <View style={s.payoutCardTop}>
              <View style={s.payoutCardInfo}>
                <View style={[s.payoutIconCircle, { backgroundColor: typeColor + '18' }]}>
                  <IconSymbol name="arrow.up.circle.fill" size={20} color={typeColor} />
                </View>
                <View style={s.payoutCardMid}>
                  <ThemedText style={[s.payoutCardName, { color: colors.text }]} numberOfLines={2}>
                    {item.name}
                  </ThemedText>
                  <View style={s.payoutCardBadgeRow}>
                    <StatusBadge label={payoutTypeLabel(item.type)} color={typeColor} />
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                  </View>
                </View>
              </View>
            </View>

            <View style={[s.payoutCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.payoutDetailItem}>
                <ThemedText style={[s.payoutDetailValue, { color: colors.text }]}>
                  {formatCurrency(item.totalAmount)}
                </ThemedText>
                <ThemedText style={[s.payoutDetailLabel, { color: colors.textTertiary }]}>
                  Total
                </ThemedText>
              </View>
              <View style={s.payoutDetailItem}>
                <ThemedText style={[s.payoutDetailValue, { color: colors.text }]}>
                  {item.recipientCount}
                </ThemedText>
                <ThemedText style={[s.payoutDetailLabel, { color: colors.textTertiary }]}>
                  Recipients
                </ThemedText>
              </View>
              <View style={s.payoutDetailItem}>
                <ThemedText style={[s.payoutDetailValue, { color: colors.text }]}>
                  {item.date}
                </ThemedText>
                <ThemedText style={[s.payoutDetailLabel, { color: colors.textTertiary }]}>
                  Date
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="arrow.up.circle.fill" label="No payout batches found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INVOICES TAB
// =============================================================================

function InvoicesTab({
  colors,
  accentColor,
  data,
  onSelectInvoice,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
}) {
  // Summary metrics
  const totalPaid = data.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalOutstanding = data.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const overdueCount = data.filter((i) => i.status === 'overdue').length;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={[s.txnSummaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.txnSummaryItem}>
            <ThemedText style={[s.txnSummaryLabel, { color: colors.textTertiary }]}>Paid</ThemedText>
            <ThemedText style={[s.txnSummaryValue, { color: '#22C55E' }]}>
              {formatCurrency(totalPaid)}
            </ThemedText>
          </View>
          <View style={[s.txnSummaryDivider, { backgroundColor: colors.border }]} />
          <View style={s.txnSummaryItem}>
            <ThemedText style={[s.txnSummaryLabel, { color: colors.textTertiary }]}>Outstanding</ThemedText>
            <ThemedText style={[s.txnSummaryValue, { color: '#F59E0B' }]}>
              {formatCurrency(totalOutstanding)}
            </ThemedText>
          </View>
          <View style={[s.txnSummaryDivider, { backgroundColor: colors.border }]} />
          <View style={s.txnSummaryItem}>
            <ThemedText style={[s.txnSummaryLabel, { color: colors.textTertiary }]}>Overdue</ThemedText>
            <ThemedText style={[s.txnSummaryValue, { color: '#EF4444' }]}>
              {overdueCount}
            </ThemedText>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const stColor = INVOICE_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.invoiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectInvoice(item);
            }}
          >
            <View style={s.invoiceCardTop}>
              <View style={s.invoiceCardInfo}>
                <ThemedText style={[s.invoiceNumber, { color: accentColor }]}>
                  {item.number}
                </ThemedText>
                <ThemedText style={[s.invoiceRecipient, { color: colors.text }]} numberOfLines={1}>
                  {item.recipient}
                </ThemedText>
              </View>
              <View style={s.invoiceAmountCol}>
                <ThemedText style={[s.invoiceAmount, { color: colors.text }]}>
                  {formatCurrency(item.amount)}
                </ThemedText>
                <StatusBadge label={item.status.toUpperCase()} color={stColor} />
              </View>
            </View>

            {/* Items */}
            <View style={[s.invoiceItemsContainer, { borderTopColor: colors.border }]}>
              {item.items.map((lineItem, idx) => (
                <View key={idx} style={s.invoiceItemRow}>
                  <View style={[s.invoiceItemDot, { backgroundColor: accentColor }]} />
                  <ThemedText style={[s.invoiceItemText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {lineItem}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={s.invoiceCardFooter}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.invoiceDueDate, { color: colors.textTertiary }]}>
                Due {item.dueDate}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No invoices found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// FEES TAB
// =============================================================================

function FeesTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: FeeSchedule[];
}) {
  // Group by type
  const grouped = useMemo(() => {
    const types: FeeSchedule['type'][] = ['entry-fee', 'registration', 'licensing', 'facility', 'broadcast'];
    return types
      .map((type) => ({
        type,
        fees: data.filter((f) => f.type === type),
      }))
      .filter((g) => g.fees.length > 0);
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.type}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => {
        const typeColor = feeTypeColor(group.type);
        return (
          <View style={s.feeGroup}>
            <View style={s.feeGroupHeader}>
              <View style={[s.feeGroupDot, { backgroundColor: typeColor }]} />
              <ThemedText style={[s.feeGroupTitle, { color: colors.text }]}>
                {feeTypeLabel(group.type)}
              </ThemedText>
              <ThemedText style={[s.feeGroupCount, { color: colors.textTertiary }]}>
                {group.fees.length}
              </ThemedText>
            </View>
            {group.fees.map((fee) => (
              <View
                key={fee.id}
                style={[s.feeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.feeCardTop}>
                  <View style={s.feeCardInfo}>
                    <ThemedText style={[s.feeName, { color: colors.text }]} numberOfLines={2}>
                      {fee.name}
                    </ThemedText>
                    <ThemedText style={[s.feeApplies, { color: colors.textTertiary }]}>
                      {fee.appliesTo}
                    </ThemedText>
                  </View>
                  <View style={s.feeAmountCol}>
                    <ThemedText style={[s.feeAmount, { color: colors.text }]}>
                      {formatCurrency(fee.amount)}
                    </ThemedText>
                    <StatusBadge label={frequencyLabel(fee.frequency).toUpperCase()} color={typeColor} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="dollarsign.circle.fill" label="No fee schedules found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RECONCILIATION TAB
// =============================================================================

function ReconciliationTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReconciliationEntry[];
}) {
  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; entries: ReconciliationEntry[] }[] = [];
    let currentDate = '';
    data.forEach((entry) => {
      if (entry.date !== currentDate) {
        currentDate = entry.date;
        groups.push({ date: currentDate, entries: [entry] });
      } else {
        groups[groups.length - 1].entries.push(entry);
      }
    });
    return groups;
  }, [data]);

  // Summary
  const matchedCount = data.filter((e) => e.status === 'matched').length;
  const varianceCount = data.filter((e) => e.status === 'variance').length;
  const pendingCount = data.filter((e) => e.status === 'pending').length;
  const totalVariance = data.reduce((sum, e) => sum + Math.abs(e.variance), 0);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.date}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={[s.reconSummaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.reconSummaryItem}>
            <View style={[s.reconSummaryDot, { backgroundColor: '#22C55E' }]} />
            <ThemedText style={[s.reconSummaryValue, { color: colors.text }]}>{matchedCount}</ThemedText>
            <ThemedText style={[s.reconSummaryLabel, { color: colors.textTertiary }]}>Matched</ThemedText>
          </View>
          <View style={s.reconSummaryItem}>
            <View style={[s.reconSummaryDot, { backgroundColor: '#EF4444' }]} />
            <ThemedText style={[s.reconSummaryValue, { color: colors.text }]}>{varianceCount}</ThemedText>
            <ThemedText style={[s.reconSummaryLabel, { color: colors.textTertiary }]}>Variance</ThemedText>
          </View>
          <View style={s.reconSummaryItem}>
            <View style={[s.reconSummaryDot, { backgroundColor: '#F59E0B' }]} />
            <ThemedText style={[s.reconSummaryValue, { color: colors.text }]}>{pendingCount}</ThemedText>
            <ThemedText style={[s.reconSummaryLabel, { color: colors.textTertiary }]}>Pending</ThemedText>
          </View>
          <View style={s.reconSummaryItem}>
            <View style={[s.reconSummaryDot, { backgroundColor: '#8B5CF6' }]} />
            <ThemedText style={[s.reconSummaryValue, { color: colors.text }]}>{formatCurrency(totalVariance)}</ThemedText>
            <ThemedText style={[s.reconSummaryLabel, { color: colors.textTertiary }]}>Total Var.</ThemedText>
          </View>
        </View>
      }
      renderItem={({ item: group }) => (
        <View style={s.reconGroup}>
          <View style={s.reconDateHeader}>
            <View style={[s.reconDateBadge, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.reconDateText, { color: colors.text }]}>
                {group.date}
              </ThemedText>
            </View>
          </View>
          {group.entries.map((entry, idx) => {
            const stColor = reconciliationStatusColor(entry.status);
            const hasVariance = entry.variance !== 0;
            return (
              <View
                key={entry.id}
                style={[
                  s.reconCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  idx < group.entries.length - 1 && { marginBottom: Spacing.sm },
                ]}
              >
                <View style={[s.reconStripe, { backgroundColor: stColor }]} />
                <View style={s.reconContent}>
                  <View style={s.reconCardTop}>
                    <ThemedText style={[s.reconAccountName, { color: colors.text }]} numberOfLines={1}>
                      {entry.account}
                    </ThemedText>
                    <StatusBadge label={entry.status.toUpperCase()} color={stColor} />
                  </View>
                  <View style={s.reconBalanceRow}>
                    <View style={s.reconBalanceItem}>
                      <ThemedText style={[s.reconBalanceLabel, { color: colors.textTertiary }]}>
                        Expected
                      </ThemedText>
                      <ThemedText style={[s.reconBalanceValue, { color: colors.text }]}>
                        {formatCurrency(entry.expectedBalance)}
                      </ThemedText>
                    </View>
                    <View style={s.reconBalanceItem}>
                      <ThemedText style={[s.reconBalanceLabel, { color: colors.textTertiary }]}>
                        Actual
                      </ThemedText>
                      <ThemedText style={[s.reconBalanceValue, { color: colors.text }]}>
                        {formatCurrency(entry.actualBalance)}
                      </ThemedText>
                    </View>
                    {hasVariance && (
                      <View style={s.reconBalanceItem}>
                        <ThemedText style={[s.reconBalanceLabel, { color: colors.textTertiary }]}>
                          Variance
                        </ThemedText>
                        <ThemedText style={[s.reconBalanceValue, { color: '#EF4444' }]}>
                          {entry.variance > 0 ? '+' : ''}{formatCurrency(entry.variance)}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="checkmark.circle.fill" label="No reconciliation data" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DISPUTES TAB
// =============================================================================

function DisputesTab({
  colors,
  accentColor,
  data,
  onSelectDispute,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Dispute[];
  onSelectDispute: (dispute: Dispute) => void;
}) {
  // Summary
  const openCount = data.filter((d) => d.status === 'open').length;
  const reviewCount = data.filter((d) => d.status === 'under-review').length;
  const escalatedCount = data.filter((d) => d.status === 'escalated').length;
  const resolvedCount = data.filter((d) => d.status === 'resolved').length;
  const totalDisputeAmount = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={[s.disputeSummaryContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.disputeSummaryGrid}>
            <View style={s.disputeSummaryGridItem}>
              <View style={[s.disputeSummaryDot, { backgroundColor: '#F59E0B' }]} />
              <ThemedText style={[s.disputeSummaryGridValue, { color: colors.text }]}>{openCount}</ThemedText>
              <ThemedText style={[s.disputeSummaryGridLabel, { color: colors.textTertiary }]}>Open</ThemedText>
            </View>
            <View style={s.disputeSummaryGridItem}>
              <View style={[s.disputeSummaryDot, { backgroundColor: '#3B82F6' }]} />
              <ThemedText style={[s.disputeSummaryGridValue, { color: colors.text }]}>{reviewCount}</ThemedText>
              <ThemedText style={[s.disputeSummaryGridLabel, { color: colors.textTertiary }]}>Review</ThemedText>
            </View>
            <View style={s.disputeSummaryGridItem}>
              <View style={[s.disputeSummaryDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText style={[s.disputeSummaryGridValue, { color: colors.text }]}>{escalatedCount}</ThemedText>
              <ThemedText style={[s.disputeSummaryGridLabel, { color: colors.textTertiary }]}>Escalated</ThemedText>
            </View>
            <View style={s.disputeSummaryGridItem}>
              <View style={[s.disputeSummaryDot, { backgroundColor: '#22C55E' }]} />
              <ThemedText style={[s.disputeSummaryGridValue, { color: colors.text }]}>{resolvedCount}</ThemedText>
              <ThemedText style={[s.disputeSummaryGridLabel, { color: colors.textTertiary }]}>Resolved</ThemedText>
            </View>
          </View>
          <View style={[s.disputeTotalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.disputeTotalLabel, { color: colors.textTertiary }]}>Total Disputed</ThemedText>
            <ThemedText style={[s.disputeTotalValue, { color: colors.text }]}>{formatCurrency(totalDisputeAmount)}</ThemedText>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const stColor = DISPUTE_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.disputeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectDispute(item);
            }}
          >
            <View style={s.disputeCardTop}>
              <View style={s.disputeCardInfo}>
                <View style={[s.disputeIconCircle, { backgroundColor: stColor + '18' }]}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={18} color={stColor} />
                </View>
                <View style={s.disputeCardMid}>
                  <ThemedText style={[s.disputeClaimant, { color: colors.text }]} numberOfLines={1}>
                    {item.claimant}
                  </ThemedText>
                  <View style={s.disputeCardBadgeRow}>
                    <StatusBadge label={item.status.toUpperCase().replace('-', ' ')} color={stColor} />
                  </View>
                </View>
              </View>
              <ThemedText style={[s.disputeAmount, { color: colors.text }]}>
                {formatCurrency(item.amount)}
              </ThemedText>
            </View>

            <ThemedText style={[s.disputeReason, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.reason}
            </ThemedText>

            <View style={[s.disputeCardFooter, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.disputeDate, { color: colors.textTertiary }]}>
                {item.date}
              </ThemedText>
              <ThemedText style={[s.disputeRef, { color: colors.textTertiary }]}>
                Ref: {item.transaction}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="exclamationmark.triangle.fill" label="No disputes found" colors={colors} />
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
  onSelectReport,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: RailsReport[];
  onSelectReport: (report: RailsReport) => void;
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectReport(item);
            }}
          >
            <View style={s.reportCardTop}>
              <View style={[s.reportIconCircle, { backgroundColor: fmtColor + '18' }]}>
                <IconSymbol name="doc.text.fill" size={20} color={fmtColor} />
              </View>
              <View style={s.reportCardInfo}>
                <ThemedText style={[s.reportName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                <View style={s.reportCardBadgeRow}>
                  <StatusBadge label={item.type.toUpperCase()} color={accentColor} />
                  <StatusBadge label={item.format} color={fmtColor} />
                </View>
              </View>
            </View>
            <View style={[s.reportCardBottom, { borderTopColor: colors.border }]}>
              <View style={s.reportMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportMetaText, { color: colors.textSecondary }]}>
                  {item.period}
                </ThemedText>
              </View>
              <View style={s.reportMetaItem}>
                <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportMetaText, { color: colors.textTertiary }]}>
                  Generated {item.generatedDate}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="chart.line.uptrend.xyaxis" label="No reports available" colors={colors} />
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
  data: RailsSettingToggle[];
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
        <EmptyState icon="gearshape.fill" label="No settings available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ACCOUNT DETAIL BOTTOM SHEET
// =============================================================================

function AccountDetailSheet({
  visible,
  onClose,
  account,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  account: PaymentAccount | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!account) return null;

  const stColor = ACCOUNT_STATUS_COLOR[account.status];
  const typeColor = accountTypeColor(account.type);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={account.name} useModal>
      {/* Status + type badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={accountTypeLabel(account.type)} color={typeColor} />
        <StatusBadge label={account.status.toUpperCase().replace('-', ' ')} color={stColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{formatCurrency(account.balance)}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Balance</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{account.currency}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Currency</ThemedText>
        </View>
      </View>

      {/* Bank info */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Banking Institution</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {account.bank}
        </ThemedText>
      </View>

      {/* Account number */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Account Number</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          ****{account.accountLast4}
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
          <ThemedText style={s.sheetActionButtonText}>View Transactions</ThemedText>
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
  transaction: Transaction | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!transaction) return null;

  const stColor = TRANSACTION_STATUS_COLOR[transaction.status];
  const isCredit = transaction.type === 'credit';

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Transaction Detail" useModal>
      {/* Amount */}
      <View style={s.sheetAmountContainer}>
        <ThemedText
          style={[s.sheetAmountValue, { color: isCredit ? '#22C55E' : '#EF4444' }]}
        >
          {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
        </ThemedText>
      </View>

      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={transaction.type.toUpperCase()} color={isCredit ? '#22C55E' : '#EF4444'} />
        <StatusBadge label={transaction.category.toUpperCase()} color={accentColor} />
        <StatusBadge label={transaction.status.toUpperCase()} color={stColor} />
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {transaction.description}
        </ThemedText>
      </View>

      {/* Account */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Account</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {transaction.account}
        </ThemedText>
      </View>

      {/* Reference */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Reference</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {transaction.reference}
        </ThemedText>
      </View>

      {/* Date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {transaction.date}
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
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// PAYOUT DETAIL BOTTOM SHEET
// =============================================================================

function PayoutDetailSheet({
  visible,
  onClose,
  payout,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  payout: PayoutBatch | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!payout) return null;

  const stColor = PAYOUT_STATUS_COLOR[payout.status];
  const typeColor = payoutTypeColor(payout.type);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={payout.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={payoutTypeLabel(payout.type)} color={typeColor} />
        <StatusBadge label={payout.status.toUpperCase()} color={stColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{formatCurrency(payout.totalAmount)}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Total Amount</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{payout.recipientCount}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Recipients</ThemedText>
        </View>
      </View>

      {/* Date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Scheduled Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {payout.date}
        </ThemedText>
      </View>

      {/* Per-recipient amount */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Avg. Per Recipient</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {formatCurrency(payout.totalAmount / payout.recipientCount)}
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
          <ThemedText style={s.sheetActionButtonText}>View Recipients</ThemedText>
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
// INVOICE DETAIL BOTTOM SHEET
// =============================================================================

function InvoiceDetailSheet({
  visible,
  onClose,
  invoice,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!invoice) return null;

  const stColor = INVOICE_STATUS_COLOR[invoice.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={invoice.number} useModal>
      {/* Status badge */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={invoice.status.toUpperCase()} color={stColor} />
      </View>

      {/* Amount */}
      <View style={s.sheetAmountContainer}>
        <ThemedText style={[s.sheetAmountValue, { color: colors.text }]}>
          {formatCurrency(invoice.amount)}
        </ThemedText>
      </View>

      {/* Recipient */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Recipient</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {invoice.recipient}
        </ThemedText>
      </View>

      {/* Due date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Due Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {invoice.dueDate}
        </ThemedText>
      </View>

      {/* Line items */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Line Items</ThemedText>
        {invoice.items.map((lineItem, idx) => (
          <View key={idx} style={s.sheetLineItem}>
            <View style={[s.sheetLineItemDot, { backgroundColor: accentColor }]} />
            <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
              {lineItem}
            </ThemedText>
          </View>
        ))}
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
          <ThemedText style={s.sheetActionButtonText}>Send Reminder</ThemedText>
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
// DISPUTE DETAIL BOTTOM SHEET
// =============================================================================

function DisputeDetailSheet({
  visible,
  onClose,
  dispute,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  dispute: Dispute | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!dispute) return null;

  const stColor = DISPUTE_STATUS_COLOR[dispute.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Dispute Detail" useModal>
      {/* Amount */}
      <View style={s.sheetAmountContainer}>
        <ThemedText style={[s.sheetAmountValue, { color: '#EF4444' }]}>
          {formatCurrency(dispute.amount)}
        </ThemedText>
      </View>

      {/* Status badge */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={dispute.status.toUpperCase().replace('-', ' ')} color={stColor} />
      </View>

      {/* Claimant */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Claimant</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {dispute.claimant}
        </ThemedText>
      </View>

      {/* Reason */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Reason</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {dispute.reason}
        </ThemedText>
      </View>

      {/* Transaction Reference */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Transaction Ref</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {dispute.transaction}
        </ThemedText>
      </View>

      {/* Date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Filed Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {dispute.date}
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
          <ThemedText style={s.sheetActionButtonText}>Manage Dispute</ThemedText>
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
// REPORT DETAIL BOTTOM SHEET
// =============================================================================

function ReportDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: RailsReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  const fmtColor = REPORT_FORMAT_COLOR[report.format];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={report.type.toUpperCase()} color={accentColor} />
        <StatusBadge label={report.format} color={fmtColor} />
      </View>

      {/* Period */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Report Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.period}
        </ThemedText>
      </View>

      {/* Generated date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Generated</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.generatedDate}
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
          <ThemedText style={s.sheetActionButtonText}>Download {report.format}</ThemedText>
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

export function CompPaymentRailsV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompRailsTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection states for bottom sheets
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [showAccountDetail, setShowAccountDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutBatch | null>(null);
  const [showPayoutDetail, setShowPayoutDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDisputeDetail, setShowDisputeDetail] = useState(false);
  const [selectedReport, setSelectedReport] = useState<RailsReport | null>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);

  // Settings state (local toggle tracking)
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_RAILS_SCOPE_CHIPS[activeScope] ?? 'All Rails';
  const data = useMemo(() => getCompRailsData(scopeLabel), [scopeLabel]);

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
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return data.accounts;
    const q = searchQuery.toLowerCase();
    return data.accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.bank.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.accountLast4.includes(q),
    );
  }, [data.accounts, searchQuery]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return data.transactions;
    const q = searchQuery.toLowerCase();
    return data.transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q),
    );
  }, [data.transactions, searchQuery]);

  const filteredPayouts = useMemo(() => {
    if (!searchQuery.trim()) return data.payouts;
    const q = searchQuery.toLowerCase();
    return data.payouts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q),
    );
  }, [data.payouts, searchQuery]);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return data.invoices;
    const q = searchQuery.toLowerCase();
    return data.invoices.filter(
      (inv) =>
        inv.number.toLowerCase().includes(q) ||
        inv.recipient.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q) ||
        inv.items.some((item) => item.toLowerCase().includes(q)),
    );
  }, [data.invoices, searchQuery]);

  const filteredFees = useMemo(() => {
    if (!searchQuery.trim()) return data.fees;
    const q = searchQuery.toLowerCase();
    return data.fees.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.appliesTo.toLowerCase().includes(q),
    );
  }, [data.fees, searchQuery]);

  const filteredReconciliation = useMemo(() => {
    if (!searchQuery.trim()) return data.reconciliation;
    const q = searchQuery.toLowerCase();
    return data.reconciliation.filter(
      (r) =>
        r.account.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q),
    );
  }, [data.reconciliation, searchQuery]);

  const filteredDisputes = useMemo(() => {
    if (!searchQuery.trim()) return data.disputes;
    const q = searchQuery.toLowerCase();
    return data.disputes.filter(
      (d) =>
        d.claimant.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q) ||
        d.transaction.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q),
    );
  }, [data.disputes, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return data.reports;
    const q = searchQuery.toLowerCase();
    return data.reports.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q),
    );
  }, [data.reports, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompRailsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectAccount = useCallback((account: PaymentAccount) => {
    setSelectedAccount(account);
    setShowAccountDetail(true);
  }, []);

  const handleSelectTransaction = useCallback((txn: Transaction) => {
    setSelectedTransaction(txn);
    setShowTransactionDetail(true);
  }, []);

  const handleSelectPayout = useCallback((payout: PayoutBatch) => {
    setSelectedPayout(payout);
    setShowPayoutDetail(true);
  }, []);

  const handleSelectInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  }, []);

  const handleSelectDispute = useCallback((dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowDisputeDetail(true);
  }, []);

  const handleSelectReport = useCallback((report: RailsReport) => {
    setSelectedReport(report);
    setShowReportDetail(true);
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
      case 'accounts':
        return (
          <AccountsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredAccounts}
            onSelectAccount={handleSelectAccount}
          />
        );
      case 'transactions':
        return (
          <TransactionsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredTransactions}
            onSelectTransaction={handleSelectTransaction}
          />
        );
      case 'payouts':
        return (
          <PayoutsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredPayouts}
            onSelectPayout={handleSelectPayout}
          />
        );
      case 'invoices':
        return (
          <InvoicesTab
            colors={colors}
            accentColor={accentColor}
            data={filteredInvoices}
            onSelectInvoice={handleSelectInvoice}
          />
        );
      case 'fees':
        return <FeesTab colors={colors} accentColor={accentColor} data={filteredFees} />;
      case 'reconciliation':
        return <ReconciliationTab colors={colors} accentColor={accentColor} data={filteredReconciliation} />;
      case 'disputes':
        return (
          <DisputesTab
            colors={colors}
            accentColor={accentColor}
            data={filteredDisputes}
            onSelectDispute={handleSelectDispute}
          />
        );
      case 'reports':
        return (
          <ReportsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredReports}
            onSelectReport={handleSelectReport}
          />
        );
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
        contentContainerStyle={s.tabPillRow}
      >
        {COMP_RAILS_TABS.map((tab) => {
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
        {COMP_RAILS_SCOPE_CHIPS.map((chip, index) => {
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
      <AccountDetailSheet
        visible={showAccountDetail}
        onClose={() => setShowAccountDetail(false)}
        account={selectedAccount}
        colors={colors}
        accentColor={accentColor}
      />
      <TransactionDetailSheet
        visible={showTransactionDetail}
        onClose={() => setShowTransactionDetail(false)}
        transaction={selectedTransaction}
        colors={colors}
        accentColor={accentColor}
      />
      <PayoutDetailSheet
        visible={showPayoutDetail}
        onClose={() => setShowPayoutDetail(false)}
        payout={selectedPayout}
        colors={colors}
        accentColor={accentColor}
      />
      <InvoiceDetailSheet
        visible={showInvoiceDetail}
        onClose={() => setShowInvoiceDetail(false)}
        invoice={selectedInvoice}
        colors={colors}
        accentColor={accentColor}
      />
      <DisputeDetailSheet
        visible={showDisputeDetail}
        onClose={() => setShowDisputeDetail(false)}
        dispute={selectedDispute}
        colors={colors}
        accentColor={accentColor}
      />
      <ReportDetailSheet
        visible={showReportDetail}
        onClose={() => setShowReportDetail(false)}
        report={selectedReport}
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
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiDelta: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // -- Dashboard: Activity card --
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
  activityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  activityTime: {
    fontSize: 11,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Dashboard: Account balance summary --
  accountDotSquare: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountBalanceCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  accountBalance: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  accountStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // -- Dashboard: Dispute summary --
  disputeSummaryCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  disputeSummaryAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Accounts --
  accountCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  accountCardTop: {
    padding: Spacing.md,
  },
  accountCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  accountIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCardMid: {
    flex: 1,
  },
  accountCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  accountCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  accountDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  accountDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  accountDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  accountCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  accountBankText: {
    fontSize: 12,
  },

  // -- Transactions --
  txnSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  txnSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  txnSummaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  txnSummaryValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  txnSummaryDivider: {
    width: 1,
    height: 28,
  },
  txnCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  txnCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  txnTypeIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginTop: 2,
  },
  txnCardInfo: {
    flex: 1,
  },
  txnDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 19,
  },
  txnCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  txnCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  txnDate: {
    fontSize: 11,
  },
  txnAccount: {
    fontSize: 11,
    flex: 1,
    textAlign: 'center',
  },
  txnRef: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

  // -- Payouts --
  payoutCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  payoutCardTop: {
    padding: Spacing.md,
  },
  payoutCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  payoutIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutCardMid: {
    flex: 1,
  },
  payoutCardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  payoutCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  payoutCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  payoutDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  payoutDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  payoutDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Invoices --
  invoiceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  invoiceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  invoiceCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 2,
  },
  invoiceRecipient: {
    fontSize: 15,
    fontWeight: '600',
  },
  invoiceAmountCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  invoiceItemsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  invoiceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  invoiceItemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  invoiceItemText: {
    fontSize: 12,
    flex: 1,
  },
  invoiceCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  invoiceDueDate: {
    fontSize: 11,
  },

  // -- Fees --
  feeGroup: {
    marginBottom: Spacing.lg,
  },
  feeGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  feeGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  feeGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  feeGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  feeCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  feeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  feeCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  feeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  feeApplies: {
    fontSize: 12,
    marginTop: 2,
  },
  feeAmountCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Reconciliation --
  reconSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reconSummaryItem: {
    alignItems: 'center',
    gap: 3,
  },
  reconSummaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reconSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  reconSummaryLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  reconGroup: {
    marginBottom: Spacing.md,
  },
  reconDateHeader: {
    marginBottom: Spacing.sm,
  },
  reconDateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  reconDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reconCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reconStripe: {
    width: 4,
  },
  reconContent: {
    flex: 1,
    padding: Spacing.sm,
  },
  reconCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reconAccountName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  reconBalanceRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  reconBalanceItem: {
    flex: 1,
  },
  reconBalanceLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 1,
  },
  reconBalanceValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Disputes --
  disputeSummaryContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  disputeSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
  },
  disputeSummaryGridItem: {
    alignItems: 'center',
    gap: 3,
  },
  disputeSummaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  disputeSummaryGridValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  disputeSummaryGridLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  disputeTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  disputeTotalLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  disputeTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  disputeCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  disputeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  disputeCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  disputeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disputeCardMid: {
    flex: 1,
  },
  disputeClaimant: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  disputeCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  disputeAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  disputeReason: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  disputeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  disputeDate: {
    fontSize: 11,
  },
  disputeRef: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

  // -- Reports --
  reportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  reportCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  reportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCardInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 19,
  },
  reportCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  reportCardBottom: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 3,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportMetaText: {
    fontSize: 12,
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
  sheetAmountContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sheetAmountValue: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sheetLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  sheetLineItemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
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
