# MEN'S TRACK AND FIELD - SIMULATION ENGINE v1

---

## 0. Purpose

The Simulation Engine projects meet outcomes by event and aggregates them into team scoring predictions. Unlike team sport simulation where players interact (offense vs defense), track and field simulation projects individual performances against a field and sums team points.

The engine answers:
1. What is the projected score for a dual meet, conference meet, or national championship?
2. Which events will we score in and where?
3. What event entry decisions maximize team scoring?
4. Where are we most likely to be upset or to pull an upset?
5. What marks do our athletes need to hit for the team to win?

---

## 1. SIMULATION INPUTS

### 1.1 Required Inputs

**Team Roster (both/all teams in meet):**
- Each athlete's primary and secondary event(s)
- Current season best (SB) and PR for each event
- KR for each athlete
- Component KRs (especially CKR for championship simulation)
- Event entry assignments (who is entered in what)
- Relay team compositions

**Meet Format:**
- Meet type: dual, triangular, conference championship, invitational, regional, national
- Scoring system: 5-3-1, 10-8-6-5-4-3-2-1, or custom
- Number of scoring places
- Number of entries per team per event (typically 3 for dual meets, varies for championships)
- Relay scoring rules
- Whether multi-event (decathlon) is included and scored separately or combined

**Conditions (if known):**
- Venue altitude
- Expected wind conditions
- Track surface (synthetic type, banked/flat for indoor)
- Temperature range

### 1.2 Optional Inputs

- Historical head-to-head results at this venue
- Season performance trends (improving vs plateaued)
- Injury/availability status
- Time-of-day scheduling (field events start times, running event order)

---

## 2. EVENT-BY-EVENT SIMULATION

### 2.1 Running Event Simulation

**Performance Projection:**
For each athlete in each running event:
1. Take their current SB as the base projection
2. Adjust for meet type: championship meets tend to produce faster times (CKR informs adjustment)
   - Regular season meet: project at SB
   - Conference championship: project at SB x 0.998 (slight improvement for peak)
   - Regional/National: project at SB x 0.996 (further peak for biggest meet)
3. Apply conditions adjustment (headwind/tailwind, altitude, temperature)
4. Generate performance band: projected mark +/- standard deviation from season results

**Placement Projection:**
1. Rank all athletes in the event by projected performance
2. Assign places
3. Calculate points based on scoring system
4. Note confidence level: if projected marks are close (within 0.5% in sprints, 1% in distance), the placement is volatile

### 2.2 Field Event Simulation

**Performance Projection:**
For each athlete in each field event:
1. Take current SB as base projection
2. Adjust for meet type (same championship peaking factors)
3. Generate performance band using season consistency (standard deviation)

**Jump Event Specifics:**
- High Jump and Pole Vault: simulate bar-by-bar progression
  - Opening height based on athlete's typical opener
  - Success rate at each height based on season data
  - Miss and pass strategy
- Long Jump and Triple Jump: simulate 6-attempt series
  - Best mark projection based on SB and consistency
  - Foul rate from season data
  - Wind adjustment if applicable

**Throw Event Specifics:**
- Simulate 6-throw series (3 trials + 3 finals for top-8 format at championships)
- Best mark projection
- Foul rate
- Series improvement pattern (some throwers improve through rounds, others peak early)

### 2.3 Relay Simulation

**4x100m:**
1. Sum projected individual 100m times for relay members
2. Subtract 2.5-3.5s for running starts on legs 2-4 (faster than individual starts)
3. Add exchange time factor: elite team = +0.0-0.2s per exchange, average team = +0.2-0.5s per exchange
4. Total projected relay time = sum - running start bonus + exchange factor
5. DQ risk: estimate based on team's exchange reliability (DQ rate from season)

**4x400m:**
1. Sum projected individual 400m times (or open 400m equivalents for non-400m specialists)
2. Subtract 2.0-4.0s for running starts on legs 2-4
3. Fatigue adjustment for athletes who doubled in individual 400m earlier in meet
4. Total projected relay time = sum - running start bonus + fatigue factor

### 2.4 Decathlon Simulation

1. Project each of the 10 individual event performances
2. Convert to World Athletics scoring table points
3. Sum total points
4. Compare against competition
5. Note: decathlon takes place over 2 days; fatigue and conditions across days introduce additional variance

---

## 3. MEET-LEVEL AGGREGATION

### 3.1 Dual Meet Simulation

**Format:** Two teams competing head-to-head. Typical scoring: 5-3-1 for individual events, 5-0 for relays. 3 entries per team per event.

**Simulation steps:**
1. Simulate every event using protocol above
2. Sum team points
3. Report score with confidence range

**Dual meet considerations:**
- Event entries matter enormously - strategic entries can swing close meets
- A coach may choose to "sacrifice" an event (enter weaker athletes) to stack entries in another event
- Relay scoring is binary (5 or 0 for most dual meets) - relay outcomes can decide close meets

### 3.2 Conference Championship Simulation

**Format:** All conference teams competing. Scoring typically 10-8-6-5-4-3-2-1 for top 8.

**Simulation steps:**
1. Compile all conference athletes and their SBs/PRs
2. Simulate every event with full conference field
3. Assign places and points
4. Sum team totals
5. Report projected team standings with confidence intervals

**Conference championship considerations:**
- More athletes in each event = more volatile placements
- Relay scoring is higher value (same 10-8-6-5-4-3-2-1)
- Multi-event entries create scheduling conflicts
- Day-1 vs Day-2 event scheduling affects athlete recovery

### 3.3 Regional/National Simulation

**Regional:**
- Qualification format - project which athletes advance
- No team scoring at regionals

**National Championship:**
1. Compile national field (all qualifiers)
2. Simulate each event
3. Sum projected team points
4. Report projected team standings

**National championship considerations:**
- Only qualified athletes compete (field is pre-filtered by standards)
- Rounds: prelims and finals for running events (marks in finals determine points)
- Some athletes improve significantly from prelims to finals (CKR input)
- Home-track advantage (altitude, surface familiarity) is minimal at nationals but present

---

## 4. SCENARIO ANALYSIS

### 4.1 Entry Optimization Scenarios

"What if we enter Athlete A in the 200m instead of the LJ?"
- Re-simulate both events with the change
- Compare total team points in both scenarios
- Report the point differential

### 4.2 PR Scenario

"What if Athlete A hits their PR at conference?"
- Substitute PR for SB in that event
- Re-simulate and report projected team impact
- Useful for identifying which athletes' breakthroughs would most impact team outcomes

### 4.3 Weather Scenario

"What if there's a 3.0 m/s headwind at conference?"
- Apply headwind adjustments to all sprint and jump events
- Re-simulate affected events
- Report impact on team scoring

### 4.4 Absence Scenario

"What if Athlete A is injured and can't compete?"
- Remove athlete from all entries
- Reassign next-best athletes to events
- Re-simulate and report point loss

---

## 5. RELAY OPTIMIZATION ENGINE

### 5.1 4x100m Relay Optimization

**Objective:** Minimize relay time by optimizing leg assignments and exchange execution.

**Decision variables:**
- Which 4 athletes from available sprinters?
- Which leg for each athlete?

**Constraints:**
- Athletes may also be entered in individual events (fatigue consideration)
- Exchange zone limits (20m exchange zone, 10m fly zone for international)
- Athletes must be healthy and available

**Optimization algorithm:**
1. List all available sprinters and their individual 100m SBs
2. For each permutation of 4 athletes and leg assignments:
   - Project leg times (individual time adjusted for running start on legs 2-4)
   - Project exchange quality (based on handoff partner compatibility)
   - Sum projected relay time
3. Select the permutation with the best projected time
4. Verify against individual event entry conflicts

### 5.2 4x400m Relay Optimization

**Similar to 4x100m but with additional considerations:**
- Open 400m runners are obvious candidates, but 200m and 800m runners can also anchor legs
- Leg 1 runs in lanes (lane assignment matters for 400m specialists)
- Legs 2-4 run with break after first turn (positioning matters)
- Fatigue from individual 400m or 800m earlier in meet is significant
- Split prediction: use individual open 400m time minus 1.0-2.0s for running-start legs

### 5.3 Distance Medley Relay (DMR) Optimization (Indoor)

**Legs:** 1200m, 400m, 800m, 1600m
- Leg 1 (1200m): Strong middle distance athlete
- Leg 2 (400m): Fastest 400m runner available
- Leg 3 (800m): 800m specialist
- Leg 4 (1600m): Best miler, often the anchor

---

## 6. CONFIDENCE AND VARIANCE

### 6.1 Simulation Confidence Levels

| Scenario | Confidence | Reason |
|----------|-----------|--------|
| Dual meet, both teams well-known | High (85-95%) | Small field, established marks |
| Conference championship | Moderate (70-85%) | Larger field, more unknowns |
| Regional qualifying | Moderate (65-80%) | Bubble athletes are volatile |
| National championship | Lower (55-75%) | Elite field, small margins |

### 6.2 Variance Sources

**High variance events:**
- Throws (high standard deviation between attempts)
- Pole vault (binary pass/fail at each height)
- High jump (binary pass/fail)
- Steeplechase (water jump incidents)
- Hurdles (hitting hurdles slows time unpredictably)

**Low variance events:**
- Distance running (consistent athletes show <1% variation)
- 400m (well-trained athletes are very consistent)

**Variance amplifiers:**
- Championship meets increase positive variance (more athletes PR)
- Weather changes amplify variance in all events
- Multi-event athletes have increased fatigue variance in later events
- Relay exchanges add variance (DQ risk, slow exchanges)

### 6.3 Upset Probability

For each event, calculate the probability that an athlete projected for a non-scoring position could score:
- If the athlete's performance band overlaps with the projected scoring threshold, an upset is possible
- Report upset probability as a percentage
- Identify events where the team is most likely to score unexpected points

---

## 7. OUTPUT FORMAT

### 7.1 Meet Simulation Report

**Header:**
- Meet name, date, location
- Meet type and scoring system
- Teams involved
- Conditions (if known)

**Event-by-Event Projections:**
For each event:
- Projected top 8 (or scoring places) with marks and team affiliations
- Your team's projected scorers, marks, and points
- Confidence level for each placement

**Relay Projections:**
- Projected relay times and placements
- Relay composition and leg assignments

**Team Scoring Summary:**
- Total projected points per team
- Confidence range (low/base/high scenarios)
- Margin of victory or deficit

**Key Swing Events:**
- Events where the outcome is most uncertain
- Events where entry changes could improve team scoring
- Events where a PR from a key athlete would flip a placement

**Recommendations:**
- Entry optimization suggestions
- Relay composition recommendations
- Tactical notes (e.g., "if Athlete A PRs in the 200m, pull him from relay to rest for 400m finals")
