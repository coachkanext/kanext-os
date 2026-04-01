# WOMEN'S GOLF SCOUTING AND TOURNAMENT OPS
## v1.0 - Women's Golf Intelligence

---

# SCOUTING CONFIDENCE GATES

## Purpose
Determines how much intelligence can be generated about an opponent or prospective recruit based on available data.

## Pre-Tournament Scouting Confidence

| Data Available | Confidence Level | Intelligence Depth |
|---------------|-----------------|-------------------|
| Full season stats + Golfstat + tournament history + course history at this venue | Full (80-95%) | Complete pre-tournament packet with course fit, scoring projections, matchup analysis |
| Season stats + tournament history but no course-specific data | High (65-79%) | Scoring projection with course fit estimate based on archetype |
| Scoring average + rounds played only | Moderate (45-64%) | Basic scouting report with limited projections |
| Name and school only | Low (25-44%) | Profile only, no projections |
| Unknown player | Minimal (0-24%) | No report possible |

## Post-Tournament Scouting Confidence

| Data Available | Confidence Level | Intelligence Depth |
|---------------|-----------------|-------------------|
| Hole-by-hole scoring + round-by-round + final position + conditions known | Full (85-95%) | Complete post-tournament analysis with performance vs projection |
| Final position + round scores | High (70-84%) | Basic performance analysis, scoring trend |
| Final position only | Moderate (50-69%) | Placement analysis only |
| DNF/WD with no detail | Low (30-49%) | Flag for follow-up. Injury? Illness? DQ? |

---

# TOURNAMENT OPS 4-PHASE FLOW

## Phase 1: Pre-Tournament Scout Packet
**Timing:** 3-5 days before tournament start
**Audience:** Head coach, assistant coaches, players

### Packet Contents

**1. Course Intelligence**
- Course profile (from File 04 Course Profile Library or newly built)
- Course history: previous tournament results at this venue (scoring averages, winning scores)
- Key holes: identify the 3-4 holes that most separate players (highest scoring variance)
- Pin placement tendencies (if available from previous events or course management company)
- Weather forecast for all tournament days

**2. Field Analysis**
- Full field list with KRs (or best available data)
- Top 10 projected finishers with win probabilities
- Key opponents by name with scouting profiles:
  - Scoring average, GIR%, scrambling%, driving distance
  - Archetype and tendencies
  - Course history at this venue (if any)
  - Current form (last 3 events)
  - Known weaknesses to exploit in match play (if applicable)
- Field strength assessment (number of ranked teams, ranked individuals)

**3. Team Strategy Brief**
- Optimal lineup recommendation (from File 03 Lineup Construction Engine)
- Course fit analysis for each lineup player
- Player-specific game plans:
  - Which holes to attack (birdie opportunities)
  - Which holes to protect (par is good)
  - Tee shot strategy by hole (driver, 3-wood, iron)
  - Green approach strategy (safe side, aggressive pin-seeking)
- Match play pairing strategy (if applicable):
  - Recommended lineup order based on opponent matchups
  - Which of our players match up best against their top player
  - Anchor player assignment (usually strongest MKR for last match)

**4. Logistics and Conditions**
- Tee times and pairing assignments
- Practice round schedule and priorities (which holes to see, which greens to study)
- Travel and weather advisories
- Course setup notes (expected yardage, rough height, green speed)

### Pre-Tournament Packet Format

```
PRE-TOURNAMENT SCOUT PACKET
Event: [name]
Course: [name], Par [XX], [XXXX] yards
Dates: [dates]
Format: [Stroke Play / Match Play / Both]

COURSE DEMAND PROFILE:
BKR: [X/10] | SKR: [X/10] | CKR: [X/10] | MKR: [X/10] | AKR: [X/10]

WEATHER FORECAST:
[Day-by-day conditions]

LINEUP:
1. [Player] - KR [XX] - Course Fit [XX%]
2-5. [...]

TOP OPPONENTS:
1. [Player/Team] - KR [XX] - Key Strength: [XXX]
2-5. [...]

WIN PROBABILITY: [XX%]

HOLE-BY-HOLE STRATEGY: [simplified for each hole]
```

---

## Phase 2: In-Tournament Live Ops
**Timing:** During competition rounds
**Audience:** Head coach (on-course or at scoring tent)

### Live Intelligence

**1. Real-Time Scoring Monitor**
- Track our players' scores hole-by-hole (via live scoring apps like Golfstat Live, BirdieFire)
- Track key opponents' scores
- Update projected finish and team standing after each hole

**2. Pace and Strategy Adjustments**
- If a player is under par and pressing: no change needed
- If a player is struggling (3+ over through 9 holes): flag for coach awareness
  - Recommend strategy shift: play safer? Change targets? Focus on bogey avoidance?
- If team scoring is tight: identify which player's remaining holes have the most birdie opportunity

**3. Weather Updates**
- If conditions change mid-round (wind picks up, rain starts): flag impact on projected scoring
- Advise if players should adjust strategy (e.g., club up in wind, play more conservatively in rain)

**4. Match Play Live Ops (if applicable)**
- Track hole-by-hole match status for all our matches
- Identify pivotal holes coming up
- Flag if a match can be clinched (team already secured enough match wins)
- Strategy adjustments based on match status (dormie, all-square, behind)

### In-Tournament Intelligence Format

```
LIVE UPDATE - [Event Name] - Round [X]
Through [X] holes

OUR TEAM: [Total Score] ([Position of XX])
1. [Player] - [Score] through [X] - [Key note]
2-5. [...]

TEAM PROJECTED FINISH: [Position]
KEY OPPONENT TRACKER:
1. [Team/Player] - [Score] through [X]

ALERTS: [any strategy adjustments needed]
```

---

## Phase 3: Mid-Tournament Staff Packet
**Timing:** After Round 1 (in 54-hole events) or after Round 2 (in 72-hole events)
**Audience:** Full coaching staff, players

### Packet Contents

**1. Performance vs Projection**
- Compare each player's actual scoring to pre-tournament projection
- Identify overperformers and underperformers with reasons
- Component KR performance: which components are showing and which are not?

**2. Adjusted Projections**
- Update projected final finish based on actual rounds played
- Update win probability
- Update team scoring projection

**3. Strategy Adjustments for Remaining Rounds**
- Player-specific adjustments:
  - Player X: Missed 5 greens on the right side in Round 1. Adjust alignment/club selection for approach shots to favor left.
  - Player Y: Excellent putting but poor tee shots. Prioritize fairway wood off the tee on tight holes.
- Team-level adjustments:
  - If team is in contention: emphasize aggressive play on par 5s, protect on par 3s
  - If team is behind: need birdie production. Identify highest-ceiling player for aggressive strategy
  - If team is comfortably leading: play conservative. Minimize big numbers.

**4. Opponent Assessment Update**
- Which opponents exceeded projections? Why?
- Which opponents collapsed? Any intelligence on what went wrong?
- Updated threat level for remaining rounds

### Mid-Tournament Packet Format

```
MID-TOURNAMENT STAFF PACKET
Event: [name]
After Round [X] of [X]

TEAM STATUS: [Total Score] - [Position of XX]

PLAYER PERFORMANCE vs PROJECTION:
| Player | Projected | Actual | Delta | Key Factor |
|--------|-----------|--------|-------|------------|
| [name] | [score] | [score] | [+/-] | [note] |

UPDATED PROJECTED FINISH: [position]
UPDATED WIN PROBABILITY: [XX%]

STRATEGY ADJUSTMENTS:
[Player-specific and team-level adjustments]
```

---

## Phase 4: Post-Tournament Staff Packet
**Timing:** Within 24 hours of tournament completion
**Audience:** Full coaching staff, uploaded to program database

### Packet Contents

**1. Results Summary**
- Final team finish and score
- Individual finishes and scores for all team members
- Round-by-round scoring breakdown

**2. Performance Analysis**
- Each player's actual performance vs pre-tournament projection
- Component KR performance breakdown:
  - BKR: How was ball-striking? GIR% for the event?
  - SKR: How was scrambling? Sand saves? Up-and-downs?
  - CKR: How was course management? Birdie rate vs bogey rate? Par-5 scoring?
  - MKR: How was the mental game? Final round performance? Bounce-back rate?
  - AKR: Any physical issues? Fatigue signs in late rounds?
- Positive trends to reinforce in practice
- Weaknesses exposed to address in development

**3. Opponent Intelligence Update**
- Key opponents' performance notes
- Any scouting updates for future matchups
- Conference championship implications

**4. KR Update Recommendations**
- Should any player's KR be adjusted based on this performance?
- If a player significantly outperformed her KR: flag for potential upward adjustment
- If a player significantly underperformed: determine if it was noise (bad week) or signal (KR too high)

**5. Development Priorities**
- Top 2-3 practice priorities for each player based on tournament performance
- Team-wide practice priorities
- Course management lessons learned

### Post-Tournament Packet Format

```
POST-TOURNAMENT STAFF PACKET
Event: [name]
Date: [date]

TEAM RESULT: [Position] of [XX] teams | [Total Score] ([vs par])

INDIVIDUAL RESULTS:
| Player | Finish | R1 | R2 | R3 | Total | vs Projection |
|--------|--------|----|----|-------|-------|--------------|
| [name] | [pos] | [X] | [X] | [X] | [total] | [+/-] |

COMPONENT KR PERFORMANCE:
[Player-by-player breakdown]

TOP PRACTICE PRIORITIES:
1. [Team-wide priority]
2. [Player-specific priority]
3. [Player-specific priority]

NEXT EVENT: [name, date, course] - Preliminary scouting notes
```

---

# SCOUTING REPORT TEMPLATE (INDIVIDUAL OPPONENT)

```
SCOUTING REPORT
Player: [name]
School: [school]
Level/Conference: [level/conference]
Class: [class year]

KR: [XX.X] | Confidence: [XX%]
Archetype: [archetype]

SEASON STATS:
Scoring Avg: [XX.X] | GIR%: [XX%] | Scrambling: [XX%]
Driving Dist: [XXX] | Driving Acc: [XX%] | Putting Avg: [XX.X]

COMPONENT KRs:
BKR: [XX] | SKR: [XX] | CKR: [XX] | MKR: [XX] | AKR: [XX]

STRENGTHS:
- [strength 1]
- [strength 2]

WEAKNESSES:
- [weakness 1]
- [weakness 2]

MATCH PLAY TENDENCIES: [aggressive/conservative/adaptive]
PRESSURE PERFORMANCE: [strong/average/weak]
COURSE FIT (this venue): [XX%] - [explanation]

KEY MATCHUP NOTE: [how our player can exploit her weaknesses]
```

---

# GOVERNANCE

- Scouting data is consumed by the simulation engine. Scouting does not modify player KRs.
- All scouting reports include confidence level and data quality assessment.
- Tournament ops packets are time-stamped and versioned.
- Post-tournament analysis feeds back into the development engine (File 06) and may trigger KR re-evaluation.
- Live ops are advisory, not directive. The coach makes all in-tournament decisions.
