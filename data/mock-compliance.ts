/**
 * Compliance v2 — Mock Data
 * Mode-aware compliance policies, audits, incidents, and training for all 5 modes.
 */

import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export type ComplianceStatus = 'compliant' | 'warning' | 'violation' | 'pending-review';
export type PolicyCategory = 'eligibility' | 'financial' | 'safety' | 'conduct' | 'reporting' | 'privacy' | 'governance';
export type AuditStatus = 'passed' | 'failed' | 'in-progress' | 'scheduled';

export interface CompliancePolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  status: ComplianceStatus;
  lastReviewed: string;
  nextReview: string;
  description: string;
}

export interface ComplianceAudit {
  id: string;
  title: string;
  auditor: string;
  date: string;
  status: AuditStatus;
  findings: number;
  criticalFindings: number;
}

export interface ComplianceIncident {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedDate: string;
  assignee: string;
  description: string;
}

export interface ComplianceTraining {
  id: string;
  title: string;
  required: boolean;
  completionRate: number;
  dueDate: string;
  category: string;
}

export interface ComplianceSnapshot {
  overallStatus: ComplianceStatus;
  policiesCount: number;
  openIncidents: number;
  upcomingAudits: number;
  trainingCompliance: number;
}

// =============================================================================
// SPORTS MODE — Carroll College Basketball (NAIA)
// =============================================================================

const sportsPolicies: CompliancePolicy[] = [
  { id: 'sp-pol-001', title: 'NAIA Eligibility Standards', category: 'eligibility', status: 'compliant', lastReviewed: '2026-01-15', nextReview: '2026-07-15', description: 'All student-athletes must meet NAIA eligibility requirements including academic standing, enrollment status, and transfer regulations.' },
  { id: 'sp-pol-002', title: 'Title IX Compliance', category: 'conduct', status: 'compliant', lastReviewed: '2025-12-01', nextReview: '2026-06-01', description: 'Gender equity in athletic participation opportunities, scholarship allocation, and program resources per federal Title IX requirements.' },
  { id: 'sp-pol-003', title: 'Recruiting Contact Rules', category: 'eligibility', status: 'compliant', lastReviewed: '2026-02-01', nextReview: '2026-08-01', description: 'NAIA recruiting calendar compliance including contact periods, official/unofficial visit protocols, and communication rules.' },
  { id: 'sp-pol-004', title: 'Financial Aid Limits', category: 'financial', status: 'compliant', lastReviewed: '2026-01-20', nextReview: '2026-07-20', description: 'Athletic scholarship limits per NAIA regulations. Maximum equivalencies and stacking rules with institutional aid.' },
  { id: 'sp-pol-005', title: 'Drug Testing Protocol', category: 'safety', status: 'compliant', lastReviewed: '2025-11-15', nextReview: '2026-05-15', description: 'Mandatory drug testing procedures for all student-athletes per NAIA and institutional policy, including banned substances list.' },
  { id: 'sp-pol-006', title: 'Injury Reporting & Concussion Protocol', category: 'safety', status: 'compliant', lastReviewed: '2026-01-10', nextReview: '2026-07-10', description: 'Mandatory injury reporting, concussion baseline testing, and return-to-play protocol per NAIA and state requirements.' },
];

const sportsAudits: ComplianceAudit[] = [
  { id: 'sp-aud-001', title: 'NAIA Eligibility Review — Spring 2026', auditor: 'NAIA Compliance Office', date: '2026-03-15', status: 'scheduled', findings: 0, criticalFindings: 0 },
  { id: 'sp-aud-002', title: 'Title IX Program Review', auditor: 'Carroll College Office of Equity', date: '2026-01-20', status: 'passed', findings: 2, criticalFindings: 0 },
  { id: 'sp-aud-003', title: 'Financial Aid Audit — FY2025', auditor: 'External Auditor — Deloitte', date: '2025-12-10', status: 'passed', findings: 1, criticalFindings: 0 },
];

const sportsIncidents: ComplianceIncident[] = [
  { id: 'sp-inc-001', title: 'Transfer Eligibility Documentation Delay', severity: 'minor', status: 'open', reportedDate: '2026-02-10', assignee: 'Athletic Compliance Director', description: 'Transfer student transcript verification delayed from previous institution. Student held out of competition pending resolution.' },
  { id: 'sp-inc-002', title: 'Practice Hours Overage — Week 5', severity: 'minor', status: 'resolved', reportedDate: '2026-01-28', assignee: 'Head Coach', description: 'Weekly countable hours exceeded by 30 minutes due to film session scheduling overlap. Self-reported and corrected.' },
];

const sportsTraining: ComplianceTraining[] = [
  { id: 'sp-trn-001', title: 'NAIA Rules Education — Annual', required: true, completionRate: 92, dueDate: '2026-03-01', category: 'Eligibility' },
  { id: 'sp-trn-002', title: 'Title IX Awareness Training', required: true, completionRate: 88, dueDate: '2026-04-15', category: 'Conduct' },
  { id: 'sp-trn-003', title: 'Concussion Protocol Certification', required: true, completionRate: 100, dueDate: '2026-01-15', category: 'Safety' },
  { id: 'sp-trn-004', title: 'Recruiting Rules Refresher', required: false, completionRate: 67, dueDate: '2026-05-01', category: 'Eligibility' },
];

const sportsSnapshot: ComplianceSnapshot = {
  overallStatus: 'compliant',
  policiesCount: 6,
  openIncidents: 1,
  upcomingAudits: 1,
  trainingCompliance: 87,
};

// =============================================================================
// CHURCH MODE — 2819 Church
// =============================================================================

const churchPolicies: CompliancePolicy[] = [
  { id: 'ch-pol-001', title: 'Financial Transparency & Reporting', category: 'financial', status: 'compliant', lastReviewed: '2026-01-10', nextReview: '2026-07-10', description: 'Annual financial disclosure to congregation, independent audit requirement, and designated fund accounting per IRS 501(c)(3) rules.' },
  { id: 'ch-pol-002', title: 'Child Safety & Protection Policy', category: 'safety', status: 'compliant', lastReviewed: '2026-02-01', nextReview: '2026-08-01', description: 'Background checks for all children\'s ministry volunteers, two-adult rule, mandatory reporting protocols, and safe environment training.' },
  { id: 'ch-pol-003', title: 'Employment & HR Compliance', category: 'conduct', status: 'compliant', lastReviewed: '2025-12-15', nextReview: '2026-06-15', description: 'California employment law compliance including ministerial exception, wage/hour rules, anti-discrimination, and benefits administration.' },
  { id: 'ch-pol-004', title: 'Data Privacy — Member Records', category: 'privacy', status: 'compliant', lastReviewed: '2026-01-25', nextReview: '2026-07-25', description: 'Member data collection, storage, and sharing policies. Giving record confidentiality and opt-in communications compliance.' },
  { id: 'ch-pol-005', title: 'Building & Fire Safety Codes', category: 'safety', status: 'compliant', lastReviewed: '2025-11-20', nextReview: '2026-05-20', description: 'Occupancy limits, emergency exit signage, fire suppression system inspections, and ADA accessibility for all campus facilities.' },
];

const churchAudits: ComplianceAudit[] = [
  { id: 'ch-aud-001', title: 'Annual Financial Audit — FY2025', auditor: 'Grant Thornton LLP', date: '2026-03-20', status: 'scheduled', findings: 0, criticalFindings: 0 },
  { id: 'ch-aud-002', title: 'Child Safety Policy Review', auditor: 'Ministry Safe', date: '2026-01-15', status: 'passed', findings: 1, criticalFindings: 0 },
];

const churchIncidents: ComplianceIncident[] = [
  { id: 'ch-inc-001', title: 'Expired Background Check — Volunteer', severity: 'minor', status: 'resolved', reportedDate: '2026-01-20', assignee: 'Children\'s Ministry Director', description: 'One children\'s ministry volunteer had an expired background check. Volunteer removed from service pending renewal, completed within 5 days.' },
];

const churchTraining: ComplianceTraining[] = [
  { id: 'ch-trn-001', title: 'Child Safety Awareness', required: true, completionRate: 95, dueDate: '2026-03-01', category: 'Safety' },
  { id: 'ch-trn-002', title: 'Financial Stewardship for Leaders', required: true, completionRate: 88, dueDate: '2026-04-01', category: 'Financial' },
  { id: 'ch-trn-003', title: 'Mandatory Reporter Training', required: true, completionRate: 92, dueDate: '2026-06-01', category: 'Safety' },
];

const churchSnapshot: ComplianceSnapshot = {
  overallStatus: 'compliant',
  policiesCount: 5,
  openIncidents: 0,
  upcomingAudits: 1,
  trainingCompliance: 92,
};

// =============================================================================
// EDUCATION MODE — Howard University
// =============================================================================

const educationPolicies: CompliancePolicy[] = [
  { id: 'ed-pol-001', title: 'WSCUC Accreditation Standards', category: 'governance', status: 'warning', lastReviewed: '2026-01-05', nextReview: '2026-04-15', description: 'WASC Senior College and University Commission accreditation compliance including educational effectiveness, institutional capacity, and continuous improvement.' },
  { id: 'ed-pol-002', title: 'FERPA — Student Records Privacy', category: 'privacy', status: 'compliant', lastReviewed: '2026-02-01', nextReview: '2026-08-01', description: 'Family Educational Rights and Privacy Act compliance for student education records, directory information, and third-party disclosure policies.' },
  { id: 'ed-pol-003', title: 'Title IX — Campus Safety', category: 'conduct', status: 'compliant', lastReviewed: '2025-12-20', nextReview: '2026-06-20', description: 'Title IX compliance including sexual harassment prevention, grievance procedures, coordinator designation, and reporting protocols.' },
  { id: 'ed-pol-004', title: 'ADA Accommodations', category: 'safety', status: 'compliant', lastReviewed: '2026-01-15', nextReview: '2026-07-15', description: 'Americans with Disabilities Act compliance for academic accommodations, physical accessibility, and reasonable modification processes.' },
  { id: 'ed-pol-005', title: 'Federal Financial Aid — Title IV', category: 'financial', status: 'compliant', lastReviewed: '2026-01-20', nextReview: '2026-07-20', description: 'Title IV federal financial aid program compliance including Pell Grant, Direct Loans, satisfactory academic progress, and R2T4 calculations.' },
  { id: 'ed-pol-006', title: 'Research Ethics & IRB', category: 'conduct', status: 'compliant', lastReviewed: '2025-11-10', nextReview: '2026-05-10', description: 'Institutional Review Board oversight for human subjects research, informed consent protocols, and research data management.' },
  { id: 'ed-pol-007', title: 'Campus Safety — Clery Act', category: 'safety', status: 'compliant', lastReviewed: '2025-12-01', nextReview: '2026-06-01', description: 'Clery Act compliance including annual security report, timely warnings, crime log maintenance, and emergency notification procedures.' },
];

const educationAudits: ComplianceAudit[] = [
  { id: 'ed-aud-001', title: 'WSCUC Accreditation Visit', auditor: 'WSCUC Review Team', date: '2026-04-15', status: 'scheduled', findings: 0, criticalFindings: 0 },
  { id: 'ed-aud-002', title: 'Title IV Financial Aid Audit', auditor: 'US Dept. of Education', date: '2026-05-01', status: 'scheduled', findings: 0, criticalFindings: 0 },
  { id: 'ed-aud-003', title: 'IT Security Assessment', auditor: 'CyberArk Solutions', date: '2026-01-25', status: 'passed', findings: 3, criticalFindings: 0 },
  { id: 'ed-aud-004', title: 'ADA Accessibility Review', auditor: 'Accessibility Partners Inc.', date: '2025-12-10', status: 'passed', findings: 4, criticalFindings: 1 },
];

const educationIncidents: ComplianceIncident[] = [
  { id: 'ed-inc-001', title: 'FERPA Disclosure Concern — Parent Request', severity: 'major', status: 'investigating', reportedDate: '2026-02-08', assignee: 'Registrar', description: 'Parent requested student grades without proper FERPA waiver on file. Request denied, investigation opened to review communication protocols.' },
  { id: 'ed-inc-002', title: 'ADA Accommodation Delay', severity: 'minor', status: 'resolved', reportedDate: '2026-01-18', assignee: 'Disability Services Coordinator', description: 'Student accommodation request processing exceeded 10-business-day SLA. Process improved with additional staffing.' },
];

const educationTraining: ComplianceTraining[] = [
  { id: 'ed-trn-001', title: 'FERPA Annual Certification', required: true, completionRate: 82, dueDate: '2026-03-15', category: 'Privacy' },
  { id: 'ed-trn-002', title: 'Title IX Awareness — All Employees', required: true, completionRate: 78, dueDate: '2026-04-01', category: 'Conduct' },
  { id: 'ed-trn-003', title: 'Clery Act Reporting Procedures', required: true, completionRate: 91, dueDate: '2026-03-01', category: 'Safety' },
  { id: 'ed-trn-004', title: 'IRB Research Ethics', required: false, completionRate: 72, dueDate: '2026-05-01', category: 'Conduct' },
  { id: 'ed-trn-005', title: 'Cybersecurity Awareness', required: true, completionRate: 88, dueDate: '2026-02-28', category: 'Privacy' },
];

const educationSnapshot: ComplianceSnapshot = {
  overallStatus: 'warning',
  policiesCount: 7,
  openIncidents: 1,
  upcomingAudits: 2,
  trainingCompliance: 84,
};

// =============================================================================
// BUSINESS MODE — Valuetainment
// =============================================================================

const businessPolicies: CompliancePolicy[] = [
  { id: 'en-pol-001', title: 'SOC 2 Type II Controls', category: 'privacy', status: 'compliant', lastReviewed: '2026-01-20', nextReview: '2026-07-20', description: 'Service Organization Control 2 compliance for security, availability, processing integrity, confidentiality, and privacy trust services criteria.' },
  { id: 'en-pol-002', title: 'GDPR Data Processing', category: 'privacy', status: 'compliant', lastReviewed: '2026-02-01', nextReview: '2026-08-01', description: 'General Data Protection Regulation compliance for EU data subjects including consent management, data portability, and right to erasure.' },
  { id: 'en-pol-003', title: 'Employment Law — Multi-State', category: 'conduct', status: 'compliant', lastReviewed: '2025-12-15', nextReview: '2026-06-15', description: 'Federal and state employment law compliance including FLSA, FMLA, at-will employment, contractor classification, and remote work policies.' },
  { id: 'en-pol-004', title: 'Intellectual Property Protection', category: 'governance', status: 'compliant', lastReviewed: '2026-01-10', nextReview: '2026-07-10', description: 'IP assignment agreements, trade secret protocols, patent strategy, and open-source license compliance for all Valuetainment proprietary systems.' },
  { id: 'en-pol-005', title: 'Financial Reporting — GAAP', category: 'financial', status: 'compliant', lastReviewed: '2026-01-25', nextReview: '2026-07-25', description: 'Generally Accepted Accounting Principles compliance for financial statements, revenue recognition, and investor reporting obligations.' },
  { id: 'en-pol-006', title: 'Anti-Harassment & DEI Policy', category: 'conduct', status: 'compliant', lastReviewed: '2025-11-20', nextReview: '2026-05-20', description: 'Workplace anti-harassment policy, reporting procedures, investigation protocols, and diversity/equity/inclusion commitments.' },
];

const businessAudits: ComplianceAudit[] = [
  { id: 'en-aud-001', title: 'SOC 2 Type II Annual Audit', auditor: 'Ernst & Young', date: '2026-06-01', status: 'scheduled', findings: 0, criticalFindings: 0 },
  { id: 'en-aud-002', title: 'GDPR Data Mapping Review', auditor: 'Privacy Shield Consulting', date: '2026-01-30', status: 'passed', findings: 2, criticalFindings: 0 },
  { id: 'en-aud-003', title: 'Code Security Audit — Q4 2025', auditor: 'NCC Group', date: '2025-12-20', status: 'passed', findings: 5, criticalFindings: 1 },
];

const businessIncidents: ComplianceIncident[] = [
  { id: 'en-inc-001', title: 'Third-Party Data Processor Breach Notification', severity: 'major', status: 'investigating', reportedDate: '2026-02-05', assignee: 'CTO', description: 'Third-party analytics provider reported a potential data exposure. No Valuetainment customer data confirmed affected. Vendor audit initiated.' },
  { id: 'en-inc-002', title: 'Employee Laptop Lost — Encrypted', severity: 'minor', status: 'closed', reportedDate: '2026-01-22', assignee: 'IT Security Lead', description: 'Employee laptop reported lost during travel. Device was fully encrypted with remote wipe capability. Wipe executed within 4 hours.' },
];

const businessTraining: ComplianceTraining[] = [
  { id: 'en-trn-001', title: 'SOC 2 Security Awareness', required: true, completionRate: 94, dueDate: '2026-03-01', category: 'Privacy' },
  { id: 'en-trn-002', title: 'GDPR Data Handling', required: true, completionRate: 89, dueDate: '2026-04-01', category: 'Privacy' },
  { id: 'en-trn-003', title: 'Anti-Harassment Training — Annual', required: true, completionRate: 100, dueDate: '2026-01-31', category: 'Conduct' },
  { id: 'en-trn-004', title: 'Secure Development Practices', required: false, completionRate: 82, dueDate: '2026-05-01', category: 'Privacy' },
];

const businessSnapshot: ComplianceSnapshot = {
  overallStatus: 'compliant',
  policiesCount: 6,
  openIncidents: 1,
  upcomingAudits: 1,
  trainingCompliance: 91,
};

// =============================================================================
// COMMUNITY MODE — Valuetainment Media League
// =============================================================================

const communityPolicies: CompliancePolicy[] = [
  { id: 'cm-pol-001', title: 'Safety Regulations — Karting Standards', category: 'safety', status: 'compliant', lastReviewed: '2026-02-01', nextReview: '2026-08-01', description: 'CIK-FIA and domestic karting safety standards compliance including helmet requirements, suit ratings, kart safety equipment, and track safety features.' },
  { id: 'cm-pol-002', title: 'Vehicle Standards & Technical Inspection', category: 'safety', status: 'compliant', lastReviewed: '2026-02-08', nextReview: '2026-08-08', description: 'Pre-race technical inspection protocols including chassis inspection, engine sealing, weight compliance, and tire specifications per class rules.' },
  { id: 'cm-pol-003', title: 'Medical Clearance Requirements', category: 'safety', status: 'compliant', lastReviewed: '2026-01-15', nextReview: '2026-07-15', description: 'Annual medical clearance for all competitive drivers, on-site medical personnel requirements, and emergency evacuation protocols.' },
  { id: 'cm-pol-004', title: 'Insurance & Liability Coverage', category: 'financial', status: 'compliant', lastReviewed: '2026-01-20', nextReview: '2026-07-20', description: 'General liability, participant accident, and event cancellation insurance coverage requirements for all sanctioned events.' },
  { id: 'cm-pol-005', title: 'Event Permits & Local Compliance', category: 'governance', status: 'compliant', lastReviewed: '2026-02-05', nextReview: '2026-08-05', description: 'Local event permits, noise ordinance compliance, traffic management plans, and environmental impact documentation for race events.' },
];

const communityAudits: ComplianceAudit[] = [
  { id: 'cm-aud-001', title: 'Annual Safety Inspection — All Venues', auditor: '3SSB Safety Commission', date: '2026-04-01', status: 'scheduled', findings: 0, criticalFindings: 0 },
  { id: 'cm-aud-002', title: 'Insurance Coverage Review', auditor: 'Marsh McLennan', date: '2026-01-10', status: 'passed', findings: 0, criticalFindings: 0 },
];

const communityIncidents: ComplianceIncident[] = [
  { id: 'cm-inc-001', title: 'Barrier Damage — Round 2 Track Repair', severity: 'minor', status: 'resolved', reportedDate: '2026-02-03', assignee: 'Track Safety Officer', description: 'Tire barrier displaced during Round 2 race incident. Barrier repaired and re-inspected within 24 hours. No injuries reported.' },
];

const communityTraining: ComplianceTraining[] = [
  { id: 'cm-trn-001', title: 'Race Official Safety Certification', required: true, completionRate: 100, dueDate: '2026-03-01', category: 'Safety' },
  { id: 'cm-trn-002', title: 'First Aid & Emergency Response', required: true, completionRate: 95, dueDate: '2026-04-01', category: 'Safety' },
  { id: 'cm-trn-003', title: 'Technical Inspection Standards', required: false, completionRate: 90, dueDate: '2026-05-01', category: 'Safety' },
];

const communitySnapshot: ComplianceSnapshot = {
  overallStatus: 'compliant',
  policiesCount: 5,
  openIncidents: 0,
  upcomingAudits: 1,
  trainingCompliance: 95,
};

// =============================================================================
// EXPORTS — Record<Mode, T>
// =============================================================================

export const COMPLIANCE_POLICIES: Record<Mode, CompliancePolicy[]> = {
  sports: sportsPolicies,
  church: churchPolicies,
  education: educationPolicies,
  competition: communityPolicies,
  business: businessPolicies,
};

export const COMPLIANCE_AUDITS: Record<Mode, ComplianceAudit[]> = {
  sports: sportsAudits,
  church: churchAudits,
  education: educationAudits,
  competition: communityAudits,
  business: businessAudits,
};

export const COMPLIANCE_INCIDENTS: Record<Mode, ComplianceIncident[]> = {
  sports: sportsIncidents,
  church: churchIncidents,
  education: educationIncidents,
  competition: communityIncidents,
  business: businessIncidents,
};

export const COMPLIANCE_TRAINING: Record<Mode, ComplianceTraining[]> = {
  sports: sportsTraining,
  church: churchTraining,
  education: educationTraining,
  competition: communityTraining,
  business: businessTraining,
};

export const COMPLIANCE_SNAPSHOTS: Record<Mode, ComplianceSnapshot> = {
  sports: sportsSnapshot,
  church: churchSnapshot,
  education: educationSnapshot,
  competition: communitySnapshot,
  business: businessSnapshot,
};
