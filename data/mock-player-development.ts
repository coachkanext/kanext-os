/**
 * Mock Player Development Plans — keyed by FMU jersey number
 * Development plans with 2-week, 6-week, 12-week goals + skill priorities + check-ins
 */

// =============================================================================
// TYPES
// =============================================================================

export interface DevelopmentGoal {
  label: string;
  status: 'complete' | 'in_progress' | 'pending';
  cluster?: string;
}

export interface SkillPriority {
  cluster: string;
  description: string;
  targetDelta: number; // e.g. +5 means raise cluster KR by 5
}

export interface CheckIn {
  date: string;
  note: string;
  evidenceLink?: string;
  author: string;
}

export interface DevelopmentPlan {
  twoWeekGoals: DevelopmentGoal[];
  sixWeekGoals: DevelopmentGoal[];
  twelveWeekGoals: DevelopmentGoal[];
  priorities: SkillPriority[];
  checkIns: CheckIn[];
}

// =============================================================================
// DATA
// =============================================================================

const PLANS: Record<string, DevelopmentPlan> = {
  '4': {
    twoWeekGoals: [
      { label: 'Improve pull-up 3 efficiency to 38%+', status: 'in_progress', cluster: 'shooting' },
      { label: 'Film review: 2 transition reads per session', status: 'complete', cluster: 'playmaking' },
    ],
    sixWeekGoals: [
      { label: 'Add DHO-to-pull-up combo to live action', status: 'in_progress', cluster: 'playmaking' },
      { label: 'Reduce turnovers to <2.5 in half-court sets', status: 'pending', cluster: 'playmaking' },
      { label: 'Maintain FT% above 80%', status: 'complete', cluster: 'finishing' },
    ],
    twelveWeekGoals: [
      { label: 'Lead team in AST/TO ratio (2.5+)', status: 'pending', cluster: 'playmaking' },
      { label: 'Raise shooting cluster KR to 85+', status: 'pending', cluster: 'shooting' },
      { label: 'Earn conference Player of the Week', status: 'pending' },
    ],
    priorities: [
      { cluster: 'Shooting', description: 'Pull-up 3 consistency off ball screens', targetDelta: 3 },
      { cluster: 'Playmaking', description: 'Half-court decision-making under pressure', targetDelta: 2 },
      { cluster: 'Perimeter Defense', description: 'On-ball containment vs speed guards', targetDelta: 4 },
    ],
    checkIns: [
      { date: '2026-02-10', note: 'Pull-up 3 at 35% this week. Getting better looks. Film shows improved footwork.', author: 'Coach K' },
      { date: '2026-02-03', note: 'Transition reads much improved. 4 hockey assists in last 2 games.', evidenceLink: 'film://clip/carter-transition-feb3', author: 'Coach K' },
      { date: '2026-01-27', note: 'Great week of practice. FT routine is locked in — 87% over last 5 games.', author: 'Coach K' },
    ],
  },
  '5': {
    twoWeekGoals: [
      { label: 'Post-up efficiency: 1.05+ PPP', status: 'in_progress', cluster: 'finishing' },
      { label: 'Box out rate on defensive glass: 75%+', status: 'complete', cluster: 'rebounding' },
    ],
    sixWeekGoals: [
      { label: 'Add face-up 15-footer to live repertoire', status: 'pending', cluster: 'shooting' },
      { label: 'Average 2+ blocks per game over 6 game stretch', status: 'in_progress', cluster: 'interior_defense' },
    ],
    twelveWeekGoals: [
      { label: 'Raise shooting cluster KR to 70+', status: 'pending', cluster: 'shooting' },
      { label: 'All-conference defensive consideration', status: 'pending' },
    ],
    priorities: [
      { cluster: 'Shooting', description: 'Develop reliable mid-range jumper', targetDelta: 5 },
      { cluster: 'Interior Defense', description: 'Vertical contest rate improvement', targetDelta: 3 },
      { cluster: 'Playmaking', description: 'Short-roll passing out of PnR', targetDelta: 4 },
    ],
    checkIns: [
      { date: '2026-02-10', note: 'Post efficiency at 1.02 — close. Needs better sealing on left block.', author: 'Coach K' },
      { date: '2026-02-01', note: 'Boxing out consistently now. Defensive rebounding up 18% over last month.', author: 'Coach K' },
    ],
  },
  '11': {
    twoWeekGoals: [
      { label: 'Mid-range pull-up at 42%+', status: 'complete', cluster: 'shooting' },
      { label: 'PnR reads: pass vs score decision at 70%+ correct', status: 'in_progress', cluster: 'playmaking' },
    ],
    sixWeekGoals: [
      { label: 'Cut live-ball turnovers by 30%', status: 'in_progress', cluster: 'playmaking' },
      { label: 'Improve off-ball screen navigation', status: 'pending', cluster: 'perimeter_defense' },
    ],
    twelveWeekGoals: [
      { label: 'Consistent 8+ AST games in conference play', status: 'pending', cluster: 'playmaking' },
    ],
    priorities: [
      { cluster: 'Playmaking', description: 'Reduce turnovers in transition and PnR', targetDelta: 3 },
      { cluster: 'Shooting', description: 'Extend range to NBA 3', targetDelta: 2 },
      { cluster: 'Perimeter Defense', description: 'Lateral quickness vs bigger guards', targetDelta: 3 },
    ],
    checkIns: [
      { date: '2026-02-08', note: 'Mid-range looking pure. PnR reads getting there — needs film reps.', author: 'Coach K' },
    ],
  },
  '13': {
    twoWeekGoals: [
      { label: 'Catch-and-shoot 3 at 40%+', status: 'complete', cluster: 'shooting' },
      { label: 'Closeout discipline: no fouls on pump fakes', status: 'in_progress', cluster: 'perimeter_defense' },
    ],
    sixWeekGoals: [
      { label: 'Add one dribble pull-up to shot diet', status: 'pending', cluster: 'shooting' },
      { label: 'Improve off-ball screening angles', status: 'pending', cluster: 'playmaking' },
    ],
    twelveWeekGoals: [
      { label: 'Shooting cluster KR to 90+', status: 'pending', cluster: 'shooting' },
    ],
    priorities: [
      { cluster: 'Shooting', description: 'Off-movement shot creation', targetDelta: 4 },
      { cluster: 'Perimeter Defense', description: 'Closeout technique and recovery', targetDelta: 3 },
      { cluster: 'Finishing', description: 'Driving layup package development', targetDelta: 5 },
    ],
    checkIns: [
      { date: '2026-02-12', note: 'Shooting well from catch. Need more reps on one-dribble pull-ups.', author: 'Coach K' },
    ],
  },
};

// Default plan for players without a custom plan
const DEFAULT_PLAN: DevelopmentPlan = {
  twoWeekGoals: [
    { label: 'Maintain conditioning baseline', status: 'in_progress' },
    { label: 'Film review: 1 session per week', status: 'pending' },
  ],
  sixWeekGoals: [
    { label: 'Improve primary cluster rating by 2+', status: 'pending' },
  ],
  twelveWeekGoals: [
    { label: 'Earn increased rotation minutes', status: 'pending' },
  ],
  priorities: [
    { cluster: 'Overall', description: 'General skill development and conditioning', targetDelta: 2 },
  ],
  checkIns: [],
};

// =============================================================================
// EXPORT
// =============================================================================

export function getPlayerDevelopment(jersey: string): DevelopmentPlan {
  return PLANS[jersey] ?? DEFAULT_PLAN;
}
