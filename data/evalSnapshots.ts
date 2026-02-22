/**
 * Saved Evaluations — Nexus evaluation snapshot references.
 */

export interface EvalSnapshot {
  id: string;
  playerId: string;
  playerName: string;
  boardEntryId?: string; // attached to board entry if linked
  timestamp: string;     // ISO datetime
  evaluator: string;
  season: string;
  summary: string;
  nexusThreadId?: string; // placeholder deep link
}

export const EVAL_SNAPSHOTS: EvalSnapshot[] = [
  { id: 'es-01', playerId: 'pp-02', playerName: 'Alex Morgan', boardEntryId: 'be-01', timestamp: '2026-01-20T14:30:00Z', evaluator: 'Coach Davis', season: '2025-26', summary: 'Elite mid-range scorer with JUCO-level competition. Projects as immediate starter at SG. Needs to improve off-ball defense and conditioning for NAIA pace. High-priority get — best available scorer in our range.', nexusThreadId: 'thread-eval-001' },
  { id: 'es-02', playerId: 'pp-06', playerName: 'Rashad Williams', boardEntryId: 'be-02', timestamp: '2026-01-12T10:15:00Z', evaluator: 'Coach Pearson', season: '2025-26', summary: 'Physical PF with relentless motor. Dominant rebounder at JUCO level. Offensively raw — limited to dunks, putbacks, and short-range hooks. Could anchor our frontcourt immediately. Worth the full scholarship investment.', nexusThreadId: 'thread-eval-002' },
  { id: 'es-03', playerId: 'pp-14', playerName: 'Terrell Washington', boardEntryId: 'be-03', timestamp: '2026-02-03T09:00:00Z', evaluator: 'Coach Davis', season: '2025-26', summary: 'True point guard with high basketball IQ. Pushes tempo, finds open shooters, and competes defensively. Exactly the floor general we need to run our system. Slightly undersized but makes up for it with quickness and instincts.', nexusThreadId: 'thread-eval-003' },
  { id: 'es-04', playerId: 'pp-10', playerName: 'Darius Jackson', boardEntryId: 'be-10', timestamp: '2026-01-18T16:45:00Z', evaluator: 'Coach Davis', season: '2025-26', summary: 'D2 transfer PG with proven track record. Two seasons of starting experience. Excellent court vision, solid shooter, tough competitor. Already committed — will be our starting PG day one.', nexusThreadId: 'thread-eval-004' },
  { id: 'es-05', playerId: 'pp-21', playerName: 'Devon Price', boardEntryId: 'be-07', timestamp: '2026-02-08T11:30:00Z', evaluator: 'Coach Davis', season: '2025-26', summary: 'Dynamic scoring guard who just became available. Explosive athlete, can score at all three levels. Recently decommitted — window is narrow. Fits our need for perimeter scoring. Must act quickly before D1 programs swoop in.', nexusThreadId: 'thread-eval-005' },
  { id: 'es-06', playerId: 'pp-08', playerName: 'Jordan Davis', timestamp: '2026-02-01T13:00:00Z', evaluator: 'Coach Pearson', season: '2025-26', summary: 'Pure shooter with deep range. Averaged nearly 20 PPG at Vincennes. Concerns about defensive effort and ball-handling under pressure. Could be a valuable bench scorer if primary options fall through.', nexusThreadId: 'thread-eval-006' },
  { id: 'es-07', playerId: 'pp-18', playerName: 'Cam Butler', boardEntryId: 'be-08', timestamp: '2026-01-28T08:20:00Z', evaluator: 'Coach Davis', season: '2025-26', summary: 'Versatile wing who can play 2-4 in small lineups. Good size, decent shooter, active defender. Not a star but a valuable roster piece. Solid Plan B wing option behind our primary targets.' },
];
