/**
 * Business Finance — 14-sub-tab Finance hub for KaNeXT Business Mode.
 * Overview | Ledger Truth | Budgets | Commitments | Receivables | Payables |
 * Approvals | Splits | Revenue | Costs/Burn | Entities | Risk/Controls |
 * Audit | Board Pack Builder
 *
 * RBAC:
 *   B1  — all 14 sub-tabs (exact values)
 *   B2b — 5 sub-tabs: overview, budgets, revenue, entities, board_pack
 *   B2a — overview only (banded values)
 *   B3  — locked
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import { EntityScopeBar } from '@/components/business/entity-scope-bar';
import {
  BizCard,
  BizCardTitle,
  BizSubTabBar,
  BizStatusChip,
  BizEmptyLock,
  statusColor,
} from '@/components/business/business-shared';
import { isFounder, isBoardLevel } from '@/utils/business-rbac';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { DEFAULT_ENTITY } from '@/data/mock-business-v3';

import {
  FINANCE_KPIS,
  LEDGER_ENTRIES,
  BUDGET_ITEMS,
  COMMITMENTS,
  RECEIVABLES,
  PAYABLES,
  APPROVALS,
  SPLITS,
  REVENUE_ITEMS,
  COST_ITEMS,
  ENTITY_FINANCES,
  RISK_CONTROLS,
  AUDIT_LOG,
  BOARD_PACK_SECTIONS,
  TRUTH_STRIP_KPIS,
  RELEASE_QUEUE,
  EARMARKS,
  TXN_STATES,
  getFinanceSubTabs,
} from '@/data/mock-biz-finance';
import type {
  FinanceSubTab,
  FinanceKPI,
  LedgerEntry,
  BudgetItem,
  CommitmentItem,
  ReceivableItem,
  PayableItem,
  ApprovalItem,
  SplitItem,
  RevenueItem,
  CostItem,
  EntityFinance,
  RiskControl,
  AuditEntry,
  BoardPackSection,
  TruthStripKPI,
  ReleaseQueueItem,
  EarmarkItem,
  TxnState,
} from '@/data/mock-biz-finance';

const BP = BusinessPalette;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Return display value: exact for B1/B2b, banded for B2a */
function kpiDisplayValue(kpi: FinanceKPI, role: BusinessRoleLens): string {
  if (isFounder(role) || role === 'B2b') return kpi.value;
  return kpi.bandedValue;
}

function trendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'arrow.up.right';
    case 'down':
      return 'arrow.down.right';
    default:
      return 'minus';
  }
}

function trendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return BP.emerald;
    case 'down':
      return BP.red;
    default:
      return BP.ash;
  }
}

function severityDotColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return BP.red;
    case 'high':
      return BP.amber;
    case 'medium':
      return '#6AA9FF';
    case 'low':
      return BP.ash;
    default:
      return BP.ash;
  }
}

function boardPackStatusVariant(
  status: string,
): 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'complete':
      return 'success';
    case 'in_progress':
      return 'warning';
    default:
      return 'neutral';
  }
}

function boardPackStatusLabel(status: string): string {
  switch (status) {
    case 'complete':
      return 'Complete';
    case 'in_progress':
      return 'In Progress';
    case 'not_started':
      return 'Not Started';
    default:
      return status;
  }
}

function formatCurrency(num: number): string {
  if (num < 0) return `-$${Math.abs(num).toLocaleString()}`;
  return `$${num.toLocaleString()}`;
}

// =============================================================================
// TRUTH STRIP — Persistent KPI chips above sub-tab bar
// =============================================================================

function TruthStrip() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.truthStripScroll}>
      {TRUTH_STRIP_KPIS.map((kpi) => (
        <View key={kpi.id} style={s.truthChip}>
          <IconSymbol name={kpi.icon as any} size={12} color={BP.ash} />
          <ThemedText style={s.truthLabel}>{kpi.label}</ThemedText>
          <ThemedText style={s.truthValue}>{kpi.value}</ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// SECTION: OVERVIEW (Sub-tab 1)
// =============================================================================

function OverviewSection({ role }: { role: BusinessRoleLens }) {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="FINANCIAL KPIS" />
        <View style={s.kpiGrid}>
          {FINANCE_KPIS.map((kpi) => (
            <View key={kpi.id} style={s.kpiTile}>
              <View style={s.kpiTileHeader}>
                <IconSymbol
                  name={kpi.icon as any}
                  size={14}
                  color={BP.ash}
                />
                <ThemedText style={s.kpiLabel}>{kpi.label}</ThemedText>
              </View>
              <ThemedText style={s.kpiValue}>
                {kpiDisplayValue(kpi, role)}
              </ThemedText>
              <View style={s.kpiTrendRow}>
                <IconSymbol
                  name={trendIcon(kpi.trend) as any}
                  size={10}
                  color={trendColor(kpi.trend)}
                />
                <ThemedText
                  style={[s.kpiTrendText, { color: trendColor(kpi.trend) }]}
                >
                  {kpi.trend === 'up'
                    ? 'Trending up'
                    : kpi.trend === 'down'
                      ? 'Trending down'
                      : 'Stable'}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </BizCard>

      {/* Financial Summary Strip */}
      <BizCard>
        <BizCardTitle text="FINANCIAL SUMMARY" />
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <ThemedText style={s.summaryLabel}>Total Revenue</ThemedText>
            <ThemedText style={s.summaryValue}>
              {isFounder(role) || role === 'B2b'
                ? '$21,300/mo'
                : '$15K\u2013$25K/mo'}
            </ThemedText>
          </View>
          <View style={[s.summaryItem, s.summaryDivider]}>
            <ThemedText style={s.summaryLabel}>Total Costs</ThemedText>
            <ThemedText style={s.summaryValue}>
              {isFounder(role) || role === 'B2b'
                ? '$19,800/mo'
                : '<$25K/mo'}
            </ThemedText>
          </View>
          <View style={[s.summaryItem, s.summaryDivider]}>
            <ThemedText style={s.summaryLabel}>Net</ThemedText>
            <ThemedText style={[s.summaryValue, { color: BP.emerald }]}>
              {isFounder(role) || role === 'B2b' ? '+$1,500/mo' : 'Positive'}
            </ThemedText>
          </View>
        </View>
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: LEDGER TRUTH (Sub-tab 2)
// =============================================================================

function LedgerSection({
  onExplain,
}: {
  onExplain: (entry: LedgerEntry) => void;
}) {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="GENERAL LEDGER" />
        {LEDGER_ENTRIES.map((entry, idx) => (
          <Pressable
            key={entry.id}
            style={({ pressed }) => [
              s.ledgerRow,
              idx < LEDGER_ENTRIES.length - 1 && s.ledgerRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onExplain(entry);
            }}
          >
            <View style={s.ledgerLeft}>
              <ThemedText style={s.ledgerDate}>{entry.date}</ThemedText>
              <ThemedText style={s.ledgerDesc} numberOfLines={2}>
                {entry.description}
              </ThemedText>
              <ThemedText style={s.ledgerEntity}>{entry.entity}</ThemedText>
            </View>
            <View style={s.ledgerRight}>
              {entry.debit > 0 && (
                <ThemedText style={[s.ledgerAmount, { color: BP.red }]}>
                  -{formatCurrency(entry.debit)}
                </ThemedText>
              )}
              {entry.credit > 0 && (
                <ThemedText style={[s.ledgerAmount, { color: BP.emerald }]}>
                  +{formatCurrency(entry.credit)}
                </ThemedText>
              )}
              <ThemedText style={s.ledgerBalance}>
                {formatCurrency(entry.balance)}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: BUDGETS (Sub-tab 3)
// =============================================================================

function BudgetsSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="BUDGET TRACKER" />
        {BUDGET_ITEMS.map((item, idx) => {
          const pct = Math.min(
            (item.spent / item.allocated) * 100,
            100,
          );
          const barColor =
            item.status === 'on_track'
              ? BP.emerald
              : item.status === 'at_risk'
                ? BP.amber
                : BP.red;

          return (
            <View
              key={item.id}
              style={[
                s.budgetRow,
                idx < BUDGET_ITEMS.length - 1 && s.budgetRowBorder,
              ]}
            >
              <View style={s.budgetHeader}>
                <ThemedText style={s.budgetCategory} numberOfLines={1}>
                  {item.category}
                </ThemedText>
                <BizStatusChip
                  label={
                    item.status === 'on_track'
                      ? 'On Track'
                      : item.status === 'at_risk'
                        ? 'At Risk'
                        : 'Over Budget'
                  }
                  variant={
                    item.status === 'on_track'
                      ? 'success'
                      : item.status === 'at_risk'
                        ? 'warning'
                        : 'error'
                  }
                />
              </View>
              <View style={s.budgetBarBg}>
                <View
                  style={[
                    s.budgetBarFill,
                    { width: `${pct}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
              <View style={s.budgetFooter}>
                <ThemedText style={s.budgetFooterText}>
                  Allocated: {formatCurrency(item.allocated)}
                </ThemedText>
                <ThemedText style={s.budgetFooterText}>
                  Spent: {formatCurrency(item.spent)}
                </ThemedText>
                <ThemedText
                  style={[
                    s.budgetFooterText,
                    {
                      color:
                        item.remaining >= 0 ? BP.emerald : BP.red,
                    },
                  ]}
                >
                  Remaining: {formatCurrency(item.remaining)}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: COMMITMENTS (Sub-tab 4)
// =============================================================================

function CommitmentsSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="ACTIVE COMMITMENTS" />
        {COMMITMENTS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.commitRow,
              idx < COMMITMENTS.length - 1 && s.commitRowBorder,
            ]}
          >
            <View style={s.commitHeader}>
              <ThemedText style={s.commitTitle} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View
                style={[
                  s.typeBadge,
                  { backgroundColor: BP.champagneGold + '15' },
                ]}
              >
                <ThemedText style={s.typeBadgeText}>
                  {item.type.toUpperCase()}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={s.commitCounterparty}>
              {item.counterparty}
            </ThemedText>
            <View style={s.commitFooter}>
              <ThemedText style={s.commitAmount}>{item.amount}</ThemedText>
              <ThemedText style={s.commitDue}>Due: {item.dueDate}</ThemedText>
              <BizStatusChip
                label={
                  item.status === 'active'
                    ? 'Active'
                    : item.status === 'pending'
                      ? 'Pending'
                      : 'Fulfilled'
                }
                variant={
                  item.status === 'active'
                    ? 'success'
                    : item.status === 'pending'
                      ? 'warning'
                      : 'neutral'
                }
              />
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: RECEIVABLES (Sub-tab 5)
// =============================================================================

function ReceivablesSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="RECEIVABLES" />
        {RECEIVABLES.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.recvRow,
              idx < RECEIVABLES.length - 1 && s.recvRowBorder,
            ]}
          >
            <View style={s.recvHeader}>
              <ThemedText style={s.recvFrom} numberOfLines={1}>
                {item.from}
              </ThemedText>
              <ThemedText style={s.recvAmount}>{item.amount}</ThemedText>
            </View>
            <View style={s.recvMeta}>
              <ThemedText style={s.recvDate}>
                Inv: {item.invoiceDate}
              </ThemedText>
              <ThemedText style={s.recvDate}>
                Due: {item.dueDate}
              </ThemedText>
            </View>
            <View style={s.recvFooter}>
              <BizStatusChip
                label={
                  item.status === 'outstanding'
                    ? 'Outstanding'
                    : item.status === 'overdue'
                      ? 'Overdue'
                      : 'Paid'
                }
                variant={
                  item.status === 'outstanding'
                    ? 'warning'
                    : item.status === 'overdue'
                      ? 'error'
                      : 'success'
                }
              />
              {item.daysPastDue != null && item.daysPastDue > 0 && (
                <View style={s.daysPastBadge}>
                  <ThemedText style={s.daysPastText}>
                    {item.daysPastDue}d past due
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: PAYABLES (Sub-tab 6)
// =============================================================================

function PayablesSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="PAYABLES" />
        {PAYABLES.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.payRow,
              idx < PAYABLES.length - 1 && s.payRowBorder,
            ]}
          >
            <View style={s.payHeader}>
              <ThemedText style={s.payTo} numberOfLines={1}>
                {item.to}
              </ThemedText>
              <ThemedText style={s.payAmount}>{item.amount}</ThemedText>
            </View>
            <View style={s.payFooter}>
              <ThemedText style={s.payCategory}>{item.category}</ThemedText>
              <ThemedText style={s.payDue}>Due: {item.dueDate}</ThemedText>
              <BizStatusChip
                label={
                  item.status === 'scheduled'
                    ? 'Scheduled'
                    : item.status === 'pending_approval'
                      ? 'Pending'
                      : item.status === 'paid'
                        ? 'Paid'
                        : 'Overdue'
                }
                variant={
                  item.status === 'scheduled'
                    ? 'info'
                    : item.status === 'pending_approval'
                      ? 'warning'
                      : item.status === 'paid'
                        ? 'success'
                        : 'error'
                }
              />
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: APPROVALS (Sub-tab 7)
// =============================================================================

function ApprovalsSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="PENDING APPROVALS" />
        {APPROVALS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.approvalRow,
              idx < APPROVALS.length - 1 && s.approvalRowBorder,
            ]}
          >
            <View style={s.approvalHeader}>
              <ThemedText style={s.approvalTitle} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View
                style={[
                  s.typeBadge,
                  { backgroundColor: BP.champagneGold + '15' },
                ]}
              >
                <ThemedText style={s.typeBadgeText}>
                  {item.type.toUpperCase().replace('_', ' ')}
                </ThemedText>
              </View>
            </View>
            <View style={s.approvalMeta}>
              <ThemedText style={s.approvalAmount}>{item.amount}</ThemedText>
              <ThemedText style={s.approvalRequester}>
                Requested by {item.requester}
              </ThemedText>
            </View>
            <View style={s.approvalFooter}>
              <BizStatusChip
                label={
                  item.status === 'pending'
                    ? 'Pending'
                    : item.status === 'approved'
                      ? 'Approved'
                      : 'Rejected'
                }
                variant={
                  item.status === 'pending'
                    ? 'warning'
                    : item.status === 'approved'
                      ? 'success'
                      : 'error'
                }
              />
              {item.status === 'pending' && (
                <View style={s.approvalActions}>
                  <Pressable
                    style={({ pressed }) => [
                      s.approvalBtn,
                      s.approvalBtnApprove,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() =>
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                  >
                    <IconSymbol
                      name={"checkmark" as any}
                      size={12}
                      color={BP.emerald}
                    />
                    <ThemedText
                      style={[s.approvalBtnText, { color: BP.emerald }]}
                    >
                      Approve
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      s.approvalBtn,
                      s.approvalBtnReject,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() =>
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                  >
                    <IconSymbol
                      name={"xmark" as any}
                      size={12}
                      color={BP.red}
                    />
                    <ThemedText
                      style={[s.approvalBtnText, { color: BP.red }]}
                    >
                      Reject
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        ))}
      </BizCard>

      {/* Release Queue */}
      <BizCard>
        <BizCardTitle text="RELEASE QUEUE" />
        {RELEASE_QUEUE.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.releaseRow,
              idx < RELEASE_QUEUE.length - 1 && s.releaseRowBorder,
            ]}
          >
            <View style={s.releaseHeader}>
              <ThemedText style={s.releaseTitle} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText style={s.releaseAmount}>{item.amount}</ThemedText>
            </View>
            <View style={s.releaseMeta}>
              <ThemedText style={s.releaseDetail}>
                Approved by {item.approvedBy} on {item.approvedAt}
              </ThemedText>
              <ThemedText style={s.releaseDetail}>
                Release Authority: {item.releaseAuthority}
              </ThemedText>
            </View>
            <View style={s.releaseFooter}>
              {item.status === 'awaiting_release' ? (
                <Pressable
                  style={({ pressed }) => [
                    s.releaseCta,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() =>
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  }
                >
                  <IconSymbol
                    name={"arrow.up.circle.fill" as any}
                    size={12}
                    color={BP.champagneGold}
                  />
                  <ThemedText style={s.releaseCtaText}>Release</ThemedText>
                </Pressable>
              ) : (
                <BizStatusChip label="Released" variant="success" />
              )}
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: SPLITS (Sub-tab 8)
// =============================================================================

function SplitsSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="ENTITY SPLIT BREAKDOWN" />
        {SPLITS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.splitRow,
              idx < SPLITS.length - 1 && s.splitRowBorder,
            ]}
          >
            <View style={s.splitHeader}>
              <ThemedText style={s.splitEntity}>{item.entity}</ThemedText>
              <ThemedText style={s.splitPercent}>
                {item.percentage}%
              </ThemedText>
            </View>
            <View style={s.splitBarBg}>
              <View
                style={[
                  s.splitBarFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: BP.champagneGold,
                  },
                ]}
              />
            </View>
            <View style={s.splitFooter}>
              <ThemedText style={s.splitCategory}>{item.category}</ThemedText>
              <ThemedText style={s.splitAmount}>{item.amount}</ThemedText>
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: REVENUE (Sub-tab 9)
// =============================================================================

function RevenueSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="REVENUE SOURCES" />
        {REVENUE_ITEMS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.revenueRow,
              idx < REVENUE_ITEMS.length - 1 && s.revenueRowBorder,
            ]}
          >
            <View style={s.revenueHeader}>
              <ThemedText style={s.revenueSource} numberOfLines={1}>
                {item.source}
              </ThemedText>
              <View
                style={[
                  s.typeBadge,
                  { backgroundColor: BP.champagneGold + '15' },
                ]}
              >
                <ThemedText style={s.typeBadgeText}>
                  {item.type.toUpperCase()}
                </ThemedText>
              </View>
            </View>
            <View style={s.revenueFooter}>
              <ThemedText style={s.revenueAmount}>{item.amount}</ThemedText>
              <ThemedText style={s.revenuePeriod}>{item.period}</ThemedText>
              <BizStatusChip
                label={item.status === 'active' ? 'Active' : 'Projected'}
                variant={item.status === 'active' ? 'success' : 'info'}
              />
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: COSTS / BURN (Sub-tab 10)
// =============================================================================

function CostsBurnSection() {
  const cashOnHand = 142000;
  const monthlyBurn = 19800;
  const runwayMonths = parseFloat((cashOnHand / monthlyBurn).toFixed(1));
  const runwayPct = Math.min((runwayMonths / 12) * 100, 100);

  return (
    <View>
      {/* Runway KPI Card */}
      <BizCard>
        <BizCardTitle text="RUNWAY" />
        <View style={s.runwayKpi}>
          <View style={s.runwayValueRow}>
            <ThemedText style={s.runwayValue}>{runwayMonths}</ThemedText>
            <ThemedText style={s.runwayUnit}>months</ThemedText>
          </View>
          <ThemedText style={s.runwayFormula}>
            {formatCurrency(cashOnHand)} cash / {formatCurrency(monthlyBurn)}/mo burn
          </ThemedText>
          <View style={s.runwayBarBg}>
            <View
              style={[
                s.runwayBarFill,
                {
                  width: `${runwayPct}%`,
                  backgroundColor:
                    runwayMonths >= 9
                      ? BP.emerald
                      : runwayMonths >= 6
                        ? BP.amber
                        : BP.red,
                },
              ]}
            />
          </View>
          <View style={s.runwayLegend}>
            <ThemedText style={s.runwayLegendText}>0 mo</ThemedText>
            <ThemedText style={s.runwayLegendText}>12 mo</ThemedText>
          </View>
        </View>
      </BizCard>

      <BizCard>
        <BizCardTitle text="COST BREAKDOWN" />
        {COST_ITEMS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.costRow,
              idx < COST_ITEMS.length - 1 && s.costRowBorder,
            ]}
          >
            <View style={s.costHeader}>
              <ThemedText style={s.costCategory} numberOfLines={1}>
                {item.category}
              </ThemedText>
              <View style={s.costTrend}>
                <IconSymbol
                  name={trendIcon(item.trend) as any}
                  size={10}
                  color={trendColor(item.trend)}
                />
                <ThemedText
                  style={[s.costTrendText, { color: trendColor(item.trend) }]}
                >
                  {item.trend}
                </ThemedText>
              </View>
            </View>
            <View style={s.costBarBg}>
              <View
                style={[
                  s.costBarFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor:
                      item.percentage > 30
                        ? BP.champagneGold
                        : item.percentage > 15
                          ? BP.ash
                          : BP.platinum,
                  },
                ]}
              />
            </View>
            <View style={s.costFooter}>
              <ThemedText style={s.costAmount}>
                {item.monthly}/mo
              </ThemedText>
              <ThemedText style={s.costAnnual}>
                {item.annual}/yr
              </ThemedText>
              <ThemedText style={s.costPercent}>
                {item.percentage}% of total
              </ThemedText>
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: ENTITIES (Sub-tab 11)
// =============================================================================

function EntitiesSection() {
  return (
    <View>
      {ENTITY_FINANCES.map((ent) => (
        <BizCard key={ent.id}>
          <View style={s.entityHeader}>
            <View style={s.entityTitleRow}>
              <View
                style={[
                  s.entityStatusDot,
                  {
                    backgroundColor:
                      ent.status === 'active' ? BP.emerald : BP.amber,
                  },
                ]}
              />
              <ThemedText style={s.entityName}>{ent.name}</ThemedText>
            </View>
            <View
              style={[
                s.typeBadge,
                { backgroundColor: BP.champagneGold + '15' },
              ]}
            >
              <ThemedText style={s.typeBadgeText}>
                {ent.type.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <View style={s.entityMetrics}>
            <View style={s.entityMetricItem}>
              <ThemedText style={s.entityMetricLabel}>
                Cash Balance
              </ThemedText>
              <ThemedText style={s.entityMetricValue}>
                {ent.cashBalance}
              </ThemedText>
            </View>
            <View style={[s.entityMetricItem, s.entityMetricDivider]}>
              <ThemedText style={s.entityMetricLabel}>
                Monthly Burn
              </ThemedText>
              <ThemedText style={s.entityMetricValue}>
                {ent.monthlyBurn}
              </ThemedText>
            </View>
            <View style={[s.entityMetricItem, s.entityMetricDivider]}>
              <ThemedText style={s.entityMetricLabel}>Status</ThemedText>
              <BizStatusChip
                label={ent.status === 'active' ? 'Active' : 'Pending'}
                variant={ent.status === 'active' ? 'success' : 'warning'}
              />
            </View>
          </View>
        </BizCard>
      ))}
    </View>
  );
}

// =============================================================================
// SECTION: RISK / CONTROLS (Sub-tab 12)
// =============================================================================

function RiskControlsSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="RISK REGISTER" />
        {RISK_CONTROLS.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.riskRow,
              idx < RISK_CONTROLS.length - 1 && s.riskRowBorder,
            ]}
          >
            <View style={s.riskHeader}>
              <View
                style={[
                  s.riskSeverityDot,
                  { backgroundColor: severityDotColor(item.severity) },
                ]}
              />
              <ThemedText style={s.riskTitle} numberOfLines={1}>
                {item.title}
              </ThemedText>
            </View>
            <View style={s.riskMeta}>
              <ThemedText style={s.riskCategory}>
                {item.category}
              </ThemedText>
              <ThemedText style={s.riskOwner}>
                Owner: {item.owner}
              </ThemedText>
            </View>
            <ThemedText style={s.riskMitigation} numberOfLines={2}>
              {item.mitigation}
            </ThemedText>
            <View style={s.riskFooter}>
              <BizStatusChip
                label={
                  item.status === 'open'
                    ? 'Open'
                    : item.status === 'mitigated'
                      ? 'Mitigated'
                      : 'Accepted'
                }
                variant={
                  item.status === 'open'
                    ? 'error'
                    : item.status === 'mitigated'
                      ? 'success'
                      : 'neutral'
                }
              />
              <View
                style={[
                  s.severityBadge,
                  {
                    backgroundColor:
                      severityDotColor(item.severity) + '15',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    s.severityBadgeText,
                    { color: severityDotColor(item.severity) },
                  ]}
                >
                  {item.severity.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: AUDIT (Sub-tab 13)
// =============================================================================

function AuditSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="AUDIT LOG" />
        {AUDIT_LOG.map((entry, idx) => (
          <View
            key={entry.id}
            style={[
              s.auditRow,
              idx < AUDIT_LOG.length - 1 && s.auditRowBorder,
            ]}
          >
            <View style={s.auditHeader}>
              <ThemedText style={s.auditDate}>{entry.date}</ThemedText>
              <View
                style={[
                  s.typeBadge,
                  { backgroundColor: BP.champagneGold + '15' },
                ]}
              >
                <ThemedText style={s.typeBadgeText}>
                  {entry.category.toUpperCase()}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={s.auditAction}>{entry.action}</ThemedText>
            <ThemedText style={s.auditDetail} numberOfLines={2}>
              {entry.detail}
            </ThemedText>
            <ThemedText style={s.auditActor}>
              By {entry.actor}
            </ThemedText>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SECTION: BOARD PACK BUILDER (Sub-tab 14)
// =============================================================================

function BoardPackSection_() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="BOARD PACK BUILDER" />
        <ThemedText style={s.boardPackSubtitle}>
          Q1 2026 Board Meeting — Feb 20
        </ThemedText>
        {BOARD_PACK_SECTIONS.map((section, idx) => (
          <View
            key={section.id}
            style={[
              s.boardRow,
              idx < BOARD_PACK_SECTIONS.length - 1 && s.boardRowBorder,
            ]}
          >
            <View style={s.boardRowLeft}>
              <View
                style={[
                  s.boardCheckbox,
                  {
                    backgroundColor:
                      section.status === 'complete'
                        ? BP.emerald + '20'
                        : BP.glass,
                    borderColor:
                      section.status === 'complete'
                        ? BP.emerald
                        : BP.graphite,
                  },
                ]}
              >
                {section.status === 'complete' && (
                  <IconSymbol
                    name={"checkmark" as any}
                    size={10}
                    color={BP.emerald}
                  />
                )}
              </View>
              <View style={s.boardContent}>
                <ThemedText
                  style={[
                    s.boardTitle,
                    section.status === 'complete' && s.boardTitleDone,
                  ]}
                  numberOfLines={1}
                >
                  {section.title}
                </ThemedText>
                <View style={s.boardMeta}>
                  <ThemedText style={s.boardAssignee}>
                    {section.assignee}
                  </ThemedText>
                  <ThemedText style={s.boardDue}>
                    Due: {section.dueDate}
                  </ThemedText>
                </View>
              </View>
            </View>
            <BizStatusChip
              label={boardPackStatusLabel(section.status)}
              variant={boardPackStatusVariant(section.status)}
            />
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB CONTENT ROUTER
// =============================================================================

function SubTabContent({
  activeTab,
  role,
  onExplain,
}: {
  activeTab: FinanceSubTab;
  role: BusinessRoleLens;
  onExplain: (entry: LedgerEntry) => void;
}) {
  switch (activeTab) {
    case 'overview':
      return <OverviewSection role={role} />;
    case 'ledger':
      return <LedgerSection onExplain={onExplain} />;
    case 'budgets':
      return <BudgetsSection />;
    case 'commitments':
      return <CommitmentsSection />;
    case 'receivables':
      return <ReceivablesSection />;
    case 'payables':
      return <PayablesSection />;
    case 'approvals':
      return <ApprovalsSection />;
    case 'splits':
      return <SplitsSection />;
    case 'revenue':
      return <RevenueSection />;
    case 'costs_burn':
      return <CostsBurnSection />;
    case 'entities':
      return <EntitiesSection />;
    case 'risk_controls':
      return <RiskControlsSection />;
    case 'audit':
      return <AuditSection />;
    case 'board_pack':
      return <BoardPackSection_ />;
    default:
      return null;
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessFinance({ colors, role = 'B1' }: Props) {
  const visibleTabs = getFinanceSubTabs(role);
  const [activeTab, setActiveTab] = useState<FinanceSubTab>(
    visibleTabs.length > 0 ? visibleTabs[0].id : 'overview',
  );
  const [explainEntry, setExplainEntry] = useState<LedgerEntry | null>(null);

  // B3 / B4 / B5: locked
  if (visibleTabs.length === 0) {
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
        <BizEmptyLock
          title="Finance Locked"
          message="Financial data is restricted. Contact the Founder for access."
        />
        <View style={s.bottomSpacer} />
      </ScrollView>
    );
  }

  // Ensure activeTab is valid for the current role
  const isTabValid = visibleTabs.some((t) => t.id === activeTab);
  const resolvedTab = isTabValid ? activeTab : visibleTabs[0].id;

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={s.container}
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

        {/* Truth Strip */}
        <TruthStrip />

        {/* Sub-tab bar */}
        <BizSubTabBar
          tabs={visibleTabs}
          activeId={resolvedTab}
          onSelect={(id) => setActiveTab(id as FinanceSubTab)}
        />

        {/* Content */}
        <SubTabContent
          activeTab={resolvedTab}
          role={role}
          onExplain={setExplainEntry}
        />

        {/* Bottom spacer */}
        <View style={s.bottomSpacer} />
      </ScrollView>

      {/* Explain This Dollar Overlay */}
      {explainEntry && (
        <Pressable
          style={s.explainOverlay}
          onPress={() => setExplainEntry(null)}
        >
          <Pressable style={s.explainSheet} onPress={() => {}}>
            <View style={s.explainHeader}>
              <ThemedText style={s.explainTitle}>Explain This Dollar</ThemedText>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExplainEntry(null);
                }}
                style={({ pressed }) => [
                  s.explainClose,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <IconSymbol name={"xmark" as any} size={14} color={BP.smoke} />
              </Pressable>
            </View>

            {/* Entry Summary */}
            <View style={s.explainSection}>
              <ThemedText style={s.explainSectionTitle}>TRANSACTION</ThemedText>
              <ThemedText style={s.explainDesc}>
                {explainEntry.description}
              </ThemedText>
              <View style={s.explainRow}>
                <ThemedText style={s.explainLabel}>Amount</ThemedText>
                <ThemedText
                  style={[
                    s.explainValue,
                    {
                      color:
                        explainEntry.credit > 0 ? BP.emerald : BP.red,
                    },
                  ]}
                >
                  {explainEntry.credit > 0
                    ? `+${formatCurrency(explainEntry.credit)}`
                    : `-${formatCurrency(explainEntry.debit)}`}
                </ThemedText>
              </View>
              <View style={s.explainRow}>
                <ThemedText style={s.explainLabel}>Entity</ThemedText>
                <ThemedText style={s.explainValue}>
                  {explainEntry.entity}
                </ThemedText>
              </View>
              <View style={s.explainRow}>
                <ThemedText style={s.explainLabel}>Category</ThemedText>
                <ThemedText style={s.explainValue}>
                  {explainEntry.category}
                </ThemedText>
              </View>
            </View>

            {/* Provenance Chain */}
            <View style={s.explainSection}>
              <ThemedText style={s.explainSectionTitle}>
                PROVENANCE CHAIN
              </ThemedText>
              {[
                { step: 'Source', detail: `${explainEntry.category} — ${explainEntry.entity}`, done: true },
                { step: 'Rule Check', detail: 'Policy engine passed — no exceptions', done: true },
                { step: 'Authorization', detail: 'Approved by Sammy K. (Founder)', done: true },
                { step: 'Settlement', detail: explainEntry.credit > 0 ? 'Deposited via Mercury ACH' : 'Disbursed via Mercury ACH', done: explainEntry.balance > 0 },
              ].map((node, idx) => (
                <View key={idx} style={s.provenanceNode}>
                  <View style={s.provenanceDotCol}>
                    <View
                      style={[
                        s.provenanceDot,
                        {
                          backgroundColor: node.done
                            ? BP.emerald
                            : BP.ash,
                        },
                      ]}
                    />
                    {idx < 3 && <View style={s.provenanceLine} />}
                  </View>
                  <View style={s.provenanceContent}>
                    <ThemedText style={s.provenanceStep}>
                      {node.step}
                    </ThemedText>
                    <ThemedText style={s.provenanceDetail}>
                      {node.detail}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
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

  // ---- Overview: KPI Grid ----
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiTile: {
    width: '48%',
    backgroundColor: BP.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BP.graphite,
    padding: Spacing.sm,
  },
  kpiTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BP.smoke,
    marginBottom: Spacing.xs,
  },
  kpiTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiTrendText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // ---- Overview: Summary Strip ----
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryDivider: {
    borderLeftWidth: 1,
    borderLeftColor: BP.graphite,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: BP.smoke,
  },

  // ---- Ledger ----
  ledgerRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  ledgerRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  ledgerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  ledgerDate: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    marginBottom: 2,
  },
  ledgerDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: BP.smoke,
    lineHeight: 17,
    marginBottom: 2,
  },
  ledgerEntity: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.platinum,
  },
  ledgerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ledgerAmount: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  ledgerBalance: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },

  // ---- Budgets ----
  budgetRow: {
    paddingVertical: Spacing.sm,
  },
  budgetRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  budgetCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
    marginRight: Spacing.sm,
  },
  budgetBarBg: {
    height: 6,
    backgroundColor: BP.glass,
    borderRadius: 3,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: 6,
    borderRadius: 3,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetFooterText: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },

  // ---- Commitments ----
  commitRow: {
    paddingVertical: Spacing.sm,
  },
  commitRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  commitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
    marginRight: Spacing.sm,
  },
  commitCounterparty: {
    fontSize: 11,
    fontWeight: '500',
    color: BP.ash,
    marginBottom: Spacing.sm,
  },
  commitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  commitAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  commitDue: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
    flex: 1,
  },

  // ---- Receivables ----
  recvRow: {
    paddingVertical: Spacing.sm,
  },
  recvRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  recvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recvFrom: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
    marginRight: Spacing.sm,
  },
  recvAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  recvMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  recvDate: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },
  recvFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  daysPastBadge: {
    backgroundColor: BP.red + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  daysPastText: {
    fontSize: 10,
    fontWeight: '700',
    color: BP.red,
  },

  // ---- Payables ----
  payRow: {
    paddingVertical: Spacing.sm,
  },
  payRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  payHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  payTo: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
    marginRight: Spacing.sm,
  },
  payAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  payFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  payCategory: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },
  payDue: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
    flex: 1,
  },

  // ---- Approvals ----
  approvalRow: {
    paddingVertical: Spacing.sm,
  },
  approvalRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  approvalTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
    marginRight: Spacing.sm,
  },
  approvalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  approvalAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  approvalRequester: {
    fontSize: 11,
    fontWeight: '500',
    color: BP.ash,
  },
  approvalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  approvalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  approvalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  approvalBtnApprove: {
    borderColor: BP.emerald + '40',
    backgroundColor: BP.emerald + '10',
  },
  approvalBtnReject: {
    borderColor: BP.red + '40',
    backgroundColor: BP.red + '10',
  },
  approvalBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ---- Splits ----
  splitRow: {
    paddingVertical: Spacing.sm,
  },
  splitRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  splitEntity: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
  },
  splitPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  splitBarBg: {
    height: 8,
    backgroundColor: BP.glass,
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  splitBarFill: {
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  splitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitCategory: {
    fontSize: 11,
    fontWeight: '500',
    color: BP.ash,
  },
  splitAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: BP.smoke,
  },

  // ---- Revenue ----
  revenueRow: {
    paddingVertical: Spacing.sm,
  },
  revenueRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  revenueSource: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
    marginRight: Spacing.sm,
  },
  revenueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  revenueAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  revenuePeriod: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
    flex: 1,
  },

  // ---- Costs / Burn ----
  costRow: {
    paddingVertical: Spacing.sm,
  },
  costRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  costCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
    marginRight: Spacing.sm,
  },
  costTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costTrendText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  costBarBg: {
    height: 6,
    backgroundColor: BP.glass,
    borderRadius: 3,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  costBarFill: {
    height: 6,
    borderRadius: 3,
  },
  costFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costAmount: {
    fontSize: 11,
    fontWeight: '600',
    color: BP.smoke,
  },
  costAnnual: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },
  costPercent: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },

  // ---- Entities ----
  entityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  entityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entityStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entityName: {
    fontSize: 15,
    fontWeight: '700',
    color: BP.smoke,
  },
  entityMetrics: {
    flexDirection: 'row',
  },
  entityMetricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  entityMetricDivider: {
    borderLeftWidth: 1,
    borderLeftColor: BP.graphite,
  },
  entityMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  entityMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: BP.smoke,
  },

  // ---- Risk / Controls ----
  riskRow: {
    paddingVertical: Spacing.sm,
  },
  riskRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  riskSeverityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
  },
  riskMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  riskCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  riskOwner: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },
  riskMitigation: {
    fontSize: 12,
    fontWeight: '400',
    color: BP.platinum,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  riskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  severityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ---- Audit ----
  auditRow: {
    paddingVertical: Spacing.sm,
  },
  auditRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  auditDate: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    marginBottom: 2,
  },
  auditDetail: {
    fontSize: 12,
    fontWeight: '400',
    color: BP.platinum,
    lineHeight: 16,
    marginBottom: 4,
  },
  auditActor: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },

  // ---- Board Pack ----
  boardPackSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: BP.ash,
    marginBottom: Spacing.md,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  boardRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  boardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  boardCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardContent: {
    flex: 1,
  },
  boardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    marginBottom: 2,
  },
  boardTitleDone: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  boardMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  boardAssignee: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },
  boardDue: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },

  // ---- Shared ----
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: BP.champagneGold,
    letterSpacing: 0.3,
  },

  // ---- Truth Strip ----
  truthStripScroll: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  truthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BP.glass,
    borderWidth: 1,
    borderColor: BP.graphite,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  truthLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    letterSpacing: 0.3,
  },
  truthValue: {
    fontSize: 11,
    fontWeight: '700',
    color: BP.smoke,
  },

  // ---- Release Queue ----
  releaseRow: {
    paddingVertical: Spacing.sm,
  },
  releaseRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  releaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  releaseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
    marginRight: Spacing.sm,
  },
  releaseAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  releaseMeta: {
    marginBottom: Spacing.sm,
  },
  releaseDetail: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
    marginBottom: 2,
  },
  releaseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  releaseCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BP.champagneGold + '40',
    backgroundColor: BP.champagneGold + '10',
  },
  releaseCtaText: {
    fontSize: 11,
    fontWeight: '600',
    color: BP.champagneGold,
  },

  // ---- Runway ----
  runwayKpi: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  runwayValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  runwayValue: {
    fontSize: 32,
    fontWeight: '800',
    color: BP.smoke,
  },
  runwayUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.ash,
  },
  runwayFormula: {
    fontSize: 11,
    fontWeight: '500',
    color: BP.platinum,
    marginBottom: Spacing.md,
  },
  runwayBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: BP.glass,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  runwayBarFill: {
    height: 8,
    borderRadius: 4,
  },
  runwayLegend: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  runwayLegendText: {
    fontSize: 9,
    fontWeight: '500',
    color: BP.ash,
  },

  // ---- Explain This Dollar Overlay ----
  explainOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  explainSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  explainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  explainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BP.smoke,
  },
  explainClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BP.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainSection: {
    marginBottom: Spacing.md,
  },
  explainSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: BP.ash,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  explainDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  explainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  explainLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: BP.ash,
  },
  explainValue: {
    fontSize: 12,
    fontWeight: '600',
    color: BP.smoke,
  },

  // ---- Provenance Chain ----
  provenanceNode: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  provenanceDotCol: {
    width: 20,
    alignItems: 'center',
  },
  provenanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  provenanceLine: {
    width: 1,
    flex: 1,
    backgroundColor: BP.graphite,
    marginVertical: 2,
  },
  provenanceContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  provenanceStep: {
    fontSize: 12,
    fontWeight: '600',
    color: BP.smoke,
    marginBottom: 2,
  },
  provenanceDetail: {
    fontSize: 11,
    fontWeight: '400',
    color: BP.platinum,
    lineHeight: 15,
  },
});
