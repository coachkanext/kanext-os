/**
 * Recruiting Board — program + season scoped recruiting state.
 * 10 Pipeline stages: Watchlist → Evaluating → Contacted → Priority →
 *   Visit Planned → Visited → Offer Out → Committed → Signed → Missed
 */

export type BoardStatus =
  | 'Watchlist'
  | 'Evaluating'
  | 'Contacted'
  | 'Priority'
  | 'Visit Planned'
  | 'Visited'
  | 'Offer Out'
  | 'Committed'
  | 'Signed'
  | 'Missed';

export const BOARD_COLUMNS: BoardStatus[] = [
  'Watchlist', 'Evaluating', 'Contacted', 'Priority',
  'Visit Planned', 'Visited', 'Offer Out', 'Committed', 'Signed', 'Missed',
];

export const BOARD_COLUMN_COLORS: Record<BoardStatus, string> = {
  Watchlist: '#FF9800',
  Evaluating: '#42A5F5',
  Contacted: '#29B6F6',
  Priority: '#4CAF50',
  'Visit Planned': '#AB47BC',
  Visited: '#7E57C2',
  'Offer Out': '#EC407A',
  Committed: '#9C27B0',
  Signed: '#00BCD4',
  Missed: '#757575',
};

/** Migration map: old status values → new pipeline stages */
export const STATUS_MIGRATION: Record<string, BoardStatus> = {
  'Active Targets': 'Evaluating',
  Targets: 'Evaluating',
  Commit: 'Committed',
  Closed: 'Missed',
};

export type Priority = 'A' | 'B' | 'C';

// ─── Needs Board tiers ───
export type NeedsTier = 'Must Get' | 'Primary' | 'Secondary' | 'Watch';
export const NEEDS_TIERS: NeedsTier[] = ['Must Get', 'Primary', 'Secondary', 'Watch'];
export const NEEDS_TIER_COLORS: Record<NeedsTier, string> = {
  'Must Get': '#EF4444',
  Primary: '#FF9800',
  Secondary: '#3B82F6',
  Watch: '#8A8F98',
};

// ─── Position slots (Helio) ───
export type PositionSlot = 'PG' | 'CG' | 'W' | 'F' | 'B';
export const POSITION_SLOTS: PositionSlot[] = ['PG', 'CG', 'W', 'F', 'B'];

// ─── Interest level ───
export type InterestLevel = 'Low' | 'Med' | 'High';
export const INTEREST_LEVELS: InterestLevel[] = ['Low', 'Med', 'High'];
export const INTEREST_COLORS: Record<InterestLevel, string> = {
  Low: '#8A8F98',
  Med: '#FF9800',
  High: '#4CAF50',
};

// ─── Big Board sections ───
export const BIG_BOARD_SECTIONS = [
  { label: 'Top 10', min: 1, max: 10 },
  { label: '11–25', min: 11, max: 25 },
  { label: '26–50', min: 26, max: 50 },
  { label: '51–100', min: 51, max: 100 },
] as const;

export const BOARD_TAGS = [
  'Portal', 'Needs Visit', 'Shooter', 'Rim Protector', 'Playmaker',
  'Immediate Impact', 'Project', 'High Motor', 'Versatile', 'Athletic',
] as const;
export type BoardTag = typeof BOARD_TAGS[number];

// ─── Temperature (workflow sentiment) ───
export type Temperature = 'Ice' | 'Warm' | 'Hot' | 'Close';
export const TEMPERATURE_COLORS: Record<Temperature, string> = {
  Ice: '#64B5F6',
  Warm: '#FF9800',
  Hot: '#EF4444',
  Close: '#4CAF50',
};

// ─── Risk ───
export type RiskLevel = 'Low' | 'Medium' | 'High';
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  Low: '#4CAF50',
  Medium: '#FF9800',
  High: '#EF4444',
};

export const RISK_FLAG_OPTIONS = [
  'Eligibility / Academics',
  'Character / Discipline',
  'Health / Medical',
  'Transfer / Portal Volatility',
  'NIL Expectations Mismatch',
  'Family Dynamics Risk',
  'Coach/AAU Interference',
] as const;
export type RiskFlag = typeof RISK_FLAG_OPTIONS[number];

// ─── Due Diligence Checklist ───
export interface DueDiligenceItem {
  label: string;
  completed: boolean;
  completedBy?: string;
  completedDate?: string; // ISO
}

export const DUE_DILIGENCE_LABELS = [
  'Transcript reviewed',
  'Credits evaluated',
  'Background references (HS coach / trainer)',
  'Film verified',
  'Medical clearance notes',
  'Compliance check complete',
] as const;

// ─── Offer Details ───
export type OfferType = 'Verbal' | 'Written' | 'Pending Approval';
export interface OfferDetails {
  scholarshipPct: number; // 0-100
  offerType: OfferType;
  offerDate?: string;
  expirationDate?: string;
  conditions: string;
}

// ─── NIL Details ───
export type NILStatus = 'Approved' | 'Pending' | 'Not Available';
export interface NILDetails {
  amount: string;
  structure: string;
  status: NILStatus;
  complianceNotes: string;
}

// ─── Visit Details ───
export type VisitType = 'Unofficial' | 'Official';
export interface VisitDetails {
  visitType: VisitType;
  proposedDate?: string;
  confirmedDate?: string;
  host: string;
  transportation: string;
  lodging: string;
}

// ─── Relationship Tracking ───
export interface RelationshipContact {
  role: string; // e.g., 'Father', 'Mother', 'AAU Coach'
  name: string;
  commPref?: string; // 'text' | 'call' | 'email'
  bestTime?: string;
  staffOwner?: string;
}

export interface RelationshipTracking {
  primaryDecisionMaker: RelationshipContact;
  influencers: RelationshipContact[];
  trustNotes: string[];
}

// ─── Recruiting Log ───
export type LogEntryType =
  | 'Call' | 'Text' | 'Visit' | 'Note' | 'Offer'
  | 'NIL' | 'Decision Date' | 'Campus Visit' | 'Status';

export const LOG_TYPE_META: Record<LogEntryType, { icon: string; color: string }> = {
  Call: { icon: '\u{1F4DE}', color: '#3B82F6' },
  Text: { icon: '\u{1F4AC}', color: '#22C55E' },
  Visit: { icon: '\u{1F3EB}', color: '#A855F7' },
  Note: { icon: '\u270F\uFE0F', color: '#F59E0B' },
  Offer: { icon: '\u{1F4E8}', color: '#4CAF50' },
  NIL: { icon: '$', color: '#FF9800' },
  'Decision Date': { icon: '\u{1F4C5}', color: '#EF4444' },
  'Campus Visit': { icon: '\u{1F3D4}\uFE0F', color: '#14B8A6' },
  Status: { icon: '\u2191', color: '#EC407A' },
};

export interface RecruitingLogEntry {
  id: string;
  type: LogEntryType;
  timestamp: Date;
  author: string;
  summary: string;
  who?: string;
  nextStep?: string;
  followUpDate?: string;
  outcome?: string;
  isPinned?: boolean;
}

// ─── Board Entry (CRM record) ───
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
  recruiter: string;
  updated: string; // ISO date
  // CRM fields
  temperature: Temperature;
  riskLevel: RiskLevel;
  riskFlags: RiskFlag[];
  dueDiligence: DueDiligenceItem[];
  offer?: OfferDetails;
  nil?: NILDetails;
  visit?: VisitDetails;
  relationships?: RelationshipTracking;
  log: RecruitingLogEntry[];
  // Workspace fields (added for 4-view refactor)
  tier?: NeedsTier;
  slot?: PositionSlot;
  bigBoardRank?: number;
  interest?: InterestLevel;
}

// ─── Helper to create mock log entries ───
function daysAgo(d: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(10 + (d % 8), (d * 17) % 60);
  return date;
}

function makeDueDiligence(completedIndices: number[], coach: string): DueDiligenceItem[] {
  return DUE_DILIGENCE_LABELS.map((label, i) => ({
    label,
    completed: completedIndices.includes(i),
    ...(completedIndices.includes(i) ? { completedBy: coach, completedDate: `2026-0${1 + (i % 2)}-${10 + i}` } : {}),
  }));
}

export const RECRUITING_BOARD: BoardEntry[] = [
  // Watchlist
  {
    id: 'be-05', playerId: 'pp-01', status: 'Watchlist', priority: 'B', rank: 0, position: 'PG', classYear: '2026',
    tier: 'Watch', slot: 'PG', interest: 'Med',
    tags: ['Playmaker'], shortNotes: 'Class of 2026 PG, long-term target',
    longNotes: 'Saw at Nike EYBL. Very smooth. Playing up vs older competition.',
    nextStep: 'Attend spring AAU tournament', dueDate: '2026-04-01', recruiter: 'Coach Davis', updated: '2026-02-06',
    temperature: 'Warm', riskLevel: 'Low', riskFlags: [],
    dueDiligence: makeDueDiligence([], 'Coach Davis'),
    log: [
      { id: 'log-05-1', type: 'Note', timestamp: daysAgo(8), author: 'Coach Davis', summary: 'Saw at Nike EYBL. Very smooth. Playing up vs older competition.' },
      { id: 'log-05-2', type: 'Visit', timestamp: daysAgo(14), author: 'Coach Davis', summary: 'Attended AAU showcase. Watched 2 games.', outcome: 'Impressed with ball-handling and vision.' },
    ],
  },
  {
    id: 'be-09', playerId: 'pp-13', status: 'Watchlist', priority: 'C', rank: 1, position: 'SF', classYear: '2025',
    tier: 'Watch', slot: 'W', interest: 'Low',
    tags: ['Versatile'], shortNotes: 'European wing, high skill level',
    longNotes: 'Watching tape. Visa/eligibility questions to research.',
    nextStep: 'Contact agent', dueDate: '2026-03-01', recruiter: 'Coach Williams', updated: '2026-01-20',
    temperature: 'Ice', riskLevel: 'Medium', riskFlags: ['Eligibility / Academics'],
    dueDiligence: makeDueDiligence([], 'Coach Williams'),
    log: [
      { id: 'log-09-1', type: 'Note', timestamp: daysAgo(25), author: 'Coach Williams', summary: 'Watching European tape. Visa/eligibility questions to research.' },
    ],
  },

  // Evaluating
  {
    id: 'be-06', playerId: 'pp-07', status: 'Evaluating', priority: 'B', rank: 0, position: 'C', classYear: '2026',
    tier: 'Secondary', slot: 'B', bigBoardRank: 42, interest: 'Med',
    tags: ['Rim Protector', 'Project'], shortNotes: 'Rim protector with upside',
    longNotes: 'Still developing offensively. Elite shot blocker. Could be a project recruit.',
    nextStep: 'Request game film from coach', dueDate: '2026-02-18', recruiter: 'Coach Williams', updated: '2026-02-03',
    temperature: 'Warm', riskLevel: 'Low', riskFlags: [],
    dueDiligence: makeDueDiligence([0, 3], 'Coach Williams'),
    log: [
      { id: 'log-06-1', type: 'Note', timestamp: daysAgo(11), author: 'Coach Williams', summary: 'Film shows elite shot-blocking instincts. Needs offensive development.' },
      { id: 'log-06-2', type: 'Call', timestamp: daysAgo(7), author: 'Coach Williams', summary: 'Spoke with HS coach. Very coachable kid, high character.', who: 'HS Coach', nextStep: 'Request game film' },
    ],
  },
  {
    id: 'be-07', playerId: 'pp-21', status: 'Evaluating', priority: 'A', rank: 1, position: 'SG', classYear: '2025',
    tier: 'Primary', slot: 'CG', bigBoardRank: 8, interest: 'High',
    tags: ['Shooter', 'Athletic'], shortNotes: 'Dynamic scorer, explosive athlete',
    longNotes: 'Just became available after decommitment. Need to act fast.',
    nextStep: 'Pull film + background check', dueDate: '2026-02-09', recruiter: 'Coach Davis', updated: '2026-02-08',
    temperature: 'Hot', riskLevel: 'Medium', riskFlags: ['Transfer / Portal Volatility'],
    dueDiligence: makeDueDiligence([3], 'Coach Davis'),
    log: [
      { id: 'log-07-1', type: 'Status', timestamp: daysAgo(6), author: 'System', summary: 'Decommitted from previous school. Added to board as priority eval.' },
      { id: 'log-07-2', type: 'Note', timestamp: daysAgo(5), author: 'Coach Davis', summary: 'Need to act fast. Multiple programs already reaching out.' },
    ],
  },

  // Contacted
  {
    id: 'be-04', playerId: 'pp-08', status: 'Contacted', priority: 'B', rank: 0, position: 'SG', classYear: '2025',
    tier: 'Secondary', slot: 'CG', bigBoardRank: 28, interest: 'Med',
    tags: ['Shooter'], shortNotes: 'Knockdown shooter, needs to see defense',
    longNotes: 'DM\'d on Instagram. Responded positively. Watching more film this week.',
    nextStep: 'Watch Feb 14 game vs Olney Central', dueDate: '2026-02-14', recruiter: 'Coach Williams', updated: '2026-02-01',
    temperature: 'Warm', riskLevel: 'Low', riskFlags: [],
    dueDiligence: makeDueDiligence([0, 3], 'Coach Williams'),
    relationships: {
      primaryDecisionMaker: { role: 'Father', name: 'James Thompson', commPref: 'call', bestTime: 'Evenings after 7pm', staffOwner: 'Coach Williams' },
      influencers: [
        { role: 'AAU Coach', name: 'Marcus Reed', commPref: 'text', staffOwner: 'Coach Davis' },
      ],
      trustNotes: ['Father is former college player, values program culture', 'Wants to stay within driving distance of home'],
    },
    log: [
      { id: 'log-04-1', type: 'Text', timestamp: daysAgo(13), author: 'Coach Williams', summary: 'DM\'d on Instagram. Responded positively.', who: 'Player' },
      { id: 'log-04-2', type: 'Note', timestamp: daysAgo(10), author: 'Coach Williams', summary: 'Watching more film. Needs to see defense before moving forward.' },
      { id: 'log-04-3', type: 'Call', timestamp: daysAgo(4), author: 'Coach Williams', summary: 'Spoke with father. Interested in visiting campus.', who: 'Father', nextStep: 'Watch Feb 14 game' },
    ],
  },
  {
    id: 'be-08', playerId: 'pp-18', status: 'Contacted', priority: 'B', rank: 1, position: 'SF', classYear: '2025',
    tier: 'Secondary', slot: 'W', bigBoardRank: 35, interest: 'Med',
    tags: ['Versatile'], shortNotes: 'Versatile wing, can guard 1-3',
    longNotes: 'Good conversation. Interested in our program style. Wants to know about playing time.',
    nextStep: 'Virtual campus tour', dueDate: '2026-02-16', recruiter: 'Coach Davis', updated: '2026-01-27',
    temperature: 'Warm', riskLevel: 'Low', riskFlags: [],
    dueDiligence: makeDueDiligence([0], 'Coach Davis'),
    relationships: {
      primaryDecisionMaker: { role: 'Mother', name: 'Sandra Lewis', commPref: 'email', bestTime: 'Weekday mornings' },
      influencers: [],
      trustNotes: ['Mother focused on academics and distance from home'],
    },
    log: [
      { id: 'log-08-1', type: 'Call', timestamp: daysAgo(18), author: 'Coach Davis', summary: 'Initial call. Interested in our program style.', who: 'Player', nextStep: 'Schedule virtual tour' },
      { id: 'log-08-2', type: 'Text', timestamp: daysAgo(12), author: 'Coach Davis', summary: 'Sent program info and academic packet.', who: 'Player' },
    ],
  },

  // Priority
  {
    id: 'be-03', playerId: 'pp-14', status: 'Priority', priority: 'A', rank: 0, position: 'PG', classYear: '2025',
    tier: 'Primary', slot: 'PG', bigBoardRank: 5, interest: 'High',
    tags: ['Playmaker', 'High Motor'], shortNotes: 'Two-way PG, high IQ',
    longNotes: 'Initial call went well. Sending film package. Wants to visit in March.',
    nextStep: 'Send recruitment packet', dueDate: '2026-02-12', recruiter: 'Coach Davis', updated: '2026-02-04',
    temperature: 'Hot', riskLevel: 'Low', riskFlags: [],
    dueDiligence: makeDueDiligence([0, 1, 2, 3], 'Coach Davis'),
    offer: { scholarshipPct: 50, offerType: 'Pending Approval', conditions: 'Pending academic review' },
    relationships: {
      primaryDecisionMaker: { role: 'Father', name: 'Robert Jackson', commPref: 'call', bestTime: 'Weekday evenings', staffOwner: 'Coach Davis' },
      influencers: [
        { role: 'HS Coach', name: 'David Brown', commPref: 'text', staffOwner: 'Coach Davis' },
        { role: 'Trainer', name: 'Mike Sanders', commPref: 'call', staffOwner: 'Coach Williams' },
      ],
      trustNotes: ['Father very involved, wants to see playing time path', 'HS coach is strong advocate for our program', 'Considering 3 other programs'],
    },
    log: [
      { id: 'log-03-1', type: 'Call', timestamp: daysAgo(10), author: 'Coach Davis', summary: 'Initial call went well. Sending film package.', who: 'Player', nextStep: 'Send recruitment packet' },
      { id: 'log-03-2', type: 'Call', timestamp: daysAgo(6), author: 'Coach Davis', summary: 'Follow-up with father. Wants visit in March.', who: 'Father', nextStep: 'Schedule visit' },
      { id: 'log-03-3', type: 'Note', timestamp: daysAgo(3), author: 'Coach Davis', summary: 'HS coach says he\'s a leader. Teammates love him.' },
      { id: 'log-03-4', type: 'Decision Date', timestamp: daysAgo(2), author: 'Coach Davis', summary: 'Family expects decision by late March.', isPinned: true },
    ],
  },

  // Visited
  {
    id: 'be-01', playerId: 'pp-02', status: 'Visited', priority: 'A', rank: 0, position: 'SG', classYear: '2025',
    tier: 'Must Get', slot: 'CG', bigBoardRank: 2, interest: 'High',
    tags: ['Immediate Impact', 'Shooter'], shortNotes: 'Elite scorer, ready to contribute day 1',
    longNotes: 'Visited campus Jan 15. Very interested. Family supportive. Needs answer on scholarship by Feb 28.',
    nextStep: 'Follow-up call with family', dueDate: '2026-02-15', recruiter: 'Coach Davis', updated: '2026-02-08',
    temperature: 'Hot', riskLevel: 'Low', riskFlags: [],
    dueDiligence: makeDueDiligence([0, 1, 2, 3, 5], 'Coach Davis'),
    offer: { scholarshipPct: 75, offerType: 'Verbal', offerDate: '2026-01-20', expirationDate: '2026-02-28', conditions: '' },
    nil: { amount: '$5K', structure: 'Annual', status: 'Approved', complianceNotes: '' },
    visit: { visitType: 'Unofficial', confirmedDate: '2026-01-15', host: 'Coach Davis', transportation: 'Self', lodging: 'Day visit' },
    relationships: {
      primaryDecisionMaker: { role: 'Father', name: 'Michael Carter', commPref: 'call', bestTime: 'Evenings', staffOwner: 'Coach Davis' },
      influencers: [
        { role: 'Mother', name: 'Lisa Carter', commPref: 'text', staffOwner: 'Coach Davis' },
        { role: 'AAU Coach', name: 'Tony Williams', commPref: 'call', staffOwner: 'Coach Williams' },
      ],
      trustNotes: ['Family very supportive of program', 'Father played D2', 'Needs scholarship answer by Feb 28'],
    },
    log: [
      { id: 'log-01-1', type: 'Campus Visit', timestamp: daysAgo(30), author: 'Coach Davis', summary: 'Unofficial visit. Toured campus, met team, watched practice.', outcome: 'Very positive. Family loved the culture.' },
      { id: 'log-01-2', type: 'Offer', timestamp: daysAgo(25), author: 'Coach Davis', summary: 'Extended 75% scholarship offer. Verbal.', isPinned: true },
      { id: 'log-01-3', type: 'NIL', timestamp: daysAgo(24), author: 'Coach Davis', summary: 'NIL package: $5K annual. Approved by compliance.', isPinned: true },
      { id: 'log-01-4', type: 'Call', timestamp: daysAgo(6), author: 'Coach Davis', summary: 'Follow-up with family. Still very interested. Decision coming soon.', who: 'Father' },
      { id: 'log-01-5', type: 'Decision Date', timestamp: daysAgo(4), author: 'Coach Davis', summary: 'Expects decision by Feb 28. Down to us and one other.', isPinned: true },
    ],
  },

  // Offer Out
  {
    id: 'be-02', playerId: 'pp-06', status: 'Offer Out', priority: 'A', rank: 0, position: 'PF', classYear: '2025',
    tier: 'Must Get', slot: 'F', bigBoardRank: 3, interest: 'High',
    tags: ['Athletic', 'High Motor'], shortNotes: 'Physical 4-man, great motor',
    longNotes: 'Watched 3 games in person. Dominant on the glass. Also hearing from two D1 programs.',
    nextStep: 'Official visit scheduling', dueDate: '2026-02-20', recruiter: 'Coach Williams', updated: '2026-02-05',
    temperature: 'Hot', riskLevel: 'Medium', riskFlags: ['NIL Expectations Mismatch'],
    dueDiligence: makeDueDiligence([0, 1, 2, 3, 4], 'Coach Williams'),
    offer: { scholarshipPct: 100, offerType: 'Written', offerDate: '2026-01-28', expirationDate: '2026-03-15', conditions: 'Full academic clearance' },
    nil: { amount: '$8K', structure: 'Annual + performance bonuses', status: 'Approved', complianceNotes: 'Structured through school collective' },
    visit: { visitType: 'Official', proposedDate: '2026-02-22', host: 'Coach Williams', transportation: 'Program-provided', lodging: 'Overnight with team' },
    relationships: {
      primaryDecisionMaker: { role: 'Mother', name: 'Patricia Johnson', commPref: 'call', bestTime: 'Afternoons', staffOwner: 'Coach Williams' },
      influencers: [
        { role: 'Father', name: 'Ray Johnson', commPref: 'text', staffOwner: 'Coach Williams' },
        { role: 'HS Coach', name: 'Greg Martin', commPref: 'call', staffOwner: 'Coach Davis' },
      ],
      trustNotes: ['Mother is primary. Wants strong academics + safe environment', 'Also hearing from 2 D1 programs on NIL', 'HS coach is our strongest advocate here'],
    },
    log: [
      { id: 'log-02-1', type: 'Visit', timestamp: daysAgo(20), author: 'Coach Williams', summary: 'Watched 3rd game in person. Dominant on glass.', outcome: 'Ready to extend full offer.' },
      { id: 'log-02-2', type: 'Offer', timestamp: daysAgo(17), author: 'Coach Williams', summary: 'Extended 100% scholarship. Written offer sent.', isPinned: true },
      { id: 'log-02-3', type: 'NIL', timestamp: daysAgo(16), author: 'Coach Williams', summary: 'NIL: $8K annual + performance. Through collective.', isPinned: true },
      { id: 'log-02-4', type: 'Call', timestamp: daysAgo(9), author: 'Coach Williams', summary: 'Spoke with mother. D1 programs offering more NIL. Need to sell culture.', who: 'Mother' },
      { id: 'log-02-5', type: 'Campus Visit', timestamp: daysAgo(3), author: 'Coach Williams', summary: 'Official visit scheduled for Feb 22.', isPinned: true },
    ],
  },

  // Committed
  {
    id: 'be-10', playerId: 'pp-10', status: 'Committed', priority: 'A', rank: 0, position: 'PG', classYear: '2025',
    tier: 'Must Get', slot: 'PG', bigBoardRank: 1, interest: 'High',
    tags: ['Portal', 'Immediate Impact'], shortNotes: 'Committed! Arriving summer 2025',
    longNotes: 'Signed LOI on Jan 30. Will enroll for summer session. Housing arranged.',
    nextStep: 'Summer orientation prep', dueDate: '2026-06-01', recruiter: 'Coach Davis', updated: '2026-01-30',
    temperature: 'Close', riskLevel: 'Low', riskFlags: [],
    dueDiligence: makeDueDiligence([0, 1, 2, 3, 4, 5], 'Coach Davis'),
    offer: { scholarshipPct: 85, offerType: 'Written', offerDate: '2026-01-15', conditions: '' },
    nil: { amount: '$6K', structure: 'Annual', status: 'Approved', complianceNotes: '' },
    relationships: {
      primaryDecisionMaker: { role: 'Player', name: 'Self (transfer)', commPref: 'text', staffOwner: 'Coach Davis' },
      influencers: [],
      trustNotes: ['Transfer portal — self-directed decision', 'Looking for fresh start and playing time'],
    },
    log: [
      { id: 'log-10-1', type: 'Call', timestamp: daysAgo(35), author: 'Coach Davis', summary: 'Initial outreach in portal. Interested in our system.', who: 'Player' },
      { id: 'log-10-2', type: 'Campus Visit', timestamp: daysAgo(25), author: 'Coach Davis', summary: 'Official visit. Met team, saw facilities, watched film session.', outcome: 'Loved the culture. Ready to commit.' },
      { id: 'log-10-3', type: 'Offer', timestamp: daysAgo(20), author: 'Coach Davis', summary: '85% scholarship offer extended and accepted.' },
      { id: 'log-10-4', type: 'Status', timestamp: daysAgo(15), author: 'System', summary: 'LOI signed on Jan 30. Committed!', isPinned: true },
      { id: 'log-10-5', type: 'Note', timestamp: daysAgo(5), author: 'Coach Davis', summary: 'Housing arranged. Summer orientation packet sent.' },
    ],
  },
];
