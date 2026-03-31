/**
 * Mock data for Outreach screen — 3 pages: Visitors, Community, Missions.
 * Church mode visitor management + community outreach + missions system.
 * Senior pastor/outreach director view — other views are RBAC-gated subsets.
 */

// ─── Shared Types ──────────────────────────────────────────────────────────

export type VisitorSource = 'walked-in' | 'invited-by-member' | 'online' | 'event' | 'community-outreach';
export type VisitorStage = 'First Visit' | 'Contacted' | 'Returned' | 'Connected' | 'Member';
export type InitiativeType = 'service-project' | 'event' | 'canvassing' | 'partner-program';
export type InitiativeStatus = 'upcoming' | 'active' | 'completed';
export type MissionType = 'short-term-trip' | 'long-term' | 'partner-support' | 'local-mission';
export type MissionStatus = 'active' | 'upcoming' | 'completed' | 'ongoing';

// ─── Visitors (Page 0) ──────────────────────────────────────────────────────

export interface VisitorSummary {
  newThisWeek: number;
  totalInPipeline: number;
  becameMembers: number;
  conversionRate: number;
}

export interface VisitorCard {
  id: string;
  name: string;
  initials: string;
  source: VisitorSource;
  firstVisitDate: string;
  assignedTo: string;
  lastContact: string;
  notesPreview: string;
  familyIndicator: 'single' | 'couple' | 'family';
  stage: VisitorStage;
}

export const VISITOR_STAGES: { stage: VisitorStage; color: string }[] = [
  { stage: 'First Visit', color: '#6B7280' },
  { stage: 'Contacted',   color: '#1A1714' },
  { stage: 'Returned',    color: '#1A1714' },
  { stage: 'Connected',   color: '#B8943E' },
  { stage: 'Member',      color: '#5A8A6E' },
];

export const VISITOR_SUMMARY: VisitorSummary = {
  newThisWeek: 12,
  totalInPipeline: 47,
  becameMembers: 8,
  conversionRate: 34,
};

const VISITORS: VisitorCard[] = [
  // First Visit (5)
  { id: 'v1',  name: 'James & Sarah Mitchell', initials: 'JM', source: 'walked-in',           firstVisitDate: 'Mar 9',  assignedTo: 'Deacon Brown',    lastContact: '1d ago',  notesPreview: 'Young couple, new to area, looking for community',         familyIndicator: 'couple', stage: 'First Visit' },
  { id: 'v2',  name: 'Maria Santos',           initials: 'MS', source: 'invited-by-member',    firstVisitDate: 'Mar 9',  assignedTo: 'Sister Williams', lastContact: '1d ago',  notesPreview: 'Invited by Teresa, interested in women\'s ministry',       familyIndicator: 'single', stage: 'First Visit' },
  { id: 'v3',  name: 'David Okonkwo',          initials: 'DO', source: 'online',               firstVisitDate: 'Mar 8',  assignedTo: 'Unassigned',      lastContact: '2d ago',  notesPreview: 'Found us through website, watched services online first',  familyIndicator: 'single', stage: 'First Visit' },
  { id: 'v4',  name: 'The Chen Family',        initials: 'CF', source: 'event',                firstVisitDate: 'Mar 7',  assignedTo: 'Pastor Davis',    lastContact: '3d ago',  notesPreview: 'Came to community dinner, family of 4 with young kids',    familyIndicator: 'family', stage: 'First Visit' },
  { id: 'v5',  name: 'Rachel Kim',             initials: 'RK', source: 'community-outreach',   firstVisitDate: 'Mar 9',  assignedTo: 'Unassigned',      lastContact: '1d ago',  notesPreview: 'Met at food bank event, showed interest in service',       familyIndicator: 'single', stage: 'First Visit' },

  // Contacted (4)
  { id: 'v6',  name: 'Michael Johnson',        initials: 'MJ', source: 'walked-in',           firstVisitDate: 'Mar 2',  assignedTo: 'Deacon Brown',    lastContact: '2h ago',  notesPreview: 'Called yesterday, interested in men\'s group',              familyIndicator: 'single', stage: 'Contacted' },
  { id: 'v7',  name: 'Angela & Tom Rivera',    initials: 'AR', source: 'invited-by-member',    firstVisitDate: 'Mar 1',  assignedTo: 'Sister Williams', lastContact: '1d ago',  notesPreview: 'Followed up via email, want to visit small group',         familyIndicator: 'couple', stage: 'Contacted' },
  { id: 'v8',  name: 'The Williams Family',    initials: 'WF', source: 'event',                firstVisitDate: 'Feb 28', assignedTo: 'Pastor Davis',    lastContact: '3d ago',  notesPreview: 'Kids enjoyed Sunday school, parents want to come back',    familyIndicator: 'family', stage: 'Contacted' },
  { id: 'v9',  name: 'Emily Park',             initials: 'EP', source: 'online',               firstVisitDate: 'Feb 25', assignedTo: 'Elder Thompson',   lastContact: '4h ago',  notesPreview: 'Texted about Bible study times, very responsive',          familyIndicator: 'single', stage: 'Contacted' },

  // Returned (4)
  { id: 'v10', name: 'Robert & Lisa Carter',   initials: 'RC', source: 'walked-in',           firstVisitDate: 'Feb 16', assignedTo: 'Deacon Brown',    lastContact: '1d ago',  notesPreview: 'Third visit, brought kids this time, very positive',       familyIndicator: 'couple', stage: 'Returned' },
  { id: 'v11', name: 'Grace Adebayo',          initials: 'GA', source: 'invited-by-member',    firstVisitDate: 'Feb 20', assignedTo: 'Sister Williams', lastContact: '3d ago',  notesPreview: 'Attended worship twice, interested in choir',              familyIndicator: 'single', stage: 'Returned' },
  { id: 'v12', name: 'The Patel Family',       initials: 'PF', source: 'community-outreach',   firstVisitDate: 'Feb 14', assignedTo: 'Pastor Davis',    lastContact: '5d ago',  notesPreview: 'Family of 5, enrolled kids in youth group',                familyIndicator: 'family', stage: 'Returned' },
  { id: 'v13', name: 'Kevin Martinez',         initials: 'KM', source: 'event',                firstVisitDate: 'Feb 18', assignedTo: 'Elder Thompson',   lastContact: '2d ago',  notesPreview: 'Attended men\'s breakfast, wants to volunteer',            familyIndicator: 'single', stage: 'Returned' },

  // Connected (4)
  { id: 'v14', name: 'The Taylor Family',      initials: 'TF', source: 'walked-in',           firstVisitDate: 'Jan 19', assignedTo: 'Pastor Davis',    lastContact: '1d ago',  notesPreview: 'Joined small group, kids in Sunday school weekly',         familyIndicator: 'family', stage: 'Connected' },
  { id: 'v15', name: 'Diane Brooks',           initials: 'DB', source: 'invited-by-member',    firstVisitDate: 'Jan 25', assignedTo: 'Sister Williams', lastContact: '2d ago',  notesPreview: 'Active in women\'s ministry, considering membership',     familyIndicator: 'single', stage: 'Connected' },
  { id: 'v16', name: 'Jason & Amy Lee',        initials: 'JL', source: 'online',               firstVisitDate: 'Jan 12', assignedTo: 'Deacon Brown',    lastContact: '3d ago',  notesPreview: 'Volunteering at welcome desk, attend every Sunday',       familyIndicator: 'couple', stage: 'Connected' },
  { id: 'v17', name: 'Samuel Osei',            initials: 'SO', source: 'community-outreach',   firstVisitDate: 'Jan 28', assignedTo: 'Elder Thompson',   lastContact: '1d ago',  notesPreview: 'Leading a newcomer Bible study, very engaged',            familyIndicator: 'single', stage: 'Connected' },

  // Member (3)
  { id: 'v18', name: 'The Anderson Family',    initials: 'AF', source: 'walked-in',           firstVisitDate: 'Dec 1',  assignedTo: 'Pastor Davis',    lastContact: 'Today',   notesPreview: 'Completed membership class, baptized last Sunday',        familyIndicator: 'family', stage: 'Member' },
  { id: 'v19', name: 'Christina Moore',        initials: 'CM', source: 'invited-by-member',    firstVisitDate: 'Dec 8',  assignedTo: 'Sister Williams', lastContact: '1d ago',  notesPreview: 'Official member, joined worship team',                    familyIndicator: 'single', stage: 'Member' },
  { id: 'v20', name: 'Derek & Tanya Hughes',   initials: 'DH', source: 'event',                firstVisitDate: 'Nov 24', assignedTo: 'Deacon Brown',    lastContact: '2d ago',  notesPreview: 'Members since Jan, volunteering with youth ministry',     familyIndicator: 'couple', stage: 'Member' },
];

export function getVisitorsByStage(stage: VisitorStage): VisitorCard[] {
  return VISITORS.filter((v) => v.stage === stage);
}

export function getStageConversion(stageIndex: number): number | null {
  if (stageIndex === 0) return null;
  const prevStage = VISITOR_STAGES[stageIndex - 1].stage;
  const currStage = VISITOR_STAGES[stageIndex].stage;
  const prevCount = VISITORS.filter((v) => v.stage === prevStage).length;
  const currCount = VISITORS.filter((v) => v.stage === currStage).length;
  if (prevCount === 0) return null;
  return Math.round((currCount / prevCount) * 100);
}

// ─── Community (Page 1) ──────────────────────────────────────────────────────

export type CommunityFilter = 'all' | 'upcoming' | 'active' | 'completed';

export interface OutreachInitiative {
  id: string;
  name: string;
  type: InitiativeType;
  date: string;
  isRecurring: boolean;
  teamLead: string;
  teamLeadInitials: string;
  volunteerCount: number;
  volunteersNeeded: number;
  impactMetrics: {
    mealsServed?: number;
    familiesHelped?: number;
    peopleReached?: number;
  };
  status: InitiativeStatus;
}

const INITIATIVES: OutreachInitiative[] = [
  { id: 'ci1',  name: 'Food Bank Saturday',          type: 'service-project',  date: 'Every Saturday',   isRecurring: true,  teamLead: 'Sister Williams',  teamLeadInitials: 'SW', volunteerCount: 18, volunteersNeeded: 25, impactMetrics: { mealsServed: 450, familiesHelped: 120 },  status: 'active' },
  { id: 'ci2',  name: 'Spring Community Carnival',   type: 'event',            date: 'Apr 12',           isRecurring: false, teamLead: 'Deacon Brown',     teamLeadInitials: 'DB', volunteerCount: 35, volunteersNeeded: 50, impactMetrics: { peopleReached: 500 },                     status: 'upcoming' },
  { id: 'ci3',  name: 'Neighborhood Door Knocking',  type: 'canvassing',       date: 'Mar 22',           isRecurring: false, teamLead: 'Elder Thompson',   teamLeadInitials: 'ET', volunteerCount: 12, volunteersNeeded: 20, impactMetrics: { peopleReached: 200 },                     status: 'upcoming' },
  { id: 'ci4',  name: 'Habitat for Humanity Build',  type: 'partner-program',  date: 'Apr 5–6',          isRecurring: false, teamLead: 'Jason Lee',        teamLeadInitials: 'JL', volunteerCount: 22, volunteersNeeded: 30, impactMetrics: { familiesHelped: 1 },                      status: 'upcoming' },
  { id: 'ci5',  name: 'Back-to-School Drive',        type: 'service-project',  date: 'Aug 10',           isRecurring: false, teamLead: 'Angela Rivera',    teamLeadInitials: 'AR', volunteerCount: 0,  volunteersNeeded: 40, impactMetrics: { familiesHelped: 200 },                    status: 'upcoming' },
  { id: 'ci6',  name: 'Senior Home Visits',          type: 'service-project',  date: 'Every Wednesday',  isRecurring: true,  teamLead: 'Diane Brooks',     teamLeadInitials: 'DB', volunteerCount: 8,  volunteersNeeded: 12, impactMetrics: { peopleReached: 35 },                      status: 'active' },
  { id: 'ci7',  name: 'Prison Ministry Outreach',    type: 'partner-program',  date: '1st Sunday',       isRecurring: true,  teamLead: 'Pastor Davis',     teamLeadInitials: 'PD', volunteerCount: 6,  volunteersNeeded: 8,  impactMetrics: { peopleReached: 75 },                      status: 'active' },
  { id: 'ci8',  name: 'Thanksgiving Meal Delivery',  type: 'service-project',  date: 'Nov 27',           isRecurring: false, teamLead: 'Sister Williams',  teamLeadInitials: 'SW', volunteerCount: 0,  volunteersNeeded: 60, impactMetrics: { mealsServed: 300, familiesHelped: 150 },  status: 'upcoming' },
  { id: 'ci9',  name: 'Community Health Fair',       type: 'event',            date: 'Feb 15',           isRecurring: false, teamLead: 'Dr. Carter',       teamLeadInitials: 'DC', volunteerCount: 28, volunteersNeeded: 30, impactMetrics: { peopleReached: 380 },                     status: 'completed' },
  { id: 'ci10', name: 'Christmas Toy Drive',         type: 'service-project',  date: 'Dec 20',           isRecurring: false, teamLead: 'Angela Rivera',    teamLeadInitials: 'AR', volunteerCount: 45, volunteersNeeded: 45, impactMetrics: { familiesHelped: 175 },                    status: 'completed' },
  { id: 'ci11', name: 'Homeless Shelter Meals',      type: 'partner-program',  date: '3rd Friday',       isRecurring: true,  teamLead: 'Kevin Martinez',   teamLeadInitials: 'KM', volunteerCount: 10, volunteersNeeded: 15, impactMetrics: { mealsServed: 120 },                       status: 'active' },
  { id: 'ci12', name: 'Youth Block Party',           type: 'event',            date: 'Jun 14',           isRecurring: false, teamLead: 'Samuel Osei',      teamLeadInitials: 'SO', volunteerCount: 5,  volunteersNeeded: 25, impactMetrics: { peopleReached: 150 },                     status: 'upcoming' },
];

export function getInitiatives(filter: CommunityFilter): OutreachInitiative[] {
  if (filter === 'all') return [...INITIATIVES];
  return INITIATIVES.filter((i) => i.status === filter);
}

// ─── Missions (Page 2) ──────────────────────────────────────────────────────

export type MissionFilter = 'all' | 'active' | 'upcoming' | 'completed' | 'ongoing';

export interface MissionItem {
  id: string;
  name: string;
  type: MissionType;
  location: string;
  dateRange: string;
  teamSize: number;
  teamCapacity: number;
  fundraisingGoal: number;
  fundraisingRaised: number;
  leaderName: string;
  leaderInitials: string;
  status: MissionStatus;
}

export interface SupportedMissionary {
  id: string;
  name: string;
  initials: string;
  location: string;
  ministry: string;
  monthlySupport: number;
  lastUpdate: string;
  prayerNeeds: string;
}

const MISSIONS: MissionItem[] = [
  { id: 'm1', name: 'Haiti Medical Mission',      type: 'short-term-trip',  location: 'Port-au-Prince, Haiti',   dateRange: 'Jun 14–21',     teamSize: 12, teamCapacity: 18, fundraisingGoal: 45000,  fundraisingRaised: 32000,  leaderName: 'Dr. Carter',       leaderInitials: 'DC', status: 'upcoming' },
  { id: 'm2', name: 'Guatemala School Build',     type: 'short-term-trip',  location: 'Antigua, Guatemala',      dateRange: 'Jul 8–15',      teamSize: 8,  teamCapacity: 15, fundraisingGoal: 35000,  fundraisingRaised: 18500,  leaderName: 'Jason Lee',        leaderInitials: 'JL', status: 'upcoming' },
  { id: 'm3', name: 'Kenya Water Well Project',   type: 'partner-support',  location: 'Nairobi, Kenya',          dateRange: 'Ongoing',       teamSize: 0,  teamCapacity: 0,  fundraisingGoal: 25000,  fundraisingRaised: 22000,  leaderName: 'Pastor Davis',     leaderInitials: 'PD', status: 'ongoing' },
  { id: 'm4', name: 'Inner City Youth Camp',      type: 'local-mission',    location: 'Downtown Community Ctr',  dateRange: 'Jul 22–26',     teamSize: 15, teamCapacity: 20, fundraisingGoal: 8000,   fundraisingRaised: 6200,   leaderName: 'Samuel Osei',      leaderInitials: 'SO', status: 'upcoming' },
  { id: 'm5', name: 'Philippines Disaster Relief', type: 'short-term-trip', location: 'Manila, Philippines',     dateRange: 'Mar 1–10',      teamSize: 10, teamCapacity: 10, fundraisingGoal: 40000,  fundraisingRaised: 40000,  leaderName: 'Elder Thompson',   leaderInitials: 'ET', status: 'active' },
  { id: 'm6', name: 'Mexico Church Plant Support', type: 'long-term',       location: 'Oaxaca, Mexico',          dateRange: 'Ongoing',       teamSize: 2,  teamCapacity: 2,  fundraisingGoal: 60000,  fundraisingRaised: 48000,  leaderName: 'Rev. Hernandez',   leaderInitials: 'RH', status: 'ongoing' },
  { id: 'm7', name: 'South Africa Orphanage',     type: 'partner-support',  location: 'Cape Town, South Africa', dateRange: 'Ongoing',       teamSize: 0,  teamCapacity: 0,  fundraisingGoal: 18000,  fundraisingRaised: 15000,  leaderName: 'Sister Williams',  leaderInitials: 'SW', status: 'ongoing' },
  { id: 'm8', name: 'Dominican Republic VBS',     type: 'short-term-trip',  location: 'Santo Domingo, DR',       dateRange: 'Feb 10–17',     teamSize: 14, teamCapacity: 14, fundraisingGoal: 30000,  fundraisingRaised: 30000,  leaderName: 'Angela Rivera',    leaderInitials: 'AR', status: 'completed' },
];

const SUPPORTED_MISSIONARIES: SupportedMissionary[] = [
  { id: 'sm1', name: 'Rev. James & Maria Hernandez', initials: 'JH', location: 'Oaxaca, Mexico',          ministry: 'Church Planting',       monthlySupport: 2500, lastUpdate: 'Mar 5',  prayerNeeds: 'Building permits, local leadership development' },
  { id: 'sm2', name: 'Sarah Thompson',               initials: 'ST', location: 'Nairobi, Kenya',          ministry: 'Clean Water Initiative', monthlySupport: 1800, lastUpdate: 'Mar 1',  prayerNeeds: 'Drought conditions, supply chain delays' },
  { id: 'sm3', name: 'David & Grace Park',           initials: 'DP', location: 'Seoul, South Korea',      ministry: 'Youth Ministry',         monthlySupport: 2000, lastUpdate: 'Feb 28', prayerNeeds: 'University outreach, cultural barriers' },
  { id: 'sm4', name: 'Emmanuel Adeyemi',             initials: 'EA', location: 'Lagos, Nigeria',          ministry: 'Seminary Training',      monthlySupport: 1500, lastUpdate: 'Feb 20', prayerNeeds: 'Funding for new classroom, student housing' },
  { id: 'sm5', name: 'Lisa Chen',                    initials: 'LC', location: 'Phnom Penh, Cambodia',    ministry: 'Anti-Trafficking',       monthlySupport: 2200, lastUpdate: 'Mar 3',  prayerNeeds: 'Government relations, survivor care resources' },
];

export function getMissions(filter: MissionFilter): MissionItem[] {
  if (filter === 'all') return [...MISSIONS];
  return MISSIONS.filter((m) => m.status === filter);
}

export function getSupportedMissionaries(): SupportedMissionary[] {
  return [...SUPPORTED_MISSIONARIES];
}

export function formatMoney(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}
