/**
 * Sports Organization People V2 — Mock Data & Types
 * 10-tab People Hub for Sports Mode organizations.
 * Seeded with KaNeXT Men's Basketball 2025-26 season data.
 * Directory, staff seats, player availability, recruits, medical,
 * role assignments, onboarding, and external contacts.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SportsOrgPeopleSubTab =
  | 'overview'
  | 'directory'
  | 'staff'
  | 'players'
  | 'recruits'
  | 'medical'
  | 'roles-access'
  | 'onboarding'
  | 'contacts'
  | 'admin';

export interface PeopleSubTab {
  id: SportsOrgPeopleSubTab;
  label: string;
  icon: string;
}

export interface PersonRecord {
  id: string;
  name: string;
  type: 'staff' | 'player' | 'recruit' | 'parent' | 'admin';
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  avatarColor: string;
  data_source?: string;
}

export interface StaffSeat {
  id: string;
  title: string;
  name: string | null;
  department: string;
  backup: string | null;
  workload: 'normal' | 'heavy' | 'overloaded';
  isCritical: boolean;
  data_source?: string;
}

export interface PlayerAvailability {
  id: string;
  name: string;
  position: string;
  jerseyNumber: string;
  availability: 'available' | 'limited' | 'unavailable' | 'hold';
  holdReason: string | null;
  clearances: string[];
  nextAction: string;
  data_source?: string;
}

export interface RecruitRecord {
  id: string;
  name: string;
  position: string;
  school: string;
  stage: 'prospect' | 'contacted' | 'visit-scheduled' | 'offered' | 'committed' | 'signed';
  ownerCoach: string;
  lastTouch: string;
  nextTouch: string;
  riskFlag: boolean;
  data_source?: string;
}

export interface MedicalEntry {
  id: string;
  player: string;
  type: 'treatment' | 'limitation' | 'rtp' | 'watchlist';
  description: string;
  severity: 'low' | 'moderate' | 'high';
  status: 'active' | 'resolved';
  provider: string;
  data_source?: string;
}

export interface RoleAssignment {
  id: string;
  person: string;
  role: string;
  accessTier: number;
  overPermissioned: boolean;
  lastReviewed: string;
  data_source?: string;
}

export interface OnboardingCase {
  id: string;
  person: string;
  type: string;
  totalSteps: number;
  completedSteps: number;
  blockers: string[];
  dueDate: string;
  data_source?: string;
}

export interface ContactRecord {
  id: string;
  name: string;
  role: string;
  organization: string;
  phone: string;
  email: string;
  lastVerified: string;
  isStale: boolean;
  data_source?: string;
}

// =============================================================================
// LABEL / COLOR CONSTANTS
// =============================================================================

export const PERSON_TYPE_LABELS: Record<PersonRecord['type'], string> = {
  staff: 'Staff',
  player: 'Player',
  recruit: 'Recruit',
  parent: 'Parent',
  admin: 'Admin',
};

export const PERSON_TYPE_COLORS: Record<PersonRecord['type'], string> = {
  staff: '#1D9BF0',
  player: '#22C55E',
  recruit: '#1D9BF0',
  parent: '#F59E0B',
  admin: '#1D9BF0',
};

export const PERSON_STATUS_LABELS: Record<PersonRecord['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
};

export const PERSON_STATUS_COLORS: Record<PersonRecord['status'], string> = {
  active: '#22C55E',
  inactive: '#A1A1AA',
  pending: '#F59E0B',
};

export const WORKLOAD_LABELS: Record<StaffSeat['workload'], string> = {
  normal: 'Normal',
  heavy: 'Heavy',
  overloaded: 'Overloaded',
};

export const WORKLOAD_COLORS: Record<StaffSeat['workload'], string> = {
  normal: '#22C55E',
  heavy: '#F59E0B',
  overloaded: '#EF4444',
};

export const AVAILABILITY_LABELS: Record<PlayerAvailability['availability'], string> = {
  available: 'Available',
  limited: 'Limited',
  unavailable: 'Unavailable',
  hold: 'Hold',
};

export const AVAILABILITY_COLORS: Record<PlayerAvailability['availability'], string> = {
  available: '#22C55E',
  limited: '#F59E0B',
  unavailable: '#EF4444',
  hold: '#1D9BF0',
};

export const RECRUIT_STAGE_LABELS: Record<RecruitRecord['stage'], string> = {
  prospect: 'Prospect',
  contacted: 'Contacted',
  'visit-scheduled': 'Visit Scheduled',
  offered: 'Offered',
  committed: 'Committed',
  signed: 'Signed',
};

export const RECRUIT_STAGE_COLORS: Record<RecruitRecord['stage'], string> = {
  prospect: '#A1A1AA',
  contacted: '#1D9BF0',
  'visit-scheduled': '#1D9BF0',
  offered: '#F59E0B',
  committed: '#22C55E',
  signed: '#22C55E',
};

export const MEDICAL_TYPE_LABELS: Record<MedicalEntry['type'], string> = {
  treatment: 'Treatment',
  limitation: 'Limitation',
  rtp: 'Return to Play',
  watchlist: 'Watchlist',
};

export const MEDICAL_TYPE_COLORS: Record<MedicalEntry['type'], string> = {
  treatment: '#1D9BF0',
  limitation: '#F59E0B',
  rtp: '#22C55E',
  watchlist: '#1D9BF0',
};

export const MEDICAL_SEVERITY_LABELS: Record<MedicalEntry['severity'], string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

export const MEDICAL_SEVERITY_COLORS: Record<MedicalEntry['severity'], string> = {
  low: '#22C55E',
  moderate: '#F59E0B',
  high: '#EF4444',
};

export const MEDICAL_STATUS_LABELS: Record<MedicalEntry['status'], string> = {
  active: 'Active',
  resolved: 'Resolved',
};

export const MEDICAL_STATUS_COLORS: Record<MedicalEntry['status'], string> = {
  active: '#F59E0B',
  resolved: '#22C55E',
};

export const ONBOARDING_STATUS_COLORS: Record<string, string> = {
  complete: '#22C55E',
  'in-progress': '#1D9BF0',
  blocked: '#EF4444',
};

// =============================================================================
// SUB-TABS
// =============================================================================

export const PEOPLE_SUB_TABS: PeopleSubTab[] = [
  { id: 'overview', label: 'Overview', icon: 'square.grid.2x2.fill' },
  { id: 'directory', label: 'Directory', icon: 'person.crop.rectangle.stack.fill' },
  { id: 'staff', label: 'Staff', icon: 'person.2.fill' },
  { id: 'players', label: 'Players', icon: 'figure.basketball' },
  { id: 'recruits', label: 'Recruits', icon: 'person.badge.plus' },
  { id: 'medical', label: 'Medical', icon: 'cross.case.fill' },
  { id: 'roles-access', label: 'Roles & Access', icon: 'lock.shield.fill' },
  { id: 'onboarding', label: 'Onboarding', icon: 'arrow.right.circle.fill' },
  { id: 'contacts', label: 'Contacts', icon: 'phone.fill' },
  { id: 'admin', label: 'Admin', icon: 'gearshape.fill' },
];

// =============================================================================
// SEEDED DATA — KaNeXT Men's Basketball 2025-26
// =============================================================================

export const DIRECTORY: PersonRecord[] = [
  // Staff — KaNeXT MBB 2025-26 (9 staff + 1 admin)
  { id: 'p-1', name: 'Alex Morgan', type: 'staff', role: 'Head Coach / GM / AD', email: 'skalejaiye@fmu.edu', phone: '(305) 626-3161', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-2', name: 'Coach Marcus Davis', type: 'staff', role: 'Assistant Coach — Recruiting Coordinator', email: 'mdavis@fmu.edu', phone: '(305) 626-3162', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-3', name: 'Coach Andre Williams', type: 'staff', role: 'Assistant Coach — Player Development', email: 'awilliams@fmu.edu', phone: '(305) 626-3163', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-4', name: 'Tyler Brooks', type: 'staff', role: 'Graduate Assistant', email: 'tbrooks@fmu.edu', phone: '(305) 626-3164', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-5', name: 'Dr. Nicole Patterson', type: 'staff', role: 'Athletic Trainer', email: 'npatterson@fmu.edu', phone: '(305) 626-3175', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-6', name: 'Mike Reeves', type: 'staff', role: 'Strength & Conditioning Coach', email: 'mreeves@fmu.edu', phone: '(305) 626-3180', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-7', name: 'Jordan Mitchell', type: 'staff', role: 'Video Coordinator / Analyst', email: 'jmitchell@fmu.edu', phone: '(305) 626-3185', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-8', name: 'Lisa Chen', type: 'staff', role: 'Compliance Liaison', email: 'lchen@fmu.edu', phone: '(305) 626-3190', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-9', name: 'Dr. Robert Hayes', type: 'staff', role: 'Academic Advisor (University-shared)', email: 'rhayes@fmu.edu', phone: '(305) 626-3200', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },
  { id: 'p-10', name: 'Alex Morgan', type: 'admin', role: 'Athletic Director', email: 'skalejaiye@fmu.edu', phone: '(305) 626-3100', status: 'active', avatarColor: '#1D9BF0', data_source: 'demo_seed' },

  // Players — KaNeXT MBB 2025-26 Roster (17)
  { id: 'p-11', name: 'Jalen Carter', type: 'player', role: 'Guard — #1', email: 'jcarter@fmu.edu', phone: '(305) 555-0101', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-12', name: 'Kadyn Selden', type: 'player', role: 'Guard — #2', email: 'kselden@fmu.edu', phone: '(305) 555-0102', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-13', name: 'Jean Mentor', type: 'player', role: 'Guard — #3', email: 'jmentor@fmu.edu', phone: '(305) 555-0103', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-14', name: 'Woody Noel', type: 'player', role: 'Forward — #4', email: 'wnoel@fmu.edu', phone: '(305) 555-0104', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-15', name: 'Terrence Brewer', type: 'player', role: 'Guard — #5', email: 'tbrewer@fmu.edu', phone: '(305) 555-0105', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-16', name: 'Kaleb Munir-Jones', type: 'player', role: 'Forward — #10', email: 'kmunirjones@fmu.edu', phone: '(305) 555-0106', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-17', name: 'Jaylen Thomas', type: 'player', role: 'Forward — #11', email: 'jthomas@fmu.edu', phone: '(305) 555-0107', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-18', name: 'Amar Asceric', type: 'player', role: 'Center — #12', email: 'aasceric@fmu.edu', phone: '(305) 555-0108', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-19', name: 'Brandon Lewis', type: 'player', role: 'Guard — #14', email: 'blewis@fmu.edu', phone: '(305) 555-0109', status: 'pending', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-20', name: 'Jermaine Thompson', type: 'player', role: 'Guard — #15', email: 'jthompson@fmu.edu', phone: '(305) 555-0110', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-21', name: 'Esteban Moratinos', type: 'player', role: 'Forward — #20', email: 'emoratinos@fmu.edu', phone: '(305) 555-0111', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-22', name: 'Darnell Benbo', type: 'player', role: 'Guard — #21', email: 'dbenbo@fmu.edu', phone: '(305) 555-0112', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-23', name: 'Kameron Morris', type: 'player', role: 'Forward — #22', email: 'kmorris@fmu.edu', phone: '(305) 555-0113', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-24', name: 'Devon Turner', type: 'player', role: 'Guard — #24', email: 'dturner@fmu.edu', phone: '(305) 555-0114', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-25', name: 'Trevon Morgan', type: 'player', role: 'Center — #30', email: 'tmorgan@fmu.edu', phone: '(305) 555-0115', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-26', name: 'Marcus Dues', type: 'player', role: 'Forward — #33', email: 'mdues@fmu.edu', phone: '(305) 555-0116', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
  { id: 'p-27', name: 'Joshua Laird', type: 'player', role: 'Center — #44', email: 'jlaird@fmu.edu', phone: '(305) 555-0117', status: 'active', avatarColor: '#22C55E', data_source: 'demo_seed' },
];

export const STAFF_SEATS: StaffSeat[] = [
  {
    id: 'ss-1',
    title: 'Head Coach / GM / AD',
    name: 'Alex Morgan',
    department: 'Coaching / Administration',
    backup: 'Coach Marcus Davis',
    workload: 'heavy',
    isCritical: true,
    data_source: 'demo_seed',
  },
  {
    id: 'ss-2',
    title: 'Assistant Coach — Recruiting Coordinator',
    name: 'Coach Marcus Davis',
    department: 'Coaching',
    backup: 'Coach Andre Williams',
    workload: 'normal',
    isCritical: true,
    data_source: 'demo_seed',
  },
  {
    id: 'ss-3',
    title: 'Assistant Coach — Player Development',
    name: 'Coach Andre Williams',
    department: 'Coaching',
    backup: 'Coach Marcus Davis',
    workload: 'normal',
    isCritical: true,
    data_source: 'demo_seed',
  },
  {
    id: 'ss-4',
    title: 'Graduate Assistant',
    name: 'Tyler Brooks',
    department: 'Coaching',
    backup: null,
    workload: 'normal',
    isCritical: false,
    data_source: 'demo_seed',
  },
  {
    id: 'ss-5',
    title: 'Athletic Trainer',
    name: 'Dr. Nicole Patterson',
    department: 'Medical',
    backup: 'Dr. Maria Santos (external)',
    workload: 'heavy',
    isCritical: true,
    data_source: 'demo_seed',
  },
  {
    id: 'ss-6',
    title: 'Strength & Conditioning Coach',
    name: 'Mike Reeves',
    department: 'Performance',
    backup: null,
    workload: 'normal',
    isCritical: false,
    data_source: 'demo_seed',
  },
  {
    id: 'ss-7',
    title: 'Video Coordinator / Analyst',
    name: 'Jordan Mitchell',
    department: 'Analytics',
    backup: 'Tyler Brooks',
    workload: 'normal',
    isCritical: false,
    data_source: 'demo_seed',
  },
  {
    id: 'ss-8',
    title: 'Compliance Liaison',
    name: 'Lisa Chen',
    department: 'Compliance',
    backup: null,
    workload: 'normal',
    isCritical: true,
    data_source: 'demo_seed',
  },
  {
    id: 'ss-9',
    title: 'Academic Advisor (University-shared)',
    name: 'Dr. Robert Hayes',
    department: 'Academics',
    backup: null,
    workload: 'normal',
    isCritical: false,
    data_source: 'demo_seed',
  },
];

export const PLAYER_AVAILABILITY: PlayerAvailability[] = [
  { id: 'pa-1', name: 'Jalen Carter', position: 'Guard', jerseyNumber: '1', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-2', name: 'Kadyn Selden', position: 'Guard', jerseyNumber: '2', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-3', name: 'Jean Mentor', position: 'Guard', jerseyNumber: '3', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-4', name: 'Woody Noel', position: 'Forward', jerseyNumber: '4', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-5', name: 'Terrence Brewer', position: 'Guard', jerseyNumber: '5', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-6', name: 'Kaleb Munir-Jones', position: 'Forward', jerseyNumber: '10', availability: 'limited', holdReason: null, clearances: ['physical', 'naia'], nextAction: 'Academic check — GPA review Feb 20', data_source: 'demo_seed' },
  { id: 'pa-7', name: 'Jaylen Thomas', position: 'Forward', jerseyNumber: '11', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-8', name: 'Amar Asceric', position: 'Center', jerseyNumber: '12', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-9', name: 'Brandon Lewis', position: 'Guard', jerseyNumber: '14', availability: 'hold', holdReason: 'Transfer eligibility pending — awaiting transcripts from previous institution', clearances: ['physical'], nextAction: 'Registrar follow-up Feb 20', data_source: 'demo_seed' },
  { id: 'pa-10', name: 'Jermaine Thompson', position: 'Guard', jerseyNumber: '15', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-11', name: 'Esteban Moratinos', position: 'Forward', jerseyNumber: '20', availability: 'unavailable', holdReason: 'Right knee sprain — MRI scheduled', clearances: ['academic', 'naia'], nextAction: 'MRI Feb 19 — Dr. Santos', data_source: 'demo_seed' },
  { id: 'pa-12', name: 'Darnell Benbo', position: 'Guard', jerseyNumber: '21', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-13', name: 'Kameron Morris', position: 'Forward', jerseyNumber: '22', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-14', name: 'Devon Turner', position: 'Guard', jerseyNumber: '24', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-15', name: 'Trevon Morgan', position: 'Center', jerseyNumber: '30', availability: 'available', holdReason: null, clearances: ['physical', 'academic', 'naia'], nextAction: 'None', data_source: 'demo_seed' },
  { id: 'pa-16', name: 'Marcus Dues', position: 'Forward', jerseyNumber: '33', availability: 'limited', holdReason: null, clearances: ['physical', 'naia'], nextAction: 'Academic probation review — Dean\'s Office', data_source: 'demo_seed' },
  { id: 'pa-17', name: 'Joshua Laird', position: 'Center', jerseyNumber: '44', availability: 'hold', holdReason: 'Missing physical — mid-year transfer', clearances: [], nextAction: 'Physical scheduled Feb 21', data_source: 'demo_seed' },
];

export const RECRUIT_RECORDS: RecruitRecord[] = [
  {
    id: 'rr-1',
    name: 'Devon Harris',
    position: 'Guard',
    school: 'Miami Norland HS',
    stage: 'visit-scheduled',
    ownerCoach: 'Coach Marcus Davis',
    lastTouch: '2026-02-12',
    nextTouch: '2026-02-22',
    riskFlag: false,
    data_source: 'demo_seed',
  },
  {
    id: 'rr-2',
    name: 'Trey Williams',
    position: 'Forward',
    school: 'Indian River State College',
    stage: 'offered',
    ownerCoach: 'Coach Andre Williams',
    lastTouch: '2026-02-08',
    nextTouch: '2026-02-18',
    riskFlag: true,
    data_source: 'demo_seed',
  },
  {
    id: 'rr-3',
    name: 'Rashad Johnson',
    position: 'Center',
    school: 'Palm Beach Lakes HS',
    stage: 'contacted',
    ownerCoach: 'Coach Marcus Davis',
    lastTouch: '2026-02-05',
    nextTouch: '2026-02-20',
    riskFlag: false,
    data_source: 'demo_seed',
  },
  {
    id: 'rr-4',
    name: 'Cameron Scott',
    position: 'Guard',
    school: 'Hillsborough CC',
    stage: 'committed',
    ownerCoach: 'Coach Andre Williams',
    lastTouch: '2026-02-14',
    nextTouch: '2026-03-01',
    riskFlag: false,
    data_source: 'demo_seed',
  },
  {
    id: 'rr-5',
    name: 'Andre Mitchell',
    position: 'Forward',
    school: 'Carol City HS',
    stage: 'prospect',
    ownerCoach: 'Coach Marcus Davis',
    lastTouch: '2026-01-28',
    nextTouch: '2026-02-25',
    riskFlag: false,
    data_source: 'demo_seed',
  },
  {
    id: 'rr-6',
    name: 'Jamal Robinson',
    position: 'Guard',
    school: 'Broward College',
    stage: 'visit-scheduled',
    ownerCoach: 'Coach Marcus Davis',
    lastTouch: '2026-02-10',
    nextTouch: '2026-02-19',
    riskFlag: true,
    data_source: 'demo_seed',
  },
];

export const MEDICAL_ENTRIES: MedicalEntry[] = [
  {
    id: 'me-1',
    player: 'Esteban Moratinos',
    type: 'treatment',
    description: 'Right knee sprain — lateral collateral. Initial treatment with ice, compression, elevation. MRI pending.',
    severity: 'high',
    status: 'active',
    provider: 'Dr. Maria Santos',
    data_source: 'demo_seed',
  },
  {
    id: 'me-2',
    player: 'Kaleb Munir-Jones',
    type: 'limitation',
    description: 'Mild left ankle tendinitis. Practice limited to non-contact drills. No jumping in warm-ups.',
    severity: 'moderate',
    status: 'active',
    provider: 'Dr. Nicole Patterson',
    data_source: 'demo_seed',
  },
  {
    id: 'me-3',
    player: 'Marcus Dues',
    type: 'watchlist',
    description: 'Recurrent lower back tightness after heavy minutes. Monitoring load and recovery protocol.',
    severity: 'low',
    status: 'active',
    provider: 'Dr. Nicole Patterson',
    data_source: 'demo_seed',
  },
  {
    id: 'me-4',
    player: 'Jalen Carter',
    type: 'rtp',
    description: 'Cleared for full contact after jammed finger (left hand). Taped for games.',
    severity: 'low',
    status: 'resolved',
    provider: 'Dr. Nicole Patterson',
    data_source: 'demo_seed',
  },
];

export const ROLE_ASSIGNMENTS: RoleAssignment[] = [
  { id: 'ra-1', person: 'Alex Morgan', role: 'Head Coach / GM / AD', accessTier: 5, overPermissioned: false, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-2', person: 'Coach Marcus Davis', role: 'Asst Coach — Recruiting', accessTier: 4, overPermissioned: false, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-3', person: 'Coach Andre Williams', role: 'Asst Coach — Player Dev', accessTier: 4, overPermissioned: false, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-4', person: 'Tyler Brooks', role: 'Graduate Assistant', accessTier: 2, overPermissioned: false, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-5', person: 'Dr. Nicole Patterson', role: 'Athletic Trainer', accessTier: 3, overPermissioned: false, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-6', person: 'Mike Reeves', role: 'S&C Coach', accessTier: 2, overPermissioned: false, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-7', person: 'Jordan Mitchell', role: 'Video Coordinator / Analyst', accessTier: 2, overPermissioned: false, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-8', person: 'Lisa Chen', role: 'Compliance Liaison', accessTier: 3, overPermissioned: false, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-9', person: 'Dr. Robert Hayes', role: 'Academic Advisor', accessTier: 2, overPermissioned: true, lastReviewed: '2025-09-01', data_source: 'demo_seed' },
  { id: 'ra-10', person: 'Jalen Carter', role: 'Team Captain', accessTier: 1, overPermissioned: false, lastReviewed: '2025-10-01', data_source: 'demo_seed' },
  { id: 'ra-11', person: 'Jean Mentor', role: 'Team Captain', accessTier: 1, overPermissioned: false, lastReviewed: '2025-10-01', data_source: 'demo_seed' },
];

export const ONBOARDING_CASES: OnboardingCase[] = [
  {
    id: 'ob-1',
    person: 'Joshua Laird',
    type: 'Mid-Year Transfer',
    totalSteps: 8,
    completedSteps: 4,
    blockers: ['Missing physical exam', 'Transcript verification pending'],
    dueDate: '2026-02-25',
    data_source: 'demo_seed',
  },
  {
    id: 'ob-2',
    person: 'Brandon Lewis',
    type: 'Mid-Year Transfer',
    totalSteps: 8,
    completedSteps: 6,
    blockers: ['NAIA eligibility certification'],
    dueDate: '2026-02-20',
    data_source: 'demo_seed',
  },
  {
    id: 'ob-3',
    person: 'Cameron Scott',
    type: 'Spring Commit — Early Access',
    totalSteps: 5,
    completedSteps: 2,
    blockers: [],
    dueDate: '2026-04-15',
    data_source: 'demo_seed',
  },
];

export const EXTERNAL_CONTACTS: ContactRecord[] = [
  { id: 'ec-1', name: 'Dr. Maria Santos', role: 'Team Physician', organization: 'Select Physical Therapy', phone: '(305) 555-0142', email: 'msantos@selectpt.com', lastVerified: '2026-02-01', isStale: false, data_source: 'demo_seed' },
  { id: 'ec-2', name: 'James Howard', role: 'KaNeXT Conference Commissioner', organization: 'KaNeXT Conference', phone: '(863) 555-0200', email: 'jhoward@sunconference.org', lastVerified: '2026-01-15', isStale: false, data_source: 'demo_seed' },
  { id: 'ec-3', name: 'Rachel Thompson', role: 'NAIA Eligibility Center Rep', organization: 'NAIA', phone: '(816) 555-0300', email: 'rthompson@naia.org', lastVerified: '2025-11-10', isStale: true, data_source: 'demo_seed' },
  { id: 'ec-4', name: 'Tony Sanders', role: 'Skills Development Trainer', organization: 'Independent', phone: '(305) 555-0180', email: 'tsanders@gmail.com', lastVerified: '2026-02-10', isStale: false, data_source: 'demo_seed' },
  { id: 'ec-5', name: 'Patricia Wells', role: 'KaNeXT Registrar', organization: 'KaNeXT Sports', phone: '(305) 626-3200', email: 'pwells@fmu.edu', lastVerified: '2026-02-15', isStale: false, data_source: 'demo_seed' },
  { id: 'ec-6', name: 'Michael Rivera', role: 'Charter One Account Manager', organization: 'Charter One Transport', phone: '(954) 555-0350', email: 'mrivera@charterone.com', lastVerified: '2026-01-20', isStale: false, data_source: 'demo_seed' },
  { id: 'ec-7', name: 'Sandra King', role: 'Compliance Officer', organization: 'KaNeXT Sports', phone: '(305) 626-3250', email: 'sking@fmu.edu', lastVerified: '2026-02-05', isStale: false, data_source: 'demo_seed' },
  { id: 'ec-8', name: 'Derek Foster', role: 'NIL Collective Director', organization: '305 Lions NIL', phone: '(305) 555-0400', email: 'dfoster@305lions.com', lastVerified: '2025-12-01', isStale: true, data_source: 'demo_seed' },
];

// =============================================================================
// OVERVIEW SUMMARY
// =============================================================================

export interface PeopleOverview {
  totalPeople: number;
  activePeople: number;
  pendingPeople: number;
  totalStaffSeats: number;
  filledStaffSeats: number;
  vacantStaffSeats: number;
  overloadedStaff: number;
  coverageScore: number;
  totalPlayers: number;
  playersAvailable: number;
  playersLimited: number;
  playersUnavailable: number;
  playersOnHold: number;
  activeRecruits: number;
  recruitsAtRisk: number;
  activeMedicalCases: number;
  highSeverityCases: number;
  overPermissionedRoles: number;
  onboardingBlockers: number;
  staleContacts: number;
}

export function getPeopleOverview(): PeopleOverview {
  const filledSeats = STAFF_SEATS.filter((s) => s.name !== null).length;
  const totalSeats = STAFF_SEATS.length;
  const criticalFilled = STAFF_SEATS.filter((s) => s.isCritical && s.name !== null).length;
  const criticalTotal = STAFF_SEATS.filter((s) => s.isCritical).length;
  const coverageScore = criticalTotal > 0 ? Math.round((criticalFilled / criticalTotal) * 100) : 100;

  const totalBlockers = ONBOARDING_CASES.reduce((sum, c) => sum + c.blockers.length, 0);

  return {
    totalPeople: DIRECTORY.length,
    activePeople: DIRECTORY.filter((p) => p.status === 'active').length,
    pendingPeople: DIRECTORY.filter((p) => p.status === 'pending').length,
    totalStaffSeats: totalSeats,
    filledStaffSeats: filledSeats,
    vacantStaffSeats: totalSeats - filledSeats,
    overloadedStaff: STAFF_SEATS.filter((s) => s.workload === 'overloaded').length,
    coverageScore,
    totalPlayers: PLAYER_AVAILABILITY.length,
    playersAvailable: PLAYER_AVAILABILITY.filter((p) => p.availability === 'available').length,
    playersLimited: PLAYER_AVAILABILITY.filter((p) => p.availability === 'limited').length,
    playersUnavailable: PLAYER_AVAILABILITY.filter((p) => p.availability === 'unavailable').length,
    playersOnHold: PLAYER_AVAILABILITY.filter((p) => p.availability === 'hold').length,
    activeRecruits: RECRUIT_RECORDS.length,
    recruitsAtRisk: RECRUIT_RECORDS.filter((r) => r.riskFlag).length,
    activeMedicalCases: MEDICAL_ENTRIES.filter((m) => m.status === 'active').length,
    highSeverityCases: MEDICAL_ENTRIES.filter((m) => m.severity === 'high' && m.status === 'active').length,
    overPermissionedRoles: ROLE_ASSIGNMENTS.filter((r) => r.overPermissioned).length,
    onboardingBlockers: totalBlockers,
    staleContacts: EXTERNAL_CONTACTS.filter((c) => c.isStale).length,
  };
}
