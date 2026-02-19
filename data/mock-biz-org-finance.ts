/**
 * Business Organization Finance — Mock Data & Types (V2)
 * 7-tab Finance Hub: Overview, Ledger, Budgets, Commitments, Forecast, Controls, Audit.
 *
 * KEY RULE: Finance authorizes; Payment Rails releases.
 * Finance NEVER releases directly.
 *
 * State machine states flow through: draft -> proposed -> rule_checked -> authorized
 * (Finance stops here) -> scheduled -> released -> in_flight -> settled (Payment Rails handles)
 */

import type { BizTxnState } from '@/data/biz-org-shared-types';
import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  SPONSOR_BANK,
  PAYMENT_PROCESSOR,
  SLIEMA_WANDERERS,
  TARGET_BANK,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TYPES
// =============================================================================

export type BizFinanceV2TabId =
  | 'overview'
  | 'ledger'
  | 'budgets'
  | 'commitments'
  | 'forecast'
  | 'controls'
  | 'audit';

export interface FinanceTruthChip {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface FinanceLedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  state: BizTxnState;
  entityId: string;
  entityName: string;
  category: string;
  createdBy: string;
  approvedBy: string | null;
  releasedBy: string | null;
  commitmentId: string | null;
  receiptId: string | null;
}

export interface FinanceBudget {
  id: string;
  name: string;
  entityName: string;
  department: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePct: number;
  status: 'on_track' | 'at_risk' | 'over_budget';
}

export interface FinanceCommitment {
  id: string;
  description: string;
  amount: number;
  entityName: string;
  sourceTab: string;
  sourceId: string;
  dueDate: string;
  status: 'pending' | 'active' | 'fulfilled' | 'cancelled';
}

export interface FinanceForecastMonth {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface FinanceControl {
  id: string;
  name: string;
  description: string;
  threshold: string;
  dualControl: boolean;
  rbacLevel: string;
  status: 'active' | 'disabled';
}

export interface FinanceAuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  entityName: string;
  type: string;
  receiptId?: string;
}

export interface EntitySummary {
  entityId: string;
  entityName: string;
  revenue: number;
  expenses: number;
  net: number;
  status: 'on_track' | 'at_risk' | 'over_budget';
}

export interface FinanceTopDriver {
  id: string;
  label: string;
  type: 'revenue' | 'obligation';
  amount: number;
  impact: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export interface FinanceApprovalQueueItem {
  id: string;
  label: string;
  amount: number;
  requester: string;
  status: 'pending' | 'approved' | 'denied';
  urgency: 'high' | 'medium' | 'low';
}

export type FinanceControlCategories = Record<string, number>;

export interface BizFinanceV2Data {
  truthChips: FinanceTruthChip[];
  entitySummaries: EntitySummary[];
  ledger: FinanceLedgerEntry[];
  budgets: FinanceBudget[];
  commitments: FinanceCommitment[];
  forecastBase: FinanceForecastMonth[];
  forecastBull: FinanceForecastMonth[];
  forecastBear: FinanceForecastMonth[];
  controls: FinanceControl[];
  auditTrail: FinanceAuditEntry[];
  topDrivers: FinanceTopDriver[];
  approvalQueue: FinanceApprovalQueueItem[];
  controlCategories: FinanceControlCategories;
}

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

export const BIZ_FINANCE_V2_TABS: { id: BizFinanceV2TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'commitments', label: 'Commitments' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'controls', label: 'Controls' },
  { id: 'audit', label: 'Audit' },
];

// =============================================================================
// STATUS COLORS
// =============================================================================

export const BUDGET_STATUS_COLOR: Record<FinanceBudget['status'], string> = {
  on_track: '#22C55E',
  at_risk: '#F59E0B',
  over_budget: '#EF4444',
};

export const BUDGET_STATUS_LABEL: Record<FinanceBudget['status'], string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  over_budget: 'Over Budget',
};

export const COMMITMENT_STATUS_COLOR: Record<FinanceCommitment['status'], string> = {
  pending: '#F59E0B',
  active: '#3B82F6',
  fulfilled: '#22C55E',
  cancelled: '#9CA3AF',
};

export const COMMITMENT_STATUS_LABEL: Record<FinanceCommitment['status'], string> = {
  pending: 'Pending',
  active: 'Active',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export const SOURCE_TAB_COLOR: Record<string, string> = {
  legal: '#8B5CF6',
  operations: '#3B82F6',
  people: '#14B8A6',
  compliance: '#F59E0B',
};

export const CONTROL_STATUS_COLOR: Record<FinanceControl['status'], string> = {
  active: '#22C55E',
  disabled: '#9CA3AF',
};

export const AUDIT_TYPE_COLOR: Record<string, string> = {
  approval: '#3B82F6',
  authorization: '#8B5CF6',
  creation: '#14B8A6',
  amendment: '#F59E0B',
  release: '#22C55E',
  rejection: '#EF4444',
  control_change: '#6366F1',
  budget_alert: '#F97316',
  reconciliation: '#0EA5E9',
};

export const LEDGER_CATEGORY_COLOR: Record<string, string> = {
  payroll: '#8B5CF6',
  infrastructure: '#6AA9FF',
  marketing: '#EC4899',
  legal: '#F97316',
  operations: '#3B82F6',
  consulting: '#14B8A6',
  licensing: '#22C55E',
  subscription: '#0EA5E9',
  'r&d': '#6366F1',
  travel: '#F59E0B',
  office: '#9CA3AF',
  partnership: '#8B5CF6',
  acquisition: '#EF4444',
};

// =============================================================================
// TRUTH STRIP
// =============================================================================

const TRUTH_CHIPS: FinanceTruthChip[] = [
  {
    id: 'tc-cash',
    label: 'Cash Position',
    value: '$2.4M',
    icon: 'building.columns.fill',
    color: '#22C55E',
  },
  {
    id: 'tc-burn',
    label: 'Burn Rate',
    value: '$180K/mo',
    icon: 'flame.fill',
    color: '#EF4444',
  },
  {
    id: 'tc-runway',
    label: 'Runway',
    value: '13.3 months',
    icon: 'hourglass',
    color: '#3B82F6',
  },
  {
    id: 'tc-revenue',
    label: 'Revenue MTD',
    value: '$420K',
    icon: 'arrow.up.circle.fill',
    color: '#22C55E',
  },
  {
    id: 'tc-committed',
    label: 'Committed Not Released',
    value: '$340K',
    icon: 'lock.fill',
    color: '#F59E0B',
  },
  {
    id: 'tc-pending',
    label: 'Pending Approvals',
    value: '3',
    icon: 'clock.fill',
    color: '#8B5CF6',
  },
];

// =============================================================================
// ENTITY SUMMARIES
// =============================================================================

const ENTITY_SUMMARIES: EntitySummary[] = [
  {
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    revenue: 820000,
    expenses: 640000,
    net: 180000,
    status: 'on_track',
  },
  {
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    revenue: 1240000,
    expenses: 1080000,
    net: 160000,
    status: 'on_track',
  },
  {
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    revenue: 310000,
    expenses: 185000,
    net: 125000,
    status: 'on_track',
  },
  {
    entityId: SLIEMA_WANDERERS,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    revenue: 18000,
    expenses: 45000,
    net: -27000,
    status: 'over_budget',
  },
];

// =============================================================================
// LEDGER ENTRIES
// =============================================================================

const LEDGER_ENTRIES: FinanceLedgerEntry[] = [
  {
    id: 'led-001',
    date: 'Feb 17, 2026',
    description: 'Stripe subscription revenue — February Pro plan batch',
    amount: 82000,
    type: 'credit',
    state: 'settled',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'subscription',
    createdBy: 'System (Stripe Webhook)',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-001',
  },
  {
    id: 'led-002',
    date: 'Feb 16, 2026',
    description: 'Enterprise plan revenue — Acme Corp quarterly payment',
    amount: 58000,
    type: 'credit',
    state: 'settled',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'subscription',
    createdBy: 'System (Wire Notification)',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-002',
  },
  {
    id: 'led-003',
    date: 'Feb 15, 2026',
    description: 'Engineering team payroll — February 1-15 cycle',
    amount: 48000,
    type: 'debit',
    state: 'settled',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'payroll',
    createdBy: 'HR System (Gusto)',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Maria Chen',
    commitmentId: 'cmt-001',
    receiptId: 'rcpt-003',
  },
  {
    id: 'led-004',
    date: 'Feb 14, 2026',
    description: 'AWS Cloud Infrastructure — January invoice',
    amount: 12400,
    type: 'debit',
    state: 'settled',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'infrastructure',
    createdBy: 'System (AWS)',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-004',
  },
  {
    id: 'led-005',
    date: 'Feb 13, 2026',
    description: 'API licensing revenue — Partner tier monthly',
    amount: 12000,
    type: 'credit',
    state: 'settled',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    category: 'licensing',
    createdBy: 'System (Billing)',
    approvedBy: null,
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-005',
  },
  {
    id: 'led-006',
    date: 'Feb 12, 2026',
    description: 'Patent filing — ML recommendation engine (Wilson Sonsini)',
    amount: 9500,
    type: 'debit',
    state: 'authorized',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    category: 'legal',
    createdBy: 'Legal Team',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: null,
    commitmentId: 'cmt-003',
    receiptId: null,
  },
  {
    id: 'led-007',
    date: 'Feb 11, 2026',
    description: 'Google Ads Campaign — Q1 digital marketing sprint',
    amount: 15000,
    type: 'debit',
    state: 'settled',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'marketing',
    createdBy: 'Marketing — David Park',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-006',
  },
  {
    id: 'led-009',
    date: 'Feb 9, 2026',
    description: 'WeWork office lease — February monthly rent',
    amount: 6800,
    type: 'debit',
    state: 'settled',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    category: 'office',
    createdBy: 'System (Recurring)',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-007',
  },
  {
    id: 'led-010',
    date: 'Feb 8, 2026',
    description: 'GPU cluster upgrade — R&D lab equipment (NVIDIA)',
    amount: 24000,
    type: 'debit',
    state: 'rule_checked',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'r&d',
    createdBy: 'Engineering — Sarah Lin',
    approvedBy: null,
    releasedBy: null,
    commitmentId: null,
    receiptId: null,
  },
  {
    id: 'led-011',
    date: 'Feb 7, 2026',
    description: 'HoldCo management fee — January allocation',
    amount: 35000,
    type: 'debit',
    state: 'settled',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    category: 'operations',
    createdBy: 'Finance — Auto',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Maria Chen',
    commitmentId: null,
    receiptId: 'rcpt-008',
  },
  {
    id: 'led-012',
    date: 'Feb 6, 2026',
    description: 'Sliema Wanderers FC — Sponsorship quarterly payment',
    amount: 18000,
    type: 'debit',
    state: 'in_flight',
    entityId: SLIEMA_WANDERERS,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    category: 'partnership',
    createdBy: 'Partnerships — Mark Rivera',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Maria Chen',
    commitmentId: 'cmt-006',
    receiptId: 'rcpt-009',
  },
  {
    id: 'led-013',
    date: 'Feb 5, 2026',
    description: 'Datadog monitoring — Annual license renewal',
    amount: 14400,
    type: 'debit',
    state: 'settled',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'infrastructure',
    createdBy: 'System (Renewal)',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-010',
  },
  {
    id: 'led-014',
    date: 'Feb 4, 2026',
    description: 'Target Bank acquisition — Due diligence retainer',
    amount: 75000,
    type: 'debit',
    state: 'draft',
    entityId: TARGET_BANK,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    category: 'acquisition',
    createdBy: 'M&A — Sammy Kalejaiye',
    approvedBy: null,
    releasedBy: null,
    commitmentId: 'cmt-007',
    receiptId: null,
  },
  {
    id: 'led-015',
    date: 'Feb 3, 2026',
    description: 'White-label licensing revenue — Monthly recurring',
    amount: 8500,
    type: 'credit',
    state: 'settled',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    category: 'licensing',
    createdBy: 'System (Billing)',
    approvedBy: null,
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-011',
  },
  {
    id: 'led-016',
    date: 'Feb 2, 2026',
    description: 'Sales team — February payroll first half',
    amount: 32000,
    type: 'debit',
    state: 'settled',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'payroll',
    createdBy: 'HR System (Gusto)',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: 'Payment Rails — Maria Chen',
    commitmentId: 'cmt-002',
    receiptId: 'rcpt-012',
  },
  {
    id: 'led-017',
    date: 'Feb 1, 2026',
    description: 'Marketplace transaction fees — January collections',
    amount: 4200,
    type: 'credit',
    state: 'settled',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'subscription',
    createdBy: 'System (Stripe)',
    approvedBy: null,
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-013',
  },
  {
    id: 'led-018',
    date: 'Jan 31, 2026',
    description: 'SaaStr Annual Conference — Team travel expenses',
    amount: 7200,
    type: 'debit',
    state: 'hold',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    category: 'travel',
    createdBy: 'Operations — James Wilson',
    approvedBy: 'Sammy Kalejaiye',
    releasedBy: null,
    commitmentId: null,
    receiptId: null,
  },
  {
    id: 'led-019',
    date: 'Jan 30, 2026',
    description: 'Sponsor Bank — Monthly platform fees',
    amount: 3200,
    type: 'debit',
    state: 'settled',
    entityId: SPONSOR_BANK,
    entityName: SEEDED_ENTITY_NAMES[SPONSOR_BANK],
    category: 'infrastructure',
    createdBy: 'System (Auto-pay)',
    approvedBy: null,
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-014',
  },
  {
    id: 'led-020',
    date: 'Jan 29, 2026',
    description: 'Payment Processor — Monthly transaction processing fees',
    amount: 4800,
    type: 'debit',
    state: 'settled',
    entityId: PAYMENT_PROCESSOR,
    entityName: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
    category: 'infrastructure',
    createdBy: 'System (Auto-pay)',
    approvedBy: null,
    releasedBy: 'Payment Rails — Automated',
    commitmentId: null,
    receiptId: 'rcpt-015',
  },
];

// =============================================================================
// BUDGETS
// =============================================================================

const BUDGETS: FinanceBudget[] = [
  {
    id: 'bgt-001',
    name: 'Engineering & Product',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    department: 'Engineering',
    budgeted: 720000,
    actual: 512000,
    variance: -208000,
    variancePct: -28.9,
    status: 'on_track',
  },
  {
    id: 'bgt-002',
    name: 'Sales & Marketing',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    department: 'Marketing',
    budgeted: 360000,
    actual: 338000,
    variance: -22000,
    variancePct: -6.1,
    status: 'at_risk',
  },
  {
    id: 'bgt-003',
    name: 'Cloud Infrastructure',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    department: 'Engineering',
    budgeted: 150000,
    actual: 142000,
    variance: -8000,
    variancePct: -5.3,
    status: 'at_risk',
  },
  {
    id: 'bgt-004',
    name: 'General & Administrative',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    department: 'G&A',
    budgeted: 180000,
    actual: 128000,
    variance: -52000,
    variancePct: -28.9,
    status: 'on_track',
  },
  {
    id: 'bgt-005',
    name: 'Legal & Compliance',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    department: 'Legal',
    budgeted: 96000,
    actual: 84000,
    variance: -12000,
    variancePct: -12.5,
    status: 'on_track',
  },
  {
    id: 'bgt-006',
    name: 'IP & Product Licensing',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    department: 'Product',
    budgeted: 200000,
    actual: 185000,
    variance: -15000,
    variancePct: -7.5,
    status: 'on_track',
  },
  {
    id: 'bgt-007',
    name: 'Travel & Events',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    department: 'Operations',
    budgeted: 60000,
    actual: 72000,
    variance: 12000,
    variancePct: 20.0,
    status: 'over_budget',
  },
  {
    id: 'bgt-008',
    name: 'Partnerships & Sponsorships',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    department: 'Partnerships',
    budgeted: 100000,
    actual: 90000,
    variance: -10000,
    variancePct: -10.0,
    status: 'at_risk',
  },
];

// =============================================================================
// COMMITMENTS
// =============================================================================

const COMMITMENTS: FinanceCommitment[] = [
  {
    id: 'cmt-001',
    description: 'Engineering payroll — Monthly recurring obligation',
    amount: 96000,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    sourceTab: 'people',
    sourceId: 'emp-eng-team',
    dueDate: 'Mar 1, 2026',
    status: 'active',
  },
  {
    id: 'cmt-002',
    description: 'Sales team payroll — Monthly recurring obligation',
    amount: 64000,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    sourceTab: 'people',
    sourceId: 'emp-sales-team',
    dueDate: 'Mar 1, 2026',
    status: 'active',
  },
  {
    id: 'cmt-003',
    description: 'Patent filing retainer — Wilson Sonsini engagement',
    amount: 28000,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    sourceTab: 'legal',
    sourceId: 'legal-patent-001',
    dueDate: 'Mar 15, 2026',
    status: 'active',
  },
  {
    id: 'cmt-004',
    description: 'Office lease — WeWork annual commitment remaining',
    amount: 54400,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    sourceTab: 'operations',
    sourceId: 'ops-lease-001',
    dueDate: 'Dec 31, 2026',
    status: 'active',
  },
  {
    id: 'cmt-006',
    description: 'Sliema Wanderers FC — Annual sponsorship commitment',
    amount: 72000,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    sourceTab: 'operations',
    sourceId: 'ops-sponsor-001',
    dueDate: 'Dec 31, 2026',
    status: 'active',
  },
  {
    id: 'cmt-007',
    description: 'Target Bank due diligence — M&A advisory fees',
    amount: 150000,
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    sourceTab: 'legal',
    sourceId: 'legal-ma-001',
    dueDate: 'Jun 30, 2026',
    status: 'pending',
  },
];

// =============================================================================
// FORECAST — BASE SCENARIO
// =============================================================================

const FORECAST_BASE: FinanceForecastMonth[] = [
  { month: 'Mar 2026', revenue: 435000, expenses: 395000, net: 40000 },
  { month: 'Apr 2026', revenue: 448000, expenses: 402000, net: 46000 },
  { month: 'May 2026', revenue: 462000, expenses: 410000, net: 52000 },
  { month: 'Jun 2026', revenue: 475000, expenses: 418000, net: 57000 },
  { month: 'Jul 2026', revenue: 490000, expenses: 425000, net: 65000 },
  { month: 'Aug 2026', revenue: 505000, expenses: 432000, net: 73000 },
  { month: 'Sep 2026', revenue: 520000, expenses: 440000, net: 80000 },
  { month: 'Oct 2026', revenue: 538000, expenses: 448000, net: 90000 },
  { month: 'Nov 2026', revenue: 555000, expenses: 455000, net: 100000 },
  { month: 'Dec 2026', revenue: 572000, expenses: 462000, net: 110000 },
  { month: 'Jan 2027', revenue: 590000, expenses: 470000, net: 120000 },
  { month: 'Feb 2027', revenue: 610000, expenses: 478000, net: 132000 },
];

// =============================================================================
// FORECAST — BULL SCENARIO
// =============================================================================

const FORECAST_BULL: FinanceForecastMonth[] = [
  { month: 'Mar 2026', revenue: 465000, expenses: 390000, net: 75000 },
  { month: 'Apr 2026', revenue: 498000, expenses: 398000, net: 100000 },
  { month: 'May 2026', revenue: 535000, expenses: 405000, net: 130000 },
  { month: 'Jun 2026', revenue: 575000, expenses: 412000, net: 163000 },
  { month: 'Jul 2026', revenue: 618000, expenses: 420000, net: 198000 },
  { month: 'Aug 2026', revenue: 665000, expenses: 428000, net: 237000 },
  { month: 'Sep 2026', revenue: 715000, expenses: 435000, net: 280000 },
  { month: 'Oct 2026', revenue: 768000, expenses: 445000, net: 323000 },
  { month: 'Nov 2026', revenue: 825000, expenses: 455000, net: 370000 },
  { month: 'Dec 2026', revenue: 886000, expenses: 468000, net: 418000 },
  { month: 'Jan 2027', revenue: 952000, expenses: 480000, net: 472000 },
  { month: 'Feb 2027', revenue: 1024000, expenses: 495000, net: 529000 },
];

// =============================================================================
// FORECAST — BEAR SCENARIO
// =============================================================================

const FORECAST_BEAR: FinanceForecastMonth[] = [
  { month: 'Mar 2026', revenue: 410000, expenses: 400000, net: 10000 },
  { month: 'Apr 2026', revenue: 405000, expenses: 408000, net: -3000 },
  { month: 'May 2026', revenue: 398000, expenses: 415000, net: -17000 },
  { month: 'Jun 2026', revenue: 390000, expenses: 422000, net: -32000 },
  { month: 'Jul 2026', revenue: 385000, expenses: 428000, net: -43000 },
  { month: 'Aug 2026', revenue: 380000, expenses: 435000, net: -55000 },
  { month: 'Sep 2026', revenue: 378000, expenses: 438000, net: -60000 },
  { month: 'Oct 2026', revenue: 375000, expenses: 440000, net: -65000 },
  { month: 'Nov 2026', revenue: 372000, expenses: 442000, net: -70000 },
  { month: 'Dec 2026', revenue: 370000, expenses: 445000, net: -75000 },
  { month: 'Jan 2027', revenue: 368000, expenses: 448000, net: -80000 },
  { month: 'Feb 2027', revenue: 365000, expenses: 450000, net: -85000 },
];

// =============================================================================
// CONTROLS
// =============================================================================

const CONTROLS: FinanceControl[] = [
  {
    id: 'ctrl-001',
    name: 'Single Approval Threshold',
    description: 'Transactions under this amount require only one approval before authorization. Above this limit, dual control kicks in.',
    threshold: '$10,000',
    dualControl: false,
    rbacLevel: 'Finance Approver',
    status: 'active',
  },
  {
    id: 'ctrl-002',
    name: 'Dual Control Threshold',
    description: 'Transactions at or above this amount require two independent approvals. Finance authorizes, then a second officer confirms before Payment Rails can release.',
    threshold: '$25,000',
    dualControl: true,
    rbacLevel: 'Finance Director + CFO',
    status: 'active',
  },
  {
    id: 'ctrl-003',
    name: 'Vendor Payment Auto-Release',
    description: 'Recurring vendor payments below threshold auto-release through Payment Rails without manual authorization. Finance sets rules; rails execute.',
    threshold: '$5,000',
    dualControl: false,
    rbacLevel: 'System (Rule-Based)',
    status: 'active',
  },
  {
    id: 'ctrl-004',
    name: 'Budget Overage Block',
    description: 'Prevents authorization of any transaction that would push a department budget past 100% utilization. Requires CFO override.',
    threshold: '100% of Budget',
    dualControl: true,
    rbacLevel: 'CFO Override Only',
    status: 'active',
  },
  {
    id: 'ctrl-005',
    name: 'Cross-Entity Transfer Gate',
    description: 'Any inter-entity fund transfer requires explicit authorization from both the sending and receiving entity controllers.',
    threshold: 'Any Amount',
    dualControl: true,
    rbacLevel: 'Entity Controller (Both)',
    status: 'active',
  },
  {
    id: 'ctrl-006',
    name: 'Weekend/Holiday Hold',
    description: 'Transactions authorized on weekends or holidays are automatically held until the next business day for Payment Rails release.',
    threshold: 'All Transactions',
    dualControl: false,
    rbacLevel: 'System (Calendar-Based)',
    status: 'disabled',
  },
];

// =============================================================================
// AUDIT TRAIL
// =============================================================================

const AUDIT_TRAIL: FinanceAuditEntry[] = [
  {
    id: 'aud-001',
    action: 'Authorized Stripe revenue batch ($82,000) for OpsCo',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Feb 17, 2026 — 10:42 AM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'authorization',
    receiptId: 'rcpt-001',
  },
  {
    id: 'aud-002',
    action: 'Approved engineering payroll cycle ($48,000)',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Feb 15, 2026 — 9:15 AM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'approval',
    receiptId: 'rcpt-003',
  },
  {
    id: 'aud-003',
    action: 'Created patent filing ledger entry ($9,500)',
    actor: 'Legal Team',
    timestamp: 'Feb 12, 2026 — 2:30 PM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    type: 'creation',
  },
  {
    id: 'aud-004',
    action: 'Amended budget variance threshold for Sales & Marketing',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Feb 11, 2026 — 4:18 PM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'amendment',
  },
  {
    id: 'aud-005',
    action: 'Placed SaaStr travel expenses on hold ($7,200)',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Feb 10, 2026 — 11:05 AM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'authorization',
  },
  {
    id: 'aud-006',
    action: 'Budget alert triggered — Travel & Events at 120% utilization',
    actor: 'System',
    timestamp: 'Feb 9, 2026 — 8:00 AM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'budget_alert',
  },
  {
    id: 'aud-007',
    action: 'Authorized Sliema Wanderers quarterly payment ($18,000)',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Feb 6, 2026 — 3:22 PM',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    type: 'authorization',
    receiptId: 'rcpt-009',
  },
  {
    id: 'aud-008',
    action: 'Created Target Bank due diligence draft ($75,000)',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Feb 4, 2026 — 1:45 PM',
    entityName: SEEDED_ENTITY_NAMES[TARGET_BANK],
    type: 'creation',
  },
  {
    id: 'aud-009',
    action: 'Dual control verification — Datadog annual license ($14,400)',
    actor: 'Maria Chen',
    timestamp: 'Feb 5, 2026 — 10:12 AM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'approval',
    receiptId: 'rcpt-010',
  },
  {
    id: 'aud-010',
    action: 'Reconciliation completed for January revenue streams',
    actor: 'System (Auto)',
    timestamp: 'Feb 3, 2026 — 12:00 AM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'reconciliation',
  },
  {
    id: 'aud-011',
    action: 'Control change — Disabled Weekend/Holiday Hold rule',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Feb 2, 2026 — 5:30 PM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    type: 'control_change',
  },
  {
    id: 'aud-012',
    action: 'Rejected expense request — Unauthorized vendor payment',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Feb 1, 2026 — 2:15 PM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'rejection',
  },
  {
    id: 'aud-013',
    action: 'Approved Google Ads Q1 campaign budget ($15,000)',
    actor: 'Sammy Kalejaiye',
    timestamp: 'Jan 31, 2026 — 11:40 AM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'approval',
    receiptId: 'rcpt-006',
  },
  {
    id: 'aud-014',
    action: 'Budget alert — Cloud Infrastructure at 95% utilization',
    actor: 'System',
    timestamp: 'Jan 30, 2026 — 8:00 AM',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    type: 'budget_alert',
  },
];

// =============================================================================
// TOP DRIVERS
// =============================================================================

const TOP_DRIVERS: FinanceTopDriver[] = [
  {
    id: 'td-001',
    label: 'Stripe Subscription Revenue — Pro Plans',
    type: 'revenue',
    amount: 82000,
    impact: 'high',
  },
  {
    id: 'td-002',
    label: 'Enterprise Plan — Acme Corp Quarterly',
    type: 'revenue',
    amount: 58000,
    impact: 'high',
  },
  {
    id: 'td-003',
    label: 'Engineering Payroll — Biweekly Cycle',
    type: 'obligation',
    amount: 48000,
    impact: 'high',
    dueDate: 'Mar 1, 2026',
  },
  {
    id: 'td-004',
    label: 'Target Bank Due Diligence Retainer',
    type: 'obligation',
    amount: 75000,
    impact: 'high',
    dueDate: 'Jun 30, 2026',
  },
  {
    id: 'td-005',
    label: 'API Licensing Revenue — Partner Tier',
    type: 'revenue',
    amount: 12000,
    impact: 'medium',
  },
  {
    id: 'td-006',
    label: 'Sliema Wanderers FC — Quarterly Sponsorship',
    type: 'obligation',
    amount: 18000,
    impact: 'low',
    dueDate: 'Mar 31, 2026',
  },
];

// =============================================================================
// APPROVAL QUEUE
// =============================================================================

const APPROVAL_QUEUE: FinanceApprovalQueueItem[] = [
  {
    id: 'aq-001',
    label: 'GPU Cluster Upgrade — R&D Lab Equipment (NVIDIA)',
    amount: 24000,
    requester: 'Engineering — Sarah Lin',
    status: 'pending',
    urgency: 'high',
  },
  {
    id: 'aq-003',
    label: 'Target Bank Due Diligence Retainer',
    amount: 75000,
    requester: 'M&A — Sammy Kalejaiye',
    status: 'pending',
    urgency: 'high',
  },
  {
    id: 'aq-004',
    label: 'SaaStr Annual Conference Travel Expenses',
    amount: 7200,
    requester: 'Operations — James Wilson',
    status: 'denied',
    urgency: 'low',
  },
];

// =============================================================================
// CONTROL CATEGORIES (blocked items per category)
// =============================================================================

const CONTROL_CATEGORIES: FinanceControlCategories = {
  authority: 2,
  budget: 1,
  eligibility: 0,
  compliance: 1,
  technical: 0,
};

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getBizFinanceV2Data(): BizFinanceV2Data {
  return {
    truthChips: TRUTH_CHIPS,
    entitySummaries: ENTITY_SUMMARIES,
    ledger: LEDGER_ENTRIES,
    budgets: BUDGETS,
    commitments: COMMITMENTS,
    forecastBase: FORECAST_BASE,
    forecastBull: FORECAST_BULL,
    forecastBear: FORECAST_BEAR,
    controls: CONTROLS,
    auditTrail: AUDIT_TRAIL,
    topDrivers: TOP_DRIVERS,
    approvalQueue: APPROVAL_QUEUE,
    controlCategories: CONTROL_CATEGORIES,
  };
}
