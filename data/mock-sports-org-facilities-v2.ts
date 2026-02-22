/**
 * Sports Organization Facilities V2 — Mock Data & Types
 * KaNeXT Men's Basketball program facility management: spaces, scheduling,
 * work orders, game-day readiness, and access control.
 */

// =============================================================================
// TYPES
// =============================================================================

export type FacilityType =
  | 'court'
  | 'weight-room'
  | 'training-room'
  | 'locker-room'
  | 'film-room'
  | 'meeting-room'
  | 'office';

export type WorkOrderSeverity = 'urgent' | 'high' | 'normal' | 'low';

export type WorkOrderStatus = 'new' | 'in-progress' | 'blocked' | 'complete';

export type GameDayCategory =
  | 'setup'
  | 'tech'
  | 'medical'
  | 'security'
  | 'officials'
  | 'media';

export type GameDayItemStatus = 'ready' | 'in-progress' | 'not-started' | 'blocked';

// =============================================================================
// SUB-TAB DEFINITION
// =============================================================================

export type FacilitiesSubTabId =
  | 'overview'
  | 'spaces'
  | 'schedule'
  | 'work-orders'
  | 'game-day'
  | 'access';

export interface FacilitiesSubTab {
  id: FacilitiesSubTabId;
  label: string;
}

export const FACILITIES_SUB_TABS: FacilitiesSubTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'spaces', label: 'Spaces' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'work-orders', label: 'Work Orders' },
  { id: 'game-day', label: 'Game Day' },
  { id: 'access', label: 'Access' },
];

// =============================================================================
// INTERFACES
// =============================================================================

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  capacity: number;
  accessOwner: string;
  hours: string;
  constraints: string;
  data_source?: string;
}

export interface FacilityScheduleItem {
  id: string;
  facilityId: string;
  facilityName: string;
  date: string;
  timeSlot: string;
  purpose: string;
  conflict: boolean;
  team: string;
  data_source?: string;
}

export interface WorkOrder {
  id: string;
  issueType: string;
  severity: WorkOrderSeverity;
  location: string;
  reporter: string;
  reportDate: string;
  owner: string;
  slaDate: string;
  status: WorkOrderStatus;
  data_source?: string;
}

export interface GameDayItem {
  id: string;
  item: string;
  owner: string;
  status: GameDayItemStatus;
  category: GameDayCategory;
  data_source?: string;
}

export interface AccessRecord {
  id: string;
  person: string;
  facilityName: string;
  accessWindow: string;
  highRisk: boolean;
  lastChanged: string;
  data_source?: string;
}

export interface FacilitiesOverview {
  total: number;
  active: number;
  conflicts: number;
  workOrders: number;
  safety: number;
}

// =============================================================================
// LABELS & COLORS
// =============================================================================

export const FACILITY_TYPE_LABEL: Record<FacilityType, string> = {
  court: 'Court',
  'weight-room': 'Weight Room',
  'training-room': 'Training Room',
  'locker-room': 'Locker Room',
  'film-room': 'Film Room',
  'meeting-room': 'Meeting Room',
  office: 'Office',
};

export const FACILITY_TYPE_COLOR: Record<FacilityType, string> = {
  court: '#1D9BF0',
  'weight-room': '#ef4444',
  'training-room': '#22c55e',
  'locker-room': '#1D9BF0',
  'film-room': '#f59e0b',
  'meeting-room': '#A1A1AA',
  office: '#1D9BF0',
};

export const WORK_ORDER_SEVERITY_LABEL: Record<WorkOrderSeverity, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export const WORK_ORDER_SEVERITY_COLOR: Record<WorkOrderSeverity, string> = {
  urgent: '#ef4444',
  high: '#f59e0b',
  normal: '#1D9BF0',
  low: '#A1A1AA',
};

export const WORK_ORDER_STATUS_LABEL: Record<WorkOrderStatus, string> = {
  new: 'New',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  complete: 'Complete',
};

export const WORK_ORDER_STATUS_COLOR: Record<WorkOrderStatus, string> = {
  new: '#1D9BF0',
  'in-progress': '#f59e0b',
  blocked: '#ef4444',
  complete: '#22c55e',
};

export const GAME_DAY_CATEGORY_LABEL: Record<GameDayCategory, string> = {
  setup: 'Setup',
  tech: 'Tech',
  medical: 'Medical',
  security: 'Security',
  officials: 'Officials',
  media: 'Media',
};

export const GAME_DAY_CATEGORY_COLOR: Record<GameDayCategory, string> = {
  setup: '#1D9BF0',
  tech: '#1D9BF0',
  medical: '#22c55e',
  security: '#ef4444',
  officials: '#f59e0b',
  media: '#A1A1AA',
};

export const GAME_DAY_STATUS_LABEL: Record<GameDayItemStatus, string> = {
  ready: 'Ready',
  'in-progress': 'In Progress',
  'not-started': 'Not Started',
  blocked: 'Blocked',
};

export const GAME_DAY_STATUS_COLOR: Record<GameDayItemStatus, string> = {
  ready: '#22c55e',
  'in-progress': '#f59e0b',
  'not-started': '#A1A1AA',
  blocked: '#ef4444',
};

// =============================================================================
// MOCK DATA — FACILITIES (7)
// =============================================================================

const facilities: Facility[] = [
  {
    id: 'fac-001',
    name: 'Main Gymnasium — KaNeXT Wellness Center',
    type: 'court',
    capacity: 2500,
    accessOwner: 'Alex Morgan',
    hours: '6:00 AM – 10:00 PM',
    constraints: 'Game day venue. Shared with women\'s basketball and volleyball; priority windows required.',
    data_source: 'demo_seed',
  },
  {
    id: 'fac-002',
    name: 'Practice Court',
    type: 'court',
    capacity: 200,
    accessOwner: 'Alex Morgan',
    hours: '6:00 AM – 9:00 PM',
    constraints: 'Dedicated MBB use; no external booking without HC approval.',
    data_source: 'demo_seed',
  },
  {
    id: 'fac-003',
    name: 'Weight Room',
    type: 'weight-room',
    capacity: 40,
    accessOwner: 'Mike Reeves',
    hours: '5:30 AM – 8:00 PM',
    constraints: 'Shared with all athletics; MBB priority 6-8 AM and 2-4 PM.',
    data_source: 'demo_seed',
  },
  {
    id: 'fac-004',
    name: 'Training Room',
    type: 'training-room',
    capacity: 20,
    accessOwner: 'Dr. Nicole Patterson',
    hours: '7:00 AM – 7:00 PM',
    constraints: 'Medical staff must be present for hydrotherapy use.',
    data_source: 'demo_seed',
  },
  {
    id: 'fac-005',
    name: 'Film Room / Meeting Room',
    type: 'film-room',
    capacity: 25,
    accessOwner: 'Jordan Mitchell',
    hours: '7:00 AM – 9:00 PM',
    constraints: 'Projector maintenance window every Monday 7-8 AM. No player access without coach present during recruiting discussions.',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — SCHEDULE ITEMS (10, 2 conflicts)
// =============================================================================

const scheduleItems: FacilityScheduleItem[] = [
  {
    id: 'sched-001',
    facilityId: 'fac-001',
    facilityName: 'Main Gymnasium — KaNeXT Wellness Center',
    date: '2026-02-18',
    timeSlot: '3:00 PM – 5:00 PM',
    purpose: 'Team Practice — Press-Break Sets vs. Keiser',
    conflict: false,
    team: 'MBB',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-002',
    facilityId: 'fac-001',
    facilityName: 'Main Gymnasium — KaNeXT Wellness Center',
    date: '2026-02-18',
    timeSlot: '5:00 PM – 7:00 PM',
    purpose: 'Women\'s Basketball Practice',
    conflict: true,
    team: 'WBB',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-003',
    facilityId: 'fac-003',
    facilityName: 'Weight Room',
    date: '2026-02-18',
    timeSlot: '6:00 AM – 7:30 AM',
    purpose: 'AM Lift — Guards',
    conflict: false,
    team: 'MBB',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-004',
    facilityId: 'fac-005',
    facilityName: 'Film Room / Meeting Room',
    date: '2026-02-18',
    timeSlot: '6:00 PM – 7:30 PM',
    purpose: 'Film Session — Keiser Scouting Report',
    conflict: false,
    team: 'MBB',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-005',
    facilityId: 'fac-004',
    facilityName: 'Training Room',
    date: '2026-02-18',
    timeSlot: '12:00 PM – 1:30 PM',
    purpose: 'Pre-Practice Treatment & Rehab',
    conflict: false,
    team: 'MBB',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-006',
    facilityId: 'fac-002',
    facilityName: 'Practice Court',
    date: '2026-02-19',
    timeSlot: '8:00 AM – 10:00 AM',
    purpose: 'Individual Workouts — Bigs',
    conflict: false,
    team: 'MBB',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-007',
    facilityId: 'fac-005',
    facilityName: 'Film Room / Meeting Room',
    date: '2026-02-19',
    timeSlot: '3:00 PM – 4:30 PM',
    purpose: 'Recruiting Strategy — Spring Targets',
    conflict: false,
    team: 'MBB',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-008',
    facilityId: 'fac-003',
    facilityName: 'Weight Room',
    date: '2026-02-19',
    timeSlot: '2:00 PM – 3:30 PM',
    purpose: 'PM Lift — Bigs',
    conflict: true,
    team: 'MBB / Track & Field',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-009',
    facilityId: 'fac-001',
    facilityName: 'Main Gymnasium — KaNeXT Wellness Center',
    date: '2026-02-20',
    timeSlot: '7:00 PM – 9:30 PM',
    purpose: 'KaNeXT vs. Thomas University — KaNeXT Conference Game',
    conflict: false,
    team: 'MBB',
    data_source: 'demo_seed',
  },
  {
    id: 'sched-010',
    facilityId: 'fac-005',
    facilityName: 'Film Room / Meeting Room',
    date: '2026-02-20',
    timeSlot: '9:00 AM – 10:30 AM',
    purpose: 'Self-Scout — Last 3 Games',
    conflict: false,
    team: 'MBB',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — WORK ORDERS (5)
// =============================================================================

const workOrders: WorkOrder[] = [
  {
    id: 'wo-001',
    issueType: 'Scoreboard malfunction — display flickering, clock not syncing',
    severity: 'urgent',
    location: 'Main Gymnasium — KaNeXT Wellness Center',
    reporter: 'Alex Morgan',
    reportDate: '2026-02-16',
    owner: 'Daktronics Service',
    slaDate: '2026-02-19',
    status: 'in-progress',
    data_source: 'demo_seed',
  },
  {
    id: 'wo-002',
    issueType: 'Cable machine — frayed cable on lat pulldown',
    severity: 'normal',
    location: 'Weight Room',
    reporter: 'Mike Reeves',
    reportDate: '2026-02-10',
    owner: 'South Ridgemont Fitness Supply',
    slaDate: '2026-02-24',
    status: 'new',
    data_source: 'demo_seed',
  },
  {
    id: 'wo-003',
    issueType: 'Deep cleaning needed — locker area and benches',
    severity: 'normal',
    location: 'Training Room',
    reporter: 'Dr. Nicole Patterson',
    reportDate: '2026-02-14',
    owner: 'KaNeXT Facilities Management',
    slaDate: '2026-02-25',
    status: 'new',
    data_source: 'demo_seed',
  },
  {
    id: 'wo-004',
    issueType: 'Overhead light bank out — Section B',
    severity: 'high',
    location: 'Main Gymnasium — KaNeXT Wellness Center',
    reporter: 'Jordan Mitchell',
    reportDate: '2026-02-08',
    owner: 'KaNeXT Facilities Management',
    slaDate: '2026-02-19',
    status: 'complete',
    data_source: 'demo_seed',
  },
  {
    id: 'wo-005',
    issueType: 'Projector bulb replacement needed',
    severity: 'normal',
    location: 'Film Room / Meeting Room',
    reporter: 'Jordan Mitchell',
    reportDate: '2026-02-12',
    owner: 'Campus IT Services',
    slaDate: '2026-02-22',
    status: 'complete',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — GAME DAY ITEMS (8)
// =============================================================================

const gameDayItems: GameDayItem[] = [
  {
    id: 'gd-001',
    item: 'Courtside banners installed and sponsor signage verified',
    owner: 'Tyler Brooks',
    status: 'ready',
    category: 'setup',
    data_source: 'demo_seed',
  },
  {
    id: 'gd-002',
    item: 'Shot clock and scoreboard tested (verify post-repair)',
    owner: 'Jordan Mitchell',
    status: 'in-progress',
    category: 'tech',
    data_source: 'demo_seed',
  },
  {
    id: 'gd-003',
    item: 'Hudl camera system positioned and recording verified',
    owner: 'Jordan Mitchell',
    status: 'not-started',
    category: 'tech',
    data_source: 'demo_seed',
  },
  {
    id: 'gd-004',
    item: 'AED units checked and medical kits stocked',
    owner: 'Dr. Nicole Patterson',
    status: 'ready',
    category: 'medical',
    data_source: 'demo_seed',
  },
  {
    id: 'gd-005',
    item: 'Gym security sweep completed',
    owner: 'Campus Security',
    status: 'not-started',
    category: 'security',
    data_source: 'demo_seed',
  },
  {
    id: 'gd-006',
    item: 'Officials area prepped and game balls inspected',
    owner: 'Tyler Brooks',
    status: 'not-started',
    category: 'officials',
    data_source: 'demo_seed',
  },
  {
    id: 'gd-007',
    item: 'Visiting team locker room setup and towels',
    owner: 'Tyler Brooks',
    status: 'not-started',
    category: 'setup',
    data_source: 'demo_seed',
  },
  {
    id: 'gd-008',
    item: 'PA system and music playlist tested',
    owner: 'Jordan Mitchell',
    status: 'not-started',
    category: 'tech',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// MOCK DATA — ACCESS RECORDS (6)
// =============================================================================

const accessRecords: AccessRecord[] = [
  {
    id: 'acc-001',
    person: 'Alex Morgan',
    facilityName: 'All Facilities',
    accessWindow: '24/7',
    highRisk: false,
    lastChanged: '2026-01-05',
    data_source: 'demo_seed',
  },
  {
    id: 'acc-002',
    person: 'Mike Reeves',
    facilityName: 'Weight Room',
    accessWindow: '5:30 AM – 8:00 PM',
    highRisk: false,
    lastChanged: '2026-01-05',
    data_source: 'demo_seed',
  },
  {
    id: 'acc-003',
    person: 'Dr. Nicole Patterson',
    facilityName: 'Training Room',
    accessWindow: '6:00 AM – 9:00 PM',
    highRisk: true,
    lastChanged: '2026-02-01',
    data_source: 'demo_seed',
  },
  {
    id: 'acc-004',
    person: 'Daktronics Service',
    facilityName: 'Main Gymnasium — KaNeXT Wellness Center',
    accessWindow: 'Feb 18–19, 7:00 AM – 5:00 PM',
    highRisk: true,
    lastChanged: '2026-02-17',
    data_source: 'demo_seed',
  },
  {
    id: 'acc-005',
    person: 'Jordan Mitchell',
    facilityName: 'Film Room / Meeting Room',
    accessWindow: '6:00 AM – 10:00 PM',
    highRisk: false,
    lastChanged: '2026-01-10',
    data_source: 'demo_seed',
  },
  {
    id: 'acc-006',
    person: 'South Ridgemont Fitness Supply',
    facilityName: 'Weight Room',
    accessWindow: 'Feb 24, 9:00 AM – 12:00 PM',
    highRisk: true,
    lastChanged: '2026-02-18',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// GETTER
// =============================================================================

export function getFacilitiesOverview(): FacilitiesOverview {
  const total = facilities.length;
  const active = facilities.length; // all spaces currently in use
  const conflicts = scheduleItems.filter((s) => s.conflict).length;
  const openWorkOrders = workOrders.filter((w) => w.status !== 'complete').length;
  const safety = accessRecords.filter((a) => a.highRisk).length;

  return {
    total,
    active,
    conflicts,
    workOrders: openWorkOrders,
    safety,
  };
}

export function getFacilities(): Facility[] {
  return facilities;
}

export function getFacilitySchedule(): FacilityScheduleItem[] {
  return scheduleItems;
}

export function getWorkOrders(): WorkOrder[] {
  return workOrders;
}

export function getGameDayItems(): GameDayItem[] {
  return gameDayItems;
}

export function getAccessRecords(): AccessRecord[] {
  return accessRecords;
}
