/**
 * Payment Rails v2 — Comprehensive Mock Data
 * Full dataset for all 5 modes across 14 payment-rails tabs.
 */
import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type PayRailsTabId =
  | 'overview'
  | 'accounts'
  | 'collect'
  | 'payouts'
  | 'transfers'
  | 'settlement'
  | 'refunds'
  | 'reconciliation'
  | 'disputes'
  | 'tax-forms'
  | 'exports'
  | 'controls'
  | 'audit'
  | 'settings';

export interface PayRailsTab {
  id: PayRailsTabId;
  label: string;
}

export interface PayRailsScopeChip {
  key: string;
  label: string;
}

export type PayRailsStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'disputed'
  | 'reconciled';

export type PayRailsSortOption = 'recent' | 'largest' | 'due-soon';

export interface PayRailsAccount {
  id: string;
  name: string;
  type: 'primary' | 'subaccount';
  scope: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'pending-verification';
  lastActivity: string;
}

export interface PayRailsCharge {
  id: string;
  description: string;
  amount: number;
  fee: number;
  net: number;
  payer: string;
  payerInitials: string;
  product: string;
  status: PayRailsStatus;
  date: string;
  scope: string;
  receiptRef?: string;
}

export interface PayRailsPayout {
  id: string;
  recipient: string;
  recipientInitials: string;
  description: string;
  amount: number;
  purpose: string;
  category: string;
  status: PayRailsStatus;
  dueDate: string;
  paidDate?: string;
  scope: string;
  evidence?: string;
}

export interface PayRailsTransfer {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
  status: PayRailsStatus;
  date: string;
  initiator: string;
}

export interface PayRailsSettlement {
  id: string;
  title: string;
  type: string;
  grossAmount: number;
  fees: number;
  netAmount: number;
  itemCount: number;
  status: 'open' | 'processing' | 'settled' | 'exception';
  period: string;
  settledDate?: string;
}

export interface PayRailsRefund {
  id: string;
  originalChargeId: string;
  originalDescription: string;
  amount: number;
  reason: string;
  type: 'full' | 'partial';
  status: PayRailsStatus;
  requestedDate: string;
  processedDate?: string;
  requestedBy: string;
}

export interface PayRailsDispute {
  id: string;
  chargeId: string;
  chargeDescription: string;
  amount: number;
  type: 'chargeback' | 'inquiry' | 'failed-payout';
  status: 'open' | 'under-review' | 'won' | 'lost';
  filedDate: string;
  respondBy?: string;
  disputant: string;
}

export interface PayRailsTaxForm {
  id: string;
  recipientName: string;
  recipientInitials: string;
  formType: string;
  year: string;
  totalAmount: number;
  status: 'draft' | 'ready' | 'filed' | 'corrected';
  dueDate: string;
}

export interface PayRailsExport {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  size: string;
}

export interface PayRailsControl {
  id: string;
  title: string;
  description: string;
  threshold?: number;
  enabled: boolean;
  scope: string;
}

export interface PayRailsAuditEntry {
  id: string;
  action: string;
  actor: string;
  actorInitials: string;
  target: string;
  timestamp: string;
  detail?: string;
}

export interface PayRailsReconciliation {
  id: string;
  period: string;
  expectedAmount: number;
  actualAmount: number;
  variance: number;
  status: 'matched' | 'variance' | 'pending';
  itemsMatched: number;
  itemsUnmatched: number;
  reconciledDate?: string;
}

export interface PayRailsOverviewBlock {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

export interface PayRailsSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface PayRailsModeData {
  overview: PayRailsOverviewBlock[];
  accounts: PayRailsAccount[];
  charges: PayRailsCharge[];
  payouts: PayRailsPayout[];
  transfers: PayRailsTransfer[];
  settlements: PayRailsSettlement[];
  refunds: PayRailsRefund[];
  reconciliations: PayRailsReconciliation[];
  disputes: PayRailsDispute[];
  taxForms: PayRailsTaxForm[];
  exports: PayRailsExport[];
  controls: PayRailsControl[];
  audit: PayRailsAuditEntry[];
  settings: PayRailsSettingToggle[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const PAYRAILS_TABS: PayRailsTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'collect', label: 'Collect' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'settlement', label: 'Settlement' },
  { id: 'refunds', label: 'Refunds' },
  { id: 'reconciliation', label: 'Reconciliation' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'tax-forms', label: 'Tax / Forms' },
  { id: 'exports', label: 'Exports' },
  { id: 'controls', label: 'Controls' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

export const PAYRAILS_SCOPE_CHIPS: Record<Mode, PayRailsScopeChip[]> = {
  sports: [
    { key: 'organization', label: 'Organization' },
    { key: 'program', label: 'Program' },
    { key: 'season', label: 'Season' },
  ],
  education: [
    { key: 'organization', label: 'Organization' },
    { key: 'institution', label: 'Institution' },
    { key: 'department', label: 'Department' },
  ],
  church: [
    { key: 'organization', label: 'Organization' },
    { key: 'campus', label: 'Campus' },
    { key: 'ministry', label: 'Ministry' },
  ],
  competition: [
    { key: 'organization', label: 'Organization' },
    { key: 'series', label: 'Series' },
    { key: 'event-weekend', label: 'Event Weekend' },
  ],
  business: [
    { key: 'organization', label: 'Organization' },
    { key: 'entity', label: 'Entity' },
    { key: 'department', label: 'Department' },
  ],
};

export const PAYRAILS_STATUS_COLOR: Record<PayRailsStatus, string> = {
  pending: '#F59E0B',
  succeeded: '#22C55E',
  failed: '#EF4444',
  disputed: '#F59E0B',
  reconciled: '#1D9BF0',
};

export const SETTLEMENT_STATUS_COLOR: Record<PayRailsSettlement['status'], string> = {
  open: '#F59E0B',
  processing: '#1D9BF0',
  settled: '#22C55E',
  exception: '#EF4444',
};

export const DISPUTE_STATUS_COLOR: Record<PayRailsDispute['status'], string> = {
  open: '#F59E0B',
  'under-review': '#1D9BF0',
  won: '#22C55E',
  lost: '#EF4444',
};

export const RECON_STATUS_COLOR: Record<PayRailsReconciliation['status'], string> = {
  matched: '#22C55E',
  variance: '#F59E0B',
  pending: '#A1A1AA',
};

// =============================================================================
// HELPERS
// =============================================================================

export function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =============================================================================
// SPORTS MODE
// =============================================================================

const SPORTS_OVERVIEW: PayRailsOverviewBlock[] = [
  { id: 'sp-ov-1', label: 'Total Collected', value: '$34,217.50', trend: '+12.4%', trendUp: true },
  { id: 'sp-ov-2', label: 'Total Paid Out', value: '$5,935.00' },
  { id: 'sp-ov-3', label: 'Pending Payouts', value: '$2,585.00' },
  { id: 'sp-ov-4', label: 'Settlement Balance', value: '$11,482.50' },
  { id: 'sp-ov-5', label: 'Active Disputes', value: '2' },
  { id: 'sp-ov-6', label: 'Month-over-Month', value: '+8.7%', trend: '+8.7%', trendUp: true },
];

const SPORTS_ACCOUNTS: PayRailsAccount[] = [
  { id: 'sp-acct-1', name: 'KaNeXT Athletics Operating', type: 'primary', scope: 'Organization', balance: 48215.63, currency: 'USD', status: 'active', lastActivity: 'Feb 14, 2026' },
  { id: 'sp-acct-2', name: 'MBB Program', type: 'subaccount', scope: 'Program', balance: 12340.88, currency: 'USD', status: 'active', lastActivity: 'Feb 13, 2026' },
  { id: 'sp-acct-3', name: 'Recruiting', type: 'subaccount', scope: 'Program', balance: 3078.42, currency: 'USD', status: 'active', lastActivity: 'Feb 10, 2026' },
];

const SPORTS_CHARGES: PayRailsCharge[] = [
  { id: 'sp-chg-1', description: 'MLK Camp registration — Session A', amount: 275.00, fee: 8.25, net: 266.75, payer: 'Alex Morgan', payerInitials: 'MT', product: 'Camp Registration', status: 'succeeded', date: 'Feb 14, 2026', scope: 'Program', receiptRef: 'RCP-20260214-001' },
  { id: 'sp-chg-2', description: 'MLK Camp registration — Session B', amount: 275.00, fee: 8.25, net: 266.75, payer: 'Jayla Robinson', payerInitials: 'JR', product: 'Camp Registration', status: 'succeeded', date: 'Feb 14, 2026', scope: 'Program', receiptRef: 'RCP-20260214-002' },
  { id: 'sp-chg-3', description: 'Homecoming tickets (4x GA)', amount: 100.00, fee: 3.00, net: 97.00, payer: 'Derrick Williams', payerInitials: 'DW', product: 'Ticketing', status: 'succeeded', date: 'Feb 12, 2026', scope: 'Season' },
  { id: 'sp-chg-4', description: 'Booster Club donation', amount: 500.00, fee: 15.00, net: 485.00, payer: 'Williams Family Foundation', payerInitials: 'WF', product: 'Donation', status: 'succeeded', date: 'Feb 10, 2026', scope: 'Organization', receiptRef: 'RCP-20260210-001' },
  { id: 'sp-chg-5', description: 'Team store — shooting shirt (XL)', amount: 42.50, fee: 1.28, net: 41.22, payer: 'Andre Carter', payerInitials: 'AC', product: 'Merchandise', status: 'succeeded', date: 'Feb 9, 2026', scope: 'Program' },
  { id: 'sp-chg-6', description: 'Spring team fee — returning player', amount: 200.00, fee: 6.00, net: 194.00, payer: 'Cameron Brooks', payerInitials: 'CB', product: 'Team Fee', status: 'pending', date: 'Feb 8, 2026', scope: 'Program' },
];

const SPORTS_PAYOUTS: PayRailsPayout[] = [
  { id: 'sp-po-1', recipient: 'Charter Express', recipientInitials: 'CE', description: 'Bus charter — Magnolia University trip', amount: 2400.00, purpose: 'Travel vendor payment', category: 'Travel', status: 'succeeded', dueDate: 'Feb 15, 2026', paidDate: 'Feb 14, 2026', scope: 'Program', evidence: 'INV-CE-2026-0214' },
  { id: 'sp-po-2', recipient: 'NAIA Officials Pool', recipientInitials: 'NO', description: 'Officials fees — 3-game home stand', amount: 1800.00, purpose: 'Officials batch payout', category: 'Officials', status: 'succeeded', dueDate: 'Feb 12, 2026', paidDate: 'Feb 12, 2026', scope: 'Season', evidence: 'OFF-BATCH-0212' },
  { id: 'sp-po-3', recipient: 'BSN Sports', recipientInitials: 'BS', description: 'Practice gear restock — mid-season order', amount: 952.75, purpose: 'Equipment vendor', category: 'Equipment', status: 'pending', dueDate: 'Feb 18, 2026', scope: 'Program', evidence: 'PO-BSN-2026-042' },
  { id: 'sp-po-4', recipient: 'DJ Miles', recipientInitials: 'DM', description: 'GA stipend — February', amount: 600.00, purpose: 'Staff stipend', category: 'Staff', status: 'pending', dueDate: 'Feb 28, 2026', scope: 'Program' },
  { id: 'sp-po-5', recipient: 'Coach Trent Davis', recipientInitials: 'TD', description: 'Recruiting trip meal reimbursement', amount: 185.25, purpose: 'Reimbursement', category: 'Recruiting', status: 'succeeded', dueDate: 'Feb 10, 2026', paidDate: 'Feb 10, 2026', scope: 'Program', evidence: 'RCPT-TD-0207' },
];

const SPORTS_TRANSFERS: PayRailsTransfer[] = [
  { id: 'sp-xfr-1', fromAccount: 'MBB Program', toAccount: 'Recruiting', amount: 1500.00, description: 'Program → Recruiting allocation (Feb)', status: 'succeeded', date: 'Feb 3, 2026', initiator: 'Alex Morgan' },
  { id: 'sp-xfr-2', fromAccount: 'KaNeXT Athletics Operating', toAccount: 'MBB Program', amount: 8000.00, description: 'Operating → Program season funding (Spring)', status: 'succeeded', date: 'Jan 28, 2026', initiator: 'Alex Morgan' },
  { id: 'sp-xfr-3', fromAccount: 'MBB Program', toAccount: 'KaNeXT Athletics Operating', amount: 2150.00, description: 'Camp revenue → Operating sweep', status: 'succeeded', date: 'Jan 22, 2026', initiator: 'Alex Morgan' },
];

const SPORTS_SETTLEMENTS: PayRailsSettlement[] = [
  { id: 'sp-stl-1', title: 'Spring Trip Settlement', type: 'Trip', grossAmount: 4850.00, fees: 145.50, netAmount: 4704.50, itemCount: 8, status: 'processing', period: 'Feb 10–14, 2026' },
  { id: 'sp-stl-2', title: 'MLK Camp Settlement', type: 'Camp', grossAmount: 6875.00, fees: 206.25, netAmount: 6668.75, itemCount: 25, status: 'settled', period: 'Jan 18–20, 2026', settledDate: 'Jan 24, 2026' },
  { id: 'sp-stl-3', title: 'Feb Homestand Settlement', type: 'Game Day', grossAmount: 3420.00, fees: 102.60, netAmount: 3317.40, itemCount: 14, status: 'open', period: 'Feb 7–15, 2026' },
];

const SPORTS_REFUNDS: PayRailsRefund[] = [
  { id: 'sp-rfd-1', originalChargeId: 'sp-chg-1', originalDescription: 'MLK Camp registration — Session A', amount: 137.50, reason: 'Participant injury — partial refund (half session)', type: 'partial', status: 'succeeded', requestedDate: 'Jan 25, 2026', processedDate: 'Jan 27, 2026', requestedBy: 'Alex Morgan' },
  { id: 'sp-rfd-2', originalChargeId: 'sp-chg-5', originalDescription: 'Team store — shooting shirt (XL)', amount: 42.50, reason: 'Wrong size — full return', type: 'full', status: 'pending', requestedDate: 'Feb 11, 2026', requestedBy: 'Andre Carter' },
];

const SPORTS_RECONCILIATIONS: PayRailsReconciliation[] = [
  { id: 'sp-rec-1', period: 'January 2026', expectedAmount: 18425.00, actualAmount: 18425.00, variance: 0, status: 'matched', itemsMatched: 42, itemsUnmatched: 0, reconciledDate: 'Feb 3, 2026' },
  { id: 'sp-rec-2', period: 'February 2026', expectedAmount: 14680.00, actualAmount: 14680.00, variance: 0, status: 'pending', itemsMatched: 0, itemsUnmatched: 0 },
];

const SPORTS_DISPUTES: PayRailsDispute[] = [
  { id: 'sp-dsp-1', chargeId: 'sp-chg-1', chargeDescription: 'MLK Camp registration — Session A', amount: 275.00, type: 'chargeback', status: 'open', filedDate: 'Feb 6, 2026', respondBy: 'Feb 20, 2026', disputant: 'Alex Morgan' },
  { id: 'sp-dsp-2', chargeId: 'sp-po-3', chargeDescription: 'Practice gear restock — mid-season order', amount: 952.75, type: 'failed-payout', status: 'under-review', filedDate: 'Feb 12, 2026', disputant: 'BSN Sports' },
];

const SPORTS_TAX_FORMS: PayRailsTaxForm[] = [
  { id: 'sp-tf-1', recipientName: 'NAIA Officials Pool', recipientInitials: 'NO', formType: '1099-NEC', year: '2025', totalAmount: 14400.00, status: 'filed', dueDate: 'Jan 31, 2026' },
  { id: 'sp-tf-2', recipientName: 'BSN Sports', recipientInitials: 'BS', formType: '1099-NEC', year: '2025', totalAmount: 8620.00, status: 'ready', dueDate: 'Jan 31, 2026' },
  { id: 'sp-tf-3', recipientName: 'DJ Miles', recipientInitials: 'DM', formType: 'W-9', year: '2026', totalAmount: 0, status: 'draft', dueDate: 'Feb 28, 2026' },
];

const SPORTS_EXPORTS: PayRailsExport[] = [
  { id: 'sp-exp-1', title: 'Spring Trip Packet', type: 'Trip Settlement', period: 'Feb 10–14, 2026', generatedAt: 'Feb 15, 2026', format: 'PDF', size: '1.4 MB' },
  { id: 'sp-exp-2', title: 'MLK Camp Packet', type: 'Camp Settlement', period: 'Jan 18–20, 2026', generatedAt: 'Jan 25, 2026', format: 'PDF', size: '2.1 MB' },
  { id: 'sp-exp-3', title: 'January Monthly Snapshot', type: 'Monthly Snapshot', period: 'January 2026', generatedAt: 'Feb 3, 2026', format: 'XLSX', size: '680 KB' },
];

const SPORTS_CONTROLS: PayRailsControl[] = [
  { id: 'sp-ctl-1', title: 'Payout Approval Threshold', description: 'Require manual approval for any payout exceeding this amount', threshold: 500, enabled: true, scope: 'Program' },
  { id: 'sp-ctl-2', title: 'Refund Auto-Approve Limit', description: 'Automatically approve refund requests at or below this amount', threshold: 100, enabled: true, scope: 'Program' },
  { id: 'sp-ctl-3', title: 'Dual Approval for Settlements', description: 'Require two authorized signers to close any settlement batch', enabled: true, scope: 'Organization' },
  { id: 'sp-ctl-4', title: 'Require Evidence for All Payouts', description: 'Block payout initiation until receipt or invoice evidence is attached', enabled: true, scope: 'Program' },
];

const SPORTS_AUDIT: PayRailsAuditEntry[] = [
  { id: 'sp-aud-1', action: 'charge_received', actor: 'System', actorInitials: 'SY', target: 'MLK Camp registration — Session A ($275.00)', timestamp: 'Feb 14, 2026 09:12 AM' },
  { id: 'sp-aud-2', action: 'payout_initiated', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Charter Express — bus charter ($2,400.00)', timestamp: 'Feb 14, 2026 08:45 AM' },
  { id: 'sp-aud-3', action: 'settlement_closed', actor: 'System', actorInitials: 'SY', target: 'MLK Camp Settlement — 25 items ($6,668.75 net)', timestamp: 'Jan 24, 2026 04:00 PM' },
  { id: 'sp-aud-4', action: 'refund_processed', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Alex Morgan — partial camp refund ($137.50)', timestamp: 'Jan 27, 2026 11:30 AM' },
  { id: 'sp-aud-5', action: 'control_updated', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Payout Approval Threshold set to $500', timestamp: 'Jan 15, 2026 02:10 PM' },
  { id: 'sp-aud-6', action: 'account_created', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Subaccount "Recruiting" created under MBB Program', timestamp: 'Jan 10, 2026 10:00 AM' },
  { id: 'sp-aud-7', action: 'transfer_completed', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Operating → MBB Program ($8,000.00)', timestamp: 'Jan 28, 2026 09:00 AM' },
  { id: 'sp-aud-8', action: 'dispute_opened', actor: 'System', actorInitials: 'SY', target: 'Chargeback filed — MLK Camp reg ($275.00)', timestamp: 'Feb 6, 2026 03:22 PM' },
];

const SPORTS_SETTINGS: PayRailsSettingToggle[] = [
  { id: 'sp-set-1', label: 'Auto-Settle Game Day', description: 'Automatically close game-day settlement batches within 48 hours of the event', enabled: true },
  { id: 'sp-set-2', label: 'Require Receipt for Reimbursements', description: 'Block reimbursement payouts over $50 without an attached receipt image', enabled: true },
  { id: 'sp-set-3', label: 'Email Notifications for Payouts', description: 'Send email confirmations to recipients when payouts are initiated', enabled: true },
  { id: 'sp-set-4', label: 'Auto-Reconcile Matched Transactions', description: 'Automatically mark reconciliation items as matched when amounts align exactly', enabled: false },
];

// =============================================================================
// EDUCATION MODE
// =============================================================================

const EDUCATION_OVERVIEW: PayRailsOverviewBlock[] = [
  { id: 'ed-ov-1', label: 'Tuition Collected', value: '$412,850.00', trend: '+5.2%', trendUp: true },
  { id: 'ed-ov-2', label: 'Vendor Payouts', value: '$14,150.00' },
  { id: 'ed-ov-3', label: 'Refunds Issued', value: '$6,650.00' },
  { id: 'ed-ov-4', label: 'Pending Settlement', value: '$28,430.00' },
  { id: 'ed-ov-5', label: 'Active Disputes', value: '2' },
  { id: 'ed-ov-6', label: 'Semester Trend', value: '+3.8%', trend: '+3.8%', trendUp: true },
];

const EDUCATION_ACCOUNTS: PayRailsAccount[] = [
  { id: 'ed-acct-1', name: 'KaNeXT General Operating', type: 'primary', scope: 'Institution', balance: 421680.45, currency: 'USD', status: 'active', lastActivity: 'Feb 15, 2026' },
  { id: 'ed-acct-2', name: 'Financial Aid Disbursement', type: 'subaccount', scope: 'Institution', balance: 85320.18, currency: 'USD', status: 'active', lastActivity: 'Feb 14, 2026' },
  { id: 'ed-acct-3', name: 'Facilities', type: 'subaccount', scope: 'Department', balance: 15480.92, currency: 'USD', status: 'active', lastActivity: 'Feb 10, 2026' },
];

const EDUCATION_CHARGES: PayRailsCharge[] = [
  { id: 'ed-chg-1', description: 'Spring tuition — full-time undergraduate', amount: 8500.00, fee: 255.00, net: 8245.00, payer: 'Amara Okafor', payerInitials: 'AO', product: 'Tuition', status: 'succeeded', date: 'Feb 12, 2026', scope: 'Institution', receiptRef: 'TUI-20260212-0891' },
  { id: 'ed-chg-2', description: 'Spring tuition — part-time graduate', amount: 4500.00, fee: 135.00, net: 4365.00, payer: 'Brian Kessler', payerInitials: 'BK', product: 'Tuition', status: 'succeeded', date: 'Feb 11, 2026', scope: 'Institution', receiptRef: 'TUI-20260211-0892' },
  { id: 'ed-chg-3', description: 'Application fee — Fall 2026', amount: 50.00, fee: 1.50, net: 48.50, payer: 'Destiny Ramirez', payerInitials: 'DR', product: 'Application Fee', status: 'succeeded', date: 'Feb 10, 2026', scope: 'Institution' },
  { id: 'ed-chg-4', description: 'Chemistry lab fee — CHEM 201', amount: 150.00, fee: 4.50, net: 145.50, payer: 'Tyler Washington', payerInitials: 'TW', product: 'Lab Fee', status: 'succeeded', date: 'Feb 8, 2026', scope: 'Department' },
  { id: 'ed-chg-5', description: 'Spring housing — Morrison Hall', amount: 3200.00, fee: 96.00, net: 3104.00, payer: 'Kayla Bennett', payerInitials: 'KB', product: 'Housing', status: 'succeeded', date: 'Feb 5, 2026', scope: 'Institution', receiptRef: 'HOU-20260205-0412' },
  { id: 'ed-chg-6', description: 'Alumni annual fund donation', amount: 1000.00, fee: 30.00, net: 970.00, payer: 'Robert Alston', payerInitials: 'RA', product: 'Donation', status: 'succeeded', date: 'Feb 3, 2026', scope: 'Organization', receiptRef: 'DON-20260203-001' },
];

const EDUCATION_PAYOUTS: PayRailsPayout[] = [
  { id: 'ed-po-1', recipient: 'Fisher Scientific', recipientInitials: 'FS', description: 'Lab supplies — Biology & Chemistry depts', amount: 3215.40, purpose: 'Vendor payment', category: 'Lab Supplies', status: 'succeeded', dueDate: 'Feb 14, 2026', paidDate: 'Feb 13, 2026', scope: 'Department', evidence: 'INV-FS-2026-1148' },
  { id: 'ed-po-2', recipient: 'Comfort Air HVAC', recipientInitials: 'CA', description: 'HVAC system overhaul — Science Building', amount: 8520.00, purpose: 'Contractor payment', category: 'Facilities', status: 'pending', dueDate: 'Feb 20, 2026', scope: 'Institution', evidence: 'PO-HVAC-2026-003' },
  { id: 'ed-po-3', recipient: 'Tyler Washington', recipientInitials: 'TW', description: 'Tuition overpayment correction — Spring', amount: 2100.00, purpose: 'Student refund', category: 'Student Refund', status: 'succeeded', dueDate: 'Feb 10, 2026', paidDate: 'Feb 10, 2026', scope: 'Institution' },
  { id: 'ed-po-4', recipient: 'Dr. Lena Owens', recipientInitials: 'LO', description: 'Conference travel reimbursement — SXSW Edu', amount: 452.30, purpose: 'Reimbursement', category: 'Faculty Reimbursement', status: 'succeeded', dueDate: 'Feb 8, 2026', paidDate: 'Feb 7, 2026', scope: 'Department', evidence: 'RCPT-LO-0205' },
];

const EDUCATION_TRANSFERS: PayRailsTransfer[] = [
  { id: 'ed-xfr-1', fromAccount: 'KaNeXT General Operating', toAccount: 'Financial Aid Disbursement', amount: 35000.00, description: 'Operating → Financial Aid spring allocation', status: 'succeeded', date: 'Feb 1, 2026', initiator: 'VP Finance' },
  { id: 'ed-xfr-2', fromAccount: 'KaNeXT General Operating', toAccount: 'Facilities', amount: 12000.00, description: 'Operating → Facilities Q1 maintenance budget', status: 'succeeded', date: 'Jan 15, 2026', initiator: 'VP Finance' },
  { id: 'ed-xfr-3', fromAccount: 'KaNeXT General Operating', toAccount: 'Financial Aid Disbursement', amount: 5000.00, description: 'Alumni donation → Scholarship Fund transfer', status: 'succeeded', date: 'Feb 5, 2026', initiator: 'VP Finance' },
];

const EDUCATION_SETTLEMENTS: PayRailsSettlement[] = [
  { id: 'ed-stl-1', title: 'Spring Term Closeout', type: 'Term Settlement', grossAmount: 285400.00, fees: 8562.00, netAmount: 276838.00, itemCount: 312, status: 'processing', period: 'Jan 6 – Feb 15, 2026' },
  { id: 'ed-stl-2', title: 'Fall Receivables Settlement', type: 'Receivables', grossAmount: 412800.00, fees: 12384.00, netAmount: 400416.00, itemCount: 486, status: 'settled', period: 'Aug 18 – Dec 19, 2025', settledDate: 'Jan 8, 2026' },
  { id: 'ed-stl-3', title: 'Mid-Term Refund Batch', type: 'Refund Batch', grossAmount: 18450.00, fees: 553.50, netAmount: 17896.50, itemCount: 9, status: 'settled', period: 'Feb 1–10, 2026', settledDate: 'Feb 12, 2026' },
];

const EDUCATION_REFUNDS: PayRailsRefund[] = [
  { id: 'ed-rfd-1', originalChargeId: 'ed-chg-2', originalDescription: 'Spring tuition — part-time graduate', amount: 2250.00, reason: 'Student withdrawal — prorated partial refund', type: 'partial', status: 'succeeded', requestedDate: 'Feb 7, 2026', processedDate: 'Feb 9, 2026', requestedBy: 'Brian Kessler' },
  { id: 'ed-rfd-2', originalChargeId: 'ed-chg-4', originalDescription: 'Chemistry lab fee — CHEM 201', amount: 150.00, reason: 'Course dropped within add/drop window', type: 'full', status: 'succeeded', requestedDate: 'Feb 3, 2026', processedDate: 'Feb 4, 2026', requestedBy: 'Tyler Washington' },
];

const EDUCATION_RECONCILIATIONS: PayRailsReconciliation[] = [
  { id: 'ed-rec-1', period: 'Spring 2026 Tuition', expectedAmount: 285400.00, actualAmount: 284620.00, variance: -780.00, status: 'variance', itemsMatched: 310, itemsUnmatched: 2, reconciledDate: 'Feb 15, 2026' },
  { id: 'ed-rec-2', period: 'January Facilities', expectedAmount: 12000.00, actualAmount: 12000.00, variance: 0, status: 'matched', itemsMatched: 8, itemsUnmatched: 0, reconciledDate: 'Feb 2, 2026' },
];

const EDUCATION_DISPUTES: PayRailsDispute[] = [
  { id: 'ed-dsp-1', chargeId: 'ed-chg-1', chargeDescription: 'Spring tuition — full-time undergraduate', amount: 8500.00, type: 'chargeback', status: 'open', filedDate: 'Feb 13, 2026', respondBy: 'Feb 27, 2026', disputant: 'Amara Okafor' },
  { id: 'ed-dsp-2', chargeId: 'ed-po-2', chargeDescription: 'HVAC system overhaul — Science Building', amount: 8520.00, type: 'failed-payout', status: 'under-review', filedDate: 'Feb 14, 2026', disputant: 'Comfort Air HVAC' },
];

const EDUCATION_TAX_FORMS: PayRailsTaxForm[] = [
  { id: 'ed-tf-1', recipientName: 'Student Batch (312)', recipientInitials: 'SB', formType: '1098-T', year: '2025', totalAmount: 2580000.00, status: 'filed', dueDate: 'Jan 31, 2026' },
  { id: 'ed-tf-2', recipientName: 'Comfort Air HVAC', recipientInitials: 'CA', formType: '1099-NEC', year: '2025', totalAmount: 24150.00, status: 'ready', dueDate: 'Jan 31, 2026' },
  { id: 'ed-tf-3', recipientName: 'Fisher Scientific', recipientInitials: 'FS', formType: 'W-9', year: '2026', totalAmount: 0, status: 'draft', dueDate: 'Feb 28, 2026' },
];

const EDUCATION_EXPORTS: PayRailsExport[] = [
  { id: 'ed-exp-1', title: 'Spring Term Statement', type: 'Term Statement', period: 'Jan 6 – Feb 15, 2026', generatedAt: 'Feb 15, 2026', format: 'PDF', size: '3.8 MB' },
  { id: 'ed-exp-2', title: 'Receivables Aging Report', type: 'Receivables Aging', period: 'As of Feb 15, 2026', generatedAt: 'Feb 15, 2026', format: 'XLSX', size: '1.2 MB' },
  { id: 'ed-exp-3', title: 'Refund Ledger', type: 'Refund Ledger', period: 'Spring 2026', generatedAt: 'Feb 12, 2026', format: 'CSV', size: '420 KB' },
];

const EDUCATION_CONTROLS: PayRailsControl[] = [
  { id: 'ed-ctl-1', title: 'Refund Approval Threshold', description: 'Require manual approval for any student refund exceeding this amount', threshold: 1000, enabled: true, scope: 'Institution' },
  { id: 'ed-ctl-2', title: 'Dual Approval for Vendor Payouts', description: 'Require two authorized signers for vendor payouts over $5,000', threshold: 5000, enabled: true, scope: 'Institution' },
  { id: 'ed-ctl-3', title: 'Student Refund Registrar Sign-Off', description: 'Require registrar approval before processing any student tuition refund', enabled: true, scope: 'Institution' },
  { id: 'ed-ctl-4', title: 'Auto-Match Tuition Payments', description: 'Automatically match incoming tuition payments to student account balances', enabled: true, scope: 'Institution' },
];

const EDUCATION_AUDIT: PayRailsAuditEntry[] = [
  { id: 'ed-aud-1', action: 'charge_received', actor: 'System', actorInitials: 'SY', target: 'Tuition payment — Amara Okafor ($8,500.00)', timestamp: 'Feb 12, 2026 10:04 AM' },
  { id: 'ed-aud-2', action: 'payout_initiated', actor: 'VP Finance', actorInitials: 'VF', target: 'Fisher Scientific — lab supplies ($3,215.40)', timestamp: 'Feb 13, 2026 09:30 AM' },
  { id: 'ed-aud-3', action: 'refund_processed', actor: 'Registrar Office', actorInitials: 'RO', target: 'Brian Kessler — withdrawal refund ($2,250.00)', timestamp: 'Feb 9, 2026 02:15 PM' },
  { id: 'ed-aud-4', action: 'settlement_closed', actor: 'System', actorInitials: 'SY', target: 'Fall Receivables — 486 items ($400,416.00 net)', timestamp: 'Jan 8, 2026 06:00 PM' },
  { id: 'ed-aud-5', action: 'transfer_completed', actor: 'VP Finance', actorInitials: 'VF', target: 'Operating → Financial Aid ($35,000.00)', timestamp: 'Feb 1, 2026 08:00 AM' },
  { id: 'ed-aud-6', action: 'dispute_opened', actor: 'System', actorInitials: 'SY', target: 'Chargeback — Amara Okafor tuition ($8,500.00)', timestamp: 'Feb 13, 2026 03:45 PM' },
  { id: 'ed-aud-7', action: 'control_updated', actor: 'VP Finance', actorInitials: 'VF', target: 'Refund Approval Threshold set to $1,000', timestamp: 'Jan 12, 2026 11:00 AM' },
  { id: 'ed-aud-8', action: 'account_created', actor: 'VP Finance', actorInitials: 'VF', target: 'Subaccount "Facilities" created under KaNeXT General', timestamp: 'Jan 5, 2026 09:15 AM' },
];

const EDUCATION_SETTINGS: PayRailsSettingToggle[] = [
  { id: 'ed-set-1', label: 'Auto-Reconcile Tuition Payments', description: 'Automatically mark tuition payments as reconciled when they match student account balances exactly', enabled: true },
  { id: 'ed-set-2', label: 'Batch Process Student Refunds', description: 'Process all approved student refunds in a single weekly batch every Friday', enabled: true },
  { id: 'ed-set-3', label: 'Email Receipts for All Charges', description: 'Send email receipts to payers for all collected charges automatically', enabled: true },
  { id: 'ed-set-4', label: 'Auto-Generate 1098-T Annually', description: 'Automatically generate 1098-T tax forms for all enrolled students at year end', enabled: true },
];

// =============================================================================
// CHURCH MODE
// =============================================================================

const CHURCH_OVERVIEW: PayRailsOverviewBlock[] = [
  { id: 'ch-ov-1', label: 'Tithes / Giving Collected', value: '$18,425.00', trend: '+6.1%', trendUp: true },
  { id: 'ch-ov-2', label: 'Ministry Payouts', value: '$5,142.00' },
  { id: 'ch-ov-3', label: 'Benevolence Disbursed', value: '$1,500.00' },
  { id: 'ch-ov-4', label: 'Weekly Settlement', value: '$12,840.00' },
  { id: 'ch-ov-5', label: 'Active Disputes', value: '2' },
  { id: 'ch-ov-6', label: 'Giving Trend (YoY)', value: '+11.3%', trend: '+11.3%', trendUp: true },
];

const CHURCH_ACCOUNTS: PayRailsAccount[] = [
  { id: 'ch-acct-1', name: 'KaNeXT Church General Fund', type: 'primary', scope: 'Campus', balance: 62418.75, currency: 'USD', status: 'active', lastActivity: 'Feb 15, 2026' },
  { id: 'ch-acct-2', name: 'Building Fund', type: 'subaccount', scope: 'Campus', balance: 28340.20, currency: 'USD', status: 'active', lastActivity: 'Feb 9, 2026' },
  { id: 'ch-acct-3', name: 'Benevolence Fund', type: 'subaccount', scope: 'Ministry', balance: 8125.50, currency: 'USD', status: 'active', lastActivity: 'Feb 11, 2026' },
];

const CHURCH_CHARGES: PayRailsCharge[] = [
  { id: 'ch-chg-1', description: 'Weekly tithe — Okonkwo family', amount: 2000.00, fee: 60.00, net: 1940.00, payer: 'Emmanuel Okonkwo', payerInitials: 'EO', product: 'Tithe', status: 'succeeded', date: 'Feb 9, 2026', scope: 'Campus', receiptRef: 'GIVE-20260209-001' },
  { id: 'ch-chg-2', description: 'Designated giving — Worship Ministry', amount: 300.00, fee: 9.00, net: 291.00, payer: 'Gloria Mensah', payerInitials: 'GM', product: 'Designated Giving', status: 'succeeded', date: 'Feb 9, 2026', scope: 'Ministry', receiptRef: 'GIVE-20260209-002' },
  { id: 'ch-chg-3', description: 'Designated giving — Youth Ministry', amount: 200.00, fee: 6.00, net: 194.00, payer: 'David & Priscilla Akande', payerInitials: 'DA', product: 'Designated Giving', status: 'succeeded', date: 'Feb 9, 2026', scope: 'Ministry' },
  { id: 'ch-chg-4', description: 'Event registration — Men\'s Retreat', amount: 75.00, fee: 2.25, net: 72.75, payer: 'James Owusu', payerInitials: 'JO', product: 'Event Registration', status: 'succeeded', date: 'Feb 7, 2026', scope: 'Ministry' },
  { id: 'ch-chg-5', description: 'Donation — Building Fund', amount: 1000.00, fee: 30.00, net: 970.00, payer: 'Chidi Nwosu', payerInitials: 'CN', product: 'Donation', status: 'succeeded', date: 'Feb 5, 2026', scope: 'Campus', receiptRef: 'GIVE-20260205-001' },
  { id: 'ch-chg-6', description: 'Benevolence contribution', amount: 150.00, fee: 4.50, net: 145.50, payer: 'Sister Adaeze Ibe', payerInitials: 'AI', product: 'Benevolence', status: 'succeeded', date: 'Feb 3, 2026', scope: 'Ministry' },
];

const CHURCH_PAYOUTS: PayRailsPayout[] = [
  { id: 'ch-po-1', recipient: 'Metro HVAC Solutions', recipientInitials: 'MH', description: 'HVAC repair — Sanctuary unit 2', amount: 3200.00, purpose: 'Facility vendor payment', category: 'Facilities', status: 'succeeded', dueDate: 'Feb 12, 2026', paidDate: 'Feb 11, 2026', scope: 'Campus', evidence: 'INV-MH-2026-0088' },
  { id: 'ch-po-2', recipient: 'Marcus Okoro', recipientInitials: 'MO', description: 'Sound tech contractor — February', amount: 1800.00, purpose: 'Contractor payment', category: 'Staff/Contractor', status: 'succeeded', dueDate: 'Feb 15, 2026', paidDate: 'Feb 14, 2026', scope: 'Ministry', evidence: 'CTR-MO-FEB26' },
  { id: 'ch-po-3', recipient: 'Deaconess Funmi Adeyemi', recipientInitials: 'FA', description: 'Ministry supplies reimbursement — Youth event', amount: 142.38, purpose: 'Reimbursement', category: 'Ministry Reimbursement', status: 'succeeded', dueDate: 'Feb 8, 2026', paidDate: 'Feb 7, 2026', scope: 'Ministry', evidence: 'RCPT-FA-0205' },
  { id: 'ch-po-4', recipient: 'Janet Osei', recipientInitials: 'JOS', description: 'Rent assistance — benevolence case #14', amount: 1500.00, purpose: 'Benevolence payout', category: 'Benevolence', status: 'succeeded', dueDate: 'Feb 11, 2026', paidDate: 'Feb 11, 2026', scope: 'Ministry', evidence: 'BEN-CASE-014' },
];

const CHURCH_TRANSFERS: PayRailsTransfer[] = [
  { id: 'ch-xfr-1', fromAccount: 'KaNeXT Church General Fund', toAccount: 'Building Fund', amount: 5000.00, description: 'General → Building Fund monthly allocation', status: 'succeeded', date: 'Feb 1, 2026', initiator: 'Pastor James Carter' },
  { id: 'ch-xfr-2', fromAccount: 'KaNeXT Church General Fund', toAccount: 'Benevolence Fund', amount: 2000.00, description: 'General → Benevolence monthly allocation', status: 'succeeded', date: 'Feb 1, 2026', initiator: 'Pastor James Carter' },
  { id: 'ch-xfr-3', fromAccount: 'KaNeXT Church General Fund', toAccount: 'KaNeXT Church General Fund', amount: 1425.00, description: 'Men\'s Retreat revenue → Ministry budget', status: 'succeeded', date: 'Feb 10, 2026', initiator: 'Church Administrator' },
];

const CHURCH_SETTLEMENTS: PayRailsSettlement[] = [
  { id: 'ch-stl-1', title: 'Weekly Giving Batch — Feb 9', type: 'Weekly Giving', grossAmount: 12840.00, fees: 385.20, netAmount: 12454.80, itemCount: 48, status: 'settled', period: 'Feb 3–9, 2026', settledDate: 'Feb 11, 2026' },
  { id: 'ch-stl-2', title: 'Men\'s Retreat Settlement', type: 'Event', grossAmount: 2850.00, fees: 85.50, netAmount: 2764.50, itemCount: 38, status: 'settled', period: 'Jan 24–Feb 7, 2026', settledDate: 'Feb 10, 2026' },
  { id: 'ch-stl-3', title: 'Benevolence Case Settlement', type: 'Benevolence', grossAmount: 1500.00, fees: 0, netAmount: 1500.00, itemCount: 1, status: 'settled', period: 'Feb 11, 2026', settledDate: 'Feb 11, 2026' },
];

const CHURCH_REFUNDS: PayRailsRefund[] = [
  { id: 'ch-rfd-1', originalChargeId: 'ch-chg-4', originalDescription: 'Event registration — Men\'s Retreat', amount: 75.00, reason: 'Family emergency — full cancellation refund', type: 'full', status: 'succeeded', requestedDate: 'Feb 6, 2026', processedDate: 'Feb 7, 2026', requestedBy: 'James Owusu' },
  { id: 'ch-rfd-2', originalChargeId: 'ch-chg-1', originalDescription: 'Weekly tithe — Okonkwo family', amount: 500.00, reason: 'Duplicate giving correction — partial reversal', type: 'partial', status: 'pending', requestedDate: 'Feb 12, 2026', requestedBy: 'Emmanuel Okonkwo' },
];

const CHURCH_RECONCILIATIONS: PayRailsReconciliation[] = [
  { id: 'ch-rec-1', period: 'February Giving (Week 1–2)', expectedAmount: 18425.00, actualAmount: 18425.00, variance: 0, status: 'matched', itemsMatched: 86, itemsUnmatched: 0, reconciledDate: 'Feb 15, 2026' },
  { id: 'ch-rec-2', period: 'January Vendor Payments', expectedAmount: 7842.00, actualAmount: 7648.50, variance: -193.50, status: 'variance', itemsMatched: 5, itemsUnmatched: 1, reconciledDate: 'Feb 3, 2026' },
];

const CHURCH_DISPUTES: PayRailsDispute[] = [
  { id: 'ch-dsp-1', chargeId: 'ch-chg-1', chargeDescription: 'Weekly tithe — Okonkwo family', amount: 2000.00, type: 'chargeback', status: 'open', filedDate: 'Feb 14, 2026', respondBy: 'Feb 28, 2026', disputant: 'Emmanuel Okonkwo' },
  { id: 'ch-dsp-2', chargeId: 'ch-po-4', chargeDescription: 'Rent assistance — benevolence case #14', amount: 1500.00, type: 'failed-payout', status: 'under-review', filedDate: 'Feb 13, 2026', disputant: 'Janet Osei' },
];

const CHURCH_TAX_FORMS: PayRailsTaxForm[] = [
  { id: 'ch-tf-1', recipientName: 'Congregation Batch (214)', recipientInitials: 'CB', formType: 'Year-End Giving Statement', year: '2025', totalAmount: 842600.00, status: 'filed', dueDate: 'Jan 31, 2026' },
  { id: 'ch-tf-2', recipientName: 'Marcus Okoro', recipientInitials: 'MO', formType: '1099-NEC', year: '2025', totalAmount: 21600.00, status: 'ready', dueDate: 'Jan 31, 2026' },
  { id: 'ch-tf-3', recipientName: 'Metro HVAC Solutions', recipientInitials: 'MH', formType: 'W-9', year: '2026', totalAmount: 0, status: 'draft', dueDate: 'Feb 28, 2026' },
];

const CHURCH_EXPORTS: PayRailsExport[] = [
  { id: 'ch-exp-1', title: 'Weekly Giving Report — Feb 9', type: 'Weekly Giving', period: 'Feb 3–9, 2026', generatedAt: 'Feb 10, 2026', format: 'PDF', size: '920 KB' },
  { id: 'ch-exp-2', title: 'Ministry Allocation Report', type: 'Ministry Allocation', period: 'February 2026', generatedAt: 'Feb 15, 2026', format: 'XLSX', size: '540 KB' },
  { id: 'ch-exp-3', title: 'Benevolence Disbursement Report', type: 'Benevolence', period: 'Jan–Feb 2026', generatedAt: 'Feb 12, 2026', format: 'PDF', size: '380 KB' },
];

const CHURCH_CONTROLS: PayRailsControl[] = [
  { id: 'ch-ctl-1', title: 'Benevolence Payout Requires Pastor Approval', description: 'All benevolence fund disbursements must be approved by the senior pastor before processing', enabled: true, scope: 'Ministry' },
  { id: 'ch-ctl-2', title: 'Giving Refund Threshold', description: 'Require finance team approval for giving refund requests exceeding this amount', threshold: 200, enabled: true, scope: 'Campus' },
  { id: 'ch-ctl-3', title: 'Dual Approval for Payouts', description: 'Require two authorized signers for any payout exceeding $2,000', threshold: 2000, enabled: true, scope: 'Campus' },
  { id: 'ch-ctl-4', title: 'Designated Giving Auto-Allocation', description: 'Automatically route designated giving to the specified ministry fund upon receipt', enabled: true, scope: 'Campus' },
];

const CHURCH_AUDIT: PayRailsAuditEntry[] = [
  { id: 'ch-aud-1', action: 'charge_received', actor: 'System', actorInitials: 'SY', target: 'Tithe — Emmanuel Okonkwo ($2,000.00)', timestamp: 'Feb 9, 2026 10:30 AM' },
  { id: 'ch-aud-2', action: 'payout_initiated', actor: 'Pastor James Carter', actorInitials: 'DK', target: 'Metro HVAC — sanctuary repair ($3,200.00)', timestamp: 'Feb 11, 2026 09:00 AM' },
  { id: 'ch-aud-3', action: 'settlement_closed', actor: 'System', actorInitials: 'SY', target: 'Weekly Giving Batch — 48 items ($12,454.80 net)', timestamp: 'Feb 11, 2026 06:00 PM' },
  { id: 'ch-aud-4', action: 'refund_processed', actor: 'Church Administrator', actorInitials: 'CA', target: 'James Owusu — retreat registration ($75.00)', timestamp: 'Feb 7, 2026 11:45 AM' },
  { id: 'ch-aud-5', action: 'transfer_completed', actor: 'Pastor James Carter', actorInitials: 'DK', target: 'General → Building Fund ($5,000.00)', timestamp: 'Feb 1, 2026 08:15 AM' },
  { id: 'ch-aud-6', action: 'payout_initiated', actor: 'Pastor James Carter', actorInitials: 'DK', target: 'Benevolence — Janet Osei rent assistance ($1,500.00)', timestamp: 'Feb 11, 2026 10:00 AM' },
  { id: 'ch-aud-7', action: 'dispute_opened', actor: 'System', actorInitials: 'SY', target: 'Chargeback — Okonkwo tithe ($2,000.00)', timestamp: 'Feb 14, 2026 02:30 PM' },
  { id: 'ch-aud-8', action: 'control_updated', actor: 'Pastor James Carter', actorInitials: 'DK', target: 'Giving Refund Threshold set to $200', timestamp: 'Jan 20, 2026 03:00 PM' },
];

const CHURCH_SETTINGS: PayRailsSettingToggle[] = [
  { id: 'ch-set-1', label: 'Auto-Settle Weekly Giving Batch', description: 'Automatically close the weekly giving settlement batch every Monday at 6 AM', enabled: true },
  { id: 'ch-set-2', label: 'Generate Giving Receipts Automatically', description: 'Send digital giving receipts to donors immediately upon successful charge', enabled: true },
  { id: 'ch-set-3', label: 'Benevolence Fund Cap Alerts', description: 'Notify finance team when benevolence fund drops below $2,000', enabled: true },
  { id: 'ch-set-4', label: 'Auto-Allocate Designated Giving', description: 'Route designated gifts to the correct ministry fund without manual intervention', enabled: true },
];

// =============================================================================
// BUSINESS MODE
// =============================================================================

const BUSINESS_OVERVIEW: PayRailsOverviewBlock[] = [
  { id: 'en-ov-1', label: 'Revenue Collected', value: '$17,598.00', trend: '+14.2%', trendUp: true },
  { id: 'en-ov-2', label: 'Vendor Payouts', value: '$19,485.00' },
  { id: 'en-ov-3', label: 'Pending AR', value: '$13,700.00' },
  { id: 'en-ov-4', label: 'Monthly Settlement', value: '$42,815.00' },
  { id: 'en-ov-5', label: 'Active Disputes', value: '2' },
  { id: 'en-ov-6', label: 'Revenue Trend (MoM)', value: '+18.5%', trend: '+18.5%', trendUp: true },
];

const BUSINESS_ACCOUNTS: PayRailsAccount[] = [
  { id: 'en-acct-1', name: 'KaNeXT Operating', type: 'primary', scope: 'Organization', balance: 185420.33, currency: 'USD', status: 'active', lastActivity: 'Feb 15, 2026' },
  { id: 'en-acct-2', name: 'Product', type: 'subaccount', scope: 'Entity', balance: 42180.67, currency: 'USD', status: 'active', lastActivity: 'Feb 14, 2026' },
  { id: 'en-acct-3', name: 'Sales', type: 'subaccount', scope: 'Department', balance: 18750.12, currency: 'USD', status: 'active', lastActivity: 'Feb 12, 2026' },
];

const BUSINESS_CHARGES: PayRailsCharge[] = [
  { id: 'en-chg-1', description: 'Customer invoice — KaNeXT license (annual)', amount: 8500.00, fee: 255.00, net: 8245.00, payer: 'KaNeXT Sports', payerInitials: 'FM', product: 'Enterprise License', status: 'succeeded', date: 'Feb 14, 2026', scope: 'Organization', receiptRef: 'INV-KX-2026-0042' },
  { id: 'en-chg-2', description: 'Subscription — Pro tier (monthly)', amount: 299.00, fee: 8.97, net: 290.03, payer: 'Acme Sports Group', payerInitials: 'AS', product: 'Subscription', status: 'succeeded', date: 'Feb 12, 2026', scope: 'Entity', receiptRef: 'SUB-20260212-PRO' },
  { id: 'en-chg-3', description: 'Deposit — pilot engagement', amount: 5000.00, fee: 150.00, net: 4850.00, payer: 'Beta Athletics Inc', payerInitials: 'BA', product: 'Deposit/Retainer', status: 'succeeded', date: 'Feb 10, 2026', scope: 'Organization', receiptRef: 'DEP-KX-2026-008' },
  { id: 'en-chg-4', description: 'Customer invoice — integration pilot', amount: 3200.00, fee: 96.00, net: 3104.00, payer: 'Gamma Labs', payerInitials: 'GL', product: 'Pilot', status: 'pending', date: 'Feb 8, 2026', scope: 'Entity' },
  { id: 'en-chg-5', description: 'Subscription — Starter tier (monthly)', amount: 149.00, fee: 4.47, net: 144.53, payer: 'Delta Community League', payerInitials: 'DC', product: 'Subscription', status: 'succeeded', date: 'Feb 5, 2026', scope: 'Entity', receiptRef: 'SUB-20260205-STR' },
  { id: 'en-chg-6', description: 'Marketplace revenue — template sales', amount: 450.00, fee: 13.50, net: 436.50, payer: 'Various Buyers', payerInitials: 'VB', product: 'Marketplace', status: 'succeeded', date: 'Feb 3, 2026', scope: 'Entity' },
];

const BUSINESS_PAYOUTS: PayRailsPayout[] = [
  { id: 'en-po-1', recipient: 'Amazon Web Services', recipientInitials: 'AW', description: 'Cloud infrastructure — January invoice', amount: 2418.62, purpose: 'Vendor invoice', category: 'Infrastructure', status: 'succeeded', dueDate: 'Feb 5, 2026', paidDate: 'Feb 4, 2026', scope: 'Entity', evidence: 'INV-AWS-2026-01' },
  { id: 'en-po-2', recipient: 'Studio Nine', recipientInitials: 'SN', description: 'Design contractor — Jan deliverables', amount: 4800.00, purpose: 'Contractor payout', category: 'Contractor', status: 'succeeded', dueDate: 'Feb 10, 2026', paidDate: 'Feb 9, 2026', scope: 'Entity', evidence: 'CTR-SN-JAN26' },
  { id: 'en-po-3', recipient: 'Gusto Payroll', recipientInitials: 'GP', description: 'Payroll link — February first half', amount: 12000.00, purpose: 'Payroll', category: 'Payroll', status: 'succeeded', dueDate: 'Feb 14, 2026', paidDate: 'Feb 14, 2026', scope: 'Organization', evidence: 'PAY-GUSTO-FEB1' },
  { id: 'en-po-4', recipient: 'Alex Morgan', recipientInitials: 'SK', description: 'Conference travel reimbursement — AfroTech', amount: 285.40, purpose: 'Reimbursement', category: 'Reimbursement', status: 'succeeded', dueDate: 'Feb 7, 2026', paidDate: 'Feb 6, 2026', scope: 'Organization', evidence: 'RCPT-SK-0203' },
];

const BUSINESS_TRANSFERS: PayRailsTransfer[] = [
  { id: 'en-xfr-1', fromAccount: 'KaNeXT Operating', toAccount: 'Product', amount: 15000.00, description: 'Operating → Product Q1 allocation', status: 'succeeded', date: 'Jan 31, 2026', initiator: 'Alex Morgan' },
  { id: 'en-xfr-2', fromAccount: 'Sales', toAccount: 'KaNeXT Operating', amount: 4200.00, description: 'Sales commission sweep → Operating', status: 'succeeded', date: 'Feb 3, 2026', initiator: 'Alex Morgan' },
  { id: 'en-xfr-3', fromAccount: 'KaNeXT Operating', toAccount: 'KaNeXT Operating', amount: 10000.00, description: 'Revenue → Savings reserve transfer', status: 'succeeded', date: 'Feb 10, 2026', initiator: 'Alex Morgan' },
];

const BUSINESS_SETTLEMENTS: PayRailsSettlement[] = [
  { id: 'en-stl-1', title: 'January Monthly Close', type: 'Monthly Close', grossAmount: 42815.00, fees: 1284.45, netAmount: 41530.55, itemCount: 28, status: 'settled', period: 'Jan 1–31, 2026', settledDate: 'Feb 5, 2026' },
  { id: 'en-stl-2', title: 'Q4 Vendor Settlement', type: 'Quarterly Vendor', grossAmount: 38420.00, fees: 1152.60, netAmount: 37267.40, itemCount: 15, status: 'settled', period: 'Oct 1 – Dec 31, 2025', settledDate: 'Jan 15, 2026' },
  { id: 'en-stl-3', title: 'Customer Deposit Settlement', type: 'Deposit', grossAmount: 5000.00, fees: 150.00, netAmount: 4850.00, itemCount: 1, status: 'processing', period: 'Feb 10, 2026' },
];

const BUSINESS_REFUNDS: PayRailsRefund[] = [
  { id: 'en-rfd-1', originalChargeId: 'en-chg-2', originalDescription: 'Subscription — Pro tier (monthly)', amount: 149.50, reason: 'Prorated subscription downgrade — mid-cycle', type: 'partial', status: 'succeeded', requestedDate: 'Feb 8, 2026', processedDate: 'Feb 9, 2026', requestedBy: 'Acme Sports Group' },
  { id: 'en-rfd-2', originalChargeId: 'en-chg-4', originalDescription: 'Customer invoice — integration pilot', amount: 3200.00, reason: 'Pilot cancelled before kickoff — full refund', type: 'full', status: 'pending', requestedDate: 'Feb 12, 2026', requestedBy: 'Gamma Labs' },
];

const BUSINESS_RECONCILIATIONS: PayRailsReconciliation[] = [
  { id: 'en-rec-1', period: 'January 2026 Close', expectedAmount: 42815.00, actualAmount: 42815.00, variance: 0, status: 'matched', itemsMatched: 28, itemsUnmatched: 0, reconciledDate: 'Feb 5, 2026' },
  { id: 'en-rec-2', period: 'Q4 2025 Vendor', expectedAmount: 38420.00, actualAmount: 37685.40, variance: -734.60, status: 'variance', itemsMatched: 12, itemsUnmatched: 3, reconciledDate: 'Jan 18, 2026' },
];

const BUSINESS_DISPUTES: PayRailsDispute[] = [
  { id: 'en-dsp-1', chargeId: 'en-chg-1', chargeDescription: 'Customer invoice — KaNeXT license (annual)', amount: 8500.00, type: 'chargeback', status: 'open', filedDate: 'Feb 15, 2026', respondBy: 'Mar 1, 2026', disputant: 'KaNeXT Sports' },
  { id: 'en-dsp-2', chargeId: 'en-po-2', chargeDescription: 'Design contractor — Jan deliverables', amount: 4800.00, type: 'failed-payout', status: 'under-review', filedDate: 'Feb 11, 2026', disputant: 'Studio Nine' },
];

const BUSINESS_TAX_FORMS: PayRailsTaxForm[] = [
  { id: 'en-tf-1', recipientName: 'Various Marketplace Sellers', recipientInitials: 'VM', formType: '1099-K', year: '2025', totalAmount: 18420.00, status: 'filed', dueDate: 'Jan 31, 2026' },
  { id: 'en-tf-2', recipientName: 'Studio Nine', recipientInitials: 'SN', formType: '1099-NEC', year: '2025', totalAmount: 52800.00, status: 'ready', dueDate: 'Jan 31, 2026' },
  { id: 'en-tf-3', recipientName: 'Gamma Labs', recipientInitials: 'GL', formType: 'W-9', year: '2026', totalAmount: 0, status: 'draft', dueDate: 'Feb 28, 2026' },
];

const BUSINESS_EXPORTS: PayRailsExport[] = [
  { id: 'en-exp-1', title: 'January Monthly Close Packet', type: 'Monthly Close', period: 'January 2026', generatedAt: 'Feb 5, 2026', format: 'PDF', size: '4.2 MB' },
  { id: 'en-exp-2', title: 'Vendor Spend Report', type: 'Vendor Spend', period: 'Q4 2025', generatedAt: 'Jan 18, 2026', format: 'XLSX', size: '1.8 MB' },
  { id: 'en-exp-3', title: 'Receivables Aging', type: 'Receivables Aging', period: 'As of Feb 15, 2026', generatedAt: 'Feb 15, 2026', format: 'CSV', size: '320 KB' },
];

const BUSINESS_CONTROLS: PayRailsControl[] = [
  { id: 'en-ctl-1', title: 'Invoice Approval Threshold', description: 'Require manual approval for any customer invoice exceeding this amount', threshold: 10000, enabled: true, scope: 'Organization' },
  { id: 'en-ctl-2', title: 'Contractor Payout Dual Approval', description: 'Require two authorized signers for contractor payouts over $5,000', threshold: 5000, enabled: true, scope: 'Entity' },
  { id: 'en-ctl-3', title: 'Auto-Match Subscription Payments', description: 'Automatically reconcile incoming subscription payments to customer accounts', enabled: true, scope: 'Entity' },
  { id: 'en-ctl-4', title: 'Require PO for Vendor Payouts', description: 'Block vendor payout initiation without an attached purchase order for amounts over $2,000', threshold: 2000, enabled: true, scope: 'Organization' },
];

const BUSINESS_AUDIT: PayRailsAuditEntry[] = [
  { id: 'en-aud-1', action: 'charge_received', actor: 'System', actorInitials: 'SY', target: 'KaNeXT license invoice ($8,500.00)', timestamp: 'Feb 14, 2026 11:20 AM' },
  { id: 'en-aud-2', action: 'payout_initiated', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Amazon Web Services — cloud infra ($2,418.62)', timestamp: 'Feb 4, 2026 09:15 AM' },
  { id: 'en-aud-3', action: 'settlement_closed', actor: 'System', actorInitials: 'SY', target: 'January Monthly Close — 28 items ($41,530.55 net)', timestamp: 'Feb 5, 2026 06:00 PM' },
  { id: 'en-aud-4', action: 'refund_processed', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Acme Sports — subscription downgrade ($149.50)', timestamp: 'Feb 9, 2026 10:30 AM' },
  { id: 'en-aud-5', action: 'transfer_completed', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Operating → Product ($15,000.00)', timestamp: 'Jan 31, 2026 08:00 AM' },
  { id: 'en-aud-6', action: 'dispute_opened', actor: 'System', actorInitials: 'SY', target: 'Chargeback — KaNeXT license ($8,500.00)', timestamp: 'Feb 15, 2026 02:00 PM' },
  { id: 'en-aud-7', action: 'control_updated', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Invoice Approval Threshold set to $10,000', timestamp: 'Jan 8, 2026 04:00 PM' },
  { id: 'en-aud-8', action: 'account_created', actor: 'Alex Morgan', actorInitials: 'SK', target: 'Subaccount "Sales" created under KaNeXT Operating', timestamp: 'Jan 2, 2026 10:30 AM' },
];

const BUSINESS_SETTINGS: PayRailsSettingToggle[] = [
  { id: 'en-set-1', label: 'Auto-Reconcile Subscription Payments', description: 'Automatically mark subscription payments as reconciled when they match customer billing records', enabled: true },
  { id: 'en-set-2', label: 'Batch Process Vendor Payouts', description: 'Process all approved vendor payouts in a single weekly batch every Wednesday', enabled: true },
  { id: 'en-set-3', label: 'Revenue Recognition on Collection', description: 'Recognize revenue at the time of successful charge collection, not at invoice date', enabled: true },
  { id: 'en-set-4', label: 'Auto-Generate Monthly Close Packet', description: 'Automatically generate the monthly close export packet on the 1st of each month', enabled: false },
];

// =============================================================================
// COMMUNITY MODE
// =============================================================================

const COMMUNITY_OVERVIEW: PayRailsOverviewBlock[] = [
  { id: 'cm-ov-1', label: 'Entry Fees Collected', value: '$14,400.00', trend: '+22.0%', trendUp: true },
  { id: 'cm-ov-2', label: 'Venue / Officials Paid', value: '$9,300.00' },
  { id: 'cm-ov-3', label: 'Sponsorship Revenue', value: '$7,500.00' },
  { id: 'cm-ov-4', label: 'Event Settlement', value: '$18,625.00' },
  { id: 'cm-ov-5', label: 'Active Disputes', value: '2' },
  { id: 'cm-ov-6', label: 'Season Collection Trend', value: '+15.8%', trend: '+15.8%', trendUp: true },
];

const COMMUNITY_ACCOUNTS: PayRailsAccount[] = [
  { id: 'cm-acct-1', name: 'League Operating', type: 'primary', scope: 'Organization', balance: 95230.40, currency: 'USD', status: 'active', lastActivity: 'Feb 15, 2026' },
  { id: 'cm-acct-2', name: 'Event Weekend Fund', type: 'subaccount', scope: 'Series', balance: 22480.15, currency: 'USD', status: 'active', lastActivity: 'Feb 14, 2026' },
  { id: 'cm-acct-3', name: 'Officials Fund', type: 'subaccount', scope: 'Series', balance: 12065.00, currency: 'USD', status: 'active', lastActivity: 'Feb 10, 2026' },
];

const COMMUNITY_CHARGES: PayRailsCharge[] = [
  { id: 'cm-chg-1', description: 'Team entry fee — Round 3 (Eastside Elite)', amount: 1200.00, fee: 36.00, net: 1164.00, payer: 'Eastside Elite', payerInitials: 'EE', product: 'Team Entry Fee', status: 'succeeded', date: 'Feb 14, 2026', scope: 'Series', receiptRef: 'ENT-20260214-001' },
  { id: 'cm-chg-2', description: 'Team entry fee — Round 3 (Metro Select)', amount: 1200.00, fee: 36.00, net: 1164.00, payer: 'Metro Select', payerInitials: 'MS', product: 'Team Entry Fee', status: 'succeeded', date: 'Feb 14, 2026', scope: 'Series', receiptRef: 'ENT-20260214-002' },
  { id: 'cm-chg-3', description: 'Ticketing — Round 2 (150 GA @ $25)', amount: 3750.00, fee: 112.50, net: 3637.50, payer: 'Walk-Up & Online Buyers', payerInitials: 'WO', product: 'Ticketing', status: 'succeeded', date: 'Feb 8, 2026', scope: 'Event Weekend' },
  { id: 'cm-chg-4', description: 'Sponsorship — Season presenting sponsor', amount: 5000.00, fee: 150.00, net: 4850.00, payer: 'RedBull Racing', payerInitials: 'RR', product: 'Sponsorship', status: 'succeeded', date: 'Feb 3, 2026', scope: 'Organization', receiptRef: 'SPO-20260203-001' },
  { id: 'cm-chg-5', description: 'Sponsorship — Court-side signage', amount: 2500.00, fee: 75.00, net: 2425.00, payer: 'Nike Community', payerInitials: 'NC', product: 'Sponsorship', status: 'succeeded', date: 'Feb 1, 2026', scope: 'Series', receiptRef: 'SPO-20260201-002' },
  { id: 'cm-chg-6', description: 'Streaming revenue — Round 2 broadcast', amount: 800.00, fee: 24.00, net: 776.00, payer: 'StreamPro Platform', payerInitials: 'SP', product: 'Streaming', status: 'succeeded', date: 'Feb 9, 2026', scope: 'Event Weekend' },
];

const COMMUNITY_PAYOUTS: PayRailsPayout[] = [
  { id: 'cm-po-1', recipient: 'COTA Event Center', recipientInitials: 'CE', description: 'Venue rental — Round 2 event weekend', amount: 4500.00, purpose: 'Venue payout', category: 'Venue', status: 'succeeded', dueDate: 'Feb 10, 2026', paidDate: 'Feb 9, 2026', scope: 'Event Weekend', evidence: 'INV-COTA-2026-R2' },
  { id: 'cm-po-2', recipient: 'NAIA Officials Pool', recipientInitials: 'NO', description: 'Officials batch — Round 2 (12 games)', amount: 3600.00, purpose: 'Officials batch payout', category: 'Officials', status: 'succeeded', dueDate: 'Feb 12, 2026', paidDate: 'Feb 11, 2026', scope: 'Series', evidence: 'OFF-BATCH-R2' },
  { id: 'cm-po-3', recipient: 'Shield Security Group', recipientInitials: 'SS', description: 'Security detail — Round 2 event weekend', amount: 1200.00, purpose: 'Security vendor', category: 'Security', status: 'succeeded', dueDate: 'Feb 10, 2026', paidDate: 'Feb 10, 2026', scope: 'Event Weekend', evidence: 'INV-SSG-2026-008' },
  { id: 'cm-po-4', recipient: 'StreamPro Production', recipientInitials: 'SP', description: 'Media production — Round 2 broadcast', amount: 2800.00, purpose: 'Media production', category: 'Media', status: 'pending', dueDate: 'Feb 18, 2026', scope: 'Event Weekend', evidence: 'INV-SP-2026-R2' },
  { id: 'cm-po-5', recipient: 'Trophy World', recipientInitials: 'TW', description: 'Awards vendor — season trophies & plaques', amount: 1100.00, purpose: 'Awards vendor', category: 'Awards', status: 'pending', dueDate: 'Feb 25, 2026', scope: 'Series', evidence: 'PO-TW-2026-001' },
];

const COMMUNITY_TRANSFERS: PayRailsTransfer[] = [
  { id: 'cm-xfr-1', fromAccount: 'League Operating', toAccount: 'Event Weekend Fund', amount: 8000.00, description: 'Operating → Event Weekend funding (Round 3)', status: 'succeeded', date: 'Feb 10, 2026', initiator: 'League Director' },
  { id: 'cm-xfr-2', fromAccount: 'Event Weekend Fund', toAccount: 'Officials Fund', amount: 3600.00, description: 'Entry fees → Officials fund allocation (Round 2)', status: 'succeeded', date: 'Feb 5, 2026', initiator: 'League Director' },
  { id: 'cm-xfr-3', fromAccount: 'League Operating', toAccount: 'League Operating', amount: 7500.00, description: 'Sponsorship revenue → Operating general', status: 'succeeded', date: 'Feb 4, 2026', initiator: 'League Director' },
];

const COMMUNITY_SETTLEMENTS: PayRailsSettlement[] = [
  { id: 'cm-stl-1', title: 'Round 2 Event Closeout', type: 'Event Closeout', grossAmount: 18625.00, fees: 558.75, netAmount: 18066.25, itemCount: 22, status: 'settled', period: 'Feb 7–9, 2026', settledDate: 'Feb 13, 2026' },
  { id: 'cm-stl-2', title: 'Officials Payout Settlement — January', type: 'Officials Batch', grossAmount: 7200.00, fees: 216.00, netAmount: 6984.00, itemCount: 24, status: 'settled', period: 'Jan 1–31, 2026', settledDate: 'Feb 5, 2026' },
  { id: 'cm-stl-3', title: 'Venue Settlement — Q1', type: 'Venue', grossAmount: 13500.00, fees: 405.00, netAmount: 13095.00, itemCount: 3, status: 'open', period: 'Jan 1 – Mar 31, 2026' },
];

const COMMUNITY_REFUNDS: PayRailsRefund[] = [
  { id: 'cm-rfd-1', originalChargeId: 'cm-chg-1', originalDescription: 'Team entry fee — Round 3 (Eastside Elite)', amount: 600.00, reason: 'Team withdrawal — partial entry fee refund (50%)', type: 'partial', status: 'pending', requestedDate: 'Feb 15, 2026', requestedBy: 'Eastside Elite' },
  { id: 'cm-rfd-2', originalChargeId: 'cm-chg-5', originalDescription: 'Sponsorship — Court-side signage', amount: 2500.00, reason: 'Duplicate sponsor payment — full reversal', type: 'full', status: 'succeeded', requestedDate: 'Feb 4, 2026', processedDate: 'Feb 5, 2026', requestedBy: 'Nike Community' },
];

const COMMUNITY_RECONCILIATIONS: PayRailsReconciliation[] = [
  { id: 'cm-rec-1', period: 'Round 2 Event', expectedAmount: 18625.00, actualAmount: 18625.00, variance: 0, status: 'matched', itemsMatched: 22, itemsUnmatched: 0, reconciledDate: 'Feb 14, 2026' },
  { id: 'cm-rec-2', period: 'January Officials', expectedAmount: 7200.00, actualAmount: 6964.00, variance: -236.00, status: 'variance', itemsMatched: 23, itemsUnmatched: 1, reconciledDate: 'Feb 6, 2026' },
];

const COMMUNITY_DISPUTES: PayRailsDispute[] = [
  { id: 'cm-dsp-1', chargeId: 'cm-chg-1', chargeDescription: 'Team entry fee — Round 3 (Eastside Elite)', amount: 1200.00, type: 'chargeback', status: 'open', filedDate: 'Feb 15, 2026', respondBy: 'Mar 1, 2026', disputant: 'Eastside Elite' },
  { id: 'cm-dsp-2', chargeId: 'cm-po-1', chargeDescription: 'Venue rental — Round 2 event weekend', amount: 4500.00, type: 'failed-payout', status: 'under-review', filedDate: 'Feb 11, 2026', disputant: 'COTA Event Center' },
];

const COMMUNITY_TAX_FORMS: PayRailsTaxForm[] = [
  { id: 'cm-tf-1', recipientName: 'Officials Batch (36)', recipientInitials: 'OB', formType: '1099-NEC', year: '2025', totalAmount: 43200.00, status: 'filed', dueDate: 'Jan 31, 2026' },
  { id: 'cm-tf-2', recipientName: 'StreamPro Platform', recipientInitials: 'SP', formType: '1099-K', year: '2025', totalAmount: 9600.00, status: 'ready', dueDate: 'Jan 31, 2026' },
  { id: 'cm-tf-3', recipientName: 'Trophy World', recipientInitials: 'TW', formType: 'W-9', year: '2026', totalAmount: 0, status: 'draft', dueDate: 'Feb 28, 2026' },
];

const COMMUNITY_EXPORTS: PayRailsExport[] = [
  { id: 'cm-exp-1', title: 'Round 2 Event Settlement Packet', type: 'Event Settlement', period: 'Feb 7–9, 2026', generatedAt: 'Feb 13, 2026', format: 'PDF', size: '2.6 MB' },
  { id: 'cm-exp-2', title: 'Officials Payout Report — January', type: 'Officials Payout', period: 'January 2026', generatedAt: 'Feb 5, 2026', format: 'XLSX', size: '890 KB' },
  { id: 'cm-exp-3', title: 'Vendor Payment Report — Q1', type: 'Vendor Payment', period: 'Jan 1 – Feb 15, 2026', generatedAt: 'Feb 15, 2026', format: 'CSV', size: '410 KB' },
  { id: 'cm-exp-4', title: 'Receipts Summary — Round 2', type: 'Receipts Summary', period: 'Feb 7–9, 2026', generatedAt: 'Feb 10, 2026', format: 'PDF', size: '1.1 MB' },
];

const COMMUNITY_CONTROLS: PayRailsControl[] = [
  { id: 'cm-ctl-1', title: 'Venue Payout Requires Event Director Approval', description: 'All venue-related payouts must be approved by the event director before processing', enabled: true, scope: 'Event Weekend' },
  { id: 'cm-ctl-2', title: 'Officials Payout Batch Limit', description: 'Cap individual officials payout batches at this amount to prevent overpayment', threshold: 5000, enabled: true, scope: 'Series' },
  { id: 'cm-ctl-3', title: 'Auto-Allocate Entry Fees', description: 'Automatically split entry fee revenue by rule set (60% operations, 25% officials, 15% awards)', enabled: true, scope: 'Series' },
  { id: 'cm-ctl-4', title: 'Dual Approval for Settlements', description: 'Require two authorized signers to close any event settlement batch', enabled: true, scope: 'Organization' },
];

const COMMUNITY_AUDIT: PayRailsAuditEntry[] = [
  { id: 'cm-aud-1', action: 'charge_received', actor: 'System', actorInitials: 'SY', target: 'Entry fee — Eastside Elite ($1,200.00)', timestamp: 'Feb 14, 2026 08:45 AM' },
  { id: 'cm-aud-2', action: 'payout_initiated', actor: 'League Director', actorInitials: 'LD', target: 'COTA Event Center — venue rental ($4,500.00)', timestamp: 'Feb 9, 2026 10:00 AM' },
  { id: 'cm-aud-3', action: 'settlement_closed', actor: 'System', actorInitials: 'SY', target: 'Round 2 Closeout — 22 items ($18,066.25 net)', timestamp: 'Feb 13, 2026 06:00 PM' },
  { id: 'cm-aud-4', action: 'refund_processed', actor: 'League Director', actorInitials: 'LD', target: 'Nike Community — duplicate sponsor payment ($2,500.00)', timestamp: 'Feb 5, 2026 11:15 AM' },
  { id: 'cm-aud-5', action: 'transfer_completed', actor: 'League Director', actorInitials: 'LD', target: 'Operating → Event Weekend Fund ($8,000.00)', timestamp: 'Feb 10, 2026 09:00 AM' },
  { id: 'cm-aud-6', action: 'dispute_opened', actor: 'System', actorInitials: 'SY', target: 'Chargeback — Eastside Elite entry fee ($1,200.00)', timestamp: 'Feb 15, 2026 01:30 PM' },
  { id: 'cm-aud-7', action: 'control_updated', actor: 'League Director', actorInitials: 'LD', target: 'Officials Payout Batch Limit set to $5,000', timestamp: 'Jan 18, 2026 02:45 PM' },
  { id: 'cm-aud-8', action: 'account_created', actor: 'League Director', actorInitials: 'LD', target: 'Subaccount "Officials Fund" created under League Operating', timestamp: 'Jan 3, 2026 11:00 AM' },
];

const COMMUNITY_SETTINGS: PayRailsSettingToggle[] = [
  { id: 'cm-set-1', label: 'Auto-Settle Events Within 72h', description: 'Automatically close event settlement batches 72 hours after the event ends', enabled: true },
  { id: 'cm-set-2', label: 'Batch Officials Payouts After Event', description: 'Queue all officials payouts until the event weekend concludes, then process as a single batch', enabled: true },
  { id: 'cm-set-3', label: 'Email Settlement Reports to Teams', description: 'Send settlement summary emails to participating team contacts after each event closes', enabled: true },
  { id: 'cm-set-4', label: 'Auto-Reconcile Entry Fees', description: 'Automatically mark entry fee payments as reconciled when they match team registration records', enabled: false },
];

// =============================================================================
// GETTER
// =============================================================================

export function getPayRailsData(mode: Mode): PayRailsModeData {
  switch (mode) {
    case 'sports':
      return {
        overview: SPORTS_OVERVIEW,
        accounts: SPORTS_ACCOUNTS,
        charges: SPORTS_CHARGES,
        payouts: SPORTS_PAYOUTS,
        transfers: SPORTS_TRANSFERS,
        settlements: SPORTS_SETTLEMENTS,
        refunds: SPORTS_REFUNDS,
        reconciliations: SPORTS_RECONCILIATIONS,
        disputes: SPORTS_DISPUTES,
        taxForms: SPORTS_TAX_FORMS,
        exports: SPORTS_EXPORTS,
        controls: SPORTS_CONTROLS,
        audit: SPORTS_AUDIT,
        settings: SPORTS_SETTINGS,
      };
    case 'education':
      return {
        overview: EDUCATION_OVERVIEW,
        accounts: EDUCATION_ACCOUNTS,
        charges: EDUCATION_CHARGES,
        payouts: EDUCATION_PAYOUTS,
        transfers: EDUCATION_TRANSFERS,
        settlements: EDUCATION_SETTLEMENTS,
        refunds: EDUCATION_REFUNDS,
        reconciliations: EDUCATION_RECONCILIATIONS,
        disputes: EDUCATION_DISPUTES,
        taxForms: EDUCATION_TAX_FORMS,
        exports: EDUCATION_EXPORTS,
        controls: EDUCATION_CONTROLS,
        audit: EDUCATION_AUDIT,
        settings: EDUCATION_SETTINGS,
      };
    case 'church':
      return {
        overview: CHURCH_OVERVIEW,
        accounts: CHURCH_ACCOUNTS,
        charges: CHURCH_CHARGES,
        payouts: CHURCH_PAYOUTS,
        transfers: CHURCH_TRANSFERS,
        settlements: CHURCH_SETTLEMENTS,
        refunds: CHURCH_REFUNDS,
        reconciliations: CHURCH_RECONCILIATIONS,
        disputes: CHURCH_DISPUTES,
        taxForms: CHURCH_TAX_FORMS,
        exports: CHURCH_EXPORTS,
        controls: CHURCH_CONTROLS,
        audit: CHURCH_AUDIT,
        settings: CHURCH_SETTINGS,
      };
    case 'competition':
      return {
        overview: COMMUNITY_OVERVIEW,
        accounts: COMMUNITY_ACCOUNTS,
        charges: COMMUNITY_CHARGES,
        payouts: COMMUNITY_PAYOUTS,
        transfers: COMMUNITY_TRANSFERS,
        settlements: COMMUNITY_SETTLEMENTS,
        refunds: COMMUNITY_REFUNDS,
        reconciliations: COMMUNITY_RECONCILIATIONS,
        disputes: COMMUNITY_DISPUTES,
        taxForms: COMMUNITY_TAX_FORMS,
        exports: COMMUNITY_EXPORTS,
        controls: COMMUNITY_CONTROLS,
        audit: COMMUNITY_AUDIT,
        settings: COMMUNITY_SETTINGS,
      };
    case 'business':
      return {
        overview: BUSINESS_OVERVIEW,
        accounts: BUSINESS_ACCOUNTS,
        charges: BUSINESS_CHARGES,
        payouts: BUSINESS_PAYOUTS,
        transfers: BUSINESS_TRANSFERS,
        settlements: BUSINESS_SETTLEMENTS,
        refunds: BUSINESS_REFUNDS,
        reconciliations: BUSINESS_RECONCILIATIONS,
        disputes: BUSINESS_DISPUTES,
        taxForms: BUSINESS_TAX_FORMS,
        exports: BUSINESS_EXPORTS,
        controls: BUSINESS_CONTROLS,
        audit: BUSINESS_AUDIT,
        settings: BUSINESS_SETTINGS,
      };
  }
}
