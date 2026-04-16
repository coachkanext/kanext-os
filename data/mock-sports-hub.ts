/**
 * Mock data for Lincoln University Oakland Men's Basketball — Sports Mode Row 2
 * Hub / Roster / Recruits / Booster
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type PlayerArchetype =
  | 'Shot-Creating Wing' | 'Rim Protector' | 'PNR Ball Handler'
  | 'Spot-Up Shooter' | 'Defensive Anchor' | 'Versatile Forward'
  | 'Playmaking Guard' | 'Stretch Four' | 'Post Scorer'
  | 'Two-Way Wing' | 'Energy Big' | 'Secondary Creator';

export type EligibilityStatus = 'eligible' | 'warning' | 'ineligible';
export type MedicalStatus     = 'available' | 'limited' | 'out';
export type RecruitStage      = 'Identified' | 'Evaluating' | 'Offered' | 'Verbal' | 'Committed' | 'Signed' | 'Declined';
export type RecruitPriority   = 'Target' | 'Offer' | 'Watch' | 'Backup';
export type NILDealType       = 'social-post' | 'appearance' | 'autograph' | 'endorsement' | 'ambassador' | 'content';
export type NILDealStatus     = 'pending' | 'in-progress' | 'completed' | 'paid';
export type ComplianceStatus  = 'approved' | 'pending' | 'flagged';
export type Position          = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type ClassYear         = 'Fr' | 'So' | 'Jr' | 'Sr' | 'Gr' | 'RS';
export type DataTier          = 'V1' | 'V1+' | 'V2' | 'V3';
export type GameResult        = 'W' | 'L';
export type PlayerRole        = 'Starter' | 'Rotation' | 'Bench' | 'DNP';
export type CampaignStatus    = 'active' | 'completed' | 'upcoming';
export type MerchCategory     = 'Apparel' | 'Headwear' | 'Accessories' | 'Special';

export interface TraitCluster {
  shooting:    number; // 0-100
  finishing:   number;
  playmaking:  number;
  defense:     number;
  athleticism: number;
  iq:          number;
  tools:       number;
}

export interface PlayerKR {
  overall:    number;
  offensive:  number;
  defensive:  number;
  confidence: number;
  tier:       DataTier;
  trend:      'up' | 'down' | 'flat';
  delta:      number;
}

export interface SeasonStats {
  ppg:  number; rpg: number; apg: number; spg: number; bpg: number;
  fgPct: number; fg3Pct: number; ftPct: number; mpg: number; gp: number;
}

export interface Player {
  id:           string;
  name:         string;
  initials:     string;
  number:       number;
  hue:          number;
  position:     Position;
  classYear:    ClassYear;
  heightFt:     string;
  weight:       number;
  hometown:     string;
  highSchool:   string;
  isScholarship: boolean;
  isRedshirt:   boolean;
  kr:           PlayerKR;
  archetype:    PlayerArchetype;
  traits:       TraitCluster;
  badges:       string[];
  stats:        SeasonStats;
  medical:      MedicalStatus;
  medicalNote?: string;
  eligibility:  EligibilityStatus;
  gpa:          number;
  credits:      number;
  role:         PlayerRole;
  systemFitOff: number;
  systemFitDef: number;
}

export interface StaffMember {
  id:       string;
  name:     string;
  initials: string;
  hue:      number;
  title:    string;
  role:     'head-coach' | 'asst-coach' | 'grad-asst' | 'trainer' | 'strength' | 'sid' | 'video' | 'advisor';
  phone:    string;
  email:    string;
}

export interface Game {
  id:       string;
  date:     string;
  opponent: string;
  oppHue:   number;
  location: 'H' | 'A' | 'N';
  venue:    string;
  time:     string;
  result?:  GameResult;
  score?:   string;
  oppScore?: string;
  isConference: boolean;
  tv?:      string;
}

export interface Recruit {
  id:          string;
  name:        string;
  initials:    string;
  hue:         number;
  position:    Position;
  classYear:   '2025' | '2026' | '2027';
  school:      string;
  state:       string;
  heightFt:    string;
  weight:      number;
  stage:       RecruitStage;
  priority:    RecruitPriority;
  kr?:         number;
  krConf?:     number;
  archetype?:  PlayerArchetype;
  systemFit?:  number;
  lastContact: string;
  contactType: 'call' | 'text' | 'visit' | 'email';
  gpa:         number;
  offers:      string[];
  stars:       number;
  hasFilm:     boolean;
  notes:       string;
}

export interface PortalPlayer {
  id:          string;
  name:        string;
  initials:    string;
  hue:         number;
  position:    Position;
  prevSchool:  string;
  conference:  string;
  level:       'D1' | 'D2' | 'JUCO';
  stats:       Pick<SeasonStats, 'ppg' | 'rpg' | 'apg'>;
  kr?:         number;
  systemFit?:  number;
  enteredDate: string;
  eligible:    'immediately' | 'sit-out';
}

export interface NILOpportunity {
  id:           string;
  brand:        string;
  brandHue:     number;
  type:         NILDealType;
  amount:       number;
  description:  string;
  deliverables: string;
  deadline:     string;
  targetPos?:   Position;
  openToAll:    boolean;
}

export interface NILDeal {
  id:          string;
  playerId:    string;
  playerName:  string;
  brand:       string;
  type:        NILDealType;
  amount:      number;
  status:      NILDealStatus;
  compliance:  ComplianceStatus;
  startDate:   string;
  endDate:     string;
  deliverables: string[];
  completed:   number; // 0-100%
}

export interface Campaign {
  id:        string;
  name:      string;
  goal:      number;
  raised:    number;
  donors:    number;
  status:    CampaignStatus;
  deadline:  string;
  desc:      string;
  fundId:    string;
}

export interface MerchProduct {
  id:       string;
  name:     string;
  category: MerchCategory;
  price:    number;
  colors:   string[];
  inStock:  boolean;
  isFeatured: boolean;
  isLimited:  boolean;
  rating:   number;
  reviews:  number;
}

export interface TicketGame {
  gameId:    string;
  opponent:  string;
  date:      string;
  time:      string;
  venue:     string;
  types:     { label: string; price: number; available: number }[];
}

export interface FanReward {
  id:     string;
  name:   string;
  points: number;
  rank:   number;
  hue:    number;
}

export interface NILActivity {
  id:         string;
  playerId:   string;
  playerName: string;
  initials:   string;
  hue:        number;
  action:     string;
  brand:      string;
  timestamp:  string;
  amount?:    number;
}

export interface FanExperience {
  id:          string;
  playerId:    string;
  playerName:  string;
  initials:    string;
  hue:         number;
  type:        'shoutout' | 'signed-item' | 'raffle' | 'training' | 'courtside';
  title:       string;
  description: string;
  price:       number;
  spotsLeft:   number | null;
  isRaffle:    boolean;
}

// ── Team Info ─────────────────────────────────────────────────────────────────

export const TEAM_INFO = {
  name:           'LU Men\'s Basketball',
  school:         'Lincoln University Oakland',
  mascot:         'Oaklanders',
  record:         '17-8',
  conferenceRec:  '11-7',
  hue:            0,
  colors:         { primary: '#1A1714', secondary: '#CC0000' },
  conference:     'GAAC',
  confStanding:   '1st · Champions',
};

export const TEAM_KR = {
  overall:    78.0,
  offensive:  76.8,
  defensive:  79.8,
  trend:      'up' as const,
  delta:      2.4,
  seasonHigh: 79.2,
  seasonLow:  64.2,
  history:    [64.2, 66.8, 69.4, 70.8, 72.6, 74.1, 75.4, 76.7, 78.0],
};

export const TEAM_SYSTEM = {
  offense: { name: 'PNR Motion',  locked: true,  confidence: 84, pace: 66, primary: 'Pick-and-Roll', secondary: 'Spot-Up', transition: 16 },
  defense: { name: 'Switch Man',  locked: true,  confidence: 81, pressure: 'Half Court', help: 'Rotate', rebounding: 'Box Out Man' },
  offDesc: 'Transition-first attack off PNR creation from primary guard, kick-outs to shooters on the weak side.',
  defDesc: 'Switch-heavy man defense with disciplined help-side rotation and interior presence.',
  offCover: ['PNR creation', 'Transition offense', '3PT off movement', 'Free throw generation'],
  offGaps:  ['Half-court sets vs zone', 'Secondary ball-handler depth'],
  defCover: ['Rim protection', 'Switch versatility', 'Perimeter contest rate'],
  defGaps:  ['Full-court press', 'Scramble rotations off turnovers'],
  fragility: ['If PG sits, PNR creation drops ~30%', 'Zone offense needs further development'],
};

export const NEXT_GAME = {
  opponent:   'Holy Names University',
  oppHue:     200,
  date:       'Apr 3, 2026',
  time:       '7:00 PM',
  venue:      'Laney College',
  location:   'H' as const,
  oppRecord:  '12-13',
  oppConfRec: '7-8',
  confStand:  '6th',
  countdown:  '3d 14h',
  isConference: true,
};

// ── Players ───────────────────────────────────────────────────────────────────

export const PLAYERS: Player[] = [
  // ── Starters ──
  {
    id: 'p01', name: 'Laolu Kalejaiye',   initials: 'LK', number: 11, hue: 35,
    position: 'SG', classYear: 'Sr', heightFt: '6\'4"',  weight: 196, hometown: 'Oakland, CA',       highSchool: 'Oakland Tech HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 86.0, offensive: 88.4, defensive: 82.1, confidence: 92, tier: 'V2', trend: 'up', delta: 2.8 },
    archetype: 'Shot-Creating Wing',
    traits: { shooting: 90, finishing: 86, playmaking: 76, defense: 79, athleticism: 88, iq: 87, tools: 82 },
    badges: ['First Team All-Conference', 'Elite Scorer', 'Shot Creator', 'Clutch Performer'],
    stats: { ppg: 23.4, rpg: 4.2, apg: 3.8, spg: 1.6, bpg: 0.3, fgPct: 46.8, fg3Pct: 37.2, ftPct: 82.4, mpg: 34.6, gp: 25 },
    medical: 'available', eligibility: 'eligible', gpa: 3.0, credits: 108, role: 'Starter',
    systemFitOff: 91, systemFitDef: 84,
  },
  {
    id: 'p02', name: 'Claude McKesey',    initials: 'CM', number: 3,  hue: 160,
    position: 'SG', classYear: 'Sr', heightFt: '6\'4"',  weight: 193, hometown: 'Richmond, CA',       highSchool: 'Kennedy HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 71.0, offensive: 73.4, defensive: 67.9, confidence: 84, tier: 'V2', trend: 'flat', delta: 0.3 },
    archetype: 'Shot-Creating Wing',
    traits: { shooting: 81, finishing: 76, playmaking: 72, defense: 75, athleticism: 79, iq: 80, tools: 77 },
    badges: ['Elite Shooter', 'Shot Creator', 'Senior Leader'],
    stats: { ppg: 11.8, rpg: 3.0, apg: 2.2, spg: 1.0, bpg: 0.3, fgPct: 43.8, fg3Pct: 38.7, ftPct: 85.2, mpg: 28.6, gp: 25 },
    medical: 'available', eligibility: 'eligible', gpa: 3.3, credits: 108, role: 'Starter',
    systemFitOff: 87, systemFitDef: 78,
  },
  {
    id: 'p03', name: 'Samuel Manzo',      initials: 'SM', number: 5,  hue: 280,
    position: 'SF', classYear: 'Jr', heightFt: '6\'6"',  weight: 207, hometown: 'San Jose, CA',       highSchool: 'Bellarmine Prep',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 73.6, offensive: 71.4, defensive: 76.9, confidence: 84, tier: 'V2', trend: 'up', delta: 2.8 },
    archetype: 'Two-Way Wing',
    traits: { shooting: 68, finishing: 73, playmaking: 64, defense: 80, athleticism: 78, iq: 75, tools: 81 },
    badges: ['Defensive Stopper', 'Length Weapon', 'System Fit'],
    stats: { ppg: 9.1, rpg: 5.4, apg: 1.3, spg: 1.7, bpg: 0.8, fgPct: 47.2, fg3Pct: 30.8, ftPct: 70.4, mpg: 26.0, gp: 25 },
    medical: 'available', eligibility: 'eligible', gpa: 2.8, credits: 66, role: 'Starter',
    systemFitOff: 70, systemFitDef: 90,
  },
  {
    id: 'p04', name: 'Samuel Wall',       initials: 'SW', number: 6,  hue: 30,
    position: 'PF', classYear: 'Jr', heightFt: '6\'8"',  weight: 222, hometown: 'Stockton, CA',       highSchool: 'Franklin HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 74.8, offensive: 72.3, defensive: 78.2, confidence: 86, tier: 'V2', trend: 'up', delta: 1.6 },
    archetype: 'Versatile Forward',
    traits: { shooting: 70, finishing: 77, playmaking: 66, defense: 82, athleticism: 76, iq: 77, tools: 84 },
    badges: ['Switchable Defender', 'Screen Setter', 'Motor Player'],
    stats: { ppg: 10.6, rpg: 6.7, apg: 1.6, spg: 0.6, bpg: 1.3, fgPct: 49.8, fg3Pct: 31.4, ftPct: 72.9, mpg: 27.4, gp: 25 },
    medical: 'available', eligibility: 'eligible', gpa: 2.7, credits: 65, role: 'Starter',
    systemFitOff: 81, systemFitDef: 87,
  },
  {
    id: 'p05', name: 'Paul Diomande',     initials: 'PD', number: 21, hue: 20,
    position: 'C',  classYear: 'Sr', heightFt: '6\'10"', weight: 242, hometown: 'Fremont, CA',         highSchool: 'Mission San Jose HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 79.1, offensive: 75.8, defensive: 83.4, confidence: 89, tier: 'V2', trend: 'up', delta: 0.7 },
    archetype: 'Rim Protector',
    traits: { shooting: 56, finishing: 82, playmaking: 59, defense: 88, athleticism: 76, iq: 81, tools: 91 },
    badges: ['Elite Rim Protector', 'PNR Finisher', 'Defensive Anchor', 'Senior Leader'],
    stats: { ppg: 11.8, rpg: 8.4, apg: 1.1, spg: 0.5, bpg: 2.6, fgPct: 56.9, fg3Pct: 0.0, ftPct: 62.8, mpg: 28.3, gp: 23 },
    medical: 'available', eligibility: 'eligible', gpa: 3.1, credits: 106, role: 'Starter',
    systemFitOff: 86, systemFitDef: 94,
  },
  // ── Rotation ──
  {
    id: 'p06', name: 'Brandon Williams',  initials: 'BW', number: 1,  hue: 190,
    position: 'PG', classYear: 'Jr', heightFt: '6\'1"',  weight: 178, hometown: 'Berkeley, CA',        highSchool: 'Berkeley HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 76.0, offensive: 78.2, defensive: 72.4, confidence: 84, tier: 'V2', trend: 'up', delta: 2.1 },
    archetype: 'PNR Ball Handler',
    traits: { shooting: 72, finishing: 74, playmaking: 82, defense: 70, athleticism: 79, iq: 80, tools: 75 },
    badges: ['Primary Creator', 'Floor General', 'PNR Maestro'],
    stats: { ppg: 9.4, rpg: 2.6, apg: 4.8, spg: 1.1, bpg: 0.1, fgPct: 43.2, fg3Pct: 36.8, ftPct: 79.1, mpg: 22.4, gp: 24 },
    medical: 'available', eligibility: 'eligible', gpa: 2.9, credits: 64, role: 'Rotation',
    systemFitOff: 84, systemFitDef: 72,
  },
  {
    id: 'p07', name: 'Chris Plantey',     initials: 'CP', number: 2,  hue: 140,
    position: 'SG', classYear: 'Jr', heightFt: '6\'3"',  weight: 188, hometown: 'Sacramento, CA',      highSchool: 'Grant Union HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 70.1, offensive: 72.6, defensive: 66.8, confidence: 82, tier: 'V2', trend: 'flat', delta: 0.2 },
    archetype: 'Spot-Up Shooter',
    traits: { shooting: 83, finishing: 64, playmaking: 61, defense: 65, athleticism: 69, iq: 73, tools: 72 },
    badges: ['Elite Corner 3', 'Catch-and-Shoot Weapon'],
    stats: { ppg: 7.7, rpg: 2.2, apg: 1.1, spg: 0.7, bpg: 0.1, fgPct: 42.4, fg3Pct: 40.8, ftPct: 88.1, mpg: 21.9, gp: 25 },
    medical: 'available', eligibility: 'eligible', gpa: 2.9, credits: 67, role: 'Rotation',
    systemFitOff: 90, systemFitDef: 71,
  },
  {
    id: 'p08', name: 'Nathan Chatelain',  initials: 'NC', number: 15, hue: 300,
    position: 'SF', classYear: 'Jr', heightFt: '6\'5"',  weight: 200, hometown: 'Modesto, CA',         highSchool: 'Downey HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 71.0, offensive: 70.2, defensive: 72.6, confidence: 79, tier: 'V1+', trend: 'up', delta: 1.8 },
    archetype: 'Two-Way Wing',
    traits: { shooting: 68, finishing: 72, playmaking: 60, defense: 77, athleticism: 76, iq: 71, tools: 80 },
    badges: ['Switchable Defender', 'Length Weapon'],
    stats: { ppg: 7.2, rpg: 4.1, apg: 1.2, spg: 0.9, bpg: 0.7, fgPct: 44.3, fg3Pct: 32.4, ftPct: 71.8, mpg: 19.3, gp: 23 },
    medical: 'available', eligibility: 'eligible', gpa: 2.6, credits: 64, role: 'Rotation',
    systemFitOff: 68, systemFitDef: 83,
  },
  {
    id: 'p09', name: 'Nicholas Bansraj',  initials: 'NB', number: 20, hue: 60,
    position: 'SF', classYear: 'Jr', heightFt: '6\'7"',  weight: 208, hometown: 'Hayward, CA',          highSchool: 'Tennyson HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 66.8, offensive: 64.4, defensive: 70.1, confidence: 79, tier: 'V1+', trend: 'up', delta: 1.8 },
    archetype: 'Two-Way Wing',
    traits: { shooting: 60, finishing: 70, playmaking: 56, defense: 74, athleticism: 73, iq: 68, tools: 79 },
    badges: ['Length Weapon'],
    stats: { ppg: 5.1, rpg: 4.6, apg: 0.7, spg: 1.1, bpg: 0.6, fgPct: 45.1, fg3Pct: 26.3, ftPct: 64.8, mpg: 17.2, gp: 23 },
    medical: 'available', eligibility: 'eligible', gpa: 2.7, credits: 68, role: 'Rotation',
    systemFitOff: 66, systemFitDef: 83,
  },
  {
    id: 'p10', name: 'Jordan Blake',      initials: 'JB', number: 10, hue: 170,
    position: 'C',  classYear: 'Sr', heightFt: '6\'9"',  weight: 238, hometown: 'Vallejo, CA',          highSchool: 'Vallejo HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 63.7, offensive: 65.3, defensive: 61.4, confidence: 85, tier: 'V2', trend: 'down', delta: -1.2 },
    archetype: 'Post Scorer',
    traits: { shooting: 47, finishing: 75, playmaking: 53, defense: 63, athleticism: 64, iq: 68, tools: 87 },
    badges: ['Post Presence'],
    stats: { ppg: 5.2, rpg: 5.0, apg: 0.7, spg: 0.3, bpg: 1.0, fgPct: 53.8, fg3Pct: 0.0, ftPct: 59.7, mpg: 16.1, gp: 25 },
    medical: 'available', eligibility: 'eligible', gpa: 3.5, credits: 112, role: 'Rotation',
    systemFitOff: 73, systemFitDef: 67,
  },
  // ── Bench / Depth ──
  {
    id: 'p11', name: 'Darius Osei',       initials: 'DO', number: 4,  hue: 200,
    position: 'PG', classYear: 'Fr', heightFt: '5\'11"', weight: 168, hometown: 'Oakland, CA',       highSchool: 'Fremont HS',
    isScholarship: false, isRedshirt: false,
    kr: { overall: 61.8, offensive: 63.9, defensive: 58.4, confidence: 72, tier: 'V1+', trend: 'up', delta: 2.4 },
    archetype: 'Playmaking Guard',
    traits: { shooting: 66, finishing: 60, playmaking: 70, defense: 54, athleticism: 68, iq: 64, tools: 65 },
    badges: [],
    stats: { ppg: 3.2, rpg: 1.1, apg: 2.2, spg: 0.6, bpg: 0.0, fgPct: 37.4, fg3Pct: 31.6, ftPct: 78.9, mpg: 10.4, gp: 18 },
    medical: 'available', eligibility: 'eligible', gpa: 3.1, credits: 16, role: 'Bench',
    systemFitOff: 74, systemFitDef: 60,
  },
  {
    id: 'p12', name: 'Marcus Webb',       initials: 'MW', number: 23, hue: 100,
    position: 'SF', classYear: 'Fr', heightFt: '6\'5"',  weight: 196, hometown: 'Concord, CA',        highSchool: 'Concord HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 61.4, offensive: 60.1, defensive: 63.8, confidence: 67, tier: 'V1', trend: 'up', delta: 1.0 },
    archetype: 'Two-Way Wing',
    traits: { shooting: 62, finishing: 64, playmaking: 56, defense: 65, athleticism: 72, iq: 63, tools: 77 },
    badges: [],
    stats: { ppg: 2.9, rpg: 2.6, apg: 0.6, spg: 0.8, bpg: 0.4, fgPct: 40.8, fg3Pct: 29.2, ftPct: 71.6, mpg: 9.8, gp: 17 },
    medical: 'available', eligibility: 'eligible', gpa: 2.7, credits: 14, role: 'Bench',
    systemFitOff: 66, systemFitDef: 73,
  },
  {
    id: 'p13', name: 'Elijah Santos',     initials: 'ES', number: 14, hue: 250,
    position: 'PF', classYear: 'Fr', heightFt: '6\'7"',  weight: 213, hometown: 'San Leandro, CA',    highSchool: 'San Leandro HS',
    isScholarship: false, isRedshirt: false,
    kr: { overall: 60.2, offensive: 58.7, defensive: 62.4, confidence: 68, tier: 'V1', trend: 'up', delta: 1.4 },
    archetype: 'Energy Big',
    traits: { shooting: 52, finishing: 67, playmaking: 50, defense: 66, athleticism: 74, iq: 62, tools: 80 },
    badges: ['Energy Spark'],
    stats: { ppg: 3.6, rpg: 4.2, apg: 0.5, spg: 0.3, bpg: 0.7, fgPct: 50.6, fg3Pct: 0.0, ftPct: 57.8, mpg: 13.3, gp: 20 },
    medical: 'available', eligibility: 'eligible', gpa: 2.4, credits: 15, role: 'Bench',
    systemFitOff: 70, systemFitDef: 77,
  },
  {
    id: 'p14', name: 'Kofi Mensah',       initials: 'KM', number: 33, hue: 50,
    position: 'C',  classYear: 'So', heightFt: '6\'10"', weight: 244, hometown: 'Antioch, CA',         highSchool: 'Deer Valley HS',
    isScholarship: true, isRedshirt: true,
    kr: { overall: 63.4, offensive: 60.9, defensive: 66.8, confidence: 63, tier: 'V1', trend: 'up', delta: 1.8 },
    archetype: 'Rim Protector',
    traits: { shooting: 41, finishing: 66, playmaking: 46, defense: 70, athleticism: 70, iq: 63, tools: 88 },
    badges: ['High Ceiling'],
    stats: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, fgPct: 0.0, fg3Pct: 0.0, ftPct: 0.0, mpg: 0.0, gp: 0 },
    medical: 'available', eligibility: 'eligible', gpa: 2.9, credits: 34, role: 'DNP',
    systemFitOff: 67, systemFitDef: 80,
  },
  {
    id: 'p15', name: 'Andre Voss',        initials: 'AV', number: 42, hue: 340,
    position: 'PF', classYear: 'Fr', heightFt: '6\'8"',  weight: 218, hometown: 'San Francisco, CA',   highSchool: 'Galileo HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 64.8, offensive: 62.1, defensive: 68.4, confidence: 65, tier: 'V1', trend: 'up', delta: 4.6 },
    archetype: 'Versatile Forward',
    traits: { shooting: 58, finishing: 68, playmaking: 52, defense: 71, athleticism: 75, iq: 64, tools: 82 },
    badges: ['High Ceiling'],
    stats: { ppg: 3.4, rpg: 3.8, apg: 0.4, spg: 0.2, bpg: 0.9, fgPct: 48.3, fg3Pct: 22.2, ftPct: 54.1, mpg: 11.4, gp: 15 },
    medical: 'out', medicalNote: 'Ankle sprain — 2-3 weeks', eligibility: 'eligible', gpa: 2.5, credits: 15, role: 'DNP',
    systemFitOff: 68, systemFitDef: 80,
  },
];

// ── Coaching Staff ─────────────────────────────────────────────────────────────

export const COACHING_STAFF: StaffMember[] = [
  { id: 'st1', name: 'William Middlebrooks', initials: 'WM', hue: 0,   title: 'Head Coach',              role: 'head-coach', phone: '(510) 555-0100', email: 'wmiddlebrooks@lincoln.edu' },
  { id: 'st2', name: 'Sammy Kalejaiye',      initials: 'SK', hue: 45,  title: 'Asst. Coach',             role: 'asst-coach', phone: '(510) 555-0101', email: 'skalejaiye@lincoln.edu' },
  { id: 'st3', name: 'Coach Sandra Lee',     initials: 'SL', hue: 300, title: 'Asst. Coach (Defense)',   role: 'asst-coach', phone: '(510) 555-0102', email: 'slee@lincoln.edu' },
  { id: 'st4', name: 'Coach James Wu',       initials: 'JW', hue: 170, title: 'Graduate Assistant',      role: 'grad-asst',  phone: '(510) 555-0103', email: 'jwu@lincoln.edu' },
  { id: 'st5', name: 'Dr. Keisha Brown',     initials: 'KB', hue: 130, title: 'Athletic Trainer',        role: 'trainer',    phone: '(510) 555-0104', email: 'kbrown@lincoln.edu' },
  { id: 'st6', name: 'Malik Thompson',       initials: 'MT', hue: 260, title: 'Strength & Conditioning', role: 'strength',   phone: '(510) 555-0105', email: 'mthompson@lincoln.edu' },
  { id: 'st7', name: 'Angela Rivers',        initials: 'AR', hue: 30,  title: 'Sports Info Director',    role: 'sid',        phone: '(510) 555-0106', email: 'arivers@lincoln.edu' },
];

// ── Season Schedule ───────────────────────────────────────────────────────────

export const SEASON_SCHEDULE: Game[] = [
  // ── Non-Conference (6W-4L) ──
  { id: 'g01', date: 'Nov 1',  opponent: 'Cal Maritime',               oppHue: 120, location: 'H', venue: 'Laney College',  time: '6:00 PM', result: 'W', score: '82', oppScore: '61', isConference: false },
  { id: 'g02', date: 'Nov 5',  opponent: 'Dominican Univ. California', oppHue: 50,  location: 'H', venue: 'Laney College',  time: '7:00 PM', result: 'W', score: '78', oppScore: '65', isConference: false },
  { id: 'g03', date: 'Nov 9',  opponent: 'Simpson University',         oppHue: 340, location: 'A', venue: 'Simpson Gym',    time: '6:00 PM', result: 'L', score: '61', oppScore: '72', isConference: false },
  { id: 'g04', date: 'Nov 14', opponent: 'Pacific Union College',      oppHue: 220, location: 'H', venue: 'Laney College',  time: '7:00 PM', result: 'W', score: '84', oppScore: '70', isConference: false },
  { id: 'g05', date: 'Nov 18', opponent: 'Vanguard University',        oppHue: 20,  location: 'A', venue: 'Vanguard Arena', time: '6:00 PM', result: 'L', score: '58', oppScore: '67', isConference: false },
  { id: 'g06', date: 'Nov 22', opponent: 'The Master\'s University',   oppHue: 260, location: 'A', venue: 'TMU Fieldhouse', time: '4:00 PM', result: 'L', score: '62', oppScore: '74', isConference: false },
  { id: 'g07', date: 'Nov 26', opponent: 'Westmont College',           oppHue: 80,  location: 'H', venue: 'Laney College',  time: '3:00 PM', result: 'W', score: '76', oppScore: '68', isConference: false },
  { id: 'g08', date: 'Dec 2',  opponent: 'Hope International Univ.',   oppHue: 40,  location: 'A', venue: 'HIU Gym',        time: '7:00 PM', result: 'L', score: '64', oppScore: '70', isConference: false },
  { id: 'g09', date: 'Dec 6',  opponent: 'William Jessup University',  oppHue: 180, location: 'H', venue: 'Laney College',  time: '7:00 PM', result: 'W', score: '81', oppScore: '69', isConference: false },
  { id: 'g10', date: 'Dec 10', opponent: 'Cal Maritime',               oppHue: 120, location: 'A', venue: 'Cal Maritime Gym', time: '5:00 PM', result: 'W', score: '74', oppScore: '63', isConference: false },
  // ── Conference (8W-7L) ──
  { id: 'g11', date: 'Dec 20', opponent: 'Holy Names University',      oppHue: 200, location: 'H', venue: 'Laney College',  time: '3:00 PM', result: 'W', score: '80', oppScore: '73', isConference: true },
  { id: 'g12', date: 'Jan 4',  opponent: 'Menlo College',              oppHue: 150, location: 'A', venue: 'Menlo Gym',      time: '7:00 PM', result: 'L', score: '63', oppScore: '69', isConference: true },
  { id: 'g13', date: 'Jan 9',  opponent: 'Dominican Univ. California', oppHue: 50,  location: 'H', venue: 'Laney College',  time: '7:00 PM', result: 'W', score: '88', oppScore: '76', isConference: true },
  { id: 'g14', date: 'Jan 14', opponent: 'William Jessup University',  oppHue: 180, location: 'A', venue: 'Jessup Gym',     time: '5:00 PM', result: 'L', score: '67', oppScore: '74', isConference: true },
  { id: 'g15', date: 'Jan 18', opponent: 'The Master\'s University',   oppHue: 260, location: 'H', venue: 'Laney College',  time: '7:00 PM', result: 'W', score: '77', oppScore: '65', isConference: true },
  { id: 'g16', date: 'Jan 23', opponent: 'Westmont College',           oppHue: 80,  location: 'A', venue: 'Westmont Gym',   time: '6:00 PM', result: 'L', score: '66', oppScore: '74', isConference: true },
  { id: 'g17', date: 'Jan 28', opponent: 'Holy Names University',      oppHue: 200, location: 'A', venue: 'HNU Arena',      time: '7:00 PM', result: 'L', score: '71', oppScore: '77', isConference: true },
  { id: 'g18', date: 'Feb 1',  opponent: 'Menlo College',              oppHue: 150, location: 'H', venue: 'Laney College',  time: '5:00 PM', result: 'W', score: '83', oppScore: '70', isConference: true },
  { id: 'g19', date: 'Feb 6',  opponent: 'Simpson University',         oppHue: 340, location: 'H', venue: 'Laney College',  time: '7:00 PM', result: 'L', score: '68', oppScore: '79', isConference: true },
  { id: 'g20', date: 'Feb 11', opponent: 'Dominican Univ. California', oppHue: 50,  location: 'A', venue: 'DUC Gym',        time: '6:00 PM', result: 'W', score: '70', oppScore: '63', isConference: true },
  { id: 'g21', date: 'Feb 15', opponent: 'Hope International Univ.',   oppHue: 40,  location: 'H', venue: 'Laney College',  time: '7:00 PM', result: 'L', score: '67', oppScore: '71', isConference: true },
  { id: 'g22', date: 'Feb 20', opponent: 'William Jessup University',  oppHue: 180, location: 'H', venue: 'Laney College',  time: '7:00 PM', result: 'W', score: '86', oppScore: '72', isConference: true },
  { id: 'g23', date: 'Feb 25', opponent: 'The Master\'s University',   oppHue: 260, location: 'A', venue: 'TMU Fieldhouse', time: '6:00 PM', result: 'L', score: '65', oppScore: '73', isConference: true },
  { id: 'g24', date: 'Mar 1',  opponent: 'Westmont College',           oppHue: 80,  location: 'H', venue: 'Laney College',  time: '2:00 PM', result: 'W', score: '90', oppScore: '71', isConference: true },
  { id: 'g25', date: 'Mar 6',  opponent: 'Simpson University',         oppHue: 340, location: 'A', venue: 'Simpson Gym',    time: '7:00 PM', result: 'W', score: '79', oppScore: '66', isConference: true },
  // ── Upcoming ──
  { id: 'g26', date: 'Apr 3',  opponent: 'Holy Names University',      oppHue: 200, location: 'H', venue: 'Laney College',  time: '7:00 PM', isConference: true },
  { id: 'g27', date: 'Apr 8',  opponent: 'Menlo College',              oppHue: 150, location: 'A', venue: 'Menlo Gym',      time: '5:00 PM', isConference: true },
];

// ── Recruiting Board ──────────────────────────────────────────────────────────

export const RECRUITS_BOARD: Recruit[] = [
  { id: 'r01', name: 'Jaylen Foster',    initials: 'JF', hue: 215, position: 'PG', classYear: '2026', school: 'Skyline HS', state: 'CA', heightFt: '6\'1"', weight: 180, stage: 'Committed', priority: 'Target', kr: 72.4, krConf: 71, archetype: 'Playmaking Guard', systemFit: 84, lastContact: 'Mar 24', contactType: 'visit', gpa: 3.2, offers: ['Lincoln', 'Holy Names', 'Menlo'], stars: 2, hasFilm: true, notes: 'Verbally committed 3/20. Local Oakland kid — great culture fit.' },
  { id: 'r02', name: 'Amari Davis',      initials: 'AD', hue: 160, position: 'C',  classYear: '2026', school: 'De La Salle HS', state: 'CA', heightFt: '6\'9"', weight: 238, stage: 'Offered', priority: 'Target', kr: 68.1, krConf: 68, archetype: 'Rim Protector', systemFit: 88, lastContact: 'Mar 21', contactType: 'call', gpa: 2.8, offers: ['Lincoln', 'Holy Names', 'Pacific Union'], stars: 2, hasFilm: true, notes: 'Ideal rim protector fit. Needs academic clearance check.' },
  { id: 'r03', name: 'Deon Mitchell',    initials: 'DM', hue: 330, position: 'SF', classYear: '2026', school: 'Oakland HS', state: 'CA', heightFt: '6\'6"', weight: 207, stage: 'Evaluating', priority: 'Target', kr: 74.8, krConf: 65, archetype: 'Two-Way Wing', systemFit: 80, lastContact: 'Mar 18', contactType: 'text', gpa: 3.0, offers: ['Lincoln', 'Dominican CA', 'Holy Names'], stars: 3, hasFilm: true, notes: 'Athletic two-way wing. Multiple GAAC schools involved.' },
  { id: 'r04', name: 'Terrance Bell',    initials: 'TB', hue: 50,  position: 'SG', classYear: '2026', school: 'Sheldon HS', state: 'CA', heightFt: '6\'3"', weight: 190, stage: 'Offered', priority: 'Offer', kr: 66.8, krConf: 67, archetype: 'Spot-Up Shooter', systemFit: 86, lastContact: 'Mar 15', contactType: 'call', gpa: 2.7, offers: ['Lincoln', 'Menlo', 'Vanguard'], stars: 2, hasFilm: true, notes: 'Pure shooter — exactly what system needs. Must stay on.' },
  { id: 'r05', name: 'Kwame Asante',     initials: 'KA', hue: 280, position: 'PF', classYear: '2026', school: 'St. Mary\'s HS', state: 'CA', heightFt: '6\'8"', weight: 218, stage: 'Evaluating', priority: 'Target', kr: 70.2, krConf: 63, archetype: 'Versatile Forward', systemFit: 83, lastContact: 'Mar 12', contactType: 'visit', gpa: 3.4, offers: ['Lincoln', 'Holy Names', 'Westmont'], stars: 2, hasFilm: true, notes: 'Unofficial visit went well. Parents are driving factor.' },
  { id: 'r06', name: 'Chris Odum',       initials: 'CO', hue: 130, position: 'PG', classYear: '2027', school: 'El Cerrito HS', state: 'CA', heightFt: '6\'0"', weight: 173, stage: 'Identified', priority: 'Watch', kr: 64.2, krConf: 59, archetype: 'PNR Ball Handler', systemFit: 79, lastContact: 'Mar 8', contactType: 'email', gpa: 2.9, offers: [], stars: 2, hasFilm: false, notes: 'Watching closely. Will evaluate again at spring showcase.' },
  { id: 'r07', name: 'Miles Jackson',    initials: 'MJ', hue: 0,   position: 'SG', classYear: '2026', school: 'Salesian HS', state: 'CA', heightFt: '6\'2"', weight: 188, stage: 'Evaluating', priority: 'Watch', kr: 67.3, krConf: 62, archetype: 'Shot-Creating Wing', systemFit: 76, lastContact: 'Mar 5', contactType: 'call', gpa: 3.1, offers: ['Lincoln', 'Holy Names', 'Pacific Union'], stars: 2, hasFilm: true, notes: 'East Bay kid — close to home. Decent system fit.' },
  { id: 'r08', name: 'Jamal Green',      initials: 'JG', hue: 195, position: 'C',  classYear: '2025', school: 'JUCO — Laney College', state: 'CA', heightFt: '6\'9"', weight: 238, stage: 'Offered', priority: 'Offer', kr: 63.8, krConf: 70, archetype: 'Energy Big', systemFit: 74, lastContact: 'Mar 22', contactType: 'call', gpa: 2.4, offers: ['Lincoln', 'Dominican CA', 'Menlo'], stars: 2, hasFilm: true, notes: 'Local JUCO big. Could fill depth behind Paul Diomande.' },
  { id: 'r09', name: 'Rashad Pope',      initials: 'RP', hue: 260, position: 'SF', classYear: '2026', school: 'Castlemont HS', state: 'CA', heightFt: '6\'5"', weight: 199, stage: 'Identified', priority: 'Watch', kr: 63.1, krConf: 56, archetype: 'Defensive Anchor', systemFit: 71, lastContact: 'Feb 28', contactType: 'email', gpa: 2.7, offers: [], stars: 2, hasFilm: false, notes: 'Local Oakland kid. Invite to summer camp.' },
  { id: 'r10', name: 'Tavion Howard',    initials: 'TH', hue: 80,  position: 'PG', classYear: '2026', school: 'Mt. Eden HS', state: 'CA', heightFt: '5\'11"', weight: 170, stage: 'Signed', priority: 'Target', kr: 64.1, krConf: 63, archetype: 'Playmaking Guard', systemFit: 77, lastContact: 'Mar 20', contactType: 'visit', gpa: 2.9, offers: ['Lincoln', 'Holy Names'], stars: 2, hasFilm: true, notes: 'Signed NLI. East Bay kid ready to contribute as freshman.' },
  { id: 'r11', name: 'Omari Stephens',   initials: 'OS', hue: 340, position: 'PF', classYear: '2027', school: 'Bishop O\'Dowd HS', state: 'CA', heightFt: '6\'8"', weight: 215, stage: 'Identified', priority: 'Watch', kr: undefined, krConf: undefined, archetype: undefined, systemFit: undefined, lastContact: 'Feb 20', contactType: 'email', gpa: 3.3, offers: [], stars: 2, hasFilm: false, notes: 'Early look. Coach Kalejaiye is lead recruiter.' },
  { id: 'r12', name: 'Devon White',      initials: 'DW', hue: 40,  position: 'SG', classYear: '2026', school: 'James Logan HS', state: 'CA', heightFt: '6\'3"', weight: 186, stage: 'Declined', priority: 'Backup', kr: 65.4, krConf: 69, archetype: 'Spot-Up Shooter', systemFit: 82, lastContact: 'Mar 10', contactType: 'call', gpa: 3.0, offers: ['Lincoln', 'Holy Names'], stars: 2, hasFilm: true, notes: 'Chose Holy Names. Keep on radar for portal.' },
  { id: 'r13', name: 'Kobe Lawrence',    initials: 'KL', hue: 170, position: 'C',  classYear: '2025', school: 'Transfer — Dominican CA', state: 'CA', heightFt: '6\'10"', weight: 245, stage: 'Offered', priority: 'Target', kr: 67.8, krConf: 75, archetype: 'Rim Protector', systemFit: 86, lastContact: 'Mar 25', contactType: 'call', gpa: 2.5, offers: ['Lincoln', 'Menlo', 'William Jessup'], stars: 2, hasFilm: true, notes: 'Portal target. Could add depth behind Paul. Decision by Apr 5.' },
  { id: 'r14', name: 'Elias Ngozi',      initials: 'EN', hue: 220, position: 'SF', classYear: '2026', school: 'Encinal HS', state: 'CA', heightFt: '6\'5"', weight: 202, stage: 'Evaluating', priority: 'Backup', kr: 62.4, krConf: 60, archetype: 'Two-Way Wing', systemFit: 73, lastContact: 'Mar 1', contactType: 'text', gpa: 2.8, offers: [], stars: 2, hasFilm: true, notes: 'Backup wing option. Needs another evaluation camp.' },
  { id: 'r15', name: 'Dante Freeman',    initials: 'DF', hue: 300, position: 'PG', classYear: '2026', school: 'Moreau Catholic HS', state: 'CA', heightFt: '6\'0"', weight: 176, stage: 'Verbal', priority: 'Offer', kr: 68.3, krConf: 64, archetype: 'Playmaking Guard', systemFit: 78, lastContact: 'Mar 23', contactType: 'visit', gpa: 3.4, offers: ['Lincoln', 'Holy Names', 'Pacific Union'], stars: 2, hasFilm: true, notes: 'Verbal commitment from March showcase visit.' },
];

// ── Transfer Portal ────────────────────────────────────────────────────────────

export const PORTAL_PLAYERS: PortalPlayer[] = [
  { id: 'pp1', name: 'Brandon Cole',   initials: 'BC', hue: 210, position: 'PG', prevSchool: 'Holy Names University',      conference: 'GAAC',  level: 'D2', stats: { ppg: 10.2, rpg: 2.8, apg: 4.9 }, kr: 68.4, systemFit: 80, enteredDate: 'Mar 15', eligible: 'immediately' },
  { id: 'pp2', name: 'Kobe Lawrence',  initials: 'KL', hue: 170, position: 'C',  prevSchool: 'Dominican Univ. California', conference: 'GAAC',  level: 'D2', stats: { ppg: 7.8, rpg: 6.4, apg: 0.8 }, kr: 67.8, systemFit: 86, enteredDate: 'Mar 12', eligible: 'immediately' },
  { id: 'pp3', name: 'Antoine Wells',  initials: 'AW', hue: 330, position: 'SF', prevSchool: 'Menlo College',              conference: 'GAAC',  level: 'D2', stats: { ppg: 8.4, rpg: 4.2, apg: 1.1 }, kr: 63.2, systemFit: 72, enteredDate: 'Mar 10', eligible: 'immediately' },
  { id: 'pp4', name: 'Mike Santos',    initials: 'MS', hue: 50,  position: 'SG', prevSchool: 'William Jessup University',  conference: 'GAAC',  level: 'D2', stats: { ppg: 12.6, rpg: 2.5, apg: 2.9 }, kr: 70.1, systemFit: 83, enteredDate: 'Mar 8',  eligible: 'immediately' },
  { id: 'pp5', name: 'Quincy Rucker',  initials: 'QR', hue: 130, position: 'PF', prevSchool: 'Vanguard University',        conference: 'GAAC',  level: 'D2', stats: { ppg: 7.1, rpg: 5.5, apg: 0.9 }, kr: 60.8, systemFit: 75, enteredDate: 'Mar 5',  eligible: 'sit-out' },
  { id: 'pp6', name: 'DeShawn Pryor',  initials: 'DP', hue: 290, position: 'PG', prevSchool: 'Laney College',              conference: 'NorCal JUCO', level: 'JUCO', stats: { ppg: 14.8, rpg: 3.7, apg: 6.8 }, kr: 66.3, systemFit: 77, enteredDate: 'Mar 3',  eligible: 'immediately' },
  { id: 'pp7', name: 'Isaiah Moore',   initials: 'IM', hue: 0,   position: 'C',  prevSchool: 'Westmont College',           conference: 'GAAC',  level: 'D2', stats: { ppg: 5.6, rpg: 5.9, apg: 0.6 }, kr: 62.1, systemFit: 69, enteredDate: 'Feb 28', eligible: 'immediately' },
  { id: 'pp8', name: 'Lamar Dixon',    initials: 'LD', hue: 100, position: 'SG', prevSchool: 'Simpson University',         conference: 'GAAC',  level: 'D2', stats: { ppg: 10.4, rpg: 2.9, apg: 1.9 }, kr: 65.9, systemFit: 78, enteredDate: 'Feb 25', eligible: 'immediately' },
  { id: 'pp9', name: 'Victor Nkosi',   initials: 'VN', hue: 200, position: 'PF', prevSchool: 'Hope International Univ.',   conference: 'GAAC',  level: 'D2', stats: { ppg: 8.1, rpg: 6.3, apg: 1.3 }, kr: 64.7, systemFit: 74, enteredDate: 'Feb 22', eligible: 'immediately' },
  { id: 'pp10', name: 'Corey West',    initials: 'CW', hue: 250, position: 'SF', prevSchool: 'The Master\'s University',   conference: 'GAAC',  level: 'D2', stats: { ppg: 6.8, rpg: 3.6, apg: 0.7 }, kr: 61.4, systemFit: 68, enteredDate: 'Feb 20', eligible: 'sit-out' },
];

// ── Scouting Report: Holy Names University ────────────────────────────────────

export const SCOUT_HOLY_NAMES = {
  team:          'Holy Names University',
  record:        '12-13',
  confRecord:    '7-8',
  standing:      '6th GAAC',
  dataConf:      71,
  dataTier:      'V1+' as DataTier,
  offense: {
    systemName:  'Motion Offense',
    pace:        64,
    primaryInit: 'Marcus Grant (#5)',
    shotDiet:    { rim: 31, mid: 28, three: 26, ft: 15 },
    pressurePoints: ['Force right on their primary handler', 'Stay attached off screens', 'Contest midrange early'],
    description: 'Ball-movement oriented motion offense with deliberate pace, relies on inside-out passing to create 3PT looks.',
  },
  defense: {
    systemName:  'Man-to-Man',
    pressure:    'Half Court',
    coverages:   ['Man-to-man (primary)', 'Occasional zone late game'],
    helpRules:   'Tag the roller, protect the rim',
    rebounding:  'Box out and outlet quickly',
    foulProfile: 'Reach-prone guards (avg 16 FTA allowed per game)',
  },
  topActions: [
    { rank: 1, name: 'Grant Drive/Kick',   freq: '24%', our_counter: 'Contain, no open 3s', risk: 'High — 46% success rate' },
    { rank: 2, name: 'Cross Screen Entry', freq: '17%', our_counter: 'Trail and deny on wing catches', risk: 'Medium' },
    { rank: 3, name: 'Thompson Post-Up',   freq: '13%', our_counter: 'Front early, double if needed', risk: 'Medium — 49% success rate' },
    { rank: 4, name: 'Williams 3PT',       freq: '12%', our_counter: 'Chase off screens, no open looks', risk: 'High if open (39% 3PT)' },
    { rank: 5, name: 'Transition Layups',  freq: '8%',  our_counter: 'Sprint back, stop secondary break', risk: 'Medium in transition' },
  ],
  attacks: ['Attack man — drive and kick to our shooters', 'PNR vs their bigs in PnP', 'Attack reach-prone guards — get to the line', 'Push pace off turnovers before they set up'],
  deny:    ['Grant drive lanes (primary initiator)', 'Williams corner catch-and-shoot', 'Thompson post entry on the block', 'Transition layups — get back fast'],
  rotation: [
    { name: 'Marcus Grant',   pos: 'PG', kr: 70.4, archetype: 'Playmaking Guard',   threat: 'Drive/kick initiator — 14 PPG' },
    { name: 'David Thompson', pos: 'C',  kr: 65.8, archetype: 'Post Scorer',         threat: 'Post up — 9 PPG 7 RPG' },
    { name: 'J. Williams',    pos: 'SG', kr: 62.3, archetype: 'Spot-Up Shooter',     threat: 'Corner 3 threat — 39%' },
    { name: 'R. Jackson',     pos: 'SF', kr: 59.7, archetype: 'Energy Big',           threat: 'Hustle plays, offensive boards' },
    { name: 'T. Okafor',      pos: 'PF', kr: 58.4, archetype: 'Versatile Forward',   threat: 'Mid-range — 34% FG' },
  ],
};

// ── NIL Opportunities ─────────────────────────────────────────────────────────

export const NIL_OPPORTUNITIES: NILOpportunity[] = [
  { id: 'nil1', brand: 'Oakland Roots',     brandHue: 0,   type: 'ambassador',   amount: 3500, description: 'Ambassador for Oakland Roots SC community outreach', deliverables: '4 social posts, 1 appearance at youth event', deadline: 'Apr 15', openToAll: false, targetPos: 'PG' },
  { id: 'nil2', brand: 'Oaktown Eats',      brandHue: 30,  type: 'social-post',  amount: 700,  description: 'Sponsored social media content — local restaurant', deliverables: '2 Instagram posts, 1 Story', deadline: 'Apr 5', openToAll: true },
  { id: 'nil3', brand: 'East Bay Credit Union', brandHue: 0, type: 'endorsement', amount: 1800, description: 'Local credit union athlete endorsement', deliverables: 'Photo shoot, 3 social posts, 1 in-branch appearance', deadline: 'Apr 20', openToAll: true },
  { id: 'nil4', brand: 'Bay Area Hoops Talk', brandHue: 200, type: 'appearance', amount: 450, description: 'Guest spot on weekly Bay Area basketball podcast', deliverables: '1-hour podcast appearance', deadline: 'Apr 8', openToAll: false, targetPos: 'C' },
  { id: 'nil5', brand: 'Fruitvale Cuts',    brandHue: 130, type: 'content',      amount: 550,  description: 'Social media content for local Oakland barbershop', deliverables: '3 short-form video clips, 2 posts', deadline: 'Apr 12', openToAll: true },
];

// ── Active NIL Deals ───────────────────────────────────────────────────────────

export const NIL_DEALS: NILDeal[] = [
  { id: 'nd1', playerId: 'p01', playerName: 'Laolu Kalejaiye', brand: 'Gatorade',           type: 'ambassador',  amount: 3000, status: 'in-progress', compliance: 'approved', startDate: 'Feb 1',  endDate: 'May 30', deliverables: ['3 social posts', '1 event appearance', 'Brand tag in all game-day content'], completed: 67 },
  { id: 'nd2', playerId: 'p02', playerName: 'Claude McKesey', brand: 'East Bay Sports',    type: 'social-post', amount: 900,  status: 'completed',   compliance: 'approved', startDate: 'Jan 15', endDate: 'Mar 31', deliverables: ['4 Instagram posts', '1 Reel'], completed: 100 },
  { id: 'nd3', playerId: 'p05', playerName: 'Paul Diomande',  brand: 'Under Armour Campus', type: 'endorsement', amount: 2400, status: 'in-progress', compliance: 'pending',  startDate: 'Mar 1',  endDate: 'Jun 30', deliverables: ['Photo shoot (complete)', '2 social posts', '1 campus store appearance'], completed: 40 },
  { id: 'nd4', playerId: 'p03', playerName: 'Samuel Manzo',   brand: 'Jordan Brand',       type: 'ambassador',  amount: 4200, status: 'in-progress', compliance: 'approved', startDate: 'Feb 15', endDate: 'Aug 15', deliverables: ['4 social posts', '2 campus store appearances', 'Brand ambassador bio'], completed: 50 },
  { id: 'nd5', playerId: 'p04', playerName: 'Samuel Wall',    brand: 'Nike Campus',        type: 'endorsement', amount: 2800, status: 'in-progress', compliance: 'pending',  startDate: 'Mar 10', endDate: 'Jul 31', deliverables: ['Photo shoot', '3 social posts', '1 campus event'], completed: 25 },
  { id: 'nd6', playerId: 'p06', playerName: 'Brandon Williams', brand: 'Bay Area Hoops Talk', type: 'social-post', amount: 800, status: 'completed',   compliance: 'approved', startDate: 'Jan 20', endDate: 'Mar 1',  deliverables: ['3 Instagram posts', '1 Twitter thread'], completed: 100 },
];

// ── Fundraising Campaigns ──────────────────────────────────────────────────────

export const BOOSTER_CAMPAIGNS: Campaign[] = [
  { id: 'bc1', name: 'New Practice Facility',       goal: 1200000, raised: 340000, donors: 218, status: 'active',    deadline: 'Dec 2026', desc: 'Fund upgrades to Laney College practice facilities, including dedicated locker rooms, film room access, and expanded weight training resources for the Oaklanders program.', fundId: 'facilities' },
  { id: 'bc2', name: 'Senior Night Celebration',    goal: 4000,    raised: 3200,   donors: 174, status: 'active',    deadline: 'Apr 15',   desc: 'Support the celebration for our seniors on Senior Night at Laney College.', fundId: 'general' },
  { id: 'bc3', name: 'GAAC Tournament Travel Fund', goal: 18000,   raised: 11400,  donors: 128, status: 'active',    deadline: 'Apr 10',   desc: 'Help cover travel and lodging expenses for the GAAC Tournament postseason run.', fundId: 'travel' },
];

// ── Merch Products ─────────────────────────────────────────────────────────────

export const MERCH_PRODUCTS: MerchProduct[] = [
  { id: 'm01', name: 'LU Oaklanders Jersey #1',     category: 'Apparel',     price: 69.99,  colors: ['Maroon', 'White'],        inStock: true,  isFeatured: true,  isLimited: false, rating: 4.8, reviews: 78 },
  { id: 'm02', name: 'Oaklanders Basketball Hoodie', category: 'Apparel',    price: 49.99,  colors: ['Maroon', 'Gray'],         inStock: true,  isFeatured: true,  isLimited: false, rating: 4.7, reviews: 54 },
  { id: 'm03', name: 'LU Oaklanders Snapback',       category: 'Headwear',   price: 27.99,  colors: ['Maroon', 'Red'],          inStock: true,  isFeatured: false, isLimited: false, rating: 4.5, reviews: 41 },
  { id: 'm04', name: 'Oakland Classic T-Shirt',      category: 'Apparel',    price: 29.99,  colors: ['Maroon', 'White', 'Red'], inStock: true,  isFeatured: true,  isLimited: true,  rating: 4.9, reviews: 33 },
  { id: 'm05', name: 'Oaklanders Beanie',            category: 'Headwear',   price: 21.99,  colors: ['Maroon'],                 inStock: true,  isFeatured: false, isLimited: false, rating: 4.4, reviews: 22 },
  { id: 'm06', name: 'LU Logo Backpack',             category: 'Accessories', price: 44.99, colors: ['Maroon'],                 inStock: true,  isFeatured: false, isLimited: false, rating: 4.6, reviews: 19 },
  { id: 'm07', name: 'Game-Worn Paul Diomande #21 Jersey', category: 'Special', price: 249.99, colors: ['Maroon'],             inStock: true,  isFeatured: false, isLimited: true,  rating: 5.0, reviews: 3 },
  { id: 'm08', name: 'Oaklanders Water Bottle',      category: 'Accessories', price: 18.99, colors: ['Maroon', 'White'],       inStock: true,  isFeatured: false, isLimited: false, rating: 4.3, reviews: 38 },
  { id: 'm09', name: 'Autographed Laolu Kalejaiye Ball', category: 'Special', price: 129.99, colors: ['White'],                 inStock: true,  isFeatured: true,  isLimited: true,  rating: 5.0, reviews: 5 },
  { id: 'm10', name: 'LU Oaklanders Car Decal Pack', category: 'Accessories', price: 11.99, colors: ['Maroon'],               inStock: true,  isFeatured: false, isLimited: false, rating: 4.2, reviews: 29 },
];

// ── Tickets ────────────────────────────────────────────────────────────────────

export const TICKET_GAMES: TicketGame[] = [
  {
    gameId: 'g26', opponent: 'Holy Names University', date: 'Apr 3, 2026', time: '7:00 PM', venue: 'Laney College',
    types: [
      { label: 'General Admission', price: 10, available: 280 },
      { label: 'Reserved',          price: 18, available: 72 },
      { label: 'Student',           price: 5,  available: 100 },
    ],
  },
  {
    gameId: 'g27', opponent: 'Menlo College', date: 'Apr 8, 2026', time: '5:00 PM', venue: 'Menlo Gym',
    types: [
      { label: 'General Admission', price: 10, available: 420 },
      { label: 'Reserved',          price: 18, available: 110 },
      { label: 'Courtside',         price: 60, available: 8 },
      { label: 'Student',           price: 5,  available: 160 },
    ],
  },
];

// ── Fan Rewards Leaderboard ────────────────────────────────────────────────────

export const FAN_REWARDS: FanReward[] = [
  { id: 'fr1', name: 'Kenneth Davis',    points: 4820, rank: 1, hue: 215 },
  { id: 'fr2', name: 'Sandra Williams', points: 3940, rank: 2, hue: 280 },
  { id: 'fr3', name: 'Robert Thompson', points: 3210, rank: 3, hue: 45  },
  { id: 'fr4', name: 'Brenda Harris',   points: 2880, rank: 4, hue: 130 },
  { id: 'fr5', name: 'James Moore',     points: 2641, rank: 5, hue: 340 },
];

// ── NIL Activity Feed ─────────────────────────────────────────────────────────

export const NIL_ACTIVITY: NILActivity[] = [
  { id: 'na1', playerId: 'p01', playerName: 'Laolu Kalejaiye', initials: 'LK', hue: 35,  action: 'Signed 4-month extension',        brand: 'Gatorade',           timestamp: '2h ago',    amount: 3600 },
  { id: 'na2', playerId: 'p03', playerName: 'Samuel Manzo',   initials: 'SM', hue: 280, action: 'Posted 2 brand reels — 480K views', brand: 'Jordan Brand',      timestamp: '5h ago'               },
  { id: 'na3', playerId: 'p05', playerName: 'Paul Diomande',  initials: 'PD', hue: 20,  action: 'Completed photo shoot',            brand: 'Under Armour Campus', timestamp: 'Yesterday'           },
  { id: 'na4', playerId: 'p02', playerName: 'Claude McKesey', initials: 'CM', hue: 160, action: 'Deal paid out',                    brand: 'East Bay Sports',    timestamp: 'Yesterday', amount: 900 },
  { id: 'na5', playerId: 'p04', playerName: 'Samuel Wall',    initials: 'SW', hue: 30,  action: 'NIL compliance submitted',         brand: 'Nike Campus',        timestamp: '2 days ago'           },
];

// ── Fan Experiences ────────────────────────────────────────────────────────────

export const FAN_EXPERIENCES: FanExperience[] = [
  { id: 'fe1', playerId: 'p01', playerName: 'Laolu Kalejaiye', initials: 'LK', hue: 35,  type: 'shoutout',    title: 'Personalized Shoutout',  description: 'Laolu records a personal video shoutout for you or a friend — delivered in 48 hours.', price: 20, spotsLeft: 5,  isRaffle: false },
  { id: 'fe2', playerId: 'p05', playerName: 'Paul Diomande',  initials: 'PD', hue: 20,  type: 'signed-item', title: 'Signed Jersey #21',       description: 'Authentic game jersey hand-signed by Paul. Includes certificate of authenticity.',      price: 45, spotsLeft: 0,  isRaffle: false },
  { id: 'fe3', playerId: 'p03', playerName: 'Samuel Manzo',   initials: 'SM', hue: 280, type: 'raffle',      title: 'Meet & Greet Raffle',     description: 'Win a 15-min meet & greet with Samuel at Laney College. Monthly drawing.',              price: 10, spotsLeft: 14, isRaffle: true  },
  { id: 'fe4', playerId: 'p02', playerName: 'Claude McKesey', initials: 'CM', hue: 160, type: 'training',    title: '1-on-1 Training Session', description: 'Book a private 45-min shooting session with Claude at Laney College.',                    price: 65, spotsLeft: 3,  isRaffle: false },
];

// ── Practice Plan ─────────────────────────────────────────────────────────────

export const TODAY_PRACTICE = {
  date:   'Today, Mar 30',
  time:   '3:30 PM',
  venue:  'Laney College',
  focus:  'Holy Names Scout + Transition Offense',
  items: [
    { time: '3:30', duration: 15, label: 'Warmup + Stretch',                       category: 'conditioning' },
    { time: '3:45', duration: 20, label: 'Holy Names Film Review',                 category: 'film'         },
    { time: '4:05', duration: 25, label: 'Man-Defense Breakdown — Grant Contain',  category: 'defense'      },
    { time: '4:30', duration: 20, label: 'Transition Offense Reps',                category: 'offense'      },
    { time: '4:50', duration: 15, label: 'PNR Execution — Laolu/Paul',             category: 'offense'      },
    { time: '5:05', duration: 20, label: '5-on-5 Scrimmage (scout defense)',       category: 'scrimmage'    },
    { time: '5:25', duration: 10, label: 'Free Throws + Cooldown',                 category: 'conditioning' },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find(p => p.id === id);
}

export function getStarters(): Player[] {
  return PLAYERS.filter(p => p.role === 'Starter');
}

export function getRotation(): Player[] {
  return PLAYERS.filter(p => p.role !== 'DNP');
}

export function getPastGames(): Game[] {
  return SEASON_SCHEDULE.filter(g => g.result).reverse().slice(0, 3);
}

export function getUpcomingGames(): Game[] {
  return SEASON_SCHEDULE.filter(g => !g.result);
}

export function getStageCounts(): Record<RecruitStage, number> {
  const counts: Partial<Record<RecruitStage, number>> = {};
  RECRUITS_BOARD.forEach(r => { counts[r.stage] = (counts[r.stage] ?? 0) + 1; });
  return counts as Record<RecruitStage, number>;
}

export function rosterHealthSummary(): { available: number; limited: number; out: number } {
  const p = PLAYERS.filter(p => !p.isRedshirt);
  return {
    available: p.filter(x => x.medical === 'available').length,
    limited:   p.filter(x => x.medical === 'limited').length,
    out:       p.filter(x => x.medical === 'out').length,
  };
}

export function formatKR(kr: number): string {
  return kr.toFixed(1);
}

export function krTierColor(overall: number): string {
  if (overall >= 80) return '#5A8A6E';
  if (overall >= 72) return '#1A1714';
  if (overall >= 62) return '#D97757';
  return '#B85C5C';
}

export function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

export function stageColor(stage: RecruitStage): string {
  switch (stage) {
    case 'Committed': case 'Signed':    return '#5A8A6E';
    case 'Offered':   case 'Verbal':    return '#1A1714';
    case 'Evaluating':                  return '#D97757';
    case 'Identified':                  return '#1A1714';
    case 'Declined':                    return '#B85C5C';
    default:                            return '#1A1714';
  }
}

export function priorityColor(p: RecruitPriority): string {
  switch (p) {
    case 'Target': return '#D97757';
    case 'Offer':  return '#1A1714';
    case 'Watch':  return '#1A1714';
    case 'Backup': return '#B85C5C';
  }
}

export const SCHOLARSHIP_ALLOCATIONS: { playerId: string; pct: number; tier: 'Core' | 'Rotation' | 'Depth' | 'Development' }[] = [
  { playerId: 'p01', pct: 100, tier: 'Core' },
  { playerId: 'p02', pct: 100, tier: 'Core' },
  { playerId: 'p05', pct: 100, tier: 'Core' },
  { playerId: 'p03', pct: 80,  tier: 'Rotation' },
  { playerId: 'p04', pct: 80,  tier: 'Rotation' },
  { playerId: 'p07', pct: 60,  tier: 'Rotation' },
  { playerId: 'p06', pct: 60,  tier: 'Development' },
  { playerId: 'p08', pct: 40,  tier: 'Depth' },
  { playerId: 'p09', pct: 40,  tier: 'Depth' },
  { playerId: 'p10', pct: 60,  tier: 'Rotation' },
  { playerId: 'p12', pct: 40,  tier: 'Development' },
  { playerId: 'p14', pct: 50,  tier: 'Depth' },
  { playerId: 'p15', pct: 80,  tier: 'Development' },
];

export const DEVELOPMENT_PRIORITIES: { playerId: string; priorities: { trait: string; current: number; target: number }[] }[] = [
  { playerId: 'p01', priorities: [{ trait: '3PT Off Dribble', current: 82, target: 90 }, { trait: 'On-Ball Defense', current: 76, target: 84 }, { trait: 'Playmaking', current: 76, target: 82 }] },
  { playerId: 'p03', priorities: [{ trait: 'Spot-Up 3PT', current: 60, target: 72 }, { trait: 'Post Moves', current: 55, target: 65 }, { trait: 'FT%', current: 70, target: 77 }] },
  { playerId: 'p05', priorities: [{ trait: 'FT%', current: 63, target: 73 }, { trait: 'Mid-Range', current: 50, target: 60 }, { trait: 'Playmaking', current: 59, target: 66 }] },
  { playerId: 'p06', priorities: [{ trait: 'PNR Reads', current: 76, target: 84 }, { trait: '3PT Volume', current: 70, target: 78 }, { trait: 'Transition D', current: 66, target: 74 }] },
];

// ── Backward-compat alias ─────────────────────────────────────────────────────
export const SCOUT_HOWARD = SCOUT_HOLY_NAMES;
