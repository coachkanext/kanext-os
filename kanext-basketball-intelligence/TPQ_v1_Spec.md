# KaNeXT -- TPQ (Team Performance Quality)
## Computation Specification
### Status: Internal / Intelligence Layer
### Version: 1.0

---

## 1. Purpose

TPQ measures single-game team performance quality relative to expectation and environment. It answers one question:

Given the opponent's strength and the game context, how well did this team actually play?

TPQ is a game-only signal. It is not a season rating, not a program rating, and not a recruiting tool. It powers postgame analysis in the Scouting & Game Ops flow.

BPR measures individual player impact. TPQ measures team performance quality. They are computed independently but connected: player BPR values explain who drove the TPQ outcome.

---

## 2. Core Properties

- Single-game only. Computed per game, never smoothed or blended.
- Context-aware: opponent strength, location, pace, game type.
- Deterministic: same inputs always produce the same output.
- 0-10 scale. 5.0 is neutral (performed as expected).
- Never manually edited, never coach-adjustable.

---

## 3. Output Scale

| TPQ Range | Interpretation |
|-----------|---------------|
| 9.0-10.0 | Dominant. Championship-level performance. Everything clicked. |
| 8.0-8.9 | Elite. Significantly exceeded expectations on both ends. |
| 7.0-7.9 | Strong. Clear overperformance. Won convincingly or competed well above level. |
| 6.0-6.9 | Solid. Slightly above expected. Clean execution. |
| 5.0-5.9 | Neutral. Performed roughly as expected given opponent and context. |
| 4.0-4.9 | Below standard. Underperformed expectations. Execution issues. |
| 3.0-3.9 | Poor. Significant underperformance. |
| 0.0-2.9 | Collapse. Severe underperformance. Blowout loss or complete breakdown. |

---

## 4. Architecture Overview

TPQ is computed in four components, then combined:

```
Component 1: Result vs Expectation (RVE) -- 40% weight
Component 2: Efficiency Margin (EFF) -- 30% weight
Component 3: Control Factors (CTRL) -- 20% weight
Component 4: Context Stakes (CTX) -- 10% weight
```

```
TPQ_raw = (RVE * 0.40) + (EFF * 0.30) + (CTRL * 0.20) + (CTX * 0.10)
TPQ = clamp(TPQ_raw, 0.0, 10.0)
```

Each component outputs a value on the 0-10 scale before weighting.

---

## 5. Component 1 -- Result vs Expectation (RVE)

### 5.1 Expected Margin

Calculate the expected point margin based on the KR difference between the two teams, adjusted for location.

```
kr_diff = team_kr - opponent_kr
location_adjustment:
    HOME = +3.0
    AWAY = -3.0
    NEUTRAL = 0.0

expected_margin = (kr_diff * 0.5) + location_adjustment
```

The 0.5 multiplier converts KR difference to expected point margin. A 10-KR advantage translates to an expected 5-point win (before location). This coefficient is tunable with real game data.

### 5.2 Actual vs Expected Delta

```
actual_margin = team_points - opponent_points
margin_delta = actual_margin - expected_margin
```

### 5.3 RVE Score (0-10)

```
RVE = 5.0 + (margin_delta * 0.20)
RVE = clamp(RVE, 0.0, 10.0)
```

Each point of margin above/below expectation shifts RVE by 0.20.
- Beat expectation by 10 points: RVE = 7.0
- Met expectation exactly: RVE = 5.0
- Missed expectation by 15 points: RVE = 2.0

### 5.4 Win Bonus / Loss Penalty

Winning matters beyond margin. A 1-point win that exceeded expectation by 1 is better than a 1-point loss that exceeded expectation by 1.

```
if won:
    RVE = RVE + 0.5
if lost:
    RVE = RVE - 0.3
RVE = clamp(RVE, 0.0, 10.0)
```

---

## 6. Component 2 -- Efficiency Margin (EFF)

Measures how well the team executed offensively and defensively relative to the opponent, adjusted for pace.

### 6.1 Possession Estimation

```
team_poss = FGA - OREB + TO + 0.44 * FTA
opp_poss = opp_FGA - opp_OREB + opp_TO + 0.44 * opp_FTA
avg_poss = (team_poss + opp_poss) / 2
```

### 6.2 Points Per Possession

```
team_ppp = team_points / team_poss
opp_ppp = opp_points / opp_poss
net_ppp = team_ppp - opp_ppp
```

### 6.3 EFF Score (0-10)

```
EFF = 5.0 + (net_ppp * 5.0)
EFF = clamp(EFF, 0.0, 10.0)
```

Each 0.10 net PPP advantage shifts EFF by 0.5 points.
- Net PPP +0.20 (dominant): EFF = 6.0
- Net PPP 0.00 (even): EFF = 5.0
- Net PPP -0.30 (outclassed): EFF = 3.5

---

## 7. Component 3 -- Control Factors (CTRL)

Measures process quality beyond points and efficiency. Did the team control the game in the ways that indicate real quality?

### 7.1 Four Factors

Compute advantage in each of the Four Factors of basketball:

```
efg_margin = team_eFG% - opp_eFG%
tov_margin = opp_TOV% - team_TOV%  (opponent's is positive for us)
oreb_margin = team_OREB% - opp_OREB%
ft_rate_margin = team_FTR - opp_FTR

where:
    eFG% = (FGM + 0.5 * 3PM) / FGA
    TOV% = TO / (FGA + 0.44 * FTA + TO)
    OREB% = OREB / (OREB + opp_DREB)
    FTR = FTA / FGA
```

### 7.2 Factor Scores (each 0-10)

```
efg_score = 5.0 + (efg_margin * 50)    -- each 1% eFG advantage = +0.5
tov_score = 5.0 + (tov_margin * 40)    -- each 1% TOV advantage = +0.4
oreb_score = 5.0 + (oreb_margin * 30)  -- each 1% OREB advantage = +0.3
ft_score = 5.0 + (ft_rate_margin * 15) -- each 1% FTR advantage = +0.15

all clamped to [0.0, 10.0]
```

### 7.3 CTRL Composite

```
CTRL = (efg_score * 0.35) + (tov_score * 0.25) + (oreb_score * 0.20) + (ft_score * 0.20)
```

Weighting reflects impact hierarchy: shooting efficiency matters most, turnovers second, offensive rebounding and free throw rate third.

---

## 8. Component 4 -- Context Stakes (CTX)

Small weight (10%) that rewards strong performance in high-stakes contexts and discounts low-stakes games.

### 8.1 Game Type Multiplier

| Game Type | Multiplier |
|-----------|-----------|
| Conference Tournament / Postseason | 1.15 |
| Conference Game | 1.05 |
| Non-Conference (ranked opponent) | 1.05 |
| Non-Conference (standard) | 1.00 |
| Exhibition / Non-Competitive | 0.80 |

### 8.2 Opponent Quality Multiplier

```
if opponent_kr >= 85 (at their level):
    opp_quality = 1.10
elif opponent_kr >= 75:
    opp_quality = 1.00
elif opponent_kr >= 65:
    opp_quality = 0.95
else:
    opp_quality = 0.85
```

Note: opponent_kr here means the opponent's Team KR, not an individual player.

### 8.3 CTX Score

```
base_ctx = 5.0  (neutral starting point)
if team won:
    CTX = base_ctx * game_type_multiplier * opp_quality
else:
    CTX = base_ctx * (1 / game_type_multiplier) * (1 / opp_quality)
CTX = clamp(CTX, 0.0, 10.0)
```

Winning a conference tournament game against a strong opponent gets CTX above 6. Losing a non-conference game against a weak opponent gets CTX below 4.

---

## 9. Lite Mode (Fallback)

If only minimal data is available (final score, opponent KR, location, game type):

```
TPQ_lite = RVE only (Component 1)
TPQ_lite tagged as mode = LITE
```

Lite mode is acceptable for quick postgame snapshots but must not be treated as full-certainty. When full box score data becomes available, recompute as full TPQ.

---

## 10. TPQ Decomposition Object

Every TPQ computation must store a decomposition for audit and explanation:

```
{
    game_id,
    team_kr_pregame,
    opponent_kr_pregame,
    location,
    game_type,
    expected_margin,
    actual_margin,
    margin_delta,
    rve_score,
    eff_score,
    ctrl_score,
    ctx_score,
    tpq_final,
    tpq_version,
    tpq_mode (FULL or LITE)
}
```

This decomposition powers the postgame staff packet in the Scouting & Game Ops Engine (File 05). The coach sees the TPQ score plus the breakdown of why.

---

## 11. Relationship to BPR

TPQ is team-level, single-game. BPR is player-level, game or season.

TPQ tells you how the team played. BPR tells you who drove it.

In the postgame flow:
1. TPQ gives the headline: "We played a 7.2 tonight against a strong opponent."
2. Player game BPR values explain why: "Player A was +6.3, Player B was -2.1, Player C was +4.8."

TPQ does not sum from BPR. BPR does not derive from TPQ. They are independently computed and cross-referenced.

---

## 12. Governance Rules

- TPQ is computed by the system. Never manually edited.
- TPQ is never coach-adjustable or sandbox-editable.
- TPQ is not recomputed "on open" as a UI side effect.
- Any change to methodology, inputs, scaling, or normalization requires documentation and versioning.
- TPQ outputs must store version and input hash for audit.

---

## 13. Implementation Notes

### 13.1 When to Compute
TPQ is computed postgame when the box score is finalized. It is not a live metric during the game.

### 13.2 Required Inputs (Full Mode)
- Team KR (pregame)
- Opponent Team KR (pregame)
- Location (HOME/AWAY/NEUTRAL)
- Game type (CONF/NON-CONF/TOURNEY)
- Full team box score (FGA, FGM, 3PA, 3PM, FTA, FTM, OREB, DREB, TO, PF, PTS)
- Full opponent box score (same stats)

### 13.3 Required Inputs (Lite Mode)
- Team KR, Opponent Team KR, Location, Game Type, Final Score

### 13.4 Dependencies
- Team KR from the Team Intelligence Engine (File 03)
- Opponent Team KR (from pool or estimated)

### 13.5 Future Enhancement
When play-by-play data is available (V3 data tier), TPQ can incorporate run analysis (largest run, response to opponent runs), clutch performance (last 5 minutes of close games), and momentum shifts. These would be additional components with small weights added to the existing four.

---

## 14. Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | March 2026 | Initial spec. Four-component architecture. 0-10 scale. Full and Lite modes. |
