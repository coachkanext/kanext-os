/**
 * Education Organization Finance v2 — Institutional finance hub.
 * Sub-tabs: Overview | Ledger Truth | Budgets | Receivables | Payables | Aid & Awards | Approvals | Audit
 * RBAC: E4/E5 locked; E3 limited (Overview + Budgets + Receivables only); E1/E2 full 8-tab access.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel } from '@/utils/education-rbac';
import {
  getEduFinanceData,
  getReceivableById,
  getPayableById,
  getAidAwardById,
  getLedgerPostingById,
  EDU_FUND_TYPE_LABELS,
  EDU_FUND_TYPE_COLORS,
  RECEIVABLE_TYPE_LABELS,
  RECEIVABLE_TYPE_COLORS,
  PAYABLE_TYPE_LABELS,
  PAYABLE_TYPE_COLORS,
  AID_TYPE_LABELS,
  AID_TYPE_COLORS,
  POSTING_STATE_LABELS,
  POSTING_STATE_COLORS,
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
  AUDIT_EVIDENCE_LABELS,
  AUDIT_EVIDENCE_COLORS,
  TERM_WINDOW_LABELS,
} from '@/data/mock-edu-org-finance';
import type {
  EduFinanceTruthStrip,
  TermSnapshot,
  NeedsDecisionItem,
  DepartmentBudget,
  BudgetLineItem,
  LedgerPosting,
  Receivable,
  Payable,
  AidAward,
  FinanceApprovalItem,
  AuditRecord,
  ExceptionRiskItem,
  EduFundType,
  PostingState,
  AidType,
  ApprovalStatus,
  AuditEvidenceStatus,
} from '@/data/mock-edu-org-finance';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'ledger', label: 'Ledger Truth' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'receivables', label: 'Receivables' },
  { id: 'payables', label: 'Payables' },
  { id: 'aid', label: 'Aid & Awards' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'audit', label: 'Audit' },
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

function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    const m = amount / 1000000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `$${amount}`;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  const hours = d.getUTCHours();
  const mins = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${month} ${day}, ${h}:${mins} ${ampm}`;
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
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getEduFinanceData>;
}) {
  const { truthStrip, termSnapshots, needsDecision, departmentBudgets, exceptionRisks } = data;

  // KPI Tiles
  const healthTiles = [
    { icon: 'banknote.fill', label: 'Cash Position', value: formatCompactCurrency(truthStrip.cashPosition), color: accentColor },
    { icon: 'lock.fill', label: 'Commitments', value: formatCompactCurrency(truthStrip.commitments), color: '#F59E0B' },
    { icon: 'arrow.down.circle.fill', label: 'Receivables', value: formatCompactCurrency(truthStrip.receivables), color: '#6AA9FF' },
    { icon: 'arrow.up.circle.fill', label: 'Payables', value: formatCompactCurrency(truthStrip.payables), color: '#EF4444' },
    { icon: 'exclamationmark.triangle.fill', label: 'Holds', value: String(truthStrip.holds), color: '#F59E0B' },
    { icon: 'checkmark.shield.fill', label: 'Audit', value: `${truthStrip.auditCompleteness}%`, color: '#22C55E' },
  ];

  const urgencyColors: Record<string, string> = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#6AA9FF',
  };

  const getBurnColor = (burn: number): string => {
    if (burn > 90) return '#EF4444';
    if (burn > 80) return '#F59E0B';
    return '#22C55E';
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Block A: Truth Strip — 6 KPI tiles in 3x2 grid */}
      <View style={s.healthGrid}>
        {healthTiles.map((tile, i) => (
          <View key={`ht-${i}`} style={[s.healthTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={tile.icon as any} size={16} color={tile.color} />
            <ThemedText style={[s.healthTileValue, { color: tile.color }]}>{tile.value}</ThemedText>
            <ThemedText style={[s.healthTileLabel, { color: colors.textSecondary }]}>{tile.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Block B: Term Snapshots */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Term Snapshots</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Institution performance by term
      </ThemedText>

      {termSnapshots.map((snap) => (
        <View
          key={snap.id}
          style={[s.fundSnapshotCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.fundSnapshotTop}>
            <View style={[s.fundIconCircle, { backgroundColor: accentColor + '18' }]}>
              <IconSymbol name="building.2.fill" size={16} color={accentColor} />
            </View>
            <ThemedText style={[s.fundSnapshotName, { color: colors.text }]} numberOfLines={1}>
              {snap.institution}
            </ThemedText>
            <StatusBadge label={TERM_WINDOW_LABELS[snap.term].toUpperCase()} color={accentColor} />
          </View>
          <View style={s.fundSnapshotValues}>
            <View style={s.fundSnapshotValueItem}>
              <ThemedText style={[s.fundSnapshotAmount, { color: colors.text }]}>
                {snap.enrollment.toLocaleString()}
              </ThemedText>
              <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Enrolled</ThemedText>
            </View>
            <View style={s.fundSnapshotValueItem}>
              <ThemedText style={[s.fundSnapshotAmount, { color: '#22C55E' }]}>
                {formatCompactCurrency(snap.tuitionRevenue)}
              </ThemedText>
              <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Tuition Rev</ThemedText>
            </View>
            <View style={s.fundSnapshotValueItem}>
              <ThemedText style={[s.fundSnapshotAmount, { color: '#F59E0B' }]}>
                {formatCompactCurrency(snap.aidDisbursed)}
              </ThemedText>
              <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Aid Disbursed</ThemedText>
            </View>
          </View>
          <View style={[s.fundSnapshotValues, { marginTop: Spacing.sm }]}>
            <View style={s.fundSnapshotValueItem}>
              <ThemedText style={[s.fundSnapshotAmount, { color: snap.netPosition >= 0 ? '#22C55E' : '#EF4444' }]}>
                {formatCompactCurrency(snap.netPosition)}
              </ThemedText>
              <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Net Position</ThemedText>
            </View>
            <View style={s.fundSnapshotValueItem}>
              <ThemedText style={[s.fundSnapshotAmount, { color: '#8B5CF6' }]}>
                {formatCompactCurrency(snap.housingRevenue)}
              </ThemedText>
              <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Housing Rev</ThemedText>
            </View>
            <View style={s.fundSnapshotValueItem}>
              <ThemedText style={[s.fundSnapshotAmount, { color: '#EF4444' }]}>
                {formatCompactCurrency(snap.operatingExpenses)}
              </ThemedText>
              <ThemedText style={[s.fundSnapshotAmountLabel, { color: colors.textTertiary }]}>Op Expenses</ThemedText>
            </View>
          </View>
        </View>
      ))}

      {/* Block C: Needs Decision Queue */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Needs Decision
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Items requiring action, ordered by urgency
      </ThemedText>

      {needsDecision.map((item) => {
        const dotColor = urgencyColors[item.urgency] || '#8F8F8F';
        return (
          <View
            key={item.id}
            style={[s.commitmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.commitmentHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
                <View style={[s.actionDot, { backgroundColor: dotColor }]} />
                <ThemedText style={[s.commitmentTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
              </View>
              <StatusBadge label={item.urgency.toUpperCase()} color={dotColor} />
            </View>
            <ThemedText style={[s.commitmentAmount, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
            <View style={s.commitmentMeta}>
              <View style={s.commitmentMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.commitmentMetaText, { color: colors.textTertiary }]}>
                  {item.owner}
                </ThemedText>
              </View>
              <View style={s.commitmentMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.commitmentMetaText, { color: colors.textTertiary }]}>
                  Due {formatDate(item.dueDate)}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[s.commitmentPayeeText, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
          </View>
        );
      })}

      {/* Block D: Department Budget Summary */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Department Budgets
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Consumption and forecast burn
      </ThemedText>

      <View style={s.healthGrid}>
        {departmentBudgets.map((dept) => {
          const consumedPct = dept.totalBudgeted > 0
            ? Math.round(((dept.totalSpent + dept.totalCommitted) / dept.totalBudgeted) * 100)
            : 0;
          const burnColor = getBurnColor(dept.forecastBurn);
          return (
            <View
              key={dept.id}
              style={[s.healthTile, { backgroundColor: colors.card, borderColor: colors.border, width: '48%' }]}
            >
              <ThemedText style={[s.healthTileLabel, { color: colors.text, fontWeight: '600', fontSize: 12 }]} numberOfLines={1}>
                {dept.department}
              </ThemedText>
              <ProgressBar percent={consumedPct} color={burnColor} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <ThemedText style={[s.healthTileValue, { color: burnColor, fontSize: 14 }]}>
                  {consumedPct}%
                </ThemedText>
                <ThemedText style={[s.healthTileLabel, { color: colors.textTertiary, fontSize: 9 }]}>consumed</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <View style={[s.actionDot, { backgroundColor: burnColor, width: 6, height: 6, borderRadius: 3 }]} />
                <ThemedText style={[s.healthTileLabel, { color: burnColor, fontSize: 9 }]}>
                  Burn: {dept.forecastBurn}%
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Block E: Exceptions & Risk */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Exceptions & Risk
      </ThemedText>

      {exceptionRisks.map((risk) => {
        const severityColors: Record<string, string> = {
          critical: '#EF4444',
          warning: '#F59E0B',
          info: '#6AA9FF',
        };
        const sevColor = severityColors[risk.severity] || '#8F8F8F';
        return (
          <View
            key={risk.id}
            style={[
              s.sectionCard,
              {
                backgroundColor: risk.severity === 'critical' ? '#EF444408' : colors.card,
                borderColor: risk.severity === 'critical' ? '#EF444430' : colors.border,
                marginBottom: Spacing.sm,
              },
            ]}
          >
            <View style={s.sectionCardHeader}>
              <StatusBadge label={risk.severity.toUpperCase()} color={sevColor} />
              <ThemedText style={[s.sectionCardTitle, { color: colors.text }]} numberOfLines={1}>
                {risk.title}
              </ThemedText>
            </View>
            <ThemedText style={[s.commitmentPayeeText, { color: colors.textSecondary }]} numberOfLines={3}>
              {risk.description}
            </ThemedText>
            <View style={[s.commitmentMeta, { marginTop: Spacing.sm }]}>
              <View style={s.commitmentMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.commitmentMetaText, { color: colors.textTertiary }]}>
                  {risk.owner}
                </ThemedText>
              </View>
              <StatusBadge label={risk.category.toUpperCase()} color={sevColor} />
            </View>
          </View>
        );
      })}

      {exceptionRisks.length === 0 && (
        <EmptyState icon="checkmark.shield.fill" label="No exceptions or risks" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// LEDGER TRUTH SUB-TAB
// =============================================================================

function LedgerTruthTab({
  colors,
  accentColor,
  postings,
  onSelectPosting,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  postings: LedgerPosting[];
  onSelectPosting: (posting: LedgerPosting) => void;
}) {
  const [stateFilter, setStateFilter] = useState<string>('all');
  const filterOptions = ['all', 'posted', 'pending', 'held', 'reversed'] as const;

  const filtered = useMemo(() => {
    let list = [...postings].sort((a, b) => b.date.localeCompare(a.date));
    if (stateFilter !== 'all') {
      list = list.filter((p) => p.state === stateFilter);
    }
    return list;
  }, [postings, stateFilter]);

  const renderItem = useCallback(
    ({ item }: { item: LedgerPosting }) => {
      const stateColor = POSTING_STATE_COLORS[item.state];
      const stateLabel = POSTING_STATE_LABELS[item.state];
      const fundColor = EDU_FUND_TYPE_COLORS[item.fundType];
      const fundLabel = EDU_FUND_TYPE_LABELS[item.fundType];

      return (
        <Pressable
          style={[s.fundCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPosting(item);
          }}
        >
          <View style={s.fundCardTop}>
            <View style={[s.fundIconCircle, { backgroundColor: stateColor + '18' }]}>
              <IconSymbol name="doc.text.fill" size={18} color={stateColor} />
            </View>
            <View style={s.fundNameCol}>
              <ThemedText style={[s.fundName, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <View style={s.fundBadgeRow}>
                <StatusBadge label={stateLabel.toUpperCase()} color={stateColor} />
                <StatusBadge label={fundLabel.toUpperCase()} color={fundColor} />
              </View>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>

          <View style={[s.fundValuesRow, { borderTopColor: colors.border }]}>
            <View style={s.fundValueItem}>
              <ThemedText style={[s.fundValueAmount, { color: colors.text }]}>
                {formatCurrency(item.amount)}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>Amount</ThemedText>
            </View>
            <View style={s.fundValueItem}>
              <ThemedText style={[s.fundValueAmount, { color: colors.textSecondary }]} numberOfLines={1}>
                {formatDate(item.date)}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>Date</ThemedText>
            </View>
            <View style={s.fundValueItem}>
              <ThemedText style={[s.fundValueAmount, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.institution.split(' ')[0]}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>Institution</ThemedText>
            </View>
          </View>

          <View style={s.fundMetaRow}>
            <View style={s.fundMetaItem}>
              <IconSymbol name="arrow.right.circle.fill" size={11} color="#22C55E" />
              <ThemedText style={[s.fundMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                DR: {item.debitAccount}
              </ThemedText>
            </View>
            <View style={s.fundMetaItem}>
              <IconSymbol name="arrow.left.circle.fill" size={11} color="#6AA9FF" />
              <ThemedText style={[s.fundMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                CR: {item.creditAccount}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, onSelectPosting],
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.filterChipRow, { paddingHorizontal: Spacing.md }]}
        style={{ flexGrow: 0 }}
      >
        {filterOptions.map((opt) => {
          const isActive = opt === stateFilter;
          const label = opt === 'all' ? 'All' : POSTING_STATE_LABELS[opt as PostingState];
          return (
            <Pressable
              key={opt}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStateFilter(opt);
              }}
            >
              <ThemedText
                style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="doc.text.fill" label="No ledger postings match filter" colors={colors} />
        }
      />
    </View>
  );
}

// =============================================================================
// BUDGETS SUB-TAB
// =============================================================================

function BudgetsTab({
  colors,
  accentColor,
  budgets,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  budgets: DepartmentBudget[];
  role: EducationRoleLens;
}) {
  const filtered = useMemo(() => {
    let list = budgets;
    // E3 sees only their department budgets (simulated: first 2 budgets)
    if (role === 'E3') {
      list = list.slice(0, 2);
    }
    return list;
  }, [budgets, role]);

  const getBudgetColor = (spent: number, budgeted: number): string => {
    const ratio = budgeted > 0 ? spent / budgeted : 0;
    if (ratio > 1) return '#EF4444';
    if (ratio >= 0.8) return '#F59E0B';
    return '#22C55E';
  };

  const getBurnColor = (burn: number): string => {
    if (burn > 90) return '#EF4444';
    if (burn > 80) return '#F59E0B';
    return '#22C55E';
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {filtered.map((budget) => {
        const overallColor = getBudgetColor(budget.totalSpent, budget.totalBudgeted);
        const burnColor = getBurnColor(budget.forecastBurn);
        const fundColor = EDU_FUND_TYPE_COLORS[budget.fundType];
        const fundLabel = EDU_FUND_TYPE_LABELS[budget.fundType];

        return (
          <View
            key={budget.id}
            style={[s.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.budgetCardHeader}>
              <View style={s.budgetNameCol}>
                <ThemedText style={[s.budgetName, { color: colors.text }]} numberOfLines={1}>
                  {budget.department}
                </ThemedText>
                <View style={s.budgetBadgeRow}>
                  <StatusBadge label={budget.institution.split(' ')[0].toUpperCase()} color={accentColor} />
                  <StatusBadge label={budget.period.toUpperCase()} color="#6AA9FF" />
                </View>
              </View>
              <View style={s.budgetTotalCol}>
                <ThemedText style={[s.budgetTotalValue, { color: overallColor }]}>
                  {formatCurrency(budget.totalSpent)}
                </ThemedText>
                <ThemedText style={[s.budgetTotalLabel, { color: colors.textTertiary }]}>
                  of {formatCurrency(budget.totalBudgeted)}
                </ThemedText>
              </View>
            </View>

            {/* Fund Badge & Forecast Burn */}
            <View style={s.budgetFundRow}>
              <IconSymbol name="banknote.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.budgetFundText, { color: colors.textTertiary }]}>
                Fund: {fundLabel}
              </ThemedText>
              <View style={{ flex: 1 }} />
              <View style={[s.actionDot, { backgroundColor: burnColor, width: 6, height: 6, borderRadius: 3 }]} />
              <ThemedText style={[s.budgetFundText, { color: burnColor, fontWeight: '600' }]}>
                Burn: {budget.forecastBurn}%
              </ThemedText>
            </View>

            {/* Line Items */}
            {budget.lineItems.map((item, itemIdx) => {
              const pct = item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0;
              const itemColor = getBudgetColor(item.spent, item.budgeted);
              const remaining = item.budgeted - item.spent - item.committed;
              return (
                <View
                  key={item.id}
                  style={[
                    s.budgetCategoryRow,
                    itemIdx < budget.lineItems.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={s.budgetCategoryNameRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ThemedText style={[s.budgetCategoryName, { color: colors.text }]}>
                        {item.name}
                      </ThemedText>
                      {item.hardCap && (
                        <StatusBadge label="HARD CAP" color="#EF4444" />
                      )}
                      {!item.hardCap && (
                        <StatusBadge label="SOFT CAP" color="#F59E0B" />
                      )}
                    </View>
                    <ThemedText style={[s.budgetCategoryCap, { color: colors.textTertiary }]}>
                      {formatCurrency(item.budgeted)}
                    </ThemedText>
                  </View>
                  <ProgressBar percent={pct} color={itemColor} />
                  <View style={s.budgetCategoryValues}>
                    <ThemedText style={[s.budgetCategoryValueText, { color: itemColor }]}>
                      Spent: {formatCurrency(item.spent)}
                    </ThemedText>
                    <ThemedText style={[s.budgetCategoryValueText, { color: '#F59E0B' }]}>
                      Cmtd: {formatCurrency(item.committed)}
                    </ThemedText>
                    <ThemedText style={[s.budgetCategoryValueText, { color: remaining >= 0 ? '#22C55E' : '#EF4444' }]}>
                      Rem: {formatCurrency(remaining)}
                    </ThemedText>
                  </View>
                </View>
              );
            })}

            {/* Variance Note */}
            {budget.varianceNote && (
              <View style={s.varianceNoteRow}>
                <IconSymbol name="info.circle.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.varianceNoteText, { color: colors.textSecondary }]}>
                  {budget.varianceNote}
                </ThemedText>
              </View>
            )}
          </View>
        );
      })}

      {filtered.length === 0 && (
        <EmptyState icon="chart.bar.fill" label="No budgets available" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// RECEIVABLES SUB-TAB
// =============================================================================

function ReceivablesTab({
  colors,
  accentColor,
  receivables,
  role,
  onSelectReceivable,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  receivables: Receivable[];
  role: EducationRoleLens;
  onSelectReceivable: (receivable: Receivable) => void;
}) {
  const filtered = useMemo(() => {
    let list = receivables;
    // E3 sees a subset (simulated: first 5)
    if (role === 'E3') {
      list = list.slice(0, 5);
    }
    return list;
  }, [receivables, role]);

  const statusColors: Record<string, string> = {
    outstanding: '#F59E0B',
    partial: '#6AA9FF',
    paid: '#22C55E',
    overdue: '#EF4444',
    waived: '#8F8F8F',
  };

  const statusLabels: Record<string, string> = {
    outstanding: 'Outstanding',
    partial: 'Partial',
    paid: 'Paid',
    overdue: 'Overdue',
    waived: 'Waived',
  };

  const renderItem = useCallback(
    ({ item }: { item: Receivable }) => {
      const typeColor = RECEIVABLE_TYPE_COLORS[item.type];
      const typeLabel = RECEIVABLE_TYPE_LABELS[item.type];
      const sColor = statusColors[item.status] || '#8F8F8F';
      const sLabel = statusLabels[item.status] || item.status;

      return (
        <Pressable
          style={[s.expenseRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectReceivable(item);
          }}
        >
          <View style={[s.expenseIconCircle, { backgroundColor: typeColor + '18' }]}>
            <IconSymbol name="person.crop.circle.fill" size={16} color={typeColor} />
          </View>
          <View style={s.expenseTextCol}>
            <ThemedText style={[s.expenseTitle, { color: colors.text }]} numberOfLines={1}>
              {item.studentName}
            </ThemedText>
            <View style={s.expenseBadgeRow}>
              <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
              <StatusBadge label={sLabel.toUpperCase()} color={sColor} />
              {item.holdFlag && (
                <StatusBadge label="HOLD" color="#EF4444" />
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <ThemedText style={[s.expenseDate, { color: colors.textTertiary }]}>
                {item.studentId}
              </ThemedText>
              <ThemedText style={[s.expenseDate, { color: colors.textTertiary }]}>
                Due {formatDate(item.dueDate)}
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <StatusBadge label={item.institution.split(' ')[0].toUpperCase()} color={accentColor} />
              <StatusBadge label={TERM_WINDOW_LABELS[item.term].toUpperCase()} color="#6AA9FF" />
            </View>
            {item.holdFlag && item.holdReason && (
              <View style={s.holdWarning}>
                <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#EF4444" />
                <ThemedText style={[s.holdWarningText, { color: '#EF4444' }]} numberOfLines={2}>
                  {item.holdReason}
                </ThemedText>
              </View>
            )}
          </View>
          <View style={s.expenseRight}>
            <ThemedText style={[s.expenseAmount, { color: colors.text }]}>
              {formatCurrency(item.amount)}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectReceivable],
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.down.circle.fill" label="No receivables" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PAYABLES SUB-TAB
// =============================================================================

function PayablesTab({
  colors,
  accentColor,
  payables,
  onSelectPayable,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  payables: Payable[];
  onSelectPayable: (payable: Payable) => void;
}) {
  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    approved: '#22C55E',
    scheduled: '#6AA9FF',
    paid: '#22C55E',
    held: '#EF4444',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    scheduled: 'Scheduled',
    paid: 'Paid',
    held: 'Held',
  };

  const renderItem = useCallback(
    ({ item }: { item: Payable }) => {
      const typeColor = PAYABLE_TYPE_COLORS[item.type];
      const typeLabel = PAYABLE_TYPE_LABELS[item.type];
      const fundColor = EDU_FUND_TYPE_COLORS[item.fundType];
      const fundLabel = EDU_FUND_TYPE_LABELS[item.fundType];
      const sColor = statusColors[item.status] || '#8F8F8F';
      const sLabel = statusLabels[item.status] || item.status;
      const docsPct = item.docsRequired > 0 ? (item.docsComplete / item.docsRequired) * 100 : 0;
      const docsColor = docsPct >= 100 ? '#22C55E' : docsPct >= 60 ? '#F59E0B' : '#EF4444';

      return (
        <Pressable
          style={[s.fundCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPayable(item);
          }}
        >
          <View style={s.fundCardTop}>
            <View style={[s.fundIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name="building.fill" size={18} color={typeColor} />
            </View>
            <View style={s.fundNameCol}>
              <ThemedText style={[s.fundName, { color: colors.text }]} numberOfLines={1}>
                {item.vendorName}
              </ThemedText>
              <View style={s.fundBadgeRow}>
                <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
                <StatusBadge label={sLabel.toUpperCase()} color={sColor} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <ThemedText style={[s.fundValueAmount, { color: colors.text }]}>
                {formatCurrency(item.amount)}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>
                Due {formatDate(item.dueDate)}
              </ThemedText>
            </View>
          </View>

          {/* Docs Progress */}
          <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>
                Docs: {item.docsComplete}/{item.docsRequired}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: docsColor }]}>
                {Math.round(docsPct)}%
              </ThemedText>
            </View>
            <ProgressBar percent={docsPct} color={docsColor} />
          </View>

          {/* Approval Chain Dots */}
          <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {item.approvalChain.map((step, i) => {
                const stepColor = APPROVAL_STATUS_COLORS[step.status];
                return (
                  <View key={`step-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <View style={[s.approvalChainDot, { backgroundColor: stepColor }]} />
                    <ThemedText style={{ fontSize: 9, color: colors.textTertiary }} numberOfLines={1}>
                      {step.name.split(' ')[0]}
                    </ThemedText>
                    {i < item.approvalChain.length - 1 && (
                      <View style={{ width: 8, height: 1, backgroundColor: colors.border }} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Fund / Institution Tags */}
          <View style={s.fundMetaRow}>
            <View style={s.fundMetaItem}>
              <StatusBadge label={fundLabel.toUpperCase()} color={fundColor} />
            </View>
            <View style={s.fundMetaItem}>
              <StatusBadge label={item.institution.split(' ')[0].toUpperCase()} color={accentColor} />
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectPayable],
  );

  return (
    <FlatList
      data={payables}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.up.circle.fill" label="No payables" colors={colors} />
      }
    />
  );
}

// =============================================================================
// AID & AWARDS SUB-TAB
// =============================================================================

function AidAwardsTab({
  colors,
  accentColor,
  awards,
  onSelectAid,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  awards: AidAward[];
  onSelectAid: (award: AidAward) => void;
}) {
  const [aidFilter, setAidFilter] = useState<string>('all');
  const filterOptions = ['all', 'merit', 'need', 'athletic', 'pell', 'state', 'external', 'work_study'] as const;

  const filtered = useMemo(() => {
    if (aidFilter === 'all') return awards;
    return awards.filter((a) => a.aidType === aidFilter);
  }, [awards, aidFilter]);

  const renderItem = useCallback(
    ({ item }: { item: AidAward }) => {
      const aidColor = AID_TYPE_COLORS[item.aidType];
      const aidLabel = AID_TYPE_LABELS[item.aidType];

      return (
        <Pressable
          style={[s.fundCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectAid(item);
          }}
        >
          <View style={s.fundCardTop}>
            <View style={[s.fundIconCircle, { backgroundColor: aidColor + '18' }]}>
              <IconSymbol name="dollarsign.circle.fill" size={18} color={aidColor} />
            </View>
            <View style={s.fundNameCol}>
              <ThemedText style={[s.fundName, { color: colors.text }]} numberOfLines={1}>
                {item.studentName}
              </ThemedText>
              <View style={s.fundBadgeRow}>
                <StatusBadge label={aidLabel.toUpperCase()} color={aidColor} />
                <StatusBadge label={TERM_WINDOW_LABELS[item.term].toUpperCase()} color="#6AA9FF" />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <ThemedText style={[s.fundValueAmount, { color: colors.text }]}>
                {formatCurrency(item.amount)}
              </ThemedText>
            </View>
          </View>

          {/* Student ID & Institution */}
          <View style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>
                {item.studentId}
              </ThemedText>
              <StatusBadge label={item.institution.split(' ')[0].toUpperCase()} color={accentColor} />
            </View>
          </View>

          {/* Eligibility Rules */}
          <View style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.sm }}>
            {item.eligibilityRules.map((rule, i) => (
              <View key={`rule-${i}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
                <IconSymbol name="checkmark.circle.fill" size={11} color="#22C55E" />
                <ThemedText style={{ fontSize: 11, color: colors.textSecondary, flex: 1 }}>
                  {rule}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Disbursement Status */}
          <View style={[s.fundValuesRow, { borderTopColor: colors.border }]}>
            <View style={s.fundValueItem}>
              <ThemedText style={[s.fundValueAmount, { color: colors.textSecondary }]}>
                {formatDate(item.disbursementDate)}
              </ThemedText>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>Disbursement</ThemedText>
            </View>
            <View style={s.fundValueItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconSymbol
                  name={item.disbursed ? 'checkmark.circle.fill' : 'clock.fill'}
                  size={14}
                  color={item.disbursed ? '#22C55E' : '#F59E0B'}
                />
                <ThemedText style={[s.fundValueAmount, { color: item.disbursed ? '#22C55E' : '#F59E0B' }]}>
                  {item.disbursed ? 'Disbursed' : 'Pending'}
                </ThemedText>
              </View>
              <ThemedText style={[s.fundValueLabel, { color: colors.textTertiary }]}>Status</ThemedText>
            </View>
          </View>

          {/* Compliance Tags */}
          <View style={s.fundMetaRow}>
            {item.complianceTags.map((tag, i) => (
              <StatusBadge key={`tag-${i}`} label={tag.toUpperCase()} color="#22C55E" />
            ))}
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectAid],
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.filterChipRow, { paddingHorizontal: Spacing.md }]}
        style={{ flexGrow: 0 }}
      >
        {filterOptions.map((opt) => {
          const isActive = opt === aidFilter;
          const label = opt === 'all' ? 'All' : AID_TYPE_LABELS[opt as AidType];
          return (
            <Pressable
              key={opt}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAidFilter(opt);
              }}
            >
              <ThemedText
                style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="dollarsign.circle.fill" label="No aid awards match filter" colors={colors} />
        }
      />
    </View>
  );
}

// =============================================================================
// APPROVALS SUB-TAB
// =============================================================================

function ApprovalsTab({
  colors,
  accentColor,
  approvalItems,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  approvalItems: FinanceApprovalItem[];
}) {
  const approvalQueue = useMemo(
    () => approvalItems.filter((item) => item.status === 'pending' || item.status === 'escalated'),
    [approvalItems],
  );
  const releaseQueue = useMemo(
    () => approvalItems.filter((item) => item.status === 'approved'),
    [approvalItems],
  );

  const renderApprovalItem = (item: FinanceApprovalItem, queueType: 'approval' | 'release') => {
    const fundColor = EDU_FUND_TYPE_COLORS[item.fundType];
    const fundLabel = EDU_FUND_TYPE_LABELS[item.fundType];
    const statusColor = APPROVAL_STATUS_COLORS[item.status];
    const statusLabel = APPROVAL_STATUS_LABELS[item.status];
    const indicatorColor = queueType === 'approval' ? '#F59E0B' : '#6AA9FF';
    const indicatorLabel = queueType === 'approval' ? 'Needs Approval' : 'Needs Release';

    return (
      <View
        key={item.id}
        style={[s.approvalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={s.approvalHeader}>
          <ThemedText style={[s.approvalAmount, { color: colors.text }]}>
            {formatCurrency(item.amount)}
          </ThemedText>
          <StatusBadge label={indicatorLabel.toUpperCase()} color={indicatorColor} />
        </View>
        <ThemedText style={[s.commitmentTitle, { color: colors.text, marginBottom: Spacing.sm }]} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <View style={s.approvalBadgeRow}>
          <StatusBadge label={fundLabel.toUpperCase()} color={fundColor} />
          <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        </View>
        <View style={s.approvalMeta}>
          <View style={s.approvalMetaItem}>
            <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.approvalMetaText, { color: colors.textTertiary }]}>
              {item.requestor}
            </ThemedText>
          </View>
          <View style={s.approvalMetaItem}>
            <IconSymbol name="person.badge.shield.checkmark.fill" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.approvalMetaText, { color: colors.textTertiary }]}>
              {item.approverSeat}
            </ThemedText>
          </View>
          <View style={s.approvalMetaItem}>
            <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
            <ThemedText style={[s.approvalMetaText, { color: colors.textTertiary }]}>
              Due {formatDate(item.dueDate)}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Approval Queue */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Approve Queue</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Items needing decision
      </ThemedText>
      {approvalQueue.map((item) => renderApprovalItem(item, 'approval'))}
      {approvalQueue.length === 0 && (
        <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
          No items pending approval
        </ThemedText>
      )}

      {/* Release Queue */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>Release Queue</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Items approved, needing execution release
      </ThemedText>
      {releaseQueue.map((item) => renderApprovalItem(item, 'release'))}
      {releaseQueue.length === 0 && (
        <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
          No items awaiting release
        </ThemedText>
      )}
    </ScrollView>
  );
}

// =============================================================================
// AUDIT SUB-TAB
// =============================================================================

function AuditTab({
  colors,
  accentColor,
  auditRecords,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  auditRecords: AuditRecord[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Audit Trail</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Chronological audit log with evidence tracking
      </ThemedText>

      {auditRecords.map((entry, idx) => {
        const evidenceColor = AUDIT_EVIDENCE_COLORS[entry.evidenceStatus];
        const evidenceLabel = AUDIT_EVIDENCE_LABELS[entry.evidenceStatus];
        const hasPolicyException = entry.policyException;
        const cardBg = entry.evidenceStatus === 'missing' || entry.evidenceStatus === 'flagged'
          ? '#EF444408'
          : colors.card;
        const cardBorder = entry.evidenceStatus === 'missing' || entry.evidenceStatus === 'flagged'
          ? '#EF444430'
          : colors.border;

        return (
          <View
            key={entry.id}
            style={[s.auditCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            {/* Timeline dot and line */}
            <View style={s.auditTimeline}>
              <View style={[s.auditDot, { backgroundColor: evidenceColor }]} />
              {idx < auditRecords.length - 1 && (
                <View style={[s.auditLine, { backgroundColor: colors.border }]} />
              )}
            </View>

            <View style={s.auditContent}>
              <View style={s.auditHeader}>
                <ThemedText style={[s.auditAction, { color: colors.text }]} numberOfLines={2}>
                  {entry.action}
                </ThemedText>
                <StatusBadge label={evidenceLabel.toUpperCase()} color={evidenceColor} />
              </View>
              <View style={s.auditMeta}>
                <View style={s.auditMetaItem}>
                  <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                    {entry.performedBy}
                  </ThemedText>
                </View>
                <View style={s.auditMetaItem}>
                  <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                    {formatTimestamp(entry.timestamp)}
                  </ThemedText>
                </View>
              </View>

              {/* Entity Reference */}
              {entry.entityId && (
                <ThemedText style={[s.auditEntityRef, { color: colors.textSecondary }]}>
                  Ref: {entry.entityType}:{entry.entityId}
                </ThemedText>
              )}

              {/* Details */}
              <ThemedText style={[s.auditMetaText, { color: colors.textSecondary, marginBottom: 4 }]} numberOfLines={3}>
                {entry.details}
              </ThemedText>

              {/* Evidence Status */}
              <View style={s.auditEvidenceRow}>
                <IconSymbol
                  name={entry.evidenceStatus === 'complete' ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                  size={14}
                  color={evidenceColor}
                />
                <ThemedText style={[s.auditEvidenceText, { color: evidenceColor }]}>
                  Evidence: {evidenceLabel}
                </ThemedText>
              </View>

              {/* Policy Exception Warning */}
              {hasPolicyException && (
                <View style={s.holdWarning}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
                  <ThemedText style={[s.holdWarningText, { color: '#EF4444' }]}>
                    Policy Exception
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        );
      })}

      {auditRecords.length === 0 && (
        <EmptyState icon="checkmark.shield.fill" label="No audit entries" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// LEDGER POSTING DETAIL BOTTOM SHEET
// =============================================================================

function LedgerPostingDetailSheet({
  visible,
  onClose,
  posting,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  posting: LedgerPosting | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!posting) return null;

  const stateColor = POSTING_STATE_COLORS[posting.state];
  const stateLabel = POSTING_STATE_LABELS[posting.state];
  const fundColor = EDU_FUND_TYPE_COLORS[posting.fundType];
  const fundLabel = EDU_FUND_TYPE_LABELS[posting.fundType];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={posting.description} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={stateLabel.toUpperCase()} color={stateColor} />
        <StatusBadge label={fundLabel.toUpperCase()} color={fundColor} />
        <StatusBadge label={posting.institution.split(' ')[0].toUpperCase()} color={accentColor} />
      </View>

      {/* Details Grid */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(posting.amount)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(posting.date)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]} numberOfLines={2}>
              {posting.debitAccount}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Debit Account</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]} numberOfLines={2}>
              {posting.creditAccount}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Credit Account</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {posting.postedBy}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Posted By</ThemedText>
          </View>
        </View>
      </View>

      {/* Explain This Dollar Chain */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Explain This Dollar</ThemedText>
        {posting.explainChain.map((step, i) => (
          <View key={`chain-${i}`}>
            <View style={s.sheetListRow}>
              <View style={[s.approvalChainDot, { backgroundColor: accentColor }]} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>
                  {step}
                </ThemedText>
              </View>
            </View>
            {i < posting.explainChain.length - 1 && (
              <View style={s.chainArrow}>
                <IconSymbol name="arrow.down" size={12} color={colors.textTertiary} />
              </View>
            )}
          </View>
        ))}
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
// RECEIVABLE DETAIL BOTTOM SHEET
// =============================================================================

function ReceivableDetailSheet({
  visible,
  onClose,
  receivable,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  receivable: Receivable | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!receivable) return null;

  const typeColor = RECEIVABLE_TYPE_COLORS[receivable.type];
  const typeLabel = RECEIVABLE_TYPE_LABELS[receivable.type];

  const statusColors: Record<string, string> = {
    outstanding: '#F59E0B',
    partial: '#6AA9FF',
    paid: '#22C55E',
    overdue: '#EF4444',
    waived: '#8F8F8F',
  };
  const statusLabels: Record<string, string> = {
    outstanding: 'Outstanding',
    partial: 'Partial',
    paid: 'Paid',
    overdue: 'Overdue',
    waived: 'Waived',
  };
  const sColor = statusColors[receivable.status] || '#8F8F8F';
  const sLabel = statusLabels[receivable.status] || receivable.status;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={receivable.studentName} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={sLabel.toUpperCase()} color={sColor} />
        <StatusBadge label={TERM_WINDOW_LABELS[receivable.term].toUpperCase()} color="#6AA9FF" />
        <StatusBadge label={receivable.institution.split(' ')[0].toUpperCase()} color={accentColor} />
      </View>

      {/* Details Grid */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(receivable.amount)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(receivable.dueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {receivable.studentId}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Student ID</ThemedText>
          </View>
        </View>
      </View>

      {/* Hold Section */}
      {receivable.holdFlag && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: '#EF4444' }]}>Financial Hold</ThemedText>
          <View style={s.holdWarning}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
            <ThemedText style={[s.holdWarningText, { color: '#EF4444', fontSize: 13 }]}>
              {receivable.holdReason || 'Financial hold applied to this account'}
            </ThemedText>
          </View>
        </View>
      )}

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
// PAYABLE DETAIL BOTTOM SHEET
// =============================================================================

function PayableDetailSheet({
  visible,
  onClose,
  payable,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  payable: Payable | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!payable) return null;

  const typeColor = PAYABLE_TYPE_COLORS[payable.type];
  const typeLabel = PAYABLE_TYPE_LABELS[payable.type];
  const fundColor = EDU_FUND_TYPE_COLORS[payable.fundType];
  const fundLabel = EDU_FUND_TYPE_LABELS[payable.fundType];

  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    approved: '#22C55E',
    scheduled: '#6AA9FF',
    paid: '#22C55E',
    held: '#EF4444',
  };
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    scheduled: 'Scheduled',
    paid: 'Paid',
    held: 'Held',
  };
  const sColor = statusColors[payable.status] || '#8F8F8F';
  const sLabel = statusLabels[payable.status] || payable.status;

  const docsPct = payable.docsRequired > 0 ? (payable.docsComplete / payable.docsRequired) * 100 : 0;
  const docsColor = docsPct >= 100 ? '#22C55E' : docsPct >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={payable.vendorName} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={sLabel.toUpperCase()} color={sColor} />
        <StatusBadge label={fundLabel.toUpperCase()} color={fundColor} />
        <StatusBadge label={payable.institution.split(' ')[0].toUpperCase()} color={accentColor} />
      </View>

      {/* Details Grid */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(payable.amount)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(payable.dueDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Due Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ThemedText style={[s.sheetDetailValue, { color: docsColor }]}>
                {payable.docsComplete}/{payable.docsRequired}
              </ThemedText>
            </View>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Docs Progress</ThemedText>
          </View>
        </View>
        <View style={{ marginTop: Spacing.sm }}>
          <ProgressBar percent={docsPct} color={docsColor} />
        </View>
      </View>

      {/* Approval Chain */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Approval Chain</ThemedText>
        {payable.approvalChain.map((step, i) => {
          const stepColor = APPROVAL_STATUS_COLORS[step.status];
          const stepLabel = APPROVAL_STATUS_LABELS[step.status];
          return (
            <View key={`chain-${i}`} style={s.approvalChainRow}>
              <View style={[s.approvalChainDot, { backgroundColor: stepColor }]} />
              <View style={s.approvalChainTextCol}>
                <ThemedText style={[s.approvalChainName, { color: colors.text }]}>
                  {step.name}
                </ThemedText>
                <ThemedText style={[s.approvalChainStatus, { color: stepColor }]}>
                  {stepLabel}
                </ThemedText>
              </View>
            </View>
          );
        })}
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
// AID AWARD DETAIL BOTTOM SHEET
// =============================================================================

function AidAwardDetailSheet({
  visible,
  onClose,
  award,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  award: AidAward | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!award) return null;

  const aidColor = AID_TYPE_COLORS[award.aidType];
  const aidLabel = AID_TYPE_LABELS[award.aidType];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={award.studentName} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={aidLabel.toUpperCase()} color={aidColor} />
        <StatusBadge label={TERM_WINDOW_LABELS[award.term].toUpperCase()} color="#6AA9FF" />
        <StatusBadge label={award.institution.split(' ')[0].toUpperCase()} color={accentColor} />
      </View>

      {/* Details Grid */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatCurrency(award.amount)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Amount</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(award.disbursementDate)}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Disbursement Date</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {award.studentId}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Student ID</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconSymbol
                name={award.disbursed ? 'checkmark.circle.fill' : 'clock.fill'}
                size={14}
                color={award.disbursed ? '#22C55E' : '#F59E0B'}
              />
              <ThemedText style={[s.sheetDetailValue, { color: award.disbursed ? '#22C55E' : '#F59E0B' }]}>
                {award.disbursed ? 'Disbursed' : 'Pending'}
              </ThemedText>
            </View>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Status</ThemedText>
          </View>
        </View>
      </View>

      {/* Eligibility Rules */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Eligibility Rules</ThemedText>
        {award.eligibilityRules.map((rule, i) => (
          <View key={`rule-${i}`} style={s.sheetListRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>{rule}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Compliance Tags */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Compliance</ThemedText>
        <View style={s.sheetBadgeRow}>
          {award.complianceTags.map((tag, i) => (
            <StatusBadge key={`ctag-${i}`} label={tag.toUpperCase()} color="#22C55E" />
          ))}
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

export function EduOrgFinanceV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: E4 (Student) and E5 (Public) locked ===
  if (role === 'E4' || role === 'E5') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Finance</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Institutional finance information is not available for your access level
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedPosting, setSelectedPosting] = useState<LedgerPosting | null>(null);
  const [postingSheetVisible, setPostingSheetVisible] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [receivableSheetVisible, setReceivableSheetVisible] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  const [payableSheetVisible, setPayableSheetVisible] = useState(false);
  const [selectedAid, setSelectedAid] = useState<AidAward | null>(null);
  const [aidSheetVisible, setAidSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduFinanceData(), []);

  // === Callbacks ===
  const handleSelectPosting = useCallback((posting: LedgerPosting) => {
    setSelectedPosting(posting);
    setPostingSheetVisible(true);
  }, []);

  const handleClosePostingSheet = useCallback(() => {
    setPostingSheetVisible(false);
  }, []);

  const handleSelectReceivable = useCallback((receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setReceivableSheetVisible(true);
  }, []);

  const handleCloseReceivableSheet = useCallback(() => {
    setReceivableSheetVisible(false);
  }, []);

  const handleSelectPayable = useCallback((payable: Payable) => {
    setSelectedPayable(payable);
    setPayableSheetVisible(true);
  }, []);

  const handleClosePayableSheet = useCallback(() => {
    setPayableSheetVisible(false);
  }, []);

  const handleSelectAid = useCallback((award: AidAward) => {
    setSelectedAid(award);
    setAidSheetVisible(true);
  }, []);

  const handleCloseAidSheet = useCallback(() => {
    setAidSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleTabs = useMemo(() => {
    if (isDeanLevel(role)) return SUB_TABS;
    if (isFacultyLevel(role)) return SUB_TABS.filter(t => ['overview', 'budgets', 'receivables'].includes(t.id));
    return [];
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'ledger':
        if (!isDeanLevel(role)) return null;
        return (
          <LedgerTruthTab
            colors={colors}
            accentColor={accentColor}
            postings={data.ledgerPostings}
            onSelectPosting={handleSelectPosting}
          />
        );
      case 'budgets':
        return (
          <BudgetsTab
            colors={colors}
            accentColor={accentColor}
            budgets={data.departmentBudgets}
            role={role}
          />
        );
      case 'receivables':
        return (
          <ReceivablesTab
            colors={colors}
            accentColor={accentColor}
            receivables={data.receivables}
            role={role}
            onSelectReceivable={handleSelectReceivable}
          />
        );
      case 'payables':
        if (!isDeanLevel(role)) return null;
        return (
          <PayablesTab
            colors={colors}
            accentColor={accentColor}
            payables={data.payables}
            onSelectPayable={handleSelectPayable}
          />
        );
      case 'aid':
        if (!isDeanLevel(role)) return null;
        return (
          <AidAwardsTab
            colors={colors}
            accentColor={accentColor}
            awards={data.aidAwards}
            onSelectAid={handleSelectAid}
          />
        );
      case 'approvals':
        if (!isDeanLevel(role)) return null;
        return (
          <ApprovalsTab
            colors={colors}
            accentColor={accentColor}
            approvalItems={data.approvalItems}
          />
        );
      case 'audit':
        if (!isDeanLevel(role)) return null;
        return (
          <AuditTab
            colors={colors}
            accentColor={accentColor}
            auditRecords={data.auditRecords}
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

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Ledger Posting Detail Bottom Sheet */}
      <LedgerPostingDetailSheet
        visible={postingSheetVisible}
        onClose={handleClosePostingSheet}
        posting={selectedPosting}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Receivable Detail Bottom Sheet */}
      <ReceivableDetailSheet
        visible={receivableSheetVisible}
        onClose={handleCloseReceivableSheet}
        receivable={selectedReceivable}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Payable Detail Bottom Sheet */}
      <PayableDetailSheet
        visible={payableSheetVisible}
        onClose={handleClosePayableSheet}
        payable={selectedPayable}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Aid Award Detail Bottom Sheet */}
      <AidAwardDetailSheet
        visible={aidSheetVisible}
        onClose={handleCloseAidSheet}
        award={selectedAid}
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Section Card --
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  // -- Health Grid (Overview) --
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  healthTile: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  healthTileValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  healthTileLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Week Row (Overview) --
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  weekItem: {
    flex: 1,
    alignItems: 'center',
  },
  weekItemValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  weekItemLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Risk Warning --
  riskWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  riskWarningText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // -- Fund Snapshot (Overview) --
  fundSnapshotCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  fundSnapshotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  fundSnapshotName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  fundSnapshotValues: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fundSnapshotValueItem: {
    flex: 1,
    alignItems: 'center',
  },
  fundSnapshotAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  fundSnapshotAmountLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Action Queue (Overview) --
  actionQueueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionQueueText: {
    fontSize: 13,
    flex: 1,
  },

  // -- Filter Chips --
  filterChipRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Budget Card --
  budgetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  budgetNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  budgetTotalCol: {
    alignItems: 'flex-end',
  },
  budgetTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetTotalLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  budgetFundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  budgetFundText: {
    fontSize: 11,
  },
  budgetCategoryRow: {
    paddingVertical: Spacing.sm,
  },
  budgetCategoryNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetCategoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  budgetCategoryCap: {
    fontSize: 11,
  },
  budgetCategoryValues: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  budgetCategoryValueText: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  varianceNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  varianceNoteText: {
    fontSize: 11,
    flex: 1,
    fontStyle: 'italic',
  },

  // -- Fund Card (Ledger / Payables / Aid tabs) --
  fundCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  fundCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  fundIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundNameCol: {
    flex: 1,
  },
  fundName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  fundBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  fundValuesRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fundValueItem: {
    flex: 1,
    alignItems: 'center',
  },
  fundValueAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  fundValueLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  fundMetaRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fundMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fundMetaText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Commitment Card --
  commitmentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  commitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commitmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  commitmentAmount: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.sm,
  },
  commitmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: 6,
  },
  commitmentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commitmentMetaText: {
    fontSize: 11,
  },
  commitmentPayee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  commitmentPayeeText: {
    fontSize: 12,
  },
  readyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  readyText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Expense Row --
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  expenseIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseTextCol: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  expenseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  expenseMinistry: {
    fontSize: 10,
  },
  expenseDate: {
    fontSize: 10,
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Approval Card --
  approvalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  approvalAmount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  approvalBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  approvalMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  approvalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  approvalMetaText: {
    fontSize: 11,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  missingText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // -- Report Card --
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTextCol: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  reportMeta: {
    marginTop: 4,
  },
  reportMetaText: {
    fontSize: 10,
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Audit Card --
  auditCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  auditTimeline: {
    alignItems: 'center',
    width: 20,
    marginRight: Spacing.sm,
  },
  auditDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  auditLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  auditContent: {
    flex: 1,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  auditMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 4,
  },
  auditMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auditMetaText: {
    fontSize: 11,
  },
  auditEntityRef: {
    fontSize: 11,
    marginBottom: 4,
  },
  auditEvidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  auditEvidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
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

  // -- Approval Chain (Detail Sheets) --
  approvalChainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  approvalChainDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  approvalChainTextCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  approvalChainName: {
    fontSize: 13,
    fontWeight: '500',
  },
  approvalChainStatus: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Sheet Actions --
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

  // -- Education-specific: Hold Warning --
  holdWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: '#EF444410',
    borderRadius: BorderRadius.md,
  },
  holdWarningText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // -- Education-specific: Chain Arrow --
  chainArrow: {
    alignItems: 'center',
    paddingVertical: 2,
    marginLeft: 4,
  },
});
