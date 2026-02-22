/**
 * Mock Business V2 Data — Complete data layer for Business Mode.
 * Company | Data Room | Deal Workspaces | KPIs | Risks | Budget |
 * Funding | Team | Investor Updates | Pipeline
 */

import type { DocAccessTag } from '@/utils/business-rbac';

// =============================================================================
// COMPANY TYPES
// =============================================================================

export interface CompanyObject {
  id: string;
  name: string;
  logo?: string;
  status: 'private' | 'public' | 'in_discussion';
  tagline: string;
  runway?: number;
  mrr?: number;
  arr?: number;
  keyDeal?: string;
}

// =============================================================================
// DATA ROOM TYPES
// =============================================================================

export interface DataRoomDoc {
  id: string;
  title: string;
  type: 'deck' | 'memo' | 'demo' | 'financial' | 'legal' | 'board_deck' | 'kpi' | 'risk' | 'decision_log' | 'budget' | 'agreement';
  accessTag: DocAccessTag;
  version?: string;
  watermarked?: boolean;
  updatedAt: string;
  description?: string;
}

export interface BoardPackItem {
  id: string;
  title: string;
  type: string;
  quarter: string;
  status: 'draft' | 'final';
  updatedAt: string;
}

export interface DecisionLogEntry {
  id: string;
  date: string;
  motion: string;
  outcome: 'approved' | 'deferred' | 'rejected';
  owner: string;
  attachments?: string[];
}

// =============================================================================
// DEAL WORKSPACE TYPES
// =============================================================================

export interface DealWorkspace {
  id: string;
  name: string;
  type: 'acquisition' | 'partnership';
  status: 'exploring' | 'diligence' | 'offer' | 'closed';
  targetOrg?: string;
  description?: string;
  keyContacts?: { name: string; role: string }[];
  timeline?: { date: string; event: string }[];
  rationale?: string;
  valuationSummary?: string;
  revenueProjections?: { year: string; base: string; downside: string; upside: string }[];
  costStructure?: { category: string; amount: string; pct: number }[];
}

// =============================================================================
// KPI / RISK / BUDGET TYPES
// =============================================================================

export interface KPIItem {
  id: string;
  name: string;
  value: string;
  target: string;
  status: 'on_track' | 'at_risk' | 'behind';
}

export interface RiskItem {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  owner: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

// =============================================================================
// FUNDING / TEAM / UPDATES / PIPELINE TYPES
// =============================================================================

export interface FundingPlan {
  round: string;
  target: number;
  raised: number;
  status: 'open' | 'closing' | 'closed';
  investors: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  type: 'leadership' | 'advisor' | 'team';
  bio?: string;
  public: boolean;
}

export interface InvestorUpdate {
  id: string;
  date: string;
  title: string;
  summary: string;
  tier: 'public' | 'retail' | 'board';
}

export interface PipelineItem {
  id: string;
  name: string;
  stage: string;
  type: 'institutional' | 'strategic' | 'partnership';
  status: 'active' | 'closed' | 'lost';
}

// =============================================================================
// COMPANY DATA
// =============================================================================

export const KANEXT_COMPANY: CompanyObject = {
  id: 'kanext',
  name: 'KaNeXT',
  status: 'private',
  tagline: 'Governed intelligence infrastructure for institutions.',
  runway: 7.2,
  mrr: 0,
  arr: 0,
  keyDeal: 'KaNeXT Partnership Track',
};

// =============================================================================
// DATA ROOM DOCS
// =============================================================================

export const DATA_ROOM_DOCS: DataRoomDoc[] = [
  // --- Retail Pack (5) ---
  {
    id: 'dr-1',
    title: 'KaNeXT Deck — Retail',
    type: 'deck',
    accessTag: 'retail',
    version: '3.1',
    watermarked: true,
    updatedAt: 'Feb 10, 2026',
    description: 'Investor-facing pitch deck with product overview, market size, traction summary, and ask.',
  },
  {
    id: 'dr-2',
    title: '2-Page Memo',
    type: 'memo',
    accessTag: 'retail',
    version: '2.0',
    watermarked: false,
    updatedAt: 'Feb 8, 2026',
    description: 'Concise investment thesis: problem, solution, market, team, and financial snapshot.',
  },
  {
    id: 'dr-3',
    title: 'Demo Navigation Guide',
    type: 'demo',
    accessTag: 'public',
    version: '1.0',
    watermarked: false,
    updatedAt: 'Feb 5, 2026',
    description: 'Step-by-step walkthrough of the KaNeXT OS demo environment for prospective investors.',
  },
  {
    id: 'dr-4',
    title: 'Entity Structure Summary',
    type: 'legal',
    accessTag: 'retail',
    version: '1.2',
    watermarked: true,
    updatedAt: 'Jan 28, 2026',
    description: 'Corporate entity overview: KaNeXT Inc. (Delaware C-Corp), subsidiaries, and cap table summary.',
  },
  {
    id: 'dr-5',
    title: 'Financial Summary (Banded)',
    type: 'financial',
    accessTag: 'retail',
    version: '1.1',
    watermarked: true,
    updatedAt: 'Feb 1, 2026',
    description: 'Banded revenue projections, burn rate ranges, and runway estimates. Exact figures redacted.',
  },
  // --- Board Pack (5) ---
  {
    id: 'dr-6',
    title: 'Board Deck — Q1 2026',
    type: 'board_deck',
    accessTag: 'board',
    version: '1.0',
    watermarked: true,
    updatedAt: 'Feb 12, 2026',
    description: 'Full board deck with KPIs, product roadmap, financials, and governance updates for Q1 2026.',
  },
  {
    id: 'dr-7',
    title: 'KPI Scoreboard — Q1 2026',
    type: 'kpi',
    accessTag: 'board',
    version: '1.0',
    watermarked: false,
    updatedAt: 'Feb 12, 2026',
    description: 'Quarterly KPI dashboard: user adoption, revenue pipeline, partnership LOIs, and platform uptime.',
  },
  {
    id: 'dr-8',
    title: 'Risk Register — Q1 2026',
    type: 'risk',
    accessTag: 'board',
    version: '1.0',
    watermarked: false,
    updatedAt: 'Feb 10, 2026',
    description: 'Active risk register with severity ratings, mitigation plans, and ownership assignments.',
  },
  {
    id: 'dr-9',
    title: 'Decision Log — Jan–Mar 2026',
    type: 'decision_log',
    accessTag: 'board',
    version: '1.0',
    watermarked: false,
    updatedAt: 'Feb 14, 2026',
    description: 'Board decision log covering all motions, votes, and outcomes for Q1 2026.',
  },
  {
    id: 'dr-10',
    title: 'Budget — Line Items (Read-only)',
    type: 'budget',
    accessTag: 'board',
    version: '1.0',
    watermarked: true,
    updatedAt: 'Feb 6, 2026',
    description: 'Detailed line-item budget for engineering, operations, legal, marketing, and infrastructure.',
  },
  // --- Founder Only (1) ---
  {
    id: 'dr-11',
    title: 'Cap Table Detail',
    type: 'financial',
    accessTag: 'founder_only',
    version: '2.3',
    watermarked: true,
    updatedAt: 'Feb 15, 2026',
    description: 'Full cap table with share classes, vesting schedules, option pool allocation, and dilution modeling.',
  },
];

// =============================================================================
// BOARD PACK ITEMS
// =============================================================================

export const BOARD_PACK_ITEMS: BoardPackItem[] = [
  {
    id: 'bp-1',
    title: 'Board Deck — Q1 2026',
    type: 'board_deck',
    quarter: 'Q1 2026',
    status: 'final',
    updatedAt: 'Feb 12, 2026',
  },
  {
    id: 'bp-2',
    title: 'KPI Scoreboard — Q1 2026',
    type: 'kpi',
    quarter: 'Q1 2026',
    status: 'final',
    updatedAt: 'Feb 12, 2026',
  },
  {
    id: 'bp-3',
    title: 'Risk Register — Q1 2026',
    type: 'risk',
    quarter: 'Q1 2026',
    status: 'draft',
    updatedAt: 'Feb 10, 2026',
  },
];

// =============================================================================
// DECISION LOG
// =============================================================================

export const DECISION_LOG: DecisionLogEntry[] = [
  {
    id: 'dl-1',
    date: 'Feb 3, 2026',
    motion: 'Approve Demo Rollout Plan',
    outcome: 'approved',
    owner: 'SK',
    attachments: ['Demo Rollout Plan v2.pdf'],
  },
  {
    id: 'dl-2',
    date: 'Jan 22, 2026',
    motion: 'Defer Sliema LOI Signing',
    outcome: 'deferred',
    owner: 'SK',
    attachments: ['Sliema LOI Draft.pdf', 'Due Diligence Summary.pdf'],
  },
  {
    id: 'dl-3',
    date: 'Jan 15, 2026',
    motion: 'Ratify Pre-Seed SAFE Terms',
    outcome: 'approved',
    owner: 'SK',
    attachments: ['SAFE Agreement Template.pdf'],
  },
];

// =============================================================================
// DEAL WORKSPACES
// =============================================================================

export const DEAL_WORKSPACES: DealWorkspace[] = [
  {
    id: 'deal-1',
    name: 'KaNeXT Partnership Track',
    type: 'partnership',
    status: 'diligence',
    targetOrg: 'KaNeXT Sports',
    description: 'Strategic partnership to deploy KaNeXT OS as the primary athletics intelligence platform for KaNeXT. Includes coaching tools, analytics, and roster management.',
    keyContacts: [
      { name: 'KaNeXT Athletic Director', role: 'Primary contact' },
      { name: 'KaNeXT Facilities Manager', role: 'Venue coordination' },
    ],
    timeline: [
      { date: 'Jan 20, 2026', event: 'Initial partnership meeting' },
      { date: 'Jan 25, 2026', event: 'Athletics department sign-off' },
      { date: 'Feb 1, 2026', event: 'OS deployment begins (13 sports)' },
      { date: 'Feb 12, 2026', event: 'BTW Classic venue walkthrough' },
      { date: 'Q2 2026', event: 'Full deployment complete (target)' },
    ],
    rationale: 'KaNeXT is the ideal proof wedge for Sports Mode. NAIA program competing against D1 opponents on ESPN+ creates massive media value at zero cost to the institution. Coach-built roster via KaNeXT Engines powers the intelligence layer.',
    valuationSummary: 'Partnership model -- no acquisition cost. Annual platform value: $24K ARR. Media value generated: $53M-$157M Year 1.',
    revenueProjections: [
      { year: 'Year 1', base: '$24K', downside: '$12K', upside: '$48K' },
      { year: 'Year 2', base: '$48K', downside: '$24K', upside: '$96K' },
      { year: 'Year 3', base: '$96K', downside: '$48K', upside: '$192K' },
    ],
    costStructure: [
      { category: 'Platform Operations', amount: '$15K', pct: 45 },
      { category: 'Onboarding & Training', amount: '$8K', pct: 24 },
      { category: 'Hardware (KX-C1)', amount: '$7K', pct: 21 },
      { category: 'Support', amount: '$3K', pct: 10 },
    ],
  },
  {
    id: 'deal-2',
    name: 'Sliema Wanderers FC Acquisition',
    type: 'acquisition',
    status: 'exploring',
    targetOrg: 'Sliema Wanderers FC',
    description: 'Potential acquisition of Maltese Premier League club. Exploring governance structure, valuation, and regulatory requirements with the League Association.',
    keyContacts: [
      { name: 'Mario Camilleri', role: 'Club President' },
      { name: 'Dr. Anne Vassallo', role: 'Legal Counsel (Malta)' },
      { name: 'Taylor Reed', role: 'Maltese FA Liaison' },
    ],
    timeline: [
      { date: 'Jan 20, 2026', event: 'Initial outreach via Maltese FA connection' },
      { date: 'Feb 5, 2026', event: 'Introductory call with club president' },
      { date: 'Feb 18, 2026', event: 'Request for club financial package (pending)' },
      { date: 'Mar 2026', event: 'Site visit to Sliema (planned)' },
      { date: 'Q2 2026', event: 'LOI target (if proceeding)' },
    ],
    rationale: 'KaNeXT needs a real-world sports organization to deploy the full OS stack in a European context. Sliema Wanderers offers low barrier to entry, English-speaking market, EU regulatory framework, and proximity to Mediterranean talent pipelines.',
    valuationSummary: 'Estimated club valuation: EUR 2M-5M. Stadium lease included. Youth academy infrastructure in place.',
    revenueProjections: [
      { year: 'Year 1', base: 'EUR 800K', downside: 'EUR 500K', upside: 'EUR 1.2M' },
      { year: 'Year 2', base: 'EUR 1.5M', downside: 'EUR 900K', upside: 'EUR 2.5M' },
      { year: 'Year 3', base: 'EUR 3M', downside: 'EUR 1.8M', upside: 'EUR 5M' },
    ],
    costStructure: [
      { category: 'Player Wages', amount: 'EUR 600K', pct: 40 },
      { category: 'Operations', amount: 'EUR 300K', pct: 20 },
      { category: 'Facility Maintenance', amount: 'EUR 225K', pct: 15 },
      { category: 'Youth Academy', amount: 'EUR 150K', pct: 10 },
      { category: 'Marketing & Media', amount: 'EUR 112K', pct: 7.5 },
      { category: 'Admin & Legal', amount: 'EUR 112K', pct: 7.5 },
    ],
  },
];

// =============================================================================
// KPI ITEMS
// =============================================================================

export const KPI_ITEMS: KPIItem[] = [
  {
    id: 'kpi-1',
    name: 'Revenue Pipeline',
    value: '$42K',
    target: '$100K',
    status: 'at_risk',
  },
  {
    id: 'kpi-2',
    name: 'User Adoption (Beta)',
    value: '38 users',
    target: '50 users',
    status: 'on_track',
  },
  {
    id: 'kpi-3',
    name: 'Demo Completions',
    value: '12',
    target: '20',
    status: 'on_track',
  },
  {
    id: 'kpi-4',
    name: 'Partnership LOIs',
    value: '1',
    target: '3',
    status: 'behind',
  },
  {
    id: 'kpi-5',
    name: 'Platform Uptime',
    value: '99.7%',
    target: '99.5%',
    status: 'on_track',
  },
  {
    id: 'kpi-6',
    name: 'Avg. Session Duration',
    value: '8.2 min',
    target: '10 min',
    status: 'at_risk',
  },
];

// =============================================================================
// RISK ITEMS
// =============================================================================

export const RISK_ITEMS: RiskItem[] = [
  {
    id: 'risk-1',
    title: 'Fundraising Timeline',
    severity: 'high',
    mitigation: 'Accelerate outbound to warm intros. Target 15 investor meetings by end of March. Prepare bridge SAFE if round extends.',
    owner: 'SK',
  },
  {
    id: 'risk-2',
    title: 'Key Person Risk',
    severity: 'critical',
    mitigation: 'Document all critical processes. Begin advisor recruiting for technical co-founder pipeline. Establish bus-factor playbook.',
    owner: 'SK',
  },
  {
    id: 'risk-3',
    title: 'Market Timing',
    severity: 'medium',
    mitigation: 'Monitor NIL regulatory landscape. Maintain flexible product roadmap to adapt to shifting collegiate athletics rules.',
    owner: 'SK',
  },
  {
    id: 'risk-4',
    title: 'Technical Debt',
    severity: 'medium',
    mitigation: 'Allocate 20% sprint capacity to refactoring. Prioritize authentication and data layer hardening before scale phase.',
    owner: 'SK',
  },
  {
    id: 'risk-5',
    title: 'Regulatory / Compliance',
    severity: 'low',
    mitigation: 'Engage sports law counsel for NAIA/NCAA compliance review. Track Malta FA licensing requirements for Sliema deal.',
    owner: 'SK',
  },
];

// =============================================================================
// BUDGET CATEGORIES
// =============================================================================

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'bud-1',
    name: 'Engineering',
    allocated: 45000,
    spent: 18200,
    remaining: 26800,
  },
  {
    id: 'bud-2',
    name: 'Operations',
    allocated: 15000,
    spent: 6400,
    remaining: 8600,
  },
  {
    id: 'bud-3',
    name: 'Legal',
    allocated: 12000,
    spent: 4800,
    remaining: 7200,
  },
  {
    id: 'bud-4',
    name: 'Marketing',
    allocated: 8000,
    spent: 2100,
    remaining: 5900,
  },
  {
    id: 'bud-5',
    name: 'Infrastructure',
    allocated: 10000,
    spent: 3600,
    remaining: 6400,
  },
  {
    id: 'bud-6',
    name: 'Travel & BD',
    allocated: 6000,
    spent: 2900,
    remaining: 3100,
  },
];

// =============================================================================
// FUNDING PLAN
// =============================================================================

export const FUNDING_PLAN: FundingPlan = {
  round: 'Pre-Seed',
  target: 1500000,
  raised: 0,
  status: 'open',
  investors: [],
};

// =============================================================================
// TEAM MEMBERS
// =============================================================================

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Alex Morgan',
    role: 'Founder / CEO',
    department: 'Executive',
    type: 'leadership',
    bio: 'Former collegiate coach turned sports-tech founder. Building governed intelligence infrastructure for athletic institutions.',
    public: true,
  },
  {
    id: 'tm-2',
    name: 'Dipo Carter',
    role: 'Advisor — Pastoral & Culture',
    department: 'Advisory Board',
    type: 'advisor',
    bio: 'Senior Pastor. Advises on organizational culture, ethical governance, and community relations.',
    public: true,
  },
  {
    id: 'tm-3',
    name: 'Michael Torres',
    role: 'Advisor — Legal & Compliance',
    department: 'Advisory Board',
    type: 'advisor',
    bio: 'Sports law attorney specializing in NIL, collegiate compliance, and international transfer regulations.',
    public: true,
  },
  {
    id: 'tm-4',
    name: 'Aisha Okonkwo',
    role: 'Lead Engineer',
    department: 'Engineering',
    type: 'team',
    bio: 'Full-stack engineer with experience in React Native, cloud infrastructure, and real-time data systems.',
    public: true,
  },
  {
    id: 'tm-5',
    name: 'Jordan Ellis',
    role: 'Product Designer',
    department: 'Product',
    type: 'team',
    bio: 'UX/UI designer focused on mobile-first experiences for sports and enterprise applications.',
    public: true,
  },
  {
    id: 'tm-6',
    name: 'Priya Nair',
    role: 'Data Analyst',
    department: 'Analytics',
    type: 'team',
    bio: 'Analytics specialist building the KPI and performance dashboards powering KaNeXT intelligence.',
    public: false,
  },
];

// =============================================================================
// INVESTOR UPDATES
// =============================================================================

export const INVESTOR_UPDATES: InvestorUpdate[] = [
  {
    id: 'iu-1',
    date: 'Feb 14, 2026',
    title: 'February 2026 — Product & Partnerships',
    summary: 'Demo environment launched. KaNeXT diligence in progress. Pre-seed conversations opened with 4 angel investors. Platform uptime at 99.7%.',
    tier: 'retail',
  },
  {
    id: 'iu-2',
    date: 'Feb 12, 2026',
    title: 'Board Update — Q1 2026 Snapshot',
    summary: 'Full Q1 KPI review, risk register update, and Sliema exploration status. Board deck and decision log attached. Cap table unchanged.',
    tier: 'board',
  },
  {
    id: 'iu-3',
    date: 'Jan 31, 2026',
    title: 'January 2026 — Foundation Month',
    summary: 'Entity incorporated (Delaware C-Corp). KaNeXT OS core architecture established. First advisor confirmed. KaNeXT intro meeting completed.',
    tier: 'retail',
  },
  {
    id: 'iu-4',
    date: 'Jan 15, 2026',
    title: 'KaNeXT Launches Public Presence',
    summary: 'KaNeXT announces its mission to build governed intelligence infrastructure for athletic institutions. Website and initial product overview now live.',
    tier: 'public',
  },
];

// =============================================================================
// PIPELINE ITEMS
// =============================================================================

export const PIPELINE_ITEMS: PipelineItem[] = [
  {
    id: 'pip-1',
    name: 'KaNeXT Sports',
    stage: 'Diligence',
    type: 'partnership',
    status: 'active',
  },
  {
    id: 'pip-2',
    name: 'KaNeXT Church (Independent Christian Collegiate League of Athletics)',
    stage: 'Proposal Sent',
    type: 'institutional',
    status: 'active',
  },
  {
    id: 'pip-3',
    name: 'BTW (Booker T. Washington)',
    stage: 'Initial Contact',
    type: 'partnership',
    status: 'active',
  },
  {
    id: 'pip-4',
    name: 'Tuskegee University',
    stage: 'Initial Contact',
    type: 'partnership',
    status: 'active',
  },
  {
    id: 'pip-5',
    name: 'Sliema Wanderers FC',
    stage: 'Exploring',
    type: 'strategic',
    status: 'active',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getCompanyById(id: string): CompanyObject | undefined {
  if (id === KANEXT_COMPANY.id) return KANEXT_COMPANY;
  return undefined;
}

export function getDocsByAccessLevel(role: string, tier?: string): DataRoomDoc[] {
  // Import-free filtering based on access tag string matching
  return DATA_ROOM_DOCS.filter((doc) => {
    // Founder sees everything
    if (role === 'B1') return true;

    // Public docs are visible to all
    if (doc.accessTag === 'public') return true;

    // Founder-only restricted to B1 (already handled)
    if (doc.accessTag === 'founder_only') return false;

    // Workspace-only restricted to B5
    if (doc.accessTag === 'workspace_only') return role === 'B5';

    // Retail docs: B2a, B2b, B5
    if (doc.accessTag === 'retail') {
      return role === 'B2a' || role === 'B2b' || role === 'B5';
    }

    // Board docs: B2b only
    if (doc.accessTag === 'board') {
      return role === 'B2b';
    }

    return false;
  });
}

export function getDealById(id: string): DealWorkspace | undefined {
  return DEAL_WORKSPACES.find((d) => d.id === id);
}

export function getBoardPackItems(): BoardPackItem[] {
  return BOARD_PACK_ITEMS;
}

export function getDecisionLog(): DecisionLogEntry[] {
  return DECISION_LOG;
}

export function getRetailDocs(): DataRoomDoc[] {
  return DATA_ROOM_DOCS.filter(
    (doc) => doc.accessTag === 'public' || doc.accessTag === 'retail'
  );
}

export function getBoardDocs(): DataRoomDoc[] {
  return DATA_ROOM_DOCS.filter(
    (doc) => doc.accessTag === 'public' || doc.accessTag === 'retail' || doc.accessTag === 'board'
  );
}

// =============================================================================
// CALENDAR TYPES
// =============================================================================

export interface BusinessCalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'milestone' | 'deadline' | 'approval_window' | 'commitment';
  date: string;
  time?: string;
  endTime?: string;
  timezone?: string;
  category: 'board' | 'fundraising' | 'product' | 'operations' | 'sales' | 'finance' | 'rails' | 'compliance' | 'people' | 'public';
  owner: string;
  attendees?: string[];
  status: 'on_track' | 'at_risk' | 'blocked' | 'done';
  confidentiality: 'public' | 'curated' | 'board' | 'internal' | 'restricted';
  prepAssets?: string[];
  decisionRequired?: boolean;
  entityId?: string;
  description?: string;
}

// =============================================================================
// OPERATIONS TYPES
// =============================================================================

export interface Initiative {
  id: string;
  title: string;
  objective: string;
  owner: string;
  status: 'on_track' | 'at_risk' | 'blocked' | 'done';
  successMetrics: string[];
  dueWindow: string;
  dependencies?: string[];
  entityId?: string;
}

export interface Project {
  id: string;
  title: string;
  initiativeId: string;
  owner: string;
  contributors?: string[];
  timeline: string;
  deliverables: string[];
  blockers?: string[];
  status: 'on_track' | 'at_risk' | 'blocked' | 'done';
}

export interface BusinessTask {
  id: string;
  title: string;
  projectId?: string;
  owner: string;
  due: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'in_progress' | 'waiting' | 'done';
  artifact?: string;
}

export interface Blocker {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  blocks: string;
  owner: string;
  eta?: string;
  escalationPath: string;
  evidence?: string[];
}

export interface DecisionPacket {
  id: string;
  title: string;
  options: string[];
  recommendation: string;
  risks: string[];
  requiredApprovals: string[];
  status: 'draft' | 'ready' | 'approved' | 'denied' | 'deferred';
  initiativeId?: string;
  auditNote?: string;
}

// =============================================================================
// FINANCE TYPES
// =============================================================================

export interface Wallet {
  id: string;
  name: string;
  entityId: string;
  availableBalance: number;
  committedBalance: number;
  pendingInflows: number;
  pendingOutflows: number;
  controls?: string;
  allowedRails: ('ach' | 'card' | 'wire' | 'internal')[];
}

export interface LedgerEntry {
  id: string;
  eventId: string;
  walletId: string;
  amount: number;
  type: 'credit' | 'debit';
  counterparty: string;
  description: string;
  state: 'draft' | 'authorized' | 'scheduled' | 'settled' | 'reversed';
  date: string;
  ruleStatus: 'passed' | 'failed' | 'override';
  auditComplete: boolean;
}

export interface BudgetBucket {
  id: string;
  name: string;
  entityId: string;
  hardCap: number;
  committed: number;
  spent: number;
  available: number;
}

export interface Commitment {
  id: string;
  title: string;
  amount: number;
  status: 'approved_pending' | 'scheduled' | 'awaiting_release';
  entityId: string;
  walletId: string;
  scheduledDate?: string;
  riskFlag?: string;
}

export interface RevenueStream {
  id: string;
  name: string;
  type: 'subscription' | 'services' | 'sponsorship' | 'platform_fee' | 'settlement_fee' | 'commerce_fee';
  gross: number;
  fees: number;
  net: number;
  entityId: string;
  period: string;
}

// =============================================================================
// PAYMENT RAILS TYPES
// =============================================================================

export type PaymentState = 'draft' | 'proposed' | 'rule_checked' | 'authorized' | 'scheduled' | 'released' | 'in_flight' | 'settled' | 'held' | 'failed' | 'disputed' | 'reversed';

export interface PaymentItem {
  id: string;
  type: 'transfer' | 'batch_item' | 'card' | 'ach' | 'wire' | 'refund' | 'chargeback';
  amount: number;
  fromWallet: string;
  toCounterparty: string;
  state: PaymentState;
  impacts?: string;
  owner: string;
  createdAt: string;
  deadline?: string;
  holdReason?: string;
  failReason?: string;
}

export interface PaymentBatch {
  id: string;
  name: string;
  recipientCount: number;
  totalAmount: number;
  state: PaymentState;
  approvalStatus: string;
  exceptionsCount: number;
  scheduledWindow?: string;
}

export interface Dispute {
  id: string;
  type: 'chargeback' | 'ach_return' | 'card_dispute';
  amount: number;
  stage: 'received' | 'evidence_requested' | 'submitted' | 'resolved';
  aging: number;
  counterparty: string;
  evidencePack?: boolean;
}

export interface RailsException {
  id: string;
  type: 'held' | 'failed' | 'dispute' | 'reversal';
  rootCause: 'authority_rule' | 'budget_rule' | 'eligibility_rule' | 'compliance_rule' | 'processor' | 'counterparty';
  description: string;
  failingRule: string;
  requiredFix: string;
  owner: string;
  escalation: string;
}

// =============================================================================
// BOARD / INVESTORS TYPES
// =============================================================================

export interface BoardMember {
  id: string;
  name: string;
  role: 'chair' | 'director' | 'observer';
  entityAccess: string[];
  signatureAuthority: 'none' | 'contract' | 'spend' | 'release_funds';
  lastActivity?: string;
}

export interface InvestorRecord {
  id: string;
  name: string;
  firm?: string;
  type: 'angel' | 'fund' | 'strategic' | 'family_office';
  status: 'prospect' | 'engaged' | 'committed' | 'closed';
  accessTier: 'none' | 'update_only' | 'dataroom' | 'full';
  notes?: string;
  lastTouch?: string;
}

export interface Resolution {
  id: string;
  type: 'board_consent' | 'investor_consent' | 'officer_approval';
  title: string;
  entityId: string;
  topic: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'archived';
  requiredVoters: string[];
  votes?: { memberId: string; vote: 'approve' | 'reject'; date: string }[];
}

export interface Distribution {
  id: string;
  date: string;
  amount: number;
  class?: string;
  status: 'scheduled' | 'sent' | 'settled' | 'failed' | 'held';
}

// =============================================================================
// COMPLIANCE / LEGAL TYPES
// =============================================================================

export interface LegalDoc {
  id: string;
  title: string;
  category: 'corporate' | 'legal' | 'compliance' | 'finance' | 'rails' | 'operations' | 'product';
  subcategory: string;
  entityId: string;
  status: 'draft' | 'executed' | 'expiring' | 'needs_signature';
  visibility: 'internal' | 'board' | 'investor' | 'specific_party';
  owner: string;
  lastUpdated: string;
  version: string;
}

export interface Policy {
  id: string;
  title: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'superseded';
  version: string;
  owner: string;
  attestationCount?: number;
  renewCadence: 'annual' | 'quarterly';
}

export interface ComplianceRisk {
  id: string;
  title: string;
  category: 'legal' | 'financial' | 'data' | 'operational' | 'reputational';
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: number;
  owner: string;
  mitigation: string;
  residualRisk: string;
}

export interface ComplianceIncident {
  id: string;
  type: 'security' | 'financial' | 'legal' | 'ops';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'remediation' | 'closed';
  owner: string;
  date: string;
}

// =============================================================================
// MEDIA / PROOF TYPES
// =============================================================================

export interface ProofItem {
  id: string;
  title: string;
  type: 'video' | 'image' | 'pdf' | 'audio' | 'link' | 'proof_note';
  category: 'product' | 'traction' | 'outcomes' | 'partnerships' | 'compliance' | 'financial' | 'team';
  status: 'draft' | 'verified' | 'restricted' | 'published';
  verificationLevel: 'self_reported' | 'evidence_backed' | 'third_party_validated' | 'system_generated';
  owner: string;
  tags: string[];
  usedInPacks: number;
  rights: 'owned' | 'licensed' | 'permissioned' | 'unknown';
  duration?: string;
  lastUpdated: string;
}

export interface ProofPack {
  id: string;
  title: string;
  audience: 'investor' | 'partner' | 'bank' | 'customer' | 'recruiting' | 'board';
  status: 'draft' | 'published' | 'archived';
  narrative: string;
  sections: { claim: string; proofIds: string[] }[];
  lastShared?: string;
  viewerCount?: number;
}

// =============================================================================
// DATA ROOM V2 TYPES
// =============================================================================

export interface DataRoomPacket {
  id: string;
  title: string;
  type: 'investor_short' | 'investor_deep' | 'board' | 'bank' | 'partner' | 'compliance' | 'deal';
  status: 'draft' | 'published' | 'archived';
  docIds: string[];
  lastShared?: string;
  viewerCount?: number;
}

export interface DataRoomRequest {
  id: string;
  requester: string;
  description: string;
  dueDate: string;
  owner: string;
  status: 'open' | 'in_progress' | 'in_review' | 'delivered' | 'closed';
  attachments?: string[];
}

// =============================================================================
// ENTITIES TYPES
// =============================================================================

export interface BusinessEntity {
  id: string;
  name: string;
  type: 'holdco' | 'opsco' | 'ipco' | 'partner_org' | 'relationship' | 'asset' | 'project';
  status: 'active' | 'under_evaluation' | 'partner' | 'acquisition_target' | 'dormant' | 'flagged';
  governanceStatus: 'green' | 'yellow' | 'red';
  complianceStatus: 'green' | 'yellow' | 'red';
  railsStatus: 'connected' | 'limited' | 'offline';
  docsComplete: number;
  docsMissing: number;
  peopleAssigned: number;
  keyRolesMissing: number;
  activeDeals: number;
  pendingSignatures: number;
  inflow30d: number;
  outflow30d: number;
  exceptionsCount: number;
  owner: string;
  lastActivity: string;
}

// =============================================================================
// ALERTS TYPES
// =============================================================================

export interface BusinessAlert {
  id: string;
  type: 'blocker' | 'approval' | 'due_24h' | 'investor_risk' | 'partner_risk' | 'rails_exception' | 'compliance_risk' | 'people_risk';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  owner: string;
  dueTime?: string;
  entityId?: string;
}

// =============================================================================
// FEED TYPES
// =============================================================================

export interface FeedItem {
  id: string;
  text: string;
  timestamp: string;
  category: 'approval' | 'board' | 'milestone' | 'compliance' | 'demo' | 'rails' | 'public';
  deepLink?: string;
}

// =============================================================================
// PINNED TYPES
// =============================================================================

export interface PinnedItem {
  id: string;
  title: string;
  type: 'room' | 'workspace' | 'doc' | 'finance_view' | 'rails_view';
  hasBlocker?: boolean;
  dueSoon?: boolean;
}

// =============================================================================
// CALENDAR EVENTS DATA
// =============================================================================

export const CALENDAR_EVENTS: BusinessCalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Board Pack Review (PBD/Tom)',
    type: 'meeting',
    date: 'Feb 20, 2026',
    time: '10:00 AM',
    endTime: '11:30 AM',
    timezone: 'ET',
    category: 'board',
    owner: 'SK',
    attendees: ['SK', 'PBD', 'Tom Atkins'],
    status: 'on_track',
    confidentiality: 'board',
    prepAssets: ['Board Deck — Q1 2026', 'KPI Scoreboard — Q1 2026'],
    decisionRequired: true,
    entityId: 'ent-1',
    description: 'Quarterly board pack walkthrough with PBD and Tom. Decision required on demo rollout timing and rails partner selection.',
  },
  {
    id: 'cal-2',
    title: 'Investor Follow-up Calls Block',
    type: 'meeting',
    date: 'Feb 19, 2026',
    time: '1:00 PM',
    endTime: '4:00 PM',
    timezone: 'ET',
    category: 'fundraising',
    owner: 'SK',
    attendees: ['SK', 'Marcus Chen', 'David Okafor', 'Rachel Kim'],
    status: 'on_track',
    confidentiality: 'restricted',
    description: 'Three back-to-back follow-up calls with pre-seed prospects. Marcus (angel), David (strategic), Rachel (fund).',
  },
  {
    id: 'cal-3',
    title: 'OS Demo v2 Cut (Video)',
    type: 'milestone',
    date: 'Feb 22, 2026',
    category: 'product',
    owner: 'Jordan Ellis',
    status: 'at_risk',
    confidentiality: 'internal',
    description: 'Final cut of KaNeXT OS Demo v2 video for investor distribution. Waiting on rails demo footage.',
    entityId: 'ent-2',
  },
  {
    id: 'cal-4',
    title: 'Month-End Close',
    type: 'deadline',
    date: 'Feb 21, 2026',
    time: '5:00 PM',
    timezone: 'ET',
    category: 'finance',
    owner: 'Priya Nair',
    status: 'on_track',
    confidentiality: 'internal',
    description: 'February month-end financial close. All expense reports and vendor invoices must be reconciled.',
    entityId: 'ent-2',
  },
  {
    id: 'cal-5',
    title: 'Payout Batch Approval Window',
    type: 'approval_window',
    date: 'Feb 18, 2026',
    time: '9:00 AM',
    endTime: 'Feb 19, 2026 9:00 AM',
    timezone: 'ET',
    category: 'rails',
    owner: 'SK',
    status: 'on_track',
    confidentiality: 'internal',
    decisionRequired: true,
    description: 'Vendor payout batch and payroll run require founder approval. 48-hour window opens tomorrow morning.',
    entityId: 'ent-2',
  },
  {
    id: 'cal-6',
    title: 'Trademark Filing Deadline',
    type: 'deadline',
    date: 'Feb 17, 2026',
    time: '11:59 PM',
    timezone: 'ET',
    category: 'compliance',
    owner: 'Michael Torres',
    status: 'at_risk',
    confidentiality: 'internal',
    description: 'USPTO trademark filing for KaNeXT and KX-C1 marks. Must be submitted today to preserve priority date.',
    entityId: 'ent-3',
  },
  {
    id: 'cal-7',
    title: 'Broadcast/Distribution Partner Check-in',
    type: 'commitment',
    date: 'Feb 23, 2026',
    time: '2:00 PM',
    endTime: '3:00 PM',
    timezone: 'ET',
    category: 'sales',
    owner: 'SK',
    attendees: ['SK', 'Valuetainment Team'],
    status: 'on_track',
    confidentiality: 'restricted',
    description: 'Monthly sync with Valuetainment on distribution partnership. Review content pipeline and sponsorship packaging.',
    entityId: 'ent-4',
  },
  {
    id: 'cal-8',
    title: 'Live Demo Office Hours',
    type: 'meeting',
    date: 'Feb 22, 2026',
    time: '12:00 PM',
    endTime: '1:00 PM',
    timezone: 'ET',
    category: 'public',
    owner: 'SK',
    status: 'on_track',
    confidentiality: 'curated',
    description: 'Open demo session for prospective partners and investors. Live walkthrough of Sports Mode and Business Mode.',
  },
];

// =============================================================================
// INITIATIVES DATA
// =============================================================================

export const INITIATIVES: Initiative[] = [
  {
    id: 'init-1',
    title: 'KaNeXT OS Demo v2',
    objective: 'Ship polished demo environment covering Sports Mode, Business Mode, and Payment Rails for investor and partner presentations.',
    owner: 'SK',
    status: 'on_track',
    successMetrics: ['Demo video cut approved', 'Live demo stable for 30-min sessions', '3+ investor demos completed'],
    dueWindow: 'Feb 22 – Mar 1, 2026',
    dependencies: ['init-2'],
    entityId: 'ent-2',
  },
  {
    id: 'init-2',
    title: 'Payment Rails Partner + Compliance',
    objective: 'Finalize payment rails partner selection, complete KYC/KYB flow, and achieve first successful test transaction.',
    owner: 'Aisha Okonkwo',
    status: 'at_risk',
    successMetrics: ['Partner contract signed', 'KYC flow operational', 'Test payout settled end-to-end'],
    dueWindow: 'Feb 17 – Mar 7, 2026',
    entityId: 'ent-2',
  },
  {
    id: 'init-3',
    title: 'KaNeXT Wedge / Mandate Execution',
    objective: 'Complete KaNeXT deployment across 13 sports, capture proof-of-value metrics, and establish replicable playbook for next institution.',
    owner: 'SK',
    status: 'on_track',
    successMetrics: ['13 sports onboarded', 'BTW Classic covered live', 'First KPI report delivered to AD'],
    dueWindow: 'Q1 – Q2 2026',
    entityId: 'ent-2',
  },
  {
    id: 'init-4',
    title: 'K-1 Proof Platform',
    objective: 'Build the proof-of-impact layer enabling verifiable claims for investors, partners, and compliance audiences.',
    owner: 'Jordan Ellis',
    status: 'on_track',
    successMetrics: ['Proof library seeded with 20+ items', '3 proof packs published', 'Data room packets assembled'],
    dueWindow: 'Feb 17 – Mar 15, 2026',
    entityId: 'ent-2',
  },
  {
    id: 'init-5',
    title: 'Investor Pipeline',
    objective: 'Build and advance pre-seed investor pipeline to first close. Target 15 qualified meetings and 3+ term sheet conversations.',
    owner: 'SK',
    status: 'at_risk',
    successMetrics: ['15 qualified meetings', '3 term sheet conversations', 'First close >$250K'],
    dueWindow: 'Feb – Apr 2026',
    entityId: 'ent-1',
  },
  {
    id: 'init-6',
    title: 'Trademark + IP Pack',
    objective: 'Secure trademark filings for KaNeXT, KX-C1, and related marks. Complete IP assignment agreements across all contributors.',
    owner: 'Michael Torres',
    status: 'on_track',
    successMetrics: ['USPTO filings submitted', 'IP assignment agreements executed', 'IP register documented'],
    dueWindow: 'Feb 17 – Feb 24, 2026',
    entityId: 'ent-3',
  },
];

// =============================================================================
// PROJECTS DATA
// =============================================================================

export const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Demo Video Production',
    initiativeId: 'init-1',
    owner: 'Jordan Ellis',
    contributors: ['Aisha Okonkwo', 'SK'],
    timeline: 'Feb 15 – Feb 22, 2026',
    deliverables: ['Screen capture of full OS flow', 'Voiceover script', 'Final cut export (MP4 + web)'],
    blockers: ['Rails demo footage pending partner finalization'],
    status: 'at_risk',
  },
  {
    id: 'proj-2',
    title: 'Rails Integration Build',
    initiativeId: 'init-2',
    owner: 'Aisha Okonkwo',
    contributors: ['SK'],
    timeline: 'Feb 10 – Mar 1, 2026',
    deliverables: ['KYC/KYB flow UI', 'Test payout pipeline', 'Settlement reconciliation'],
    blockers: ['KYC flow not finalized — waiting on partner API docs'],
    status: 'at_risk',
  },
  {
    id: 'proj-3',
    title: 'KaNeXT Sports Onboarding',
    initiativeId: 'init-3',
    owner: 'SK',
    timeline: 'Jan 25 – Mar 15, 2026',
    deliverables: ['Roster import for 13 sports', 'Schedule integration', 'Coach training sessions'],
    status: 'on_track',
  },
  {
    id: 'proj-4',
    title: 'Proof Library Seed',
    initiativeId: 'init-4',
    owner: 'Jordan Ellis',
    contributors: ['Priya Nair', 'SK'],
    timeline: 'Feb 17 – Mar 1, 2026',
    deliverables: ['20+ proof items uploaded', 'Verification tags applied', 'First 3 proof packs assembled'],
    status: 'on_track',
  },
];

// =============================================================================
// BUSINESS TASKS DATA
// =============================================================================

export const BUSINESS_TASKS: BusinessTask[] = [
  {
    id: 'btask-1',
    title: 'Finalize board pack narrative for PBD review',
    projectId: 'proj-1',
    owner: 'SK',
    due: 'Feb 19, 2026',
    priority: 'critical',
    status: 'in_progress',
    artifact: 'Board Deck — Q1 2026',
  },
  {
    id: 'btask-2',
    title: 'Record rails demo screen capture',
    projectId: 'proj-2',
    owner: 'Aisha Okonkwo',
    due: 'Feb 20, 2026',
    priority: 'high',
    status: 'waiting',
  },
  {
    id: 'btask-3',
    title: 'Upload KaNeXT roster data for remaining 5 sports',
    projectId: 'proj-3',
    owner: 'SK',
    due: 'Feb 22, 2026',
    priority: 'medium',
    status: 'in_progress',
  },
  {
    id: 'btask-4',
    title: 'Draft sponsorship pricing bands document',
    owner: 'SK',
    due: 'Feb 21, 2026',
    priority: 'high',
    status: 'new',
    artifact: 'Sponsorship Packaging v1',
  },
  {
    id: 'btask-5',
    title: 'Complete trademark filing paperwork',
    owner: 'Michael Torres',
    due: 'Feb 17, 2026',
    priority: 'critical',
    status: 'in_progress',
  },
  {
    id: 'btask-6',
    title: 'Reconcile January vendor invoices',
    owner: 'Priya Nair',
    due: 'Feb 21, 2026',
    priority: 'low',
    status: 'done',
  },
];

// =============================================================================
// BLOCKERS DATA
// =============================================================================

export const BLOCKERS: Blocker[] = [
  {
    id: 'blk-1',
    title: 'Payment rails KYC flow not finalized',
    severity: 'critical',
    blocks: 'Rails Integration Build (proj-2), Demo Video Production (proj-1)',
    owner: 'Aisha Okonkwo',
    eta: 'Feb 20, 2026',
    escalationPath: 'SK → Partner Account Manager → Partner VP Engineering',
    evidence: ['Partner API docs v0.8 (incomplete)', 'KYC test failure logs'],
  },
  {
    id: 'blk-2',
    title: 'Board pack data room missing updated financial model',
    severity: 'high',
    blocks: 'Board Pack Review (cal-1), Investor Follow-up Calls (cal-2)',
    owner: 'Priya Nair',
    eta: 'Feb 19, 2026',
    escalationPath: 'SK → Priya Nair',
    evidence: ['Financial Model v2.1 (outdated — needs Feb actuals)'],
  },
];

// =============================================================================
// DECISION PACKETS DATA
// =============================================================================

export const DECISION_PACKETS: DecisionPacket[] = [
  {
    id: 'dp-1',
    title: 'Choose rails partner: Option A vs Option B',
    options: ['Partner A — Lower fees, slower onboarding, US-only', 'Partner B — Higher fees, faster onboarding, international support'],
    recommendation: 'Partner B — speed to demo and international coverage outweigh fee differential at current volume.',
    risks: ['Higher per-transaction cost at scale', 'Vendor lock-in on settlement API'],
    requiredApprovals: ['SK', 'Aisha Okonkwo'],
    status: 'ready',
    initiativeId: 'init-2',
    auditNote: 'Comparison matrix attached. Fee analysis assumes <$500K monthly volume for first 12 months.',
  },
  {
    id: 'dp-2',
    title: 'Approve demo narrative cut for PBD',
    options: ['Full 12-min walkthrough with all modes', 'Focused 6-min cut: Sports + Business only', 'Modular 3x4-min cuts by mode'],
    recommendation: 'Focused 6-min cut — matches PBD attention window and covers highest-impact features.',
    risks: ['Omits rails demo which is a key differentiator', 'May require follow-up session for full depth'],
    requiredApprovals: ['SK'],
    status: 'draft',
    initiativeId: 'init-1',
  },
  {
    id: 'dp-3',
    title: 'Approve sponsorship packaging price bands',
    options: ['3-tier: $5K / $15K / $50K', '4-tier: $2.5K / $10K / $25K / $75K', 'Custom pricing per sponsor'],
    recommendation: '4-tier structure — wider entry point captures smaller sponsors while maintaining premium ceiling.',
    risks: ['4 tiers increase operational complexity', 'Custom pricing delays sales cycle'],
    requiredApprovals: ['SK'],
    status: 'ready',
  },
];

// =============================================================================
// WALLETS DATA
// =============================================================================

export const WALLETS: Wallet[] = [
  {
    id: 'wal-1',
    name: 'Operating',
    entityId: 'ent-2',
    availableBalance: 142300,
    committedBalance: 48200,
    pendingInflows: 12000,
    pendingOutflows: 48200,
    controls: 'Dual approval >$10K, single approval <$10K',
    allowedRails: ['ach', 'card', 'wire', 'internal'],
  },
  {
    id: 'wal-2',
    name: 'Payroll',
    entityId: 'ent-2',
    availableBalance: 225000,
    committedBalance: 112450,
    pendingInflows: 0,
    pendingOutflows: 112450,
    controls: 'Auto-release on schedule, founder override only',
    allowedRails: ['ach', 'internal'],
  },
  {
    id: 'wal-3',
    name: 'Sponsorship Escrow',
    entityId: 'ent-2',
    availableBalance: 37500,
    committedBalance: 18750,
    pendingInflows: 25000,
    pendingOutflows: 18750,
    controls: 'Release requires sponsor confirmation + founder approval',
    allowedRails: ['ach', 'wire'],
  },
  {
    id: 'wal-4',
    name: 'Facilities Fund',
    entityId: 'ent-2',
    availableBalance: 15000,
    committedBalance: 7200,
    pendingInflows: 0,
    pendingOutflows: 3600,
    controls: 'Single approval, capped at $5K per transaction',
    allowedRails: ['ach', 'card'],
  },
  {
    id: 'wal-5',
    name: 'Investor Proceeds',
    entityId: 'ent-1',
    availableBalance: 0,
    committedBalance: 0,
    pendingInflows: 0,
    pendingOutflows: 0,
    controls: 'Board approval required for any disbursement',
    allowedRails: ['wire', 'internal'],
  },
];

// =============================================================================
// LEDGER ENTRIES DATA
// =============================================================================

export const LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'led-1',
    eventId: 'evt-001',
    walletId: 'wal-1',
    amount: 12000,
    type: 'credit',
    counterparty: 'KaNeXT Athletics',
    description: 'Platform license fee — February 2026',
    state: 'scheduled',
    date: 'Feb 20, 2026',
    ruleStatus: 'passed',
    auditComplete: false,
  },
  {
    id: 'led-2',
    eventId: 'evt-002',
    walletId: 'wal-1',
    amount: 48200,
    type: 'debit',
    counterparty: 'Multiple vendors',
    description: 'Vendor payout batch — February run',
    state: 'authorized',
    date: 'Feb 18, 2026',
    ruleStatus: 'passed',
    auditComplete: false,
  },
  {
    id: 'led-3',
    eventId: 'evt-003',
    walletId: 'wal-2',
    amount: 112450,
    type: 'debit',
    counterparty: 'Payroll provider',
    description: 'Payroll run — February cycle 1',
    state: 'scheduled',
    date: 'Feb 18, 2026',
    ruleStatus: 'passed',
    auditComplete: false,
  },
  {
    id: 'led-4',
    eventId: 'evt-004',
    walletId: 'wal-3',
    amount: 25000,
    type: 'credit',
    counterparty: 'Valuetainment',
    description: 'Sponsorship deposit — Q1 installment',
    state: 'draft',
    date: 'Feb 23, 2026',
    ruleStatus: 'passed',
    auditComplete: false,
  },
  {
    id: 'led-5',
    eventId: 'evt-005',
    walletId: 'wal-3',
    amount: 18750,
    type: 'debit',
    counterparty: 'Sponsor split recipients (12)',
    description: 'Sponsor split batch — revenue share distribution',
    state: 'authorized',
    date: 'Feb 19, 2026',
    ruleStatus: 'passed',
    auditComplete: false,
  },
  {
    id: 'led-6',
    eventId: 'evt-006',
    walletId: 'wal-1',
    amount: 2500,
    type: 'debit',
    counterparty: 'Cloud provider',
    description: 'Infrastructure — January invoice (settled)',
    state: 'settled',
    date: 'Feb 10, 2026',
    ruleStatus: 'passed',
    auditComplete: true,
  },
];

// =============================================================================
// BUDGET BUCKETS DATA
// =============================================================================

export const BUDGET_BUCKETS: BudgetBucket[] = [
  {
    id: 'bb-1',
    name: 'Engineering',
    entityId: 'ent-2',
    hardCap: 45000,
    committed: 22400,
    spent: 18200,
    available: 22600,
  },
  {
    id: 'bb-2',
    name: 'Operations',
    entityId: 'ent-2',
    hardCap: 15000,
    committed: 8100,
    spent: 6400,
    available: 6900,
  },
  {
    id: 'bb-3',
    name: 'Legal',
    entityId: 'ent-2',
    hardCap: 12000,
    committed: 6200,
    spent: 4800,
    available: 5800,
  },
  {
    id: 'bb-4',
    name: 'Marketing',
    entityId: 'ent-2',
    hardCap: 8000,
    committed: 3500,
    spent: 2100,
    available: 4500,
  },
  {
    id: 'bb-5',
    name: 'Infrastructure',
    entityId: 'ent-2',
    hardCap: 10000,
    committed: 5100,
    spent: 3600,
    available: 4900,
  },
  {
    id: 'bb-6',
    name: 'Travel & BD',
    entityId: 'ent-2',
    hardCap: 6000,
    committed: 3800,
    spent: 2900,
    available: 2200,
  },
];

// =============================================================================
// COMMITMENTS DATA
// =============================================================================

export const COMMITMENTS: Commitment[] = [
  {
    id: 'com-1',
    title: 'Vendor Payout Batch — February',
    amount: 48200,
    status: 'approved_pending',
    entityId: 'ent-2',
    walletId: 'wal-1',
    scheduledDate: 'Feb 18, 2026',
  },
  {
    id: 'com-2',
    title: 'Legal Retainer — Q1 Compliance Review',
    amount: 4500,
    status: 'scheduled',
    entityId: 'ent-2',
    walletId: 'wal-1',
    scheduledDate: 'Mar 1, 2026',
  },
  {
    id: 'com-3',
    title: 'KaNeXT Hardware Shipment (KX-C1 Units)',
    amount: 7200,
    status: 'awaiting_release',
    entityId: 'ent-2',
    walletId: 'wal-4',
    riskFlag: 'Pending KaNeXT facilities confirmation before release',
  },
];

// =============================================================================
// REVENUE STREAMS DATA
// =============================================================================

export const REVENUE_STREAMS: RevenueStream[] = [
  {
    id: 'rev-1',
    name: 'Platform Subscriptions',
    type: 'subscription',
    gross: 24000,
    fees: 720,
    net: 23280,
    entityId: 'ent-2',
    period: 'Annual (KaNeXT)',
  },
  {
    id: 'rev-2',
    name: 'Professional Services',
    type: 'services',
    gross: 8500,
    fees: 255,
    net: 8245,
    entityId: 'ent-2',
    period: 'Feb 2026',
  },
  {
    id: 'rev-3',
    name: 'Sponsorship Revenue',
    type: 'sponsorship',
    gross: 75000,
    fees: 2250,
    net: 72750,
    entityId: 'ent-2',
    period: 'Q1 2026 (projected)',
  },
  {
    id: 'rev-4',
    name: 'Platform Fees',
    type: 'platform_fee',
    gross: 3200,
    fees: 96,
    net: 3104,
    entityId: 'ent-2',
    period: 'Feb 2026',
  },
];

// =============================================================================
// PAYMENT ITEMS DATA
// =============================================================================

export const PAYMENT_ITEMS: PaymentItem[] = [
  {
    id: 'pay-1',
    type: 'batch_item',
    amount: 48200,
    fromWallet: 'wal-1',
    toCounterparty: 'Multiple vendors (14 recipients)',
    state: 'authorized',
    impacts: 'Operating budget, vendor relationships',
    owner: 'SK',
    createdAt: 'Feb 16, 2026',
    deadline: 'Feb 18, 2026 5:00 PM ET',
  },
  {
    id: 'pay-2',
    type: 'ach',
    amount: 112450,
    fromWallet: 'wal-2',
    toCounterparty: 'Payroll provider',
    state: 'scheduled',
    impacts: 'Payroll, team morale',
    owner: 'SK',
    createdAt: 'Feb 14, 2026',
    deadline: 'Feb 18, 2026 4:00 PM ET',
  },
  {
    id: 'pay-3',
    type: 'batch_item',
    amount: 18750,
    fromWallet: 'wal-3',
    toCounterparty: 'Sponsor split recipients (12)',
    state: 'in_flight',
    impacts: 'Sponsorship obligations, partner trust',
    owner: 'SK',
    createdAt: 'Feb 17, 2026',
  },
  {
    id: 'pay-4',
    type: 'ach',
    amount: 1850,
    fromWallet: 'wal-1',
    toCounterparty: 'Cloud Infrastructure Co.',
    state: 'failed',
    owner: 'Priya Nair',
    createdAt: 'Feb 15, 2026',
    failReason: 'ACH return — invalid account number. Counterparty bank rejected.',
  },
  {
    id: 'pay-5',
    type: 'wire',
    amount: 25000,
    fromWallet: 'wal-3',
    toCounterparty: 'Valuetainment',
    state: 'settled',
    impacts: 'Sponsorship escrow funded',
    owner: 'SK',
    createdAt: 'Feb 12, 2026',
  },
];

// =============================================================================
// PAYMENT BATCHES DATA
// =============================================================================

export const PAYMENT_BATCHES: PaymentBatch[] = [
  {
    id: 'batch-1',
    name: 'Vendor Run — February',
    recipientCount: 14,
    totalAmount: 48200,
    state: 'authorized',
    approvalStatus: 'Pending founder release',
    exceptionsCount: 0,
    scheduledWindow: 'Feb 18, 2026 9:00 AM – 5:00 PM ET',
  },
  {
    id: 'batch-2',
    name: 'Payroll Run — February Cycle 1',
    recipientCount: 6,
    totalAmount: 112450,
    state: 'scheduled',
    approvalStatus: 'Auto-approved (payroll schedule)',
    exceptionsCount: 0,
    scheduledWindow: 'Feb 18, 2026 4:00 PM ET',
  },
  {
    id: 'batch-3',
    name: 'Sponsor Split — Q1 Distribution',
    recipientCount: 12,
    totalAmount: 18750,
    state: 'in_flight',
    approvalStatus: 'Released',
    exceptionsCount: 1,
  },
];

// =============================================================================
// DISPUTES DATA
// =============================================================================

export const DISPUTES: Dispute[] = [
  {
    id: 'disp-1',
    type: 'ach_return',
    amount: 1850,
    stage: 'received',
    aging: 2,
    counterparty: 'Cloud Infrastructure Co.',
    evidencePack: false,
  },
];

// =============================================================================
// RAILS EXCEPTIONS DATA
// =============================================================================

export const RAILS_EXCEPTIONS: RailsException[] = [
  {
    id: 'rex-1',
    type: 'held',
    rootCause: 'authority_rule',
    description: 'Sponsor split batch item #7 held — recipient not in approved vendor list.',
    failingRule: 'Counterparty must be pre-approved in vendor registry before payout.',
    requiredFix: 'Add recipient to approved vendor list or route through manual approval.',
    owner: 'SK',
    escalation: 'SK → Finance Lead',
  },
  {
    id: 'rex-2',
    type: 'failed',
    rootCause: 'counterparty',
    description: 'ACH return from Cloud Infrastructure Co. — invalid account number on file.',
    failingRule: 'Bank account validation failed at counterparty bank.',
    requiredFix: 'Obtain updated banking details from vendor and re-initiate payment.',
    owner: 'Priya Nair',
    escalation: 'Priya Nair → SK',
  },
];

// =============================================================================
// BOARD MEMBERS DATA
// =============================================================================

export const BOARD_MEMBERS: BoardMember[] = [
  {
    id: 'bm-1',
    name: 'Alex Morgan',
    role: 'chair',
    entityAccess: ['ent-1', 'ent-2', 'ent-3', 'ent-4', 'ent-5'],
    signatureAuthority: 'release_funds',
    lastActivity: 'Feb 17, 2026',
  },
  {
    id: 'bm-2',
    name: 'PBD (Patrick Bet-David)',
    role: 'director',
    entityAccess: ['ent-1', 'ent-2'],
    signatureAuthority: 'contract',
    lastActivity: 'Feb 12, 2026',
  },
  {
    id: 'bm-3',
    name: 'Tom Atkins',
    role: 'director',
    entityAccess: ['ent-1', 'ent-2', 'ent-3'],
    signatureAuthority: 'spend',
    lastActivity: 'Feb 10, 2026',
  },
];

// =============================================================================
// INVESTOR RECORDS DATA
// =============================================================================

export const INVESTOR_RECORDS: InvestorRecord[] = [
  {
    id: 'inv-1',
    name: 'Marcus Chen',
    type: 'angel',
    status: 'engaged',
    accessTier: 'dataroom',
    notes: 'Former D1 athletics director. Strong alignment with mission. Reviewing deck.',
    lastTouch: 'Feb 14, 2026',
  },
  {
    id: 'inv-2',
    name: 'Rachel Kim',
    firm: 'Meridian Ventures',
    type: 'fund',
    status: 'engaged',
    accessTier: 'update_only',
    notes: 'Pre-seed fund focused on sports-tech. Wants to see rails demo before committing.',
    lastTouch: 'Feb 12, 2026',
  },
  {
    id: 'inv-3',
    name: 'David Okafor',
    type: 'strategic',
    status: 'prospect',
    accessTier: 'none',
    notes: 'Connected through KaNeXT network. Runs media distribution company. Exploring strategic investment.',
    lastTouch: 'Feb 8, 2026',
  },
  {
    id: 'inv-4',
    name: 'The Harmon Group',
    type: 'family_office',
    status: 'prospect',
    accessTier: 'none',
    notes: 'Family office with HBCU portfolio. Intro through Dipo Carter. Pending initial meeting.',
    lastTouch: 'Feb 5, 2026',
  },
];

// =============================================================================
// RESOLUTIONS DATA
// =============================================================================

export const RESOLUTIONS: Resolution[] = [
  {
    id: 'res-1',
    type: 'board_consent',
    title: 'Approve Demo Rollout Plan',
    entityId: 'ent-2',
    topic: 'Authorization to proceed with KaNeXT OS Demo v2 public rollout and investor distribution.',
    status: 'approved',
    requiredVoters: ['bm-1', 'bm-2', 'bm-3'],
    votes: [
      { memberId: 'bm-1', vote: 'approve', date: 'Feb 3, 2026' },
      { memberId: 'bm-2', vote: 'approve', date: 'Feb 4, 2026' },
      { memberId: 'bm-3', vote: 'approve', date: 'Feb 4, 2026' },
    ],
  },
  {
    id: 'res-2',
    type: 'board_consent',
    title: 'Payment Rails Partner Selection',
    entityId: 'ent-2',
    topic: 'Approve selection of payment rails partner and authorize contract execution.',
    status: 'draft',
    requiredVoters: ['bm-1', 'bm-2', 'bm-3'],
  },
];

// =============================================================================
// DISTRIBUTIONS DATA
// =============================================================================

export const DISTRIBUTIONS: Distribution[] = [
  {
    id: 'dist-1',
    date: 'Mar 31, 2026',
    amount: 0,
    class: 'Common',
    status: 'scheduled',
  },
];

// =============================================================================
// LEGAL DOCS DATA
// =============================================================================

export const LEGAL_DOCS: LegalDoc[] = [
  {
    id: 'ldoc-1',
    title: 'Certificate of Incorporation — KaNeXT Inc.',
    category: 'corporate',
    subcategory: 'Formation',
    entityId: 'ent-1',
    status: 'executed',
    visibility: 'board',
    owner: 'SK',
    lastUpdated: 'Jan 10, 2026',
    version: '1.0',
  },
  {
    id: 'ldoc-2',
    title: 'IP Assignment Agreement — Contributors',
    category: 'legal',
    subcategory: 'Intellectual Property',
    entityId: 'ent-3',
    status: 'needs_signature',
    visibility: 'internal',
    owner: 'Michael Torres',
    lastUpdated: 'Feb 15, 2026',
    version: '1.1',
  },
  {
    id: 'ldoc-3',
    title: 'Mutual NDA — Standard Template',
    category: 'legal',
    subcategory: 'Confidentiality',
    entityId: 'ent-2',
    status: 'executed',
    visibility: 'specific_party',
    owner: 'Michael Torres',
    lastUpdated: 'Jan 20, 2026',
    version: '2.0',
  },
  {
    id: 'ldoc-4',
    title: 'KaNeXT Partnership Agreement',
    category: 'legal',
    subcategory: 'Contracts',
    entityId: 'ent-2',
    status: 'draft',
    visibility: 'board',
    owner: 'SK',
    lastUpdated: 'Feb 12, 2026',
    version: '0.9',
  },
  {
    id: 'ldoc-5',
    title: 'KYB Application — Payment Rails',
    category: 'rails',
    subcategory: 'Know Your Business',
    entityId: 'ent-2',
    status: 'draft',
    visibility: 'internal',
    owner: 'Aisha Okonkwo',
    lastUpdated: 'Feb 14, 2026',
    version: '1.0',
  },
  {
    id: 'ldoc-6',
    title: 'Pre-Seed SAFE Agreement',
    category: 'finance',
    subcategory: 'Investment Instruments',
    entityId: 'ent-1',
    status: 'executed',
    visibility: 'investor',
    owner: 'SK',
    lastUpdated: 'Jan 15, 2026',
    version: '1.0',
  },
  {
    id: 'ldoc-7',
    title: 'Data Processing Agreement — Cloud Provider',
    category: 'compliance',
    subcategory: 'Data Privacy',
    entityId: 'ent-2',
    status: 'executed',
    visibility: 'internal',
    owner: 'Aisha Okonkwo',
    lastUpdated: 'Jan 28, 2026',
    version: '1.0',
  },
  {
    id: 'ldoc-8',
    title: 'Trademark Filing — KaNeXT, KX-C1',
    category: 'legal',
    subcategory: 'Intellectual Property',
    entityId: 'ent-3',
    status: 'draft',
    visibility: 'internal',
    owner: 'Michael Torres',
    lastUpdated: 'Feb 16, 2026',
    version: '1.0',
  },
];

// =============================================================================
// POLICIES DATA
// =============================================================================

export const POLICIES: Policy[] = [
  {
    id: 'pol-1',
    title: 'Code of Conduct',
    status: 'published',
    version: '1.0',
    owner: 'SK',
    attestationCount: 6,
    renewCadence: 'annual',
  },
  {
    id: 'pol-2',
    title: 'Privacy Policy',
    status: 'published',
    version: '1.2',
    owner: 'Michael Torres',
    attestationCount: 6,
    renewCadence: 'annual',
  },
  {
    id: 'pol-3',
    title: 'Information Security Policy',
    status: 'review',
    version: '0.9',
    owner: 'Aisha Okonkwo',
    attestationCount: 0,
    renewCadence: 'annual',
  },
  {
    id: 'pol-4',
    title: 'Vendor Management Policy',
    status: 'approved',
    version: '1.0',
    owner: 'Priya Nair',
    attestationCount: 4,
    renewCadence: 'quarterly',
  },
  {
    id: 'pol-5',
    title: 'Financial Controls Policy',
    status: 'published',
    version: '1.1',
    owner: 'SK',
    attestationCount: 6,
    renewCadence: 'quarterly',
  },
];

// =============================================================================
// COMPLIANCE RISKS DATA
// =============================================================================

export const COMPLIANCE_RISKS: ComplianceRisk[] = [
  {
    id: 'crisk-1',
    title: 'Data Privacy — User PII handling without formal DPA chain',
    category: 'data',
    severity: 'high',
    likelihood: 0.4,
    owner: 'Aisha Okonkwo',
    mitigation: 'Complete DPA chain with all sub-processors. Implement data classification and encryption-at-rest audit.',
    residualRisk: 'Medium — mitigated once DPA chain is complete and audited.',
  },
  {
    id: 'crisk-2',
    title: 'Financial Controls — Single-signer authority on operating wallet',
    category: 'financial',
    severity: 'medium',
    likelihood: 0.3,
    owner: 'SK',
    mitigation: 'Implement dual-approval for transactions >$10K. Add board-level spend oversight for >$25K.',
    residualRisk: 'Low — dual-approval policy in place once rails partner is live.',
  },
  {
    id: 'crisk-3',
    title: 'Regulatory — NAIA/NCAA compliance for athlete data usage',
    category: 'legal',
    severity: 'medium',
    likelihood: 0.25,
    owner: 'Michael Torres',
    mitigation: 'Engage sports law counsel for compliance review. Maintain opt-in consent framework for all athlete data.',
    residualRisk: 'Low — regulatory landscape is permissive for analytics platforms at current scope.',
  },
];

// =============================================================================
// COMPLIANCE INCIDENTS DATA
// =============================================================================

export const COMPLIANCE_INCIDENTS: ComplianceIncident[] = [
  {
    id: 'cinc-1',
    type: 'security',
    severity: 'low',
    title: 'Expired API key detected in staging environment',
    description: 'Automated security scan detected an expired third-party API key in the staging environment configuration. Key was rotated immediately. No production exposure. No data access occurred.',
    status: 'closed',
    owner: 'Aisha Okonkwo',
    date: 'Feb 8, 2026',
  },
];

// =============================================================================
// PROOF ITEMS DATA
// =============================================================================

export const PROOF_ITEMS: ProofItem[] = [
  {
    id: 'proof-1',
    title: 'KaNeXT OS Demo v1 Walkthrough',
    type: 'video',
    category: 'product',
    status: 'verified',
    verificationLevel: 'evidence_backed',
    owner: 'Jordan Ellis',
    tags: ['demo', 'product', 'sports-mode', 'business-mode'],
    usedInPacks: 3,
    rights: 'owned',
    duration: '8:42',
    lastUpdated: 'Feb 10, 2026',
  },
  {
    id: 'proof-2',
    title: 'KaNeXT Partnership LOI (Redacted)',
    type: 'pdf',
    category: 'partnerships',
    status: 'restricted',
    verificationLevel: 'third_party_validated',
    owner: 'SK',
    tags: ['fmu', 'partnership', 'loi', 'traction'],
    usedInPacks: 2,
    rights: 'owned',
    lastUpdated: 'Feb 1, 2026',
  },
  {
    id: 'proof-3',
    title: 'BTW Classic — Live Coverage Screenshot',
    type: 'image',
    category: 'traction',
    status: 'published',
    verificationLevel: 'evidence_backed',
    owner: 'SK',
    tags: ['btw-classic', 'espn', 'live-coverage', 'media-value'],
    usedInPacks: 2,
    rights: 'permissioned',
    lastUpdated: 'Feb 13, 2026',
  },
  {
    id: 'proof-4',
    title: 'Platform Uptime Dashboard — 30d',
    type: 'link',
    category: 'product',
    status: 'verified',
    verificationLevel: 'system_generated',
    owner: 'Aisha Okonkwo',
    tags: ['uptime', 'reliability', 'infrastructure'],
    usedInPacks: 1,
    rights: 'owned',
    lastUpdated: 'Feb 15, 2026',
  },
  {
    id: 'proof-5',
    title: 'Coach Testimonial — KaNeXT Head Coach',
    type: 'audio',
    category: 'outcomes',
    status: 'draft',
    verificationLevel: 'self_reported',
    owner: 'SK',
    tags: ['testimonial', 'fmu', 'coaching', 'social-proof'],
    usedInPacks: 0,
    rights: 'permissioned',
    duration: '3:15',
    lastUpdated: 'Feb 14, 2026',
  },
  {
    id: 'proof-6',
    title: 'Financial Model — Revenue Projections',
    type: 'pdf',
    category: 'financial',
    status: 'restricted',
    verificationLevel: 'self_reported',
    owner: 'Priya Nair',
    tags: ['financial-model', 'revenue', 'projections', 'investor'],
    usedInPacks: 2,
    rights: 'owned',
    lastUpdated: 'Feb 11, 2026',
  },
];

// =============================================================================
// PROOF PACKS DATA
// =============================================================================

export const PROOF_PACKS: ProofPack[] = [
  {
    id: 'pack-1',
    title: 'Investor Proof Pack — Pre-Seed',
    audience: 'investor',
    status: 'published',
    narrative: 'KaNeXT is building governed intelligence infrastructure for athletic institutions. Here is the evidence of product-market fit, traction, and team capability.',
    sections: [
      { claim: 'Working product with live deployment', proofIds: ['proof-1', 'proof-4'] },
      { claim: 'Institutional traction with KaNeXT partnership', proofIds: ['proof-2', 'proof-3'] },
      { claim: 'Revenue model validated with financial projections', proofIds: ['proof-6'] },
    ],
    lastShared: 'Feb 14, 2026',
    viewerCount: 4,
  },
  {
    id: 'pack-2',
    title: 'Partner Proof Pack — Institutional',
    audience: 'partner',
    status: 'published',
    narrative: 'KaNeXT OS delivers measurable value to athletic programs through intelligence, governance, and media amplification.',
    sections: [
      { claim: 'Platform reliability and performance', proofIds: ['proof-4'] },
      { claim: 'Live deployment and media coverage', proofIds: ['proof-3', 'proof-1'] },
      { claim: 'Coach and staff endorsement', proofIds: ['proof-5'] },
    ],
    lastShared: 'Feb 12, 2026',
    viewerCount: 2,
  },
  {
    id: 'pack-3',
    title: 'Bank Proof Pack — KYB Support',
    audience: 'bank',
    status: 'draft',
    narrative: 'Supporting documentation for KaNeXT Inc. KYB application, demonstrating legitimate business operations and revenue.',
    sections: [
      { claim: 'Active business with institutional clients', proofIds: ['proof-2'] },
      { claim: 'Financial projections and revenue model', proofIds: ['proof-6'] },
      { claim: 'Product in active use', proofIds: ['proof-1', 'proof-4'] },
    ],
  },
  {
    id: 'pack-4',
    title: 'Product Demo Pack',
    audience: 'customer',
    status: 'published',
    narrative: 'See KaNeXT OS in action across Sports Mode, Business Mode, and Payment Rails.',
    sections: [
      { claim: 'Full platform walkthrough', proofIds: ['proof-1'] },
      { claim: 'Real deployment with live data', proofIds: ['proof-3'] },
    ],
    lastShared: 'Feb 15, 2026',
    viewerCount: 12,
  },
  {
    id: 'pack-5',
    title: 'Team & Operations Pack',
    audience: 'board',
    status: 'published',
    narrative: 'Overview of KaNeXT team capabilities, operational maturity, and governance posture.',
    sections: [
      { claim: 'Technical infrastructure and reliability', proofIds: ['proof-4'] },
      { claim: 'Institutional partnerships active', proofIds: ['proof-2', 'proof-3'] },
      { claim: 'Financial controls and projections', proofIds: ['proof-6'] },
    ],
    lastShared: 'Feb 12, 2026',
    viewerCount: 3,
  },
];

// =============================================================================
// DATA ROOM PACKETS DATA
// =============================================================================

export const DATA_ROOM_PACKETS: DataRoomPacket[] = [
  {
    id: 'drp-1',
    title: 'Investor Short Pack',
    type: 'investor_short',
    status: 'published',
    docIds: ['dr-1', 'dr-2', 'dr-3', 'dr-5'],
    lastShared: 'Feb 14, 2026',
    viewerCount: 6,
  },
  {
    id: 'drp-2',
    title: 'Board Pack — Q1 2026',
    type: 'board',
    status: 'published',
    docIds: ['dr-6', 'dr-7', 'dr-8', 'dr-9', 'dr-10'],
    lastShared: 'Feb 12, 2026',
    viewerCount: 3,
  },
  {
    id: 'drp-3',
    title: 'Bank KYB Pack',
    type: 'bank',
    status: 'draft',
    docIds: ['dr-4', 'dr-5'],
  },
  {
    id: 'drp-4',
    title: 'Partner Pack — KaNeXT',
    type: 'partner',
    status: 'published',
    docIds: ['dr-1', 'dr-3'],
    lastShared: 'Feb 10, 2026',
    viewerCount: 2,
  },
];

// =============================================================================
// DATA ROOM REQUESTS DATA
// =============================================================================

export const DATA_ROOM_REQUESTS: DataRoomRequest[] = [
  {
    id: 'drr-1',
    requester: 'Rachel Kim (Meridian Ventures)',
    description: 'Requesting updated financial model with February actuals, customer acquisition cost breakdown, and 3-year revenue projections.',
    dueDate: 'Feb 22, 2026',
    owner: 'SK',
    status: 'in_progress',
    attachments: ['Financial Model v2.1 (outdated)'],
  },
  {
    id: 'drr-2',
    requester: 'Banking Partner — Compliance Team',
    description: 'KYB supplementary documentation: proof of business address, beneficial ownership declaration, and articles of incorporation.',
    dueDate: 'Feb 25, 2026',
    owner: 'Aisha Okonkwo',
    status: 'open',
  },
];

// =============================================================================
// ENTITIES DATA
// =============================================================================

export const ENTITIES: BusinessEntity[] = [
  {
    id: 'ent-1',
    name: 'KaNeXT HoldCo',
    type: 'holdco',
    status: 'active',
    governanceStatus: 'green',
    complianceStatus: 'green',
    railsStatus: 'connected',
    docsComplete: 8,
    docsMissing: 1,
    peopleAssigned: 3,
    keyRolesMissing: 0,
    activeDeals: 0,
    pendingSignatures: 0,
    inflow30d: 0,
    outflow30d: 0,
    exceptionsCount: 0,
    owner: 'SK',
    lastActivity: 'Feb 17, 2026',
  },
  {
    id: 'ent-2',
    name: 'KaNeXT Operations',
    type: 'opsco',
    status: 'active',
    governanceStatus: 'green',
    complianceStatus: 'green',
    railsStatus: 'connected',
    docsComplete: 14,
    docsMissing: 2,
    peopleAssigned: 6,
    keyRolesMissing: 1,
    activeDeals: 2,
    pendingSignatures: 2,
    inflow30d: 37000,
    outflow30d: 179400,
    exceptionsCount: 2,
    owner: 'SK',
    lastActivity: 'Feb 17, 2026',
  },
  {
    id: 'ent-3',
    name: 'KaNeXT IP',
    type: 'ipco',
    status: 'active',
    governanceStatus: 'green',
    complianceStatus: 'yellow',
    railsStatus: 'offline',
    docsComplete: 4,
    docsMissing: 2,
    peopleAssigned: 2,
    keyRolesMissing: 0,
    activeDeals: 0,
    pendingSignatures: 2,
    inflow30d: 0,
    outflow30d: 0,
    exceptionsCount: 0,
    owner: 'SK',
    lastActivity: 'Feb 16, 2026',
  },
  {
    id: 'ent-4',
    name: 'Valuetainment',
    type: 'relationship',
    status: 'active',
    governanceStatus: 'green',
    complianceStatus: 'green',
    railsStatus: 'limited',
    docsComplete: 3,
    docsMissing: 0,
    peopleAssigned: 1,
    keyRolesMissing: 0,
    activeDeals: 1,
    pendingSignatures: 0,
    inflow30d: 25000,
    outflow30d: 18750,
    exceptionsCount: 1,
    owner: 'SK',
    lastActivity: 'Feb 17, 2026',
  },
  {
    id: 'ent-5',
    name: 'Sliema Wanderers FC',
    type: 'asset',
    status: 'under_evaluation',
    governanceStatus: 'yellow',
    complianceStatus: 'yellow',
    railsStatus: 'offline',
    docsComplete: 1,
    docsMissing: 5,
    peopleAssigned: 0,
    keyRolesMissing: 3,
    activeDeals: 1,
    pendingSignatures: 0,
    inflow30d: 0,
    outflow30d: 0,
    exceptionsCount: 0,
    owner: 'SK',
    lastActivity: 'Feb 5, 2026',
  },
];

// =============================================================================
// ALERTS DATA
// =============================================================================

export const ALERTS: BusinessAlert[] = [
  {
    id: 'alert-1',
    type: 'blocker',
    severity: 'critical',
    title: 'Payment rails KYC flow not finalized',
    description: 'Blocks rails demo, demo video production, and investor follow-up calls. Partner API docs incomplete.',
    owner: 'Aisha Okonkwo',
    dueTime: 'Feb 20, 2026',
    entityId: 'ent-2',
  },
  {
    id: 'alert-2',
    type: 'approval',
    severity: 'high',
    title: 'Vendor payout batch awaiting founder release',
    description: '$48,200 vendor batch authorized and pending release. 14 recipients. Approval window closes Feb 18 5:00 PM ET.',
    owner: 'SK',
    dueTime: 'Feb 18, 2026 5:00 PM ET',
    entityId: 'ent-2',
  },
  {
    id: 'alert-3',
    type: 'due_24h',
    severity: 'critical',
    title: 'Trademark filing deadline — today',
    description: 'USPTO trademark filing for KaNeXT and KX-C1 marks must be submitted by 11:59 PM ET to preserve priority date.',
    owner: 'Michael Torres',
    dueTime: 'Feb 17, 2026 11:59 PM ET',
    entityId: 'ent-3',
  },
  {
    id: 'alert-4',
    type: 'rails_exception',
    severity: 'medium',
    title: 'ACH return — invalid account (Cloud Infrastructure Co.)',
    description: '$1,850 ACH payment returned by counterparty bank. Invalid account number on file. Needs re-route with updated banking details.',
    owner: 'Priya Nair',
    entityId: 'ent-2',
  },
  {
    id: 'alert-5',
    type: 'compliance_risk',
    severity: 'high',
    title: 'IP assignment agreements unsigned',
    description: 'Contributor IP assignment agreements pending signature. Required before investor data room sharing and trademark filings.',
    owner: 'Michael Torres',
    entityId: 'ent-3',
  },
  {
    id: 'alert-6',
    type: 'investor_risk',
    severity: 'medium',
    title: 'Meridian Ventures follow-up overdue',
    description: 'Rachel Kim (Meridian Ventures) requested updated financial model 5 days ago. Delayed response risks losing fund engagement.',
    owner: 'SK',
    entityId: 'ent-1',
  },
];

// =============================================================================
// FEED ITEMS DATA
// =============================================================================

export const FEED_ITEMS: FeedItem[] = [
  {
    id: 'feed-1',
    text: 'Vendor payout batch ($48,200) authorized — awaiting founder release.',
    timestamp: '2026-02-17T09:15:00Z',
    category: 'approval',
    deepLink: 'rails/batch-1',
  },
  {
    id: 'feed-2',
    text: 'Board Pack Review scheduled for Feb 20 with PBD and Tom.',
    timestamp: '2026-02-17T08:30:00Z',
    category: 'board',
    deepLink: 'calendar/cal-1',
  },
  {
    id: 'feed-3',
    text: 'Trademark filing deadline is today — 11:59 PM ET.',
    timestamp: '2026-02-17T08:00:00Z',
    category: 'compliance',
    deepLink: 'calendar/cal-6',
  },
  {
    id: 'feed-4',
    text: 'OS Demo v2 video cut marked at_risk — rails footage pending.',
    timestamp: '2026-02-16T16:45:00Z',
    category: 'milestone',
    deepLink: 'initiatives/init-1',
  },
  {
    id: 'feed-5',
    text: 'Sponsor split batch ($18,750) released — 12 recipients in flight.',
    timestamp: '2026-02-16T14:20:00Z',
    category: 'rails',
    deepLink: 'rails/batch-3',
  },
  {
    id: 'feed-6',
    text: 'Live Demo Office Hours confirmed for Feb 22 at 12:00 PM ET.',
    timestamp: '2026-02-16T11:00:00Z',
    category: 'demo',
    deepLink: 'calendar/cal-8',
  },
  {
    id: 'feed-7',
    text: 'ACH return detected — Cloud Infrastructure Co. ($1,850). Re-route needed.',
    timestamp: '2026-02-15T17:30:00Z',
    category: 'rails',
    deepLink: 'rails/pay-4',
  },
  {
    id: 'feed-8',
    text: 'Investor Proof Pack shared with Marcus Chen (angel) — 4 total viewers.',
    timestamp: '2026-02-14T15:00:00Z',
    category: 'public',
    deepLink: 'proof/pack-1',
  },
  {
    id: 'feed-9',
    text: 'Payroll run ($112,450) scheduled for Feb 18 at 4:00 PM ET.',
    timestamp: '2026-02-14T10:00:00Z',
    category: 'approval',
    deepLink: 'rails/batch-2',
  },
  {
    id: 'feed-10',
    text: 'Board resolution "Approve Demo Rollout Plan" — approved unanimously.',
    timestamp: '2026-02-04T14:00:00Z',
    category: 'board',
    deepLink: 'resolutions/res-1',
  },
];

// =============================================================================
// PINNED ITEMS DATA
// =============================================================================

export const PINNED_ITEMS: PinnedItem[] = [
  {
    id: 'pin-1',
    title: 'Board Room',
    type: 'room',
    hasBlocker: false,
    dueSoon: true,
  },
  {
    id: 'pin-2',
    title: 'Fundraising Workspace',
    type: 'workspace',
    hasBlocker: false,
    dueSoon: false,
  },
  {
    id: 'pin-3',
    title: 'Pre-Seed SAFE (Term Sheet)',
    type: 'doc',
    hasBlocker: false,
    dueSoon: false,
  },
  {
    id: 'pin-4',
    title: 'Budget Overview — Q1',
    type: 'finance_view',
    hasBlocker: false,
    dueSoon: true,
  },
  {
    id: 'pin-5',
    title: 'Settlement Queue',
    type: 'rails_view',
    hasBlocker: true,
    dueSoon: true,
  },
];

// =============================================================================
// V2 HELPERS
// =============================================================================

export function getCalendarEvents(category?: BusinessCalendarEvent['category']): BusinessCalendarEvent[] {
  if (!category) return CALENDAR_EVENTS;
  return CALENDAR_EVENTS.filter((e) => e.category === category);
}

export function getInitiatives(status?: Initiative['status']): Initiative[] {
  if (!status) return INITIATIVES;
  return INITIATIVES.filter((i) => i.status === status);
}

export function getProjectsByInitiative(initiativeId: string): Project[] {
  return PROJECTS.filter((p) => p.initiativeId === initiativeId);
}

export function getBlockers(severity?: Blocker['severity']): Blocker[] {
  if (!severity) return BLOCKERS;
  return BLOCKERS.filter((b) => b.severity === severity);
}

export function getDecisionPackets(status?: DecisionPacket['status']): DecisionPacket[] {
  if (!status) return DECISION_PACKETS;
  return DECISION_PACKETS.filter((d) => d.status === status);
}

export function getWalletsByEntity(entityId: string): Wallet[] {
  return WALLETS.filter((w) => w.entityId === entityId);
}

export function getLedgerByWallet(walletId: string): LedgerEntry[] {
  return LEDGER_ENTRIES.filter((l) => l.walletId === walletId);
}

export function getPaymentsByState(state: PaymentState): PaymentItem[] {
  return PAYMENT_ITEMS.filter((p) => p.state === state);
}

export function getExceptions(): RailsException[] {
  return RAILS_EXCEPTIONS;
}

export function getEntities(status?: BusinessEntity['status']): BusinessEntity[] {
  if (!status) return ENTITIES;
  return ENTITIES.filter((e) => e.status === status);
}

export function getEntityById(id: string): BusinessEntity | undefined {
  return ENTITIES.find((e) => e.id === id);
}

export function getAlerts(): BusinessAlert[] {
  return ALERTS;
}

export function getFeedItems(category?: FeedItem['category']): FeedItem[] {
  if (!category) return FEED_ITEMS;
  return FEED_ITEMS.filter((f) => f.category === category);
}
