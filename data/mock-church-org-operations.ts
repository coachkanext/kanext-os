/**
 * Church Organization Operations — Mock Data & Types
 * Sunday command center for Church Mode.
 * Services | Ops Queue | Run of Show | Teams | Checklists | Incidents
 *
 * Pattern: types first, constants/labels, seed data, factory function.
 * IDs: svc-###, ot-###, ros-###, team-###, ts-###, cl-###, cli-###, oi-###
 */

// =============================================================================
// TYPES
// =============================================================================

export type ServiceStatus = 'upcoming' | 'in_progress' | 'completed';

export type ReadinessLevel = 'green' | 'yellow' | 'red';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'done';

export type TeamSlotStatus = 'filled' | 'vacant' | 'tentative';

export type IncidentSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export type SegmentType =
  | 'pre_service'
  | 'welcome'
  | 'worship'
  | 'offering'
  | 'sermon'
  | 'altar_call'
  | 'benediction'
  | 'post_service';

export interface ServiceSchedule {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ServiceStatus;
  venue: string;
  expectedAttendance: number;
  readiness: ReadinessLevel;
  readinessScore: number;
}

export interface OpsTask {
  id: string;
  serviceId: string;
  title: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime: string;
  category: string;
}

export interface RunOfShowSegment {
  id: string;
  serviceId: string;
  order: number;
  type: SegmentType;
  label: string;
  startTime: string;
  duration: string;
  owner: string;
  cues: string[];
  notes: string;
}

export interface OpsTeam {
  id: string;
  name: string;
  icon: string;
  color: string;
  slots: TeamSlot[];
}

export interface TeamSlot {
  id: string;
  teamId: string;
  role: string;
  serviceId: string;
  assignee: string | null;
  status: TeamSlotStatus;
  critical: boolean;
}

export interface OpsChecklist {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  label: string;
  completed: boolean;
  assignee: string;
}

export interface OpsIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  serviceId: string | null;
  serviceName: string | null;
  reportedBy: string;
  reportedAt: string;
  description: string;
  resolution: string | null;
  preventionNotes: string | null;
}

// =============================================================================
// CONSTANTS & COLOR MAPS
// =============================================================================

export const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  upcoming: '#1D9BF0',
  in_progress: '#22C55E',
  completed: '#A1A1AA',
};

export const READINESS_COLORS: Record<ReadinessLevel, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#A1A1AA',
  medium: '#1D9BF0',
  high: '#F59E0B',
  urgent: '#EF4444',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#F59E0B',
  in_progress: '#1D9BF0',
  done: '#22C55E',
};

export const SLOT_STATUS_COLORS: Record<TeamSlotStatus, string> = {
  filled: '#22C55E',
  vacant: '#EF4444',
  tentative: '#F59E0B',
};

export const INCIDENT_SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  minor: '#A1A1AA',
  moderate: '#F59E0B',
  major: '#EF4444',
  critical: '#EF4444',
};

export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
};

export const SEGMENT_TYPE_LABELS: Record<SegmentType, string> = {
  pre_service: 'Pre-Service',
  welcome: 'Welcome',
  worship: 'Worship',
  offering: 'Offering',
  sermon: 'Sermon',
  altar_call: 'Altar Call',
  benediction: 'Benediction',
  post_service: 'Post-Service',
};

export const SEGMENT_TYPE_COLORS: Record<SegmentType, string> = {
  pre_service: '#A1A1AA',
  welcome: '#1D9BF0',
  worship: '#1D9BF0',
  offering: '#22C55E',
  sermon: '#F59E0B',
  altar_call: '#1D9BF0',
  benediction: '#1D9BF0',
  post_service: '#A1A1AA',
};

// =============================================================================
// SERVICE SCHEDULES — Sunday 2026-02-22
// =============================================================================

const SERVICE_SCHEDULES: ServiceSchedule[] = [
  {
    id: 'svc-001',
    name: '8:00 AM Traditional',
    date: '2026-02-22',
    startTime: '8:00 AM',
    endTime: '9:30 AM',
    status: 'upcoming',
    venue: 'Sanctuary',
    expectedAttendance: 120,
    readiness: 'green',
    readinessScore: 92,
  },
  {
    id: 'svc-002',
    name: '10:30 AM Contemporary',
    date: '2026-02-22',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    status: 'upcoming',
    venue: 'Sanctuary',
    expectedAttendance: 350,
    readiness: 'yellow',
    readinessScore: 78,
  },
  {
    id: 'svc-003',
    name: '6:00 PM Evening',
    date: '2026-02-22',
    startTime: '6:00 PM',
    endTime: '7:30 PM',
    status: 'upcoming',
    venue: 'Fellowship Hall',
    expectedAttendance: 80,
    readiness: 'green',
    readinessScore: 88,
  },
];

// =============================================================================
// OPS QUEUE — 12 tasks across services
// =============================================================================

const OPS_TASKS: OpsTask[] = [
  {
    id: 'ot-001',
    serviceId: 'svc-001',
    title: 'Set up communion table',
    assignee: 'Michael Williams',
    priority: 'urgent',
    status: 'pending',
    dueTime: '7:15 AM',
    category: 'Facilities',
  },
  {
    id: 'ot-002',
    serviceId: 'svc-002',
    title: 'Test livestream encoder and backup',
    assignee: 'Thomas Lee',
    priority: 'high',
    status: 'in_progress',
    dueTime: '9:30 AM',
    category: 'AV',
  },
  {
    id: 'ot-003',
    serviceId: 'svc-001',
    title: 'Print bulletins (120 copies)',
    assignee: 'Catherine Hughes',
    priority: 'medium',
    status: 'done',
    dueTime: '7:00 AM',
    category: 'Facilities',
  },
  {
    id: 'ot-004',
    serviceId: 'svc-002',
    title: 'Place parking lot cones and directional signs',
    assignee: 'Brian Foster',
    priority: 'low',
    status: 'done',
    dueTime: '9:00 AM',
    category: 'Parking',
  },
  {
    id: 'ot-005',
    serviceId: 'svc-002',
    title: 'Sound check worship band',
    assignee: 'James Rivera',
    priority: 'high',
    status: 'in_progress',
    dueTime: '9:45 AM',
    category: 'Worship',
  },
  {
    id: 'ot-006',
    serviceId: 'svc-002',
    title: 'Set AV cameras to mark positions',
    assignee: 'Thomas Lee',
    priority: 'high',
    status: 'pending',
    dueTime: '10:00 AM',
    category: 'AV',
  },
  {
    id: 'ot-007',
    serviceId: 'svc-002',
    title: 'Kids check-in stations ready',
    assignee: 'Rachel Bennett',
    priority: 'medium',
    status: 'in_progress',
    dueTime: '10:00 AM',
    category: 'Kids',
  },
  {
    id: 'ot-008',
    serviceId: 'svc-002',
    title: 'Coffee station prep and stock',
    assignee: 'Angela Davis',
    priority: 'low',
    status: 'done',
    dueTime: '9:30 AM',
    category: 'Facilities',
  },
  {
    id: 'ot-009',
    serviceId: 'svc-001',
    title: 'Tune piano and test organ',
    assignee: 'Sarah Johnson',
    priority: 'medium',
    status: 'done',
    dueTime: '7:30 AM',
    category: 'Worship',
  },
  {
    id: 'ot-010',
    serviceId: 'svc-002',
    title: 'Load sermon slides and lower thirds',
    assignee: 'Thomas Lee',
    priority: 'high',
    status: 'pending',
    dueTime: '10:15 AM',
    category: 'AV',
  },
  {
    id: 'ot-011',
    serviceId: 'svc-003',
    title: 'Set up Fellowship Hall chairs (80 seats)',
    assignee: 'Michael Williams',
    priority: 'medium',
    status: 'pending',
    dueTime: '4:30 PM',
    category: 'Facilities',
  },
  {
    id: 'ot-012',
    serviceId: 'svc-002',
    title: 'Security walkthrough of all entrances',
    assignee: 'David Chen',
    priority: 'high',
    status: 'done',
    dueTime: '9:15 AM',
    category: 'Security',
  },
];

// =============================================================================
// RUN OF SHOW — 10:30 AM Contemporary Service (svc-002), 8 segments
// =============================================================================

const RUN_OF_SHOW: RunOfShowSegment[] = [
  {
    id: 'ros-001',
    serviceId: 'svc-002',
    order: 1,
    type: 'pre_service',
    label: 'Pre-Service Music',
    startTime: '0:00',
    duration: '15 min',
    owner: 'Sarah Johnson',
    cues: [
      'House lights 50%',
      'Background music loop',
      'Welcome slides',
    ],
    notes: 'Ambient instrumental mix — keep energy relaxed. Greeters should be at doors by 10:15.',
  },
  {
    id: 'ros-002',
    serviceId: 'svc-002',
    order: 2,
    type: 'welcome',
    label: 'Welcome & Announcements',
    startTime: '15:00',
    duration: '5 min',
    owner: 'Pastor David Okoro',
    cues: [
      'House lights 100%',
      'Center mic hot',
      'Camera 1',
    ],
    notes: 'Highlight next week\'s community outreach event and new members lunch.',
  },
  {
    id: 'ros-003',
    serviceId: 'svc-002',
    order: 3,
    type: 'worship',
    label: 'Worship Set',
    startTime: '20:00',
    duration: '25 min',
    owner: 'Sarah Johnson',
    cues: [
      'Band starts',
      'Lights program A',
      'Lyrics on screen',
      'Camera 2 wide',
    ],
    notes: 'Set list: "How Great Is Our God", "Goodness of God", "Build My Life", "Holy Spirit". Transition from high energy to contemplative.',
  },
  {
    id: 'ros-004',
    serviceId: 'svc-002',
    order: 4,
    type: 'offering',
    label: 'Offering & Special Music',
    startTime: '45:00',
    duration: '10 min',
    owner: 'Catherine Hughes',
    cues: [
      'Offering plates deploy',
      'Special music track',
      'Giving slide',
    ],
    notes: 'Feature giving QR code on screen. Catherine performs "Amazing Grace" arrangement during collection.',
  },
  {
    id: 'ros-005',
    serviceId: 'svc-002',
    order: 5,
    type: 'sermon',
    label: 'Sermon',
    startTime: '55:00',
    duration: '35 min',
    owner: 'Pastor David Okoro',
    cues: [
      'Pulpit mic',
      'Sermon slides',
      'Camera 1 tight',
      'Record start',
    ],
    notes: 'Series: "Unshakeable Faith" — Week 3: "Faith in the Storm". Key scripture: Mark 4:35-41. Ensure slide deck is preloaded.',
  },
  {
    id: 'ros-006',
    serviceId: 'svc-002',
    order: 6,
    type: 'altar_call',
    label: 'Altar Call',
    startTime: '90:00',
    duration: '10 min',
    owner: 'Pastor Grace Kim',
    cues: [
      'Soft music',
      'Prayer team forward',
      'House lights low',
    ],
    notes: 'Prayer team should be positioned in side aisles before segment begins. Have decision cards and pens at the altar.',
  },
  {
    id: 'ros-007',
    serviceId: 'svc-002',
    order: 7,
    type: 'benediction',
    label: 'Benediction',
    startTime: '100:00',
    duration: '5 min',
    owner: 'Pastor David Okoro',
    cues: [
      'All lights up',
      'Center mic',
      'Closing slide',
    ],
    notes: 'Closing prayer and blessing. Remind congregation of mid-week Bible study and upcoming baptism Sunday.',
  },
  {
    id: 'ros-008',
    serviceId: 'svc-002',
    order: 8,
    type: 'post_service',
    label: 'Post-Service',
    startTime: '105:00',
    duration: '15 min',
    owner: 'Michael Williams',
    cues: [
      'Exit music',
      'Lobby stations active',
      'Tear-down begins',
    ],
    notes: 'New members welcome station in lobby. Coffee and pastries available. Begin sanctuary reset for evening service at 12:45 PM.',
  },
];

// =============================================================================
// TEAMS — 6 teams with slots for the 10:30 AM service (svc-002)
// =============================================================================

const OPS_TEAMS: OpsTeam[] = [
  // ---- AV Team ----
  {
    id: 'team-001',
    name: 'AV',
    icon: 'video.fill',
    color: '#1D9BF0',
    slots: [
      {
        id: 'ts-001',
        teamId: 'team-001',
        role: 'Sound Engineer',
        serviceId: 'svc-002',
        assignee: 'James Rivera',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-002',
        teamId: 'team-001',
        role: 'Camera 1',
        serviceId: 'svc-002',
        assignee: 'Thomas Lee',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-003',
        teamId: 'team-001',
        role: 'Camera 2',
        serviceId: 'svc-002',
        assignee: null,
        status: 'vacant',
        critical: true,
      },
      {
        id: 'ts-004',
        teamId: 'team-001',
        role: 'Livestream Director',
        serviceId: 'svc-002',
        assignee: 'Kevin Park',
        status: 'filled',
        critical: true,
      },
    ],
  },
  // ---- Worship Team ----
  {
    id: 'team-002',
    name: 'Worship',
    icon: 'music.note.list',
    color: '#1D9BF0',
    slots: [
      {
        id: 'ts-005',
        teamId: 'team-002',
        role: 'Worship Leader',
        serviceId: 'svc-002',
        assignee: 'Sarah Johnson',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-006',
        teamId: 'team-002',
        role: 'Pianist',
        serviceId: 'svc-002',
        assignee: 'Emily Park',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-007',
        teamId: 'team-002',
        role: 'Bassist',
        serviceId: 'svc-002',
        assignee: 'Daniel Okafor',
        status: 'filled',
        critical: false,
      },
      {
        id: 'ts-008',
        teamId: 'team-002',
        role: 'Drummer',
        serviceId: 'svc-002',
        assignee: 'Alex Morgan',
        status: 'filled',
        critical: false,
      },
      {
        id: 'ts-009',
        teamId: 'team-002',
        role: 'Vocalist',
        serviceId: 'svc-002',
        assignee: 'Lisa Chen',
        status: 'tentative',
        critical: false,
      },
    ],
  },
  // ---- Ushers ----
  {
    id: 'team-003',
    name: 'Ushers',
    icon: 'person.2.fill',
    color: '#F59E0B',
    slots: [
      {
        id: 'ts-010',
        teamId: 'team-003',
        role: 'Head Usher',
        serviceId: 'svc-002',
        assignee: 'Robert Harris',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-011',
        teamId: 'team-003',
        role: 'Door Greeter',
        serviceId: 'svc-002',
        assignee: 'Patricia Brown',
        status: 'filled',
        critical: false,
      },
      {
        id: 'ts-012',
        teamId: 'team-003',
        role: 'Offering Usher',
        serviceId: 'svc-002',
        assignee: 'Samuel Adeyemi',
        status: 'filled',
        critical: false,
      },
      {
        id: 'ts-013',
        teamId: 'team-003',
        role: 'Overflow Usher',
        serviceId: 'svc-002',
        assignee: null,
        status: 'vacant',
        critical: false,
      },
    ],
  },
  // ---- Kids Ministry ----
  {
    id: 'team-004',
    name: 'Kids Ministry',
    icon: 'figure.and.child.holdinghands',
    color: '#1D9BF0',
    slots: [
      {
        id: 'ts-014',
        teamId: 'team-004',
        role: 'Kids Lead',
        serviceId: 'svc-002',
        assignee: 'Rachel Bennett',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-015',
        teamId: 'team-004',
        role: 'Nursery',
        serviceId: 'svc-002',
        assignee: 'Hannah Torres',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-016',
        teamId: 'team-004',
        role: 'Preschool',
        serviceId: 'svc-002',
        assignee: 'Jessica Kim',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-017',
        teamId: 'team-004',
        role: 'Elementary',
        serviceId: 'svc-002',
        assignee: 'Nathan Brooks',
        status: 'tentative',
        critical: false,
      },
    ],
  },
  // ---- Security ----
  {
    id: 'team-005',
    name: 'Security',
    icon: 'shield.checkered',
    color: '#EF4444',
    slots: [
      {
        id: 'ts-018',
        teamId: 'team-005',
        role: 'Lead',
        serviceId: 'svc-002',
        assignee: 'David Chen',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-019',
        teamId: 'team-005',
        role: 'Parking',
        serviceId: 'svc-002',
        assignee: 'Brian Foster',
        status: 'filled',
        critical: false,
      },
      {
        id: 'ts-020',
        teamId: 'team-005',
        role: 'Interior',
        serviceId: 'svc-002',
        assignee: 'William Anderson',
        status: 'filled',
        critical: false,
      },
    ],
  },
  // ---- Facilities ----
  {
    id: 'team-006',
    name: 'Facilities',
    icon: 'wrench.and.screwdriver.fill',
    color: '#22C55E',
    slots: [
      {
        id: 'ts-021',
        teamId: 'team-006',
        role: 'Setup Lead',
        serviceId: 'svc-002',
        assignee: 'Michael Williams',
        status: 'filled',
        critical: true,
      },
      {
        id: 'ts-022',
        teamId: 'team-006',
        role: 'Cleanup',
        serviceId: 'svc-002',
        assignee: 'Steven Martinez',
        status: 'filled',
        critical: false,
      },
      {
        id: 'ts-023',
        teamId: 'team-006',
        role: 'Coffee Station',
        serviceId: 'svc-002',
        assignee: null,
        status: 'vacant',
        critical: false,
      },
    ],
  },
];

// =============================================================================
// CHECKLISTS — 6 checklists with items
// =============================================================================

const OPS_CHECKLISTS: OpsChecklist[] = [
  // ---- 1. Sunday Open ----
  {
    id: 'cl-001',
    name: 'Sunday Open',
    icon: 'sunrise.fill',
    completedCount: 6,
    totalCount: 8,
    items: [
      {
        id: 'cli-001',
        checklistId: 'cl-001',
        label: 'Unlock all exterior doors',
        completed: true,
        assignee: 'Michael Williams',
      },
      {
        id: 'cli-002',
        checklistId: 'cl-001',
        label: 'Disable alarm system',
        completed: true,
        assignee: 'Michael Williams',
      },
      {
        id: 'cli-003',
        checklistId: 'cl-001',
        label: 'HVAC on — set sanctuary to 72\u00B0F',
        completed: true,
        assignee: 'Steven Martinez',
      },
      {
        id: 'cli-004',
        checklistId: 'cl-001',
        label: 'Lights on — lobby, sanctuary, hallways',
        completed: true,
        assignee: 'Steven Martinez',
      },
      {
        id: 'cli-005',
        checklistId: 'cl-001',
        label: 'Lobby setup — welcome table, info cards',
        completed: true,
        assignee: 'Patricia Brown',
      },
      {
        id: 'cli-006',
        checklistId: 'cl-001',
        label: 'Coffee brewing — 4 carafes minimum',
        completed: true,
        assignee: 'Angela Davis',
      },
      {
        id: 'cli-007',
        checklistId: 'cl-001',
        label: 'Welcome table ready — name tags, guest cards',
        completed: false,
        assignee: 'Patricia Brown',
      },
      {
        id: 'cli-008',
        checklistId: 'cl-001',
        label: 'Parking cones placed at all entrances',
        completed: false,
        assignee: 'Brian Foster',
      },
    ],
  },
  // ---- 2. AV Line Check ----
  {
    id: 'cl-002',
    name: 'AV Line Check',
    icon: 'speaker.wave.3.fill',
    completedCount: 4,
    totalCount: 6,
    items: [
      {
        id: 'cli-009',
        checklistId: 'cl-002',
        label: 'Main speakers tested — left and right channels',
        completed: true,
        assignee: 'James Rivera',
      },
      {
        id: 'cli-010',
        checklistId: 'cl-002',
        label: 'Monitor mix set for worship team',
        completed: true,
        assignee: 'James Rivera',
      },
      {
        id: 'cli-011',
        checklistId: 'cl-002',
        label: 'Mic check all channels (pulpit, lapel, handheld)',
        completed: true,
        assignee: 'James Rivera',
      },
      {
        id: 'cli-012',
        checklistId: 'cl-002',
        label: 'Livestream preview live on staging URL',
        completed: true,
        assignee: 'Thomas Lee',
      },
      {
        id: 'cli-013',
        checklistId: 'cl-002',
        label: 'Recording armed — verify disk space (100 GB min)',
        completed: false,
        assignee: 'Thomas Lee',
      },
      {
        id: 'cli-014',
        checklistId: 'cl-002',
        label: 'Projector warm — test all slides and lyrics',
        completed: false,
        assignee: 'Kevin Park',
      },
    ],
  },
  // ---- 3. Livestream Ready ----
  {
    id: 'cl-003',
    name: 'Livestream Ready',
    icon: 'video.fill',
    completedCount: 3,
    totalCount: 5,
    items: [
      {
        id: 'cli-015',
        checklistId: 'cl-003',
        label: 'Camera positions set — Camera 1 center, Camera 2 wide',
        completed: true,
        assignee: 'Thomas Lee',
      },
      {
        id: 'cli-016',
        checklistId: 'cl-003',
        label: 'Streaming software live — OBS scene transitions tested',
        completed: true,
        assignee: 'Kevin Park',
      },
      {
        id: 'cli-017',
        checklistId: 'cl-003',
        label: 'Lower thirds loaded — pastor name, scripture references',
        completed: true,
        assignee: 'Kevin Park',
      },
      {
        id: 'cli-018',
        checklistId: 'cl-003',
        label: 'Social media scheduled — Facebook, YouTube go-live posts',
        completed: false,
        assignee: 'Angela Davis',
      },
      {
        id: 'cli-019',
        checklistId: 'cl-003',
        label: 'Backup recording — secondary capture device armed',
        completed: false,
        assignee: 'Thomas Lee',
      },
    ],
  },
  // ---- 4. Kids Wing ----
  {
    id: 'cl-004',
    name: 'Kids Wing',
    icon: 'figure.and.child.holdinghands',
    completedCount: 5,
    totalCount: 6,
    items: [
      {
        id: 'cli-020',
        checklistId: 'cl-004',
        label: 'Check-in stations powered and tablets synced',
        completed: true,
        assignee: 'Rachel Bennett',
      },
      {
        id: 'cli-021',
        checklistId: 'cl-004',
        label: 'Curriculum materials ready — lesson plans, coloring sheets',
        completed: true,
        assignee: 'Jessica Kim',
      },
      {
        id: 'cli-022',
        checklistId: 'cl-004',
        label: 'Snack prep — goldfish crackers, juice boxes, allergen labels',
        completed: true,
        assignee: 'Hannah Torres',
      },
      {
        id: 'cli-023',
        checklistId: 'cl-004',
        label: 'Safety walkthroughs — exits clear, first aid stocked',
        completed: true,
        assignee: 'Rachel Bennett',
      },
      {
        id: 'cli-024',
        checklistId: 'cl-004',
        label: 'Volunteer badges printed and distributed',
        completed: true,
        assignee: 'Rachel Bennett',
      },
      {
        id: 'cli-025',
        checklistId: 'cl-004',
        label: 'Parent pagers charged and tested',
        completed: false,
        assignee: 'Nathan Brooks',
      },
    ],
  },
  // ---- 5. Parking ----
  {
    id: 'cl-005',
    name: 'Parking',
    icon: 'car.fill',
    completedCount: 4,
    totalCount: 4,
    items: [
      {
        id: 'cli-026',
        checklistId: 'cl-005',
        label: 'Cones placed at lot entrances and exits',
        completed: true,
        assignee: 'Brian Foster',
      },
      {
        id: 'cli-027',
        checklistId: 'cl-005',
        label: 'Handicap spaces clear and marked',
        completed: true,
        assignee: 'Brian Foster',
      },
      {
        id: 'cli-028',
        checklistId: 'cl-005',
        label: 'Directional signs posted — overflow lot included',
        completed: true,
        assignee: 'Brian Foster',
      },
      {
        id: 'cli-029',
        checklistId: 'cl-005',
        label: 'Safety vests out for parking attendants',
        completed: true,
        assignee: 'David Chen',
      },
    ],
  },
  // ---- 6. Post-Service Close ----
  {
    id: 'cl-006',
    name: 'Post-Service Close',
    icon: 'sunset.fill',
    completedCount: 0,
    totalCount: 6,
    items: [
      {
        id: 'cli-030',
        checklistId: 'cl-006',
        label: 'Tear down communion table and wash service ware',
        completed: false,
        assignee: 'Michael Williams',
      },
      {
        id: 'cli-031',
        checklistId: 'cl-006',
        label: 'Collect and secure offering — two-person count',
        completed: false,
        assignee: 'Catherine Hughes',
      },
      {
        id: 'cli-032',
        checklistId: 'cl-006',
        label: 'Lock all rooms — sanctuary, offices, kids wing',
        completed: false,
        assignee: 'Michael Williams',
      },
      {
        id: 'cli-033',
        checklistId: 'cl-006',
        label: 'Set alarm system — all zones armed',
        completed: false,
        assignee: 'Michael Williams',
      },
      {
        id: 'cli-034',
        checklistId: 'cl-006',
        label: 'HVAC off — verify thermostat setback to 62\u00B0F',
        completed: false,
        assignee: 'Steven Martinez',
      },
      {
        id: 'cli-035',
        checklistId: 'cl-006',
        label: 'Parking lot sweep — cones collected, lot clear',
        completed: false,
        assignee: 'Brian Foster',
      },
    ],
  },
];

// =============================================================================
// INCIDENTS — 4 historical incidents
// =============================================================================

const OPS_INCIDENTS: OpsIncident[] = [
  {
    id: 'oi-001',
    title: 'Livestream dropped mid-sermon',
    severity: 'moderate',
    status: 'resolved',
    serviceId: 'svc-002',
    serviceName: '10:30 AM Contemporary',
    reportedBy: 'Thomas Lee',
    reportedAt: '2026-02-08T11:22:00Z',
    description:
      'Primary livestream encoder lost connection 18 minutes into the sermon. YouTube and Facebook feeds went dark for approximately 2 minutes. Online viewership dropped from 420 to 185 concurrent viewers before recovery.',
    resolution:
      'Switched to backup encoder within 2 minutes. Stream restored and continued without further interruption. Post-mortem identified ISP upstream packet loss as root cause.',
    preventionNotes:
      'Added redundant internet line (Starlink backup). Configured automatic failover between primary and secondary encoders. Added network health monitoring dashboard to AV booth.',
  },
  {
    id: 'oi-002',
    title: 'Medical emergency in sanctuary',
    severity: 'major',
    status: 'resolved',
    serviceId: 'svc-001',
    serviceName: '8:00 AM Traditional',
    reportedBy: 'Michael Williams',
    reportedAt: '2026-01-25T08:47:00Z',
    description:
      'Elderly congregant (78 years old) collapsed during the hymn portion of the 8:00 AM service. Appeared to be cardiac-related. Ushers immediately cleared the area and contacted security lead.',
    resolution:
      'Called 911 immediately. First aid team responded within 90 seconds and administered CPR. Paramedics arrived in 6 minutes. Patient stabilized and transported to Regional Medical Center. Full recovery reported.',
    preventionNotes:
      'Added AED (automated external defibrillator) to sanctuary — mounted near main entrance. Scheduled quarterly first aid and CPR training for all usher and security team members. Added medical emergency protocol card to every usher station.',
  },
  {
    id: 'oi-003',
    title: 'Parking lot fender bender',
    severity: 'minor',
    status: 'resolved',
    serviceId: 'svc-002',
    serviceName: '10:30 AM Contemporary',
    reportedBy: 'Brian Foster',
    reportedAt: '2026-02-01T10:18:00Z',
    description:
      'Two vehicles made contact in the main parking lot near the east entrance during the 10:30 AM service arrival rush. Minor cosmetic damage to both vehicles, no injuries. Briefly caused a traffic backup at the lot entrance.',
    resolution:
      'Parking team directed traffic around the incident. Both drivers exchanged insurance information and filed a report. No injuries and no emergency services required. Lot flow restored within 10 minutes.',
    preventionNotes:
      'Added speed bumps near the east entrance approach. Repositioned directional cones to create a wider turning radius. Added a second parking attendant at the east entrance during peak arrival (10:00-10:45 AM).',
  },
  {
    id: 'oi-004',
    title: 'Power outage during worship rehearsal',
    severity: 'critical',
    status: 'open',
    serviceId: null,
    serviceName: null,
    reportedBy: 'Angela Davis',
    reportedAt: '2026-02-13T19:32:00Z',
    description:
      'Main breaker tripped during Thursday evening worship rehearsal. Entire building lost power for approximately 45 minutes. AV equipment, HVAC, and lighting all went down. Emergency exit lighting activated as expected. Root cause under investigation — suspected overload on Panel B from portable heaters in the fellowship hall.',
    resolution: null,
    preventionNotes: null,
  },
];

// =============================================================================
// SUB-TAB DEFINITIONS
// =============================================================================

export type ChurchOpsSubTabId =
  | 'command'
  | 'services'
  | 'ops_queue'
  | 'run_of_show'
  | 'teams'
  | 'checklists'
  | 'incidents';

export interface ChurchOpsSubTab {
  id: ChurchOpsSubTabId;
  label: string;
  icon: string;
}

export const CHURCH_OPS_SUB_TABS: ChurchOpsSubTab[] = [
  { id: 'command', label: 'Command', icon: 'gauge.with.dots.needle.33percent' },
  { id: 'services', label: 'Services', icon: 'calendar.badge.clock' },
  { id: 'ops_queue', label: 'Ops Queue', icon: 'checklist' },
  { id: 'run_of_show', label: 'Run of Show', icon: 'list.bullet.clipboard' },
  { id: 'teams', label: 'Teams', icon: 'person.3.fill' },
  { id: 'checklists', label: 'Checklists', icon: 'checkmark.square.fill' },
  { id: 'incidents', label: 'Incidents', icon: 'exclamationmark.triangle.fill' },
];

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

export const TASK_CATEGORIES = [
  'All',
  'AV',
  'Facilities',
  'Worship',
  'Security',
  'Kids',
  'Parking',
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_CATEGORY_COLORS: Record<string, string> = {
  AV: '#1D9BF0',
  Facilities: '#22C55E',
  Worship: '#1D9BF0',
  Security: '#EF4444',
  Kids: '#1D9BF0',
  Parking: '#F59E0B',
};

// =============================================================================
// LABEL HELPERS
// =============================================================================

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const READINESS_LABELS: Record<ReadinessLevel, string> = {
  green: 'Ready',
  yellow: 'Attention Needed',
  red: 'Not Ready',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
};

export const SLOT_STATUS_LABELS: Record<TeamSlotStatus, string> = {
  filled: 'Filled',
  vacant: 'Vacant',
  tentative: 'Tentative',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  major: 'Major',
  critical: 'Critical',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
};

// =============================================================================
// COMMAND CENTER SUMMARY TILES
// =============================================================================

export interface CommandTile {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

function buildCommandTiles(): CommandTile[] {
  const avgReadiness = Math.round(
    SERVICE_SCHEDULES.reduce((sum, svc) => sum + svc.readinessScore, 0) /
      SERVICE_SCHEDULES.length
  );

  const openTasks = OPS_TASKS.filter((t) => t.status !== 'done').length;
  const totalTasks = OPS_TASKS.length;

  const teamVacancies = OPS_TEAMS.reduce(
    (sum, team) => sum + team.slots.filter((s) => s.status === 'vacant').length,
    0
  );

  const checklistProgress = OPS_CHECKLISTS.reduce(
    (acc, cl) => ({
      done: acc.done + cl.completedCount,
      total: acc.total + cl.totalCount,
    }),
    { done: 0, total: 0 }
  );

  const openIncidents = OPS_INCIDENTS.filter((i) => i.status !== 'resolved').length;

  const nextService =
    SERVICE_SCHEDULES.find((s) => s.status === 'upcoming') || SERVICE_SCHEDULES[0];

  return [
    {
      id: 'ct-readiness',
      label: 'Readiness Score',
      value: `${avgReadiness}%`,
      icon: 'gauge.with.dots.needle.33percent',
      color: avgReadiness >= 85 ? '#22C55E' : avgReadiness >= 70 ? '#F59E0B' : '#EF4444',
    },
    {
      id: 'ct-next-service',
      label: 'Next Service',
      value: nextService.name,
      icon: 'clock.fill',
      color: '#1D9BF0',
    },
    {
      id: 'ct-open-tasks',
      label: 'Open Tasks',
      value: `${openTasks}/${totalTasks}`,
      icon: 'checklist',
      color: openTasks > 6 ? '#F59E0B' : '#22C55E',
    },
    {
      id: 'ct-team-vacancies',
      label: 'Team Vacancies',
      value: `${teamVacancies}`,
      icon: 'person.fill.questionmark',
      color: teamVacancies > 0 ? '#EF4444' : '#22C55E',
    },
    {
      id: 'ct-checklists',
      label: 'Checklists',
      value: `${checklistProgress.done}/${checklistProgress.total}`,
      icon: 'checkmark.square.fill',
      color: '#1D9BF0',
    },
    {
      id: 'ct-incidents',
      label: 'Open Incidents',
      value: `${openIncidents}`,
      icon: 'exclamationmark.triangle.fill',
      color: openIncidents > 0 ? '#EF4444' : '#22C55E',
    },
  ];
}

// =============================================================================
// DATA ACCESSOR
// =============================================================================

export interface ChurchOperationsData {
  services: ServiceSchedule[];
  opsQueue: OpsTask[];
  runOfShow: RunOfShowSegment[];
  teams: OpsTeam[];
  checklists: OpsChecklist[];
  incidents: OpsIncident[];
  commandTiles: {
    tiles: CommandTile[];
    readinessScore: number;
    nextService: ServiceSchedule;
    openTasks: number;
    teamVacancies: number;
  };
}

export function getChurchOperationsData(): ChurchOperationsData {
  const avgReadiness = Math.round(
    SERVICE_SCHEDULES.reduce((sum, svc) => sum + svc.readinessScore, 0) /
      SERVICE_SCHEDULES.length
  );

  const nextService =
    SERVICE_SCHEDULES.find((s) => s.status === 'upcoming') || SERVICE_SCHEDULES[0];

  const openTasks = OPS_TASKS.filter((t) => t.status !== 'done').length;

  const teamVacancies = OPS_TEAMS.reduce(
    (sum, team) => sum + team.slots.filter((s) => s.status === 'vacant').length,
    0
  );

  return {
    services: SERVICE_SCHEDULES,
    opsQueue: OPS_TASKS,
    runOfShow: RUN_OF_SHOW,
    teams: OPS_TEAMS,
    checklists: OPS_CHECKLISTS,
    incidents: OPS_INCIDENTS,
    commandTiles: {
      tiles: buildCommandTiles(),
      readinessScore: avgReadiness,
      nextService,
      openTasks,
      teamVacancies,
    },
  };
}
