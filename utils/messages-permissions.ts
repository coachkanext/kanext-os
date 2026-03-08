/**
 * Messages Permissions
 * Role-based permission functions for the messaging system.
 */

import type { Role } from '@/types';
import type { ComposePostType, ThreadTemplate } from '@/data/mock-messages';

const STAFF_ROLES: Role[] = ['founder', 'admin', 'gm', 'head_coach', 'assistant_coach', 'staff'];
const CREATOR_ROLES: Role[] = [...STAFF_ROLES, 'student_athlete'];
const REQUESTS_ONLY_ROLES: Role[] = ['viewer', 'scout', 'fan', 'donor', 'media', 'agent', 'investor'];

export function canCreateFeedPost(role: Role): boolean {
  return CREATOR_ROLES.includes(role);
}

export function canCreateThread(role: Role): boolean {
  return CREATOR_ROLES.includes(role);
}

export function canCreateGroupThread(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

export function canCreateChannel(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

export function canRepost(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

export function canSavePost(role: Role): boolean {
  return role === 'founder' || role === 'staff';
}

export function canDeletePost(role: Role): boolean {
  return role === 'founder';
}

export function isRequestsOnly(role: Role): boolean {
  return REQUESTS_ONLY_ROLES.includes(role);
}

export function getAvailableTemplates(role: Role): ThreadTemplate[] {
  const base: ThreadTemplate[] = ['dm'];

  if (STAFF_ROLES.includes(role)) {
    return [
      ...base,
      'group',
      'recruit_thread',
      'parent_thread',
      'position_group',
      'staff_room',
      'team_thread',
      'game_thread',
      'practice_thread',
    ];
  }

  if (role === 'student_athlete') {
    return base; // DM only
  }

  return [];
}

export function getAvailablePostTypes(role: Role): ComposePostType[] {
  const base: ComposePostType[] = ['update'];

  if (role === 'founder' || role === 'gm' || role === 'head_coach' || role === 'assistant_coach') {
    return ['update', 'clip_link', 'poll', 'recruit_update', 'staff_note'];
  }

  if (role === 'staff') {
    return ['update', 'clip_link', 'staff_note'];
  }

  if (role === 'student_athlete') {
    return ['update', 'clip_link'];
  }

  return base;
}
