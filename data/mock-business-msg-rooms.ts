/**
 * Mock Business Rooms (Messages tab) — Structured group communication channels.
 * 4 sections: Pinned, Executive, Department, Project
 * Entity-scoped, role-aware, department-aligned.
 * Rendering context: Founder / CEO (A5, V4, D3)
 */

// =============================================================================
// TYPES
// =============================================================================

export type BizMsgRoomSection = 'pinned' | 'executive' | 'department' | 'project';

export interface BizMsgRoom {
  id: string;
  name: string;
  section: BizMsgRoomSection;
  /** For department rooms */
  department?: string;
  /** For project rooms */
  project?: string;
  visibilityClass: 0 | 1 | 2 | 3;
  lastMessage: string;
  lastSender: string;
  timestamp: Date;
  unread: boolean;
  unreadCount?: number;
  pinned: boolean;
  pinnedMessage?: string;
  locked: boolean;
  color: string;
  initials: string;
}

export interface BizMsgRoomMessage {
  id: string;
  sender: string;
  initials: string;
  role: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

// =============================================================================
// SECTION 1 — PINNED (user-specific, max 8)
// =============================================================================

const PINNED_ROOMS: BizMsgRoom[] = [
  {
    id: 'bmr-exec',
    name: '#executive',
    section: 'pinned',
    visibilityClass: 3,
    lastMessage: 'Q1 OKR review confirmed for Friday 2pm.',
    lastSender: 'Rachel Torres',
    timestamp: hoursAgo(1),
    unread: true,
    unreadCount: 3,
    pinned: true,
    pinnedMessage: 'Q1 Strategy Deck — final version attached. All execs review before Friday.',
    locked: true,
    color: '#1A1714',
    initials: 'EX',
  },
  {
    id: 'bmr-board',
    name: '#board',
    section: 'pinned',
    visibilityClass: 2,
    lastMessage: 'March board meeting agenda circulated.',
    lastSender: 'Board Secretary',
    timestamp: hoursAgo(4),
    unread: true,
    unreadCount: 1,
    pinned: true,
    pinnedMessage: 'Board Meeting — March 4, 2026. Agenda and pre-read materials linked.',
    locked: true,
    color: '#B85C5C',
    initials: 'BD',
  },
  {
    id: 'bmr-capital',
    name: '#capital',
    section: 'pinned',
    visibilityClass: 3,
    lastMessage: 'Series B term sheet comparison updated.',
    lastSender: 'James Park',
    timestamp: hoursAgo(6),
    unread: false,
    pinned: true,
    pinnedMessage: 'Series B — Status: Active. Lead: Valley Capital. Target close: Q1 2026.',
    locked: true,
    color: '#B8943E',
    initials: 'CA',
  },
];

// =============================================================================
// SECTION 2 — EXECUTIVE ROOMS (institutional, seeded)
// =============================================================================

const EXECUTIVE_ROOMS: BizMsgRoom[] = [
  {
    id: 'bmr-exec',
    name: '#executive',
    section: 'executive',
    visibilityClass: 3,
    lastMessage: 'Q1 OKR review confirmed for Friday 2pm.',
    lastSender: 'Rachel Torres',
    timestamp: hoursAgo(1),
    unread: true,
    unreadCount: 3,
    pinned: true,
    pinnedMessage: 'Q1 Strategy Deck — final version attached. All execs review before Friday.',
    locked: true,
    color: '#1A1714',
    initials: 'EX',
  },
  {
    id: 'bmr-board',
    name: '#board',
    section: 'executive',
    visibilityClass: 2,
    lastMessage: 'March board meeting agenda circulated.',
    lastSender: 'Board Secretary',
    timestamp: hoursAgo(4),
    unread: true,
    unreadCount: 1,
    pinned: true,
    pinnedMessage: 'Board Meeting — March 4, 2026. Agenda and pre-read materials linked.',
    locked: true,
    color: '#B85C5C',
    initials: 'BD',
  },
  {
    id: 'bmr-finlead',
    name: '#finance-leadership',
    section: 'executive',
    visibilityClass: 3,
    lastMessage: 'Burn rate report finalized. Runway at 18 months.',
    lastSender: 'James Park',
    timestamp: hoursAgo(8),
    unread: false,
    pinned: false,
    locked: true,
    color: '#B8943E',
    initials: 'FL',
  },
  {
    id: 'bmr-complead',
    name: '#compliance-leadership',
    section: 'executive',
    visibilityClass: 3,
    lastMessage: 'SOC 2 remediation — 2 of 3 items resolved.',
    lastSender: 'Rachel Torres',
    timestamp: hoursAgo(10),
    unread: false,
    pinned: false,
    locked: true,
    color: '#B85C5C',
    initials: 'CL',
  },
  {
    id: 'bmr-capital',
    name: '#capital',
    section: 'executive',
    visibilityClass: 3,
    lastMessage: 'Series B term sheet comparison updated.',
    lastSender: 'James Park',
    timestamp: hoursAgo(6),
    unread: false,
    pinned: true,
    pinnedMessage: 'Series B — Status: Active. Lead: Valley Capital. Target close: Q1 2026.',
    locked: true,
    color: '#B8943E',
    initials: 'CA',
  },
  {
    id: 'bmr-strategy',
    name: '#strategy',
    section: 'executive',
    visibilityClass: 3,
    lastMessage: 'EMEA partnership model approved. Kicking off Q2.',
    lastSender: 'You',
    timestamp: daysAgo(2),
    unread: false,
    pinned: false,
    locked: true,
    color: '#5A8A6E',
    initials: 'ST',
  },
];

// =============================================================================
// SECTION 3 — DEPARTMENT ROOMS
// =============================================================================

const DEPARTMENT_ROOMS: BizMsgRoom[] = [
  {
    id: 'bmr-ops',
    name: '#operations',
    section: 'department',
    department: 'Operations',
    visibilityClass: 1,
    lastMessage: 'Floor 3 lease draft is in. Reviewing terms.',
    lastSender: 'Rachel Torres',
    timestamp: hoursAgo(3),
    unread: true,
    unreadCount: 2,
    pinned: false,
    locked: false,
    color: '#1A1714',
    initials: 'OP',
  },
  {
    id: 'bmr-product',
    name: '#product',
    section: 'department',
    department: 'Product',
    visibilityClass: 1,
    lastMessage: 'v3.0 enterprise demo prep — deck attached.',
    lastSender: 'Elena Park',
    timestamp: hoursAgo(3),
    unread: true,
    unreadCount: 4,
    pinned: false,
    pinnedMessage: 'v3.0 Feature Spec — Final. P0: Payments + Enterprise SSO.',
    locked: false,
    color: '#1A1714',
    initials: 'PR',
  },
  {
    id: 'bmr-legal',
    name: '#legal',
    section: 'department',
    department: 'Legal',
    visibilityClass: 1,
    lastMessage: 'NDA template updated for Series B conversations.',
    lastSender: 'Sarah Kim',
    timestamp: daysAgo(1),
    unread: false,
    pinned: false,
    locked: false,
    color: '#B85C5C',
    initials: 'LG',
  },
  {
    id: 'bmr-facilities',
    name: '#facilities',
    section: 'department',
    department: 'Facilities',
    visibilityClass: 1,
    lastMessage: 'HVAC maintenance scheduled for Saturday.',
    lastSender: 'Facilities Manager',
    timestamp: daysAgo(1),
    unread: false,
    pinned: false,
    locked: false,
    color: '#64748B',
    initials: 'FA',
  },
  {
    id: 'bmr-marketing',
    name: '#marketing',
    section: 'department',
    department: 'Marketing',
    visibilityClass: 1,
    lastMessage: 'Launch campaign metrics — 4.2x ROAS on paid social.',
    lastSender: 'Marketing Lead',
    timestamp: hoursAgo(12),
    unread: false,
    pinned: false,
    locked: false,
    color: '#1A1714',
    initials: 'MK',
  },
  {
    id: 'bmr-ir',
    name: '#investor-relations',
    section: 'department',
    department: 'Investor Relations',
    visibilityClass: 2,
    lastMessage: 'Valley Capital partner meeting confirmed for Thursday.',
    lastSender: 'James Park',
    timestamp: hoursAgo(5),
    unread: true,
    unreadCount: 1,
    pinned: false,
    locked: true,
    color: '#B8943E',
    initials: 'IR',
  },
];

// =============================================================================
// SECTION 4 — PROJECT ROOMS (temporary, initiative-tied)
// =============================================================================

const PROJECT_ROOMS: BizMsgRoom[] = [
  {
    id: 'bmr-seriesa',
    name: '#raise-series-b',
    section: 'project',
    project: 'Series B',
    visibilityClass: 3,
    lastMessage: 'Data room access granted to Meridian Partners.',
    lastSender: 'James Park',
    timestamp: hoursAgo(2),
    unread: true,
    unreadCount: 2,
    pinned: false,
    pinnedMessage: 'Target: $18M. Lead: Valley Capital. Close: Q1 2026.',
    locked: true,
    color: '#B8943E',
    initials: 'SB',
  },
  {
    id: 'bmr-novatech',
    name: '#partnership-novatech',
    section: 'project',
    project: 'NovaTech Partnership',
    visibilityClass: 2,
    lastMessage: 'Liability cap negotiation — counter at $5M.',
    lastSender: 'Sarah Kim',
    timestamp: hoursAgo(4),
    unread: false,
    pinned: false,
    locked: true,
    color: '#1A1714',
    initials: 'NT',
  },
  {
    id: 'bmr-v3launch',
    name: '#product-v3',
    section: 'project',
    project: 'v3.0 Launch',
    visibilityClass: 1,
    lastMessage: 'Enterprise SSO integration tests passing.',
    lastSender: 'Kofi Achebe',
    timestamp: hoursAgo(5),
    unread: true,
    unreadCount: 3,
    pinned: false,
    pinnedMessage: 'Launch target: March 15. Blockers tracked in Jira.',
    locked: false,
    color: '#5A8A6E',
    initials: 'V3',
  },
  {
    id: 'bmr-office',
    name: '#campus-expansion',
    section: 'project',
    project: 'Campus Development',
    visibilityClass: 1,
    lastMessage: 'Floor plan options narrowed to 2 finalists.',
    lastSender: 'Rachel Torres',
    timestamp: daysAgo(1),
    unread: false,
    pinned: false,
    locked: false,
    color: '#64748B',
    initials: 'CE',
  },
];

// =============================================================================
// ALL ROOMS (deduplicated — pinned rooms reference executive/dept/project)
// =============================================================================

/** All unique rooms. Pinned rooms are the same objects marked with pinned=true. */
const ALL_ROOMS: BizMsgRoom[] = [
  ...EXECUTIVE_ROOMS,
  ...DEPARTMENT_ROOMS,
  ...PROJECT_ROOMS,
];

// =============================================================================
// ROOM MESSAGES (thread detail)
// =============================================================================

export const BIZ_MSG_ROOM_MESSAGES: Record<string, BizMsgRoomMessage[]> = {
  'bmr-exec': [
    { id: 'rm1-1', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Q1 OKR review is confirmed for Friday 2pm. Conference Room A.', timestamp: hoursAgo(2), isMe: false },
    { id: 'rm1-2', sender: 'James Park', initials: 'JP', role: 'CFO', content: 'I\'ll have the financial metrics ready by Thursday EOD.', timestamp: hoursAgo(1.5), isMe: false },
    { id: 'rm1-3', sender: 'You', initials: 'ME', role: 'CEO', content: 'Good. Include runway projections with and without Series B close.', timestamp: hoursAgo(1), isMe: true },
  ],
  'bmr-board': [
    { id: 'rm2-1', sender: 'Board Secretary', initials: 'BS', role: 'Governance', content: 'March board meeting agenda has been circulated. Please review the pre-read materials.', timestamp: hoursAgo(5), isMe: false },
    { id: 'rm2-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'Received. I\'ll add the EMEA strategy update to the agenda.', timestamp: hoursAgo(4), isMe: true },
  ],
  'bmr-product': [
    { id: 'rm3-1', sender: 'Elena Park', initials: 'EP', role: 'VP Product', content: 'v3.0 enterprise demo is ready. Deck attached for review.', timestamp: hoursAgo(4), isMe: false },
    { id: 'rm3-2', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Demo environment is stable. Load tested at 10K concurrent.', timestamp: hoursAgo(3.5), isMe: false },
    { id: 'rm3-3', sender: 'You', initials: 'ME', role: 'CEO', content: 'Great work. @Elena make sure the pricing slide reflects the new enterprise tiers.', timestamp: hoursAgo(3), isMe: true },
    { id: 'rm3-4', sender: 'Elena Park', initials: 'EP', role: 'VP Product', content: 'Updated. Three tiers: Starter, Business, Enterprise. Enterprise includes SSO + dedicated support.', timestamp: hoursAgo(2.5), isMe: false },
  ],
  'bmr-ops': [
    { id: 'rm4-1', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: 'Floor 3 lease draft is in from the landlord. Terms look reasonable.', timestamp: hoursAgo(4), isMe: false },
    { id: 'rm4-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'Have Legal review before we counter. What\'s the per-sqft rate?', timestamp: hoursAgo(3.5), isMe: true },
    { id: 'rm4-3', sender: 'Rachel Torres', initials: 'RT', role: 'COO', content: '$42/sqft, 5-year term. Below market for the area. Sending to Sarah now.', timestamp: hoursAgo(3), isMe: false },
  ],
  'bmr-seriesa': [
    { id: 'rm5-1', sender: 'James Park', initials: 'JP', role: 'CFO', content: 'Data room access granted to Meridian Partners. They\'re conducting due diligence this week.', timestamp: hoursAgo(3), isMe: false },
    { id: 'rm5-2', sender: 'Sarah Kim', initials: 'SK', role: 'General Counsel', content: 'NDA executed with Meridian. Standard terms.', timestamp: hoursAgo(2.5), isMe: false },
    { id: 'rm5-3', sender: 'You', initials: 'ME', role: 'CEO', content: 'Good. Schedule the partner meeting for next week. I want to present the market expansion thesis.', timestamp: hoursAgo(2), isMe: true },
  ],
  'bmr-v3launch': [
    { id: 'rm6-1', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Enterprise SSO integration tests are passing. SAML + OIDC both working.', timestamp: hoursAgo(6), isMe: false },
    { id: 'rm6-2', sender: 'Elena Park', initials: 'EP', role: 'VP Product', content: 'Nice. That unblocks the enterprise pilot with Meridian.', timestamp: hoursAgo(5.5), isMe: false },
    { id: 'rm6-3', sender: 'Kofi Achebe', initials: 'KA', role: 'CTO', content: 'Still need to finish the admin dashboard. Targeting end of week.', timestamp: hoursAgo(5), isMe: false },
  ],
  'bmr-ir': [
    { id: 'rm7-1', sender: 'James Park', initials: 'JP', role: 'CFO', content: 'Valley Capital partner meeting confirmed for Thursday at 3pm. Their office.', timestamp: hoursAgo(6), isMe: false },
    { id: 'rm7-2', sender: 'You', initials: 'ME', role: 'CEO', content: 'I\'ll prepare the updated pitch. Include the Q1 revenue forecast.', timestamp: hoursAgo(5), isMe: true },
  ],
};

// =============================================================================
// PUBLIC API
// =============================================================================

const MOCK_USER_VISIBILITY = 4; // Founder sees everything

export interface BizMsgRoomSectionData {
  title: string;
  key: BizMsgRoomSection;
  data: BizMsgRoom[];
}

export function getBizMsgRooms(search: string): BizMsgRoomSectionData[] {
  let items = [...ALL_ROOMS];

  // Visibility filter
  items = items.filter((r) => r.visibilityClass < MOCK_USER_VISIBILITY);

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.lastMessage.toLowerCase().includes(q) ||
        r.lastSender.toLowerCase().includes(q) ||
        (r.department && r.department.toLowerCase().includes(q)) ||
        (r.project && r.project.toLowerCase().includes(q)),
    );
  }

  // Sort: most recent activity first
  const sortByActivity = (rooms: BizMsgRoom[]) =>
    [...rooms].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Build sections
  const pinned = sortByActivity(items.filter((r) => r.pinned));
  const executive = sortByActivity(items.filter((r) => r.section === 'executive' && !r.pinned));
  const department = sortByActivity(items.filter((r) => r.section === 'department'));
  const project = sortByActivity(items.filter((r) => r.section === 'project'));

  const sections: BizMsgRoomSectionData[] = [];
  if (pinned.length > 0) sections.push({ title: 'PINNED', key: 'pinned', data: pinned });
  if (executive.length > 0) sections.push({ title: 'EXECUTIVE', key: 'executive', data: executive });
  if (department.length > 0) sections.push({ title: 'DEPARTMENT', key: 'department', data: department });
  if (project.length > 0) sections.push({ title: 'PROJECT', key: 'project', data: project });

  return sections;
}

export function getBizRoomMessages(roomId: string): BizMsgRoomMessage[] {
  return BIZ_MSG_ROOM_MESSAGES[roomId] ?? [];
}

export function formatMsgTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) return `${Math.max(1, Math.round(diffH * 60))}m`;
  if (diffH < 24) return `${Math.round(diffH)}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
