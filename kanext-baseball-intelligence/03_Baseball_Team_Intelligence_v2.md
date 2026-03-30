# BASEBALL TEAM INTELLIGENCE
## File 03 -- v2.0 (Full Operational Spec)

---

# TEAM KR -- MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
Single authoritative document for Team KR computation in baseball. Team KR is the roster-weighted aggregation of players' Final System KRs, split into offensive and pitching components reflecting baseball's fundamental structure: 9 position players + 5 SP + 7 RP = 21 core roster slots.

Team KR does NOT evaluate players. It consumes finalized player outputs from upstream.

## 1. Inputs (Non-Negotiable)

Per player on roster:
- Final_System_Player_KR_i (from Player System Fit layer)
- Pipeline type: Hitter or Pitcher
- Component KRs: HKR/PKR/FKR/SKR/IQKR (hitters) or VKR/CKR/DKR/RKR/IQKR (pitchers)
- Games played / games started / IP (pitchers) / AB (hitters)
- Position(s) played with games at each
- Batting order position frequency (1-9, DH)
- Rotation slot (Friday/Saturday/Sunday/midweek for SP)
- Bullpen role (CL/SU/MID/LONG for RP)
- Height, weight, bats/throws, age
- Archetype, badges, system risks, impact modifier
- System fit % for coach's selected offensive system (hitters) or pitching philosophy (pitchers)

Per program (from Coach Context):
- Governing Body / Division / Conference Class
- Offensive System + Pitching Philosophy
- Competitive level (from KLVN)

Explicit exclusions (locked):
- No individual trait recomputation
- No archetype recomputation
- No injury/fatigue modeling (that lives in Simulation Engine)

## 2. Participation Thresholds

**Hitters:** MIN_AB = max(30, 10% of team AB). Include hitter in lineup KR iff AB_i >= threshold.

**Starting Pitchers:** MIN_IP = max(20, 3 starts). Include SP in rotation KR iff meets threshold.

**Relief Pitchers:** MIN_APP = 8 appearances. Include RP in bullpen KR iff meets threshold.

Evaluation window: default = season-to-date. Can be scoped to a date range.

## 3. Team KR Master Formula

**Team_KR = (Offensive_Team_KR x 0.48) + (Pitching_Team_KR x 0.52)**

Pitching is weighted slightly higher than offense (52/48) because in baseball, pitching controls 55-60% of game outcomes. A team with elite pitching and average hitting wins more consistently than a team with elite hitting and average pitching.

### 3A. Offensive Team KR (48% of Team KR)

**Offensive_Team_KR = (Lineup_KR x 0.82) + (Bench_KR x 0.18)**

#### Lineup KR (82% of Offensive Team KR)
Weighted average of 9 lineup positions' hitter KRs.

**Lineup Position Weights (Locked):**

| Position | Weight | Rationale |
|----------|--------|-----------|
| 1 (Leadoff) | 0.128 | Most PA. Sets table. OBP critical. |
| 2 | 0.125 | High PA. Best contact + OBP combo historically. |
| 3 | 0.138 | Best overall hitter. Highest single-player impact. |
| 4 (Cleanup) | 0.132 | Primary power. RBI machine. |
| 5 | 0.115 | Secondary power / run producer. |
| 6 | 0.102 | Mid-lineup contributor. |
| 7 | 0.090 | Bottom-third anchor. |
| 8 | 0.082 | Lower lineup. |
| 9 | 0.088 | 2nd leadoff or pitcher spot (NL/college). If DH used, this is DH slot. |

Lineup_KR = Sum(Hitter_KR_i x LineupPosition_Weight_i)

If DH is used, 9th spot weight applies to DH and pitcher is excluded from lineup KR.

#### Bench KR (18% of Offensive Team KR)
Average KR of non-starting position players meeting minimum AB threshold. Bench depth critical in 56-game college season (doubleheaders, travel fatigue, platoon matchups) and 162-game pro season.

Bench_KR = Average(Bench_Hitter_KR_i)

### 3B. Pitching Team KR (52% of Team KR)

**Pitching_Team_KR = (Rotation_KR x 0.62) + (Bullpen_KR x 0.38)**

#### Rotation KR (62% of Pitching Team KR)

**College Rotation Slot Weights (Locked):**

| Slot | Weight | Rationale |
|------|--------|-----------|
| Friday Starter (Ace) | 0.34 | Highest-leverage conference game. Sets tone for series. |
| Saturday Starter | 0.28 | Second game. Win Friday + Saturday = series clinch. |
| Sunday Starter | 0.22 | Rubber match / clinch game. |
| Midweek Starter(s) | 0.16 | Split among midweek arms. Lower leverage but needed for depth. |

**Pro (MLB) Rotation Weights:**

| Slot | Weight | Rationale |
|------|--------|-----------|
| #1 Starter (Ace) | 0.26 | Franchise arm. Playoff Game 1 starter. |
| #2 Starter | 0.23 | Co-ace or clear #2. Playoff Game 2. |
| #3 Starter | 0.20 | Solid mid-rotation. |
| #4 Starter | 0.17 | Back-end. Must be competent. |
| #5 Starter | 0.14 | Depth arm. Replaceable but still 32 starts/year. |

Rotation_KR = Sum(SP_KR_i x Slot_Weight_i)

#### Bullpen KR (38% of Pitching Team KR)

**Bullpen Role Weights (Locked):**

| Role | Weight | Rationale |
|------|--------|-----------|
| Closer (9th inning) | 0.28 | Highest leverage single innings. Save situations. |
| Setup (7th-8th) | 0.28 | Bridge to closer. Often faces best hitters. |
| Middle Relief (5th-6th) | 0.24 | Innings absorption. Holds leads or limits damage. |
| Long Relief / Mop-Up | 0.12 | Low leverage but necessary for roster flexibility. |
| Matchup Specialist | 0.08 | Platoon-specific usage (LOOGY or R-on-R specialist). |

Bullpen_KR = Sum(RP_KR_i x Role_Weight_i)

## 4. System Fit Adjustment

### Offensive System Fit %
Off_SystemFit% = Average(Hitter_SystemFit%_i) for all lineup positions.

| System Fit % | Lineup_KR Modifier |
|---|---|
| >= 97% | x 1.03 |
| 92-96% | x 1.01 |
| 80-91% | x 1.00 (neutral) |
| 70-79% | x 0.98 |
| < 70% | x 0.96 |

### Pitching Philosophy Fit %
Pitch_PhilosophyFit% = Weighted_Average(Pitcher_PhilosophyFit%_i) using rotation + bullpen weights.
Same modifier table as offensive system fit applied to pitching components.

## 5. Team KR Diagnostics

### A) Offense / Pitching Split
Report: Offensive Team KR and Pitching Team KR separately. Identifies whether team is offense-driven or pitching-driven.

### B) Lineup Depth Analysis
- Lineup StdDev: low = deep lineup, high = top-heavy
- Weakest lineup position and KR
- Lineup protection chains (does #3 hitter have adequate protection behind him?)
- Platoon balance: L/R bat distribution in starting lineup

### C) Rotation Depth Analysis
- Rotation StdDev: low = deep rotation, high = ace-dependent
- Friday-to-Sunday KR drop (how much does rotation quality fall off?)
- Midweek arm quality relative to weekend

### D) Bullpen Depth Analysis
- Closer-to-setup KR gap
- Back-end relief quality
- Bullpen handedness balance (L/R availability)

### E) Vulnerability Report
Identify weakest link in each unit:
- Lineup: lowest-KR starting position player and their lineup spot
- Rotation: lowest-KR weekend starter
- Bullpen: weakest high-leverage arm
- Overall: which unit (lineup, rotation, bullpen, bench) is furthest below the others

### F) Projected Win Total
Based on Team KR, estimate expected win-loss record for level:
- D1 Power: Team KR 94+ ~ 45+ wins / 55-game schedule. Team KR 88 ~ 38-40 wins. Team KR 82 ~ 32-35 wins.
- Pro (MLB): Team KR 94+ ~ 100+ wins / 162 games. Team KR 88 ~ 88-92 wins. Team KR 82 ~ 78-82 wins.

---

# OSIE -- OFFENSIVE SYSTEM INFERENCE ENGINE

## Purpose
Infer a team's actual offensive system from production data when no Coach Context is available.

## Inference Signals (Quantitative Triggers)

### 1. Launch Angle / Power
- Team HR/FB ratio >= 15%
- Flyball rate >= 38%
- Team ISO >= .180
- K% >= 22% (accepted tradeoff for power)
- SB attempts below league average
- Lineup avg exit velocity >= 89 mph (if available)
- Confidence: 80%+ when 3+ triggers met across 30+ games

### 2. Contact / Speed
- Team BA >= .280
- Team K% <= 18%
- SB >= 80 per season (or >= 1.5 SB/game)
- SB success rate >= 78%
- Ground ball rate >= 44%
- Bunt frequency above league average (>= 1.0 sac bunts/game)
- Low ISO relative to league (<= .140)

### 3. Balanced
- No extreme lean in any direction
- OPS team average .750-.850
- HR moderate (0.6-1.0 per game)
- SB moderate (0.5-1.2 per game)
- K% between 18-23%
- BB% between 8-11%
- Default classification when no extreme triggers are met

### 4. Small Ball
- Sacrifice bunt frequency >= 1.5 per game
- SB >= 100 per season (or >= 2.0 SB/game)
- Hit-and-run frequency above league average
- Team HR below league average (< 0.5 per game)
- Team BA >= .275 with low power
- Productive out rate (advancing runners) top 25% of level

### 5. OBP-Focused
- Team BB% >= 10%
- Team OBP >= .370
- P/PA >= 3.9 (deep counts, grinding ABs)
- Patience score (pitches seen per PA) top 20% of level
- Walks may exceed K's or be within 20%
- Does NOT require high BA -- walks are the engine

## Confidence Thresholds
- >= 30 games: 75%+ confidence (3+ triggers met)
- >= 45 games: 85%+
- Full season (56 college / 162 pro): 90%+
- System can be MIXED (e.g., "Launch Angle/Power with OBP-Focused elements"): requires triggers from both with primary/secondary designation

---

# PSIE -- PITCHING SYSTEM INFERENCE ENGINE

## Purpose
Infer a team's actual pitching philosophy from production data when no Coach Context is available.

## Inference Signals (Quantitative Triggers)

### 1. Strikeout-Dominant
- Team K/9 >= 9.5
- SwStr% >= 12% (if available)
- Above-average whiff rates across staff
- May tolerate higher BB/9 (>= 3.5)
- Staff avg fastball velocity >= 92 mph (if available)
- K-BB% >= 12%

### 2. Groundball-Dominant
- Team GB% >= 48%
- Sinker/2-seam usage >= 40% of staff FB type (if pitch data available)
- Low HR/9 (<= 0.8)
- K/9 may be moderate (7.5-9.0)
- FIP closely tracks ERA (defense-dependent outcomes as intended)

### 3. Pitch-to-Contact
- Staff avg P/IP <= 15.5 (pitch efficiency)
- FPS% >= 62% (first-pitch strikes)
- BB/9 <= 2.8
- K/9 moderate-to-low (6.5-8.5)
- High QS% (starters regularly go 6+ innings)
- Staff avg IP/start >= 6.0

### 4. Bullpen-Heavy
- Avg starter IP/start <= 5.0
- Reliever IP >= 35% of total team IP
- High reliever appearance count (bullpen used 70%+ of games)
- Frequent pitching changes (>= 3 per game average)
- May employ "opener" strategy

### 5. Starter-Driven
- Avg starter IP/start >= 6.5
- Reliever IP <= 25% of total team IP
- QS% >= 55% across rotation
- Low bullpen usage
- Staff CG >= 5 per season (rare in modern baseball but signals philosophy)

## Confidence Thresholds
Same as OSIE: 30 games = 75%+, 45 games = 85%+, full season = 90%+.

---

# TEAM KR LEGENDS

## TEAM KR TIERS -- NCAA D1 POWER (v1)

| Team KR | Tier | Description |
|---------|------|-------------|
| 95-100 | National Championship Contender | Top-8 national seed. CWS favorite. Multiple All-Americans. Deep rotation + loaded lineup. |
| 91-94 | Super Regional / CWS Participant | Top-16 national seed. Legitimate CWS threat. At least one dominant unit (rotation or lineup). |
| 87-90 | Regional Host / NCAA Tournament Lock | Strong conference contender. Will host a Regional. Competitive in any series. |
| 84-86 | NCAA Tournament Participant / Bubble | Tournament berth likely. May need conference tournament run. Competitive but not dominant. |
| 80-83 | Above Average / Fringe Tournament | Winning conference record. Tournament bubble. One strong unit, one average. |
| 76-79 | Average | .500 conference record. Competitive but inconsistent. |
| 72-75 | Below Average | Losing conference record. Talent gaps in multiple areas. |
| Below 72 | Rebuilding / Non-Competitive | Significant talent deficit. Developmental roster. |

## TEAM KR TIERS -- NCAA D1 MID-MAJOR (v1)
Same structure, shifted: 93+ = Conference dominant / NCAA at-large. 88-92 = Conference contender / bubble. 84-87 = Competitive. 80-83 = Average. Below 80 = Below average.

## TEAM KR TIERS -- NCAA D2 (v1)
93+ = National tournament contender. 88-92 = Regional contender. 84-87 = Conference elite. 80-83 = Competitive. Below 80 = Below average.

## TEAM KR TIERS -- NAIA (v1)
93+ = World Series contender. 88-92 = Conference champion. 84-87 = Competitive. Below 84 = Developing.

## TEAM KR TIERS -- NJCAA D1 (v1)
93+ = JUCO World Series contender. 88-92 = Region champion. 84-87 = Conference elite. Below 84 = Developing.

## TEAM KR TIERS -- MLB (v1)

| Team KR | Tier |
|---------|------|
| 95-100 | World Series favorite. 100+ projected wins. |
| 91-94 | Playoff contender. 90-99 projected wins. |
| 87-90 | Wild Card contender. 85-92 projected wins. |
| 83-86 | Above average. 82-88 projected wins. |
| 79-82 | Average. .500 ball. 78-84 wins. |
| 75-78 | Below average. Losing record. 72-80 wins. |
| Below 75 | Rebuilding. Sub-75 wins. |

---

# SCHOLARSHIP ALLOCATION ENGINE

## Purpose
Optimize distribution of limited scholarships across roster positions.

## NCAA D1 Baseball Scholarship Rules
- 11.7 total equivalencies across 35-man roster
- Minimum 25% per scholarship recipient (no player gets less than $0.25 of a full scholarship)
- Maximum = full scholarship (1.0 equivalency to one player)
- Average split: ~0.33 equivalency per player (11.7 / 35 = 0.33 if spread evenly)
- In practice: top talent gets 0.50-1.00, depth gets 0.25-0.40, walk-ons get 0.00

## Allocation Framework

### Pitching vs Position Player Split
Recommended: 55-60% of scholarship money to pitchers, 40-45% to position players.
Rationale: pitching is 52% of Team KR weight, pitchers are harder to develop in-house (require specific coaching), and position players can be found through walk-on/portal more readily.

### Priority Allocation by Position (Scarcity-Weighted)

| Position | Scarcity Multiplier | Rationale |
|----------|-------------------|-----------|
| Friday SP (Ace) | 1.40 | Single highest-leverage player on roster |
| Saturday SP | 1.25 | Second highest-leverage |
| Closer | 1.20 | Dominant closers are rare in college |
| Catcher | 1.20 | Hardest position to fill. Defensive premium. |
| Shortstop | 1.15 | Premium defensive position. Hard to find bat + glove. |
| Center Field | 1.10 | Speed + defense + bat. Athletic premium. |
| Sunday SP | 1.10 | Third weekend arm matters. |
| Setup RP | 1.00 | Important but more fungible. |
| All other positions | 1.00 | Standard allocation. |

Formula: Player_Scholarship_Share proportional to (Player_KR x Position_Scarcity_Multiplier).

### Recruiting Class Valuation
When building a recruiting class:
- Pitching-to-hitting balance should mirror the 55/45 scholarship split
- Positional need > BPA when the need is at a scarcity position (C, SS, Friday SP)
- BPA > positional need when the need is at a fungible position (LF, 1B, midweek arm)
- Portal transfers count against scholarship budget. Factor transfer KR vs recruiting class KR.

---

# ROSTER DECISION INTELLIGENCE

## College Roster (35-Man)

### Roster Structure Template

| Category | Count | Notes |
|----------|-------|-------|
| Starting lineup | 9 | 8 fielders + DH (if used) |
| Weekend SP | 3 | Friday / Saturday / Sunday |
| Midweek SP | 1-2 | Tuesday/Wednesday games |
| Closer | 1 | 9th-inning specialist |
| Setup / High-leverage RP | 2-3 | 7th-8th inning |
| Middle RP | 2-3 | 5th-6th inning, mop-up |
| Bench position players | 5-8 | Platoon bats, defensive replacements, pinch-runners |
| Developmental | 2-4 | Redshirts, freshman projects |

### Travel Roster (27-Man)
College teams travel with 27 of 35 players. Selection criteria:
1. All 9 starting position players
2. All weekend starting pitchers + midweek arm
3. Closer + top 2-3 relievers
4. 3-4 bench position players (prioritize versatility: UTIL/platoon/speed)
5. 1-2 additional relief arms
6. Leave behind: injured players, developmental redshirts, lowest-KR roster spots

### Midweek vs Weekend Decisions
- Weekend lineup = best 9 hitters by KR + system fit
- Midweek lineup MAY rotate players: rest starters, give bench KR evaluation reps, manage workload
- Never start a player midweek who would miss weekend recovery (especially catchers)
- Midweek starting pitcher should NOT be a weekend arm on short rest

## Pro Roster (40-Man + 26-Man Active)

### 40-Man Roster Management
- Protects prospects from Rule 5 draft (must be added by age 26 / 5 years after draft)
- Mix of MLB-ready players, developing prospects, and depth
- 40-man crunch: limited spots, unlimited demand. Every addition requires either an empty spot or a DFA/trade.
- Key decisions: when to add a prospect (protecting from Rule 5 vs burning an option year), when to DFA a declining player

### 26-Man Active Roster
Standard configuration:
- 13 position players (C, C/UTIL, 1B, 2B, SS, 3B, LF, CF, RF, DH, UTIL, 2 bench)
- 13 pitchers (5 SP + 8 RP, or 4 SP + 9 RP in bullpen-heavy philosophy)

### Option Decisions
Players with minor league options can be sent to AAA without passing through waivers. Decision framework:
- If Player_KR < 78 AND has options: option to AAA for development
- If Player_KR 78-82 AND has options: option decision based on roster need (keep if no better option, send down if upgrade available)
- If Player_KR >= 83: keep on 26-man regardless of options

### DFA Decisions
Designating for assignment removes player from 40-man:
- DFA when Player_KR < 75 AND no development trajectory projecting improvement
- DFA when roster spot needed for higher-KR player or prospect protection
- Consider trade value before DFA (other teams may want the player)

### Waiver Wire Strategy
Claim players whose KR exceeds what's available in your own system at that position + role.
Priority: claim pitchers > position players (pitching is harder to acquire and develop).

---

## GOVERNANCE
- Team KR weight split (48% offense / 52% pitching) is v1 provisional
- Lineup position weights, rotation slot weights, and bullpen role weights are v1 provisional
- All inputs consumed from upstream -- no recomputation of individual KR
- System fit modifiers bounded: max +3% / -4%
- Any weight or threshold change requires versioning
