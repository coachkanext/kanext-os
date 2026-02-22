/**
 * Education Organization Sponsors — Mock Data
 * Donors, endowments, campaigns, partnerships, and fundraising.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface EduSponsor {
  id: string;
  name: string;
  type: 'individual' | 'corporate' | 'foundation' | 'alumni' | 'government';
  totalGiving: number;
  currentYear: number;
  since: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  focus: string[];
  status: 'active' | 'lapsed' | 'prospect';
}

export interface Endowment {
  id: string;
  name: string;
  value: number;
  annualDistribution: number;
  purpose: string;
  establishedYear: number;
  donor: string;
}

export interface SponsorshipStats {
  totalRaised: number;
  goalAmount: number;
  donorCount: number;
  newDonors: number;
  retentionRate: number;
  endowmentTotal: number;
  annualFundTotal: number;
}

export interface Campaign {
  id: string;
  name: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  description: string;
}

export interface PartnershipOpportunity {
  id: string;
  title: string;
  description: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  estimatedValue: number;
  benefits: string[];
  status: 'open' | 'in_discussion' | 'closed';
}

export type EduSponsorsTabId =
  | 'overview'
  | 'sponsors'
  | 'endowments'
  | 'campaigns'
  | 'retention'
  | 'partnerships';

export interface EduSponsorsTab {
  id: EduSponsorsTabId;
  label: string;
  icon: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const EDU_SPONSORS_TABS: EduSponsorsTab[] = [
  { id: 'overview', label: 'Overview', icon: 'chart.bar.fill' },
  { id: 'sponsors', label: 'Sponsors', icon: 'person.2.fill' },
  { id: 'endowments', label: 'Endowments', icon: 'building.columns.fill' },
  { id: 'campaigns', label: 'Campaigns', icon: 'megaphone.fill' },
  { id: 'retention', label: 'Retention', icon: 'arrow.triangle.2.circlepath' },
  { id: 'partnerships', label: 'Partnerships', icon: 'handshake.fill' },
];

export const EDU_SPONSORS_SCOPE_CHIPS = [
  'All Donors',
  'Platinum',
  'Gold',
  'Silver',
  'Bronze',
  'Alumni',
];

// =============================================================================
// STATUS COLOR MAPS
// =============================================================================

export const SPONSOR_TIER_COLOR: Record<EduSponsor['tier'], string> = {
  platinum: '#A1A1AA',
  gold: '#F59E0B',
  silver: '#A1A1AA',
  bronze: '#1D9BF0',
};

export const SPONSOR_TYPE_COLOR: Record<EduSponsor['type'], string> = {
  individual: '#1D9BF0',
  corporate: '#1D9BF0',
  foundation: '#22C55E',
  alumni: '#F59E0B',
  government: '#A1A1AA',
};

export const SPONSOR_TYPE_LABEL: Record<EduSponsor['type'], string> = {
  individual: 'INDIVIDUAL',
  corporate: 'CORPORATE',
  foundation: 'FOUNDATION',
  alumni: 'ALUMNI',
  government: 'GOVERNMENT',
};

export const SPONSOR_STATUS_COLOR: Record<EduSponsor['status'], string> = {
  active: '#22C55E',
  lapsed: '#EF4444',
  prospect: '#F59E0B',
};

export const CAMPAIGN_STATUS_COLOR: Record<Campaign['status'], string> = {
  active: '#22C55E',
  completed: '#1D9BF0',
  upcoming: '#F59E0B',
};

export const PARTNERSHIP_STATUS_COLOR: Record<PartnershipOpportunity['status'], string> = {
  open: '#22C55E',
  in_discussion: '#F59E0B',
  closed: '#A1A1AA',
};

// =============================================================================
// MOCK DATA
// =============================================================================

export function getEduSponsorsData(_scope: string) {
  const stats: SponsorshipStats = {
    totalRaised: 4250000,
    goalAmount: 6000000,
    donorCount: 1842,
    newDonors: 215,
    retentionRate: 72,
    endowmentTotal: 28500000,
    annualFundTotal: 1850000,
  };

  const sponsors: EduSponsor[] = [
    {
      id: 'esp-1', name: 'Patterson Family Foundation', type: 'foundation',
      totalGiving: 2500000, currentYear: 250000, since: '2008',
      tier: 'platinum', focus: ['Library', 'Scholarships'], status: 'active',
    },
    {
      id: 'esp-2', name: 'Thornton Industries', type: 'corporate',
      totalGiving: 1800000, currentYear: 200000, since: '2012',
      tier: 'platinum', focus: ['Engineering', 'STEM Programs'], status: 'active',
    },
    {
      id: 'esp-3', name: 'Dr. Robert & Jean Williams', type: 'alumni',
      totalGiving: 950000, currentYear: 100000, since: '1998',
      tier: 'gold', focus: ['Athletics', 'Student Life'], status: 'active',
    },
    {
      id: 'esp-4', name: 'National Science Foundation', type: 'government',
      totalGiving: 750000, currentYear: 150000, since: '2019',
      tier: 'gold', focus: ['Research Labs', 'Faculty Support'], status: 'active',
    },
    {
      id: 'esp-5', name: 'TechVentures Corp', type: 'corporate',
      totalGiving: 425000, currentYear: 75000, since: '2020',
      tier: 'silver', focus: ['Computer Science', 'Innovation Lab'], status: 'active',
    },
    {
      id: 'esp-6', name: 'Alumni Class of 1995', type: 'alumni',
      totalGiving: 320000, currentYear: 45000, since: '2015',
      tier: 'silver', focus: ['Annual Fund', 'Reunion Gift'], status: 'active',
    },
    {
      id: 'esp-7', name: 'Green Earth Initiative', type: 'foundation',
      totalGiving: 180000, currentYear: 0, since: '2017',
      tier: 'bronze', focus: ['Sustainability', 'Environmental Studies'], status: 'lapsed',
    },
    {
      id: 'esp-8', name: 'Marcus & Elena Chen', type: 'individual',
      totalGiving: 125000, currentYear: 25000, since: '2021',
      tier: 'bronze', focus: ['Performing Arts', 'Music'], status: 'active',
    },
  ];

  const endowments: Endowment[] = [
    {
      id: 'end-1', name: 'Patterson Library Endowment', value: 8500000,
      annualDistribution: 340000, purpose: 'Library acquisitions and digital resources',
      establishedYear: 2008, donor: 'Patterson Family Foundation',
    },
    {
      id: 'end-2', name: 'Thornton STEM Scholarship Fund', value: 6200000,
      annualDistribution: 248000, purpose: 'Full-ride scholarships for STEM majors',
      establishedYear: 2012, donor: 'Thornton Industries',
    },
    {
      id: 'end-3', name: 'Williams Athletic Excellence Fund', value: 4800000,
      annualDistribution: 192000, purpose: 'Athletic facility improvements and scholarships',
      establishedYear: 1998, donor: 'Dr. Robert & Jean Williams',
    },
    {
      id: 'end-4', name: 'General Scholarship Endowment', value: 5200000,
      annualDistribution: 208000, purpose: 'Need-based financial aid for undergraduates',
      establishedYear: 1975, donor: 'Multiple Donors',
    },
    {
      id: 'end-5', name: 'Chen Performing Arts Fund', value: 1800000,
      annualDistribution: 72000, purpose: 'Annual concert series and guest artists',
      establishedYear: 2021, donor: 'Marcus & Elena Chen',
    },
  ];

  const campaigns: Campaign[] = [
    {
      id: 'cmp-1', name: 'Building Tomorrow Campaign', goal: 15000000,
      raised: 9200000, startDate: 'Jan 2024', endDate: 'Dec 2026',
      status: 'active', description: 'Capital campaign for new science building and technology upgrades.',
    },
    {
      id: 'cmp-2', name: 'Annual Fund 2025-26', goal: 2000000,
      raised: 1850000, startDate: 'Jul 2025', endDate: 'Jun 2026',
      status: 'active', description: 'Unrestricted giving for operations, faculty support, and student programs.',
    },
    {
      id: 'cmp-3', name: 'Day of Giving', goal: 500000,
      raised: 520000, startDate: 'Oct 15, 2025', endDate: 'Oct 15, 2025',
      status: 'completed', description: '24-hour giving challenge with alumni matching gifts.',
    },
    {
      id: 'cmp-4', name: 'Scholarship Match Challenge', goal: 1000000,
      raised: 0, startDate: 'Mar 2026', endDate: 'May 2026',
      status: 'upcoming', description: 'Every dollar donated to scholarships matched 1:1 by Thornton Industries.',
    },
  ];

  const partnerships: PartnershipOpportunity[] = [
    {
      id: 'po-1', title: 'Science Building Naming Rights', description: 'Name the new 80,000 sq ft science facility.',
      tier: 'platinum', estimatedValue: 5000000,
      benefits: ['Building naming', 'Permanent plaque', 'Dedication ceremony', 'Annual recognition event'],
      status: 'open',
    },
    {
      id: 'po-2', title: 'Innovation Lab Sponsorship', description: 'Sponsor the campus maker space and innovation hub.',
      tier: 'gold', estimatedValue: 1000000,
      benefits: ['Lab naming', 'Corporate mentorship program', 'Research collaboration', 'Student intern pipeline'],
      status: 'in_discussion',
    },
    {
      id: 'po-3', title: 'Athletic Field Upgrade', description: 'Fund synthetic turf and lighting for the main athletic field.',
      tier: 'gold', estimatedValue: 750000,
      benefits: ['Field naming', 'Signage placement', 'Season passes', 'Community use partnership'],
      status: 'open',
    },
    {
      id: 'po-4', title: 'Library Digital Archive', description: 'Digitize the historical collection and rare books archive.',
      tier: 'silver', estimatedValue: 350000,
      benefits: ['Archive naming', 'Digital collection access', 'Research credits', 'Annual report feature'],
      status: 'open',
    },
    {
      id: 'po-5', title: 'Student Wellness Center', description: 'Support mental health and wellness services expansion.',
      tier: 'silver', estimatedValue: 500000,
      benefits: ['Center naming', 'Program branding', 'Impact reports', 'Community wellness events'],
      status: 'in_discussion',
    },
  ];

  // Retention metrics
  const retentionMetrics = {
    overallRate: 72,
    platinumRetention: 95,
    goldRetention: 88,
    silverRetention: 74,
    bronzeRetention: 58,
    firstTimeRetention: 42,
    alumniRetention: 68,
    corporateRetention: 82,
    lapsedDonors: 312,
    reactivated: 45,
    avgGiftGrowth: 8.5,
    monthlyTrend: [
      { month: 'Sep', rate: 70 },
      { month: 'Oct', rate: 71 },
      { month: 'Nov', rate: 73 },
      { month: 'Dec', rate: 76 },
      { month: 'Jan', rate: 72 },
      { month: 'Feb', rate: 72 },
    ],
  };

  return {
    stats,
    sponsors,
    endowments,
    campaigns,
    partnerships,
    retentionMetrics,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}
