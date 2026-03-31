/**
 * Payment Rails Hub — v2
 * Mode-aware payment management hub with pill navigation.
 * Tabs: Home | Collect | Payouts | Settlements | Refunds | Reconciliation
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  PAYMENTS,
  SETTLEMENTS,
  REFUNDS,
  PAYMENT_SNAPSHOTS,
  type Payment,
  type Settlement,
  type Refund,
  type PaymentStatus,
  type PaymentMethod,
} from '@/data/mock-payment-rails';

// =============================================================================
// CONSTANTS
// =============================================================================

type HubTab = 'home' | 'collect' | 'payouts' | 'settlements' | 'refunds' | 'reconciliation';

const HUB_TABS: { id: HubTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'collect', label: 'Collect' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'settlements', label: 'Settlements' },
  { id: 'refunds', label: 'Refunds' },
  { id: 'reconciliation', label: 'Reconciliation' },
];

const STATUS_COLORS: Record<string, string> = {
  completed: '#5A8A6E',
  pending: '#B8943E',
  failed: '#B85C5C',
  processing: '#1A1714',
  refunded: '#9C9790',
  settled: '#5A8A6E',
  'in-progress': '#1A1714',
  approved: '#5A8A6E',
  denied: '#B85C5C',
  processed: '#5A8A6E',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Card',
  bank: 'Bank',
  cash: 'Cash',
  check: 'Check',
  digital: 'Digital',
};

// =============================================================================
// SHARED UI
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#9C9790';
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
      <ThemedText style={[styles.statusBadgeText, { color }]}>
        {status.toUpperCase().replace('-', ' ')}
      </ThemedText>
    </View>
  );
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  return (
    <View style={[styles.methodBadge, { backgroundColor: colors.backgroundTertiary }]}>
      <ThemedText style={[styles.methodBadgeText, { color: colors.textSecondary }]}>
        {METHOD_LABELS[method]}
      </ThemedText>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <ThemedText style={[styles.sectionHeader, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

function FilterPills({ options, active, onSelect }: { options: string[]; active: string; onSelect: (v: string) => void }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      <View style={styles.filterRow}>
        {options.map((opt) => {
          const isActive = opt === active;
          return (
            <Pressable
              key={opt}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                  borderColor: isActive ? '#fff' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(opt);
              }}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {opt}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// PAYMENT ROW
// =============================================================================

function PaymentRow({ payment, amountColor }: { payment: Payment; amountColor: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const sign = payment.type === 'collect' ? '+' : '-';
  return (
    <View style={[styles.paymentRow, { borderBottomColor: colors.border }]}>
      <View style={styles.paymentRowLeft}>
        <ThemedText style={[styles.paymentDesc, { color: colors.text }]} numberOfLines={1}>
          {payment.description}
        </ThemedText>
        <View style={styles.paymentMeta}>
          <ThemedText style={[styles.paymentCounterparty, { color: colors.textSecondary }]} numberOfLines={1}>
            {payment.counterparty}
          </ThemedText>
          <MethodBadge method={payment.method} />
          <StatusBadge status={payment.status} />
        </View>
        <ThemedText style={[styles.paymentDate, { color: colors.textTertiary }]}>
          {payment.date}
        </ThemedText>
      </View>
      <ThemedText style={[styles.paymentAmount, { color: amountColor }]}>
        {sign}${payment.amount.toLocaleString()}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// HOME VIEW
// =============================================================================

function HomeView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const snapshot = PAYMENT_SNAPSHOTS[mode];
  const payments = PAYMENTS[mode];

  const recentPayments = useMemo(
    () => [...payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [payments],
  );

  const pendingActions = useMemo(
    () => payments.filter((p) => p.status === 'pending' || p.status === 'failed'),
    [payments],
  );

  const metrics = [
    { label: 'Total Collected', value: `$${snapshot.totalCollected.toLocaleString()}`, color: '#5A8A6E' },
    { label: 'Total Paid Out', value: `$${snapshot.totalPaidOut.toLocaleString()}`, color: '#B85C5C' },
    { label: 'Pending', value: String(snapshot.pendingPayments), color: '#B8943E' },
    { label: 'Refunds', value: String(snapshot.refundsProcessed), color: accent },
    { label: 'Net Balance', value: `$${snapshot.settlementBalance.toLocaleString()}`, color: '#FFFFFF' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Metric Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
        <View style={styles.metricsRow}>
          {metrics.map((m) => (
            <Card key={m.label} style={styles.metricCard}>
              <ThemedText style={[styles.metricValue, { color: m.color }]}>{m.value}</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>{m.label}</ThemedText>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Recent Payments */}
      <SectionHeader title="Recent Payments" />
      <Card>
        {recentPayments.map((p, i) => (
          <PaymentRow
            key={p.id}
            payment={p}
            amountColor={p.type === 'collect' ? '#5A8A6E' : '#B85C5C'}
          />
        ))}
      </Card>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <>
          <SectionHeader title="Pending Actions" />
          <Card>
            {pendingActions.map((p) => (
              <PaymentRow
                key={p.id}
                payment={p}
                amountColor={p.type === 'collect' ? '#5A8A6E' : '#B85C5C'}
              />
            ))}
          </Card>
        </>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// COLLECT VIEW
// =============================================================================

function CollectView() {
  const mode = useMode();
  const [filter, setFilter] = useState('All');
  const payments = PAYMENTS[mode];

  const collectPayments = useMemo(() => {
    const collected = payments.filter((p) => p.type === 'collect');
    if (filter === 'All') return collected;
    return collected.filter((p) => p.status === filter.toLowerCase());
  }, [payments, filter]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <FilterPills options={['All', 'Completed', 'Pending', 'Failed']} active={filter} onSelect={setFilter} />
      <Card>
        {collectPayments.length === 0 ? (
          <EmptyState message="No payments match this filter." />
        ) : (
          collectPayments.map((p) => (
            <PaymentRow key={p.id} payment={p} amountColor="#5A8A6E" />
          ))
        )}
      </Card>
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// PAYOUTS VIEW
// =============================================================================

function PayoutsView() {
  const mode = useMode();
  const [filter, setFilter] = useState('All');
  const payments = PAYMENTS[mode];

  const payoutPayments = useMemo(() => {
    const payouts = payments.filter((p) => p.type === 'payout');
    if (filter === 'All') return payouts;
    return payouts.filter((p) => p.status === filter.toLowerCase());
  }, [payments, filter]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <FilterPills options={['All', 'Completed', 'Processing', 'Pending']} active={filter} onSelect={setFilter} />
      <Card>
        {payoutPayments.length === 0 ? (
          <EmptyState message="No payouts match this filter." />
        ) : (
          payoutPayments.map((p) => (
            <PaymentRow key={p.id} payment={p} amountColor="#B85C5C" />
          ))
        )}
      </Card>
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// SETTLEMENTS VIEW
// =============================================================================

function SettlementsView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const settlements = SETTLEMENTS[mode];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {settlements.map((s) => {
        const total = s.totalCollected + s.totalPaidOut;
        const collectedPct = total > 0 ? (s.totalCollected / total) * 100 : 50;
        return (
          <Card key={s.id}>
            <View style={styles.settlementHeader}>
              <ThemedText style={[styles.settlementPeriod, { color: colors.text }]}>{s.period}</ThemedText>
              <StatusBadge status={s.status} />
            </View>

            <View style={styles.settlementAmounts}>
              <View style={styles.settlementAmountCol}>
                <ThemedText style={[styles.settlementAmountValue, { color: '#5A8A6E' }]}>
                  ${s.totalCollected.toLocaleString()}
                </ThemedText>
                <ThemedText style={[styles.settlementAmountLabel, { color: colors.textSecondary }]}>
                  Collected
                </ThemedText>
              </View>
              <View style={styles.settlementAmountCol}>
                <ThemedText style={[styles.settlementAmountValue, { color: '#B85C5C' }]}>
                  ${s.totalPaidOut.toLocaleString()}
                </ThemedText>
                <ThemedText style={[styles.settlementAmountLabel, { color: colors.textSecondary }]}>
                  Paid Out
                </ThemedText>
              </View>
              <View style={styles.settlementAmountCol}>
                <ThemedText style={[styles.settlementAmountValue, { color: s.netAmount >= 0 ? '#5A8A6E' : '#B85C5C' }]}>
                  ${Math.abs(s.netAmount).toLocaleString()}
                </ThemedText>
                <ThemedText style={[styles.settlementAmountLabel, { color: colors.textSecondary }]}>
                  Net
                </ThemedText>
              </View>
            </View>

            {/* Progress bar: collected vs paid out */}
            <View style={[styles.settlementBar, { backgroundColor: colors.backgroundTertiary }]}>
              <View style={[styles.settlementBarCollected, { width: `${collectedPct}%` }]} />
            </View>

            <ThemedText style={[styles.settlementDate, { color: colors.textTertiary }]}>
              {s.date}
            </ThemedText>
          </Card>
        );
      })}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// REFUNDS VIEW
// =============================================================================

function RefundsView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState('All');
  const refunds = REFUNDS[mode];

  const filteredRefunds = useMemo(() => {
    if (filter === 'All') return refunds;
    return refunds.filter((r) => r.status === filter.toLowerCase());
  }, [refunds, filter]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <FilterPills options={['All', 'Pending', 'Approved', 'Processed']} active={filter} onSelect={setFilter} />
      {filteredRefunds.length === 0 ? (
        <Card>
          <EmptyState message="No refunds match this filter." />
        </Card>
      ) : (
        filteredRefunds.map((r) => (
          <Card key={r.id}>
            <View style={styles.refundHeader}>
              <ThemedText style={[styles.refundAmount, { color: '#B85C5C' }]}>
                -${r.amount.toLocaleString()}
              </ThemedText>
              <StatusBadge status={r.status} />
            </View>
            <ThemedText style={[styles.refundReason, { color: colors.text }]}>
              {r.reason}
            </ThemedText>
            <ThemedText style={[styles.refundRef, { color: colors.textSecondary }]}>
              Original: {r.originalPaymentId}
            </ThemedText>
            <View style={styles.refundDates}>
              <ThemedText style={[styles.refundDate, { color: colors.textTertiary }]}>
                Requested: {r.requestDate}
              </ThemedText>
              {r.processedDate && (
                <ThemedText style={[styles.refundDate, { color: colors.textTertiary }]}>
                  Processed: {r.processedDate}
                </ThemedText>
              )}
            </View>
          </Card>
        ))
      )}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// RECONCILIATION VIEW
// =============================================================================

function ReconciliationView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const payments = PAYMENTS[mode];

  const unreconciledItems = useMemo(
    () => payments.filter((p) => p.status === 'pending' || p.status === 'processing'),
    [payments],
  );

  const isReconciled = unreconciledItems.length === 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Summary Card */}
      <Card>
        <View style={styles.reconSummary}>
          <View style={[styles.reconIcon, { backgroundColor: isReconciled ? '#5A8A6E18' : '#B8943E18' }]}>
            <IconSymbol
              name={isReconciled ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'}
              size={28}
              color={isReconciled ? '#5A8A6E' : '#B8943E'}
            />
          </View>
          <ThemedText style={[styles.reconTitle, { color: colors.text }]}>
            {isReconciled
              ? 'All transactions reconciled'
              : `${unreconciledItems.length} item${unreconciledItems.length !== 1 ? 's' : ''} need review`}
          </ThemedText>
          <ThemedText style={[styles.reconSubtitle, { color: colors.textSecondary }]}>
            {isReconciled
              ? 'No pending or processing transactions require attention.'
              : 'Review and resolve the following transactions to complete reconciliation.'}
          </ThemedText>
        </View>
      </Card>

      {/* Unreconciled Items */}
      {unreconciledItems.length > 0 && (
        <>
          <SectionHeader title="Items Needing Review" />
          {unreconciledItems.map((p) => (
            <Card key={p.id}>
              <View style={styles.reconItemRow}>
                <View style={styles.reconItemLeft}>
                  <ThemedText style={[styles.reconItemDesc, { color: colors.text }]} numberOfLines={1}>
                    {p.description}
                  </ThemedText>
                  <View style={styles.reconItemMeta}>
                    <StatusBadge status={p.status} />
                    <ThemedText style={[styles.reconItemDate, { color: colors.textTertiary }]}>
                      {p.date}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.reconItemRight}>
                  <ThemedText style={[styles.reconItemAmount, { color: p.type === 'collect' ? '#5A8A6E' : '#B85C5C' }]}>
                    {p.type === 'collect' ? '+' : '-'}${p.amount.toLocaleString()}
                  </ThemedText>
                  <Pressable
                    style={[styles.reviewButton, { borderColor: colors.border }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <ThemedText style={[styles.reviewButtonText, { color: accent }]}>Review</ThemedText>
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </>
      )}

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ message }: { message: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={styles.emptyState}>
      <IconSymbol name="tray.fill" size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>{message}</ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PaymentRailsHub() {
  const [activeTab, setActiveTab] = useState<HubTab>('home');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView />;
      case 'collect': return <CollectView />;
      case 'payouts': return <PayoutsView />;
      case 'settlements': return <SettlementsView />;
      case 'refunds': return <RefundsView />;
      case 'reconciliation': return <ReconciliationView />;
      default: return <HomeView />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillNavContent}
        style={styles.pillNav}
      >
        {HUB_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                  borderColor: isActive ? '#fff' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id);
              }}
            >
              <ThemedText style={[styles.pillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Pill Nav
  pillNav: {
    flexGrow: 0,
  },
  pillNavContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },

  // Card
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // Filters
  filterScroll: {
    marginBottom: Spacing.md,
    flexGrow: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Metrics
  metricsScroll: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.md,
    flexGrow: 0,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  metricCard: {
    minWidth: 120,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 4,
    textAlign: 'center',
  },

  // Payment Row
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  paymentRowLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  paymentDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  paymentCounterparty: {
    fontSize: 12,
    maxWidth: 140,
  },
  paymentDate: {
    fontSize: 11,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },

  // Settlements
  settlementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  settlementPeriod: {
    fontSize: 16,
    fontWeight: '600',
  },
  settlementAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  settlementAmountCol: {
    alignItems: 'center',
  },
  settlementAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  settlementAmountLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  settlementBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  settlementBarCollected: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5A8A6E',
  },
  settlementDate: {
    fontSize: 11,
  },

  // Refunds
  refundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  refundAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  refundReason: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  refundRef: {
    fontSize: 12,
    marginBottom: 4,
  },
  refundDates: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 2,
  },
  refundDate: {
    fontSize: 11,
  },

  // Reconciliation
  reconSummary: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  reconIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  reconTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  reconSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  reconItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reconItemLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  reconItemDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  reconItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  reconItemDate: {
    fontSize: 11,
  },
  reconItemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  reconItemAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  reviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
