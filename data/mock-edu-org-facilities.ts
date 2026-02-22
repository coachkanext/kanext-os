/**
 * Education Organization Facilities — Mock Data
 * Campus buildings, classrooms, labs, bookings, and maintenance.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface EduFacility {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'library' | 'admin' | 'athletic' | 'dining' | 'residence' | 'student_center' | 'auditorium';
  building: string;
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance' | 'reserved';
  equipment: string[];
  accessibility: boolean;
  floor: number;
}

export interface RoomBooking {
  id: string;
  facilityId: string;
  bookedBy: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface MaintenanceRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  issue: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  reportedBy: string;
  reportedDate: string;
  estimatedCompletion: string;
}

export interface FacilitiesOverview {
  totalRooms: number;
  availableNow: number;
  bookedToday: number;
  underMaintenance: number;
  totalBuildings: number;
  accessibleRooms: number;
  avgOccupancy: number;
}

export type EduFacilitiesTabId =
  | 'overview'
  | 'directory'
  | 'availability'
  | 'bookings'
  | 'maintenance'
  | 'accessibility';

export interface EduFacilitiesTab {
  id: EduFacilitiesTabId;
  label: string;
  icon: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const EDU_FACILITIES_TABS: EduFacilitiesTab[] = [
  { id: 'overview', label: 'Overview', icon: 'chart.bar.fill' },
  { id: 'directory', label: 'Directory', icon: 'building.2.fill' },
  { id: 'availability', label: 'Availability', icon: 'clock.fill' },
  { id: 'bookings', label: 'Bookings', icon: 'calendar' },
  { id: 'maintenance', label: 'Maintenance', icon: 'wrench.and.screwdriver.fill' },
  { id: 'accessibility', label: 'Accessibility', icon: 'figure.roll' },
];

export const EDU_FACILITIES_SCOPE_CHIPS = [
  'All Buildings',
  'Classrooms',
  'Labs',
  'Athletic',
  'Admin',
  'Residence',
];

// =============================================================================
// STATUS COLOR MAPS
// =============================================================================

export const FACILITY_STATUS_COLOR: Record<EduFacility['status'], string> = {
  available: '#22C55E',
  in_use: '#3B82F6',
  maintenance: '#EF4444',
  reserved: '#F59E0B',
};

export const FACILITY_STATUS_LABEL: Record<EduFacility['status'], string> = {
  available: 'AVAILABLE',
  in_use: 'IN USE',
  maintenance: 'MAINTENANCE',
  reserved: 'RESERVED',
};

export const FACILITY_TYPE_COLOR: Record<EduFacility['type'], string> = {
  classroom: '#3B82F6',
  lab: '#8B5CF6',
  library: '#22C55E',
  admin: '#6B7280',
  athletic: '#EF4444',
  dining: '#F59E0B',
  residence: '#14B8A6',
  student_center: '#EC4899',
  auditorium: '#F97316',
};

export const FACILITY_TYPE_LABEL: Record<EduFacility['type'], string> = {
  classroom: 'CLASSROOM',
  lab: 'LAB',
  library: 'LIBRARY',
  admin: 'ADMIN',
  athletic: 'ATHLETIC',
  dining: 'DINING',
  residence: 'RESIDENCE',
  student_center: 'STUDENT CTR',
  auditorium: 'AUDITORIUM',
};

export const BOOKING_STATUS_COLOR: Record<RoomBooking['status'], string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  cancelled: '#EF4444',
};

export const MAINTENANCE_PRIORITY_COLOR: Record<MaintenanceRequest['priority'], string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#9CA3AF',
};

export const MAINTENANCE_STATUS_COLOR: Record<MaintenanceRequest['status'], string> = {
  open: '#EF4444',
  in_progress: '#F59E0B',
  resolved: '#22C55E',
};

// =============================================================================
// MOCK DATA
// =============================================================================

export function getEduFacilitiesData(_scope: string) {
  const overview: FacilitiesOverview = {
    totalRooms: 142,
    availableNow: 67,
    bookedToday: 58,
    underMaintenance: 4,
    totalBuildings: 12,
    accessibleRooms: 128,
    avgOccupancy: 72,
  };

  const facilities: EduFacility[] = [
    {
      id: 'fac-1', name: 'Lecture Hall A', type: 'classroom', building: 'Thornton Hall',
      capacity: 250, status: 'in_use', equipment: ['Projector', 'Microphone', 'Whiteboard', 'Lecture Capture'],
      accessibility: true, floor: 1,
    },
    {
      id: 'fac-2', name: 'Chemistry Lab 201', type: 'lab', building: 'Science Center',
      capacity: 30, status: 'available', equipment: ['Fume Hoods', 'Safety Showers', 'Lab Benches', 'Gas Lines'],
      accessibility: true, floor: 2,
    },
    {
      id: 'fac-3', name: 'Main Library Reading Room', type: 'library', building: 'Patterson Library',
      capacity: 200, status: 'in_use', equipment: ['Study Carrels', 'Power Outlets', 'WiFi', 'Quiet Zone'],
      accessibility: true, floor: 1,
    },
    {
      id: 'fac-4', name: 'Computer Science Lab', type: 'lab', building: 'Engineering Building',
      capacity: 40, status: 'in_use', equipment: ['Workstations', 'Dual Monitors', 'Whiteboard', 'Server Access'],
      accessibility: true, floor: 3,
    },
    {
      id: 'fac-5', name: 'Seminar Room 104', type: 'classroom', building: 'Liberal Arts Center',
      capacity: 35, status: 'available', equipment: ['Smart Board', 'Video Conferencing', 'Roundtable Setup'],
      accessibility: true, floor: 1,
    },
    {
      id: 'fac-6', name: 'Gymnasium', type: 'athletic', building: 'Recreation Center',
      capacity: 500, status: 'reserved', equipment: ['Basketball Courts', 'Bleachers', 'Scoreboard', 'PA System'],
      accessibility: true, floor: 1,
    },
    {
      id: 'fac-7', name: 'President\'s Boardroom', type: 'admin', building: 'Administration Building',
      capacity: 20, status: 'reserved', equipment: ['Conference Table', 'Video Wall', 'Teleconferencing'],
      accessibility: true, floor: 3,
    },
    {
      id: 'fac-8', name: 'Biology Research Lab', type: 'lab', building: 'Science Center',
      capacity: 24, status: 'maintenance', equipment: ['Microscopes', 'Centrifuge', 'Clean Room', 'Freezers'],
      accessibility: false, floor: 4,
    },
    {
      id: 'fac-9', name: 'Student Union Hall', type: 'student_center', building: 'Student Union',
      capacity: 300, status: 'available', equipment: ['Stage', 'Sound System', 'Lighting Rig', 'Folding Chairs'],
      accessibility: true, floor: 1,
    },
    {
      id: 'fac-10', name: 'Main Dining Hall', type: 'dining', building: 'Commons Building',
      capacity: 450, status: 'in_use', equipment: ['Serving Lines', 'Seating Areas', 'Beverage Stations'],
      accessibility: true, floor: 1,
    },
    {
      id: 'fac-11', name: 'Auditorium', type: 'auditorium', building: 'Performing Arts Center',
      capacity: 800, status: 'available', equipment: ['Stage', 'Orchestra Pit', 'Fly System', 'Sound Booth', 'Follow Spots'],
      accessibility: true, floor: 1,
    },
    {
      id: 'fac-12', name: 'Residence Hall Study Room', type: 'residence', building: 'Oakwood Hall',
      capacity: 15, status: 'maintenance', equipment: ['Whiteboard', 'Power Outlets', 'WiFi'],
      accessibility: false, floor: 2,
    },
  ];

  const bookings: RoomBooking[] = [
    {
      id: 'bk-1', facilityId: 'fac-1', bookedBy: 'Dr. Mia Torres', department: 'Biology',
      date: 'Feb 18, 2026', startTime: '9:00 AM', endTime: '10:30 AM',
      purpose: 'BIO 201 — Cellular Biology Lecture', status: 'confirmed',
    },
    {
      id: 'bk-2', facilityId: 'fac-4', bookedBy: 'Prof. James Chen', department: 'Computer Science',
      date: 'Feb 18, 2026', startTime: '1:00 PM', endTime: '3:00 PM',
      purpose: 'CS 301 — Data Structures Lab Session', status: 'confirmed',
    },
    {
      id: 'bk-3', facilityId: 'fac-6', bookedBy: 'Coach Williams', department: 'Athletics',
      date: 'Feb 19, 2026', startTime: '4:00 PM', endTime: '7:00 PM',
      purpose: 'Varsity Basketball — Practice', status: 'confirmed',
    },
    {
      id: 'bk-4', facilityId: 'fac-7', bookedBy: 'President Thompson', department: 'Administration',
      date: 'Feb 20, 2026', startTime: '10:00 AM', endTime: '12:00 PM',
      purpose: 'Board of Trustees — Quarterly Meeting', status: 'confirmed',
    },
    {
      id: 'bk-5', facilityId: 'fac-9', bookedBy: 'Student Government', department: 'Student Affairs',
      date: 'Feb 21, 2026', startTime: '6:00 PM', endTime: '9:00 PM',
      purpose: 'Spring Formal Planning Committee', status: 'pending',
    },
    {
      id: 'bk-6', facilityId: 'fac-11', bookedBy: 'Dr. Maria Lopez', department: 'Music',
      date: 'Feb 22, 2026', startTime: '7:00 PM', endTime: '10:00 PM',
      purpose: 'Spring Concert — Dress Rehearsal', status: 'confirmed',
    },
    {
      id: 'bk-7', facilityId: 'fac-5', bookedBy: 'Prof. David Park', department: 'Philosophy',
      date: 'Feb 18, 2026', startTime: '2:00 PM', endTime: '3:30 PM',
      purpose: 'PHIL 410 — Ethics Seminar', status: 'confirmed',
    },
    {
      id: 'bk-8', facilityId: 'fac-2', bookedBy: 'Dr. Lisa Wang', department: 'Chemistry',
      date: 'Feb 19, 2026', startTime: '10:00 AM', endTime: '12:00 PM',
      purpose: 'CHEM 301 — Organic Chemistry Lab', status: 'cancelled',
    },
  ];

  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 'mr-1', facilityId: 'fac-8', facilityName: 'Biology Research Lab',
      issue: 'HVAC malfunction — temperature control failure in clean room',
      priority: 'critical', status: 'in_progress',
      reportedBy: 'Dr. Karen Foster', reportedDate: 'Feb 15, 2026',
      estimatedCompletion: 'Feb 19, 2026',
    },
    {
      id: 'mr-2', facilityId: 'fac-12', facilityName: 'Residence Hall Study Room',
      issue: 'Ceiling leak from plumbing above — water damage to ceiling tiles',
      priority: 'high', status: 'in_progress',
      reportedBy: 'RA Marcus Johnson', reportedDate: 'Feb 16, 2026',
      estimatedCompletion: 'Feb 20, 2026',
    },
    {
      id: 'mr-3', facilityId: 'fac-1', facilityName: 'Lecture Hall A',
      issue: 'Projector bulb replacement needed — dimming during presentations',
      priority: 'medium', status: 'open',
      reportedBy: 'Prof. Alan Rivera', reportedDate: 'Feb 17, 2026',
      estimatedCompletion: 'Feb 21, 2026',
    },
    {
      id: 'mr-4', facilityId: 'fac-10', facilityName: 'Main Dining Hall',
      issue: 'Beverage station #3 refrigeration unit not cooling properly',
      priority: 'medium', status: 'open',
      reportedBy: 'Dining Services Staff', reportedDate: 'Feb 17, 2026',
      estimatedCompletion: 'Feb 22, 2026',
    },
    {
      id: 'mr-5', facilityId: 'fac-6', facilityName: 'Gymnasium',
      issue: 'Floor board warping near east entrance — safety concern',
      priority: 'high', status: 'open',
      reportedBy: 'Coach Williams', reportedDate: 'Feb 18, 2026',
      estimatedCompletion: 'Feb 25, 2026',
    },
    {
      id: 'mr-6', facilityId: 'fac-4', facilityName: 'Computer Science Lab',
      issue: 'Workstation #12 and #15 — monitor flickering and power issues',
      priority: 'low', status: 'resolved',
      reportedBy: 'IT Help Desk', reportedDate: 'Feb 10, 2026',
      estimatedCompletion: 'Feb 14, 2026',
    },
  ];

  return {
    overview,
    facilities,
    bookings,
    maintenanceRequests,
  };
}
