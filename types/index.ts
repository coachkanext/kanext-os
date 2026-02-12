/**
 * KaNeXT OS Core Types
 * Defines the fundamental data structures used across all modes.
 */

// =============================================================================
// MODES & ROLES
// =============================================================================

export type Mode = 'sports' | 'enterprise' | 'church' | 'education';

export type Role =
  // Enterprise
  | 'founder'
  | 'investor'
  | 'viewer'
  // Sports
  | 'admin'
  | 'head_coach'
  | 'assistant_coach'
  | 'gm'
  | 'student_athlete'
  | 'fan'
  | 'agent'
  | 'scout'
  | 'donor'
  | 'media'
  // Church
  | 'member'
  | 'staff'
  | 'leadership'
  // Education
  | 'faculty'
  | 'student';

// =============================================================================
// CORE ENTITIES
// =============================================================================

export interface User {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  primaryRole: Role;
  organizations: OrganizationMembership[];
}

export interface OrganizationMembership {
  organizationId: string;
  roles: Role[];
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  mode: Mode;
  type: string;
  location?: string;
  description?: string;
}

export interface Cycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}

// =============================================================================
// APP CONTEXT
// =============================================================================

export interface AppContextState {
  mode: Mode;
  organization: Organization | null;
  operatingRole: Role;
  cycle: Cycle | null;
  program: Program | null; // Sports only
  isFirstRun: boolean;
  isLoading: boolean;
}

// =============================================================================
// SPORTS MODE
// =============================================================================

export interface Program {
  id: string;
  name: string;
  level: 'varsity' | 'development_1' | 'development_2' | 'postgrad';
}

export interface SportsOrganization extends Organization {
  programs: Program[];
}

// =============================================================================
// PROGRAM CONTEXT (Nexus Configuration)
// =============================================================================

export type SystemPreset =
  | 'motion_offense'
  | 'pick_and_roll'
  | 'princeton'
  | 'dribble_drive'
  | 'positionless'
  | 'traditional';

export type OffensiveStyle =
  | 'spread_pick_and_roll'
  | 'five_out_motion'
  | 'motion_read_react'
  | 'pace_and_space'
  | 'dribble_drive'
  | 'princeton'
  | 'flex'
  | 'swing'
  | 'post_centric'
  | 'moreyball'
  | 'heliocentric';

export type HeliocentricPosition = 'PG' | 'CG' | 'W' | 'F' | 'B';

export type DefensiveStyle =
  | 'containment_man'
  | 'pack_line'
  | 'pressure_man'
  | 'switch_everything'
  | 'ice_no_middle'
  | 'zone_structured'
  | 'matchup_zone'
  | 'press'
  | 'junk_special';

export type ClusterType =
  | 'shooting'
  | 'finishing'
  | 'playmaking'
  | 'perimeter_defense'
  | 'interior_defense'
  | 'rebounding'
  | 'frame';

export interface ClusterWeight {
  cluster: ClusterType;
  weight: number; // 0-100
}

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';

export interface PositionImportance {
  position: Position;
  weight: number;
}

export type BiasType =
  | 'prefer_experience'
  | 'prefer_youth'
  | 'prefer_size'
  | 'prefer_speed'
  | 'prefer_shooting'
  | 'prefer_defense'
  | 'prefer_local'
  | 'prefer_transfers';

export interface ProgramBias {
  type: BiasType;
  strength: number; // 0-100
  enabled: boolean;
}

export interface ProgramContext {
  programId: string;
  scholarships: number;
  scholarshipsUsed: number;
  nilBudget: number;
  nilUsed: number;
  systemPreset: SystemPreset;
  offensiveStyle: OffensiveStyle;
  heliocentricPosition?: HeliocentricPosition; // Engine position for Heliocentric offense
  defensiveStyle: DefensiveStyle;
  tempo: number; // 0-100 (slow to fast)
  clusterWeights: ClusterWeight[];
  positionImportance: PositionImportance[];
  biases: ProgramBias[];
}

// =============================================================================
// ENTERPRISE MODE
// =============================================================================

export type DocumentCategory = 'investor_materials' | 'governance' | 'institutional_brief' | 'roadmap';
export type DocumentVisibility = 'founder' | 'investor' | 'public';

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  url?: string;
  visibility: DocumentVisibility;
  fileType?: 'pdf' | 'doc' | 'xls' | 'ppt' | 'link';
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  title?: string;
  company?: string;
  bio?: string;
}

export interface Domain {
  id: string;
  name: string;
  mode: Mode;
  description: string;
  status: 'active' | 'development' | 'planned';
  icon: string;
}

export interface EnterpriseScenario {
  id: string;
  title: string;
  prompt: string;
  output: string;
  timestamp: Date;
  isPinned: boolean;
}

export interface EnterpriseOrganization extends Organization {
  legalStructure: string;
  stateOfFormation: string;
  status: string;
  operationalScope: string[];
  documents?: Document[];
  board?: BoardMember[];
  domains?: Domain[];
}

// =============================================================================
// CHURCH MODE
// =============================================================================

export interface ServiceTime {
  day: string;
  time: string;
  service: string;
  campusId?: string;
}

export interface Campus {
  id: string;
  name: string;
  shortName: string;
  location: string;
  address?: string;
  serviceTimes: ServiceTime[];
  description?: string;
}

export type MinistryType = 'childrens' | 'youth' | 'singles' | 'prayer' | 'outreach' | 'worship' | 'missions';

export interface Ministry {
  id: string;
  name: string;
  description?: string;
  type: MinistryType;
  icon?: string;
  accessMethods?: string[];
}

export interface ChurchMessage {
  id: string;
  title: string;
  speaker: string;
  date: Date;
  mediaType: 'video' | 'audio';
  externalUrl?: string;
  seriesName?: string;
  duration?: string;
}

export type GivingType = 'tithe' | 'offering' | 'donation' | 'fundraiser' | 'missions';

export interface GivingOption {
  id: string;
  type: GivingType;
  name: string;
  description?: string;
  externalUrl?: string;
}

export interface ChurchOrganization extends Organization {
  denomination: string;
  campuses: Campus[];
  ministries?: Ministry[];
  serviceTimes?: ServiceTime[];
  givingOptions?: GivingOption[];
}

// =============================================================================
// EDUCATION MODE
// =============================================================================

export type TermType = 'fall' | 'spring' | 'summer' | 'winter' | 'full_year';
export type TermStatus = 'upcoming' | 'current' | 'completed';

export interface AcademicTerm {
  id: string;
  name: string;
  type: TermType;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  status: TermStatus;
}

export type CalendarEventType =
  | 'semester_start'
  | 'semester_end'
  | 'add_drop'
  | 'midterms'
  | 'finals'
  | 'break'
  | 'holiday'
  | 'commencement'
  | 'registration'
  | 'other';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  date: Date;
  endDate?: Date;
  termId?: string;
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  chairId?: string;
  programCount: number;
}

export type FacultyRole = 'president' | 'provost' | 'dean' | 'chair' | 'professor' | 'instructor' | 'staff';

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  role: FacultyRole;
  departmentId?: string;
  bio?: string;
  email?: string;
}

export interface InstitutionalMetrics {
  enrollment: {
    total: number;
    undergraduate: number;
    graduate: number;
    yearOverYearChange: number;
  };
  academics: {
    programs: number;
    facultyCount: number;
    studentFacultyRatio: string;
  };
  outcomes: {
    graduationRate: number;
    retentionRate: number;
    employmentRate: number;
  };
}

export interface EducationOrganization extends Organization {
  institutionType: string;
  programFormats: string[];
  accreditation?: string;
  founded?: number;
  departments?: Department[];
  terms?: AcademicTerm[];
  calendar?: AcademicCalendarEvent[];
  leadership?: FacultyMember[];
  metrics?: InstitutionalMetrics;
}

// =============================================================================
// AUTH & ONBOARDING
// =============================================================================

export type AuthProvider = 'apple' | 'google' | 'email';

export interface AuthSession {
  userId: string;
  displayName: string;
  email: string;
  provider: AuthProvider;
  token: string;
  createdAt: Date;
}

export type OnboardingStep = 'org_code' | 'create_org' | 'viewer' | 'complete';

// =============================================================================
// NEXUS / CONVERSATIONS
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationType = 'chat' | 'eval' | 'sim' | 'game-ops';

export type PlayerEvalRole = 'starter' | 'rotation' | 'development';

export interface PlayerEvalConfig {
  playerId: string | null;
  playerName?: string;
  role: PlayerEvalRole | null;
}

export type SimulationScenario = 'pregame' | 'halftime' | 'endgame' | 'what-if';

export interface SimulationThreadConfig {
  scenario: SimulationScenario | null;
  opponentName?: string;
}

export interface EvalSnapshot {
  id: string;
  generatedAt: Date;
  playerName: string;
  summary: string;
  strengths: string[];
  areasForGrowth: string[];
  projectedImpact: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    isSimulation?: boolean;
    isSavedSimulation?: boolean;
    simulationId?: string;
    simulationParams?: Record<string, unknown>;
    isEval?: boolean;
    evalSnapshotId?: string;
  };
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'member';
}

export interface GameOpsConfig {
  gameId: string;
  opponent: string;
  step: 'gathering' | 'confirm' | 'started';
  periodFormat: 'halves' | 'quarters';
  periodLength: number;       // seconds
  starters: string[];         // player IDs
  league?: string;
  timeouts?: number;
}

export interface Conversation {
  id: string;
  title: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  updatedAt: Date;
  createdAt: Date;
  isGroup: boolean;
  unreadCount: number;
  type: ConversationType;
  isPinned?: boolean;
  evalConfig?: PlayerEvalConfig;
  simConfig?: SimulationThreadConfig;
  gameOpsConfig?: GameOpsConfig;
}

export type NexusPanelState = 'closed' | 'conversations' | 'context' | 'roster' | 'recruiting' | 'simulation';

export interface TargetContext {
  organizationId: string;
  programId?: string;
}

export interface NexusState {
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Message[];
  panelState: NexusPanelState;
  inputText: string;
  isLoading: boolean;
  activeSimulationId: string | null;
  simulations: Record<string, SimulationResult>;
  savedSimulations: Record<string, SavedSimulation>;
  newConversationSheetOpen: boolean;
  evalSnapshots: Record<string, EvalSnapshot>;
  targetContext: TargetContext | 'all';
}

// =============================================================================
// SEARCH
// =============================================================================

export type SearchResultCategory =
  | 'organization'
  | 'member'
  | 'event'
  | 'record'
  | 'media'
  | 'document'
  | 'ministry'
  | 'message';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchResultCategory;
  mode: Mode;
  route: string;
  icon?: string;
}

// =============================================================================
// ACTIVITY
// =============================================================================

export type ActivityType =
  // Sports
  | 'game_final'
  | 'score_updated'
  | 'schedule_updated'
  | 'media_added'
  | 'roster_published'
  // Enterprise
  | 'document_added'
  | 'document_updated'
  | 'scenario_saved'
  | 'config_changed'
  // Church
  | 'message_posted'
  | 'event_updated'
  | 'ministry_updated'
  | 'giving_updated'
  // Education
  | 'calendar_published'
  | 'term_confirmed'
  | 'leadership_updated';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  sourceType: 'organization' | 'event' | 'record' | 'media' | 'system';
  sourceId: string;
  route: string;
  organizationId: string;
  mode: Mode;
  visibility: Role[];
}

// =============================================================================
// SIMULATION
// =============================================================================

export type SimulationType = 'single_game' | 'tournament' | 'season';
export type RosterType = 'official' | 'sandbox';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type VolatilityLevel = 'low' | 'medium' | 'high';

export interface PlayerImpact {
  playerId: string;
  playerName: string;
  position: Position;
  projectedPoints: number;
  projectedRebounds: number;
  projectedAssists: number;
  impactRating: number; // -100 to +100
  keyContribution: string;
}

export interface ProjectedBoxScore {
  teamStats: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fgPct: number;
    threePct: number;
    ftPct: number;
  };
  playerStats: PlayerImpact[];
}

export interface SimulationResult {
  id: string;
  type: SimulationType;
  matchupText: string;
  homeTeam: string;
  awayTeam: string;
  rosterUsed: RosterType;
  timestamp: Date;
  winProbability: number; // 0-100
  projectedScore: {
    home: number;
    away: number;
  };
  projectedMargin: number;
  projectedTotal: number;
  confidence: ConfidenceLevel;
  volatility: VolatilityLevel;
  drivers: string[];
  playerImpact: PlayerImpact[];
  boxScoreProjection?: ProjectedBoxScore;
}

export interface SavedSimulation extends SimulationResult {
  threadId: string;
  savedAt: Date;
  title?: string;
}

// =============================================================================
// PROGRAM RESOURCES (Tier 1 + Tier 2)
// =============================================================================

// Tier 1 - Always visible on Home
export interface RosterSpots {
  current: number;
  max: number;
}

export interface ScholarshipAllocation {
  used: number;
  available: number;
}

export interface NILPool {
  total: number;
  committed: number;
}

// Tier 2 - More Program Resources page
export interface Budget {
  total: number;
  spent: number;
}

export interface ProgramBudgets {
  recruiting: Budget;
  travel: Budget;
  performance: Budget;
}

export interface StaffCoverage {
  coaches: { current: number; max: number };
  supportRoles: {
    at: number;
    snc: number;
    video: number;
    operations: number;
  };
}

export interface FacilitiesAccess {
  practice: {
    dedicatedPracticeGym: boolean;
    sharedPracticeGym: boolean;
    twentyFourSevenAccess: boolean;
    shootingMachines: boolean;
    filmRoom: boolean;
  };
  recovery: {
    weightRoomAccess: boolean;
    dedicatedStrengthArea: boolean;
    recoveryTools: boolean;
    trainingRoom: boolean;
  };
}

export interface ExtendedProgramResources {
  rosterSpots: RosterSpots;
  scholarships: ScholarshipAllocation;
  nilPool: NILPool;
  budgets: ProgramBudgets;
  staff: StaffCoverage;
  facilities: FacilitiesAccess;
}
