# MEN'S GOLF SIMULATION ENGINE
## File 04 - v1.0

---

# TOURNAMENT SIMULATION

## 0. Scope
This is the single authoritative document for Men's Golf tournament simulation. It defines how Nexus projects tournament outcomes for individual golfers and teams based on Player KR, course characteristics, weather conditions, and competitive format.

The Simulation Engine does NOT evaluate players. It consumes finalized KRs and component KRs from upstream and projects outcomes.

---

## 1. Inputs (Non-Negotiable)

### Per Player
- Final Player KR
- Component KRs (BKR, SKR, CKR, MKR, AKR)
- Archetype
- Season scoring average (adjusted)
- Round-to-round standard deviation
- Course-type performance splits (if available)

### Per Tournament
- Course name and location
- Course rating and slope
- Par
- Total yardage
- Course type classification (from Team Intelligence Course Type Categories)
- Number of rounds (36, 54, or 72 holes)
- Competitive format (stroke play, match play, or team + individual)
- Field size and field strength (average KR of the field, if computable)
- Cut rules (if applicable)

### Per Conditions (if known)
- Wind speed and direction forecast
- Temperature range
- Precipitation probability
- Altitude
- Green speed (stimpmeter if available)
- Rough height / firmness

---

## 2. Course-Player Fit Model

### Step 1: Course Profile Classification
Classify the course into one of the 6 course types (from File 03):
- Long and Open
- Tight and Tree-Lined
- Links-Style
- Short and Demanding
- Resort/Tropical
- Mountain/Altitude

If the course does not fit cleanly into one type, assign primary (70% weight) and secondary (30% weight) types.

### Step 2: Archetype-Course Interaction Matrix

| Archetype | Long/Open | Tight/Trees | Links | Short/Demanding | Resort/Tropical | Mountain |
|-----------|----------|-------------|-------|----------------|----------------|----------|
| Bomber | +3.0 | -2.0 | +0.5 | -2.5 | +0.5 | +1.0 |
| Precision Player | -1.0 | +3.0 | +1.0 | +1.5 | +0.5 | +1.0 |
| Short Game Wizard | -0.5 | +0.5 | +2.0 | +3.0 | +1.0 | +0.5 |
| Complete Player | +1.0 | +1.0 | +1.5 | +1.0 | +1.5 | +1.0 |
| Grinder | -1.0 | +1.5 | +2.5 | +1.0 | +0.5 | +1.5 |

Values represent expected scoring adjustment (strokes per round) relative to the player's average. Positive = better than average (fewer strokes). Negative = worse than average.

### Step 3: Component KR Course Demands

Each course type emphasizes different component KRs. The Course Demand Profile determines which component KRs matter most.

| Course Type | BKR Weight | SKR Weight | CKR Weight | MKR Weight | AKR Weight |
|-------------|-----------|-----------|-----------|-----------|-----------|
| Long and Open | 45% | 20% | 15% | 12% | 8% |
| Tight and Tree-Lined | 30% | 25% | 25% | 12% | 8% |
| Links-Style | 25% | 30% | 20% | 18% | 7% |
| Short and Demanding | 25% | 40% | 18% | 12% | 5% |
| Resort/Tropical | 30% | 28% | 18% | 14% | 10% |
| Mountain/Altitude | 30% | 25% | 25% | 12% | 8% |

### Step 4: Course-Adjusted KR

**Course KR = Sum of (Component KR_i * Course Demand Weight_i)**

This is the player's projected KR for this specific course type. It differs from their Overall KR because the weighting shifts.

### Step 5: Course-Player Fit Score

**Fit Score = Course KR / Overall KR * 100**

- Fit > 105: Strong course fit (player is significantly better suited to this course than their overall KR suggests)
- Fit 98-105: Neutral fit
- Fit 90-97: Slight disadvantage
- Fit < 90: Poor course fit

---

## 3. Weather Impact Model

### Wind Impact

| Wind Speed | Scoring Impact (strokes/round) | Primary Effect |
|-----------|-------------------------------|----------------|
| 0-5 mph (Calm) | 0 | No meaningful impact |
| 5-10 mph (Light) | +0.2 to +0.5 | Minor distance/direction variance |
| 10-15 mph (Moderate) | +0.5 to +1.0 | Noticeable distance control issues, shot shaping required |
| 15-20 mph (Strong) | +1.0 to +2.0 | Significant scoring impact, short game premium rises |
| 20-25 mph (Very Strong) | +2.0 to +3.5 | Major scoring impact, survival mode, big numbers increase |
| 25+ mph (Extreme) | +3.5 to +5.0+ | Course nearly unplayable, scores balloon, MKR dominant |

**Wind Resistance Traits:**
- Shot shaping ability (from BKR traits) reduces wind penalty by up to 30%
- Course Management KR reduces wind penalty by up to 20%
- Mental KR reduces wind penalty by up to 15%
- Bomber archetype is most penalized in wind (distance advantage diminished)
- Grinder archetype is least penalized (already manages conditions)

### Temperature Impact

| Temp Range | Scoring Impact | Primary Effect |
|-----------|---------------|----------------|
| Below 45F | +0.5 to +1.5 | Reduced ball flight, stiff muscles, grip issues |
| 45-60F | +0.2 to +0.5 | Mild cold, minimal impact on skilled players |
| 60-85F | 0 | Optimal range |
| 85-95F | +0.2 to +0.5 | Heat fatigue, especially in later rounds |
| Above 95F | +0.5 to +1.5 | Significant fatigue, concentration lapses, endurance tested |

**Endurance trait (AKR) reduces heat penalty by up to 40%.**

### Rain Impact

| Condition | Scoring Impact | Primary Effect |
|----------|---------------|----------------|
| Light rain / drizzle | +0.3 to +0.7 | Wet grips, reduced spin, softer greens (can help approach play) |
| Steady rain | +0.7 to +1.5 | Significant scoring impact, distance loss, putting difficulty |
| Heavy rain / downpour | +1.5 to +3.0 | Severe impact, casual water, rounds may be suspended |

**Short Game KR and Scrambling traits are premium in rain (wet conditions around greens require touch).**

### Altitude Impact

| Altitude | Distance Effect | Scoring Impact |
|----------|----------------|----------------|
| Sea level | Baseline | 0 |
| 2,000-4,000 ft | +3-5% distance | -0.2 to -0.5 (slightly easier - more distance) |
| 4,000-6,000 ft | +5-10% distance | -0.3 to -0.7 (distance helps, but distance control harder) |
| 6,000+ ft | +10-15% distance | Variable (distance gain offset by wind and unpredictable ball flight) |

**Course Management KR is premium at altitude (club selection and distance control become critical).**

---

## 4. Scoring Distribution Model

### Individual Round Scoring Projection

For each player, project a scoring distribution for each round:

**Expected Score = Course Rating + (Player Adjusted Scoring Avg - Par) / Lambda + Archetype-Course Adjustment + Weather Adjustment**

**Standard Deviation = Player Round-to-Round StdDev * (1 + Weather Variance Modifier)**

The scoring distribution is approximately normal with slight right skew (blow-up rounds are more likely than miracle rounds).

### Tournament Scoring Projection (Stroke Play)

For a multi-round event:
1. Simulate each round independently using the scoring distribution
2. Sum round scores for total tournament score
3. For each player, generate:
   - Expected total score
   - 90% confidence interval
   - Probability of top-5, top-10, top-20 finish
   - Win probability
   - Cut probability (if applicable)

### Team Scoring Projection

For team events:
1. Simulate each player's round independently
2. For each simulated round, take best 4 of 5 scores
3. Sum team scores across rounds
4. Generate team-level outputs:
   - Expected team total
   - Win probability
   - Top-3 probability
   - Expected team placement range

---

## 5. Match Play Simulation

### Match Play Format
Match play is hole-by-hole competition. Each hole is won, lost, or halved. The match ends when one player is up by more holes than remain.

### Match Play KR Adjustment
Match play rewards different skills than stroke play:
- **MKR weight increases by 30%** (mental toughness is paramount in hole-by-hole format)
- **CKR weight increases by 20%** (strategic decisions - when to attack, when to play safe - are magnified)
- **Big Number Avoidance is less important** (you can only lose one hole regardless of score)
- **Birdie Conversion is more important** (winning holes requires birdies, not just pars)

### Match Play Win Probability

**Win Probability = logistic(Match Play Adjusted KR_A - Match Play Adjusted KR_B)**

Where Match Play Adjusted KR uses the modified weights above.

For every 3 KR points of advantage: approximately 60% win probability.
For every 6 KR points: approximately 70%.
For every 10 KR points: approximately 80%.

Match play has higher variance than stroke play. Upsets are more common. A 5-point KR underdog wins approximately 35-40% of matches.

---

## 6. Field Strength Adjustment

### Concept
A golfer's tournament performance must be interpreted relative to the field they compete against. Beating a field of KR 85+ players is more impressive than beating KR 75 players.

### Field KR Computation
**Field Average KR = Mean KR of all players in the tournament field**

If individual KRs are unavailable, estimate from:
- Tournament prestige level (major, regular tour, mini-tour)
- Historical field strength data
- Qualifying criteria for the event

### Adjusted Finish Value
A golfer's finish position is weighted by field strength:
**Adjusted Finish Value = Raw Finish Position * (90 / Field Average KR)**

This means a 10th place finish in a Field KR 92 event is more valuable than 10th in a Field KR 78 event.

---

## 7. Simulation Output Format

### Individual Golfer Projection
```
Player: [Name]
Overall KR: [X] | Course KR: [Y] | Course Fit: [Z]%
Expected Scoring: [total] ([per round avg])
Win Probability: X%
Top-5: X% | Top-10: X% | Top-20: X%
Make Cut: X%
Key Advantage: [trait/archetype fit description]
Key Risk: [vulnerability description]
```

### Team Projection
```
Team: [School]
Team KR: [X] | Team Course KR: [Y]
Expected Team Total: [score] ([per round avg])
Win Probability: X%
Top-3: X%
Counting Players Projected: [4 names with expected individual scores]
5th Player Insurance: [name, expected score, drop probability per round]
```

---

## 8. Multi-Tournament Season Simulation

### Purpose
Project full-season outcomes based on tournament schedule, course types, and roster strength.

### Inputs
- Full tournament schedule with course types and expected conditions
- Roster with all player KRs
- Conference and NCAA championship venue information

### Outputs
- Projected season team scoring average
- Projected conference finish range
- NCAA Regional qualification probability
- NCAA Championship qualification probability
- Individual player season projections
