/**
 * Church Organization Facilities — Mock Data & Types
 * Physical spaces, property management, maintenance requests, inspections.
 */

// =============================================================================
// TYPES
// =============================================================================

export type FacilityType =
  | 'sanctuary'
  | 'fellowship_hall'
  | 'classroom'
  | 'office'
  | 'gym'
  | 'kitchen'
  | 'parking'
  | 'outdoor';

export type FacilityStatus = 'available' | 'in_use' | 'maintenance' | 'reserved';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'open' | 'in_progress' | 'completed';

export interface ChurchFacility {
  id: string;
  name: string;
  type: FacilityType;
  campus: string;
  capacity: number;
  status: FacilityStatus;
  lastInspection: string;
  nextMaintenance: string;
  amenities: string[];
}

export interface MaintenanceRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  requestedBy: string;
  requestedDate: string;
}

export interface UpcomingInspection {
  id: string;
  facilityId: string;
  facilityName: string;
  type: string;
  scheduledDate: string;
  inspector: string;
}

export interface ReservationPreview {
  id: string;
  facilityId: string;
  facilityName: string;
  event: string;
  date: string;
  time: string;
  reservedBy: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  sanctuary: 'Sanctuary',
  fellowship_hall: 'Fellowship Hall',
  classroom: 'Classroom',
  office: 'Office',
  gym: 'Gymnasium',
  kitchen: 'Kitchen',
  parking: 'Parking',
  outdoor: 'Outdoor',
};

export const FACILITY_TYPE_ICONS: Record<FacilityType, string> = {
  sanctuary: 'building.columns.fill',
  fellowship_hall: 'person.3.fill',
  classroom: 'book.fill',
  office: 'briefcase.fill',
  gym: 'figure.run',
  kitchen: 'fork.knife',
  parking: 'car.fill',
  outdoor: 'leaf.fill',
};

export const FACILITY_TYPE_COLORS: Record<FacilityType, string> = {
  sanctuary: '#1D9BF0',
  fellowship_hall: '#1D9BF0',
  classroom: '#22C55E',
  office: '#F59E0B',
  gym: '#EF4444',
  kitchen: '#1D9BF0',
  parking: '#A1A1AA',
  outdoor: '#22C55E',
};

export const FACILITY_STATUS_COLOR: Record<FacilityStatus, string> = {
  available: '#22C55E',
  in_use: '#1D9BF0',
  maintenance: '#F59E0B',
  reserved: '#1D9BF0',
};

export const FACILITY_STATUS_LABELS: Record<FacilityStatus, string> = {
  available: 'Available',
  in_use: 'In Use',
  maintenance: 'Maintenance',
  reserved: 'Reserved',
};

export const PRIORITY_COLOR: Record<MaintenancePriority, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
  urgent: '#EF4444',
};

export const MAINTENANCE_STATUS_COLOR: Record<MaintenanceStatus, string> = {
  open: '#F59E0B',
  in_progress: '#1D9BF0',
  completed: '#22C55E',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
};

// =============================================================================
// SEEDED FACILITIES
// =============================================================================

const FACILITIES: ChurchFacility[] = [
  {
    id: 'fac-001',
    name: 'Main Sanctuary',
    type: 'sanctuary',
    campus: 'Main Campus',
    capacity: 1200,
    status: 'available',
    lastInspection: '2026-01-15',
    nextMaintenance: '2026-03-01',
    amenities: ['Sound System', 'Projectors', 'Live Streaming', 'Overflow Seating', 'Balcony'],
  },
  {
    id: 'fac-002',
    name: 'Chapel',
    type: 'sanctuary',
    campus: 'Main Campus',
    capacity: 150,
    status: 'reserved',
    lastInspection: '2026-01-15',
    nextMaintenance: '2026-04-01',
    amenities: ['Piano', 'Basic Sound', 'Communion Table'],
  },
  {
    id: 'fac-003',
    name: 'Grace Fellowship Hall',
    type: 'fellowship_hall',
    campus: 'Main Campus',
    capacity: 350,
    status: 'in_use',
    lastInspection: '2025-12-10',
    nextMaintenance: '2026-02-28',
    amenities: ['Round Tables', 'Stage', 'Catering Prep', 'AV System'],
  },
  {
    id: 'fac-004',
    name: 'Youth Center',
    type: 'gym',
    campus: 'Main Campus',
    capacity: 200,
    status: 'available',
    lastInspection: '2026-01-20',
    nextMaintenance: '2026-05-15',
    amenities: ['Basketball Court', 'Lounge Area', 'Game Room', 'Snack Bar'],
  },
  {
    id: 'fac-005',
    name: 'Children\'s Wing — Room A',
    type: 'classroom',
    campus: 'Main Campus',
    capacity: 30,
    status: 'in_use',
    lastInspection: '2026-02-01',
    nextMaintenance: '2026-06-01',
    amenities: ['Smart Board', 'Child Safety Locks', 'Restroom Access'],
  },
  {
    id: 'fac-006',
    name: 'Children\'s Wing — Room B',
    type: 'classroom',
    campus: 'Main Campus',
    capacity: 25,
    status: 'available',
    lastInspection: '2026-02-01',
    nextMaintenance: '2026-06-01',
    amenities: ['Craft Tables', 'TV Monitor', 'Toy Storage'],
  },
  {
    id: 'fac-007',
    name: 'Commercial Kitchen',
    type: 'kitchen',
    campus: 'Main Campus',
    capacity: 15,
    status: 'maintenance',
    lastInspection: '2025-11-20',
    nextMaintenance: '2026-02-20',
    amenities: ['Walk-in Cooler', 'Industrial Ovens', 'Prep Stations', 'Dishwasher'],
  },
  {
    id: 'fac-008',
    name: 'Administrative Offices',
    type: 'office',
    campus: 'Main Campus',
    capacity: 20,
    status: 'in_use',
    lastInspection: '2026-01-10',
    nextMaintenance: '2026-07-01',
    amenities: ['Conference Room', 'Printer/Copier', 'Break Room', 'Wi-Fi'],
  },
  {
    id: 'fac-009',
    name: 'North Parking Lot',
    type: 'parking',
    campus: 'Main Campus',
    capacity: 250,
    status: 'available',
    lastInspection: '2025-12-01',
    nextMaintenance: '2026-04-15',
    amenities: ['Handicap Spaces', 'Security Cameras', 'Lighting'],
  },
  {
    id: 'fac-010',
    name: 'Prayer Garden',
    type: 'outdoor',
    campus: 'Main Campus',
    capacity: 40,
    status: 'available',
    lastInspection: '2026-01-25',
    nextMaintenance: '2026-03-15',
    amenities: ['Walking Path', 'Benches', 'Fountain', 'Lighting'],
  },
];

// =============================================================================
// MAINTENANCE REQUESTS
// =============================================================================

const MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'mnt-001',
    facilityId: 'fac-007',
    facilityName: 'Commercial Kitchen',
    description: 'Walk-in cooler temperature fluctuating. Compressor may need replacement.',
    priority: 'urgent',
    status: 'in_progress',
    requestedBy: 'Deacon James',
    requestedDate: '2026-02-12',
  },
  {
    id: 'mnt-002',
    facilityId: 'fac-003',
    facilityName: 'Grace Fellowship Hall',
    description: 'Stage left speaker producing intermittent static during services.',
    priority: 'high',
    status: 'open',
    requestedBy: 'Worship Director',
    requestedDate: '2026-02-15',
  },
  {
    id: 'mnt-003',
    facilityId: 'fac-001',
    facilityName: 'Main Sanctuary',
    description: 'Replace burned-out stage lighting fixtures in row 3.',
    priority: 'medium',
    status: 'open',
    requestedBy: 'Tech Team Lead',
    requestedDate: '2026-02-10',
  },
  {
    id: 'mnt-004',
    facilityId: 'fac-009',
    facilityName: 'North Parking Lot',
    description: 'Repaint faded handicap parking space markings.',
    priority: 'low',
    status: 'open',
    requestedBy: 'Facilities Manager',
    requestedDate: '2026-02-08',
  },
  {
    id: 'mnt-005',
    facilityId: 'fac-005',
    facilityName: 'Children\'s Wing — Room A',
    description: 'Smart board calibration off after power surge.',
    priority: 'medium',
    status: 'completed',
    requestedBy: 'Children\'s Pastor',
    requestedDate: '2026-02-05',
  },
  {
    id: 'mnt-006',
    facilityId: 'fac-010',
    facilityName: 'Prayer Garden',
    description: 'Fountain pump replacement needed before spring season.',
    priority: 'low',
    status: 'open',
    requestedBy: 'Grounds Keeper',
    requestedDate: '2026-02-14',
  },
];

// =============================================================================
// UPCOMING INSPECTIONS
// =============================================================================

const UPCOMING_INSPECTIONS: UpcomingInspection[] = [
  {
    id: 'insp-001',
    facilityId: 'fac-007',
    facilityName: 'Commercial Kitchen',
    type: 'Health Department',
    scheduledDate: '2026-02-25',
    inspector: 'County Health Dept.',
  },
  {
    id: 'insp-002',
    facilityId: 'fac-001',
    facilityName: 'Main Sanctuary',
    type: 'Fire Safety',
    scheduledDate: '2026-03-05',
    inspector: 'City Fire Marshal',
  },
  {
    id: 'insp-003',
    facilityId: 'fac-004',
    facilityName: 'Youth Center',
    type: 'Building Code',
    scheduledDate: '2026-03-12',
    inspector: 'City Building Inspector',
  },
  {
    id: 'insp-004',
    facilityId: 'fac-009',
    facilityName: 'North Parking Lot',
    type: 'ADA Compliance',
    scheduledDate: '2026-03-20',
    inspector: 'Accessibility Consultant',
  },
];

// =============================================================================
// RESERVATION PREVIEWS
// =============================================================================

const RESERVATIONS: ReservationPreview[] = [
  {
    id: 'res-001',
    facilityId: 'fac-003',
    facilityName: 'Grace Fellowship Hall',
    event: 'Women\'s Ministry Brunch',
    date: '2026-02-22',
    time: '10:00 AM - 1:00 PM',
    reservedBy: 'Sister Martha',
  },
  {
    id: 'res-002',
    facilityId: 'fac-002',
    facilityName: 'Chapel',
    event: 'Wedding Rehearsal — Johnson Family',
    date: '2026-02-21',
    time: '5:00 PM - 7:00 PM',
    reservedBy: 'Pastor Michael',
  },
  {
    id: 'res-003',
    facilityId: 'fac-004',
    facilityName: 'Youth Center',
    event: 'Youth Lock-In',
    date: '2026-02-28',
    time: '7:00 PM - 7:00 AM',
    reservedBy: 'Youth Pastor Davis',
  },
  {
    id: 'res-004',
    facilityId: 'fac-001',
    facilityName: 'Main Sanctuary',
    event: 'Community Gospel Concert',
    date: '2026-03-08',
    time: '6:00 PM - 9:00 PM',
    reservedBy: 'Worship Director',
  },
  {
    id: 'res-005',
    facilityId: 'fac-005',
    facilityName: 'Children\'s Wing — Room A',
    event: 'VBS Planning Meeting',
    date: '2026-02-23',
    time: '2:00 PM - 4:00 PM',
    reservedBy: 'Children\'s Pastor',
  },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export function getChurchFacilitiesData() {
  return {
    facilities: FACILITIES,
    maintenanceRequests: MAINTENANCE_REQUESTS,
    inspections: UPCOMING_INSPECTIONS,
    reservations: RESERVATIONS,
  };
}

export function getFacilityById(id: string): ChurchFacility | undefined {
  return FACILITIES.find((f) => f.id === id);
}
