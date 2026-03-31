/**
 * Church Organization Facilities V2 — Mock Data & Types
 * Expanded facility management with 10 sub-tabs: Overview, Spaces, Bookings,
 * Requests, Work Orders, Vendors, Inspections, Assets, Capital Projects, Reports.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SpaceType =
  | 'worship_hall'
  | 'classroom'
  | 'office'
  | 'nursery'
  | 'kitchen'
  | 'gym'
  | 'outdoor'
  | 'fellowship_hall'
  | 'parking'
  | 'storage';

export type SpaceStatus = 'available' | 'booked' | 'closed' | 'under_repair';
export type AccessLevel = 'public' | 'staff' | 'restricted';
export type BookingStatus = 'requested' | 'approved' | 'scheduled' | 'completed' | 'cancelled';

export type WorkOrderCategory =
  | 'hvac'
  | 'electrical'
  | 'plumbing'
  | 'cleaning'
  | 'security'
  | 'av'
  | 'general';

export type WorkOrderSeverity = 'critical' | 'high' | 'normal' | 'low';

export type WorkOrderStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'waiting'
  | 'completed'
  | 'closed';

export type InspectionType =
  | 'fire_safety'
  | 'electrical'
  | 'building_code'
  | 'security'
  | 'food_safety'
  | 'playground'
  | 'av_rigging';

export type VendorStatus = 'active' | 'expiring' | 'no_contract';

export type ProjectStatus = 'planning' | 'approved' | 'in_progress' | 'complete';

export type AssetCategory =
  | 'av_gear'
  | 'furniture'
  | 'keys_access'
  | 'maintenance_equipment'
  | 'vehicle';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'needs_replacement';

// =============================================================================
// INTERFACES
// =============================================================================

export interface FacilitySpace {
  id: string;
  name: string;
  building: string;
  campus: string;
  type: SpaceType;
  capacity: number;
  seatedCapacity?: number;
  allowedUses: string[];
  defaultSetup: string;
  accessLevel: AccessLevel;
  status: SpaceStatus;
  lastIncidentDate?: string;
  lastInspectionDate?: string;
  avProfile?: string[];
  storageNotes?: string;
  zone: string;
}

export interface FacilityBooking {
  id: string;
  spaceId: string;
  spaceName: string;
  title: string;
  ministry: string;
  owner: string;
  date: string;
  startTime: string;
  endTime: string;
  attendanceEstimate: number;
  status: BookingStatus;
  checklistRequired: boolean;
  riskFlags: string[];
}

export interface FacilityRequest {
  id: string;
  type: 'booking' | 'setup' | 'keys_access' | 'after_hours' | 'special_event' | 'repair';
  spaceId?: string;
  spaceName?: string;
  requester: string;
  ministry: string;
  description: string;
  dateRequested: string;
  status: 'new' | 'under_review' | 'approved' | 'denied' | 'scheduled';
  approvals: string[];
  notes?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  category: WorkOrderCategory;
  severity: WorkOrderSeverity;
  spaceId: string;
  spaceName: string;
  owner: string;
  vendorAssigned?: string;
  slaTargetDate: string;
  status: WorkOrderStatus;
  evidence: string[];
  impactTags: string[];
  description: string;
  createdDate: string;
}

export interface FacilityVendor {
  id: string;
  name: string;
  category: string;
  contractStatus: VendorStatus;
  slaSummary: string;
  lastInvoiceDate?: string;
  lastInvoiceAmount?: number;
  openWorkOrders: number;
  insuranceCoi: boolean;
  contactName?: string;
  contactPhone?: string;
}

export interface SafetyInspection {
  id: string;
  spaceId: string;
  spaceName: string;
  type: InspectionType;
  scheduledDate: string;
  inspector: string;
  status: 'scheduled' | 'passed' | 'failed' | 'overdue';
  findings?: string;
}

export interface FacilityAsset {
  id: string;
  name: string;
  category: AssetCategory;
  location: string;
  condition: AssetCondition;
  custodian: string;
  replacementValueBand?: string;
  checkoutHistory?: string[];
}

export interface CapitalProject {
  id: string;
  name: string;
  budgetBand: string;
  timeline: string;
  vendors: string[];
  status: ProjectStatus;
  dependencies: string[];
  approvalLog: { approver: string; date: string }[];
}

export interface FacilityReport {
  id: string;
  title: string;
  description: string;
  lastGenerated: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  category: string;
}

// =============================================================================
// CONSTANTS — Labels, Icons, Colors
// =============================================================================

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  worship_hall: 'Worship Hall',
  classroom: 'Classroom',
  office: 'Office',
  nursery: 'Nursery',
  kitchen: 'Kitchen',
  gym: 'Gymnasium',
  outdoor: 'Outdoor',
  fellowship_hall: 'Fellowship Hall',
  parking: 'Parking',
  storage: 'Storage',
};

export const SPACE_TYPE_ICONS: Record<SpaceType, string> = {
  worship_hall: 'building.columns.fill',
  classroom: 'book.fill',
  office: 'briefcase.fill',
  nursery: 'figure.and.child.holdinghands',
  kitchen: 'fork.knife',
  gym: 'figure.run',
  outdoor: 'leaf.fill',
  fellowship_hall: 'person.3.fill',
  parking: 'car.fill',
  storage: 'archivebox.fill',
};

export const SPACE_TYPE_COLORS: Record<SpaceType, string> = {
  worship_hall: '#1A1714',
  classroom: '#5A8A6E',
  office: '#B8943E',
  nursery: '#1A1714',
  kitchen: '#B8943E',
  gym: '#B85C5C',
  outdoor: '#5A8A6E',
  fellowship_hall: '#1A1714',
  parking: '#9C9790',
  storage: '#9C9790',
};

export const SPACE_STATUS_COLORS: Record<SpaceStatus, string> = {
  available: '#5A8A6E',
  booked: '#1A1714',
  closed: '#9C9790',
  under_repair: '#B8943E',
};

export const SPACE_STATUS_LABELS: Record<SpaceStatus, string> = {
  available: 'Available',
  booked: 'Booked',
  closed: 'Closed',
  under_repair: 'Under Repair',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  requested: '#B8943E',
  approved: '#5A8A6E',
  scheduled: '#1A1714',
  completed: '#9C9790',
  cancelled: '#B85C5C',
};

export const WORK_ORDER_SEVERITY_COLORS: Record<WorkOrderSeverity, string> = {
  critical: '#B85C5C',
  high: '#B85C5C',
  normal: '#B8943E',
  low: '#5A8A6E',
};

export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  new: '#B8943E',
  assigned: '#1A1714',
  in_progress: '#1A1714',
  waiting: '#B8943E',
  completed: '#5A8A6E',
  closed: '#9C9790',
};

export const VENDOR_STATUS_COLORS: Record<VendorStatus, string> = {
  active: '#5A8A6E',
  expiring: '#B8943E',
  no_contract: '#B85C5C',
};

export const INSPECTION_STATUS_COLORS: Record<string, string> = {
  scheduled: '#1A1714',
  passed: '#5A8A6E',
  failed: '#B85C5C',
  overdue: '#B85C5C',
};

export const ASSET_CONDITION_COLORS: Record<AssetCondition, string> = {
  excellent: '#5A8A6E',
  good: '#1A1714',
  fair: '#B8943E',
  poor: '#B85C5C',
  needs_replacement: '#B85C5C',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: '#B8943E',
  approved: '#1A1714',
  in_progress: '#1A1714',
  complete: '#5A8A6E',
};

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  public: 'Public',
  staff: 'Staff',
  restricted: 'Restricted',
};

export const ACCESS_LEVEL_COLORS: Record<AccessLevel, string> = {
  public: '#5A8A6E',
  staff: '#1A1714',
  restricted: '#B85C5C',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  requested: 'Requested',
  approved: 'Approved',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  booking: 'Booking',
  maintenance: 'Maintenance',
  setup: 'Setup',
  access: 'Access',
  equipment: 'Equipment',
};

export const REQUEST_TYPE_COLORS: Record<string, string> = {
  booking: '#1A1714',
  maintenance: '#B8943E',
  setup: '#1A1714',
  access: '#1A1714',
  equipment: '#B8943E',
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  completed: 'Completed',
};

export const REQUEST_STATUS_COLORS: Record<string, string> = {
  pending: '#B8943E',
  approved: '#5A8A6E',
  denied: '#B85C5C',
  completed: '#9C9790',
};

export const WO_CATEGORY_LABELS: Record<WorkOrderCategory, string> = {
  hvac: 'HVAC',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  cleaning: 'Cleaning',
  security: 'Security',
  av: 'AV',
  general: 'General',
};

export const WO_CATEGORY_COLORS: Record<WorkOrderCategory, string> = {
  hvac: '#1A1714',
  electrical: '#B8943E',
  plumbing: '#5A8A6E',
  cleaning: '#1A1714',
  security: '#B85C5C',
  av: '#1A1714',
  general: '#9C9790',
};

export const WO_SEVERITY_LABELS: Record<WorkOrderSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

export const WO_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  completed: 'Completed',
  closed: 'Closed',
};

export const CONTRACT_STATUS_LABELS: Record<VendorStatus, string> = {
  active: 'Active',
  expiring: 'Expiring',
  no_contract: 'No Contract',
};

export const INSPECTION_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  passed: 'Passed',
  failed: 'Failed',
  overdue: 'Overdue',
};

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  needs_replacement: 'Needs Replacement',
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  av_gear: 'AV Gear',
  furniture: 'Furniture',
  keys_access: 'Keys/Access',
  maintenance_equipment: 'Maintenance',
  vehicle: 'Vehicle',
};

export const ASSET_CATEGORY_COLORS: Record<AssetCategory, string> = {
  av_gear: '#1A1714',
  furniture: '#B8943E',
  keys_access: '#1A1714',
  maintenance_equipment: '#1A1714',
  vehicle: '#5A8A6E',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  approved: 'Approved',
  in_progress: 'In Progress',
  complete: 'Complete',
};

// =============================================================================
// SEEDED SPACES (10)
// =============================================================================

const SPACES: FacilitySpace[] = [
  {
    id: 'sp-001',
    name: 'Main Sanctuary',
    building: 'Worship Center',
    campus: 'Main Campus',
    type: 'worship_hall',
    capacity: 1200,
    seatedCapacity: 1000,
    allowedUses: ['Worship Service', 'Concert', 'Conference', 'Special Event'],
    defaultSetup: 'Theater-style pews with center and side aisles',
    accessLevel: 'public',
    status: 'booked',
    lastInspectionDate: '2026-01-15',
    avProfile: ['Main PA', 'Line Array', 'Stage Monitors', 'LED Wall', 'Live Stream Rig'],
    zone: 'A',
  },
  {
    id: 'sp-002',
    name: 'Chapel',
    building: 'Worship Center',
    campus: 'Main Campus',
    type: 'worship_hall',
    capacity: 150,
    seatedCapacity: 120,
    allowedUses: ['Worship Service', 'Wedding', 'Prayer Meeting', 'Funeral'],
    defaultSetup: 'Pews with center aisle, communion table at front',
    accessLevel: 'public',
    status: 'available',
    lastInspectionDate: '2026-01-15',
    avProfile: ['Piano', 'Basic Sound', 'Projector'],
    zone: 'A',
  },
  {
    id: 'sp-003',
    name: 'Fellowship Hall',
    building: 'Community Life Center',
    campus: 'Main Campus',
    type: 'fellowship_hall',
    capacity: 350,
    seatedCapacity: 250,
    allowedUses: ['Dinner', 'Reception', 'Ministry Event', 'Community Outreach'],
    defaultSetup: 'Round tables for 8 with chair covers',
    accessLevel: 'public',
    status: 'booked',
    lastInspectionDate: '2025-12-10',
    avProfile: ['Portable PA', 'Projector', 'Screen'],
    zone: 'B',
  },
  {
    id: 'sp-004',
    name: 'Youth Room',
    building: 'Community Life Center',
    campus: 'Main Campus',
    type: 'gym',
    capacity: 200,
    seatedCapacity: 150,
    allowedUses: ['Youth Service', 'Game Night', 'Lock-In', 'Sports'],
    defaultSetup: 'Open floor with movable seating along walls',
    accessLevel: 'public',
    status: 'available',
    lastInspectionDate: '2026-01-20',
    avProfile: ['Portable Speaker', 'TV Monitor', 'Gaming Consoles'],
    zone: 'B',
  },
  {
    id: 'sp-005',
    name: 'Nursery',
    building: 'Education Wing',
    campus: 'Main Campus',
    type: 'nursery',
    capacity: 30,
    allowedUses: ['Childcare', 'Parent-Child Class'],
    defaultSetup: 'Cribs, play mats, toddler tables',
    accessLevel: 'restricted',
    status: 'booked',
    lastInspectionDate: '2026-02-01',
    storageNotes: 'Diapers and supplies in closet C-12',
    zone: 'C',
  },
  {
    id: 'sp-006',
    name: 'Classroom A',
    building: 'Education Wing',
    campus: 'Main Campus',
    type: 'classroom',
    capacity: 35,
    seatedCapacity: 30,
    allowedUses: ['Sunday School', 'Bible Study', 'Training', 'Meeting'],
    defaultSetup: 'U-shape table arrangement with smart board',
    accessLevel: 'public',
    status: 'booked',
    lastInspectionDate: '2026-02-01',
    avProfile: ['Smart Board', 'TV Monitor'],
    zone: 'C',
  },
  {
    id: 'sp-007',
    name: 'Classroom B',
    building: 'Education Wing',
    campus: 'Main Campus',
    type: 'classroom',
    capacity: 25,
    seatedCapacity: 20,
    allowedUses: ['Sunday School', 'Bible Study', 'Craft Workshop', 'Small Group'],
    defaultSetup: 'Cluster tables with craft supply cabinet',
    accessLevel: 'public',
    status: 'available',
    lastInspectionDate: '2026-02-01',
    avProfile: ['TV Monitor'],
    storageNotes: 'Art supplies and curriculum materials in wall cabinet',
    zone: 'C',
  },
  {
    id: 'sp-008',
    name: 'Commercial Kitchen',
    building: 'Community Life Center',
    campus: 'Main Campus',
    type: 'kitchen',
    capacity: 15,
    allowedUses: ['Meal Prep', 'Catering', 'Food Pantry Staging'],
    defaultSetup: 'Industrial kitchen with prep stations',
    accessLevel: 'restricted',
    status: 'under_repair',
    lastIncidentDate: '2026-02-10',
    lastInspectionDate: '2025-11-20',
    storageNotes: 'Walk-in cooler under repair; dry goods in pantry room',
    zone: 'B',
  },
  {
    id: 'sp-009',
    name: 'Administrative Offices',
    building: 'Administration Building',
    campus: 'Main Campus',
    type: 'office',
    capacity: 20,
    allowedUses: ['Staff Work', 'Meeting', 'Pastoral Counseling'],
    defaultSetup: 'Individual offices with shared conference room',
    accessLevel: 'staff',
    status: 'booked',
    lastInspectionDate: '2026-01-10',
    avProfile: ['Conference Room Projector', 'Speakerphone'],
    zone: 'D',
  },
  {
    id: 'sp-010',
    name: 'Prayer Garden',
    building: 'Grounds',
    campus: 'Main Campus',
    type: 'outdoor',
    capacity: 40,
    allowedUses: ['Prayer Walk', 'Outdoor Service', 'Wedding Ceremony', 'Memorial'],
    defaultSetup: 'Walking path with benches and fountain centerpiece',
    accessLevel: 'public',
    status: 'available',
    lastInspectionDate: '2026-01-25',
    storageNotes: 'Portable chairs stored in shed G-1',
    zone: 'E',
  },
];

// =============================================================================
// SEEDED BOOKINGS (12)
// =============================================================================

const BOOKINGS: FacilityBooking[] = [
  {
    id: 'bk-001',
    spaceId: 'sp-001',
    spaceName: 'Main Sanctuary',
    title: 'Sunday Morning Service — 8:00 AM',
    ministry: 'Pastoral',
    owner: 'Pastor Williams',
    date: '2026-02-18',
    startTime: '07:30',
    endTime: '09:30',
    attendanceEstimate: 450,
    status: 'scheduled',
    checklistRequired: true,
    riskFlags: [],
  },
  {
    id: 'bk-002',
    spaceId: 'sp-001',
    spaceName: 'Main Sanctuary',
    title: 'Sunday Morning Service — 10:30 AM',
    ministry: 'Pastoral',
    owner: 'Pastor Williams',
    date: '2026-02-18',
    startTime: '10:00',
    endTime: '12:30',
    attendanceEstimate: 900,
    status: 'scheduled',
    checklistRequired: true,
    riskFlags: ['high_attendance'],
  },
  {
    id: 'bk-003',
    spaceId: 'sp-001',
    spaceName: 'Main Sanctuary',
    title: 'Sunday Evening Service — 6:00 PM',
    ministry: 'Pastoral',
    owner: 'Pastor Williams',
    date: '2026-02-18',
    startTime: '17:30',
    endTime: '20:00',
    attendanceEstimate: 350,
    status: 'scheduled',
    checklistRequired: true,
    riskFlags: [],
  },
  {
    id: 'bk-004',
    spaceId: 'sp-004',
    spaceName: 'Youth Room',
    title: 'Wednesday Youth Group',
    ministry: 'Youth',
    owner: 'Youth Pastor Davis',
    date: '2026-02-20',
    startTime: '18:30',
    endTime: '20:30',
    attendanceEstimate: 80,
    status: 'approved',
    checklistRequired: false,
    riskFlags: [],
  },
  {
    id: 'bk-005',
    spaceId: 'sp-006',
    spaceName: 'Classroom A',
    title: 'Tuesday Bible Study — Acts Series',
    ministry: 'Adult Education',
    owner: 'Elder Thompson',
    date: '2026-02-19',
    startTime: '19:00',
    endTime: '20:30',
    attendanceEstimate: 25,
    status: 'approved',
    checklistRequired: false,
    riskFlags: [],
  },
  {
    id: 'bk-006',
    spaceId: 'sp-001',
    spaceName: 'Main Sanctuary',
    title: 'Thursday Choir Rehearsal',
    ministry: 'Worship',
    owner: 'Worship Director Chen',
    date: '2026-02-20',
    startTime: '19:00',
    endTime: '21:00',
    attendanceEstimate: 45,
    status: 'approved',
    checklistRequired: false,
    riskFlags: [],
  },
  {
    id: 'bk-007',
    spaceId: 'sp-005',
    spaceName: 'Nursery',
    title: 'Sunday Nursery Coverage — AM',
    ministry: 'Children',
    owner: "Children's Pastor Green",
    date: '2026-02-18',
    startTime: '07:30',
    endTime: '12:30',
    attendanceEstimate: 20,
    status: 'scheduled',
    checklistRequired: true,
    riskFlags: ['background_check_required'],
  },
  {
    id: 'bk-008',
    spaceId: 'sp-005',
    spaceName: 'Nursery',
    title: 'Sunday Nursery Coverage — PM',
    ministry: 'Children',
    owner: "Children's Pastor Green",
    date: '2026-02-18',
    startTime: '17:00',
    endTime: '20:00',
    attendanceEstimate: 12,
    status: 'scheduled',
    checklistRequired: true,
    riskFlags: ['background_check_required'],
  },
  {
    id: 'bk-009',
    spaceId: 'sp-007',
    spaceName: 'Classroom B',
    title: 'Sunday School — Elementary',
    ministry: 'Children',
    owner: "Children's Pastor Green",
    date: '2026-02-18',
    startTime: '10:00',
    endTime: '11:30',
    attendanceEstimate: 18,
    status: 'scheduled',
    checklistRequired: false,
    riskFlags: [],
  },
  {
    id: 'bk-010',
    spaceId: 'sp-009',
    spaceName: 'Administrative Offices',
    title: 'Pastoral Counseling Session',
    ministry: 'Pastoral',
    owner: 'Pastor Williams',
    date: '2026-02-19',
    startTime: '14:00',
    endTime: '15:00',
    attendanceEstimate: 3,
    status: 'approved',
    checklistRequired: false,
    riskFlags: ['confidential'],
  },
  {
    id: 'bk-011',
    spaceId: 'sp-002',
    spaceName: 'Chapel',
    title: "Women's Prayer Group",
    ministry: "Women's Ministry",
    owner: 'Sister Martha',
    date: '2026-02-20',
    startTime: '06:30',
    endTime: '07:30',
    attendanceEstimate: 15,
    status: 'approved',
    checklistRequired: false,
    riskFlags: [],
  },
  {
    id: 'bk-012',
    spaceId: 'sp-003',
    spaceName: 'Fellowship Hall',
    title: 'Community Food Drive — Setup & Distribution',
    ministry: 'Outreach',
    owner: 'Deacon James',
    date: '2026-02-22',
    startTime: '08:00',
    endTime: '14:00',
    attendanceEstimate: 120,
    status: 'approved',
    checklistRequired: true,
    riskFlags: ['external_visitors', 'food_handling'],
  },
];

// =============================================================================
// SEEDED REQUESTS (6)
// =============================================================================

const REQUESTS: FacilityRequest[] = [
  {
    id: 'req-001',
    type: 'booking',
    spaceId: 'sp-003',
    spaceName: 'Fellowship Hall',
    requester: 'Deacon James',
    ministry: 'Outreach',
    description: 'Reserve Fellowship Hall for quarterly community potluck dinner on March 15th, 5-8 PM. Expecting ~200 guests.',
    dateRequested: '2026-02-14',
    status: 'under_review',
    approvals: ['Facilities Manager'],
    notes: 'Kitchen access also needed for catering prep.',
  },
  {
    id: 'req-002',
    type: 'setup',
    spaceId: 'sp-001',
    spaceName: 'Main Sanctuary',
    requester: 'Worship Director Chen',
    ministry: 'Worship',
    description: 'Reconfigure stage for Easter cantata. Need orchestra pit extension, additional monitor wedges, and choir risers moved to center.',
    dateRequested: '2026-02-16',
    status: 'new',
    approvals: [],
  },
  {
    id: 'req-003',
    type: 'keys_access',
    requester: 'Youth Pastor Davis',
    ministry: 'Youth',
    description: 'Request key card access for 3 new youth volunteer leaders: Maria Santos, David Kim, and Priya Patel. Background checks cleared.',
    dateRequested: '2026-02-17',
    status: 'approved',
    approvals: ['Facilities Manager', 'HR Director'],
  },
  {
    id: 'req-004',
    type: 'special_event',
    spaceId: 'sp-010',
    spaceName: 'Prayer Garden',
    requester: 'Pastor Williams',
    ministry: 'Pastoral',
    description: 'Outdoor sunrise Easter service in Prayer Garden. Need portable stage, sound system, 300 folding chairs, and parking overflow plan.',
    dateRequested: '2026-02-10',
    status: 'approved',
    approvals: ['Facilities Manager', 'Safety Officer', 'Senior Pastor'],
    notes: 'Rain backup: Main Sanctuary. Permit filed with city.',
  },
  {
    id: 'req-005',
    type: 'repair',
    spaceId: 'sp-008',
    spaceName: 'Commercial Kitchen',
    requester: 'Deacon James',
    ministry: 'Outreach',
    description: 'Walk-in cooler compressor failed. Food pantry distribution at risk. Vendor quote received from HVAC Pro Services.',
    dateRequested: '2026-02-12',
    status: 'scheduled',
    approvals: ['Facilities Manager', 'Finance Director'],
    notes: 'Emergency authorization granted. Parts on order, ETA 3 days.',
  },
  {
    id: 'req-006',
    type: 'after_hours',
    spaceId: 'sp-004',
    spaceName: 'Youth Room',
    requester: 'Youth Pastor Davis',
    ministry: 'Youth',
    description: 'After-hours access for youth lock-in event on Feb 28th, 7 PM to 7 AM. Need security on-site and snack bar open.',
    dateRequested: '2026-02-15',
    status: 'under_review',
    approvals: ['Facilities Manager'],
    notes: 'Waiting on SafetyOfficer sign-off for overnight occupancy.',
  },
];

// =============================================================================
// SEEDED WORK ORDERS (8)
// =============================================================================

const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-001',
    title: 'HVAC Unit 3 — Main Sanctuary Not Cooling',
    category: 'hvac',
    severity: 'critical',
    spaceId: 'sp-001',
    spaceName: 'Main Sanctuary',
    owner: 'Facilities Manager',
    vendorAssigned: 'HVAC Pro Services',
    slaTargetDate: '2026-02-19',
    status: 'in_progress',
    evidence: ['photo_hvac_unit_3.jpg', 'temp_log_feb16.csv'],
    impactTags: ['sunday_service', 'comfort', 'health'],
    description: 'HVAC unit 3 serving the main sanctuary stopped cooling. Thermostat reads 78F with set point at 68F. Worship services impacted.',
    createdDate: '2026-02-16',
  },
  {
    id: 'wo-002',
    title: 'Stage Left Speaker — Intermittent Static',
    category: 'av',
    severity: 'high',
    spaceId: 'sp-001',
    spaceName: 'Main Sanctuary',
    owner: 'Tech Team Lead',
    vendorAssigned: 'AV Solutions Inc',
    slaTargetDate: '2026-02-20',
    status: 'assigned',
    evidence: ['audio_recording_static.mp3'],
    impactTags: ['sunday_service', 'worship_quality'],
    description: 'Stage left speaker in the line array producing intermittent static during worship. Possible cable fault or amplifier issue.',
    createdDate: '2026-02-15',
  },
  {
    id: 'wo-003',
    title: 'Parking Lot Handicap Space Repaint',
    category: 'general',
    severity: 'normal',
    spaceId: 'sp-010',
    spaceName: 'Prayer Garden',
    owner: 'Facilities Manager',
    slaTargetDate: '2026-03-15',
    status: 'new',
    evidence: ['photo_faded_markings.jpg'],
    impactTags: ['ada_compliance', 'safety'],
    description: 'Handicap parking space markings in the north lot are faded and no longer meet ADA visibility standards. Repaint needed.',
    createdDate: '2026-02-08',
  },
  {
    id: 'wo-004',
    title: 'Smart Board Calibration — Classroom A',
    category: 'av',
    severity: 'normal',
    spaceId: 'sp-006',
    spaceName: 'Classroom A',
    owner: 'Tech Team Lead',
    slaTargetDate: '2026-02-15',
    status: 'completed',
    evidence: [],
    impactTags: ['education'],
    description: 'Smart board touch calibration off after power surge. Recalibrated and firmware updated.',
    createdDate: '2026-02-05',
  },
  {
    id: 'wo-005',
    title: 'Prayer Garden Fountain Pump Replacement',
    category: 'plumbing',
    severity: 'low',
    spaceId: 'sp-010',
    spaceName: 'Prayer Garden',
    owner: 'Grounds Keeper',
    slaTargetDate: '2026-03-10',
    status: 'new',
    evidence: ['photo_fountain_dry.jpg'],
    impactTags: ['aesthetics'],
    description: 'Fountain pump seized up over winter. Need replacement pump before spring season. Current pump model discontinued; sourcing compatible replacement.',
    createdDate: '2026-02-14',
  },
  {
    id: 'wo-006',
    title: 'Walk-In Cooler Compressor Failure',
    category: 'hvac',
    severity: 'critical',
    spaceId: 'sp-008',
    spaceName: 'Commercial Kitchen',
    owner: 'Facilities Manager',
    vendorAssigned: 'HVAC Pro Services',
    slaTargetDate: '2026-02-18',
    status: 'waiting',
    evidence: ['photo_compressor.jpg', 'vendor_quote_hvac_pro.pdf'],
    impactTags: ['food_safety', 'food_pantry', 'health'],
    description: 'Walk-in cooler compressor failed. Internal temp rising. Food pantry inventory at risk. Emergency vendor dispatch; parts on order.',
    createdDate: '2026-02-12',
  },
  {
    id: 'wo-007',
    title: 'Fellowship Hall Lighting — Ballast Replacement',
    category: 'electrical',
    severity: 'normal',
    spaceId: 'sp-003',
    spaceName: 'Fellowship Hall',
    owner: 'Facilities Manager',
    slaTargetDate: '2026-03-01',
    status: 'new',
    evidence: [],
    impactTags: ['safety', 'event_quality'],
    description: 'Three fluorescent fixtures in the Fellowship Hall have failing ballasts causing flickering. Replace ballasts or upgrade to LED panels.',
    createdDate: '2026-02-13',
  },
  {
    id: 'wo-008',
    title: 'Security Camera Check — Education Wing',
    category: 'security',
    severity: 'normal',
    spaceId: 'sp-006',
    spaceName: 'Classroom A',
    owner: 'Safety Officer',
    vendorAssigned: 'SecureTech Systems',
    slaTargetDate: '2026-02-25',
    status: 'assigned',
    evidence: [],
    impactTags: ['child_safety', 'security'],
    description: 'Quarterly check of security cameras in the Education Wing. Camera 7 showing intermittent feed loss. Vendor to inspect cabling and NVR.',
    createdDate: '2026-02-10',
  },
];

// =============================================================================
// SEEDED VENDORS (5)
// =============================================================================

const VENDORS: FacilityVendor[] = [
  {
    id: 'vnd-001',
    name: 'HVAC Pro Services',
    category: 'HVAC & Mechanical',
    contractStatus: 'active',
    slaSummary: '4-hour response for critical, 24-hour for standard. Annual maintenance contract.',
    lastInvoiceDate: '2026-02-12',
    lastInvoiceAmount: 4200,
    openWorkOrders: 2,
    insuranceCoi: true,
    contactName: 'Mike Reynolds',
    contactPhone: '(555) 234-5678',
  },
  {
    id: 'vnd-002',
    name: 'AV Solutions Inc',
    category: 'Audio/Visual & Technology',
    contractStatus: 'active',
    slaSummary: 'Same-day response for worship-critical issues. Quarterly preventive maintenance.',
    lastInvoiceDate: '2026-01-28',
    lastInvoiceAmount: 1850,
    openWorkOrders: 1,
    insuranceCoi: true,
    contactName: 'Sarah Lin',
    contactPhone: '(555) 345-6789',
  },
  {
    id: 'vnd-003',
    name: 'CleanRight Janitorial',
    category: 'Cleaning & Sanitation',
    contractStatus: 'active',
    slaSummary: 'Daily cleaning M-F, deep clean Saturdays. Event cleanup on request.',
    lastInvoiceDate: '2026-02-01',
    lastInvoiceAmount: 3600,
    openWorkOrders: 0,
    insuranceCoi: true,
    contactName: 'Rosa Martinez',
    contactPhone: '(555) 456-7890',
  },
  {
    id: 'vnd-004',
    name: 'SecureTech Systems',
    category: 'Security & Access Control',
    contractStatus: 'expiring',
    slaSummary: '2-hour response for security emergencies. Contract renewal due March 2026.',
    lastInvoiceDate: '2026-01-15',
    lastInvoiceAmount: 2100,
    openWorkOrders: 1,
    insuranceCoi: true,
    contactName: 'James Cooper',
    contactPhone: '(555) 567-8901',
  },
  {
    id: 'vnd-005',
    name: 'GreenScape Landscaping',
    category: 'Grounds & Landscaping',
    contractStatus: 'active',
    slaSummary: 'Weekly mowing (seasonal), monthly garden maintenance, snow removal on-call.',
    lastInvoiceDate: '2026-02-05',
    lastInvoiceAmount: 1400,
    openWorkOrders: 0,
    insuranceCoi: true,
    contactName: 'Tom Nguyen',
    contactPhone: '(555) 678-9012',
  },
];

// =============================================================================
// SEEDED INSPECTIONS (6)
// =============================================================================

const INSPECTIONS: SafetyInspection[] = [
  {
    id: 'insp-001',
    spaceId: 'sp-001',
    spaceName: 'Main Sanctuary',
    type: 'fire_safety',
    scheduledDate: '2026-03-05',
    inspector: 'City Fire Marshal',
    status: 'scheduled',
  },
  {
    id: 'insp-002',
    spaceId: 'sp-009',
    spaceName: 'Administrative Offices',
    type: 'electrical',
    scheduledDate: '2026-02-10',
    inspector: 'Licensed Electrician — PowerSafe Co.',
    status: 'passed',
    findings: 'All panels, outlets, and emergency lighting within code. No issues found.',
  },
  {
    id: 'insp-003',
    spaceId: 'sp-004',
    spaceName: 'Youth Room',
    type: 'building_code',
    scheduledDate: '2026-03-12',
    inspector: 'City Building Inspector',
    status: 'scheduled',
  },
  {
    id: 'insp-004',
    spaceId: 'sp-008',
    spaceName: 'Commercial Kitchen',
    type: 'food_safety',
    scheduledDate: '2026-02-25',
    inspector: 'County Health Department',
    status: 'scheduled',
    findings: 'Pending cooler repair completion before inspection.',
  },
  {
    id: 'insp-005',
    spaceId: 'sp-006',
    spaceName: 'Classroom A',
    type: 'security',
    scheduledDate: '2026-02-05',
    inspector: 'SecureTech Systems',
    status: 'passed',
    findings: 'All cameras operational. Badge readers functioning. Panic buttons tested OK.',
  },
  {
    id: 'insp-006',
    spaceId: 'sp-010',
    spaceName: 'Prayer Garden',
    type: 'playground',
    scheduledDate: '2026-01-15',
    inspector: 'Playground Safety Consultant',
    status: 'overdue',
    findings: 'Inspection was scheduled for Jan 15 but postponed due to weather. Needs rescheduling.',
  },
];

// =============================================================================
// SEEDED ASSETS (8)
// =============================================================================

const ASSETS: FacilityAsset[] = [
  {
    id: 'ast-001',
    name: 'Main Projector System — Epson Pro L30000U',
    category: 'av_gear',
    location: 'Main Sanctuary — AV Booth',
    condition: 'good',
    custodian: 'Tech Team Lead',
    replacementValueBand: '$15K-$25K',
    checkoutHistory: [],
  },
  {
    id: 'ast-002',
    name: 'PA System — QSC Line Array + Subs',
    category: 'av_gear',
    location: 'Main Sanctuary — Rigging',
    condition: 'excellent',
    custodian: 'Tech Team Lead',
    replacementValueBand: '$25K-$50K',
    checkoutHistory: [],
  },
  {
    id: 'ast-003',
    name: 'Folding Chairs Set (300 units)',
    category: 'furniture',
    location: 'Storage Room B-4',
    condition: 'fair',
    custodian: 'Facilities Manager',
    replacementValueBand: '$5K-$10K',
    checkoutHistory: ['2026-02-10 — Easter planning setup test', '2026-01-20 — Community outreach event'],
  },
  {
    id: 'ast-004',
    name: 'Communion Table — Handcrafted Oak',
    category: 'furniture',
    location: 'Chapel',
    condition: 'excellent',
    custodian: 'Pastoral Staff',
    replacementValueBand: '$2K-$5K',
    checkoutHistory: [],
  },
  {
    id: 'ast-005',
    name: 'Security Camera System — 24 Channel NVR',
    category: 'keys_access',
    location: 'Server Room — Admin Building',
    condition: 'good',
    custodian: 'Safety Officer',
    replacementValueBand: '$10K-$15K',
    checkoutHistory: [],
  },
  {
    id: 'ast-006',
    name: 'Key Card Access System — 12 Door Controllers',
    category: 'keys_access',
    location: 'Server Room — Admin Building',
    condition: 'good',
    custodian: 'Safety Officer',
    replacementValueBand: '$8K-$12K',
    checkoutHistory: ['2026-02-17 — 3 new youth volunteer cards provisioned'],
  },
  {
    id: 'ast-007',
    name: 'Church Van — 2022 Ford Transit 15-Passenger',
    category: 'vehicle',
    location: 'North Parking Lot — Space V-1',
    condition: 'good',
    custodian: 'Facilities Manager',
    replacementValueBand: '$35K-$45K',
    checkoutHistory: ['2026-02-16 — Youth retreat transport', '2026-02-09 — Senior ministry hospital visits'],
  },
  {
    id: 'ast-008',
    name: 'Riding Lawn Mower — John Deere X350',
    category: 'maintenance_equipment',
    location: 'Grounds Shed G-1',
    condition: 'fair',
    custodian: 'Grounds Keeper',
    replacementValueBand: '$3K-$5K',
    checkoutHistory: [],
  },
];

// =============================================================================
// SEEDED CAPITAL PROJECTS (2)
// =============================================================================

const CAPITAL_PROJECTS: CapitalProject[] = [
  {
    id: 'cp-001',
    name: 'Sanctuary AV Upgrade',
    budgetBand: '$45K',
    timeline: 'Q1-Q2 2026',
    vendors: ['AV Solutions Inc'],
    status: 'in_progress',
    dependencies: ['Electrical panel upgrade in AV booth', 'Rigging inspection for new line array weight'],
    approvalLog: [
      { approver: 'Finance Committee', date: '2025-11-15' },
      { approver: 'Board of Elders', date: '2025-12-01' },
      { approver: 'Senior Pastor', date: '2025-12-05' },
    ],
  },
  {
    id: 'cp-002',
    name: 'Parking Lot Resurfacing',
    budgetBand: '$28K',
    timeline: 'Q2 2026',
    vendors: [],
    status: 'planning',
    dependencies: ['City permit approval', 'Vendor bid selection (3 bids requested)'],
    approvalLog: [
      { approver: 'Finance Committee', date: '2026-01-20' },
    ],
  },
];

// =============================================================================
// SEEDED REPORTS (5)
// =============================================================================

const REPORTS: FacilityReport[] = [
  {
    id: 'rpt-001',
    title: 'Facility Usage Report',
    description: 'Tracks booking frequency, occupancy rates, and peak usage times across all spaces.',
    lastGenerated: '2026-02-15',
    frequency: 'weekly',
    category: 'Utilization',
  },
  {
    id: 'rpt-002',
    title: 'Most Booked Rooms',
    description: 'Rankings of spaces by total bookings, average attendance, and utilization percentage.',
    lastGenerated: '2026-02-01',
    frequency: 'monthly',
    category: 'Utilization',
  },
  {
    id: 'rpt-003',
    title: 'Work Order Throughput',
    description: 'Open vs. closed work orders, average resolution time, SLA compliance rate by vendor.',
    lastGenerated: '2026-02-15',
    frequency: 'weekly',
    category: 'Maintenance',
  },
  {
    id: 'rpt-004',
    title: 'Facility Cost Centers',
    description: 'Vendor spend by category, capital project burn rate, and maintenance cost per square foot.',
    lastGenerated: '2026-02-01',
    frequency: 'monthly',
    category: 'Financial',
  },
  {
    id: 'rpt-005',
    title: 'Safety & Compliance Dashboard',
    description: 'Inspection pass/fail rates, overdue inspections, incident log, and insurance certificate status.',
    lastGenerated: '2026-01-31',
    frequency: 'quarterly',
    category: 'Safety',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchFacilitiesV2Data() {
  return {
    spaces: SPACES,
    bookings: BOOKINGS,
    requests: REQUESTS,
    workOrders: WORK_ORDERS,
    vendors: VENDORS,
    inspections: INSPECTIONS,
    assets: ASSETS,
    capitalProjects: CAPITAL_PROJECTS,
    reports: REPORTS,
    overviewTiles: {
      openWorkOrders: 6,
      criticalIssues: 2,
      upcomingInspections: 4,
      todayBookings: 8,
      conflicts: 1,
      vendorSlaBreaches: 0,
    },
  };
}

export function getSpaceById(id: string): FacilitySpace | undefined {
  return SPACES.find((s) => s.id === id);
}
