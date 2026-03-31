# Women's Volleyball Scouting and Match Ops v1

---

## 0. SCOPE

This is the single authoritative document for scouting intelligence and in-match operations for women's volleyball. It covers the 4-phase match ops flow (Prematch, In-Match, Between-Sets, Postmatch), confidence gates, and match-specific data requirements.

The scouting system consumes player evaluations, team evaluations, and simulation outputs. It does not modify any upstream KR values.

---

## 1. CONFIDENCE GATES

### Scout Confidence Gate (Prematch)

| Data Available (Opponent) | Scout Confidence % Range |
|--------------------------|-------------------------|
| V1 stats only: season stats + per-set rates | 50-65% |
| V1 stats only + multi-year (returning core) | 58-72% |
| V1 + set distribution data or DataVolley summary | 68-82% |
| V1+ licensed: play-by-play + rotation data | 75-88% |
| V2 Video: 5+ matches processed | 82-92% |
| V2 Video: 10+ matches + stable rotation | 88-95% |
| V3 Video Deep: multi-season + film archive | 92-97% |

### Scout Confidence Adjusters
- **Sample size:** fewer than 15 sets this season -> bottom of range
- **Recency:** last 3 matches show clear shift (injury, lineup change) -> downshift 5-10
- **Roster volatility:** significant lineup changes or transfers mid-season -> downshift 5-10
- **System ambiguity:** OSIE/DSIE still provisional -> downshift 5-10
- **Prior matchup data:** previous match against same opponent this season -> upshift 3-5
- **Stable identity:** locked systems + stable top-8 rotation + 20+ sets -> upshift toward top of range

### Postmatch Confidence Gate

| Data Available (Postmatch) | Postmatch Confidence % Range |
|---------------------------|----------------------------|
| V1 stats only: final box score + set scores | 55-68% |
| V1 + manual staff tags (timeouts, key rallies logged) | 62-75% |
| V1+ licensed: play-by-play + rotation efficiency | 72-85% |
| V2 Video: match film processed with rotation tags | 82-92% |
| V2 Video + high completeness: rotation-level analysis + 10+ teaching clips | 88-95% |
| V3 Video Deep: multi-match context + full clip library | 92-97% |

---

## 2. PHASE 1: PREMATCH SCOUTING

### 2.1 Prematch Data Requirements

**Minimum (V1):**
- Opponent roster with positions and heights
- Season stats (per-set: kills, hitting%, assists, aces, digs, blocks for each player)
- Team record and recent results
- Starting lineup (last 3 matches)

**Enhanced (V1+):**
- Rotation-level attack data (who attacks from which rotation)
- Set distribution percentages
- Serve receive formation and personnel
- Serving order

**Full (V2+):**
- Film of 3+ recent matches
- Rotation-by-rotation analysis
- Setter tendency charts
- Blocking scheme identification
- Serve receive positioning maps

### 2.2 Prematch Report Structure

```
PREMATCH SCOUT REPORT
======================
Opponent: [Team Name]
Level: [Level] | Conference: [Conference]
Record: [W-L, Conference W-L]
Date: [Match Date]
Scout Confidence: [XX]%

TEAM IDENTITY:
  Offensive System: [System] (Confidence: [XX]%)
  Defensive System: [System] (Confidence: [XX]%)
  Team KR: [XX.X] (Off: [XX.X] / Def: [XX.X])
  System Fit%: [XX.X]%

ROTATION ANALYSIS (6 rotations):
  Rotation 1: [Front row players] / [Back row players]
    - Offensive threat: [High/Medium/Low]
    - Blocking strength: [High/Medium/Low]
    - Vulnerability: [Description]

  Rotation 2: [Front row] / [Back row]
    [Same breakdown]

  [Continue for all 6 rotations]

  Strongest Rotation: R[X] - [Why]
  Weakest Rotation: R[X] - [Why]
  Rotation to target with serves: R[X]

KEY PERSONNEL:
  Primary Attacker: [Name] - [Position] - KR [XX.X]
    - Tendencies: [Hitting preferences, shot selection]
    - How to defend: [Blocking/defensive strategy]

  Setter: [Name] - KR [XX.X]
    - Distribution tendencies: [Who she goes to most]
    - Dump threat level: [High/Medium/Low]
    - Out-of-system tendencies: [Where she sets when pass is bad]

  Primary Passer(s): [Name(s)]
    - Pass rating: [XX]
    - Serve to target: [Yes/No - exploit weak passer or avoid strong one]

  Top Blocker: [Name]
    - Blocking tendencies: [Read vs commit, positioning]

SERVE RECEIVE ANALYSIS:
  Formation: [W formation / standard / rotational]
  Primary Passers: [Names and positions on court]
  Weakest Passer: [Name] - target with serves
  Seam Vulnerability: [Location of seam between passers]

SERVING STRATEGY:
  Serve to: [Zone(s) and why]
  Avoid: [Zone(s) and why]
  Serve type recommendation: [Float to zones X, jump serve to zones Y]

BLOCKING STRATEGY:
  Against OH: [Commit/read, inside-out or line]
  Against MB: [Commit on quick or read]
  Against OPP: [Strategy]
  Setter front row: [How to handle dump threat]

DEFENSIVE POSITIONING:
  Against their primary attacker: [Positioning recommendation]
  Against their quick attack: [Cover strategy]
  Tip coverage: [Who covers and where]

TIMEOUT TRIGGERS:
  Call timeout when:
  - Opponent goes on a 3-0 run in any rotation
  - Our passing breaks down for 3 consecutive rallies
  - Their rotation R[X] is about to start a serving run (their best server)

MATCH PREDICTION:
  Our Win%: [XX.X]%
  Key to winning: [2-3 critical strategic points]
  Risk factor: [What could go wrong]
```

### 2.3 Setter Tendency Scouting (Deep Section)

Because the setter is the quarterback of volleyball, setter scouting is the deepest section of prematch preparation.

**Setter Tendency Categories:**

1. **Distribution by Rotation:**
   - Which hitter does she go to most in each rotation?
   - Does her distribution change when the team is ahead vs behind?
   - Does she become more predictable under pressure?

2. **Tempo Patterns:**
   - What percentage of sets are first-tempo (quick) vs second vs third?
   - Does tempo change between sets?
   - When does she slow down the offense?

3. **Out-of-System Behavior:**
   - When the pass is off-target, where does she set?
   - Does she default to the left side (most common)?
   - Can she still run quick tempo on off-pass?

4. **Dump/Tip Tendencies:**
   - In which rotations does she dump most?
   - What is her dump success rate?
   - Does she dump more when front row in rotations 2-4?
   - Is it a dump or a tip? (Dump = hard over; tip = soft placement)

5. **Communication and Adjustment:**
   - Does she change strategy between sets?
   - Does she respond to scouting (if we take away her middle, does she adjust)?

---

## 3. PHASE 2: IN-MATCH OPERATIONS

### 3.1 Set-by-Set Tracking

For each set, track in real time:

**Score Events:**
- Every point with point type (kill, ace, block, error)
- Which player scored or committed the error
- Serving rotation at time of point

**Rotation Tracking:**
- Track current rotation for both teams
- Log rotation-specific efficiency:
  - Points scored by us in each rotation
  - Points scored by opponent in each rotation
  - Side-out rate by rotation

**Serving Run Tracking:**
- Track length of each serving run (consecutive points while one player serves)
- Log server identity and rotation context
- Flag serving runs of 3+ for analysis

**Setter Tracking:**
- Track set distribution (who is getting sets)
- Compare to prematch scouting predictions
- Flag if setter is deviating from expected patterns

### 3.2 In-Match Adjustment Triggers

**Call timeout when:**
- Opponent is on a 3-0 serving run
- Our side-out rate drops below 50% for 5+ consecutive rallies
- Opponent's primary attacker has 3+ kills in a row
- We are in a vulnerable rotation and losing points

**Substitute when:**
- A specific rotation is giving up 3+ consecutive points
- A player's serve receive is being targeted and she is passing below 1.50
- A hitter is hitting below .050 on 5+ attempts
- We need a stronger server in a critical rotation

**Blocking Adjustment when:**
- Opponent's hitter has 5+ kills against our block
- Our block is not getting touches (switch from read to commit or vice versa)
- Opponent setter has 2+ dump kills (need to front the setter)

**Serving Adjustment when:**
- Our target passer is handling serves well (switch target)
- A different passer has entered the lineup (assess vulnerability)
- Opponent has adjusted serve receive formation

### 3.3 Real-Time Efficiency Display

```
SET [X] - LIVE TRACKING
========================
Score: [Us] - [Them]
Rotation: Us R[X] | Them R[X]

Our Hitting%: .XXX (season avg: .XXX)
Their Hitting%: .XXX
Our Side-Out%: XX% | Their Side-Out%: XX%
Our Block Rate: X.X/set pace | Their Block Rate: X.X/set

Current Server: [Name] - Run: [X points]
Rotation Efficiency This Set:
  Our R1: +X | R2: +X | R3: +X | R4: +X | R5: +X | R6: +X
  Their R1: +X | R2: +X | R3: +X | R4: +X | R5: +X | R6: +X
```

---

## 4. PHASE 3: BETWEEN-SETS ANALYSIS

### 4.1 Set Analysis Report

Generated immediately after each set ends:

```
SET [X] ANALYSIS
================
Result: [Won/Lost] [Score]
Duration: [XX:XX]

HITTING PERFORMANCE:
  Our Team: .XXX ([X] kills, [X] errors, [X] attempts)
  Their Team: .XXX ([X] kills, [X] errors, [X] attempts)

SERVING:
  Our Aces: [X] | Errors: [X]
  Their Aces: [X] | Errors: [X]
  Our Best Server: [Name] - [X] aces, [X]-point run

BLOCKING:
  Our Blocks: [X] | Their Blocks: [X]
  Our Best Blocker: [Name] - [X] blocks

ROTATION GRADES (A/B/C/D/F):
  R1: [Grade] - [Points won-lost]
  R2: [Grade] - [Points won-lost]
  R3: [Grade] - [Points won-lost]
  R4: [Grade] - [Points won-lost]
  R5: [Grade] - [Points won-lost]
  R6: [Grade] - [Points won-lost]

THEIR SETTER TENDENCIES (this set):
  Distribution: [Who got the most sets]
  Quick rate: [X]%
  Dump attempts: [X]
  Out-of-system sets went to: [Hitter/zone]

KEY ADJUSTMENTS FOR NEXT SET:
  1. [Specific adjustment with rationale]
  2. [Specific adjustment with rationale]
  3. [Specific adjustment with rationale]
```

### 4.2 Between-Sets Adjustment Framework

**Offensive Adjustments:**
- If their block is dominating our left side: increase right-side and pipe attacks
- If our middle is hitting below .100: reduce quick sets, use middle as decoy
- If our primary attacker is being doubled every time: run more combination plays
- If their libero is digging everything: vary shot selection (add tips, tools)

**Defensive Adjustments:**
- If their primary attacker has 6+ kills in a set: switch blocking scheme on that hitter
- If their quick attack is scoring freely: consider commit blocking the middle
- If tips are falling: switch to man-up defense for specific rotations
- If their serving is disrupting our passing: change serve receive formation or personnel

**Serving Adjustments:**
- If our serve target is adjusted to (they moved a better passer there): switch target
- If opponent has added or removed a passer between sets: exploit the new weakness
- If we are serving too aggressively (errors > aces by 3+): dial back, get the ball in play

**Personnel Adjustments:**
- If a player is struggling: consider substitution, but weigh the experience/confidence cost
- If a specific rotation is hemorrhaging points: substitute in that rotation
- If the libero is not performing: this is a critical problem with limited solutions (only one libero can be designated per set)

---

## 5. PHASE 4: POSTMATCH ANALYSIS

### 5.1 Postmatch Report Structure

```
POSTMATCH ANALYSIS
===================
[Our Team] vs [Opponent]
Result: [W/L] [Set scores: e.g., 3-1 (25-20, 23-25, 25-18, 25-22)]
Postmatch Confidence: [XX]%

MATCH SUMMARY:
  [2-3 sentence summary of the match narrative]

TEAM PERFORMANCE:
  Team Hitting%: .XXX (season avg: .XXX) | [Above/Below] average
  Side-Out%: XX% | [Above/Below] average
  Team Blocks/Set: X.X | [Above/Below] average
  Team Aces/Set: X.X | [Above/Below] average

INDIVIDUAL PERFORMANCE CARDS:
  [For each rotation player, produce a mini-card]

  [Player Name] - [Position]
  KR: [XX.X] | Match Performance: [Above/At/Below] KR
  Kills: [X] | Hitting%: .XXX | Digs: [X] | Blocks: [X] | Aces: [X]
  Key Moments: [Description of big plays or struggles]
  Grade: [A/B/C/D/F]

ROTATION GRADES (Full Match):
  R1: [Grade] - [Total points won-lost across all sets]
  R2: [Grade]
  R3: [Grade]
  R4: [Grade]
  R5: [Grade]
  R6: [Grade]

SCOUTING ACCURACY:
  Prematch prediction accuracy: [How well did the scout report predict the match]
  Setter tendencies: [Matched expectations / Deviated - how]
  Rotation vulnerabilities: [Confirmed / Not exploited / New ones discovered]

SET-BY-SET SUMMARY:
  Set 1: [Score] - [Key narrative]
  Set 2: [Score] - [Key narrative]
  Set 3: [Score] - [Key narrative]
  Set 4: [Score] - [Key narrative]
  Set 5: [Score] - [Key narrative] (if played)

LESSONS LEARNED:
  1. [What worked and should be repeated]
  2. [What did not work and needs adjustment]
  3. [What to focus on in practice before next match]

OPPONENT UPDATE:
  [Any new information learned about opponent that updates the scouting file]
  [New tendencies, new rotations, personnel changes observed]
```

### 5.2 Trend Analysis
After 5+ matches, produce trend reports:
- Rotation-by-rotation trends (which rotations are improving/declining)
- Individual player trend lines (KR trajectory over recent matches)
- System effectiveness trend (is our offensive/defensive system working over time)
- Side-out rate trend (most important macro metric)
- Serving aggressiveness vs error rate trend

---

## 6. SCOUTING SPECIAL SITUATIONS

### 6.1 NCAA Tournament Scouting
- Higher-pressure environment magnifies weaknesses
- Teams that rely on one attacker are more vulnerable (tournament defenses are better prepared)
- Serving aggressiveness increases in tournament play
- Fifth sets are more common in tournament play (even matchups)
- Scout for momentum management: which team handles adversity better?

### 6.2 Conference Tournament Scouting
- Familiarity advantage (teams have played each other 2x already)
- Adjustments from prior matches are critical
- Scout for how the opponent adjusted since the last meeting, not just their base tendencies

### 6.3 Rivalry Match Scouting
- Emotional intensity factor: +1.0 modifier for both teams (higher effort, more errors too)
- Crowd factor amplifies home court advantage: +0.5 additional to home modifier
- Scout for composure: which players get rattled in rivalry atmosphere

---

## GOVERNANCE

- Scouting does not modify any KR values (player or team)
- Confidence gates are mandatory for all reports
- Between-sets adjustments must be specific and actionable
- Postmatch analysis must include scouting accuracy assessment
- All phase outputs are timestamped and versioned
- Setter tendency scouting is the highest-priority element of prematch preparation
