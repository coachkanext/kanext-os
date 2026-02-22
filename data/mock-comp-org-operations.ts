/**
 * Competition Organization Operations Mock Data
 * 10-tab operations hub for Competition mode:
 * Dashboard, Events, Logistics, Venues, Equipment, Scheduling, Incidents, Tasks, Reports, Settings.
 *
 * KaNeXT Church events at KaNeXT Arena, K-1 Invitational at KaNeXT Center, etc.
 */

// =============================================================================
// TYPES
// =============================================================================

/** Sub-tab identifier */
export type CompOpsTabId =
  | 'dashboard'
  | 'events'
  | 'logistics'
  | 'venues'
  | 'equipment'
  | 'scheduling'
  | 'incidents'
  | 'tasks'
  | 'reports'
  | 'settings';

export interface CompOpsTab {
  id: CompOpsTabId;
  label: string;
  icon: string;
}

/** Dashboard KPI block */
export interface OpsDashboardBlock {
  id: string;
  label: string;
  value: string | number;
  delta: string;
  icon: string;
  color: string;
}

/** Competition event */
export interface CompEvent {
  id: string;
  name: string;
  series: string;
  date: string;
  venue: string;
  status: 'scheduled' | 'setup' | 'live' | 'completed' | 'cancelled';
  type: 'match' | 'ceremony' | 'media-day' | 'practice';
  attendees: number;
  staff: number;
}

/** Logistics item */
export interface LogisticsItem {
  id: string;
  name: string;
  category: 'transport' | 'catering' | 'equipment' | 'accommodation' | 'security';
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'issue';
  event: string;
  vendor: string;
  cost: number;
  dueDate: string;
}

/** Competition venue */
export interface CompVenue {
  id: string;
  name: string;
  city: string;
  capacity: number;
  type: 'arena' | 'stadium' | 'field' | 'court' | 'track';
  status: 'available' | 'booked' | 'maintenance' | 'unavailable';
  amenities: string[];
  contactName: string;
}

/** Equipment */
export interface Equipment {
  id: string;
  name: string;
  category: 'scoring' | 'timing' | 'broadcast' | 'safety' | 'general';
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  assignedTo: string;
  lastInspected: string;
}

/** Schedule block */
export interface ScheduleBlock {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  event: string;
  venue: string;
  type: string;
  notes: string;
}

/** Incident */
export interface Incident {
  id: string;
  date: string;
  event: string;
  type: 'injury' | 'weather' | 'equipment' | 'security' | 'protest' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignee: string;
}

/** Operations task */
export interface OpsTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  event: string;
}

/** Operations report */
export interface OpsReport {
  id: string;
  name: string;
  type: string;
  date: string;
  format: 'PDF' | 'CSV' | 'XLSX';
}

/** Operations setting toggle */
export interface OpsSettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// =============================================================================
// TABS
// =============================================================================

export const COMP_OPS_TABS: CompOpsTab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'square.grid.2x2.fill' },
  { id: 'events', label: 'Events', icon: 'calendar.badge.clock' },
  { id: 'logistics', label: 'Logistics', icon: 'shippingbox.fill' },
  { id: 'venues', label: 'Venues', icon: 'building.2.fill' },
  { id: 'equipment', label: 'Equipment', icon: 'wrench.and.screwdriver.fill' },
  { id: 'scheduling', label: 'Scheduling', icon: 'clock.fill' },
  { id: 'incidents', label: 'Incidents', icon: 'exclamationmark.triangle.fill' },
  { id: 'tasks', label: 'Tasks', icon: 'checkmark.circle.fill' },
  { id: 'reports', label: 'Reports', icon: 'chart.bar.fill' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill' },
];

// =============================================================================
// SCOPE CHIPS
// =============================================================================

export const COMP_OPS_SCOPE_CHIPS = ['All Ops', 'Events', 'Logistics', 'Venues', 'Equipment'];

// =============================================================================
// STATUS COLOR MAPS
// =============================================================================

export const EVENT_STATUS_COLOR: Record<CompEvent['status'], string> = {
  scheduled: '#1D9BF0',
  setup: '#F59E0B',
  live: '#22C55E',
  completed: '#A1A1AA',
  cancelled: '#EF4444',
};

export const LOGISTICS_STATUS_COLOR: Record<LogisticsItem['status'], string> = {
  pending: '#F59E0B',
  confirmed: '#22C55E',
  'in-transit': '#1D9BF0',
  delivered: '#A1A1AA',
  issue: '#EF4444',
};

export const VENUE_STATUS_COLOR: Record<CompVenue['status'], string> = {
  available: '#22C55E',
  booked: '#1D9BF0',
  maintenance: '#F59E0B',
  unavailable: '#EF4444',
};

export const TASK_PRIORITY_COLOR: Record<OpsTask['priority'], string> = {
  low: '#A1A1AA',
  medium: '#1D9BF0',
  high: '#F59E0B',
  urgent: '#EF4444',
};

export const INCIDENT_SEVERITY_COLOR: Record<Incident['severity'], string> = {
  low: '#A1A1AA',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#EF4444',
};

export const TASK_STATUS_COLOR: Record<OpsTask['status'], string> = {
  todo: '#A1A1AA',
  'in-progress': '#1D9BF0',
  done: '#22C55E',
  blocked: '#EF4444',
};

export const INCIDENT_STATUS_COLOR: Record<Incident['status'], string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
  closed: '#A1A1AA',
};

export const EQUIPMENT_CONDITION_COLOR: Record<Equipment['condition'], string> = {
  excellent: '#22C55E',
  good: '#1D9BF0',
  fair: '#F59E0B',
  'needs-repair': '#EF4444',
};

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_DASHBOARD: OpsDashboardBlock[] = [
  { id: 'dash-1', label: 'Upcoming Events', value: 8, delta: '+2 this week', icon: 'calendar.badge.clock', color: '#1D9BF0' },
  { id: 'dash-2', label: 'Active Logistics', value: 14, delta: '3 in-transit', icon: 'shippingbox.fill', color: '#F59E0B' },
  { id: 'dash-3', label: 'Venue Utilization', value: '82%', delta: '+6% vs last month', icon: 'building.2.fill', color: '#22C55E' },
  { id: 'dash-4', label: 'Open Incidents', value: 3, delta: '1 critical', icon: 'exclamationmark.triangle.fill', color: '#EF4444' },
  { id: 'dash-5', label: 'Tasks Due Today', value: 5, delta: '2 urgent', icon: 'checkmark.circle.fill', color: '#1D9BF0' },
  { id: 'dash-6', label: 'Equipment Health', value: '94%', delta: '2 need repair', icon: 'wrench.and.screwdriver.fill', color: '#22C55E' },
];

const MOCK_EVENTS: CompEvent[] = [
  { id: 'evt-1', name: 'KaNeXT Church Championship — Men\'s Basketball', series: 'KaNeXT Church', date: 'Mar 15, 2026', venue: 'KaNeXT Arena', status: 'scheduled', type: 'match', attendees: 4200, staff: 85 },
  { id: 'evt-2', name: 'KaNeXT Church Championship — Women\'s Basketball', series: 'KaNeXT Church', date: 'Mar 16, 2026', venue: 'KaNeXT Arena', status: 'scheduled', type: 'match', attendees: 3800, staff: 82 },
  { id: 'evt-3', name: 'K-1 Invitational — Quarterfinals', series: 'K-1 Invitational', date: 'Mar 8, 2026', venue: 'KaNeXT Center', status: 'setup', type: 'match', attendees: 2400, staff: 60 },
  { id: 'evt-4', name: 'K-1 Invitational — Semifinals', series: 'K-1 Invitational', date: 'Mar 9, 2026', venue: 'KaNeXT Center', status: 'scheduled', type: 'match', attendees: 3100, staff: 65 },
  { id: 'evt-5', name: 'K-1 Invitational — Championship', series: 'K-1 Invitational', date: 'Mar 10, 2026', venue: 'KaNeXT Center', status: 'scheduled', type: 'match', attendees: 3500, staff: 72 },
  { id: 'evt-6', name: 'KaNeXT Church Media Day', series: 'KaNeXT Church', date: 'Mar 12, 2026', venue: 'KaNeXT Arena', status: 'scheduled', type: 'media-day', attendees: 350, staff: 40 },
  { id: 'evt-7', name: 'Opening Ceremony — K-1 Invitational', series: 'K-1 Invitational', date: 'Mar 7, 2026', venue: 'KaNeXT Center', status: 'completed', type: 'ceremony', attendees: 2800, staff: 55 },
  { id: 'evt-8', name: 'KaNeXT Church Teams Practice — Day 1', series: 'KaNeXT Church', date: 'Mar 13, 2026', venue: 'KaNeXT Arena', status: 'scheduled', type: 'practice', attendees: 0, staff: 30 },
  { id: 'evt-9', name: 'KaNeXT Church Teams Practice — Day 2', series: 'KaNeXT Church', date: 'Mar 14, 2026', venue: 'KaNeXT Arena', status: 'scheduled', type: 'practice', attendees: 0, staff: 30 },
  { id: 'evt-10', name: 'K-1 Invitational — First Round', series: 'K-1 Invitational', date: 'Mar 7, 2026', venue: 'KaNeXT Center', status: 'completed', type: 'match', attendees: 1900, staff: 58 },
  { id: 'evt-11', name: 'KaNeXT Church Awards Banquet', series: 'KaNeXT Church', date: 'Mar 17, 2026', venue: 'KaNeXT Arena', status: 'scheduled', type: 'ceremony', attendees: 500, staff: 35 },
  { id: 'evt-12', name: 'K-1 Invitational — Media Availability', series: 'K-1 Invitational', date: 'Mar 6, 2026', venue: 'KaNeXT Center', status: 'completed', type: 'media-day', attendees: 200, staff: 25 },
  { id: 'evt-13', name: 'KaNeXT Church — Women\'s Semifinals', series: 'KaNeXT Church', date: 'Mar 14, 2026', venue: 'KaNeXT Arena', status: 'scheduled', type: 'match', attendees: 3200, staff: 78 },
  { id: 'evt-14', name: 'All-Star Exhibition', series: 'K-1 Invitational', date: 'Mar 11, 2026', venue: 'KaNeXT Center', status: 'live', type: 'match', attendees: 2600, staff: 50 },
  { id: 'evt-15', name: 'KaNeXT Church Pre-Tournament Reception', series: 'KaNeXT Church', date: 'Mar 11, 2026', venue: 'KaNeXT Arena', status: 'cancelled', type: 'ceremony', attendees: 0, staff: 0 },
];

const MOCK_LOGISTICS: LogisticsItem[] = [
  { id: 'log-1', name: 'Team Charter Bus Fleet — KaNeXT Church', category: 'transport', status: 'confirmed', event: 'KaNeXT Church Championship', vendor: 'Premiere Charter Services', cost: 18500, dueDate: 'Mar 12, 2026' },
  { id: 'log-2', name: 'Catering — K-1 Quarterfinals', category: 'catering', status: 'confirmed', event: 'K-1 Invitational — QF', vendor: 'Blue Flame Catering', cost: 8200, dueDate: 'Mar 8, 2026' },
  { id: 'log-3', name: 'Scoreboard Transport Crate', category: 'equipment', status: 'in-transit', event: 'KaNeXT Church Championship', vendor: 'AV Logistics Co.', cost: 3400, dueDate: 'Mar 11, 2026' },
  { id: 'log-4', name: 'Hotel Block — Teams & Officials', category: 'accommodation', status: 'confirmed', event: 'KaNeXT Church Championship', vendor: 'Marriott Convention Center', cost: 42000, dueDate: 'Mar 12, 2026' },
  { id: 'log-5', name: 'Security Detail — Championship Finals', category: 'security', status: 'pending', event: 'KaNeXT Church Championship', vendor: 'Sentinel Security Group', cost: 12600, dueDate: 'Mar 15, 2026' },
  { id: 'log-6', name: 'Broadcast Equipment Van', category: 'equipment', status: 'in-transit', event: 'K-1 Invitational — SF', vendor: 'ESPN Production Services', cost: 5800, dueDate: 'Mar 8, 2026' },
  { id: 'log-7', name: 'Team Meals — KaNeXT Championship', category: 'catering', status: 'pending', event: 'K-1 Invitational — Final', vendor: 'Blue Flame Catering', cost: 6500, dueDate: 'Mar 10, 2026' },
  { id: 'log-8', name: 'Media Credentials & Lanyards', category: 'equipment', status: 'delivered', event: 'KaNeXT Church Media Day', vendor: 'PrintFast Solutions', cost: 1200, dueDate: 'Mar 10, 2026' },
  { id: 'log-9', name: 'VIP Shuttle Service', category: 'transport', status: 'confirmed', event: 'KaNeXT Church Championship', vendor: 'Executive Transport LLC', cost: 4800, dueDate: 'Mar 15, 2026' },
  { id: 'log-10', name: 'Portable Metal Detectors', category: 'security', status: 'delivered', event: 'K-1 Invitational', vendor: 'Sentinel Security Group', cost: 2200, dueDate: 'Mar 6, 2026' },
  { id: 'log-11', name: 'Hotel Block — K-1 Officials', category: 'accommodation', status: 'confirmed', event: 'K-1 Invitational', vendor: 'Hilton Garden Inn', cost: 15800, dueDate: 'Mar 6, 2026' },
  { id: 'log-12', name: 'Awards & Trophies Shipment', category: 'equipment', status: 'in-transit', event: 'KaNeXT Church Awards Banquet', vendor: 'Crown Trophy & Awards', cost: 4500, dueDate: 'Mar 15, 2026' },
  { id: 'log-13', name: 'Emergency Medical Kit Restock', category: 'equipment', status: 'issue', event: 'K-1 Invitational', vendor: 'MedSupply Direct', cost: 980, dueDate: 'Mar 7, 2026' },
  { id: 'log-14', name: 'Team Shuttle — Airport Transfers', category: 'transport', status: 'pending', event: 'KaNeXT Church Championship', vendor: 'Premiere Charter Services', cost: 7200, dueDate: 'Mar 12, 2026' },
  { id: 'log-15', name: 'Catering — Awards Banquet', category: 'catering', status: 'confirmed', event: 'KaNeXT Church Awards Banquet', vendor: 'Savory Events Group', cost: 11400, dueDate: 'Mar 17, 2026' },
  { id: 'log-16', name: 'Court Flooring Installation Crew', category: 'equipment', status: 'confirmed', event: 'KaNeXT Church Championship', vendor: 'Connor Sports', cost: 22000, dueDate: 'Mar 11, 2026' },
];

const MOCK_VENUES: CompVenue[] = [
  { id: 'ven-1', name: 'KaNeXT Arena', city: 'Miami, FL', capacity: 5200, type: 'arena', status: 'booked', amenities: ['LED Scoreboard', 'Press Box', 'Luxury Suites', 'Video Replay', 'Locker Rooms'], contactName: 'Marcus Reeves' },
  { id: 'ven-2', name: 'KaNeXT Center', city: 'Miami, FL', capacity: 3800, type: 'arena', status: 'booked', amenities: ['Daktronics Scoreboard', 'Media Room', 'Team Lounges', 'Training Facility'], contactName: 'Aisha Thompson' },
  { id: 'ven-3', name: 'KaNeXT Practice Courts', city: 'Miami, FL', capacity: 200, type: 'court', status: 'available', amenities: ['Film Room', 'Weight Room', 'Athletic Training'], contactName: 'David Okafor' },
  { id: 'ven-4', name: 'Bayfront Stadium', city: 'Miami, FL', capacity: 12000, type: 'stadium', status: 'available', amenities: ['Jumbotron', 'Concessions', 'VIP Lounge', 'Press Level'], contactName: 'Robert Dominguez' },
  { id: 'ven-5', name: 'Heritage Park Track Complex', city: 'Fort Lauderdale, FL', capacity: 4500, type: 'track', status: 'maintenance', amenities: ['Timing System', 'Throwing Cage', 'Jump Pit', 'Warm-Up Area'], contactName: 'Janet Michaels' },
  { id: 'ven-6', name: 'Coral Springs Sports Pavilion', city: 'Coral Springs, FL', capacity: 2200, type: 'arena', status: 'available', amenities: ['Scoreboard', 'Locker Rooms', 'Concessions'], contactName: 'Greg Sutton' },
  { id: 'ven-7', name: 'KaNeXT Outdoor Complex', city: 'Miami, FL', capacity: 1500, type: 'field', status: 'available', amenities: ['Press Box', 'Bleachers', 'LED Board'], contactName: 'David Okafor' },
  { id: 'ven-8', name: 'South Beach Convention Hall', city: 'Miami Beach, FL', capacity: 8000, type: 'arena', status: 'unavailable', amenities: ['Stage', 'Exhibit Hall', 'Green Room', 'AV Suite'], contactName: 'Vanessa Cruz' },
  { id: 'ven-9', name: 'Palm Gardens Fieldhouse', city: 'West Palm Beach, FL', capacity: 3000, type: 'court', status: 'available', amenities: ['Scoreboard', 'Locker Rooms', 'Athletic Training'], contactName: 'Lisa Hartmann' },
  { id: 'ven-10', name: 'Broward County Stadium', city: 'Fort Lauderdale, FL', capacity: 18000, type: 'stadium', status: 'available', amenities: ['Jumbotron', 'Luxury Suites', 'Press Box', 'Club Level'], contactName: 'James Walters' },
  { id: 'ven-11', name: 'KaNeXT Tennis Center', city: 'Miami, FL', capacity: 800, type: 'court', status: 'available', amenities: ['Scoreboard', 'Shade Structure', 'Officials Area'], contactName: 'David Okafor' },
  { id: 'ven-12', name: 'Homestead Motor Speedway Infield', city: 'Homestead, FL', capacity: 6000, type: 'field', status: 'unavailable', amenities: ['Timing Tower', 'Media Center', 'Staging Area'], contactName: 'Carlos Mendez' },
];

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', name: 'Daktronics Scoreboard — Main', category: 'scoring', quantity: 1, condition: 'excellent', assignedTo: 'KaNeXT Arena', lastInspected: 'Feb 28, 2026' },
  { id: 'eq-2', name: 'Daktronics Scoreboard — Auxiliary', category: 'scoring', quantity: 2, condition: 'good', assignedTo: 'KaNeXT Center', lastInspected: 'Feb 25, 2026' },
  { id: 'eq-3', name: 'Hawk-Eye Line Calling System', category: 'scoring', quantity: 1, condition: 'excellent', assignedTo: 'KaNeXT Arena', lastInspected: 'Mar 1, 2026' },
  { id: 'eq-4', name: 'Omega Timing Console', category: 'timing', quantity: 2, condition: 'excellent', assignedTo: 'Heritage Park Track', lastInspected: 'Feb 20, 2026' },
  { id: 'eq-5', name: 'TAG Heuer Shot Clock Set (4x)', category: 'timing', quantity: 4, condition: 'good', assignedTo: 'KaNeXT Arena', lastInspected: 'Feb 22, 2026' },
  { id: 'eq-6', name: 'ESPN Broadcast Camera Kit (8x)', category: 'broadcast', quantity: 8, condition: 'good', assignedTo: 'K-1 Invitational', lastInspected: 'Mar 2, 2026' },
  { id: 'eq-7', name: 'Courtside LED Display Panels (12x)', category: 'broadcast', quantity: 12, condition: 'excellent', assignedTo: 'KaNeXT Arena', lastInspected: 'Feb 27, 2026' },
  { id: 'eq-8', name: 'Portable PA System — Main', category: 'broadcast', quantity: 1, condition: 'good', assignedTo: 'KaNeXT Center', lastInspected: 'Feb 15, 2026' },
  { id: 'eq-9', name: 'AED Defibrillator Units (6x)', category: 'safety', quantity: 6, condition: 'excellent', assignedTo: 'All Venues', lastInspected: 'Mar 1, 2026' },
  { id: 'eq-10', name: 'Trauma Kit — Courtside', category: 'safety', quantity: 4, condition: 'fair', assignedTo: 'KaNeXT Arena / KaNeXT Center', lastInspected: 'Feb 10, 2026' },
  { id: 'eq-11', name: 'Portable Metal Detector Wands (20x)', category: 'safety', quantity: 20, condition: 'good', assignedTo: 'All Venues', lastInspected: 'Feb 18, 2026' },
  { id: 'eq-12', name: 'Folding Tables & Chairs Set', category: 'general', quantity: 50, condition: 'good', assignedTo: 'Media Day / Banquet', lastInspected: 'Jan 30, 2026' },
  { id: 'eq-13', name: 'Crowd Control Barriers (40x)', category: 'general', quantity: 40, condition: 'fair', assignedTo: 'All Venues', lastInspected: 'Feb 5, 2026' },
  { id: 'eq-14', name: 'Wireless Referee Mic System', category: 'broadcast', quantity: 3, condition: 'needs-repair', assignedTo: 'KaNeXT Arena', lastInspected: 'Feb 8, 2026' },
  { id: 'eq-15', name: 'Instant Replay Monitor Station', category: 'scoring', quantity: 2, condition: 'excellent', assignedTo: 'KaNeXT Arena', lastInspected: 'Mar 1, 2026' },
  { id: 'eq-16', name: 'Portable Basketball Goals (4x)', category: 'general', quantity: 4, condition: 'good', assignedTo: 'KaNeXT Center', lastInspected: 'Feb 12, 2026' },
  { id: 'eq-17', name: 'Fire Extinguisher Units (10x)', category: 'safety', quantity: 10, condition: 'excellent', assignedTo: 'All Venues', lastInspected: 'Mar 1, 2026' },
  { id: 'eq-18', name: 'Replay Server Rack', category: 'broadcast', quantity: 1, condition: 'needs-repair', assignedTo: 'KaNeXT Center', lastInspected: 'Feb 3, 2026' },
];

const MOCK_SCHEDULE: ScheduleBlock[] = [
  { id: 'sch-1', date: 'Mar 6, 2026', timeStart: '10:00 AM', timeEnd: '12:00 PM', event: 'K-1 Invitational — Media Availability', venue: 'KaNeXT Center', type: 'media-day', notes: 'Press only; credential check at 9:30 AM' },
  { id: 'sch-2', date: 'Mar 7, 2026', timeStart: '6:00 PM', timeEnd: '7:30 PM', event: 'Opening Ceremony — K-1 Invitational', venue: 'KaNeXT Center', type: 'ceremony', notes: 'Light show rehearsal at 4:00 PM' },
  { id: 'sch-3', date: 'Mar 7, 2026', timeStart: '8:00 PM', timeEnd: '10:30 PM', event: 'K-1 Invitational — First Round', venue: 'KaNeXT Center', type: 'match', notes: 'Games 1-4 back to back' },
  { id: 'sch-4', date: 'Mar 8, 2026', timeStart: '12:00 PM', timeEnd: '10:00 PM', event: 'K-1 Invitational — Quarterfinals', venue: 'KaNeXT Center', type: 'match', notes: '4 games; 45-min breaks between' },
  { id: 'sch-5', date: 'Mar 9, 2026', timeStart: '2:00 PM', timeEnd: '8:00 PM', event: 'K-1 Invitational — Semifinals', venue: 'KaNeXT Center', type: 'match', notes: '2 games; 1-hour break between' },
  { id: 'sch-6', date: 'Mar 10, 2026', timeStart: '7:00 PM', timeEnd: '10:00 PM', event: 'K-1 Invitational — Championship', venue: 'KaNeXT Center', type: 'match', notes: 'Trophy presentation post-game' },
  { id: 'sch-7', date: 'Mar 11, 2026', timeStart: '3:00 PM', timeEnd: '5:30 PM', event: 'All-Star Exhibition', venue: 'KaNeXT Center', type: 'match', notes: 'Dunk contest at halftime' },
  { id: 'sch-8', date: 'Mar 11, 2026', timeStart: '8:00 AM', timeEnd: '12:00 PM', event: 'KaNeXT Arena Court Install', venue: 'KaNeXT Arena', type: 'setup', notes: 'Connor Sports crew; logo paint 10 AM' },
  { id: 'sch-9', date: 'Mar 12, 2026', timeStart: '10:00 AM', timeEnd: '2:00 PM', event: 'KaNeXT Church Media Day', venue: 'KaNeXT Arena', type: 'media-day', notes: 'All 8 teams rotating 20-min slots' },
  { id: 'sch-10', date: 'Mar 13, 2026', timeStart: '9:00 AM', timeEnd: '5:00 PM', event: 'KaNeXT Church Teams Practice — Day 1', venue: 'KaNeXT Arena', type: 'practice', notes: '1-hour slots; shootaround schedule in notes' },
  { id: 'sch-11', date: 'Mar 14, 2026', timeStart: '9:00 AM', timeEnd: '5:00 PM', event: 'KaNeXT Church Teams Practice — Day 2', venue: 'KaNeXT Arena', type: 'practice', notes: 'Same rotation; film room available' },
  { id: 'sch-12', date: 'Mar 14, 2026', timeStart: '7:00 PM', timeEnd: '10:00 PM', event: 'KaNeXT Church — Women\'s Semifinals', venue: 'KaNeXT Arena', type: 'match', notes: '2 games; ESPN2 broadcast' },
  { id: 'sch-13', date: 'Mar 15, 2026', timeStart: '7:00 PM', timeEnd: '10:30 PM', event: 'KaNeXT Church Championship — Men\'s Basketball', venue: 'KaNeXT Arena', type: 'match', notes: 'ESPN broadcast; trophy ceremony on-court' },
  { id: 'sch-14', date: 'Mar 16, 2026', timeStart: '3:00 PM', timeEnd: '6:30 PM', event: 'KaNeXT Church Championship — Women\'s Basketball', venue: 'KaNeXT Arena', type: 'match', notes: 'ESPN2 broadcast; trophy ceremony on-court' },
  { id: 'sch-15', date: 'Mar 17, 2026', timeStart: '6:00 PM', timeEnd: '9:00 PM', event: 'KaNeXT Church Awards Banquet', venue: 'KaNeXT Arena', type: 'ceremony', notes: 'Formal attire; cocktail hour 5:00 PM' },
  { id: 'sch-16', date: 'Mar 18, 2026', timeStart: '8:00 AM', timeEnd: '4:00 PM', event: 'Post-Tournament Teardown', venue: 'KaNeXT Arena', type: 'setup', notes: 'Court removal, signage, AV breakdown' },
];

const MOCK_INCIDENTS: Incident[] = [
  { id: 'inc-1', date: 'Mar 7, 2026', event: 'K-1 Invitational — First Round', type: 'injury', severity: 'medium', description: 'Player twisted ankle during warm-ups; cleared by medical after evaluation', status: 'resolved', assignee: 'Dr. Patel' },
  { id: 'inc-2', date: 'Mar 7, 2026', event: 'Opening Ceremony', type: 'equipment', severity: 'low', description: 'Stage left speaker intermittent static; backup speaker swapped in', status: 'closed', assignee: 'AV Team' },
  { id: 'inc-3', date: 'Mar 8, 2026', event: 'K-1 Invitational — QF', type: 'security', severity: 'high', description: 'Unauthorized individuals attempted court-level access with fake credentials', status: 'investigating', assignee: 'Sentinel Security' },
  { id: 'inc-4', date: 'Mar 8, 2026', event: 'K-1 Invitational — QF', type: 'equipment', severity: 'critical', description: 'Replay server crashed mid-game; manual officiating invoked until restart', status: 'open', assignee: 'Tech Ops' },
  { id: 'inc-5', date: 'Mar 6, 2026', event: 'K-1 Media Availability', type: 'other', severity: 'low', description: 'WiFi congestion in media room causing upload delays; bandwidth reallocated', status: 'resolved', assignee: 'IT Support' },
  { id: 'inc-6', date: 'Mar 9, 2026', event: 'K-1 Invitational — SF', type: 'weather', severity: 'medium', description: 'Severe thunderstorm advisory; outdoor overflow parking lot closed temporarily', status: 'resolved', assignee: 'Facility Ops' },
  { id: 'inc-7', date: 'Mar 7, 2026', event: 'K-1 Invitational — First Round', type: 'injury', severity: 'high', description: 'Spectator in Section 112 required EMT assistance; transported to hospital', status: 'resolved', assignee: 'EMS Team' },
  { id: 'inc-8', date: 'Mar 10, 2026', event: 'K-1 Invitational — Championship', type: 'protest', severity: 'medium', description: 'Small group of demonstrators at east entrance; peacefully dispersed', status: 'closed', assignee: 'Sentinel Security' },
  { id: 'inc-9', date: 'Mar 11, 2026', event: 'All-Star Exhibition', type: 'equipment', severity: 'low', description: 'Shot clock display flickered briefly; reset resolved the issue', status: 'closed', assignee: 'Tech Ops' },
  { id: 'inc-10', date: 'Mar 8, 2026', event: 'K-1 Invitational — QF', type: 'injury', severity: 'low', description: 'Minor cut on player\'s hand from loose floor bolt; floor crew checked area', status: 'closed', assignee: 'Medical Staff' },
  { id: 'inc-11', date: 'Mar 9, 2026', event: 'K-1 Invitational — SF', type: 'security', severity: 'medium', description: 'Altercation between fan groups in concourse level; separated by security', status: 'resolved', assignee: 'Sentinel Security' },
  { id: 'inc-12', date: 'Mar 11, 2026', event: 'All-Star Exhibition', type: 'other', severity: 'low', description: 'Concession vendor ran out of water bottles; emergency restock arranged', status: 'resolved', assignee: 'Vendor Ops' },
];

const MOCK_TASKS: OpsTask[] = [
  { id: 'tsk-1', title: 'Confirm KaNeXT Church championship court branding', assignee: 'Marcus Reeves', dueDate: 'Mar 10, 2026', priority: 'urgent', status: 'in-progress', event: 'KaNeXT Church Championship' },
  { id: 'tsk-2', title: 'Distribute media credentials for KaNeXT Church Media Day', assignee: 'Aisha Thompson', dueDate: 'Mar 11, 2026', priority: 'high', status: 'todo', event: 'KaNeXT Church Media Day' },
  { id: 'tsk-3', title: 'Verify hotel block rooming list', assignee: 'Sandra Wen', dueDate: 'Mar 10, 2026', priority: 'high', status: 'in-progress', event: 'KaNeXT Church Championship' },
  { id: 'tsk-4', title: 'Finalize KaNeXT Championship trophy engraving', assignee: 'Carlos Mendez', dueDate: 'Mar 9, 2026', priority: 'urgent', status: 'todo', event: 'K-1 Invitational' },
  { id: 'tsk-5', title: 'Test Hawk-Eye system calibration', assignee: 'Tech Ops', dueDate: 'Mar 12, 2026', priority: 'high', status: 'todo', event: 'KaNeXT Church Championship' },
  { id: 'tsk-6', title: 'Coordinate shuttle schedule for team arrivals', assignee: 'David Okafor', dueDate: 'Mar 12, 2026', priority: 'medium', status: 'todo', event: 'KaNeXT Church Championship' },
  { id: 'tsk-7', title: 'Repair wireless referee mic system', assignee: 'AV Team', dueDate: 'Mar 11, 2026', priority: 'urgent', status: 'blocked', event: 'KaNeXT Church Championship' },
  { id: 'tsk-8', title: 'Update venue signage for KaNeXT Church branding', assignee: 'Facility Ops', dueDate: 'Mar 11, 2026', priority: 'medium', status: 'in-progress', event: 'KaNeXT Church Championship' },
  { id: 'tsk-9', title: 'Submit security deployment plan to local PD', assignee: 'Sentinel Security', dueDate: 'Mar 13, 2026', priority: 'high', status: 'todo', event: 'KaNeXT Church Championship' },
  { id: 'tsk-10', title: 'Inspect all AED units pre-tournament', assignee: 'Medical Staff', dueDate: 'Mar 12, 2026', priority: 'high', status: 'done', event: 'All Events' },
  { id: 'tsk-11', title: 'Set up press conference backdrop', assignee: 'Aisha Thompson', dueDate: 'Mar 12, 2026', priority: 'medium', status: 'todo', event: 'KaNeXT Church Media Day' },
  { id: 'tsk-12', title: 'Confirm catering headcount for awards banquet', assignee: 'Sandra Wen', dueDate: 'Mar 14, 2026', priority: 'medium', status: 'todo', event: 'KaNeXT Church Awards Banquet' },
  { id: 'tsk-13', title: 'Replace replay server at KaNeXT Center', assignee: 'Tech Ops', dueDate: 'Mar 9, 2026', priority: 'urgent', status: 'in-progress', event: 'K-1 Invitational' },
  { id: 'tsk-14', title: 'Print & distribute event programs (5000 copies)', assignee: 'PrintFast Solutions', dueDate: 'Mar 13, 2026', priority: 'low', status: 'todo', event: 'KaNeXT Church Championship' },
  { id: 'tsk-15', title: 'Arrange post-tournament court teardown crew', assignee: 'Facility Ops', dueDate: 'Mar 16, 2026', priority: 'low', status: 'todo', event: 'Post-Tournament' },
  { id: 'tsk-16', title: 'File insurance claim for damaged crowd barrier', assignee: 'Admin', dueDate: 'Mar 20, 2026', priority: 'low', status: 'todo', event: 'General' },
];

const MOCK_REPORTS: OpsReport[] = [
  { id: 'rpt-1', name: 'K-1 Invitational — Post-Event Summary', type: 'Event Report', date: 'Mar 11, 2026', format: 'PDF' },
  { id: 'rpt-2', name: 'Venue Utilization Report — Q1 2026', type: 'Utilization', date: 'Mar 1, 2026', format: 'XLSX' },
  { id: 'rpt-3', name: 'Incident Log — K-1 Invitational', type: 'Incident Report', date: 'Mar 11, 2026', format: 'PDF' },
  { id: 'rpt-4', name: 'Logistics Cost Breakdown — KaNeXT Church', type: 'Financial', date: 'Mar 10, 2026', format: 'XLSX' },
  { id: 'rpt-5', name: 'Equipment Condition Audit — March 2026', type: 'Audit', date: 'Mar 5, 2026', format: 'PDF' },
  { id: 'rpt-6', name: 'Security Deployment Plan — KaNeXT Church Championship', type: 'Operations', date: 'Mar 12, 2026', format: 'PDF' },
  { id: 'rpt-7', name: 'Attendance & Revenue — K-1 First Round', type: 'Financial', date: 'Mar 8, 2026', format: 'CSV' },
  { id: 'rpt-8', name: 'Vendor Performance Scorecard — Q1', type: 'Vendor', date: 'Feb 28, 2026', format: 'XLSX' },
  { id: 'rpt-9', name: 'Staff Scheduling Overview — March', type: 'Operations', date: 'Mar 1, 2026', format: 'CSV' },
  { id: 'rpt-10', name: 'Media Coverage Recap — K-1 Invitational', type: 'Media', date: 'Mar 11, 2026', format: 'PDF' },
  { id: 'rpt-11', name: 'Catering & Hospitality Summary', type: 'Operations', date: 'Mar 10, 2026', format: 'PDF' },
  { id: 'rpt-12', name: 'Transportation Manifest — KaNeXT Church Teams', type: 'Logistics', date: 'Mar 12, 2026', format: 'CSV' },
];

const MOCK_SETTINGS: OpsSettingToggle[] = [
  { id: 'set-1', label: 'Auto-assign incidents to on-duty staff', description: 'Incidents are automatically routed to the on-duty operations lead', enabled: true },
  { id: 'set-2', label: 'Send logistics status alerts', description: 'Push notifications when logistics items change status', enabled: true },
  { id: 'set-3', label: 'Require dual approval for high-cost logistics', description: 'Items over $10,000 require two approvals', enabled: true },
  { id: 'set-4', label: 'Enable venue availability calendar', description: 'Show real-time venue booking status in the scheduling tab', enabled: true },
  { id: 'set-5', label: 'Auto-generate post-event reports', description: 'Automatically create event summary reports after completion', enabled: false },
  { id: 'set-6', label: 'Equipment inspection reminders', description: 'Send reminders when equipment is due for inspection', enabled: true },
  { id: 'set-7', label: 'Incident escalation notifications', description: 'Notify leadership for high and critical severity incidents', enabled: true },
  { id: 'set-8', label: 'Allow task self-assignment', description: 'Team members can assign unassigned tasks to themselves', enabled: false },
];

// =============================================================================
// ACTIVITY FEED (for Dashboard)
// =============================================================================

export interface ActivityFeedItem {
  id: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

const MOCK_ACTIVITY_FEED: ActivityFeedItem[] = [
  { id: 'af-1', description: 'Replay server crash reported at KaNeXT Center', timestamp: '12 min ago', icon: 'exclamationmark.triangle.fill', color: '#EF4444' },
  { id: 'af-2', description: 'Scoreboard transport crate shipped — ETA Mar 11', timestamp: '34 min ago', icon: 'shippingbox.fill', color: '#1D9BF0' },
  { id: 'af-3', description: 'Hawk-Eye system calibration test completed', timestamp: '1h ago', icon: 'checkmark.circle.fill', color: '#22C55E' },
  { id: 'af-4', description: 'Hotel block rooming list verified (148 rooms)', timestamp: '2h ago', icon: 'building.2.fill', color: '#1D9BF0' },
  { id: 'af-5', description: 'K-1 Invitational Opening Ceremony marked complete', timestamp: '3h ago', icon: 'calendar.badge.clock', color: '#22C55E' },
  { id: 'af-6', description: 'Security detail for KaNeXT Church finals still pending approval', timestamp: '4h ago', icon: 'shield.fill', color: '#F59E0B' },
  { id: 'af-7', description: 'Awards & trophies shipment now in transit', timestamp: '5h ago', icon: 'shippingbox.fill', color: '#1D9BF0' },
  { id: 'af-8', description: 'AED inspection completed across all venues', timestamp: '6h ago', icon: 'checkmark.circle.fill', color: '#22C55E' },
];

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export interface CompOpsData {
  dashboard: OpsDashboardBlock[];
  events: CompEvent[];
  logistics: LogisticsItem[];
  venues: CompVenue[];
  equipment: Equipment[];
  schedule: ScheduleBlock[];
  incidents: Incident[];
  tasks: OpsTask[];
  reports: OpsReport[];
  settings: OpsSettingToggle[];
  activityFeed: ActivityFeedItem[];
}

export function getCompOpsData(_scope: string): CompOpsData {
  return {
    dashboard: MOCK_DASHBOARD,
    events: MOCK_EVENTS,
    logistics: MOCK_LOGISTICS,
    venues: MOCK_VENUES,
    equipment: MOCK_EQUIPMENT,
    schedule: MOCK_SCHEDULE,
    incidents: MOCK_INCIDENTS,
    tasks: MOCK_TASKS,
    reports: MOCK_REPORTS,
    settings: MOCK_SETTINGS,
    activityFeed: MOCK_ACTIVITY_FEED,
  };
}
