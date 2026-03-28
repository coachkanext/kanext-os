/**
 * Mock data for LU Men's Basketball — Sports Mode Row 2
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
  school:         'Lincoln University',
  mascot:         'Lions',
  record:         '18-9',
  conferenceRec:  '11-5',
  hue:            220,
  colors:         { primary: '#003A63', secondary: '#B8942C' },
  conference:     'MEAC',
  confStanding:   '2nd',
};

export const TEAM_KR = {
  overall:    78.4,
  offensive:  76.2,
  defensive:  80.1,
  trend:      'up' as const,
  delta:      1.3,
  seasonHigh: 81.2,
  seasonLow:  71.8,
  history:    [71.8, 73.2, 74.9, 74.1, 76.3, 77.0, 76.8, 78.1, 78.4],
};

export const TEAM_SYSTEM = {
  offense: { name: 'PNR Motion',  locked: true,  confidence: 91, pace: 68, primary: 'Pick-and-Roll', secondary: 'Spot-Up', transition: 18 },
  defense: { name: 'Switch Man',  locked: true,  confidence: 88, pressure: 'Half Court', help: 'Rotate', rebounding: 'Box Out Man' },
  offDesc: 'High-volume PNR creation off ball-handler actions, kick-outs to shooters, and transition offense.',
  defDesc: 'Switch-heavy man defense with strong help-side rotation and elite rim protection.',
  offCover: ['PNR creation', '3PT volume', 'Transition offense', 'Free throw generation'],
  offGaps:  ['Post scoring', 'Secondary ball-handler without starter'],
  defCover: ['Rim protection', 'Switch versatility', 'Perimeter contest rate'],
  defGaps:  ['Pressure defense', 'Full-court press'],
  fragility: ['If PG sits, PNR creation drops ~35%', 'Zone offense needs development'],
};

export const NEXT_GAME = {
  opponent:   'Howard University',
  oppHue:     350,
  date:       'Apr 1, 2026',
  time:       '7:00 PM',
  venue:      'Burr Gymnasium',
  location:   'A' as const,
  oppRecord:  '15-12',
  oppConfRec: '9-7',
  confStand:  '4th',
  countdown:  '5d 14h',
  isConference: true,
};

// ── Players ───────────────────────────────────────────────────────────────────

export const PLAYERS: Player[] = [
  {
    id: 'p01', name: 'Marcus Johnson',    initials: 'MJ', number: 1,  hue: 215,
    position: 'PG', classYear: 'Jr', heightFt: '6\'2"',  weight: 185, hometown: 'Atlanta, GA',   highSchool: 'Westlake HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 84.2, offensive: 87.1, defensive: 79.4, confidence: 88, tier: 'V2', trend: 'up', delta: 2.1 },
    archetype: 'PNR Ball Handler',
    traits: { shooting: 78, finishing: 81, playmaking: 88, defense: 74, athleticism: 82, iq: 85, tools: 76 },
    badges: ['Primary Creator', 'Clutch Performer', 'PNR Maestro'],
    stats: { ppg: 17.4, rpg: 4.1, apg: 6.8, spg: 1.4, bpg: 0.2, fgPct: 45.2, fg3Pct: 36.8, ftPct: 82.1, mpg: 33.4, gp: 27 },
    medical: 'available', eligibility: 'eligible', gpa: 3.1, credits: 78, role: 'Starter',
    systemFitOff: 94, systemFitDef: 82,
  },
  {
    id: 'p02', name: 'Devon Hayes',       initials: 'DH', number: 3,  hue: 160,
    position: 'SG', classYear: 'Sr', heightFt: '6\'4"',  weight: 195, hometown: 'Baltimore, MD',  highSchool: 'Dunbar HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 79.8, offensive: 81.4, defensive: 77.2, confidence: 92, tier: 'V2', trend: 'flat', delta: 0.2 },
    archetype: 'Shot-Creating Wing',
    traits: { shooting: 82, finishing: 77, playmaking: 74, defense: 76, athleticism: 80, iq: 81, tools: 78 },
    badges: ['Elite Shooter', 'Shot Creator', 'Senior Leader'],
    stats: { ppg: 14.8, rpg: 3.2, apg: 2.9, spg: 1.1, bpg: 0.3, fgPct: 44.7, fg3Pct: 39.2, ftPct: 86.4, mpg: 30.8, gp: 27 },
    medical: 'available', eligibility: 'eligible', gpa: 3.4, credits: 110, role: 'Starter',
    systemFitOff: 88, systemFitDef: 79,
  },
  {
    id: 'p03', name: 'Elijah Washington', initials: 'EW', number: 5,  hue: 280,
    position: 'SF', classYear: 'So', heightFt: '6\'7"',  weight: 210, hometown: 'Richmond, VA',  highSchool: 'John Marshall HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 74.6, offensive: 72.3, defensive: 78.1, confidence: 85, tier: 'V2', trend: 'up', delta: 3.4 },
    archetype: 'Two-Way Wing',
    traits: { shooting: 69, finishing: 74, playmaking: 66, defense: 81, athleticism: 79, iq: 76, tools: 82 },
    badges: ['Defensive Stopper', 'Length Weapon', 'Developing Star'],
    stats: { ppg: 9.6, rpg: 5.8, apg: 1.4, spg: 1.8, bpg: 0.9, fgPct: 48.1, fg3Pct: 31.4, ftPct: 71.2, mpg: 26.5, gp: 27 },
    medical: 'available', eligibility: 'eligible', gpa: 2.9, credits: 34, role: 'Starter',
    systemFitOff: 71, systemFitDef: 91,
  },
  {
    id: 'p04', name: 'Jordan Williams',   initials: 'JW', number: 11, hue: 30,
    position: 'PF', classYear: 'Jr', heightFt: '6\'8"',  weight: 225, hometown: 'Charlotte, NC', highSchool: 'Myers Park HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 77.3, offensive: 74.8, defensive: 80.9, confidence: 87, tier: 'V2', trend: 'up', delta: 1.8 },
    archetype: 'Versatile Forward',
    traits: { shooting: 72, finishing: 79, playmaking: 68, defense: 83, athleticism: 77, iq: 78, tools: 85 },
    badges: ['Switchable Defender', 'Mid-Range Weapon', 'Screen Setter'],
    stats: { ppg: 11.2, rpg: 6.9, apg: 1.8, spg: 0.7, bpg: 1.4, fgPct: 50.3, fg3Pct: 33.1, ftPct: 74.8, mpg: 28.1, gp: 27 },
    medical: 'available', eligibility: 'eligible', gpa: 2.7, credits: 67, role: 'Starter',
    systemFitOff: 82, systemFitDef: 88,
  },
  {
    id: 'p05', name: 'Trey Coleman',      initials: 'TC', number: 21, hue: 0,
    position: 'C',  classYear: 'Sr', heightFt: '6\'10"', weight: 245, hometown: 'Newark, NJ',    highSchool: 'St. Benedict\'s Prep',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 82.7, offensive: 79.4, defensive: 87.3, confidence: 90, tier: 'V2', trend: 'up', delta: 0.9 },
    archetype: 'Rim Protector',
    traits: { shooting: 58, finishing: 84, playmaking: 61, defense: 89, athleticism: 78, iq: 82, tools: 92 },
    badges: ['Elite Rim Protector', 'PNR Finisher', 'Defensive Anchor', 'Senior Leader'],
    stats: { ppg: 12.4, rpg: 8.7, apg: 1.2, spg: 0.6, bpg: 2.8, fgPct: 57.4, fg3Pct: 0.0, ftPct: 64.3, mpg: 28.9, gp: 25 },
    medical: 'available', eligibility: 'eligible', gpa: 3.2, credits: 108, role: 'Starter',
    systemFitOff: 87, systemFitDef: 95,
  },
  {
    id: 'p06', name: 'Isaiah Brooks',     initials: 'IB', number: 0,  hue: 195,
    position: 'PG', classYear: 'Fr', heightFt: '6\'1"',  weight: 175, hometown: 'Memphis, TN',   highSchool: 'East HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 68.9, offensive: 71.2, defensive: 65.4, confidence: 78, tier: 'V1+', trend: 'up', delta: 4.1 },
    archetype: 'Playmaking Guard',
    traits: { shooting: 66, finishing: 69, playmaking: 74, defense: 61, athleticism: 76, iq: 70, tools: 71 },
    badges: ['Freshman Phenom', 'Pass-First Guard'],
    stats: { ppg: 7.2, rpg: 2.1, apg: 4.3, spg: 1.0, bpg: 0.1, fgPct: 41.8, fg3Pct: 34.2, ftPct: 77.3, mpg: 21.4, gp: 26 },
    medical: 'available', eligibility: 'eligible', gpa: 3.0, credits: 18, role: 'Rotation',
    systemFitOff: 79, systemFitDef: 68,
  },
  {
    id: 'p07', name: 'Caleb Price',       initials: 'CP', number: 14, hue: 140,
    position: 'SG', classYear: 'Jr', heightFt: '6\'3"',  weight: 190, hometown: 'Durham, NC',    highSchool: 'Jordan HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 71.4, offensive: 73.8, defensive: 68.2, confidence: 83, tier: 'V2', trend: 'flat', delta: 0.3 },
    archetype: 'Spot-Up Shooter',
    traits: { shooting: 84, finishing: 66, playmaking: 62, defense: 67, athleticism: 71, iq: 74, tools: 73 },
    badges: ['Elite Corner 3', 'Catch-and-Shoot Weapon'],
    stats: { ppg: 8.1, rpg: 2.4, apg: 1.2, spg: 0.8, bpg: 0.1, fgPct: 43.1, fg3Pct: 41.3, ftPct: 89.2, mpg: 22.7, gp: 27 },
    medical: 'available', eligibility: 'eligible', gpa: 2.8, credits: 69, role: 'Rotation',
    systemFitOff: 91, systemFitDef: 72,
  },
  {
    id: 'p08', name: 'Darius King',       initials: 'DK', number: 24, hue: 320,
    position: 'SF', classYear: 'So', heightFt: '6\'6"',  weight: 205, hometown: 'DC',             highSchool: 'Gonzaga HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 69.7, offensive: 67.4, defensive: 73.1, confidence: 81, tier: 'V1+', trend: 'up', delta: 2.2 },
    archetype: 'Defensive Anchor',
    traits: { shooting: 62, finishing: 71, playmaking: 58, defense: 79, athleticism: 75, iq: 73, tools: 80 },
    badges: ['Lockdown Defender'],
    stats: { ppg: 5.8, rpg: 4.1, apg: 0.9, spg: 1.3, bpg: 0.6, fgPct: 44.2, fg3Pct: 28.7, ftPct: 68.4, mpg: 18.3, gp: 24 },
    medical: 'limited', medicalNote: 'Ankle sprain — day-to-day', eligibility: 'eligible', gpa: 2.5, credits: 38, role: 'Rotation',
    systemFitOff: 65, systemFitDef: 87,
  },
  {
    id: 'p09', name: 'Noah Thomas',       initials: 'NT', number: 32, hue: 60,
    position: 'PF', classYear: 'Fr', heightFt: '6\'9"',  weight: 215, hometown: 'Houston, TX',   highSchool: 'Westbury HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 65.2, offensive: 62.8, defensive: 68.4, confidence: 72, tier: 'V1', trend: 'up', delta: 3.8 },
    archetype: 'Energy Big',
    traits: { shooting: 55, finishing: 72, playmaking: 52, defense: 72, athleticism: 81, iq: 66, tools: 84 },
    badges: ['Energy Spark', 'Motor Player'],
    stats: { ppg: 4.2, rpg: 4.8, apg: 0.6, spg: 0.4, bpg: 0.8, fgPct: 52.1, fg3Pct: 0.0, ftPct: 59.4, mpg: 14.2, gp: 22 },
    medical: 'available', eligibility: 'eligible', gpa: 2.2, credits: 16, role: 'Bench',
    systemFitOff: 72, systemFitDef: 79,
  },
  {
    id: 'p10', name: 'Marcus Reid',       initials: 'MR', number: 44, hue: 170,
    position: 'C',  classYear: 'Sr', heightFt: '6\'9"',  weight: 235, hometown: 'Philadelphia, PA', highSchool: 'Overbrook HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 62.4, offensive: 64.1, defensive: 60.2, confidence: 86, tier: 'V2', trend: 'down', delta: -1.4 },
    archetype: 'Post Scorer',
    traits: { shooting: 48, finishing: 76, playmaking: 55, defense: 64, athleticism: 66, iq: 69, tools: 88 },
    badges: ['Post Presence'],
    stats: { ppg: 5.4, rpg: 5.2, apg: 0.8, spg: 0.3, bpg: 1.1, fgPct: 54.7, fg3Pct: 0.0, ftPct: 61.2, mpg: 16.8, gp: 27 },
    medical: 'available', eligibility: 'eligible', gpa: 3.6, credits: 114, role: 'Rotation',
    systemFitOff: 74, systemFitDef: 68,
  },
  {
    id: 'p11', name: 'Anthony Scott',     initials: 'AS', number: 2,  hue: 200,
    position: 'SG', classYear: 'Jr', heightFt: '6\'4"',  weight: 192, hometown: 'Miami, FL',     highSchool: 'Columbus HS',
    isScholarship: false, isRedshirt: false,
    kr: { overall: 63.1, offensive: 65.4, defensive: 60.1, confidence: 74, tier: 'V1+', trend: 'flat', delta: 0.1 },
    archetype: 'Secondary Creator',
    traits: { shooting: 72, finishing: 67, playmaking: 70, defense: 58, athleticism: 73, iq: 67, tools: 76 },
    badges: [],
    stats: { ppg: 4.6, rpg: 2.0, apg: 2.1, spg: 0.6, bpg: 0.0, fgPct: 38.9, fg3Pct: 32.1, ftPct: 79.8, mpg: 13.6, gp: 20 },
    medical: 'available', eligibility: 'warning', gpa: 1.8, credits: 64,
    role: 'Bench', systemFitOff: 78, systemFitDef: 64,
  },
  {
    id: 'p12', name: 'Tyler Moss',        initials: 'TM', number: 23, hue: 100,
    position: 'SF', classYear: 'Fr', heightFt: '6\'5"',  weight: 195, hometown: 'Louisville, KY', highSchool: 'Ballard HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 62.8, offensive: 61.4, defensive: 65.1, confidence: 69, tier: 'V1', trend: 'up', delta: 1.2 },
    archetype: 'Two-Way Wing',
    traits: { shooting: 64, finishing: 66, playmaking: 58, defense: 67, athleticism: 74, iq: 64, tools: 78 },
    badges: [],
    stats: { ppg: 3.1, rpg: 2.8, apg: 0.7, spg: 0.9, bpg: 0.4, fgPct: 41.2, fg3Pct: 30.0, ftPct: 72.4, mpg: 10.4, gp: 18 },
    medical: 'available', eligibility: 'eligible', gpa: 2.8, credits: 15, role: 'Bench',
    systemFitOff: 68, systemFitDef: 74,
  },
  {
    id: 'p13', name: 'Chris Daniels',     initials: 'CD', number: 15, hue: 250,
    position: 'PG', classYear: 'So', heightFt: '5\'11"', weight: 170, hometown: 'New York, NY',  highSchool: 'Erasmus Hall HS',
    isScholarship: false, isRedshirt: false,
    kr: { overall: 60.4, offensive: 63.2, defensive: 56.8, confidence: 71, tier: 'V1+', trend: 'flat', delta: 0.4 },
    archetype: 'Playmaking Guard',
    traits: { shooting: 68, finishing: 61, playmaking: 71, defense: 55, athleticism: 69, iq: 65, tools: 66 },
    badges: [],
    stats: { ppg: 2.8, rpg: 1.2, apg: 2.4, spg: 0.7, bpg: 0.0, fgPct: 38.2, fg3Pct: 33.8, ftPct: 80.6, mpg: 9.8, gp: 15 },
    medical: 'available', eligibility: 'eligible', gpa: 3.3, credits: 36, role: 'Bench',
    systemFitOff: 72, systemFitDef: 62,
  },
  {
    id: 'p14', name: 'Ben Carter',        initials: 'BC', number: 40, hue: 50,
    position: 'PF', classYear: 'Jr', heightFt: '6\'7"',  weight: 218, hometown: 'Kansas City, MO', highSchool: 'Rockhurst HS',
    isScholarship: true, isRedshirt: true,
    kr: { overall: 64.1, offensive: 61.8, defensive: 67.4, confidence: 65, tier: 'V1', trend: 'up', delta: 2.1 },
    archetype: 'Stretch Four',
    traits: { shooting: 71, finishing: 68, playmaking: 60, defense: 69, athleticism: 72, iq: 67, tools: 80 },
    badges: [],
    stats: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, fgPct: 0.0, fg3Pct: 0.0, ftPct: 0.0, mpg: 0.0, gp: 0 },
    medical: 'available', eligibility: 'eligible', gpa: 3.0, credits: 72, role: 'DNP',
    systemFitOff: 79, systemFitDef: 72,
  },
  {
    id: 'p15', name: 'Robert Green',      initials: 'RG', number: 50, hue: 340,
    position: 'C',  classYear: 'Fr', heightFt: '6\'11"', weight: 250, hometown: 'Chicago, IL',   highSchool: 'Simeon HS',
    isScholarship: true, isRedshirt: false,
    kr: { overall: 66.3, offensive: 63.4, defensive: 70.8, confidence: 67, tier: 'V1', trend: 'up', delta: 5.2 },
    archetype: 'Rim Protector',
    traits: { shooting: 44, finishing: 69, playmaking: 48, defense: 74, athleticism: 76, iq: 65, tools: 90 },
    badges: ['High Ceiling'],
    stats: { ppg: 3.8, rpg: 4.1, apg: 0.4, spg: 0.2, bpg: 1.6, fgPct: 55.1, fg3Pct: 0.0, ftPct: 52.3, mpg: 11.8, gp: 16 },
    medical: 'out', medicalNote: 'Stress fracture — 3-4 weeks', eligibility: 'eligible', gpa: 2.4, credits: 16, role: 'DNP',
    systemFitOff: 68, systemFitDef: 82,
  },
];

// ── Coaching Staff ─────────────────────────────────────────────────────────────

export const COACHING_STAFF: StaffMember[] = [
  { id: 'st1', name: 'Coach Marcus Price',    initials: 'MP', hue: 215, title: 'Head Coach',           role: 'head-coach', phone: '(301) 555-0100', email: 'mprice@lincoln.edu' },
  { id: 'st2', name: 'Coach Devin Okafor',    initials: 'DO', hue: 45,  title: 'Asst. Coach (Offense)', role: 'asst-coach', phone: '(301) 555-0101', email: 'dokafor@lincoln.edu' },
  { id: 'st3', name: 'Coach Sandra Lee',      initials: 'SL', hue: 300, title: 'Asst. Coach (Defense)', role: 'asst-coach', phone: '(301) 555-0102', email: 'slee@lincoln.edu' },
  { id: 'st4', name: 'Coach James Wu',        initials: 'JW', hue: 170, title: 'Graduate Assistant',    role: 'grad-asst',  phone: '(301) 555-0103', email: 'jwu@lincoln.edu' },
  { id: 'st5', name: 'Dr. Keisha Brown',      initials: 'KB', hue: 130, title: 'Athletic Trainer',      role: 'trainer',    phone: '(301) 555-0104', email: 'kbrown@lincoln.edu' },
  { id: 'st6', name: 'Malik Thompson',        initials: 'MT', hue: 260, title: 'Strength & Conditioning', role: 'strength', phone: '(301) 555-0105', email: 'mthompson@lincoln.edu' },
  { id: 'st7', name: 'Angela Rivers',         initials: 'AR', hue: 30,  title: 'Sports Info Director',   role: 'sid',       phone: '(301) 555-0106', email: 'arivers@lincoln.edu' },
];

// ── Season Schedule ───────────────────────────────────────────────────────────

export const SEASON_SCHEDULE: Game[] = [
  { id: 'g01', date: 'Nov 4',  opponent: 'Hampton University',   oppHue: 200, location: 'H', venue: 'John B. Anderson Arena', time: '7:00 PM', result: 'W', score: '82', oppScore: '71', isConference: false },
  { id: 'g02', date: 'Nov 8',  opponent: 'Bowie State',          oppHue: 60,  location: 'A', venue: 'Wiseman Center', time: '6:00 PM', result: 'W', score: '74', oppScore: '68', isConference: false },
  { id: 'g03', date: 'Nov 14', opponent: 'Morgan State',         oppHue: 20,  location: 'H', venue: 'John B. Anderson Arena', time: '7:00 PM', result: 'L', score: '69', oppScore: '73', isConference: false },
  { id: 'g04', date: 'Nov 18', opponent: 'Coppin State',         oppHue: 220, location: 'A', venue: 'Coppin Center', time: '6:00 PM', result: 'W', score: '88', oppScore: '62', isConference: false },
  { id: 'g05', date: 'Nov 22', opponent: 'Delaware State',       oppHue: 180, location: 'H', venue: 'John B. Anderson Arena', time: '3:00 PM', result: 'W', score: '79', oppScore: '74', isConference: true },
  { id: 'g06', date: 'Dec 3',  opponent: 'Norfolk State',        oppHue: 150, location: 'A', venue: 'Echols Hall', time: '7:00 PM', result: 'L', score: '66', oppScore: '71', isConference: true },
  { id: 'g07', date: 'Dec 7',  opponent: 'FAMU',                 oppHue: 340, location: 'H', venue: 'John B. Anderson Arena', time: '7:00 PM', result: 'W', score: '91', oppScore: '78', isConference: true },
  { id: 'g08', date: 'Dec 14', opponent: 'Bethune-Cookman',      oppHue: 200, location: 'A', venue: 'Moore Gym', time: '5:00 PM', result: 'W', score: '76', oppScore: '70', isConference: true },
  { id: 'g09', date: 'Jan 8',  opponent: 'SC State',             oppHue: 260, location: 'H', venue: 'John B. Anderson Arena', time: '7:00 PM', result: 'W', score: '83', oppScore: '68', isConference: true },
  { id: 'g10', date: 'Jan 12', opponent: 'Savannah State',       oppHue: 80,  location: 'A', venue: 'Tiger Arena', time: '6:00 PM', result: 'W', score: '77', oppScore: '71', isConference: true },
  { id: 'g11', date: 'Jan 17', opponent: 'Howard University',    oppHue: 350, location: 'H', venue: 'John B. Anderson Arena', time: '7:00 PM', result: 'L', score: '74', oppScore: '78', isConference: true },
  { id: 'g12', date: 'Jan 22', opponent: 'UMES',                 oppHue: 170, location: 'A', venue: 'Hytche Center', time: '5:00 PM', result: 'W', score: '86', oppScore: '72', isConference: true },
  { id: 'g13', date: 'Jan 25', opponent: 'Coppin State',         oppHue: 220, location: 'H', venue: 'John B. Anderson Arena', time: '3:00 PM', result: 'W', score: '81', oppScore: '67', isConference: true },
  { id: 'g14', date: 'Feb 2',  opponent: 'Morgan State',         oppHue: 20,  location: 'A', venue: 'Hill Field House', time: '7:00 PM', result: 'L', score: '71', oppScore: '84', isConference: true },
  { id: 'g15', date: 'Feb 7',  opponent: 'Delaware State',       oppHue: 180, location: 'A', venue: 'Memorial Hall Gym', time: '6:00 PM', result: 'W', score: '73', oppScore: '66', isConference: true },
  { id: 'g16', date: 'Feb 12', opponent: 'Norfolk State',        oppHue: 150, location: 'H', venue: 'John B. Anderson Arena', time: '7:00 PM', result: 'W', score: '78', oppScore: '72', isConference: true },
  { id: 'g17', date: 'Feb 15', opponent: 'FAMU',                 oppHue: 340, location: 'A', venue: 'Al Lawson Center', time: '3:00 PM', result: 'W', score: '84', oppScore: '76', isConference: true },
  { id: 'g18', date: 'Feb 21', opponent: 'Bethune-Cookman',      oppHue: 200, location: 'H', venue: 'John B. Anderson Arena', time: '7:00 PM', result: 'W', score: '89', oppScore: '74', isConference: true },
  { id: 'g19', date: 'Feb 26', opponent: 'SC State',             oppHue: 260, location: 'A', venue: 'Smith-Hammond-Middleton Center', time: '6:00 PM', result: 'L', score: '68', oppScore: '75', isConference: true },
  { id: 'g20', date: 'Mar 1',  opponent: 'Savannah State',       oppHue: 80,  location: 'H', venue: 'John B. Anderson Arena', time: '2:00 PM', result: 'W', score: '95', oppScore: '72', isConference: true },
  { id: 'g21', date: 'Mar 6',  opponent: 'UMES',                 oppHue: 170, location: 'H', venue: 'John B. Anderson Arena', time: '7:00 PM', result: 'W', score: '80', oppScore: '65', isConference: true, tv: 'ESPN+' },
  { id: 'g22', date: 'Mar 12', opponent: 'Hampton University',   oppHue: 200, location: 'A', venue: 'Hampton Convocation Center', time: '5:00 PM', result: 'L', score: '72', oppScore: '81', isConference: false },
  { id: 'g23', date: 'Mar 17', opponent: 'SC State',             oppHue: 260, location: 'N', venue: 'Norfolk Scope Arena', time: '12:00 PM', result: 'W', score: '77', oppScore: '70', isConference: true },
  { id: 'g24', date: 'Mar 18', opponent: 'Norfolk State',        oppHue: 150, location: 'N', venue: 'Norfolk Scope Arena', time: '6:00 PM', result: 'W', score: '82', oppScore: '79', isConference: true },
  { id: 'g25', date: 'Mar 19', opponent: 'Morgan State',         oppHue: 20,  location: 'N', venue: 'Norfolk Scope Arena', time: '8:00 PM', result: 'L', score: '71', oppScore: '80', isConference: true },
  // Upcoming
  { id: 'g26', date: 'Apr 1',  opponent: 'Howard University',    oppHue: 350, location: 'A', venue: 'Burr Gymnasium', time: '7:00 PM', isConference: true, tv: 'ESPN+' },
  { id: 'g27', date: 'Apr 5',  opponent: 'Morgan State',         oppHue: 20,  location: 'H', venue: 'John B. Anderson Arena', time: '3:00 PM', isConference: true },
];

// ── Recruiting Board ──────────────────────────────────────────────────────────

export const RECRUITS_BOARD: Recruit[] = [
  { id: 'r01', name: 'Jaylen Foster',    initials: 'JF', hue: 215, position: 'PG', classYear: '2026', school: 'Oak Hill Academy', state: 'VA', heightFt: '6\'2"', weight: 182, stage: 'Committed', priority: 'Target', kr: 79.2, krConf: 74, archetype: 'Playmaking Guard', systemFit: 87, lastContact: 'Mar 24', contactType: 'visit', gpa: 3.3, offers: ['Georgetown', 'Richmond', 'LU'], stars: 3, hasFilm: true, notes: 'Verbally committed 3/20. Needs official visit paperwork signed.' },
  { id: 'r02', name: 'Amari Davis',      initials: 'AD', hue: 160, position: 'C',  classYear: '2026', school: 'Brewster Academy', state: 'NH', heightFt: '6\'10"', weight: 240, stage: 'Offered', priority: 'Target', kr: 76.4, krConf: 71, archetype: 'Rim Protector', systemFit: 91, lastContact: 'Mar 21', contactType: 'call', gpa: 2.9, offers: ['LU', 'Coppin', 'FAMU'], stars: 3, hasFilm: true, notes: 'Ideal rim protector fit. Needs academic clearance check.' },
  { id: 'r03', name: 'Deon Mitchell',    initials: 'DM', hue: 330, position: 'SF', classYear: '2026', school: 'Montverde Academy', state: 'FL', heightFt: '6\'7"', weight: 210, stage: 'Evaluating', priority: 'Target', kr: 81.3, krConf: 68, archetype: 'Two-Way Wing', systemFit: 83, lastContact: 'Mar 18', contactType: 'text', gpa: 3.1, offers: ['Hampton', 'Delaware St.', 'LU'], stars: 4, hasFilm: true, notes: 'Elite two-way profile. Multiple high-major schools involved.' },
  { id: 'r04', name: 'Terrance Bell',    initials: 'TB', hue: 50,  position: 'SG', classYear: '2026', school: 'Word of God Academy', state: 'NC', heightFt: '6\'4"', weight: 193, stage: 'Offered', priority: 'Offer', kr: 72.1, krConf: 70, archetype: 'Spot-Up Shooter', systemFit: 88, lastContact: 'Mar 15', contactType: 'call', gpa: 2.7, offers: ['LU', 'Norfolk St.', 'UMES'], stars: 3, hasFilm: true, notes: 'Elite shooter — exactly what system needs. Must stay on.' },
  { id: 'r05', name: 'Kwame Asante',     initials: 'KA', hue: 280, position: 'PF', classYear: '2026', school: 'IMG Academy', state: 'FL', heightFt: '6\'8"', weight: 220, stage: 'Evaluating', priority: 'Target', kr: 77.8, krConf: 66, archetype: 'Versatile Forward', systemFit: 86, lastContact: 'Mar 12', contactType: 'visit', gpa: 3.5, offers: ['Howard', 'Coppin', 'LU'], stars: 3, hasFilm: true, notes: 'Unofficial visit went well. Parents are driving factor.' },
  { id: 'r06', name: 'Chris Odum',       initials: 'CO', hue: 130, position: 'PG', classYear: '2027', school: 'Hargrave Military', state: 'VA', heightFt: '6\'1"', weight: 175, stage: 'Identified', priority: 'Watch', kr: 71.4, krConf: 62, archetype: 'PNR Ball Handler', systemFit: 82, lastContact: 'Mar 8', contactType: 'email', gpa: 3.0, offers: [], stars: 3, hasFilm: false, notes: 'Watching closely. Will evaluate again at spring showcase.' },
  { id: 'r07', name: 'Miles Jackson',    initials: 'MJ', hue: 0,   position: 'SG', classYear: '2026', school: 'Prolific Prep', state: 'CA', heightFt: '6\'3"', weight: 190, stage: 'Evaluating', priority: 'Watch', kr: 74.6, krConf: 65, archetype: 'Shot-Creating Wing', systemFit: 79, lastContact: 'Mar 5', contactType: 'call', gpa: 3.2, offers: ['Hampton', 'LU', 'Morgan St.'], stars: 3, hasFilm: true, notes: 'West coast kid. Travel far but strong system fit.' },
  { id: 'r08', name: 'Jamal Green',      initials: 'JG', hue: 195, position: 'C',  classYear: '2025', school: 'JUCO — Chipola',  state: 'FL', heightFt: '6\'9"', weight: 240, stage: 'Offered', priority: 'Offer', kr: 68.2, krConf: 73, archetype: 'Energy Big', systemFit: 77, lastContact: 'Mar 22', contactType: 'call', gpa: 2.4, offers: ['LU', 'SC State', 'Bethune-C'], stars: 2, hasFilm: true, notes: 'Transfer-ready JUCO big. Could fill Robert Green gap.' },
  { id: 'r09', name: 'Rashad Pope',      initials: 'RP', hue: 260, position: 'SF', classYear: '2026', school: 'Paul VI HS', state: 'VA', heightFt: '6\'5"', weight: 200, stage: 'Identified', priority: 'Watch', kr: 69.8, krConf: 59, archetype: 'Defensive Anchor', systemFit: 74, lastContact: 'Feb 28', contactType: 'email', gpa: 2.8, offers: [], stars: 2, hasFilm: false, notes: 'Local kid. Invite to camp in June.' },
  { id: 'r10', name: 'Tavion Howard',    initials: 'TH', hue: 80,  position: 'PG', classYear: '2026', school: 'East HS', state: 'NY', heightFt: '5\'11"', weight: 172, stage: 'Signed', priority: 'Target', kr: 70.4, krConf: 66, archetype: 'Playmaking Guard', systemFit: 80, lastContact: 'Mar 20', contactType: 'visit', gpa: 3.0, offers: ['LU', 'Coppin'], stars: 2, hasFilm: true, notes: 'Signed NLI. Ready to contribute as freshman.' },
  { id: 'r11', name: 'Omari Stephens',   initials: 'OS', hue: 340, position: 'PF', classYear: '2027', school: 'Wheeler HS', state: 'GA', heightFt: '6\'9"', weight: 218, stage: 'Identified', priority: 'Watch', kr: undefined, krConf: undefined, archetype: undefined, systemFit: undefined, lastContact: 'Feb 20', contactType: 'email', gpa: 3.4, offers: [], stars: 3, hasFilm: false, notes: 'Early look. Coach Okafor is lead recruiter.' },
  { id: 'r12', name: 'Devon White',      initials: 'DW', hue: 40,  position: 'SG', classYear: '2026', school: 'Bishop Walsh', state: 'MD', heightFt: '6\'4"', weight: 188, stage: 'Declined', priority: 'Backup', kr: 71.8, krConf: 72, archetype: 'Spot-Up Shooter', systemFit: 85, lastContact: 'Mar 10', contactType: 'call', gpa: 3.1, offers: ['LU', 'Delaware St.'], stars: 2, hasFilm: true, notes: 'Chose Delaware State. Keep on radar for portal.' },
  { id: 'r13', name: 'Kobe Lawrence',    initials: 'KL', hue: 170, position: 'C',  classYear: '2025', school: 'Transfer — Norfolk St.', state: 'VA', heightFt: '6\'10"', weight: 248, stage: 'Offered', priority: 'Target', kr: 73.4, krConf: 78, archetype: 'Rim Protector', systemFit: 89, lastContact: 'Mar 25', contactType: 'call', gpa: 2.6, offers: ['LU', 'Hampton', 'Morgan St.'], stars: 3, hasFilm: true, notes: 'Portal target. Covers Robert Green injury. Decision by Apr 1.' },
  { id: 'r14', name: 'Elias Ngozi',      initials: 'EN', hue: 220, position: 'SF', classYear: '2026', school: 'Oak Hill Academy', state: 'VA', heightFt: '6\'6"', weight: 205, stage: 'Evaluating', priority: 'Backup', kr: 68.7, krConf: 63, archetype: 'Two-Way Wing', systemFit: 76, lastContact: 'Mar 1', contactType: 'text', gpa: 2.9, offers: [], stars: 2, hasFilm: true, notes: 'Backup wing option. Needs another evaluation camp.' },
  { id: 'r15', name: 'Dante Freeman',    initials: 'DF', hue: 300, position: 'PG', classYear: '2026', school: 'Prolific Prep', state: 'CA', heightFt: '6\'0"', weight: 178, stage: 'Verbal', priority: 'Offer', kr: 74.8, krConf: 67, archetype: 'Playmaking Guard', systemFit: 81, lastContact: 'Mar 23', contactType: 'visit', gpa: 3.5, offers: ['LU', 'Howard', 'Coppin'], stars: 3, hasFilm: true, notes: 'Verbal commitment from March showcase visit.' },
];

// ── Transfer Portal ────────────────────────────────────────────────────────────

export const PORTAL_PLAYERS: PortalPlayer[] = [
  { id: 'pp1', name: 'Brandon Cole',   initials: 'BC', hue: 210, position: 'PG', prevSchool: 'Norfolk State',   conference: 'MEAC', level: 'D1', stats: { ppg: 12.4, rpg: 3.1, apg: 5.8 }, kr: 74.2, systemFit: 82, enteredDate: 'Mar 15', eligible: 'immediately' },
  { id: 'pp2', name: 'Kobe Lawrence',  initials: 'KL', hue: 170, position: 'C',  prevSchool: 'Norfolk State',   conference: 'MEAC', level: 'D1', stats: { ppg: 8.4, rpg: 7.1, apg: 0.9 }, kr: 73.4, systemFit: 89, enteredDate: 'Mar 12', eligible: 'immediately' },
  { id: 'pp3', name: 'Antoine Wells',  initials: 'AW', hue: 330, position: 'SF', prevSchool: 'Delaware State',  conference: 'MEAC', level: 'D1', stats: { ppg: 9.2, rpg: 4.8, apg: 1.2 }, kr: 68.7, systemFit: 74, enteredDate: 'Mar 10', eligible: 'immediately' },
  { id: 'pp4', name: 'Mike Santos',    initials: 'MS', hue: 50,  position: 'SG', prevSchool: 'Hampton',         conference: 'CAA', level: 'D1', stats: { ppg: 14.1, rpg: 2.8, apg: 3.2 }, kr: 76.8, systemFit: 86, enteredDate: 'Mar 8',  eligible: 'immediately' },
  { id: 'pp5', name: 'Quincy Rucker',  initials: 'QR', hue: 130, position: 'PF', prevSchool: 'Coppin State',    conference: 'MEAC', level: 'D1', stats: { ppg: 7.8, rpg: 5.9, apg: 1.0 }, kr: 65.4, systemFit: 78, enteredDate: 'Mar 5',  eligible: 'sit-out' },
  { id: 'pp6', name: 'DeShawn Pryor',  initials: 'DP', hue: 290, position: 'PG', prevSchool: 'Chipola College', conference: 'FCSAA', level: 'JUCO', stats: { ppg: 16.2, rpg: 4.1, apg: 7.4 }, kr: 70.1, systemFit: 79, enteredDate: 'Mar 3',  eligible: 'immediately' },
  { id: 'pp7', name: 'Isaiah Moore',   initials: 'IM', hue: 0,   position: 'C',  prevSchool: 'SC State',        conference: 'MEAC', level: 'D1', stats: { ppg: 6.1, rpg: 6.4, apg: 0.7 }, kr: 67.3, systemFit: 71, enteredDate: 'Feb 28', eligible: 'immediately' },
  { id: 'pp8', name: 'Lamar Dixon',    initials: 'LD', hue: 100, position: 'SG', prevSchool: 'Bethune-Cookman', conference: 'SWAC', level: 'D1', stats: { ppg: 11.8, rpg: 3.2, apg: 2.1 }, kr: 71.6, systemFit: 80, enteredDate: 'Feb 25', eligible: 'immediately' },
  { id: 'pp9', name: 'Victor Nkosi',   initials: 'VN', hue: 200, position: 'PF', prevSchool: 'FAMU',            conference: 'SWAC', level: 'D1', stats: { ppg: 8.7, rpg: 6.8, apg: 1.4 }, kr: 69.8, systemFit: 77, enteredDate: 'Feb 22', eligible: 'immediately' },
  { id: 'pp10', name: 'Corey West',    initials: 'CW', hue: 250, position: 'SF', prevSchool: 'Morgan State',    conference: 'MEAC', level: 'D1', stats: { ppg: 7.4, rpg: 3.9, apg: 0.8 }, kr: 66.1, systemFit: 70, enteredDate: 'Feb 20', eligible: 'sit-out' },
];

// ── Scouting Report: Howard University ────────────────────────────────────────

export const SCOUT_HOWARD = {
  team:          'Howard University',
  record:        '15-12',
  confRecord:    '9-7',
  standing:      '4th MEAC',
  dataConf:      78,
  dataTier:      'V1+' as DataTier,
  offense: {
    systemName:  'ISO-Heavy Half Court',
    pace:        66,
    primaryInit: 'DeVante Ross (#3)',
    shotDiet:    { rim: 28, mid: 32, three: 28, ft: 12 },
    pressurePoints: ['Force left on primary handler', 'Switch all ball screens (they hate it)', 'Contest midrange early'],
    description: 'Heavy isolation scoring through their primary guard, supplemented by PNR when defense collapses.',
  },
  defense: {
    systemName:  'Zone-2-3',
    pressure:    'Half Court',
    coverages:   ['2-3 Zone (primary)', 'Man-to-man (late game)'],
    helpRules:   'Zone collapses to rim on drives',
    rebounding:  'Crash heavy with bigs',
    foulProfile: 'Foul-prone bigs (avg 18 FTA allowed per game)',
  },
  topActions: [
    { rank: 1, name: 'Ross ISO Midrange', freq: '22%', our_counter: 'Force help-side, switch', risk: 'High — 48% success rate' },
    { rank: 2, name: 'Zone Entry PNR',    freq: '18%', our_counter: 'Attack zone gaps vs their zone — drive and kick', risk: 'Medium' },
    { rank: 3, name: 'Carter Post-Up',    freq: '14%', our_counter: 'Front or double early', risk: 'Medium — 52% success rate' },
    { rank: 4, name: 'Williams Corner 3', freq: '11%', our_counter: 'Chase, no open looks', risk: 'High if open (42% 3PT)' },
    { rank: 5, name: 'Transition Push',   freq: '9%',  our_counter: 'Get back, match up quickly', risk: 'Medium in transition' },
  ],
  attacks: ['Attack zone — drive gaps, kick to shooters', 'PNR vs their man (2nd half tendency)', 'Force Ross left all possessions', 'Attack Carter foul-prone bigs early'],
  deny:    ['Ross midrange (his bread-and-butter)', 'Williams corner catch-and-shoot', 'Carter post entry on short side', 'Transition scoring before they set zone'],
  rotation: [
    { name: 'DeVante Ross',   pos: 'PG', kr: 77.2, archetype: 'Shot-Creating Wing', threat: 'ISO scorer — 18 PPG' },
    { name: 'Marcus Carter',  pos: 'C',  kr: 72.4, archetype: 'Post Scorer', threat: 'Post up, foul magnet — 9 PPG 8 RPG' },
    { name: 'T. Williams',    pos: 'SG', kr: 68.1, archetype: 'Spot-Up Shooter', threat: 'Corner 3 threat — 42%' },
    { name: 'D. Jackson',     pos: 'SF', kr: 65.4, archetype: 'Energy Big', threat: 'Hustle plays, boards' },
    { name: 'A. Brown',       pos: 'PF', kr: 63.8, archetype: 'Versatile Forward', threat: 'Stretch — 34% 3PT' },
  ],
};

// ── NIL Opportunities ─────────────────────────────────────────────────────────

export const NIL_OPPORTUNITIES: NILOpportunity[] = [
  { id: 'nil1', brand: 'Jordan Brand', brandHue: 0,   type: 'ambassador',   amount: 4500, description: 'Ambassador for Jordan Campus program', deliverables: '4 social posts, 1 appearance at store launch', deadline: 'Apr 15', openToAll: false, targetPos: 'PG' },
  { id: 'nil2', brand: 'UrbanEats DC', brandHue: 30,  type: 'social-post',  amount: 800,  description: 'Sponsored social media content — local restaurant chain', deliverables: '2 Instagram posts, 1 Story', deadline: 'Apr 5', openToAll: true },
  { id: 'nil3', brand: 'Lincoln Credit Union', brandHue: 215, type: 'endorsement', amount: 2000, description: 'Local credit union athlete endorsement', deliverables: 'Photo shoot, 3 social posts, 1 in-branch appearance', deadline: 'Apr 20', openToAll: true },
  { id: 'nil4', brand: 'DC Sports Talk', brandHue: 350, type: 'appearance', amount: 500, description: 'Guest appearance on weekly podcast', deliverables: '1-hour podcast appearance', deadline: 'Apr 8', openToAll: false, targetPos: 'C' },
  { id: 'nil5', brand: 'Fresh Cuts Barber', brandHue: 130, type: 'content', amount: 600, description: 'Social media content for local barbershop', deliverables: '3 short-form video clips, 2 posts', deadline: 'Apr 12', openToAll: true },
];

// ── Active NIL Deals ───────────────────────────────────────────────────────────

export const NIL_DEALS: NILDeal[] = [
  { id: 'nd1', playerId: 'p01', playerName: 'Marcus Johnson', brand: 'Gatorade', type: 'ambassador', amount: 3500, status: 'in-progress', compliance: 'approved', startDate: 'Feb 1', endDate: 'May 30', deliverables: ['3 social posts', '1 event appearance', 'Brand tag in all game-day content'], completed: 67 },
  { id: 'nd2', playerId: 'p02', playerName: 'Devon Hayes',    brand: 'DICK\'S Sporting Goods', type: 'social-post', amount: 1200, status: 'completed', compliance: 'approved', startDate: 'Jan 15', endDate: 'Mar 31', deliverables: ['4 Instagram posts', '1 Reel'], completed: 100 },
  { id: 'nd3', playerId: 'p05', playerName: 'Trey Coleman',      brand: 'Under Armour Campus',   type: 'endorsement', amount: 2800, status: 'in-progress', compliance: 'pending',  startDate: 'Mar 1',  endDate: 'Jun 30',  deliverables: ['Photo shoot (complete)', '2 social posts', '1 campus store appearance'], completed: 40  },
  { id: 'nd4', playerId: 'p03', playerName: 'Elijah Washington', brand: 'Jordan Brand',          type: 'ambassador',  amount: 5000, status: 'in-progress', compliance: 'approved', startDate: 'Feb 15', endDate: 'Aug 15',  deliverables: ['4 social posts', '2 campus store appearances', 'Brand ambassador bio'],   completed: 50  },
  { id: 'nd5', playerId: 'p04', playerName: 'Jordan Williams',   brand: 'Nike Campus',           type: 'endorsement', amount: 3200, status: 'in-progress', compliance: 'pending',  startDate: 'Mar 10', endDate: 'Jul 31',  deliverables: ['Photo shoot', '3 social posts', '1 campus event'],                         completed: 25  },
  { id: 'nd6', playerId: 'p06', playerName: 'Isaiah Brooks',     brand: 'DC Sports Network',     type: 'social-post', amount:  900, status: 'completed',   compliance: 'approved', startDate: 'Jan 20', endDate: 'Mar 1',   deliverables: ['3 Instagram posts', '1 Twitter thread'],                                    completed: 100 },
];

// ── Fundraising Campaigns ──────────────────────────────────────────────────────

export const BOOSTER_CAMPAIGNS: Campaign[] = [
  { id: 'bc1', name: 'New Practice Facility', goal: 5000000, raised: 2100000, donors: 847, status: 'active', deadline: 'Dec 2026', desc: 'Fund the new 20,000 sq ft practice facility with updated locker rooms, film room, and weight center.', fundId: 'facilities' },
  { id: 'bc2', name: 'Senior Night Celebration', goal: 5000, raised: 4200, donors: 212, status: 'active', deadline: 'Apr 15', desc: 'Support the celebration for our 5 senior players on Senior Night.', fundId: 'general' },
  { id: 'bc3', name: 'MEAC Tournament Travel Fund', goal: 25000, raised: 18000, donors: 163, status: 'active', deadline: 'Mar 30', desc: 'Help cover travel and lodging expenses for the MEAC Tournament.', fundId: 'travel' },
];

// ── Merch Products ─────────────────────────────────────────────────────────────

export const MERCH_PRODUCTS: MerchProduct[] = [
  { id: 'm01', name: 'LU Lions Jersey #1',       category: 'Apparel',    price: 79.99,  colors: ['Navy', 'White'],    inStock: true,  isFeatured: true,  isLimited: false, rating: 4.8, reviews: 142 },
  { id: 'm02', name: 'Lions Basketball Hoodie',  category: 'Apparel',    price: 54.99,  colors: ['Navy', 'Gray'],     inStock: true,  isFeatured: true,  isLimited: false, rating: 4.7, reviews: 89 },
  { id: 'm03', name: 'LU Lions Snapback',        category: 'Headwear',   price: 29.99,  colors: ['Navy', 'Gold'],     inStock: true,  isFeatured: false, isLimited: false, rating: 4.5, reviews: 63 },
  { id: 'm04', name: 'Championship T-Shirt',     category: 'Apparel',    price: 34.99,  colors: ['Navy', 'White', 'Gold'], inStock: true, isFeatured: true, isLimited: true, rating: 4.9, reviews: 47 },
  { id: 'm05', name: 'Lions Beanie',             category: 'Headwear',   price: 22.99,  colors: ['Navy'],             inStock: true,  isFeatured: false, isLimited: false, rating: 4.4, reviews: 31 },
  { id: 'm06', name: 'LU Logo Backpack',         category: 'Accessories', price: 49.99, colors: ['Navy'],             inStock: true,  isFeatured: false, isLimited: false, rating: 4.6, reviews: 28 },
  { id: 'm07', name: 'Game-Worn Trey Coleman #21 Jersey', category: 'Special', price: 299.99, colors: ['Navy'], inStock: true, isFeatured: false, isLimited: true, rating: 5.0, reviews: 4 },
  { id: 'm08', name: 'Lions Water Bottle',       category: 'Accessories', price: 19.99, colors: ['Navy', 'White'],   inStock: true,  isFeatured: false, isLimited: false, rating: 4.3, reviews: 55 },
  { id: 'm09', name: 'Autographed Marcus Johnson Ball', category: 'Special', price: 149.99, colors: ['White'], inStock: true, isFeatured: true, isLimited: true, rating: 5.0, reviews: 7 },
  { id: 'm10', name: 'LU Lions Car Decal Pack', category: 'Accessories', price: 12.99, colors: ['Navy'],            inStock: true,  isFeatured: false, isLimited: false, rating: 4.2, reviews: 44 },
];

// ── Tickets ────────────────────────────────────────────────────────────────────

export const TICKET_GAMES: TicketGame[] = [
  {
    gameId: 'g26', opponent: 'Howard University', date: 'Apr 1, 2026', time: '7:00 PM', venue: 'Burr Gymnasium',
    types: [
      { label: 'General Admission', price: 12, available: 340 },
      { label: 'Reserved',          price: 20, available: 88 },
      { label: 'Student',           price: 6,  available: 120 },
    ],
  },
  {
    gameId: 'g27', opponent: 'Morgan State', date: 'Apr 5, 2026', time: '3:00 PM', venue: 'John B. Anderson Arena',
    types: [
      { label: 'General Admission', price: 15, available: 512 },
      { label: 'Reserved',          price: 25, available: 144 },
      { label: 'Courtside',         price: 75, available: 12 },
      { label: 'Student',           price: 6,  available: 200 },
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
  { id: 'na1', playerId: 'p01', playerName: 'Marcus Johnson',    initials: 'MJ', hue: 215, action: 'Signed 6-month extension',        brand: 'Gatorade',              timestamp: '2h ago',    amount: 4200 },
  { id: 'na2', playerId: 'p03', playerName: 'Elijah Washington', initials: 'EW', hue: 280, action: 'Posted 3 brand reels \u2014 2M views', brand: 'Jordan Brand',      timestamp: '5h ago'               },
  { id: 'na3', playerId: 'p05', playerName: 'Trey Coleman',      initials: 'TC', hue: 0,   action: 'Completed photo shoot',            brand: 'Under Armour Campus',   timestamp: 'Yesterday'            },
  { id: 'na4', playerId: 'p02', playerName: 'Devon Hayes',       initials: 'DH', hue: 160, action: 'Deal paid out',                    brand: "DICK'S Sporting Goods", timestamp: 'Yesterday', amount: 1200 },
  { id: 'na5', playerId: 'p04', playerName: 'Jordan Williams',   initials: 'JW', hue: 30,  action: 'NIL compliance submitted',         brand: 'Nike Campus',           timestamp: '2 days ago'           },
];

// ── Fan Experiences ────────────────────────────────────────────────────────────

export const FAN_EXPERIENCES: FanExperience[] = [
  { id: 'fe1', playerId: 'p01', playerName: 'Marcus Johnson',    initials: 'MJ', hue: 215, type: 'shoutout',    title: 'Personalized Shoutout',   description: 'Marcus records a personal video shoutout for you or a friend — delivered in 48 hours.', price: 25, spotsLeft: 4,  isRaffle: false },
  { id: 'fe2', playerId: 'p05', playerName: 'Trey Coleman',      initials: 'TC', hue: 0,   type: 'signed-item', title: 'Signed Jersey #21',        description: 'Authentic game jersey hand-signed by Trey. Includes certificate of authenticity.',      price: 50, spotsLeft: 0,  isRaffle: false },
  { id: 'fe3', playerId: 'p03', playerName: 'Elijah Washington', initials: 'EW', hue: 280, type: 'raffle',      title: 'Meet & Greet Raffle',      description: 'Win a 15-min meet & greet with Elijah at the team facility. Monthly drawing.',          price: 10, spotsLeft: 12, isRaffle: true  },
  { id: 'fe4', playerId: 'p02', playerName: 'Devon Hayes',       initials: 'DH', hue: 160, type: 'training',    title: '1-on-1 Training Session',  description: 'Book a private 45-min ball-handling session with Devon at Burr Gymnasium.',             price: 75, spotsLeft: 2,  isRaffle: false },
];

// ── Practice Plan ─────────────────────────────────────────────────────────────

export const TODAY_PRACTICE = {
  date:   'Today, Mar 26',
  time:   '3:30 PM',
  venue:  'John B. Anderson Arena',
  focus:  'Howard Scout + PNR Execution',
  items: [
    { time: '3:30', duration: 15, label: 'Warmup + Stretch', category: 'conditioning' },
    { time: '3:45', duration: 20, label: 'Howard Zone Film Review', category: 'film' },
    { time: '4:05', duration: 25, label: 'Zone Offense Reps', category: 'offense' },
    { time: '4:30', duration: 20, label: 'PNR Execution — Marcus/Trey', category: 'offense' },
    { time: '4:50', duration: 15, label: 'Transition Defense', category: 'defense' },
    { time: '5:05', duration: 20, label: '5-on-5 Scrimmage (scout defense)', category: 'scrimmage' },
    { time: '5:25', duration: 10, label: 'Free Throws + Cooldown', category: 'conditioning' },
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
  if (overall >= 72) return '#1D9BF0';
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
    case 'Offered':   case 'Verbal':    return '#1D9BF0';
    case 'Evaluating':                  return '#D97757';
    case 'Identified':                  return '#8B6340';
    case 'Declined':                    return '#B85C5C';
    default:                            return '#8B6340';
  }
}

export function priorityColor(p: RecruitPriority): string {
  switch (p) {
    case 'Target': return '#D97757';
    case 'Offer':  return '#1D9BF0';
    case 'Watch':  return '#8B6340';
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
  { playerId: 'p09', pct: 40,  tier: 'Development' },
  { playerId: 'p10', pct: 60,  tier: 'Rotation' },
  { playerId: 'p12', pct: 40,  tier: 'Development' },
  { playerId: 'p14', pct: 50,  tier: 'Depth' },
  { playerId: 'p15', pct: 80,  tier: 'Development' },
];

export const DEVELOPMENT_PRIORITIES: { playerId: string; priorities: { trait: string; current: number; target: number }[] }[] = [
  { playerId: 'p01', priorities: [{ trait: '3PT Pull-Up', current: 72, target: 82 }, { trait: 'Defensive IQ', current: 74, target: 80 }, { trait: 'FT Rate', current: 82, target: 87 }] },
  { playerId: 'p03', priorities: [{ trait: 'Spot-Up 3PT', current: 62, target: 74 }, { trait: 'Post Moves', current: 58, target: 68 }, { trait: 'FT%', current: 71, target: 78 }] },
  { playerId: 'p05', priorities: [{ trait: 'FT%', current: 64, target: 74 }, { trait: 'Mid-Range', current: 52, target: 62 }, { trait: 'Playmaking', current: 61, target: 68 }] },
  { playerId: 'p06', priorities: [{ trait: '3PT Volume', current: 66, target: 75 }, { trait: 'On-Ball D', current: 61, target: 70 }, { trait: 'Decision Speed', current: 70, target: 78 }] },
];
