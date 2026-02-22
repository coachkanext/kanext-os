/**
 * Game Plan V2 — Mock data generator.
 * Produces a full 11-section GamePlanV2Packet for any upcoming game.
 */

import {
  KaNeXT_GAMES_BY_ID,
  KaNeXT_NEXT_GAME_ID,
  KaNeXT_PREGAME,
  KaNeXT_LEADERS,
  ROSTER_KR,
  jerseyArchetypeMap,
  KaNeXT_PLAYER_BIOS,
  DNA_OFFENSE_POOL,
  DNA_DEFENSE_POOL,
  DNA_TEMPO_POOL,
  stableHash,
} from './fmu';

import type {
  GamePlanV2Packet,
  StaffAssignment,
  AssignmentStatus,
  ScoutConfidenceGate,
  DataTier,
  DecisionBullet,
  DoNotBreakRule,
  OSIE,
  ShotDietEntry,
  IfThenCard,
  MatchupOverlay,
  OppOffenseData,
  DSIE,
  OppDefenseData,
  ShotProfileData,
  TeamZone,
  PlayerPermission,
  ShotPermission,
  ActionCard,
  RiskLevel,
  SituationPlay,
  SituationType,
  RotationPlayer,
  PositionGroup,
  PlayerGuardCard,
  ConstraintsRiskData,
  HardConstraint,
  ConstraintSource,
  Risk,
  Severity,
  DrillSegment,
  StaffRole,
} from '@/components/game-plan/game-plan-types';

// ── Helper ──

function pick<T>(pool: T[], s: string, seed: number): T {
  return pool[stableHash(s, seed) % pool.length];
}

function pickN<T>(pool: T[], s: string, baseSeed: number, count: number): T[] {
  const result: T[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx = stableHash(s, baseSeed + i * 7) % pool.length;
    while (used.has(idx)) idx = (idx + 1) % pool.length;
    used.add(idx);
    result.push(pool[idx]);
  }
  return result;
}

// ── Text Pools ──

const ACTION_NAME_POOL = [
  'Horns Flare', 'Pistol DHO', 'Elbow Pop', 'Spain PNR', 'Floppy', 'Zipper Cut',
  'Punch 5', 'Drag Screen', 'Angle PNR', 'Flex Stagger', 'UCLA Cut', 'Elevator',
  'Loop Action', 'Weave Entry', 'Shake DHO',
];

const SITUATION_PLAY_POOL = [
  { name: 'Box Flat', desc: 'Screener sprints to elbow, shooter curls baseline' },
  { name: 'Sideline Rip', desc: 'Inbound to wing, back-cut for layup' },
  { name: 'Stack 3', desc: 'Triple stack, read defense for curl or flare' },
  { name: 'Corner Thunder', desc: 'Post pins down, shooter lifts to corner three' },
  { name: 'Diamond Press Break', desc: '1-2-1-1 alignment, middle man receives outlet' },
  { name: 'Chin EOH', desc: 'Post seal + lob on end-of-half last shot' },
  { name: 'Late Iso', desc: 'Clear out for primary scorer, drive or pull-up' },
  { name: 'Zone Overload', desc: 'Ball-side overload forces help, skip pass for open 3' },
  { name: 'ATO Slice', desc: 'Guard to guard screen, slip to rim' },
  { name: 'Press Outlet', desc: 'Reversal to outlet man advancing past half-court' },
  { name: 'EOH Hammer', desc: 'Off-ball screen for corner three as clock expires' },
  { name: 'Late Clock PNR', desc: 'High PNR for primary creator, roll or pop read' },
  { name: 'Zone Short Corner', desc: 'Short corner entry, dump to post or kick for three' },
  { name: 'ATO Fist', desc: 'Double ball-screen, read & react off two screeners' },
  { name: 'Press Advance', desc: 'Long baseball pass to rim runner on deep sprint' },
];

const DRILL_NAME_POOL = [
  'Shell Rotation Drill', '3-on-3 Closeout', 'Transition 5v0', 'PNR Coverage Walk-Through',
  'Half-Court Sets Install', 'Free Throw Pressure', 'End-of-Game Situations',
  'Press Break Live', 'Zone Attack 5v5', 'Guard Containment 1v1',
  'Post Seal Drill', 'Shooting Circuit', 'Help & Recover 4v4',
  'ATO Walk-Through', 'Pace Push Drill', 'Rebounding War',
];

const DIRECTIONALITY_POOL = [
  'Drives left exclusively', 'Prefers right hand', 'Ambidextrous finisher',
  'Strong baseline driver', 'Middle-drive dominant', 'Pick & pop only',
  'Attacks off catches only', 'ISO-heavy left shoulder', 'Weak going right under pressure',
  'Euro-step finisher', 'Floater specialist', 'Pull-up mid-range right wing',
  'Attacks closeouts hard left', 'No dribble-drive game', 'Straight-line driver',
];

const COVERAGE_RESPONSE_POOL = [
  'Top-lock, force baseline', 'Go under screens, contest late',
  'Switch all ball-screens', 'Ice PNR, contain ball', 'Show and recover',
  'Blitz and rotate', 'Trap sideline, rotate weak-side', 'Deny catch completely',
  'Zone him out', 'Sag off, pack the lane', 'Hard hedge and sprint back',
  'Soft switch, re-switch post', 'Full deny + help tag', 'Play straight up, no help',
  'Trail on screens, contest at rim',
];

const TO_STRESS_POOL = [
  'Turns it over under half-court pressure',
  'Careless in transition — telegraphs passes',
  'Dribbles into traffic, creates live-ball TOs',
  'Weak with off-hand when trapped',
  'Forced into bad passes when denied',
  'Handles break down in late-clock situations',
  'Cross-court passes intercepted regularly',
  'Susceptible to jump-ball traps',
  'Panics when doubled on the wing',
  'Baseline drives result in charges',
  'No turnover issues — protect the ball well',
  'Predictable spin move leads to steals',
  'Will throw it away if you speed him up',
  'Back-to-basket turnovers when fronted',
  'Low TO rate — don\'t gamble for steals',
];

const FOUL_PROFILE_POOL = [
  'Picks up cheap fouls in transition',
  'Reaches on ball-handlers — gets in foul trouble',
  'Foul-prone in the post — attack early',
  'Clean defender, rarely fouls',
  'Fouls on contested rebounds',
  'Commits and-1 fouls on drives',
  'Gets away with hand-checking — refs inconsistent',
  'Aggressive ball denial leads to whistles',
  'Two quick fouls = benched, exploit this',
  'Physical player — will test officials',
  'Plays through foul trouble unwisely',
  'Smart with his hands — doesn\'t foul',
  'Historically in foul trouble vs physical teams',
  'Hack-a strategy viable (poor FT shooter)',
  'No foul concerns — low foul rate',
];

const GUARD_RULES_POOL = [
  'Force left, no middle penetration',
  'Go under on screens — he can\'t shoot',
  'Top-lock, deny the three-point catch',
  'No straight-line drives — wall up',
  'Deny post touches, front at all times',
  'Let him shoot contested twos',
  'Switch everything — no mismatches',
  'Full deny on catch, help one pass away',
  'Sag off him — dare the jumper',
  'No foul — he lives at the line',
  'Blitz every ball-screen he uses',
  'Contain and funnel to help',
  'Don\'t leave him on kick-outs',
  'Tag on rolls, recover to shooter',
  'Push him off his spots — no comfort zone',
];

const CONSTRAINT_POOL = [
  'Do not switch bigs onto guards in PNR',
  'Keep #4 under 32 minutes (load management)',
  'No zone in the first half — save for adjustments',
  'Must have a rim protector on the floor at all times',
  'Do not press when leading by 10+',
  'Bench unit cannot play more than 4 consecutive minutes without a starter',
  'Protect starters from foul trouble in the first half',
  'No full-court pressure until bonus situation',
  'Always have a secondary ball-handler available',
  'Do not allow their best player to get comfortable early',
  'Limit fast-break opportunities — get back in transition',
  'Never leave their best shooter on a close-out',
  'Keep lineup balance: at least 2 shooters on floor always',
  'Timeout if opponent goes on 8-0 run',
  'No hero ball in late-clock situations — run sets',
];

const VOLATILITY_DRIVER_POOL = [
  'Opponent\'s star is a hot-cold shooter — variance swings outcome',
  'Our FT shooting has been inconsistent in close games',
  'Referee tendencies favor aggressive teams — could go either way',
  'Their bench depth means we can\'t rely on wearing them down',
  'Foul trouble for our bigs changes the game drastically',
  'Weather/travel fatigue from back-to-back road games',
  'Emotional game — rivalry matchup could swing intensity',
  'Their press creates chaos — turnovers are unpredictable',
  'One-dimensional offense if our primary scorer is off',
  'Zone defense effectiveness is opponent-dependent',
  'Three-point variance — we live and die by the three',
  'Second-half adjustments historically favor the opponent',
  'Transition defense lapses are streaky and unpredictable',
  'Injury risk to thin rotation players',
  'Comeback potential if we fall behind early',
];

const PROHIBITION_POOL = [
  'Do NOT switch 1-5 on ball-screens',
  'Do NOT press when in the bonus',
  'Do NOT allow open transition threes',
  'Do NOT play drop coverage against their shooters',
  'Do NOT leave their #1 option in single coverage',
  'Do NOT abandon the offensive glass',
  'Do NOT settle for contested pull-up threes',
  'Do NOT let their bigs catch deep in the post',
  'Do NOT play five-out if our shooters are cold',
  'Do NOT gamble for steals in half-court',
  'Do NOT rush shots early in the shot clock',
  'Do NOT match their pace if they push tempo',
  'Do NOT leave the weak-side corner open',
  'Do NOT double off their shooters',
  'Do NOT switch on off-ball screens unnecessarily',
];

const TRACE_NOTE_POOL = [
  'Film from last 3 games reviewed — recent form prioritized',
  'Opponent struggled against pressure in 2 of last 4 games',
  'Set plays run 70% of the time out of timeouts',
  'Zone was effective in their last loss — 11 TOs in zone possessions',
  'Their starting PG missed one game — may be limited',
  'Conference opponents average 14 TOs per game against them',
  'Shot selection improves in second halves — stay disciplined',
  'Bench production dropped off significantly in last 3 games',
  'They run the same 3 ATO plays — well-scouted',
  'Transition defense has been their Achilles heel this month',
  'Free throw rate is above average — avoid unnecessary fouls',
  'Their top scorer gets 30% of possessions — key containment target',
  'Assist-to-turnover ratio drops under pressure — trap-worthy',
  'Data limited to 5 games — lower confidence in patterns',
  'Eye test confirms: slow feet, beatable in space',
];

const PRESSURE_POINT_POOL = [
  'Ball-handler turns it over 22% of the time when trapped',
  'Post players commit 3+ fouls per game on average',
  'Closeouts are late — kick-outs produce open threes',
  'No shot-blocker — drives reach the rim uncontested',
  'Transition D gives up 1.3 PPP in fastbreak',
  'Bench scores only 8 PPG — starters carry the load',
  'Free throw shooting drops to 58% in close games',
  'Help-side rotates a full beat late — cutters eat',
  'PNR coverage is soft — ball handler turns corner easily',
  'Foul-prone frontcourt — passive when in trouble',
  'Offensive rebounding is nonexistent — one and done',
  'Three-point defense allows 38% from deep',
  'Zone offense is stagnant — hold the ball and force shot clock',
  'Turnovers spike in the last 5 minutes of halves',
  'Second-chance points allowed: 14 per game',
];

const DEFENSIVE_COUNTER_POOL = [
  'Pack the paint — dare them to shoot from deep',
  'Switch all screens to prevent open looks',
  'Show and recover — don\'t give up driving lanes',
  'Blitz PNR and rotate — they struggle with quick passes',
  'Zone for 3-4 possessions to disrupt rhythm',
  'Full deny on their primary creator — make others beat us',
  'Sag off non-shooters — load up help-side',
  'Trap in corners — force difficult passes',
  'Hedge hard on ball-screens — no easy pull-ups',
  'Switch 1-through-4 — only protect the 5',
  'Run them off the three-point line — force mid-range',
  'Contain and funnel to rim protector',
  'Press after makes — speed them up',
  'No middle penetration — force baseline',
  'Double the post — rotate and recover',
];

const SUCCESS_CUE_POOL = [
  'Defenders rotate on air without thinking',
  'Ball moves before defense sets — early advantage',
  'Closeouts are active, controlled, choppy feet',
  'PNR coverage executed without verbal cue needed',
  'Transition defense gets 5 back before ball crosses half',
  'ATO plays run clean on first attempt',
  'Shooters are in rhythm — catch and shoot, no hesitation',
  'Post players establish position early',
  'Help-side awareness visible — eyes on ball and man',
  'Press break executed calmly — no turnovers',
  'Zone rotations are sharp, no gaps',
  'Free throws made under simulated pressure',
  'Rebounding box-out executed consistently',
  'Players call out screens before contact',
  'Ball reversal happens in under 2 seconds',
];

const IF_CONDITION_POOL = [
  'If they go zone',
  'If their big sits with fouls',
  'If they press full-court',
  'If they switch all screens',
  'If their shooter gets hot',
  'If they pack the paint',
  'If they deny the wing entry',
  'If their PG pushes pace',
  'If they trap the PNR',
  'If they play drop coverage',
  'If we can\'t get post touches',
  'If they crash the offensive glass',
  'If they run after makes',
  'If they double our post',
  'If their bench outplays ours',
];

const THEN_RESPONSE_POOL = [
  'Attack gaps with dribble penetration',
  'Go small — five-out spacing',
  'Push pace — run before they set up',
  'Exploit the mismatch in the post',
  'Reverse the ball and attack weak-side',
  'Use the screener as a shooter — pop action',
  'Slow it down — run half-court sets',
  'Bring the press-breaker to half-court early',
  'Post split action — dump and kick',
  'Secondary break — early offense before they set',
  'Call timeout, reset with ATO',
  'ISO for primary scorer — clear out',
  'Hit the short corner — collapse their zone',
  'Skip pass to weak-side shooter',
  'Delay offense — drain clock, pick your spot',
];

const TRIGGER_POOL = [
  'When ball is entered to the wing',
  'After made basket in transition',
  'On dead-ball inbound from sideline',
  'When primary defender goes under screen',
  'After opponent timeout',
  'When clock is under 8 seconds',
  'On switch mismatch identified',
  'After offensive rebound',
  'When zone is called',
  'On press break after made free throw',
  'When their big leaves the paint',
  'After securing defensive rebound',
  'On any ball-screen rejection',
  'When weak-side defender helps',
  'After dead-ball substitution',
];

// ── Shot zones ──

const SHOT_ZONES = ['Rim', 'Short Mid-Range', 'Long Mid-Range', 'Corner 3', 'Above-Break 3', 'Elbow'];

// ── Situation types ──

const SITUATION_TYPE_MAP: SituationType[] = ['ATO', 'ATO', 'EOH', 'EOH', 'late', 'late', 'press', 'zone', 'zone', 'ATO', 'late', 'press', 'zone', 'EOH', 'zone'];

// ── Position group mapping ──

function getPositionGroup(position: string): PositionGroup {
  const p = position.toLowerCase();
  if (p.includes('guard') || p === 'g' || p === 'pg' || p === 'sg') return 'G';
  if (p.includes('wing') || p.includes('small forward') || p === 'sf') return 'W';
  if (p.includes('forward') || p === 'pf' || p === 'f') return 'F';
  if (p.includes('center') || p.includes('big') || p === 'c') return 'C';
  return 'W'; // default
}

// ── Main Generator ──

export function getGamePlanV2(gameId: string): GamePlanV2Packet | null {
  const game = KaNeXT_GAMES_BY_ID[gameId];
  if (!game) return null;

  const opp = game.opponent;
  const h = stableHash(opp);
  const pregame = KaNeXT_PREGAME[gameId];

  // ── Staff Assignments ──
  const statusPool: AssignmentStatus[] = ['not_started', 'in_progress', 'ready', 'approved'];
  const staffAssignments: StaffAssignment[] = [
    { role: 'HC', name: 'Coach K', sections: [1, 6, 9], status: statusPool[stableHash(opp, 500) % 4] },
    { role: 'AC1', name: 'Coach Adams', sections: [2, 5], status: statusPool[stableHash(opp, 501) % 4] },
    { role: 'AC2', name: 'Coach Brooks', sections: [3], status: statusPool[stableHash(opp, 502) % 4] },
    { role: 'AC3', name: 'Coach Davis', sections: [4, 7, 8], status: statusPool[stableHash(opp, 503) % 4] },
    { role: 'Video', name: 'Video Coord', sections: [10, 11], status: statusPool[stableHash(opp, 504) % 4] },
  ];

  // ── Scout Confidence ──
  const confPct = 60 + (h % 35); // 60-94
  const tierVal = stableHash(opp, 600) % 3;
  const dataTier: DataTier = tierVal === 0 ? 'Tier 1' : tierVal === 1 ? 'Tier 2' : 'Tier 3';
  const whyNotHigher = pickN(TRACE_NOTE_POOL, opp, 610, 2 + (h % 2));
  const traceNotes = pickN(TRACE_NOTE_POOL, opp, 650, 3);
  const scoutConfidence: ScoutConfidenceGate = { pct: confPct, dataTier, whyNotHigher, traceNotes };

  // ── S01 Decision Summary ──
  const decisionBullets: DecisionBullet[] = [
    { domain: 'defensive', text: pick(DEFENSIVE_COUNTER_POOL, opp, 100) },
    { domain: 'offensive', text: pick(PRESSURE_POINT_POOL, opp, 110) },
    { domain: 'volatility', text: pick(VOLATILITY_DRIVER_POOL, opp, 120) },
  ];
  const doNotBreak: DoNotBreakRule[] = pickN(PROHIBITION_POOL, opp, 130, 3).map((rule, i) => ({
    rule,
    consequence: pickN(VOLATILITY_DRIVER_POOL, opp, 140 + i, 1)[0],
  }));

  // ── S02 Opp Offense ──
  const osie: OSIE = {
    system: pick(DNA_OFFENSE_POOL, opp, 200),
    pace: pick(DNA_TEMPO_POOL, opp, 210),
    initiators: pregame?.oppThreats.map((t) => t.name).slice(0, 2) ?? ['Guard 1', 'Guard 2'],
  };
  const shotDiet: ShotDietEntry[] = SHOT_ZONES.map((zone, i) => {
    const freq = 8 + stableHash(opp + zone, 220 + i) % 25;
    const fg = 30 + stableHash(opp + zone, 230 + i) % 30;
    return { zone, freqPct: freq, fgPct: fg };
  });
  // Normalize shotDiet frequencies to ~100%
  const totalFreq = shotDiet.reduce((s, z) => s + z.freqPct, 0);
  shotDiet.forEach((z) => { z.freqPct = Math.round((z.freqPct / totalFreq) * 100); });

  const pressurePoints = pickN(PRESSURE_POINT_POOL, opp, 240, 4);
  const defensiveCounters = pickN(DEFENSIVE_COUNTER_POOL, opp, 260, 4);
  const ifThen: IfThenCard[] = pickN(IF_CONDITION_POOL, opp, 280, 5).map((ifC, i) => ({
    ifCondition: ifC,
    thenResponse: pickN(THEN_RESPONSE_POOL, opp, 290 + i, 1)[0],
  }));

  // Matchup overlays from pregame assignments
  const matchupOverlays: MatchupOverlay[] = (pregame?.assignments ?? []).slice(0, 5).map((a, i) => ({
    ourPlayer: a.player,
    theirPlayer: pregame?.oppThreats[i % (pregame?.oppThreats.length || 1)]?.name ?? 'Player',
    note: a.constraint,
  }));

  const oppOffense: OppOffenseData = { osie, shotDiet, pressurePoints, defensiveCounters, ifThen, matchupOverlays };

  // ── S03 Opp Defense ──
  const dsie: DSIE = {
    system: pick(DNA_DEFENSE_POOL, opp, 300),
    pressure: pick(['High', 'Moderate', 'Low'], opp, 310),
    pnrCoverage: pick(['Drop', 'Show & Recover', 'Switch', 'Blitz', 'Ice', 'Hedge'], opp, 320),
    closeout: pick(['Hard', 'Controlled', 'Soft', 'Flying'], opp, 330),
  };
  const offensiveCounters = pickN([
    'Attack the gaps with dribble penetration',
    'Use ball-reversals to break the press',
    'Post-up mismatches after switches',
    'Early offense before defense sets',
    'Skip passes to exploit zone gaps',
    'Drive and kick for open threes',
    'Screen the screener action',
    'Back-cut against overplaying defenders',
    'High-low action in the post',
    'Spread PNR with pop option',
  ], opp, 340, 4);
  const triggers = pickN(TRIGGER_POOL, opp, 360, 5);

  const oppDefense: OppDefenseData = { dsie, offensiveCounters, triggers };

  // ── S04 Shot Profile ──
  const teamZones: TeamZone[] = SHOT_ZONES.map((zone, i) => ({
    zone,
    attemptsPct: 8 + stableHash(opp + zone, 400 + i) % 25,
    efgPct: 35 + stableHash(opp + zone, 410 + i) % 30,
  }));
  const totalAttempts = teamZones.reduce((s, z) => s + z.attemptsPct, 0);
  teamZones.forEach((z) => { z.attemptsPct = Math.round((z.attemptsPct / totalAttempts) * 100); });

  // Player permissions from roster
  const bios = Object.entries(KaNeXT_PLAYER_BIOS);
  const playerPermissions: PlayerPermission[] = bios.slice(0, 8).map(([jersey, bio]) => {
    const permPool: ShotPermission[] = ['green', 'yellow', 'red'];
    return {
      name: `${bio.firstName} ${bio.lastName}`,
      jersey,
      zones: SHOT_ZONES.map((zone, zi) => ({
        zone,
        permission: permPool[stableHash(jersey + zone + opp, 420 + zi) % 3],
      })),
    };
  });

  const shotProfile: ShotProfileData = { teamZones, playerPermissions };

  // ── S05 Actions Library ──
  const actionCount = 8 + (h % 5); // 8-12
  const actionsLibrary: ActionCard[] = pickN(ACTION_NAME_POOL, opp, 500, actionCount).map((name, i) => {
    const riskPool: RiskLevel[] = ['low', 'medium', 'high'];
    return {
      name,
      trigger: pick(TRIGGER_POOL, opp + name, 510 + i),
      primaryOption: pick(THEN_RESPONSE_POOL, opp + name, 520 + i),
      counter: pick(DEFENSIVE_COUNTER_POOL, opp + name, 530 + i),
      bailout: pick(THEN_RESPONSE_POOL, opp + name, 540 + i),
      ourCounter: pick(THEN_RESPONSE_POOL, opp + name, 550 + i),
      risk: riskPool[stableHash(opp + name, 560 + i) % 3],
    };
  });

  // ── S06 Situations Package ──
  const situationsPackage: SituationPlay[] = SITUATION_PLAY_POOL.slice(0, 10 + (h % 5)).map((sp, i) => ({
    type: SITUATION_TYPE_MAP[i % SITUATION_TYPE_MAP.length],
    name: sp.name,
    description: sp.desc,
    selected: stableHash(opp + sp.name, 700 + i) % 3 !== 0, // ~67% selected
  }));

  // ── S07 Rotation Board ──
  const rotationBoard: RotationPlayer[] = bios.slice(0, 12).map(([jersey, bio], i) => {
    const kr = ROSTER_KR[jersey] ?? 55;
    const arch = jerseyArchetypeMap.get(jersey) ?? 'Role Player';
    const starter = i < 5;
    const posGroup = getPositionGroup(bio.position);
    const offKR = kr + (stableHash(jersey + 'off', 800) % 10) - 5;
    const defKR = kr + (stableHash(jersey + 'def', 810) % 10) - 5;
    const minutes = starter ? 28 + (stableHash(jersey, 820) % 8) : 10 + (stableHash(jersey, 830) % 15);
    const threatIdx = stableHash(opp + jersey, 840) % PRESSURE_POINT_POOL.length;
    const ruleIdx = stableHash(opp + jersey, 850) % GUARD_RULES_POOL.length;
    return {
      name: `${bio.firstName} ${bio.lastName}`,
      jersey,
      posGroup,
      offKR: Math.max(30, Math.min(99, offKR)),
      defKR: Math.max(30, Math.min(99, defKR)),
      archetype: arch,
      threat: PRESSURE_POINT_POOL[threatIdx].substring(0, 50),
      rule: GUARD_RULES_POOL[ruleIdx],
      minutes,
      starter,
      foulFragile: stableHash(jersey + opp, 860) % 4 === 0,
    };
  });

  // ── S08 Player Guard Cards ──
  const playerCards: PlayerGuardCard[] = (pregame?.oppThreats ?? []).map((threat, i) => ({
    name: threat.name,
    jersey: String(10 + i),
    threatType: threat.archetype,
    directionality: pick(DIRECTIONALITY_POOL, opp + threat.name, 900 + i),
    shotMapZones: SHOT_ZONES.map((zone, zi) => {
      const tendencies: ('hot' | 'warm' | 'cold')[] = ['hot', 'warm', 'cold'];
      return { zone, tendency: tendencies[stableHash(threat.name + zone, 910 + zi) % 3] };
    }),
    coverage: pick(COVERAGE_RESPONSE_POOL, opp + threat.name, 920 + i),
    toStress: pick(TO_STRESS_POOL, opp + threat.name, 930 + i),
    foulProfile: pick(FOUL_PROFILE_POOL, opp + threat.name, 940 + i),
    guardRules: pickN(GUARD_RULES_POOL, opp + threat.name, 950 + i, 3),
    plan: `${threat.rule}. ${pick(DEFENSIVE_COUNTER_POOL, opp + threat.name, 960 + i)}`,
  }));

  // ── S09 Constraints & Risk ──
  const sourcePool: ConstraintSource[] = ['medical', 'foul', 'matchup', 'scheme'];
  const hardConstraints: HardConstraint[] = pickN(CONSTRAINT_POOL, opp, 1000, 4).map((text, i) => ({
    text,
    source: sourcePool[stableHash(opp + text, 1010 + i) % 4],
  }));
  const risks: Risk[] = pickN(VOLATILITY_DRIVER_POOL, opp, 1020, 5).map((text, i) => ({
    text,
    severity: (1 + stableHash(opp + text, 1030 + i) % 5) as Severity,
  }));
  const volatilityDrivers = pickN(VOLATILITY_DRIVER_POOL, opp, 1040, 3);
  const whatNotToDo = pickN(PROHIBITION_POOL, opp, 1060, 4);
  const constraintsRisk: ConstraintsRiskData = { hardConstraints, risks, volatilityDrivers, whatNotToDo };

  // ── S11 Practice Translation ──
  const drillCount = 3 + (h % 4); // 3-6
  const coachPool: StaffRole[] = ['HC', 'AC1', 'AC2', 'AC3'];
  const practiceTranslation: DrillSegment[] = pickN(DRILL_NAME_POOL, opp, 1100, drillCount).map((name, i) => ({
    name,
    durationMin: 5 + (stableHash(opp + name, 1110 + i) % 16), // 5-20 min
    tiedToSection: 1 + (stableHash(opp + name, 1120 + i) % 9), // sections 1-9
    leadCoach: coachPool[stableHash(opp + name, 1130 + i) % coachPool.length],
    successCue: pick(SUCCESS_CUE_POOL, opp + name, 1140 + i),
  }));

  return {
    gameId,
    opponent: opp,
    date: game.date,
    location: game.location,
    homeAway: game.location === 'Home' ? 'Home' : 'Away',
    scoutConfidence,
    staffAssignments,
    decisionSummary: { bullets: decisionBullets, doNotBreak },
    oppOffense,
    oppDefense,
    shotProfile,
    actionsLibrary,
    situationsPackage,
    rotationBoard,
    playerCards,
    constraintsRisk,
    practiceTranslation,
  };
}

/** Convenience: get packet for the next upcoming game */
export function getNextGamePlan(): GamePlanV2Packet | null {
  if (!FMU_NEXT_GAME_ID) return null;
  return getGamePlanV2(KaNeXT_NEXT_GAME_ID);
}
