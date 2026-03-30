# NEXUS FOOTBALL INTELLIGENCE -- FILE 01: PLAYER EVAL PROCESS
## v1.0

---

# COACH CONTEXT SETUP

COACH CONTEXT SETUP -- v1 (LOCKED)

Purpose: Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

Required Fields (all must be populated before evaluation proceeds):
1. Program Name
2. Governing Body -- NCAA, NAIA, NJCAA, NCCAA
3. Division (if applicable) -- NCAA: FBS/FCS/D2/D3, NJCAA: D1/D2/D3
4. Conference Classification (required if FBS) -- Power 4, Group of 5, Independent
5. FCS Tier (required if FCS) -- Top Tier, Mid Tier, Lower Tier
6. Offensive System -- must match one of the 8 defined offensive systems: Spread, Air Raid, RPO, Pro Style, West Coast, Power Run, Option/Triple Option, Pistol
7. Defensive System -- must match one of the 6 defined defensive systems: 4-3, 3-4, Nickel/4-2-5, 3-3-5, 4-4, 46 Defense

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

Optional Metadata:
1. Conference (non-blocking; used for KLVN auto-assignment)

Optional Constraints (downstream only -- do not alter trait scoring or KR):
1. Scholarships Available (max 85 for FBS, 63 for FCS, 36 for D2, 24 for NAIA, 0 for D3)
2. NIL Pool (default $0)
3. Institutional / Merit Aid Capacity
4. Need-Based Aid Availability
5. Operating Budget
6. Recruiting Budget
7. Roster Size Target (FBS 105 total with 85 scholarship, FCS 85 total, etc.)
8. Staffing Capacity Band -- Lean (8 assistants), Standard (10), Elite (10 + analysts/GAs)

Context Lock: When all required fields (1-7) are populated and validated, system state transitions to Coach Context Locked. Cannot be modified mid-evaluation without restarting the pipeline.

---

# PLAYER PROFILE

Player Profile (Auto-Populated Record)

## A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth / Age (derived)
- Height (current) + height history
- Weight (current) + weight history
- Arm length (if measured)
- Hand size (if measured)
- Wingspan (if measured)
- Declared position(s) (source-listed only)
- City/Town of origin / State / Country
- High school / prep school
- Current team affiliation
- Recruiting stars (247/Rivals/On3/ESPN composite)
- Recruiting ranking (national, state, position)

## B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- League / competition level
- Season/year label
- Dates active
- Redshirt status (RS, medical RS, COVID year)

## C) Raw Production (Season-by-Season) -- BY POSITION GROUP

### C1: Quarterback
- Games played / started
- Completions / Attempts / Completion %
- Passing yards / YPA / Adjusted YPA
- Passing TDs / INTs / TD:INT ratio
- Passer rating / QBR (if available)
- Sacks taken / Sack rate
- Rushing attempts / yards / YPC / TDs
- Fumbles / Fumbles lost
- Big-time throw % / Turnover-worthy play % (if PFF available)
- Pressured completion % / Time to throw (if available)

### C2: Running Back / Fullback
- Games played / started
- Rushing attempts / yards / YPC / TDs
- Long run / 10+ yard runs / 20+ yard runs
- Yards after contact per attempt (if available)
- Broken tackles / Forced missed tackles (if available)
- Receptions / Receiving yards / YPR / Receiving TDs
- Targets / Catch rate / Drop rate (if available)
- Fumbles / Fumbles lost
- Pass protection snaps / Pressures allowed (if available)

### C3: Wide Receiver / Tight End
- Games played / started
- Receptions / Targets / Catch rate
- Receiving yards / YPR / Receiving TDs
- Long reception / Deep catches (20+ air yards)
- Yards after catch per reception (if available)
- Contested catch rate (if available)
- Drop rate (if available)
- Routes run / Yards per route run (if available)
- Rush attempts / yards (jet sweeps, end-arounds)
- PFF receiving grade / Run-block grade (if available)

### C4: Offensive Line
- Games played / started
- Position(s) played (LT/LG/C/RG/RT)
- Snaps played (pass / run split)
- Sacks allowed / Pressures allowed / Hits allowed
- Penalties (false starts, holding, total)
- PFF pass-block grade / Run-block grade (if available)
- Run-block win rate / Pass-block win rate (if available)
- Pancake blocks (if tracked)

### C5: Defensive Line / EDGE
- Games played / started
- Total tackles / Solo tackles / Assisted
- Sacks / TFL / QB hits / Hurries / Total pressures
- Forced fumbles / Fumble recoveries
- Pass deflections
- PFF pass-rush grade / Run-defense grade (if available)
- Pass-rush win rate / Run-stop rate (if available)
- Snap count / Snap share %

### C6: Linebacker
- Games played / started
- Total tackles / Solo / Assisted
- TFL / Sacks / QB hits / Hurries
- Forced fumbles / Fumble recoveries
- Interceptions / Pass breakups / Passes defended
- PFF coverage grade / Run-defense grade / Blitz grade (if available)
- Missed tackle rate (if available)
- Targets in coverage / Completion % allowed (if available)

### C7: Cornerback / Safety
- Games played / started
- Total tackles / Solo / Assisted
- Interceptions / Pass breakups / Passes defended
- Forced fumbles / Fumble recoveries
- Targets in coverage / Completion % allowed (if available)
- Passer rating allowed (if available)
- PFF coverage grade / Man grade / Zone grade (if available)
- Missed tackle rate
- Snaps in man / zone / blitz (if available)
- Return stats (if applicable)

### C8: Kicker / Punter / Long Snapper
- Games played
- FG made / attempted by distance range (0-29, 30-39, 40-49, 50+)
- FG %
- Long FG made
- PAT made / attempted
- Punts / Average / Net average / Inside-20 / Touchbacks
- Hangtime (if available)
- Long snaps / Bad snaps (if tracked)
- Return stats (if applicable as returner)

## D) Combine / Pro Day / Testing (if available)
- 40-yard dash (with 10-yard split)
- Short shuttle (5-10-5)
- 3-cone drill
- Vertical jump
- Broad jump
- Bench press (225 lbs reps)
- Height / Weight / Arm length / Hand size / Wingspan (official measurement)

## E) Academic Record (Public / Declared Only)
- GPA (if available)
- Academic honors
- Major / field of study
- Eligibility status (remaining years, transfer eligibility, graduate transfer status)
- Academic progress rate (APR) if applicable

## F) Medical Information (Public Only)
- Declared injuries
- Public injury reports (depth chart designations)
- Medical redshirt designations
- Games missed per season with reason (if public)

## G) Contact and Identification Metadata
- Phone number(s) / Email / Social media handles

## H) Source Attribution + Trust Metadata (Per Field)
- Source for each element
- Verification status: verified / unverified
- Known coverage gaps

Locked Exclusions (never in Player Profile):
- Evaluations / ratings / KRs
- Attributes, badges, archetypes
- Role inference or system fit
- Private medical or disciplinary records
- Household income / parental info
- Subjective recruiting opinions

---

# PLAYER CONFIDENCE GATE

PLAYER CONFIDENCE GATE -- v1 (LOCKED STRUCTURE, PROVISIONAL RANGES)

Purpose: Confidence % communicates evidence completeness and stability for a player evaluation. Answers: "how much should you trust this KR?"

Output: confidence_pct in [0, 100]. Computed at end of player evaluation. Does not change any KR math.

Mode Auto-Detection:
- Box-score sources only → Production-Based Mode
- PFF/Granular sources present → Full Player KR Mode

Trait Coverage by Mode:
The Trait Library defines 59 traits across 8 clusters. Each trait is marked as TRUE, PROXY, or UNSCORED per data layer. In Production-Based Mode, only TRUE and PROXY traits produce scores. Position weighting renormalizes around scored traits only.

Confidence Ranges (Provisional -- v1):

| Data Available | Production-Based Confidence % | Full Player KR Confidence % |
|---|---|---|
| Official college stats only, 1 year | 55-65% | 25-40% |
| Official stats, multi-year | 65-75% | 35-50% |
| Official stats + combine/pro day measurables | 70-80% | 40-55% |
| Multi-year across levels (JUCO→FBS, etc.) | 72-82% | 42-58% |
| 1 year PFF grades + official stats | 78-88% | 60-75% |
| Multi-year PFF + official stats | 82-92% | 72-85% |
| PFF + film evaluation + combine | 85-94% | 78-90% |
| Multi-year PFF + film + combine + scouting reports | 88-96% | 82-94% |

Football-Specific Confidence Notes:
- OL evaluation requires PFF or film data for meaningful confidence. Box-score stats for OL (sacks allowed, penalties) are extremely noisy. OL Production-Based confidence is capped at 60%.
- DB evaluation requires coverage metrics for confidence above 70%. Box-score stats (INTs, PBU) are high-variance.
- Combine/pro day measurables significantly boost TKR confidence for all positions.
- QB is the most box-score-friendly position. Production-Based confidence for QBs can reach 85%.

---

# PLAYER EVALUATION ENGINE -- MASTER EXECUTION FLOW

PLAYER EVALUATION ENGINE -- MASTER EXECUTION FLOW (LOCKED)

Purpose: Defines the complete execution order for producing a player's Final System KR. Single source of truth for what runs, in what order.

Architecture: Two blocks.
- Block 1 builds Base Truth -- system-agnostic player identity. Never changes regardless of coach system selection.
- Block 2 applies System Context -- how the player fits within the coach's selected systems. Reruns when systems change.

## BLOCK 1 -- BASE TRUTH (System-Agnostic)

### Step 0: Coach Context Setup
Must pull from: Coach Context Setup
Complete all required fields. System state: Coach Context Locked. Binds: KLVN level key, KR legend selection, position weighting level.

### Step 1: Mode Auto-Detect
Must pull from: Player Confidence Gate
Box-score only → Production-Based Mode. PFF/granular present → Full Player KR Mode. Determines which of 59 traits produce scores vs return UNSCORED (null).

### Step 2: Player Profile Build
Must pull from: Player Profile (Auto-Populated Record)
Build factual record: identity, seasons, raw production, awards/honors, combine measurables, source metadata. No traits. No KRs. No evaluation.

### Step 3: Trait Scoring
Must pull from: Trait Library (8 clusters, 59 traits)
Must pull from: KLVN (Level Normalization)
Score all 59 traits against active data layer. KLVN normalization applied to production inputs. Missing/UNSCORED traits = null. Never guessed.
Output: 59 trait scores (each 0-100 or null)

### Step 4: Position Weighting + Base KR
Must pull from: Position Trait Weighting (22 positions, College/Pro)
Apply position-specific trait weights to compute four component KRs:
- AKR (Attack/Offense KR) -- from offensive cluster trait weights
- DKR (Defense KR) -- from defensive cluster trait weights
- TKR (Tools KR) -- from Tools trait weights
- IQKR (IQ KR) -- from IQ trait weights

UNSCORED traits contribute zero weight. Remaining scored traits renormalize.

Base Player KR = (AKR x OPF_off) + (DKR x OPF_def) + (TKR x OPF_tools) + (IQKR x OPF_iq)

OPF varies by position and level. Example: QB College = 62/2/14/22. EDGE College = 3/62/22/13.
Output: Base AKR, Base DKR, Base TKR, Base IQKR, Base Player KR

### Step 5: Badges
Must pull from: Badge Spec (40 badges)
Evaluate each badge against Skill KR gates and required trait gates per tier.
College: Bronze (Skill KR >= 90, traits >= 90), Silver (>= 94), Gold (>= 97)
Pro: Bronze (>= 93), Silver (>= 96), Gold (>= 98)
Apply KR lift: Bronze +0.5, Silver +1.0, Gold +1.5. Total cap: +3.5. Negative badges apply negative lift.
Output: Badge list + post-badge Base Player KR

### Step 6: Archetype Assignment
Must pull from: Archetype Library (40 archetypes)
Evaluate each archetype against Skill KR floors, primary trait gates, support trait gates. All thresholds numeric and deterministic.
Primary: full gates. Secondary: Skill KR floor relaxed by -5.
Output: Primary archetype(s), secondary archetype(s), or none

### Step 7: Overrides
Must pull from: Overrides (5 types)
Evaluate override triggers: Injury, Role Suppression, System Mismatch, Sample Size, Transfer Context.
Overrides modify confidence level or provide context, not KR directly.
Output: Override applied (if any) + adjusted confidence

### Step 8: Impact Modifier Assignment
Must pull from: Impact Modifiers
Evaluate in strict precedence: Primary Engine → Secondary Engine → Force Multiplier → Specialist Anchor → Unclassified.
One modifier max per player. Does not alter KR.
Output: Impact Modifier label

### Step 9: Base Truth Lock
Locked and cannot change without pipeline restart:
- 59 trait scores (including UNSCORED flags)
- Position-weighted component KRs (AKR, DKR, TKR, IQKR)
- Base Player KR (post-badges)
- Badge list
- Archetype assignment(s)
- Impact Modifier label
This is the player's system-agnostic identity.

## BLOCK 2 -- SYSTEM CONTEXT

### Step 10: System Fit
Must pull from: System Fit -- Offensive Trait Weighting (8 systems x 22 positions)
Must pull from: System Fit -- Defensive Trait Weighting (6 systems x 22 positions)

Load selected offensive system profile. Reweight AKR internals per system (trait weight distributions shift). Load defensive system profile. Reweight DKR internals.

OPF buckets do not change. Only trait weight distributions inside each bucket change.

Compute:
- Final System Off KR
- Final System Def KR
- Final System Player KR = (System AKR x OPF_off) + (System DKR x OPF_def) + (System TKR x OPF_tools) + (System IQKR x OPF_iq)

### Step 11: System Risks
Must pull from: System Risks (15 total college: 6 Tier 1, 4 Tier 2, 5 Minor)
Evaluate system risk triggers against player data and system context. Penalties applied to Final System Player KR.
Output: System risk list + post-risk Final System Player KR

### Step 12: Finalization
Must pull from: KR Legend + Confidence Gate
Interpret Final System Player KR against level-appropriate legend. Compute confidence_pct.
Output: Final System Player KR (locked), legend tier label, confidence_pct, full audit trail

Determinism Guarantee: Given same Coach Context, same player data, same data layer -- identical outputs every time.

---

# CONTEXTUAL MODE

CONTEXTUAL MODE -- PLAYER KR ESTIMATION FROM PUBLIC METRICS (v1 LOCKED)

Purpose: Produces honest KR range for players who cannot be evaluated through the full trait pipeline because required granular data does not exist. Football Contextual Mode is the primary evaluation mode for most college players outside FBS P4, where PFF data is sparse.

Activates when: Box-score data exists, no PFF/film data exists, and box-score trait pipeline produces too many UNSCORED traits for reliable position-weighted KR.

### Input Tiers

Tier 1 -- Public Box-Score Data (Verified): Season stats, game logs from official sources. Position-specific stats per the Player Profile templates. Trust: Highest.

Tier 2 -- Public Advanced Metrics (Derived): PFF grades, QBR, EPA, DVOA, pressure rates, target data. Consumed as directional signals. Trust: High.

Tier 3 -- Contextual Intelligence (Structured):
- Roster Context -- OL quality estimate, supporting cast quality, depth
- Defensive Attention -- is this player the primary scouting target?
- Role Suppression -- player handling responsibilities beyond natural role
- Multi-Level Context -- player competes across multiple levels
- Coach Direct Knowledge -- first-hand observation
- Scouting Confirmation -- opposing coaches confirm tendencies
- Prospect Pedigree -- recruiting stars, offer sheet, prior roster membership
- Combine/Testing Data -- 40, shuttle, 3-cone, jumps, bench

### Execution Phases

Phase 1: Data Inventory -- catalog all available data by tier with source attribution and coverage gaps.

Phase 2: Level-Segmented Production -- organize stats by competition level. Tag each level with KLVN lambda.

Phase 3: Legend Anchor Mapping -- map production against KR legend tier descriptions at each level. This is the primary KR determinant. The legend anchor is truth.

Phase 4: Trait Confirmation -- partial trait vector. Each trait tagged as CONFIRMED (data directly supports), INFERRED (data indirectly suggests), SUPPRESSED (data is artificially depressed by context), or UNSCORED (no data).

Phase 5: Archetype/Badge/Override Feasibility -- which archetypes, badges, overrides would likely trigger if full data existed?

Phase 6: Component KR Estimation -- estimate AKR, DKR, TKR, IQKR ranges from confirmed/inferred traits.

Phase 7: Integration -- combine Phase 3 anchor with Phase 6 component estimates. Phase 6 adjusts within Phase 3 +/- 10.

Phase 8: Confidence Assessment.

Phase 9: Output generation -- KR range, component estimates, legend interpretation, What We Know / What We Don't Know / What Changes If.

---

# SUPPRESSION DETECTION RULES

Suppression Detection Rules -- Football v1

Suppression occurs when a player's stats are artificially depressed by factors external to their ability. Detected suppression adjusts interpretation, not data.

### Football-Specific Suppression Indicators:

**Snap Count Suppression** -- Starter-quality player in a rotation where snap count is artificially limited.
- Trigger: Player's per-snap production rate is top-20% at position in conference, but total volume is bottom-50% due to snap share < 60%.
- Example: DT with elite per-snap pressure rate but only plays 35 snaps/game in a heavy rotation.
- Implication: Volume stats (total sacks, total tackles) understate true ability. Per-snap rates are more informative.

**Scheme Suppression** -- Player in a system that does not utilize their primary skills.
- Trigger: Player's archetype is C-tier or No-match for their team's offensive/defensive system, but Tier 3 evidence shows the skill exists.
- Example: Elite slot receiver playing in a Power Run offense that runs 3-WR sets on only 30% of plays. His routes run per game are half what they'd be in Spread.
- Implication: Per-opportunity production (yards per route run, catch rate) is more informative than volume (total receptions).

**OL Suppression** -- Skill position production depressed by poor offensive line play.
- Trigger: Team OL ranks bottom-25% in conference in sack rate or YPC, AND player's pressure-adjusted or contact-adjusted metrics diverge significantly from raw stats.
- Example: QB with 58% completion and 6 INTs behind a line allowing 4+ sacks/game. Under pressure, comp% drops to 38%. Clean pocket comp% is 72%.
- Implication: Raw stats reflect OL quality, not QB quality. Clean-pocket splits are the truth signal.

**Weapon Suppression** -- QB production depressed by lack of receiving talent.
- Trigger: No WR on the roster averages 50+ receiving yards per game, AND team drop rate is top-25% in conference.
- Example: QB with 55% completion but 8% of passes are dropped. Adjusted completion % is 63%.
- Implication: QB accuracy is better than raw completion suggests. Drop rate and adjusted metrics tell the real story.

**Defensive Scheme Suppression** -- Defensive player underutilized by scheme.
- Trigger: Player's position group receives < 50% of the snaps their archetype typically requires.
- Example: Off-ball LB in a Nickel/4-2-5 that plays 5 DB base on 70% of snaps. LB only on field for 2-LB packages (30% of snaps).
- Implication: Per-snap production is the truth signal. Total stats are suppressed by scheme deployment, not ability.

**Injury Suppression** -- Production depressed by playing through injury.
- Trigger: Documented injury (public report or depth chart designation) during period of production decline, AND post-injury production diverges significantly from pre-injury.
- Example: EDGE rusher's sack rate drops 60% after ankle injury, but he continues to start.
- Implication: Pre-injury production better represents true ability. Post-injury production is suppressed.

**Transfer Adjustment Period** -- Production depressed in first games at new program.
- Trigger: Transfer player's first 3-4 games show production 30%+ below their prior-school rate, with steady improvement through the season.
- Implication: Early-season stats are adjustment noise. Second-half production is more representative.

When suppression is detected, produce both the visible stat-based estimate and the context-adjusted estimate. Both reported transparently. Neither overwrites the other.

---

# MULTI-LEVEL PLAYER PROTOCOL

Multi-Level Player Protocol -- Football v1

When a player competes across multiple levels (e.g., JUCO → FBS, FCS → FBS transfer):

1. Each level's data evaluated separately through production anchor mapping.
2. Highest-level data carries the most interpretive weight (hardest test).
3. Lower-level data confirms capabilities that higher-level context suppresses. Example: 1,500 rushing yards at NJCAA confirms vision/burst that 400 yards in 6 FBS games (as a freshman) cannot reveal.
4. Cross-level stat divergence is a signal, not noise. Significant divergence indicates context suppression at higher level.
5. Final KR anchored to highest level with meaningful data. Lower-level data fills gaps.
6. KLVN lambdas applied for Level Tier Map interpretation. One player, one KR, multiple legend reads.

Football-Specific Multi-Level Notes:
- JUCO→FBS transfers are extremely common. Two-year JUCO production provides a real sample, but the competition gap (λ = 0.700 vs 1.000) is significant. Weight FBS production heavily, even if sample is small.
- FCS→FBS transfers: FCS top-tier (λ = 0.830) production translates better than FCS lower-tier (λ = 0.740). Conference tier matters.
- D2→FBS: Rare but happens. Lambda gap is large (0.750 vs 1.000). FBS production, even partial season, dominates.
- Grad transfers with 3+ years of production at one level provide the deepest evaluation base. Use the full career arc.

---

# POSITION GROUP WEIGHTING FOR TEAM KR

Position Group Weighting -- Football v1

Football has dramatic position-value asymmetry. QB is the most valuable position in team sports. A kicker is not. The weighting below reflects how much each position group contributes to overall Team KR.

| Position Group | % of Team KR | Justification |
|---|---|---|
| QB (1 starter) | 18% | Single most important player. EPA, win %, and team success correlate most strongly with QB play. |
| Offensive Line (5 starters) | 16% | Collective unit. Run game and pass protection flow through OL. Unit value, not individual. |
| EDGE / Pass Rush (2 starters) | 10% | Most valuable defensive position. Sack rate correlates highly with defensive success. |
| Wide Receivers (3 starters: X, Z, Slot) | 9% | Skill talent. Scoring production. WR1 carries disproportionate weight. |
| Cornerbacks (2-3 starters) | 8% | Coverage is the most leveraged secondary skill. Shutdown corners change game plans. |
| Interior DL (2 starters: 3T + NT) | 7% | Run defense anchor. Interior pressure is rarer and more valuable per snap. |
| Running Back (1-2 starters) | 7% | Explosive play generation. Carries the ground game. |
| Safeties (2 starters) | 6% | Coverage + run support. Versatile pieces. |
| Linebackers (2-3 starters) | 6% | Run defense + coverage. Scheme-dependent value. |
| Tight End (1-2 starters) | 5% | Blocking + receiving. Scheme-dependent. |
| Kicker (1) | 4% | Field goals and PATs. Low variance but high-leverage moments. |
| Punter (1) | 2% | Field position. Hidden yardage. |
| Return Specialists | 2% | Field position value. Explosive plays. |

Total: 100%

These weights are applied during Team KR computation (File 03) to aggregate individual player KRs into a Team KR.

---

# V1 EVALUATION PROTOCOL -- FOOTBALL v1

## Purpose
Defines how the Player Evaluation Pipeline operates at V1 data tier (box score + advanced composites). Combines production-based anchoring (Phase 3) with trait-level math (Phase 6).

## The Five Steps

### STEP 1: COACH CONTEXT
Set program, level, conference, offensive/defensive system. Binds KLVN, legend, OPF.

### STEP 2: PHASE 3 -- PRODUCTION ANCHOR
Map production profile against KR legend tiers. Position-specific production profiles:

**QB Production Anchor Inputs:** Comp%, YPA, TD:INT, passer rating, rushing production, team wins, awards, sack rate, pressured stats.

**RB Production Anchor Inputs:** Rush yards, YPC, TDs, receiving production, fumble rate, explosive run rate, team rushing rank.

**WR/TE Production Anchor Inputs:** Receptions, yards, YPR, TDs, catch rate, yards per route run, target share.

**OL Production Anchor Inputs:** PFF grade (if available), sacks allowed, penalties, team OL rank, team rushing success. NOTE: OL is the hardest position to anchor from box-score. If PFF is unavailable, anchor from team-level metrics and snap count consistency.

**DL/EDGE Production Anchor Inputs:** Sacks, TFL, pressures, QB hits, run-stop rate, PFF grades.

**LB Production Anchor Inputs:** Tackles, TFL, sacks, coverage stats, PFF coverage/run grades.

**DB Production Anchor Inputs:** INTs, PBU, passer rating allowed, targets, completion % allowed, PFF grades.

**K/P Production Anchor Inputs:** FG%, distance ranges, punt average, net average, inside-20.

Output: KR anchor range.

### STEP 3: PHASE 6 -- COMPONENT KR MATH
Score traits from available data. Bound NULL traits using composite metrics. Apply proxy confidence weights. Run OPF math.

Football-Specific Composite Bands (FBS P4, v0):

| Composite | Band 90 | Band 80 | Band 70 | Band 60 | Band 50 |
|---|---|---|---|---|---|
| QB Passer Rating | 155+ | 145-154 | 135-144 | 125-134 | Below 125 |
| QB EPA/play | +0.25+ | +0.15 to +0.24 | +0.05 to +0.14 | -0.05 to +0.04 | Below -0.05 |
| RB YPC | 6.5+ | 5.5-6.4 | 4.5-5.4 | 3.8-4.4 | Below 3.8 |
| WR YPR | 16+ | 13-15.9 | 10-12.9 | 7.5-9.9 | Below 7.5 |
| PFF Pass-Block Grade | 90+ | 80-89 | 70-79 | 60-69 | Below 60 |
| EDGE Pressure Rate | 16%+ | 12-15% | 9-11% | 6-8% | Below 6% |
| LB Tackle Rate | 10%+ | 7.5-9.9% | 5.5-7.4% | 3.5-5.4% | Below 3.5% |
| DB Passer Rating Allowed | Sub-55 | 55-72 | 73-88 | 89-105 | Above 105 |

Other levels scale via KLVN lambda.

### STEP 4: PHASE 6 ADJUSTS WITHIN PHASE 3 +/- 10
Phase 3 anchor is truth. Phase 6 adjusts direction within the window. Maximum -10 from Phase 3 low, maximum +10 from Phase 3 high.

### STEP 5: FINAL KR
Output: Final KR, KR Range, Confidence %, Phase 3 anchor (transparency), Phase 6 raw (transparency), component KRs, legend tier label, Level Tier Map.

## Data Tier Progression

| Data Tier | Traits Scored | Phase 3 Authority | Phase 6 Authority |
|---|---|---|---|
| V1 (box score) | 18-25 | Primary -- anchors range | Secondary -- adjusts within |
| V1+ (PFF 1 season) | 30-42 | Shared | Shared |
| V2 (PFF + film + combine) | 45-55 | Secondary -- validation | Primary -- drives KR |
| V3 (multi-year PFF + film) | 55-59 | Minimal -- sanity check | Full authority |

## KR IS UNIVERSAL -- CRITICAL RULE
One player. One KR. Multiple legend reads. KLVN normalizes INPUTS. It does NOT convert KR OUTPUTS.

---

# GOVERNANCE

Any change to Coach Context fields, Player Profile templates, Confidence Gate ranges, pipeline execution order, suppression detection rules, multi-level protocol, position group weighting, or V1 protocol requires documentation, versioning, and approval.
