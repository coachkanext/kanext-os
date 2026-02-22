/**
 * Education Organization Operations V2 — Mock Data & Types
 * Initiatives, workflows, tasks, decision gates, and scorecards
 * across the KaNeXT Church education portfolio.
 */

// =============================================================================
// TYPES
// =============================================================================

export type InitiativeStatus = 'on_track' | 'at_risk' | 'blocked' | 'completed' | 'paused';
export type WorkflowStatus = 'active' | 'idle' | 'bottleneck' | 'completed';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'overdue';
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type GateStatus = 'pending' | 'approved' | 'rejected' | 'escalated';
export type OpsDomain = 'admissions' | 'academics' | 'campus' | 'athletics' | 'financial' | 'policies';

// =============================================================================
// INTERFACES
// =============================================================================

export interface OpsInitiative {
  id: string;
  name: string;
  domain: OpsDomain;
  status: InitiativeStatus;
  institution?: string;
  owner: string;
  description: string;
  startDate: string;
  targetDate: string;
  budgetAllocated: string;
  budgetSpent: string;
  kpis: { label: string; current: number; target: number; unit: string }[];
  complianceLinked: boolean;
  blockers: string[];
  nextAction: string;
}

export interface OpsWorkflow {
  id: string;
  name: string;
  domain: OpsDomain;
  status: WorkflowStatus;
  institution?: string;
  description: string;
  totalSteps: number;
  completedSteps: number;
  avgCompletionDays: number;
  slaTarget: number;         // days
  slaBreaches: number;
  bottleneckStep?: string;
  currentRuns: number;
}

export interface OpsTask {
  id: string;
  title: string;
  domain: OpsDomain;
  status: TaskStatus;
  priority: TaskPriority;
  institution?: string;
  assignee: string;
  dueDate: string;
  linkedInitiative?: string;
  linkedWorkflow?: string;
  description: string;
}

export interface DecisionGate {
  id: string;
  title: string;
  domain: OpsDomain;
  status: GateStatus;
  requiredBy: string;        // date
  requestor: string;
  approvers: string[];
  institution?: string;
  linkedInitiative?: string;
  description: string;
}

// =============================================================================
// LABEL / COLOR CONSTANTS
// =============================================================================

export const INITIATIVE_STATUS_LABELS: Record<InitiativeStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  blocked: 'Blocked',
  completed: 'Completed',
  paused: 'Paused',
};

export const INITIATIVE_STATUS_COLORS: Record<InitiativeStatus, string> = {
  on_track: '#22C55E',
  at_risk: '#F59E0B',
  blocked: '#EF4444',
  completed: '#6AA9FF',
  paused: '#8F8F8F',
};

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  bottleneck: 'Bottleneck',
  completed: 'Completed',
};

export const WORKFLOW_STATUS_COLORS: Record<WorkflowStatus, string> = {
  active: '#22C55E',
  idle: '#8F8F8F',
  bottleneck: '#EF4444',
  completed: '#6AA9FF',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
  overdue: 'Overdue',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#8F8F8F',
  in_progress: '#6AA9FF',
  blocked: '#EF4444',
  completed: '#22C55E',
  overdue: '#F59E0B',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  normal: '#6AA9FF',
  low: '#8F8F8F',
};

export const GATE_STATUS_LABELS: Record<GateStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
};

export const GATE_STATUS_COLORS: Record<GateStatus, string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  rejected: '#EF4444',
  escalated: '#A78BFA',
};

export const OPS_DOMAIN_LABELS: Record<OpsDomain, string> = {
  admissions: 'Admissions',
  academics: 'Academics',
  campus: 'Campus',
  athletics: 'Athletics',
  financial: 'Financial',
  policies: 'Policies',
};

export const OPS_DOMAIN_COLORS: Record<OpsDomain, string> = {
  admissions: '#6AA9FF',
  academics: '#A78BFA',
  campus: '#22C55E',
  athletics: '#F59E0B',
  financial: '#EF4444',
  policies: '#8B5CF6',
};

export const OPS_DOMAIN_ICONS: Record<OpsDomain, string> = {
  admissions: 'person.badge.plus',
  academics: 'book.fill',
  campus: 'building.2.fill',
  athletics: 'sportscourt.fill',
  financial: 'dollarsign.circle.fill',
  policies: 'doc.text.fill',
};

// =============================================================================
// SEEDED DATA
// =============================================================================

const INITIATIVES: OpsInitiative[] = [
  {
    id: 'oi-fall-enrollment',
    name: 'Fall 2026 Enrollment Push',
    domain: 'admissions',
    status: 'at_risk',
    institution: 'KaNeXT',
    owner: 'VP Enrollment',
    description: 'Aggressive campaign to close the 22% deposit gap for Fall 2026 at KaNeXT.',
    startDate: '2026-01-15',
    targetDate: '2026-05-01',
    budgetAllocated: '$180K',
    budgetSpent: '$95K',
    kpis: [
      { label: 'Applications', current: 2840, target: 3200, unit: '' },
      { label: 'Admits', current: 1650, target: 2100, unit: '' },
      { label: 'Deposits', current: 620, target: 800, unit: '' },
      { label: 'Yield Rate', current: 37, target: 42, unit: '%' },
    ],
    complianceLinked: false,
    blockers: ['Financial aid packaging delays', 'Housing confirmation backlog'],
    nextAction: 'Launch 2nd yield-day event Feb 22',
  },
  {
    id: 'oi-retention-sprint',
    name: 'Spring Retention Sprint',
    domain: 'academics',
    status: 'on_track',
    institution: 'KaNeXT',
    owner: 'Dean of Students',
    description: 'Targeted retention interventions for at-risk freshmen and sophomores.',
    startDate: '2026-01-20',
    targetDate: '2026-04-30',
    budgetAllocated: '$45K',
    budgetSpent: '$18K',
    kpis: [
      { label: 'Retention Rate', current: 78, target: 82, unit: '%' },
      { label: 'Early Alerts Resolved', current: 142, target: 200, unit: '' },
      { label: 'Tutoring Sessions', current: 380, target: 600, unit: '' },
    ],
    complianceLinked: false,
    blockers: [],
    nextAction: 'Midterm check-in campaign',
  },
  {
    id: 'oi-accreditation-prep',
    name: 'SACSCOC Accreditation Prep',
    domain: 'policies',
    status: 'at_risk',
    institution: 'KaNeXT',
    owner: 'Chief Compliance Officer',
    description: 'Prepare for SACSCOC 5th-year interim report — documentation, evidence, and committee reviews.',
    startDate: '2025-09-01',
    targetDate: '2026-06-30',
    budgetAllocated: '$35K',
    budgetSpent: '$22K',
    kpis: [
      { label: 'Standards Addressed', current: 38, target: 52, unit: '' },
      { label: 'Evidence Docs', current: 124, target: 180, unit: '' },
      { label: 'Committee Reviews', current: 6, target: 10, unit: '' },
    ],
    complianceLinked: true,
    blockers: ['Missing financial audit appendix', 'Faculty credentials documentation gap'],
    nextAction: 'Complete Standard 6.2b evidence package',
  },
  {
    id: 'oi-title-ix-review',
    name: 'Title IX Policy Overhaul',
    domain: 'policies',
    status: 'blocked',
    owner: 'General Counsel',
    description: 'Org-wide Title IX policy update in response to 2025 regulatory changes.',
    startDate: '2025-11-01',
    targetDate: '2026-04-15',
    budgetAllocated: '$25K',
    budgetSpent: '$15K',
    kpis: [
      { label: 'Policies Drafted', current: 8, target: 12, unit: '' },
      { label: 'Training Modules', current: 3, target: 6, unit: '' },
    ],
    complianceLinked: true,
    blockers: ['Awaiting DOE guidance on Section 106.45 interpretation'],
    nextAction: 'Draft interim-guidance memo for campuses',
  },
  {
    id: 'oi-housing-modernization',
    name: 'Housing Modernization',
    domain: 'campus',
    status: 'on_track',
    institution: 'KaNeXT',
    owner: 'Dir. Residential Life',
    description: 'Upgrade KaNeXT residence-hall amenities and digital check-in system.',
    startDate: '2025-12-01',
    targetDate: '2026-07-31',
    budgetAllocated: '$580K',
    budgetSpent: '$210K',
    kpis: [
      { label: 'Rooms Upgraded', current: 120, target: 300, unit: '' },
      { label: 'Digital Check-In', current: 65, target: 100, unit: '%' },
    ],
    complianceLinked: false,
    blockers: [],
    nextAction: 'Phase 2 contractor walk-through',
  },
  {
    id: 'oi-financial-aid-automation',
    name: 'Financial Aid Automation',
    domain: 'financial',
    status: 'at_risk',
    owner: 'Dir. Financial Aid',
    description: 'Deploy automated aid packaging and disbursement across all institutions.',
    startDate: '2025-10-01',
    targetDate: '2026-05-31',
    budgetAllocated: '$150K',
    budgetSpent: '$88K',
    kpis: [
      { label: 'Auto-Packaged', current: 45, target: 80, unit: '%' },
      { label: 'Processing Days', current: 12, target: 5, unit: 'days' },
      { label: 'Error Rate', current: 8, target: 2, unit: '%' },
    ],
    complianceLinked: true,
    blockers: ['Legacy ERP integration delays'],
    nextAction: 'Complete UAT for aid-disbursement module',
  },
];

const WORKFLOWS: OpsWorkflow[] = [
  {
    id: 'ow-finaid-packaging',
    name: 'Financial Aid Packaging',
    domain: 'financial',
    status: 'bottleneck',
    description: 'End-to-end aid award processing — FAFSA verification → need analysis → packaging → disbursement.',
    totalSteps: 8,
    completedSteps: 5,
    avgCompletionDays: 14,
    slaTarget: 10,
    slaBreaches: 23,
    bottleneckStep: 'Need Analysis Review',
    currentRuns: 340,
  },
  {
    id: 'ow-housing-assignment',
    name: 'Housing Assignment',
    domain: 'campus',
    status: 'active',
    institution: 'KaNeXT',
    description: 'Application → lottery → assignment → confirmation → move-in preparation.',
    totalSteps: 6,
    completedSteps: 4,
    avgCompletionDays: 7,
    slaTarget: 10,
    slaBreaches: 2,
    currentRuns: 180,
  },
  {
    id: 'ow-course-registration',
    name: 'Course Registration',
    domain: 'academics',
    status: 'active',
    description: 'Advising clearance → registration window → add/drop → roster finalization.',
    totalSteps: 5,
    completedSteps: 3,
    avgCompletionDays: 5,
    slaTarget: 7,
    slaBreaches: 0,
    currentRuns: 820,
  },
  {
    id: 'ow-admissions-review',
    name: 'Admissions Application Review',
    domain: 'admissions',
    status: 'active',
    description: 'Receipt → completeness check → committee review → decision → notification.',
    totalSteps: 6,
    completedSteps: 4,
    avgCompletionDays: 8,
    slaTarget: 14,
    slaBreaches: 5,
    currentRuns: 450,
  },
  {
    id: 'ow-incident-response',
    name: 'Campus Incident Response',
    domain: 'campus',
    status: 'idle',
    description: 'Report → triage → investigation → resolution → follow-up → close.',
    totalSteps: 6,
    completedSteps: 6,
    avgCompletionDays: 3,
    slaTarget: 5,
    slaBreaches: 0,
    currentRuns: 0,
  },
];

const TASKS: OpsTask[] = [
  {
    id: 'ot-1',
    title: 'Review KaNeXT yield-day event plan',
    domain: 'admissions',
    status: 'in_progress',
    priority: 'critical',
    institution: 'KaNeXT',
    assignee: 'Dir. Admissions',
    dueDate: '2026-02-19',
    linkedInitiative: 'oi-fall-enrollment',
    description: 'Review and approve the Feb 22 yield-day event logistics, speakers, and communications.',
  },
  {
    id: 'ot-2',
    title: 'Complete SACSCOC Standard 6.2b evidence',
    domain: 'policies',
    status: 'overdue',
    priority: 'critical',
    institution: 'KaNeXT',
    assignee: 'Compliance Officer',
    dueDate: '2026-02-15',
    linkedInitiative: 'oi-accreditation-prep',
    description: 'Compile financial audit appendix and assessment data for Standard 6.2b.',
  },
  {
    id: 'ot-3',
    title: 'Unblock need-analysis review queue',
    domain: 'financial',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Dir. Financial Aid',
    dueDate: '2026-02-20',
    linkedWorkflow: 'ow-finaid-packaging',
    description: 'Clear 23 SLA-breached applications in the need-analysis bottleneck.',
  },
  {
    id: 'ot-4',
    title: 'Draft Title IX interim-guidance memo',
    domain: 'policies',
    status: 'pending',
    priority: 'high',
    assignee: 'General Counsel',
    dueDate: '2026-02-21',
    linkedInitiative: 'oi-title-ix-review',
    description: 'Interim guidance for campuses while awaiting DOE final rule on 106.45.',
  },
  {
    id: 'ot-5',
    title: 'KaNeXT housing Phase 2 walk-through',
    domain: 'campus',
    status: 'pending',
    priority: 'normal',
    institution: 'KaNeXT',
    assignee: 'Dir. Residential Life',
    dueDate: '2026-02-24',
    linkedInitiative: 'oi-housing-modernization',
    description: 'Contractor walk-through for Phase 2 residence hall renovation scope.',
  },
  {
    id: 'ot-7',
    title: 'Financial aid UAT sign-off',
    domain: 'financial',
    status: 'blocked',
    priority: 'high',
    assignee: 'IT Director',
    dueDate: '2026-02-23',
    linkedInitiative: 'oi-financial-aid-automation',
    description: 'Complete user-acceptance testing for the auto-packaging module. Blocked on ERP API.',
  },
  {
    id: 'ot-8',
    title: 'Send KaNeXT retention check-in emails',
    domain: 'academics',
    status: 'pending',
    priority: 'normal',
    institution: 'KaNeXT',
    assignee: 'Academic Advising',
    dueDate: '2026-02-20',
    linkedInitiative: 'oi-retention-sprint',
    description: 'Midterm retention-check emails to 200+ at-risk freshmen and sophomores.',
  },
  {
    id: 'ot-10',
    title: 'Process overdue admission decisions',
    domain: 'admissions',
    status: 'overdue',
    priority: 'high',
    institution: 'KaNeXT',
    assignee: 'Admissions Committee',
    dueDate: '2026-02-16',
    linkedWorkflow: 'ow-admissions-review',
    description: 'Clear backlog of 38 applications past SLA in committee review stage.',
  },
  {
    id: 'ot-12',
    title: 'Prepare Board Room agenda packet',
    domain: 'policies',
    status: 'pending',
    priority: 'high',
    assignee: 'Exec. Director',
    dueDate: '2026-02-23',
    description: 'Compile quarterly board meeting agenda, financials, and initiative status reports.',
  },
  {
    id: 'ot-13',
    title: 'Resolve KaNeXT housing maintenance backlog',
    domain: 'campus',
    status: 'in_progress',
    priority: 'normal',
    institution: 'KaNeXT',
    assignee: 'Maintenance Supervisor',
    dueDate: '2026-02-21',
    description: 'Address 15 open maintenance tickets in KaNeXT residential halls.',
  },
  {
    id: 'ot-15',
    title: 'Org-wide Title IX training schedule',
    domain: 'policies',
    status: 'pending',
    priority: 'normal',
    assignee: 'HR Director',
    dueDate: '2026-03-01',
    linkedInitiative: 'oi-title-ix-review',
    description: 'Schedule mandatory Title IX training sessions for all staff across KaNeXT.',
  },
];

const GATES: DecisionGate[] = [
  {
    id: 'og-1',
    title: 'Approve KaNeXT yield-day budget increase',
    domain: 'admissions',
    status: 'pending',
    requiredBy: '2026-02-20',
    requestor: 'Dir. Admissions',
    approvers: ['VP Enrollment', 'CFO – KaNeXT'],
    institution: 'KaNeXT',
    linkedInitiative: 'oi-fall-enrollment',
    description: 'Request to increase yield-day event budget by $15K for additional outreach.',
  },
  {
    id: 'og-2',
    title: 'SACSCOC evidence package sign-off',
    domain: 'policies',
    status: 'pending',
    requiredBy: '2026-03-01',
    requestor: 'Compliance Officer',
    approvers: ['Provost', 'President'],
    institution: 'KaNeXT',
    linkedInitiative: 'oi-accreditation-prep',
    description: 'Final approval of Standards 1-6 evidence package before submission.',
  },
  {
    id: 'og-4',
    title: 'Title IX interim policy approval',
    domain: 'policies',
    status: 'escalated',
    requiredBy: '2026-02-25',
    requestor: 'General Counsel',
    approvers: ['Exec. Director', 'Board Chair'],
    linkedInitiative: 'oi-title-ix-review',
    description: 'Approve interim Title IX guidance for distribution to all campuses.',
  },
  {
    id: 'og-5',
    title: 'Financial aid automation go-live',
    domain: 'financial',
    status: 'pending',
    requiredBy: '2026-03-15',
    requestor: 'IT Director',
    approvers: ['Dir. Financial Aid', 'CFO'],
    linkedInitiative: 'oi-financial-aid-automation',
    description: 'Approve production deployment of automated aid-packaging system.',
  },
];

// =============================================================================
// SCORECARD TYPES
// =============================================================================

export interface ScorecardKPI {
  label: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
}

export interface DomainScorecard {
  domain: OpsDomain;
  health: 'green' | 'yellow' | 'red';
  kpis: ScorecardKPI[];
}

const SCORECARDS: DomainScorecard[] = [
  {
    domain: 'admissions',
    health: 'yellow',
    kpis: [
      { label: 'Applications', current: 5200, target: 6000, unit: '', trend: 'up' },
      { label: 'Admit Rate', current: 64, target: 68, unit: '%', trend: 'flat' },
      { label: 'Deposits', current: 1020, target: 1400, unit: '', trend: 'up' },
      { label: 'Yield Rate', current: 38, target: 42, unit: '%', trend: 'down' },
    ],
  },
  {
    domain: 'academics',
    health: 'green',
    kpis: [
      { label: 'Retention Rate', current: 79, target: 82, unit: '%', trend: 'up' },
      { label: 'Graduation Rate', current: 48, target: 55, unit: '%', trend: 'up' },
      { label: 'Course Fill Rate', current: 91, target: 85, unit: '%', trend: 'flat' },
      { label: 'Faculty-Student Ratio', current: 14, target: 15, unit: ':1', trend: 'flat' },
    ],
  },
  {
    domain: 'campus',
    health: 'green',
    kpis: [
      { label: 'Housing Occupancy', current: 88, target: 90, unit: '%', trend: 'up' },
      { label: 'Maintenance Response', current: 2.1, target: 3, unit: 'days', trend: 'down' },
      { label: 'Safety Incidents', current: 3, target: 0, unit: '/mo', trend: 'down' },
    ],
  },
  {
    domain: 'financial',
    health: 'red',
    kpis: [
      { label: 'Tuition Collections', current: 82, target: 95, unit: '%', trend: 'up' },
      { label: 'AR Aging >90d', current: 2.4, target: 1.0, unit: '$M', trend: 'up' },
      { label: 'Aid Packaging Rate', current: 68, target: 90, unit: '%', trend: 'up' },
      { label: 'Budget Variance', current: -4.2, target: 0, unit: '%', trend: 'down' },
    ],
  },
  {
    domain: 'policies',
    health: 'yellow',
    kpis: [
      { label: 'Accreditation Readiness', current: 73, target: 100, unit: '%', trend: 'up' },
      { label: 'Title IX Cases Open', current: 4, target: 0, unit: '', trend: 'flat' },
      { label: 'Policy Updates Due', current: 6, target: 0, unit: '', trend: 'down' },
      { label: 'Audit Findings Open', current: 8, target: 0, unit: '', trend: 'down' },
    ],
  },
];

// =============================================================================
// DASHBOARD TILES
// =============================================================================

export interface DashboardTiles {
  todayTasks: number;
  next7DaysTasks: number;
  blockedInitiatives: number;
  atRiskInitiatives: number;
  pendingGates: number;
  escalatedGates: number;
  slaBreaches: number;
  domainHealth: { domain: OpsDomain; health: 'green' | 'yellow' | 'red' }[];
  approvalPressure: number;       // pending gates + overdue tasks
  ownerCoverage: number;          // % of tasks with assigned owner
}

function computeDashboard(
  initiatives: OpsInitiative[],
  tasks: OpsTask[],
  gates: DecisionGate[],
  workflows: OpsWorkflow[],
  scorecards: DomainScorecard[],
): DashboardTiles {
  const today = '2026-02-18';
  const next7 = '2026-02-25';
  const todayTasks = tasks.filter((t) => t.dueDate <= today && t.status !== 'completed').length;
  const next7DaysTasks = tasks.filter((t) => t.dueDate > today && t.dueDate <= next7 && t.status !== 'completed').length;
  const blockedInitiatives = initiatives.filter((i) => i.status === 'blocked').length;
  const atRiskInitiatives = initiatives.filter((i) => i.status === 'at_risk').length;
  const pendingGates = gates.filter((g) => g.status === 'pending').length;
  const escalatedGates = gates.filter((g) => g.status === 'escalated').length;
  const slaBreaches = workflows.reduce((sum, w) => sum + w.slaBreaches, 0);
  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;
  const approvalPressure = pendingGates + overdueTasks;
  const assignedTasks = tasks.filter((t) => t.assignee && t.assignee.length > 0).length;
  const ownerCoverage = tasks.length > 0 ? Math.round((assignedTasks / tasks.length) * 100) : 100;
  const domainHealth = scorecards.map((s) => ({ domain: s.domain, health: s.health }));

  return {
    todayTasks,
    next7DaysTasks,
    blockedInitiatives,
    atRiskInitiatives,
    pendingGates,
    escalatedGates,
    slaBreaches,
    domainHealth,
    approvalPressure,
    ownerCoverage,
  };
}

// =============================================================================
// FACTORY
// =============================================================================

export function getEduOpsV2Data() {
  return {
    initiatives: INITIATIVES,
    workflows: WORKFLOWS,
    tasks: TASKS,
    gates: GATES,
    scorecards: SCORECARDS,
    dashboardTiles: computeDashboard(INITIATIVES, TASKS, GATES, WORKFLOWS, SCORECARDS),
  };
}
