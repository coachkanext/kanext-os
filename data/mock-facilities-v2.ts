// ---------------------------------------------------------------------------
// KaNeXT OS — Facilities Hub  (Sports Mode · KaNeXT Monarchs)
// Mock types + data for the basketball-program facilities management module
// ---------------------------------------------------------------------------

// ── Space Types ─────────────────────────────────────────────────────────────

export type SpaceType =
  | 'court'
  | 'weight_room'
  | 'training_room'
  | 'locker_room'
  | 'film_room'
  | 'office'
  | 'meeting_room'
  | 'storage'
  | 'home_venue'
  | 'practice_venue';

export type SpaceStatus = 'open' | 'booked' | 'maintenance' | 'closed';

export interface FacilitySpace {
  id: string;
  name: string;
  type: SpaceType;
  status: SpaceStatus;
  capacity?: number;
  location?: string;
  imageUrl?: string;
}

// ── Bookings ────────────────────────────────────────────────────────────────

export type BookingType =
  | 'practice'
  | 'lift'
  | 'training'
  | 'film'
  | 'meeting'
  | 'game'
  | 'event';

export interface Booking {
  id: string;
  spaceId: string;
  spaceName: string;
  type: BookingType;
  title: string;
  start: Date;
  end: Date;
  owner: string;
  attendees?: string[];
  notes?: string;
}

// ── Work Orders ─────────────────────────────────────────────────────────────

export type WorkOrderStatus =
  | 'requested'
  | 'approved'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'closed';

export type WorkOrderIssueType =
  | 'hvac'
  | 'lighting'
  | 'floor'
  | 'equipment'
  | 'plumbing'
  | 'cleaning'
  | 'it';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface WorkOrder {
  id: string;
  spaceId: string;
  spaceName: string;
  issueType: WorkOrderIssueType;
  severity: Severity;
  title: string;
  description: string;
  requester: string;
  assignee?: string;
  vendor?: string;
  status: WorkOrderStatus;
  costEstimate?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Issues ──────────────────────────────────────────────────────────────────

export interface FacilityIssue {
  id: string;
  spaceId: string;
  spaceName: string;
  severity: Severity;
  title: string;
  owner: string;
  status: 'open' | 'investigating' | 'resolved';
  lastUpdate: string;
  createdAt: Date;
}

// ── Inventory / Assets ──────────────────────────────────────────────────────

export type AssetCondition = 'good' | 'needs_service' | 'out';

export type AssetCategory =
  | 'court_equipment'
  | 'weight_equipment'
  | 'training_supplies'
  | 'film_gear'
  | 'storage_equipment';

export interface FacilityAsset {
  id: string;
  name: string;
  category: AssetCategory;
  assignedSpaceId: string;
  assignedSpaceName: string;
  condition: AssetCondition;
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  vendorLink?: string;
  quantity?: number;
}

// ── Vendors ─────────────────────────────────────────────────────────────────

export interface FacilityVendor {
  id: string;
  name: string;
  serviceType: string;
  linkedSpaces: string[];
  contractLink?: string;
  renewalDate?: Date;
  contact: string;
  openWorkOrders: number;
}

// ── Safety ──────────────────────────────────────────────────────────────────

export type InspectionStatus = 'compliant' | 'due_soon' | 'overdue';
export type InspectionCadence = 'weekly' | 'monthly' | 'quarterly';

export interface SafetyInspection {
  id: string;
  template: string;
  spaceId: string;
  spaceName: string;
  cadence: InspectionCadence;
  status: InspectionStatus;
  lastCompleted?: Date;
  nextDue: Date;
  completedBy?: string;
  notes?: string;
}

// ── Audit ───────────────────────────────────────────────────────────────────

export interface FacilityAuditEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: Date;
}

// ── Settings ────────────────────────────────────────────────────────────────

export interface FacilitySettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// ── Hub Tabs ────────────────────────────────────────────────────────────────

export type FacilitiesHubTab =
  | 'dashboard'
  | 'spaces'
  | 'bookings'
  | 'work-orders'
  | 'issues'
  | 'inventory'
  | 'vendors'
  | 'safety'
  | 'reports'
  | 'audit'
  | 'settings';

// ===========================================================================
// MOCK DATA
// ===========================================================================

// Helper: minutes from now (positive = future, negative = past)
const minsFromNow = (m: number) => new Date(Date.now() + m * 60000);
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000);

// ── Hub Tabs ────────────────────────────────────────────────────────────────

export const FACILITIES_HUB_TABS: { id: FacilitiesHubTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'spaces', label: 'Spaces' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'work-orders', label: 'Work Orders' },
  { id: 'issues', label: 'Issues' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'safety', label: 'Safety' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

// ── Spaces (10 — one per SpaceType) ─────────────────────────────────────────

export const FACILITY_SPACES: FacilitySpace[] = [
  {
    id: 'sp-court-main',
    name: 'Main Gym — Monarch Court',
    type: 'court',
    status: 'booked',
    capacity: 4200,
    location: 'Joseph Echols Athletic Center, Level 1',
  },
  {
    id: 'sp-weight',
    name: 'Monarch Weight Room',
    type: 'weight_room',
    status: 'open',
    capacity: 40,
    location: 'Joseph Echols Athletic Center, Level B1',
  },
  {
    id: 'sp-training',
    name: 'Monarch Training Center',
    type: 'training_room',
    status: 'open',
    capacity: 20,
    location: 'Joseph Echols Athletic Center, Level B1',
  },
  {
    id: 'sp-locker',
    name: 'Men\'s Basketball Locker Room',
    type: 'locker_room',
    status: 'open',
    capacity: 18,
    location: 'Joseph Echols Athletic Center, Level 1',
  },
  {
    id: 'sp-film',
    name: 'Film Room A',
    type: 'film_room',
    status: 'booked',
    capacity: 25,
    location: 'Joseph Echols Athletic Center, Level 2',
  },
  {
    id: 'sp-office',
    name: 'Basketball Operations Office',
    type: 'office',
    status: 'open',
    capacity: 8,
    location: 'Joseph Echols Athletic Center, Level 2',
  },
  {
    id: 'sp-meeting',
    name: 'Coaches\' War Room',
    type: 'meeting_room',
    status: 'open',
    capacity: 12,
    location: 'Joseph Echols Athletic Center, Level 2',
  },
  {
    id: 'sp-storage',
    name: 'Equipment Storage Bay',
    type: 'storage',
    status: 'open',
    capacity: undefined,
    location: 'Joseph Echols Athletic Center, Level B1',
  },
  {
    id: 'sp-home-venue',
    name: 'Monarch Arena',
    type: 'home_venue',
    status: 'closed',
    capacity: 8200,
    location: '4415 Hampton Blvd, Norfolk, VA',
  },
  {
    id: 'sp-practice',
    name: 'Practice Court A',
    type: 'practice_venue',
    status: 'open',
    capacity: 200,
    location: 'Joseph Echols Athletic Center, Level 1',
  },
];

// ── Bookings (10 — mix of types across today/this week) ─────────────────────

export const FACILITY_BOOKINGS: Booking[] = [
  {
    id: 'bk-001',
    spaceId: 'sp-court-main',
    spaceName: 'Main Gym — Monarch Court',
    type: 'practice',
    title: 'Team Practice — Half-Court Sets',
    start: minsFromNow(-30),
    end: minsFromNow(90),
    owner: 'Alex Morgan',
    attendees: ['Coaching Staff', 'All Players'],
    notes: 'Focus on motion offense and late-clock execution.',
  },
  {
    id: 'bk-002',
    spaceId: 'sp-weight',
    spaceName: 'Monarch Weight Room',
    type: 'lift',
    title: 'AM Lift — Guards',
    start: minsFromNow(150),
    end: minsFromNow(210),
    owner: 'Coach Pearson',
    attendees: ['PG group', 'SG group'],
  },
  {
    id: 'bk-003',
    spaceId: 'sp-film',
    spaceName: 'Film Room A',
    type: 'film',
    title: 'Opponent Film — Hampton Pirates',
    start: minsFromNow(-120),
    end: minsFromNow(-30),
    owner: 'Coach Davis',
    attendees: ['Coaching Staff'],
    notes: 'Prep scout for Wednesday game.',
  },
  {
    id: 'bk-004',
    spaceId: 'sp-training',
    spaceName: 'Monarch Training Center',
    type: 'training',
    title: 'Pre-Practice Treatment & Rehab',
    start: minsFromNow(-180),
    end: minsFromNow(-60),
    owner: 'Dr. Thompson',
    attendees: ['Marcus Johnson', 'Derrick Cole'],
  },
  {
    id: 'bk-005',
    spaceId: 'sp-meeting',
    spaceName: 'Coaches\' War Room',
    type: 'meeting',
    title: 'Recruiting Strategy — Spring Targets',
    start: minsFromNow(300),
    end: minsFromNow(360),
    owner: 'Alex Morgan',
    attendees: ['Full Coaching Staff'],
    notes: 'Review spring visit list and scholarship allocation.',
  },
  {
    id: 'bk-006',
    spaceId: 'sp-home-venue',
    spaceName: 'Monarch Arena',
    type: 'game',
    title: 'Carroll College vs. Hampton — Frontier Conference',
    start: daysFromNow(2),
    end: new Date(daysFromNow(2).getTime() + 150 * 60000),
    owner: 'Game Operations',
    attendees: ['All Staff', 'All Players'],
    notes: 'Doors open 90 minutes before tipoff.',
  },
  {
    id: 'bk-007',
    spaceId: 'sp-practice',
    spaceName: 'Practice Court A',
    type: 'practice',
    title: 'Individual Workouts — Bigs',
    start: minsFromNow(480),
    end: minsFromNow(540),
    owner: 'Coach Robinson',
    attendees: ['PF/C group'],
  },
  {
    id: 'bk-008',
    spaceId: 'sp-weight',
    spaceName: 'Monarch Weight Room',
    type: 'lift',
    title: 'PM Lift — Bigs',
    start: minsFromNow(600),
    end: minsFromNow(660),
    owner: 'Coach Pearson',
    attendees: ['PF/C group'],
  },
  {
    id: 'bk-009',
    spaceId: 'sp-film',
    spaceName: 'Film Room A',
    type: 'film',
    title: 'Self-Scout — Last 3 Games',
    start: daysFromNow(1),
    end: new Date(daysFromNow(1).getTime() + 75 * 60000),
    owner: 'Coach Davis',
    attendees: ['Coaching Staff', 'Team Captains'],
  },
  {
    id: 'bk-010',
    spaceId: 'sp-court-main',
    spaceName: 'Main Gym — Monarch Court',
    type: 'event',
    title: 'Youth Clinic — Monarch Basketball Camp',
    start: daysFromNow(5),
    end: new Date(daysFromNow(5).getTime() + 180 * 60000),
    owner: 'Community Relations',
    attendees: ['Select Players', 'Camp Staff'],
    notes: 'Ages 8-14, 120 participants expected.',
  },
];

// ── Work Orders (8 — various statuses) ──────────────────────────────────────

export const FACILITY_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-001',
    spaceId: 'sp-court-main',
    spaceName: 'Main Gym — Monarch Court',
    issueType: 'floor',
    severity: 'critical',
    title: 'Dead spot near free-throw line (south end)',
    description:
      'Players reporting a soft/bouncy dead spot approximately 2 feet left of the south free-throw line. Subfloor may need repair or replacement. Area marked with tape.',
    requester: 'Alex Morgan',
    assignee: 'Regional Flooring Pros',
    vendor: 'Regional Flooring Pros',
    status: 'in_progress',
    costEstimate: 4500,
    createdAt: minsFromNow(-4320),
    updatedAt: minsFromNow(-120),
  },
  {
    id: 'wo-002',
    spaceId: 'sp-weight',
    spaceName: 'Monarch Weight Room',
    issueType: 'equipment',
    severity: 'high',
    title: 'Cable machine — frayed cable on lat pulldown',
    description:
      'Right-side lat pulldown cable showing visible fraying near the upper pulley. Machine locked out and tagged until replacement arrives.',
    requester: 'Coach Pearson',
    assignee: 'Hampton Roads Fitness Supply',
    vendor: 'Hampton Roads Fitness Supply',
    status: 'assigned',
    costEstimate: 350,
    createdAt: minsFromNow(-2880),
    updatedAt: minsFromNow(-1440),
  },
  {
    id: 'wo-003',
    spaceId: 'sp-film',
    spaceName: 'Film Room A',
    issueType: 'it',
    severity: 'medium',
    title: 'Projector flickering intermittently',
    description:
      'Main projector in Film Room A flickers every 10-15 minutes. Lamp replacement or HDMI cable may be the issue. Backup portable projector deployed temporarily.',
    requester: 'Coach Davis',
    status: 'requested',
    costEstimate: 200,
    createdAt: minsFromNow(-1440),
    updatedAt: minsFromNow(-1440),
  },
  {
    id: 'wo-004',
    spaceId: 'sp-training',
    spaceName: 'Monarch Training Center',
    issueType: 'plumbing',
    severity: 'medium',
    title: 'Hydrotherapy tub slow drain',
    description:
      'Cold plunge tub draining much slower than usual. May be clogged drain line. Not urgent but affecting treatment schedule turnaround.',
    requester: 'Dr. Thompson',
    assignee: 'Tidewater Plumbing Co.',
    vendor: 'Tidewater Plumbing Co.',
    status: 'approved',
    costEstimate: 275,
    createdAt: minsFromNow(-2160),
    updatedAt: minsFromNow(-720),
  },
  {
    id: 'wo-005',
    spaceId: 'sp-locker',
    spaceName: 'Men\'s Basketball Locker Room',
    issueType: 'hvac',
    severity: 'low',
    title: 'Vent above locker 12 blowing weak airflow',
    description:
      'HVAC vent above locker 12 seems partially blocked — noticeably less airflow compared to neighboring vents. Low priority, no comfort complaints yet.',
    requester: 'Equipment Manager',
    status: 'requested',
    createdAt: minsFromNow(-720),
    updatedAt: minsFromNow(-720),
  },
  {
    id: 'wo-006',
    spaceId: 'sp-home-venue',
    spaceName: 'Monarch Arena',
    issueType: 'lighting',
    severity: 'high',
    title: 'Section 204 overhead light bank out',
    description:
      'One of four overhead light banks above Section 204 is completely dark. Affects game-day lighting balance. Needs attention before Wednesday home game.',
    requester: 'Game Operations',
    assignee: 'Dominion Electric Services',
    vendor: 'Dominion Electric Services',
    status: 'in_progress',
    costEstimate: 1200,
    createdAt: minsFromNow(-5760),
    updatedAt: minsFromNow(-480),
  },
  {
    id: 'wo-007',
    spaceId: 'sp-practice',
    spaceName: 'Practice Court A',
    issueType: 'cleaning',
    severity: 'low',
    title: 'Deep clean and re-seal court surface',
    description:
      'Routine deep clean and sealant reapplication for Practice Court A. Scheduled for next off-day window.',
    requester: 'Facilities Manager',
    assignee: 'Monarch Custodial Services',
    vendor: 'Monarch Custodial Services',
    status: 'completed',
    costEstimate: 800,
    createdAt: minsFromNow(-10080),
    updatedAt: minsFromNow(-1440),
  },
  {
    id: 'wo-008',
    spaceId: 'sp-meeting',
    spaceName: 'Coaches\' War Room',
    issueType: 'it',
    severity: 'low',
    title: 'Install second display for video conferencing',
    description:
      'Request to add a secondary 55" display on the east wall for split-screen video conferencing during recruiting calls. Mount, display, and cabling needed.',
    requester: 'Alex Morgan',
    status: 'approved',
    costEstimate: 1800,
    createdAt: minsFromNow(-7200),
    updatedAt: minsFromNow(-2880),
  },
];

// ── Issues (5) ──────────────────────────────────────────────────────────────

export const FACILITY_ISSUES: FacilityIssue[] = [
  {
    id: 'iss-001',
    spaceId: 'sp-court-main',
    spaceName: 'Main Gym — Monarch Court',
    severity: 'critical',
    title: 'Dead spot on court surface — south free-throw area',
    owner: 'Alex Morgan',
    status: 'investigating',
    lastUpdate: 'Flooring vendor on-site Thursday for subfloor assessment.',
    createdAt: minsFromNow(-4320),
  },
  {
    id: 'iss-002',
    spaceId: 'sp-home-venue',
    spaceName: 'Monarch Arena',
    severity: 'high',
    title: 'Section 204 light bank failure',
    owner: 'Game Operations',
    status: 'investigating',
    lastUpdate: 'Electrician replacing ballasts; expected completion tomorrow.',
    createdAt: minsFromNow(-5760),
  },
  {
    id: 'iss-003',
    spaceId: 'sp-weight',
    spaceName: 'Monarch Weight Room',
    severity: 'high',
    title: 'Lat pulldown cable fraying — machine locked out',
    owner: 'Coach Pearson',
    status: 'open',
    lastUpdate: 'Replacement cable ordered, ETA 3 business days.',
    createdAt: minsFromNow(-2880),
  },
  {
    id: 'iss-004',
    spaceId: 'sp-training',
    spaceName: 'Monarch Training Center',
    severity: 'medium',
    title: 'Cold plunge tub drainage delay',
    owner: 'Dr. Thompson',
    status: 'open',
    lastUpdate: 'Plumber scheduled for Friday AM.',
    createdAt: minsFromNow(-2160),
  },
  {
    id: 'iss-005',
    spaceId: 'sp-storage',
    spaceName: 'Equipment Storage Bay',
    severity: 'low',
    title: 'Storage shelving unit leaning — needs re-anchoring',
    owner: 'Equipment Manager',
    status: 'resolved',
    lastUpdate: 'Shelving re-anchored to wall studs. Verified stable.',
    createdAt: minsFromNow(-14400),
  },
];

// ── Assets / Inventory (15) ─────────────────────────────────────────────────

export const FACILITY_ASSETS: FacilityAsset[] = [
  // Court equipment
  {
    id: 'ast-001',
    name: 'Spalding TF-1000 Game Balls',
    category: 'court_equipment',
    assignedSpaceId: 'sp-court-main',
    assignedSpaceName: 'Main Gym — Monarch Court',
    condition: 'good',
    quantity: 24,
    lastServiceDate: minsFromNow(-20160),
  },
  {
    id: 'ast-002',
    name: 'Portable Shot Clock (pair)',
    category: 'court_equipment',
    assignedSpaceId: 'sp-practice',
    assignedSpaceName: 'Practice Court A',
    condition: 'good',
    quantity: 2,
    lastServiceDate: minsFromNow(-43200),
    nextServiceDate: daysFromNow(60),
  },
  {
    id: 'ast-003',
    name: 'Shooting Machine (Dr. Dish CT)',
    category: 'court_equipment',
    assignedSpaceId: 'sp-practice',
    assignedSpaceName: 'Practice Court A',
    condition: 'needs_service',
    quantity: 1,
    lastServiceDate: minsFromNow(-86400),
    nextServiceDate: daysFromNow(7),
    vendorLink: 'https://drdishbasketball.com/support',
  },
  {
    id: 'ast-004',
    name: 'Practice Pinnies (dark/light sets)',
    category: 'court_equipment',
    assignedSpaceId: 'sp-storage',
    assignedSpaceName: 'Equipment Storage Bay',
    condition: 'good',
    quantity: 30,
  },
  // Weight equipment
  {
    id: 'ast-005',
    name: 'Rogue Olympic Platform',
    category: 'weight_equipment',
    assignedSpaceId: 'sp-weight',
    assignedSpaceName: 'Monarch Weight Room',
    condition: 'good',
    quantity: 6,
    lastServiceDate: minsFromNow(-30240),
    nextServiceDate: daysFromNow(90),
  },
  {
    id: 'ast-006',
    name: 'Cable Machine — Dual Adjustable Pulley',
    category: 'weight_equipment',
    assignedSpaceId: 'sp-weight',
    assignedSpaceName: 'Monarch Weight Room',
    condition: 'out',
    quantity: 1,
    lastServiceDate: minsFromNow(-2880),
    nextServiceDate: daysFromNow(3),
    vendorLink: 'https://hamptonroadsfitness.com',
  },
  {
    id: 'ast-007',
    name: 'Dumbbell Set (5–100 lbs)',
    category: 'weight_equipment',
    assignedSpaceId: 'sp-weight',
    assignedSpaceName: 'Monarch Weight Room',
    condition: 'good',
    quantity: 40,
  },
  // Training supplies
  {
    id: 'ast-008',
    name: 'NormaTec Recovery Boots',
    category: 'training_supplies',
    assignedSpaceId: 'sp-training',
    assignedSpaceName: 'Monarch Training Center',
    condition: 'good',
    quantity: 6,
    lastServiceDate: minsFromNow(-10080),
    nextServiceDate: daysFromNow(45),
  },
  {
    id: 'ast-009',
    name: 'HydroWorx Cold Plunge Tub',
    category: 'training_supplies',
    assignedSpaceId: 'sp-training',
    assignedSpaceName: 'Monarch Training Center',
    condition: 'needs_service',
    quantity: 1,
    lastServiceDate: minsFromNow(-43200),
    nextServiceDate: daysFromNow(5),
  },
  {
    id: 'ast-010',
    name: 'Athletic Tape & Wrap Supply Kit',
    category: 'training_supplies',
    assignedSpaceId: 'sp-training',
    assignedSpaceName: 'Monarch Training Center',
    condition: 'good',
    quantity: 50,
  },
  {
    id: 'ast-011',
    name: 'Foam Rollers & Mobility Kit',
    category: 'training_supplies',
    assignedSpaceId: 'sp-training',
    assignedSpaceName: 'Monarch Training Center',
    condition: 'good',
    quantity: 15,
  },
  // Film gear
  {
    id: 'ast-012',
    name: 'Hudl Focus Camera System',
    category: 'film_gear',
    assignedSpaceId: 'sp-court-main',
    assignedSpaceName: 'Main Gym — Monarch Court',
    condition: 'good',
    quantity: 2,
    lastServiceDate: minsFromNow(-20160),
    nextServiceDate: daysFromNow(120),
  },
  {
    id: 'ast-013',
    name: 'Epson Pro Projector',
    category: 'film_gear',
    assignedSpaceId: 'sp-film',
    assignedSpaceName: 'Film Room A',
    condition: 'needs_service',
    quantity: 1,
    lastServiceDate: minsFromNow(-60480),
    nextServiceDate: daysFromNow(7),
    vendorLink: 'https://epson.com/support',
  },
  // Storage equipment
  {
    id: 'ast-014',
    name: 'Ball Rack Cart (48-ball capacity)',
    category: 'storage_equipment',
    assignedSpaceId: 'sp-storage',
    assignedSpaceName: 'Equipment Storage Bay',
    condition: 'good',
    quantity: 3,
  },
  {
    id: 'ast-015',
    name: 'Heavy-Duty Equipment Shelving Unit',
    category: 'storage_equipment',
    assignedSpaceId: 'sp-storage',
    assignedSpaceName: 'Equipment Storage Bay',
    condition: 'good',
    quantity: 4,
    lastServiceDate: minsFromNow(-14400),
  },
];

// ── Vendors (6) ─────────────────────────────────────────────────────────────

export const FACILITY_VENDORS: FacilityVendor[] = [
  {
    id: 'vnd-001',
    name: 'Monarch Custodial Services',
    serviceType: 'Cleaning & Janitorial',
    linkedSpaces: [
      'sp-court-main',
      'sp-practice',
      'sp-locker',
      'sp-home-venue',
    ],
    renewalDate: daysFromNow(180),
    contact: 'custodial@kanext.edu',
    openWorkOrders: 0,
  },
  {
    id: 'vnd-002',
    name: 'Dominion Electric Services',
    serviceType: 'Electrical & Lighting',
    linkedSpaces: ['sp-home-venue', 'sp-court-main'],
    renewalDate: daysFromNow(270),
    contact: 'dispatch@dominionelectric.com',
    openWorkOrders: 1,
  },
  {
    id: 'vnd-003',
    name: 'Regional Flooring Pros',
    serviceType: 'Hardwood Court Flooring',
    linkedSpaces: ['sp-court-main', 'sp-practice'],
    renewalDate: daysFromNow(90),
    contact: 'service@regionalflooringpros.com',
    openWorkOrders: 1,
  },
  {
    id: 'vnd-004',
    name: 'Hampton Roads Fitness Supply',
    serviceType: 'Weight & Training Equipment',
    linkedSpaces: ['sp-weight'],
    renewalDate: daysFromNow(365),
    contact: 'orders@hrfitnesssupply.com',
    openWorkOrders: 1,
  },
  {
    id: 'vnd-005',
    name: 'Tidewater Plumbing Co.',
    serviceType: 'Plumbing & Water Systems',
    linkedSpaces: ['sp-training', 'sp-locker'],
    renewalDate: daysFromNow(150),
    contact: 'info@tidewaterplumbing.com',
    openWorkOrders: 1,
  },
  {
    id: 'vnd-006',
    name: 'Campus IT Services',
    serviceType: 'IT & AV Support',
    linkedSpaces: ['sp-film', 'sp-meeting', 'sp-office'],
    contact: 'helpdesk@kanext.edu',
    openWorkOrders: 2,
  },
];

// ── Safety Inspections (8) ──────────────────────────────────────────────────

export const SAFETY_INSPECTIONS: SafetyInspection[] = [
  {
    id: 'insp-001',
    template: 'Court Surface Inspection',
    spaceId: 'sp-court-main',
    spaceName: 'Main Gym — Monarch Court',
    cadence: 'weekly',
    status: 'compliant',
    lastCompleted: minsFromNow(-2880),
    nextDue: daysFromNow(5),
    completedBy: 'Facilities Manager',
    notes: 'Dead spot flagged separately as work order.',
  },
  {
    id: 'insp-002',
    template: 'Court Surface Inspection',
    spaceId: 'sp-practice',
    spaceName: 'Practice Court A',
    cadence: 'weekly',
    status: 'compliant',
    lastCompleted: minsFromNow(-4320),
    nextDue: daysFromNow(3),
    completedBy: 'Facilities Manager',
  },
  {
    id: 'insp-003',
    template: 'Weight Room Equipment Safety Check',
    spaceId: 'sp-weight',
    spaceName: 'Monarch Weight Room',
    cadence: 'weekly',
    status: 'due_soon',
    lastCompleted: minsFromNow(-8640),
    nextDue: daysFromNow(1),
    completedBy: 'Coach Pearson',
    notes: 'Cable machine flagged and locked out during last check.',
  },
  {
    id: 'insp-004',
    template: 'Training Room Sanitation & Equipment',
    spaceId: 'sp-training',
    spaceName: 'Monarch Training Center',
    cadence: 'weekly',
    status: 'compliant',
    lastCompleted: minsFromNow(-1440),
    nextDue: daysFromNow(6),
    completedBy: 'Dr. Thompson',
  },
  {
    id: 'insp-005',
    template: 'Fire Safety & Emergency Egress',
    spaceId: 'sp-home-venue',
    spaceName: 'Monarch Arena',
    cadence: 'monthly',
    status: 'compliant',
    lastCompleted: minsFromNow(-20160),
    nextDue: daysFromNow(16),
    completedBy: 'Campus Fire Marshal',
  },
  {
    id: 'insp-006',
    template: 'Fire Safety & Emergency Egress',
    spaceId: 'sp-court-main',
    spaceName: 'Main Gym — Monarch Court',
    cadence: 'monthly',
    status: 'overdue',
    lastCompleted: minsFromNow(-50400),
    nextDue: minsFromNow(-7200),
    notes: 'Missed due to schedule conflict. Rescheduling for this week.',
  },
  {
    id: 'insp-007',
    template: 'AED & First Aid Supply Audit',
    spaceId: 'sp-court-main',
    spaceName: 'Main Gym — Monarch Court',
    cadence: 'quarterly',
    status: 'compliant',
    lastCompleted: minsFromNow(-43200),
    nextDue: daysFromNow(45),
    completedBy: 'Dr. Thompson',
    notes: 'All AED units tested and pads within expiry.',
  },
  {
    id: 'insp-008',
    template: 'AED & First Aid Supply Audit',
    spaceId: 'sp-home-venue',
    spaceName: 'Monarch Arena',
    cadence: 'quarterly',
    status: 'due_soon',
    lastCompleted: minsFromNow(-86400),
    nextDue: daysFromNow(5),
    completedBy: 'Dr. Thompson',
  },
];

// ── Audit Log (10 entries) ──────────────────────────────────────────────────

export const FACILITY_AUDIT_LOG: FacilityAuditEntry[] = [
  {
    id: 'aud-001',
    action: 'Booking created',
    actor: 'Alex Morgan',
    target: 'Team Practice — Half-Court Sets (Main Gym)',
    timestamp: minsFromNow(-180),
  },
  {
    id: 'aud-002',
    action: 'Work order escalated to critical',
    actor: 'Alex Morgan',
    target: 'WO-001: Dead spot near free-throw line',
    timestamp: minsFromNow(-240),
  },
  {
    id: 'aud-003',
    action: 'Inspection completed',
    actor: 'Facilities Manager',
    target: 'Court Surface Inspection — Main Gym',
    timestamp: minsFromNow(-2880),
  },
  {
    id: 'aud-004',
    action: 'Vendor assigned to work order',
    actor: 'Facilities Manager',
    target: 'WO-002: Cable machine frayed cable → Hampton Roads Fitness Supply',
    timestamp: minsFromNow(-1440),
  },
  {
    id: 'aud-005',
    action: 'Asset marked out of service',
    actor: 'Coach Pearson',
    target: 'Cable Machine — Dual Adjustable Pulley (Weight Room)',
    timestamp: minsFromNow(-2880),
  },
  {
    id: 'aud-006',
    action: 'Work order completed',
    actor: 'Monarch Custodial Services',
    target: 'WO-007: Deep clean and re-seal Practice Court A',
    timestamp: minsFromNow(-1440),
  },
  {
    id: 'aud-007',
    action: 'Setting updated',
    actor: 'Alex Morgan',
    target: 'Work order auto-approval threshold changed to $500',
    timestamp: minsFromNow(-4320),
  },
  {
    id: 'aud-008',
    action: 'Booking cancelled',
    actor: 'Coach Davis',
    target: 'Film Session — cancelled due to projector issue',
    timestamp: minsFromNow(-5760),
  },
  {
    id: 'aud-009',
    action: 'Safety inspection overdue alert',
    actor: 'System',
    target: 'Fire Safety & Emergency Egress — Main Gym (INSP-006)',
    timestamp: minsFromNow(-7200),
  },
  {
    id: 'aud-010',
    action: 'New vendor contract uploaded',
    actor: 'Facilities Manager',
    target: 'Regional Flooring Pros — 2026 service agreement',
    timestamp: minsFromNow(-10080),
  },
];

// ── Settings (8 toggles) ────────────────────────────────────────────────────

export const FACILITY_SETTINGS: FacilitySettingToggle[] = [
  {
    id: 'set-001',
    label: 'Booking Conflict Prevention',
    description:
      'Block new bookings that overlap with existing reservations for the same space.',
    enabled: true,
  },
  {
    id: 'set-002',
    label: 'Auto-Approve Low-Cost Work Orders',
    description:
      'Automatically approve work orders with cost estimates under $500 without manual review.',
    enabled: true,
  },
  {
    id: 'set-003',
    label: 'Safety Inspection Overdue Alerts',
    description:
      'Send push notifications when a safety inspection passes its due date.',
    enabled: true,
  },
  {
    id: 'set-004',
    label: 'Daily Booking Digest',
    description:
      'Send a morning summary of all bookings for the day to coaching staff.',
    enabled: true,
  },
  {
    id: 'set-005',
    label: 'Vendor Access Logging',
    description:
      'Log all vendor check-in / check-out times in the audit trail.',
    enabled: false,
  },
  {
    id: 'set-006',
    label: 'Require Photo for Work Order Submission',
    description:
      'Require at least one photo attachment when submitting a new work order.',
    enabled: false,
  },
  {
    id: 'set-007',
    label: 'Critical Issue Escalation',
    description:
      'Automatically escalate critical-severity issues to the Head Coach and AD within 30 minutes.',
    enabled: true,
  },
  {
    id: 'set-008',
    label: 'Game-Day Space Lockdown',
    description:
      'Restrict non-essential bookings in game-day facilities for 6 hours before tipoff.',
    enabled: true,
  },
];
