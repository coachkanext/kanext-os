/**
 * Nexus Room Routing — deterministic topic → room → owner routing.
 * Static config tables per mode. No AI inference.
 */

import type { Mode } from '@/types';
import type {
  RoutingTopic,
  RoutingResult,
  ModeRoutingProfile,
  Owner,
  NexusRoomType,
} from '@/types/nexus-v2';

// =============================================================================
// SPORTS MODE ROUTING
// =============================================================================

const SPORTS_ROUTING: ModeRoutingProfile = {
  default_rooms: [
    { id: 'rm-staff', name: 'Staff Room', type: 'staff' },
    { id: 'rm-ops', name: 'Ops Command', type: 'ops_command' },
    { id: 'rm-compliance', name: 'Compliance Desk', type: 'compliance_desk' },
    { id: 'rm-finance', name: 'Finance Desk', type: 'finance_desk' },
    { id: 'rm-recruiting', name: 'Recruiting Room', type: 'recruiting' },
    { id: 'rm-film', name: 'Film Room', type: 'film_qa' },
    { id: 'rm-media', name: 'Media Room', type: 'broadcast_ops' },
    { id: 'rm-ad', name: 'AD Command', type: 'staff' },
    { id: 'rm-support', name: 'Player Support', type: 'staff' },
    { id: 'rm-game', name: 'Game Command', type: 'ops_command' },
    { id: 'rm-dev', name: 'Dev Unit', type: 'teaching_team' },
  ],
  topic_routes: {
    learning: 'rm-dev',
    ops: 'rm-ops',
    compliance: 'rm-compliance',
    finance: 'rm-finance',
    integrity: 'rm-compliance',
    media: 'rm-media',
    recruiting: 'rm-recruiting',
    support: 'rm-support',
    safety: 'rm-ad',
  },
  owner_ladders: {
    learning: [
      { owner_type: 'role', owner_id: 'dev-coordinator', owner_label: 'Development Coordinator' },
      { owner_type: 'role', owner_id: 'head-coach', owner_label: 'Head Coach' },
    ],
    ops: [
      { owner_type: 'role', owner_id: 'ops-director', owner_label: 'Ops Director' },
      { owner_type: 'role', owner_id: 'head-coach', owner_label: 'Head Coach' },
    ],
    compliance: [
      { owner_type: 'role', owner_id: 'compliance-officer', owner_label: 'Compliance Officer' },
      { owner_type: 'role', owner_id: 'ad', owner_label: 'Athletic Director' },
    ],
    finance: [
      { owner_type: 'role', owner_id: 'finance-officer', owner_label: 'Finance Officer' },
      { owner_type: 'role', owner_id: 'ad', owner_label: 'Athletic Director' },
    ],
    integrity: [
      { owner_type: 'role', owner_id: 'compliance-officer', owner_label: 'Compliance Officer' },
      { owner_type: 'role', owner_id: 'ad', owner_label: 'Athletic Director' },
    ],
    media: [
      { owner_type: 'role', owner_id: 'media-coordinator', owner_label: 'Media Coordinator' },
      { owner_type: 'role', owner_id: 'head-coach', owner_label: 'Head Coach' },
    ],
    recruiting: [
      { owner_type: 'role', owner_id: 'recruiting-coordinator', owner_label: 'Recruiting Coordinator' },
      { owner_type: 'role', owner_id: 'head-coach', owner_label: 'Head Coach' },
    ],
    support: [
      { owner_type: 'role', owner_id: 'player-support', owner_label: 'Player Support Lead' },
      { owner_type: 'role', owner_id: 'head-coach', owner_label: 'Head Coach' },
    ],
    safety: [
      { owner_type: 'role', owner_id: 'ad', owner_label: 'Athletic Director' },
      { owner_type: 'role', owner_id: 'compliance-officer', owner_label: 'Compliance Officer' },
    ],
  },
  vocabulary: {
    'eligibility': 'compliance',
    'ncaa': 'compliance',
    'kcc': 'compliance',
    'waiver': 'compliance',
    'transfer': 'compliance',
    'nil': 'finance',
    'payment': 'finance',
    'budget': 'finance',
    'expense': 'finance',
    'sponsor': 'finance',
    'travel': 'ops',
    'bus': 'ops',
    'hotel': 'ops',
    'schedule': 'ops',
    'game day': 'ops',
    'film': 'learning',
    'practice': 'learning',
    'development': 'learning',
    'workout': 'learning',
    'recruit': 'recruiting',
    'prospect': 'recruiting',
    'visit': 'recruiting',
    'offer': 'recruiting',
    'press': 'media',
    'interview': 'media',
    'social media': 'media',
    'broadcast': 'media',
    'injury': 'support',
    'academic': 'support',
    'mental health': 'support',
    'safety': 'safety',
    'incident': 'safety',
  },
};

// =============================================================================
// COMPETITION MODE ROUTING
// =============================================================================

const COMPETITION_ROUTING: ModeRoutingProfile = {
  default_rooms: [
    { id: 'rm-race-ops', name: 'Race Ops', type: 'ops_command' },
    { id: 'rm-stewards', name: 'Stewards Desk', type: 'stewards_desk' },
    { id: 'rm-broadcast', name: 'Broadcast Ops', type: 'broadcast_ops' },
    { id: 'rm-sponsor', name: 'Sponsor Delivery', type: 'sponsor_delivery' },
    { id: 'rm-tech', name: 'Technical', type: 'staff' },
  ],
  topic_routes: {
    learning: 'rm-tech',
    ops: 'rm-race-ops',
    compliance: 'rm-stewards',
    finance: 'rm-sponsor',
    integrity: 'rm-stewards',
    media: 'rm-broadcast',
    recruiting: 'rm-race-ops',
    support: 'rm-race-ops',
    safety: 'rm-stewards',
  },
  owner_ladders: {
    learning: [{ owner_type: 'role', owner_id: 'tech-lead', owner_label: 'Technical Director' }],
    ops: [{ owner_type: 'role', owner_id: 'race-director', owner_label: 'Race Director' }],
    compliance: [{ owner_type: 'role', owner_id: 'steward', owner_label: 'Chief Steward' }],
    finance: [{ owner_type: 'role', owner_id: 'commercial', owner_label: 'Commercial Director' }],
    integrity: [{ owner_type: 'role', owner_id: 'steward', owner_label: 'Chief Steward' }],
    media: [{ owner_type: 'role', owner_id: 'broadcast-lead', owner_label: 'Broadcast Lead' }],
    recruiting: [{ owner_type: 'role', owner_id: 'race-director', owner_label: 'Race Director' }],
    support: [{ owner_type: 'role', owner_id: 'race-director', owner_label: 'Race Director' }],
    safety: [{ owner_type: 'role', owner_id: 'steward', owner_label: 'Chief Steward' }],
  },
  vocabulary: {
    'protest': 'integrity',
    'penalty': 'integrity',
    'steward': 'integrity',
    'results': 'compliance',
    'payout': 'finance',
    'prize': 'finance',
    'broadcast': 'media',
    'camera': 'media',
    'grid': 'ops',
    'pit lane': 'ops',
    'safety car': 'safety',
    'incident': 'safety',
    'red flag': 'safety',
  },
};

// =============================================================================
// CHURCH MODE ROUTING
// =============================================================================

const CHURCH_ROUTING: ModeRoutingProfile = {
  default_rooms: [
    { id: 'rm-leadership', name: 'Leadership Room', type: 'staff' },
    { id: 'rm-ministry', name: 'Ministry Teams', type: 'teaching_team' },
    { id: 'rm-finance-ch', name: 'Finance Desk', type: 'finance_desk' },
    { id: 'rm-care', name: 'Pastoral Care', type: 'staff' },
  ],
  topic_routes: {
    learning: 'rm-ministry',
    ops: 'rm-leadership',
    compliance: 'rm-leadership',
    finance: 'rm-finance-ch',
    integrity: 'rm-leadership',
    media: 'rm-leadership',
    recruiting: 'rm-ministry',
    support: 'rm-care',
    safety: 'rm-leadership',
  },
  owner_ladders: {
    learning: [{ owner_type: 'role', owner_id: 'ministry-lead', owner_label: 'Ministry Lead' }],
    ops: [{ owner_type: 'role', owner_id: 'pastor', owner_label: 'Lead Pastor' }],
    compliance: [{ owner_type: 'role', owner_id: 'pastor', owner_label: 'Lead Pastor' }],
    finance: [{ owner_type: 'role', owner_id: 'treasurer', owner_label: 'Treasurer' }],
    integrity: [{ owner_type: 'role', owner_id: 'pastor', owner_label: 'Lead Pastor' }],
    media: [{ owner_type: 'role', owner_id: 'media-team', owner_label: 'Media Team' }],
    recruiting: [{ owner_type: 'role', owner_id: 'ministry-lead', owner_label: 'Ministry Lead' }],
    support: [{ owner_type: 'role', owner_id: 'pastoral-care', owner_label: 'Pastoral Care' }],
    safety: [{ owner_type: 'role', owner_id: 'pastor', owner_label: 'Lead Pastor' }],
  },
  vocabulary: {
    'tithe': 'finance',
    'offering': 'finance',
    'donation': 'finance',
    'sermon': 'learning',
    'worship': 'learning',
    'volunteer': 'recruiting',
    'prayer': 'support',
    'counseling': 'support',
    'event': 'ops',
    'service': 'ops',
  },
};

// =============================================================================
// BUSINESS MODE ROUTING
// =============================================================================

const BUSINESS_ROUTING: ModeRoutingProfile = {
  default_rooms: [
    { id: 'rm-exec', name: 'Exec Room', type: 'staff' },
    { id: 'rm-ops-biz', name: 'Operations', type: 'ops_command' },
    { id: 'rm-finance-biz', name: 'Finance', type: 'finance_desk' },
    { id: 'rm-hr', name: 'HR & People', type: 'staff' },
  ],
  topic_routes: {
    learning: 'rm-hr',
    ops: 'rm-ops-biz',
    compliance: 'rm-exec',
    finance: 'rm-finance-biz',
    integrity: 'rm-exec',
    media: 'rm-exec',
    recruiting: 'rm-hr',
    support: 'rm-hr',
    safety: 'rm-exec',
  },
  owner_ladders: {
    learning: [{ owner_type: 'role', owner_id: 'hr-lead', owner_label: 'HR Lead' }],
    ops: [{ owner_type: 'role', owner_id: 'coo', owner_label: 'COO' }],
    compliance: [{ owner_type: 'role', owner_id: 'ceo', owner_label: 'CEO' }],
    finance: [{ owner_type: 'role', owner_id: 'cfo', owner_label: 'CFO' }],
    integrity: [{ owner_type: 'role', owner_id: 'ceo', owner_label: 'CEO' }],
    media: [{ owner_type: 'role', owner_id: 'cmo', owner_label: 'CMO' }],
    recruiting: [{ owner_type: 'role', owner_id: 'hr-lead', owner_label: 'HR Lead' }],
    support: [{ owner_type: 'role', owner_id: 'hr-lead', owner_label: 'HR Lead' }],
    safety: [{ owner_type: 'role', owner_id: 'ceo', owner_label: 'CEO' }],
  },
  vocabulary: {
    'invoice': 'finance',
    'payroll': 'finance',
    'revenue': 'finance',
    'contract': 'compliance',
    'hire': 'recruiting',
    'onboard': 'recruiting',
    'pipeline': 'ops',
    'deploy': 'ops',
    'launch': 'ops',
    'pr': 'media',
    'marketing': 'media',
  },
};

// =============================================================================
// EDUCATION MODE ROUTING
// =============================================================================

const EDUCATION_ROUTING: ModeRoutingProfile = {
  default_rooms: [
    { id: 'rm-faculty', name: 'Faculty Room', type: 'staff' },
    { id: 'rm-curriculum', name: 'Curriculum Team', type: 'teaching_team' },
    { id: 'rm-admin-ed', name: 'Admin Office', type: 'ops_command' },
  ],
  topic_routes: {
    learning: 'rm-curriculum',
    ops: 'rm-admin-ed',
    compliance: 'rm-admin-ed',
    finance: 'rm-admin-ed',
    integrity: 'rm-admin-ed',
    media: 'rm-admin-ed',
    recruiting: 'rm-admin-ed',
    support: 'rm-faculty',
    safety: 'rm-admin-ed',
  },
  owner_ladders: {
    learning: [{ owner_type: 'role', owner_id: 'dept-head', owner_label: 'Department Head' }],
    ops: [{ owner_type: 'role', owner_id: 'admin', owner_label: 'Administrator' }],
    compliance: [{ owner_type: 'role', owner_id: 'admin', owner_label: 'Administrator' }],
    finance: [{ owner_type: 'role', owner_id: 'admin', owner_label: 'Administrator' }],
    integrity: [{ owner_type: 'role', owner_id: 'admin', owner_label: 'Administrator' }],
    media: [{ owner_type: 'role', owner_id: 'admin', owner_label: 'Administrator' }],
    recruiting: [{ owner_type: 'role', owner_id: 'admin', owner_label: 'Administrator' }],
    support: [{ owner_type: 'role', owner_id: 'counselor', owner_label: 'School Counselor' }],
    safety: [{ owner_type: 'role', owner_id: 'admin', owner_label: 'Administrator' }],
  },
  vocabulary: {
    'grade': 'learning',
    'assignment': 'learning',
    'exam': 'learning',
    'enrollment': 'ops',
    'tuition': 'finance',
    'scholarship': 'finance',
    'discipline': 'integrity',
    'parent': 'support',
    'student': 'support',
  },
};

// =============================================================================
// PROFILE REGISTRY
// =============================================================================

const ROUTING_PROFILES: Record<string, ModeRoutingProfile> = {
  sports: SPORTS_ROUTING,
  competition: COMPETITION_ROUTING,
  church: CHURCH_ROUTING,
  business: BUSINESS_ROUTING,
  education: EDUCATION_ROUTING,
};

export function getRoutingProfile(mode: Mode): ModeRoutingProfile {
  return ROUTING_PROFILES[mode] || SPORTS_ROUTING;
}

// =============================================================================
// TOPIC DETECTION
// =============================================================================

/**
 * Detect the topic from user input using the mode's vocabulary map.
 * Returns the matched topic or null if no match.
 */
export function detectTopic(input: string, mode: Mode): RoutingTopic | null {
  const profile = getRoutingProfile(mode);
  const lower = input.toLowerCase();

  for (const [keyword, topic] of Object.entries(profile.vocabulary)) {
    if (lower.includes(keyword)) {
      return topic as RoutingTopic;
    }
  }
  return null;
}

// =============================================================================
// ROUTE TO ROOM
// =============================================================================

/**
 * Route a topic to the correct room + owner for the given mode.
 */
export function routeToRoom(topic: RoutingTopic, mode: Mode): RoutingResult {
  const profile = getRoutingProfile(mode);
  const roomId = profile.topic_routes[topic];
  const room = profile.default_rooms.find((r) => r.id === roomId);
  const ownerLadder = profile.owner_ladders[topic];
  const primaryOwner = ownerLadder[0];

  return {
    room_id: roomId,
    room_title: room?.name || 'Staff Room',
    owner: primaryOwner,
    confidence: 'exact',
  };
}

/**
 * Auto-route from natural language — detect topic, then route.
 * Returns null if topic cannot be determined.
 */
export function autoRoute(input: string, mode: Mode): RoutingResult | null {
  const topic = detectTopic(input, mode);
  if (!topic) return null;
  return routeToRoom(topic, mode);
}

/**
 * Get all rooms available for the current mode.
 */
export function getRoomsForMode(mode: Mode): { id: string; name: string; type: NexusRoomType }[] {
  return getRoutingProfile(mode).default_rooms;
}
