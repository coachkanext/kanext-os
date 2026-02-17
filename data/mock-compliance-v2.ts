/**
 * Compliance Hub v2 — Mock Data
 * Mode-aware compliance data for all 5 KaNeXT modes.
 */

import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type ComplianceTabId =
  | 'dashboard'
  | 'requirements'
  | 'checklists'
  | 'evidence'
  | 'incidents'
  | 'actions'
  | 'training'
  | 'policies'
  | 'deadlines'
  | 'reports'
  | 'audit'
  | 'settings';

export interface ComplianceTab {
  id: ComplianceTabId;
  label: string;
}

export interface ComplianceScopeChip {
  key: string;
  label: string;
}

export type RequirementStatus = 'compliant' | 'due-soon' | 'overdue' | 'waived' | 'not-applicable';
export type EvidenceStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export type ComplianceSortOption = 'due-soonest' | 'recent-activity' | 'severity';

export interface ComplianceDashboardBlock {
  id: string;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  detail?: string;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  cadence: string;
  owner: string;
  ownerInitials: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: RequirementStatus;
  dueDate: string;
  lastVerified?: string;
  scope: string;
}

export interface ComplianceChecklist {
  id: string;
  title: string;
  description: string;
  requirementCount: number;
  completedCount: number;
  owner: string;
  ownerInitials: string;
  dueDate: string;
  status: 'complete' | 'in-progress' | 'not-started' | 'overdue';
  scope: string;
}

export interface ComplianceEvidence {
  id: string;
  title: string;
  requirementId: string;
  requirementTitle: string;
  type: 'document' | 'link' | 'attestation' | 'certificate';
  submittedBy: string;
  submittedByInitials: string;
  submittedDate: string;
  status: EvidenceStatus;
  verifiedBy?: string;
  verifiedDate?: string;
  expiresDate?: string;
}

export interface ComplianceIncident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: IncidentStatus;
  reportedBy: string;
  reportedByInitials: string;
  reportedDate: string;
  assignedTo?: string;
  assignedToInitials?: string;
  resolvedDate?: string;
  scope: string;
}

export interface ComplianceAction {
  id: string;
  title: string;
  description: string;
  incidentId?: string;
  incidentTitle?: string;
  assignee: string;
  assigneeInitials: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'verified';
  priority: 'critical' | 'high' | 'medium' | 'low';
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface ComplianceTraining {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeInitials: string;
  module: string;
  dueDate: string;
  completedDate?: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  score?: number;
}

export interface CompliancePolicy {
  id: string;
  title: string;
  description: string;
  version: string;
  effectiveDate: string;
  reviewDate: string;
  owner: string;
  ownerInitials: string;
  status: 'active' | 'under-review' | 'draft' | 'archived';
  acknowledgedCount: number;
  totalCount: number;
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  owner: string;
  ownerInitials: string;
  status: 'upcoming' | 'due-soon' | 'overdue' | 'completed';
  proofRequired: boolean;
  proofSubmitted: boolean;
  scope: string;
}

export interface ComplianceReport {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedAt: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  size: string;
}

export interface ComplianceAuditEntry {
  id: string;
  action: string;
  actor: string;
  actorInitials: string;
  target: string;
  timestamp: string;
  detail?: string;
}

export interface ComplianceSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ComplianceModeData {
  dashboard: ComplianceDashboardBlock[];
  requirements: ComplianceRequirement[];
  checklists: ComplianceChecklist[];
  evidence: ComplianceEvidence[];
  incidents: ComplianceIncident[];
  actions: ComplianceAction[];
  training: ComplianceTraining[];
  policies: CompliancePolicy[];
  deadlines: ComplianceDeadline[];
  reports: ComplianceReport[];
  audit: ComplianceAuditEntry[];
  settings: ComplianceSettingToggle[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const COMPLIANCE_TABS: ComplianceTab[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'checklists', label: 'Checklists' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'actions', label: 'Actions' },
  { id: 'training', label: 'Training' },
  { id: 'policies', label: 'Policies' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

export const COMPLIANCE_SCOPE_CHIPS: Record<Mode, ComplianceScopeChip[]> = {
  sports: [
    { key: 'organization', label: 'Organization' },
    { key: 'program', label: 'Program' },
    { key: 'season', label: 'Season' },
  ],
  education: [
    { key: 'organization', label: 'Organization' },
    { key: 'institution', label: 'Institution' },
    { key: 'department', label: 'Department' },
  ],
  church: [
    { key: 'organization', label: 'Organization' },
    { key: 'campus', label: 'Campus' },
    { key: 'ministry', label: 'Ministry' },
  ],
  enterprise: [
    { key: 'organization', label: 'Organization' },
    { key: 'entity', label: 'Entity' },
    { key: 'department', label: 'Department' },
  ],
  community: [
    { key: 'organization', label: 'Organization' },
    { key: 'series', label: 'Series' },
    { key: 'event-weekend', label: 'Event Weekend' },
  ],
};

export const REQUIREMENT_STATUS_COLOR: Record<RequirementStatus, string> = {
  compliant: '#22C55E',
  'due-soon': '#F59E0B',
  overdue: '#EF4444',
  waived: '#9CA3AF',
  'not-applicable': '#6B7280',
};

export const EVIDENCE_STATUS_COLOR: Record<EvidenceStatus, string> = {
  pending: '#F59E0B',
  submitted: '#3B82F6',
  verified: '#22C55E',
  rejected: '#EF4444',
};

export const INCIDENT_STATUS_COLOR: Record<IncidentStatus, string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
  closed: '#6B7280',
};

export const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#6B7280',
};

export const CHECKLIST_STATUS_COLOR: Record<ComplianceChecklist['status'], string> = {
  complete: '#22C55E',
  'in-progress': '#3B82F6',
  'not-started': '#9CA3AF',
  overdue: '#EF4444',
};

export const DASHBOARD_STATUS_COLOR: Record<ComplianceDashboardBlock['status'], string> = {
  good: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
};

// =============================================================================
// SPORTS MODE — FMU Basketball
// =============================================================================

const sportsDashboard: ComplianceDashboardBlock[] = [
  { id: 'sd-01', label: 'Eligibility Posture', value: '12/13 cleared', status: 'good', detail: 'All active players cleared except 1 pending transfer' },
  { id: 'sd-02', label: 'Medical Clearance', value: '11/13 cleared', status: 'warning', detail: '2 pending physicals — Players #23 and #7' },
  { id: 'sd-03', label: 'Recruiting Compliance', value: 'Compliant', status: 'good', detail: 'All contact logs current through Feb 14' },
  { id: 'sd-04', label: 'Travel Compliance', value: '1 trip needs waivers', status: 'warning', detail: 'Spring Trip — Mar 5 departure, waivers due Mar 1' },
  { id: 'sd-05', label: 'Staff Training', value: '4/5 complete', status: 'warning', detail: 'Coach Reed — First Aid Certification overdue' },
  { id: 'sd-06', label: 'Incidents Queue', value: '1 open', status: 'warning', detail: 'Equipment safety concern — weight room' },
  { id: 'sd-07', label: 'Upcoming Deadlines', value: '3 in next 30 days', status: 'good', detail: 'Eligibility verification, medical renewals, travel packet' },
];

const sportsRequirements: ComplianceRequirement[] = [
  { id: 'sr-01', title: 'Player Eligibility Documentation', description: 'All active roster players must have current eligibility verification on file with the conference office.', category: 'Eligibility', cadence: 'Annual', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', severity: 'critical', status: 'compliant', dueDate: 'Feb 28, 2026', lastVerified: 'Jan 15, 2026', scope: 'Program' },
  { id: 'sr-02', title: 'Medical Clearance & Physicals', description: 'Pre-participation physicals required for all student-athletes before competition.', category: 'Medical', cadence: 'Annual', owner: 'Marcus Reed', ownerInitials: 'MR', severity: 'critical', status: 'due-soon', dueDate: 'Mar 15, 2026', lastVerified: 'Jan 10, 2026', scope: 'Program' },
  { id: 'sr-03', title: 'Travel Waivers Per Trip', description: 'Signed travel waivers required for all student-athletes and staff prior to each away trip.', category: 'Travel', cadence: 'Per Trip', owner: 'Devin Thomas', ownerInitials: 'DT', severity: 'high', status: 'compliant', dueDate: 'Mar 1, 2026', lastVerified: 'Feb 8, 2026', scope: 'Season' },
  { id: 'sr-04', title: 'Staff Training Completion', description: 'All coaching and support staff must complete required annual training modules.', category: 'Training', cadence: 'Annual', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', severity: 'high', status: 'due-soon', dueDate: 'Apr 30, 2026', scope: 'Organization' },
  { id: 'sr-05', title: 'Recruiting Process Evidence', description: 'Contact logs, visit reports, and communication records for all recruiting interactions.', category: 'Recruiting', cadence: 'Per Cycle', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', severity: 'medium', status: 'compliant', dueDate: 'May 31, 2026', lastVerified: 'Feb 14, 2026', scope: 'Program' },
];

const sportsChecklists: ComplianceChecklist[] = [
  { id: 'sc-01', title: 'Spring Trip Compliance', description: 'All travel documentation, waivers, and insurance for the March spring trip.', requirementCount: 6, completedCount: 4, owner: 'Devin Thomas', ownerInitials: 'DT', dueDate: 'Mar 1, 2026', status: 'in-progress', scope: 'Season' },
  { id: 'sc-02', title: 'Season Eligibility', description: 'Full eligibility verification for all rostered student-athletes.', requirementCount: 8, completedCount: 8, owner: 'Sammy Kalejaiye', ownerInitials: 'SK', dueDate: 'Jan 15, 2026', status: 'complete', scope: 'Program' },
  { id: 'sc-03', title: 'Annual Staff Training', description: 'Required training modules for all coaching and support staff.', requirementCount: 5, completedCount: 4, owner: 'Sammy Kalejaiye', ownerInitials: 'SK', dueDate: 'Apr 30, 2026', status: 'in-progress', scope: 'Organization' },
];

const sportsEvidence: ComplianceEvidence[] = [
  { id: 'se-01', title: 'Player Eligibility Packet — Full Roster', requirementId: 'sr-01', requirementTitle: 'Player Eligibility Documentation', type: 'document', submittedBy: 'Sammy Kalejaiye', submittedByInitials: 'SK', submittedDate: 'Jan 15, 2026', status: 'verified', verifiedBy: 'Conference Office', verifiedDate: 'Jan 18, 2026' },
  { id: 'se-02', title: 'Medical Clearance — Player #23', requirementId: 'sr-02', requirementTitle: 'Medical Clearance & Physicals', type: 'attestation', submittedBy: 'Marcus Reed', submittedByInitials: 'MR', submittedDate: 'Feb 12, 2026', status: 'pending' },
  { id: 'se-03', title: 'Trip Waiver — Spring Trip', requirementId: 'sr-03', requirementTitle: 'Travel Waivers Per Trip', type: 'document', submittedBy: 'Devin Thomas', submittedByInitials: 'DT', submittedDate: 'Feb 10, 2026', status: 'submitted' },
  { id: 'se-04', title: 'Staff Training Cert — Coach Reed', requirementId: 'sr-04', requirementTitle: 'Staff Training Completion', type: 'certificate', submittedBy: 'Marcus Reed', submittedByInitials: 'MR', submittedDate: 'Jan 22, 2026', status: 'verified', verifiedBy: 'HR Office', verifiedDate: 'Jan 25, 2026', expiresDate: 'Jan 22, 2027' },
  { id: 'se-05', title: 'Recruiting Contact Log — Feb', requirementId: 'sr-05', requirementTitle: 'Recruiting Process Evidence', type: 'link', submittedBy: 'Sammy Kalejaiye', submittedByInitials: 'SK', submittedDate: 'Feb 14, 2026', status: 'submitted' },
];

const sportsIncidents: ComplianceIncident[] = [
  { id: 'si-01', title: 'Player Medical Hold — Missed Physical', description: 'Player #23 has not completed required pre-participation physical. Practice participation suspended until cleared.', severity: 'medium', status: 'investigating', reportedBy: 'Marcus Reed', reportedByInitials: 'MR', reportedDate: 'Feb 10, 2026', assignedTo: 'Marcus Reed', assignedToInitials: 'MR', scope: 'Program' },
  { id: 'si-02', title: 'Travel Manifest Discrepancy — Jan Trip', description: 'Head count on travel manifest did not match bus roster for January away game. Resolved — data entry error.', severity: 'low', status: 'resolved', reportedBy: 'Devin Thomas', reportedByInitials: 'DT', reportedDate: 'Jan 20, 2026', assignedTo: 'Devin Thomas', assignedToInitials: 'DT', resolvedDate: 'Jan 22, 2026', scope: 'Season' },
  { id: 'si-03', title: 'Equipment Safety Concern — Weight Room', description: 'Frayed cable on lat pulldown machine reported by strength staff. Machine tagged out of service pending inspection.', severity: 'medium', status: 'open', reportedBy: 'Tony Wallace', reportedByInitials: 'TW', reportedDate: 'Feb 13, 2026', scope: 'Organization' },
];

const sportsActions: ComplianceAction[] = [
  { id: 'sa-01', title: 'Schedule Physical for Player #23', description: 'Coordinate with athletics trainer to schedule pre-participation physical before next competition date.', incidentId: 'si-01', incidentTitle: 'Player Medical Hold — Missed Physical', assignee: 'Marcus Reed', assigneeInitials: 'MR', dueDate: 'Feb 20, 2026', status: 'in-progress', priority: 'high' },
  { id: 'sa-02', title: 'Update Travel Manifest Template', description: 'Revise travel manifest template to include automated head-count verification.', incidentId: 'si-02', incidentTitle: 'Travel Manifest Discrepancy — Jan Trip', assignee: 'Devin Thomas', assigneeInitials: 'DT', dueDate: 'Feb 15, 2026', status: 'completed', priority: 'medium', verifiedBy: 'Sammy Kalejaiye', verifiedDate: 'Feb 16, 2026' },
  { id: 'sa-03', title: 'Inspect Weight Room Equipment', description: 'Full inspection of all cable machines in the weight room. Replace frayed cable on lat pulldown.', incidentId: 'si-03', incidentTitle: 'Equipment Safety Concern — Weight Room', assignee: 'Tony Wallace', assigneeInitials: 'TW', dueDate: 'Feb 18, 2026', status: 'pending', priority: 'high' },
];

const sportsTraining: ComplianceTraining[] = [
  { id: 'st-01', title: 'NCCAA Compliance Training', description: 'Annual compliance training required by the National Christian College Athletic Association.', assignee: 'All Staff', assigneeInitials: 'AS', module: 'NCCAA Annual Compliance', dueDate: 'Apr 30, 2026', status: 'in-progress', score: 80 },
  { id: 'st-02', title: 'Recruiting Rules Refresher', description: 'Annual update on recruiting rules, contact periods, and permissible activities.', assignee: 'Sammy Kalejaiye', assigneeInitials: 'SK', module: 'Recruiting Rules 2026', dueDate: 'Mar 31, 2026', completedDate: 'Feb 5, 2026', status: 'completed', score: 95 },
  { id: 'st-03', title: 'First Aid Certification', description: 'Current first aid and CPR certification required for all coaching staff.', assignee: 'Marcus Reed', assigneeInitials: 'MR', module: 'First Aid & CPR', dueDate: 'Jan 31, 2026', status: 'overdue' },
  { id: 'st-04', title: 'Title IX Awareness', description: 'Mandatory Title IX training for all athletic department staff.', assignee: 'All Staff', assigneeInitials: 'AS', module: 'Title IX Awareness 2026', dueDate: 'Apr 30, 2026', status: 'in-progress', score: 60 },
];

const sportsPolicies: CompliancePolicy[] = [
  { id: 'sp-01', title: 'Athletic Eligibility Policy', description: 'Defines eligibility requirements, verification processes, and consequences for non-compliance.', version: 'v2.1', effectiveDate: 'Aug 1, 2025', reviewDate: 'Aug 1, 2026', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', status: 'active', acknowledgedCount: 12, totalCount: 13 },
  { id: 'sp-02', title: 'Travel & Conduct Policy', description: 'Travel procedures, conduct expectations, and waiver requirements for all program travel.', version: 'v1.3', effectiveDate: 'Sep 1, 2025', reviewDate: 'Sep 1, 2026', owner: 'Devin Thomas', ownerInitials: 'DT', status: 'active', acknowledgedCount: 13, totalCount: 13 },
  { id: 'sp-03', title: 'Recruiting Contact Policy', description: 'Guidelines for permissible recruiting contacts, communication methods, and documentation.', version: 'v1.0', effectiveDate: 'Jan 1, 2026', reviewDate: 'Jan 1, 2027', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', status: 'under-review', acknowledgedCount: 3, totalCount: 5 },
];

const sportsDeadlines: ComplianceDeadline[] = [
  { id: 'sdl-01', title: 'Spring Eligibility Verification', description: 'Submit verified eligibility documentation for all rostered student-athletes to the conference office.', dueDate: 'Feb 28, 2026', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', status: 'due-soon', proofRequired: true, proofSubmitted: false, scope: 'Program' },
  { id: 'sdl-02', title: 'Medical Clearance Renewals', description: 'Ensure all student-athletes have current pre-participation physicals on file.', dueDate: 'Mar 15, 2026', owner: 'Marcus Reed', ownerInitials: 'MR', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Program' },
  { id: 'sdl-03', title: 'Travel Compliance Packet — Spring Trip', description: 'Complete travel waivers, insurance verification, and manifest for the spring trip.', dueDate: 'Mar 1, 2026', owner: 'Devin Thomas', ownerInitials: 'DT', status: 'due-soon', proofRequired: true, proofSubmitted: false, scope: 'Season' },
  { id: 'sdl-04', title: 'Annual Staff Training Completion', description: 'All coaching and support staff must complete required training modules.', dueDate: 'Apr 30, 2026', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Organization' },
];

const sportsReports: ComplianceReport[] = [
  { id: 'srp-01', title: 'Season Compliance Packet', type: 'Comprehensive', period: '2025-26 Season', generatedAt: 'Feb 14, 2026', format: 'PDF', size: '2.4 MB' },
  { id: 'srp-02', title: 'Trip Compliance Packet', type: 'Travel', period: 'Jan 2026 Trip', generatedAt: 'Jan 25, 2026', format: 'PDF', size: '1.1 MB' },
  { id: 'srp-03', title: 'Eligibility Snapshot Export', type: 'Eligibility', period: 'Spring 2026', generatedAt: 'Feb 10, 2026', format: 'XLSX', size: '340 KB' },
];

const sportsAudit: ComplianceAuditEntry[] = [
  { id: 'sau-01', action: 'requirement_verified', actor: 'Conference Office', actorInitials: 'CO', target: 'Player Eligibility Documentation', timestamp: 'Feb 14, 2026 10:30 AM', detail: 'Full roster eligibility verified for spring competition' },
  { id: 'sau-02', action: 'evidence_submitted', actor: 'Marcus Reed', actorInitials: 'MR', target: 'Medical Clearance — Player #23', timestamp: 'Feb 12, 2026 3:15 PM', detail: 'Attestation submitted, awaiting verification' },
  { id: 'sau-03', action: 'incident_opened', actor: 'Tony Wallace', actorInitials: 'TW', target: 'Equipment Safety Concern — Weight Room', timestamp: 'Feb 13, 2026 9:00 AM', detail: 'Frayed cable on lat pulldown machine reported' },
  { id: 'sau-04', action: 'checklist_completed', actor: 'Sammy Kalejaiye', actorInitials: 'SK', target: 'Season Eligibility', timestamp: 'Jan 15, 2026 4:45 PM', detail: 'All 8 items verified and complete' },
  { id: 'sau-05', action: 'policy_updated', actor: 'Sammy Kalejaiye', actorInitials: 'SK', target: 'Recruiting Contact Policy', timestamp: 'Jan 5, 2026 11:00 AM', detail: 'New policy v1.0 published for review' },
  { id: 'sau-06', action: 'training_completed', actor: 'Sammy Kalejaiye', actorInitials: 'SK', target: 'Recruiting Rules Refresher', timestamp: 'Feb 5, 2026 2:30 PM', detail: 'Scored 95% on module assessment' },
  { id: 'sau-07', action: 'deadline_met', actor: 'Sammy Kalejaiye', actorInitials: 'SK', target: 'Preseason Eligibility Filing', timestamp: 'Jan 15, 2026 5:00 PM', detail: 'All documents submitted before deadline' },
  { id: 'sau-08', action: 'action_verified', actor: 'Sammy Kalejaiye', actorInitials: 'SK', target: 'Update Travel Manifest Template', timestamp: 'Feb 16, 2026 8:00 AM', detail: 'Revised template approved and distributed' },
];

const sportsSettings: ComplianceSettingToggle[] = [
  { id: 'sst-01', label: 'Auto-flag Overdue Eligibility', description: 'Automatically flag players whose eligibility documentation has expired or is past due.', enabled: true },
  { id: 'sst-02', label: 'Email Reminders 14 Days Before Deadlines', description: 'Send email reminders to owners 14 days before compliance deadlines.', enabled: true },
  { id: 'sst-03', label: 'Require Evidence for All Waivers', description: 'Require supporting evidence to be uploaded for every waiver submitted.', enabled: true },
  { id: 'sst-04', label: 'Auto-archive Resolved Incidents After 90 Days', description: 'Automatically move resolved incidents to the archive after 90 days of inactivity.', enabled: false },
];

// =============================================================================
// EDUCATION MODE — San Diego Christian College
// =============================================================================

const educationDashboard: ComplianceDashboardBlock[] = [
  { id: 'ed-01', label: 'Term Compliance Posture', value: 'Spring 2026 — 92%', status: 'good', detail: '46 of 50 requirements met for the current term' },
  { id: 'ed-02', label: 'Records & Privacy', value: '85% acknowledged', status: 'warning', detail: '7 faculty have not acknowledged the updated privacy policy' },
  { id: 'ed-03', label: 'Academic Deadlines', value: '2 upcoming', status: 'good', detail: 'Midterm grade submission and privacy acknowledgement deadline' },
  { id: 'ed-04', label: 'Regulatory Posture', value: 'Compliant', status: 'good', detail: 'All accreditation and regulatory filings current' },
  { id: 'ed-05', label: 'Staff Training', value: '78% complete', status: 'warning', detail: 'FERPA training completion behind target — 11 of 52 staff pending' },
  { id: 'ed-06', label: 'Incidents Queue', value: '1 open', status: 'warning', detail: 'Facilities safety concern — Chemistry lab' },
  { id: 'ed-07', label: 'Upcoming Deadlines', value: '4 in next 30 days', status: 'good', detail: 'Midterm grades, privacy ack, safety inspection, staff training' },
];

const educationRequirements: ComplianceRequirement[] = [
  { id: 'er-01', title: 'Privacy Policy Acknowledgements', description: 'All faculty and staff must acknowledge the updated student privacy and records policy annually.', category: 'Privacy', cadence: 'Annual', owner: 'Dr. Patricia Hanes', ownerInitials: 'PH', severity: 'critical', status: 'due-soon', dueDate: 'Feb 28, 2026', lastVerified: 'Jan 5, 2026', scope: 'Institution' },
  { id: 'er-02', title: 'Term-Start Checklist', description: 'Complete all required compliance checks before the first day of classes each term.', category: 'Academic', cadence: 'Per Term', owner: 'Dr. James Morton', ownerInitials: 'JM', severity: 'high', status: 'compliant', dueDate: 'Jan 13, 2026', lastVerified: 'Jan 12, 2026', scope: 'Institution' },
  { id: 'er-03', title: 'Reporting Deadlines', description: 'Grade submission and academic progress reporting per configured institutional cadence.', category: 'Academic', cadence: 'Per Term', owner: 'Dr. James Morton', ownerInitials: 'JM', severity: 'high', status: 'compliant', dueDate: 'Mar 10, 2026', scope: 'Department' },
  { id: 'er-04', title: 'Facilities Safety Compliance', description: 'Annual safety inspections for all campus buildings, labs, and dormitories.', category: 'Safety', cadence: 'Annual', owner: 'Robert Chen', ownerInitials: 'RC', severity: 'medium', status: 'compliant', dueDate: 'Jun 30, 2026', lastVerified: 'Dec 15, 2025', scope: 'Institution' },
  { id: 'er-05', title: 'Staff Training Compliance', description: 'All faculty and staff must complete required annual training modules including FERPA and Title IX.', category: 'Training', cadence: 'Annual', owner: 'Dr. Patricia Hanes', ownerInitials: 'PH', severity: 'high', status: 'due-soon', dueDate: 'Apr 15, 2026', scope: 'Institution' },
];

const educationChecklists: ComplianceChecklist[] = [
  { id: 'ec-01', title: 'Spring 2026 Term Start', description: 'All required compliance checks for the spring term including enrollment verification and course approvals.', requirementCount: 10, completedCount: 9, owner: 'Dr. James Morton', ownerInitials: 'JM', dueDate: 'Jan 13, 2026', status: 'in-progress', scope: 'Institution' },
  { id: 'ec-02', title: 'Annual Safety Inspection', description: 'Complete safety inspections for all campus buildings and facilities.', requirementCount: 6, completedCount: 6, owner: 'Robert Chen', ownerInitials: 'RC', dueDate: 'Dec 20, 2025', status: 'complete', scope: 'Institution' },
  { id: 'ec-03', title: 'Faculty Onboarding', description: 'Compliance onboarding for new faculty hires including policy acknowledgements and training.', requirementCount: 8, completedCount: 5, owner: 'Dr. Patricia Hanes', ownerInitials: 'PH', dueDate: 'Feb 28, 2026', status: 'in-progress', scope: 'Department' },
];

const educationEvidence: ComplianceEvidence[] = [
  { id: 'ee-01', title: 'Privacy Policy Ack Batch', requirementId: 'er-01', requirementTitle: 'Privacy Policy Acknowledgements', type: 'attestation', submittedBy: 'Dr. Patricia Hanes', submittedByInitials: 'PH', submittedDate: 'Jan 20, 2026', status: 'verified', verifiedBy: 'Registrar Office', verifiedDate: 'Jan 22, 2026' },
  { id: 'ee-02', title: 'Course Roster Verification', requirementId: 'er-02', requirementTitle: 'Term-Start Checklist', type: 'document', submittedBy: 'Dr. James Morton', submittedByInitials: 'JM', submittedDate: 'Jan 12, 2026', status: 'submitted' },
  { id: 'ee-03', title: 'Grade Submission Compliance', requirementId: 'er-03', requirementTitle: 'Reporting Deadlines', type: 'link', submittedBy: 'Dr. James Morton', submittedByInitials: 'JM', submittedDate: 'Jan 5, 2026', status: 'verified', verifiedBy: 'Provost Office', verifiedDate: 'Jan 8, 2026' },
  { id: 'ee-04', title: 'Safety Inspection Report', requirementId: 'er-04', requirementTitle: 'Facilities Safety Compliance', type: 'document', submittedBy: 'Robert Chen', submittedByInitials: 'RC', submittedDate: 'Dec 15, 2025', status: 'verified', verifiedBy: 'Facilities Director', verifiedDate: 'Dec 18, 2025' },
  { id: 'ee-05', title: 'Faculty Training Certificate', requirementId: 'er-05', requirementTitle: 'Staff Training Compliance', type: 'certificate', submittedBy: 'Dr. Sarah Lin', submittedByInitials: 'SL', submittedDate: 'Feb 8, 2026', status: 'pending' },
];

const educationIncidents: ComplianceIncident[] = [
  { id: 'ei-01', title: 'Student Data Access Inquiry', description: 'A parent requested access to student academic records without proper FERPA authorization. Case under review by registrar.', severity: 'high', status: 'investigating', reportedBy: 'Registrar Office', reportedByInitials: 'RO', reportedDate: 'Feb 11, 2026', assignedTo: 'Dr. Patricia Hanes', assignedToInitials: 'PH', scope: 'Institution' },
  { id: 'ei-02', title: 'Facilities Safety Concern — Chemistry Lab', description: 'Expired chemical storage containers identified during routine walkthrough. Lab access restricted pending disposal.', severity: 'medium', status: 'open', reportedBy: 'Robert Chen', reportedByInitials: 'RC', reportedDate: 'Feb 13, 2026', scope: 'Department' },
  { id: 'ei-03', title: 'Grade Submission Delay — 2 Faculty', description: 'Two faculty members missed the fall grade submission deadline by 3 business days. Grades have since been submitted.', severity: 'low', status: 'resolved', reportedBy: 'Dr. James Morton', reportedByInitials: 'JM', reportedDate: 'Jan 8, 2026', assignedTo: 'Dr. James Morton', assignedToInitials: 'JM', resolvedDate: 'Jan 12, 2026', scope: 'Department' },
];

const educationActions: ComplianceAction[] = [
  { id: 'ea-01', title: 'Investigate Data Access Request', description: 'Review the parent data access request against FERPA guidelines and respond within SLA.', incidentId: 'ei-01', incidentTitle: 'Student Data Access Inquiry', assignee: 'Dr. Patricia Hanes', assigneeInitials: 'PH', dueDate: 'Feb 18, 2026', status: 'in-progress', priority: 'high' },
  { id: 'ea-02', title: 'Schedule Lab Safety Re-inspection', description: 'Coordinate chemical disposal and schedule re-inspection of the chemistry lab.', incidentId: 'ei-02', incidentTitle: 'Facilities Safety Concern — Chemistry Lab', assignee: 'Robert Chen', assigneeInitials: 'RC', dueDate: 'Feb 22, 2026', status: 'pending', priority: 'medium' },
  { id: 'ea-03', title: 'Follow Up on Grade Submission', description: 'Send reminders to faculty with upcoming grade deadlines and confirm submission process.', incidentId: 'ei-03', incidentTitle: 'Grade Submission Delay — 2 Faculty', assignee: 'Dr. James Morton', assigneeInitials: 'JM', dueDate: 'Jan 15, 2026', status: 'completed', priority: 'low', verifiedBy: 'Provost Office', verifiedDate: 'Jan 16, 2026' },
];

const educationTraining: ComplianceTraining[] = [
  { id: 'et-01', title: 'FERPA Training', description: 'Annual Family Educational Rights and Privacy Act training for all faculty and staff.', assignee: 'All Faculty', assigneeInitials: 'AF', module: 'FERPA Compliance 2026', dueDate: 'Apr 15, 2026', status: 'in-progress', score: 78 },
  { id: 'et-02', title: 'Lab Safety Certification', description: 'Required safety certification for all science department faculty and lab assistants.', assignee: 'Science Dept', assigneeInitials: 'SD', module: 'Lab Safety Standards', dueDate: 'Mar 31, 2026', status: 'in-progress', score: 75 },
  { id: 'et-03', title: 'Title IX Training', description: 'Mandatory Title IX awareness and reporting training for all institutional staff.', assignee: 'All Staff', assigneeInitials: 'AS', module: 'Title IX Awareness 2026', dueDate: 'Mar 31, 2026', completedDate: 'Feb 1, 2026', status: 'completed', score: 92 },
  { id: 'et-04', title: 'Emergency Procedures', description: 'Campus emergency procedures and evacuation protocol training for all employees.', assignee: 'All Staff', assigneeInitials: 'AS', module: 'Emergency Procedures 2026', dueDate: 'Apr 15, 2026', status: 'in-progress', score: 90 },
];

const educationPolicies: CompliancePolicy[] = [
  { id: 'ep-01', title: 'Student Privacy & Records Policy', description: 'Comprehensive policy governing student data privacy, records access, and FERPA compliance.', version: 'v3.0', effectiveDate: 'Aug 1, 2025', reviewDate: 'Aug 1, 2026', owner: 'Dr. Patricia Hanes', ownerInitials: 'PH', status: 'active', acknowledgedCount: 45, totalCount: 52 },
  { id: 'ep-02', title: 'Academic Integrity Policy', description: 'Standards for academic honesty, plagiarism prevention, and integrity violation procedures.', version: 'v2.1', effectiveDate: 'Aug 1, 2025', reviewDate: 'Aug 1, 2026', owner: 'Dr. James Morton', ownerInitials: 'JM', status: 'active', acknowledgedCount: 52, totalCount: 52 },
  { id: 'ep-03', title: 'Facilities Use & Safety Policy', description: 'Guidelines for campus facility usage, safety standards, and inspection requirements.', version: 'v1.5', effectiveDate: 'Jan 1, 2026', reviewDate: 'Jan 1, 2027', owner: 'Robert Chen', ownerInitials: 'RC', status: 'under-review', acknowledgedCount: 30, totalCount: 52 },
];

const educationDeadlines: ComplianceDeadline[] = [
  { id: 'edl-01', title: 'Spring Midterm Grade Submission', description: 'All faculty must submit midterm grades through the registrar portal.', dueDate: 'Mar 10, 2026', owner: 'Dr. James Morton', ownerInitials: 'JM', status: 'upcoming', proofRequired: false, proofSubmitted: false, scope: 'Institution' },
  { id: 'edl-02', title: 'Privacy Policy Acknowledgement Deadline', description: 'All faculty and staff must acknowledge the updated Student Privacy & Records Policy.', dueDate: 'Feb 28, 2026', owner: 'Dr. Patricia Hanes', ownerInitials: 'PH', status: 'due-soon', proofRequired: true, proofSubmitted: false, scope: 'Institution' },
  { id: 'edl-03', title: 'Safety Inspection — Dorm B', description: 'Scheduled annual safety inspection for Dormitory B.', dueDate: 'Mar 15, 2026', owner: 'Robert Chen', ownerInitials: 'RC', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Institution' },
  { id: 'edl-04', title: 'Annual Staff Training Completion', description: 'Deadline for all faculty and staff to complete required annual training modules.', dueDate: 'Apr 15, 2026', owner: 'Dr. Patricia Hanes', ownerInitials: 'PH', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Institution' },
];

const educationReports: ComplianceReport[] = [
  { id: 'erp-01', title: 'Term Compliance Export', type: 'Term Summary', period: 'Spring 2026', generatedAt: 'Feb 14, 2026', format: 'PDF', size: '3.1 MB' },
  { id: 'erp-02', title: 'Department Compliance Export', type: 'Departmental', period: 'Spring 2026', generatedAt: 'Feb 10, 2026', format: 'XLSX', size: '780 KB' },
  { id: 'erp-03', title: 'Audit-Ready Evidence Packet', type: 'Audit', period: '2025-26 Academic Year', generatedAt: 'Feb 12, 2026', format: 'PDF', size: '5.2 MB' },
];

const educationAudit: ComplianceAuditEntry[] = [
  { id: 'eau-01', action: 'policy_updated', actor: 'Dr. Patricia Hanes', actorInitials: 'PH', target: 'Student Privacy & Records Policy', timestamp: 'Jan 5, 2026 9:00 AM', detail: 'Updated to v3.0 with FERPA addendum' },
  { id: 'eau-02', action: 'evidence_submitted', actor: 'Robert Chen', actorInitials: 'RC', target: 'Safety Inspection Report', timestamp: 'Dec 15, 2025 2:30 PM', detail: 'Annual campus safety inspection report submitted' },
  { id: 'eau-03', action: 'training_completed', actor: 'All Staff', actorInitials: 'AS', target: 'Title IX Training', timestamp: 'Feb 1, 2026 5:00 PM', detail: 'All staff completed Title IX awareness module' },
  { id: 'eau-04', action: 'incident_opened', actor: 'Robert Chen', actorInitials: 'RC', target: 'Facilities Safety Concern — Chemistry Lab', timestamp: 'Feb 13, 2026 10:15 AM', detail: 'Expired chemical storage containers reported' },
  { id: 'eau-05', action: 'checklist_completed', actor: 'Robert Chen', actorInitials: 'RC', target: 'Annual Safety Inspection', timestamp: 'Dec 20, 2025 4:00 PM', detail: 'All 6 inspection items completed and verified' },
  { id: 'eau-06', action: 'requirement_verified', actor: 'Provost Office', actorInitials: 'PO', target: 'Grade Submission Compliance', timestamp: 'Jan 8, 2026 11:00 AM', detail: 'Fall 2025 grade submission verified complete' },
  { id: 'eau-07', action: 'deadline_met', actor: 'Dr. James Morton', actorInitials: 'JM', target: 'Term-Start Checklist', timestamp: 'Jan 12, 2026 3:00 PM', detail: 'Spring 2026 term-start checklist completed on time' },
  { id: 'eau-08', action: 'action_verified', actor: 'Provost Office', actorInitials: 'PO', target: 'Follow Up on Grade Submission', timestamp: 'Jan 16, 2026 9:30 AM', detail: 'Faculty grade submission reminders confirmed effective' },
];

const educationSettings: ComplianceSettingToggle[] = [
  { id: 'est-01', label: 'Auto-flag Unacknowledged Policies After 14 Days', description: 'Automatically flag faculty and staff who have not acknowledged policies within 14 days of publication.', enabled: true },
  { id: 'est-02', label: 'Email Grade Submission Reminders', description: 'Send automated email reminders to faculty 7 days before grade submission deadlines.', enabled: true },
  { id: 'est-03', label: 'Require Evidence for Safety Inspections', description: 'Require photographic or documentary evidence for all safety inspection completions.', enabled: true },
  { id: 'est-04', label: 'Auto-generate Term Compliance Report', description: 'Automatically generate a compliance summary report at the end of each academic term.', enabled: false },
];

// =============================================================================
// CHURCH MODE — International Christian Center (ICCLA)
// =============================================================================

const churchDashboard: ComplianceDashboardBlock[] = [
  { id: 'cd-01', label: 'Youth/Child Safety', value: 'All clear', status: 'good', detail: 'All youth ministry workers have current background checks and training' },
  { id: 'cd-02', label: 'Volunteer Compliance', value: '18/20 cleared', status: 'warning', detail: '2 pending background checks — new volunteers from January orientation' },
  { id: 'cd-03', label: 'Facilities Safety', value: 'Last inspection current', status: 'good', detail: 'December 2025 inspection — all items passed' },
  { id: 'cd-04', label: 'Care Handling', value: 'Permissioned', status: 'good', detail: 'Sensitive-case access restricted to 5 authorized leaders' },
  { id: 'cd-05', label: 'Leader Training', value: '85% complete', status: 'warning', detail: '3 leaders pending youth protection training renewal' },
  { id: 'cd-06', label: 'Incidents Queue', value: '0 open', status: 'good', detail: 'All reported incidents resolved or closed' },
  { id: 'cd-07', label: 'Upcoming Deadlines', value: '2 in next 30 days', status: 'good', detail: 'Youth protection training renewals, annual background check batch' },
];

const churchRequirements: ComplianceRequirement[] = [
  { id: 'cr-01', title: 'Background Check Cadence', description: 'All youth and children\'s ministry workers must have a current background check on file, renewed annually.', category: 'Safety', cadence: 'Annual', owner: 'Sister Keisha Williams', ownerInitials: 'KW', severity: 'critical', status: 'compliant', dueDate: 'Mar 15, 2026', lastVerified: 'Jan 20, 2026', scope: 'Ministry' },
  { id: 'cr-02', title: 'Youth Protection Training', description: 'Annual child safety and youth protection training required for all youth ministry leaders and volunteers.', category: 'Training', cadence: 'Annual', owner: 'Sister Keisha Williams', ownerInitials: 'KW', severity: 'critical', status: 'due-soon', dueDate: 'Mar 1, 2026', lastVerified: 'Feb 1, 2026', scope: 'Ministry' },
  { id: 'cr-03', title: 'Facility Safety Inspection', description: 'Annual safety inspection of all campus buildings, classrooms, and gathering spaces.', category: 'Facilities', cadence: 'Annual', owner: 'Deacon Charles Obi', ownerInitials: 'CO', severity: 'high', status: 'compliant', dueDate: 'Jun 1, 2026', lastVerified: 'Dec 10, 2025', scope: 'Campus' },
  { id: 'cr-04', title: 'Incident Reporting SLA', description: 'All safety incidents must be reported within 24 hours and investigated within 72 hours.', category: 'Incidents', cadence: 'Per Incident', owner: 'Pastor Dipo Kalejaiye', ownerInitials: 'DK', severity: 'high', status: 'compliant', dueDate: 'Ongoing', lastVerified: 'Feb 5, 2026', scope: 'Organization' },
  { id: 'cr-05', title: 'Sensitive-Case Access Policy Ack', description: 'All authorized leaders must acknowledge the sensitive matters handling policy annually.', category: 'Privacy', cadence: 'Annual', owner: 'Pastor Dipo Kalejaiye', ownerInitials: 'DK', severity: 'medium', status: 'compliant', dueDate: 'Jun 30, 2026', lastVerified: 'Jan 8, 2026', scope: 'Organization' },
];

const churchChecklists: ComplianceChecklist[] = [
  { id: 'cc-01', title: 'Youth Ministry Safety', description: 'Complete safety and compliance checklist for all youth ministry activities and personnel.', requirementCount: 8, completedCount: 8, owner: 'Sister Keisha Williams', ownerInitials: 'KW', dueDate: 'Jan 31, 2026', status: 'complete', scope: 'Ministry' },
  { id: 'cc-02', title: 'Volunteer Onboarding', description: 'Compliance onboarding for new volunteers including background check, training, and policy acknowledgements.', requirementCount: 6, completedCount: 4, owner: 'Deacon Charles Obi', ownerInitials: 'CO', dueDate: 'Feb 28, 2026', status: 'in-progress', scope: 'Organization' },
  { id: 'cc-03', title: 'Annual Facilities Review', description: 'Annual safety and maintenance review of all campus facilities.', requirementCount: 5, completedCount: 5, owner: 'Deacon Charles Obi', ownerInitials: 'CO', dueDate: 'Dec 15, 2025', status: 'complete', scope: 'Campus' },
];

const churchEvidence: ComplianceEvidence[] = [
  { id: 'ce-01', title: 'Background Check Batch — Jan 2026', requirementId: 'cr-01', requirementTitle: 'Background Check Cadence', type: 'document', submittedBy: 'Sister Keisha Williams', submittedByInitials: 'KW', submittedDate: 'Jan 20, 2026', status: 'verified', verifiedBy: 'Church Administration', verifiedDate: 'Jan 23, 2026' },
  { id: 'ce-02', title: 'Youth Protection Training Cert — Sister Keisha', requirementId: 'cr-02', requirementTitle: 'Youth Protection Training', type: 'certificate', submittedBy: 'Sister Keisha Williams', submittedByInitials: 'KW', submittedDate: 'Feb 1, 2026', status: 'verified', verifiedBy: 'Church Administration', verifiedDate: 'Feb 3, 2026', expiresDate: 'Feb 1, 2027' },
  { id: 'ce-03', title: 'Facility Inspection Report — Dec 2025', requirementId: 'cr-03', requirementTitle: 'Facility Safety Inspection', type: 'document', submittedBy: 'Deacon Charles Obi', submittedByInitials: 'CO', submittedDate: 'Dec 10, 2025', status: 'verified', verifiedBy: 'Safety Committee', verifiedDate: 'Dec 14, 2025' },
  { id: 'ce-04', title: 'Volunteer Application — New Member', requirementId: 'cr-01', requirementTitle: 'Background Check Cadence', type: 'attestation', submittedBy: 'Deacon Charles Obi', submittedByInitials: 'CO', submittedDate: 'Feb 10, 2026', status: 'pending' },
  { id: 'ce-05', title: 'Incident Response Training Cert', requirementId: 'cr-04', requirementTitle: 'Incident Reporting SLA', type: 'certificate', submittedBy: 'Pastor Dipo Kalejaiye', submittedByInitials: 'DK', submittedDate: 'Jan 15, 2026', status: 'submitted' },
];

const churchIncidents: ComplianceIncident[] = [
  { id: 'ci-01', title: 'Minor Injury During Youth Event', description: 'A youth participant sustained a minor ankle sprain during a gym activity. First aid administered on site. Parent notified.', severity: 'low', status: 'resolved', reportedBy: 'Sister Keisha Williams', reportedByInitials: 'KW', reportedDate: 'Jan 25, 2026', assignedTo: 'Sister Keisha Williams', assignedToInitials: 'KW', resolvedDate: 'Jan 27, 2026', scope: 'Ministry' },
  { id: 'ci-02', title: 'Parking Lot Lighting Concern', description: 'Multiple members reported insufficient lighting in the west parking lot during evening services.', severity: 'medium', status: 'open', reportedBy: 'Deacon Charles Obi', reportedByInitials: 'CO', reportedDate: 'Feb 9, 2026', scope: 'Campus' },
  { id: 'ci-03', title: 'Volunteer Screening Delay', description: 'Background check processing delay for 2 new volunteers from January orientation. Vendor turnaround exceeded SLA.', severity: 'low', status: 'closed', reportedBy: 'Deacon Charles Obi', reportedByInitials: 'CO', reportedDate: 'Jan 30, 2026', assignedTo: 'Deacon Charles Obi', assignedToInitials: 'CO', resolvedDate: 'Feb 8, 2026', scope: 'Organization' },
];

const churchActions: ComplianceAction[] = [
  { id: 'ca-01', title: 'Follow Up on 2 Pending Background Checks', description: 'Contact screening vendor to expedite processing for the 2 new volunteer background checks.', incidentId: 'ci-03', incidentTitle: 'Volunteer Screening Delay', assignee: 'Deacon Charles Obi', assigneeInitials: 'CO', dueDate: 'Feb 18, 2026', status: 'in-progress', priority: 'high' },
  { id: 'ca-02', title: 'Submit Parking Lot Lighting Repair Request', description: 'File maintenance request for additional lighting in the west parking lot area.', incidentId: 'ci-02', incidentTitle: 'Parking Lot Lighting Concern', assignee: 'Deacon Charles Obi', assigneeInitials: 'CO', dueDate: 'Feb 22, 2026', status: 'pending', priority: 'medium' },
  { id: 'ca-03', title: 'Complete Volunteer Screening Process', description: 'Finalize onboarding for volunteers whose background checks have been cleared.', incidentId: 'ci-03', incidentTitle: 'Volunteer Screening Delay', assignee: 'Deacon Charles Obi', assigneeInitials: 'CO', dueDate: 'Feb 15, 2026', status: 'completed', priority: 'medium', verifiedBy: 'Pastor Dipo Kalejaiye', verifiedDate: 'Feb 16, 2026' },
];

const churchTraining: ComplianceTraining[] = [
  { id: 'ct-01', title: 'Child Safety Training', description: 'Comprehensive child safety training covering recognition, prevention, and response protocols.', assignee: 'All Youth Workers', assigneeInitials: 'YW', module: 'Child Safety Fundamentals', dueDate: 'Mar 1, 2026', status: 'in-progress', score: 80 },
  { id: 'ct-02', title: 'First Aid Certification', description: 'First aid and CPR certification for all ministry leaders responsible for group activities.', assignee: 'Ministry Leaders', assigneeInitials: 'ML', module: 'First Aid & CPR', dueDate: 'Mar 31, 2026', status: 'in-progress', score: 75 },
  { id: 'ct-03', title: 'Mandatory Reporter Training', description: 'Legal obligations and procedures for mandatory reporting of suspected abuse or neglect.', assignee: 'All Staff', assigneeInitials: 'AS', module: 'Mandatory Reporter 2026', dueDate: 'Feb 28, 2026', completedDate: 'Feb 5, 2026', status: 'completed', score: 100 },
  { id: 'ct-04', title: 'De-escalation Training', description: 'Conflict de-escalation techniques for ushers and front-facing ministry volunteers.', assignee: 'Ushers Team', assigneeInitials: 'UT', module: 'De-escalation Techniques', dueDate: 'Mar 31, 2026', status: 'in-progress', score: 67 },
];

const churchPolicies: CompliancePolicy[] = [
  { id: 'cp-01', title: 'Child & Youth Protection Policy', description: 'Comprehensive policy for the protection of children and youth in all church programs and activities.', version: 'v2.0', effectiveDate: 'Jul 1, 2025', reviewDate: 'Jul 1, 2026', owner: 'Pastor Dipo Kalejaiye', ownerInitials: 'DK', status: 'active', acknowledgedCount: 20, totalCount: 20 },
  { id: 'cp-02', title: 'Volunteer Screening Policy', description: 'Requirements and procedures for screening all volunteers who work with minors or vulnerable populations.', version: 'v1.2', effectiveDate: 'Sep 1, 2025', reviewDate: 'Sep 1, 2026', owner: 'Deacon Charles Obi', ownerInitials: 'CO', status: 'active', acknowledgedCount: 18, totalCount: 20 },
  { id: 'cp-03', title: 'Sensitive Matters Handling Policy', description: 'Procedures for handling sensitive pastoral care matters with appropriate confidentiality and authorization.', version: 'v1.0', effectiveDate: 'Jan 1, 2026', reviewDate: 'Jan 1, 2027', owner: 'Pastor Dipo Kalejaiye', ownerInitials: 'DK', status: 'active', acknowledgedCount: 5, totalCount: 5 },
];

const churchDeadlines: ComplianceDeadline[] = [
  { id: 'cdl-01', title: 'Youth Protection Training Renewals', description: 'All youth ministry workers must complete annual protection training renewal.', dueDate: 'Mar 1, 2026', owner: 'Sister Keisha Williams', ownerInitials: 'KW', status: 'due-soon', proofRequired: true, proofSubmitted: false, scope: 'Ministry' },
  { id: 'cdl-02', title: 'Annual Background Check Batch', description: 'Submit annual background check renewal batch for all active youth and children\'s ministry workers.', dueDate: 'Mar 15, 2026', owner: 'Deacon Charles Obi', ownerInitials: 'CO', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Organization' },
  { id: 'cdl-03', title: 'Facility Safety Inspection', description: 'Scheduled annual safety inspection for all campus buildings.', dueDate: 'Jun 1, 2026', owner: 'Deacon Charles Obi', ownerInitials: 'CO', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Campus' },
];

const churchReports: ComplianceReport[] = [
  { id: 'crp-01', title: 'Volunteer Compliance Export', type: 'Personnel', period: 'Jan 2026', generatedAt: 'Feb 14, 2026', format: 'PDF', size: '1.8 MB' },
  { id: 'crp-02', title: 'Child Safety Compliance Packet', type: 'Safety', period: '2025-26', generatedAt: 'Feb 10, 2026', format: 'PDF', size: '2.9 MB' },
  { id: 'crp-03', title: 'Incident Summary Export', type: 'Incidents', period: 'Jan–Feb 2026', generatedAt: 'Feb 12, 2026', format: 'CSV', size: '120 KB' },
];

const churchAudit: ComplianceAuditEntry[] = [
  { id: 'cau-01', action: 'requirement_verified', actor: 'Church Administration', actorInitials: 'CA', target: 'Background Check Cadence', timestamp: 'Jan 23, 2026 10:00 AM', detail: 'Background check batch verified for all 18 cleared workers' },
  { id: 'cau-02', action: 'evidence_submitted', actor: 'Sister Keisha Williams', actorInitials: 'KW', target: 'Youth Protection Training Cert', timestamp: 'Feb 1, 2026 1:30 PM', detail: 'Training certificate submitted for renewal' },
  { id: 'cau-03', action: 'incident_opened', actor: 'Deacon Charles Obi', actorInitials: 'CO', target: 'Parking Lot Lighting Concern', timestamp: 'Feb 9, 2026 8:45 PM', detail: 'Reported after Sunday evening service' },
  { id: 'cau-04', action: 'checklist_completed', actor: 'Sister Keisha Williams', actorInitials: 'KW', target: 'Youth Ministry Safety', timestamp: 'Jan 31, 2026 3:00 PM', detail: 'All 8 items verified and marked complete' },
  { id: 'cau-05', action: 'policy_updated', actor: 'Pastor Dipo Kalejaiye', actorInitials: 'DK', target: 'Sensitive Matters Handling Policy', timestamp: 'Jan 2, 2026 11:00 AM', detail: 'New policy v1.0 published and distributed to authorized leaders' },
  { id: 'cau-06', action: 'training_completed', actor: 'All Staff', actorInitials: 'AS', target: 'Mandatory Reporter Training', timestamp: 'Feb 5, 2026 4:00 PM', detail: 'All staff completed mandatory reporter module' },
  { id: 'cau-07', action: 'deadline_met', actor: 'Sister Keisha Williams', actorInitials: 'KW', target: 'Youth Ministry Safety Checklist', timestamp: 'Jan 31, 2026 3:00 PM', detail: 'Completed ahead of deadline' },
  { id: 'cau-08', action: 'action_verified', actor: 'Pastor Dipo Kalejaiye', actorInitials: 'DK', target: 'Complete Volunteer Screening Process', timestamp: 'Feb 16, 2026 9:00 AM', detail: 'Volunteer onboarding finalized for cleared applicants' },
];

const churchSettings: ComplianceSettingToggle[] = [
  { id: 'cst-01', label: 'Auto-flag Expired Background Checks', description: 'Automatically flag volunteers whose background checks have expired or are within 30 days of expiry.', enabled: true },
  { id: 'cst-02', label: 'Email Training Reminders 30 Days Before Due', description: 'Send email reminders to assigned individuals 30 days before training due dates.', enabled: true },
  { id: 'cst-03', label: 'Require Dual Approval for Sensitive-Case Access', description: 'Require two authorized leaders to approve access to sensitive pastoral care records.', enabled: true },
  { id: 'cst-04', label: 'Auto-archive Closed Incidents After 120 Days', description: 'Automatically move closed incidents to the archive after 120 days.', enabled: false },
];

// =============================================================================
// ENTERPRISE MODE — KaNeXT
// =============================================================================

const enterpriseDashboard: ComplianceDashboardBlock[] = [
  { id: 'bd-01', label: 'Policy Acknowledgements', value: '92% complete', status: 'good', detail: '11 of 12 employees have acknowledged all current policies' },
  { id: 'bd-02', label: 'Security/Access Review', value: 'Due in 45 days', status: 'good', detail: 'Next quarterly access review scheduled for Mar 31' },
  { id: 'bd-03', label: 'Vendor Compliance', value: '3/4 current', status: 'warning', detail: 'Studio Nine insurance certificate expiring Feb 28' },
  { id: 'bd-04', label: 'Training Completion', value: '88% complete', status: 'good', detail: 'Security awareness training — 1 engineer and 1 contractor pending' },
  { id: 'bd-05', label: 'Incidents Queue', value: '2 open', status: 'warning', detail: 'Staging env access attempt and vendor SLA breach under review' },
  { id: 'bd-06', label: 'Upcoming Deadlines', value: '3 in next 30 days', status: 'good', detail: 'Vendor cert renewal, SOC 2 milestone, policy acknowledgement' },
  { id: 'bd-07', label: 'Audit Readiness', value: '2 exports pending', status: 'warning', detail: 'Quarterly posture report and vendor compliance export not yet generated' },
];

const enterpriseRequirements: ComplianceRequirement[] = [
  { id: 'br-01', title: 'Annual Policy Acknowledgements', description: 'All employees and contractors must acknowledge updated company policies annually.', category: 'Policy', cadence: 'Annual', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', severity: 'critical', status: 'due-soon', dueDate: 'Mar 31, 2026', lastVerified: 'Jan 2, 2026', scope: 'Organization' },
  { id: 'br-02', title: 'Quarterly Access Reviews', description: 'Review and verify all system access permissions quarterly to ensure principle of least privilege.', category: 'Security', cadence: 'Quarterly', owner: 'Jordan Kim', ownerInitials: 'JK', severity: 'high', status: 'compliant', dueDate: 'Mar 31, 2026', lastVerified: 'Dec 31, 2025', scope: 'Organization' },
  { id: 'br-03', title: 'Vendor Compliance Docs', description: 'Maintain current insurance certificates, compliance attestations, and contract documentation for all active vendors.', category: 'Vendor', cadence: 'Per Vendor', owner: 'Nkechi Adamu', ownerInitials: 'NA', severity: 'high', status: 'due-soon', dueDate: 'Feb 28, 2026', lastVerified: 'Jan 15, 2026', scope: 'Entity' },
  { id: 'br-04', title: 'Annual Training Completion', description: 'All employees must complete required annual training modules including security awareness and anti-harassment.', category: 'Training', cadence: 'Annual', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', severity: 'high', status: 'compliant', dueDate: 'Apr 30, 2026', lastVerified: 'Feb 1, 2026', scope: 'Organization' },
  { id: 'br-05', title: 'Incident Response Playbook Adherence', description: 'All security and operational incidents must be handled per the documented incident response playbook.', category: 'Security', cadence: 'Per Incident', owner: 'Jordan Kim', ownerInitials: 'JK', severity: 'medium', status: 'compliant', dueDate: 'Ongoing', lastVerified: 'Feb 10, 2026', scope: 'Organization' },
];

const enterpriseChecklists: ComplianceChecklist[] = [
  { id: 'bc-01', title: 'Q1 2026 Compliance Review', description: 'Quarterly compliance review covering policy updates, access reviews, and training status.', requirementCount: 8, completedCount: 6, owner: 'Sammy Kalejaiye', ownerInitials: 'SK', dueDate: 'Mar 31, 2026', status: 'in-progress', scope: 'Organization' },
  { id: 'bc-02', title: 'Vendor Onboarding', description: 'Compliance checklist for onboarding new vendors including documentation and background verification.', requirementCount: 5, completedCount: 5, owner: 'Nkechi Adamu', ownerInitials: 'NA', dueDate: 'Jan 31, 2026', status: 'complete', scope: 'Entity' },
  { id: 'bc-03', title: 'SOC 2 Prep', description: 'Preparation checklist for SOC 2 Type II audit readiness milestone.', requirementCount: 12, completedCount: 8, owner: 'Jordan Kim', ownerInitials: 'JK', dueDate: 'Mar 15, 2026', status: 'in-progress', scope: 'Organization' },
];

const enterpriseEvidence: ComplianceEvidence[] = [
  { id: 'be-01', title: 'Policy Acknowledgement Batch', requirementId: 'br-01', requirementTitle: 'Annual Policy Acknowledgements', type: 'attestation', submittedBy: 'Sammy Kalejaiye', submittedByInitials: 'SK', submittedDate: 'Jan 15, 2026', status: 'verified', verifiedBy: 'HR', verifiedDate: 'Jan 18, 2026' },
  { id: 'be-02', title: 'Access Review Log — Q4 2025', requirementId: 'br-02', requirementTitle: 'Quarterly Access Reviews', type: 'document', submittedBy: 'Jordan Kim', submittedByInitials: 'JK', submittedDate: 'Dec 31, 2025', status: 'verified', verifiedBy: 'Sammy Kalejaiye', verifiedDate: 'Jan 3, 2026' },
  { id: 'be-03', title: 'Vendor Insurance Cert — Studio Nine', requirementId: 'br-03', requirementTitle: 'Vendor Compliance Docs', type: 'certificate', submittedBy: 'Nkechi Adamu', submittedByInitials: 'NA', submittedDate: 'Jan 15, 2026', status: 'submitted', expiresDate: 'Feb 28, 2026' },
  { id: 'be-04', title: 'Training Completion Report', requirementId: 'br-04', requirementTitle: 'Annual Training Completion', type: 'document', submittedBy: 'Sammy Kalejaiye', submittedByInitials: 'SK', submittedDate: 'Feb 1, 2026', status: 'verified', verifiedBy: 'HR', verifiedDate: 'Feb 3, 2026' },
  { id: 'be-05', title: 'Incident Response Drill Log', requirementId: 'br-05', requirementTitle: 'Incident Response Playbook Adherence', type: 'link', submittedBy: 'Jordan Kim', submittedByInitials: 'JK', submittedDate: 'Feb 10, 2026', status: 'pending' },
];

const enterpriseIncidents: ComplianceIncident[] = [
  { id: 'bi-01', title: 'Unauthorized Access Attempt — Staging Env', description: 'Anomalous login attempt detected on staging environment from unrecognized IP. Credentials locked and investigation underway.', severity: 'high', status: 'investigating', reportedBy: 'Jordan Kim', reportedByInitials: 'JK', reportedDate: 'Feb 12, 2026', assignedTo: 'Jordan Kim', assignedToInitials: 'JK', scope: 'Organization' },
  { id: 'bi-02', title: 'Vendor SLA Breach — Response Time', description: 'Apex Dev Studio missed the 24-hour response time SLA on a critical bug report by 18 hours.', severity: 'medium', status: 'open', reportedBy: 'Nkechi Adamu', reportedByInitials: 'NA', reportedDate: 'Feb 10, 2026', scope: 'Entity' },
  { id: 'bi-03', title: 'Employee Policy Violation — Remote Work', description: 'An employee accessed production systems from an unsecured public network in violation of remote work policy.', severity: 'low', status: 'resolved', reportedBy: 'Jordan Kim', reportedByInitials: 'JK', reportedDate: 'Feb 3, 2026', assignedTo: 'Sammy Kalejaiye', assignedToInitials: 'SK', resolvedDate: 'Feb 6, 2026', scope: 'Organization' },
];

const enterpriseActions: ComplianceAction[] = [
  { id: 'ba-01', title: 'Investigate Staging Access Attempt', description: 'Perform full investigation of the unauthorized staging environment access attempt, review logs, and update access controls.', incidentId: 'bi-01', incidentTitle: 'Unauthorized Access Attempt — Staging Env', assignee: 'Jordan Kim', assigneeInitials: 'JK', dueDate: 'Feb 18, 2026', status: 'in-progress', priority: 'critical' },
  { id: 'ba-02', title: 'Follow Up with Vendor on SLA', description: 'Schedule a call with Apex Dev Studio to discuss the SLA breach and establish corrective measures.', incidentId: 'bi-02', incidentTitle: 'Vendor SLA Breach — Response Time', assignee: 'Nkechi Adamu', assigneeInitials: 'NA', dueDate: 'Feb 20, 2026', status: 'pending', priority: 'high' },
  { id: 'ba-03', title: 'Update Remote Work Policy Acknowledgement', description: 'Re-issue remote work policy for employee acknowledgement and add VPN requirement enforcement.', incidentId: 'bi-03', incidentTitle: 'Employee Policy Violation — Remote Work', assignee: 'Sammy Kalejaiye', assigneeInitials: 'SK', dueDate: 'Feb 10, 2026', status: 'completed', priority: 'medium', verifiedBy: 'Jordan Kim', verifiedDate: 'Feb 11, 2026' },
];

const enterpriseTraining: ComplianceTraining[] = [
  { id: 'bt-01', title: 'Security Awareness Training', description: 'Annual security awareness training covering phishing, social engineering, and data protection.', assignee: 'All Employees', assigneeInitials: 'AE', module: 'Security Awareness 2026', dueDate: 'Apr 30, 2026', status: 'in-progress', score: 88 },
  { id: 'bt-02', title: 'Anti-Harassment Training', description: 'Mandatory anti-harassment training for all employees and contractors.', assignee: 'All Employees', assigneeInitials: 'AE', module: 'Anti-Harassment 2026', dueDate: 'Mar 31, 2026', completedDate: 'Jan 28, 2026', status: 'completed', score: 100 },
  { id: 'bt-03', title: 'Data Handling Certification', description: 'Certification on proper data handling, classification, and encryption practices.', assignee: 'Engineering', assigneeInitials: 'EN', module: 'Data Handling Standards', dueDate: 'Apr 30, 2026', status: 'in-progress', score: 80 },
  { id: 'bt-04', title: 'Incident Response Drill', description: 'Tabletop exercise simulating a security incident response scenario.', assignee: 'Security Team', assigneeInitials: 'ST', module: 'IR Drill Q1 2026', dueDate: 'Mar 15, 2026', status: 'in-progress', score: 75 },
];

const enterprisePolicies: CompliancePolicy[] = [
  { id: 'bp-01', title: 'Information Security Policy', description: 'Comprehensive information security policy covering access control, data protection, and incident response.', version: 'v3.1', effectiveDate: 'Jan 1, 2026', reviewDate: 'Jan 1, 2027', owner: 'Jordan Kim', ownerInitials: 'JK', status: 'active', acknowledgedCount: 11, totalCount: 12 },
  { id: 'bp-02', title: 'Employee Code of Conduct', description: 'Standards of professional conduct, ethics, and behavior for all KaNeXT employees and contractors.', version: 'v2.0', effectiveDate: 'Jan 1, 2026', reviewDate: 'Jan 1, 2027', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', status: 'active', acknowledgedCount: 12, totalCount: 12 },
  { id: 'bp-03', title: 'Vendor Management Policy', description: 'Guidelines for vendor selection, onboarding, compliance monitoring, and offboarding.', version: 'v1.1', effectiveDate: 'Nov 1, 2025', reviewDate: 'Nov 1, 2026', owner: 'Nkechi Adamu', ownerInitials: 'NA', status: 'under-review', acknowledgedCount: 8, totalCount: 12 },
];

const enterpriseDeadlines: ComplianceDeadline[] = [
  { id: 'bdl-01', title: 'Q1 Policy Acknowledgement Deadline', description: 'All employees must acknowledge updated policies for Q1 2026.', dueDate: 'Mar 31, 2026', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Organization' },
  { id: 'bdl-02', title: 'Vendor Cert Renewal — Studio Nine', description: 'Insurance certificate for Studio Nine expires. Renewal required before expiry.', dueDate: 'Feb 28, 2026', owner: 'Nkechi Adamu', ownerInitials: 'NA', status: 'due-soon', proofRequired: true, proofSubmitted: false, scope: 'Entity' },
  { id: 'bdl-03', title: 'SOC 2 Readiness Milestone', description: 'Complete all SOC 2 preparation items and generate audit-ready evidence packet.', dueDate: 'Mar 15, 2026', owner: 'Jordan Kim', ownerInitials: 'JK', status: 'due-soon', proofRequired: true, proofSubmitted: false, scope: 'Organization' },
  { id: 'bdl-04', title: 'Annual Security Training Completion', description: 'All employees and contractors must complete security awareness training.', dueDate: 'Apr 30, 2026', owner: 'Sammy Kalejaiye', ownerInitials: 'SK', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Organization' },
];

const enterpriseReports: ComplianceReport[] = [
  { id: 'brp-01', title: 'Quarterly Compliance Posture Export', type: 'Quarterly', period: 'Q1 2026', generatedAt: 'Feb 14, 2026', format: 'PDF', size: '2.8 MB' },
  { id: 'brp-02', title: 'Vendor Compliance Export', type: 'Vendor', period: 'Jan 2026', generatedAt: 'Feb 10, 2026', format: 'XLSX', size: '450 KB' },
  { id: 'brp-03', title: 'Audit Packet Export', type: 'Audit', period: '2025-26', generatedAt: 'Feb 12, 2026', format: 'PDF', size: '4.6 MB' },
];

const enterpriseAudit: ComplianceAuditEntry[] = [
  { id: 'bau-01', action: 'policy_updated', actor: 'Jordan Kim', actorInitials: 'JK', target: 'Information Security Policy', timestamp: 'Jan 2, 2026 9:00 AM', detail: 'Updated to v3.1 with SOC 2 requirements' },
  { id: 'bau-02', action: 'evidence_submitted', actor: 'Jordan Kim', actorInitials: 'JK', target: 'Access Review Log — Q4 2025', timestamp: 'Dec 31, 2025 5:00 PM', detail: 'Quarterly access review completed and logged' },
  { id: 'bau-03', action: 'incident_opened', actor: 'Jordan Kim', actorInitials: 'JK', target: 'Unauthorized Access Attempt — Staging Env', timestamp: 'Feb 12, 2026 2:15 PM', detail: 'Anomalous login detected and credentials locked' },
  { id: 'bau-04', action: 'training_completed', actor: 'All Employees', actorInitials: 'AE', target: 'Anti-Harassment Training', timestamp: 'Jan 28, 2026 4:00 PM', detail: 'All employees completed module with 100% pass rate' },
  { id: 'bau-05', action: 'checklist_completed', actor: 'Nkechi Adamu', actorInitials: 'NA', target: 'Vendor Onboarding', timestamp: 'Jan 31, 2026 11:00 AM', detail: 'All 5 items completed for new vendor onboarding' },
  { id: 'bau-06', action: 'requirement_verified', actor: 'Sammy Kalejaiye', actorInitials: 'SK', target: 'Annual Training Completion', timestamp: 'Feb 3, 2026 10:00 AM', detail: 'Training completion report verified by HR' },
  { id: 'bau-07', action: 'deadline_met', actor: 'Nkechi Adamu', actorInitials: 'NA', target: 'Vendor Onboarding Checklist', timestamp: 'Jan 31, 2026 11:00 AM', detail: 'All vendor documentation collected before deadline' },
  { id: 'bau-08', action: 'action_verified', actor: 'Jordan Kim', actorInitials: 'JK', target: 'Update Remote Work Policy Acknowledgement', timestamp: 'Feb 11, 2026 3:00 PM', detail: 'Policy re-issued and VPN enforcement confirmed' },
];

const enterpriseSettings: ComplianceSettingToggle[] = [
  { id: 'bst-01', label: 'Auto-flag Unacknowledged Policies', description: 'Automatically flag employees who have not acknowledged policies within 14 days of publication.', enabled: true },
  { id: 'bst-02', label: 'Email Vendor Cert Expiry Warnings 60 Days Out', description: 'Send automated email alerts when vendor certificates are within 60 days of expiration.', enabled: true },
  { id: 'bst-03', label: 'Require Evidence for All Access Reviews', description: 'Require documented evidence to be attached for every quarterly access review completion.', enabled: true },
  { id: 'bst-04', label: 'Auto-generate Quarterly Compliance Report', description: 'Automatically generate and distribute a compliance posture report at the end of each quarter.', enabled: false },
];

// =============================================================================
// COMMUNITY MODE — K-1 Speed League
// =============================================================================

const communityDashboard: ComplianceDashboardBlock[] = [
  { id: 'kd-01', label: 'Replay Upload Mandate', value: '92% on-time', status: 'good', detail: '11 of 12 replays uploaded within 48h window' },
  { id: 'kd-02', label: 'Missing Uploads Queue', value: '3 pending', status: 'warning', detail: 'Team Eastside (Game 12), Team Apex (Game 11), Team Nova (Game 10)' },
  { id: 'kd-03', label: 'Quality Issues Queue', value: '1 flagged', status: 'warning', detail: 'Game 9 replay — low resolution, re-upload requested' },
  { id: 'kd-04', label: 'Credentialing/Staff Compliance', value: 'All current', status: 'good', detail: 'All officials and event staff credentials verified' },
  { id: 'kd-05', label: 'Venue Safety', value: '2/2 inspected', status: 'good', detail: 'Homestead Karting and COTA Center inspections current' },
  { id: 'kd-06', label: 'Incidents Queue', value: '1 open', status: 'warning', detail: 'Late replay upload — Team Eastside' },
  { id: 'kd-07', label: 'Upcoming Deadlines', value: '2 in next 30 days', status: 'good', detail: 'Round 3 replay window and venue inspection' },
];

const communityRequirements: ComplianceRequirement[] = [
  { id: 'kr-01', title: 'Replay Upload Within 48h', description: 'All teams must upload race replay files within 48 hours of race completion.', category: 'Content', cadence: 'Per Game', owner: 'Marcus Hall', ownerInitials: 'MH', severity: 'critical', status: 'compliant', dueDate: 'Ongoing', lastVerified: 'Feb 14, 2026', scope: 'Series' },
  { id: 'kr-02', title: 'Minimum Quality Requirements', description: 'All uploaded replays must meet minimum resolution and file format standards.', category: 'Content', cadence: 'Per Upload', owner: 'Marcus Hall', ownerInitials: 'MH', severity: 'high', status: 'compliant', dueDate: 'Ongoing', lastVerified: 'Feb 12, 2026', scope: 'Series' },
  { id: 'kr-03', title: 'Venue Readiness Checklist', description: 'Complete venue safety and readiness checklist before each race event weekend.', category: 'Safety', cadence: 'Per Event', owner: 'Derek Santos', ownerInitials: 'DS', severity: 'high', status: 'compliant', dueDate: 'Feb 20, 2026', lastVerified: 'Feb 8, 2026', scope: 'Event Weekend' },
  { id: 'kr-04', title: 'Officials Assignment Acceptance', description: 'All assigned race officials must confirm availability and credentials before each event.', category: 'Personnel', cadence: 'Per Event', owner: 'Lisa Park', ownerInitials: 'LP', severity: 'medium', status: 'compliant', dueDate: 'Feb 18, 2026', lastVerified: 'Feb 10, 2026', scope: 'Event Weekend' },
  { id: 'kr-05', title: 'Incident Reporting SLA', description: 'All on-track and venue incidents must be reported within 24 hours and documented within 72 hours.', category: 'Incidents', cadence: 'Per Incident', owner: 'Marcus Hall', ownerInitials: 'MH', severity: 'high', status: 'compliant', dueDate: 'Ongoing', lastVerified: 'Feb 5, 2026', scope: 'Series' },
];

const communityChecklists: ComplianceChecklist[] = [
  { id: 'kc-01', title: 'Round 3 Event Readiness', description: 'Pre-event compliance checklist for Round 3 including venue, officials, and safety preparations.', requirementCount: 8, completedCount: 5, owner: 'Derek Santos', ownerInitials: 'DS', dueDate: 'Feb 20, 2026', status: 'in-progress', scope: 'Event Weekend' },
  { id: 'kc-02', title: 'Officials Credentialing', description: 'Verify credentials and certifications for all assigned race officials.', requirementCount: 6, completedCount: 6, owner: 'Lisa Park', ownerInitials: 'LP', dueDate: 'Feb 15, 2026', status: 'complete', scope: 'Series' },
  { id: 'kc-03', title: 'Season Safety Review', description: 'Mid-season safety review covering all venues, equipment, and incident reports.', requirementCount: 5, completedCount: 4, owner: 'Derek Santos', ownerInitials: 'DS', dueDate: 'Mar 31, 2026', status: 'in-progress', scope: 'Series' },
];

const communityEvidence: ComplianceEvidence[] = [
  { id: 'ke-01', title: 'Replay Upload — Game 12', requirementId: 'kr-01', requirementTitle: 'Replay Upload Within 48h', type: 'link', submittedBy: 'Team Thunder', submittedByInitials: 'TT', submittedDate: 'Feb 10, 2026', status: 'verified', verifiedBy: 'Marcus Hall', verifiedDate: 'Feb 11, 2026' },
  { id: 'ke-02', title: 'Venue Inspection — COTA Center', requirementId: 'kr-03', requirementTitle: 'Venue Readiness Checklist', type: 'document', submittedBy: 'Derek Santos', submittedByInitials: 'DS', submittedDate: 'Feb 8, 2026', status: 'verified', verifiedBy: 'Venue Management', verifiedDate: 'Feb 9, 2026' },
  { id: 'ke-03', title: 'Officials Credential Batch', requirementId: 'kr-04', requirementTitle: 'Officials Assignment Acceptance', type: 'certificate', submittedBy: 'Lisa Park', submittedByInitials: 'LP', submittedDate: 'Feb 5, 2026', status: 'verified', verifiedBy: 'Marcus Hall', verifiedDate: 'Feb 6, 2026' },
  { id: 'ke-04', title: 'Safety Drill Report — Round 2', requirementId: 'kr-05', requirementTitle: 'Incident Reporting SLA', type: 'document', submittedBy: 'Derek Santos', submittedByInitials: 'DS', submittedDate: 'Feb 3, 2026', status: 'submitted' },
  { id: 'ke-05', title: 'Insurance Cert — Venue', requirementId: 'kr-03', requirementTitle: 'Venue Readiness Checklist', type: 'certificate', submittedBy: 'Derek Santos', submittedByInitials: 'DS', submittedDate: 'Feb 1, 2026', status: 'pending', expiresDate: 'Jun 30, 2026' },
];

const communityIncidents: ComplianceIncident[] = [
  { id: 'ki-01', title: 'Late Replay Upload — Team Eastside', description: 'Team Eastside failed to upload Game 12 replay within the 48-hour window. Currently 72 hours past deadline.', severity: 'medium', status: 'open', reportedBy: 'Marcus Hall', reportedByInitials: 'MH', reportedDate: 'Feb 13, 2026', assignedTo: 'Marcus Hall', assignedToInitials: 'MH', scope: 'Series' },
  { id: 'ki-02', title: 'Officials No-Show — Round 2 Game 5', description: 'Assigned corner official did not arrive for Round 2, Game 5. Backup official stepped in from standby pool.', severity: 'high', status: 'resolved', reportedBy: 'Lisa Park', reportedByInitials: 'LP', reportedDate: 'Feb 1, 2026', assignedTo: 'Lisa Park', assignedToInitials: 'LP', resolvedDate: 'Feb 4, 2026', scope: 'Event Weekend' },
  { id: 'ki-03', title: 'Venue Safety Concern — Exit Signage', description: 'Two emergency exit signs at Homestead Karting were not illuminated during Round 2 evening session.', severity: 'low', status: 'closed', reportedBy: 'Derek Santos', reportedByInitials: 'DS', reportedDate: 'Feb 2, 2026', assignedTo: 'Derek Santos', assignedToInitials: 'DS', resolvedDate: 'Feb 5, 2026', scope: 'Event Weekend' },
];

const communityActions: ComplianceAction[] = [
  { id: 'ka-01', title: 'Follow Up with Team Eastside on Upload', description: 'Contact Team Eastside to resolve the late replay upload and confirm submission timeline.', incidentId: 'ki-01', incidentTitle: 'Late Replay Upload — Team Eastside', assignee: 'Marcus Hall', assigneeInitials: 'MH', dueDate: 'Feb 16, 2026', status: 'in-progress', priority: 'high' },
  { id: 'ka-02', title: 'Update Officials Backup Protocol', description: 'Revise the officials assignment protocol to include a confirmed backup for every event slot.', incidentId: 'ki-02', incidentTitle: 'Officials No-Show — Round 2 Game 5', assignee: 'Lisa Park', assigneeInitials: 'LP', dueDate: 'Feb 15, 2026', status: 'completed', priority: 'medium', verifiedBy: 'Marcus Hall', verifiedDate: 'Feb 16, 2026' },
  { id: 'ka-03', title: 'Submit Exit Signage Repair Request', description: 'File a maintenance request with Homestead Karting for emergency exit sign repair.', incidentId: 'ki-03', incidentTitle: 'Venue Safety Concern — Exit Signage', assignee: 'Derek Santos', assigneeInitials: 'DS', dueDate: 'Feb 20, 2026', status: 'pending', priority: 'low' },
];

const communityTraining: ComplianceTraining[] = [
  { id: 'kt-01', title: 'Replay Upload Standards', description: 'Training on replay upload requirements, file formats, and quality standards.', assignee: 'All Teams', assigneeInitials: 'AT', module: 'Replay Standards 2026', dueDate: 'Feb 28, 2026', status: 'in-progress', score: 83 },
  { id: 'kt-02', title: 'Officials Certification', description: 'Annual certification for all race officials covering rules, safety, and scoring.', assignee: 'All Officials', assigneeInitials: 'AO', module: 'Officials Cert 2026', dueDate: 'Jan 31, 2026', completedDate: 'Jan 28, 2026', status: 'completed', score: 98 },
  { id: 'kt-03', title: 'Event Safety Procedures', description: 'Safety procedures training for all event staff covering emergency protocols and evacuation.', assignee: 'Event Staff', assigneeInitials: 'ES', module: 'Event Safety 2026', dueDate: 'Mar 15, 2026', status: 'in-progress', score: 80 },
  { id: 'kt-04', title: 'Incident Reporting Training', description: 'Training on incident documentation, reporting procedures, and escalation protocols.', assignee: 'All Staff', assigneeInitials: 'AS', module: 'Incident Reporting 2026', dueDate: 'Mar 31, 2026', status: 'in-progress', score: 75 },
];

const communityPolicies: CompliancePolicy[] = [
  { id: 'kp-01', title: 'Replay Upload Mandate Policy', description: 'Policy requiring all teams to upload race replays within 48 hours of race completion.', version: 'v1.2', effectiveDate: 'Jan 1, 2026', reviewDate: 'Jan 1, 2027', owner: 'Marcus Hall', ownerInitials: 'MH', status: 'active', acknowledgedCount: 12, totalCount: 12 },
  { id: 'kp-02', title: 'Venue Safety Standards', description: 'Safety standards and inspection requirements for all race venues.', version: 'v2.0', effectiveDate: 'Jan 1, 2026', reviewDate: 'Jan 1, 2027', owner: 'Derek Santos', ownerInitials: 'DS', status: 'active', acknowledgedCount: 10, totalCount: 12 },
  { id: 'kp-03', title: 'Officials Code of Conduct', description: 'Code of conduct and ethical standards for all race officials.', version: 'v1.0', effectiveDate: 'Jan 1, 2026', reviewDate: 'Jan 1, 2027', owner: 'Lisa Park', ownerInitials: 'LP', status: 'active', acknowledgedCount: 36, totalCount: 36 },
];

const communityDeadlines: ComplianceDeadline[] = [
  { id: 'kdl-01', title: 'Round 3 Replay Upload Window', description: 'All Round 3 race replays must be uploaded within 48 hours of race completion.', dueDate: 'Feb 24, 2026', owner: 'Marcus Hall', ownerInitials: 'MH', status: 'due-soon', proofRequired: true, proofSubmitted: false, scope: 'Series' },
  { id: 'kdl-02', title: 'Venue Inspection — Round 3', description: 'Pre-event safety inspection for the Round 3 venue.', dueDate: 'Feb 20, 2026', owner: 'Derek Santos', ownerInitials: 'DS', status: 'due-soon', proofRequired: true, proofSubmitted: false, scope: 'Event Weekend' },
  { id: 'kdl-03', title: 'Season Safety Review Completion', description: 'Complete the mid-season safety review covering all venues and incident reports.', dueDate: 'Mar 31, 2026', owner: 'Derek Santos', ownerInitials: 'DS', status: 'upcoming', proofRequired: true, proofSubmitted: false, scope: 'Series' },
];

const communityReports: ComplianceReport[] = [
  { id: 'krp-01', title: 'Series Compliance Report', type: 'Series Summary', period: 'Rounds 1–2', generatedAt: 'Feb 14, 2026', format: 'PDF', size: '1.9 MB' },
  { id: 'krp-02', title: 'Event Compliance Packet', type: 'Event', period: 'Round 2', generatedAt: 'Feb 5, 2026', format: 'PDF', size: '1.2 MB' },
  { id: 'krp-03', title: 'Upload Mandate Compliance Export', type: 'Content', period: 'Season 2026', generatedAt: 'Feb 12, 2026', format: 'CSV', size: '85 KB' },
  { id: 'krp-04', title: 'Venue Safety Export', type: 'Safety', period: 'Season 2026', generatedAt: 'Feb 10, 2026', format: 'XLSX', size: '320 KB' },
];

const communityAudit: ComplianceAuditEntry[] = [
  { id: 'kau-01', action: 'requirement_verified', actor: 'Marcus Hall', actorInitials: 'MH', target: 'Replay Upload Within 48h', timestamp: 'Feb 14, 2026 10:00 AM', detail: '11 of 12 replays verified on-time for current round' },
  { id: 'kau-02', action: 'evidence_submitted', actor: 'Derek Santos', actorInitials: 'DS', target: 'Venue Inspection — COTA Center', timestamp: 'Feb 8, 2026 4:00 PM', detail: 'Venue inspection report uploaded with photos' },
  { id: 'kau-03', action: 'incident_opened', actor: 'Marcus Hall', actorInitials: 'MH', target: 'Late Replay Upload — Team Eastside', timestamp: 'Feb 13, 2026 9:00 AM', detail: 'Team Eastside exceeded 48h upload window' },
  { id: 'kau-04', action: 'checklist_completed', actor: 'Lisa Park', actorInitials: 'LP', target: 'Officials Credentialing', timestamp: 'Feb 15, 2026 11:30 AM', detail: 'All 6 official credentials verified for Round 3' },
  { id: 'kau-05', action: 'policy_updated', actor: 'Marcus Hall', actorInitials: 'MH', target: 'Replay Upload Mandate Policy', timestamp: 'Jan 5, 2026 2:00 PM', detail: 'Updated to v1.2 with quality re-upload clause' },
  { id: 'kau-06', action: 'training_completed', actor: 'All Officials', actorInitials: 'AO', target: 'Officials Certification', timestamp: 'Jan 28, 2026 3:00 PM', detail: 'All officials certified with 98% average score' },
  { id: 'kau-07', action: 'deadline_met', actor: 'Lisa Park', actorInitials: 'LP', target: 'Officials Credentialing Deadline', timestamp: 'Feb 15, 2026 11:30 AM', detail: 'All credentials submitted before Round 3' },
  { id: 'kau-08', action: 'action_verified', actor: 'Marcus Hall', actorInitials: 'MH', target: 'Update Officials Backup Protocol', timestamp: 'Feb 16, 2026 8:00 AM', detail: 'Revised protocol approved and distributed to all officials' },
];

const communitySettings: ComplianceSettingToggle[] = [
  { id: 'kst-01', label: 'Auto-flag Late Replay Uploads After 48h', description: 'Automatically flag teams that have not uploaded replays within the 48-hour window.', enabled: true },
  { id: 'kst-02', label: 'Email Venue Inspection Reminders 7 Days Before Event', description: 'Send automated reminders to venue managers 7 days before each event weekend.', enabled: true },
  { id: 'kst-03', label: 'Require Evidence for All Safety Checklists', description: 'Require photographic or documentary evidence for all safety checklist completions.', enabled: true },
  { id: 'kst-04', label: 'Auto-archive Closed Incidents After 60 Days', description: 'Automatically move closed incidents to the archive after 60 days.', enabled: false },
];

// =============================================================================
// GETTER
// =============================================================================

export function getComplianceData(mode: Mode): ComplianceModeData {
  switch (mode) {
    case 'sports':
      return {
        dashboard: sportsDashboard,
        requirements: sportsRequirements,
        checklists: sportsChecklists,
        evidence: sportsEvidence,
        incidents: sportsIncidents,
        actions: sportsActions,
        training: sportsTraining,
        policies: sportsPolicies,
        deadlines: sportsDeadlines,
        reports: sportsReports,
        audit: sportsAudit,
        settings: sportsSettings,
      };
    case 'education':
      return {
        dashboard: educationDashboard,
        requirements: educationRequirements,
        checklists: educationChecklists,
        evidence: educationEvidence,
        incidents: educationIncidents,
        actions: educationActions,
        training: educationTraining,
        policies: educationPolicies,
        deadlines: educationDeadlines,
        reports: educationReports,
        audit: educationAudit,
        settings: educationSettings,
      };
    case 'church':
      return {
        dashboard: churchDashboard,
        requirements: churchRequirements,
        checklists: churchChecklists,
        evidence: churchEvidence,
        incidents: churchIncidents,
        actions: churchActions,
        training: churchTraining,
        policies: churchPolicies,
        deadlines: churchDeadlines,
        reports: churchReports,
        audit: churchAudit,
        settings: churchSettings,
      };
    case 'enterprise':
      return {
        dashboard: enterpriseDashboard,
        requirements: enterpriseRequirements,
        checklists: enterpriseChecklists,
        evidence: enterpriseEvidence,
        incidents: enterpriseIncidents,
        actions: enterpriseActions,
        training: enterpriseTraining,
        policies: enterprisePolicies,
        deadlines: enterpriseDeadlines,
        reports: enterpriseReports,
        audit: enterpriseAudit,
        settings: enterpriseSettings,
      };
    case 'community':
      return {
        dashboard: communityDashboard,
        requirements: communityRequirements,
        checklists: communityChecklists,
        evidence: communityEvidence,
        incidents: communityIncidents,
        actions: communityActions,
        training: communityTraining,
        policies: communityPolicies,
        deadlines: communityDeadlines,
        reports: communityReports,
        audit: communityAudit,
        settings: communitySettings,
      };
  }
}
