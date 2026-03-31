/**
 * Church Organization Finance — Mock Data & Types
 * Fund management, budgets, expense requests, commitments, audit trail, reports.
 */

// =============================================================================
// TYPES
// =============================================================================

export type FundType =
  | 'general'
  | 'missions'
  | 'benevolence'
  | 'building'
  | 'youth'
  | 'kids'
  | 'events'
  | 'worship';

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'released'
  | 'paid'
  | 'held'
  | 'rejected';

export type RequestType = 'expense' | 'reimbursement' | 'purchase' | 'transfer';

export type BudgetPeriod = 'monthly' | 'quarterly' | 'annual';

export type ExpenseCategory =
  | 'supplies'
  | 'events'
  | 'travel'
  | 'benevolence'
  | 'equipment'
  | 'contractor'
  | 'utilities'
  | 'rent'
  | 'media'
  | 'food'
  | 'other';

export type AuditStatus = 'complete' | 'incomplete' | 'missing_docs' | 'flagged';

export interface ChurchFund {
  id: string;
  name: string;
  type: FundType;
  purpose: string;
  available: number;
  committed: number;
  spent: number;
  restricted: boolean;
  owners: string[];
  linkedMinistries: string[];
  approvalThreshold: number;
  atRisk: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  category: ExpenseCategory;
  cap: number;
  spent: number;
  committed: number;
}

export interface ChurchBudget {
  id: string;
  name: string;
  period: BudgetPeriod;
  ministry: string;
  fundType: FundType;
  categories: BudgetCategory[];
  totalCap: number;
  totalSpent: number;
  totalCommitted: number;
  varianceNote: string;
}

export interface ApprovalStep {
  role: string;
  name: string;
  action: 'approved' | 'rejected' | 'pending' | 'skipped';
  date?: string;
  note?: string;
}

export interface FinanceRequest {
  id: string;
  title: string;
  type: RequestType;
  amount: number;
  category: ExpenseCategory;
  fund: FundType;
  ministry: string;
  requestedBy: string;
  requestedDate: string;
  status: RequestStatus;
  approvalChain: ApprovalStep[];
  attachments: string[];
  notes: string;
  dueDate: string;
  payee?: string;
}

export interface Commitment {
  id: string;
  requestId: string;
  title: string;
  amount: number;
  fund: FundType;
  dueDate: string;
  payee: string;
  readyForRails: boolean;
  status: 'scheduled' | 'awaiting_release' | 'released';
}

export interface ExpenseEntry {
  id: string;
  requestId: string;
  date: string;
  category: ExpenseCategory;
  fund: FundType;
  ministry: string;
  amount: number;
  status: 'paid' | 'reimbursed' | 'posted';
  description: string;
  approvedBy: string;
  receiptAttached: boolean;
}

export interface AuditEntry {
  id: string;
  entityType: 'request' | 'expense' | 'fund' | 'budget';
  entityId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  evidenceAttached: boolean;
}

export interface FinanceReport {
  id: string;
  name: string;
  type:
    | 'giving_summary'
    | 'spend_by_ministry'
    | 'budget_vs_actual'
    | 'fund_balance'
    | 'benevolence_summary'
    | 'building_fund';
  period: string;
  generatedDate: string;
  generatedBy: string;
}

export interface FinanceHealthTile {
  label: string;
  value: string;
  subValue?: string;
  color: string;
  icon: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const FUND_TYPE_LABELS: Record<FundType, string> = {
  general: 'General Fund',
  missions: 'Missions',
  benevolence: 'Benevolence',
  building: 'Building',
  youth: 'Youth',
  kids: 'Kids',
  events: 'Events',
  worship: 'Worship',
};

export const FUND_TYPE_COLORS: Record<FundType, string> = {
  general: '#5A8A6E',
  missions: '#1A1714',
  benevolence: '#1A1714',
  building: '#B8943E',
  youth: '#B85C5C',
  kids: '#1A1714',
  events: '#5A8A6E',
  worship: '#B8943E',
};

export const FUND_TYPE_ICONS: Record<FundType, string> = {
  general: 'banknote.fill',
  missions: 'globe.americas.fill',
  benevolence: 'heart.fill',
  building: 'building.2.fill',
  youth: 'figure.run',
  kids: 'figure.and.child.holdinghands',
  events: 'calendar.badge.clock',
  worship: 'music.note.list',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  scheduled: 'Scheduled',
  released: 'Released',
  paid: 'Paid',
  held: 'Held',
  rejected: 'Rejected',
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  draft: '#9C9790',
  submitted: '#1A1714',
  pending_approval: '#B8943E',
  approved: '#5A8A6E',
  scheduled: '#5A8A6E',
  released: '#1A1714',
  paid: '#5A8A6E',
  held: '#B85C5C',
  rejected: '#B85C5C',
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  expense: 'Expense',
  reimbursement: 'Reimbursement',
  purchase: 'Purchase',
  transfer: 'Transfer',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  supplies: 'Supplies',
  events: 'Events',
  travel: 'Travel',
  benevolence: 'Benevolence',
  equipment: 'Equipment',
  contractor: 'Contractor',
  utilities: 'Utilities',
  rent: 'Rent',
  media: 'Media',
  food: 'Food',
  other: 'Other',
};

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  supplies: 'shippingbox.fill',
  events: 'party.popper.fill',
  travel: 'airplane',
  benevolence: 'heart.fill',
  equipment: 'wrench.and.screwdriver.fill',
  contractor: 'hammer.fill',
  utilities: 'bolt.fill',
  rent: 'house.fill',
  media: 'play.rectangle.fill',
  food: 'fork.knife',
  other: 'ellipsis.circle.fill',
};

export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  complete: 'Complete',
  incomplete: 'Incomplete',
  missing_docs: 'Missing Docs',
  flagged: 'Flagged',
};

export const AUDIT_STATUS_COLORS: Record<AuditStatus, string> = {
  complete: '#5A8A6E',
  incomplete: '#B8943E',
  missing_docs: '#B85C5C',
  flagged: '#B85C5C',
};

// =============================================================================
// SEEDED FUNDS
// =============================================================================

const FUNDS: ChurchFund[] = [
  {
    id: 'fund-001',
    name: 'General Fund',
    type: 'general',
    purpose: 'Tithes and offerings supporting day-to-day church operations, staff salaries, and general ministry expenses.',
    available: 187450,
    committed: 23800,
    spent: 94200,
    restricted: false,
    owners: ['Pastor David Okoro', 'Finance Admin'],
    linkedMinistries: ['Worship', 'Operations', 'Administration'],
    approvalThreshold: 5000,
    atRisk: false,
  },
  {
    id: 'fund-002',
    name: 'Missions Fund',
    type: 'missions',
    purpose: 'Designated giving for local and international mission partners, short-term trips, and missionary support.',
    available: 42300,
    committed: 12000,
    spent: 28500,
    restricted: true,
    owners: ['Missions Director', 'Finance Admin'],
    linkedMinistries: ['Missions', 'Outreach'],
    approvalThreshold: 2500,
    atRisk: false,
  },
  {
    id: 'fund-003',
    name: 'Benevolence Fund',
    type: 'benevolence',
    purpose: 'Confidential assistance for members and community families in crisis — rent, utilities, food, medical.',
    available: 18750,
    committed: 4200,
    spent: 31000,
    restricted: true,
    owners: ['Deacon James', 'Pastor David Okoro'],
    linkedMinistries: ['Deacon Board', 'Community Care'],
    approvalThreshold: 1000,
    atRisk: false,
  },
  {
    id: 'fund-004',
    name: 'Building Fund',
    type: 'building',
    purpose: 'Capital campaign funds for facility expansion, major repairs, and long-term property improvements.',
    available: 312800,
    committed: 45000,
    spent: 67500,
    restricted: true,
    owners: ['Building Committee Chair', 'Finance Admin'],
    linkedMinistries: ['Facilities', 'Building Committee'],
    approvalThreshold: 10000,
    atRisk: false,
  },
  {
    id: 'fund-005',
    name: 'Youth Ministry Fund',
    type: 'youth',
    purpose: 'Fundraised and budgeted funds for youth events, retreats, camps, and ministry supplies.',
    available: 8900,
    committed: 3200,
    spent: 12400,
    restricted: false,
    owners: ['Marcus Davis (Youth Pastor)', 'Finance Admin'],
    linkedMinistries: ['Youth Ministry'],
    approvalThreshold: 500,
    atRisk: true,
  },
];

// =============================================================================
// SEEDED BUDGETS
// =============================================================================

const BUDGETS: ChurchBudget[] = [
  {
    id: 'bgt-001',
    name: 'Youth Ministry Monthly Budget',
    period: 'monthly',
    ministry: 'Youth Ministry',
    fundType: 'youth',
    categories: [
      { id: 'bgt-001-cat-01', name: 'Ministry Supplies', category: 'supplies', cap: 400, spent: 280, committed: 60 },
      { id: 'bgt-001-cat-02', name: 'Events & Activities', category: 'events', cap: 800, spent: 520, committed: 180 },
      { id: 'bgt-001-cat-03', name: 'Food & Snacks', category: 'food', cap: 300, spent: 175, committed: 40 },
      { id: 'bgt-001-cat-04', name: 'Travel & Transportation', category: 'travel', cap: 200, spent: 0, committed: 0 },
      { id: 'bgt-001-cat-05', name: 'Equipment', category: 'equipment', cap: 150, spent: 50, committed: 0 },
    ],
    totalCap: 1850,
    totalSpent: 1025,
    totalCommitted: 280,
    varianceNote: 'Event spending tracking ahead due to spring retreat deposits.',
  },
  {
    id: 'bgt-002',
    name: 'Worship Equipment Budget',
    period: 'quarterly',
    ministry: 'Worship',
    fundType: 'general',
    categories: [
      { id: 'bgt-002-cat-01', name: 'Equipment & Gear', category: 'equipment', cap: 3000, spent: 1200, committed: 850 },
      { id: 'bgt-002-cat-02', name: 'Media & Software', category: 'media', cap: 1500, spent: 800, committed: 0 },
      { id: 'bgt-002-cat-03', name: 'Contract Services', category: 'contractor', cap: 2000, spent: 0, committed: 0 },
      { id: 'bgt-002-cat-04', name: 'Consumable Supplies', category: 'supplies', cap: 500, spent: 350, committed: 0 },
    ],
    totalCap: 7000,
    totalSpent: 2350,
    totalCommitted: 850,
    varianceNote: 'Soundboard repair will consume most of remaining equipment budget.',
  },
  {
    id: 'bgt-003',
    name: 'General Operations Annual',
    period: 'annual',
    ministry: 'Operations',
    fundType: 'general',
    categories: [
      { id: 'bgt-003-cat-01', name: 'Utilities', category: 'utilities', cap: 36000, spent: 18200, committed: 0 },
      { id: 'bgt-003-cat-02', name: 'Facility Rent/Lease', category: 'rent', cap: 72000, spent: 36000, committed: 6000 },
      { id: 'bgt-003-cat-03', name: 'Office & General Supplies', category: 'supplies', cap: 8000, spent: 3800, committed: 200 },
      { id: 'bgt-003-cat-04', name: 'Contract & Professional', category: 'contractor', cap: 15000, spent: 7200, committed: 0 },
      { id: 'bgt-003-cat-05', name: 'Miscellaneous', category: 'other', cap: 5000, spent: 1900, committed: 300 },
    ],
    totalCap: 136000,
    totalSpent: 67100,
    totalCommitted: 6500,
    varianceNote: 'On pace for annual targets. Utilities slightly above trend due to January cold snap.',
  },
];

// =============================================================================
// SEEDED REQUESTS
// =============================================================================

const REQUESTS: FinanceRequest[] = [
  {
    id: 'req-001',
    title: 'Youth Spring Retreat Supplies',
    type: 'expense',
    amount: 480,
    category: 'supplies',
    fund: 'youth',
    ministry: 'Youth Ministry',
    requestedBy: 'Marcus Davis (Youth Pastor)',
    requestedDate: '2026-02-10',
    status: 'pending_approval',
    approvalChain: [
      { role: 'Ministry Lead', name: 'Marcus Davis', action: 'approved', date: '2026-02-10' },
      { role: 'Finance Review', name: 'Finance Admin', action: 'pending' },
    ],
    attachments: ['retreat-supply-list.pdf'],
    notes: 'Supplies for 35 students — art materials, journals, name tags, and small group kits.',
    dueDate: '2026-02-25',
  },
  {
    id: 'req-002',
    title: 'Soundboard Repair Invoice',
    type: 'expense',
    amount: 2850,
    category: 'equipment',
    fund: 'general',
    ministry: 'Worship',
    requestedBy: 'Worship Director',
    requestedDate: '2026-02-05',
    status: 'approved',
    approvalChain: [
      { role: 'Ministry Lead', name: 'Worship Director', action: 'approved', date: '2026-02-05' },
      { role: 'Finance Review', name: 'Finance Admin', action: 'approved', date: '2026-02-07' },
      { role: 'Senior Pastor', name: 'Pastor David Okoro', action: 'approved', date: '2026-02-08', note: 'Approved — critical for Sunday services.' },
    ],
    attachments: ['soundboard-invoice-2026.pdf', 'vendor-quote.pdf'],
    notes: 'Yamaha TF3 main board repair. Vendor: ProAudio Solutions. Invoice #PA-8841.',
    dueDate: '2026-02-20',
    payee: 'ProAudio Solutions',
  },
  {
    id: 'req-003',
    title: 'Benevolence Case #1042',
    type: 'expense',
    amount: 1200,
    category: 'benevolence',
    fund: 'benevolence',
    ministry: 'Deacon Board',
    requestedBy: 'Deacon James',
    requestedDate: '2026-02-12',
    status: 'held',
    approvalChain: [
      { role: 'Deacon Board', name: 'Deacon James', action: 'approved', date: '2026-02-12' },
      { role: 'Finance Review', name: 'Finance Admin', action: 'pending', note: 'Awaiting landlord verification letter.' },
    ],
    attachments: [],
    notes: 'Rent assistance for family in crisis. Held pending landlord verification and case documentation.',
    dueDate: '2026-02-22',
    payee: 'Landlord — Case #1042',
  },
  {
    id: 'req-004',
    title: 'VBS Planning Materials',
    type: 'purchase',
    amount: 650,
    category: 'supplies',
    fund: 'kids',
    ministry: 'Children\'s Ministry',
    requestedBy: 'Children\'s Pastor',
    requestedDate: '2026-02-14',
    status: 'draft',
    approvalChain: [],
    attachments: [],
    notes: 'Curriculum kits, decorations, and craft supplies for Vacation Bible School 2026. Still finalizing vendor.',
    dueDate: '',
  },
  {
    id: 'req-005',
    title: 'Missions Quarterly Disbursement',
    type: 'transfer',
    amount: 12000,
    category: 'missions' as ExpenseCategory,
    fund: 'missions',
    ministry: 'Missions',
    requestedBy: 'Finance Admin',
    requestedDate: '2026-02-01',
    status: 'scheduled',
    approvalChain: [
      { role: 'Missions Director', name: 'Missions Director', action: 'approved', date: '2026-02-01' },
      { role: 'Finance Review', name: 'Finance Admin', action: 'approved', date: '2026-02-03' },
      { role: 'Senior Pastor', name: 'Pastor David Okoro', action: 'approved', date: '2026-02-04' },
    ],
    attachments: ['q1-missions-disbursement-schedule.pdf'],
    notes: 'Quarterly distribution to 4 mission partners: $3,000 each per partnership agreement.',
    dueDate: '2026-03-01',
    payee: 'Multiple Mission Partners',
  },
  {
    id: 'req-006',
    title: 'Pastor Conference Travel',
    type: 'reimbursement',
    amount: 1800,
    category: 'travel',
    fund: 'general',
    ministry: 'Administration',
    requestedBy: 'Pastor David Okoro',
    requestedDate: '2026-01-28',
    status: 'paid',
    approvalChain: [
      { role: 'Finance Review', name: 'Finance Admin', action: 'approved', date: '2026-01-29' },
      { role: 'Board Treasurer', name: 'Treasurer Williams', action: 'approved', date: '2026-01-30' },
    ],
    attachments: ['flight-receipt.pdf', 'hotel-receipt.pdf', 'conference-registration.pdf'],
    notes: 'Reimbursement for National Pastors Conference — Dallas, TX. Jan 20-23.',
    dueDate: '2026-02-05',
    payee: 'Pastor David Okoro',
  },
  {
    id: 'req-007',
    title: 'Sunday Coffee Ministry Supplies',
    type: 'expense',
    amount: 185,
    category: 'food',
    fund: 'general',
    ministry: 'Hospitality',
    requestedBy: 'Martha Johnson',
    requestedDate: '2026-02-15',
    status: 'pending_approval',
    approvalChain: [
      { role: 'Ministry Lead', name: 'Martha Johnson', action: 'approved', date: '2026-02-15' },
      { role: 'Finance Review', name: 'Finance Admin', action: 'pending' },
    ],
    attachments: ['costco-receipt-02-15.jpg'],
    notes: 'Coffee beans, creamer, cups, and napkins for 4 weeks of Sunday services.',
    dueDate: '2026-02-19',
    payee: 'Martha Johnson',
  },
  {
    id: 'req-008',
    title: 'Parking Lot Repair Deposit',
    type: 'expense',
    amount: 8500,
    category: 'contractor',
    fund: 'building',
    ministry: 'Facilities',
    requestedBy: 'Facilities Manager',
    requestedDate: '2026-02-13',
    status: 'pending_approval',
    approvalChain: [
      { role: 'Facilities Manager', name: 'Facilities Manager', action: 'approved', date: '2026-02-13' },
      { role: 'Building Committee', name: 'Building Committee Chair', action: 'approved', date: '2026-02-14' },
      { role: 'Finance Review', name: 'Finance Admin', action: 'pending' },
      { role: 'Senior Pastor', name: 'Pastor David Okoro', action: 'pending' },
    ],
    attachments: ['parking-lot-estimate.pdf', 'contractor-license.pdf'],
    notes: '50% deposit for north lot resurfacing and restriping. Contractor: AllPave Inc. Total project: $17,000.',
    dueDate: '2026-03-05',
    payee: 'AllPave Inc.',
  },
];

// =============================================================================
// SEEDED COMMITMENTS
// =============================================================================

const COMMITMENTS: Commitment[] = [
  {
    id: 'cmt-001',
    requestId: 'req-002',
    title: 'Soundboard Repair — ProAudio Solutions',
    amount: 2850,
    fund: 'general',
    dueDate: '2026-02-20',
    payee: 'ProAudio Solutions',
    readyForRails: true,
    status: 'awaiting_release',
  },
  {
    id: 'cmt-002',
    requestId: 'req-005',
    title: 'Missions Q1 Disbursement',
    amount: 12000,
    fund: 'missions',
    dueDate: '2026-03-01',
    payee: 'Multiple Mission Partners',
    readyForRails: false,
    status: 'scheduled',
  },
  {
    id: 'cmt-003',
    requestId: 'req-008',
    title: 'Parking Lot Resurfacing Deposit',
    amount: 8500,
    fund: 'building',
    dueDate: '2026-03-05',
    payee: 'AllPave Inc.',
    readyForRails: false,
    status: 'awaiting_release',
  },
  {
    id: 'cmt-004',
    requestId: 'req-001',
    title: 'Youth Retreat Venue Deposit',
    amount: 1200,
    fund: 'youth',
    dueDate: '2026-02-28',
    payee: 'Camp Horizon Retreat Center',
    readyForRails: false,
    status: 'awaiting_release',
  },
];

// =============================================================================
// SEEDED EXPENSES
// =============================================================================

const EXPENSES: ExpenseEntry[] = [
  {
    id: 'exp-001',
    requestId: 'req-006',
    date: '2026-02-05',
    category: 'travel',
    fund: 'general',
    ministry: 'Administration',
    amount: 1800,
    status: 'reimbursed',
    description: 'Pastor Conference — flight, hotel, registration reimbursement',
    approvedBy: 'Treasurer Williams',
    receiptAttached: true,
  },
  {
    id: 'exp-002',
    requestId: '',
    date: '2026-02-08',
    category: 'utilities',
    fund: 'general',
    ministry: 'Operations',
    amount: 3420,
    status: 'paid',
    description: 'February electric bill — main campus',
    approvedBy: 'Finance Admin',
    receiptAttached: true,
  },
  {
    id: 'exp-003',
    requestId: '',
    date: '2026-02-10',
    category: 'rent',
    fund: 'general',
    ministry: 'Operations',
    amount: 6000,
    status: 'paid',
    description: 'February facility lease payment',
    approvedBy: 'Finance Admin',
    receiptAttached: true,
  },
  {
    id: 'exp-004',
    requestId: '',
    date: '2026-02-11',
    category: 'food',
    fund: 'general',
    ministry: 'Hospitality',
    amount: 210,
    status: 'paid',
    description: 'Wednesday night dinner supplies — Feb 12 fellowship meal',
    approvedBy: 'Finance Admin',
    receiptAttached: true,
  },
  {
    id: 'exp-005',
    requestId: '',
    date: '2026-02-13',
    category: 'supplies',
    fund: 'youth',
    ministry: 'Youth Ministry',
    amount: 145,
    status: 'posted',
    description: 'Small group study guides and journals for spring semester',
    approvedBy: 'Marcus Davis (Youth Pastor)',
    receiptAttached: true,
  },
  {
    id: 'exp-006',
    requestId: '',
    date: '2026-02-14',
    category: 'benevolence',
    fund: 'benevolence',
    ministry: 'Deacon Board',
    amount: 800,
    status: 'paid',
    description: 'Benevolence Case #1038 — grocery assistance and utility payment',
    approvedBy: 'Deacon James',
    receiptAttached: false,
  },
];

// =============================================================================
// SEEDED AUDIT TRAIL
// =============================================================================

const AUDIT_TRAIL: AuditEntry[] = [
  {
    id: 'aud-001',
    entityType: 'request',
    entityId: 'req-002',
    action: 'Request Created',
    performedBy: 'Worship Director',
    timestamp: '2026-02-05T09:15:00Z',
    details: 'Soundboard repair expense request submitted — $2,850.',
    evidenceAttached: true,
  },
  {
    id: 'aud-002',
    entityType: 'request',
    entityId: 'req-002',
    action: 'Approved by Finance',
    performedBy: 'Finance Admin',
    timestamp: '2026-02-07T14:30:00Z',
    details: 'Finance review approved. Vendor quote verified against market rate.',
    evidenceAttached: true,
  },
  {
    id: 'aud-003',
    entityType: 'request',
    entityId: 'req-002',
    action: 'Approved by Senior Pastor',
    performedBy: 'Pastor David Okoro',
    timestamp: '2026-02-08T08:45:00Z',
    details: 'Final approval granted — critical for Sunday services.',
    evidenceAttached: false,
  },
  {
    id: 'aud-004',
    entityType: 'fund',
    entityId: 'fund-002',
    action: 'Disbursement Scheduled',
    performedBy: 'Finance Admin',
    timestamp: '2026-02-03T11:00:00Z',
    details: 'Q1 missions disbursement of $12,000 scheduled for March 1.',
    evidenceAttached: true,
  },
  {
    id: 'aud-005',
    entityType: 'request',
    entityId: 'req-003',
    action: 'Request Held',
    performedBy: 'Finance Admin',
    timestamp: '2026-02-13T16:20:00Z',
    details: 'Benevolence Case #1042 placed on hold — landlord verification letter missing.',
    evidenceAttached: false,
  },
  {
    id: 'aud-006',
    entityType: 'expense',
    entityId: 'exp-001',
    action: 'Reimbursement Processed',
    performedBy: 'Finance Admin',
    timestamp: '2026-02-05T15:00:00Z',
    details: 'Pastor conference travel reimbursement of $1,800 processed via ACH.',
    evidenceAttached: true,
  },
  {
    id: 'aud-007',
    entityType: 'request',
    entityId: 'req-001',
    action: 'Request Created',
    performedBy: 'Marcus Davis (Youth Pastor)',
    timestamp: '2026-02-10T10:30:00Z',
    details: 'Youth spring retreat supply request submitted — $480.',
    evidenceAttached: true,
  },
  {
    id: 'aud-008',
    entityType: 'budget',
    entityId: 'bgt-001',
    action: 'Variance Alert',
    performedBy: 'System',
    timestamp: '2026-02-12T00:00:00Z',
    details: 'Youth Ministry monthly budget events category at 65% utilization mid-month.',
    evidenceAttached: false,
  },
  {
    id: 'aud-009',
    entityType: 'request',
    entityId: 'req-008',
    action: 'Request Created',
    performedBy: 'Facilities Manager',
    timestamp: '2026-02-13T09:00:00Z',
    details: 'Parking lot repair deposit request submitted — $8,500. Requires multi-level approval.',
    evidenceAttached: true,
  },
  {
    id: 'aud-010',
    entityType: 'fund',
    entityId: 'fund-005',
    action: 'At-Risk Alert',
    performedBy: 'System',
    timestamp: '2026-02-14T00:00:00Z',
    details: 'Youth Ministry Fund available balance ($8,900) approaching committed obligations ($3,200). Net available: $5,700.',
    evidenceAttached: false,
  },
];

// =============================================================================
// SEEDED REPORTS
// =============================================================================

const REPORTS: FinanceReport[] = [
  {
    id: 'rpt-001',
    name: 'Giving Summary — January 2026',
    type: 'giving_summary',
    period: 'January 2026',
    generatedDate: '2026-02-01',
    generatedBy: 'Finance Admin',
  },
  {
    id: 'rpt-002',
    name: 'Spend by Ministry — Q4 2025',
    type: 'spend_by_ministry',
    period: 'Q4 2025',
    generatedDate: '2026-01-15',
    generatedBy: 'Finance Admin',
  },
  {
    id: 'rpt-003',
    name: 'Budget vs Actual — January 2026',
    type: 'budget_vs_actual',
    period: 'January 2026',
    generatedDate: '2026-02-03',
    generatedBy: 'Finance Admin',
  },
  {
    id: 'rpt-004',
    name: 'Fund Balance History — FY 2025-2026',
    type: 'fund_balance',
    period: 'FY 2025-2026',
    generatedDate: '2026-02-10',
    generatedBy: 'Treasurer Williams',
  },
  {
    id: 'rpt-005',
    name: 'Benevolence Summary — January 2026',
    type: 'benevolence_summary',
    period: 'January 2026',
    generatedDate: '2026-02-01',
    generatedBy: 'Deacon James',
  },
  {
    id: 'rpt-006',
    name: 'Building Fund Summary — YTD 2026',
    type: 'building_fund',
    period: 'YTD 2026',
    generatedDate: '2026-02-15',
    generatedBy: 'Building Committee Chair',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchFinanceData() {
  return {
    funds: FUNDS,
    budgets: BUDGETS,
    requests: REQUESTS,
    commitments: COMMITMENTS,
    expenses: EXPENSES,
    auditTrail: AUDIT_TRAIL,
    reports: REPORTS,
    healthTiles: [
      { label: 'Total Funds', value: '$570,200', subValue: '5 funds', color: '#5A8A6E', icon: 'banknote.fill' },
      { label: 'Committed', value: '$88,200', subValue: 'approved not paid', color: '#B8943E', icon: 'clock.fill' },
      { label: 'Spend MTD', value: '$23,400', subValue: 'vs $28,000 budget', color: '#1A1714', icon: 'chart.bar.fill' },
      { label: 'Benevolence Cases', value: '3', subValue: 'active', color: '#1A1714', icon: 'heart.fill' },
      { label: 'Exceptions', value: '2', subValue: 'held/missing docs', color: '#B85C5C', icon: 'exclamationmark.triangle.fill' },
      { label: 'Audit Score', value: '94%', subValue: 'receipts + approvals', color: '#5A8A6E', icon: 'checkmark.shield.fill' },
    ],
  };
}

export function getFundById(id: string): ChurchFund | undefined {
  return FUNDS.find((f) => f.id === id);
}

export function getRequestById(id: string): FinanceRequest | undefined {
  return REQUESTS.find((r) => r.id === id);
}

export function getRequestsByFund(fund: FundType): FinanceRequest[] {
  return REQUESTS.filter((r) => r.fund === fund);
}

export function getRequestsByStatus(status: RequestStatus): FinanceRequest[] {
  return REQUESTS.filter((r) => r.status === status);
}
