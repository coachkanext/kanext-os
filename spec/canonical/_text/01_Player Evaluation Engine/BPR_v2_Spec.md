# KaNeXT -- BPR v2 (Basketball Performance Rating)
## Computation Specification
### Status: Internal / Intelligence Layer
### Version: 2.0

---

## 1. Purpose

BPR measures actual on-court impact relative to competition level. It answers one question:

When this player was on the floor, how much better or worse was the team because of them, relative to the expected average at that level?

BPR is an impact anchor that sanity-checks KR. KR tells the story. BPR keeps it honest.

---

## 2. Core Properties

- Zero-centered: BPR = 0 means average impact at the player's level
- Level-normalized: +5 at D1 HM means the same percentile impact as +5 at CCCAA
- Deterministic: same inputs always produce the same output
- Never manually edited, never coach-adjustable, never sandbox-editable

---

## 3. Architecture Overview

BPR v2 is computed in six stages:

```
Stage 1: Position-Adjusted Base Production
Stage 2: Efficiency-Volume Interaction
Stage 3: Role Context Multiplier
Stage 4: Supporting Cast Adjustment
Stage 5: Per-Minute Scaling
Stage 6: Level Normalization
```

Final BPR = output of Stage 6, clamped to [-10, +10] after normalization.

---

## 4. Stage 1 -- Position-Adjusted Base Production

Scale all counting stats to per-100 possessions, then apply position-adjusted coefficients.

### 4.1 Possession Estimation

If team possession count is available, use it directly. Otherwise estimate:

```
team_poss = FGA - OREB + TO + 0.44 * FTA
player_poss_share = (MPG / 40) * team_poss
per_100_factor = 100 / player_poss_share
```

### 4.2 Base Coefficients (per 100 possessions)

| Stat | Base Coeff | Notes |
|------|-----------|-------|
| PTS | +0.027 | Raw scoring contribution |
| AST | +0.135 | Playmaking value |
| OREB | +0.100 | Second chance creation |
| DREB | +0.035 | Defensive possession end |
| STL | +0.170 | Highest value -- creates live-ball turnovers |
| BLK | +0.100 | Rim deterrence + possession end |
| TO | -0.135 | Lost possession value |
| PF | -0.040 | Foul cost (FT attempts given) |
| FTA | +0.015 | Paint aggression signal |

### 4.3 Position Adjustment Multipliers

Each stat coefficient is multiplied by a position-relative factor that rewards above-expectation production and discounts expected production.

| Stat | PG | SG | SF | PF | C |
|------|-----|-----|-----|-----|-----|
| AST | 0.85 | 1.00 | 1.15 | 1.25 | 1.30 |
| OREB | 1.30 | 1.25 | 1.10 | 0.95 | 0.85 |
| DREB | 1.25 | 1.15 | 1.00 | 0.90 | 0.80 |
| STL | 0.90 | 0.95 | 1.00 | 1.10 | 1.20 |
| BLK | 1.40 | 1.30 | 1.15 | 1.00 | 0.85 |
| PTS | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| TO | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| PF | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| FTA | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |

Logic: assists from a center are more valuable (rarer, harder) than assists from a PG. Blocks from a PG are more valuable than blocks from a center. Offensive rebounds from a guard indicate elite motor. Steals from a center indicate unusual perimeter activity.

### 4.4 Base Production Score

```
base_production = SUM(stat_per100 * base_coeff * position_multiplier) for each stat
```

---

## 5. Stage 2 -- Efficiency-Volume Interaction

The relationship between usage and efficiency is non-linear. High usage demands high efficiency. Low usage with high efficiency should be rewarded, not penalized for low volume.

### 5.1 True Shooting Percentage

```
TS% = PTS / (2 * (FGA + 0.44 * FTA))
```

### 5.2 Expected TS% by Usage Band

| Usage Band | Expected TS% |
|-----------|-------------|
| 35%+ | 0.540 |
| 28-34% | 0.530 |
| 22-27% | 0.520 |
| 16-21% | 0.510 |
| Below 16% | 0.500 |

Higher-usage players are expected to be less efficient because they take harder shots. The penalty/reward is relative to the expected TS% at their usage level, not a flat .520 baseline.

### 5.3 EV Adjustment Formula

```
ts_delta = TS% - expected_TS%(usage_band)
usage_weight = (USG% / 25) ^ 1.5
ev_adjustment = ts_delta * usage_weight * 12
```

The exponent (1.5) creates exponential penalty for high-usage inefficiency:
- Rivers: .490 TS%, 38.9% USG -> ts_delta = -.050, usage_weight = 1.87 -> ev_adj = -1.12
- Rosa: .560 TS%, 17.7% USG -> ts_delta = +.050, usage_weight = 0.56 -> ev_adj = +0.34
- Ricketts: .640 TS%, 33.7% USG -> ts_delta = +.100, usage_weight = 1.59 -> ev_adj = +1.91

### 5.4 Clamp

EV adjustment clamped to [-3.0, +3.0] to prevent outlier TS% from dominating.

---

## 6. Stage 3 -- Role Context Multiplier

Players fill different roles. A defensive anchor who does his job perfectly has real impact even with modest counting stats. A volume scorer who chucks has negative impact despite big numbers.

### 6.1 Role Detection

Detect player role from stat profile:

| Role | Detection Criteria | Multiplier |
|------|-------------------|-----------|
| Primary Creator | USG >= 28% AND AST/G >= 3.0 | 1.00 |
| Volume Scorer | USG >= 28% AND AST/G < 3.0 | 0.95 |
| Secondary Creator | 20% <= USG < 28% AND AST/G >= 2.5 | 1.05 |
| Efficient Role Player | USG < 22% AND TS% >= .550 | 1.10 |
| Defensive Anchor | BLK/G >= 2.0 OR (STL/G >= 2.0 AND RPG >= 7.0) | 1.15 |
| Rebounder/Motor | OREB/G >= 2.5 OR (RPG >= 10.0 AND USG < 25%) | 1.10 |
| Specialist Shooter | 3P% >= .380 AND 3PA/G >= 3.0 AND USG < 25% | 1.10 |
| Low-Impact Role | USG < 15% AND no specialist qualifier | 0.90 |

If multiple roles qualify, use the highest multiplier.

Logic: the v1 formula rewarded volume regardless of role. This stage ensures that a player like Rosa (Defensive Anchor, 1.15x) gets proper credit for his specialist impact, while a player like Rivers (Volume Scorer, 0.95x) gets a slight discount for low-efficiency volume.

---

## 7. Stage 4 -- Supporting Cast Adjustment

Players on weak rosters carry disproportionate loads. Players on deep rosters have honest production. This stage adjusts for team context.

### 7.1 Team Depth Score

```
team_top5_avg_ppg = average PPG of the team's top 5 scorers (excluding the player being evaluated)
team_depth_score = team_top5_avg_ppg / 10.0
```

Interpretation:
- team_depth_score >= 1.2: deep team (no adjustment)
- team_depth_score 0.8-1.19: average depth (no adjustment)
- team_depth_score < 0.8: thin roster (suppression credit)

### 7.2 Suppression Credit

If team_depth_score < 0.8:

```
suppression_credit = (0.8 - team_depth_score) * 2.0
```

Maximum suppression credit: +1.0

This acknowledges that a player carrying a weak team has suppressed efficiency and inflated turnovers due to defensive attention and lack of secondary options.

### 7.3 Application

```
stage_4_output = stage_3_output + suppression_credit
```

---

## 8. Stage 5 -- Per-Minute Scaling with Diminishing Returns

Players in limited minutes often have inflated per-100 numbers because they play against bench units or in lower-leverage situations. Full-time starters face tougher matchups and fatigue effects.

### 8.1 Minutes Credibility Factor

| MPG | Credibility Factor |
|-----|--------------------|
| 30+ | 1.00 (full credit) |
| 25-29 | 0.97 |
| 20-24 | 0.93 |
| 15-19 | 0.88 |
| 10-14 | 0.82 |
| 5-9 | 0.72 |
| Below 5 | 0.55 |

### 8.2 Per-Minute Premium

Players who produce at elite rates in limited minutes get a small premium (they're doing more with less opportunity):

```
per_minute_rate = (base_production + ev_adjustment) / (MPG / 40)
if per_minute_rate > 3.0 AND MPG < 20:
    premium = min(0.5, (per_minute_rate - 3.0) * 0.15)
else:
    premium = 0
```

### 8.3 Application

```
stage_5_output = (stage_4_output * credibility_factor) + premium
```

---

## 9. Stage 6 -- Level Normalization

Raw BPR must be normalized so that +5 means the same percentile impact at every level.

### 9.1 Level Normalization Factors

| Level | Lambda | BPR Normalization Divisor |
|-------|--------|--------------------------|
| NCAA D1 HM | 1.000 | 1.00 |
| NCAA D1 MM | 0.958 | 0.98 |
| NCAA D1 LM | 0.917 | 0.95 |
| NCAA D2 | 0.875 | 0.90 |
| NJCAA D1 | 0.833 | 0.85 |
| NAIA | 0.810 | 0.83 |
| CCCAA | 0.765 | 0.78 |
| NJCAA D2 | 0.750 | 0.77 |
| NCAA D3 | 0.667 | 0.70 |
| NJCAA D3 | 0.625 | 0.66 |
| USCAA | 0.583 | 0.62 |
| NCCAA D1 | 0.542 | 0.58 |
| NCCAA D2 | 0.500 | 0.55 |

```
normalized_bpr = stage_5_output / normalization_divisor
```

### 9.2 Final Clamp

```
final_bpr = clamp(normalized_bpr, -10.0, +10.0)
```

The [-10, +10] range after normalization prevents outliers at any level. No more 16.26 or 20.00 BPR values that break interpretation.

---

## 10. Interpretation Bands (Post-Normalization)

These bands apply universally across all levels after normalization:

| BPR Range | Interpretation |
|-----------|---------------|
| +8 to +10 | Generational impact. Best player at the level. |
| +5 to +7.9 | Elite impact. Clear winning driver. All-Conference/All-American. |
| +3 to +4.9 | Strong positive contributor. Starter on winning teams. |
| +1 to +2.9 | Above-average impact. Solid rotation player. |
| -1 to +0.9 | Average. Neutral impact. |
| -3 to -0.9 | Below average. Mild liability in expanded role. |
| -5 to -2.9 | Negative impact. Bench depth or developmental. |
| Below -5 | Severe negative. Below competitive viability at the level. |

---

## 11. BPR Trend

BPR Trend measures trajectory across the season. Computed as the slope of BPR values over the last 10 games (or all games if fewer than 10).

```
bpr_trend = linear_regression_slope(game_bpr_values, last_10_games) * 10
```

| Trend | Interpretation |
|-------|---------------|
| +2.0 or above | Rapid improvement. Breakout trajectory. |
| +0.5 to +1.9 | Positive development. Getting better. |
| -0.5 to +0.4 | Stable. Consistent performer. |
| -1.9 to -0.4 | Declining. Fatigue, injury, or regression. |
| -2.0 or below | Sharp decline. Red flag. |

---

## 12. KR-BPR Cross-Reference

| Scenario | Interpretation | Action |
|----------|---------------|--------|
| High KR + High BPR | True high-level player. Identity matches impact. | Confidence boost on KR. |
| High KR + Low BPR | Skill present, impact not translating. Possible role mismatch, team context suppression, or overrated traits. | Investigate system fit, supporting cast, or trait accuracy. |
| Low KR + High BPR | Role player outperforming profile. Possible KR undervaluation or unscouted traits. | Flag for re-evaluation. May have traits not captured at V1. |
| Low KR + Low BPR | Replacement-level or developmental. | No action. Rating is accurate. |

---

## 13. Game BPR vs Season BPR

BPR applies at two scopes using the same six-stage formula:

- Game BPR: BPR computed from a single game's box score. Used in postgame analysis.
- Season BPR: minutes-weighted average of all game BPR values across the season. Used in player evaluation and pool data.

There is no separate metric name for game-level BPR. The term "PGIS" (Player Game Impact Score) is retired. BPR is BPR regardless of scope.

---

## 14. TPQ (Team Performance Quality)

TPQ measures single-game team performance quality relative to expectation. Separate spec document (TPQ_v1_Spec.md). Not part of BPR computation.

TPQ and BPR are related: game BPR values explain who drove the TPQ outcome. But they are computed independently.

---

## 15. Governance Rules

- BPR is computed by the system. Never manually edited.
- BPR is never coach-adjustable or sandbox-editable.
- BPR is not surfaced raw in the UI. It is used internally to sanity-check KR.
- Any change to methodology, inputs, scaling, or normalization requires documentation and versioning.
- BPR v2 replaces BPR v1. All pool data should be recomputed on v2 formula.

---

## 16. Implementation Notes

### 16.1 Compute Engine Location
BPR is computed in the player pool pipeline (compute_engine.py) during the export/refresh cycle. Not computed by Claude at evaluation time.

### 16.2 Required Inputs (Minimum)
- GP, MPG, PPG, RPG, APG, SPG, BPG, TO/G, PF/G
- FGA, FTA, FG%, 3P%, FT%
- Position
- Level (for normalization)
- Team roster data (for supporting cast adjustment)

### 16.3 Optional Inputs (Improve Accuracy)
- Team possession count
- Usage%
- OREB/G and DREB/G split
- Team win-loss record

### 16.4 Missing Data Handling
- If USG% is missing: estimate from (FGA + 0.44*FTA + TO) / (MPG/40 * team_poss * 0.2)
- If OREB/DREB split missing: estimate OREB = RPG * 0.35, DREB = RPG * 0.65
- If position unknown: use "SF" (neutral multipliers closest to 1.0)
- If team roster unavailable: skip Stage 4 (no suppression credit)

---

## 17. Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2025 | Initial box-score formula. Flat coefficients, TS% adjustment, [-15, +20] clamp. |
| v2 | March 2026 | Position-adjusted coefficients, efficiency-volume interaction, role context, supporting cast adjustment, per-minute scaling, level normalization, [-10, +10] post-normalization clamp. |
