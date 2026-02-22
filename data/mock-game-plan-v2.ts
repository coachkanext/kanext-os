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
  opponent: 'University of Providence',
  date: 'Wed, Feb 19 \u2014 7:30 PM',
  location: 'Providence (Away)',
  status: 'in-review',
  version: 3,
  lastEditedBy: 'Coach Carter',
  lastEditedAt: 'Feb 17, 2026 · 9:14 AM',
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
    { id: 'ep-1', name: 'Horns PnR (Williams)', priority: 'primary', notes: 'Providence drops on PnR \u2014 Williams pull-up at elbow is money' },
    { id: 'ep-2', name: 'Pin-Down to Plantey 3', priority: 'primary', notes: 'Providence switches late on pin-downs \u2014 Plantey open on curl' },
    { id: 'ep-3', name: 'High-Low Post Feed', priority: 'secondary', notes: 'Diomande elbow to Carter block if zone shows' },
    { id: 'ep-4', name: 'Transition Push (4-on-3)', priority: 'primary', notes: 'Providence slow in transition \u2014 push every dead ball turnover' },
    { id: 'ep-5', name: 'Delay Lob', priority: 'situational', notes: 'End-of-clock action \u2014 Carter slip to rim off delay' },
  ],
  adjustments: [
    'If Providence switches to zone \u2192 overload strong side, post Diomande high',
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
    'If Providence hits 3 threes in a row \u2192 extend pack line to 3PT arc',
    'If foul trouble on Carter \u2192 Moore at 5, zone for 2 possessions',
  ],
};

export const KEY_MATCHUPS: KeyMatchup[] = [
  { id: 'km-1', ourPlayer: 'B. Williams', theirPlayer: 'D. Harris', matchupType: 'primary', notes: 'Harris is their engine. Williams must stay in front and contest pull-ups.', advantageRating: 1 },
  { id: 'km-2', ourPlayer: 'C. Plantey', theirPlayer: 'T. Mitchell', matchupType: 'primary', notes: 'Mitchell is a streaky shooter. Plantey length should contest effectively.', advantageRating: 1 },
  { id: 'km-3', ourPlayer: 'L. Carter', theirPlayer: 'J. Carter', matchupType: 'primary', notes: 'Carter is physical at the rim. Carter must avoid fouls while protecting paint.', advantageRating: 0 },
  { id: 'km-4', ourPlayer: 'A. Hernandez', theirPlayer: 'D. Harris', matchupType: 'switch', notes: 'Hernandez comes in if Harris is in a rhythm \u2014 lockdown defender, disrupts ball.', advantageRating: 2 },
];

export const ROTATION_PLAN: RotationSlot[] = [
  { period: '1H', startMin: 0, endMin: 6, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Carter'], notes: 'Starting five \u2014 establish tempo' },
  { period: '1H', startMin: 6, endMin: 10, lineup: ['Williams', 'Collins', 'Quinn', 'Diomande', 'Carter'], notes: 'Plantey rest, Collins in for shooting' },
  { period: '1H', startMin: 10, endMin: 14, lineup: ['Blake', 'Collins', 'Hernandez', 'Moore', 'Carter'], notes: 'Bench unit \u2014 defend and rebound' },
  { period: '1H', startMin: 14, endMin: 20, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Moore'], notes: 'Close half \u2014 Carter rest if 2 fouls' },
  { period: '2H', startMin: 0, endMin: 5, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Carter'], notes: 'Open with starters' },
  { period: '2H', startMin: 5, endMin: 10, lineup: ['Williams', 'Plantey', 'Hernandez', 'Diomande', 'Carter'], notes: 'Hernandez in for defensive stops' },
  { period: '2H', startMin: 10, endMin: 14, lineup: ['Blake', 'Collins', 'Hernandez', 'Moore', 'Carter'], notes: 'Bench run \u2014 maintain lead' },
  { period: '2H', startMin: 14, endMin: 20, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Carter'], notes: 'Closing five \u2014 no subs unless foul trouble' },
];

export const SCOUT_NOTES: ScoutNote[] = [
  { id: 'sn-1', category: 'key-player', title: 'D. Harris (PG #3)', detail: '22.4 PPG, 5.8 APG. Goes right 68% of the time. Pull-up jumper from left elbow is go-to. Below-average 3PT shooter (29.4%) but lethal in paint.', source: 'Synergy + Film', confidence: 'high' },
  { id: 'sn-2', category: 'tendency', title: 'Providence PnR Coverage', detail: 'Drop coverage 74% of possessions. Big sits at the nail. Ball handler has space for pull-up. Only switch on wings.', source: 'Synergy', confidence: 'high' },
  { id: 'sn-3', category: 'weakness', title: 'Transition Defense', detail: 'Providence ranks 142nd in transition defense. They give up 14.8 fast break PPG. Our biggest advantage.', source: 'Carroll Analytics', confidence: 'high' },
  { id: 'sn-4', category: 'strength', title: 'Offensive Rebounding', detail: 'Carter grabs 4.2 OREB/game. Providence as a team is top-20 in OREB%. Must box out every shot.', source: 'Synergy', confidence: 'medium' },
  { id: 'sn-5', category: 'situational', title: 'Late-Clock Sets', detail: 'When shot clock is under 8 seconds, Harris ISO left wing is their go-to. He shoots 38% in these spots.', source: 'Film', confidence: 'medium' },
];

export const STAFF_ASSIGNMENTS: StaffAssignment[] = [
  { id: 'sa-1', staffName: 'Coach Carter', role: 'HC', responsibility: 'Overall game plan execution, timeout decisions, lineup changes', pregameTask: 'Final scout review with team', inGameTask: 'Bench management, in-ear to assistants' },
  { id: 'sa-2', staffName: 'Coach Pearson', role: 'Assistant (Offense)', responsibility: 'Offensive adjustments, play calls from bench', pregameTask: 'Walk-through emphasis plays', inGameTask: 'Relay play calls, track shot chart' },
  { id: 'sa-3', staffName: 'Coach Davis', role: 'Assistant (Defense)', responsibility: 'Defensive matchups, PnR coverage calls', pregameTask: 'Defensive emphasis walkthrough', inGameTask: 'Monitor matchup data, call coverage adjustments' },
  { id: 'sa-4', staffName: 'Marcus Reed', role: 'Director of Ops', responsibility: 'Logistics, film coordination', pregameTask: 'Confirm travel, film setup', inGameTask: 'Live film tagging, stat tracking' },
];

// =============================================================================
// GAME PLAN 2: MSU-Northern (ARCHIVED — Carroll Won 72-65)
// =============================================================================

export const GAME_PLAN_HEADER_STT: GamePlanHeader = {
  id: 'gp-002',
  opponent: 'MSU-Northern',
  date: 'Sat, Feb 15 — 4:00 PM',
  location: 'PE Center (Home)',
  status: 'archived',
  version: 5,
  lastEditedBy: 'Coach Carter',
  lastEditedAt: 'Feb 16, 2026 · 10:30 AM',
  lockedBy: 'Coach Carter',
  lockedAt: 'Feb 15, 2026 · 1:00 PM',
  simWinPct: 61,
  simMargin: 3,
  simConfidence: 76,
  // @ts-ignore — optional enrichment
  data_source: 'demo_seed' as const,
  // @ts-ignore — optional enrichment
  postgameResult: { fmuScore: 72, oppScore: 65, outcome: 'W' } as const,
};

export const OFFENSIVE_PLAN_STT: OffensiveSystemPlan = {
  primarySystem: 'Motion Read & React',
  primaryStatus: 'confirmed',
  tempoTarget: 'Control',
  paceTarget: 67,
  emphasisPlays: [
    { id: 'ep-stt-1', name: 'Horns PnR (Williams)', priority: 'primary', notes: 'STT switches 1-4 — Williams pull-up at nail when big hesitates' },
    { id: 'ep-stt-2', name: 'Post Feed to Carter', priority: 'primary', notes: 'STT undersized at the 5 — Carter deep seal was automatic' },
    { id: 'ep-stt-3', name: 'Corner Pin-Down (Plantey)', priority: 'secondary', notes: 'Plantey hit 3 corner 3s off pin-downs in the 1st half' },
    { id: 'ep-stt-4', name: 'Transition Push', priority: 'primary', notes: 'STT slow getting back — 14 fast break points for Carroll' },
    { id: 'ep-stt-5', name: 'ATO Lob (Carter)', priority: 'situational', notes: 'Used twice in 4Q — Carter lob finish sealed the game' },
  ],
  adjustments: [
    'POSTGAME: Horns PnR generated 1.22 PPP — keep as primary action vs switching teams',
    'POSTGAME: Post feed to Carter worked early but STT started fronting in 3Q — need counter',
    'POSTGAME: Transition push was our best weapon (14 pts) — must sustain sprint-back effort',
  ],
};

export const DEFENSIVE_PLAN_STT: DefensiveSystemPlan = {
  primarySystem: 'Pack Line',
  primaryStatus: 'confirmed',
  pnrCoverage: 'Drop + switch on guards',
  postDefense: 'Front + weak-side dig',
  transitionScheme: 'Sprint back — no gamble steals',
  emphasisRules: [
    { id: 'dr-stt-1', rule: 'Deny J. Rivera the ball on wing — he scores 68% of points from wing ISO', priority: 'must' },
    { id: 'dr-stt-2', rule: 'No middle drives — STT guards attack middle 72% of the time', priority: 'must' },
    { id: 'dr-stt-3', rule: 'Switch 1-3 on all perimeter actions — STT runs heavy off-ball screens', priority: 'should' },
    { id: 'dr-stt-4', rule: 'Box out M. Contreras every shot — 3.8 OREB/game', priority: 'must' },
    { id: 'dr-stt-5', rule: 'Help from weak side on dribble penetration — stay loaded in pack line', priority: 'should' },
  ],
  adjustments: [
    'POSTGAME: Rivera scored 22 — denied wing ISO but he found mid-range. Need to extend denial to mid-post',
    'POSTGAME: Pack line held them to 38% FG in 2nd half. Effective — keep this game plan template',
    'POSTGAME: Only 4 OREB allowed — box-out discipline was excellent',
  ],
};

export const KEY_MATCHUPS_STT: KeyMatchup[] = [
  { id: 'km-stt-1', ourPlayer: 'B. Williams', theirPlayer: 'J. Rivera', matchupType: 'primary', notes: 'Rivera is their best player. Williams stayed in front and contested. Rivera scored 22 but on 8-19 shooting.', advantageRating: 1 },
  { id: 'km-stt-2', ourPlayer: 'L. Carter', theirPlayer: 'M. Contreras', matchupType: 'primary', notes: 'Carter dominated inside — 18 pts, 11 reb, 3 blk. Contreras had no answer.', advantageRating: 2 },
  { id: 'km-stt-3', ourPlayer: 'C. Plantey', theirPlayer: 'R. Santos', matchupType: 'primary', notes: 'Santos is quick but undersized. Plantey shot over him all game — 14 pts on 5-9 3PT.', advantageRating: 2 },
  { id: 'km-stt-4', ourPlayer: 'A. Hernandez', theirPlayer: 'J. Rivera', matchupType: 'switch', notes: 'Hernandez came in for defensive possessions in 4Q. Rivera 0-3 against Hernandez.', advantageRating: 2 },
  { id: 'km-stt-5', ourPlayer: 'N. Quinn', theirPlayer: 'L. Baptiste', matchupType: 'primary', notes: 'Quinn controlled Baptiste on both ends. 8 pts, 4 reb, 2 stl for Quinn.', advantageRating: 1 },
];

export const ROTATION_PLAN_STT: RotationSlot[] = [
  { period: '1H', startMin: 0, endMin: 6, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Carter'], notes: 'Starting five — established early post presence' },
  { period: '1H', startMin: 6, endMin: 10, lineup: ['Williams', 'Collins', 'Quinn', 'Diomande', 'Carter'], notes: 'Collins in for shooting — hit 2 catch-and-shoot 3s' },
  { period: '1H', startMin: 10, endMin: 14, lineup: ['Blake', 'Collins', 'Hernandez', 'Moore', 'Carter'], notes: 'Bench unit — held lead at +6' },
  { period: '1H', startMin: 14, endMin: 20, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Moore'], notes: 'Closed half up 35-30' },
  { period: '2H', startMin: 0, endMin: 5, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Carter'], notes: 'Starters opened 2H — 8-0 run' },
  { period: '2H', startMin: 5, endMin: 10, lineup: ['Williams', 'Plantey', 'Hernandez', 'Diomande', 'Carter'], notes: 'Hernandez in for defensive stops' },
  { period: '2H', startMin: 10, endMin: 14, lineup: ['Blake', 'Collins', 'Hernandez', 'Moore', 'Carter'], notes: 'Bench stretch — STT cut it to 5' },
  { period: '2H', startMin: 14, endMin: 20, lineup: ['Williams', 'Plantey', 'Hernandez', 'Diomande', 'Carter'], notes: 'Closing lineup — Hernandez for Quinn (defense). Closed it out 72-65' },
];

export const SCOUT_NOTES_STT: ScoutNote[] = [
  { id: 'sn-stt-1', category: 'key-player', title: 'J. Rivera (SG #2)', detail: '19.8 PPG, 4.2 APG. Wing ISO is bread and butter. Scored 22 but on inefficient 8-19. Mid-range game is dangerous.', source: 'Synergy + Film', confidence: 'high' },
  { id: 'sn-stt-2', category: 'tendency', title: 'STT Off-Ball Screens', detail: 'STT runs 12+ off-ball screens per game. Must switch cleanly 1-3. No getting caught on screens.', source: 'Synergy', confidence: 'high' },
  { id: 'sn-stt-3', category: 'weakness', title: 'Interior Defense', detail: 'STT allows 42.6 pts in the paint. Carter feasted — 18 pts inside. Repeat this approach.', source: 'Carroll Analytics', confidence: 'high' },
  { id: 'sn-stt-4', category: 'weakness', title: 'Transition Defense', detail: 'STT ranks bottom-10 in Frontier Conference in transition D. Carroll scored 14 fast break points.', source: 'Carroll Analytics', confidence: 'high' },
  { id: 'sn-stt-5', category: 'situational', title: 'End-of-Half Plays', detail: 'STT ran ATO side PnR for Rivera at end of both halves. Scored on 1 of 3 attempts. Manageable.', source: 'Film', confidence: 'medium' },
];

export const STAFF_ASSIGNMENTS_STT: StaffAssignment[] = [
  { id: 'sa-stt-1', staffName: 'Coach Carter', role: 'HC', responsibility: 'Overall game plan execution, postgame film breakdown', pregameTask: 'Final scout review', inGameTask: 'Bench management — key 4Q timeout at 62-60 led to ATO lob' },
  { id: 'sa-stt-2', staffName: 'Coach Pearson', role: 'Assistant (Offense)', responsibility: 'Offensive adjustments, in-game play calls', pregameTask: 'Walk-through emphasis plays', inGameTask: 'Called Horns PnR at 5:30 4Q — led to Williams pull-up bucket' },
  { id: 'sa-stt-3', staffName: 'Coach Davis', role: 'Assistant (Defense)', responsibility: 'Defensive matchups, Rivera containment', pregameTask: 'Defensive walkthrough — Rivera deny', inGameTask: 'Switched Hernandez onto Rivera in 4Q — Rivera 0-3 from that point' },
  { id: 'sa-stt-4', staffName: 'Marcus Reed', role: 'Director of Ops', responsibility: 'Postgame film tagging, stat reconciliation', pregameTask: 'Film setup, travel logistics', inGameTask: 'Live film tagging — tagged 14 key possessions for review' },
];

// =============================================================================
// GAME PLAN 3: Rocky Mountain College (DRAFT — Upcoming Feb 22)
// =============================================================================

export const GAME_PLAN_HEADER_SEU: GamePlanHeader = {
  id: 'gp-003',
  opponent: 'Rocky Mountain College',
  date: 'Sat, Feb 22 — 2:00 PM',
  location: 'PE Center (Home)',
  status: 'draft',
  version: 1,
  lastEditedBy: 'Coach Pearson',
  lastEditedAt: 'Feb 18, 2026 · 3:45 PM',
  simWinPct: 58,
  simMargin: 2,
  simConfidence: 72,
  // @ts-ignore — optional enrichment
  data_source: 'demo_seed' as const,
};

export const OFFENSIVE_PLAN_SEU: OffensiveSystemPlan = {
  primarySystem: 'Motion Read & React',
  primaryStatus: 'provisional',
  tempoTarget: 'Push',
  paceTarget: 74,
  emphasisPlays: [
    { id: 'ep-seu-1', name: 'Horns PnR (Williams)', priority: 'primary', notes: 'SEU hedges hard on PnR — Williams must reject screen and attack downhill' },
    { id: 'ep-seu-2', name: 'Elbow Action (Diomande)', priority: 'primary', notes: 'Diomande at elbow — if help comes from weak side, kick to corner 3' },
    { id: 'ep-seu-3', name: 'Stagger Screen for Plantey', priority: 'primary', notes: 'SEU struggles chasing through staggers — Plantey curl for catch-and-shoot' },
    { id: 'ep-seu-4', name: 'Transition Push (4-on-3)', priority: 'primary', notes: 'SEU takes 4.2 seconds to set defense — attack in first 3 seconds of shot clock' },
    { id: 'ep-seu-5', name: 'Back Screen Lob (Carter)', priority: 'secondary', notes: 'SEU bigs ball-watch on back screens — Carter slips for lob' },
    { id: 'ep-seu-6', name: 'ATO Flex Action', priority: 'situational', notes: 'After timeouts — flex screen for Quinn mid-range or Carter post-up' },
  ],
  adjustments: [
    'If SEU goes zone → high-low with Diomande/Carter, 3PT shooters in corners',
    'If Williams gets trapped on PnR → Blake enters, same sets but slower pace',
    'If SEU press → Plantey and Quinn on ball-side, attack with numbers in frontcourt',
    'If leading by 8+ → motion only, burn clock, post-ups for Carter/Diomande',
  ],
};

export const DEFENSIVE_PLAN_SEU: DefensiveSystemPlan = {
  primarySystem: 'Pack Line',
  primaryStatus: 'provisional',
  pnrCoverage: 'Hedge and recover — drop if their big pops',
  postDefense: 'Front the post — dig from weak-side wing',
  transitionScheme: 'Sprint back, load the paint, no transition 3s allowed',
  emphasisRules: [
    { id: 'dr-seu-1', rule: 'Force T. Robinson left — shoots 44% going right, 28% going left', priority: 'must' },
    { id: 'dr-seu-2', rule: 'No open corner 3s — SEU shoots 39.2% from corners (conference best)', priority: 'must' },
    { id: 'dr-seu-3', rule: 'Switch 1-3 on all perimeter screens — do NOT let Robinson come off clean', priority: 'must' },
    { id: 'dr-seu-4', rule: 'Box out K. Anderson every shot — he crashes hard from the wing', priority: 'should' },
    { id: 'dr-seu-5', rule: 'Pack line stays loaded against dribble penetration — no middle drives', priority: 'must' },
    { id: 'dr-seu-6', rule: 'Closeout under control on all perimeter shooters — SEU pump fakes and drives', priority: 'should' },
  ],
  adjustments: [
    'If Robinson is hitting pull-ups → face-guard with Hernandez',
    'If SEU corner 3s are falling → extend pack line, live with mid-range',
    'If SEU pushes pace → set defense in 3 seconds, no transition baskets allowed',
    'If foul trouble on Carter → Moore at 5, zone for 2 possessions to slow them down',
  ],
};

export const KEY_MATCHUPS_SEU: KeyMatchup[] = [
  { id: 'km-seu-1', ourPlayer: 'B. Williams', theirPlayer: 'T. Robinson', matchupType: 'primary', notes: 'Robinson is their go-to scorer (20.1 PPG). Williams must force him left and contest every look.', advantageRating: 0 },
  { id: 'km-seu-2', ourPlayer: 'C. Plantey', theirPlayer: 'D. Okafor', matchupType: 'primary', notes: 'Okafor is a 3-and-D wing. Plantey must stay tight on catch-and-shoot but can attack him off the dribble.', advantageRating: 1 },
  { id: 'km-seu-3', ourPlayer: 'L. Carter', theirPlayer: 'M. Jefferson', matchupType: 'primary', notes: 'Jefferson is physical but limited offensively. Carter should dominate inside. Foul discipline is key.', advantageRating: 1 },
  { id: 'km-seu-4', ourPlayer: 'N. Quinn', theirPlayer: 'K. Anderson', matchupType: 'primary', notes: 'Anderson crashes boards hard. Quinn must box out and limit second-chance points.', advantageRating: 0 },
  { id: 'km-seu-5', ourPlayer: 'A. Hernandez', theirPlayer: 'T. Robinson', matchupType: 'switch', notes: 'If Robinson gets hot, Hernandez comes in for lockdown minutes. Robinson shot 3-11 against Hernandez last meeting.', advantageRating: 2 },
  { id: 'km-seu-6', ourPlayer: 'P. Diomande', theirPlayer: 'J. Hayes', matchupType: 'primary', notes: 'Hayes is a stretch-4 who can shoot. Diomande must close out and not help off him.', advantageRating: -1 },
];

export const ROTATION_PLAN_SEU: RotationSlot[] = [
  { period: '1H', startMin: 0, endMin: 6, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Carter'], notes: 'Starting five — set the tone early, establish post presence' },
  { period: '1H', startMin: 6, endMin: 10, lineup: ['Williams', 'Collins', 'Quinn', 'Diomande', 'Carter'], notes: 'Collins in for extra shooting — attack zone if they switch' },
  { period: '1H', startMin: 10, endMin: 14, lineup: ['Blake', 'Collins', 'Hernandez', 'Moore', 'Carter'], notes: 'Bench unit — energy and defense, maintain lead' },
  { period: '1H', startMin: 14, endMin: 20, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Moore'], notes: 'Close half — Moore stays for rebounding vs Anderson' },
  { period: '2H', startMin: 0, endMin: 5, lineup: ['Williams', 'Plantey', 'Quinn', 'Diomande', 'Carter'], notes: 'Open with starters — fast start to 2nd half' },
  { period: '2H', startMin: 5, endMin: 10, lineup: ['Williams', 'Plantey', 'Hernandez', 'Diomande', 'Carter'], notes: 'Hernandez for defensive possessions — lock down Robinson' },
  { period: '2H', startMin: 10, endMin: 14, lineup: ['Blake', 'Collins', 'Hernandez', 'Moore', 'Carter'], notes: 'Bench run — protect lead with defense-first unit' },
  { period: '2H', startMin: 14, endMin: 20, lineup: ['Williams', 'Plantey', 'Hernandez', 'Diomande', 'Carter'], notes: 'Closing five — Hernandez over Quinn if Robinson is hot' },
];

export const SCOUT_NOTES_SEU: ScoutNote[] = [
  { id: 'sn-seu-1', category: 'key-player', title: 'T. Robinson (PG #1)', detail: '20.1 PPG, 5.4 APG. Goes right 71% of possessions. Pull-up from right wing and free throw line extended are go-to spots. 34.8% from 3 but 48% from mid-range.', source: 'Synergy + Film', confidence: 'high' },
  { id: 'sn-seu-2', category: 'key-player', title: 'K. Anderson (SF #22)', detail: '12.6 PPG, 7.8 RPG. Crashes offensive glass hard — 3.4 OREB/game. Limited outside shot but finishes in transition.', source: 'Synergy', confidence: 'high' },
  { id: 'sn-seu-3', category: 'tendency', title: 'SEU PnR Coverage', detail: 'SEU hedges hard on ball screens (82% of PnR possessions). Roller is often open if handler rejects screen. Pop coverage is weaker — big drops back on pop.', source: 'Synergy', confidence: 'high' },
  { id: 'sn-seu-4', category: 'weakness', title: 'Transition Defense', detail: 'SEU ranks 9th in Frontier Conference in transition defense. They give up 13.4 fast break PPG. Attackable if we push pace.', source: 'Carroll Analytics', confidence: 'medium' },
  { id: 'sn-seu-5', category: 'strength', title: 'Corner 3PT Shooting', detail: 'SEU shoots 39.2% from corners — best in conference. D. Okafor and J. Hayes are primary corner threats. Must close out.', source: 'Carroll Analytics', confidence: 'high' },
  { id: 'sn-seu-6', category: 'weakness', title: 'Interior Defense', detail: 'SEU allows 40.8 pts in paint. Jefferson is their only rim protector. When he sits, paint is open. Feed Carter/Diomande.', source: 'Carroll Analytics', confidence: 'high' },
  { id: 'sn-seu-7', category: 'situational', title: 'Press After Makes', detail: 'SEU presses full-court after made baskets in the 2nd half (happened in 4 of last 6 games). Be ready with press break.', source: 'Film', confidence: 'medium' },
];

export const STAFF_ASSIGNMENTS_SEU: StaffAssignment[] = [
  { id: 'sa-seu-1', staffName: 'Coach Carter', role: 'HC', responsibility: 'Overall game plan execution, Robinson containment strategy', pregameTask: 'Final scout review with team — emphasize corner 3 closeouts', inGameTask: 'Bench management, timeout strategy, Hernandez rotation timing' },
  { id: 'sa-seu-2', staffName: 'Coach Pearson', role: 'Assistant (Offense)', responsibility: 'Offensive adjustments, PnR play calls', pregameTask: 'Walk-through: Horns PnR reject, stagger screens', inGameTask: 'Relay play calls, track shot selection data' },
  { id: 'sa-seu-3', staffName: 'Coach Davis', role: 'Assistant (Defense)', responsibility: 'Defensive matchups, Robinson force-left emphasis', pregameTask: 'Defensive emphasis walkthrough — corner closeouts', inGameTask: 'Monitor Robinson shooting splits, call coverage switches' },
  { id: 'sa-seu-4', staffName: 'Marcus Reed', role: 'Director of Ops', responsibility: 'Home game logistics, film coordination', pregameTask: 'Gym setup, film angles confirmed', inGameTask: 'Live film tagging, stat tracking, halftime quick-hits' },
];

// =============================================================================
// GAME PLANS ARRAY (all plans)
// =============================================================================

export interface FullGamePlan {
  header: GamePlanHeader;
  offense: OffensiveSystemPlan;
  defense: DefensiveSystemPlan;
  matchups: KeyMatchup[];
  rotation: RotationSlot[];
  scoutNotes: ScoutNote[];
  staffAssignments: StaffAssignment[];
  data_source?: string;
}

/** All game plans indexed — gp-001 Providence (in-review), gp-002 STT (archived), gp-003 SEU (draft) */
export const GAME_PLANS: FullGamePlan[] = [
  {
    header: GAME_PLAN_HEADER,
    offense: OFFENSIVE_PLAN,
    defense: DEFENSIVE_PLAN,
    matchups: KEY_MATCHUPS,
    rotation: ROTATION_PLAN,
    scoutNotes: SCOUT_NOTES,
    staffAssignments: STAFF_ASSIGNMENTS,
    data_source: 'demo_seed',
  },
  {
    header: GAME_PLAN_HEADER_STT,
    offense: OFFENSIVE_PLAN_STT,
    defense: DEFENSIVE_PLAN_STT,
    matchups: KEY_MATCHUPS_STT,
    rotation: ROTATION_PLAN_STT,
    scoutNotes: SCOUT_NOTES_STT,
    staffAssignments: STAFF_ASSIGNMENTS_STT,
    data_source: 'demo_seed',
  },
  {
    header: GAME_PLAN_HEADER_SEU,
    offense: OFFENSIVE_PLAN_SEU,
    defense: DEFENSIVE_PLAN_SEU,
    matchups: KEY_MATCHUPS_SEU,
    rotation: ROTATION_PLAN_SEU,
    scoutNotes: SCOUT_NOTES_SEU,
    staffAssignments: STAFF_ASSIGNMENTS_SEU,
    data_source: 'demo_seed',
  },
];

/** Convenience: all plan headers for list views */
export const GAME_PLAN_HEADERS: GamePlanHeader[] = GAME_PLANS.map((p) => p.header);
