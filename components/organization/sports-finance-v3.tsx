/**
 * Sports Finance V3 — 3-pill ViewBar (Budget | Scholarships | NIL)
 * Carroll Men's Basketball · NAIA Frontier Conference
 * Head Coach / GM perspective. Inline mock data, no DrillMode.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================


const ACCENT = MODE_ACCENT.sports;
type ViewId = 'budget' | 'scholarships' | 'nil';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'nil', label: 'NIL' },
];

// -- Budget data --

const BUDGET_SUMMARY = {
  total: 250000,
  spent: 162500,
};

const REVENUE_ITEMS = [
  { id: 'r1', label: 'Tickets', amount: 45000 },
  { id: 'r2', label: 'Merch', amount: 12000 },
  { id: 'r3', label: 'Donations', amount: 35000 },
  { id: 'r4', label: 'Sponsorships', amount: 20000 },
  { id: 'r5', label: 'Camp Fees', amount: 8000 },
  { id: 'r6', label: 'Fundraising', amount: 15000 },
];

const EXPENSE_ITEMS = [
  { id: 'e1', label: 'Travel', amount: 48000 },
  { id: 'e2', label: 'Equipment', amount: 22000 },
  { id: 'e3', label: 'Meals', amount: 18000 },
  { id: 'e4', label: 'Officials', amount: 8000 },
  { id: 'e5', label: 'Facility Costs', amount: 15000 },
  { id: 'e6', label: 'Gear', amount: 12000 },
  { id: 'e7', label: 'Recruiting', amount: 10000 },
];

const SPONSORS = [
  { id: 'sp1', name: 'Sun Coast Auto', amount: 15000 },
  { id: 'sp2', name: 'Blue Wave Sports', amount: 8000 },
  { id: 'sp3', name: 'Helena Chamber', amount: 5000 },
];

// -- Scholarship data --

const SCHOLARSHIP_SUMMARY = {
  totalBudget: 180000,
  allocated: 156000,
  remaining: 24000,
  slotsRemaining: 4,
};

interface ScholarshipRow {
  id: string;
  player: string;
  team: string;
  amount: number;
  type: 'Full' | 'Partial' | 'Walk-on';
  status: 'Active';
}

const SCHOLARSHIPS: ScholarshipRow[] = [
  { id: 'sc1', player: 'Jaylen Thompson', team: 'Varsity', amount: 18000, type: 'Full', status: 'Active' },
  { id: 'sc2', player: 'DeShawn Carter', team: 'Varsity', amount: 18000, type: 'Full', status: 'Active' },
  { id: 'sc3', player: 'Marcus Lane', team: 'Varsity', amount: 15000, type: 'Full', status: 'Active' },
  { id: 'sc4', player: 'Terrell Davis', team: 'Varsity', amount: 12000, type: 'Partial', status: 'Active' },
  { id: 'sc5', player: 'Brandon Ellis', team: 'Dev 1', amount: 10000, type: 'Partial', status: 'Active' },
  { id: 'sc6', player: 'Andre Johnson', team: 'Dev 1', amount: 10000, type: 'Partial', status: 'Active' },
  { id: 'sc7', player: 'Corey Mitchell', team: 'Dev 2', amount: 8000, type: 'Partial', status: 'Active' },
  { id: 'sc8', player: 'Damon Wright', team: 'Varsity', amount: 8000, type: 'Walk-on', status: 'Active' },
];

// -- NIL data --

const NIL_TOTAL = 42000;

interface NILDeal {
  id: string;
  player: string;
  sponsor: string;
  value: number;
  term: string;
  status: 'Active';
}

const NIL_DEALS: NILDeal[] = [
  { id: 'nil1', player: 'Jaylen Thompson', sponsor: 'Sun Coast Auto', value: 15000, term: '12 months', status: 'Active' },
  { id: 'nil2', player: 'DeShawn Carter', sponsor: 'Blue Wave Sports', value: 12000, term: '6 months', status: 'Active' },
  { id: 'nil3', player: 'Marcus Lane', sponsor: 'Helena Barbershop', value: 8000, term: '12 months', status: 'Active' },
  { id: 'nil4', player: 'Terrell Davis', sponsor: 'Helena Chamber', value: 7000, term: '8 months', status: 'Active' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// VIEW: BUDGET
// =============================================================================

function BudgetView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const pct = Math.round((BUDGET_SUMMARY.spent / BUDGET_SUMMARY.total) * 100);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Summary */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>BUDGET OVERVIEW</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Total</ThemedText>
            <ThemedText style={[s.summaryValue, { color: accentColor }]}>
              {formatCurrency(BUDGET_SUMMARY.total)}
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Spent</ThemedText>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {formatCurrency(BUDGET_SUMMARY.spent)}
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Used</ThemedText>
            <ThemedText style={[s.summaryValue, { color: pct > 80 ? '#F59E0B' : '#22C55E' }]}>
              {pct}%
            </ThemedText>
          </View>
        </View>
        <ProgressBar percent={pct} color={accentColor} />
      </View>

      {/* Revenue */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>REVENUE</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {REVENUE_ITEMS.map((item, i) => (
          <View
            key={item.id}
            style={[
              s.lineItem,
              { borderBottomColor: colors.border },
              i === REVENUE_ITEMS.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.lineLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <ThemedText style={[s.lineAmount, { color: '#22C55E' }]}>{formatCurrency(item.amount)}</ThemedText>
          </View>
        ))}
      </View>

      {/* Expenses */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>EXPENSES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {EXPENSE_ITEMS.map((item, i) => (
          <View
            key={item.id}
            style={[
              s.lineItem,
              { borderBottomColor: colors.border },
              i === EXPENSE_ITEMS.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <ThemedText style={[s.lineLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <ThemedText style={[s.lineAmount, { color: '#EF4444' }]}>{formatCurrency(item.amount)}</ThemedText>
          </View>
        ))}
      </View>

      {/* Sponsors */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SPONSORS</ThemedText>
      {SPONSORS.map((sp) => (
        <View
          key={sp.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.sponsorRow}>
            <IconSymbol name="star.fill" size={14} color={accentColor} />
            <ThemedText style={[s.sponsorName, { color: colors.text }]}>{sp.name}</ThemedText>
            <ThemedText style={[s.sponsorAmount, { color: accentColor }]}>
              {formatCurrency(sp.amount)}/yr
            </ThemedText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: SCHOLARSHIPS
// =============================================================================

function ScholarshipsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const allocatedPct = Math.round((SCHOLARSHIP_SUMMARY.allocated / SCHOLARSHIP_SUMMARY.totalBudget) * 100);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Summary */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SCHOLARSHIP OVERVIEW</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Total</ThemedText>
            <ThemedText style={[s.summaryValue, { color: accentColor }]}>
              {formatCurrency(SCHOLARSHIP_SUMMARY.totalBudget)}
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Allocated</ThemedText>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>
              {formatCurrency(SCHOLARSHIP_SUMMARY.allocated)}
            </ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Remaining</ThemedText>
            <ThemedText style={[s.summaryValue, { color: '#22C55E' }]}>
              {formatCurrency(SCHOLARSHIP_SUMMARY.remaining)}
            </ThemedText>
          </View>
        </View>
        <ProgressBar percent={allocatedPct} color={accentColor} />
        <View style={s.slotsRow}>
          <IconSymbol name="person.badge.plus" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.slotsText, { color: colors.textSecondary }]}>
            {SCHOLARSHIP_SUMMARY.slotsRemaining} aid slots remaining
          </ThemedText>
        </View>
      </View>

      {/* Scholarship List */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ALLOCATIONS</ThemedText>
      {SCHOLARSHIPS.map((row) => (
        <View
          key={row.id}
          style={[s.listRow, { borderBottomColor: colors.border }]}
        >
          <View style={s.listRowLeft}>
            <ThemedText style={[s.listRowName, { color: colors.text }]}>{row.player}</ThemedText>
            <ThemedText style={[s.listRowSub, { color: colors.textSecondary }]}>{row.team}</ThemedText>
          </View>
          <View style={s.listRowRight}>
            <ThemedText style={[s.listRowAmount, { color: accentColor }]}>
              {formatCurrency(row.amount)}
            </ThemedText>
            <View style={s.listRowBadges}>
              <StatusBadge
                label={row.type.toUpperCase()}
                color={row.type === 'Full' ? '#22C55E' : row.type === 'Partial' ? ACCENT : '#A1A1AA'}
              />
              <StatusBadge label="ACTIVE" color="#22C55E" />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: NIL
// =============================================================================

function NILView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Summary */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>NIL OVERVIEW</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.nilSummary}>
          <ThemedText style={[s.nilLabel, { color: colors.textSecondary }]}>Total NIL Flowing</ThemedText>
          <ThemedText style={[s.nilValue, { color: accentColor }]}>{formatCurrency(NIL_TOTAL)}</ThemedText>
        </View>
        <View style={s.nilStats}>
          <View style={s.nilStatItem}>
            <ThemedText style={[s.nilStatValue, { color: colors.text }]}>{NIL_DEALS.length}</ThemedText>
            <ThemedText style={[s.nilStatLabel, { color: colors.textSecondary }]}>Active Deals</ThemedText>
          </View>
          <View style={s.nilStatItem}>
            <ThemedText style={[s.nilStatValue, { color: colors.text }]}>
              {formatCurrency(Math.round(NIL_TOTAL / NIL_DEALS.length))}
            </ThemedText>
            <ThemedText style={[s.nilStatLabel, { color: colors.textSecondary }]}>Avg per Deal</ThemedText>
          </View>
        </View>
      </View>

      {/* Active Deals */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ACTIVE DEALS</ThemedText>
      {NIL_DEALS.map((deal) => (
        <View
          key={deal.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.nilDealHeader}>
            <View style={s.nilDealInfo}>
              <ThemedText style={[s.nilDealPlayer, { color: colors.text }]}>{deal.player}</ThemedText>
              <ThemedText style={[s.nilDealSponsor, { color: colors.textSecondary }]}>{deal.sponsor}</ThemedText>
            </View>
            <ThemedText style={[s.nilDealValue, { color: accentColor }]}>{formatCurrency(deal.value)}</ThemedText>
          </View>
          <View style={[s.nilDealMeta, { borderTopColor: colors.border }]}>
            <View style={s.nilDealMetaItem}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.nilDealMetaText, { color: colors.textSecondary }]}>{deal.term}</ThemedText>
            </View>
            <StatusBadge label="ACTIVE" color="#22C55E" />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsFinance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('budget');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'budget':
        return <BudgetView colors={colors} accentColor={accentColor} />;
      case 'scholarships':
        return <ScholarshipsView colors={colors} accentColor={accentColor} />;
      case 'nil':
        return <NILView colors={colors} accentColor={accentColor} />;
    }
  };

  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.pill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handlePillPress(v.id)}
            >
              <ThemedText
                style={[
                  s.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
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

  // -- ViewBar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scroll --
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Header --
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
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
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Summary --
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Line items --
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lineLabel: {
    fontSize: 13,
  },
  lineAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Sponsors --
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sponsorName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  sponsorAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Scholarship slots --
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  slotsText: {
    fontSize: 12,
  },

  // -- List row --
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listRowLeft: {
    flex: 1,
  },
  listRowName: {
    fontSize: 13,
    fontWeight: '600',
  },
  listRowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  listRowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  listRowAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  listRowBadges: {
    flexDirection: 'row',
    gap: 4,
  },

  // -- NIL --
  nilSummary: {
    alignItems: 'center',
    marginBottom: 12,
  },
  nilLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  nilValue: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  nilStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nilStatItem: {
    alignItems: 'center',
  },
  nilStatValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  nilStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  nilDealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  nilDealInfo: {
    flex: 1,
  },
  nilDealPlayer: {
    fontSize: 14,
    fontWeight: '700',
  },
  nilDealSponsor: {
    fontSize: 12,
    marginTop: 2,
  },
  nilDealValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  nilDealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nilDealMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nilDealMetaText: {
    fontSize: 12,
  },
});
