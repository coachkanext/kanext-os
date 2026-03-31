/**
 * CEO / Commissioner Competition Mode — Mock Data
 * Executive-level data for Dashboard, Calendar (4 sub-pills), and Series overview.
 * All data is from the PBD Podcast League CEO/Commissioner perspective.
 */

// =============================================================================
// SHARED TYPES
// =============================================================================

export type CEOAlertSeverity = 'critical' | 'warning' | 'info';
export type ApprovalStatus = 'pending' | 'approved' | 'denied';
export type GateStatus = 'cleared' | 'at_risk' | 'blocked' | 'upcoming';
export type SessionLiveState = 'not_started' | 'live' | 'completed' | 'delayed' | 'red_flagged';
export type OpsSubview = 'command' | 'board' | 'approvals' | 'live_log';
export type EventReadiness = 'green' | 'yellow' | 'red' | 'not_assessed';

// =============================================================================
// CEO AGENDA TYPES (Calendar → Agenda)
// =============================================================================

export interface CEONowItem {
  id: string;
  label: string;
  detail: string;
  urgency: 'critical' | 'high' | 'normal';
  icon: string;
}

export interface HardGate {
  id: string;
  title: string;
  deadline: string;
  owner: string;
  status: GateStatus;
  consequence: string;
}

export interface AgendaSession {
  id: string;
  name: string;
  time: string;
  court: string;
  liveState: SessionLiveState;
  icon: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  requestedBy: string;
  requestDate: string;
  category: 'financial' | 'regulatory' | 'operational' | 'personnel' | 'media';
  amount?: string;
  status: ApprovalStatus;
  urgency: 'critical' | 'high' | 'normal';
}

export interface RiskWatchItem {
  id: string;
  title: string;
  riskLevel: 'critical' | 'elevated' | 'monitoring';
  owner: string;
  detail: string;
  mitigationPlan: string;
}

// =============================================================================
// CEO SESSIONS TYPES (Calendar → Sessions)
// =============================================================================

export interface SessionGate {
  id: string;
  label: string;
  time: string;
  status: GateStatus;
  owner: string;
}

export interface RunOfShowSession {
  id: string;
  name: string;
  type: 'setup' | 'inspection' | 'practice' | 'qualifying' | 'game' | 'ceremony' | 'broadcast' | 'debrief';
  startTime: string;
  endTime: string;
  liveState: SessionLiveState;
  court: string;
  gates: SessionGate[];
  notes?: string;
}

// =============================================================================
// CEO EVENTS TYPES (Calendar → Events)
// =============================================================================

export interface EventReadinessItem {
  id: string;
  eventName: string;
  date: string;
  venue: string;
  location: string;
  readiness: EventReadiness;
  readinessScore: number; // 0-100
  opsReadiness: number;
  complianceReadiness: number;
  revenueReadiness: number;
  broadcastReadiness: number;
  status: 'completed' | 'live' | 'upcoming';
  ticketsSold?: number;
  ticketsCapacity?: number;
  sponsorActivations?: number;
}

// =============================================================================
// CEO OPS TYPES (Calendar → Ops)
// =============================================================================

export interface CommandItem {
  id: string;
  area: string;
  status: 'green' | 'yellow' | 'red';
  label: string;
  detail: string;
  owner: string;
}

export interface BoardItem {
  id: string;
  title: string;
  category: 'decision' | 'report' | 'action_item' | 'escalation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'completed' | 'deferred';
}

export interface OpsApproval {
  id: string;
  title: string;
  requestedBy: string;
  category: string;
  amount?: string;
  submittedAt: string;
  status: ApprovalStatus;
}

export interface LiveLogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  acknowledged: boolean;
}

// =============================================================================
// SERIES OVERVIEW TYPES (Organization → Series)
// =============================================================================

export interface SeasonBlueprint {
  totalEvents: number;
  completed: number;
  remaining: number;
  seasonStart: string;
  seasonEnd: string;
  currentPhase: string;
  championshipLeader: string;
  championshipGap: string;
}

export interface EventCalendarPulse {
  nextEvent: string;
  nextEventDate: string;
  nextEventVenue: string;
  eventsThisMonth: number;
  avgReadinessScore: number;
}

export interface TeamsPulse {
  totalTeams: number;
  fullyCompliant: number;
  warnings: number;
  nonCompliant: number;
  avgBudgetUtilization: string;
}

export interface RevenueDeliveryPulse {
  totalRevenueYTD: string;
  revenueTarget: string;
  pctOfTarget: number;
  ticketRevenueYTD: string;
  sponsorRevenueYTD: string;
  broadcastRevenueYTD: string;
  merchandiseRevenueYTD: string;
}

export interface IntegrityCompliancePulse {
  overallComplianceRate: number;
  openInvestigations: number;
  pendingApprovals: number;
  recentPenalties: number;
  ruleChangesThisSeason: number;
  nextAuditDate: string;
}

export interface ExecutiveHistoryEntry {
  id: string;
  date: string;
  action: string;
  actor: string;
  detail: string;
  category: 'decision' | 'approval' | 'penalty' | 'policy' | 'financial' | 'operational';
}

// =============================================================================
// CEO AGENDA DATA
// =============================================================================

export const CEO_NOW: CEONowItem[] = [
  { id: 'cn-1', label: 'Qualifying LIVE', detail: 'Thunder Classic — Portland International Gameway · Q2 in progress', urgency: 'critical', icon: 'flag.checkered' },
  { id: 'cn-2', label: 'Shadow GP Engine Seal Review', detail: 'Seal #4 lab results expected within 2 hours — decision required before game', urgency: 'critical', icon: 'exclamationmark.triangle.fill' },
  { id: 'cn-3', label: 'Broadcast Pre-Show in 45m', detail: 'ESPN3 pre-game coverage begins at 1:15 PM — commissioner interview slot confirmed', urgency: 'high', icon: 'video.fill' },
];

export const HARD_GATES: HardGate[] = [
  { id: 'hg-1', title: 'Game Start Clearance', deadline: 'Sun 1:30 PM', owner: 'Chief Steward', status: 'upcoming', consequence: 'Game cannot proceed without all safety certifications verified' },
  { id: 'hg-2', title: 'Fire Suppression Re-Certification', deadline: 'Sat 5:00 PM', owner: 'Safety Director', status: 'at_risk', consequence: 'FIA mandate — league operations suspended if not resolved by event weekend' },
  { id: 'hg-3', title: 'Shadow GP Engine Decision', deadline: 'Sat 6:00 PM', owner: 'Commissioner', status: 'blocked', consequence: 'Team excluded from game if non-compliant engine not resolved or swapped' },
  { id: 'hg-4', title: 'Pirelli 2027 Renewal LOI', deadline: 'Jul 31, 2026', owner: 'Commercial Director', status: 'upcoming', consequence: 'Tire supply contract expires — must secure renewal or identify alternative' },
  { id: 'hg-5', title: 'Portland Game Results Certification', deadline: 'Sun 6:00 PM', owner: 'Chief Steward', status: 'upcoming', consequence: 'Championship standings cannot be updated until results are officially certified' },
];

export const AGENDA_SESSIONS: AgendaSession[] = [
  { id: 'as-1', name: 'Qualifying — Q1', time: '10:00 AM', court: 'Portland International Gameway', liveState: 'completed', icon: 'stopwatch.fill' },
  { id: 'as-2', name: 'Qualifying — Q2', time: '10:45 AM', court: 'Portland International Gameway', liveState: 'live', icon: 'stopwatch.fill' },
  { id: 'as-3', name: 'Qualifying — Q3', time: '11:15 AM', court: 'Portland International Gameway', liveState: 'not_started', icon: 'stopwatch.fill' },
  { id: 'as-4', name: 'Broadcast Pre-Show', time: '1:15 PM', court: 'Portland International Gameway', liveState: 'not_started', icon: 'video.fill' },
  { id: 'as-5', name: 'Thunder Classic — Feature Game', time: '2:00 PM', court: 'Portland International Gameway', liveState: 'not_started', icon: 'flag.checkered' },
  { id: 'as-6', name: 'Post-Game Podium Ceremony', time: '4:15 PM', court: 'Portland International Gameway', liveState: 'not_started', icon: 'trophy.fill' },
];

export const CEO_APPROVALS: ApprovalItem[] = [
  { id: 'ap-1', title: 'Emergency tire batch inspection — all teams', requestedBy: 'Chief Inspector', requestDate: 'Today', category: 'operational', urgency: 'critical', status: 'pending' },
  { id: 'ap-2', title: 'Shadow GP engine swap authorization', requestedBy: 'Tech Director', requestDate: 'Today', category: 'regulatory', urgency: 'critical', status: 'pending' },
  { id: 'ap-3', title: 'Q4 broadcast production budget increase ($45K)', requestedBy: 'Media Director', requestDate: 'Jul 26', category: 'financial', amount: '$45,000', urgency: 'high', status: 'pending' },
  { id: 'ap-4', title: 'New official appointment — Portland game steward', requestedBy: 'Head of Officiating', requestDate: 'Jul 25', category: 'personnel', urgency: 'normal', status: 'pending' },
  { id: 'ap-5', title: 'Sponsor activation variance — Nike courtside lounge', requestedBy: 'Partnerships Director', requestDate: 'Jul 24', category: 'media', amount: '$12,500', urgency: 'normal', status: 'pending' },
];

export const RISK_WATCH: RiskWatchItem[] = [
  { id: 'rw-1', title: 'Shadow GP Engine Integrity', riskLevel: 'critical', owner: 'Chief Inspector', detail: 'Engine seal #4 thermal damage on SHD-Phantom V2. Lab analysis pending. Could indicate systemic issue across team fleet.', mitigationPlan: 'Isolate affected unit; mandate inspection of all SHD engines before game clearance.' },
  { id: 'rw-2', title: 'Fire Suppression Certification Quarterse', riskLevel: 'critical', owner: 'Safety Director', detail: 'Annual fire suppression re-certification overdue since Jul 15. FIA requires current certification for all court events.', mitigationPlan: 'Expedited re-inspection scheduled Jul 29. Temporary waiver requested from FIA.' },
  { id: 'rw-3', title: 'Williams Medical Clearance', riskLevel: 'elevated', owner: 'Medical Panel', detail: 'Andre Williams post-incident observation period ongoing. Full recertification required before next game start.', mitigationPlan: 'Medical clearance assessment scheduled 48h before Portland game.' },
  { id: 'rw-4', title: 'Tire Supplier Reliability', riskLevel: 'monitoring', owner: 'Tech Director', detail: 'Williams blow-out under investigation. Tire pressure data across all teams under review.', mitigationPlan: 'All teams instructed to check pressures. Supplier batch analysis underway.' },
];

// =============================================================================
// CEO SESSIONS DATA (Run-of-Show)
// =============================================================================

export const RUN_OF_SHOW: RunOfShowSession[] = [
  {
    id: 'ros-1', name: 'Courtside & Pit Lane Open', type: 'setup',
    startTime: 'Thu 7:00 AM', endTime: 'Thu 8:00 AM', liveState: 'completed',
    court: 'Portland International Gameway',
    gates: [
      { id: 'g-1a', label: 'Courtside access verified', time: 'Thu 7:00 AM', status: 'cleared', owner: 'Ops Manager' },
      { id: 'g-1b', label: 'Power + comms live', time: 'Thu 7:30 AM', status: 'cleared', owner: 'Facilities' },
    ],
  },
  {
    id: 'ros-2', name: 'Pre-Game Technical Inspection', type: 'inspection',
    startTime: 'Thu 1:00 PM', endTime: 'Thu 5:00 PM', liveState: 'completed',
    court: 'Portland International Gameway',
    gates: [
      { id: 'g-2a', label: 'All 16 karts inspected', time: 'Thu 3:00 PM', status: 'cleared', owner: 'Chief Inspector' },
      { id: 'g-2b', label: 'Engine seals verified', time: 'Thu 4:30 PM', status: 'at_risk', owner: 'Chief Inspector' },
    ],
    notes: 'SHD-Phantom V2 engine seal #4 flagged — under review',
  },
  {
    id: 'ros-3', name: 'Free Practice 1', type: 'practice',
    startTime: 'Fri 9:00 AM', endTime: 'Fri 10:00 AM', liveState: 'completed',
    court: 'Portland International Gameway',
    gates: [
      { id: 'g-3a', label: 'Court clear & marshals posted', time: 'Fri 8:45 AM', status: 'cleared', owner: 'Game Director' },
    ],
  },
  {
    id: 'ros-4', name: 'Free Practice 2', type: 'practice',
    startTime: 'Fri 2:00 PM', endTime: 'Fri 3:00 PM', liveState: 'completed',
    court: 'Portland International Gameway',
    gates: [
      { id: 'g-4a', label: 'Court clear & marshals posted', time: 'Fri 1:45 PM', status: 'cleared', owner: 'Game Director' },
    ],
  },
  {
    id: 'ros-5', name: 'Qualifying', type: 'qualifying',
    startTime: 'Sat 10:00 AM', endTime: 'Sat 11:30 AM', liveState: 'live',
    court: 'Portland International Gameway',
    gates: [
      { id: 'g-5a', label: 'All teams confirmed entry', time: 'Sat 9:30 AM', status: 'cleared', owner: 'Game Director' },
      { id: 'g-5b', label: 'Broadcast feed live', time: 'Sat 9:55 AM', status: 'cleared', owner: 'Broadcast Director' },
      { id: 'g-5c', label: 'Results certified', time: 'Sat 11:45 AM', status: 'upcoming', owner: 'Chief Steward' },
    ],
  },
  {
    id: 'ros-6', name: 'Broadcast Pre-Show', type: 'broadcast',
    startTime: 'Sun 1:15 PM', endTime: 'Sun 1:55 PM', liveState: 'not_started',
    court: 'Portland International Gameway',
    gates: [
      { id: 'g-6a', label: 'Commissioner interview confirmed', time: 'Sun 12:30 PM', status: 'upcoming', owner: 'Media Director' },
      { id: 'g-6b', label: 'All camera positions manned', time: 'Sun 1:00 PM', status: 'upcoming', owner: 'Broadcast Director' },
    ],
  },
  {
    id: 'ros-7', name: 'Thunder Classic — Feature Game', type: 'game',
    startTime: 'Sun 2:00 PM', endTime: 'Sun 4:00 PM', liveState: 'not_started',
    court: 'Portland International Gameway',
    gates: [
      { id: 'g-7a', label: 'All karts passed final tech check', time: 'Sun 12:00 PM', status: 'upcoming', owner: 'Chief Inspector' },
      { id: 'g-7b', label: 'Medical team on standby', time: 'Sun 1:30 PM', status: 'upcoming', owner: 'Medical Director' },
      { id: 'g-7c', label: 'Game start clearance', time: 'Sun 1:50 PM', status: 'upcoming', owner: 'Game Director' },
      { id: 'g-7d', label: 'Results certified', time: 'Sun 4:30 PM', status: 'upcoming', owner: 'Chief Steward' },
    ],
  },
  {
    id: 'ros-8', name: 'Post-Game Podium & Debrief', type: 'ceremony',
    startTime: 'Sun 4:15 PM', endTime: 'Sun 5:30 PM', liveState: 'not_started',
    court: 'Portland International Gameway',
    gates: [
      { id: 'g-8a', label: 'Podium setup complete', time: 'Sun 3:00 PM', status: 'upcoming', owner: 'Events Manager' },
      { id: 'g-8b', label: 'Trophy sponsor branding verified', time: 'Sun 3:30 PM', status: 'upcoming', owner: 'Partnerships' },
    ],
  },
];

// =============================================================================
// CEO EVENTS DATA (Season Map)
// =============================================================================

export const EVENT_READINESS_MAP: EventReadinessItem[] = [
  { id: 'er-1', eventName: 'Laguna Seca Grand Prix', date: 'Jan 18, 2026', venue: 'WeatherTech Gameway', location: 'Monterey, CA', readiness: 'green', readinessScore: 98, opsReadiness: 100, complianceReadiness: 100, revenueReadiness: 96, broadcastReadiness: 95, status: 'completed', ticketsSold: 4200, ticketsCapacity: 4500, sponsorActivations: 6 },
  { id: 'er-2', eventName: 'Sonoma Sprint', date: 'Feb 8, 2026', venue: 'Sonoma Gameway', location: 'Sonoma, CA', readiness: 'green', readinessScore: 95, opsReadiness: 96, complianceReadiness: 100, revenueReadiness: 92, broadcastReadiness: 92, status: 'completed', ticketsSold: 3800, ticketsCapacity: 4000, sponsorActivations: 5 },
  { id: 'er-3', eventName: 'COTA Endurance 500', date: 'Feb 22, 2026', venue: 'Circuit of the Americas', location: 'Austin, TX', readiness: 'green', readinessScore: 97, opsReadiness: 98, complianceReadiness: 100, revenueReadiness: 95, broadcastReadiness: 96, status: 'completed', ticketsSold: 6100, ticketsCapacity: 6500, sponsorActivations: 8 },
  { id: 'er-4', eventName: 'Barber Invitational', date: 'Mar 15, 2026', venue: 'Barber Motorsports Park', location: 'Birmingham, AL', readiness: 'green', readinessScore: 94, opsReadiness: 95, complianceReadiness: 100, revenueReadiness: 90, broadcastReadiness: 92, status: 'completed', ticketsSold: 3500, ticketsCapacity: 3800, sponsorActivations: 4 },
  { id: 'er-5', eventName: 'Road Atlanta Challenge', date: 'Apr 5, 2026', venue: 'Road Atlanta', location: 'Braselton, GA', readiness: 'green', readinessScore: 96, opsReadiness: 97, complianceReadiness: 100, revenueReadiness: 94, broadcastReadiness: 93, status: 'completed', ticketsSold: 4000, ticketsCapacity: 4200, sponsorActivations: 5 },
  { id: 'er-6', eventName: 'Virginia Classic', date: 'Apr 26, 2026', venue: 'VIR', location: 'Alton, VA', readiness: 'green', readinessScore: 93, opsReadiness: 94, complianceReadiness: 100, revenueReadiness: 90, broadcastReadiness: 88, status: 'completed', ticketsSold: 2900, ticketsCapacity: 3200, sponsorActivations: 3 },
  { id: 'er-7', eventName: 'Sebring Sprint', date: 'May 17, 2026', venue: 'Sebring International', location: 'Sebring, FL', readiness: 'green', readinessScore: 91, opsReadiness: 93, complianceReadiness: 96, revenueReadiness: 88, broadcastReadiness: 87, status: 'completed', ticketsSold: 3600, ticketsCapacity: 4000, sponsorActivations: 4 },
  { id: 'er-8', eventName: 'Summer Showdown', date: 'Jun 14, 2026', venue: 'Mid-Ohio Sports Car Course', location: 'Lexington, OH', readiness: 'green', readinessScore: 94, opsReadiness: 96, complianceReadiness: 100, revenueReadiness: 90, broadcastReadiness: 90, status: 'completed', ticketsSold: 3200, ticketsCapacity: 3500, sponsorActivations: 4 },
  { id: 'er-9', eventName: 'Independence GP', date: 'Jul 4, 2026', venue: 'Watkins Glen International', location: 'Watkins Glen, NY', readiness: 'green', readinessScore: 97, opsReadiness: 98, complianceReadiness: 100, revenueReadiness: 96, broadcastReadiness: 95, status: 'completed', ticketsSold: 5200, ticketsCapacity: 5500, sponsorActivations: 7 },
  { id: 'er-10', eventName: 'Thunder Classic', date: 'Aug 2, 2026', venue: 'Portland International Gameway', location: 'Portland, OR', readiness: 'yellow', readinessScore: 82, opsReadiness: 88, complianceReadiness: 78, revenueReadiness: 85, broadcastReadiness: 80, status: 'live', ticketsSold: 3900, ticketsCapacity: 4200, sponsorActivations: 5 },
  { id: 'er-11', eventName: 'Laguna Seca Finale', date: 'Aug 23, 2026', venue: 'WeatherTech Gameway', location: 'Monterey, CA', readiness: 'yellow', readinessScore: 72, opsReadiness: 75, complianceReadiness: 68, revenueReadiness: 74, broadcastReadiness: 70, status: 'upcoming', ticketsSold: 2100, ticketsCapacity: 4500, sponsorActivations: 3 },
  { id: 'er-12', eventName: 'Lonestar GP', date: 'Sep 13, 2026', venue: 'COTA', location: 'Austin, TX', readiness: 'red', readinessScore: 45, opsReadiness: 50, complianceReadiness: 40, revenueReadiness: 48, broadcastReadiness: 42, status: 'upcoming', ticketsSold: 800, ticketsCapacity: 6500, sponsorActivations: 1 },
];

// =============================================================================
// CEO OPS DATA — Command Center
// =============================================================================

export const COMMAND_ITEMS: CommandItem[] = [
  { id: 'cmd-1', area: 'Court Operations', status: 'green', label: 'Court Clear', detail: 'All marshals posted, barriers inspected, medical on standby', owner: 'Game Director' },
  { id: 'cmd-2', area: 'Technical Compliance', status: 'red', label: 'Engine Flag', detail: 'Shadow GP SHD-Phantom V2 engine seal under investigation', owner: 'Chief Inspector' },
  { id: 'cmd-3', area: 'Safety Systems', status: 'yellow', label: 'Fire Cert Pending', detail: 'Fire suppression re-certification in progress — scheduled Jul 29', owner: 'Safety Director' },
  { id: 'cmd-4', area: 'Broadcast', status: 'green', label: 'All Feeds Live', detail: '6 camera positions active, ESPN3 uplink confirmed', owner: 'Broadcast Director' },
  { id: 'cmd-5', area: 'Medical', status: 'green', label: 'Full Staffing', detail: 'Ambulance on standby, 2 doctors + 4 paramedics courtside', owner: 'Medical Director' },
  { id: 'cmd-6', area: 'Hospitality', status: 'green', label: 'VIP Ready', detail: 'Commissioner suite, sponsor lounges, and media center operational', owner: 'Events Manager' },
  { id: 'cmd-7', area: 'Credentialing', status: 'yellow', label: '2 Pending', detail: 'Nova Speed — 2 crew members awaiting credential verification', owner: 'Ops Manager' },
  { id: 'cmd-8', area: 'Weather', status: 'green', label: 'Favorable', detail: 'Partly cloudy, 72°F, 5% precipitation chance through Sunday', owner: 'Game Director' },
];

export const BOARD_ITEMS: BoardItem[] = [
  { id: 'bd-1', title: 'Approve 2027 tire supplier contract terms', category: 'decision', priority: 'critical', assignee: 'Commissioner', dueDate: 'Jul 31', status: 'open' },
  { id: 'bd-2', title: 'Shadow GP engine investigation report', category: 'report', priority: 'critical', assignee: 'Chief Inspector', dueDate: 'Today', status: 'in_progress' },
  { id: 'bd-3', title: 'Fire suppression system re-certification', category: 'action_item', priority: 'critical', assignee: 'Safety Director', dueDate: 'Jul 29', status: 'in_progress' },
  { id: 'bd-4', title: 'Q3 revenue forecast presentation', category: 'report', priority: 'high', assignee: 'CFO', dueDate: 'Aug 5', status: 'open' },
  { id: 'bd-5', title: 'Williams medical clearance for Laguna Seca', category: 'action_item', priority: 'high', assignee: 'Medical Panel', dueDate: 'Aug 20', status: 'open' },
  { id: 'bd-6', title: 'Review broadcast production budget increase', category: 'decision', priority: 'medium', assignee: 'Commissioner', dueDate: 'Aug 1', status: 'open' },
  { id: 'bd-7', title: 'Season 2 calendar draft for board review', category: 'report', priority: 'medium', assignee: 'COO', dueDate: 'Sep 1', status: 'open' },
  { id: 'bd-8', title: 'Lonestar GP venue contract escalation', category: 'escalation', priority: 'high', assignee: 'Legal', dueDate: 'Aug 10', status: 'open' },
];

export const OPS_APPROVALS: OpsApproval[] = [
  { id: 'oa-1', title: 'Emergency tire batch inspection — all teams', requestedBy: 'Chief Inspector', category: 'Safety', amount: undefined, submittedAt: 'Today 10:42 AM', status: 'pending' },
  { id: 'oa-2', title: 'Shadow GP engine swap authorization', requestedBy: 'Tech Director', category: 'Technical', amount: undefined, submittedAt: 'Today 9:15 AM', status: 'pending' },
  { id: 'oa-3', title: 'Q4 broadcast production budget increase', requestedBy: 'Media Director', category: 'Financial', amount: '$45,000', submittedAt: 'Jul 26', status: 'pending' },
  { id: 'oa-4', title: 'Portland game steward appointment', requestedBy: 'Head of Officiating', category: 'Personnel', amount: undefined, submittedAt: 'Jul 25', status: 'pending' },
  { id: 'oa-5', title: 'Nike courtside lounge activation variance', requestedBy: 'Partnerships Director', category: 'Sponsorship', amount: '$12,500', submittedAt: 'Jul 24', status: 'pending' },
  { id: 'oa-6', title: 'Nova Speed chassis re-homologation waiver', requestedBy: 'Chief Inspector', category: 'Technical', amount: undefined, submittedAt: 'Jul 20', status: 'approved' },
  { id: 'oa-7', title: 'Vendor pass allocation — Portland catering', requestedBy: 'Ops Manager', category: 'Operational', amount: undefined, submittedAt: 'Jul 18', status: 'approved' },
];

export const LIVE_LOG: LiveLogEntry[] = [
  { id: 'll-1', timestamp: '10:56 AM', source: 'Game Control', message: 'Qualifying Q2 green flag — 12 karts on court', severity: 'info', acknowledged: true },
  { id: 'll-2', timestamp: '10:52 AM', source: 'Stewards', message: 'Cooper (#41) court limits violation at Turn 1 — quarter time under review', severity: 'warning', acknowledged: true },
  { id: 'll-3', timestamp: '10:48 AM', source: 'Medical', message: 'Williams (#8) medical check completed — resting in medical center', severity: 'info', acknowledged: true },
  { id: 'll-4', timestamp: '10:42 AM', source: 'Tech Inspector', message: 'Emergency tire batch inspection requested — Williams blow-out investigation', severity: 'critical', acknowledged: false },
  { id: 'll-5', timestamp: '10:38 AM', source: 'Game Control', message: 'Red flag lifted — barrier repair at Turn 11 complete, court re-inspected', severity: 'info', acknowledged: true },
  { id: 'll-6', timestamp: '10:35 AM', source: 'Broadcast', message: 'ESPN3 replay package edited — Williams incident footage cleared for air', severity: 'info', acknowledged: true },
  { id: 'll-7', timestamp: '10:28 AM', source: 'Stewards', message: 'Santos (#27) — 5-second penalty issued for gaining lasting advantage at T7', severity: 'warning', acknowledged: true },
  { id: 'll-8', timestamp: '10:22 AM', source: 'Game Control', message: 'RED FLAG — Williams (#8) tire blow-out Turn 11. Barrier repair required. Player OK.', severity: 'critical', acknowledged: true },
  { id: 'll-9', timestamp: '10:14 AM', source: 'Game Control', message: 'Minor contact Kim (#18) / Brooks (#21) Turn 3 — basketball incident, no action', severity: 'info', acknowledged: true },
  { id: 'll-10', timestamp: '10:00 AM', source: 'Game Control', message: 'Qualifying session started — green flag', severity: 'info', acknowledged: true },
  { id: 'll-11', timestamp: '9:55 AM', source: 'Broadcast', message: 'All camera feeds confirmed — ESPN3 uplink active', severity: 'info', acknowledged: true },
  { id: 'll-12', timestamp: '9:30 AM', source: 'Game Director', message: 'All 16 karts confirmed for qualifying — grid declared', severity: 'info', acknowledged: true },
];

// =============================================================================
// SERIES OVERVIEW DATA
// =============================================================================

export const SEASON_BLUEPRINT: SeasonBlueprint = {
  totalEvents: 12,
  completed: 9,
  remaining: 3,
  seasonStart: 'Jan 18, 2026',
  seasonEnd: 'Sep 13, 2026',
  currentPhase: 'Championship Run-In (3 games remaining)',
  championshipLeader: 'Leo Vasquez (Apex Basketball)',
  championshipGap: '22 pts over Nadia Patel',
};

export const EVENT_CALENDAR_PULSE: EventCalendarPulse = {
  nextEvent: 'Thunder Classic',
  nextEventDate: 'Aug 2, 2026',
  nextEventVenue: 'Portland International Gameway',
  eventsThisMonth: 1,
  avgReadinessScore: 82,
};

export const TEAMS_PULSE: TeamsPulse = {
  totalTeams: 8,
  fullyCompliant: 5,
  warnings: 2,
  nonCompliant: 1,
  avgBudgetUtilization: '62%',
};

export const REVENUE_DELIVERY_PULSE: RevenueDeliveryPulse = {
  totalRevenueYTD: '$4.8M',
  revenueTarget: '$6.2M',
  pctOfTarget: 77,
  ticketRevenueYTD: '$1.9M',
  sponsorRevenueYTD: '$1.6M',
  broadcastRevenueYTD: '$0.8M',
  merchandiseRevenueYTD: '$0.5M',
};

export const INTEGRITY_COMPLIANCE_PULSE: IntegrityCompliancePulse = {
  overallComplianceRate: 88,
  openInvestigations: 2,
  pendingApprovals: 5,
  recentPenalties: 6,
  ruleChangesThisSeason: 0,
  nextAuditDate: 'Aug 15, 2026',
};

export const EXECUTIVE_HISTORY: ExecutiveHistoryEntry[] = [
  { id: 'eh-1', date: 'Jul 28', action: 'Safety certification approved', actor: 'FIA Court Inspector', detail: 'Portland International Gameway passed FIA Grade C certification', category: 'operational' },
  { id: 'eh-2', date: 'Jul 25', action: 'Medical clearance approved', actor: 'FIA Medical Panel', detail: 'Portland game weekend medical team fully certified', category: 'approval' },
  { id: 'eh-3', date: 'Jul 18', action: 'Engine investigation initiated', actor: 'Chief Inspector', detail: 'Shadow GP SHD-Phantom V2 engine seal #4 flagged for thermal damage', category: 'penalty' },
  { id: 'eh-4', date: 'Jul 18', action: 'Mountain Circuit game results certified', actor: 'Chief Steward', detail: 'All results finalized. Mendez 5-second penalty upheld. Championship updated.', category: 'decision' },
  { id: 'eh-5', date: 'Jul 16', action: 'NVA chassis re-homologation required', actor: 'Chief Inspector', detail: 'Nova Speed NVA-Bolt B1 front wing endplate 3mm beyond spec', category: 'penalty' },
  { id: 'eh-6', date: 'Jul 15', action: 'Fire suppression certification expired', actor: 'Chief Steward', detail: 'Annual re-certification overdue. Expedited re-inspection ordered.', category: 'operational' },
  { id: 'eh-7', date: 'Jul 1', action: 'Q2 financial reports reviewed', actor: 'Commissioner', detail: 'Apex Basketball Q2 spend: $1.18M of $2.4M cap. Shadow GP report overdue.', category: 'financial' },
  { id: 'eh-8', date: 'Jun 28', action: 'Rule clarification issued', actor: 'Commissioner', detail: 'Updated interpretation of Article 1.02 — pit lane blend line enforcement', category: 'policy' },
  { id: 'eh-9', date: 'Jun 20', action: 'Pirelli renewal discussions initiated', actor: 'Commercial Director', detail: '2027 tire supply contract negotiations begun. Current deal expires Sep 30.', category: 'financial' },
  { id: 'eh-10', date: 'Jun 14', action: 'Safety car deployment protocol updated', actor: 'Game Director', detail: 'New double-waved yellow procedure adopted for high-speed corners', category: 'policy' },
];

// =============================================================================
// HELPER CONSTANTS
// =============================================================================

export const GATE_STATUS_COLOR: Record<GateStatus, string> = {
  cleared: '#5A8A6E',
  at_risk: '#B8943E',
  blocked: '#B85C5C',
  upcoming: '#9C9790',
};

export const LIVE_STATE_COLOR: Record<SessionLiveState, string> = {
  not_started: '#9C9790',
  live: '#B85C5C',
  completed: '#5A8A6E',
  delayed: '#B8943E',
  red_flagged: '#B85C5C',
};

export const LIVE_STATE_LABEL: Record<SessionLiveState, string> = {
  not_started: 'UPCOMING',
  live: 'LIVE',
  completed: 'COMPLETED',
  delayed: 'DELAYED',
  red_flagged: 'RED FLAG',
};

export const READINESS_COLOR: Record<EventReadiness, string> = {
  green: '#5A8A6E',
  yellow: '#B8943E',
  red: '#B85C5C',
  not_assessed: '#9C9790',
};

export const SEVERITY_COLOR: Record<string, string> = {
  critical: '#B85C5C',
  warning: '#B8943E',
  elevated: '#B8943E',
  info: '#1A1714',
  monitoring: '#9C9790',
};

export const APPROVAL_CATEGORY_COLOR: Record<string, string> = {
  financial: '#1A1714',
  regulatory: '#B85C5C',
  operational: '#B8943E',
  personnel: '#1A1714',
  media: '#1A1714',
  Safety: '#B85C5C',
  Technical: '#B8943E',
  Financial: '#1A1714',
  Personnel: '#1A1714',
  Sponsorship: '#1A1714',
  Operational: '#5A8A6E',
};

export const BOARD_CATEGORY_COLOR: Record<string, string> = {
  decision: '#1A1714',
  report: '#1A1714',
  action_item: '#B8943E',
  escalation: '#B85C5C',
};

export const BOARD_PRIORITY_COLOR: Record<string, string> = {
  critical: '#B85C5C',
  high: '#B8943E',
  medium: '#1A1714',
  low: '#9C9790',
};

export const HISTORY_CATEGORY_COLOR: Record<string, string> = {
  decision: '#1A1714',
  approval: '#5A8A6E',
  penalty: '#B85C5C',
  policy: '#1A1714',
  financial: '#B8943E',
  operational: '#1A1714',
};

export const OPS_SUBVIEW_TABS: { key: OpsSubview; label: string }[] = [
  { key: 'command', label: 'Command' },
  { key: 'board', label: 'Board' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'live_log', label: 'Live Log' },
];

// =============================================================================
// CEO STANDINGS TYPES & DATA
// =============================================================================

export type CEOStandingsLens = 'story' | 'integrity' | 'money';

export interface StandingsCEOKPI {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  color: string;
}

export interface CEOPlayerStanding {
  playerId: string;
  position: number;
  playerName: string;
  playerNumber: number;
  teamName: string;
  teamColor: string;
  points: number;
  gap: string;
  wins: number;
  podiums: number;
  form: ('W' | 'P2' | 'P3' | 'P4' | 'P5' | 'DNF' | 'DNS' | string)[];
  delta: number; // position change from last round
  penaltyPoints: number;
  payoutTier: 'A' | 'B' | 'C';
  estimatedPayout: string;
  clinchStatus?: string;
}

export interface RoundByRoundEntry {
  round: number;
  eventName: string;
  date: string;
  positions: Record<string, number>; // playerId → finish position
  dnfs: string[]; // playerIds
  penaltiesApplied: { playerId: string; description: string; pointsDeducted: number }[];
}

export const STANDINGS_CEO_KPIS: StandingsCEOKPI[] = [
  { id: 'sk-1', label: 'Title Fight', value: '22 pts', sublabel: 'Vasquez leads Patel · 3 rounds left', color: '#B8943E' },
  { id: 'sk-2', label: 'Integrity State', value: '2 open', sublabel: 'Engine seal + tire investigation', color: '#B85C5C' },
  { id: 'sk-3', label: 'Payout Readiness', value: '77%', sublabel: '$4.8M of $6.2M prize pool funded', color: '#1A1714' },
];

export const CEO_DRIVER_STANDINGS: CEOPlayerStanding[] = [
  { playerId: 'd-1', position: 1, playerName: 'Leo Vasquez', playerNumber: 7, teamName: 'Apex Basketball', teamColor: '#B85C5C', points: 178, gap: 'Leader', wins: 4, podiums: 7, form: ['W', 'P2', 'W', 'P3', 'W'], delta: 0, penaltyPoints: 0, payoutTier: 'A', estimatedPayout: '$420K', clinchStatus: 'Win + Patel P5 = clinch at Portland' },
  { playerId: 'd-2', position: 2, playerName: 'Nadia Patel', playerNumber: 22, teamName: 'Velocity Works', teamColor: '#1A1714', points: 156, gap: '−22', wins: 3, podiums: 6, form: ['P2', 'W', 'P3', 'W', 'P2'], delta: 0, penaltyPoints: 0, payoutTier: 'A', estimatedPayout: '$350K' },
  { playerId: 'd-3', position: 3, playerName: 'Yuki Tanaka', playerNumber: 33, teamName: 'Phoenix Motorsport', teamColor: '#B8943E', points: 148, gap: '−30', wins: 2, podiums: 5, form: ['P3', 'P3', 'P2', 'P4', 'P3'], delta: 0, penaltyPoints: 1, payoutTier: 'A', estimatedPayout: '$280K' },
  { playerId: 'd-4', position: 4, playerName: 'Sofia Torres', playerNumber: 44, teamName: 'Zenith Basketball', teamColor: '#5A8A6E', points: 142, gap: '−36', wins: 1, podiums: 4, form: ['P4', 'P5', 'P4', 'P2', 'W'], delta: 0, penaltyPoints: 0, payoutTier: 'B', estimatedPayout: '$210K' },
  { playerId: 'd-5', position: 5, playerName: 'Jake Morrison', playerNumber: 11, teamName: 'Apex Basketball', teamColor: '#B85C5C', points: 134, gap: '−44', wins: 0, podiums: 2, form: ['P5', 'P4', 'P5', 'P5', 'P4'], delta: 0, penaltyPoints: 0, payoutTier: 'B', estimatedPayout: '$175K' },
  { playerId: 'd-6', position: 6, playerName: 'Marcus Bell', playerNumber: 5, teamName: 'Velocity Works', teamColor: '#1A1714', points: 131, gap: '−47', wins: 0, podiums: 2, form: ['P4', 'P5', 'P5', 'DNF', 'P3'], delta: 0, penaltyPoints: 0, payoutTier: 'B', estimatedPayout: '$155K' },
  { playerId: 'd-7', position: 7, playerName: 'Carlos Mendez', playerNumber: 99, teamName: 'Shadow GP', teamColor: '#1A1714', points: 112, gap: '−66', wins: 1, podiums: 3, form: ['W', 'DNF', 'P5', 'P5', 'P5'], delta: -1, penaltyPoints: 2, payoutTier: 'B', estimatedPayout: '$120K' },
  { playerId: 'd-8', position: 8, playerName: 'Andre Williams', playerNumber: 8, teamName: 'Phoenix Motorsport', teamColor: '#B8943E', points: 108, gap: '−70', wins: 0, podiums: 2, form: ['P5', 'P3', 'P4', 'P5', 'DNF'], delta: 1, penaltyPoints: 0, payoutTier: 'C', estimatedPayout: '$95K' },
  { playerId: 'd-9', position: 9, playerName: 'Ggame Kim', playerNumber: 18, teamName: 'Shadow GP', teamColor: '#1A1714', points: 86, gap: '−92', wins: 0, podiums: 1, form: ['P5', 'P4', 'DNF', 'P5', 'P4'], delta: 0, penaltyPoints: 1, payoutTier: 'C', estimatedPayout: '$75K' },
  { playerId: 'd-10', position: 10, playerName: 'Ryan Fletcher', playerNumber: 3, teamName: 'Titan Basketball', teamColor: '#1A1714', points: 82, gap: '−96', wins: 0, podiums: 1, form: ['P5', 'P5', 'P5', 'P4', 'P5'], delta: 0, penaltyPoints: 1, payoutTier: 'C', estimatedPayout: '$65K' },
  { playerId: 'd-11', position: 11, playerName: 'Mia Santos', playerNumber: 27, teamName: 'Titan Basketball', teamColor: '#1A1714', points: 85, gap: '−93', wins: 0, podiums: 2, form: ['P3', 'P5', 'P5', 'P5', 'P5'], delta: 0, penaltyPoints: 0, payoutTier: 'C', estimatedPayout: '$70K' },
  { playerId: 'd-12', position: 12, playerName: 'Emma Lindqvist', playerNumber: 16, teamName: 'Zenith Basketball', teamColor: '#5A8A6E', points: 99, gap: '−79', wins: 1, podiums: 2, form: ['P5', 'P5', 'W', 'P5', 'P5'], delta: 0, penaltyPoints: 0, payoutTier: 'C', estimatedPayout: '$85K' },
  { playerId: 'd-13', position: 13, playerName: 'Zach Cooper', playerNumber: 41, teamName: 'Nova Speed', teamColor: '#1A1714', points: 78, gap: '−100', wins: 0, podiums: 0, form: ['P5', 'P5', 'P5', 'P5', 'P5'], delta: 0, penaltyPoints: 0, payoutTier: 'C', estimatedPayout: '$55K' },
  { playerId: 'd-14', position: 14, playerName: 'Priya Sharma', playerNumber: 14, teamName: 'Nova Speed', teamColor: '#1A1714', points: 67, gap: '−111', wins: 0, podiums: 1, form: ['P5', 'P5', 'P3', 'P5', 'P5'], delta: 0, penaltyPoints: 0, payoutTier: 'C', estimatedPayout: '$50K' },
  { playerId: 'd-15', position: 15, playerName: 'Tyler Brooks', playerNumber: 21, teamName: 'Iron Circuit', teamColor: '#9C9790', points: 64, gap: '−114', wins: 0, podiums: 0, form: ['P5', 'P5', 'P5', 'DNF', 'P5'], delta: 0, penaltyPoints: 0, payoutTier: 'C', estimatedPayout: '$45K' },
  { playerId: 'd-16', position: 16, playerName: 'Olivia Dunn', playerNumber: 36, teamName: 'Iron Circuit', teamColor: '#9C9790', points: 68, gap: '−110', wins: 0, podiums: 1, form: ['P5', 'P3', 'P5', 'P5', 'P5'], delta: 0, penaltyPoints: 0, payoutTier: 'C', estimatedPayout: '$48K' },
];

export const ROUND_BY_ROUND: RoundByRoundEntry[] = [
  { round: 1, eventName: 'Laguna Seca GP', date: 'Jan 18', positions: { 'd-1': 1, 'd-2': 3, 'd-3': 4, 'd-4': 5 }, dnfs: [], penaltiesApplied: [] },
  { round: 2, eventName: 'Sonoma Sprint', date: 'Feb 8', positions: { 'd-1': 2, 'd-2': 1, 'd-3': 3, 'd-4': 6 }, dnfs: [], penaltiesApplied: [] },
  { round: 3, eventName: 'COTA Endurance', date: 'Feb 22', positions: { 'd-1': 1, 'd-2': 4, 'd-3': 2, 'd-4': 5 }, dnfs: [], penaltiesApplied: [{ playerId: 'd-3', description: 'Jump start penalty', pointsDeducted: 1 }] },
  { round: 4, eventName: 'Barber Invitational', date: 'Mar 15', positions: { 'd-1': 3, 'd-2': 1, 'd-3': 4, 'd-4': 2 }, dnfs: [], penaltiesApplied: [] },
  { round: 5, eventName: 'Road Atlanta', date: 'Apr 5', positions: { 'd-1': 1, 'd-2': 2, 'd-3': 3, 'd-4': 4 }, dnfs: [], penaltiesApplied: [] },
  { round: 6, eventName: 'Virginia Classic', date: 'Apr 26', positions: { 'd-1': 2, 'd-2': 3, 'd-3': 4, 'd-4': 1 }, dnfs: [], penaltiesApplied: [] },
  { round: 7, eventName: 'Sebring Sprint', date: 'May 17', positions: { 'd-1': 1, 'd-2': 2, 'd-3': 5, 'd-4': 3 }, dnfs: ['d-7'], penaltiesApplied: [] },
  { round: 8, eventName: 'Summer Showdown', date: 'Jun 14', positions: { 'd-1': 2, 'd-2': 1, 'd-3': 3, 'd-4': 4 }, dnfs: ['d-6'], penaltiesApplied: [] },
  { round: 9, eventName: 'Independence GP', date: 'Jul 4', positions: { 'd-1': 1, 'd-2': 3, 'd-3': 2, 'd-4': 1 }, dnfs: ['d-8'], penaltiesApplied: [{ playerId: 'd-7', description: 'Collision penalty', pointsDeducted: 2 }] },
];

export const FORM_COLOR: Record<string, string> = {
  W: '#5A8A6E',
  P2: '#1A1714',
  P3: '#1A1714',
  DNF: '#B85C5C',
  DNS: '#9C9790',
};

export const PAYOUT_TIER_COLOR: Record<string, string> = {
  A: '#B8943E',
  B: '#1A1714',
  C: '#9C9790',
};

export const CEO_LENS_TABS: { key: CEOStandingsLens; label: string }[] = [
  { key: 'story', label: 'Story' },
  { key: 'integrity', label: 'Integrity' },
  { key: 'money', label: 'Money' },
];

// =============================================================================
// CEO TEAMS TYPES & DATA
// =============================================================================

export type TeamType = 'OEM' | 'Tuner' | 'Independent' | 'League-Owned';

export interface CEOTeamCard {
  teamId: string;
  name: string;
  abbreviation: string;
  primaryColor: string;
  teamType: TeamType;
  owner: string;
  principal: string;
  headquarters: string;
  founded: number;
  championships: number;
  points: number;
  wins: number;
  budget: string;
  budgetUtilization: number; // 0-100
  homeCourt: string;
  // Readiness pills (0-100)
  readiness: {
    tech: number;
    compliance: number;
    ops: number;
    media: number;
  };
  // Business pills
  business: {
    sponsorHealth: 'green' | 'yellow' | 'red';
    financialStatus: 'current' | 'overdue' | 'delinquent';
    sponsorCount: number;
    sponsorRevenue: string;
  };
  // CEO risk flags
  riskFlags: string[];
  // Detail tab data
  detail: {
    complianceIssues: { item: string; status: 'compliant' | 'warning' | 'non_compliant' | 'pending'; note?: string }[];
    opsLogistics: { item: string; status: 'confirmed' | 'pending' | 'issue'; detail: string }[];
    financials: { label: string; value: string; trend?: 'up' | 'down' }[];
    mediaObligations: { item: string; status: 'fulfilled' | 'pending' | 'overdue'; dueDate: string }[];
    historyEntries: { date: string; event: string; detail: string }[];
    risks: { id: string; title: string; severity: 'critical' | 'elevated' | 'monitoring'; detail: string }[];
    credentials: { item: string; status: 'valid' | 'expired' | 'pending'; expiry: string }[];
    freight: { item: string; status: 'delivered' | 'in_transit' | 'pending'; eta?: string }[];
    fees: { label: string; amount: string; status: 'paid' | 'pending' | 'overdue' }[];
  };
}

export interface TeamsCEOKPI {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  color: string;
}

export const TEAMS_CEO_KPIS: TeamsCEOKPI[] = [
  { id: 'tk-1', label: 'Grid Health', value: '6/8', sublabel: '6 teams fully ready · 2 flagged', color: '#5A8A6E' },
  { id: 'tk-2', label: 'Brand & Dist.', value: '94%', sublabel: 'Sponsor activation rate this season', color: '#1A1714' },
  { id: 'tk-3', label: 'Money & Contracts', value: '$14.5M', sublabel: 'Combined team budgets · 62% avg utilization', color: '#B8943E' },
];

export const TEAM_TYPE_COLOR: Record<TeamType, string> = {
  OEM: '#1A1714',
  Tuner: '#1A1714',
  Independent: '#B8943E',
  'League-Owned': '#5A8A6E',
};

export const CEO_TEAM_CARDS: CEOTeamCard[] = [
  {
    teamId: 't-1', name: 'Apex Basketball', abbreviation: 'APX', primaryColor: '#B85C5C', teamType: 'Independent',
    owner: 'Marcus Kane', principal: 'Marcus Kane', headquarters: 'Austin, TX', founded: 2019, championships: 2,
    points: 312, wins: 4, budget: '$2.4M', budgetUtilization: 49, homeCourt: 'COTA',
    readiness: { tech: 98, compliance: 100, ops: 96, media: 94 },
    business: { sponsorHealth: 'green', financialStatus: 'current', sponsorCount: 4, sponsorRevenue: '$680K' },
    riskFlags: [],
    detail: {
      complianceIssues: [
        { item: 'Engine seals', status: 'compliant' }, { item: 'Weight cert', status: 'compliant' },
        { item: 'Safety gear', status: 'compliant' }, { item: 'Fuel conformity', status: 'compliant' },
      ],
      opsLogistics: [
        { item: 'Freight — Portland', status: 'confirmed', detail: 'All equipment delivered Jul 25' },
        { item: 'Courtside allocation', status: 'confirmed', detail: 'Bay 1 assigned' },
        { item: 'Crew credentials', status: 'confirmed', detail: 'All 8 passes verified' },
      ],
      financials: [
        { label: 'Season Budget', value: '$2.4M' }, { label: 'Spent YTD', value: '$1.18M', trend: 'up' },
        { label: 'Sponsor Revenue', value: '$680K' }, { label: 'Prize Money YTD', value: '$420K' },
      ],
      mediaObligations: [
        { item: 'Pre-game interview (ESPN3)', status: 'fulfilled', dueDate: 'Jul 28' },
        { item: 'Social media content pack', status: 'fulfilled', dueDate: 'Jul 30' },
        { item: 'Post-game press conf', status: 'pending', dueDate: 'Aug 2' },
      ],
      historyEntries: [
        { date: 'Jul 18', event: 'Q2 budget report filed', detail: 'Total spend $1.18M — under cap' },
        { date: 'Jul 1', event: 'Q2 financial review', detail: 'Approved by 3SSB audit' },
        { date: 'Jun 14', event: 'Summer Showdown P1+P4', detail: 'Team championship lead extended' },
      ],
      risks: [],
      credentials: [
        { item: 'Team license', status: 'valid', expiry: 'Dec 31, 2026' },
        { item: 'Insurance cert', status: 'valid', expiry: 'Dec 31, 2026' },
      ],
      freight: [
        { item: '2x karts + spares', status: 'delivered' },
        { item: 'Pit equipment', status: 'delivered' },
      ],
      fees: [
        { label: 'Entry fee (Season)', amount: '$50,000', status: 'paid' },
        { label: 'Courtside levy', amount: '$3,500', status: 'paid' },
      ],
    },
  },
  {
    teamId: 't-2', name: 'Velocity Works', abbreviation: 'VEL', primaryColor: '#1A1714', teamType: 'Tuner',
    owner: 'Lisa Grant', principal: 'Lisa Grant', headquarters: 'Monterey, CA', founded: 2020, championships: 1,
    points: 287, wins: 3, budget: '$2.1M', budgetUtilization: 55, homeCourt: 'Laguna Seca',
    readiness: { tech: 95, compliance: 92, ops: 94, media: 90 },
    business: { sponsorHealth: 'green', financialStatus: 'current', sponsorCount: 3, sponsorRevenue: '$520K' },
    riskFlags: ['Safety gear inspection due'],
    detail: {
      complianceIssues: [
        { item: 'Engine seals', status: 'compliant' }, { item: 'Weight cert', status: 'compliant' },
        { item: 'Safety gear', status: 'warning', note: 'Inspection overdue — scheduled Jul 30' },
        { item: 'Fuel conformity', status: 'compliant' },
      ],
      opsLogistics: [
        { item: 'Freight — Portland', status: 'confirmed', detail: 'Delivered Jul 26' },
        { item: 'Courtside allocation', status: 'confirmed', detail: 'Bay 2 assigned' },
      ],
      financials: [
        { label: 'Season Budget', value: '$2.1M' }, { label: 'Spent YTD', value: '$1.15M', trend: 'up' },
        { label: 'Sponsor Revenue', value: '$520K' }, { label: 'Prize Money YTD', value: '$350K' },
      ],
      mediaObligations: [
        { item: 'Pre-game interview', status: 'fulfilled', dueDate: 'Jul 28' },
        { item: 'Social media pack', status: 'pending', dueDate: 'Jul 31' },
      ],
      historyEntries: [
        { date: 'Jul 15', event: 'Safety gear warning issued', detail: 'Must complete inspection before game' },
      ],
      risks: [{ id: 'vr-1', title: 'Safety gear overdue', severity: 'monitoring', detail: 'Inspection scheduled Jul 30' }],
      credentials: [{ item: 'Team license', status: 'valid', expiry: 'Dec 31, 2026' }],
      freight: [{ item: '2x karts + spares', status: 'delivered' }],
      fees: [{ label: 'Entry fee', amount: '$50,000', status: 'paid' }, { label: 'Courtside levy', amount: '$3,500', status: 'paid' }],
    },
  },
  {
    teamId: 't-3', name: 'Phoenix Motorsport', abbreviation: 'PHX', primaryColor: '#B8943E', teamType: 'Independent',
    owner: 'David Okafor', principal: 'David Okafor', headquarters: 'Rock Hill, SC', founded: 2018, championships: 1,
    points: 256, wins: 2, budget: '$1.9M', budgetUtilization: 58, homeCourt: 'Road Atlanta',
    readiness: { tech: 96, compliance: 100, ops: 95, media: 88 },
    business: { sponsorHealth: 'green', financialStatus: 'current', sponsorCount: 3, sponsorRevenue: '$440K' },
    riskFlags: ['Williams medical clearance pending'],
    detail: {
      complianceIssues: [
        { item: 'Engine seals', status: 'compliant' }, { item: 'Weight cert', status: 'compliant' },
        { item: 'Player medical — Williams', status: 'pending', note: 'Post-incident recert required' },
      ],
      opsLogistics: [{ item: 'Freight — Portland', status: 'confirmed', detail: 'All delivered Jul 25' }],
      financials: [
        { label: 'Season Budget', value: '$1.9M' }, { label: 'Spent YTD', value: '$1.1M' },
        { label: 'Sponsor Revenue', value: '$440K' },
      ],
      mediaObligations: [{ item: 'Social media pack', status: 'fulfilled', dueDate: 'Jul 29' }],
      historyEntries: [{ date: 'Jul 10', event: 'Williams medical observation started', detail: 'After Turn 11 incident' }],
      risks: [{ id: 'pr-1', title: 'Williams medical', severity: 'elevated', detail: 'Recertification required before next game' }],
      credentials: [{ item: 'Team license', status: 'valid', expiry: 'Dec 31, 2026' }],
      freight: [{ item: '2x karts', status: 'delivered' }],
      fees: [{ label: 'Entry fee', amount: '$50,000', status: 'paid' }],
    },
  },
  {
    teamId: 't-4', name: 'Zenith Basketball', abbreviation: 'ZEN', primaryColor: '#5A8A6E', teamType: 'OEM',
    owner: 'Anna Petrov', principal: 'Anna Petrov', headquarters: 'Ithaca, NY', founded: 2021, championships: 0,
    points: 241, wins: 2, budget: '$1.8M', budgetUtilization: 62, homeCourt: 'Watkins Glen',
    readiness: { tech: 90, compliance: 88, ops: 92, media: 86 },
    business: { sponsorHealth: 'yellow', financialStatus: 'current', sponsorCount: 2, sponsorRevenue: '$320K' },
    riskFlags: ['Weight cert pending'],
    detail: {
      complianceIssues: [
        { item: 'Engine seals', status: 'compliant' },
        { item: 'Weight cert', status: 'pending', note: 'Re-weigh scheduled Jul 30' },
      ],
      opsLogistics: [{ item: 'Freight', status: 'confirmed', detail: 'Delivered Jul 26' }],
      financials: [{ label: 'Season Budget', value: '$1.8M' }, { label: 'Spent YTD', value: '$1.12M' }],
      mediaObligations: [{ item: 'Content pack', status: 'pending', dueDate: 'Aug 1' }],
      historyEntries: [],
      risks: [],
      credentials: [{ item: 'Team license', status: 'valid', expiry: 'Dec 31, 2026' }],
      freight: [{ item: '2x karts', status: 'delivered' }],
      fees: [{ label: 'Entry fee', amount: '$50,000', status: 'paid' }],
    },
  },
  {
    teamId: 't-5', name: 'Shadow GP', abbreviation: 'SHD', primaryColor: '#1A1714', teamType: 'Tuner',
    owner: 'James Wright', principal: 'James Wright', headquarters: 'Birmingham, AL', founded: 2020, championships: 0,
    points: 198, wins: 1, budget: '$1.6M', budgetUtilization: 68, homeCourt: 'Barber Motorsports',
    readiness: { tech: 42, compliance: 55, ops: 80, media: 72 },
    business: { sponsorHealth: 'red', financialStatus: 'overdue', sponsorCount: 1, sponsorRevenue: '$180K' },
    riskFlags: ['Engine seal #4 investigation', 'Q2 budget report overdue', 'Sponsor health critical'],
    detail: {
      complianceIssues: [
        { item: 'Engine seals', status: 'non_compliant', note: 'SHD-Phantom V2 seal #4 under investigation' },
        { item: 'Data logger', status: 'warning', note: 'Calibration check pending' },
      ],
      opsLogistics: [
        { item: 'Freight', status: 'confirmed', detail: 'Delivered Jul 25' },
        { item: 'Engine swap parts', status: 'pending', detail: 'Awaiting commissioner authorization' },
      ],
      financials: [
        { label: 'Season Budget', value: '$1.6M' }, { label: 'Spent YTD', value: '$1.09M', trend: 'up' },
        { label: 'Q2 Report', value: 'OVERDUE', trend: 'down' },
      ],
      mediaObligations: [{ item: 'Content pack', status: 'overdue', dueDate: 'Jul 25' }],
      historyEntries: [
        { date: 'Jul 18', event: 'Engine seal flagged', detail: 'SHD-Phantom V2 seal #4 thermal damage' },
        { date: 'Jul 15', event: 'Q2 report deadline missed', detail: 'Reminder sent' },
      ],
      risks: [
        { id: 'sr-1', title: 'Engine integrity', severity: 'critical', detail: 'Seal #4 investigation — could result in exclusion' },
        { id: 'sr-2', title: 'Financial compliance', severity: 'elevated', detail: 'Q2 report overdue' },
      ],
      credentials: [{ item: 'Team license', status: 'valid', expiry: 'Dec 31, 2026' }],
      freight: [{ item: '2x karts', status: 'delivered' }, { item: 'Replacement engine', status: 'in_transit', eta: 'Jul 30' }],
      fees: [{ label: 'Entry fee', amount: '$50,000', status: 'paid' }, { label: 'Fine — data logger', amount: '$1,000', status: 'pending' }],
    },
  },
  {
    teamId: 't-6', name: 'Titan Basketball', abbreviation: 'TTN', primaryColor: '#1A1714', teamType: 'Independent',
    owner: 'Lisa Rodriguez', principal: 'Lisa Rodriguez', headquarters: 'Columbus, OH', founded: 2022, championships: 0,
    points: 167, wins: 0, budget: '$1.4M', budgetUtilization: 65, homeCourt: 'Mid-Ohio',
    readiness: { tech: 94, compliance: 96, ops: 92, media: 90 },
    business: { sponsorHealth: 'green', financialStatus: 'current', sponsorCount: 2, sponsorRevenue: '$280K' },
    riskFlags: [],
    detail: {
      complianceIssues: [{ item: 'All items', status: 'compliant' }],
      opsLogistics: [{ item: 'Freight', status: 'confirmed', detail: 'All delivered' }],
      financials: [{ label: 'Season Budget', value: '$1.4M' }, { label: 'Spent YTD', value: '$910K' }],
      mediaObligations: [{ item: 'Content pack', status: 'fulfilled', dueDate: 'Jul 28' }],
      historyEntries: [],
      risks: [],
      credentials: [{ item: 'Team license', status: 'valid', expiry: 'Dec 31, 2026' }],
      freight: [{ item: '2x karts', status: 'delivered' }],
      fees: [{ label: 'Entry fee', amount: '$50,000', status: 'paid' }],
    },
  },
  {
    teamId: 't-7', name: 'Nova Speed', abbreviation: 'NVA', primaryColor: '#1A1714', teamType: 'Independent',
    owner: 'Kai Tanaka', principal: 'Kai Tanaka', headquarters: 'Sebring, FL', founded: 2023, championships: 0,
    points: 145, wins: 0, budget: '$1.2M', budgetUtilization: 70, homeCourt: 'Sebring',
    readiness: { tech: 78, compliance: 72, ops: 80, media: 68 },
    business: { sponsorHealth: 'yellow', financialStatus: 'current', sponsorCount: 1, sponsorRevenue: '$150K' },
    riskFlags: ['Chassis homologation pending', 'Credential verification incomplete'],
    detail: {
      complianceIssues: [
        { item: 'Chassis homologation', status: 'pending', note: 'NVA-Bolt B1 front wing out of spec — 48h to fix' },
        { item: 'Engine seals', status: 'compliant' },
      ],
      opsLogistics: [
        { item: 'Freight', status: 'confirmed', detail: 'Delivered Jul 26' },
        { item: 'Crew credentials', status: 'pending', detail: '2 crew awaiting verification' },
      ],
      financials: [{ label: 'Season Budget', value: '$1.2M' }, { label: 'Spent YTD', value: '$840K' }],
      mediaObligations: [{ item: 'Content pack', status: 'pending', dueDate: 'Aug 1' }],
      historyEntries: [{ date: 'Jul 16', event: 'Front wing flagged', detail: 'Endplate 3mm beyond spec' }],
      risks: [{ id: 'nr-1', title: 'Chassis spec', severity: 'elevated', detail: 'Re-homologation required' }],
      credentials: [{ item: 'Team license', status: 'valid', expiry: 'Dec 31, 2026' }, { item: '2 crew passes', status: 'pending', expiry: 'Aug 2' }],
      freight: [{ item: '2x karts', status: 'delivered' }],
      fees: [{ label: 'Entry fee', amount: '$50,000', status: 'paid' }],
    },
  },
  {
    teamId: 't-8', name: 'Iron Circuit', abbreviation: 'IRC', primaryColor: '#9C9790', teamType: 'League-Owned',
    owner: '3SSB Circuit', principal: 'Mike Thompson', headquarters: 'Charlottesville, VA', founded: 2022, championships: 0,
    points: 132, wins: 0, budget: '$1.1M', budgetUtilization: 75, homeCourt: 'VIR',
    readiness: { tech: 92, compliance: 94, ops: 90, media: 82 },
    business: { sponsorHealth: 'yellow', financialStatus: 'current', sponsorCount: 1, sponsorRevenue: '$120K' },
    riskFlags: [],
    detail: {
      complianceIssues: [{ item: 'All items', status: 'compliant' }],
      opsLogistics: [{ item: 'Freight', status: 'confirmed', detail: 'All delivered' }],
      financials: [{ label: 'Season Budget', value: '$1.1M' }, { label: 'Spent YTD', value: '$825K' }],
      mediaObligations: [{ item: 'Content pack', status: 'fulfilled', dueDate: 'Jul 29' }],
      historyEntries: [],
      risks: [],
      credentials: [{ item: 'Team license', status: 'valid', expiry: 'Dec 31, 2026' }],
      freight: [{ item: '2x karts', status: 'delivered' }],
      fees: [{ label: 'Entry fee', amount: '$50,000', status: 'paid' }],
    },
  },
];

export const READINESS_PILL_COLOR = (score: number): string =>
  score >= 90 ? '#5A8A6E' : score >= 70 ? '#B8943E' : '#B85C5C';

// =============================================================================
// CEO RACEWEEK OPS TYPES & DATA
// =============================================================================

export interface CEOTop5Item {
  id: string;
  rank: number;
  title: string;
  severity: 'critical' | 'elevated' | 'monitoring';
  owner: string;
  detail: string;
  unblockAction?: string;
}

export interface Bulletin {
  id: string;
  title: string;
  type: 'safety' | 'technical' | 'operational' | 'commercial' | 'media';
  status: 'draft' | 'approved' | 'published';
  author: string;
  date: string;
  summary: string;
  audience: string;
}

export const CEO_TOP_5: CEOTop5Item[] = [
  { id: 'ct5-1', rank: 1, title: 'Shadow GP Engine Seal Decision', severity: 'critical', owner: 'Commissioner', detail: 'Lab results pending. Must rule before game start. Team risks exclusion if non-compliant.', unblockAction: 'Approve engine swap or exclude team from game' },
  { id: 'ct5-2', rank: 2, title: 'Fire Suppression Re-Certification', severity: 'critical', owner: 'Safety Director', detail: 'Annual cert expired Jul 15. FIA mandate — league operations could be suspended.', unblockAction: 'Expedited re-inspection Jul 29' },
  { id: 'ct5-3', rank: 3, title: 'Williams Medical Clearance', severity: 'elevated', owner: 'Medical Panel', detail: 'Post-incident observation ongoing. Clearance assessment 48h before next game.', unblockAction: 'Medical panel sign-off required' },
  { id: 'ct5-4', rank: 4, title: 'Nova Speed Credential Gap', severity: 'elevated', owner: 'Ops Manager', detail: '2 crew members pending credential verification. Must be resolved before courtside access.', unblockAction: 'Background checks in progress — ETA Jul 30' },
  { id: 'ct5-5', rank: 5, title: 'Tire Supplier Batch Analysis', severity: 'monitoring', owner: 'Tech Director', detail: 'Williams blow-out under investigation. All teams checking pressures.', unblockAction: 'Supplier analysis results expected Jul 31' },
];

export const BULLETINS: Bulletin[] = [
  { id: 'bul-1', title: 'Game Weekend Safety Briefing — Portland', type: 'safety', status: 'published', author: 'Game Director', date: 'Jul 28', summary: 'All players and team principals must attend mandatory safety briefing at 8:00 AM Friday in media center. Topics: Turn 11 runoff changes, medical helicopter protocol, fire suppression status.', audience: 'All Teams + Officials' },
  { id: 'bul-2', title: 'Engine Seal Investigation Update', type: 'technical', status: 'published', author: 'Chief Inspector', date: 'Jul 28', summary: 'SHD-Phantom V2 engine seal #4 sent to external lab. Preliminary results indicate thermal damage consistent with overheating — not tampering. Final report expected Saturday.', audience: 'All Teams' },
  { id: 'bul-3', title: 'Broadcast Schedule — Thunder Classic', type: 'media', status: 'approved', author: 'Media Director', date: 'Jul 27', summary: 'ESPN3 will broadcast qualifying Saturday 10:00 AM and feature game Sunday 2:00 PM. Pre-show begins 1:15 PM. Commissioner interview slot confirmed for pre-show.', audience: 'All Teams + Media' },
  { id: 'bul-4', title: 'Tire Pressure Advisory', type: 'technical', status: 'published', author: 'Tech Director', date: 'Jul 27', summary: 'Following Williams tire failure, all teams must submit tire pressure logs before each session. Random pressure spot-checks will be conducted in pit lane.', audience: 'All Teams' },
  { id: 'bul-5', title: 'Portland Sponsor Activation Guidelines', type: 'commercial', status: 'approved', author: 'Partnerships Director', date: 'Jul 26', summary: 'Nike courtside lounge activation variance approved at $12,500. All sponsor activations must stay within designated zones. No signage changes after Friday 6:00 PM.', audience: 'Sponsors + Teams' },
  { id: 'bul-6', title: 'Qualifying Format Reminder', type: 'operational', status: 'draft', author: 'Game Director', date: 'Jul 28', summary: 'Portland qualifying will use the 3-segment format (Q1/Q2/Q3). Q1 eliminates bottom 4, Q2 eliminates next 4, Q3 determines pole. Each segment: 10 minutes.', audience: 'All Teams' },
];

export const BULLETIN_TYPE_COLOR: Record<string, string> = {
  safety: '#B85C5C',
  technical: '#1A1714',
  operational: '#1A1714',
  commercial: '#B8943E',
  media: '#1A1714',
};

export const BULLETIN_STATUS_COLOR: Record<string, string> = {
  draft: '#9C9790',
  approved: '#B8943E',
  published: '#5A8A6E',
};

// =============================================================================
// CEO RULES TYPES & DATA
// =============================================================================

export interface TechnicalDirective {
  id: string;
  number: string;
  title: string;
  issuedDate: string;
  effectiveDate: string;
  category: 'engine' | 'chassis' | 'safety' | 'tires' | 'data' | 'general';
  summary: string;
  issuedBy: string;
  acknowledged: number; // how many teams acknowledged
  totalTeams: number;
  supersedes?: string;
}

export interface PenaltyFactor {
  type: 'aggravating' | 'mitigating';
  description: string;
  impactRange: string;
}

export interface EnhancedPenaltyCatalog {
  id: string;
  infraction: string;
  minPenalty: string;
  maxPenalty: string;
  pointsRange: string;
  examples: string;
  factors: PenaltyFactor[];
  recentApplications: number;
}

export const TECHNICAL_DIRECTIVES: TechnicalDirective[] = [
  { id: 'td-1', number: 'TD-2026-001', title: 'Engine Seal Inspection Protocol Update', issuedDate: 'Jan 10, 2026', effectiveDate: 'Jan 18, 2026', category: 'engine', summary: 'All engine seals must be inspected using the updated thermal imaging protocol before and after each game weekend. Seals showing any thermal anomaly must be flagged.', issuedBy: 'Chief Inspector', acknowledged: 8, totalTeams: 8 },
  { id: 'td-2', number: 'TD-2026-002', title: 'Minimum Weight Measurement Procedure', issuedDate: 'Feb 1, 2026', effectiveDate: 'Feb 8, 2026', category: 'chassis', summary: 'Minimum weight verification will now include player at the end of each session (not just car). Random checks during practice permitted.', issuedBy: 'Chief Inspector', acknowledged: 8, totalTeams: 8 },
  { id: 'td-3', number: 'TD-2026-003', title: 'Fire Suppression System Quarterly Check', issuedDate: 'Mar 1, 2026', effectiveDate: 'Mar 15, 2026', category: 'safety', summary: 'All fire suppression systems in pit lane and courtside areas must undergo quarterly inspection. Annual re-certification required per FIA mandate.', issuedBy: 'Safety Director', acknowledged: 8, totalTeams: 8 },
  { id: 'td-4', number: 'TD-2026-004', title: 'Tire Pressure Logging Mandate', issuedDate: 'Jul 27, 2026', effectiveDate: 'Jul 28, 2026', category: 'tires', summary: 'Following the Williams tire failure at Portland, all teams must submit tire pressure logs before each session. Random spot-checks in pit lane authorized.', issuedBy: 'Tech Director', acknowledged: 6, totalTeams: 8, supersedes: undefined },
  { id: 'td-5', number: 'TD-2026-005', title: 'Pit Lane Blend Line Enforcement Clarification', issuedDate: 'Jun 28, 2026', effectiveDate: 'Jul 4, 2026', category: 'general', summary: 'Clarifies Article 1.02 enforcement: crossing the blend line on pit exit is a 5-second time penalty on first offense, drive-through on repeat. Sensor data from pit exit loop will be used.', issuedBy: 'Commissioner', acknowledged: 8, totalTeams: 8 },
  { id: 'td-6', number: 'TD-2026-006', title: 'Data Logger Calibration Standard', issuedDate: 'Apr 15, 2026', effectiveDate: 'Apr 26, 2026', category: 'data', summary: 'Standard 3SSB data loggers must be calibrated at the start of each game weekend. Teams must present calibration certificates during technical inspection.', issuedBy: 'Tech Director', acknowledged: 7, totalTeams: 8 },
];

export const ENHANCED_PENALTY_CATALOG: EnhancedPenaltyCatalog[] = [
  {
    id: 'epc-1', infraction: 'Jump Start', minPenalty: 'Drive-through', maxPenalty: '10-second stop-go', pointsRange: '0-2 pts', examples: 'Moving before green light/flag.',
    factors: [
      { type: 'aggravating', description: 'Gained position advantage', impactRange: '+1 step' },
      { type: 'mitigating', description: 'Electronics malfunction proven', impactRange: '−1 step' },
    ],
    recentApplications: 1,
  },
  {
    id: 'epc-2', infraction: 'Causing a Collision', minPenalty: '5-second time penalty', maxPenalty: 'Disqualification', pointsRange: '2-6 pts', examples: 'Deliberate or reckless contact.',
    factors: [
      { type: 'aggravating', description: 'Caused DNF to other player', impactRange: '+2 steps' },
      { type: 'aggravating', description: 'Repeat offense (2+ in season)', impactRange: '+1 step' },
      { type: 'mitigating', description: 'Basketball incident with shared fault', impactRange: '−1 step' },
    ],
    recentApplications: 2,
  },
  {
    id: 'epc-3', infraction: 'Pit Lane Speeding', minPenalty: 'Drive-through', maxPenalty: 'Drive-through + fine', pointsRange: '0-1 pts', examples: 'Exceeding 40 km/h limit.',
    factors: [
      { type: 'aggravating', description: 'Speed >50 km/h (25%+ over)', impactRange: '+fine $500' },
      { type: 'mitigating', description: 'First offense of season', impactRange: 'Warning only (if <5km/h over)' },
    ],
    recentApplications: 1,
  },
  {
    id: 'epc-4', infraction: 'Court Limits Abuse', minPenalty: 'Quarter time deleted', maxPenalty: '5-second time penalty', pointsRange: '0 pts', examples: 'Gaining lasting advantage.',
    factors: [
      { type: 'aggravating', description: '5+ violations in single session', impactRange: 'Automatic penalty' },
      { type: 'mitigating', description: 'Forced off court by another player', impactRange: 'No penalty' },
    ],
    recentApplications: 3,
  },
  {
    id: 'epc-5', infraction: 'Unsafe Release', minPenalty: '5-second time penalty', maxPenalty: '10-second stop-go', pointsRange: '0-2 pts', examples: 'Release into path of another.',
    factors: [
      { type: 'aggravating', description: 'Contact made during unsafe release', impactRange: '+1 step' },
      { type: 'mitigating', description: 'Other player not impeded', impactRange: '−1 step' },
    ],
    recentApplications: 1,
  },
  {
    id: 'epc-6', infraction: 'Ignoring Blue Flags', minPenalty: '5-second time penalty', maxPenalty: 'Drive-through', pointsRange: '1-2 pts', examples: 'Failure to yield within 3 posts.',
    factors: [
      { type: 'aggravating', description: 'Impeded game leader', impactRange: '+1 step' },
    ],
    recentApplications: 1,
  },
  {
    id: 'epc-7', infraction: 'Technical Non-Compliance', minPenalty: 'Fine ($1,000)', maxPenalty: 'Disqualification + points strip', pointsRange: '0-12 pts', examples: 'Sealed component mod, non-conforming fuel.',
    factors: [
      { type: 'aggravating', description: 'Deliberate modification proven', impactRange: 'DSQ + season points review' },
      { type: 'mitigating', description: 'Supplier error documented', impactRange: 'Fine only, no points' },
    ],
    recentApplications: 1,
  },
  {
    id: 'epc-8', infraction: 'Unsportsmanlike Conduct', minPenalty: 'Reprimand', maxPenalty: 'Game ban + fine', pointsRange: '2-8 pts', examples: 'Aggressive driving, verbal abuse.',
    factors: [
      { type: 'aggravating', description: 'Directed at officials', impactRange: 'Automatic hearing' },
      { type: 'mitigating', description: 'First offense, immediately apologized', impactRange: 'Reprimand only' },
    ],
    recentApplications: 0,
  },
];

export const TD_CATEGORY_COLOR: Record<string, string> = {
  engine: '#B85C5C',
  chassis: '#1A1714',
  safety: '#B8943E',
  tires: '#1A1714',
  data: '#1A1714',
  general: '#9C9790',
};

// =============================================================================
// CEO TECH & COMPLIANCE TYPES & DATA
// =============================================================================

export interface ClearanceBoardEntry {
  id: string;
  entityName: string;
  entityType: 'player' | 'vehicle' | 'team' | 'venue' | 'equipment';
  teamName: string;
  teamColor: string;
  clearanceStatus: 'cleared' | 'conditional' | 'blocked' | 'pending_review';
  domains: {
    technical: 'pass' | 'fail' | 'pending' | 'n/a';
    safety: 'pass' | 'fail' | 'pending' | 'n/a';
    medical: 'pass' | 'fail' | 'pending' | 'n/a';
    financial: 'pass' | 'fail' | 'pending' | 'n/a';
    credential: 'pass' | 'fail' | 'pending' | 'n/a';
  };
  blockers?: string[];
  lastUpdated: string;
}

export interface ScrutineeringItem {
  id: string;
  itemName: string;
  teamName: string;
  teamColor: string;
  queuePosition: number;
  stage: 'waiting' | 'in_progress' | 'passed' | 'failed' | 'conditional';
  inspector: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface ComplianceCEOKPI {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  color: string;
}

export const COMPLIANCE_CEO_KPIS: ComplianceCEOKPI[] = [
  { id: 'ck-1', label: 'Clearance Rate', value: '75%', sublabel: '12/16 players cleared for game', color: '#5A8A6E' },
  { id: 'ck-2', label: 'Open Flags', value: '4', sublabel: '2 critical · 1 elevated · 1 pending', color: '#B85C5C' },
  { id: 'ck-3', label: 'Audit Score', value: '88%', sublabel: 'Overall compliance rate this season', color: '#1A1714' },
];

export const CLEARANCE_BOARD: ClearanceBoardEntry[] = [
  { id: 'cb-1', entityName: 'Leo Vasquez (#7)', entityType: 'player', teamName: 'Apex Basketball', teamColor: '#B85C5C', clearanceStatus: 'cleared', domains: { technical: 'pass', safety: 'pass', medical: 'pass', financial: 'pass', credential: 'pass' }, lastUpdated: 'Jul 28' },
  { id: 'cb-2', entityName: 'Nadia Patel (#22)', entityType: 'player', teamName: 'Velocity Works', teamColor: '#1A1714', clearanceStatus: 'cleared', domains: { technical: 'pass', safety: 'pass', medical: 'pass', financial: 'pass', credential: 'pass' }, lastUpdated: 'Jul 28' },
  { id: 'cb-3', entityName: 'Andre Williams (#8)', entityType: 'player', teamName: 'Phoenix Motorsport', teamColor: '#B8943E', clearanceStatus: 'pending_review', domains: { technical: 'pass', safety: 'pass', medical: 'pending', financial: 'pass', credential: 'pass' }, blockers: ['Medical recertification required'], lastUpdated: 'Jul 28' },
  { id: 'cb-4', entityName: 'Carlos Mendez (#99)', entityType: 'player', teamName: 'Shadow GP', teamColor: '#1A1714', clearanceStatus: 'conditional', domains: { technical: 'fail', safety: 'pass', medical: 'pass', financial: 'pending', credential: 'pass' }, blockers: ['Engine seal investigation', 'Q2 budget report overdue'], lastUpdated: 'Jul 28' },
  { id: 'cb-5', entityName: 'Ggame Kim (#18)', entityType: 'player', teamName: 'Shadow GP', teamColor: '#1A1714', clearanceStatus: 'conditional', domains: { technical: 'fail', safety: 'pass', medical: 'pass', financial: 'pending', credential: 'pass' }, blockers: ['Team engine compliance'], lastUpdated: 'Jul 28' },
  { id: 'cb-6', entityName: 'Zach Cooper (#41)', entityType: 'player', teamName: 'Nova Speed', teamColor: '#1A1714', clearanceStatus: 'conditional', domains: { technical: 'pending', safety: 'pass', medical: 'pass', financial: 'pass', credential: 'pending' }, blockers: ['Chassis homologation pending', 'Crew credential gap'], lastUpdated: 'Jul 28' },
  { id: 'cb-7', entityName: 'SHD-Phantom V2 (Car #99)', entityType: 'vehicle', teamName: 'Shadow GP', teamColor: '#1A1714', clearanceStatus: 'blocked', domains: { technical: 'fail', safety: 'pass', medical: 'n/a', financial: 'n/a', credential: 'n/a' }, blockers: ['Engine seal #4 investigation'], lastUpdated: 'Jul 28' },
  { id: 'cb-8', entityName: 'NVA-Bolt B1 (Car #41)', entityType: 'vehicle', teamName: 'Nova Speed', teamColor: '#1A1714', clearanceStatus: 'pending_review', domains: { technical: 'pending', safety: 'pass', medical: 'n/a', financial: 'n/a', credential: 'n/a' }, blockers: ['Front wing re-homologation'], lastUpdated: 'Jul 28' },
  { id: 'cb-9', entityName: 'Portland International Gameway', entityType: 'venue', teamName: '3SSB Circuit', teamColor: '#5A8A6E', clearanceStatus: 'conditional', domains: { technical: 'pass', safety: 'pending', medical: 'pass', financial: 'pass', credential: 'pass' }, blockers: ['Fire suppression re-certification'], lastUpdated: 'Jul 28' },
];

export const SCRUTINEERING_QUEUE: ScrutineeringItem[] = [
  { id: 'sq-1', itemName: 'APX-K1 Mk4 (#7) — Post-Qualifying', teamName: 'Apex Basketball', teamColor: '#B85C5C', queuePosition: 1, stage: 'in_progress', inspector: 'Kenji Tanaka', startedAt: '10:45 AM', notes: 'Random weight check + fuel sample' },
  { id: 'sq-2', itemName: 'VEL-Sprint S3 (#22) — Post-Qualifying', teamName: 'Velocity Works', teamColor: '#1A1714', queuePosition: 2, stage: 'waiting', inspector: 'Kenji Tanaka' },
  { id: 'sq-3', itemName: 'SHD-Phantom V2 (#99) — Engine Re-Inspection', teamName: 'Shadow GP', teamColor: '#1A1714', queuePosition: 3, stage: 'waiting', inspector: 'Kenji Tanaka', notes: 'Priority — engine seal verification' },
  { id: 'sq-4', itemName: 'NVA-Bolt B1 (#41) — Chassis Re-Homologation', teamName: 'Nova Speed', teamColor: '#1A1714', queuePosition: 4, stage: 'waiting', inspector: 'Lab Team', notes: 'Front wing endplate measurement' },
  { id: 'sq-5', itemName: 'PHX-Raptor R2 (#33) — Post-Qualifying', teamName: 'Phoenix Motorsport', teamColor: '#B8943E', queuePosition: 5, stage: 'passed', inspector: 'Kenji Tanaka', startedAt: '10:30 AM', completedAt: '10:42 AM' },
  { id: 'sq-6', itemName: 'ZEN-Pulse P1 (#44) — Post-Qualifying', teamName: 'Zenith Basketball', teamColor: '#5A8A6E', queuePosition: 6, stage: 'passed', inspector: 'Kenji Tanaka', startedAt: '10:15 AM', completedAt: '10:28 AM' },
];

export const CLEARANCE_STATUS_COLOR: Record<string, string> = {
  cleared: '#5A8A6E',
  conditional: '#B8943E',
  blocked: '#B85C5C',
  pending_review: '#1A1714',
};

export const CLEARANCE_STATUS_LABEL: Record<string, string> = {
  cleared: 'CLEARED',
  conditional: 'CONDITIONAL',
  blocked: 'BLOCKED',
  pending_review: 'PENDING',
};

export const DOMAIN_STATUS_COLOR: Record<string, string> = {
  pass: '#5A8A6E',
  fail: '#B85C5C',
  pending: '#B8943E',
  'n/a': '#9C9790',
};

export const SCRUTINEERING_STAGE_COLOR: Record<string, string> = {
  waiting: '#9C9790',
  in_progress: '#B8943E',
  passed: '#5A8A6E',
  failed: '#B85C5C',
  conditional: '#1A1714',
};

export const SCRUTINEERING_STAGE_LABEL: Record<string, string> = {
  waiting: 'WAITING',
  in_progress: 'IN PROGRESS',
  passed: 'PASSED',
  failed: 'FAILED',
  conditional: 'CONDITIONAL',
};
