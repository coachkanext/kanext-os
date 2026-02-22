/**
 * Sports Organization Payment Rails V2 — Mock Data & Types
 * 8-tab Payment Rails Hub for Sports Mode organizations.
 * Seeded with KaNeXT Men's Basketball 2025-26 season data.
 * Money-movement execution surface — what's pending, failed, blocked.
 * Full payment chain: Event → Rules → Auth → Payment → Settlement → Ledger → Receipt.
 */

// =============================================================================
// TYPES
// =============================================================================

export type PaymentRailsSubTab =
  | 'overview'
  | 'now'
  | 'streams'
  | 'approvals'
  | 'exceptions'
  | 'audit'
  | 'disbursements'
  | 'settings';

export interface PaymentRailsSubTabDef {
  id: PaymentRailsSubTab;
  label: string;
  icon: string;
}

export type StreamCategory = 'vendor' | 'travel' | 'player-services' | 'misc-ops';
export type StreamCadence = 'weekly' | 'biweekly' | 'monthly' | 'per-event' | 'one-time';
export type StreamStatus = 'active' | 'paused' | 'failed' | 'pending-setup';
export type PaymentMethod = 'ach' | 'wire' | 'card' | 'check';
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ApprovalStatus = 'pending' | 'approved' | 'denied';
export type ExceptionType = 'compliance' | 'receipt' | 'document' | 'limit' | 'account';
export type AuditAction = 'initiated' | 'approved' | 'rejected' | 'released' | 'failed' | 'reversed';
export type DisbursementType = 'per-diem' | 'travel-reimb' | 'equipment' | 'stipend' | 'other';
export type DisbursementStatus = 'paid' | 'pending' | 'processing' | 'failed';

export interface RailHealthEntry {
  name: string;
  status: 'green' | 'yellow' | 'red';
}

export interface RailsHealthSummary {
  pendingAmount: number;
  pendingCount: number;
  failedAmount: number;
  failedCount: number;
  blockedAmount: number;
  blockedCount: number;
  approvalsNeeded: number;
  lastSettlement: string;
  rails: RailHealthEntry[];
  nextSettlementWindow: string;
  totalVolume: string;
}

export interface PaymentAction {
  id: string;
  type: 'approval' | 'blocked';
  title: string;
  amount: number;
  owner: string;
  reason: string;
  dueDate: string;
  priority: ActionPriority;
}

export interface PaymentStream {
  id: string;
  name: string;
  category: StreamCategory;
  cadence: StreamCadence;
  status: StreamStatus;
  lastPayment: string;
  nextPayment: string;
  amount: number;
  recipient: string;
  method: PaymentMethod;
}

export interface PaymentApproval {
  id: string;
  title: string;
  amount: number;
  requestedBy: string;
  requestDate: string;
  dueDate: string;
  priority: ActionPriority;
  status: ApprovalStatus;
  category: StreamCategory;
  notes: string;
  /** Source tag for seeded data traceability */
  data_source?: string;
}

export interface PaymentException {
  id: string;
  type: ExceptionType;
  title: string;
  amount: number;
  blockedSince: string;
  reason: string;
  resolution: string;
  assignee: string;
  /** Source tag for seeded data traceability */
  data_source?: string;
  /** Partial payment chain — may be incomplete for held transactions */
  chain?: Partial<PaymentChain>;
}

export interface AuditEntry {
  id: string;
  action: AuditAction;
  description: string;
  amount: number;
  initiatedBy: string;
  approvedBy?: string;
  timestamp: string;
  reference: string;
}

export interface Disbursement {
  id: string;
  type: DisbursementType;
  description: string;
  amount: number;
  status: DisbursementStatus;
  date: string;
  method: PaymentMethod;
  recipient: string;
}

// =============================================================================
// PAYMENT CHAIN TYPES — Full lifecycle traceability
// =============================================================================

export interface PaymentChainEvent {
  type: string;
  amount: number;
  date: string;
  description: string;
}

export interface PaymentChainRules {
  policy: string;
  threshold: number;
  autoApprove: boolean;
  flagged: boolean;
}

export interface PaymentChainAuth {
  approver: string;
  approvedAt: string;
  method: 'digital' | 'manual' | 'auto';
}

export interface PaymentChainPayment {
  method: 'ACH' | 'Internal' | 'Wire' | 'Card' | 'Check';
  processor: string;
  reference: string;
  initiatedAt: string;
}

export interface PaymentChainSettlement {
  settledAt: string;
  clearingDays: number;
  status: 'settled' | 'pending' | 'failed';
}

export interface PaymentChainLedger {
  entryId: string;
  debitAccount: string;
  creditAccount: string;
  postDate: string;
}

export interface PaymentChainReceipt {
  receiptId: string;
  url: string;
  generatedAt: string;
}

export interface PaymentChain {
  event: PaymentChainEvent;
  rules: PaymentChainRules;
  auth: PaymentChainAuth;
  payment: PaymentChainPayment;
  settlement: PaymentChainSettlement;
  ledger: PaymentChainLedger;
  receipt: PaymentChainReceipt;
}

export type WalletType = 'operating' | 'travel' | 'scholarships';
export type WalletStatus = 'active' | 'frozen' | 'low-balance';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  allocated: number;
  status: WalletStatus;
  lastActivity: string;
}

export type ConnectedRail = 'ACH' | 'Internal';

/** Settled transaction with full payment chain */
export interface SettledTransaction {
  id: string;
  description: string;
  amount: number;
  walletId: string;
  chain: PaymentChain;
  data_source?: string;
}

// =============================================================================
// LABEL / COLOR MAPS
// =============================================================================

export const STREAM_STATUS_LABELS: Record<StreamStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  failed: 'Failed',
  'pending-setup': 'Pending Setup',
};

export const STREAM_STATUS_COLORS: Record<StreamStatus, string> = {
  active: '#22C55E',
  paused: '#F59E0B',
  failed: '#EF4444',
  'pending-setup': '#A1A1AA',
};

export const STREAM_CATEGORY_LABELS: Record<StreamCategory, string> = {
  vendor: 'Vendor',
  travel: 'Travel',
  'player-services': 'Player Svc',
  'misc-ops': 'Misc Ops',
};

export const STREAM_CATEGORY_COLORS: Record<StreamCategory, string> = {
  vendor: '#1D9BF0',
  travel: '#1D9BF0',
  'player-services': '#1D9BF0',
  'misc-ops': '#A1A1AA',
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  ach: 'ACH',
  wire: 'Wire',
  card: 'Card',
  check: 'Check',
};

export const METHOD_ICONS: Record<PaymentMethod, string> = {
  ach: 'building.columns.fill',
  wire: 'arrow.left.arrow.right',
  card: 'creditcard.fill',
  check: 'doc.text.fill',
};

export const PRIORITY_LABELS: Record<ActionPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_COLORS: Record<ActionPriority, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#1D9BF0',
  low: '#A1A1AA',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  denied: '#EF4444',
};

export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  compliance: 'Compliance',
  receipt: 'Missing Receipt',
  document: 'Missing Document',
  limit: 'Limit Exceeded',
  account: 'Account Issue',
};

export const EXCEPTION_TYPE_COLORS: Record<ExceptionType, string> = {
  compliance: '#EF4444',
  receipt: '#F59E0B',
  document: '#F59E0B',
  limit: '#1D9BF0',
  account: '#A1A1AA',
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  initiated: 'Initiated',
  approved: 'Approved',
  rejected: 'Rejected',
  released: 'Released',
  failed: 'Failed',
  reversed: 'Reversed',
};

export const AUDIT_ACTION_COLORS: Record<AuditAction, string> = {
  initiated: '#1D9BF0',
  approved: '#22C55E',
  rejected: '#EF4444',
  released: '#1D9BF0',
  failed: '#EF4444',
  reversed: '#F59E0B',
};

export const DISBURSEMENT_STATUS_LABELS: Record<DisbursementStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  processing: 'Processing',
  failed: 'Failed',
};

export const DISBURSEMENT_STATUS_COLORS: Record<DisbursementStatus, string> = {
  paid: '#22C55E',
  pending: '#F59E0B',
  processing: '#1D9BF0',
  failed: '#EF4444',
};

export const DISBURSEMENT_TYPE_LABELS: Record<DisbursementType, string> = {
  'per-diem': 'Per Diem',
  'travel-reimb': 'Travel Reimb.',
  equipment: 'Equipment',
  stipend: 'Stipend',
  other: 'Other',
};

export const WALLET_STATUS_LABELS: Record<WalletStatus, string> = {
  active: 'Active',
  frozen: 'Frozen',
  'low-balance': 'Low Balance',
};

export const WALLET_STATUS_COLORS: Record<WalletStatus, string> = {
  active: '#22C55E',
  frozen: '#EF4444',
  'low-balance': '#F59E0B',
};

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export const PAYMENT_RAILS_SUB_TABS: PaymentRailsSubTabDef[] = [
  { id: 'overview', label: 'Overview', icon: 'square.grid.2x2.fill' },
  { id: 'now', label: 'Now', icon: 'bolt.fill' },
  { id: 'streams', label: 'Streams', icon: 'arrow.triangle.branch' },
  { id: 'approvals', label: 'Approvals', icon: 'checkmark.seal.fill' },
  { id: 'exceptions', label: 'Exceptions', icon: 'exclamationmark.triangle.fill' },
  { id: 'audit', label: 'Audit', icon: 'list.bullet.clipboard.fill' },
  { id: 'disbursements', label: 'Disbursements', icon: 'banknote.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

// =============================================================================
// MOCK DATA — RAILS HEALTH
// =============================================================================

export function getRailsHealth(): RailsHealthSummary {
  return {
    pendingAmount: 4_650,
    pendingCount: 2,
    failedAmount: 0,
    failedCount: 0,
    blockedAmount: 1_450,
    blockedCount: 1,
    approvalsNeeded: 2,
    lastSettlement: '2026-02-15T14:30:00',
    rails: [
      { name: 'ACH', status: 'green' },
      { name: 'Internal', status: 'green' },
    ],
    nextSettlementWindow: 'Feb 19 — T+2 Business Days',
    totalVolume: '$38,420',
  };
}

// =============================================================================
// MOCK DATA — ACTION QUEUE
// =============================================================================

export const ACTION_QUEUE: PaymentAction[] = [
  {
    id: 'pa-001',
    type: 'approval',
    title: 'Hotel block — @ Virginia Tech tournament',
    amount: 12_400,
    owner: 'Coach Williams',
    reason: 'Exceeds $10K single-trip threshold',
    dueDate: '2025-12-17',
    priority: 'critical',
  },
  {
    id: 'pa-002',
    type: 'blocked',
    title: 'Trainer vendor payment — Sports Med LLC',
    amount: 4_200,
    owner: 'A. Thompson (Admin)',
    reason: 'W-9 not on file',
    dueDate: '2025-12-15',
    priority: 'high',
  },
  {
    id: 'pa-003',
    type: 'approval',
    title: 'Recruiting dinner — 3 prospects',
    amount: 1_350,
    owner: 'Asst. Coach Rivera',
    reason: 'Awaiting AD approval',
    dueDate: '2025-12-18',
    priority: 'high',
  },
  {
    id: 'pa-004',
    type: 'blocked',
    title: 'Equipment order — Nike spring package',
    amount: 7_250,
    owner: 'Equipment Mgr',
    reason: 'PO over annual limit — needs override',
    dueDate: '2025-12-20',
    priority: 'medium',
  },
  {
    id: 'pa-005',
    type: 'approval',
    title: 'Travel advance — Myrtle Beach Invitational',
    amount: 3_800,
    owner: 'Ops Director',
    reason: 'Per-diem + bus charter needs dual sign-off',
    dueDate: '2025-12-19',
    priority: 'medium',
  },
  {
    id: 'pa-006',
    type: 'approval',
    title: 'Film subscription renewal — Synergy Sports',
    amount: 2_100,
    owner: 'Asst. Coach Lee',
    reason: 'Annual renewal — was flagged auto',
    dueDate: '2025-12-22',
    priority: 'low',
  },
  {
    id: 'pa-007',
    type: 'blocked',
    title: 'Player meal plan top-up — December',
    amount: 980,
    owner: 'Compliance',
    reason: 'Exceeds NCAA benefit cap — needs waiver',
    dueDate: '2025-12-16',
    priority: 'critical',
  },
  // ── demo_seed action items — Feb 2026 ───────────────────────────────────
  {
    id: 'pa-008',
    type: 'approval',
    title: 'Bus charter — away @ Webber International',
    amount: 3_200,
    owner: 'Alicia Washington',
    reason: 'Awaiting Head Coach approval',
    dueDate: '2026-02-20',
    priority: 'high',
  },
  {
    id: 'pa-009',
    type: 'approval',
    title: 'Recruiting flight — Coach Davis eval weekend',
    amount: 1_450,
    owner: 'Marcus Davis',
    reason: 'Above auto-approve limit — needs AD sign-off',
    dueDate: '2026-02-22',
    priority: 'medium',
  },
  {
    id: 'pa-010',
    type: 'blocked',
    title: 'Scholarship disbursement — March tranche',
    amount: 1_450,
    owner: 'Financial Aid',
    reason: 'Missing roster verification from registrar',
    dueDate: '2026-02-25',
    priority: 'high',
  },
];

// =============================================================================
// MOCK DATA — PAYMENT STREAMS
// =============================================================================

export const PAYMENT_STREAMS: PaymentStream[] = [
  {
    id: 'ps-001',
    name: 'Bus charter — SafeRide Bus Co.',
    category: 'travel',
    cadence: 'per-event',
    status: 'active',
    lastPayment: '2026-02-10',
    nextPayment: '2026-02-21',
    amount: 3_200,
    recipient: 'SafeRide Bus Co.',
    method: 'ach',
  },
  {
    id: 'ps-002',
    name: 'Select Physical Therapy — monthly retainer',
    category: 'vendor',
    cadence: 'monthly',
    status: 'active',
    lastPayment: '2026-02-01',
    nextPayment: '2026-03-01',
    amount: 700,
    recipient: 'Select Physical Therapy',
    method: 'ach',
  },
  {
    id: 'ps-003',
    name: 'Hudl — video platform annual',
    category: 'vendor',
    cadence: 'monthly',
    status: 'active',
    lastPayment: '2026-02-01',
    nextPayment: '2026-03-01',
    amount: 200,
    recipient: 'Hudl',
    method: 'ach',
  },
  {
    id: 'ps-004',
    name: 'Player per-diem — road games',
    category: 'player-services',
    cadence: 'per-event',
    status: 'active',
    lastPayment: '2026-02-10',
    nextPayment: '2026-02-21',
    amount: 900,
    recipient: 'Multiple Players',
    method: 'ach',
  },
  {
    id: 'ps-005',
    name: 'Hotel bookings — Hampton Inn',
    category: 'travel',
    cadence: 'per-event',
    status: 'active',
    lastPayment: '2026-02-08',
    nextPayment: '2026-02-21',
    amount: 1_680,
    recipient: 'Hampton Inn (Various)',
    method: 'ach',
  },
  {
    id: 'ps-006',
    name: 'Publix Catering — game day meals',
    category: 'vendor',
    cadence: 'per-event',
    status: 'active',
    lastPayment: '2026-02-12',
    nextPayment: '2026-02-19',
    amount: 540,
    recipient: 'Publix Catering',
    method: 'ach',
  },
  {
    id: 'ps-007',
    name: 'Game officials — home contests',
    category: 'misc-ops',
    cadence: 'per-event',
    status: 'active',
    lastPayment: '2026-02-12',
    nextPayment: '2026-02-19',
    amount: 850,
    recipient: 'KaNeXT Conference Officials Pool',
    method: 'ach',
  },
  {
    id: 'ps-008',
    name: 'Pro Floor Solutions — gym maintenance',
    category: 'vendor',
    cadence: 'monthly',
    status: 'active',
    lastPayment: '2026-02-01',
    nextPayment: '2026-03-01',
    amount: 400,
    recipient: 'Pro Floor Solutions',
    method: 'ach',
  },
  {
    id: 'ps-009',
    name: 'Recruiting visit meals',
    category: 'misc-ops',
    cadence: 'per-event',
    status: 'active',
    lastPayment: '2026-02-08',
    nextPayment: '2026-02-22',
    amount: 320,
    recipient: 'Various Restaurants',
    method: 'ach',
  },
  {
    id: 'ps-010',
    name: 'Scholarship disbursement — monthly',
    category: 'player-services',
    cadence: 'monthly',
    status: 'active',
    lastPayment: '2026-02-01',
    nextPayment: '2026-03-01',
    amount: 5_000,
    recipient: 'KaNeXT Financial Aid Office',
    method: 'ach',
  },
];

// =============================================================================
// MOCK DATA — APPROVALS
// =============================================================================

export const PAYMENT_APPROVALS: PaymentApproval[] = [
  {
    id: 'ap-001',
    title: 'Hotel block — Virginia Tech tournament',
    amount: 12_400,
    requestedBy: 'Coach Williams',
    requestDate: '2025-12-11',
    dueDate: '2025-12-17',
    priority: 'critical',
    status: 'pending',
    category: 'travel',
    notes: 'Exceeds single-trip threshold. 16 rooms × 3 nights.',
  },
  {
    id: 'ap-002',
    title: 'Recruiting dinner — 3 prospects',
    amount: 1_350,
    requestedBy: 'Asst. Coach Rivera',
    requestDate: '2025-12-12',
    dueDate: '2025-12-18',
    priority: 'high',
    status: 'pending',
    category: 'misc-ops',
    notes: 'Official visit weekend. 3 prospects + 2 staff.',
  },
  {
    id: 'ap-003',
    title: 'Travel advance — Myrtle Beach Invitational',
    amount: 3_800,
    requestedBy: 'Ops Director',
    requestDate: '2025-12-10',
    dueDate: '2025-12-19',
    priority: 'medium',
    status: 'pending',
    category: 'travel',
    notes: 'Per-diem + charter bus for 22 travelers.',
  },
  {
    id: 'ap-004',
    title: 'Film subscription — Synergy Sports',
    amount: 2_100,
    requestedBy: 'Asst. Coach Lee',
    requestDate: '2025-12-08',
    dueDate: '2025-12-22',
    priority: 'low',
    status: 'pending',
    category: 'vendor',
    notes: 'Annual renewal auto-flagged. Same cost as last year.',
  },
  {
    id: 'ap-005',
    title: 'Player meal plan top-up — December',
    amount: 980,
    requestedBy: 'Compliance Officer',
    requestDate: '2025-12-09',
    dueDate: '2025-12-16',
    priority: 'critical',
    status: 'pending',
    category: 'player-services',
    notes: 'Near NCAA benefit cap — needs waiver before payout.',
  },
  {
    id: 'ap-006',
    title: 'Pre-season scrimmage venue deposit',
    amount: 2_500,
    requestedBy: 'Ops Director',
    requestDate: '2025-11-20',
    dueDate: '2025-12-05',
    priority: 'medium',
    status: 'approved',
    category: 'misc-ops',
    notes: 'Non-refundable deposit for January scrimmage series.',
  },
  {
    id: 'ap-007',
    title: 'Headband/wristband custom order — Nike',
    amount: 1_680,
    requestedBy: 'Equipment Mgr',
    requestDate: '2025-12-02',
    dueDate: '2025-12-10',
    priority: 'low',
    status: 'approved',
    category: 'vendor',
    notes: 'Custom team accessories for conference play.',
  },
  // ── demo_seed approvals — Feb 2026 ──────────────────────────────────────
  {
    id: 'ap-008',
    title: 'Bus charter — away @ Webber International',
    amount: 3_200,
    requestedBy: 'Alicia Washington',
    requestDate: '2026-02-14',
    dueDate: '2026-02-20',
    priority: 'high',
    status: 'pending',
    category: 'travel',
    notes: 'Round-trip charter bus for 18 travelers. Conference game.',
    data_source: 'demo_seed',
  },
  {
    id: 'ap-009',
    title: 'Recruiting trip — Coach Davis eval weekend',
    amount: 1_450,
    requestedBy: 'Marcus Davis',
    requestDate: '2026-02-15',
    dueDate: '2026-02-22',
    priority: 'medium',
    status: 'pending',
    category: 'misc-ops',
    notes: 'Flight MIA→ATL + 2 nights hotel. Evaluating 3 prospects.',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — EXCEPTIONS
// =============================================================================

export const PAYMENT_EXCEPTIONS: PaymentException[] = [
  {
    id: 'ex-001',
    type: 'document',
    title: 'Sports Med LLC — missing W-9',
    amount: 4_200,
    blockedSince: '2025-12-01',
    reason: 'Vendor W-9 expired. New form requested 12/3.',
    resolution: 'Vendor has been notified. Expect by 12/16.',
    assignee: 'A. Thompson',
  },
  {
    id: 'ex-002',
    type: 'limit',
    title: 'Nike spring equipment order — PO over limit',
    amount: 7_250,
    blockedSince: '2025-12-10',
    reason: 'Annual equipment PO limit ($50K) reached. This pushes to $57.25K.',
    resolution: 'AD override pending — in approval queue.',
    assignee: 'Equipment Mgr',
  },
  {
    id: 'ex-003',
    type: 'compliance',
    title: 'Player meal plan — NCAA benefit cap',
    amount: 980,
    blockedSince: '2025-12-09',
    reason: 'Player benefit total approaching NCAA limit for term.',
    resolution: 'Compliance waiver submitted to conference office.',
    assignee: 'Compliance Officer',
  },
  {
    id: 'ex-004',
    type: 'receipt',
    title: 'Recruiting dinner receipt — Oct 28',
    amount: 890,
    blockedSince: '2025-11-15',
    reason: 'Original receipt lost. Coach requested duplicate from restaurant.',
    resolution: 'Restaurant emailed duplicate 12/10. Processing.',
    assignee: 'Asst. Coach Rivera',
  },
  // ── demo_seed exception — held transaction ──────────────────────────────
  {
    id: 'ex-005',
    type: 'document',
    title: 'Scholarship disbursement — March tranche held',
    amount: 1_450,
    blockedSince: '2026-02-14',
    reason: 'Missing roster verification form from registrar. Required by NAIA financial aid compliance before disbursement.',
    resolution: 'Registrar notified 2/14. Awaiting signed roster cert by 2/20.',
    assignee: 'Financial Aid Office',
    data_source: 'demo_seed',
    chain: {
      event: {
        type: 'scholarship_disbursement',
        amount: 1_450,
        date: '2026-02-14',
        description: 'March scholarship tranche — 6 student-athletes',
      },
      rules: {
        policy: 'NAIA Financial Aid Policy',
        threshold: 0,
        autoApprove: false,
        flagged: true,
      },
    },
  },
];

// =============================================================================
// MOCK DATA — AUDIT TRAIL
// =============================================================================

export const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'au-001',
    action: 'released',
    description: 'Bus charter payment — Dec 7 away game',
    amount: 3_400,
    initiatedBy: 'Ops Director',
    approvedBy: 'AD Mitchell',
    timestamp: '2025-12-07T09:15:00',
    reference: 'PAY-2025-0847',
  },
  {
    id: 'au-002',
    action: 'approved',
    description: 'Pre-season scrimmage venue deposit',
    amount: 2_500,
    initiatedBy: 'Ops Director',
    approvedBy: 'AD Mitchell',
    timestamp: '2025-12-05T14:22:00',
    reference: 'PAY-2025-0841',
  },
  {
    id: 'au-003',
    action: 'failed',
    description: 'Sports Med LLC — biweekly trainer fee',
    amount: 4_200,
    initiatedBy: 'System (auto-pay)',
    timestamp: '2025-12-01T06:00:00',
    reference: 'PAY-2025-0838',
  },
  {
    id: 'au-004',
    action: 'initiated',
    description: 'Hotel block request — Virginia Tech',
    amount: 12_400,
    initiatedBy: 'Coach Williams',
    timestamp: '2025-12-11T11:30:00',
    reference: 'PAY-2025-0852',
  },
  {
    id: 'au-005',
    action: 'approved',
    description: 'Nike headband/wristband order',
    amount: 1_680,
    initiatedBy: 'Equipment Mgr',
    approvedBy: 'AD Mitchell',
    timestamp: '2025-12-10T16:05:00',
    reference: 'PAY-2025-0850',
  },
  {
    id: 'au-006',
    action: 'released',
    description: 'Game officials — Dec 9 home game',
    amount: 1_800,
    initiatedBy: 'System (auto-pay)',
    approvedBy: 'Ops Director',
    timestamp: '2025-12-09T08:00:00',
    reference: 'PAY-2025-0849',
  },
  {
    id: 'au-007',
    action: 'initiated',
    description: 'Recruiting dinner — 3 prospects',
    amount: 1_350,
    initiatedBy: 'Asst. Coach Rivera',
    timestamp: '2025-12-12T10:45:00',
    reference: 'PAY-2025-0854',
  },
  {
    id: 'au-008',
    action: 'reversed',
    description: 'Duplicate hotel charge — Courtyard Nov 22',
    amount: 1_240,
    initiatedBy: 'A. Thompson (Admin)',
    approvedBy: 'Finance Office',
    timestamp: '2025-12-04T13:10:00',
    reference: 'PAY-2025-0840',
  },
  {
    id: 'au-009',
    action: 'released',
    description: 'Nike monthly apparel draw — December',
    amount: 8_500,
    initiatedBy: 'System (auto-pay)',
    approvedBy: 'AD Mitchell',
    timestamp: '2025-12-01T07:00:00',
    reference: 'PAY-2025-0836',
  },
  {
    id: 'au-010',
    action: 'rejected',
    description: 'Luxury team dinner — unauthorized venue',
    amount: 3_200,
    initiatedBy: 'Asst. Coach Lee',
    approvedBy: 'AD Mitchell',
    timestamp: '2025-11-28T15:30:00',
    reference: 'PAY-2025-0832',
  },
  // ── demo_seed audit entries — Feb 2026 ──────────────────────────────────
  {
    id: 'au-011',
    action: 'released',
    description: 'Bus charter — away @ Keiser University',
    amount: 3_200,
    initiatedBy: 'Alicia Washington',
    approvedBy: 'Alex Morgan',
    timestamp: '2026-02-11T09:00:00',
    reference: 'PAY-2026-0042',
  },
  {
    id: 'au-012',
    action: 'released',
    description: 'Scholarship disbursement — February tranche',
    amount: 5_000,
    initiatedBy: 'System (auto-pay)',
    approvedBy: 'Financial Aid Office',
    timestamp: '2026-02-01T07:00:00',
    reference: 'PAY-2026-0038',
  },
  {
    id: 'au-013',
    action: 'approved',
    description: 'Select Physical Therapy — February retainer',
    amount: 700,
    initiatedBy: 'System (auto-pay)',
    approvedBy: 'Alex Morgan',
    timestamp: '2026-02-01T08:15:00',
    reference: 'PAY-2026-0039',
  },
  {
    id: 'au-014',
    action: 'released',
    description: 'Game day meals — Thomas University home game',
    amount: 540,
    initiatedBy: 'Alicia Washington',
    approvedBy: 'Alex Morgan',
    timestamp: '2026-02-12T16:30:00',
    reference: 'PAY-2026-0045',
  },
  {
    id: 'au-015',
    action: 'released',
    description: 'Hotel block — Southeastern University trip',
    amount: 1_680,
    initiatedBy: 'Alicia Washington',
    approvedBy: 'Alex Morgan',
    timestamp: '2026-02-15T14:30:00',
    reference: 'PAY-2026-0048',
  },
];

// =============================================================================
// MOCK DATA — DISBURSEMENTS (player-facing)
// =============================================================================

export const DISBURSEMENTS: Disbursement[] = [
  {
    id: 'db-001',
    type: 'per-diem',
    description: 'Per diem — @ Charlotte (Dec 7)',
    amount: 75,
    status: 'paid',
    date: '2025-12-07',
    method: 'card',
    recipient: 'M. Johnson',
  },
  {
    id: 'db-002',
    type: 'per-diem',
    description: 'Per diem — @ App State (Nov 29)',
    amount: 75,
    status: 'paid',
    date: '2025-11-29',
    method: 'card',
    recipient: 'M. Johnson',
  },
  {
    id: 'db-003',
    type: 'travel-reimb',
    description: 'Mileage reimb. — recruiting ride-along Oct',
    amount: 142,
    status: 'processing',
    date: '2025-12-10',
    method: 'ach',
    recipient: 'T. Williams',
  },
  {
    id: 'db-004',
    type: 'equipment',
    description: 'Custom shoes — Nike Kobe 9 replacement',
    amount: 280,
    status: 'pending',
    date: '2025-12-12',
    method: 'card',
    recipient: 'D. Carter',
  },
  {
    id: 'db-005',
    type: 'per-diem',
    description: 'Per diem — @ Virginia Tech (Dec 20)',
    amount: 75,
    status: 'pending',
    date: '2025-12-20',
    method: 'card',
    recipient: 'M. Johnson',
  },
  {
    id: 'db-006',
    type: 'stipend',
    description: 'Student manager stipend — November',
    amount: 500,
    status: 'paid',
    date: '2025-12-01',
    method: 'ach',
    recipient: 'K. Reynolds (Mgr)',
  },
  {
    id: 'db-007',
    type: 'travel-reimb',
    description: 'Parking reimb. — home games Sept-Nov',
    amount: 96,
    status: 'paid',
    date: '2025-12-05',
    method: 'ach',
    recipient: 'A. Brooks',
  },
  {
    id: 'db-008',
    type: 'per-diem',
    description: 'Per diem — Myrtle Beach Invitational',
    amount: 225,
    status: 'pending',
    date: '2025-12-19',
    method: 'card',
    recipient: 'All Travelers (22)',
  },
  // ── demo_seed disbursements — Feb 2026 ──────────────────────────────────
  {
    id: 'db-009',
    type: 'per-diem',
    description: 'Per diem — @ Keiser University (Feb 10)',
    amount: 50,
    status: 'paid',
    date: '2026-02-10',
    method: 'ach',
    recipient: 'All Travelers (18)',
  },
  {
    id: 'db-010',
    type: 'travel-reimb',
    description: 'Mileage reimb. — Coach Davis recruiting trip Jan',
    amount: 186,
    status: 'paid',
    date: '2026-02-05',
    method: 'ach',
    recipient: 'Marcus Davis',
  },
  {
    id: 'db-011',
    type: 'stipend',
    description: 'Student manager stipend — January',
    amount: 400,
    status: 'paid',
    date: '2026-02-01',
    method: 'ach',
    recipient: 'K. Reynolds (Mgr)',
  },
  {
    id: 'db-012',
    type: 'per-diem',
    description: 'Per diem — @ Southeastern University (Feb 17)',
    amount: 50,
    status: 'pending',
    date: '2026-02-17',
    method: 'ach',
    recipient: 'All Travelers (18)',
  },
];

// =============================================================================
// MOCK DATA — WALLETS
// =============================================================================

export const WALLETS: Wallet[] = [
  {
    id: 'w-001',
    name: 'Operating',
    type: 'operating',
    balance: 42_800,
    allocated: 250_000,
    status: 'active',
    lastActivity: '2026-02-15T14:30:00Z',
  },
  {
    id: 'w-002',
    name: 'Travel',
    type: 'travel',
    balance: 25_200,
    allocated: 80_000,
    status: 'active',
    lastActivity: '2026-02-15T14:30:00Z',
  },
  {
    id: 'w-003',
    name: 'Scholarships',
    type: 'scholarships',
    balance: 20_000,
    allocated: 60_000,
    status: 'active',
    lastActivity: '2026-02-01T07:00:00Z',
  },
];

/** Connected payment rails for this organization */
export const CONNECTED_RAILS: ConnectedRail[] = ['ACH', 'Internal'];

// =============================================================================
// MOCK DATA — SETTLED TRANSACTIONS WITH FULL CHAIN
// =============================================================================

export const SETTLED_TRANSACTIONS: SettledTransaction[] = [
  // ── Transaction 1: Bus charter — away @ Keiser ─────────────────────────
  {
    id: 'stx-001',
    description: 'Bus charter — away @ Keiser University',
    amount: 3_200,
    walletId: 'w-002',
    data_source: 'demo_seed',
    chain: {
      event: {
        type: 'travel_expense',
        amount: 3_200,
        date: '2026-02-10',
        description: 'Bus charter — away @ Keiser University',
      },
      rules: {
        policy: 'NAIA Travel Policy',
        threshold: 5_000,
        autoApprove: true,
        flagged: false,
      },
      auth: {
        approver: 'Alex Morgan',
        approvedAt: '2026-02-10T14:30:00Z',
        method: 'digital',
      },
      payment: {
        method: 'ACH',
        processor: 'Internal',
        reference: 'PAY-2026-0042',
        initiatedAt: '2026-02-11T09:00:00Z',
      },
      settlement: {
        settledAt: '2026-02-13T00:00:00Z',
        clearingDays: 2,
        status: 'settled',
      },
      ledger: {
        entryId: 'LE-2026-0042',
        debitAccount: 'Travel',
        creditAccount: 'Vendor — SafeRide Bus Co.',
        postDate: '2026-02-13',
      },
      receipt: {
        receiptId: 'REC-2026-0042',
        url: '#',
        generatedAt: '2026-02-13T00:01:00Z',
      },
    },
  },

  // ── Transaction 2: Scholarship disbursement — February tranche ─────────
  {
    id: 'stx-002',
    description: 'Scholarship disbursement — February tranche (6 student-athletes)',
    amount: 5_000,
    walletId: 'w-003',
    data_source: 'demo_seed',
    chain: {
      event: {
        type: 'scholarship_disbursement',
        amount: 5_000,
        date: '2026-02-01',
        description: 'Monthly scholarship disbursement — 6 student-athletes',
      },
      rules: {
        policy: 'NAIA Financial Aid Policy',
        threshold: 0,
        autoApprove: false,
        flagged: false,
      },
      auth: {
        approver: 'Financial Aid Office',
        approvedAt: '2026-01-30T16:00:00Z',
        method: 'manual',
      },
      payment: {
        method: 'Internal',
        processor: 'Internal',
        reference: 'PAY-2026-0038',
        initiatedAt: '2026-02-01T07:00:00Z',
      },
      settlement: {
        settledAt: '2026-02-01T07:00:00Z',
        clearingDays: 0,
        status: 'settled',
      },
      ledger: {
        entryId: 'LE-2026-0038',
        debitAccount: 'Scholarships',
        creditAccount: 'KaNeXT Financial Aid — Student Accounts',
        postDate: '2026-02-01',
      },
      receipt: {
        receiptId: 'REC-2026-0038',
        url: '#',
        generatedAt: '2026-02-01T07:01:00Z',
      },
    },
  },

  // ── Transaction 3: Athletic training retainer — February ───────────────
  {
    id: 'stx-003',
    description: 'Select Physical Therapy — February retainer',
    amount: 700,
    walletId: 'w-001',
    data_source: 'demo_seed',
    chain: {
      event: {
        type: 'vendor_payment',
        amount: 700,
        date: '2026-02-01',
        description: 'Monthly athletic training retainer — Select Physical Therapy',
      },
      rules: {
        policy: 'Vendor Auto-Pay Policy',
        threshold: 2_500,
        autoApprove: true,
        flagged: false,
      },
      auth: {
        approver: 'System',
        approvedAt: '2026-02-01T06:00:00Z',
        method: 'auto',
      },
      payment: {
        method: 'ACH',
        processor: 'Internal',
        reference: 'PAY-2026-0039',
        initiatedAt: '2026-02-01T08:15:00Z',
      },
      settlement: {
        settledAt: '2026-02-03T00:00:00Z',
        clearingDays: 2,
        status: 'settled',
      },
      ledger: {
        entryId: 'LE-2026-0039',
        debitAccount: 'Medical & Training',
        creditAccount: 'Vendor — Select Physical Therapy',
        postDate: '2026-02-03',
      },
      receipt: {
        receiptId: 'REC-2026-0039',
        url: '#',
        generatedAt: '2026-02-03T00:01:00Z',
      },
    },
  },

  // ── Transaction 4: Game day meals — Thomas University home game ────────
  {
    id: 'stx-004',
    description: 'Pre-game meals — Thomas University home game',
    amount: 540,
    walletId: 'w-001',
    data_source: 'demo_seed',
    chain: {
      event: {
        type: 'gameday_expense',
        amount: 540,
        date: '2026-02-12',
        description: 'Pre-game catering — home vs Thomas University',
      },
      rules: {
        policy: 'Game Day Ops Policy',
        threshold: 2_500,
        autoApprove: true,
        flagged: false,
      },
      auth: {
        approver: 'Alex Morgan',
        approvedAt: '2026-02-12T12:00:00Z',
        method: 'digital',
      },
      payment: {
        method: 'ACH',
        processor: 'Internal',
        reference: 'PAY-2026-0045',
        initiatedAt: '2026-02-12T16:30:00Z',
      },
      settlement: {
        settledAt: '2026-02-14T00:00:00Z',
        clearingDays: 2,
        status: 'settled',
      },
      ledger: {
        entryId: 'LE-2026-0045',
        debitAccount: 'Game Day Operations',
        creditAccount: 'Vendor — Publix Catering',
        postDate: '2026-02-14',
      },
      receipt: {
        receiptId: 'REC-2026-0045',
        url: '#',
        generatedAt: '2026-02-14T00:01:00Z',
      },
    },
  },

  // ── Transaction 5: Hotel block — Southeastern University trip ──────────
  {
    id: 'stx-005',
    description: 'Hotel block — Southeastern University trip (6 rooms, 1 night)',
    amount: 1_680,
    walletId: 'w-002',
    data_source: 'demo_seed',
    chain: {
      event: {
        type: 'travel_expense',
        amount: 1_680,
        date: '2026-02-15',
        description: 'Hotel block — 6 rooms at Hampton Inn Lakeland for SEU trip',
      },
      rules: {
        policy: 'NAIA Travel Policy',
        threshold: 5_000,
        autoApprove: true,
        flagged: false,
      },
      auth: {
        approver: 'Alex Morgan',
        approvedAt: '2026-02-15T10:00:00Z',
        method: 'digital',
      },
      payment: {
        method: 'ACH',
        processor: 'Internal',
        reference: 'PAY-2026-0048',
        initiatedAt: '2026-02-15T14:30:00Z',
      },
      settlement: {
        settledAt: '2026-02-18T00:00:00Z',
        clearingDays: 2,
        status: 'settled',
      },
      ledger: {
        entryId: 'LE-2026-0048',
        debitAccount: 'Travel',
        creditAccount: 'Vendor — Hampton Inn Lakeland',
        postDate: '2026-02-18',
      },
      receipt: {
        receiptId: 'REC-2026-0048',
        url: '#',
        generatedAt: '2026-02-18T00:01:00Z',
      },
    },
  },
];

// =============================================================================
// MOCK DATA — RAIL SETTINGS
// =============================================================================

export interface RailSetting {
  id: string;
  label: string;
  description: string;
  value: string;
  editable: boolean;
}

export const RAIL_SETTINGS: RailSetting[] = [
  { id: 'rs-001', label: 'Default method', description: 'Primary payment method for new streams', value: 'ACH', editable: true },
  { id: 'rs-002', label: 'Single-trip threshold', description: 'Payments above this require AD approval', value: '$10,000', editable: true },
  { id: 'rs-003', label: 'Auto-approve limit', description: 'Recurring payments under this auto-release', value: '$2,500', editable: true },
  { id: 'rs-004', label: 'Settlement window', description: 'ACH settlement timing', value: 'T+2 Business Days', editable: false },
  { id: 'rs-005', label: 'Dual sign-off', description: 'Require two approvers above this amount', value: '$5,000', editable: true },
  { id: 'rs-006', label: 'PO annual limit', description: 'Annual purchase order cap per vendor category', value: '$50,000', editable: true },
  { id: 'rs-007', label: 'Receipt required', description: 'Receipt mandatory for payments above', value: '$25', editable: true },
  { id: 'rs-008', label: 'Compliance hold', description: 'Auto-hold payments flagged by compliance', value: 'Enabled', editable: false },
];
