/**
 * Church Organization Donations / Giving — Mock Data & Types
 * Donation records, giving campaigns, giving statistics.
 */

// =============================================================================
// TYPES
// =============================================================================

export type DonationMethod = 'online' | 'cash' | 'check' | 'mobile' | 'recurring';
export type CampaignStatus = 'active' | 'completed' | 'upcoming';

export interface DonationRecord {
  id: string;
  donor: string;
  amount: number;
  fund: string;
  date: string;
  method: DonationMethod;
  recurring: boolean;
  anonymous: boolean;
}

export interface GivingCampaign {
  id: string;
  name: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  donorCount: number;
}

export interface GivingStats {
  totalYTD: number;
  totalLastYear: number;
  averageGift: number;
  recurringDonors: number;
  totalDonors: number;
  tithesPercent: number;
  offeringsPercent: number;
  specialPercent: number;
}

export interface FundAllocation {
  id: string;
  name: string;
  amount: number;
  percent: number;
  color: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const METHOD_LABELS: Record<DonationMethod, string> = {
  online: 'Online',
  cash: 'Cash',
  check: 'Check',
  mobile: 'Mobile',
  recurring: 'Recurring',
};

export const METHOD_ICONS: Record<DonationMethod, string> = {
  online: 'globe',
  cash: 'banknote.fill',
  check: 'doc.text.fill',
  mobile: 'iphone',
  recurring: 'arrow.triangle.2.circlepath',
};

export const METHOD_COLORS: Record<DonationMethod, string> = {
  online: '#1D9BF0',
  cash: '#22C55E',
  check: '#F59E0B',
  mobile: '#1D9BF0',
  recurring: '#1D9BF0',
};

export const CAMPAIGN_STATUS_COLOR: Record<CampaignStatus, string> = {
  active: '#22C55E',
  completed: '#1D9BF0',
  upcoming: '#F59E0B',
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  upcoming: 'Upcoming',
};

// =============================================================================
// GIVING STATS
// =============================================================================

const GIVING_STATS: GivingStats = {
  totalYTD: 342580,
  totalLastYear: 1245000,
  averageGift: 285,
  recurringDonors: 178,
  totalDonors: 412,
  tithesPercent: 62,
  offeringsPercent: 25,
  specialPercent: 13,
};

// =============================================================================
// FUND ALLOCATIONS
// =============================================================================

const FUND_ALLOCATIONS: FundAllocation[] = [
  { id: 'fund-001', name: 'General Tithes', amount: 212400, percent: 62, color: '#1D9BF0' },
  { id: 'fund-002', name: 'Offerings', amount: 85645, percent: 25, color: '#1D9BF0' },
  { id: 'fund-003', name: 'Building Fund', amount: 22240, percent: 6.5, color: '#F59E0B' },
  { id: 'fund-004', name: 'Missions', amount: 13703, percent: 4, color: '#22C55E' },
  { id: 'fund-005', name: 'Benevolence', amount: 8592, percent: 2.5, color: '#1D9BF0' },
];

// =============================================================================
// RECENT DONATIONS
// =============================================================================

const DONATIONS: DonationRecord[] = [
  {
    id: 'don-001',
    donor: 'Anonymous',
    amount: 5000,
    fund: 'Building Fund',
    date: '2026-02-16',
    method: 'check',
    recurring: false,
    anonymous: true,
  },
  {
    id: 'don-002',
    donor: 'Johnson Family',
    amount: 1200,
    fund: 'General Tithes',
    date: '2026-02-16',
    method: 'online',
    recurring: true,
    anonymous: false,
  },
  {
    id: 'don-003',
    donor: 'Sister Martha Williams',
    amount: 500,
    fund: 'General Tithes',
    date: '2026-02-15',
    method: 'recurring',
    recurring: true,
    anonymous: false,
  },
  {
    id: 'don-004',
    donor: 'Deacon James Thompson',
    amount: 250,
    fund: 'Missions',
    date: '2026-02-14',
    method: 'mobile',
    recurring: false,
    anonymous: false,
  },
  {
    id: 'don-005',
    donor: 'Anonymous',
    amount: 2000,
    fund: 'General Tithes',
    date: '2026-02-14',
    method: 'cash',
    recurring: false,
    anonymous: true,
  },
  {
    id: 'don-006',
    donor: 'Brother David Chen',
    amount: 150,
    fund: 'Benevolence',
    date: '2026-02-13',
    method: 'online',
    recurring: true,
    anonymous: false,
  },
  {
    id: 'don-007',
    donor: 'Grace Kim',
    amount: 300,
    fund: 'Offerings',
    date: '2026-02-12',
    method: 'mobile',
    recurring: false,
    anonymous: false,
  },
  {
    id: 'don-008',
    donor: 'Elder Robert Harris',
    amount: 1500,
    fund: 'General Tithes',
    date: '2026-02-11',
    method: 'recurring',
    recurring: true,
    anonymous: false,
  },
];

// =============================================================================
// GIVING CAMPAIGNS
// =============================================================================

const CAMPAIGNS: GivingCampaign[] = [
  {
    id: 'camp-001',
    name: 'New Sanctuary Renovation',
    goal: 500000,
    raised: 287500,
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    status: 'active',
    donorCount: 156,
  },
  {
    id: 'camp-002',
    name: 'Summer Missions Trip — Kenya',
    goal: 35000,
    raised: 22400,
    startDate: '2026-01-15',
    endDate: '2026-05-31',
    status: 'active',
    donorCount: 78,
  },
  {
    id: 'camp-003',
    name: 'Easter Offering',
    goal: 75000,
    raised: 0,
    startDate: '2026-03-15',
    endDate: '2026-04-05',
    status: 'upcoming',
    donorCount: 0,
  },
  {
    id: 'camp-004',
    name: 'Christmas Love Offering 2025',
    goal: 50000,
    raised: 52300,
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    status: 'completed',
    donorCount: 203,
  },
  {
    id: 'camp-005',
    name: 'Youth Center Expansion',
    goal: 150000,
    raised: 98700,
    startDate: '2025-06-01',
    endDate: '2026-12-31',
    status: 'active',
    donorCount: 112,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return '$' + (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'K';
  }
  return '$' + value.toLocaleString('en-US');
}

export function formatCurrencyFull(value: number): string {
  return '$' + value.toLocaleString('en-US');
}

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchDonationsData() {
  return {
    stats: GIVING_STATS,
    donations: DONATIONS,
    campaigns: CAMPAIGNS,
    fundAllocations: FUND_ALLOCATIONS,
  };
}
