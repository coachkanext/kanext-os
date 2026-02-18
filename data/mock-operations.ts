/**
 * Operations v2 Mock Data
 * Calendar events, tasks, facilities, equipment, and travel plans per mode.
 */
import type { Mode } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'practice' | 'game' | 'meeting' | 'travel' | 'service' | 'class' | 'event' | 'deadline';
  location: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  category: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: 'available' | 'booked' | 'maintenance';
  nextAvailable?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: 'good' | 'fair' | 'poor' | 'needs-repair';
  lastChecked: string;
}

export interface TravelPlan {
  id: string;
  destination: string;
  date: string;
  returnDate: string;
  partySize: number;
  status: 'planned' | 'booked' | 'completed';
  budget: number;
}

export interface OperationsSnapshot {
  upcomingEvents: number;
  openTasks: number;
  facilitiesBooked: number;
  travelPlanned: number;
}

// =============================================================================
// SPORTS
// =============================================================================

const SPORTS_EVENTS: CalendarEvent[] = [
  { id: 'se-1', title: 'Morning Shootaround', date: 'Feb 17, 2026', time: '8:00 AM', type: 'practice', location: 'Wellness Center Gym', status: 'confirmed' },
  { id: 'se-2', title: 'Film Review — Webber Intl', date: 'Feb 17, 2026', time: '11:00 AM', type: 'meeting', location: 'Film Room', status: 'confirmed' },
  { id: 'se-3', title: 'vs. Webber International', date: 'Feb 18, 2026', time: '7:00 PM', type: 'game', location: 'Wellness Center', status: 'confirmed' },
  { id: 'se-4', title: 'Travel Day — Thomas University', date: 'Feb 20, 2026', time: '10:00 AM', type: 'travel', location: 'Thomasville, GA', status: 'confirmed' },
  { id: 'se-5', title: 'at Thomas University', date: 'Feb 21, 2026', time: '4:00 PM', type: 'game', location: 'Thomas University Arena', status: 'confirmed' },
  { id: 'se-6', title: 'Weights & Conditioning', date: 'Feb 19, 2026', time: '6:30 AM', type: 'practice', location: 'Weight Room', status: 'confirmed' },
  { id: 'se-7', title: 'Recruiting Staff Meeting', date: 'Feb 19, 2026', time: '2:00 PM', type: 'meeting', location: 'Coaches Office', status: 'tentative' },
  { id: 'se-8', title: 'Conference Tournament Departure', date: 'Feb 28, 2026', time: '8:00 AM', type: 'travel', location: 'TBD', status: 'tentative' },
];

const SPORTS_TASKS: Task[] = [
  { id: 'st-1', title: 'Game prep packet — Webber Intl', assignee: 'Coach Harris', dueDate: 'Feb 17', priority: 'high', status: 'in-progress', category: 'Game Prep' },
  { id: 'st-2', title: 'Equipment check — away game bags', assignee: 'Antoine Brooks', dueDate: 'Feb 19', priority: 'high', status: 'pending', category: 'Equipment' },
  { id: 'st-3', title: 'Book team hotel — Thomas', assignee: 'Ops Coordinator', dueDate: 'Feb 18', priority: 'high', status: 'completed', category: 'Travel' },
  { id: 'st-4', title: 'Submit eligibility forms', assignee: 'Sammy Kalejaiye', dueDate: 'Feb 20', priority: 'medium', status: 'pending', category: 'Compliance' },
  { id: 'st-5', title: 'Update depth chart for conference play', assignee: 'Coach Harris', dueDate: 'Feb 22', priority: 'medium', status: 'pending', category: 'Roster' },
  { id: 'st-6', title: 'Trainer room restock', assignee: 'Medical Staff', dueDate: 'Feb 16', priority: 'low', status: 'overdue', category: 'Medical' },
];

const SPORTS_FACILITIES: Facility[] = [
  { id: 'sf-1', name: 'Wellness Center Gym', type: 'Main Court', capacity: 1200, status: 'booked', nextAvailable: 'Feb 19, 4:00 PM' },
  { id: 'sf-2', name: 'Weight Room', type: 'Strength & Conditioning', capacity: 40, status: 'available' },
  { id: 'sf-3', name: 'Film Room', type: 'Video Analysis', capacity: 25, status: 'booked', nextAvailable: 'Feb 17, 1:00 PM' },
  { id: 'sf-4', name: 'Athletic Training Room', type: 'Medical', capacity: 15, status: 'available' },
];

const SPORTS_EQUIPMENT: Equipment[] = [
  { id: 'seq-1', name: 'Game Basketballs (Wilson Evolution)', category: 'Balls', quantity: 24, condition: 'good', lastChecked: 'Feb 10, 2026' },
  { id: 'seq-2', name: 'Training Cones & Agility Set', category: 'Training', quantity: 60, condition: 'fair', lastChecked: 'Jan 28, 2026' },
  { id: 'seq-3', name: 'Shot Clock System', category: 'Game Day', quantity: 2, condition: 'good', lastChecked: 'Feb 1, 2026' },
  { id: 'seq-4', name: 'Video Recording Gear', category: 'Film', quantity: 3, condition: 'good', lastChecked: 'Feb 5, 2026' },
  { id: 'seq-5', name: 'Medical Kit (Team Travel)', category: 'Medical', quantity: 2, condition: 'needs-repair', lastChecked: 'Feb 12, 2026' },
];

const SPORTS_TRAVEL: TravelPlan[] = [
  { id: 'str-1', destination: 'Webber International — Babson Park, FL', date: 'Feb 18, 2026', returnDate: 'Feb 18, 2026', partySize: 18, status: 'booked', budget: 1200 },
  { id: 'str-2', destination: 'Thomas University — Thomasville, GA', date: 'Feb 20, 2026', returnDate: 'Feb 22, 2026', partySize: 18, status: 'booked', budget: 4800 },
  { id: 'str-3', destination: 'Conference Tournament — TBD', date: 'Feb 28, 2026', returnDate: 'Mar 3, 2026', partySize: 20, status: 'planned', budget: 8500 },
];

const SPORTS_SNAPSHOT: OperationsSnapshot = {
  upcomingEvents: 8,
  openTasks: 4,
  facilitiesBooked: 2,
  travelPlanned: 3,
};

// =============================================================================
// CHURCH
// =============================================================================

const CHURCH_EVENTS: CalendarEvent[] = [
  { id: 'ce-1', title: 'Sunday Worship Service', date: 'Feb 22, 2026', time: '10:00 AM', type: 'service', location: 'Main Sanctuary', status: 'confirmed' },
  { id: 'ce-2', title: 'Wednesday Bible Study', date: 'Feb 18, 2026', time: '7:00 PM', type: 'service', location: 'Fellowship Hall', status: 'confirmed' },
  { id: 'ce-3', title: 'Youth Group Night', date: 'Feb 20, 2026', time: '6:30 PM', type: 'event', location: 'Youth Center', status: 'confirmed' },
  { id: 'ce-4', title: 'Community Outreach — Food Drive', date: 'Feb 21, 2026', time: '9:00 AM', type: 'event', location: 'Parking Lot', status: 'confirmed' },
  { id: 'ce-5', title: 'Elder Board Meeting', date: 'Feb 19, 2026', time: '6:30 PM', type: 'meeting', location: 'Conference Room', status: 'confirmed' },
  { id: 'ce-6', title: 'Worship Team Rehearsal', date: 'Feb 21, 2026', time: '4:00 PM', type: 'practice', location: 'Sanctuary', status: 'confirmed' },
  { id: 'ce-7', title: 'Marriage Enrichment Seminar', date: 'Feb 28, 2026', time: '6:00 PM', type: 'event', location: 'Fellowship Hall', status: 'tentative' },
  { id: 'ce-8', title: 'Missions Trip Planning Meeting', date: 'Feb 23, 2026', time: '12:30 PM', type: 'meeting', location: 'Conference Room', status: 'confirmed' },
];

const CHURCH_TASKS: Task[] = [
  { id: 'ct-1', title: 'Prepare Sunday bulletin', assignee: 'Admin Office', dueDate: 'Feb 20', priority: 'high', status: 'in-progress', category: 'Worship' },
  { id: 'ct-2', title: 'AV system soundcheck', assignee: 'Tech Team', dueDate: 'Feb 21', priority: 'high', status: 'pending', category: 'Technical' },
  { id: 'ct-3', title: 'Schedule volunteers — ushers & greeters', assignee: 'Min. Davis', dueDate: 'Feb 19', priority: 'medium', status: 'in-progress', category: 'Volunteers' },
  { id: 'ct-4', title: 'Order communion supplies', assignee: 'Deacon Board', dueDate: 'Feb 25', priority: 'medium', status: 'pending', category: 'Supplies' },
  { id: 'ct-5', title: 'Update church website — Lent schedule', assignee: 'Media Team', dueDate: 'Feb 18', priority: 'low', status: 'overdue', category: 'Communications' },
];

const CHURCH_FACILITIES: Facility[] = [
  { id: 'cf-1', name: 'Main Sanctuary', type: 'Worship', capacity: 500, status: 'booked', nextAvailable: 'Mon 8:00 AM' },
  { id: 'cf-2', name: 'Fellowship Hall', type: 'Multi-Purpose', capacity: 200, status: 'available' },
  { id: 'cf-3', name: 'Youth Center', type: 'Youth Ministry', capacity: 80, status: 'booked', nextAvailable: 'Fri 6:00 PM' },
];

const CHURCH_EQUIPMENT: Equipment[] = [
  { id: 'ceq-1', name: 'Sound System (Main)', category: 'Audio/Visual', quantity: 1, condition: 'good', lastChecked: 'Feb 8, 2026' },
  { id: 'ceq-2', name: 'Projector & Screen Set', category: 'Audio/Visual', quantity: 3, condition: 'fair', lastChecked: 'Jan 30, 2026' },
  { id: 'ceq-3', name: 'Worship Instruments', category: 'Music', quantity: 12, condition: 'good', lastChecked: 'Feb 5, 2026' },
  { id: 'ceq-4', name: 'Communion Sets', category: 'Sacraments', quantity: 4, condition: 'good', lastChecked: 'Feb 1, 2026' },
];

const CHURCH_TRAVEL: TravelPlan[] = [];

const CHURCH_SNAPSHOT: OperationsSnapshot = {
  upcomingEvents: 8,
  openTasks: 3,
  facilitiesBooked: 2,
  travelPlanned: 0,
};

// =============================================================================
// EDUCATION
// =============================================================================

const EDUCATION_EVENTS: CalendarEvent[] = [
  { id: 'ee-1', title: 'Monday Lectures — Block A', date: 'Feb 17, 2026', time: '8:00 AM', type: 'class', location: 'Lecture Hall A', status: 'confirmed' },
  { id: 'ee-2', title: 'Faculty Senate Meeting', date: 'Feb 18, 2026', time: '3:00 PM', type: 'meeting', location: 'Admin Board Room', status: 'confirmed' },
  { id: 'ee-3', title: 'Admissions Open House', date: 'Feb 21, 2026', time: '10:00 AM', type: 'event', location: 'Student Center', status: 'confirmed' },
  { id: 'ee-4', title: 'Midterm Exams Begin', date: 'Feb 23, 2026', time: '8:00 AM', type: 'deadline', location: 'Campus-Wide', status: 'confirmed' },
  { id: 'ee-5', title: 'Curriculum Committee Review', date: 'Feb 19, 2026', time: '1:00 PM', type: 'meeting', location: 'Conference Room B', status: 'confirmed' },
  { id: 'ee-6', title: 'Spring Graduation Prep Kickoff', date: 'Feb 20, 2026', time: '2:00 PM', type: 'meeting', location: 'Auditorium', status: 'tentative' },
  { id: 'ee-7', title: 'Lab Sessions — Chemistry', date: 'Feb 17, 2026', time: '1:00 PM', type: 'class', location: 'Science Lab 201', status: 'confirmed' },
  { id: 'ee-8', title: 'Financial Aid Deadline', date: 'Feb 28, 2026', time: '5:00 PM', type: 'deadline', location: 'Online Portal', status: 'confirmed' },
];

const EDUCATION_TASKS: Task[] = [
  { id: 'et-1', title: 'Curriculum review — Spring electives', assignee: 'Dr. Chen', dueDate: 'Feb 20', priority: 'high', status: 'in-progress', category: 'Academic' },
  { id: 'et-2', title: 'Accreditation self-study draft', assignee: 'Dr. Hardrick', dueDate: 'Mar 1', priority: 'high', status: 'in-progress', category: 'Accreditation' },
  { id: 'et-3', title: 'Enrollment projections — Fall 2026', assignee: 'Registrar', dueDate: 'Feb 25', priority: 'high', status: 'pending', category: 'Enrollment' },
  { id: 'et-4', title: 'Update course catalog online', assignee: 'IT Department', dueDate: 'Feb 22', priority: 'medium', status: 'pending', category: 'Technology' },
  { id: 'et-5', title: 'Order lab supplies — Spring', assignee: 'Lab Manager', dueDate: 'Feb 18', priority: 'medium', status: 'completed', category: 'Supplies' },
  { id: 'et-6', title: 'Schedule commencement speakers', assignee: 'Dean of Students', dueDate: 'Mar 5', priority: 'low', status: 'pending', category: 'Events' },
];

const EDUCATION_FACILITIES: Facility[] = [
  { id: 'ef-1', name: 'Lecture Hall A', type: 'Classroom', capacity: 120, status: 'booked', nextAvailable: 'Feb 17, 5:00 PM' },
  { id: 'ef-2', name: 'Science Lab 201', type: 'Laboratory', capacity: 30, status: 'booked', nextAvailable: 'Feb 17, 4:00 PM' },
  { id: 'ef-3', name: 'University Library', type: 'Library', capacity: 250, status: 'available' },
  { id: 'ef-4', name: 'Main Auditorium', type: 'Event Space', capacity: 600, status: 'available' },
  { id: 'ef-5', name: 'Student Center', type: 'Multi-Purpose', capacity: 150, status: 'booked', nextAvailable: 'Feb 22, 8:00 AM' },
];

const EDUCATION_EQUIPMENT: Equipment[] = [
  { id: 'eeq-1', name: 'Lab Equipment (Chemistry)', category: 'Science', quantity: 30, condition: 'good', lastChecked: 'Feb 3, 2026' },
  { id: 'eeq-2', name: 'Student Laptops (Checkout)', category: 'Technology', quantity: 50, condition: 'fair', lastChecked: 'Jan 20, 2026' },
  { id: 'eeq-3', name: 'Classroom AV Systems', category: 'Audio/Visual', quantity: 18, condition: 'good', lastChecked: 'Feb 1, 2026' },
  { id: 'eeq-4', name: 'Library Reference Collection', category: 'Library', quantity: 12000, condition: 'good', lastChecked: 'Jan 15, 2026' },
];

const EDUCATION_TRAVEL: TravelPlan[] = [
  { id: 'etr-1', destination: 'Accreditation Conference — Atlanta, GA', date: 'Mar 10, 2026', returnDate: 'Mar 12, 2026', partySize: 4, status: 'booked', budget: 3200 },
  { id: 'etr-2', destination: 'Faculty Development Workshop — Orlando, FL', date: 'Mar 20, 2026', returnDate: 'Mar 22, 2026', partySize: 6, status: 'planned', budget: 4500 },
];

const EDUCATION_SNAPSHOT: OperationsSnapshot = {
  upcomingEvents: 8,
  openTasks: 4,
  facilitiesBooked: 3,
  travelPlanned: 2,
};

// =============================================================================
// BUSINESS
// =============================================================================

const BUSINESS_EVENTS: CalendarEvent[] = [
  { id: 'be-1', title: 'Engineering Standup', date: 'Feb 17, 2026', time: '9:30 AM', type: 'meeting', location: 'Zoom', status: 'confirmed' },
  { id: 'be-2', title: 'Board Meeting — Q1 Review', date: 'Feb 19, 2026', time: '10:00 AM', type: 'meeting', location: 'HQ Conference Room', status: 'confirmed' },
  { id: 'be-3', title: 'Product Launch Rehearsal', date: 'Feb 20, 2026', time: '2:00 PM', type: 'event', location: 'Demo Lab', status: 'confirmed' },
  { id: 'be-4', title: 'Investor Call — Series A Update', date: 'Feb 21, 2026', time: '3:00 PM', type: 'meeting', location: 'Zoom', status: 'confirmed' },
  { id: 'be-5', title: 'All-Hands', date: 'Feb 18, 2026', time: '11:00 AM', type: 'meeting', location: 'Main Floor', status: 'confirmed' },
  { id: 'be-6', title: 'Product Launch Event', date: 'Feb 25, 2026', time: '6:00 PM', type: 'event', location: 'Event Space', status: 'tentative' },
  { id: 'be-7', title: 'Sprint Planning — Q2', date: 'Feb 24, 2026', time: '10:00 AM', type: 'meeting', location: 'Zoom', status: 'confirmed' },
  { id: 'be-8', title: 'Tax Filing Deadline', date: 'Mar 15, 2026', time: '11:59 PM', type: 'deadline', location: 'N/A', status: 'confirmed' },
];

const BUSINESS_TASKS: Task[] = [
  { id: 'bt-1', title: 'Q1 Financial Report Draft', assignee: 'CFO', dueDate: 'Feb 20', priority: 'high', status: 'in-progress', category: 'Finance' },
  { id: 'bt-2', title: 'Product release v2.1 final QA', assignee: 'Engineering Lead', dueDate: 'Feb 22', priority: 'high', status: 'in-progress', category: 'Product' },
  { id: 'bt-3', title: 'Hire senior backend engineer', assignee: 'HR Director', dueDate: 'Mar 1', priority: 'high', status: 'pending', category: 'Hiring' },
  { id: 'bt-4', title: 'Marketing campaign — launch assets', assignee: 'Marketing', dueDate: 'Feb 23', priority: 'medium', status: 'in-progress', category: 'Marketing' },
  { id: 'bt-5', title: 'Update investor deck', assignee: 'CEO', dueDate: 'Feb 19', priority: 'medium', status: 'completed', category: 'Fundraising' },
  { id: 'bt-6', title: 'Renew office lease', assignee: 'Operations', dueDate: 'Mar 15', priority: 'low', status: 'pending', category: 'Operations' },
];

const BUSINESS_FACILITIES: Facility[] = [
  { id: 'bf-1', name: 'Main Office — 3rd Floor', type: 'Office Space', capacity: 40, status: 'booked' },
  { id: 'bf-2', name: 'HQ Conference Room', type: 'Meeting Room', capacity: 12, status: 'booked', nextAvailable: 'Feb 17, 2:00 PM' },
  { id: 'bf-3', name: 'Co-Working Space (WeWork)', type: 'Flex Space', capacity: 20, status: 'available' },
  { id: 'bf-4', name: 'Event Space — Level 1', type: 'Event Venue', capacity: 150, status: 'available' },
];

const BUSINESS_EQUIPMENT: Equipment[] = [
  { id: 'beq-1', name: 'Server Rack (Production)', category: 'Infrastructure', quantity: 2, condition: 'good', lastChecked: 'Feb 10, 2026' },
  { id: 'beq-2', name: 'Employee Laptops', category: 'Hardware', quantity: 35, condition: 'good', lastChecked: 'Jan 25, 2026' },
  { id: 'beq-3', name: 'Presentation Equipment', category: 'AV', quantity: 4, condition: 'fair', lastChecked: 'Feb 5, 2026' },
];

const BUSINESS_TRAVEL: TravelPlan[] = [
  { id: 'btr-1', destination: 'Investor Roadshow — SF', date: 'Mar 3, 2026', returnDate: 'Mar 5, 2026', partySize: 3, status: 'booked', budget: 6500 },
  { id: 'btr-2', destination: 'Tech Conference — Austin, TX', date: 'Mar 15, 2026', returnDate: 'Mar 18, 2026', partySize: 5, status: 'planned', budget: 8200 },
];

const BUSINESS_SNAPSHOT: OperationsSnapshot = {
  upcomingEvents: 8,
  openTasks: 4,
  facilitiesBooked: 2,
  travelPlanned: 2,
};

// =============================================================================
// COMMUNITY (K-1)
// =============================================================================

const COMMUNITY_EVENTS: CalendarEvent[] = [
  { id: 'ke-1', title: 'Race Day — Round 1 COTA', date: 'Mar 1, 2026', time: '2:00 PM', type: 'game', location: 'Circuit of the Americas', status: 'confirmed' },
  { id: 'ke-2', title: 'Practice Session — Open Track', date: 'Feb 22, 2026', time: '10:00 AM', type: 'practice', location: 'K1 Speed Indoor', status: 'confirmed' },
  { id: 'ke-3', title: 'Tech Inspection — All Teams', date: 'Feb 28, 2026', time: '9:00 AM', type: 'event', location: 'Pit Lane', status: 'confirmed' },
  { id: 'ke-4', title: 'Driver Safety Briefing', date: 'Feb 28, 2026', time: '1:00 PM', type: 'meeting', location: 'Timing Tower', status: 'confirmed' },
  { id: 'ke-5', title: 'Qualifying — Round 1', date: 'Feb 28, 2026', time: '3:00 PM', type: 'game', location: 'Circuit of the Americas', status: 'confirmed' },
  { id: 'ke-6', title: 'Team Principals Meeting', date: 'Feb 20, 2026', time: '6:00 PM', type: 'meeting', location: 'Virtual', status: 'confirmed' },
];

const COMMUNITY_TASKS: Task[] = [
  { id: 'kt-1', title: 'Book COTA track rental — Round 1', assignee: 'James Whitfield', dueDate: 'Feb 18', priority: 'high', status: 'completed', category: 'Venues' },
  { id: 'kt-2', title: 'Car prep & safety checks — all karts', assignee: 'Chief Mechanic', dueDate: 'Feb 27', priority: 'high', status: 'in-progress', category: 'Equipment' },
  { id: 'kt-3', title: 'Timing system calibration', assignee: 'Maria Santos', dueDate: 'Feb 26', priority: 'high', status: 'pending', category: 'Technical' },
  { id: 'kt-4', title: 'Finalize broadcast partner contract', assignee: 'Marcus Kane', dueDate: 'Feb 22', priority: 'medium', status: 'in-progress', category: 'Media' },
  { id: 'kt-5', title: 'Print & ship race programs', assignee: 'Marketing', dueDate: 'Feb 25', priority: 'low', status: 'pending', category: 'Marketing' },
];

const COMMUNITY_FACILITIES: Facility[] = [
  { id: 'kf-1', name: 'Pit Lane — COTA', type: 'Pit Area', capacity: 8, status: 'booked' },
  { id: 'kf-2', name: 'Garage Bays 1-8', type: 'Team Garages', capacity: 8, status: 'available' },
  { id: 'kf-3', name: 'Timing Tower', type: 'Race Control', capacity: 15, status: 'booked', nextAvailable: 'Race Weekend' },
  { id: 'kf-4', name: 'Paddock Area', type: 'Hospitality', capacity: 300, status: 'available' },
];

const COMMUNITY_EQUIPMENT: Equipment[] = [
  { id: 'keq-1', name: 'Timing System (Transponders)', category: 'Timing', quantity: 24, condition: 'good', lastChecked: 'Feb 12, 2026' },
  { id: 'keq-2', name: 'Safety Equipment (Barriers/Extinguishers)', category: 'Safety', quantity: 40, condition: 'good', lastChecked: 'Feb 10, 2026' },
  { id: 'keq-3', name: 'Fuel Rigs & Stands', category: 'Pit Equipment', quantity: 8, condition: 'fair', lastChecked: 'Feb 8, 2026' },
  { id: 'keq-4', name: 'Team Radio Sets', category: 'Communications', quantity: 16, condition: 'good', lastChecked: 'Feb 5, 2026' },
];

const COMMUNITY_TRAVEL: TravelPlan[] = [
  { id: 'ktr-1', destination: 'COTA — Austin, TX', date: 'Feb 27, 2026', returnDate: 'Mar 2, 2026', partySize: 12, status: 'booked', budget: 9500 },
];

const COMMUNITY_SNAPSHOT: OperationsSnapshot = {
  upcomingEvents: 6,
  openTasks: 3,
  facilitiesBooked: 2,
  travelPlanned: 1,
};

// =============================================================================
// MODE RECORDS
// =============================================================================

export const OPERATIONS_EVENTS: Record<Mode, CalendarEvent[]> = {
  sports: SPORTS_EVENTS,
  church: CHURCH_EVENTS,
  education: EDUCATION_EVENTS,
  competition: COMMUNITY_EVENTS,
  business: BUSINESS_EVENTS,
};

export const OPERATIONS_TASKS: Record<Mode, Task[]> = {
  sports: SPORTS_TASKS,
  church: CHURCH_TASKS,
  education: EDUCATION_TASKS,
  competition: COMMUNITY_TASKS,
  business: BUSINESS_TASKS,
};

export const OPERATIONS_FACILITIES: Record<Mode, Facility[]> = {
  sports: SPORTS_FACILITIES,
  church: CHURCH_FACILITIES,
  education: EDUCATION_FACILITIES,
  competition: COMMUNITY_FACILITIES,
  business: BUSINESS_FACILITIES,
};

export const OPERATIONS_EQUIPMENT: Record<Mode, Equipment[]> = {
  sports: SPORTS_EQUIPMENT,
  church: CHURCH_EQUIPMENT,
  education: EDUCATION_EQUIPMENT,
  competition: COMMUNITY_EQUIPMENT,
  business: BUSINESS_EQUIPMENT,
};

export const OPERATIONS_TRAVEL: Record<Mode, TravelPlan[]> = {
  sports: SPORTS_TRAVEL,
  church: CHURCH_TRAVEL,
  education: EDUCATION_TRAVEL,
  competition: COMMUNITY_TRAVEL,
  business: BUSINESS_TRAVEL,
};

export const OPERATIONS_SNAPSHOTS: Record<Mode, OperationsSnapshot> = {
  sports: SPORTS_SNAPSHOT,
  church: CHURCH_SNAPSHOT,
  education: EDUCATION_SNAPSHOT,
  competition: COMMUNITY_SNAPSHOT,
  business: BUSINESS_SNAPSHOT,
};
