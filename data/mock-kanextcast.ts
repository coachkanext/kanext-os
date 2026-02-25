/**
 * Mock KaNeXTCast Intel Data
 *
 * Deterministic intel for each game lifecycle state.
 * Pulls from Game Plan, Simulation, and Postgame snapshots.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface IntelBullet {
  id: string;
  text: string;
  impact?: 'positive' | 'negative' | 'neutral';
}

export interface PlanVsProfile {
  pace: { plan: string; opponent: string };
  shotDiet: { plan: string; opponent: string };
  pressure: { plan: string; opponent: string };
  osie: string;
  dsie: string;
}

export interface PlanVsReality {
  pace: { planned: string; actual: string; delta: string };
  shotDiet: { planned: string; actual: string; delta: string };
  turnovers: { target: string; actual: string; delta: string };
  rebounds: { target: string; actual: string; delta: string };
  freeThrows: { target: string; actual: string; delta: string };
}

export interface LiveRiskFlag {
  id: string;
  label: string;
  severity: 'high' | 'medium';
}

export interface PlayByPlayEntry {
  id: string;
  time: string;
  action: string;
  scoreAfter: string;
  tag: 'scoring' | 'foul' | 'turnover' | 'rebound' | 'other';
}

export interface PreviewIntel {
  topKeys: IntelBullet[];
  mismatchTargets: IntelBullet[];
  riskFlags: IntelBullet[];
  planVsProfile: PlanVsProfile;
  statusChips: string[];
}

export interface LiveIntel {
  planVsReality: PlanVsReality;
  riskFlags: LiveRiskFlag[];
  nextDeadBall: IntelBullet[];
  timeline: PlayByPlayEntry[];
  teamTotals: { us: string; them: string };
}

export interface FinalIntel {
  whatDecided: IntelBullet[];
  planVsReality: PlanVsReality;
  nextGameFix: IntelBullet[];
  timeline: PlayByPlayEntry[];
  teamTotals: { us: string; them: string };
}

export interface KaNeXTCastIntel {
  preview?: PreviewIntel;
  live?: LiveIntel;
  final?: FinalIntel;
}

// =============================================================================
// MOCK DATA
// =============================================================================

// -----------------------------------------------------------------------------
// 1. PREVIEW — Upcoming game vs Dakota State
// -----------------------------------------------------------------------------

const dakotaStatePreview: PreviewIntel = {
  topKeys: [
    {
      id: 'tk-1',
      text: 'Dakota State allows 42.3% from three on kick-outs — attack closeouts off drive-and-kick sets to force rotations.',
      impact: 'positive',
    },
    {
      id: 'tk-2',
      text: 'Their starting C fouls at 4.8 per 40 min — run pick-and-roll early to put him in foul trouble by the under-12 media timeout.',
      impact: 'positive',
    },
    {
      id: 'tk-3',
      text: 'Dakota State ranks 287th in transition defense — push pace after made baskets and force tempo above 72 possessions.',
      impact: 'positive',
    },
  ],
  mismatchTargets: [
    {
      id: 'mm-1',
      text: 'PG mismatch: J. Warren (KR 78) vs their PG K. Rhodes (KR 54) — +24 KR delta favors isolation attack from the left wing.',
      impact: 'positive',
    },
    {
      id: 'mm-2',
      text: 'PF mismatch: M. Tucker (KR 71) vs D. Boone (KR 49) — +22 KR delta in post-up efficiency. Feed the block.',
      impact: 'positive',
    },
    {
      id: 'mm-3',
      text: 'Bench depth gap: Our 6-10 man rotation averages KR 62 vs their KR 47 — extend the rotation to 9 and grind them in the second half.',
      impact: 'positive',
    },
  ],
  riskFlags: [
    {
      id: 'rf-1',
      text: 'Dakota State shoots 79.4% FT as a team — avoid fouling in the bonus. Keep fouls under 6 per half.',
      impact: 'negative',
    },
    {
      id: 'rf-2',
      text: 'G. Mitchell averages 3.1 steals/game — protect the ball in half-court sets. Call timeouts if live-ball turnovers exceed 4.',
      impact: 'negative',
    },
    {
      id: 'rf-3',
      text: 'Their zone press after made FTs has forced 14.2 TO/game this season — use 1-4 flat press break, do not dribble through the trap.',
      impact: 'negative',
    },
  ],
  planVsProfile: {
    pace: { plan: '72+ possessions', opponent: '66.8 possessions (slow)' },
    shotDiet: { plan: '38% threes, 42% paint', opponent: '31% threes, 36% paint' },
    pressure: { plan: 'Half-court man, switch 1-4', opponent: '1-3-1 zone (primary), 2-3 zone (secondary)' },
    osie: 'Motion Strong — Dribble Drive',
    dsie: '1-3-1 Zone — Trap Corners',
  },
  statusChips: ['Scout packet ready', 'Sim ready: Win% 71'],
};

// -----------------------------------------------------------------------------
// 2. LIVE — In-progress game vs Bluefield State
// -----------------------------------------------------------------------------

const bluefieldStateLive: LiveIntel = {
  planVsReality: {
    pace: { planned: '70 possessions', actual: '74 possessions (projected)', delta: '+4 ahead of target' },
    shotDiet: { planned: '36% threes', actual: '41% threes', delta: '+5% — over-reliant on perimeter' },
    turnovers: { target: '< 12', actual: '8 (on pace for 14)', delta: '+2 over pace — tighten up' },
    rebounds: { target: '+6 margin', actual: '+2 margin', delta: '-4 behind target' },
    freeThrows: { target: '75%', actual: '68% (13-19)', delta: '-7% below target' },
  },
  riskFlags: [
    { id: 'lrf-1', label: 'Foul trouble: M. Tucker has 3 fouls with 14:22 left in 2H', severity: 'high' },
    { id: 'lrf-2', label: 'Rebound margin slipping: opponent grabbed 5 offensive boards this half', severity: 'medium' },
    { id: 'lrf-3', label: 'Bench scoring drought: 0 pts from reserves in last 6:40', severity: 'medium' },
  ],
  nextDeadBall: [
    {
      id: 'ndb-1',
      text: 'Switch to 2-3 zone for 2 possessions — their PG is 0-4 from mid-range this half.',
      impact: 'neutral',
    },
    {
      id: 'ndb-2',
      text: 'Sub in D. Price for M. Tucker (foul trouble) — run small-ball lineup with Price at the 4.',
      impact: 'neutral',
    },
    {
      id: 'ndb-3',
      text: 'Call "Horns Flare" set — Bluefield switches 1-5 on ball screens, exploit the mismatch on the pop.',
      impact: 'positive',
    },
  ],
  timeline: [
    { id: 'pbp-01', time: '1H 19:42', action: 'J. Warren 3PT — right wing catch-and-shoot off screen', scoreAfter: '3-0', tag: 'scoring' },
    { id: 'pbp-02', time: '1H 18:55', action: 'Bluefield layup — fast break off deflection', scoreAfter: '3-2', tag: 'scoring' },
    { id: 'pbp-03', time: '1H 17:30', action: 'M. Tucker offensive rebound and putback', scoreAfter: '5-2', tag: 'rebound' },
    { id: 'pbp-04', time: '1H 16:12', action: 'Turnover — bad entry pass into the post', scoreAfter: '5-2', tag: 'turnover' },
    { id: 'pbp-05', time: '1H 15:48', action: 'Bluefield 3PT — open corner three off zone rotation', scoreAfter: '5-5', tag: 'scoring' },
    { id: 'pbp-06', time: '1H 14:01', action: 'Shooting foul on C. Adams — two FTs (1-2)', scoreAfter: '6-5', tag: 'foul' },
    { id: 'pbp-07', time: '1H 12:33', action: 'R. Foster steal and coast-to-coast layup', scoreAfter: '8-5', tag: 'scoring' },
    { id: 'pbp-08', time: '1H 11:05', action: 'Bluefield mid-range jumper — elbow set', scoreAfter: '8-7', tag: 'scoring' },
    { id: 'pbp-09', time: '1H 9:44', action: 'J. Warren floater in the lane off pick-and-roll', scoreAfter: '10-7', tag: 'scoring' },
    { id: 'pbp-10', time: '1H 8:20', action: 'Defensive rebound — M. Tucker boxes out cleanly', scoreAfter: '10-7', tag: 'rebound' },
    { id: 'pbp-11', time: '1H 7:02', action: 'Turnover — 10-second backcourt violation under press', scoreAfter: '10-7', tag: 'turnover' },
    { id: 'pbp-12', time: '1H 6:38', action: 'Bluefield and-one layup plus FT', scoreAfter: '10-10', tag: 'scoring' },
    { id: 'pbp-13', time: '1H 5:15', action: 'D. Price 3PT — transition pull-up three', scoreAfter: '13-10', tag: 'scoring' },
    { id: 'pbp-14', time: '1H 3:50', action: 'Offensive foul on Bluefield — charge drawn by R. Foster', scoreAfter: '13-10', tag: 'foul' },
    { id: 'pbp-15', time: '1H 1:22', action: 'J. Warren driving layup at the buzzer', scoreAfter: '15-12', tag: 'scoring' },
  ],
  teamTotals: { us: '42', them: '38' },
};

// -----------------------------------------------------------------------------
// 3. FINAL — Completed game vs Midland University
// -----------------------------------------------------------------------------

const midlandFinal: FinalIntel = {
  whatDecided: [
    {
      id: 'wd-1',
      text: 'Transition offense generated 22 fast-break points — Midland had no answer for our pace in the second half.',
      impact: 'positive',
    },
    {
      id: 'wd-2',
      text: 'Free-throw shooting (58%) kept the game closer than it should have been — left 11 points at the line.',
      impact: 'negative',
    },
    {
      id: 'wd-3',
      text: 'Defensive rebounding in the 4th quarter (+8 margin) sealed the game after Midland cut it to 4.',
      impact: 'positive',
    },
  ],
  planVsReality: {
    pace: { planned: '68 possessions', actual: '71 possessions', delta: '+3 above plan — good, pushed when needed' },
    shotDiet: { planned: '40% paint, 32% threes', actual: '38% paint, 35% threes', delta: 'Close to plan — slight perimeter tilt' },
    turnovers: { target: '< 10', actual: '13', delta: '+3 over target — live-ball TOs in 3Q hurt' },
    rebounds: { target: '+5 margin', actual: '+7 margin', delta: '+2 above target — dominated the glass' },
    freeThrows: { target: '72%', actual: '58% (18-31)', delta: '-14% below target — critical miss area' },
  },
  nextGameFix: [
    {
      id: 'ngf-1',
      text: 'FT shooting drill priority: 31 attempts at 58% is unacceptable. Add pre-practice FT routine (2x25 makes) for starters.',
      impact: 'negative',
    },
    {
      id: 'ngf-2',
      text: 'Ball security in 3Q: 6 of 13 turnovers came in a 4-minute stretch. Install "Anchor" press break as second option.',
      impact: 'negative',
    },
    {
      id: 'ngf-3',
      text: 'Keep pushing transition — 22 fast-break points validated the game plan. Increase secondary break reps in practice.',
      impact: 'positive',
    },
  ],
  timeline: [
    { id: 'fpbp-01', time: '1H 19:15', action: 'J. Warren pull-up mid-range — 15 feet', scoreAfter: '2-0', tag: 'scoring' },
    { id: 'fpbp-02', time: '1H 18:30', action: 'Midland 3PT — top of the key off ball reversal', scoreAfter: '2-3', tag: 'scoring' },
    { id: 'fpbp-03', time: '1H 17:05', action: 'M. Tucker dunk off alley-oop — transition', scoreAfter: '4-3', tag: 'scoring' },
    { id: 'fpbp-04', time: '1H 15:42', action: 'Turnover — cross-court pass picked off', scoreAfter: '4-3', tag: 'turnover' },
    { id: 'fpbp-05', time: '1H 14:20', action: 'Midland layup — back-door cut', scoreAfter: '4-5', tag: 'scoring' },
    { id: 'fpbp-06', time: '1H 12:55', action: 'R. Foster 3PT — left corner off drive-and-kick', scoreAfter: '7-5', tag: 'scoring' },
    { id: 'fpbp-07', time: '1H 11:10', action: 'Flagrant foul on Midland — M. Tucker to the line (2-2)', scoreAfter: '9-5', tag: 'foul' },
    { id: 'fpbp-08', time: '1H 9:33', action: 'Midland fast break layup — turnover in backcourt', scoreAfter: '9-7', tag: 'scoring' },
    { id: 'fpbp-09', time: '1H 7:48', action: 'C. Adams offensive rebound and putback', scoreAfter: '11-7', tag: 'rebound' },
    { id: 'fpbp-10', time: '1H 5:20', action: 'J. Warren step-back three — contested', scoreAfter: '14-7', tag: 'scoring' },
    { id: 'fpbp-11', time: '1H 3:00', action: 'Midland and-one in the paint', scoreAfter: '14-10', tag: 'scoring' },
    { id: 'fpbp-12', time: '1H 0:45', action: 'D. Price buzzer-beater mid-range', scoreAfter: '16-10', tag: 'scoring' },
    { id: 'fpbp-13', time: '2H 18:40', action: 'Midland 3PT — wide open off miscommunication', scoreAfter: '16-13', tag: 'scoring' },
    { id: 'fpbp-14', time: '2H 16:55', action: 'Turnover — bad pass in the post', scoreAfter: '16-13', tag: 'turnover' },
    { id: 'fpbp-15', time: '2H 15:10', action: 'M. Tucker block — weak side help', scoreAfter: '16-13', tag: 'other' },
    { id: 'fpbp-16', time: '2H 13:22', action: 'J. Warren transition layup off the block', scoreAfter: '18-13', tag: 'scoring' },
    { id: 'fpbp-17', time: '2H 11:00', action: 'Shooting foul — J. Warren to the line (1-2)', scoreAfter: '19-13', tag: 'foul' },
    { id: 'fpbp-18', time: '2H 8:45', action: 'Midland 3PT — cuts lead to 3', scoreAfter: '19-16', tag: 'scoring' },
    { id: 'fpbp-19', time: '2H 5:30', action: 'R. Foster steal and fast-break dunk', scoreAfter: '21-16', tag: 'scoring' },
    { id: 'fpbp-20', time: '2H 2:15', action: 'Defensive rebound — C. Adams secures it in traffic, game sealed', scoreAfter: '23-16', tag: 'rebound' },
  ],
  teamTotals: { us: '78', them: '64' },
};

// =============================================================================
// DEFAULTS
// =============================================================================

export const DEFAULT_PREVIEW_INTEL: PreviewIntel = {
  topKeys: [
    { id: 'dtk-1', text: 'Generate Game Plan to populate.', impact: 'neutral' },
    { id: 'dtk-2', text: 'Run simulation to surface leverage mismatches.', impact: 'neutral' },
    { id: 'dtk-3', text: 'Scout packet will appear here once processed.', impact: 'neutral' },
  ],
  mismatchTargets: [
    { id: 'dmm-1', text: 'KR delta analysis requires a completed Game Plan.', impact: 'neutral' },
    { id: 'dmm-2', text: 'Position-by-position matchups will populate after scouting.', impact: 'neutral' },
    { id: 'dmm-3', text: 'Bench depth comparison available after roster lock.', impact: 'neutral' },
  ],
  riskFlags: [
    { id: 'drf-1', text: 'No risk flags available — generate Game Plan first.', impact: 'neutral' },
    { id: 'drf-2', text: 'Opponent tendencies will appear after scout ingestion.', impact: 'neutral' },
    { id: 'drf-3', text: 'Foul and turnover exposure data pending.', impact: 'neutral' },
  ],
  planVsProfile: {
    pace: { plan: '--', opponent: '--' },
    shotDiet: { plan: '--', opponent: '--' },
    pressure: { plan: '--', opponent: '--' },
    osie: 'Pending scout',
    dsie: 'Pending scout',
  },
  statusChips: ['Game Plan not generated', 'Sim not run'],
};

export const DEFAULT_FINAL_INTEL: FinalIntel = {
  whatDecided: [
    { id: 'dwd-1', text: 'Postgame analysis not yet available.', impact: 'neutral' },
    { id: 'dwd-2', text: 'Import box score to generate swing-factor breakdown.', impact: 'neutral' },
    { id: 'dwd-3', text: 'Plan-vs-reality comparison requires a pre-game plan.', impact: 'neutral' },
  ],
  planVsReality: {
    pace: { planned: '--', actual: '--', delta: '--' },
    shotDiet: { planned: '--', actual: '--', delta: '--' },
    turnovers: { target: '--', actual: '--', delta: '--' },
    rebounds: { target: '--', actual: '--', delta: '--' },
    freeThrows: { target: '--', actual: '--', delta: '--' },
  },
  nextGameFix: [
    { id: 'dngf-1', text: 'No actionable fixes yet — complete postgame review first.', impact: 'neutral' },
    { id: 'dngf-2', text: 'Practice plan adjustments will populate after analysis.', impact: 'neutral' },
    { id: 'dngf-3', text: 'Trend data across games requires 3+ completed contests.', impact: 'neutral' },
  ],
  timeline: [],
  teamTotals: { us: '--', them: '--' },
};

// =============================================================================
// INTEL MAP — keyed by game ID
// =============================================================================

export const KANEXTCAST_INTEL: Record<string, KaNeXTCastIntel> = {
  // Upcoming game vs Dakota State — Preview only
  'fmu-2526-18': {
    preview: dakotaStatePreview,
  },

  // Live game vs Bluefield State — Live only
  'fmu-2526-19': {
    live: bluefieldStateLive,
  },

  // Completed game vs Midland University — Final only
  'fmu-2526-14': {
    final: midlandFinal,
  },
};
