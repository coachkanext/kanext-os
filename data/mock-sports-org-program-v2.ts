/**
 * Sports Organization Program V2 — Mock Data & Types
 * 10-tab Program Hub for Sports Mode organizations.
 * Seeded with KaNeXT Men's Basketball 2025-26 season data.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SportsOrgProgramSubTab =
  | 'overview'
  | 'identity'
  | 'leadership'
  | 'context'
  | 'rules'
  | 'calendar'
  | 'decisions'
  | 'assets'
  | 'partners'
  | 'settings';

export interface ProgramSubTab {
  id: SportsOrgProgramSubTab;
  label: string;
  icon: string;
}

export interface ProgramIdentity {
  programName: string;
  orgName: string;
  level: string;
  conference: string;
  season: string;
  colors: { primary: string; secondary: string };
  logoUrl: string;
  websiteUrl: string;
}

export interface LeadershipSeat {
  id: string;
  title: string;
  name: string | null;
  email: string;
  phone: string;
  coverage: 'filled' | 'vacant' | 'overloaded';
  backupName: string | null;
  department: string;
}

export interface ProgramContext {
  id: string;
  key: string;
  value: string;
  category: 'system' | 'style' | 'constraint';
  description: string;
  lastUpdated: string;
}

export interface OperatingRule {
  id: string;
  title: string;
  description: string;
  category: 'availability' | 'travel' | 'practice' | 'comms' | 'approval';
  severity: 'hard' | 'soft';
  exceptions: number;
  lastReviewed: string;
}

export interface CalendarMilestone {
  id: string;
  title: string;
  date: string;
  type: 'season' | 'travel' | 'recruiting' | 'compliance' | 'deadline';
  status: 'completed' | 'upcoming' | 'overdue';
  owner: string;
}

export interface PendingDecision {
  id: string;
  title: string;
  description: string;
  category: 'budget' | 'ops' | 'compliance' | 'personnel';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  requestedBy: string;
  requestDate: string;
  requiredApprovers: string[];
}

export interface ProgramAsset {
  id: string;
  name: string;
  category: 'uniforms' | 'gear' | 'devices' | 'film-tools' | 'vehicles';
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-replacement';
  lastInspected: string;
  replacementDate: string | null;
}

export interface ProgramPartner {
  id: string;
  name: string;
  type: 'vendor' | 'trainer' | 'facility' | 'nil-collective' | 'medical';
  contact: string;
  contractEnd: string;
  status: 'active' | 'expiring' | 'at-risk';
}

// =============================================================================
// LABEL / COLOR CONSTANTS
// =============================================================================

export const COVERAGE_LABELS: Record<LeadershipSeat['coverage'], string> = {
  filled: 'Filled',
  vacant: 'Vacant',
  overloaded: 'Overloaded',
};

export const COVERAGE_COLORS: Record<LeadershipSeat['coverage'], string> = {
  filled: '#22C55E',
  vacant: '#EF4444',
  overloaded: '#F59E0B',
};

export const CONTEXT_CATEGORY_LABELS: Record<ProgramContext['category'], string> = {
  system: 'System',
  style: 'Style',
  constraint: 'Constraint',
};

export const CONTEXT_CATEGORY_COLORS: Record<ProgramContext['category'], string> = {
  system: '#1D9BF0',
  style: '#1D9BF0',
  constraint: '#F59E0B',
};

export const RULE_CATEGORY_LABELS: Record<OperatingRule['category'], string> = {
  availability: 'Availability',
  travel: 'Travel',
  practice: 'Practice',
  comms: 'Communications',
  approval: 'Approval',
};

export const RULE_CATEGORY_COLORS: Record<OperatingRule['category'], string> = {
  availability: '#1D9BF0',
  travel: '#1D9BF0',
  practice: '#22C55E',
  comms: '#F59E0B',
  approval: '#EF4444',
};

export const RULE_SEVERITY_LABELS: Record<OperatingRule['severity'], string> = {
  hard: 'Hard Rule',
  soft: 'Soft Rule',
};

export const RULE_SEVERITY_COLORS: Record<OperatingRule['severity'], string> = {
  hard: '#EF4444',
  soft: '#F59E0B',
};

export const MILESTONE_TYPE_LABELS: Record<CalendarMilestone['type'], string> = {
  season: 'Season',
  travel: 'Travel',
  recruiting: 'Recruiting',
  compliance: 'Compliance',
  deadline: 'Deadline',
};

export const MILESTONE_TYPE_COLORS: Record<CalendarMilestone['type'], string> = {
  season: '#1D9BF0',
  travel: '#1D9BF0',
  recruiting: '#22C55E',
  compliance: '#EF4444',
  deadline: '#F59E0B',
};

export const MILESTONE_STATUS_LABELS: Record<CalendarMilestone['status'], string> = {
  completed: 'Completed',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
};

export const MILESTONE_STATUS_COLORS: Record<CalendarMilestone['status'], string> = {
  completed: '#22C55E',
  upcoming: '#1D9BF0',
  overdue: '#EF4444',
};

export const DECISION_CATEGORY_LABELS: Record<PendingDecision['category'], string> = {
  budget: 'Budget',
  ops: 'Operations',
  compliance: 'Compliance',
  personnel: 'Personnel',
};

export const DECISION_CATEGORY_COLORS: Record<PendingDecision['category'], string> = {
  budget: '#F59E0B',
  ops: '#1D9BF0',
  compliance: '#EF4444',
  personnel: '#1D9BF0',
};

export const DECISION_URGENCY_LABELS: Record<PendingDecision['urgency'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const DECISION_URGENCY_COLORS: Record<PendingDecision['urgency'], string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#1D9BF0',
  low: '#A1A1AA',
};

export const ASSET_CATEGORY_LABELS: Record<ProgramAsset['category'], string> = {
  uniforms: 'Uniforms',
  gear: 'Gear',
  devices: 'Devices',
  'film-tools': 'Film Tools',
  vehicles: 'Vehicles',
};

export const ASSET_CATEGORY_COLORS: Record<ProgramAsset['category'], string> = {
  uniforms: '#1D9BF0',
  gear: '#22C55E',
  devices: '#1D9BF0',
  'film-tools': '#F59E0B',
  vehicles: '#1D9BF0',
};

export const ASSET_CONDITION_LABELS: Record<ProgramAsset['condition'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  'needs-replacement': 'Needs Replacement',
};

export const ASSET_CONDITION_COLORS: Record<ProgramAsset['condition'], string> = {
  excellent: '#22C55E',
  good: '#1D9BF0',
  fair: '#F59E0B',
  'needs-replacement': '#EF4444',
};

export const PARTNER_TYPE_LABELS: Record<ProgramPartner['type'], string> = {
  vendor: 'Vendor',
  trainer: 'Trainer',
  facility: 'Facility',
  'nil-collective': 'NIL Collective',
  medical: 'Medical',
};

export const PARTNER_TYPE_COLORS: Record<ProgramPartner['type'], string> = {
  vendor: '#1D9BF0',
  trainer: '#22C55E',
  facility: '#1D9BF0',
  'nil-collective': '#F59E0B',
  medical: '#EF4444',
};

export const PARTNER_STATUS_LABELS: Record<ProgramPartner['status'], string> = {
  active: 'Active',
  expiring: 'Expiring',
  'at-risk': 'At Risk',
};

export const PARTNER_STATUS_COLORS: Record<ProgramPartner['status'], string> = {
  active: '#22C55E',
  expiring: '#F59E0B',
  'at-risk': '#EF4444',
};

// =============================================================================
// SUB-TABS
// =============================================================================

export const PROGRAM_SUB_TABS: ProgramSubTab[] = [
  { id: 'overview', label: 'Overview', icon: 'square.grid.2x2.fill' },
  { id: 'identity', label: 'Identity', icon: 'person.text.rectangle.fill' },
  { id: 'leadership', label: 'Leadership', icon: 'person.3.fill' },
  { id: 'context', label: 'Context', icon: 'brain.fill' },
  { id: 'rules', label: 'Rules', icon: 'checklist' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'decisions', label: 'Decisions', icon: 'arrow.triangle.branch' },
  { id: 'assets', label: 'Assets', icon: 'archivebox.fill' },
  { id: 'partners', label: 'Partners', icon: 'handshake.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

// =============================================================================
// SEEDED DATA — KaNeXT Men's Basketball 2025-26
// =============================================================================

export const PROGRAM_IDENTITY: ProgramIdentity = {
  programName: 'KaNeXT Men\'s Basketball',
  orgName: 'KaNeXT Sports',
  level: 'NAIA Division II',
  conference: 'KaNeXT Conference',
  season: '2025-26',
  colors: { primary: '#1D9BF0', secondary: '#F59E0B' },
  logoUrl: 'https://fmusports.com/images/logos/fmu-athletics.png',
  websiteUrl: 'https://fmusports.com/sports/mens-basketball',
};

export const LEADERSHIP_SEATS: LeadershipSeat[] = [
  {
    id: 'ls-hc',
    title: 'Head Coach',
    name: 'Coach Terrance Williams',
    email: 'twilliams@fmu.edu',
    phone: '(305) 626-3161',
    coverage: 'filled',
    backupName: 'Marcus Davis',
    department: 'Coaching',
  },
  {
    id: 'ls-ac1',
    title: 'Associate Head Coach',
    name: 'Marcus Davis',
    email: 'mdavis@fmu.edu',
    phone: '(305) 626-3162',
    coverage: 'filled',
    backupName: null,
    department: 'Coaching',
  },
  {
    id: 'ls-ac2',
    title: 'Assistant Coach — Offense',
    name: 'Jerome Patterson',
    email: 'jpatterson@fmu.edu',
    phone: '(305) 626-3163',
    coverage: 'filled',
    backupName: null,
    department: 'Coaching',
  },
  {
    id: 'ls-ac3',
    title: 'Assistant Coach — Defense / Recruiting',
    name: null,
    email: 'recruiting@fmu.edu',
    phone: '(305) 626-3164',
    coverage: 'vacant',
    backupName: null,
    department: 'Coaching',
  },
  {
    id: 'ls-dops',
    title: 'Director of Basketball Operations',
    name: 'Alicia Washington',
    email: 'awashington@fmu.edu',
    phone: '(305) 626-3170',
    coverage: 'overloaded',
    backupName: 'Jerome Patterson',
    department: 'Operations',
  },
  {
    id: 'ls-trainer',
    title: 'Athletic Trainer',
    name: 'David Chen',
    email: 'dchen@fmu.edu',
    phone: '(305) 626-3175',
    coverage: 'filled',
    backupName: 'Dr. Maria Santos',
    department: 'Medical',
  },
  {
    id: 'ls-sc',
    title: 'Strength & Conditioning Coach',
    name: 'Robert Jackson',
    email: 'rjackson@fmu.edu',
    phone: '(305) 626-3180',
    coverage: 'filled',
    backupName: null,
    department: 'Performance',
  },
  {
    id: 'ls-vc',
    title: 'Video Coordinator',
    name: 'Kayla Thompson',
    email: 'kthompson@fmu.edu',
    phone: '(305) 626-3185',
    coverage: 'filled',
    backupName: null,
    department: 'Analytics',
  },
];

export const PROGRAM_CONTEXT_ITEMS: ProgramContext[] = [
  {
    id: 'ctx-1',
    key: 'Offensive System',
    value: 'Motion offense — 5-out spacing, read-and-react principles',
    category: 'style',
    description: 'Primary offensive philosophy emphasizing ball movement, player reads, and three-point shooting.',
    lastUpdated: '2025-09-15',
  },
  {
    id: 'ctx-2',
    key: 'Defensive System',
    value: 'Switching man-to-man with zone press traps',
    category: 'style',
    description: 'Default defensive scheme. Switch to 1-3-1 zone press after made baskets in 2H.',
    lastUpdated: '2025-09-15',
  },
  {
    id: 'ctx-3',
    key: 'Roster Cap',
    value: '15 scholarship athletes + 2 walk-ons',
    category: 'constraint',
    description: 'NAIA scholarship limit. Current roster at 14 scholarships with 1 available.',
    lastUpdated: '2026-01-10',
  },
  {
    id: 'ctx-4',
    key: 'Film Platform',
    value: 'Hudl — team code KaNeXT-MBB-2526',
    category: 'system',
    description: 'All game and practice film uploaded to Hudl within 24 hours of session.',
    lastUpdated: '2025-08-20',
  },
  {
    id: 'ctx-5',
    key: 'Academic Eligibility',
    value: 'Minimum 2.0 GPA — checked bi-weekly',
    category: 'constraint',
    description: 'NAIA eligibility requirement. Players below 2.0 at midterm check enter mandatory study hall.',
    lastUpdated: '2026-01-20',
  },
  {
    id: 'ctx-6',
    key: 'Communication Tool',
    value: 'GroupMe + KaNeXT Rooms for official comms',
    category: 'system',
    description: 'GroupMe for quick informal updates; KaNeXT Rooms for documented decisions and approvals.',
    lastUpdated: '2025-10-01',
  },
];

export const OPERATING_RULES: OperatingRule[] = [
  {
    id: 'rule-1',
    title: 'Sunday Rest Day',
    description: 'No mandatory team activities on Sundays. Players may use facilities for voluntary workouts only.',
    category: 'availability',
    severity: 'hard',
    exceptions: 0,
    lastReviewed: '2025-09-01',
  },
  {
    id: 'rule-2',
    title: 'Travel Departure — 4 Hours Before Tipoff',
    description: 'Team bus departs no later than 4 hours before scheduled tipoff for away games within 150 miles.',
    category: 'travel',
    severity: 'hard',
    exceptions: 1,
    lastReviewed: '2025-10-15',
  },
  {
    id: 'rule-3',
    title: 'Practice Duration Limit',
    description: 'In-season practices capped at 2 hours of live court time. Film sessions count separately.',
    category: 'practice',
    severity: 'soft',
    exceptions: 3,
    lastReviewed: '2025-11-01',
  },
  {
    id: 'rule-4',
    title: 'Recruiting Contact via Staff Only',
    description: 'All recruiting contact with prospective student-athletes must go through coaching staff. No player-to-prospect direct outreach.',
    category: 'comms',
    severity: 'hard',
    exceptions: 0,
    lastReviewed: '2025-09-01',
  },
  {
    id: 'rule-5',
    title: 'Purchase Approval Threshold',
    description: 'Any equipment or travel expense above $500 requires Director of Ops written approval. Above $2,000 requires AD sign-off.',
    category: 'approval',
    severity: 'hard',
    exceptions: 0,
    lastReviewed: '2025-08-15',
  },
  {
    id: 'rule-6',
    title: 'Pre-Game Shootaround Timing',
    description: 'Game-day shootaround must occur between 9:00 AM and 11:00 AM. Duration 45-60 minutes.',
    category: 'practice',
    severity: 'soft',
    exceptions: 2,
    lastReviewed: '2025-11-15',
  },
];

export const CALENDAR_MILESTONES: CalendarMilestone[] = [
  {
    id: 'cm-1',
    title: 'Preseason Practice Begins',
    date: '2025-10-01',
    type: 'season',
    status: 'completed',
    owner: 'Coach Williams',
  },
  {
    id: 'cm-2',
    title: 'Season Opener vs. Webber International',
    date: '2025-11-01',
    type: 'season',
    status: 'completed',
    owner: 'Coach Williams',
  },
  {
    id: 'cm-3',
    title: 'KaNeXT Conference Schedule Release',
    date: '2025-10-15',
    type: 'compliance',
    status: 'completed',
    owner: 'Alicia Washington',
  },
  {
    id: 'cm-4',
    title: 'NAIA Eligibility Certification Deadline',
    date: '2025-11-15',
    type: 'compliance',
    status: 'completed',
    owner: 'Compliance Office',
  },
  {
    id: 'cm-5',
    title: 'Mid-Season Recruiting Window Opens',
    date: '2026-01-15',
    type: 'recruiting',
    status: 'completed',
    owner: 'Jerome Patterson',
  },
  {
    id: 'cm-6',
    title: 'KaNeXT Conference Tournament',
    date: '2026-02-27',
    type: 'season',
    status: 'upcoming',
    owner: 'Coach Williams',
  },
  {
    id: 'cm-7',
    title: 'NAIA National Tournament Bid Deadline',
    date: '2026-03-05',
    type: 'deadline',
    status: 'upcoming',
    owner: 'Athletic Director',
  },
  {
    id: 'cm-8',
    title: 'Spring Recruiting Visits Weekend',
    date: '2026-03-15',
    type: 'recruiting',
    status: 'upcoming',
    owner: 'Marcus Davis',
  },
];

export const PENDING_DECISIONS: PendingDecision[] = [
  {
    id: 'pd-1',
    title: 'Approve Conference Tournament Travel Budget',
    description: 'Lodging and meals for 18-person travel party to Clearwater for KaNeXT Conference Tournament. Estimated $12,400.',
    category: 'budget',
    urgency: 'critical',
    requestedBy: 'Alicia Washington',
    requestDate: '2026-02-10',
    requiredApprovers: ['Athletic Director', 'CFO'],
  },
  {
    id: 'pd-2',
    title: 'Hire Replacement Assistant Coach',
    description: 'Fill vacant Assistant Coach — Defense / Recruiting position before spring signing period.',
    category: 'personnel',
    urgency: 'high',
    requestedBy: 'Coach Williams',
    requestDate: '2026-01-25',
    requiredApprovers: ['Athletic Director', 'HR Director'],
  },
  {
    id: 'pd-3',
    title: 'Transfer Portal Compliance Review',
    description: 'Clear two incoming transfer prospects for NAIA eligibility before practice window.',
    category: 'compliance',
    urgency: 'high',
    requestedBy: 'Marcus Davis',
    requestDate: '2026-02-05',
    requiredApprovers: ['Compliance Officer'],
  },
  {
    id: 'pd-4',
    title: 'Replace Practice Court Flooring',
    description: 'Auxiliary gym floor showing wear. Three vendor quotes received. Range: $18K-$24K.',
    category: 'ops',
    urgency: 'medium',
    requestedBy: 'Robert Jackson',
    requestDate: '2026-01-30',
    requiredApprovers: ['Athletic Director', 'Facilities Director'],
  },
  {
    id: 'pd-5',
    title: 'NIL Collective Partnership Agreement',
    description: 'Finalize terms with 305 Lions NIL collective. Legal review of revenue-sharing model required.',
    category: 'compliance',
    urgency: 'medium',
    requestedBy: 'Athletic Director',
    requestDate: '2026-02-01',
    requiredApprovers: ['General Counsel', 'Athletic Director'],
  },
];

export const PROGRAM_ASSETS: ProgramAsset[] = [
  {
    id: 'pa-1',
    name: 'Home Game Uniforms (Blue)',
    category: 'uniforms',
    quantity: 18,
    condition: 'good',
    lastInspected: '2025-11-01',
    replacementDate: '2026-08-01',
  },
  {
    id: 'pa-2',
    name: 'Away Game Uniforms (White)',
    category: 'uniforms',
    quantity: 18,
    condition: 'good',
    lastInspected: '2025-11-01',
    replacementDate: '2026-08-01',
  },
  {
    id: 'pa-3',
    name: 'Practice Basketballs (Wilson Evolution)',
    category: 'gear',
    quantity: 36,
    condition: 'fair',
    lastInspected: '2026-01-15',
    replacementDate: '2026-06-01',
  },
  {
    id: 'pa-4',
    name: 'Game Basketballs (Wilson NCAA)',
    category: 'gear',
    quantity: 12,
    condition: 'excellent',
    lastInspected: '2026-02-01',
    replacementDate: null,
  },
  {
    id: 'pa-5',
    name: 'iPad Pros — Film Review',
    category: 'devices',
    quantity: 6,
    condition: 'good',
    lastInspected: '2026-01-10',
    replacementDate: null,
  },
  {
    id: 'pa-6',
    name: 'Hudl Focus Camera System',
    category: 'film-tools',
    quantity: 2,
    condition: 'excellent',
    lastInspected: '2025-12-15',
    replacementDate: null,
  },
  {
    id: 'pa-7',
    name: 'Team Van (15-Passenger)',
    category: 'vehicles',
    quantity: 1,
    condition: 'fair',
    lastInspected: '2026-01-20',
    replacementDate: '2026-07-01',
  },
  {
    id: 'pa-8',
    name: 'Shooting Machine (Dr. Dish)',
    category: 'gear',
    quantity: 1,
    condition: 'needs-replacement',
    lastInspected: '2026-02-05',
    replacementDate: '2026-04-01',
  },
];

export const PROGRAM_PARTNERS: ProgramPartner[] = [
  {
    id: 'pp-1',
    name: 'Hudl',
    type: 'vendor',
    contact: 'support@hudl.com',
    contractEnd: '2026-06-30',
    status: 'active',
  },
  {
    id: 'pp-2',
    name: 'Select Physical Therapy',
    type: 'medical',
    contact: 'Dr. Maria Santos — (305) 555-0142',
    contractEnd: '2026-08-31',
    status: 'active',
  },
  {
    id: 'pp-3',
    name: 'Miami Sports Performance Center',
    type: 'facility',
    contact: 'bookings@miamispc.com',
    contractEnd: '2026-05-15',
    status: 'expiring',
  },
  {
    id: 'pp-4',
    name: '305 Lions NIL Collective',
    type: 'nil-collective',
    contact: 'ops@305lions.com',
    contractEnd: '2026-12-31',
    status: 'at-risk',
  },
  {
    id: 'pp-5',
    name: 'Coach Tony Sanders — Skills Development',
    type: 'trainer',
    contact: 'tsanders@gmail.com',
    contractEnd: '2026-04-30',
    status: 'active',
  },
];

// =============================================================================
// OVERVIEW SUMMARY
// =============================================================================

export interface ProgramOverview {
  totalSeats: number;
  filledSeats: number;
  vacantSeats: number;
  overloadedSeats: number;
  contextItems: number;
  operatingRules: number;
  hardRules: number;
  upcomingMilestones: number;
  overdueMilestones: number;
  pendingDecisions: number;
  criticalDecisions: number;
  totalAssets: number;
  assetsNeedingReplacement: number;
  activePartners: number;
  expiringPartners: number;
}

export function getProgramOverview(): ProgramOverview {
  return {
    totalSeats: LEADERSHIP_SEATS.length,
    filledSeats: LEADERSHIP_SEATS.filter((s) => s.coverage === 'filled').length,
    vacantSeats: LEADERSHIP_SEATS.filter((s) => s.coverage === 'vacant').length,
    overloadedSeats: LEADERSHIP_SEATS.filter((s) => s.coverage === 'overloaded').length,
    contextItems: PROGRAM_CONTEXT_ITEMS.length,
    operatingRules: OPERATING_RULES.length,
    hardRules: OPERATING_RULES.filter((r) => r.severity === 'hard').length,
    upcomingMilestones: CALENDAR_MILESTONES.filter((m) => m.status === 'upcoming').length,
    overdueMilestones: CALENDAR_MILESTONES.filter((m) => m.status === 'overdue').length,
    pendingDecisions: PENDING_DECISIONS.length,
    criticalDecisions: PENDING_DECISIONS.filter((d) => d.urgency === 'critical').length,
    totalAssets: PROGRAM_ASSETS.reduce((sum, a) => sum + a.quantity, 0),
    assetsNeedingReplacement: PROGRAM_ASSETS.filter((a) => a.condition === 'needs-replacement').length,
    activePartners: PROGRAM_PARTNERS.filter((p) => p.status === 'active').length,
    expiringPartners: PROGRAM_PARTNERS.filter((p) => p.status === 'expiring' || p.status === 'at-risk').length,
  };
}
