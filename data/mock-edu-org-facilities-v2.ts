/**
 * Education Organization Facilities V2 — Mock Data & Types
 * Campus facility management for HBCU-themed institutions (Howard University).
 * Covers: Buildings, Rooms, Assets, Work Orders, Maintenance, Inspections,
 * Vendors, Safety Zones, Access Groups, and Capital Projects.
 */

// =============================================================================
// TYPES
// =============================================================================

export type BuildingType =
  | 'dorm'
  | 'academic'
  | 'athletics'
  | 'admin'
  | 'dining'
  | 'worship'
  | 'multipurpose'
  | 'maintenance';

export type BuildingStatus = 'good' | 'watch' | 'at_risk' | 'down';

export type SystemType =
  | 'hvac'
  | 'electrical'
  | 'plumbing'
  | 'internet'
  | 'fire'
  | 'security';

export type RoomType =
  | 'classroom'
  | 'lab'
  | 'office'
  | 'gym'
  | 'dorm_floor'
  | 'chapel'
  | 'auditorium'
  | 'dining'
  | 'conference';

export type RoomStatus = 'available' | 'limited' | 'down';

export type AccessLevel = 'public' | 'restricted' | 'secured';

export type AssetCategory =
  | 'hvac_unit'
  | 'scoreboard'
  | 'bus'
  | 'laundry'
  | 'security_camera'
  | 'kitchen_equipment'
  | 'lab_equipment'
  | 'av_system';

export type AssetCondition = 'ok' | 'watch' | 'failed';

export type WorkOrderCategory =
  | 'safety'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'it'
  | 'general';

export type WorkOrderPriority = 'critical' | 'high' | 'normal';

export type WorkOrderStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'waiting'
  | 'complete'
  | 'closed';

export type MaintenanceStatus = 'scheduled' | 'done' | 'missed';

export type InspectionType =
  | 'fire'
  | 'housing'
  | 'health'
  | 'ada'
  | 'athletics'
  | 'insurance';

export type InspectionStatus = 'due' | 'scheduled' | 'completed' | 'failed';

export type VendorStatus = 'active' | 'expiring' | 'inactive';

export type ProjectStatus = 'planned' | 'in_progress' | 'at_risk' | 'complete';

// =============================================================================
// INTERFACES
// =============================================================================

export interface FacilitiesPosture {
  status: BuildingStatus;
  criticalWorkOrders: number;
  inspectionsDue: number;
  areasDown: number;
}

export interface TodayImpact {
  id: string;
  title: string;
  buildingId: string;
  severity: WorkOrderPriority;
  description: string;
}

export interface BuildingSystem {
  type: SystemType;
  status: BuildingStatus;
  lastService: string;
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  campus: string;
  status: BuildingStatus;
  condition: number;
  systems: BuildingSystem[];
  workOrderCount: number;
  nextInspection: string;
  yearBuilt: number;
  sqft: number;
}

export interface FacilityRoom {
  id: string;
  buildingId: string;
  name: string;
  type: RoomType;
  capacity: number;
  status: RoomStatus;
  accessLevel: AccessLevel;
  floor: number;
}

export interface FacilityAsset {
  id: string;
  name: string;
  category: AssetCategory;
  buildingId: string;
  location: string;
  condition: AssetCondition;
  warrantyExpiry: string;
  maintenanceCadence: string;
  lastService: string;
  value: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  buildingId: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignee: string;
  createdDate: string;
  dueDate: string;
  slaHours: number;
  description: string;
  requiresEvidence: boolean;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  buildingId: string;
  system: SystemType;
  status: MaintenanceStatus;
  frequency: string;
  scheduledDate: string;
  assignee: string;
}

export interface Inspection {
  id: string;
  type: InspectionType;
  buildingId: string;
  status: InspectionStatus;
  dueDate: string;
  completedDate?: string;
  result?: string;
  inspector?: string;
  remediationWorkOrderId?: string;
}

export interface FacilityVendor {
  id: string;
  name: string;
  specialty: string;
  status: VendorStatus;
  contractExpiry: string;
  slaTarget: string;
  insuranceVerified: boolean;
  jobsCompleted: number;
  riskFlags: string[];
}

export interface SafetyZone {
  id: string;
  name: string;
  buildingId: string;
  type: string;
  description: string;
}

export interface AccessGroup {
  id: string;
  name: string;
  members: number;
  zones: string[];
}

export interface CapitalProject {
  id: string;
  name: string;
  buildingId: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  description: string;
  risks: string[];
}

// =============================================================================
// CONSTANTS — Labels
// =============================================================================

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  dorm: 'Dormitory',
  academic: 'Academic',
  athletics: 'Athletics',
  admin: 'Administrative',
  dining: 'Dining',
  worship: 'Worship',
  multipurpose: 'Multipurpose',
  maintenance: 'Maintenance',
};

export const BUILDING_STATUS_LABELS: Record<BuildingStatus, string> = {
  good: 'Good',
  watch: 'Watch',
  at_risk: 'At Risk',
  down: 'Down',
};

export const SYSTEM_TYPE_LABELS: Record<SystemType, string> = {
  hvac: 'HVAC',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  internet: 'Internet',
  fire: 'Fire Safety',
  security: 'Security',
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  classroom: 'Classroom',
  lab: 'Lab',
  office: 'Office',
  gym: 'Gymnasium',
  dorm_floor: 'Dorm Floor',
  chapel: 'Chapel',
  auditorium: 'Auditorium',
  dining: 'Dining',
  conference: 'Conference',
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Available',
  limited: 'Limited',
  down: 'Down',
};

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  public: 'Public',
  restricted: 'Restricted',
  secured: 'Secured',
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  hvac_unit: 'HVAC Unit',
  scoreboard: 'Scoreboard',
  bus: 'Bus',
  laundry: 'Laundry',
  security_camera: 'Security Camera',
  kitchen_equipment: 'Kitchen Equipment',
  lab_equipment: 'Lab Equipment',
  av_system: 'AV System',
};

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  ok: 'OK',
  watch: 'Watch',
  failed: 'Failed',
};

export const WORK_ORDER_CATEGORY_LABELS: Record<WorkOrderCategory, string> = {
  safety: 'Safety',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  hvac: 'HVAC',
  it: 'IT',
  general: 'General',
};

export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
};

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  complete: 'Complete',
  closed: 'Closed',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  scheduled: 'Scheduled',
  done: 'Done',
  missed: 'Missed',
};

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  fire: 'Fire Safety',
  housing: 'Housing',
  health: 'Health',
  ada: 'ADA',
  athletics: 'Athletics',
  insurance: 'Insurance',
};

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  due: 'Due',
  scheduled: 'Scheduled',
  completed: 'Completed',
  failed: 'Failed',
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  active: 'Active',
  expiring: 'Expiring',
  inactive: 'Inactive',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  complete: 'Complete',
};

// =============================================================================
// CONSTANTS — Colors
// =============================================================================

export const BUILDING_TYPE_COLORS: Record<BuildingType, string> = {
  dorm: '#1A1714',
  academic: '#1A1714',
  athletics: '#B85C5C',
  admin: '#B8943E',
  dining: '#5A8A6E',
  worship: '#9C9790',
  multipurpose: '#1A1714',
  maintenance: '#9C9790',
};

export const BUILDING_STATUS_COLORS: Record<BuildingStatus, string> = {
  good: '#5A8A6E',
  watch: '#B8943E',
  at_risk: '#B85C5C',
  down: '#B85C5C',
};

export const SYSTEM_TYPE_COLORS: Record<SystemType, string> = {
  hvac: '#1A1714',
  electrical: '#B8943E',
  plumbing: '#5A8A6E',
  internet: '#1A1714',
  fire: '#B85C5C',
  security: '#1A1714',
};

export const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  classroom: '#1A1714',
  lab: '#1A1714',
  office: '#B8943E',
  gym: '#B85C5C',
  dorm_floor: '#1A1714',
  chapel: '#9C9790',
  auditorium: '#5A8A6E',
  dining: '#5A8A6E',
  conference: '#B8943E',
};

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  available: '#5A8A6E',
  limited: '#B8943E',
  down: '#B85C5C',
};

export const ACCESS_LEVEL_COLORS: Record<AccessLevel, string> = {
  public: '#5A8A6E',
  restricted: '#B8943E',
  secured: '#B85C5C',
};

export const ASSET_CATEGORY_COLORS: Record<AssetCategory, string> = {
  hvac_unit: '#1A1714',
  scoreboard: '#B85C5C',
  bus: '#B8943E',
  laundry: '#1A1714',
  security_camera: '#1A1714',
  kitchen_equipment: '#5A8A6E',
  lab_equipment: '#1A1714',
  av_system: '#9C9790',
};

export const ASSET_CONDITION_COLORS: Record<AssetCondition, string> = {
  ok: '#5A8A6E',
  watch: '#B8943E',
  failed: '#B85C5C',
};

export const WORK_ORDER_CATEGORY_COLORS: Record<WorkOrderCategory, string> = {
  safety: '#B85C5C',
  electrical: '#B8943E',
  plumbing: '#5A8A6E',
  hvac: '#1A1714',
  it: '#1A1714',
  general: '#9C9790',
};

export const WORK_ORDER_PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  critical: '#B85C5C',
  high: '#B85C5C',
  normal: '#B8943E',
};

export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  new: '#B8943E',
  assigned: '#1A1714',
  in_progress: '#1A1714',
  waiting: '#B8943E',
  complete: '#5A8A6E',
  closed: '#9C9790',
};

export const MAINTENANCE_STATUS_COLORS: Record<MaintenanceStatus, string> = {
  scheduled: '#1A1714',
  done: '#5A8A6E',
  missed: '#B85C5C',
};

export const INSPECTION_TYPE_COLORS: Record<InspectionType, string> = {
  fire: '#B85C5C',
  housing: '#1A1714',
  health: '#5A8A6E',
  ada: '#1A1714',
  athletics: '#B8943E',
  insurance: '#9C9790',
};

export const INSPECTION_STATUS_COLORS: Record<InspectionStatus, string> = {
  due: '#B8943E',
  scheduled: '#1A1714',
  completed: '#5A8A6E',
  failed: '#B85C5C',
};

export const VENDOR_STATUS_COLORS: Record<VendorStatus, string> = {
  active: '#5A8A6E',
  expiring: '#B8943E',
  inactive: '#B85C5C',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planned: '#B8943E',
  in_progress: '#1A1714',
  at_risk: '#B85C5C',
  complete: '#5A8A6E',
};

// =============================================================================
// CONSTANTS — Icons
// =============================================================================

export const BUILDING_TYPE_ICONS: Record<BuildingType, string> = {
  dorm: 'bed.double.fill',
  academic: 'book.fill',
  athletics: 'figure.run',
  admin: 'briefcase.fill',
  dining: 'fork.knife',
  worship: 'building.columns.fill',
  multipurpose: 'square.grid.2x2.fill',
  maintenance: 'wrench.fill',
};

export const BUILDING_STATUS_ICONS: Record<BuildingStatus, string> = {
  good: 'checkmark.circle.fill',
  watch: 'exclamationmark.triangle.fill',
  at_risk: 'xmark.octagon.fill',
  down: 'nosign',
};

export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  classroom: 'book.fill',
  lab: 'flask.fill',
  office: 'briefcase.fill',
  gym: 'figure.run',
  dorm_floor: 'bed.double.fill',
  chapel: 'building.columns.fill',
  auditorium: 'person.3.fill',
  dining: 'fork.knife',
  conference: 'person.2.fill',
};

export const ASSET_CATEGORY_ICONS: Record<AssetCategory, string> = {
  hvac_unit: 'wind',
  scoreboard: 'sportscourt.fill',
  bus: 'bus.fill',
  laundry: 'washer.fill',
  security_camera: 'video.fill',
  kitchen_equipment: 'fork.knife',
  lab_equipment: 'flask.fill',
  av_system: 'tv.fill',
};

export const WORK_ORDER_CATEGORY_ICONS: Record<WorkOrderCategory, string> = {
  safety: 'exclamationmark.triangle.fill',
  electrical: 'bolt.fill',
  plumbing: 'drop.fill',
  hvac: 'wind',
  it: 'wifi',
  general: 'wrench.fill',
};

export const INSPECTION_TYPE_ICONS: Record<InspectionType, string> = {
  fire: 'flame.fill',
  housing: 'house.fill',
  health: 'cross.case.fill',
  ada: 'figure.roll',
  athletics: 'figure.run',
  insurance: 'doc.text.fill',
};

// =============================================================================
// SEEDED DATA — Posture
// =============================================================================

const POSTURE: FacilitiesPosture = {
  status: 'watch',
  criticalWorkOrders: 1,
  inspectionsDue: 1,
  areasDown: 1,
};

// =============================================================================
// SEEDED DATA — Today's Impact (3)
// =============================================================================

const TODAY_IMPACT: TodayImpact[] = [
  {
    id: 'ti-001',
    title: 'HVAC Unstable — Science Building',
    buildingId: 'bld-002',
    severity: 'critical',
    description:
      'HVAC system in Howard Science Building showing intermittent failures. Lab temperatures rising above safe thresholds for chemical storage. Vendor dispatched.',
  },
  {
    id: 'ti-002',
    title: 'ADA Ramp Repair — Adams Hall East Entrance',
    buildingId: 'bld-001',
    severity: 'high',
    description:
      'Concrete ADA ramp at east entrance has significant cracking and uneven surface. Temporary barrier installed. Concrete contractor quote pending approval.',
  },
];

// =============================================================================
// SEEDED DATA — Buildings (4)
// =============================================================================

const BUILDINGS: Building[] = [
  {
    id: 'bld-001',
    name: 'Howard Adams Hall',
    type: 'dorm',
    campus: 'Howard University',
    status: 'good',
    condition: 82,
    systems: [
      { type: 'hvac', status: 'good', lastService: '2026-01-15' },
      { type: 'electrical', status: 'good', lastService: '2025-12-10' },
      { type: 'plumbing', status: 'watch', lastService: '2025-11-20' },
      { type: 'fire', status: 'good', lastService: '2026-01-05' },
    ],
    workOrderCount: 2,
    nextInspection: '2026-03-15',
    yearBuilt: 1968,
    sqft: 45000,
  },
  {
    id: 'bld-002',
    name: 'Howard Science Building',
    type: 'academic',
    campus: 'Howard University',
    status: 'watch',
    condition: 68,
    systems: [
      { type: 'hvac', status: 'at_risk', lastService: '2026-02-10' },
      { type: 'electrical', status: 'good', lastService: '2026-01-20' },
      { type: 'internet', status: 'good', lastService: '2026-02-01' },
      { type: 'fire', status: 'good', lastService: '2025-12-15' },
    ],
    workOrderCount: 3,
    nextInspection: '2026-02-28',
    yearBuilt: 1985,
    sqft: 32000,
  },
];

// =============================================================================
// SEEDED DATA — Rooms (8)
// =============================================================================

const ROOMS: FacilityRoom[] = [
  {
    id: 'rm-001',
    buildingId: 'bld-001',
    name: 'Adams Hall — 2nd Floor',
    type: 'dorm_floor',
    capacity: 64,
    status: 'available',
    accessLevel: 'secured',
    floor: 2,
  },
  {
    id: 'rm-002',
    buildingId: 'bld-001',
    name: 'Adams Hall — 3rd Floor',
    type: 'dorm_floor',
    capacity: 64,
    status: 'limited',
    accessLevel: 'secured',
    floor: 3,
  },
  {
    id: 'rm-003',
    buildingId: 'bld-002',
    name: 'Chemistry Lab 201',
    type: 'lab',
    capacity: 30,
    status: 'down',
    accessLevel: 'restricted',
    floor: 2,
  },
  {
    id: 'rm-004',
    buildingId: 'bld-002',
    name: 'Lecture Hall 101',
    type: 'classroom',
    capacity: 120,
    status: 'available',
    accessLevel: 'public',
    floor: 1,
  },
  {
    id: 'rm-005',
    buildingId: 'bld-002',
    name: 'Dean of Sciences Office',
    type: 'office',
    capacity: 6,
    status: 'available',
    accessLevel: 'restricted',
    floor: 3,
  },
];

// =============================================================================
// SEEDED DATA — Assets (6)
// =============================================================================

const ASSETS: FacilityAsset[] = [
  {
    id: 'ast-001',
    name: 'Carrier Rooftop HVAC Unit — Science Bldg',
    category: 'hvac_unit',
    buildingId: 'bld-002',
    location: 'Howard Science Building — Roof',
    condition: 'watch',
    warrantyExpiry: '2025-08-01',
    maintenanceCadence: 'Quarterly',
    lastService: '2026-02-10',
    value: 42000,
  },
  {
    id: 'ast-004',
    name: 'Speed Queen Commercial Laundry System',
    category: 'laundry',
    buildingId: 'bld-001',
    location: 'Howard Adams Hall — Basement',
    condition: 'ok',
    warrantyExpiry: '2027-01-10',
    maintenanceCadence: 'Monthly',
    lastService: '2026-01-28',
    value: 28000,
  },
  {
    id: 'ast-006',
    name: 'Thermo Fisher Spectrophotometer',
    category: 'lab_equipment',
    buildingId: 'bld-002',
    location: 'Howard Science Building — Chemistry Lab 201',
    condition: 'watch',
    warrantyExpiry: '2026-06-01',
    maintenanceCadence: 'Semi-Annual',
    lastService: '2025-12-01',
    value: 35000,
  },
];

// =============================================================================
// SEEDED DATA — Work Orders (8)
// =============================================================================

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-001',
    title: 'Critical HVAC Failure — Science Building',
    buildingId: 'bld-002',
    category: 'hvac',
    priority: 'critical',
    status: 'in_progress',
    assignee: 'Johnson Controls',
    createdDate: '2026-02-16',
    dueDate: '2026-02-18',
    slaHours: 24,
    description:
      'Rooftop HVAC unit serving the science building has failed. Lab temperatures exceeding safe limits for chemical reagent storage. Vendor on-site diagnosing compressor failure.',
    requiresEvidence: true,
  },
  {
    id: 'wo-002',
    title: 'ADA Ramp Repair — Adams Hall East Entrance',
    buildingId: 'bld-001',
    category: 'safety',
    priority: 'high',
    status: 'waiting',
    assignee: 'Facilities Team',
    createdDate: '2026-02-05',
    dueDate: '2026-02-15',
    slaHours: 72,
    description:
      'Concrete ADA ramp at east entrance has significant cracking and uneven surface. Temporary barrier installed. Concrete contractor quote pending approval.',
    requiresEvidence: true,
  },
  {
    id: 'wo-004',
    title: 'Plumbing Leak — Adams Hall 3rd Floor Bathroom',
    buildingId: 'bld-001',
    category: 'plumbing',
    priority: 'high',
    status: 'in_progress',
    assignee: 'Campus Plumbing',
    createdDate: '2026-02-14',
    dueDate: '2026-02-17',
    slaHours: 48,
    description:
      'Persistent leak from 3rd floor bathroom supply line causing water damage to ceiling tiles on 2nd floor. Water shut off to affected section. Pipe replacement in progress.',
    requiresEvidence: true,
  },
  {
    id: 'wo-005',
    title: 'Electrical Panel Upgrade — Science Building',
    buildingId: 'bld-002',
    category: 'electrical',
    priority: 'normal',
    status: 'new',
    assignee: 'Licensed Electrician',
    createdDate: '2026-02-10',
    dueDate: '2026-03-01',
    slaHours: 168,
    description:
      'Main electrical panel in science building approaching capacity with new lab equipment loads. Panel upgrade from 400A to 600A service recommended by inspector.',
    requiresEvidence: false,
  },
];

// =============================================================================
// SEEDED DATA — Maintenance Tasks (6)
// =============================================================================

const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'mt-001',
    title: 'HVAC Filter Replacement — All Buildings',
    buildingId: 'bld-002',
    system: 'hvac',
    status: 'scheduled',
    frequency: 'Monthly',
    scheduledDate: '2026-02-28',
    assignee: 'Johnson Controls',
  },
  {
    id: 'mt-002',
    title: 'Fire Extinguisher Inspection — Adams Hall',
    buildingId: 'bld-001',
    system: 'fire',
    status: 'done',
    frequency: 'Monthly',
    scheduledDate: '2026-02-01',
    assignee: 'Fire Safety Inc.',
  },
  {
    id: 'mt-003',
    title: 'Generator Load Test — Science Building',
    buildingId: 'bld-002',
    system: 'electrical',
    status: 'scheduled',
    frequency: 'Term',
    scheduledDate: '2026-03-10',
    assignee: 'Campus Electrician',
  },
  {
    id: 'mt-006',
    title: 'Plumbing Winterization Check — Adams Hall',
    buildingId: 'bld-001',
    system: 'plumbing',
    status: 'done',
    frequency: 'Weekly',
    scheduledDate: '2026-02-14',
    assignee: 'Campus Plumbing',
  },
];

// =============================================================================
// SEEDED DATA — Inspections (5)
// =============================================================================

const INSPECTIONS: Inspection[] = [
  {
    id: 'insp-001',
    type: 'fire',
    buildingId: 'bld-001',
    status: 'due',
    dueDate: '2026-02-28',
    inspector: 'City Fire Marshal',
  },
  {
    id: 'insp-002',
    type: 'housing',
    buildingId: 'bld-001',
    status: 'completed',
    dueDate: '2026-01-20',
    completedDate: '2026-01-18',
    result: 'Passed — minor recommendation to replace carpet on 2nd floor east wing.',
    inspector: 'State Housing Authority',
  },
  {
    id: 'insp-004',
    type: 'ada',
    buildingId: 'bld-001',
    status: 'failed',
    dueDate: '2026-02-01',
    completedDate: '2026-02-01',
    result: 'Failed — east entrance ADA ramp not compliant. Cracking and uneven surface.',
    inspector: 'ADA Compliance Officer',
    remediationWorkOrderId: 'wo-002',
  },
];

// =============================================================================
// SEEDED DATA — Vendors (4)
// =============================================================================

const VENDORS: FacilityVendor[] = [
  {
    id: 'vnd-001',
    name: 'Johnson Controls',
    specialty: 'HVAC & Building Automation',
    status: 'active',
    contractExpiry: '2027-06-30',
    slaTarget: '4-hour critical response, 24-hour standard',
    insuranceVerified: true,
    jobsCompleted: 47,
    riskFlags: [],
  },
  {
    id: 'vnd-002',
    name: 'Otis Elevator',
    specialty: 'Elevator Maintenance & Repair',
    status: 'expiring',
    contractExpiry: '2026-04-15',
    slaTarget: '2-hour emergency entrapment, 48-hour standard',
    insuranceVerified: true,
    jobsCompleted: 12,
    riskFlags: ['contract_renewal_pending'],
  },
  {
    id: 'vnd-003',
    name: 'Wildcat Security Services',
    specialty: 'Campus Security & Access Control',
    status: 'active',
    contractExpiry: '2027-01-01',
    slaTarget: '15-minute emergency response, 1-hour standard',
    insuranceVerified: true,
    jobsCompleted: 156,
    riskFlags: [],
  },
  {
    id: 'vnd-004',
    name: 'Sunshine Janitorial Co.',
    specialty: 'Janitorial & Custodial Services',
    status: 'active',
    contractExpiry: '2026-12-31',
    slaTarget: 'Daily service M-F, deep clean weekends',
    insuranceVerified: true,
    jobsCompleted: 312,
    riskFlags: [],
  },
];

// =============================================================================
// SEEDED DATA — Safety Zones (3)
// =============================================================================

const SAFETY_ZONES: SafetyZone[] = [
  {
    id: 'sz-001',
    name: 'Chemical Storage Zone',
    buildingId: 'bld-002',
    type: 'hazmat',
    description:
      'Chemistry lab chemical storage area. Restricted access, requires safety training certification. Emergency shower and eyewash station at entrance.',
  },
];

// =============================================================================
// SEEDED DATA — Access Groups (4)
// =============================================================================

const ACCESS_GROUPS: AccessGroup[] = [
  {
    id: 'ag-001',
    name: 'Residential Students',
    members: 312,
    zones: ['bld-001'],
  },
  {
    id: 'ag-002',
    name: 'Faculty & Staff',
    members: 85,
    zones: ['bld-001', 'bld-002'],
  },
  {
    id: 'ag-003',
    name: 'IT Administrators',
    members: 6,
    zones: ['bld-002'],
  },
];

// =============================================================================
// SEEDED DATA — Capital Projects (2)
// =============================================================================

const CAPITAL_PROJECTS: CapitalProject[] = [
  {
    id: 'cp-001',
    name: 'Adams Hall Dorm Renovation — Phase 1',
    buildingId: 'bld-001',
    status: 'in_progress',
    startDate: '2026-01-15',
    endDate: '2026-08-01',
    budget: 2800000,
    spent: 620000,
    description:
      'Complete renovation of Adams Hall 1st and 2nd floors including new plumbing, HVAC upgrades, ADA-compliant bathrooms, modern furniture, and updated fire suppression system. Phase 1 covers floors 1-2; Phase 2 (2027) covers floor 3.',
    risks: [
      'Supply chain delays on ADA fixtures',
      'Asbestos abatement required in 1st floor ceiling tiles',
      'Student relocation coordination during summer break',
    ],
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getEduFacilitiesData() {
  return {
    posture: POSTURE,
    todayImpact: TODAY_IMPACT,
    buildings: BUILDINGS,
    rooms: ROOMS,
    assets: ASSETS,
    workOrders: WORK_ORDERS,
    maintenance: MAINTENANCE_TASKS,
    inspections: INSPECTIONS,
    vendors: VENDORS,
    safetyZones: SAFETY_ZONES,
    accessGroups: ACCESS_GROUPS,
    capitalProjects: CAPITAL_PROJECTS,
  };
}
