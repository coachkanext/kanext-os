/**
 * Competition Organization Payment Rails — Mock Data
 * 10-tab Payment Rails Hub for competition org management.
 * Accounts, transactions, payouts, invoices, fees, reconciliation,
 * disputes, reports, settings — all scoped to 2819 Church competition org.
 */

// =============================================================================
// TYPES
// =============================================================================

export type CompRailsTabId =
  | 'dashboard'
  | 'accounts'
  | 'transactions'
  | 'payouts'
  | 'invoices'
  | 'fees'
  | 'reconciliation'
  | 'disputes'
  | 'reports'
  | 'settings';

export interface CompRailsTab {
  id: CompRailsTabId;
  label: string;
  icon: string;
}

export interface RailsDashboardBlock {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  color: string;
}

export interface PaymentAccount {
  id: string;
  name: string;
  type: 'operating' | 'escrow' | 'prize-fund' | 'sponsor-holding' | 'petty-cash';
  bank: string;
  accountLast4: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'pending-verification';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  account: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
}

export interface PayoutBatch {
  id: string;
  name: string;
  date: string;
  totalAmount: number;
  recipientCount: number;
  status: 'draft' | 'approved' | 'processing' | 'completed' | 'failed';
  type: 'prize' | 'official' | 'vendor' | 'refund';
}

export interface Invoice {
  id: string;
  number: string;
  recipient: string;
  amount: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: string[];
}

export interface FeeSchedule {
  id: string;
  name: string;
  type: 'entry-fee' | 'registration' | 'licensing' | 'facility' | 'broadcast';
  amount: number;
  frequency: 'per-event' | 'per-season' | 'annual' | 'one-time';
  appliesTo: string;
}

export interface ReconciliationEntry {
  id: string;
  date: string;
  account: string;
  expectedBalance: number;
  actualBalance: number;
  variance: number;
  status: 'matched' | 'variance' | 'pending';
}

export interface Dispute {
  id: string;
  date: string;
  transaction: string;
  amount: number;
  reason: string;
  status: 'open' | 'under-review' | 'resolved' | 'escalated';
  claimant: string;
}

export interface RailsReport {
  id: string;
  name: string;
  type: string;
  period: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  generatedDate: string;
}

export interface RailsSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface CompRailsData {
  dashboard: RailsDashboardBlock[];
  accounts: PaymentAccount[];
  transactions: Transaction[];
  payouts: PayoutBatch[];
  invoices: Invoice[];
  fees: FeeSchedule[];
  reconciliation: ReconciliationEntry[];
  disputes: Dispute[];
  reports: RailsReport[];
  settings: RailsSettingToggle[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const COMP_RAILS_TABS: CompRailsTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart.bar.fill' },
  { id: 'accounts', label: 'Accounts', icon: 'building.columns.fill' },
  { id: 'transactions', label: 'Transactions', icon: 'arrow.left.arrow.right' },
  { id: 'payouts', label: 'Payouts', icon: 'arrow.up.circle.fill' },
  { id: 'invoices', label: 'Invoices', icon: 'doc.text.fill' },
  { id: 'fees', label: 'Fees', icon: 'dollarsign.circle.fill' },
  { id: 'reconciliation', label: 'Reconciliation', icon: 'checkmark.circle.fill' },
  { id: 'disputes', label: 'Disputes', icon: 'exclamationmark.triangle.fill' },
  { id: 'reports', label: 'Reports', icon: 'chart.line.uptrend.xyaxis' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

export const COMP_RAILS_SCOPE_CHIPS = [
  'All Rails',
  'Accounts',
  'Transactions',
  'Payouts',
  'Invoices',
];

// =============================================================================
// STATUS COLORS
// =============================================================================

export const ACCOUNT_STATUS_COLOR: Record<PaymentAccount['status'], string> = {
  active: '#5A8A6E',
  frozen: '#B85C5C',
  'pending-verification': '#B8943E',
};

export const TRANSACTION_STATUS_COLOR: Record<Transaction['status'], string> = {
  completed: '#5A8A6E',
  pending: '#B8943E',
  failed: '#B85C5C',
  reversed: '#9C9790',
};

export const PAYOUT_STATUS_COLOR: Record<PayoutBatch['status'], string> = {
  draft: '#9C9790',
  approved: '#1A1714',
  processing: '#B8943E',
  completed: '#5A8A6E',
  failed: '#B85C5C',
};

export const INVOICE_STATUS_COLOR: Record<Invoice['status'], string> = {
  draft: '#9C9790',
  sent: '#1A1714',
  paid: '#5A8A6E',
  overdue: '#B85C5C',
  cancelled: '#9C9790',
};

export const DISPUTE_STATUS_COLOR: Record<Dispute['status'], string> = {
  open: '#B8943E',
  'under-review': '#1A1714',
  resolved: '#5A8A6E',
  escalated: '#B85C5C',
};

export const REPORT_FORMAT_COLOR: Record<RailsReport['format'], string> = {
  PDF: '#1A1714',
  CSV: '#5A8A6E',
  XLSX: '#B8943E',
};

// =============================================================================
// HELPERS
// =============================================================================

export function formatCurrency(amount: number): string {
  return '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =============================================================================
// DASHBOARD BLOCKS
// =============================================================================

const DASHBOARD_BLOCKS: RailsDashboardBlock[] = [
  { id: 'cr-dash-1', label: 'Total Balance', value: '$2,040,000.00', delta: '+3.2%', icon: 'banknote.fill', color: '#5A8A6E' },
  { id: 'cr-dash-2', label: 'Transaction Volume', value: '$487,320.00', delta: '+12.8%', icon: 'arrow.left.arrow.right', color: '#1A1714' },
  { id: 'cr-dash-3', label: 'Pending Payouts', value: '$78,500.00', delta: '-5.1%', icon: 'clock.fill', color: '#B8943E' },
  { id: 'cr-dash-4', label: 'Open Disputes', value: '4', delta: '+1', icon: 'exclamationmark.triangle.fill', color: '#B85C5C' },
  { id: 'cr-dash-5', label: 'Outstanding Invoices', value: '$156,800.00', delta: '+8.4%', icon: 'doc.text.fill', color: '#1A1714' },
  { id: 'cr-dash-6', label: 'Monthly Revenue', value: '$312,450.00', delta: '+18.2%', icon: 'chart.line.uptrend.xyaxis', color: '#1A1714' },
];

// =============================================================================
// ACCOUNTS
// =============================================================================

const ACCOUNTS: PaymentAccount[] = [
  {
    id: 'cr-acct-1',
    name: '2819 Church Operating Account',
    type: 'operating',
    bank: 'JPMorgan Chase',
    accountLast4: '4892',
    balance: 1200000.00,
    currency: 'USD',
    status: 'active',
  },
  {
    id: 'cr-acct-2',
    name: 'Prize Fund Escrow',
    type: 'prize-fund',
    bank: 'Wells Fargo',
    accountLast4: '7231',
    balance: 500000.00,
    currency: 'USD',
    status: 'active',
  },
  {
    id: 'cr-acct-3',
    name: 'Sponsor Holding',
    type: 'sponsor-holding',
    bank: 'Bank of America',
    accountLast4: '1056',
    balance: 340000.00,
    currency: 'USD',
    status: 'active',
  },
  {
    id: 'cr-acct-4',
    name: 'Facility Deposits Escrow',
    type: 'escrow',
    bank: 'US Bank',
    accountLast4: '8834',
    balance: 185000.00,
    currency: 'USD',
    status: 'active',
  },
  {
    id: 'cr-acct-5',
    name: 'Event Petty Cash',
    type: 'petty-cash',
    bank: 'Regions Bank',
    accountLast4: '3317',
    balance: 12500.00,
    currency: 'USD',
    status: 'active',
  },
  {
    id: 'cr-acct-6',
    name: 'Broadcast Revenue Hold',
    type: 'sponsor-holding',
    bank: 'Citibank',
    accountLast4: '6629',
    balance: 0,
    currency: 'USD',
    status: 'pending-verification',
  },
];

// =============================================================================
// TRANSACTIONS
// =============================================================================

const TRANSACTIONS: Transaction[] = [
  {
    id: 'cr-txn-1',
    date: 'Feb 15, 2026',
    description: 'Nike Sponsorship Payment — Q1 Installment',
    amount: 125000.00,
    type: 'credit',
    category: 'Sponsorship',
    account: 'Sponsor Holding',
    reference: 'NIK-Q1-2026-001',
    status: 'completed',
  },
  {
    id: 'cr-txn-2',
    date: 'Feb 14, 2026',
    description: 'Gatorade Hydration Partnership — Event Series',
    amount: 45000.00,
    type: 'credit',
    category: 'Sponsorship',
    account: 'Sponsor Holding',
    reference: 'GAT-EVT-2026-012',
    status: 'completed',
  },
  {
    id: 'cr-txn-3',
    date: 'Feb 14, 2026',
    description: '3SSB Arena Facility Rental — Championship Weekend',
    amount: 32000.00,
    type: 'debit',
    category: 'Facility',
    account: '2819 Church Operating Account',
    reference: '3SSB-FAC-2026-008',
    status: 'completed',
  },
  {
    id: 'cr-txn-4',
    date: 'Feb 13, 2026',
    description: 'Officials Pool — Region 3 Tournament',
    amount: 18500.00,
    type: 'debit',
    category: 'Officials',
    account: '2819 Church Operating Account',
    reference: 'OFF-R3T-2026-004',
    status: 'completed',
  },
  {
    id: 'cr-txn-5',
    date: 'Feb 12, 2026',
    description: 'Team Entry Fees — Spring Showcase (24 teams)',
    amount: 72000.00,
    type: 'credit',
    category: 'Entry Fees',
    account: '2819 Church Operating Account',
    reference: 'ENT-SS-2026-024',
    status: 'completed',
  },
  {
    id: 'cr-txn-6',
    date: 'Feb 11, 2026',
    description: 'ESPN+ Broadcast Rights — February Events',
    amount: 85000.00,
    type: 'credit',
    category: 'Broadcast',
    account: '2819 Church Operating Account',
    reference: 'ESPN-FEB-2026-001',
    status: 'completed',
  },
  {
    id: 'cr-txn-7',
    date: 'Feb 10, 2026',
    description: 'AV Production Services — Livestream Package',
    amount: 14200.00,
    type: 'debit',
    category: 'Production',
    account: '2819 Church Operating Account',
    reference: 'AV-LS-2026-007',
    status: 'completed',
  },
  {
    id: 'cr-txn-8',
    date: 'Feb 9, 2026',
    description: 'Prize Pool Deposit — National Championship',
    amount: 250000.00,
    type: 'credit',
    category: 'Prize Fund',
    account: 'Prize Fund Escrow',
    reference: 'PZF-NC-2026-001',
    status: 'completed',
  },
  {
    id: 'cr-txn-9',
    date: 'Feb 8, 2026',
    description: 'Under Armour Equipment Grant — Competition Gear',
    amount: 38000.00,
    type: 'credit',
    category: 'Sponsorship',
    account: 'Sponsor Holding',
    reference: 'UA-EQ-2026-003',
    status: 'pending',
  },
  {
    id: 'cr-txn-10',
    date: 'Feb 7, 2026',
    description: 'Catering — All-Star Weekend Hospitality',
    amount: 8750.00,
    type: 'debit',
    category: 'Hospitality',
    account: '2819 Church Operating Account',
    reference: 'CAT-ASW-2026-001',
    status: 'completed',
  },
  {
    id: 'cr-txn-11',
    date: 'Feb 6, 2026',
    description: 'Insurance Premium — Event Liability Coverage',
    amount: 22000.00,
    type: 'debit',
    category: 'Insurance',
    account: '2819 Church Operating Account',
    reference: 'INS-ELC-2026-Q1',
    status: 'completed',
  },
  {
    id: 'cr-txn-12',
    date: 'Feb 5, 2026',
    description: 'Ticket Revenue — Rivalry Weekend (3 venues)',
    amount: 67800.00,
    type: 'credit',
    category: 'Ticketing',
    account: '2819 Church Operating Account',
    reference: 'TKT-RW-2026-003',
    status: 'completed',
  },
  {
    id: 'cr-txn-13',
    date: 'Feb 4, 2026',
    description: 'Travel Reimbursement — Commissioner Staff',
    amount: 4350.00,
    type: 'debit',
    category: 'Travel',
    account: '2819 Church Operating Account',
    reference: 'TRV-CS-2026-FEB',
    status: 'failed',
  },
  {
    id: 'cr-txn-14',
    date: 'Feb 3, 2026',
    description: 'Membership Dues — Conference Affiliates (8 orgs)',
    amount: 24000.00,
    type: 'credit',
    category: 'Membership',
    account: '2819 Church Operating Account',
    reference: 'MEM-CA-2026-008',
    status: 'completed',
  },
  {
    id: 'cr-txn-15',
    date: 'Feb 2, 2026',
    description: 'Refund — Cancelled Exhibition Event',
    amount: 15000.00,
    type: 'debit',
    category: 'Refund',
    account: '2819 Church Operating Account',
    reference: 'REF-EXH-2026-001',
    status: 'reversed',
  },
];

// =============================================================================
// PAYOUT BATCHES
// =============================================================================

const PAYOUTS: PayoutBatch[] = [
  {
    id: 'cr-po-1',
    name: 'Championship Prize Distribution — Tier 1',
    date: 'Feb 16, 2026',
    totalAmount: 150000.00,
    recipientCount: 4,
    status: 'approved',
    type: 'prize',
  },
  {
    id: 'cr-po-2',
    name: 'Officials Payment — Region 3 Tournament',
    date: 'Feb 14, 2026',
    totalAmount: 18500.00,
    recipientCount: 12,
    status: 'completed',
    type: 'official',
  },
  {
    id: 'cr-po-3',
    name: 'AV Production Vendor — February Events',
    date: 'Feb 13, 2026',
    totalAmount: 14200.00,
    recipientCount: 1,
    status: 'completed',
    type: 'vendor',
  },
  {
    id: 'cr-po-4',
    name: 'Spring Showcase Prize Pool',
    date: 'Feb 18, 2026',
    totalAmount: 60000.00,
    recipientCount: 8,
    status: 'draft',
    type: 'prize',
  },
  {
    id: 'cr-po-5',
    name: 'Officials Payment — Conference Play Week 6',
    date: 'Feb 12, 2026',
    totalAmount: 9200.00,
    recipientCount: 8,
    status: 'completed',
    type: 'official',
  },
  {
    id: 'cr-po-6',
    name: 'Cancelled Exhibition Refund Batch',
    date: 'Feb 10, 2026',
    totalAmount: 15000.00,
    recipientCount: 3,
    status: 'processing',
    type: 'refund',
  },
  {
    id: 'cr-po-7',
    name: 'Facility Vendor — 3SSB Arena Services',
    date: 'Feb 15, 2026',
    totalAmount: 32000.00,
    recipientCount: 1,
    status: 'completed',
    type: 'vendor',
  },
  {
    id: 'cr-po-8',
    name: 'All-Star Weekend Catering Vendor',
    date: 'Feb 8, 2026',
    totalAmount: 8750.00,
    recipientCount: 1,
    status: 'completed',
    type: 'vendor',
  },
  {
    id: 'cr-po-9',
    name: 'Officials Payment — Showcase Day 1',
    date: 'Feb 19, 2026',
    totalAmount: 6400.00,
    recipientCount: 6,
    status: 'draft',
    type: 'official',
  },
  {
    id: 'cr-po-10',
    name: 'Rivalry Weekend Prize Payout',
    date: 'Feb 6, 2026',
    totalAmount: 25000.00,
    recipientCount: 2,
    status: 'completed',
    type: 'prize',
  },
  {
    id: 'cr-po-11',
    name: 'Insurance Premium — Quarterly',
    date: 'Feb 7, 2026',
    totalAmount: 22000.00,
    recipientCount: 1,
    status: 'completed',
    type: 'vendor',
  },
  {
    id: 'cr-po-12',
    name: 'Commissioner Staff Travel Reimburse',
    date: 'Feb 20, 2026',
    totalAmount: 4350.00,
    recipientCount: 3,
    status: 'failed',
    type: 'vendor',
  },
];

// =============================================================================
// INVOICES
// =============================================================================

const INVOICES: Invoice[] = [
  {
    id: 'cr-inv-1',
    number: 'INV-2026-0201',
    recipient: 'Nike Inc.',
    amount: 125000.00,
    dueDate: 'Mar 1, 2026',
    status: 'paid',
    items: ['Q1 Sponsorship Installment', 'Logo placement rights'],
  },
  {
    id: 'cr-inv-2',
    number: 'INV-2026-0202',
    recipient: 'Gatorade / PepsiCo',
    amount: 45000.00,
    dueDate: 'Feb 28, 2026',
    status: 'paid',
    items: ['Event Series Hydration Partnership', 'Sideline branding'],
  },
  {
    id: 'cr-inv-3',
    number: 'INV-2026-0203',
    recipient: 'ESPN / Disney',
    amount: 85000.00,
    dueDate: 'Feb 15, 2026',
    status: 'paid',
    items: ['February broadcast rights package', 'Digital streaming sublicense'],
  },
  {
    id: 'cr-inv-4',
    number: 'INV-2026-0204',
    recipient: 'Under Armour',
    amount: 38000.00,
    dueDate: 'Feb 20, 2026',
    status: 'sent',
    items: ['Equipment grant — Competition gear', 'Apparel sponsorship'],
  },
  {
    id: 'cr-inv-5',
    number: 'INV-2026-0205',
    recipient: '3SSB Arena Management',
    amount: 32000.00,
    dueDate: 'Feb 14, 2026',
    status: 'paid',
    items: ['Championship Weekend facility rental', 'Setup & teardown crew'],
  },
  {
    id: 'cr-inv-6',
    number: 'INV-2026-0206',
    recipient: 'Spalding / Wilson',
    amount: 18500.00,
    dueDate: 'Mar 5, 2026',
    status: 'sent',
    items: ['Game ball supply — Spring series', 'Equipment maintenance agreement'],
  },
  {
    id: 'cr-inv-7',
    number: 'INV-2026-0207',
    recipient: 'State Farm Insurance',
    amount: 22000.00,
    dueDate: 'Feb 28, 2026',
    status: 'overdue',
    items: ['Event liability coverage — Q1 premium'],
  },
  {
    id: 'cr-inv-8',
    number: 'INV-2026-0208',
    recipient: 'AV Live Productions',
    amount: 14200.00,
    dueDate: 'Feb 10, 2026',
    status: 'paid',
    items: ['Livestream package — 6 events', 'Camera crew & graphics'],
  },
  {
    id: 'cr-inv-9',
    number: 'INV-2026-0209',
    recipient: 'Daktronics Scoreboard Services',
    amount: 9800.00,
    dueDate: 'Mar 10, 2026',
    status: 'draft',
    items: ['LED scoreboard rental — 4 venues', 'Technician support'],
  },
  {
    id: 'cr-inv-10',
    number: 'INV-2026-0210',
    recipient: 'Conference Affiliate — Region 1',
    amount: 3000.00,
    dueDate: 'Feb 1, 2026',
    status: 'paid',
    items: ['Annual membership dues'],
  },
  {
    id: 'cr-inv-11',
    number: 'INV-2026-0211',
    recipient: 'Conference Affiliate — Region 2',
    amount: 3000.00,
    dueDate: 'Feb 1, 2026',
    status: 'paid',
    items: ['Annual membership dues'],
  },
  {
    id: 'cr-inv-12',
    number: 'INV-2026-0212',
    recipient: 'Conference Affiliate — Region 3',
    amount: 3000.00,
    dueDate: 'Feb 1, 2026',
    status: 'paid',
    items: ['Annual membership dues'],
  },
  {
    id: 'cr-inv-13',
    number: 'INV-2026-0213',
    recipient: 'Chick-fil-A Catering',
    amount: 8750.00,
    dueDate: 'Feb 8, 2026',
    status: 'paid',
    items: ['All-Star Weekend hospitality catering'],
  },
  {
    id: 'cr-inv-14',
    number: 'INV-2026-0214',
    recipient: 'Adidas Grassroots',
    amount: 28000.00,
    dueDate: 'Mar 15, 2026',
    status: 'sent',
    items: ['Grassroots event co-sponsorship', 'Player showcase branding'],
  },
  {
    id: 'cr-inv-15',
    number: 'INV-2026-0215',
    recipient: 'Cancelled Exhibition Org',
    amount: 15000.00,
    dueDate: 'Feb 2, 2026',
    status: 'cancelled',
    items: ['Exhibition event entry — voided'],
  },
];

// =============================================================================
// FEE SCHEDULES
// =============================================================================

const FEES: FeeSchedule[] = [
  {
    id: 'cr-fee-1',
    name: 'Team Entry Fee — Showcase Events',
    type: 'entry-fee',
    amount: 3000.00,
    frequency: 'per-event',
    appliesTo: 'All participating teams',
  },
  {
    id: 'cr-fee-2',
    name: 'Team Entry Fee — Championship',
    type: 'entry-fee',
    amount: 5000.00,
    frequency: 'per-event',
    appliesTo: 'Qualified championship teams',
  },
  {
    id: 'cr-fee-3',
    name: 'Annual Organization Registration',
    type: 'registration',
    amount: 7500.00,
    frequency: 'annual',
    appliesTo: 'All member organizations',
  },
  {
    id: 'cr-fee-4',
    name: 'Coach Licensing Fee',
    type: 'licensing',
    amount: 500.00,
    frequency: 'annual',
    appliesTo: 'All registered head coaches',
  },
  {
    id: 'cr-fee-5',
    name: 'Official Certification Fee',
    type: 'licensing',
    amount: 250.00,
    frequency: 'annual',
    appliesTo: 'All certified officials',
  },
  {
    id: 'cr-fee-6',
    name: 'Primary Venue Rental — Per Event Day',
    type: 'facility',
    amount: 8000.00,
    frequency: 'per-event',
    appliesTo: 'Host venues (primary)',
  },
  {
    id: 'cr-fee-7',
    name: 'Secondary Venue Rental — Per Event Day',
    type: 'facility',
    amount: 4500.00,
    frequency: 'per-event',
    appliesTo: 'Host venues (secondary)',
  },
  {
    id: 'cr-fee-8',
    name: 'Broadcast Rights Fee — National Events',
    type: 'broadcast',
    amount: 25000.00,
    frequency: 'per-event',
    appliesTo: 'National broadcast partners',
  },
  {
    id: 'cr-fee-9',
    name: 'Broadcast Rights Fee — Regional Events',
    type: 'broadcast',
    amount: 8000.00,
    frequency: 'per-event',
    appliesTo: 'Regional broadcast partners',
  },
  {
    id: 'cr-fee-10',
    name: 'Season Registration — Conference Affiliate',
    type: 'registration',
    amount: 3000.00,
    frequency: 'per-season',
    appliesTo: 'Conference affiliates',
  },
  {
    id: 'cr-fee-11',
    name: 'Transfer Portal Processing Fee',
    type: 'registration',
    amount: 150.00,
    frequency: 'per-event',
    appliesTo: 'Teams submitting roster changes',
  },
  {
    id: 'cr-fee-12',
    name: 'Facility Damage Deposit',
    type: 'facility',
    amount: 5000.00,
    frequency: 'per-event',
    appliesTo: 'All host venues',
  },
  {
    id: 'cr-fee-13',
    name: 'Digital Streaming Sublicense',
    type: 'broadcast',
    amount: 15000.00,
    frequency: 'per-season',
    appliesTo: 'Streaming platform partners',
  },
];

// =============================================================================
// RECONCILIATION
// =============================================================================

const RECONCILIATION: ReconciliationEntry[] = [
  {
    id: 'cr-rec-1',
    date: 'Feb 15, 2026',
    account: '2819 Church Operating Account',
    expectedBalance: 1200000.00,
    actualBalance: 1200000.00,
    variance: 0,
    status: 'matched',
  },
  {
    id: 'cr-rec-2',
    date: 'Feb 15, 2026',
    account: 'Prize Fund Escrow',
    expectedBalance: 500000.00,
    actualBalance: 500000.00,
    variance: 0,
    status: 'matched',
  },
  {
    id: 'cr-rec-3',
    date: 'Feb 15, 2026',
    account: 'Sponsor Holding',
    expectedBalance: 340000.00,
    actualBalance: 338750.00,
    variance: -1250.00,
    status: 'variance',
  },
  {
    id: 'cr-rec-4',
    date: 'Feb 15, 2026',
    account: 'Facility Deposits Escrow',
    expectedBalance: 185000.00,
    actualBalance: 185000.00,
    variance: 0,
    status: 'matched',
  },
  {
    id: 'cr-rec-5',
    date: 'Feb 15, 2026',
    account: 'Event Petty Cash',
    expectedBalance: 12500.00,
    actualBalance: 12385.00,
    variance: -115.00,
    status: 'variance',
  },
  {
    id: 'cr-rec-6',
    date: 'Feb 15, 2026',
    account: 'Broadcast Revenue Hold',
    expectedBalance: 0,
    actualBalance: 0,
    variance: 0,
    status: 'pending',
  },
  {
    id: 'cr-rec-7',
    date: 'Feb 8, 2026',
    account: '2819 Church Operating Account',
    expectedBalance: 1145200.00,
    actualBalance: 1145200.00,
    variance: 0,
    status: 'matched',
  },
  {
    id: 'cr-rec-8',
    date: 'Feb 8, 2026',
    account: 'Prize Fund Escrow',
    expectedBalance: 250000.00,
    actualBalance: 250000.00,
    variance: 0,
    status: 'matched',
  },
  {
    id: 'cr-rec-9',
    date: 'Feb 8, 2026',
    account: 'Sponsor Holding',
    expectedBalance: 168000.00,
    actualBalance: 168000.00,
    variance: 0,
    status: 'matched',
  },
  {
    id: 'cr-rec-10',
    date: 'Feb 1, 2026',
    account: '2819 Church Operating Account',
    expectedBalance: 1082400.00,
    actualBalance: 1082400.00,
    variance: 0,
    status: 'matched',
  },
  {
    id: 'cr-rec-11',
    date: 'Feb 1, 2026',
    account: 'Prize Fund Escrow',
    expectedBalance: 250000.00,
    actualBalance: 250000.00,
    variance: 0,
    status: 'matched',
  },
  {
    id: 'cr-rec-12',
    date: 'Feb 1, 2026',
    account: 'Sponsor Holding',
    expectedBalance: 130000.00,
    actualBalance: 130000.00,
    variance: 0,
    status: 'matched',
  },
];

// =============================================================================
// DISPUTES
// =============================================================================

const DISPUTES: Dispute[] = [
  {
    id: 'cr-dsp-1',
    date: 'Feb 14, 2026',
    transaction: 'REF-EXH-2026-001',
    amount: 15000.00,
    reason: 'Cancelled exhibition — organizer claims partial fulfillment of services',
    status: 'open',
    claimant: 'Metro Exhibition Group',
  },
  {
    id: 'cr-dsp-2',
    date: 'Feb 11, 2026',
    transaction: 'OFF-R3T-2026-004',
    amount: 2400.00,
    reason: 'Officials dispute: 2 officials claim underpayment for overtime games',
    status: 'under-review',
    claimant: 'Region 3 Officials Association',
  },
  {
    id: 'cr-dsp-3',
    date: 'Feb 9, 2026',
    transaction: 'TKT-RW-2026-003',
    amount: 850.00,
    reason: 'Ticket purchaser requests refund — venue change not communicated',
    status: 'resolved',
    claimant: 'Williams Family (ticket holder)',
  },
  {
    id: 'cr-dsp-4',
    date: 'Feb 7, 2026',
    transaction: 'ENT-SS-2026-024',
    amount: 3000.00,
    reason: 'Team withdrew after entry fee paid — requests full refund',
    status: 'escalated',
    claimant: 'Coastal Academy',
  },
  {
    id: 'cr-dsp-5',
    date: 'Feb 5, 2026',
    transaction: 'CAT-ASW-2026-001',
    amount: 1200.00,
    reason: 'Catering shortfall — 20% of order not delivered',
    status: 'under-review',
    claimant: '2819 Church Hospitality Dept',
  },
  {
    id: 'cr-dsp-6',
    date: 'Feb 3, 2026',
    transaction: 'AV-LS-2026-007',
    amount: 3500.00,
    reason: 'Livestream quality issues — 2 events had significant downtime',
    status: 'open',
    claimant: '2819 Church Broadcast Division',
  },
  {
    id: 'cr-dsp-7',
    date: 'Feb 1, 2026',
    transaction: '3SSB-FAC-2026-008',
    amount: 5000.00,
    reason: 'Facility damage deposit not returned — claims no damage occurred',
    status: 'under-review',
    claimant: '3SSB Arena Management',
  },
  {
    id: 'cr-dsp-8',
    date: 'Jan 28, 2026',
    transaction: 'MEM-CA-2026-008',
    amount: 3000.00,
    reason: 'Affiliate membership fee dispute — claims reduced services',
    status: 'resolved',
    claimant: 'Southeast Conference Affiliate',
  },
  {
    id: 'cr-dsp-9',
    date: 'Jan 25, 2026',
    transaction: 'UA-EQ-2026-003',
    amount: 8000.00,
    reason: 'Equipment shipment incomplete — missing items from grant order',
    status: 'open',
    claimant: '2819 Church Equipment Manager',
  },
  {
    id: 'cr-dsp-10',
    date: 'Jan 22, 2026',
    transaction: 'INS-ELC-2026-Q1',
    amount: 4400.00,
    reason: 'Premium overcharge — rate increase not agreed upon',
    status: 'escalated',
    claimant: '2819 Church Finance Office',
  },
  {
    id: 'cr-dsp-11',
    date: 'Jan 20, 2026',
    transaction: 'TRV-CS-2026-FEB',
    amount: 1100.00,
    reason: 'Travel reimbursement denied — receipts not itemized',
    status: 'resolved',
    claimant: 'Commissioner Staff Member',
  },
  {
    id: 'cr-dsp-12',
    date: 'Jan 18, 2026',
    transaction: 'NIK-Q1-2026-001',
    amount: 12500.00,
    reason: 'Sponsorship deliverable dispute — logo placement smaller than contract',
    status: 'resolved',
    claimant: 'Nike Regional Rep',
  },
];

// =============================================================================
// REPORTS
// =============================================================================

const REPORTS: RailsReport[] = [
  {
    id: 'cr-rpt-1',
    name: 'Monthly Financial Summary — February 2026',
    type: 'Financial Summary',
    period: 'Feb 1 – Feb 15, 2026',
    format: 'PDF',
    generatedDate: 'Feb 15, 2026',
  },
  {
    id: 'cr-rpt-2',
    name: 'Transaction Ledger — February 2026',
    type: 'Transaction Report',
    period: 'Feb 1 – Feb 15, 2026',
    format: 'XLSX',
    generatedDate: 'Feb 15, 2026',
  },
  {
    id: 'cr-rpt-3',
    name: 'Payout Audit Trail — Q1 2026',
    type: 'Audit Report',
    period: 'Jan 1 – Feb 15, 2026',
    format: 'PDF',
    generatedDate: 'Feb 14, 2026',
  },
  {
    id: 'cr-rpt-4',
    name: 'Invoice Aging Report',
    type: 'Accounts Receivable',
    period: 'As of Feb 15, 2026',
    format: 'CSV',
    generatedDate: 'Feb 15, 2026',
  },
  {
    id: 'cr-rpt-5',
    name: 'Sponsorship Revenue Breakdown',
    type: 'Revenue Report',
    period: 'Jan 1 – Feb 15, 2026',
    format: 'PDF',
    generatedDate: 'Feb 13, 2026',
  },
  {
    id: 'cr-rpt-6',
    name: 'Fee Collection Summary — Spring Series',
    type: 'Collections Report',
    period: 'Feb 1 – Feb 15, 2026',
    format: 'XLSX',
    generatedDate: 'Feb 12, 2026',
  },
  {
    id: 'cr-rpt-7',
    name: 'Dispute Resolution Log',
    type: 'Dispute Report',
    period: 'Jan 1 – Feb 15, 2026',
    format: 'PDF',
    generatedDate: 'Feb 14, 2026',
  },
  {
    id: 'cr-rpt-8',
    name: 'Prize Fund Disbursement History',
    type: 'Payout Report',
    period: '2025-26 Season',
    format: 'XLSX',
    generatedDate: 'Feb 10, 2026',
  },
  {
    id: 'cr-rpt-9',
    name: 'Reconciliation Summary — All Accounts',
    type: 'Reconciliation Report',
    period: 'Feb 1 – Feb 15, 2026',
    format: 'CSV',
    generatedDate: 'Feb 15, 2026',
  },
  {
    id: 'cr-rpt-10',
    name: 'Officials Payment Register',
    type: 'Vendor Report',
    period: 'Jan 1 – Feb 15, 2026',
    format: 'XLSX',
    generatedDate: 'Feb 11, 2026',
  },
  {
    id: 'cr-rpt-11',
    name: 'Year-to-Date P&L Statement',
    type: 'Financial Summary',
    period: 'Jul 1, 2025 – Feb 15, 2026',
    format: 'PDF',
    generatedDate: 'Feb 15, 2026',
  },
  {
    id: 'cr-rpt-12',
    name: 'Broadcast Revenue Report',
    type: 'Revenue Report',
    period: '2025-26 Season',
    format: 'CSV',
    generatedDate: 'Feb 9, 2026',
  },
];

// =============================================================================
// SETTINGS
// =============================================================================

const SETTINGS: RailsSettingToggle[] = [
  {
    id: 'cr-set-1',
    label: 'Auto-approve payouts under $5,000',
    description: 'Payouts below threshold skip manual approval step',
    enabled: true,
  },
  {
    id: 'cr-set-2',
    label: 'Require dual authorization for transfers',
    description: 'Two authorized signers must approve inter-account transfers',
    enabled: true,
  },
  {
    id: 'cr-set-3',
    label: 'Auto-send invoice reminders',
    description: 'Send email reminders 7 days before due date and on due date',
    enabled: true,
  },
  {
    id: 'cr-set-4',
    label: 'Dispute auto-escalation after 14 days',
    description: 'Unresolved disputes automatically escalate after 14 calendar days',
    enabled: false,
  },
  {
    id: 'cr-set-5',
    label: 'Daily reconciliation alerts',
    description: 'Notify finance team when daily recon shows variance > $100',
    enabled: true,
  },
  {
    id: 'cr-set-6',
    label: 'Freeze account on failed transaction',
    description: 'Temporarily freeze account after 3 consecutive failed transactions',
    enabled: false,
  },
  {
    id: 'cr-set-7',
    label: 'Auto-generate monthly reports',
    description: 'Generate and email standard report package on the 1st of each month',
    enabled: true,
  },
  {
    id: 'cr-set-8',
    label: 'Prize fund release requires board vote',
    description: 'Prize fund escrow releases require recorded board vote approval',
    enabled: true,
  },
  {
    id: 'cr-set-9',
    label: 'Vendor payment hold for disputes',
    description: 'Hold vendor payments when active dispute exists for related transaction',
    enabled: false,
  },
  {
    id: 'cr-set-10',
    label: 'Real-time transaction notifications',
    description: 'Push notifications for all transactions above $1,000',
    enabled: true,
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getCompRailsData(_scope: string): CompRailsData {
  return {
    dashboard: DASHBOARD_BLOCKS,
    accounts: ACCOUNTS,
    transactions: TRANSACTIONS,
    payouts: PAYOUTS,
    invoices: INVOICES,
    fees: FEES,
    reconciliation: RECONCILIATION,
    disputes: DISPUTES,
    reports: REPORTS,
    settings: SETTINGS,
  };
}
