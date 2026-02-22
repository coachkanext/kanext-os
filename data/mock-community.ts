/**
 * Mock Community (KaNeXT LeagueOS) Data
 * Teams, drivers, events, standings for KaNeXT Motorsport motorsport league.
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
  homeTrack: string;
  driverCount: number;
  wins: number;
  points: number;
}

export interface K1Driver {
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
  fastestLaps: number;
}

export interface K1Event {
  id: string;
  name: string;
  track: string;
  location: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
  laps: number;
  winner?: string;
  winnerTeam?: string;
  weather?: string;
}

export interface K1StandingEntry {
  position: number;
  driverId: string;
  driverName: string;
  driverNumber: string;
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
  category: 'race' | 'technical' | 'safety' | 'sporting';
  summary: string;
}

export type CommunityHubTab =
  | 'home'
  | 'weekend'
  | 'standings'
  | 'grid'
  | 'teams'
  | 'race-ops'
  | 'rules'
  | 'wildcard'
  | 'commercial'
  | 'sim'
  | 'development';

// =============================================================================
// MOCK TEAMS
// =============================================================================

export const K1_TEAMS: K1Team[] = [
  { id: 't-1', name: 'Apex Racing', abbreviation: 'APX', primaryColor: '#EF4444', owner: 'Marcus Kane', homeTrack: 'Circuit of the Americas', driverCount: 2, wins: 4, points: 312 },
  { id: 't-2', name: 'Velocity Works', abbreviation: 'VEL', primaryColor: '#1D9BF0', owner: 'Lisa Grant', homeTrack: 'Laguna Seca', driverCount: 2, wins: 3, points: 287 },
  { id: 't-3', name: 'Phoenix Motorsport', abbreviation: 'PHX', primaryColor: '#F59E0B', owner: 'David Okafor', homeTrack: 'Road Atlanta', driverCount: 2, wins: 2, points: 256 },
  { id: 't-4', name: 'Zenith Racing', abbreviation: 'ZEN', primaryColor: '#22C55E', owner: 'Anna Petrov', homeTrack: 'Watkins Glen', driverCount: 2, wins: 2, points: 241 },
  { id: 't-5', name: 'Shadow GP', abbreviation: 'SHD', primaryColor: '#1D9BF0', owner: 'James Wright', homeTrack: 'Barber Motorsports', driverCount: 2, wins: 1, points: 198 },
  { id: 't-6', name: 'Titan Racing', abbreviation: 'TTN', primaryColor: '#1D9BF0', owner: 'Lisa Rodriguez', homeTrack: 'Mid-Ohio', driverCount: 2, wins: 0, points: 167 },
  { id: 't-7', name: 'Nova Speed', abbreviation: 'NVA', primaryColor: '#1D9BF0', owner: 'Kai Tanaka', homeTrack: 'Sebring', driverCount: 2, wins: 0, points: 145 },
  { id: 't-8', name: 'Iron Circuit', abbreviation: 'IRC', primaryColor: '#FFFFFF', owner: 'Mike Thompson', homeTrack: 'VIR', driverCount: 2, wins: 0, points: 132 },
];

// =============================================================================
// MOCK DRIVERS
// =============================================================================

export const K1_DRIVERS: K1Driver[] = [
  { id: 'd-1', name: 'Leo Vasquez', initials: 'LV', number: '7', teamId: 't-1', teamName: 'Apex Racing', teamColor: '#EF4444', nationality: 'USA', age: 24, wins: 3, podiums: 7, points: 178, avgFinish: 2.8, fastestLaps: 4 },
  { id: 'd-2', name: 'Nadia Patel', initials: 'NP', number: '22', teamId: 't-2', teamName: 'Velocity Works', teamColor: '#1D9BF0', nationality: 'GBR', age: 26, wins: 2, podiums: 6, points: 156, avgFinish: 3.2, fastestLaps: 3 },
  { id: 'd-3', name: 'Jake Morrison', initials: 'JM', number: '11', teamId: 't-1', teamName: 'Apex Racing', teamColor: '#EF4444', nationality: 'AUS', age: 22, wins: 1, podiums: 4, points: 134, avgFinish: 4.1, fastestLaps: 2 },
  { id: 'd-4', name: 'Yuki Tanaka', initials: 'YT', number: '33', teamId: 't-3', teamName: 'Phoenix Motorsport', teamColor: '#F59E0B', nationality: 'JPN', age: 23, wins: 2, podiums: 5, points: 148, avgFinish: 3.5, fastestLaps: 3 },
  { id: 'd-5', name: 'Marcus Bell', initials: 'MB', number: '5', teamId: 't-2', teamName: 'Velocity Works', teamColor: '#1D9BF0', nationality: 'USA', age: 28, wins: 1, podiums: 5, points: 131, avgFinish: 3.8, fastestLaps: 1 },
  { id: 'd-6', name: 'Sofia Torres', initials: 'ST', number: '44', teamId: 't-4', teamName: 'Zenith Racing', teamColor: '#22C55E', nationality: 'ESP', age: 25, wins: 2, podiums: 4, points: 142, avgFinish: 3.6, fastestLaps: 2 },
  { id: 'd-7', name: 'Andre Williams', initials: 'AW', number: '8', teamId: 't-3', teamName: 'Phoenix Motorsport', teamColor: '#F59E0B', nationality: 'USA', age: 21, wins: 0, podiums: 3, points: 108, avgFinish: 5.2, fastestLaps: 1 },
  { id: 'd-8', name: 'Emma Lindqvist', initials: 'EL', number: '16', teamId: 't-4', teamName: 'Zenith Racing', teamColor: '#22C55E', nationality: 'SWE', age: 27, wins: 0, podiums: 2, points: 99, avgFinish: 5.8, fastestLaps: 0 },
  { id: 'd-9', name: 'Carlos Mendez', initials: 'CM', number: '99', teamId: 't-5', teamName: 'Shadow GP', teamColor: '#1D9BF0', nationality: 'MEX', age: 24, wins: 1, podiums: 3, points: 112, avgFinish: 4.5, fastestLaps: 2 },
  { id: 'd-10', name: 'Grace Kim', initials: 'GK', number: '18', teamId: 't-5', teamName: 'Shadow GP', teamColor: '#1D9BF0', nationality: 'KOR', age: 23, wins: 0, podiums: 1, points: 86, avgFinish: 6.1, fastestLaps: 0 },
  { id: 'd-11', name: 'Ryan Fletcher', initials: 'RF', number: '3', teamId: 't-6', teamName: 'Titan Racing', teamColor: '#1D9BF0', nationality: 'CAN', age: 26, wins: 0, podiums: 2, points: 94, avgFinish: 5.4, fastestLaps: 1 },
  { id: 'd-12', name: 'Mia Santos', initials: 'MS', number: '27', teamId: 't-6', teamName: 'Titan Racing', teamColor: '#1D9BF0', nationality: 'BRA', age: 22, wins: 0, podiums: 1, points: 73, avgFinish: 6.8, fastestLaps: 0 },
  { id: 'd-13', name: 'Zach Cooper', initials: 'ZC', number: '41', teamId: 't-7', teamName: 'Nova Speed', teamColor: '#1D9BF0', nationality: 'USA', age: 25, wins: 0, podiums: 1, points: 81, avgFinish: 6.3, fastestLaps: 1 },
  { id: 'd-14', name: 'Priya Sharma', initials: 'PS', number: '14', teamId: 't-7', teamName: 'Nova Speed', teamColor: '#1D9BF0', nationality: 'IND', age: 24, wins: 0, podiums: 0, points: 64, avgFinish: 7.2, fastestLaps: 0 },
  { id: 'd-15', name: 'Tyler Brooks', initials: 'TB', number: '21', teamId: 't-8', teamName: 'Iron Circuit', teamColor: '#FFFFFF', nationality: 'USA', age: 29, wins: 0, podiums: 1, points: 72, avgFinish: 6.5, fastestLaps: 0 },
  { id: 'd-16', name: 'Olivia Dunn', initials: 'OD', number: '36', teamId: 't-8', teamName: 'Iron Circuit', teamColor: '#FFFFFF', nationality: 'IRL', age: 23, wins: 0, podiums: 0, points: 60, avgFinish: 7.8, fastestLaps: 0 },
];

// =============================================================================
// MOCK EVENTS (Race Calendar)
// =============================================================================

export const K1_EVENTS: K1Event[] = [
  { id: 'e-1', name: 'KaNeXT Opener', track: 'COTA', location: 'Austin, TX', date: 'Mar 8, 2026', status: 'completed', laps: 45, winner: 'Leo Vasquez', winnerTeam: 'Apex Racing' },
  { id: 'e-2', name: 'Pacific Grand Prix', track: 'Laguna Seca', location: 'Monterey, CA', date: 'Mar 22, 2026', status: 'completed', laps: 42, winner: 'Nadia Patel', winnerTeam: 'Velocity Works' },
  { id: 'e-3', name: 'Peach State Classic', track: 'Road Atlanta', location: 'Braselton, GA', date: 'Apr 5, 2026', status: 'completed', laps: 48, winner: 'Yuki Tanaka', winnerTeam: 'Phoenix Motorsport' },
  { id: 'e-4', name: 'Empire State Grand Prix', track: 'Watkins Glen', location: 'Watkins Glen, NY', date: 'Apr 19, 2026', status: 'completed', laps: 44, winner: 'Sofia Torres', winnerTeam: 'Zenith Racing' },
  { id: 'e-5', name: 'Heartland 300', track: 'Mid-Ohio', location: 'Lexington, OH', date: 'May 3, 2026', status: 'completed', laps: 50, winner: 'Leo Vasquez', winnerTeam: 'Apex Racing' },
  { id: 'e-6', name: 'Barber Invitational', track: 'Barber Motorsports', location: 'Birmingham, AL', date: 'May 17, 2026', status: 'completed', laps: 46, winner: 'Carlos Mendez', winnerTeam: 'Shadow GP' },
  { id: 'e-7', name: 'Sebring Sprint', track: 'Sebring', location: 'Sebring, FL', date: 'May 31, 2026', status: 'completed', laps: 52, winner: 'Nadia Patel', winnerTeam: 'Velocity Works' },
  { id: 'e-8', name: 'Virginia Classic', track: 'VIR', location: 'Alton, VA', date: 'Jun 14, 2026', status: 'completed', laps: 44, winner: 'Leo Vasquez', winnerTeam: 'Apex Racing' },
  { id: 'e-9', name: 'Summer Showdown', track: 'Road America', location: 'Elkhart Lake, WI', date: 'Jun 28, 2026', status: 'completed', laps: 48, winner: 'Yuki Tanaka', winnerTeam: 'Phoenix Motorsport' },
  { id: 'e-10', name: 'Independence GP', track: 'Indianapolis', location: 'Nashville, TN', date: 'Jul 4, 2026', status: 'completed', laps: 55, winner: 'Jake Morrison', winnerTeam: 'Apex Racing' },
  { id: 'e-11', name: 'Mountain Circuit', track: 'Sonoma', location: 'Sonoma, CA', date: 'Jul 18, 2026', status: 'completed', laps: 43, winner: 'Sofia Torres', winnerTeam: 'Zenith Racing' },
  { id: 'e-12', name: 'Thunder Classic', track: 'Portland', location: 'Portland, OR', date: 'Aug 1, 2026', status: 'upcoming', laps: 46, weather: 'Partly Cloudy · 72°F' },
  { id: 'e-13', name: 'Lonestar Grand Prix', track: 'COTA', location: 'Austin, TX', date: 'Aug 15, 2026', status: 'upcoming', laps: 45 },
  { id: 'e-14', name: 'Season Finale', track: 'Laguna Seca', location: 'Monterey, CA', date: 'Sep 5, 2026', status: 'upcoming', laps: 50 },
];

// =============================================================================
// STANDINGS (Driver Championship)
// =============================================================================

export const K1_STANDINGS: K1StandingEntry[] = K1_DRIVERS
  .sort((a, b) => b.points - a.points)
  .map((d, i) => ({
    position: i + 1,
    driverId: d.id,
    driverName: d.name,
    driverNumber: d.number,
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
  { id: 'r-1', title: 'Race Start Procedure', category: 'race', summary: 'Rolling start with 2 formation laps. Green flag at race control discretion. Jump start penalty: drive-through.' },
  { id: 'r-2', title: 'Points System', category: 'sporting', summary: '25-18-15-12-10-8-6-4-2-1 for top 10. +1 for fastest lap (if finishing in top 10). +3 for pole position.' },
  { id: 'r-3', title: 'Minimum Weight', category: 'technical', summary: 'Car + driver minimum 1,650 lbs at all times. Random post-race weight checks. Underweight = disqualification.' },
  { id: 'r-4', title: 'Safety Car Protocol', category: 'safety', summary: 'Full course yellow with safety car. No overtaking until green flag zone. Lapped cars may unlap under safety car.' },
  { id: 'r-5', title: 'Contact Penalties', category: 'sporting', summary: 'Avoidable contact: 5-second penalty. Causing a spin: 10-second penalty. Deliberate contact: black flag + hearing.' },
  { id: 'r-6', title: 'Tire Regulations', category: 'technical', summary: 'Single compound spec tire. Maximum 3 sets per race weekend. No tire warmers. Minimum pressure: 22 PSI.' },
  { id: 'r-7', title: 'Track Limits', category: 'race', summary: 'All four wheels must remain within white lines. 3 strikes = lap time deleted. 5+ strikes = 5-second time penalty.' },
  { id: 'r-8', title: 'Driver Safety Gear', category: 'safety', summary: 'FIA-approved helmet, HANS device, fire suit, gloves, and boots required. Annual medical clearance mandatory.' },
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
  { id: 'race-ops', label: 'Race Ops' },
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
  linkedRace?: string;
}

// =============================================================================
// RACEWEEK OPS TYPES
// =============================================================================

export type OpsTaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type OpsTaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type OpsCategory = 'logistics' | 'track_prep' | 'safety' | 'media' | 'hospitality' | 'tech_inspection' | 'timing' | 'medical';

export interface K1OpsTask {
  id: string;
  title: string;
  category: OpsCategory;
  priority: OpsTaskPriority;
  status: OpsTaskStatus;
  assignee: string;
  dueDate: string;
  dueTime?: string;
  linkedRace: string;
  notes?: string;
}

export interface K1OpsChecklist {
  id: string;
  name: string;
  category: OpsCategory;
  totalItems: number;
  completedItems: number;
  assignee: string;
  linkedRace: string;
}

export interface K1CrewAssignment {
  id: string;
  name: string;
  role: string;
  department: OpsCategory;
  linkedRace: string;
  checkInTime: string;
  status: 'confirmed' | 'pending' | 'unavailable';
}

// =============================================================================
// MOCK FAN EVENTS
// =============================================================================

export const K1_FAN_EVENTS: K1FanEvent[] = [
  { id: 'fe-1', name: 'Fan Fest — COTA', type: 'fan_event', location: 'Austin, TX', date: 'Mar 7, 2026', time: '10:00 AM', description: 'Season-opening fan festival with driver autographs, kart demos, and live music at COTA.', status: 'completed', attendance: 4200, linkedRace: 'e-1' },
  { id: 'fe-2', name: 'Media Day — Laguna Seca', type: 'media_day', location: 'Monterey, CA', date: 'Mar 21, 2026', time: '9:00 AM', description: 'Pre-race media availability with all 16 drivers and team principals at Laguna Seca.', status: 'completed', attendance: 320, linkedRace: 'e-2' },
  { id: 'fe-3', name: 'KaNeXT x Nike Activation', type: 'sponsor_activation', location: 'Lexington, OH', date: 'May 2, 2026', time: '11:00 AM', description: 'Nike pop-up experience with limited-edition KaNeXT racing gear and athlete meet-and-greet.', status: 'completed', attendance: 1800, linkedRace: 'e-5' },
  { id: 'fe-4', name: 'Driver Meet & Greet — Road Atlanta', type: 'fan_event', location: 'Braselton, GA', date: 'Apr 4, 2026', time: '2:00 PM', description: 'Exclusive paddock access and driver signing session at Road Atlanta.', status: 'completed', attendance: 2600, linkedRace: 'e-3' },
  { id: 'fe-5', name: 'Charity Kart Race', type: 'community', location: 'Nashville, TN', date: 'Jul 3, 2026', time: '3:00 PM', description: 'KaNeXT drivers race rental karts to raise funds for youth STEM programs.', status: 'completed', attendance: 1500 },
  { id: 'fe-6', name: 'Season Awards Gala', type: 'awards', location: 'Nashville, TN', date: 'Sep 20, 2026', time: '7:00 PM', description: 'Black-tie season-ending awards ceremony honoring top drivers, teams, and crew.', status: 'upcoming' },
  { id: 'fe-7', name: 'Thunder Classic Fan Zone', type: 'fan_event', location: 'Portland, OR', date: 'Jul 31, 2026', time: '10:00 AM', description: 'Fan zone with simulators, merch, food trucks, and pre-race entertainment at Portland.', status: 'upcoming', linkedRace: 'e-12' },
  { id: 'fe-8', name: 'Pre-Race Concert — Portland', type: 'promo', location: 'Portland, OR', date: 'Jul 31, 2026', time: '7:00 PM', description: 'Live concert featuring regional artists the evening before the Thunder Classic.', status: 'upcoming', linkedRace: 'e-12' },
  { id: 'fe-9', name: 'Lonestar Fan Fest', type: 'fan_event', location: 'Austin, TX', date: 'Aug 14, 2026', time: '10:00 AM', description: 'Texas-sized fan festival with BBQ, live demos, and driver Q&A at COTA.', status: 'upcoming', linkedRace: 'e-13' },
  { id: 'fe-10', name: 'Season Finale Watch Party', type: 'fan_event', location: 'Monterey, CA', date: 'Sep 5, 2026', time: '12:00 PM', description: 'Outdoor big-screen watch party at Laguna Seca with live commentary and giveaways.', status: 'upcoming', linkedRace: 'e-14' },
  { id: 'fe-11', name: 'KaNeXT x Red Bull Activation', type: 'sponsor_activation', location: 'Austin, TX', date: 'Aug 14, 2026', time: '11:00 AM', description: 'Red Bull energy zone with gaming stations, sampling, and racing challenges.', status: 'upcoming', linkedRace: 'e-13' },
  { id: 'fe-12', name: 'Community Karting Clinic', type: 'community', location: 'Portland, OR', date: 'Jul 30, 2026', time: '9:00 AM', description: 'Free karting clinic for local youth led by KaNeXT drivers and instructors.', status: 'upcoming' },
];

// =============================================================================
// MOCK OPS TASKS (Thunder Classic — e-12)
// =============================================================================

export const K1_OPS_TASKS: K1OpsTask[] = [
  { id: 'ot-1', title: 'Track surface inspection', category: 'track_prep', priority: 'critical', status: 'completed', assignee: 'Chris Donovan', dueDate: 'Jul 29, 2026', dueTime: '8:00 AM', linkedRace: 'Thunder Classic' },
  { id: 'ot-2', title: 'Timing system calibration', category: 'timing', priority: 'critical', status: 'in_progress', assignee: 'Diego Fuentes', dueDate: 'Jul 30, 2026', dueTime: '12:00 PM', linkedRace: 'Thunder Classic' },
  { id: 'ot-3', title: 'Medical tent setup', category: 'medical', priority: 'high', status: 'not_started', assignee: 'Dr. Maria Santos', dueDate: 'Jul 31, 2026', dueTime: '6:00 AM', linkedRace: 'Thunder Classic' },
  { id: 'ot-4', title: 'VIP hospitality tent setup', category: 'hospitality', priority: 'medium', status: 'in_progress', assignee: 'Lisa Park', dueDate: 'Jul 31, 2026', dueTime: '7:00 AM', linkedRace: 'Thunder Classic' },
  { id: 'ot-5', title: 'TV broadcast equipment check', category: 'media', priority: 'high', status: 'completed', assignee: 'Mike Johnson', dueDate: 'Jul 30, 2026', dueTime: '3:00 PM', linkedRace: 'Thunder Classic' },
  { id: 'ot-6', title: 'Fire marshal walk-through', category: 'safety', priority: 'critical', status: 'not_started', assignee: 'Sarah Nakamura', dueDate: 'Jul 31, 2026', dueTime: '7:00 AM', linkedRace: 'Thunder Classic' },
  { id: 'ot-7', title: 'Paddock power & generator check', category: 'logistics', priority: 'high', status: 'in_progress', assignee: 'Tom Bradley', dueDate: 'Jul 30, 2026', dueTime: '2:00 PM', linkedRace: 'Thunder Classic' },
  { id: 'ot-8', title: 'Driver credential distribution', category: 'logistics', priority: 'medium', status: 'completed', assignee: 'Tom Bradley', dueDate: 'Jul 29, 2026', dueTime: '4:00 PM', linkedRace: 'Thunder Classic' },
  { id: 'ot-9', title: 'Tech inspection bay prep', category: 'tech_inspection', priority: 'high', status: 'not_started', assignee: 'Kenji Tanaka', dueDate: 'Jul 31, 2026', dueTime: '6:30 AM', linkedRace: 'Thunder Classic' },
  { id: 'ot-10', title: 'Ambulance & medical staff confirm', category: 'medical', priority: 'critical', status: 'blocked', assignee: 'Dr. Maria Santos', dueDate: 'Jul 30, 2026', dueTime: '5:00 PM', linkedRace: 'Thunder Classic', notes: 'Waiting on county EMS confirmation' },
];

// =============================================================================
// MOCK OPS CHECKLISTS (Thunder Classic — e-12)
// =============================================================================

export const K1_OPS_CHECKLISTS: K1OpsChecklist[] = [
  { id: 'oc-1', name: 'Track Prep Checklist', category: 'track_prep', totalItems: 12, completedItems: 10, assignee: 'Chris Donovan', linkedRace: 'Thunder Classic' },
  { id: 'oc-2', name: 'Safety Systems Checklist', category: 'safety', totalItems: 8, completedItems: 3, assignee: 'Sarah Nakamura', linkedRace: 'Thunder Classic' },
  { id: 'oc-3', name: 'Timing & Scoring Setup', category: 'timing', totalItems: 6, completedItems: 6, assignee: 'Diego Fuentes', linkedRace: 'Thunder Classic' },
  { id: 'oc-4', name: 'Media & Broadcast Setup', category: 'media', totalItems: 10, completedItems: 7, assignee: 'Dana Wells', linkedRace: 'Thunder Classic' },
  { id: 'oc-5', name: 'Hospitality & Catering', category: 'hospitality', totalItems: 8, completedItems: 2, assignee: 'Lisa Park', linkedRace: 'Thunder Classic' },
  { id: 'oc-6', name: 'Medical & Emergency', category: 'medical', totalItems: 10, completedItems: 4, assignee: 'Dr. Maria Santos', linkedRace: 'Thunder Classic' },
];

// =============================================================================
// MOCK CREW ASSIGNMENTS (Thunder Classic — e-12)
// =============================================================================

export const K1_CREW_ASSIGNMENTS: K1CrewAssignment[] = [
  { id: 'ca-1', name: 'Tom Bradley', role: 'Race Director', department: 'logistics', linkedRace: 'Thunder Classic', checkInTime: '6:00 AM', status: 'confirmed' },
  { id: 'ca-2', name: 'Sarah Nakamura', role: 'Chief Steward', department: 'safety', linkedRace: 'Thunder Classic', checkInTime: '6:30 AM', status: 'confirmed' },
  { id: 'ca-3', name: 'Diego Fuentes', role: 'Head of Timing', department: 'timing', linkedRace: 'Thunder Classic', checkInTime: '7:00 AM', status: 'confirmed' },
  { id: 'ca-4', name: 'Chris Donovan', role: 'Track Marshal Lead', department: 'track_prep', linkedRace: 'Thunder Classic', checkInTime: '5:30 AM', status: 'confirmed' },
  { id: 'ca-5', name: 'Dana Wells', role: 'Media Coordinator', department: 'media', linkedRace: 'Thunder Classic', checkInTime: '7:00 AM', status: 'confirmed' },
  { id: 'ca-6', name: 'Lisa Park', role: 'Hospitality Manager', department: 'hospitality', linkedRace: 'Thunder Classic', checkInTime: '6:00 AM', status: 'confirmed' },
  { id: 'ca-7', name: 'Kenji Tanaka', role: 'Chief Technical Inspector', department: 'tech_inspection', linkedRace: 'Thunder Classic', checkInTime: '6:00 AM', status: 'confirmed' },
  { id: 'ca-8', name: 'Dr. Maria Santos', role: 'Chief Medical Officer', department: 'medical', linkedRace: 'Thunder Classic', checkInTime: '6:30 AM', status: 'pending' },
  { id: 'ca-9', name: 'Mike Johnson', role: 'Broadcast Director', department: 'media', linkedRace: 'Thunder Classic', checkInTime: '7:30 AM', status: 'confirmed' },
  { id: 'ca-10', name: 'Alex Rivera', role: 'Paddock Manager', department: 'logistics', linkedRace: 'Thunder Classic', checkInTime: '5:00 AM', status: 'unavailable' },
];

// =============================================================================
// OPS CATEGORY LABELS & COLORS
// =============================================================================

export const OPS_CATEGORY_LABELS: Record<OpsCategory, string> = {
  logistics: 'Logistics',
  track_prep: 'Track Prep',
  safety: 'Safety',
  media: 'Media',
  hospitality: 'Hospitality',
  tech_inspection: 'Tech Inspection',
  timing: 'Timing',
  medical: 'Medical',
};

export const OPS_CATEGORY_COLORS: Record<OpsCategory, string> = {
  logistics: '#1D9BF0',
  track_prep: '#F59E0B',
  safety: '#EF4444',
  media: '#1D9BF0',
  hospitality: '#1D9BF0',
  tech_inspection: '#1D9BF0',
  timing: '#1D9BF0',
  medical: '#22C55E',
};
