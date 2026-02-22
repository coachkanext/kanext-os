/**
 * Church Organization Rooms (Physical) — Mock Data
 * Physical room management for church campus: sanctuary, fellowship hall,
 * classrooms, offices, etc. Bookings, access control, maintenance, and policies.
 *
 * NOTE: This is for PHYSICAL rooms — NOT communication rooms.
 */

// =============================================================================
// TYPES
// =============================================================================

export type RoomStatus = 'available' | 'in_use' | 'reserved' | 'offline';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
export type MaintenanceSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface PhysicalRoom {
  id: string;
  name: string;
  capacity: number;
  status: RoomStatus;
  features: string[];
  readiness: { av: boolean; livestream: boolean; clean: boolean; security: boolean };
  nextBooking: string | null;
  floor: string;
  building: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
  ministry: string;
  status: BookingStatus;
  hasConflict: boolean;
  conflictNote?: string;
}

export interface RoomAccessEntry {
  roomId: string;
  roomName: string;
  canBook: string[];
  canApprove: string[];
  canUnlock: string[];
  keyCount: number;
}

export interface MaintenanceTicket {
  id: string;
  roomId: string;
  roomName: string;
  description: string;
  severity: MaintenanceSeverity;
  status: TicketStatus;
  reportedBy: string;
  reportedDate: string;
  assignedTo: string | null;
}

export interface RoomPolicy {
  roomId: string;
  roomName: string;
  setupRules: string;
  rentalPolicy: string;
  hoursOfUse: string;
  noiseRestrictions: string;
  foodPolicy: string;
  specialNotes: string;
}

// =============================================================================
// CONSTANTS & LABELS
// =============================================================================

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Available',
  in_use: 'In Use',
  reserved: 'Reserved',
  offline: 'Offline',
};

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  available: '#22C55E',
  in_use: '#1D9BF0',
  reserved: '#1D9BF0',
  offline: '#EF4444',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  cancelled: '#A1A1AA',
};

export const SEVERITY_LABELS: Record<MaintenanceSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const SEVERITY_COLORS: Record<MaintenanceSeverity, string> = {
  low: '#A1A1AA',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#EF4444',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  open: '#EF4444',
  in_progress: '#F59E0B',
  resolved: '#22C55E',
};

// =============================================================================
// SEED DATA — 9 PHYSICAL ROOMS
// =============================================================================

export const PHYSICAL_ROOMS: PhysicalRoom[] = [
  // 1. Sanctuary
  {
    id: 'pr-001',
    name: 'Sanctuary',
    capacity: 500,
    status: 'in_use',
    features: ['AV', 'Livestream', 'Sound System', 'Piano', 'Wheelchair Accessible'],
    readiness: { av: true, livestream: true, clean: true, security: true },
    nextBooking: '2026-02-18T10:30:00',
    floor: 'Main',
    building: 'Main Church',
  },
  // 2. Fellowship Hall
  {
    id: 'pr-002',
    name: 'Fellowship Hall',
    capacity: 200,
    features: ['AV', 'Projector', 'Kitchen Access', 'Wheelchair Accessible'],
    status: 'available',
    readiness: { av: true, livestream: false, clean: true, security: true },
    nextBooking: '2026-02-18T19:00:00',
    floor: 'Ground',
    building: 'Main Church',
  },
  // 3. Nursery
  {
    id: 'pr-003',
    name: 'Nursery',
    capacity: 25,
    status: 'reserved',
    features: ['Security Camera', 'Intercom'],
    readiness: { av: false, livestream: false, clean: true, security: true },
    nextBooking: '2026-02-22T08:00:00',
    floor: '1st',
    building: 'Education Wing',
  },
  // 4. Youth Room
  {
    id: 'pr-004',
    name: 'Youth Room',
    capacity: 60,
    status: 'available',
    features: ['AV', 'Sound System', 'Projector', 'Game Area'],
    readiness: { av: true, livestream: false, clean: true, security: true },
    nextBooking: '2026-02-18T18:30:00',
    floor: '2nd',
    building: 'Education Wing',
  },
  // 5. Classroom A
  {
    id: 'pr-005',
    name: 'Classroom A',
    capacity: 30,
    status: 'available',
    features: ['Projector', 'Whiteboard'],
    readiness: { av: false, livestream: false, clean: true, security: true },
    nextBooking: '2026-02-22T09:00:00',
    floor: '1st',
    building: 'Education Wing',
  },
  // 6. Classroom B
  {
    id: 'pr-006',
    name: 'Classroom B',
    capacity: 30,
    status: 'reserved',
    features: ['Projector', 'Whiteboard'],
    readiness: { av: false, livestream: false, clean: true, security: true },
    nextBooking: '2026-02-22T09:00:00',
    floor: '1st',
    building: 'Education Wing',
  },
  // 7. Pastor's Office
  {
    id: 'pr-007',
    name: "Pastor's Office",
    capacity: 6,
    status: 'in_use',
    features: ['Private', 'Phone Line'],
    readiness: { av: false, livestream: false, clean: true, security: true },
    nextBooking: '2026-02-18T14:00:00',
    floor: '2nd',
    building: 'Admin',
  },
  // 8. Prayer Chapel
  {
    id: 'pr-008',
    name: 'Prayer Chapel',
    capacity: 15,
    status: 'available',
    features: ['Quiet Zone', 'Piano'],
    readiness: { av: false, livestream: false, clean: true, security: true },
    nextBooking: '2026-02-19T06:00:00',
    floor: 'Main',
    building: 'Main Church',
  },
  // 9. Parking Lot
  {
    id: 'pr-009',
    name: 'Parking Lot',
    capacity: 150,
    status: 'available',
    features: ['Security Camera', 'Handicap Spaces', 'EV Charging'],
    readiness: { av: false, livestream: false, clean: true, security: true },
    nextBooking: '2026-02-21T08:00:00',
    floor: 'Exterior',
    building: 'Campus',
  },
];

// =============================================================================
// SEED DATA — ROOM BOOKINGS (15+ across 5 days: 2026-02-18 to 2026-02-22)
// =============================================================================

export const ROOM_BOOKINGS: RoomBooking[] = [
  // ---------- Sunday 2026-02-22 — Sanctuary services ----------
  {
    id: 'rb-001',
    roomId: 'pr-001',
    roomName: 'Sanctuary',
    title: 'Sunday Worship — First Service',
    date: '2026-02-22',
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    bookedBy: 'Pastor David Okoro',
    ministry: 'Pastoral',
    status: 'confirmed',
    hasConflict: false,
  },
  {
    id: 'rb-002',
    roomId: 'pr-001',
    roomName: 'Sanctuary',
    title: 'Sunday Worship — Second Service',
    date: '2026-02-22',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    bookedBy: 'Pastor David Okoro',
    ministry: 'Pastoral',
    status: 'confirmed',
    hasConflict: false,
  },
  {
    id: 'rb-003',
    roomId: 'pr-001',
    roomName: 'Sanctuary',
    title: 'Sunday Evening Service',
    date: '2026-02-22',
    startTime: '06:00 PM',
    endTime: '07:30 PM',
    bookedBy: 'Pastor David Okoro',
    ministry: 'Pastoral',
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Thursday 2026-02-19 — Choir rehearsal CONFLICT ----------
  {
    id: 'rb-004',
    roomId: 'pr-001',
    roomName: 'Sanctuary',
    title: 'Choir Rehearsal',
    date: '2026-02-19',
    startTime: '07:00 PM',
    endTime: '09:00 PM',
    bookedBy: 'Angela Davis',
    ministry: 'Music',
    status: 'confirmed',
    hasConflict: true,
    conflictNote: 'Overlaps with Thursday Prayer Service (7:00 PM - 8:00 PM). Choir director and prayer leader must coordinate — suggest moving prayer to Chapel or shifting rehearsal to 8:00 PM.',
  },
  {
    id: 'rb-005',
    roomId: 'pr-001',
    roomName: 'Sanctuary',
    title: 'Thursday Prayer Service',
    date: '2026-02-19',
    startTime: '07:00 PM',
    endTime: '08:00 PM',
    bookedBy: 'Elder James Whitfield',
    ministry: 'Prayer',
    status: 'pending',
    hasConflict: true,
    conflictNote: 'Conflicts with Choir Rehearsal (7:00 PM - 9:00 PM). Consider relocating to Prayer Chapel.',
  },

  // ---------- Wednesday 2026-02-18 — Youth group ----------
  {
    id: 'rb-006',
    roomId: 'pr-004',
    roomName: 'Youth Room',
    title: 'Wednesday Youth Group',
    date: '2026-02-18',
    startTime: '06:30 PM',
    endTime: '08:30 PM',
    bookedBy: 'Alex Morgan',
    ministry: 'Youth',
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Tuesday 2026-02-17 — Bible study in Fellowship Hall ----------
  // NOTE: Intentionally on a Tuesday that borders the range for realism
  {
    id: 'rb-007',
    roomId: 'pr-002',
    roomName: 'Fellowship Hall',
    title: 'Tuesday Bible Study',
    date: '2026-02-18',
    startTime: '07:00 PM',
    endTime: '08:30 PM',
    bookedBy: 'Deacon Robert Lee',
    ministry: 'Bible Study',
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Nursery — Sunday services ----------
  {
    id: 'rb-008',
    roomId: 'pr-003',
    roomName: 'Nursery',
    title: 'Nursery — First Service',
    date: '2026-02-22',
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    bookedBy: 'Lisa Monroe',
    ministry: "Children's Ministry",
    status: 'confirmed',
    hasConflict: false,
  },
  {
    id: 'rb-009',
    roomId: 'pr-003',
    roomName: 'Nursery',
    title: 'Nursery — Second Service',
    date: '2026-02-22',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    bookedBy: 'Lisa Monroe',
    ministry: "Children's Ministry",
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Classrooms — Sunday School ----------
  {
    id: 'rb-010',
    roomId: 'pr-005',
    roomName: 'Classroom A',
    title: 'Adult Sunday School',
    date: '2026-02-22',
    startTime: '09:00 AM',
    endTime: '10:15 AM',
    bookedBy: 'Deacon Robert Lee',
    ministry: 'Education',
    status: 'confirmed',
    hasConflict: false,
  },
  {
    id: 'rb-011',
    roomId: 'pr-006',
    roomName: 'Classroom B',
    title: "Children's Sunday School",
    date: '2026-02-22',
    startTime: '09:00 AM',
    endTime: '10:15 AM',
    bookedBy: 'Lisa Monroe',
    ministry: "Children's Ministry",
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Pastor meeting ----------
  {
    id: 'rb-012',
    roomId: 'pr-007',
    roomName: "Pastor's Office",
    title: 'Premarital Counseling — Johnson Family',
    date: '2026-02-18',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    bookedBy: 'Pastor David Okoro',
    ministry: 'Pastoral',
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Women's prayer group — Prayer Chapel ----------
  {
    id: 'rb-013',
    roomId: 'pr-008',
    roomName: 'Prayer Chapel',
    title: "Women's Prayer Group",
    date: '2026-02-19',
    startTime: '06:00 AM',
    endTime: '07:00 AM',
    bookedBy: 'Sister Grace Adeyemi',
    ministry: "Women's Ministry",
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Parking lot — Food drive Saturday ----------
  {
    id: 'rb-014',
    roomId: 'pr-009',
    roomName: 'Parking Lot',
    title: 'Community Food Drive',
    date: '2026-02-21',
    startTime: '08:00 AM',
    endTime: '02:00 PM',
    bookedBy: 'Michael Williams',
    ministry: 'Outreach',
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Fellowship Hall — Friday evening event ----------
  {
    id: 'rb-015',
    roomId: 'pr-002',
    roomName: 'Fellowship Hall',
    title: 'Youth Movie Night',
    date: '2026-02-20',
    startTime: '06:00 PM',
    endTime: '09:00 PM',
    bookedBy: 'Alex Morgan',
    ministry: 'Youth',
    status: 'pending',
    hasConflict: false,
  },

  // ---------- Classroom A — Wednesday evening ----------
  {
    id: 'rb-016',
    roomId: 'pr-005',
    roomName: 'Classroom A',
    title: 'New Members Class',
    date: '2026-02-18',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    bookedBy: 'Sarah Johnson',
    ministry: 'Membership',
    status: 'confirmed',
    hasConflict: false,
  },

  // ---------- Prayer Chapel — Saturday morning ----------
  {
    id: 'rb-017',
    roomId: 'pr-008',
    roomName: 'Prayer Chapel',
    title: "Men's Prayer Breakfast",
    date: '2026-02-21',
    startTime: '07:00 AM',
    endTime: '08:30 AM',
    bookedBy: 'Elder James Whitfield',
    ministry: "Men's Ministry",
    status: 'confirmed',
    hasConflict: false,
  },
];

// =============================================================================
// SEED DATA — ROOM ACCESS ENTRIES (1 per room)
// =============================================================================

export const ROOM_ACCESS: RoomAccessEntry[] = [
  // 1. Sanctuary
  {
    roomId: 'pr-001',
    roomName: 'Sanctuary',
    canBook: ['Pastor David Okoro', 'Sarah Johnson', 'Michael Williams'],
    canApprove: ['Pastor David Okoro', 'Elder James Whitfield'],
    canUnlock: ['Michael Williams', 'Angela Davis'],
    keyCount: 4,
  },
  // 2. Fellowship Hall
  {
    roomId: 'pr-002',
    roomName: 'Fellowship Hall',
    canBook: ['Sarah Johnson', 'Deacon Robert Lee', 'Alex Morgan'],
    canApprove: ['Pastor David Okoro', 'Deacon Robert Lee'],
    canUnlock: ['Michael Williams', 'Deacon Robert Lee'],
    keyCount: 3,
  },
  // 3. Nursery
  {
    roomId: 'pr-003',
    roomName: 'Nursery',
    canBook: ['Lisa Monroe', 'Sarah Johnson'],
    canApprove: ['Pastor David Okoro', 'Lisa Monroe'],
    canUnlock: ['Lisa Monroe', 'Sarah Johnson'],
    keyCount: 2,
  },
  // 4. Youth Room
  {
    roomId: 'pr-004',
    roomName: 'Youth Room',
    canBook: ['Alex Morgan', 'Sarah Johnson'],
    canApprove: ['Pastor David Okoro', 'Alex Morgan'],
    canUnlock: ['Alex Morgan', 'Michael Williams'],
    keyCount: 3,
  },
  // 5. Classroom A
  {
    roomId: 'pr-005',
    roomName: 'Classroom A',
    canBook: ['Deacon Robert Lee', 'Sarah Johnson', 'Lisa Monroe'],
    canApprove: ['Deacon Robert Lee', 'Pastor David Okoro'],
    canUnlock: ['Michael Williams', 'Deacon Robert Lee'],
    keyCount: 3,
  },
  // 6. Classroom B
  {
    roomId: 'pr-006',
    roomName: 'Classroom B',
    canBook: ['Deacon Robert Lee', 'Sarah Johnson', 'Lisa Monroe'],
    canApprove: ['Deacon Robert Lee', 'Pastor David Okoro'],
    canUnlock: ['Michael Williams', 'Deacon Robert Lee'],
    keyCount: 3,
  },
  // 7. Pastor's Office
  {
    roomId: 'pr-007',
    roomName: "Pastor's Office",
    canBook: ['Pastor David Okoro'],
    canApprove: ['Pastor David Okoro'],
    canUnlock: ['Pastor David Okoro'],
    keyCount: 1,
  },
  // 8. Prayer Chapel
  {
    roomId: 'pr-008',
    roomName: 'Prayer Chapel',
    canBook: ['Elder James Whitfield', 'Sister Grace Adeyemi', 'Sarah Johnson'],
    canApprove: ['Pastor David Okoro', 'Elder James Whitfield'],
    canUnlock: ['Elder James Whitfield', 'Michael Williams'],
    keyCount: 2,
  },
  // 9. Parking Lot
  {
    roomId: 'pr-009',
    roomName: 'Parking Lot',
    canBook: ['Michael Williams', 'Sarah Johnson', 'Alex Morgan'],
    canApprove: ['Pastor David Okoro', 'Michael Williams'],
    canUnlock: ['Michael Williams'],
    keyCount: 2,
  },
];

// =============================================================================
// SEED DATA — MAINTENANCE TICKETS (6)
// =============================================================================

export const MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 'mt-001',
    roomId: 'pr-001',
    roomName: 'Sanctuary',
    description: 'Main projector bulb is dimming and needs replacement before Sunday. Image quality has degraded noticeably during evening services.',
    severity: 'medium',
    status: 'in_progress',
    reportedBy: 'Angela Davis',
    reportedDate: '2026-02-15',
    assignedTo: 'Michael Williams',
  },
  {
    id: 'mt-002',
    roomId: 'pr-002',
    roomName: 'Fellowship Hall',
    description: 'Kitchen sink has a persistent leak under the basin. Water pooling on floor — slip hazard during events with food service.',
    severity: 'high',
    status: 'open',
    reportedBy: 'Deacon Robert Lee',
    reportedDate: '2026-02-16',
    assignedTo: null,
  },
  {
    id: 'mt-003',
    roomId: 'pr-004',
    roomName: 'Youth Room',
    description: 'Large carpet stain near the entrance from spilled juice during last Friday game night. Needs professional cleaning.',
    severity: 'low',
    status: 'open',
    reportedBy: 'Alex Morgan',
    reportedDate: '2026-02-17',
    assignedTo: null,
  },
  {
    id: 'mt-004',
    roomId: 'pr-003',
    roomName: 'Nursery',
    description: 'Intercom producing static when transmitting to the Sanctuary. Parents cannot hear announcements clearly.',
    severity: 'medium',
    status: 'in_progress',
    reportedBy: 'Lisa Monroe',
    reportedDate: '2026-02-14',
    assignedTo: 'Michael Williams',
  },
  {
    id: 'mt-005',
    roomId: 'pr-009',
    roomName: 'Parking Lot',
    description: 'Pothole near the east entrance is approximately 8 inches deep. Risk of vehicle damage and tripping hazard for pedestrians.',
    severity: 'high',
    status: 'open',
    reportedBy: 'Michael Williams',
    reportedDate: '2026-02-13',
    assignedTo: null,
  },
  {
    id: 'mt-006',
    roomId: 'pr-006',
    roomName: 'Classroom B',
    description: 'Whiteboard markers are dried out and erasers need replacement. Sunday School teachers have been bringing their own supplies.',
    severity: 'low',
    status: 'resolved',
    reportedBy: 'Deacon Robert Lee',
    reportedDate: '2026-02-10',
    assignedTo: 'Sarah Johnson',
  },
];

// =============================================================================
// SEED DATA — ROOM POLICIES (1 per room)
// =============================================================================

export const ROOM_POLICIES: RoomPolicy[] = [
  // 1. Sanctuary
  {
    roomId: 'pr-001',
    roomName: 'Sanctuary',
    setupRules: 'Setup begins 1 hour before service. All chairs must be returned to original configuration within 30 minutes of event end. Sound and AV team must be present for any amplified event.',
    rentalPolicy: 'Available to outside groups by pastoral approval only. Non-member rental fee: $500/event. Deposit of $200 required. Church members may reserve at no cost for weddings and funerals with 60 days advance notice.',
    hoursOfUse: 'Sunday: 6:00 AM - 9:00 PM. Weekdays: 8:00 AM - 9:00 PM. Saturday: 7:00 AM - 10:00 PM.',
    noiseRestrictions: 'Sound levels must not exceed 85 dB during weekday evenings (after 8:00 PM). Sunday services exempt. All amplified rehearsals must end by 9:00 PM.',
    foodPolicy: 'No food or beverages in the Sanctuary at any time. Water bottles with sealed caps permitted in the choir loft and balcony only.',
    specialNotes: 'Livestream equipment must remain powered on during all Sunday services. Baptismal pool requires 24-hour advance notice for filling. Communion supplies are stored in the vestry — contact Deacon Lee.',
  },
  // 2. Fellowship Hall
  {
    roomId: 'pr-002',
    roomName: 'Fellowship Hall',
    setupRules: 'Tables and chairs must be set up by the requesting ministry. Custodial staff will provide tablecloths and basic supplies. Setup window: 2 hours before event. Teardown must be complete within 1 hour after event.',
    rentalPolicy: 'Available to community groups with church sponsor. Non-member rental: $300/event. Member events at no cost. Refundable cleaning deposit: $150.',
    hoursOfUse: 'Daily: 7:00 AM - 10:00 PM. Kitchen closes at 9:00 PM for cleanup.',
    noiseRestrictions: 'Amplified music permitted until 9:00 PM on weeknights, 10:00 PM on weekends. Volume must be moderated when Sanctuary is in concurrent use.',
    foodPolicy: 'Full kitchen access available. All food must be prepared in the kitchen — no outside cooking equipment. Leftovers must be removed same day. Ministry leaders are responsible for cleanup.',
    specialNotes: 'Kitchen appliances (ovens, dishwasher) require orientation before first use. Contact church office for scheduling. Maximum occupancy is posted by fire code — do not exceed 200 persons.',
  },
  // 3. Nursery
  {
    roomId: 'pr-003',
    roomName: 'Nursery',
    setupRules: 'Nursery volunteers must arrive 30 minutes before service to sanitize surfaces and prepare sign-in station. All toys and supplies must be returned to labeled bins at end of use.',
    rentalPolicy: 'Not available for rental. Nursery is reserved exclusively for church childcare during services and approved church events.',
    hoursOfUse: 'Open only during scheduled services and events. Typical hours: Sunday 7:30 AM - 1:00 PM, Wednesday 6:00 PM - 9:00 PM.',
    noiseRestrictions: 'Keep noise levels appropriate for infants and toddlers. No amplified music or speakers.',
    foodPolicy: 'Only pre-packaged snacks and sealed beverages for children. No nut products. Parents must label all bottles and food items. Volunteers may not bring outside food.',
    specialNotes: 'Background check required for all nursery volunteers. Two-adult rule is mandatory at all times. Security cameras are always recording. Parents must use the check-in/check-out system — no exceptions.',
  },
  // 4. Youth Room
  {
    roomId: 'pr-004',
    roomName: 'Youth Room',
    setupRules: 'Youth leaders are responsible for room configuration. Game area equipment must be stored properly after use. AV equipment should be powered down and covered when not in use.',
    rentalPolicy: 'Available to church-affiliated youth organizations at no cost. Outside youth group rental: $150/event with adult supervisor present. Not available for non-youth events.',
    hoursOfUse: 'Weekdays: 3:00 PM - 9:00 PM. Weekends: 9:00 AM - 10:00 PM. Not available during school hours without pastoral approval.',
    noiseRestrictions: 'Amplified music permitted but must be moderated after 8:00 PM on weeknights. Game area noise should not be disruptive to adjacent classrooms.',
    foodPolicy: 'Snacks and beverages permitted. Pizza and catered food allowed for scheduled events. All trash must be removed and surfaces wiped down after every use.',
    specialNotes: 'Game console and equipment inventory must be checked after each event. Report any damage immediately to the youth pastor. WiFi password rotates monthly — see church office.',
  },
  // 5. Classroom A
  {
    roomId: 'pr-005',
    roomName: 'Classroom A',
    setupRules: 'Desks should be arranged in the requested configuration (rows, circle, or groups) by the booking party. Return to standard rows after use. Erase whiteboard completely.',
    rentalPolicy: 'Available to church ministries at no cost. Outside educational groups: $75/session. Weekly recurring bookings available at $250/month.',
    hoursOfUse: 'Weekdays: 8:00 AM - 9:00 PM. Weekends: 8:00 AM - 8:00 PM.',
    noiseRestrictions: 'Standard classroom volume. No amplified audio without prior approval. Keep voices moderated when Classroom B is in concurrent use.',
    foodPolicy: 'Light refreshments (coffee, water, packaged snacks) permitted. No full meals. Clean up all food items before leaving.',
    specialNotes: 'Projector remote is stored in the top drawer of the teacher desk. Report any projector or whiteboard issues to the church office immediately.',
  },
  // 6. Classroom B
  {
    roomId: 'pr-006',
    roomName: 'Classroom B',
    setupRules: 'Same configuration rules as Classroom A. Children\'s ministry events should use the child-size furniture stored in the closet. Return adult furniture for non-children events.',
    rentalPolicy: 'Available to church ministries at no cost. Outside educational groups: $75/session. Weekly recurring bookings available at $250/month.',
    hoursOfUse: 'Weekdays: 8:00 AM - 9:00 PM. Weekends: 8:00 AM - 8:00 PM.',
    noiseRestrictions: 'Standard classroom volume. Children\'s classes should use indoor voices. No amplified audio.',
    foodPolicy: 'Light refreshments permitted. For children\'s events, only pre-approved snacks (nut-free). Clean up all crumbs and spills immediately.',
    specialNotes: 'Craft supplies are stored in the labeled cabinets. Replenish supplies by submitting a request to the church office. Children must be supervised at all times.',
  },
  // 7. Pastor's Office
  {
    roomId: 'pr-007',
    roomName: "Pastor's Office",
    setupRules: 'No setup required. Office is maintained by pastoral staff. Counseling sessions should ensure tissues and water are available. Confidential documents must be secured in the filing cabinet.',
    rentalPolicy: 'Not available for rental or general use. Reserved exclusively for pastoral staff and approved counseling sessions.',
    hoursOfUse: 'By appointment only. Typical availability: Monday - Friday 9:00 AM - 5:00 PM. Emergency pastoral visits by arrangement.',
    noiseRestrictions: 'Quiet environment required. No amplified audio. Phone conversations should be at moderate volume. Door should remain closed during counseling sessions.',
    foodPolicy: 'Coffee and water permitted. No meals in the office.',
    specialNotes: 'Counseling sessions are confidential. Do not interrupt when the "In Session" sign is displayed. Visitor log must be maintained by church secretary.',
  },
  // 8. Prayer Chapel
  {
    roomId: 'pr-008',
    roomName: 'Prayer Chapel',
    setupRules: 'Chapel should remain in quiet reflection configuration at all times. Candles may be lit only during supervised prayer services. Piano lid should remain closed when not in use.',
    rentalPolicy: 'Not available for rental. Open to all church members for personal prayer during church hours. Group prayer sessions must be scheduled through the church office.',
    hoursOfUse: 'Daily: 6:00 AM - 9:00 PM. Extended hours available for special prayer vigils with pastoral approval.',
    noiseRestrictions: 'Quiet zone at all times. Whispered conversation only. Piano playing permitted only during scheduled prayer services — soft playing only. No amplified audio under any circumstances.',
    foodPolicy: 'No food or beverages. Water bottles with sealed caps only.',
    specialNotes: 'Prayer request cards and pens are available at the entrance. Completed cards should be placed in the prayer box. The chapel is a sacred space — please remove shoes if culturally appropriate and maintain reverent atmosphere.',
  },
  // 9. Parking Lot
  {
    roomId: 'pr-009',
    roomName: 'Parking Lot',
    setupRules: 'Event setups require traffic cones and directional signage. Setup begins 2 hours before outdoor events. Tent and canopy rentals must be approved 2 weeks in advance. All vendor vehicles must be pre-registered.',
    rentalPolicy: 'Available for church-sponsored community events at no cost. Outside events: $200/day plus $500 refundable deposit for cleanup. Proof of liability insurance required for any event with 100+ attendees.',
    hoursOfUse: 'Open 24/7 for church staff. Event hours: 7:00 AM - 10:00 PM. Overnight parking by pastoral approval only.',
    noiseRestrictions: 'Amplified sound permitted until 9:00 PM for outdoor events. Generators must be positioned away from neighboring properties. Comply with local noise ordinances.',
    foodPolicy: 'Food trucks and outdoor cooking permitted for approved events only. Grease and food waste must be properly disposed of. No dumping in storm drains.',
    specialNotes: 'Handicap spaces must remain accessible at all times — no exceptions. EV charging stations are first-come, first-served with a 4-hour limit. Security cameras cover all areas. Report any suspicious activity to church security team.',
  },
];

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function getChurchRoomsData() {
  return {
    rooms: PHYSICAL_ROOMS,
    bookings: ROOM_BOOKINGS,
    access: ROOM_ACCESS,
    maintenance: MAINTENANCE_TICKETS,
    policies: ROOM_POLICIES,
    tiles: {
      totalRooms: PHYSICAL_ROOMS.length,
      available: PHYSICAL_ROOMS.filter((r) => r.status === 'available').length,
      inUse: PHYSICAL_ROOMS.filter((r) => r.status === 'in_use').length,
      offline: PHYSICAL_ROOMS.filter((r) => r.status === 'offline').length,
      openTickets: MAINTENANCE_TICKETS.filter((t) => t.status !== 'resolved').length,
    },
  };
}
