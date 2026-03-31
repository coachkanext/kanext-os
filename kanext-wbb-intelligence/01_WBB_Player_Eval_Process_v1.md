# WBB PLAYER EVALUATION PROCESS
## v1.0 - Women's Basketball Intelligence

---

# COACH CONTEXT SETUP

COACH CONTEXT SETUP - v1 (LOCKED)

## Purpose
Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

## Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. Program Name
2. Governing Body - NCAA, NAIA, NJCAA, CCCAA, USCAA, NCCAA
3. Division (if applicable) - NCAA: D1/D2/D3, NJCAA: D1/D2/D3, NCCAA: D1/D2
4. Major Class (required only if NCAA D1) - High-Major, Mid-Major, Low-Major
5. Offensive System - must match one of the 12 defined offensive systems in the UI System Set
6. Defensive System - must match one of the 10 defined defensive systems in the UI System Set

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

## Optional Metadata
1. Conference

Non-blocking if blank. Used by KLVN for D1 Major Class auto-assignment when available (per KLVN D1 Conference Class Mapping). Does not affect evaluation math directly.

## Optional Constraints (Downstream Only)
These fields do not alter trait scoring, position weighting, system fit, or Base KR computation. They are consumed only by downstream planning and recommendation systems (Scholarship/NIL Allocation, Recruiting, Roster Construction).

1. Scholarships Available (max 15 for women's basketball across all governing bodies with scholarship programs)
2. NIL Pool (default $0)
3. Institutional / Merit Aid Capacity
4. Need-Based Aid Availability
5. Operating Budget
6. Recruiting Budget
7. Roster Size Target
8. Staffing Capacity Band - Lean, Standard, Elite

## Context Lock
When all required fields (1-6) are populated and validated, system state transitions to Coach Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

## Governance
System names in fields 5 and 6 must exactly match the UI System Set. Governing body, division, and major class must exactly match KLVN level keys. Any change to required fields, validation rules, or downstream bindings requires documentation, versioning, and approval.

## UI System Set (Identical to Men's - Same 22 Systems)
**Offensive Systems (12):** Spread Pick-and-Roll, 5-Out Motion, Motion / Read & React, Pace & Space, Dribble Drive, Princeton, Flex, Swing, Post-Centric / Inside-Out, Moreyball, Heliocentric, Coach K
**Defensive Systems (10):** Containment Man, Pack Line, Pressure Man (Denial), Switch Everything, ICE / No-Middle, Zone (Structured), Matchup Zone / Hybrid, Press / Pressure Defense, Junk / Special, Coach K

Note: Women's basketball uses the same 22 system taxonomy as men's. Post-Centric / Inside-Out and Zone (Structured) are more prevalent in women's basketball relative to men's at most levels. Pace & Space and Heliocentric are less common at lower levels but increasingly adopted at D1 HM programs.

---

# PLAYER PROFILE

Player Profile (Auto-Populated Record)

## A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth
- Age (derived)
- Height (current) + height history (if available)
- Weight (current) + weight history (if available)
- Declared position(s) (source-listed only)
- City/Town of origin
- State/Province
- Country
- High school / prep school
- Club / AAU program
- Current team affiliation (if applicable)

## B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- League / competition level (as reported)
- Season/year label
- Dates active (if available)

## C) Raw On-Court Production (Season-by-Season)
For each season:
- Games played
- Games started (if available)
- Minutes played
- Points
- Rebounds (offensive + defensive if available)
- Assists
- Steals
- Blocks
- Turnovers
- Fouls
- Shooting totals: FG made/attempted, 3PT made/attempted, FT made/attempted

Note: Three-point line distance changed in 2021-22 for NCAA women's (from 20'9" to 22'1.75"). Historical 3PT data from pre-2021-22 must be flagged with the line distance for accurate trait scoring.

## D) Academic Record (Public / Declared Only)
- GPA (if available)
- Academic honors (if available)
- Publicly reported eligibility status (if available)

## E) Declared Medical Information (Public Only)
- Declared injuries (if available)
- Public injury reports (if available)
- Medical redshirt designations (if applicable)
- Pregnancy/maternity leave (if publicly disclosed) - see Suppression Detection Rules

## F) Off-Court Public Record (Observable Only)
- Public statements (if captured)
- Social media presence (handles only)
- Verifiable public incidents (if applicable)
- Awards and honors

## G) Contact and Identification Metadata (Legal / Voluntary Only)
- Phone number(s)
- Email address(es)
- Social media handles

## H) Source Attribution + Trust Metadata (Per Field)
- Source for each element
- Verification status: verified / unverified
- Known coverage gaps (missing seasons, missing stats, etc.)

## Locked Exclusions (never in Player Profile)
- Evaluations/ratings/KRs
- Attributes, badges, archetypes
- Role inference or system fit
- Private medical or disciplinary records
- Household income / parental info
- Subjective recruiting opinions

---

# PLAYER CONFIDENCE GATE

PLAYER CONFIDENCE GATE - v1 (LOCKED STRUCTURE, PROVISIONAL RANGES)

## Purpose
Confidence % is a single number that communicates evidence completeness and stability for a player evaluation. It answers: "how much should you trust this KR?"

## Output
confidence_pct is a value between 0 and 100. Computed at the end of player evaluation.

## What It Affects
Confidence % does not change any KR math. It is used for transparency and optionally for gating what the system is allowed to claim or trigger downstream.

## Mode Auto-Detection
Nexus auto-detects evaluation mode based on data availability. No user choice, no asking.
- Box-score sources only -> Production-Based Mode
- Granular sources present (Synergy / PlayVision / KaNeXT-tag) -> Full Player KR Mode

## Trait Coverage by Mode
The Trait Library defines 47 traits across 8 clusters. Each trait is marked as TRUE, PROXY, or UNSCORED per data layer.

In Production-Based Mode, only TRUE and PROXY traits produce scores. UNSCORED traits return null. Position weighting renormalizes around scored traits only. Confidence reflects the reduced trait coverage.

In Full Player KR Mode, all 47 traits are scoreable. Confidence reflects data depth, sample size, and multi-year stability.

## Confidence Ranges (Provisional - v1)

| Data Available | Production-Based KR Confidence % | Full Player KR Confidence % |
|---------------|----------------------------------|---------------------------|
| Official college stats only, multi-year | 80-85% | 35-55% |
| Official college stats + HS stats | 82-88% | 40-60% |
| Multi-year across levels (NJCAA->NAIA/NCAA, etc.) | 85-90% | 45-65% |
| 1 year Synergy + official stats | 85-92% | 65-80% |
| Multi-year Synergy + official stats | 90-95% | 75-88% |
| 1 year PlayVision + official stats | 85-92% | 65-80% |
| Multi-year PlayVision + official stats | 90-95% | 75-88% |

## Women's Basketball Data Availability Note
Women's basketball has historically less granular data coverage than men's at most levels. Her Hoop Stats provides the best advanced metrics. Synergy/PlayVision coverage for women's basketball is expanding but remains less comprehensive than men's, particularly below D1 level. Confidence ranges should be calibrated with this data gap in mind.

## Governance
Any change to confidence ranges, mode detection logic, or gating rules requires documentation, versioning, and approval.

---

# PLAYER EVALUATION ENGINE - MASTER EXECUTION FLOW

PLAYER EVALUATION ENGINE - MASTER EXECUTION FLOW (LOCKED)

## Purpose
This document defines the complete execution order for producing a player's Final System KR. It is the single source of truth for what runs, in what order, what each phase consumes, and what each phase produces. Every phase is deterministic - same inputs, same outputs, every time.

## Architecture
The pipeline has two blocks.

Block 1 builds the player's Base Truth - who they are independent of any system. This never changes regardless of coach context.

Block 2 applies System Context - how this player fits within the coach's selected systems. This reruns when systems change. Base Truth does not.

## BLOCK 1 - BASE TRUTH (System-Agnostic)

### Coach Context Setup
Must pull from: Coach Context Setup
Coach completes all required fields. System state after completion: Coach Context Locked.
Binds: KLVN level key, KR legend selection, position weighting level (College/Pro)

### Mode Auto-Detect
Must pull from: Player Confidence Gate
Box-score sources only -> Production-Based Mode. Granular sources present -> Full Player KR Mode.

### Player Profile Build
Must pull from: Player Profile (Auto-Populated Record)
Nexus builds the factual record: identity, seasons, raw production, awards/honors, source metadata. No traits. No KRs. No archetypes. No evaluation of any kind.

### Trait Scoring
Must pull from: Trait Library (8 clusters, 47 traits) - WOMEN'S SPECIFIC BANDS
Must pull from: KLVN (Level Normalization)
Score all 47 traits against the active data layer using WOMEN'S-SPECIFIC SCORING BANDS. Only traits defined in the library may exist. If a trait requires data that is missing or UNSCORED in the active layer, trait = UNSCORED (null). Never guessed, never inferred.

KLVN normalization is applied to production inputs to ensure cross-level comparability. Trait scoring is deterministic, independent of team context, opponent, role, or system.

CRITICAL: Women's trait bands differ from men's. A women's player shooting 40% from three is MORE elite relative to the women's distribution than a men's player at 40% is relative to the men's distribution. All scoring uses women's-specific bands from File 02.

Output: 47 trait scores (each 0-100 or null)

### Position Weighting + Base KR
Must pull from: Position Trait Weighting (5 positions x College/Pro) - WOMEN'S OPF
Apply position-specific trait weights to compute four component KRs:
- OKR (Offense KR) - from Shooting, Finishing, Playmaking trait weights
- DKR (Defense KR) - from POA Defense, Team Defense, Rebounding trait weights
- TKR (Tools KR) - from Tools trait weights
- IQKR (IQ KR) - from IQ trait weights

UNSCORED traits contribute zero weight. Remaining scored traits renormalize to carry the full weight within their cluster.

Compute Base Player KR using position-specific OPF:
Base Player KR = (OKR x OPF_off) + (DKR x OPF_def) + (TKR x OPF_tools) + (IQKR x OPF_iq)

OPF varies by position and level. Women's OPF weights may differ slightly from men's due to differences in positional value distribution. Example: Post play is more prominent in women's basketball, so C offensive weight may be higher than men's.

Output: Base Off KR, Base Def KR, Base TKR, Base IQKR, Base Player KR

### Badges
Must pull from: Badge Cap & Effect Spec (34 badges) - WOMEN'S THRESHOLDS
Evaluate each badge against Skill KR gates and required trait gates per tier:
- College: Bronze (Skill KR >= 90, traits >= 90), Silver (>= 94), Gold (>= 97)
- Pro: Bronze (>= 93), Silver (>= 96), Gold (>= 98)
Apply KR lift: Bronze +0.5, Silver +1.0, Gold +1.5. Total badge lift cap: +3.5 KR.

Output: Badge list + post-badge Base Player KR

### Archetype Assignment
Must pull from: Archetype Library (21 archetypes) - WOMEN'S ADAPTED
Evaluate each archetype against Skill KR floors, primary trait gates, and support trait gates.
Primary archetype: full gates. Secondary archetype: Skill KR floor relaxed by -5.

Output: Primary archetype(s), secondary archetype(s), or none

### Overrides
Must pull from: Overrides - WOMEN'S SPECIFIC
College: 8 positive overrides, max 1 applies. Ranging from +0.75 to +5.0 KR.
Pro: 4 positive overrides (max 1, each +1.0) + 4 negative overrides (always apply).

Output: Override applied (if any) + post-override Base Player KR

### Impact Modifier Assignment
Must pull from: Impact Modifiers
Evaluate in strict precedence: Primary Engine -> Secondary Engine -> Force Multiplier -> Specialist Anchor -> Unclassified.

Output: Impact Modifier label

### Base Truth Lock
At this point, the following are locked:
- 47 trait scores (including UNSCORED flags)
- Position-weighted component KRs (OKR, DKR, TKR, IQKR)
- Base Player KR (post-badges, post-overrides)
- Badge list
- Archetype assignment(s)
- Impact Modifier label

## BLOCK 2 - SYSTEM CONTEXT

### System Fit
Must pull from: System Fit - Offensive Trait Weighting (12 systems x 5 positions)
Must pull from: System Fit - Defensive Trait Weighting (10 systems x 5 positions)
Load the offensive system profile selected in Coach Context. Reweight OKR internals. Load the defensive system profile. Reweight DKR internals.

Compute:
- Final System Off KR
- Final System Def KR
- Final System Player KR = (System Off KR x OPF_off) + (System Def KR x OPF_def) + (System TKR x OPF_tools) + (System IQKR x OPF_iq)

Output: Final System Off KR, Final System Def KR, Final System Player KR

### System Risks
Must pull from: System Risks (14 total: 9 major, 5 minor)
College: Major -2.0 KR, Minor -1.0 KR. Pro: Major -4.0 KR, Minor -2.0 KR.
Penalties are additive, applied to Final System Player KR.

Output: System risk list + post-risk Final System Player KR

### Finalization
Must pull from: College Player KR Legend or Pro Player KR Legend (WOMEN'S LEGENDS)
Must pull from: Player Confidence Gate
Interpret Final System Player KR against the level-appropriate WOMEN'S legend.
Compute confidence_pct from the Confidence Gate table.

Output: Final System Player KR (locked), legend tier label, confidence_pct, full audit trail

## Determinism Guarantee
Given the same Coach Context, the same player data, and the same data layer - the pipeline produces identical outputs every time.

---

# CONTEXTUAL MODE

CONTEXTUAL MODE - PLAYER KR ESTIMATION FROM PUBLIC METRICS - v1 (LOCKED)

## Purpose
Contextual Mode exists to produce an honest KR range for players who cannot be evaluated through the full trait pipeline because the required granular data does not exist.

## When Contextual Mode Activates
Nexus activates Contextual Mode when ALL of the following are true:
1. Box-score data exists (season averages or game logs).
2. No Synergy / PlayVision / KaNeXT-tag data exists for this player.
3. The box-score trait pipeline has been tested and confirmed structurally insufficient for this player's data profile.

## Inputs
Three tiers of input, each with explicit trust hierarchy:

**Tier 1 - Public Box-Score Data (Verified)**
Season averages and game logs from official sources. Trust: Highest.

**Tier 2 - Public Advanced Metrics (Derived)**
Where available: BPM, PER, TS%, Usage%, AST%, TOV%, ORB%, DRB%, STL%, BLK%, On/Off net rating. Trust: High.

Women's basketball advanced metrics sources: Her Hoop Stats is the primary source. ESPN and Basketball Reference provide limited advanced stats for women's basketball. Advanced metric availability is less comprehensive than men's, particularly below D1 level.

**Tier 3 - Contextual Intelligence (Structured)**
Information that changes interpretation of Tier 1 and Tier 2 data:
- Roster Context
- Defensive Attention
- Role Suppression
- Multi-Level Context
- Coach Direct Knowledge
- Scouting Confirmation
- Prospect Pedigree
- Pregnancy/Motherhood Context (unique to women's basketball - see Suppression Detection)

Trust hierarchy: Tier 1 > Tier 2 > Tier 3.

## Process
Contextual Mode executes in six phases. Each phase is deterministic given inputs. No phase is skippable.

**Phase 1 - Data Inventory:** Catalog all available data by source, competition level, game count, and completeness.

**Phase 2 - Level-Segmented Stat Compilation:** Compute per-game averages segmented by competition level. Do NOT blend stats across levels.

**Phase 3 - Legend Anchor Mapping:** For each level segment, map the player's production profile against the WOMEN'S KR Legend for that level.

**Phase 4 - Trait Confirmation Layer:** Attempt to confirm or deny specific traits from the Trait Library using available data. Four statuses: CONFIRMED, INFERRED, SUPPRESSED, UNSCORED.

**Phase 5 - Archetype, Badge, and Override Feasibility Check:** Using the partial trait vector, check feasibility.

**Phase 6 - KR Range Synthesis + What We Know / What We Don't Know:** Synthesize all prior phases into a final KR range.

Output: Final Contextual KR Range (low, high, central), confidence_pct, component KR estimates, legend interpretation at each relevant level, What We Know, What We Don't Know, What Changes If.

---

# MULTI-LEVEL PLAYER PROTOCOL

When a player competes across multiple governing body levels in a single season:

1. Each level's data is evaluated separately through Phases 1-3, producing level-specific stat lines and raw KR ranges.
2. The highest-level data carries the most interpretive weight for KR estimation.
3. Lower-level data is used to CONFIRM capabilities that higher-level data cannot show due to suppression.
4. Cross-level stat divergence is a signal, not noise.
5. The final KR range is anchored to the highest level the player has meaningful data at.
6. KLVN lambdas are applied when translating the final KR to a specific level's legend.

---

# SUPPRESSION DETECTION RULES

Contextual Mode must actively detect and flag statistical suppression. Suppression occurs when a player's box-score output is artificially depressed by factors external to their ability. Detected suppression adjusts interpretation, not data.

## Standard Suppression Indicators (Same as Men's)

**Sole Threat** - Player accounts for 35%+ of team scoring AND 30%+ of team 3PA AND no other teammate averages 12+ PPG.

**Roster Quality Gap** - Coach-reported or observable teammate quality is 15+ KR points below the player being evaluated.

**Scouting Confirmation** - Opposing coaching staff confirms the player was the primary or sole scouting focus.

**Level Mismatch** - Player's home institution competes at a level 3+ KLVN tiers below the games being analyzed.

**Cross-Level Stat Divergence** - Player's assist, steal, or rebound averages diverge 50%+ between highest and lowest competition levels.

**Role Overload** - Player is the sole ball handler AND primary scorer AND team's only perimeter threat.

## Women's Basketball Specific Suppression Indicators

**Pregnancy/Motherhood Suppression (UNIQUE TO WOMEN'S BASKETBALL)**
This suppression type has no equivalent in men's basketball. It applies when:
- A player has publicly disclosed a pregnancy or birth within the past 24 months
- The player has returned to competition after pregnancy/childbirth
- The player's current production is below their pre-pregnancy baseline

Detection signals:
- Season-over-season production decline with no injury explanation
- Public disclosure of pregnancy/maternity leave
- Extended absence followed by return with reduced minutes or role
- Physical tool metrics (TKR) showing decline from prior baseline

Treatment:
- Produce BOTH the current visible production estimate AND the pre-pregnancy baseline
- Flag the gap as "Pregnancy Suppression" with the estimated recovery timeline
- Do NOT treat pregnancy suppression as permanent decline. Multiple elite players (Candace Parker, Skylar Diggins-Smith, Natasha Cloud, A'ja Wilson, Napheesa Collier, and many others) have returned to elite or near-elite production within 1-2 seasons
- The pre-pregnancy baseline is the stronger signal for true talent level when the player is within 24 months of return
- After 24 months of post-return play, if production has not recovered, the current production becomes the primary anchor

Confidence adjustment: When pregnancy suppression is detected, confidence_pct is reduced by 5-10 points to reflect the additional uncertainty in the current-state estimate.

**Stacked Roster Suppression**
More common in women's basketball than men's due to scholarship limits and the depth of talent at top programs. When elite programs stockpile talent:
- Multiple players who would be primary options elsewhere are sharing touches
- Per-game averages are suppressed by touch distribution, not ability
- Detection: player shows elite efficiency on reduced volume AND demonstrates ability in spot starts or when teammates miss games
- Treatment: evaluate both the current role production and the projected production in a primary role

**System Suppression - Post Play Underutilization**
Some women's basketball programs underutilize post players in favor of perimeter-oriented offenses, even when the roster includes elite post talent. This is a specific form of system suppression:
- Detection: post player with elite size and efficiency averaging fewer than 8 FGA per game in a perimeter-heavy system
- Treatment: project post-oriented production from efficiency and physical tools; note system mismatch

## Suppression Output Format
When suppression is detected, Contextual Mode produces both the visible stat-based estimate (what the box score says) and the context-adjusted estimate (what the player likely is). Both are reported transparently. Neither overwrites the other.

## Degree of Difficulty Adjustment
Standard trait bands assume a normal distribution of shot types, distances, and creation methods. Some players operate outside these assumptions. When a player's shot profile is materially different from the assumed norm, Contextual Mode applies a Degree of Difficulty disclosure.

## What Contextual Mode Does NOT Do
- Does not produce a single-number KR. Produces a range.
- Does not assign archetypes. Reports feasibility.
- Does not assign badges. Reports feasibility.
- Does not apply System Fit (Block 2).
- Does not replace the trait pipeline.
- Does not project or develop. Evaluates current state only.
- Does not invent data.
- Does not blend stats across competition levels into a single average.

---

# FOUNDING TEST CASES

Test cases for women's basketball intelligence system validation will be developed using players across multiple competitive levels with known production profiles, known awards, and known post-college outcomes. Priority calibration targets:

**D1 HM Calibration Anchors:**
- National POY tier (98-100): A'ja Wilson (South Carolina), Caitlin Clark (Iowa), Breanna Stewart (UConn) - all in their peak college seasons
- All-American tier (95-97): Paige Bueckers (UConn), Aliyah Boston (South Carolina), Rhyne Howard (Kentucky)
- High-Impact Starter tier (92-94): All-Conference first team selections at top programs
- Rotation/Role tiers (80-88): Supporting cast on Final Four teams

**Multi-Level Calibration:**
- Players who transferred up from mid-major to high-major
- JUCO-to-D1 transfers
- International players entering NCAA competition

**Pro Calibration:**
- WNBA All-Stars with known college production
- First-round picks vs second-round picks vs undrafted

Calibration is ongoing. Zero rank inversions is the validation standard.
