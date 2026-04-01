# MEN'S GOLF PLAYER EVALUATION PROCESS
## File 01 - v1.0

---

# COACH CONTEXT SETUP

## Coach Context Setup - v1 (LOCKED)

### Purpose
Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Program Name** - e.g., "Oklahoma State Men's Golf"
2. **Governing Body** - NCAA, NAIA, NJCAA
3. **Division** (if applicable) - NCAA: D1/D2/D3, NJCAA: D1/D2/D3
4. **Major Class** (required only if NCAA D1) - Power Conference, Mid-Major, Low-Major
5. **Team Philosophy** - must match one of the defined team philosophies:
   - Aggressive (bomb-and-gouge, attack pins, play for birdies)
   - Conservative (fairways-and-greens, manage risk, minimize big numbers)
   - Balanced (adjust strategy to course and conditions)
   - Course-Dependent (philosophy shifts based on tournament venue)

These fields bind: KLVN normalization bands, KR legend interpretation, trait weighting emphasis, and confidence gate ranges.

### Optional Metadata
1. Conference - non-blocking if blank. Used by KLVN for D1 Major Class auto-assignment.
2. Home Course - course rating, slope, typical conditions
3. Regional Tournament History - common venues and course types faced

### Optional Constraints (Downstream Only)
These fields do not alter trait scoring or KR computation. They are consumed only by downstream planning systems (Scholarship Allocation, Recruiting, Roster Construction).

1. Scholarships Available (cannot exceed 4.5 for men's golf)
2. Operating Budget
3. Recruiting Budget
4. Roster Size Target (typical: 8-12)
5. Competition Slots (typical: 5 per tournament, count best 4 of 5)
6. Travel Budget
7. Practice Facility Quality (driving range, short game area, course access)

### Context Lock
When all required fields (1-5) are populated and validated, system state transitions to Coach Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

---

# PLAYER PROFILE

## Player Profile (Auto-Populated Record)

### A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth
- Age (derived)
- Height (current)
- Weight (current)
- Handedness (right-handed, left-handed)
- City/Town of origin
- State/Province
- Country
- High school
- Junior golf program / tour participation (AJGA, USGA Junior, state amateur)
- Current team affiliation (if applicable)
- Amateur status (active amateur, professional)

### B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- League / competition level (as reported)
- Season/year label
- Dates active (if available)

### C) Raw Production Data (Season-by-Season)
For each season:
- Rounds played
- Scoring average (raw)
- Scoring average (adjusted for course difficulty, if available from Golfstat or equivalent)
- Low round
- High round
- Stroke average relative to par
- Tournament starts
- Tournament wins
- Top-5 finishes
- Top-10 finishes
- Top-20 finishes
- Missed cuts / DNFs
- Match play record (if applicable)
- Stroke play vs par breakdown:
  - Par-3 scoring average
  - Par-4 scoring average
  - Par-5 scoring average
  - Eagles per round
  - Birdies per round
  - Pars per round
  - Bogeys per round
  - Double bogeys or worse per round
- Ball-striking stats (if available):
  - Driving distance average
  - Driving accuracy %
  - Greens in regulation %
  - Approach shot proximity (if available)
- Short game stats (if available):
  - Putts per round
  - One-putt %
  - Three-putt avoidance %
  - Scrambling %
  - Sand save %
  - Up-and-down %

### D) Academic Record (Public / Declared Only)
- GPA (if available)
- Academic honors (if available)
- Publicly reported eligibility status (if available)

### E) Declared Medical Information (Public Only)
- Declared injuries (if available) - back, wrist, shoulder, elbow, knee
- Public injury reports (if available)
- Medical redshirt designations (if applicable)

### F) Off-Course Public Record (Observable Only)
- Public statements (if captured)
- Social media presence (handles only)
- Verifiable public incidents (if applicable)
- Awards and honors (All-Conference, All-American, Player of the Year, etc.)
- National amateur rankings (WAGR, Golfstat, GolfWeek)

### G) Contact and Identification Metadata (Legal / Voluntary Only)
- Phone number(s)
- Email address(es)
- Social media handles

### H) Source Attribution + Trust Metadata (Per Field)
- Source for each element
- Verification status: verified / unverified
- Known coverage gaps (missing seasons, missing stats, etc.)

### Locked Exclusions (never in Player Profile)
- Evaluations/ratings/KRs
- Archetypes
- Course fit projections
- Role inference
- Private medical or disciplinary records
- Household income / parental info
- Subjective recruiting opinions

---

# PLAYER CONFIDENCE GATE

## Player Confidence Gate - v1 (LOCKED STRUCTURE, PROVISIONAL RANGES)

### Purpose
Confidence % is a single number that communicates evidence completeness and stability for a player evaluation. It answers: "how much should you trust this KR?"

### Output
confidence_pct is a value from 0 to 100. Computed at the end of player evaluation.

### What It Affects
Confidence % does not change any KR math. It is used for transparency and optionally for gating what the system is allowed to claim or trigger downstream.

### Data Tier Reference

| Tier | Definition |
|------|-----------|
| V1 - Stats-Only | Scoring average, tournament results, basic splits (par-3/4/5). No ShotLink or approach-level data. |
| V1+ - Stats + Granular | V1 + Golfstat adjusted scoring + detailed ball-striking/putting stats from Golfstat/team reports |
| V2 - ShotLink/Trackman | V1+ plus shot-level data (ShotLink, Arccos, Trackman). Approach distances, putting by distance, club-by-club data. |
| V3 - Deep Multi-Season | Multiple seasons of V2-level data plus longitudinal trends. Highest fidelity. |

### Confidence Ranges (Provisional - v1)

| Data Available | Confidence % |
|---------------|-------------|
| Scoring average only, single season | 55-65% |
| Scoring average + tournament results, single season | 60-70% |
| Multi-year scoring + tournament results | 65-75% |
| Golfstat adjusted scoring + splits + multi-year | 72-82% |
| Detailed ball-striking + putting stats (single season) | 75-85% |
| Multi-year detailed stats + Golfstat ranking | 80-88% |
| ShotLink/Trackman-level data (single season) | 82-90% |
| Multi-year ShotLink + complete splits + trend data | 88-95% |

### Confidence Adjusters (apply within the chosen range)
- Sample size: fewer than 8 competitive rounds in current season - use bottom of range
- Recency: last 3 tournaments show clear shift (injury, swing change, form collapse) - downshift 5-10 pts
- Course variety: played only 1-2 course types - downshift 3-5 pts (narrow sample)
- Multi-level data: results across multiple competitive levels - upshift 3-5 pts
- High stability: consistent scoring across 20+ rounds + multiple course types - upshift toward top of range

---

# PLAYER EVALUATION ENGINE - MASTER EXECUTION FLOW

## Master Execution Flow - v1 (LOCKED)

### Purpose
This document defines the complete execution order for producing a golfer's Final KR. It is the single source of truth for what runs, in what order, what each phase consumes, and what each phase produces. Every phase is deterministic.

### Architecture
The pipeline has one block (no system fit layer, because golf has no offensive/defensive systems). The evaluation produces the golfer's Base Truth - who they are as a complete player.

### PIPELINE STEPS

#### Step 1: Coach Context Setup
Must pull from: Coach Context Setup
Coach completes all required fields: Program Name, Governing Body, Division, Major Class (if NCAA D1), Team Philosophy.
System state after completion: Coach Context Locked. No evaluation proceeds until this lock is achieved.
Binds: KLVN level key, KR legend selection.

#### Step 2: Mode Auto-Detect
Must pull from: Player Confidence Gate
Nexus auto-detects evaluation mode based on data availability. No user choice, no asking.
- Stats-only (scoring average + tournament results) - V1 mode
- Detailed stats available (Golfstat + ball-striking/putting splits) - V1+ mode
- ShotLink/Trackman data available - V2 mode
This determines which traits produce scores vs return UNSCORED (null).

#### Step 3: Player Profile Build
Must pull from: Player Profile (Auto-Populated Record)
Nexus builds the factual record: identity, seasons, raw production, awards/honors, source metadata. No traits. No KRs. No archetypes. No evaluation of any kind.

#### Step 4: Phase 3 - Production Anchor
Must pull from: KR Legend at player's level
**This is the most critical step.** Map the golfer's adjusted scoring average relative to par against the level-appropriate legend to establish anchor range (floor and ceiling).

Primary anchor metric: **Adjusted scoring average relative to par.**
- Adjusted = normalized for course difficulty (Golfstat adjustment or course rating/slope normalization)
- If only raw scoring average is available, note the reduced confidence

Secondary anchor inputs (refine within the range):
- Tournament wins and top-finishes at the golfer's level
- Performance against ranked opponents / at high-profile events
- Consistency (standard deviation of scores)
- Competitive record (match play, team events, individual events)

The anchor sets a KR range. The component KR math in Step 5 adjusts within this range +/-10. If the math falls outside, the anchor wins.

**Anchoring rule: Anchor against the production profile numbers, not award labels.** "All-American = 95+" is a label. The adjusted scoring average relative to par is the anchor.

#### Step 5: Trait Scoring + Component KRs
Must pull from: Trait Library (5 clusters, 25 traits)
Must pull from: KLVN (Level Normalization)
Must pull from: OPF (Overall Position Framework)

Score all 25 traits against the active data layer. Only traits defined in the library may exist. If a trait requires data that is missing or UNSCORED in the active layer, trait = UNSCORED (null). Never guessed, never inferred.

KLVN normalization is applied to production inputs to ensure cross-level comparability.

Compute 5 component KRs:
- **BKR (Ball-Striking KR)** - from Ball-Striking cluster traits
- **SKR (Short Game KR)** - from Short Game cluster traits
- **CKR (Course Management KR)** - from Course Management cluster traits
- **MKR (Mental KR)** - from Mental cluster traits
- **AKR (Athletic KR)** - from Athletic cluster traits

UNSCORED traits contribute zero weight. Remaining scored traits renormalize to carry the full weight within their cluster.

Compute Overall Player KR using OPF:
- **College OPF:** BKR 35% / SKR 30% / CKR 15% / MKR 12% / AKR 8%
- **Pro OPF:** BKR 30% / SKR 30% / CKR 18% / MKR 15% / AKR 7%

#### Step 6: Phase 6 - OPF Math Bounded by Phase 3
The OPF-computed Overall KR must fall within the Phase 3 anchor range +/-10.
- If OPF math > anchor ceiling + 10: cap at anchor ceiling + 10
- If OPF math < anchor floor - 10: floor at anchor floor - 10
- If within range: use OPF math as-is

**The legend anchor is truth. The math is confirmation. Not the other way around.**

#### Step 7: Badges
Must pull from: Badge Spec
Evaluate each badge against component KR gates and required trait gates per tier:
- College: Bronze (component KR >= 90, traits >= 90), Silver (>= 94), Gold (>= 97)
- Pro: Bronze (>= 93), Silver (>= 96), Gold (>= 98)

Each required trait must be scored (non-null). If any required trait is UNSCORED, the badge cannot be assigned.

Apply KR lift: Bronze +0.5, Silver +1.0, Gold +1.5. Total badge lift cap: +3.5 KR.
Badges do not change trait scores or archetypes. They certify elite skill expression.

#### Step 8: Overrides
Must pull from: Overrides
Evaluate override triggers against player data. Overrides capture rare golf realities not fully expressed by traits or archetypes.

College: 6 positive overrides, max 1 applies. Ranging from +0.75 to +3.0 KR.
Pro: 4 positive overrides (max 1, each +1.0) + 3 negative overrides (always apply, cannot be overridden).

#### Step 9: Archetype Assignment
Must pull from: Archetype Library (5 archetypes)
Evaluate each archetype against component KR distributions and trait gates. All thresholds are numeric and deterministic.

Archetypes are descriptive labels. They do not change KR, traits, or badges.
Output: Primary archetype, secondary archetype (if qualified), or none.

The 5 archetypes:
1. **Bomber** - power-dominant, length advantage, attack par-5s
2. **Precision Player** - accuracy-first, fairways and greens, controlled game
3. **Short Game Wizard** - elite scrambling, putting, and touch around greens
4. **Complete Player** - balanced excellence across all component KRs
5. **Grinder** - mental toughness dominant, no big numbers, maximizes position

#### Step 10: Finalization
Must pull from: KR Legend (level-appropriate) + Player Confidence Gate

Interpret Final KR against the level-appropriate legend:
"At [Level Environment], this KR = [Legend Tier Label]."

Compute confidence_pct from the Confidence Gate table based on data layer and availability.

Output: Final KR (locked), 5 component KRs (BKR/SKR/CKR/MKR/AKR), archetype(s), legend tier label, Level Tier Map, confidence_pct, full audit trail.

### Determinism Guarantee
Given the same Coach Context, the same player data, and the same data layer, the pipeline produces identical outputs every time. No randomness, no discretion, no learning, no adaptation. Every output is traceable to its inputs.

---

# CONTEXTUAL MODE

## Contextual Mode - Player KR Estimation from Public Metrics - v1 (LOCKED)

### Purpose
Contextual Mode exists to produce an honest KR range for golfers who cannot be evaluated through the full trait pipeline because detailed shot-level data does not exist and scoring average alone cannot produce reliable trait-level scoring.

Contextual Mode answers one question: Given everything publicly observable about this golfer, what KR range is defensible, and what is the confidence boundary around it?

### Authority
Contextual Mode sits outside the Player Evaluation Engine Master Flow. It does not execute Steps 4-10 of the pipeline. It produces estimates of what those outputs would likely be, with explicit confidence and uncertainty disclosure.

When detailed data becomes available, the player enters the full pipeline and Contextual Mode output is superseded entirely.

### Execution

1. **Gather all public data:** Scoring average (raw and adjusted), tournament results, wins, top-finishes, course difficulty of events played, awards, rankings (Golfstat, WAGR, GolfWeek), conference strength, head-to-head results against known-KR players.

2. **Phase 3 Anchor (same as full pipeline):** Map adjusted scoring average against the level legend. This produces the KR range.

3. **Component KR Estimation:** Using whatever splits are available (par-3/4/5 scoring, birdies/bogeys per round, driving stats if available), estimate component KR ranges. Each estimate carries explicit "ESTIMATED" tag and wider uncertainty bands.

4. **Archetype Inference:** Based on available data patterns, suggest likely archetype(s) with "INFERRED" tag. Example: player averages 300+ yards off the tee and has high birdie rate = likely Bomber.

5. **Output:**
   - KR Range (e.g., 84-88) with confidence %
   - Estimated component KR ranges with "ESTIMATED" tags
   - Inferred archetype with "INFERRED" tag
   - "What We Know" list (confirmed data points)
   - "What We Don't Know" list (data gaps that would change the rating)

---

# SUPPRESSION DETECTION

## Suppression Detection Protocol - v1 (LOCKED)

### Purpose
Detect cases where a golfer's scoring average understates their true ability due to external constraints.

### Suppression Triggers (Golf-Specific)

1. **Lineup suppression** - golfer is the 5th or 6th man on a strong team and plays limited tournament schedule, reducing sample size and competitive exposure
2. **Course familiarity suppression** - golfer plays disproportionately on courses that do not suit their game (e.g., bomber on short, tight courses)
3. **Injury suppression** - golfer played through injury that affected swing mechanics or confidence
4. **Equipment transition** - mid-season club change that disrupted timing
5. **Weather suppression** - golfer from warm climate struggles in early-season cold/wind events that disproportionately impact scoring average
6. **Pressure suppression** - strong practice and qualifying rounds but underperformance in counted team rounds (anxiety, role uncertainty)
7. **Development inflection** - golfer's last 5 tournaments significantly better than season average, suggesting breakthrough in progress

### Suppression Evaluation
When a suppression trigger is detected:
1. Identify the suppression factor
2. Estimate the scoring average impact (how many strokes is this costing?)
3. Compute a "suppression-adjusted" scoring estimate
4. Note the adjustment explicitly in the evaluation
5. Widen the KR range to reflect the uncertainty
6. Flag for downstream development engine (what would removing this suppression do?)

### Critical Rule
Suppression adjustment does NOT change the Final KR. It produces a secondary "suppression-adjusted KR estimate" that lives alongside the official KR. The official KR reflects actual performance. The suppression estimate reflects potential.

---

# MULTI-LEVEL PROTOCOL

## Multi-Level Evaluation Protocol - v1 (LOCKED)

### Purpose
When a golfer has competed at multiple levels (e.g., NJCAA then NCAA D1, or junior golf then college), the Multi-Level Protocol governs how cross-level data is synthesized.

### Rules
1. **Current level is primary.** The most recent competitive season at the highest level determines the anchor.
2. **Prior level data informs confidence.** Strong performance at a lower level that translates to current level supports upward confidence adjustment.
3. **KLVN applies per level.** Each season's stats are normalized using the lambda for the level at which they were produced.
4. **Trajectory matters.** Improvement trajectory across levels increases confidence. Decline across levels decreases it.
5. **Never average across levels.** Do not blend a 70.5 scoring average at NJCAA with a 73.2 at NCAA D1. Evaluate each independently, anchor at current level, use prior level as supporting evidence.
