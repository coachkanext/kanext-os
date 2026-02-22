/**
 * Church Organization Payment Rails — Mock Data & Types
 * Money-movement execution layer: wallets, transactions, batches, approvals,
 * releases, exceptions, returns, receipts, and giving allocations.
 */

// =============================================================================
// TYPES
// =============================================================================

export type RailsStatus = 'green' | 'yellow' | 'red';

export type RailMethod =
  | 'ach'
  | 'card'
  | 'wire'
  | 'internal_transfer'
  | 'check';

export type TransactionState =
  | 'draft'
  | 'proposed'
  | 'rule_checked'
  | 'authorized'
  | 'scheduled'
  | 'released'
  | 'in_flight'
  | 'settled'
  | 'held'
  | 'failed'
  | 'returned'
  | 'disputed'
  | 'refunded';

export type BatchType =
  | 'reimbursement_run'
  | 'vendor_run'
  | 'benevolence_run'
  | 'event_payments'
  | 'staff_stipends'
  | 'missions_disbursement'
  | 'refund_run';

export type ExceptionType =
  | 'held'
  | 'failed'
  | 'returned'
  | 'disputed'
  | 'reversal';

export type ExceptionCause =
  | 'authority_rule'
  | 'budget_cap_rule'
  | 'eligibility_doc_rule'
  | 'compliance_rule'
  | 'processor_technical'
  | 'counterparty_bank';

export type FundType = 'general' | 'missions' | 'benevolence' | 'building' | 'youth';

// =============================================================================
// INTERFACES
// =============================================================================

export interface RailsHealthStatus {
  status: RailsStatus;
  connectedMethods: { method: RailMethod; active: boolean }[];
  nextSettlementWindow: string;
  holdsCount: number;
  failedCount24h: number;
  disputesCount: number;
  auditCompleteness: number;
}

export interface RailsWallet {
  id: string;
  name: string;
  fundType: FundType;
  available: number;
  committed: number;
  pendingInflows: number;
  pendingOutflows: number;
  allowedRails: RailMethod[];
  controls: string;
  exceptionsCount: number;
  linkedMinistries: string[];
}

export interface RailsTransaction {
  id: string;
  type: 'transfer' | 'batch_item' | 'reimbursement' | 'benevolence' | 'vendor' | 'payroll';
  amount: number;
  fromFund: FundType;
  toPayee: string;
  toPayeeMasked: boolean;
  state: TransactionState;
  method: RailMethod;
  impact: string;
  nextOwner: string;
  createdAt: string;
  deadline?: string;
  holdReason?: string;
  failReason?: string;
  batchId?: string;
  requestId?: string;
}

export interface RailsBatch {
  id: string;
  name: string;
  type: BatchType;
  recipientCount: number;
  totalAmount: number;
  state: TransactionState;
  approvalStatus: 'pending' | 'approved' | 'partial';
  exceptionsCount: number;
  scheduledWindow: string;
  items: RailsTransaction[];
}

export interface RailsApprovalItem {
  id: string;
  transactionId: string;
  amount: number;
  fund: FundType;
  category: string;
  requestor: string;
  owner: string;
  missingRequirements: string[];
  auditNote?: string;
}

export interface RailsReleaseItem {
  id: string;
  transactionId: string;
  amount: number;
  fund: FundType;
  method: RailMethod;
  approvedBy: string;
  scheduledTime?: string;
  requiresSecondApprover: boolean;
}

export interface RailsException {
  id: string;
  transactionId: string;
  type: ExceptionType;
  cause: ExceptionCause;
  causeLabel: string;
  failingRule: string;
  requiredFix: string;
  owner: string;
  escalationPath: string;
  evidence: string[];
  amount: number;
  fund: FundType;
  createdAt: string;
}

export interface RailsReturn {
  id: string;
  transactionId: string;
  amount: number;
  stage: 'received' | 'evidence_requested' | 'submitted' | 'resolved';
  aging: number;
  description: string;
  createdAt: string;
}

export interface RailsReceipt {
  id: string;
  transactionId: string;
  requestEvent: string;
  rulesApplied: string;
  approvalChain: string;
  releaseAuth: string;
  settlementRecord: string;
  ledgerPostings: string;
  amount: number;
  settledDate: string;
  immutable: boolean;
}

export interface GivingAllocation {
  id: string;
  donationId: string;
  totalAmount: number;
  allocations: { fund: FundType; amount: number; tag: string }[];
  date: string;
  donor: string;
}

// =============================================================================
// CONSTANTS / LABELS
// =============================================================================

export const RAILS_STATUS_COLORS: Record<RailsStatus, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

export const RAIL_METHOD_LABELS: Record<RailMethod, string> = {
  ach: 'ACH',
  card: 'Card',
  wire: 'Wire',
  internal_transfer: 'Internal Transfer',
  check: 'Check',
};

export const RAIL_METHOD_ICONS: Record<RailMethod, string> = {
  ach: 'building.columns.fill',
  card: 'creditcard.fill',
  wire: 'bolt.fill',
  internal_transfer: 'arrow.left.arrow.right',
  check: 'doc.text.fill',
};

export const TRANSACTION_STATE_LABELS: Record<TransactionState, string> = {
  draft: 'Draft',
  proposed: 'Proposed',
  rule_checked: 'Rule Checked',
  authorized: 'Authorized',
  scheduled: 'Scheduled',
  released: 'Released',
  in_flight: 'In Flight',
  settled: 'Settled',
  held: 'Held',
  failed: 'Failed',
  returned: 'Returned',
  disputed: 'Disputed',
  refunded: 'Refunded',
};

export const TRANSACTION_STATE_COLORS: Record<TransactionState, string> = {
  draft: '#A1A1AA',
  proposed: '#1D9BF0',
  rule_checked: '#1D9BF0',
  authorized: '#22C55E',
  scheduled: '#1D9BF0',
  released: '#22C55E',
  in_flight: '#F59E0B',
  settled: '#22C55E',
  held: '#F59E0B',
  failed: '#EF4444',
  returned: '#EF4444',
  disputed: '#EF4444',
  refunded: '#1D9BF0',
};

export const BATCH_TYPE_LABELS: Record<BatchType, string> = {
  reimbursement_run: 'Reimbursement Run',
  vendor_run: 'Vendor Run',
  benevolence_run: 'Benevolence Run',
  event_payments: 'Event Payments',
  staff_stipends: 'Staff Stipends',
  missions_disbursement: 'Missions Disbursement',
  refund_run: 'Refund Run',
};

export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  held: 'Held',
  failed: 'Failed',
  returned: 'Returned',
  disputed: 'Disputed',
  reversal: 'Reversal',
};

export const EXCEPTION_TYPE_COLORS: Record<ExceptionType, string> = {
  held: '#F59E0B',
  failed: '#EF4444',
  returned: '#EF4444',
  disputed: '#EF4444',
  reversal: '#1D9BF0',
};

export const EXCEPTION_CAUSE_LABELS: Record<ExceptionCause, string> = {
  authority_rule: 'Authority Rule',
  budget_cap_rule: 'Budget Cap Rule',
  eligibility_doc_rule: 'Eligibility Doc Rule',
  compliance_rule: 'Compliance Rule',
  processor_technical: 'Processor Technical',
  counterparty_bank: 'Counterparty Bank',
};

// =============================================================================
// RAILS HEALTH STATUS
// =============================================================================

const RAILS_HEALTH: RailsHealthStatus = {
  status: 'green',
  connectedMethods: [
    { method: 'ach', active: true },
    { method: 'card', active: true },
    { method: 'wire', active: true },
    { method: 'internal_transfer', active: true },
    { method: 'check', active: true },
  ],
  nextSettlementWindow: 'Today 4:00 PM',
  holdsCount: 2,
  failedCount24h: 1,
  disputesCount: 0,
  auditCompleteness: 91,
};

// =============================================================================
// WALLETS / FUNDS
// =============================================================================

const WALLETS: RailsWallet[] = [
  {
    id: 'wal-001',
    name: 'General Fund',
    fundType: 'general',
    available: 187450,
    committed: 23800,
    pendingInflows: 12500,
    pendingOutflows: 8200,
    allowedRails: ['ach', 'card', 'wire', 'internal_transfer', 'check'],
    controls: 'Standard dual-approval > $5,000; single approval under',
    exceptionsCount: 1,
    linkedMinistries: ['Administration', 'Worship', 'Operations'],
  },
  {
    id: 'wal-002',
    name: 'Missions Fund',
    fundType: 'missions',
    available: 42300,
    committed: 12000,
    pendingInflows: 3200,
    pendingOutflows: 12000,
    allowedRails: ['ach', 'wire', 'internal_transfer'],
    controls: 'Board approval required for disbursements > $3,000',
    exceptionsCount: 0,
    linkedMinistries: ['Missions Committee', 'Global Outreach'],
  },
  {
    id: 'wal-003',
    name: 'Benevolence Fund',
    fundType: 'benevolence',
    available: 18750,
    committed: 4200,
    pendingInflows: 1800,
    pendingOutflows: 1200,
    allowedRails: ['ach', 'card', 'check'],
    controls: 'Pastor approval + case documentation required',
    exceptionsCount: 1,
    linkedMinistries: ['Benevolence Committee', 'Deacon Board'],
  },
  {
    id: 'wal-004',
    name: 'Building Fund',
    fundType: 'building',
    available: 312800,
    committed: 45000,
    pendingInflows: 0,
    pendingOutflows: 8500,
    allowedRails: ['ach', 'wire', 'check'],
    controls: 'Board approval required; restricted to capital expenditures',
    exceptionsCount: 0,
    linkedMinistries: ['Facilities', 'Building Committee'],
  },
  {
    id: 'wal-005',
    name: 'Youth Fund',
    fundType: 'youth',
    available: 8900,
    committed: 3200,
    pendingInflows: 500,
    pendingOutflows: 1680,
    allowedRails: ['ach', 'card', 'internal_transfer'],
    controls: 'Youth Pastor approval; events budget capped at $2,000/event',
    exceptionsCount: 0,
    linkedMinistries: ['Youth Ministry', 'Young Adults'],
  },
];

// =============================================================================
// CONTROL TOWER TRANSACTIONS
// =============================================================================

const TRANSACTIONS: RailsTransaction[] = [
  // --- Needs Approval (3) ---
  {
    id: 'txn-001',
    type: 'vendor',
    amount: 1280,
    fromFund: 'youth',
    toPayee: 'Sunrise Event Rentals',
    toPayeeMasked: false,
    state: 'proposed',
    method: 'ach',
    impact: 'Youth retreat vendor invoice — due today',
    nextOwner: 'Youth Pastor Davis',
    createdAt: '2026-02-17',
    deadline: '2026-02-18',
  },
  {
    id: 'txn-002',
    type: 'vendor',
    amount: 185,
    fromFund: 'general',
    toPayee: 'Costco Business',
    toPayeeMasked: false,
    state: 'proposed',
    method: 'card',
    impact: 'Sunday coffee and refreshment supplies',
    nextOwner: 'Office Manager',
    createdAt: '2026-02-16',
  },
  {
    id: 'txn-003',
    type: 'vendor',
    amount: 8500,
    fromFund: 'building',
    toPayee: 'Metro Paving Co.',
    toPayeeMasked: false,
    state: 'proposed',
    method: 'check',
    impact: 'Parking lot resurfacing deposit — capital project',
    nextOwner: 'Church Treasurer',
    createdAt: '2026-02-15',
    deadline: '2026-02-25',
  },
  // --- Ready to Release (2) ---
  {
    id: 'txn-004',
    type: 'vendor',
    amount: 2850,
    fromFund: 'general',
    toPayee: 'AudioTech Solutions',
    toPayeeMasked: false,
    state: 'authorized',
    method: 'ach',
    impact: 'Soundboard repair — approved by Worship Director & Treasurer',
    nextOwner: 'Finance Secretary',
    createdAt: '2026-02-14',
  },
  {
    id: 'txn-005',
    type: 'reimbursement',
    amount: 4850,
    fromFund: 'general',
    toPayee: 'Reimbursement Run — 6 recipients',
    toPayeeMasked: false,
    state: 'authorized',
    method: 'ach',
    impact: 'February reimbursement batch ready for release',
    nextOwner: 'Finance Secretary',
    createdAt: '2026-02-16',
    batchId: 'bat-001',
  },
  // --- In Flight (2) ---
  {
    id: 'txn-006',
    type: 'transfer',
    amount: 4000,
    fromFund: 'missions',
    toPayee: 'Global Hope Ministries',
    toPayeeMasked: false,
    state: 'in_flight',
    method: 'ach',
    impact: 'Q1 missions disbursement — partial (1 of 3 partners)',
    nextOwner: 'ACH Processor',
    createdAt: '2026-02-15',
    batchId: 'bat-002',
  },
  {
    id: 'txn-007',
    type: 'payroll',
    amount: 3200,
    fromFund: 'general',
    toPayee: 'Staff Stipend Batch — 4 recipients',
    toPayeeMasked: true,
    state: 'in_flight',
    method: 'ach',
    impact: 'February staff stipend payments processing',
    nextOwner: 'ACH Processor',
    createdAt: '2026-02-16',
  },
  // --- Exceptions (3) ---
  {
    id: 'txn-008',
    type: 'transfer',
    amount: 450,
    fromFund: 'missions',
    toPayee: 'Community Outreach Partner',
    toPayeeMasked: false,
    state: 'returned',
    method: 'ach',
    impact: 'ACH return — invalid account number on file',
    nextOwner: 'Missions Coordinator',
    createdAt: '2026-02-14',
    failReason: 'R03 — No Account/Unable to Locate Account',
  },
  {
    id: 'txn-009',
    type: 'benevolence',
    amount: 1200,
    fromFund: 'benevolence',
    toPayee: 'J. D****',
    toPayeeMasked: true,
    state: 'held',
    method: 'check',
    impact: 'Benevolence case — held pending documentation',
    nextOwner: 'Pastor Michael',
    createdAt: '2026-02-16',
    holdReason: 'Missing case documentation and pastor approval letter',
  },
  {
    id: 'txn-010',
    type: 'vendor',
    amount: 2100,
    fromFund: 'general',
    toPayee: 'ProSound Equipment',
    toPayeeMasked: false,
    state: 'failed',
    method: 'ach',
    impact: 'Vendor payment failed — insufficient approval chain',
    nextOwner: 'Church Treasurer',
    createdAt: '2026-02-17',
    failReason: 'Requires second approver for amounts > $2,000',
  },
];

// =============================================================================
// BATCHES
// =============================================================================

const BATCHES: RailsBatch[] = [
  {
    id: 'bat-001',
    name: 'February Reimbursement Run',
    type: 'reimbursement_run',
    recipientCount: 6,
    totalAmount: 4850,
    state: 'authorized',
    approvalStatus: 'approved',
    exceptionsCount: 0,
    scheduledWindow: 'Today 4:00 PM',
    items: [
      {
        id: 'bat-001-i1',
        type: 'reimbursement',
        amount: 1250,
        fromFund: 'general',
        toPayee: 'Deacon James',
        toPayeeMasked: false,
        state: 'authorized',
        method: 'ach',
        impact: 'Conference travel reimbursement',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-10',
      },
      {
        id: 'bat-001-i2',
        type: 'reimbursement',
        amount: 340,
        fromFund: 'general',
        toPayee: 'Sister Martha',
        toPayeeMasked: false,
        state: 'authorized',
        method: 'ach',
        impact: 'Women\'s ministry supply receipts',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-11',
      },
      {
        id: 'bat-001-i3',
        type: 'reimbursement',
        amount: 890,
        fromFund: 'youth',
        toPayee: 'Youth Pastor Davis',
        toPayeeMasked: false,
        state: 'authorized',
        method: 'ach',
        impact: 'Youth event supplies and food',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-12',
      },
      {
        id: 'bat-001-i4',
        type: 'reimbursement',
        amount: 675,
        fromFund: 'general',
        toPayee: 'Tech Team Lead',
        toPayeeMasked: false,
        state: 'authorized',
        method: 'ach',
        impact: 'AV cable and adapter purchases',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-09',
      },
      {
        id: 'bat-001-i5',
        type: 'reimbursement',
        amount: 1200,
        fromFund: 'general',
        toPayee: 'Worship Director',
        toPayeeMasked: false,
        state: 'authorized',
        method: 'ach',
        impact: 'Sheet music and licensing fees',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-13',
      },
      {
        id: 'bat-001-i6',
        type: 'reimbursement',
        amount: 495,
        fromFund: 'general',
        toPayee: 'Children\'s Pastor',
        toPayeeMasked: false,
        state: 'authorized',
        method: 'ach',
        impact: 'Sunday school curriculum materials',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-08',
      },
    ],
  },
  {
    id: 'bat-002',
    name: 'Missions Q1 Disbursement',
    type: 'missions_disbursement',
    recipientCount: 3,
    totalAmount: 12000,
    state: 'in_flight',
    approvalStatus: 'partial',
    exceptionsCount: 0,
    scheduledWindow: '2026-03-01',
    items: [
      {
        id: 'bat-002-i1',
        type: 'transfer',
        amount: 4000,
        fromFund: 'missions',
        toPayee: 'Global Hope Ministries',
        toPayeeMasked: false,
        state: 'in_flight',
        method: 'ach',
        impact: 'Quarterly support — East Africa',
        nextOwner: 'ACH Processor',
        createdAt: '2026-02-15',
      },
      {
        id: 'bat-002-i2',
        type: 'transfer',
        amount: 5000,
        fromFund: 'missions',
        toPayee: 'Living Water International',
        toPayeeMasked: false,
        state: 'authorized',
        method: 'wire',
        impact: 'Quarterly support — South America',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-15',
      },
      {
        id: 'bat-002-i3',
        type: 'transfer',
        amount: 3000,
        fromFund: 'missions',
        toPayee: 'City Rescue Mission',
        toPayeeMasked: false,
        state: 'proposed',
        method: 'ach',
        impact: 'Quarterly support — Local outreach',
        nextOwner: 'Missions Committee Chair',
        createdAt: '2026-02-15',
      },
    ],
  },
  {
    id: 'bat-003',
    name: 'Vendor Payments Feb',
    type: 'vendor_run',
    recipientCount: 4,
    totalAmount: 14350,
    state: 'proposed',
    approvalStatus: 'pending',
    exceptionsCount: 1,
    scheduledWindow: 'Pending Approval',
    items: [
      {
        id: 'bat-003-i1',
        type: 'vendor',
        amount: 2850,
        fromFund: 'general',
        toPayee: 'AudioTech Solutions',
        toPayeeMasked: false,
        state: 'authorized',
        method: 'ach',
        impact: 'Soundboard repair',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-14',
      },
      {
        id: 'bat-003-i2',
        type: 'vendor',
        amount: 2100,
        fromFund: 'general',
        toPayee: 'ProSound Equipment',
        toPayeeMasked: false,
        state: 'failed',
        method: 'ach',
        impact: 'Speaker replacement — needs second approver',
        nextOwner: 'Church Treasurer',
        createdAt: '2026-02-17',
        failReason: 'Requires second approver for amounts > $2,000',
      },
      {
        id: 'bat-003-i3',
        type: 'vendor',
        amount: 1280,
        fromFund: 'youth',
        toPayee: 'Sunrise Event Rentals',
        toPayeeMasked: false,
        state: 'proposed',
        method: 'ach',
        impact: 'Youth retreat vendor invoice',
        nextOwner: 'Youth Pastor Davis',
        createdAt: '2026-02-17',
      },
      {
        id: 'bat-003-i4',
        type: 'vendor',
        amount: 8120,
        fromFund: 'building',
        toPayee: 'Metro Paving Co.',
        toPayeeMasked: false,
        state: 'proposed',
        method: 'check',
        impact: 'Parking lot resurfacing — progress payment',
        nextOwner: 'Church Treasurer',
        createdAt: '2026-02-15',
      },
    ],
  },
  {
    id: 'bat-004',
    name: 'Benevolence Feb',
    type: 'benevolence_run',
    recipientCount: 2,
    totalAmount: 2400,
    state: 'authorized',
    approvalStatus: 'approved',
    exceptionsCount: 0,
    scheduledWindow: '2026-02-22',
    items: [
      {
        id: 'bat-004-i1',
        type: 'benevolence',
        amount: 1500,
        fromFund: 'benevolence',
        toPayee: 'M. R****',
        toPayeeMasked: true,
        state: 'authorized',
        method: 'check',
        impact: 'Rent assistance — approved case #BEN-042',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-14',
      },
      {
        id: 'bat-004-i2',
        type: 'benevolence',
        amount: 900,
        fromFund: 'benevolence',
        toPayee: 'S. T****',
        toPayeeMasked: true,
        state: 'authorized',
        method: 'check',
        impact: 'Utility assistance — approved case #BEN-043',
        nextOwner: 'Finance Secretary',
        createdAt: '2026-02-15',
      },
    ],
  },
];

// =============================================================================
// APPROVALS QUEUE
// =============================================================================

const APPROVALS_QUEUE: RailsApprovalItem[] = [
  {
    id: 'appr-001',
    transactionId: 'txn-001',
    amount: 1280,
    fund: 'youth',
    category: 'Event Vendor',
    requestor: 'Youth Ministry',
    owner: 'Youth Pastor Davis',
    missingRequirements: ['Youth Pastor sign-off'],
    auditNote: 'Invoice attached — due today',
  },
  {
    id: 'appr-002',
    transactionId: 'txn-002',
    amount: 185,
    fund: 'general',
    category: 'Supplies',
    requestor: 'Office Manager',
    owner: 'Office Manager',
    missingRequirements: [],
  },
  {
    id: 'appr-003',
    transactionId: 'txn-003',
    amount: 8500,
    fund: 'building',
    category: 'Capital Project',
    requestor: 'Facilities Manager',
    owner: 'Church Treasurer',
    missingRequirements: ['Board resolution', 'Second approver'],
    auditNote: 'Requires board vote for capital expenditures > $5,000',
  },
  {
    id: 'appr-004',
    transactionId: 'bat-002-i3',
    amount: 3000,
    fund: 'missions',
    category: 'Missions Disbursement',
    requestor: 'Missions Committee',
    owner: 'Missions Committee Chair',
    missingRequirements: ['Committee chair approval'],
    auditNote: 'Two of three Q1 disbursements already approved',
  },
];

// =============================================================================
// RELEASE QUEUE
// =============================================================================

const RELEASE_QUEUE: RailsReleaseItem[] = [
  {
    id: 'rel-001',
    transactionId: 'txn-004',
    amount: 2850,
    fund: 'general',
    method: 'ach',
    approvedBy: 'Worship Director & Church Treasurer',
    scheduledTime: 'Today 4:00 PM',
    requiresSecondApprover: false,
  },
  {
    id: 'rel-002',
    transactionId: 'txn-005',
    amount: 4850,
    fund: 'general',
    method: 'ach',
    approvedBy: 'Church Treasurer',
    scheduledTime: 'Today 4:00 PM',
    requiresSecondApprover: false,
  },
  {
    id: 'rel-003',
    transactionId: 'bat-002-i2',
    amount: 5000,
    fund: 'missions',
    method: 'wire',
    approvedBy: 'Missions Committee Chair',
    scheduledTime: '2026-03-01',
    requiresSecondApprover: true,
  },
];

// =============================================================================
// EXCEPTIONS
// =============================================================================

const EXCEPTIONS: RailsException[] = [
  {
    id: 'exc-001',
    transactionId: 'txn-008',
    type: 'returned',
    cause: 'counterparty_bank',
    causeLabel: 'Invalid routing / account number at receiving bank',
    failingRule: 'ACH R03 — No Account/Unable to Locate Account',
    requiredFix: 'Reroute to wire or correct account number',
    owner: 'Missions Coordinator',
    escalationPath: 'Missions Coordinator → Finance Secretary → Treasurer',
    evidence: ['ACH return notice', 'Original payment confirmation'],
    amount: 450,
    fund: 'missions',
    createdAt: '2026-02-15',
  },
  {
    id: 'exc-002',
    transactionId: 'txn-009',
    type: 'held',
    cause: 'eligibility_doc_rule',
    causeLabel: 'Missing required case documentation',
    failingRule: 'Benevolence Policy §4 — Eligibility documentation required before disbursement',
    requiredFix: 'Attach case documentation and pastor approval',
    owner: 'Pastor Michael',
    escalationPath: 'Pastor Michael → Deacon Board Chair → Treasurer',
    evidence: ['Incomplete application form'],
    amount: 1200,
    fund: 'benevolence',
    createdAt: '2026-02-16',
  },
  {
    id: 'exc-003',
    transactionId: 'txn-010',
    type: 'failed',
    cause: 'authority_rule',
    causeLabel: 'Insufficient approval chain for transaction amount',
    failingRule: 'Finance Policy §2.1 — Dual approval required for amounts > $2,000',
    requiredFix: 'Requires second approver for amounts > $2,000',
    owner: 'Church Treasurer',
    escalationPath: 'Church Treasurer → Senior Pastor → Board',
    evidence: ['Single approval on file (Worship Director)'],
    amount: 2100,
    fund: 'general',
    createdAt: '2026-02-17',
  },
];

// =============================================================================
// RETURNS
// =============================================================================

const RETURNS: RailsReturn[] = [
  {
    id: 'ret-001',
    transactionId: 'txn-008',
    amount: 450,
    stage: 'evidence_requested',
    aging: 3,
    description: 'ACH return from Community Outreach Partner — invalid account. Awaiting corrected banking details.',
    createdAt: '2026-02-15',
  },
  {
    id: 'ret-002',
    transactionId: 'ret-chk-001',
    amount: 200,
    stage: 'received',
    aging: 1,
    description: 'Check returned — stale dated. Reissue required for grounds maintenance vendor.',
    createdAt: '2026-02-17',
  },
];

// =============================================================================
// RECEIPTS (SETTLED)
// =============================================================================

const RECEIPTS: RailsReceipt[] = [
  {
    id: 'rcp-001',
    transactionId: 'rcp-txn-001',
    requestEvent: 'Worship Director submitted reimbursement request for conference fees',
    rulesApplied: 'Amount < $5,000 — single approval; General Fund budget check passed',
    approvalChain: 'Worship Director (requestor) → Church Treasurer (approved)',
    releaseAuth: 'Finance Secretary released via ACH batch',
    settlementRecord: 'ACH settled 2026-02-10 — Trace #1D9BF0400012345',
    ledgerPostings: 'DR General Fund — Worship Expenses $1,450; CR Operating Cash $1,450',
    amount: 1450,
    settledDate: '2026-02-10',
    immutable: true,
  },
  {
    id: 'rcp-002',
    transactionId: 'rcp-txn-002',
    requestEvent: 'Facilities Manager submitted vendor invoice for HVAC quarterly service',
    rulesApplied: 'Amount < $5,000 — single approval; General Fund budget check passed',
    approvalChain: 'Facilities Manager (requestor) → Church Treasurer (approved)',
    releaseAuth: 'Finance Secretary released via check run',
    settlementRecord: 'Check #4521 cleared 2026-02-08',
    ledgerPostings: 'DR General Fund — Facilities Maintenance $2,200; CR Operating Cash $2,200',
    amount: 2200,
    settledDate: '2026-02-08',
    immutable: true,
  },
  {
    id: 'rcp-003',
    transactionId: 'rcp-txn-003',
    requestEvent: 'Youth Pastor submitted event catering invoice for winter retreat',
    rulesApplied: 'Youth Fund budget check passed; event cap $2,000 — within limit',
    approvalChain: 'Youth Pastor Davis (requestor) → Church Treasurer (approved)',
    releaseAuth: 'Finance Secretary released via card payment',
    settlementRecord: 'Card settled 2026-02-12 — Auth #A1A1AA2',
    ledgerPostings: 'DR Youth Fund — Event Expenses $1,680; CR Youth Operating Cash $1,680',
    amount: 1680,
    settledDate: '2026-02-12',
    immutable: true,
  },
];

// =============================================================================
// GIVING ALLOCATIONS
// =============================================================================

const GIVING_ALLOCATIONS: GivingAllocation[] = [
  {
    id: 'ga-001',
    donationId: 'don-20260216-001',
    totalAmount: 500,
    allocations: [
      { fund: 'general', amount: 300, tag: 'Tithes & Offerings' },
      { fund: 'missions', amount: 100, tag: 'Missions' },
      { fund: 'building', amount: 100, tag: 'Building Campaign' },
    ],
    date: '2026-02-16',
    donor: 'R. W****',
  },
  {
    id: 'ga-002',
    donationId: 'don-20260216-002',
    totalAmount: 250,
    allocations: [
      { fund: 'general', amount: 150, tag: 'Tithes & Offerings' },
      { fund: 'benevolence', amount: 50, tag: 'Benevolence' },
      { fund: 'youth', amount: 50, tag: 'Youth Ministry' },
    ],
    date: '2026-02-16',
    donor: 'T. M****',
  },
  {
    id: 'ga-003',
    donationId: 'don-20260216-003',
    totalAmount: 1000,
    allocations: [
      { fund: 'general', amount: 600, tag: 'Tithes & Offerings' },
      { fund: 'missions', amount: 200, tag: 'Missions' },
      { fund: 'building', amount: 150, tag: 'Building Campaign' },
      { fund: 'benevolence', amount: 50, tag: 'Benevolence' },
    ],
    date: '2026-02-16',
    donor: 'A. J****',
  },
];

// =============================================================================
// DATA ACCESSORS
// =============================================================================

export function getChurchPaymentRailsData() {
  return {
    healthStatus: RAILS_HEALTH,
    wallets: WALLETS,
    transactions: TRANSACTIONS,
    batches: BATCHES,
    approvalsQueue: APPROVALS_QUEUE,
    releaseQueue: RELEASE_QUEUE,
    exceptions: EXCEPTIONS,
    returns: RETURNS,
    receipts: RECEIPTS,
    givingAllocations: GIVING_ALLOCATIONS,
  };
}

export function getWalletByFund(fund: FundType): RailsWallet | undefined {
  return WALLETS.find((w) => w.fundType === fund);
}

export function getTransactionById(id: string): RailsTransaction | undefined {
  return TRANSACTIONS.find((t) => t.id === id);
}
