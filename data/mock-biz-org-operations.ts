/**
 * Business Organization Operations — Mock Data & Types (v2)
 * CEO-centric operational command center for Business Mode.
 * Triage | Initiatives | Projects | Tasks | Blockers | Decisions
 *
 * Governance rules:
 * - Blocked initiative MUST have linked Blocker
 * - Approved Decision MUST have linked receipt
 * - All entities reference seeded entity names from biz-org-shared-types
 */

import type { BizReceipt, CrossTabLink } from '@/data/biz-org-shared-types';
import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  SPONSOR_BANK,
  PAYMENT_PROCESSOR,
  SLIEMA_WANDERERS,
  TARGET_BANK,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';

// =============================================================================
// TYPES
// =============================================================================

export interface OpsInitiative {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  progress: number; // 0-100
  projectCount: number;
  owner: string;
  entityId: string;
  entityName: string;
  startDate: string;
  targetDate: string;
  linkedProof: string | null;
}

export interface OpsProject {
  id: string;
  name: string;
  initiativeId: string;
  initiativeName: string;
  status: 'active' | 'at_risk' | 'blocked' | 'completed';
  taskCompletion: number; // 0-100
  owner: string;
  entityName: string;
  startDate: string;
  dueDate: string;
}

export interface OpsTask {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  assignee: string;
  dueDate: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  entityName: string;
}

export interface OpsBlocker {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  initiativeId: string;
  initiativeName: string;
  owner: string;
  status: 'open' | 'investigating' | 'resolved';
  createdDate: string;
  entityName: string;
}

export interface OpsDecision {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'open' | 'approved' | 'rejected';
  proposedBy: string;
  voters: string[];
  date: string;
  receiptId?: string;
  entityName: string;
  linkedInitiativeId?: string;
  implementationOwner: string;
}

export interface OpsSummaryTile {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

export type OpsSubTabId =
  | 'triage'
  | 'initiatives'
  | 'projects'
  | 'tasks'
  | 'blockers'
  | 'decisions';

export interface OpsSubTab {
  id: OpsSubTabId;
  label: string;
}

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export const OPS_SUB_TABS: OpsSubTab[] = [
  { id: 'triage', label: 'Triage' },
  { id: 'initiatives', label: 'Initiatives' },
  { id: 'projects', label: 'Projects' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'blockers', label: 'Blockers' },
  { id: 'decisions', label: 'Decisions' },
];

// =============================================================================
// STATUS COLOR MAPS
// =============================================================================

export const INITIATIVE_STATUS_COLOR: Record<OpsInitiative['status'], string> = {
  active: '#22C55E',
  paused: '#F59E0B',
  completed: '#A1A1AA',
};

export const PROJECT_STATUS_COLOR: Record<OpsProject['status'], string> = {
  active: '#22C55E',
  at_risk: '#F59E0B',
  blocked: '#EF4444',
  completed: '#A1A1AA',
};

export const TASK_PRIORITY_COLOR: Record<OpsTask['priority'], string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#1D9BF0',
  low: '#A1A1AA',
};

export const TASK_STATUS_COLOR: Record<OpsTask['status'], string> = {
  todo: '#A1A1AA',
  in_progress: '#1D9BF0',
  review: '#1D9BF0',
  done: '#22C55E',
};

export const BLOCKER_SEVERITY_COLOR: Record<OpsBlocker['severity'], string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#1D9BF0',
};

export const BLOCKER_STATUS_COLOR: Record<OpsBlocker['status'], string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
};

export const DECISION_STATUS_COLOR: Record<OpsDecision['status'], string> = {
  draft: '#A1A1AA',
  open: '#F59E0B',
  approved: '#22C55E',
  rejected: '#EF4444',
};

// =============================================================================
// SUMMARY TILES
// =============================================================================

const MOCK_SUMMARY_TILES: OpsSummaryTile[] = [
  {
    id: 'tile-active-initiatives',
    label: 'Active Initiatives',
    value: '4',
    icon: 'flag.fill',
    color: '#1D9BF0',
  },
  {
    id: 'tile-open-projects',
    label: 'Open Projects',
    value: '8',
    icon: 'folder.fill',
    color: '#1D9BF0',
  },
  {
    id: 'tile-pending-tasks',
    label: 'Pending Tasks',
    value: '23',
    icon: 'checkmark.circle.fill',
    color: '#22C55E',
  },
  {
    id: 'tile-critical-blockers',
    label: 'Critical Blockers',
    value: '2',
    icon: 'exclamationmark.octagon.fill',
    color: '#EF4444',
  },
  {
    id: 'tile-decisions-needed',
    label: 'Decisions Needed',
    value: '3',
    icon: 'hand.raised.fill',
    color: '#F59E0B',
  },
  {
    id: 'tile-due-soon',
    label: 'Due Soon',
    value: '5',
    icon: 'clock.fill',
    color: '#F59E0B',
  },
];

// =============================================================================
// INITIATIVES
// =============================================================================

const MOCK_INITIATIVES: OpsInitiative[] = [
  {
    id: 'init-1',
    name: 'Payment Rails v2 Launch',
    description: 'Complete overhaul of the payment processing infrastructure to support multi-currency, real-time settlement, and PCI DSS Level 1 compliance across all operating entities.',
    status: 'active',
    progress: 62,
    projectCount: 3,
    owner: 'Alex Morgan',
    entityId: KANEXT_OPSCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    startDate: 'Nov 15, 2025',
    targetDate: 'Apr 30, 2026',
    linkedProof: 'PCI DSS Level 1 certification report',
  },
  {
    id: 'init-2',
    name: 'Series B Deployment',
    description: 'Strategic capital deployment from Series B close into product, talent acquisition, and international market entry per board-approved use-of-proceeds matrix.',
    status: 'active',
    progress: 38,
    projectCount: 2,
    owner: 'Alex Morgan',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    startDate: 'Jan 10, 2026',
    targetDate: 'Jun 30, 2026',
    linkedProof: 'Board-approved use-of-proceeds matrix v2',
  },
  {
    id: 'init-3',
    name: 'International Expansion (Malta)',
    description: 'Establish Malta operating entity, secure MGA gaming license, open local bank accounts, and onboard initial European customer cohort through Sliema partnership.',
    status: 'paused',
    progress: 22,
    projectCount: 2,
    owner: 'Derek Novak',
    entityId: SLIEMA_WANDERERS,
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    startDate: 'Dec 1, 2025',
    targetDate: 'Sep 30, 2026',
    linkedProof: null,
  },
  {
    id: 'init-4',
    name: 'KaNeXT OS Platform Build',
    description: 'End-to-end development of the KaNeXT OS cross-platform application including Nexus AI, mode switching, RBAC, business dashboard, and competition management.',
    status: 'active',
    progress: 74,
    projectCount: 3,
    owner: 'Marcus Chen',
    entityId: KANEXT_IP,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    startDate: 'Sep 1, 2025',
    targetDate: 'May 31, 2026',
    linkedProof: 'TestFlight build v2.4.0 + App Store review screenshots',
  },
  {
    id: 'init-5',
    name: 'Q1 Revenue Acceleration',
    description: 'Cross-functional push to close enterprise pipeline deals, launch partner referral program, and convert pilot customers to paid annual contracts before end of Q1.',
    status: 'active',
    progress: 55,
    projectCount: 2,
    owner: 'Aisha Thompson',
    entityId: KANEXT_HOLDCO,
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    startDate: 'Jan 1, 2026',
    targetDate: 'Mar 31, 2026',
    linkedProof: 'Signed LOIs and executed annual contracts',
  },
];

// =============================================================================
// PROJECTS
// =============================================================================

const MOCK_PROJECTS: OpsProject[] = [
  {
    id: 'proj-1',
    name: 'Payment Gateway Integration',
    initiativeId: 'init-1',
    initiativeName: 'Payment Rails v2 Launch',
    status: 'active',
    taskCompletion: 68,
    owner: 'Marcus Chen',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    startDate: 'Nov 20, 2025',
    dueDate: 'Mar 15, 2026',
  },
  {
    id: 'proj-2',
    name: 'PCI DSS Level 1 Certification',
    initiativeId: 'init-1',
    initiativeName: 'Payment Rails v2 Launch',
    status: 'at_risk',
    taskCompletion: 45,
    owner: 'Derek Novak',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    startDate: 'Dec 1, 2025',
    dueDate: 'Apr 15, 2026',
  },
  {
    id: 'proj-3',
    name: 'Multi-Currency Settlement Engine',
    initiativeId: 'init-1',
    initiativeName: 'Payment Rails v2 Launch',
    status: 'active',
    taskCompletion: 52,
    owner: 'Priya Sharma',
    entityName: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
    startDate: 'Jan 5, 2026',
    dueDate: 'Apr 30, 2026',
  },
  {
    id: 'proj-4',
    name: 'Talent Acquisition — Engineering (8 FTE)',
    initiativeId: 'init-2',
    initiativeName: 'Series B Deployment',
    status: 'active',
    taskCompletion: 35,
    owner: 'Sandra Wen',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    startDate: 'Jan 15, 2026',
    dueDate: 'May 31, 2026',
  },
  {
    id: 'proj-5',
    name: 'Product Roadmap Execution — Q1/Q2',
    initiativeId: 'init-2',
    initiativeName: 'Series B Deployment',
    status: 'active',
    taskCompletion: 42,
    owner: 'Alex Morgan',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    startDate: 'Jan 10, 2026',
    dueDate: 'Jun 30, 2026',
  },
  {
    id: 'proj-6',
    name: 'Malta Entity Registration',
    initiativeId: 'init-3',
    initiativeName: 'International Expansion (Malta)',
    status: 'blocked',
    taskCompletion: 18,
    owner: 'Derek Novak',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    startDate: 'Dec 15, 2025',
    dueDate: 'Jun 30, 2026',
  },
  {
    id: 'proj-7',
    name: 'MGA License Application',
    initiativeId: 'init-3',
    initiativeName: 'International Expansion (Malta)',
    status: 'blocked',
    taskCompletion: 8,
    owner: 'Legal Team',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    startDate: 'Feb 1, 2026',
    dueDate: 'Sep 30, 2026',
  },
  {
    id: 'proj-8',
    name: 'Nexus AI v2 — Context Engine',
    initiativeId: 'init-4',
    initiativeName: 'KaNeXT OS Platform Build',
    status: 'active',
    taskCompletion: 81,
    owner: 'Marcus Chen',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    startDate: 'Oct 1, 2025',
    dueDate: 'Mar 31, 2026',
  },
  {
    id: 'proj-9',
    name: 'Business Mode Dashboard',
    initiativeId: 'init-4',
    initiativeName: 'KaNeXT OS Platform Build',
    status: 'active',
    taskCompletion: 72,
    owner: 'Jasmine Ortiz',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    startDate: 'Nov 1, 2025',
    dueDate: 'Apr 15, 2026',
  },
  {
    id: 'proj-10',
    name: 'RBAC & Mode Switching',
    initiativeId: 'init-4',
    initiativeName: 'KaNeXT OS Platform Build',
    status: 'completed',
    taskCompletion: 100,
    owner: 'Marcus Chen',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
    startDate: 'Sep 15, 2025',
    dueDate: 'Feb 28, 2026',
  },
  {
    id: 'proj-11',
    name: 'Enterprise Pipeline Close Campaign',
    initiativeId: 'init-5',
    initiativeName: 'Q1 Revenue Acceleration',
    status: 'active',
    taskCompletion: 60,
    owner: 'Aisha Thompson',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    startDate: 'Jan 5, 2026',
    dueDate: 'Mar 31, 2026',
  },
];

// =============================================================================
// TASKS
// =============================================================================

const MOCK_TASKS: OpsTask[] = [
  {
    id: 'task-1',
    title: 'Finalize Stripe Connect integration for multi-party payouts',
    projectId: 'proj-1',
    projectName: 'Payment Gateway Integration',
    assignee: 'Marcus Chen',
    dueDate: 'Mar 5, 2026',
    priority: 'critical',
    status: 'in_progress',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'task-2',
    title: 'Complete PCI self-assessment questionnaire (SAQ-D)',
    projectId: 'proj-2',
    projectName: 'PCI DSS Level 1 Certification',
    assignee: 'Derek Novak',
    dueDate: 'Mar 10, 2026',
    priority: 'high',
    status: 'in_progress',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'task-3',
    title: 'Engage QSA auditor for on-site assessment',
    projectId: 'proj-2',
    projectName: 'PCI DSS Level 1 Certification',
    assignee: 'Derek Novak',
    dueDate: 'Mar 20, 2026',
    priority: 'high',
    status: 'todo',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'task-4',
    title: 'Build EUR/GBP/USD settlement reconciliation module',
    projectId: 'proj-3',
    projectName: 'Multi-Currency Settlement Engine',
    assignee: 'Priya Sharma',
    dueDate: 'Mar 15, 2026',
    priority: 'high',
    status: 'in_progress',
    entityName: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
  },
  {
    id: 'task-5',
    title: 'Publish 3 senior engineer roles on LinkedIn + AngelList',
    projectId: 'proj-4',
    projectName: 'Talent Acquisition — Engineering (8 FTE)',
    assignee: 'Sandra Wen',
    dueDate: 'Mar 3, 2026',
    priority: 'medium',
    status: 'done',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'task-6',
    title: 'Schedule final-round interviews for backend candidates',
    projectId: 'proj-4',
    projectName: 'Talent Acquisition — Engineering (8 FTE)',
    assignee: 'Sandra Wen',
    dueDate: 'Mar 12, 2026',
    priority: 'medium',
    status: 'in_progress',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'task-7',
    title: 'Submit Malta company formation docs to Registrar',
    projectId: 'proj-6',
    projectName: 'Malta Entity Registration',
    assignee: 'Legal Team',
    dueDate: 'Mar 8, 2026',
    priority: 'high',
    status: 'todo',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'task-8',
    title: 'Open Malta corporate bank account (Bank of Valletta)',
    projectId: 'proj-6',
    projectName: 'Malta Entity Registration',
    assignee: 'Derek Novak',
    dueDate: 'Apr 1, 2026',
    priority: 'medium',
    status: 'todo',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'task-9',
    title: 'Train contextual embedding model on sports domain corpus',
    projectId: 'proj-8',
    projectName: 'Nexus AI v2 — Context Engine',
    assignee: 'Marcus Chen',
    dueDate: 'Mar 7, 2026',
    priority: 'critical',
    status: 'review',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
  },
  {
    id: 'task-10',
    title: 'Implement dashboard tile rendering for all 10 biz tabs',
    projectId: 'proj-9',
    projectName: 'Business Mode Dashboard',
    assignee: 'Jasmine Ortiz',
    dueDate: 'Mar 14, 2026',
    priority: 'high',
    status: 'in_progress',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
  },
  {
    id: 'task-11',
    title: 'Wire operations v2 component into org tab router',
    projectId: 'proj-9',
    projectName: 'Business Mode Dashboard',
    assignee: 'Jasmine Ortiz',
    dueDate: 'Mar 18, 2026',
    priority: 'medium',
    status: 'todo',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
  },
  {
    id: 'task-12',
    title: 'Close Acme Corp enterprise pilot to annual contract',
    projectId: 'proj-11',
    projectName: 'Enterprise Pipeline Close Campaign',
    assignee: 'Aisha Thompson',
    dueDate: 'Mar 10, 2026',
    priority: 'critical',
    status: 'in_progress',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'task-13',
    title: 'Send LOI to DataStream for platform integration deal',
    projectId: 'proj-11',
    projectName: 'Enterprise Pipeline Close Campaign',
    assignee: 'Aisha Thompson',
    dueDate: 'Mar 15, 2026',
    priority: 'high',
    status: 'todo',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'task-16',
    title: 'Prepare MGA personal declaration forms for all directors',
    projectId: 'proj-7',
    projectName: 'MGA License Application',
    assignee: 'Legal Team',
    dueDate: 'Mar 25, 2026',
    priority: 'medium',
    status: 'todo',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'task-17',
    title: 'Run load test on settlement engine (10K TPS target)',
    projectId: 'proj-3',
    projectName: 'Multi-Currency Settlement Engine',
    assignee: 'Marcus Chen',
    dueDate: 'Mar 22, 2026',
    priority: 'high',
    status: 'todo',
    entityName: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
  },
  {
    id: 'task-18',
    title: 'Review and sign offer letters for 2 frontend hires',
    projectId: 'proj-4',
    projectName: 'Talent Acquisition — Engineering (8 FTE)',
    assignee: 'Alex Morgan',
    dueDate: 'Mar 8, 2026',
    priority: 'high',
    status: 'review',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
  },
  {
    id: 'task-19',
    title: 'Ship product roadmap update to board Slack channel',
    projectId: 'proj-5',
    projectName: 'Product Roadmap Execution — Q1/Q2',
    assignee: 'Alex Morgan',
    dueDate: 'Mar 1, 2026',
    priority: 'low',
    status: 'done',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_IP],
  },
  {
    id: 'task-20',
    title: 'Negotiate annual Stripe volume discount (>$500K ARR)',
    projectId: 'proj-1',
    projectName: 'Payment Gateway Integration',
    assignee: 'Priya Sharma',
    dueDate: 'Mar 28, 2026',
    priority: 'medium',
    status: 'todo',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
];

// =============================================================================
// BLOCKERS — Governance: blocked initiative MUST have linked Blocker
// =============================================================================

const MOCK_BLOCKERS: OpsBlocker[] = [
  {
    id: 'block-1',
    title: 'Malta UBO documentation rejected by Registrar',
    description: 'The Maltese Registrar of Companies returned the UBO (Ultimate Beneficial Owner) declaration citing incomplete chain-of-ownership documentation for KaNeXT HoldCo. Legal team is preparing amended filings.',
    severity: 'critical',
    initiativeId: 'init-3',
    initiativeName: 'International Expansion (Malta)',
    owner: 'Derek Novak',
    status: 'investigating',
    createdDate: 'Feb 12, 2026',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'block-2',
    title: 'PCI QSA auditor availability delayed 3 weeks',
    description: 'Preferred QSA auditor (Coalfire) has a scheduling conflict and cannot begin on-site assessment until mid-April, pushing the PCI DSS certification timeline at risk of missing the Rails v2 launch date.',
    severity: 'critical',
    initiativeId: 'init-1',
    initiativeName: 'Payment Rails v2 Launch',
    owner: 'Derek Novak',
    status: 'open',
    createdDate: 'Feb 18, 2026',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
  },
  {
    id: 'block-3',
    title: 'MGA license pre-application requires in-country director',
    description: 'Malta Gaming Authority requires at least one director to be a Maltese resident or EU citizen with local registration. Current board does not meet this requirement.',
    severity: 'high',
    initiativeId: 'init-3',
    initiativeName: 'International Expansion (Malta)',
    owner: 'Legal Team',
    status: 'open',
    createdDate: 'Feb 20, 2026',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
  },
  {
    id: 'block-5',
    title: 'Stripe Connect payout delays for international merchants',
    description: 'Stripe Connect cross-border payouts to non-US merchants are experiencing 72-hour settlement delays due to additional compliance checks. Affecting multi-currency settlement testing.',
    severity: 'medium',
    initiativeId: 'init-1',
    initiativeName: 'Payment Rails v2 Launch',
    owner: 'Priya Sharma',
    status: 'investigating',
    createdDate: 'Mar 1, 2026',
    entityName: SEEDED_ENTITY_NAMES[PAYMENT_PROCESSOR],
  },
];

// =============================================================================
// DECISIONS — Governance: approved Decision MUST have linked receipt
// =============================================================================

const MOCK_RECEIPTS: BizReceipt[] = [
  {
    id: 'rcpt-ops-1',
    type: 'decision',
    action: 'Approved: Proceed with Coalfire alternative QSA (SecureWorks)',
    actor: 'Alex Morgan',
    timestamp: '2026-02-15T14:30:00Z',
    linkedEntity: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    linkedTab: 'operations',
    linkedId: 'dec-2',
    immutable: true,
  },
  {
    id: 'rcpt-ops-2',
    type: 'decision',
    action: 'Approved: Hire EU-based non-executive director for Malta entity',
    actor: 'Alex Morgan',
    timestamp: '2026-02-22T09:15:00Z',
    linkedEntity: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    linkedTab: 'operations',
    linkedId: 'dec-4',
    immutable: true,
  },
];

const MOCK_DECISIONS: OpsDecision[] = [
  {
    id: 'dec-1',
    title: 'Accelerate Series B deployment by 30 days',
    description: 'Move forward the capital deployment schedule from the original 6-month glide path to 5 months to capture hiring market window and product launch timing.',
    status: 'open',
    proposedBy: 'Alex Morgan',
    voters: ['Alex Morgan', 'Board Member A', 'Board Member B'],
    date: 'Mar 3, 2026',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_HOLDCO],
    linkedInitiativeId: 'init-2',
    implementationOwner: 'Alex Morgan',
  },
  {
    id: 'dec-2',
    title: 'Switch QSA auditor from Coalfire to SecureWorks',
    description: 'Due to Coalfire scheduling delay, switch to SecureWorks for PCI DSS Level 1 assessment to maintain the Payment Rails v2 launch timeline.',
    status: 'approved',
    proposedBy: 'Derek Novak',
    voters: ['Alex Morgan', 'Derek Novak', 'Marcus Chen'],
    date: 'Feb 15, 2026',
    receiptId: 'rcpt-ops-1',
    entityName: SEEDED_ENTITY_NAMES[KANEXT_OPSCO],
    linkedInitiativeId: 'init-1',
    implementationOwner: 'Derek Novak',
  },
  {
    id: 'dec-3',
    title: 'Pause Malta expansion until Q3 2026',
    description: 'Given the UBO documentation rejection and in-country director requirement, propose pausing the Malta expansion initiative and redirecting resources to Q1 revenue acceleration.',
    status: 'draft',
    proposedBy: 'Derek Novak',
    voters: [],
    date: 'Mar 1, 2026',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    linkedInitiativeId: 'init-3',
    implementationOwner: 'Derek Novak',
  },
  {
    id: 'dec-4',
    title: 'Hire EU-based non-executive director for Malta entity',
    description: 'Engage a Malta-based non-executive director to satisfy MGA licensing requirement. Estimated annual retainer: EUR 24,000.',
    status: 'approved',
    proposedBy: 'Legal Team',
    voters: ['Alex Morgan', 'Derek Novak'],
    date: 'Feb 22, 2026',
    receiptId: 'rcpt-ops-2',
    entityName: SEEDED_ENTITY_NAMES[SLIEMA_WANDERERS],
    linkedInitiativeId: 'init-3',
    implementationOwner: 'Legal Team',
  },
];

// =============================================================================
// OPS FEED
// =============================================================================

export interface OpsFeedEvent {
  id: string;
  type: 'initiative_moved' | 'blocker_created' | 'decision_approved' | 'deliverable_shipped';
  title: string;
  actor: string;
  timestamp: string;
  entityId: string;
}

const MOCK_OPS_FEED: OpsFeedEvent[] = [
  {
    id: 'feed-1',
    type: 'decision_approved',
    title: 'QSA auditor switch to SecureWorks approved',
    actor: 'Alex Morgan',
    timestamp: '2026-02-15T14:30:00Z',
    entityId: KANEXT_OPSCO,
  },
  {
    id: 'feed-2',
    type: 'blocker_created',
    title: 'PCI QSA auditor availability delayed 3 weeks',
    actor: 'Derek Novak',
    timestamp: '2026-02-18T09:00:00Z',
    entityId: KANEXT_OPSCO,
  },
  {
    id: 'feed-3',
    type: 'initiative_moved',
    title: 'International Expansion (Malta) paused — UBO documentation issue',
    actor: 'Derek Novak',
    timestamp: '2026-02-20T11:15:00Z',
    entityId: SLIEMA_WANDERERS,
  },
  {
    id: 'feed-4',
    type: 'decision_approved',
    title: 'EU-based non-executive director hire approved for Malta entity',
    actor: 'Alex Morgan',
    timestamp: '2026-02-22T09:15:00Z',
    entityId: SLIEMA_WANDERERS,
  },
  {
    id: 'feed-5',
    type: 'deliverable_shipped',
    title: 'RBAC & Mode Switching project completed (100%)',
    actor: 'Marcus Chen',
    timestamp: '2026-02-28T16:00:00Z',
    entityId: KANEXT_IP,
  },
  {
    id: 'feed-7',
    type: 'initiative_moved',
    title: 'KaNeXT OS Platform Build reached 74% progress',
    actor: 'Marcus Chen',
    timestamp: '2026-03-01T08:00:00Z',
    entityId: KANEXT_IP,
  },
  {
    id: 'feed-8',
    type: 'deliverable_shipped',
    title: 'Product roadmap update shipped to board Slack channel',
    actor: 'Alex Morgan',
    timestamp: '2026-03-01T12:00:00Z',
    entityId: KANEXT_IP,
  },
];

// =============================================================================
// TRIAGE HELPERS
// =============================================================================

export interface TriageItem {
  id: string;
  type: 'blocker' | 'decision' | 'task' | 'project';
  title: string;
  subtitle: string;
  entityName: string;
  initiativeName: string;
  urgencyColor: string;
  date: string;
}

function buildTriageCriticalBlockers(): TriageItem[] {
  return MOCK_BLOCKERS
    .filter((b) => b.severity === 'critical' && b.status !== 'resolved')
    .map((b) => ({
      id: b.id,
      type: 'blocker' as const,
      title: b.title,
      subtitle: `${b.severity.toUpperCase()} \u2022 ${b.status}`,
      entityName: b.entityName,
      initiativeName: b.initiativeName,
      urgencyColor: BLOCKER_SEVERITY_COLOR[b.severity],
      date: b.createdDate,
    }));
}

function buildTriageDecisionsNeeded(): TriageItem[] {
  return MOCK_DECISIONS
    .filter((d) => d.status === 'open' || d.status === 'draft')
    .map((d) => ({
      id: d.id,
      type: 'decision' as const,
      title: d.title,
      subtitle: `${d.status.toUpperCase()} \u2022 ${d.proposedBy}`,
      entityName: d.entityName,
      initiativeName: d.linkedInitiativeId
        ? (MOCK_INITIATIVES.find((i) => i.id === d.linkedInitiativeId)?.name ?? '')
        : '',
      urgencyColor: DECISION_STATUS_COLOR[d.status],
      date: d.date,
    }));
}

function buildTriageDueSoon(): TriageItem[] {
  return MOCK_TASKS
    .filter((t) => t.status !== 'done' && (t.priority === 'critical' || t.priority === 'high'))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      subtitle: `${t.assignee} \u2022 Due ${t.dueDate}`,
      entityName: t.entityName,
      initiativeName: t.projectName,
      urgencyColor: TASK_PRIORITY_COLOR[t.priority],
      date: t.dueDate,
    }));
}

function buildTriageRecentlyChanged(): TriageItem[] {
  const recentProjects: TriageItem[] = MOCK_PROJECTS
    .filter((p) => p.status === 'at_risk' || p.status === 'blocked')
    .map((p) => ({
      id: p.id,
      type: 'project' as const,
      title: p.name,
      subtitle: `${p.status.replace('_', ' ').toUpperCase()} \u2022 ${p.taskCompletion}% complete`,
      entityName: p.entityName,
      initiativeName: p.initiativeName,
      urgencyColor: PROJECT_STATUS_COLOR[p.status],
      date: p.dueDate,
    }));

  const recentBlockers: TriageItem[] = MOCK_BLOCKERS
    .filter((b) => b.severity !== 'critical' && b.status !== 'resolved')
    .map((b) => ({
      id: b.id,
      type: 'blocker' as const,
      title: b.title,
      subtitle: `${b.severity.toUpperCase()} \u2022 ${b.status}`,
      entityName: b.entityName,
      initiativeName: b.initiativeName,
      urgencyColor: BLOCKER_SEVERITY_COLOR[b.severity],
      date: b.createdDate,
    }));

  return [...recentProjects, ...recentBlockers];
}

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export interface BizOpsV2Data {
  summaryTiles: OpsSummaryTile[];
  initiatives: OpsInitiative[];
  projects: OpsProject[];
  tasks: OpsTask[];
  blockers: OpsBlocker[];
  decisions: OpsDecision[];
  receipts: BizReceipt[];
  opsFeed: OpsFeedEvent[];
  triage: {
    criticalBlockers: TriageItem[];
    decisionsNeeded: TriageItem[];
    dueSoon: TriageItem[];
    recentlyChanged: TriageItem[];
  };
}

export function getBizOpsData(): BizOpsV2Data {
  return {
    summaryTiles: MOCK_SUMMARY_TILES,
    initiatives: MOCK_INITIATIVES,
    projects: MOCK_PROJECTS,
    tasks: MOCK_TASKS,
    blockers: MOCK_BLOCKERS,
    decisions: MOCK_DECISIONS,
    receipts: MOCK_RECEIPTS,
    opsFeed: MOCK_OPS_FEED,
    triage: {
      criticalBlockers: buildTriageCriticalBlockers(),
      decisionsNeeded: buildTriageDecisionsNeeded(),
      dueSoon: buildTriageDueSoon(),
      recentlyChanged: buildTriageRecentlyChanged(),
    },
  };
}
