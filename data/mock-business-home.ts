/**
 * Mock Business Home Data — KaNeXT OS Business Mode
 * Startup fundraising, product milestones, CRM, data room, cap table
 */

import type { ProgramCalendarEvent } from '@/types';

// =============================================================================
// 1. CALENDAR EVENTS (ProgramCalendarEvent[])
// =============================================================================

export const BIZ_CALENDAR_EVENTS: ProgramCalendarEvent[] = [
  {
    id: 'bce-1',
    type: 'meeting',
    title: 'Board Meeting — Q1 Review',
    startDatetime: new Date('2026-02-20T10:00:00'),
    endDatetime: new Date('2026-02-20T12:00:00'),
    location: 'Virtual (Zoom)',
    description: 'Quarterly board review: financials, product roadmap, fundraise status',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-2',
    type: 'meeting',
    title: 'Investor Meeting — Lightspeed',
    startDatetime: new Date('2026-02-24T14:00:00'),
    endDatetime: new Date('2026-02-24T15:00:00'),
    location: 'Menlo Park, CA',
    description: 'First meeting with Lightspeed Venture Partners — seed round',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-3',
    type: 'meeting',
    title: 'Product Sprint Planning — V2 Modes',
    startDatetime: new Date('2026-02-25T09:00:00'),
    endDatetime: new Date('2026-02-25T11:00:00'),
    location: 'Virtual',
    description: 'Sprint 14 kickoff: Church Mode + Education Mode polish',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-4',
    type: 'meeting',
    title: 'Pitch — Precursor Ventures',
    startDatetime: new Date('2026-02-27T11:00:00'),
    endDatetime: new Date('2026-02-27T12:00:00'),
    location: 'San Francisco, CA',
    description: 'Seed pitch — $3M target raise. Charles Hudson lead.',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-5',
    type: 'admin_deadline',
    title: 'Delaware Franchise Tax Deadline',
    startDatetime: new Date('2026-03-01T00:00:00'),
    endDatetime: new Date('2026-03-01T23:59:00'),
    location: 'Online Filing',
    description: 'Annual franchise tax filing — Delaware Secretary of State',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-6',
    type: 'meeting',
    title: 'HBCU Innovation Summit — Panel',
    startDatetime: new Date('2026-03-05T13:00:00'),
    endDatetime: new Date('2026-03-05T14:30:00'),
    location: 'Atlanta, GA',
    description: 'Founder panel: "Building tech for underserved institutions"',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-7',
    type: 'meeting',
    title: 'Team Sync — Weekly All-Hands',
    startDatetime: new Date('2026-03-02T09:00:00'),
    endDatetime: new Date('2026-03-02T09:45:00'),
    location: 'Virtual (Slack Huddle)',
    description: 'Weekly standup: blockers, wins, priorities',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-8',
    type: 'meeting',
    title: 'Investor Meeting — Kapor Capital',
    startDatetime: new Date('2026-03-10T10:00:00'),
    endDatetime: new Date('2026-03-10T11:00:00'),
    location: 'Oakland, CA',
    description: 'Second meeting — impact thesis alignment discussion',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-9',
    type: 'meeting',
    title: 'Product Demo — FMU Athletics Staff',
    startDatetime: new Date('2026-03-12T15:00:00'),
    endDatetime: new Date('2026-03-12T16:00:00'),
    location: 'FMU Campus, Miami Gardens',
    description: 'Live walkthrough of Sports Mode v2 with coaching staff',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-10',
    type: 'meeting',
    title: 'Pitch — Harlem Capital',
    startDatetime: new Date('2026-03-17T14:00:00'),
    endDatetime: new Date('2026-03-17T15:00:00'),
    location: 'New York, NY',
    description: 'Seed pitch — diverse founder thesis. Henri Pierre-Jacques lead.',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-11',
    type: 'admin_deadline',
    title: 'IP Filing — Provisional Patent Extension',
    startDatetime: new Date('2026-03-20T00:00:00'),
    endDatetime: new Date('2026-03-20T23:59:00'),
    location: 'USPTO',
    description: 'Extend provisional patent filing for unified institutional OS architecture',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-12',
    type: 'meeting',
    title: 'Media — TechCrunch Interview',
    startDatetime: new Date('2026-03-24T11:00:00'),
    endDatetime: new Date('2026-03-24T11:45:00'),
    location: 'Virtual',
    description: 'Founder profile piece — startup building OS for institutions',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-13',
    type: 'meeting',
    title: 'NAIA Conference — Demo Booth',
    startDatetime: new Date('2026-04-02T08:00:00'),
    endDatetime: new Date('2026-04-02T17:00:00'),
    location: 'Kansas City, MO',
    description: 'NAIA annual convention — live demo booth + AD networking',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-14',
    type: 'meeting',
    title: 'Board Meeting — Fundraise Update',
    startDatetime: new Date('2026-04-15T10:00:00'),
    endDatetime: new Date('2026-04-15T12:00:00'),
    location: 'Virtual (Zoom)',
    description: 'Mid-round board update: term sheets, traction metrics, burn',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-15',
    type: 'meeting',
    title: 'Product Sprint — Competition Mode Kickoff',
    startDatetime: new Date('2026-04-20T09:00:00'),
    endDatetime: new Date('2026-04-20T11:00:00'),
    location: 'Virtual',
    description: 'Sprint 18: Competition Mode architecture + K-1 integration spec',
    visibilityScope: 'all_program',
  },
  {
    id: 'bce-16',
    type: 'meeting',
    title: 'Investor Meeting — a16z Cultural Leadership Fund',
    startDatetime: new Date('2026-05-05T13:00:00'),
    endDatetime: new Date('2026-05-05T14:00:00'),
    location: 'Menlo Park, CA',
    description: 'Intro meeting through CLF network — institutional sports thesis',
    visibilityScope: 'team_staff',
  },
  {
    id: 'bce-17',
    type: 'meeting',
    title: 'Conference — AfroTech Startup Pitch Competition',
    startDatetime: new Date('2026-05-12T09:00:00'),
    endDatetime: new Date('2026-05-12T17:00:00'),
    location: 'Austin, TX',
    description: 'Selected as finalist — 5-minute pitch + demo + Q&A',
    visibilityScope: 'all_program',
  },
];

// =============================================================================
// 2. BIZ EVENTS
// =============================================================================

export interface BizEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'investor' | 'board' | 'product' | 'legal' | 'media' | 'conference';
  status: 'upcoming' | 'completed';
  attendees: string[];
  outcome?: string;
}

export const BIZ_EVENTS: BizEvent[] = [
  // ─── Upcoming (8) ───
  {
    id: 'be-1',
    title: 'Board Meeting — Q1 Review',
    date: '2026-02-20',
    time: '10:00 AM',
    location: 'Virtual (Zoom)',
    category: 'board',
    status: 'upcoming',
    attendees: ['Sammy (Founder)', 'Board Advisor 1', 'Board Advisor 2'],
  },
  {
    id: 'be-2',
    title: 'Lightspeed Venture Partners — Seed Pitch',
    date: '2026-02-24',
    time: '2:00 PM',
    location: 'Menlo Park, CA',
    category: 'investor',
    status: 'upcoming',
    attendees: ['Sammy (Founder)', 'Michael Mignano (Lightspeed)'],
  },
  {
    id: 'be-3',
    title: 'Precursor Ventures — Seed Pitch',
    date: '2026-02-27',
    time: '11:00 AM',
    location: 'San Francisco, CA',
    category: 'investor',
    status: 'upcoming',
    attendees: ['Sammy (Founder)', 'Charles Hudson (Precursor)'],
  },
  {
    id: 'be-4',
    title: 'HBCU Innovation Summit — Panel',
    date: '2026-03-05',
    time: '1:00 PM',
    location: 'Atlanta, GA',
    category: 'conference',
    status: 'upcoming',
    attendees: ['Sammy (Founder)', 'Panel Moderator', '3 Co-Panelists'],
  },
  {
    id: 'be-5',
    title: 'Kapor Capital — Follow-Up Meeting',
    date: '2026-03-10',
    time: '10:00 AM',
    location: 'Oakland, CA',
    category: 'investor',
    status: 'upcoming',
    attendees: ['Sammy (Founder)', 'Ulili Onovakpuri (Kapor)'],
  },
  {
    id: 'be-6',
    title: 'Harlem Capital — Seed Pitch',
    date: '2026-03-17',
    time: '2:00 PM',
    location: 'New York, NY',
    category: 'investor',
    status: 'upcoming',
    attendees: ['Sammy (Founder)', 'Henri Pierre-Jacques (Harlem Capital)'],
  },
  {
    id: 'be-7',
    title: 'TechCrunch — Founder Interview',
    date: '2026-03-24',
    time: '11:00 AM',
    location: 'Virtual',
    category: 'media',
    status: 'upcoming',
    attendees: ['Sammy (Founder)', 'TC Reporter'],
  },
  {
    id: 'be-8',
    title: 'Provisional Patent Extension Filing',
    date: '2026-03-20',
    time: '12:00 PM',
    location: 'USPTO (Online)',
    category: 'legal',
    status: 'upcoming',
    attendees: ['Sammy (Founder)', 'IP Counsel'],
  },
  // ─── Completed (4) ───
  {
    id: 'be-9',
    title: 'FMU Athletics — Product Demo',
    date: '2026-02-10',
    time: '3:00 PM',
    location: 'FMU Campus, Miami Gardens',
    category: 'product',
    status: 'completed',
    attendees: ['Sammy (Founder)', 'Coach Davis', 'AD Williams'],
    outcome: 'Positive reception. Sports Mode v2 approved for expanded rollout.',
  },
  {
    id: 'be-10',
    title: 'ICCLA — Church Mode Walkthrough',
    date: '2026-02-05',
    time: '10:00 AM',
    location: 'Virtual',
    category: 'product',
    status: 'completed',
    attendees: ['Sammy (Founder)', 'Pastor Richards', 'Admin Team (3)'],
    outcome: 'Church Mode onboarding confirmed. Launch date set for March 2026.',
  },
  {
    id: 'be-11',
    title: 'Delaware Corp Formation — Final Filing',
    date: '2026-01-15',
    time: '9:00 AM',
    location: 'Online Filing',
    category: 'legal',
    status: 'completed',
    attendees: ['Sammy (Founder)', 'Corporate Counsel'],
    outcome: 'C-Corp formation complete. EIN issued.',
  },
  {
    id: 'be-12',
    title: 'Backstage Capital — Intro Call',
    date: '2026-02-03',
    time: '1:00 PM',
    location: 'Virtual',
    category: 'investor',
    status: 'completed',
    attendees: ['Sammy (Founder)', 'Arlan Hamilton (Backstage)'],
    outcome: 'Strong interest. Requested data room access and follow-up in March.',
  },
];

// =============================================================================
// 3. PRODUCT MILESTONES
// =============================================================================

export interface ProductMilestone {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  date?: string;
  description: string;
}

export const PRODUCT_MILESTONES: ProductMilestone[] = [
  {
    id: 'pm-1',
    name: 'Stage 1 Demo Seed',
    status: 'completed',
    date: '2026-01-15',
    description: 'Initial data seeding for FMU Lions — 20 recruits, 3 game plans, 8 DM threads, full finance + payment rails',
  },
  {
    id: 'pm-2',
    name: 'Sports Mode Live',
    status: 'completed',
    date: '2026-02-10',
    description: 'Full Sports Mode v2: 4-pill home, 10-tab org, roster CRM, recruiting board, calendar, entity sheets',
  },
  {
    id: 'pm-3',
    name: '4-Mode Expansion',
    status: 'in_progress',
    date: '2026-03-01',
    description: 'Church, Education, Business, and Competition modes with shared infrastructure and mode-specific RBAC',
  },
  {
    id: 'pm-4',
    name: 'National Player Pool',
    status: 'in_progress',
    date: '2026-03-15',
    description: 'Scraper pipeline for NJCAA (D1/D2/D3), NAIA, CCCAA — 500+ team rosters indexed',
  },
  {
    id: 'pm-5',
    name: 'Church Mode Live',
    status: 'upcoming',
    date: '2026-03-30',
    description: 'ICCLA onboarding complete — member management, giving, groups, event calendar, pastoral tools',
  },
  {
    id: 'pm-6',
    name: 'Education Mode Live',
    status: 'upcoming',
    date: '2026-04-15',
    description: 'FMU integration — academic tracking, department org, student services, compliance',
  },
  {
    id: 'pm-7',
    name: 'Competition Mode Live',
    status: 'upcoming',
    date: '2026-05-01',
    description: 'K-1 Grand Prix integration — event management, fighter profiles, bracket engine, broadcast tools',
  },
  {
    id: 'pm-8',
    name: 'Series A',
    status: 'upcoming',
    date: '2026-09-01',
    description: 'Target $8-12M raise with 4 live modes, proven multi-institution traction, and national player pool',
  },
];

// =============================================================================
// 4. FUNDRAISE METRICS
// =============================================================================

export interface FundraiseMetrics {
  currentRound: string;
  target: number;
  raised: number;
  activeConversations: number;
  proposalsSent: number;
  burnRate: number;
  runway: number;
  period: string;
}

export const FUNDRAISE_METRICS: FundraiseMetrics = {
  currentRound: 'seed',
  target: 3_000_000,
  raised: 150_000,
  activeConversations: 12,
  proposalsSent: 4,
  burnRate: 18_000,
  runway: 8,
  period: 'Feb 2026',
};

// =============================================================================
// 5. TRACTION METRICS
// =============================================================================

export interface TractionMetrics {
  institutions: number;
  institutionNames: string[];
  activeViews: number;
  ipDocs: number;
  enginesBuilt: number;
  transactionsProcessed: number;
  period: string;
}

export const TRACTION_METRICS: TractionMetrics = {
  institutions: 3,
  institutionNames: ['FMU Lions', 'ICCLA', 'K-1 Grand Prix'],
  activeViews: 5,
  ipDocs: 6,
  enginesBuilt: 5,
  transactionsProcessed: 1_240,
  period: 'Feb 2026',
};

// =============================================================================
// 6. BIZ NEWS
// =============================================================================

export interface BizNewsItem {
  id: string;
  type: 'video' | 'article';
  headline: string;
  date: string;
  category: 'product' | 'founder' | 'press' | 'investor' | 'partnership';
  speaker?: string;
  duration?: string;
  thumbnailColor?: string;
}

export const BIZ_NEWS: BizNewsItem[] = [
  {
    id: 'bn-1',
    type: 'video',
    headline: 'KaNeXT Demo Day — Sports Mode v2 Walkthrough',
    date: '2026-02-12',
    category: 'product',
    speaker: 'Sammy',
    duration: '8:42',
    thumbnailColor: '#1a1a2e',
  },
  {
    id: 'bn-2',
    type: 'article',
    headline: 'Why Institutions Need Their Own OS',
    date: '2026-02-08',
    category: 'founder',
  },
  {
    id: 'bn-3',
    type: 'video',
    headline: 'Founder Story — Building KaNeXT from Miami',
    date: '2026-01-28',
    category: 'founder',
    speaker: 'Sammy',
    duration: '12:15',
    thumbnailColor: '#0f3460',
  },
  {
    id: 'bn-4',
    type: 'article',
    headline: 'HBCU Athletics and the Technology Gap',
    date: '2026-01-20',
    category: 'press',
  },
  {
    id: 'bn-5',
    type: 'video',
    headline: 'KaNeXT Player Pool — National Recruiting Database',
    date: '2026-02-15',
    category: 'product',
    speaker: 'Sammy',
    duration: '6:30',
    thumbnailColor: '#16213e',
  },
  {
    id: 'bn-6',
    type: 'article',
    headline: 'Backstage Capital Explores Institutional SaaS Bet',
    date: '2026-02-04',
    category: 'investor',
  },
  {
    id: 'bn-7',
    type: 'article',
    headline: 'FMU Lions Go Digital — KaNeXT Partnership Announced',
    date: '2026-02-11',
    category: 'partnership',
  },
  {
    id: 'bn-8',
    type: 'video',
    headline: 'Church Mode Preview — Serving Houses of Worship',
    date: '2026-02-17',
    category: 'product',
    speaker: 'Sammy',
    duration: '5:18',
    thumbnailColor: '#533483',
  },
];

// =============================================================================
// 7. VAULT FOLDERS
// =============================================================================

export interface VaultFolder {
  id: string;
  name: string;
  documentCount: number;
  lastUpdated: string;
  accessLevel: 'public' | 'investor' | 'board' | 'founder_only';
}

export const VAULT_FOLDERS: VaultFolder[] = [
  { id: 'vf-1', name: 'Corporate', documentCount: 3, lastUpdated: '2026-01-15', accessLevel: 'board' },
  { id: 'vf-2', name: 'Financial', documentCount: 2, lastUpdated: '2026-02-01', accessLevel: 'investor' },
  { id: 'vf-3', name: 'Product', documentCount: 2, lastUpdated: '2026-02-14', accessLevel: 'investor' },
  { id: 'vf-4', name: 'Legal', documentCount: 2, lastUpdated: '2026-01-20', accessLevel: 'founder_only' },
  { id: 'vf-5', name: 'IP', documentCount: 2, lastUpdated: '2026-02-10', accessLevel: 'board' },
  { id: 'vf-6', name: 'Team', documentCount: 1, lastUpdated: '2026-02-05', accessLevel: 'founder_only' },
];

// =============================================================================
// 8. VAULT DOCUMENTS
// =============================================================================

export type BizDocumentCategory = 'contract' | 'invoice' | 'proposal' | 'financial' | 'legal';

export interface VaultDocument {
  id: string;
  folderId: string;
  name: string;
  type: 'pdf' | 'doc' | 'spreadsheet' | 'deck';
  uploadDate: string;
  lastModified: string;
  size: string;
  accessLevel: 'public' | 'investor' | 'board' | 'founder_only';
  version: string;
  tags?: string[];
}

export const VAULT_DOCUMENTS: VaultDocument[] = [
  // Corporate
  { id: 'vd-1', folderId: 'vf-1', name: 'Certificate of Incorporation', type: 'pdf', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '245 KB', accessLevel: 'board', version: '1.0', tags: ['corporate', 'legal'] },
  { id: 'vd-2', folderId: 'vf-1', name: 'Bylaws', type: 'doc', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '182 KB', accessLevel: 'board', version: '1.0', tags: ['corporate', 'legal'] },
  { id: 'vd-3', folderId: 'vf-1', name: 'Board Consent — Initial Actions', type: 'pdf', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '98 KB', accessLevel: 'board', version: '1.0', tags: ['corporate'] },
  // Financial
  { id: 'vd-4', folderId: 'vf-2', name: 'Seed Pitch Deck', type: 'deck', uploadDate: '2026-01-20', lastModified: '2026-02-01', size: '8.4 MB', accessLevel: 'investor', version: '3.2', tags: ['financial', 'proposal'] },
  { id: 'vd-5', folderId: 'vf-2', name: 'Financial Model — 3-Year Projection', type: 'spreadsheet', uploadDate: '2026-01-18', lastModified: '2026-01-28', size: '1.2 MB', accessLevel: 'investor', version: '2.1', tags: ['financial'] },
  // Product
  { id: 'vd-6', folderId: 'vf-3', name: 'Product Spec v3.0', type: 'doc', uploadDate: '2026-01-10', lastModified: '2026-02-14', size: '3.1 MB', accessLevel: 'investor', version: '3.0', tags: ['proposal'] },
  { id: 'vd-7', folderId: 'vf-3', name: 'Architecture Overview', type: 'deck', uploadDate: '2026-02-01', lastModified: '2026-02-10', size: '5.6 MB', accessLevel: 'investor', version: '1.5' },
  // Legal
  { id: 'vd-8', folderId: 'vf-4', name: 'SAFE Agreement Template', type: 'pdf', uploadDate: '2026-01-20', lastModified: '2026-01-20', size: '312 KB', accessLevel: 'founder_only', version: '1.0', tags: ['legal', 'contract'] },
  { id: 'vd-9', folderId: 'vf-4', name: 'Advisor Agreement Template', type: 'doc', uploadDate: '2026-01-20', lastModified: '2026-01-20', size: '156 KB', accessLevel: 'founder_only', version: '1.0', tags: ['legal', 'contract'] },
  // IP
  { id: 'vd-10', folderId: 'vf-5', name: 'Provisional Patent — Unified Institutional OS', type: 'pdf', uploadDate: '2026-02-08', lastModified: '2026-02-10', size: '1.8 MB', accessLevel: 'board', version: '1.0', tags: ['legal'] },
  { id: 'vd-11', folderId: 'vf-5', name: 'Trademark Application — KaNeXT', type: 'pdf', uploadDate: '2026-01-22', lastModified: '2026-01-25', size: '420 KB', accessLevel: 'board', version: '1.0', tags: ['legal'] },
  // Team
  { id: 'vd-12', folderId: 'vf-6', name: 'Org Chart + Hiring Plan', type: 'spreadsheet', uploadDate: '2026-01-28', lastModified: '2026-02-05', size: '680 KB', accessLevel: 'founder_only', version: '1.3' },
];

// =============================================================================
// 9. CAP TABLE
// =============================================================================

export interface CapTableEntry {
  id: string;
  name: string;
  percentage: number;
  shareClass: 'common' | 'preferred' | 'options';
  investmentAmount?: number;
  date?: string;
  boardSeat?: boolean;
}

export const CAP_TABLE: CapTableEntry[] = [
  {
    id: 'ct-1',
    name: 'Sammy (Founder)',
    percentage: 85.0,
    shareClass: 'common',
    date: '2026-01-15',
    boardSeat: true,
  },
  {
    id: 'ct-2',
    name: 'Advisor Pool',
    percentage: 5.0,
    shareClass: 'options',
    date: '2026-01-15',
  },
  {
    id: 'ct-3',
    name: 'Employee Option Pool (Reserved)',
    percentage: 8.0,
    shareClass: 'options',
    date: '2026-01-15',
  },
  {
    id: 'ct-4',
    name: 'Angel Investors (SAFE)',
    percentage: 2.0,
    shareClass: 'preferred',
    investmentAmount: 150_000,
    date: '2026-02-01',
  },
];

// =============================================================================
// 10. PROOF INSTITUTIONS
// =============================================================================

export interface ProofInstitution {
  id: string;
  name: string;
  mode: 'sports' | 'church' | 'education' | 'competition';
  status: 'live' | 'onboarding' | 'signed' | 'prospect';
  activeViews: number;
  keyMetrics: string;
  sinceDate: string;
}

export const PROOF_INSTITUTIONS: ProofInstitution[] = [
  {
    id: 'pi-1',
    name: 'FMU Lions',
    mode: 'sports',
    status: 'live',
    activeViews: 22,
    keyMetrics: 'Full Sports Mode v2 · Roster CRM · Recruiting Board · 5 settled transactions',
    sinceDate: '2026-01-15',
  },
  {
    id: 'pi-2',
    name: 'ICCLA',
    mode: 'church',
    status: 'onboarding',
    activeViews: 8,
    keyMetrics: 'Church Mode beta · Member management · Giving portal · Event calendar',
    sinceDate: '2026-02-05',
  },
  {
    id: 'pi-4',
    name: 'K-1 Grand Prix',
    mode: 'competition',
    status: 'signed',
    activeViews: 3,
    keyMetrics: 'Competition Mode design phase · Event management · Bracket engine · Broadcast tools',
    sinceDate: '2026-02-10',
  },
];

// =============================================================================
// 11. DEALS
// =============================================================================

export type BizDealStage = 'lead' | 'contacted' | 'meeting_set' | 'proposal_sent' | 'negotiating' | 'due_diligence' | 'closed_won' | 'closed_lost';

export const DEAL_STAGE_LABELS: Record<BizDealStage, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  meeting_set: 'Meeting Set',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  due_diligence: 'Due Diligence',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export interface Deal {
  id: string;
  contactName: string;
  company: string;
  dealType: 'investor' | 'partner' | 'client' | 'licensing';
  stage: BizDealStage;
  value?: number;
  valuation?: number;
  lastContact: string;
  lastActivity?: string;
  nextAction: string;
  priority: 'high' | 'medium' | 'low';
  owner?: string;
  assignedTo?: string;
}

export const DEALS: Deal[] = [
  {
    id: 'd-1',
    contactName: 'Michael Mignano',
    company: 'Lightspeed Venture Partners',
    dealType: 'investor',
    stage: 'meeting_set',
    value: 1_500_000,
    valuation: 15_000_000,
    lastContact: '2026-02-16',
    lastActivity: 'Sent updated pitch deck v3.2',
    nextAction: 'Pitch meeting Feb 24 — prepare updated deck',
    priority: 'high',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-2',
    contactName: 'Charles Hudson',
    company: 'Precursor Ventures',
    dealType: 'investor',
    stage: 'meeting_set',
    value: 500_000,
    valuation: 12_000_000,
    lastContact: '2026-02-14',
    lastActivity: 'Sent data room access link',
    nextAction: 'Pitch Feb 27 — send data room access',
    priority: 'high',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-3',
    contactName: 'Arlan Hamilton',
    company: 'Backstage Capital',
    dealType: 'investor',
    stage: 'proposal_sent',
    value: 750_000,
    valuation: 12_000_000,
    lastContact: '2026-02-03',
    lastActivity: 'Moved to Proposal Sent — SAFE terms shared',
    nextAction: 'Follow-up call — review SAFE terms',
    priority: 'high',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-4',
    contactName: 'Ulili Onovakpuri',
    company: 'Kapor Capital',
    dealType: 'investor',
    stage: 'contacted',
    value: 1_000_000,
    valuation: 15_000_000,
    lastContact: '2026-02-12',
    lastActivity: 'Sent impact metrics summary',
    nextAction: 'Send impact metrics doc before March 10 meeting',
    priority: 'medium',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-5',
    contactName: 'Henri Pierre-Jacques',
    company: 'Harlem Capital',
    dealType: 'investor',
    stage: 'lead',
    value: 750_000,
    valuation: 12_000_000,
    lastContact: '2026-02-08',
    lastActivity: 'Intro call — strong alignment on thesis',
    nextAction: 'Intro email sent — confirm March 17 meeting',
    priority: 'medium',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-6',
    contactName: 'Jerome Williams',
    company: 'FMU Athletics',
    dealType: 'client',
    stage: 'closed_won',
    value: 24_000,
    lastContact: '2026-02-10',
    lastActivity: 'Sports Mode v2 approved for expanded rollout',
    nextAction: 'Quarterly check-in — usage review',
    priority: 'medium',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-7',
    contactName: 'Pastor David Richards',
    company: 'ICCLA',
    dealType: 'client',
    stage: 'negotiating',
    value: 18_000,
    lastContact: '2026-02-05',
    lastActivity: 'Church Mode walkthrough — onboarding confirmed',
    nextAction: 'Finalize annual contract terms',
    priority: 'medium',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
  {
    id: 'd-8',
    contactName: 'Marcus Chen',
    company: 'K-1 Global Holdings',
    dealType: 'partner',
    stage: 'due_diligence',
    value: 50_000,
    lastContact: '2026-02-10',
    lastActivity: 'API spec review — bracket engine integration',
    nextAction: 'Technical integration review — API spec delivery',
    priority: 'high',
    owner: 'Sammy',
    assignedTo: 'Sammy (Founder)',
  },
];

// =============================================================================
// 12. DEAL STAGES
// =============================================================================

export const DEAL_STAGES: { key: string; label: string; color: string; count: number }[] = [
  { key: 'lead', label: 'Lead', color: '#6B7280', count: 1 },
  { key: 'contacted', label: 'Contacted', color: '#3B82F6', count: 1 },
  { key: 'meeting_set', label: 'Meeting Set', color: '#8B5CF6', count: 2 },
  { key: 'proposal_sent', label: 'Proposal Sent', color: '#F59E0B', count: 1 },
  { key: 'negotiating', label: 'Negotiating', color: '#F97316', count: 1 },
  { key: 'due_diligence', label: 'Due Diligence', color: '#EC4899', count: 1 },
  { key: 'closed_won', label: 'Closed Won', color: '#10B981', count: 1 },
  { key: 'closed_lost', label: 'Closed Lost', color: '#EF4444', count: 0 },
];

// =============================================================================
// 13. BIZ CONTACTS
// =============================================================================

export interface BizContact {
  id: string;
  name: string;
  company: string;
  role: string;
  relationshipType: 'investor' | 'partner' | 'client' | 'advisor' | 'press' | 'vendor';
  status: 'active' | 'inactive' | 'prospect';
  lastContact: string;
  activeDealId?: string;
}

export const BIZ_CONTACTS: BizContact[] = [
  { id: 'bc-1', name: 'Michael Mignano', company: 'Lightspeed Venture Partners', role: 'Partner', relationshipType: 'investor', status: 'active', lastContact: '2026-02-16', activeDealId: 'd-1' },
  { id: 'bc-2', name: 'Charles Hudson', company: 'Precursor Ventures', role: 'Managing Partner', relationshipType: 'investor', status: 'active', lastContact: '2026-02-14', activeDealId: 'd-2' },
  { id: 'bc-3', name: 'Arlan Hamilton', company: 'Backstage Capital', role: 'Founder & GP', relationshipType: 'investor', status: 'active', lastContact: '2026-02-03', activeDealId: 'd-3' },
  { id: 'bc-4', name: 'Ulili Onovakpuri', company: 'Kapor Capital', role: 'Managing Partner', relationshipType: 'investor', status: 'active', lastContact: '2026-02-12', activeDealId: 'd-4' },
  { id: 'bc-5', name: 'Henri Pierre-Jacques', company: 'Harlem Capital', role: 'Co-Founder & GP', relationshipType: 'investor', status: 'prospect', lastContact: '2026-02-08', activeDealId: 'd-5' },
  { id: 'bc-6', name: 'Jerome Williams', company: 'FMU Athletics', role: 'Athletic Director', relationshipType: 'client', status: 'active', lastContact: '2026-02-10', activeDealId: 'd-6' },
  { id: 'bc-7', name: 'Pastor David Richards', company: 'ICCLA', role: 'Senior Pastor', relationshipType: 'client', status: 'active', lastContact: '2026-02-05', activeDealId: 'd-7' },
  { id: 'bc-8', name: 'Marcus Chen', company: 'K-1 Global Holdings', role: 'VP of Technology', relationshipType: 'partner', status: 'active', lastContact: '2026-02-10', activeDealId: 'd-8' },
  { id: 'bc-9', name: 'Jordan Taylor', company: 'Wilson Sonsini', role: 'Startup Counsel', relationshipType: 'vendor', status: 'active', lastContact: '2026-01-20' },
  { id: 'bc-10', name: 'Kendra Brooks', company: 'TechCrunch', role: 'Senior Reporter', relationshipType: 'press', status: 'prospect', lastContact: '2026-02-15' },
];

// =============================================================================
// 14. RECENT ACTIVITY
// =============================================================================

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'call' | 'email' | 'meeting' | 'document' | 'stage_change' | 'note';
  description: string;
  dealId?: string;
  contactName?: string;
}

export const RECENT_ACTIVITY: ActivityEntry[] = [
  {
    id: 'ra-1',
    timestamp: '2026-02-18T09:15:00',
    type: 'email',
    description: 'Sent updated pitch deck v3.2 to Lightspeed',
    dealId: 'd-1',
    contactName: 'Michael Mignano',
  },
  {
    id: 'ra-2',
    timestamp: '2026-02-17T16:30:00',
    type: 'stage_change',
    description: 'Backstage Capital moved to Proposal Sent',
    dealId: 'd-3',
    contactName: 'Arlan Hamilton',
  },
  {
    id: 'ra-3',
    timestamp: '2026-02-17T14:00:00',
    type: 'call',
    description: '30-min intro call with Harlem Capital — strong alignment on thesis',
    dealId: 'd-5',
    contactName: 'Henri Pierre-Jacques',
  },
  {
    id: 'ra-4',
    timestamp: '2026-02-16T11:00:00',
    type: 'document',
    description: 'Uploaded Financial Model v2.1 to data room',
  },
  {
    id: 'ra-5',
    timestamp: '2026-02-15T15:45:00',
    type: 'email',
    description: 'Sent data room access link to Precursor Ventures',
    dealId: 'd-2',
    contactName: 'Charles Hudson',
  },
  {
    id: 'ra-6',
    timestamp: '2026-02-14T10:00:00',
    type: 'meeting',
    description: 'Product demo with FMU coaching staff — Sports Mode v2 approved',
    dealId: 'd-6',
    contactName: 'Jerome Williams',
  },
  {
    id: 'ra-7',
    timestamp: '2026-02-13T09:30:00',
    type: 'note',
    description: 'K-1 integration spec: need bracket engine API by March 15',
    dealId: 'd-8',
    contactName: 'Marcus Chen',
  },
  {
    id: 'ra-8',
    timestamp: '2026-02-12T16:00:00',
    type: 'email',
    description: 'Sent impact metrics summary to Kapor Capital',
    dealId: 'd-4',
    contactName: 'Ulili Onovakpuri',
  },
  {
    id: 'ra-9',
    timestamp: '2026-02-10T13:00:00',
    type: 'meeting',
    description: 'ICCLA Church Mode walkthrough — onboarding confirmed for March',
    dealId: 'd-7',
    contactName: 'Pastor David Richards',
  },
  {
    id: 'ra-10',
    timestamp: '2026-02-08T11:30:00',
    type: 'document',
    description: 'Filed provisional patent — Unified Institutional OS architecture',
  },
  {
    id: 'ra-11',
    timestamp: '2026-02-05T14:00:00',
    type: 'call',
    description: 'IP counsel review — trademark application for KaNeXT submitted',
    contactName: 'Jordan Taylor',
  },
  {
    id: 'ra-12',
    timestamp: '2026-02-03T13:00:00',
    type: 'meeting',
    description: 'Backstage Capital intro call — Arlan requested data room access',
    dealId: 'd-3',
    contactName: 'Arlan Hamilton',
  },
];

// =============================================================================
// 15. BIZ HERO
// =============================================================================

export interface BizHeroData {
  title: string;
  subtitle: string;
  isLive: boolean;
}

export const BIZ_HERO: BizHeroData = {
  title: 'KaNeXT OS',
  subtitle: 'The operating system for institutions',
  isLive: true,
};

// =============================================================================
// 16. BIZ COMMERCE CARDS
// =============================================================================

export interface BizCommerceCard {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export const BIZ_COMMERCE: BizCommerceCard[] = [
  { id: 'bcc-1', title: 'Invoice', icon: 'doc.text.fill', color: '#10B981' },
  { id: 'bcc-2', title: 'Expense', icon: 'creditcard.fill', color: '#3B82F6' },
  { id: 'bcc-3', title: 'Reports', icon: 'chart.bar.fill', color: '#8B5CF6' },
];

// =============================================================================
// 17. PIPELINE SUMMARY
// =============================================================================

export const PIPELINE_SUMMARY = {
  activeDeals: 7,
  proposalStage: 1,
  negotiating: 1,
  totalPipelineValue: 4_592_000,
  winRate: 0.14,
} as const;
