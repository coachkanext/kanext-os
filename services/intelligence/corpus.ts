// Auto-generated from intelligence/ directory. Do not edit manually.
// To regenerate: node -e ... (see corpus generation script)

export const SKILL_MD = `---
name: KaNeXT Basketball Intelligence
description: >
  Use this skill for ANY basketball intelligence request including: player evaluation, team evaluation, KR rating, simulation, matchup analysis, scouting, game ops, development planning, transfer portal evaluation, pro projection, draft analysis, legend calibration, roster construction, scholarship/NIL allocation, or any reference to the KaNeXT intelligence system, Nexus, KR, KLVN, archetypes, system fit, or the evaluation pipeline.
---

# KaNeXT Basketball Intelligence — Master Skill

## HOW THIS WORKS
The basketball intelligence system is split across 6 knowledge files + this skill. Each file has a specific job. You route to the right file(s) based on what's being asked.

**CRITICAL:** File 02 (Reference) is 272K characters. NEVER load the whole thing. Search it for specific sections using the search terms below.

## ROUTING TABLE

### "Evaluate this player" / "What's his KR?" / "Rate [player]"

**FIRST: Determine the data tier.** If evaluating from box score + advanced composites (no play-type data, no PlayVision), this is V1. Most evaluations of real players using public data are V1.

**V1 evaluations (box score + composites):**
→ Search **File 01** for "V1 EVALUATION PROTOCOL" and follow the 5-step method:
  1. Set Coach Context
  2. Phase 3 — Production Anchor (map stats/role against legend tiers)
  3. Phase 6 — OPF math with composite bounding + proxy confidence weighting
  4. Phase 6 adjusts within Phase 3 ±10
  5. Final KR output
→ Search **File 02** for specific reference lookups as needed during evaluation (legends, trait bands, OPF weights)

**V1+/V2/V3 evaluations (play-type data or PlayVision available):**
→ Search **File 01** for the standard pipeline steps (Master Execution Flow)
→ Search **File 02** for specific lookups during evaluation:
  - Trait scoring: search "Shooting Cluster" or "Finishing Cluster" or [cluster name]
  - Archetype assignment: search "ARCHETYPE LIBRARY"
  - Badge check: search "BADGES"
  - Override check: search "OVERRIDES"
  - Risk check: search "SYSTEM RISKS"
  - Level normalization: search "KLVN"
  - Final interpretation: search "COLLEGE PLAYER KR LEGENDS" or "PRO PLAYER KR"
  - Impact modifiers: search "IMPACT MODIFIERS"
  - System demands: search "SYSTEM DEMAND PROFILES"

### "Evaluate this team" / "Team KR" / "Roster analysis"
→ Search **File 03** (Team Intelligence) for "Team KR" pipeline
→ Requires player KRs as input (run Mode 1 first if needed)

### "Simulate [A] vs [B]" / "Who wins?" / "Matchup analysis"
→ Search **File 04** (Simulation Engine) for interaction tables + simulation math
→ Requires team identities as input

### "Scout [opponent]" / "Pregame report" / "Halftime" / "Postgame"
→ Search **File 05** (Scouting & Game Ops) for the relevant phase

### "Where should [player] transfer?" / "Development plan" / "Portal eval"
→ Search **File 06** (Downstream Engines) for "Development Intelligence"
→ Requires player KR as input

### "Should [player] go pro?" / "Draft projection" / "Pro KR"
→ Search **File 06** (Downstream Engines) for "Pro Transition"
→ Search **File 02** for pro-specific tables (Pro Player KR Legend, pro badge gates, pro risks)

### "What does an [X] KR mean?" / "Calibrate the legend" / "Test labels"
→ Search **File 02** for the relevant legend section
→ For calibration: also use web search for real player data to compare against

### "What system does [team] run?" / "OSIE" / "DSIE"
→ Search **File 03** for "Offensive System Inference" or "Defensive System Inference"

### "Scholarship" / "NIL" / "PTV" / "PMV" / "What's he worth?"
→ Search **File 03** for "Scholarship" or "NIL Allocation" or "PTV"

### "Roster construction" / "Who should we recruit?" / "Roster decision"
→ Search **File 03** for "Roster Decision Intelligence"

### "Coaching impact" / "Does this coach develop players?"
→ Search **File 06** for "Coaching Impact Modifier"

## UNIVERSAL RULES (Apply to EVERY response)
1. **Deterministic:** Same inputs → same outputs. No randomness.
2. **No fabrication:** Missing data = UNSCORED. Never guess.
3. **Confidence always shown:** Every output includes confidence %.
4. **Downstream never modifies upstream:** Dev engine, pro transition, scouting — they consume Player KR and Team KR but NEVER change them.
5. **KLVN always applies:** Cross-level comparisons use lambda normalization.
6. **Legends are display-only:** They interpret KR. They don't produce KR.
7. **Web search for current data:** Always search for current stats/awards when evaluating real players. The knowledge files contain the SYSTEM — web search provides the DATA about specific players.

## FILE INVENTORY
| # | File | Size | Contents |
|---|------|------|----------|
| 01 | Player Eval Process | 37K | Pipeline steps, Contextual Mode, Suppression, Confidence Gate |
| 02 | Player Eval Reference | 272K | Traits, Archetypes, Demands, Badges, Overrides, Risks, KLVN, Legends, OPF |
| 03 | Team Intelligence | 127K | Team KR pipeline, OSIE/DSIE, Team Legends, Scholarship/NIL, Roster Intelligence |
| 04 | Simulation Engine | 211K | Interaction Library (582 entries), Simulation math, Physical Mismatch |
| 05 | Scouting & Game Ops | 20K | Confidence Gates, 4-phase Game Ops flow |
| 06 | Downstream Engines | 46K | Development Engine, Pro Transition Engine, Coaching Impact Modifier |`;

export const FILE_01 = `# COACH CONTEXT SETUP

Coach Context Setup

COACH CONTEXT SETUP — v2 (LOCKED)
Purpose
Coach Context defines the binding environment for all downstream evaluation. No player
evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is
locked.
Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing,
evaluation is blocked.
1. Program Name
2. Governing Body — NCAA, NAIA, NJCAA, CCCAA, USCAA, NCCAA
3. Division (if applicable) — NCAA: D1/D2/D3, NJCAA: D1/D2/D3, NCCAA: D1/D2
4. Major Class (required only if NCAA D1) — High-Major, Mid-Major, Low-Major
5. Offensive System — must match one of the 11 defined offensive systems in the UI
System Set
6. Defensive System — must match one of the 9 defined defensive systems in the UI
System Set
These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting,
system fit computation, system demand profiles, and confidence gate ranges.
Optional Metadata
1. Conference
Non-blocking if blank. Used by KLVN for D1 Major Class auto-assignment when available (per
KLVN D1 Conference Class Mapping). Does not affect evaluation math directly.
Optional Constraints (Downstream Only)
These fields do not alter trait scoring, position weighting, system fit, or Base KR computation.
They are consumed only by downstream planning and recommendation systems
(Scholarship/NIL Allocation, Recruiting, Roster Construction).
1. Scholarships Available (cannot exceed preloaded max for governing body/division)
2. NIL Pool (default $0)
3. Institutional / Merit Aid Capacity
4. Need-Based Aid Availability
5. Operating Budget
6. Recruiting Budget

7. Roster Size Target
8. Staffing Capacity Band — Lean, Standard, Elite
Context Lock
When all required fields (1–6) are populated and validated, system state transitions to Coach
Context Locked. This locked context is the binding reference for all downstream engines. It
cannot be modified mid-evaluation without restarting the pipeline.
Governance
System names in fields 5 and 6 must exactly match the UI System Set. Governing body,
division, and major class must exactly match KLVN level keys. Any change to required fields,
validation rules, or downstream bindings requires documentation, versioning, and approval.

UI System Set


# PLAYER PROFILE

Player Profile (Auto-Populated Record)

Player Profile (Auto-Populated Record)
A) Identity
● Full legal name
● Known aliases / alternate spellings
● Date of birth
● Age (derived)
● Height (current) + height history (if available)
● Weight (current) + weight history (if available)
● Declared position(s) (source-listed only)
● City/Town of origin
● State/Province
● Country
● High school / prep school
● Club / AAU program
● Current team affiliation (if applicable)
B) Career Record (Season-by-Season)
For each competitive season:
● Team name
● League / competition level (as reported)

● Season/year label
● Dates active (if available)
C) Raw On-Court Production (Season-by-Season)
For each season:
● Games played
● Games started (if available)
● Minutes played
● Points
● Rebounds
● Assists
● Steals
● Blocks
● Turnovers
● Fouls
● Shooting totals:
○ FG made / attempted
○ 3PT made / attempted
○ FT made / attempted
D) Academic Record (Public / Declared Only)

● GPA (if available)
● Academic honors (if available)
● Publicly reported eligibility status (if available)
E) Declared Medical Information (Public Only)
● Declared injuries (if available)
● Public injury reports (if available)
● Medical redshirt designations (if applicable)
F) Off-Court Public Record (Observable Only)
● Public statements (if captured)
● Social media presence (handles only)
● Verifiable public incidents (if applicable)
● Awards and honors
G) Contact and Identification Metadata (Legal / Voluntary Only)
● Phone number(s)
● Email address(es)
● Social media handles (also listed above, but stored here as contact metadata)
H) Source Attribution + Trust Metadata (Per Field)

● Source for each element
● Verification status: verified / unverified
● Known coverage gaps (missing seasons, missing stats, etc.)
Locked Exclusions (never in Player Profile)
● Evaluations/ratings/KRs
● Attributes, badges, archetypes
● Role inference or system fit
● Private medical or disciplinary records
● Household income / parental info
● Subjective recruiting opinions


# PLAYER CONFIDENCE GATE

Player Confidence Gate

PLAYER CONFIDENCE GATE — v2 (LOCKED STRUCTURE, PROVISIONAL RANGES)
Purpose
Confidence % is a single number that communicates evidence completeness and stability for a
player evaluation. It answers: "how much should you trust this KR?"
Output
confidence_pct ∈ [0, 100]. Computed at the end of player evaluation.
What It Affects
Confidence % does not change any KR math. It is used for transparency and optionally for
gating what the system is allowed to claim or trigger downstream.
Mode Auto-Detection
Nexus auto-detects evaluation mode based on data availability. No user choice, no asking.
● Box-score sources only → Production-Based Mode
● Granular sources present (Synergy / PlayVision / KaNeXT-tag) → Full Player KR Mode
Trait Coverage by Mode
The Trait Library defines 47 traits across 8 clusters. Each trait is marked as TRUE, PROXY, or
UNSCORED per data layer.
In Production-Based Mode, only TRUE and PROXY traits produce scores. UNSCORED traits
return null. Position weighting renormalizes around scored traits only. Confidence reflects the
reduced trait coverage.
In Full Player KR Mode, all 47 traits are scoreable. Confidence reflects data depth, sample size,
and multi-year stability.
Confidence Ranges (Provisional — v1)
Data Available Production-Based KR Full Player KR
Confidence % Confidence %
Official college stats only, multi-year 80–85% 35–55%
Official college stats + HS stats 82–88% 40–60%

Multi-year across levels 85–90% 45–65%
(NJCAA→NAIA/NCAA, etc.)
1 year Synergy + official stats 85–92% 65–80%
Multi-year Synergy + official stats 90–95% 75–88%
1 year PlayVision + official stats 85–92% 65–80%
Multi-year PlayVision + official stats 90–95% 75–88%
Provisional Note
These ranges are v1 placeholders based on structural reasoning. They will be empirically
calibrated once the system has processed real player data across multiple data layers.
Calibration method: compute Full KR from complete data, recompute from box-score only,
measure gap distribution. The gap distribution sets honest confidence ranges.
Governance
Any change to confidence ranges, mode detection logic, or gating rules requires documentation,
versioning, and approval.

Player Evaluation Engine



# PLAYER EVALUATION ENGINE — MASTER EXECUTION FLOW

PLAYER EVALUATION ENGINE — MASTER EXECUTION FLOW (LOCKED)
Purpose
This document defines the complete execution order for producing a player's Final System KR.
It is the single source of truth for what runs, in what order, what each phase consumes, and
what each phase produces. Every phase is deterministic — same inputs, same outputs, every
time.
Architecture
The pipeline has two blocks.
Block 1 builds the player's Base Truth — who they are independent of any system. This never
changes regardless of coach context. A player's Base Truth is the same whether the coach runs
Spread Pick-and-Roll or Princeton, Pack Line or Switch Everything.
Block 2 applies System Context — how this player fits within the coach's selected systems. This
reruns when systems change. Base Truth does not.
BLOCK 1 — BASE TRUTH (System-Agnostic)
Coach Context Setup
Must pull from: Coach Context Setup
Coach completes all required fields: Program Name, Governing Body, Division, Major Class (if
NCAA D1), Offensive System, Defensive System. Optional metadata and constraints stored for
downstream use.
System state after completion: Coach Context Locked. No evaluation proceeds until this lock is
achieved.
Binds: KLVN level key, KR legend selection, position weighting level (College/Pro)
Mode Auto-Detect
Must pull from: Player Confidence Gate

Nexus auto-detects evaluation mode based on data availability. No user choice, no asking.
Box-score sources only → Production-Based Mode. Granular sources present → Full Player KR
Mode.
This determines which of the 47 traits produce scores (TRUE/PROXY) vs return UNSCORED
(null).
Player Profile Build
Must pull from: Player Profile (Auto-Populated Record)
Nexus builds the factual record: identity, seasons, raw production, awards/honors, source
metadata. No traits. No KRs. No archetypes. No evaluation of any kind.
Trait Scoring
Must pull from: Trait Library (8 clusters, 47 traits)
Must pull from: KLVN (Level Normalization)
Score all 47 traits against the active data layer. Only traits defined in the library may exist. If a
trait requires data that is missing or UNSCORED in the active layer, trait = UNSCORED (null).
Never guessed, never inferred.
KLVN normalization is applied to production inputs to ensure cross-level comparability. Trait
scoring is deterministic, independent of team context, opponent, role, or system.
Output: 47 trait scores (each 0–100 or null)
Position Weighting + Base KR
Must pull from: Position Trait Weighting (5 positions × College/Pro)
Apply position-specific trait weights to compute four component KRs:
OKR (Offense KR) — from Shooting, Finishing, Playmaking trait weights
DKR (Defense KR) — from POA Defense, Team Defense, Rebounding trait weights
TKR (Tools KR) — from Tools trait weights

IQKR (IQ KR) — from IQ trait weights
UNSCORED traits contribute zero weight. Remaining scored traits renormalize to carry the full
weight within their cluster.
Compute Base Player KR using position-specific OPF:
Base Player KR = (OKR × OPF_off) + (DKR × OPF_def) + (TKR × OPF_tools) + (IQKR ×
OPF_iq)
OPF varies by position and level. Example: PG College = 56/28/10/6. Center College =
34/44/20/2.
Output: Base Off KR, Base Def KR, Base TKR, Base IQKR, Base Player KR
Badges
Must pull from: Badge Cap & Effect Spec (34 badges)
Evaluate each badge against Skill KR gates and required trait gates per tier:
College: Bronze (Skill KR ≥ 90, traits ≥ 90), Silver (≥ 94), Gold (≥ 97)
Pro: Bronze (≥ 93), Silver (≥ 96), Gold (≥ 98)
Each required trait must be scored (non-null) in the active data layer. If any required trait is
UNSCORED, the badge cannot be assigned.
Apply KR lift: Bronze +0.5, Silver +1.0, Gold +1.5. Total badge lift cap: +3.5 KR.
Badges do not change trait scores, archetypes, or system fit. They certify elite skill expression.
Output: Badge list + post-badge Base Player KR
Archetype Assignment
Must pull from: Archetype Library (26 archetypes)
Evaluate each archetype against Skill KR floors, primary trait gates, and support trait gates. All
thresholds are numeric and deterministic.
Primary archetype: full gates. Secondary archetype: Skill KR floor relaxed by −5.

Non-box-score rule: if an archetype depends on traits that are UNSCORED in box-score mode,
it can only be assigned in a non-box-score layer.
Archetypes are descriptive labels. They do not change KR, traits, or badges.
Output: Primary archetype(s), secondary archetype(s), or none
Overrides
Must pull from: Overrides
Evaluate override triggers against player data. Overrides capture rare basketball realities not
fully expressed by traits, archetypes, or badges.
College: 8 positive overrides, max 1 applies. Ranging from +0.75 to +5.0 KR.
Pro: 4 positive overrides (max 1, each +1.0) + 4 negative overrides (always apply, cannot be
overridden).
Overrides that reference system risks as blockers (e.g., Jumbo Initiator blocked by Turnover
Risk Major) check against the system risk triggers directly, not against system-contextual
application.
Output: Override applied (if any) + post-override Base Player KR
Impact Modifier Assignment
Must pull from: Impact Modifiers
Evaluate in strict precedence: Primary Engine → Secondary Engine → Force Multiplier →
Specialist Anchor → Unclassified.
Uses raw stats (USG, TS%, OnOff_Net, ELS, etc.). Sample gate: MP < 200 → Unclassified
(Low Sample).
One modifier max per player. Impact Modifiers do not alter KR. They classify the mode by which
impact is produced.
Output: Impact Modifier label
Base Truth Lock

At this point, the following are locked and cannot change without restarting the pipeline:
● 47 trait scores (including UNSCORED flags)
● Position-weighted component KRs (OKR, DKR, TKR, IQKR)
● Base Player KR (post-badges, post-overrides)
● Badge list
● Archetype assignment(s)
● Impact Modifier label
This is the player's system-agnostic identity. It is the same regardless of what offensive or
defensive system the coach selects.
BLOCK 2 — SYSTEM CONTEXT
System Fit
Must pull from: System Fit — Offensive Trait Weighting (12 systems × 5 positions)
Must pull from: System Fit — Defensive Trait Weighting (10 systems × 5 positions)
Load the offensive system profile selected in Coach Context. Reweight OKR internals
(Shooting/Finishing/Playmaking distributions shift per system). Load the defensive system
profile. Reweight DKR internals (POA/Team/Rebounding distributions shift per system).
System-specific Tools and IQ adjustments applied where defined.
OPF buckets do not change. Only the trait weight distributions inside each bucket change.
Compute:
Final System Off KR — from system-reweighted offensive traits
Final System Def KR — from system-reweighted defensive traits
Final System Player KR = (System Off KR × OPF_off) + (System Def KR × OPF_def) + (System
TKR × OPF_tools) + (System IQKR × OPF_iq)
Output: Final System Off KR, Final System Def KR, Final System Player KR
System Risks
Must pull from: System Risks (14 total: 9 major, 5 minor)

Evaluate system risk triggers against player data and system context.
College: Major −2.0 KR, Minor −1.0 KR. Pro: Major −4.0 KR, Minor −2.0 KR.
Penalties are additive, applied to Final System Player KR.
System Risks are the only penalties that are system-dependent. Range Gap matters more in
spacing-heavy systems. Switch Liability matters in switch schemes. The same player may
trigger different system risks under different system selections.
Output: System risk list + post-risk Final System Player KR
Finalization
Must pull from: College Player KR Legend or Pro Player KR Legend (based on level)
Must pull from: Player Confidence Gate
Interpret Final System Player KR against the level-appropriate legend:
"At [Level Environment], this KR = [Legend Tier Label]."
Compute confidence_pct from the Confidence Gate table based on data layer and availability.
Output: Final System Player KR (locked), legend tier label, confidence_pct, full audit trail
Determinism Guarantee
Given the same Coach Context, the same player data, and the same data layer — the pipeline
produces identical outputs every time. No randomness, no discretion, no learning, no
adaptation. Every output is traceable to its inputs.



# CONTEXTUAL MODE

Contextual Mode

CONTEXTUAL MODE — PLAYER KR ESTIMATION FROM PUBLIC METRICS
v1 (LOCKED)
Purpose
Contextual Mode exists to produce an honest KR range for players who cannot be evaluated
through the full trait pipeline (Block 1 → Block 2) because the required granular data (Synergy,
PlayVision, KaNeXT-tag) does not exist and box-score mode alone cannot produce reliable
trait-level scoring at volume.
Contextual Mode answers one question: Given everything publicly observable about this player,
what KR range is defensible, and what is the confidence boundary around it?
Contextual Mode does not replace the trait pipeline. It produces a KR range estimate with
explicit uncertainty, confirmable traits, and a structured "What We Know / What We Don't Know"
output. When granular data becomes available, the player enters the full pipeline and
Contextual Mode output is superseded entirely.
Authority
Contextual Mode sits outside the Player Evaluation Engine Master Flow (Block 1 + Block 2). It
does not execute any step of the 0-9 pipeline. It does not produce a Base KR, does not assign
archetypes, does not assign badges, does not compute System Fit. It produces estimates of
what those outputs would likely be if the full pipeline could run, with explicit confidence and
uncertainty disclosure.
When the full pipeline becomes available for a player, Contextual Mode output is archived and
replaced. No Contextual Mode output persists as truth once the pipeline produces a
deterministic result.
When Contextual Mode Activates
Nexus activates Contextual Mode when ALL of the following are true:
1. Box-score data exists (season averages or game logs).
2. No Synergy / PlayVision / KaNeXT-tag data exists for this player.
3. The box-score trait pipeline has been tested and confirmed structurally insufficient for
this player's data profile — specifically, the number of UNSCORED (null) traits is large

enough that position-weighted renormalization produces a Base KR that does not
reliably represent the player.
Contextual Mode is not a fallback for convenience. It exists for cases where the trait pipeline
structurally cannot produce truth. Typical activation scenarios: players at non-D1 levels with
limited box-score depth, players crossing multiple competition levels in a single season, players
whose box-score profile masks true ability due to extreme roster or context suppression.
Inputs
Contextual Mode ingests three tiers of input, each with explicit trust hierarchy.
Tier 1 — Public Box-Score Data (Verified)
Season averages and game logs from official sources: ESPN, Sports-Reference, institutional
athletics sites, governing body stat feeds. Per-game lines with MIN, FG, 3PT, FT, REB, AST,
STL, BLK, TO, PF, PTS. Must include opponent identification and competition level for each
game.
Trust: Highest. Factual, verifiable, timestamped.
Tier 2 — Public Advanced Metrics (Derived)
Where available: BPM, PER, TS%, Usage%, AST%, TOV%, ORB%, DRB%, STL%, BLK%,
On/Off net rating. These are consumed as directional signals, not deterministic inputs. If
unavailable, Contextual Mode proceeds without them.
Trust: High. Derived from Tier 1 data. Subject to sample size and formula limitations.
Tier 3 — Contextual Intelligence (Structured)
Information that changes interpretation of Tier 1 and Tier 2 data. Each Tier 3 input must be
tagged with a source and a trust level.
Tier 3 input types:
Roster Context — Teammate quality estimate (approximate KR range of supporting cast),
number of viable offensive options, spacing quality, secondary ball-handler availability.
Defensive Attention — Is this player the primary or sole scouting target? Confirmed by opposing
coaching staff, observable from usage patterns, or reported by direct coaching source.
Role Suppression — Is the player handling responsibilities far beyond their natural role due to
roster limitations? Examples: only ball handler on team, only shooter, only defender capable of
guarding best opponent.

Multi-Level Context — Player competes across multiple governing body levels in a single
season. Each level's data must be tagged with the KLVN lambda for that level.
Coach Direct Knowledge — First-hand observation from a coach who has coached or scouted
the player directly. Tagged as "Coach Intel" with the coach's relationship to the player (coached
directly, scouted, opponent coach, etc.).
Scouting Confirmation — Specific defensive or strategic behaviors confirmed by opposing
coaching staffs. Example: opposing assistant confirms player was the only name on their
scouting report.
Prospect Pedigree — Verifiable recruiting history: McDonald's All-American nominee, ranked
recruit, offer sheet, prior D1 roster membership, prep school or academy background. This
establishes a talent baseline independent of current production context.
Trust hierarchy: Tier 1 > Tier 2 > Tier 3. Tier 3 cannot override Tier 1 data. Tier 3 can change the
interpretation of Tier 1 data. Tier 3 inputs that conflict with Tier 1 data must be flagged and
disclosed, not silently resolved.
Process
Contextual Mode executes in six phases. Each phase is deterministic given inputs. No phase is
skippable.
Phase 1 — Data Inventory
Catalog all available data by source, competition level, game count, and completeness. Produce
a Data Inventory Table showing exactly what exists and what does not. Flag any games where
box-score data is incomplete or missing fields.
For multi-level players, separate data by competition level and tag each game with the
appropriate KLVN lambda.
For Tier 3 inputs, list each input with its source, trust level, and what interpretation it affects.
Output: Data Inventory Table. Tier 3 Input Registry.
Phase 2 — Level-Segmented Stat Compilation
Compute per-game averages segmented by competition level. Do NOT blend stats across
levels into a single average. Each level produces its own stat line.
For each level segment, compute: per-game averages (PTS, REB, AST, STL, BLK, TO, PF,
FG%, 3P%, FT%, MPG), volume metrics (FGA/G, 3PA/G, FTA/G), efficiency metrics where
calculable (TS%, eFG%, AST/TO).

If the player has prior-season data at any level, include it as a separate historical segment.
Current season and prior seasons are not blended.
Output: Level-segmented stat table, current season and historical.
Phase 3 — Legend Anchor Mapping
For each level segment, map the player's production profile against the KR Legend for that
level. This is pattern matching, not formula.
The KR Legends describe what players at each tier look like in terms of role, production, and
impact. Contextual Mode asks: At this level, which legend tier does this player's production
profile most closely match?
Key mapping inputs: points per game relative to level norms, usage and shot volume relative to
level norms, efficiency metrics relative to level norms, role indicators (AST, STL, REB patterns),
win/loss context and margin (blowout losses at D1 with a weak roster do not indicate the player
is bad — they indicate the team is bad), BPR band alignment where available.
Prospect pedigree (Tier 3) is consumed here as a calibration check. A McDonald's All-American
nominee producing 22 ppg at D1 is evaluated differently than an unknown walk-on producing
the same numbers. The pedigree doesn't change the stats. It changes the prior probability that
the player's true ability exceeds what the stats show.
Legend Anchor Mapping produces a raw KR range per level segment. This is the starting range
before context adjustment.
Output: Raw KR range per level segment with legend tier citation.
Phase 4 — Trait Confirmation Layer
Attempt to confirm or deny specific traits from the Trait Library (8 clusters, 47 traits) using
available data. This is the bridge between Contextual Mode and the trait pipeline.
For each of the 47 traits, determine one of four statuses:
CONFIRMED — Data directly supports scoring this trait (TRUE or PROXY per Trait Library
box-score rules). Produce an estimated trait score with the band it falls in. Cite the evidence.
INFERRED — Data plus Tier 3 context strongly suggests a trait level, but the trait cannot be
directly scored from box-score data alone. Produce an estimated range with explicit justification.
Example: "3PT Movement estimated 82-86, inferred from coach confirmation of Steph-like
off-screen movement + Pepperdine game mix of self-created and catch-and-shoot threes.
Cannot isolate movement-only attempts from box score."
SUPPRESSED — Evidence suggests the trait exists at a higher level than the data shows, but
roster, role, or context is masking it. Produce both the visible score (what the box score says)

AND the estimated true score (what the player likely is), with explicit justification for the gap.
Example: "Passing Vision visible score 66-70 (2.0 APG at D1). Estimated true score 76-82
based on 5+ APG at USCAA, 7 AST vs Ohlone JC, 20/5/5 career season at NCCAA level,
recruited as PG. Suppression cause: sole ball handler with ~66 KR teammates who cannot
convert assists."
UNSCORED — No data supports any estimate. Mark null. State what data would be needed to
resolve.
Trait Confirmation does not produce a full 47-trait vector. It produces a partial vector —
whatever can be honestly confirmed, inferred, or flagged as suppressed. The remainder is null.
For traits where the player's shot profile is entirely outside normal range — for example, a player
whose every three-pointer is from 25+ feet — note this explicitly. Standard trait bands assume a
mix of shot distances. A player shooting 37% exclusively from 25+ feet is not equivalent to a
player shooting 37% from a normal mix of distances. The degree of difficulty adjustment is
disclosed and factored into the trait estimate.
Output: Partial trait vector with confirmation status per trait. Evidence citations. Suppression
justifications.
Phase 5 — Archetype, Badge, and Override Feasibility Check
Using the partial trait vector from Phase 4, check which archetypes, badges, and overrides the
player could plausibly qualify for. This is feasibility assessment, not assignment.
For each archetype in the Archetype Library (26 archetypes): if all primary and support trait
gates can be evaluated from scored or inferred traits, check gates. Report as "Qualifies,"
"Feasible — likely qualifies," "Feasible — cannot confirm without [trait X]," or "Does not qualify."
For each badge in the Badge Cap & Effect Spec (34 badges): check Skill KR thresholds and
required trait gates against confirmed and inferred traits. Report as "Qualifies at [tier]," "Feasible
at [tier]," or "Cannot evaluate."
For overrides: check trigger conditions against confirmed data. Report as "Qualifies," "Likely
qualifies," "Cannot evaluate — requires [data X]."
For system risks: check triggers against confirmed data and flag any that clearly apply or clearly
do not apply. Borderline cases are reported as "Borderline — [justification]."
Compute estimated badge lift and override adjustment. Compute estimated system risk penalty.
Output: Archetype feasibility list. Badge feasibility list with estimated KR lift. Override feasibility
with estimated KR adjustment. System risk check with estimated KR penalty.
Phase 6 — KR Range Synthesis + What We Know / What We Don't Know

Synthesize all prior phases into a final KR range with structured output.
Component KR Estimation: Using the partial trait vector (Phase 4) and position weighting
(from Position Trait Weighting doc), estimate OKR, DKR, TKR, IQKR. Apply position-specific
OPF splits to produce Base KR estimate range. Apply badge lift estimate (Phase 5). Apply
override estimate (Phase 5). Apply system risk estimate (Phase 5).
Final Contextual KR Range: Reported as [Low — High] with a central estimate. The range
width reflects uncertainty. More confirmed traits and more data produce a tighter range. Heavy
reliance on INFERRED and SUPPRESSED traits produces a wider range.
Confidence Output: confidence_pct computed from: data density (games played, levels
represented), trait coverage (how many of 47 are CONFIRMED vs INFERRED vs
SUPPRESSED vs UNSCORED), Tier 3 input quality (coach direct knowledge > scouting
confirmation > inferred context), prospect pedigree strength, consistency of data across levels
and games.
Provisional confidence bands:
● 80%+ — Large game sample, multi-year, strong Tier 3, most traits CONFIRMED or
well-INFERRED
● 70-79% — Moderate game sample, strong Tier 3, mix of CONFIRMED and INFERRED
traits
● 60-69% — Limited game sample or heavy reliance on INFERRED/SUPPRESSED traits
● Below 60% — Very limited data, heavy reliance on Tier 3, wide KR range
Legend Interpretation: Interpret the final KR range against the appropriate level legend(s). For
multi-level players, provide interpretation at each relevant level using KLVN translation.
"What We Know" Section: Only claims supported by Tier 1 or Tier 2 data, optionally
contextualized by Tier 3 inputs. Each claim cites its evidence. Organized by trait cluster.
"What We Don't Know" Section: Every significant gap — traits that are UNSCORED,
defensive ability without film, playmaking ceiling without system context, physical measurements
without combine data. Each gap states what data would be needed to resolve it.
"What Changes If" Section: Describes how the KR range would shift under specific scenarios.
Examples: "If placed in a system with real spacing and a secondary creator, Playmaking KR
likely rises from [X] to [Y], which would shift overall KR by [Z]." "If full film confirms defensive
activity matches lower-level steal rates, Defense KR rises from [X] to [Y]." "If placed at [level]
with [roster quality], effective KR projects to [range]."
Output: Final Contextual KR Range (low, high, central), confidence_pct, component KR
estimates, legend interpretation at each relevant level, What We Know, What We Don't Know,
What Changes If.

Multi-Level Player Protocol
When a player competes across multiple governing body levels in a single season, Contextual
Mode handles this as follows:
1. Each level's data is evaluated separately through Phases 1-3, producing level-specific
stat lines and raw KR ranges.
2. The highest-level data carries the most interpretive weight for KR estimation because it
represents the hardest test. A player's D1 production is more informative about their
ceiling than their USCAA production.
3. Lower-level data is used to CONFIRM capabilities that higher-level data cannot show
due to suppression. Example: 5 APG at USCAA confirms playmaking ability that 2 APG
at D1 (with no viable teammates) cannot reveal.
4. Cross-level stat divergence is a signal, not noise. When assists, steals, or rebounds
diverge significantly (50%+) between levels, it indicates context suppression at the
higher level, not inconsistency. The lower-level numbers may better represent the
player's true trait profile in those areas.
5. The final KR range is anchored to the highest level the player has meaningful data at,
with lower-level data used to fill "What We Don't Know" gaps and resolve SUPPRESSED
trait flags.
6. KLVN lambdas are applied when translating the final KR to a specific level's legend for
interpretation. One player, one KR range, multiple legend tier labels depending on the
level environment.
Suppression Detection Rules
Contextual Mode must actively detect and flag statistical suppression. Suppression occurs when
a player's box-score output is artificially depressed by factors external to their ability. Detected
suppression adjusts interpretation, not data.
Suppression indicators:
Sole Threat — Player accounts for 35%+ of team scoring AND 30%+ of team 3PA AND no other
teammate averages 12+ PPG. Implication: all defensive attention is focused on this player.
Every stat is produced against maximum defensive attention.

Roster Quality Gap — Coach-reported or observable teammate quality is 15+ KR points below
the player being evaluated. Implication: no credible offensive outlets for playmaking; no spacing
for driving or cutting; no secondary threat to pull help defense.
Scouting Confirmation — Opposing coaching staff confirms the player was the primary or sole
scouting focus. Strongest suppression signal available. Example: opponent assistant says "he
was the only kid on our scouting report" or "we face-guarded him full court."
Level Mismatch — Player's home institution competes at a level 3+ KLVN tiers below the games
being analyzed. Example: NCCAA player (λ=0.542) playing D1 games (λ=1.000). Implication:
team quality gap compounds individual suppression. The player is facing D1 competition with
non-D1 teammates.
Cross-Level Stat Divergence — Player's assist, steal, or rebound averages diverge 50%+
between highest and lowest competition levels. Implication: lower-level numbers reflect true
ability that higher-level context suppresses.
Role Overload — Player is the sole ball handler AND primary scorer AND team's only perimeter
threat, confirmed by Tier 3 input. Implication: turnovers, efficiency dips, and low assist numbers
are systemic, not individual.
When suppression is detected, Contextual Mode produces both the visible stat-based estimate
(what the box score says) and the context-adjusted estimate (what the player likely is). Both are
reported transparently. Neither overwrites the other.
Degree of Difficulty Adjustment
Standard trait bands assume a normal distribution of shot types, distances, and creation
methods. Some players operate outside these assumptions. When a player's shot profile is
materially different from the assumed norm, Contextual Mode applies a Degree of Difficulty
disclosure.
Examples:
● A player whose every 3PA is from 25+ feet (not a mix of corner/wing/slot). Standard 3P%
bands assume normal distance distribution. This player's 37% from exclusively deep
range is harder than 37% from a normal mix.
● A player who is face-guarded and full-court denied on every possession. Standard
efficiency bands assume normal defensive attention. This player's production comes
against maximum pressure.
● A player who is the only ball handler against D1 pressure with no outlet pass options.
Standard turnover bands assume normal team context.

Degree of Difficulty does not change the data. It adds a structured note to each affected trait
explaining why the raw number understates or overstates the true trait level, and by
approximately how much.
What Contextual Mode Does NOT Do
Does not produce a single-number KR. Produces a range. Does not assign archetypes. Reports
feasibility. Does not assign badges. Reports feasibility. Does not apply System Fit (Block 2).
That requires full trait vector + Coach Context. Does not replace the trait pipeline. When
granular data arrives, Contextual Mode output is superseded entirely. Does not project or
develop. Evaluates current state only. Does not invent data. Every claim cites evidence. Every
gap is disclosed. Does not blend stats across competition levels into a single average.
Output Schema
Every Contextual Mode evaluation produces the following tagged output:
contextual_mode: true contextual_mode_version: v1 player_id: [identifier] evaluation_date:
[date] data_sources: [list of sources with game counts and levels] tier3_inputs: [list with source
tags and trust levels] data_inventory: [Phase 1 table] level_segmented_stats: [Phase 2 table]
legend_anchor_ranges: [Phase 3 output per level] trait_confirmation: [Phase 4 partial vector
with statuses] archetype_feasibility: [Phase 5 list] badge_feasibility: [Phase 5 list with estimated
lift] override_feasibility: [Phase 5 check] system_risk_check: [Phase 5 flags] suppression_flags:
[list of detected suppression indicators] degree_of_difficulty_flags: [list of adjustments]
component_kr_estimates: [OKR, DKR, TKR, IQKR ranges] kr_range_low: [number]
kr_range_high: [number] kr_central_estimate: [number] badge_lift_estimate: [number]
override_estimate: [number] system_risk_estimate: [number] confidence_pct: [number]
trait_confirmation_count: [CONFIRMED: X, INFERRED: X, SUPPRESSED: X, UNSCORED: X]
legend_interpretation: [per-level tier labels] what_we_know: [structured section]
what_we_dont_know: [structured section] what_changes_if: [structured section]
Governance
Any change to Contextual Mode methodology, suppression detection rules, degree of difficulty
logic, phase definitions, or output schema requires documentation, versioning, and approval.
Contextual Mode outputs are never editable by coaches, scouts, or users. They are
system-produced artifacts with full audit trail.

Founding Test Cases
Contextual Mode was developed and validated on three test cases that represent different
evaluation challenges:
Darius Acuff (Arkansas, PG, D1 High-Major) — Tested whether Contextual Mode could
produce a defensible KR range for a D1 player using only public metrics. Result: 95-97 KR
range. Confirmed correct against legend anchors and role reality. This case validated the
Legend Anchor Mapping and advanced metric ingestion.
Scotty Washington (High Point, SG, D1 Mid-Major) — Tested mid-major D1 evaluation with
public metrics. Result: 76-79 KR range. Confirmed correct. Validated trait confirmation against
box-score proxy rules.
Laolu Kalejaiye (Lincoln University, SG/PG, NCCAA Independent) — The hardest case.
Multi-level player competing across D1, NAIA, USCAA, and NCCAA levels in a single season.
Extreme roster quality gap. Sole-threat suppression confirmed by opposing D1 coaching staff.
McDonald's All-American nominee pedigree. Every suppression indicator triggered. This case
forced the creation of the Multi-Level Player Protocol, Suppression Detection Rules, and Degree
of Difficulty Adjustment. Result: 80-86 KR range (home level), 85-90 projected effective KR in a
system with adequate supporting cast. Confidence: 70-76%.
Full evaluation outputs for all three cases are stored as canonical Contextual Mode reference
cases.`;

export const LEGEND_NCAA_D1_HM = `# COLLEGE PLAYER KR LEGENDS — v3 (REWRITE)

## Calibrated against 152 players across 19 teams at 6 levels (March 2026)

### Governance Note
Display legend only. KR values are produced by Nexus. No evaluation, weighting, or normalization logic lives here. College KR describes current college role and impact only. Pro projection lives in the Pro Transition Engine (File 06). No draft language, no pro projection language appears in any college legend tier.

---

## NCAA DIVISION I — HIGH-MAJOR (λ = 1.000)

Interpretation anchor: Power 5 + Big East. Deep rosters, national recruiting, sustained play vs Top-100 opponents. College KR reflects who you are on the floor right now — not recruiting hype, not draft stock, not future potential. All ratings assume KLVN normalization.

**98–100 — National Player of the Year Lock / Transcendent Superstar.**
Program-orbiting force. Elite usage AND elite efficiency simultaneously. Game-plan warps around stopping them — and it still doesn't work. Drives wins against other elites. Would be the best or second-best player on almost any team in the country. Conference POY lock. National awards finalist or winner.
*Calibration: No player in the 48-player HM study reached this tier. Reserved for generational single-season performers.*

**95–97 — Franchise Anchor / Elite All-American.**
Clear identity-setter. Team's unquestioned alpha or co-alpha. Primary closer. All-American or Conference POY contender. Carries offensive OR defensive load nightly — the team's identity is built around this player. 30+ MPG. On a team that wins 25+ games or earns a top-4 seed. May have a spike profile (dominant scorer with exploitable gaps) or a complete profile (contributes across every category). What defines this tier: you cannot replace what this player does.
*Calibration: Lendeborg (96, Michigan — 14.7/6.9/3.2, Big Ten POY, Consensus AA, zero statistical holes). Acuff (96, Arkansas — 23.5/6.4, SEC POY, .440 3P%, first since Maravich to lead SEC in points + assists).*

**92–94 — High-Impact Starter / Core Winner.**
Wins games at the highest level. Can be the offensive alpha whose production drives the team (spike profile — elite scoring, weaker in other areas) OR the two-way anchor whose completeness stabilizes everything (complete profile — contributes across categories without dominating one). Heavy-minute leader. All-Conference caliber. Trusted in late-game situations. Drives outcomes against elite competition.
*Calibration: Peterson (93, Kansas — 20.2 PPG, projected #1 pick, spike scorer with weak playmaking). Bradley (94, Arizona — Big 12 POY, clutch, 4.6 APG). Bidunga (92*, Kansas — DPOY candidate, 13/9/2.6 BPG, defensive anchor but limited offense). Haugh (93, Florida — Consensus AA, 17.1/6.1). Condon (92, Florida — 15.1/7.5, All-SEC). Brazile (92, Arkansas — 13.2/7.4 with 3.1 stocks/game). Burries (93, Arizona — 16 PPG as a freshman on a 35-2 team). Peat (92, Arizona — 13.8/5.3/2.7/0.8 BPG as a freshman).*
*Note: Bidunga at 92 sits at the boundary of this tier and 89-91. His defensive dominance (DPOY, 100th percentile DRAPM) pushes him into 92-94 even though his offensive limitations would typically cap at 89-91. For centers, the OPF weights defense at 44% — defensive dominance carries proportionally more weight.*

**89–91 — Solid Starter / Top-Five Rotation Lock.**
Firmly positive starter value at HM level. 25+ MPG. Consistent two-way impact. Can scale up or down depending on lineup needs. All-Conference honorable mention range. The starters on ranked teams who aren't the stars but who you can't win without. Complementary pieces that make the machine work.
*Calibration: Oweh (91, Kentucky — 18.1 PPG, 1.8 SPG, team alpha but on a .500+ team, not a contender). Bidunga (91*, see note above). Chinyelu (91, Florida — SEC DPOY, 11.2 RPG). Aberdeen (89, Kentucky — 13.2 PPG, .360 3P%). White (89, Kansas — 13.5/6.7, efficient). Burnett (89, Michigan — 12.5 PPG, .380 3P%). Johnson Jr (89, Michigan — 11/7.2, 69.1 TS%). Cadeau (90, Michigan — 5.6 APG, runs the #1 assist offense). Mara (90, Michigan — 7'3", 2.6 BPG, .350 3P% center unicorn). Krivas (90, Arizona — 10.8/8.2/1.8 BPG, rim protector). Thomas (91, Arkansas — 15.4 PPG, 1.5 SPG). Richmond (90, Arkansas — 11.1 PPG, .574 FG%).*

**86–88 — Trusted Rotation / High-Minute Role Player.**
Winning-role player who thrives in a defined role. 20+ MPG in meaningful games. Clearly trusted by coaching staff. Value comes from one or more specialties: shooting, rim protection, distribution, perimeter defense, rebounding. Can be an elite facilitator whose value is passing (not just a "glue guy"). Lineups win with them on the floor. Not the reason you win — but a reason you don't lose.
*Calibration: Council (87, Kansas — 5.1 APG, Big 12 Newcomer, elite distributor, poor shooter). Chandler (87, Kentucky — .370 3P%, versatile defender). Lee (88, Florida — 11.6/4.2 APG, poor 3P%). Fland (88, Florida — 11.6 PPG, 1.8 SPG, elite on-ball defender). Klavzar (86, Florida — SEC 6th Man, .402 3P%). Gayle (87, Michigan — 10 PPG, .350 3P%). Kharchenkov (88, Arizona — defensive stopper, guards 1-5). Awaka (88, Arizona — Big 12 6th Man, 9.4/9.5, #1 ORB% nationally). Ewin (87, Arkansas — .585 FG%, 1.0 BPG).*

**83–85 — Reliable Bench / Rotation Contributor.**
True rotation depth on good teams. 15–20 MPG. Consistent energy or specialty (shooting, defense, rebounding). No major drop-off when on the floor. Common profile on Sweet 16 and Final Four rosters. The 6th-7th man on a ranked team. Earns minutes through reliability, not dominance.
*Calibration: Tiller (84, Kansas — elite physical tools, inconsistent production, benched in key game). Wagner (85, Arkansas — former #1 recruit, 7 PPG on poor shooting, pedigree > production). McKenney (83, Michigan — freshman, .380 3P%, 21-pt debut). Dell'Orso (83, Arizona — .833 FT%, .350 3P%, veteran bench guard). Knox (83, Arkansas — versatile wing, 6.5/4.5). Lowe (83, Kentucky — 9 GP only, injured, All-ACC pedigree from Pitt).*

**80–82 — Situational Specialist / Depth Piece.**
Matchup- and context-dependent contributor. 10–15 MPG. Role-specific value (shooting, defense, pace change, size). Can swing individual games when their specialty is needed. Easily replaced individually, but useful when aligned correctly with the system. The 7th-8th man on a ranked team.
*Calibration: Jackson (81, Kansas — defensive energy, knee injury comeback, McD AA pedigree). Handlogten (82, Florida — 7'1", elite ORB%, backup C). Jelavic (82, Kentucky — Croatian freshman, .350 3P%). Tschetter (81, Michigan — .360 3P%, big-lineup option). Aristode (81, Arizona — .459 3P% specialist, 12 MPG). Pringle (81, Arkansas — .714 FG%, 12 MPG backup C).*

**77–79 — Limited Bench / Emergency Depth.**
Playable only under constraint. 5–10 MPG sporadically. Injury or foul trouble dependent. Neutral to mildly negative impact. Not trusted in high-leverage moments. Can hold the fort for a few minutes without the team collapsing.
*Calibration: McDowell (78, Kansas — 17.2 MPG but .360/.349 production, floor spacer who doesn't contribute much). Johnson (80, Kentucky — #20 recruit, 12.5 MPG, coach didn't trust him yet). Brown (80, Florida — 14 MPG, functional bench guard).*
*Note: Some players at 77-80 play more minutes than the label suggests (McDowell at 17 MPG) because roster construction forces coaches to play them, not because their production warrants it.*

**74–76 — Fringe Roster / Non-Rotation.**
On the roster, not in the competitive plan. Practice and scout value. Garbage-time minutes only. Emergency depth. Net neutral to negative on the floor.
*Calibration: Rosario (75, Kansas — started 6 games early then lost his role completely, .286 3P%, minutes collapsed throughout season).*

**71–73 — Developmental Redshirt / Project.**
Future-oriented roster slot. Physically or skill-wise incomplete. Practice-focused. Not currently viable in HM games. May project upward with development or a transfer to a lower level.

**68–70 — Practice Squad / Walk-On.**
Roster filler for structure, not competition. Scout team body. No rotation pathway. Contribution is off-court (leadership, culture, practice intensity).

**Below 68 — Below HM Viability.**
Below HM competitive threshold. Negative on-court impact at HM pace and athleticism. Better fit at Mid-Major, D2, NAIA, or JUCO.

---

## KEY CHANGES FROM v2 → v3

1. **All draft/pro projection language removed.** No references to "NBA draftable," "NBA first-round certainty," "high-end overseas projection," or any forward-looking pro language in any tier. College KR is present-tense only.

2. **92–94 band rewritten to accommodate both player types.** Now explicitly describes "spike profile" (dominant scorer with gaps) AND "complete profile" (two-way anchor). Both Peterson and Bidunga fit the description.

3. **86–88 renamed from "Big-Minute Glue Guy" to "High-Minute Role Player."** Description now includes "elite facilitator whose value is passing" alongside specialist roles. Council's 5.1 APG profile is covered without being undersold as a "glue guy."

4. **BPR ranges removed entirely.** Multiple players exceeded their tier's stated BPR bands (Peterson 14.1 BPM in the 92-94 tier, Bidunga 11.0 in the 89-91 tier). BPR ranges created false ceilings and floors. The legend describes roles and production patterns, not metric thresholds. Metrics are the pipeline's job, not the legend's.

5. **Calibration examples added to every tier.** Each tier now includes specific players from the 48-player HM study with their stats, showing exactly who belongs at each level. These are reference points, not gates — future players are evaluated by the pipeline, not by comparison to calibration examples.

6. **77-80 note added** about minutes vs production. Some players play more minutes than their KR suggests because coaches have no better option (roster construction forces playing time). The KR reflects production quality, not minutes earned.`;

export const LEGEND_NCAA_D1_MM = `# NCAA DIVISION I — MID-MAJOR PLAYER KR LEGEND v3
## λ = 0.958

Interpretation anchor: AAC, A-10, Mountain West, WCC, MVC. Regional/national recruiting mix. Mostly mid-tier opponents with occasional high-major games. Less depth and athletic redundancy than HM.

**95–100 — Mid-Major Player of the Year Lock / Transcendent Star.**
Program-defining player who dominates the mid-major landscape nationally. Offense and/or defense fully orbits them. Conference POY lock. Scales up against high-majors without collapsing.

**92–94 — Franchise Anchor / Elite Mid-Major All-American.**
Clear #1 option and identity driver. Closes games. Consistent efficiency at high usage. All-Conference POY contender. Can carry a team to conference titles or at-large consideration. Can be a spike scorer or a complete two-way anchor — what matters is they're irreplaceable.
*Calibration: Murauskas (93, Saint Mary's — 18.8/7.7/2.2, Princeton hub, team identity runs through him).*

**88–91 — High-Impact Starter / Core Winner.**
Primary reason teams win at the mid-major level. Heavy minutes leader. All-Conference lock. Game-changer vs peers. Top-3 rotation piece. Offense or defense reliably bends with them on the floor. May be an elite facilitator, a defensive anchor, or a scoring engine.
*Calibration: Lewis (89, Saint Mary's — 14.2 PPG, .372 3P%, .882 FT%). Dent (89, Saint Mary's — 13/5.7 APG, .401 3P%, .918 FT%). Byrd (88, SDSU — 13.1 PPG, 1.9 SPG, Preseason MW POY). Dixon-Waters (88, SDSU — 13 PPG, .370 3P%, 29.3 MPG).*

**85–87 — Solid Starter / Top-Five Rotation Lock.**
Firmly positive starter value. 25+ MPG. Two-way reliability. Can scale up or down depending on lineup. All-Conference consideration. On winning MM teams, these are the 3rd-4th starters who execute their role without question.
*Calibration: McDaniel (85, Memphis — 13.9/4.6 APG/1.9 SPG, carries a losing team). Davis (86, SDSU — 11/4/2.5, game-winner in MWC tournament). Gwath (85, SDSU — MW DPOY/FOY prior year, rim protector + .350 3P% unicorn).*

**82–84 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player trusted in pressure moments. Top 6–8 rotation. 20+ MPG. Clear specialist value (shooting, defense, distribution). Holds up against elite mid-majors. May drive specific phases of the offense (bench scoring, secondary distribution) without being the primary engine.
*Calibration: Parker (82, Memphis — 11.4 PPG, conference surge to 14.4 PPG). Shaw (84, Saint Mary's — .417 3P%, 5.3 RPG as a freshman). Clark (83, Pepperdine — 15.1 PPG on a losing team). Phipps (83, Pepperdine — 13.3/6.1/5.0/1.4). Harrington (83, SDSU — freshman, .360 3P%, #80 recruit).*

**79–81 — Reliable Bench / Rotation Piece.**
Depth that keeps quality intact. 15–20 MPG. Consistent execution. Neutral to slightly positive impact. Common on conference-title teams. Functional contributors who don't hurt you.
*Calibration: Givens (80, Memphis — .365 3P% team-best, but .661 FT%). Bradshaw (80, Memphis — .536 FG%, former 5-star, unfulfilled pedigree). Cooley (81, Pepperdine — .920 FT%, 11.7 PPG). Compton (81, SDSU — .550 FG% efficient finisher). Wessels (81, Saint Mary's — 1.0 BPG, Pack Line anchor). Campbell (81, Saint Mary's — .489 3P%).*

**76–78 — Situational Specialist / Depth.**
Context-dependent contributor. 10–15 MPG. Matchup-specific usage. Energy, shooting bursts, or defensive relief. Cannot be relied on nightly.
*Calibration: Davis (77, Memphis — .278 3P% liability). Berry (77, Memphis). Hardaway (77, Memphis — .343 3P%, 0.7 BPG). Heide (77, SDSU — broken hand, 4.7 RPG). Cicic (78, Pepperdine — 1.0 BPG, 23/10/4 ceiling game).*

**73–75 — Limited Bench / Emergency Depth.**
Playable only under constraint. 5–10 MPG sporadically. Neutral to mildly negative impact. Not trusted in high-leverage moments.
*Calibration: Hawke (74, Saint Mary's — .222 3P%, 10.7 MPG). Mager (74, Pepperdine). Stosic (74, Pepperdine — Gonzaga pedigree, never established).*

**70–72 — Fringe Roster / Non-Rotation.**
On the roster, not in the plan. Practice and scout value. Garbage-time minutes only. Emergency depth.
*Calibration: Vudragovic (71, Pepperdine — 3 PPG, 12 MPG, bottom of WCC).*

**67–69 — Developmental Redshirt / Project.** Future-oriented slot. Not viable in strong MM play yet.

**64–66 — Practice Squad / Walk-On.** Roster filler for structure. No competitive pathway.

**Below 64 — Below Mid-Major Viability.** Below MM competitive threshold. Better suited for Low-Major, D2, NAIA, or JUCO.`;

export const LEGEND_NCAA_D1_LM = `# NCAA DIVISION I — LOW-MAJOR PLAYER KR LEGEND v3
## λ = 0.917

Interpretation anchor: Big South, Big Sky, Big West, SWAC, MEAC, NEC, Southland, Patriot, etc. Regional/local recruiting. Thin depth; sharp drop-offs after top 6–7. Teams often built around 1–2 primary creators.

**92–100 — Low-Major Player of the Year Lock / Dominant Star.**
Conference-level force who overwhelms the ecosystem. Entire program orbits them. Extreme usage with sustainable efficiency. National low-major recognition. Carries team to auto-bid contention.

**88–91 — Franchise Anchor / Elite Low-Major Standout.**
Clear #1 option and identity driver. Closes games. Leads conference in key categories. Conference POY contender. Wins games against peers through volume and control. On a team that competes for conference titles and NCAA auto-bids. Can be a volume scorer, a complete two-way player, or a defensive anchor who dominates the paint.
*Calibration: Martin (89, High Point — 15 PPG, 2.3 AST/TO, 1.6 SPG, 30 pts vs Arkansas in NCAA R2). Fletcher (88, High Point — 14/7 on .540 FG%, Kentucky/Xavier pedigree). Dixon (88, UCI — 15.4 PPG, .385 3P%, Preseason All-BW). Evans (88, UCI — anchors 4th-ranked national defense, 8.4 RPG, ~2.5 BPG). Sykes (88, LBSU — 19.4 PPG as a freshman, 39-pt game, Kyle Macy nominee).*

**84–87 — High-Impact Starter / Core Winner.**
Primary reason teams consistently win in-conference. Heavy minutes leader. All-Conference lock. Game-changer vs peer competition. Top-3 rotation piece. Drives conference wins and tournament runs.
*Calibration: Martinez (86, High Point — .480/.350/.860, 2.92 AST/TO, Arizona pedigree). Aquino (86, High Point — 1.7 BPG + .410 3P% unicorn). Saran (86, UCI — 12 PPG, All-Tournament). Majstorovic (86, LBSU — 15.2/6.4/1.7 SPG, Syracuse pedigree). Saine (86, Weber State — 14/4/1.5, D2 transfer, 29-pt game). Henry (85, UCI — versatile wing, Preseason All-BW). Hennig (84, Weber State — 12/4/2.5 sophomore).*

**80–83 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at low-major level. 25+ MPG. Consistent two-way contribution. Versatile role player. All-Conference consideration.
*Calibration: Washington (83, High Point — founding test case, jumped from 76-79 at CSUN to 83, system-unlock). Tillis (83, UCI — 8/5.5, NIT semifinal double-double). Whiting (83, Weber State — .380 3P%, 3.5 APG, Boise State/UNLV pedigree). Vartiainen (83, Weber State — .391 career 3P%, Finnish Klay Thompson).*

**77–79 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player in a thin ecosystem. Top 6–8 rotation. 18–25 MPG. Clear specialist value. Holds up vs top low-major opponents.
*Calibration: Farrell (77, LBSU). Levillain (78, LBSU — French freshman, 5.0 RPG, double-doubles). Brady (77, High Point — 2.6 AST/TO but .250 3P%). Jester (77, UCI). Hohn (77, UCI — distributor, clutch FT in NIT). Gomma (79, Weber State — rim-running C, 19/13 ceiling game).*

**74–76 — Reliable Bench / Rotation Piece.**
Depth that keeps teams functional. 12–18 MPG. Energy or specialty. Neutral impact.
*Calibration: Miller (74, High Point — freshman big, .760 FG%, 15 blocks). Lewis (74, LBSU). Johnson (74, LBSU — 0.7 BPG team leader). Grayson (76, Weber State — 3.0 APG in 14 MPG, 8-assist game).*

**71–73 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**68–70 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**65–67 — Fringe Roster / Non-Rotation.** On the roster, not in the plan. Practice and scout value.

**62–64 — Developmental Redshirt / Project.** Future-oriented slot. Not viable currently.

**59–61 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 59 — Below Low-Major Viability.** Below D1 competitive threshold. Better suited for D2, NAIA, JUCO.`;

export const LEGEND_NCAA_D2 = `# NCAA DIVISION II PLAYER KR LEGEND v3
## λ = 0.875

Interpretation anchor: Top D2 programs in CCAA, MIAA, G-MAC, Sunshine State, PSAC, RMAC, PacWest. Regional recruiting with some national reach. Majority D2 competition; occasional D1 crossovers. Depth is solid at top programs but drops faster than D1.

**90–100 — D2 Player of the Year Lock / Dominant National Star.**
National-level force who overwhelms the D2 ecosystem. Conference and national centerpiece. Elite raw production with sustainable efficiency. Carries team to national title contention.

**86–89 — Franchise Anchor / Elite D2 Standout.**
Clear #1 option and identity driver. Defines team success. Closes games. Conference POY contender. All-American candidate. On teams that win 25+ games and compete in the national tournament.
*Calibration: T. Campbell (89, Cal State East Bay — D2 POY, All-American, .522/.457 shooting, 33-1 team).*

**82–85 — High-Impact Starter / Core Winner.**
Primary reason strong D2 teams consistently win. Heavy minutes leader. All-Conference / All-Region lock. Game-changer vs D2 elites. Drives conference titles and tournament runs.
*Calibration: K. King (85, Chaminade — 15.7/7.3/2.9/2.1, most complete D2 line in study). Bush (85, CSEB — CCAA Tournament MVP, 23-pt championship game). Huff (83, CSEB — .378 3P%, .826 FT%). A. Campbell (83, CSEB — 105 assists team leader, bench general). Medina (82, Chaminade — 16.1 PPG, .847 FT%, but .376 FG%).*

**78–81 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at D2 level. 25+ MPG. Consistent two-way contribution. Versatile role player. Trusted in high-leverage games.
*Calibration: Kr. King (81, Chaminade — 12.4/4.2/2.5/1.7, but .240 3P%). Banks (81, Chaminade — 107 assists, .467 FG%, floor general). MacDonald (80, Chaminade — .579 FG%, 5.7 RPG, 0.7 BPG). Foy (81, CSEB — 5.0 RPG team leader, D1 pedigree). Ijeh (81, CSEB — CCAA DPOY, ~8 RPG, ~2.0 BPG).*

**75–77 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player in competitive D2 environments. Top 6–8 rotation. 18–25 MPG. Clear specialist value. Holds up against strong D2 competition.
*Calibration: Sasser (75, Chaminade — .432 FG%, bench energy). Haddock (75, Chaminade — 1.5 SPG defensive pest, .333 FG%). Haywood (78, CSEB — .560 FG% efficient finisher). Williams (75, CSEB — bench shooter, key threes in regionals).*

**72–74 — Reliable Bench / Rotation Piece.** Depth that maintains quality. 12–18 MPG. Energy or specialty.

**69–71 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.
*Calibration: Shackelford (70, Chaminade — 2.9 PPG, 9.7 MPG, deep bench big).*

**66–68 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**63–65 — Fringe Roster / Non-Rotation.** On the roster, not in the plan. Practice and scout focus.

**60–62 — Developmental Redshirt / Project.** Future-oriented slot. Not viable at competitive D2 level.

**57–59 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 57 — Below D2 Viability.** Below D2 competitive threshold. Better suited for D3, NAIA, JUCO.`;

export const LEGEND_NCAA_D3 = `# NCAA DIVISION III PLAYER KR LEGEND v3
## λ = 0.667

Interpretation anchor: NESCAC, ODAC, MIAC, CCC, etc. No athletic scholarships. Academics-first institutions with strong local/regional recruiting. Emphasis on balance, development, and team execution. Depth is solid at top programs but drops quickly after core contributors.

**80–100 — D3 Player of the Year Lock / Elite National Standout.**
National-level D3 force who overwhelms the ecosystem. High raw production with sustainable efficiency. Carries team to national title contention.

**76–79 — Franchise Anchor / Top D3 All-American.**
Clear #1 option and identity driver. Defines team success. Closes games consistently. Conference POY contender. Anchor of nationally ranked programs.

**72–75 — High-Impact Starter / Core Winner.**
Primary reason elite D3 teams win. Heavy minutes leader. All-Conference / All-Region lock. Game-changer vs D3 elites. Drives conference titles and national runs.

**68–71 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at D3 level. 25+ MPG. Consistent two-way contribution. Versatile role player. Trusted in high-leverage games.

**65–67 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive D3 rosters. Top 6–8 rotation. 18–25 MPG. Clear specialist value.

**62–64 — Reliable Bench / Rotation Piece.** Depth that maintains quality. 12–18 MPG. Energy or specialty.

**59–61 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**56–58 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**53–55 — Fringe Roster / Non-Rotation.** On the roster, not in the plan.

**50–52 — Developmental Redshirt / Project.** Future-oriented. Not viable at competitive D3 level.

**47–49 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 47 — Below D3 Viability.** Below D3 competitive threshold.`;

export const LEGEND_NAIA = `# NAIA PLAYER KR LEGEND v3
## λ = 0.810

Interpretation anchor: Cascade, Heart, SSAC, Sun Conference, GPAC, Crossroads, Cal Pac, etc. Scholarship availability with academic-athletic balance. Majority NAIA competition; occasional D2 crossovers. Many players develop with intent to transfer upward. Depth is solid at the top but drops quickly beyond 6–7 contributors.

**86–100 — NAIA Player of the Year Lock / Elite National Standout.**
National-level NAIA force who overwhelms the ecosystem. Explosive raw production with sustainable efficiency. Carries team to national tournament contention.

**82–85 — Franchise Anchor / Top NAIA All-American.**
Clear #1 option and identity driver. Defines team success. Closes games consistently. Conference POY contender. The player the entire program is built around.
*Calibration: Parker (82, Simpson — 19.7 PPG, .528 FG%, alpha scorer). Selden (82, FMU — 12.1/5.8/3.0/1.3/0.9, most complete NAIA line in study).*

**78–81 — High-Impact Starter / Core Winner.**
Primary reason strong NAIA teams win. Heavy minutes leader. All-Conference / All-American consideration. Game-changer vs NAIA elites. Drives conference titles and national runs.
*Calibration: Allen (78, Simpson — 17.1/5.6/2.6, but .248 3P% and .518 FT% drag). Rolfs (78, Simpson — 8.3 RPG, 3.05 AST/TO, rebounding anchor). Carter (81, FMU — 15.9 PPG, .841 FT%, .355 3P%). Brewer (79, FMU — .609 FG%, only 17 TO in 28 games). Noel (78, FMU — .368 3P%, .851 FT%, shooting specialist).*

**74–77 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at NAIA level. 25+ MPG. Consistent two-way contribution. Versatile role player. All-Conference caliber. Trusted in high-leverage games.
*Calibration: Harms (76, Simpson — .357 3P% team-best, 10 PPG). Jillson (75, Simpson — .805 FT%, 9.9 PPG). Mentor (77, FMU — 2.0 SPG, 51 steals, defensive identity).*

**71–73 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive NAIA rosters. Top 6–8 rotation. 18–25 MPG. Clear specialist value.
*Calibration: Kilbert (72, Simpson — 2.5 APG distributor, 1.1 SPG). Asceric (71, FMU — 6.8 PPG bench forward).*

**68–70 — Reliable Bench / Rotation Piece.**
Depth that maintains quality. 12–18 MPG. Energy or specialty contribution.
*Calibration: Torrey (68, Simpson — .306 3P%, bench guard). Munir-Jones (70, FMU — .241 3P%, .432 FT%, worst efficiency in study). Lewis (69, FMU — .455 FG%, split starter).*

**65–67 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.
*Calibration: Attebery (67, Simpson — deep bench forward, 3.5 PPG).*

**62–64 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**59–61 — Fringe Roster / Non-Rotation.** On the roster, not in the plan.

**56–58 — Developmental Redshirt / Project.** Future-oriented. Not viable at competitive NAIA level.

**53–55 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 53 — Below NAIA Viability.** Below NAIA competitive threshold.`;

export const LEGEND_NJCAA_D1 = `# NJCAA DIVISION I PLAYER KR LEGEND v3
## λ = 0.833

Interpretation anchor: Top JUCO D1 programs (Snow, Midland, Vincennes, Region 5/8 powers). Full scholarship availability. High athleticism and pace. Players often prioritize transfer value to NCAA D1/D2. Elite teams sustain 8–10 playable pieces, others drop sharply after 6–7.

**88–100 — NJCAA D1 Player of the Year Lock / Elite National JUCO Star.**
National-level JUCO force who overwhelms the ecosystem. Explosive raw production with sustainable efficiency. Carries team to nationals and title contention.

**84–87 — Franchise Anchor / Top NJCAA Standout.**
Clear #1 option and identity driver. Defines team success. Closes games consistently. Conference POY contender.

**80–83 — High-Impact Starter / Core Winner.**
Primary reason elite JUCO teams win. Heavy minutes leader. All-Conference / All-Region lock. Game-changer vs top JUCO competition.

**76–79 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at high JUCO level. 25+ MPG. Consistent two-way contribution. Versatile role player.

**73–75 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player on strong JUCO rosters. Top 6–8 rotation. 18–25 MPG. Clear specialist value.

**70–72 — Reliable Bench / Rotation Piece.** Depth that maintains quality. 12–18 MPG.

**67–69 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**64–66 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**61–63 — Fringe Roster / Non-Rotation.** On the roster, not in the plan.

**58–60 — Developmental Redshirt / Project.** Future-oriented. Not viable currently.

**55–57 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 55 — Below NJCAA D1 Viability.** Below JUCO D1 competitive threshold.`;

export const LEGEND_NJCAA_D2 = `# NJCAA DIVISION II PLAYER KR LEGEND v3
## λ = 0.750

Interpretation anchor: Strong programs across Midwest/South regions, including national contenders. Partial scholarships. Regional recruiting focus. Player development emphasized for transfer to NCAA D2 or NAIA.

**82–100 — NJCAA D2 Player of the Year Lock / Elite National Standout.**
National-level JUCO D2 force. High raw production with sustainable efficiency. Carries team to national tournament contention.

**78–81 — Franchise Anchor / Top NJCAA D2 All-American.**
Clear #1 option and identity driver. Defines team success. Conference POY contender.

**74–77 — High-Impact Starter / Core Winner.**
Primary reason elite JUCO D2 teams win. Heavy minutes leader. All-Conference / All-Region lock.

**70–73 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at JUCO D2 level. 25+ MPG. Consistent two-way contribution.

**67–69 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player on strong JUCO D2 rosters. Top 6–8 rotation. 18–25 MPG. Clear specialist value.

**64–66 — Reliable Bench / Rotation Piece.** Depth that maintains quality. 12–18 MPG.

**61–63 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**58–60 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**55–57 — Fringe Roster / Non-Rotation.** On the roster, not in the plan.

**52–54 — Developmental Redshirt / Project.** Future-oriented. Not viable currently.

**49–51 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 49 — Below NJCAA D2 Viability.** Below JUCO D2 competitive threshold.`;

export const LEGEND_NJCAA_D3 = `# NJCAA DIVISION III PLAYER KR LEGEND v3
## λ = 0.625

Interpretation anchor: No athletic scholarships. Regional recruiting focus. Schedules generally weaker than scholarship JUCO levels. Heavy emphasis on development and upward transfer (NCAA D3 / NAIA).

**78–100 — NJCAA D3 Player of the Year Lock / Elite National JUCO Standout.**
National-level JUCO D3 force. Dominant raw production relative to schedule. Carries team to national tournament contention.

**74–77 — Franchise Anchor / Top NJCAA D3 All-American.**
Clear #1 option and identity driver. Defines team success. Conference POY contender.

**70–73 — High-Impact Starter / Core Winner.**
Primary reason elite JUCO D3 teams win. Heavy minutes leader. All-Conference / All-Region lock.

**66–69 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at JUCO D3 level. 25+ MPG. Consistent two-way contribution.

**63–65 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player on strong JUCO D3 rosters. Top 6–8 rotation. 18–25 MPG.

**60–62 — Reliable Bench / Rotation Piece.** Depth that maintains quality. 12–18 MPG.

**57–59 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**54–56 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**51–53 — Fringe Roster / Non-Rotation.** On the roster, not in the plan.

**48–50 — Developmental Redshirt / Project.** Future-oriented. Not viable currently.

**45–47 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 45 — Below NJCAA D3 Viability.** Below JUCO D3 competitive threshold.`;

export const LEGEND_CCCAA = `# CCCAA PLAYER KR LEGEND v3
## λ = 0.765

Interpretation anchor: South Coast, Orange Empire, Western State, etc. No athletic scholarships. Strong local/regional recruiting from California HS talent. Majority CCCAA competition. Primary focus on transfer preparation (NAIA / NCAA D2 / selective D1).

**84–100 — CCCAA Player of the Year Lock / Elite State-National JUCO Standout.**
State- or national-level JUCO force who overwhelms the CCCAA ecosystem. Monster raw production with sustainable efficiency. Carries team to state or national contention.

**80–83 — Franchise Anchor / Top CCCAA All-State.**
Clear #1 option and identity driver. Defines team success. Conference/state POY contender.

**76–79 — High-Impact Starter / Core Winner.**
Primary reason strong CCCAA teams win. Heavy minutes leader. All-Conference / All-State lock.

**72–75 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at CCCAA level. 25+ MPG. Consistent two-way contribution.

**69–71 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive CCCAA rosters. Top 6–8 rotation. 18–25 MPG.

**66–68 — Reliable Bench / Rotation Piece.** Depth that maintains quality. 12–18 MPG.

**63–65 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**60–62 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**57–59 — Fringe Roster / Non-Rotation.** On the roster, not in the plan.

**54–56 — Developmental Redshirt / Project.** Future-oriented. Not viable currently.

**51–53 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 51 — Below CCCAA Viability.** Below CCCAA competitive threshold.`;

export const LEGEND_NCCAA_D1 = `# NCCAA DIVISION I PLAYER KR LEGEND v3
## λ = 0.542

Interpretation anchor: Faith-based institutional focus (character, academics, mission). Scholarship variability. Majority competition vs other NCCAA / small Christian / independent programs. Occasional NAIA or NCAA crossover games. Heavy emphasis on development, culture, and upward transfer. Depth is limited; most teams operate 6–8 playable pieces, with very sharp drop-offs.

**74–100 — NCCAA D1 Player of the Year Lock / Elite National Standout.**
National-level NCCAA force who overwhelms the ecosystem. Dominant raw production relative to schedule. Carries team to national tournament contention.

**70–73 — Franchise Anchor / Top NCCAA All-American.**
Clear #1 option and identity driver. Defines team success. Closes games consistently. Conference POY contender.

**66–69 — High-Impact Starter / Core Winner.**
Primary reason elite NCCAA teams win. Heavy minutes leader. All-Conference / All-Region lock.

**62–65 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at NCCAA level. 25+ MPG. Consistent two-way contribution.

**59–61 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive NCCAA rosters. Top 6–8 rotation. 18–25 MPG.

**56–58 — Reliable Bench / Rotation Piece.** Depth that maintains functionality. 12–18 MPG.

**53–55 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**50–52 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**47–49 — Fringe Roster / Non-Rotation.** On the roster, not in the plan.

**44–46 — Developmental Redshirt / Project.** Future-oriented. Not viable currently.

**41–43 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 41 — Below NCCAA D1 Viability.** Below NCCAA competitive threshold.`;

export const LEGEND_NCCAA_D2 = `# NCCAA DIVISION II PLAYER KR LEGEND v3
## λ = 0.500

Interpretation anchor: No athletic scholarships or extremely limited aid. Strong faith-based, academic, and mission-first institutions. Majority competition vs NCCAA D2 peers, small Christian colleges, and independents. Heavy emphasis on development, culture, and participation over specialization. Depth is thin: most programs operate 5–7 playable pieces, with significant drop-offs.

**72–100 — NCCAA D2 Player of the Year Lock / Elite Division Standout.**
Dominant force within the NCCAA D2 ecosystem. Overwhelms D2 competition consistently. Primary offensive and/or defensive engine. Drives conference titles and national tournament success.

**68–71 — Franchise Anchor / NCCAA D2 All-Region Leader.**
Defining identity player on a top NCCAA D2 program. Clear #1 option. Offensive or defensive focal point. Reliable closer. Conference POY contender.

**64–67 — High-Impact Starter / Core Winner.**
Primary reason strong NCCAA D2 teams win. Heavy-minutes leader. All-Conference / All-Region lock.

**60–63 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at NCCAA D2 level. 25+ MPG. Consistent two-way contribution.

**56–59 — Trusted Rotation / Big-Minute Contributor.**
Winning role player on competitive NCCAA D2 rosters. Top 6–7 rotation piece. 18–25 MPG.

**53–55 — Reliable Bench / Rotation Piece.** Depth that maintains functional stability. 12–18 MPG.

**50–52 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**47–49 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**44–46 — Fringe Roster / Non-Rotation.** Rostered but not in the competitive plan.

**41–43 — Developmental Redshirt / Project.** Future-oriented. Not viable currently.

**38–40 — Practice Squad / Walk-On.** Structural roster filler. No competitive pathway.

**Below 38 — Below NCCAA D2 Viability.** Below NCCAA D2 competitive threshold.`;

export const LEGEND_USCAA = `# USCAA PLAYER KR LEGEND v3
## λ = 0.583

Interpretation anchor: Small-school and independent program focus. No or very limited athletic scholarships. Majority competition vs USCAA peers; some NAIA / NCAA D3 crossovers. Heavy emphasis on academics, development, and upward transfer. Depth is limited; most teams operate 6–8 playable pieces max, with sharp drop-offs.

**76–100 — USCAA Player of the Year Lock / Elite National Standout.**
National-level USCAA force who overwhelms the ecosystem. Dominant raw production relative to schedule. Carries team to national tournament contention.
*Calibration: Kalejaiye (86, Lincoln — 29.8 PPG at home, 22.4 PPG vs D1, .372 3P% on 78 D1 attempts, POY Lock who transcends the level). Williams (79, Lincoln — 22.0/9.1/3.4/2.2 at home, 14.6 PPG vs D1).*

**72–75 — Franchise Anchor / Top USCAA All-American.**
Clear #1 option and identity driver. Defines team success. Closes games consistently. Conference POY contender.
*Calibration: McKesey (73, Lincoln — 15/7.2/6.0 at home, triple-double threat, but zero jump shot limits ceiling). Chatelain (73, Lincoln — 10.6/7.3/1.5 BPG, scoring holds at D1, rim protection translates).*

**68–71 — High-Impact Starter / Core Winner.**
Primary reason elite USCAA teams win. Heavy minutes leader. All-Conference lock.

**64–67 — Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at USCAA level. 25+ MPG. Consistent two-way contribution.
*Calibration: Hernandez (66, Lincoln — 10.9 PPG, .390 3P% at home, but collapses at D1).*

**61–63 — Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive USCAA rosters. Top 6–8 rotation.
*Calibration: Plantey (63, Lincoln — 5'8", starts every game, defensive pest, 3 steals vs D1 Pepperdine). Wall (61, Lincoln — .400 3P% at home, bench shooter).*

**58–60 — Reliable Bench / Rotation Piece.** Depth that maintains functionality. 12–18 MPG.
*Calibration: Diomande (59, Lincoln — 6'6" backup big, consistent across levels).*

**55–57 — Situational Specialist / Depth.** Context-dependent bench contributor. 8–12 MPG.

**52–54 — Limited Bench / Emergency Depth.** Playable only under constraint. 5–10 MPG.

**49–51 — Fringe Roster / Non-Rotation.** On the roster, not in the plan.

**46–48 — Developmental Redshirt / Project.** Future-oriented. Not viable currently.

**43–45 — Practice Squad / Walk-On.** Roster filler. No competitive pathway.

**Below 43 — Below USCAA Viability.** Below USCAA competitive threshold.`;


export const LEVEL_LEGENDS: Record<string, string> = {
  ncaa_d1_high_major: LEGEND_NCAA_D1_HM,
  ncaa_d1_mid_major:  LEGEND_NCAA_D1_MM,
  ncaa_d1_low_major:  LEGEND_NCAA_D1_LM,
  ncaa_d2:            LEGEND_NCAA_D2,
  ncaa_d3:            LEGEND_NCAA_D3,
  naia:               LEGEND_NAIA,
  njcaa_d1:           LEGEND_NJCAA_D1,
  njcaa_d2:           LEGEND_NJCAA_D2,
  njcaa_d3:           LEGEND_NJCAA_D3,
  cccaa:              LEGEND_CCCAA,
  nccaa_d1:           LEGEND_NCCAA_D1,
  nccaa_d2:           LEGEND_NCCAA_D2,
  uscaa:              LEGEND_USCAA,
};

export const ALL_LEGENDS = [
  LEGEND_NCAA_D1_HM,
  LEGEND_NCAA_D1_MM,
  LEGEND_NCAA_D1_LM,
  LEGEND_NCAA_D2,
  LEGEND_NCAA_D3,
  LEGEND_NAIA,
  LEGEND_NJCAA_D1,
  LEGEND_NJCAA_D2,
  LEGEND_NJCAA_D3,
  LEGEND_CCCAA,
  LEGEND_NCCAA_D1,
  LEGEND_NCCAA_D2,
  LEGEND_USCAA,
].join(`

---

`);

// ── Validated Test Cases ──────────────────────────────────────────────────────
export const TEST_CASE_LAOLU = `# LAOLU KALEJAIYE — DEEP DIVE PLAYER PROFILE
## KaNeXT Basketball Intelligence | V1 Evaluation | March 27, 2026

---

## IDENTITY

| | |
|---|---|
| **Name** | Laolu Kalejaiye |
| **Position** | PG/SG |
| **Height / Weight** | 5'10 / ~165 |
| **Home Institution** | Lincoln University, Oakland CA |
| **Level** | USCAA (λ = 0.583) |
| **Eligibility** | Junior (TBD remaining) |
| **Background** | Los Angeles → Middlebrooks Academy (prep) → Idaho State (D1 Big Sky, walked on, redshirted 2023-24) → Lincoln University |
| **Prep Context** | At Middlebrooks Academy played the 2 guard alongside Christian Watson (3C2A Player of the Year). Even as the OFF-BALL guard, Kalejaiye still led the team in assists. Natural playmaker regardless of role — doesn't need the ball in his hands to create for others. Can play PG or SG without any role adjustment. |
| **Injury History** | **Calcaneus (heel bone) fracture, sophomore year of prep.** Was dunking before the injury. Sat out entire year. Still hasn't fully recovered burst/explosiveness — cannot fully dunk, still working to regain it. Has had ZERO professional medical rehab, ZERO D1 sports medicine support, ZERO structured recovery protocol. All recovery has been self-directed with no resources. |
| **Injury Implication** | **ALL CURRENT PRODUCTION IS ON A COMPROMISED HEEL.** The .474 3P% from the logo, the 25 PPG vs D1, the 38 vs Pepperdine — every number in this evaluation was produced by a player who cannot fully explode, cannot fully dunk, and has diminished burst compared to his pre-injury self. This is his FLOOR, not his ceiling. With D1 sports medicine, proper rehab protocols, S&C staff, and time — even a 10-15% improvement in explosiveness transforms his game: driving ability improves, FT attempts increase (1.4/game at D1 → projected 4-6/game), finishing at the rim becomes viable, lateral quickness on defense improves (SPG rises), and the scoring versatility that was evident pre-injury (he was DUNKING at 5'10) returns to complement the elite perimeter shooting. The calcaneus fracture is simultaneously the biggest risk factor and the biggest upside indicator in this profile — it means the player the market would evaluate today is significantly worse than the player he will be with proper medical care. |
| **Accolades** | 1st Team All-SWS x2. Back-to-back division champion. GSAAC tournament champion. |
| **Family** | A Kalejaiye. Brother of recruiting coordinator/system designer. |

---

## KR SUMMARY

| Metric | Value |
|---|---|
| **V1 KR** | **86** |
| **Contextual Mode Range** | **80-86 (home level)** |
| **Projected Effective KR (with supporting cast)** | **85-90** |
| **Projected Effective KR (with supporting cast + infrastructure)** | **88-91** |
| **Confidence** | 70-76% |
| **Founding Test Case** | Yes — Test Case #3 in File 01. Created the Multi-Level Player Protocol, Suppression Detection Rules, and Degree of Difficulty Adjustment. |

---

## PRODUCTION — BY LEVEL

### D1 (5 games — LMU, UC Irvine, Pepperdine, Weber State, Long Beach State)

| Stat | Value | Context |
|---|---|---|
| PPG | **22.4** | Led team. Next closest teammate: Williams 14.6 |
| FG% | .380 | 38-100. Volume shooter with no spacing help |
| **3P%** | **.372** | **29-78. From 26-28 feet (logo range). NOT a normal 3P distance mix.** |
| FT% | .778 | 7-9. Limited attempts — doesn't get to the line vs D1 |
| RPG | 2.2 | Expected at 5'10 vs D1 length |
| APG | 2.0 | SUPPRESSED — no teammates who can finish at D1 |
| TO/G | 4.4 | SUPPRESSED — sole ball handler vs D1 pressure with no outlet |
| SPG | 0.4 | SUPPRESSED — conserving energy carrying offense |
| MPG | **38.0** | Plays every minute. No backup can run PG at D1. |

### Last 4 D1 Games (excluding LMU opener — first D1 action in 2 years)

| Stat | Value | Change from 5-game |
|---|---|---|
| PPG | **25.0** | +2.6 — gets BETTER as season progresses |
| FG% | .459 | +.079 — massive efficiency jump |
| **3P%** | **.474** | **+.102 — from elite to historic. 27-57 on LOGO THREES.** |
| APG | 2.25 | +0.25 |
| TO/G | 4.25 | -0.15 |

**The 4-game 3P% (.474) on 57 attempts from logo range is the single most impressive shooting sample in the entire 21-team, 168-player study.**

### Home Level (10 games — NAIA + USCAA + JC)

| Stat | Value |
|---|---|
| PPG | **29.8** |
| FG% | .430 |
| 3P% | .340 (48-140) |
| FT% | **.920** (92-100, including 17-17 game) |
| RPG | 3.1 |
| APG | 3.6 |
| SPG | 2.1 |

### Cross-Level Translation

| Level | PPG | FG% | 3P% | APG | SPG |
|---|---|---|---|---|---|
| USCAA (4 GP) | 31.0 | .440 | .350 | 4.0 | 2.5 |
| NAIA (5 GP) | 28.8 | .420 | .330 | 3.2 | 1.8 |
| D1 (last 4 GP) | **25.0** | **.459** | **.474** | 2.25 | 0.5 |

**Critical insight:** His 3P% IMPROVES at the D1 level (.474) compared to home (.340). This is counterintuitive — it should drop. The explanation: at D1, he takes almost exclusively deep threes (logo range, 26-28 feet) with single coverage. At home, he takes a wider mix of shots including contested mid-range and drives against double teams. The D1 shot profile is actually CLEANER because opponents don't know how to guard a 5'10 guard shooting from the logo — they sag off and he shoots over them, or they close out and he drives.

---

## SIGNATURE GAMES

### vs Pepperdine (D1 WCC) — 38 PTS
13-22 FG, **12-18 3P**, 0-0 FT, 1 REB, 0 AST, 2 TO
**Twelve three-pointers. Multiple from the logo. The single most impressive individual performance in the entire 21-team study.** No other player in 168+ evaluations had a game this efficient at this volume from this range against D1 competition.

### vs Long Beach State (D1 Big West) — 25 PTS, 5 AST
8-22 FG, 6-15 3P, 3-3 FT, 4 REB, 5 AST, 5 TO
Last D1 game of the season. Best all-around line. The 5 assists show playmaking that's suppressed in other games. **Scored 25 and had 5 assists ON the team he'd transform in the portal (LBSU, 10-22).**

### vs UC Irvine (D1 Big West, 4th-best DRTG nationally) — 19 PTS
7-14 FG, **5-10 3P**, 0-0 FT, 2 REB, 0 AST, 3 TO
**Scored 19 against the 4th-ranked defense in the country.** 50% from three against a defense that held most teams to 30%.

### vs Weber State (D1 Big Sky) — 18 PTS, 4 AST
6-16 FG, 4-14 3P, 2-3 FT, 3 REB, 4 AST, 7 TO
Weber State coach confirmed: **"He was the only name on our scouting report."** Face-guarded full court. Still scored 18 with 4 assists. Gets BETTER as teams scout him.

### vs LMU (D1 WCC) — 12 PTS (worst game)
4-26 FG, 2-21 3P, 2-3 FT, 1 REB, 1 AST, 5 TO
First D1 game in 2 years. Shot 7.7% from three. This is the floor. **He never had a game this bad again — the next 4 D1 games averaged 25.0 PPG on .474 3P%.** The adjustment period was ONE GAME.

### vs Cal Maritime G2 (NAIA) — 35 PTS
9-26 FG, 3-17 3P, **14-18 FT**, 4 REB, 5 AST, 3 TO
Couldn't buy a three (17.6%) but went to the line 18 times. Shows the ability to CREATE contact and score when the shot isn't falling. Adaptable.

### vs Simpson G1 (NAIA) — 30 PTS
6-20 FG, 1-12 3P, **17-17 FT**, 2 REB, 2 AST, 3 TO
**PERFECT 17-17 from the free throw line.** When the three isn't dropping, he attacks and gets to the line. .920 FT% on 100 home-level attempts confirms this is a skill, not a fluke.

---

## SUPPRESSION DETECTION — ALL 6 INDICATORS FIRE

| Indicator | Status | Evidence |
|---|---|---|
| **Sole Threat** | ✅ FIRES | 34.7% of team scoring at D1. 50% of team 3PA. No teammate above 12 PPG consistently. |
| **Roster Quality Gap** | ✅ FIRES | His KR (86) vs #3 teammate McKesey (73) = 13-point gap. Vs #5-8 = 20-27 point gap. Protocol threshold: 15+. |
| **Scouting Confirmation** | ✅ FIRES | Weber State coach: "He was the only name on our scouting report." NAIA teams double him, pick him up halfcourt. |
| **Level Mismatch** | ✅ FIRES | Home institution USCAA (λ=0.583). Playing D1 games (λ=0.917-1.000). 6+ KLVN tiers below. |
| **Cross-Level Stat Divergence** | ✅ FIRES | FT attempts: ~10/game home → 1.4/game D1 (86% drop). Steals: 2.1 home → 0.4 D1 (81% drop). Assists: 3.6 → 2.0 (44% drop). |
| **Role Overload** | ✅ FIRES | Sole ball handler + primary scorer + only perimeter threat. Confirmed by coaching staff. |

**6 of 6 suppression indicators. Maximum suppression score. This was the founding case that CREATED the suppression detection protocol.**

---

## DEGREE OF DIFFICULTY ADJUSTMENT — ALL 3 FLAGS FIRE

| Flag | Evidence |
|---|---|
| **Deep Range Exclusively** | Every 3PA is from 25+ feet. Standard 3P% bands assume normal distance distribution. His .474 from exclusively logo range is harder than .474 from a normal mix. |
| **Face-Guarded / Full-Court Denied** | Confirmed at NAIA level. Opponents pick him up halfcourt, face-guard, double off screens. Standard efficiency bands assume normal defensive attention. |
| **Sole Ball Handler vs D1 Pressure** | Only player who can handle against D1 defenders. No outlet pass options. Standard TO bands assume normal team context. His 4.4 TO/G is systemic, not individual. |

---

## ENVIRONMENTAL SUPPRESSION (Beyond Standard Protocol)

| Factor | Status | Impact |
|---|---|---|
| **No scholarship** | ✅ | Paying to play. Every other player in the 168-player study has athletic aid. |
| **Works near full-time** | ✅ | Basketball competes with survival. No other player in the study has this constraint. |
| **No gym** | ✅ | No home court. No consistent practice facility. |
| **No dorm** | ✅ | No team housing. No team culture infrastructure. |
| **No weight room** | ✅ | No S&C program. No strength coach. No periodized training. Physical development is self-directed. |
| **No skill development staff** | ✅ | No shooting coach. No player development coordinator. No film room with Synergy. Shot refinement is self-taught. |

**Every physical trait (strength, speed, lateral quickness, endurance, vertical pop, motor) is being measured at his FLOOR.** Give him 6 months of D1 infrastructure and every physical metric improves.

---

## PORTAL VALUE COMPARISON

| Player | School | KR | Eff KR w/ Resources | 3P% vs D1 | Cost | Competition |
|---|---|---|---|---|---|---|
| Isaiah Johnson | Colorado | 91 | 91 | .380 | 7 figures | Every blueblood |
| Shelstad | Oregon | 88 | 88-89 | .352 | 6 figures | Top 15 programs |
| KJay Bradley | USD | 85 | 85-86 | ~.330 | Mid NIL | MM programs |
| **Kalejaiye** | **Lincoln** | **86** | **88-91** | **.474** | **Free** | **Nobody** |

**Kalejaiye is the best 3PT shooter in this comparison by a massive margin — while having zero resources, zero teammates, and maximum defensive attention.** He costs nothing. Nobody else is recruiting him. The market inefficiency is total.

---

## FIT PROJECTIONS — WHERE HE TRANSFORMS PROGRAMS

### At FMU (NAIA, Team KR 77 → projected 80-81)
Joins Selden (82), Carter (81), Brewer (79), Noel (78). Suppression lifts ENTIRELY — five teammates at 78+ KR. He's the alpha scorer in a real system. Effective KR: 88-90. FMU goes from National Championship Contender to National Title Favorite.

### At Chaminade (D2, Team KR 79 → projected 82-83)
Plays with best friend Roland Banks (81). Five teammates at 80+ KR. His system (Spread PnR) is already Chaminade's system. Effective KR: 88-89. Projected 22-26 wins. D2 national tournament lock.

### At Long Beach State (D1 LM, Team KR 81 → projected 83-84)
Secondary scorer next to Sykes (88). Off-ball shooter role — catch-and-shoot, spot up, transition threes. .474 3P% with single coverage. System confidence jumps from 35% to 55-60%. Projected 18-22 wins.

### At Pepperdine (D1 MM, Team KR 78 → projected 81-82)
Best player on the roster immediately. Already scored 38 IN THEIR GYM. Knows the competition. Effective KR: 88-89. Projected 15-18 wins (up from 10-23).

### At Weber State (D1 LM, Team KR 80 → projected 83)
Scored 18 against them while being the only scouting focus. Their coach already knows what he can do. With Saine (86) and supporting cast, suppression lifts. Effective KR: 87-88. Projected 20-22 wins.

---

## WHAT THE DATA SAYS HE IS

A 5'10 guard who shoots .474 from the logo against D1 competition with no gym, no weight room, no scholarship, no teammates, and a full-time job. Who scores 25 PPG in his last 4 D1 games. Who scored 38 against Pepperdine on 12-18 from three. Who scored 19 against the 4th-best defense in the country. Who gets BETTER as teams scout him. Who has never had a single day of professional basketball development resources.

He is the best value add in the 2026 transfer portal — and nobody knows he exists except the intelligence system that was built on his evaluation.

---

## WHAT HE BECOMES WITH INFRASTRUCTURE

| Current (Zero Resources, Compromised Heel) | Projected (D1 Resources + Medical Rehab, 6-12 months) |
|---|---|
| .474 3P% from logo (D1, last 4) | .450-500 3P% (improved shot selection with coaching) |
| 25.0 PPG (sole creator) | 18-22 PPG (shared creation = fewer shots, higher efficiency) |
| 2.0 APG (no finishers) | 4-6 APG (real teammates finish) |
| 4.4 TO/G (sole handler, no outlet) | 2.0-2.5 TO/G (shared handling, better spacing) |
| 0.4 SPG at D1 (energy conservation + heel) | 1.2-1.8 SPG (fresher, lateral quickness returns with rehab) |
| 1.4 FTA/G at D1 (can't explode to rim) | **4-6 FTA/G (heel recovery restores driving ability)** |
| No S&C development | Stronger, faster, more explosive. Heel-specific rehab + S&C = burst returns. |
| No medical support for calcaneus | **D1 sports medicine + structured rehab = 10-15% explosiveness recovery expected** |
| Cannot dunk (was dunking pre-injury at 5'10) | **Rim finishing becomes viable weapon again. Was an above-the-rim player before fracture.** |
| No film/analytics support | Better shot selection. Fewer bad-shot possessions. |
| No shooting coach | Refinement of already elite mechanics. Consistency improves. |

**He was a 5'10 guard who could DUNK. He fractured his heel. He lost his burst. He taught himself to shoot from the logo instead. And he shoots .474 against D1 on a broken foundation. Give him a doctor and a weight room and you get BOTH — the logo shooting AND the driving/finishing game he lost. That's not a player. That's a cheat code.**

---

## FINAL ASSESSMENT

Laolu Kalejaiye at 86 KR is the most suppressed, highest-ceiling, lowest-cost player identified in the 21-team, 168-player KaNeXT Basketball Intelligence V1 calibration study. His shooting from logo range against D1 competition exceeds every portal target evaluated. His effective KR with real infrastructure projects to 88-91 — a D1 MM franchise player, a D1 LM program changer, an NAIA dynasty builder. He costs nothing. Nobody is recruiting him. The intelligence system built on his evaluation is the only scouting operation in the world that can see him.

He is the founding proof of concept for Nexus Basketball Intelligence, and the strongest evidence that the system works.`;

export const TEST_CASE_LINCOLN = `# Lincoln University Oakland — 2025-26
## KaNeXT Basketball Intelligence | V1 Evaluation | FINAL, LOCKED
## Validated: March 27, 2026 | Evaluator: Sammy Kalejaiye

---

## STATUS

**LOCKED.** All KR values, confidence ratings, and cross-level findings below are validated. Do not recompute. Narrate and interpret only.

This program is **Test Case #3** in the V1 Calibration Study (21 teams, 168 players). It is the founding case for:
- Multi-Level Player Protocol
- Suppression Detection Rules (all 6 indicators)
- Degree of Difficulty Adjustment
- Environmental Suppression category

---

## PROGRAM

| Field | Value |
|---|---|
| School | Lincoln University, Oakland CA (~800 students) |
| Governing Body | USCAA (GSAAC conference) |
| Level Key | \`uscaa\` (λ = 0.583) |
| Head Coach | William Middlebrooks |
| Head Assistant / Recruiting Coordinator | Sammy Kalejaiye (built roster, designed system) |
| Record | Back-to-back division champions. GSAAC tournament champions. 3-2 vs NAIA. 4-0 vs USCAA. 1-0 vs JC. 0-5 vs D1. |

---

## COACH CONTEXT

| Field | Value |
|---|---|
| OSIE | Spread PnR (60%) + Pace & Space (40%). Confidence: 50%. |
| DSIE | Pressure Man (70%) + Zone (30%). Confidence: 45%. |
| System note | Superfast pace. Threes and layups. Kalejaiye's deep range creates spacing for Williams to attack the rim. Active hands throughout lineup — steals translate up to D1. System designed by Sammy Kalejaiye (same person who recruited entire roster). |

---

## DATA INVENTORY (15 games with individual box scores)

| Level | GP | Record | Opponents |
|---|---|---|---|
| D1 | 5 | 0-5 | LMU (WCC), UC Irvine (Big West), Pepperdine (WCC), Weber State (Big Sky), Long Beach State (Big West) |
| NAIA — Simpson | 2 | 1-1 | Simpson University x2 |
| NAIA — Cal Maritime | 3 | 2-1 | Cal Maritime x3 |
| USCAA | 4 | 4-0 | Cal Miramar, Cal Prestige, Cal Intercontinental x2 |
| JC | 1 | 1-0 | Ohlone College |
| **TOTAL** | **15** | **8-7** | |

---

## ROSTER — KR COMPRESSION TABLE

| # | Player | Pos | Ht | **KR** | USCAA Label | NAIA Label | D2 Label | D1 LM Label |
|---|---|---|---|---|---|---|---|---|
| 1 | Kalejaiye, Laolu | G | 5'10 | **86** | POY Lock / Elite Standout | Franchise Anchor | Franchise Anchor | High-Impact Starter |
| 2 | Williams, Brandon | G | 6'4 | **79** | POY Lock / Elite Standout | High-Impact Starter | Solid Starter | Trusted Rotation |
| 3 | McKesey, Claude | G | 5'10 | **73** | Franchise Anchor | Trusted Rotation | Situational Specialist | Situational Specialist |
| 4 | Chatelain, Nathan | F | 6'7 | **73** | Franchise Anchor | Trusted Rotation | Situational Specialist | Situational Specialist |
| 5 | Hernandez, Adrian | G | 5'11 | **66** | Solid Starter | Situational Specialist | Limited Bench | — |
| 6 | Plantey, Chris | G | 5'8 | **63** | Trusted Rotation | Limited Bench | — | — |
| 7 | Wall, Samuel | G | 6'0 | **61** | Trusted Rotation | Fringe Roster | — | — |
| 8 | Diomande, Paul-Ismael | F | 6'6 | **59** | Reliable Bench | Fringe Roster | — | — |

**Team KR spread: 27 points (86 to 59).** Widest spread in the 21-team study. Classic signature of a USCAA program with one D1-caliber player and a steep talent cliff.

---

## PLAYER EVALUATIONS

### 1. LAOLU KALEJAIYE — G | 5'10 | **KR: 86** | Confidence: 70–76%

**This is the founding case for the Suppression Detection protocol. All 6 suppression indicators fire.**

**Background:** From Los Angeles. Attended Middlebrooks Academy (prep). Walked on at Idaho State (D1 Big Sky) in 2023-24, redshirted. Transferred to Lincoln. 1st Team All-SWS x2. Back-to-back division champion. GSAAC tournament champion.

**Prep context:** At Middlebrooks Academy played the 2 guard alongside Christian Watson (3C2A Player of the Year). As the off-ball guard — not the primary ball handler — Kalejaiye still led the team in assists. Natural playmaker regardless of role. Can play PG or SG without any role adjustment.

**Injury history — CRITICAL:** Calcaneus (heel bone) fracture, sophomore year of prep. Was dunking before the injury. Sat out an entire year. Has never fully recovered burst/explosiveness — cannot fully dunk, still working to regain it. Has had ZERO professional medical rehab, ZERO D1 sports medicine support, ZERO structured recovery protocol. All recovery has been self-directed with no resources.

**Injury implication:** ALL current production is on a compromised heel. The .474 3P% from the logo, the 25 PPG vs D1, the 38 vs Pepperdine — every number in this evaluation was produced by a player who cannot fully explode, cannot fully dunk, and has diminished burst compared to his pre-injury self. This is his FLOOR. With D1 sports medicine and proper rehab: driving ability improves, FT attempts increase (1.4/game at D1 → projected 4-6/game), finishing at the rim becomes viable, lateral quickness improves, and the above-the-rim game he had before the fracture returns to complement the elite perimeter shooting.

**Production:**
| Level | GP | PPG | RPG | APG | SPG | FG% | 3P% | FTA/G |
|---|---|---|---|---|---|---|---|---|
| Home (USCAA/NAIA/JC) | 10 | 29.8 | 3.1 | 3.6 | 2.1 | .430 | .340 (48-140) | 10.0 |
| D1 (5 GP full) | 5 | 22.4 | 2.2 | 2.0 | 0.4 | .380 | .372 (29-78) | 1.4 |
| D1 (last 4 GP only) | 4 | 25.0 | — | 2.25 | — | .459 | .474 (27-57) | — |

**Critical note on 3P%:** His D1 3P% (.474 last 4 games) IMPROVES over home level (.340). At D1 he takes exclusively logo threes (26-28 feet) with single coverage. At home he takes a wider shot mix including contested mid-range and drives against double teams. The D1 shot profile is cleaner. The FTA/G collapse at D1 (10.0 home → 1.4 D1) is partly suppression AND partly the heel — he cannot explode to the rim to draw fouls the way he does at lower levels.

**Phase 3 anchor:** 83–87. Midpoint 85.

**Phase 6 adjustment:** +1.0 → **Final KR: 86.** Up signal: .372 3P% on 78 D1 attempts from 26-28 feet is elite shot-making that transcends height and level. Down signals: .380 FG% at D1 (lives by three), 4.4 TO/G at D1 (suppressed — systemic, not individual), zero defensive impact at D1, 4-26 LMU opener (adjustment game, never repeated).

**Contextual range:** 80–86 (home level). **Projected effective KR with supporting cast: 85–90. With D1 infrastructure + medical rehab: 88–91.**

**Suppression — all 6 indicators fire:**
| Indicator | Evidence |
|---|---|
| Sole Threat | 34.7% of team scoring at D1. 50% of team 3PA. No teammate above 12 PPG consistently. |
| Roster Quality Gap | His KR (86) vs #3 teammate (73) = 13-pt gap. Vs #5–8 = 20–27 pt gap. Protocol threshold: 15+. |
| Scouting Confirmation | Weber State coach: "He was the only name on our scouting report." Face-guarded full court. |
| Level Mismatch | Home institution USCAA (λ=0.583). Playing D1 (λ=0.917–1.000). 6+ KLVN tiers below. |
| Cross-Level Stat Divergence | FT attempts: 10.0/game home → 1.4/game D1 (86% drop). SPG: 2.1 → 0.4 (81% drop). APG: 3.6 → 2.0 (44% drop). |
| Role Overload | Sole ball handler + primary scorer + only perimeter threat. Confirmed by coaching staff. |

**Degree of Difficulty — all 3 flags fire:**
- Every 3PA from 25+ feet (logo range). Standard 3P% bands assume normal distance distribution.
- Face-guarded and picked up halfcourt at NAIA. Standard efficiency bands assume normal defensive attention.
- Sole ball handler vs D1 press with no outlet pass options. His 4.4 TO/G is systemic, not individual.

**Signature games:**
| Opponent | Level | Line | Notes |
|---|---|---|---|
| Pepperdine | D1 WCC | **38 pts** (13-22, 12-18 3P) | 12 threes, multiple from logo. Single most impressive individual performance in 168-player study. |
| Long Beach State | D1 Big West | **25 pts**, 5 ast (8-22, 6-15 3P) | Best all-around D1 line. Shows suppressed playmaking. |
| UC Irvine | D1 Big West (4th DRTG nationally) | **19 pts** (7-14, 5-10 3P) | 50% from three vs a defense holding most teams to 30%. |
| Weber State | D1 Big Sky | **18 pts**, 4 ast (6-16, 4-14 3P) | Coach confirmed face-guard. Still scored 18. Gets better as teams scout him. |
| Cal Maritime G2 | NAIA | **35 pts** (9-26, 3-17 3P, 14-18 FT) | Couldn't shoot (17.6% 3P) — went to the line 18 times instead. Shows adaptability. |
| Simpson G1 | NAIA | **30 pts** (6-20, 1-12 3P, **17-17 FT**) | Perfect 17-17 FT when threes weren't dropping. |
| LMU | D1 WCC | **12 pts** (4-26, 2-21 3P) | Worst game. First D1 action in 2 years. FLOOR. Next 4 D1 games: 25.0 PPG, .474 3P%. One-game adjustment. |

**Environmental suppression (beyond standard protocol):** No scholarship (paying to play). Works near full-time. No home court. No dorm/team housing. No weight room. No S&C program. No skill development staff. No film room. Every physical trait measured at his floor — including physical traits already compromised by the unrehabilitated heel.

**What he becomes with infrastructure:**
| Current (Zero Resources, Compromised Heel) | Projected (D1 Resources + Medical Rehab, 6-12 months) |
|---|---|
| .474 3P% from logo (D1, last 4) | .450–.500 3P% (improved shot selection with coaching) |
| 25.0 PPG (sole creator) | 18-22 PPG (shared creation = fewer shots, higher efficiency) |
| 2.0 APG (no finishers) | 4-6 APG (real teammates finish) |
| 4.4 TO/G (sole handler, no outlet) | 2.0-2.5 TO/G (shared handling, better spacing) |
| 0.4 SPG at D1 (energy conservation + heel) | 1.2-1.8 SPG (fresher, lateral quickness returns with rehab) |
| **1.4 FTA/G at D1 (can't explode to rim)** | **4-6 FTA/G (heel recovery restores driving ability)** |
| Cannot dunk (was dunking pre-injury at 5'10) | **Rim finishing viable again. Was an above-the-rim player before fracture.** |
| No medical support for calcaneus | D1 sports medicine + structured rehab = 10-15% explosiveness recovery expected |

**He was a 5'10 guard who could dunk. He fractured his heel. He lost his burst. He taught himself to shoot from the logo instead. He shoots .474 against D1 on a broken foundation. Give him a doctor and a weight room and you get both — the logo shooting AND the driving/finishing game he lost. That's not a player. That's a cheat code.**

**Portal value context (as of March 2026):**
| Player | School | KR | Eff KR w/ Resources | 3P% vs D1 |
|---|---|---|---|---|
| Isaiah Johnson | Colorado | 91 | 91 | .380 |
| Shelstad | Oregon | 88 | 88-89 | .352 |
| KJay Bradley | USD | 85 | 85-86 | ~.330 |
| **Kalejaiye** | **Lincoln** | **86** | **88–91** | **.474** |

Best 3PT shooter in this comparison by a wide margin. Costs nothing. No competing recruitment as of evaluation date.

---

### 2. BRANDON WILLIAMS — G | 6'4 | **KR: 79**

**Production:**
| Level | GP | PPG | RPG | APG | SPG | FG% | 3P% | FT% |
|---|---|---|---|---|---|---|---|---|
| Home | 9 | 22.0 | 9.1 | 3.4 | 2.2 | .670 | .260 | .800 |
| D1 | 5 | 14.6 | 2.0 | 2.8 | 2.0 | .481 | .250 | .704 |

Elite finisher at home (.670 FG%). Zero three-point shot (.250-.260 at every level — consistent). Rebounding is size-dependent: 9.1 RPG home drops to 2.0 at D1 (78% drop — biggest in study, confirms size advantage shrinks). Defensive activity (2.0 SPG) translates at every level. 14.6 PPG on .481 FG% at D1 = scoring translates. The only guard with D1-level size on the roster.

**Signature games:** Cal Miramar: 34/20/7/4. Cal Maritime G3: 30/10 (10-11 FG). LMU: 21 pts (6-9, 8-10 FT). Weber State: 20 pts, 4 ast.

---

### 3. CLAUDE McKESEY — G | 5'10 | **KR: 73**

**Production:**
| Level | GP | PPG | RPG | APG | SPG | FG% | 3P% | FT% |
|---|---|---|---|---|---|---|---|---|
| Home | 10 | 15.0 | 7.2 | 6.0 | 1.7 | .475 | .053 (1-19) | .650 |
| D1 | 5 | 7.2 | 3.6 | 3.6 | 1.0 | .268 | .077 | .714 |

Triple-double threat at home level (15-assist game, near triple-doubles multiple times). Zero three-point shot at any level. One-read passer (feeds Kalejaiye). At 5'10 with no jumper, D1 length eliminates his inside finishing (.268 FG%). But 7.2 RPG at 5'10 home → 3.6 vs D1 = extraordinary effort-based rebounding that partially translates. High-motor pitbull. His 52% PPG drop (15.0 → 7.2) at D1 is skill-based.

**Signature games:** Cal Intercontinental G1: 25/11/7/3. Cal Prestige: 6 pts, 10 reb, **15 ast**. Simpson G2: 22/10 (double-double).

---

### 4. NATHAN CHATELAIN — F | 6'7 | **KR: 73**

**Production:**
| Level | GP | PPG | RPG | APG | BPG | FG% |
|---|---|---|---|---|---|---|
| Home | 10 | 10.6 | 7.3 | 2.3 | 1.5 | .530 |
| D1 | 5 | 10.2 | 4.4 | 0.8 | 1.2 | .475 |

Most level-proof player on the roster after Kalejaiye. Scoring barely changes across levels (10.6 home → 10.2 D1 — 4% drop). 1.2 BPG at D1 = rim protection translates. The only real big man; plays center by necessity at 6'7. The only player in the study with both top-5 scoring retention and confirmed rim protection at D1.

**Signature games:** Cal Intercontinental G2: 23/13 (double-double). UCI: 16 pts, 6 reb. Pepperdine: 12 pts, 7 reb.

---

### 5. ADRIAN HERNANDEZ — G | 5'11 | **KR: 66**

**Production (home):** 10.9 PPG, .480 FG%, **.390 3P%** (specialist). **D1:** 2.4 PPG, .200 FG%, .222 3P%.

Biggest cross-level gap in the rotation (78% PPG drop). Three-point specialist at home who is invisible at D1. At 5'11, D1 closeouts eliminate his shot entirely. Functional at USCAA level.

---

### 6. CHRIS PLANTEY — G | 5'8 | **KR: 63**

**Production (home):** 3.0 PPG, 1.5 APG, 1.5 SPG, .370 3P%. **D1:** 1.8 PPG, 1.8 APG, 0.8 SPG, .333 FG%.

Smallest player in the 20-team study. Starts every game. Pure defensive specialist and connector. 3 steals vs Pepperdine (D1). 4 steals vs Simpson (NAIA). Almost never scores by design.

---

### 7. SAMUEL WALL — G | 6'0 | **KR: 61**

**Production (home):** 7.2 PPG, .400 3P%. **D1:** 2.0 PPG, .333 FG%.

Bench shooter. 21-pt ceiling game vs Cal Prestige. Disappears at D1 (72% PPG drop). Home-level specialist only.

---

### 8. PAUL-ISMAEL DIOMANDE — F | 6'6 | **KR: 59**

**Production (home):** 3.5 PPG, 3.0 RPG, 0.5 BPG, .350 FG%. **D1:** 3.4 PPG, 2.0 RPG, 0.4 BPG, .350 FG%.

Backup big. Production essentially identical at every level — gives maximum effort regardless of competition. Energy body and structural rim presence. The closest to a "floor" player in the study.

---

## CROSS-LEVEL TRANSLATION FINDINGS

### Production Translation: Home → D1

| Player | Ht | Home PPG | D1 PPG | PPG Drop | Home FG% | D1 FG% | Why |
|---|---|---|---|---|---|---|---|
| Kalejaiye | 5'10 | 29.8 | 22.4 | **25%** | .430 | .380 | Skill (logo 3P) transcends size |
| Williams | 6'4 | 22.0 | 14.6 | 34% | .670 | .481 | Size advantage shrinks at D1 |
| Chatelain | 6'7 | 10.6 | 10.2 | **4%** | .530 | .475 | Most level-proof — size + defense |
| McKesey | 5'10 | 15.0 | 7.2 | 52% | .475 | .268 | No jumper + 5'10 = can't finish at D1 |
| Wall | 6'0 | 7.2 | 2.0 | 72% | .430 | .333 | Bench shooter, can't compete at D1 |
| Hernandez | 5'11 | 10.9 | 2.4 | 78% | .480 | .200 | D1 closeouts eliminate his shot |
| Plantey | 5'8 | 3.0 | 1.8 | 40% | .310 | .333 | Already minimal — defense is value |
| Diomande | 6'6 | 3.5 | 3.4 | **3%** | .350 | .350 | Already at floor — gives everything |

### Rebounding Translation

| Player | Ht | Home RPG | D1 RPG | Drop | Why |
|---|---|---|---|---|---|
| Williams | 6'4 | 9.1 | 2.0 | **78%** | Size-dependent; advantage disappears at D1 |
| McKesey | 5'10 | 7.2 | 3.6 | 50% | Effort-based; partially translates |
| Chatelain | 6'7 | 7.3 | 4.4 | 40% | Retains some size advantage at D1 |
| Kalejaiye | 5'10 | 3.1 | 2.2 | 29% | Skill-based pursuit; best retention among small guards |

**Key insight:** Skill-based production (Kalejaiye's three-point shooting) translates the best. Physicality-based production (McKesey's inside finishing, Williams' rebounding) drops the most. Defense (Chatelain's blocks, Plantey's steals) translates well.

---

## STUDY CONTEXT

### Lincoln vs Other Sub-D1 Programs in Study

| Team | Level | Best KR | Spread |
|---|---|---|---|
| Cal State East Bay | D2 | 89 (T. Campbell) | 14 |
| **Lincoln University** | **USCAA** | **86 (Kalejaiye)** | **27** |
| Chaminade | D2 | 85 (K. King) | 15 |
| Simpson University | NAIA | 82 (Parker) | 15 |
| Florida Memorial | NAIA | 82 (Selden) | 13 |

Lincoln's top-end KR (86) exceeds both NAIA programs' best players (82) and nearly matches Chaminade's D2 best (85). Only CSEB's Campbell (89, D2 POY on a 33-1 team) is higher. The 27-point spread is the widest in the study.

---

## FIT PROJECTIONS (Transfer Portal Scenarios — Kalejaiye)

| Destination | Level | Team KR w/ Kalejaiye | Effective KR | Basis |
|---|---|---|---|---|
| FMU | NAIA | 77 → 80-81 | 88-90 | Joins Selden (82), Carter (81), Brewer (79), Noel (78). Suppression lifts entirely. FMU goes from title contender to title favorite. |
| Chaminade | D2 | 79 → 82-83 | 88-89 | Plays with Roland Banks (81). Five teammates at 80+. Spread PnR already their system. Projected 22-26 wins. National tournament lock. |
| Long Beach State | D1 LM | 81 → 83-84 | ~86 | Secondary scorer next to Sykes (88). Off-ball shooter role. .474 3P% with single coverage. |
| Pepperdine | D1 MM | 78 → 81-82 | 88-89 | Best player immediately. Already scored 38 in their gym. Projected 15-18 wins (up from 10-23). |
| Weber State | D1 LM | 80 → 83 | 87-88 | Coach already knows his ability. Joins Saine (86). Projected 20-22 wins. |`;
