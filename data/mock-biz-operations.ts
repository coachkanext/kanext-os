/**
 * Mock Business Operations Data — KaNeXT OS Business Mode "Operations" tab.
 *
 * Provides typed mock data for: Blockers, Initiatives, Projects,
 * Decision Queue, and Ops Feed.
 *
 * All data references KaNeXT entities:
 *   Alex Morgan, KaNeXT, KaNeXT Church, K-1, PBD/Tom,
 *   Adriana Ruiz, Marcus Chen, Jordan Hayes, Lisa Park, David Okonkwo.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Blocker {
  id: string;
  title: string;
  owner: string;
  severity: 'critical' | 'high' | 'medium';
  category: string;
  daysBlocked: number;
  impact: string;
}

export interface Initiative {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'done' | 'blocked';
  progress: number;
  owner: string;
  items: number;
  dueLabel: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface Project {
  id: string;
  name: string;
  initiative: string;
  status: 'active' | 'blocked' | 'done';
  progress: number;
  owner: string;
  items: number;
  dueLabel: string;
  priority: 'critical' | 'high' | 'medium';
}

export interface DecisionItem {
  id: string;
  title: string;
  type: 'approval' | 'review' | 'escalation';
  requester: string;
  deadline: string;
  status: 'pending' | 'approved' | 'rejected' | 'deferred';
  impact: string;
}

export interface OpsFeedItem {
  id: string;
  text: string;
  timestamp: string;
  category:
    | 'blocker_resolved'
    | 'initiative_update'
    | 'project_milestone'
    | 'decision_made'
    | 'alert';
}

// =============================================================================
// BLOCKERS
// =============================================================================

export const TOP_BLOCKERS: Blocker[] = [
  {
    id: 'blk-1',
    title: 'Video pipeline GPU allocation stalled',
    owner: 'Adriana Ruiz',
    severity: 'critical',
    category: 'Engineering',
    daysBlocked: 6,
    impact:
      'Delays KaNeXT highlight-reel ingestion; demo footage for PBD board meeting unavailable until resolved.',
  },
  {
    id: 'blk-2',
    title: 'Payment rails — Stripe Connect onboarding rejected',
    owner: 'David Okonkwo',
    severity: 'critical',
    category: 'Finance / Ops',
    daysBlocked: 4,
    impact:
      'KaNeXT Church pilot launch cannot collect campus donations; blocks $12K MRR milestone for Q2 board deck.',
  },
  {
    id: 'blk-3',
    title: 'K-1 API auth token rotation failing in staging',
    owner: 'Adriana Ruiz',
    severity: 'high',
    category: 'Engineering',
    daysBlocked: 3,
    impact:
      'K-1 integration sprint cannot proceed to QA; race-day telemetry feed blocked for demo.',
  },
  {
    id: 'blk-4',
    title: 'Trademark filing — response required from external counsel',
    owner: 'Alex Morgan',
    severity: 'high',
    category: 'Legal / Compliance',
    daysBlocked: 8,
    impact:
      'KaNeXT wordmark registration stalls if not filed by Mar 1; affects brand assets in data room.',
  },
  {
    id: 'blk-5',
    title: 'Data room refresh — missing audited P&L for Q4',
    owner: 'David Okonkwo',
    severity: 'medium',
    category: 'Finance',
    daysBlocked: 5,
    impact:
      'Board pack incomplete; PBD/Tom review pushed until audited financials uploaded.',
  },
];

// =============================================================================
// INITIATIVES
// =============================================================================

export const INITIATIVES: Initiative[] = [
  {
    id: 'init-1',
    name: 'KaNeXT OS v2 Launch',
    status: 'active',
    progress: 62,
    owner: 'Marcus Chen',
    items: 34,
    dueLabel: 'Mar 31',
    priority: 'critical',
  },
  {
    id: 'init-2',
    name: 'KaNeXT Partnership Activation',
    status: 'active',
    progress: 45,
    owner: 'Jordan Hayes',
    items: 18,
    dueLabel: 'Apr 15',
    priority: 'high',
  },
  {
    id: 'init-3',
    name: 'KaNeXT Church Pilot Rollout',
    status: 'blocked',
    progress: 28,
    owner: 'David Okonkwo',
    items: 12,
    dueLabel: 'Mar 15',
    priority: 'high',
  },
  {
    id: 'init-4',
    name: 'K-1 Racing Integration',
    status: 'active',
    progress: 37,
    owner: 'Adriana Ruiz',
    items: 21,
    dueLabel: 'May 1',
    priority: 'medium',
  },
  {
    id: 'init-5',
    name: 'Board Prep & Data Room Refresh',
    status: 'active',
    progress: 70,
    owner: 'Alex Morgan',
    items: 9,
    dueLabel: 'Feb 28',
    priority: 'critical',
  },
  {
    id: 'init-6',
    name: 'Design System v2 (Business Mode)',
    status: 'done',
    progress: 100,
    owner: 'Lisa Park',
    items: 16,
    dueLabel: 'Completed',
    priority: 'medium',
  },
];

// =============================================================================
// PROJECTS
// =============================================================================

export const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Video Pipeline — GPU Transcoding',
    initiative: 'KaNeXT OS v2 Launch',
    status: 'blocked',
    progress: 40,
    owner: 'Adriana Ruiz',
    items: 8,
    dueLabel: 'Mar 10',
    priority: 'critical',
  },
  {
    id: 'proj-2',
    name: 'Payment Rails — Stripe Connect',
    initiative: 'KaNeXT Church Pilot Rollout',
    status: 'blocked',
    progress: 55,
    owner: 'David Okonkwo',
    items: 6,
    dueLabel: 'Mar 5',
    priority: 'critical',
  },
  {
    id: 'proj-3',
    name: 'Nexus Chat v2 — RBAC + Workspaces',
    initiative: 'KaNeXT OS v2 Launch',
    status: 'active',
    progress: 78,
    owner: 'Marcus Chen',
    items: 14,
    dueLabel: 'Feb 25',
    priority: 'high',
  },
  {
    id: 'proj-4',
    name: 'KaNeXT Media Value Dashboard',
    initiative: 'KaNeXT Partnership Activation',
    status: 'active',
    progress: 33,
    owner: 'Lisa Park',
    items: 10,
    dueLabel: 'Apr 1',
    priority: 'medium',
  },
  {
    id: 'proj-5',
    name: 'Trademark & IP Filing Package',
    initiative: 'Board Prep & Data Room Refresh',
    status: 'active',
    progress: 60,
    owner: 'Alex Morgan',
    items: 5,
    dueLabel: 'Mar 1',
    priority: 'high',
  },
];

// =============================================================================
// DECISION QUEUE
// =============================================================================

export const DECISION_QUEUE: DecisionItem[] = [
  {
    id: 'dec-1',
    title: 'Approve GPU vendor contract — $8,400/mo commitment',
    type: 'approval',
    requester: 'Adriana Ruiz',
    deadline: 'Feb 20',
    status: 'pending',
    impact:
      'Unlocks video pipeline blocker; required for KaNeXT demo reel and K-1 telemetry feed.',
  },
  {
    id: 'dec-2',
    title: 'Board Pack Q4 final draft sign-off',
    type: 'review',
    requester: 'David Okonkwo',
    deadline: 'Feb 22',
    status: 'pending',
    impact:
      'PBD and Tom require signed pack before Feb 28 meeting; delays erode board confidence.',
  },
  {
    id: 'dec-3',
    title: 'KaNeXT Church pilot pricing — tiered vs flat rate',
    type: 'escalation',
    requester: 'Jordan Hayes',
    deadline: 'Feb 24',
    status: 'pending',
    impact:
      'Pricing model affects ARR projection in data room; must align before investor update.',
  },
  {
    id: 'dec-4',
    title: 'Trademark filing — approve external counsel invoice',
    type: 'approval',
    requester: 'Alex Morgan',
    deadline: 'Feb 19',
    status: 'pending',
    impact:
      'Filing deadline is Mar 1; late payment to counsel risks missing window.',
  },
  {
    id: 'dec-5',
    title: 'K-1 data partnership NDA terms review',
    type: 'review',
    requester: 'Jordan Hayes',
    deadline: 'Feb 26',
    status: 'pending',
    impact:
      'NDA must be executed before K-1 shares live telemetry API credentials.',
  },
];

// =============================================================================
// OPS FEED
// =============================================================================

export const OPS_FEED: OpsFeedItem[] = [
  {
    id: 'feed-1',
    text: 'Adriana Ruiz resolved blocker: K-1 staging auth token rotation — patched retry logic.',
    timestamp: '12 min ago',
    category: 'blocker_resolved',
  },
  {
    id: 'feed-2',
    text: 'Initiative "Design System v2" marked DONE by Lisa Park — 16/16 items shipped.',
    timestamp: '1 hr ago',
    category: 'initiative_update',
  },
  {
    id: 'feed-3',
    text: 'Project "Nexus Chat v2" hit 75% milestone — RBAC layer merged by Marcus Chen.',
    timestamp: '2 hr ago',
    category: 'project_milestone',
  },
  {
    id: 'feed-4',
    text: 'Decision APPROVED: Extend KaNeXT media partnership term to 3 years (Alex Morgan).',
    timestamp: '3 hr ago',
    category: 'decision_made',
  },
  {
    id: 'feed-5',
    text: 'ALERT: Stripe Connect onboarding rejection — KaNeXT Church pilot launch date at risk.',
    timestamp: '4 hr ago',
    category: 'alert',
  },
  {
    id: 'feed-6',
    text: 'David Okonkwo uploaded Q4 draft P&L to data room — awaiting audit confirmation.',
    timestamp: '5 hr ago',
    category: 'initiative_update',
  },
  {
    id: 'feed-7',
    text: 'Project "Trademark Filing" progress updated to 60% — counsel review pending.',
    timestamp: '6 hr ago',
    category: 'project_milestone',
  },
  {
    id: 'feed-8',
    text: 'Jordan Hayes scheduled KaNeXT Church pricing escalation meeting for Feb 24.',
    timestamp: '8 hr ago',
    category: 'decision_made',
  },
];
