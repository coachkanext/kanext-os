/**
 * Mock data — Conversation History for Nexus side panel.
 * Includes all conversation types: nexus (1:1 AI), simulation, space, thread.
 */

export interface ConversationHistoryItem {
  id: string;
  summary: string;
  timestamp: Date;
  type: 'nexus' | 'simulation' | 'space' | 'thread';
  mode: 'sports' | 'business' | 'church' | 'education' | 'competition';
}

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

const MOCK_HISTORY: ConversationHistoryItem[] = [
  {
    id: 'h1',
    summary: "What's our defensive efficiency this season?",
    timestamp: hoursAgo(2),
    type: 'nexus',
    mode: 'sports',
  },
  {
    id: 'h2',
    summary: 'Coaching Staff shared space',
    timestamp: hoursAgo(4),
    type: 'space',
    mode: 'sports',
  },
  {
    id: 'h3',
    summary: 'Marcus Williams — defensive alignment',
    timestamp: hoursAgo(8),
    type: 'thread',
    mode: 'sports',
  },
  {
    id: 'h4',
    summary: 'Season comparison simulation: 2024 vs 2025',
    timestamp: hoursAgo(26),
    type: 'simulation',
    mode: 'sports',
  },
  {
    id: 'h5',
    summary: 'Recruiting pipeline analysis for 2027 class',
    timestamp: hoursAgo(72),
    type: 'nexus',
    mode: 'sports',
  },
  {
    id: 'h6',
    summary: 'Game Day Prep shared space',
    timestamp: hoursAgo(80),
    type: 'space',
    mode: 'sports',
  },
  {
    id: 'h7',
    summary: 'Red zone play calling breakdown',
    timestamp: hoursAgo(96),
    type: 'nexus',
    mode: 'sports',
  },
  {
    id: 'h8',
    summary: 'Q3 revenue projections',
    timestamp: hoursAgo(150),
    type: 'nexus',
    mode: 'business',
  },
];

/** All conversation history (for full History page) */
export function getConversationHistory(): ConversationHistoryItem[] {
  return MOCK_HISTORY;
}

/** Last 6 recent conversations (for side panel quick access) */
export function getRecents(): ConversationHistoryItem[] {
  return MOCK_HISTORY.slice(0, 6);
}
