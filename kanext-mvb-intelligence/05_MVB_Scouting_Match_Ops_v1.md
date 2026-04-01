# Men's Volleyball Scouting and Match Ops v1

---

## 0. SCOPE

This is the single authoritative document for scouting intelligence and in-match operations for men's volleyball. It covers the 4-phase match ops flow (Prematch, In-Match, Between-Sets, Postmatch), confidence gates, and match-specific data requirements.

The scouting system consumes player evaluations, team evaluations, and simulation outputs. It does not modify any upstream KR values.

**Men's-specific scouting notes:**
- Jump serve scouting is critical. Identifying which servers are jump vs float, and where they target, is the highest-priority prematch intelligence.
- Setter scouting is equally important as women's.
- Fewer teams in the competitive landscape means more repeat matchups within conference play. Adjustment scouting (how did they change since last time?) is essential.
- Spring season means scouting windows are compressed (January start through May).

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
- **Recency:** last 3 matches show clear shift -> downshift 5-10
- **Roster volatility:** significant lineup changes -> downshift 5-10
- **System ambiguity:** OSIE/DSIE still provisional -> downshift 5-10
- **Prior matchup data:** previous match against same opponent this season -> upshift 3-5
- **Stable identity:** locked systems + stable top-8 rotation + 20+ sets -> upshift toward top of range

### Postmatch Confidence Gate
Same tiers as prematch with postmatch data context.

---

## 2. PHASE 1: PREMATCH SCOUTING

### 2.1 Prematch Data Requirements

**Minimum (V1):**
- Opponent roster with positions and heights
- Season stats (per-set)
- Team record and recent results
- Starting lineup (last 3 matches)
- Jump serve vs float identification per player

**Enhanced (V1+):**
- Rotation-level attack data
- Set distribution percentages
- Serve receive formation and personnel
- Serving order with serve type per player

**Full (V2+):**
- Film of 3+ recent matches
- Rotation-by-rotation analysis
- Setter tendency charts
- Blocking scheme identification

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

ROTATION ANALYSIS (6 rotations):
  [Full rotation-by-rotation breakdown]
  Strongest Rotation: R[X] - [Why]
  Weakest Rotation: R[X] - [Why]
  Rotation to target with serves: R[X]

KEY PERSONNEL:
  Primary Attacker: [Name] - [Position] - KR [XX.X]
  Setter: [Name] - KR [XX.X]
  Primary Passer(s): [Name(s)]
  Top Blocker: [Name]

SERVE ANALYSIS (Men's-Specific Priority):
  Jump Servers: [Names, estimated speed, location tendencies]
  Float Servers: [Names, movement patterns]
  Most Dangerous Server: [Name] - [Why]
  Service Order: [List in order]

SERVE RECEIVE ANALYSIS:
  Formation: [Formation type]
  Primary Passers: [Names and positions]
  Weakest Passer: [Name] - target with jump serves
  Jump Serve Handling: [Strong/Average/Weak]

SERVING STRATEGY (Our Approach):
  Serve to: [Zone(s) and why]
  Avoid: [Zone(s) and why]
  Jump serve vs float recommendation by rotation

BLOCKING STRATEGY:
  Against OH: [Commit/read, inside-out or line]
  Against MB: [Quick attack strategy]
  Against OPP: [Strategy - note OPP is often primary scorer in men's]
  Setter front row: [Dump threat level and coverage]

TIMEOUT TRIGGERS:
  [Specific triggers]

MATCH PREDICTION:
  Our Win%: [XX.X]%
  Key to winning: [2-3 critical points]
  Risk factor: [What could go wrong]
```

### 2.3 Setter Tendency Scouting
Same depth as women's. Critical categories:
1. Distribution by Rotation
2. Tempo Patterns
3. Out-of-System Behavior
4. Dump/Tip Tendencies (men's setters can be more physically aggressive)
5. Communication and Adjustment

### 2.4 Jump Serve Scouting (Men's-Specific Deep Section)
Because the jump serve is the primary weapon in men's volleyball, serve scouting receives its own deep section.

**Jump Serve Scouting Categories:**
1. **Serve Speed Estimation:** Categorize as Light (55-65 mph), Medium (65-75 mph), Heavy (75+ mph)
2. **Serve Location Tendencies:** Where does each server target? Cross-court? Line? Short? Deep? Seam?
3. **Serve Type Variation:** Does the server vary between jump topspin and jump float? When?
4. **Toss Consistency:** Is the toss placement consistent? Inconsistent toss = more errors but also harder to read.
5. **Pressure Serving:** Does the player serve more aggressively or more conservatively at set point?
6. **Service Error Patterns:** When in the match do errors increase? (Fatigue in fifth set?)

---

## 3. PHASE 2: IN-MATCH OPERATIONS

### 3.1 Set-by-Set Tracking
Same structure as women's with additional men's tracking:
- Serve type per rally (jump vs float, player ID)
- Serve receive quality per rally (especially against jump serves)
- Attack velocity estimation (when available)

### 3.2 In-Match Adjustment Triggers
Same structure as women's. Additional men's triggers:
- **Serve receive collapse:** If our passing drops below 1.80 for 5+ consecutive rallies, call timeout and adjust formation
- **Jump serve run:** If opponent server has 2+ aces in a row, adjust receive formation (pull passers deeper, add a fourth passer)
- **Blocking overcommit:** Men's middles are faster - if our block is consistently late, switch to soft block or peel strategy

### 3.3 Real-Time Efficiency Display
Same format as women's.

---

## 4. PHASE 3: BETWEEN-SETS ANALYSIS

### 4.1 Set Analysis Report
Same format as women's.

### 4.2 Between-Sets Adjustment Framework
Same framework as women's with men's additions:

**Serving Adjustments (Men's Priority):**
- If our jump serves are producing 0 aces with 3+ errors: add float variation
- If opponent's jump serve is dominating our receive: change formation, pull passers off the net, add a DS
- If we have a tactical float server: deploy against opponent's weakest rotation

---

## 5. PHASE 4: POSTMATCH ANALYSIS

### 5.1 Postmatch Report Structure
Same format as women's with additional men's sections:

**SERVE ANALYSIS (Postmatch):**
- Total aces / total errors by serve type
- Jump serve effectiveness: opponent pass rating against our jump serves
- Float serve effectiveness: opponent pass rating against our floats
- Serving strategy assessment: did we serve to the right targets?

### 5.2 Trend Analysis
Same structure as women's. After 5+ matches, produce trend reports including serve effectiveness trends.

---

## 6. SCOUTING SPECIAL SITUATIONS

### 6.1 NCAA Tournament Scouting (Men's)
- Men's NCAA D1 tournament is much smaller than women's (7-8 teams, expanding)
- Single-elimination format after pool play increases variance
- Higher-pressure environment magnifies serve receive weaknesses
- Home crowd advantage is massive (host sites matter enormously)
- Limited scouting data on unfamiliar opponents from other conferences

### 6.2 Conference Tournament Scouting
- Conferences are small (MPSF has ~8 teams, EIVA has ~10)
- Teams have played each other multiple times - adjustment scouting is critical
- Conference tournament often determines NCAA auto-bid

### 6.3 Non-Conference Match Scouting
- Non-conference scheduling is critical for men's volleyball seeding
- Cross-conference matchups provide less scouting data (may be first meeting)
- MPSF vs EIVA matchups are often the best regular-season matches

---

## GOVERNANCE

- Scouting does not modify any KR values
- Confidence gates are mandatory
- Between-sets adjustments must be specific and actionable
- Jump serve scouting is the highest-priority element unique to men's prematch preparation
- Setter tendency scouting remains equally critical as women's
- All phase outputs are timestamped and versioned
