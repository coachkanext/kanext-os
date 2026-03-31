/**
 * Operations v2 Mock Data
 * Comprehensive ops data across all 5 modes with 14 sub-tabs:
 * Dashboard, Cadence, Tasks, Work Orders, Issues, Assets, Vendors,
 * Facilities, Travel/Logistics, People Ops, SOPs, Reports, Audit, Settings.
 */
import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

/** Ops lifecycle status (locked) */
export type OpsStatus = 'draft' | 'active' | 'blocked' | 'complete' | 'archived';

/** Issue severity */
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Priority */
export type OpsPriority = 'P0' | 'P1' | 'P2' | 'P3';

/** Scope chip — mode-specific filter */
export interface OpsScopeChip {
  key: string;
  label: string;
}

/** Sub-tab identifier */
export type OpsTabId =
  | 'dashboard'
  | 'cadence'
  | 'tasks'
  | 'work-orders'
  | 'issues'
  | 'assets'
  | 'vendors'
  | 'facilities'
  | 'travel'
  | 'people-ops'
  | 'sops'
  | 'reports'
  | 'audit'
  | 'settings';

export interface OpsTab {
  id: OpsTabId;
  label: string;
}

/** Task */
export interface OpsTask {
  id: string;
  title: string;
  owner: string;
  ownerInitials: string;
  dueDate: string;
  priority: OpsPriority;
  status: OpsStatus;
  unit: string; // mode-specific scope
}

/** Work Order */
export interface OpsWorkOrder {
  id: string;
  title: string;
  requestedBy: string;
  assignedTo: string;
  assignedToInitials: string;
  dueDate: string;
  priority: OpsPriority;
  status: OpsStatus;
  category: string; // "Facilities", "Equipment", "IT", "Event Setup"
}

/** Issue */
export interface OpsIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  owner: string;
  ownerInitials: string;
  status: OpsStatus;
  resolution?: string;
  reportedAt: string;
  category: string;
}

/** Asset condition */
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'needs-repair' | 'retired';

/** Asset */
export interface OpsAsset {
  id: string;
  name: string;
  category: string; // "Equipment", "Device", "Camera", "Vehicle", "Furniture"
  assignedTo?: string;
  condition: AssetCondition;
  location: string;
}

/** Vendor */
export interface OpsVendor {
  id: string;
  name: string;
  category: string; // "Catering", "AV", "Uniforms", "Transportation", "IT"
  contractEnd: string;
  activeTickets: number;
  status: 'active' | 'pending-renewal' | 'expired';
}

/** Facility */
export interface OpsFacility {
  id: string;
  name: string;
  location: string;
  type: string; // "Gym", "Office", "Sanctuary", "Classroom", "Arena"
  maintenanceQueue: number;
  status: 'operational' | 'partial' | 'offline';
}

/** Travel / Logistics item */
export interface OpsTravelItem {
  id: string;
  title: string;
  destination: string;
  departDate: string;
  returnDate: string;
  travelers: number;
  status: 'planned' | 'booked' | 'in-transit' | 'completed';
}

/** Standard Operating Procedure */
export interface OpsSOP {
  id: string;
  title: string;
  category: string;
  steps: number;
  lastUpdated: string;
  owner: string;
}

/** Report */
export interface OpsReport {
  id: string;
  title: string;
  type: string; // "Weekly Snapshot", "Monthly Summary", "Event Report"
  generatedAt: string;
  owner: string;
}

/** Audit entry */
export interface OpsAuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  timestampMs: number;
  description: string;
}

/** Cadence meeting */
export interface OpsCadenceMeeting {
  id: string;
  title: string;
  frequency: string; // "Weekly", "Bi-weekly", "Monthly", "Daily"
  nextDate: string;
  time: string;
  attendees: string[];
  agenda?: string;
}

/** Dashboard block (mode-specific) */
export interface DashboardBlock {
  id: string;
  label: string;
  icon: string;
  value: string;
  subValue?: string;
  color: string; // accent/status color
}

/** Sort option */
export type SortOption = 'due-soonest' | 'recent-activity' | 'a-z';

/** Filter state */
export interface OpsFilterState {
  owner: string;
  statuses: OpsStatus[];
  priorities: OpsPriority[];
  sort: SortOption;
}

// =============================================================================
// CONSTANTS — Tabs
// =============================================================================

export const OPS_TABS: OpsTab[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'cadence', label: 'Cadence' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'work-orders', label: 'Work Orders' },
  { id: 'issues', label: 'Issues' },
  { id: 'assets', label: 'Assets' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'travel', label: 'Travel / Logistics' },
  { id: 'people-ops', label: 'People Ops' },
  { id: 'sops', label: 'SOPs' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

// =============================================================================
// CONSTANTS — Scope Chips per Mode
// =============================================================================

export const OPS_SCOPE_CHIPS: Record<Mode, OpsScopeChip[]> = {
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
  business: [
    { key: 'organization', label: 'Organization' },
    { key: 'entity', label: 'Entity' },
    { key: 'department', label: 'Department' },
  ],
  competition: [
    { key: 'organization', label: 'Organization' },
    { key: 'series', label: 'Series' },
    { key: 'event-weekend', label: 'Event Weekend' },
  ],
};

// =============================================================================
// CONSTANTS — Color Maps
// =============================================================================

export const STATUS_COLOR_MAP: Record<OpsStatus, string> = {
  draft: '#9C9790',
  active: '#5A8A6E',
  blocked: '#B85C5C',
  complete: '#1A1714',
  archived: '#52525B',
};

export const SEVERITY_COLOR_MAP: Record<IssueSeverity, string> = {
  low: '#9C9790',
  medium: '#B8943E',
  high: '#B8943E',
  critical: '#B85C5C',
};

export const PRIORITY_COLOR_MAP: Record<OpsPriority, string> = {
  P0: '#B85C5C',
  P1: '#B8943E',
  P2: '#B8943E',
  P3: '#9C9790',
};

export const CONDITION_COLOR_MAP: Record<AssetCondition, string> = {
  excellent: '#5A8A6E',
  good: '#1A1714',
  fair: '#B8943E',
  'needs-repair': '#B85C5C',
  retired: '#52525B',
};

// =============================================================================
// SPORTS MODE — Mock Data
// =============================================================================

const SPORTS_TASKS: OpsTask[] = [
  { id: 'sp-t-1', title: 'Practice court setup — offensive install', owner: 'Antoine Brooks', ownerInitials: 'AB', dueDate: '2026-02-17', priority: 'P1', status: 'active', unit: 'Program' },
  { id: 'sp-t-2', title: 'Upload film — Dakota State scouting cuts', owner: 'Coach Harris', ownerInitials: 'CH', dueDate: '2026-02-17', priority: 'P0', status: 'active', unit: 'Program' },
  { id: 'sp-t-3', title: 'Book charter bus — Multnomah trip', owner: 'Ops Coordinator', ownerInitials: 'OC', dueDate: '2026-02-18', priority: 'P1', status: 'complete', unit: 'Season' },
  { id: 'sp-t-4', title: 'Equipment check — away game bags & med kits', owner: 'Antoine Brooks', ownerInitials: 'AB', dueDate: '2026-02-19', priority: 'P1', status: 'draft', unit: 'Program' },
  { id: 'sp-t-5', title: 'Game day prep — PA script & roster cards', owner: 'Media Coordinator', ownerInitials: 'MC', dueDate: '2026-02-18', priority: 'P2', status: 'active', unit: 'Season' },
  { id: 'sp-t-6', title: 'Recruiting follow-up — top 5 portal targets', owner: 'Alex Morgan', ownerInitials: 'SK', dueDate: '2026-02-20', priority: 'P1', status: 'active', unit: 'Program' },
  { id: 'sp-t-7', title: 'Submit eligibility verification forms', owner: 'Alex Morgan', ownerInitials: 'SK', dueDate: '2026-02-21', priority: 'P0', status: 'draft', unit: 'Organization' },
  { id: 'sp-t-8', title: 'Strength & conditioning plan — conference prep', owner: 'S&C Coach', ownerInitials: 'SC', dueDate: '2026-02-22', priority: 'P2', status: 'active', unit: 'Program' },
];

const SPORTS_WORK_ORDERS: OpsWorkOrder[] = [
  { id: 'sp-wo-1', title: 'Repair shot clock — south end', requestedBy: 'Coach Harris', assignedTo: 'Facilities Mgr', assignedToInitials: 'FM', dueDate: '2026-02-18', priority: 'P0', status: 'active', category: 'Equipment' },
  { id: 'sp-wo-2', title: 'Resurface practice court — dead spots in paint', requestedBy: 'Antoine Brooks', assignedTo: 'Facilities Mgr', assignedToInitials: 'FM', dueDate: '2026-03-01', priority: 'P2', status: 'draft', category: 'Facilities' },
  { id: 'sp-wo-3', title: 'Install additional film camera mount — baseline', requestedBy: 'Media Coordinator', assignedTo: 'AV Tech', assignedToInitials: 'AT', dueDate: '2026-02-25', priority: 'P1', status: 'active', category: 'Equipment' },
  { id: 'sp-wo-4', title: 'Game day event setup — tables, signage, merch tent', requestedBy: 'Ops Coordinator', assignedTo: 'Events Crew', assignedToInitials: 'EC', dueDate: '2026-02-18', priority: 'P1', status: 'active', category: 'Event Setup' },
];

const SPORTS_ISSUES: OpsIssue[] = [
  { id: 'sp-i-1', title: 'Medical kit expired supplies — travel bag #2', severity: 'high', owner: 'Medical Staff', ownerInitials: 'MS', status: 'active', reportedAt: '2026-02-12', category: 'Medical' },
  { id: 'sp-i-2', title: 'Bus company double-booked on Feb 20', severity: 'critical', owner: 'Ops Coordinator', ownerInitials: 'OC', status: 'blocked', reportedAt: '2026-02-15', category: 'Travel' },
  { id: 'sp-i-3', title: 'Weight room HVAC inconsistent temperature', severity: 'medium', owner: 'Facilities Mgr', ownerInitials: 'FM', status: 'active', reportedAt: '2026-02-10', category: 'Facilities' },
  { id: 'sp-i-4', title: 'Scoreboard software crash during home game', severity: 'low', owner: 'AV Tech', ownerInitials: 'AT', status: 'complete', resolution: 'Software update applied v3.2.1', reportedAt: '2026-02-08', category: 'Technology' },
];

const SPORTS_ASSETS: OpsAsset[] = [
  { id: 'sp-a-1', name: 'Game Basketballs (Wilson Evolution)', category: 'Equipment', assignedTo: 'Equipment Room', condition: 'good', location: 'Wellness Center — Equipment Closet' },
  { id: 'sp-a-2', name: 'Hudl Focus Camera System', category: 'Camera', assignedTo: 'Media Coordinator', condition: 'excellent', location: 'Film Room' },
  { id: 'sp-a-3', name: 'Team Van — 15 Passenger', category: 'Vehicle', condition: 'good', location: 'Campus Parking Lot D' },
  { id: 'sp-a-4', name: 'Portable Shot Clocks (x2)', category: 'Equipment', condition: 'needs-repair', location: 'Wellness Center — South End' },
  { id: 'sp-a-5', name: 'Training Cones & Agility Set', category: 'Equipment', assignedTo: 'S&C Coach', condition: 'fair', location: 'Weight Room Storage' },
];

const SPORTS_VENDORS: OpsVendor[] = [
  { id: 'sp-v-1', name: 'Southeastern Charter Bus Co.', category: 'Transportation', contractEnd: '2026-05-31', activeTickets: 1, status: 'active' },
  { id: 'sp-v-2', name: 'Under Armour — Team Outfitter', category: 'Uniforms', contractEnd: '2027-08-01', activeTickets: 0, status: 'active' },
  { id: 'sp-v-3', name: 'Hudl', category: 'IT', contractEnd: '2026-06-30', activeTickets: 0, status: 'active' },
  { id: 'sp-v-4', name: 'Campus Catering Co.', category: 'Catering', contractEnd: '2026-04-15', activeTickets: 2, status: 'pending-renewal' },
];

const SPORTS_FACILITIES: OpsFacility[] = [
  { id: 'sp-f-1', name: 'Wellness Center Gym', location: 'Main Campus', type: 'Arena', maintenanceQueue: 2, status: 'operational' },
  { id: 'sp-f-2', name: 'Weight Room', location: 'Athletic Complex', type: 'Gym', maintenanceQueue: 1, status: 'operational' },
  { id: 'sp-f-3', name: 'Film Room', location: 'Athletic Complex', type: 'Office', maintenanceQueue: 0, status: 'operational' },
];

const SPORTS_TRAVEL: OpsTravelItem[] = [
  { id: 'sp-tr-1', title: 'Away Game — Dakota State University', destination: 'Babson Park, FL', departDate: '2026-02-18', returnDate: '2026-02-18', travelers: 18, status: 'booked' },
  { id: 'sp-tr-2', title: 'Away Game — Multnomah', destination: 'Thomasville, GA', departDate: '2026-02-20', returnDate: '2026-02-22', travelers: 18, status: 'booked' },
  { id: 'sp-tr-3', title: 'Conference Tournament', destination: 'TBD', departDate: '2026-02-28', returnDate: '2026-03-03', travelers: 20, status: 'planned' },
];

const SPORTS_SOPS: OpsSOP[] = [
  { id: 'sp-sop-1', title: 'Game Day Operations Checklist', category: 'Game Day', steps: 18, lastUpdated: '2026-01-15', owner: 'Ops Coordinator' },
  { id: 'sp-sop-2', title: 'Travel Day Protocol', category: 'Travel', steps: 12, lastUpdated: '2026-01-20', owner: 'Ops Coordinator' },
  { id: 'sp-sop-3', title: 'Equipment Inventory & Check Procedure', category: 'Equipment', steps: 8, lastUpdated: '2025-12-10', owner: 'Antoine Brooks' },
  { id: 'sp-sop-4', title: 'Film Upload & Tagging Workflow', category: 'Film', steps: 10, lastUpdated: '2026-02-01', owner: 'Media Coordinator' },
  { id: 'sp-sop-5', title: 'Recruiting Visit Hosting Guide', category: 'Recruiting', steps: 14, lastUpdated: '2026-01-05', owner: 'Alex Morgan' },
];

const SPORTS_REPORTS: OpsReport[] = [
  { id: 'sp-r-1', title: 'Weekly Operations Snapshot — W7', type: 'Weekly Snapshot', generatedAt: '2026-02-14', owner: 'Ops Coordinator' },
  { id: 'sp-r-2', title: 'January Travel Expense Report', type: 'Monthly Summary', generatedAt: '2026-02-01', owner: 'Alex Morgan' },
  { id: 'sp-r-3', title: 'Home Game Report — vs. Johnson University', type: 'Event Report', generatedAt: '2026-02-12', owner: 'Media Coordinator' },
];

const SPORTS_CADENCE: OpsCadenceMeeting[] = [
  { id: 'sp-c-1', title: 'Daily Coaches Huddle', frequency: 'Daily', nextDate: '2026-02-17', time: '7:30 AM', attendees: ['Alex Morgan', 'Coach Harris', 'S&C Coach'], agenda: 'Practice plan review, injury updates, schedule adjustments' },
  { id: 'sp-c-2', title: 'Weekly Staff Meeting', frequency: 'Weekly', nextDate: '2026-02-19', time: '2:00 PM', attendees: ['Alex Morgan', 'Coach Harris', 'Ops Coordinator', 'Antoine Brooks', 'Media Coordinator'], agenda: 'Week review, upcoming schedule, open issues' },
  { id: 'sp-c-3', title: 'Recruiting Sync', frequency: 'Bi-weekly', nextDate: '2026-02-19', time: '4:00 PM', attendees: ['Alex Morgan', 'Coach Harris'], agenda: 'Portal updates, visit schedules, offer board' },
  { id: 'sp-c-4', title: 'Monthly Operations Review', frequency: 'Monthly', nextDate: '2026-03-01', time: '10:00 AM', attendees: ['Alex Morgan', 'Ops Coordinator', 'AD'], agenda: 'Budget review, facilities updates, vendor contracts, compliance' },
];

const SPORTS_DASHBOARD: DashboardBlock[] = [
  { id: 'sp-d-1', label: 'Open Tasks', icon: 'checkmark.circle', value: '6', subValue: '2 overdue', color: '#B8943E' },
  { id: 'sp-d-2', label: 'Active Work Orders', icon: 'wrench.and.screwdriver', value: '3', color: '#1A1714' },
  { id: 'sp-d-3', label: 'Open Issues', icon: 'exclamationmark.triangle', value: '3', subValue: '1 critical', color: '#B85C5C' },
  { id: 'sp-d-4', label: 'Upcoming Travel', icon: 'airplane', value: '3', subValue: 'Next: Feb 18', color: '#5A8A6E' },
  { id: 'sp-d-5', label: 'Assets Tracked', icon: 'cube.box', value: '5', subValue: '1 needs repair', color: '#9C9790' },
  { id: 'sp-d-6', label: 'Active Vendors', icon: 'building.2', value: '4', subValue: '1 pending renewal', color: '#B8943E' },
  { id: 'sp-d-7', label: 'Facilities', icon: 'mappin.and.ellipse', value: '3', subValue: 'All operational', color: '#5A8A6E' },
  { id: 'sp-d-8', label: 'SOPs', icon: 'doc.text', value: '5', color: '#1A1714' },
];

const SPORTS_AUDIT: OpsAuditEntry[] = [
  { id: 'sp-au-1', action: 'task.created', actor: 'Alex Morgan', timestamp: '2026-02-16T14:22:00Z', timestampMs: 1739714520000, description: 'Created task "Recruiting follow-up — top 5 portal targets"' },
  { id: 'sp-au-2', action: 'work-order.status', actor: 'Facilities Mgr', timestamp: '2026-02-16T11:05:00Z', timestampMs: 1739703900000, description: 'Work order "Repair shot clock" moved to Active' },
  { id: 'sp-au-3', action: 'issue.reported', actor: 'Ops Coordinator', timestamp: '2026-02-15T16:30:00Z', timestampMs: 1739637000000, description: 'Reported issue "Bus company double-booked on Feb 20"' },
  { id: 'sp-au-4', action: 'travel.booked', actor: 'Ops Coordinator', timestamp: '2026-02-15T10:15:00Z', timestampMs: 1739614500000, description: 'Booked travel "Away Game — Multnomah"' },
  { id: 'sp-au-5', action: 'task.completed', actor: 'Ops Coordinator', timestamp: '2026-02-14T17:00:00Z', timestampMs: 1739552400000, description: 'Completed task "Book charter bus — Multnomah trip"' },
  { id: 'sp-au-6', action: 'sop.updated', actor: 'Ops Coordinator', timestamp: '2026-02-14T09:30:00Z', timestampMs: 1739525400000, description: 'Updated SOP "Travel Day Protocol" — added emergency contact step' },
  { id: 'sp-au-7', action: 'asset.flagged', actor: 'Antoine Brooks', timestamp: '2026-02-13T15:00:00Z', timestampMs: 1739458800000, description: 'Flagged asset "Portable Shot Clocks" as needs-repair' },
  { id: 'sp-au-8', action: 'vendor.ticket', actor: 'Ops Coordinator', timestamp: '2026-02-12T14:20:00Z', timestampMs: 1739369200000, description: 'Opened ticket with Campus Catering Co. — pregame meal change request' },
  { id: 'sp-au-9', action: 'issue.resolved', actor: 'AV Tech', timestamp: '2026-02-10T11:45:00Z', timestampMs: 1739187900000, description: 'Resolved issue "Scoreboard software crash" — updated to v3.2.1' },
  { id: 'sp-au-10', action: 'report.generated', actor: 'Ops Coordinator', timestamp: '2026-02-14T08:00:00Z', timestampMs: 1739520000000, description: 'Generated "Weekly Operations Snapshot — W7"' },
];

// =============================================================================
// EDUCATION MODE — Mock Data
// =============================================================================

const EDUCATION_TASKS: OpsTask[] = [
  { id: 'ed-t-1', title: 'Finalize Spring course schedule publication', owner: 'Registrar', ownerInitials: 'RG', dueDate: '2026-02-18', priority: 'P0', status: 'active', unit: 'Institution' },
  { id: 'ed-t-2', title: 'Process admissions batch — Feb cohort', owner: 'Admissions Office', ownerInitials: 'AO', dueDate: '2026-02-19', priority: 'P1', status: 'active', unit: 'Institution' },
  { id: 'ed-t-3', title: 'Facility booking — Lecture Hall A midterms', owner: 'Facilities Coord', ownerInitials: 'FC', dueDate: '2026-02-20', priority: 'P1', status: 'draft', unit: 'Department' },
  { id: 'ed-t-4', title: 'Midterm assessment prep — proctor assignments', owner: 'Dr. Chen', ownerInitials: 'DC', dueDate: '2026-02-22', priority: 'P1', status: 'active', unit: 'Department' },
  { id: 'ed-t-5', title: 'Student support case — academic probation reviews', owner: 'Dean of Students', ownerInitials: 'DS', dueDate: '2026-02-21', priority: 'P2', status: 'active', unit: 'Institution' },
  { id: 'ed-t-6', title: 'Accreditation self-study — chapter 3 draft', owner: 'Dr. Hardrick', ownerInitials: 'DH', dueDate: '2026-03-01', priority: 'P0', status: 'active', unit: 'Organization' },
  { id: 'ed-t-7', title: 'Update course catalog — online portal', owner: 'IT Department', ownerInitials: 'IT', dueDate: '2026-02-22', priority: 'P2', status: 'draft', unit: 'Institution' },
  { id: 'ed-t-8', title: 'Commencement speaker confirmations', owner: 'Dean of Students', ownerInitials: 'DS', dueDate: '2026-03-05', priority: 'P3', status: 'draft', unit: 'Organization' },
];

const EDUCATION_WORK_ORDERS: OpsWorkOrder[] = [
  { id: 'ed-wo-1', title: 'Replace projector bulb — Lecture Hall A', requestedBy: 'Faculty Senate', assignedTo: 'AV Technician', assignedToInitials: 'AV', dueDate: '2026-02-19', priority: 'P1', status: 'active', category: 'Equipment' },
  { id: 'ed-wo-2', title: 'Science Lab 201 — fume hood recalibration', requestedBy: 'Lab Manager', assignedTo: 'Facilities Mgr', assignedToInitials: 'FM', dueDate: '2026-02-25', priority: 'P0', status: 'active', category: 'Facilities' },
  { id: 'ed-wo-3', title: 'IT setup — new faculty laptops (x4)', requestedBy: 'Provost Office', assignedTo: 'IT Department', assignedToInitials: 'IT', dueDate: '2026-02-28', priority: 'P2', status: 'draft', category: 'IT' },
  { id: 'ed-wo-4', title: 'Open House event setup — Student Center', requestedBy: 'Admissions Office', assignedTo: 'Events Team', assignedToInitials: 'ET', dueDate: '2026-02-20', priority: 'P1', status: 'active', category: 'Event Setup' },
];

const EDUCATION_ISSUES: OpsIssue[] = [
  { id: 'ed-i-1', title: 'WiFi outage — Science Building 2nd floor', severity: 'high', owner: 'IT Department', ownerInitials: 'IT', status: 'active', reportedAt: '2026-02-14', category: 'Technology' },
  { id: 'ed-i-2', title: 'Elevator out of service — Main Library', severity: 'medium', owner: 'Facilities Mgr', ownerInitials: 'FM', status: 'active', reportedAt: '2026-02-13', category: 'Facilities' },
  { id: 'ed-i-3', title: 'Student portal login errors — SSO redirect loop', severity: 'critical', owner: 'IT Department', ownerInitials: 'IT', status: 'blocked', reportedAt: '2026-02-15', category: 'Technology' },
  { id: 'ed-i-4', title: 'Parking lot B — pothole near handicap spots', severity: 'low', owner: 'Facilities Mgr', ownerInitials: 'FM', status: 'complete', resolution: 'Repaired by grounds crew 2/12', reportedAt: '2026-02-08', category: 'Grounds' },
];

const EDUCATION_ASSETS: OpsAsset[] = [
  { id: 'ed-a-1', name: 'Student Laptops (Checkout Pool)', category: 'Device', assignedTo: 'Library Media Desk', condition: 'fair', location: 'University Library' },
  { id: 'ed-a-2', name: 'Chemistry Lab Equipment Set', category: 'Equipment', assignedTo: 'Lab Manager', condition: 'good', location: 'Science Lab 201' },
  { id: 'ed-a-3', name: 'Classroom AV System (x18)', category: 'Equipment', condition: 'good', location: 'Multi-Building' },
  { id: 'ed-a-4', name: 'Campus Shuttle Van', category: 'Vehicle', condition: 'good', location: 'Transport Depot' },
  { id: 'ed-a-5', name: 'Lecture Capture Recording Systems (x4)', category: 'Camera', assignedTo: 'AV Technician', condition: 'excellent', location: 'Lecture Halls A-D' },
];

const EDUCATION_VENDORS: OpsVendor[] = [
  { id: 'ed-v-1', name: 'Blackboard LMS', category: 'IT', contractEnd: '2026-07-31', activeTickets: 1, status: 'active' },
  { id: 'ed-v-2', name: 'Aramark Dining Services', category: 'Catering', contractEnd: '2026-06-30', activeTickets: 0, status: 'active' },
  { id: 'ed-v-3', name: 'Dell Technologies — Education', category: 'IT', contractEnd: '2026-03-15', activeTickets: 1, status: 'pending-renewal' },
  { id: 'ed-v-4', name: 'HVAC Solutions Inc.', category: 'Facilities', contractEnd: '2027-01-01', activeTickets: 0, status: 'active' },
];

const EDUCATION_FACILITIES: OpsFacility[] = [
  { id: 'ed-f-1', name: 'Lecture Hall A', location: 'Academic Building', type: 'Classroom', maintenanceQueue: 1, status: 'operational' },
  { id: 'ed-f-2', name: 'Science Lab 201', location: 'Science Building', type: 'Classroom', maintenanceQueue: 1, status: 'partial' },
  { id: 'ed-f-3', name: 'University Library', location: 'Central Campus', type: 'Office', maintenanceQueue: 1, status: 'operational' },
];

const EDUCATION_TRAVEL: OpsTravelItem[] = [
  { id: 'ed-tr-1', title: 'Accreditation Conference', destination: 'Helena, MT', departDate: '2026-03-10', returnDate: '2026-03-12', travelers: 4, status: 'booked' },
  { id: 'ed-tr-2', title: 'Faculty Development Workshop', destination: 'Orlando, FL', departDate: '2026-03-20', returnDate: '2026-03-22', travelers: 6, status: 'planned' },
];

const EDUCATION_SOPS: OpsSOP[] = [
  { id: 'ed-sop-1', title: 'Course Registration & Drop/Add Process', category: 'Academic', steps: 10, lastUpdated: '2026-01-08', owner: 'Registrar' },
  { id: 'ed-sop-2', title: 'Admissions Application Review Workflow', category: 'Admissions', steps: 14, lastUpdated: '2025-11-20', owner: 'Admissions Office' },
  { id: 'ed-sop-3', title: 'Classroom Technology Setup & Troubleshooting', category: 'IT', steps: 8, lastUpdated: '2026-01-15', owner: 'IT Department' },
  { id: 'ed-sop-4', title: 'Academic Integrity Investigation Procedure', category: 'Student Affairs', steps: 12, lastUpdated: '2025-10-30', owner: 'Dean of Students' },
  { id: 'ed-sop-5', title: 'Commencement Ceremony Planning Guide', category: 'Events', steps: 22, lastUpdated: '2026-02-01', owner: 'Events Team' },
];

const EDUCATION_REPORTS: OpsReport[] = [
  { id: 'ed-r-1', title: 'Weekly Campus Operations Summary — W7', type: 'Weekly Snapshot', generatedAt: '2026-02-14', owner: 'Facilities Coord' },
  { id: 'ed-r-2', title: 'Enrollment Projections — Fall 2026', type: 'Monthly Summary', generatedAt: '2026-02-10', owner: 'Registrar' },
  { id: 'ed-r-3', title: 'Open House Event Report — Feb 2026', type: 'Event Report', generatedAt: '2026-02-12', owner: 'Admissions Office' },
];

const EDUCATION_CADENCE: OpsCadenceMeeting[] = [
  { id: 'ed-c-1', title: 'Faculty Senate Meeting', frequency: 'Monthly', nextDate: '2026-03-18', time: '3:00 PM', attendees: ['Dr. Hardrick', 'Dr. Chen', 'Faculty Reps'], agenda: 'Curriculum updates, accreditation status, student affairs' },
  { id: 'ed-c-2', title: 'Weekly Ops Standup', frequency: 'Weekly', nextDate: '2026-02-19', time: '9:00 AM', attendees: ['Facilities Coord', 'IT Department', 'Events Team'], agenda: 'Open work orders, facility issues, upcoming events' },
  { id: 'ed-c-3', title: 'Admissions Review Board', frequency: 'Bi-weekly', nextDate: '2026-02-20', time: '1:00 PM', attendees: ['Admissions Office', 'Dean of Students', 'Financial Aid'], agenda: 'Application batch review, financial aid decisions' },
  { id: 'ed-c-4', title: 'Curriculum Committee', frequency: 'Monthly', nextDate: '2026-03-05', time: '1:00 PM', attendees: ['Dr. Chen', 'Department Chairs', 'Registrar'], agenda: 'New course proposals, program changes, catalog updates' },
];

const EDUCATION_DASHBOARD: DashboardBlock[] = [
  { id: 'ed-d-1', label: 'Open Tasks', icon: 'checkmark.circle', value: '7', subValue: '2 P0', color: '#B85C5C' },
  { id: 'ed-d-2', label: 'Work Orders', icon: 'wrench.and.screwdriver', value: '4', subValue: '2 active', color: '#1A1714' },
  { id: 'ed-d-3', label: 'Open Issues', icon: 'exclamationmark.triangle', value: '3', subValue: '1 critical', color: '#B85C5C' },
  { id: 'ed-d-4', label: 'Enrollment Pipeline', icon: 'person.2', value: '142', subValue: 'Pending review', color: '#5A8A6E' },
  { id: 'ed-d-5', label: 'Facilities Status', icon: 'building.2', value: '2/3', subValue: 'Fully operational', color: '#B8943E' },
  { id: 'ed-d-6', label: 'Upcoming Travel', icon: 'airplane', value: '2', subValue: 'Next: Mar 10', color: '#9C9790' },
  { id: 'ed-d-7', label: 'Accreditation Deadline', icon: 'calendar.badge.clock', value: '14 days', color: '#B8943E' },
  { id: 'ed-d-8', label: 'SOPs', icon: 'doc.text', value: '5', color: '#1A1714' },
];

const EDUCATION_AUDIT: OpsAuditEntry[] = [
  { id: 'ed-au-1', action: 'task.created', actor: 'Registrar', timestamp: '2026-02-16T10:00:00Z', timestampMs: 1739700000000, description: 'Created task "Finalize Spring course schedule publication"' },
  { id: 'ed-au-2', action: 'issue.reported', actor: 'IT Department', timestamp: '2026-02-15T14:20:00Z', timestampMs: 1739629200000, description: 'Reported issue "Student portal login errors — SSO redirect loop"' },
  { id: 'ed-au-3', action: 'work-order.created', actor: 'Lab Manager', timestamp: '2026-02-15T09:00:00Z', timestampMs: 1739610000000, description: 'Created work order "Fume hood recalibration — Science Lab 201"' },
  { id: 'ed-au-4', action: 'issue.resolved', actor: 'Facilities Mgr', timestamp: '2026-02-12T16:30:00Z', timestampMs: 1739378600000, description: 'Resolved "Parking lot B pothole" — repaired by grounds crew' },
  { id: 'ed-au-5', action: 'travel.booked', actor: 'Dr. Hardrick', timestamp: '2026-02-12T11:00:00Z', timestampMs: 1739358800000, description: 'Booked travel "Accreditation Conference — Atlanta"' },
  { id: 'ed-au-6', action: 'sop.updated', actor: 'Events Team', timestamp: '2026-02-01T14:00:00Z', timestampMs: 1738414800000, description: 'Updated SOP "Commencement Ceremony Planning Guide"' },
  { id: 'ed-au-7', action: 'vendor.ticket', actor: 'IT Department', timestamp: '2026-02-10T10:30:00Z', timestampMs: 1739183400000, description: 'Opened ticket with Dell Technologies — laptop warranty claim' },
  { id: 'ed-au-8', action: 'report.generated', actor: 'Facilities Coord', timestamp: '2026-02-14T08:00:00Z', timestampMs: 1739520000000, description: 'Generated "Weekly Campus Operations Summary — W7"' },
  { id: 'ed-au-9', action: 'asset.updated', actor: 'AV Technician', timestamp: '2026-02-13T13:45:00Z', timestampMs: 1739453100000, description: 'Updated asset "Lecture Capture Recording Systems" — condition: excellent' },
  { id: 'ed-au-10', action: 'task.completed', actor: 'Lab Manager', timestamp: '2026-02-11T17:00:00Z', timestampMs: 1739293200000, description: 'Completed task "Order lab supplies — Spring semester"' },
];

// =============================================================================
// CHURCH MODE — Mock Data
// =============================================================================

const CHURCH_TASKS: OpsTask[] = [
  { id: 'ch-t-1', title: 'Sunday service prep — sermon notes & slides', owner: 'Pastor Carter', ownerInitials: 'PK', dueDate: '2026-02-21', priority: 'P0', status: 'active', unit: 'Campus' },
  { id: 'ch-t-2', title: 'Volunteer scheduling — ushers & greeters rotation', owner: 'Min. Davis', ownerInitials: 'MD', dueDate: '2026-02-19', priority: 'P1', status: 'active', unit: 'Campus' },
  { id: 'ch-t-3', title: 'Youth ministry event setup — Friday night', owner: 'Youth Director', ownerInitials: 'YD', dueDate: '2026-02-20', priority: 'P1', status: 'draft', unit: 'Ministry' },
  { id: 'ch-t-4', title: 'Care team follow-up — hospital visit list', owner: 'Deacon Board', ownerInitials: 'DB', dueDate: '2026-02-19', priority: 'P1', status: 'active', unit: 'Ministry' },
  { id: 'ch-t-5', title: 'Media prep — livestream graphics & lower thirds', owner: 'Media Team', ownerInitials: 'MT', dueDate: '2026-02-21', priority: 'P1', status: 'draft', unit: 'Campus' },
  { id: 'ch-t-6', title: 'Order communion supplies — bulk restock', owner: 'Deacon Board', ownerInitials: 'DB', dueDate: '2026-02-25', priority: 'P2', status: 'draft', unit: 'Organization' },
  { id: 'ch-t-7', title: 'Community outreach — food drive coordination', owner: 'Outreach Coord', ownerInitials: 'OC', dueDate: '2026-02-21', priority: 'P2', status: 'active', unit: 'Ministry' },
];

const CHURCH_WORK_ORDERS: OpsWorkOrder[] = [
  { id: 'ch-wo-1', title: 'AV system maintenance — main sanctuary mixer', requestedBy: 'Tech Team Lead', assignedTo: 'AV Contractor', assignedToInitials: 'AC', dueDate: '2026-02-20', priority: 'P1', status: 'active', category: 'Equipment' },
  { id: 'ch-wo-2', title: 'Parking lot restriping — handicap spots faded', requestedBy: 'Admin Office', assignedTo: 'Grounds Crew', assignedToInitials: 'GC', dueDate: '2026-02-28', priority: 'P2', status: 'draft', category: 'Facilities' },
  { id: 'ch-wo-3', title: 'Fellowship Hall setup — Marriage Enrichment Seminar', requestedBy: 'Min. Davis', assignedTo: 'Facilities Team', assignedToInitials: 'FT', dueDate: '2026-02-27', priority: 'P1', status: 'draft', category: 'Event Setup' },
];

const CHURCH_ISSUES: OpsIssue[] = [
  { id: 'ch-i-1', title: 'Projector flickering — main sanctuary screen left', severity: 'high', owner: 'Tech Team Lead', ownerInitials: 'TT', status: 'active', reportedAt: '2026-02-14', category: 'AV' },
  { id: 'ch-i-2', title: 'Fellowship Hall A/C not cycling — thermostat issue', severity: 'medium', owner: 'Facilities Team', ownerInitials: 'FT', status: 'active', reportedAt: '2026-02-12', category: 'HVAC' },
  { id: 'ch-i-3', title: 'Nursery door lock sticking — safety concern', severity: 'critical', owner: 'Admin Office', ownerInitials: 'AO', status: 'active', reportedAt: '2026-02-15', category: 'Safety' },
  { id: 'ch-i-4', title: 'Website giving portal — 502 errors on mobile', severity: 'low', owner: 'Media Team', ownerInitials: 'MT', status: 'complete', resolution: 'CDN cache purged, SSL cert renewed', reportedAt: '2026-02-09', category: 'Technology' },
];

const CHURCH_ASSETS: OpsAsset[] = [
  { id: 'ch-a-1', name: 'Sound System (Main Sanctuary)', category: 'Equipment', assignedTo: 'Tech Team Lead', condition: 'good', location: 'Main Sanctuary — Booth' },
  { id: 'ch-a-2', name: 'Livestream Camera Kit (x2)', category: 'Camera', assignedTo: 'Media Team', condition: 'excellent', location: 'Main Sanctuary' },
  { id: 'ch-a-3', name: 'Communion Serving Sets (x4)', category: 'Equipment', condition: 'good', location: 'Kitchen Storage' },
  { id: 'ch-a-4', name: 'Church Van — 12 Passenger', category: 'Vehicle', condition: 'fair', location: 'Rear Parking Lot' },
  { id: 'ch-a-5', name: 'Worship Instruments (Piano, Drums, Guitar Rig)', category: 'Equipment', assignedTo: 'Worship Director', condition: 'good', location: 'Main Sanctuary — Stage' },
];

const CHURCH_VENDORS: OpsVendor[] = [
  { id: 'ch-v-1', name: 'ProPresenter Cloud', category: 'AV', contractEnd: '2026-09-30', activeTickets: 0, status: 'active' },
  { id: 'ch-v-2', name: 'Church Mutual Insurance', category: 'Insurance', contractEnd: '2026-12-31', activeTickets: 0, status: 'active' },
  { id: 'ch-v-3', name: 'ABC Cleaning Services', category: 'Janitorial', contractEnd: '2026-04-30', activeTickets: 1, status: 'pending-renewal' },
];

const CHURCH_FACILITIES: OpsFacility[] = [
  { id: 'ch-f-1', name: 'Main Sanctuary', location: 'Main Campus', type: 'Sanctuary', maintenanceQueue: 1, status: 'operational' },
  { id: 'ch-f-2', name: 'Fellowship Hall', location: 'Main Campus', type: 'Multi-Purpose', maintenanceQueue: 1, status: 'partial' },
  { id: 'ch-f-3', name: 'Youth Center', location: 'Annex Building', type: 'Ministry Space', maintenanceQueue: 0, status: 'operational' },
];

const CHURCH_TRAVEL: OpsTravelItem[] = [
  { id: 'ch-tr-1', title: 'Missions Trip — Haiti', destination: 'Port-au-Prince, Haiti', departDate: '2026-03-15', returnDate: '2026-03-22', travelers: 12, status: 'planned' },
  { id: 'ch-tr-2', title: 'Youth Camp — Lake Placid', destination: 'Lake Placid, FL', departDate: '2026-06-10', returnDate: '2026-06-14', travelers: 30, status: 'planned' },
];

const CHURCH_SOPS: OpsSOP[] = [
  { id: 'ch-sop-1', title: 'Sunday Service Run-of-Show', category: 'Worship', steps: 16, lastUpdated: '2026-02-01', owner: 'Admin Office' },
  { id: 'ch-sop-2', title: 'Volunteer Onboarding & Background Check Process', category: 'People', steps: 10, lastUpdated: '2025-11-15', owner: 'Min. Davis' },
  { id: 'ch-sop-3', title: 'Facility Lockup & Security Protocol', category: 'Security', steps: 8, lastUpdated: '2026-01-10', owner: 'Admin Office' },
  { id: 'ch-sop-4', title: 'Benevolence Request Handling', category: 'Care', steps: 12, lastUpdated: '2025-12-01', owner: 'Deacon Board' },
  { id: 'ch-sop-5', title: 'Livestream Production Checklist', category: 'Media', steps: 14, lastUpdated: '2026-02-05', owner: 'Media Team' },
];

const CHURCH_REPORTS: OpsReport[] = [
  { id: 'ch-r-1', title: 'Weekly Ministry Operations — W7', type: 'Weekly Snapshot', generatedAt: '2026-02-14', owner: 'Admin Office' },
  { id: 'ch-r-2', title: 'January Giving & Attendance Summary', type: 'Monthly Summary', generatedAt: '2026-02-03', owner: 'Admin Office' },
  { id: 'ch-r-3', title: 'Community Outreach Event Report — Jan Food Drive', type: 'Event Report', generatedAt: '2026-01-28', owner: 'Outreach Coord' },
];

const CHURCH_CADENCE: OpsCadenceMeeting[] = [
  { id: 'ch-c-1', title: 'Worship Planning Meeting', frequency: 'Weekly', nextDate: '2026-02-18', time: '10:00 AM', attendees: ['Pastor Carter', 'Worship Director', 'Media Team', 'Tech Team Lead'], agenda: 'Song selection, sermon flow, media assets, AV needs' },
  { id: 'ch-c-2', title: 'Elder Board Meeting', frequency: 'Monthly', nextDate: '2026-03-05', time: '6:30 PM', attendees: ['Pastor Carter', 'Elder Board', 'Admin Office'], agenda: 'Ministry updates, budget review, governance, pastoral care' },
  { id: 'ch-c-3', title: 'Volunteer Coordinators Sync', frequency: 'Bi-weekly', nextDate: '2026-02-20', time: '7:00 PM', attendees: ['Min. Davis', 'Ministry Leaders', 'Youth Director'], agenda: 'Volunteer needs, scheduling gaps, new recruit onboarding' },
  { id: 'ch-c-4', title: 'Missions & Outreach Committee', frequency: 'Monthly', nextDate: '2026-03-10', time: '12:00 PM', attendees: ['Outreach Coord', 'Missions Chair', 'Deacon Board'], agenda: 'Missions trip prep, local outreach calendar, partnerships' },
];

const CHURCH_DASHBOARD: DashboardBlock[] = [
  { id: 'ch-d-1', label: 'Open Tasks', icon: 'checkmark.circle', value: '5', subValue: '2 due this week', color: '#B8943E' },
  { id: 'ch-d-2', label: 'Work Orders', icon: 'wrench.and.screwdriver', value: '3', color: '#1A1714' },
  { id: 'ch-d-3', label: 'Open Issues', icon: 'exclamationmark.triangle', value: '3', subValue: '1 critical', color: '#B85C5C' },
  { id: 'ch-d-4', label: 'Volunteers Scheduled', icon: 'person.3', value: '24', subValue: 'This Sunday', color: '#5A8A6E' },
  { id: 'ch-d-5', label: 'Upcoming Services', icon: 'music.note', value: '3', subValue: 'Next: Sun 10 AM', color: '#FFFFFF' },
  { id: 'ch-d-6', label: 'Active Ministries', icon: 'heart', value: '7', color: '#1A1714' },
  { id: 'ch-d-7', label: 'Facilities', icon: 'building.2', value: '2/3', subValue: 'Fully operational', color: '#B8943E' },
  { id: 'ch-d-8', label: 'Missions Planned', icon: 'globe', value: '2', color: '#9C9790' },
];

const CHURCH_AUDIT: OpsAuditEntry[] = [
  { id: 'ch-au-1', action: 'task.created', actor: 'Admin Office', timestamp: '2026-02-16T09:00:00Z', timestampMs: 1739696400000, description: 'Created task "Sunday service prep — sermon notes & slides"' },
  { id: 'ch-au-2', action: 'issue.reported', actor: 'Admin Office', timestamp: '2026-02-15T11:30:00Z', timestampMs: 1739619000000, description: 'Reported issue "Nursery door lock sticking — safety concern"' },
  { id: 'ch-au-3', action: 'work-order.created', actor: 'Tech Team Lead', timestamp: '2026-02-14T14:00:00Z', timestampMs: 1739541600000, description: 'Created work order "AV system maintenance — main sanctuary mixer"' },
  { id: 'ch-au-4', action: 'sop.updated', actor: 'Media Team', timestamp: '2026-02-05T10:00:00Z', timestampMs: 1738746000000, description: 'Updated SOP "Livestream Production Checklist" — added backup streaming step' },
  { id: 'ch-au-5', action: 'issue.resolved', actor: 'Media Team', timestamp: '2026-02-10T15:00:00Z', timestampMs: 1739199600000, description: 'Resolved "Website giving portal 502 errors" — CDN cache purged' },
  { id: 'ch-au-6', action: 'vendor.ticket', actor: 'Admin Office', timestamp: '2026-02-11T09:30:00Z', timestampMs: 1739266200000, description: 'Opened ticket with ABC Cleaning Services — schedule adjustment' },
  { id: 'ch-au-7', action: 'asset.updated', actor: 'Media Team', timestamp: '2026-02-13T11:00:00Z', timestampMs: 1739443200000, description: 'Updated asset "Livestream Camera Kit" — condition: excellent' },
  { id: 'ch-au-8', action: 'report.generated', actor: 'Admin Office', timestamp: '2026-02-14T08:00:00Z', timestampMs: 1739520000000, description: 'Generated "Weekly Ministry Operations — W7"' },
  { id: 'ch-au-9', action: 'task.completed', actor: 'Tech Team Lead', timestamp: '2026-02-09T17:00:00Z', timestampMs: 1739120400000, description: 'Completed task "Soundcheck — Wednesday Bible Study"' },
  { id: 'ch-au-10', action: 'travel.planned', actor: 'Missions Chair', timestamp: '2026-02-08T14:00:00Z', timestampMs: 1739023200000, description: 'Created travel plan "Missions Trip — Haiti"' },
];

// =============================================================================
// BUSINESS MODE — Mock Data
// =============================================================================

const BUSINESS_TASKS: OpsTask[] = [
  { id: 'en-t-1', title: 'Sprint planning — Q2 product roadmap', owner: 'Engineering Lead', ownerInitials: 'EL', dueDate: '2026-02-24', priority: 'P0', status: 'active', unit: 'Entity' },
  { id: 'en-t-2', title: 'Vendor review — cloud infrastructure renewal', owner: 'CTO', ownerInitials: 'CT', dueDate: '2026-02-20', priority: 'P1', status: 'active', unit: 'Entity' },
  { id: 'en-t-3', title: 'Office setup — new hires onboarding stations', owner: 'Operations Mgr', ownerInitials: 'OM', dueDate: '2026-02-21', priority: 'P1', status: 'draft', unit: 'Department' },
  { id: 'en-t-4', title: 'Hiring pipeline — senior backend interviews', owner: 'HR Director', ownerInitials: 'HR', dueDate: '2026-03-01', priority: 'P1', status: 'active', unit: 'Department' },
  { id: 'en-t-5', title: 'Client onboarding — Acme Corp integration kickoff', owner: 'CS Lead', ownerInitials: 'CL', dueDate: '2026-02-22', priority: 'P0', status: 'active', unit: 'Entity' },
  { id: 'en-t-6', title: 'Q1 financial report — draft for board review', owner: 'CFO', ownerInitials: 'CF', dueDate: '2026-02-20', priority: 'P0', status: 'active', unit: 'Organization' },
  { id: 'en-t-7', title: 'Marketing launch assets — product v2.1 campaign', owner: 'Marketing Dir', ownerInitials: 'MD', dueDate: '2026-02-23', priority: 'P2', status: 'active', unit: 'Entity' },
  { id: 'en-t-8', title: 'Renew office lease — 3rd floor extension', owner: 'Operations Mgr', ownerInitials: 'OM', dueDate: '2026-03-15', priority: 'P3', status: 'draft', unit: 'Organization' },
];

const BUSINESS_WORK_ORDERS: OpsWorkOrder[] = [
  { id: 'en-wo-1', title: 'Conference room AV upgrade — 4K display install', requestedBy: 'CTO', assignedTo: 'IT Ops', assignedToInitials: 'IO', dueDate: '2026-02-25', priority: 'P2', status: 'active', category: 'IT' },
  { id: 'en-wo-2', title: 'Standing desk assembly — new hires (x3)', requestedBy: 'HR Director', assignedTo: 'Office Services', assignedToInitials: 'OS', dueDate: '2026-02-20', priority: 'P1', status: 'active', category: 'Facilities' },
  { id: 'en-wo-3', title: 'Server room cooling unit maintenance', requestedBy: 'Engineering Lead', assignedTo: 'HVAC Vendor', assignedToInitials: 'HV', dueDate: '2026-02-28', priority: 'P0', status: 'active', category: 'Facilities' },
  { id: 'en-wo-4', title: 'Product launch event setup — demo stations', requestedBy: 'Marketing Dir', assignedTo: 'Events Team', assignedToInitials: 'ET', dueDate: '2026-02-24', priority: 'P1', status: 'draft', category: 'Event Setup' },
];

const BUSINESS_ISSUES: OpsIssue[] = [
  { id: 'en-i-1', title: 'Production API latency spike — P95 > 800ms', severity: 'critical', owner: 'Engineering Lead', ownerInitials: 'EL', status: 'active', reportedAt: '2026-02-15', category: 'Infrastructure' },
  { id: 'en-i-2', title: 'Office WiFi dead zone — east wing 3rd floor', severity: 'medium', owner: 'IT Ops', ownerInitials: 'IO', status: 'active', reportedAt: '2026-02-13', category: 'IT' },
  { id: 'en-i-3', title: 'Badge reader malfunction — main entrance', severity: 'high', owner: 'Office Services', ownerInitials: 'OS', status: 'active', reportedAt: '2026-02-14', category: 'Security' },
  { id: 'en-i-4', title: 'Zoom room license expired — Conference Room B', severity: 'low', owner: 'IT Ops', ownerInitials: 'IO', status: 'complete', resolution: 'License renewed through 2027', reportedAt: '2026-02-08', category: 'IT' },
];

const BUSINESS_ASSETS: OpsAsset[] = [
  { id: 'en-a-1', name: 'Employee MacBooks (Pool)', category: 'Device', assignedTo: 'IT Ops', condition: 'good', location: 'IT Storage Closet' },
  { id: 'en-a-2', name: 'Server Rack — Production (x2)', category: 'Equipment', condition: 'excellent', location: 'Server Room' },
  { id: 'en-a-3', name: 'Presentation Equipment — Projector Kit', category: 'Equipment', assignedTo: 'Office Services', condition: 'fair', location: 'Conference Room A' },
  { id: 'en-a-4', name: 'Standing Desks (x35)', category: 'Furniture', condition: 'good', location: 'Main Office — 3rd Floor' },
  { id: 'en-a-5', name: 'Company Vehicle — Sedan', category: 'Vehicle', condition: 'good', location: 'Building Garage — Spot 4' },
];

const BUSINESS_VENDORS: OpsVendor[] = [
  { id: 'en-v-1', name: 'AWS — Cloud Infrastructure', category: 'IT', contractEnd: '2026-12-31', activeTickets: 1, status: 'active' },
  { id: 'en-v-2', name: 'WeWork — Flex Office Space', category: 'Facilities', contractEnd: '2026-06-30', activeTickets: 0, status: 'active' },
  { id: 'en-v-3', name: 'Gusto — Payroll & Benefits', category: 'HR', contractEnd: '2026-08-15', activeTickets: 0, status: 'active' },
  { id: 'en-v-4', name: 'Catering by Design', category: 'Catering', contractEnd: '2026-03-01', activeTickets: 1, status: 'pending-renewal' },
];

const BUSINESS_FACILITIES: OpsFacility[] = [
  { id: 'en-f-1', name: 'Main Office — 3rd Floor', location: 'HQ Building', type: 'Office', maintenanceQueue: 1, status: 'operational' },
  { id: 'en-f-2', name: 'HQ Conference Room', location: 'HQ Building', type: 'Office', maintenanceQueue: 0, status: 'operational' },
  { id: 'en-f-3', name: 'Event Space — Level 1', location: 'HQ Building', type: 'Event Space', maintenanceQueue: 0, status: 'operational' },
];

const BUSINESS_TRAVEL: OpsTravelItem[] = [
  { id: 'en-tr-1', title: 'Investor Roadshow', destination: 'San Francisco, CA', departDate: '2026-03-03', returnDate: '2026-03-05', travelers: 3, status: 'booked' },
  { id: 'en-tr-2', title: 'Tech Conference — SXSW', destination: 'Austin, TX', departDate: '2026-03-15', returnDate: '2026-03-18', travelers: 5, status: 'planned' },
  { id: 'en-tr-3', title: 'Client Kickoff — Acme Corp', destination: 'Chicago, IL', departDate: '2026-02-25', returnDate: '2026-02-26', travelers: 2, status: 'booked' },
];

const BUSINESS_SOPS: OpsSOP[] = [
  { id: 'en-sop-1', title: 'New Employee Onboarding Checklist', category: 'HR', steps: 16, lastUpdated: '2026-01-20', owner: 'HR Director' },
  { id: 'en-sop-2', title: 'Incident Response & Escalation Procedure', category: 'Engineering', steps: 12, lastUpdated: '2026-02-01', owner: 'Engineering Lead' },
  { id: 'en-sop-3', title: 'Vendor Evaluation & Procurement Process', category: 'Operations', steps: 10, lastUpdated: '2025-12-15', owner: 'Operations Mgr' },
  { id: 'en-sop-4', title: 'Client Onboarding & Integration Workflow', category: 'Customer Success', steps: 14, lastUpdated: '2026-01-28', owner: 'CS Lead' },
  { id: 'en-sop-5', title: 'Product Release & Deployment Runbook', category: 'Engineering', steps: 20, lastUpdated: '2026-02-10', owner: 'Engineering Lead' },
];

const BUSINESS_REPORTS: OpsReport[] = [
  { id: 'en-r-1', title: 'Weekly Ops Summary — W7', type: 'Weekly Snapshot', generatedAt: '2026-02-14', owner: 'Operations Mgr' },
  { id: 'en-r-2', title: 'Q4 2025 Operations Review', type: 'Monthly Summary', generatedAt: '2026-01-15', owner: 'COO' },
  { id: 'en-r-3', title: 'Product Launch Readiness Report — v2.1', type: 'Event Report', generatedAt: '2026-02-13', owner: 'Engineering Lead' },
];

const BUSINESS_CADENCE: OpsCadenceMeeting[] = [
  { id: 'en-c-1', title: 'Engineering Standup', frequency: 'Daily', nextDate: '2026-02-17', time: '9:30 AM', attendees: ['Engineering Lead', 'Backend Team', 'Frontend Team', 'QA'], agenda: 'Blockers, sprint progress, deploy schedule' },
  { id: 'en-c-2', title: 'All-Hands', frequency: 'Weekly', nextDate: '2026-02-18', time: '11:00 AM', attendees: ['CEO', 'All Staff'], agenda: 'Company updates, team wins, open Q&A' },
  { id: 'en-c-3', title: 'Board Meeting', frequency: 'Monthly', nextDate: '2026-03-19', time: '10:00 AM', attendees: ['CEO', 'CFO', 'CTO', 'Board Members'], agenda: 'Financials, product roadmap, fundraising, governance' },
  { id: 'en-c-4', title: 'Investor Update Call', frequency: 'Monthly', nextDate: '2026-03-21', time: '3:00 PM', attendees: ['CEO', 'CFO'], agenda: 'KPIs, runway, upcoming milestones' },
];

const BUSINESS_DASHBOARD: DashboardBlock[] = [
  { id: 'en-d-1', label: 'Open Tasks', icon: 'checkmark.circle', value: '7', subValue: '3 P0', color: '#B85C5C' },
  { id: 'en-d-2', label: 'Work Orders', icon: 'wrench.and.screwdriver', value: '4', subValue: '3 active', color: '#1A1714' },
  { id: 'en-d-3', label: 'Open Issues', icon: 'exclamationmark.triangle', value: '3', subValue: '1 critical', color: '#B85C5C' },
  { id: 'en-d-4', label: 'Hiring Pipeline', icon: 'person.badge.plus', value: '3', subValue: 'Active roles', color: '#5A8A6E' },
  { id: 'en-d-5', label: 'Vendor Contracts', icon: 'building.2', value: '4', subValue: '1 pending renewal', color: '#B8943E' },
  { id: 'en-d-6', label: 'Upcoming Travel', icon: 'airplane', value: '3', subValue: 'Next: Feb 25', color: '#9C9790' },
  { id: 'en-d-7', label: 'Burn Rate', icon: 'chart.line.downtrend.xyaxis', value: '$42K', subValue: '/month', color: '#FFFFFF' },
  { id: 'en-d-8', label: 'SOPs', icon: 'doc.text', value: '5', color: '#1A1714' },
];

const BUSINESS_AUDIT: OpsAuditEntry[] = [
  { id: 'en-au-1', action: 'task.created', actor: 'Engineering Lead', timestamp: '2026-02-16T15:00:00Z', timestampMs: 1739718000000, description: 'Created task "Sprint planning — Q2 product roadmap"' },
  { id: 'en-au-2', action: 'issue.reported', actor: 'Engineering Lead', timestamp: '2026-02-15T22:15:00Z', timestampMs: 1739657700000, description: 'Reported issue "Production API latency spike — P95 > 800ms"' },
  { id: 'en-au-3', action: 'work-order.created', actor: 'Engineering Lead', timestamp: '2026-02-15T10:00:00Z', timestampMs: 1739613600000, description: 'Created work order "Server room cooling unit maintenance"' },
  { id: 'en-au-4', action: 'task.completed', actor: 'CEO', timestamp: '2026-02-14T16:00:00Z', timestampMs: 1739548800000, description: 'Completed task "Update investor deck"' },
  { id: 'en-au-5', action: 'travel.booked', actor: 'CFO', timestamp: '2026-02-14T11:30:00Z', timestampMs: 1739532600000, description: 'Booked travel "Investor Roadshow — San Francisco"' },
  { id: 'en-au-6', action: 'vendor.ticket', actor: 'IT Ops', timestamp: '2026-02-13T09:00:00Z', timestampMs: 1739437200000, description: 'Opened ticket with AWS — billing anomaly investigation' },
  { id: 'en-au-7', action: 'sop.updated', actor: 'Engineering Lead', timestamp: '2026-02-10T14:00:00Z', timestampMs: 1739196000000, description: 'Updated SOP "Product Release & Deployment Runbook" — added canary deploy step' },
  { id: 'en-au-8', action: 'issue.resolved', actor: 'IT Ops', timestamp: '2026-02-08T12:00:00Z', timestampMs: 1739016000000, description: 'Resolved "Zoom room license expired" — renewed through 2027' },
  { id: 'en-au-9', action: 'report.generated', actor: 'Operations Mgr', timestamp: '2026-02-14T08:00:00Z', timestampMs: 1739520000000, description: 'Generated "Weekly Ops Summary — W7"' },
  { id: 'en-au-10', action: 'asset.updated', actor: 'IT Ops', timestamp: '2026-02-12T10:30:00Z', timestampMs: 1739355000000, description: 'Updated asset "Employee MacBooks" — added 3 new units to pool' },
];

// =============================================================================
// COMMUNITY MODE (Competition / KaNeXT) — Mock Data
// =============================================================================

const COMMUNITY_TASKS: OpsTask[] = [
  { id: 'co-t-1', title: 'Venue setup — COTA pit lane & paddock config', owner: 'James Whitfield', ownerInitials: 'JW', dueDate: '2026-02-27', priority: 'P0', status: 'active', unit: 'Event Weekend' },
  { id: 'co-t-2', title: 'Credentialing — driver & team passes for Round 1', owner: 'Maria Santos', ownerInitials: 'MS', dueDate: '2026-02-25', priority: 'P1', status: 'active', unit: 'Event Weekend' },
  { id: 'co-t-3', title: 'Official assignments — stewards & marshals roster', owner: 'Race Director', ownerInitials: 'RD', dueDate: '2026-02-26', priority: 'P0', status: 'draft', unit: 'Series' },
  { id: 'co-t-4', title: 'Media equipment check — broadcast cameras & data feed', owner: 'Marcus Kane', ownerInitials: 'MK', dueDate: '2026-02-27', priority: 'P1', status: 'active', unit: 'Event Weekend' },
  { id: 'co-t-5', title: 'Schedule conflicts — practice/quali overlap resolution', owner: 'James Whitfield', ownerInitials: 'JW', dueDate: '2026-02-24', priority: 'P1', status: 'active', unit: 'Series' },
  { id: 'co-t-6', title: 'Safety equipment inspection — barriers, extinguishers', owner: 'Safety Officer', ownerInitials: 'SO', dueDate: '2026-02-27', priority: 'P0', status: 'draft', unit: 'Event Weekend' },
  { id: 'co-t-7', title: 'Timing system calibration & transponder check', owner: 'Maria Santos', ownerInitials: 'MS', dueDate: '2026-02-26', priority: 'P1', status: 'draft', unit: 'Event Weekend' },
];

const COMMUNITY_WORK_ORDERS: OpsWorkOrder[] = [
  { id: 'co-wo-1', title: 'Install timing gantry — start/finish line', requestedBy: 'Maria Santos', assignedTo: 'Track Services', assignedToInitials: 'TS', dueDate: '2026-02-27', priority: 'P0', status: 'active', category: 'Equipment' },
  { id: 'co-wo-2', title: 'Paddock hospitality tent setup — sponsor area', requestedBy: 'Marcus Kane', assignedTo: 'Events Crew', assignedToInitials: 'EC', dueDate: '2026-02-27', priority: 'P1', status: 'draft', category: 'Event Setup' },
  { id: 'co-wo-3', title: 'Garage bay power supply — 240V outlets (x8)', requestedBy: 'Chief Mechanic', assignedTo: 'Venue Electrician', assignedToInitials: 'VE', dueDate: '2026-02-26', priority: 'P1', status: 'active', category: 'Facilities' },
];

const COMMUNITY_ISSUES: OpsIssue[] = [
  { id: 'co-i-1', title: 'Fuel rig pressure regulator — inconsistent flow Bay 3', severity: 'high', owner: 'Chief Mechanic', ownerInitials: 'CM', status: 'active', reportedAt: '2026-02-14', category: 'Equipment' },
  { id: 'co-i-2', title: 'Broadcast feed latency — 2.5s delay to production truck', severity: 'medium', owner: 'Marcus Kane', ownerInitials: 'MK', status: 'active', reportedAt: '2026-02-13', category: 'Media' },
  { id: 'co-i-3', title: 'Track drainage grate loose — Turn 4 exit', severity: 'critical', owner: 'Safety Officer', ownerInitials: 'SO', status: 'blocked', reportedAt: '2026-02-15', category: 'Safety' },
];

const COMMUNITY_ASSETS: OpsAsset[] = [
  { id: 'co-a-1', name: 'Timing System (Transponders x24)', category: 'Equipment', assignedTo: 'Maria Santos', condition: 'good', location: 'Timing Tower' },
  { id: 'co-a-2', name: 'Safety Equipment — Barriers & Extinguishers', category: 'Equipment', assignedTo: 'Safety Officer', condition: 'good', location: 'Pit Lane Storage' },
  { id: 'co-a-3', name: 'Broadcast Camera Kit (x4)', category: 'Camera', assignedTo: 'Marcus Kane', condition: 'excellent', location: 'Production Truck' },
  { id: 'co-a-4', name: 'Team Radio Sets (x16)', category: 'Equipment', condition: 'good', location: 'Race Control' },
  { id: 'co-a-5', name: 'Equipment Trailer — Enclosed 24ft', category: 'Vehicle', condition: 'fair', location: 'Series HQ Lot' },
];

const COMMUNITY_VENDORS: OpsVendor[] = [
  { id: 'co-v-1', name: 'COTA — Track Rental', category: 'Venue', contractEnd: '2026-12-31', activeTickets: 0, status: 'active' },
  { id: 'co-v-2', name: 'MyLaps — Timing Solutions', category: 'IT', contractEnd: '2026-08-01', activeTickets: 0, status: 'active' },
  { id: 'co-v-3', name: 'StreamLine Media Productions', category: 'AV', contractEnd: '2026-05-31', activeTickets: 1, status: 'active' },
  { id: 'co-v-4', name: 'Podium Fuel & Lubricants', category: 'Supplies', contractEnd: '2026-03-30', activeTickets: 1, status: 'pending-renewal' },
];

const COMMUNITY_FACILITIES: OpsFacility[] = [
  { id: 'co-f-1', name: 'Pit Lane — COTA', location: 'Circuit of the Americas', type: 'Arena', maintenanceQueue: 1, status: 'operational' },
  { id: 'co-f-2', name: 'Garage Bays 1-8', location: 'Circuit of the Americas', type: 'Garage', maintenanceQueue: 1, status: 'partial' },
  { id: 'co-f-3', name: 'Timing Tower & Race Control', location: 'Circuit of the Americas', type: 'Office', maintenanceQueue: 0, status: 'operational' },
];

const COMMUNITY_TRAVEL: OpsTravelItem[] = [
  { id: 'co-tr-1', title: 'Round 1 — COTA Race Weekend', destination: 'Austin, TX', departDate: '2026-02-27', returnDate: '2026-03-02', travelers: 12, status: 'booked' },
  { id: 'co-tr-2', title: 'Round 2 — Barber Motorsports Park', destination: 'Birmingham, AL', departDate: '2026-03-20', returnDate: '2026-03-23', travelers: 12, status: 'planned' },
  { id: 'co-tr-3', title: 'Season Opener Media Day', destination: 'Austin, TX', departDate: '2026-02-26', returnDate: '2026-02-26', travelers: 4, status: 'booked' },
];

const COMMUNITY_SOPS: OpsSOP[] = [
  { id: 'co-sop-1', title: 'Race Weekend Setup & Teardown Checklist', category: 'Events', steps: 20, lastUpdated: '2026-02-01', owner: 'James Whitfield' },
  { id: 'co-sop-2', title: 'Tech Inspection & Scrutineering Procedure', category: 'Technical', steps: 16, lastUpdated: '2026-01-25', owner: 'Chief Mechanic' },
  { id: 'co-sop-3', title: 'Incident & Red Flag Response Protocol', category: 'Safety', steps: 12, lastUpdated: '2026-02-05', owner: 'Race Director' },
  { id: 'co-sop-4', title: 'Credentialing & Access Control Process', category: 'Operations', steps: 8, lastUpdated: '2025-12-15', owner: 'Maria Santos' },
  { id: 'co-sop-5', title: 'Broadcast Production Workflow', category: 'Media', steps: 14, lastUpdated: '2026-01-30', owner: 'Marcus Kane' },
];

const COMMUNITY_REPORTS: OpsReport[] = [
  { id: 'co-r-1', title: 'Pre-Season Readiness Report', type: 'Monthly Summary', generatedAt: '2026-02-14', owner: 'James Whitfield' },
  { id: 'co-r-2', title: 'Round 1 Venue Walkthrough Summary', type: 'Event Report', generatedAt: '2026-02-12', owner: 'Race Director' },
];

const COMMUNITY_CADENCE: OpsCadenceMeeting[] = [
  { id: 'co-c-1', title: 'Team Principals Meeting', frequency: 'Monthly', nextDate: '2026-03-06', time: '6:00 PM', attendees: ['James Whitfield', 'Team Principals', 'Race Director'], agenda: 'Regulations, schedule, competitor feedback' },
  { id: 'co-c-2', title: 'Race Weekend Ops Briefing', frequency: 'Weekly', nextDate: '2026-02-26', time: '8:00 AM', attendees: ['James Whitfield', 'Maria Santos', 'Safety Officer', 'Marcus Kane'], agenda: 'Weather, track status, schedule, safety notes' },
  { id: 'co-c-3', title: 'Stewards & Officials Pre-Race Briefing', frequency: 'Weekly', nextDate: '2026-02-28', time: '8:00 AM', attendees: ['Race Director', 'Stewards', 'Marshals'], agenda: 'Flag protocols, penalty guidelines, incident review procedure' },
];

const COMMUNITY_DASHBOARD: DashboardBlock[] = [
  { id: 'co-d-1', label: 'Open Tasks', icon: 'checkmark.circle', value: '5', subValue: '2 P0', color: '#B85C5C' },
  { id: 'co-d-2', label: 'Work Orders', icon: 'wrench.and.screwdriver', value: '3', color: '#1A1714' },
  { id: 'co-d-3', label: 'Open Issues', icon: 'exclamationmark.triangle', value: '2', subValue: '1 critical', color: '#B85C5C' },
  { id: 'co-d-4', label: 'Next Event', icon: 'flag.checkered', value: '12 days', subValue: 'Round 1 — COTA', color: '#5A8A6E' },
  { id: 'co-d-5', label: 'Teams Registered', icon: 'person.3', value: '8', subValue: 'All credentialed', color: '#FFFFFF' },
  { id: 'co-d-6', label: 'Assets Tracked', icon: 'cube.box', value: '5', subValue: '1 fair condition', color: '#B8943E' },
  { id: 'co-d-7', label: 'Upcoming Travel', icon: 'airplane', value: '3', subValue: 'Next: Feb 26', color: '#9C9790' },
  { id: 'co-d-8', label: 'SOPs', icon: 'doc.text', value: '5', color: '#1A1714' },
];

const COMMUNITY_AUDIT: OpsAuditEntry[] = [
  { id: 'co-au-1', action: 'task.created', actor: 'James Whitfield', timestamp: '2026-02-16T12:00:00Z', timestampMs: 1739707200000, description: 'Created task "Venue setup — COTA pit lane & paddock config"' },
  { id: 'co-au-2', action: 'issue.reported', actor: 'Safety Officer', timestamp: '2026-02-15T14:00:00Z', timestampMs: 1739628000000, description: 'Reported issue "Track drainage grate loose — Turn 4 exit"' },
  { id: 'co-au-3', action: 'work-order.created', actor: 'Maria Santos', timestamp: '2026-02-15T10:00:00Z', timestampMs: 1739613600000, description: 'Created work order "Install timing gantry — start/finish line"' },
  { id: 'co-au-4', action: 'travel.booked', actor: 'James Whitfield', timestamp: '2026-02-14T16:30:00Z', timestampMs: 1739550600000, description: 'Booked travel "Round 1 — COTA Race Weekend"' },
  { id: 'co-au-5', action: 'sop.updated', actor: 'Race Director', timestamp: '2026-02-05T11:00:00Z', timestampMs: 1738749600000, description: 'Updated SOP "Incident & Red Flag Response Protocol" — added VSC procedure' },
  { id: 'co-au-6', action: 'asset.flagged', actor: 'Chief Mechanic', timestamp: '2026-02-14T09:00:00Z', timestampMs: 1739523600000, description: 'Flagged asset "Fuel Rigs & Stands" — pressure regulator issue Bay 3' },
  { id: 'co-au-7', action: 'vendor.ticket', actor: 'Marcus Kane', timestamp: '2026-02-13T15:30:00Z', timestampMs: 1739460600000, description: 'Opened ticket with StreamLine Media — broadcast latency troubleshooting' },
  { id: 'co-au-8', action: 'report.generated', actor: 'James Whitfield', timestamp: '2026-02-14T08:00:00Z', timestampMs: 1739520000000, description: 'Generated "Pre-Season Readiness Report"' },
];

// =============================================================================
// MODE RECORD — All ops data keyed by mode
// =============================================================================

const OPS_DATA: Record<Mode, {
  tasks: OpsTask[];
  workOrders: OpsWorkOrder[];
  issues: OpsIssue[];
  assets: OpsAsset[];
  vendors: OpsVendor[];
  facilities: OpsFacility[];
  travel: OpsTravelItem[];
  sops: OpsSOP[];
  reports: OpsReport[];
  cadence: OpsCadenceMeeting[];
  dashboard: DashboardBlock[];
  audit: OpsAuditEntry[];
}> = {
  sports: {
    tasks: SPORTS_TASKS,
    workOrders: SPORTS_WORK_ORDERS,
    issues: SPORTS_ISSUES,
    assets: SPORTS_ASSETS,
    vendors: SPORTS_VENDORS,
    facilities: SPORTS_FACILITIES,
    travel: SPORTS_TRAVEL,
    sops: SPORTS_SOPS,
    reports: SPORTS_REPORTS,
    cadence: SPORTS_CADENCE,
    dashboard: SPORTS_DASHBOARD,
    audit: SPORTS_AUDIT,
  },
  education: {
    tasks: EDUCATION_TASKS,
    workOrders: EDUCATION_WORK_ORDERS,
    issues: EDUCATION_ISSUES,
    assets: EDUCATION_ASSETS,
    vendors: EDUCATION_VENDORS,
    facilities: EDUCATION_FACILITIES,
    travel: EDUCATION_TRAVEL,
    sops: EDUCATION_SOPS,
    reports: EDUCATION_REPORTS,
    cadence: EDUCATION_CADENCE,
    dashboard: EDUCATION_DASHBOARD,
    audit: EDUCATION_AUDIT,
  },
  church: {
    tasks: CHURCH_TASKS,
    workOrders: CHURCH_WORK_ORDERS,
    issues: CHURCH_ISSUES,
    assets: CHURCH_ASSETS,
    vendors: CHURCH_VENDORS,
    facilities: CHURCH_FACILITIES,
    travel: CHURCH_TRAVEL,
    sops: CHURCH_SOPS,
    reports: CHURCH_REPORTS,
    cadence: CHURCH_CADENCE,
    dashboard: CHURCH_DASHBOARD,
    audit: CHURCH_AUDIT,
  },
  business: {
    tasks: BUSINESS_TASKS,
    workOrders: BUSINESS_WORK_ORDERS,
    issues: BUSINESS_ISSUES,
    assets: BUSINESS_ASSETS,
    vendors: BUSINESS_VENDORS,
    facilities: BUSINESS_FACILITIES,
    travel: BUSINESS_TRAVEL,
    sops: BUSINESS_SOPS,
    reports: BUSINESS_REPORTS,
    cadence: BUSINESS_CADENCE,
    dashboard: BUSINESS_DASHBOARD,
    audit: BUSINESS_AUDIT,
  },
  competition: {
    tasks: COMMUNITY_TASKS,
    workOrders: COMMUNITY_WORK_ORDERS,
    issues: COMMUNITY_ISSUES,
    assets: COMMUNITY_ASSETS,
    vendors: COMMUNITY_VENDORS,
    facilities: COMMUNITY_FACILITIES,
    travel: COMMUNITY_TRAVEL,
    sops: COMMUNITY_SOPS,
    reports: COMMUNITY_REPORTS,
    cadence: COMMUNITY_CADENCE,
    dashboard: COMMUNITY_DASHBOARD,
    audit: COMMUNITY_AUDIT,
  },
};

// =============================================================================
// HELPERS
// =============================================================================

/** Return all ops data for a given mode. */
export function getOpsData(mode: Mode): {
  tasks: OpsTask[];
  workOrders: OpsWorkOrder[];
  issues: OpsIssue[];
  assets: OpsAsset[];
  vendors: OpsVendor[];
  facilities: OpsFacility[];
  travel: OpsTravelItem[];
  sops: OpsSOP[];
  reports: OpsReport[];
  cadence: OpsCadenceMeeting[];
  dashboard: DashboardBlock[];
  audit: OpsAuditEntry[];
} {
  return OPS_DATA[mode];
}

/** Filter tasks by search string, statuses, and priorities. */
export function filterTasks(
  tasks: OpsTask[],
  search: string,
  statuses: OpsStatus[],
  priorities: OpsPriority[],
): OpsTask[] {
  const q = search.toLowerCase().trim();
  return tasks.filter((t) => {
    // Search filter
    if (q && !t.title.toLowerCase().includes(q) && !t.owner.toLowerCase().includes(q) && !t.unit.toLowerCase().includes(q)) {
      return false;
    }
    // Status filter
    if (statuses.length > 0 && !statuses.includes(t.status)) {
      return false;
    }
    // Priority filter
    if (priorities.length > 0 && !priorities.includes(t.priority)) {
      return false;
    }
    return true;
  });
}

/** Sort tasks by the given sort key. */
export function sortTasks(tasks: OpsTask[], sort: SortOption): OpsTask[] {
  const sorted = [...tasks];
  switch (sort) {
    case 'due-soonest':
      return sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    case 'recent-activity':
      return sorted.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    case 'a-z':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}
