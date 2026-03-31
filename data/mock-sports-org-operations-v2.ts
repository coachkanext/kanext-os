/**
 * Sports Organization Operations V2 — Mock Data & Types
 * 10-tab Operations Hub for Sports Mode organizations.
 * Seeded with Carroll College Fighting Saints Men's Basketball 2025-26 season data.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SportsOrgOpsSubTab =
  | 'overview'
  | 'calendar-ops'
  | 'travel'
  | 'facilities-ops'
  | 'equipment'
  | 'vendors'
  | 'player-services'
  | 'comms'
  | 'approvals'
  | 'settings';

export interface OpsSubTab {
  id: SportsOrgOpsSubTab;
  label: string;
  icon: string;
}

export interface OpsTask {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  dueDate: string;
  status: 'open' | 'in-progress' | 'blocked' | 'done';
  data_source?: string;
}

export interface TravelTrip {
  id: string;
  destination: string;
  departure: string;
  returnDate: string;
  teamSize: number;
  status: 'planning' | 'booked' | 'in-transit' | 'completed';
  missingDocs: number;
  budget: number;
  spent: number;
  departureTime?: string;
  busInfo?: string;
  hotel?: string;
  mealArrangements?: string;
  returnTime?: string;
  data_source?: string;
}

export interface FacilityBooking {
  id: string;
  facility: string;
  date: string;
  timeSlot: string;
  purpose: string;
  conflict: boolean;
  data_source?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'checked-out' | 'maintenance' | 'lost';
  assignedTo: string | null;
  lastChecked: string;
  data_source?: string;
}

export interface VendorService {
  id: string;
  name: string;
  service: string;
  sla: string;
  renewalDate: string;
  status: 'active' | 'expiring' | 'overdue';
  monthlyCost: number;
  data_source?: string;
}

export interface PlayerServiceTicket {
  id: string;
  player: string;
  type: 'housing' | 'meals' | 'transport' | 'id-passport';
  status: 'open' | 'in-progress' | 'resolved';
  priority: string;
  data_source?: string;
}

export interface OpsAnnouncement {
  id: string;
  title: string;
  audience: 'all' | 'staff' | 'players';
  requiredRead: boolean;
  confirmationRate: number;
  postedDate: string;
  data_source?: string;
}

export interface OpsApproval {
  id: string;
  title: string;
  type: string;
  amount: number | null;
  requestedBy: string;
  requestDate: string;
  urgency: string;
  status: 'pending' | 'approved' | 'denied';
  data_source?: string;
}

// =============================================================================
// LABEL / COLOR CONSTANTS
// =============================================================================

export const TASK_PRIORITY_LABELS: Record<OpsTask['priority'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const TASK_PRIORITY_COLORS: Record<OpsTask['priority'], string> = {
  critical: '#B85C5C',
  high: '#B8943E',
  medium: '#1A1714',
  low: '#9C9790',
};

export const TASK_STATUS_LABELS: Record<OpsTask['status'], string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
};

export const TASK_STATUS_COLORS: Record<OpsTask['status'], string> = {
  open: '#9C9790',
  'in-progress': '#1A1714',
  blocked: '#B85C5C',
  done: '#5A8A6E',
};

export const TRIP_STATUS_LABELS: Record<TravelTrip['status'], string> = {
  planning: 'Planning',
  booked: 'Booked',
  'in-transit': 'In Transit',
  completed: 'Completed',
};

export const TRIP_STATUS_COLORS: Record<TravelTrip['status'], string> = {
  planning: '#B8943E',
  booked: '#1A1714',
  'in-transit': '#1A1714',
  completed: '#5A8A6E',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentItem['status'], string> = {
  available: 'Available',
  'checked-out': 'Checked Out',
  maintenance: 'Maintenance',
  lost: 'Lost',
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentItem['status'], string> = {
  available: '#5A8A6E',
  'checked-out': '#1A1714',
  maintenance: '#B8943E',
  lost: '#B85C5C',
};

export const VENDOR_STATUS_LABELS: Record<VendorService['status'], string> = {
  active: 'Active',
  expiring: 'Expiring',
  overdue: 'Overdue',
};

export const VENDOR_STATUS_COLORS: Record<VendorService['status'], string> = {
  active: '#5A8A6E',
  expiring: '#B8943E',
  overdue: '#B85C5C',
};

export const TICKET_STATUS_LABELS: Record<PlayerServiceTicket['status'], string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

export const TICKET_STATUS_COLORS: Record<PlayerServiceTicket['status'], string> = {
  open: '#B8943E',
  'in-progress': '#1A1714',
  resolved: '#5A8A6E',
};

export const TICKET_TYPE_LABELS: Record<PlayerServiceTicket['type'], string> = {
  housing: 'Housing',
  meals: 'Meals',
  transport: 'Transport',
  'id-passport': 'ID / Passport',
};

export const TICKET_TYPE_COLORS: Record<PlayerServiceTicket['type'], string> = {
  housing: '#1A1714',
  meals: '#5A8A6E',
  transport: '#1A1714',
  'id-passport': '#B8943E',
};

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<OpsAnnouncement['audience'], string> = {
  all: 'All',
  staff: 'Staff',
  players: 'Players',
};

export const ANNOUNCEMENT_AUDIENCE_COLORS: Record<OpsAnnouncement['audience'], string> = {
  all: '#1A1714',
  staff: '#1A1714',
  players: '#5A8A6E',
};

export const APPROVAL_STATUS_LABELS: Record<OpsApproval['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};

export const APPROVAL_STATUS_COLORS: Record<OpsApproval['status'], string> = {
  pending: '#B8943E',
  approved: '#5A8A6E',
  denied: '#B85C5C',
};

// =============================================================================
// SUB-TABS
// =============================================================================

export const OPS_SUB_TABS: OpsSubTab[] = [
  { id: 'overview', label: 'Overview', icon: 'square.grid.2x2.fill' },
  { id: 'calendar-ops', label: 'Schedule', icon: 'calendar' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'facilities-ops', label: 'Facilities', icon: 'building.2.fill' },
  { id: 'equipment', label: 'Equipment', icon: 'archivebox.fill' },
  { id: 'vendors', label: 'Vendors', icon: 'storefront.fill' },
  { id: 'player-services', label: 'Player Services', icon: 'person.fill.questionmark' },
  { id: 'comms', label: 'Comms', icon: 'megaphone.fill' },
  { id: 'approvals', label: 'Approvals', icon: 'checkmark.seal.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

// =============================================================================
// SEEDED DATA — Carroll College Men's Basketball 2025-26
// =============================================================================

export const OPS_TASKS: OpsTask[] = [
  {
    id: 'ot-1',
    title: 'Book travel for Providence away game (bus, hotel, meals)',
    category: 'Travel',
    priority: 'critical',
    owner: 'Tyler Brooks',
    dueDate: '2026-02-20',
    status: 'open',
    data_source: 'demo_seed',
  },
  {
    id: 'ot-2',
    title: 'Order replacement practice basketballs (36 ct)',
    category: 'Equipment',
    priority: 'medium',
    owner: 'Jordan Mitchell',
    dueDate: '2026-02-25',
    status: 'open',
    data_source: 'demo_seed',
  },
  {
    id: 'ot-3',
    title: 'Prepare recruiting call list for spring targets',
    category: 'Recruiting',
    priority: 'high',
    owner: 'Coach Marcus Davis',
    dueDate: '2026-02-20',
    status: 'open',
    data_source: 'demo_seed',
  },
  {
    id: 'ot-4',
    title: 'Submit updated roster to Frontier Conference office',
    category: 'Compliance',
    priority: 'high',
    owner: 'Lisa Chen',
    dueDate: '2026-02-18',
    status: 'done',
    data_source: 'demo_seed',
  },
  {
    id: 'ot-5',
    title: 'Coordinate team meal plan for Providence trip',
    category: 'Player Services',
    priority: 'high',
    owner: 'Tyler Brooks',
    dueDate: '2026-02-22',
    status: 'in-progress',
    data_source: 'demo_seed',
  },
  {
    id: 'ot-6',
    title: 'Collect missing physicals from mid-year transfers',
    category: 'Medical',
    priority: 'critical',
    owner: 'Dr. Nicole Patterson',
    dueDate: '2026-02-21',
    status: 'blocked',
    data_source: 'demo_seed',
  },
];

export const TRAVEL_TRIPS: TravelTrip[] = [
  {
    id: 'tt-1',
    destination: 'University of Providence — West Palm Beach, FL',
    departure: '2026-02-22',
    returnDate: '2026-02-22',
    teamSize: 20,
    status: 'booked',
    missingDocs: 1,
    budget: 3800,
    spent: 2900,
    departureTime: '10:30 AM from PE Center parking lot',
    busInfo: 'Charter One — 45-passenger coach, Driver: Carlos Mendez, Bus #CO-214',
    hotel: 'N/A — same-day return trip',
    mealArrangements: 'Pre-game meal at Bonefish Grill, West Palm Beach (reserved 2:00 PM, 20 pax). Post-game snack bags on bus.',
    returnTime: 'Approx. 11:00 PM — depart 30 min after final buzzer',
    data_source: 'demo_seed',
  },
  {
    id: 'tt-2',
    destination: 'Frontier Conference Tournament — Bellevue, FL',
    departure: '2026-02-26',
    returnDate: '2026-03-02',
    teamSize: 20,
    status: 'planning',
    missingDocs: 2,
    budget: 12400,
    spent: 4500,
    data_source: 'demo_seed',
  },
  {
    id: 'tt-3',
    destination: 'Montana Tech — Montana Tech, FL',
    departure: '2026-02-15',
    returnDate: '2026-02-15',
    teamSize: 20,
    status: 'completed',
    missingDocs: 0,
    budget: 2800,
    spent: 2650,
    data_source: 'demo_seed',
  },
];

export const FACILITY_BOOKINGS: FacilityBooking[] = [
  {
    id: 'fb-1',
    facility: 'Main Gymnasium — PE Center',
    date: '2026-02-18',
    timeSlot: '3:00 PM – 5:00 PM',
    purpose: 'Team Practice — Providence prep',
    conflict: false,
    data_source: 'demo_seed',
  },
  {
    id: 'fb-2',
    facility: 'Film Room / Meeting Room',
    date: '2026-02-18',
    timeSlot: '6:00 PM – 7:30 PM',
    purpose: 'Film Session — Providence scouting report',
    conflict: false,
    data_source: 'demo_seed',
  },
  {
    id: 'fb-3',
    facility: 'Weight Room',
    date: '2026-02-18',
    timeSlot: '6:30 AM – 8:00 AM',
    purpose: 'Strength Session — Group A',
    conflict: false,
    data_source: 'demo_seed',
  },
  {
    id: 'fb-4',
    facility: 'Weight Room',
    date: '2026-02-18',
    timeSlot: '8:00 AM – 9:30 AM',
    purpose: 'Strength Session — Group B',
    conflict: false,
    data_source: 'demo_seed',
  },
  {
    id: 'fb-5',
    facility: 'Main Gymnasium — PE Center',
    date: '2026-02-20',
    timeSlot: '7:00 PM – 9:30 PM',
    purpose: 'Home Game vs. Multnomah',
    conflict: false,
    data_source: 'demo_seed',
  },
  {
    id: 'fb-6',
    facility: 'Practice Court',
    date: '2026-02-19',
    timeSlot: '8:00 AM – 10:00 AM',
    purpose: 'Individual Workouts — Bigs',
    conflict: false,
    data_source: 'demo_seed',
  },
];

export const EQUIPMENT_ITEMS: EquipmentItem[] = [
  {
    id: 'eq-1',
    name: 'Hudl Focus Camera (Court 1)',
    category: 'Film',
    status: 'available',
    assignedTo: null,
    lastChecked: '2026-02-15',
    data_source: 'demo_seed',
  },
  {
    id: 'eq-2',
    name: 'Hudl Focus Camera (Court 2)',
    category: 'Film',
    status: 'checked-out',
    assignedTo: 'Jordan Mitchell',
    lastChecked: '2026-02-15',
    data_source: 'demo_seed',
  },
  {
    id: 'eq-3',
    name: 'iPad Pro — Bench Scouting',
    category: 'Technology',
    status: 'available',
    assignedTo: null,
    lastChecked: '2026-02-10',
    data_source: 'demo_seed',
  },
  {
    id: 'eq-4',
    name: 'iPad Pro — Film Review (Coach)',
    category: 'Technology',
    status: 'checked-out',
    assignedTo: 'Coach Andre Williams',
    lastChecked: '2026-02-10',
    data_source: 'demo_seed',
  },
  {
    id: 'eq-5',
    name: 'Dr. Dish Shooting Machine',
    category: 'Training',
    status: 'maintenance',
    assignedTo: null,
    lastChecked: '2026-02-05',
    data_source: 'demo_seed',
  },
  {
    id: 'eq-6',
    name: 'Portable Shot Clock (Pair)',
    category: 'Equipment',
    status: 'available',
    assignedTo: null,
    lastChecked: '2026-01-20',
    data_source: 'demo_seed',
  },
  {
    id: 'eq-7',
    name: 'First Aid Kit — Travel',
    category: 'Medical',
    status: 'checked-out',
    assignedTo: 'Dr. Nicole Patterson',
    lastChecked: '2026-02-14',
    data_source: 'demo_seed',
  },
  {
    id: 'eq-8',
    name: 'Team Van Keys (Unit #KX-VAN-3)',
    category: 'Transport',
    status: 'available',
    assignedTo: null,
    lastChecked: '2026-02-12',
    data_source: 'demo_seed',
  },
];

export const VENDOR_SERVICES: VendorService[] = [
  {
    id: 'vs-1',
    name: 'Hudl',
    service: 'Game & Practice Video Platform',
    sla: '99.9% uptime — 24h film upload',
    renewalDate: '2026-06-30',
    status: 'active',
    monthlyCost: 350,
    data_source: 'demo_seed',
  },
  {
    id: 'vs-2',
    name: 'Select Physical Therapy',
    service: 'Sports Medicine & Rehabilitation',
    sla: 'Same-day triage — 48h treatment plan',
    renewalDate: '2026-08-31',
    status: 'active',
    monthlyCost: 2200,
    data_source: 'demo_seed',
  },
  {
    id: 'vs-3',
    name: 'Miami Sports Performance Center',
    service: 'Off-Campus Facility Rental',
    sla: '4h advance booking — guaranteed court',
    renewalDate: '2026-05-15',
    status: 'expiring',
    monthlyCost: 1500,
    data_source: 'demo_seed',
  },
  {
    id: 'vs-4',
    name: 'Wilson Sporting Goods',
    service: 'Basketball & Equipment Supply',
    sla: '10-day delivery — team discount pricing',
    renewalDate: '2026-09-01',
    status: 'active',
    monthlyCost: 0,
    data_source: 'demo_seed',
  },
  {
    id: 'vs-5',
    name: 'Charter One Transport',
    service: 'Team Bus Charter Service',
    sla: '72h advance booking — ADA compliant',
    renewalDate: '2026-04-30',
    status: 'overdue',
    monthlyCost: 1800,
    data_source: 'demo_seed',
  },
];

export const PLAYER_SERVICE_TICKETS: PlayerServiceTicket[] = [
  {
    id: 'pst-1',
    player: 'Joshua Laird',
    type: 'housing',
    status: 'open',
    priority: 'high',
    data_source: 'demo_seed',
  },
  {
    id: 'pst-2',
    player: 'Brandon Lewis',
    type: 'meals',
    status: 'in-progress',
    priority: 'medium',
    data_source: 'demo_seed',
  },
  {
    id: 'pst-3',
    player: 'Amar Asceric',
    type: 'id-passport',
    status: 'open',
    priority: 'critical',
    data_source: 'demo_seed',
  },
  {
    id: 'pst-4',
    player: 'Esteban Moratinos',
    type: 'transport',
    status: 'resolved',
    priority: 'low',
    data_source: 'demo_seed',
  },
];

export const OPS_ANNOUNCEMENTS: OpsAnnouncement[] = [
  {
    id: 'oa-1',
    title: 'Travel itinerary posted for Saturday\'s away game at Providence',
    audience: 'all',
    requiredRead: true,
    confirmationRate: 0.8,
    postedDate: '2026-02-16',
    data_source: 'demo_seed',
  },
  {
    id: 'oa-2',
    title: 'Updated practice schedule for this week',
    audience: 'all',
    requiredRead: true,
    confirmationRate: 0.53,
    postedDate: '2026-02-17',
    data_source: 'demo_seed',
  },
  {
    id: 'oa-3',
    title: 'Staff Meeting — Post-Season Planning',
    audience: 'staff',
    requiredRead: false,
    confirmationRate: 1.0,
    postedDate: '2026-02-12',
    data_source: 'demo_seed',
  },
];

export const OPS_APPROVALS: OpsApproval[] = [
  {
    id: 'oap-1',
    title: 'Providence Away Game — Travel Expense Reimbursement',
    type: 'Travel',
    amount: 3800,
    requestedBy: 'Tyler Brooks',
    requestDate: '2026-02-16',
    urgency: 'high',
    status: 'pending',
    data_source: 'demo_seed',
  },
  {
    id: 'oap-2',
    title: 'Film Room Projector Upgrade — Facility Request',
    type: 'Facility',
    amount: 4200,
    requestedBy: 'Jordan Mitchell',
    requestDate: '2026-02-14',
    urgency: 'medium',
    status: 'pending',
    data_source: 'demo_seed',
  },
  {
    id: 'oap-3',
    title: 'Dr. Dish Shooting Machine Repair',
    type: 'Equipment',
    amount: 1450,
    requestedBy: 'Mike Reeves',
    requestDate: '2026-02-08',
    urgency: 'high',
    status: 'approved',
    data_source: 'demo_seed',
  },
  {
    id: 'oap-4',
    title: 'Spring Recruiting Visit Meals Budget',
    type: 'Recruiting',
    amount: 3200,
    requestedBy: 'Coach Marcus Davis',
    requestDate: '2026-02-14',
    urgency: 'medium',
    status: 'approved',
    data_source: 'demo_seed',
  },
];

// =============================================================================
// OVERVIEW SUMMARY
// =============================================================================

export interface OpsOverview {
  openTasks: number;
  blockedTasks: number;
  criticalTasks: number;
  upcomingTrips: number;
  tripsWithMissingDocs: number;
  facilityConflicts: number;
  equipmentInMaintenance: number;
  equipmentLost: number;
  vendorsExpiring: number;
  vendorsOverdue: number;
  openPlayerTickets: number;
  pendingApprovals: number;
  pendingApprovalAmount: number;
  announcementsRequiringConfirmation: number;
}

export function getOpsOverview(): OpsOverview {
  const pendingApprovals = OPS_APPROVALS.filter((a) => a.status === 'pending');

  return {
    openTasks: OPS_TASKS.filter((t) => t.status === 'open' || t.status === 'in-progress').length,
    blockedTasks: OPS_TASKS.filter((t) => t.status === 'blocked').length,
    criticalTasks: OPS_TASKS.filter((t) => t.priority === 'critical').length,
    upcomingTrips: TRAVEL_TRIPS.filter((t) => t.status === 'planning' || t.status === 'booked').length,
    tripsWithMissingDocs: TRAVEL_TRIPS.filter((t) => t.missingDocs > 0).length,
    facilityConflicts: FACILITY_BOOKINGS.filter((b) => b.conflict).length,
    equipmentInMaintenance: EQUIPMENT_ITEMS.filter((e) => e.status === 'maintenance').length,
    equipmentLost: EQUIPMENT_ITEMS.filter((e) => e.status === 'lost').length,
    vendorsExpiring: VENDOR_SERVICES.filter((v) => v.status === 'expiring').length,
    vendorsOverdue: VENDOR_SERVICES.filter((v) => v.status === 'overdue').length,
    openPlayerTickets: PLAYER_SERVICE_TICKETS.filter((t) => t.status === 'open' || t.status === 'in-progress').length,
    pendingApprovals: pendingApprovals.length,
    pendingApprovalAmount: pendingApprovals.reduce((sum, a) => sum + (a.amount ?? 0), 0),
    announcementsRequiringConfirmation: OPS_ANNOUNCEMENTS.filter((a) => a.requiredRead && a.confirmationRate < 1.0).length,
  };
}
