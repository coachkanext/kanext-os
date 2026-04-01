# WOMEN'S GOLF SIMULATION ENGINE
## v1.0 - Women's Golf Intelligence

---

# COURSE PROFILE LIBRARY

## Purpose
Every golf course has a personality. Course profiles capture the characteristics that determine which players are favored and which are disadvantaged. The simulation engine matches player archetypes and component KRs against course demands to project performance.

## Course Profile Template

```
COURSE PROFILE
---
Course Name:
Location:
Par:
Yardage (Women's tees):
Course Rating / Slope:
Grass Type (Fairways):
Grass Type (Greens):
Elevation:
Typical Wind:
Water Hazards (frequency):
Bunker Count:
Green Size (avg sqft):
Green Speed (avg stimp):
Fairway Width (avg yards):
Rough Severity:
Signature Holes:
Tournament History:

COURSE DEMAND PROFILE:
BKR Demand: [1-10]
SKR Demand: [1-10]
CKR Demand: [1-10]
MKR Demand: [1-10]
AKR Demand: [1-10]

FAVORED ARCHETYPES: [list]
DISADVANTAGED ARCHETYPES: [list]
```

## Course Demand Scoring (1-10 Scale)

### BKR Demand (Ball-Striking)
- **9-10:** Long course (6,300+ yards women's tees), tight fairways, small greens. Must hit fairways and greens to score. Examples: Pine Needles, Baltusrol.
- **7-8:** Moderate length (6,000-6,299 yards), requires accuracy. Standard championship setup.
- **5-6:** Average demands. Mix of holes requiring distance and precision.
- **3-4:** Short course or wide fairways. Ball-striking less critical. Short game and putting more important.
- **1-2:** Extremely short or easy course setup. Ball-striking barely differentiates players.

### SKR Demand (Short Game)
- **9-10:** Firm, fast greens with severe slopes. Missing greens leaves difficult up-and-downs. Bunkers are deep and penal. Examples: Pinehurst No. 2, Augusta National (women's tournament).
- **7-8:** Challenging green complexes. Good short game required to save par.
- **5-6:** Average short game demands.
- **3-4:** Forgiving around the greens. Wide collection areas, simple bunkers.
- **1-2:** Very forgiving. Flat greens, minimal bunkering.

### CKR Demand (Course Management)
- **9-10:** Strategic course requiring constant decision-making. Multiple risk/reward options per hole. Penalty for wrong decisions is severe. Examples: links courses in wind, tree-lined courses with doglegs.
- **7-8:** Requires good strategy on most holes. Some risk/reward decisions.
- **5-6:** Standard course management demands.
- **3-4:** Straightforward course. Mostly "aim and fire."
- **1-2:** Very simple layout. Minimal strategic decisions.

### MKR Demand (Mental)
- **9-10:** Extremely difficult conditions (30+ mph wind, extreme heat/cold, rain). Or: high-stakes event where pressure is the primary differentiator (NCAA Championship, LPGA major).
- **7-8:** Challenging conditions or high-stakes event. Mental toughness matters.
- **5-6:** Standard competitive conditions.
- **3-4:** Benign conditions. Low pressure.
- **1-2:** Practice-round conditions. Minimal mental demand.

### AKR Demand (Athletic/Physical)
- **9-10:** Walking-only event on hilly terrain in extreme weather. 36 holes in a day (some events). Physical endurance is a differentiator.
- **7-8:** Hilly course, demanding walking. Multi-day event in challenging climate.
- **5-6:** Standard physical demands.
- **3-4:** Flat course, good conditions.
- **1-2:** Minimal physical demands (cart-allowed, flat, mild weather).

---

# PLAYER-COURSE FIT ENGINE

## Purpose
Calculates how well a player's component KR profile matches a specific course's demand profile. Higher fit = better projected performance.

## Fit Calculation

**Player-Course Fit% = Sum of (Component KR x Course Demand Weight) / Sum of (100 x Course Demand Weight)**

Where Course Demand Weight for each component = Course Demand Score / Sum of all Course Demand Scores.

**Example:**
Course: BKR demand 8, SKR demand 6, CKR demand 7, MKR demand 5, AKR demand 4 (total = 30)
Player: BKR 88, SKR 80, CKR 85, MKR 78, AKR 72

Fit% = [(88 x 8/30) + (80 x 6/30) + (85 x 7/30) + (78 x 5/30) + (72 x 4/30)] / 100
     = [23.5 + 16.0 + 19.8 + 13.0 + 9.6] / 100
     = 81.9 / 100
     = 81.9%

## Fit% Interpretation

| Fit% | Interpretation |
|------|---------------|
| 90%+ | Elite course fit. Player's strengths align perfectly with course demands. Expect performance above KR baseline. |
| 80-89% | Good fit. No significant mismatches. Expect performance at or near KR baseline. |
| 70-79% | Moderate fit. Some mismatches between player strengths and course demands. Performance may be slightly below KR baseline. |
| 60-69% | Poor fit. Significant mismatches. Expect performance below KR baseline. |
| Below 60% | Very poor fit. Course exposes player's weaknesses directly. Expect significant underperformance. |

---

# TOURNAMENT SIMULATION ENGINE

## Stroke Play Simulation (Standard)

### Inputs
1. Tournament field (all players with KRs and component KRs)
2. Course profile (demand scores)
3. Number of rounds (typically 3 for college, 4 for pro)
4. Conditions (weather, course setup severity)

### Simulation Steps

**Step 1: Baseline Scoring Projection**
For each player, project a baseline scoring average for this course:
- Start with season scoring average
- Adjust by Player-Course Fit%: Fit% above 85% reduces projected scoring by 0.5-1.5 strokes. Fit% below 70% increases projected scoring by 0.5-2.0 strokes.
- Adjust by current form (last 3 tournaments trend): Hot streak -0.5 to -1.0 strokes. Cold streak +0.5 to +1.0 strokes.

**Step 2: Conditions Adjustment**
- Wind: Every 5 mph of sustained wind above 10 mph adds approximately 0.3-0.5 strokes to projected scoring. Players with high MKR (wind play) are penalized less.
- Rain: Light rain adds 0.5-1.0 strokes. Heavy rain adds 1.5-3.0 strokes. All players affected but high-MKR players affected less.
- Temperature: Extreme heat (95+F) adds 0.3-0.5 strokes (fatigue). Extreme cold (below 45F) adds 0.5-1.0 strokes (reduced flexibility, ball flight changes).
- Altitude: High altitude (5,000+ feet) reduces effective yardage by 5-10%. Benefits long hitters.

**Step 3: Round-by-Round Variance**
Golf has inherent variance. Even the best players have bad rounds. Simulate variance:
- Each round's score = Projected baseline + random variance drawn from a normal distribution
- Variance (StdDev) = Player's MKR-adjusted scoring variance
  - MKR 90+: StdDev = 2.0 strokes (very consistent)
  - MKR 75-89: StdDev = 2.8 strokes (moderately consistent)
  - MKR 60-74: StdDev = 3.5 strokes (average variance)
  - MKR below 60: StdDev = 4.5 strokes (volatile)

**Step 4: Cut Line Simulation (if applicable)**
For events with a cut:
- Project cut line based on field strength and course difficulty
- Eliminate players projected above the cut
- Continue simulation for remaining rounds with surviving field

**Step 5: Final Standings**
- Sum projected round scores for each player
- Rank by total score (lowest wins)
- Output projected finish position, total score, scoring average for the event

### Output

```
TOURNAMENT PROJECTION
Event: [name]
Course: [name], Par [XX], [XXXX] yards
Conditions: [description]
Field Size: [XX]

PROJECTED TOP 10:
1. [Player] - [Total Score] ([Scoring Avg]) - Fit: XX%
2. [Player] - [Total Score] ([Scoring Avg]) - Fit: XX%
...

WIN PROBABILITY:
[Player 1]: XX%
[Player 2]: XX%
[Player 3]: XX%

TEAM PROJECTIONS (if team event):
1. [Team] - [Total Score] (Best 4 of 5: [scores])
2. [Team] - [Total Score]
...
```

## Match Play Simulation

### Differences from Stroke Play
- Match play is hole-by-hole, not cumulative score
- Mental game (MKR) is MORE important in match play
- Course management (CKR) is MORE important (aggressive vs conservative strategy decisions)
- Variance per hole is higher because players take more risks

### Match Play Adjustments
1. MKR weight increases by 30% relative to stroke play
2. CKR weight increases by 15%
3. BKR weight decreases by 10% (distance is less decisive when playing to beat one opponent)
4. Simulate hole-by-hole: each hole has a winner, loser, or halve based on projected scoring plus variance
5. Match ends when one player is ahead by more holes than remain (e.g., 3&2)

### Match Play Win Probability
Based on KR differential adjusted for course fit:
- KR difference of 5+ points: Favored player wins ~70-75% of matches
- KR difference of 3-4 points: ~62-68%
- KR difference of 1-2 points: ~54-58%
- Equal KR: ~50% (true toss-up)
- MKR advantage adds 3-5% to the higher-MKR player independent of KR gap

---

# WEATHER AND CONDITIONS MODIFIERS

## Wind Impact Matrix

| Wind Speed | Scoring Impact | Player Type Most Affected |
|-----------|---------------|--------------------------|
| Calm (0-5 mph) | Neutral | None - benign conditions |
| Light (6-10 mph) | +0.2 strokes avg | High-ball-flight players slightly affected |
| Moderate (11-18 mph) | +0.5-1.0 strokes avg | Power Bombers most affected (high ball flight, less control) |
| Strong (19-25 mph) | +1.5-2.5 strokes avg | All players affected. Wind Players and Course Grinders least affected. |
| Extreme (26+ mph) | +3.0-5.0 strokes avg | Separates elite from average. Wind badge holders gain significant advantage. |

## Rain Impact

| Rain Level | Scoring Impact | Key Effects |
|-----------|---------------|-------------|
| Light drizzle | +0.3-0.5 strokes | Wet grips, slightly reduced distance |
| Steady rain | +1.0-1.5 strokes | Reduced distance, difficult greenside conditions, mental fatigue |
| Heavy rain | +2.0-3.5 strokes | Standing water, relief situations, course management critical |
| Rain delay + restart | +0.5-1.0 additional | Rhythm disruption. High-MKR players handle better. |

## Course Setup Severity

| Setup Level | Description | Impact |
|-------------|-------------|--------|
| Easy | Wide fairways, accessible pins, soft greens, minimal rough | -1.0 to -2.0 strokes vs standard |
| Standard | Normal competitive setup | Baseline |
| Championship | Narrow fairways, tucked pins, firm greens, heavy rough | +1.0 to +2.0 strokes vs standard |
| Major (LPGA) | US Women's Open-style: extreme rough, firm/fast greens, demanding course | +2.0 to +4.0 strokes vs standard |

---

# HEAD-TO-HEAD PROJECTION

## Purpose
Projects the outcome of a direct comparison between two players at a specific course, regardless of the rest of the field. Useful for match play previews, recruiting comparisons, and roster decisions.

## Calculation

1. Calculate Player-Course Fit% for both players
2. Adjust KR by fit differential: If Player A has 85% fit and Player B has 72% fit, Player A gains a 1-2 KR point advantage at this course
3. Apply current form adjustment
4. Apply conditions modifiers (if known)
5. Output: Projected scoring differential, win probability for each player

## Output Format

```
HEAD-TO-HEAD PROJECTION
[Player A] vs [Player B]
Course: [name]
Conditions: [description]

Player A: KR [XX.X] | Fit [XX%] | Form [trend]
Player B: KR [XX.X] | Fit [XX%] | Form [trend]

Projected Scoring Differential: Player A by [X.X] strokes
Win Probability: Player A [XX%] | Player B [XX%]
Key Advantage: [which component KR difference is most decisive at this course]
```

---

# GOVERNANCE

- Simulation outputs are projections, not predictions. Confidence ranges must always be stated.
- Simulations consume player KRs and course profiles. They never modify KRs.
- Course profiles are living documents updated as course conditions change (renovations, new tees, etc.).
- Weather data should be current (within 24 hours) for in-tournament simulations.
- All simulation parameters are deterministic given the same inputs: same KRs + same course + same conditions = same output.
