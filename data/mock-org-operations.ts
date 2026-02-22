/**
 * Organization Operations Tab — Universal mock data
 * Workstreams, meetings, rules/policies, compliance items per mode.
 */
import type { Mode } from '@/types';
import { WORKSTREAMS, MEETINGS } from '@/data/mock-business';

export interface OrgWorkstream {
  id: string;
  name: string;
  lead: string;
  status: 'active' | 'blocked' | 'completed';
  items: number;
  progress: number;
}

export interface OrgMeeting {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  status: 'scheduled' | 'completed';
}

export interface OrgRule {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface OrgComplianceItem {
  id: string;
  title: string;
  status: 'compliant' | 'review' | 'action_required';
  dueDate?: string;
}

export interface OrgOperationsData {
  workstreams: OrgWorkstream[];
  meetings: OrgMeeting[];
  rules: OrgRule[];
  compliance: OrgComplianceItem[];
}

// ── Sports ──────────────────────────────────────────────────────────────
const SPORTS_OPS: OrgOperationsData = {
  workstreams: [
    { id: 'sw-1', name: 'Recruiting Pipeline', lead: 'Coach Harris', status: 'active', items: 18, progress: 45 },
    { id: 'sw-2', name: 'Strength & Conditioning', lead: 'Antoine Brooks', status: 'active', items: 12, progress: 72 },
    { id: 'sw-3', name: 'Facility Upgrades', lead: 'Dr. Marcus Wilson', status: 'blocked', items: 6, progress: 30 },
    { id: 'sw-4', name: 'NIL Program Setup', lead: 'Alex Morgan', status: 'active', items: 9, progress: 55 },
  ],
  meetings: [
    { id: 'sm-1', title: 'Coaching Staff Huddle', date: 'Feb 18, 2026 · 9:00 AM', attendees: ['Alex M', 'Harris', 'Brooks'], status: 'scheduled' },
    { id: 'sm-2', title: 'Athletic Director Check-in', date: 'Feb 20, 2026 · 2:00 PM', attendees: ['Alex M', 'Dr. Wilson'], status: 'scheduled' },
    { id: 'sm-3', title: 'Recruiting Review', date: 'Feb 14, 2026 · 3:00 PM', attendees: ['Alex M', 'Harris'], status: 'completed' },
  ],
  rules: [
    { id: 'sr-1', title: 'NAIA Eligibility Standards', category: 'Eligibility', summary: 'Student-athletes must maintain 2.0 GPA and 12 credit hours per term.' },
    { id: 'sr-2', title: 'Transfer Portal Policy', category: 'Recruiting', summary: 'Transfers must sit out one semester unless granted immediate eligibility.' },
    { id: 'sr-3', title: 'Practice Hour Limits', category: 'Operations', summary: 'Max 20 hours per week in-season, 8 hours per week off-season.' },
  ],
  compliance: [
    { id: 'sc-1', title: 'NAIA Membership Renewal', status: 'compliant' },
    { id: 'sc-2', title: 'Title IX Reporting', status: 'review', dueDate: 'Mar 15, 2026' },
    { id: 'sc-3', title: 'Drug Testing Protocol', status: 'compliant' },
    { id: 'sc-4', title: 'APR Submission', status: 'action_required', dueDate: 'Feb 28, 2026' },
  ],
};

// ── Business (reuses existing WORKSTREAMS & MEETINGS) ─────────────────
function businessOps(): OrgOperationsData {
  return {
    workstreams: WORKSTREAMS.map((w) => ({
      id: w.id,
      name: w.name,
      lead: w.lead,
      status: w.status,
      items: w.items,
      progress: w.progress,
    })),
    meetings: MEETINGS.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      attendees: m.attendees,
      status: m.status,
    })),
    rules: [
      { id: 'er-1', title: 'IP Assignment Agreement', category: 'Legal', summary: 'All work product created during employment is company-owned IP.' },
      { id: 'er-2', title: 'Data Retention Policy', category: 'Compliance', summary: 'Customer data retained for 7 years per SOC 2 requirements.' },
      { id: 'er-3', title: 'Remote Work Guidelines', category: 'HR', summary: 'Async-first, core hours 11am-3pm ET, quarterly in-person sprints.' },
    ],
    compliance: [
      { id: 'ec-1', title: 'SOC 2 Type II Audit', status: 'review', dueDate: 'Q2 2026' },
      { id: 'ec-2', title: 'Delaware Annual Report', status: 'compliant' },
      { id: 'ec-3', title: 'GDPR Data Processing Addendum', status: 'compliant' },
    ],
  };
}

// ── Church ───────────────────────────────────────────────────────────────
const CHURCH_OPS: OrgOperationsData = {
  workstreams: [
    { id: 'cw-1', name: 'Easter Production', lead: 'Pastor Williams', status: 'active', items: 22, progress: 38 },
    { id: 'cw-2', name: 'Youth Summer Camp', lead: 'Min. Okafor', status: 'active', items: 15, progress: 20 },
    { id: 'cw-3', name: 'Building Expansion Phase 2', lead: 'Deacon Harris', status: 'blocked', items: 8, progress: 65 },
  ],
  meetings: [
    { id: 'cm-1', title: 'Elder Board Meeting', date: 'Feb 22, 2026 · 6:30 PM', attendees: ['Pastor James Carter', 'Elder Davis', 'Elder Brown'], status: 'scheduled' },
    { id: 'cm-2', title: 'Worship Team Rehearsal', date: 'Feb 19, 2026 · 7:00 PM', attendees: ['Min. Lee', 'Worship Team'], status: 'scheduled' },
    { id: 'cm-3', title: 'Deacon Board Review', date: 'Feb 10, 2026 · 6:00 PM', attendees: ['Deacons'], status: 'completed' },
  ],
  rules: [
    { id: 'cr-1', title: 'Membership Covenant', category: 'Membership', summary: 'Members commit to regular attendance, giving, serving, and community.' },
    { id: 'cr-2', title: 'Safeguarding Policy', category: 'Safety', summary: 'Background checks required for all volunteers working with minors.' },
    { id: 'cr-3', title: 'Facility Use Agreement', category: 'Operations', summary: 'External groups must submit request 30 days in advance with insurance.' },
  ],
  compliance: [
    { id: 'cc-1', title: '501(c)(3) Annual Filing', status: 'compliant' },
    { id: 'cc-2', title: 'Background Check Renewals', status: 'review', dueDate: 'Mar 1, 2026' },
    { id: 'cc-3', title: 'Fire Safety Inspection', status: 'compliant' },
  ],
};

// ── Education ────────────────────────────────────────────────────────────
const EDUCATION_OPS: OrgOperationsData = {
  workstreams: [
    { id: 'ew-1', name: 'Spring Registration', lead: 'Registrar Office', status: 'completed', items: 14, progress: 100 },
    { id: 'ew-2', name: 'Accreditation Self-Study', lead: 'Dr. Hardrick', status: 'active', items: 32, progress: 48 },
    { id: 'ew-3', name: 'Online Curriculum Expansion', lead: 'Dr. Chen', status: 'active', items: 18, progress: 35 },
    { id: 'ew-4', name: 'Campus Safety Review', lead: 'VP Operations', status: 'blocked', items: 7, progress: 60 },
  ],
  meetings: [
    { id: 'em-1', title: 'Faculty Senate', date: 'Feb 24, 2026 · 3:00 PM', attendees: ['Faculty Senators'], status: 'scheduled' },
    { id: 'em-2', title: 'Curriculum Committee', date: 'Feb 21, 2026 · 1:00 PM', attendees: ['Dr. Chen', 'Dept. Chairs'], status: 'scheduled' },
    { id: 'em-3', title: 'Board of Trustees', date: 'Feb 8, 2026 · 10:00 AM', attendees: ['Board Members'], status: 'completed' },
  ],
  rules: [
    { id: 'edr-1', title: 'Academic Integrity Policy', category: 'Academic', summary: 'Zero tolerance for plagiarism; first offense results in course failure.' },
    { id: 'edr-2', title: 'FERPA Compliance', category: 'Privacy', summary: 'Student education records are protected; disclosure requires consent.' },
    { id: 'edr-3', title: 'Faculty Tenure Guidelines', category: 'HR', summary: 'Tenure-track review at 3rd and 6th year with publication requirements.' },
  ],
  compliance: [
    { id: 'edc-1', title: 'SACS Accreditation Review', status: 'review', dueDate: 'Apr 2026' },
    { id: 'edc-2', title: 'Title IV Financial Aid Audit', status: 'compliant' },
    { id: 'edc-3', title: 'Clery Act Report', status: 'action_required', dueDate: 'Mar 30, 2026' },
    { id: 'edc-4', title: 'ADA Compliance Review', status: 'compliant' },
  ],
};

// ── Community (KaNeXT) ─────────────────────────────────────────────────────
const COMMUNITY_OPS: OrgOperationsData = {
  workstreams: [
    { id: 'kw-1', name: 'Season 1 Calendar', lead: 'James Whitfield', status: 'active', items: 10, progress: 80 },
    { id: 'kw-2', name: 'Safety Certification', lead: 'Maria Santos', status: 'active', items: 16, progress: 55 },
    { id: 'kw-3', name: 'Broadcast Deal Negotiation', lead: 'Marcus Kane', status: 'blocked', items: 5, progress: 40 },
  ],
  meetings: [
    { id: 'km-1', title: 'Team Principals Meeting', date: 'Feb 25, 2026 · 10:00 AM', attendees: ['All Team Owners'], status: 'scheduled' },
    { id: 'km-2', title: 'Stewards Briefing', date: 'Feb 20, 2026 · 4:00 PM', attendees: ['M. Santos', 'Track Officials'], status: 'scheduled' },
    { id: 'km-3', title: 'Pre-Season Technical Inspection', date: 'Feb 12, 2026 · 9:00 AM', attendees: ['All Teams'], status: 'completed' },
  ],
  rules: [
    { id: 'kr-1', title: 'Technical Regulations v1.0', category: 'Technical', summary: 'Kart specifications, weight limits, engine seals, and aero rules.' },
    { id: 'kr-2', title: 'Sporting Code', category: 'Sporting', summary: 'Race procedures, flag rules, penalties, and appeals process.' },
    { id: 'kr-3', title: 'Driver Conduct Code', category: 'Conduct', summary: 'Unsportsmanlike behavior results in grid penalties or disqualification.' },
  ],
  compliance: [
    { id: 'kc-1', title: 'Track Safety Certification', status: 'review', dueDate: 'Feb 28, 2026' },
    { id: 'kc-2', title: 'Insurance Coverage', status: 'compliant' },
    { id: 'kc-3', title: 'Medical Team Staffing', status: 'compliant' },
  ],
};

export function getOrgOperations(mode: Mode): OrgOperationsData {
  switch (mode) {
    case 'sports': return SPORTS_OPS;
    case 'business': return businessOps();
    case 'church': return CHURCH_OPS;
    case 'education': return EDUCATION_OPS;
    case 'competition': return COMMUNITY_OPS;
    default: return { workstreams: [], meetings: [], rules: [], compliance: [] };
  }
}
