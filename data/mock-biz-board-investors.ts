/**
 * Mock Business Board & Investors Data — Complete data layer for the Board/Investors tab.
 * 6 sub-tabs: Board, Investors, Updates, Dataroom, Resolutions, Distributions.
 * All data references Valuetainment entities: Alex Morgan, PBD, Tom Ellsworth, SAFE notes.
 */

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export type BoardSubTab = 'board' | 'investors' | 'updates' | 'dataroom' | 'resolutions' | 'distributions';

export const BOARD_SUB_TABS: { id: BoardSubTab; label: string }[] = [
  { id: 'board', label: 'Board' },
  { id: 'investors', label: 'Investors' },
  { id: 'updates', label: 'Updates' },
  { id: 'dataroom', label: 'Dataroom' },
  { id: 'resolutions', label: 'Resolutions' },
  { id: 'distributions', label: 'Distributions' },
];

// =============================================================================
// BOARD SEATS
// =============================================================================

export interface BoardSeat {
  id: string;
  title: string;
  holder: string;
  status: 'active' | 'pending' | 'vacant';
  appointedDate?: string;
  description: string;
  votingRights: boolean;
}

export const BOARD_SEATS: BoardSeat[] = [
  {
    id: 'bs-1',
    title: 'Founder & CEO',
    holder: 'Alex Morgan',
    status: 'active',
    appointedDate: '2024-01-15',
    description:
      'Founding board seat with full voting authority. Responsible for corporate strategy, fundraising, and executive decisions across all Valuetainment entities.',
    votingRights: true,
  },
  {
    id: 'bs-2',
    title: 'Strategic Advisor',
    holder: 'Patrick Bet-David',
    status: 'pending',
    appointedDate: '2025-06-01',
    description:
      'Strategic advisory seat focused on growth strategy, media monetization, and investor relations. Pending formal board appointment following SAFE conversion.',
    votingRights: false,
  },
  {
    id: 'bs-3',
    title: 'Board Observer',
    holder: 'Tom Ellsworth',
    status: 'active',
    appointedDate: '2025-03-10',
    description:
      'Observer seat with attendance rights at all board meetings. Provides operational advisory on financial modeling, M&A due diligence, and corporate governance.',
    votingRights: false,
  },
];

// =============================================================================
// INVESTOR RECORDS
// =============================================================================

export interface InvestorRecord {
  id: string;
  name: string;
  type: 'angel' | 'strategic' | 'institutional' | 'family_office';
  invested: string;
  equity: string;
  instrument: 'SAFE' | 'Equity' | 'Convertible Note';
  status: 'active' | 'committed' | 'prospect';
  lastContact: string;
}

export const INVESTOR_RECORDS: InvestorRecord[] = [
  {
    id: 'inv-1',
    name: 'Patrick Bet-David',
    type: 'strategic',
    invested: '$250,000',
    equity: '4.2%',
    instrument: 'SAFE',
    status: 'active',
    lastContact: '2026-02-10',
  },
  {
    id: 'inv-2',
    name: 'Tom Ellsworth',
    type: 'angel',
    invested: '$100,000',
    equity: '1.8%',
    instrument: 'SAFE',
    status: 'active',
    lastContact: '2026-02-12',
  },
  {
    id: 'inv-3',
    name: 'Valor Equity Partners',
    type: 'institutional',
    invested: '$500,000',
    equity: '8.5%',
    instrument: 'Convertible Note',
    status: 'committed',
    lastContact: '2026-01-28',
  },
  {
    id: 'inv-4',
    name: 'Carter Family Office',
    type: 'family_office',
    invested: '$75,000',
    equity: '1.2%',
    instrument: 'Equity',
    status: 'active',
    lastContact: '2026-02-01',
  },
  {
    id: 'inv-5',
    name: 'Mintwood Capital',
    type: 'institutional',
    invested: '$0',
    equity: '0%',
    instrument: 'SAFE',
    status: 'prospect',
    lastContact: '2026-02-14',
  },
];

// =============================================================================
// INVESTOR UPDATES
// =============================================================================

export interface InvestorUpdate {
  id: string;
  title: string;
  date: string;
  status: 'sent' | 'draft' | 'scheduled';
  recipients: string;
  summary: string;
  tier: 'all' | 'board' | 'strategic';
}

export const INVESTOR_UPDATES: InvestorUpdate[] = [
  {
    id: 'iu-1',
    title: 'Q4 2025 Investor Update',
    date: '2026-01-15',
    status: 'sent',
    recipients: 'All Investors (4)',
    summary:
      'Closed Q4 with $142K cash on hand, 7.2 months runway. Valuetainment OS v2 shipped with Business Mode, Competition Mode, and Nexus AI. Valuetainment proof wedge generating $53M+ projected media value Y1. Next milestone: Series A prep with updated financial model.',
    tier: 'all',
  },
  {
    id: 'iu-2',
    title: 'Board Pack \u2014 February 2026',
    date: '2026-02-10',
    status: 'sent',
    recipients: 'Board & Strategic (3)',
    summary:
      'Board pack covering runway extension strategy, Valuetainment partnership expansion, 2819 Church campus rollout plan, and preliminary Series A term sheet review. Action items: approve budget reallocation, vote on advisory seat conversion.',
    tier: 'board',
  },
  {
    id: 'iu-3',
    title: 'March 2026 Investor Update',
    date: '2026-03-01',
    status: 'scheduled',
    recipients: 'All Investors (4)',
    summary:
      'Upcoming update covering: Series A fundraise progress, Valuetainment OS v2.1 release, new proof wedge onboarding (PBD Podcast), and updated financial projections through Q2 2026.',
    tier: 'all',
  },
  {
    id: 'iu-4',
    title: 'Strategic Advisory Brief \u2014 PBD',
    date: '2026-02-17',
    status: 'draft',
    recipients: 'PBD Only (1)',
    summary:
      'Confidential brief on media monetization strategy, Valuetainment cross-promotion opportunity, and proposed advisory seat conversion timeline. Includes updated cap table scenario modeling.',
    tier: 'strategic',
  },
];

// =============================================================================
// DATAROOM DOCUMENTS
// =============================================================================

export interface DataroomDoc {
  id: string;
  title: string;
  category: string;
  version: string;
  updatedAt: string;
  accessLevel: 'public' | 'retail' | 'board' | 'founder';
  watermarked: boolean;
}

export const DATAROOM_DOCS: DataroomDoc[] = [
  {
    id: 'dr-1',
    title: 'Valuetainment Media LLC \u2014 Pitch Deck v3',
    category: 'Pitch',
    version: '3.0',
    updatedAt: '2026-02-05',
    accessLevel: 'retail',
    watermarked: true,
  },
  {
    id: 'dr-2',
    title: 'Financial Model \u2014 Series A',
    category: 'Financials',
    version: '2.1',
    updatedAt: '2026-02-12',
    accessLevel: 'board',
    watermarked: true,
  },
  {
    id: 'dr-3',
    title: 'Cap Table \u2014 Current',
    category: 'Legal',
    version: '1.4',
    updatedAt: '2026-01-30',
    accessLevel: 'founder',
    watermarked: true,
  },
  {
    id: 'dr-4',
    title: 'Certificate of Incorporation',
    category: 'Legal',
    version: '1.0',
    updatedAt: '2024-01-15',
    accessLevel: 'board',
    watermarked: false,
  },
  {
    id: 'dr-5',
    title: 'SAFE Agreement Template \u2014 Valuetainment',
    category: 'Legal',
    version: '2.0',
    updatedAt: '2025-09-20',
    accessLevel: 'board',
    watermarked: false,
  },
  {
    id: 'dr-6',
    title: 'Product Demo \u2014 Valuetainment OS v2',
    category: 'Product',
    version: '2.0',
    updatedAt: '2026-02-14',
    accessLevel: 'retail',
    watermarked: false,
  },
  {
    id: 'dr-7',
    title: 'Board Meeting Minutes \u2014 Jan 2026',
    category: 'Governance',
    version: '1.0',
    updatedAt: '2026-01-20',
    accessLevel: 'board',
    watermarked: true,
  },
  {
    id: 'dr-8',
    title: 'Valuetainment Brand Guidelines',
    category: 'Brand',
    version: '1.2',
    updatedAt: '2025-11-10',
    accessLevel: 'public',
    watermarked: false,
  },
];

// =============================================================================
// RESOLUTIONS
// =============================================================================

export interface Resolution {
  id: string;
  title: string;
  date: string;
  type: 'board_vote' | 'written_consent' | 'advisory';
  outcome: 'approved' | 'deferred' | 'rejected' | 'pending';
  proposer: string;
  summary: string;
}

export const RESOLUTIONS: Resolution[] = [
  {
    id: 'res-1',
    title: 'Approve Q1 2026 Budget Reallocation',
    date: '2026-02-10',
    type: 'board_vote',
    outcome: 'approved',
    proposer: 'Alex Morgan',
    summary:
      'Reallocate $18,000 from marketing to engineering for Valuetainment OS v2.1 sprint. Approved unanimously with condition to revisit marketing spend at Q2 board meeting.',
  },
  {
    id: 'res-2',
    title: 'Convert PBD Advisory Seat to Board Seat',
    date: '2026-02-10',
    type: 'board_vote',
    outcome: 'deferred',
    proposer: 'Alex Morgan',
    summary:
      'Motion to convert Patrick Bet-David advisory role to formal board seat with voting rights upon SAFE conversion. Deferred pending legal review of governance implications.',
  },
  {
    id: 'res-3',
    title: 'Authorize Series A Fundraise',
    date: '2026-01-20',
    type: 'written_consent',
    outcome: 'approved',
    proposer: 'Alex Morgan',
    summary:
      'Written consent authorizing the company to pursue Series A fundraise targeting $2M\u2013$5M at $15M\u2013$25M pre-money valuation. Approved by all voting members.',
  },
  {
    id: 'res-4',
    title: 'Adopt Updated Employee Stock Option Plan',
    date: '2026-03-01',
    type: 'board_vote',
    outcome: 'pending',
    proposer: 'Alex Morgan',
    summary:
      'Proposed adoption of updated ESOP with 10% option pool reserve for Series A. Includes new vesting schedule and cliff terms. Pending discussion at March board meeting.',
  },
  {
    id: 'res-5',
    title: 'Approve Valuetainment Partnership Extension',
    date: '2025-12-15',
    type: 'advisory',
    outcome: 'approved',
    proposer: 'Tom Ellsworth',
    summary:
      'Advisory resolution recommending extension of the Valuetainment partnership through 2027 season with expanded media rights scope. Non-binding advisory approved.',
  },
];

// =============================================================================
// DISTRIBUTIONS
// =============================================================================

export interface Distribution {
  id: string;
  title: string;
  amount: string;
  date: string;
  type: 'dividend' | 'return_of_capital' | 'profit_share';
  status: 'paid' | 'scheduled' | 'pending_approval';
  recipients: string;
}

export const DISTRIBUTIONS: Distribution[] = [
  {
    id: 'dist-1',
    title: 'OSK Group LLC \u2014 Q4 2025 Distribution',
    amount: '$12,500',
    date: '2026-01-31',
    type: 'profit_share',
    status: 'paid',
    recipients: 'OSK Members (2)',
  },
  {
    id: 'dist-2',
    title: 'Valuetainment Digital LLC \u2014 Creator Revenue Share',
    amount: '$4,200',
    date: '2026-02-15',
    type: 'profit_share',
    status: 'paid',
    recipients: 'Media LLC Members (1)',
  },
  {
    id: 'dist-3',
    title: 'OSK Group LLC \u2014 Q1 2026 Distribution',
    amount: '$15,000',
    date: '2026-04-15',
    type: 'profit_share',
    status: 'scheduled',
    recipients: 'OSK Members (2)',
  },
  {
    id: 'dist-4',
    title: 'Valuetainment Media LLC \u2014 Founder Capital Return',
    amount: '$25,000',
    date: '2026-06-01',
    type: 'return_of_capital',
    status: 'pending_approval',
    recipients: 'Alex Morgan',
  },
];

// =============================================================================
// RBAC — Sub-tab access by role
// =============================================================================

import type { BusinessRoleLens } from '@/utils/business-rbac';

/**
 * Which sub-tabs each role can see:
 *   B0/B1 → all 6 (founder)
 *   B2     → all 6 (c-suite)
 *   B6/B9  → board, updates, dataroom, resolutions (board-level investors)
 *   B7     → updates, dataroom (retail investor — curated view)
 *   B8     → board, updates, dataroom, resolutions (advisor)
 *   B13    → all 6 (holding company)
 *   Others → locked (empty array)
 */
const SUB_TAB_ACCESS: Partial<Record<BusinessRoleLens, BoardSubTab[]>> = {
  B0: ['board', 'investors', 'updates', 'dataroom', 'resolutions', 'distributions'],
  B1: ['board', 'investors', 'updates', 'dataroom', 'resolutions', 'distributions'],
  B2: ['board', 'investors', 'updates', 'dataroom', 'resolutions', 'distributions'],
  B6: ['board', 'updates', 'dataroom', 'resolutions'],
  B7: ['updates', 'dataroom'],
  B8: ['board', 'updates', 'dataroom', 'resolutions'],
  B9: ['board', 'updates', 'dataroom', 'resolutions'],
  B13: ['board', 'investors', 'updates', 'dataroom', 'resolutions', 'distributions'],
};

export function getVisibleBoardSubTabs(role: BusinessRoleLens): { id: BoardSubTab; label: string }[] {
  const allowed = SUB_TAB_ACCESS[role] ?? [];
  return BOARD_SUB_TABS.filter((tab) => allowed.includes(tab.id));
}

// =============================================================================
// DATAROOM — Role-based document filtering
// =============================================================================

export function getVisibleDataroomDocs(role: BusinessRoleLens): DataroomDoc[] {
  // Founder / system owner / holding company sees all
  if (role === 'B0' || role === 'B1' || role === 'B13') return DATAROOM_DOCS;
  // Board-level (C-Suite, Strategic Investor, Advisor, Board Member) sees all except founder-only
  if (role === 'B2' || role === 'B6' || role === 'B8' || role === 'B9') {
    return DATAROOM_DOCS.filter((d) => d.accessLevel !== 'founder');
  }
  // Retail investor sees public + retail
  if (role === 'B7') {
    return DATAROOM_DOCS.filter((d) => d.accessLevel === 'public' || d.accessLevel === 'retail');
  }
  // Everyone else sees public only
  return DATAROOM_DOCS.filter((d) => d.accessLevel === 'public');
}

// =============================================================================
// INVESTOR UPDATES — Role-based filtering
// =============================================================================

export function getVisibleUpdates(role: BusinessRoleLens): InvestorUpdate[] {
  // Founder / system owner / holding company sees all
  if (role === 'B0' || role === 'B1' || role === 'B13') return INVESTOR_UPDATES;
  // Board-level sees all + board tier
  if (role === 'B2' || role === 'B6' || role === 'B8' || role === 'B9') {
    return INVESTOR_UPDATES.filter((u) => u.tier === 'all' || u.tier === 'board');
  }
  // Retail investor sees all-tier only
  if (role === 'B7') {
    return INVESTOR_UPDATES.filter((u) => u.tier === 'all');
  }
  return [];
}

// =============================================================================
// HELPERS — Display formatting
// =============================================================================

export function formatBoardSeatDate(dateStr?: string): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatInvestorType(type: InvestorRecord['type']): string {
  switch (type) {
    case 'angel':
      return 'Angel';
    case 'strategic':
      return 'Strategic';
    case 'institutional':
      return 'Institutional';
    case 'family_office':
      return 'Family Office';
    default:
      return type;
  }
}

export function formatResolutionType(type: Resolution['type']): string {
  switch (type) {
    case 'board_vote':
      return 'Board Vote';
    case 'written_consent':
      return 'Written Consent';
    case 'advisory':
      return 'Advisory';
    default:
      return type;
  }
}

export function formatDistributionType(type: Distribution['type']): string {
  switch (type) {
    case 'dividend':
      return 'Dividend';
    case 'return_of_capital':
      return 'Return of Capital';
    case 'profit_share':
      return 'Profit Share';
    default:
      return type;
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
