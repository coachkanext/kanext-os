/**
 * Recruiting Board — program + season scoped recruiting state.
 * 6 Pipeline stages: Watchlist → Targets → Priority → Commit → Signed → Closed
 */

export type BoardStatus = 'Watchlist' | 'Targets' | 'Priority' | 'Commit' | 'Signed' | 'Closed';
export const BOARD_COLUMNS: BoardStatus[] = ['Watchlist', 'Targets', 'Priority', 'Commit', 'Signed', 'Closed'];

export const BOARD_COLUMN_COLORS: Record<BoardStatus, string> = {
  Watchlist: '#FF9800',
  Targets: '#2196F3',
  Priority: '#4CAF50',
  Commit: '#9C27B0',
  Signed: '#00BCD4',
  Closed: '#757575',
};

/** Migration map: old status values → new pipeline stages */
export const STATUS_MIGRATION: Record<string, BoardStatus> = {
  'Active Targets': 'Targets',
  Visited: 'Targets',
  Committed: 'Commit',
};

export type Priority = 'A' | 'B' | 'C';

export const BOARD_TAGS = [
  'Portal', 'Needs Visit', 'Shooter', 'Rim Protector', 'Playmaker',
  'Immediate Impact', 'Project', 'High Motor', 'Versatile', 'Athletic',
] as const;
export type BoardTag = typeof BOARD_TAGS[number];

export interface BoardEntry {
  id: string;
  playerId: string; // references PoolPlayer.id
  status: BoardStatus;
  priority: Priority;
  rank: number; // position within column (0-indexed)
  position: string;
  classYear: string;
  tags: string[];
  shortNotes: string;
  longNotes: string;
  nextStep: string;
  dueDate: string; // ISO date or empty
  assignedCoach: string;
  scholarshipPct?: number; // 0-100
  nilAmount?: string;
  updated: string; // ISO date
}

export const RECRUITING_BOARD: BoardEntry[] = [
  // Watchlist (was Watching)
  { id: 'be-05', playerId: 'pp-01', status: 'Watchlist', priority: 'B', rank: 0, position: 'PG', classYear: '2026', tags: ['Playmaker'], shortNotes: 'Class of 2026 PG, long-term target', longNotes: 'Saw at Nike EYBL. Very smooth. Playing up vs older competition.', nextStep: 'Attend spring AAU tournament', dueDate: '2026-04-01', assignedCoach: 'Coach Davis', updated: '2026-02-06' },
  { id: 'be-06', playerId: 'pp-07', status: 'Watchlist', priority: 'B', rank: 1, position: 'C', classYear: '2026', tags: ['Rim Protector', 'Project'], shortNotes: 'Rim protector with upside', longNotes: 'Still developing offensively. Elite shot blocker. Could be a project recruit.', nextStep: 'Request game film from coach', dueDate: '2026-02-18', assignedCoach: 'Coach Williams', updated: '2026-02-03' },
  { id: 'be-07', playerId: 'pp-21', status: 'Watchlist', priority: 'A', rank: 2, position: 'SG', classYear: '2025', tags: ['Shooter', 'Athletic'], shortNotes: 'Dynamic scorer, explosive athlete', longNotes: 'Just became available after decommitment. Need to act fast.', nextStep: 'Call tonight', dueDate: '2026-02-09', assignedCoach: 'Coach Davis', updated: '2026-02-08' },
  { id: 'be-09', playerId: 'pp-13', status: 'Watchlist', priority: 'C', rank: 3, position: 'SF', classYear: '2025', tags: ['Versatile'], shortNotes: 'European wing, high skill level', longNotes: 'Watching tape. Visa/eligibility questions to research.', nextStep: 'Contact agent', dueDate: '2026-03-01', assignedCoach: 'Coach Williams', updated: '2026-01-20' },

  // Targets (was Active Targets)
  { id: 'be-03', playerId: 'pp-14', status: 'Targets', priority: 'A', rank: 0, position: 'PG', classYear: '2025', tags: ['Playmaker', 'High Motor'], shortNotes: 'Two-way PG, high IQ', longNotes: 'Initial call went well. Sending film package. Wants to visit in March.', nextStep: 'Send recruitment packet', dueDate: '2026-02-12', assignedCoach: 'Coach Davis', scholarshipPct: 50, updated: '2026-02-04' },
  { id: 'be-04', playerId: 'pp-08', status: 'Targets', priority: 'B', rank: 1, position: 'SG', classYear: '2025', tags: ['Shooter'], shortNotes: 'Knockdown shooter, needs to see defense', longNotes: 'DM\'d on Instagram. Responded positively. Watching more film this week.', nextStep: 'Watch Feb 14 game vs Olney Central', dueDate: '2026-02-14', assignedCoach: 'Coach Williams', updated: '2026-02-01' },
  { id: 'be-08', playerId: 'pp-18', status: 'Targets', priority: 'B', rank: 2, position: 'SF', classYear: '2025', tags: ['Versatile'], shortNotes: 'Versatile wing, can guard 1-3', longNotes: 'Good conversation. Interested in our program style. Wants to know about playing time.', nextStep: 'Virtual campus tour', dueDate: '2026-02-16', assignedCoach: 'Coach Davis', updated: '2026-01-27' },

  // Priority (was Offered)
  { id: 'be-01', playerId: 'pp-02', status: 'Priority', priority: 'A', rank: 0, position: 'SG', classYear: '2025', tags: ['Immediate Impact', 'Shooter'], shortNotes: 'Elite scorer, ready to contribute day 1', longNotes: 'Visited campus Jan 15. Very interested. Family supportive. Needs answer on scholarship by Feb 28.', nextStep: 'Follow-up call with family', dueDate: '2026-02-15', assignedCoach: 'Coach Davis', scholarshipPct: 75, nilAmount: '$5K', updated: '2026-02-08' },
  { id: 'be-02', playerId: 'pp-06', status: 'Priority', priority: 'A', rank: 1, position: 'PF', classYear: '2025', tags: ['Athletic', 'High Motor'], shortNotes: 'Physical 4-man, great motor', longNotes: 'Watched 3 games in person. Dominant on the glass. Also hearing from two D1 programs.', nextStep: 'Official visit scheduling', dueDate: '2026-02-20', assignedCoach: 'Coach Williams', scholarshipPct: 100, nilAmount: '$8K', updated: '2026-02-05' },

  // Commit
  { id: 'be-10', playerId: 'pp-10', status: 'Commit', priority: 'A', rank: 0, position: 'PG', classYear: '2025', tags: ['Portal', 'Immediate Impact'], shortNotes: 'Committed! Arriving summer 2025', longNotes: 'Signed LOI on Jan 30. Will enroll for summer session. Housing arranged.', nextStep: 'Summer orientation prep', dueDate: '2026-06-01', assignedCoach: 'Coach Davis', scholarshipPct: 85, nilAmount: '$6K', updated: '2026-01-30' },
];
