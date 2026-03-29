/**
 * Mock data for Community Outreach screen.
 * Pipeline (4-stage CRM), Campaigns, and Volunteer Serve — community mode.
 * Today = 2026-03-23.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProspectStage    = 'Explorer' | 'First Visit' | 'Follow-Up Sent' | 'Returned' | 'Connected' | 'Joined Group' | 'Member' | 'Inactive';
export type ProspectSource   = 'walked-in' | 'invited' | 'online' | 'event' | 'outreach' | 'social' | 'radio';
export type CampaignType     = 'event' | 'digital' | 'door_to_door' | 'invite' | 'mailer' | 'social';
export type CampaignStatus   = 'planning' | 'active' | 'completed';
export type InteractionType  = 'visit' | 'text' | 'call' | 'email' | 'note';
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
  { stage: 'Explorer',      color: '#9CA3AF' },
  { stage: 'First Visit',   color: '#1D9BF0' },
  { stage: 'Follow-Up Sent', color: '#F59E0B' },
  { stage: 'Returned',      color: '#D97757' },
  { stage: 'Connected',     color: '#5A8A6E' },
  { stage: 'Joined Group',  color: '#3B82F6' },
  { stage: 'Member',        color: '#3D7A5A' },
  { stage: 'Inactive',      color: '#EF4444' },
];

// ── Prospects (8 total) ───────────────────────────────────────────────────────

export const PROSPECTS: Prospect[] = [ // 25 prospects total
  // First Visit (3)
  {
    id: 'pr1', name: 'Sarah Chen', initials: 'SC', hue: 195,
    source: 'invited', stage: 'First Visit',
    firstVisit: '2026-03-22', lastInteraction: '2026-03-22', visitCount: 1,
    assignedTo: 'Pastor Nony', assignedToInitials: 'NK',
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
    assignedTo: 'Pastor Nony', assignedToInitials: 'NK',
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
    assignedTo: 'Pastor Dipo', assignedToInitials: 'DK',
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
    assignedTo: 'Pastor Dipo', assignedToInitials: 'DK',
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
  // Explorer (found us online / social — 4)
  {
    id: 'pr9', name: 'Destiny Okafor', initials: 'DO', hue: 290,
    source: 'social', stage: 'Explorer',
    firstVisit: '', lastInteraction: '2026-03-20', visitCount: 0,
    assignedTo: '', assignedToInitials: '',
    nextActionDue: '', nextAction: 'No action — tracking online engagement',
    phone: '', email: 'destiny.okafor@gmail.com',
    heardAboutUs: 'Instagram (@icclachurch)',
    interactionLog: [
      { date: '2026-03-20', type: 'note', summary: 'Filled out digital connect card via Instagram. Interested in young adults ministry.' },
    ],
  },
  {
    id: 'pr10', name: 'Tyler Brooks', initials: 'TB', hue: 15,
    source: 'online', stage: 'Explorer',
    firstVisit: '', lastInteraction: '2026-03-18', visitCount: 0,
    assignedTo: '', assignedToInitials: '',
    nextActionDue: '', nextAction: 'Send welcome email with upcoming events',
    phone: '(323) 555-4010', email: 'tyler.b@gmail.com',
    heardAboutUs: 'Google search — churches near Hawthorne',
    interactionLog: [
      { date: '2026-03-18', type: 'note', summary: 'Submitted website connect card. Looking for a church home after moving to LA.' },
    ],
  },
  {
    id: 'pr11', name: 'Nicole Adeyemi', initials: 'NA', hue: 110,
    source: 'radio', stage: 'Explorer',
    firstVisit: '', lastInteraction: '2026-03-15', visitCount: 0,
    assignedTo: 'Harvesters Team', assignedToInitials: 'HT',
    nextActionDue: '2026-03-29', nextAction: 'Follow up on radio listener interest',
    phone: '(310) 555-4011', email: 'n.adeyemi@gmail.com',
    heardAboutUs: 'Hotline to Heaven radio',
    interactionLog: [
      { date: '2026-03-15', type: 'note', summary: 'Called in to Hotline to Heaven prayer line. Expressed interest in visiting ICCLA.' },
    ],
  },
  {
    id: 'pr12', name: 'Brandon Nguyen', initials: 'BN', hue: 195,
    source: 'online', stage: 'Explorer',
    firstVisit: '', lastInteraction: '2026-03-10', visitCount: 0,
    assignedTo: '', assignedToInitials: '',
    nextActionDue: '2026-04-06', nextAction: 'Invite to Easter service',
    phone: '(424) 555-4012', email: 'b.nguyen@outlook.com',
    heardAboutUs: 'YouTube — found a sermon from Dr. Dipo',
    interactionLog: [
      { date: '2026-03-10', type: 'note', summary: 'Submitted contact form after watching sermon on YouTube. Says the message on grace spoke to him.' },
    ],
  },
  // First Visit (additional 5 — total 8 this month)
  {
    id: 'pr13', name: 'Aisha Mensah', initials: 'AM', hue: 55,
    source: 'invited', stage: 'First Visit',
    firstVisit: '2026-03-22', lastInteraction: '2026-03-22', visitCount: 1,
    assignedTo: 'Sister Patricia', assignedToInitials: 'PJ',
    nextActionDue: '2026-03-26', nextAction: 'Send "glad you came" text',
    phone: '(310) 555-4013', email: 'a.mensah@gmail.com',
    heardAboutUs: 'Invited by coworker (ICCLA member)',
    interactionLog: [
      { date: '2026-03-22', type: 'visit', summary: 'First visit. Came with coworker. Stayed for the full service and fellowship.' },
    ],
  },
  {
    id: 'pr14', name: 'Carlos Espinoza', initials: 'CE', hue: 340,
    source: 'event', stage: 'First Visit',
    firstVisit: '2026-03-08', lastInteraction: '2026-03-22', visitCount: 1,
    assignedTo: 'Harvesters Team', assignedToInitials: 'HT',
    nextActionDue: '2026-03-24', nextAction: 'Personal call from Harvesters volunteer', // overdue
    phone: '(213) 555-4014', email: 'c.espinoza@gmail.com',
    heardAboutUs: 'Met Harvesters team at the mall during outreach Saturday',
    interactionLog: [
      { date: '2026-03-08', type: 'note', summary: 'Met on outreach Saturday. Accepted a service invite.' },
      { date: '2026-03-22', type: 'visit', summary: 'Came to Sunday service. Very attentive.' },
    ],
  },
  {
    id: 'pr15', name: 'Simone Baptiste', initials: 'SB', hue: 225,
    source: 'walked-in', stage: 'First Visit',
    firstVisit: '2026-03-15', lastInteraction: '2026-03-15', visitCount: 1,
    assignedTo: 'Pastor Nony', assignedToInitials: 'NK',
    nextActionDue: '2026-03-28', nextAction: 'Email from Pastor Nony with welcome resources',
    phone: '(323) 555-4015', email: 'simone.b@gmail.com',
    heardAboutUs: 'Saw the banner outside while driving',
    prayerRequest: 'Healing for family member',
    interactionLog: [
      { date: '2026-03-15', type: 'visit', summary: 'Walked in on her own. Submitted prayer request card.' },
      { date: '2026-03-15', type: 'note', summary: 'Greeter connected her with Pastor Nony after service.' },
    ],
  },
  {
    id: 'pr16', name: 'Emmanuel & Joy Eze', initials: 'EJ', hue: 150,
    source: 'invited', stage: 'First Visit',
    firstVisit: '2026-03-22', lastInteraction: '2026-03-22', visitCount: 1,
    assignedTo: 'David Eze', assignedToInitials: 'DE',
    nextActionDue: '2026-03-27', nextAction: 'Invite to T.O.R.C.H. Friday',
    phone: '(213) 555-4016', email: 'e.eze@gmail.com',
    heardAboutUs: 'Family connection (David Eze\'s cousins)',
    interactionLog: [
      { date: '2026-03-22', type: 'visit', summary: 'First visit. Couple, early 20s. Came with David Eze. Loved the young adults energy.' },
    ],
  },
  {
    id: 'pr17', name: 'Diane Sutton', initials: 'DS', hue: 260,
    source: 'online', stage: 'First Visit',
    firstVisit: '2026-03-22', lastInteraction: '2026-03-22', visitCount: 1,
    assignedTo: 'Sister Angela', assignedToInitials: 'AB',
    nextActionDue: '2026-03-26', nextAction: 'Welcome text with service times',
    phone: '(310) 555-4017', email: 'diane.s@gmail.com',
    heardAboutUs: 'Found on Google Maps while searching for Sunday service',
    interactionLog: [
      { date: '2026-03-22', type: 'visit', summary: 'First visit. Senior woman. Moved to Hawthorne recently, looking for a church.' },
    ],
  },
  // Follow-Up Sent (3)
  {
    id: 'pr18', name: 'Rico Patterson', initials: 'RP', hue: 25,
    source: 'walked-in', stage: 'Follow-Up Sent',
    firstVisit: '2026-03-08', lastInteraction: '2026-03-11', visitCount: 1,
    assignedTo: 'Harvesters Team', assignedToInitials: 'HT',
    nextActionDue: '2026-03-29', nextAction: 'Call if no response to text',
    phone: '(424) 555-4018', email: 'rico.p@gmail.com',
    heardAboutUs: 'Walked past the church',
    interactionLog: [
      { date: '2026-03-08', type: 'visit', summary: 'First visit. Quiet. Filled out connect card.' },
      { date: '2026-03-11', type: 'text', summary: 'Welcome text sent. No reply yet.' },
    ],
  },
  {
    id: 'pr19', name: 'Jasmine Oduya', initials: 'JO', hue: 170,
    source: 'event', stage: 'Follow-Up Sent',
    firstVisit: '2026-02-22', lastInteraction: '2026-03-05', visitCount: 1,
    assignedTo: 'Sister Patricia', assignedToInitials: 'PJ',
    nextActionDue: '2026-04-06', nextAction: 'Easter Sunday personal invite',
    phone: '(818) 555-4019', email: 'j.oduya@gmail.com',
    heardAboutUs: 'Rhythms From The Roots event',
    interactionLog: [
      { date: '2026-02-22', type: 'visit', summary: 'Met at Rhythms From The Roots. Came to next Sunday service.' },
      { date: '2026-03-05', type: 'email', summary: 'Sent follow-up email. Mentioned she has been busy but wants to come back.' },
    ],
  },
  {
    id: 'pr20', name: 'Darnell King', initials: 'DK', hue: 80,
    source: 'social', stage: 'Follow-Up Sent',
    firstVisit: '2026-03-01', lastInteraction: '2026-03-08', visitCount: 1,
    assignedTo: 'Pastor Dipo', assignedToInitials: 'DK',
    nextActionDue: '2026-03-25', nextAction: 'Personal call from Pastor Dipo', // overdue
    phone: '(323) 555-4020', email: 'd.king@gmail.com',
    heardAboutUs: 'Instagram — clicked on T.O.R.C.H. event post',
    interactionLog: [
      { date: '2026-03-01', type: 'visit', summary: 'First visit after seeing T.O.R.C.H. post. Young man, early 20s.' },
      { date: '2026-03-08', type: 'text', summary: 'Welcome text. Replied "Thanks! I\'ll try to come back." No further contact.' },
    ],
  },
  // Joined Group (2 — one just joined Rooted)
  {
    id: 'pr21', name: 'Brianna Cole', initials: 'BC', hue: 200,
    source: 'invited', stage: 'Joined Group',
    firstVisit: '2026-01-11', lastInteraction: '2026-03-22', visitCount: 11,
    assignedTo: 'Pastor Nony', assignedToInitials: 'NK',
    nextActionDue: '2026-04-12', nextAction: 'Check in after first Rooted session',
    phone: '(310) 555-4021', email: 'b.cole@gmail.com',
    heardAboutUs: 'Invited by college roommate',
    interactionLog: [
      { date: '2026-01-11', type: 'visit', summary: 'First visit.' },
      { date: '2026-02-01', type: 'note', summary: 'Started attending regularly. Connected with Women\'s Circle.' },
      { date: '2026-03-22', type: 'note', summary: 'Just registered for Rooted cohort starting April 5.' },
    ],
  },
  {
    id: 'pr22', name: 'Isaiah Thomas', initials: 'IT', hue: 310,
    source: 'outreach', stage: 'Joined Group',
    firstVisit: '2025-12-14', lastInteraction: '2026-03-15', visitCount: 13,
    assignedTo: 'David Eze', assignedToInitials: 'DE',
    nextActionDue: '2026-03-29', nextAction: 'Involve in T.O.R.C.H. leadership track',
    phone: '(213) 555-4022', email: 'i.thomas@gmail.com',
    heardAboutUs: 'Met David Eze at community basketball event',
    interactionLog: [
      { date: '2025-12-14', type: 'visit', summary: 'First visit. Met at community event.' },
      { date: '2026-01-10', type: 'note', summary: 'Joined T.O.R.C.H. Nation Friday meetings.' },
      { date: '2026-03-15', type: 'note', summary: 'Very engaged. Starting to help lead prayer segments.' },
    ],
  },
  // Inactive (needs re-engagement — 3)
  {
    id: 'pr23', name: 'Vanessa Hart', initials: 'VH', hue: 345,
    source: 'invited', stage: 'Inactive',
    firstVisit: '2026-01-04', lastInteraction: '2026-02-01', visitCount: 4,
    assignedTo: 'Sister Angela', assignedToInitials: 'AB',
    nextActionDue: '2026-03-30', nextAction: 'Re-engagement text — "We miss you"',
    phone: '(310) 555-4023', email: 'v.hart@gmail.com',
    heardAboutUs: 'Invited by member',
    interactionLog: [
      { date: '2026-01-04', type: 'visit', summary: 'Started attending. Very engaged.' },
      { date: '2026-02-01', type: 'visit', summary: 'Last attendance. No contact since.' },
      { date: '2026-03-10', type: 'text', summary: '"We miss you" text sent. No reply.' },
    ],
  },
  {
    id: 'pr24', name: 'Michael Grant', initials: 'MG', hue: 130,
    source: 'walked-in', stage: 'Inactive',
    firstVisit: '2025-11-16', lastInteraction: '2026-01-11', visitCount: 6,
    assignedTo: 'Pastor Nony', assignedToInitials: 'NK',
    nextActionDue: '2026-04-05', nextAction: 'Personal Easter invitation call',
    phone: '(424) 555-4024', email: 'm.grant@gmail.com',
    heardAboutUs: 'Walked by during a community event',
    interactionLog: [
      { date: '2025-11-16', type: 'visit', summary: 'First visit.' },
      { date: '2026-01-11', type: 'visit', summary: 'Sixth visit. Dropped off after this.' },
      { date: '2026-02-14', type: 'email', summary: 'Valentine\'s service invite sent. No response.' },
    ],
  },
  {
    id: 'pr25', name: 'Tanya Diaz', initials: 'TD', hue: 65,
    source: 'social', stage: 'Inactive',
    firstVisit: '2025-10-12', lastInteraction: '2025-12-07', visitCount: 5,
    assignedTo: 'Harvesters Team', assignedToInitials: 'HT',
    nextActionDue: '2026-04-20', nextAction: 'Easter Sunday "Comeback" special invite',
    phone: '(323) 555-4025', email: 'tanya.d@gmail.com',
    heardAboutUs: 'Facebook ad',
    interactionLog: [
      { date: '2025-10-12', type: 'visit', summary: 'Came after clicking Facebook ad for fall revival.' },
      { date: '2025-12-07', type: 'visit', summary: 'Christmas service. Last visit.' },
      { date: '2026-03-01', type: 'text', summary: '"We miss you" text. No reply.' },
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
    targetAudience: 'All Hawthorne / South Bay community members and neighbors',
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
    targetAudience: 'New residents within 2 miles of 12832 Chadron Ave, Hawthorne',
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
    targetAudience: 'Unreached neighborhoods within 3 miles',
    budget: 400,
    goalReach: 150,
    goalConvert: 8,
    actualReach: 0,
    actualConvert: 0,
    assignedTeam: 'Community Outreach Team',
    volunteersNeeded: 12,
    volunteersJoined: 3,
  },
  {
    id: 'c5',
    name: 'Gospel Social Challenge',
    type: 'social',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    description: 'A 31-day social media initiative where members share their faith stories and invite friends using #ICCLAChallenge.',
    targetAudience: 'Young adults 18–35 in the Westside area',
    budget: 200,
    goalReach: 1000,
    goalConvert: 20,
    actualReach: 647,
    actualConvert: 9,
    assignedTeam: 'Welcome Team',
    volunteersNeeded: 5,
    volunteersJoined: 5,
  },
  {
    id: 'c6',
    name: 'Back-to-School Supply Drive',
    type: 'event',
    status: 'completed',
    startDate: '2025-08-03',
    endDate: '2025-08-17',
    description: 'Community event distributing free school supplies to local families. Partnered with three neighborhood schools.',
    targetAudience: 'Families with school-age children within 5 miles',
    budget: 1200,
    goalReach: 150,
    goalConvert: 12,
    actualReach: 211,
    actualConvert: 14,
    assignedTeam: 'Community Outreach Team',
    volunteersNeeded: 15,
    volunteersJoined: 15,
  },
  {
    id: 'c7',
    name: 'Neighborhood Prayer Walk',
    type: 'door_to_door',
    status: 'active',
    startDate: '2026-03-07',
    endDate: '2026-04-27',
    description: 'Teams walk designated neighborhood blocks to pray for homes and families, leaving door-hanger invitations to Easter Sunday.',
    targetAudience: 'All residents within 1.5 miles of ICCLA',
    budget: 150,
    goalReach: 400,
    goalConvert: 10,
    actualReach: 187,
    actualConvert: 3,
    assignedTeam: 'Community Outreach Team',
    volunteersNeeded: 16,
    volunteersJoined: 9,
  },
  {
    id: 'c8',
    name: 'Holiday Toy Drive 2025',
    type: 'mailer',
    status: 'completed',
    startDate: '2025-11-30',
    endDate: '2025-12-21',
    description: 'Partnered with 3 local businesses to collect toys for families in need. Mailer sent to a 2-mile neighborhood radius.',
    targetAudience: 'Families in need within the Westside community',
    budget: 600,
    goalReach: 250,
    goalConvert: 18,
    actualReach: 289,
    actualConvert: 21,
    assignedTeam: 'Welcome Team',
    volunteersNeeded: 10,
    volunteersJoined: 10,
  },
  {
    id: 'c9',
    name: 'Spring Block Party',
    type: 'event',
    status: 'completed',
    startDate: '2026-03-14',
    endDate: '2026-03-14',
    description: 'Annual Spring Block Party on the church parking lot — live music, free food, games, and community connection. Rhytms From The Roots cultural performance featured.',
    targetAudience: 'All South Bay community members',
    budget: 1800,
    goalReach: 100,
    goalConvert: 12,
    actualReach: 120,
    actualConvert: 15,
    assignedTeam: 'Community Outreach Team',
    volunteersNeeded: 18,
    volunteersJoined: 18,
  },
  {
    id: 'c10',
    name: 'Bring a Friend Sunday',
    type: 'invite',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-04-05',
    description: "Every member gets a personal invite link to share with friends and family. On Palm Sunday, anyone who brings a first-time guest gets recognized. Tracking invites, clicks, and attendance.",
    targetAudience: 'Friends and family of ICCLA members',
    budget: 100,
    goalReach: 80,
    goalConvert: 20,
    actualReach: 45,
    actualConvert: 8,
    assignedTeam: 'Welcome Team',
    volunteersNeeded: 5,
    volunteersJoined: 5,
  },
  {
    id: 'c11',
    name: 'Harvesters Saturday Outreach',
    type: 'door_to_door',
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'Monthly neighborhood canvassing by the Harvesters ministry. Every last Saturday of the month, teams of 4 visit homes in the Hawthorne area to pray, share the gospel, and invite neighbors.',
    targetAudience: 'Unreached households within 2 miles',
    budget: 200,
    goalReach: 200,
    goalConvert: 12,
    actualReach: 87,
    actualConvert: 6,
    assignedTeam: 'Harvesters Ministry',
    volunteersNeeded: 12,
    volunteersJoined: 8,
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
  { rank: 1, name: 'Dr. Dipo Kalejaiye', initials: 'DK', hue: 220, invitesSent: 18, visited: 9  },
  { rank: 2, name: 'David Eze',          initials: 'DE', hue: 40,  invitesSent: 14, visited: 6  },
  { rank: 3, name: 'Sammy Kalejaiye',    initials: 'SK', hue: 45,  invitesSent: 12, visited: 4, isMe: true },
  { rank: 4, name: 'Kunle Pinmiloye',    initials: 'KP', hue: 150, invitesSent: 9,  visited: 3  },
  { rank: 5, name: 'Nony Kalejaiye',     initials: 'NK', hue: 280, invitesSent: 7,  visited: 2  },
];

export const MY_VOLUNTEER_TEAM_IDS = ['vt1'];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getProspectsByStage(stage: ProspectStage): Prospect[] {
  return PROSPECTS.filter(p => p.stage === stage);
}

export function getStageCounts(): Record<ProspectStage, number> {
  const counts: Record<ProspectStage, number> = {
    Explorer: 0, 'First Visit': 0, 'Follow-Up Sent': 0,
    Returned: 0, Connected: 0, 'Joined Group': 0, Member: 0, Inactive: 0,
  };
  PROSPECTS.forEach(p => { if (counts[p.stage] !== undefined) counts[p.stage]++; });
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
