/**
 * Education Organization Resources v2 — Mock Data & Types
 * Resource library, packs, templates, SOPs, policy shortcuts, role kits,
 * resource requests, changelog, and admin categories.
 * HBCU-themed seeded data.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ResourceType =
  | 'template'
  | 'sop'
  | 'guide'
  | 'checklist'
  | 'policy_link'
  | 'video'
  | 'form';

export type ResourceStatus = 'canonical' | 'draft' | 'archived';

export type ResourceAudience = 'staff' | 'students' | 'public' | 'restricted';

export type DepartmentScope =
  | 'admissions'
  | 'academics'
  | 'housing'
  | 'finance'
  | 'athletics'
  | 'admin'
  | 'institution';

export type PackStatus = 'active' | 'draft' | 'archived';

export type PackAudience = 'staff' | 'students' | 'external';

export type SOPStatus = 'canonical' | 'draft';

export type RoleKitType =
  | 'admissions_counselor'
  | 'registrar'
  | 'housing_director'
  | 'ra'
  | 'faculty'
  | 'athletics_admin'
  | 'finance_ops';

export type RequestType =
  | 'new_sop'
  | 'update_template'
  | 'new_pack'
  | 'access_request';

export type RequestStatus =
  | 'new'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'closed';

export type RequestPriority = 'high' | 'normal' | 'low';

export type ChangeType = 'created' | 'updated' | 'retired' | 'version_bump';

// =============================================================================
// INTERFACES
// =============================================================================

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  status: ResourceStatus;
  audience: ResourceAudience;
  department: DepartmentScope;
  owner: string;
  version: number;
  lastUpdated: string;
  summary: string;
  pinned?: boolean;
}

export interface PackItem {
  resourceId: string;
  title: string;
  type: ResourceType;
  required: boolean;
}

export interface ResourcePack {
  id: string;
  name: string;
  audience: PackAudience;
  status: PackStatus;
  department: DepartmentScope;
  itemCount: number;
  items: PackItem[];
  description: string;
  lastUpdated: string;
}

export interface Template {
  id: string;
  title: string;
  department: DepartmentScope;
  category: string;
  version: number;
  lastUpdated: string;
  outdated: boolean;
}

export interface SOPStep {
  order: number;
  title: string;
  description: string;
}

export interface SOP {
  id: string;
  title: string;
  department: DepartmentScope;
  status: SOPStatus;
  stepsCount: number;
  estimatedMinutes: number;
  steps: SOPStep[];
  preconditions: string[];
  failurePoints: string[];
  escalationPath: string;
}

export interface PolicyShortcut {
  id: string;
  title: string;
  department: DepartmentScope;
  lastUpdated: string;
  referencedCount: number;
}

export interface RoleKit {
  id: string;
  type: RoleKitType;
  label: string;
  policies: string[];
  sops: string[];
  templates: string[];
  emergencyActions: string[];
  contacts: string[];
}

export interface ResourceRequest {
  id: string;
  type: RequestType;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  requestedBy: string;
  requestedDate: string;
  dueDate?: string;
  description: string;
}

export interface ChangelogEntry {
  id: string;
  resourceId: string;
  resourceTitle: string;
  type: ChangeType;
  date: string;
  actor: string;
  notes: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  resourceCount: number;
  description: string;
}

// =============================================================================
// LABEL & COLOR CONSTANTS
// =============================================================================

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  template: 'Template',
  sop: 'SOP',
  guide: 'Guide',
  checklist: 'Checklist',
  policy_link: 'Policy Link',
  video: 'Video',
  form: 'Form',
};

export const RESOURCE_TYPE_COLORS: Record<ResourceType, string> = {
  template: '#1D9BF0',
  sop: '#1D9BF0',
  guide: '#22C55E',
  checklist: '#F59E0B',
  policy_link: '#1D9BF0',
  video: '#EF4444',
  form: '#A1A1AA',
};

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  canonical: 'Canonical',
  draft: 'Draft',
  archived: 'Archived',
};

export const RESOURCE_STATUS_COLORS: Record<ResourceStatus, string> = {
  canonical: '#22C55E',
  draft: '#F59E0B',
  archived: '#A1A1AA',
};

export const RESOURCE_AUDIENCE_LABELS: Record<ResourceAudience, string> = {
  staff: 'Staff',
  students: 'Students',
  public: 'Public',
  restricted: 'Restricted',
};

export const RESOURCE_AUDIENCE_COLORS: Record<ResourceAudience, string> = {
  staff: '#1D9BF0',
  students: '#22C55E',
  public: '#22C55E',
  restricted: '#EF4444',
};

export const DEPARTMENT_SCOPE_LABELS: Record<DepartmentScope, string> = {
  admissions: 'Admissions',
  academics: 'Academics',
  housing: 'Housing',
  finance: 'Finance',
  athletics: 'Athletics',
  admin: 'Administration',
  institution: 'Institution-Wide',
};

export const DEPARTMENT_SCOPE_COLORS: Record<DepartmentScope, string> = {
  admissions: '#1D9BF0',
  academics: '#1D9BF0',
  housing: '#F59E0B',
  finance: '#22C55E',
  athletics: '#EF4444',
  admin: '#A1A1AA',
  institution: '#1D9BF0',
};

export const PACK_STATUS_LABELS: Record<PackStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
};

export const PACK_STATUS_COLORS: Record<PackStatus, string> = {
  active: '#22C55E',
  draft: '#F59E0B',
  archived: '#A1A1AA',
};

export const PACK_AUDIENCE_LABELS: Record<PackAudience, string> = {
  staff: 'Staff',
  students: 'Students',
  external: 'External',
};

export const PACK_AUDIENCE_COLORS: Record<PackAudience, string> = {
  staff: '#1D9BF0',
  students: '#22C55E',
  external: '#1D9BF0',
};

export const SOP_STATUS_LABELS: Record<SOPStatus, string> = {
  canonical: 'Canonical',
  draft: 'Draft',
};

export const SOP_STATUS_COLORS: Record<SOPStatus, string> = {
  canonical: '#22C55E',
  draft: '#F59E0B',
};

export const ROLE_KIT_TYPE_LABELS: Record<RoleKitType, string> = {
  admissions_counselor: 'Admissions Counselor',
  registrar: 'Registrar',
  housing_director: 'Housing Director',
  ra: 'Resident Assistant',
  faculty: 'Faculty',
  athletics_admin: 'Athletics Admin',
  finance_ops: 'Finance Ops',
};

export const ROLE_KIT_TYPE_COLORS: Record<RoleKitType, string> = {
  admissions_counselor: '#1D9BF0',
  registrar: '#1D9BF0',
  housing_director: '#F59E0B',
  ra: '#22C55E',
  faculty: '#1D9BF0',
  athletics_admin: '#EF4444',
  finance_ops: '#22C55E',
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  new_sop: 'New SOP',
  update_template: 'Update Template',
  new_pack: 'New Pack',
  access_request: 'Access Request',
};

export const REQUEST_TYPE_COLORS: Record<RequestType, string> = {
  new_sop: '#1D9BF0',
  update_template: '#1D9BF0',
  new_pack: '#22C55E',
  access_request: '#F59E0B',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  approved: 'Approved',
  published: 'Published',
  closed: 'Closed',
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  new: '#1D9BF0',
  in_review: '#F59E0B',
  approved: '#22C55E',
  published: '#22C55E',
  closed: '#A1A1AA',
};

export const REQUEST_PRIORITY_LABELS: Record<RequestPriority, string> = {
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export const REQUEST_PRIORITY_COLORS: Record<RequestPriority, string> = {
  high: '#EF4444',
  normal: '#1D9BF0',
  low: '#22C55E',
};

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  created: 'Created',
  updated: 'Updated',
  retired: 'Retired',
  version_bump: 'Version Bump',
};

export const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
  created: '#22C55E',
  updated: '#1D9BF0',
  retired: '#A1A1AA',
  version_bump: '#1D9BF0',
};

// =============================================================================
// START HERE — PINNED RESOURCES (6)
// =============================================================================

const START_HERE: Resource[] = [
  {
    id: 'res-pin-001',
    title: 'Staff Handbook',
    type: 'guide',
    status: 'canonical',
    audience: 'staff',
    department: 'institution',
    owner: 'Dr. Evelyn Carter',
    version: 4,
    lastUpdated: '2026-01-10',
    summary: 'Comprehensive handbook for all university staff covering policies, expectations, benefits, and reporting structures.',
    pinned: true,
  },
  {
    id: 'res-pin-002',
    title: 'Emergency Quick Sheet',
    type: 'checklist',
    status: 'canonical',
    audience: 'staff',
    department: 'admin',
    owner: 'Chief Marcus Lane',
    version: 3,
    lastUpdated: '2026-02-01',
    summary: 'One-page emergency reference with campus police contacts, evacuation routes, shelter-in-place protocols, and medical response steps.',
    pinned: true,
  },
  {
    id: 'res-pin-003',
    title: 'Admissions SOP',
    type: 'sop',
    status: 'canonical',
    audience: 'staff',
    department: 'admissions',
    owner: 'Director Angela Brooks',
    version: 2,
    lastUpdated: '2026-01-15',
    summary: 'Standard operating procedure for the full admissions funnel from inquiry to enrollment deposit.',
    pinned: true,
  },
  {
    id: 'res-pin-004',
    title: 'Academic Calendar Procedures',
    type: 'guide',
    status: 'canonical',
    audience: 'staff',
    department: 'academics',
    owner: 'Provost Dr. Harold Mitchell',
    version: 2,
    lastUpdated: '2026-01-20',
    summary: 'Procedures for academic calendar milestones including registration, add/drop, midterms, finals, and grade submission deadlines.',
    pinned: true,
  },
  {
    id: 'res-pin-005',
    title: 'Housing Move-In Checklist',
    type: 'checklist',
    status: 'canonical',
    audience: 'staff',
    department: 'housing',
    owner: 'Director Tamara Wells',
    version: 3,
    lastUpdated: '2026-01-25',
    summary: 'Step-by-step checklist for residence hall move-in day covering room inspection, key distribution, and orientation schedule.',
    pinned: true,
  },
  {
    id: 'res-pin-006',
    title: 'Athletics Compliance Guide',
    type: 'guide',
    status: 'canonical',
    audience: 'staff',
    department: 'athletics',
    owner: 'Compliance Officer Dwayne Harris',
    version: 2,
    lastUpdated: '2026-02-05',
    summary: 'NCAA Division II compliance requirements for eligibility verification, recruiting contacts, and scholarship limits.',
    pinned: true,
  },
];

// =============================================================================
// LIBRARY RESOURCES (12)
// =============================================================================

const LIBRARY_RESOURCES: Resource[] = [
  {
    id: 'res-lib-001',
    title: 'Syllabus Template',
    type: 'template',
    status: 'canonical',
    audience: 'staff',
    department: 'academics',
    owner: 'Provost Dr. Harold Mitchell',
    version: 3,
    lastUpdated: '2026-01-12',
    summary: 'University-approved syllabus template with required sections for course objectives, grading policy, attendance, and ADA accommodations.',
  },
  {
    id: 'res-lib-002',
    title: 'Financial Aid Packaging SOP',
    type: 'sop',
    status: 'canonical',
    audience: 'restricted',
    department: 'finance',
    owner: 'Director Claudia Freeman',
    version: 2,
    lastUpdated: '2026-01-18',
    summary: 'Step-by-step procedure for assembling financial aid packages including Pell Grant, institutional scholarships, and work-study allocation.',
  },
  {
    id: 'res-lib-003',
    title: 'New Faculty Orientation Guide',
    type: 'guide',
    status: 'canonical',
    audience: 'staff',
    department: 'academics',
    owner: 'Dean Patricia Johnson',
    version: 2,
    lastUpdated: '2026-01-22',
    summary: 'Orientation guide for newly hired faculty covering LMS setup, office assignment, committee expectations, and tenure-track milestones.',
  },
  {
    id: 'res-lib-004',
    title: 'Room Inspection Checklist',
    type: 'checklist',
    status: 'canonical',
    audience: 'staff',
    department: 'housing',
    owner: 'Director Tamara Wells',
    version: 2,
    lastUpdated: '2026-02-03',
    summary: 'Detailed checklist for pre-semester and post-semester residence hall room inspections including furniture inventory and damage assessment.',
  },
  {
    id: 'res-lib-005',
    title: 'FERPA Compliance Quick Reference',
    type: 'policy_link',
    status: 'canonical',
    audience: 'staff',
    department: 'institution',
    owner: 'General Counsel Robert King',
    version: 1,
    lastUpdated: '2026-01-05',
    summary: 'Quick reference card summarizing FERPA requirements for student record access, directory information, and parental rights.',
  },
  {
    id: 'res-lib-006',
    title: 'Campus Tour Training Video',
    type: 'video',
    status: 'canonical',
    audience: 'students',
    department: 'admissions',
    owner: 'Director Angela Brooks',
    version: 1,
    lastUpdated: '2026-01-28',
    summary: 'Training video for student ambassadors on leading effective campus tours including talking points, route maps, and Q&A handling.',
  },
  {
    id: 'res-lib-007',
    title: 'Grade Change Request Form',
    type: 'form',
    status: 'canonical',
    audience: 'staff',
    department: 'academics',
    owner: 'Registrar Sandra Williams',
    version: 2,
    lastUpdated: '2026-02-08',
    summary: 'Official form for faculty to request a grade change after final grades have been posted, requiring department chair approval.',
  },
  {
    id: 'res-lib-008',
    title: 'Student-Athlete Eligibility Tracker Guide',
    type: 'guide',
    status: 'canonical',
    audience: 'restricted',
    department: 'athletics',
    owner: 'Compliance Officer Dwayne Harris',
    version: 1,
    lastUpdated: '2026-02-06',
    summary: 'Guide for tracking student-athlete academic eligibility including GPA thresholds, credit hour requirements, and progress-toward-degree checks.',
  },
  {
    id: 'res-lib-009',
    title: 'Budget Request Template',
    type: 'template',
    status: 'canonical',
    audience: 'staff',
    department: 'finance',
    owner: 'VP of Finance Dr. Leon Grant',
    version: 2,
    lastUpdated: '2026-01-30',
    summary: 'Standardized template for departmental budget requests including line-item justification, prior-year comparisons, and approval routing.',
  },
  {
    id: 'res-lib-010',
    title: 'Incident Report Form',
    type: 'form',
    status: 'canonical',
    audience: 'staff',
    department: 'housing',
    owner: 'Director Tamara Wells',
    version: 2,
    lastUpdated: '2026-02-10',
    summary: 'Form for documenting residence hall incidents including property damage, noise violations, and student conduct referrals.',
  },
  {
    id: 'res-lib-011',
    title: 'Title IX Overview Video',
    type: 'video',
    status: 'canonical',
    audience: 'public',
    department: 'institution',
    owner: 'Title IX Coordinator Dr. Nina Brooks',
    version: 1,
    lastUpdated: '2026-01-14',
    summary: 'Overview video explaining Title IX rights, reporting procedures, and campus resources available to students and employees.',
  },
  {
    id: 'res-lib-012',
    title: 'Travel Authorization Request Form',
    type: 'form',
    status: 'draft',
    audience: 'staff',
    department: 'admin',
    owner: 'VP of Finance Dr. Leon Grant',
    version: 1,
    lastUpdated: '2026-02-14',
    summary: 'Draft form for submitting travel authorization requests including per diem calculations, mileage reimbursement, and pre-approval workflow.',
  },
];

// =============================================================================
// COMBINED RESOURCES (Start Here + Library)
// =============================================================================

const RESOURCES: Resource[] = [...START_HERE, ...LIBRARY_RESOURCES];

// =============================================================================
// RESOURCE PACKS (5)
// =============================================================================

const PACKS: ResourcePack[] = [
  {
    id: 'pack-001',
    name: 'Admissions Season Pack',
    audience: 'staff',
    status: 'active',
    department: 'admissions',
    itemCount: 4,
    items: [
      { resourceId: 'res-pin-003', title: 'Admissions SOP', type: 'sop', required: true },
      { resourceId: 'res-lib-006', title: 'Campus Tour Training Video', type: 'video', required: true },
      { resourceId: 'res-lib-005', title: 'FERPA Compliance Quick Reference', type: 'policy_link', required: true },
      { resourceId: 'res-lib-009', title: 'Budget Request Template', type: 'template', required: false },
    ],
    description: 'Everything admissions staff need during peak recruitment season: the admissions SOP, tour training, FERPA reference, and budget request template.',
    lastUpdated: '2026-02-01',
  },
  {
    id: 'pack-002',
    name: 'Move-In Pack',
    audience: 'staff',
    status: 'active',
    department: 'housing',
    itemCount: 4,
    items: [
      { resourceId: 'res-pin-005', title: 'Housing Move-In Checklist', type: 'checklist', required: true },
      { resourceId: 'res-lib-004', title: 'Room Inspection Checklist', type: 'checklist', required: true },
      { resourceId: 'res-lib-010', title: 'Incident Report Form', type: 'form', required: true },
      { resourceId: 'res-pin-002', title: 'Emergency Quick Sheet', type: 'checklist', required: true },
    ],
    description: 'Complete resource bundle for housing staff and RAs during move-in day: checklists, incident forms, and emergency contacts.',
    lastUpdated: '2026-01-28',
  },
  {
    id: 'pack-003',
    name: 'Faculty Onboarding Pack',
    audience: 'staff',
    status: 'active',
    department: 'academics',
    itemCount: 4,
    items: [
      { resourceId: 'res-lib-003', title: 'New Faculty Orientation Guide', type: 'guide', required: true },
      { resourceId: 'res-lib-001', title: 'Syllabus Template', type: 'template', required: true },
      { resourceId: 'res-lib-007', title: 'Grade Change Request Form', type: 'form', required: false },
      { resourceId: 'res-lib-005', title: 'FERPA Compliance Quick Reference', type: 'policy_link', required: true },
    ],
    description: 'Onboarding pack for new faculty members: orientation guide, syllabus template, grade change form, and FERPA reference.',
    lastUpdated: '2026-01-25',
  },
  {
    id: 'pack-004',
    name: 'Athletics Compliance Pack',
    audience: 'staff',
    status: 'active',
    department: 'athletics',
    itemCount: 3,
    items: [
      { resourceId: 'res-pin-006', title: 'Athletics Compliance Guide', type: 'guide', required: true },
      { resourceId: 'res-lib-008', title: 'Student-Athlete Eligibility Tracker Guide', type: 'guide', required: true },
      { resourceId: 'res-lib-012', title: 'Travel Authorization Request Form', type: 'form', required: false },
    ],
    description: 'Compliance resources for athletics department staff covering NCAA regulations, eligibility tracking, and travel authorization.',
    lastUpdated: '2026-02-06',
  },
  {
    id: 'pack-005',
    name: 'New Hire Orientation Pack',
    audience: 'staff',
    status: 'active',
    department: 'institution',
    itemCount: 4,
    items: [
      { resourceId: 'res-pin-001', title: 'Staff Handbook', type: 'guide', required: true },
      { resourceId: 'res-pin-002', title: 'Emergency Quick Sheet', type: 'checklist', required: true },
      { resourceId: 'res-lib-005', title: 'FERPA Compliance Quick Reference', type: 'policy_link', required: true },
      { resourceId: 'res-lib-011', title: 'Title IX Overview Video', type: 'video', required: true },
    ],
    description: 'Day-one orientation pack for all new university employees: staff handbook, emergency procedures, FERPA, and Title IX overview.',
    lastUpdated: '2026-02-10',
  },
];

// =============================================================================
// TEMPLATES (6)
// =============================================================================

const TEMPLATES: Template[] = [
  {
    id: 'tmpl-001',
    title: 'Syllabus Template',
    department: 'academics',
    category: 'Academic Affairs',
    version: 3,
    lastUpdated: '2026-01-12',
    outdated: false,
  },
  {
    id: 'tmpl-002',
    title: 'Grade Change Form',
    department: 'academics',
    category: 'Registrar',
    version: 2,
    lastUpdated: '2026-02-08',
    outdated: false,
  },
  {
    id: 'tmpl-003',
    title: 'Incident Report',
    department: 'housing',
    category: 'Residential Life',
    version: 2,
    lastUpdated: '2026-02-10',
    outdated: false,
  },
  {
    id: 'tmpl-004',
    title: 'Room Check Form',
    department: 'housing',
    category: 'Residential Life',
    version: 2,
    lastUpdated: '2026-02-03',
    outdated: false,
  },
  {
    id: 'tmpl-005',
    title: 'Budget Request',
    department: 'finance',
    category: 'Finance & Operations',
    version: 2,
    lastUpdated: '2026-01-30',
    outdated: false,
  },
  {
    id: 'tmpl-006',
    title: 'Travel Request',
    department: 'admin',
    category: 'Administration',
    version: 1,
    lastUpdated: '2026-02-14',
    outdated: true,
  },
];

// =============================================================================
// SOPs (5)
// =============================================================================

const SOPS: SOP[] = [
  {
    id: 'sop-001',
    title: 'Admissions Funnel Weekly',
    department: 'admissions',
    status: 'canonical',
    stepsCount: 6,
    estimatedMinutes: 45,
    steps: [
      { order: 1, title: 'Pull Inquiry Report', description: 'Export the weekly inquiry report from the CRM system filtering by source, date range, and assigned counselor.' },
      { order: 2, title: 'Segment Prospects', description: 'Categorize new inquiries into tiers (hot, warm, cold) based on engagement score and application completion status.' },
      { order: 3, title: 'Assign Follow-Ups', description: 'Distribute follow-up tasks to admissions counselors based on territory assignment and current caseload balance.' },
      { order: 4, title: 'Review Pending Applications', description: 'Audit applications missing documents or test scores and trigger reminder emails through the automated workflow.' },
      { order: 5, title: 'Update Yield Dashboard', description: 'Refresh the yield projection dashboard with current week deposit counts, campus visit RSVPs, and financial aid acceptance rates.' },
      { order: 6, title: 'Team Standup Notes', description: 'Compile standup notes summarizing funnel movement, blockers, and action items for the Monday admissions team meeting.' },
    ],
    preconditions: [
      'CRM system access with reporting permissions',
      'Current semester enrollment targets approved by VP of Enrollment',
      'Territory assignments finalized for the recruitment cycle',
    ],
    failurePoints: [
      'CRM data export fails due to system maintenance window',
      'Counselor caseloads exceed 150 active prospects causing follow-up delays',
      'Incomplete FAFSA data prevents accurate yield projections',
    ],
    escalationPath: 'Counselor -> Associate Director of Admissions -> Director Angela Brooks -> VP of Enrollment',
  },
  {
    id: 'sop-002',
    title: 'Financial Aid Packaging',
    department: 'finance',
    status: 'canonical',
    stepsCount: 8,
    estimatedMinutes: 60,
    steps: [
      { order: 1, title: 'Verify FAFSA Completion', description: 'Confirm the student FAFSA has been received and processed by the federal processor with a valid EFC/SAI.' },
      { order: 2, title: 'Check Institutional Aid Eligibility', description: 'Cross-reference the student profile against institutional scholarship criteria including GPA, test scores, and legacy status.' },
      { order: 3, title: 'Calculate Pell Grant Amount', description: 'Determine Pell Grant eligibility and amount based on the current federal award table and enrollment intensity.' },
      { order: 4, title: 'Apply Institutional Scholarships', description: 'Layer institutional merit and need-based scholarships onto the package following the stacking priority matrix.' },
      { order: 5, title: 'Assess Work-Study Allocation', description: 'Evaluate work-study eligibility and assign available positions based on department needs and student preferences.' },
      { order: 6, title: 'Calculate Remaining Gap', description: 'Compute the remaining gap between total cost of attendance and awarded aid to determine loan eligibility.' },
      { order: 7, title: 'Generate Award Letter', description: 'Produce the official financial aid award letter with itemized aid components, net cost, and acceptance deadline.' },
      { order: 8, title: 'Queue for Director Review', description: 'Submit the completed package to the Financial Aid Director queue for final review and approval before student notification.' },
    ],
    preconditions: [
      'Student has been admitted and has an active student record',
      'FAFSA results received and loaded into the SIS',
      'Current year institutional scholarship budgets confirmed by VP of Finance',
      'Federal Pell Grant award tables updated for the current award year',
    ],
    failurePoints: [
      'FAFSA selected for verification delays packaging by 2-3 weeks',
      'Scholarship budget exhausted mid-cycle requiring waitlist management',
      'Student missing required tax documentation for income verification',
      'SIS integration failure prevents automated Pell calculation',
    ],
    escalationPath: 'Financial Aid Counselor -> Senior Counselor -> Director Claudia Freeman -> VP of Finance Dr. Leon Grant',
  },
  {
    id: 'sop-003',
    title: 'Housing Incident Response',
    department: 'housing',
    status: 'canonical',
    stepsCount: 5,
    estimatedMinutes: 30,
    steps: [
      { order: 1, title: 'Assess and Secure Scene', description: 'Arrive on scene within 5 minutes, assess the severity of the incident, and ensure immediate safety of all residents in the area.' },
      { order: 2, title: 'Contact Emergency Services if Needed', description: 'Call campus police (ext. 5555) or 911 for medical emergencies, fires, or criminal activity. Do not attempt to intervene in violent situations.' },
      { order: 3, title: 'Document the Incident', description: 'Complete the incident report form with date, time, location, involved parties, witness statements, and photographic evidence where appropriate.' },
      { order: 4, title: 'Notify Supervisory Chain', description: 'Contact the Resident Director on call, then the Director of Housing. For critical incidents, the Dean of Students must be notified within 1 hour.' },
      { order: 5, title: 'Follow-Up and Referrals', description: 'Schedule follow-up meetings with involved students within 48 hours. Submit conduct referrals to the Dean of Students office and counseling referrals as needed.' },
    ],
    preconditions: [
      'RA has completed mandatory incident response training',
      'Emergency contact list is current and accessible on mobile device',
      'Incident report forms are available (digital and paper backup)',
    ],
    failurePoints: [
      'RA unable to reach Resident Director on call',
      'Incident involves a weapon or active threat requiring immediate lockdown',
      'Student refuses to cooperate or provide identification',
    ],
    escalationPath: 'RA -> Resident Director -> Director Tamara Wells -> Dean of Students Dr. Charles Howard',
  },
  {
    id: 'sop-004',
    title: 'Grade Appeal Process',
    department: 'academics',
    status: 'canonical',
    stepsCount: 7,
    estimatedMinutes: 90,
    steps: [
      { order: 1, title: 'Student Initiates Appeal', description: 'Student submits a written grade appeal to the faculty member within 10 business days of grade posting, citing specific grounds (clerical error, bias, or policy violation).' },
      { order: 2, title: 'Faculty Review', description: 'Faculty member reviews the appeal, re-examines relevant coursework, and provides a written response to the student within 5 business days.' },
      { order: 3, title: 'Department Chair Mediation', description: 'If unresolved, the student forwards the appeal to the department chair who facilitates a meeting between the student and faculty member.' },
      { order: 4, title: 'Department Chair Decision', description: 'The department chair issues a written recommendation within 10 business days of the mediation meeting.' },
      { order: 5, title: 'Dean Review', description: 'If still unresolved, the appeal moves to the academic dean who reviews all documentation and may convene an ad hoc review committee.' },
      { order: 6, title: 'Academic Standards Committee', description: 'For cases reaching this level, the Academic Standards Committee convenes a hearing with both parties and issues a binding decision within 15 business days.' },
      { order: 7, title: 'Registrar Grade Update', description: 'If the appeal results in a grade change, the Registrar processes the change and updates the student transcript within 3 business days of the final decision.' },
    ],
    preconditions: [
      'Final grades have been posted for the term',
      'Student is currently enrolled or was enrolled in the term in question',
      'Appeal is filed within the published appeal window (10 business days)',
    ],
    failurePoints: [
      'Student misses the 10-day appeal filing deadline',
      'Faculty member is on leave and unable to respond within the required timeframe',
      'Documentation of original grading criteria is insufficient for committee review',
    ],
    escalationPath: 'Faculty Member -> Department Chair -> Academic Dean -> Academic Standards Committee -> Provost Dr. Harold Mitchell',
  },
  {
    id: 'sop-005',
    title: 'Athletics Travel Approval',
    department: 'athletics',
    status: 'canonical',
    stepsCount: 5,
    estimatedMinutes: 40,
    steps: [
      { order: 1, title: 'Submit Travel Request', description: 'Head coach submits the travel authorization request form at least 14 days before departure, including roster, itinerary, transportation method, and estimated budget.' },
      { order: 2, title: 'Academic Clearance Check', description: 'Athletics academic advisor verifies that all traveling student-athletes meet the minimum GPA and credit-hour requirements for competition eligibility.' },
      { order: 3, title: 'Budget Approval', description: 'Athletics business office reviews the travel budget against the sport operating budget and either approves or requests modifications.' },
      { order: 4, title: 'Compliance Sign-Off', description: 'Compliance officer reviews the travel party for NCAA roster limits, confirms permissible travel party members, and checks for recruiting calendar conflicts.' },
      { order: 5, title: 'AD Final Approval', description: 'Athletic Director provides final approval and authorizes the travel advance. Travel coordinator books transportation and lodging.' },
    ],
    preconditions: [
      'Competition schedule approved by conference office',
      'Sport operating budget finalized for the current fiscal year',
      'All student-athletes on the travel roster have current physicals and insurance on file',
    ],
    failurePoints: [
      'Student-athlete falls below academic eligibility threshold after midterm grades',
      'Travel budget exceeds remaining sport allocation requiring emergency fund request',
      'Bus or charter cancellation within 48 hours of departure',
    ],
    escalationPath: 'Head Coach -> Associate AD -> Compliance Officer Dwayne Harris -> Athletic Director James Patterson',
  },
];

// =============================================================================
// POLICY SHORTCUTS (5)
// =============================================================================

const POLICY_SHORTCUTS: PolicyShortcut[] = [
  {
    id: 'pol-001',
    title: 'FERPA Student Records Policy',
    department: 'institution',
    lastUpdated: '2026-01-05',
    referencedCount: 87,
  },
  {
    id: 'pol-002',
    title: 'Title IX Compliance Policy',
    department: 'institution',
    lastUpdated: '2026-01-14',
    referencedCount: 64,
  },
  {
    id: 'pol-003',
    title: 'Student Code of Conduct',
    department: 'institution',
    lastUpdated: '2025-12-01',
    referencedCount: 112,
  },
  {
    id: 'pol-004',
    title: 'NCAA Eligibility & Compliance',
    department: 'athletics',
    lastUpdated: '2026-02-05',
    referencedCount: 53,
  },
  {
    id: 'pol-005',
    title: 'Financial Aid Satisfactory Academic Progress',
    department: 'finance',
    lastUpdated: '2026-01-18',
    referencedCount: 41,
  },
];

// =============================================================================
// ROLE KITS (7)
// =============================================================================

const ROLE_KITS: RoleKit[] = [
  {
    id: 'kit-001',
    type: 'admissions_counselor',
    label: 'Admissions Counselor',
    policies: ['FERPA Student Records Policy', 'Admissions Communication Standards', 'Campus Visit Safety Protocol'],
    sops: ['Admissions Funnel Weekly', 'Campus Tour Procedures', 'Application Review Workflow'],
    templates: ['Prospective Student Letter Template', 'Campus Visit Confirmation Email', 'Scholarship Notification Template'],
    emergencyActions: ['Contact campus police for visitor incidents', 'Report FERPA breach to General Counsel', 'Escalate application fraud to Director'],
    contacts: ['Director Angela Brooks', 'Associate Director of Admissions', 'Campus Police Dispatch'],
  },
  {
    id: 'kit-002',
    type: 'registrar',
    label: 'Registrar',
    policies: ['FERPA Student Records Policy', 'Academic Integrity Policy', 'Transcript Release Policy'],
    sops: ['Grade Appeal Process', 'Transcript Request Fulfillment', 'Enrollment Verification'],
    templates: ['Grade Change Form', 'Enrollment Verification Letter', 'Degree Audit Checklist'],
    emergencyActions: ['Lock student record on fraud alert', 'Escalate transcript discrepancy to Provost', 'Halt grade posting on system error'],
    contacts: ['Registrar Sandra Williams', 'Provost Dr. Harold Mitchell', 'IT Help Desk'],
  },
  {
    id: 'kit-003',
    type: 'housing_director',
    label: 'Housing Director',
    policies: ['Student Code of Conduct', 'Title IX Compliance Policy', 'Residential Life Policies'],
    sops: ['Housing Incident Response', 'Move-In Day Operations', 'Room Assignment Process'],
    templates: ['Incident Report', 'Room Check Form', 'Housing Contract Addendum'],
    emergencyActions: ['Activate emergency housing protocol', 'Contact campus police for safety threats', 'Coordinate with Dean of Students on critical incidents'],
    contacts: ['Director Tamara Wells', 'Dean of Students Dr. Charles Howard', 'Campus Police Chief Marcus Lane'],
  },
  {
    id: 'kit-004',
    type: 'ra',
    label: 'Resident Assistant',
    policies: ['Student Code of Conduct', 'Residential Life Policies', 'Mandatory Reporting Requirements'],
    sops: ['Housing Incident Response', 'Room Check Procedures', 'After-Hours Emergency Protocol'],
    templates: ['Incident Report', 'Room Check Form', 'Resident Meeting Log'],
    emergencyActions: ['Call campus police (ext. 5555)', 'Contact Resident Director on call', 'Administer first aid if trained and safe to do so'],
    contacts: ['Resident Director on call', 'Director Tamara Wells', 'Campus Police Dispatch', 'Counseling Center Crisis Line'],
  },
  {
    id: 'kit-005',
    type: 'faculty',
    label: 'Faculty',
    policies: ['FERPA Student Records Policy', 'Academic Integrity Policy', 'Title IX Compliance Policy', 'ADA Accommodations Policy'],
    sops: ['Grade Appeal Process', 'Academic Integrity Violation Reporting', 'Syllabus Submission Process'],
    templates: ['Syllabus Template', 'Grade Change Form', 'Academic Integrity Incident Report'],
    emergencyActions: ['Report Title IX concern to coordinator', 'Contact campus police for classroom emergencies', 'Submit early alert for at-risk students'],
    contacts: ['Department Chair', 'Dean of the College', 'Title IX Coordinator Dr. Nina Brooks', 'Disability Services Office'],
  },
  {
    id: 'kit-006',
    type: 'athletics_admin',
    label: 'Athletics Admin',
    policies: ['NCAA Eligibility & Compliance', 'Title IX Compliance Policy', 'Travel & Per Diem Policy'],
    sops: ['Athletics Travel Approval', 'Eligibility Certification Process', 'Game Day Operations'],
    templates: ['Travel Authorization Request', 'Eligibility Checklist', 'Budget Request'],
    emergencyActions: ['Report NCAA violation to compliance officer', 'Contact athletic trainer for medical emergencies', 'Escalate travel disruption to Associate AD'],
    contacts: ['Compliance Officer Dwayne Harris', 'Athletic Director James Patterson', 'Sports Information Director'],
  },
  {
    id: 'kit-007',
    type: 'finance_ops',
    label: 'Finance Ops',
    policies: ['Financial Aid Satisfactory Academic Progress', 'Tuition & Fee Refund Policy', 'Procurement Policy'],
    sops: ['Financial Aid Packaging', 'Tuition Billing Cycle', 'Vendor Payment Processing'],
    templates: ['Budget Request', 'Purchase Order Form', 'Financial Aid Award Letter'],
    emergencyActions: ['Freeze account on suspected fraud', 'Escalate FAFSA discrepancy to Director', 'Emergency fund disbursement for student crisis'],
    contacts: ['Director Claudia Freeman', 'VP of Finance Dr. Leon Grant', 'Bursar Office', 'Student Accounts Manager'],
  },
];

// =============================================================================
// RESOURCE REQUESTS (5)
// =============================================================================

const REQUESTS: ResourceRequest[] = [
  {
    id: 'req-001',
    type: 'new_sop',
    title: 'Create SOP for International Student Onboarding',
    status: 'new',
    priority: 'high',
    requestedBy: 'Director of International Programs',
    requestedDate: '2026-02-10',
    dueDate: '2026-03-15',
    description: 'Need a comprehensive SOP for onboarding international students covering I-20 processing, orientation scheduling, housing placement, and cultural adjustment resources.',
  },
  {
    id: 'req-002',
    type: 'update_template',
    title: 'Update Syllabus Template for New LMS',
    status: 'in_review',
    priority: 'normal',
    requestedBy: 'Faculty Senate Chair',
    requestedDate: '2026-02-05',
    description: 'The syllabus template needs updates to reflect the new LMS platform links, updated accessibility statement, and revised academic integrity language.',
  },
  {
    id: 'req-003',
    type: 'new_pack',
    title: 'Create Homecoming Week Operations Pack',
    status: 'approved',
    priority: 'high',
    requestedBy: 'Director of Student Activities',
    requestedDate: '2026-01-28',
    dueDate: '2026-03-01',
    description: 'Need a comprehensive resource pack for Homecoming Week covering event logistics, vendor management, safety protocols, parade route, and halftime coordination.',
  },
  {
    id: 'req-004',
    type: 'access_request',
    title: 'Athletics Staff Access to Financial Aid Data',
    status: 'new',
    priority: 'normal',
    requestedBy: 'Compliance Officer Dwayne Harris',
    requestedDate: '2026-02-12',
    description: 'Athletics compliance staff need read-only access to financial aid packaging data for scholarship student-athletes to verify NCAA countable aid limits.',
  },
  {
    id: 'req-005',
    type: 'new_sop',
    title: 'Emergency Campus Closure SOP',
    status: 'published',
    priority: 'high',
    requestedBy: 'Chief Marcus Lane',
    requestedDate: '2026-01-15',
    description: 'SOP for coordinating emergency campus closures due to severe weather, safety threats, or infrastructure failures including communication tree and decision authority.',
  },
];

// =============================================================================
// CHANGELOG (10)
// =============================================================================

const CHANGELOG: ChangelogEntry[] = [
  {
    id: 'cl-001',
    resourceId: 'res-lib-012',
    resourceTitle: 'Travel Authorization Request Form',
    type: 'created',
    date: '2026-02-14',
    actor: 'VP of Finance Dr. Leon Grant',
    notes: 'Initial draft of the travel authorization request form created for review by the administration.',
  },
  {
    id: 'cl-002',
    resourceId: 'res-lib-010',
    resourceTitle: 'Incident Report Form',
    type: 'updated',
    date: '2026-02-10',
    actor: 'Director Tamara Wells',
    notes: 'Updated incident report form to include new fields for bias-related incident classification and Title IX referral checkbox.',
  },
  {
    id: 'cl-003',
    resourceId: 'res-lib-007',
    resourceTitle: 'Grade Change Request Form',
    type: 'version_bump',
    date: '2026-02-08',
    actor: 'Registrar Sandra Williams',
    notes: 'Bumped to v2 with electronic signature support and automated routing to department chair for approval.',
  },
  {
    id: 'cl-004',
    resourceId: 'res-lib-008',
    resourceTitle: 'Student-Athlete Eligibility Tracker Guide',
    type: 'created',
    date: '2026-02-06',
    actor: 'Compliance Officer Dwayne Harris',
    notes: 'New guide created for tracking student-athlete academic eligibility per updated NCAA Division II requirements.',
  },
  {
    id: 'cl-005',
    resourceId: 'res-pin-006',
    resourceTitle: 'Athletics Compliance Guide',
    type: 'updated',
    date: '2026-02-05',
    actor: 'Compliance Officer Dwayne Harris',
    notes: 'Updated compliance guide to reflect 2026-27 NCAA Division II recruiting calendar changes and NIL policy clarifications.',
  },
  {
    id: 'cl-006',
    resourceId: 'res-lib-004',
    resourceTitle: 'Room Inspection Checklist',
    type: 'version_bump',
    date: '2026-02-03',
    actor: 'Director Tamara Wells',
    notes: 'Bumped to v2 adding smart thermostat check and window screen inspection items to the spring semester checklist.',
  },
  {
    id: 'cl-007',
    resourceId: 'res-pin-002',
    resourceTitle: 'Emergency Quick Sheet',
    type: 'updated',
    date: '2026-02-01',
    actor: 'Chief Marcus Lane',
    notes: 'Updated emergency quick sheet with new campus police non-emergency number and revised severe weather shelter locations.',
  },
  {
    id: 'cl-008',
    resourceId: 'res-lib-009',
    resourceTitle: 'Budget Request Template',
    type: 'version_bump',
    date: '2026-01-30',
    actor: 'VP of Finance Dr. Leon Grant',
    notes: 'Bumped to v2 with new line items for DEI initiative funding and technology infrastructure requests.',
  },
  {
    id: 'cl-009',
    resourceId: 'res-lib-006',
    resourceTitle: 'Campus Tour Training Video',
    type: 'created',
    date: '2026-01-28',
    actor: 'Director Angela Brooks',
    notes: 'New training video produced for student ambassadors covering the updated campus tour route including the new STEM building.',
  },
  {
    id: 'cl-010',
    resourceId: 'res-lib-003',
    resourceTitle: 'New Faculty Orientation Guide',
    type: 'retired',
    date: '2026-01-22',
    actor: 'Dean Patricia Johnson',
    notes: 'Retired v1 of the faculty orientation guide and replaced with v2 incorporating new LMS onboarding steps and revised committee assignments.',
  },
];

// =============================================================================
// ADMIN CATEGORIES (4)
// =============================================================================

const ADMIN_CATEGORIES: AdminCategory[] = [
  {
    id: 'cat-001',
    name: 'Academic Affairs',
    resourceCount: 6,
    description: 'Resources related to academic programs, faculty, curriculum, grading, and academic standards.',
  },
  {
    id: 'cat-002',
    name: 'Student Services',
    resourceCount: 5,
    description: 'Resources for student life, housing, conduct, counseling, and extracurricular activities.',
  },
  {
    id: 'cat-003',
    name: 'Finance & Operations',
    resourceCount: 4,
    description: 'Resources for financial aid, tuition, budgeting, procurement, and operational procedures.',
  },
  {
    id: 'cat-004',
    name: 'Enrollment & Athletics',
    resourceCount: 5,
    description: 'Resources for admissions, recruitment, athletics compliance, and student-athlete services.',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getEduResourcesData() {
  return {
    resources: RESOURCES,
    packs: PACKS,
    templates: TEMPLATES,
    sops: SOPS,
    policyShortcuts: POLICY_SHORTCUTS,
    roleKits: ROLE_KITS,
    requests: REQUESTS,
    changelog: CHANGELOG,
    adminCategories: ADMIN_CATEGORIES,
  };
}
