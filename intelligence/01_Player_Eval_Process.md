# COACH CONTEXT SETUP

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
cases.