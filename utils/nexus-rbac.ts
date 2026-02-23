/**
 * Nexus RBAC — 9-level × 9-capability matrix.
 * Determines what a user can do inside Nexus based on their role level.
 */

import type { Mode } from '@/types';
import type { RBACLevel, NexusCapability } from '@/types/nexus-v2';

// =============================================================================
// CAPABILITY MATRIX
// =============================================================================

const CAPABILITY_MATRIX: Record<RBACLevel, NexusCapability[]> = {
  R1: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room', 'C7_approve_deny', 'C8_high_impact', 'C9_cross_context'],
  R2: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room', 'C7_approve_deny'],
  R3: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room', 'C6_summarize_room'],
  R4: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request', 'C5_post_room'],
  R5: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R6: ['C1_ask', 'C2_navigate', 'C3_create_task', 'C4_create_request'],
  R7: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R8: ['C1_ask', 'C2_navigate', 'C4_create_request'],
  R9: ['C1_ask', 'C2_navigate'],
};

export function getUserCapabilities(role: RBACLevel): NexusCapability[] {
  return CAPABILITY_MATRIX[role] || [];
}

export function canPerform(role: RBACLevel, capability: NexusCapability): boolean {
  return CAPABILITY_MATRIX[role]?.includes(capability) ?? false;
}

// =============================================================================
// REFUSAL MESSAGES (Doc 8 tone — calm, decisive, never leak details)
// =============================================================================

const CAPABILITY_LABELS: Record<NexusCapability, string> = {
  C1_ask: 'ask questions',
  C2_navigate: 'navigate',
  C3_create_task: 'create tasks',
  C4_create_request: 'create requests',
  C5_post_room: 'post to rooms',
  C6_summarize_room: 'summarize rooms',
  C7_approve_deny: 'approve or deny requests',
  C8_high_impact: 'execute high-impact actions',
  C9_cross_context: 'search across all contexts',
};

export function getRefusalMessage(capability: NexusCapability): string {
  const label = CAPABILITY_LABELS[capability];
  return `I can't ${label} at your current access level.\nI can:\n1. Create a request to the right owner\n2. Save as open question\nReply 1 or 2.`;
}

// =============================================================================
// ACTION → CAPABILITY MAPPING
// =============================================================================

const ACTION_CAPABILITY_MAP: Record<string, NexusCapability> = {
  create_task: 'C3_create_task',
  create_request: 'C4_create_request',
  post_room: 'C5_post_room',
  summarize_room: 'C6_summarize_room',
  approve: 'C7_approve_deny',
  deny: 'C7_approve_deny',
  escalate: 'C4_create_request',
  generate_packet: 'C8_high_impact',
  navigate: 'C2_navigate',
  switch_context: 'C2_navigate',
  show_contexts: 'C1_ask',
  show_workspaces: 'C1_ask',
  create_workspace: 'C3_create_task',
  add_to_board: 'C3_create_task',
  remove_from_board: 'C3_create_task',
  change_pipeline_stage: 'C3_create_task',
  flag_player: 'C3_create_task',
  create_calendar_event: 'C3_create_task',
  update_scholarship: 'C8_high_impact',
  adjust_budget: 'C8_high_impact',
  send_dm: 'C5_post_room',
  pin_conversation: 'C1_ask',
  unpin_conversation: 'C1_ask',
};

export function getRequiredCapability(actionType: string): NexusCapability | null {
  return ACTION_CAPABILITY_MAP[actionType] ?? null;
}

// =============================================================================
// HIGH-IMPACT ACTION CHECK
// =============================================================================

const HIGH_IMPACT_ACTIONS = new Set([
  'approve', 'deny', 'generate_packet', 'post_room',
  'add_to_board', 'remove_from_board', 'change_pipeline_stage',
  'update_scholarship', 'adjust_budget', 'send_dm',
]);

export function isHighImpactAction(actionType: string): boolean {
  return HIGH_IMPACT_ACTIONS.has(actionType);
}

export function requiresAuditNote(actionType: string): boolean {
  return actionType === 'approve' || actionType === 'deny';
}

// =============================================================================
// ROLE MAPPING (bridge from existing app roles)
// =============================================================================

export function mapRoleToRBAC(role: string, mode: Mode): RBACLevel {
  // Sports mode (R0-R13 → Nexus R1-R9)
  if (mode === 'sports') {
    switch (role) {
      case 'admin':
      case 'athletic_director':
      case 'head_coach':
      case 'gm': return 'R1';
      case 'assistant_coach': return 'R3';
      case 'medical':
      case 'academic': return 'R4';
      case 'student_athlete':
      case 'player': return 'R6';
      case 'family': return 'R7';
      case 'scout':
      case 'agent': return 'R5';
      case 'donor':
      case 'booster': return 'R5';
      case 'fan': return 'R9';
      default: return 'R9';
    }
  }
  // Competition mode (CO0-CO11 → Nexus R1-R9)
  if (mode === 'competition') {
    switch (role) {
      case 'league_admin':
      case 'commissioner': return 'R1';
      case 'deputy_commissioner':
      case 'event_director': return 'R2';
      case 'head_official': return 'R3';
      case 'team_manager':
      case 'team_owner': return 'R4';
      case 'driver':
      case 'player': return 'R6';
      case 'media': return 'R5';
      case 'sponsor': return 'R5';
      case 'fan': return 'R9';
      default: return 'R9';
    }
  }
  // Church mode (C0-C11 → Nexus R1-R9)
  if (mode === 'church') {
    switch (role) {
      case 'leadership':
      case 'senior_pastor': return 'R1';
      case 'executive_pastor': return 'R2';
      case 'ministry_director': return 'R3';
      case 'ministry_leader': return 'R4';
      case 'staff':
      case 'worship_leader': return 'R4';
      case 'volunteer': return 'R6';
      case 'member': return 'R7';
      case 'attendee': return 'R8';
      case 'visitor': return 'R9';
      default: return 'R9';
    }
  }
  // Business mode (B0-B13 → Nexus R1-R9)
  if (mode === 'business') {
    switch (role) {
      case 'founder':
      case 'ceo': return 'R1';
      case 'co_founder':
      case 'c_suite': return 'R2';
      case 'department_head':
      case 'vp': return 'R3';
      case 'team_lead':
      case 'manager': return 'R4';
      case 'employee': return 'R6';
      case 'investor': return 'R5';
      case 'board_member': return 'R5';
      case 'viewer':
      case 'public': return 'R9';
      default: return 'R9';
    }
  }
  // Education mode (E0-E13 → Nexus R1-R9)
  if (mode === 'education') {
    switch (role) {
      case 'president': return 'R1';
      case 'provost':
      case 'dean': return 'R2';
      case 'department_chair': return 'R3';
      case 'faculty': return 'R4';
      case 'advisor': return 'R5';
      case 'student': return 'R7';
      case 'alumni': return 'R8';
      case 'trustee': return 'R5';
      default: return 'R9';
    }
  }
  return 'R9';
}
