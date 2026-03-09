/**
 * Mock data for Team screen — business mode.
 * 3 pages: Members, Management, Hiring.
 * Pattern follows data/mock-roster-screen.ts.
 */

// ── Page 0: Members ──

export type Department = 'product' | 'sales' | 'marketing' | 'operations' | 'leadership' | 'engineering' | 'design';
export type MemberStatus = 'active' | 'on-leave' | 'probation' | 'remote' | 'in-office';
export type MemberFilter = 'all' | 'product' | 'sales' | 'marketing' | 'operations' | 'leadership' | 'engineering' | 'design';
export type MemberSort = 'name' | 'department' | 'start-date' | 'title';

export interface TeamSummary {
  totalHeadcount: number;
  departmentBreakdown: Record<Department, number>;
  newHiresThisMonth: number;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  initials: string;
  username: string;
  title: string;
  department: Department;
  status: MemberStatus;
  isOnline: boolean;
  startDate: string;
  tenure: string;
  imageUri: string | null;
}

// ── Page 1: Management ──

export type ManagementSection = 'performance' | 'goals' | 'onboarding' | 'time-off' | 'training';

// Performance
export type ReviewCycleStatus = 'upcoming' | 'in-progress' | 'completed';

export interface ReviewEntry {
  id: string;
  employeeName: string;
  initials: string;
  reviewer: string;
  selfAssessment: 'pending' | 'submitted';
  managerAssessment: 'pending' | 'submitted';
  score: number | null;
  cycleStatus: ReviewCycleStatus;
}

// Goals
export type GoalLevel = 'company' | 'department' | 'individual';
export type GoalStatus = 'on-track' | 'at-risk' | 'behind' | 'completed';

export interface GoalEntry {
  id: string;
  title: string;
  ownerName: string;
  ownerInitials: string;
  level: GoalLevel;
  deadline: string;
  progressPercent: number;
  status: GoalStatus;
  keyResults: number;
  keyResultsCompleted: number;
}

// Onboarding
export interface OnboardingEntry {
  id: string;
  employeeName: string;
  initials: string;
  startDate: string;
  tasksTotal: number;
  tasksCompleted: number;
  buddyName: string | null;
}

// Time Off
export type TimeOffType = 'pto' | 'sick' | 'personal' | 'parental';
export type TimeOffRequestStatus = 'pending' | 'approved' | 'denied';

export interface TimeOffRequest {
  id: string;
  employeeName: string;
  initials: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  days: number;
  status: TimeOffRequestStatus;
}

// Training
export type TrainingStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';

export interface TrainingEntry {
  id: string;
  employeeName: string;
  initials: string;
  programName: string;
  status: TrainingStatus;
  completionPercent: number;
  dueDate: string;
  certification: boolean;
}

// ── Page 2: Hiring ──

export type HiringStage = 'posted' | 'applications' | 'screened' | 'interviewed' | 'offered' | 'hired';
export type HiringFilter = 'all' | 'by-department' | 'by-priority' | 'by-status';
export type CandidateSource = 'referral' | 'job-board' | 'inbound' | 'recruiter';

export interface OpenPositionsSummary {
  totalOpen: number;
  departmentBreakdown: Partial<Record<Department, number>>;
}

export interface CandidateCard {
  id: string;
  name: string;
  initials: string;
  position: string;
  department: Department;
  source: CandidateSource;
  stage: HiringStage;
  lastAction: string;
  rating: number | null;
}

// ── Mock Data ──

export const TEAM_SUMMARY: TeamSummary = {
  totalHeadcount: 24,
  departmentBreakdown: {
    product: 4,
    sales: 4,
    marketing: 3,
    operations: 3,
    leadership: 3,
    engineering: 5,
    design: 2,
  },
  newHiresThisMonth: 3,
};

export const TEAM_MEMBERS: TeamMemberItem[] = [
  { id: 'tm1',  name: 'Sarah Chen',        initials: 'SC', username: 'schen',       title: 'CEO',                     department: 'leadership',  status: 'in-office', isOnline: true,  startDate: 'Jan 2020', tenure: '6y 2m', imageUri: null },
  { id: 'tm2',  name: 'Marcus Rivera',      initials: 'MR', username: 'mrivera',     title: 'CTO',                     department: 'leadership',  status: 'remote',    isOnline: true,  startDate: 'Mar 2020', tenure: '6y',    imageUri: null },
  { id: 'tm3',  name: 'Priya Patel',        initials: 'PP', username: 'ppatel',      title: 'COO',                     department: 'leadership',  status: 'in-office', isOnline: true,  startDate: 'Jun 2020', tenure: '5y 9m', imageUri: null },
  { id: 'tm4',  name: 'Anil Rao',           initials: 'AR', username: 'arao',        title: 'VP of Product',           department: 'product',     status: 'in-office', isOnline: true,  startDate: 'Sep 2020', tenure: '5y 6m', imageUri: null },
  { id: 'tm5',  name: 'Jenny Liu',          initials: 'JL', username: 'jliu',        title: 'Product Manager',         department: 'product',     status: 'remote',    isOnline: true,  startDate: 'Jan 2022', tenure: '4y 2m', imageUri: null },
  { id: 'tm6',  name: 'Derek Walker',       initials: 'DW', username: 'dwalker',     title: 'Product Analyst',         department: 'product',     status: 'in-office', isOnline: false, startDate: 'May 2023', tenure: '2y 10m',imageUri: null },
  { id: 'tm7',  name: 'Tina Martinez',      initials: 'TM', username: 'tmartinez',   title: 'Associate PM',            department: 'product',     status: 'active',    isOnline: true,  startDate: 'Feb 2026', tenure: '1m',    imageUri: null },
  { id: 'tm8',  name: 'Mike Torres',        initials: 'MT', username: 'mtorres',     title: 'VP of Sales',             department: 'sales',       status: 'in-office', isOnline: true,  startDate: 'Nov 2020', tenure: '5y 4m', imageUri: null },
  { id: 'tm9',  name: 'Elena Foster',       initials: 'EF', username: 'efoster',     title: 'Account Executive',       department: 'sales',       status: 'remote',    isOnline: true,  startDate: 'Mar 2022', tenure: '4y',    imageUri: null },
  { id: 'tm10', name: 'Chris Daniels',      initials: 'CD', username: 'cdaniels',    title: 'Sales Development Rep',   department: 'sales',       status: 'in-office', isOnline: false, startDate: 'Aug 2023', tenure: '2y 7m', imageUri: null },
  { id: 'tm11', name: 'Nadia Reyes',        initials: 'NR', username: 'nreyes',      title: 'Sales Coordinator',       department: 'sales',       status: 'on-leave',  isOnline: false, startDate: 'Jun 2024', tenure: '1y 9m', imageUri: null },
  { id: 'tm12', name: "Karen O'Brien",      initials: 'KO', username: 'kobrien',     title: 'Marketing Director',      department: 'marketing',   status: 'in-office', isOnline: true,  startDate: 'Jan 2021', tenure: '5y 2m', imageUri: null },
  { id: 'tm13', name: 'Sam Blake',          initials: 'SB', username: 'sblake',      title: 'Content Strategist',      department: 'marketing',   status: 'remote',    isOnline: true,  startDate: 'Sep 2022', tenure: '3y 6m', imageUri: null },
  { id: 'tm14', name: 'Jordan Reese',       initials: 'JR', username: 'jreese',      title: 'Growth Manager',          department: 'marketing',   status: 'active',    isOnline: false, startDate: 'Feb 2026', tenure: '1m',    imageUri: null },
  { id: 'tm15', name: 'Alex Kim',           initials: 'AK', username: 'akim',        title: 'Head of Ops',             department: 'operations',  status: 'in-office', isOnline: true,  startDate: 'Apr 2021', tenure: '4y 11m',imageUri: null },
  { id: 'tm16', name: 'Priya Shah',         initials: 'PS', username: 'pshah',       title: 'Office Manager',          department: 'operations',  status: 'in-office', isOnline: true,  startDate: 'Oct 2022', tenure: '3y 5m', imageUri: null },
  { id: 'tm17', name: 'Leo Chang',          initials: 'LC', username: 'lchang',      title: 'IT Specialist',           department: 'operations',  status: 'remote',    isOnline: false, startDate: 'Jul 2023', tenure: '2y 8m', imageUri: null },
  { id: 'tm18', name: 'Ryan Okafor',        initials: 'RO', username: 'rokafor',     title: 'Senior Engineer',         department: 'engineering', status: 'remote',    isOnline: true,  startDate: 'Feb 2021', tenure: '5y 1m', imageUri: null },
  { id: 'tm19', name: 'Mia Zhang',          initials: 'MZ', username: 'mzhang',      title: 'Senior Engineer',         department: 'engineering', status: 'in-office', isOnline: true,  startDate: 'May 2021', tenure: '4y 10m',imageUri: null },
  { id: 'tm20', name: 'David Park',         initials: 'DP', username: 'dpark',       title: 'Engineer',                department: 'engineering', status: 'in-office', isOnline: true,  startDate: 'Jan 2023', tenure: '3y 2m', imageUri: null },
  { id: 'tm21', name: 'Lisa Tran',          initials: 'LT', username: 'ltran',       title: 'Engineer',                department: 'engineering', status: 'probation', isOnline: true,  startDate: 'Jan 2026', tenure: '2m',    imageUri: null },
  { id: 'tm22', name: 'Omar Hassan',        initials: 'OH', username: 'ohassan',     title: 'Junior Engineer',         department: 'engineering', status: 'active',    isOnline: false, startDate: 'Mar 2026', tenure: '< 1m',  imageUri: null },
  { id: 'tm23', name: 'Ava Moreno',         initials: 'AM', username: 'amoreno',     title: 'Lead Designer',           department: 'design',      status: 'in-office', isOnline: true,  startDate: 'Aug 2021', tenure: '4y 7m', imageUri: null },
  { id: 'tm24', name: 'Noah Bennett',       initials: 'NB', username: 'nbennett',    title: 'UI/UX Designer',          department: 'design',      status: 'remote',    isOnline: true,  startDate: 'Apr 2023', tenure: '2y 11m',imageUri: null },
];

export const REVIEW_ENTRIES: ReviewEntry[] = [
  { id: 're1', employeeName: 'Jenny Liu',       initials: 'JL', reviewer: 'Anil Rao',      selfAssessment: 'submitted', managerAssessment: 'submitted', score: 4.2, cycleStatus: 'completed' },
  { id: 're2', employeeName: 'Derek Walker',    initials: 'DW', reviewer: 'Anil Rao',      selfAssessment: 'submitted', managerAssessment: 'pending',   score: null, cycleStatus: 'in-progress' },
  { id: 're3', employeeName: 'Elena Foster',    initials: 'EF', reviewer: 'Mike Torres',   selfAssessment: 'submitted', managerAssessment: 'submitted', score: 4.5, cycleStatus: 'completed' },
  { id: 're4', employeeName: 'Chris Daniels',   initials: 'CD', reviewer: 'Mike Torres',   selfAssessment: 'pending',   managerAssessment: 'pending',   score: null, cycleStatus: 'in-progress' },
  { id: 're5', employeeName: 'Ryan Okafor',     initials: 'RO', reviewer: 'Marcus Rivera', selfAssessment: 'submitted', managerAssessment: 'submitted', score: 4.8, cycleStatus: 'completed' },
  { id: 're6', employeeName: 'David Park',      initials: 'DP', reviewer: 'Marcus Rivera', selfAssessment: 'pending',   managerAssessment: 'pending',   score: null, cycleStatus: 'upcoming' },
  { id: 're7', employeeName: 'Ava Moreno',      initials: 'AM', reviewer: 'Priya Patel',   selfAssessment: 'submitted', managerAssessment: 'submitted', score: 4.0, cycleStatus: 'completed' },
  { id: 're8', employeeName: 'Sam Blake',       initials: 'SB', reviewer: "Karen O'Brien", selfAssessment: 'submitted', managerAssessment: 'pending',   score: null, cycleStatus: 'in-progress' },
];

export const GOAL_ENTRIES: GoalEntry[] = [
  { id: 'go1',  title: 'Achieve $5M ARR',                    ownerName: 'Sarah Chen',      ownerInitials: 'SC', level: 'company',    deadline: 'Dec 2026', progressPercent: 62, status: 'on-track',  keyResults: 4, keyResultsCompleted: 2 },
  { id: 'go2',  title: 'Launch mobile app v2',               ownerName: 'Anil Rao',        ownerInitials: 'AR', level: 'company',    deadline: 'Jun 2026', progressPercent: 45, status: 'on-track',  keyResults: 5, keyResultsCompleted: 2 },
  { id: 'go3',  title: 'Reduce churn to <3%',                ownerName: 'Mike Torres',     ownerInitials: 'MT', level: 'company',    deadline: 'Sep 2026', progressPercent: 30, status: 'at-risk',   keyResults: 3, keyResultsCompleted: 0 },
  { id: 'go4',  title: 'Expand to 3 new markets',            ownerName: 'Elena Foster',    ownerInitials: 'EF', level: 'department', deadline: 'Q4 2026',  progressPercent: 15, status: 'behind',    keyResults: 3, keyResultsCompleted: 0 },
  { id: 'go5',  title: 'Hire 10 engineers',                  ownerName: 'Marcus Rivera',   ownerInitials: 'MR', level: 'department', deadline: 'Jun 2026', progressPercent: 50, status: 'on-track',  keyResults: 3, keyResultsCompleted: 1 },
  { id: 'go6',  title: 'Redesign onboarding flow',           ownerName: 'Ava Moreno',      ownerInitials: 'AM', level: 'department', deadline: 'Apr 2026', progressPercent: 80, status: 'on-track',  keyResults: 4, keyResultsCompleted: 3 },
  { id: 'go7',  title: 'Publish 20 blog posts',              ownerName: 'Sam Blake',       ownerInitials: 'SB', level: 'individual', deadline: 'Jun 2026', progressPercent: 55, status: 'on-track',  keyResults: 2, keyResultsCompleted: 1 },
  { id: 'go8',  title: 'Complete AWS certification',          ownerName: 'David Park',      ownerInitials: 'DP', level: 'individual', deadline: 'May 2026', progressPercent: 70, status: 'on-track',  keyResults: 2, keyResultsCompleted: 1 },
  { id: 'go9',  title: 'Ship design system v2',              ownerName: 'Noah Bennett',    ownerInitials: 'NB', level: 'individual', deadline: 'Apr 2026', progressPercent: 100,status: 'completed', keyResults: 3, keyResultsCompleted: 3 },
  { id: 'go10', title: 'Implement CI/CD pipeline',           ownerName: 'Ryan Okafor',     ownerInitials: 'RO', level: 'department', deadline: 'Mar 2026', progressPercent: 90, status: 'on-track',  keyResults: 4, keyResultsCompleted: 3 },
];

export const ONBOARDING_ENTRIES: OnboardingEntry[] = [
  { id: 'ob1', employeeName: 'Tina Martinez', initials: 'TM', startDate: 'Feb 24, 2026', tasksTotal: 18, tasksCompleted: 12, buddyName: 'Jenny Liu' },
  { id: 'ob2', employeeName: 'Jordan Reese',  initials: 'JR', startDate: 'Feb 17, 2026', tasksTotal: 18, tasksCompleted: 15, buddyName: 'Sam Blake' },
  { id: 'ob3', employeeName: 'Omar Hassan',   initials: 'OH', startDate: 'Mar 3, 2026',  tasksTotal: 20, tasksCompleted: 5,  buddyName: 'Mia Zhang' },
];

export const TIME_OFF_REQUESTS: TimeOffRequest[] = [
  { id: 'to1', employeeName: 'Nadia Reyes',    initials: 'NR', type: 'parental',  startDate: 'Mar 1',  endDate: 'May 30',  days: 65, status: 'approved' },
  { id: 'to2', employeeName: 'Sam Blake',       initials: 'SB', type: 'pto',       startDate: 'Mar 20', endDate: 'Mar 24',  days: 5,  status: 'pending' },
  { id: 'to3', employeeName: 'Derek Walker',    initials: 'DW', type: 'sick',      startDate: 'Mar 7',  endDate: 'Mar 7',   days: 1,  status: 'approved' },
  { id: 'to4', employeeName: 'Ryan Okafor',     initials: 'RO', type: 'pto',       startDate: 'Apr 1',  endDate: 'Apr 4',   days: 4,  status: 'pending' },
  { id: 'to5', employeeName: 'Mia Zhang',       initials: 'MZ', type: 'personal',  startDate: 'Mar 14', endDate: 'Mar 14',  days: 1,  status: 'approved' },
  { id: 'to6', employeeName: 'Lisa Tran',       initials: 'LT', type: 'pto',       startDate: 'Mar 25', endDate: 'Mar 28',  days: 4,  status: 'denied' },
];

export const TRAINING_ENTRIES: TrainingEntry[] = [
  { id: 'tr1', employeeName: 'Lisa Tran',      initials: 'LT', programName: 'Security Compliance 101',    status: 'in-progress', completionPercent: 60, dueDate: 'Mar 31', certification: true },
  { id: 'tr2', employeeName: 'Omar Hassan',    initials: 'OH', programName: 'Company Onboarding',         status: 'in-progress', completionPercent: 40, dueDate: 'Mar 17', certification: false },
  { id: 'tr3', employeeName: 'David Park',     initials: 'DP', programName: 'AWS Solutions Architect',     status: 'in-progress', completionPercent: 70, dueDate: 'May 15', certification: true },
  { id: 'tr4', employeeName: 'Chris Daniels',  initials: 'CD', programName: 'Sales Methodology — MEDDIC', status: 'completed',   completionPercent: 100,dueDate: 'Feb 28', certification: true },
  { id: 'tr5', employeeName: 'Tina Martinez',  initials: 'TM', programName: 'Product Management Basics',  status: 'not-started', completionPercent: 0,  dueDate: 'Apr 15', certification: false },
  { id: 'tr6', employeeName: 'Noah Bennett',   initials: 'NB', programName: 'Accessibility Standards',     status: 'overdue',     completionPercent: 25, dueDate: 'Feb 15', certification: true },
  { id: 'tr7', employeeName: 'Jordan Reese',   initials: 'JR', programName: 'Marketing Analytics',         status: 'not-started', completionPercent: 0,  dueDate: 'Apr 30', certification: false },
];

export const OPEN_POSITIONS_SUMMARY: OpenPositionsSummary = {
  totalOpen: 5,
  departmentBreakdown: {
    engineering: 2,
    sales: 1,
    marketing: 1,
    design: 1,
  },
};

export const CANDIDATES: CandidateCard[] = [
  // Posted
  { id: 'ca1',  name: 'Posted: Sr. Engineer',     initials: '--', position: 'Senior Engineer',       department: 'engineering', source: 'job-board', stage: 'posted', lastAction: 'Posted 2 days ago',        rating: null },
  { id: 'ca2',  name: 'Posted: Marketing Mgr',    initials: '--', position: 'Marketing Manager',     department: 'marketing',   source: 'job-board', stage: 'posted', lastAction: 'Posted 5 days ago',        rating: null },
  // Applications
  { id: 'ca3',  name: 'Liam Chen',                initials: 'LC', position: 'Senior Engineer',       department: 'engineering', source: 'referral',  stage: 'applications', lastAction: 'Applied 1 day ago',   rating: null },
  { id: 'ca4',  name: 'Sophie Kwon',              initials: 'SK', position: 'UI/UX Designer',        department: 'design',      source: 'job-board', stage: 'applications', lastAction: 'Applied 3 days ago',  rating: null },
  { id: 'ca5',  name: 'James Okonkwo',            initials: 'JO', position: 'Account Executive',     department: 'sales',       source: 'inbound',   stage: 'applications', lastAction: 'Applied 2 days ago',  rating: null },
  // Screened
  { id: 'ca6',  name: 'Emily Nakamura',           initials: 'EN', position: 'Senior Engineer',       department: 'engineering', source: 'referral',  stage: 'screened', lastAction: 'Phone screen Mar 6',      rating: 4 },
  { id: 'ca7',  name: 'Ryan Fitzgerald',          initials: 'RF', position: 'Marketing Manager',     department: 'marketing',   source: 'recruiter', stage: 'screened', lastAction: 'Phone screen Mar 5',      rating: 3 },
  { id: 'ca8',  name: 'Amara Diallo',             initials: 'AD', position: 'UI/UX Designer',        department: 'design',      source: 'job-board', stage: 'screened', lastAction: 'Phone screen Mar 4',      rating: 4 },
  // Interviewed
  { id: 'ca9',  name: 'Daniel Gupta',             initials: 'DG', position: 'Senior Engineer',       department: 'engineering', source: 'referral',  stage: 'interviewed', lastAction: 'Panel interview Mar 7',  rating: 5 },
  { id: 'ca10', name: 'Maria Santos',             initials: 'MS', position: 'Account Executive',     department: 'sales',       source: 'recruiter', stage: 'interviewed', lastAction: 'Final round Mar 6',     rating: 4 },
  { id: 'ca11', name: 'Tyler Washington',         initials: 'TW', position: 'Marketing Manager',     department: 'marketing',   source: 'inbound',   stage: 'interviewed', lastAction: 'Panel interview Mar 5', rating: 3 },
  // Offered
  { id: 'ca12', name: 'Nora Kim',                 initials: 'NK', position: 'Senior Engineer',       department: 'engineering', source: 'referral',  stage: 'offered', lastAction: 'Offer sent Mar 8',          rating: 5 },
  { id: 'ca13', name: 'Brandon Hayes',            initials: 'BH', position: 'UI/UX Designer',        department: 'design',      source: 'job-board', stage: 'offered', lastAction: 'Offer sent Mar 7',          rating: 4 },
  // Hired
  { id: 'ca14', name: 'Tina Martinez',            initials: 'TM', position: 'Associate PM',          department: 'product',     source: 'referral',  stage: 'hired', lastAction: 'Started Feb 24',              rating: 5 },
  { id: 'ca15', name: 'Omar Hassan',              initials: 'OH', position: 'Junior Engineer',       department: 'engineering', source: 'job-board', stage: 'hired', lastAction: 'Started Mar 3',               rating: 4 },
];

// ── Helpers ──

export function getMembers(filter?: MemberFilter, sort?: MemberSort): TeamMemberItem[] {
  let result = [...TEAM_MEMBERS];
  if (filter && filter !== 'all') {
    result = result.filter((m) => m.department === filter);
  }
  if (sort) {
    switch (sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'department':
        result.sort((a, b) => a.department.localeCompare(b.department));
        break;
      case 'start-date':
        result.sort((a, b) => a.startDate.localeCompare(b.startDate));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
  }
  return result;
}

export function getCandidates(filter?: HiringFilter): CandidateCard[] {
  if (!filter || filter === 'all') return CANDIDATES;
  return CANDIDATES;
}

export function getCandidatesByStage(stage: HiringStage): CandidateCard[] {
  return CANDIDATES.filter((c) => c.stage === stage);
}
