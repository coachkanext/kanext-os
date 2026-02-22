/**
 * Business Organization Payment Rails — Mock Data & Types (V2 Rewrite)
 * 9-tab Payment Rails Hub with state-machine batches, wallets, approvals,
 * release queue, exceptions, disputes, immutable receipts, and admin config.
 *
 * State machine: Draft -> Proposed -> Rule-Checked -> Authorized -> Scheduled
 *   -> Released -> In Flight -> Settled  (+ Hold / Failed / Disputed / Returned / Reversed)
 */

import type { BizTxnState, BizReceipt, TrafficLight } from '@/data/biz-org-shared-types';
import {
  BIZ_TXN_STATE_LABELS,
  BIZ_TXN_STATE_COLORS,
  TRAFFIC_LIGHT_COLORS,
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  SPONSOR_BANK,
  PAYMENT_PROCESSOR,
  TARGET_BANK,
  SEEDED_ENTITY_NAMES,
  formatCurrency,
} from '@/data/biz-org-shared-types';

// Re-export for consumer convenience
export {
  BIZ_TXN_STATE_LABELS,
  BIZ_TXN_STATE_COLORS,
  TRAFFIC_LIGHT_COLORS,
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  SPONSOR_BANK,
  PAYMENT_PROCESSOR,
  TARGET_BANK,
  SEEDED_ENTITY_NAMES,
  formatCurrency,
};
export type { BizTxnState, BizReceipt, TrafficLight };

// =============================================================================
// SUB-TAB DEFINITION
// =============================================================================

export type RailsSubTabId =
  | 'now'
  | 'wallets'
  | 'batches'
  | 'approvals'
  | 'release'
  | 'exceptions'
  | 'disputes'
  | 'receipts'
  | 'admin';

export interface RailsSubTab {
  id: RailsSubTabId;
  label: string;
}

export const RAILS_SUB_TABS: RailsSubTab[] = [
  { id: 'now', label: 'NOW' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'batches', label: 'Batches' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'release', label: 'Release' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'admin', label: 'Admin' },
];

// =============================================================================
// FILTER CHIPS
// =============================================================================

export type RailsFilterChip = 'all' | 'pending' | 'in_flight' | 'settled' | 'exceptions';

export interface RailsFilterDef {
  id: RailsFilterChip;
  label: string;
}

export const RAILS_FILTER_CHIPS: RailsFilterDef[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_flight', label: 'In Flight' },
  { id: 'settled', label: 'Settled' },
  { id: 'exceptions', label: 'Exceptions' },
];

// =============================================================================
// TYPES — HEALTH DOTS
// =============================================================================

export interface RailsHealthDot {
  id: string;
  label: string;
  status: TrafficLight;
}

// =============================================================================
// TYPES — WALLETS
// =============================================================================

export type WalletType = 'checking' | 'savings' | 'operating' | 'reserve' | 'escrow';
export type WalletStatus = 'connected' | 'limited' | 'offline';

export interface RailsWallet {
  id: string;
  name: string;
  entityId: string;
  entityName: string;
  type: WalletType;
  provider: string;
  balance: number;
  lastReconciled: string;
  status: WalletStatus;
}

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  operating: 'Operating',
  reserve: 'Reserve',
  escrow: 'Escrow',
};

export const WALLET_TYPE_COLORS: Record<WalletType, string> = {
  checking: '#1D9BF0',
  savings: '#22C55E',
  operating: '#1D9BF0',
  reserve: '#F59E0B',
  escrow: '#1D9BF0',
};

export const WALLET_STATUS_COLORS: Record<WalletStatus, string> = {
  connected: '#22C55E',
  limited: '#F59E0B',
  offline: '#EF4444',
};

// =============================================================================
// TYPES — BATCHES
// =============================================================================

export interface RailsBatchItem {
  id: string;
  description: string;
  amount: number;
  recipient: string;
  state: BizTxnState;
}

export interface RailsBatch {
  id: string;
  name: string;
  state: BizTxnState;
  itemCount: number;
  totalAmount: number;
  createdBy: string;
  createdDate: string;
  entityName: string;
  items: RailsBatchItem[];
}

// =============================================================================
// TYPES — APPROVALS
// =============================================================================

export type ApprovalUrgency = 'critical' | 'high' | 'normal';

export interface RailsApproval {
  id: string;
  batchId: string;
  batchName: string;
  amount: number;
  requestedBy: string;
  requestDate: string;
  urgency: ApprovalUrgency;
  entityName: string;
}

export const URGENCY_COLORS: Record<ApprovalUrgency, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  normal: '#1D9BF0',
};

export const URGENCY_LABELS: Record<ApprovalUrgency, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
};

// =============================================================================
// TYPES — RELEASE QUEUE ITEM
// =============================================================================

export interface RailsReleaseItem {
  id: string;
  batchId: string;
  batchName: string;
  amount: number;
  authorizedBy: string;
  authorizedDate: string;
  entityName: string;
}

// =============================================================================
// TYPES — EXCEPTIONS
// =============================================================================

export type ExceptionType = 'failed' | 'disputed' | 'returned';

export interface RailsException {
  id: string;
  batchId: string;
  itemId: string;
  description: string;
  type: ExceptionType;
  amount: number;
  date: string;
  resolution: string | null;
  entityName: string;
  rootCauseCategory: string;
  failingRule: string;
  nextSteps: string[];
}

export const EXCEPTION_TYPE_COLORS: Record<ExceptionType, string> = {
  failed: '#EF4444',
  disputed: '#F59E0B',
  returned: '#F59E0B',
};

export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  failed: 'Failed',
  disputed: 'Disputed',
  returned: 'Returned',
};

// =============================================================================
// TYPES — DISPUTES
// =============================================================================

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface RailsDisputeTimelineEvent {
  date: string;
  action: string;
}

export type DisputeStage = 'new' | 'evidence_gathering' | 'submitted' | 'review' | 'resolved';

export interface RailsDispute {
  id: string;
  description: string;
  amount: number;
  status: DisputeStatus;
  filedDate: string;
  entityName: string;
  timeline: RailsDisputeTimelineEvent[];
  receiptChain: string[];
  disputeStage: DisputeStage;
}

export const DISPUTE_STATUS_COLORS: Record<DisputeStatus, string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
  closed: '#A1A1AA',
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  closed: 'Closed',
};

// =============================================================================
// TYPES — ADMIN CONFIG
// =============================================================================

export type AdminConfigCategory = 'provider' | 'webhook' | 'limit' | 'general';

export interface RailsAdminConfig {
  id: string;
  label: string;
  value: string;
  category: AdminConfigCategory;
  sandboxMode: boolean;
}

export const ADMIN_CATEGORY_COLORS: Record<AdminConfigCategory, string> = {
  provider: '#1D9BF0',
  webhook: '#1D9BF0',
  limit: '#F59E0B',
  general: '#A1A1AA',
};

export const ADMIN_CATEGORY_LABELS: Record<AdminConfigCategory, string> = {
  provider: 'Provider',
  webhook: 'Webhook',
  limit: 'Limit',
  general: 'General',
};

// =============================================================================
// TYPES — NOW DASHBOARD
// =============================================================================

export interface RailsNowSummary {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  delta?: string;
  impactTag?: string;
}

// =============================================================================
// SEEDED DATA — HEALTH DOTS
// =============================================================================

const HEALTH_DOTS: RailsHealthDot[] = [
  { id: 'hd-rails-status', label: 'Rails Status', status: 'green' },
  { id: 'hd-exceptions', label: 'Exceptions', status: 'yellow' },
  { id: 'hd-compliance-hold', label: 'Compliance Hold', status: 'green' },
];

// =============================================================================
// SEEDED DATA — WALLETS
// =============================================================================

const WALLETS: RailsWallet[] = [
  {
    id: 'wal-holdco-ops',
    name: 'Valuetainment HoldCo Operating',
    entityId: KANEXT_HOLDCO,
    entityName: 'Valuetainment HoldCo',
    type: 'operating',
    provider: 'Mercury',
    balance: 2_450_000,
    lastReconciled: '2026-02-15',
    status: 'connected',
  },
  {
    id: 'wal-opsco-ops',
    name: 'Valuetainment OpsCo Operating',
    entityId: KANEXT_OPSCO,
    entityName: 'Valuetainment OpsCo',
    type: 'operating',
    provider: 'Mercury',
    balance: 870_000,
    lastReconciled: '2026-02-15',
    status: 'connected',
  },
  {
    id: 'wal-holdco-reserve',
    name: 'HoldCo Reserve Fund',
    entityId: KANEXT_HOLDCO,
    entityName: 'Valuetainment HoldCo',
    type: 'reserve',
    provider: 'Mercury',
    balance: 1_200_000,
    lastReconciled: '2026-02-14',
    status: 'connected',
  },
  {
    id: 'wal-target-escrow',
    name: 'Target Bank Escrow',
    entityId: TARGET_BANK,
    entityName: 'Target Bank (Acquisition)',
    type: 'escrow',
    provider: 'Escrow.com',
    balance: 5_000_000,
    lastReconciled: '2026-02-10',
    status: 'limited',
  },
  {
    id: 'wal-sponsor-transit',
    name: 'Sponsor Bank Transit',
    entityId: SPONSOR_BANK,
    entityName: 'Sponsor Bank',
    type: 'checking',
    provider: 'Sponsor Bank Direct',
    balance: 340_000,
    lastReconciled: '2026-02-16',
    status: 'connected',
  },
  {
    id: 'wal-opsco-savings',
    name: 'OpsCo Savings',
    entityId: KANEXT_OPSCO,
    entityName: 'Valuetainment OpsCo',
    type: 'savings',
    provider: 'Mercury',
    balance: 620_000,
    lastReconciled: '2026-02-13',
    status: 'connected',
  },
];

// =============================================================================
// SEEDED DATA — BATCH ITEMS (reusable across batches)
// =============================================================================

const BATCH_ITEMS_PAYROLL: RailsBatchItem[] = [
  { id: 'bi-pay-001', description: 'Salary — Engineering Team (5)', amount: 62_500, recipient: 'Payroll Provider', state: 'settled' },
  { id: 'bi-pay-002', description: 'Salary — Product Team (3)', amount: 37_500, recipient: 'Payroll Provider', state: 'settled' },
  { id: 'bi-pay-003', description: 'Salary — Executive (2)', amount: 45_000, recipient: 'Payroll Provider', state: 'settled' },
  { id: 'bi-pay-004', description: 'Benefits & Insurance', amount: 18_000, recipient: 'Gusto', state: 'settled' },
];

const BATCH_ITEMS_VENDOR_Q1: RailsBatchItem[] = [
  { id: 'bi-vq1-001', description: 'AWS Infrastructure — Jan', amount: 12_400, recipient: 'Amazon Web Services', state: 'in_flight' },
  { id: 'bi-vq1-002', description: 'Legal Retainer — Feb', amount: 15_000, recipient: 'Morrison & Foerster', state: 'in_flight' },
  { id: 'bi-vq1-003', description: 'Design Tooling — Figma', amount: 2_400, recipient: 'Figma Inc.', state: 'in_flight' },
];

const BATCH_ITEMS_INVESTOR: RailsBatchItem[] = [
  { id: 'bi-inv-001', description: 'Q4 Dividend Distribution', amount: 125_000, recipient: 'Series A LPs', state: 'authorized' },
  { id: 'bi-inv-002', description: 'Board Advisory Fee', amount: 25_000, recipient: 'Board Advisors Fund', state: 'authorized' },
];

const BATCH_ITEMS_ESCROW: RailsBatchItem[] = [
  { id: 'bi-esc-001', description: 'Acquisition Deposit — Tranche 1', amount: 2_500_000, recipient: 'Target Bank (Acquisition)', state: 'scheduled' },
  { id: 'bi-esc-002', description: 'Due Diligence Costs', amount: 75_000, recipient: 'Deloitte', state: 'scheduled' },
];

const BATCH_ITEMS_MARKETING: RailsBatchItem[] = [
  { id: 'bi-mkt-001', description: 'Digital Ads — Q1 Campaign', amount: 35_000, recipient: 'Meta Ads', state: 'draft' },
  { id: 'bi-mkt-002', description: 'Content Production', amount: 12_000, recipient: 'Creative Agency', state: 'draft' },
  { id: 'bi-mkt-003', description: 'Influencer Partnership', amount: 8_000, recipient: 'Talent Network', state: 'draft' },
];

const BATCH_ITEMS_REIMBURSEMENT: RailsBatchItem[] = [
  { id: 'bi-rmb-001', description: 'Travel — CES Conference', amount: 4_200, recipient: 'Sam Carter', state: 'proposed' },
  { id: 'bi-rmb-002', description: 'Client Dinner — NYC', amount: 890, recipient: 'Sam Carter', state: 'proposed' },
  { id: 'bi-rmb-003', description: 'Equipment Purchase — MacBook Pro', amount: 3_500, recipient: 'Alex Torres', state: 'proposed' },
];

const BATCH_ITEMS_TAX: RailsBatchItem[] = [
  { id: 'bi-tax-001', description: 'Federal Estimated Tax — Q1', amount: 85_000, recipient: 'IRS', state: 'failed' },
  { id: 'bi-tax-002', description: 'State Estimated Tax — Q1 (DE)', amount: 22_000, recipient: 'State of Delaware', state: 'settled' },
];

const BATCH_ITEMS_SUBSCRIPTION: RailsBatchItem[] = [
  { id: 'bi-sub-001', description: 'Slack Business+ — Annual', amount: 14_400, recipient: 'Slack Technologies', state: 'in_flight' },
  { id: 'bi-sub-002', description: 'GitHub Enterprise — Annual', amount: 21_000, recipient: 'GitHub Inc.', state: 'in_flight' },
  { id: 'bi-sub-003', description: 'Linear — Annual', amount: 4_800, recipient: 'Linear Inc.', state: 'in_flight' },
];

// =============================================================================
// SEEDED DATA — BATCHES
// =============================================================================

const BATCHES: RailsBatch[] = [
  {
    id: 'batch-payroll-feb',
    name: 'February 2026 Payroll',
    state: 'settled',
    itemCount: 4,
    totalAmount: 163_000,
    createdBy: 'Sam Carter',
    createdDate: '2026-01-28',
    entityName: 'Valuetainment OpsCo',
    items: BATCH_ITEMS_PAYROLL,
  },
  {
    id: 'batch-vendor-q1',
    name: 'Q1 Vendor Payments',
    state: 'in_flight',
    itemCount: 3,
    totalAmount: 29_800,
    createdBy: 'Finance Team',
    createdDate: '2026-02-01',
    entityName: 'Valuetainment OpsCo',
    items: BATCH_ITEMS_VENDOR_Q1,
  },
  {
    id: 'batch-investor-q4',
    name: 'Q4 Investor Distributions',
    state: 'authorized',
    itemCount: 2,
    totalAmount: 150_000,
    createdBy: 'Sam Carter',
    createdDate: '2026-01-15',
    entityName: 'Valuetainment HoldCo',
    items: BATCH_ITEMS_INVESTOR,
  },
  {
    id: 'batch-escrow-acq',
    name: 'Acquisition Escrow Funding',
    state: 'scheduled',
    itemCount: 2,
    totalAmount: 2_575_000,
    createdBy: 'Sam Carter',
    createdDate: '2026-02-05',
    entityName: 'Valuetainment HoldCo',
    items: BATCH_ITEMS_ESCROW,
  },
  {
    id: 'batch-marketing-q1',
    name: 'Q1 Marketing Spend',
    state: 'draft',
    itemCount: 3,
    totalAmount: 55_000,
    createdBy: 'Marketing Lead',
    createdDate: '2026-02-12',
    entityName: 'Valuetainment OpsCo',
    items: BATCH_ITEMS_MARKETING,
  },
  {
    id: 'batch-reimbursements',
    name: 'Employee Reimbursements — Feb',
    state: 'proposed',
    itemCount: 3,
    totalAmount: 8_590,
    createdBy: 'Finance Team',
    createdDate: '2026-02-10',
    entityName: 'Valuetainment OpsCo',
    items: BATCH_ITEMS_REIMBURSEMENT,
  },
  {
    id: 'batch-tax-q1',
    name: 'Q1 Estimated Taxes',
    state: 'failed',
    itemCount: 2,
    totalAmount: 107_000,
    createdBy: 'Tax Advisor',
    createdDate: '2026-01-20',
    entityName: 'Valuetainment HoldCo',
    items: BATCH_ITEMS_TAX,
  },
  {
    id: 'batch-subscriptions',
    name: 'Annual SaaS Subscriptions',
    state: 'in_flight',
    itemCount: 3,
    totalAmount: 40_200,
    createdBy: 'IT Admin',
    createdDate: '2026-02-08',
    entityName: 'Valuetainment OpsCo',
    items: BATCH_ITEMS_SUBSCRIPTION,
  },
];

// =============================================================================
// SEEDED DATA — APPROVALS QUEUE
// =============================================================================

const APPROVALS: RailsApproval[] = [
  {
    id: 'appr-001',
    batchId: 'batch-marketing-q1',
    batchName: 'Q1 Marketing Spend',
    amount: 55_000,
    requestedBy: 'Marketing Lead',
    requestDate: '2026-02-12',
    urgency: 'normal',
    entityName: 'Valuetainment OpsCo',
  },
  {
    id: 'appr-002',
    batchId: 'batch-reimbursements',
    batchName: 'Employee Reimbursements — Feb',
    amount: 8_590,
    requestedBy: 'Finance Team',
    requestDate: '2026-02-10',
    urgency: 'high',
    entityName: 'Valuetainment OpsCo',
  },
  {
    id: 'appr-003',
    batchId: 'batch-tax-q1',
    batchName: 'Q1 Estimated Taxes (Retry)',
    amount: 85_000,
    requestedBy: 'Tax Advisor',
    requestDate: '2026-02-16',
    urgency: 'critical',
    entityName: 'Valuetainment HoldCo',
  },
  {
    id: 'appr-004',
    batchId: 'batch-investor-q4',
    batchName: 'Q4 Investor Distributions',
    amount: 150_000,
    requestedBy: 'Sam Carter',
    requestDate: '2026-01-15',
    urgency: 'high',
    entityName: 'Valuetainment HoldCo',
  },
];

// =============================================================================
// SEEDED DATA — RELEASE QUEUE
// =============================================================================

const RELEASE_QUEUE: RailsReleaseItem[] = [
  {
    id: 'rel-001',
    batchId: 'batch-investor-q4',
    batchName: 'Q4 Investor Distributions',
    amount: 150_000,
    authorizedBy: 'Sam Carter',
    authorizedDate: '2026-02-14',
    entityName: 'Valuetainment HoldCo',
  },
  {
    id: 'rel-002',
    batchId: 'batch-escrow-acq',
    batchName: 'Acquisition Escrow Funding',
    amount: 2_575_000,
    authorizedBy: 'Sam Carter',
    authorizedDate: '2026-02-13',
    entityName: 'Valuetainment HoldCo',
  },
  {
    id: 'rel-003',
    batchId: 'batch-subscriptions',
    batchName: 'Annual SaaS Subscriptions',
    amount: 40_200,
    authorizedBy: 'Finance Team',
    authorizedDate: '2026-02-15',
    entityName: 'Valuetainment OpsCo',
  },
];

// =============================================================================
// SEEDED DATA — EXCEPTIONS
// =============================================================================

const EXCEPTIONS: RailsException[] = [
  {
    id: 'exc-001',
    batchId: 'batch-tax-q1',
    itemId: 'bi-tax-001',
    description: 'Federal Estimated Tax — Q1 payment rejected by IRS gateway',
    type: 'failed',
    amount: 85_000,
    date: '2026-02-14',
    resolution: null,
    entityName: 'Valuetainment HoldCo',
    rootCauseCategory: 'Technical',
    failingRule: 'IRS EFTPS gateway rejected — invalid EIN format on submission',
    nextSteps: [
      'Verify EIN format against IRS EFTPS requirements',
      'Re-submit with corrected employer identification number',
      'Confirm acceptance via EFTPS acknowledgment receipt',
    ],
  },
  {
    id: 'exc-002',
    batchId: 'batch-vendor-q1',
    itemId: 'bi-vq1-001',
    description: 'AWS charge disputed — unexpected overage billing',
    type: 'disputed',
    amount: 12_400,
    date: '2026-02-11',
    resolution: null,
    entityName: 'Valuetainment OpsCo',
    rootCauseCategory: 'Budget',
    failingRule: 'Vendor invoice exceeds contracted tier ceiling by $4,200',
    nextSteps: [
      'Await AWS usage breakdown report',
      'Compare usage against contracted tier limits',
      'Negotiate credit or adjusted invoice',
    ],
  },
  {
    id: 'exc-003',
    batchId: 'batch-payroll-feb',
    itemId: 'bi-pay-002',
    description: 'Contractor payment returned — invalid routing number',
    type: 'returned',
    amount: 4_800,
    date: '2026-02-09',
    resolution: 'Re-submitted with corrected routing — awaiting confirmation',
    entityName: 'Valuetainment OpsCo',
    rootCauseCategory: 'Technical',
    failingRule: 'ACH return code R03 — no account / unable to locate account',
    nextSteps: [
      'Confirm corrected routing number with recipient',
      'Monitor re-submission settlement status',
    ],
  },
  {
    id: 'exc-004',
    batchId: 'batch-reimbursements',
    itemId: 'bi-rmb-003',
    description: 'Equipment reimbursement flagged — exceeds policy limit',
    type: 'failed',
    amount: 3_500,
    date: '2026-02-13',
    resolution: null,
    entityName: 'Valuetainment OpsCo',
    rootCauseCategory: 'Compliance',
    failingRule: 'Single equipment reimbursement exceeds $3,000 policy cap',
    nextSteps: [
      'Request CFO override for policy exception',
      'Obtain additional documentation for equipment justification',
      'Re-submit with override approval attached',
    ],
  },
];

// =============================================================================
// SEEDED DATA — DISPUTES
// =============================================================================

const DISPUTES: RailsDispute[] = [
  {
    id: 'disp-001',
    description: 'AWS January invoice overage — $4,200 above contracted tier',
    amount: 4_200,
    status: 'investigating',
    filedDate: '2026-02-11',
    entityName: 'Valuetainment OpsCo',
    timeline: [
      { date: '2026-02-11', action: 'Dispute filed with AWS support' },
      { date: '2026-02-12', action: 'AWS acknowledged — case ID #AWC-88291' },
      { date: '2026-02-14', action: 'Usage audit initiated by AWS billing team' },
      { date: '2026-02-16', action: 'Awaiting usage breakdown report from AWS' },
    ],
    receiptChain: ['rcp-001', 'rcp-004', 'rcp-007'],
    disputeStage: 'evidence_gathering',
  },
  {
    id: 'disp-002',
    description: 'Duplicate charge from Creative Agency — $12,000 billed twice',
    amount: 12_000,
    status: 'open',
    filedDate: '2026-02-15',
    entityName: 'Valuetainment OpsCo',
    timeline: [
      { date: '2026-02-15', action: 'Duplicate charge identified during reconciliation' },
      { date: '2026-02-16', action: 'Dispute notice sent to Creative Agency AP team' },
    ],
    receiptChain: ['rcp-003', 'rcp-008'],
    disputeStage: 'new',
  },
];

// =============================================================================
// SEEDED DATA — IMMUTABLE RECEIPTS
// =============================================================================

const RECEIPTS: BizReceipt[] = [
  {
    id: 'rcp-001',
    type: 'creation',
    action: 'Batch created: February 2026 Payroll',
    actor: 'Sam Carter',
    timestamp: '2026-01-28T09:00:00Z',
    linkedEntity: KANEXT_OPSCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-payroll-feb',
    immutable: true,
  },
  {
    id: 'rcp-002',
    type: 'approval',
    action: 'Batch approved: February 2026 Payroll',
    actor: 'Sam Carter',
    timestamp: '2026-01-29T14:30:00Z',
    linkedEntity: KANEXT_OPSCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-payroll-feb',
    immutable: true,
  },
  {
    id: 'rcp-003',
    type: 'release',
    action: 'Batch released: February 2026 Payroll',
    actor: 'Sam Carter',
    timestamp: '2026-01-30T08:00:00Z',
    linkedEntity: KANEXT_OPSCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-payroll-feb',
    immutable: true,
  },
  {
    id: 'rcp-004',
    type: 'transfer',
    action: 'Settlement complete: February 2026 Payroll — $163,000',
    actor: 'System',
    timestamp: '2026-02-01T10:15:00Z',
    linkedEntity: KANEXT_OPSCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-payroll-feb',
    immutable: true,
  },
  {
    id: 'rcp-005',
    type: 'creation',
    action: 'Batch created: Q1 Vendor Payments',
    actor: 'Finance Team',
    timestamp: '2026-02-01T11:00:00Z',
    linkedEntity: KANEXT_OPSCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-vendor-q1',
    immutable: true,
  },
  {
    id: 'rcp-006',
    type: 'approval',
    action: 'Batch approved: Q1 Vendor Payments',
    actor: 'Sam Carter',
    timestamp: '2026-02-03T09:45:00Z',
    linkedEntity: KANEXT_OPSCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-vendor-q1',
    immutable: true,
  },
  {
    id: 'rcp-007',
    type: 'release',
    action: 'Batch released: Q1 Vendor Payments',
    actor: 'Sam Carter',
    timestamp: '2026-02-04T08:00:00Z',
    linkedEntity: KANEXT_OPSCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-vendor-q1',
    immutable: true,
  },
  {
    id: 'rcp-008',
    type: 'creation',
    action: 'Batch created: Q4 Investor Distributions',
    actor: 'Sam Carter',
    timestamp: '2026-01-15T10:00:00Z',
    linkedEntity: KANEXT_HOLDCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-investor-q4',
    immutable: true,
  },
  {
    id: 'rcp-009',
    type: 'approval',
    action: 'Batch authorized: Q4 Investor Distributions',
    actor: 'Sam Carter',
    timestamp: '2026-02-14T16:00:00Z',
    linkedEntity: KANEXT_HOLDCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-investor-q4',
    immutable: true,
  },
  {
    id: 'rcp-010',
    type: 'compliance',
    action: 'Compliance check passed: Q1 Estimated Taxes',
    actor: 'Compliance Engine',
    timestamp: '2026-01-22T12:00:00Z',
    linkedEntity: KANEXT_HOLDCO,
    linkedTab: 'payment-rails',
    linkedId: 'batch-tax-q1',
    immutable: true,
  },
  {
    id: 'rcp-011',
    type: 'decision',
    action: 'Exception raised: Federal Tax payment rejected',
    actor: 'System',
    timestamp: '2026-02-14T15:30:00Z',
    linkedEntity: KANEXT_HOLDCO,
    linkedTab: 'payment-rails',
    linkedId: 'exc-001',
    immutable: true,
  },
  {
    id: 'rcp-012',
    type: 'amendment',
    action: 'Dispute filed: AWS January overage — $4,200',
    actor: 'Finance Team',
    timestamp: '2026-02-11T14:00:00Z',
    linkedEntity: KANEXT_OPSCO,
    linkedTab: 'payment-rails',
    linkedId: 'disp-001',
    immutable: true,
  },
];

// =============================================================================
// SEEDED DATA — ADMIN CONFIG
// =============================================================================

const ADMIN_CONFIG: RailsAdminConfig[] = [
  { id: 'cfg-001', label: 'Primary Bank Provider', value: 'Mercury Financial', category: 'provider', sandboxMode: false },
  { id: 'cfg-002', label: 'Payment Processor', value: 'Stripe Treasury', category: 'provider', sandboxMode: false },
  { id: 'cfg-003', label: 'ACH Provider', value: 'Modern Treasury', category: 'provider', sandboxMode: true },
  { id: 'cfg-004', label: 'Batch Settlement Webhook', value: 'https://api.kanext.io/webhooks/settlement', category: 'webhook', sandboxMode: false },
  { id: 'cfg-005', label: 'Exception Alert Webhook', value: 'https://api.kanext.io/webhooks/exceptions', category: 'webhook', sandboxMode: false },
  { id: 'cfg-006', label: 'Slack Notification Channel', value: '#finance-alerts', category: 'webhook', sandboxMode: false },
  { id: 'cfg-007', label: 'Single Batch Limit', value: '$5,000,000', category: 'limit', sandboxMode: false },
  { id: 'cfg-008', label: 'Daily Outflow Limit', value: '$10,000,000', category: 'limit', sandboxMode: false },
  { id: 'cfg-009', label: 'Auto-Approve Threshold', value: '$5,000', category: 'limit', sandboxMode: true },
  { id: 'cfg-010', label: 'Default Currency', value: 'USD', category: 'general', sandboxMode: false },
  { id: 'cfg-011', label: 'Reconciliation Frequency', value: 'Daily', category: 'general', sandboxMode: false },
  { id: 'cfg-012', label: 'Receipt Retention Period', value: '7 years', category: 'general', sandboxMode: false },
];

// =============================================================================
// SEEDED DATA — NOW DASHBOARD SUMMARIES
// =============================================================================

const NOW_SUMMARIES: RailsNowSummary[] = [
  {
    id: 'now-inflight',
    label: 'In-Flight Total',
    value: '$70,000',
    icon: 'paperplane.fill',
    color: '#1D9BF0',
    delta: '2 batches',
    impactTag: 'Blocks Vendor',
  },
  {
    id: 'now-pending',
    label: 'Pending Approval',
    value: '$298,590',
    icon: 'clock.fill',
    color: '#F59E0B',
    delta: '4 items',
    impactTag: 'Blocks Payroll',
  },
  {
    id: 'now-settled-today',
    label: 'Settled (This Week)',
    value: '$163,000',
    icon: 'checkmark.circle.fill',
    color: '#22C55E',
    delta: '1 batch',
  },
  {
    id: 'now-exceptions',
    label: 'Open Exceptions',
    value: '3',
    icon: 'exclamationmark.triangle.fill',
    color: '#EF4444',
    delta: '$101,700 at risk',
    impactTag: 'Blocks Close',
  },
  {
    id: 'now-wallet-total',
    label: 'Total Wallet Balance',
    value: '$10.48M',
    icon: 'banknote.fill',
    color: '#1D9BF0',
    delta: '6 wallets',
  },
  {
    id: 'now-release-queue',
    label: 'Awaiting Release',
    value: '$2.77M',
    icon: 'arrow.up.circle.fill',
    color: '#1D9BF0',
    delta: '3 batches',
    impactTag: 'Blocks Vendor',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export interface BizPaymentRailsData {
  healthDots: RailsHealthDot[];
  wallets: RailsWallet[];
  batches: RailsBatch[];
  approvals: RailsApproval[];
  releaseQueue: RailsReleaseItem[];
  exceptions: RailsException[];
  disputes: RailsDispute[];
  receipts: BizReceipt[];
  adminConfig: RailsAdminConfig[];
  nowSummaries: RailsNowSummary[];
}

export function getBizPaymentRailsData(): BizPaymentRailsData {
  return {
    healthDots: HEALTH_DOTS,
    wallets: WALLETS,
    batches: BATCHES,
    approvals: APPROVALS.sort((a, b) => {
      const urgencyOrder: Record<ApprovalUrgency, number> = { critical: 0, high: 1, normal: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }),
    releaseQueue: RELEASE_QUEUE,
    exceptions: EXCEPTIONS,
    disputes: DISPUTES,
    receipts: RECEIPTS.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    adminConfig: ADMIN_CONFIG,
    nowSummaries: NOW_SUMMARIES,
  };
}

// =============================================================================
// RECEIPT TYPE LABELS & COLORS
// =============================================================================

export const RECEIPT_TYPE_LABELS: Record<BizReceipt['type'], string> = {
  approval: 'Approval',
  release: 'Release',
  decision: 'Decision',
  signature: 'Signature',
  transfer: 'Transfer',
  creation: 'Creation',
  amendment: 'Amendment',
  compliance: 'Compliance',
};

export const RECEIPT_TYPE_COLORS: Record<BizReceipt['type'], string> = {
  approval: '#22C55E',
  release: '#1D9BF0',
  decision: '#F59E0B',
  signature: '#1D9BF0',
  transfer: '#1D9BF0',
  creation: '#1D9BF0',
  amendment: '#F59E0B',
  compliance: '#1D9BF0',
};
