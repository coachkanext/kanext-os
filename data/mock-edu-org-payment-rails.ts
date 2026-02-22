/**
 * Education Organization Payment Rails — Mock Data & Types
 * Money-movement execution layer: wallets, transactions, batches, approvals,
 * releases, exceptions, returns, and receipts for HBCU operations.
 */

// =============================================================================
// TYPES
// =============================================================================

export type EduRailsStatus = 'green' | 'yellow' | 'red';

export type EduRailMethod = 'ach' | 'wire' | 'internal' | 'card' | 'check';

export type EduTransactionState =
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
  | 'reversed';

export type EduBatchType =
  | 'pell_disbursement'
  | 'faculty_payroll'
  | 'vendor_run'
  | 'student_refund'
  | 'athletics_travel'
  | 'aid_disbursement'
  | 'housing_refund';

export type EduExceptionType = 'held' | 'failed' | 'returned' | 'disputed' | 'reversal';

export type EduExceptionCause =
  | 'authority_rule'       // A
  | 'budget_cap_rule'      // B
  | 'compliance_rule'      // C
  | 'documentation_rule'   // D
  | 'eligibility_rule'     // E
  | 'processor_technical'; // F

export type EduWalletType =
  | 'operating'
  | 'payroll'
  | 'tuition_receipts'
  | 'housing_receipts'
  | 'aid_disbursement'
  | 'athletics_ops'
  | 'restricted_funds';

// =============================================================================
// INTERFACES
// =============================================================================

export interface EduRailsHealthStrip {
  status: EduRailsStatus;
  connectedRails: number;
  pendingApprovals: number;
  pendingReleases: number;
  inFlight: number;
  exceptions: number;
  nextSettlementWindow: string;
}

export interface EduRailsWallet {
  id: string;
  name: string;
  walletType: EduWalletType;
  institution: string;
  available: number;
  committed: number;
  pendingInflows: number;
  pendingOutflows: number;
  allowedRails: EduRailMethod[];
  controls: string;
  exceptionsCount: number;
}

export interface EduRailsTransaction {
  id: string;
  type: string;
  amount: number;
  fromWallet: EduWalletType;
  toPayee: string;
  toPayeeMasked: boolean;
  state: EduTransactionState;
  method: EduRailMethod;
  impact: string;
  nextOwner: string;
  createdAt: string;
  deadline?: string;
  holdReason?: string;
  failReason?: string;
  batchId?: string;
  institution: string;
}

export interface EduRailsBatch {
  id: string;
  name: string;
  type: EduBatchType;
  recipientCount: number;
  totalAmount: number;
  state: EduTransactionState;
  approvalStatus: 'pending' | 'approved' | 'partial';
  exceptionsCount: number;
  scheduledWindow: string;
  institution: string;
}

export interface EduRailsApprovalItem {
  id: string;
  transactionId: string;
  amount: number;
  walletType: EduWalletType;
  category: string;
  requestor: string;
  approverSeat: string;
  missingRequirements: string[];
  auditNote?: string;
  institution: string;
}

export interface EduRailsReleaseItem {
  id: string;
  transactionId: string;
  amount: number;
  walletType: EduWalletType;
  method: EduRailMethod;
  approvedBy: string;
  scheduledTime: string;
  requiresSecondApprover: boolean;
  institution: string;
}

export interface EduRailsException {
  id: string;
  transactionId: string;
  type: EduExceptionType;
  cause: EduExceptionCause;
  causeLabel: string;
  failingRule: string;
  governedActions: string[];
  owner: string;
  escalationPath: string;
  evidence: string[];
  amount: number;
  walletType: EduWalletType;
  institution: string;
  createdAt: string;
}

export interface EduRailsReturn {
  id: string;
  transactionId: string;
  amount: number;
  stage: 'received' | 'evidence_requested' | 'submitted' | 'resolved';
  aging: number;
  description: string;
  institution: string;
  createdAt: string;
}

export interface EduRailsReceipt {
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
  institution: string;
}

// =============================================================================
// CONSTANTS / LABELS
// =============================================================================

export const EDU_RAILS_STATUS_COLORS: Record<EduRailsStatus, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

export const EDU_RAIL_METHOD_LABELS: Record<EduRailMethod, string> = {
  ach: 'ACH',
  wire: 'Wire',
  internal: 'Internal Transfer',
  card: 'Card',
  check: 'Check',
};

export const EDU_RAIL_METHOD_ICONS: Record<EduRailMethod, string> = {
  ach: 'building.columns.fill',
  wire: 'bolt.fill',
  internal: 'arrow.left.arrow.right',
  card: 'creditcard.fill',
  check: 'doc.text.fill',
};

export const EDU_TRANSACTION_STATE_LABELS: Record<EduTransactionState, string> = {
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
  reversed: 'Reversed',
};

export const EDU_TRANSACTION_STATE_COLORS: Record<EduTransactionState, string> = {
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
  reversed: '#1D9BF0',
};

export const EDU_BATCH_TYPE_LABELS: Record<EduBatchType, string> = {
  pell_disbursement: 'Pell Disbursement',
  faculty_payroll: 'Faculty Payroll',
  vendor_run: 'Vendor Run',
  student_refund: 'Student Refund',
  athletics_travel: 'Athletics Travel',
  aid_disbursement: 'Aid Disbursement',
  housing_refund: 'Housing Refund',
};

export const EDU_EXCEPTION_TYPE_LABELS: Record<EduExceptionType, string> = {
  held: 'Held',
  failed: 'Failed',
  returned: 'Returned',
  disputed: 'Disputed',
  reversal: 'Reversal',
};

export const EDU_EXCEPTION_TYPE_COLORS: Record<EduExceptionType, string> = {
  held: '#F59E0B',
  failed: '#EF4444',
  returned: '#EF4444',
  disputed: '#EF4444',
  reversal: '#1D9BF0',
};

export const EDU_EXCEPTION_CAUSE_LABELS: Record<EduExceptionCause, string> = {
  authority_rule: 'Authority Rule',
  budget_cap_rule: 'Budget Cap Rule',
  compliance_rule: 'Compliance Rule',
  documentation_rule: 'Documentation Rule',
  eligibility_rule: 'Eligibility Rule',
  processor_technical: 'Processor Technical',
};

export const EDU_WALLET_TYPE_LABELS: Record<EduWalletType, string> = {
  operating: 'Operating',
  payroll: 'Payroll',
  tuition_receipts: 'Tuition Receipts',
  housing_receipts: 'Housing Receipts',
  aid_disbursement: 'Aid Disbursement',
  athletics_ops: 'Athletics Ops',
  restricted_funds: 'Restricted Funds',
};

export const EDU_WALLET_TYPE_COLORS: Record<EduWalletType, string> = {
  operating: '#1D9BF0',
  payroll: '#22C55E',
  tuition_receipts: '#1D9BF0',
  housing_receipts: '#F59E0B',
  aid_disbursement: '#22C55E',
  athletics_ops: '#1D9BF0',
  restricted_funds: '#1D9BF0',
};

// =============================================================================
// HEALTH STRIP
// =============================================================================

const HEALTH_STRIP: EduRailsHealthStrip = {
  status: 'green',
  connectedRails: 5,
  pendingApprovals: 3,
  pendingReleases: 2,
  inFlight: 1,
  exceptions: 2,
  nextSettlementWindow: 'Today 4:00 PM EST',
};

// =============================================================================
// WALLETS
// =============================================================================

const WALLETS: EduRailsWallet[] = [
  {
    id: 'edu-wal-001',
    name: 'KaNeXT Operating',
    walletType: 'operating',
    institution: 'KaNeXT Sports',
    available: 2180000,
    committed: 340000,
    pendingInflows: 125000,
    pendingOutflows: 89000,
    allowedRails: ['ach', 'wire', 'internal', 'card', 'check'],
    controls: 'Dual approval >$25K; Board approval >$100K',
    exceptionsCount: 1,
  },
  {
    id: 'edu-wal-003',
    name: 'KaNeXT Tuition Receipts',
    walletType: 'tuition_receipts',
    institution: 'KaNeXT Sports',
    available: 1450000,
    committed: 0,
    pendingInflows: 280000,
    pendingOutflows: 0,
    allowedRails: ['ach', 'card'],
    controls: 'Auto-sweep to Operating daily; hold on disputed amounts',
    exceptionsCount: 1,
  },
  {
    id: 'edu-wal-005',
    name: 'KaNeXT Aid Disbursement',
    walletType: 'aid_disbursement',
    institution: 'KaNeXT Sports',
    available: 1850000,
    committed: 820000,
    pendingInflows: 0,
    pendingOutflows: 380000,
    allowedRails: ['ach', 'internal'],
    controls: 'Title IV compliance required; SAP verification pre-disbursement',
    exceptionsCount: 0,
  },
  {
    id: 'edu-wal-007',
    name: 'KaNeXT Restricted Funds',
    walletType: 'restricted_funds',
    institution: 'KaNeXT Sports',
    available: 2400000,
    committed: 180000,
    pendingInflows: 0,
    pendingOutflows: 125000,
    allowedRails: ['ach', 'wire'],
    controls: 'Grant-specific spending; federal compliance audit trail required',
    exceptionsCount: 0,
  },
];

// =============================================================================
// CONTROL TOWER TRANSACTIONS
// =============================================================================

const TRANSACTIONS: EduRailsTransaction[] = [
  // --- Needs Approval (3) ---
  {
    id: 'edu-txn-001',
    type: 'batch_disbursement',
    amount: 382400,
    fromWallet: 'aid_disbursement',
    toPayee: 'Pell Grant Spring Batch — 412 recipients',
    toPayeeMasked: false,
    state: 'proposed',
    method: 'ach',
    impact: 'Title IV Pell disbursement — spring semester; SAP verification complete',
    nextOwner: 'Director of Financial Aid',
    createdAt: '2026-02-16',
    deadline: '2026-03-01',
    batchId: 'edu-bat-001',
    institution: 'KaNeXT Sports',
  },
  {
    id: 'edu-txn-003',
    type: 'reimbursement',
    amount: 8200,
    fromWallet: 'operating',
    toPayee: 'Faculty Travel Reimbursement Batch — 4 recipients',
    toPayeeMasked: false,
    state: 'proposed',
    method: 'ach',
    impact: 'SACS-COC conference travel and per diem reimbursements',
    nextOwner: 'Provost Office',
    createdAt: '2026-02-14',
    institution: 'KaNeXT Sports',
  },
  // --- Ready to Release (2) ---
  {
    id: 'edu-txn-004',
    type: 'vendor',
    amount: 38500,
    fromWallet: 'operating',
    toPayee: 'Sodexo Food Services',
    toPayeeMasked: false,
    state: 'authorized',
    method: 'ach',
    impact: 'Monthly dining services contract — February billing',
    nextOwner: 'VP Finance',
    createdAt: '2026-02-12',
    deadline: '2026-02-20',
    institution: 'KaNeXT Sports',
  },
  // --- In Flight (1) ---
  {
    id: 'edu-txn-008',
    type: 'vendor',
    amount: 12800,
    fromWallet: 'operating',
    toPayee: 'ADP Payroll Processing',
    toPayeeMasked: false,
    state: 'in_flight',
    method: 'ach',
    impact: 'Payroll processing fees — February cycle',
    nextOwner: 'ACH Processor',
    createdAt: '2026-02-17',
    institution: 'KaNeXT Sports',
  },
  // --- Exceptions (2) ---
  {
    id: 'edu-txn-009',
    type: 'refund',
    amount: 1250,
    fromWallet: 'tuition_receipts',
    toPayee: 'Student A. J****',
    toPayeeMasked: true,
    state: 'returned',
    method: 'ach',
    impact: 'ACH return — student refund failed; invalid account on file',
    nextOwner: 'Bursar Office',
    createdAt: '2026-02-15',
    failReason: 'ACH R03 — No Account/Unable to Locate Account',
    institution: 'KaNeXT Sports',
  },
  {
    id: 'edu-txn-010',
    type: 'vendor',
    amount: 22400,
    fromWallet: 'operating',
    toPayee: 'Campus Landscaping LLC',
    toPayeeMasked: false,
    state: 'held',
    method: 'check',
    impact: 'Vendor payment held — missing W-9 documentation',
    nextOwner: 'Procurement Office',
    createdAt: '2026-02-14',
    holdReason: 'IRS §6109 — W-9 required before payment release',
    institution: 'KaNeXT Sports',
  },
];

// =============================================================================
// BATCHES
// =============================================================================

const BATCHES: EduRailsBatch[] = [
  {
    id: 'edu-bat-001',
    name: 'Pell Grant Spring Disbursement',
    type: 'pell_disbursement',
    recipientCount: 412,
    totalAmount: 1420000,
    state: 'proposed',
    approvalStatus: 'pending',
    exceptionsCount: 2,
    scheduledWindow: 'Mar 1',
    institution: 'KaNeXT Sports',
  },
  {
    id: 'edu-bat-003',
    name: 'Monthly Vendor Run',
    type: 'vendor_run',
    recipientCount: 12,
    totalAmount: 285000,
    state: 'authorized',
    approvalStatus: 'approved',
    exceptionsCount: 1,
    scheduledWindow: 'Today 4:00 PM',
    institution: 'KaNeXT Sports',
  },
];

// =============================================================================
// APPROVALS QUEUE
// =============================================================================

const APPROVALS_QUEUE: EduRailsApprovalItem[] = [
  {
    id: 'edu-appr-001',
    transactionId: 'edu-txn-001',
    amount: 382400,
    walletType: 'aid_disbursement',
    category: 'Pell Disbursement',
    requestor: 'Financial Aid Office',
    approverSeat: 'Director of Financial Aid',
    missingRequirements: ['SAP batch certification', 'Title IV compliance sign-off'],
    auditNote: 'Spring 2026 Pell disbursement — 412 eligible students verified',
    institution: 'KaNeXT Sports',
  },
  {
    id: 'edu-appr-003',
    transactionId: 'edu-txn-003',
    amount: 8200,
    walletType: 'operating',
    category: 'Travel Reimbursement',
    requestor: 'Provost Office',
    approverSeat: 'Provost',
    missingRequirements: ['Itemized receipts for 2 of 4 travelers'],
    auditNote: 'SACS-COC accreditation conference — required institutional representation',
    institution: 'KaNeXT Sports',
  },
  {
    id: 'edu-appr-004',
    transactionId: 'edu-bat-003',
    amount: 125000,
    walletType: 'restricted_funds',
    category: 'Grant Expenditure',
    requestor: 'Office of Sponsored Programs',
    approverSeat: 'VP Research & Compliance',
    missingRequirements: ['Federal expenditure report attachment', 'PI certification'],
    auditNote: 'NSF grant #2026-KX-0412 — lab equipment procurement per approved budget',
    institution: 'KaNeXT Sports',
  },
];

// =============================================================================
// RELEASE QUEUE
// =============================================================================

const RELEASE_QUEUE: EduRailsReleaseItem[] = [
  {
    id: 'edu-rel-001',
    transactionId: 'edu-txn-004',
    amount: 38500,
    walletType: 'operating',
    method: 'ach',
    approvedBy: 'VP Finance & Controller',
    scheduledTime: 'Today 4:00 PM EST',
    requiresSecondApprover: false,
    institution: 'KaNeXT Sports',
  },
  {
    id: 'edu-rel-003',
    transactionId: 'edu-bat-003',
    amount: 285000,
    walletType: 'operating',
    method: 'ach',
    approvedBy: 'Controller',
    scheduledTime: 'Today 4:00 PM EST',
    requiresSecondApprover: true,
    institution: 'KaNeXT Sports',
  },
];

// =============================================================================
// EXCEPTIONS
// =============================================================================

const EXCEPTIONS: EduRailsException[] = [
  {
    id: 'edu-exc-001',
    transactionId: 'edu-txn-009',
    type: 'returned',
    cause: 'processor_technical',
    causeLabel: 'ACH return — invalid account number at receiving institution',
    failingRule: 'ACH R03 — No Account/Unable to Locate Account',
    governedActions: ['retry', 'reroute', 'escalate'],
    owner: 'Bursar Office',
    escalationPath: 'Bursar Office → VP Finance → President',
    evidence: ['ACH return notice', 'Original disbursement confirmation', 'Student account record'],
    amount: 1250,
    walletType: 'tuition_receipts',
    institution: 'KaNeXT Sports',
    createdAt: '2026-02-15',
  },
  {
    id: 'edu-exc-002',
    transactionId: 'edu-txn-010',
    type: 'held',
    cause: 'documentation_rule',
    causeLabel: 'Missing IRS W-9 form — vendor cannot receive payment',
    failingRule: 'IRS §6109 — W-9 required before payment release',
    governedActions: ['escalate', 'override'],
    owner: 'Procurement Office',
    escalationPath: 'Procurement Office → Controller → VP Finance',
    evidence: ['Vendor file — no W-9 on record', 'Purchase order #PO-2026-0218'],
    amount: 22400,
    walletType: 'operating',
    institution: 'KaNeXT Sports',
    createdAt: '2026-02-14',
  },
];

// =============================================================================
// RETURNS
// =============================================================================

const RETURNS: EduRailsReturn[] = [
  {
    id: 'edu-ret-001',
    transactionId: 'edu-txn-009',
    amount: 1250,
    stage: 'evidence_requested',
    aging: 3,
    description: 'Student refund ACH return — invalid account on file. Awaiting corrected banking details from student.',
    institution: 'KaNeXT Sports',
    createdAt: '2026-02-15',
  },
];

// =============================================================================
// RECEIPTS (SETTLED)
// =============================================================================

const RECEIPTS: EduRailsReceipt[] = [
  {
    id: 'edu-rcp-001',
    transactionId: 'edu-rcp-txn-001',
    requestEvent: 'Registrar triggered fall semester Pell disbursement batch for 398 eligible students',
    rulesApplied: 'Title IV compliance verified; SAP standing confirmed; enrollment census date passed',
    approvalChain: 'Financial Aid Director (initiated) → Controller (budget check) → VP Finance (authorized)',
    releaseAuth: 'VP Finance released via ACH batch — dual authorization confirmed',
    settlementRecord: 'ACH settled 2026-01-15 — Trace #1D9BF0500098765',
    ledgerPostings: 'DR Aid Disbursement — Pell Grants $1,380,000; CR Student Accounts Receivable $1,380,000',
    amount: 1380000,
    settledDate: '2026-01-15',
    immutable: true,
    institution: 'KaNeXT Sports',
  },
  {
    id: 'edu-rcp-003',
    transactionId: 'edu-rcp-txn-003',
    requestEvent: 'Facilities Manager submitted emergency HVAC repair invoice for Science Building',
    rulesApplied: 'Emergency expenditure policy — single approval allowed; Operating Fund budget check passed',
    approvalChain: 'Facilities Manager (requestor) → VP Operations (emergency approval) → Controller (budget confirmed)',
    releaseAuth: 'Controller released via ACH — expedited processing',
    settlementRecord: 'ACH settled 2026-02-05 — Trace #1D9BF0500034567',
    ledgerPostings: 'DR Operating — Facilities Maintenance $45,200; CR Operating Cash $45,200',
    amount: 45200,
    settledDate: '2026-02-05',
    immutable: true,
    institution: 'KaNeXT Sports',
  },
];

// =============================================================================
// DATA ACCESSORS
// =============================================================================

export function getEduPaymentRailsData() {
  return {
    healthStrip: HEALTH_STRIP,
    wallets: WALLETS,
    transactions: TRANSACTIONS,
    batches: BATCHES,
    approvalsQueue: APPROVALS_QUEUE,
    releaseQueue: RELEASE_QUEUE,
    exceptions: EXCEPTIONS,
    returns: RETURNS,
    receipts: RECEIPTS,
  };
}

export function getEduWalletById(id: string): EduRailsWallet | undefined {
  return WALLETS.find((w) => w.id === id);
}

export function getEduTransactionById(id: string): EduRailsTransaction | undefined {
  return TRANSACTIONS.find((t) => t.id === id);
}

export function getEduBatchById(id: string): EduRailsBatch | undefined {
  return BATCHES.find((b) => b.id === id);
}
