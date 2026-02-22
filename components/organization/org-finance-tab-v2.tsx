/**
 * Organization Finance Tab v2 — 14-tab Finance Hub.
 * Dashboard, Budgets, Ledger, Approvals, Payables, Receivables,
 * Contracts, Purchasing, Payroll/Stipends, Reimbursements, Reporting,
 * Controls, Audit, Settings.
 * Replaces the original org-finance-tab.tsx.
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
  FINANCE_TABS,
  FINANCE_SCOPE_CHIPS,
  getFinanceData,
  formatCurrency,
  getBudgetPercentage,
  FINANCE_STATUS_COLOR,
  BUDGET_STATUS_COLOR,
  CONTRACT_STATUS_COLOR,
} from '@/data/mock-finance-v2';
import type {
  FinanceTabId,
  FinanceDashboardBlock,
  FinanceBudget,
  FinanceLedgerEntry,
  FinanceApproval,
  FinancePayable,
  FinanceReceivable,
  FinanceContract,
  FinancePurchaseRequest,
  FinancePayrollItem,
  FinanceReimbursement,
  FinanceReport,
  FinanceControl,
  FinanceAuditEntry,
  FinanceStatus,
  FinanceSortOption,
} from '@/data/mock-finance-v2';

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

function FinanceStatusBadge({ status }: { status: FinanceStatus }) {
  const fg = FINANCE_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function BudgetStatusBadge({ status }: { status: FinanceBudget['status'] }) {
  const fg = BUDGET_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function ContractStatusBadge({ status }: { status: FinanceContract['status'] }) {
  const fg = CONTRACT_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function AmountText({ amount, type }: { amount: number; type: 'income' | 'expense' | 'receivable' | 'payable' | 'neutral' }) {
  const isPositive = type === 'income' || type === 'receivable';
  const isNegative = type === 'expense' || type === 'payable';
  const color = isPositive ? '#22C55E' : isNegative ? '#EF4444' : '#FFFFFF';
  const prefix = isPositive ? '+' : isNegative ? '-' : '';
  return (
    <ThemedText style={[s.amountText, { color }]}>
      {prefix}{formatCurrency(amount)}
    </ThemedText>
  );
}

function EmptyState({ icon, text, colors }: { icon: string; text: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyState}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

// =============================================================================
// TIMESTAMP FORMATTER
// =============================================================================

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
// PAYROLL TYPE COLORS
// =============================================================================

const PAYROLL_TYPE_COLOR: Record<string, string> = {
  salary: '#1D9BF0',
  stipend: '#22C55E',
  contractor: '#F59E0B',
  honorarium: '#1D9BF0',
};

// =============================================================================
// AUDIT ICON / COLOR HELPERS
// =============================================================================

function auditEntryColor(action: string): string {
  if (action.includes('payment') || action.includes('payroll')) return '#1D9BF0';
  if (action.includes('revenue') || action.includes('giving') || action.includes('tuition') || action.includes('grant') || action.includes('sponsorship')) return '#22C55E';
  if (action.includes('alert') || action.includes('overdue')) return '#EF4444';
  if (action.includes('approval') || action.includes('reimbursement')) return '#F59E0B';
  if (action.includes('contract') || action.includes('insurance')) return '#1D9BF0';
  if (action.includes('control')) return '#A1A1AA';
  return '#A1A1AA';
}

function auditEntryIcon(action: string): string {
  if (action.includes('payment')) return 'creditcard';
  if (action.includes('payroll')) return 'person.2';
  if (action.includes('revenue') || action.includes('giving') || action.includes('tuition') || action.includes('grant') || action.includes('sponsorship')) return 'arrow.up.circle';
  if (action.includes('alert')) return 'exclamationmark.triangle';
  if (action.includes('approval')) return 'checkmark.seal';
  if (action.includes('reimbursement')) return 'arrow.uturn.left.circle';
  if (action.includes('invoice')) return 'doc.text';
  if (action.includes('contract') || action.includes('insurance')) return 'doc.on.doc';
  if (action.includes('control')) return 'slider.horizontal.3';
  if (action.includes('budget')) return 'chart.bar';
  return 'clock';
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OrgFinanceTab({ mode, colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<FinanceTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter state
  const [filterSort, setFilterSort] = useState<FinanceSortOption>('recent-activity');
  const [filterStatuses, setFilterStatuses] = useState<FinanceStatus[]>([]);

  // Settings toggles (visual only)
  const [settingApprovalThreshold, setSettingApprovalThreshold] = useState(true);
  const [settingAutoExport, setSettingAutoExport] = useState(false);
  const [settingEvidenceRequired, setSettingEvidenceRequired] = useState(true);

  // === Data ===
  const data = useMemo(() => getFinanceData(mode), [mode]);
  const scopeChips = FINANCE_SCOPE_CHIPS[mode];

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: FinanceTabId) => {
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
    setFilterSort('recent-activity');
    setFilterStatuses([]);
  }, []);

  const toggleFilterStatus = useCallback((st: FinanceStatus) => {
    setFilterStatuses((prev) =>
      prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st],
    );
  }, []);

  // === Derived ===
  const pendingApprovalCount = useMemo(
    () => data.approvals.filter((a) => a.status === 'pending').length,
    [data.approvals],
  );

  const overduePayableCount = useMemo(
    () => data.payables.filter((p) => p.status === 'overdue' || (p.status === 'pending' && new Date(p.dueDate) < new Date())).length,
    [data.payables],
  );

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'budgets':
        return renderBudgets();
      case 'ledger':
        return renderLedger();
      case 'approvals':
        return renderApprovals();
      case 'payables':
        return renderPayables();
      case 'receivables':
        return renderReceivables();
      case 'contracts':
        return renderContracts();
      case 'purchasing':
        return renderPurchasing();
      case 'payroll':
        return renderPayroll();
      case 'reimbursements':
        return renderReimbursements();
      case 'reporting':
        return renderReporting();
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

  // === Tab 1: Dashboard ===
  const renderDashboard = () => (
    <View style={s.tabContent}>
      <View style={s.dashboardGrid}>
        {data.dashboard.map((block) => (
          <View
            key={block.id}
            style={[s.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.dashIconCircle, { backgroundColor: block.color + '26' }]}>
              <IconSymbol name={block.icon as any} size={16} color={block.color} />
            </View>
            <ThemedText style={[s.dashLabel, { color: colors.textSecondary }]}>{block.label}</ThemedText>
            <ThemedText style={[s.dashValue, { color: block.color }]}>{block.value}</ThemedText>
            {block.subValue && (
              <ThemedText style={[s.dashSub, { color: colors.textTertiary }]}>{block.subValue}</ThemedText>
            )}
          </View>
        ))}
      </View>

      {/* Quick stats below grid */}
      <View style={[s.quickStatsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.quickStat}>
          <ThemedText style={[s.quickStatLabel, { color: colors.textSecondary }]}>Pending Approvals</ThemedText>
          <ThemedText style={[s.quickStatValue, { fontVariant: ['tabular-nums'] }]}>
            {pendingApprovalCount}
          </ThemedText>
        </View>
        <View style={[s.quickStatDivider, { backgroundColor: colors.divider }]} />
        <View style={s.quickStat}>
          <ThemedText style={[s.quickStatLabel, { color: colors.textSecondary }]}>Overdue Payables</ThemedText>
          <ThemedText
            style={[
              s.quickStatValue,
              { color: overduePayableCount > 0 ? '#EF4444' : colors.text, fontVariant: ['tabular-nums'] },
            ]}
          >
            {overduePayableCount}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  // === Tab 2: Budgets ===
  const renderBudgets = () => (
    <FlatList<FinanceBudget>
      data={data.budgets}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="chart.bar" text="No budgets configured" colors={colors} />}
      renderItem={({ item }) => {
        const pct = getBudgetPercentage(item.actual, item.budgeted);
        const barColor = BUDGET_STATUS_COLOR[item.status];
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardInfo}>
              <View style={s.budgetTopRow}>
                <ThemedText style={s.budgetCategory}>{item.category}</ThemedText>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.period}</ThemedText>
                </View>
              </View>
              {/* Progress bar */}
              <View style={[s.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    s.progressBarFill,
                    { width: `${Math.min(pct, 100)}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
              <View style={s.budgetAmountRow}>
                <ThemedText style={[s.budgetAmountText, { color: colors.text }]}>
                  {formatCurrency(item.actual)} / {formatCurrency(item.budgeted)}
                </ThemedText>
                <BudgetStatusBadge status={item.status} />
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.owner}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 3: Ledger ===
  const renderLedger = () => (
    <FlatList<FinanceLedgerEntry>
      data={data.ledger}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="list.bullet.rectangle" text="No ledger entries" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.ledgerRow}>
            <View style={s.ledgerDateCol}>
              <ThemedText style={[s.ledgerDate, { color: colors.textTertiary }]}>{item.date}</ThemedText>
            </View>
            <View style={s.ledgerInfoCol}>
              <View style={s.ledgerDescRow}>
                <ThemedText style={s.ledgerDesc} numberOfLines={1}>{item.description}</ThemedText>
                {!!item.evidence && (
                  <IconSymbol name="paperclip" size={12} color={colors.textTertiary} />
                )}
              </View>
              <View style={s.ledgerMetaRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.category}</ThemedText>
                </View>
                <ThemedText style={[s.ledgerScope, { color: colors.textTertiary }]}>{item.scope}</ThemedText>
              </View>
            </View>
            <AmountText amount={item.amount} type={item.type} />
          </View>
        </View>
      )}
    />
  );

  // === Tab 4: Approvals ===
  const renderApprovals = () => (
    <FlatList<FinanceApproval>
      data={data.approvals}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="checkmark.seal" text="No pending approvals" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <View style={s.approvalTopRow}>
              <ThemedText style={s.approvalTitle}>{item.title}</ThemedText>
              <ThemedText style={[s.approvalAmount, { fontVariant: ['tabular-nums'] }]}>
                {formatCurrency(item.amount)}
              </ThemedText>
            </View>
            <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.purpose}
            </ThemedText>
            <View style={s.approvalPersonRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.requestedByInitials}</ThemedText>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.requestedBy}</ThemedText>
            </View>
            <ThemedText style={[s.approversList, { color: colors.textTertiary }]}>
              Approvers: {item.approvers.join(', ')}
            </ThemedText>
            <View style={s.approvalBottomRow}>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.submittedAt}</ThemedText>
              <FinanceStatusBadge status={item.status} />
            </View>
            {item.status === 'pending' && (
              <View style={s.approvalActions}>
                <Pressable
                  style={({ pressed }) => [
                    s.approveBtn,
                    { backgroundColor: '#22C55E' },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <ThemedText style={s.actionBtnText}>Approve</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    s.rejectBtn,
                    { backgroundColor: '#EF4444' },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <ThemedText style={s.actionBtnText}>Reject</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}
    />
  );

  // === Tab 5: Payables ===
  const renderPayables = () => (
    <FlatList<FinancePayable>
      data={data.payables}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="arrow.down.doc" text="No payables" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <View style={s.payableTopRow}>
              <ThemedText style={s.listCardTitle}>{item.vendor}</ThemedText>
              <ThemedText style={[s.payableRef, { color: colors.textTertiary }]}>{item.invoiceRef}</ThemedText>
            </View>
            <View style={s.payableDescRow}>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.description}
              </ThemedText>
              <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.category}</ThemedText>
              </View>
            </View>
            <ThemedText style={[s.payableAmountBold, { fontVariant: ['tabular-nums'] }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
            <View style={s.payableBottomRow}>
              <ThemedText
                style={[
                  s.listCardSub,
                  { color: (item.status === 'overdue' || (item.status === 'pending' && new Date(item.dueDate) < new Date())) ? '#EF4444' : colors.textTertiary },
                ]}
              >
                Due: {item.dueDate}{(item.status === 'overdue' || (item.status === 'pending' && new Date(item.dueDate) < new Date())) ? ' (OVERDUE)' : ''}
              </ThemedText>
              <FinanceStatusBadge status={item.status} />
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 6: Receivables ===
  const renderReceivables = () => (
    <FlatList<FinanceReceivable>
      data={data.receivables}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="arrow.up.doc" text="No receivables" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <ThemedText style={s.listCardTitle}>{item.source}</ThemedText>
            <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </ThemedText>
            <ThemedText style={[s.receivableAmount, { fontVariant: ['tabular-nums'] }]}>
              +{formatCurrency(item.amount)}
            </ThemedText>
            <View style={s.receivableBottomRow}>
              <View style={s.receivableDateRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  Due: {item.dueDate}
                </ThemedText>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.category}</ThemedText>
                </View>
              </View>
              <FinanceStatusBadge status={item.status} />
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 7: Contracts ===
  const renderContracts = () => (
    <FlatList<FinanceContract>
      data={data.contracts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="doc.on.doc" text="No contracts" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
            <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.vendor}</ThemedText>
            <ThemedText style={[s.contractValue, { fontVariant: ['tabular-nums'] }]}>
              {formatCurrency(item.value)}
            </ThemedText>
            <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
              {item.startDate} → {item.endDate}
            </ThemedText>
            {item.renewalDate && (
              <ThemedText
                style={[
                  s.listCardSub,
                  { color: item.status === 'expiring' ? '#F59E0B' : colors.textTertiary },
                ]}
              >
                Renewal: {item.renewalDate}{item.status === 'expiring' ? ' (soon)' : ''}
              </ThemedText>
            )}
            <View style={s.contractBottomRow}>
              <ContractStatusBadge status={item.status} />
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 8: Purchasing ===
  const renderPurchasing = () => (
    <FlatList<FinancePurchaseRequest>
      data={data.purchasing}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="cart" text="No purchase requests" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <View style={s.purchaseTopRow}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.category}</ThemedText>
              </View>
            </View>
            <View style={s.purchasePersonRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.requestedByInitials}</ThemedText>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.requestedBy}</ThemedText>
            </View>
            <ThemedText style={[s.purchaseAmount, { fontVariant: ['tabular-nums'] }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
            <View style={s.purchaseBottomRow}>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.submittedAt}</ThemedText>
              <FinanceStatusBadge status={item.status} />
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 9: Payroll / Stipends ===
  const renderPayroll = () => (
    <FlatList<FinancePayrollItem>
      data={data.payroll}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="person.2" text="No payroll items" colors={colors} />}
      renderItem={({ item }) => {
        const typeColor = PAYROLL_TYPE_COLOR[item.type] ?? '#A1A1AA';
        return (
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.payeeInitials}</ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <ThemedText style={s.listCardTitle}>{item.payee}</ThemedText>
                <View style={s.payrollMetaRow}>
                  <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.period}</ThemedText>
                  <View style={[s.badge, { backgroundColor: typeColor + '20' }]}>
                    <ThemedText style={[s.badgeText, { color: typeColor }]}>{item.type}</ThemedText>
                  </View>
                </View>
                <View style={s.payrollBottomRow}>
                  <ThemedText style={[s.payrollAmount, { fontVariant: ['tabular-nums'] }]}>
                    {formatCurrency(item.amount)}
                  </ThemedText>
                  <FinanceStatusBadge status={item.status} />
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );

  // === Tab 10: Reimbursements ===
  const renderReimbursements = () => (
    <FlatList<FinanceReimbursement>
      data={data.reimbursements}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="arrow.uturn.left.circle" text="No reimbursements" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>{item.claimantInitials}</ThemedText>
            </View>
            <View style={s.listCardInfo}>
              <ThemedText style={s.listCardTitle}>{item.claimant}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.description}
              </ThemedText>
              <View style={s.reimbursementAmountRow}>
                <ThemedText style={[s.reimbursementAmount, { fontVariant: ['tabular-nums'] }]}>
                  {formatCurrency(item.amount)}
                </ThemedText>
                <View style={s.receiptIndicator}>
                  <IconSymbol name="paperclip" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.receiptCount, { color: colors.textTertiary, fontVariant: ['tabular-nums'] }]}>
                    {item.receipts}
                  </ThemedText>
                </View>
              </View>
              <View style={s.reimbursementBottomRow}>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>{item.submittedAt}</ThemedText>
                <FinanceStatusBadge status={item.status} />
              </View>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 11: Reporting ===
  const renderReporting = () => (
    <FlatList<FinanceReport>
      data={data.reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="chart.bar.fill" text="No reports" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.listIconCircle, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name="chart.bar.fill" size={16} color={accentColor} />
            </View>
            <View style={s.listCardInfo}>
              <View style={s.reportTopRow}>
                <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.type}</ThemedText>
                </View>
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                {item.period} · Generated {item.generatedAt}
              </ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>{item.owner}</ThemedText>
              <Pressable
                style={({ pressed }) => [
                  s.exportBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="square.and.arrow.up" size={12} color={accentColor} />
                <ThemedText style={[s.exportBtnText, { color: accentColor }]}>Export</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 12: Controls ===
  const renderControls = () => (
    <FlatList<FinanceControl>
      data={data.controls}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="slider.horizontal.3" text="No controls configured" colors={colors} />}
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.controlRow}>
            <View style={s.controlInfo}>
              <ThemedText style={s.listCardTitle}>{item.title}</ThemedText>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <View style={s.controlMetaRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.category}</ThemedText>
                </View>
                {item.threshold != null && (
                  <ThemedText style={[s.controlThreshold, { color: colors.textTertiary, fontVariant: ['tabular-nums'] }]}>
                    {formatCurrency(item.threshold)}
                  </ThemedText>
                )}
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
  const renderAudit = () => {
    const sorted = [...data.audit].sort((a, b) => b.timestampMs - a.timestampMs);
    return (
      <FlatList<FinanceAuditEntry>
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={<EmptyState icon="clock.fill" text="No audit entries" colors={colors} />}
        renderItem={({ item }) => {
          const aColor = auditEntryColor(item.action);
          const aIcon = auditEntryIcon(item.action);
          return (
            <View style={s.auditRow}>
              <View style={[s.auditIconCircle, { backgroundColor: aColor + '20' }]}>
                <IconSymbol name={aIcon as any} size={14} color={aColor} />
              </View>
              <View style={s.auditInfo}>
                <ThemedText style={s.auditDesc}>{item.description}</ThemedText>
                <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                  {item.actor} · {formatTimestamp(item.timestampMs)}
                </ThemedText>
              </View>
            </View>
          );
        }}
      />
    );
  };

  // === Tab 14: Settings ===
  const renderSettings = () => (
    <View style={s.tabContent}>
      <ThemedText style={[s.settingsHeader, { color: colors.textSecondary }]}>
        {MODE_LABELS[mode]} Finance Settings
      </ThemedText>
      <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.settingsRow}>
          <ThemedText style={s.settingsLabel}>Require approval above threshold</ThemedText>
          <Switch
            value={settingApprovalThreshold}
            onValueChange={setSettingApprovalThreshold}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={settingApprovalThreshold ? accentColor : colors.textTertiary}
          />
        </View>
        <View style={[s.settingsDivider, { backgroundColor: colors.divider }]} />
        <View style={s.settingsRow}>
          <ThemedText style={s.settingsLabel}>Auto-export monthly reports</ThemedText>
          <Switch
            value={settingAutoExport}
            onValueChange={setSettingAutoExport}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={settingAutoExport ? accentColor : colors.textTertiary}
          />
        </View>
        <View style={[s.settingsDivider, { backgroundColor: colors.divider }]} />
        <View style={s.settingsRow}>
          <ThemedText style={s.settingsLabel}>Enable evidence requirements</ThemedText>
          <Switch
            value={settingEvidenceRequired}
            onValueChange={setSettingEvidenceRequired}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={settingEvidenceRequired ? accentColor : colors.textTertiary}
          />
        </View>
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
          <ThemedText style={s.headerTitle}>Finance</ThemedText>
          <View style={s.headerActions}>
            <Pressable
              style={({ pressed }) => [s.filterBtn, pressed && { opacity: 0.7 }]}
              onPress={handleFilterToggle}
            >
              <IconSymbol name="slider.horizontal.3" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.createBtn, { backgroundColor: accentColor }, pressed && { opacity: 0.8 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="plus" size={14} color="#000" />
              <ThemedText style={s.createBtnText}>Create</ThemedText>
            </Pressable>
          </View>
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
            placeholder="Search finance..."
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
        {FINANCE_TABS.map((tab) => (
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
        title="Filter Finance"
        useModal
      >
        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Sort</ThemedText>
          {([
            { key: 'recent-activity' as FinanceSortOption, label: 'Recent activity' },
            { key: 'due-soonest' as FinanceSortOption, label: 'Due soonest' },
            { key: 'largest-amount' as FinanceSortOption, label: 'Largest amount' },
            { key: 'a-z' as FinanceSortOption, label: 'A\u2013Z' },
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

        <View style={s.filterSection}>
          <ThemedText style={[s.filterSectionTitle, { color: colors.textSecondary }]}>Status</ThemedText>
          <View style={s.filterChipsWrap}>
            {(['pending', 'approved', 'paid', 'overdue', 'rejected', 'draft'] as FinanceStatus[]).map((st) => {
              const fg = FINANCE_STATUS_COLOR[st];
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
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

  // === Dashboard ===
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dashboardCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  dashIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  dashValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dashSub: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

  // === Quick Stats ===
  quickStatsRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.sm,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
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
  listIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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

  // === Amount ===
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // === Budgets ===
  budgetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  budgetAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  budgetAmountText: {
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },

  // === Ledger ===
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  ledgerDateCol: {
    width: 70,
  },
  ledgerDate: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  ledgerInfoCol: {
    flex: 1,
    gap: 4,
  },
  ledgerDescRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ledgerDesc: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  ledgerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ledgerScope: {
    fontSize: 11,
  },

  // === Approvals ===
  approvalTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  approvalTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  approvalAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  approvalPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  approversList: {
    fontSize: 11,
  },
  approvalBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  approveBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  rejectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // === Payables ===
  payableTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  payableRef: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  payableDescRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  payableAmountBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  payableBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Receivables ===
  receivableAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  receivableBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  receivableDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  // === Contracts ===
  contractValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  contractBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  // === Purchasing ===
  purchaseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  purchasePersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  purchaseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  purchaseBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Payroll ===
  payrollMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  payrollAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  payrollBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Reimbursements ===
  reimbursementAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reimbursementAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  receiptIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  receiptCount: {
    fontSize: 11,
  },
  reimbursementBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  // === Reporting ===
  reportTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
  auditDesc: {
    fontSize: 13,
    fontWeight: '500',
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
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
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
