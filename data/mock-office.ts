/**
 * Mock data for Office screen — business mode.
 * 3 pages: Projects, Workflows, Performance.
 * Pattern follows data/mock-season.ts.
 */

// ── Page 0: Projects ──

export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'at-risk';
export type ProjectFilter = 'all' | 'active' | 'on-hold' | 'completed';

export interface TeamMemberAvatar {
  initials: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  status: ProjectStatus;
  progressPercent: number;
  ownerInitials: string;
  ownerName: string;
  dueDate: string;
  teamMembers: TeamMemberAvatar[];
  lastActivity: string;
}

// ── Page 1: Workflows ──

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type WorkflowView = 'board' | 'list';

export interface WorkflowTask {
  id: string;
  title: string;
  assigneeInitials: string;
  assigneeName: string;
  priority: TaskPriority;
  dueDate: string;
  projectTag: string;
  status: TaskStatus;
}

export interface ApprovalItem {
  id: string;
  title: string;
  requestedBy: string;
  requestedByInitials: string;
  timestamp: string;
}

// ── Page 2: Performance ──

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface KpiCard {
  id: string;
  metricName: string;
  currentValue: string;
  trend: 'up' | 'down' | 'flat';
  changePercent: string;
  sparkBars: number[]; // 7 normalized values 0–100
  invertTrend?: boolean; // true = "up" is bad (e.g. churn), "down" is good (e.g. deal cycle)
}

export interface PerformanceActivity {
  id: string;
  description: string;
  timestamp: string;
  icon: string;
}

// ── Mock Data ──

export const PROJECTS: ProjectItem[] = [
  { id: 'p1', name: 'Mobile App Redesign', status: 'active', progressPercent: 68, ownerInitials: 'SC', ownerName: 'Sarah Chen', dueDate: 'Apr 15', teamMembers: [{ initials: 'SC' }, { initials: 'MT' }, { initials: 'JL' }, { initials: 'AR' }], lastActivity: '2h ago' },
  { id: 'p2', name: 'Q2 Marketing Campaign', status: 'active', progressPercent: 45, ownerInitials: 'MT', ownerName: 'Mike Torres', dueDate: 'Mar 28', teamMembers: [{ initials: 'MT' }, { initials: 'KO' }, { initials: 'PS' }], lastActivity: '4h ago' },
  { id: 'p3', name: 'CRM Migration', status: 'at-risk', progressPercent: 22, ownerInitials: 'JL', ownerName: 'Jenny Liu', dueDate: 'Mar 20', teamMembers: [{ initials: 'JL' }, { initials: 'AR' }, { initials: 'DW' }, { initials: 'SB' }, { initials: 'EF' }], lastActivity: '1h ago' },
  { id: 'p4', name: 'Product Roadmap FY26', status: 'active', progressPercent: 81, ownerInitials: 'AR', ownerName: 'Anil Rao', dueDate: 'Mar 31', teamMembers: [{ initials: 'AR' }, { initials: 'SC' }], lastActivity: '6h ago' },
  { id: 'p5', name: 'Sales Enablement Deck', status: 'completed', progressPercent: 100, ownerInitials: 'PS', ownerName: 'Priya Shah', dueDate: 'Feb 28', teamMembers: [{ initials: 'PS' }], lastActivity: '3d ago' },
  { id: 'p6', name: 'Investor Relations Update', status: 'on-hold', progressPercent: 35, ownerInitials: 'DW', ownerName: 'Derek Walker', dueDate: 'May 1', teamMembers: [{ initials: 'DW' }], lastActivity: '1w ago' },
  { id: 'p7', name: 'Brand Guidelines v2', status: 'active', progressPercent: 58, ownerInitials: 'KO', ownerName: "Karen O'Brien", dueDate: 'Apr 30', teamMembers: [{ initials: 'KO' }], lastActivity: '12h ago' },
  { id: 'p8', name: 'Annual Report 2025', status: 'completed', progressPercent: 100, ownerInitials: 'TM', ownerName: 'Tina Martinez', dueDate: 'Feb 15', teamMembers: [{ initials: 'TM' }], lastActivity: '2w ago' },
  { id: 'p9', name: 'Ops Workflow Audit', status: 'on-hold', progressPercent: 15, ownerInitials: 'SB', ownerName: 'Sam Blake', dueDate: 'Apr 10', teamMembers: [{ initials: 'SB' }], lastActivity: '5d ago' },
  { id: 'p10', name: 'Partnership Deck', status: 'active', progressPercent: 73, ownerInitials: 'EF', ownerName: 'Elena Foster', dueDate: 'Mar 25', teamMembers: [{ initials: 'EF' }], lastActivity: '3h ago' },
];

export const WORKFLOW_TASKS: WorkflowTask[] = [
  // To Do
  { id: 'wt1', title: 'Finalize brand voice doc', assigneeInitials: 'KO', assigneeName: "Karen O'Brien", priority: 'medium', dueDate: 'Mar 14', projectTag: 'Brand Guidelines', status: 'todo' },
  { id: 'wt2', title: 'Prep Q2 outreach list', assigneeInitials: 'MT', assigneeName: 'Mike Torres', priority: 'high', dueDate: 'Mar 12', projectTag: 'Q2 Marketing', status: 'todo' },
  { id: 'wt3', title: 'Schedule UX research sessions', assigneeInitials: 'SC', assigneeName: 'Sarah Chen', priority: 'medium', dueDate: 'Mar 15', projectTag: 'Mobile App', status: 'todo' },
  { id: 'wt4', title: 'Review contractor SOW', assigneeInitials: 'AR', assigneeName: 'Anil Rao', priority: 'low', dueDate: 'Mar 18', projectTag: 'Ops Audit', status: 'todo' },
  // In Progress
  { id: 'wt5', title: 'Build landing page v2', assigneeInitials: 'SC', assigneeName: 'Sarah Chen', priority: 'high', dueDate: 'Mar 16', projectTag: 'Mobile App', status: 'in-progress' },
  { id: 'wt6', title: 'Update sales slide deck', assigneeInitials: 'PS', assigneeName: 'Priya Shah', priority: 'medium', dueDate: 'Mar 13', projectTag: 'Sales Enablement', status: 'in-progress' },
  { id: 'wt7', title: 'CRM data migration prep', assigneeInitials: 'JL', assigneeName: 'Jenny Liu', priority: 'high', dueDate: 'Mar 11', projectTag: 'CRM Migration', status: 'in-progress' },
  { id: 'wt8', title: 'Write API docs', assigneeInitials: 'EF', assigneeName: 'Elena Foster', priority: 'low', dueDate: 'Mar 20', projectTag: 'Partnership Deck', status: 'in-progress' },
  // Review
  { id: 'wt9', title: 'Mobile app beta build', assigneeInitials: 'SC', assigneeName: 'Sarah Chen', priority: 'high', dueDate: 'Mar 10', projectTag: 'Mobile App', status: 'review' },
  { id: 'wt10', title: 'Investor one-pager', assigneeInitials: 'DW', assigneeName: 'Derek Walker', priority: 'medium', dueDate: 'Mar 12', projectTag: 'Investor Relations', status: 'review' },
  { id: 'wt11', title: 'Email campaign copy', assigneeInitials: 'MT', assigneeName: 'Mike Torres', priority: 'medium', dueDate: 'Mar 14', projectTag: 'Q2 Marketing', status: 'review' },
  { id: 'wt12', title: 'Legal compliance check', assigneeInitials: 'AR', assigneeName: 'Anil Rao', priority: 'high', dueDate: 'Mar 11', projectTag: 'CRM Migration', status: 'review' },
  // Done
  { id: 'wt13', title: 'Kickoff sprint planning', assigneeInitials: 'AR', assigneeName: 'Anil Rao', priority: 'medium', dueDate: 'Mar 5', projectTag: 'Product Roadmap', status: 'done' },
  { id: 'wt14', title: 'Stakeholder interviews', assigneeInitials: 'SC', assigneeName: 'Sarah Chen', priority: 'low', dueDate: 'Mar 3', projectTag: 'Mobile App', status: 'done' },
  { id: 'wt15', title: 'Competitive analysis', assigneeInitials: 'MT', assigneeName: 'Mike Torres', priority: 'medium', dueDate: 'Mar 4', projectTag: 'Q2 Marketing', status: 'done' },
  { id: 'wt16', title: 'Q1 OKR review', assigneeInitials: 'AR', assigneeName: 'Anil Rao', priority: 'high', dueDate: 'Mar 6', projectTag: 'Product Roadmap', status: 'done' },
];

export const PENDING_APPROVALS: ApprovalItem[] = [
  { id: 'a1', title: 'Q2 Budget Increase — Marketing', requestedBy: 'Nadia R.', requestedByInitials: 'NR', timestamp: '2h ago' },
  { id: 'a2', title: 'New Contractor SOW — Design', requestedBy: 'Alex K.', requestedByInitials: 'AK', timestamp: '5h ago' },
  { id: 'a3', title: 'Travel Request — NYC Summit', requestedBy: 'Derek S.', requestedByInitials: 'DS', timestamp: '1d ago' },
];

export const KPI_DATA: KpiCard[] = [
  { id: 'k1', metricName: 'Revenue MTD', currentValue: '$384K', trend: 'up', changePercent: '12.4%', sparkBars: [45, 52, 48, 60, 55, 72, 80] },
  { id: 'k2', metricName: 'Active Deals', currentValue: '47', trend: 'up', changePercent: '8.2%', sparkBars: [30, 35, 40, 38, 42, 44, 47] },
  { id: 'k3', metricName: 'Pipeline Value', currentValue: '$1.2M', trend: 'up', changePercent: '22.1%', sparkBars: [20, 30, 35, 45, 55, 70, 85] },
  { id: 'k4', metricName: 'Avg Deal Cycle', currentValue: '18d', trend: 'down', changePercent: '11.3%', sparkBars: [75, 70, 65, 58, 50, 42, 35], invertTrend: true },
  { id: 'k5', metricName: 'Team Utilization', currentValue: '84%', trend: 'up', changePercent: '3.2%', sparkBars: [60, 65, 68, 72, 75, 80, 84] },
  { id: 'k6', metricName: 'Churned Accounts', currentValue: '2', trend: 'up', changePercent: '50%', sparkBars: [10, 5, 8, 12, 6, 15, 20], invertTrend: true },
];

export const PERFORMANCE_ACTIVITY: PerformanceActivity[] = [
  { id: 'pa1', description: 'Closed deal with Meridian Corp — $45K', timestamp: '2h ago', icon: 'checkmark.circle.fill' },
  { id: 'pa2', description: 'Mobile app beta deployed to TestFlight', timestamp: '5h ago', icon: 'arrow.up.circle.fill' },
  { id: 'pa3', description: 'Q2 marketing budget approved', timestamp: '8h ago', icon: 'doc.text.fill' },
  { id: 'pa4', description: 'New lead from partner referral — Apex Inc.', timestamp: '1d ago', icon: 'person.badge.plus' },
  { id: 'pa5', description: 'CRM migration risk flagged — data mismatch', timestamp: '1d ago', icon: 'exclamationmark.triangle.fill' },
  { id: 'pa6', description: 'Sales enablement deck shared with team', timestamp: '2d ago', icon: 'square.and.arrow.up' },
  { id: 'pa7', description: 'Sprint 14 retrospective completed', timestamp: '2d ago', icon: 'flag.fill' },
  { id: 'pa8', description: 'Partnership deck draft reviewed by legal', timestamp: '3d ago', icon: 'doc.text.magnifyingglass' },
];

// ── Helpers ──

export function getProjects(filter?: ProjectFilter): ProjectItem[] {
  if (!filter || filter === 'all') return PROJECTS;
  return PROJECTS.filter((p) => p.status === filter);
}

export function getProjectSummary(): { total: number; active: number; onHold: number; atRisk: number } {
  return {
    total: PROJECTS.length,
    active: PROJECTS.filter((p) => p.status === 'active').length,
    onHold: PROJECTS.filter((p) => p.status === 'on-hold').length,
    atRisk: PROJECTS.filter((p) => p.status === 'at-risk').length,
  };
}

export function getTasksByStatus(status: TaskStatus): WorkflowTask[] {
  return WORKFLOW_TASKS.filter((t) => t.status === status);
}

export function getKpis(_range: TimeRange): KpiCard[] {
  // All ranges return same data for now (mock)
  return KPI_DATA;
}
