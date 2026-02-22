/**
 * Education Financial — 6-view pill-toggled financial hub.
 * Views: Overview | Student Accounts | Aid & Awards | Tuition & Fees | Revenue & Expenses | Audit & Controls
 *
 * RBAC:
 *   E1/E2 — All 6 views, full budget detail, audit, revenue, expenses
 *   E3    — Overview, Tuition & Fees, Aid & Awards (limited)
 *   E4    — Overview (student-focused), Student Accounts, Tuition & Fees
 *   E5    — Hidden (lock screen)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import {
  isPresident,
  isDeanLevel,
  isFacultyLevel,
  isStudent,
  isEnrolled,
} from '@/utils/education-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: EducationRoleLens;
  onSwitchTab?: (index: number) => void;
}

type FinancialView = 'overview' | 'student-accounts' | 'aid-awards' | 'tuition-fees' | 'revenue-expenses' | 'audit-controls';

interface ViewTab { id: FinancialView; label: string }

function getAvailableViews(role: EducationRoleLens): ViewTab[] {
  const all: ViewTab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'student-accounts', label: 'Student Accounts' },
    { id: 'aid-awards', label: 'Aid & Awards' },
    { id: 'tuition-fees', label: 'Tuition & Fees' },
    { id: 'revenue-expenses', label: 'Revenue & Expenses' },
    { id: 'audit-controls', label: 'Audit & Controls' },
  ];
  if (isDeanLevel(role)) return all;
  if (isFacultyLevel(role)) return all.filter(v => ['overview', 'tuition-fees', 'aid-awards'].includes(v.id));
  if (isStudent(role)) return all.filter(v => ['overview', 'student-accounts', 'tuition-fees'].includes(v.id));
  return [all[0]];
}

// =============================================================================
// INLINE MOCK DATA
// =============================================================================

// --- Budget Overview ---

interface BudgetOverview {
  fiscalYear: string;
  totalRevenue: string;
  totalExpenses: string;
  netPosition: string;
  endowment: string;
  endowmentGrowth: string;
  operatingMargin: string;
  debtService: string;
  bondRating: string;
  cashReserves: string;
  reserveMonths: number;
}

const BUDGET: BudgetOverview = {
  fiscalYear: 'FY 2025\u201326',
  totalRevenue: '$248.6M',
  totalExpenses: '$234.1M',
  netPosition: '+$14.5M',
  endowment: '$1.28B',
  endowmentGrowth: '+8.4%',
  operatingMargin: '5.8%',
  debtService: '$12.4M',
  bondRating: 'A+ (S&P)',
  cashReserves: '$42.8M',
  reserveMonths: 2.2,
};

// --- Revenue Sources ---

interface RevenueSource {
  id: string;
  source: string;
  amount: string;
  percentage: number;
  change: string;
  color: string;
}

const REVENUE_SOURCES: RevenueSource[] = [
  { id: 'rev-1', source: 'Tuition & Fees', amount: '$128.4M', percentage: 51.6, change: '+4.2%', color: '#1D9BF0' },
  { id: 'rev-2', source: 'State Appropriations', amount: '$38.2M', percentage: 15.4, change: '+2.1%', color: '#22C55E' },
  { id: 'rev-3', source: 'Research Grants', amount: '$32.8M', percentage: 13.2, change: '+12.4%', color: '#1D9BF0' },
  { id: 'rev-4', source: 'Auxiliary Services', amount: '$22.6M', percentage: 9.1, change: '+1.8%', color: '#F59E0B' },
  { id: 'rev-5', source: 'Endowment Income', amount: '$14.2M', percentage: 5.7, change: '+8.4%', color: '#1D9BF0' },
  { id: 'rev-6', source: 'Gifts & Donations', amount: '$8.4M', percentage: 3.4, change: '-2.1%', color: '#F59E0B' },
  { id: 'rev-7', source: 'Athletics Revenue', amount: '$4.0M', percentage: 1.6, change: '+15.2%', color: '#1D9BF0' },
];

// --- Expense Categories ---

interface ExpenseCategory {
  id: string;
  category: string;
  amount: string;
  percentage: number;
  budgeted: string;
  variance: string;
  color: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'exp-1', category: 'Instruction', amount: '$82.4M', percentage: 35.2, budgeted: '$84.0M', variance: '-$1.6M', color: '#1D9BF0' },
  { id: 'exp-2', category: 'Research', amount: '$28.6M', percentage: 12.2, budgeted: '$27.0M', variance: '+$1.6M', color: '#1D9BF0' },
  { id: 'exp-3', category: 'Student Services', amount: '$24.8M', percentage: 10.6, budgeted: '$25.0M', variance: '-$0.2M', color: '#22C55E' },
  { id: 'exp-4', category: 'Institutional Support', amount: '$22.2M', percentage: 9.5, budgeted: '$22.5M', variance: '-$0.3M', color: '#F59E0B' },
  { id: 'exp-5', category: 'Academic Support', amount: '$18.4M', percentage: 7.9, budgeted: '$18.0M', variance: '+$0.4M', color: '#1D9BF0' },
  { id: 'exp-6', category: 'Athletics', amount: '$18.2M', percentage: 7.8, budgeted: '$18.0M', variance: '+$0.2M', color: '#F59E0B' },
  { id: 'exp-7', category: 'Facilities & Maintenance', amount: '$16.8M', percentage: 7.2, budgeted: '$16.5M', variance: '+$0.3M', color: '#1D9BF0' },
  { id: 'exp-8', category: 'Financial Aid (Institutional)', amount: '$14.6M', percentage: 6.2, budgeted: '$14.8M', variance: '-$0.2M', color: '#22C55E' },
  { id: 'exp-9', category: 'Debt Service', amount: '$8.1M', percentage: 3.4, budgeted: '$8.1M', variance: '$0.0M', color: '#1D9BF0' },
];

// --- Tuition & Fees Schedule ---

interface TuitionSchedule {
  id: string;
  category: string;
  inState: string;
  outOfState: string;
  perCredit: string;
  notes?: string;
}

const TUITION_FEES: TuitionSchedule[] = [
  { id: 'tf-1', category: 'Undergraduate Tuition', inState: '$12,480/yr', outOfState: '$28,640/yr', perCredit: '$520/cr (in-state)' },
  { id: 'tf-2', category: 'Graduate Tuition', inState: '$14,200/yr', outOfState: '$32,400/yr', perCredit: '$790/cr (in-state)' },
  { id: 'tf-3', category: 'MBA Program', inState: '$18,500/yr', outOfState: '$36,800/yr', perCredit: '$1,028/cr', notes: 'AACSB accredited' },
  { id: 'tf-4', category: 'Law School (J.D.)', inState: '$24,600/yr', outOfState: '$42,800/yr', perCredit: '$820/cr' },
  { id: 'tf-5', category: 'Student Activity Fee', inState: '$850/yr', outOfState: '$850/yr', perCredit: 'Flat fee' },
  { id: 'tf-6', category: 'Technology Fee', inState: '$400/yr', outOfState: '$400/yr', perCredit: 'Flat fee' },
  { id: 'tf-7', category: 'Health & Wellness Fee', inState: '$620/yr', outOfState: '$620/yr', perCredit: 'Flat fee' },
  { id: 'tf-8', category: 'Athletic Fee', inState: '$380/yr', outOfState: '$380/yr', perCredit: 'Flat fee' },
];

// --- Financial Aid Disbursed ---

interface AidDisbursement {
  id: string;
  aidType: string;
  amountDisbursed: string;
  recipientCount: number;
  avgAward: string;
  status: 'disbursed' | 'pending' | 'processing';
}

const AID_DISBURSEMENTS: AidDisbursement[] = [
  { id: 'aid-1', aidType: 'Federal Pell Grants', amountDisbursed: '$18.4M', recipientCount: 3420, avgAward: '$5,380', status: 'disbursed' },
  { id: 'aid-2', aidType: 'Institutional Scholarships', amountDisbursed: '$14.6M', recipientCount: 2840, avgAward: '$5,140', status: 'disbursed' },
  { id: 'aid-3', aidType: 'Federal Direct Loans', amountDisbursed: '$24.2M', recipientCount: 6180, avgAward: '$3,915', status: 'disbursed' },
  { id: 'aid-4', aidType: 'State Grants (HOPE/Zell Miller)', amountDisbursed: '$12.8M', recipientCount: 3640, avgAward: '$3,516', status: 'disbursed' },
  { id: 'aid-5', aidType: 'Athletic Scholarships', amountDisbursed: '$8.2M', recipientCount: 420, avgAward: '$19,524', status: 'disbursed' },
  { id: 'aid-6', aidType: 'Work-Study', amountDisbursed: '$2.1M', recipientCount: 680, avgAward: '$3,088', status: 'processing' },
  { id: 'aid-7', aidType: 'External Scholarships', amountDisbursed: '$3.8M', recipientCount: 1240, avgAward: '$3,064', status: 'disbursed' },
  { id: 'aid-8', aidType: 'Spring Semester Pending', amountDisbursed: '$2.4M', recipientCount: 840, avgAward: '$2,857', status: 'pending' },
];

const AID_STATUS_COLOR: Record<string, string> = {
  disbursed: '#22C55E',
  pending: '#F59E0B',
  processing: '#1D9BF0',
};

// --- Scholarship Fund Status ---

interface ScholarshipFund {
  id: string;
  name: string;
  balance: string;
  awarded: string;
  remaining: string;
  utilizationPct: number;
  endowed: boolean;
}

const SCHOLARSHIP_FUNDS: ScholarshipFund[] = [
  { id: 'sf-1', name: 'Presidential Scholarship Fund', balance: '$4.2M', awarded: '$3.1M', remaining: '$1.1M', utilizationPct: 74, endowed: true },
  { id: 'sf-2', name: 'Dean\'s Excellence Fund', balance: '$2.8M', awarded: '$2.4M', remaining: '$0.4M', utilizationPct: 86, endowed: true },
  { id: 'sf-3', name: 'STEM Innovation Fund', balance: '$1.6M', awarded: '$0.9M', remaining: '$0.7M', utilizationPct: 56, endowed: false },
  { id: 'sf-4', name: 'Diversity Leadership Fund', balance: '$1.2M', awarded: '$0.8M', remaining: '$0.4M', utilizationPct: 67, endowed: true },
  { id: 'sf-5', name: 'Community Service Fund', balance: '$0.6M', awarded: '$0.4M', remaining: '$0.2M', utilizationPct: 67, endowed: false },
  { id: 'sf-6', name: 'Fine Arts Talent Fund', balance: '$0.8M', awarded: '$0.6M', remaining: '$0.2M', utilizationPct: 75, endowed: true },
];

// --- Audit Status ---

interface AuditItem {
  id: string;
  auditType: string;
  period: string;
  status: 'completed' | 'in_progress' | 'scheduled' | 'pending';
  findings: number;
  auditor: string;
  completionDate?: string;
}

const AUDIT_LOG: AuditItem[] = [
  { id: 'aud-1', auditType: 'Annual Financial Audit', period: 'FY 2024\u201325', status: 'completed', findings: 0, auditor: 'Deloitte', completionDate: 'Dec 2025' },
  { id: 'aud-2', auditType: 'A-133 Single Audit (Federal)', period: 'FY 2024\u201325', status: 'completed', findings: 1, auditor: 'Deloitte', completionDate: 'Jan 2026' },
  { id: 'aud-3', auditType: 'NCAA Financial Audit', period: 'FY 2024\u201325', status: 'in_progress', findings: 0, auditor: 'KPMG' },
  { id: 'aud-4', auditType: 'IT Security Audit', period: 'Spring 2026', status: 'scheduled', findings: 0, auditor: 'CrowdStrike' },
  { id: 'aud-5', auditType: 'Title IV Compliance', period: 'FY 2025\u201326', status: 'scheduled', findings: 0, auditor: 'DOE' },
];

const AUDIT_STATUS_COLOR: Record<string, string> = {
  completed: '#22C55E',
  in_progress: '#1D9BF0',
  scheduled: '#1D9BF0',
  pending: '#F59E0B',
};

// --- Financial Health KPIs (for Overview) ---

const FINANCIAL_HEALTH = [
  { id: 'fh-1', label: 'Composite Score', value: '3.2', target: '3.0+', status: 'good' as const },
  { id: 'fh-2', label: 'Primary Reserve', value: '0.42', target: '0.40+', status: 'good' as const },
  { id: 'fh-3', label: 'Equity Ratio', value: '0.61', target: '0.30+', status: 'good' as const },
  { id: 'fh-4', label: 'Return on Net Assets', value: '4.8%', target: '3.0%+', status: 'good' as const },
  { id: 'fh-5', label: 'Viability Ratio', value: '1.24', target: '1.0+', status: 'good' as const },
  { id: 'fh-6', label: 'Debt Coverage', value: '2.1x', target: '1.5x+', status: 'good' as const },
];

const HEALTH_STATUS_COLOR: Record<string, string> = { good: '#22C55E', warning: '#F59E0B', critical: '#EF4444' };

// --- Payment Plans (for Student Accounts) ---

const PAYMENT_PLANS = [
  { id: 'pp-1', name: '4-Month Installment', desc: 'Equal payments over 4 months', fee: '$50/semester', enrolled: 2840 },
  { id: 'pp-2', name: 'Monthly Budget Plan', desc: '12 monthly payments', fee: '$75/year', enrolled: 1420 },
  { id: 'pp-3', name: 'Deferred Payment', desc: 'Full balance due mid-term', fee: 'No fee', enrolled: 680 },
];

// --- Account Holds ---

const ACCOUNT_HOLDS = [
  { id: 'ah-1', type: 'Library', reason: 'Overdue materials', amount: '$45.00', since: 'Jan 2026', severity: 'low' as const },
  { id: 'ah-2', type: 'Parking', reason: 'Unpaid citation', amount: '$75.00', since: 'Dec 2025', severity: 'low' as const },
  { id: 'ah-3', type: 'Tuition', reason: 'Payment plan missed', amount: '$1,560.00', since: 'Feb 2026', severity: 'high' as const },
];

// --- Student Personal Account (E4 view) ---

interface StudentAccount {
  studentName: string;
  studentId: string;
  balance: string;
  balanceStatus: 'current' | 'overdue' | 'credit';
  term: string;
  tuition: string;
  fees: string;
  housing: string;
  mealPlan: string;
  totalCharges: string;
  aidApplied: string;
  paymentsReceived: string;
  paymentDue: string;
  nextPaymentDate: string;
}

const STUDENT_ACCOUNT: StudentAccount = {
  studentName: 'Current Student',
  studentId: 'W20230415',
  balance: '$2,840.00',
  balanceStatus: 'current',
  term: 'Spring 2026',
  tuition: '$6,240.00',
  fees: '$1,125.00',
  housing: '$4,200.00',
  mealPlan: '$2,100.00',
  totalCharges: '$13,665.00',
  aidApplied: '-$8,400.00',
  paymentsReceived: '-$2,425.00',
  paymentDue: '$2,840.00',
  nextPaymentDate: 'Mar 15, 2026',
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count }: { title: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={shrd.headerRow}>
      <ThemedText style={[shrd.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[shrd.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[shrd.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
});

// =============================================================================
// BLOCK: BUDGET OVERVIEW (E1/E2)
// =============================================================================

function BudgetOverviewBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  if (!isDeanLevel(role)) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="BUDGET OVERVIEW" colors={colors} />
      <Card colors={colors}>
        <ThemedText style={[s.fiscalYear, { color: colors.textSecondary }]}>{BUDGET.fiscalYear}</ThemedText>
        <View style={s.budgetGrid}>
          <View style={s.budgetStat}>
            <ThemedText style={[s.budgetValue, { color: colors.text }]}>{BUDGET.totalRevenue}</ThemedText>
            <ThemedText style={[s.budgetLabel, { color: colors.textSecondary }]}>Revenue</ThemedText>
          </View>
          <View style={s.budgetStat}>
            <ThemedText style={[s.budgetValue, { color: colors.text }]}>{BUDGET.totalExpenses}</ThemedText>
            <ThemedText style={[s.budgetLabel, { color: colors.textSecondary }]}>Expenses</ThemedText>
          </View>
          <View style={s.budgetStat}>
            <ThemedText style={[s.budgetValue, { color: '#22C55E' }]}>{BUDGET.netPosition}</ThemedText>
            <ThemedText style={[s.budgetLabel, { color: colors.textSecondary }]}>Net Position</ThemedText>
          </View>
          <View style={s.budgetStat}>
            <ThemedText style={[s.budgetValue, { color: colors.text }]}>{BUDGET.endowment}</ThemedText>
            <ThemedText style={[s.budgetLabel, { color: colors.textSecondary }]}>Endowment</ThemedText>
          </View>
        </View>

        {isPresident(role) && (
          <View style={s.budgetExtraGrid}>
            <View style={s.budgetExtraStat}>
              <ThemedText style={[s.budgetExtraValue, { color: colors.text }]}>{BUDGET.operatingMargin}</ThemedText>
              <ThemedText style={[s.budgetExtraLabel, { color: colors.textSecondary }]}>Op Margin</ThemedText>
            </View>
            <View style={s.budgetExtraStat}>
              <ThemedText style={[s.budgetExtraValue, { color: colors.text }]}>{BUDGET.bondRating}</ThemedText>
              <ThemedText style={[s.budgetExtraLabel, { color: colors.textSecondary }]}>Bond Rating</ThemedText>
            </View>
            <View style={s.budgetExtraStat}>
              <ThemedText style={[s.budgetExtraValue, { color: colors.text }]}>{BUDGET.cashReserves}</ThemedText>
              <ThemedText style={[s.budgetExtraLabel, { color: colors.textSecondary }]}>Cash Reserves</ThemedText>
            </View>
            <View style={s.budgetExtraStat}>
              <ThemedText style={[s.budgetExtraValue, { color: colors.text }]}>{BUDGET.reserveMonths} mo</ThemedText>
              <ThemedText style={[s.budgetExtraLabel, { color: colors.textSecondary }]}>Runway</ThemedText>
            </View>
          </View>
        )}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK: REVENUE SOURCES (E1/E2)
// =============================================================================

function RevenueSources({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="REVENUE SOURCES" colors={colors} count={REVENUE_SOURCES.length} />
      <Card colors={colors}>
        {REVENUE_SOURCES.map((src, idx) => (
          <View
            key={src.id}
            style={[
              s.revenueRow,
              idx < REVENUE_SOURCES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.revenueDot, { backgroundColor: src.color }]} />
            <View style={s.revenueContent}>
              <ThemedText style={[s.revenueSource, { color: colors.text }]}>{src.source}</ThemedText>
              <View style={s.revenueBarContainer}>
                <View style={[s.revenueBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.revenueBarFill, { width: `${src.percentage}%`, backgroundColor: src.color }]} />
                </View>
              </View>
            </View>
            <View style={s.revenueRight}>
              <ThemedText style={[s.revenueAmount, { color: colors.text }]}>{src.amount}</ThemedText>
              <ThemedText style={[s.revenueChange, { color: src.change.startsWith('+') ? '#22C55E' : '#EF4444' }]}>
                {src.change}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK: EXPENSE CATEGORIES (E1/E2)
// =============================================================================

function ExpenseCategoriesBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="EXPENSE CATEGORIES" colors={colors} count={EXPENSE_CATEGORIES.length} />
      <Card colors={colors}>
        {EXPENSE_CATEGORIES.map((exp, idx) => {
          const varianceColor = exp.variance.startsWith('+') ? '#F59E0B' : exp.variance === '$0.0M' ? '#22C55E' : '#22C55E';
          return (
            <View
              key={exp.id}
              style={[
                s.expenseRow,
                idx < EXPENSE_CATEGORIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[s.expenseDot, { backgroundColor: exp.color }]} />
              <View style={s.expenseContent}>
                <ThemedText style={[s.expenseCategory, { color: colors.text }]}>{exp.category}</ThemedText>
                <ThemedText style={[s.expenseBudgeted, { color: colors.textTertiary }]}>
                  Budget: {exp.budgeted} {'\u00B7'} Variance: {exp.variance}
                </ThemedText>
              </View>
              <View style={s.expenseRight}>
                <ThemedText style={[s.expenseAmount, { color: colors.text }]}>{exp.amount}</ThemedText>
                <ThemedText style={[s.expensePct, { color: colors.textSecondary }]}>{exp.percentage}%</ThemedText>
              </View>
            </View>
          );
        })}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK: TUITION & FEES
// =============================================================================

function TuitionFeesBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="TUITION & FEES" colors={colors} count={TUITION_FEES.length} />
      <Card colors={colors}>
        {TUITION_FEES.map((tf, idx) => (
          <View
            key={tf.id}
            style={[
              s.tuitionRow,
              idx < TUITION_FEES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.tuitionContent}>
              <ThemedText style={[s.tuitionCategory, { color: colors.text }]}>{tf.category}</ThemedText>
              {tf.notes && (
                <ThemedText style={[s.tuitionNotes, { color: colors.textTertiary }]}>{tf.notes}</ThemedText>
              )}
            </View>
            <View style={s.tuitionRight}>
              <ThemedText style={[s.tuitionInState, { color: colors.text }]}>{tf.inState}</ThemedText>
              <ThemedText style={[s.tuitionOutState, { color: colors.textSecondary }]}>
                Out: {tf.outOfState}
              </ThemedText>
              <ThemedText style={[s.tuitionPerCredit, { color: colors.textTertiary }]}>{tf.perCredit}</ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK: FINANCIAL AID DISBURSED (E1/E2)
// =============================================================================

function AidDisbursedBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="FINANCIAL AID DISBURSED" colors={colors} count={AID_DISBURSEMENTS.length} />
      <Card colors={colors}>
        {AID_DISBURSEMENTS.map((aid, idx) => (
          <View
            key={aid.id}
            style={[
              s.aidRow,
              idx < AID_DISBURSEMENTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.aidContent}>
              <View style={s.aidNameRow}>
                <ThemedText style={[s.aidType, { color: colors.text }]}>{aid.aidType}</ThemedText>
                <View style={[s.aidStatusBadge, { backgroundColor: AID_STATUS_COLOR[aid.status] + '20' }]}>
                  <ThemedText style={[s.aidStatusText, { color: AID_STATUS_COLOR[aid.status] }]}>
                    {aid.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.aidMeta, { color: colors.textSecondary }]}>
                {aid.recipientCount.toLocaleString()} recipients {'\u00B7'} Avg: {aid.avgAward}
              </ThemedText>
            </View>
            <ThemedText style={[s.aidAmount, { color: colors.text }]}>{aid.amountDisbursed}</ThemedText>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK: SCHOLARSHIP FUND STATUS (E1/E2)
// =============================================================================

function ScholarshipFundsBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="SCHOLARSHIP FUNDS" colors={colors} count={SCHOLARSHIP_FUNDS.length} />
      <Card colors={colors}>
        {SCHOLARSHIP_FUNDS.map((fund, idx) => (
          <View
            key={fund.id}
            style={[
              s.fundRow,
              idx < SCHOLARSHIP_FUNDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.fundContent}>
              <View style={s.fundNameRow}>
                <ThemedText style={[s.fundName, { color: colors.text }]}>{fund.name}</ThemedText>
                {fund.endowed && (
                  <View style={[s.endowedBadge, { backgroundColor: '#1D9BF020' }]}>
                    <ThemedText style={[s.endowedText, { color: '#1D9BF0' }]}>ENDOWED</ThemedText>
                  </View>
                )}
              </View>
              <View style={s.fundBarContainer}>
                <View style={[s.fundBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                  <View style={[s.fundBarFill, { width: `${fund.utilizationPct}%`, backgroundColor: fund.utilizationPct >= 85 ? '#EF4444' : fund.utilizationPct >= 70 ? '#F59E0B' : '#22C55E' }]} />
                </View>
                <ThemedText style={[s.fundPct, { color: colors.textSecondary }]}>
                  {fund.utilizationPct}% utilized
                </ThemedText>
              </View>
              <ThemedText style={[s.fundAmounts, { color: colors.textTertiary }]}>
                Balance: {fund.balance} {'\u00B7'} Awarded: {fund.awarded} {'\u00B7'} Remaining: {fund.remaining}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK: AUDIT STATUS (E1/E2)
// =============================================================================

function AuditStatusBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="AUDIT STATUS" colors={colors} count={AUDIT_LOG.length} />
      <Card colors={colors}>
        {AUDIT_LOG.map((audit, idx) => (
          <View
            key={audit.id}
            style={[
              s.auditRow,
              idx < AUDIT_LOG.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.auditStatusDot, { backgroundColor: AUDIT_STATUS_COLOR[audit.status] }]} />
            <View style={s.auditContent}>
              <ThemedText style={[s.auditType, { color: colors.text }]}>{audit.auditType}</ThemedText>
              <ThemedText style={[s.auditPeriod, { color: colors.textSecondary }]}>
                {audit.period} {'\u00B7'} {audit.auditor}
              </ThemedText>
              {audit.findings > 0 && (
                <ThemedText style={[s.auditFindings, { color: '#F59E0B' }]}>
                  {audit.findings} finding(s)
                </ThemedText>
              )}
            </View>
            <View style={[s.auditStatusBadge, { backgroundColor: AUDIT_STATUS_COLOR[audit.status] + '20' }]}>
              <ThemedText style={[s.auditStatusText, { color: AUDIT_STATUS_COLOR[audit.status] }]}>
                {audit.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK: STUDENT PERSONAL ACCOUNT (E4)
// =============================================================================

function StudentAccountBlock({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const balanceColor = STUDENT_ACCOUNT.balanceStatus === 'overdue' ? '#EF4444' :
    STUDENT_ACCOUNT.balanceStatus === 'credit' ? '#22C55E' : colors.text;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="MY ACCOUNT" colors={colors} />
      <Card colors={colors}>
        <View style={s.accountHeader}>
          <ThemedText style={[s.accountTerm, { color: colors.textSecondary }]}>{STUDENT_ACCOUNT.term}</ThemedText>
          <ThemedText style={[s.accountBalance, { color: balanceColor }]}>
            Balance: {STUDENT_ACCOUNT.balance}
          </ThemedText>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        <ThemedText style={[s.accountSubheading, { color: colors.text }]}>Charges</ThemedText>
        <View style={s.accountLine}>
          <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Tuition</ThemedText>
          <ThemedText style={[s.accountLineValue, { color: colors.text }]}>{STUDENT_ACCOUNT.tuition}</ThemedText>
        </View>
        <View style={s.accountLine}>
          <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Fees</ThemedText>
          <ThemedText style={[s.accountLineValue, { color: colors.text }]}>{STUDENT_ACCOUNT.fees}</ThemedText>
        </View>
        <View style={s.accountLine}>
          <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Housing</ThemedText>
          <ThemedText style={[s.accountLineValue, { color: colors.text }]}>{STUDENT_ACCOUNT.housing}</ThemedText>
        </View>
        <View style={s.accountLine}>
          <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Meal Plan</ThemedText>
          <ThemedText style={[s.accountLineValue, { color: colors.text }]}>{STUDENT_ACCOUNT.mealPlan}</ThemedText>
        </View>
        <View style={[s.accountLine, s.totalLine]}>
          <ThemedText style={[s.accountLineLabel, { color: colors.text, fontWeight: '700' }]}>Total Charges</ThemedText>
          <ThemedText style={[s.accountLineValue, { color: colors.text, fontWeight: '700' }]}>{STUDENT_ACCOUNT.totalCharges}</ThemedText>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        <ThemedText style={[s.accountSubheading, { color: colors.text }]}>Credits</ThemedText>
        <View style={s.accountLine}>
          <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Financial Aid</ThemedText>
          <ThemedText style={[s.accountLineValue, { color: '#22C55E' }]}>{STUDENT_ACCOUNT.aidApplied}</ThemedText>
        </View>
        <View style={s.accountLine}>
          <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Payments</ThemedText>
          <ThemedText style={[s.accountLineValue, { color: '#22C55E' }]}>{STUDENT_ACCOUNT.paymentsReceived}</ThemedText>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        <View style={s.accountLine}>
          <ThemedText style={[s.accountLineLabel, { color: colors.text, fontWeight: '700' }]}>Amount Due</ThemedText>
          <ThemedText style={[s.accountLineValue, { color: balanceColor, fontWeight: '700', fontSize: 16 }]}>
            {STUDENT_ACCOUNT.paymentDue}
          </ThemedText>
        </View>
        <ThemedText style={[s.paymentDueDate, { color: colors.textTertiary }]}>
          Next payment due: {STUDENT_ACCOUNT.nextPaymentDate}
        </ThemedText>

        <Pressable
          style={({ pressed }) => [s.payButton, { borderColor: colors.borderStrong, opacity: pressed ? 0.7 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="creditcard.fill" size={14} color={colors.text} />
          <ThemedText style={[s.payButtonText, { color: colors.text }]}>Make a Payment</ThemedText>
        </Pressable>
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK: HIDDEN NOTICE (E5)
// =============================================================================

function HiddenNotice({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.hiddenContainer}>
      <Card colors={colors}>
        <View style={s.hiddenContent}>
          <IconSymbol name="lock.fill" size={28} color={colors.textTertiary} />
          <ThemedText style={[s.hiddenTitle, { color: colors.text }]}>Financial Information</ThemedText>
          <ThemedText style={[s.hiddenText, { color: colors.textSecondary }]}>
            Financial details are available to authorized university personnel and enrolled students. Please sign in with your university credentials.
          </ThemedText>
        </View>
      </Card>
    </View>
  );
}

// =============================================================================
// VIEW 1: OVERVIEW
// =============================================================================

function OverviewView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      {/* Budget Overview (E1/E2) */}
      <BudgetOverviewBlock colors={colors} role={role} />

      {/* Financial Health KPIs (E1/E2) */}
      {isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="FINANCIAL HEALTH INDICATORS" colors={colors} count={FINANCIAL_HEALTH.length} />
          <Card colors={colors}>
            {FINANCIAL_HEALTH.map((kpi, idx) => (
              <View key={kpi.id} style={[s.healthRow, idx < FINANCIAL_HEALTH.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <View style={s.healthContent}>
                  <ThemedText style={[s.healthLabel, { color: colors.text }]}>{kpi.label}</ThemedText>
                  <ThemedText style={[s.healthTarget, { color: colors.textTertiary }]}>Target: {kpi.target}</ThemedText>
                </View>
                <View style={s.healthRight}>
                  <ThemedText style={[s.healthValue, { color: HEALTH_STATUS_COLOR[kpi.status] }]}>{kpi.value}</ThemedText>
                  <View style={[s.healthDot, { backgroundColor: HEALTH_STATUS_COLOR[kpi.status] }]} />
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* E3 sees a simplified overview */}
      {isFacultyLevel(role) && !isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="QUICK STATS" colors={colors} />
          <Card colors={colors}>
            <View style={s.budgetGrid}>
              {[
                { v: BUDGET.totalRevenue, l: 'Total Revenue' },
                { v: BUDGET.operatingMargin, l: 'Op Margin' },
                { v: BUDGET.endowment, l: 'Endowment' },
                { v: BUDGET.bondRating, l: 'Bond Rating' },
              ].map(item => (
                <View key={item.l} style={s.budgetStat}>
                  <ThemedText style={[s.budgetValue, { color: colors.text, fontSize: 16 }]}>{item.v}</ThemedText>
                  <ThemedText style={[s.budgetLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* E4 sees tuition summary + aid CTA */}
      {isStudent(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="YOUR FINANCIAL SUMMARY" colors={colors} />
          <Card colors={colors}>
            <View style={s.accountHeader}>
              <ThemedText style={[s.accountTerm, { color: colors.textSecondary }]}>{STUDENT_ACCOUNT.term}</ThemedText>
              <ThemedText style={[s.accountBalance, { color: colors.text }]}>Balance: {STUDENT_ACCOUNT.balance}</ThemedText>
            </View>
            <ThemedText style={[s.paymentDueDate, { color: colors.textTertiary }]}>
              Next payment due: {STUDENT_ACCOUNT.nextPaymentDate}
            </ThemedText>
            <Pressable style={({ pressed }) => [s.ctaRow, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="arrow.right.circle.fill" size={14} color={colors.text} />
              <ThemedText style={[s.ctaText, { color: colors.text }]}>View Full Account</ThemedText>
            </Pressable>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW 2: STUDENT ACCOUNTS
// =============================================================================

function StudentAccountsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      {/* Student personal account */}
      <StudentAccountBlock colors={colors} role={role} />

      {/* Payment Plans */}
      <View style={s.moduleContainer}>
        <SectionHeader title="PAYMENT PLAN OPTIONS" colors={colors} count={PAYMENT_PLANS.length} />
        {PAYMENT_PLANS.map(plan => (
          <Card key={plan.id} colors={colors}>
            <View style={s.planHeader}>
              <ThemedText style={[s.planName, { color: colors.text }]}>{plan.name}</ThemedText>
              <ThemedText style={[s.planFee, { color: '#1D9BF0' }]}>{plan.fee}</ThemedText>
            </View>
            <ThemedText style={[s.planDesc, { color: colors.textSecondary }]}>{plan.desc}</ThemedText>
            {isDeanLevel(role) && (
              <ThemedText style={[s.planEnrolled, { color: colors.textTertiary }]}>{plan.enrolled.toLocaleString()} students enrolled</ThemedText>
            )}
          </Card>
        ))}
      </View>

      {/* Account Holds */}
      {(isStudent(role) || isDeanLevel(role)) && (
        <View style={s.moduleContainer}>
          <SectionHeader title={isStudent(role) ? 'YOUR HOLDS' : 'ACCOUNT HOLDS OVERVIEW'} colors={colors} count={isStudent(role) ? ACCOUNT_HOLDS.length : undefined} />
          <Card colors={colors}>
            {isStudent(role) ? (
              ACCOUNT_HOLDS.map((hold, idx) => (
                <View key={hold.id} style={[s.holdRow, idx < ACCOUNT_HOLDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={[s.holdDot, { backgroundColor: hold.severity === 'high' ? '#EF4444' : '#F59E0B' }]} />
                  <View style={s.holdContent}>
                    <ThemedText style={[s.holdType, { color: colors.text }]}>{hold.type} Hold</ThemedText>
                    <ThemedText style={[s.holdReason, { color: colors.textSecondary }]}>{hold.reason} {'\u00B7'} Since {hold.since}</ThemedText>
                  </View>
                  <ThemedText style={[s.holdAmount, { color: hold.severity === 'high' ? '#EF4444' : colors.text }]}>{hold.amount}</ThemedText>
                </View>
              ))
            ) : (
              <View style={s.budgetGrid}>
                {[
                  { v: '342', l: 'Active Holds', c: '#EF4444' },
                  { v: '128', l: 'Tuition Holds', c: '#EF4444' },
                  { v: '98', l: 'Library Holds', c: '#F59E0B' },
                  { v: '116', l: 'Other Holds', c: '#F59E0B' },
                ].map(item => (
                  <View key={item.l} style={s.budgetStat}>
                    <ThemedText style={[s.budgetValue, { color: item.c, fontSize: 18 }]}>{item.v}</ThemedText>
                    <ThemedText style={[s.budgetLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW 3: AID & AWARDS
// =============================================================================

function AidAwardsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      <AidDisbursedBlock colors={colors} role={role} />
      <ScholarshipFundsBlock colors={colors} role={role} />

      {/* E3 limited aid summary */}
      {isFacultyLevel(role) && !isDeanLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="AID STATISTICS" colors={colors} />
          <Card colors={colors}>
            <View style={s.budgetGrid}>
              {[
                { v: '$84.1M', l: 'Total Disbursed' },
                { v: '18,260', l: 'Recipients' },
                { v: '72%', l: 'Students w/ Aid' },
                { v: '$4,606', l: 'Avg Award' },
              ].map(item => (
                <View key={item.l} style={s.budgetStat}>
                  <ThemedText style={[s.budgetValue, { color: colors.text, fontSize: 16 }]}>{item.v}</ThemedText>
                  <ThemedText style={[s.budgetLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW 4: TUITION & FEES
// =============================================================================

function TuitionFeesView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      <TuitionFeesBlock colors={colors} role={role} />

      {/* Fee comparison for students */}
      {isStudent(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="YOUR ESTIMATED COSTS" colors={colors} />
          <Card colors={colors}>
            <View style={s.accountLine}>
              <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Tuition (in-state)</ThemedText>
              <ThemedText style={[s.accountLineValue, { color: colors.text }]}>$12,480</ThemedText>
            </View>
            <View style={s.accountLine}>
              <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Required Fees</ThemedText>
              <ThemedText style={[s.accountLineValue, { color: colors.text }]}>$2,250</ThemedText>
            </View>
            <View style={s.accountLine}>
              <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Housing (avg)</ThemedText>
              <ThemedText style={[s.accountLineValue, { color: colors.text }]}>$8,400</ThemedText>
            </View>
            <View style={s.accountLine}>
              <ThemedText style={[s.accountLineLabel, { color: colors.textSecondary }]}>Meal Plan (avg)</ThemedText>
              <ThemedText style={[s.accountLineValue, { color: colors.text }]}>$4,200</ThemedText>
            </View>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.accountLine}>
              <ThemedText style={[s.accountLineLabel, { color: colors.text, fontWeight: '700' }]}>Estimated Total</ThemedText>
              <ThemedText style={[s.accountLineValue, { color: colors.text, fontWeight: '700' }]}>$27,330/yr</ThemedText>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW 5: REVENUE & EXPENSES (E1/E2)
// =============================================================================

function RevenueExpensesView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      <RevenueSources colors={colors} role={role} />
      <ExpenseCategoriesBlock colors={colors} role={role} />
    </View>
  );
}

// =============================================================================
// VIEW 6: AUDIT & CONTROLS (E1/E2)
// =============================================================================

function AuditControlsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  return (
    <View>
      <AuditStatusBlock colors={colors} role={role} />

      {/* Compliance summary */}
      {isPresident(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="COMPLIANCE SNAPSHOT" colors={colors} />
          <Card colors={colors}>
            <View style={s.budgetGrid}>
              {[
                { v: '100%', l: 'Title IV', c: '#22C55E' },
                { v: '100%', l: 'A-133', c: '#22C55E' },
                { v: 'On Track', l: 'SACSCOC', c: '#22C55E' },
                { v: '1 Finding', l: 'Open Issues', c: '#F59E0B' },
              ].map(item => (
                <View key={item.l} style={s.budgetStat}>
                  <ThemedText style={[s.budgetValue, { color: item.c, fontSize: 16 }]}>{item.v}</ThemedText>
                  <ThemedText style={[s.budgetLabel, { color: colors.textSecondary }]}>{item.l}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduFinancial({ colors, role = 'E1', onSwitchTab }: Props) {
  const availableViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<FinancialView>(availableViews[0]?.id ?? 'overview');

  const currentViewValid = availableViews.some(v => v.id === activeView);
  const resolvedView = currentViewValid ? activeView : availableViews[0]?.id ?? 'overview';

  if (role === 'E5') {
    return (
      <ScrollView
        style={[s.container, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <HiddenNotice colors={colors} />
        <View style={s.bottomSpacer} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* View Toggle Pills */}
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

      {/* Active View */}
      {resolvedView === 'overview' && <OverviewView colors={colors} role={role} />}
      {resolvedView === 'student-accounts' && <StudentAccountsView colors={colors} role={role} />}
      {resolvedView === 'aid-awards' && <AidAwardsView colors={colors} role={role} />}
      {resolvedView === 'tuition-fees' && <TuitionFeesView colors={colors} role={role} />}
      {resolvedView === 'revenue-expenses' && <RevenueExpensesView colors={colors} role={role} />}
      {resolvedView === 'audit-controls' && <AuditControlsView colors={colors} role={role} />}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.md },

  // Pill toggle
  pillRow: { marginBottom: Spacing.lg },
  pillScroll: { gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600' },

  // CTA row
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm },
  ctaText: { fontSize: 13, fontWeight: '600' },

  // Health indicators
  healthRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  healthContent: { flex: 1 },
  healthLabel: { fontSize: 13, fontWeight: '500' },
  healthTarget: { fontSize: 10, marginTop: 1 },
  healthRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthValue: { fontSize: 15, fontWeight: '700' },
  healthDot: { width: 8, height: 8, borderRadius: 4 },

  // Payment plans
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  planName: { fontSize: 14, fontWeight: '600' },
  planFee: { fontSize: 12, fontWeight: '600' },
  planDesc: { fontSize: 12, marginBottom: 2 },
  planEnrolled: { fontSize: 10, marginTop: 2 },

  // Holds
  holdRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  holdDot: { width: 8, height: 8, borderRadius: 4 },
  holdContent: { flex: 1 },
  holdType: { fontSize: 13, fontWeight: '600' },
  holdReason: { fontSize: 11, marginTop: 1 },
  holdAmount: { fontSize: 13, fontWeight: '700' },

  // Budget
  fiscalYear: { fontSize: 12, fontWeight: '600', marginBottom: Spacing.md },
  budgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm },
  budgetStat: { width: '46%', alignItems: 'center' },
  budgetValue: { fontSize: 20, fontWeight: '700' },
  budgetLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  budgetExtraGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  budgetExtraStat: { width: '46%', alignItems: 'center' },
  budgetExtraValue: { fontSize: 14, fontWeight: '600' },
  budgetExtraLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // Revenue
  revenueRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  revenueDot: { width: 8, height: 8, borderRadius: 4 },
  revenueContent: { flex: 1 },
  revenueSource: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  revenueBarContainer: {},
  revenueBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  revenueBarFill: { height: '100%', borderRadius: 3 },
  revenueRight: { alignItems: 'flex-end' },
  revenueAmount: { fontSize: 13, fontWeight: '700' },
  revenueChange: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Expenses
  expenseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  expenseDot: { width: 8, height: 8, borderRadius: 4 },
  expenseContent: { flex: 1 },
  expenseCategory: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  expenseBudgeted: { fontSize: 10 },
  expenseRight: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: 13, fontWeight: '700' },
  expensePct: { fontSize: 10, marginTop: 2 },

  // Tuition
  tuitionRow: { flexDirection: 'row', paddingVertical: 10, gap: Spacing.sm },
  tuitionContent: { flex: 1 },
  tuitionCategory: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  tuitionNotes: { fontSize: 10 },
  tuitionRight: { alignItems: 'flex-end', gap: 2 },
  tuitionInState: { fontSize: 13, fontWeight: '700' },
  tuitionOutState: { fontSize: 11 },
  tuitionPerCredit: { fontSize: 10 },

  // Aid
  aidRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  aidContent: { flex: 1 },
  aidNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  aidType: { fontSize: 13, fontWeight: '600' },
  aidStatusBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  aidStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  aidMeta: { fontSize: 11 },
  aidAmount: { fontSize: 14, fontWeight: '700' },

  // Funds
  fundRow: { paddingVertical: 10 },
  fundContent: {},
  fundNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  fundName: { fontSize: 14, fontWeight: '600' },
  endowedBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  endowedText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  fundBarContainer: { marginBottom: 4 },
  fundBarBg: { height: 6, borderRadius: 3, marginBottom: 3, overflow: 'hidden' },
  fundBarFill: { height: '100%', borderRadius: 3 },
  fundPct: { fontSize: 10 },
  fundAmounts: { fontSize: 11 },

  // Audit
  auditRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm },
  auditStatusDot: { width: 8, height: 8, borderRadius: 4 },
  auditContent: { flex: 1 },
  auditType: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  auditPeriod: { fontSize: 11 },
  auditFindings: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  auditStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  auditStatusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Student account
  accountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  accountTerm: { fontSize: 13, fontWeight: '600' },
  accountBalance: { fontSize: 16, fontWeight: '700' },
  accountSubheading: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  accountLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  accountLineLabel: { fontSize: 13 },
  accountLineValue: { fontSize: 13, fontWeight: '600' },
  totalLine: { marginTop: Spacing.sm, paddingTop: Spacing.sm },
  paymentDueDate: { fontSize: 11, marginTop: Spacing.sm, marginBottom: Spacing.md },
  payButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  payButtonText: { fontSize: 14, fontWeight: '600' },

  // Hidden
  hiddenContainer: { marginTop: Spacing.xl },
  hiddenContent: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  hiddenTitle: { fontSize: 16, fontWeight: '700' },
  hiddenText: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: Spacing.md },
});
