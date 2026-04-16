/**
 * Nexus Action Engine — Parse → Validate → Confirm → Execute → Receipt lifecycle.
 * All actions are mock-executed (demo-grade).
 */

import type { MessageV2, ActionIntent, RBACLevel, NexusContext, LinkChip } from '@/types/nexus-v2';
import { canPerform, getRequiredCapability, getRefusalMessage, isHighImpactAction, requiresAuditNote, getAuthorityLabel } from './nexus-rbac';
import { autoRoute } from './nexus-room-routing';

// =============================================================================
// ACTION RESULT
// =============================================================================

export interface ActionResult {
  /** If true, show the messages in the chat */
  handled: boolean;
  /** Messages to inject into the thread (receipts, confirmations, refusals) */
  messages: MessageV2[];
  /** If true, the action requires confirmation before execution */
  needsConfirmation: boolean;
  /** The pending action to store (for confirmation flow) */
  pendingAction?: ActionIntent;
}

// =============================================================================
// PROCESS ACTION
// =============================================================================

export function processAction(
  intent: ActionIntent,
  context: NexusContext,
  role: RBACLevel,
  conversationId: string,
  operatingRole?: string,
): ActionResult {
  if (intent.type === 'none') {
    return { handled: false, messages: [], needsConfirmation: false };
  }

  // 1. Validate — check RBAC
  const requiredCapability = getRequiredCapability(intent.type);
  if (requiredCapability && !canPerform(role, requiredCapability)) {
    const refusalMsg = createRefusalMessage(intent, context, conversationId, requiredCapability, operatingRole);
    return { handled: true, messages: [refusalMsg], needsConfirmation: false };
  }

  // 2. Check if confirmation needed
  if (isHighImpactAction(intent.type)) {
    const confirmMsg = createConfirmationMessage(intent, context, conversationId);
    return {
      handled: true,
      messages: [confirmMsg],
      needsConfirmation: true,
      pendingAction: intent,
    };
  }

  // 3. Execute directly + return receipt
  const receiptMsg = executeAction(intent, context, conversationId);
  return { handled: true, messages: [receiptMsg], needsConfirmation: false };
}

// =============================================================================
// EXECUTE CONFIRMED ACTION
// =============================================================================

export function executeConfirmedAction(
  intent: ActionIntent,
  context: NexusContext,
  conversationId: string,
): MessageV2 {
  return executeAction(intent, context, conversationId);
}

// =============================================================================
// INTERNAL EXECUTION (mock)
// =============================================================================

function executeAction(
  intent: ActionIntent,
  context: NexusContext,
  conversationId: string,
): MessageV2 {
  const now = new Date();
  const baseId = `receipt-${Date.now()}`;
  const contextLabel = `${context.mode === 'sports' ? 'Athletics' : context.mode} · ${context.org_name}${context.scope_name ? ' · ' + context.scope_name : ''}`;

  switch (intent.type) {
    case 'create_task': {
      const taskId = `nt-${Date.now()}`;
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'done',
          action_type: 'create_task',
          summary: `Created Task: '${intent.title}' (Owner: ${intent.assignee || 'Unassigned'}${intent.due ? `, Due: ${intent.due}` : ''}).`,
          objects: [
            { id: `lc-${taskId}`, objectType: 'task', objectId: taskId, label: intent.title },
          ],
        },
      };
    }

    case 'create_request': {
      const reqId = `nr-${Date.now()}`;
      const shortId = `REQ-${1046 + Math.floor(Math.random() * 100)}`;
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'created',
          action_type: 'create_request',
          summary: `Created Request: '${intent.title}' (${shortId}, Status: New).`,
          objects: [
            { id: `lc-${reqId}`, objectType: 'request', objectId: reqId, label: `${shortId}: ${intent.title}` },
          ],
        },
      };
    }

    case 'post_room': {
      const roomName = intent.room_name || 'Staff Room';
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'posted',
          action_type: 'post_room',
          summary: `Posted to ${roomName}. I'll notify you when there's a reply.`,
          target_room: roomName,
          objects: [
            { id: 'lc-room-post', objectType: 'room', objectId: 'rm-posted', label: roomName },
          ],
        },
      };
    }

    case 'approve': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'done',
          action_type: 'approve',
          summary: `Approved: ${intent.request_id}. Audit note saved.`,
          objects: [
            { id: 'lc-approved', objectType: 'request', objectId: intent.request_id, label: intent.request_id },
          ],
        },
      };
    }

    case 'deny': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'done',
          action_type: 'deny',
          summary: `Denied: ${intent.request_id}.${intent.reason ? ` Reason: ${intent.reason}` : ''} Audit note saved.`,
          objects: [
            { id: 'lc-denied', objectType: 'request', objectId: intent.request_id, label: intent.request_id },
          ],
        },
      };
    }

    case 'generate_packet': {
      const packetId = `np-${Date.now()}`;
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'done',
          action_type: 'generate_packet',
          summary: `Generated Packet: '${intent.packet_type} — ${intent.target}'.`,
          objects: [
            { id: `lc-${packetId}`, objectType: 'packet', objectId: packetId, label: `${intent.packet_type} — ${intent.target}` },
          ],
        },
      };
    }

    case 'escalate': {
      // Use deterministic room routing if no explicit target
      const routed = !intent.target_room ? autoRoute(intent.topic, context.mode) : null;
      const roomName = intent.target_room || routed?.room_title || 'Staff Room';
      const roomId = routed?.room_id || 'rm-escalated';
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'escalated',
          action_type: 'escalate',
          summary: `Escalated to ${roomName}: '${intent.topic}'.`,
          target_room: roomName,
          objects: [
            { id: 'lc-escalated', objectType: 'room', objectId: roomId, label: roomName },
          ],
        },
      };
    }

    case 'navigate': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: `Opening ${intent.target}...`,
        timestamp: now,
        messageType: 'text',
        linkChips: [
          { id: 'lc-nav', objectType: 'resource', objectId: 'nav-target', label: intent.target },
        ],
      };
    }

    case 'switch_context': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: `Context set to: ${intent.target_name}`,
        timestamp: now,
        messageType: 'text',
      };
    }

    case 'summarize_room': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: `Summary of ${intent.room_name}:\n• 3 new messages since last visit\n• 1 blocker flagged (travel confirmation)\n• Next deadline: tomorrow 5 PM`,
        timestamp: now,
        messageType: 'text',
        linkChips: [
          { id: 'lc-room-sum', objectType: 'room', objectId: 'rm-summarized', label: intent.room_name },
        ],
      };
    }

    case 'add_to_board': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'done',
          action_type: 'add_to_board',
          summary: `Added ${intent.player_name} to recruiting board${intent.stage ? ` (stage: ${intent.stage})` : ''}.`,
          objects: [
            { id: 'lc-board-add', objectType: 'player', objectId: `board-${Date.now()}`, label: intent.player_name },
          ],
        },
      };
    }

    case 'remove_from_board': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'done',
          action_type: 'remove_from_board',
          summary: `Removed ${intent.player_name} from recruiting board.`,
          objects: [],
        },
      };
    }

    case 'change_pipeline_stage': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'updated',
          action_type: 'change_pipeline_stage',
          summary: `Moved ${intent.player_name} to pipeline stage: ${intent.stage}.`,
          objects: [
            { id: 'lc-stage-change', objectType: 'player', objectId: `stage-${Date.now()}`, label: `${intent.player_name} → ${intent.stage}` },
          ],
        },
      };
    }

    case 'flag_player': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'done',
          action_type: 'flag_player',
          summary: `Flagged ${intent.player_name}${intent.reason ? `: ${intent.reason}` : ''}.`,
          objects: [
            { id: 'lc-flag', objectType: 'player', objectId: `flag-${Date.now()}`, label: intent.player_name },
          ],
        },
      };
    }

    case 'create_calendar_event': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'created',
          action_type: 'create_calendar_event',
          summary: `Created event: '${intent.title}'${intent.date ? ` on ${intent.date}` : ''}${intent.time ? ` at ${intent.time}` : ''}.`,
          objects: [],
        },
      };
    }

    case 'update_scholarship': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'updated',
          action_type: 'update_scholarship',
          summary: `Updated scholarship for ${intent.player_name}${intent.percentage != null ? ` to ${intent.percentage}%` : ''}.`,
          objects: [
            { id: 'lc-scholarship', objectType: 'player', objectId: `schol-${Date.now()}`, label: intent.player_name },
          ],
        },
      };
    }

    case 'adjust_budget': {
      const sign = intent.direction === 'increase' ? '+' : '-';
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'updated',
          action_type: 'adjust_budget',
          summary: `${intent.direction === 'increase' ? 'Increased' : 'Decreased'} ${intent.category} budget by ${sign}$${intent.amount.toLocaleString()}.`,
          objects: [],
        },
      };
    }

    case 'send_dm': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: now,
        messageType: 'receipt',
        receipt: {
          status: 'done',
          action_type: 'send_dm',
          summary: `Message sent to ${intent.recipient}.`,
          objects: [],
        },
      };
    }

    case 'pin_conversation':
    case 'unpin_conversation': {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: intent.type === 'pin_conversation' ? 'Conversation pinned.' : 'Conversation unpinned.',
        timestamp: now,
        messageType: 'text',
      };
    }

    default: {
      return {
        id: baseId,
        conversationId,
        role: 'assistant',
        content: 'Action completed.',
        timestamp: now,
        messageType: 'text',
      };
    }
  }
}

// =============================================================================
// CONFIRMATION MESSAGE
// =============================================================================

function createConfirmationMessage(
  intent: ActionIntent,
  context: NexusContext,
  conversationId: string,
): MessageV2 {
  const contextLabel = `${context.mode === 'sports' ? 'Athletics' : context.mode} · ${context.org_name}${context.scope_name ? ' · ' + context.scope_name : ''}${context.season_label ? ' · ' + context.season_label : ''}`;

  let actionSummary = '';
  let impactLine = '';

  switch (intent.type) {
    case 'approve':
      actionSummary = `Approve request: ${(intent as any).request_id}`;
      impactLine = 'This action is final and will notify the submitter.';
      break;
    case 'deny':
      actionSummary = `Deny request: ${(intent as any).request_id}`;
      impactLine = 'This action is final. An audit note is required.';
      break;
    case 'post_room':
      actionSummary = `Post to ${(intent as any).room_name || 'Staff Room'}`;
      impactLine = 'This will be visible to all room members.';
      break;
    case 'generate_packet':
      actionSummary = `Generate ${(intent as any).packet_type} packet for ${(intent as any).target}`;
      impactLine = 'This will create a shareable packet document.';
      break;
    case 'add_to_board':
      actionSummary = `Add ${(intent as any).player_name} to recruiting board`;
      impactLine = 'Player will appear on your recruiting board.';
      break;
    case 'remove_from_board':
      actionSummary = `Remove ${(intent as any).player_name} from recruiting board`;
      impactLine = 'Player will be removed from your board.';
      break;
    case 'change_pipeline_stage':
      actionSummary = `Move ${(intent as any).player_name} to ${(intent as any).stage}`;
      impactLine = 'Pipeline stage will be updated.';
      break;
    case 'update_scholarship':
      actionSummary = `Update scholarship for ${(intent as any).player_name}`;
      impactLine = 'This will adjust the scholarship allocation.';
      break;
    case 'adjust_budget':
      actionSummary = `${(intent as any).direction === 'increase' ? 'Increase' : 'Decrease'} ${(intent as any).category} budget by $${(intent as any).amount?.toLocaleString()}`;
      impactLine = 'This will modify the budget allocation.';
      break;
    case 'send_dm':
      actionSummary = `Send message to ${(intent as any).recipient}`;
      impactLine = 'This message will be delivered to the recipient.';
      break;
    default:
      actionSummary = `Execute action: ${intent.type}`;
      impactLine = 'This action may affect linked objects.';
  }

  return {
    id: `confirm-${Date.now()}`,
    conversationId,
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    messageType: 'confirmation',
    confirmation: {
      state: 'pending',
      action_summary: actionSummary,
      target_context: contextLabel,
      impact_line: impactLine,
      requires_audit_note: requiresAuditNote(intent.type),
    },
  };
}

// =============================================================================
// REFUSAL MESSAGE
// =============================================================================

function createRefusalMessage(
  intent: ActionIntent,
  context: NexusContext,
  conversationId: string,
  capability: string,
  operatingRole?: string,
): MessageV2 {
  // Derive authority label for display
  const authorityLabel = operatingRole
    ? getAuthorityLabel(operatingRole, context.mode as any)
    : undefined;

  // Route to the right escalation room based on the action's topic
  const topicHint = intent.type === 'approve' || intent.type === 'deny' ? 'compliance'
    : intent.type === 'generate_packet' ? 'ops'
    : intent.type === 'post_room' ? 'ops'
    : null;
  const routed = topicHint ? autoRoute(topicHint, context.mode) : null;
  const targetRoom = routed?.room_title || 'AD Command';
  const targetRoomId = routed?.room_id || 'rm-ad';
  const targetOwner = routed?.owner.owner_label || 'AD / Head Coach';

  const authorityTag = authorityLabel ? ` (${authorityLabel})` : '';

  return {
    id: `refusal-${Date.now()}`,
    conversationId,
    role: 'assistant',
    content: getRefusalMessage(capability as any, authorityLabel),
    timestamp: new Date(),
    messageType: 'escalation',
    escalation: {
      reason: `Insufficient Authority${authorityTag}. This action requires Head Coach (A3) or higher.`,
      target_room: targetRoom,
      target_room_id: targetRoomId,
      target_owner: targetOwner,
      options: [
        { label: 'Route to Head Coach (A3)', action: 'create_request' },
        { label: 'Route to AD (A4)', action: 'create_request' },
        { label: 'Save as Open Question', action: 'save_question' },
      ],
    },
  };
}
