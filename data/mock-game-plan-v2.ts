/**
 * Mock Game Plan V2 \u2014 Full Game Plan OS.
 * Sections: Plan Header, Offensive System, Defensive System, Key Matchups,
 * Rotation Plan, Timeout Strategy, Scout Notes, Staff Assignments.
 */

// =============================================================================
// TYPES
// =============================================================================

export type PlanStatus = 'draft' | 'in-review' | 'locked' | 'archived';
export type SystemStatus = 'confirmed' | 'provisional' | 'scouted';

export interface GamePlanHeader {
  id: string;
  opponent: string;
  date: string;
  location: string;
  status: PlanStatus;
  version: number;
  lastEditedBy: string;
  lastEditedAt: string;
  lockedBy?: string;
  lockedAt?: string;
  simWinPct: number;
  simMargin: number;
  simConfidence: number;
}

export interface OffensiveSystemPlan {
  primarySystem: string;
  primaryStatus: SystemStatus;
  tempoTarget: string;
  paceTarget: number;
  emphasisPlays: { id: string; name: string; priority: 'primary' | 'secondary' | 'situational'; notes: string }[];
  adjustments: string[];
}

export interface DefensiveSystemPlan {
  primarySystem: string;
  primaryStatus: SystemStatus;
  pnrCoverage: string;
  postDefense: string;
  transitionScheme: string;
  emphasisRules: { id: string; rule: string; priority: 'must' | 'should' | 'nice-to-have' }[];
  adjustments: string[];
}

export interface KeyMatchup {
  id: string;
  ourPlayer: string;
  theirPlayer: string;
  matchupType: 'primary' | 'switch' | 'help';
  notes: string;
  advantageRating: number; // -2 to +2
}

export interface RotationSlot {
  period: string;
  startMin: number;
  endMin: number;
  lineup: string[];
  notes?: string;
}

export interface StaffAssignment {
  id: string;
  staffName: string;
  role: string;
  responsibility: string;
  pregameTask?: string;
  inGameTask?: string;
}

export interface ScoutNote {
  id: string;
  category: 'tendency' | 'weakness' | 'strength' | 'key-player' | 'situational';
  title: string;
  detail: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
}

// =============================================================================
// DATA
// =============================================================================

export const GAME_PLAN_HEADER: GamePlanHeader = {
  id: 'gp-001',
  opponent: 'Keiser University',
  date: 'Wed, Feb 19 \u2014 7:30 PM',
  location: 'Keiser (Away)',
  status: 'in-review',
  version: 3,
  lastEditedBy: 'Coach Kalejaiye',
  lastEditedAt: 'Feb 17, 2026 \u00b7 9:14 AM',
  simWinPct: 64,
  simMargin: 4,
  simConfidence: 78,
};

export const OFFENSIVE_PLAN: OffensiveSystemPlan = {
  primarySystem: 'Motion Read & React',
  primaryStatus: 'confirmed',
  tempoTarget: 'Push',
  paceTarget: 72,
  emphasisPlays: [
    { id: 'ep-1', name: 'Horns PnR (Williams)', priority: 'primary', notes: 'Keiser drops on PnR \u2014 Williams pull-up at elbow is money' },
    { id: 'ep-2', name: 'Pin-Down to Plantey 3', priority: 'primary', notes: 'Keiser switches late on pin-downs \u2014 Plantey open on curl' },
    { id: 'ep-3', name: 'High-Low Post Feed', priority: 'secondary', notes: 'Diomande elbow to Kalejaiye block if zone shows' },
    { id: 'ep-4', name: 'Transition Push (4-on-3)', priority: 'primary', notes: 'Keiser slow in transition \u2014 push every dead ball turnover' },
    { id: 'ep-5', name: 'Delay Lob', priority: 'situational', notes: 'End-of-clock action \u2014 Kalejaiye slip to rim off delay' },
  ],
  adjustments: [
    'If Keiser switches to zone \u2192 overload strong side, post Diomande high',
    'If Williams in foul trouble \u2192 Blake runs same PnR sets, slower pace',
    'If leading by 10+ \u2192 bleed clock, motion only, no forced shots',
  ],
};

export const DEFENSIVE_PLAN: DefensiveSystemPlan = {
  primarySystem: 'Pack Line',
  primaryStatus: 'confirmed',
  pnrCoverage: 'Hedge and recover',
  postDefense: 'Front the post, weak-side help at rim',
  transitionScheme: 'Sprint back, no gamble steals in backcourt',
  emphasisRules: [
    { id: 'dr-1', rule: 'Force Harris left \u2014 he shoots 42% going right, 31% going left', priority: 'must' },
    { id: 'dr-2', rule: 'No middle penetration \u2014 pack line stays loaded', priority: 'must' },
    { id: 'dr-3', rule: 'Close out under control on Mitchell \u2014 he pump fakes and drives', priority: 'should' },
    { id: 'dr-4', rule: 'Box out Carter on every possession \u2014 he gets 4.2 OREB/game', priority: 'must' },
    { id: 'dr-5', rule: 'Switch 1-3 on perimeter screens \u2014 no switching bigs', priority: 'should' },
  ],
  adjustments: [
    'If Harris is cooking 1-on-1 \u2192 face-guard with Hernandez',
    'If Keiser hits 3 threes in a row \u2192 extend pack line to 3PT arc',
    'If foul trouble on Kalejaiye \u2192 Moore at 5, zone for 2 possessions',
  ],
};

export const KEY_MATCHUPS: KeyMatchup[] = [
  { id: 'km-1', ourPlayer: 'B. Williams', theirPlayer: 'D. Harris', matchupType: 'primary', notes: 'Harris is their engine. Williams must stay in front and contest pull-ups.', advantageRating: 1 },
  { id: 'km-2', ourPlayer: 'C. Plantey', theirPlayer: 'T. Mitchell', matchupType: 'primary', notes: 'Mitchell is a streaky shooter. Plantey length should contest effectively.', advantageRating: 1 },
  { id: 'km-3', ourPlayer: 'L. Kalejaiye', theirPlayer: 'J. Carter', matchupType: 'primary', notes: 'Carter is physical at the rim. Kalejaiye must avoid fouls while protecting paint.', advantageRating: 0 },
  { id: 'km-4', ourPlayer: 'A. Hernandez', theirPlayer: 'D. Harris', matchupType: 'switch', notes: 'Hernandez comes in if Harris is in a rhythm \u2014 lockdown defender, disrupts ball.', advantageRating: 2 },
];

export const ROTATION_PLAN: RotationSlot[] = [
  { period: '1H', startMin: 0, endMin: 6, lineup: ['Williams', 'Plantey', 'Chtelan', 'Diomande', 'Kalejaiye'], notes: 'Starting five \u2014 establish tempo' },
  { period: '1H', startMin: 6, endMin: 10, lineup: ['Williams', 'Collins', 'Chtelan', 'Diomande', 'Kalejaiye'], notes: 'Plantey rest, Collins in for shooting' },
  { period: '1H', startMin: 10, endMin: 14, lineup: ['Blake', 'Collins', 'Hernandez', 'Moore', 'Kalejaiye'], notes: 'Bench unit \u2014 defend and rebound' },
  { period: '1H', startMin: 14, endMin: 20, lineup: ['Williams', 'Plantey', 'Chtelan', 'Diomande', 'Moore'], notes: 'Close half \u2014 Kalejaiye rest if 2 fouls' },
  { period: '2H', startMin: 0, endMin: 5, lineup: ['Williams', 'Plantey', 'Chtelan', 'Diomande', 'Kalejaiye'], notes: 'Open with starters' },
  { period: '2H', startMin: 5, endMin: 10, lineup: ['Williams', 'Plantey', 'Hernandez', 'Diomande', 'Kalejaiye'], notes: 'Hernandez in for defensive stops' },
  { period: '2H', startMin: 10, endMin: 14, lineup: ['Blake', 'Collins', 'Hernandez', 'Moore', 'Kalejaiye'], notes: 'Bench run \u2014 maintain lead' },
  { period: '2H', startMin: 14, endMin: 20, lineup: ['Williams', 'Plantey', 'Chtelan', 'Diomande', 'Kalejaiye'], notes: 'Closing five \u2014 no subs unless foul trouble' },
];

export const SCOUT_NOTES: ScoutNote[] = [
  { id: 'sn-1', category: 'key-player', title: 'D. Harris (PG #3)', detail: '22.4 PPG, 5.8 APG. Goes right 68% of the time. Pull-up jumper from left elbow is go-to. Below-average 3PT shooter (29.4%) but lethal in paint.', source: 'Synergy + Film', confidence: 'high' },
  { id: 'sn-2', category: 'tendency', title: 'Keiser PnR Coverage', detail: 'Drop coverage 74% of possessions. Big sits at the nail. Ball handler has space for pull-up. Only switch on wings.', source: 'Synergy', confidence: 'high' },
  { id: 'sn-3', category: 'weakness', title: 'Transition Defense', detail: 'Keiser ranks 142nd in transition defense. They give up 14.8 fast break PPG. Our biggest advantage.', source: 'KaNeXT Analytics', confidence: 'high' },
  { id: 'sn-4', category: 'strength', title: 'Offensive Rebounding', detail: 'Carter grabs 4.2 OREB/game. Keiser as a team is top-20 in OREB%. Must box out every shot.', source: 'Synergy', confidence: 'medium' },
  { id: 'sn-5', category: 'situational', title: 'Late-Clock Sets', detail: 'When shot clock is under 8 seconds, Harris ISO left wing is their go-to. He shoots 38% in these spots.', source: 'Film', confidence: 'medium' },
];

export const STAFF_ASSIGNMENTS: StaffAssignment[] = [
  { id: 'sa-1', staffName: 'Coach Kalejaiye', role: 'HC', responsibility: 'Overall game plan execution, timeout decisions, lineup changes', pregameTask: 'Final scout review with team', inGameTask: 'Bench management, in-ear to assistants' },
  { id: 'sa-2', staffName: 'Coach Williams', role: 'Assistant (Offense)', responsibility: 'Offensive adjustments, play calls from bench', pregameTask: 'Walk-through emphasis plays', inGameTask: 'Relay play calls, track shot chart' },
  { id: 'sa-3', staffName: 'Coach Davis', role: 'Assistant (Defense)', responsibility: 'Defensive matchups, PnR coverage calls', pregameTask: 'Defensive emphasis walkthrough', inGameTask: 'Monitor matchup data, call coverage adjustments' },
  { id: 'sa-4', staffName: 'Marcus Reed', role: 'Director of Ops', responsibility: 'Logistics, film coordination', pregameTask: 'Confirm travel, film setup', inGameTask: 'Live film tagging, stat tracking' },
];
