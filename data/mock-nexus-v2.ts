/**
 * Nexus v2 Mock Data
 * Governed objects + rich demo messages for the universal chat interface.
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
  org_id: 'fmu-lions',
  org_name: 'Carroll College',
  scope_type: 'program',
  scope_id: 'fmu-mbb',
  scope_name: 'Men\'s Basketball',
  season_id: '2025-26',
  season_label: '2025–26',
};

const KaNeXT_ATH_CONTEXT: NexusContext = {
  mode: 'sports',
  org_id: 'fmu-lions',
  org_name: 'Carroll College',
  scope_type: 'org',
  season_id: '2025-26',
  season_label: '2025–26',
};

// =============================================================================
// OWNERS
// =============================================================================

const OWNER_HC: Owner = { owner_type: 'user', owner_id: 'sammy', owner_label: 'Head Coach Carter' };
const OWNER_OPS: Owner = { owner_type: 'role', owner_id: 'ops-lead', owner_label: 'Ops Lead' };
const OWNER_COMPLIANCE: Owner = { owner_type: 'role', owner_id: 'compliance-officer', owner_label: 'Compliance Officer' };
const OWNER_VIDEO: Owner = { owner_type: 'role', owner_id: 'video-coord', owner_label: 'Video Coordinator' };
const OWNER_AC: Owner = { owner_type: 'user', owner_id: 'ac-williams', owner_label: 'Coach Pearson' };
const OWNER_RECRUITING: Owner = { owner_type: 'role', owner_id: 'recruiting-coord', owner_label: 'Recruiting Coordinator' };
const OWNER_FINANCE: Owner = { owner_type: 'role', owner_id: 'finance-lead', owner_label: 'Finance Lead' };

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
    created_by: 'sammy',
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
    created_by: 'sammy',
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
    created_by: 'sammy',
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
    created_by: 'sammy',
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
    created_by: 'ac-williams',
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
    created_by: 'sammy',
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
    submitted_by: 'sammy',
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
      { id: 'an-001', context: KaNeXT_MBB_CONTEXT, actor_user_id: 'sammy', actor_label: 'HC Carter', note_text: 'Initiated eligibility review for Carter. Missing enrollment verification.', created_at: '2025-02-15T11:00:00Z' },
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
    title: 'Carroll MBB — Game Week: vs Summit',
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
    title: 'Carroll MBB — Recruiting Board (2026 Class)',
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
  { id: 'rm-compliance', name: 'Compliance Desk — Carroll', context: KaNeXT_ATH_CONTEXT, room_type: 'compliance_desk', visibility: 'restricted', owners: [OWNER_COMPLIANCE], active_blockers_count: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T08:00:00Z' },
  { id: 'rm-finance', name: 'Finance Desk — Carroll', context: KaNeXT_ATH_CONTEXT, room_type: 'finance_desk', visibility: 'restricted', owners: [OWNER_FINANCE], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-16T15:00:00Z' },
  { id: 'rm-recruiting', name: 'Recruiting War Room — MBB', context: KaNeXT_MBB_CONTEXT, room_type: 'recruiting', visibility: 'scoped', owners: [OWNER_HC, OWNER_RECRUITING], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T11:00:00Z' },
  { id: 'rm-film', name: 'Film Room Q&A — MBB', context: KaNeXT_MBB_CONTEXT, room_type: 'film_qa', visibility: 'scoped', owners: [OWNER_VIDEO], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T09:30:00Z' },
  { id: 'rm-media', name: 'Media Ops — Carroll', context: KaNeXT_ATH_CONTEXT, room_type: 'media_ops', visibility: 'scoped', owners: [{ owner_type: 'role', owner_id: 'media-lead', owner_label: 'Media Lead' }], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T10:00:00Z' },
  { id: 'rm-ad', name: 'AD Command — Carroll', context: KaNeXT_ATH_CONTEXT, room_type: 'ad_command', visibility: 'restricted', owners: [OWNER_HC], created_at: '2025-01-01T00:00:00Z', updated_at: '2025-02-17T07:00:00Z' },
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
    title: 'Carroll MBB — This Context',
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
// DEMO CONVERSATION MESSAGES (rich v2 messages)
// =============================================================================

const CONV_ID = 'demo-conv-v2';

export const DEMO_V2_MESSAGES: MessageV2[] = [
  // 1. User asks about blockers
  {
    id: 'mv2-001',
    conversationId: CONV_ID,
    role: 'user',
    content: 'What\'s blocking the Southeastern game this week?',
    timestamp: new Date('2025-02-17T14:00:00Z'),
    messageType: 'text',
  },
  // 2. Nexus answers with structured blocks + link chips
  {
    id: 'mv2-002',
    conversationId: CONV_ID,
    role: 'assistant',
    content: 'There are 2 active blockers for the Southeastern game (Feb 22):',
    timestamp: new Date('2025-02-17T14:00:05Z'),
    messageType: 'text',
    structuredBlocks: [
      {
        type: 'callout',
        variant: 'error',
        title: 'Blocker 1: Travel bus not confirmed',
        content: 'Due tonight at 9:00 PM. Owner: Ops Lead. Fallback: university van pool.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Blocker 2: Carter eligibility docs missing',
        content: 'Enrollment verification form not on file. Under review by Compliance. Due Feb 19.',
      },
      {
        type: 'stat_row',
        stats: [
          { label: 'Scout Clips', value: 'In Progress', color: '#F59E0B' },
          { label: 'Game Plan', value: 'Draft', color: '#F59E0B' },
          { label: 'Travel', value: 'Blocked', color: '#EF4444' },
          { label: 'Compliance', value: 'Under Review', color: '#EF4444' },
        ],
      },
    ],
    linkChips: [
      { id: 'lc-t1', objectType: 'task', objectId: 'nt-001', label: 'Travel Bus Task', icon: 'bus.fill' },
      { id: 'lc-r1', objectType: 'request', objectId: 'nr-001', label: 'REQ-1042: Carter Eligibility', icon: 'shield.checkered' },
      CHIP_OPS_COMMAND,
    ],
  },
  // 3. User creates a task via chat
  {
    id: 'mv2-003',
    conversationId: CONV_ID,
    role: 'user',
    content: 'Create a task: follow up with registrar on Carter forms, assign Compliance Officer, due tomorrow 5pm',
    timestamp: new Date('2025-02-17T14:01:00Z'),
    messageType: 'text',
  },
  // 4. Nexus receipt
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
      summary: 'Created Task: \'Follow up with registrar on Carter forms\' (Owner: Compliance Officer, Due: Feb 18 5:00 PM).',
      objects: [
        { id: 'lc-new-task', objectType: 'task', objectId: 'nt-007', label: 'Follow up on Carter forms', icon: 'checkmark.circle' },
        CHIP_COMPLIANCE_DESK,
      ],
    },
  },
  // 5. User asks about compliance
  {
    id: 'mv2-005',
    conversationId: CONV_ID,
    role: 'user',
    content: 'Can you post an update to the Compliance Desk about Carter?',
    timestamp: new Date('2025-02-17T14:02:00Z'),
    messageType: 'text',
  },
  // 6. Nexus confirmation (posting to restricted room)
  {
    id: 'mv2-006',
    conversationId: CONV_ID,
    role: 'assistant',
    content: '',
    timestamp: new Date('2025-02-17T14:02:02Z'),
    messageType: 'confirmation',
    confirmation: {
      state: 'pending',
      action_summary: 'Post update to Compliance Desk — Carroll',
      target_context: 'Sports · Carroll College · Athletics · 2025–26',
      impact_line: 'This will notify the Compliance Officer about the Carter eligibility status.',
      requires_audit_note: false,
    },
  },
  // 7. User confirms
  {
    id: 'mv2-007',
    conversationId: CONV_ID,
    role: 'user',
    content: 'Yes',
    timestamp: new Date('2025-02-17T14:02:10Z'),
    messageType: 'text',
  },
  // 8. Nexus receipt for room post
  {
    id: 'mv2-008',
    conversationId: CONV_ID,
    role: 'assistant',
    content: '',
    timestamp: new Date('2025-02-17T14:02:12Z'),
    messageType: 'receipt',
    receipt: {
      status: 'posted',
      action_type: 'post_room',
      summary: 'Posted to Compliance Desk: "Update on Carter eligibility — registrar follow-up task created, due Feb 18 5 PM. Missing enrollment verification form."',
      target_room: 'Compliance Desk — Carroll',
      objects: [CHIP_COMPLIANCE_DESK, CHIP_PLAYER_CARTER],
    },
  },
  // 9. User asks something Nexus can't verify
  {
    id: 'mv2-009',
    conversationId: CONV_ID,
    role: 'user',
    content: 'What\'s Southeastern\'s press break package?',
    timestamp: new Date('2025-02-17T14:03:00Z'),
    messageType: 'text',
  },
  // 10. Nexus escalation
  {
    id: 'mv2-010',
    conversationId: CONV_ID,
    role: 'assistant',
    content: 'I don\'t have verified scouting data on Southeastern\'s press break package yet.',
    timestamp: new Date('2025-02-17T14:03:03Z'),
    messageType: 'escalation',
    escalation: {
      reason: 'Missing verified scouting data for this specific package.',
      target_room: 'Film Room Q&A — MBB',
      target_room_id: 'rm-film',
      target_owner: 'Video Coordinator',
      options: [
        { label: 'Post to Film Room Q&A', action: 'post_room' },
        { label: 'Create a Request (Scout Review)', action: 'create_request' },
        { label: 'Save as Open Question', action: 'save_question' },
      ],
    },
  },
];

// =============================================================================
// DEMO CONVERSATION OBJECT
// =============================================================================

export const DEMO_V2_CONVERSATION = {
  id: CONV_ID,
  title: 'Game Week Prep — Southeastern',
  participants: [
    { id: 'sammy', name: 'Alex', role: 'owner' as const },
    { id: 'nexus', name: 'Nexus', role: 'member' as const },
  ],
  updatedAt: new Date('2025-02-17T14:03:03Z'),
  createdAt: new Date('2025-02-17T14:00:00Z'),
  isGroup: false,
  unreadCount: 0,
  type: 'chat' as const,
  isPinned: true,
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
