/**
 * Nexus Copy Constants — centralized copy for the governed chat interface.
 * Doc 8 tone: calm, confident, decisive. No hedging, no filler.
 */

// =============================================================================
// RECEIPT COPY
// =============================================================================

export const RECEIPT_COPY = {
  create_task: {
    done: (title: string, owner?: string) =>
      `Created Task: '${title}'${owner ? ` (Owner: ${owner})` : ''}.`,
  },
  create_request: {
    created: (title: string, shortId: string) =>
      `Created Request: '${title}' (${shortId}, Status: New).`,
  },
  post_room: {
    posted: (room: string) =>
      `Posted to ${room}. I'll notify you when there's a reply.`,
  },
  approve: {
    done: (id: string) =>
      `Approved: ${id}. Audit note saved.`,
  },
  deny: {
    done: (id: string, reason?: string) =>
      `Denied: ${id}.${reason ? ` Reason: ${reason}` : ''} Audit note saved.`,
  },
  escalate: {
    escalated: (room: string, topic: string) =>
      `Escalated to ${room}: '${topic}'.`,
  },
  generate_packet: {
    done: (type: string, target: string) =>
      `Generated Packet: '${type} — ${target}'.`,
  },
} as const;

// =============================================================================
// CONFIRMATION COPY
// =============================================================================

export const CONFIRMATION_COPY = {
  approve: {
    summary: (id: string) => `Approve request: ${id}`,
    impact: 'This action is final and will notify the submitter.',
  },
  deny: {
    summary: (id: string) => `Deny request: ${id}`,
    impact: 'This action is final. An audit note is required.',
  },
  post_room: {
    summary: (room: string) => `Post to ${room}`,
    impact: 'This will be visible to all room members.',
  },
  generate_packet: {
    summary: (type: string, target: string) => `Generate ${type} packet for ${target}`,
    impact: 'This will create a shareable packet document.',
  },
  default: {
    summary: (action: string) => `Execute action: ${action}`,
    impact: 'This action may affect linked objects.',
  },
} as const;

// =============================================================================
// REFUSAL COPY
// =============================================================================

export const REFUSAL_COPY = {
  prefix: "I can't",
  suffix: 'at your current access level.',
  options_prompt: 'I can:\n1. Create a request to the right owner\n2. Save as open question\nReply 1 or 2.',
  escalation_reason: 'This action requires a higher access level.',
} as const;

// =============================================================================
// EMPTY STATE COPY
// =============================================================================

export const EMPTY_STATE_COPY = {
  no_conversations: 'No conversations yet.',
  no_tasks: 'No tasks. Nice and clean.',
  no_requests: 'No open requests.',
  no_workspaces: 'Create a workspace to organize your threads.',
  loading: 'Loading...',
} as const;

// =============================================================================
// ACTION BUTTON LABELS
// =============================================================================

export const ACTION_LABELS = {
  confirm: 'YES — Execute',
  cancel: 'Cancel',
  create_request: 'Create a Request to the owner',
  save_question: 'Save as Open Question',
} as const;

// =============================================================================
// SYSTEM MESSAGES
// =============================================================================

export const SYSTEM_MESSAGES = {
  context_switched: (name: string) => `Context set to: ${name}`,
  workspace_created: (title: string) => `Workspace created: '${title}'.`,
  workspace_archived: (title: string) => `Workspace archived: '${title}'.`,
  action_completed: 'Action completed.',
  something_wrong: 'Something went wrong. Please try again.',
} as const;
