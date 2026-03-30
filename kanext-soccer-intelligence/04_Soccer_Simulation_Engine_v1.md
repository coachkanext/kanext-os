# SOCCER SIMULATION ENGINE -- v1

## 0. Scope
This is the single authoritative document for match simulation. It covers System x System interactions, Archetype x System interactions, possession resolution, match result modeling, physical mismatch modifiers, set piece modeling, and fatigue effects.

The Simulation Engine is probabilistic, not deterministic in outcome. Given the same inputs, the probability distributions are identical. Individual simulated match outcomes may vary (as real matches do), but the expected values and probability distributions are fixed.

---

# SYSTEM x SYSTEM INTERACTION LIBRARY

## Purpose
Maps how each offensive system performs against each defensive system. 14 offense x 10 defense = 140 interactions. Grouped into meaningful clusters with interaction scores.

Interaction Score: -3 (strong defense advantage) to +3 (strong offense advantage). 0 = neutral.

## Interaction Matrix (Summarized by Cluster)

### Possession-Based Offense vs Defensive Systems

| Offense \ Defense | High Press | Mid-Block | Low Block | Counter-Press | Man-Mark | Zonal | Hybrid Press | Park Bus | Offside Trap |
|---|---|---|---|---|---|---|---|---|---|
| Tiki-Taka | 0 | +1 | -1 | -1 | +2 | +1 | 0 | -2 | +1 |
| Possession | -1 | +1 | -1 | -1 | +1 | +1 | 0 | -2 | +1 |
| 3-2-5 Build-Up | -1 | +1 | -1 | -2 | +2 | +1 | -1 | -2 | 0 |

Rationale: Possession systems thrive against man-marking (positional rotations exploit rigid assignments) and mid-blocks (patience finds gaps). They struggle against low blocks and park-the-bus (no space to exploit) and counter-press (turnovers in dangerous areas).

### Transition-Based Offense vs Defensive Systems

| Offense \ Defense | High Press | Mid-Block | Low Block | Counter-Press | Man-Mark | Zonal | Hybrid Press | Park Bus | Offside Trap |
|---|---|---|---|---|---|---|---|---|---|
| Counter-Attack | +2 | 0 | -2 | -1 | +1 | 0 | +1 | -3 | +2 |
| Gegenpressing | +1 | +1 | -1 | 0 | +1 | +1 | 0 | -1 | +1 |
| Direct / Long Ball | +1 | 0 | -1 | +1 | -1 | 0 | +1 | -2 | +2 |

Rationale: Counter-attack thrives against high press (space behind) and offside trap (balls over the top). Struggles against low block and park-the-bus (no transition to exploit). Gegenpressing is broadly effective but neutral against counter-press (both teams pressing = chaos).

### Width-Based Offense vs Defensive Systems

| Offense \ Defense | High Press | Mid-Block | Low Block | Counter-Press | Man-Mark | Zonal | Hybrid Press | Park Bus | Offside Trap |
|---|---|---|---|---|---|---|---|---|---|
| Wing Play | 0 | +1 | 0 | 0 | +1 | -1 | 0 | -1 | +1 |
| Inside Forward | +1 | +1 | -1 | 0 | +2 | 0 | 0 | -2 | +1 |
| Overlap/Underlap | +1 | +1 | -1 | -1 | +1 | 0 | 0 | -2 | +1 |
| Half-Space | +1 | +1 | -1 | 0 | +2 | -1 | 0 | -2 | +1 |

Rationale: Inside forward and half-space systems exploit man-marking (inverted runs confuse rigid assignments). All width systems struggle against park-the-bus (no space wide or central). Wing play is neutral against low block (crossing into packed box has some chance).

### Creator-Based Offense vs Defensive Systems

| Offense \ Defense | High Press | Mid-Block | Low Block | Counter-Press | Man-Mark | Zonal | Hybrid Press | Park Bus | Offside Trap |
|---|---|---|---|---|---|---|---|---|---|
| False 9 / Fluid | 0 | +2 | -1 | 0 | +3 | +1 | +1 | -2 | +1 |
| Heliocentric | -1 | +1 | 0 | -2 | -1 | +1 | -1 | -1 | 0 |
| Target Man | +1 | 0 | +1 | +1 | -2 | +1 | 0 | 0 | -1 |

Rationale: False 9 destroys man-marking (dropping striker drags CB into midfield with nobody to mark). Heliocentric is vulnerable to counter-press (lose the ball near the creator = chaos) and man-marking (mark the creator, system dies). Target man is one of few approaches that works against low block (aerial threat into box).

---

# ARCHETYPE x SYSTEM FIT MATRIX

## Purpose
Maps how well each player archetype fits each tactical system. System Fit % is the primary measure.

Fit Score: 0-100%. 90%+ = elite fit. 70-89% = good fit. 50-69% = workable. Below 50% = poor fit.

### Key Archetype-System Interactions (High-Value Pairs)

| Archetype | Best Systems (90%+) | Good Systems (70-89%) | Poor Systems (<50%) |
|---|---|---|---|
| Regista | Tiki-Taka, Possession, 3-2-5 | False 9, Half-Space | Direct, Target Man, Counter-Attack |
| Mezzala | Gegenpressing, Overlap, Inside Forward | Tiki-Taka, Possession | Low Block (def), Park Bus (def) |
| Advanced Playmaker | False 9, Half-Space, Tiki-Taka | Heliocentric, Inside Forward | Direct, Target Man, Counter-Attack |
| Destroyer | Gegenpressing, Counter-Attack, Direct | Mid-Block, Low Block | Tiki-Taka (offensive role), False 9 |
| Box-to-Box Engine | Gegenpressing, Overlap, Counter-Attack | Possession, Wing Play | False 9, Heliocentric |
| Traditional Winger | Wing Play, Overlap, Counter-Attack | Direct | Inside Forward, Half-Space, Tiki-Taka |
| Inverted Winger | Inside Forward, Half-Space, Gegenpressing | Tiki-Taka, False 9 | Wing Play, Direct |
| Overlapping Fullback | Wing Play, Overlap, Gegenpressing | Inside Forward | Tiki-Taka (inverted FB preferred), False 9 |
| Inverted Fullback | Tiki-Taka, 3-2-5, Possession | False 9, Half-Space | Wing Play, Direct, Counter-Attack |
| Ball-Playing CB | Tiki-Taka, Possession, 3-2-5 | Gegenpressing, False 9 | Direct, Target Man |
| Stopper CB | Direct, Counter-Attack, Low Block | Mid-Block, Wing Play | Tiki-Taka, 3-2-5 |
| False 9 | False 9/Fluid Front, Tiki-Taka | Inside Forward, Half-Space | Direct, Target Man, Wing Play |
| Target Man | Target Man/Route One, Direct, Wing Play | Counter-Attack | Tiki-Taka, False 9, Half-Space, Inside Forward |
| Poacher | Counter-Attack, Wing Play, Overlap | Direct, Inside Forward | Possession, Tiki-Taka (no service pattern) |
| Complete Forward | Gegenpressing, Inside Forward, Overlap | Most systems (versatile) | Park Bus (def system, not relevant) |
| Pressing Forward | Gegenpressing, High Press (def) | Counter-Attack, Overlap | Low Block, Park Bus |
| Sweeper Keeper | Offside Trap, High Press, Tiki-Taka | Gegenpressing, Possession | Low Block, Park Bus |
| Shot-Stopper | Low Block, Mid-Block, Park Bus | Counter-Attack, Direct | Offside Trap (can't sweep) |

---

# POSSESSION RESOLUTION MODEL

## How to Simulate Soccer Match Flow

### Possession Chain Model
Each simulated match consists of ~100-120 possession chains per team (varies by tempo).

For each possession chain:
1. Start type: Build-up from GK, Goal kick, Throw-in, Free kick, Corner, Counter-attack, Counter-press recovery
2. Progression: Each chain has a probability of reaching each third of the pitch
   - Own third -> Middle third: depends on build-up quality (Team_Off_KR x System_Modifier)
   - Middle third -> Final third: depends on progressive passing/carrying quality
   - Final third -> Chance: depends on chance creation quality
3. Chance quality: xG value assigned based on:
   - Shot location (driven by system -- e.g., Tiki-Taka generates central chances, Wing Play generates wide crosses)
   - Finishing quality (striker AKR)
   - Defensive pressure (opponent DKR)

### Chance Creation Probability by System Type

| System Type | Avg Chances Created/Match | xG Distribution |
|---|---|---|
| Possession (Tiki-Taka, Build-Up) | 12-16 | Concentrated in central/half-space zones. Lower xG per chance but more volume. |
| Transition (Counter, Gegenpress) | 8-12 | Higher xG per chance (more direct, less defensive organization). Lower volume. |
| Width (Wing Play, Overlap) | 10-14 | Distributed wide-to-central. Crossing xG is lower per chance. |
| Direct (Long Ball, Target Man) | 8-10 | Concentrated in aerial zones. Variable xG. Set pieces significant. |
| Creator (False 9, Heliocentric) | 10-14 | Concentrated through one channel. High variance. |

### xG Per Possession Chain
Base xG per chain = f(Team_Off_KR, Opp_Def_KR, System_Interaction_Score)

Simplified: Base_xG_per_chain = 0.01 + (Team_Off_KR - Opp_Def_KR) x 0.001 + (System_Interaction x 0.002)

---

# MATCH RESULT MODEL

## Pre-Match Win Probability

Inputs:
- Team KR differential (Team A KR - Team B KR)
- System x System interaction score
- Home advantage modifier (+3 to home team's effective KR)
- Fatigue/congestion modifier (matches in last 14 days)

### KR Differential to Win Probability

| KR Differential | Home Win% | Draw% | Away Win% |
|---|---|---|---|
| +10 or more | 70% | 18% | 12% |
| +7 to +9 | 60% | 22% | 18% |
| +4 to +6 | 52% | 25% | 23% |
| +1 to +3 | 46% | 27% | 27% |
| 0 (even) | 43% | 28% | 29% |
| -1 to -3 | 35% | 28% | 37% |
| -4 to -6 | 28% | 26% | 46% |
| -7 to -9 | 22% | 23% | 55% |
| -10 or more | 15% | 19% | 66% |

Note: Soccer has a higher draw rate than basketball. The draw column is significant and cannot be ignored.

### System Interaction Adjustment
Each +1 system interaction score adds ~3% to the favored side's win probability, redistributed from draw and loss.

### Home Advantage
+3 KR equivalent at pro level. +2 at college level (smaller crowds, less travel impact). +4 for elite atmospheres (Anfield, Westfalenstadion, La Bombonera).

---

# PHYSICAL MISMATCH MODIFIERS

## CB vs ST Aerial Duel
If ST height >= CB height + 5cm AND ST Heading Accuracy >= 75:
Aerial advantage = +0.05 xG per match from aerial situations
If both CBs have Aerial Duels < 65: critical set piece vulnerability.

## FB vs W Pace Differential
If W Sprint Speed >= FB Sprint Speed + 10 (or proxy evidence of significant pace gap):
Transition xG modifier: +0.03 per match from wide transition situations.
If FB has no recovery pace AND system is High Press: +0.05 additional.

## CM vs CM Pressing Intensity Mismatch
If pressing CM (Pressing Intensity >= 80) vs non-pressing CM (Pressing Intensity < 60):
Ball recovery in middle third: +15% frequency for pressing team.
Turnover probability: +8% for the non-pressing midfielder.

## GK vs System Mismatch
If GK is Shot-Stopper (not sweeper) AND opponent plays high through balls:
xG modifier: +0.04 per match from balls over the top.
If GK is Sweeper Keeper AND opponent plays direct/long ball:
Aerial vulnerability: +0.03 from unclaimed crosses.

---

# SET PIECE MODEL

## Corner Kick xG
Base xG per corner = 0.035 (league average)
Modifiers:
- Elite delivery (Set Piece Delivery badge): +0.010
- Aerial dominance (2+ players with Aerial Colossus badge): +0.015
- Opponent aerial weakness (no Aerial Colossus badge in defense): +0.010
- Routine quality (coached set piece routines, from scouting): +0.005 to +0.015

## Free Kick xG (Direct)
Base xG varies by distance: 18-22m = 0.06, 22-26m = 0.04, 26-30m = 0.025, 30m+ = 0.015
Modifiers:
- Dead Ball Specialist badge: +0.015
- Elite FK taker (Free Kick Shooting >= 90): +0.020

## Throw-In / Long Throw
Base xG per attacking throw-in = 0.005
Long throw specialist: +0.010 (equivalent to a corner from the side)

---

# FATIGUE AND SUBSTITUTION MODEL

## Match Minute Performance Decay
Player performance follows a decay curve after minute 60:
- Minutes 1-60: Full performance (100% of KR contribution)
- Minutes 61-75: 95% performance (slight decay)
- Minutes 76-85: 88% performance (noticeable decay)
- Minutes 86-90: 82% performance (significant decay)
- Extra time (91-120): 75% performance

Decay is worse for:
- Players with Stamina < 70: multiply decay by 1.3x
- Players with Injury Resilience < 70: multiply decay by 1.2x
- 3rd match in 7 days: multiply all decay by 1.15x

## Optimal Substitution Timing
Substitution value = (incoming player KR x fresh performance%) - (outgoing player KR x decayed performance%)

General rules:
- If bench player KR is within 5 of starter: substitute at minute 65-70 for maximum fresh-legs impact
- If bench player KR is 5-10 below starter: substitute at minute 75-80 (starter still provides value longer)
- If bench player KR is 10+ below starter: do not substitute unless tactical change required

## Congestion Impact
Matches in last 14 days:
- 1 match: no modifier
- 2 matches: -0.5 effective Team KR
- 3 matches: -1.5 effective Team KR
- 4+ matches: -3.0 effective Team KR (extreme congestion)

---

## GOVERNANCE NOTE
The Simulation Engine produces probabilistic outputs, not predictions. All probability distributions are deterministic given inputs. Individual simulated outcomes vary as real matches do. Simulation outputs are consumed by Game Ops (halftime projections), Scouting (prematch), and Transfer Intelligence (squad impact modeling).
