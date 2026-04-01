# SOFTBALL PLAYER EVALUATION PROCESS
## File 01 - v1.0 (Full Operational Spec)

---

# COACH CONTEXT SETUP

## COACH CONTEXT SETUP - v1 (LOCKED)

### Purpose
Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. Program Name
2. Governing Body - NCAA, NAIA, NJCAA, CCCAA, NWAC, USCAA, NCCAA
3. Division (if applicable) - NCAA: D1/D2/D3, NJCAA: D1/D2/D3, NCCAA: D1/D2
4. Conference Class (required only if NCAA D1) - Power, Mid-Major, Low-Major
5. Offensive System - must match one of the 5 defined offensive systems: Power/Launch, Slap-and-Run, Contact/Speed, Balanced, Small Ball
6. Pitching Philosophy - must match one of the 5 defined pitching philosophies: Ace-Dominant, Dual-Ace, Committee, Strikeout-Dominant, Movement/Deception

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

### Optional Metadata
1. Conference - non-blocking. Used by KLVN for D1 class auto-assignment.
2. Park/Field Factor - if home field has known run environment bias (e.g., fence distances, altitude, turf vs dirt, wind patterns)

### Optional Constraints (Downstream Only)
Do not alter trait scoring or KR computation. Consumed by downstream planning only.
1. Scholarships Available - NCAA D1: 12 fully countable (not equivalencies). NCAA D2: 7.2 equivalencies. NAIA: varies (up to 12). NJCAA D1: 24. NCAA D3: 0 (no athletic scholarships).
2. Institutional / Merit Aid Capacity
3. Operating Budget
4. Recruiting Budget
5. Roster Size Target - 20-25 standard for college softball
6. Staffing Capacity Band - Lean, Standard, Elite

### Context Lock
When all required fields (1-6) are populated and validated, system state transitions to Coach Context Locked. Cannot be modified mid-evaluation without restarting the pipeline.

### Governance
System names in fields 5 and 6 must exactly match the UI System Set. Governing body, division, and conference class must exactly match KLVN level keys.

---

# PLAYER PROFILE

## Hitter Profile (Auto-Populated Record)

### A) Identity
- Full legal name, known aliases
- Date of birth, age (derived)
- Height (current) + height history
- Weight (current) + weight history
- Bats: L / R / S (switch)
- Throws: L / R
- Declared position(s) (source-listed: C, 1B, 2B, 3B, SS, LF, CF, RF, DP, FLEX, UTIL)
- City/Town of origin, state/province, country
- High school, travel ball organization (e.g., USA Elite, Athletics Mercado, Firecrackers, Texas Bombers, Batbusters, Impact Gold, EC Bullets)
- Current team affiliation

### B) Career Record (Season-by-Season)
For each competitive season: team name, league/competition level, season/year, dates active. Note: softball does not have a comparable summer wood bat league system like baseball. Relevant off-season competition includes USA Softball national team tryouts, international tournaments, and All-Star showcases.

### C) Raw On-Field Production - HITTING (Season-by-Season)
- Games played, games started, at-bats, plate appearances
- Hits, doubles, triples, home runs, RBI, runs scored
- Walks (BB), intentional walks (IBB), strikeouts (K), hit by pitch (HBP)
- Sacrifice hits (SH - includes sacrifice bunts), sacrifice flies (SF)
- Stolen bases (SB), caught stealing (CS), SB%
- Ground into double play (GIDP)
- Batting average (BA), on-base percentage (OBP), slugging percentage (SLG), OPS
- Isolated power (ISO = SLG - BA)
- Slap hitting stats (where tracked): bunt-for-hit attempts and success rate, slap contact rate, drag bunt success rate, directional slap placement (left side/right side/up middle)
- Advanced (where available): wRC+, wOBA, BABIP, BB%, K%, hard hit %, exit velocity (avg/max), launch angle, barrel %, sprint speed

### D) Raw On-Field Production - FIELDING (Season-by-Season)
- Position(s) played, games at each position, innings at each position
- Putouts (PO), assists (A), errors (E), fielding percentage (FPCT)
- Double plays turned (DP)
- Outfield assists (OF only)
- Catcher-specific: innings caught, passed balls, wild pitches allowed, caught stealing %, pop time (if available), pitch framing, blocking
- Advanced (where available): range factor, total chances per game

### E) Academic Record (Public/Declared Only)
GPA, academic honors, eligibility status, declared major

### F) Declared Medical Information (Public Only)
Declared injuries, medical redshirt designations. Pregnancy/postpartum status if publicly declared (for suppression detection only - never speculated).

### G) Source Attribution + Trust Metadata
Source for each element, verification status (verified / unverified), known coverage gaps

### Locked Exclusions
Never in Player Profile: evaluations/ratings/KRs, attributes, badges, archetypes, private medical/disciplinary, subjective recruiting opinions

---

## Pitcher Profile (Auto-Populated Record)

### A) Identity
Same as Hitter Profile identity fields, plus:
- Throws: L / R - primary arm
- Primary Role: SP (Starting Pitcher) / RP (Relief Pitcher) / ACE (designated ace who carries the workload)
- Pitching Style: Underhand (standard softball delivery). Note: ALL softball pitching is underhand from 43 feet. There is no overhand pitching in softball.

### B) Career Record
Same as Hitter Profile

### C) Raw On-Field Production - PITCHING (Season-by-Season)
- Games (G), games started (GS), complete games (CG), shutouts (SHO), no-hitters, perfect games
- Wins (W), losses (L), saves (SV)
- Innings pitched (IP), batters faced (BF)
- Hits allowed (H), runs (R), earned runs (ER), home runs allowed (HR)
- Walks (BB), intentional walks (IBB), strikeouts (K), hit batters (HBP)
- Wild pitches (WP)
- ERA, WHIP, K/7 (strikeouts per 7 innings - SOFTBALL STANDARD, not K/9), BB/7, K/BB ratio, HR/7, opponent BA, opponent OBP
- WORKLOAD CONTEXT: College softball aces routinely pitch 250-350+ IP per season. A pitcher with 300 IP is working a normal ace workload, not being overworked. Evaluate IP totals against softball norms:
  - Elite ace workload: 300-350+ IP
  - Standard ace workload: 220-300 IP
  - Committee pitcher: 120-220 IP
  - Specialist/reliever: 40-120 IP
- Advanced (where available): FIP, opponent OPS, GB%, FB%, LD%, first-pitch strike %, pitch mix (rise%/drop%/change%/curve%/screw%/other%), average pitch speed, max pitch speed, spin rates by pitch type
- Arsenal Description: list of pitches thrown (rise ball, drop ball, change-up, curve, screwball, drop curve, rise curve) with grade, usage %, and primary/secondary/show designation
- Tournament performance: ERA and K/7 in multi-game tournament weekends (measures endurance and fatigue resistance)

### D) Fielding as Pitcher
Pitcher fielding: PO, A, E, FPCT. Bunt defense grade (critical in softball where bunting is far more prevalent than baseball).

### E) Pitcher Hitting (if applicable)
In softball, pitchers frequently bat in the lineup (no universal DH). If pitcher bats:
- Full hitting stat line from Section C of Hitter Profile
- If pitcher is also an impact bat, may trigger Two-Way Player Protocol

### F-G) Same as Hitter Profile (Academic, Medical including pregnancy/postpartum, Source Attribution, Locked Exclusions)

---

## Two-Way Player Protocol

### When It Activates
A player qualifies as a Two-Way candidate when BOTH of the following are true in the same season:
- Hitter: >= 50 AB
- Pitcher: >= 50 IP (SP) or >= 30 IP (RP)

Note: Thresholds are higher than baseball because softball aces pitch far more innings. A pitcher with only 30 IP as a reliever must show impactful relief production to qualify for dual evaluation.

### Execution
1. Run the FULL Hitter Pipeline (Phase 3 anchor -> Phase 6 components -> Final Hitter KR)
2. Run the FULL Pitcher Pipeline (Phase 3 anchor -> Phase 6 components -> Final Pitcher KR)
3. Compute Combined KR using contribution-weighted blend:

**Combined_KR = (Hitter_KR x Hitter_Weight) + (Pitcher_KR x Pitcher_Weight)**

Default weights:
- If primary role = position player who also pitches: 60% Hitter / 40% Pitcher
- If primary role = pitcher who also bats well: 40% Hitter / 60% Pitcher
- If truly balanced (similar PA and IP contribution): 50% / 50%

Adjust weights based on actual playing time distribution (PA vs IP as % of team totals).

4. Output BOTH individual evaluations plus Combined KR
5. Apply Two-Way Premium badge if BOTH individual KRs >= 80

### Two-Way in Softball Context
Two-way players are more common in softball than baseball because:
- Pitchers regularly bat in the lineup (no universal DH rule, DP/Flex rules are different)
- Smaller rosters (20-25 vs 35) mean multi-role players have higher value
- Many elite travel ball players pitch AND hit at high levels through high school
- The DP/Flex rule allows a player to be in the lineup as both a position player and the designated player

---

# PLAYER CONFIDENCE GATE

## Confidence Gate - v1

### Purpose
Determines whether enough data exists to produce a reliable evaluation. Runs BEFORE the evaluation pipeline begins.

### Gate Check
All evaluations require a minimum data threshold. If the threshold is not met, the evaluation is flagged as LOW CONFIDENCE and the output includes explicit caveats about which data is missing and how that limits accuracy.

### Minimum Data Thresholds

**HITTER (must have at minimum):**
- 75+ PA in at least one competitive season at the stated level
- Basic stat line: BA, OBP, SLG, HR, RBI, SB, BB, K, FPCT
- Position confirmed (not just "UTIL" without games at a specific position)

**PITCHER (must have at minimum):**
- 40+ IP in at least one competitive season at the stated level
- Basic stat line: ERA, WHIP, K/7, BB/7, IP, W-L
- Role confirmed (SP vs RP)

**TWO-WAY (must meet BOTH):**
- Hitter minimum: 50+ AB
- Pitcher minimum: 50+ IP (SP) or 30+ IP (RP)

### Confidence Levels

| Level | Label | Criteria |
|---|---|---|
| A | Full Confidence | 2+ seasons of data at stated level, comprehensive stat line, verified identity, awards/honors data |
| B | Standard Confidence | 1 season of full data at stated level, stat line meets minimums, identity verified |
| C | Limited Confidence | Meets minimum thresholds but single-season sample, some stats missing, identity partially verified |
| D | Insufficient | Below minimum thresholds. Evaluation blocked or flagged as PROJECTION ONLY |

### Gate Failure Protocol
If Gate = D (Insufficient):
1. State explicitly what data is missing
2. If any data exists, provide a CONTEXTUAL MODE estimate (not a full evaluation)
3. Flag output as PROJECTION_ONLY with confidence capped at 30%
4. Recommend specific data needed to upgrade confidence tier

---

# PLAYER EVALUATION ENGINE - MASTER EXECUTION FLOW

## Pipeline Steps (Mandatory Order)

### STEP 0: COACH CONTEXT CHECK
Verify Coach Context is locked. If not, block evaluation and request context setup.

### STEP 1: DATA INGESTION
Pull Player Profile from pool. Run Data Gathering Protocol (File 07 SKILL). Compile all available stats, metadata, and web-sourced context.

### STEP 2: CONFIDENCE GATE
Run Confidence Gate check. If Gate = D, route to Contextual Mode (abbreviated output). If Gate = A/B/C, proceed with full pipeline.

### STEP 3: PHASE 3 - PRODUCTION ANCHOR (PRIMARY KR DETERMINANT)

**THIS IS THE MOST IMPORTANT STEP.** The production anchor sets the KR range. Everything else adjusts within this range.

Read the KR Legend at the player's level (File 02 or standalone legend file). Map the player's FULL production profile against the legend tier descriptions. Find the tier that matches.

**FOR HITTERS:** Map BA, OBP, SLG, OPS, HR, RBI, SB, BB%, K%, fielding quality, awards, team success, postseason performance (Regionals, Super Regionals, WCWS).

**FOR SLAPPERS:** Map BA, OBP, SB, bunt-for-hit success rate, slap contact rate, runs manufactured, on-base production. Do NOT anchor slappers on power metrics. A slapper with .420/.490/40 SB/85% bunt success is elite regardless of 0 HR.

**FOR PITCHERS:** Map ERA, WHIP, K/7, BB/7, K/BB, IP (in softball context - 250-350 normal for aces), opponent BA, saves (if RP), awards, team success, postseason performance. Note: use K/7, not K/9. Softball games are 7 innings.

The tier's KR range IS the anchor. Write it down before proceeding.

**CRITICAL RULE: Anchor against production profile numbers, not award labels.** "All-American = 95+" is a label. The production profile numbers are the anchor.

### STEP 4: PHASE 6 - COMPONENT KR SCORING

Score each component KR from available data. Each component is on the 0-100 scale.

**HITTER COMPONENTS:**
- HKR (Hitting KR) - batting average, contact quality, bat-to-ball, hit tool, batting eye, situational hitting, slap hitting proficiency (if applicable)
- PKR (Power/Plate Discipline KR) - walk rate, strikeout rate, chase rate, power (HR, ISO, SLG), barrel rate, hard hit rate, exit velocity
- FKR (Fielding KR) - fielding percentage, range factor, errors, arm strength, double plays, positional difficulty
- SKR (Speed/Baserunning/Slap KR) - stolen bases, SB success rate, sprint speed, slap-and-run execution, bunt-for-hit proficiency, drag bunt success, extra bases taken
- IQKR (Softball IQ KR) - plate approach adjustments, two-strike approach, situational awareness, baserunning decisions, bunt/slap decision-making, defensive positioning instincts, clutch performance

**PITCHER COMPONENTS:**
- VKR (Velocity/Stuff KR) - pitch speed (underhand context: 65+ elite, 60-64 above average, 55-59 average), spin rates, movement profiles (rise ball action, drop ball depth, screwball movement), whiff rates
- CKR (Command/Spin Control KR) - walk rate, zone %, first-pitch strike %, location precision, ability to tunnel rise and drop, spin axis consistency
- DKR (Durability/Workload KR) - innings pitched (250-350+ normal for aces), complete games, tournament endurance (3-5 games in 3 days), back-to-back day performance, fatigue resistance across season
- RKR (Repertoire KR) - number of quality pitches (rise, drop, change, curve, screwball, drop curve, rise curve), pitch mix diversity, ability to turn lineup over 2-3 times per game, platoon resistance (L/R splits)
- IQKR (Pitching IQ KR) - pitch sequencing, speed changes, location sequencing, hitter memory/patterns, game-calling, hold runners, fielding position, tournament management (conserve vs attack)

DO NOT invent modifier systems, point additions, or arbitrary scoring formulas. Component KRs are estimated from data using softball judgment.

### STEP 5: PHASE 6 ADJUSTS WITHIN PHASE 3 +/- 10

The final KR must fall within the Phase 3 anchor range expanded by 10 in either direction. The component KRs tell you the DIRECTION within the window:
- If Phase 6 confirms the production anchor: Final KR at or above midpoint
- If Phase 6 reveals hidden weaknesses: Final KR pushed toward bottom
- If Phase 6 reveals hidden strengths: Final KR pushed toward top

If Phase 6 produces a number more than 10 points below Phase 3 low, the trait scores are too conservative. Re-examine. The component KRs NEVER override the production anchor.

### STEP 6: LEVEL TIER MAP (MANDATORY)

Show what the final KR means at every relevant level. Format:
- At [home level]: [tier label from that level's legend]
- At [next level up]: [tier label]
- Continue for all relevant levels

This is one of the most valuable outputs for recruiting and transfer portal evaluation.

### STEP 7: OUTPUT ASSEMBLY

Every evaluation MUST include ALL of the following:
- Player identity (name, school, level, position(s), class, height/weight, bats/throws, hometown)
- Season stats with context
- Phase 3 production anchor with legend tier citation
- Final KR (single number) with range and confidence %
- Component KRs (all 5, each with 1-2 sentence justification)
- Level Tier Map (mandatory)
- Key strengths (2-4 observations)
- Key weaknesses (2-4 observations)
- Badges if applicable
- Suppression flags if applicable

---

# CONTEXTUAL MODE

## When It Runs
- Confidence Gate = D (insufficient data for full pipeline)
- Quick-look requests where full pipeline is not needed
- Legend calibration checks
- Partial data scenarios (transfer portal prospect with only freshman stats)

## What It Does
Produces a KR ESTIMATE (not a full KR) using whatever data is available. Skips full component scoring. Uses pattern matching against legend tiers with explicit caveats.

## Output Format
- Player identity (whatever is known)
- Available stats with context
- KR ESTIMATE (range only, no single number)
- Confidence: CONTEXTUAL (capped at 30%)
- What data is needed to upgrade to full evaluation
- 1-2 key observations from available data

## Governance
- Contextual Mode output is flagged as CONTEXTUAL_ESTIMATE
- Never treated as truth input for downstream engines (Team KR, Simulation, etc.)
- Superseded immediately when full data becomes available

---

# SUPPRESSION DETECTION RULES

## Purpose
Suppression detection identifies when a player's stats understate their true ability due to external factors. The system detects suppression, adjusts evaluation accordingly, and documents the evidence.

## CRITICAL: Suppression adjusts the INTERPRETATION of stats, not the stats themselves. Raw numbers are never modified. The system recognizes that the production profile is artificially compressed and evaluates the player at their likely true ability level.

## Hitter Suppression Indicators

**1. Role Suppression (Hitter)**
Trigger: Player with impact-level talent limited to pinch-hitting, late-inning defense, or partial starts due to roster depth or coaching preference.
Impact: Low AB count artificially limits counting stats. Per-PA rates may be more telling than totals.
Detection: Player has < 100 AB despite being healthy all season. OR player starts < 50% of games but per-PA production (OPS, BB%, K%) exceeds team starters at same position.

**2. Injury Suppression**
Trigger: Player missed significant time or played through injury that limited performance.
Impact: Counting stats suppressed. Rate stats may be affected if playing through pain.
Detection: Games played < 70% of team games AND pre-injury rate stats were materially better (15%+ higher OPS, 20%+ higher BA). Medical redshirt or DL designation. Coach confirmation of injury.

**3. Freshman Adjustment Suppression**
Trigger: First-year player at a new competitive level showing improvement trajectory within the season.
Impact: Full-season stats dragged down by early-season adjustment period.
Detection: Second-half stats (post-conference play start) are 20%+ better than first-half stats. BA, OPS, or K% improve meaningfully after first 15 games.

**4. Competition Level Jump**
Trigger: Transfer from lower level (JUCO, D2, NAIA) to higher level (D1 Power). Production dip is expected during adjustment.
Impact: First-season stats at new level understate the player's true ceiling.
Detection: Prior-level stats were elite (top 10% of that level) AND new-level stats show decline of 20-40% but are still above average at new level. KLVN lambda gap between levels is significant (> 0.100).

**5. Lineup Protection Void**
Trigger: Hitter has no quality bats protecting them in lineup. Opponents pitch around the hitter intentionally.
Impact: OBP inflated by non-competitive walks. BA may be suppressed (fewer hittable pitches). HR may be suppressed.
Detection: IBB >= 5 in a season (softball IBBs are less common than baseball), OR BB% > 18% with sub-.300 BA, OR next-lineup-spot hitter has OPS < .500.

**6. Slap Hitter in Power System**
Trigger: A natural slapper forced into a power-oriented offensive system that values launch angle and home runs.
Impact: Slap skills are suppressed. Player may be swinging for power instead of using natural speed/contact game. BA depressed, K% elevated vs typical slapper profile.
Detection: Player is L-handed, listed as OF or INF, has elite speed (SB count) but surprisingly low BA and high K% for their speed profile. Prior level or travel ball data shows slap-dominant approach. Coach Context offensive system = Power/Launch.

## Pitcher Suppression Indicators

**7. Run Support Suppression**
Trigger: Quality pitcher on team that scores few runs. W-L record is poor despite strong underlying metrics.
Impact: W-L dramatically understates pitcher quality. ERA may be slightly inflated from pressing in close games.
Detection: Team runs scored per game < 2.5 (softball context) AND pitcher FIP < ERA by >= 0.50.

**8. Role Suppression (Pitcher)**
Trigger: Pitcher with ace-quality stuff used in relief or committee role due to roster depth, coaching preference, or presence of another ace.
Impact: IP artificially limited. Stats may look excellent but sample is small and potentially against weaker lineups.
Detection: VKR traits suggest ace capability but player has 0-2 starts. Or: player has < 100 IP despite being healthy all season and having ace-quality arsenal. Or: pitcher is the clear #2 behind a dominant ace but would be the #1 at most comparable programs.

**9. Workload Management Suppression**
Trigger: Pitcher's IP capped by coaching decision (protecting arm for postseason, managing freshman, multi-pitcher philosophy). Low IP does not equal low durability.
Impact: DKR artificially penalized by low IP count that doesn't reflect ability to carry workload.
Detection: Pitcher is healthy, available, and effective (ERA < team average) but IP/appearance averages decline in second half. Or: pitcher is shut down for weekday games but available for weekend series. Coach confirmation of workload management.

**10. Defense Suppression (Pitcher)**
Trigger: Quality pitcher behind a poor defensive team. Errors and misplays inflate ERA.
Impact: ERA overstates pitcher's actual quality. BABIP may be inflated. FIP is more accurate.
Detection: Team defensive efficiency below .940 AND pitcher's FIP < ERA by >= 0.70.

**11. Pregnancy/Motherhood Suppression (MANDATORY DETECTION)**
Trigger: Player missed significant time due to pregnancy, childbirth, or postpartum recovery. Extended absence that creates a production gap.
Impact: Season(s) of missed production. Return-to-play stats may show adjustment period. Career counting stats suppressed by absence. Physical changes may affect performance profile temporarily.
Detection: Gap of 6+ months with no competition data, followed by return to competition. Publicly declared pregnancy/motherhood. Change in body composition data between pre-absence and post-return. Eligibility clock extensions (NCAA allows pregnancy hardship waivers).
Adjustment: Pre-pregnancy KR is preserved as the anchor. Return-to-play data is evaluated for trajectory (improving, stable, declining). If return stats approach 85%+ of pre-pregnancy production within 2 seasons, KR is adjusted upward toward pre-pregnancy level. If return stats exceed pre-pregnancy production, KR is set to current production level.
CRITICAL: Never speculate about pregnancy. Only apply this rule with publicly available or officially declared information.

## Pitcher-Specific Softball Context

**12. Rise Ball Suppression**
Trigger: Pitcher's primary weapon is the rise ball but opponent batters are disciplined enough to lay off high pitches consistently at this level.
Impact: At lower levels, the rise ball generated massive strikeout numbers. At higher levels, disciplined hitters take rise balls for balls, forcing the pitcher to come into the zone with other pitches. K/7 drops, BB/7 may actually look fine, but the pitcher's dominant pitch is less effective.
Detection: K/7 dropped 30%+ from prior level while BB/7 stayed stable or improved. Pitcher has elite rise ball velocity/spin but hitters are not chasing.

**13. Tournament Fatigue Masking**
Trigger: Pitcher's season stats are split between fresh-arm weekday games and fatigued tournament weekends.
Impact: Season ERA is an average of dominant fresh-arm performances and fatigued tournament performances. The average masks both the ceiling and the floor.
Detection: Weekday/single-game ERA is significantly better (1.00+ lower) than weekend tournament ERA. Or: pitcher's stats in the first game of a series are dramatically better than the third game. This is not a weakness per se - it reveals the true range of the pitcher under different workload conditions.

---

# MULTI-LEVEL PLAYER PROTOCOL

## When It Applies
Player competes across multiple governing body levels in a single career or season (e.g., JUCO to D1 transfer, D2 to D1, NAIA to D1 Mid-Major, high school to college).

## Execution
1. Each level's data evaluated separately through Phases 1-3, producing level-specific stat lines and raw KR ranges
2. The HIGHEST-LEVEL data carries the most interpretive weight for KR estimation
3. Lower-level data CONFIRMS capabilities that higher-level data cannot show due to suppression or small sample
4. Cross-level stat divergence is a signal - when stats diverge 40%+ between levels, it indicates context suppression at the higher level
5. Final KR anchored to the highest level with meaningful data, lower-level data fills gaps
6. KLVN lambdas applied when translating final KR to legends for Level Tier Map

### Softball-Specific Multi-Level Notes
- JUCO-to-D1 transfer is extremely common in college softball, especially from strong JUCO programs (Central Arizona, Seminole State, etc.)
- Bat transition is not a factor between college levels (same bat rules across NCAA/NAIA/NJCAA)
- Pitching adjustments are significant because hitter discipline increases dramatically from JUCO to D1 Power - rise ball-dependent pitchers often see the biggest stat drops
- Competition quality jump from NJCAA to D1 Power is significant (lambda gap ~0.220) - production drops of 25-35% are normal and do NOT indicate the player got worse
- Speed and slap hitting translate well across levels because they are athlete-dependent skills, not level-dependent
- Pitcher velocity is consistent across levels (velocity does not change because the league changed). Command, pitch recognition by hitters, and overall results may shift, but stuff is stuff.

---

# V1 EVALUATION PROTOCOL - SOFTBALL v1.0

## Purpose
Defines how the pipeline operates at V1 data tier (box score + advanced composites). Combines production-based anchoring (Phase 3) with component KR math (Phase 6).

## Data Available at V1

**HITTERS:** G, AB, PA, H, 2B, 3B, HR, RBI, R, BB, K, HBP, SB, CS, BA, OBP, SLG, OPS, ISO. Advanced (derived): wRC+, wOBA, BABIP, BB%, K%. Fielding: PO, A, E, FPCT, DP. Catcher: CS%, PB. Slap stats (where tracked): bunt attempts, bunt-for-hit success rate.

**PITCHERS:** G, GS, W, L, SV, IP, H, R, ER, HR, BB, K, ERA, WHIP, K/7, BB/7, K/BB, opponent BA. Advanced (derived): FIP, CG, SHO, no-hitters.

**NOT available at V1 (requires pitch-tracking/Rapsodo/FlightScope):** Pitch speed, spin rate, spin axis, movement profiles, exit velocity, barrel rate, launch angle, sprint speed, pitch-level data, zone%, chase rate, whiff rates by pitch, framing data.

## THE FIVE STEPS

### STEP 1: COACH CONTEXT
Set program, level, governing body, division, conference class, offensive system, pitching philosophy. Same as standard pipeline Step 0.

### STEP 2: PHASE 3 - PRODUCTION ANCHOR

**HITTER ANCHOR:** Map full production profile against HITTER TRACK of KR Legend at player's level. Key inputs: BA, OBP, SLG, OPS, HR, RBI, SB, wRC+ (if available), fielding position and quality, awards (NFCA All-American, All-Region, All-Conference), team success (Regionals, Super Regionals, WCWS).

**SLAPPER ANCHOR:** For identified slappers, anchor on: BA, OBP, SB, SB%, bunt-for-hit success (if tracked), runs scored, triples. Do NOT anchor on HR, SLG, or ISO. A .420/.490/40 SB slapper is elite production regardless of zero HR.

Example: A D1 Power hitter with .350/.430/.610, 20 HR, 70 RBI, 15 SB, NFCA First Team All-American on a WCWS team maps to 95-97 tier. Anchor: 95-97.

**PITCHER ANCHOR:** Map full production profile against PITCHER TRACK of KR Legend. Key inputs: ERA, WHIP, K/7, BB/7, K/BB, IP (in softball context), W-L, FIP, CG, no-hitters, awards, team success.

Example: A D1 Power SP with 1.20 ERA, 10.5 K/7, 0.85 WHIP, 280 IP, 30-5, NFCA All-American on a Super Regional team maps to 93-95 tier. Anchor: 93-95.

### STEP 3: PHASE 6 - COMPONENT KR MATH

**HITTER COMPONENT KRs at V1:**
- HKR: Score from BA, K%, BABIP (if available), contact rate proxies. Moderate confidence.
- PKR: Score from HR, ISO, SLG, BB%, OPS, wRC+ (if available). Moderate-to-high confidence.
- FKR: Score from FPCT, assists, errors, range factor proxy, DP (IF), CS% (C). Moderate confidence for infielders/catchers, low for outfielders.
- SKR: Score from SB, SB%, CS, triples. For slappers: bunt-for-hit success, drag bunt production. Low-to-moderate confidence (sprint speed missing).
- IQKR: Score from RISP performance, productive outs, baserunning decisions (CS rate), sacrifice success rate, GIDP rate. Low confidence - most IQ traits require film.

**PITCHER COMPONENT KRs at V1:**
- VKR: LARGELY UNSCORED. Proxy: K/7 as weak stuff indicator (high K rates suggest good stuff but do not confirm velocity or movement). Confidence: 25-35%.
- CKR: Score from BB/7, WHIP, K/BB, FPS% (if available). Moderate-to-high confidence.
- DKR: Score from IP, GS, CG, tournament IP clusters, health history. HIGH CONFIDENCE - softball IP data is very telling because aces pitch so many innings. 300 IP ace = elite durability. 150 IP with health issues = genuine concern.
- RKR: LARGELY UNSCORED. Proxy: platoon splits (if sample sufficient) suggest arsenal diversity. Confidence: 20-30%.
- IQKR: Score from LOB%, situational ERA, induced GIDP, consistency across multi-game tournament weekends. Low confidence.

Apply position-specific OPF. Produce Phase 6 Raw output.

### STEP 4: PHASE 6 ADJUSTS WITHIN PHASE 3 +/- 10

Phase 3 anchor range expanded by 10 in either direction = allowable window. Phase 6 tells direction:
- If Phase 6 components confirm the production anchor: Final KR at or above midpoint
- If Phase 6 reveals hidden weaknesses: Final KR pushed toward bottom of window
- If Phase 6 reveals hidden strengths: Final KR pushed toward top

### STEP 5: FINAL KR

Adjusted number = V1 KR. Confidence capped by trait coverage:

| Data Tier | Hitter Confidence Cap | Pitcher Confidence Cap |
|---|---|---|
| V3 (Rapsodo/FlightScope multi-year) | 85-95% | 82-92% |
| V2 (pitch-tracking single season) | 75-85% | 70-82% |
| V1+ (box score + partial pitch-tracking) | 62-75% | 55-70% |
| V1 (box score multi-year) | 55-68% | 50-65% |
| V1 (box score single season) | 45-58% | 40-55% |

Note: Pitcher confidence at V1 is slightly higher than baseball equivalent because IP volume provides a larger sample and DKR is scorable with high confidence from IP data alone. Softball aces pitch 250-350 IP, giving substantial data even at V1.

Output: Final KR, KR Range, Confidence %, Phase 3 anchor (transparency), Phase 6 raw (transparency), component KRs with per-component confidence, key strengths/weaknesses, legend tier label (hitter or pitcher track), Level Tier Map.

## KR IS UNIVERSAL
KLVN normalizes INPUTS, not OUTPUTS. One player, one KR, multiple legend reads.

## DATA TIER PROGRESSION

| Data Tier | Phase 3 Authority | Phase 6 Authority |
|---|---|---|
| V1 (box score) | Primary - anchors range | Secondary - adjusts within range |
| V1+ (partial pitch-tracking) | Shared | Shared |
| V2 (full pitch-tracking 1 season) | Secondary - validation | Primary - drives KR |
| V3 (multi-year pitch-tracking) | Minimal - sanity check | Full authority |

At V1, Phase 3 (legend anchor) is truth. Phase 6 (component math) is confirmation. The legend anchor is truth. The math is confirmation. Not the other way around.

## Governance
- V1 Protocol supplements standard pipeline
- When data tier upgrades, V1 output is superseded
- All V1 outputs flagged as V1_EVALUATION with confidence cap
- Phase 3 anchor logged alongside Phase 6 raw for audit
