/**
 * Intelligence Router
 * Master intent classifier + engine dispatch.
 * Spec: kanext-basketball-intelligence/INTELLIGENCE_INTEGRATION_SPEC.md §6 Phase 1 #7
 *
 * Detects query type from natural language → routes to correct engine(s) →
 * packages results as IntelligenceResult for Nexus to consume.
 */

import { v1Evaluate, V1EvalResult, PlayerSeasonStats, CoachContext } from './v1-eval-engine';
import { computeTeamKR, TeamKRInput, TeamKRResult } from './team-kr';
import { computePlayerConfidence, computeTeamConfidence } from './confidence-gates';

// ── Query Types ──

export type IntelligenceQueryType =
  | 'player_eval'
  | 'team_eval'
  | 'simulation'
  | 'scouting'
  | 'development'
  | 'pro_transition'
  | 'scholarship_nil'
  | 'system_inference'
  | 'legend_lookup'
  | 'general_basketball'
  | 'unknown';

// ── Routing Input ──

export interface RouterInput {
  message: string;
  coachContext?: CoachContext | null;
  /** Current roster players with KRs for team eval */
  roster?: TeamKRInput[] | null;
  /** Player stats for direct eval queries */
  playerStats?: PlayerSeasonStats | null;
  playerPosition?: string | null;
  conversationType?: string | null;
  mode?: string | null;
}

// ── Routing Output ──

export interface IntelligenceResult {
  queryType: IntelligenceQueryType;
  engineUsed: string | null;
  /** V1 player evaluation result, if run */
  playerEval?: V1EvalResult | null;
  /** Team KR result, if run */
  teamKR?: TeamKRResult | null;
  /** Overall output confidence */
  confidence_pct: number;
  /** Flags from confidence gate */
  confidenceFlags: string[];
  /** Context for GPT prompt enrichment */
  context: Record<string, unknown>;
  /** Whether Coach Context is required but missing */
  requiresCoachContext: boolean;
  /** Error, if routing failed */
  error?: string;
}

// ── Keyword Pattern Tables ──

const PLAYER_EVAL_PATTERNS = [
  /\bevaluat[e|ing|ion]\b/i,
  /\bkr\b.*\bfor\b/i,
  /\brate\b.*\bplayer\b/i,
  /\bplayer.*\brating\b/i,
  /\bhow good is\b/i,
  /\bshould (i|we) (take|get|recruit|offer)\b/i,
  /\bworth.*scholarship\b/i,
  /\bfit.*program\b/i,
  /\bfor (our|my) program\b/i,
  /\bproject[s|ed|ion]?\b.*\bplayer\b/i,
];

const TEAM_EVAL_PATTERNS = [
  /\bteam kr\b/i,
  /\broster (analysis|rating|strength)\b/i,
  /\bhow good is our team\b/i,
  /\bteam rating\b/i,
  /\boverall (team|roster)\b/i,
  /\brotation (strength|quality)\b/i,
];

const SIMULATION_PATTERNS = [
  /\bsimulat\b/i,
  /\bif we (play|played|face|faced)\b/i,
  /\bgame plan (vs|against)\b/i,
  /\bwhat (happens|would happen) if\b/i,
  /\bsim\b.*\bvs\b/i,
  /\bwin probability\b/i,
  /\bproject[s|ed]?\b.*\bgame\b/i,
  /\bwhat['']?s (the|our) chance\b/i,
];

const SCOUTING_PATTERNS = [
  /\bscout\b/i,
  /\bpregame (report|intel|analysis)\b/i,
  /\bgame plan for\b/i,
  /\bwhat do they run\b/i,
  /\bopponent (tendenc|system|style|offense|defense)\b/i,
  /\bscouting report\b/i,
  /\bbreakdown.*opponent\b/i,
];

const DEVELOPMENT_PATTERNS = [
  /\bdevelopment plan\b/i,
  /\bwhere should he transfer\b/i,
  /\bportal fit\b/i,
  /\bimprove.*\b(shooting|defense|rebounding|playmaking)\b/i,
  /\bgrowth\b.*\bplayer\b/i,
  /\bwork on\b/i,
];

const PRO_TRANSITION_PATTERNS = [
  /\bgo pro\b/i,
  /\bdraft prospect\b/i,
  /\bdraft projection\b/i,
  /\bpro ready\b/i,
  /\bnba draft\b/i,
  /\bpro potential\b/i,
  /\bprofessional (level|career|prospect)\b/i,
];

const SCHOLARSHIP_NIL_PATTERNS = [
  /\bscholarship worth\b/i,
  /\bnil value\b/i,
  /\bwhat('?s| is) he worth\b/i,
  /\bmarginal value\b/i,
  /\bptv\b/i,
  /\bpmv\b/i,
  /\bscholarship allocation\b/i,
];

const SYSTEM_INFERENCE_PATTERNS = [
  /\bwhat (system|offense|defense) (do they|does|does he) run\b/i,
  /\binfer.*system\b/i,
  /\bosie\b/i,
  /\bdsie\b/i,
  /\bwhat('?s| is) their (system|style)\b/i,
];

const LEGEND_LOOKUP_PATTERNS = [
  /\bwhat does.*kr.*mean\b/i,
  /\bkr.*\d{2}.*mean\b/i,
  /\blegend\b/i,
  /\btier (label|description)\b/i,
  /\bwhat level is\b/i,
  /\bkr.*tier\b/i,
];

function matchesAny(message: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(message));
}

/** Classify query type from natural language message */
export function classifyQuery(message: string, conversationType?: string | null): IntelligenceQueryType {
  // conversationType overrides when set to specific types
  if (conversationType === 'eval') return 'player_eval';
  if (conversationType === 'sim') return 'simulation';
  if (conversationType === 'game-ops') return 'scouting';

  if (matchesAny(message, PLAYER_EVAL_PATTERNS)) return 'player_eval';
  if (matchesAny(message, SIMULATION_PATTERNS)) return 'simulation';
  if (matchesAny(message, SCOUTING_PATTERNS)) return 'scouting';
  if (matchesAny(message, TEAM_EVAL_PATTERNS)) return 'team_eval';
  if (matchesAny(message, PRO_TRANSITION_PATTERNS)) return 'pro_transition';
  if (matchesAny(message, DEVELOPMENT_PATTERNS)) return 'development';
  if (matchesAny(message, SCHOLARSHIP_NIL_PATTERNS)) return 'scholarship_nil';
  if (matchesAny(message, SYSTEM_INFERENCE_PATTERNS)) return 'system_inference';
  if (matchesAny(message, LEGEND_LOOKUP_PATTERNS)) return 'legend_lookup';

  return 'unknown';
}

/** Main routing function — classifies intent, runs engines, returns IntelligenceResult */
export function routeQuery(input: RouterInput): IntelligenceResult {
  const queryType = classifyQuery(input.message, input.conversationType);

  // ── Player Evaluation ──
  if (queryType === 'player_eval') {
    if (!input.coachContext) {
      return {
        queryType,
        engineUsed: null,
        confidence_pct: 0,
        confidenceFlags: ['missing_coach_context'],
        context: {},
        requiresCoachContext: true,
        error: 'Coach Context required for player evaluation. Please complete program setup first.',
      };
    }
    if (!input.playerStats) {
      return {
        queryType,
        engineUsed: null,
        confidence_pct: 0,
        confidenceFlags: ['missing_player_stats'],
        context: {},
        requiresCoachContext: false,
        error: 'Player stats required for evaluation.',
      };
    }

    const position = input.playerPosition ?? 'SF';
    const playerEval = v1Evaluate(input.playerStats, input.coachContext, position);

    const playerConf = computePlayerConfidence({
      dataTier: 'box_score',
      gamesPlayed: input.playerStats.games_played,
      minPerGame: input.playerStats.min_pg,
      scoredTraits: 5,
      totalScoreableTraits: 7,
      hasMultiYear: false,
    });

    return {
      queryType,
      engineUsed: 'v1-eval-engine',
      playerEval,
      confidence_pct: Math.min(playerEval.confidence_pct, playerConf.confidence_pct),
      confidenceFlags: playerConf.flags,
      context: {
        levelKey: input.coachContext.levelKey,
        position,
        phase3Anchor: playerEval.phase3Anchor,
        phase6Raw: playerEval.phase6Raw,
      },
      requiresCoachContext: false,
    };
  }

  // ── Team Evaluation ──
  if (queryType === 'team_eval') {
    if (!input.coachContext) {
      return {
        queryType,
        engineUsed: null,
        confidence_pct: 0,
        confidenceFlags: ['missing_coach_context'],
        context: {},
        requiresCoachContext: true,
        error: 'Coach Context required for team evaluation.',
      };
    }
    if (!input.roster || input.roster.length === 0) {
      return {
        queryType,
        engineUsed: null,
        confidence_pct: 0,
        confidenceFlags: ['empty_roster'],
        context: {},
        requiresCoachContext: false,
        error: 'Roster data required for team evaluation.',
      };
    }

    const teamKR = computeTeamKR(input.roster);

    const teamConf = computeTeamConfidence({
      playersWithKr: input.roster.length,
      rosterSize: Math.max(input.roster.length, 10),
      minutesCoverage: Math.min(teamKR.rotation_size / 8, 1),
      avgPlayerConfidence: 75,
      playersExcluded: Math.max(0, input.roster.length - teamKR.rotation_size),
    });

    return {
      queryType,
      engineUsed: 'team-kr',
      teamKR,
      confidence_pct: teamConf.confidence_pct,
      confidenceFlags: teamConf.flags,
      context: {
        rotationSize: teamKR.rotation_size,
        teamOffKr: teamKR.team_off_kr,
        teamDefKr: teamKR.team_def_kr,
        teamOverallKr: teamKR.team_overall_kr,
      },
      requiresCoachContext: false,
    };
  }

  // ── Future engine stubs (Phase 2+) ──
  const STUB_TYPES: IntelligenceQueryType[] = [
    'simulation', 'scouting', 'development', 'pro_transition', 'scholarship_nil', 'system_inference',
  ];
  if (STUB_TYPES.includes(queryType)) {
    return {
      queryType,
      engineUsed: null,
      confidence_pct: 0,
      confidenceFlags: ['engine_not_yet_built'],
      context: { queryType },
      requiresCoachContext: false,
      error: `${queryType} engine coming in Phase 2.`,
    };
  }

  // ── Legend Lookup ──
  if (queryType === 'legend_lookup') {
    return {
      queryType,
      engineUsed: 'legend-lookup',
      confidence_pct: 100,
      confidenceFlags: [],
      context: { message: input.message },
      requiresCoachContext: false,
    };
  }

  // ── Unknown / General Basketball ──
  return {
    queryType: 'general_basketball',
    engineUsed: null,
    confidence_pct: 100,
    confidenceFlags: [],
    context: {},
    requiresCoachContext: false,
  };
}
