# Section G — Data Layer

## Business Home Data (`data/mock-business-home.ts`)

```typescript
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

export type BizEventType = 'INVESTOR' | 'PARTNER' | 'INTERNAL' | 'DEMO';

export interface EventAttendee {
  name: string;
  role: 'founder' | 'investor' | 'advisor' | 'board' | 'partner' | 'staff' | 'press' | 'legal';
}

export interface BizEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'investor' | 'board' | 'product' | 'legal' | 'media' | 'conference';
  status: 'upcoming' | 'completed';
  attendees: EventAttendee[];
  eventType: BizEventType;
  outcome?: string;
}

/** Backward-compat: extract attendee names as string[] */
export function getAttendeeNames(attendees: EventAttendee[]): string[] {
  return attendees.map((a) => a.name);
}

export const BIZ_EVENTS: BizEvent[] = [
  { id: 'be-1', title: 'Board Meeting — Q1 Review', date: '2026-02-20', time: '10:00 AM', location: 'Virtual (Zoom)', category: 'board', status: 'upcoming', eventType: 'INTERNAL', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Board Advisor 1', role: 'board' }, { name: 'Board Advisor 2', role: 'board' }] },
  { id: 'be-2', title: 'Lightspeed Venture Partners — Seed Pitch', date: '2026-02-24', time: '2:00 PM', location: 'Menlo Park, CA', category: 'investor', status: 'upcoming', eventType: 'INVESTOR', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Michael Mignano', role: 'investor' }] },
  { id: 'be-3', title: 'Precursor Ventures — Seed Pitch', date: '2026-02-27', time: '11:00 AM', location: 'San Francisco, CA', category: 'investor', status: 'upcoming', eventType: 'INVESTOR', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Charles Hudson', role: 'investor' }] },
  { id: 'be-4', title: 'HBCU Innovation Summit — Panel', date: '2026-03-05', time: '1:00 PM', location: 'Atlanta, GA', category: 'conference', status: 'upcoming', eventType: 'PARTNER', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Panel Moderator', role: 'partner' }, { name: '3 Co-Panelists', role: 'partner' }] },
  { id: 'be-5', title: 'Kapor Capital — Follow-Up Meeting', date: '2026-03-10', time: '10:00 AM', location: 'Oakland, CA', category: 'investor', status: 'upcoming', eventType: 'INVESTOR', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Ulili Onovakpuri', role: 'investor' }] },
  { id: 'be-6', title: 'Harlem Capital — Seed Pitch', date: '2026-03-17', time: '2:00 PM', location: 'New York, NY', category: 'investor', status: 'upcoming', eventType: 'INVESTOR', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Henri Pierre-Jacques', role: 'investor' }] },
  { id: 'be-7', title: 'TechCrunch — Founder Interview', date: '2026-03-24', time: '11:00 AM', location: 'Virtual', category: 'media', status: 'upcoming', eventType: 'PARTNER', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'TC Reporter', role: 'press' }] },
  { id: 'be-8', title: 'Provisional Patent Extension Filing', date: '2026-03-20', time: '12:00 PM', location: 'USPTO (Online)', category: 'legal', status: 'upcoming', eventType: 'INTERNAL', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'IP Counsel', role: 'legal' }] },
  { id: 'be-9', title: 'FMU Athletics — Product Demo', date: '2026-02-10', time: '3:00 PM', location: 'FMU Campus, Miami Gardens', category: 'product', status: 'completed', eventType: 'DEMO', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Coach Davis', role: 'partner' }, { name: 'AD Williams', role: 'partner' }], outcome: 'Positive reception. Sports Mode v2 approved for expanded rollout.' },
  { id: 'be-10', title: 'ICCLA — Church Mode Walkthrough', date: '2026-02-05', time: '10:00 AM', location: 'Virtual', category: 'product', status: 'completed', eventType: 'DEMO', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Pastor Richards', role: 'partner' }, { name: 'Admin Team (3)', role: 'staff' }], outcome: 'Church Mode onboarding confirmed. Launch date set for March 2026.' },
  { id: 'be-11', title: 'Delaware Corp Formation — Final Filing', date: '2026-01-15', time: '9:00 AM', location: 'Online Filing', category: 'legal', status: 'completed', eventType: 'INTERNAL', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Corporate Counsel', role: 'legal' }], outcome: 'C-Corp formation complete. EIN issued.' },
  { id: 'be-12', title: 'Backstage Capital — Intro Call', date: '2026-02-03', time: '1:00 PM', location: 'Virtual', category: 'investor', status: 'completed', eventType: 'INVESTOR', attendees: [{ name: 'Sammy', role: 'founder' }, { name: 'Arlan Hamilton', role: 'investor' }], outcome: 'Strong interest. Requested data room access and follow-up in March.' },
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
  { id: 'pm-1', name: 'Stage 1 Demo Seed', status: 'completed', date: '2026-01-15', description: 'Initial data seeding for FMU Lions — 20 recruits, 3 game plans, 8 DM threads, full finance + payment rails' },
  { id: 'pm-2', name: 'Sports Mode Live', status: 'completed', date: '2026-02-10', description: 'Full Sports Mode v2: 4-pill home, 10-tab org, roster CRM, recruiting board, calendar, entity sheets' },
  { id: 'pm-3', name: '4-Mode Expansion', status: 'in_progress', date: '2026-03-01', description: 'Church, Education, Business, and Competition modes with shared infrastructure and mode-specific RBAC' },
  { id: 'pm-4', name: 'National Player Pool', status: 'in_progress', date: '2026-03-15', description: 'Scraper pipeline for NJCAA (D1/D2/D3), NAIA, CCCAA — 500+ team rosters indexed' },
  { id: 'pm-5', name: 'Church Mode Live', status: 'upcoming', date: '2026-03-30', description: 'ICCLA onboarding complete — member management, giving, groups, event calendar, pastoral tools' },
  { id: 'pm-6', name: 'Education Mode Live', status: 'upcoming', date: '2026-04-15', description: 'FMU integration — academic tracking, department org, student services, compliance' },
  { id: 'pm-7', name: 'Competition Mode Live', status: 'upcoming', date: '2026-05-01', description: 'K-1 Grand Prix integration — event management, fighter profiles, bracket engine, broadcast tools' },
  { id: 'pm-8', name: 'Series A', status: 'upcoming', date: '2026-09-01', description: 'Target $8-12M raise with 4 live modes, proven multi-institution traction, and national player pool' },
];

// =============================================================================
// 4. FUNDRAISE METRICS
// =============================================================================

export interface FundraiseMetrics { currentRound: string; target: number; raised: number; activeConversations: number; proposalsSent: number; burnRate: number; runway: number; period: string; }

export const FUNDRAISE_METRICS: FundraiseMetrics = { currentRound: 'seed', target: 3_000_000, raised: 150_000, activeConversations: 12, proposalsSent: 4, burnRate: 18_000, runway: 8, period: 'Feb 2026' };

// =============================================================================
// 5. TRACTION METRICS
// =============================================================================

export interface TractionMetrics { institutions: number; institutionNames: string[]; activeViews: number; ipDocs: number; enginesBuilt: number; transactionsProcessed: number; period: string; }

export const TRACTION_METRICS: TractionMetrics = { institutions: 3, institutionNames: ['FMU Lions', 'ICCLA', 'K-1 Grand Prix'], activeViews: 5, ipDocs: 6, enginesBuilt: 5, transactionsProcessed: 1_240, period: 'Feb 2026' };

// =============================================================================
// 6. BIZ NEWS
// =============================================================================

export interface BizNewsItem { id: string; type: 'video' | 'article'; headline: string; date: string; category: 'product' | 'founder' | 'press' | 'investor' | 'partnership'; speaker?: string; duration?: string; thumbnailColor?: string; }

export const BIZ_NEWS: BizNewsItem[] = [
  { id: 'bn-1', type: 'video', headline: 'KaNeXT Demo Day — Sports Mode v2 Walkthrough', date: '2026-02-12', category: 'product', speaker: 'Sammy', duration: '8:42', thumbnailColor: '#1a1a2e' },
  { id: 'bn-2', type: 'article', headline: 'Why Institutions Need Their Own OS', date: '2026-02-08', category: 'founder' },
  { id: 'bn-3', type: 'video', headline: 'Founder Story — Building KaNeXT from Miami', date: '2026-01-28', category: 'founder', speaker: 'Sammy', duration: '12:15', thumbnailColor: '#0f3460' },
  { id: 'bn-4', type: 'article', headline: 'HBCU Athletics and the Technology Gap', date: '2026-01-20', category: 'press' },
  { id: 'bn-5', type: 'video', headline: 'KaNeXT Player Pool — National Recruiting Database', date: '2026-02-15', category: 'product', speaker: 'Sammy', duration: '6:30', thumbnailColor: '#16213e' },
  { id: 'bn-6', type: 'article', headline: 'Backstage Capital Explores Institutional SaaS Bet', date: '2026-02-04', category: 'investor' },
  { id: 'bn-7', type: 'article', headline: 'FMU Lions Go Digital — KaNeXT Partnership Announced', date: '2026-02-11', category: 'partnership' },
  { id: 'bn-8', type: 'video', headline: 'Church Mode Preview — Serving Houses of Worship', date: '2026-02-17', category: 'product', speaker: 'Sammy', duration: '5:18', thumbnailColor: '#533483' },
];

// =============================================================================
// 7-8. VAULT (FOLDERS + DOCUMENTS)
// =============================================================================

export interface VaultFolder { id: string; name: string; documentCount: number; lastUpdated: string; accessLevel: 'public' | 'investor' | 'board' | 'founder_only'; }
export const VAULT_FOLDERS: VaultFolder[] = [
  { id: 'vf-1', name: 'Corporate', documentCount: 3, lastUpdated: '2026-01-15', accessLevel: 'board' },
  { id: 'vf-2', name: 'Financial', documentCount: 2, lastUpdated: '2026-02-01', accessLevel: 'investor' },
  { id: 'vf-3', name: 'Product', documentCount: 2, lastUpdated: '2026-02-14', accessLevel: 'investor' },
  { id: 'vf-4', name: 'Legal', documentCount: 2, lastUpdated: '2026-01-20', accessLevel: 'founder_only' },
  { id: 'vf-5', name: 'IP', documentCount: 2, lastUpdated: '2026-02-10', accessLevel: 'board' },
  { id: 'vf-6', name: 'Team', documentCount: 1, lastUpdated: '2026-02-05', accessLevel: 'founder_only' },
];

export type BizDocumentCategory = 'contract' | 'invoice' | 'proposal' | 'financial' | 'legal';
export interface VaultDocument { id: string; folderId: string; name: string; type: 'pdf' | 'doc' | 'spreadsheet' | 'deck'; uploadDate: string; lastModified: string; size: string; accessLevel: 'public' | 'investor' | 'board' | 'founder_only'; version: string; tags?: string[]; }
export const VAULT_DOCUMENTS: VaultDocument[] = [
  { id: 'vd-1', folderId: 'vf-1', name: 'Certificate of Incorporation', type: 'pdf', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '245 KB', accessLevel: 'board', version: '1.0', tags: ['corporate', 'legal'] },
  { id: 'vd-2', folderId: 'vf-1', name: 'Bylaws', type: 'doc', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '182 KB', accessLevel: 'board', version: '1.0', tags: ['corporate', 'legal'] },
  { id: 'vd-3', folderId: 'vf-1', name: 'Board Consent — Initial Actions', type: 'pdf', uploadDate: '2026-01-15', lastModified: '2026-01-15', size: '98 KB', accessLevel: 'board', version: '1.0', tags: ['corporate'] },
  { id: 'vd-4', folderId: 'vf-2', name: 'Seed Pitch Deck', type: 'deck', uploadDate: '2026-01-20', lastModified: '2026-02-01', size: '8.4 MB', accessLevel: 'investor', version: '3.2', tags: ['financial', 'proposal'] },
  { id: 'vd-5', folderId: 'vf-2', name: 'Financial Model — 3-Year Projection', type: 'spreadsheet', uploadDate: '2026-01-18', lastModified: '2026-01-28', size: '1.2 MB', accessLevel: 'investor', version: '2.1', tags: ['financial'] },
  { id: 'vd-6', folderId: 'vf-3', name: 'Product Spec v3.0', type: 'doc', uploadDate: '2026-01-10', lastModified: '2026-02-14', size: '3.1 MB', accessLevel: 'investor', version: '3.0', tags: ['proposal'] },
  { id: 'vd-7', folderId: 'vf-3', name: 'Architecture Overview', type: 'deck', uploadDate: '2026-02-01', lastModified: '2026-02-10', size: '5.6 MB', accessLevel: 'investor', version: '1.5' },
  { id: 'vd-8', folderId: 'vf-4', name: 'SAFE Agreement Template', type: 'pdf', uploadDate: '2026-01-20', lastModified: '2026-01-20', size: '312 KB', accessLevel: 'founder_only', version: '1.0', tags: ['legal', 'contract'] },
  { id: 'vd-9', folderId: 'vf-4', name: 'Advisor Agreement Template', type: 'doc', uploadDate: '2026-01-20', lastModified: '2026-01-20', size: '156 KB', accessLevel: 'founder_only', version: '1.0', tags: ['legal', 'contract'] },
  { id: 'vd-10', folderId: 'vf-5', name: 'Provisional Patent — Unified Institutional OS', type: 'pdf', uploadDate: '2026-02-08', lastModified: '2026-02-10', size: '1.8 MB', accessLevel: 'board', version: '1.0', tags: ['legal'] },
  { id: 'vd-11', folderId: 'vf-5', name: 'Trademark Application — KaNeXT', type: 'pdf', uploadDate: '2026-01-22', lastModified: '2026-01-25', size: '420 KB', accessLevel: 'board', version: '1.0', tags: ['legal'] },
  { id: 'vd-12', folderId: 'vf-6', name: 'Org Chart + Hiring Plan', type: 'spreadsheet', uploadDate: '2026-01-28', lastModified: '2026-02-05', size: '680 KB', accessLevel: 'founder_only', version: '1.3' },
];

// =============================================================================
// 9. CAP TABLE
// =============================================================================

export interface CapTableEntry { id: string; name: string; percentage: number; shareClass: 'common' | 'preferred' | 'options'; investmentAmount?: number; date?: string; boardSeat?: boolean; }
export const CAP_TABLE: CapTableEntry[] = [
  { id: 'ct-1', name: 'Sammy (Founder)', percentage: 85.0, shareClass: 'common', date: '2026-01-15', boardSeat: true },
  { id: 'ct-2', name: 'Advisor Pool', percentage: 5.0, shareClass: 'options', date: '2026-01-15' },
  { id: 'ct-3', name: 'Employee Option Pool (Reserved)', percentage: 8.0, shareClass: 'options', date: '2026-01-15' },
  { id: 'ct-4', name: 'Angel Investors (SAFE)', percentage: 2.0, shareClass: 'preferred', investmentAmount: 150_000, date: '2026-02-01' },
];

// =============================================================================
// 10. PROOF INSTITUTIONS
// =============================================================================

export interface ProofInstitution { id: string; name: string; mode: 'sports' | 'church' | 'education' | 'competition'; status: 'live' | 'onboarding' | 'signed' | 'prospect'; activeViews: number; keyMetrics: string; sinceDate: string; }
export const PROOF_INSTITUTIONS: ProofInstitution[] = [
  { id: 'pi-1', name: 'FMU Lions', mode: 'sports', status: 'live', activeViews: 22, keyMetrics: 'Full Sports Mode v2 · Roster CRM · Recruiting Board · 5 settled transactions', sinceDate: '2026-01-15' },
  { id: 'pi-2', name: 'ICCLA', mode: 'church', status: 'onboarding', activeViews: 8, keyMetrics: 'Church Mode beta · Member management · Giving portal · Event calendar', sinceDate: '2026-02-05' },
  { id: 'pi-4', name: 'K-1 Grand Prix', mode: 'competition', status: 'signed', activeViews: 3, keyMetrics: 'Competition Mode design phase · Event management · Bracket engine · Broadcast tools', sinceDate: '2026-02-10' },
];

// =============================================================================
// 11. DEALS
// =============================================================================

export type BizDealStage = 'lead' | 'contacted' | 'meeting_set' | 'proposal_sent' | 'negotiating' | 'due_diligence' | 'closed_won' | 'closed_lost';
export const DEAL_STAGE_LABELS: Record<BizDealStage, string> = { lead: 'Lead', contacted: 'Contacted', meeting_set: 'Meeting Set', proposal_sent: 'Proposal Sent', negotiating: 'Negotiating', due_diligence: 'Due Diligence', closed_won: 'Closed Won', closed_lost: 'Closed Lost' };

export interface Deal { id: string; contactName: string; company: string; dealType: 'investor' | 'partner' | 'client' | 'licensing'; stage: BizDealStage; value?: number; valuation?: number; lastContact: string; lastActivity?: string; nextAction: string; priority: 'high' | 'medium' | 'low'; owner?: string; assignedTo?: string; }
export const DEALS: Deal[] = [
  { id: 'd-1', contactName: 'Michael Mignano', company: 'Lightspeed Venture Partners', dealType: 'investor', stage: 'meeting_set', value: 1_500_000, valuation: 15_000_000, lastContact: '2026-02-16', lastActivity: 'Sent updated pitch deck v3.2', nextAction: 'Pitch meeting Feb 24 — prepare updated deck', priority: 'high', owner: 'Sammy', assignedTo: 'Sammy (Founder)' },
  { id: 'd-2', contactName: 'Charles Hudson', company: 'Precursor Ventures', dealType: 'investor', stage: 'meeting_set', value: 500_000, valuation: 12_000_000, lastContact: '2026-02-14', lastActivity: 'Sent data room access link', nextAction: 'Pitch Feb 27 — send data room access', priority: 'high', owner: 'Sammy', assignedTo: 'Sammy (Founder)' },
  { id: 'd-3', contactName: 'Arlan Hamilton', company: 'Backstage Capital', dealType: 'investor', stage: 'proposal_sent', value: 750_000, valuation: 12_000_000, lastContact: '2026-02-03', lastActivity: 'Moved to Proposal Sent — SAFE terms shared', nextAction: 'Follow-up call — review SAFE terms', priority: 'high', owner: 'Sammy', assignedTo: 'Sammy (Founder)' },
  { id: 'd-4', contactName: 'Ulili Onovakpuri', company: 'Kapor Capital', dealType: 'investor', stage: 'contacted', value: 1_000_000, valuation: 15_000_000, lastContact: '2026-02-12', lastActivity: 'Sent impact metrics summary', nextAction: 'Send impact metrics doc before March 10 meeting', priority: 'medium', owner: 'Sammy', assignedTo: 'Sammy (Founder)' },
  { id: 'd-5', contactName: 'Henri Pierre-Jacques', company: 'Harlem Capital', dealType: 'investor', stage: 'lead', value: 750_000, valuation: 12_000_000, lastContact: '2026-02-08', lastActivity: 'Intro call — strong alignment on thesis', nextAction: 'Intro email sent — confirm March 17 meeting', priority: 'medium', owner: 'Sammy', assignedTo: 'Sammy (Founder)' },
  { id: 'd-6', contactName: 'Jerome Williams', company: 'FMU Athletics', dealType: 'client', stage: 'closed_won', value: 24_000, lastContact: '2026-02-10', lastActivity: 'Sports Mode v2 approved for expanded rollout', nextAction: 'Quarterly check-in — usage review', priority: 'medium', owner: 'Sammy', assignedTo: 'Sammy (Founder)' },
  { id: 'd-7', contactName: 'Pastor David Richards', company: 'ICCLA', dealType: 'client', stage: 'negotiating', value: 18_000, lastContact: '2026-02-05', lastActivity: 'Church Mode walkthrough — onboarding confirmed', nextAction: 'Finalize annual contract terms', priority: 'medium', owner: 'Sammy', assignedTo: 'Sammy (Founder)' },
  { id: 'd-8', contactName: 'Marcus Chen', company: 'K-1 Global Holdings', dealType: 'partner', stage: 'due_diligence', value: 50_000, lastContact: '2026-02-10', lastActivity: 'API spec review — bracket engine integration', nextAction: 'Technical integration review — API spec delivery', priority: 'high', owner: 'Sammy', assignedTo: 'Sammy (Founder)' },
];

// =============================================================================
// 12-24. DEAL STAGES, CONTACTS, ACTIVITY, HERO, COMMERCE, PIPELINE, ACTION ROW,
//        CURRENT ROUND, INVEST TIERS, SAFE TERMS, DECK DOCS, DOMAIN CARDS, CHAIN
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

export interface BizContact { id: string; name: string; company: string; role: string; relationshipType: 'investor' | 'partner' | 'client' | 'advisor' | 'press' | 'vendor'; status: 'active' | 'inactive' | 'prospect'; lastContact: string; activeDealId?: string; }
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

export interface ActivityEntry { id: string; timestamp: string; type: 'call' | 'email' | 'meeting' | 'document' | 'stage_change' | 'note'; description: string; dealId?: string; contactName?: string; }
export const RECENT_ACTIVITY: ActivityEntry[] = [
  { id: 'ra-1', timestamp: '2026-02-18T09:15:00', type: 'email', description: 'Sent updated pitch deck v3.2 to Lightspeed', dealId: 'd-1', contactName: 'Michael Mignano' },
  { id: 'ra-2', timestamp: '2026-02-17T16:30:00', type: 'stage_change', description: 'Backstage Capital moved to Proposal Sent', dealId: 'd-3', contactName: 'Arlan Hamilton' },
  { id: 'ra-3', timestamp: '2026-02-17T14:00:00', type: 'call', description: '30-min intro call with Harlem Capital — strong alignment on thesis', dealId: 'd-5', contactName: 'Henri Pierre-Jacques' },
  { id: 'ra-4', timestamp: '2026-02-16T11:00:00', type: 'document', description: 'Uploaded Financial Model v2.1 to data room' },
  { id: 'ra-5', timestamp: '2026-02-15T15:45:00', type: 'email', description: 'Sent data room access link to Precursor Ventures', dealId: 'd-2', contactName: 'Charles Hudson' },
  { id: 'ra-6', timestamp: '2026-02-14T10:00:00', type: 'meeting', description: 'Product demo with FMU coaching staff — Sports Mode v2 approved', dealId: 'd-6', contactName: 'Jerome Williams' },
  { id: 'ra-7', timestamp: '2026-02-13T09:30:00', type: 'note', description: 'K-1 integration spec: need bracket engine API by March 15', dealId: 'd-8', contactName: 'Marcus Chen' },
  { id: 'ra-8', timestamp: '2026-02-12T16:00:00', type: 'email', description: 'Sent impact metrics summary to Kapor Capital', dealId: 'd-4', contactName: 'Ulili Onovakpuri' },
  { id: 'ra-9', timestamp: '2026-02-10T13:00:00', type: 'meeting', description: 'ICCLA Church Mode walkthrough — onboarding confirmed for March', dealId: 'd-7', contactName: 'Pastor David Richards' },
  { id: 'ra-10', timestamp: '2026-02-08T11:30:00', type: 'document', description: 'Filed provisional patent — Unified Institutional OS architecture' },
  { id: 'ra-11', timestamp: '2026-02-05T14:00:00', type: 'call', description: 'IP counsel review — trademark application for KaNeXT submitted', contactName: 'Jordan Taylor' },
  { id: 'ra-12', timestamp: '2026-02-03T13:00:00', type: 'meeting', description: 'Backstage Capital intro call — Arlan requested data room access', dealId: 'd-3', contactName: 'Arlan Hamilton' },
];

export interface BizHeroData { title: string; subtitle: string; isLive: boolean; }
export const BIZ_HERO: BizHeroData = { title: 'KaNeXT OS', subtitle: 'The operating system for institutions', isLive: true };

export interface BizCommerceCard { id: string; title: string; icon: string; color: string; }
export const BIZ_COMMERCE: BizCommerceCard[] = [
  { id: 'bcc-1', title: 'Invoice', icon: 'doc.text.fill', color: '#10B981' },
  { id: 'bcc-2', title: 'Expense', icon: 'creditcard.fill', color: '#3B82F6' },
  { id: 'bcc-3', title: 'Reports', icon: 'chart.bar.fill', color: '#8B5CF6' },
];

export const PIPELINE_SUMMARY = { activeDeals: 7, proposalStage: 1, negotiating: 1, totalPipelineValue: 4_592_000, winRate: 0.14 } as const;

export type BizActionCardId = 'deck' | 'data_room' | 'invest';
export interface BizActionCard { id: BizActionCardId; title: string; detail: string; icon: string; color: string; }
export const BIZ_ACTION_ROW: BizActionCard[] = [
  { id: 'deck', title: 'Deck', detail: 'Pitch Deck & Overview', icon: 'doc.richtext.fill', color: '#8B5CF6' },
  { id: 'data_room', title: 'Data Room', detail: 'Due Diligence & Proof', icon: 'folder.fill', color: '#3B82F6' },
  { id: 'invest', title: 'Invest', detail: 'Back KaNeXT', icon: 'dollarsign.circle.fill', color: '#10B981' },
];

export interface CurrentRound { name: string; instrument: string; cap: number; discount: number; raised: number; target: number; }
export const CURRENT_ROUND: CurrentRound = { name: 'Family Round', instrument: 'SAFE', cap: 100_000_000, discount: 20, raised: 150_000, target: 1_000_000 };

export interface InvestTier { id: string; label: string; amount: number; description: string; }
export const INVEST_TIERS: InvestTier[] = [
  { id: 'tier-1', label: '$10K', amount: 10_000, description: 'Angel' },
  { id: 'tier-2', label: '$25K', amount: 25_000, description: 'Pre-Seed' },
  { id: 'tier-3', label: '$50K', amount: 50_000, description: 'Seed Supporter' },
  { id: 'tier-4', label: '$100K', amount: 100_000, description: 'Lead Investor' },
  { id: 'tier-5', label: '$250K+', amount: 250_000, description: 'Strategic Partner' },
];

export interface SafeTerms { instrument: string; cap: string; discount: string; mfn: boolean; proRata: boolean; regDDisclaimer: string; }
export const SAFE_TERMS: SafeTerms = { instrument: 'Post-Money SAFE', cap: '$100M valuation cap', discount: '20% discount to next priced round', mfn: true, proRata: true, regDDisclaimer: 'Securities offered under Regulation D Rule 506(b). Available to accredited investors only. This is not a public offering.' };

export interface DeckDocument { id: string; title: string; type: 'deck' | 'pdf' | 'video' | 'doc'; size: string; isPrimary?: boolean; }
export const DECK_DOCUMENTS: DeckDocument[] = [
  { id: 'dd-1', title: 'Seed Pitch Deck', type: 'deck', size: '8.4 MB', isPrimary: true },
  { id: 'dd-2', title: 'One-Pager', type: 'pdf', size: '1.2 MB' },
  { id: 'dd-3', title: 'Executive Summary', type: 'doc', size: '420 KB' },
  { id: 'dd-4', title: 'Product Demo Video', type: 'video', size: '45 MB' },
];

export type BizDomainCardId = 'cap_table' | 'metrics' | 'updates';
export interface BizDomainCard { id: BizDomainCardId; title: string; icon: string; accent: string; preview: string; }
export const BIZ_DOMAIN_CARDS: BizDomainCard[] = [
  { id: 'cap_table', title: 'Cap Table', icon: 'chart.pie.fill', accent: '#8B5CF6', preview: '85% founder · 5% advisor · 8% ESOP · 2% SAFE' },
  { id: 'metrics', title: 'Metrics', icon: 'chart.line.uptrend.xyaxis', accent: '#3B82F6', preview: '3 institutions · 5 active views · 5 engines built' },
  { id: 'updates', title: 'Updates', icon: 'megaphone.fill', accent: '#F59E0B', preview: 'Latest: Sports Mode v2 approved for expanded rollout' },
];

export function buildInvestChain(amount: number, tierLabel: string) {
  const now = new Date();
  const ts = (offsetMs: number) => { const d = new Date(now.getTime() + offsetMs); return d.toISOString().replace('T', ' ').slice(0, 19); };
  const num = Math.floor(1000 + Math.random() * 9000);
  const transactionId = `SAFE-2026-${num}`;
  return {
    transactionId, type: 'SAFE Investment', amount,
    description: `${tierLabel} — Family Round SAFE`, status: 'Settled' as const,
    chain: [
      { stage: 'Initiation', detail: `Investment initiated — ${tierLabel}`, timestamp: ts(0) },
      { stage: 'Accreditation', detail: 'Accredited investor verification confirmed', timestamp: ts(500) },
      { stage: 'KYC/AML', detail: 'Identity and compliance checks passed', timestamp: ts(1200) },
      { stage: 'Escrow', detail: `$${amount.toLocaleString()} received into escrow`, timestamp: ts(2000) },
      { stage: 'SAFE Execution', detail: 'Post-Money SAFE countersigned', timestamp: ts(3000) },
      { stage: 'Ledger', detail: `Cap table updated — ${transactionId}`, timestamp: ts(3500) },
    ],
  };
}
```

## Business Investor Data (`data/mock-business-investor-v2.ts`)

```typescript
/**
 * Business Investor Mode v2 — Mock Data
 * Companies, Proof Events, Engines, Documents v2, revenue, moat, fundraising.
 */

import type {
  Company,
  ProofEvent,
  Engine,
  DocumentV2,
  RevenueStream,
  CompetitiveAdvantage,
  FundraisingRound,
  ArchitectureLayer,
  RecentUpdate,
  DocumentCategory,
} from '@/types';

// =============================================================================
// COMPANIES
// =============================================================================

export const COMPANIES: Company[] = [
  {
    id: 'co-osk',
    displayName: 'OSK Group',
    legalName: 'OSK Group LLC',
    jurisdiction: 'Florida',
    entityType: 'LLC',
    addressBlock: [
      'Oluwadara Kalejaiye',
      '4300 Biscayne Blvd',
      'Suite 203 #1001',
      'Miami, FL 33137',
      'United States',
    ],
    primaryContact: {
      name: 'Oluwadara Kalejaiye',
      email: 'dara@oskgroup.io',
      role: 'Managing Member',
    },
    initials: 'OSK',
    status: 'Active',
    lastUpdated: new Date('2026-02-10'),
    visibility: 'founder',
  },
  {
    id: 'co-kanext',
    displayName: 'KaNeXT',
    legalName: 'KaNeXT Operations LLC',
    dbaName: 'KaNeXT',
    jurisdiction: 'Florida',
    entityType: 'LLC',
    addressBlock: [
      'Oluwadara Kalejaiye',
      '4300 Biscayne Blvd',
      'Suite 203 #1001',
      'Miami, FL 33137',
      'United States',
    ],
    primaryContact: {
      name: 'Oluwadara Kalejaiye',
      email: 'dara@kanext.io',
      role: 'Founder & CEO',
    },
    initials: 'KX',
    status: 'Active \u2014 Pre-Seed',
    lastUpdated: new Date('2026-02-14'),
    visibility: 'investor',
  },
];

// =============================================================================
// PROOF EVENTS
// =============================================================================

export const PROOF_EVENTS: ProofEvent[] = [
  {
    id: 'pe-fmu',
    companyId: 'co-kanext',
    name: 'FMU Men\'s Basketball \u2014 Live Proof',
    stage: 'active',
    overview:
      'Deploying KaNeXT OS as the primary operational intelligence layer for the Florida Memorial University men\'s basketball program. This proof event validates the Sports domain end-to-end: recruiting, game operations, player evaluation, team analytics, and coaching intelligence \u2014 all in a live D2 program.',
    kpis: [
      { id: 'kpi-1', label: 'Roster Players', value: '15', target: '15', trend: 'flat' },
      { id: 'kpi-2', label: 'Games Tracked', value: '24', target: '30', trend: 'up' },
      { id: 'kpi-3', label: 'Recruiting Prospects', value: '47', trend: 'up' },
      { id: 'kpi-4', label: 'Eval Reports', value: '62', trend: 'up' },
      { id: 'kpi-5', label: 'Sim Accuracy', value: '78%', target: '80%', trend: 'up' },
      { id: 'kpi-6', label: 'Uptime', value: '99.2%', target: '99.5%', trend: 'flat' },
    ],
    milestones: [
      { id: 'ms-1', title: 'Roster digitized & KR baseline set', status: 'completed', completedDate: '2025-10-15' },
      { id: 'ms-2', title: 'Game ops running live for regular season', status: 'completed', completedDate: '2025-11-20' },
      { id: 'ms-3', title: 'Recruiting board active with 40+ prospects', status: 'completed', completedDate: '2026-01-10' },
      { id: 'ms-4', title: 'Simulation engine validated against 20+ games', status: 'in_progress', targetDate: '2026-03-01' },
      { id: 'ms-5', title: 'Post-season debrief & proof report', status: 'pending', targetDate: '2026-04-01' },
    ],
    risks: [
      { id: 'risk-1', title: 'Season-ending injuries reduce data quality', severity: 'medium', mitigation: 'Aggregate at team level; per-player eval adapts to minutes played' },
      { id: 'risk-2', title: 'Coach adoption friction', severity: 'low', mitigation: 'Founder is head coach \u2014 full alignment' },
      { id: 'risk-3', title: 'D2 scheduling volatility', severity: 'low', mitigation: 'Flexible game tracker handles postponements/cancellations' },
    ],
    opsActions: [
      'Ship pregame intel bottom sheet with cluster ratings + opponent systems',
      'Complete Ask Nexus integration for in-game coaching queries',
      'Finalize post-season proof report template for investor deck',
    ],
    constraints: [
      'Single-sport proof (basketball only for now)',
      'D2 data ecosystem is thinner than D1 \u2014 less public stat coverage',
      'No NIL budget data available for proof validation',
    ],
    lastUpdated: new Date('2026-02-14'),
    visibility: 'investor',
  },
];

// =============================================================================
// ENGINES
// =============================================================================

export const ENGINES: Engine[] = [
  { id: 'engine-00', name: 'Engine 00 \u2014 Coach Master Input', purpose: 'Captures and structures the head coach\'s philosophy, system preferences, and strategic priorities into a machine-readable context that all downstream engines consume.', inputs: ['Offensive/defensive style selections', 'Tempo preference', 'Cluster weight priorities', 'Position importance rankings', 'Recruiting biases'], outputs: ['ProgramContext object', 'System identity vector', 'Weighted cluster profile'], whyItMatters: ['Every decision KaNeXT makes is filtered through the coach\'s philosophy', 'Eliminates generic recommendations \u2014 everything is contextual'] },
  { id: 'engine-01', name: 'Engine 01 \u2014 Player Evaluation', purpose: 'Evaluates individual players across 7 canonical clusters and their subclusters, producing a KaNeXT Rating (KR) for each player.', inputs: ['Game stats', 'Practice observations', 'Physical measurables', 'Coach assessments'], outputs: ['Player KR (0-100)', 'Cluster ratings', 'Subcluster breakdowns', 'Trend trajectories'], whyItMatters: ['Standardized player comparison across programs', 'Data-backed roster construction decisions'] },
  { id: 'engine-02', name: 'Engine 02 \u2014 Team Evaluation', purpose: 'Rolls up player-level truth into team-level intelligence: Team KR, offensive/defensive ratings, and roster composition analysis.', inputs: ['All player KRs', 'Minutes distribution', 'Usage rates', 'Lineup combinations'], outputs: ['Team KR', 'Team Offensive KR (53%)', 'Team Defensive KR (47%)', '7 team cluster ratings'], whyItMatters: ['Reveals true team identity vs. coach perception', 'Identifies roster gaps and depth weaknesses'] },
  { id: 'engine-03', name: 'Engine 03 \u2014 Global Evaluation', purpose: 'Evaluates opponents and the broader competitive landscape using the same canonical cluster framework.', inputs: ['Opponent game data', 'Conference statistics', 'National rankings', 'Historical matchup data'], outputs: ['Opponent KR profiles', 'Matchup differential analysis', 'Conference power rankings'], whyItMatters: ['Apples-to-apples comparison with any opponent', 'Pregame intel grounded in the same truth system'] },
  { id: 'engine-04', name: 'Engine 04 \u2014 Scouting', purpose: 'Powers the recruiting pipeline by evaluating prospects against the program\'s specific needs, philosophy, and cluster priorities.', inputs: ['Prospect profiles', 'Highlight film metadata', 'Academic eligibility', 'ProgramContext priorities'], outputs: ['Prospect fit scores', 'Cluster-gap recommendations', 'Recruiting board rankings'], whyItMatters: ['Recruits are evaluated against YOUR system, not generic rankings', 'Finds undervalued prospects that fit your philosophy'] },
  { id: 'engine-05', name: 'Engine 05 \u2014 Simulation', purpose: 'Runs probabilistic game simulations using team/opponent KR profiles, matchup differentials, and coaching context.', inputs: ['Home/away team profiles', 'Roster availability', 'Historical performance', 'ProgramContext'], outputs: ['Win probability', 'Projected score', 'Player impact projections', 'Key matchup analysis'], whyItMatters: ['Pregame preparation grounded in data, not gut feel', 'What-if scenarios for lineup decisions'] },
  { id: 'engine-06', name: 'Engine 06 \u2014 Development', purpose: 'Tracks player growth trajectories over time and recommends development priorities based on program needs.', inputs: ['Historical player KRs', 'Practice data', 'Game trend analysis', 'Program needs from Engine 02'], outputs: ['Growth trajectories', 'Development priority recommendations', 'Projected future KRs'], whyItMatters: ['Turns player development from intuition into a measurable process', 'Connects individual growth to team-level impact'] },
];

// =============================================================================
// DOCUMENTS V2
// =============================================================================

export const DOCUMENTS_V2: DocumentV2[] = [
  { id: 'doc-v2-1', title: 'Series Seed Pitch Deck', description: 'Q1 2026 investor presentation', category: 'investor_materials', visibility: 'investor', fileType: 'pdf', createdAt: new Date('2026-01-15'), updatedAt: new Date('2026-01-28'), tags: ['pitch', 'fundraising', 'Q1-2026'], summary: 'Comprehensive pitch deck covering market opportunity, product demo, traction, team, and ask for the pre-seed round.', attachments: [] },
  { id: 'doc-v2-2', title: 'Financial Model', description: '5-year projections and unit economics', category: 'financial', visibility: 'founder', fileType: 'xls', createdAt: new Date('2025-11-01'), updatedAt: new Date('2026-01-20'), tags: ['financial', 'projections', 'unit-economics'], summary: 'Bottom-up financial model with cohort-based revenue projections, CAC/LTV analysis, and burn rate scenarios.', attachments: [] },
  { id: 'doc-v2-3', title: 'Cap Table', description: 'Current ownership and option pool', category: 'financial', visibility: 'founder', fileType: 'xls', createdAt: new Date('2025-06-01'), updatedAt: new Date('2026-01-05'), tags: ['cap-table', 'equity', 'ownership'], summary: 'Full capitalization table showing founder equity, advisor grants, and reserved option pool.', attachments: [] },
  { id: 'doc-v2-4', title: 'Product Demo Video', description: 'KaNeXT OS walkthrough for investors', category: 'investor_materials', visibility: 'investor', fileType: 'link', url: 'https://kanext.io/demo', createdAt: new Date('2026-01-10'), updatedAt: new Date('2026-01-10'), tags: ['demo', 'video', 'product'], summary: 'Guided walkthrough of KaNeXT OS Sports domain showing live game operations, recruiting board, and Nexus intelligence.', attachments: [] },
  { id: 'doc-v2-5', title: 'Certificate of Formation', description: 'Florida LLC formation documents', category: 'governance', visibility: 'founder', fileType: 'pdf', createdAt: new Date('2024-03-15'), updatedAt: new Date('2024-03-15'), tags: ['formation', 'legal', 'florida'], summary: 'Official certificate of formation for KaNeXT Operations LLC filed with the Florida Division of Corporations.', attachments: [] },
  { id: 'doc-v2-6', title: 'Operating Agreement', description: 'LLC operating agreement and amendments', category: 'governance', visibility: 'founder', fileType: 'pdf', createdAt: new Date('2024-03-15'), updatedAt: new Date('2025-08-01'), tags: ['operating-agreement', 'legal', 'governance'], summary: 'Multi-member LLC operating agreement defining management structure, profit distribution, and decision-making authority.', attachments: [] },
  { id: 'doc-v2-7', title: 'Board Meeting Minutes', description: 'Q4 2025 advisory board meeting', category: 'governance', visibility: 'founder', fileType: 'pdf', createdAt: new Date('2025-12-15'), updatedAt: new Date('2025-12-15'), tags: ['board', 'minutes', 'Q4-2025'], summary: 'Summary of Q4 advisory board discussion covering product roadmap, fundraising timeline, and go-to-market strategy.', attachments: [] },
  { id: 'doc-v2-8', title: 'Investor Rights Agreement', description: 'Pre-seed investor rights', category: 'legal', visibility: 'investor', fileType: 'pdf', createdAt: new Date('2025-06-01'), updatedAt: new Date('2025-06-01'), tags: ['investor-rights', 'legal', 'pre-seed'], summary: 'Standard investor rights agreement covering information rights, pro-rata participation, and board observer seat.', attachments: [] },
  { id: 'doc-v2-9', title: 'Company Overview', description: 'KaNeXT at a glance', category: 'institutional_brief', visibility: 'public', fileType: 'pdf', createdAt: new Date('2025-09-01'), updatedAt: new Date('2026-01-01'), tags: ['overview', 'one-pager'], summary: 'One-page overview of KaNeXT \u2014 mission, product, market, and traction summary for general audiences.', attachments: [] },
  { id: 'doc-v2-10', title: 'Market Analysis', description: 'TAM/SAM/SOM breakdown by vertical', category: 'institutional_brief', visibility: 'investor', fileType: 'pdf', createdAt: new Date('2025-10-15'), updatedAt: new Date('2025-12-01'), tags: ['market', 'tam', 'sam', 'som'], summary: 'Detailed market sizing across all four verticals with bottom-up TAM/SAM/SOM analysis and competitive landscape.', attachments: [] },
  { id: 'doc-v2-11', title: '2026 Product Roadmap', description: 'Feature timeline and milestones', category: 'product', visibility: 'investor', fileType: 'pdf', createdAt: new Date('2025-12-01'), updatedAt: new Date('2026-01-15'), tags: ['roadmap', '2026', 'product'], summary: 'Quarter-by-quarter feature roadmap showing Sports domain completion, Enterprise v2 launch, and multi-domain expansion.', attachments: [] },
  { id: 'doc-v2-12', title: 'Technical Architecture', description: 'System design and infrastructure', category: 'product', visibility: 'founder', fileType: 'pdf', createdAt: new Date('2025-08-01'), updatedAt: new Date('2025-11-15'), tags: ['architecture', 'technical', 'infrastructure'], summary: 'Three-layer architecture overview (Reality \u2192 Intelligence \u2192 Nexus) with technology stack decisions and scaling strategy.', attachments: [] },
  { id: 'doc-v2-13', title: 'FMU Proof Event Report', description: 'Live proof event progress and findings', category: 'proof', visibility: 'investor', fileType: 'pdf', createdAt: new Date('2026-01-20'), updatedAt: new Date('2026-02-10'), tags: ['proof', 'fmu', 'sports', 'traction'], proofEventId: 'pe-fmu', summary: 'Detailed report on the FMU men\'s basketball proof event \u2014 KPIs, milestones achieved, product validation findings, and next steps.', attachments: ['fmu-kpi-dashboard.png', 'game-ops-screenshots.pdf'] },
  { id: 'doc-v2-14', title: 'IP Assignment Agreement', description: 'Intellectual property assignment to KaNeXT', category: 'ip', visibility: 'founder', fileType: 'pdf', createdAt: new Date('2024-06-01'), updatedAt: new Date('2024-06-01'), tags: ['ip', 'legal', 'assignment'], summary: 'Assignment of all founder-created intellectual property (code, algorithms, designs) to KaNeXT Operations LLC.', attachments: [] },
  { id: 'doc-v2-15', title: 'Canonical Engine Library \u2014 Spec', description: 'Engine 00-06 specification document', category: 'engines', visibility: 'founder', fileType: 'pdf', createdAt: new Date('2025-09-15'), updatedAt: new Date('2026-02-01'), tags: ['engines', 'spec', 'canonical', 'architecture'], summary: 'Complete specification for all 7 canonical engines (00-06) \u2014 inputs, outputs, scoring methodology, and integration points.', attachments: ['engine-flow-diagram.pdf'] },
  { id: 'doc-v2-16', title: 'SAFE Note \u2014 Pre-Seed', description: 'Simple Agreement for Future Equity', category: 'legal', visibility: 'founder', fileType: 'pdf', createdAt: new Date('2025-12-01'), updatedAt: new Date('2026-01-15'), tags: ['safe', 'fundraising', 'legal', 'pre-seed'], summary: 'YC-standard SAFE note with valuation cap for the pre-seed round. Post-money SAFE structure.', attachments: [] },
  { id: 'doc-v2-17', title: 'GII \u2014 Global Intelligence Index', description: 'Proprietary competitive intelligence framework', category: 'ip', visibility: 'investor', fileType: 'pdf', createdAt: new Date('2025-10-01'), updatedAt: new Date('2026-01-20'), tags: ['gii', 'ip', 'moat', 'intelligence'], summary: 'Overview of the Global Intelligence Index \u2014 KaNeXT\'s proprietary framework for cross-domain organizational intelligence scoring.', attachments: [] },
  { id: 'doc-v2-18', title: 'Revenue Model & Pricing', description: 'SaaS pricing tiers and revenue strategy', category: 'financial', visibility: 'investor', fileType: 'pdf', createdAt: new Date('2025-11-15'), updatedAt: new Date('2026-02-01'), tags: ['revenue', 'pricing', 'saas', 'strategy'], summary: 'Tiered SaaS pricing model for Sports domain, API licensing structure, and long-term data licensing revenue projections.', attachments: [] },
];

// =============================================================================
// REVENUE STREAMS, COMPETITIVE ADVANTAGES, FUNDRAISING, ARCHITECTURE, UPDATES, HELPERS
// =============================================================================

export const REVENUE_STREAMS: RevenueStream[] = [
  { id: 'rev-1', name: 'Platform SaaS', description: 'Subscription-based access to KaNeXT OS for sports programs. Tiered by program size, division level, and feature set.', pricing: '$500\u2013$5,000/mo per program', status: 'beta' },
  { id: 'rev-2', name: 'Intelligence API', description: 'Programmatic access to KaNeXT evaluation engines, simulation outputs, and rating data for third-party integrations.', pricing: 'Usage-based metered billing', status: 'planned' },
  { id: 'rev-3', name: 'Data Licensing', description: 'Aggregated, anonymized organizational intelligence data licensed to conferences, media companies, and analytics firms.', pricing: 'Enterprise contract', status: 'planned' },
  { id: 'rev-4', name: 'Premium Consulting', description: 'White-glove implementation and strategic advisory for enterprise clients deploying KaNeXT across multiple programs.', pricing: 'Project-based', status: 'planned' },
];

export const COMPETITIVE_ADVANTAGES: CompetitiveAdvantage[] = [
  { id: 'moat-1', title: 'Global Intelligence Index (GII)', description: 'Proprietary cross-domain intelligence framework that enables apples-to-apples comparison across organizations, sports, and verticals. No competitor has a unified evaluation ontology.' },
  { id: 'moat-2', title: 'Canonical Engine Library', description: '7 purpose-built evaluation engines (00-06) that form a closed-loop intelligence system. Each engine\'s output feeds the next, creating compounding data value over time.' },
  { id: 'moat-3', title: 'Coach-First Architecture', description: 'Every recommendation is filtered through the coach\'s actual philosophy (Engine 00). This eliminates generic analytics and creates sticky, personalized intelligence.' },
  { id: 'moat-4', title: 'Multi-Domain Platform', description: 'Single platform spanning Sports, Enterprise, Church, and Education verticals. Shared infrastructure reduces marginal cost of entering new verticals to near-zero.' },
];

export const FUNDRAISING: FundraisingRound[] = [
  { id: 'round-preseed', name: 'Pre-Seed', status: 'active', targetAmount: 500000, raisedAmount: 0, closingDate: '2026-Q2', summary: 'Raising $500K via post-money SAFE to fund completion of Sports domain proof event, hire first engineer, and launch 3 paid pilots.' },
];

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  { id: 'layer-reality', name: 'Reality Layer', description: 'Structured ground-truth data \u2014 rosters, schedules, stats, game results, organizational records. The single source of what IS.', icon: 'square.stack.3d.up.fill' },
  { id: 'layer-intelligence', name: 'Intelligence Layer', description: 'Canonical engines (00-06) that evaluate, compare, simulate, and project based on reality data filtered through coaching context.', icon: 'brain' },
  { id: 'layer-nexus', name: 'Nexus Layer', description: 'Conversational AI interface that translates intelligence outputs into actionable coaching decisions via natural language.', icon: 'sparkles' },
];

export const RECENT_UPDATES: RecentUpdate[] = [
  { id: 'update-1', title: 'Proof Event KPIs Updated', description: 'FMU proof event metrics refreshed \u2014 24 games tracked, 78% sim accuracy.', timestamp: new Date('2026-02-14'), type: 'metric' },
  { id: 'update-2', title: 'Recruiting Board Milestone', description: '47 prospects in pipeline \u2014 exceeded 40-prospect milestone.', timestamp: new Date('2026-02-10'), type: 'milestone' },
  { id: 'update-3', title: 'Pitch Deck Revised', description: 'Updated Q1 2026 investor deck with latest traction data.', timestamp: new Date('2026-01-28'), type: 'document' },
  { id: 'update-4', title: 'Engine Spec Finalized', description: 'Canonical Engine Library (00-06) specification locked for v1.', timestamp: new Date('2026-02-01'), type: 'system' },
  { id: 'update-5', title: 'Enterprise Mode v2 Shipped', description: 'Investor Room, Proof Events, and Data Room live in Enterprise mode.', timestamp: new Date('2026-02-15'), type: 'milestone' },
];

export function getCompanyById(id: string): Company | undefined { return COMPANIES.find((c) => c.id === id); }
export function getProofEventsByCompany(companyId: string): ProofEvent[] { return PROOF_EVENTS.filter((pe) => pe.companyId === companyId); }
export function getDocsByCompany(companyId: string): DocumentV2[] { if (companyId === 'co-kanext') return DOCUMENTS_V2; return DOCUMENTS_V2.filter((d) => d.visibility === 'founder'); }
export function getDocsByCategory(category: DocumentCategory): DocumentV2[] { return DOCUMENTS_V2.filter((d) => d.category === category); }
export function getCategoryLabelV2(category: DocumentCategory): string {
  const labels: Record<string, string> = { investor_materials: 'Investor', governance: 'Governance', institutional_brief: 'Institutional', roadmap: 'Roadmap', proof: 'Proof', ip: 'IP', financial: 'Financial', legal: 'Legal', product: 'Product', engines: 'Engines' };
  return labels[category] || category;
}
export function getStageColor(stage: string): string { switch (stage) { case 'planning': return '#6E7687'; case 'active': return '#22C55E'; case 'completed': return '#FFFFFF'; case 'paused': return '#F59E0B'; default: return '#6E7687'; } }
export function getMilestoneStatusColor(status: string): string { switch (status) { case 'completed': return '#22C55E'; case 'in_progress': return '#FFFFFF'; case 'blocked': return '#EF4444'; case 'pending': return '#6E7687'; default: return '#6E7687'; } }
export function getRiskSeverityColor(severity: string): string { switch (severity) { case 'critical': return '#EF4444'; case 'high': return '#F59E0B'; case 'medium': return '#EAB308'; case 'low': return '#22C55E'; default: return '#6E7687'; } }
```

## Shared Entity Types (`data/biz-org-shared-types.ts`)

```typescript
/**
 * Business Organization — Shared Types
 * Used across all 10 Biz Org tabs: state machines, receipts, traffic lights,
 * entity types, cross-tab links, and seeded demo entity IDs.
 */

import type { BizOrgTab } from '@/utils/business-rbac';

// =============================================================================
// TRANSACTION STATE MACHINE
// =============================================================================

export type BizTxnState =
  | 'draft' | 'proposed' | 'rule_checked' | 'authorized' | 'scheduled'
  | 'released' | 'in_flight' | 'settled' | 'hold' | 'failed'
  | 'disputed' | 'returned' | 'reversed';

export const BIZ_TXN_STATE_LABELS: Record<BizTxnState, string> = {
  draft: 'Draft', proposed: 'Proposed', rule_checked: 'Rule Checked', authorized: 'Authorized',
  scheduled: 'Scheduled', released: 'Released', in_flight: 'In Flight', settled: 'Settled',
  hold: 'Hold', failed: 'Failed', disputed: 'Disputed', returned: 'Returned', reversed: 'Reversed',
};

export const BIZ_TXN_STATE_COLORS: Record<BizTxnState, string> = {
  draft: '#9CA3AF', proposed: '#F59E0B', rule_checked: '#3B82F6', authorized: '#8B5CF6',
  scheduled: '#6366F1', released: '#14B8A6', in_flight: '#0EA5E9', settled: '#22C55E',
  hold: '#F59E0B', failed: '#EF4444', disputed: '#EF4444', returned: '#F97316', reversed: '#9CA3AF',
};

// =============================================================================
// IMMUTABLE RECEIPT
// =============================================================================

export interface BizReceipt {
  id: string;
  type: 'approval' | 'release' | 'decision' | 'signature' | 'transfer' | 'creation' | 'amendment' | 'compliance';
  action: string;
  actor: string;
  timestamp: string;
  linkedEntity: string;
  linkedTab: BizOrgTab;
  linkedId?: string;
  immutable: true;
}

// =============================================================================
// TRAFFIC LIGHT
// =============================================================================

export type TrafficLight = 'green' | 'yellow' | 'red';

export const TRAFFIC_LIGHT_COLORS: Record<TrafficLight, string> = {
  green: '#22C55E', yellow: '#F59E0B', red: '#EF4444',
};

export function trafficLightLabel(value: TrafficLight): string {
  switch (value) { case 'green': return 'Green'; case 'yellow': return 'Yellow'; case 'red': return 'Red'; }
}

// =============================================================================
// ENTITY STATUS
// =============================================================================

export type EntityStatus = 'active' | 'under_evaluation' | 'negotiating' | 'closed' | 'dormant' | 'flagged';

export const ENTITY_STATUS_LABELS: Record<EntityStatus, string> = {
  active: 'Active', under_evaluation: 'Under Evaluation', negotiating: 'Negotiating',
  closed: 'Closed', dormant: 'Dormant', flagged: 'Flagged',
};

export const ENTITY_STATUS_COLORS: Record<EntityStatus, string> = {
  active: '#22C55E', under_evaluation: '#F59E0B', negotiating: '#3B82F6',
  closed: '#9CA3AF', dormant: '#6B7280', flagged: '#EF4444',
};

// =============================================================================
// SNAPSHOT METRICS
// =============================================================================

export interface SnapshotMetrics {
  moneyIn30d: number; moneyOut30d: number; exceptions: number;
  docsComplete: number; docsMissing: number;
  peopleFilled: number; peopleGaps: number; activeDeals: number;
}

// =============================================================================
// ENTITY TYPES
// =============================================================================

export type BizEntityType = 'internal' | 'holdco' | 'partner' | 'relationship' | 'asset' | 'deal_acquisition' | 'project';

export const BIZ_ENTITY_TYPE_LABELS: Record<BizEntityType, string> = {
  internal: 'Internal', holdco: 'HoldCo', partner: 'Partner', relationship: 'Relationship',
  asset: 'Asset', deal_acquisition: 'Deal / Acquisition', project: 'Project',
};

export const BIZ_ENTITY_TYPE_COLORS: Record<BizEntityType, string> = {
  internal: '#3B82F6', holdco: '#8B5CF6', partner: '#14B8A6', relationship: '#F59E0B',
  asset: '#EC4899', deal_acquisition: '#EF4444', project: '#6366F1',
};

// =============================================================================
// ENTITY HEALTH
// =============================================================================

export interface EntityHealth {
  governance: TrafficLight; finance: TrafficLight; rails: TrafficLight; compliance: TrafficLight;
}

export function worstHealth(health: EntityHealth): TrafficLight {
  const values = [health.governance, health.finance, health.rails, health.compliance];
  if (values.includes('red')) return 'red';
  if (values.includes('yellow')) return 'yellow';
  return 'green';
}

// =============================================================================
// CROSS-TAB LINK
// =============================================================================

export interface CrossTabLink {
  targetTab: BizOrgTab; targetSubTab?: string; targetId: string; label: string;
}

// =============================================================================
// SEEDED DEMO ENTITY IDS
// =============================================================================

export const KANEXT_HOLDCO = 'ent-kanext-holdco';
export const KANEXT_OPSCO = 'ent-kanext-opsco';
export const KANEXT_IP = 'ent-kanext-ip';
export const SPONSOR_BANK = 'ent-sponsor-bank';
export const PAYMENT_PROCESSOR = 'ent-payment-processor';
export const VALUETAINMENT = 'ent-valuetainment';
export const SLIEMA_WANDERERS = 'ent-sliema-wanderers';
export const TARGET_BANK = 'ent-target-bank';

export const SEEDED_ENTITY_NAMES: Record<string, string> = {
  [KANEXT_HOLDCO]: 'KaNeXT HoldCo', [KANEXT_OPSCO]: 'KaNeXT OpsCo', [KANEXT_IP]: 'KaNeXT IP / Products',
  [SPONSOR_BANK]: 'Sponsor Bank', [PAYMENT_PROCESSOR]: 'Payment Processor',
  [VALUETAINMENT]: 'Valuetainment', [SLIEMA_WANDERERS]: 'Sliema Wanderers FC', [TARGET_BANK]: 'Target Bank (Acquisition)',
};

export const SEEDED_ENTITY_TYPES: Record<string, BizEntityType> = {
  [KANEXT_HOLDCO]: 'holdco', [KANEXT_OPSCO]: 'internal', [KANEXT_IP]: 'asset',
  [SPONSOR_BANK]: 'partner', [PAYMENT_PROCESSOR]: 'partner',
  [VALUETAINMENT]: 'relationship', [SLIEMA_WANDERERS]: 'relationship', [TARGET_BANK]: 'deal_acquisition',
};

// =============================================================================
// HELPERS
// =============================================================================

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function formatDate(date: string): string { return date; }

export function triageSortHealth(a: EntityHealth, b: EntityHealth): number {
  const score = (h: EntityHealth) => {
    let s = 0;
    const vals = [h.governance, h.finance, h.rails, h.compliance];
    for (const v of vals) { if (v === 'red') s += 3; else if (v === 'yellow') s += 1; }
    return s;
  };
  return score(b) - score(a);
}
```

## National Pool Adapter (`data/national-pool.ts`)

```typescript
/**
 * National Player Pool Data Adapter
 *
 * Loads the exported JSON from PostgreSQL and provides query functions
 * for the React Native UI. Drop-in replacement for mock data.
 *
 * Usage:
 *   import { nationalPool } from '@/data/national-pool';
 *   const results = nationalPool.search({ query: 'Bradley', level: 'naia' });
 *   const player = nationalPool.getById('some-uuid');
 */

import rawData from './national-pool.json';
import {
  getKRColor,
  getKRTierLabel,
  getArchetypeDisplay,
  CLUSTER_ORDER,
} from '@/utils/kr-display';
import { computePlayerBadges, type PlayerBadge } from '@/utils/player-badges';
import type { ClusterType } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface NationalPlayer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  height: string;
  heightInches: number | null;
  weight: number | null;
  classYear: string;
  jerseyNumber: string;
  school: string;
  conference: string;
  levelKey: string;
  levelDisplay: string;
  state: string;
  country: string;
  city: string;
  highSchool: string;
  portalEntryDate: string | null;
  // KR
  kr: number | null;
  offKR: number | null;
  defKR: number | null;
  archetype: string;
  secondaryArchetypes: string[];
  confidence: number | null;
  // Clusters
  clusters: Record<string, number>;
  // Stats
  gp: number | null;
  gs: number | null;
  mpg: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  topg: number | null;
  fgPct: number | null;
  threePct: number | null;
  ftPct: number | null;
  orebPg: number | null;
  drebPg: number | null;
  fgaPg: number | null;
  threePaPg: number | null;
  ftaPg: number | null;
  pfPg: number | null;
  usageRate: number | null;
  bprAvg: number | null;
  bprTrend: number | null;
  // Scholarship/NIL
  scholarship?: {
    tier: string;
    scholarshipPct: number | null;
    scholarshipEquivalent: number | null;
    nilAmount: number | null;
    offFitPct: number | null;
    defFitPct: number | null;
    overallFitPct: number | null;
    needScarcity: string | null;
    scholarshipJustification: string | null;
    nilJustification: string | null;
    warnings: string[];
  };
}

export interface TeamSystem {
  offSystem: string | null;
  offSystemScore: number | null;
  defSystem: string | null;
  defSystemScore: number | null;
  pace100: number | null;
  paceBand: string | null;
}

export interface SearchFilters {
  query?: string;
  level?: string | string[];
  position?: string | string[];
  conference?: string;
  minKR?: number;
  maxKR?: number;
  minHeight?: number;
  maxHeight?: number;
  archetype?: string;
  hasPortalEntry?: boolean;
  hasBadge?: string;
  badgeLevel?: string;
  sortBy?: 'kr' | 'ppg' | 'rpg' | 'apg' | 'name' | 'height';
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// =============================================================================
// DATA LOADING
// =============================================================================

const data = rawData as {
  players: NationalPlayer[];
  teamSystems: Record<string, TeamSystem>;
  counts: {
    players: number;
    withKR: number;
    withStats: number;
    withScholarship: number;
    teamSystems: number;
  };
};

const playerIndex = new Map<string, NationalPlayer>();
for (const p of data.players) { playerIndex.set(p.id, p); }

const schoolIndex = new Map<string, NationalPlayer[]>();
for (const p of data.players) {
  if (p.school) {
    const key = p.school.toLowerCase();
    if (!schoolIndex.has(key)) schoolIndex.set(key, []);
    schoolIndex.get(key)!.push(p);
  }
}

const _conferences = new Set<string>();
const _levels = new Set<string>();
for (const p of data.players) {
  if (p.conference) _conferences.add(p.conference);
  if (p.levelKey) _levels.add(p.levelKey);
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

export const nationalPool = {
  get counts() { return data.counts; },

  getAll(): NationalPlayer[] { return data.players; },
  getById(id: string): NationalPlayer | undefined { return playerIndex.get(id); },
  getTeamRoster(school: string): NationalPlayer[] { return schoolIndex.get(school.toLowerCase()) ?? []; },
  getTeamSystem(teamName: string): TeamSystem | undefined { return data.teamSystems[teamName]; },
  getConferences(): string[] { return Array.from(_conferences).sort(); },
  getLevels(): string[] { return Array.from(_levels).sort(); },

  search(filters: SearchFilters = {}): NationalPlayer[] {
    let results = data.players;

    if (filters.query && filters.query.length > 0) {
      const q = filters.query.toLowerCase();
      results = results.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q) ||
        p.conference.toLowerCase().includes(q)
      );
    }

    if (filters.level) {
      const levels = Array.isArray(filters.level) ? filters.level : [filters.level];
      results = results.filter(p => levels.includes(p.levelKey));
    }

    if (filters.position) {
      const positions = Array.isArray(filters.position) ? filters.position : [filters.position];
      results = results.filter(p => positions.includes(p.position));
    }

    if (filters.conference) {
      const conf = filters.conference.toLowerCase();
      results = results.filter(p => p.conference.toLowerCase().includes(conf));
    }

    if (filters.minKR != null) { results = results.filter(p => p.kr != null && p.kr >= filters.minKR!); }
    if (filters.maxKR != null) { results = results.filter(p => p.kr != null && p.kr <= filters.maxKR!); }
    if (filters.minHeight != null) { results = results.filter(p => p.heightInches != null && p.heightInches >= filters.minHeight!); }
    if (filters.maxHeight != null) { results = results.filter(p => p.heightInches != null && p.heightInches <= filters.maxHeight!); }
    if (filters.archetype) { const arch = filters.archetype.toLowerCase(); results = results.filter(p => p.archetype.toLowerCase().includes(arch)); }
    if (filters.hasPortalEntry) { results = results.filter(p => p.portalEntryDate != null); }

    const sortBy = filters.sortBy ?? 'kr';
    const sortDir = filters.sortDir ?? 'desc';
    const mult = sortDir === 'asc' ? 1 : -1;

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'kr': return mult * ((a.kr ?? 0) - (b.kr ?? 0));
        case 'ppg': return mult * ((a.ppg ?? 0) - (b.ppg ?? 0));
        case 'rpg': return mult * ((a.rpg ?? 0) - (b.rpg ?? 0));
        case 'apg': return mult * ((a.apg ?? 0) - (b.apg ?? 0));
        case 'height': return mult * ((a.heightInches ?? 0) - (b.heightInches ?? 0));
        case 'name': return mult * a.fullName.localeCompare(b.fullName);
        default: return 0;
      }
    });

    if (filters.offset) { results = results.slice(filters.offset); }
    if (filters.limit) { results = results.slice(0, filters.limit); }

    return results;
  },

  getPlayerCard(id: string): PlayerCardData | undefined {
    const p = playerIndex.get(id);
    if (!p) return undefined;

    const clusters = p.clusters as Record<ClusterType, number>;
    const badges = computePlayerBadges(
      clusters as any,
      (clusterKey: string) => {
        const score = clusters[clusterKey as ClusterType] ?? 50;
        return [{ name: clusterKey, rating: score }];
      },
    );

    return {
      ...p,
      krColor: getKRColor(p.kr),
      krTierLabel: getKRTierLabel(p.kr, p.levelKey),
      archetypeDisplay: getArchetypeDisplay(p.archetype),
      badges,
      clusterScores: CLUSTER_ORDER.map(key => ({
        key,
        score: clusters[key] ?? 50,
        color: getKRColor(clusters[key] ?? 50),
      })),
      statLine: buildStatLine(p),
    };
  },

  topByKR(n: number, filters?: { level?: string; position?: string }): NationalPlayer[] {
    return nationalPool.search({ ...filters, sortBy: 'kr', sortDir: 'desc', limit: n, minKR: 1 });
  },

  nexusSearch(query: string, filters: SearchFilters = {}): string {
    const results = nationalPool.search({ ...filters, query, limit: 20 });
    if (results.length === 0) return 'No players found matching your criteria.';

    const lines = results.map((p, i) => {
      const kr = p.kr != null ? `KR ${Math.round(p.kr)}` : 'Unrated';
      const tier = p.kr != null ? getKRTierLabel(p.kr, p.levelKey) : '';
      const stats = p.ppg != null ? `${p.ppg.toFixed(1)}/${p.rpg?.toFixed(1)}/${p.apg?.toFixed(1)}` : 'No stats';
      const arch = getArchetypeDisplay(p.archetype);
      return `${i + 1}. ${p.fullName} · ${p.position} · ${p.height} · ${p.school} (${p.levelKey.replace(/_/g, ' ').toUpperCase()}) · ${kr} ${tier} · ${arch} · ${stats} PPG/RPG/APG`;
    });

    return `Found ${results.length} player${results.length > 1 ? 's' : ''}:\n${lines.join('\n')}`;
  },
};

// =============================================================================
// ENRICHED TYPES
// =============================================================================

export interface PlayerCardData extends NationalPlayer {
  krColor: string;
  krTierLabel: string;
  archetypeDisplay: string;
  badges: PlayerBadge[];
  clusterScores: { key: string; score: number; color: string }[];
  statLine: string;
}

function buildStatLine(p: NationalPlayer): string {
  const parts: string[] = [];
  if (p.ppg != null) parts.push(`${p.ppg.toFixed(1)} PPG`);
  if (p.rpg != null) parts.push(`${p.rpg.toFixed(1)} RPG`);
  if (p.apg != null) parts.push(`${p.apg.toFixed(1)} APG`);
  return parts.join(' / ') || 'No stats';
}

// =============================================================================
// GLOBAL PLAYER CARD ADAPTER
// =============================================================================

import type { PlayerCardData as GlobalPlayerCardData } from '@/utils/global-entity-sheets';

export function toGlobalPlayerCard(p: NationalPlayer): GlobalPlayerCardData {
  return {
    name: p.fullName, number: p.jerseyNumber, position: p.position, height: p.height,
    weight: p.weight ?? 0, classYear: p.classYear,
    hometown: [p.city, p.state].filter(Boolean).join(', ') || undefined,
    previousSchool: p.highSchool || undefined,
    kr: p.kr ?? undefined, ppg: p.ppg ?? undefined, rpg: p.rpg ?? undefined, apg: p.apg ?? undefined,
    playerId: p.id, school: p.school, conference: p.conference,
    levelKey: p.levelKey, levelDisplay: p.levelDisplay,
    offKR: p.offKR ?? undefined, defKR: p.defKR ?? undefined,
    archetype: p.archetype, confidence: p.confidence ?? undefined,
    clusters: p.clusters,
    spg: p.spg ?? undefined, bpg: p.bpg ?? undefined, topg: p.topg ?? undefined,
    fgPct: p.fgPct ?? undefined, threePct: p.threePct ?? undefined, ftPct: p.ftPct ?? undefined,
    mpg: p.mpg ?? undefined, gp: p.gp ?? undefined, bprAvg: p.bprAvg ?? undefined,
    portalEntryDate: p.portalEntryDate,
    scholarshipPct: p.scholarship?.scholarshipPct ?? undefined,
    nilAmount: p.scholarship?.nilAmount ?? undefined,
    overallFitPct: p.scholarship?.overallFitPct ?? undefined,
  };
}

export default nationalPool;
```

---

# Section H — Entity Sheets

## Global Controller (`utils/global-entity-sheets.ts`)

```typescript
/**
 * Global Entity Sheet Controller
 * Module-level register/open/close for entity card sheets.
 * Follows the same pattern as global-team-sheet.ts.
 */

export interface TeamCardData {
  name: string;
  record?: string;
  confRecord?: string;
  conference?: string;
  teamKR?: number;
  logoUri?: string;
  category?: string;
}

export interface PlayerCardData {
  name: string;
  number: string;
  position: string;
  height: string;
  weight: number;
  classYear: string;
  hometown?: string;
  previousSchool?: string;
  kr?: number;
  teamColor?: string;
  ppg?: number;
  rpg?: number;
  apg?: number;
  // Extended fields for full intelligence display
  playerId?: string;
  school?: string;
  conference?: string;
  levelKey?: string;
  levelDisplay?: string;
  offKR?: number;
  defKR?: number;
  archetype?: string;
  confidence?: number;
  clusters?: Record<string, number>;
  spg?: number;
  bpg?: number;
  topg?: number;
  fgPct?: number;
  threePct?: number;
  ftPct?: number;
  mpg?: number;
  gp?: number;
  bprAvg?: number;
  portalEntryDate?: string | null;
  scholarshipPct?: number;
  nilAmount?: number;
  overallFitPct?: number;
}

export interface CoachCardData {
  name: string;
  title: string;
  bio?: string;
  recordAtInstitution?: string;
}

export interface DriverCardData {
  name: string;
  number: string;
  team: string;
  points?: number;
  wins?: number;
  podiums?: number;
  category?: string;
}

export interface CrewCardData {
  name: string;
  role: string;
  team: string;
  pitScore?: number;
}

export interface PersonCardData {
  name: string;
  role: string;
  ministries?: string[];
  status?: string;
}

export interface MinistryCardData {
  name: string;
  icon?: string;
  mission?: string;
  volunteers?: number;
  leader?: string;
}

export interface LeaderCardData {
  name: string;
  title: string;
  ministries?: string[];
  bio?: string;
}

type OpenTeamCard = (data: TeamCardData) => void;
type OpenPlayerCard = (data: PlayerCardData) => void;
type OpenCoachCard = (data: CoachCardData) => void;
type OpenDriverCard = (data: DriverCardData) => void;
type OpenCrewCard = (data: CrewCardData) => void;
type OpenPersonCard = (data: PersonCardData) => void;
type OpenMinistryCard = (data: MinistryCardData) => void;
type OpenLeaderCard = (data: LeaderCardData) => void;
type CloseHandler = () => void;

let _openTeamCard: OpenTeamCard | null = null;
let _closeTeamCard: CloseHandler | null = null;
let _openPlayerCard: OpenPlayerCard | null = null;
let _closePlayerCard: CloseHandler | null = null;
let _openCoachCard: OpenCoachCard | null = null;
let _closeCoachCard: CloseHandler | null = null;
let _openDriverCard: OpenDriverCard | null = null;
let _closeDriverCard: CloseHandler | null = null;
let _openCrewCard: OpenCrewCard | null = null;
let _closeCrewCard: CloseHandler | null = null;
let _openPersonCard: OpenPersonCard | null = null;
let _closePersonCard: CloseHandler | null = null;
let _openMinistryCard: OpenMinistryCard | null = null;
let _closeMinistryCard: CloseHandler | null = null;
let _openLeaderCard: OpenLeaderCard | null = null;
let _closeLeaderCard: CloseHandler | null = null;

export function registerEntitySheetHandlers(handlers: {
  openTeamCard: OpenTeamCard;
  closeTeamCard: CloseHandler;
  openPlayerCard: OpenPlayerCard;
  closePlayerCard: CloseHandler;
  openCoachCard: OpenCoachCard;
  closeCoachCard: CloseHandler;
  openDriverCard?: OpenDriverCard;
  closeDriverCard?: CloseHandler;
  openCrewCard?: OpenCrewCard;
  closeCrewCard?: CloseHandler;
  openPersonCard?: OpenPersonCard;
  closePersonCard?: CloseHandler;
  openMinistryCard?: OpenMinistryCard;
  closeMinistryCard?: CloseHandler;
  openLeaderCard?: OpenLeaderCard;
  closeLeaderCard?: CloseHandler;
}) {
  _openTeamCard = handlers.openTeamCard;
  _closeTeamCard = handlers.closeTeamCard;
  _openPlayerCard = handlers.openPlayerCard;
  _closePlayerCard = handlers.closePlayerCard;
  _openCoachCard = handlers.openCoachCard;
  _closeCoachCard = handlers.closeCoachCard;
  _openDriverCard = handlers.openDriverCard ?? null;
  _closeDriverCard = handlers.closeDriverCard ?? null;
  _openCrewCard = handlers.openCrewCard ?? null;
  _closeCrewCard = handlers.closeCrewCard ?? null;
  _openPersonCard = handlers.openPersonCard ?? null;
  _closePersonCard = handlers.closePersonCard ?? null;
  _openMinistryCard = handlers.openMinistryCard ?? null;
  _closeMinistryCard = handlers.closeMinistryCard ?? null;
  _openLeaderCard = handlers.openLeaderCard ?? null;
  _closeLeaderCard = handlers.closeLeaderCard ?? null;
}

export function openTeamCard(data: TeamCardData) { _openTeamCard?.(data); }
export function closeTeamCard() { _closeTeamCard?.(); }
export function openPlayerCard(data: PlayerCardData) { _openPlayerCard?.(data); }
export function closePlayerCard() { _closePlayerCard?.(); }
export function openCoachCard(data: CoachCardData) { _openCoachCard?.(data); }
export function closeCoachCard() { _closeCoachCard?.(); }
export function openDriverCard(data: DriverCardData) { _openDriverCard?.(data); }
export function closeDriverCard() { _closeDriverCard?.(); }
export function openCrewCard(data: CrewCardData) { _openCrewCard?.(data); }
export function closeCrewCard() { _closeCrewCard?.(); }
export function openPersonCard(data: PersonCardData) { _openPersonCard?.(data); }
export function closePersonCard() { _closePersonCard?.(); }
export function openMinistryCard(data: MinistryCardData) { _openMinistryCard?.(data); }
export function closeMinistryCard() { _closeMinistryCard?.(); }
export function openLeaderCard(data: LeaderCardData) { _openLeaderCard?.(data); }
export function closeLeaderCard() { _closeLeaderCard?.(); }
```

## Team Card Sheet (`components/entity-sheets/team-card-sheet.tsx`)

```typescript
/**
 * Team Card Sheet — lightweight team preview bottom sheet.
 * For deep dives, see TeamQuickSheet (4-tab detailed profile).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { TeamCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function getKRColor(kr: number): string {
  if (kr >= 80) return '#4ade80';
  if (kr >= 65) return '#fbbf24';
  return '#f87171';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: TeamCardData | null;
}

export function TeamCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        <View style={styles.identityRow}>
          <View style={[styles.initialsCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.teamName, { color: colors.text }]}>{data.name}</Text>
            {data.conference && (
              <Text style={[styles.conference, { color: colors.textSecondary }]}>{data.conference}</Text>
            )}
          </View>
        </View>

        <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.recordItem}>
            <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>OVERALL</Text>
            <Text style={[styles.recordValue, { color: colors.text }]}>{data.record || '\u2014'}</Text>
          </View>
          {data.confRecord && (
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>CONF</Text>
              <Text style={[styles.recordValue, { color: colors.text }]}>{data.confRecord}</Text>
            </View>
          )}
          {data.teamKR != null && (
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>TEAM KR</Text>
              <Text style={[styles.recordValue, { color: getKRColor(data.teamKR) }]}>{data.teamKR}</Text>
            </View>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, gap: Spacing.md },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  initialsCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  teamName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  conference: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  recordCard: { flexDirection: 'row', borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, justifyContent: 'space-around' },
  recordItem: { alignItems: 'center', gap: 4 },
  recordLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  recordValue: { fontSize: 17, fontWeight: '800' },
});
```

## Player Card Sheet (`components/entity-sheets/player-card-sheet.tsx`)

```typescript
/**
 * Player Card Sheet — Full intelligence player preview bottom sheet.
 * Shows KR (level-aware), archetype, badges, clusters, stats, system fit.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PlayerCardData } from '@/utils/global-entity-sheets';
import {
  getKRColor, getKRTierLabel, getKRBandLabel, getKRPercentileLabel,
  getArchetypeDisplay, CLUSTER_ORDER, CLUSTER_LABELS,
  BADGE_COLORS, BADGE_BG_COLORS, LEVEL_DISPLAY_SHORT,
} from '@/utils/kr-display';
import { computePlayerBadges, type PlayerBadge } from '@/utils/player-badges';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props { visible: boolean; onClose: () => void; data: PlayerCardData | null; }

export function PlayerCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!data) return null;

  const hue = data.teamColor ? nameToHue(data.teamColor) : nameToHue(data.name);
  const initials = data.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const kr = data.kr;
  const krColor = getKRColor(kr);
  const tierLabel = data.levelKey ? getKRTierLabel(kr, data.levelKey) : getKRBandLabel(kr);
  const archDisplay = getArchetypeDisplay(data.archetype);
  const levelTag = data.levelKey ? (LEVEL_DISPLAY_SHORT[data.levelKey] || data.levelDisplay || '') : '';

  const badges: PlayerBadge[] = data.clusters
    ? computePlayerBadges(
        data.clusters as any,
        (clusterKey: string) => {
          const score = (data.clusters as Record<string, number>)?.[clusterKey] ?? 50;
          return [{ name: clusterKey, rating: score }];
        },
      )
    : [];

  const goldCount = badges.filter(b => b.level === 'Gold').length;
  const silverCount = badges.filter(b => b.level === 'Silver').length;
  const bronzeCount = badges.filter(b => b.level === 'Bronze').length;

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.identityRow}>
            <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.playerName, { color: colors.text }]}>{data.name}</Text>
                {data.number ? (<Text style={[styles.jerseyBadge, { color: colors.textSecondary }]}>#{data.number}</Text>) : null}
              </View>
              <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
                {data.position} · {data.height}{data.weight ? ` · ${data.weight} lbs` : ''} · {data.classYear}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                {data.school ? (<Text style={[styles.schoolText, { color: colors.textSecondary }]}>{data.school}</Text>) : null}
                {data.conference ? (<Text style={[styles.confText, { color: colors.textTertiary }]}>· {data.conference}</Text>) : null}
                {levelTag ? (<View style={[styles.levelBadge, { backgroundColor: colors.border }]}><Text style={[styles.levelBadgeText, { color: colors.text }]}>{levelTag}</Text></View>) : null}
              </View>
            </View>
          </View>

          {/* KR SECTION */}
          {kr != null && (
            <View style={[styles.krCard, { backgroundColor: krColor + '15', borderColor: krColor + '40' }]}>
              <View style={styles.krRow}>
                <View style={[styles.krBadge, { backgroundColor: krColor }]}>
                  <Text style={styles.krNumber}>{Math.round(kr)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.krTierLabel, { color: krColor }]}>{tierLabel}</Text>
                  {data.levelKey && (
                    <Text style={[styles.krPercentile, { color: colors.textSecondary }]}>
                      {getKRPercentileLabel(kr, data.levelKey)} {levelTag ? `in ${levelTag}` : 'nationally'}
                    </Text>
                  )}
                </View>
                {data.bprAvg != null && (
                  <View style={styles.bprWrap}>
                    <Text style={[styles.bprLabel, { color: colors.textTertiary }]}>BPR</Text>
                    <Text style={[styles.bprValue, { color: colors.text }]}>{data.bprAvg.toFixed(1)}</Text>
                  </View>
                )}
              </View>
              {data.offKR != null && data.defKR != null && (
                <View style={styles.krBreakdownRow}>
                  <View style={styles.krBreakdownItem}>
                    <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>OFF KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: getKRColor(data.offKR) }]}>{Math.round(data.offKR)}</Text>
                  </View>
                  <View style={styles.krBreakdownItem}>
                    <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>DEF KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: getKRColor(data.defKR) }]}>{Math.round(data.defKR)}</Text>
                  </View>
                  {data.overallFitPct != null && (
                    <View style={styles.krBreakdownItem}>
                      <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>FIT</Text>
                      <Text style={[styles.krBreakdownValue, { color: getKRColor(data.overallFitPct) }]}>{Math.round(data.overallFitPct)}%</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* ARCHETYPE */}
          {data.archetype ? (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ARCHETYPE</Text>
              <Text style={[styles.archetypeText, { color: colors.text }]}>{archDisplay}</Text>
              {data.confidence != null && (<Text style={[styles.archetypeConfidence, { color: colors.textSecondary }]}>{Math.round(data.confidence)}% confidence</Text>)}
            </View>
          ) : null}

          {/* BADGES */}
          {badges.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.badgeHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BADGES</Text>
                <Text style={[styles.badgeSummary, { color: colors.textSecondary }]}>
                  {goldCount > 0 ? `${goldCount} Gold · ` : ''}{silverCount > 0 ? `${silverCount} Silver · ` : ''}{bronzeCount} Bronze
                </Text>
              </View>
              <View style={styles.badgeGrid}>
                {badges.map((badge, i) => (
                  <View key={`${badge.name}-${i}`} style={[styles.badgeChip, { backgroundColor: BADGE_BG_COLORS[badge.level], borderColor: BADGE_COLORS[badge.level] + '60' }]}>
                    <View style={[styles.badgeDot, { backgroundColor: BADGE_COLORS[badge.level] }]} />
                    <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* CLUSTERS */}
          {data.clusters && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SKILL CLUSTERS</Text>
              {CLUSTER_ORDER.map(key => {
                const score = (data.clusters as Record<string, number>)[key] ?? 50;
                const clusterColor = getKRColor(score);
                const label = CLUSTER_LABELS[key]?.label ?? key;
                const pct = Math.min(100, Math.max(0, score));
                return (
                  <View key={key} style={styles.clusterRow}>
                    <Text style={[styles.clusterLabel, { color: colors.textSecondary }]}>{label}</Text>
                    <View style={styles.clusterBarContainer}>
                      <View style={[styles.clusterBarBg, { backgroundColor: colors.border }]}>
                        <View style={[styles.clusterBarFill, { width: `${pct}%`, backgroundColor: clusterColor }]} />
                      </View>
                    </View>
                    <Text style={[styles.clusterScore, { color: clusterColor }]}>{score}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* STATS */}
          {data.ppg != null && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SEASON AVERAGES</Text>
              <View style={styles.statsGrid}>
                <StatCell label="PPG" value={data.ppg?.toFixed(1)} colors={colors} />
                <StatCell label="RPG" value={data.rpg?.toFixed(1)} colors={colors} />
                <StatCell label="APG" value={data.apg?.toFixed(1)} colors={colors} />
                <StatCell label="SPG" value={data.spg?.toFixed(1)} colors={colors} />
                <StatCell label="BPG" value={data.bpg?.toFixed(1)} colors={colors} />
                <StatCell label="MPG" value={data.mpg?.toFixed(1)} colors={colors} />
                <StatCell label="FG%" value={data.fgPct != null ? `${(data.fgPct * 100).toFixed(0)}` : undefined} colors={colors} />
                <StatCell label="3P%" value={data.threePct != null ? `${(data.threePct * 100).toFixed(0)}` : undefined} colors={colors} />
                <StatCell label="FT%" value={data.ftPct != null ? `${(data.ftPct * 100).toFixed(0)}` : undefined} colors={colors} />
                <StatCell label="TO" value={data.topg?.toFixed(1)} colors={colors} />
              </View>
              {data.gp != null && (<Text style={[styles.gpNote, { color: colors.textTertiary }]}>{data.gp} games played</Text>)}
            </View>
          )}

          {/* BACKGROUND */}
          {(data.hometown || data.previousSchool || data.portalEntryDate) && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BACKGROUND</Text>
              {data.hometown && <InfoRow label="Hometown" value={data.hometown} colors={colors} />}
              {data.previousSchool && <InfoRow label="Previous School" value={data.previousSchool} colors={colors} />}
              {data.portalEntryDate && <InfoRow label="Portal Entry" value={data.portalEntryDate} colors={colors} />}
            </View>
          )}

          {/* SCHOLARSHIP / NIL */}
          {(data.scholarshipPct != null || data.nilAmount != null) && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SCHOLARSHIP & NIL</Text>
              {data.scholarshipPct != null && (<InfoRow label="Scholarship" value={`${Math.round(data.scholarshipPct)}%`} colors={colors} />)}
              {data.nilAmount != null && (<InfoRow label="NIL Allocation" value={`$${Math.round(data.nilAmount).toLocaleString()}`} colors={colors} />)}
            </View>
          )}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function StatCell({ label, value, colors }: { label: string; value?: string; colors: typeof Colors.light }) {
  if (value == null) return null;
  return (<View style={styles.statCell}><Text style={[styles.statCellLabel, { color: colors.textTertiary }]}>{label}</Text><Text style={[styles.statCellValue, { color: colors.text }]}>{value}</Text></View>);
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (<View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</Text><Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text></View>);
}

const styles = StyleSheet.create({
  scroll: { maxHeight: '100%' },
  container: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 30 },
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  playerName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  jerseyBadge: { fontSize: 14, fontWeight: '600' },
  playerMeta: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  schoolText: { fontSize: 12, fontWeight: '600' },
  confText: { fontSize: 12, fontWeight: '500' },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  levelBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  krCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: 10 },
  krRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  krBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  krNumber: { fontSize: 20, fontWeight: '900', color: '#000' },
  krTierLabel: { fontSize: 15, fontWeight: '700' },
  krPercentile: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  bprWrap: { alignItems: 'center' },
  bprLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  bprValue: { fontSize: 16, fontWeight: '800' },
  krBreakdownRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 },
  krBreakdownItem: { alignItems: 'center', gap: 2 },
  krBreakdownLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  krBreakdownValue: { fontSize: 15, fontWeight: '800' },
  sectionCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  archetypeText: { fontSize: 16, fontWeight: '700' },
  archetypeConfidence: { fontSize: 12, fontWeight: '500' },
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeSummary: { fontSize: 11, fontWeight: '500' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeName: { fontSize: 11, fontWeight: '600' },
  clusterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 24 },
  clusterLabel: { width: 80, fontSize: 11, fontWeight: '600' },
  clusterBarContainer: { flex: 1 },
  clusterBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  clusterBarFill: { height: 6, borderRadius: 3 },
  clusterScore: { width: 26, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  statCell: { width: '18%', alignItems: 'center', paddingVertical: 6 },
  statCellLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  statCellValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  gpNote: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '600' },
});
```

## Coach Card Sheet (`components/entity-sheets/coach-card-sheet.tsx`)

```typescript
/**
 * Coach Card Sheet — lightweight coach preview bottom sheet.
 * Quick preview with identity and details card.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CoachCardData } from '@/utils/global-entity-sheets';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface Props { visible: boolean; onClose: () => void; data: CoachCardData | null; }

export function CoachCardSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 40%, 30%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coachName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.coachTitle, { color: colors.textSecondary }]}>{data.title}</Text>
          </View>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {data.recordAtInstitution && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Record at Institution</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{data.recordAtInstitution}</Text>
            </View>
          )}
          {data.bio && (
            <Text style={[styles.bioText, { color: colors.textSecondary }]} numberOfLines={4}>{data.bio}</Text>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md, gap: Spacing.md },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  coachName: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  coachTitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  detailsCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 12, fontWeight: '600' },
  detailValue: { fontSize: 14, fontWeight: '700' },
  bioText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
});
```

---

# Section I — KR Display & Badges

## KR Display (`utils/kr-display.ts`)

```typescript
/**
 * KR Display Utilities — Level-Aware Tier Labels, Color Bands, Badge Display
 *
 * KR is universal (0-100) but tier LABELS shift per competitive level.
 * Color bands are universal (same for all levels).
 * Badge rules from spec: Bronze >= 90, Silver >= 94, Gold >= 97.
 */

// =============================================================================
// KR COLOR BANDS (Universal — same for all levels)
// =============================================================================

export interface KRColorBand { min: number; max: number; color: string; label: string; }

export const KR_COLOR_BANDS: KRColorBand[] = [
  { min: 97, max: 100, color: '#FFD700', label: 'Elite/Transcendent' },
  { min: 94, max: 96,  color: '#C0C0C0', label: 'Franchise Anchor' },
  { min: 90, max: 93,  color: '#7B2FF7', label: 'High-Impact' },
  { min: 86, max: 89,  color: '#2196F3', label: 'Solid Starter' },
  { min: 82, max: 85,  color: '#00BCD4', label: 'Trusted Rotation' },
  { min: 78, max: 81,  color: '#4CAF50', label: 'Reliable Bench' },
  { min: 74, max: 77,  color: '#FFC107', label: 'Situational' },
  { min: 70, max: 73,  color: '#FF9800', label: 'Limited' },
  { min: 66, max: 69,  color: '#F44336', label: 'Fringe/Project' },
  { min: 0,  max: 65,  color: '#757575', label: 'Below Viability' },
];

export function getKRColor(kr: number | null | undefined): string {
  if (kr == null) return '#757575';
  for (const band of KR_COLOR_BANDS) { if (kr >= band.min) return band.color; }
  return '#757575';
}

export function getKRBandLabel(kr: number | null | undefined): string {
  if (kr == null) return 'Unrated';
  for (const band of KR_COLOR_BANDS) { if (kr >= band.min) return band.label; }
  return 'Below Viability';
}

// =============================================================================
// LEVEL-AWARE KR TIER LABELS (from College Player KR Legend)
// =============================================================================

export interface KRTier { min: number; max: number; label: string; }

export const KR_LEGEND: Record<string, KRTier[]> = {
  ncaa_d1_high_major: [
    { min: 98, max: 100, label: 'NPOY / Transcendent' },
    { min: 95, max: 97,  label: 'First Team All-American' },
    { min: 92, max: 94,  label: 'All-Conference First Team' },
    { min: 88, max: 91,  label: 'Projected Starter' },
    { min: 84, max: 87,  label: 'Rotation Player' },
    { min: 80, max: 83,  label: 'Situational Specialist' },
    { min: 76, max: 79,  label: 'Practice Player / Redshirt' },
    { min: 70, max: 75,  label: 'Roster Depth' },
    { min: 0,  max: 69,  label: 'Below Level' },
  ],
  ncaa_d1_mid_major: [
    { min: 95, max: 100, label: 'MM POY / Transcendent' },
    { min: 92, max: 94,  label: 'All-Conference First Team' },
    { min: 88, max: 91,  label: 'Franchise Anchor' },
    { min: 84, max: 87,  label: 'Projected Starter' },
    { min: 80, max: 83,  label: 'Key Rotation' },
    { min: 76, max: 79,  label: 'Situational Specialist' },
    { min: 72, max: 75,  label: 'Practice Player' },
    { min: 66, max: 71,  label: 'Roster Depth' },
    { min: 0,  max: 65,  label: 'Below Level' },
  ],
  ncaa_d1_low_major: [
    { min: 92, max: 100, label: 'LM POY / Dominant' },
    { min: 88, max: 91,  label: 'All-Conference' },
    { min: 84, max: 87,  label: 'Franchise Anchor' },
    { min: 80, max: 83,  label: 'Projected Starter' },
    { min: 76, max: 79,  label: 'Key Rotation' },
    { min: 72, max: 75,  label: 'Situational' },
    { min: 68, max: 71,  label: 'Practice Player' },
    { min: 0,  max: 67,  label: 'Below Level' },
  ],
  ncaa_d2: [
    { min: 90, max: 100, label: 'D2 POY / Dominant National' },
    { min: 86, max: 89,  label: 'All-Region' },
    { min: 82, max: 85,  label: 'Franchise Anchor' },
    { min: 78, max: 81,  label: 'Projected Starter' },
    { min: 74, max: 77,  label: 'Key Rotation' },
    { min: 70, max: 73,  label: 'Situational' },
    { min: 66, max: 69,  label: 'Roster Depth' },
    { min: 0,  max: 65,  label: 'Below Level' },
  ],
  ncaa_d3: [
    { min: 80, max: 100, label: 'D3 POY / Elite' },
    { min: 76, max: 79,  label: 'All-Region' },
    { min: 72, max: 75,  label: 'Franchise Anchor' },
    { min: 68, max: 71,  label: 'Projected Starter' },
    { min: 64, max: 67,  label: 'Key Rotation' },
    { min: 60, max: 63,  label: 'Situational' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],
  naia: [
    { min: 86, max: 100, label: 'NAIA POY / Elite' },
    { min: 82, max: 85,  label: 'All-Conference First Team' },
    { min: 78, max: 81,  label: 'Franchise Anchor' },
    { min: 74, max: 77,  label: 'Projected Starter' },
    { min: 70, max: 73,  label: 'Key Rotation' },
    { min: 66, max: 69,  label: 'Situational' },
    { min: 62, max: 65,  label: 'Roster Depth' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],
  njcaa_d1: [
    { min: 88, max: 100, label: 'JUCO D1 POY / Elite' },
    { min: 84, max: 87,  label: 'All-Region' },
    { min: 80, max: 83,  label: 'Franchise Anchor' },
    { min: 76, max: 79,  label: 'Projected Starter' },
    { min: 72, max: 75,  label: 'Key Rotation' },
    { min: 68, max: 71,  label: 'Situational' },
    { min: 64, max: 67,  label: 'Roster Depth' },
    { min: 0,  max: 63,  label: 'Below Level' },
  ],
  njcaa_d2: [
    { min: 84, max: 100, label: 'JUCO D2 POY / Elite' },
    { min: 80, max: 83,  label: 'All-Region' },
    { min: 76, max: 79,  label: 'Franchise Anchor' },
    { min: 72, max: 75,  label: 'Projected Starter' },
    { min: 68, max: 71,  label: 'Key Rotation' },
    { min: 64, max: 67,  label: 'Situational' },
    { min: 0,  max: 63,  label: 'Below Level' },
  ],
  njcaa_d3: [
    { min: 80, max: 100, label: 'JUCO D3 POY / Elite' },
    { min: 76, max: 79,  label: 'All-Region' },
    { min: 72, max: 75,  label: 'Franchise Anchor' },
    { min: 68, max: 71,  label: 'Projected Starter' },
    { min: 64, max: 67,  label: 'Key Rotation' },
    { min: 60, max: 63,  label: 'Situational' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],
  cccaa: [
    { min: 82, max: 100, label: 'CCCAA POY / Elite' },
    { min: 78, max: 81,  label: 'All-Conference' },
    { min: 74, max: 77,  label: 'Franchise Anchor' },
    { min: 70, max: 73,  label: 'Projected Starter' },
    { min: 66, max: 69,  label: 'Key Rotation' },
    { min: 62, max: 65,  label: 'Situational' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],
  uscaa: [
    { min: 78, max: 100, label: 'USCAA POY / Elite' },
    { min: 74, max: 77,  label: 'All-Conference' },
    { min: 70, max: 73,  label: 'Franchise Anchor' },
    { min: 66, max: 69,  label: 'Projected Starter' },
    { min: 62, max: 65,  label: 'Key Rotation' },
    { min: 0,  max: 61,  label: 'Below Level' },
  ],
  nccaa_d1: [
    { min: 76, max: 100, label: 'NCCAA POY / Elite' },
    { min: 72, max: 75,  label: 'All-Conference' },
    { min: 68, max: 71,  label: 'Franchise Anchor' },
    { min: 64, max: 67,  label: 'Projected Starter' },
    { min: 60, max: 63,  label: 'Key Rotation' },
    { min: 0,  max: 59,  label: 'Below Level' },
  ],
  nccaa_d2: [
    { min: 72, max: 100, label: 'NCCAA D2 POY / Elite' },
    { min: 68, max: 71,  label: 'All-Conference' },
    { min: 64, max: 67,  label: 'Franchise Anchor' },
    { min: 60, max: 63,  label: 'Projected Starter' },
    { min: 56, max: 59,  label: 'Key Rotation' },
    { min: 0,  max: 55,  label: 'Below Level' },
  ],
};

export function getKRTierLabel(kr: number | null | undefined, levelKey: string): string {
  if (kr == null) return 'Unrated';
  const tiers = KR_LEGEND[levelKey];
  if (!tiers) {
    const fallback = KR_LEGEND.naia;
    if (fallback) { for (const tier of fallback) { if (kr >= tier.min) return tier.label; } }
    return getKRBandLabel(kr);
  }
  for (const tier of tiers) { if (kr >= tier.min) return tier.label; }
  return 'Below Level';
}

// =============================================================================
// ARCHETYPE DISPLAY
// =============================================================================

export const ARCHETYPE_DISPLAY: Record<string, string> = {
  floor_general: 'Floor General', primary_ball_handler: 'Primary Ball Handler',
  pick_and_roll_operator: 'PnR Operator', dho_handoff_hub: 'DHO Hub',
  combo_scorer: 'Combo Scorer', three_level_scorer: '3-Level Scorer',
  two_way_wing: 'Two-Way Wing', slasher_wing: 'Slasher Wing',
  three_and_d_wing: '3-and-D Wing', switchable_defender_wing: 'Switchable Defender',
  spot_up_specialist: 'Spot-Up Specialist', secondary_creator_wing: 'Secondary Creator',
  connector_guard_wing: 'Connector', off_ball_shooter: 'Off-Ball Shooter',
  slasher_rim_pressure_wing: 'Rim Pressure Wing',
  rim_protector: 'Rim Protector', rim_protector_anchor: 'Rim Protector Anchor',
  stretch_big: 'Stretch Big', post_hub_facilitator_big: 'Post Facilitator',
  rebounding_interior_enforcer: 'Rebounding Enforcer', small_ball_big: 'Small-Ball Big',
  vertical_spacer: 'Vertical Spacer',
  'Two-Way Wing': 'Two-Way Wing', 'Slasher Wing': 'Slasher Wing',
  'Floor General': 'Floor General', 'Rim Protector': 'Rim Protector',
  'Stretch Big': 'Stretch Big', '3-Level Scorer': '3-Level Scorer',
  'Combo Scorer': 'Combo Scorer', 'Spot-Up Specialist': 'Spot-Up Specialist',
};

export function getArchetypeDisplay(archetype: string | null | undefined): string {
  if (!archetype) return 'Unknown';
  return ARCHETYPE_DISPLAY[archetype] ?? archetype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// =============================================================================
// BADGE DISPLAY HELPERS
// =============================================================================

export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold';

export const BADGE_COLORS: Record<BadgeLevel, string> = { Bronze: '#CD7F32', Silver: '#A8A9AD', Gold: '#FFD700' };
export const BADGE_BG_COLORS: Record<BadgeLevel, string> = { Bronze: '#CD7F3220', Silver: '#A8A9AD20', Gold: '#FFD70020' };

export const BADGE_THRESHOLDS_COLLEGE = {
  Bronze: { trait: 90, component: 90, effect: 3 },
  Silver: { trait: 94, component: 94, effect: 6 },
  Gold: { trait: 97, component: 97, effect: 10 },
};

export const BADGE_CAPS_COLLEGE = { maxGold: 1, maxSilver: 3, perComponentCap: 12, overallKRCap: 3.5 };

// =============================================================================
// CLUSTER DISPLAY
// =============================================================================

export const CLUSTER_LABELS: Record<string, { label: string; icon: string }> = {
  shooting: { label: 'Shooting', icon: 'scope' },
  finishing: { label: 'Finishing', icon: 'flame' },
  playmaking: { label: 'Playmaking', icon: 'arrow.triangle.branch' },
  perimeter_defense: { label: 'Perimeter D', icon: 'shield.lefthalf.filled' },
  interior_defense: { label: 'Interior D', icon: 'shield.righthalf.filled' },
  rebounding: { label: 'Rebounding', icon: 'arrow.up.arrow.down' },
  frame: { label: 'Physical', icon: 'figure.strengthtraining.traditional' },
};

export const CLUSTER_ORDER = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
] as const;

// =============================================================================
// KR PERCENTILE HELPERS
// =============================================================================

export function getKRPercentileLabel(kr: number, levelKey: string, totalAtLevel?: number): string {
  if (kr >= 90) return 'Top 1%';
  if (kr >= 85) return 'Top 3%';
  if (kr >= 80) return 'Top 5%';
  if (kr >= 75) return 'Top 10%';
  if (kr >= 70) return 'Top 15%';
  if (kr >= 65) return 'Top 25%';
  if (kr >= 60) return 'Top 35%';
  if (kr >= 55) return 'Top 45%';
  if (kr >= 50) return 'Top 50%';
  return 'Below 50%';
}

// =============================================================================
// LEVEL DISPLAY HELPERS
// =============================================================================

export const LEVEL_DISPLAY_SHORT: Record<string, string> = {
  ncaa_d1_high_major: 'D1 HM', ncaa_d1_mid_major: 'D1 MM', ncaa_d1_low_major: 'D1 LM',
  ncaa_d2: 'NCAA D2', ncaa_d3: 'NCAA D3', naia: 'NAIA',
  njcaa_d1: 'JUCO D1', njcaa_d2: 'JUCO D2', njcaa_d3: 'JUCO D3',
  cccaa: 'CCCAA', uscaa: 'USCAA', nccaa_d1: 'NCCAA D1', nccaa_d2: 'NCCAA D2',
};

export const LEVEL_DISPLAY_FULL: Record<string, string> = {
  ncaa_d1_high_major: 'NCAA D1 High Major', ncaa_d1_mid_major: 'NCAA D1 Mid Major', ncaa_d1_low_major: 'NCAA D1 Low Major',
  ncaa_d2: 'NCAA Division II', ncaa_d3: 'NCAA Division III', naia: 'NAIA',
  njcaa_d1: 'NJCAA Division I', njcaa_d2: 'NJCAA Division II', njcaa_d3: 'NJCAA Division III',
  cccaa: 'CCCAA', uscaa: 'USCAA', nccaa_d1: 'NCCAA Division I', nccaa_d2: 'NCCAA Division II',
};

export const ALL_LEVEL_KEYS = [
  'ncaa_d1_high_major', 'ncaa_d1_mid_major', 'ncaa_d1_low_major',
  'ncaa_d2', 'ncaa_d3', 'naia',
  'njcaa_d1', 'njcaa_d2', 'njcaa_d3',
  'cccaa', 'uscaa', 'nccaa_d1', 'nccaa_d2',
];
```

## Player Badges (`utils/player-badges.ts`)

```typescript
/**
 * Player Badge System — KaNeXT Badge computation per canonical spec.
 *
 * Badge eligibility: Component KR >= threshold AND relevant trait(s) >= threshold.
 * Bronze >= 90, Silver >= 94, Gold >= 97.
 */

import type { ClusterType } from '@/types';
import type { ClusterRatings } from '@/data/roster-data';

export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold';

export interface PlayerBadge {
  name: string;
  level: BadgeLevel;
  component: string;
}

export const BADGE_LEVEL_COLORS: Record<BadgeLevel, string> = {
  Bronze: '#CD7F32',
  Silver: '#A8A9AD',
  Gold: '#FFFFFF',
};

const BADGE_THRESHOLDS: { level: BadgeLevel; min: number }[] = [
  { level: 'Gold', min: 97 },
  { level: 'Silver', min: 94 },
  { level: 'Bronze', min: 90 },
];

interface BadgeDef {
  name: string;
  component: ClusterType;
  traits: string[];
}

const OFFENSIVE_BADGES: BadgeDef[] = [
  { name: 'Catch-and-Shoot', component: 'shooting', traits: ['3PT Spot-Up'] },
  { name: 'Movement Shooter', component: 'shooting', traits: ['3PT Movement'] },
  { name: 'Deep Range', component: 'shooting', traits: ['3PT Deep Range'] },
  { name: 'Pull-Up Shot Maker', component: 'shooting', traits: ['2PT Off-Dribble'] },
  { name: 'Rim Finisher', component: 'finishing', traits: ['Layup'] },
  { name: 'Contact Finisher', component: 'finishing', traits: ['Dunk'] },
  { name: 'Rim Pressure', component: 'finishing', traits: ['Close'] },
  { name: 'FT Generator', component: 'finishing', traits: ['Foul Draw Rate'] },
  { name: 'Cutter', component: 'finishing', traits: ['Floater/Runner'] },
  { name: 'Primary Playmaker', component: 'playmaking', traits: ['Passing Vision', 'Passing Accuracy'] },
  { name: 'Drive-and-Kick', component: 'playmaking', traits: ['Drive-and-Kick'] },
  { name: 'Ball Security', component: 'playmaking', traits: ['Ball Security'] },
  { name: 'Transition Playmaker', component: 'playmaking', traits: ['Transition'] },
];

const DEFENSIVE_BADGES: BadgeDef[] = [
  { name: 'Point-of-Attack', component: 'perimeter_defense', traits: ['Containment'] },
  { name: 'Ball Pressure', component: 'perimeter_defense', traits: ['Ball Pressure'] },
  { name: 'Lockdown Perimeter', component: 'perimeter_defense', traits: ['Containment', 'Off-Ball Denial'] },
  { name: 'Rim Protector', component: 'interior_defense', traits: ['Block', 'Rim Deterrence'] },
  { name: 'Paint Anchor', component: 'interior_defense', traits: ['Post Defense', 'Vertical Contest'] },
  { name: 'Help Defender', component: 'interior_defense', traits: ['Help Defense'] },
  { name: 'Passing Lane Disruptor', component: 'perimeter_defense', traits: ['Steal', 'Disruption'] },
  { name: 'Defensive Rebounder', component: 'rebounding', traits: ['Defensive', 'Box-Out'] },
  { name: 'Physical Rebounder', component: 'rebounding', traits: ['Offensive'] },
];

const ALL_BADGES = [...OFFENSIVE_BADGES, ...DEFENSIVE_BADGES];

export const OFFENSIVE_BADGE_NAMES = OFFENSIVE_BADGES.map((b) => b.name);
export const DEFENSIVE_BADGE_NAMES = DEFENSIVE_BADGES.map((b) => b.name);
export const ALL_BADGE_NAMES = ALL_BADGES.map((b) => b.name);
export const BADGE_LEVELS: BadgeLevel[] = ['Gold', 'Silver', 'Bronze'];

/**
 * Compute badges for a player given their cluster ratings and subcluster getter.
 * Max 1 Gold, 3 Silver, unlimited Bronze per spec.
 */
export function computePlayerBadges(
  clusters: ClusterRatings,
  getSubclusters: (clusterKey: keyof ClusterRatings) => { name: string; rating: number }[],
): PlayerBadge[] {
  const raw: (PlayerBadge & { score: number })[] = [];

  for (const def of ALL_BADGES) {
    const componentKR = clusters[def.component];
    const subs = getSubclusters(def.component);

    let minTrait = 100;
    for (const traitName of def.traits) {
      const sub = subs.find((s) => s.name === traitName);
      if (!sub) { minTrait = 0; break; }
      minTrait = Math.min(minTrait, sub.rating);
    }

    for (const { level, min } of BADGE_THRESHOLDS) {
      if (componentKR >= min && minTrait >= min) {
        raw.push({ name: def.name, level, component: def.component, score: componentKR + minTrait });
        break;
      }
    }
  }

  const golds = raw.filter((b) => b.level === 'Gold').sort((a, b) => b.score - a.score);
  const silvers = raw.filter((b) => b.level === 'Silver').sort((a, b) => b.score - a.score);
  const bronzes = raw.filter((b) => b.level === 'Bronze').sort((a, b) => b.score - a.score);

  const result: PlayerBadge[] = [];
  result.push(...golds.slice(0, 1).map(({ score: _, ...b }) => b));
  result.push(...silvers.slice(0, 3).map(({ score: _, ...b }) => b));
  result.push(...bronzes.map(({ score: _, ...b }) => b));

  return result;
}
```
