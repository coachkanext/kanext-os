/**
 * Mock data for Education Fund screen.
 * Giving engine for Lincoln University — funds, campaigns, transactions,
 * scholarships, employer matching.
 * Today = 2026-03-25.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type FundFundId        = 'annual' | 'scholarship' | 'athletics' | 'science-building' | 'class-2020' | 'unrestricted';
export type FundGiftFrequency = 'one-time' | 'monthly' | 'quarterly' | 'annually';
export type PaymentMethodType = 'card' | 'bank' | 'apple_pay' | 'kaypay';
export type CampaignType      = 'giving-day' | 'capital' | 'class-gift' | 'scholarship-drive' | 'annual-fund' | 'p2p';
export type CampaignStatus    = 'active' | 'completed' | 'draft' | 'upcoming';
export type ScholarshipStatus = 'open' | 'reviewing' | 'awarded' | 'closed';
export type ApplicationStatus = 'pending' | 'under-review' | 'awarded' | 'denied';

export interface FundFund {
  id: FundFundId;
  name: string;
  description: string;
}

export interface LiveDonorEntry {
  id: string;
  firstName: string;
  classYear: number;
  amount?: number;
  isPublic: boolean;
}

export interface P2PFundraiser {
  id: string;
  donorName: string;
  donorInitials: string;
  donorHue: number;
  classYear: number;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  isMe?: boolean;
}

export interface CampaignPhase {
  label: string;
  goalAmount: number;
  isComplete: boolean;
}

export interface FundCampaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  fundId: FundFundId;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  startDate: string;
  deadline: string;
  endDatetime?: string;
  status: CampaignStatus;
  featured: boolean;
  challengeGoalDonors?: number;
  challengeCurrentDonors?: number;
  challengeMatchAmount?: number;
  liveDonorFeed?: LiveDonorEntry[];
  p2pFundraisers?: P2PFundraiser[];
  phases?: CampaignPhase[];
  classLeaderboard?: { classYear: number; totalRaised: number; }[];
}

export interface FundTransaction {
  id: string;
  donorName: string;
  donorInitials: string;
  donorHue: number;
  classYear?: number;
  amount: number;
  fundId: FundFundId;
  campaignId?: string;
  frequency: FundGiftFrequency;
  paymentMethod: PaymentMethodType;
  date: string;
  receiptSent: boolean;
  isMe?: boolean;
  employerMatched?: boolean;
  matchedAmount?: number;
}

export interface RecurringFundGift {
  id: string;
  fundId: FundFundId;
  amount: number;
  frequency: FundGiftFrequency;
  nextDate: string;
  startDate: string;
  paymentMethod: PaymentMethodType;
  status: 'active' | 'paused';
}

export interface FundPledge {
  id: string;
  campaignId: string;
  totalPledged: number;
  amountPerPeriod: number;
  frequency: FundGiftFrequency;
  fulfilledAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'fulfilled' | 'paused';
}

export interface SavedFundPaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  last4?: string;
  balance?: number;
  isDefault: boolean;
}

export interface ScholarshipApplication {
  id: string;
  studentName: string;
  gpa: number;
  major: string;
  appliedDate: string;
  status: ApplicationStatus;
  essayPreview?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  amount: number;
  criteria: string;
  description: string;
  status: ScholarshipStatus;
  applicantCount: number;
  awardedTo?: string;
  fundId: FundFundId;
  applications: ScholarshipApplication[];
}

export interface EmployerMatchPolicy {
  companyName: string;
  ratio: string;
  ratioMultiplier: number;
  maxPerYear: number;
  lookupDelayMs: number;
}

export interface FundAdminDashboard {
  thisWeek:  { total: number; donors: number; avgGift: number; alumniRate: number; };
  thisMonth: { total: number; donors: number; avgGift: number; alumniRate: number; };
  thisYear:  { total: number; donors: number; avgGift: number; alumniRate: number; };
  recurringCount: number;
  newDonorCount: number;
  returningDonorCount: number;
  yoyThisYear: number;
  byFund: { fundId: FundFundId; amount: number; percentage: number; }[];
  trendData: { month: string; amount: number; }[];
  classLeaderboard: { classYear: number; totalRaised: number; donorCount: number; participationRate: number; }[];
}

// ── Funds ─────────────────────────────────────────────────────────────────────

export const FUNDS: FundFund[] = [
  { id: 'annual',           name: 'Annual Fund',          description: 'Support daily operations and student life at Lincoln University' },
  { id: 'scholarship',      name: 'Lincoln Scholarship',  description: 'Scholarship fund for high-achieving students with financial need' },
  { id: 'athletics',        name: 'Athletics',            description: 'Support Lincoln Lions athletics programs and student-athletes' },
  { id: 'science-building', name: 'New Science Building', description: 'Capital campaign to build state-of-the-art STEM research facility' },
  { id: 'class-2020',       name: 'Class of 2020 Gift',   description: 'Class gift fund celebrating the Class of 2020 reunion' },
  { id: 'unrestricted',     name: 'Unrestricted',         description: 'Give where needed most — Lincoln University uses at its discretion' },
];

// ── Campaigns ─────────────────────────────────────────────────────────────────

export const FUND_CAMPAIGNS: FundCampaign[] = [
  {
    id: 'fc1',
    name: 'Lincoln Giving Day 2026',
    description: 'One day. One university. Thousands of alumni coming together to move Lincoln forward. Your gift today will be matched dollar-for-dollar when we reach 500 donors.',
    type: 'giving-day',
    fundId: 'annual',
    goalAmount: 100000,
    raisedAmount: 67240,
    donorCount: 342,
    startDate: '2026-03-25',
    deadline: '2026-03-25',
    endDatetime: '2026-03-25T23:59:59',
    status: 'active',
    featured: true,
    challengeGoalDonors: 500,
    challengeCurrentDonors: 342,
    challengeMatchAmount: 50000,
    liveDonorFeed: [
      { id: 'ld1', firstName: 'Marcus',    classYear: 2015, amount: 100,  isPublic: true  },
      { id: 'ld2', firstName: 'Patricia',  classYear: 2008, amount: 250,  isPublic: true  },
      { id: 'ld3', firstName: 'James',     classYear: 2020, isPublic: false },
      { id: 'ld4', firstName: 'Angela',    classYear: 2012, amount: 50,   isPublic: true  },
      { id: 'ld5', firstName: 'Robert',    classYear: 2003, amount: 500,  isPublic: true  },
      { id: 'ld6', firstName: 'Keisha',    classYear: 2018, amount: 75,   isPublic: true  },
      { id: 'ld7', firstName: 'Darnell',   classYear: 2018, amount: 200,  isPublic: true  },
      { id: 'ld8', firstName: 'Tiffany',   classYear: 2015, isPublic: false },
      { id: 'ld9', firstName: 'Christopher', classYear: 2010, amount: 1000, isPublic: true },
      { id: 'ld10', firstName: 'Brianna',  classYear: 2022, amount: 25,   isPublic: true  },
    ],
    classLeaderboard: [
      { classYear: 2018, totalRaised: 12400 },
      { classYear: 2020, totalRaised: 9800  },
      { classYear: 2015, totalRaised: 8200  },
    ],
  },
  {
    id: 'fc2',
    name: 'New Science Building',
    description: 'The Dr. Harold Lewis Science & Innovation Center will house cutting-edge labs for biology, chemistry, computer science, and engineering. This $5M capital campaign transforms Lincoln\'s STEM offerings.',
    type: 'capital',
    fundId: 'science-building',
    goalAmount: 5000000,
    raisedAmount: 2100000,
    donorCount: 412,
    startDate: '2024-09-01',
    deadline: '2028-12-31',
    status: 'active',
    featured: false,
    phases: [
      { label: 'Phase 1 — Site Prep & Foundation',  goalAmount: 1000000, isComplete: true  },
      { label: 'Phase 2 — Steel & Structural Frame', goalAmount: 1500000, isComplete: true  },
      { label: 'Phase 3 — Envelope & MEP Systems',  goalAmount: 1500000, isComplete: false },
      { label: 'Phase 4 — Interior Finishes & Labs', goalAmount: 1000000, isComplete: false },
    ],
  },
  {
    id: 'fc4',
    name: 'Annual Fund 2026',
    description: 'The Annual Fund is Lincoln\'s foundation — supporting scholarships, faculty, student programs, and everything that makes a Lincoln education extraordinary. Every gift, every year.',
    type: 'annual-fund',
    fundId: 'annual',
    goalAmount: 1000000,
    raisedAmount: 450000,
    donorCount: 1200,
    startDate: '2026-01-01',
    deadline: '2026-12-31',
    status: 'active',
    featured: false,
  },
  {
    id: 'fc5',
    name: 'Athletic Excellence Fund',
    description: 'Support Lincoln Lions student-athletes with scholarships, training facilities, and travel. Help our athletes compete at the highest level while pursuing their degrees.',
    type: 'annual-fund',
    fundId: 'athletics',
    goalAmount: 200000,
    raisedAmount: 85000,
    donorCount: 156,
    startDate: '2026-01-15',
    deadline: '2026-08-31',
    status: 'active',
    featured: false,
  },
  {
    id: 'fc6',
    name: 'Scholarship Endowment Drive',
    description: 'Together we can permanently endow a new Lincoln scholarship. Alumni and friends are creating peer-to-peer fundraising pages to reach their networks and make this endowment a reality.',
    type: 'p2p',
    fundId: 'scholarship',
    goalAmount: 100000,
    raisedAmount: 32000,
    donorCount: 187,
    startDate: '2026-02-01',
    deadline: '2026-07-31',
    status: 'active',
    featured: false,
    p2pFundraisers: [
      { id: 'p2p4', donorName: 'Sammy Kalejaiye',  donorInitials: 'SK', donorHue: 45,  classYear: 2020, goalAmount: 5000,  raisedAmount: 1800, donorCount: 9,  isMe: true },
      { id: 'p2p5', donorName: 'Dr. Howard Ellis',  donorInitials: 'HE', donorHue: 190, classYear: 2001, goalAmount: 10000, raisedAmount: 6200, donorCount: 24           },
      { id: 'p2p6', donorName: 'Alicia Forde',      donorInitials: 'AF', donorHue: 330, classYear: 2018, goalAmount: 5000,  raisedAmount: 3400, donorCount: 17           },
    ],
  },
  {
    id: 'fc7',
    name: 'Fall 2025 Homecoming Gift',
    description: 'The Fall 2025 Homecoming campaign united alumni from every era around a common purpose. Final results exceeded our goal — a testament to Lincoln pride.',
    type: 'class-gift',
    fundId: 'unrestricted',
    goalAmount: 25000,
    raisedAmount: 28000,
    donorCount: 340,
    startDate: '2025-10-01',
    deadline: '2025-11-15',
    status: 'completed',
    featured: false,
  },
  {
    id: 'fc8',
    name: 'Professor Excellence Award',
    description: 'A new endowed award recognizing Lincoln\'s most impactful faculty. Recipients are nominated by students and selected by the Academic Council.',
    type: 'annual-fund',
    fundId: 'unrestricted',
    goalAmount: 50000,
    raisedAmount: 0,
    donorCount: 0,
    startDate: '2026-04-01',
    deadline: '2026-06-30',
    status: 'upcoming',
    featured: false,
  },
  {
    id: 'fc3',
    name: 'Class of 2020 Reunion Gift',
    description: 'The Class of 2020 — who navigated a historic senior year — is rallying for their first major reunion gift. Join your classmates and make history again.',
    type: 'p2p',
    fundId: 'class-2020',
    goalAmount: 50000,
    raisedAmount: 18400,
    donorCount: 94,
    startDate: '2026-01-01',
    deadline: '2026-05-31',
    status: 'active',
    featured: false,
    p2pFundraisers: [
      { id: 'p2p1', donorName: 'Sammy Kalejaiye',  donorInitials: 'SK', donorHue: 45,  classYear: 2020, goalAmount: 5000, raisedAmount: 2400, donorCount: 12, isMe: true  },
      { id: 'p2p2', donorName: 'Marcus Thompson',  donorInitials: 'MT', donorHue: 220, classYear: 2020, goalAmount: 5000, raisedAmount: 3100, donorCount: 18           },
      { id: 'p2p3', donorName: 'Jasmine Williams', donorInitials: 'JW', donorHue: 300, classYear: 2020, goalAmount: 3000, raisedAmount: 1850, donorCount: 9            },
    ],
  },
];

// ── Payment Methods ───────────────────────────────────────────────────────────

export const SAVED_PAYMENT_METHODS: SavedFundPaymentMethod[] = [
  { id: 'fpm1', type: 'card',      label: 'Visa',      last4: '4242',  isDefault: true  },
  { id: 'fpm2', type: 'bank',      label: 'Chase',     last4: '7890',  isDefault: false },
  { id: 'fpm3', type: 'apple_pay', label: 'Apple Pay',                 isDefault: false },
  { id: 'fpm4', type: 'kaypay',    label: 'KayPay',    balance: 847.50, isDefault: false },
];

// ── My Recurring Gifts ────────────────────────────────────────────────────────

export const MY_RECURRING_GIFTS: RecurringFundGift[] = [
  {
    id: 'frg1', fundId: 'annual', amount: 50, frequency: 'monthly',
    nextDate: '2026-04-01', startDate: '2025-06-01',
    paymentMethod: 'card', status: 'active',
  },
  {
    id: 'frg2', fundId: 'scholarship', amount: 100, frequency: 'monthly',
    nextDate: '2026-04-15', startDate: '2025-09-15',
    paymentMethod: 'card', status: 'active',
  },
];

// ── My Pledge ─────────────────────────────────────────────────────────────────

export const MY_PLEDGE: FundPledge = {
  id: 'fpl1',
  campaignId: 'fc2',
  totalPledged: 10000,
  amountPerPeriod: 2500,
  frequency: 'annually',
  fulfilledAmount: 2500,
  startDate: '2025-01-01',
  endDate: '2028-12-31',
  status: 'active',
};

// ── Transactions ──────────────────────────────────────────────────────────────

export const FUND_TRANSACTIONS: FundTransaction[] = [
  // Sammy — 10 transactions across 2024-2026
  { id: 'ft1',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 100,  fundId: 'annual',      frequency: 'monthly',  paymentMethod: 'card',   date: '2026-03-01', receiptSent: true,  isMe: true },
  { id: 'ft2',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 100,  fundId: 'scholarship', frequency: 'monthly',  paymentMethod: 'card',   date: '2026-03-15', receiptSent: true,  isMe: true },
  { id: 'ft3',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 100,  fundId: 'annual',      frequency: 'monthly',  paymentMethod: 'card',   date: '2026-02-01', receiptSent: true,  isMe: true },
  { id: 'ft4',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 100,  fundId: 'scholarship', frequency: 'monthly',  paymentMethod: 'card',   date: '2026-02-15', receiptSent: true,  isMe: true },
  { id: 'ft5',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 100,  fundId: 'annual',      frequency: 'monthly',  paymentMethod: 'card',   date: '2026-01-01', receiptSent: true,  isMe: true },
  { id: 'ft6',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 100,  fundId: 'scholarship', frequency: 'monthly',  paymentMethod: 'card',   date: '2026-01-15', receiptSent: true,  isMe: true },
  { id: 'ft7',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 250,  fundId: 'science-building', campaignId: 'fc2', frequency: 'one-time', paymentMethod: 'card', date: '2025-12-10', receiptSent: true, isMe: true },
  { id: 'ft8',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 100,  fundId: 'annual',      frequency: 'monthly',  paymentMethod: 'card',   date: '2025-11-01', receiptSent: true,  isMe: true, employerMatched: true, matchedAmount: 100 },
  { id: 'ft9',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 100,  fundId: 'annual',      frequency: 'monthly',  paymentMethod: 'card',   date: '2025-10-01', receiptSent: true,  isMe: true },
  { id: 'ft10', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45, classYear: 2020, amount: 250,  fundId: 'class-2020',  campaignId: 'fc3', frequency: 'one-time', paymentMethod: 'kaypay', date: '2025-09-15', receiptSent: true, isMe: true },
  // Other donors
  { id: 'ft11', donorName: 'Marcus Thompson',  donorInitials: 'MT', donorHue: 220, classYear: 2020, amount: 500,  fundId: 'annual',           frequency: 'monthly',  paymentMethod: 'bank',   date: '2026-03-01', receiptSent: true  },
  { id: 'ft12', donorName: 'Patricia Johnson', donorInitials: 'PJ', donorHue: 300, classYear: 2008, amount: 250,  fundId: 'scholarship',      frequency: 'monthly',  paymentMethod: 'card',   date: '2026-03-01', receiptSent: true  },
  { id: 'ft13', donorName: 'James Williams',   donorInitials: 'JW', donorHue: 160, classYear: 2015, amount: 1000, fundId: 'science-building', frequency: 'annually', paymentMethod: 'bank',   date: '2026-03-01', receiptSent: true  },
  { id: 'ft14', donorName: 'Angela Brown',     donorInitials: 'AB', donorHue: 260, classYear: 2012, amount: 150,  fundId: 'athletics',        frequency: 'monthly',  paymentMethod: 'card',   date: '2026-03-02', receiptSent: true  },
  { id: 'ft15', donorName: 'Robert Davis',     donorInitials: 'RD', donorHue: 40,  classYear: 2003, amount: 2500, fundId: 'science-building', campaignId: 'fc2', frequency: 'annually', paymentMethod: 'bank', date: '2026-03-05', receiptSent: true },
];

// ── Admin Dashboard ───────────────────────────────────────────────────────────

export const ADMIN_DASHBOARD: FundAdminDashboard = {
  thisWeek:  { total: 4200,  donors: 28,  avgGift: 150, alumniRate: 18.4 },
  thisMonth: { total: 19600, donors: 124, avgGift: 158, alumniRate: 18.4 },
  thisYear:  { total: 67240, donors: 342, avgGift: 197, alumniRate: 18.4 },
  recurringCount: 87,
  newDonorCount: 48,
  returningDonorCount: 294,
  yoyThisYear: 12.3,
  byFund: [
    { fundId: 'annual'           as FundFundId, amount: 28400, percentage: 42 },
    { fundId: 'scholarship'      as FundFundId, amount: 16100, percentage: 24 },
    { fundId: 'science-building' as FundFundId, amount: 12800, percentage: 19 },
    { fundId: 'athletics'        as FundFundId, amount: 6700,  percentage: 10 },
    { fundId: 'class-2020'       as FundFundId, amount: 2400,  percentage:  4 },
    { fundId: 'unrestricted'     as FundFundId, amount:  840,  percentage:  1 },
  ],
  trendData: [
    { month: 'Oct', amount: 9800  },
    { month: 'Nov', amount: 11200 },
    { month: 'Dec', amount: 14600 },
    { month: 'Jan', amount: 10400 },
    { month: 'Feb', amount: 11800 },
    { month: 'Mar', amount: 19600 },
  ],
  classLeaderboard: [
    { classYear: 2018, totalRaised: 18400, donorCount: 54, participationRate: 22.1 },
    { classYear: 2020, totalRaised: 14200, donorCount: 94, participationRate: 19.8 },
    { classYear: 2015, totalRaised: 12600, donorCount: 84, participationRate: 17.3 },
    { classYear: 2008, totalRaised: 9800,  donorCount: 61, participationRate: 15.6 },
    { classYear: 2003, totalRaised: 7800,  donorCount: 47, participationRate: 14.2 },
  ],
};

// ── Scholarships ──────────────────────────────────────────────────────────────

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'sc1',
    name: 'Lincoln Excellence Award',
    amount: 5000,
    criteria: 'Minimum 3.5 GPA · Financial need demonstrated · Full-time enrollment',
    description: 'Awarded annually to outstanding juniors and seniors who demonstrate academic excellence and financial need.',
    status: 'reviewing',
    applicantCount: 3,
    fundId: 'scholarship',
    applications: [
      { id: 'sca1', studentName: 'Brianna Morris',  gpa: 3.8, major: 'Biology',           appliedDate: '2026-02-14', status: 'under-review', essayPreview: 'Growing up in a single-parent household, education was always my path forward...' },
      { id: 'sca2', studentName: 'Darius Coleman',  gpa: 3.6, major: 'Computer Science',  appliedDate: '2026-02-20', status: 'under-review', essayPreview: 'As a first-generation college student, I have learned to turn obstacles into opportunities...' },
      { id: 'sca3', studentName: 'Tanya Richardson',gpa: 3.5, major: 'English',           appliedDate: '2026-02-28', status: 'pending'       },
    ],
  },
  {
    id: 'sc2',
    name: 'STEM Innovation Scholarship',
    amount: 3500,
    criteria: 'STEM major · Minimum 3.0 GPA · Sophomore or above',
    description: 'Supports the next generation of STEM leaders at Lincoln. Recipients are paired with an alumni mentor in their field.',
    status: 'open',
    applicantCount: 0,
    fundId: 'science-building',
    applications: [],
  },
  {
    id: 'sc3',
    name: 'Alumni Legacy Scholarship',
    amount: 2500,
    criteria: 'Parent or grandparent is a Lincoln alum · Any GPA · Any major',
    description: 'Celebrates multi-generational Lincoln families. Award renews annually for up to 4 years.',
    status: 'awarded',
    applicantCount: 5,
    awardedTo: 'Elijah Washington',
    fundId: 'annual',
    applications: [
      { id: 'sca4', studentName: 'Elijah Washington', gpa: 3.2, major: 'Business Admin',  appliedDate: '2025-11-10', status: 'awarded' },
      { id: 'sca5', studentName: 'Keisha Thompson',   gpa: 3.0, major: 'Psychology',      appliedDate: '2025-11-15', status: 'denied'  },
    ],
  },
];

// ── Employer Matching Gifts ───────────────────────────────────────────────────

export const MATCHING_GIFTS: EmployerMatchPolicy[] = [
  { companyName: 'Google',     ratio: '1:1', ratioMultiplier: 1, maxPerYear: 5000,  lookupDelayMs: 1200 },
  { companyName: 'Apple',      ratio: '2:1', ratioMultiplier: 2, maxPerYear: 10000, lookupDelayMs: 1500 },
  { companyName: 'Microsoft',  ratio: '1:1', ratioMultiplier: 1, maxPerYear: 15000, lookupDelayMs: 1000 },
  { companyName: 'Goldman',    ratio: '1:1', ratioMultiplier: 1, maxPerYear: 20000, lookupDelayMs: 1800 },
  { companyName: 'JP Morgan',  ratio: '1:1', ratioMultiplier: 1, maxPerYear: 25000, lookupDelayMs: 1600 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getFundById(id: FundFundId): FundFund {
  return FUNDS.find(f => f.id === id) ?? FUNDS[0];
}

export function getCampaignsByStatus(status: CampaignStatus): FundCampaign[] {
  return FUND_CAMPAIGNS.filter(c => c.status === status);
}

export function getMyTransactions(): FundTransaction[] {
  return FUND_TRANSACTIONS.filter(t => t.isMe);
}

export function calcFee(amount: number, method: PaymentMethodType): number {
  if (amount <= 0) return 0;
  if (method === 'bank') return Math.min(Math.round(amount * 0.008 * 100) / 100, 5);
  return Math.round((amount * 0.029 + 0.30) * 100) / 100;
}

export function formatCurrency(amount: number): string {
  const hasCents = amount % 1 !== 0;
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
}

export function getPaymentIcon(type: PaymentMethodType): string {
  const map: Record<PaymentMethodType, string> = {
    card:      'creditcard.fill',
    bank:      'building.columns.fill',
    apple_pay: 'apple.logo',
    kaypay:    'k.circle.fill',
  };
  return map[type];
}

export function formatDate(d: string): string {
  const [, m, day] = d.split('-').map(Number);
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${day}`;
}

export function campaignTypeColor(type: CampaignType): string {
  const map: Record<CampaignType, string> = {
    'giving-day':       '#D97757',
    'capital':          '#003A63',
    'class-gift':       '#5A8A6E',
    'scholarship-drive':'#7B5EA7',
    'annual-fund':      '#1D9BF0',
    'p2p':              '#E8884A',
  };
  return map[type] ?? '#888';
}

export function campaignTypeLabel(type: CampaignType): string {
  const map: Record<CampaignType, string> = {
    'giving-day':       'Giving Day',
    'capital':          'Capital',
    'class-gift':       'Class Gift',
    'scholarship-drive':'Scholarship Drive',
    'annual-fund':      'Annual Fund',
    'p2p':              'Peer-to-Peer',
  };
  return map[type] ?? type;
}

export function formatTimeRemaining(endDatetime: string): string {
  const end  = new Date(endDatetime).getTime();
  const now  = Date.now();
  const diff = Math.max(0, end - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const sec = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export function lookupEmployerMatch(name: string): EmployerMatchPolicy | null {
  const lower = name.toLowerCase().trim();
  return MATCHING_GIFTS.find(m => m.companyName.toLowerCase().startsWith(lower)) ?? null;
}

export function lifetimeGiving(): number {
  return getMyTransactions().reduce((sum, t) => sum + t.amount, 0);
}
