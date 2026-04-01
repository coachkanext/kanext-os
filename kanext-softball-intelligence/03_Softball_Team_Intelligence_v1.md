# SOFTBALL TEAM INTELLIGENCE
## File 03 - v1.0 (Full Operational Spec)

---

# TEAM KR - MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
Single authoritative document for Team KR computation in softball. Team KR is the roster-weighted aggregation of players' Final System KRs, split into offensive and pitching components reflecting softball's fundamental structure: 9 position players + 2-3 pitchers = 11-12 core roster slots.

Team KR does NOT evaluate players. It consumes finalized player outputs from upstream.

## 1. Inputs (Non-Negotiable)

Per player on roster:
- Final_System_Player_KR_i
- Pipeline type: Hitter or Pitcher
- Component KRs: HKR/PKR/FKR/SKR/IQKR (hitters) or VKR/CKR/DKR/RKR/IQKR (pitchers)
- Games played / games started / IP (pitchers) / AB (hitters)
- Position(s) played with games at each
- Batting order position frequency (1-9, DP)
- Pitching role (Ace / #2 / #3 / Relief)
- Height, weight, bats/throws, age
- Archetype, badges, system risks, impact modifier
- System fit % for coach's selected offensive system (hitters) or pitching philosophy (pitchers)

Per program (from Coach Context):
- Governing Body / Division / Conference Class
- Offensive System + Pitching Philosophy
- Competitive level (from KLVN)

Explicit exclusions (locked): no individual trait recomputation, no archetype recomputation, no injury/fatigue modeling.

## 2. Participation Thresholds

**Hitters:** MIN_AB = max(25, 10% of team AB). Include hitter in lineup KR iff AB_i >= threshold.
**Primary Pitchers:** MIN_IP = max(30, 5 starts). Include in circle KR iff meets threshold.
**Secondary Pitchers:** MIN_APP = 8 appearances or 15 IP.

Evaluation window: default = season-to-date.

## 3. Team KR Master Formula

**Team_KR = (Offensive_Team_KR x 0.45) + (Pitching_Team_KR x 0.55)**

Pitching is weighted higher than offense (55/45) because in softball, pitching controls 55-65% of game outcomes. The ace pitcher is the single most valuable roster position in the sport. A dominant ace can carry an average offense to the WCWS. An elite offense cannot overcome mediocre pitching consistently.

### 3A. Offensive Team KR (45% of Team KR)

**Offensive_Team_KR = (Lineup_KR x 0.85) + (Bench_KR x 0.15)**

#### Lineup KR (85% of Offensive Team KR)
Weighted average of 9 lineup positions' hitter KRs.

**Lineup Position Weights (Locked):**

| Position | Weight | Rationale |
|----------|--------|-----------|
| 1 (Leadoff) | 0.130 | Most PA. Sets table. Slapper or table setter. |
| 2 | 0.128 | High PA. Contact + OBP combo. Often slapper in slap systems. |
| 3 | 0.140 | Best overall hitter. Highest single-player impact. |
| 4 (Cleanup) | 0.135 | Primary power. RBI machine. |
| 5 | 0.118 | Secondary power / run producer. |
| 6 | 0.105 | Mid-lineup contributor. |
| 7 | 0.092 | Bottom-third anchor. |
| 8 | 0.080 | Lower lineup. |
| 9 | 0.072 | 9th spot. Often weakest bat or defensive specialist. |

Lineup_KR = Sum(Hitter_KR_i x LineupPosition_Weight_i)

Note: DP and FLEX interact with lineup. DP bats and may or may not play defense. FLEX plays defense and may or may not bat. If DP is in lineup, she occupies a batting position. If FLEX bats, she also occupies a batting position and the DP no longer exists for that at-bat.

#### Bench KR (15% of Offensive Team KR)
Average KR of non-starting position players meeting minimum AB threshold. Bench is smaller in softball (20-25 player rosters vs 35 in baseball).

### 3B. Pitching Team KR (55% of Team KR)

**Pitching_Team_KR = (Circle_KR x 0.80) + (Depth_Pitcher_KR x 0.20)**

Note: "Circle" = the pitching circle (softball equivalent of the mound). The primary 1-2 pitchers who pitch the vast majority of innings.

#### Circle KR (80% of Pitching Team KR)

**Pitching Staff Slot Weights (Locked):**

| Slot | Weight | Rationale |
|------|--------|-----------|
| Ace (#1 Pitcher) | 0.60 | Pitches 55-70% of all innings. Single most important player on roster. |
| #2 Pitcher | 0.40 | Pitches 25-40% of innings. Rest day ace, tournament depth. |

In a Dual-Ace system: Ace = 0.52, #2 = 0.48 (more evenly split).
In a Committee system: #1 = 0.40, #2 = 0.35, #3 = 0.25.

Circle_KR = Sum(Pitcher_KR_i x Slot_Weight_i)

#### Depth Pitcher KR (20% of Pitching Team KR)
Average KR of non-primary pitchers meeting minimum appearance threshold. Depth is critical for tournament weekends when aces need rest.

## 4. System Fit Adjustment

### Offensive System Fit %
Off_SystemFit% = Average(Hitter_SystemFit%_i)

| System Fit % | Lineup_KR Modifier |
|---|---|
| >= 97% | x 1.03 |
| 92-96% | x 1.01 |
| 80-91% | x 1.00 |
| 70-79% | x 0.98 |
| < 70% | x 0.96 |

### Pitching Philosophy Fit %
Same modifier table applied to pitching components.

## 5. Team KR Diagnostics

### A) Offense / Pitching Split
Report Offensive Team KR and Pitching Team KR separately.

### B) Lineup Depth Analysis
- Lineup StdDev: low = deep, high = top-heavy
- Weakest lineup position and KR
- Slap hitter distribution: how many LHB slappers in lineup? (system-relevant)
- L/R bat distribution
- Lineup protection chains

### C) Pitching Staff Analysis
- Ace-to-#2 KR gap (large gap = ace-dependent)
- Circle depth (can team survive 3-game weekend with available arms?)
- Tournament endurance projection (can staff handle 5 games in 3 days?)

### D) Vulnerability Report
- Weakest lineup position
- Pitching depth concern (if ace KR > #2 KR by 8+ points = single point of failure)
- Which unit (lineup, circle, bench, depth pitching) is furthest below the others

### E) Projected Win Total
- D1 Power: Team KR 94+ ~ 48+ wins. Team KR 88 ~ 40-44 wins. Team KR 82 ~ 33-37 wins.

---

# OSIE - OFFENSIVE SYSTEM INFERENCE ENGINE

## Purpose
Infer a team's actual offensive system from production data when no Coach Context is available.

## Inference Signals

### 1. Power/Launch
- Team HR >= 60 per season (>= 1.0/game), team ISO >= .170, team SLG >= .470
- K% >= 20% (accepted trade-off), SB attempts below league average

### 2. Slap-and-Run
- 3+ left-handed batters in lineup, team SB >= 100, bunt attempts >= 1.5/game
- Team BA >= .300, team HR below league average, high ground ball rate

### 3. Contact/Speed
- Team BA >= .290, K% <= 16%, SB >= 80, moderate HR (0.4-0.8/game)

### 4. Balanced
- No extreme lean. OPS .750-.900, moderate HR, moderate SB.

### 5. Small Ball
- Sac bunt >= 1.5/game, SB >= 100, hit-and-run frequency above average, team HR below league avg

## Confidence: 30 games = 75%+, 45 games = 85%+, full season = 90%+.

---

# PSIE - PITCHING SYSTEM INFERENCE ENGINE

### 1. Ace-Dominant
- One pitcher accounts for >= 55% of team IP, that pitcher's ERA significantly below staff average

### 2. Dual-Ace
- Two pitchers each account for 30-50% of team IP, both with ERA within 0.50 of each other

### 3. Committee
- Three or more pitchers each account for 20-35% of team IP

### 4. Strikeout-Dominant
- Staff K/7 >= 9.5, lead pitcher K/7 >= 11.0

### 5. Movement/Deception
- Staff GB% >= 48%, HR/7 <= 0.3, K/7 moderate (6.0-9.0)

Confidence: same thresholds as OSIE.

---

# TEAM KR LEGENDS

## TEAM KR TIERS - NCAA D1 POWER (v1)

| Team KR | Tier | Description |
|---------|------|-------------|
| 95-100 | National Championship Contender | Top-8 national seed. WCWS favorite. Multiple All-Americans. Dominant ace + loaded lineup. |
| 91-94 | Super Regional / WCWS Participant | Top-16 seed. Legitimate WCWS threat. At least one dominant unit. |
| 87-90 | Regional Host / NCAA Tournament Lock | Strong conference contender. Will host Regional. |
| 84-86 | NCAA Tournament Participant / Bubble | Tournament berth likely. May need conference tournament run. |
| 80-83 | Above Average / Fringe Tournament | Winning conference record. Bubble team. |
| 76-79 | Average | .500 conference record. Competitive but inconsistent. |
| 72-75 | Below Average | Losing conference record. Talent gaps. |
| Below 72 | Rebuilding | Significant talent deficit. |

## TEAM KR TIERS - Other Levels (v1)
D1 Mid-Major: 93+ conference dominant, 88-92 contender, 84-87 competitive, 80-83 average, <80 below avg.
D2: 93+ national contender, 88-92 regional contender, 84-87 conference elite, 80-83 competitive, <80 below avg.
NAIA: 93+ World Series contender, 88-92 conference champion, 84-87 competitive, <84 developing.
NJCAA D1: 93+ national contender, 88-92 region champion, 84-87 conference elite, <84 developing.

---

# SCHOLARSHIP ALLOCATION ENGINE

## NCAA D1 Softball Scholarship Rules
- 12 total fully countable scholarships (NOT equivalencies like baseball)
- Each scholarship is a full ride or partial - no minimum percentage requirement
- 20-25 player roster means 12 scholarships cover roughly half the team
- Walk-ons are common for roster depth

## Allocation Framework

### Pitching vs Position Player Split
Recommended: 50-55% to pitchers (6-7 scholarships), 45-50% to position players (5-6 scholarships).
Rationale: pitching is 55% of Team KR weight. The ace is the single most valuable player. Securing two quality pitchers is the foundation of every competitive program.

### Priority Allocation by Position (Scarcity-Weighted)

| Position | Scarcity Multiplier | Rationale |
|----------|-------------------|-----------|
| Ace (#1 Pitcher) | 1.50 | Highest-leverage player in all of softball |
| #2 Pitcher | 1.30 | Tournament depth requires quality second arm |
| Catcher | 1.25 | Hardest position player to fill. Must handle ace's arsenal. |
| Shortstop | 1.15 | Premium defensive position |
| Center Field | 1.10 | Speed + defense + bat |
| All other positions | 1.00 | Standard allocation |

### Recruiting Class Valuation
- Pitching-to-hitting balance should mirror 50-55%/45-50% split
- Pitcher recruiting is THE priority - you can find hitters in the portal, but elite pitchers are rare
- Positional need > BPA at scarcity positions (C, SS, pitching)
- Portal transfers count against scholarship budget

---

# ROSTER DECISION INTELLIGENCE

## College Roster (20-25 Players)

### Roster Structure Template

| Category | Count | Notes |
|----------|-------|-------|
| Starting lineup | 9 | 8 fielders + DP (or 9 fielders if no DP/FLEX) |
| Primary pitchers | 2 | Ace + #2 (potentially co-aces) |
| Third pitcher | 1 | Depth/relief/change-of-pace |
| Bench position players | 4-6 | Pinch-hitters, pinch-runners, defensive replacements |
| Developmental | 2-4 | Redshirts, freshman projects |

### Tournament Roster Decisions
Softball tournaments (regional, super regional, WCWS) require managing pitcher workload across 3-5 games in 2-3 days.
- Game 1: Ace starts
- Game 2: #2 starts (same day or next day)
- Game 3 (if needed): Ace on 1 day rest OR #3 if available
- Loser's bracket / elimination: Ace returns regardless of rest
- Championship: Ace starts, full send

The team's pitching depth directly determines tournament viability. Teams with only one quality pitcher face elimination-bracket disadvantage.

---

## GOVERNANCE
- Team KR weight split (45% offense / 55% pitching) is v1 provisional
- Lineup weights, circle weights are v1 provisional
- All inputs consumed from upstream - no recomputation of individual KR
- System fit modifiers bounded: max +3% / -4%
- Any weight or threshold change requires versioning
