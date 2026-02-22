/**
 * Business Organization Finance Tab — V2
 * 7-tab Finance Hub: Overview, Ledger, Budgets, Commitments, Forecast, Controls, Audit.
 *
 * KEY RULE: Finance authorizes; Payment Rails releases.
 * Finance NEVER releases directly.
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
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';
import { useBusiness } from '@/context/business-context';
import {
  BIZ_TXN_STATE_LABELS,
  BIZ_TXN_STATE_COLORS,
  formatCurrency,
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';
import type { BizTxnState, BizReceipt, CrossTabLink } from '@/data/biz-org-shared-types';
import {
  BIZ_FINANCE_V2_TABS,
  BUDGET_STATUS_COLOR,
  BUDGET_STATUS_LABEL,
  COMMITMENT_STATUS_COLOR,
  COMMITMENT_STATUS_LABEL,
  SOURCE_TAB_COLOR,
  CONTROL_STATUS_COLOR,
  AUDIT_TYPE_COLOR,
  LEDGER_CATEGORY_COLOR,
  getBizFinanceV2Data,
} from '@/data/mock-biz-org-finance';
import type {
  BizFinanceV2TabId,
  FinanceTruthChip,
  FinanceLedgerEntry,
  FinanceBudget,
  FinanceCommitment,
  FinanceForecastMonth,
  FinanceControl,
  FinanceAuditEntry,
  EntitySummary,
} from '@/data/mock-biz-org-finance';

const BP = BusinessPalette;

// =============================================================================
// INLINE DATA — Financial Health, Drivers, Approvals
// =============================================================================

const FINANCE_HEALTH = {
  cashPosition: 2_400_000,
  monthlyBurn: 185_000,
  runway: 13,
  burnTrend: 'stable' as const, // 'increasing' | 'stable' | 'decreasing'
};

const TOP_DRIVERS = [
  { id: 'td-1', label: 'SaaS subscription revenue', type: 'revenue' as const, amount: 520_000, impact: 'high' as const },
  { id: 'td-2', label: 'Payroll obligations', type: 'obligation' as const, amount: 385_000, impact: 'high' as const },
  { id: 'td-3', label: 'Content partnership rev share', type: 'revenue' as const, amount: 142_000, impact: 'medium' as const },
  { id: 'td-4', label: 'Infrastructure & hosting', type: 'obligation' as const, amount: 45_000, impact: 'medium' as const },
  { id: 'td-5', label: 'Legal & compliance fees', type: 'obligation' as const, amount: 28_000, impact: 'low' as const },
];

const APPROVAL_QUEUE = [
  { id: 'aq-1', label: 'Q1 marketing budget increase', amount: 25_000, requester: 'Jalen Torres', urgency: 'high' as const },
  { id: 'aq-2', label: 'New contractor payment', amount: 8_500, requester: 'Tom Bradley', urgency: 'medium' as const },
  { id: 'aq-3', label: 'Conference sponsorship', amount: 15_000, requester: 'Liam Chen', urgency: 'low' as const },
];

const URGENCY_COLORS: Record<'high' | 'medium' | 'low', string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#A1A1AA',
};

const IMPACT_COLORS: Record<'high' | 'medium' | 'low', string> = {
  high: '#1D9BF0',
  medium: '#1D9BF0',
  low: '#A1A1AA',
};

type TimeFilter = 'MTD' | 'QTD' | 'YTD' | 'Custom';

const TIME_FILTERS: TimeFilter[] = ['MTD', 'QTD', 'YTD', 'Custom'];

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

function formatCurrencyFull(amount: number): string {
  return '$' + Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function budgetPercent(actual: number, budgeted: number): number {
  if (budgeted <= 0) return 0;
  return Math.round((actual / budgeted) * 100);
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
// STATUS BADGE (generic)
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// TXN STATE BADGE
// =============================================================================

function TxnStateBadge({ state }: { state: BizTxnState }) {
  const color = BIZ_TXN_STATE_COLORS[state];
  const label = BIZ_TXN_STATE_LABELS[state];
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color, bgColor }: { percent: number; color: string; bgColor: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={[s.progressTrack, { backgroundColor: bgColor }]}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// TRUTH CHIP (horizontal scroll item)
// =============================================================================

function TruthChipItem({ chip, colors }: { chip: FinanceTruthChip; colors: typeof Colors.light }) {
  return (
    <View style={[s.truthChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[s.truthChipIconWrap, { backgroundColor: chip.color + '15' }]}>
        <IconSymbol name={chip.icon as any} size={16} color={chip.color} />
      </View>
      <ThemedText style={[s.truthChipValue, { color: colors.text }]}>{chip.value}</ThemedText>
      <ThemedText style={[s.truthChipLabel, { color: colors.textSecondary }]}>{chip.label}</ThemedText>
    </View>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  truthChips,
  entitySummaries,
  pendingCount,
  role = 'B1',
}: {
  colors: typeof Colors.light;
  accentColor: string;
  truthChips: FinanceTruthChip[];
  entitySummaries: EntitySummary[];
  pendingCount: number;
  role?: BusinessRoleLens;
}) {
  const burnTrendIcon =
    FINANCE_HEALTH.burnTrend === 'increasing'
      ? 'arrow.up.right'
      : FINANCE_HEALTH.burnTrend === 'decreasing'
        ? 'arrow.down.right'
        : 'arrow.right';
  const burnTrendColor =
    FINANCE_HEALTH.burnTrend === 'increasing'
      ? '#EF4444'
      : FINANCE_HEALTH.burnTrend === 'decreasing'
        ? '#22C55E'
        : '#F59E0B';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* ── Financial Health Snapshot ── */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Financial Health Snapshot</ThemedText>
      <View style={[s.healthSnapshotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.healthSnapshotRow}>
          <View style={s.healthSnapshotItem}>
            <ThemedText style={[s.healthSnapshotValue, { color: '#22C55E' }]}>
              {formatCurrencyCompact(FINANCE_HEALTH.cashPosition)}
            </ThemedText>
            <ThemedText style={[s.healthSnapshotLabel, { color: colors.textTertiary }]}>Cash Position</ThemedText>
          </View>
          <View style={s.healthSnapshotItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ThemedText style={[s.healthSnapshotValue, { color: '#EF4444' }]}>
                {formatCurrencyCompact(FINANCE_HEALTH.monthlyBurn)}
              </ThemedText>
              <IconSymbol name={burnTrendIcon as any} size={12} color={burnTrendColor} />
            </View>
            <ThemedText style={[s.healthSnapshotLabel, { color: colors.textTertiary }]}>Monthly Burn</ThemedText>
          </View>
          <View style={s.healthSnapshotItem}>
            <ThemedText style={[s.healthSnapshotValue, { color: colors.text }]}>
              {FINANCE_HEALTH.runway} mo
            </ThemedText>
            <ThemedText style={[s.healthSnapshotLabel, { color: colors.textTertiary }]}>Runway</ThemedText>
          </View>
        </View>
      </View>

      {/* ── Approvals Needed (Founder only) ── */}
      {isFounder(role) && APPROVAL_QUEUE.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>
            Approvals Needed
          </ThemedText>
          <View style={[s.approvalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {APPROVAL_QUEUE.map((aq, idx) => {
              const uColor = URGENCY_COLORS[aq.urgency];
              return (
                <View
                  key={aq.id}
                  style={[
                    s.approvalRow,
                    idx < APPROVAL_QUEUE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.driverLabel, { color: colors.text }]} numberOfLines={1}>
                      {aq.label}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>
                      {aq.requester}
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.driverAmount, { color: '#EF4444' }]}>
                    {formatCurrencyCompact(aq.amount)}
                  </ThemedText>
                  <View style={[s.urgencyBadge, { backgroundColor: uColor + '20' }]}>
                    <ThemedText style={[s.badgeText, { color: uColor }]}>
                      {aq.urgency.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* ── Top 5 Financial Drivers ── */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>
        Top 5 Financial Drivers
      </ThemedText>
      {TOP_DRIVERS.map((driver, idx) => {
        const isRevenue = driver.type === 'revenue';
        const impactColor = IMPACT_COLORS[driver.impact];
        return (
          <View
            key={driver.id}
            style={[s.driverRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.driverRank, { backgroundColor: (isRevenue ? '#22C55E' : '#EF4444') + '15' }]}>
              <ThemedText style={{ fontSize: 13, fontWeight: '700', color: isRevenue ? '#22C55E' : '#EF4444' }}>
                {idx + 1}
              </ThemedText>
            </View>
            <ThemedText style={[s.driverLabel, { color: colors.text }]} numberOfLines={1}>
              {driver.label}
            </ThemedText>
            <ThemedText style={[s.driverAmount, { color: isRevenue ? '#22C55E' : '#EF4444' }]}>
              {isRevenue ? '+' : '-'}{formatCurrencyCompact(driver.amount)}
            </ThemedText>
            <View style={[s.badge, { backgroundColor: impactColor + '20' }]}>
              <ThemedText style={[s.badgeText, { color: impactColor }]}>
                {driver.impact.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        );
      })}

      {/* ── Truth Strip ── */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>Financial Truth Strip</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.truthStripRow}
      >
        {truthChips.map((chip) => (
          <TruthChipItem key={chip.id} chip={chip} colors={colors} />
        ))}
      </ScrollView>

      {/* Alerts */}
      {pendingCount > 0 && (
        <View style={s.alertSection}>
          <BizAlertCard
            icon="clock.fill"
            title={`${pendingCount} Pending Approvals`}
            subtitle="Transactions awaiting Finance authorization"
            variant="warning"
          />
        </View>
      )}

      {/* Entity-Scoped Summaries */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Entity Summaries
      </ThemedText>
      {entitySummaries.map((entity) => {
        const stColor = BUDGET_STATUS_COLOR[entity.status];
        const stLabel = BUDGET_STATUS_LABEL[entity.status];
        return (
          <View
            key={entity.entityId}
            style={[s.entitySummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.entitySummaryHeader}>
              <ThemedText style={[s.entitySummaryName, { color: colors.text }]} numberOfLines={1}>
                {entity.entityName}
              </ThemedText>
              <StatusBadge label={stLabel} color={stColor} />
            </View>
            <View style={[s.entitySummaryMetrics, { borderTopColor: colors.border }]}>
              <View style={s.entitySummaryMetric}>
                <ThemedText style={[s.entityMetricValue, { color: '#22C55E' }]}>
                  {formatCurrencyCompact(entity.revenue)}
                </ThemedText>
                <ThemedText style={[s.entityMetricLabel, { color: colors.textTertiary }]}>Revenue</ThemedText>
              </View>
              <View style={s.entitySummaryMetric}>
                <ThemedText style={[s.entityMetricValue, { color: '#EF4444' }]}>
                  {formatCurrencyCompact(entity.expenses)}
                </ThemedText>
                <ThemedText style={[s.entityMetricLabel, { color: colors.textTertiary }]}>Expenses</ThemedText>
              </View>
              <View style={s.entitySummaryMetric}>
                <ThemedText
                  style={[s.entityMetricValue, { color: entity.net >= 0 ? '#22C55E' : '#EF4444' }]}
                >
                  {entity.net >= 0 ? '+' : '-'}{formatCurrencyCompact(Math.abs(entity.net))}
                </ThemedText>
                <ThemedText style={[s.entityMetricLabel, { color: colors.textTertiary }]}>Net</ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {/* Finance Rule Reminder */}
      <View style={s.ruleReminderSection}>
        <BizCard>
          <View style={s.ruleReminder}>
            <IconSymbol name="info.circle.fill" size={16} color={BP.ash} />
            <ThemedText style={[s.ruleReminderText, { color: BP.ash }]}>
              Finance authorizes transactions. Payment Rails releases funds. Finance never releases directly.
            </ThemedText>
          </View>
        </BizCard>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// LEDGER TAB
// =============================================================================

function LedgerTab({
  colors,
  accentColor,
  data,
  searchQuery,
  onSelectEntry,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: FinanceLedgerEntry[];
  searchQuery: string;
  onSelectEntry: (entry: FinanceLedgerEntry) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.entityName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        BIZ_TXN_STATE_LABELS[e.state].toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const isCredit = item.type === 'credit';
        const catColor = LEDGER_CATEGORY_COLOR[item.category] ?? BP.ash;
        return (
          <Pressable
            style={[s.ledgerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectEntry(item);
            }}
          >
            {/* Top row */}
            <View style={s.ledgerCardTop}>
              <View style={[s.ledgerTypeDot, { backgroundColor: isCredit ? '#22C55E' : '#EF4444' }]} />
              <View style={s.ledgerCardInfo}>
                <ThemedText style={[s.ledgerDescription, { color: colors.text }]} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <View style={s.ledgerBadgeRow}>
                  <TxnStateBadge state={item.state} />
                  <StatusBadge label={item.category.toUpperCase()} color={catColor} />
                </View>
              </View>
              <View style={s.ledgerAmountCol}>
                <ThemedText
                  style={[s.ledgerAmount, { color: isCredit ? '#22C55E' : '#EF4444' }]}
                >
                  {isCredit ? '+' : '-'}{formatCurrencyFull(item.amount)}
                </ThemedText>
                <ThemedText style={[s.ledgerType, { color: isCredit ? '#22C55E' : '#EF4444' }]}>
                  {isCredit ? 'CREDIT' : 'DEBIT'}
                </ThemedText>
              </View>
            </View>
            {/* Bottom row */}
            <View style={[s.ledgerCardBottom, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.ledgerEntity, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.entityName}
              </ThemedText>
              <ThemedText style={[s.ledgerDate, { color: colors.textTertiary }]}>{item.date}</ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No ledger entries found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// LEDGER DETAIL BOTTOM SHEET ("Explain this dollar")
// =============================================================================

function LedgerDetailSheet({
  visible,
  onClose,
  entry,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  entry: FinanceLedgerEntry | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!entry) return null;

  const isCredit = entry.type === 'credit';
  const catColor = LEDGER_CATEGORY_COLOR[entry.category] ?? BP.ash;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Explain This Dollar" useModal>
      {/* Description */}
      <ThemedText style={[s.sheetEntryDescription, { color: colors.text }]}>
        {entry.description}
      </ThemedText>

      {/* State + Category badges */}
      <View style={s.sheetBadgeRow}>
        <TxnStateBadge state={entry.state} />
        <StatusBadge label={entry.category.toUpperCase()} color={catColor} />
        <StatusBadge label={entry.type.toUpperCase()} color={isCredit ? '#22C55E' : '#EF4444'} />
      </View>

      {/* Amount KPI */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: isCredit ? '#22C55E' : '#EF4444' }]}>
            {isCredit ? '+' : '-'}{formatCurrencyFull(entry.amount)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Amount</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{entry.date}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Date</ThemedText>
        </View>
      </View>

      {/* Provenance Chain */}
      <ThemedText style={[s.sheetChainTitle, { color: colors.text }]}>
        Provenance Chain
      </ThemedText>

      {/* Entity */}
      <View style={[s.sheetProvenanceRow, { borderColor: colors.border }]}>
        <View style={[s.sheetProvenanceIcon, { backgroundColor: '#1D9BF0' + '15' }]}>
          <IconSymbol name="building.2.fill" size={14} color="#1D9BF0" />
        </View>
        <View style={s.sheetProvenanceMid}>
          <ThemedText style={[s.sheetProvenanceLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
          <ThemedText style={[s.sheetProvenanceValue, { color: colors.text }]}>{entry.entityName}</ThemedText>
        </View>
      </View>

      {/* Created By */}
      <View style={[s.sheetProvenanceRow, { borderColor: colors.border }]}>
        <View style={[s.sheetProvenanceIcon, { backgroundColor: '#1D9BF0' + '15' }]}>
          <IconSymbol name="person.fill" size={14} color="#1D9BF0" />
        </View>
        <View style={s.sheetProvenanceMid}>
          <ThemedText style={[s.sheetProvenanceLabel, { color: colors.textSecondary }]}>Created By</ThemedText>
          <ThemedText style={[s.sheetProvenanceValue, { color: colors.text }]}>{entry.createdBy}</ThemedText>
        </View>
      </View>

      {/* Approved By */}
      <View style={[s.sheetProvenanceRow, { borderColor: colors.border }]}>
        <View style={[s.sheetProvenanceIcon, { backgroundColor: '#1D9BF0' + '15' }]}>
          <IconSymbol name="checkmark.seal.fill" size={14} color="#1D9BF0" />
        </View>
        <View style={s.sheetProvenanceMid}>
          <ThemedText style={[s.sheetProvenanceLabel, { color: colors.textSecondary }]}>
            Approved By (Finance)
          </ThemedText>
          <ThemedText style={[s.sheetProvenanceValue, { color: colors.text }]}>
            {entry.approvedBy ?? 'Not yet approved'}
          </ThemedText>
        </View>
      </View>

      {/* Released By */}
      <View style={[s.sheetProvenanceRow, { borderColor: colors.border }]}>
        <View style={[s.sheetProvenanceIcon, { backgroundColor: '#22C55E' + '15' }]}>
          <IconSymbol name="arrow.right.circle.fill" size={14} color="#22C55E" />
        </View>
        <View style={s.sheetProvenanceMid}>
          <ThemedText style={[s.sheetProvenanceLabel, { color: colors.textSecondary }]}>
            Released By (Payment Rails)
          </ThemedText>
          <ThemedText style={[s.sheetProvenanceValue, { color: colors.text }]}>
            {entry.releasedBy ?? 'Not yet released'}
          </ThemedText>
        </View>
      </View>

      {/* Linked Commitment */}
      {entry.commitmentId && (
        <View style={[s.sheetProvenanceRow, { borderColor: colors.border }]}>
          <View style={[s.sheetProvenanceIcon, { backgroundColor: '#F59E0B' + '15' }]}>
            <IconSymbol name="link" size={14} color="#F59E0B" />
          </View>
          <View style={s.sheetProvenanceMid}>
            <ThemedText style={[s.sheetProvenanceLabel, { color: colors.textSecondary }]}>
              Linked Commitment
            </ThemedText>
            <ThemedText style={[s.sheetProvenanceValue, { color: colors.text }]}>
              {entry.commitmentId}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Receipt */}
      {entry.receiptId && (
        <View style={[s.sheetProvenanceRow, { borderColor: colors.border }]}>
          <View style={[s.sheetProvenanceIcon, { backgroundColor: '#1D9BF0' + '15' }]}>
            <IconSymbol name="doc.fill" size={14} color="#1D9BF0" />
          </View>
          <View style={s.sheetProvenanceMid}>
            <ThemedText style={[s.sheetProvenanceLabel, { color: colors.textSecondary }]}>
              Immutable Receipt
            </ThemedText>
            <ThemedText style={[s.sheetProvenanceValue, { color: colors.text }]}>
              {entry.receiptId}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Finance Rule */}
      <View style={[s.sheetRuleBox, { backgroundColor: BP.glass, borderColor: colors.border }]}>
        <IconSymbol name="info.circle.fill" size={14} color={BP.ash} />
        <ThemedText style={[s.sheetRuleText, { color: BP.ash }]}>
          Finance authorizes. Payment Rails releases. Finance never releases directly.
        </ThemedText>
      </View>

      {/* Dismiss */}
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
// BUDGETS TAB
// =============================================================================

function BudgetsTab({
  colors,
  data,
  searchQuery,
}: {
  colors: typeof Colors.light;
  data: FinanceBudget[];
  searchQuery: string;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.entityName.toLowerCase().includes(q) ||
        b.department.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = BUDGET_STATUS_COLOR[item.status];
        const stLabel = BUDGET_STATUS_LABEL[item.status];
        const pct = budgetPercent(item.actual, item.budgeted);
        const isOver = item.variance > 0;
        return (
          <View style={[s.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={s.budgetCardTop}>
              <View style={s.budgetCardInfo}>
                <ThemedText style={[s.budgetName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[s.budgetMeta, { color: colors.textTertiary }]}>
                  {item.entityName} / {item.department}
                </ThemedText>
              </View>
              <StatusBadge label={stLabel} color={stColor} />
            </View>

            {/* Progress */}
            <View style={s.budgetProgressSection}>
              <View style={s.budgetProgressHeader}>
                <ThemedText style={[s.budgetActual, { color: colors.text }]}>
                  {formatCurrencyCompact(item.actual)}
                </ThemedText>
                <ThemedText style={[s.budgetOf, { color: colors.textTertiary }]}>
                  of {formatCurrencyCompact(item.budgeted)}
                </ThemedText>
              </View>
              <ProgressBar
                percent={pct}
                color={stColor}
                bgColor={colors.backgroundTertiary}
              />
            </View>

            {/* Bottom stats */}
            <View style={[s.budgetCardBottom, { borderTopColor: colors.border }]}>
              <View style={s.budgetStat}>
                <ThemedText style={[s.budgetStatValue, { color: stColor }]}>
                  {pct}%
                </ThemedText>
                <ThemedText style={[s.budgetStatLabel, { color: colors.textTertiary }]}>Used</ThemedText>
              </View>
              <View style={s.budgetStat}>
                <ThemedText
                  style={[
                    s.budgetStatValue,
                    { color: isOver ? '#EF4444' : '#22C55E' },
                  ]}
                >
                  {isOver ? '+' : ''}{formatCurrencyCompact(item.variance)}
                </ThemedText>
                <ThemedText style={[s.budgetStatLabel, { color: colors.textTertiary }]}>
                  {isOver ? 'Over' : 'Under'}
                </ThemedText>
              </View>
              <View style={s.budgetStat}>
                <ThemedText
                  style={[
                    s.budgetStatValue,
                    { color: isOver ? '#EF4444' : '#22C55E' },
                  ]}
                >
                  {item.variancePct > 0 ? '+' : ''}{item.variancePct.toFixed(1)}%
                </ThemedText>
                <ThemedText style={[s.budgetStatLabel, { color: colors.textTertiary }]}>Variance</ThemedText>
              </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="chart.pie.fill" label="No budgets found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// COMMITMENTS TAB
// =============================================================================

function CommitmentsTab({
  colors,
  data,
  searchQuery,
}: {
  colors: typeof Colors.light;
  data: FinanceCommitment[];
  searchQuery: string;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (c) =>
        c.description.toLowerCase().includes(q) ||
        c.entityName.toLowerCase().includes(q) ||
        c.sourceTab.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = COMMITMENT_STATUS_COLOR[item.status];
        const stLabel = COMMITMENT_STATUS_LABEL[item.status];
        const srcColor = SOURCE_TAB_COLOR[item.sourceTab] ?? BP.ash;
        return (
          <View style={[s.commitmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={s.commitmentCardTop}>
              <View style={s.commitmentCardInfo}>
                <ThemedText style={[s.commitmentDescription, { color: colors.text }]} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <View style={s.commitmentBadgeRow}>
                  <StatusBadge label={stLabel} color={stColor} />
                  <StatusBadge label={item.sourceTab.toUpperCase()} color={srcColor} />
                </View>
              </View>
              <ThemedText style={[s.commitmentAmount, { color: colors.text }]}>
                {formatCurrencyCompact(item.amount)}
              </ThemedText>
            </View>

            {/* Details */}
            <View style={[s.commitmentCardBottom, { borderTopColor: colors.border }]}>
              <View style={s.commitmentDetail}>
                <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.commitmentDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.entityName}
                </ThemedText>
              </View>
              <View style={s.commitmentDetail}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.commitmentDetailText, { color: colors.textSecondary }]}>
                  Due: {item.dueDate}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="lock.fill" label="No commitments found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// FORECAST TAB
// =============================================================================

type ForecastScenario = 'base' | 'bull' | 'bear';

const SCENARIO_LABELS: Record<ForecastScenario, string> = {
  base: 'Base',
  bull: 'Bull',
  bear: 'Bear',
};

const SCENARIO_COLORS: Record<ForecastScenario, string> = {
  base: '#1D9BF0',
  bull: '#22C55E',
  bear: '#EF4444',
};

function ForecastTab({
  colors,
  accentColor,
  forecastBase,
  forecastBull,
  forecastBear,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  forecastBase: FinanceForecastMonth[];
  forecastBull: FinanceForecastMonth[];
  forecastBear: FinanceForecastMonth[];
}) {
  const [scenario, setScenario] = useState<ForecastScenario>('base');

  const activeData = useMemo(() => {
    switch (scenario) {
      case 'base': return forecastBase;
      case 'bull': return forecastBull;
      case 'bear': return forecastBear;
    }
  }, [scenario, forecastBase, forecastBull, forecastBear]);

  const totals = useMemo(() => {
    return activeData.reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        expenses: acc.expenses + m.expenses,
        net: acc.net + m.net,
      }),
      { revenue: 0, expenses: 0, net: 0 },
    );
  }, [activeData]);

  const scenarioColor = SCENARIO_COLORS[scenario];

  return (
    <FlatList
      data={activeData}
      keyExtractor={(item) => item.month}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          {/* Scenario Pills */}
          <View style={s.scenarioPillRow}>
            {(['base', 'bull', 'bear'] as ForecastScenario[]).map((sc) => {
              const isActive = sc === scenario;
              const scColor = SCENARIO_COLORS[sc];
              return (
                <Pressable
                  key={sc}
                  style={[
                    s.scenarioPill,
                    {
                      backgroundColor: isActive ? scColor + '20' : colors.backgroundTertiary,
                      borderColor: isActive ? scColor : 'transparent',
                      borderWidth: isActive ? 1 : 0,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setScenario(sc);
                  }}
                >
                  <View style={[s.scenarioDot, { backgroundColor: scColor }]} />
                  <ThemedText
                    style={[s.scenarioPillText, { color: isActive ? scColor : colors.textSecondary }]}
                  >
                    {SCENARIO_LABELS[sc]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Column Headers */}
          <View style={[s.forecastHeaderRow, { borderBottomColor: colors.border }]}>
            <ThemedText style={[s.forecastHeaderCell, s.forecastMonthCell, { color: colors.textSecondary }]}>
              Month
            </ThemedText>
            <ThemedText style={[s.forecastHeaderCell, s.forecastNumCell, { color: colors.textSecondary }]}>
              Revenue
            </ThemedText>
            <ThemedText style={[s.forecastHeaderCell, s.forecastNumCell, { color: colors.textSecondary }]}>
              Expenses
            </ThemedText>
            <ThemedText style={[s.forecastHeaderCell, s.forecastNumCell, { color: colors.textSecondary }]}>
              Net
            </ThemedText>
          </View>
        </View>
      }
      renderItem={({ item, index }) => {
        const isLast = index === activeData.length - 1;
        return (
          <View
            style={[
              s.forecastRow,
              { borderBottomColor: colors.border },
              isLast && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.forecastCell, s.forecastMonthCell, { color: colors.text }]}>
              {item.month}
            </ThemedText>
            <ThemedText style={[s.forecastCell, s.forecastNumCell, { color: '#22C55E' }]}>
              {formatCurrencyCompact(item.revenue)}
            </ThemedText>
            <ThemedText style={[s.forecastCell, s.forecastNumCell, { color: '#EF4444' }]}>
              {formatCurrencyCompact(item.expenses)}
            </ThemedText>
            <ThemedText
              style={[
                s.forecastCell,
                s.forecastNumCell,
                { color: item.net >= 0 ? '#22C55E' : '#EF4444' },
              ]}
            >
              {item.net >= 0 ? '+' : ''}{formatCurrencyCompact(item.net)}
            </ThemedText>
          </View>
        );
      }}
      ListFooterComponent={
        <View style={[s.forecastTotalRow, { backgroundColor: scenarioColor + '10', borderColor: scenarioColor + '30' }]}>
          <ThemedText style={[s.forecastTotalLabel, { color: scenarioColor }]}>
            12-Month Total
          </ThemedText>
          <View style={s.forecastTotalValues}>
            <View style={s.forecastTotalItem}>
              <ThemedText style={[s.forecastTotalValue, { color: '#22C55E' }]}>
                {formatCurrencyCompact(totals.revenue)}
              </ThemedText>
              <ThemedText style={[s.forecastTotalMeta, { color: colors.textTertiary }]}>Revenue</ThemedText>
            </View>
            <View style={s.forecastTotalItem}>
              <ThemedText style={[s.forecastTotalValue, { color: '#EF4444' }]}>
                {formatCurrencyCompact(totals.expenses)}
              </ThemedText>
              <ThemedText style={[s.forecastTotalMeta, { color: colors.textTertiary }]}>Expenses</ThemedText>
            </View>
            <View style={s.forecastTotalItem}>
              <ThemedText
                style={[s.forecastTotalValue, { color: totals.net >= 0 ? '#22C55E' : '#EF4444' }]}
              >
                {totals.net >= 0 ? '+' : ''}{formatCurrencyCompact(totals.net)}
              </ThemedText>
              <ThemedText style={[s.forecastTotalMeta, { color: colors.textTertiary }]}>Net</ThemedText>
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyState icon="chart.line.uptrend.xyaxis" label="No forecast data" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CONTROLS TAB
// =============================================================================

function ControlsTab({
  colors,
  data,
  searchQuery,
}: {
  colors: typeof Colors.light;
  data: FinanceControl[];
  searchQuery: string;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.rbacLevel.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = CONTROL_STATUS_COLOR[item.status];
        const isActive = item.status === 'active';
        return (
          <View style={[s.controlCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={s.controlCardTop}>
              <View style={s.controlCardInfo}>
                <ThemedText style={[s.controlName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={s.controlBadgeRow}>
                  <StatusBadge label={isActive ? 'ACTIVE' : 'DISABLED'} color={stColor} />
                  {item.dualControl && (
                    <StatusBadge label="DUAL CONTROL" color="#1D9BF0" />
                  )}
                </View>
              </View>
              <View style={[s.controlStatusDot, { backgroundColor: stColor }]} />
            </View>

            {/* Description */}
            <ThemedText style={[s.controlDescription, { color: colors.textSecondary }]} numberOfLines={3}>
              {item.description}
            </ThemedText>

            {/* Details */}
            <View style={[s.controlDetailsRow, { borderTopColor: colors.border }]}>
              <View style={s.controlDetailItem}>
                <IconSymbol name="gauge.medium" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.controlDetailText, { color: colors.textSecondary }]}>
                  {item.threshold}
                </ThemedText>
              </View>
              <View style={s.controlDetailItem}>
                <IconSymbol name="person.badge.shield.checkmark.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.controlDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.rbacLevel}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="shield.fill" label="No controls found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// AUDIT TAB
// =============================================================================

function AuditTab({
  colors,
  data,
  searchQuery,
}: {
  colors: typeof Colors.light;
  data: FinanceAuditEntry[];
  searchQuery: string;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (a) =>
        a.action.toLowerCase().includes(q) ||
        a.actor.toLowerCase().includes(q) ||
        a.entityName.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const typeColor = AUDIT_TYPE_COLOR[item.type] ?? BP.ash;
        const isLast = index === filtered.length - 1;
        return (
          <View style={s.auditEntryWrap}>
            {/* Timeline connector */}
            <View style={s.auditTimeline}>
              <View style={[s.auditTimelineDot, { backgroundColor: typeColor }]} />
              {!isLast && <View style={[s.auditTimelineLine, { backgroundColor: colors.border }]} />}
            </View>

            {/* Content */}
            <View style={[s.auditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Timestamp */}
              <ThemedText style={[s.auditTimestamp, { color: colors.textTertiary }]}>
                {item.timestamp}
              </ThemedText>

              {/* Action */}
              <ThemedText style={[s.auditAction, { color: colors.text }]} numberOfLines={3}>
                {item.action}
              </ThemedText>

              {/* Badges */}
              <View style={s.auditBadgeRow}>
                <StatusBadge label={item.type.toUpperCase().replace('_', ' ')} color={typeColor} />
                {item.receiptId && (
                  <StatusBadge label={'RECEIPT: ' + item.receiptId} color="#1D9BF0" />
                )}
              </View>

              {/* Meta */}
              <View style={[s.auditMeta, { borderTopColor: colors.border }]}>
                <View style={s.auditMetaItem}>
                  <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.auditMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.actor}
                  </ThemedText>
                </View>
                <View style={s.auditMetaItem}>
                  <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.auditMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.entityName}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="clock.arrow.circlepath" label="No audit entries found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizOrgFinanceV2({ colors, accentColor, role = 'B1' }: Props) {
  // === Entity Scope ===
  // TODO: Use selectedEntityId to filter finance data per-entity when backend is wired
  const { selectedEntityId } = useBusiness();

  // === All hooks declared before any early returns (React hooks rules) ===
  const [activeTab, setActiveTab] = useState<BizFinanceV2TabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('MTD');
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<FinanceLedgerEntry | null>(null);
  const [showLedgerDetail, setShowLedgerDetail] = useState(false);

  const data = useMemo(() => getBizFinanceV2Data(), []);

  const pendingCount = useMemo(() => {
    return data.ledger.filter(
      (e) => e.state === 'proposed' || e.state === 'draft' || e.state === 'rule_checked',
    ).length;
  }, [data.ledger]);

  const handleTabSelect = useCallback((id: string) => {
    setActiveTab(id as BizFinanceV2TabId);
    setSearchQuery('');
  }, []);

  const handleSelectLedgerEntry = useCallback((entry: FinanceLedgerEntry) => {
    setSelectedLedgerEntry(entry);
    setShowLedgerDetail(true);
  }, []);

  const subTabs = useMemo(() => {
    const all = BIZ_FINANCE_V2_TABS.map((t) => ({ id: t.id, label: t.label }));
    if (isFounder(role)) return all;
    if (isBoardLevel(role)) return all; // Board sees all tabs
    // B2a: overview only (banded values)
    return all.filter((t) => t.id === 'overview');
  }, [role]);

  const showSearch = activeTab !== 'overview' && activeTab !== 'forecast';

  // === RBAC Gate: B3+ locked ===
  if (!isFounder(role) && !isInvestor(role)) {
    return <BizEmptyLock title="Finance" message="This section is restricted. Contact the Founder for access." />;
  }

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            colors={colors}
            accentColor={accentColor}
            truthChips={data.truthChips}
            entitySummaries={data.entitySummaries}
            pendingCount={pendingCount}
            role={role}
          />
        );
      case 'ledger':
        return (
          <LedgerTab
            colors={colors}
            accentColor={accentColor}
            data={data.ledger}
            searchQuery={searchQuery}
            onSelectEntry={handleSelectLedgerEntry}
          />
        );
      case 'budgets':
        return (
          <BudgetsTab
            colors={colors}
            data={data.budgets}
            searchQuery={searchQuery}
          />
        );
      case 'commitments':
        return (
          <CommitmentsTab
            colors={colors}
            data={data.commitments}
            searchQuery={searchQuery}
          />
        );
      case 'forecast':
        return (
          <ForecastTab
            colors={colors}
            accentColor={accentColor}
            forecastBase={data.forecastBase}
            forecastBull={data.forecastBull}
            forecastBear={data.forecastBear}
          />
        );
      case 'controls':
        return (
          <ControlsTab
            colors={colors}
            data={data.controls}
            searchQuery={searchQuery}
          />
        );
      case 'audit':
        return (
          <AuditTab
            colors={colors}
            data={data.auditTrail}
            searchQuery={searchQuery}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <BizSubTabBar tabs={subTabs} activeId={activeTab} onSelect={handleTabSelect} />

      {/* Search bar (conditionally shown) */}
      {showSearch && (
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
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>

          {/* Time Filter Chips */}
          <View style={s.timeFilterRow}>
            {TIME_FILTERS.map((tf) => {
              const isActive = tf === timeFilter;
              return (
                <Pressable
                  key={tf}
                  style={[
                    s.timeFilterChip,
                    {
                      backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary,
                      borderColor: isActive ? accentColor : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTimeFilter(tf);
                  }}
                >
                  <ThemedText
                    style={[
                      s.badgeText,
                      { color: isActive ? accentColor : colors.textSecondary, fontSize: 11 },
                    ]}
                  >
                    {tf}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheets */}
      <LedgerDetailSheet
        visible={showLedgerDetail}
        onClose={() => setShowLedgerDetail(false)}
        entry={selectedLedgerEntry}
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

  // -- Progress bar --
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ==========================================================================
  // OVERVIEW — Truth Strip
  // ==========================================================================
  truthStripRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  truthChip: {
    width: 140,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  truthChipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  truthChipValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  truthChipLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Alert section --
  alertSection: {
    marginBottom: Spacing.sm,
  },

  // -- Entity Summaries --
  entitySummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  entitySummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  entitySummaryName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  entitySummaryMetrics: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  entitySummaryMetric: {
    flex: 1,
    alignItems: 'center',
  },
  entityMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  entityMetricLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Rule reminder --
  ruleReminderSection: {
    marginTop: Spacing.lg,
  },
  ruleReminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  ruleReminderText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  // ==========================================================================
  // LEDGER
  // ==========================================================================
  ledgerCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  ledgerCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  ledgerTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  ledgerCardInfo: {
    flex: 1,
  },
  ledgerDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  ledgerBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  ledgerAmountCol: {
    alignItems: 'flex-end',
  },
  ledgerAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ledgerType: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  ledgerCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ledgerEntity: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  ledgerDate: {
    fontSize: 12,
  },

  // ==========================================================================
  // LEDGER DETAIL SHEET
  // ==========================================================================
  sheetEntryDescription: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  sheetChainTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sheetProvenanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetProvenanceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetProvenanceMid: {
    flex: 1,
  },
  sheetProvenanceLabel: {
    fontSize: 11,
  },
  sheetProvenanceValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 1,
  },
  sheetRuleBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  sheetRuleText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
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

  // ==========================================================================
  // BUDGETS
  // ==========================================================================
  budgetCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  budgetCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  budgetCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '600',
  },
  budgetMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  budgetProgressSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  budgetProgressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 6,
  },
  budgetActual: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetOf: {
    fontSize: 12,
  },
  budgetCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  budgetStat: {
    alignItems: 'center',
  },
  budgetStatValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // ==========================================================================
  // COMMITMENTS
  // ==========================================================================
  commitmentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  commitmentCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  commitmentCardInfo: {
    flex: 1,
  },
  commitmentDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  commitmentBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  commitmentAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  commitmentCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commitmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  commitmentDetailText: {
    fontSize: 12,
    flex: 1,
  },

  // ==========================================================================
  // FORECAST
  // ==========================================================================
  scenarioPillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  scenarioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  scenarioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scenarioPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  forecastHeaderRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.xs,
  },
  forecastHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  forecastMonthCell: {
    flex: 1.2,
  },
  forecastNumCell: {
    flex: 1,
    textAlign: 'right',
  },
  forecastRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  forecastCell: {
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  forecastTotalRow: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  forecastTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  forecastTotalValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  forecastTotalItem: {
    alignItems: 'center',
  },
  forecastTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  forecastTotalMeta: {
    fontSize: 11,
    marginTop: 2,
  },

  // ==========================================================================
  // CONTROLS
  // ==========================================================================
  controlCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  controlCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  controlCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  controlName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  controlBadgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  controlStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  controlDescription: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  controlDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  controlDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  controlDetailText: {
    fontSize: 12,
    flex: 1,
  },

  // ==========================================================================
  // AUDIT
  // ==========================================================================
  auditEntryWrap: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  auditTimeline: {
    width: 24,
    alignItems: 'center',
  },
  auditTimelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 14,
  },
  auditTimelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  auditCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  auditTimestamp: {
    fontSize: 11,
    marginBottom: 4,
  },
  auditAction: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  auditBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  auditMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  auditMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  auditMetaText: {
    fontSize: 12,
    flex: 1,
  },

  // ==========================================================================
  // FINANCIAL HEALTH SNAPSHOT
  // ==========================================================================
  healthSnapshotCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  healthSnapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthSnapshotItem: {
    alignItems: 'center',
  },
  healthSnapshotValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  healthSnapshotLabel: {
    fontSize: 11,
    marginTop: 4,
  },

  // ==========================================================================
  // TOP FINANCIAL DRIVERS
  // ==========================================================================
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  driverRank: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  driverAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // ==========================================================================
  // APPROVALS NEEDED
  // ==========================================================================
  approvalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },

  // ==========================================================================
  // TIME FILTER CHIPS
  // ==========================================================================
  timeFilterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  timeFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
