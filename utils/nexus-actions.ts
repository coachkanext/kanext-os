/**
 * Nexus Intent Classifier — parses natural language into governed action intents.
 * Runs locally (no GPT), pattern-matching only.
 */

import type { ActionIntent, NexusContext } from '@/types/nexus-v2';

// =============================================================================
// INTENT PATTERNS
// =============================================================================

interface IntentPattern {
  patterns: RegExp[];
  extract: (match: RegExpMatchArray, input: string) => ActionIntent;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // ── Create Task ──
  {
    patterns: [
      /^(?:create|add|make)\s+(?:a\s+)?task[:\s]+(.+)/i,
      /^task[:\s]+(.+)/i,
    ],
    extract: (_match, input) => {
      const body = _match[1].trim();
      const assignMatch = body.match(/(?:assign(?:ed)?\s+(?:to\s+)?|owner[:\s]+)(.+?)(?:,|$)/i);
      const dueMatch = body.match(/(?:due|by)\s+(.+?)(?:,|$)/i);
      const priorityMatch = body.match(/\b(blocker|high|urgent|critical)\b/i);
      const title = body
        .replace(/(?:assign(?:ed)?\s+(?:to\s+)?|owner[:\s]+).+?(?:,|$)/i, '')
        .replace(/(?:due|by)\s+.+?(?:,|$)/i, '')
        .replace(/\b(blocker|high|urgent|critical)\b/gi, '')
        .replace(/,\s*,/g, ',')
        .replace(/^[,\s]+|[,\s]+$/g, '')
        .trim();

      return {
        type: 'create_task',
        title: title || body,
        assignee: assignMatch?.[1]?.trim(),
        due: dueMatch?.[1]?.trim(),
        priority: priorityMatch ? (priorityMatch[1].toLowerCase() === 'blocker' ? 'blocker' : 'high') : undefined,
      };
    },
  },

  // ── Create Request ──
  {
    patterns: [
      /^(?:create|submit|file)\s+(?:a\s+)?request[:\s]+(.+)/i,
      /^request[:\s]+(.+)/i,
    ],
    extract: (_match) => {
      const body = _match[1].trim();
      const typeMatch = body.match(/\b(compliance|eligibility|approval|waiver|payment|schedule|safety)\b/i);
      const requestType = typeMatch?.[1]?.toLowerCase() || 'other';
      const typeMap: Record<string, string> = {
        compliance: 'compliance_exception',
        eligibility: 'compliance_exception',
        approval: 'approval',
        waiver: 'waiver',
        payment: 'payment_release',
        schedule: 'schedule_change',
        safety: 'safety_concern',
      };
      return {
        type: 'create_request',
        request_type: (typeMap[requestType] || 'other') as any,
        title: body,
      };
    },
  },

  // ── Post to Room ──
  {
    patterns: [
      /^(?:post|send|share)\s+(?:(?:this|that|it)\s+)?(?:to|in)\s+(.+?)(?:[:\s]+([\s\S]+))?$/i,
    ],
    extract: (_match) => {
      return {
        type: 'post_room',
        room_name: _match[1]?.trim(),
        content: _match[2]?.trim() || '',
      };
    },
  },

  // ── Approve ──
  {
    patterns: [
      /^approve\s+(?:request\s+)?(.+)/i,
    ],
    extract: (_match) => ({
      type: 'approve',
      request_id: _match[1]?.trim(),
    }),
  },

  // ── Deny ──
  {
    patterns: [
      /^deny\s+(?:request\s+)?(.+?)(?:\s+because\s+(.+))?$/i,
    ],
    extract: (_match) => ({
      type: 'deny',
      request_id: _match[1]?.trim(),
      reason: _match[2]?.trim(),
    }),
  },

  // ── Escalate ──
  {
    patterns: [
      /^escalate\s+(.+?)(?:\s+to\s+(.+))?$/i,
      /^(?:route|send)\s+(?:this\s+)?to\s+(.+)/i,
    ],
    extract: (_match) => ({
      type: 'escalate',
      topic: _match[1]?.trim(),
      target_room: _match[2]?.trim(),
    }),
  },

  // ── Generate Packet ──
  {
    patterns: [
      /^(?:generate|create|build)\s+(?:a\s+)?(?:scouting|scout|game\s*plan|readiness|compliance|sponsor)?\s*(?:packet|brief|report)\s+(?:for\s+)?(.+)/i,
    ],
    extract: (_match, input) => {
      const typeMatch = input.match(/\b(scout(?:ing)?|game\s*plan|readiness|compliance|sponsor)\b/i);
      return {
        type: 'generate_packet',
        packet_type: typeMatch?.[1]?.toLowerCase().replace(/\s+/g, '_') || 'other',
        target: _match[1]?.trim(),
      };
    },
  },

  // ── Summarize Room ──
  {
    patterns: [
      /^summarize\s+(.+?)(?:\s+(?:last|past)\s+(\d+\s*(?:h|hour|day|d)))?$/i,
    ],
    extract: (_match) => ({
      type: 'summarize_room',
      room_name: _match[1]?.trim(),
    }),
  },

  // ── Navigate ──
  {
    patterns: [
      /^(?:open|go\s+to|show|navigate\s+to)\s+(.+)/i,
    ],
    extract: (_match) => ({
      type: 'navigate',
      target: _match[1]?.trim(),
    }),
  },

  // ── Switch Context ──
  {
    patterns: [
      /^switch\s+(?:to|context\s+to)\s+(.+)/i,
    ],
    extract: (_match) => ({
      type: 'switch_context',
      target_name: _match[1]?.trim(),
    }),
  },

  // ── Show Contexts ──
  {
    patterns: [
      /^(?:show|list|what\s+are)\s+(?:my\s+)?contexts/i,
      /^what\s+context\s+am\s+I\s+in/i,
    ],
    extract: () => ({ type: 'show_contexts' }),
  },

  // ── Show Workspaces ──
  {
    patterns: [
      /^(?:show|list|what\s+are)\s+(?:my\s+)?workspaces/i,
    ],
    extract: () => ({ type: 'show_workspaces' }),
  },

  // ── Create Workspace ──
  {
    patterns: [
      /^(?:create|new)\s+(?:a\s+)?workspace[:\s]+(.+)/i,
    ],
    extract: (_match) => ({
      type: 'create_workspace',
      title: _match[1]?.trim(),
    }),
  },
];

// =============================================================================
// CLASSIFIER
// =============================================================================

export function classifyIntent(input: string): ActionIntent {
  const trimmed = input.trim();
  if (!trimmed) return { type: 'none' };

  for (const ip of INTENT_PATTERNS) {
    for (const pattern of ip.patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return ip.extract(match, trimmed);
      }
    }
  }

  return { type: 'none' };
}
