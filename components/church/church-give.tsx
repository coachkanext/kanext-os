/**
 * Church Give — 6-view pill-toggled generosity, stewardship, and financial governance hub.
 * Views: Give Now | Funds | History | Pledges | Finance Console | Settings
 *
 * RBAC:
 *   C1/C2 — All 6 views, full financial governance
 *   C3    — Give Now, Funds, History, Pledges (staff can give + see history)
 *   C4    — Give Now, Funds, History, Pledges (member default = Give Now)
 *   C5    — Give Now only (visitor one-time gift)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';

// RBAC
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isSeniorPastor,
  isElderLevel,
  isStaffLevel,
  isMember,
} from '@/utils/church-rbac';

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}

type GiveView = 'give-now' | 'funds' | 'history' | 'pledges' | 'finance-console' | 'settings';

interface ViewDef { id: GiveView; label: string }

function getAvailableViews(role: ChurchRoleLens): ViewDef[] {
  const all: ViewDef[] = [
    { id: 'give-now', label: 'Give Now' },
    { id: 'funds', label: 'Funds' },
    { id: 'history', label: 'History' },
    { id: 'pledges', label: 'Pledges' },
    { id: 'finance-console', label: 'Finance Console' },
    { id: 'settings', label: 'Settings' },
  ];
  // C1/C2: all 6 views
  if (isElderLevel(role)) return all;
  // C3/C4: give-now, funds, history, pledges
  if (isStaffLevel(role) || isMember(role)) return all.filter(v => ['give-now', 'funds', 'history', 'pledges'].includes(v.id));
  // C5: give-now only
  return [all[0]];
}

// =============================================================================
// INLINE MOCK DATA
// =============================================================================

// --- Give Now ---

const AMOUNT_PRESETS = [25, 50, 100, 250, 500, 1000];

interface GivingFund {
  id: string;
  name: string;
  icon: string;
}

const GIVING_FUNDS_QUICK: GivingFund[] = [
  { id: 'tithe', name: 'Tithes', icon: 'dollarsign.circle.fill' },
  { id: 'offering', name: 'Offering', icon: 'heart.fill' },
  { id: 'building', name: 'Building Fund', icon: 'building.2.fill' },
  { id: 'missions', name: 'Missions', icon: 'globe.americas.fill' },
  { id: 'youth', name: 'Youth', icon: 'person.3.fill' },
  { id: 'benevolence', name: 'Benevolence', icon: 'hands.sparkles.fill' },
];

interface PaymentMethod {
  id: string;
  label: string;
  detail: string;
  icon: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bank', label: 'Bank Account', detail: '****4521', icon: 'building.columns.fill' },
  { id: 'card', label: 'Visa', detail: '****8890', icon: 'creditcard.fill' },
  { id: 'new', label: 'Add New', detail: '', icon: 'plus.circle.fill' },
];

type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';

const FREQUENCIES: { id: Frequency; label: string }[] = [
  { id: 'one-time', label: 'One-Time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'bi-weekly', label: 'Bi-Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

// --- Funds ---

interface Fund {
  id: string;
  name: string;
  description: string;
  goal: number | null;
  raised: number;
  ongoing: boolean;
  deadline: string | null;
  donorCount: number;
  trend: string;
  color: string;
  icon: string;
  allowedUses?: string[];
}

const ACTIVE_FUNDS: Fund[] = [
  {
    id: 'fund-1', name: 'General Tithes & Offering', description: 'Primary operating fund for ministry, staff, and facilities.',
    goal: null, raised: 842000, ongoing: true, deadline: null, donorCount: 1284, trend: '+6.2%', color: ACCENT, icon: 'dollarsign.circle.fill',
    allowedUses: ['Staff salaries', 'Ministry operations', 'Facility maintenance', 'Utilities'],
  },
  {
    id: 'fund-2', name: 'Building Fund', description: 'Capital campaign for new sanctuary and community center. Phase 2.',
    goal: 2500000, raised: 1950000, ongoing: false, deadline: 'Dec 2026', donorCount: 842, trend: '+4.8%', color: ACCENT, icon: 'building.2.fill',
    allowedUses: ['Construction', 'Architectural fees', 'Permits', 'Furnishings'],
  },
  {
    id: 'fund-3', name: 'Missions Fund', description: 'Supporting 12 missionary families and 3 international partnerships.',
    goal: 150000, raised: 89000, ongoing: false, deadline: 'Dec 2026', donorCount: 356, trend: '+12.1%', color: ACCENT, icon: 'globe.americas.fill',
    allowedUses: ['Missionary support', 'Travel', 'Supplies', 'Partner organizations'],
  },
  {
    id: 'fund-4', name: 'Youth Summer Camp', description: 'Send 150 youth to summer camp with scholarships for families in need.',
    goal: 25000, raised: 18000, ongoing: false, deadline: 'May 2026', donorCount: 128, trend: '+22.4%', color: '#F59E0B', icon: 'sun.max.fill',
  },
  {
    id: 'fund-5', name: 'Benevolence Fund', description: 'Emergency assistance for church members and community families in crisis.',
    goal: null, raised: 12000, ongoing: true, deadline: null, donorCount: 195, trend: '+3.1%', color: '#22C55E', icon: 'hands.sparkles.fill',
  },
  {
    id: 'fund-6', name: 'Easter Special Offering', description: 'Annual Easter offering supporting local outreach and church planting.',
    goal: 50000, raised: 0, ongoing: false, deadline: 'Apr 2026', donorCount: 0, trend: 'New', color: ACCENT, icon: 'sparkles',
  },
];

// --- History & Receipts ---

interface GivingTransaction {
  id: string;
  date: string;
  amount: string;
  fund: string;
  method: string;
  receiptNo: string;
  taxDeductible: boolean;
  status: 'completed' | 'pending' | 'recurring';
}

const GIVING_HISTORY: GivingTransaction[] = [
  { id: 'tx-01', date: 'Feb 16, 2026', amount: '$500.00', fund: 'Tithes', method: 'Bank ****4521', receiptNo: 'RCT-2026-0216A', taxDeductible: true, status: 'completed' },
  { id: 'tx-02', date: 'Feb 16, 2026', amount: '$100.00', fund: 'Building Fund', method: 'Bank ****4521', receiptNo: 'RCT-2026-0216B', taxDeductible: true, status: 'completed' },
  { id: 'tx-03', date: 'Feb 14, 2026', amount: '$250.00', fund: 'Tithes', method: 'Card ****8890', receiptNo: 'RCT-2026-0214A', taxDeductible: true, status: 'completed' },
  { id: 'tx-04', date: 'Feb 9, 2026', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2026-0209A', taxDeductible: true, status: 'recurring' },
  { id: 'tx-05', date: 'Feb 9, 2026', amount: '$50.00', fund: 'Benevolence', method: 'Card ****8890', receiptNo: 'RCT-2026-0209B', taxDeductible: true, status: 'completed' },
  { id: 'tx-06', date: 'Feb 2, 2026', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2026-0202A', taxDeductible: true, status: 'recurring' },
  { id: 'tx-07', date: 'Feb 2, 2026', amount: '$200.00', fund: 'Missions', method: 'Bank ****4521', receiptNo: 'RCT-2026-0202B', taxDeductible: true, status: 'completed' },
  { id: 'tx-08', date: 'Jan 26, 2026', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2026-0126A', taxDeductible: true, status: 'recurring' },
  { id: 'tx-09', date: 'Jan 26, 2026', amount: '$250.00', fund: 'Youth Summer Camp', method: 'Bank ****4521', receiptNo: 'RCT-2026-0126B', taxDeductible: true, status: 'completed' },
  { id: 'tx-10', date: 'Jan 19, 2026', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2026-0119A', taxDeductible: true, status: 'recurring' },
  { id: 'tx-11', date: 'Jan 12, 2026', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2026-0112A', taxDeductible: true, status: 'recurring' },
  { id: 'tx-12', date: 'Jan 12, 2026', amount: '$100.00', fund: 'Building Fund', method: 'Bank ****4521', receiptNo: 'RCT-2026-0112B', taxDeductible: true, status: 'completed' },
  { id: 'tx-13', date: 'Jan 5, 2026', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2026-0105A', taxDeductible: true, status: 'recurring' },
  { id: 'tx-14', date: 'Dec 29, 2025', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2025-1229A', taxDeductible: true, status: 'recurring' },
  { id: 'tx-15', date: 'Dec 22, 2025', amount: '$1,000.00', fund: 'Christmas Offering', method: 'Bank ****4521', receiptNo: 'RCT-2025-1222A', taxDeductible: true, status: 'completed' },
  { id: 'tx-16', date: 'Dec 22, 2025', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2025-1222B', taxDeductible: true, status: 'recurring' },
  { id: 'tx-17', date: 'Dec 15, 2025', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2025-1215A', taxDeductible: true, status: 'recurring' },
  { id: 'tx-18', date: 'Dec 8, 2025', amount: '$500.00', fund: 'Tithes', method: 'Auto-Pay', receiptNo: 'RCT-2025-1208A', taxDeductible: true, status: 'recurring' },
];

interface YTDSummary {
  total: string;
  byCategory: { label: string; amount: string }[];
}

const YTD_SUMMARY: YTDSummary = {
  total: '$8,450.00',
  byCategory: [
    { label: 'Tithes', amount: '$6,200.00' },
    { label: 'Building Fund', amount: '$700.00' },
    { label: 'Missions', amount: '$400.00' },
    { label: 'Youth', amount: '$500.00' },
    { label: 'Benevolence', amount: '$150.00' },
    { label: 'Special Offerings', amount: '$500.00' },
  ],
};

const TX_STATUS_COLOR: Record<string, string> = {
  completed: '#22C55E',
  pending: '#F59E0B',
  recurring: ACCENT,
};

// --- Pledges ---

interface Pledge {
  id: string;
  fund: string;
  pledgedAmount: string;
  fulfilledAmount: string;
  fulfilledPct: number;
  frequency: string;
  startDate: string;
  endDate: string;
  status: 'on-track' | 'behind' | 'completed' | 'ahead';
  nextPayment: string;
  color: string;
}

const ACTIVE_PLEDGES: Pledge[] = [
  {
    id: 'pledge-1', fund: 'Building Fund', pledgedAmount: '$12,000', fulfilledAmount: '$7,000',
    fulfilledPct: 58, frequency: '$500/mo', startDate: 'Jan 2025', endDate: 'Dec 2026',
    status: 'on-track', nextPayment: 'Mar 1, 2026', color: ACCENT,
  },
  {
    id: 'pledge-2', fund: 'Missions Fund', pledgedAmount: '$1,200', fulfilledAmount: '$400',
    fulfilledPct: 33, frequency: '$100/mo', startDate: 'Jan 2026', endDate: 'Dec 2026',
    status: 'behind', nextPayment: 'Mar 1, 2026', color: ACCENT,
  },
  {
    id: 'pledge-3', fund: 'Annual Tithe Commitment', pledgedAmount: '$26,000', fulfilledAmount: '$6,200',
    fulfilledPct: 24, frequency: '$500/wk', startDate: 'Jan 2026', endDate: 'Dec 2026',
    status: 'ahead', nextPayment: 'Feb 23, 2026', color: ACCENT,
  },
  {
    id: 'pledge-4', fund: 'Youth Summer Camp', pledgedAmount: '$500', fulfilledAmount: '$500',
    fulfilledPct: 100, frequency: 'One-Time', startDate: 'Jan 2026', endDate: 'Jan 2026',
    status: 'completed', nextPayment: '\u2014', color: '#F59E0B',
  },
];

const PLEDGE_STATUS_COLOR: Record<string, string> = {
  'on-track': '#22C55E',
  behind: '#EF4444',
  completed: ACCENT,
  ahead: ACCENT,
};

// --- Finance Console (C1/C2 only) ---

interface ConsoleKPI {
  id: string;
  label: string;
  value: string;
  detail: string;
  trend: string;
  trendUp: boolean;
  color: string;
}

const CONSOLE_KPIS: ConsoleKPI[] = [
  { id: 'ck-1', label: 'Monthly Giving', value: '$185,200', detail: 'Feb 2026', trend: '+4.2%', trendUp: true, color: '#22C55E' },
  { id: 'ck-2', label: 'YTD Total', value: '$1.12M', detail: 'vs $1.08M last year', trend: '+3.7%', trendUp: true, color: ACCENT },
  { id: 'ck-3', label: 'Average Gift', value: '$142', detail: '1,304 gifts this month', trend: '+$8', trendUp: true, color: ACCENT },
  { id: 'ck-4', label: 'Unique Donors', value: '312', detail: 'This month', trend: '+18', trendUp: true, color: ACCENT },
  { id: 'ck-5', label: 'Recurring Ratio', value: '68%', detail: 'vs 32% one-time', trend: '+2%', trendUp: true, color: ACCENT },
  { id: 'ck-6', label: 'Donor Retention', value: '84%', detail: '12-month rolling', trend: '+1.2%', trendUp: true, color: '#F59E0B' },
];

interface MonthlyGiving {
  month: string;
  amount: number;
}

const MONTHLY_GIVING_TREND: MonthlyGiving[] = [
  { month: 'Sep', amount: 168400 },
  { month: 'Oct', amount: 172800 },
  { month: 'Nov', amount: 178200 },
  { month: 'Dec', amount: 210500 },
  { month: 'Jan', amount: 176800 },
  { month: 'Feb', amount: 185200 },
];

interface TopFund {
  id: string;
  name: string;
  amount: string;
  percentage: number;
  color: string;
}

const TOP_FUNDS_BY_VOLUME: TopFund[] = [
  { id: 'tf-1', name: 'General Tithes & Offering', amount: '$842K', percentage: 62.4, color: ACCENT },
  { id: 'tf-2', name: 'Building Fund', amount: '$248K', percentage: 18.4, color: ACCENT },
  { id: 'tf-3', name: 'Missions Fund', amount: '$89K', percentage: 6.6, color: ACCENT },
  { id: 'tf-4', name: 'Youth Programs', amount: '$52K', percentage: 3.9, color: '#F59E0B' },
  { id: 'tf-5', name: 'Benevolence', amount: '$38K', percentage: 2.8, color: '#22C55E' },
  { id: 'tf-6', name: 'Other / Special', amount: '$79K', percentage: 5.9, color: ACCENT },
];

interface BudgetComparison {
  id: string;
  category: string;
  budgeted: string;
  actual: string;
  variance: string;
  pct: number;
}

const BUDGET_VS_ACTUAL: BudgetComparison[] = [
  { id: 'bva-1', category: 'Staff Compensation', budgeted: '$68,000', actual: '$68,000', variance: '$0', pct: 100 },
  { id: 'bva-2', category: 'Facilities & Utilities', budgeted: '$22,000', actual: '$24,200', variance: '+$2,200', pct: 110 },
  { id: 'bva-3', category: 'Ministry Programs', budgeted: '$18,000', actual: '$16,400', variance: '-$1,600', pct: 91 },
  { id: 'bva-4', category: 'Missions Support', budgeted: '$15,000', actual: '$15,000', variance: '$0', pct: 100 },
  { id: 'bva-5', category: 'Youth & Children', budgeted: '$8,000', actual: '$7,200', variance: '-$800', pct: 90 },
  { id: 'bva-6', category: 'Outreach & Benevolence', budgeted: '$6,000', actual: '$8,400', variance: '+$2,400', pct: 140 },
  { id: 'bva-7', category: 'Administration', budgeted: '$5,000', actual: '$4,800', variance: '-$200', pct: 96 },
  { id: 'bva-8', category: 'Debt Service', budgeted: '$12,000', actual: '$12,000', variance: '$0', pct: 100 },
];

// --- Settings & Governance (C1/C2 only) ---

interface GovernancePolicy {
  id: string;
  title: string;
  description: string;
  effectiveDate: string;
  status: 'active' | 'pending-review' | 'archived';
}

const FINANCIAL_POLICIES: GovernancePolicy[] = [
  { id: 'pol-1', title: 'Expenditure Approval Thresholds', description: 'Purchases > $5,000 require board approval. > $500 require two signatures.', effectiveDate: 'Jan 2024', status: 'active' },
  { id: 'pol-2', title: 'Designated Fund Policy', description: 'Donors may designate gifts to specific funds. Undesignated gifts go to General Fund.', effectiveDate: 'Mar 2023', status: 'active' },
  { id: 'pol-3', title: 'Cash Handling Procedures', description: 'Two-person count required. Deposits within 24 hours. No cash kept on premises overnight.', effectiveDate: 'Jun 2023', status: 'active' },
  { id: 'pol-4', title: 'Annual Audit Requirement', description: 'Independent financial audit conducted annually by external CPA firm.', effectiveDate: 'Jan 2020', status: 'active' },
  { id: 'pol-5', title: 'Reserve Fund Policy', description: 'Maintain 3-month operating reserve. Currently at 2.8 months.', effectiveDate: 'Sep 2024', status: 'pending-review' },
];

const POLICY_STATUS_COLOR: Record<string, string> = {
  active: '#22C55E',
  'pending-review': '#F59E0B',
  archived: '#A1A1AA',
};

interface FundConfig {
  id: string;
  name: string;
  type: 'permanent' | 'campaign' | 'designated';
  status: 'active' | 'archived';
  createdDate: string;
}

const MANAGED_FUNDS: FundConfig[] = [
  { id: 'mf-1', name: 'General Tithes & Offering', type: 'permanent', status: 'active', createdDate: 'Jan 2015' },
  { id: 'mf-2', name: 'Building Fund', type: 'campaign', status: 'active', createdDate: 'Jan 2025' },
  { id: 'mf-3', name: 'Missions Fund', type: 'designated', status: 'active', createdDate: 'Mar 2020' },
  { id: 'mf-4', name: 'Youth Summer Camp', type: 'campaign', status: 'active', createdDate: 'Feb 2026' },
  { id: 'mf-5', name: 'Benevolence Fund', type: 'designated', status: 'active', createdDate: 'Jun 2018' },
  { id: 'mf-6', name: 'Easter Special Offering', type: 'campaign', status: 'active', createdDate: 'Feb 2026' },
  { id: 'mf-7', name: 'Christmas Offering 2025', type: 'campaign', status: 'archived', createdDate: 'Nov 2025' },
];

const FUND_TYPE_COLOR: Record<string, string> = {
  permanent: ACCENT,
  campaign: '#F59E0B',
  designated: ACCENT,
};

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  date: string;
  detail: string;
}

const AUDIT_TRAIL: AuditEntry[] = [
  { id: 'at-1', action: 'Fund Created', user: 'Pastor Philip Anthony Mitchell', date: 'Feb 10, 2026', detail: 'Easter Special Offering fund opened' },
  { id: 'at-2', action: 'Policy Updated', user: 'Elder Thompson', date: 'Feb 5, 2026', detail: 'Reserve Fund Policy sent for review' },
  { id: 'at-3', action: 'Threshold Met', user: 'System', date: 'Jan 28, 2026', detail: 'Building Fund crossed $1.9M (78% of goal)' },
  { id: 'at-4', action: 'Fund Archived', user: 'Treasurer Davis', date: 'Jan 15, 2026', detail: 'Christmas Offering 2025 closed and archived' },
  { id: 'at-5', action: 'Budget Approved', user: 'Board', date: 'Jan 8, 2026', detail: '2026 annual operating budget approved ($1.84M)' },
  { id: 'at-6', action: 'Audit Completed', user: 'Anderson & Co. CPA', date: 'Dec 20, 2025', detail: 'FY2025 annual audit — clean opinion, zero findings' },
];

interface TaxConfig {
  ein: string;
  orgName: string;
  address: string;
  receiptFooter: string;
}

const TAX_CONFIG: TaxConfig = {
  ein: '82-1234567',
  orgName: 'Grace Community Church',
  address: '3350 Greenbriar Pkwy SW, Atlanta, GA 30331',
  receiptFooter: 'Grace Community Church is a 501(c)(3) tax-exempt organization. No goods or services were provided in exchange for your contribution.',
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, action }: { title: string; colors: typeof Colors.light; count?: number; action?: string }) {
  return (
    <View style={shrd.headerRow}>
      <View style={shrd.headerLeft}>
        <ThemedText style={[shrd.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
        {count != null && (
          <View style={[shrd.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[shrd.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
          </View>
        )}
      </View>
      {action && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <ThemedText style={[shrd.actionText, { color: colors.textTertiary }]}>{action}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[shrd.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

const shrd = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  actionText: { fontSize: 12, fontWeight: '500' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
});

// =============================================================================
// VIEW 1: GIVE NOW
// =============================================================================

function GiveNowView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedFund, setSelectedFund] = useState<string>('tithe');
  const [selectedPayment, setSelectedPayment] = useState<string>('bank');
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency>('one-time');
  const [coverFees, setCoverFees] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isVisitor = role === 'C5';

  const activeAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : 0);
  const fundLabel = GIVING_FUNDS_QUICK.find(f => f.id === selectedFund)?.name ?? 'General';

  if (showConfirmation) {
    const receiptId = `2819 Church-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
    const timestamp = new Date().toLocaleString();
    return (
      <View>
        <View style={s.moduleContainer}>
          <Card colors={colors}>
            <View style={{ alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md }}>
              <IconSymbol name="checkmark.circle.fill" size={48} color="#22C55E" />
              <ThemedText style={[{ fontSize: 20, fontWeight: '800' }, { color: colors.text }]}>Thank You!</ThemedText>
              <ThemedText style={[{ fontSize: 14, textAlign: 'center' }, { color: colors.textSecondary }]}>
                Your gift of ${activeAmount.toLocaleString()} to {fundLabel} has been received.
              </ThemedText>
              <View style={{ gap: 4, alignItems: 'center' }}>
                <ThemedText style={[{ fontSize: 11 }, { color: colors.textTertiary }]}>Receipt: {receiptId}</ThemedText>
                <ThemedText style={[{ fontSize: 11 }, { color: colors.textTertiary }]}>{timestamp}</ThemedText>
              </View>
            </View>
          </Card>
        </View>
        <View style={s.moduleContainer}>
          <Pressable
            style={[s.giveCTA, { backgroundColor: colors.text + '10', borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="doc.text.fill" size={16} color={colors.text} />
            <ThemedText style={[s.giveCTAText, { color: colors.text, fontSize: 14 }]}>View Receipt</ThemedText>
          </Pressable>
        </View>
        {selectedFrequency === 'one-time' && (
          <View style={s.moduleContainer}>
            <Pressable
              style={[s.giveCTA, { backgroundColor: colors.text + '10', borderColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="arrow.triangle.2.circlepath" size={16} color={colors.text} />
              <ThemedText style={[s.giveCTAText, { color: colors.text, fontSize: 14 }]}>Set Up Recurring</ThemedText>
            </Pressable>
          </View>
        )}
        <View style={s.moduleContainer}>
          <Pressable
            style={[s.giveCTA, { borderColor: colors.border }]}
            onPress={() => { setShowConfirmation(false); setSelectedAmount(null); setCustomAmount(''); }}
          >
            <ThemedText style={[s.giveCTAText, { color: colors.textSecondary, fontSize: 14 }]}>Give Again</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View>
      {/* Quick Give */}
      <View style={s.moduleContainer}>
        <SectionHeader title="AMOUNT" colors={colors} />
        <Card colors={colors}>
          <View style={s.presetGrid}>
            {AMOUNT_PRESETS.map((amount) => {
              const active = selectedAmount === amount;
              return (
                <Pressable
                  key={amount}
                  style={[
                    s.presetButton,
                    {
                      backgroundColor: active ? colors.text + '15' : colors.backgroundTertiary,
                      borderColor: active ? colors.text + '30' : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedAmount(amount);
                  }}
                >
                  <ThemedText style={[s.presetText, { color: active ? colors.text : colors.textSecondary }]}>
                    ${amount.toLocaleString()}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={[s.customAmountBtn, { borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 }]}>
            <ThemedText style={[{ fontSize: 15, fontWeight: '700' }, { color: colors.textSecondary }]}>$</ThemedText>
            <TextInput
              style={[s.customAmountInput, { color: colors.text }]}
              placeholder="Custom amount"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              value={customAmount}
              onChangeText={(text) => { setCustomAmount(text); setSelectedAmount(null); }}
            />
          </View>
        </Card>
      </View>

      {/* Fund Selector */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GIVE TO" colors={colors} />
        <Card colors={colors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fundScrollContent}>
            {GIVING_FUNDS_QUICK.map((fund) => {
              const active = selectedFund === fund.id;
              return (
                <Pressable
                  key={fund.id}
                  style={[
                    s.fundPill,
                    {
                      backgroundColor: active ? colors.text + '15' : 'transparent',
                      borderColor: active ? colors.text + '30' : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedFund(fund.id);
                  }}
                >
                  <IconSymbol name={fund.icon as any} size={12} color={active ? colors.text : colors.textSecondary} />
                  <ThemedText style={[s.fundPillText, { color: active ? colors.text : colors.textSecondary }]}>
                    {fund.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>
      </View>

      {/* Payment Method */}
      <View style={s.moduleContainer}>
        <SectionHeader title="PAYMENT METHOD" colors={colors} />
        <Card colors={colors}>
          {PAYMENT_METHODS.map((pm, idx) => {
            const active = selectedPayment === pm.id;
            return (
              <Pressable
                key={pm.id}
                style={[
                  s.paymentRow,
                  active && { backgroundColor: colors.text + '08' },
                  idx < PAYMENT_METHODS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPayment(pm.id);
                }}
              >
                <IconSymbol name={pm.icon as any} size={16} color={active ? colors.text : colors.textSecondary} />
                <View style={s.paymentInfo}>
                  <ThemedText style={[s.paymentLabel, { color: colors.text }]}>{pm.label}</ThemedText>
                  {pm.detail ? (
                    <ThemedText style={[s.paymentDetail, { color: colors.textTertiary }]}>{pm.detail}</ThemedText>
                  ) : null}
                </View>
                <View style={[s.radioOuter, { borderColor: active ? colors.text : colors.border }]}>
                  {active && <View style={[s.radioInner, { backgroundColor: colors.text }]} />}
                </View>
              </Pressable>
            );
          })}
        </Card>
      </View>

      {/* Frequency */}
      {!isVisitor && (
        <View style={s.moduleContainer}>
          <SectionHeader title="FREQUENCY" colors={colors} />
          <Card colors={colors}>
            <View style={s.frequencyRow}>
              {FREQUENCIES.map((freq) => {
                const active = selectedFrequency === freq.id;
                return (
                  <Pressable
                    key={freq.id}
                    style={[
                      s.frequencyPill,
                      {
                        backgroundColor: active ? colors.text : 'transparent',
                        borderColor: active ? colors.text : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedFrequency(freq.id);
                    }}
                  >
                    <ThemedText style={[s.frequencyText, { color: active ? colors.background : colors.textSecondary }]}>
                      {freq.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>
      )}

      {/* Cover Fees Toggle */}
      <View style={s.moduleContainer}>
        <Card colors={colors}>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCoverFees(!coverFees); }}
          >
            <View style={[s.toggleTrack, { backgroundColor: coverFees ? '#22C55E' : colors.backgroundTertiary }]}>
              <View style={[s.toggleThumb, { transform: [{ translateX: coverFees ? 16 : 0 }] }]} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[{ fontSize: 13, fontWeight: '600' }, { color: colors.text }]}>Cover processing fees</ThemedText>
              <ThemedText style={[{ fontSize: 11 }, { color: colors.textTertiary }]}>Add ~3% so 100% of your gift goes to the church</ThemedText>
            </View>
          </Pressable>
        </Card>
      </View>

      {/* Give CTA */}
      <View style={s.moduleContainer}>
        <Pressable
          style={({ pressed }) => [
            s.giveCTA,
            { backgroundColor: pressed ? 'rgba(255,255,255,0.12)' : '#2F3336', borderColor: colors.borderStrong },
          ]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); if (activeAmount > 0) setShowConfirmation(true); }}
        >
          <IconSymbol name="heart.fill" size={18} color={colors.text} />
          <ThemedText style={[s.giveCTAText, { color: colors.text }]}>
            {activeAmount > 0 ? `Give $${activeAmount.toLocaleString()}${coverFees ? ' + fees' : ''}` : 'Give Now'}
          </ThemedText>
        </Pressable>
      </View>

      {/* Last gift confirmation */}
      {isMember(role) && (
        <View style={s.moduleContainer}>
          <Card colors={colors}>
            <View style={s.lastGiftRow}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
              <ThemedText style={[s.lastGiftText, { color: colors.textSecondary }]}>
                Last gift: $250 {'\u2014'} Tithes {'\u2014'} Feb 14
              </ThemedText>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW 2: FUNDS
// =============================================================================

function FundsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const showLeaderDetail = isElderLevel(role);

  return (
    <View>
      <View style={s.moduleContainer}>
        <SectionHeader title="ACTIVE GIVING FUNDS" colors={colors} count={ACTIVE_FUNDS.length} />
        {ACTIVE_FUNDS.map((fund) => {
          const hasCampaignGoal = fund.goal !== null;
          const progress = hasCampaignGoal ? Math.round((fund.raised / fund.goal!) * 100) : null;

          return (
            <Card key={fund.id} colors={colors}>
              <View style={s.fundCardHeader}>
                <View style={[s.fundCardIcon, { backgroundColor: fund.color + '20' }]}>
                  <IconSymbol name={fund.icon as any} size={18} color={fund.color} />
                </View>
                <View style={s.fundCardHeaderInfo}>
                  <ThemedText style={[s.fundCardName, { color: colors.text }]}>{fund.name}</ThemedText>
                  {fund.deadline && (
                    <ThemedText style={[s.fundCardDeadline, { color: colors.textTertiary }]}>
                      Ends: {fund.deadline}
                    </ThemedText>
                  )}
                  {fund.ongoing && (
                    <ThemedText style={[s.fundCardDeadline, { color: colors.textTertiary }]}>Ongoing</ThemedText>
                  )}
                </View>
              </View>

              <ThemedText style={[s.fundCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {fund.description}
              </ThemedText>

              {/* Allowed uses */}
              {fund.allowedUses && fund.allowedUses.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.sm }}>
                  {fund.allowedUses.map((use) => (
                    <View key={use} style={{ backgroundColor: fund.color + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm }}>
                      <ThemedText style={{ fontSize: 9, fontWeight: '600', color: fund.color }}>{use}</ThemedText>
                    </View>
                  ))}
                </View>
              )}

              {/* Progress bar (campaign funds only) */}
              {hasCampaignGoal && (
                <View style={s.fundProgressSection}>
                  <View style={s.fundProgressRow}>
                    <View style={[s.fundProgressTrack, { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={[s.fundProgressFill, { width: `${Math.min(progress!, 100)}%`, backgroundColor: fund.color }]} />
                    </View>
                    <ThemedText style={[s.fundProgressPct, { color: fund.color }]}>{progress}%</ThemedText>
                  </View>
                  <View style={s.fundAmountRow}>
                    <ThemedText style={[s.fundRaised, { color: colors.text }]}>
                      ${fund.raised >= 1000000
                        ? (fund.raised / 1000000).toFixed(2) + 'M'
                        : (fund.raised / 1000).toFixed(0) + 'K'} raised
                    </ThemedText>
                    <ThemedText style={[s.fundGoal, { color: colors.textTertiary }]}>
                      of ${fund.goal! >= 1000000
                        ? (fund.goal! / 1000000).toFixed(1) + 'M'
                        : (fund.goal! / 1000).toFixed(0) + 'K'} goal
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Ongoing fund — show YTD raised */}
              {!hasCampaignGoal && (
                <View style={s.fundOngoingRow}>
                  <ThemedText style={[s.fundRaised, { color: colors.text }]}>
                    ${(fund.raised / 1000).toFixed(0)}K YTD
                  </ThemedText>
                </View>
              )}

              {/* C1/C2 leader detail */}
              {showLeaderDetail && (
                <View style={s.fundLeaderMeta}>
                  <View style={s.fundLeaderItem}>
                    <IconSymbol name="person.2.fill" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.fundLeaderText, { color: colors.textTertiary }]}>
                      {fund.donorCount.toLocaleString()} donors
                    </ThemedText>
                  </View>
                  <View style={s.fundLeaderItem}>
                    <IconSymbol name="arrow.up.right" size={10} color={fund.trend === 'New' ? ACCENT : '#22C55E'} />
                    <ThemedText style={[s.fundLeaderText, { color: fund.trend === 'New' ? ACCENT : '#22C55E' }]}>
                      {fund.trend}
                    </ThemedText>
                  </View>
                </View>
              )}
            </Card>
          );
        })}
      </View>
    </View>
  );
}

// =============================================================================
// VIEW 3: HISTORY & RECEIPTS
// =============================================================================

function HistoryView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const years = [2026, 2025, 2024];

  return (
    <View>
      {/* Year Selector */}
      <View style={s.moduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 }}>
          {years.map((year) => (
            <Pressable
              key={year}
              style={[s.filterPill, { backgroundColor: selectedYear === year ? colors.text + '15' : 'transparent', borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedYear(year); }}
            >
              <ThemedText style={{ fontSize: 13, fontWeight: '600', color: selectedYear === year ? colors.text : colors.textSecondary }}>{year}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* YTD Summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title={`${selectedYear} SUMMARY`} colors={colors} />
        <Card colors={colors}>
          <View style={s.ytdHero}>
            <ThemedText style={[s.ytdLabel, { color: colors.textSecondary }]}>Total Given (2026)</ThemedText>
            <ThemedText style={[s.ytdTotal, { color: colors.text }]}>{YTD_SUMMARY.total}</ThemedText>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          {YTD_SUMMARY.byCategory.map((cat, idx) => (
            <View
              key={cat.label}
              style={[
                s.ytdLine,
                idx < YTD_SUMMARY.byCategory.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <ThemedText style={[s.ytdCatLabel, { color: colors.textSecondary }]}>{cat.label}</ThemedText>
              <ThemedText style={[s.ytdCatAmount, { color: colors.text }]}>{cat.amount}</ThemedText>
            </View>
          ))}
        </Card>
      </View>

      {/* Download Statement */}
      <View style={s.moduleContainer}>
        <Pressable
          style={({ pressed }) => [
            s.downloadBtn,
            { borderColor: colors.borderStrong, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="arrow.down.doc.fill" size={16} color={colors.text} />
          <ThemedText style={[s.downloadBtnText, { color: colors.text }]}>Download Annual Statement</ThemedText>
        </Pressable>
      </View>

      {/* Transaction Timeline */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GIVING HISTORY" colors={colors} count={GIVING_HISTORY.length} action="Filter" />
        <Card colors={colors}>
          {GIVING_HISTORY.map((tx, idx) => {
            const statusColor = TX_STATUS_COLOR[tx.status] ?? '#A1A1AA';
            const isExpanded = expandedTx === tx.id;
            return (
              <Pressable
                key={tx.id}
                style={[
                  s.txRow,
                  { flexDirection: 'column' },
                  idx < GIVING_HISTORY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedTx(isExpanded ? null : tx.id); }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={s.txInfo}>
                    <View style={s.txHeaderLine}>
                      <ThemedText style={[s.txFund, { color: colors.text }]}>{tx.fund}</ThemedText>
                      {tx.taxDeductible && (
                        <View style={[s.taxBadge, { backgroundColor: '#22C55E20' }]}>
                          <ThemedText style={[s.taxBadgeText, { color: '#22C55E' }]}>TAX</ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={[s.txMeta, { color: colors.textTertiary }]}>
                      {tx.date} {'\u00B7'} {tx.method}
                    </ThemedText>
                  </View>
                  <View style={s.txRight}>
                    <ThemedText style={[s.txAmount, { color: colors.text }]}>{tx.amount}</ThemedText>
                    <View style={[s.txStatusBadge, { backgroundColor: statusColor + '20' }]}>
                      <ThemedText style={[s.txStatusText, { color: statusColor }]}>
                        {tx.status === 'recurring' ? 'AUTO' : tx.status.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                {/* Expanded receipt detail */}
                {isExpanded && (
                  <View style={{ marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: colors.backgroundTertiary, borderRadius: BorderRadius.md, gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText style={{ fontSize: 11, color: colors.textTertiary }}>Receipt ID</ThemedText>
                      <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.text }}>{tx.receiptNo}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText style={{ fontSize: 11, color: colors.textTertiary }}>Amount</ThemedText>
                      <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.text }}>{tx.amount}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText style={{ fontSize: 11, color: colors.textTertiary }}>Fund</ThemedText>
                      <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.text }}>{tx.fund}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText style={{ fontSize: 11, color: colors.textTertiary }}>Payment</ThemedText>
                      <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.text }}>{tx.method}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText style={{ fontSize: 11, color: colors.textTertiary }}>Date</ThemedText>
                      <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.text }}>{tx.date}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText style={{ fontSize: 11, color: colors.textTertiary }}>Tax Deductible</ThemedText>
                      <ThemedText style={{ fontSize: 11, fontWeight: '600', color: tx.taxDeductible ? '#22C55E' : colors.textTertiary }}>{tx.taxDeductible ? 'Yes' : 'No'}</ThemedText>
                    </View>
                    <ThemedText style={{ fontSize: 9, color: colors.textTertiary, marginTop: 4, fontStyle: 'italic' }}>
                      International Church of Christ LA is a 501(c)(3) organization. EIN: 95-1234567.
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            );
          })}
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW 4: PLEDGES
// =============================================================================

function PledgesView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  return (
    <View>
      {/* Active Pledges */}
      <View style={s.moduleContainer}>
        <SectionHeader title="ACTIVE PLEDGES" colors={colors} count={ACTIVE_PLEDGES.filter(p => p.status !== 'completed').length} />
        {ACTIVE_PLEDGES.map((pledge) => {
          const statusColor = PLEDGE_STATUS_COLOR[pledge.status] ?? '#A1A1AA';
          return (
            <Card key={pledge.id} colors={colors}>
              <View style={s.pledgeHeader}>
                <View style={[s.pledgeDot, { backgroundColor: pledge.color }]} />
                <View style={s.pledgeHeaderInfo}>
                  <ThemedText style={[s.pledgeFund, { color: colors.text }]}>{pledge.fund}</ThemedText>
                  <ThemedText style={[s.pledgeDates, { color: colors.textTertiary }]}>
                    {pledge.startDate} {'\u2013'} {pledge.endDate} {'\u00B7'} {pledge.frequency}
                  </ThemedText>
                </View>
                <View style={[s.pledgeStatusBadge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[s.pledgeStatusText, { color: statusColor }]}>
                    {pledge.status.replace('-', ' ').toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              {/* Progress */}
              <View style={s.pledgeProgressSection}>
                <View style={s.pledgeAmountsRow}>
                  <ThemedText style={[s.pledgeFulfilled, { color: colors.text }]}>{pledge.fulfilledAmount}</ThemedText>
                  <ThemedText style={[s.pledgePledgedAmt, { color: colors.textTertiary }]}>of {pledge.pledgedAmount}</ThemedText>
                </View>
                <View style={s.pledgeProgressRow}>
                  <View style={[s.pledgeProgressTrack, { backgroundColor: colors.backgroundTertiary }]}>
                    <View style={[s.pledgeProgressFill, { width: `${Math.min(pledge.fulfilledPct, 100)}%`, backgroundColor: pledge.color }]} />
                  </View>
                  <ThemedText style={[s.pledgeProgressPct, { color: pledge.color }]}>{pledge.fulfilledPct}%</ThemedText>
                </View>
              </View>

              {/* Next payment */}
              {pledge.status !== 'completed' && (
                <ThemedText style={[s.pledgeNextPayment, { color: colors.textTertiary }]}>
                  Next payment: {pledge.nextPayment}
                </ThemedText>
              )}

              {/* Modify / Cancel actions */}
              {pledge.status !== 'completed' && (
                <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
                  <Pressable
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md, backgroundColor: colors.backgroundTertiary }}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <IconSymbol name="pencil" size={11} color={colors.textSecondary} />
                    <ThemedText style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>Modify</ThemedText>
                  </Pressable>
                  <Pressable
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md, backgroundColor: '#EF444410' }}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <IconSymbol name="xmark" size={11} color="#EF4444" />
                    <ThemedText style={{ fontSize: 11, fontWeight: '600', color: '#EF4444' }}>Cancel</ThemedText>
                  </Pressable>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Make a Pledge CTA */}
      <View style={s.moduleContainer}>
        <Pressable
          style={({ pressed }) => [
            s.pledgeCTA,
            { borderColor: colors.borderStrong, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="plus.circle.fill" size={16} color={colors.text} />
          <ThemedText style={[s.pledgeCTAText, { color: colors.text }]}>Make a Pledge</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW 5: FINANCE CONSOLE (C1/C2 only)
// =============================================================================

function FinanceConsoleView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const maxAmount = Math.max(...MONTHLY_GIVING_TREND.map(m => m.amount));

  return (
    <View>
      {/* KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GIVING DASHBOARD" colors={colors} count={CONSOLE_KPIS.length} />
        <Card colors={colors}>
          <View style={s.consoleKPIGrid}>
            {CONSOLE_KPIS.map((kpi, idx) => (
              <View
                key={kpi.id}
                style={[
                  s.consoleKPICell,
                  { borderColor: colors.border },
                ]}
              >
                <ThemedText style={[s.consoleKPIValue, { color: colors.text }]}>{kpi.value}</ThemedText>
                <ThemedText style={[s.consoleKPILabel, { color: colors.textSecondary }]}>{kpi.label}</ThemedText>
                <ThemedText style={[s.consoleKPIDetail, { color: colors.textTertiary }]}>{kpi.detail}</ThemedText>
                <View style={s.consoleKPITrendRow}>
                  <IconSymbol
                    name={kpi.trendUp ? 'arrow.up.right' : 'arrow.down.right'}
                    size={9}
                    color={kpi.trendUp ? '#22C55E' : '#EF4444'}
                  />
                  <ThemedText style={[s.consoleKPITrend, { color: kpi.trendUp ? '#22C55E' : '#EF4444' }]}>
                    {kpi.trend}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Giving Trend (mock bar chart) */}
      <View style={s.moduleContainer}>
        <SectionHeader title="MONTHLY GIVING TREND" colors={colors} />
        <Card colors={colors}>
          <View style={s.chartContainer}>
            {MONTHLY_GIVING_TREND.map((m) => {
              const heightPct = Math.round((m.amount / maxAmount) * 100);
              return (
                <View key={m.month} style={s.chartBarCol}>
                  <ThemedText style={[s.chartBarValue, { color: colors.textTertiary }]}>
                    ${(m.amount / 1000).toFixed(0)}K
                  </ThemedText>
                  <View style={[s.chartBarTrack, { backgroundColor: colors.backgroundTertiary }]}>
                    <View style={[s.chartBarFill, { height: `${heightPct}%`, backgroundColor: ACCENT }]} />
                  </View>
                  <ThemedText style={[s.chartBarLabel, { color: colors.textSecondary }]}>{m.month}</ThemedText>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Top Funds by Volume */}
      <View style={s.moduleContainer}>
        <SectionHeader title="TOP FUNDS BY GIVING VOLUME" colors={colors} count={TOP_FUNDS_BY_VOLUME.length} />
        <Card colors={colors}>
          {TOP_FUNDS_BY_VOLUME.map((tf, idx) => (
            <View
              key={tf.id}
              style={[
                s.topFundRow,
                idx < TOP_FUNDS_BY_VOLUME.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.topFundDot, { backgroundColor: tf.color }]} />
              <View style={s.topFundContent}>
                <ThemedText style={[s.topFundName, { color: colors.text }]}>{tf.name}</ThemedText>
                <View style={[s.topFundBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.topFundBarFill, { width: `${tf.percentage}%`, backgroundColor: tf.color }]} />
                </View>
              </View>
              <View style={s.topFundRight}>
                <ThemedText style={[s.topFundAmount, { color: colors.text }]}>{tf.amount}</ThemedText>
                <ThemedText style={[s.topFundPct, { color: colors.textSecondary }]}>{tf.percentage}%</ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Budget vs Actual */}
      <View style={s.moduleContainer}>
        <SectionHeader title="BUDGET VS ACTUAL (MONTHLY)" colors={colors} count={BUDGET_VS_ACTUAL.length} />
        <Card colors={colors}>
          {BUDGET_VS_ACTUAL.map((bva, idx) => {
            const varianceColor = bva.variance.startsWith('+') ? '#F59E0B' : bva.variance === '$0' ? '#22C55E' : '#22C55E';
            return (
              <View
                key={bva.id}
                style={[
                  s.bvaRow,
                  idx < BUDGET_VS_ACTUAL.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.bvaContent}>
                  <ThemedText style={[s.bvaCategory, { color: colors.text }]}>{bva.category}</ThemedText>
                  <ThemedText style={[s.bvaMeta, { color: colors.textTertiary }]}>
                    Budget: {bva.budgeted} {'\u00B7'} Actual: {bva.actual}
                  </ThemedText>
                </View>
                <View style={s.bvaRight}>
                  <ThemedText style={[s.bvaVariance, { color: varianceColor }]}>{bva.variance}</ThemedText>
                  <ThemedText style={[s.bvaPct, { color: bva.pct > 105 ? '#F59E0B' : bva.pct < 95 ? ACCENT : colors.textSecondary }]}>
                    {bva.pct}%
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      {/* Donor Retention */}
      {isSeniorPastor(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="DONOR HEALTH" colors={colors} />
          <Card colors={colors}>
            <View style={s.donorHealthGrid}>
              {[
                { v: '84%', l: 'Retention Rate', c: '#22C55E' },
                { v: '312', l: 'Active Donors', c: ACCENT },
                { v: '28', l: 'New This Month', c: ACCENT },
                { v: '14', l: 'Lapsed (90d)', c: '#F59E0B' },
              ].map(item => (
                <View key={item.l} style={s.donorHealthCell}>
                  <ThemedText style={[s.donorHealthValue, { color: item.c }]}>{item.v}</ThemedText>
                  <ThemedText style={[s.donorHealthLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* Deposit / Close Workflow */}
      <View style={s.moduleContainer}>
        <SectionHeader title="DEPOSIT & CLOSE" colors={colors} />
        <Card colors={colors}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.sm }}>
            {[
              { v: '12', l: 'Unreconciled', c: '#F59E0B' },
              { v: '84', l: 'Receipts Generated', c: '#22C55E' },
              { v: '3', l: 'Exceptions', c: '#EF4444' },
            ].map(item => (
              <View key={item.l} style={{ alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 20, fontWeight: '800', color: item.c }}>{item.v}</ThemedText>
                <ThemedText style={{ fontSize: 10, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 }}>{item.l}</ThemedText>
              </View>
            ))}
          </View>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: colors.text + '10' }}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="checkmark.seal.fill" size={16} color={colors.text} />
            <ThemedText style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Process Deposit</ThemedText>
          </Pressable>
        </Card>
      </View>

      {/* Exceptions Queue */}
      <View style={s.moduleContainer}>
        <SectionHeader title="EXCEPTIONS QUEUE" colors={colors} count={3} />
        <Card colors={colors}>
          {[
            { id: 'ex-1', category: 'Failed Payment', reason: 'Insufficient funds — Visa ****8890', action: 'Contact donor', amount: '$250', color: '#EF4444' },
            { id: 'ex-2', category: 'Chargeback', reason: 'Disputed transaction — Jan 28', action: 'Review documentation', amount: '$100', color: '#F59E0B' },
            { id: 'ex-3', category: 'Refund Request', reason: 'Duplicate gift — Feb 12', action: 'Process refund', amount: '$500', color: ACCENT },
          ].map((ex, idx) => (
            <View
              key={ex.id}
              style={[
                { paddingVertical: 10, gap: 4 },
                idx < 2 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ backgroundColor: ex.color + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm }}>
                  <ThemedText style={{ fontSize: 9, fontWeight: '700', color: ex.color }}>{ex.category.toUpperCase()}</ThemedText>
                </View>
                <ThemedText style={{ fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 }}>{ex.amount}</ThemedText>
              </View>
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>{ex.reason}</ThemedText>
              <ThemedText style={{ fontSize: 11, color: colors.textTertiary }}>Required action: {ex.action}</ThemedText>
            </View>
          ))}
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW 6: SETTINGS & GOVERNANCE (C1/C2 only)
// =============================================================================

function SettingsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  return (
    <View>
      {/* Financial Policies */}
      <View style={s.moduleContainer}>
        <SectionHeader title="FINANCIAL POLICIES" colors={colors} count={FINANCIAL_POLICIES.length} />
        <Card colors={colors}>
          {FINANCIAL_POLICIES.map((pol, idx) => {
            const statusColor = POLICY_STATUS_COLOR[pol.status] ?? '#A1A1AA';
            return (
              <View
                key={pol.id}
                style={[
                  s.policyRow,
                  idx < FINANCIAL_POLICIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.policyContent}>
                  <View style={s.policyHeader}>
                    <ThemedText style={[s.policyTitle, { color: colors.text }]}>{pol.title}</ThemedText>
                    <View style={[s.policyStatusBadge, { backgroundColor: statusColor + '20' }]}>
                      <ThemedText style={[s.policyStatusText, { color: statusColor }]}>
                        {pol.status.replace('-', ' ').toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.policyDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {pol.description}
                  </ThemedText>
                  <ThemedText style={[s.policyDate, { color: colors.textTertiary }]}>
                    Effective: {pol.effectiveDate}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      {/* Fund Management */}
      <View style={s.moduleContainer}>
        <SectionHeader title="FUND MANAGEMENT" colors={colors} count={MANAGED_FUNDS.length} action="+ Create Fund" />
        <Card colors={colors}>
          {MANAGED_FUNDS.map((mf, idx) => {
            const typeColor = FUND_TYPE_COLOR[mf.type] ?? '#A1A1AA';
            return (
              <View
                key={mf.id}
                style={[
                  s.managedFundRow,
                  idx < MANAGED_FUNDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={s.managedFundContent}>
                  <View style={s.managedFundNameRow}>
                    <ThemedText style={[s.managedFundName, { color: mf.status === 'archived' ? colors.textTertiary : colors.text }]}>
                      {mf.name}
                    </ThemedText>
                    <View style={[s.fundTypeBadge, { backgroundColor: typeColor + '20' }]}>
                      <ThemedText style={[s.fundTypeText, { color: typeColor }]}>
                        {mf.type.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.managedFundMeta, { color: colors.textTertiary }]}>
                    Created: {mf.createdDate} {'\u00B7'} {mf.status === 'archived' ? 'Archived' : 'Active'}
                  </ThemedText>
                </View>
                {mf.status === 'active' && (
                  <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                )}
              </View>
            );
          })}
        </Card>
      </View>

      {/* Approval Thresholds */}
      <View style={s.moduleContainer}>
        <SectionHeader title="APPROVAL THRESHOLDS" colors={colors} />
        <Card colors={colors}>
          {[
            { range: '< $500', approval: 'Staff discretion', icon: 'person.fill' },
            { range: '$500 \u2013 $5,000', approval: 'Two signatures required', icon: 'person.2.fill' },
            { range: '> $5,000', approval: 'Board approval required', icon: 'person.3.fill' },
            { range: '> $25,000', approval: 'Congregational vote', icon: 'person.3.sequence.fill' },
          ].map((threshold, idx) => (
            <View
              key={threshold.range}
              style={[
                s.thresholdRow,
                idx < 3 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <IconSymbol name={threshold.icon as any} size={14} color={colors.textSecondary} />
              <View style={s.thresholdContent}>
                <ThemedText style={[s.thresholdRange, { color: colors.text }]}>{threshold.range}</ThemedText>
                <ThemedText style={[s.thresholdApproval, { color: colors.textSecondary }]}>{threshold.approval}</ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Audit Trail */}
      <View style={s.moduleContainer}>
        <SectionHeader title="AUDIT TRAIL" colors={colors} count={AUDIT_TRAIL.length} />
        <Card colors={colors}>
          {AUDIT_TRAIL.map((entry, idx) => (
            <View
              key={entry.id}
              style={[
                s.auditRow,
                idx < AUDIT_TRAIL.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.auditDot, { backgroundColor: ACCENT }]} />
              <View style={s.auditContent}>
                <View style={s.auditHeaderLine}>
                  <ThemedText style={[s.auditAction, { color: colors.text }]}>{entry.action}</ThemedText>
                  <ThemedText style={[s.auditDate, { color: colors.textTertiary }]}>{entry.date}</ThemedText>
                </View>
                <ThemedText style={[s.auditDetail, { color: colors.textSecondary }]}>{entry.detail}</ThemedText>
                <ThemedText style={[s.auditUser, { color: colors.textTertiary }]}>{entry.user}</ThemedText>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Default Fund & Toggles */}
      <View style={s.moduleContainer}>
        <SectionHeader title="GIVING DEFAULTS" colors={colors} />
        <Card colors={colors}>
          <View style={s.taxConfigRow}>
            <ThemedText style={[s.taxConfigLabel, { color: colors.textSecondary }]}>Default Fund</ThemedText>
            <ThemedText style={[s.taxConfigValue, { color: colors.text }]}>Tithes</ThemedText>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          {[
            { label: 'Auto-email receipts', enabled: true },
            { label: 'Cover fees by default', enabled: false },
            { label: 'Public giving (show on leaderboard)', enabled: false },
          ].map((toggle) => (
            <View key={toggle.label}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
                <ThemedText style={{ fontSize: 13, color: colors.text }}>{toggle.label}</ThemedText>
                <View style={[s.toggleTrack, { backgroundColor: toggle.enabled ? '#22C55E' : colors.backgroundTertiary }]}>
                  <View style={[s.toggleThumb, { transform: [{ translateX: toggle.enabled ? 16 : 0 }] }]} />
                </View>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
            </View>
          ))}
        </Card>
      </View>

      {/* Receipt Template Editor */}
      <View style={s.moduleContainer}>
        <SectionHeader title="RECEIPT TEMPLATE" colors={colors} />
        <Card colors={colors}>
          <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginBottom: Spacing.sm }}>
            Customize the receipt sent to donors after each gift.
          </ThemedText>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: colors.backgroundTertiary }}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="doc.text.fill" size={14} color={colors.text} />
            <ThemedText style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Edit Receipt Template</ThemedText>
          </Pressable>
        </Card>
      </View>

      {/* Export Controls */}
      <View style={s.moduleContainer}>
        <SectionHeader title="EXPORT & REPORTS" colors={colors} />
        <Card colors={colors}>
          {[
            { label: 'Export All Transactions (CSV)', icon: 'arrow.down.doc.fill' },
            { label: 'Export Donor List (CSV)', icon: 'person.3.fill' },
            { label: 'Generate Tax Statements', icon: 'doc.richtext.fill' },
          ].map((exp) => (
            <Pressable
              key={exp.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 12 }}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={exp.icon as any} size={14} color={colors.textSecondary} />
              <ThemedText style={{ fontSize: 13, fontWeight: '500', color: colors.text, flex: 1 }}>{exp.label}</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Permissions */}
      <View style={s.moduleContainer}>
        <SectionHeader title="PERMISSIONS" colors={colors} />
        <Card colors={colors}>
          {[
            { role: 'Senior Pastor (C1)', access: 'Full access — all views, all actions' },
            { role: 'Elder / Board (C2)', access: 'Full access — all views, all actions' },
            { role: 'Staff (C3)', access: 'Give, Funds, History, Pledges — no finance console or settings' },
            { role: 'Member (C4)', access: 'Give, Funds, History, Pledges — personal giving only' },
            { role: 'Visitor (C5)', access: 'Give Now only — one-time gifts' },
          ].map((perm) => (
            <View key={perm.role} style={{ paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
              <ThemedText style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{perm.role}</ThemedText>
              <ThemedText style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>{perm.access}</ThemedText>
            </View>
          ))}
        </Card>
      </View>

      {/* Tax Configuration */}
      <View style={s.moduleContainer}>
        <SectionHeader title="TAX CONFIGURATION" colors={colors} />
        <Card colors={colors}>
          <View style={s.taxConfigRow}>
            <ThemedText style={[s.taxConfigLabel, { color: colors.textSecondary }]}>Church EIN</ThemedText>
            <ThemedText style={[s.taxConfigValue, { color: colors.text }]}>{TAX_CONFIG.ein}</ThemedText>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.taxConfigRow}>
            <ThemedText style={[s.taxConfigLabel, { color: colors.textSecondary }]}>Organization</ThemedText>
            <ThemedText style={[s.taxConfigValue, { color: colors.text }]}>{TAX_CONFIG.orgName}</ThemedText>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.taxConfigRow}>
            <ThemedText style={[s.taxConfigLabel, { color: colors.textSecondary }]}>Address</ThemedText>
            <ThemedText style={[s.taxConfigValue, { color: colors.text }]}>{TAX_CONFIG.address}</ThemedText>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.taxConfigColumn}>
            <ThemedText style={[s.taxConfigLabel, { color: colors.textSecondary }]}>Receipt Footer</ThemedText>
            <ThemedText style={[s.taxConfigFooter, { color: colors.textTertiary }]}>{TAX_CONFIG.receiptFooter}</ThemedText>
          </View>
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchGive({ colors, role = 'C1', onSwitchTab }: Props) {
  const availableViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<GiveView>(availableViews[0]?.id ?? 'give-now');

  const currentViewValid = availableViews.some(v => v.id === activeView);
  const resolvedView = currentViewValid ? activeView : availableViews[0]?.id ?? 'give-now';

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* View Toggle Pills */}
      {availableViews.length > 1 && (
        <View style={s.pillRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillScroll}>
            {availableViews.map(view => {
              const active = resolvedView === view.id;
              return (
                <Pressable
                  key={view.id}
                  style={[s.pill, { backgroundColor: active ? colors.text : 'transparent', borderColor: active ? colors.text : colors.border }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveView(view.id); }}
                >
                  <ThemedText style={[s.pillText, { color: active ? colors.background : colors.textSecondary }]}>{view.label}</ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Active View */}
      {resolvedView === 'give-now' && <GiveNowView colors={colors} role={role} />}
      {resolvedView === 'funds' && <FundsView colors={colors} role={role} />}
      {resolvedView === 'history' && <HistoryView colors={colors} role={role} />}
      {resolvedView === 'pledges' && <PledgesView colors={colors} role={role} />}
      {resolvedView === 'finance-console' && <FinanceConsoleView colors={colors} role={role} />}
      {resolvedView === 'settings' && <SettingsView colors={colors} role={role} />}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.sm },

  // Pill toggle
  pillRow: { marginBottom: Spacing.lg },
  pillScroll: { gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600' },

  // ----- Give Now -----
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  presetButton: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  presetText: { fontSize: 15, fontWeight: '700' },
  customAmountBtn: {
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
  },
  customAmountText: { fontSize: 13, fontWeight: '500' },
  customAmountInput: { flex: 1, fontSize: 15, fontWeight: '600', paddingVertical: 0 },
  toggleTrack: { width: 36, height: 20, borderRadius: 10, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  filterPill: {},

  fundScrollContent: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  fundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fundPillText: { fontSize: 12, fontWeight: '600' },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 14, fontWeight: '600' },
  paymentDetail: { fontSize: 11, marginTop: 1 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },

  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  frequencyText: { fontSize: 12, fontWeight: '600' },

  giveCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  giveCTAText: { fontSize: 18, fontWeight: '800' },

  lastGiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastGiftText: { fontSize: 13 },

  // ----- Funds -----
  fundCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  fundCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fundCardHeaderInfo: { flex: 1 },
  fundCardName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  fundCardDeadline: { fontSize: 11 },
  fundCardDesc: { fontSize: 12, lineHeight: 17, marginBottom: Spacing.sm },
  fundProgressSection: { marginBottom: 4 },
  fundProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fundProgressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fundProgressFill: { height: '100%', borderRadius: 3 },
  fundProgressPct: { fontSize: 12, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  fundAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fundRaised: { fontSize: 13, fontWeight: '600' },
  fundGoal: { fontSize: 12 },
  fundOngoingRow: { marginBottom: 4 },
  fundLeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },
  fundLeaderItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fundLeaderText: { fontSize: 11, fontWeight: '600' },

  // ----- History & Receipts -----
  ytdHero: { alignItems: 'center', marginBottom: Spacing.sm },
  ytdLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  ytdTotal: { fontSize: 28, fontWeight: '800' },
  ytdLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  ytdCatLabel: { fontSize: 13 },
  ytdCatAmount: { fontSize: 13, fontWeight: '600' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  downloadBtnText: { fontSize: 14, fontWeight: '600' },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  txInfo: { flex: 1 },
  txHeaderLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  txFund: { fontSize: 13, fontWeight: '600' },
  taxBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  taxBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  txMeta: { fontSize: 11, marginBottom: 1 },
  txReceipt: { fontSize: 10 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  txStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ----- Pledges -----
  pledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  pledgeDot: { width: 10, height: 10, borderRadius: 5 },
  pledgeHeaderInfo: { flex: 1 },
  pledgeFund: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  pledgeDates: { fontSize: 11 },
  pledgeStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  pledgeStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  pledgeProgressSection: { marginBottom: 4 },
  pledgeAmountsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 6 },
  pledgeFulfilled: { fontSize: 18, fontWeight: '800' },
  pledgePledgedAmt: { fontSize: 13 },
  pledgeProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pledgeProgressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  pledgeProgressFill: { height: '100%', borderRadius: 3 },
  pledgeProgressPct: { fontSize: 12, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  pledgeNextPayment: { fontSize: 11, marginTop: 4 },
  pledgeCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pledgeCTAText: { fontSize: 14, fontWeight: '600' },

  // ----- Finance Console -----
  consoleKPIGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  consoleKPICell: {
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  consoleKPIValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  consoleKPILabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  consoleKPIDetail: { fontSize: 10, marginBottom: 4 },
  consoleKPITrendRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  consoleKPITrend: { fontSize: 10, fontWeight: '600' },

  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    paddingTop: Spacing.sm,
  },
  chartBarCol: { alignItems: 'center', flex: 1, gap: 4 },
  chartBarValue: { fontSize: 9, fontWeight: '600' },
  chartBarTrack: {
    width: 28,
    height: 110,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: { width: '100%', borderRadius: 4 },
  chartBarLabel: { fontSize: 10, fontWeight: '600' },

  topFundRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  topFundDot: { width: 8, height: 8, borderRadius: 4 },
  topFundContent: { flex: 1 },
  topFundName: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  topFundBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  topFundBarFill: { height: '100%', borderRadius: 3 },
  topFundRight: { alignItems: 'flex-end' },
  topFundAmount: { fontSize: 13, fontWeight: '700' },
  topFundPct: { fontSize: 10, marginTop: 2 },

  bvaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  bvaContent: { flex: 1 },
  bvaCategory: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  bvaMeta: { fontSize: 10 },
  bvaRight: { alignItems: 'flex-end' },
  bvaVariance: { fontSize: 13, fontWeight: '700' },
  bvaPct: { fontSize: 10, marginTop: 2 },

  donorHealthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  donorHealthCell: { width: '46%', alignItems: 'center' },
  donorHealthValue: { fontSize: 20, fontWeight: '700' },
  donorHealthLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // ----- Settings & Governance -----
  policyRow: { paddingVertical: 10 },
  policyContent: {},
  policyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  policyTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  policyStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  policyStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  policyDesc: { fontSize: 12, lineHeight: 17, marginBottom: 4 },
  policyDate: { fontSize: 10 },

  managedFundRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  managedFundContent: { flex: 1 },
  managedFundNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  managedFundName: { fontSize: 13, fontWeight: '600' },
  fundTypeBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  fundTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  managedFundMeta: { fontSize: 10 },

  thresholdRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 12 },
  thresholdContent: { flex: 1 },
  thresholdRange: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  thresholdApproval: { fontSize: 12 },

  auditRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: Spacing.sm },
  auditDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  auditContent: { flex: 1 },
  auditHeaderLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  auditAction: { fontSize: 13, fontWeight: '600' },
  auditDate: { fontSize: 10 },
  auditDetail: { fontSize: 12, lineHeight: 17, marginBottom: 2 },
  auditUser: { fontSize: 10 },

  taxConfigRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  taxConfigLabel: { fontSize: 12, fontWeight: '500' },
  taxConfigValue: { fontSize: 13, fontWeight: '600' },
  taxConfigColumn: { paddingVertical: 6 },
  taxConfigFooter: { fontSize: 11, lineHeight: 16, marginTop: 4 },
});
