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
// ENTERPRISE MODE
// =============================================================================

export interface EnterpriseOrganization extends Organization {
  legalStructure: string;
  stateOfFormation: string;
  status: string;
  operationalScope: string[];
}

// =============================================================================
// CHURCH MODE
// =============================================================================

export interface Campus {
  id: string;
  name: string;
  location: string;
}

export interface ChurchOrganization extends Organization {
  denomination: string;
  campuses: Campus[];
}

// =============================================================================
// EDUCATION MODE
// =============================================================================

export interface EducationOrganization extends Organization {
  institutionType: string;
  programFormats: string[];
}

// =============================================================================
// NEXUS / CONVERSATIONS
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    isSimulation?: boolean;
    simulationParams?: Record<string, unknown>;
  };
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'member';
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
}

export type NexusPanelState = 'closed' | 'conversations' | 'context' | 'roster' | 'recruiting';

export interface NexusState {
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Message[];
  panelState: NexusPanelState;
  inputText: string;
  isLoading: boolean;
}
