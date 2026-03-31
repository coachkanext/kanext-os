# WOMEN'S SOCCER SIMULATION ENGINE -- v1

## 0. Scope
This is the single authoritative document for match simulation. It covers System x System interactions, Archetype x System interactions, possession resolution, match result modeling, physical mismatch modifiers, set piece modeling, and fatigue effects.

Architecture is identical to men's soccer simulation engine. The interaction scores, possession model, and xG resolution are the same. Women's-specific adjustments apply to physical mismatch modifiers and fatigue parameters.

---

# SYSTEM x SYSTEM INTERACTION LIBRARY

## Purpose
Maps how each offensive system performs against each defensive system. 14 offense x 10 defense = 140 interactions.

Interaction Score: -3 (strong defense advantage) to +3 (strong offense advantage). 0 = neutral.

(Interaction matrix is identical to men's soccer. See men's File 04 for complete 140-interaction matrix. All scores are system-vs-system and are gender-neutral -- a Tiki-Taka attack vs a Low Block defense produces the same interaction dynamics regardless of gender.)

## Interaction Matrix Summary

### Possession-Based Offense vs Defensive Systems

| Offense \ Defense | High Press | Mid-Block | Low Block | Counter-Press | Man-Mark | Zonal | Hybrid Press | Park Bus | Offside Trap |
|---|---|---|---|---|---|---|---|---|---|
| Tiki-Taka | 0 | +1 | -1 | -1 | +2 | +1 | 0 | -2 | +1 |
| Possession | -1 | +1 | -1 | -1 | +1 | +1 | 0 | -2 | +1 |
| 3-2-5 Build-Up | -1 | +1 | -1 | -2 | +2 | +1 | -1 | -2 | 0 |

### Transition-Based Offense vs Defensive Systems

| Offense \ Defense | High Press | Mid-Block | Low Block | Counter-Press | Man-Mark | Zonal | Hybrid Press | Park Bus | Offside Trap |
|---|---|---|---|---|---|---|---|---|---|
| Counter-Attack | +2 | 0 | -2 | -1 | +1 | 0 | +1 | -3 | +2 |
| Gegenpressing | +1 | +1 | -1 | 0 | +1 | +1 | 0 | -1 | +1 |
| Direct / Long Ball | +1 | 0 | -1 | +1 | -1 | 0 | +1 | -2 | +2 |

### Width-Based Offense vs Defensive Systems

| Offense \ Defense | High Press | Mid-Block | Low Block | Counter-Press | Man-Mark | Zonal | Hybrid Press | Park Bus | Offside Trap |
|---|---|---|---|---|---|---|---|---|---|
| Wing Play | 0 | +1 | 0 | 0 | +1 | -1 | 0 | -1 | +1 |
| Inside Forward | +1 | +1 | -1 | 0 | +2 | 0 | 0 | -2 | +1 |
| Overlap/Underlap | +1 | +1 | -1 | -1 | +1 | 0 | 0 | -2 | +1 |
| Half-Space | +1 | +1 | -1 | 0 | +2 | -1 | 0 | -2 | +1 |

### Creator-Based Offense vs Defensive Systems

| Offense \ Defense | High Press | Mid-Block | Low Block | Counter-Press | Man-Mark | Zonal | Hybrid Press | Park Bus | Offside Trap |
|---|---|---|---|---|---|---|---|---|---|
| False 9 / Fluid | 0 | +2 | -1 | 0 | +3 | +1 | +1 | -2 | +1 |
| Heliocentric | -1 | +1 | 0 | -2 | -1 | +1 | -1 | -1 | 0 |
| Target Man | +1 | 0 | +1 | +1 | -2 | +1 | 0 | 0 | -1 |

---

# ARCHETYPE x SYSTEM FIT MATRIX

(Identical to men's soccer. See men's File 04 for complete matrix. Archetype-System fit scores are system-level dynamics and do not change by gender.)

---

# POSSESSION RESOLUTION MODEL

## How to Simulate Women's Soccer Match Flow

### Possession Chain Model
Each simulated match consists of ~95-115 possession chains per team (slightly lower than men's due to slightly lower tempo on average at most levels).

For each possession chain:
1. Start type: Build-up from GK, Goal kick, Throw-in, Free kick, Corner, Counter-attack, Counter-press recovery
2. Progression: Each chain has a probability of reaching each third of the pitch
3. Chance quality: xG value assigned based on shot location, finishing quality, and defensive pressure

### Chance Creation Probability by System Type

| System Type | Avg Chances Created/Match | xG Distribution |
|---|---|---|
| Possession (Tiki-Taka, Build-Up) | 10-14 | Concentrated in central/half-space zones. |
| Transition (Counter, Gegenpress) | 7-11 | Higher xG per chance. Lower volume. |
| Width (Wing Play, Overlap) | 9-13 | Distributed wide-to-central. |
| Direct (Long Ball, Target Man) | 7-9 | Concentrated in aerial zones. |
| Creator (False 9, Heliocentric) | 9-13 | Concentrated through one channel. High variance. |

Women's-specific note: Average match xG in top women's leagues (WSL, NWSL) is typically 1.8-2.8 combined, slightly lower than men's top leagues (2.2-3.2). This reflects slightly lower shot volume and conversion rates on average.

### xG Resolution
For each chance: P(goal) = f(xG, Finishing_Quality_Modifier, GK_Quality_Modifier)
- Finishing_Quality_Modifier: (Shooter AKR - 80) x 0.005 (positive for elite finishers, negative for poor ones)
- GK_Quality_Modifier: (GK DKR - 80) x 0.005 (positive GK reduces xG)

---

# PHYSICAL MISMATCH MODIFIERS (Women's Soccer-Specific)

## Purpose
Adjusts simulation probabilities when physical mismatches exist between teams.

## Modifier Categories

### 1) Aerial Mismatch
Trigger: One team's average CB/ST height is 6+ cm taller than opponent's.
Effect: +0.15 xG from set pieces per match for the taller team.
Women's context: Average CB height in WSL/NWSL is ~170cm. A CB pairing averaging 176cm+ represents significant aerial advantage.

### 2) Pace Mismatch (Transition)
Trigger: One team has significantly faster wide players/FBs (qualitative assessment or tracking data).
Effect: +0.10 xG in transition per match for the faster team.
Women's context: Pace differentials are meaningful but the absolute speed ceiling is lower than men's. The relative mismatch matters more than the absolute speed.

### 3) Stamina Mismatch (Late-Game)
Trigger: One team's midfield averages 85+ min/match, opponent's averages below 75 min/match.
Effect: After 70': pressing effectiveness of the lower-stamina team drops 15%. xG generation drops 10%.
Women's context: Stamina management is critical in women's soccer. ACL injury risk increases with fatigue, so coaches may substitute earlier for injury prevention.

### 4) Strength Mismatch (Duels)
Trigger: One team wins 60%+ of physical duels across the pitch.
Effect: +5% ball recovery rate for the stronger team.
Women's context: Strength differentials exist but are less extreme than in men's soccer. Technical ability and speed often compensate for strength gaps.

## Set Piece Modeling

Set pieces account for ~25-30% of goals in women's soccer (slightly higher than men's ~25%). This is primarily driven by:
- Goalkeeper height (average women's GK ~172cm vs men's ~188cm) creating more vulnerability on corners/crosses
- Set piece routines being a genuine equalizer at lower technical levels
- Corner delivery quality being a bigger differentiator

xG from set pieces per match: baseline 0.35 per team, adjusted by:
- Aerial advantage: +/- 0.10
- Set piece delivery quality (team's best set piece specialist AKR): +/- 0.08
- GK quality on crosses/claiming: +/- 0.08

## Fatigue Model

Base fatigue curve is similar to men's but with two women's-specific adjustments:
1. ACL risk factor: coaches in simulation are assumed to be more cautious with substitutions, particularly for players with prior ACL history
2. International duty fatigue: women's players called up for national team duty often have shorter recovery windows between club and international matches

---

# MATCH RESULT MODELING

(Identical Poisson-based model to men's soccer. See men's File 04. Match outcome = f(Team Off xG, Team Def xG conceded, variance). Win/Draw/Loss probabilities computed from xG distributions.)

---

## GOVERNANCE NOTE
The Simulation Engine is probabilistic, not deterministic in outcome. Given the same inputs, the probability distributions are identical. All modifiers are versioned and locked.
