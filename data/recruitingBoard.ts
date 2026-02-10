/**
 * Recruiting Board — program + season scoped recruiting state.
 */

export type BoardStatus = 'Watching' | 'Contacted' | 'Offered' | 'Committed' | 'Archived';
export type Priority = 'A' | 'B' | 'C';

export interface BoardEntry {
  id: string;
  playerId: string; // references PoolPlayer.id
  status: BoardStatus;
  priority: Priority;
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
  { id: 'be-01', playerId: 'pp-02', status: 'Offered', priority: 'A', position: 'SG', classYear: '2025', tags: ['JUCO', 'Scorer', 'Immediate Impact'], shortNotes: 'Elite scorer, ready to contribute day 1', longNotes: 'Visited campus Jan 15. Very interested. Family supportive. Needs answer on scholarship by Feb 28.', nextStep: 'Follow-up call with family', dueDate: '2026-02-15', assignedCoach: 'Coach Davis', scholarshipPct: 75, nilAmount: '$5K', updated: '2026-02-08' },
  { id: 'be-02', playerId: 'pp-06', status: 'Offered', priority: 'A', position: 'PF', classYear: '2025', tags: ['JUCO', 'Rebounder', 'Athletic'], shortNotes: 'Physical 4-man, great motor', longNotes: 'Watched 3 games in person. Dominant on the glass. Also hearing from two D1 programs.', nextStep: 'Official visit scheduling', dueDate: '2026-02-20', assignedCoach: 'Coach Williams', scholarshipPct: 100, nilAmount: '$8K', updated: '2026-02-05' },
  { id: 'be-03', playerId: 'pp-14', status: 'Contacted', priority: 'A', position: 'PG', classYear: '2025', tags: ['JUCO', 'Floor General', 'Defender'], shortNotes: 'Two-way PG, high IQ', longNotes: 'Initial call went well. Sending film package. Wants to visit in March.', nextStep: 'Send recruitment packet', dueDate: '2026-02-12', assignedCoach: 'Coach Davis', scholarshipPct: 50, updated: '2026-02-04' },
  { id: 'be-04', playerId: 'pp-08', status: 'Contacted', priority: 'B', position: 'SG', classYear: '2025', tags: ['JUCO', 'Shooter'], shortNotes: 'Knockdown shooter, needs to see defense', longNotes: 'DM\'d on Instagram. Responded positively. Watching more film this week.', nextStep: 'Watch Feb 14 game vs Olney Central', dueDate: '2026-02-14', assignedCoach: 'Coach Williams', updated: '2026-02-01' },
  { id: 'be-05', playerId: 'pp-01', status: 'Watching', priority: 'B', position: 'PG', classYear: '2026', tags: ['HS', 'Playmaker'], shortNotes: 'Class of 2026 PG, long-term target', longNotes: 'Saw at Nike EYBL. Very smooth. Playing up vs older competition.', nextStep: 'Attend spring AAU tournament', dueDate: '2026-04-01', assignedCoach: 'Coach Davis', updated: '2026-02-06' },
  { id: 'be-06', playerId: 'pp-07', status: 'Watching', priority: 'B', position: 'C', classYear: '2026', tags: ['HS', 'Shot Blocker', 'Raw'], shortNotes: 'Rim protector with upside', longNotes: 'Still developing offensively. Elite shot blocker. Could be a project recruit.', nextStep: 'Request game film from coach', dueDate: '2026-02-18', assignedCoach: 'Coach Williams', updated: '2026-02-03' },
  { id: 'be-07', playerId: 'pp-21', status: 'Watching', priority: 'A', position: 'SG', classYear: '2025', tags: ['JUCO', 'Scorer', 'Athletic'], shortNotes: 'Dynamic scorer, explosive athlete', longNotes: 'Just became available after decommitment. Need to act fast.', nextStep: 'Call tonight', dueDate: '2026-02-09', assignedCoach: 'Coach Davis', updated: '2026-02-08' },
  { id: 'be-08', playerId: 'pp-18', status: 'Contacted', priority: 'B', position: 'SF', classYear: '2025', tags: ['JUCO', 'Versatile'], shortNotes: 'Versatile wing, can guard 1-3', longNotes: 'Good conversation. Interested in our program style. Wants to know about playing time.', nextStep: 'Virtual campus tour', dueDate: '2026-02-16', assignedCoach: 'Coach Davis', updated: '2026-01-27' },
  { id: 'be-09', playerId: 'pp-13', status: 'Watching', priority: 'C', position: 'SF', classYear: '2025', tags: ['International', 'Skilled'], shortNotes: 'European wing, high skill level', longNotes: 'Watching tape. Visa/eligibility questions to research.', nextStep: 'Contact agent', dueDate: '2026-03-01', assignedCoach: 'Coach Williams', updated: '2026-01-20' },
  { id: 'be-10', playerId: 'pp-10', status: 'Committed', priority: 'A', position: 'PG', classYear: '2025', tags: ['D2 Transfer', 'Proven'], shortNotes: 'Committed! Arriving summer 2025', longNotes: 'Signed LOI on Jan 30. Will enroll for summer session. Housing arranged.', nextStep: 'Summer orientation prep', dueDate: '2026-06-01', assignedCoach: 'Coach Davis', scholarshipPct: 85, nilAmount: '$6K', updated: '2026-01-30' },
  { id: 'be-11', playerId: 'pp-16', status: 'Archived', priority: 'B', position: 'C', classYear: '2025', tags: ['JUCO'], shortNotes: 'Chose different program', longNotes: 'Committed to Bethune-Cookman on Feb 1. Wished him well.', nextStep: '', dueDate: '', assignedCoach: 'Coach Williams', updated: '2026-02-01' },
];
