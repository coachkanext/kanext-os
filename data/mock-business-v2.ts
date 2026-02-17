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
  keyDeal: 'FMU Partnership Track',
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
    name: 'FMU Partnership Track',
    type: 'partnership',
    status: 'diligence',
    targetOrg: 'Florida Memorial University',
    description: 'Strategic partnership to deploy KaNeXT OS as the primary athletics intelligence platform for FMU. Includes coaching tools, analytics, and roster management.',
    keyContacts: [
      { name: 'FMU Athletic Director', role: 'Primary contact' },
      { name: 'FMU Facilities Manager', role: 'Venue coordination' },
    ],
    timeline: [
      { date: 'Jan 20, 2026', event: 'Initial partnership meeting' },
      { date: 'Jan 25, 2026', event: 'Athletics department sign-off' },
      { date: 'Feb 1, 2026', event: 'OS deployment begins (13 sports)' },
      { date: 'Feb 12, 2026', event: 'BTW Classic venue walkthrough' },
      { date: 'Q2 2026', event: 'Full deployment complete (target)' },
    ],
    rationale: 'FMU is the ideal proof wedge for Sports Mode. NAIA program competing against D1 opponents on ESPN+ creates massive media value at zero cost to the institution. Coach-built roster via KaNeXT Engines powers the intelligence layer.',
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
    description: 'Potential acquisition of Maltese Premier League club. Exploring governance structure, valuation, and regulatory requirements with the Malta Football Association.',
    keyContacts: [
      { name: 'Mario Camilleri', role: 'Club President' },
      { name: 'Dr. Anne Vassallo', role: 'Legal Counsel (Malta)' },
      { name: 'James Borg', role: 'Maltese FA Liaison' },
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
    name: 'Sammy Kalejaiye',
    role: 'Founder / CEO',
    department: 'Executive',
    type: 'leadership',
    bio: 'Former collegiate coach turned sports-tech founder. Building governed intelligence infrastructure for athletic institutions.',
    public: true,
  },
  {
    id: 'tm-2',
    name: 'Dipo Kalejaiye',
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
    summary: 'Demo environment launched. FMU diligence in progress. Pre-seed conversations opened with 4 angel investors. Platform uptime at 99.7%.',
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
    summary: 'Entity incorporated (Delaware C-Corp). KaNeXT OS core architecture established. First advisor confirmed. FMU intro meeting completed.',
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
    name: 'Florida Memorial University',
    stage: 'Diligence',
    type: 'partnership',
    status: 'active',
  },
  {
    id: 'pip-2',
    name: 'ICCLA (Independent Christian Collegiate League of Athletics)',
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
    name: 'Lincoln University (PA)',
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
