/**
 * Church Organization Donations/Giving — Mock Data & Types (v2)
 * Funds, campaigns, donors, recurring gifts, receipts, statements,
 * reconciliation, controls, and campaign updates.
 */

// =============================================================================
// TYPES
// =============================================================================

export type FundType =
  | 'general'
  | 'benevolence'
  | 'building'
  | 'missions'
  | 'youth'
  | 'kids'
  | 'worship'
  | 'outreach';

export type FundRestriction = 'unrestricted' | 'designated' | 'restricted';
export type FundStatus = 'active' | 'closed' | 'archived';
export type CampaignStatus = 'active' | 'completed' | 'paused' | 'draft';
export type GiftFrequency = 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type GiftMethod = 'card' | 'ach' | 'cash' | 'check' | 'apple_pay';
export type ReceiptStatus = 'generated' | 'sent' | 'pending' | 'failed';
export type ReconciliationStatus = 'processed' | 'pending' | 'failed' | 'returned' | 'needs_action';
export type DonorStatus = 'active' | 'lapsed' | 'new';

export interface GivingFund {
  id: string;
  name: string;
  type: FundType;
  purpose: string;
  status: FundStatus;
  restriction: FundRestriction;
  balance: number;
  goalAmount?: number;
  owner: string;
  usedByCampaigns: number;
  reportingCategory: 'operations' | 'mission' | 'capital';
  refundsAllowed: boolean;
  publicPage: boolean;
}

export interface GivingCampaign {
  id: string;
  name: string;
  fundId: string;
  fundName: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  deadline: string;
  owner: string;
  ministry?: string;
  updatesCount: number;
  isPublic: boolean;
  status: CampaignStatus;
  description: string;
}

export interface DonorProfile {
  id: string;
  name: string;
  status: DonorStatus;
  lifetimeGivingBand: string;
  recurringStatus: boolean;
  lastGiftDate: string;
  totalGiftsYTD: number;
  preferredMethod: GiftMethod;
  taxStatementReady: boolean;
}

export interface RecurringGift {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  frequency: GiftFrequency;
  designation: FundType;
  method: GiftMethod;
  nextChargeDate: string;
  status: 'active' | 'paused' | 'cancelled' | 'failed';
  createdDate: string;
}

export interface GivingReceipt {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  designation: FundType;
  fundName: string;
  date: string;
  method: GiftMethod;
  receiptId: string;
  taxDeductible: boolean;
  status: ReceiptStatus;
}

export interface GivingStatement {
  id: string;
  donorId: string;
  donorName: string;
  period: string;
  totalAmount: number;
  giftCount: number;
  generatedDate: string;
  sentStatus: 'draft' | 'sent' | 'not_generated';
  version: number;
}

export interface ReconciliationItem {
  id: string;
  transactionRef: string;
  amount: number;
  fund: FundType;
  status: ReconciliationStatus;
  method: GiftMethod;
  date: string;
  notes?: string;
}

export interface GivingControl {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: 'active' | 'needs_review';
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  campaignName: string;
  title: string;
  content: string;
  postedBy: string;
  postedDate: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const FUND_TYPE_LABELS: Record<FundType, string> = {
  general: 'General',
  benevolence: 'Benevolence',
  building: 'Building',
  missions: 'Missions',
  youth: 'Youth',
  kids: 'Kids',
  worship: 'Worship',
  outreach: 'Outreach',
};

export const FUND_TYPE_COLORS: Record<FundType, string> = {
  general: '#6AA9FF',
  benevolence: '#EC4899',
  building: '#F59E0B',
  missions: '#8B5CF6',
  youth: '#EF4444',
  kids: '#22C55E',
  worship: '#10B981',
  outreach: '#F97316',
};

export const FUND_TYPE_ICONS: Record<FundType, string> = {
  general: 'banknote.fill',
  benevolence: 'heart.fill',
  building: 'building.2.fill',
  missions: 'globe',
  youth: 'figure.run',
  kids: 'figure.and.child.holdinghands',
  worship: 'music.note',
  outreach: 'megaphone.fill',
};

export const FUND_RESTRICTION_LABELS: Record<FundRestriction, string> = {
  unrestricted: 'Unrestricted',
  designated: 'Designated',
  restricted: 'Restricted',
};

export const FUND_STATUS_LABELS: Record<FundStatus, string> = {
  active: 'Active',
  closed: 'Closed',
  archived: 'Archived',
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
  draft: 'Draft',
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  active: '#22C55E',
  completed: '#6AA9FF',
  paused: '#F59E0B',
  draft: '#8F8F8F',
};

export const GIFT_FREQUENCY_LABELS: Record<GiftFrequency, string> = {
  one_time: 'One-Time',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

export const GIFT_METHOD_LABELS: Record<GiftMethod, string> = {
  card: 'Credit/Debit Card',
  ach: 'Bank Transfer (ACH)',
  cash: 'Cash',
  check: 'Check',
  apple_pay: 'Apple Pay',
};

export const GIFT_METHOD_ICONS: Record<GiftMethod, string> = {
  card: 'creditcard.fill',
  ach: 'building.columns.fill',
  cash: 'dollarsign.circle.fill',
  check: 'doc.text.fill',
  apple_pay: 'apple.logo',
};

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  generated: 'Generated',
  sent: 'Sent',
  pending: 'Pending',
  failed: 'Failed',
};

export const RECEIPT_STATUS_COLORS: Record<ReceiptStatus, string> = {
  generated: '#6AA9FF',
  sent: '#22C55E',
  pending: '#F59E0B',
  failed: '#EF4444',
};

export const RECONCILIATION_STATUS_LABELS: Record<ReconciliationStatus, string> = {
  processed: 'Processed',
  pending: 'Pending',
  failed: 'Failed',
  returned: 'Returned',
  needs_action: 'Needs Action',
};

export const RECONCILIATION_STATUS_COLORS: Record<ReconciliationStatus, string> = {
  processed: '#22C55E',
  pending: '#F59E0B',
  failed: '#EF4444',
  returned: '#8B5CF6',
  needs_action: '#F97316',
};

export const DONOR_STATUS_LABELS: Record<DonorStatus, string> = {
  active: 'Active',
  lapsed: 'Lapsed',
  new: 'New',
};

export const DONOR_STATUS_COLORS: Record<DonorStatus, string> = {
  active: '#22C55E',
  lapsed: '#EF4444',
  new: '#6AA9FF',
};

// =============================================================================
// SEEDED FUNDS
// =============================================================================

const FUNDS: GivingFund[] = [
  {
    id: 'fund-001',
    name: 'General Fund',
    type: 'general',
    purpose: 'Supports day-to-day church operations, staff salaries, and ministry programs.',
    status: 'active',
    restriction: 'unrestricted',
    balance: 187450,
    owner: 'Finance Director',
    usedByCampaigns: 0,
    reportingCategory: 'operations',
    refundsAllowed: true,
    publicPage: true,
  },
  {
    id: 'fund-002',
    name: 'Benevolence Fund',
    type: 'benevolence',
    purpose: 'Provides financial assistance to members and community in need.',
    status: 'active',
    restriction: 'restricted',
    balance: 18750,
    owner: 'Deacon Board',
    usedByCampaigns: 0,
    reportingCategory: 'operations',
    refundsAllowed: false,
    publicPage: true,
  },
  {
    id: 'fund-003',
    name: 'Building Fund',
    type: 'building',
    purpose: 'Capital improvements, expansion projects, and major facility repairs.',
    status: 'active',
    restriction: 'designated',
    balance: 312800,
    goalAmount: 500000,
    owner: 'Building Committee Chair',
    usedByCampaigns: 1,
    reportingCategory: 'capital',
    refundsAllowed: false,
    publicPage: true,
  },
  {
    id: 'fund-004',
    name: 'Missions Fund',
    type: 'missions',
    purpose: 'Supports local and international mission trips, partner missionaries, and outreach.',
    status: 'active',
    restriction: 'restricted',
    balance: 42300,
    owner: 'Missions Pastor',
    usedByCampaigns: 1,
    reportingCategory: 'mission',
    refundsAllowed: false,
    publicPage: true,
  },
  {
    id: 'fund-005',
    name: 'Youth Ministry Fund',
    type: 'youth',
    purpose: 'Activities, retreats, and resources for the youth ministry program.',
    status: 'active',
    restriction: 'unrestricted',
    balance: 8900,
    owner: 'Youth Pastor Davis',
    usedByCampaigns: 1,
    reportingCategory: 'operations',
    refundsAllowed: true,
    publicPage: false,
  },
  {
    id: 'fund-006',
    name: 'Worship Arts Fund',
    type: 'worship',
    purpose: 'Equipment, licensing, and resources for the worship team.',
    status: 'active',
    restriction: 'unrestricted',
    balance: 5200,
    owner: 'Worship Director',
    usedByCampaigns: 1,
    reportingCategory: 'operations',
    refundsAllowed: true,
    publicPage: false,
  },
];

// =============================================================================
// SEEDED CAMPAIGNS
// =============================================================================

const CAMPAIGNS: GivingCampaign[] = [
  {
    id: 'camp-001',
    name: 'Easter Outreach Weekend',
    fundId: 'fund-001',
    fundName: 'General Fund',
    goalAmount: 50000,
    raisedAmount: 32400,
    donorCount: 145,
    deadline: '2026-04-05',
    owner: 'Pastor Michael',
    ministry: 'Outreach',
    updatesCount: 2,
    isPublic: true,
    status: 'active',
    description: 'Sponsor meals, gift bags, and community events for Easter weekend outreach across three neighborhoods.',
  },
  {
    id: 'camp-002',
    name: 'Youth Mission Trip',
    fundId: 'fund-005',
    fundName: 'Youth Ministry Fund',
    goalAmount: 12000,
    raisedAmount: 8750,
    donorCount: 34,
    deadline: '2026-06-15',
    owner: 'Youth Pastor Davis',
    ministry: 'Youth',
    updatesCount: 1,
    isPublic: false,
    status: 'active',
    description: 'Send 20 students on a week-long mission trip to serve rural communities in Appalachia.',
  },
  {
    id: 'camp-003',
    name: 'Sanctuary AV Upgrade',
    fundId: 'fund-006',
    fundName: 'Worship Arts Fund',
    goalAmount: 45000,
    raisedAmount: 28000,
    donorCount: 89,
    deadline: '2026-09-01',
    owner: 'Worship Director',
    ministry: 'Worship',
    updatesCount: 1,
    isPublic: true,
    status: 'active',
    description: 'Replace aging projectors, upgrade sound board, and install new LED stage lighting in the main sanctuary.',
  },
];

// =============================================================================
// CAMPAIGN UPDATES
// =============================================================================

const CAMPAIGN_UPDATES: CampaignUpdate[] = [
  {
    id: 'cupd-001',
    campaignId: 'camp-001',
    campaignName: 'Easter Outreach Weekend',
    title: 'We hit 50% of our goal!',
    content: 'Thanks to your generosity, we\'ve raised over $25,000 toward our Easter Outreach. Volunteer sign-ups open next week.',
    postedBy: 'Pastor Michael',
    postedDate: '2026-02-10',
  },
  {
    id: 'cupd-002',
    campaignId: 'camp-001',
    campaignName: 'Easter Outreach Weekend',
    title: 'Neighborhood partnerships confirmed',
    content: 'Three community centers have confirmed partnership for Easter weekend. We\'ll be serving over 500 families.',
    postedBy: 'Outreach Coordinator',
    postedDate: '2026-02-16',
  },
  {
    id: 'cupd-003',
    campaignId: 'camp-002',
    campaignName: 'Youth Mission Trip',
    title: 'Trip details finalized',
    content: 'We\'ve confirmed lodging and project sites in eastern Kentucky. Students will be building wheelchair ramps and running a day camp.',
    postedBy: 'Youth Pastor Davis',
    postedDate: '2026-02-12',
  },
  {
    id: 'cupd-004',
    campaignId: 'camp-003',
    campaignName: 'Sanctuary AV Upgrade',
    title: 'Equipment quotes received',
    content: 'Our AV consultant has provided final quotes for all equipment. Installation can begin once we reach 75% of our goal.',
    postedBy: 'Worship Director',
    postedDate: '2026-02-14',
  },
];

// =============================================================================
// SEEDED DONORS
// =============================================================================

const DONORS: DonorProfile[] = [
  {
    id: 'dnr-001',
    name: 'James & Sarah Mitchell',
    status: 'active',
    lifetimeGivingBand: '$10K+',
    recurringStatus: true,
    lastGiftDate: '2026-02-16',
    totalGiftsYTD: 4800,
    preferredMethod: 'ach',
    taxStatementReady: true,
  },
  {
    id: 'dnr-002',
    name: 'Robert Johnson',
    status: 'active',
    lifetimeGivingBand: '$2K-10K',
    recurringStatus: true,
    lastGiftDate: '2026-02-14',
    totalGiftsYTD: 2400,
    preferredMethod: 'card',
    taxStatementReady: true,
  },
  {
    id: 'dnr-003',
    name: 'Maria Gonzalez',
    status: 'active',
    lifetimeGivingBand: '$2K-10K',
    recurringStatus: true,
    lastGiftDate: '2026-02-09',
    totalGiftsYTD: 1600,
    preferredMethod: 'apple_pay',
    taxStatementReady: false,
  },
  {
    id: 'dnr-004',
    name: 'Thomas & Linda Park',
    status: 'active',
    lifetimeGivingBand: '$10K+',
    recurringStatus: false,
    lastGiftDate: '2026-01-28',
    totalGiftsYTD: 5000,
    preferredMethod: 'check',
    taxStatementReady: true,
  },
  {
    id: 'dnr-005',
    name: 'Angela Williams',
    status: 'new',
    lifetimeGivingBand: '$0-500',
    recurringStatus: false,
    lastGiftDate: '2026-02-11',
    totalGiftsYTD: 150,
    preferredMethod: 'card',
    taxStatementReady: false,
  },
  {
    id: 'dnr-006',
    name: 'David Chen',
    status: 'new',
    lifetimeGivingBand: '$0-500',
    recurringStatus: true,
    lastGiftDate: '2026-02-15',
    totalGiftsYTD: 300,
    preferredMethod: 'apple_pay',
    taxStatementReady: false,
  },
  {
    id: 'dnr-007',
    name: 'Patricia Moore',
    status: 'active',
    lifetimeGivingBand: '$500-2K',
    recurringStatus: true,
    lastGiftDate: '2026-02-02',
    totalGiftsYTD: 800,
    preferredMethod: 'ach',
    taxStatementReady: true,
  },
  {
    id: 'dnr-008',
    name: 'Michael & Karen Davis',
    status: 'active',
    lifetimeGivingBand: '$2K-10K',
    recurringStatus: true,
    lastGiftDate: '2026-02-16',
    totalGiftsYTD: 3200,
    preferredMethod: 'ach',
    taxStatementReady: true,
  },
  {
    id: 'dnr-009',
    name: 'Sandra Thompson',
    status: 'lapsed',
    lifetimeGivingBand: '$500-2K',
    recurringStatus: false,
    lastGiftDate: '2025-09-15',
    totalGiftsYTD: 0,
    preferredMethod: 'card',
    taxStatementReady: false,
  },
  {
    id: 'dnr-010',
    name: 'William Harris',
    status: 'lapsed',
    lifetimeGivingBand: '$2K-10K',
    recurringStatus: false,
    lastGiftDate: '2025-10-22',
    totalGiftsYTD: 0,
    preferredMethod: 'check',
    taxStatementReady: false,
  },
  {
    id: 'dnr-011',
    name: 'Rachel Kim',
    status: 'new',
    lifetimeGivingBand: '$0-500',
    recurringStatus: false,
    lastGiftDate: '2026-02-08',
    totalGiftsYTD: 75,
    preferredMethod: 'cash',
    taxStatementReady: false,
  },
  {
    id: 'dnr-012',
    name: 'Deacon Harold Foster',
    status: 'active',
    lifetimeGivingBand: '$10K+',
    recurringStatus: true,
    lastGiftDate: '2026-02-16',
    totalGiftsYTD: 6000,
    preferredMethod: 'ach',
    taxStatementReady: true,
  },
];

// =============================================================================
// RECURRING GIFTS
// =============================================================================

const RECURRING_GIFTS: RecurringGift[] = [
  {
    id: 'rec-001',
    donorId: 'dnr-001',
    donorName: 'James & Sarah Mitchell',
    amount: 1200,
    frequency: 'monthly',
    designation: 'general',
    method: 'ach',
    nextChargeDate: '2026-03-01',
    status: 'active',
    createdDate: '2024-06-15',
  },
  {
    id: 'rec-002',
    donorId: 'dnr-002',
    donorName: 'Robert Johnson',
    amount: 600,
    frequency: 'monthly',
    designation: 'general',
    method: 'card',
    nextChargeDate: '2026-03-01',
    status: 'active',
    createdDate: '2025-01-10',
  },
  {
    id: 'rec-003',
    donorId: 'dnr-003',
    donorName: 'Maria Gonzalez',
    amount: 100,
    frequency: 'weekly',
    designation: 'general',
    method: 'apple_pay',
    nextChargeDate: '2026-02-23',
    status: 'active',
    createdDate: '2025-08-20',
  },
  {
    id: 'rec-004',
    donorId: 'dnr-006',
    donorName: 'David Chen',
    amount: 50,
    frequency: 'weekly',
    designation: 'youth',
    method: 'apple_pay',
    nextChargeDate: '2026-02-23',
    status: 'active',
    createdDate: '2026-01-05',
  },
  {
    id: 'rec-005',
    donorId: 'dnr-007',
    donorName: 'Patricia Moore',
    amount: 200,
    frequency: 'monthly',
    designation: 'missions',
    method: 'ach',
    nextChargeDate: '2026-03-01',
    status: 'active',
    createdDate: '2025-03-12',
  },
  {
    id: 'rec-006',
    donorId: 'dnr-008',
    donorName: 'Michael & Karen Davis',
    amount: 800,
    frequency: 'monthly',
    designation: 'general',
    method: 'ach',
    nextChargeDate: '2026-03-01',
    status: 'active',
    createdDate: '2024-11-01',
  },
  {
    id: 'rec-007',
    donorId: 'dnr-012',
    donorName: 'Deacon Harold Foster',
    amount: 500,
    frequency: 'quarterly',
    designation: 'benevolence',
    method: 'ach',
    nextChargeDate: '2026-04-01',
    status: 'paused',
    createdDate: '2023-09-15',
  },
  {
    id: 'rec-008',
    donorId: 'dnr-001',
    donorName: 'James & Sarah Mitchell',
    amount: 250,
    frequency: 'monthly',
    designation: 'building',
    method: 'ach',
    nextChargeDate: '2026-03-01',
    status: 'failed',
    createdDate: '2025-06-01',
  },
];

// =============================================================================
// RECEIPTS
// =============================================================================

const RECEIPTS: GivingReceipt[] = [
  {
    id: 'rcpt-001',
    donorId: 'dnr-001',
    donorName: 'James & Sarah Mitchell',
    amount: 1200,
    designation: 'general',
    fundName: 'General Fund',
    date: '2026-02-01',
    method: 'ach',
    receiptId: 'GV-2026-0201',
    taxDeductible: true,
    status: 'generated',
  },
  {
    id: 'rcpt-002',
    donorId: 'dnr-002',
    donorName: 'Robert Johnson',
    amount: 600,
    designation: 'general',
    fundName: 'General Fund',
    date: '2026-02-01',
    method: 'card',
    receiptId: 'GV-2026-0202',
    taxDeductible: true,
    status: 'generated',
  },
  {
    id: 'rcpt-003',
    donorId: 'dnr-004',
    donorName: 'Thomas & Linda Park',
    amount: 5000,
    designation: 'building',
    fundName: 'Building Fund',
    date: '2026-01-28',
    method: 'check',
    receiptId: 'GV-2026-0128',
    taxDeductible: true,
    status: 'generated',
  },
  {
    id: 'rcpt-004',
    donorId: 'dnr-003',
    donorName: 'Maria Gonzalez',
    amount: 100,
    designation: 'general',
    fundName: 'General Fund',
    date: '2026-02-09',
    method: 'apple_pay',
    receiptId: 'GV-2026-0209',
    taxDeductible: true,
    status: 'generated',
  },
  {
    id: 'rcpt-005',
    donorId: 'dnr-005',
    donorName: 'Angela Williams',
    amount: 150,
    designation: 'general',
    fundName: 'General Fund',
    date: '2026-02-11',
    method: 'card',
    receiptId: 'GV-2026-0211',
    taxDeductible: true,
    status: 'generated',
  },
  {
    id: 'rcpt-006',
    donorId: 'dnr-008',
    donorName: 'Michael & Karen Davis',
    amount: 800,
    designation: 'general',
    fundName: 'General Fund',
    date: '2026-02-01',
    method: 'ach',
    receiptId: 'GV-2026-0203',
    taxDeductible: true,
    status: 'generated',
  },
  {
    id: 'rcpt-007',
    donorId: 'dnr-012',
    donorName: 'Deacon Harold Foster',
    amount: 1500,
    designation: 'general',
    fundName: 'General Fund',
    date: '2026-02-16',
    method: 'ach',
    receiptId: 'GV-2026-0216',
    taxDeductible: true,
    status: 'generated',
  },
  {
    id: 'rcpt-008',
    donorId: 'dnr-006',
    donorName: 'David Chen',
    amount: 50,
    designation: 'youth',
    fundName: 'Youth Ministry Fund',
    date: '2026-02-15',
    method: 'apple_pay',
    receiptId: 'GV-2026-0215',
    taxDeductible: true,
    status: 'generated',
  },
  {
    id: 'rcpt-009',
    donorId: 'dnr-011',
    donorName: 'Rachel Kim',
    amount: 75,
    designation: 'general',
    fundName: 'General Fund',
    date: '2026-02-08',
    method: 'cash',
    receiptId: 'GV-2026-0208',
    taxDeductible: true,
    status: 'pending',
  },
  {
    id: 'rcpt-010',
    donorId: 'dnr-001',
    donorName: 'James & Sarah Mitchell',
    amount: 250,
    designation: 'building',
    fundName: 'Building Fund',
    date: '2026-02-01',
    method: 'ach',
    receiptId: 'GV-2026-0204',
    taxDeductible: true,
    status: 'failed',
  },
];

// =============================================================================
// STATEMENTS
// =============================================================================

const STATEMENTS: GivingStatement[] = [
  {
    id: 'stmt-001',
    donorId: 'dnr-001',
    donorName: 'James & Sarah Mitchell',
    period: 'January 2026',
    totalAmount: 2900,
    giftCount: 3,
    generatedDate: '2026-02-01',
    sentStatus: 'sent',
    version: 1,
  },
  {
    id: 'stmt-002',
    donorId: 'dnr-001',
    donorName: 'James & Sarah Mitchell',
    period: 'February 2026',
    totalAmount: 1900,
    giftCount: 2,
    generatedDate: '2026-02-17',
    sentStatus: 'draft',
    version: 1,
  },
  {
    id: 'stmt-003',
    donorId: 'dnr-008',
    donorName: 'Michael & Karen Davis',
    period: 'January 2026',
    totalAmount: 1600,
    giftCount: 2,
    generatedDate: '2026-02-01',
    sentStatus: 'sent',
    version: 1,
  },
  {
    id: 'stmt-004',
    donorId: 'dnr-008',
    donorName: 'Michael & Karen Davis',
    period: 'February 2026',
    totalAmount: 1600,
    giftCount: 2,
    generatedDate: '2026-02-17',
    sentStatus: 'draft',
    version: 1,
  },
];

// =============================================================================
// RECONCILIATION
// =============================================================================

const RECONCILIATION: ReconciliationItem[] = [
  {
    id: 'recon-001',
    transactionRef: 'TXN-20260201-001',
    amount: 1200,
    fund: 'general',
    status: 'processed',
    method: 'ach',
    date: '2026-02-01',
  },
  {
    id: 'recon-002',
    transactionRef: 'TXN-20260201-002',
    amount: 600,
    fund: 'general',
    status: 'processed',
    method: 'card',
    date: '2026-02-01',
  },
  {
    id: 'recon-003',
    transactionRef: 'TXN-20260201-003',
    amount: 800,
    fund: 'general',
    status: 'processed',
    method: 'ach',
    date: '2026-02-01',
  },
  {
    id: 'recon-004',
    transactionRef: 'TXN-20260209-001',
    amount: 100,
    fund: 'general',
    status: 'pending',
    method: 'apple_pay',
    date: '2026-02-09',
    notes: 'Awaiting processor settlement confirmation.',
  },
  {
    id: 'recon-005',
    transactionRef: 'TXN-20260201-004',
    amount: 250,
    fund: 'building',
    status: 'failed',
    method: 'ach',
    date: '2026-02-01',
    notes: 'Insufficient funds — donor notified. Retry scheduled.',
  },
  {
    id: 'recon-006',
    transactionRef: 'TXN-20260128-001',
    amount: 500,
    fund: 'benevolence',
    status: 'returned',
    method: 'check',
    date: '2026-01-28',
    notes: 'Check returned by bank — contact donor for replacement.',
  },
];

// =============================================================================
// GIVING CONTROLS
// =============================================================================

const CONTROLS: GivingControl[] = [
  {
    id: 'ctrl-001',
    name: 'Fund Creation Approval',
    description: 'All new giving funds require Finance Committee approval before activation.',
    owner: 'Finance Director',
    status: 'active',
  },
  {
    id: 'ctrl-002',
    name: 'Restricted Fund Rules',
    description: 'Restricted funds may only be disbursed for their stated purpose. Two-signature approval required.',
    owner: 'Finance Director',
    status: 'active',
  },
  {
    id: 'ctrl-003',
    name: 'Refund Policy',
    description: 'Refunds on unrestricted gifts processed within 30 days. Restricted fund refunds require board vote.',
    owner: 'Finance Director',
    status: 'active',
  },
  {
    id: 'ctrl-004',
    name: 'Donor Privacy',
    description: 'Donor giving amounts visible only to Finance team and Senior Pastor. Names redacted in public reports.',
    owner: 'Data Privacy Officer',
    status: 'active',
  },
  {
    id: 'ctrl-005',
    name: 'Statement Audit Log',
    description: 'All generated and sent tax statements logged with timestamps, version history, and user attribution.',
    owner: 'Finance Director',
    status: 'needs_review',
  },
  {
    id: 'ctrl-006',
    name: 'Least Privilege — Donor Data',
    description: 'Donor PII access restricted to minimum necessary personnel. Quarterly access review enforced.',
    owner: 'IT Administrator',
    status: 'active',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchDonationsV2Data() {
  return {
    funds: FUNDS,
    campaigns: CAMPAIGNS,
    campaignUpdates: CAMPAIGN_UPDATES,
    donors: DONORS,
    recurringGifts: RECURRING_GIFTS,
    receipts: RECEIPTS,
    statements: STATEMENTS,
    reconciliation: RECONCILIATION,
    controls: CONTROLS,
    overviewTiles: {
      totalGivingMTD: '$67,800',
      totalGivingYTD: '$412,500',
      activeRecurring: 25,
      topCampaignProgress: '65%',
      exceptionFlags: 2,
      fundsBelowThreshold: 1,
    },
  };
}
