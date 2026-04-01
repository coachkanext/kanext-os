# MEN'S GOLF SCOUTING AND TOURNAMENT OPS
## File 05 - v1.0

---

# SCOUTING CONFIDENCE GATES

## Purpose
Confidence % communicates evidence completeness and reliability for course scouting and tournament preparation. Computed at the end of the respective packet. Does not change any scouting content or KR values - it qualifies reliability only.

## Scout Confidence Gate (Pre-Tournament)

| Data Available | Scout Confidence % |
|---------------|-------------------|
| Course name and par only, no player history at course | 40-50% |
| Course rating/slope + general course type classification | 50-60% |
| Course rating/slope + detailed hole-by-hole data (yardage, par, hazards) | 60-70% |
| Above + player history at this course (prior rounds) | 70-80% |
| Above + practice round data (current conditions, green speeds, pin tendencies) | 78-88% |
| Above + ShotLink/Arccos data from prior events at this course | 85-92% |
| Full multi-year course data + practice round + conditions report + player-specific course history | 90-96% |

## Scout Confidence Adjusters
- First time at this course for the team: downshift 5-10 pts
- Course recently renovated or redesigned: downshift 5-8 pts
- Weather forecast unstable (conditions may change significantly): downshift 3-5 pts
- Team has played this course in the last 12 months: upshift 5-8 pts
- Head coach personally knows the course: upshift 3-5 pts
- Practice round completed with conditions data: upshift 5-8 pts

---

# COURSE SCOUTING PROTOCOL

## 4-Phase Tournament Operations Flow

### PHASE 1: PRE-TOURNAMENT COURSE SCOUT (7-14 Days Before)

#### 1.1 Course Profile Build

**Required data (minimum for scouting to proceed):**
- Course name, location, elevation
- Total yardage, par, course rating, slope rating
- Number of holes, layout (out-and-back, links, loop, etc.)
- Green type (bent, bermuda, poa annua, etc.)
- Course type classification (per File 03 categories)

**Desired data (improves confidence):**
- Hole-by-hole yardage and par
- Key hazards per hole (water, bunkers, OB, forced carries)
- Green sizes and contour tendencies
- Prevailing wind direction
- Typical setup difficulty (how the course plays for events vs everyday)
- Historical tournament scoring averages at this venue
- Altitude

#### 1.2 Hole-by-Hole Strategic Analysis

For each hole, identify:

**Tee shot strategy:**
- Optimal landing area (distance and direction)
- Bail-out zone (safe miss)
- Danger zone (penalty, hazard, blocked angle)
- Club recommendation by player archetype:
  - Bomber: driver to optimal landing, carry the hazard
  - Precision Player: 3-wood or hybrid to widest part of fairway
  - Others: situational based on hole layout

**Approach strategy:**
- Green access angles from fairway vs rough
- Pin placement tendencies (front, middle, back, tucked)
- Miss side (where to miss the green for easiest recovery)
- Lay-up zones for par-5s (distance to leave a comfortable wedge)

**Short game notes:**
- Green speed and slope tendencies
- Bunker difficulty (depth, sand type, lip height)
- Chipping areas around green (tight lies, rough, uphill/downhill)
- Putting break tendencies (grain, mountain influence, drainage)

#### 1.3 Scoring Strategy by Hole Type

Classify each hole:
- **Birdie hole** - reachable par-5, driveable par-4, short par-3 with accessible pin. Attack.
- **Par hole** - standard par-4, demanding par-3. Play for the center of the green, take par happily.
- **Survival hole** - long par-4 into wind, par-3 over water with tucked pin, narrow driving hole. Avoid bogey at all costs.

Target scoring plan: birdie holes (-0.3 to -0.5 avg), par holes (0 to +0.1 avg), survival holes (+0.1 to +0.3 avg).

#### 1.4 Course-Player Fit Assessment

For each player in the tournament lineup:
1. Run Course-Player Fit from Simulation Engine (File 04)
2. Identify specific holes where the player has an advantage or disadvantage
3. Create player-specific strategic notes for 3-5 key holes

---

### PHASE 2: PRACTICE ROUND INTELLIGENCE (1-2 Days Before)

#### 2.1 Practice Round Priorities

The practice round is the most valuable scouting opportunity. Priorities in order:

1. **Green speed and break confirmation** - putt from multiple angles on every green. Note break direction, speed, and grain influence. This is the highest-priority data because green reads cannot be obtained any other way.

2. **Wind pattern observation** - note wind direction and strength at different holes. Courses in valleys or near water may have different wind patterns on different parts of the course.

3. **Yardage verification** - walk off distances to hazards, layup zones, and pin positions. Sprinkler head yardages are not always accurate.

4. **Trouble spot identification** - find the spots where big numbers happen. Deep bunkers, blind shots, hidden hazards, heavy rough patches.

5. **Tee shot landing area confirmation** - verify that the planned landing areas are actually optimal given current conditions (rough height, firmness, roll-out).

#### 2.2 Practice Round Data Collection Template

For each hole during the practice round:

```
Hole: [#] | Par: [X] | Yardage: [X]
Tee Shot: [club recommendation] to [target] | Danger: [avoid zone]
Approach: [expected distance in] | Green: [speed/break notes]
Pin Likely: [front/middle/back/tucked] | Miss To: [side]
Bunker Quality: [easy/medium/hard recovery]
Wind: [direction and strength at this hole]
Strategy: [BIRDIE / PAR / SURVIVAL]
Notes: [anything unusual or important]
```

#### 2.3 Conditions Report

After the practice round, compile:
- Green speed (stimpmeter equivalent estimate: slow/medium/fast/tour-fast)
- Rough height and thickness
- Fairway firmness (soft/medium/firm)
- Bunker sand quality (heavy/medium/fluffy)
- Wind forecast for competition days
- Temperature range expected
- Precipitation likelihood

---

### PHASE 3: LIVE TOURNAMENT OPERATIONS (Competition Days)

#### 3.1 Pre-Round Briefing

Before each round:
1. **Pin sheet analysis** - review actual pin positions for the day
2. **Adjusted strategy** - modify hole-by-hole strategy based on pin positions
   - Accessible pins: attack (aim at pin)
   - Tucked/difficult pins: play to safe side of green, take two-putt par
   - Sucker pins (close to hazard): play away from pin, do not chase
3. **Weather update** - adjust for actual conditions vs forecast
4. **Player mental state** - note standings, what score is needed, competitive context

#### 3.2 On-Course Communication (if permitted by rules)

In college golf, coaches may communicate with players during rounds. Strategic communication framework:

**First 6 holes (Opening):**
- Reinforce pre-round strategy
- Encourage patience
- If player is struggling: simplify strategy, play for centers of greens, make pars
- If player is hot: do not change anything, stay out of the way

**Holes 7-12 (Middle):**
- Assess scoring situation relative to team needs
- If team needs birdies: identify remaining birdie holes and encourage aggression
- If team is in good position: encourage par-making and bogey avoidance
- Relay information about other teams' scoring if strategically relevant

**Holes 13-18 (Closing):**
- Specific situational strategy based on team standing
- If counting score is critical: conservative play on survival holes, aggressive on birdie holes
- If player is likely the dropped score: let them play freely (no team pressure)
- If match is close: focus on one shot at a time, avoid scoreboard watching

#### 3.3 Team Scoring Monitoring

Track in real time:
- Each player's running score
- Which player is the current "drop" (5th score)
- Projected team total based on current pace
- Competitor team totals and projections
- Whether the lineup needs to shift strategy (more aggressive or conservative)

---

### PHASE 4: POST-TOURNAMENT ANALYSIS

#### 4.1 Individual Player Debrief Data

For each player:
- Final score per round and total
- Strokes gained breakdown (if available): off the tee, approach, around the green, putting
- Key holes (best and worst scoring holes)
- Round-by-round consistency analysis
- Comparison to pre-tournament projection (outperformed/underperformed expectations)
- Strategy adherence: did the player follow the plan? Where did they deviate?

#### 4.2 Team Debrief Data

- Final team score and placement
- Which players counted in each round
- Depth contribution (did the 5th player's insurance matter?)
- Team scoring profile for this event (birdie rate, bogey avoidance, scrambling)
- Comparison to pre-tournament team projection

#### 4.3 Course Knowledge Update

After the tournament, update the course scouting file:
- Actual scoring data by hole (birdie/par/bogey rates)
- Green speed and condition notes
- Pin placement patterns observed
- Wind pattern confirmation
- Strategy adjustments for next visit to this course
- Any course changes since last visit (new tees, bunker renovations, etc.)

#### 4.4 KR Impact Assessment

Note: this does NOT change Player KR or Team KR (those are upstream). This assesses whether the tournament result was consistent with the player's KR or suggests the KR may need re-evaluation in the next cycle.

- Player outperformed KR projection significantly (3+ strokes better than expected over tournament): flag for potential KR increase at next evaluation
- Player underperformed KR projection significantly: check for suppression factors (injury, weather vulnerability, course type mismatch)
- Consistent with projection: KR validated

---

# PIN POSITION STRATEGY FRAMEWORK

## Pin Position Categories

| Category | Description | Strategy |
|----------|-------------|----------|
| Accessible | Center of green or easy section, no nearby hazard | Attack. Aim at pin. Birdie opportunity. |
| Moderate | Off-center but reachable, some risk | Play to safe quadrant of green, allow for two-putt |
| Tucked | Close to edge, bunker, or slope | Play to center or safe side. Do not chase pin. |
| Sucker | Appears accessible but punishes misses severely (e.g., front pin behind a bunker) | Play well past the pin to safe zone. Accept long putt. |
| Sunday | Extreme location designed to test nerve (back edge, tight to water) | Play to widest part of green. Two-putt par is a win. |

## Pin Response by Archetype

| Archetype | Accessible | Moderate | Tucked | Sucker | Sunday |
|-----------|-----------|----------|--------|--------|--------|
| Bomber | Attack | Attack | Play safe quadrant | Play safe | Play safe |
| Precision Player | Attack | Attack | Can attack (accuracy advantage) | Play safe | Play safe |
| Short Game Wizard | Attack | Attack | Play safe (recovery available) | Play safe | Play safe (recovery is the plan) |
| Complete Player | Attack | Attack | Situational | Play safe | Play safe |
| Grinder | Play for center | Play for center | Play safe | Play safe | Play safe |
