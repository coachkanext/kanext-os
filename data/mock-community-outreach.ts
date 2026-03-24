/**
 * Mock data for Community Outreach screen.
 * Pipeline (4-stage CRM), Campaigns, and Volunteer Serve — community mode.
 * Today = 2026-03-23.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProspectStage    = 'First Visit' | 'Returned' | 'Connected' | 'Member';
export type ProspectSource   = 'walked-in' | 'invited' | 'online' | 'event' | 'outreach';
export type CampaignType     = 'event' | 'digital' | 'door_to_door' | 'invite' | 'mailer' | 'social';
export type CampaignStatus   = 'planning' | 'active' | 'completed';
export type InteractionType  = 'visit' | 'text' | 'call' | 'note';
export type OpportunityType  = 'one-time' | 'recurring' | 'project';

export interface Prospect {
  id: string;
  name: string;
  initials: string;
  hue: number;
  source: ProspectSource;
  stage: ProspectStage;
  firstVisit: string;        // YYYY-MM-DD
  lastInteraction: string;   // YYYY-MM-DD
  visitCount: number;
  assignedTo: string;
  assignedToInitials: string;
  nextActionDue: string;     // YYYY-MM-DD
  nextAction: string;
  phone: string;
  email: string;
  heardAboutUs: string;
  prayerRequest?: string;
  interactionLog: { date: string; type: InteractionType; summary: string }[];
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  description: string;
  targetAudience: string;
  budget: number;
  goalReach: number;
  goalConvert: number;
  actualReach: number;
  actualConvert: number;
  assignedTeam: string;
  volunteersNeeded: number;
  volunteersJoined: number;
}

export interface VolunteerTeam {
  id: string;
  name: string;
  leadName: string;
  leadInitials: string;
  memberCount: number;
  memberNames: string[];
  nextAssignment: string;
  nextAssignmentDate: string;
  hoursTotal: number;
}

export interface OutreachOpportunity {
  id: string;
  campaignId: string;
  title: string;
  teamId: string;
  teamName: string;
  type: OpportunityType;
  date: string;
  timeCommitment: string;
  slotsTotal: number;
  slotsFilled: number;
  description: string;
  leadName: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  hue: number;
  invitesSent: number;
  visited: number;
  isMe?: boolean;
}

export interface MyOutreachStats {
  invitesSent: number;
  visited: number;
  joined: number;
  hoursServed: number;
  teamsJoined: number;
  eventsAttended: number;
  personalLink: string;
}

// ── Pipeline Stages ───────────────────────────────────────────────────────────

export const PIPELINE_STAGES: { stage: ProspectStage; color: string }[] = [
  { stage: 'First Visit', color: '#1D9BF0' },
  { stage: 'Returned',    color: '#D97757' },
  { stage: 'Connected',   color: '#5A8A6E' },
  { stage: 'Member',      color: '#3D7A5A' },
];

// ── Prospects (8 total) ───────────────────────────────────────────────────────

export const PROSPECTS: Prospect[] = [
  // First Visit (3)
  {
    id: 'pr1', name: 'Sarah Chen', initials: 'SC', hue: 195,
    source: 'invited', stage: 'First Visit',
    firstVisit: '2026-03-22', lastInteraction: '2026-03-22', visitCount: 1,
    assignedTo: 'Deacon Williams', assignedToInitials: 'JW',
    nextActionDue: '2026-03-25', nextAction: 'Send welcome text',
    phone: '(310) 555-4001', email: 'sarah.chen@gmail.com',
    heardAboutUs: 'Friend\u2019s invitation',
    interactionLog: [
      { date: '2026-03-22', type: 'visit', summary: 'First Sunday visit. Attended morning service.' },
      { date: '2026-03-22', type: 'note', summary: 'Interested in worship ministry. Has two kids.' },
    ],
  },
  {
    id: 'pr2', name: 'Marcus Rivera', initials: 'MR', hue: 35,
    source: 'walked-in', stage: 'First Visit',
    firstVisit: '2026-03-15', lastInteraction: '2026-03-15', visitCount: 1,
    assignedTo: 'Sister Patricia', assignedToInitials: 'PJ',
    nextActionDue: '2026-03-23', nextAction: 'Call to follow up', // overdue
    phone: '(213) 555-4002', email: 'm.rivera@gmail.com',
    heardAboutUs: 'Walked by the building',
    prayerRequest: 'Going through a job transition',
    interactionLog: [
      { date: '2026-03-15', type: 'visit', summary: 'First visit. Walked in after seeing the sign.' },
    ],
  },
  {
    id: 'pr3', name: 'The Thompson Family', initials: 'TF', hue: 270,
    source: 'event', stage: 'First Visit',
    firstVisit: '2026-03-08', lastInteraction: '2026-03-20', visitCount: 1,
    assignedTo: 'Sister Shirley', assignedToInitials: 'SW',
    nextActionDue: '2026-03-20', nextAction: 'Invite to Easter Block Party', // overdue
    phone: '(323) 555-4003', email: 'thompson.family@gmail.com',
    heardAboutUs: 'Community event',
    interactionLog: [
      { date: '2026-03-08', type: 'visit', summary: 'Family of 4 visited. Came to community dinner.' },
      { date: '2026-03-20', type: 'text', summary: 'Sent welcome text. No reply yet.' },
    ],
  },
  // Returned (2)
  {
    id: 'pr4', name: 'David Foster', initials: 'DF', hue: 160,
    source: 'online', stage: 'Returned',
    firstVisit: '2026-02-22', lastInteraction: '2026-03-22', visitCount: 4,
    assignedTo: 'Deacon Williams', assignedToInitials: 'JW',
    nextActionDue: '2026-03-30', nextAction: 'Invite to Men\u2019s Fellowship',
    phone: '(310) 555-4004', email: 'd.foster@gmail.com',
    heardAboutUs: 'Found ICCLA on Google',
    interactionLog: [
      { date: '2026-02-22', type: 'visit', summary: 'First visit.' },
      { date: '2026-03-01', type: 'visit', summary: 'Returned. Stayed for fellowship lunch.' },
      { date: '2026-03-08', type: 'visit', summary: 'Third visit. Engaged during service.' },
      { date: '2026-03-10', type: 'call', summary: 'Called to check in. Had great conversation about faith journey.' },
      { date: '2026-03-22', type: 'visit', summary: 'Fourth visit. Met several members.' },
    ],
  },
  {
    id: 'pr5', name: 'Keisha Williams', initials: 'KW', hue: 320,
    source: 'invited', stage: 'Returned',
    firstVisit: '2026-02-15', lastInteraction: '2026-03-22', visitCount: 3,
    assignedTo: 'Sister Angela', assignedToInitials: 'AB',
    nextActionDue: '2026-04-05', nextAction: 'Invite to Women\u2019s Circle',
    phone: '(213) 555-4005', email: 'k.williams@gmail.com',
    heardAboutUs: 'Invited by Monica White',
    interactionLog: [
      { date: '2026-02-15', type: 'visit', summary: 'First visit. Came with Monica.' },
      { date: '2026-03-01', type: 'visit', summary: 'Returned solo.' },
      { date: '2026-03-22', type: 'visit', summary: 'Third visit. Expressed interest in small groups.' },
    ],
  },
  // Connected (2)
  {
    id: 'pr6', name: 'Andre James', initials: 'AJ', hue: 80,
    source: 'outreach', stage: 'Connected',
    firstVisit: '2026-01-18', lastInteraction: '2026-03-22', visitCount: 9,
    assignedTo: 'Pastor Davis', assignedToInitials: 'MD',
    nextActionDue: '2026-04-15', nextAction: 'Membership class invitation',
    phone: '(424) 555-4006', email: 'a.james@gmail.com',
    heardAboutUs: 'Community outreach event',
    interactionLog: [
      { date: '2026-01-18', type: 'visit', summary: 'Met at outreach block party.' },
      { date: '2026-02-01', type: 'visit', summary: 'First Sunday visit. Very engaged.' },
      { date: '2026-02-15', type: 'note', summary: 'Joined Bible Study 101. Connecting with the community.' },
      { date: '2026-03-22', type: 'visit', summary: 'Attending every Sunday. Ready for membership class.' },
    ],
  },
  {
    id: 'pr7', name: 'Patricia Lee', initials: 'PL', hue: 240,
    source: 'invited', stage: 'Connected',
    firstVisit: '2026-01-11', lastInteraction: '2026-03-15', visitCount: 10,
    assignedTo: 'Sister Angela', assignedToInitials: 'AB',
    nextActionDue: '2026-04-10', nextAction: 'Schedule membership interview',
    phone: '(818) 555-4007', email: 'p.lee@gmail.com',
    heardAboutUs: 'Invited by a coworker',
    interactionLog: [
      { date: '2026-01-11', type: 'visit', summary: 'First visit. Very receptive to the message.' },
      { date: '2026-02-08', type: 'note', summary: 'Joined Women\u2019s Circle. Building strong relationships.' },
      { date: '2026-03-15', type: 'call', summary: 'Discussed membership process. Excited to join.' },
    ],
  },
  // Member (ready to convert) (1)
  {
    id: 'pr8', name: 'James Morrison', initials: 'JM', hue: 50,
    source: 'walked-in', stage: 'Member',
    firstVisit: '2025-12-07', lastInteraction: '2026-03-22', visitCount: 15,
    assignedTo: 'Pastor Davis', assignedToInitials: 'MD',
    nextActionDue: '2026-03-30', nextAction: 'Membership ceremony',
    phone: '(310) 555-4008', email: 'j.morrison@gmail.com',
    heardAboutUs: 'Passed by the church',
    interactionLog: [
      { date: '2025-12-07', type: 'visit', summary: 'First visit over the holidays.' },
      { date: '2026-01-19', type: 'note', summary: 'Completed membership class.' },
      { date: '2026-02-28', type: 'call', summary: 'Membership interview. Ready to join officially.' },
      { date: '2026-03-22', type: 'visit', summary: 'Attending faithfully. Membership ceremony scheduled.' },
    ],
  },
];

// ── Campaigns ─────────────────────────────────────────────────────────────────

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Easter Community Block Party',
    type: 'event',
    status: 'active',
    startDate: '2026-04-01',
    endDate: '2026-04-20',
    description: 'A free community block party on Easter Sunday open to all neighbors. Food, games, live music, and a short community message.',
    targetAudience: 'All Westside community members and neighbors',
    budget: 2500,
    goalReach: 500,
    goalConvert: 15,
    actualReach: 148,
    actualConvert: 4,
    assignedTeam: 'Community Outreach Team',
    volunteersNeeded: 20,
    volunteersJoined: 12,
  },
  {
    id: 'c2',
    name: 'New Mover Welcome',
    type: 'digital',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    description: 'Targeted digital outreach to new residents in the neighborhood via social ads and welcome mailers. Personal invite links from members.',
    targetAudience: 'New residents within 2 miles of ICCLA',
    budget: 800,
    goalReach: 200,
    goalConvert: 10,
    actualReach: 91,
    actualConvert: 6,
    assignedTeam: 'Welcome Team',
    volunteersNeeded: 8,
    volunteersJoined: 6,
  },
  {
    id: 'c3',
    name: 'Fall Festival 2025',
    type: 'event',
    status: 'completed',
    startDate: '2025-10-12',
    endDate: '2025-10-12',
    description: 'Annual fall community festival with food trucks, games, live music, and a warm community atmosphere.',
    targetAudience: 'Community-wide',
    budget: 1800,
    goalReach: 300,
    goalConvert: 20,
    actualReach: 312,
    actualConvert: 23,
    assignedTeam: 'Community Outreach Team',
    volunteersNeeded: 18,
    volunteersJoined: 18,
  },
  {
    id: 'c4',
    name: 'Spring Door-to-Door',
    type: 'door_to_door',
    status: 'planning',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    description: 'Neighborhood canvassing campaign. Teams assigned to blocks, visiting homes to introduce ICCLA and invite neighbors.',
    targetAudience: 'Unreach neighborhoods within 3 miles',
    budget: 400,
    goalReach: 150,
    goalConvert: 8,
    actualReach: 0,
    actualConvert: 0,
    assignedTeam: 'Community Outreach Team',
    volunteersNeeded: 12,
    volunteersJoined: 3,
  },
];

// ── Volunteer Teams ───────────────────────────────────────────────────────────

export const VOLUNTEER_TEAMS: VolunteerTeam[] = [
  {
    id: 'vt1',
    name: 'Welcome Team',
    leadName: 'Shirley Washington',
    leadInitials: 'SW',
    memberCount: 6,
    memberNames: ['Shirley Washington', 'Joyce Robinson', 'Brenda Thompson', 'Diane Hall', 'Tanya Martinez', 'Kevin Anderson'],
    nextAssignment: 'Easter Block Party Setup',
    nextAssignmentDate: '2026-04-19',
    hoursTotal: 145,
  },
  {
    id: 'vt2',
    name: 'Community Outreach Team',
    leadName: 'James Williams',
    leadInitials: 'JW',
    memberCount: 4,
    memberNames: ['James Williams', 'Robert Davis', 'Lawrence Jackson', 'Gregory Walker'],
    nextAssignment: 'Easter Block Party Day',
    nextAssignmentDate: '2026-04-20',
    hoursTotal: 98,
  },
];

// ── Opportunities ─────────────────────────────────────────────────────────────

export const OUTREACH_OPPORTUNITIES: OutreachOpportunity[] = [
  {
    id: 'op1', campaignId: 'c1',
    title: 'Block Party Setup Crew',
    teamId: 'vt1', teamName: 'Welcome Team',
    type: 'one-time', date: '2026-04-19', timeCommitment: '3 hours (8\u201311am)',
    slotsTotal: 8, slotsFilled: 3,
    description: 'Help set up tables, tents, decor, and sound equipment the day before the Easter Block Party.',
    leadName: 'Shirley Washington',
  },
  {
    id: 'op2', campaignId: 'c1',
    title: 'Block Party Volunteer',
    teamId: 'vt2', teamName: 'Community Outreach Team',
    type: 'one-time', date: '2026-04-20', timeCommitment: '5 hours (11am\u20134pm)',
    slotsTotal: 15, slotsFilled: 7,
    description: 'Serve food, run games, greet guests, and share about ICCLA at our Easter community event.',
    leadName: 'James Williams',
  },
  {
    id: 'op3', campaignId: 'c2',
    title: 'Welcome Caller',
    teamId: 'vt1', teamName: 'Welcome Team',
    type: 'recurring', date: '2026-04-01', timeCommitment: '1 hr/week',
    slotsTotal: 5, slotsFilled: 2,
    description: 'Call or text new residents who have connected online to personally invite them to ICCLA.',
    leadName: 'Shirley Washington',
  },
  {
    id: 'op4', campaignId: 'c4',
    title: 'Door-to-Door Canvasser',
    teamId: 'vt2', teamName: 'Community Outreach Team',
    type: 'project', date: '2026-05-01', timeCommitment: '2 hrs/week (May)',
    slotsTotal: 12, slotsFilled: 3,
    description: 'Visit homes in assigned neighborhood blocks to introduce ICCLA and hand out invitation cards.',
    leadName: 'James Williams',
  },
];

// ── My Stats + Leaderboard ────────────────────────────────────────────────────

export const MY_OUTREACH_STATS: MyOutreachStats = {
  invitesSent: 12,
  visited: 4,
  joined: 2,
  hoursServed: 8,
  teamsJoined: 1,
  eventsAttended: 3,
  personalLink: 'iccla.kanext.app/@sammykalejaiye',
};

export const INVITE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Marcus Davis',     initials: 'MD', hue: 220, invitesSent: 18, visited: 9  },
  { rank: 2, name: 'Patricia Johnson', initials: 'PJ', hue: 300, invitesSent: 14, visited: 6  },
  { rank: 3, name: 'Sammy Kalejaiye',  initials: 'SK', hue: 45,  invitesSent: 12, visited: 4, isMe: true },
  { rank: 4, name: 'Michael Thomas',   initials: 'MT', hue: 140, invitesSent: 9,  visited: 3  },
  { rank: 5, name: 'Angela Brown',     initials: 'AB', hue: 260, invitesSent: 7,  visited: 2  },
];

export const MY_VOLUNTEER_TEAM_IDS = ['vt1'];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getProspectsByStage(stage: ProspectStage): Prospect[] {
  return PROSPECTS.filter(p => p.stage === stage);
}

export function getStageCounts(): Record<ProspectStage, number> {
  const counts: Record<ProspectStage, number> = { 'First Visit': 0, Returned: 0, Connected: 0, Member: 0 };
  PROSPECTS.forEach(p => counts[p.stage]++);
  return counts;
}

export function getCampaignsByStatus(status: CampaignStatus | 'all'): Campaign[] {
  if (status === 'all') return CAMPAIGNS;
  return CAMPAIGNS.filter(c => c.status === status);
}

export function getCampaignTypeLabel(type: CampaignType): string {
  const map: Record<CampaignType, string> = {
    event: 'Event', digital: 'Digital', door_to_door: 'Door-to-Door',
    invite: 'Invite', mailer: 'Mailer', social: 'Social',
  };
  return map[type];
}
