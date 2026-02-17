/**
 * Mock data for Activity feed.
 * Provides demo activity items for all 4 modes.
 */

import type { ActivityItem, Mode, Role } from '@/types';

// =============================================================================
// SPORTS MODE ACTIVITY
// =============================================================================

const SPORTS_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-sports-1',
    type: 'game_final',
    title: 'Game Final',
    description: 'Lincoln 112 - Bethesda 88',
    timestamp: new Date('2026-02-04T21:30:00'),
    sourceType: 'event',
    sourceId: 'game-harris-stowe',
    route: '/organization/programs/varsity/events/game-harris-stowe',
    organizationId: 'lincoln-basketball',
    mode: 'sports',
    visibility: ['head_coach', 'assistant_coach', 'gm', 'student_athlete', 'fan', 'media'],
  },
  {
    id: 'act-sports-2',
    type: 'roster_published',
    title: 'Roster Updated',
    description: 'Development I roster changes published',
    timestamp: new Date('2026-02-04T14:00:00'),
    sourceType: 'record',
    sourceId: 'roster-dev-1',
    route: '/organization/programs/dev-1/roster',
    organizationId: 'lincoln-basketball',
    mode: 'sports',
    visibility: ['head_coach', 'assistant_coach', 'gm'],
  },
  {
    id: 'act-sports-3',
    type: 'media_added',
    title: 'New Highlight',
    description: 'Kalejaiye 33-point performance vs Ohlone',
    timestamp: new Date('2026-02-03T10:15:00'),
    sourceType: 'media',
    sourceId: 'media-johnson-25',
    route: '/organization/programs/varsity/media',
    organizationId: 'lincoln-basketball',
    mode: 'sports',
    visibility: ['head_coach', 'assistant_coach', 'gm', 'student_athlete', 'fan', 'media'],
  },
  {
    id: 'act-sports-4',
    type: 'schedule_updated',
    title: 'Schedule Change',
    description: 'Cal State East Bay game date TBD',
    timestamp: new Date('2026-02-02T16:30:00'),
    sourceType: 'event',
    sourceId: 'game-central',
    route: '/organization/schedule',
    organizationId: 'lincoln-basketball',
    mode: 'sports',
    visibility: ['head_coach', 'assistant_coach', 'gm', 'student_athlete', 'fan', 'media'],
  },
  {
    id: 'act-sports-5',
    type: 'game_final',
    title: 'Game Final',
    description: 'Lincoln 127 - Cal Prestige Tigers 60',
    timestamp: new Date('2026-02-01T21:00:00'),
    sourceType: 'event',
    sourceId: 'game-culver',
    route: '/organization/results',
    organizationId: 'lincoln-basketball',
    mode: 'sports',
    visibility: ['head_coach', 'assistant_coach', 'gm', 'student_athlete', 'fan', 'media'],
  },
  {
    id: 'act-sports-6',
    type: 'score_updated',
    title: 'Box Score Updated',
    description: 'Added player stats for Cal Prestige Tigers game',
    timestamp: new Date('2026-02-01T22:30:00'),
    sourceType: 'event',
    sourceId: 'game-culver',
    route: '/organization/results',
    organizationId: 'lincoln-basketball',
    mode: 'sports',
    visibility: ['head_coach', 'assistant_coach', 'gm'],
  },
  {
    id: 'act-sports-7',
    type: 'media_added',
    title: 'New Video',
    description: 'Practice footage from Jan 30 uploaded',
    timestamp: new Date('2026-01-30T17:00:00'),
    sourceType: 'media',
    sourceId: 'media-practice-jan30',
    route: '/organization/programs/varsity/media',
    organizationId: 'lincoln-basketball',
    mode: 'sports',
    visibility: ['head_coach', 'assistant_coach', 'gm'],
  },
];

// =============================================================================
// ENTERPRISE MODE ACTIVITY
// =============================================================================

const ENTERPRISE_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-ent-1',
    type: 'document_updated',
    title: 'Document Updated',
    description: 'Investor Deck - Q1 2026 metrics added',
    timestamp: new Date('2026-02-04T11:00:00'),
    sourceType: 'record',
    sourceId: 'doc-pitch',
    route: '/organization/documents',
    organizationId: 'kanext',
    mode: 'enterprise',
    visibility: ['founder', 'investor'],
  },
  {
    id: 'act-ent-2',
    type: 'scenario_saved',
    title: 'Scenario Saved',
    description: 'Market expansion analysis - West Coast',
    timestamp: new Date('2026-02-03T15:30:00'),
    sourceType: 'system',
    sourceId: 'scenario-west-coast',
    route: '/nexus',
    organizationId: 'kanext',
    mode: 'enterprise',
    visibility: ['founder'],
  },
  {
    id: 'act-ent-3',
    type: 'document_added',
    title: 'New Document',
    description: 'Technical Architecture Overview added',
    timestamp: new Date('2026-02-02T09:00:00'),
    sourceType: 'record',
    sourceId: 'doc-tech-arch',
    route: '/organization/documents',
    organizationId: 'kanext',
    mode: 'enterprise',
    visibility: ['founder', 'investor'],
  },
  {
    id: 'act-ent-4',
    type: 'config_changed',
    title: 'Settings Updated',
    description: 'Data room visibility settings modified',
    timestamp: new Date('2026-01-31T14:00:00'),
    sourceType: 'system',
    sourceId: 'settings',
    route: '/organization',
    organizationId: 'kanext',
    mode: 'enterprise',
    visibility: ['founder'],
  },
];

// =============================================================================
// CHURCH MODE ACTIVITY
// =============================================================================

const CHURCH_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-church-1',
    type: 'message_posted',
    title: 'New Message',
    description: '"Walking in Faith" - Sunday sermon now available',
    timestamp: new Date('2026-02-03T14:00:00'),
    sourceType: 'media',
    sourceId: 'message-recent',
    route: '/organization/messages',
    organizationId: 'icc',
    mode: 'church',
    visibility: ['member', 'staff', 'leadership'],
  },
  {
    id: 'act-church-2',
    type: 'event_updated',
    title: 'Event Updated',
    description: 'Youth retreat registration now open',
    timestamp: new Date('2026-02-02T10:00:00'),
    sourceType: 'event',
    sourceId: 'event-youth-retreat',
    route: '/organization/ministries/ministry-youth',
    organizationId: 'icc',
    mode: 'church',
    visibility: ['member', 'staff', 'leadership'],
  },
  {
    id: 'act-church-3',
    type: 'ministry_updated',
    title: 'Ministry Update',
    description: 'Children\'s Church curriculum update for Feb',
    timestamp: new Date('2026-02-01T09:00:00'),
    sourceType: 'organization',
    sourceId: 'ministry-children',
    route: '/organization/ministries/ministry-children',
    organizationId: 'icc',
    mode: 'church',
    visibility: ['staff', 'leadership'],
  },
  {
    id: 'act-church-4',
    type: 'giving_updated',
    title: 'Giving Campaign',
    description: 'Building fund goal reached - Thank you!',
    timestamp: new Date('2026-01-30T16:00:00'),
    sourceType: 'system',
    sourceId: 'giving-building',
    route: '/organization/giving',
    organizationId: 'icc',
    mode: 'church',
    visibility: ['member', 'staff', 'leadership'],
  },
];

// =============================================================================
// EDUCATION MODE ACTIVITY
// =============================================================================

const EDUCATION_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-edu-1',
    type: 'calendar_published',
    title: 'Calendar Update',
    description: 'Spring 2026 final exam schedule published',
    timestamp: new Date('2026-02-04T08:00:00'),
    sourceType: 'record',
    sourceId: 'schedule-spring-finals',
    route: '/organization/schedule',
    organizationId: 'sdcc',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'act-edu-2',
    type: 'event_updated',
    title: 'Event Reminder',
    description: 'Add/Drop deadline Feb 7',
    timestamp: new Date('2026-02-03T12:00:00'),
    sourceType: 'event',
    sourceId: 'event-add-drop',
    route: '/organization/schedule',
    organizationId: 'sdcc',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'act-edu-3',
    type: 'leadership_updated',
    title: 'Faculty Update',
    description: 'Dr. James Wilson joins Business department',
    timestamp: new Date('2026-02-01T10:00:00'),
    sourceType: 'organization',
    sourceId: 'member-wilson',
    route: '/organization/leadership',
    organizationId: 'sdcc',
    mode: 'education',
    visibility: ['faculty', 'student', 'staff'],
  },
  {
    id: 'act-edu-4',
    type: 'term_confirmed',
    title: 'Term Complete',
    description: 'Fall 2025 grades finalized',
    timestamp: new Date('2026-01-15T09:00:00'),
    sourceType: 'record',
    sourceId: 'term-fall-2025',
    route: '/organization/results',
    organizationId: 'sdcc',
    mode: 'education',
    visibility: ['faculty', 'staff'],
  },
];

// =============================================================================
// COMBINED DATA
// =============================================================================

const ALL_ACTIVITY: Record<Mode, ActivityItem[]> = {
  sports: SPORTS_ACTIVITY,
  enterprise: ENTERPRISE_ACTIVITY,
  business: ENTERPRISE_ACTIVITY,
  church: CHURCH_ACTIVITY,
  education: EDUCATION_ACTIVITY,
  competition: [],
};

// =============================================================================
// HELPERS
// =============================================================================

export function getActivityForMode(mode: Mode): ActivityItem[] {
  return ALL_ACTIVITY[mode] || [];
}

export function getFilteredActivity(mode: Mode, role: Role): ActivityItem[] {
  const activity = ALL_ACTIVITY[mode] || [];
  return activity.filter((item) => item.visibility.includes(role));
}

export type TimeGroup = 'today' | 'this_week' | 'earlier';

export function getTimeGroup(timestamp: Date): TimeGroup {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  if (timestamp >= startOfToday) {
    return 'today';
  } else if (timestamp >= startOfWeek) {
    return 'this_week';
  }
  return 'earlier';
}

export function groupActivityByTime(
  activity: ActivityItem[]
): Map<TimeGroup, ActivityItem[]> {
  const groups = new Map<TimeGroup, ActivityItem[]>();
  groups.set('today', []);
  groups.set('this_week', []);
  groups.set('earlier', []);

  for (const item of activity) {
    const group = getTimeGroup(item.timestamp);
    const existing = groups.get(group) || [];
    groups.set(group, [...existing, item]);
  }

  return groups;
}

export function getTimeGroupLabel(group: TimeGroup): string {
  const labels: Record<TimeGroup, string> = {
    today: 'Today',
    this_week: 'This Week',
    earlier: 'Earlier',
  };
  return labels[group];
}

export function formatActivityTime(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    game_final: 'sportscourt',
    score_updated: 'chart.bar',
    schedule_updated: 'calendar.badge.clock',
    media_added: 'play.rectangle',
    roster_published: 'person.3',
    document_added: 'doc.badge.plus',
    document_updated: 'doc.badge.arrow.up',
    scenario_saved: 'lightbulb',
    config_changed: 'gearshape',
    message_posted: 'text.bubble',
    event_updated: 'calendar',
    ministry_updated: 'hands.sparkles',
    giving_updated: 'heart',
    calendar_published: 'calendar.badge.checkmark',
    term_confirmed: 'checkmark.seal',
    leadership_updated: 'person.badge.plus',
  };
  return icons[type] || 'bell';
}
