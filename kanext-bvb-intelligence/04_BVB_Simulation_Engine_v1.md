# Beach Volleyball Simulation Engine v1

---

## 0. SCOPE

This is the single authoritative document for match simulation in beach volleyball. It covers set-by-set simulation, rally scoring mechanics, weather/wind modifiers, partnership synergy modifier, and outcome projection.

The simulation engine does not evaluate players or pairs. It consumes Partnership KR outputs (from File 03) and produces match projections.

---

## 1. MATCH STRUCTURE

Beach volleyball matches are best of 3 sets:
- Sets 1-2: played to 21 points, win by 2 (no cap)
- Set 3: played to 15 points, win by 2 (no cap)
- Teams switch sides every 7 points in sets 1-2, every 5 points in set 3
- A pair must win 2 sets to win the match

**Implications for simulation:**
- Each set is shorter than indoor (21 vs 25 points), meaning higher variance per set
- Only 2 or 3 sets are played, so fewer opportunities for regression to the mean
- Third sets are volatile (15 points, like indoor fifth set)
- Side switching matters because wind and sun advantage changes every 7 (or 5) points
- No substitutions means fatigue is cumulative and there is no tactical personnel change

---

## 2. RALLY SCORING MODEL

Every rally results in a point. Points are scored on:
- Kill (attack terminates the rally)
- Block (stuff block - ball hits blocker's hands and lands on attacker's side)
- Ace (serve is not returned)
- Opponent error (attack error, service error, ball-handling error, net violation, foot fault)

### 2.1 Point Distribution Model

At the AVP Pro level, the approximate distribution of points scored is:

| Point Type | Approximate Share (Women's) | Approximate Share (Men's) |
|-----------|---------------------------|--------------------------|
| Kills (attack terminates) | 35-40% | 38-43% |
| Opponent attack errors | 12-16% | 10-14% |
| Aces | 8-12% | 10-14% |
| Blocks (stuff blocks) | 5-9% | 7-11% |
| Opponent service errors | 10-14% | 8-12% |
| Other errors (ball handling, net) | 12-16% | 10-14% |

**Gender difference note:** Men's beach volleyball features more power serving (higher ace% and service error%) and slightly more blocking (taller players, higher net). Women's beach tends to have longer rallies and more errors from ball handling.

### 2.2 Rally Length Model
Average rally length at the pro level is approximately 3-5 contacts. Beach rallies are shorter than indoor on average because:
- Only 2 players per side means fewer defensive recoveries
- The sand surface makes sustained defense harder
- Stuff blocks end rallies quickly

Long rallies (8+ contacts) favor pairs with better defensive and transition games. Short rallies favor pairs with dominant serving and attacking.

---

## 3. SET SIMULATION

### 3.1 Win Probability Formula

The probability that Pair A wins a single set against Pair B:

```
Set_Win_Prob_A = sigmoid(k * (Effective_KR_A - Effective_KR_B))
```

Where:
- `Effective_KR` incorporates Partnership KR, weather modifier, and synergy modifier
- `k` is the scaling constant (calibrated to 0.075 for beach volleyball - higher than indoor's 0.065 because 2v2 has more variance)
- `sigmoid(x) = 1 / (1 + exp(-x))`

### 3.2 Effective KR Computation

```
Effective_KR_A = Partnership_KR_A + Weather_Modifier_A + Fatigue_Modifier_A + Side_Modifier_A
```

### 3.3 Weather Modifier

Weather is a major factor in beach volleyball. The simulation must account for it.

**Wind Modifier:**

| Wind Speed | Condition | Modifier Description |
|-----------|-----------|---------------------|
| 0-5 mph | Calm | No modifier. Standard conditions. |
| 6-10 mph | Light | Slight advantage to pair with better IQKR (+0.5 to higher-IQKR pair). Float serves become more effective. |
| 11-15 mph | Moderate | Significant advantage to the pair with better IQKR (+1.5 to higher-IQKR pair). Power serving advantage decreases. Shot selection becomes critical. |
| 16-20 mph | Heavy | Strong advantage to the pair with better wind experience (+2.5 to pair with Wind Warrior badge or higher IQKR). Float serves become difficult to control. Jump serves become risky. |
| 21+ mph | Extreme | Major advantage to experience (+3.5 to pair with better IQKR/wind experience). Many serves go out. Scoring becomes highly random. Lower-ranked pairs can upset. |

**Wind Direction Sub-Modifier:**
- Side wind: more disruptive than headwind/tailwind (+0.5 additional to IQKR advantage)
- Swirling/variable wind: most disruptive (+1.0 additional to IQKR advantage)
- Consistent headwind/tailwind: least disruptive, can be planned for

**Sun Modifier:**
- Sun directly in server's eyes: -0.5 to serving effectiveness for the affected side
- Sun directly in defender's eyes: -0.5 to defensive effectiveness for the affected side
- Side switching mitigates sun advantage every 7 (or 5) points, but one side is always disadvantaged at any given moment
- Late afternoon sun (low angle) is more disruptive than midday sun

**Temperature Modifier:**
| Temperature | Condition | Modifier |
|------------|-----------|----------|
| Under 70F / 21C | Cool | No modifier. Favorable for sustained play. |
| 70-85F / 21-29C | Warm | No modifier. Standard beach conditions. |
| 86-95F / 30-35C | Hot | -0.5 to both pairs (increased fatigue). Pair with better Iron Player badge or conditioning = mitigated. |
| 96F+ / 35C+ | Extreme heat | -1.5 to both pairs. Iron Player badge holder mitigated by 0.5. Medical timeouts more likely. |

**Sand Depth Modifier:**
- Compact/hard sand: slight advantage to jumping ability (+0.3 to pair with taller blocker)
- Standard depth: no modifier
- Deep/soft sand: advantage to lighter, more mobile players (+0.5 to pair with Speed Defender archetype). Reduces jump height for all players, which slightly reduces blocking effectiveness.

### 3.4 Fatigue Modifier

Beach volleyball tournaments require multiple matches per day. Fatigue accumulates.

| Match Number (Same Day) | Fatigue Modifier |
|-------------------------|-----------------|
| Match 1 | 0 |
| Match 2 | -0.5 |
| Match 3 | -1.5 |
| Match 4 | -3.0 |
| Match 5+ | -5.0 |

**Iron Player badge mitigates fatigue by 30%.** A pair with both players holding Iron Player badges is mitigated by 50%.

**Rest time between matches:**
- 30+ minutes rest between matches: reduce fatigue modifier by 0.5
- 60+ minutes rest: reduce by 1.0
- Same-heat back-to-back (under 20 minutes): increase fatigue by 0.5

### 3.5 Side Modifier

In outdoor beach volleyball, one side of the court is typically more favorable due to wind/sun. The simulation accounts for this:

```
Side_Modifier = 0 if indoor venue or neutral conditions
Side_Modifier = +/-0.5 to +/-1.5 based on wind direction and sun position
```

Side switching every 7 (or 5) points means neither pair holds a permanent side advantage, but the simulation models point-by-point side effects for detailed projections.

---

## 4. MATCH SIMULATION

### 4.1 Set-by-Set Simulation

**Set 1 Win Probability:**
```
P(A wins Set 1) = sigmoid(k * (Effective_KR_A_Set1 - Effective_KR_B_Set1))
```

**Set 2 Win Probability (conditional on Set 1 outcome):**
If one pair won Set 1, they may have a slight momentum advantage:
```
Momentum_Modifier = +0.5 for the Set 1 winner (beach is more momentum-driven than indoor due to fewer points per set)
P(A wins Set 2) = sigmoid(k * (Effective_KR_A_Set2 + Momentum_if_won_Set1 - Effective_KR_B_Set2 - Momentum_if_B_won_Set1))
```

**Set 3 Win Probability (if 1-1):**
Set 3 is to 15. Higher variance. Momentum resets.
```
k_set3 = 0.085 (higher variance in short set)
P(A wins Set 3) = sigmoid(k_set3 * (Effective_KR_A_Set3 - Effective_KR_B_Set3))
```

Set 3 incorporates maximum fatigue from the match and no momentum carryover (clean slate at 1-1).

### 4.2 Match Win Probability

```
P(A wins match) = P(A wins 2-0) + P(A wins 2-1)

P(A wins 2-0) = P(A wins Set 1) * P(A wins Set 2 | A won Set 1)
P(A wins 2-1) = P(A wins Set 1) * P(B wins Set 2 | A won Set 1) * P(A wins Set 3)
              + P(B wins Set 1) * P(A wins Set 2 | B won Set 1) * P(A wins Set 3)
```

---

## 5. DUAL MATCH SIMULATION (COLLEGE)

### 5.1 Dual Match Format
NCAA beach volleyball dual matches are best of 5 pair matches. Each pair match is independent.

**Lineup Strategy:**
Coaches submit their lineup of 5 pairs, ranked 1-5. The opponent does the same simultaneously. Pair 1 plays Pair 1, Pair 2 plays Pair 2, etc.

However, coaches can strategize by moving pairs up or down in the order (e.g., putting their best pair at position 3 to target a perceived weak spot).

### 5.2 Dual Match Win Probability

For each of the 5 pair matchups, simulate the individual match (as above). The probability of winning the dual is:

```
P(Team A wins dual) = P(A wins 3+ of 5 pair matches)
```

This is computed combinatorially from the 5 independent pair match probabilities.

### 5.3 Lineup Optimization

Given two squads, the simulation engine can evaluate all possible lineup orderings and recommend the optimal lineup arrangement.

**Input:** Team A's 5 pairs with Partnership KRs, Team B's 5 pairs with Partnership KRs
**Output:** The lineup ordering for Team A that maximizes P(A wins dual)

This involves evaluating all 5! = 120 possible orderings of Team A's 5 pairs against Team B's fixed lineup (or against all 120 of Team B's orderings for game theory analysis).

---

## 6. TOURNAMENT SIMULATION

### 6.1 Tournament Formats
Beach volleyball tournaments use several formats:
- **Pool play into bracket:** Groups of 3-4 pairs, top pairs advance to single or double elimination bracket
- **Double elimination:** Two losses to be eliminated. Winners bracket and losers bracket.
- **Single elimination with consolation:** One loss into consolation bracket.
- **Modified double elimination (NCAA Championship format):** Pool play followed by double-elimination bracket.

### 6.2 Tournament Path Projection
Given a tournament bracket/pool and Partnership KRs for all entries:

1. Simulate each match in the bracket
2. Carry fatigue modifiers forward (later-round matches have higher fatigue)
3. Account for weather conditions specific to the venue and time of day
4. Output: win probability for each pair to reach each round (quarterfinal, semifinal, final, champion)

---

## 7. SIMULATION OUTPUT FORMAT

```
MATCH SIMULATION
=================
Pair A: [Player 1 / Player 2] - Partnership KR: [XX.X]
Pair B: [Player 3 / Player 4] - Partnership KR: [XX.X]

Venue: [Venue Name]
Conditions: Wind [X mph, direction], Temp [X F/C], Sun [position], Sand [condition]

MATCH WIN PROBABILITY:
  Pair A: [XX.X]%
  Pair B: [XX.X]%

SET PROJECTIONS:
  Set 1: Pair A [XX]% / Pair B [XX]%
  Set 2 (if A wins S1): Pair A [XX]% / Pair B [XX]%
  Set 2 (if B wins S1): Pair A [XX]% / Pair B [XX]%
  Set 3 (if 1-1): Pair A [XX]% / Pair B [XX]%

LIKELY OUTCOMES:
  2-0 Pair A: [XX]%
  2-1 Pair A: [XX]%
  2-0 Pair B: [XX]%
  2-1 Pair B: [XX]%

WEATHER IMPACT:
  Wind: [Description of wind impact on both pairs]
  Sun: [Description of sun impact]
  Temperature: [Fatigue/heat impact]

KEY MATCHUP FACTORS:
- [Factor 1: e.g., "Pair A's serving advantage should produce 2-3 more aces"]
- [Factor 2: e.g., "Pair B's defensive range may extend rallies, favoring their transition game"]
- [Factor 3: e.g., "Heavy wind favors Pair A (Wind Warrior badge)"]

UPSET WATCH: [If lower-ranked pair has 30%+ win probability, flag upset potential and explain why]
```

---

## 8. GOVERNANCE

- Simulation consumes only Partnership KR and Squad KR. It never modifies upstream.
- Weather modifiers are additive to Effective KR, never multiplicative.
- Fatigue is cumulative across a tournament day.
- Momentum modifier is capped at +/-0.5 per set.
- Third set uses a higher k value (0.085) to reflect the higher variance of short sets.
- All outputs must include confidence % reflecting data quality of the pair evaluations.
- Dual match simulation treats each pair match as independent (no cross-match momentum in the model).
- Tournament simulation must carry fatigue forward across rounds.
