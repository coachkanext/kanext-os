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

export const MOCK_CONVERSATIONS: Conversation[] = [DEMO_V2_CONVERSATION];

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
