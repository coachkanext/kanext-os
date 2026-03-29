/**
 * Mock data for Community Give screen.
 * Giving engine for ICCLA — funds, campaigns, transactions, pledges.
 * Today = 2026-03-24.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type FundId          = 'general' | 'tithe' | 'building' | 'missions' | 'benevolence';
export type GiftFrequency   = 'one-time' | 'weekly' | 'monthly';
export type PaymentMethodType = 'card' | 'bank' | 'apple_pay' | 'kaypay';
export type CampaignStatus  = 'active' | 'completed' | 'draft';
export type PledgeStatus    = 'active' | 'fulfilled' | 'paused' | 'cancelled';

export interface Fund {
  id: FundId;
  name: string;
  description: string;
}

export interface GivingCampaign {
  id: string;
  name: string;
  description: string;
  fundId: FundId;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  startDate: string;
  deadline: string;
  status: CampaignStatus;
  featured: boolean;
}

export interface GivingTransaction {
  id: string;
  donorName: string;
  donorInitials: string;
  donorHue: number;
  amount: number;
  fundId: FundId;
  campaignId?: string;
  frequency: GiftFrequency;
  paymentMethod: PaymentMethodType;
  date: string;
  receiptSent: boolean;
  isMe?: boolean;
}

export interface RecurringGift {
  id: string;
  fundId: FundId;
  amount: number;
  frequency: GiftFrequency;
  nextDate: string;
  startDate: string;
  paymentMethod: PaymentMethodType;
  status: 'active' | 'paused';
}

export interface GivingPledge {
  id: string;
  campaignId: string;
  donorName: string;
  donorInitials: string;
  donorHue: number;
  totalPledged: number;
  amountPerPeriod: number;
  frequency: GiftFrequency;
  fulfilledAmount: number;
  startDate: string;
  endDate: string;
  status: PledgeStatus;
  isMe?: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  last4?: string;
  balance?: number;
  isDefault: boolean;
}

export interface GivingChartPoint {
  month: string;
  amount: number;
}

export interface FundBreakdown {
  fundId: FundId;
  amount: number;
  percentage: number;
}

// ── Funds ─────────────────────────────────────────────────────────────────────

export const FUNDS: Fund[] = [
  { id: 'general',     name: 'General',      description: 'General church operations and ministries' },
  { id: 'tithe',       name: 'Tithe',        description: "Your 10% commitment to God's house" },
  { id: 'building',    name: 'Building Fund', description: 'New Sanctuary construction project' },
  { id: 'missions',    name: 'Missions',     description: 'Local and global missions support' },
  { id: 'benevolence', name: 'Benevolence',  description: 'Supporting members in times of need' },
];

// ── Campaigns ─────────────────────────────────────────────────────────────────

export const GIVING_CAMPAIGNS: GivingCampaign[] = [
  {
    id: 'gc1',
    name: 'New Sanctuary Building Fund',
    description: "Help us build a new 800-seat sanctuary to serve our growing congregation and community. This state-of-the-art facility will include a full worship center, children's wing, and community hall.",
    fundId: 'building',
    goalAmount: 500000,
    raisedAmount: 287400,
    donorCount: 1456,
    startDate: '2024-01-01',
    deadline: '2026-12-31',
    status: 'active',
    featured: true,
  },
  {
    id: 'gc2',
    name: 'Easter 2026 Offering',
    description: 'Support our Easter outreach to share the gospel with our community. Funds go toward the Easter Block Party, outreach materials, and follow-up ministry.',
    fundId: 'missions',
    goalAmount: 50000,
    raisedAmount: 12340,
    donorCount: 98,
    startDate: '2026-03-01',
    deadline: '2026-04-20',
    status: 'active',
    featured: false,
  },
  {
    id: 'gc3',
    name: 'Missions Trip 2025',
    description: 'Annual youth missions trip to serve communities in Guatemala. Funds covered travel, supplies, and community development projects.',
    fundId: 'missions',
    goalAmount: 15000,
    raisedAmount: 16240,
    donorCount: 87,
    startDate: '2025-04-01',
    deadline: '2025-07-01',
    status: 'completed',
    featured: false,
  },
  {
    id: 'gc4',
    name: 'Christmas 2025 Offering',
    description: 'Our annual Christmas giving campaign raised funds for the community dinner and gift drives for families in need across the Westside.',
    fundId: 'general',
    goalAmount: 30000,
    raisedAmount: 28400,
    donorCount: 234,
    startDate: '2025-11-01',
    deadline: '2025-12-25',
    status: 'completed',
    featured: false,
  },
  {
    id: 'gc5',
    name: 'Youth Ministry Renovation',
    description: 'Upgrade our youth wing with new AV equipment, flexible classroom space, and a dedicated hangout lounge for teens and young adults.',
    fundId: 'building',
    goalAmount: 35000,
    raisedAmount: 14200,
    donorCount: 91,
    startDate: '2026-02-01',
    deadline: '2026-09-30',
    status: 'active',
    featured: false,
  },
  {
    id: 'gc6',
    name: 'Community Food Pantry',
    description: 'Stock our weekly food pantry to serve 60+ families every Saturday. Your gift buys groceries, fresh produce, and household supplies.',
    fundId: 'benevolence',
    goalAmount: 8000,
    raisedAmount: 3240,
    donorCount: 47,
    startDate: '2026-01-01',
    deadline: '2026-06-30',
    status: 'active',
    featured: false,
  },
  {
    id: 'gc7',
    name: 'Sanctuary Sound System Upgrade',
    description: 'Upgrade the main sanctuary sound system to studio-quality audio for worship and recording. New mixing board, stage monitors, and front-of-house speakers.',
    fundId: 'building',
    goalAmount: 8000,
    raisedAmount: 5200,
    donorCount: 32,
    startDate: '2026-02-15',
    deadline: '2026-06-01',
    status: 'active',
    featured: false,
  },
];

// ── Payment Methods ───────────────────────────────────────────────────────────

export const SAVED_PAYMENT_METHODS: SavedPaymentMethod[] = [
  { id: 'pm1', type: 'card',      label: 'Visa',      last4: '4242',  isDefault: true  },
  { id: 'pm2', type: 'bank',      label: 'Chase',     last4: '7890',  isDefault: false },
  { id: 'pm3', type: 'apple_pay', label: 'Apple Pay',                 isDefault: false },
  { id: 'pm4', type: 'kaypay',    label: 'KayPay',    balance: 847.50, isDefault: false },
];

// ── My Recurring Gifts ────────────────────────────────────────────────────────

export const MY_RECURRING_GIFTS: RecurringGift[] = [
  {
    id: 'rg1', fundId: 'tithe', amount: 200, frequency: 'monthly',
    nextDate: '2026-04-01', startDate: '2025-03-01',
    paymentMethod: 'card', status: 'active',
  },
];

// ── Pledges ───────────────────────────────────────────────────────────────────

export const MY_PLEDGES: GivingPledge[] = [
  {
    id: 'pl1', campaignId: 'gc1',
    donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,
    totalPledged: 6000, amountPerPeriod: 500, frequency: 'monthly',
    fulfilledAmount: 2000,
    startDate: '2026-01-01', endDate: '2026-12-31',
    status: 'active', isMe: true,
  },
];

export const ALL_PLEDGES: GivingPledge[] = [
  {
    id: 'pl1', campaignId: 'gc1',
    donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,
    totalPledged: 6000, amountPerPeriod: 500, frequency: 'monthly',
    fulfilledAmount: 2000,
    startDate: '2026-01-01', endDate: '2026-12-31',
    status: 'active', isMe: true,
  },
  {
    id: 'pl2', campaignId: 'gc1',
    donorName: 'Marcus Davis', donorInitials: 'MD', donorHue: 220,
    totalPledged: 12000, amountPerPeriod: 1000, frequency: 'monthly',
    fulfilledAmount: 6000,
    startDate: '2025-10-01', endDate: '2026-09-30',
    status: 'active',
  },
  {
    id: 'pl3', campaignId: 'gc1',
    donorName: 'Patricia Johnson', donorInitials: 'PJ', donorHue: 300,
    totalPledged: 3000, amountPerPeriod: 250, frequency: 'monthly',
    fulfilledAmount: 3000,
    startDate: '2025-06-01', endDate: '2026-05-31',
    status: 'fulfilled',
  },
];

// ── Transactions ──────────────────────────────────────────────────────────────

export const GIVING_TRANSACTIONS: GivingTransaction[] = [
  // Sammy — recurring tithe + building pledge
  { id: 'gt1',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2026-03-01', receiptSent: true,  isMe: true },
  { id: 'gt2',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 500, fundId: 'building',    frequency: 'monthly',  paymentMethod: 'card',   date: '2026-02-01', receiptSent: true,  isMe: true },
  { id: 'gt3',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2026-02-01', receiptSent: true,  isMe: true },
  { id: 'gt4',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 500, fundId: 'building',    frequency: 'monthly',  paymentMethod: 'card',   date: '2026-01-01', receiptSent: true,  isMe: true },
  { id: 'gt5',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2026-01-01', receiptSent: true,  isMe: true },
  { id: 'gt6',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 100, fundId: 'missions',    frequency: 'one-time', paymentMethod: 'card',   date: '2025-12-15', receiptSent: true,  isMe: true },
  { id: 'gt7',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-12-01', receiptSent: true,  isMe: true },
  { id: 'gt8',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-11-01', receiptSent: true,  isMe: true },
  { id: 'gt9',  donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-10-01', receiptSent: true,  isMe: true },
  { id: 'gt10', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 50,  fundId: 'benevolence', frequency: 'one-time', paymentMethod: 'kaypay', date: '2025-09-20', receiptSent: true,  isMe: true },
  { id: 'gt11', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-09-01', receiptSent: true,  isMe: true },
  { id: 'gt12', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-08-01', receiptSent: true,  isMe: true },
  { id: 'gt13', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-07-01', receiptSent: true,  isMe: true },
  { id: 'gt14', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-06-01', receiptSent: true,  isMe: true },
  { id: 'gt15', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-05-01', receiptSent: true,  isMe: true },
  { id: 'gt16', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-04-01', receiptSent: true,  isMe: true },
  { id: 'gt17', donorName: 'Sammy Kalejaiye', donorInitials: 'SK', donorHue: 45,  amount: 200, fundId: 'tithe',       frequency: 'monthly',  paymentMethod: 'card',   date: '2025-03-01', receiptSent: true,  isMe: true },
  // Other donors
  { id: 'gt18', donorName: 'Marcus Davis',      donorInitials: 'MD', donorHue: 220, amount: 500,  fundId: 'tithe',    frequency: 'monthly',  paymentMethod: 'bank',  date: '2026-03-01', receiptSent: true  },
  { id: 'gt19', donorName: 'Patricia Johnson',  donorInitials: 'PJ', donorHue: 300, amount: 250,  fundId: 'general',  frequency: 'monthly',  paymentMethod: 'card',  date: '2026-03-01', receiptSent: true  },
  { id: 'gt20', donorName: 'James Williams',    donorInitials: 'JW', donorHue: 160, amount: 1000, fundId: 'building', frequency: 'monthly',  paymentMethod: 'bank',  date: '2026-03-01', receiptSent: true  },
  { id: 'gt21', donorName: 'Angela Brown',      donorInitials: 'AB', donorHue: 260, amount: 150,  fundId: 'missions', frequency: 'monthly',  paymentMethod: 'card',  date: '2026-03-02', receiptSent: true  },
  { id: 'gt22', donorName: 'Robert Davis',      donorInitials: 'RD', donorHue: 40,  amount: 75,   fundId: 'benevolence', frequency: 'one-time', paymentMethod: 'card', date: '2026-03-05', receiptSent: true },
  { id: 'gt23', donorName: 'Shirley Washington', donorInitials: 'SW', donorHue: 120, amount: 300, fundId: 'tithe',   frequency: 'monthly',  paymentMethod: 'bank',  date: '2026-03-01', receiptSent: true  },
  { id: 'gt24', donorName: 'Joyce Robinson',    donorInitials: 'JR', donorHue: 350, amount: 50,   fundId: 'general',  frequency: 'weekly',   paymentMethod: 'card',  date: '2026-03-22', receiptSent: false },
];

// ── Admin Dashboard ───────────────────────────────────────────────────────────

export const ADMIN_DASHBOARD = {
  thisWeek:  { total: 10500, givers: 68, avgGift: 154 },
  thisMonth: { total: 42000, givers: 198, avgGift: 212 },
  thisYear:  { total: 168000, givers: 234, avgGift: 718 },
  recurringCount: 120,
  oneTimeCount:   78,
  byFund: [
    { fundId: 'tithe'       as FundId, amount: 18900, percentage: 45 },
    { fundId: 'building'    as FundId, amount: 12600, percentage: 30 },
    { fundId: 'general'     as FundId, amount: 5040,  percentage: 12 },
    { fundId: 'missions'    as FundId, amount: 3780,  percentage: 9  },
    { fundId: 'benevolence' as FundId, amount: 1680,  percentage: 4  },
  ] as FundBreakdown[],
  trendData: [
    { month: 'Oct', amount: 38400 },
    { month: 'Nov', amount: 39200 },
    { month: 'Dec', amount: 58000 },
    { month: 'Jan', amount: 40100 },
    { month: 'Feb', amount: 41200 },
    { month: 'Mar', amount: 42000 },
  ] as GivingChartPoint[],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getFundById(id: FundId): Fund {
  return FUNDS.find(f => f.id === id) ?? FUNDS[0];
}

export function getCampaignById(id: string): GivingCampaign | undefined {
  return GIVING_CAMPAIGNS.find(c => c.id === id);
}

export function getMyTransactions(): GivingTransaction[] {
  return GIVING_TRANSACTIONS.filter(t => t.isMe);
}

export function getActiveCampaigns(): GivingCampaign[] {
  return GIVING_CAMPAIGNS.filter(c => c.status === 'active');
}

export function getFeaturedCampaign(): GivingCampaign | undefined {
  return GIVING_CAMPAIGNS.find(c => c.featured && c.status === 'active');
}

export function calcFee(amount: number, method: PaymentMethodType): number {
  if (amount <= 0) return 0;
  if (method === 'bank') return Math.min(Math.round(amount * 0.008 * 100) / 100, 5);
  return Math.round((amount * 0.029 + 0.30) * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
