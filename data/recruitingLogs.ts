/**
 * Recruiting Logs — every recruiting action tied to a Board Entry.
 */

export type ActionType = 'Call' | 'Text' | 'DM' | 'Visit' | 'Watched Film' | 'Official' | 'Unofficial';

export interface RecruitingLog {
  id: string;
  boardEntryId: string; // references BoardEntry.id
  playerId: string;     // denormalized for easy filtering
  playerName: string;   // denormalized for display
  actionType: ActionType;
  date: string;         // ISO date
  outcome: string;
  notes: string;
  nextAction: string;
  nextActionDue: string; // ISO date or empty
  owner: string;
}

export const RECRUITING_LOGS: RecruitingLog[] = [
  { id: 'rl-01', boardEntryId: 'be-01', playerId: 'pp-02', playerName: 'Alex Morgan', actionType: 'Visit', date: '2026-01-15', outcome: 'Very positive — loved the campus and coaching staff', notes: 'Toured facilities, met with academic advisor. Family came along. Asked about housing.', nextAction: 'Follow-up call with family', nextActionDue: '2026-02-15', owner: 'Coach Davis' },
  { id: 'rl-02', boardEntryId: 'be-01', playerId: 'pp-02', playerName: 'Alex Morgan', actionType: 'Call', date: '2026-01-08', outcome: 'Expressed strong interest', notes: 'Discussed program vision and his role. Wants to visit.', nextAction: 'Schedule campus visit', nextActionDue: '2026-01-12', owner: 'Coach Davis' },
  { id: 'rl-03', boardEntryId: 'be-01', playerId: 'pp-02', playerName: 'Alex Morgan', actionType: 'Watched Film', date: '2025-12-20', outcome: '3 game films reviewed', notes: 'Elite mid-range scorer. Good in PnR. Defense needs work but coachable.', nextAction: 'Initial outreach call', nextActionDue: '2026-01-05', owner: 'Coach Davis' },
  { id: 'rl-04', boardEntryId: 'be-02', playerId: 'pp-06', playerName: 'Rashad Williams', actionType: 'Watched Film', date: '2026-01-10', outcome: 'Watched 3 games in person', notes: 'Dominant rebounder. Motor never stops. Raw offensively but great touch around the rim.', nextAction: 'Make offer', nextActionDue: '2026-01-20', owner: 'Coach Williams' },
  { id: 'rl-05', boardEntryId: 'be-02', playerId: 'pp-06', playerName: 'Rashad Williams', actionType: 'Call', date: '2026-01-21', outcome: 'Extended scholarship offer', notes: 'He was excited. Wants to discuss with family. Also hearing from two D1 programs.', nextAction: 'Schedule official visit', nextActionDue: '2026-02-20', owner: 'Coach Williams' },
  { id: 'rl-06', boardEntryId: 'be-03', playerId: 'pp-14', playerName: 'Terrell Washington', actionType: 'Call', date: '2026-02-02', outcome: 'Good first conversation', notes: 'Interested in our up-tempo style. Wants to know more about the program.', nextAction: 'Send recruitment packet', nextActionDue: '2026-02-12', owner: 'Coach Davis' },
  { id: 'rl-07', boardEntryId: 'be-03', playerId: 'pp-14', playerName: 'Terrell Washington', actionType: 'Watched Film', date: '2026-01-28', outcome: 'Reviewed 2 games', notes: 'True PG. High IQ. Pushes pace. Solid defender. Exactly what we need.', nextAction: 'Initial contact call', nextActionDue: '2026-02-01', owner: 'Coach Davis' },
  { id: 'rl-08', boardEntryId: 'be-04', playerId: 'pp-08', playerName: 'Jordan Davis', actionType: 'DM', date: '2026-01-25', outcome: 'Responded positively on Instagram', notes: 'Sent intro message. He replied asking about the program and location.', nextAction: 'Watch upcoming game', nextActionDue: '2026-02-14', owner: 'Coach Williams' },
  { id: 'rl-09', boardEntryId: 'be-07', playerId: 'pp-21', playerName: 'Devon Price', actionType: 'Watched Film', date: '2026-02-07', outcome: 'Reviewed 4 games after decommitment news', notes: 'Explosive scorer. Can create his own shot. Fits our system perfectly.', nextAction: 'Call tonight', nextActionDue: '2026-02-09', owner: 'Coach Davis' },
  { id: 'rl-10', boardEntryId: 'be-10', playerId: 'pp-10', playerName: 'Darius Jackson', actionType: 'Official', date: '2026-01-24', outcome: 'Official visit — committed on the spot', notes: 'Amazing visit. Connected with the team. Signed LOI after the weekend.', nextAction: 'Summer orientation prep', nextActionDue: '2026-06-01', owner: 'Coach Davis' },
  { id: 'rl-11', boardEntryId: 'be-10', playerId: 'pp-10', playerName: 'Darius Jackson', actionType: 'Call', date: '2026-01-15', outcome: 'Discussed visit plans', notes: 'Very interested after watching our games. Wants to visit ASAP.', nextAction: 'Schedule official visit', nextActionDue: '2026-01-20', owner: 'Coach Davis' },
  { id: 'rl-12', boardEntryId: 'be-08', playerId: 'pp-18', playerName: 'Cam Butler', actionType: 'Text', date: '2026-01-26', outcome: 'Good back and forth', notes: 'Asked about playing time and system fit. Sent him game film of our offense.', nextAction: 'Virtual campus tour', nextActionDue: '2026-02-16', owner: 'Coach Davis' },
];
