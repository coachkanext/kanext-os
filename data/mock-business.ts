/**
 * Mock Business Mode Data ("KaNeXT Business Mode")
 * Founder OS — proof wedges, mandates, media, settlement rails.
 * Everything mock by default. Only publicly safe identity facts allowed.
 */

import type { DocumentVisibility } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type BusinessTab =
  | 'dashboard'
  | 'roadmap'
  | 'wedges'
  | 'proof'
  | 'capital'
  | 'governance'
  | 'data-room'
  | 'rails'
  | 'ops';

export type RoleView = 'founder' | 'investor' | 'public';

export interface PowerMetric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  visibility: RoleView[];
}

export interface TodayNextItem {
  id: string;
  type: 'meeting' | 'deliverable' | 'proof';
  title: string;
  time?: string;
  status: 'upcoming' | 'in_progress' | 'done';
}

export interface RoadmapPhase {
  id: string;
  phase: number;
  title: string;
  objective: string;
  deliverables: string[];
  proofArtifacts: string[];
  risks: string[];
  successLooksLike: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface WedgeData {
  id: string;
  name: string;
  orgName: string;
  icon: string;
  color: string;
  summary: string;
  proofEvents: string[];
  advantages: string[];
  proofArtifact?: { title: string; docId: string };
  modes?: string[];
}

export interface ProofArtifact {
  id: string;
  title: string;
  subtitle: string;
  category: 'media' | 'postseason' | 'capital' | 'strategy';
  section: string;
  visibility: RoleView[];
  lastUpdated: string;
  highlights: string[];
}

export interface CapitalRound {
  id: string;
  name: string;
  status: 'closed' | 'active' | 'future';
  target?: string;
  raised?: string;
  instrument: string;
  closingDate?: string;
  summary: string;
  visibility: RoleView[];
}

export interface PBDTranche {
  id: string;
  tranche: number;
  amount: string;
  equityPct: string;
  dueDate: string;
  funded: boolean;
}

export interface UseOfFunds {
  id: string;
  bucket: string;
  allocation: string;
  pct: number;
}

export interface BoardSeat {
  id: string;
  title: string;
  holder: string;
  status: 'active' | 'pending' | 'future';
  description: string;
}

export interface DecisionClass {
  id: string;
  name: string;
  description: string;
  requiresBoard: boolean;
}

export interface DataRoomDoc {
  id: string;
  title: string;
  category: 'legal' | 'product' | 'proof' | 'partnerships' | 'finance' | 'media';
  visibility: RoleView[];
  lastUpdated: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'deck';
}

export interface MockTransaction {
  id: string;
  type: 'ticket' | 'donation' | 'payout' | 'fine' | 'subscription';
  description: string;
  amount: number;
  status: 'settled' | 'pending' | 'failed';
  date: string;
  org: string;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'advisor' | 'pending';
}

export interface Workstream {
  id: string;
  name: string;
  lead: string;
  status: 'active' | 'blocked' | 'completed';
  items: number;
  progress: number;
}

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  decisions: number;
  status: 'scheduled' | 'completed';
}

// =============================================================================
// HUB TABS
// =============================================================================

export const BUSINESS_HUB_TABS: { id: BusinessTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'wedges', label: 'Wedges' },
  { id: 'proof', label: 'Proof' },
  { id: 'capital', label: 'Capital' },
  { id: 'governance', label: 'Governance' },
  { id: 'data-room', label: 'Data Room' },
  { id: 'rails', label: 'Rails' },
  { id: 'ops', label: 'Ops' },
];

// =============================================================================
// DASHBOARD
// =============================================================================

export const BUSINESS_STATUS = {
  mode: 'Business',
  org: 'KaNeXT',
  cycle: 'FY 2026',
  build: 'v2',
  proofWedges: ['FMU', 'ICCLA', 'K-1'],
};

export const POWER_METRICS: PowerMetric[] = [
  { id: 'pm-1', label: 'Institutional Pipeline', value: '14', delta: '+3 this mo', deltaType: 'up', visibility: ['founder', 'investor', 'public']},
  { id: 'pm-2', label: 'Proof Events Scheduled', value: '7', delta: '+2 new', deltaType: 'up', visibility: ['founder', 'investor', 'public']},
  { id: 'pm-3', label: 'Mandates in Negotiation', value: '3', visibility: ['founder', 'investor']},
  { id: 'pm-4', label: 'Settlement Volume', value: '$2.4M', delta: 'YTD', deltaType: 'neutral', visibility: ['founder', 'investor']},
  { id: 'pm-5', label: 'Media Reach', value: '18.2M', delta: '+42% MoM', deltaType: 'up', visibility: ['founder', 'investor', 'public']},
  { id: 'pm-6', label: 'Runway', value: '14 mo', visibility: ['founder']},
];

export const TODAY_NEXT: TodayNextItem[] = [
  { id: 'tn-1', type: 'meeting', title: 'PBD Tranche Review Call', time: '2:00 PM', status: 'upcoming' },
  { id: 'tn-2', type: 'deliverable', title: 'FMU Media Value Deck — Final', time: 'EOD', status: 'in_progress' },
  { id: 'tn-3', type: 'proof', title: 'BTW Classic Venue Walkthrough', time: 'Tomorrow 10 AM', status: 'upcoming' },
];

export const TOP_3_MOVES: string[] = [
  'Close PBD Tranche 1 — wire by Feb 28',
  'Ship video mandate camera specs to NAIA HQ',
  'Finalize Valuetainment Classic selection committee',
];

// =============================================================================
// ROADMAP
// =============================================================================

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 'rp-0',
    phase: 0,
    title: 'OS Shell + Nexus Proof',
    objective: 'Build the universal OS shell, prove Nexus AI works as conversational intelligence layer.',
    deliverables: [
      'Multi-mode shell (Sports / Business / Church / Education / Community)',
      'Nexus voice + text AI interface',
      'Canonical Engine Library (7 engines)',
      'Luxury Control Room UI palette',
    ],
    proofArtifacts: ['KaNeXT OS v2', 'Nexus conversation logs'],
    risks: ['Scope creep across 5 modes', 'Single-developer bottleneck'],
    successLooksLike: 'A working app that switches between 5 modes with AI-powered intelligence in each.',
    status: 'completed',
  },
  {
    id: 'rp-1',
    phase: 1,
    title: 'Proof Wedge Deployment',
    objective: 'Deploy KaNeXT at 3 real institutions (FMU / ICCLA / K-1) to prove the platform works.',
    deliverables: [
      'FMU Athletics OS — full deployment (13 sports)',
      'ICCLA Church OS — giving, ministries, connect groups',
      'K-1 Competition — teams, drivers, standings, race ops',
      'Proof event calendar (BTW Classic, MLK Classic, Valuetainment Classic)',
    ],
    proofArtifacts: [
      'FMU Free Media Value Analysis',
      'BTW Classic tournament plan',
      'MLK Truth Classic tournament plan',
      'Valuetainment Classic tournament plan',
    ],
    risks: ['Institutional adoption friction', 'Budget constraints at proof sites'],
    successLooksLike: '3 institutions actively using KaNeXT, generating measurable media value and operational data.',
    status: 'active',
  },
  {
    id: 'rp-2',
    phase: 2,
    title: 'Mandate Formation',
    objective: 'Turn video mandate strategy into governing body adoption. Institutional lock-in via free cameras + platform.',
    deliverables: [
      'KaNeXT Video Mandate Strategy execution',
      'NAIA video mandate partnership',
      '1,050+ institutions onboarded via mandate',
      'KX-C1 camera deployment at scale',
    ],
    proofArtifacts: ['Video Mandate Strategy doc', 'NAIA partnership LOI', 'Camera deployment tracker'],
    risks: ['Governing body politics', 'Hardware supply chain', 'Broadcast rights conflicts'],
    successLooksLike: '500+ institutions on platform via mandate, 1.5M+ app installs at $0 CAC.',
    status: 'upcoming',
  },
  {
    id: 'rp-3',
    phase: 3,
    title: 'Settlement Rails Expansion',
    objective: 'Activate payment settlement layer across all proof wedges — tickets, donations, payouts, fines.',
    deliverables: [
      'Event settlement (ticket payments, payouts)',
      'Giving/donation rails (church mode)',
      'Fine/penalty processing (league mode)',
      'Processor integration (Stripe v1)',
    ],
    proofArtifacts: ['Settlement audit logs', 'Transaction volume reports'],
    risks: ['Payment processor compliance', 'Multi-entity settlement complexity'],
    successLooksLike: 'Real money flowing through KaNeXT rails at 3+ institutions with full audit trail.',
    status: 'upcoming',
  },
  {
    id: 'rp-4',
    phase: 4,
    title: 'Scale & Federation',
    objective: 'Scale beyond proof wedges to hundreds of institutions. Federation model for multi-org governance.',
    deliverables: [
      'Global expansion (UK/Europe, Africa, LATAM)',
      'Sport expansion (soccer, football, volleyball)',
      'Federation governance layer',
      'Institutional-grade SLA and support',
    ],
    proofArtifacts: ['Global deployment map', 'Federation governance spec'],
    risks: ['International compliance', 'Cultural adaptation', 'Operational scale'],
    successLooksLike: '10,000+ institutions worldwide, multiple sports, self-sustaining federation model.',
    status: 'upcoming',
  },
];

// =============================================================================
// WEDGES
// =============================================================================

export const WEDGES: WedgeData[] = [
  {
    id: 'w-fmu',
    name: 'FMU',
    orgName: 'Florida Memorial University',
    icon: 'sportscourt.fill',
    color: '#FFFFFF',
    summary: 'Athletics OS wedge — 13-sport NAIA program competing against D1 opponents on ESPN+. Coach-built roster via KaNeXT Engines 01, 02, 06. Projected $53M-$157M in free media value Year 1.',
    proofEvents: [
      'BTW Memorial Classic (Season Opener)',
      'Maui Invitational (3 games)',
      'MLK Truth Classic (16-team)',
      'Valuetainment Classic (32-team postseason)',
    ],
    advantages: [
      'Intelligence — 7 canonical engines powering every decision',
      'Scheduling — D1 opponents create narrative leverage',
      'Media — ESPN+ broadcasts at $0 cost to FMU',
      'Settlement — full ticket/payout rails across all events',
    ],
    proofArtifact: { title: 'FMU Free Media Value Analysis', docId: 'pa-media-1' },
  },
  {
    id: 'w-iccla',
    name: 'ICCLA',
    orgName: 'International Christian Church of Los Angeles',
    icon: 'heart.fill',
    color: '#B8C0CC',
    summary: 'Church OS wedge — multi-campus ministry operations with giving, connect groups, and ministry intelligence. "Hotline to Heaven" concept: AI-powered pastoral care surface.',
    proofEvents: [
      '40 Days Prayer & Fasting Intelligence',
      'Easter Sunday giving campaign',
      'Leadership summit',
    ],
    advantages: [
      'Giving rails — frictionless donations with real-time dashboards',
      'Ministry intelligence — attendance, engagement, growth tracking',
      'Connect groups — community formation + pastoral care',
      'Multi-campus coordination — unified operations across locations',
    ],
  },
  {
    id: 'w-k1',
    name: 'K-1',
    orgName: 'K-1 Speed Motorsport League',
    icon: 'flag.checkered',
    color: '#FF4D4D',
    summary: 'LeagueOS wedge — full motorsport league management with teams, drivers, standings, race operations, and cap enforcement. Decision audit concept for governed competition.',
    proofEvents: [
      'Season 1 Race Calendar (14 events)',
      'Championship standings tracking',
      'Race ops real-time management',
    ],
    advantages: [
      'Race operations — real-time steward decisions + audit trail',
      'Cap enforcement — budget cap compliance with automated checks',
      'Media/rights — race broadcast + highlight distribution',
      'Commerce/settlement — ticket + merchandise + prize payouts',
    ],
    modes: ['Ops', 'Team Ops', 'Car/Engineering', 'Stewarding', 'Media/Rights', 'Commerce/Settlement', 'Wildcards'],
  },
];

// =============================================================================
// PROOF ARTIFACTS
// =============================================================================

export const PROOF_ARTIFACTS: ProofArtifact[] = [
  // Media + Narrative
  {
    id: 'pa-media-1',
    title: 'FMU Free Media Value Analysis',
    subtitle: '$53M–$157M projected Year 1 media exposure',
    category: 'media',
    section: 'Proof: Media + Narrative',
    visibility: ['founder', 'investor', 'public'],
    lastUpdated: 'Feb 15, 2026',
    highlights: [
      'Men\'s Basketball: 12 D1 games incl. Maui Invitational',
      'Projected 10-12 D1 wins in Year 1',
      'All 13 sports: $53M-$157M total media value',
      '40-60 ESPN+ broadcasts across all sports',
      '$0 cost to FMU — fully subsidized by KaNeXT',
    ],
  },
  {
    id: 'pa-media-2',
    title: 'KaNeXT Video Mandate Strategy',
    subtitle: '1,050+ institutions via governing body mandates',
    category: 'strategy',
    section: 'Proof: Media + Narrative',
    visibility: ['founder', 'investor'],
    lastUpdated: 'Feb 15, 2026',
    highlights: [
      '1,050+ sub-NCAA institutions targeted (NAIA, NJCAA, CCCAA, USCAA, NCCAA)',
      '1.5M-1.8M app installs at $0 CAC in Year 1',
      'Year 1 video-driven revenue: $51M-$77M',
      'KX-C1 camera: NDAA-safe, fixed, unattended, free to every school',
      '48-hour replay standard — avoids broadcast rights conflicts',
    ],
  },
  // Postseason Products
  {
    id: 'pa-post-1',
    title: 'Valuetainment Classic',
    subtitle: '32-team postseason championship · $10M prize pool',
    category: 'postseason',
    section: 'Proof: Postseason Products',
    visibility: ['founder', 'investor', 'public'],
    lastUpdated: 'Feb 15, 2026',
    highlights: [
      '32 teams: 24 D1 at-large + 8 non-D1 champions/elites',
      '$10M total prize pool · $1.65M champion package',
      '$150K appearance guarantee per team',
      'Year 1 revenue: $14M-$39M · Year 5: $100M+',
      '"The Call" selection show on Valuetainment',
    ],
  },
  {
    id: 'pa-post-2',
    title: 'MLK Truth Classic',
    subtitle: '16-team all-level tournament · MLK Weekend',
    category: 'postseason',
    section: 'Proof: Postseason Products',
    visibility: ['founder', 'investor', 'public'],
    lastUpdated: 'Feb 15, 2026',
    highlights: [
      '16 teams across D1/D2/D3/NAIA · cross-division matchups',
      'MLK Truth Summit: speaker event on economic self-determination',
      'Year 1 revenue: $3M-$11M · Year 5: $25M-$50M+',
      'KaNeXT Engine 02 Team KR drives seeding (not division labels)',
      'Miami Gardens, FL · ESPN+ / Valuetainment broadcast',
    ],
  },
  {
    id: 'pa-post-3',
    title: 'Booker T. Washington Memorial Classic',
    subtitle: '8-team HBCU season opener + FMU vs Tuskegee football',
    category: 'postseason',
    section: 'Proof: Postseason Products',
    visibility: ['founder', 'investor', 'public'],
    lastUpdated: 'Feb 15, 2026',
    highlights: [
      '8 HBCU basketball teams + football (FMU vs Tuskegee)',
      '11 total games across 4 days at FMU campus',
      'Landmark announcement: free KaNeXT for all HBCUs',
      'Year 1 revenue: $1.5M-$5.3M (proof event)',
      'PBD co-presenter at halftime announcement',
    ],
  },
  // Capital + Structure
  {
    id: 'pa-cap-1',
    title: 'Family SAFE',
    subtitle: 'Friends & family round — inner circle capital',
    category: 'capital',
    section: 'Proof: Capital + Structure',
    visibility: ['founder', 'investor'],
    lastUpdated: 'Feb 10, 2026',
    highlights: [
      'Standard SAFE note terms',
      'Inner circle investors',
      'Bridge to co-founder round',
    ],
  },
  {
    id: 'pa-cap-2',
    title: 'PBD Co-Founder SAFE',
    subtitle: 'Strategic co-founder capital + distribution',
    category: 'capital',
    section: 'Proof: Capital + Structure',
    visibility: ['founder', 'investor'],
    lastUpdated: 'Feb 12, 2026',
    highlights: [
      'Tranche-based funding schedule',
      'Up to 10% equity at full funding',
      'Board seat activation at threshold',
      'Valuetainment distribution flywheel',
    ],
  },
  {
    id: 'pa-cap-3',
    title: 'Scaling Roadmap',
    subtitle: 'Phase 0→4 institutional expansion plan',
    category: 'strategy',
    section: 'Proof: Capital + Structure',
    visibility: ['founder', 'investor', 'public'],
    lastUpdated: 'Feb 14, 2026',
    highlights: [
      '5-phase plan from OS shell to global federation',
      '10,000+ institutions target by Phase 4',
      'Sport expansion: basketball → soccer → football → all',
      'Global: US → UK/Europe → Africa → LATAM → Asia',
    ],
  },
];

// =============================================================================
// CAPITAL
// =============================================================================

export const CAPITAL_ROUNDS: CapitalRound[] = [
  {
    id: 'cr-1',
    name: 'Family & Inner Circle',
    status: 'active',
    target: '$150K',
    raised: '$0',
    instrument: 'SAFE',
    closingDate: 'Q1 2026',
    summary: 'Friends, family, and close network. Standard SAFE notes. Bridge to strategic round.',
    visibility: ['founder', 'investor'],
  },
  {
    id: 'cr-2',
    name: 'Co-Founder SAFE (PBD)',
    status: 'active',
    target: '$500K',
    raised: '$0',
    instrument: 'SAFE + Board Seat',
    closingDate: 'Q2 2026',
    summary: 'Strategic co-founder capital with Valuetainment distribution flywheel. Tranche-based funding, board seat at threshold.',
    visibility: ['founder', 'investor'],
  },
  {
    id: 'cr-3',
    name: 'Institutional Pre-Seed',
    status: 'future',
    target: '$2M–$5M',
    instrument: 'Priced Round',
    summary: 'Post-proof institutional raise. Target: tech-forward sports/media funds with HBCU alignment.',
    visibility: ['founder'],
  },
  {
    id: 'cr-4',
    name: 'Series A',
    status: 'future',
    target: '$10M–$25M',
    instrument: 'Priced Round',
    summary: 'Scale round post-mandate execution. 1,000+ institutions, proven settlement volume, global expansion.',
    visibility: ['founder'],
  },
];

export const PBD_TRANCHES: PBDTranche[] = [
  { id: 'pt-1', tranche: 1, amount: '$100K', equityPct: '4%', dueDate: 'Mar 1, 2026', funded: false },
  { id: 'pt-2', tranche: 2, amount: '$100K', equityPct: '6%', dueDate: 'May 1, 2026', funded: false },
  { id: 'pt-3', tranche: 3, amount: '$100K', equityPct: '7%', dueDate: 'Jul 1, 2026', funded: false },
  { id: 'pt-4', tranche: 4, amount: '$100K', equityPct: '8.5%', dueDate: 'Sep 1, 2026', funded: false },
  { id: 'pt-5', tranche: 5, amount: '$100K', equityPct: '10%', dueDate: 'Nov 1, 2026', funded: false },
];

export const USE_OF_FUNDS: UseOfFunds[] = [
  { id: 'uof-1', bucket: 'Engineering & Product', allocation: '$200K', pct: 40 },
  { id: 'uof-2', bucket: 'Proof Event Operations', allocation: '$125K', pct: 25 },
  { id: 'uof-3', bucket: 'Hardware (KX-C1 Cameras)', allocation: '$75K', pct: 15 },
  { id: 'uof-4', bucket: 'Business Development', allocation: '$50K', pct: 10 },
  { id: 'uof-5', bucket: 'Legal & Compliance', allocation: '$25K', pct: 5 },
  { id: 'uof-6', bucket: 'Reserve', allocation: '$25K', pct: 5 },
];

// =============================================================================
// GOVERNANCE
// =============================================================================

export const BOARD_SEATS: BoardSeat[] = [
  { id: 'bs-1', title: 'Seat 1 — Founder', holder: 'Oluwadara (Sammy) Kalejaiye', status: 'active', description: 'Permanent founder seat. Full control over product, engineering, and operational decisions.' },
  { id: 'bs-2', title: 'Seat 2 — Co-Founder / Strategic', holder: 'Patrick Bet-David', status: 'pending', description: 'Activates at tranche threshold. Distribution, media strategy, and strategic partnership oversight.' },
  { id: 'bs-3', title: 'Seat 3 — Independent', holder: 'TBD', status: 'future', description: 'Independent board member. Activated at institutional round. Governance, audit, and fiduciary oversight.' },
];

export const DECISION_CLASSES: DecisionClass[] = [
  { id: 'dc-1', name: 'Major Capital Decisions', description: 'Any single expenditure > $50K or cumulative commitment > $100K in 90 days.', requiresBoard: true },
  { id: 'dc-2', name: 'Equity Issuance', description: 'Any new equity grant, SAFE, or convertible instrument. Includes employee options.', requiresBoard: true },
  { id: 'dc-3', name: 'Strategic Partnerships', description: 'Governing body mandates, exclusive distribution deals, co-branding agreements.', requiresBoard: true },
  { id: 'dc-4', name: 'Liquidity / Sale Events', description: 'Any acquisition, merger, asset sale, or secondary transaction.', requiresBoard: true },
];

export const GOVERNANCE_AUDIT_PRINCIPLE = 'Every governance decision = Decision object + references + immutable log. No decision exists without an audit trail.';

// =============================================================================
// DATA ROOM
// =============================================================================

export const DATA_ROOM_DOCS: DataRoomDoc[] = [
  // Legal
  { id: 'dr-1', title: 'OSK Group LLC — Operating Agreement', category: 'legal', visibility: ['founder'], lastUpdated: 'Jan 15, 2026', fileType: 'pdf' },
  { id: 'dr-2', title: 'KaNeXT Operations LLC — Operating Agreement', category: 'legal', visibility: ['founder'], lastUpdated: 'Jan 15, 2026', fileType: 'pdf' },
  { id: 'dr-3', title: 'SAFE Template — Family Round', category: 'legal', visibility: ['founder', 'investor'], lastUpdated: 'Feb 1, 2026', fileType: 'pdf' },
  { id: 'dr-4', title: 'SAFE Template — Co-Founder (PBD)', category: 'legal', visibility: ['founder', 'investor'], lastUpdated: 'Feb 10, 2026', fileType: 'pdf' },
  // Product
  { id: 'dr-5', title: 'KaNeXT OS v2 — Product Specification', category: 'product', visibility: ['founder', 'investor'], lastUpdated: 'Feb 15, 2026', fileType: 'docx' },
  { id: 'dr-6', title: 'Canonical Engine Library — Technical Spec', category: 'product', visibility: ['founder', 'investor'], lastUpdated: 'Feb 12, 2026', fileType: 'docx' },
  { id: 'dr-7', title: 'KaNeXT Video Mandate Strategy', category: 'product', visibility: ['founder', 'investor'], lastUpdated: 'Feb 15, 2026', fileType: 'docx' },
  // Proof
  { id: 'dr-8', title: 'FMU Free Media Value Analysis', category: 'proof', visibility: ['founder', 'investor', 'public'], lastUpdated: 'Feb 15, 2026', fileType: 'docx' },
  { id: 'dr-9', title: 'BTW Memorial Classic — Tournament Plan', category: 'proof', visibility: ['founder', 'investor', 'public'], lastUpdated: 'Feb 15, 2026', fileType: 'docx' },
  { id: 'dr-10', title: 'MLK Truth Classic — Tournament Plan', category: 'proof', visibility: ['founder', 'investor', 'public'], lastUpdated: 'Feb 15, 2026', fileType: 'docx' },
  { id: 'dr-11', title: 'Valuetainment Classic — Tournament Plan', category: 'proof', visibility: ['founder', 'investor', 'public'], lastUpdated: 'Feb 15, 2026', fileType: 'docx' },
  // Partnerships
  { id: 'dr-12', title: 'Valuetainment Distribution LOI', category: 'partnerships', visibility: ['founder', 'investor'], lastUpdated: 'Feb 8, 2026', fileType: 'pdf' },
  { id: 'dr-13', title: 'NAIA Video Mandate — Draft MOU', category: 'partnerships', visibility: ['founder'], lastUpdated: 'Feb 14, 2026', fileType: 'pdf' },
  // Finance
  { id: 'dr-14', title: 'Cap Table — Current', category: 'finance', visibility: ['founder', 'investor'], lastUpdated: 'Feb 15, 2026', fileType: 'xlsx' },
  { id: 'dr-15', title: 'Use of Funds — Pre-Seed', category: 'finance', visibility: ['founder', 'investor'], lastUpdated: 'Feb 12, 2026', fileType: 'xlsx' },
  { id: 'dr-16', title: 'Runway Model — 18-Month Projection', category: 'finance', visibility: ['founder'], lastUpdated: 'Feb 10, 2026', fileType: 'xlsx' },
  // Media
  { id: 'dr-17', title: 'Investor Pitch Deck — Feb 2026', category: 'media', visibility: ['founder', 'investor', 'public'], lastUpdated: 'Feb 15, 2026', fileType: 'deck' },
  { id: 'dr-18', title: 'Proof Sizzle Reel — 60s Cut', category: 'media', visibility: ['founder', 'investor', 'public'], lastUpdated: 'Feb 14, 2026', fileType: 'deck' },
];

// =============================================================================
// RAILS
// =============================================================================

export const RAILS_FLOW_STEPS = [
  { id: 'rf-1', step: 'Event', description: 'Ticket sale, donation, or payout trigger' },
  { id: 'rf-2', step: 'Rules', description: 'Business rules validate transaction' },
  { id: 'rf-3', step: 'Authorization', description: 'Payment processor authorizes' },
  { id: 'rf-4', step: 'Payment', description: 'Funds captured or transferred' },
  { id: 'rf-5', step: 'Settlement', description: 'Multi-party settlement completes' },
  { id: 'rf-6', step: 'Audit', description: 'Immutable log entry created' },
];

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  { id: 'mt-1', type: 'ticket', description: 'BTW Classic — Courtside (2x)', amount: 450, status: 'settled', date: 'Feb 14', org: 'FMU' },
  { id: 'mt-2', type: 'donation', description: 'ICCLA — Sunday Giving (online)', amount: 2500, status: 'settled', date: 'Feb 12', org: 'ICCLA' },
  { id: 'mt-3', type: 'payout', description: 'K-1 Race Prize — Round 11 Winner', amount: -5000, status: 'settled', date: 'Feb 10', org: 'K-1' },
  { id: 'mt-4', type: 'ticket', description: 'FMU vs Howard — GA (50x)', amount: 1250, status: 'pending', date: 'Feb 15', org: 'FMU' },
  { id: 'mt-5', type: 'fine', description: 'K-1 — Avoidable Contact Penalty', amount: -500, status: 'settled', date: 'Feb 9', org: 'K-1' },
  { id: 'mt-6', type: 'subscription', description: 'KaNeXT Pro — Annual (HBCU pilot)', amount: 2400, status: 'settled', date: 'Feb 8', org: 'KaNeXT' },
  { id: 'mt-7', type: 'donation', description: 'FMU Scholarship Fund — Alumni', amount: 10000, status: 'settled', date: 'Feb 6', org: 'FMU' },
  { id: 'mt-8', type: 'payout', description: 'MLK Classic — Appearance Guarantee', amount: -150000, status: 'pending', date: 'Feb 5', org: 'FMU' },
];

// =============================================================================
// OPS
// =============================================================================

export const DIRECTORY: DirectoryEntry[] = [
  { id: 'dir-1', name: 'Oluwadara Kalejaiye', role: 'Founder & CEO', department: 'Executive', status: 'active' },
  { id: 'dir-2', name: 'Patrick Bet-David', role: 'Co-Founder (Pending)', department: 'Strategic', status: 'pending' },
  { id: 'dir-3', name: 'FMU Athletics Staff', role: 'Proof Wedge — Sports', department: 'Operations', status: 'active' },
  { id: 'dir-4', name: 'ICCLA Ministry Team', role: 'Proof Wedge — Church', department: 'Operations', status: 'active' },
  { id: 'dir-5', name: 'K-1 League Operations', role: 'Proof Wedge — Competition', department: 'Operations', status: 'active' },
  { id: 'dir-6', name: 'Legal Counsel', role: 'Outside Counsel', department: 'Legal', status: 'advisor' },
];

export const WORKSTREAMS: Workstream[] = [
  { id: 'ws-1', name: 'Platform Engineering', lead: 'Sammy K', status: 'active', items: 24, progress: 68 },
  { id: 'ws-2', name: 'Proof Event Ops', lead: 'Sammy K', status: 'active', items: 12, progress: 42 },
  { id: 'ws-3', name: 'Video Mandate Execution', lead: 'Sammy K', status: 'active', items: 8, progress: 15 },
  { id: 'ws-4', name: 'Fundraising & Capital', lead: 'Sammy K', status: 'active', items: 6, progress: 30 },
  { id: 'ws-5', name: 'Legal & Governance', lead: 'Sammy K', status: 'active', items: 5, progress: 55 },
];

export const MEETINGS: MeetingItem[] = [
  { id: 'mtg-1', title: 'PBD Strategy Sync', date: 'Feb 18, 2026 · 2:00 PM', attendees: ['Sammy K', 'PBD'], decisions: 0, status: 'scheduled' },
  { id: 'mtg-2', title: 'FMU Athletics Review', date: 'Feb 20, 2026 · 10:00 AM', attendees: ['Sammy K', 'FMU Staff'], decisions: 0, status: 'scheduled' },
  { id: 'mtg-3', title: 'NAIA Video Mandate Discussion', date: 'Feb 25, 2026 · 1:00 PM', attendees: ['Sammy K', 'NAIA HQ'], decisions: 0, status: 'scheduled' },
  { id: 'mtg-4', title: 'BTW Classic Venue Planning', date: 'Feb 12, 2026 · 11:00 AM', attendees: ['Sammy K', 'FMU Facilities'], decisions: 3, status: 'completed' },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getMetricsForRole(role: RoleView): PowerMetric[] {
  return POWER_METRICS.filter((m) => m.visibility.includes(role));
}

export function getProofForRole(role: RoleView): ProofArtifact[] {
  return PROOF_ARTIFACTS.filter((a) => a.visibility.includes(role));
}

export function getCapitalForRole(role: RoleView): CapitalRound[] {
  return CAPITAL_ROUNDS.filter((r) => r.visibility.includes(role));
}

export function getDataRoomForRole(role: RoleView): DataRoomDoc[] {
  return DATA_ROOM_DOCS.filter((d) => d.visibility.includes(role));
}

export function getDataRoomByCategory(role: RoleView, category: DataRoomDoc['category'] | 'all'): DataRoomDoc[] {
  const docs = getDataRoomForRole(role);
  if (category === 'all') return docs;
  return docs.filter((d) => d.category === category);
}

export const DATA_ROOM_CATEGORIES: { id: DataRoomDoc['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'legal', label: 'Legal' },
  { id: 'product', label: 'Product' },
  { id: 'proof', label: 'Proof' },
  { id: 'partnerships', label: 'Partnerships' },
  { id: 'finance', label: 'Finance' },
  { id: 'media', label: 'Media' },
];
