# NEXUS WOMEN'S FLAG FOOTBALL INTELLIGENCE - FILE 01: PLAYER EVAL PROCESS
## v1.0

---

# COACH CONTEXT SETUP

COACH CONTEXT SETUP - v1 (LOCKED)

Purpose: Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

Required Fields (all must be populated before evaluation proceeds):
1. Program Name
2. Governing Body - NCAA, NAIA, NJCAA
3. Division (if applicable) - NCAA: D1/D2/D3, NJCAA: D1/D2/D3
4. Conference (if applicable)
5. Offensive System - must match one of the 6 defined offensive systems: Spread, Trips, Bunch, Motion-Heavy, QB Run-First, West Coast
6. Defensive System - must match one of the 5 defined defensive systems: Man Coverage, Zone Coverage, Rush + Cover, Double Rush, Spy

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

Optional Metadata:
1. Conference tier (for KLVN auto-assignment if conference is ambiguous)

Optional Constraints (downstream only - do not alter trait scoring or KR):
1. Scholarships Available (TBD by NCAA - NAIA currently $15,000 stipend per team)
2. NIL Pool (default $0)
3. Institutional / Merit Aid Capacity
4. Need-Based Aid Availability
5. Operating Budget
6. Recruiting Budget
7. Roster Size Target (typical: 20-30 players)
8. Staffing Capacity Band - Lean (1 head coach), Standard (HC + 1-2 assistants), Developed (HC + 2-3 assistants + GA)

Context Lock: When all required fields (1-6) are populated and validated, system state transitions to Coach Context Locked. Cannot be modified mid-evaluation without restarting the pipeline.

---

# PLAYER PROFILE

Player Profile (Auto-Populated Record)

## A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth / Age (derived)
- Height (current)
- Weight (current)
- Declared position(s) (source-listed only)
- Two-way status (offense only, defense only, two-way)
- City/Town of origin / State / Country
- High school / prep school
- Current team affiliation
- Other sports played (multi-sport athletes are extremely common in flag football)
- NFL FLAG experience (tournaments, rankings, team affiliations)
- High school flag football state (if applicable - only 39 states sanction)

## B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- League / competition level
- Season/year label
- Dates active
- Eligibility status

## C) Raw Production (Season-by-Season) - BY POSITION

### C1: Quarterback
- Games played / started
- Completions / Attempts / Completion %
- Passing yards / YPA
- Passing TDs / INTs / TD:INT ratio
- Rushing attempts / yards / YPC / Rushing TDs
- Sacks taken (flag pulls behind LOS on designed passes)
- Total touchdowns (passing + rushing)
- Turnovers (INTs + fumbles)
- Two-point conversions attempted / converted

### C2: Wide Receiver / Flex (Skill Position - Pass Catching)
- Games played / started
- Receptions / Targets / Catch rate
- Receiving yards / YPR / Receiving TDs
- Long reception
- Yards after catch per reception (if available)
- Drop rate (if available)
- Rushing attempts / yards / TDs (jet sweeps, designed runs, handoffs)
- Total touchdowns
- Flag pulls (if two-way player on defense)
- Interceptions (if two-way)

### C3: Running Back
- Games played / started
- Rushing attempts / yards / YPC / TDs
- Receptions / Receiving yards / YPR / Receiving TDs
- Long run / Long reception
- Total touchdowns
- Fumbles
- Flag pulls (if two-way)

### C4: Center
- Games played / started
- Snap accuracy (bad snaps if tracked)
- Receptions / Targets / Catch rate (as eligible receiver after snap)
- Receiving yards / YPR / Receiving TDs
- Flag pulls (if two-way)
- Note: Center evaluation heavily depends on snap reliability and post-snap receiving ability. No blocking grades - there is no blocking in flag football.

### C5: Defensive Specialist
- Games played / started
- Flag pulls / Flag pull attempts / Flag pull % (the single most important defensive stat)
- Interceptions
- Pass breakups / Passes defended
- Sacks (successful rushes to QB flag pull)
- Rush attempts (how often sent as rusher)
- Forced fumbles (rare in flag football)
- Defensive touchdowns (INT returns, fumble returns)

## D) Athletic Testing (if available)
- 40-yard dash
- 5-10-5 shuttle (pro agility)
- 3-cone drill
- Vertical jump
- Broad jump
- L-drill
- Note: Combine/testing data is rare for flag football players. When available, it is extremely valuable because speed and agility are THE dominant physical traits.

## E) Additional Context
- High school sport(s) played (track, soccer, basketball, softball, tackle football are common crossover sports)
- NFL FLAG tournament results
- USA Football / Team USA involvement
- Club flag football history
- YouTube / Hudl highlight links

---

# PLAYER CONFIDENCE GATE

Player Confidence Gate - Flag Football v1

Evaluation confidence is bounded by available data. Flag football has limited data infrastructure compared to established sports. Confidence ranges reflect this reality.

| Data Available | Confidence % |
|---|---|
| Name + position + team only | 20-30% |
| Season stats (basic box score) | 35-50% |
| Season stats + team record + awards | 45-60% |
| Multi-season stats + awards + context | 55-70% |
| Stats + coach quotes + highlight film | 60-75% |
| Stats + film + athletic testing data | 68-82% |
| Full evaluation package (stats, film, testing, coach intel, multi-year) | 75-88% |

Flag Football Confidence Adjusters:
- Sample size: fewer than 6 current-season games: bottom of range
- First-year program (no historical data): -10 pts
- NAIA (deepest data): +5 pts over baseline
- NCAA emerging sport (limited data): -5 pts from baseline
- Multi-sport athlete with relevant crossover data (track times, etc.): +5 pts
- Two-way player with both sides documented: +3 pts
- Two-way player with only one side documented: -5 pts on undocumented side

Maximum confidence for V1 (box score only) flag football evaluation: 70%. The sport is too young and data too sparse for higher confidence without film.

---

# PLAYER EVALUATION ENGINE

Master Execution Flow - Flag Football v1

**Input:** Player name OR Player object + Coach Context (locked)

**Pipeline (strict sequential order):**

### Step 0: Data Gathering Protocol
Run the Data Gathering Protocol from the SKILL.md. Pool lookup, official web search, social web search. Collect everything available.

### Step 1: Coach Context Validation
Confirm Coach Context is locked. If not, prompt for required fields. Do not proceed without locked context.

### Step 2: Player Profile Population
Fill in all available fields from Step 0 data. Flag any missing critical fields (height/weight, position, stats).

### Step 3: Position Identification
Determine primary position. Flag football positions are more fluid than tackle football. Many players play multiple positions on offense and defense. Assign primary position for OPF weighting but note secondary roles.

For two-way players: evaluate both sides. The primary position is whichever side generates more impact (higher KR contribution). The secondary side is still scored and reported.

### Step 4: Phase 3 - Production Anchor
Load the KR Legend for the player's competitive level. Map the player's production profile against legend tier descriptions. Identify the anchor range.

Production anchor inputs by position:

**QB:** Completion %, YPA, TD:INT ratio, passing yards per game, rushing production, team wins, awards. Flag football QBs face constant rush pressure with zero blocking protection - raw stats must be interpreted through this lens.

**WR/Flex/RB:** Receptions, yards, YPR, TDs, rushing production, total touchdowns, catch rate. In 7v7, all receivers are running routes on every play - target share matters because there are 6 eligible receivers competing for touches.

**Center:** Snap reliability, post-snap receiving production. The center is the most unique position in flag football - they must deliver a clean snap and then become a receiver. Centers with receiving production are far more valuable.

**Defensive Specialist:** Flag pulls, flag pull %, interceptions, pass breakups, sacks. The single most important defensive stat is flag pull consistency - a defender who misses flag pulls costs stops directly.

Write down the anchor range before proceeding.

### Step 5: Phase 6 - Component KR Scoring
Score the five component KRs (AKR, SKR, QKR if QB, DKR, IQKR) from available data.

Use the OPF (Optimal Performance Formula) weights for the player's position to compute the composite. The OPF determines how much each component KR matters for each position.

Flag Football OPF Weights (v1):

| Component | QB | WR-Outside | WR-Slot | RB | Center | Rusher | DB/Safety |
|---|---|---|---|---|---|---|---|
| AKR (Athletic) | 20% | 30% | 30% | 30% | 15% | 25% | 30% |
| SKR (Skill) | 15% | 35% | 35% | 25% | 30% | 10% | 15% |
| QKR (QB) | 35% | - | - | - | - | - | - |
| DKR (Defensive) | 5% | 5% | 5% | 5% | 5% | 40% | 35% |
| IQKR (IQ) | 25% | 30% | 30% | 40% | 50% | 25% | 20% |

Notes on OPF:
- AKR carries heavy weight everywhere because speed/agility is THE differentiator in flag football
- QKR is only scored for QBs. For non-QBs, the weight is redistributed proportionally across other components
- Center has highest IQKR weight because the center must read defenses post-snap AND find open space as a receiver
- Rusher DKR is highest because their entire value is defensive (rush the QB, pull flags)
- Two-way players: Run the OPF for their primary position. Note secondary-side scores separately.

### Step 6: Phase 6 Adjusts Within Phase 3 +/- 10
The final KR must fall within the Phase 3 anchor range expanded by 10 in either direction. Phase 3 is truth. Phase 6 adjusts direction.

### Step 7: Final Output
Produce the complete evaluation output per the SKILL.md Mode 1 output format.

---

# CONTEXTUAL MODE

Contextual Mode - Flag Football v1

Purpose: When insufficient data exists for a full V1 evaluation, Contextual Mode produces a reasonable KR estimate using partial information and context clues.

Contextual Mode is triggered when:
- Player has fewer than 3 games of production data
- Player is transferring and only prior-level data exists
- Player is a recruit with only high school/club data
- Player is from a level where no structured stats exist

Contextual Mode Process:
1. Identify the highest-confidence data available (even if it's just position + level + team record).
2. Use context clues to estimate a KR range:
   - Starting on a nationally-ranked team = floor of 72+ at that level
   - Bench player on a competitive team = floor of 60-68
   - All-Conference or All-Tournament = adjust up 3-5 points
   - Multi-sport athlete with track times = can estimate AKR from 40/100m times
   - NFL FLAG national tournament participant = quality indicator
3. Produce a KR range (wider range = lower confidence).
4. Always report confidence_pct (typically 25-45% for contextual mode).

---

# SUPPRESSION DETECTION RULES

Suppression Detection - Flag Football v1

Suppression occurs when a player's stats underrepresent their true ability due to context, not skill.

**Role Suppression** - Player has limited opportunity despite high per-touch efficiency.
- Trigger: Player's per-touch production rate is top-20% at position on team, but total volume is bottom-50% due to limited targets/carries.
- Example: WR averaging 18+ YPR but only getting 2 targets per game because the QB distributes to a favorite target.
- Implication: Per-touch metrics (YPR, YPC, catch rate) more informative than volume.

**System Suppression** - Player in an offensive system that does not utilize their primary skills.
- Trigger: Player's archetype is C-tier or No-match for their team's offensive system.
- Example: Elite deep-threat WR in a West Coast offense that rarely throws beyond 10 yards.
- Implication: Route tree depth and scheme fit tell the real story.

**QB Suppression** - QB production depressed by lack of receiving talent.
- Trigger: No WR on the roster averages 40+ receiving yards per game AND team drop rate is high.
- Example: QB with 55% completion but 10% of passes are dropped.
- Implication: Adjusted completion (drops removed) is the truth signal.

**Defensive Opportunity Suppression** - Defensive player limited by one-sided role.
- Trigger: Player plays only offense or only defense despite having two-way ability, OR team's scheme limits rush opportunities.
- Example: Elite athlete forced into coverage-only role in a zone scheme that never sends a rusher.
- Implication: Evaluate the skills they can show, flag the skills they can't.

**Injury Suppression** - Production depressed by playing through injury.
- Trigger: Documented injury during period of production decline, AND post-injury production diverges significantly from pre-injury.
- Implication: Pre-injury production better represents true ability.

**Two-Way Fatigue Suppression** - Production depressed on one or both sides due to playing every snap.
- Trigger: Two-way player shows declining production in second halves of games, late-season fatigue patterns, or high usage correlated with efficiency drops.
- Example: Player averages 15 YPR in first halves, 8 YPR in second halves across the season.
- Implication: First-half production (fresh) may be more representative of true ceiling.

**Pregnancy/Motherhood Suppression** - Production gap or decline due to pregnancy, childbirth, or postpartum recovery.
- Trigger: Season or multi-season gap in production coinciding with pregnancy/childbirth timeline, AND pre-gap production was significantly higher than post-return production.
- Implication: Pre-pregnancy production is a valid data point for ceiling estimation. Post-return production reflects current state but may improve as recovery continues. Both are reported transparently. Never penalize a player's KR for a production gap caused by pregnancy.

**Transfer Adjustment Period** - Production depressed in first games at new program.
- Trigger: Transfer player's first 3-4 games show production 30%+ below their prior-school rate, with steady improvement through the season.
- Implication: Early-season stats are adjustment noise. Second-half production is more representative.

When suppression is detected, produce both the visible stat-based estimate and the context-adjusted estimate. Both reported transparently. Neither overwrites the other.

---

# MULTI-LEVEL PLAYER PROTOCOL

Multi-Level Player Protocol - Flag Football v1

When a player competes across multiple levels (e.g., NAIA to NCAA, high school to NAIA, club to college):

1. Each level's data evaluated separately through production anchor mapping.
2. Highest-level data carries the most interpretive weight (hardest test).
3. Lower-level data confirms capabilities that higher-level context suppresses.
4. Cross-level stat divergence is a signal, not noise.
5. Final KR anchored to highest level with meaningful data. Lower-level data fills gaps.
6. KLVN lambdas applied for Level Tier Map interpretation. One player, one KR, multiple legend reads.

Flag Football-Specific Multi-Level Notes:
- NAIA-to-NCAA transfers will be common as NCAA programs launch. NAIA data provides the deepest evaluation base.
- High school-to-college transitions are complicated by the fact that only 39 states sanction girls' flag football. Players from non-sanctioned states may have only club experience.
- Multi-sport athletes transferring to flag football (e.g., track athletes, soccer players, basketball players) bring athletic data from other sports. Use 100m dash times to estimate AKR. Use sport-specific skills (soccer agility, basketball court vision) as context clues.
- Club/NFL FLAG tournament data is an important signal, especially for players from non-sanctioned high school states.

---

# POSITION GROUP WEIGHTING FOR TEAM KR

Position Group Weighting - Flag Football v1

Flag football has 7 on-field positions with much more fluid roles than tackle football. Weighting reflects flag football's value hierarchy where speed, QB play, and coverage are paramount.

| Position Group | % of Team KR | Justification |
|---|---|---|
| QB (1 starter) | 25% | Most important player by far. Handles the ball every play. No protection means QB must do more. Passing + rushing + play calling. |
| Outside WRs (2 starters) | 20% | Primary scoring weapons. Route running and speed are the offense's main tools. WR1 carries 55% of group weight. |
| Slot/Flex Receivers (2 starters) | 15% | Quick-game targets. YAC creators. Often the most catches on the team. |
| RB/Utility (1 starter) | 8% | Versatile weapon. Less usage than WRs in most systems but high-value touches. |
| Center (1 starter) | 7% | Snap reliability is critical. Post-snap receiving adds value. Lowest ceiling but highest floor cost (bad snaps lose drives). |
| Defensive Coverage (4-5 players) | 18% | Man/zone coverage determines if offense scores. Flag pull consistency is everything on defense. |
| Rush/Spy (1-2 players) | 7% | Forces the QB to make quick decisions. Sack/flag-pull on QB is game-changing. But only 1-2 players rush per play. |

Total: 100%

These weights are applied during Team KR computation (File 03) to aggregate individual player KRs into a Team KR.

Notes:
- QB weight (25%) is higher than tackle football (18%) because flag football QB does MORE: no protection, must scramble, often calls plays at the line, and is the primary decision-maker with no coordinator headset in most formats.
- Defensive coverage weight (18%) is lower than the sum of all defensive positions in tackle football because there's no run defense, no tackling in the traditional sense, and no defensive line.
- Two-way players: Their KR is allocated to whichever side they contribute more to. Residual impact on the other side is captured in the team system fit calculation.

---

# V1 EVALUATION PROTOCOL - FLAG FOOTBALL v1

## Purpose
Defines how the Player Evaluation Pipeline operates at V1 data tier (box score + advanced composites). Combines production-based anchoring (Phase 3) with trait-level math (Phase 6).

## The Five Steps

### STEP 1: COACH CONTEXT
Set program, level, conference, offensive/defensive system. Binds KLVN, legend, OPF.

### STEP 2: PHASE 3 - PRODUCTION ANCHOR
Map production profile against KR legend tiers. Position-specific production profiles:

**QB Production Anchor Inputs:** Comp%, YPA, TD:INT, passing yards per game, rushing production, team wins, awards, sacks taken (reflects evasion ability since there's no blocking).

**WR/Flex Production Anchor Inputs:** Receptions, yards, YPR, TDs, catch rate, target share (important in 7v7 with 6 eligible receivers), awards.

**RB Production Anchor Inputs:** Rush yards, YPC, TDs, receiving production, total touchdowns.

**Center Production Anchor Inputs:** Snap reliability (if tracked), receiving production after snap, awards.

**Defensive Production Anchor Inputs:** Flag pulls, flag pull %, INTs, PBU, sacks, defensive TDs. NOTE: Defensive stats are the hardest to anchor in flag football because many programs don't track individual defensive stats comprehensively. When stats are limited, anchor from team-level defensive performance and role evidence.

Output: KR anchor range.

### STEP 3: PHASE 6 - COMPONENT KR MATH
Score traits from available data. Bound NULL traits using composite metrics. Apply proxy confidence weights. Run OPF math.

Flag Football-Specific Composite Bands (NAIA, v0):

| Composite | Band 90 | Band 80 | Band 70 | Band 60 | Band 50 |
|---|---|---|---|---|---|
| QB Comp% | 72%+ | 65-71% | 58-64% | 50-57% | Below 50% |
| QB TD:INT | 5:1+ | 3.5:1-4.9:1 | 2:1-3.4:1 | 1.2:1-1.9:1 | Below 1.2:1 |
| QB YPA | 10+ | 8-9.9 | 6.5-7.9 | 5-6.4 | Below 5 |
| WR YPR | 16+ | 12-15.9 | 9-11.9 | 6-8.9 | Below 6 |
| WR Catch Rate | 80%+ | 70-79% | 60-69% | 50-59% | Below 50% |
| Flag Pull % | 90%+ | 82-89% | 75-81% | 65-74% | Below 65% |
| Defensive INTs/game | 0.5+ | 0.3-0.49 | 0.15-0.29 | 0.05-0.14 | Below 0.05 |

Note: These bands are PROVISIONAL. Based on early NAIA data. Will be recalibrated as data deepens. Other levels scale via KLVN lambda.

### STEP 4: PHASE 6 ADJUSTS WITHIN PHASE 3 +/- 10
Phase 3 anchor is truth. Phase 6 adjusts direction within the window. Maximum -10 from Phase 3 low, maximum +10 from Phase 3 high.

### STEP 5: FINAL KR
Output: Final KR, KR Range, Confidence %, Phase 3 anchor (transparency), Phase 6 raw (transparency), component KRs, legend tier label, Level Tier Map.

## Data Tier Progression

| Data Tier | Traits Scored | Phase 3 Authority | Phase 6 Authority |
|---|---|---|---|
| V1 (box score) | 12-18 | Primary - anchors range | Secondary - adjusts within |
| V1+ (enhanced stats) | 18-25 | Shared | Shared |
| V2 (film + stats) | 25-35 | Secondary - validation | Primary - drives KR |
| V3 (multi-year film) | 35-45 | Minimal - sanity check | Full authority |

Note: V2 and V3 tiers are theoretical for flag football currently. Almost no programs have film infrastructure. Most evaluations will be V1 for the foreseeable future.

## KR IS UNIVERSAL - CRITICAL RULE
One player. One KR. Multiple legend reads. KLVN normalizes INPUTS. It does NOT convert KR OUTPUTS.

---

# GOVERNANCE

Any change to Coach Context fields, Player Profile templates, Confidence Gate ranges, pipeline execution order, suppression detection rules, multi-level protocol, position group weighting, or V1 protocol requires documentation, versioning, and approval.
