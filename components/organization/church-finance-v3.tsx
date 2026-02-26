/**
 * Church Finance V3 — Campus Budget Constraints + Allocations (Single-Scroll)
 * 6 blocks: Header, Campus Budget Summary, Giving Overview, Ministry Allocations,
 *           Operational Buckets, Quick Links
 *
 * Finance = constraints + allocations. NOT ledger detail, NOT transaction history.
 * Campus-scoped, RBAC-aware. A1/A2 see high-level summaries only.
 * No donor identities, no payroll, no vendor banking, no inline editing.
 * All financial changes via Nexus governed writes.
 */
import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { isStaffLevel, isPastoralLevel, type ChurchRoleLens } from '@/utils/rbac/church-registry';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// HELPERS
// =============================================================================

function fmt(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function fmtShort(amount: number): string {
  if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return '$' + Math.round(amount / 1000) + 'K';
  return '$' + amount.toString();
}

function SectionLabel({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function ProgressBar({ percent, color, colors }: { percent: number; color: string; colors: typeof Colors.light }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// MOCK DATA — ICCLA (ICC Los Angeles) FY 2025-26
// =============================================================================

const BUDGET = {
  totalOperating: 320000,
  totalGivingReceived: 210000,
  allocated: 195000,
  remaining: 15000,
  status: 'Healthy' as const,
  fiscalYear: 'FY 2025-26',
};

const GIVING_CATEGORIES = [
  { id: 'gc-1', label: 'Tithes', amount: 151200 },
  { id: 'gc-2', label: 'Offerings', amount: 37800 },
  { id: 'gc-3', label: 'Missions', amount: 12600 },
  { id: 'gc-4', label: 'Designated', amount: 8400 },
];

interface MinistryAllocation {
  id: string;
  ministry: string;
  allocated: number;
  spent: number;
  remaining: number;
  yours: boolean;
}

const MINISTRY_ALLOCATIONS: MinistryAllocation[] = [
  { id: 'ma-1', ministry: "Children's Ministry", allocated: 20000, spent: 14200, remaining: 5800, yours: true },
  { id: 'ma-2', ministry: 'Singles Ministry', allocated: 8000, spent: 5100, remaining: 2900, yours: true },
  { id: 'ma-3', ministry: 'Worship', allocated: 35000, spent: 28000, remaining: 7000, yours: false },
  { id: 'ma-4', ministry: 'Youth', allocated: 25000, spent: 18500, remaining: 6500, yours: false },
  { id: 'ma-5', ministry: 'Outreach', allocated: 30000, spent: 22000, remaining: 8000, yours: false },
];

// Mock: A2 in Children's can see Children's detail
const USER_FINANCE_MINISTRIES = new Set(["Children's Ministry"]);

const OPERATIONAL_BUCKETS = [
  { id: 'ob-1', label: 'Facilities', amount: 45000 },
  { id: 'ob-2', label: 'Staff', amount: 120000 },
  { id: 'ob-3', label: 'Events', amount: 18000 },
  { id: 'ob-4', label: 'Outreach', amount: 12000 },
];

type BudgetStatus = 'Healthy' | 'Review' | 'Restricted';
const STATUS_COLOR: Record<BudgetStatus, string> = {
  Healthy: '#22C55E',
  Review: '#F59E0B',
  Restricted: '#EF4444',
};

// =============================================================================
// BLOCK 0 — HEADER
// =============================================================================

function HeaderBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.headerBlock}>
      <ThemedText style={[s.headerTitle, { color: colors.text }]}>Finance</ThemedText>
      <View style={[s.fyChip, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[s.fyText, { color: colors.textSecondary }]}>{BUDGET.fiscalYear}</ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// RBAC RESTRICTION NOTICE
// =============================================================================

function RestrictionNotice({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={[s.restrictionBanner, { backgroundColor: '#F59E0B10', borderColor: '#F59E0B30' }]}>
      <IconSymbol name="lock.fill" size={13} color="#F59E0B" />
      <ThemedText style={[s.restrictionText, { color: colors.textSecondary }]}>
        Detailed financial controls restricted. You see high-level summaries only.
      </ThemedText>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — CAMPUS BUDGET SUMMARY
// =============================================================================

function BudgetSummaryBlock({ colors, canSeeDollars }: { colors: typeof Colors.light; canSeeDollars: boolean }) {
  const statusColor = STATUS_COLOR[BUDGET.status];

  return (
    <>
      <SectionLabel label="CAMPUS BUDGET SUMMARY" colors={colors} />
      <Card colors={colors}>
        {canSeeDollars ? (
          <>
            <View style={s.budgetGrid}>
              <View style={s.budgetCell}>
                <ThemedText style={[s.budgetValue, { color: ACCENT }]}>{fmtShort(BUDGET.totalOperating)}</ThemedText>
                <ThemedText style={[s.budgetLabel, { color: colors.textTertiary }]}>Operating Budget</ThemedText>
              </View>
              <View style={s.budgetCell}>
                <ThemedText style={[s.budgetValue, { color: '#22C55E' }]}>{fmtShort(BUDGET.totalGivingReceived)}</ThemedText>
                <ThemedText style={[s.budgetLabel, { color: colors.textTertiary }]}>Giving Received</ThemedText>
              </View>
              <View style={s.budgetCell}>
                <ThemedText style={[s.budgetValue, { color: colors.text }]}>{fmtShort(BUDGET.allocated)}</ThemedText>
                <ThemedText style={[s.budgetLabel, { color: colors.textTertiary }]}>Allocated</ThemedText>
              </View>
              <View style={s.budgetCell}>
                <ThemedText style={[s.budgetValue, { color: '#22C55E' }]}>{fmtShort(BUDGET.remaining)}</ThemedText>
                <ThemedText style={[s.budgetLabel, { color: colors.textTertiary }]}>Remaining</ThemedText>
              </View>
            </View>
          </>
        ) : (
          <View style={s.statusOnly}>
            <ThemedText style={[s.statusOnlyLabel, { color: colors.textSecondary }]}>Budget Status</ThemedText>
            <View style={[s.statusChip, { backgroundColor: statusColor + '20' }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText style={[s.statusChipText, { color: statusColor }]}>{BUDGET.status}</ThemedText>
            </View>
          </View>
        )}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 2 — GIVING OVERVIEW (Aggregate Only)
// =============================================================================

function GivingOverviewBlock({ colors }: { colors: typeof Colors.light }) {
  const total = GIVING_CATEGORIES.reduce((sum, c) => sum + c.amount, 0);

  return (
    <>
      <SectionLabel label="GIVING OVERVIEW" colors={colors} />
      <Card colors={colors}>
        {GIVING_CATEGORIES.map((cat, idx) => {
          const pct = Math.round((cat.amount / total) * 100);
          return (
            <View
              key={cat.id}
              style={[
                s.givingRow,
                idx < GIVING_CATEGORIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={s.givingHeader}>
                  <ThemedText style={[s.givingLabel, { color: colors.text }]}>{cat.label}</ThemedText>
                  <ThemedText style={[s.givingAmount, { color: colors.text }]}>{fmt(cat.amount)}</ThemedText>
                </View>
                <ProgressBar percent={pct} color={ACCENT} colors={colors} />
              </View>
            </View>
          );
        })}
        <View style={s.givingFooter}>
          <ThemedText style={[s.givingFooterText, { color: colors.textTertiary }]}>
            Aggregate totals only. No donor lists or member-level data.
          </ThemedText>
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 3 — MINISTRY ALLOCATIONS
// =============================================================================

function MinistryAllocationsBlock({ colors, isA2 }: { colors: typeof Colors.light; isA2: boolean }) {
  return (
    <>
      <SectionLabel label="MINISTRY ALLOCATIONS" colors={colors} />
      <Card colors={colors}>
        {MINISTRY_ALLOCATIONS.map((alloc, idx) => {
          const canSeeDetail = isA2 && USER_FINANCE_MINISTRIES.has(alloc.ministry);
          const pct = Math.round((alloc.spent / alloc.allocated) * 100);

          return (
            <View
              key={alloc.id}
              style={[
                s.allocGroup,
                idx < MINISTRY_ALLOCATIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.allocHeader}>
                <ThemedText style={[s.allocName, { color: colors.text }]}>{alloc.ministry}</ThemedText>
                {alloc.yours && (
                  <View style={[s.yourBadge, { backgroundColor: ACCENT + '20' }]}>
                    <ThemedText style={[s.yourBadgeText, { color: ACCENT }]}>Yours</ThemedText>
                  </View>
                )}
              </View>
              {canSeeDetail ? (
                <>
                  <View style={s.allocStats}>
                    <View style={s.allocStat}>
                      <ThemedText style={[s.allocStatValue, { color: colors.text }]}>{fmtShort(alloc.allocated)}</ThemedText>
                      <ThemedText style={[s.allocStatLabel, { color: colors.textTertiary }]}>Allocated</ThemedText>
                    </View>
                    <View style={s.allocStat}>
                      <ThemedText style={[s.allocStatValue, { color: '#F59E0B' }]}>{fmtShort(alloc.spent)}</ThemedText>
                      <ThemedText style={[s.allocStatLabel, { color: colors.textTertiary }]}>Spent</ThemedText>
                    </View>
                    <View style={s.allocStat}>
                      <ThemedText style={[s.allocStatValue, { color: '#22C55E' }]}>{fmtShort(alloc.remaining)}</ThemedText>
                      <ThemedText style={[s.allocStatLabel, { color: colors.textTertiary }]}>Remaining</ThemedText>
                    </View>
                  </View>
                  <ProgressBar percent={pct} color={ACCENT} colors={colors} />
                </>
              ) : (
                <ThemedText style={[s.allocSummaryOnly, { color: colors.textTertiary }]}>
                  {fmtShort(alloc.allocated)} allocated
                </ThemedText>
              )}
            </View>
          );
        })}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 4 — OPERATIONAL BUCKETS (Optional, RBAC-gated)
// =============================================================================

function OperationalBucketsBlock({ colors, canSee }: { colors: typeof Colors.light; canSee: boolean }) {
  if (!canSee) return null;

  return (
    <>
      <SectionLabel label="OPERATIONAL BUCKETS" colors={colors} />
      <Card colors={colors}>
        <View style={s.bucketGrid}>
          {OPERATIONAL_BUCKETS.map((bucket) => (
            <View key={bucket.id} style={s.bucketCell}>
              <ThemedText style={[s.bucketValue, { color: colors.text }]}>{fmtShort(bucket.amount)}</ThemedText>
              <ThemedText style={[s.bucketLabel, { color: colors.textTertiary }]}>{bucket.label}</ThemedText>
            </View>
          ))}
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 5 — QUICK LINKS
// =============================================================================

function QuickLinksBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="QUICK LINKS" colors={colors} />
      <View style={s.quickLinksRow}>
        <Pressable
          style={({ pressed }) => [s.quickLinkCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="doc.text" size={20} color={ACCENT} />
          <ThemedText style={[s.quickLinkLabel, { color: colors.text }]}>Open Ledger</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.quickLinkCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="shield.checkmark.fill" size={20} color={ACCENT} />
          <ThemedText style={[s.quickLinkLabel, { color: colors.text }]}>Open Compliance</ThemedText>
        </Pressable>
      </View>
    </>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchFinance({ colors, accentColor, role }: Props) {
  const churchRole = (role ?? 'C8') as ChurchRoleLens;
  const canSeeDollars = isPastoralLevel(churchRole);
  const isA2 = isStaffLevel(churchRole);
  const canSeeBuckets = isPastoralLevel(churchRole);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scroll}
    >
      <HeaderBlock colors={colors} />
      <RestrictionNotice colors={colors} />
      <BudgetSummaryBlock colors={colors} canSeeDollars={canSeeDollars} />
      <GivingOverviewBlock colors={colors} />
      <MinistryAllocationsBlock colors={colors} isA2={isA2} />
      <OperationalBucketsBlock colors={colors} canSee={canSeeBuckets} />
      <QuickLinksBlock colors={colors} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Label --
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: 8,
  },

  // -- Card --
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },

  // -- Progress --
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Block 0: Header --
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  fyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fyText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Restriction Notice --
  restrictionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  restrictionText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },

  // -- Block 1: Budget Summary --
  budgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  budgetCell: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  budgetLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statusOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusOnlyLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Block 2: Giving Overview --
  givingRow: {
    paddingVertical: 10,
  },
  givingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  givingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  givingAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  givingFooter: {
    paddingTop: 8,
  },
  givingFooterText: {
    fontSize: 11,
  },

  // -- Block 3: Ministry Allocations --
  allocGroup: {
    paddingVertical: 10,
  },
  allocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  allocName: {
    fontSize: 14,
    fontWeight: '600',
  },
  yourBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  yourBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  allocStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  allocStat: {
    flex: 1,
    alignItems: 'center',
  },
  allocStatValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  allocStatLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  allocSummaryOnly: {
    fontSize: 13,
  },

  // -- Block 4: Operational Buckets --
  bucketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bucketCell: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bucketValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  bucketLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Block 5: Quick Links --
  quickLinksRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickLinkCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  quickLinkLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
