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
  {
    id: 'engine-00',
    name: 'Engine 00 \u2014 Coach Master Input',
    purpose: 'Captures and structures the head coach\'s philosophy, system preferences, and strategic priorities into a machine-readable context that all downstream engines consume.',
    inputs: ['Offensive/defensive style selections', 'Tempo preference', 'Cluster weight priorities', 'Position importance rankings', 'Recruiting biases'],
    outputs: ['ProgramContext object', 'System identity vector', 'Weighted cluster profile'],
    whyItMatters: ['Every decision KaNeXT makes is filtered through the coach\'s philosophy', 'Eliminates generic recommendations \u2014 everything is contextual'],
  },
  {
    id: 'engine-01',
    name: 'Engine 01 \u2014 Player Evaluation',
    purpose: 'Evaluates individual players across 7 canonical clusters and their subclusters, producing a KaNeXT Rating (KR) for each player.',
    inputs: ['Game stats', 'Practice observations', 'Physical measurables', 'Coach assessments'],
    outputs: ['Player KR (0-100)', 'Cluster ratings', 'Subcluster breakdowns', 'Trend trajectories'],
    whyItMatters: ['Standardized player comparison across programs', 'Data-backed roster construction decisions'],
  },
  {
    id: 'engine-02',
    name: 'Engine 02 \u2014 Team Evaluation',
    purpose: 'Rolls up player-level truth into team-level intelligence: Team KR, offensive/defensive ratings, and roster composition analysis.',
    inputs: ['All player KRs', 'Minutes distribution', 'Usage rates', 'Lineup combinations'],
    outputs: ['Team KR', 'Team Offensive KR (53%)', 'Team Defensive KR (47%)', '7 team cluster ratings'],
    whyItMatters: ['Reveals true team identity vs. coach perception', 'Identifies roster gaps and depth weaknesses'],
  },
  {
    id: 'engine-03',
    name: 'Engine 03 \u2014 Global Evaluation',
    purpose: 'Evaluates opponents and the broader competitive landscape using the same canonical cluster framework.',
    inputs: ['Opponent game data', 'Conference statistics', 'National rankings', 'Historical matchup data'],
    outputs: ['Opponent KR profiles', 'Matchup differential analysis', 'Conference power rankings'],
    whyItMatters: ['Apples-to-apples comparison with any opponent', 'Pregame intel grounded in the same truth system'],
  },
  {
    id: 'engine-04',
    name: 'Engine 04 \u2014 Scouting',
    purpose: 'Powers the recruiting pipeline by evaluating prospects against the program\'s specific needs, philosophy, and cluster priorities.',
    inputs: ['Prospect profiles', 'Highlight film metadata', 'Academic eligibility', 'ProgramContext priorities'],
    outputs: ['Prospect fit scores', 'Cluster-gap recommendations', 'Recruiting board rankings'],
    whyItMatters: ['Recruits are evaluated against YOUR system, not generic rankings', 'Finds undervalued prospects that fit your philosophy'],
  },
  {
    id: 'engine-05',
    name: 'Engine 05 \u2014 Simulation',
    purpose: 'Runs probabilistic game simulations using team/opponent KR profiles, matchup differentials, and coaching context.',
    inputs: ['Home/away team profiles', 'Roster availability', 'Historical performance', 'ProgramContext'],
    outputs: ['Win probability', 'Projected score', 'Player impact projections', 'Key matchup analysis'],
    whyItMatters: ['Pregame preparation grounded in data, not gut feel', 'What-if scenarios for lineup decisions'],
  },
  {
    id: 'engine-06',
    name: 'Engine 06 \u2014 Development',
    purpose: 'Tracks player growth trajectories over time and recommends development priorities based on program needs.',
    inputs: ['Historical player KRs', 'Practice data', 'Game trend analysis', 'Program needs from Engine 02'],
    outputs: ['Growth trajectories', 'Development priority recommendations', 'Projected future KRs'],
    whyItMatters: ['Turns player development from intuition into a measurable process', 'Connects individual growth to team-level impact'],
  },
];

// =============================================================================
// DOCUMENTS V2
// =============================================================================

export const DOCUMENTS_V2: DocumentV2[] = [
  // Investor Materials
  {
    id: 'doc-v2-1',
    title: 'Series Seed Pitch Deck',
    description: 'Q1 2026 investor presentation',
    category: 'investor_materials',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-28'),
    tags: ['pitch', 'fundraising', 'Q1-2026'],
    summary: 'Comprehensive pitch deck covering market opportunity, product demo, traction, team, and ask for the pre-seed round.',
    attachments: [],
  },
  {
    id: 'doc-v2-2',
    title: 'Financial Model',
    description: '5-year projections and unit economics',
    category: 'financial',
    visibility: 'founder',
    fileType: 'xls',
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2026-01-20'),
    tags: ['financial', 'projections', 'unit-economics'],
    summary: 'Bottom-up financial model with cohort-based revenue projections, CAC/LTV analysis, and burn rate scenarios.',
    attachments: [],
  },
  {
    id: 'doc-v2-3',
    title: 'Cap Table',
    description: 'Current ownership and option pool',
    category: 'financial',
    visibility: 'founder',
    fileType: 'xls',
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2026-01-05'),
    tags: ['cap-table', 'equity', 'ownership'],
    summary: 'Full capitalization table showing founder equity, advisor grants, and reserved option pool.',
    attachments: [],
  },
  {
    id: 'doc-v2-4',
    title: 'Product Demo Video',
    description: 'KaNeXT OS walkthrough for investors',
    category: 'investor_materials',
    visibility: 'investor',
    fileType: 'link',
    url: 'https://kanext.io/demo',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
    tags: ['demo', 'video', 'product'],
    summary: 'Guided walkthrough of KaNeXT OS Sports domain showing live game operations, recruiting board, and Nexus intelligence.',
    attachments: [],
  },
  // Governance
  {
    id: 'doc-v2-5',
    title: 'Certificate of Formation',
    description: 'Florida LLC formation documents',
    category: 'governance',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    tags: ['formation', 'legal', 'florida'],
    summary: 'Official certificate of formation for KaNeXT Operations LLC filed with the Florida Division of Corporations.',
    attachments: [],
  },
  {
    id: 'doc-v2-6',
    title: 'Operating Agreement',
    description: 'LLC operating agreement and amendments',
    category: 'governance',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2025-08-01'),
    tags: ['operating-agreement', 'legal', 'governance'],
    summary: 'Multi-member LLC operating agreement defining management structure, profit distribution, and decision-making authority.',
    attachments: [],
  },
  {
    id: 'doc-v2-7',
    title: 'Board Meeting Minutes',
    description: 'Q4 2025 advisory board meeting',
    category: 'governance',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2025-12-15'),
    updatedAt: new Date('2025-12-15'),
    tags: ['board', 'minutes', 'Q4-2025'],
    summary: 'Summary of Q4 advisory board discussion covering product roadmap, fundraising timeline, and go-to-market strategy.',
    attachments: [],
  },
  {
    id: 'doc-v2-8',
    title: 'Investor Rights Agreement',
    description: 'Pre-seed investor rights',
    category: 'legal',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01'),
    tags: ['investor-rights', 'legal', 'pre-seed'],
    summary: 'Standard investor rights agreement covering information rights, pro-rata participation, and board observer seat.',
    attachments: [],
  },
  // Institutional
  {
    id: 'doc-v2-9',
    title: 'Company Overview',
    description: 'KaNeXT at a glance',
    category: 'institutional_brief',
    visibility: 'public',
    fileType: 'pdf',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2026-01-01'),
    tags: ['overview', 'one-pager'],
    summary: 'One-page overview of KaNeXT \u2014 mission, product, market, and traction summary for general audiences.',
    attachments: [],
  },
  {
    id: 'doc-v2-10',
    title: 'Market Analysis',
    description: 'TAM/SAM/SOM breakdown by vertical',
    category: 'institutional_brief',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-12-01'),
    tags: ['market', 'tam', 'sam', 'som'],
    summary: 'Detailed market sizing across all four verticals with bottom-up TAM/SAM/SOM analysis and competitive landscape.',
    attachments: [],
  },
  // Roadmap / Product
  {
    id: 'doc-v2-11',
    title: '2026 Product Roadmap',
    description: 'Feature timeline and milestones',
    category: 'product',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2026-01-15'),
    tags: ['roadmap', '2026', 'product'],
    summary: 'Quarter-by-quarter feature roadmap showing Sports domain completion, Enterprise v2 launch, and multi-domain expansion.',
    attachments: [],
  },
  {
    id: 'doc-v2-12',
    title: 'Technical Architecture',
    description: 'System design and infrastructure',
    category: 'product',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-11-15'),
    tags: ['architecture', 'technical', 'infrastructure'],
    summary: 'Three-layer architecture overview (Reality \u2192 Intelligence \u2192 Nexus) with technology stack decisions and scaling strategy.',
    attachments: [],
  },
  // New v2 docs
  {
    id: 'doc-v2-13',
    title: 'FMU Proof Event Report',
    description: 'Live proof event progress and findings',
    category: 'proof',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-02-10'),
    tags: ['proof', 'fmu', 'sports', 'traction'],
    proofEventId: 'pe-fmu',
    summary: 'Detailed report on the FMU men\'s basketball proof event \u2014 KPIs, milestones achieved, product validation findings, and next steps.',
    attachments: ['fmu-kpi-dashboard.png', 'game-ops-screenshots.pdf'],
  },
  {
    id: 'doc-v2-14',
    title: 'IP Assignment Agreement',
    description: 'Intellectual property assignment to KaNeXT',
    category: 'ip',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    tags: ['ip', 'legal', 'assignment'],
    summary: 'Assignment of all founder-created intellectual property (code, algorithms, designs) to KaNeXT Operations LLC.',
    attachments: [],
  },
  {
    id: 'doc-v2-15',
    title: 'Canonical Engine Library \u2014 Spec',
    description: 'Engine 00-06 specification document',
    category: 'engines',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2026-02-01'),
    tags: ['engines', 'spec', 'canonical', 'architecture'],
    summary: 'Complete specification for all 7 canonical engines (00-06) \u2014 inputs, outputs, scoring methodology, and integration points.',
    attachments: ['engine-flow-diagram.pdf'],
  },
  {
    id: 'doc-v2-16',
    title: 'SAFE Note \u2014 Pre-Seed',
    description: 'Simple Agreement for Future Equity',
    category: 'legal',
    visibility: 'founder',
    fileType: 'pdf',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2026-01-15'),
    tags: ['safe', 'fundraising', 'legal', 'pre-seed'],
    summary: 'YC-standard SAFE note with valuation cap for the pre-seed round. Post-money SAFE structure.',
    attachments: [],
  },
  {
    id: 'doc-v2-17',
    title: 'GII \u2014 Global Intelligence Index',
    description: 'Proprietary competitive intelligence framework',
    category: 'ip',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2026-01-20'),
    tags: ['gii', 'ip', 'moat', 'intelligence'],
    summary: 'Overview of the Global Intelligence Index \u2014 KaNeXT\'s proprietary framework for cross-domain organizational intelligence scoring.',
    attachments: [],
  },
  {
    id: 'doc-v2-18',
    title: 'Revenue Model & Pricing',
    description: 'SaaS pricing tiers and revenue strategy',
    category: 'financial',
    visibility: 'investor',
    fileType: 'pdf',
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2026-02-01'),
    tags: ['revenue', 'pricing', 'saas', 'strategy'],
    summary: 'Tiered SaaS pricing model for Sports domain, API licensing structure, and long-term data licensing revenue projections.',
    attachments: [],
  },
];

// =============================================================================
// REVENUE STREAMS
// =============================================================================

export const REVENUE_STREAMS: RevenueStream[] = [
  {
    id: 'rev-1',
    name: 'Platform SaaS',
    description: 'Subscription-based access to KaNeXT OS for sports programs. Tiered by program size, division level, and feature set.',
    pricing: '$500\u2013$5,000/mo per program',
    status: 'beta',
  },
  {
    id: 'rev-2',
    name: 'Intelligence API',
    description: 'Programmatic access to KaNeXT evaluation engines, simulation outputs, and rating data for third-party integrations.',
    pricing: 'Usage-based metered billing',
    status: 'planned',
  },
  {
    id: 'rev-3',
    name: 'Data Licensing',
    description: 'Aggregated, anonymized organizational intelligence data licensed to conferences, media companies, and analytics firms.',
    pricing: 'Enterprise contract',
    status: 'planned',
  },
  {
    id: 'rev-4',
    name: 'Premium Consulting',
    description: 'White-glove implementation and strategic advisory for enterprise clients deploying KaNeXT across multiple programs.',
    pricing: 'Project-based',
    status: 'planned',
  },
];

// =============================================================================
// COMPETITIVE ADVANTAGES
// =============================================================================

export const COMPETITIVE_ADVANTAGES: CompetitiveAdvantage[] = [
  {
    id: 'moat-1',
    title: 'Global Intelligence Index (GII)',
    description: 'Proprietary cross-domain intelligence framework that enables apples-to-apples comparison across organizations, sports, and verticals. No competitor has a unified evaluation ontology.',
  },
  {
    id: 'moat-2',
    title: 'Canonical Engine Library',
    description: '7 purpose-built evaluation engines (00-06) that form a closed-loop intelligence system. Each engine\'s output feeds the next, creating compounding data value over time.',
  },
  {
    id: 'moat-3',
    title: 'Coach-First Architecture',
    description: 'Every recommendation is filtered through the coach\'s actual philosophy (Engine 00). This eliminates generic analytics and creates sticky, personalized intelligence.',
  },
  {
    id: 'moat-4',
    title: 'Multi-Domain Platform',
    description: 'Single platform spanning Sports, Enterprise, Church, and Education verticals. Shared infrastructure reduces marginal cost of entering new verticals to near-zero.',
  },
];

// =============================================================================
// FUNDRAISING
// =============================================================================

export const FUNDRAISING: FundraisingRound[] = [
  {
    id: 'round-preseed',
    name: 'Pre-Seed',
    status: 'active',
    targetAmount: 500000,
    raisedAmount: 0,
    closingDate: '2026-Q2',
    summary: 'Raising $500K via post-money SAFE to fund completion of Sports domain proof event, hire first engineer, and launch 3 paid pilots.',
  },
];

// =============================================================================
// ARCHITECTURE LAYERS
// =============================================================================

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    id: 'layer-reality',
    name: 'Reality Layer',
    description: 'Structured ground-truth data \u2014 rosters, schedules, stats, game results, organizational records. The single source of what IS.',
    icon: 'square.stack.3d.up.fill',
  },
  {
    id: 'layer-intelligence',
    name: 'Intelligence Layer',
    description: 'Canonical engines (00-06) that evaluate, compare, simulate, and project based on reality data filtered through coaching context.',
    icon: 'brain',
  },
  {
    id: 'layer-nexus',
    name: 'Nexus Layer',
    description: 'Conversational AI interface that translates intelligence outputs into actionable coaching decisions via natural language.',
    icon: 'sparkles',
  },
];

// =============================================================================
// RECENT UPDATES
// =============================================================================

export const RECENT_UPDATES: RecentUpdate[] = [
  {
    id: 'update-1',
    title: 'Proof Event KPIs Updated',
    description: 'FMU proof event metrics refreshed \u2014 24 games tracked, 78% sim accuracy.',
    timestamp: new Date('2026-02-14'),
    type: 'metric',
  },
  {
    id: 'update-2',
    title: 'Recruiting Board Milestone',
    description: '47 prospects in pipeline \u2014 exceeded 40-prospect milestone.',
    timestamp: new Date('2026-02-10'),
    type: 'milestone',
  },
  {
    id: 'update-3',
    title: 'Pitch Deck Revised',
    description: 'Updated Q1 2026 investor deck with latest traction data.',
    timestamp: new Date('2026-01-28'),
    type: 'document',
  },
  {
    id: 'update-4',
    title: 'Engine Spec Finalized',
    description: 'Canonical Engine Library (00-06) specification locked for v1.',
    timestamp: new Date('2026-02-01'),
    type: 'system',
  },
  {
    id: 'update-5',
    title: 'Enterprise Mode v2 Shipped',
    description: 'Investor Room, Proof Events, and Data Room live in Enterprise mode.',
    timestamp: new Date('2026-02-15'),
    type: 'milestone',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getCompanyById(id: string): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}

export function getProofEventsByCompany(companyId: string): ProofEvent[] {
  return PROOF_EVENTS.filter((pe) => pe.companyId === companyId);
}

export function getDocsByCompany(companyId: string): DocumentV2[] {
  if (companyId === 'co-kanext') return DOCUMENTS_V2;
  // OSK Group sees all founder-level docs
  return DOCUMENTS_V2.filter((d) => d.visibility === 'founder');
}

export function getDocsByCategory(category: DocumentCategory): DocumentV2[] {
  return DOCUMENTS_V2.filter((d) => d.category === category);
}

export function getCategoryLabelV2(category: DocumentCategory): string {
  const labels: Record<string, string> = {
    investor_materials: 'Investor',
    governance: 'Governance',
    institutional_brief: 'Institutional',
    roadmap: 'Roadmap',
    proof: 'Proof',
    ip: 'IP',
    financial: 'Financial',
    legal: 'Legal',
    product: 'Product',
    engines: 'Engines',
  };
  return labels[category] || category;
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'planning': return '#6E7687';
    case 'active': return '#22C55E';
    case 'completed': return '#FFFFFF';
    case 'paused': return '#F59E0B';
    default: return '#6E7687';
  }
}

export function getMilestoneStatusColor(status: string): string {
  switch (status) {
    case 'completed': return '#22C55E';
    case 'in_progress': return '#FFFFFF';
    case 'blocked': return '#EF4444';
    case 'pending': return '#6E7687';
    default: return '#6E7687';
  }
}

export function getRiskSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#EF4444';
    case 'high': return '#F59E0B';
    case 'medium': return '#EAB308';
    case 'low': return '#22C55E';
    default: return '#6E7687';
  }
}
