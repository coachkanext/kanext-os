/**
 * Education Policies — Policy Library, Acknowledgements, Updates, Enforcement,
 * Compliance Dashboard, Policy Packs.
 *
 * 6-view pill toggle. RBAC:
 *   E1/E2 — All 6 views, full enforcement/compliance data
 *   E3    — Policy Library + Acknowledgements + Compliance Dashboard (limited)
 *   E4    — Policy Library + Acknowledgements + Policy Packs (student pack)
 *   E5    — Policy Library only (public policies)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import {
  isPresident,
  isDeanLevel,
  isFacultyLevel,
  isStudent,
  isEnrolled,
} from '@/utils/education-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: EducationRoleLens;
  onSwitchTab?: (index: number) => void;
}

type PolicyView =
  | 'library'
  | 'acknowledgements'
  | 'updates'
  | 'enforcement'
  | 'compliance'
  | 'packs';

interface ViewDef {
  id: PolicyView;
  label: string;
  roles: EducationRoleLens[];
}

const VIEW_DEFS: ViewDef[] = [
  { id: 'library',          label: 'Policy Library',       roles: ['E1', 'E2', 'E3', 'E4', 'E5'] },
  { id: 'acknowledgements', label: 'Acknowledgements',     roles: ['E1', 'E2', 'E3', 'E4'] },
  { id: 'updates',          label: 'Policy Updates',       roles: ['E1', 'E2'] },
  { id: 'enforcement',      label: 'Enforcement',          roles: ['E1', 'E2'] },
  { id: 'compliance',       label: 'Compliance Dashboard', roles: ['E1', 'E2', 'E3'] },
  { id: 'packs',            label: 'Policy Packs',         roles: ['E1', 'E2', 'E4'] },
];

function getVisibleViews(role: EducationRoleLens): ViewDef[] {
  return VIEW_DEFS.filter((v) => v.roles.includes(role));
}

// =============================================================================
// INLINE MOCK DATA — POLICY LIBRARY (carries forward existing data)
// =============================================================================

type PolicyCategory = 'academic' | 'conduct' | 'safety' | 'hr' | 'it' | 'financial';

interface LibraryPolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  subcategory: string;
  lastUpdated: string;
  effectiveDate: string;
  version: string;
  status: 'active' | 'draft' | 'under_review' | 'archived';
  summary: string;
  keyPoints: string[];
  appliesToRoles: EducationRoleLens[];
  versionHistory: { version: string; date: string; change: string }[];
}

// --- Academic Policies (from original ACADEMIC_POLICIES) ---

const ACADEMIC_POLICIES: LibraryPolicy[] = [
  {
    id: 'ap-1',
    title: 'Attendance Policy',
    category: 'academic',
    subcategory: 'attendance',
    lastUpdated: 'Aug 2025',
    effectiveDate: 'Aug 15, 2025',
    version: '3.1',
    status: 'active',
    summary: 'Students are expected to attend all scheduled classes. Excessive absences may result in grade reduction or administrative withdrawal.',
    keyPoints: [
      'More than 3 unexcused absences per course may result in grade penalty',
      'Medical absences require documentation within 5 business days',
      'Faculty must report attendance through the early alert system',
      'University-sponsored activities count as excused absences',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '3.1', date: 'Aug 2025', change: 'Added early alert system requirement' },
      { version: '3.0', date: 'Aug 2024', change: 'Revised excused absence categories' },
    ],
  },
  {
    id: 'ap-2',
    title: 'Grading Policy & GPA Calculation',
    category: 'academic',
    subcategory: 'grading',
    lastUpdated: 'Aug 2025',
    effectiveDate: 'Aug 15, 2025',
    version: '4.0',
    status: 'active',
    summary: 'Establishes the grading scale, GPA calculation methodology, grade appeals process, and incomplete grade policy.',
    keyPoints: [
      'Standard 4.0 scale: A (4.0), A- (3.7), B+ (3.3), B (3.0), etc.',
      'Incomplete grades must be resolved within one semester',
      'Grade appeals must be filed within 30 days of grade posting',
      'Pass/Fail option available for up to 2 elective courses per year',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '4.0', date: 'Aug 2025', change: 'Updated pass/fail policy limits' },
      { version: '3.2', date: 'Jan 2024', change: 'Added incomplete grade timeline' },
    ],
  },
  {
    id: 'ap-3',
    title: 'Academic Integrity Policy',
    category: 'academic',
    subcategory: 'integrity',
    lastUpdated: 'Jan 2026',
    effectiveDate: 'Jan 13, 2026',
    version: '5.0-rc',
    status: 'under_review',
    summary: 'Defines academic dishonesty, plagiarism, and consequences. Currently under review to address AI-generated content policies.',
    keyPoints: [
      'Plagiarism, cheating, and fabrication are prohibited',
      'First offense: zero on assignment + academic integrity workshop',
      'Second offense: course failure + notation on academic record',
      'Third offense: suspension or expulsion hearing',
      'AI-generated content policy addendum under review',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '5.0-rc', date: 'Jan 2026', change: 'AI-generated content addendum drafted' },
      { version: '4.2', date: 'Aug 2024', change: 'Clarified self-plagiarism rules' },
    ],
  },
  {
    id: 'ap-4',
    title: 'Registration & Add/Drop Policy',
    category: 'academic',
    subcategory: 'registration',
    lastUpdated: 'Aug 2025',
    effectiveDate: 'Aug 15, 2025',
    version: '2.4',
    status: 'active',
    summary: 'Governs course registration, add/drop periods, withdrawal procedures, and enrollment verification.',
    keyPoints: [
      'Add/drop period: first 5 business days of semester',
      'Withdrawal with "W" grade: through week 10',
      'Minimum 12 credits for full-time undergraduate status',
      'Academic advisor hold clearance required for registration',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '2.4', date: 'Aug 2025', change: 'Clarified advisor hold process' },
    ],
  },
  {
    id: 'ap-5',
    title: 'Academic Standing & Probation',
    category: 'academic',
    subcategory: 'academic_standing',
    lastUpdated: 'Aug 2025',
    effectiveDate: 'Aug 15, 2025',
    version: '3.0',
    status: 'active',
    summary: 'Defines good standing, academic warning, probation, suspension, and dismissal criteria.',
    keyPoints: [
      'Good standing: cumulative GPA 2.0 or higher',
      'Academic warning: GPA below 2.0 for one semester',
      'Academic probation: GPA below 2.0 for two consecutive semesters',
      'Academic suspension: GPA below 1.5 or probation for 2+ semesters',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4'],
    versionHistory: [
      { version: '3.0', date: 'Aug 2025', change: 'Restructured probation tiers' },
    ],
  },
  {
    id: 'ap-6',
    title: 'Transfer Credit Policy',
    category: 'academic',
    subcategory: 'transfer',
    lastUpdated: 'Jun 2025',
    effectiveDate: 'Jun 1, 2025',
    version: '2.1',
    status: 'active',
    summary: 'Establishes procedures for evaluating and accepting transfer credits from other institutions.',
    keyPoints: [
      'Transfer credits must be from accredited institutions',
      'Minimum grade of C required for credit transfer',
      'Maximum 60 credits transferable toward undergraduate degree',
      'Evaluation completed within 4\u20136 weeks of transcript receipt',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '2.1', date: 'Jun 2025', change: 'Expanded accepted accreditation bodies' },
    ],
  },
  {
    id: 'ap-7',
    title: 'Graduation Requirements',
    category: 'academic',
    subcategory: 'graduation',
    lastUpdated: 'Aug 2025',
    effectiveDate: 'Aug 15, 2025',
    version: '4.1',
    status: 'active',
    summary: 'Outlines degree completion requirements including credit hours, GPA, residency, and application deadlines.',
    keyPoints: [
      'Minimum 128 credits for bachelor\'s degree',
      'Minimum cumulative GPA of 2.0',
      'Minimum 32 credits in residency at Westfield',
      'Graduation application due one semester before expected completion',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '4.1', date: 'Aug 2025', change: 'Updated residency credit requirements' },
    ],
  },
  {
    id: 'ap-8',
    title: 'Faculty Workload Policy (Draft)',
    category: 'hr',
    subcategory: 'faculty_workload',
    lastUpdated: 'Feb 2026',
    effectiveDate: 'TBD',
    version: '1.0-draft',
    status: 'draft',
    summary: 'Proposed revisions to faculty teaching load, research expectations, and service commitments.',
    keyPoints: [
      'Standard teaching load: 3-3 (3 courses per semester)',
      'Research-active faculty: 2-2 with buy-out option',
      'Service committee expectations: minimum 2 per year',
      'Draft pending Faculty Senate review',
    ],
    appliesToRoles: ['E1', 'E2'],
    versionHistory: [
      { version: '1.0-draft', date: 'Feb 2026', change: 'Initial draft for Faculty Senate review' },
    ],
  },
];

// --- Student Conduct Policies (from original STUDENT_CONDUCT) ---

interface ConductItem {
  id: string;
  title: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  consequences: string;
}

const STUDENT_CONDUCT: ConductItem[] = [
  { id: 'sc-1', title: 'Alcohol & Drug Policy', severity: 'major', description: 'Possession, use, or distribution of alcohol and illegal substances on campus is prohibited. Medical amnesty policy applies for emergencies.', consequences: 'First offense: mandatory education; Second: probation; Third: suspension' },
  { id: 'sc-2', title: 'Harassment & Discrimination', severity: 'critical', description: 'Any form of harassment, discrimination, or bullying based on protected characteristics is strictly prohibited.', consequences: 'Investigation by Title IX office; sanctions up to expulsion' },
  { id: 'sc-3', title: 'Residential Life Standards', severity: 'minor', description: 'Quiet hours (10PM\u20138AM weekdays, 12AM\u20138AM weekends), guest policies, common area expectations.', consequences: 'Warning, fines, housing reassignment' },
  { id: 'sc-4', title: 'Property & Vandalism', severity: 'major', description: 'Damage to or theft of university or personal property is prohibited. Students are liable for damages.', consequences: 'Restitution + disciplinary action; criminal charges for theft' },
  { id: 'sc-5', title: 'Technology Acceptable Use', severity: 'minor', description: 'University network and computing resources must be used responsibly and legally.', consequences: 'Warning, account suspension, or disciplinary referral' },
  { id: 'sc-6', title: 'Hazing', severity: 'critical', description: 'Any form of hazing in connection with student organizations, athletics, or social groups is prohibited under university policy and state law.', consequences: 'Organization suspension/revocation; individual suspension/expulsion' },
];

// --- Conduct as Library Policies ---

const CONDUCT_POLICIES: LibraryPolicy[] = STUDENT_CONDUCT.map((c) => ({
  id: `lib-${c.id}`,
  title: c.title,
  category: 'conduct' as PolicyCategory,
  subcategory: c.severity,
  lastUpdated: 'Aug 2025',
  effectiveDate: 'Aug 15, 2025',
  version: '2.0',
  status: 'active' as const,
  summary: c.description,
  keyPoints: [`Severity: ${c.severity.toUpperCase()}`, `Consequences: ${c.consequences}`],
  appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'] as EducationRoleLens[],
  versionHistory: [{ version: '2.0', date: 'Aug 2025', change: 'Annual handbook update' }],
}));

// --- Safety Policies ---

const SAFETY_POLICIES: LibraryPolicy[] = [
  {
    id: 'sp-1',
    title: 'Emergency Action Plan',
    category: 'safety',
    subcategory: 'emergency',
    lastUpdated: 'Jan 2026',
    effectiveDate: 'Jan 1, 2026',
    version: '6.2',
    status: 'active',
    summary: 'Comprehensive emergency response procedures for natural disasters, active threats, chemical spills, and medical emergencies.',
    keyPoints: [
      'Evacuation routes posted in all buildings',
      'Annual active shooter training mandatory for all employees',
      'Emergency notification via text, email, and outdoor sirens',
      'Building marshals assigned per floor',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '6.2', date: 'Jan 2026', change: 'Updated building marshal assignments' },
      { version: '6.1', date: 'Aug 2025', change: 'Added chemical spill protocol' },
    ],
  },
  {
    id: 'sp-2',
    title: 'Clery Act Compliance & Campus Safety',
    category: 'safety',
    subcategory: 'clery',
    lastUpdated: 'Oct 2025',
    effectiveDate: 'Oct 1, 2025',
    version: '4.0',
    status: 'active',
    summary: 'Annual security report, crime statistics, timely warnings, and campus security authority reporting obligations.',
    keyPoints: [
      'Annual Security Report published by Oct 1 each year',
      'Campus Security Authorities (CSAs) must report all incidents',
      'Timely warnings issued for Clery-reportable crimes',
      'Daily crime log maintained and publicly available',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '4.0', date: 'Oct 2025', change: 'Updated CSA reporting procedures' },
    ],
  },
  {
    id: 'sp-3',
    title: 'Weapons & Firearms Policy',
    category: 'safety',
    subcategory: 'weapons',
    lastUpdated: 'Aug 2025',
    effectiveDate: 'Aug 15, 2025',
    version: '2.0',
    status: 'active',
    summary: 'Prohibits possession of firearms, explosives, and dangerous weapons on campus property with exceptions for authorized law enforcement.',
    keyPoints: [
      'No firearms on campus regardless of concealed carry permit',
      'Exceptions: campus police, authorized security, ROTC with approval',
      'Violations subject to immediate suspension and criminal charges',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '2.0', date: 'Aug 2025', change: 'Clarified ROTC exception language' },
    ],
  },
];

// --- IT Policies ---

const IT_POLICIES: LibraryPolicy[] = [
  {
    id: 'it-1',
    title: 'Acceptable Use Policy',
    category: 'it',
    subcategory: 'network',
    lastUpdated: 'Jan 2026',
    effectiveDate: 'Jan 13, 2026',
    version: '5.1',
    status: 'active',
    summary: 'Governs acceptable use of university computing resources, network access, and data handling.',
    keyPoints: [
      'No illegal downloads or unauthorized software on university devices',
      'Multi-factor authentication required for all accounts',
      'Suspicious activity must be reported to IT Security within 24 hours',
      'Personal devices on campus network must register via portal',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '5.1', date: 'Jan 2026', change: 'Added MFA requirement for all accounts' },
    ],
  },
  {
    id: 'it-2',
    title: 'Data Classification & Handling',
    category: 'it',
    subcategory: 'data',
    lastUpdated: 'Nov 2025',
    effectiveDate: 'Nov 1, 2025',
    version: '3.0',
    status: 'active',
    summary: 'Defines data classification levels (public, internal, confidential, restricted) and handling requirements.',
    keyPoints: [
      'Four classification levels: Public, Internal, Confidential, Restricted',
      'Student records classified as Restricted (FERPA)',
      'Encryption required for Confidential and Restricted data at rest and in transit',
      'Annual data handling training required for all staff',
    ],
    appliesToRoles: ['E1', 'E2', 'E3'],
    versionHistory: [
      { version: '3.0', date: 'Nov 2025', change: 'Added encryption requirements' },
    ],
  },
  {
    id: 'it-3',
    title: 'Incident Response Plan',
    category: 'it',
    subcategory: 'security',
    lastUpdated: 'Dec 2025',
    effectiveDate: 'Dec 1, 2025',
    version: '2.3',
    status: 'active',
    summary: 'Cybersecurity incident response procedures, breach notification requirements, and recovery protocols.',
    keyPoints: [
      'Incidents classified as P1 (critical), P2 (high), P3 (medium), P4 (low)',
      'P1 incidents: 15-minute response time, CISO notification',
      'Breach notification within 72 hours per state law',
      'Quarterly tabletop exercises for incident response team',
    ],
    appliesToRoles: ['E1', 'E2'],
    versionHistory: [
      { version: '2.3', date: 'Dec 2025', change: 'Updated breach notification timeline' },
    ],
  },
];

// --- Financial Policies ---

const FINANCIAL_POLICIES: LibraryPolicy[] = [
  {
    id: 'fp-1',
    title: 'Tuition Refund Policy',
    category: 'financial',
    subcategory: 'tuition',
    lastUpdated: 'Aug 2025',
    effectiveDate: 'Aug 15, 2025',
    version: '3.2',
    status: 'active',
    summary: 'Defines refund schedule for tuition and fees based on withdrawal timing.',
    keyPoints: [
      'Week 1: 100% refund; Week 2: 75%; Week 3: 50%; Week 4: 25%; After: 0%',
      'Financial aid adjusted proportionally per federal Return of Title IV Funds',
      'Housing refund separate from tuition refund',
      'Appeals for medical withdrawal processed by Bursar',
    ],
    appliesToRoles: ['E1', 'E2', 'E3', 'E4', 'E5'],
    versionHistory: [
      { version: '3.2', date: 'Aug 2025', change: 'Added medical withdrawal appeal process' },
    ],
  },
  {
    id: 'fp-2',
    title: 'Procurement & Purchasing Policy',
    category: 'financial',
    subcategory: 'procurement',
    lastUpdated: 'Sep 2025',
    effectiveDate: 'Sep 1, 2025',
    version: '4.1',
    status: 'active',
    summary: 'Governs purchasing authority, competitive bidding, sole-source justification, and vendor management.',
    keyPoints: [
      'Purchases >$5,000 require three quotes',
      'Purchases >$25,000 require formal RFP process',
      'Sole-source justification requires VP approval',
      'P-Card monthly limit: $5,000 per cardholder',
    ],
    appliesToRoles: ['E1', 'E2', 'E3'],
    versionHistory: [
      { version: '4.1', date: 'Sep 2025', change: 'Raised P-Card limit from $3,000 to $5,000' },
    ],
  },
];

// --- HR Policies ---

const HR_POLICIES: LibraryPolicy[] = [
  {
    id: 'hr-1',
    title: 'Equal Employment Opportunity',
    category: 'hr',
    subcategory: 'employment',
    lastUpdated: 'Aug 2025',
    effectiveDate: 'Aug 15, 2025',
    version: '5.0',
    status: 'active',
    summary: 'Westfield University is an equal opportunity employer committed to diversity and non-discrimination in all employment practices.',
    keyPoints: [
      'Non-discrimination in hiring, promotion, compensation, and termination',
      'Affirmative action plan reviewed annually',
      'Reasonable accommodations provided per ADA',
      'Complaints filed with HR or Title IX office',
    ],
    appliesToRoles: ['E1', 'E2', 'E3'],
    versionHistory: [
      { version: '5.0', date: 'Aug 2025', change: 'Updated protected class language' },
    ],
  },
];

// All library policies combined
const ALL_LIBRARY_POLICIES: LibraryPolicy[] = [
  ...ACADEMIC_POLICIES,
  ...CONDUCT_POLICIES,
  ...SAFETY_POLICIES,
  ...IT_POLICIES,
  ...FINANCIAL_POLICIES,
  ...HR_POLICIES,
];

// --- Title IX (from original) ---

interface TitleIXInfo {
  coordinator: string;
  office: string;
  phone: string;
  email: string;
  reportingUrl: string;
  trainingDeadline: string;
  casesPending: number;
  casesResolved: number;
  avgResolutionDays: number;
  keyProvisions: string[];
}

const TITLE_IX: TitleIXInfo = {
  coordinator: 'Dr. Angela Williams',
  office: 'Administration Building, Suite 150',
  phone: '(404) 555-9200',
  email: 'titleix@westfield.edu',
  reportingUrl: 'westfield.edu/title-ix/report',
  trainingDeadline: 'Mar 31, 2026',
  casesPending: 4,
  casesResolved: 18,
  avgResolutionDays: 62,
  keyProvisions: [
    'Prohibition of sex-based discrimination in all educational programs',
    'Equal opportunity in athletics',
    'Protection against sexual harassment and violence',
    'Mandatory reporting by all employees (except confidential resources)',
    'Available formal and informal resolution processes',
    'Retaliation protection for reporters and participants',
  ],
};

// --- FERPA (from original) ---

interface FERPAInfo {
  status: string;
  lastTraining: string;
  complianceRate: number;
  keyRights: string[];
  directoryInfoOptOut: string;
}

const FERPA: FERPAInfo = {
  status: 'Compliant',
  lastTraining: 'Jan 2026',
  complianceRate: 96,
  keyRights: [
    'Right to inspect and review education records',
    'Right to request amendment of inaccurate records',
    'Right to consent to disclosure of personally identifiable information',
    'Right to file a complaint with the U.S. Department of Education',
    'Directory information may be released without consent unless student opts out',
  ],
  directoryInfoOptOut: 'Students may opt out of directory information disclosure by submitting form to the Registrar\'s Office by the end of the first week of classes each semester.',
};

// --- Accreditation Docs (from original) ---

interface AccreditationDoc {
  id: string;
  title: string;
  body: string;
  type: 'report' | 'self-study' | 'letter' | 'response' | 'plan';
  date: string;
  status: 'published' | 'draft' | 'internal';
  pages: number;
}

const ACCREDITATION_DOCS: AccreditationDoc[] = [
  { id: 'acd-1', title: 'SACSCOC Compliance Certification', body: 'SACSCOC', type: 'report', date: 'Mar 2024', status: 'published', pages: 245 },
  { id: 'acd-2', title: 'SACSCOC QEP: Student Success Initiative', body: 'SACSCOC', type: 'self-study', date: 'Mar 2024', status: 'published', pages: 82 },
  { id: 'acd-3', title: 'ABET Self-Study Report (COE)', body: 'ABET', type: 'self-study', date: 'Oct 2023', status: 'published', pages: 180 },
  { id: 'acd-4', title: 'AACSB Continuous Improvement Review', body: 'AACSB', type: 'report', date: 'Jun 2022', status: 'published', pages: 120 },
  { id: 'acd-5', title: 'ABA Site Visit Response', body: 'ABA', type: 'response', date: 'Jun 2025', status: 'internal', pages: 45 },
  { id: 'acd-6', title: 'Strategic Plan for Law School Improvement', body: 'ABA', type: 'plan', date: 'Sep 2025', status: 'internal', pages: 32 },
  { id: 'acd-7', title: 'SACSCOC Fifth-Year Report (Draft)', body: 'SACSCOC', type: 'report', date: 'Feb 2026', status: 'draft', pages: 0 },
];

// --- Grievance Procedures (from original) ---

interface GrievanceProcedure {
  id: string;
  type: string;
  description: string;
  steps: string[];
  timeline: string;
  contactOffice: string;
}

const GRIEVANCE_PROCEDURES: GrievanceProcedure[] = [
  {
    id: 'gp-1',
    type: 'Academic Grade Appeal',
    description: 'Process for students to appeal a final course grade they believe was assigned in error or unfairly.',
    steps: ['Discuss with instructor (within 10 days)', 'Written appeal to department chair', 'Appeal to college dean', 'Final appeal to Provost'],
    timeline: '30\u201360 days',
    contactOffice: 'Academic Affairs',
  },
  {
    id: 'gp-2',
    type: 'Student Conduct Appeal',
    description: 'Process for appealing disciplinary sanctions imposed through the student conduct process.',
    steps: ['Written appeal to Dean of Students (within 5 days)', 'Appeals board hearing', 'VP of Student Affairs decision (final)'],
    timeline: '14\u201330 days',
    contactOffice: 'Student Affairs',
  },
  {
    id: 'gp-3',
    type: 'Discrimination & Harassment',
    description: 'Process for reporting and resolving complaints of discrimination, harassment, or retaliation.',
    steps: ['File report with Title IX office or online', 'Initial assessment and supportive measures', 'Formal investigation (if applicable)', 'Hearing and determination', 'Appeal (if applicable)'],
    timeline: '60\u201390 days',
    contactOffice: 'Title IX Office',
  },
  {
    id: 'gp-4',
    type: 'ADA/Accessibility Complaint',
    description: 'Process for reporting accessibility barriers or requesting disability accommodation review.',
    steps: ['Contact Disability Services office', 'Informal resolution attempt', 'Formal complaint to 504 Coordinator', 'External complaint to OCR (if unresolved)'],
    timeline: '15\u201345 days',
    contactOffice: 'Disability Services',
  },
  {
    id: 'gp-5',
    type: 'Financial Aid Appeal',
    description: 'Process for appealing financial aid decisions, SAP status, or requesting professional judgment.',
    steps: ['Submit SAP appeal form with documentation', 'Review by Financial Aid Appeals Committee', 'Decision notification within 2 weeks'],
    timeline: '14\u201321 days',
    contactOffice: 'Financial Aid',
  },
];

// =============================================================================
// MOCK DATA — ACKNOWLEDGEMENTS
// =============================================================================

interface AcknowledgementPolicy {
  id: string;
  policyTitle: string;
  requiredBy: string;
  dueDate: string;
  totalRequired: number;
  completed: number;
  byDepartment: { name: string; completed: number; total: number }[];
  byRole: { role: string; completed: number; total: number }[];
}

const ACKNOWLEDGEMENTS: AcknowledgementPolicy[] = [
  {
    id: 'ack-1',
    policyTitle: 'FERPA Training & Acknowledgement',
    requiredBy: 'All Employees',
    dueDate: 'Mar 31, 2026',
    totalRequired: 1842,
    completed: 1768,
    byDepartment: [
      { name: 'Academic Affairs', completed: 412, total: 420 },
      { name: 'Student Affairs', completed: 186, total: 190 },
      { name: 'Information Technology', completed: 84, total: 88 },
      { name: 'Athletics', completed: 42, total: 48 },
      { name: 'Finance & Admin', completed: 120, total: 124 },
      { name: 'Other Departments', completed: 924, total: 972 },
    ],
    byRole: [
      { role: 'Faculty', completed: 682, total: 710 },
      { role: 'Staff', completed: 824, total: 862 },
      { role: 'Administrators', completed: 262, total: 270 },
    ],
  },
  {
    id: 'ack-2',
    policyTitle: 'Title IX Training',
    requiredBy: 'All Employees',
    dueDate: 'Mar 31, 2026',
    totalRequired: 1842,
    completed: 1624,
    byDepartment: [
      { name: 'Academic Affairs', completed: 388, total: 420 },
      { name: 'Student Affairs', completed: 178, total: 190 },
      { name: 'Information Technology', completed: 72, total: 88 },
      { name: 'Athletics', completed: 48, total: 48 },
      { name: 'Finance & Admin', completed: 108, total: 124 },
      { name: 'Other Departments', completed: 830, total: 972 },
    ],
    byRole: [
      { role: 'Faculty', completed: 628, total: 710 },
      { role: 'Staff', completed: 742, total: 862 },
      { role: 'Administrators', completed: 254, total: 270 },
    ],
  },
  {
    id: 'ack-3',
    policyTitle: 'Academic Integrity Policy',
    requiredBy: 'All Students',
    dueDate: 'Feb 15, 2026',
    totalRequired: 12847,
    completed: 11420,
    byDepartment: [
      { name: 'Engineering', completed: 2680, total: 2840 },
      { name: 'Arts & Sciences', completed: 3820, total: 4210 },
      { name: 'Business', completed: 1940, total: 2120 },
      { name: 'Education', completed: 1280, total: 1440 },
      { name: 'Other Colleges', completed: 1700, total: 2237 },
    ],
    byRole: [
      { role: 'Undergraduate', completed: 9240, total: 10420 },
      { role: 'Graduate', completed: 1880, total: 2027 },
      { role: 'Professional', completed: 300, total: 400 },
    ],
  },
  {
    id: 'ack-4',
    policyTitle: 'Emergency Action Plan',
    requiredBy: 'All Faculty & Staff',
    dueDate: 'Jan 31, 2026',
    totalRequired: 1842,
    completed: 1790,
    byDepartment: [
      { name: 'Academic Affairs', completed: 416, total: 420 },
      { name: 'Student Affairs', completed: 188, total: 190 },
      { name: 'Facilities', completed: 62, total: 62 },
      { name: 'Other Departments', completed: 1124, total: 1170 },
    ],
    byRole: [
      { role: 'Faculty', completed: 698, total: 710 },
      { role: 'Staff', completed: 832, total: 862 },
      { role: 'Administrators', completed: 260, total: 270 },
    ],
  },
  {
    id: 'ack-5',
    policyTitle: 'Data Classification & Handling',
    requiredBy: 'All Staff with Data Access',
    dueDate: 'Apr 30, 2026',
    totalRequired: 948,
    completed: 612,
    byDepartment: [
      { name: 'Information Technology', completed: 88, total: 88 },
      { name: 'Registrar', completed: 34, total: 42 },
      { name: 'Financial Aid', completed: 28, total: 36 },
      { name: 'Admissions', completed: 44, total: 52 },
      { name: 'Other Departments', completed: 418, total: 730 },
    ],
    byRole: [
      { role: 'IT Staff', completed: 88, total: 88 },
      { role: 'Administrative Staff', completed: 324, total: 480 },
      { role: 'Student Workers', completed: 200, total: 380 },
    ],
  },
];

// =============================================================================
// MOCK DATA — POLICY UPDATES
// =============================================================================

interface PolicyUpdate {
  id: string;
  policyTitle: string;
  changeType: 'new' | 'major_revision' | 'minor_update' | 'review_scheduled';
  previousVersion: string;
  newVersion: string;
  effectiveDate: string;
  publishedDate: string;
  changeSummary: string;
  changeDetails: string[];
  reviewedBy: string;
  nextReviewDate: string;
}

const POLICY_UPDATES: PolicyUpdate[] = [
  {
    id: 'pu-1',
    policyTitle: 'Academic Integrity Policy — AI Content Addendum',
    changeType: 'major_revision',
    previousVersion: '4.2',
    newVersion: '5.0-rc',
    effectiveDate: 'Pending Approval',
    publishedDate: 'Jan 15, 2026',
    changeSummary: 'Major revision to address AI-generated content in academic work. Adds definitions, permitted use categories, and disclosure requirements.',
    changeDetails: [
      'Defines AI-generated content and AI-assisted work',
      'Establishes three categories: Prohibited, Permitted with Disclosure, Unrestricted',
      'Requires syllabus-level AI policy statement from each instructor',
      'Updates plagiarism definition to include undisclosed AI content',
      'Adds mandatory AI literacy module to academic integrity workshop',
    ],
    reviewedBy: 'Faculty Senate Academic Standards Committee',
    nextReviewDate: 'Aug 2026',
  },
  {
    id: 'pu-2',
    policyTitle: 'Acceptable Use Policy',
    changeType: 'minor_update',
    previousVersion: '5.0',
    newVersion: '5.1',
    effectiveDate: 'Jan 13, 2026',
    publishedDate: 'Dec 20, 2025',
    changeSummary: 'Added multi-factor authentication mandate and updated personal device registration requirements.',
    changeDetails: [
      'MFA now required for all university accounts (previously optional for students)',
      'Updated BYOD registration portal URL',
      'Added unauthorized VPN usage clause',
    ],
    reviewedBy: 'Chief Information Security Officer',
    nextReviewDate: 'Jan 2027',
  },
  {
    id: 'pu-3',
    policyTitle: 'Emergency Action Plan',
    changeType: 'minor_update',
    previousVersion: '6.1',
    newVersion: '6.2',
    effectiveDate: 'Jan 1, 2026',
    publishedDate: 'Dec 15, 2025',
    changeSummary: 'Updated building marshal assignments for new construction and renovated facilities.',
    changeDetails: [
      'Added Science Complex II marshals (3 new assignments)',
      'Updated evacuation routes for renovated Student Union',
      'Added drone emergency response protocol (Appendix G)',
    ],
    reviewedBy: 'VP Campus Safety',
    nextReviewDate: 'Jul 2026',
  },
  {
    id: 'pu-4',
    policyTitle: 'Student Mental Health & Wellness Policy',
    changeType: 'new',
    previousVersion: 'N/A',
    newVersion: '1.0',
    effectiveDate: 'Feb 1, 2026',
    publishedDate: 'Jan 28, 2026',
    changeSummary: 'New comprehensive policy addressing student mental health support, crisis intervention, and faculty reporting obligations.',
    changeDetails: [
      'Establishes mandatory mental health first aid training for RAs',
      'Creates after-hours crisis support hotline (24/7)',
      'Defines faculty reporting pathway for students in distress',
      'Allocates 5 excused "wellness days" per semester per student',
      'Partners with 3 local mental health providers for overflow referrals',
    ],
    reviewedBy: 'VP Student Affairs + Counseling Center Director',
    nextReviewDate: 'Feb 2027',
  },
  {
    id: 'pu-5',
    policyTitle: 'Data Classification & Handling',
    changeType: 'major_revision',
    previousVersion: '2.1',
    newVersion: '3.0',
    effectiveDate: 'Nov 1, 2025',
    publishedDate: 'Oct 15, 2025',
    changeSummary: 'Added encryption requirements for confidential and restricted data; expanded classification taxonomy.',
    changeDetails: [
      'Encryption at rest and in transit now mandatory for Confidential and Restricted data',
      'Added "Research Sensitive" sub-classification',
      'Updated retention schedules for financial records',
      'New vendor data handling agreement template (Appendix C)',
    ],
    reviewedBy: 'Chief Information Security Officer + General Counsel',
    nextReviewDate: 'Nov 2026',
  },
  {
    id: 'pu-6',
    policyTitle: 'Tuition Refund Policy',
    changeType: 'review_scheduled',
    previousVersion: '3.2',
    newVersion: '3.2',
    effectiveDate: 'Aug 15, 2025',
    publishedDate: 'Jul 1, 2025',
    changeSummary: 'Scheduled triennial review. No changes anticipated but committee review required for accreditation.',
    changeDetails: ['Review committee formed: Provost, VP Finance, Registrar, SGA representative', 'Public comment period: Mar 1 \u2013 Mar 31, 2026'],
    reviewedBy: 'Policy Review Committee',
    nextReviewDate: 'Apr 2026',
  },
];

const CHANGE_TYPE_COLOR: Record<string, string> = {
  new: '#22C55E',
  major_revision: '#F59E0B',
  minor_update: '#3B82F6',
  review_scheduled: '#8B5CF6',
};

const CHANGE_TYPE_LABEL: Record<string, string> = {
  new: 'NEW',
  major_revision: 'MAJOR REVISION',
  minor_update: 'MINOR UPDATE',
  review_scheduled: 'REVIEW SCHEDULED',
};

// =============================================================================
// MOCK DATA — ENFORCEMENT
// =============================================================================

interface EnforcementAction {
  id: string;
  caseNumber: string;
  policyViolated: string;
  category: 'academic' | 'conduct' | 'title_ix' | 'safety' | 'hr';
  status: 'active' | 'resolved' | 'appeal_pending' | 'under_investigation';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  dateOpened: string;
  dateClosed?: string;
  sanction?: string;
  respondentType: 'student' | 'faculty' | 'staff';
  description: string;
  investigator: string;
}

const ENFORCEMENT_ACTIONS: EnforcementAction[] = [
  {
    id: 'enf-1',
    caseNumber: 'AC-2026-0042',
    policyViolated: 'Academic Integrity Policy',
    category: 'academic',
    status: 'resolved',
    severity: 'moderate',
    dateOpened: 'Jan 22, 2026',
    dateClosed: 'Feb 8, 2026',
    sanction: 'Zero on assignment + academic integrity workshop',
    respondentType: 'student',
    description: 'Plagiarism detected via Turnitin in ENGL 201 research paper. First offense.',
    investigator: 'Dr. Mia Torres',
  },
  {
    id: 'enf-2',
    caseNumber: 'CD-2026-0018',
    policyViolated: 'Alcohol & Drug Policy',
    category: 'conduct',
    status: 'active',
    severity: 'high',
    dateOpened: 'Feb 2, 2026',
    sanction: 'Pending hearing',
    respondentType: 'student',
    description: 'Distribution of controlled substance in residence hall. Second offense for respondent.',
    investigator: 'Dean James Walker',
  },
  {
    id: 'enf-3',
    caseNumber: 'TX-2026-0007',
    policyViolated: 'Title IX — Sexual Harassment',
    category: 'title_ix',
    status: 'under_investigation',
    severity: 'critical',
    dateOpened: 'Jan 28, 2026',
    respondentType: 'faculty',
    description: 'Formal complaint of sexual harassment filed. Investigation in progress.',
    investigator: 'Dr. Angela Williams',
  },
  {
    id: 'enf-4',
    caseNumber: 'AC-2026-0039',
    policyViolated: 'Academic Integrity Policy',
    category: 'academic',
    status: 'appeal_pending',
    severity: 'high',
    dateOpened: 'Jan 15, 2026',
    sanction: 'Course failure + academic record notation',
    respondentType: 'student',
    description: 'Second academic integrity offense. Student appealing course failure sanction to Dean.',
    investigator: 'Dr. Mia Torres',
  },
  {
    id: 'enf-5',
    caseNumber: 'SF-2026-0003',
    policyViolated: 'Emergency Action Plan',
    category: 'safety',
    status: 'resolved',
    severity: 'moderate',
    dateOpened: 'Jan 10, 2026',
    dateClosed: 'Jan 18, 2026',
    sanction: 'Written warning + mandatory training',
    respondentType: 'staff',
    description: 'Facilities staff failed to follow chemical spill containment protocol. No injuries.',
    investigator: 'VP Campus Safety',
  },
  {
    id: 'enf-6',
    caseNumber: 'HR-2026-0012',
    policyViolated: 'Equal Employment Opportunity',
    category: 'hr',
    status: 'under_investigation',
    severity: 'high',
    dateOpened: 'Feb 5, 2026',
    respondentType: 'staff',
    description: 'Complaint of discriminatory hiring practices in department chair search.',
    investigator: 'Director of HR',
  },
  {
    id: 'enf-7',
    caseNumber: 'CD-2026-0021',
    policyViolated: 'Hazing',
    category: 'conduct',
    status: 'active',
    severity: 'critical',
    dateOpened: 'Feb 10, 2026',
    respondentType: 'student',
    description: 'Hazing allegations involving Greek-letter organization during recruitment. Organization activities suspended pending investigation.',
    investigator: 'Dean James Walker',
  },
];

const ENFORCEMENT_STATUS_COLOR: Record<string, string> = {
  active: '#F59E0B',
  resolved: '#22C55E',
  appeal_pending: '#3B82F6',
  under_investigation: '#EF4444',
};

const ENFORCEMENT_SEVERITY_COLOR: Record<string, string> = {
  low: '#8F8F8F',
  moderate: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

// =============================================================================
// MOCK DATA — COMPLIANCE DASHBOARD
// =============================================================================

interface ComplianceArea {
  id: string;
  name: string;
  icon: string;
  status: 'compliant' | 'at_risk' | 'non_compliant' | 'under_review';
  score: number;
  lastAudit: string;
  nextAudit: string;
  openFindings: number;
  closedFindings: number;
  trainingCompletion: number;
  keyMetrics: { label: string; value: string; status: 'good' | 'warn' | 'bad' }[];
}

const COMPLIANCE_AREAS: ComplianceArea[] = [
  {
    id: 'comp-1',
    name: 'FERPA',
    icon: 'lock.shield.fill',
    status: 'compliant',
    score: 96,
    lastAudit: 'Nov 2025',
    nextAudit: 'Nov 2026',
    openFindings: 1,
    closedFindings: 8,
    trainingCompletion: 96,
    keyMetrics: [
      { label: 'Employee Training', value: '96%', status: 'good' },
      { label: 'Breach Incidents (YTD)', value: '0', status: 'good' },
      { label: 'Pending Access Audits', value: '2', status: 'warn' },
      { label: 'Opt-Out Requests', value: '342', status: 'good' },
    ],
  },
  {
    id: 'comp-2',
    name: 'Title IX',
    icon: 'exclamationmark.triangle.fill',
    status: 'compliant',
    score: 88,
    lastAudit: 'Sep 2025',
    nextAudit: 'Sep 2026',
    openFindings: 4,
    closedFindings: 18,
    trainingCompletion: 88,
    keyMetrics: [
      { label: 'Employee Training', value: '88%', status: 'warn' },
      { label: 'Cases Pending', value: '4', status: 'warn' },
      { label: 'Avg Resolution (days)', value: '62', status: 'warn' },
      { label: 'Coordinator Staffing', value: '3 / 3', status: 'good' },
    ],
  },
  {
    id: 'comp-3',
    name: 'Clery Act',
    icon: 'shield.fill',
    status: 'compliant',
    score: 94,
    lastAudit: 'Oct 2025',
    nextAudit: 'Oct 2026',
    openFindings: 0,
    closedFindings: 3,
    trainingCompletion: 92,
    keyMetrics: [
      { label: 'CSA Training', value: '92%', status: 'good' },
      { label: 'Timely Warnings Issued', value: '2', status: 'good' },
      { label: 'Annual Report Published', value: 'Yes', status: 'good' },
      { label: 'Daily Crime Log', value: 'Current', status: 'good' },
    ],
  },
  {
    id: 'comp-4',
    name: 'ADA / Section 504',
    icon: 'figure.roll',
    status: 'at_risk',
    score: 78,
    lastAudit: 'Aug 2025',
    nextAudit: 'Aug 2026',
    openFindings: 6,
    closedFindings: 12,
    trainingCompletion: 74,
    keyMetrics: [
      { label: 'Buildings Accessible', value: '42 / 48', status: 'warn' },
      { label: 'Web Accessibility (WCAG)', value: 'Partial', status: 'bad' },
      { label: 'Accommodation Requests', value: '284', status: 'good' },
      { label: 'Open Complaints', value: '3', status: 'warn' },
    ],
  },
  {
    id: 'comp-5',
    name: 'SACSCOC',
    icon: 'checkmark.seal.fill',
    status: 'compliant',
    score: 92,
    lastAudit: 'Mar 2024',
    nextAudit: 'Mar 2029',
    openFindings: 2,
    closedFindings: 5,
    trainingCompletion: 100,
    keyMetrics: [
      { label: 'Standards Met', value: '82 / 84', status: 'good' },
      { label: 'QEP Status', value: 'Year 2 of 5', status: 'good' },
      { label: 'Fifth-Year Report', value: 'Drafting', status: 'warn' },
      { label: 'Accreditation Status', value: 'Full', status: 'good' },
    ],
  },
];

const COMPLIANCE_STATUS_COLOR: Record<string, string> = {
  compliant: '#22C55E',
  at_risk: '#F59E0B',
  non_compliant: '#EF4444',
  under_review: '#3B82F6',
};

interface AuditItem {
  id: string;
  name: string;
  area: string;
  status: 'completed' | 'in_progress' | 'scheduled' | 'overdue';
  date: string;
  findings: number;
}

const AUDIT_SCHEDULE: AuditItem[] = [
  { id: 'aud-1', name: 'FERPA Compliance Audit', area: 'FERPA', status: 'scheduled', date: 'Nov 2026', findings: 0 },
  { id: 'aud-2', name: 'Title IX Program Review', area: 'Title IX', status: 'scheduled', date: 'Sep 2026', findings: 0 },
  { id: 'aud-3', name: 'ADA Accessibility Assessment', area: 'ADA', status: 'in_progress', date: 'Mar 2026', findings: 3 },
  { id: 'aud-4', name: 'IT Security Audit', area: 'IT', status: 'completed', date: 'Dec 2025', findings: 4 },
  { id: 'aud-5', name: 'Financial Aid (Title IV)', area: 'Financial', status: 'scheduled', date: 'Jun 2026', findings: 0 },
  { id: 'aud-6', name: 'NCAA Compliance Review', area: 'Athletics', status: 'completed', date: 'Oct 2025', findings: 1 },
];

const AUDIT_STATUS_COLOR: Record<string, string> = {
  completed: '#22C55E',
  in_progress: '#3B82F6',
  scheduled: '#8F8F8F',
  overdue: '#EF4444',
};

// =============================================================================
// MOCK DATA — POLICY PACKS
// =============================================================================

interface PolicyPack {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  icon: string;
  totalPolicies: number;
  requiredReadings: { id: string; title: string; category: PolicyCategory; required: boolean; estimatedMinutes: number; acknowledged: boolean }[];
  completionRate: number;
  dueDate: string;
}

const POLICY_PACKS: PolicyPack[] = [
  {
    id: 'pack-1',
    name: 'Student Pack',
    description: 'Essential policies every student must read and acknowledge before the start of each academic year.',
    targetRole: 'Students',
    icon: 'graduationcap.fill',
    totalPolicies: 8,
    requiredReadings: [
      { id: 'pr-1', title: 'Academic Integrity Policy', category: 'academic', required: true, estimatedMinutes: 15, acknowledged: true },
      { id: 'pr-2', title: 'Attendance Policy', category: 'academic', required: true, estimatedMinutes: 8, acknowledged: true },
      { id: 'pr-3', title: 'Alcohol & Drug Policy', category: 'conduct', required: true, estimatedMinutes: 10, acknowledged: false },
      { id: 'pr-4', title: 'Harassment & Discrimination', category: 'conduct', required: true, estimatedMinutes: 12, acknowledged: true },
      { id: 'pr-5', title: 'Residential Life Standards', category: 'conduct', required: true, estimatedMinutes: 8, acknowledged: false },
      { id: 'pr-6', title: 'Technology Acceptable Use', category: 'it', required: true, estimatedMinutes: 10, acknowledged: true },
      { id: 'pr-7', title: 'Emergency Action Plan', category: 'safety', required: true, estimatedMinutes: 12, acknowledged: true },
      { id: 'pr-8', title: 'FERPA Student Rights', category: 'academic', required: true, estimatedMinutes: 8, acknowledged: false },
    ],
    completionRate: 62,
    dueDate: 'Feb 28, 2026',
  },
  {
    id: 'pack-2',
    name: 'Faculty Pack',
    description: 'Comprehensive policy bundle for all teaching faculty including academic, compliance, and HR policies.',
    targetRole: 'Faculty',
    icon: 'person.text.rectangle.fill',
    totalPolicies: 12,
    requiredReadings: [
      { id: 'pr-10', title: 'Academic Integrity Policy', category: 'academic', required: true, estimatedMinutes: 15, acknowledged: true },
      { id: 'pr-11', title: 'FERPA Training', category: 'academic', required: true, estimatedMinutes: 30, acknowledged: true },
      { id: 'pr-12', title: 'Title IX Training', category: 'conduct', required: true, estimatedMinutes: 45, acknowledged: true },
      { id: 'pr-13', title: 'Equal Employment Opportunity', category: 'hr', required: true, estimatedMinutes: 20, acknowledged: true },
      { id: 'pr-14', title: 'Data Classification & Handling', category: 'it', required: true, estimatedMinutes: 15, acknowledged: false },
      { id: 'pr-15', title: 'Emergency Action Plan', category: 'safety', required: true, estimatedMinutes: 12, acknowledged: true },
      { id: 'pr-16', title: 'Grading Policy', category: 'academic', required: true, estimatedMinutes: 10, acknowledged: true },
      { id: 'pr-17', title: 'Attendance Policy', category: 'academic', required: true, estimatedMinutes: 8, acknowledged: true },
      { id: 'pr-18', title: 'Clery Act Awareness', category: 'safety', required: true, estimatedMinutes: 20, acknowledged: false },
      { id: 'pr-19', title: 'Acceptable Use Policy', category: 'it', required: true, estimatedMinutes: 10, acknowledged: true },
      { id: 'pr-20', title: 'Weapons & Firearms Policy', category: 'safety', required: true, estimatedMinutes: 5, acknowledged: true },
      { id: 'pr-21', title: 'Incident Response Plan', category: 'it', required: false, estimatedMinutes: 15, acknowledged: false },
    ],
    completionRate: 75,
    dueDate: 'Mar 15, 2026',
  },
  {
    id: 'pack-3',
    name: 'Staff Pack',
    description: 'Required policies for all non-teaching staff including operations, compliance, and safety policies.',
    targetRole: 'Staff',
    icon: 'person.crop.rectangle.fill',
    totalPolicies: 10,
    requiredReadings: [
      { id: 'pr-30', title: 'FERPA Training', category: 'academic', required: true, estimatedMinutes: 30, acknowledged: true },
      { id: 'pr-31', title: 'Title IX Training', category: 'conduct', required: true, estimatedMinutes: 45, acknowledged: true },
      { id: 'pr-32', title: 'Equal Employment Opportunity', category: 'hr', required: true, estimatedMinutes: 20, acknowledged: true },
      { id: 'pr-33', title: 'Data Classification & Handling', category: 'it', required: true, estimatedMinutes: 15, acknowledged: true },
      { id: 'pr-34', title: 'Emergency Action Plan', category: 'safety', required: true, estimatedMinutes: 12, acknowledged: true },
      { id: 'pr-35', title: 'Procurement & Purchasing', category: 'financial', required: true, estimatedMinutes: 15, acknowledged: false },
      { id: 'pr-36', title: 'Acceptable Use Policy', category: 'it', required: true, estimatedMinutes: 10, acknowledged: true },
      { id: 'pr-37', title: 'Clery Act Awareness', category: 'safety', required: true, estimatedMinutes: 20, acknowledged: false },
      { id: 'pr-38', title: 'Weapons & Firearms Policy', category: 'safety', required: true, estimatedMinutes: 5, acknowledged: true },
      { id: 'pr-39', title: 'Incident Response Plan', category: 'it', required: false, estimatedMinutes: 15, acknowledged: false },
    ],
    completionRate: 70,
    dueDate: 'Mar 15, 2026',
  },
  {
    id: 'pack-4',
    name: 'New Hire Orientation Pack',
    description: 'Day-one required reading for all new employees. Must be completed within first 30 days of employment.',
    targetRole: 'New Hires',
    icon: 'person.badge.plus',
    totalPolicies: 6,
    requiredReadings: [
      { id: 'pr-40', title: 'Equal Employment Opportunity', category: 'hr', required: true, estimatedMinutes: 20, acknowledged: false },
      { id: 'pr-41', title: 'FERPA Overview', category: 'academic', required: true, estimatedMinutes: 15, acknowledged: false },
      { id: 'pr-42', title: 'Title IX Overview', category: 'conduct', required: true, estimatedMinutes: 20, acknowledged: false },
      { id: 'pr-43', title: 'Acceptable Use Policy', category: 'it', required: true, estimatedMinutes: 10, acknowledged: false },
      { id: 'pr-44', title: 'Emergency Action Plan', category: 'safety', required: true, estimatedMinutes: 12, acknowledged: false },
      { id: 'pr-45', title: 'Harassment & Discrimination', category: 'conduct', required: true, estimatedMinutes: 15, acknowledged: false },
    ],
    completionRate: 0,
    dueDate: '30 days from start',
  },
];

// =============================================================================
// SHARED CONSTANTS
// =============================================================================

const POLICY_CATEGORY_LABEL: Record<string, string> = {
  academic: 'Academic',
  conduct: 'Conduct',
  safety: 'Safety',
  hr: 'HR',
  it: 'IT',
  financial: 'Financial',
};

const POLICY_CATEGORY_COLOR: Record<string, string> = {
  academic: '#3B82F6',
  conduct: '#F97316',
  safety: '#EF4444',
  hr: '#8B5CF6',
  it: '#06B6D4',
  financial: '#22C55E',
};

const POLICY_STATUS_COLOR: Record<string, string> = {
  active: '#22C55E',
  draft: '#3B82F6',
  under_review: '#F59E0B',
  archived: '#8F8F8F',
};

const SEVERITY_COLOR: Record<string, string> = {
  minor: '#F59E0B',
  major: '#F97316',
  critical: '#EF4444',
};

const DOC_STATUS_COLOR: Record<string, string> = {
  published: '#22C55E',
  draft: '#3B82F6',
  internal: '#F59E0B',
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count }: { title: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={shrd.headerRow}>
      <ThemedText style={[shrd.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      {count != null && (
        <View style={[shrd.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[shrd.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
        </View>
      )}
    </View>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[shrd.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function StatBox({ label, value, colors, valueColor }: { label: string; value: string; colors: typeof Colors.light; valueColor?: string }) {
  return (
    <View style={shrd.statBox}>
      <ThemedText style={[shrd.statValue, { color: valueColor || colors.text }]}>{value}</ThemedText>
      <ThemedText style={[shrd.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function ProgressBar({ percentage, color, colors }: { percentage: number; color: string; colors: typeof Colors.light }) {
  return (
    <View style={[shrd.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
      <View style={[shrd.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

const shrd = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});

// =============================================================================
// VIEW: POLICY LIBRARY
// =============================================================================

function PolicyLibraryView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PolicyCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories: (PolicyCategory | 'all')[] = ['all', 'academic', 'conduct', 'safety', 'hr', 'it', 'financial'];

  const visiblePolicies = ALL_LIBRARY_POLICIES.filter((p) => {
    if (p.status === 'draft' && !isDeanLevel(role)) return false;
    if (!p.appliesToRoles.includes(role)) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || p.category.includes(q);
    }
    return true;
  });

  return (
    <View>
      {/* Search bar */}
      <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={14} color={colors.textTertiary} />
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder="Search policies..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <IconSymbol name="xmark.circle.fill" size={14} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterRowContent}>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[
              s.filterPill,
              {
                backgroundColor: categoryFilter === cat ? (cat === 'all' ? colors.text + '15' : (POLICY_CATEGORY_COLOR[cat] || colors.text) + '20') : 'transparent',
                borderColor: categoryFilter === cat ? (cat === 'all' ? colors.text + '30' : (POLICY_CATEGORY_COLOR[cat] || colors.text) + '40') : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCategoryFilter(cat);
            }}
          >
            <ThemedText style={[s.filterPillText, { color: categoryFilter === cat ? (cat === 'all' ? colors.text : POLICY_CATEGORY_COLOR[cat] || colors.text) : colors.textSecondary }]}>
              {cat === 'all' ? 'All' : POLICY_CATEGORY_LABEL[cat] || cat}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results count */}
      <ThemedText style={[s.resultCount, { color: colors.textTertiary }]}>
        {visiblePolicies.length} {visiblePolicies.length === 1 ? 'policy' : 'policies'}
      </ThemedText>

      {/* Policy cards */}
      <Card colors={colors}>
        {visiblePolicies.length === 0 ? (
          <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No policies match your search.</ThemedText>
        ) : (
          visiblePolicies.map((policy, idx) => {
            const isExpanded = expandedId === policy.id;
            return (
              <Pressable
                key={policy.id}
                style={[
                  s.policyRow,
                  idx < visiblePolicies.length - 1 && !isExpanded && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedId(isExpanded ? null : policy.id);
                }}
              >
                <View style={s.policyHeader}>
                  <View style={s.policyLeft}>
                    <ThemedText style={[s.policyTitle, { color: colors.text }]} numberOfLines={isExpanded ? undefined : 1}>
                      {policy.title}
                    </ThemedText>
                    <View style={s.policyBadgeRow}>
                      <View style={[s.categoryBadge, { backgroundColor: (POLICY_CATEGORY_COLOR[policy.category] || '#8F8F8F') + '20' }]}>
                        <ThemedText style={[s.categoryText, { color: POLICY_CATEGORY_COLOR[policy.category] || '#8F8F8F' }]}>
                          {POLICY_CATEGORY_LABEL[policy.category] || policy.category}
                        </ThemedText>
                      </View>
                      <View style={[s.statusBadge, { backgroundColor: POLICY_STATUS_COLOR[policy.status] + '20' }]}>
                        <View style={[s.statusDot, { backgroundColor: POLICY_STATUS_COLOR[policy.status] }]} />
                        <ThemedText style={[s.statusText, { color: POLICY_STATUS_COLOR[policy.status] }]}>
                          {policy.status.replace('_', ' ').toUpperCase()}
                        </ThemedText>
                      </View>
                      <ThemedText style={[s.versionBadge, { color: colors.textTertiary }]}>v{policy.version}</ThemedText>
                    </View>
                  </View>
                  <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down' as any} size={12} color={colors.textTertiary} />
                </View>

                {isExpanded && (
                  <View style={s.policyExpanded}>
                    <ThemedText style={[s.policySummary, { color: colors.textSecondary }]}>{policy.summary}</ThemedText>

                    <ThemedText style={[s.policyPointsLabel, { color: colors.text }]}>Key Points:</ThemedText>
                    {policy.keyPoints.map((point, i) => (
                      <View key={i} style={s.policyPointRow}>
                        <ThemedText style={[s.policyBullet, { color: colors.textSecondary }]}>{'\u2022'}</ThemedText>
                        <ThemedText style={[s.policyPointText, { color: colors.textSecondary }]}>{point}</ThemedText>
                      </View>
                    ))}

                    {policy.versionHistory.length > 0 && isFacultyLevel(role) && (
                      <View style={s.versionSection}>
                        <ThemedText style={[s.versionLabel, { color: colors.text }]}>Version History:</ThemedText>
                        {policy.versionHistory.map((vh, i) => (
                          <View key={i} style={s.versionRow}>
                            <ThemedText style={[s.versionTag, { color: colors.textTertiary }]}>v{vh.version}</ThemedText>
                            <ThemedText style={[s.versionDate, { color: colors.textTertiary }]}>{vh.date}</ThemedText>
                            <ThemedText style={[s.versionChange, { color: colors.textSecondary }]} numberOfLines={1}>{vh.change}</ThemedText>
                          </View>
                        ))}
                      </View>
                    )}

                    <ThemedText style={[s.policyMeta, { color: colors.textTertiary }]}>
                      Effective: {policy.effectiveDate} {'\u00B7'} Updated: {policy.lastUpdated}
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </Card>
    </View>
  );
}

// =============================================================================
// VIEW: ACKNOWLEDGEMENTS
// =============================================================================

function AcknowledgementsView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // E4 students see limited view (just their relevant acknowledgements)
  const visibleAcks = isStudent(role)
    ? ACKNOWLEDGEMENTS.filter((a) => a.requiredBy.includes('Student') || a.requiredBy.includes('All'))
    : ACKNOWLEDGEMENTS;

  return (
    <View>
      <SectionHeader title="REQUIRED ACKNOWLEDGEMENTS" colors={colors} count={visibleAcks.length} />

      {/* Summary stats */}
      {isFacultyLevel(role) && (
        <Card colors={colors}>
          <View style={s.statsRow}>
            <StatBox
              label="Total Policies"
              value={String(visibleAcks.length)}
              colors={colors}
            />
            <StatBox
              label="Avg Completion"
              value={`${Math.round(visibleAcks.reduce((a, b) => a + Math.round((b.completed / b.totalRequired) * 100), 0) / visibleAcks.length)}%`}
              colors={colors}
              valueColor="#22C55E"
            />
            <StatBox
              label="Overdue"
              value={String(visibleAcks.filter((a) => {
                const rate = Math.round((a.completed / a.totalRequired) * 100);
                return rate < 80;
              }).length)}
              colors={colors}
              valueColor="#F59E0B"
            />
          </View>
        </Card>
      )}

      {/* Acknowledgement cards */}
      {visibleAcks.map((ack) => {
        const rate = Math.round((ack.completed / ack.totalRequired) * 100);
        const isExpanded = expandedId === ack.id;
        const barColor = rate >= 90 ? '#22C55E' : rate >= 70 ? '#F59E0B' : '#EF4444';

        return (
          <Pressable
            key={ack.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedId(isExpanded ? null : ack.id);
            }}
          >
            <Card colors={colors}>
              <View style={s.ackHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.ackTitle, { color: colors.text }]}>{ack.policyTitle}</ThemedText>
                  <ThemedText style={[s.ackMeta, { color: colors.textSecondary }]}>
                    Required by: {ack.requiredBy} {'\u00B7'} Due: {ack.dueDate}
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText style={[s.ackRate, { color: barColor }]}>{rate}%</ThemedText>
                  <ThemedText style={[s.ackFraction, { color: colors.textTertiary }]}>
                    {ack.completed.toLocaleString()} / {ack.totalRequired.toLocaleString()}
                  </ThemedText>
                </View>
              </View>

              <ProgressBar percentage={rate} color={barColor} colors={colors} />

              {isExpanded && isFacultyLevel(role) && (
                <View style={s.ackExpanded}>
                  {/* By department */}
                  <ThemedText style={[s.ackSubLabel, { color: colors.text }]}>By Department:</ThemedText>
                  {ack.byDepartment.map((dept, i) => {
                    const deptRate = Math.round((dept.completed / dept.total) * 100);
                    return (
                      <View key={i} style={s.ackDeptRow}>
                        <ThemedText style={[s.ackDeptName, { color: colors.textSecondary }]} numberOfLines={1}>{dept.name}</ThemedText>
                        <View style={s.ackDeptBar}>
                          <ProgressBar percentage={deptRate} color={deptRate >= 90 ? '#22C55E' : deptRate >= 70 ? '#F59E0B' : '#EF4444'} colors={colors} />
                        </View>
                        <ThemedText style={[s.ackDeptRate, { color: colors.textTertiary }]}>{deptRate}%</ThemedText>
                      </View>
                    );
                  })}

                  {/* By role */}
                  <ThemedText style={[s.ackSubLabel, { color: colors.text, marginTop: Spacing.md }]}>By Role:</ThemedText>
                  {ack.byRole.map((r, i) => {
                    const roleRate = Math.round((r.completed / r.total) * 100);
                    return (
                      <View key={i} style={s.ackDeptRow}>
                        <ThemedText style={[s.ackDeptName, { color: colors.textSecondary }]} numberOfLines={1}>{r.role}</ThemedText>
                        <View style={s.ackDeptBar}>
                          <ProgressBar percentage={roleRate} color={roleRate >= 90 ? '#22C55E' : roleRate >= 70 ? '#F59E0B' : '#EF4444'} colors={colors} />
                        </View>
                        <ThemedText style={[s.ackDeptRate, { color: colors.textTertiary }]}>{roleRate}%</ThemedText>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// VIEW: POLICY UPDATES
// =============================================================================

function PolicyUpdatesView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View>
      <SectionHeader title="RECENT POLICY CHANGES" colors={colors} count={POLICY_UPDATES.length} />

      {POLICY_UPDATES.map((update) => {
        const isExpanded = expandedId === update.id;
        const typeColor = CHANGE_TYPE_COLOR[update.changeType] || '#8F8F8F';

        return (
          <Pressable
            key={update.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedId(isExpanded ? null : update.id);
            }}
          >
            <Card colors={colors}>
              <View style={s.updateHeader}>
                <View style={{ flex: 1 }}>
                  <View style={s.updateTitleRow}>
                    <View style={[s.changeTypeBadge, { backgroundColor: typeColor + '20' }]}>
                      <ThemedText style={[s.changeTypeText, { color: typeColor }]}>
                        {CHANGE_TYPE_LABEL[update.changeType] || update.changeType}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[s.updateTitle, { color: colors.text }]}>{update.policyTitle}</ThemedText>
                  <ThemedText style={[s.updateMeta, { color: colors.textTertiary }]}>
                    v{update.previousVersion} {'\u2192'} v{update.newVersion} {'\u00B7'} Effective: {update.effectiveDate}
                  </ThemedText>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down' as any} size={12} color={colors.textTertiary} />
              </View>

              <ThemedText style={[s.updateSummary, { color: colors.textSecondary }]} numberOfLines={isExpanded ? undefined : 2}>
                {update.changeSummary}
              </ThemedText>

              {isExpanded && (
                <View style={s.updateExpanded}>
                  <ThemedText style={[s.updateDetailLabel, { color: colors.text }]}>Change Details:</ThemedText>
                  {update.changeDetails.map((detail, i) => (
                    <View key={i} style={s.policyPointRow}>
                      <ThemedText style={[s.policyBullet, { color: colors.textSecondary }]}>{'\u2022'}</ThemedText>
                      <ThemedText style={[s.policyPointText, { color: colors.textSecondary }]}>{detail}</ThemedText>
                    </View>
                  ))}
                  <View style={[s.updateFooter, { borderTopColor: colors.border }]}>
                    <ThemedText style={[s.updateFooterText, { color: colors.textTertiary }]}>
                      Reviewed by: {update.reviewedBy}
                    </ThemedText>
                    <ThemedText style={[s.updateFooterText, { color: colors.textTertiary }]}>
                      Published: {update.publishedDate} {'\u00B7'} Next review: {update.nextReviewDate}
                    </ThemedText>
                  </View>
                </View>
              )}
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// VIEW: ENFORCEMENT
// =============================================================================

function EnforcementView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statuses = ['all', 'active', 'under_investigation', 'appeal_pending', 'resolved'];

  const filtered = ENFORCEMENT_ACTIONS.filter((e) =>
    statusFilter === 'all' ? true : e.status === statusFilter
  );

  // Summary stats
  const totalActive = ENFORCEMENT_ACTIONS.filter((e) => e.status === 'active' || e.status === 'under_investigation').length;
  const totalAppeals = ENFORCEMENT_ACTIONS.filter((e) => e.status === 'appeal_pending').length;
  const totalResolved = ENFORCEMENT_ACTIONS.filter((e) => e.status === 'resolved').length;
  const totalCritical = ENFORCEMENT_ACTIONS.filter((e) => e.severity === 'critical').length;

  return (
    <View>
      {/* Summary strip */}
      <Card colors={colors}>
        <View style={s.statsRow}>
          <StatBox label="Active" value={String(totalActive)} colors={colors} valueColor="#F59E0B" />
          <StatBox label="Appeals" value={String(totalAppeals)} colors={colors} valueColor="#3B82F6" />
          <StatBox label="Resolved" value={String(totalResolved)} colors={colors} valueColor="#22C55E" />
          <StatBox label="Critical" value={String(totalCritical)} colors={colors} valueColor="#EF4444" />
        </View>
      </Card>

      {/* Status filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterRowContent}>
        {statuses.map((st) => (
          <Pressable
            key={st}
            style={[
              s.filterPill,
              {
                backgroundColor: statusFilter === st ? (st === 'all' ? colors.text + '15' : (ENFORCEMENT_STATUS_COLOR[st] || colors.text) + '20') : 'transparent',
                borderColor: statusFilter === st ? (st === 'all' ? colors.text + '30' : (ENFORCEMENT_STATUS_COLOR[st] || colors.text) + '40') : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStatusFilter(st);
            }}
          >
            <ThemedText style={[s.filterPillText, { color: statusFilter === st ? (st === 'all' ? colors.text : ENFORCEMENT_STATUS_COLOR[st] || colors.text) : colors.textSecondary }]}>
              {st === 'all' ? 'All' : st.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeader title="ENFORCEMENT ACTIONS" colors={colors} count={filtered.length} />

      {filtered.map((action) => {
        const statusColor = ENFORCEMENT_STATUS_COLOR[action.status] || '#8F8F8F';
        const sevColor = ENFORCEMENT_SEVERITY_COLOR[action.severity] || '#8F8F8F';

        return (
          <Card key={action.id} colors={colors}>
            <View style={s.enfHeader}>
              <View style={{ flex: 1 }}>
                <View style={s.enfBadgeRow}>
                  <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                    <ThemedText style={[s.statusText, { color: statusColor }]}>
                      {action.status.replace(/_/g, ' ').toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={[s.severityBadge, { backgroundColor: sevColor + '20' }]}>
                    <ThemedText style={[s.severityText, { color: sevColor }]}>
                      {action.severity.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.enfCaseNum, { color: colors.textTertiary }]}>{action.caseNumber}</ThemedText>
                <ThemedText style={[s.enfPolicy, { color: colors.text }]}>{action.policyViolated}</ThemedText>
              </View>
            </View>

            <ThemedText style={[s.enfDesc, { color: colors.textSecondary }]}>{action.description}</ThemedText>

            <View style={[s.enfFooter, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.enfFooterText, { color: colors.textTertiary }]}>
                Opened: {action.dateOpened}
                {action.dateClosed ? ` \u00B7 Closed: ${action.dateClosed}` : ''}
              </ThemedText>
              <ThemedText style={[s.enfFooterText, { color: colors.textTertiary }]}>
                Respondent: {action.respondentType} {'\u00B7'} Investigator: {action.investigator}
              </ThemedText>
              {action.sanction && (
                <ThemedText style={[s.enfSanction, { color: colors.textSecondary }]}>
                  Sanction: {action.sanction}
                </ThemedText>
              )}
            </View>
          </Card>
        );
      })}
    </View>
  );
}

// =============================================================================
// VIEW: COMPLIANCE DASHBOARD
// =============================================================================

function ComplianceDashboardView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isLimited = !isDeanLevel(role); // E3 gets limited view

  // Overall score
  const avgScore = Math.round(COMPLIANCE_AREAS.reduce((a, b) => a + b.score, 0) / COMPLIANCE_AREAS.length);
  const avgTraining = Math.round(COMPLIANCE_AREAS.reduce((a, b) => a + b.trainingCompletion, 0) / COMPLIANCE_AREAS.length);
  const totalOpenFindings = COMPLIANCE_AREAS.reduce((a, b) => a + b.openFindings, 0);

  return (
    <View>
      {/* Overview strip */}
      <Card colors={colors}>
        <View style={s.statsRow}>
          <StatBox label="Avg Score" value={`${avgScore}%`} colors={colors} valueColor={avgScore >= 90 ? '#22C55E' : '#F59E0B'} />
          <StatBox label="Training Avg" value={`${avgTraining}%`} colors={colors} valueColor={avgTraining >= 90 ? '#22C55E' : '#F59E0B'} />
          <StatBox label="Open Findings" value={String(totalOpenFindings)} colors={colors} valueColor={totalOpenFindings === 0 ? '#22C55E' : '#F59E0B'} />
          {!isLimited && (
            <StatBox label="Areas" value={String(COMPLIANCE_AREAS.length)} colors={colors} />
          )}
        </View>
      </Card>

      {/* Compliance area cards */}
      <SectionHeader title="COMPLIANCE AREAS" colors={colors} count={COMPLIANCE_AREAS.length} />

      {COMPLIANCE_AREAS.map((area) => {
        const isExpanded = expandedId === area.id;
        const statusColor = COMPLIANCE_STATUS_COLOR[area.status] || '#8F8F8F';

        return (
          <Pressable
            key={area.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedId(isExpanded ? null : area.id);
            }}
          >
            <Card colors={colors}>
              <View style={s.compHeader}>
                <IconSymbol name={area.icon as any} size={18} color={statusColor} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.compName, { color: colors.text }]}>{area.name}</ThemedText>
                  <View style={s.compBadgeRow}>
                    <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                      <ThemedText style={[s.statusText, { color: statusColor }]}>
                        {area.status.replace(/_/g, ' ').toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText style={[s.compScore, { color: area.score >= 90 ? '#22C55E' : area.score >= 70 ? '#F59E0B' : '#EF4444' }]}>
                      {area.score}%
                    </ThemedText>
                  </View>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down' as any} size={12} color={colors.textTertiary} />
              </View>

              <View style={s.compBarRow}>
                <ThemedText style={[s.compBarLabel, { color: colors.textTertiary }]}>Training</ThemedText>
                <View style={s.compBar}>
                  <ProgressBar percentage={area.trainingCompletion} color={area.trainingCompletion >= 90 ? '#22C55E' : area.trainingCompletion >= 70 ? '#F59E0B' : '#EF4444'} colors={colors} />
                </View>
                <ThemedText style={[s.compBarValue, { color: colors.textSecondary }]}>{area.trainingCompletion}%</ThemedText>
              </View>

              {isExpanded && (
                <View style={s.compExpanded}>
                  {!isLimited && (
                    <View style={s.compMetaRow}>
                      <ThemedText style={[s.compMetaText, { color: colors.textTertiary }]}>
                        Last audit: {area.lastAudit} {'\u00B7'} Next: {area.nextAudit}
                      </ThemedText>
                      <ThemedText style={[s.compMetaText, { color: colors.textTertiary }]}>
                        Open findings: {area.openFindings} {'\u00B7'} Closed: {area.closedFindings}
                      </ThemedText>
                    </View>
                  )}

                  <ThemedText style={[s.compMetricsLabel, { color: colors.text }]}>Key Metrics:</ThemedText>
                  {area.keyMetrics.map((metric, i) => {
                    const metricColor = metric.status === 'good' ? '#22C55E' : metric.status === 'warn' ? '#F59E0B' : '#EF4444';
                    return (
                      <View key={i} style={s.compMetricRow}>
                        <View style={[s.statusDot, { backgroundColor: metricColor, marginTop: 4 }]} />
                        <ThemedText style={[s.compMetricLabel, { color: colors.textSecondary }]}>{metric.label}</ThemedText>
                        <ThemedText style={[s.compMetricValue, { color: metricColor }]}>{metric.value}</ThemedText>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          </Pressable>
        );
      })}

      {/* Audit schedule (E1/E2 only) */}
      {!isLimited && (
        <View style={s.moduleContainer}>
          <SectionHeader title="AUDIT SCHEDULE" colors={colors} count={AUDIT_SCHEDULE.length} />
          <Card colors={colors}>
            {AUDIT_SCHEDULE.map((audit, idx) => {
              const auditColor = AUDIT_STATUS_COLOR[audit.status] || '#8F8F8F';
              return (
                <View
                  key={audit.id}
                  style={[
                    s.auditRow,
                    idx < AUDIT_SCHEDULE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[s.auditName, { color: colors.text }]}>{audit.name}</ThemedText>
                    <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                      {audit.area} {'\u00B7'} {audit.date}
                      {audit.findings > 0 ? ` \u00B7 ${audit.findings} finding${audit.findings > 1 ? 's' : ''}` : ''}
                    </ThemedText>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: auditColor + '20' }]}>
                    <View style={[s.statusDot, { backgroundColor: auditColor }]} />
                    <ThemedText style={[s.statusText, { color: auditColor }]}>
                      {audit.status.replace(/_/g, ' ').toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW: POLICY PACKS
// =============================================================================

function PolicyPacksView({ colors, role }: { colors: typeof Colors.light; role: EducationRoleLens }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // E4 students only see Student Pack (and New Hire if applicable)
  const visiblePacks = isStudent(role)
    ? POLICY_PACKS.filter((p) => p.targetRole === 'Students')
    : POLICY_PACKS;

  return (
    <View>
      <SectionHeader title="POLICY PACKS" colors={colors} count={visiblePacks.length} />

      {visiblePacks.map((pack) => {
        const isExpanded = expandedId === pack.id;
        const barColor = pack.completionRate >= 80 ? '#22C55E' : pack.completionRate >= 50 ? '#F59E0B' : '#EF4444';
        const ackCount = pack.requiredReadings.filter((r) => r.acknowledged).length;
        const totalRequired = pack.requiredReadings.filter((r) => r.required).length;
        const totalMinutes = pack.requiredReadings.reduce((a, b) => a + b.estimatedMinutes, 0);

        return (
          <Pressable
            key={pack.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedId(isExpanded ? null : pack.id);
            }}
          >
            <Card colors={colors}>
              <View style={s.packHeader}>
                <IconSymbol name={pack.icon as any} size={20} color={colors.text} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.packName, { color: colors.text }]}>{pack.name}</ThemedText>
                  <ThemedText style={[s.packTarget, { color: colors.textSecondary }]}>
                    For: {pack.targetRole} {'\u00B7'} {pack.totalPolicies} policies {'\u00B7'} ~{totalMinutes} min
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText style={[s.packRate, { color: barColor }]}>{pack.completionRate}%</ThemedText>
                  <ThemedText style={[s.packFraction, { color: colors.textTertiary }]}>
                    {ackCount} / {totalRequired}
                  </ThemedText>
                </View>
              </View>

              <ProgressBar percentage={pack.completionRate} color={barColor} colors={colors} />

              <ThemedText style={[s.packDesc, { color: colors.textSecondary }]}>{pack.description}</ThemedText>
              <ThemedText style={[s.packDue, { color: colors.textTertiary }]}>Due: {pack.dueDate}</ThemedText>

              {isExpanded && (
                <View style={s.packExpanded}>
                  <ThemedText style={[s.packReadingsLabel, { color: colors.text }]}>Required Readings:</ThemedText>
                  {pack.requiredReadings.map((reading) => {
                    const catColor = POLICY_CATEGORY_COLOR[reading.category] || '#8F8F8F';
                    return (
                      <View key={reading.id} style={s.readingRow}>
                        <IconSymbol
                          name={reading.acknowledged ? 'checkmark.circle.fill' : 'circle' as any}
                          size={16}
                          color={reading.acknowledged ? '#22C55E' : colors.textTertiary}
                        />
                        <View style={{ flex: 1 }}>
                          <ThemedText
                            style={[
                              s.readingTitle,
                              { color: reading.acknowledged ? colors.textSecondary : colors.text },
                              reading.acknowledged && s.readingCompleted,
                            ]}
                            numberOfLines={1}
                          >
                            {reading.title}
                          </ThemedText>
                          <View style={s.readingMeta}>
                            <View style={[s.categoryBadge, { backgroundColor: catColor + '20' }]}>
                              <ThemedText style={[s.categoryText, { color: catColor }]}>
                                {POLICY_CATEGORY_LABEL[reading.category] || reading.category}
                              </ThemedText>
                            </View>
                            <ThemedText style={[s.readingMinutes, { color: colors.textTertiary }]}>
                              ~{reading.estimatedMinutes} min
                            </ThemedText>
                            {reading.required && (
                              <ThemedText style={[s.readingRequired, { color: '#EF4444' }]}>Required</ThemedText>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EduPolicies({ colors, role = 'E1', onSwitchTab }: Props) {
  const visibleViews = getVisibleViews(role);
  const [activeView, setActiveView] = useState<PolicyView>(visibleViews[0]?.id ?? 'library');

  // If the active view is no longer visible for this role, reset
  if (!visibleViews.find((v) => v.id === activeView)) {
    // We can't call setActiveView in render, so just override the local variable
    // and the next render after user interaction will correct it
  }

  const currentView = visibleViews.find((v) => v.id === activeView) ? activeView : visibleViews[0]?.id ?? 'library';

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* View toggle pills */}
      {visibleViews.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.pillBar}
          contentContainerStyle={s.pillBarContent}
        >
          {visibleViews.map((view) => {
            const isActive = currentView === view.id;
            return (
              <Pressable
                key={view.id}
                style={[
                  s.viewPill,
                  {
                    backgroundColor: isActive ? colors.text + '12' : 'transparent',
                    borderColor: isActive ? colors.text + '25' : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveView(view.id);
                }}
              >
                <ThemedText style={[s.viewPillText, { color: isActive ? colors.text : colors.textSecondary }]}>
                  {view.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Active view content */}
      {currentView === 'library' && <PolicyLibraryView colors={colors} role={role} />}
      {currentView === 'acknowledgements' && <AcknowledgementsView colors={colors} role={role} />}
      {currentView === 'updates' && <PolicyUpdatesView colors={colors} role={role} />}
      {currentView === 'enforcement' && <EnforcementView colors={colors} role={role} />}
      {currentView === 'compliance' && <ComplianceDashboardView colors={colors} role={role} />}
      {currentView === 'packs' && <PolicyPacksView colors={colors} role={role} />}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },

  // Pill bar
  pillBar: { marginBottom: Spacing.md },
  pillBarContent: { gap: 8, paddingRight: Spacing.md },
  viewPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  viewPillText: { fontSize: 12, fontWeight: '600' },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // Filter pills
  filterRow: { marginBottom: Spacing.sm },
  filterRowContent: { gap: 8, paddingRight: Spacing.md },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  resultCount: { fontSize: 11, marginBottom: Spacing.sm },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: Spacing.lg },

  // Policies
  policyRow: { paddingVertical: 10 },
  policyHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  policyLeft: { flex: 1 },
  policyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  policyBadgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  categoryText: { fontSize: 10, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  versionBadge: { fontSize: 10, fontWeight: '500' },
  policyExpanded: { marginTop: Spacing.sm },
  policySummary: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.sm },
  policyPointsLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  policyPointRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  policyBullet: { fontSize: 13 },
  policyPointText: { fontSize: 12, lineHeight: 17, flex: 1 },
  policyMeta: { fontSize: 10, marginTop: Spacing.sm },

  // Version history
  versionSection: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  versionLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  versionRow: { flexDirection: 'row', gap: 8, marginBottom: 3, alignItems: 'center' },
  versionTag: { fontSize: 10, fontWeight: '600', width: 52 },
  versionDate: { fontSize: 10, width: 60 },
  versionChange: { fontSize: 11, flex: 1 },

  // Stats row
  statsRow: { flexDirection: 'row', gap: Spacing.sm },

  // Severity badge
  severityBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: BorderRadius.sm },
  severityText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Acknowledgements
  ackHeader: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  ackTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  ackMeta: { fontSize: 11 },
  ackRate: { fontSize: 18, fontWeight: '700' },
  ackFraction: { fontSize: 10 },
  ackExpanded: { marginTop: Spacing.md },
  ackSubLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  ackDeptRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ackDeptName: { fontSize: 11, width: 120 },
  ackDeptBar: { flex: 1 },
  ackDeptRate: { fontSize: 11, fontWeight: '600', width: 36, textAlign: 'right' },

  // Policy Updates
  updateHeader: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 4 },
  updateTitleRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  updateTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  updateMeta: { fontSize: 11, marginBottom: 6 },
  updateSummary: { fontSize: 12, lineHeight: 17 },
  updateExpanded: { marginTop: Spacing.sm },
  updateDetailLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  updateFooter: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  updateFooterText: { fontSize: 10, marginBottom: 2 },
  changeTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  changeTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Enforcement
  enfHeader: { flexDirection: 'row', gap: Spacing.sm },
  enfBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  enfCaseNum: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  enfPolicy: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  enfDesc: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  enfFooter: { paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  enfFooterText: { fontSize: 10, marginBottom: 2 },
  enfSanction: { fontSize: 11, fontWeight: '600', marginTop: 4 },

  // Compliance Dashboard
  compHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  compName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  compBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compScore: { fontSize: 14, fontWeight: '700' },
  compBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  compBarLabel: { fontSize: 10, width: 48 },
  compBar: { flex: 1 },
  compBarValue: { fontSize: 11, fontWeight: '600', width: 36, textAlign: 'right' },
  compExpanded: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  compMetaRow: { marginBottom: Spacing.sm },
  compMetaText: { fontSize: 10, marginBottom: 2 },
  compMetricsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  compMetricRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  compMetricLabel: { fontSize: 12, flex: 1 },
  compMetricValue: { fontSize: 12, fontWeight: '600' },

  // Audit
  auditRow: { paddingVertical: 10 },
  auditName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  auditMeta: { fontSize: 11 },

  // Policy Packs
  packHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  packName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  packTarget: { fontSize: 11 },
  packRate: { fontSize: 18, fontWeight: '700' },
  packFraction: { fontSize: 10 },
  packDesc: { fontSize: 12, lineHeight: 17, marginTop: 8, marginBottom: 4 },
  packDue: { fontSize: 10, marginBottom: 4 },
  packExpanded: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ffffff10' },
  packReadingsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  readingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  readingTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  readingCompleted: { textDecorationLine: 'line-through', opacity: 0.7 },
  readingMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  readingMinutes: { fontSize: 10 },
  readingRequired: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
});
