/**
 * Education Organization Institutions V2 — Mock Data & Types
 * KaNeXT Church-realistic institution portfolio: KaNeXT, Morris Brown, Edward Waters, Paul Quinn.
 */

// =============================================================================
// TYPES
// =============================================================================

export type InstitutionStatus = 'active' | 'partner' | 'pipeline' | 'archived';
export type InstitutionType = 'university' | 'college' | 'academy' | 'online';
export type HealthCategory = 'admissions' | 'academics' | 'campus' | 'athletics' | 'financial' | 'housing' | 'compliance';
export type HealthLevel = 'green' | 'yellow' | 'red';
export type PipelineStage = 'discovery' | 'review' | 'loi' | 'active';
export type PriorityLevel = 'highest' | 'high' | 'normal';
export type RiskLevel = 'at_risk' | 'needs_review' | 'stable';

export interface EduInstitution {
  id: string;
  name: string;
  shortName: string;
  location: string;
  type: InstitutionType;
  status: InstitutionStatus;
  pipelineStage?: PipelineStage;
  priority: PriorityLevel;
  risk: RiskLevel;
  leadership: { title: string; name: string }[];
  healthBars: Record<HealthCategory, { level: HealthLevel; trend: 'up' | 'down' | 'flat'; score: number }>;
  keyNumbers: { label: string; value: string }[];
  nextActions: { action: string; owner: string; due: string }[];
  enrollment: { current: number; target: number };
  deposits: number;
  housingOccupancy: number;
  tuitionAR: string;
  complianceAlerts: number;
}

export interface TodayItem {
  id: string;
  title: string;
  institution: string;
  type: 'deadline' | 'inspection' | 'batch' | 'meeting' | 'review';
  priority: 'urgent' | 'high' | 'normal';
  due: string;
}

export interface NextMilestone {
  id: string;
  title: string;
  institution: string;
  date: string;
  category: string;
}

export interface OverviewTiles {
  totalInstitutions: number;
  activeCount: number;
  partnerCount: number;
  pipelineCount: number;
  totalEnrollment: number;
  enrollmentTarget: number;
  admissionsFunnel: { apps: number; admits: number; deposits: number };
  housingOccupancy: number;
  tuitionReceivable: string;
  agingRisk: string;
  complianceAlerts: number;
  deadlines: { title: string; date: string; institution: string }[];
}

// =============================================================================
// CONSTANTS / LABELS
// =============================================================================

export const INSTITUTION_STATUS_LABELS: Record<InstitutionStatus, string> = {
  active: 'Active',
  partner: 'Partner',
  pipeline: 'Pipeline',
  archived: 'Archived',
};

export const INSTITUTION_STATUS_COLORS: Record<InstitutionStatus, string> = {
  active: '#22C55E',
  partner: '#1D9BF0',
  pipeline: '#F59E0B',
  archived: '#A1A1AA',
};

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  university: 'University',
  college: 'College',
  academy: 'Academy',
  online: 'Online',
};

export const INSTITUTION_TYPE_ICONS: Record<InstitutionType, string> = {
  university: 'building.columns.fill',
  college: 'building.2.fill',
  academy: 'graduationcap.fill',
  online: 'globe',
};

export const HEALTH_LEVEL_COLORS: Record<HealthLevel, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

export const HEALTH_CATEGORY_LABELS: Record<HealthCategory, string> = {
  admissions: 'Admissions',
  academics: 'Academics',
  campus: 'Campus',
  athletics: 'Athletics',
  financial: 'Financial',
  housing: 'Housing',
  compliance: 'Compliance',
};

export const HEALTH_CATEGORY_ICONS: Record<HealthCategory, string> = {
  admissions: 'person.badge.plus',
  academics: 'book.fill',
  campus: 'building.fill',
  athletics: 'sportscourt.fill',
  financial: 'dollarsign.circle.fill',
  housing: 'house.fill',
  compliance: 'checkmark.shield.fill',
};

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  discovery: 'Discovery',
  review: 'Review',
  loi: 'LOI',
  active: 'Active',
};

export const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  discovery: '#A1A1AA',
  review: '#F59E0B',
  loi: '#1D9BF0',
  active: '#22C55E',
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  highest: 'Highest',
  high: 'High',
  normal: 'Normal',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  highest: '#EF4444',
  high: '#F59E0B',
  normal: '#22C55E',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  at_risk: 'At Risk',
  needs_review: 'Needs Review',
  stable: 'Stable',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  at_risk: '#EF4444',
  needs_review: '#F59E0B',
  stable: '#22C55E',
};

export const TODAY_TYPE_LABELS: Record<TodayItem['type'], string> = {
  deadline: 'Deadline',
  inspection: 'Inspection',
  batch: 'Batch',
  meeting: 'Meeting',
  review: 'Review',
};

export const TODAY_TYPE_COLORS: Record<TodayItem['type'], string> = {
  deadline: '#EF4444',
  inspection: '#F59E0B',
  batch: '#1D9BF0',
  meeting: '#1D9BF0',
  review: '#22C55E',
};

export const TODAY_PRIORITY_COLORS: Record<TodayItem['priority'], string> = {
  urgent: '#EF4444',
  high: '#F59E0B',
  normal: '#22C55E',
};

// =============================================================================
// SEEDED INSTITUTIONS
// =============================================================================

const INSTITUTIONS: EduInstitution[] = [
  {
    id: 'inst-001',
    name: 'KaNeXT Sports',
    shortName: 'KaNeXT',
    location: 'Nashville, TN',
    type: 'university',
    status: 'active',
    priority: 'highest',
    risk: 'needs_review',
    leadership: [
      { title: 'President', name: 'Dr. Jaffus Hardrick' },
      { title: 'Provost', name: 'Dr. Angela M. Nixon' },
      { title: 'VP Enrollment', name: 'Dr. Marcus E. Thompson' },
    ],
    healthBars: {
      admissions: { level: 'yellow', trend: 'up', score: 68 },
      academics: { level: 'green', trend: 'flat', score: 82 },
      campus: { level: 'green', trend: 'flat', score: 78 },
      athletics: { level: 'green', trend: 'up', score: 85 },
      financial: { level: 'yellow', trend: 'down', score: 62 },
      housing: { level: 'yellow', trend: 'flat', score: 70 },
      compliance: { level: 'yellow', trend: 'up', score: 72 },
    },
    keyNumbers: [
      { label: 'Fall Apps', value: '2,180' },
      { label: 'Admits', value: '1,450' },
      { label: 'Deposits', value: '892' },
      { label: 'Retention Rate', value: '68%' },
      { label: 'Avg GPA', value: '2.84' },
    ],
    nextActions: [
      { action: 'Submit SACSCOC interim report', owner: 'Provost', due: '2026-03-15' },
      { action: 'Finalize housing renovation Phase 2', owner: 'VP Facilities', due: '2026-04-01' },
      { action: 'Admissions funnel review meeting', owner: 'VP Enrollment', due: '2026-02-24' },
    ],
    enrollment: { current: 1180, target: 1400 },
    deposits: 892,
    housingOccupancy: 87,
    tuitionAR: '$2.4M',
    complianceAlerts: 3,
  },
  {
    id: 'inst-003',
    name: 'Morris Brown College',
    shortName: 'MBC',
    location: 'Nashville, TN',
    type: 'college',
    status: 'pipeline',
    pipelineStage: 'review',
    priority: 'high',
    risk: 'at_risk',
    leadership: [
      { title: 'President', name: 'Dr. Kevin James' },
      { title: 'VP Academic Affairs', name: 'Dr. Shanette Harris' },
    ],
    healthBars: {
      admissions: { level: 'red', trend: 'down', score: 42 },
      academics: { level: 'yellow', trend: 'up', score: 58 },
      campus: { level: 'yellow', trend: 'flat', score: 55 },
      athletics: { level: 'red', trend: 'flat', score: 35 },
      financial: { level: 'red', trend: 'down', score: 38 },
      housing: { level: 'red', trend: 'flat', score: 40 },
      compliance: { level: 'yellow', trend: 'up', score: 52 },
    },
    keyNumbers: [
      { label: 'Fall Apps', value: '680' },
      { label: 'Admits', value: '420' },
      { label: 'Deposits', value: '185' },
      { label: 'Retention Rate', value: '55%' },
      { label: 'Avg GPA', value: '2.51' },
    ],
    nextActions: [
      { action: 'Complete accreditation self-study', owner: 'VP Academic Affairs', due: '2026-04-15' },
      { action: 'Financial viability assessment', owner: 'CFO', due: '2026-03-01' },
      { action: 'Pipeline review committee meeting', owner: 'President', due: '2026-02-25' },
    ],
    enrollment: { current: 350, target: 500 },
    deposits: 185,
    housingOccupancy: 58,
    tuitionAR: '$890K',
    complianceAlerts: 5,
  },
  {
    id: 'inst-004',
    name: 'Edward Waters University',
    shortName: 'EWU',
    location: 'Jacksonville, FL',
    type: 'university',
    status: 'active',
    priority: 'normal',
    risk: 'stable',
    leadership: [
      { title: 'President', name: 'Dr. A. Zachary Faison Jr.' },
      { title: 'Provost', name: 'Dr. Pamela R. Burch' },
      { title: 'VP Student Affairs', name: 'Dr. Natalie K. Cooper' },
    ],
    healthBars: {
      admissions: { level: 'green', trend: 'flat', score: 75 },
      academics: { level: 'green', trend: 'up', score: 80 },
      campus: { level: 'green', trend: 'flat', score: 82 },
      athletics: { level: 'green', trend: 'up', score: 78 },
      financial: { level: 'green', trend: 'flat', score: 74 },
      housing: { level: 'green', trend: 'up', score: 80 },
      compliance: { level: 'green', trend: 'flat', score: 85 },
    },
    keyNumbers: [
      { label: 'Fall Apps', value: '1,850' },
      { label: 'Admits', value: '1,220' },
      { label: 'Deposits', value: '740' },
      { label: 'Retention Rate', value: '71%' },
      { label: 'Avg GPA', value: '2.92' },
    ],
    nextActions: [
      { action: 'Update strategic enrollment plan', owner: 'VP Enrollment', due: '2026-03-10' },
      { action: 'Submit Title III grant report', owner: 'Provost', due: '2026-04-01' },
    ],
    enrollment: { current: 950, target: 1100 },
    deposits: 740,
    housingOccupancy: 85,
    tuitionAR: '$1.8M',
    complianceAlerts: 0,
  },
  {
    id: 'inst-005',
    name: 'Paul Quinn College',
    shortName: 'PQC',
    location: 'Dallas, TX',
    type: 'college',
    status: 'pipeline',
    pipelineStage: 'discovery',
    priority: 'normal',
    risk: 'needs_review',
    leadership: [
      { title: 'President', name: 'Dr. Michael J. Sorrell' },
      { title: 'Provost', name: 'Dr. Tomikia LeGrande' },
    ],
    healthBars: {
      admissions: { level: 'yellow', trend: 'up', score: 60 },
      academics: { level: 'green', trend: 'up', score: 78 },
      campus: { level: 'yellow', trend: 'flat', score: 65 },
      athletics: { level: 'yellow', trend: 'flat', score: 58 },
      financial: { level: 'yellow', trend: 'up', score: 62 },
      housing: { level: 'yellow', trend: 'down', score: 55 },
      compliance: { level: 'green', trend: 'flat', score: 75 },
    },
    keyNumbers: [
      { label: 'Fall Apps', value: '1,100' },
      { label: 'Admits', value: '720' },
      { label: 'Deposits', value: '380' },
      { label: 'Retention Rate', value: '62%' },
      { label: 'Avg GPA', value: '2.68' },
    ],
    nextActions: [
      { action: 'Initial discovery site visit', owner: 'Partnership Team', due: '2026-03-20' },
      { action: 'Request enrollment & financial data', owner: 'Analyst', due: '2026-02-28' },
    ],
    enrollment: { current: 480, target: 600 },
    deposits: 380,
    housingOccupancy: 72,
    tuitionAR: '$1.2M',
    complianceAlerts: 2,
  },
];

// =============================================================================
// SEEDED TODAY ITEMS
// =============================================================================

const TODAY_ITEMS: TodayItem[] = [
  {
    id: 'today-001',
    title: 'SACSCOC interim report deadline',
    institution: 'KaNeXT Sports',
    type: 'deadline',
    priority: 'urgent',
    due: '2026-03-15',
  },
  {
    id: 'today-002',
    title: 'Housing fire inspection — Building C',
    institution: 'Edward Waters University',
    type: 'inspection',
    priority: 'high',
    due: '2026-02-20',
  },
  {
    id: 'today-004',
    title: 'Pipeline review committee — Morris Brown',
    institution: 'Morris Brown College',
    type: 'meeting',
    priority: 'high',
    due: '2026-02-25',
  },
  {
    id: 'today-005',
    title: 'Accreditation self-study review',
    institution: 'Morris Brown College',
    type: 'review',
    priority: 'urgent',
    due: '2026-04-15',
  },
];

// =============================================================================
// SEEDED NEXT MILESTONES
// =============================================================================

const NEXT_MILESTONES: NextMilestone[] = [
  {
    id: 'ms-001',
    title: 'KaNeXT SACSCOC interim report submission',
    institution: 'KaNeXT Sports',
    date: '2026-03-15',
    category: 'Compliance',
  },
  {
    id: 'ms-003',
    title: 'Morris Brown accreditation decision',
    institution: 'Morris Brown College',
    date: '2026-06-01',
    category: 'Accreditation',
  },
  {
    id: 'ms-004',
    title: 'EWU Title III grant report',
    institution: 'Edward Waters University',
    date: '2026-04-01',
    category: 'Financial',
  },
  {
    id: 'ms-005',
    title: 'PQC discovery site visit',
    institution: 'Paul Quinn College',
    date: '2026-03-20',
    category: 'Pipeline',
  },
  {
    id: 'ms-006',
    title: 'KaNeXT housing renovation Phase 2 completion',
    institution: 'KaNeXT Sports',
    date: '2026-04-01',
    category: 'Facilities',
  },
];

// =============================================================================
// OVERVIEW TILES
// =============================================================================

const OVERVIEW_TILES: OverviewTiles = {
  totalInstitutions: 4,
  activeCount: 2,
  partnerCount: 0,
  pipelineCount: 2,
  totalEnrollment: 2960,
  enrollmentTarget: 3600,
  admissionsFunnel: { apps: 5810, admits: 3810, deposits: 2197 },
  housingOccupancy: 76,
  tuitionReceivable: '$6.3M',
  agingRisk: '$1.4M 90+ days',
  complianceAlerts: 10,
  deadlines: [
    { title: 'SACSCOC interim report', date: '2026-03-15', institution: 'KaNeXT' },
    { title: 'Accreditation self-study', date: '2026-04-15', institution: 'MBC' },
    { title: 'Title III grant report', date: '2026-04-01', institution: 'EWU' },
  ],
};

// =============================================================================
// EXPORT FUNCTION
// =============================================================================

export function getEduInstitutionsV2Data(): {
  institutions: EduInstitution[];
  overviewTiles: OverviewTiles;
  todayItems: TodayItem[];
  nextMilestones: NextMilestone[];
} {
  return {
    institutions: INSTITUTIONS,
    overviewTiles: OVERVIEW_TILES,
    todayItems: TODAY_ITEMS,
    nextMilestones: NEXT_MILESTONES,
  };
}
