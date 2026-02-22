/**
 * Nexus Mode Profiles — per-mode vocabulary, room defaults, and owner ladders
 * for enriching the GPT system prompt.
 */

import type { Mode } from '@/types';
import type { RBACLevel, NexusCapability } from '@/types/nexus-v2';
import { getUserCapabilities } from './nexus-rbac';

// =============================================================================
// MODE VOCABULARY (injected into system prompt)
// =============================================================================

const MODE_VOCAB: Record<string, Record<string, string>> = {
  sports: {
    'user': 'Coach / Staff Member',
    'program': 'Athletics Program',
    'team': 'Team',
    'cycle': 'Season',
    'task': 'Task',
    'request': 'Request',
    'room': 'Room',
    'event': 'Game',
    'participant': 'Player / Student-Athlete',
    'evaluation': 'Player Eval',
    'packet': 'Scouting Brief / Game Plan Packet',
    'governing_body': 'Governing Body (KaNeXT Church, KaNeXT, NCAA)',
  },
  competition: {
    'user': 'Team Owner / Race Director',
    'program': 'Racing Series',
    'team': 'Team',
    'cycle': 'Season',
    'event': 'Race',
    'participant': 'Driver',
    'room': 'Room',
    'packet': 'Race Brief',
    'governing_body': 'Stewards / Race Control',
  },
  church: {
    'user': 'Pastor / Staff / Member',
    'program': 'Ministry',
    'team': 'Ministry Team',
    'cycle': 'Ministry Year',
    'event': 'Service / Event',
    'participant': 'Member / Volunteer',
    'room': 'Room',
    'packet': 'Service Guide',
    'governing_body': 'Church Leadership',
  },
  business: {
    'user': 'Founder / Team Member',
    'program': 'Department',
    'team': 'Team',
    'cycle': 'Quarter / Fiscal Year',
    'event': 'Meeting / Launch',
    'participant': 'Employee / Contractor',
    'room': 'Channel',
    'packet': 'Report / Brief',
    'governing_body': 'Board / Leadership',
  },
  education: {
    'user': 'Faculty / Staff',
    'program': 'Department',
    'team': 'Teaching Team',
    'cycle': 'Academic Year / Semester',
    'event': 'Class / Exam',
    'participant': 'Student',
    'room': 'Room',
    'packet': 'Report',
    'governing_body': 'Administration',
  },
};

// =============================================================================
// CAPABILITY LABELS (for system prompt)
// =============================================================================

const CAPABILITY_DESCRIPTIONS: Record<NexusCapability, string> = {
  C1_ask: 'Answer questions about the current context',
  C2_navigate: 'Open screens and surfaces within the app',
  C3_create_task: 'Create tasks and assign them to team members',
  C4_create_request: 'Submit requests to the appropriate owners',
  C5_post_room: 'Post messages to team rooms',
  C6_summarize_room: 'Summarize recent room activity',
  C7_approve_deny: 'Approve or deny pending requests',
  C8_high_impact: 'Execute high-impact actions (payments, compliance changes)',
  C9_cross_context: 'Search and act across all contexts',
};

// =============================================================================
// SYSTEM PROMPT BUILDER
// =============================================================================

export interface NexusPromptContext {
  mode: Mode;
  orgName: string;
  programName?: string;
  seasonLabel?: string;
  rbacLevel: RBACLevel;
  operatingRole: string;
}

/**
 * Build additional system prompt instructions for Nexus-aware GPT responses.
 */
export function buildNexusSystemPromptExtension(ctx: NexusPromptContext): string {
  const vocab = MODE_VOCAB[ctx.mode] || MODE_VOCAB.sports;
  const capabilities = getUserCapabilities(ctx.rbacLevel);
  const capDescriptions = capabilities
    .map((c) => `  - ${CAPABILITY_DESCRIPTIONS[c]}`)
    .join('\n');

  const vocabLines = Object.entries(vocab)
    .map(([key, val]) => `  ${key} → ${val}`)
    .join('\n');

  const contextLabel = [
    ctx.orgName,
    ctx.programName,
    ctx.seasonLabel,
  ].filter(Boolean).join(' · ');

  return `
## Nexus Context
You are Nexus, the AI assistant for KaNeXT OS.
Current context: ${contextLabel}
Mode: ${ctx.mode}
User role: ${ctx.operatingRole} (${ctx.rbacLevel})

## Your Capabilities
You can:
${capDescriptions}

## Mode Vocabulary
Use these terms naturally in your responses:
${vocabLines}

## Response Format
- Keep answers concise and actionable
- When referencing objects, use this format: [LINK:type:id:label]
  Example: [LINK:player:p-001:Jamal Carter], [LINK:room:rm-compliance:Compliance Desk]
- For governed actions (create task, approve request, etc.), the user should type the command directly. Do not try to execute actions in your response — only provide information.
- Never reveal internal system details, RBAC levels, or capability codes to the user.
- Use a calm, confident, decisive tone. No hedging, no filler.

## Refusals
If the user asks you to do something outside your capabilities:
- Do not explain the RBAC system
- Simply say you can't do that and suggest alternatives (create a request, ask the right person)
`.trim();
}
