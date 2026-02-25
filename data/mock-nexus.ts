/**
 * Mock data for Nexus conversations and messages.
 * Used for demo purposes until real AI integration.
 */

import type { Conversation, Message, ConversationParticipant } from '@/types';
import { DEMO_V2_CONVERSATION, DEMO_V2_MESSAGES } from './mock-nexus-v2';

// =============================================================================
// PARTICIPANTS
// =============================================================================

export const MOCK_PARTICIPANTS: ConversationParticipant[] = [
  { id: 'user-1', name: 'You', role: 'owner' },
  { id: 'assistant', name: 'Nexus', role: 'member' },
  { id: 'coach-2', name: 'Coach Thompson', role: 'member' },
];

// =============================================================================
// CONVERSATIONS
// =============================================================================

export const MOCK_CONVERSATIONS: Conversation[] = [
  DEMO_V2_CONVERSATION,
  {
    id: 'conv-recruiting-eval',
    title: 'Recruiting — Darius Thompson Eval',
    participants: MOCK_PARTICIPANTS,
    lastMessage: {
      id: 'msg-re-1',
      conversationId: 'conv-recruiting-eval',
      role: 'assistant' as const,
      content: 'Thompson projects as an A-tier prospect with strong perimeter defense and transition scoring.',
      timestamp: new Date('2026-02-24T11:30:00'),
    },
    updatedAt: new Date('2026-02-24T11:30:00'),
    createdAt: new Date('2026-02-22T09:00:00'),
    isGroup: false,
    unreadCount: 0,
    type: 'chat' as const,
    mode: 'sports' as const,
  },
  {
    id: 'conv-game-plan',
    title: 'Game Plan — vs Summit',
    participants: MOCK_PARTICIPANTS,
    lastMessage: {
      id: 'msg-gp-1',
      conversationId: 'conv-game-plan',
      role: 'assistant' as const,
      content: 'Recommended: pressure their PG in transition, force right. Turnover rate climbs 12% under press.',
      timestamp: new Date('2026-02-23T16:00:00'),
    },
    updatedAt: new Date('2026-02-23T16:00:00'),
    createdAt: new Date('2026-02-21T10:00:00'),
    isGroup: false,
    unreadCount: 0,
    type: 'chat' as const,
    mode: 'sports' as const,
  },
  {
    id: 'conv-practice-dev',
    title: 'Guard Development — Week 8',
    participants: MOCK_PARTICIPANTS,
    lastMessage: {
      id: 'msg-pd-1',
      conversationId: 'conv-practice-dev',
      role: 'assistant' as const,
      content: 'Film review complete. Carter showing improved PNR reads — assist rate up 15% in last 3 games.',
      timestamp: new Date('2026-02-22T14:00:00'),
    },
    updatedAt: new Date('2026-02-22T14:00:00'),
    createdAt: new Date('2026-02-20T08:00:00'),
    isGroup: false,
    unreadCount: 0,
    type: 'chat' as const,
    mode: 'sports' as const,
  },
  {
    id: 'conv-church-sermon',
    title: 'Sermon Series Planning — March',
    participants: MOCK_PARTICIPANTS,
    lastMessage: {
      id: 'msg-cs-1',
      conversationId: 'conv-church-sermon',
      role: 'assistant' as const,
      content: 'Here are 4 sermon topic options for the "Building Foundations" series...',
      timestamp: new Date('2026-02-21T10:00:00'),
    },
    updatedAt: new Date('2026-02-21T10:00:00'),
    createdAt: new Date('2026-02-19T09:00:00'),
    isGroup: false,
    unreadCount: 0,
    type: 'chat' as const,
    mode: 'church' as const,
  },
];

// =============================================================================
// MESSAGES
// =============================================================================

const MOCK_MESSAGES: Record<string, (Message | any)[]> = {
  'demo-conv-v2': DEMO_V2_MESSAGES as any[],
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'What are our biggest roster needs for next season?',
      timestamp: new Date('2026-02-03T14:00:00'),
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: `Looking at your current roster and the projected departures, I see three primary needs:

1. **Point Guard depth** - with Johnson graduating, you'll need a primary ball handler who can run the motion offense

2. **Rim protection** - your block rate is below D2 average, and losing Williams leaves a gap

3. **Three-point shooting** from the wing position - currently shooting 31% from deep on the left side`,
      timestamp: new Date('2026-02-03T14:01:00'),
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'Based on your roster needs, I recommend focusing on transfers from programs with similar offensive systems.',
      timestamp: new Date('2026-02-04T10:30:00'),
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      role: 'user',
      content: "Team, let's discuss the rotation for Saturday's game against Simpson.",
      timestamp: new Date('2026-02-04T08:00:00'),
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      role: 'assistant',
      content: `Based on Simpson's defensive tendencies, I'd suggest considering:

- Starting with the small-ball lineup to exploit their slower perimeter defenders
- Extending Garcia's minutes in the second unit - his shooting has been efficient in the last 5 games
- Being prepared to switch to zone if they go with their big lineup`,
      timestamp: new Date('2026-02-04T08:05:00'),
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      role: 'user',
      content: 'Good points. What about Thompson - should he get more minutes?',
      timestamp: new Date('2026-02-04T08:10:00'),
    },
    {
      id: 'msg-2-4',
      conversationId: 'conv-2',
      role: 'user',
      content: 'Let me know what you think about the lineup changes',
      timestamp: new Date('2026-02-04T08:15:00'),
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      role: 'user',
      content: 'How are we tracking against preseason projections?',
      timestamp: new Date('2026-02-02T15:00:00'),
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      role: 'assistant',
      content: `Your team is currently trending above projections in conference play.

**Key metrics:**
- Preseason projection: 12-6 conference record
- Current pace: 14-4 (based on remaining schedule)
- Offensive efficiency: +4.2 points above projection
- Defensive efficiency: +1.8 points above projection

The main driver has been improved three-point shooting (34.2% vs projected 31.5%) and better turnover margin.`,
      timestamp: new Date('2026-02-02T16:45:00'),
    },
  ],
};

// =============================================================================
// HELPERS
// =============================================================================

export function getMessagesForConversation(conversationId: string): Message[] {
  return MOCK_MESSAGES[conversationId] || [];
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    return 'Just now';
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
