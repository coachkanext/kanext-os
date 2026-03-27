/**
 * Team KR Computation (TypeScript)
 * Port of services/player-pool/engine/team_kr.py
 *
 * Team_Offense_KR = Σ(Final_System_Offense_KRᵢ × wᵢ)
 * Team_Defense_KR = Σ(Final_System_Defense_KRᵢ × wᵢ)
 * Team_KR = Team_Offense_KR × 0.53 + Team_Defense_KR × 0.47
 *
 * Locked 53/47 split. Rotation-only model (no starter/bench labels).
 * Pure function. Same inputs → same outputs.
 */

export const MIN_PARTICIPATION = 0.05; // 5% threshold
export const OFF_WEIGHT        = 0.53;
export const DEF_WEIGHT        = 0.47;

export interface TeamKRInput {
  /** Player's offensive KR (base or system-adjusted) */
  base_off_kr: number;
  /** Player's defensive KR (base or system-adjusted) */
  base_def_kr: number;
  /** Player's overall KR */
  overall_kr: number;
  /** Total season minutes */
  minutes_total: number;
}

export interface TeamKRResult {
  team_off_kr:     number;
  team_def_kr:     number;
  team_overall_kr: number;
  rotation_size:   number;
}

/**
 * Compute team KR from player rotation data.
 *
 * Algorithm:
 *   1. Compute raw participation weight = minutes_total / total_minutes
 *   2. Filter out players below MIN_PARTICIPATION (5%) threshold
 *   3. Re-normalize weights among included players (sum → 1.0)
 *   4. Weighted average of off/def KRs → Team_Off/Def_KR
 *   5. Team_KR = 0.53 * Team_Off_KR + 0.47 * Team_Def_KR
 */
export function computeTeamKR(players: TeamKRInput[]): TeamKRResult {
  const empty: TeamKRResult = {
    team_off_kr: 0, team_def_kr: 0, team_overall_kr: 0, rotation_size: 0,
  };

  if (!players.length) return empty;

  const totalMin = players.reduce((s, p) => s + (p.minutes_total ?? 0), 0);
  if (totalMin <= 0) return empty;

  // Compute raw weights, filter below threshold
  const weighted = players
    .map(p => ({ ...p, weight: (p.minutes_total ?? 0) / totalMin }))
    .filter(p => p.weight >= MIN_PARTICIPATION);

  if (!weighted.length) return empty;

  // Re-normalize after filtering
  const includedTotal = weighted.reduce((s, p) => s + p.weight, 0);
  const normalized = weighted.map(p => ({
    ...p,
    weight: includedTotal > 0 ? p.weight / includedTotal : 0,
  }));

  const team_off = normalized.reduce((s, p) => s + (p.base_off_kr ?? 50) * p.weight, 0);
  const team_def = normalized.reduce((s, p) => s + (p.base_def_kr ?? 50) * p.weight, 0);
  const team_overall = team_off * OFF_WEIGHT + team_def * DEF_WEIGHT;

  return {
    team_off_kr:     Math.round(team_off     * 10) / 10,
    team_def_kr:     Math.round(team_def     * 10) / 10,
    team_overall_kr: Math.round(team_overall * 10) / 10,
    rotation_size:   normalized.length,
  };
}
