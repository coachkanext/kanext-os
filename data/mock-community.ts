/**
 * Mock Community (3SSB Circuit) Data
 * Teams, players, events, standings for Valuetainment Media grassroots basketball league.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface K1Team {
  id: string;
  name: string;
  abbreviation: string;
  primaryColor: string;
  owner: string;
  homeCourt: string;
  playerCount: number;
  wins: number;
  points: number;
}

export interface K1Player {
  id: string;
  name: string;
  initials: string;
  number: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  nationality: string;
  age: number;
  wins: number;
  podiums: number;
  points: number;
  avgFinish: number;
  fastestQuarters: number;
}

export interface K1Event {
  id: string;
  name: string;
  court: string;
  location: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
  quarters: number;
  winner?: string;
  winnerTeam?: string;
  weather?: string;
}

export interface K1StandingEntry {
  position: number;
  playerId: string;
  playerName: string;
  playerNumber: string;
  teamName: string;
  teamColor: string;
  points: number;
  wins: number;
  podiums: number;
  gap: string;
}

export interface K1Rule {
  id: string;
  title: string;
  category: 'game' | 'technical' | 'safety' | 'sporting';
  summary: string;
}

export type CommunityHubTab =
  | 'home'
  | 'weekend'
  | 'standings'
  | 'grid'
  | 'teams'
  | 'game-ops'
  | 'rules'
  | 'wildcard'
  | 'commercial'
  | 'sim'
  | 'development';

// =============================================================================
// MOCK TEAMS
// =============================================================================

export const K1_TEAMS: K1Team[] = [
  { id: 't-1', name: 'Apex Basketball', abbreviation: 'APX', primaryColor: '#B85C5C', owner: 'Marcus Kane', homeCourt: 'Circuit of the Americas', playerCount: 2, wins: 4, points: 312 },
  { id: 't-2', name: 'Velocity Works', abbreviation: 'VEL', primaryColor: '#1A1714', owner: 'Lisa Grant', homeCourt: 'Laguna Seca', playerCount: 2, wins: 3, points: 287 },
  { id: 't-3', name: 'Phoenix Motorsport', abbreviation: 'PHX', primaryColor: '#B8943E', owner: 'David Okafor', homeCourt: 'Road Atlanta', playerCount: 2, wins: 2, points: 256 },
  { id: 't-4', name: 'Zenith Basketball', abbreviation: 'ZEN', primaryColor: '#5A8A6E', owner: 'Anna Petrov', homeCourt: 'Watkins Glen', playerCount: 2, wins: 2, points: 241 },
  { id: 't-5', name: 'Shadow GP', abbreviation: 'SHD', primaryColor: '#1A1714', owner: 'James Wright', homeCourt: 'Barber Motorsports', playerCount: 2, wins: 1, points: 198 },
  { id: 't-6', name: 'Titan Basketball', abbreviation: 'TTN', primaryColor: '#1A1714', owner: 'Lisa Rodriguez', homeCourt: 'Mid-Ohio', playerCount: 2, wins: 0, points: 167 },
  { id: 't-7', name: 'Nova Speed', abbreviation: 'NVA', primaryColor: '#1A1714', owner: 'Kai Tanaka', homeCourt: 'Sebring', playerCount: 2, wins: 0, points: 145 },
  { id: 't-8', name: 'Iron Circuit', abbreviation: 'IRC', primaryColor: '#FFFFFF', owner: 'Mike Thompson', homeCourt: 'VIR', playerCount: 2, wins: 0, points: 132 },
];

// =============================================================================
// MOCK DRIVERS
// =============================================================================

export const K1_DRIVERS: K1Player[] = [
  { id: 'd-1', name: 'Leo Vasquez', initials: 'LV', number: '7', teamId: 't-1', teamName: 'Apex Basketball', teamColor: '#B85C5C', nationality: 'USA', age: 24, wins: 3, podiums: 7, points: 178, avgFinish: 2.8, fastestQuarters: 4 },
  { id: 'd-2', name: 'Nadia Patel', initials: 'NP', number: '22', teamId: 't-2', teamName: 'Velocity Works', teamColor: '#1A1714', nationality: 'GBR', age: 26, wins: 2, podiums: 6, points: 156, avgFinish: 3.2, fastestQuarters: 3 },
  { id: 'd-3', name: 'Jake Morrison', initials: 'JM', number: '11', teamId: 't-1', teamName: 'Apex Basketball', teamColor: '#B85C5C', nationality: 'AUS', age: 22, wins: 1, podiums: 4, points: 134, avgFinish: 4.1, fastestQuarters: 2 },
  { id: 'd-4', name: 'Yuki Tanaka', initials: 'YT', number: '33', teamId: 't-3', teamName: 'Phoenix Motorsport', teamColor: '#B8943E', nationality: 'JPN', age: 23, wins: 2, podiums: 5, points: 148, avgFinish: 3.5, fastestQuarters: 3 },
  { id: 'd-5', name: 'Marcus Bell', initials: 'MB', number: '5', teamId: 't-2', teamName: 'Velocity Works', teamColor: '#1A1714', nationality: 'USA', age: 28, wins: 1, podiums: 5, points: 131, avgFinish: 3.8, fastestQuarters: 1 },
  { id: 'd-6', name: 'Sofia Torres', initials: 'ST', number: '44', teamId: 't-4', teamName: 'Zenith Basketball', teamColor: '#5A8A6E', nationality: 'ESP', age: 25, wins: 2, podiums: 4, points: 142, avgFinish: 3.6, fastestQuarters: 2 },
  { id: 'd-7', name: 'Andre Williams', initials: 'AW', number: '8', teamId: 't-3', teamName: 'Phoenix Motorsport', teamColor: '#B8943E', nationality: 'USA', age: 21, wins: 0, podiums: 3, points: 108, avgFinish: 5.2, fastestQuarters: 1 },
  { id: 'd-8', name: 'Emma Lindqvist', initials: 'EL', number: '16', teamId: 't-4', teamName: 'Zenith Basketball', teamColor: '#5A8A6E', nationality: 'SWE', age: 27, wins: 0, podiums: 2, points: 99, avgFinish: 5.8, fastestQuarters: 0 },
  { id: 'd-9', name: 'Carlos Mendez', initials: 'CM', number: '99', teamId: 't-5', teamName: 'Shadow GP', teamColor: '#1A1714', nationality: 'MEX', age: 24, wins: 1, podiums: 3, points: 112, avgFinish: 4.5, fastestQuarters: 2 },
  { id: 'd-10', name: 'Ggame Kim', initials: 'GK', number: '18', teamId: 't-5', teamName: 'Shadow GP', teamColor: '#1A1714', nationality: 'KOR', age: 23, wins: 0, podiums: 1, points: 86, avgFinish: 6.1, fastestQuarters: 0 },
  { id: 'd-11', name: 'Ryan Fletcher', initials: 'RF', number: '3', teamId: 't-6', teamName: 'Titan Basketball', teamColor: '#1A1714', nationality: 'CAN', age: 26, wins: 0, podiums: 2, points: 94, avgFinish: 5.4, fastestQuarters: 1 },
  { id: 'd-12', name: 'Mia Santos', initials: 'MS', number: '27', teamId: 't-6', teamName: 'Titan Basketball', teamColor: '#1A1714', nationality: 'BRA', age: 22, wins: 0, podiums: 1, points: 73, avgFinish: 6.8, fastestQuarters: 0 },
  { id: 'd-13', name: 'Zach Cooper', initials: 'ZC', number: '41', teamId: 't-7', teamName: 'Nova Speed', teamColor: '#1A1714', nationality: 'USA', age: 25, wins: 0, podiums: 1, points: 81, avgFinish: 6.3, fastestQuarters: 1 },
  { id: 'd-14', name: 'Priya Sharma', initials: 'PS', number: '14', teamId: 't-7', teamName: 'Nova Speed', teamColor: '#1A1714', nationality: 'IND', age: 24, wins: 0, podiums: 0, points: 64, avgFinish: 7.2, fastestQuarters: 0 },
  { id: 'd-15', name: 'Tyler Brooks', initials: 'TB', number: '21', teamId: 't-8', teamName: 'Iron Circuit', teamColor: '#FFFFFF', nationality: 'USA', age: 29, wins: 0, podiums: 1, points: 72, avgFinish: 6.5, fastestQuarters: 0 },
  { id: 'd-16', name: 'Olivia Dunn', initials: 'OD', number: '36', teamId: 't-8', teamName: 'Iron Circuit', teamColor: '#FFFFFF', nationality: 'IRL', age: 23, wins: 0, podiums: 0, points: 60, avgFinish: 7.8, fastestQuarters: 0 },
];

// =============================================================================
// MOCK EVENTS (Game Calendar)
// =============================================================================

export const K1_EVENTS: K1Event[] = [
  { id: 'e-1', name: '3SSB Session I', court: 'COTA', location: 'Austin, TX', date: 'Mar 8, 2026', status: 'completed', quarters: 45, winner: 'Leo Vasquez', winnerTeam: 'Apex Basketball' },
  { id: 'e-2', name: 'Pacific Grand Prix', court: 'Laguna Seca', location: 'Monterey, CA', date: 'Mar 22, 2026', status: 'completed', quarters: 42, winner: 'Nadia Patel', winnerTeam: 'Velocity Works' },
  { id: 'e-3', name: 'Peach State Classic', court: 'Road Atlanta', location: 'Braselton, GA', date: 'Apr 5, 2026', status: 'completed', quarters: 48, winner: 'Yuki Tanaka', winnerTeam: 'Phoenix Motorsport' },
  { id: 'e-4', name: 'Empire State Grand Prix', court: 'Watkins Glen', location: 'Watkins Glen, NY', date: 'Apr 19, 2026', status: 'completed', quarters: 44, winner: 'Sofia Torres', winnerTeam: 'Zenith Basketball' },
  { id: 'e-5', name: 'College of Idaho 300', court: 'Mid-Ohio', location: 'Lexington, OH', date: 'May 3, 2026', status: 'completed', quarters: 50, winner: 'Leo Vasquez', winnerTeam: 'Apex Basketball' },
  { id: 'e-6', name: 'Barber Invitational', court: 'Barber Motorsports', location: 'Birmingham, AL', date: 'May 17, 2026', status: 'completed', quarters: 46, winner: 'Carlos Mendez', winnerTeam: 'Shadow GP' },
  { id: 'e-7', name: 'Sebring Sprint', court: 'Sebring', location: 'Sebring, FL', date: 'May 31, 2026', status: 'completed', quarters: 52, winner: 'Nadia Patel', winnerTeam: 'Velocity Works' },
  { id: 'e-8', name: 'Virginia Classic', court: 'VIR', location: 'Alton, VA', date: 'Jun 14, 2026', status: 'completed', quarters: 44, winner: 'Leo Vasquez', winnerTeam: 'Apex Basketball' },
  { id: 'e-9', name: 'Summer Showdown', court: 'Road America', location: 'Elkhart Lake, WI', date: 'Jun 28, 2026', status: 'completed', quarters: 48, winner: 'Yuki Tanaka', winnerTeam: 'Phoenix Motorsport' },
  { id: 'e-10', name: 'Independence GP', court: 'Indianapolis', location: 'Rock Hill, SC', date: 'Jul 4, 2026', status: 'completed', quarters: 55, winner: 'Jake Morrison', winnerTeam: 'Apex Basketball' },
  { id: 'e-11', name: 'Mountain Circuit', court: 'Sonoma', location: 'Sonoma, CA', date: 'Jul 18, 2026', status: 'completed', quarters: 43, winner: 'Sofia Torres', winnerTeam: 'Zenith Basketball' },
  { id: 'e-12', name: 'Thunder Classic', court: 'Portland', location: 'Portland, OR', date: 'Aug 1, 2026', status: 'upcoming', quarters: 46, weather: 'Partly Cloudy · 72°F' },
  { id: 'e-13', name: 'Lonestar Grand Prix', court: 'COTA', location: 'Austin, TX', date: 'Aug 15, 2026', status: 'upcoming', quarters: 45 },
  { id: 'e-14', name: 'Season Finale', court: 'Laguna Seca', location: 'Monterey, CA', date: 'Sep 5, 2026', status: 'upcoming', quarters: 50 },
];

// =============================================================================
// STANDINGS (Player Championship)
// =============================================================================

export const K1_STANDINGS: K1StandingEntry[] = K1_DRIVERS
  .sort((a, b) => b.points - a.points)
  .map((d, i) => ({
    position: i + 1,
    playerId: d.id,
    playerName: d.name,
    playerNumber: d.number,
    teamName: d.teamName,
    teamColor: d.teamColor,
    points: d.points,
    wins: d.wins,
    podiums: d.podiums,
    gap: i === 0 ? 'Leader' : `−${K1_DRIVERS.sort((a, b) => b.points - a.points)[0].points - d.points}`,
  }));

// =============================================================================
// RULES
// =============================================================================

export const K1_RULES: K1Rule[] = [
  { id: 'r-1', title: 'Game Start Procedure', category: 'game', summary: 'Rolling start with 2 formation quarters. Green flag at game control discretion. Jump start penalty: drive-through.' },
  { id: 'r-2', title: 'Points System', category: 'sporting', summary: '25-18-15-12-10-8-6-4-2-1 for top 10. +1 for fastest quarter (if finishing in top 10). +3 for pole position.' },
  { id: 'r-3', title: 'Minimum Weight', category: 'technical', summary: 'Car + player minimum 1,650 lbs at all times. Random post-game weight checks. Underweight = disqualification.' },
  { id: 'r-4', title: 'Safety Car Protocol', category: 'safety', summary: 'Full course yellow with safety car. No overtaking until green flag zone. Quarterped cars may unquarter under safety car.' },
  { id: 'r-5', title: 'Contact Penalties', category: 'sporting', summary: 'Avoidable contact: 5-second penalty. Causing a spin: 10-second penalty. Deliberate contact: black flag + hearing.' },
  { id: 'r-6', title: 'Tire Regulations', category: 'technical', summary: 'Single compound spec tire. Maximum 3 sets per game weekend. No tire warmers. Minimum pressure: 22 PSI.' },
  { id: 'r-7', title: 'Court Limits', category: 'game', summary: 'All four wheels must remain within white lines. 3 strikes = quarter time deleted. 5+ strikes = 5-second time penalty.' },
  { id: 'r-8', title: 'Player Safety Gear', category: 'safety', summary: 'FIA-approved helmet, HANS device, fire suit, gloves, and boots required. Annual medical clearance mandatory.' },
];

// =============================================================================
// HUB TABS
// =============================================================================

export const COMMUNITY_HUB_TABS: { id: CommunityHubTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'weekend', label: 'Weekend' },
  { id: 'standings', label: 'Standings' },
  { id: 'grid', label: 'Grid' },
  { id: 'teams', label: 'Teams' },
  { id: 'game-ops', label: 'Game Ops' },
  { id: 'rules', label: 'Rules' },
  { id: 'wildcard', label: 'Wildcard' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'sim', label: 'Sim' },
  { id: 'development', label: 'Development' },
];

// =============================================================================
// FAN / PROMOTIONAL EVENT TYPES
// =============================================================================

export interface K1FanEvent {
  id: string;
  name: string;
  type: 'fan_event' | 'media_day' | 'promo' | 'sponsor_activation' | 'community' | 'awards';
  location: string;
  date: string;
  time: string;
  description: string;
  status: 'upcoming' | 'confirmed' | 'completed';
  attendance?: number;
  linkedGame?: string;
}

// =============================================================================
// RACEWEEK OPS TYPES
// =============================================================================

export type OpsTaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type OpsTaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type OpsCategory = 'logistics' | 'court_prep' | 'safety' | 'media' | 'hospitality' | 'tech_inspection' | 'timing' | 'medical';

export interface K1OpsTask {
  id: string;
  title: string;
  category: OpsCategory;
  priority: OpsTaskPriority;
  status: OpsTaskStatus;
  assignee: string;
  dueDate: string;
  dueTime?: string;
  linkedGame: string;
  notes?: string;
}

export interface K1OpsChecklist {
  id: string;
  name: string;
  category: OpsCategory;
  totalItems: number;
  completedItems: number;
  assignee: string;
  linkedGame: string;
}

export interface K1CrewAssignment {
  id: string;
  name: string;
  role: string;
  department: OpsCategory;
  linkedGame: string;
  checkInTime: string;
  status: 'confirmed' | 'pending' | 'unavailable';
}

// =============================================================================
// MOCK FAN EVENTS
// =============================================================================

export const K1_FAN_EVENTS: K1FanEvent[] = [
  { id: 'fe-1', name: 'Fan Fest — COTA', type: 'fan_event', location: 'Austin, TX', date: 'Mar 7, 2026', time: '10:00 AM', description: 'Season-opening fan festival with player autographs, court demos, and live music at COTA.', status: 'completed', attendance: 4200, linkedGame: 'e-1' },
  { id: 'fe-2', name: 'Media Day — Laguna Seca', type: 'media_day', location: 'Monterey, CA', date: 'Mar 21, 2026', time: '9:00 AM', description: 'Pre-game media availability with all 16 players and team principals at Laguna Seca.', status: 'completed', attendance: 320, linkedGame: 'e-2' },
  { id: 'fe-3', name: '3SSB x Nike Activation', type: 'sponsor_activation', location: 'Lexington, OH', date: 'May 2, 2026', time: '11:00 AM', description: 'Nike pop-up experience with limited-edition 3SSB gear and athlete meet-and-greet.', status: 'completed', attendance: 1800, linkedGame: 'e-5' },
  { id: 'fe-4', name: 'Player Meet & Greet — Road Atlanta', type: 'fan_event', location: 'Braselton, GA', date: 'Apr 4, 2026', time: '2:00 PM', description: 'Exclusive courtside access and player signing session at Road Atlanta.', status: 'completed', attendance: 2600, linkedGame: 'e-3' },
  { id: 'fe-5', name: 'Charity Court Game', type: 'community', location: 'Rock Hill, SC', date: 'Jul 3, 2026', time: '3:00 PM', description: '3SSB players host exhibition games to raise funds for youth STEM programs.', status: 'completed', attendance: 1500 },
  { id: 'fe-6', name: 'Season Awards Gala', type: 'awards', location: 'Rock Hill, SC', date: 'Sep 20, 2026', time: '7:00 PM', description: 'Black-tie season-ending awards ceremony honoring top players, teams, and crew.', status: 'upcoming' },
  { id: 'fe-7', name: 'Thunder Classic Fan Zone', type: 'fan_event', location: 'Portland, OR', date: 'Jul 31, 2026', time: '10:00 AM', description: 'Fan zone with simulators, merch, food trucks, and pre-game entertainment at Portland.', status: 'upcoming', linkedGame: 'e-12' },
  { id: 'fe-8', name: 'Pre-Game Concert — Portland', type: 'promo', location: 'Portland, OR', date: 'Jul 31, 2026', time: '7:00 PM', description: 'Live concert featuring regional artists the evening before the Thunder Classic.', status: 'upcoming', linkedGame: 'e-12' },
  { id: 'fe-9', name: 'Lonestar Fan Fest', type: 'fan_event', location: 'Austin, TX', date: 'Aug 14, 2026', time: '10:00 AM', description: 'Texas-sized fan festival with BBQ, live demos, and player Q&A at COTA.', status: 'upcoming', linkedGame: 'e-13' },
  { id: 'fe-10', name: 'Season Finale Watch Party', type: 'fan_event', location: 'Monterey, CA', date: 'Sep 5, 2026', time: '12:00 PM', description: 'Outdoor big-screen watch party at Laguna Seca with live commentary and giveaways.', status: 'upcoming', linkedGame: 'e-14' },
  { id: 'fe-11', name: '3SSB x Adidas Activation', type: 'sponsor_activation', location: 'Austin, TX', date: 'Aug 14, 2026', time: '11:00 AM', description: 'Red Bull energy zone with gaming stations, sampling, and basketball challenges.', status: 'upcoming', linkedGame: 'e-13' },
  { id: 'fe-12', name: 'Community Basketball Clinic', type: 'community', location: 'Portland, OR', date: 'Jul 30, 2026', time: '9:00 AM', description: 'Free basketball clinic for local youth led by 3SSB players and coaches.', status: 'upcoming' },
];

// =============================================================================
// MOCK OPS TASKS (Thunder Classic — e-12)
// =============================================================================

export const K1_OPS_TASKS: K1OpsTask[] = [
  { id: 'ot-1', title: 'Court surface inspection', category: 'court_prep', priority: 'critical', status: 'completed', assignee: 'Chris Donovan', dueDate: 'Jul 29, 2026', dueTime: '8:00 AM', linkedGame: 'Thunder Classic' },
  { id: 'ot-2', title: 'Timing system calibration', category: 'timing', priority: 'critical', status: 'in_progress', assignee: 'Diego Fuentes', dueDate: 'Jul 30, 2026', dueTime: '12:00 PM', linkedGame: 'Thunder Classic' },
  { id: 'ot-3', title: 'Medical tent setup', category: 'medical', priority: 'high', status: 'not_started', assignee: 'Dr. Maria Santos', dueDate: 'Jul 31, 2026', dueTime: '6:00 AM', linkedGame: 'Thunder Classic' },
  { id: 'ot-4', title: 'VIP hospitality tent setup', category: 'hospitality', priority: 'medium', status: 'in_progress', assignee: 'Lisa Park', dueDate: 'Jul 31, 2026', dueTime: '7:00 AM', linkedGame: 'Thunder Classic' },
  { id: 'ot-5', title: 'TV broadcast equipment check', category: 'media', priority: 'high', status: 'completed', assignee: 'Mike Johnson', dueDate: 'Jul 30, 2026', dueTime: '3:00 PM', linkedGame: 'Thunder Classic' },
  { id: 'ot-6', title: 'Fire marshal walk-through', category: 'safety', priority: 'critical', status: 'not_started', assignee: 'Sarah Nakamura', dueDate: 'Jul 31, 2026', dueTime: '7:00 AM', linkedGame: 'Thunder Classic' },
  { id: 'ot-7', title: 'Courtside power & generator check', category: 'logistics', priority: 'high', status: 'in_progress', assignee: 'Tom Bradley', dueDate: 'Jul 30, 2026', dueTime: '2:00 PM', linkedGame: 'Thunder Classic' },
  { id: 'ot-8', title: 'Player credential distribution', category: 'logistics', priority: 'medium', status: 'completed', assignee: 'Tom Bradley', dueDate: 'Jul 29, 2026', dueTime: '4:00 PM', linkedGame: 'Thunder Classic' },
  { id: 'ot-9', title: 'Tech inspection bay prep', category: 'tech_inspection', priority: 'high', status: 'not_started', assignee: 'Kenji Tanaka', dueDate: 'Jul 31, 2026', dueTime: '6:30 AM', linkedGame: 'Thunder Classic' },
  { id: 'ot-10', title: 'Ambulance & medical staff confirm', category: 'medical', priority: 'critical', status: 'blocked', assignee: 'Dr. Maria Santos', dueDate: 'Jul 30, 2026', dueTime: '5:00 PM', linkedGame: 'Thunder Classic', notes: 'Waiting on county EMS confirmation' },
];

// =============================================================================
// MOCK OPS CHECKLISTS (Thunder Classic — e-12)
// =============================================================================

export const K1_OPS_CHECKLISTS: K1OpsChecklist[] = [
  { id: 'oc-1', name: 'Court Prep Checklist', category: 'court_prep', totalItems: 12, completedItems: 10, assignee: 'Chris Donovan', linkedGame: 'Thunder Classic' },
  { id: 'oc-2', name: 'Safety Systems Checklist', category: 'safety', totalItems: 8, completedItems: 3, assignee: 'Sarah Nakamura', linkedGame: 'Thunder Classic' },
  { id: 'oc-3', name: 'Timing & Scoring Setup', category: 'timing', totalItems: 6, completedItems: 6, assignee: 'Diego Fuentes', linkedGame: 'Thunder Classic' },
  { id: 'oc-4', name: 'Media & Broadcast Setup', category: 'media', totalItems: 10, completedItems: 7, assignee: 'Dana Wells', linkedGame: 'Thunder Classic' },
  { id: 'oc-5', name: 'Hospitality & Catering', category: 'hospitality', totalItems: 8, completedItems: 2, assignee: 'Lisa Park', linkedGame: 'Thunder Classic' },
  { id: 'oc-6', name: 'Medical & Emergency', category: 'medical', totalItems: 10, completedItems: 4, assignee: 'Dr. Maria Santos', linkedGame: 'Thunder Classic' },
];

// =============================================================================
// MOCK CREW ASSIGNMENTS (Thunder Classic — e-12)
// =============================================================================

export const K1_CREW_ASSIGNMENTS: K1CrewAssignment[] = [
  { id: 'ca-1', name: 'Tom Bradley', role: 'Game Director', department: 'logistics', linkedGame: 'Thunder Classic', checkInTime: '6:00 AM', status: 'confirmed' },
  { id: 'ca-2', name: 'Sarah Nakamura', role: 'Chief Steward', department: 'safety', linkedGame: 'Thunder Classic', checkInTime: '6:30 AM', status: 'confirmed' },
  { id: 'ca-3', name: 'Diego Fuentes', role: 'Head of Timing', department: 'timing', linkedGame: 'Thunder Classic', checkInTime: '7:00 AM', status: 'confirmed' },
  { id: 'ca-4', name: 'Chris Donovan', role: 'Court Marshal Lead', department: 'court_prep', linkedGame: 'Thunder Classic', checkInTime: '5:30 AM', status: 'confirmed' },
  { id: 'ca-5', name: 'Dana Wells', role: 'Media Coordinator', department: 'media', linkedGame: 'Thunder Classic', checkInTime: '7:00 AM', status: 'confirmed' },
  { id: 'ca-6', name: 'Lisa Park', role: 'Hospitality Manager', department: 'hospitality', linkedGame: 'Thunder Classic', checkInTime: '6:00 AM', status: 'confirmed' },
  { id: 'ca-7', name: 'Kenji Tanaka', role: 'Chief Technical Inspector', department: 'tech_inspection', linkedGame: 'Thunder Classic', checkInTime: '6:00 AM', status: 'confirmed' },
  { id: 'ca-8', name: 'Dr. Maria Santos', role: 'Chief Medical Officer', department: 'medical', linkedGame: 'Thunder Classic', checkInTime: '6:30 AM', status: 'pending' },
  { id: 'ca-9', name: 'Mike Johnson', role: 'Broadcast Director', department: 'media', linkedGame: 'Thunder Classic', checkInTime: '7:30 AM', status: 'confirmed' },
  { id: 'ca-10', name: 'Alex Rivera', role: 'Courtside Manager', department: 'logistics', linkedGame: 'Thunder Classic', checkInTime: '5:00 AM', status: 'unavailable' },
];

// =============================================================================
// OPS CATEGORY LABELS & COLORS
// =============================================================================

export const OPS_CATEGORY_LABELS: Record<OpsCategory, string> = {
  logistics: 'Logistics',
  court_prep: 'Court Prep',
  safety: 'Safety',
  media: 'Media',
  hospitality: 'Hospitality',
  tech_inspection: 'Tech Inspection',
  timing: 'Timing',
  medical: 'Medical',
};

export const OPS_CATEGORY_COLORS: Record<OpsCategory, string> = {
  logistics: '#1A1714',
  court_prep: '#B8943E',
  safety: '#B85C5C',
  media: '#1A1714',
  hospitality: '#1A1714',
  tech_inspection: '#1A1714',
  timing: '#1A1714',
  medical: '#5A8A6E',
};
