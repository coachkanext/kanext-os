/**
 * BizFinance — Company Financial Summary Surface (Finance Tab)
 * Single vertical scroll. Aggregates + Allocations only.
 * No charts. No projections. No predictive modeling. No color-coded posture.
 * Finance = Aggregates + Allocations. Ledger = Transactions + Audit.
 */
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
  onNavigateTab?: (tabIndex: number) => void;
}

// =============================================================================
// INLINE DATA — Structured aggregates only
// =============================================================================

const FISCAL_YEARS = ['FY 2025', 'FY 2024'];

const CAPITAL = {
  totalRaisedLifetime: '$1.2M',
  raisedCurrentFY: '$750K',
  debtOutstanding: '$0',
  cashPosition: '$480K',
};

const ACTIVE_RAISE = {
  exists: true,
  roundName: 'Pre-Seed',
  targetAmount: '$1.5M',
  committed: '$750K',
  remaining: '$750K',
};

const BUDGET_ALLOCATIONS = {
  enabled: true,
  departments: [
    { name: 'Operations', allocated: '$120K', spent: '$78K', remaining: '$42K' },
    { name: 'Product', allocated: '$95K', spent: '$62K', remaining: '$33K' },
    { name: 'Marketing', allocated: '$45K', spent: '$18K', remaining: '$27K' },
    { name: 'Facilities', allocated: '$36K', spent: '$24K', remaining: '$12K' },
  ],
};

const EQUITY = {
  sharesOutstanding: '10,000,000',
  founderOwnership: '85%',
  optionPool: '5%',
  structure: 'Common Only',
};

const DEBT = {
  exists: false,
  totalDebt: '$0',
};

// Tab indices: 0=Program, 1=People, 2=Finance, 3=Compliance, 4=Facilities, 5=Ledger
const TAB_LEDGER = 5;
const TAB_COMPLIANCE = 3;

const QUICK_LINKS = [
  { id: 'ledger', label: 'Open Ledger', tabIndex: TAB_LEDGER },
  { id: 'compliance', label: 'Open Compliance', tabIndex: TAB_COMPLIANCE },
  { id: 'vault', label: 'Open Vault (Financial Documents)', tabIndex: TAB_LEDGER },
  { id: 'deals', label: 'Open Deals', tabIndex: TAB_LEDGER },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function BizFinance({ colors, onNavigateTab }: Props) {
  const [fiscalYear, setFiscalYear] = useState(FISCAL_YEARS[0]);

  const navigate = (tabIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigateTab?.(tabIndex);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Block 0 — Header */}
      <View style={[s.block, { borderColor: colors.border }]}>
        <ThemedText style={[s.pageTitle, { color: colors.text }]}>Finance</ThemedText>
        <View style={s.fyRow}>
          {FISCAL_YEARS.map((fy) => (
            <Pressable
              key={fy}
              style={[
                s.fyPill,
                { backgroundColor: fy === fiscalYear ? colors.text : colors.backgroundTertiary },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFiscalYear(fy);
              }}
            >
              <ThemedText
                style={[
                  s.fyText,
                  { color: fy === fiscalYear ? colors.background : colors.textSecondary },
                ]}
              >
                {fy}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Block 1 — Capital Summary → Tap opens Ledger */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>CAPITAL SUMMARY</ThemedText>
      <Pressable
        style={({ pressed }) => [
          s.block,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => navigate(TAB_LEDGER)}
      >
        <FieldRow label="Total Capital Raised (Lifetime)" value={CAPITAL.totalRaisedLifetime} colors={colors} />
        <FieldRow label="Capital Raised (Current FY)" value={CAPITAL.raisedCurrentFY} colors={colors} />
        <FieldRow label="Debt Outstanding" value={CAPITAL.debtOutstanding} colors={colors} />
        <FieldRow label="Cash Position" value={CAPITAL.cashPosition} colors={colors} />
        <View style={s.tapHintRow}>
          <ThemedText style={[s.tapHint, { color: colors.textTertiary }]}>View in Ledger</ThemedText>
          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
        </View>
      </Pressable>

      {/* Block 2 — Active Raise */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>ACTIVE RAISE</ThemedText>
      <Pressable
        style={({ pressed }) => [
          s.block,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => navigate(TAB_LEDGER)}
      >
        {ACTIVE_RAISE.exists ? (
          <>
            <FieldRow label="Round Name" value={ACTIVE_RAISE.roundName} colors={colors} />
            <FieldRow label="Target Amount" value={ACTIVE_RAISE.targetAmount} colors={colors} />
            <FieldRow label="Committed" value={ACTIVE_RAISE.committed} colors={colors} />
            <FieldRow label="Remaining" value={ACTIVE_RAISE.remaining} colors={colors} />
            <View style={s.tapHintRow}>
              <ThemedText style={[s.tapHint, { color: colors.textTertiary }]}>View in Deals</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </View>
          </>
        ) : (
          <ThemedText style={[s.emptyNote, { color: colors.textTertiary }]}>
            No active capital raise.
          </ThemedText>
        )}
      </Pressable>

      {/* Block 3 — Budget Allocations */}
      {BUDGET_ALLOCATIONS.enabled && (
        <>
          <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>BUDGET ALLOCATIONS</ThemedText>
          {BUDGET_ALLOCATIONS.departments.map((dept) => (
            <Pressable
              key={dept.name}
              style={({ pressed }) => [
                s.block,
                s.deptBlock,
                { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => navigate(TAB_LEDGER)}
            >
              <View style={s.deptHeader}>
                <ThemedText style={[s.deptName, { color: colors.text }]}>{dept.name}</ThemedText>
                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </View>
              <FieldRow label="Allocated" value={dept.allocated} colors={colors} />
              <FieldRow label="Spent to Date" value={dept.spent} colors={colors} />
              <FieldRow label="Remaining" value={dept.remaining} colors={colors} />
            </Pressable>
          ))}
        </>
      )}

      {/* Block 4 — Equity Summary → Tap opens Vault */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>EQUITY SUMMARY</ThemedText>
      <Pressable
        style={({ pressed }) => [
          s.block,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => navigate(TAB_LEDGER)}
      >
        <FieldRow label="Total Shares Outstanding" value={EQUITY.sharesOutstanding} colors={colors} />
        <FieldRow label="Founder Ownership" value={EQUITY.founderOwnership} colors={colors} />
        <FieldRow label="Option Pool" value={EQUITY.optionPool} colors={colors} />
        <FieldRow label="Structure" value={EQUITY.structure} colors={colors} />
        <View style={s.tapHintRow}>
          <ThemedText style={[s.tapHint, { color: colors.textTertiary }]}>View in Vault</ThemedText>
          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
        </View>
      </Pressable>

      {/* Block 5 — Debt Summary */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>DEBT SUMMARY</ThemedText>
      <Pressable
        style={({ pressed }) => [
          s.block,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => navigate(TAB_LEDGER)}
      >
        <ThemedText style={[s.emptyNote, { color: colors.textTertiary }]}>
          No outstanding debt.
        </ThemedText>
      </Pressable>

      {/* Block 6 — Quick Links */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>QUICK LINKS</ThemedText>
      <View style={[s.block, { borderColor: colors.border }]}>
        {QUICK_LINKS.map((link, idx) => (
          <Pressable
            key={link.id}
            style={({ pressed }) => [
              s.linkRow,
              { opacity: pressed ? 0.6 : 1 },
              idx < QUICK_LINKS.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={() => navigate(link.tabIndex)}
          >
            <ThemedText style={[s.linkText, { color: colors.text }]}>{link.label}</ThemedText>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function FieldRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.fieldRow}>
      <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[s.fieldValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
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

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  block: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  // Header
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  fyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fyPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fyText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Tap hint
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Department allocation cards
  deptBlock: {
    marginBottom: Spacing.sm,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Empty note
  emptyNote: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Quick links
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Field rows
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '55%',
  },
});
