/**
 * Nexus v2 Type Contracts
 * Governed object model for the universal chat interface.
 * See: Nexus Docs 1–9 (ChatGPT-first, RBAC, governed actions, workspaces)
 */

import type { Mode, Message } from './index';

// =============================================================================
// UNIVERSAL FIELDS
// =============================================================================

/** Context scope for every governed object */
export interface NexusContext {
  mode: Mode;
  org_id: string;
  org_name: string;
  scope_type: 'org' | 'program' | 'event' | 'ministry' | 'workspace';
  scope_id?: string;
  scope_name?: string;
  season_id?: string;
  season_label?: string;
}

/** Owner representation (consistent everywhere) */
export interface Owner {
  owner_type: 'user' | 'role';
  owner_id: string;
  owner_label: string;
}

/** Tappable reference chip linking to an internal object */
export interface LinkChip {
  id: string;
  objectType:
    | 'player' | 'team' | 'game' | 'room' | 'request' | 'task'
    | 'workspace' | 'resource' | 'packet' | 'case' | 'receipt'
    | 'compliance_item' | 'finance_event' | 'sponsor';
  objectId: string;
  label: string;
  icon?: string;
  route?: string;
}

/** Immutable audit note (required for sensitive actions) */
export interface AuditNote {
  id: string;
  context: NexusContext;
  workspace_id?: string;
  actor_user_id: string;
  actor_label: string;
  note_text: string;
  related_object?: LinkChip;
  created_at: string; // ISO
}

// =============================================================================
// RBAC
// =============================================================================

export type RBACLevel =
  | 'R1' // Full Access (Owner/Commissioner/AD/Founder)
  | 'R2' // Program-Level (Director/Head Coach/Program Director)
  | 'R3' // Ministry-Level (Ministry lead/teacher)
  | 'R4' // Limited Professional (assistant/scout/analyst)
  | 'R5' // Limited Advisory (advisor)
  | 'R6' // Player-Level (athlete)
  | 'R7' // Student-Level (student)
  | 'R8' // Parent-Level (guardian)
  | 'R9'; // Public Only (fan/general viewer)

export type NexusCapability =
  | 'C1_ask'           // Ask questions (read)
  | 'C2_navigate'      // Navigate/open surfaces
  | 'C3_create_task'   // Create tasks
  | 'C4_create_request'// Create requests
  | 'C5_post_room'     // Post to rooms
  | 'C6_summarize_room'// Summarize rooms
  | 'C7_approve_deny'  // Approve/deny requests
  | 'C8_high_impact'   // High-impact execute (payments/compliance/locks)
  | 'C9_cross_context'; // "All My Contexts" scope

// =============================================================================
// ENHANCED MESSAGE (v2)
// =============================================================================

export type MessageType = 'text' | 'receipt' | 'confirmation' | 'escalation' | 'system' | 'player_card' | 'stat_table' | 'kr_card';
export type ReceiptStatus = 'done' | 'posted' | 'created' | 'updated' | 'blocked' | 'escalated' | 'failed';
export type ConfirmationState = 'pending' | 'confirmed' | 'cancelled';

/** Structured content block inside a Nexus response */
export interface StructuredBlock {
  type: 'section' | 'stat_row' | 'bullet_list' | 'callout' | 'divider';
  title?: string;
  items?: string[];
  stats?: { label: string; value: string; color?: string }[];
  content?: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
}

/** Receipt payload embedded in a message */
export interface ReceiptPayload {
  status: ReceiptStatus;
  action_type: string; // e.g. 'create_task', 'post_room', 'approve_request'
  summary: string;
  objects: LinkChip[];
  audit_note_id?: string;
  target_room?: string;
}

/** Confirmation payload embedded in a message */
export interface ConfirmationPayload {
  state: ConfirmationState;
  action_summary: string;
  target_context: string; // e.g. "Sports · KaNeXT · Men's Basketball · 2025–26"
  impact_line: string;
  requires_audit_note: boolean;
}

/** Escalation payload embedded in a message */
export interface EscalationPayload {
  reason: string;
  target_room: string;
  target_room_id: string;
  target_owner: string;
  options: { label: string; action: 'post_room' | 'create_request' | 'save_question' }[];
}

/** Inline player card payload */
export interface PlayerCardPayload {
  playerId: string;
  name: string;
  position: string;
  team: string;
  kr?: number;
  levelKey?: string;
  archetype?: string;
}

/** Inline stat table payload */
export interface StatTablePayload {
  title?: string;
  headers: string[];
  rows: string[][];
}

/** Inline KR card payload */
export interface KRCardPayload {
  playerId: string;
  name: string;
  kr: number;
  levelKey?: string;
  archetype?: string;
  clusters?: Record<string, number>;
}

/** Enhanced message with rich rendering support */
export interface MessageV2 extends Omit<Message, 'metadata'> {
  messageType: MessageType;
  linkChips?: LinkChip[];
  structuredBlocks?: StructuredBlock[];
  receipt?: ReceiptPayload;
  confirmation?: ConfirmationPayload;
  escalation?: EscalationPayload;
  playerCard?: PlayerCardPayload;
  statTable?: StatTablePayload;
  krCard?: KRCardPayload;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// GOVERNED OBJECTS
// =============================================================================

// ── Task ──

export type TaskStatus = 'open' | 'in_progress' | 'waiting' | 'done' | 'canceled';
export type TaskPriority = 'normal' | 'high' | 'blocker';

export interface NexusTask {
  id: string;
  title: string;
  context: NexusContext;
  workspace_id?: string;
  owner: Owner;
  priority: TaskPriority;
  status: TaskStatus;
  due_at?: string; // ISO
  tags: string[];
  linked_objects: LinkChip[];
  notes?: string;
  created_by: string;
  created_at: string; // ISO
  updated_at: string; // ISO
}

// ── Request ──

export type RequestType =
  | 'approval'
  | 'waiver'
  | 'schedule_change'
  | 'compliance_exception'
  | 'payment_release'
  | 'protest_appeal'
  | 'rights_claim'
  | 'sponsor_verification'
  | 'safety_concern'
  | 'support'
  | 'other';

export type RequestStatus =
  | 'new'
  | 'assigned'
  | 'awaiting_info'
  | 'under_review'
  | 'approved'
  | 'denied'
  | 'closed';

export interface ImpactFlags {
  blocks_start: boolean;
  blocks_results_lock: boolean;
  blocks_payout: boolean;
  broadcast_risk: boolean;
  sponsor_risk: boolean;
  compliance_risk: boolean;
  safety_risk: boolean;
}

export interface NexusRequest {
  id: string;
  short_id: string; // e.g. "REQ-1042"
  request_type: RequestType;
  title: string;
  context: NexusContext;
  workspace_id?: string;
  submitted_by: string;
  assigned_owner?: Owner;
  status: RequestStatus;
  due_at?: string; // ISO
  impact_flags: ImpactFlags;
  evidence: Attachment[];
  audit_notes: AuditNote[];
  linked_objects: LinkChip[];
  created_at: string; // ISO
  updated_at: string; // ISO
}

// ── Room (extends existing, typed for Nexus routing) ──

export type NexusRoomType =
  | 'staff' | 'ops_command' | 'film_qa' | 'recruiting'
  | 'compliance_desk' | 'finance_desk' | 'stewards_desk'
  | 'broadcast_ops' | 'sponsor_delivery' | 'teaching_team'
  | 'pastor_desk' | 'care_team' | 'investor_relations'
  | 'board_room' | 'registrar_desk' | 'student_support'
  | 'player_support' | 'media_ops' | 'ad_command'
  | 'travel_ops' | 'game_command' | 'dev_unit' | 'other';

export interface NexusRoom {
  id: string;
  name: string;
  context: NexusContext;
  room_type: NexusRoomType;
  visibility: 'scoped' | 'restricted';
  owners: Owner[];
  active_blockers_count?: number;
  next_deadline_at?: string; // ISO
  created_at: string;
  updated_at: string;
}

// ── Workspace ──

export type WorkspaceType =
  | 'season_hq' | 'program_hq' | 'org_hq'
  | 'game_week' | 'race_week' | 'event_ops' | 'sunday_service'
  | 'recruiting_board' | 'sponsor_delivery' | 'compliance_readiness'
  | 'fundraising' | 'dataroom' | 'case' | 'other';

export type WorkspaceVisibility = 'public' | 'scoped' | 'restricted';

export interface NexusWorkspace {
  id: string;
  title: string;
  description?: string;
  context: NexusContext;
  workspace_type: WorkspaceType;
  visibility: WorkspaceVisibility;
  owners: Owner[];
  thread_ids: string[];
  pinned_link_chips: LinkChip[];
  linked_rooms: LinkChip[];
  linked_objects: LinkChip[];
  created_at: string; // ISO
  updated_at: string; // ISO
}

// ── Packet ──

export interface PacketSection {
  heading: string;
  bullets: string[];
}

export interface NexusPacket {
  id: string;
  title: string;
  context: NexusContext;
  workspace_id?: string;
  packet_type:
    | 'game_plan_brief' | 'race_week_readiness' | 'sponsor_delivery_report'
    | 'compliance_summary' | 'investor_update' | 'board_packet'
    | 'academic_term_report' | 'scouting_brief' | 'other';
  inputs: LinkChip[];
  generated_by: string;
  summary_text: string;
  sections: PacketSection[];
  created_at: string; // ISO
}

// ── Case (Integrity / Compliance incident) ──

export type CaseType = 'integrity' | 'compliance' | 'finance_exception' | 'safety';
export type CaseSeverity = 'low' | 'medium' | 'high' | 'critical';
export type CaseStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export interface CaseTimelineEvent {
  timestamp: string;
  note: string;
}

export interface CaseDecision {
  timestamp: string;
  decision: string;
  audit_note_id: string;
}

export interface NexusCase {
  id: string;
  case_type: CaseType;
  title: string;
  context: NexusContext;
  workspace_id?: string;
  severity: CaseSeverity;
  status: CaseStatus;
  assigned_owner: Owner;
  restricted: boolean;
  evidence: Attachment[];
  timeline_events: CaseTimelineEvent[];
  decisions: CaseDecision[];
  linked_requests: LinkChip[];
  linked_rooms: LinkChip[];
  created_at: string; // ISO
  updated_at: string; // ISO
}

// ── Attachment / Evidence ──

export interface Attachment {
  id: string;
  attachment_type: 'link' | 'file' | 'video' | 'clip';
  label: string;
  url?: string;
  source?: string; // e.g. "Synergy", "YouTube", "Drive", "Internal"
  created_at: string; // ISO
}

// ── Nexus Thread ──

export type ScopeMode = 'this_context' | 'all_my_contexts';

export interface NexusThread {
  id: string;
  title: string;
  context: NexusContext;
  workspace_id?: string;
  scope_mode: ScopeMode;
  pinned_link_chips: LinkChip[];
  last_activity_at: string; // ISO
}

// =============================================================================
// ACTION INTENTS (for governed action pipeline)
// =============================================================================

export type ActionIntent =
  | { type: 'create_task'; title: string; assignee?: string; due?: string; priority?: TaskPriority }
  | { type: 'create_request'; request_type: RequestType; title: string }
  | { type: 'post_room'; room_name?: string; content: string }
  | { type: 'approve'; request_id: string }
  | { type: 'deny'; request_id: string; reason?: string }
  | { type: 'escalate'; topic: string; target_room?: string }
  | { type: 'generate_packet'; packet_type: string; target: string }
  | { type: 'navigate'; target: string }
  | { type: 'switch_context'; target_name: string }
  | { type: 'show_contexts' }
  | { type: 'show_workspaces' }
  | { type: 'create_workspace'; title: string; template?: WorkspaceType }
  | { type: 'summarize_room'; room_name: string }
  | { type: 'add_to_board'; player_name: string; stage?: string }
  | { type: 'remove_from_board'; player_name: string }
  | { type: 'change_pipeline_stage'; player_name: string; stage: string }
  | { type: 'flag_player'; player_name: string; reason?: string }
  | { type: 'create_calendar_event'; title: string; date?: string; time?: string }
  | { type: 'update_scholarship'; player_name: string; percentage?: number }
  | { type: 'adjust_budget'; category: string; amount: number; direction: 'increase' | 'decrease' }
  | { type: 'send_dm'; recipient: string; content: string }
  | { type: 'pin_conversation' }
  | { type: 'unpin_conversation' }
  | { type: 'none' }; // fallback → send to GPT

// =============================================================================
// ROUTING
// =============================================================================

export type RoutingTopic =
  | 'learning' | 'ops' | 'compliance' | 'finance'
  | 'integrity' | 'media' | 'recruiting' | 'support' | 'safety';

export interface RoutingResult {
  room_id: string;
  room_title: string;
  owner: Owner;
  confidence: 'exact' | 'inferred';
}

export interface ModeRoutingProfile {
  default_rooms: { id: string; name: string; type: NexusRoomType }[];
  owner_ladders: Record<RoutingTopic, Owner[]>;
  topic_routes: Record<RoutingTopic, string>; // topic → room_id
  vocabulary: Record<string, string>;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Type guard: is this message a v2 message? */
export function isMessageV2(msg: Message | MessageV2): msg is MessageV2 {
  return 'messageType' in msg;
}
