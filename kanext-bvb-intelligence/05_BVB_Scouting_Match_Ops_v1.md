# Beach Volleyball Scouting and Match Ops v1

---

## 0. SCOPE

This is the single authoritative document for scouting intelligence and in-match operations for beach volleyball. It covers the 4-phase match ops flow (Prematch, In-Match, Between-Sets, Postmatch), confidence gates, and match-specific data requirements including weather/wind game planning.

The scouting system consumes player evaluations, partnership evaluations, and simulation outputs. It does not modify any upstream KR values.

---

## 1. CONFIDENCE GATES

### Scout Confidence Gate (Prematch)

| Data Available (Opponent Pair) | Scout Confidence % Range |
|-------------------------------|-------------------------|
| V1 stats only: season stats + per-match rates | 45-60% |
| V1 stats only + multi-year (stable partnership) | 55-70% |
| V1 + tournament bracket/seeding context | 58-72% |
| V1+ licensed data: rally-level tracking (1 season) | 70-82% |
| V2 Video: 5+ matches processed | 78-88% |
| V2 Video: 10+ matches + stable partnership | 85-93% |
| V3 Video Deep: multi-season + multiple partnerships | 90-96% |

### Scout Confidence Adjusters
- **Sample size:** fewer than 10 matches this season -> bottom of range
- **Recency:** last 3 tournaments show clear shift (injury, partner change) -> downshift 5-10
- **Partnership stability:** new partnership (under 8 matches) -> downshift 5-8
- **System ambiguity:** unclear blocking/defensive scheme -> downshift 5
- **Prior matchup data:** previous match against same opponent this season -> upshift 3-5
- **Stable identity:** same partnership 20+ matches + consistent results -> upshift toward top of range
- **Weather familiarity:** match at a venue both pairs know well -> upshift 2-3

### Postmatch Confidence Gate

| Data Available (Postmatch) | Postmatch Confidence % Range |
|---------------------------|----------------------------|
| V1 stats only: final box score + set scores | 50-65% |
| V1 + manual staff tags (timeouts, key rallies) | 60-72% |
| V1+ licensed: rally-level tracking | 70-82% |
| V2 Video: match film processed | 80-90% |
| V2 Video + shot charts + blocking tendency map | 88-95% |
| V3 Video Deep: multi-match context + film library | 92-97% |

---

## 2. PHASE 1: PREMATCH SCOUTING

### 2.1 Prematch Data Requirements

**Minimum (V1):**
- Opponent pair names, heights, roles (blocker/defender)
- Season stats (per-match: kills, hitting%, aces, digs, blocks)
- Win-loss record and recent tournament results
- Partnership history (how long have they played together)

**Enhanced (V1+):**
- Blocking tendency data (what percentage line block, angle block, pull)
- Serve type breakdown (float%, jump%, short serve%)
- Shot selection percentages (hard-driven%, cut%, line%, tool%)
- Side-out and break point percentages

**Full (V2+):**
- Film of 3+ recent matches
- Blocking hand signal decode (what signals correspond to what calls)
- Shot charts by zone
- Serve placement heat maps
- Transition attack tendencies
- Third-set performance data

### 2.2 Weather Scouting

Before every outdoor match, scout the conditions:

**Wind Assessment:**
- Speed and direction (measured or estimated)
- Consistency vs gusting pattern
- Expected changes during match (afternoon wind pickup is common in coastal venues)

**Sun Assessment:**
- Current position relative to court
- Expected movement during match duration
- Which side of the court has sun disadvantage at match start

**Temperature/Humidity:**
- Current temperature
- Heat index (if applicable)
- Expected change during match

**Sand Assessment:**
- Depth and consistency
- Wet or dry
- Any slope or drainage issues

### 2.3 Prematch Report Structure

```
PREMATCH SCOUT REPORT - BEACH VOLLEYBALL
==========================================
Opponent Pair: [Player A / Player B]
Roles: [Player A Role] / [Player B Role]
Level: [Level]
Record: [W-L]
Partnership Duration: [X matches / X seasons]
Date: [Match Date]
Venue: [Venue Name]
Scout Confidence: [XX]%

CONDITIONS:
  Wind: [Speed, direction, consistency]
  Sun: [Position, which side disadvantaged]
  Temperature: [Temp, heat index]
  Sand: [Depth, condition]

OPPONENT PAIR PROFILE:
  Partnership KR: [XX.X] (if computed)
  Player A: [Name] - KR [XX.X], Role: [Blocker/Defender]
    Strengths: [Key strengths]
    Weaknesses: [Key weaknesses]
  Player B: [Name] - KR [XX.X], Role: [Blocker/Defender]
    Strengths: [Key strengths]
    Weaknesses: [Key weaknesses]

BLOCKING TENDENCIES (V1+ / V2+):
  [Player A/Blocker] typically blocks:
    - Line: [XX]% of the time
    - Angle: [XX]%
    - Pull (no block): [XX]%
    - Bait: [XX]%
  Hand signal decode: [If available from V2+]

DEFENSIVE POSITIONING (V1+ / V2+):
  [Player B/Defender] typical positioning:
    - When partner blocks line: [defender position]
    - When partner blocks angle: [defender position]
    - When partner pulls: [defender position]

SERVING TENDENCIES:
  [Player A] serve type: [Float/Jump/Both], favorite target zone: [zone]
  [Player B] serve type: [Float/Jump/Both], favorite target zone: [zone]

ATTACK TENDENCIES:
  [Player A] preferred shots: [e.g., hard line, cut angle, tool]
  [Player B] preferred shots: [e.g., line shot, roll shot, pokey]

KEY VULNERABILITIES:
  1. [Vulnerability 1 - e.g., "Defender struggles with deep corner serves"]
  2. [Vulnerability 2 - e.g., "Blocker is slow transitioning to offense after blocking"]
  3. [Vulnerability 3 - e.g., "Partnership communication breaks down in third set"]

GAME PLAN RECOMMENDATIONS:
  Serving: [Where to serve, what type, targeting which player]
  Blocking: [How to block against each attacker]
  Defense: [Positioning behind the block]
  Attack: [What shots to use against their block/defense]
  Weather: [How to use wind/sun to advantage]

WIN PROBABILITY: [XX]% (from simulation engine)
```

---

## 3. PHASE 2: IN-MATCH TRACKING

### 3.1 Live Stat Tracking

During the match, track per-set and running totals:

**Per Player:**
- Kills, attack attempts, attack errors, hitting%
- Aces, service errors
- Digs
- Blocks (solo)
- Points scored

**Per Pair:**
- Side-out percentage (points won on opponent's serve)
- Break percentage (points won on own serve beyond side-out)
- Errors (unforced vs forced)

**Tactical Tracking (V2+ with live video):**
- Blocking call frequency (line, angle, pull, bait)
- Shot selection by zone
- Serve type and placement
- Transition attack conversion rate

### 3.2 Run Detection

In beach volleyball, scoring runs are critical because sets are only to 21 (or 15).

**Run alert thresholds:**
- 3-0 run: minor alert
- 5-0 run: major alert (this is a significant swing in a set to 21)
- 3-0 run in third set: critical alert (3 points in a set to 15 is 20% of the set)

When a run is detected, trigger between-points analysis:
- What changed? (Serving, blocking adjustment, weather shift, fatigue)
- Is this a systematic issue or variance?
- Should a timeout be called?

### 3.3 Timeout Decision Support

Each pair gets one timeout per set in beach volleyball. Timeout usage is critical.

**Timeout recommendation triggers:**
- Opponent on a 3+ point run
- Own pair has committed 2+ consecutive errors
- Significant weather change (wind shift, sun angle change) that requires tactical adjustment
- Score is within 3 points of set end and opponent has momentum

---

## 4. PHASE 3: BETWEEN-SETS

### 4.1 Between-Sets Analysis

After each set, produce a quick analysis:

```
BETWEEN-SETS REPORT
=====================
Set [X] Result: [Team A score] - [Team B score]
Match Status: [1-0 / 0-1 / 1-1]

SET STATS SUMMARY:
  [Player A]: [kills, errors, digs, aces]
  [Player B]: [kills, errors, digs, aces]
  Opponent [Player C]: [kills, errors, digs, aces]
  Opponent [Player D]: [kills, errors, digs, aces]

  Side-out%: [Own] vs [Opponent]
  Break%: [Own] vs [Opponent]

WHAT WORKED:
- [e.g., "Short serves to their defender pulled them out of rhythm"]
- [e.g., "Blocking line forced their attacker into angle shots that our defender covered"]

WHAT DIDN'T WORK:
- [e.g., "Jump serves into the wind resulted in 3 service errors"]
- [e.g., "Their blocker read our attacker's cut shot every time"]

ADJUSTMENTS FOR NEXT SET:
  Serving: [Adjustment]
  Blocking: [Adjustment]
  Defense: [Adjustment]
  Attack: [Adjustment]
  Weather: [Has anything changed? Wind shift?]

UPDATED WIN PROBABILITY: [XX]% (recalculated with in-match data)
```

### 4.2 Third-Set Preparation (If 1-1)

When the match goes to a third set:

**Critical context:**
- Third set is to 15 (not 21). Every point matters more.
- Side switching every 5 points (not 7). Wind/sun advantage shifts more frequently.
- Fatigue is highest. Which pair is more conditioned?
- Mental state matters more. Who handles pressure better?

**Third-set game plan:**
- Simplify: reduce risk-taking. Fewer jump serves (float is safer). Attack with high-percentage shots.
- Target weakness: the opponent's weakest skill under pressure will break first
- Serve strategy: prioritize making serves in (reduce errors) while maintaining enough pressure
- Timeout timing: save timeout for critical moment (usually around 10-12 points in a close set)

---

## 5. PHASE 4: POSTMATCH

### 5.1 Postmatch Analysis

```
POSTMATCH ANALYSIS
====================
Result: [Pair A] def. [Pair B], [Set scores]
Duration: [match time]
Venue: [Venue]
Conditions: Wind [X mph], Temp [X F/C]
Postmatch Confidence: [XX]%

MATCH STATS:
  [Player A]: [kills, attempts, errors, hitting%, aces, SEs, digs, blocks, points]
  [Player B]: [kills, attempts, errors, hitting%, aces, SEs, digs, blocks, points]
  [Player C]: [kills, attempts, errors, hitting%, aces, SEs, digs, blocks, points]
  [Player D]: [kills, attempts, errors, hitting%, aces, SEs, digs, blocks, points]

SIDE-OUT ANALYSIS:
  [Pair A] side-out%: [XX]%
  [Pair B] side-out%: [XX]%

KEY MOMENTS:
  1. [e.g., "Set 1 at 18-16, Pair A went on 3-0 run to close"]
  2. [e.g., "Set 2, wind shifted at the 14-point mark, Pair B adjusted faster"]
  3. [e.g., "Set 3, Pair A's serving was the difference (4 aces vs 0)"]

TACTICAL OBSERVATIONS:
  Blocking: [What blocking strategy worked/didn't work]
  Defense: [Defensive adjustments that were effective]
  Serving: [Serve patterns that produced advantages]
  Attack: [Shot selection insights]
  Weather adaptation: [How each pair handled conditions]

PLAYER KR IMPACT:
  Did this match change any individual's evaluation narrative?
  [e.g., "Player A's performance in heavy wind (5 aces, 10 kills) supports Wind Warrior badge consideration"]

REMATCH NOTES:
  If playing this pair again, key adjustments would be:
  1. [Adjustment 1]
  2. [Adjustment 2]
```

---

## 6. WIND GAME PLAN TEMPLATES

### 6.1 Light Wind (6-10 mph)

**Serving with the wind:**
- Float serves become more effective (ball moves unpredictably with the wind)
- Add topspin to maintain control
- Target deep corners (the wind carries the ball deeper)

**Serving into the wind:**
- Float serves are shorter (wind pushes back)
- Jump serves have less carry
- Consider short serves (the wind makes it harder to track short serves)

**Attacking with the wind:**
- Power shots carry further - adjust aim inside the lines
- Cut shots are less effective (wind straightens the ball)
- Tool shots off the block are valuable (the wind does not affect them as much)

**Attacking into the wind:**
- The wind slows down attacks - choose placement over power
- Cut shots become more effective (the wind exaggerates the angle)
- Cobra and roll shots work well (the wind carries them deeper)

### 6.2 Heavy Wind (16+ mph)

**General principles:**
- Reduce jump serve attempts (too much risk of errors)
- Standing float serves with heavy spin become primary weapon
- Expect more errors from both sides - patience wins
- Short serves are extremely effective in heavy wind (the receiver must move forward into the wind)
- Blocking strategy should favor pulling (no block) because attack accuracy decreases - let the defense play 2-back

**Pair-specific adjustments:**
- The pair with better IQKR (wind adaptation) has a structural advantage
- Watch for which opponent struggles more with wind-affected serves
- Timeout when the wind shifts direction (the other pair may not have adjusted yet)

### 6.3 Crosswind

**Court side strategy:**
- One side of the court is more favorable (hitting with crosswind vs into crosswind)
- Use the favorable side for aggressive serving and attacking
- On the unfavorable side, play conservatively

**Side-switch awareness:**
- Every 7 points (5 in third set), the advantage flips
- Plan scoring runs on the favorable side
- Expect opponent to plan the same - be ready for their aggression

---

## 7. SUN GAME PLAN

### 7.1 Sun in Server's Eyes
- Serve from a lower contact point (standing serve instead of jump serve)
- Use a toss that avoids the sun angle
- Some servers shift their position on the service line to change the sun angle

### 7.2 Sun in Defender's Eyes
- The defender on the sun side must shade their eyes on every serve receive and defensive play
- Opponent will target this player with high-arcing serves and shots
- Consider having the defender play deeper to buy more reaction time
- Sunglasses help but do not eliminate the issue
- The blocker may need to take more court responsibility on the sun side

---

## 8. GOVERNANCE

- Scouting consumes only evaluated KR data. It never modifies upstream.
- Scout confidence must be declared on every output.
- Weather game plans are advisory, not KR-modifying.
- Between-sets analysis must be produced within the set break window (practical time constraint).
- Postmatch analysis should identify any signals that would trigger re-evaluation of individual players or partnerships.
- All scouting data feeds back into the data pool for future evaluations (enrichment loop).
