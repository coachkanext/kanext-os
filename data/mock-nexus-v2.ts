/**
 * Nexus v2 Mock Data
 * Governed objects + rich demo messages for the universal chat interface.
 * Rendered as A2 (Assistant Coach / Recruiting Coordinator) — R3 capability level.
 */

import type {
  NexusContext,
  LinkChip,
  Owner,
  AuditNote,
  NexusTask,
  NexusRequest,
  NexusWorkspace,
  NexusPacket,
  NexusRoom,
  NexusCase,
  MessageV2,
  NexusThread,
} from '@/types/nexus-v2';

// =============================================================================
// SHARED CONTEXT
// =============================================================================

const KaNeXT_MBB_CONTEXT: NexusContext = {
  mode: 'sports',
  org_id: 'lu-lions',
  org_name: 'Lincoln University',
  scope_type: 'program',
  scope_id: 'lu-mbb',
  scope_name: "Men's Basketball",
  season_id: '2025-26',
  season_label: '2025–26',
};

const KaNeXT_ATH_CONTEXT: NexusContext = {
  mode: 'sports',
  org_id: 'lu-lions',
  org_name: 'Lincoln University',
  scope_type: 'org',
  season_id: '2025-26',
  season_label: '2025–26',
};

// =============================================================================
// OWNERS
// =============================================================================

const OWNER_HC: Owner = { owner_type: 'user', owner_id: 'hc-miles', owner_label: 'Head Coach Miles' };
const OWNER_OPS: Owner = { owner_type: 'role', owner_id: 'ops-lead', owner_label: 'Ops Lead' };
const OWNER_COMPLIANCE: Owner = { owner_type: 'role', owner_id: 'compliance-officer', owner_label: 'Compliance Officer' };
const OWNER_VIDEO: Owner = { owner_type: 'role', owner_id: 'video-coord', owner_label: 'Video Coordinator' };
const OWNER_AC: Owner = { owner_type: 'user', owner_id: 'ac-pearson', owner_label: 'Coach Pearson' };
const OWNER_RECRUITING: Owner = { owner_type: 'role', owner_id: 'recruiting-coord', owner_label: 'Recruiting Coordinator' };
const OWNER_FINANCE: Owner = { owner_type: 'role', owner_id: 'finance-lead', owner_label: 'Finance Lead' };
const OWNER_AD: Owner = { owner_type: 'user', owner_id: 'ad-johnson', owner_label: 'AD Johnson' };

// =============================================================================
// LINK CHIPS (reusable references)
// =============================================================================

const CHIP_COMPLIANCE_DESK: LinkChip = {
  id: 'lc-comp-desk', objectType: 'room', objectId: 'rm-compliance',
  label: 'Compliance Desk', icon: 'shield.checkered',
};

const CHIP_STAFF_ROOM: LinkChip = {
  id: 'lc-staff-room', objectType: 'room', objectId: 'rm-staff',
  label: 'MBB Staff Room', icon: 'person.3.fill',
};

const CHIP_OPS_COMMAND: LinkChip = {
  id: 'lc-ops-cmd', objectType: 'room', objectId: 'rm-ops',
  label: 'Ops Command', icon: 'gearshape.2.fill',
};

const CHIP_RECRUITING_WAR: LinkChip = {
  id: 'lc-recruit', objectType: 'room', objectId: 'rm-recruiting',
  label: 'Recruiting War Room', icon: 'person.badge.plus',
};

const CHIP_PLAYER_CARTER: LinkChip = {
  id: 'lc-carter', objectType: 'player', objectId: 'p-carter',
  label: 'Marcus Carter (#4)', icon: 'person.fill',
};

const CHIP_GAME_NEXT: LinkChip = {
  id: 'lc-next-game', objectType: 'game', objectId: 'g-next',
  label: 'vs Summit (Feb 22)', icon: 'sportscourt.fill',
};

// =============================================================================
// MOCK TASKS
// =============================================================================

export const MOCK_NEXUS_TASKS: NexusTask[] = [
  {
    id: 'nt-001',
    title: 'Confirm travel bus for Southeastern road trip',
    context: KaNeXT_MBB_CONTEXT,
    owner: OWNER_OPS,
    priority: 'blocker',
    status: 'open',
    due_at: '2025-02-20T21:00:00Z',
    tags: ['Travel', 'Blocker', 'Due <24h'],
    linked_objects: [CHIP_GAME_NEXT, CHIP_OPS_COMMAND],
    notes: 'Bus company confirmation pending. Fallback: university van pool.',
    created_by: 'ac-pearson',
    created_at: '2025-02-17T14:00:00Z',
    updated_at: '2025-02-17T14:00:00Z',
  },
  {
    id: 'nt-002',
    title: 'Upload scout packet clips for Southeastern',
    context: KaNeXT_MBB_CONTEXT,
    owner: OWNER_VIDEO,
    priority: 'high',
    status: 'in_progress',
    due_at: '2025-02-21T12:00:00Z',
    tags: ['Film', 'Scouting'],
    linked_objects: [CHIP_GAME_NEXT],
    created_by: 'hc-miles',
    created_at: '2025-02-16T10:00:00Z',
    updated_at: '2025-02-17T09:30:00Z',
  },
  {
    id: 'nt-003',
    title: 'Review Carter eligibility docs',
    context: KaNeXT_MBB_CONTEXT,
    owner: OWNER_COMPLIANCE,
    priority: 'blocker',
    status: 'open',
    due_at: '2025-02-19T17:00:00Z',
    tags: ['Compliance', 'Blocker', 'Eligibility'],
    linked_objects: [CHIP_PLAYER_CARTER, CHIP_COMPLIANCE_DESK],
    notes: 'Missing enrollment verification form. Follow-up with registrar.',
    created_by: 'hc-miles',
    created_at: '2025-02-15T11:00:00Z',
    updated_at: '2025-02-17T08:00:00Z',
  },
  {
    id: 'nt-004',
    title: 'Lock game plan for Southeastern',
    context: KaNeXT_MBB_CONTEXT,
    owner: OWNER_HC,
    priority: 'high',
    status: 'open',
    due_at: '2025-02-21T18:00:00Z',
    tags: ['Game Plan'],
    linked_objects: [CHIP_GAME_NEXT, CHIP_STAFF_ROOM],
    created_by: 'hc-miles',
    created_at: '2025-02-17T07:00:00Z',
    updated_at: '2025-02-17T07:00:00Z',
  },
  {
    id: 'nt-005',
    title: 'Complete player development film assignments',
    context: KaNeXT_MBB_CONTEXT,
    owner: OWNER_AC,
    priority: 'normal',
    status: 'in_progress',
    due_at: '2025-02-20T16:00:00Z',
    tags: ['Development', 'Film'],
    linked_objects: [],
    created_by: 'ac-pearson',
    created_at: '2025-02-14T09:00:00Z',
    updated_at: '2025-02-17T10:00:00Z',
  },
  {
    id: 'nt-006',
    title: 'Schedule campus visit for Darius Thompson',
    context: KaNeXT_MBB_CONTEXT,
    owner: OWNER_RECRUITING,
    priority: 'high',
    status: 'waiting',
    due_at: '2025-02-24T12:00:00Z',
    tags: ['Recruiting', 'Visit'],
    linked_objects: [CHIP_RECRUITING_WAR],
    notes: 'Prospect available Feb 27–Mar 1. Need host assignment.',
    created_by: 'ac-pearson',
    created_at: '2025-02-16T14:00:00Z',
    updated_at: '2025-02-17T11:00:00Z',
  },
];

// =============================================================================
// MOCK REQUESTS
// =============================================================================

export const MOCK_NEXUS_REQUESTS: NexusRequest[] = [
  {
    id: 'nr-001',
    short_id: 'REQ-1042',
    request_type: 'compliance_exception',
    title: 'Eligibility review — Marcus Carter enrollment docs',
    context: KaNeXT_MBB_CONTEXT,
    submitted_by: 'hc-miles',
    assigned_owner: OWNER_COMPLIANCE,
    status: 'under_review',
    due_at: '2025-02-19T17:00:00Z',
    impact_flags: {
      blocks_start: false, blocks_results_lock: false, blocks_payout: false,
      broadcast_risk: false, sponsor_risk: false, compliance_risk: true, safety_risk: false,
    },
    evidence: [
      { id: 'att-001', attachment_type: 'link', label: 'Partial enrollment form', url: '#', created_at: '2025-02-15T11:00:00Z' },
    ],
    audit_notes: [
      { id: 'an-001', context: KaNeXT_MBB_CONTEXT, actor_user_id: 'hc-miles', actor_label: 'HC Miles', note_text: 'Initiated eligibility review for Carter. Missing enrollment verification.', created_at: '2025-02-15T11:00:00Z' },
    ],
    linked_objects: [CHIP_PLAYER_CARTER, CHIP_COMPLIANCE_DESK],
    created_at: '2025-02-15T11:00:00Z',
    updated_at: '2025-02-17T08:00:00Z',
  },
  {
    id: 'nr-002',
    short_id: 'REQ-1043',
    request_type: 'approval',
    title: 'Travel expense approval — Southeastern road trip',
    context: KaNeXT_MBB_CONTEXT,
    submitted_by: 'ops-lead',
    assigned_owner: OWNER_HC,
    status: 'new',
    due_at: '2025-02-20T12:00:00Z',
    impact_flags: {
      blocks_start: false, blocks_results_lock: false, blocks_payout: false,
      broadcast_risk: false, sponsor_risk: false, compliance_risk: false, safety_risk: false,
    },
    evidence: [
      { id: 'att-002', attachment_type: 'link', label: 'Trip budget estimate ($4,200)', url: '#', created_at: '2025-02-17T09:00:00Z' },
    ],
    audit_notes: [],
    linked_objects: [CHIP_GAME_NEXT, CHIP_OPS_COMMAND],
    created_at: '2025-02-17T09:00:00Z',
    updated_at: '2025-02-17T09:00:00Z',
  },
  {
    id: 'nr-003',
    short_id: 'REQ-1044',
    request_type: 'payment_release',
    title: 'NIL disbursement — February cycle',
    context: KaNeXT_ATH_CONTEXT,
    submitted_by: 'finance-lead',
    assigned_owner: OWNER_HC,
    status: 'awaiting_info',
    due_at: '2025-02-28T17:00:00Z',
    impact_flags: {
      blocks_start: false, blocks_results_lock: false, blocks_payout: true,
      broadcast_risk: false, sponsor_risk: false, compliance_risk: true, safety_risk: false,
    },
    evidence: [],
    audit_notes: [
      { id: 'an-002', context: KaNeXT_ATH_CONTEXT, actor_user_id: 'finance-lead', actor_label: 'Finance Lead', note_text: 'Pending 2 player NIL disclosure forms before release.', created_at: '2025-02-16T15:00:00Z' },
    ],
    linked_objects: [
      { id: 'lc-fin', objectType: 'finance_event', objectId: 'fe-nil-feb', label: 'NIL Feb Cycle', icon: 'dollarsign.circle' },
      CHIP_COMPLIANCE_DESK,
    ],
    created_at: '2025-02-16T15:00:00Z',
    updated_at: '2025-02-17T10:00:00Z',
  },
  {
    id: 'nr-004',
    short_id: 'REQ-1045',
    request_type: 'schedule_change',
    title: 'Move Wednesday practice to 3:00 PM (facility conflict)',
    context: KaNeXT_MBB_CONTEXT,
    submitted_by: 'ops-lead',
    assigned_owner: OWNER_HC,
    status: 'new',
    impact_flags: {
      blocks_start: false, blocks_results_lock: false, blocks_payout: false,
      broadcast_risk: false, sponsor_risk: false, compliance_risk: false, safety_risk: false,
    },
    evidence: [],
    audit_notes: [],
    linked_objects: [CHIP_OPS_COMMAND],
    created_at: '2025-02-17T12:00:00Z',
    updated_at: '2025-02-17T12:00:00Z',
  },
];

// =============================================================================
// MOCK WORKSPACES
// =============================================================================

export const MOCK_NEXUS_WORKSPACES: NexusWorkspace[] = [
  {
    id: 'nw-001',
    title: 'Lincoln MBB — Game Week: vs Summit',
    description: 'All preparation for the February 22 road game.',
    context: KaNeXT_MBB_CONTEXT,
    workspace_type: 'game_week',
    visibility: 'scoped',
    owners: [OWNER_HC],
    thread_ids: ['demo-thread-gameweek'],
    pinned_link_chips: [CHIP_GAME_NEXT, CHIP_STAFF_ROOM, CHIP_OPS_COMMAND],
    linked_rooms: [CHIP_STAFF_ROOM, CHIP_OPS_COMMAND],
    linked_objects: [
      { id: 'lc-task-bus', objectType: 'task', objectId: 'nt-001', label: 'Confirm travel bus', icon: 'bus.fill' },
      { id: 'lc-task-scout', objectType: 'task', objectId: 'nt-002', label: 'Scout clips', icon: 'film' },
      { id: 'lc-task-plan', objectType: 'task', objectId: 'nt-004', label: 'Lock game plan', icon: 'sportscourt.fill' },
      CHIP_GAME_NEXT,
    ],
    created_at: '2025-02-17T07:00:00Z',
    updated_at: '2025-02-17T14:00:00Z',
  },
  {
    id: 'nw-002',
    title: 'Lincoln MBB — Recruiting Board (2026 Class)',
    description: 'Pipeline tracking for the 2026 recruiting class.',
    context: KaNeXT_MBB_CONTEXT,
    workspace_type: 'recruiting_board',
    visibility: 'scoped',
    owners: [OWNER_HC, OWNER_RECRUITING],
    thread_ids: ['demo-thread-recruiting'],
    pinned_link_chips: [CHIP_RECRUITING_WAR],
    linked_rooms: [CHIP_RECRUITING_WAR],
    linked_objects: [
      { id: 'lc-prospect-1', objectType: 'player', objectId: 'prospect-thompson', label: 'Darius Thompson (SG, A-tier)', icon: 'person.fill' },
      { id: 'lc-prospect-2', objectType: 'player', objectId: 'prospect-williams', label: 'Jaylen Williams (PF, A-tier)', icon: 'person.fill' },
      { id: 'lc-task-visit', objectType: 'task', objectId: 'nt-006', label: 'Schedule Thompson visit', icon: 'calendar' },
    ],
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2025-02-17T11:00:00Z',
  },
];

// =============================================================================
// MOCK PACKET
// =============================================================================

export const MOCK_NEXUS_PACKETS: NexusPacket[] = [
  {
    id: 'np-001',
    title: 'Scouting Brief — Southeastern',
    context: KaNeXT_MBB_CONTEXT,
    workspace_id: 'nw-001',
    packet_type: 'scouting_brief',
    inputs: [CHIP_GAME_NEXT],
    generated_by: 'nexus',
    summary_text: 'Southeastern relies on PNR actions (42% of possessions), shoots 38% from three on catch-and-shoot. Vulnerable to rim pressure — allow 62% at rim.',
    sections: [
      { heading: 'Offensive DNA', bullets: ['Primary: PNR Ball Handler (42%)', 'Secondary: Spot-up 3 (28%)', 'Pace: 71.2 possessions (above avg)', 'Corner 3 rate: 14% (below avg)'] },
      { heading: 'Defensive DNA', bullets: ['Drop coverage on PNR', 'Switch 1–3 selectively', 'Force midrange — concede 41% from mid', 'Aggressive help-side rotations'] },
      { heading: 'Key Personnel', bullets: ['#1 J. Morris — primary creator, 19.2 PPG, pull-up 3 threat', '#24 T. Banks — rim finisher, 68% at rim, limited range', '#11 K. Price — top 3pt shooter, 42% C&S'] },
      { heading: 'Top 3 Priorities', bullets: ['Force Morris left — 34% vs 48% efficiency split', 'Tag Banks on PNR rolls — no free rim attempts', 'Close out hard on Price — contest every catch'] },
    ],
    created_at: '2025-02-17T13:00:00Z',
  },
];

// =============================================================================
// MOCK ROOMS (Nexus routing targets)
// =============================================================================

export const MOCK_NEXUS_ROOMS: NexusRoom[] = [
  { id: 'rm-staff', name: 'MBB Staff Room', context: KaNeXT_MBB_CONTEXT, room_type: 'staff', visibility: 'scoped', owners: [OWNER_HC], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T14:00:00Z' },
  { id: 'rm-ops', name: 'Ops Command — MBB', context: KaNeXT_MBB_CONTEXT, room_type: 'ops_command', visibility: 'scoped', owners: [OWNER_OPS], active_blockers_count: 2, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T14:00:00Z' },
  { id: 'rm-compliance', name: 'Compliance Desk — Lincoln', context: KaNeXT_ATH_CONTEXT, room_type: 'compliance_desk', visibility: 'restricted', owners: [OWNER_COMPLIANCE], active_blockers_count: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T08:00:00Z' },
  { id: 'rm-finance', name: 'Finance Desk — Lincoln', context: KaNeXT_ATH_CONTEXT, room_type: 'finance_desk', visibility: 'restricted', owners: [OWNER_FINANCE], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-16T15:00:00Z' },
  { id: 'rm-recruiting', name: 'Recruiting War Room — MBB', context: KaNeXT_MBB_CONTEXT, room_type: 'recruiting', visibility: 'scoped', owners: [OWNER_HC, OWNER_RECRUITING], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T11:00:00Z' },
  { id: 'rm-film', name: 'Film Room Q&A — MBB', context: KaNeXT_MBB_CONTEXT, room_type: 'film_qa', visibility: 'scoped', owners: [OWNER_VIDEO], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T09:30:00Z' },
  { id: 'rm-media', name: 'Media Ops — Lincoln', context: KaNeXT_ATH_CONTEXT, room_type: 'media_ops', visibility: 'scoped', owners: [{ owner_type: 'role', owner_id: 'media-lead', owner_label: 'Media Lead' }], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T10:00:00Z' },
  { id: 'rm-ad', name: 'AD Command — Lincoln', context: KaNeXT_ATH_CONTEXT, room_type: 'ad_command', visibility: 'restricted', owners: [OWNER_AD], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T07:00:00Z' },
  { id: 'rm-player-support', name: 'Player Support — MBB', context: KaNeXT_MBB_CONTEXT, room_type: 'player_support', visibility: 'scoped', owners: [OWNER_AC], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T10:00:00Z' },
  { id: 'rm-game-cmd', name: 'Game Command — vs Summit', context: KaNeXT_MBB_CONTEXT, room_type: 'game_command', visibility: 'scoped', owners: [OWNER_HC, OWNER_OPS], next_deadline_at: '2025-02-22T19:00:00Z', created_at: '2025-02-17T07:00:00Z', updated_at: '2025-02-17T14:00:00Z' },
  { id: 'rm-dev', name: 'Player Dev — Guards', context: KaNeXT_MBB_CONTEXT, room_type: 'dev_unit', visibility: 'scoped', owners: [OWNER_AC], created_at: '2025-01-15T00:00:00Z', updated_at: '2025-02-17T10:00:00Z' },
];

// =============================================================================
// MOCK NEXUS THREADS
// =============================================================================

export const MOCK_NEXUS_THREADS: NexusThread[] = [
  {
    id: 'demo-thread-main',
    title: 'Lincoln MBB — This Context',
    context: KaNeXT_MBB_CONTEXT,
    scope_mode: 'this_context',
    pinned_link_chips: [CHIP_GAME_NEXT, CHIP_STAFF_ROOM],
    last_activity_at: '2025-02-17T14:30:00Z',
  },
  {
    id: 'demo-thread-gameweek',
    title: 'Game Week: vs Summit',
    context: KaNeXT_MBB_CONTEXT,
    workspace_id: 'nw-001',
    scope_mode: 'this_context',
    pinned_link_chips: [CHIP_GAME_NEXT, CHIP_OPS_COMMAND],
    last_activity_at: '2025-02-17T14:00:00Z',
  },
  {
    id: 'demo-thread-recruiting',
    title: 'Recruiting Board — 2026 Class',
    context: KaNeXT_MBB_CONTEXT,
    workspace_id: 'nw-002',
    scope_mode: 'this_context',
    pinned_link_chips: [CHIP_RECRUITING_WAR],
    last_activity_at: '2025-02-17T11:00:00Z',
  },
];

// =============================================================================
// DEMO CONVERSATION MESSAGES (A2 — Assistant Coach / Recruiting Coordinator)
// Shows: C1_ask, C3_create_task, C5_post_room (confirm), C7_approve (BLOCKED), C1_ask (intelligence)
// =============================================================================

const CONV_ID = 'demo-conv-v2';

export const DEMO_V2_MESSAGES: MessageV2[] = [
  // 1. User asks about open tasks (C1_ask — allowed)
  {
    id: 'mv2-001',
    conversationId: CONV_ID,
    role: 'user',
    content: 'What are the open tasks for this week?',
    timestamp: new Date('2025-02-17T14:00:00Z'),
    messageType: 'text',
  },
  // 2. Nexus responds with structured task overview
  {
    id: 'mv2-002',
    conversationId: CONV_ID,
    role: 'assistant',
    content: 'You have 4 open tasks this week across game prep and recruiting:',
    timestamp: new Date('2025-02-17T14:00:05Z'),
    messageType: 'text',
    structuredBlocks: [
      {
        type: 'callout',
        variant: 'error',
        title: 'Travel bus not confirmed (Blocker)',
        content: 'Owner: Ops Lead. Due tonight 9:00 PM. Fallback: university van pool.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Scout clips upload — in progress',
        content: 'Owner: Video Coordinator. Due Feb 21. Southeastern game footage.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Player dev film assignments',
        content: 'Owner: You. Due Feb 20. Guard development film review.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Schedule Thompson campus visit',
        content: 'Owner: Recruiting Coordinator. Due Feb 24. Prospect available Feb 27–Mar 1.',
      },
      {
        type: 'stat_row',
        stats: [
          { label: 'Blockers', value: '1', color: '#EF4444' },
          { label: 'In Progress', value: '2', color: '#F59E0B' },
          { label: 'Waiting', value: '1', color: '#8B5CF6' },
          { label: 'Open', value: '3', color: '#3B82F6' },
        ],
      },
    ],
    linkChips: [
      { id: 'lc-t1', objectType: 'task', objectId: 'nt-001', label: 'Travel Bus (Blocker)', icon: 'bus.fill' },
      { id: 'lc-t2', objectType: 'task', objectId: 'nt-002', label: 'Scout Clips', icon: 'film' },
      { id: 'lc-t5', objectType: 'task', objectId: 'nt-005', label: 'Dev Film', icon: 'play.rectangle' },
      { id: 'lc-t6', objectType: 'task', objectId: 'nt-006', label: 'Thompson Visit', icon: 'calendar' },
    ],
  },
  // 3. User creates a task (C3_create_task — allowed for R3)
  {
    id: 'mv2-003',
    conversationId: CONV_ID,
    role: 'user',
    content: 'Create a task: prep defensive film clips for Saturday, assign Video Coord, due Friday',
    timestamp: new Date('2025-02-17T14:01:00Z'),
    messageType: 'text',
  },
  // 4. Nexus receipt — task created
  {
    id: 'mv2-004',
    conversationId: CONV_ID,
    role: 'assistant',
    content: '',
    timestamp: new Date('2025-02-17T14:01:02Z'),
    messageType: 'receipt',
    receipt: {
      status: 'done',
      action_type: 'create_task',
      summary: "Created Task: 'Prep defensive film clips for Saturday' (Owner: Video Coordinator, Due: Feb 21 5:00 PM).",
      objects: [
        { id: 'lc-new-task', objectType: 'task', objectId: 'nt-007', label: 'Prep defensive film clips', icon: 'checkmark.circle' },
      ],
    },
  },
  // 5. User posts to Staff Room (C5_post_room — allowed, high-impact → confirmation)
  {
    id: 'mv2-005',
    conversationId: CONV_ID,
    role: 'user',
    content: 'Post to Staff Room: defensive film clips will be ready by Friday for the Saturday game prep',
    timestamp: new Date('2025-02-17T14:02:00Z'),
    messageType: 'text',
  },
  // 6. Nexus confirmation card (high-impact action requires confirm)
  {
    id: 'mv2-006',
    conversationId: CONV_ID,
    role: 'assistant',
    content: '',
    timestamp: new Date('2025-02-17T14:02:02Z'),
    messageType: 'confirmation',
    confirmation: {
      state: 'confirmed',
      action_summary: 'Post to MBB Staff Room',
      target_context: "Sports \u00B7 Lincoln University \u00B7 Men's Basketball \u00B7 2025\u201326",
      impact_line: 'This will be visible to all staff room members including Head Coach Miles.',
      requires_audit_note: false,
    },
  },
  // 7. User tries to approve a request (C7_approve_deny — BLOCKED for R3)
  {
    id: 'mv2-007',
    conversationId: CONV_ID,
    role: 'user',
    content: 'Approve the travel expense request REQ-1043',
    timestamp: new Date('2025-02-17T14:03:00Z'),
    messageType: 'text',
  },
  // 8. Nexus refusal with escalation card — A2 cannot approve
  {
    id: 'mv2-008',
    conversationId: CONV_ID,
    role: 'assistant',
    content: "Insufficient Authority (A2). I can't approve or deny requests.",
    timestamp: new Date('2025-02-17T14:03:03Z'),
    messageType: 'escalation',
    escalation: {
      reason: 'Insufficient Authority (A2). This action requires Head Coach (A3) or higher.',
      target_room: 'AD Command — Lincoln',
      target_room_id: 'rm-ad',
      target_owner: 'Head Coach Miles',
      options: [
        { label: 'Route to Head Coach (A3)', action: 'create_request' },
        { label: 'Route to AD (A4)', action: 'create_request' },
        { label: 'Save as Open Question', action: 'save_question' },
      ],
    },
    linkChips: [
      { id: 'lc-req', objectType: 'request', objectId: 'nr-002', label: 'REQ-1043: Travel Expense', icon: 'dollarsign.circle' },
    ],
  },
  // 9. User asks an intelligence question (C1_ask — allowed)
  {
    id: 'mv2-009',
    conversationId: CONV_ID,
    role: 'user',
    content: "What's our scoring efficiency in transition vs half-court?",
    timestamp: new Date('2025-02-17T14:04:00Z'),
    messageType: 'text',
  },
  // 10. Nexus rich intelligence response with stat_row
  {
    id: 'mv2-010',
    conversationId: CONV_ID,
    role: 'assistant',
    content: "Here's Lincoln MBB's scoring efficiency split for the 2025–26 season:",
    timestamp: new Date('2025-02-17T14:04:05Z'),
    messageType: 'text',
    structuredBlocks: [
      {
        type: 'stat_row',
        stats: [
          { label: 'Transition PPP', value: '1.14', color: '#22C55E' },
          { label: 'Half-Court PPP', value: '0.91', color: '#F59E0B' },
          { label: 'Trans Freq', value: '19%', color: '#3B82F6' },
          { label: 'HC Freq', value: '81%', color: '#3B82F6' },
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Transition: above average',
        content: 'Lincoln ranks in the 74th percentile in transition efficiency (1.14 PPP). Primary creators: Carter (#4), Thompson (#11).',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Half-court: below average',
        content: 'Half-court offense sits at the 38th percentile (0.91 PPP). Key area for improvement — low assisted 3pt rate (28%) and limited ball movement in set plays.',
      },
    ],
    linkChips: [
      CHIP_PLAYER_CARTER,
      CHIP_STAFF_ROOM,
    ],
  },

  // ── D2 Operational Proposal: Propose → Validate → Confirm → Commit ──

  // 11. User proposes schedule edit (D2 — allowed with confirm)
  {
    id: 'mv2-011',
    conversationId: CONV_ID,
    role: 'user',
    content: 'Move Wednesday practice to 3:00 PM — there\'s a facility conflict at the normal time',
    timestamp: new Date('2025-02-17T14:05:00Z'),
    messageType: 'text',
  },
  // 12. Nexus confirmation card (D2 operational proposal requires confirm)
  {
    id: 'mv2-012',
    conversationId: CONV_ID,
    role: 'assistant',
    content: '',
    timestamp: new Date('2025-02-17T14:05:02Z'),
    messageType: 'confirmation',
    confirmation: {
      state: 'pending',
      action_summary: 'Propose Schedule Change: Move Wednesday practice to 3:00 PM',
      target_context: "Sports \u00B7 Lincoln University \u00B7 Men's Basketball \u00B7 2025\u201326",
      impact_line: 'This will notify all rostered players and coaching staff of the time change.',
      requires_audit_note: false,
    },
  },

  // ── A2 Hard Boundary: Scholarship Modification (Blocked) ──

  // 13. User attempts scholarship change (A2 cannot)
  {
    id: 'mv2-013',
    conversationId: CONV_ID,
    role: 'user',
    content: 'Change Carter\'s scholarship to a full athletic scholarship',
    timestamp: new Date('2025-02-17T14:06:00Z'),
    messageType: 'text',
  },
  // 14. Nexus refusal — A2 cannot modify scholarship packages
  {
    id: 'mv2-014',
    conversationId: CONV_ID,
    role: 'assistant',
    content: 'Insufficient Authority (A2). Scholarship modifications require Head Coach (A3) or Athletic Director (A4) authority.',
    timestamp: new Date('2025-02-17T14:06:03Z'),
    messageType: 'escalation',
    escalation: {
      reason: 'Scholarship package changes are restricted to A3 (Tactical) authority or higher. This involves institutional financial commitments and compliance verification.',
      target_room: 'AD Command — Lincoln',
      target_room_id: 'rm-ad',
      target_owner: 'Athletic Director Johnson',
      options: [
        { label: 'Route to Head Coach (A3)', action: 'create_request' },
        { label: 'Route to AD (A4)', action: 'create_request' },
      ],
    },
    linkChips: [
      CHIP_PLAYER_CARTER,
      { id: 'lc-compliance-2', objectType: 'room', objectId: 'rm-compliance', label: 'Compliance Desk', icon: 'shield.checkered' },
    ],
  },
];

// =============================================================================
// DEMO CONVERSATION OBJECT
// =============================================================================

export const DEMO_V2_CONVERSATION = {
  id: CONV_ID,
  title: 'Lincoln MBB — Game Week Prep',
  participants: [
    { id: 'ac-pearson', name: 'Coach Pearson', role: 'owner' as const },
    { id: 'nexus', name: 'Nexus', role: 'member' as const },
  ],
  updatedAt: new Date('2025-02-17T14:06:03Z'),
  createdAt: new Date('2025-02-17T14:00:00Z'),
  isGroup: false,
  unreadCount: 0,
  type: 'chat' as const,
  isPinned: true,
  mode: 'sports' as const,
};

// =============================================================================
// HELPERS
// =============================================================================

export function getTasksByStatus(status: NexusTask['status']): NexusTask[] {
  return MOCK_NEXUS_TASKS.filter(t => t.status === status);
}

export function getBlockerTasks(): NexusTask[] {
  return MOCK_NEXUS_TASKS.filter(t => t.priority === 'blocker');
}

export function getRequestsByStatus(status: NexusRequest['status']): NexusRequest[] {
  return MOCK_NEXUS_REQUESTS.filter(r => r.status === status);
}

export function getRoomById(id: string): NexusRoom | undefined {
  return MOCK_NEXUS_ROOMS.find(r => r.id === id);
}

export function getWorkspaceById(id: string): NexusWorkspace | undefined {
  return MOCK_NEXUS_WORKSPACES.find(w => w.id === id);
}
