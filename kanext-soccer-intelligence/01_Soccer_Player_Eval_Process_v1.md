# COACH CONTEXT SETUP

COACH CONTEXT SETUP -- v1 (LOCKED)

Purpose
Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. Program Name
2. Governing Body -- NCAA, NAIA, NJCAA, CCCAA, USCAA, NCCAA (college) OR Professional League (pro)
3. Division (if applicable) -- NCAA: D1/D2/D3, NJCAA: D1/D2/D3, NCCAA: D1/D2
4. Major Class (required only if NCAA D1) -- High-Major, Mid-Major, Low-Major
5. Formation -- primary match formation (e.g., 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2)
6. Offensive System -- must match one of the 12 defined offensive systems in the UI System Set
7. Defensive System -- must match one of the 10 defined defensive systems in the UI System Set

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

Optional Metadata
1. Conference -- non-blocking if blank. Used by KLVN for D1 Major Class auto-assignment.
2. League (pro only) -- Premier League, La Liga, etc.

Optional Constraints (Downstream Only)
These fields do not alter trait scoring, position weighting, system fit, or Base KR computation. Consumed only by downstream planning and recommendation systems.

1. Scholarships Available (cannot exceed preloaded max for governing body/division)
2. NIL Pool (default $0)
3. Institutional / Merit Aid Capacity
4. Need-Based Aid Availability
5. Operating Budget
6. Recruiting Budget
7. Roster Size Target
8. Staffing Capacity Band -- Lean, Standard, Elite
9. Transfer Budget (pro only)
10. Wage Budget (pro only)

Context Lock
When all required fields (1-7) are populated and validated, system state transitions to Coach Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

Governance
System names in fields 6 and 7 must exactly match the UI System Set. Governing body, division, and major class must exactly match KLVN level keys. Formation must be a valid football formation. Any change to required fields, validation rules, or downstream bindings requires documentation, versioning, and approval.


# PLAYER PROFILE

Player Profile (Auto-Populated Record)

A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth
- Age (derived)
- Height (current, cm) + height history (if available)
- Weight (current, kg) + weight history (if available)
- Preferred foot (Left / Right / Both)
- Declared position(s) (source-listed only)
- City/Town of origin
- State/Province
- Country
- Nationality (may hold multiple)
- High school / prep school
- Youth club / academy
- Current team affiliation (if applicable)
- Passport(s) held (relevant for international registration rules)

B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- League / competition level (as reported)
- Season/year label
- Dates active (if available)
- Contract status (pro: expiry date, loan status; college: eligibility remaining)

C) Raw On-Pitch Production (Season-by-Season)
For each season:
- Appearances (starts + sub appearances)
- Minutes played
- Goals
- Assists
- Shots (total)
- Shots on target
- Shot conversion rate
- Yellow cards
- Red cards
- Fouls committed
- Fouls drawn
- Tackles won (if available)
- Interceptions (if available)
- Aerial duels won/lost (if available)
- Pass completion % (if available)
- Clean sheets (defenders/GK)
- Goals conceded (defenders/GK)
- Saves / Save % (GK only)

D) Advanced Metrics (Where Available -- Pro/D1 Only)
- xG (expected goals)
- xA (expected assists)
- npxG (non-penalty xG)
- Progressive passes/90
- Progressive carries/90
- Pressures/90
- Key passes/90
- Shot-creating actions/90
- Goal-creating actions/90
- Tackles + Interceptions/90
- PSxG +/- (GK)

E) Academic Record (College Only, Public/Declared)
- GPA (if available)
- Academic honors (if available)
- Publicly reported eligibility status
- Major / field of study

F) Declared Medical Information (Public Only)
- Declared injuries (if available)
- Public injury reports
- Medical redshirt designations (college, if applicable)
- Matches missed to injury by season

G) Off-Pitch Public Record (Observable Only)
- Public statements (if captured)
- Social media presence (handles only)
- Verifiable public incidents (if applicable)
- Awards and honors (All-Conference, All-American, Golden Boot, POTM, etc.)
- International caps and goals

H) Source Attribution + Trust Metadata (Per Field)
- Source for each element
- Verification status: verified / unverified
- Known coverage gaps

Locked Exclusions (never in Player Profile)
- Evaluations/ratings/KRs
- Attributes, badges, archetypes
- Role inference or system fit
- Private medical or disciplinary records
- Household income / parental info
- Subjective scouting opinions


# PLAYER CONFIDENCE GATE

PLAYER CONFIDENCE GATE -- v1 (LOCKED STRUCTURE, PROVISIONAL RANGES)

Purpose
Confidence % is a single number that communicates evidence completeness and stability for a player evaluation. It answers: "how much should you trust this KR?"

Output
confidence_pct in [0, 100]. Computed at the end of player evaluation.

What It Affects
Confidence % does not change any KR math. It is used for transparency and optionally for gating what the system is allowed to claim or trigger downstream.

Mode Auto-Detection
Nexus auto-detects evaluation mode based on data availability. No user choice, no asking.
- Box-score sources only (goals, assists, minutes, appearances) -> V1 Production-Based Mode
- Advanced metrics present (xG, xA, progressive stats, pressures) -> V1+ Mode
- Event-level data present (Opta, StatsBomb, Wyscout tagged actions) -> V2 Mode
- Multi-season event-level data + tracking data -> V3 Full Player KR Mode

Trait Coverage by Mode
The Trait Library defines 54 traits across 8 clusters. Each trait is marked as TRUE, PROXY, or UNSCORED per data layer.

In V1 (box-score only): ~7-8 traits produce scores at college level, ~15-18 at pro level. UNSCORED traits return null. Position weighting renormalizes around scored traits only. Confidence reflects reduced trait coverage.

In V3 (full event + tracking data): all 54 traits are scoreable. Confidence reflects data depth, sample size, and multi-year stability.

Confidence Ranges (Provisional -- v1)

| Data Available | V1 Confidence % | Full KR Confidence % |
|---|---|---|
| College box score only, single season | 40-50% | 20-35% |
| College box score, multi-year | 50-60% | 30-45% |
| College box score + multi-level (NJCAA->NAIA/NCAA, etc.) | 55-65% | 35-50% |
| Pro box score only (G, A, appearances) | 55-65% | 30-45% |
| Pro box score + advanced composites (xG, xA, progressive) | 65-75% | 45-60% |
| 1 season event-level (Opta/StatsBomb/Wyscout) | 70-80% | 55-70% |
| Multi-season event-level | 78-88% | 65-80% |
| 1 season event + tracking data (GPS/optical) | 80-88% | 70-82% |
| Multi-season event + tracking | 85-95% | 78-90% |

Minutes Thresholds for Valid Evaluation

| Level | Minimum Minutes | Minimum Appearances | Notes |
|---|---|---|---|
| Pro (top-5 leagues) | 900 | 10 starts | Half a season. Below this = Low Sample flag. |
| Pro (other leagues) | 700 | 8 starts | Slightly lower bar. |
| NCAA D1 | 600 | 8 starts | ~15 matches x 40 min avg |
| NCAA D2/D3 | 500 | 7 starts | |
| NAIA | 500 | 7 starts | |
| NJCAA | 400 | 6 starts | Shorter seasons |
| CCCAA | 400 | 6 starts | |
| USCAA/NCCAA | 300 | 5 starts | Smaller schedules |
| Youth/Academy (U21) | 400 | 6 starts | |
| Youth/Academy (U18) | 300 | 5 starts | |

Below minimum: Evaluation can proceed but confidence_pct is capped at 45% and output is flagged as LOW_SAMPLE.

Governance
Any change to confidence ranges, mode detection logic, minutes thresholds, or gating rules requires documentation, versioning, and approval.


# PLAYER EVALUATION ENGINE -- MASTER EXECUTION FLOW

PLAYER EVALUATION ENGINE -- MASTER EXECUTION FLOW (LOCKED)

Purpose
This document defines the complete execution order for producing a player's Final System KR. It is the single source of truth for what runs, in what order, what each phase consumes, and what each phase produces. Every phase is deterministic.

Architecture
The pipeline has two blocks.

Block 1 builds the player's Base Truth -- who they are independent of any system. This never changes regardless of coach context. A player's Base Truth is the same whether the coach runs Tiki-Taka or Counter-Attack, High Press or Low Block.

Block 2 applies System Context -- how this player fits within the coach's selected systems. This reruns when systems change. Base Truth does not.

BLOCK 1 -- BASE TRUTH (System-Agnostic)

Coach Context Setup
Must pull from: Coach Context Setup
Coach completes all required fields: Program Name, Governing Body, Division, Major Class (if NCAA D1), Formation, Offensive System, Defensive System. Optional metadata and constraints stored for downstream use.
System state after completion: Coach Context Locked.
Binds: KLVN level key, KR legend selection, position weighting level (College/Pro)

Mode Auto-Detect
Must pull from: Player Confidence Gate
Nexus auto-detects evaluation mode based on data availability. No user choice.
- Box-score only -> V1 Production-Based Mode
- Advanced metrics -> V1+ Mode
- Event-level -> V2 Mode
- Multi-season event + tracking -> V3 Mode

Player Profile Build
Must pull from: Player Profile (Auto-Populated Record)
Build the factual record: identity, seasons, raw production, awards. No traits. No KRs. No archetypes.

Trait Scoring
Must pull from: Trait Library (8 clusters, 54 traits)
Must pull from: KLVN (Level Normalization)
Score all 54 traits against the active data layer. Only traits defined in the library may exist. Missing data = UNSCORED (null). Never guessed, never inferred.
KLVN normalization applied to production inputs for cross-level comparability.
Output: 54 trait scores (each 0-100 or null)

Position Weighting + Base KR
Must pull from: Position Trait Weighting (10 positions x College/Pro)
Apply position-specific trait weights to compute four component KRs:
- AKR (Attack KR) -- from Shooting, Chance Creation, Dribbling trait weights
- DKR (Defense KR) -- from Defending Individual, Defending Collective trait weights
- TKR (Tools KR) -- from Tools trait weights
- IQKR (IQ KR) -- from Tactical IQ trait weights

UNSCORED traits contribute zero weight. Remaining scored traits renormalize.

Compute Base Player KR using position-specific OPF:
Base Player KR = (AKR x OPF_att) + (DKR x OPF_def) + (TKR x OPF_tools) + (IQKR x OPF_iq)

OPF varies by position and level.
- College: ST = 56/8/24/12, CB = 6/46/30/18 (Tools weighted higher)
- Pro: ST = 58/10/18/14, CB = 8/48/24/20 (Tactical IQ weighted higher)

Output: Base AKR, Base DKR, Base TKR, Base IQKR, Base Player KR

Badges
Must pull from: Badge Cap & Effect Spec (36 badges)
Evaluate each badge against Skill KR gates and required trait gates per tier:
- College: Bronze (Skill KR >= 88, traits >= 88), Silver (>= 92), Gold (>= 96)
- Pro: Bronze (>= 90), Silver (>= 94), Gold (>= 97)
KR lift: Bronze +0.5, Silver +1.0, Gold +1.5. Total badge lift cap: +3.5 KR.
Output: Badge list + post-badge Base Player KR

Archetype Assignment
Must pull from: Archetype Library (29 archetypes)
Evaluate each archetype against Skill KR floors, primary trait gates, support trait gates. All thresholds numeric and deterministic.
Primary archetype: full gates. Secondary: Skill KR floor relaxed by -5.
Archetypes are descriptive labels. They do not change KR.
Output: Primary archetype(s), secondary archetype(s), or none

Overrides
Must pull from: Overrides
- College: 5 positive (max 1 applies, +0.75 to +5.0), 4 negative (always apply)
- Pro: 8 positive (max 1 applies), 4 negative (always apply)
Output: Override applied (if any) + post-override Base Player KR

Impact Modifier Assignment
Must pull from: Impact Modifiers
Evaluate in strict precedence: Primary Engine -> Secondary Engine -> Force Multiplier -> Specialist Anchor -> Unclassified.
One modifier max per player. Does not alter KR.
Output: Impact Modifier label

Base Truth Lock
At this point, the following are locked:
- 54 trait scores (including UNSCORED flags)
- Position-weighted component KRs (AKR, DKR, TKR, IQKR)
- Base Player KR (post-badges, post-overrides)
- Badge list
- Archetype assignment(s)
- Impact Modifier label

This is the player's system-agnostic identity.

BLOCK 2 -- SYSTEM CONTEXT

System Fit
Must pull from: System Fit -- Offensive Trait Weighting (12 systems x 10 positions)
Must pull from: System Fit -- Defensive Trait Weighting (10 systems x 10 positions)

Load the offensive system profile selected in Coach Context. Reweight AKR internals (Shooting/Chance Creation/Dribbling distributions shift per system). Load the defensive system profile. Reweight DKR internals (Defending Individual/Defending Collective distributions shift per system).

OPF buckets do not change. Only trait weight distributions inside each bucket change.

Compute:
- Final System Off KR -- from system-reweighted offensive traits
- Final System Def KR -- from system-reweighted defensive traits
- Final System Player KR = (System Off KR x OPF_att) + (System Def KR x OPF_def) + (System TKR x OPF_tools) + (System IQKR x OPF_iq)

Output: Final System Off KR, Final System Def KR, Final System Player KR

System Risks
Must pull from: System Risks (14 total: 9 major, 5 minor)
- Major: -2.0 KR. Minor: -1.0 KR. (Pro: Major -4.0, Minor -2.0)
Penalties additive, applied to Final System Player KR.
Output: System risk list + post-risk Final System Player KR

Finalization
Must pull from: College KR Legend or Pro KR Legend (based on level)
Must pull from: Player Confidence Gate
Interpret Final System Player KR against the level-appropriate legend.
Compute confidence_pct.
Output: Final System Player KR (locked), legend tier label, confidence_pct, full audit trail

Determinism Guarantee
Same Coach Context + same player data + same data layer = identical outputs every time.


# CONTEXTUAL MODE

CONTEXTUAL MODE -- PLAYER KR ESTIMATION FROM PUBLIC METRICS
v1 (LOCKED)

Purpose
Contextual Mode produces an honest KR range for players who cannot be evaluated through the full trait pipeline because required data does not exist.

It answers: Given everything publicly observable about this player, what KR range is defensible, and what is the confidence boundary?

When Contextual Mode Activates
ALL of the following are true:
1. Basic production data exists (goals, assists, minutes, appearances).
2. No event-level or advanced metric data exists.
3. The box-score trait pipeline has too many UNSCORED traits for reliable KR computation.

Typical activation: college players below D1, players at non-data-rich leagues, players crossing multiple competition levels in a single season.

Inputs (Three Tiers)

Tier 1 -- Public Box-Score Data (Verified)
Goals, assists, appearances, minutes, cards, team results from official sources. Must include opponent identification and competition level.
Trust: Highest.

Tier 2 -- Public Advanced Metrics (Derived)
Where available: xG, xA, progressive passes, key passes, tackles+interceptions, aerial duel win %, pass completion %. Consumed as directional signals.
Trust: High.

Tier 3 -- Contextual Intelligence (Structured)
- Roster Context: teammate quality estimate, number of viable offensive options
- Defensive Attention: is this player the primary scouting target?
- Role Suppression: handling responsibilities beyond natural role due to roster limitations
- Multi-Level Context: player competes across multiple levels in a single season
- Coach Direct Knowledge: first-hand observation
- Scouting Confirmation: opposing staff confirms scouting focus
- Prospect Pedigree: youth international history, academy background, prior higher-level roster membership

Trust hierarchy: Tier 1 > Tier 2 > Tier 3. Tier 3 cannot override Tier 1 data.

Process (Six Phases)

Phase 1 -- Data Inventory
Catalog all available data by source, competition level, match count, completeness.
Output: Data Inventory Table, Tier 3 Input Registry.

Phase 2 -- Level-Segmented Stat Compilation
Compute per-season averages segmented by competition level. Do NOT blend stats across levels.
Output: Level-segmented stat table.

Phase 3 -- Legend Anchor Mapping
For each level segment, map the player's production profile against the KR Legend for that level. Pattern matching, not formula.
Key mapping inputs: goals/match relative to level norms, assists relative to norms, minutes and role indicators, team success context, awards.
Output: Raw KR range per level segment with legend tier citation.

Phase 4 -- Trait Confirmation Layer
For each of the 54 traits, determine one of four statuses:
- CONFIRMED: data directly supports scoring. Cite evidence.
- INFERRED: data + Tier 3 context strongly suggests a trait level. Produce estimated range with justification.
- SUPPRESSED: evidence suggests trait exists at higher level than data shows, but context masks it. Report both visible and estimated true score.
- UNSCORED: no data supports any estimate. Mark null.

Phase 5 -- Archetype, Badge, and Override Feasibility Check
Using partial trait vector from Phase 4, check which archetypes/badges/overrides the player could plausibly qualify for. Feasibility assessment, not assignment.

Phase 6 -- KR Range Synthesis + What We Know / What We Don't Know
Synthesize into final KR range. Report component KR estimates, confidence, legend interpretation at each level, "What We Know," "What We Don't Know," "What Changes If."


# SUPPRESSION DETECTION RULES

Suppression Detection Rules (Soccer-Specific)

Suppression occurs when a player's production is artificially depressed by factors external to their ability. Detected suppression adjusts interpretation, not data.

1. Role Suppression
Trigger: Creative player (CAM/W archetype) deployed in a defensive system where their attacking contribution is constrained by tactical role.
Evidence: Player's assist/chance creation numbers are below career norms despite no injury. System change correlates with production drop.
Example: A natural Advanced Playmaker producing 0.15 xA/90 in a Low Block system when career average in possession systems was 0.30 xA/90.

2. System Suppression
Trigger: Striker in a possession-heavy system that does not create clear chances, or a winger in a narrow formation where width is not used.
Evidence: Low shot volume / low touches in box despite good movement and positioning (from video/scouting). Team's overall xG is low despite high possession.
Example: Target Man scoring 4 goals in a Tiki-Taka system where the team refuses to cross. Career average in Wing Play systems was 12 goals/season.

3. Teammate Suppression
Trigger: Winger playing with a fullback who never overlaps, or a striker receiving no service because midfield lacks progressive passing ability.
Evidence: Player's production is significantly below career norms. Teammate quality gap is 15+ KR points below the evaluated player.
Example: Traditional Winger with 1 assist in a season where the fullback behind them has 0 progressive carries and 55% pass accuracy.

4. Injury Suppression
Trigger: Player returning from significant injury, minutes managed, or visibly not at full fitness.
Evidence: Post-injury production significantly below pre-injury career norms. Minutes restricted (subbed off before 70' consistently). Speed/stamina metrics (if tracked) below pre-injury baselines.
Example: Player with career 0.50 G/90 producing 0.20 G/90 in 12 appearances after ACL reconstruction, averaging 58 minutes per match.

5. Managerial Suppression
Trigger: New manager mid-season changed system, position, or role significantly.
Evidence: Production diverges before/after managerial change. Clear system shift confirmed by OSIE/DSIE.
Example: Inverted Winger producing 8 goals in 15 matches under Manager A (Inside Forward system), then 1 goal in 12 matches under Manager B (Wing Play system requiring crossing instead of cutting inside).

6. Sole Threat (College-Specific)
Trigger: Player accounts for 40%+ of team goals AND no other teammate scores more than 3 goals/season.
Evidence: All defensive attention focused on this player. Opposition scouting reports confirm.
Example: NAIA forward with 18 goals but facing double-teams and man-marking every match because no other teammate can score.

7. Level Mismatch
Trigger: Player's home institution competes at a level 3+ KLVN tiers below the matches being analyzed.
Evidence: Team quality gap compounds individual suppression. Player faces higher-level competition with lower-level teammates.

When suppression is detected, Contextual Mode produces BOTH the visible stat-based estimate AND the context-adjusted estimate. Both reported transparently.


# MULTI-LEVEL PROTOCOL

Multi-Level Player Protocol (Soccer)

When a player competes across multiple levels in a single period (e.g., college conference play + non-conference against higher opponents, or club + international duty):

1. Each level's data is evaluated separately through Phases 1-3.
2. Highest-level data carries the most interpretive weight for KR estimation.
3. Lower-level data CONFIRMS capabilities that higher-level data cannot show due to suppression.
4. Cross-level stat divergence is a signal, not noise.
5. Final KR range is anchored to the highest level with meaningful data.
6. KLVN lambdas applied when translating final KR to each level's legend.

Soccer-Specific Multi-Level Scenarios:
- College player with international duty (club + national team)
- NJCAA player who transferred mid-year to NAIA/D2
- Player with both college and semi-pro/amateur experience
- Academy player with first-team cameos + U21 regular minutes
- Loan player with data at parent club level AND loan club level


# V1 EVALUATION PROTOCOL -- v1.0

## Purpose
Defines how the Player Evaluation Pipeline operates at V1 data tier (box score + basic stats). Supplements the standard pipeline with V1-specific rules for handling the ~46 of 54 traits that cannot be scored from basic college box-score data.

At V1, the full 54-trait OPF math cannot produce accurate absolute KR values because 85%+ of traits are NULL at college level. This protocol combines production-based anchoring (Phase 3) with component-level estimation (Phase 6) to produce honest KR estimates.

## Data Available at V1

For every player at every college level:
- Goals, Assists, Appearances (starts + subs), Minutes
- Shots, Shots on Target (if available)
- Yellow Cards, Red Cards
- Height, Weight, Preferred Foot, Position
- Team Record (W-L-D)
- Awards (All-Conference, All-American, etc.)

At D1 with advanced stats available:
- Goals/90, Assists/90, Shot conversion, xG, xA (some sources)
- Pass completion %, Tackles, Interceptions (some sources)

## THE FIVE STEPS

### STEP 1: COACH CONTEXT
Set the program, level, governing body, division, major class (if D1), formation, offensive system, defensive system. Coach Context is Step 0 regardless of data tier. Binds: KLVN level key, KR legend selection, position OPF.

### STEP 2: PHASE 3 -- PRODUCTION ANCHOR
Map the player's production profile against the KR legend tiers at their level.

Inputs: Goals, assists, minutes, appearances, shot conversion, awards, team success context, role on team.

Process: Read the legend tier descriptions at the player's level. Find the tier whose description matches the player's actual production and role.

Output: A KR range (e.g., 82-85) representing where production fits in the legend.

Rules:
- Phase 3 uses the FULL production picture, not just goals
- Phase 3 does NOT project -- evaluates current season only
- Phase 3 does NOT use recruiting rankings, draft projections, or future potential
- For defenders/GKs: team defensive record (GA/match, clean sheets) is a primary input alongside individual stats

### STEP 3: PHASE 6 -- COMPONENT KR ESTIMATION
Score the four component KRs from available data:

AKR estimation:
- Goals/season and shot conversion (strongest signals)
- Assists/season (creation evidence)
- xG/xA overperformance (if available at D1)
- Set piece contribution (goals/assists from set pieces)

DKR estimation:
- Team GA/match (strongest signal for defenders)
- Clean sheets (GK/defensive record)
- Tackles + Interceptions (if available)
- Aerial duel win % (if available)
- Cards (inverse -- high card rate suggests defensive aggression but also risk)

TKR estimation:
- Height (always available)
- Minutes/match average (stamina proxy)
- Matches missed to injury (injury resilience proxy)
- Speed/strength: UNSCORED unless scouting data provides qualitative assessment

IQKR estimation:
- Largely UNSCORED at college V1. Estimated from indirect signals:
  - For midfielders: assists relative to position norms (passing intelligence proxy)
  - For defenders: team defensive record relative to roster quality (organizational proxy)
  - For forwards: shot conversion relative to volume (shot selection proxy)

Each component bounded by Phase 3 anchor expectations.

### STEP 4: PHASE 6 ADJUSTS WITHIN PHASE 3 +/- 10
Same rule as basketball. Phase 3 established anchor. Phase 6 adjusts within that window.

### STEP 5: FINAL KR
Adjusted number is the V1 KR.

Confidence caps by data coverage:

| Trait Coverage | Confidence Cap |
|---|---|
| 40+ of 54 scored (V2/V3) | 85-97% |
| 25-39 scored (V1+/event data) | 65-84% |
| 10-24 scored (V1 with advanced stats) | 45-64% |
| Below 10 scored (V1 basic box score) | 30-45% |

Output includes: Final KR, KR Range, Confidence %, Phase 3 anchor, Phase 6 component estimates, key strengths/weaknesses, Level Tier Map.

## KR IS UNIVERSAL -- CRITICAL RULE
Same as basketball. One KR, multiple legend reads. KLVN normalizes inputs, not outputs.

## DATA TIER PROGRESSION

| Data Tier | Traits Scored | Phase 3 Authority | Phase 6 Authority |
|---|---|---|---|
| V1 (college box score) | 7-10 | Primary -- anchors range | Secondary -- adjusts within range |
| V1 (pro box score + composites) | 15-20 | Primary -- anchors range | Growing -- more signals available |
| V1+ (advanced metrics: xG, xA, progressive) | 20-30 | Shared -- validates Phase 6 | Shared -- growing authority |
| V2 (event-level: Opta/StatsBomb 1 season) | 35-45 | Secondary -- validation check | Primary -- drives the KR |
| V3 (multi-season event + tracking) | 48-54 | Minimal -- sanity check only | Full authority -- KR is the math |

## Governance
- V1 Protocol supplements the standard pipeline
- When data tier upgrades, V1 output is superseded
- All V1 outputs flagged as V1_EVALUATION with confidence cap
- Phase 3 anchor logged alongside Phase 6 for audit trail
