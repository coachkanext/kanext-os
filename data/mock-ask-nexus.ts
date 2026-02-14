/**
 * Mock data and types for the universal Ask Nexus feature.
 * Founder-first V2: questions go to founder for answer (no auto-answer).
 */

export interface AskNexusContext {
  screen: string;
  mode: string;
  orgId?: string;
  programId?: string;
  playerId?: string;
  gameId?: string;
  videoId?: string;
}

export type AskNexusStatus = 'pending' | 'answered';

export interface AskNexusEntry {
  id: string;
  question: string;
  context?: AskNexusContext;
  contextLabel: string;
  status: AskNexusStatus;
  answer?: string;
  createdAt: Date;
  answeredAt?: Date;
}

// ── Helpers ──

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
  return d;
}

export function getContextLabel(context?: AskNexusContext): string {
  if (!context) return 'General';
  const { screen } = context;
  if (screen === '/') return 'Home';
  if (screen === '/nexus') return 'Nexus';
  if (screen.includes('game-detail')) return 'Game Detail';
  if (screen.includes('recruiting')) return 'Recruiting';
  if (screen.includes('player-detail')) return 'Player Detail';
  if (screen.includes('program-context')) return 'Program Context';
  if (screen.includes('media')) return 'Media';
  if (screen.includes('stats')) return 'Stats';
  return screen.replace(/^\//, '').replace(/-/g, ' ');
}

// ── Mock Q&A history ──

export const MOCK_ASK_HISTORY: AskNexusEntry[] = [
  {
    id: 'ask-1',
    question: 'What adjustments should we make for the Campbell zone?',
    contextLabel: 'Game Detail \u00B7 vs Campbell',
    status: 'answered',
    answer: 'Against Campbell\'s 2-3 zone, attack the short corners and high post. Our DHO sets should force the wing defender to choose between the handler and the roller.',
    createdAt: daysAgo(1),
    answeredAt: daysAgo(0),
  },
  {
    id: 'ask-2',
    question: 'How does Marcus Johnson\'s FIT KR change if we switch to motion offense?',
    contextLabel: 'Player Detail \u00B7 Marcus Johnson',
    status: 'answered',
    answer: 'His FIT KR drops from 78 to 71 in motion. His off-ball movement grades lower than his P&R operator skills which are elite in our current system.',
    createdAt: daysAgo(3),
    answeredAt: daysAgo(2),
  },
  {
    id: 'ask-3',
    question: 'Which recruits in our board best fit the stretch-big archetype?',
    contextLabel: 'Recruiting',
    status: 'answered',
    answer: 'Top 3 stretch-big fits: Jaylen Carter (FIT 82), DeAndre Williams (FIT 79), and Marcus Thompson (FIT 74). Carter has the highest shooting cluster at 76.',
    createdAt: daysAgo(5),
    answeredAt: daysAgo(4),
  },
  {
    id: 'ask-4',
    question: 'What are our biggest cluster gaps vs the conference average?',
    contextLabel: 'Program Context',
    status: 'pending',
    createdAt: daysAgo(0),
  },
  {
    id: 'ask-5',
    question: 'Show me our transition defense efficiency this season.',
    contextLabel: 'Home',
    status: 'pending',
    createdAt: daysAgo(0),
  },
  {
    id: 'ask-6',
    question: 'Compare our rebounding cluster to Edward Waters.',
    contextLabel: 'Game Detail \u00B7 vs Edward Waters',
    status: 'answered',
    answer: 'Our rebounding cluster is 68 vs Edward Waters at 61. We have the edge in offensive boards (72 vs 58) but are close on defensive boards (65 vs 64).',
    createdAt: daysAgo(7),
    answeredAt: daysAgo(6),
  },
];
