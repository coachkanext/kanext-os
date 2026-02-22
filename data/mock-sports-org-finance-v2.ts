/**
 * Sports Organization Finance V2 — Mock Data & Types
 * 10-tab Finance Hub for Sports Mode organizations.
 * Seeded with KaNeXT Men's Basketball 2025-26 season data.
 * Total program budget ~$250K across 8 buckets (realistic NAIA).
 */

// =============================================================================
// TYPES
// =============================================================================

export type SportsOrgFinanceSubTab =
  | 'overview'
  | 'budget'
  | 'spend'
  | 'approvals'
  | 'vendors'
  | 'travel-spend'
  | 'roster-costs'
  | 'purchasing'
  | 'reporting'
  | 'settings';

export interface FinanceSubTab {
  id: SportsOrgFinanceSubTab;
  label: string;
  icon: string;
}

export interface BudgetBucket {
  id: string;
  name: string;
  planned: number;
  actual: number;
  category: 'travel' | 'staffing' | 'recruiting' | 'gear' | 'facilities' | 'medical' | 'ops' | 'scholarships' | 'gameday' | 'misc';
}

export interface SpendTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  status: 'posted' | 'pending' | 'flagged';
  /** Source tag for seeded data traceability */
  data_source?: string;
}

export interface FinanceApproval {
  id: string;
  title: string;
  amount: number;
  category: string;
  requestedBy: string;
  requestDate: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  approvers: string[];
  status: 'pending' | 'approved' | 'denied';
  /** Source tag for seeded data traceability */
  data_source?: string;
}

export interface VendorCommitment {
  id: string;
  vendor: string;
  service: string;
  annualCost: number;
  paymentCadence: string;
  renewalDate: string;
  status: 'current' | 'expiring' | 'past-due';
}

export interface TripCost {
  id: string;
  tripName: string;
  totalCost: number;
  lodging: number;
  airfare: number;
  ground: number;
  meals: number;
  date: string;
}

export interface RosterCostItem {
  id: string;
  playerName: string;
  scholarship: number;
  stipend: number;
  perDiem: number;
  totalCost: number;
}

export interface PurchaseRequest {
  id: string;
  item: string;
  amount: number;
  requestedBy: string;
  date: string;
  receiptAttached: boolean;
  status: 'submitted' | 'approved' | 'reimbursed' | 'denied';
}

// =============================================================================
// LABEL / COLOR CONSTANTS
// =============================================================================

export const BUDGET_CATEGORY_LABELS: Record<BudgetBucket['category'], string> = {
  travel: 'Travel',
  staffing: 'Staffing',
  recruiting: 'Recruiting',
  gear: 'Gear & Equipment',
  facilities: 'Facilities',
  medical: 'Medical',
  ops: 'Operations',
  scholarships: 'Scholarships/Aid',
  gameday: 'Game Day Ops',
  misc: 'Miscellaneous',
};

export const BUDGET_CATEGORY_COLORS: Record<BudgetBucket['category'], string> = {
  travel: '#1D9BF0',
  staffing: '#1D9BF0',
  recruiting: '#22C55E',
  gear: '#F59E0B',
  facilities: '#1D9BF0',
  medical: '#EF4444',
  ops: '#1D9BF0',
  scholarships: '#1D9BF0',
  gameday: '#F59E0B',
  misc: '#A1A1AA',
};

export const SPEND_STATUS_LABELS: Record<SpendTransaction['status'], string> = {
  posted: 'Posted',
  pending: 'Pending',
  flagged: 'Flagged',
};

export const SPEND_STATUS_COLORS: Record<SpendTransaction['status'], string> = {
  posted: '#22C55E',
  pending: '#F59E0B',
  flagged: '#EF4444',
};

export const FINANCE_APPROVAL_URGENCY_LABELS: Record<FinanceApproval['urgency'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const FINANCE_APPROVAL_URGENCY_COLORS: Record<FinanceApproval['urgency'], string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#1D9BF0',
  low: '#A1A1AA',
};

export const FINANCE_APPROVAL_STATUS_LABELS: Record<FinanceApproval['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};

export const FINANCE_APPROVAL_STATUS_COLORS: Record<FinanceApproval['status'], string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  denied: '#EF4444',
};

export const VENDOR_COMMITMENT_STATUS_LABELS: Record<VendorCommitment['status'], string> = {
  current: 'Current',
  expiring: 'Expiring',
  'past-due': 'Past Due',
};

export const VENDOR_COMMITMENT_STATUS_COLORS: Record<VendorCommitment['status'], string> = {
  current: '#22C55E',
  expiring: '#F59E0B',
  'past-due': '#EF4444',
};

export const PURCHASE_STATUS_LABELS: Record<PurchaseRequest['status'], string> = {
  submitted: 'Submitted',
  approved: 'Approved',
  reimbursed: 'Reimbursed',
  denied: 'Denied',
};

export const PURCHASE_STATUS_COLORS: Record<PurchaseRequest['status'], string> = {
  submitted: '#F59E0B',
  approved: '#1D9BF0',
  reimbursed: '#22C55E',
  denied: '#EF4444',
};

// =============================================================================
// SUB-TABS
// =============================================================================

export const FINANCE_SUB_TABS: FinanceSubTab[] = [
  { id: 'overview', label: 'Overview', icon: 'square.grid.2x2.fill' },
  { id: 'budget', label: 'Budget', icon: 'chart.pie.fill' },
  { id: 'spend', label: 'Spend', icon: 'arrow.down.circle.fill' },
  { id: 'approvals', label: 'Approvals', icon: 'checkmark.seal.fill' },
  { id: 'vendors', label: 'Vendors', icon: 'storefront.fill' },
  { id: 'travel-spend', label: 'Travel Spend', icon: 'airplane' },
  { id: 'roster-costs', label: 'Roster Costs', icon: 'person.3.fill' },
  { id: 'purchasing', label: 'Purchasing', icon: 'cart.fill' },
  { id: 'reporting', label: 'Reporting', icon: 'doc.text.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

// =============================================================================
// SEEDED DATA — KaNeXT Men's Basketball 2025-26
// =============================================================================

export const BUDGET_BUCKETS: BudgetBucket[] = [
  {
    id: 'bb-1',
    name: 'Team Travel',
    planned: 80000,
    actual: 54800,     // 68.5% — slightly over pace (conference play ramp)
    category: 'travel',
  },
  {
    id: 'bb-2',
    name: 'Scholarships & Aid',
    planned: 60000,
    actual: 40000,     // 66.7% — on pace (disbursed monthly)
    category: 'scholarships',
  },
  {
    id: 'bb-3',
    name: 'Equipment & Gear',
    planned: 25000,
    actual: 18200,     // 72.8% — slightly over (pre-season front-loaded)
    category: 'gear',
  },
  {
    id: 'bb-4',
    name: 'Recruiting',
    planned: 15000,
    actual: 8750,      // 58.3% — under pace (spring visits still ahead)
    category: 'recruiting',
  },
  {
    id: 'bb-5',
    name: 'Game Day Operations',
    planned: 20000,
    actual: 14100,     // 70.5% — slightly over (extra home games)
    category: 'gameday',
  },
  {
    id: 'bb-6',
    name: 'Coaching & Staff',
    planned: 30000,
    actual: 20000,     // 66.7% — on pace
    category: 'staffing',
  },
  {
    id: 'bb-7',
    name: 'Medical & Training',
    planned: 10000,
    actual: 7400,      // 74% — over pace (injury spike in Jan)
    category: 'medical',
  },
  {
    id: 'bb-8',
    name: 'Miscellaneous',
    planned: 10000,
    actual: 5900,      // 59% — under pace
    category: 'misc',
  },
];

export const SPEND_TRANSACTIONS: SpendTransaction[] = [
  {
    id: 'st-1',
    description: 'Charter bus — Ave Maria away game',
    amount: 1850,
    category: 'Travel',
    date: '2026-02-14',
    vendor: 'Charter One Transport',
    status: 'posted',
  },
  {
    id: 'st-2',
    description: 'Hotel block — Warner University trip (9 rooms)',
    amount: 2340,
    category: 'Travel',
    date: '2026-02-16',
    vendor: 'Holiday Inn Lake Wales',
    status: 'pending',
  },
  {
    id: 'st-3',
    description: 'Game basketballs — 12 pack Wilson NCAA',
    amount: 1080,
    category: 'Equipment',
    date: '2026-02-01',
    vendor: 'Wilson Sporting Goods',
    status: 'posted',
  },
  {
    id: 'st-4',
    description: 'Physical therapy — 6 player sessions',
    amount: 1800,
    category: 'Medical',
    date: '2026-02-10',
    vendor: 'Select Physical Therapy',
    status: 'posted',
  },
  {
    id: 'st-5',
    description: 'Recruiting trip — coach airfare to Atlanta',
    amount: 425,
    category: 'Recruiting',
    date: '2026-02-08',
    vendor: 'American Airlines',
    status: 'posted',
  },
  {
    id: 'st-6',
    description: 'Gym floor cleaning — monthly service',
    amount: 1200,
    category: 'Facilities',
    date: '2026-02-05',
    vendor: 'Pro Floor Solutions',
    status: 'posted',
  },
  {
    id: 'st-7',
    description: 'Team meals — home game day catering',
    amount: 680,
    category: 'Operations',
    date: '2026-02-12',
    vendor: 'Publix Catering',
    status: 'posted',
  },
  {
    id: 'st-8',
    description: 'Conference tournament entry fee',
    amount: 2500,
    category: 'Operations',
    date: '2026-02-15',
    vendor: 'KaNeXT Conference',
    status: 'flagged',
  },
  // ── demo_seed transactions ──────────────────────────────────────────────
  {
    id: 'st-9',
    description: 'Bus charter — away @ Keiser University',
    amount: 3200,
    category: 'Travel',
    date: '2026-02-10',
    vendor: 'SafeRide Bus Co.',
    status: 'posted',
    data_source: 'demo_seed',
  },
  {
    id: 'st-10',
    description: 'Pre-game meals — Thomas University home game',
    amount: 540,
    category: 'Game Day',
    date: '2026-02-12',
    vendor: 'Publix Catering',
    status: 'posted',
    data_source: 'demo_seed',
  },
  {
    id: 'st-11',
    description: 'Ankle braces & KT tape restock',
    amount: 385,
    category: 'Medical',
    date: '2026-02-09',
    vendor: 'DJO Global',
    status: 'posted',
    data_source: 'demo_seed',
  },
  {
    id: 'st-12',
    description: 'Hotel block — Southeastern University trip (6 rooms)',
    amount: 1680,
    category: 'Travel',
    date: '2026-02-17',
    vendor: 'Hampton Inn Lakeland',
    status: 'pending',
    data_source: 'demo_seed',
  },
  {
    id: 'st-13',
    description: 'Scoreboard graphics package — home games Feb',
    amount: 750,
    category: 'Game Day',
    date: '2026-02-06',
    vendor: 'Daktronics',
    status: 'posted',
    data_source: 'demo_seed',
  },
];

export const FINANCE_APPROVALS: FinanceApproval[] = [
  {
    id: 'fa-1',
    title: 'Conference Tournament Travel Package',
    amount: 12400,
    category: 'Travel',
    requestedBy: 'Alicia Washington',
    requestDate: '2026-02-10',
    urgency: 'critical',
    approvers: ['Athletic Director', 'CFO'],
    status: 'pending',
  },
  {
    id: 'fa-2',
    title: 'Spring Recruiting Budget — March Visits',
    amount: 8500,
    category: 'Recruiting',
    requestedBy: 'Marcus Davis',
    requestDate: '2026-02-12',
    urgency: 'high',
    approvers: ['Athletic Director'],
    status: 'pending',
  },
  {
    id: 'fa-3',
    title: 'Auxiliary Gym Floor Resurfacing',
    amount: 22000,
    category: 'Facilities',
    requestedBy: 'Robert Jackson',
    requestDate: '2026-01-30',
    urgency: 'medium',
    approvers: ['Athletic Director', 'Facilities Director', 'CFO'],
    status: 'pending',
  },
  {
    id: 'fa-4',
    title: 'Dr. Dish Machine Replacement',
    amount: 4800,
    category: 'Equipment',
    requestedBy: 'Robert Jackson',
    requestDate: '2026-02-08',
    urgency: 'low',
    approvers: ['Athletic Director'],
    status: 'approved',
  },
  // ── demo_seed approvals ─────────────────────────────────────────────────
  {
    id: 'fa-5',
    title: 'Bus Charter — Away Game @ Webber International',
    amount: 3200,
    category: 'Travel',
    requestedBy: 'Alicia Washington',
    requestDate: '2026-02-14',
    urgency: 'high',
    approvers: ['Athletic Director'],
    status: 'pending',
    data_source: 'demo_seed',
  },
  {
    id: 'fa-6',
    title: 'Practice Jerseys — Reversible Set (20 ct)',
    amount: 1800,
    category: 'Equipment',
    requestedBy: 'Robert Jackson',
    requestDate: '2026-02-13',
    urgency: 'medium',
    approvers: ['Athletic Director'],
    status: 'pending',
    data_source: 'demo_seed',
  },
  {
    id: 'fa-7',
    title: 'Recruiting Trip — Flight & Hotel for Eval Weekend',
    amount: 1450,
    category: 'Recruiting',
    requestedBy: 'Marcus Davis',
    requestDate: '2026-02-15',
    urgency: 'medium',
    approvers: ['Athletic Director', 'Head Coach'],
    status: 'pending',
    data_source: 'demo_seed',
  },
];

export const VENDOR_COMMITMENTS: VendorCommitment[] = [
  {
    id: 'vc-1',
    vendor: 'SafeRide Bus Co.',
    service: 'Team Bus Charter — Season Package',
    annualCost: 14400,
    paymentCadence: 'Per Trip',
    renewalDate: '2026-04-30',
    status: 'current',
  },
  {
    id: 'vc-2',
    vendor: 'Select Physical Therapy',
    service: 'Athletic Training Retainer',
    annualCost: 8400,
    paymentCadence: 'Monthly',
    renewalDate: '2026-08-31',
    status: 'current',
  },
  {
    id: 'vc-3',
    vendor: 'Hudl',
    service: 'Video Platform — Team Plan',
    annualCost: 2400,
    paymentCadence: 'Annual',
    renewalDate: '2026-06-30',
    status: 'current',
  },
  {
    id: 'vc-4',
    vendor: 'Publix Catering',
    service: 'Game Day Meals — Home Games',
    annualCost: 6000,
    paymentCadence: 'Per Event',
    renewalDate: '2026-05-15',
    status: 'expiring',
  },
  {
    id: 'vc-5',
    vendor: 'Pro Floor Solutions',
    service: 'Gym Floor Maintenance — Quarterly',
    annualCost: 4800,
    paymentCadence: 'Quarterly',
    renewalDate: '2026-03-01',
    status: 'past-due',
  },
];

export const TRIP_COSTS: TripCost[] = [
  {
    id: 'tc-1',
    tripName: 'Ave Maria University — Feb 15',
    totalCost: 1950,
    lodging: 0,
    airfare: 0,
    ground: 1350,
    meals: 600,
    date: '2026-02-15',
  },
  {
    id: 'tc-2',
    tripName: 'Warner University — Feb 21-22',
    totalCost: 3100,
    lodging: 1200,
    airfare: 0,
    ground: 1300,
    meals: 600,
    date: '2026-02-21',
  },
  {
    id: 'tc-3',
    tripName: 'KaNeXT Conference Tournament — Feb 26-Mar 2',
    totalCost: 7800,
    lodging: 3200,
    airfare: 0,
    ground: 2400,
    meals: 2200,
    date: '2026-02-26',
  },
  {
    id: 'tc-4',
    tripName: 'Keiser University — Feb 10',
    totalCost: 3200,
    lodging: 0,
    airfare: 0,
    ground: 2400,
    meals: 800,
    date: '2026-02-10',
  },
  {
    id: 'tc-5',
    tripName: 'Southeastern University — Feb 17-18',
    totalCost: 2880,
    lodging: 1200,
    airfare: 0,
    ground: 1080,
    meals: 600,
    date: '2026-02-17',
  },
];

export const ROSTER_COST_ITEMS: RosterCostItem[] = [
  {
    id: 'rc-1',
    playerName: 'Jaylen Brooks',
    scholarship: 8500,
    stipend: 1200,
    perDiem: 600,
    totalCost: 10300,
  },
  {
    id: 'rc-2',
    playerName: 'Marcus Hill',
    scholarship: 8500,
    stipend: 1200,
    perDiem: 600,
    totalCost: 10300,
  },
  {
    id: 'rc-3',
    playerName: 'DeAndre Wilson',
    scholarship: 7000,
    stipend: 1000,
    perDiem: 600,
    totalCost: 8600,
  },
  {
    id: 'rc-4',
    playerName: 'Chris Johnson',
    scholarship: 6000,
    stipend: 800,
    perDiem: 600,
    totalCost: 7400,
  },
  {
    id: 'rc-5',
    playerName: 'Terrance Moore',
    scholarship: 5000,
    stipend: 800,
    perDiem: 600,
    totalCost: 6400,
  },
  {
    id: 'rc-6',
    playerName: 'Kevin Wright',
    scholarship: 4000,
    stipend: 600,
    perDiem: 600,
    totalCost: 5200,
  },
];

export const PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: 'pr-1',
    item: 'Practice basketballs — Wilson Evolution (36 ct)',
    amount: 2160,
    requestedBy: 'Kayla Thompson',
    date: '2026-02-12',
    receiptAttached: false,
    status: 'submitted',
  },
  {
    id: 'pr-2',
    item: 'Athletic tape & wrap supplies — monthly restock',
    amount: 340,
    requestedBy: 'David Chen',
    date: '2026-02-10',
    receiptAttached: true,
    status: 'approved',
  },
  {
    id: 'pr-3',
    item: 'Recruiting visit meals — 4 prospects',
    amount: 480,
    requestedBy: 'Jerome Patterson',
    date: '2026-02-14',
    receiptAttached: false,
    status: 'submitted',
  },
  {
    id: 'pr-4',
    item: 'iPad screen protectors (6 ct)',
    amount: 90,
    requestedBy: 'Kayla Thompson',
    date: '2026-02-08',
    receiptAttached: true,
    status: 'reimbursed',
  },
  {
    id: 'pr-5',
    item: 'Team warmup jackets — Nike custom order',
    amount: 3600,
    requestedBy: 'Alicia Washington',
    date: '2026-02-06',
    receiptAttached: false,
    status: 'denied',
  },
];

// =============================================================================
// OVERVIEW SUMMARY
// =============================================================================

export interface FinanceOverview {
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  variancePercent: number;
  bucketsOverBudget: number;
  pendingApprovals: number;
  pendingApprovalAmount: number;
  flaggedTransactions: number;
  vendorsExpiring: number;
  vendorsPastDue: number;
  totalTravelSpend: number;
  totalRosterCost: number;
  openPurchaseRequests: number;
}

export function getFinanceOverview(): FinanceOverview {
  const totalBudget = BUDGET_BUCKETS.reduce((sum, b) => sum + b.planned, 0);
  const totalActual = BUDGET_BUCKETS.reduce((sum, b) => sum + b.actual, 0);
  const totalVariance = totalBudget - totalActual;
  const pendingApprovals = FINANCE_APPROVALS.filter((a) => a.status === 'pending');

  return {
    totalBudget,
    totalActual,
    totalVariance,
    variancePercent: totalBudget > 0 ? Math.round((totalVariance / totalBudget) * 100) : 0,
    bucketsOverBudget: BUDGET_BUCKETS.filter((b) => b.actual > b.planned).length,
    pendingApprovals: pendingApprovals.length,
    pendingApprovalAmount: pendingApprovals.reduce((sum, a) => sum + a.amount, 0),
    flaggedTransactions: SPEND_TRANSACTIONS.filter((t) => t.status === 'flagged').length,
    vendorsExpiring: VENDOR_COMMITMENTS.filter((v) => v.status === 'expiring').length,
    vendorsPastDue: VENDOR_COMMITMENTS.filter((v) => v.status === 'past-due').length,
    totalTravelSpend: TRIP_COSTS.reduce((sum, t) => sum + t.totalCost, 0),
    totalRosterCost: ROSTER_COST_ITEMS.reduce((sum, r) => sum + r.totalCost, 0),
    openPurchaseRequests: PURCHASE_REQUESTS.filter((p) => p.status === 'submitted').length,
  };
}
