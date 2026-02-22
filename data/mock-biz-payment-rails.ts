/**
 * Mock Business Payment Rails — Data layer for the Payment Rails tab.
 * 9 scroll sections: Now, Wallets, Batches, Approvals, Release Queue, Exceptions,
 * Disputes & Returns, Receipts, Admin.
 * All data references Valuetainment entities: Mercury Bank, Stripe, Valuetainment Media LLC, OSK Group,
 * Valuetainment partnership payments, 2819 Church donations.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface RailsHealthMetric {
  id: string;
  label: string;
  value: string;
  status: 'green' | 'yellow' | 'red';
}

export interface NowItem {
  id: string;
  title: string;
  amount: string;
  status: 'processing' | 'pending_approval' | 'scheduled' | 'failed';
  counterparty: string;
  rail: 'ACH' | 'Wire' | 'Card' | 'Crypto';
  eta: string;
}

export interface WalletAccount {
  id: string;
  name: string;
  institution: string;
  type: 'checking' | 'savings' | 'treasury' | 'crypto';
  balance: string;
  lastActivity: string;
  status: 'connected' | 'limited' | 'offline';
}

export interface PayoutBatch {
  id: string;
  label: string;
  totalAmount: string;
  itemCount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'settled';
  createdBy: string;
  createdAt: string;
}

export interface RailsApproval {
  id: string;
  title: string;
  amount: string;
  requester: string;
  type: 'payout' | 'vendor' | 'refund' | 'transfer';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface ExceptionItem {
  id: string;
  title: string;
  type: 'return' | 'nsf' | 'fraud_flag' | 'duplicate' | 'limit_breach';
  amount: string;
  date: string;
  status: 'open' | 'investigating' | 'resolved';
  severity: 'critical' | 'high' | 'medium';
}

export interface DisputeItem {
  id: string;
  title: string;
  amount: string;
  counterparty: string;
  filedDate: string;
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  category: string;
}

export interface ReceiptItem {
  id: string;
  description: string;
  amount: string;
  date: string;
  category: string;
  entity: string;
  receiptUrl?: string;
}

export interface AdminSetting {
  id: string;
  label: string;
  value: string;
  type: 'toggle' | 'threshold' | 'text';
  category: string;
}

// =============================================================================
// RAILS HEALTH (enhanced — overall status + 7 metrics)
// =============================================================================

export type RailsOverallStatus = 'GREEN' | 'YELLOW' | 'RED';

export const RAILS_OVERALL_STATUS: RailsOverallStatus = 'YELLOW';

export const RAILS_HEALTH: RailsHealthMetric[] = [
  {
    id: 'rh-1',
    label: 'Settlement Clock',
    value: 'On Time',
    status: 'green',
  },
  {
    id: 'rh-2',
    label: 'Connected Processors',
    value: '3 Active',
    status: 'green',
  },
  {
    id: 'rh-3',
    label: 'Holds',
    value: '1',
    status: 'yellow',
  },
  {
    id: 'rh-4',
    label: 'Failed (24h)',
    value: '1',
    status: 'red',
  },
  {
    id: 'rh-5',
    label: 'Disputes',
    value: '2 Active',
    status: 'yellow',
  },
  {
    id: 'rh-6',
    label: 'Audit',
    value: '94%',
    status: 'green',
  },
  {
    id: 'rh-7',
    label: 'Approval Queue',
    value: '3 Pending',
    status: 'yellow',
  },
];

// =============================================================================
// NOW ITEMS (6 live transactions)
// =============================================================================

export const NOW_ITEMS: NowItem[] = [
  {
    id: 'now-1',
    title: 'Valuetainment Partnership Q1 Payment',
    amount: '$24,500.00',
    status: 'processing',
    counterparty: 'Carroll College',
    rail: 'ACH',
    eta: 'Settles Feb 19',
  },
  {
    id: 'now-2',
    title: 'Stripe Payout — Jan Revenue',
    amount: '$8,340.00',
    status: 'processing',
    counterparty: 'Stripe',
    rail: 'ACH',
    eta: 'Settles Feb 18',
  },
  {
    id: 'now-3',
    title: '2819 Church Donation Disbursement',
    amount: '$12,000.00',
    status: 'pending_approval',
    counterparty: "Int'l Church of Christ LA",
    rail: 'Wire',
    eta: 'Awaiting Approval',
  },
  {
    id: 'now-4',
    title: 'AWS Infrastructure — Feb',
    amount: '$3,210.44',
    status: 'scheduled',
    counterparty: 'Amazon Web Services',
    rail: 'Card',
    eta: 'Scheduled Feb 20',
  },
  {
    id: 'now-5',
    title: 'OSK Group Capital Call',
    amount: '$50,000.00',
    status: 'pending_approval',
    counterparty: 'OSK Group LLC',
    rail: 'Wire',
    eta: 'Awaiting Approval',
  },
  {
    id: 'now-6',
    title: 'Vendor Payout — Design Agency',
    amount: '$6,800.00',
    status: 'failed',
    counterparty: 'Studio Noir Creative',
    rail: 'ACH',
    eta: 'Failed — Invalid Account',
  },
];

// =============================================================================
// WALLET ACCOUNTS (4 connected accounts)
// =============================================================================

export const WALLET_ACCOUNTS: WalletAccount[] = [
  {
    id: 'wa-1',
    name: 'Valuetainment Media LLC Operating',
    institution: 'Mercury Bank',
    type: 'checking',
    balance: '$142,400.00',
    lastActivity: '2h ago',
    status: 'connected',
  },
  {
    id: 'wa-2',
    name: 'Valuetainment Media LLC Reserve',
    institution: 'Mercury Bank',
    type: 'treasury',
    balance: '$85,000.00',
    lastActivity: '1d ago',
    status: 'connected',
  },
  {
    id: 'wa-3',
    name: 'OSK Group LLC Operating',
    institution: 'Mercury Bank',
    type: 'checking',
    balance: '$63,200.00',
    lastActivity: '4h ago',
    status: 'connected',
  },
  {
    id: 'wa-4',
    name: 'Valuetainment Crypto Wallet',
    institution: 'Coinbase',
    type: 'crypto',
    balance: '$4,120.00',
    lastActivity: '3d ago',
    status: 'limited',
  },
];

// =============================================================================
// PAYOUT BATCHES (5 batches)
// =============================================================================

export const PAYOUT_BATCHES: PayoutBatch[] = [
  {
    id: 'pb-1',
    label: 'Feb Vendor Payouts',
    totalAmount: '$48,200.00',
    itemCount: 7,
    status: 'pending_approval',
    createdBy: 'David Okonkwo',
    createdAt: 'Feb 16, 2026',
  },
  {
    id: 'pb-2',
    label: 'Valuetainment Q1 Partnership Bundle',
    totalAmount: '$24,500.00',
    itemCount: 1,
    status: 'processing',
    createdBy: 'Alex Morgan',
    createdAt: 'Feb 15, 2026',
  },
  {
    id: 'pb-3',
    label: '2819 Church Community Disbursement',
    totalAmount: '$12,000.00',
    itemCount: 3,
    status: 'approved',
    createdBy: 'Jordan Hayes',
    createdAt: 'Feb 14, 2026',
  },
  {
    id: 'pb-4',
    label: 'Jan Contractor Payroll',
    totalAmount: '$31,600.00',
    itemCount: 4,
    status: 'settled',
    createdBy: 'David Okonkwo',
    createdAt: 'Jan 31, 2026',
  },
  {
    id: 'pb-5',
    label: 'OSK Group Capital Distribution',
    totalAmount: '$50,000.00',
    itemCount: 1,
    status: 'draft',
    createdBy: 'Alex Morgan',
    createdAt: 'Feb 17, 2026',
  },
];

// =============================================================================
// RAILS APPROVALS (5 approvals)
// =============================================================================

export const RAILS_APPROVALS: RailsApproval[] = [
  {
    id: 'ra-1',
    title: 'Feb Vendor Payouts Batch',
    amount: '$48,200.00',
    requester: 'David Okonkwo',
    type: 'payout',
    status: 'pending',
    submittedAt: 'Feb 16, 2:30 PM',
  },
  {
    id: 'ra-2',
    title: '2819 Church Donation Disbursement',
    amount: '$12,000.00',
    requester: 'Jordan Hayes',
    type: 'transfer',
    status: 'pending',
    submittedAt: 'Feb 15, 11:00 AM',
  },
  {
    id: 'ra-3',
    title: 'OSK Group Capital Call Wire',
    amount: '$50,000.00',
    requester: 'Alex Morgan',
    type: 'transfer',
    status: 'pending',
    submittedAt: 'Feb 17, 9:15 AM',
  },
  {
    id: 'ra-4',
    title: 'Studio Noir Creative — Refund',
    amount: '$6,800.00',
    requester: 'Lisa Park',
    type: 'refund',
    status: 'approved',
    submittedAt: 'Feb 14, 4:00 PM',
  },
  {
    id: 'ra-5',
    title: 'Vercel Pro Subscription Upgrade',
    amount: '$1,200.00',
    requester: 'Adriana Ruiz',
    type: 'vendor',
    status: 'rejected',
    submittedAt: 'Feb 13, 10:45 AM',
  },
];

// =============================================================================
// EXCEPTIONS (5 items)
// =============================================================================

export const EXCEPTIONS: ExceptionItem[] = [
  {
    id: 'ex-1',
    title: 'ACH Return — Studio Noir Creative',
    type: 'return',
    amount: '$6,800.00',
    date: 'Feb 16, 2026',
    status: 'open',
    severity: 'high',
  },
  {
    id: 'ex-2',
    title: 'NSF — PBD Podcast Sponsorship',
    type: 'nsf',
    amount: '$2,500.00',
    date: 'Feb 14, 2026',
    status: 'investigating',
    severity: 'medium',
  },
  {
    id: 'ex-3',
    title: 'Fraud Flag — Unusual Wire Pattern',
    type: 'fraud_flag',
    amount: '$15,000.00',
    date: 'Feb 13, 2026',
    status: 'investigating',
    severity: 'critical',
  },
  {
    id: 'ex-4',
    title: 'Duplicate Payment — AWS Jan',
    type: 'duplicate',
    amount: '$3,210.44',
    date: 'Feb 10, 2026',
    status: 'resolved',
    severity: 'medium',
  },
  {
    id: 'ex-5',
    title: 'Daily Limit Breach — Mercury ACH',
    type: 'limit_breach',
    amount: '$75,000.00',
    date: 'Feb 12, 2026',
    status: 'resolved',
    severity: 'high',
  },
];

// =============================================================================
// DISPUTES (4 items)
// =============================================================================

export const DISPUTES: DisputeItem[] = [
  {
    id: 'dp-1',
    title: 'Overcharge — Cloud Hosting Nov',
    amount: '$1,440.00',
    counterparty: 'Amazon Web Services',
    filedDate: 'Jan 28, 2026',
    status: 'under_review',
    category: 'Billing Error',
  },
  {
    id: 'dp-2',
    title: 'Undelivered Service — Video Production',
    amount: '$4,500.00',
    counterparty: 'MediaWorks Studios',
    filedDate: 'Feb 5, 2026',
    status: 'open',
    category: 'Service Not Rendered',
  },
  {
    id: 'dp-3',
    title: 'Unauthorized Charge — SaaS Tool',
    amount: '$299.00',
    counterparty: 'ToolStack Inc',
    filedDate: 'Feb 10, 2026',
    status: 'resolved',
    category: 'Unauthorized',
  },
  {
    id: 'dp-4',
    title: 'Duplicate Invoice — Legal Retainer',
    amount: '$7,500.00',
    counterparty: 'Mitchell & Associates LLP',
    filedDate: 'Feb 12, 2026',
    status: 'escalated',
    category: 'Duplicate',
  },
];

// =============================================================================
// RECEIPTS (6 items)
// =============================================================================

export const RECEIPTS: ReceiptItem[] = [
  {
    id: 'rc-1',
    description: 'Mercury Bank — Wire Fee',
    amount: '$25.00',
    date: 'Feb 17, 2026',
    category: 'Banking',
    entity: 'Valuetainment Media LLC',
    receiptUrl: 'https://mercury.com/receipts/2026-02-17-001',
  },
  {
    id: 'rc-2',
    description: 'Stripe — Processing Fees Jan',
    amount: '$412.80',
    date: 'Feb 1, 2026',
    category: 'Payment Processing',
    entity: 'Valuetainment Media LLC',
    receiptUrl: 'https://stripe.com/receipts/2026-02-01-inv',
  },
  {
    id: 'rc-3',
    description: 'Valuetainment Partnership — Q1 Disbursement',
    amount: '$24,500.00',
    date: 'Feb 15, 2026',
    category: 'Partnership',
    entity: 'Valuetainment Media LLC',
  },
  {
    id: 'rc-4',
    description: '2819 Church Donation Processing Fee',
    amount: '$180.00',
    date: 'Feb 14, 2026',
    category: 'Donations',
    entity: 'OSK Group LLC',
  },
  {
    id: 'rc-5',
    description: 'AWS Infrastructure — Jan Invoice',
    amount: '$3,210.44',
    date: 'Jan 31, 2026',
    category: 'Infrastructure',
    entity: 'Valuetainment Media LLC',
    receiptUrl: 'https://aws.amazon.com/invoices/2026-01-31',
  },
  {
    id: 'rc-6',
    description: 'Coinbase — Network Transfer Fee',
    amount: '$8.50',
    date: 'Feb 12, 2026',
    category: 'Crypto',
    entity: 'Valuetainment Media LLC',
    receiptUrl: 'https://coinbase.com/receipts/2026-02-12',
  },
];

// =============================================================================
// ADMIN SETTINGS (6 items)
// =============================================================================

export const ADMIN_SETTINGS: AdminSetting[] = [
  {
    id: 'as-1',
    label: 'Auto-Approve Under Threshold',
    value: 'Enabled',
    type: 'toggle',
    category: 'Approvals',
  },
  {
    id: 'as-2',
    label: 'Auto-Approve Limit',
    value: '$500.00',
    type: 'threshold',
    category: 'Approvals',
  },
  {
    id: 'as-3',
    label: 'Daily ACH Outbound Limit',
    value: '$100,000.00',
    type: 'threshold',
    category: 'Limits',
  },
  {
    id: 'as-4',
    label: 'Wire Approval Required',
    value: 'Enabled',
    type: 'toggle',
    category: 'Approvals',
  },
  {
    id: 'as-5',
    label: 'Default Settlement Account',
    value: 'Mercury — Valuetainment Media LLC Operating',
    type: 'text',
    category: 'Defaults',
  },
  {
    id: 'as-6',
    label: 'Fraud Alert Notifications',
    value: 'Enabled',
    type: 'toggle',
    category: 'Security',
  },
];

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export type RailsSubTab =
  | 'now'
  | 'wallets'
  | 'batches'
  | 'approvals'
  | 'release_queue'
  | 'exceptions'
  | 'disputes'
  | 'receipts'
  | 'admin';

export const RAILS_SUB_TABS: { id: RailsSubTab; label: string }[] = [
  { id: 'now', label: 'Now' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'batches', label: 'Batches' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'release_queue', label: 'Release Queue' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'disputes', label: 'Disputes & Returns' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'admin', label: 'Admin' },
];

// =============================================================================
// RAIL TYPE FILTER OPTIONS
// =============================================================================

export type RailTypeFilter = 'all' | 'ACH' | 'Wire' | 'Card' | 'Crypto';

export const RAIL_TYPE_FILTERS: { id: RailTypeFilter; label: string }[] = [
  { id: 'all', label: 'All Rails' },
  { id: 'ACH', label: 'ACH' },
  { id: 'Wire', label: 'Wire' },
  { id: 'Card', label: 'Card' },
  { id: 'Crypto', label: 'Crypto' },
];

// =============================================================================
// STATUS-BASED FILTER OPTIONS (replaces rail-type filter in header)
// =============================================================================

export const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'needs_approval', label: 'Needs Approval' },
  { id: 'needs_release', label: 'Needs Release' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'in_flight', label: 'In Flight' },
  { id: 'settled', label: 'Settled' },
  { id: 'held', label: 'Held' },
  { id: 'failed', label: 'Failed' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'restricted', label: 'Restricted' },
] as const;
export type StatusFilter = typeof STATUS_FILTERS[number]['id'];

// =============================================================================
// RELEASE QUEUE ITEMS (3 items)
// =============================================================================

export interface ReleaseQueueItem {
  id: string;
  title: string;
  amount: string;
  approvedBy: string;
  approvedAt: string;
  releaseAuthority: string;
  auditNote: string;
  rail: string;
  status: 'awaiting_release' | 'released';
}

export const RELEASE_QUEUE_ITEMS: ReleaseQueueItem[] = [
  { id: 'rlq-1', title: 'Vendor payout — Design agency', amount: '$12,500', approvedBy: 'Alex M.', approvedAt: 'Feb 15', releaseAuthority: 'Treasury', auditNote: '', rail: 'ACH', status: 'awaiting_release' },
  { id: 'rlq-2', title: 'Contractor sprint payment', amount: '$8,200', approvedBy: 'Alex M.', approvedAt: 'Feb 14', releaseAuthority: 'Treasury', auditNote: '', rail: 'ACH', status: 'awaiting_release' },
  { id: 'rlq-3', title: 'Annual SaaS renewal', amount: '$4,800', approvedBy: 'Finance', approvedAt: 'Feb 13', releaseAuthority: 'Ops', auditNote: 'Pre-approved in budget', rail: 'Card', status: 'released' },
];

// =============================================================================
// TRANSACTION STATE MACHINE
// =============================================================================

export const RAILS_TXN_STATES = [
  'Draft', 'Proposed', 'Rule-Checked', 'Authorized', 'Scheduled',
  'Released', 'In Flight', 'Settled', 'Held', 'Failed',
  'Disputed', 'Returned', 'Reversed',
] as const;
export type RailsTxnState = typeof RAILS_TXN_STATES[number];

// =============================================================================
// RETURN ITEMS (for Disputes & Returns tab)
// =============================================================================

export interface ReturnItem {
  id: string;
  title: string;
  amount: string;
  counterparty: string;
  returnDate: string;
  reason: string;
  status: 'pending' | 'processed' | 'credited';
}

export const RETURN_ITEMS: ReturnItem[] = [
  { id: 'ret-1', title: 'ACH Return — Studio Noir Creative', amount: '$6,800.00', counterparty: 'Studio Noir Creative', returnDate: 'Feb 16, 2026', reason: 'Invalid Account', status: 'pending' },
  { id: 'ret-2', title: 'Wire Return — Duplicate Payment', amount: '$3,210.44', counterparty: 'Amazon Web Services', returnDate: 'Feb 12, 2026', reason: 'Duplicate', status: 'processed' },
  { id: 'ret-3', title: 'Card Refund — ToolStack Subscription', amount: '$299.00', counterparty: 'ToolStack Inc', returnDate: 'Feb 10, 2026', reason: 'Unauthorized Charge', status: 'credited' },
];

// =============================================================================
// HELPER: Status label mapping for display
// =============================================================================

export function nowStatusLabel(status: NowItem['status']): string {
  switch (status) {
    case 'processing': return 'Processing';
    case 'pending_approval': return 'Pending Approval';
    case 'scheduled': return 'Scheduled';
    case 'failed': return 'Failed';
    default: return status;
  }
}

export function batchStatusLabel(status: PayoutBatch['status']): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'pending_approval': return 'Pending Approval';
    case 'approved': return 'Approved';
    case 'processing': return 'Processing';
    case 'settled': return 'Settled';
    default: return status;
  }
}

export function approvalStatusLabel(status: RailsApproval['status']): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default: return status;
  }
}

export function exceptionTypeLabel(type: ExceptionItem['type']): string {
  switch (type) {
    case 'return': return 'Return';
    case 'nsf': return 'NSF';
    case 'fraud_flag': return 'Fraud Flag';
    case 'duplicate': return 'Duplicate';
    case 'limit_breach': return 'Limit Breach';
    default: return type;
  }
}

export function disputeStatusLabel(status: DisputeItem['status']): string {
  switch (status) {
    case 'open': return 'Open';
    case 'under_review': return 'Under Review';
    case 'resolved': return 'Resolved';
    case 'escalated': return 'Escalated';
    default: return status;
  }
}

export function walletStatusLabel(status: WalletAccount['status']): string {
  switch (status) {
    case 'connected': return 'Connected';
    case 'limited': return 'Limited';
    case 'offline': return 'Offline';
    default: return status;
  }
}

export function walletTypeLabel(type: WalletAccount['type']): string {
  switch (type) {
    case 'checking': return 'Checking';
    case 'savings': return 'Savings';
    case 'treasury': return 'Treasury';
    case 'crypto': return 'Crypto';
    default: return type;
  }
}

export function adminSettingTypeIcon(type: AdminSetting['type']): string {
  switch (type) {
    case 'toggle': return 'switch.2';
    case 'threshold': return 'dollarsign.circle';
    case 'text': return 'text.alignleft';
    default: return 'gear';
  }
}

export function returnStatusLabel(status: ReturnItem['status']): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'processed': return 'Processed';
    case 'credited': return 'Credited';
    default: return status;
  }
}

/**
 * Map a NowItem status to a TXN state machine label for badge display.
 */
export function nowItemTxnState(status: NowItem['status']): RailsTxnState {
  switch (status) {
    case 'processing': return 'In Flight';
    case 'pending_approval': return 'Proposed';
    case 'scheduled': return 'Scheduled';
    case 'failed': return 'Failed';
    default: return 'Draft';
  }
}

/**
 * Map a ReleaseQueueItem status to a TXN state machine label.
 */
export function releaseQueueTxnState(status: ReleaseQueueItem['status']): RailsTxnState {
  switch (status) {
    case 'awaiting_release': return 'Authorized';
    case 'released': return 'Released';
    default: return 'Draft';
  }
}
