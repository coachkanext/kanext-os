/**
 * Nexus Prompt Builder
 * Assembles the GPT system prompt with structured intelligence context.
 * Spec: kanext-basketball-intelligence/INTELLIGENCE_INTEGRATION_SPEC.md §6 Phase 1 #8
 *
 * Takes an IntelligenceResult + coach context and builds a rich system prompt
 * for GPT to interpret, narrate, and respond naturally.
 *
 * Rules:
 * - Deterministic: same inputs → same prompt structure.
 * - GPT receives pre-computed results to narrate — it does NOT recompute KR math.
 * - Confidence always communicated so GPT can hedge appropriately.
 * - Program identity (level, system) always present in prompt.
 */

import { IntelligenceResult, IntelligenceQueryType } from './router';
import { CoachContext } from './v1-eval-engine';
import { getTierContext } from './legends';

// ── Program Identity Block ──

function buildProgramIdentityBlock(ctx: CoachContext | null | undefined): string {
  if (!ctx) {
    return `PROGRAM CONTEXT: Not set. Ask the coach to complete program setup before evaluating players or teams.`;
  }
  const lines = [
    `PROGRAM CONTEXT:`,
    `  Level: ${ctx.governingBody}${ctx.division ? ` Division ${ctx.division}` : ''}${ctx.majorClass ? ` (${ctx.majorClass})` : ''}`,
    `  Level Key: ${ctx.levelKey}`,
    `  Offensive System: ${ctx.offensiveSystem}`,
    `  Defensive System: ${ctx.defensiveSystem}`,
  ];
  if (ctx.tempo) lines.push(`  Tempo: ${ctx.tempo}`);
  return lines.join('\n');
}

// ── Player Eval Block ──

function buildPlayerEvalBlock(result: IntelligenceResult): string {
  const ev = result.playerEval;
  if (!ev) return '';

  const lines = [
    `PLAYER EVALUATION RESULT (V1 Protocol):`,
    `  Final KR: ${ev.finalKr !== null ? ev.finalKr : 'UNSCORED'}`,
    `  Phase 3 Anchor: ${ev.phase3Anchor.low}–${ev.phase3Anchor.high} (production-based range)`,
    `  Phase 6 OPF Raw: ${ev.phase6Raw !== null ? ev.phase6Raw.toFixed(1) : 'UNSCORED'}`,
    `  Confidence: ${ev.confidence_pct}%`,
    `  Data Tier: ${ev.dataTier}`,
    `  Window Valid: ${ev.windowValid ? 'Yes' : 'No (Phase 6 clipped to Phase 3 ± 10)'}`,
  ];
  if (ev.okr !== null) lines.push(`  OKR (Offense): ${ev.okr.toFixed(1)}`);
  if (ev.dkr !== null) lines.push(`  DKR (Defense): ${ev.dkr.toFixed(1)}`);
  if (ev.tkr !== null) lines.push(`  TKR (Tools): ${ev.tkr.toFixed(1)}`);
  if (ev.strengths.length > 0) lines.push(`  Strengths: ${ev.strengths.join(', ')}`);
  if (ev.gaps.length > 0) lines.push(`  Gaps: ${ev.gaps.join(', ')}`);
  if (ev.confidenceFlags.length > 0) lines.push(`  Confidence Flags: ${ev.confidenceFlags.join(', ')}`);

  lines.push(`
INSTRUCTIONS FOR THIS EVALUATION:
- Report the Final KR clearly. Use the tier label from the program's level legend.
- The KR range reflects Phase 3 production anchoring. Explain what the numbers mean in context.
- State confidence explicitly. If below 65%, note what would improve it (more games, synergy data).
- Describe strengths and gaps in basketball terms — not generic labels.
- Do NOT recompute the math. Narrate what the engine produced.
- Do NOT add draft/pro projection language unless the user explicitly asks about pro transition.`);

  // Legend tier context (matching tier ±1 + level tier map)
  if (ev.finalKr !== null) {
    const tierCtx = getTierContext(ev.finalKr, ev.levelKey);
    if (tierCtx) lines.push('\n' + tierCtx);
  }

  return lines.join('\n');
}

// ── Team Eval Block ──

function buildTeamEvalBlock(result: IntelligenceResult): string {
  const kr = result.teamKR;
  if (!kr) return '';

  const lines = [
    `TEAM EVALUATION RESULT:`,
    `  Team Overall KR: ${kr.team_overall_kr.toFixed(1)}`,
    `  Offensive KR: ${kr.team_off_kr.toFixed(1)}`,
    `  Defensive KR: ${kr.team_def_kr.toFixed(1)}`,
    `  Rotation Size: ${kr.rotation_size} players (≥5% participation threshold)`,
    `  Confidence: ${result.confidence_pct}%`,
  ];
  if (result.confidenceFlags.length > 0) {
    lines.push(`  Confidence Flags: ${result.confidenceFlags.join(', ')}`);
  }
  lines.push(`
INSTRUCTIONS FOR TEAM EVALUATION:
- Interpret Team KR in the context of the program's level and system.
- Contrast Offensive vs Defensive KR — identify if the team is offense-led or defense-led.
- Note rotation depth (rotation_size) relative to typical rosters at this level.
- If confidence is low, explain what roster data is missing.`);

  return lines.join('\n');
}

// ── Confidence Warning Block ──

function buildConfidenceWarning(result: IntelligenceResult): string {
  if (result.confidence_pct >= 70) return '';

  const lines = [`CONFIDENCE WARNING: ${result.confidence_pct}%`];
  if (result.confidenceFlags.includes('missing_coach_context')) {
    lines.push(`  Reason: Coach Context not set. Evaluation cannot proceed without program binding.`);
  }
  if (result.confidenceFlags.includes('low_sample_games')) {
    lines.push(`  Reason: Fewer than 5 games played. Sample is too small for reliable evaluation.`);
  }
  if (result.confidenceFlags.includes('low_trait_coverage')) {
    lines.push(`  Reason: Fewer than 40% of scoreable traits have data. Result has wide uncertainty.`);
  }
  if (result.confidenceFlags.includes('low_minutes')) {
    lines.push(`  Reason: Under 10 minutes per game. Limited meaningful performance data.`);
  }
  lines.push(`  Communicate this uncertainty clearly to the user. Do not overpresent results.`);

  return lines.join('\n');
}

// ── Query-Type-Specific Instructions ──

const QUERY_TYPE_INSTRUCTIONS: Partial<Record<IntelligenceQueryType, string>> = {
  player_eval: `
You are evaluating a player for a specific program. The V1 Evaluation Protocol has run and produced the result above.
Your role: narrate the result in clear basketball language. Explain what the KR means at this level, what the confidence reflects, and what the strengths/gaps tell a coach.`,

  team_eval: `
You are analyzing a team's roster composition. The Team KR engine has computed aggregate ratings.
Your role: interpret the numbers, identify roster trends, and provide actionable observations.`,

  legend_lookup: `
The user wants to understand what a KR value means. Use the legend tier context provided in this prompt to explain the tier label, role expectations, and comparable profiles at this level. Cross-reference the Level Tier Map to show how this rating translates at adjacent competition levels.`,

  general_basketball: `
Answer the basketball question directly using your knowledge. No engine output is available for this query.`,

  unknown: `
The query intent was not clearly identified. Answer the basketball question as best you can, and ask clarifying questions if needed.`,
};

// ── Main Builder ──

export interface NexusPromptInput {
  result: IntelligenceResult;
  coachContext?: CoachContext | null;
  userMessage: string;
}

export interface NexusPromptOutput {
  systemPrompt: string;
  hasEngineContext: boolean;
}

export function buildNexusPrompt(input: NexusPromptInput): NexusPromptOutput {
  const { result, coachContext } = input;
  const sections: string[] = [];

  // 1. Role declaration
  sections.push(
    `You are Nexus, KaNeXT's basketball intelligence assistant. You help coaches evaluate players, analyze rosters, run game simulations, and make basketball decisions. You never make up statistics or ratings — you interpret what the intelligence engines compute.`
  );

  // 2. Program identity
  sections.push(buildProgramIdentityBlock(coachContext));

  // 3. Engine results (if any)
  if (result.playerEval) sections.push(buildPlayerEvalBlock(result));
  if (result.teamKR) sections.push(buildTeamEvalBlock(result));

  // 4. Confidence warning (if needed)
  const warning = buildConfidenceWarning(result);
  if (warning) sections.push(warning);

  // 5. Query-type instructions
  const typeInstructions = QUERY_TYPE_INSTRUCTIONS[result.queryType];
  if (typeInstructions) {
    sections.push(`QUERY TYPE: ${result.queryType}${typeInstructions}`);
  }

  // 6. Error handling
  if (result.error) {
    sections.push(
      `ENGINE ERROR: ${result.error}\nTell the user this clearly and explain what they need to provide.`
    );
  }

  // 7. Universal constraints
  sections.push(`UNIVERSAL RULES:
- Never invent KR values, stats, or player data.
- Always state confidence when presenting evaluation results.
- Use basketball terminology appropriate for a coach audience.
- Keep responses focused and actionable. Avoid filler.
- If data is missing, say so — do not estimate to fill gaps.`);

  const systemPrompt = sections.filter(Boolean).join('\n\n---\n\n');

  return {
    systemPrompt,
    hasEngineContext: result.engineUsed !== null,
  };
}
