// Auto-generated from intelligence/ directory. Do not edit manually.
// To regenerate: node -e ... (see corpus generation script)

export const SKILL_MD = `---
name: KaNeXT Basketball Intelligence
description: >
  Use this skill for ANY basketball intelligence request including: player evaluation, team evaluation, KR rating, simulation, matchup analysis, scouting, game ops, development planning, transfer portal evaluation, pro projection, draft analysis, legend calibration, roster construction, scholarship/NIL allocation, or any reference to the KaNeXT intelligence system, Nexus, KR, KLVN, archetypes, system fit, or the evaluation pipeline.
---

# NEXUS BASKETBALL INTELLIGENCE SKILL
## v4.0 -- Data Gathering Protocol + Enrichment

### WHAT THIS SKILL DOES
This skill turns Claude into the Nexus Basketball Intelligence System. It governs how Claude evaluates players, teams, simulations, scouting, development, and pro transitions using the KaNeXT Basketball Intelligence framework.

Every output is deterministic: same inputs → same outputs. Claude never invents data, never skips steps, and never modifies upstream truth from downstream engines.

---

## FILE MAP -- Which File For Which Task

| File | Name | Contents | Size | When to Pull |
|------|------|----------|------|-------------|
| 01 | Player Eval -- Process | Coach Context Setup, Player Profile template, Confidence Gate, Master Execution Flow (pipeline steps), Contextual Mode, Suppression Detection, Multi-Level Protocol, Founding Test Cases | ~37K | Every player evaluation |
| 02 | Player Eval -- Reference | UI System Set, Trait Library (54 traits, 7 clusters), Archetype Library (21 archetypes), System Demand Profiles (22 systems), Badges (34), Overrides, System Risks, Impact Modifiers, KLVN, College Player KR Legends (14 levels), Pro Player KR Legend, Position Trait Weighting | ~272K | Lookup during player evaluation -- search for specific sections as needed, do NOT load entire file |
| 03 | Team Intelligence | Team KR Pipeline (math, weights, diagnostics, 13-step execution), OSIE (offensive system inference), DSIE (defensive system inference), Team KR Legends (all levels), Scholarship/NIL Allocation Engine, Roster Decision Intelligence v2 | ~127K | Team evaluation, roster analysis |
| 04 | Simulation Engine | Interaction Library (System×System 120 entries, Offense Archetype×Defense System 210 entries, Defense Archetype×Offense System 252 entries), Simulation Engine (possession resolution, win probability), Physical Mismatch Modifiers | ~211K | Game simulation, matchup analysis |
| 05 | Scouting & Game Ops | Scouting Confidence Gates (pregame + postgame), Game Ops 4-phase flow (Pregame Scout Packet, In-Game Live Ops, Halftime Staff Packet, Postgame Staff Packet) | ~20K | Game preparation, live game support, postgame analysis |
| 06 | Downstream Engines | Development Intelligence Engine, Pro Transition Intelligence Engine, Coaching Impact Modifier v1.0 | ~46K | Player development, transfer portal, pro projection |
| 07 | Pro KR Calibration | 12 NBA players calibrated across 5 tiers. Component KRs, aging curves, system fit insights, 7 key findings. | ~8K | Pro transition anchoring, calibration checks |

---

## DATA GATHERING PROTOCOL

The current season is 2025-26. All evaluations default to 2025-26 unless specified otherwise. When searching the web, use '2025-26' or '2026' in queries.

Before any mode runs, Nexus gathers data. The depth of gathering depends on the query type.

### Trigger
Any query about a specific player or team by name triggers the full gathering sequence.

### Skip (pool only)
Browse/filter queries ("find me guards over 6'4"), stat lookups ("what's Laolu's PPG"), conference/roster browsing ("show me Lincoln's roster", "what teams are in the GAAC"), general basketball knowledge. These use pool tools and corpus only. No web search.

### Sequence

**Step 1 -- Pool Lookup.**
Search the player pool by name. Pull stats, team roster, level, position, height, weight, BPR, clusters. Check if the record has been enriched before (last_enriched timestamp). If enriched within the last 7 days, skip Steps 2-3 and use existing enriched data.

**Step 2 -- Official Web Search.**
Search: "[player name] [school] basketball 2025-26 stats awards"
Collect: awards and All-Conference honors, team record and postseason results, verified height and weight from official roster page, game recaps with notable performances (career highs, milestones, triple-doubles), recruiting status (committed, in portal, unsigned), hometown and high school, academic info if available (GPA, major, eligibility).

**Step 3 -- Social Web Search.**
Search: "[player name] [school] basketball site:x.com OR site:twitter.com"
Collect: coach quotes about the player, recruiting analyst opinions, transfer portal buzz, highlight clips or Hudl links, scouting observations that don't appear on official sites.

**Step 4 -- Respond.**
Use all gathered data to answer the user's question. Format depends on request type: evaluation request runs V1 protocol with gathered data, recruiting inquiry builds a complete player profile, general info summarizes what was found.

**Step 5 -- Enrichment Writeback.**
After responding, flag any corrections or new data discovered for pool update: height/weight corrections, awards, recruiting status, committed school, hometown and high school, social links, notable game performances, scouting notes with source attribution. These get written back to the pool so the next lookup is faster and more complete.

### Enrichment Rules
- Never overwrite pool stats (PPG, RPG, APG, etc) -- those come from the compute engine
- Only enrich metadata fields: verified_height, verified_weight, awards, recruiting_status, committed_to, hometown, high_school, social_links, notes, last_enriched
- If web data contradicts pool data on height/weight, flag it as a correction but do not silently change it -- note the discrepancy in the response ("Pool lists 6'7 but official roster says 6'4")
- Timestamp every enrichment so future lookups know when the data was last verified
- Social intel goes in notes as free text with source attribution
- Enrichment is additive -- never delete existing enriched data, only add or update

---

## MODE ROUTING -- What To Do For Each Request Type

### MODE 1: PLAYER EVALUATION
**Trigger:** "Evaluate [player]", "What's [player]'s KR?", "Rate this player", any request to assess an individual player's basketball identity.

**Files needed:**
- **02** (Reference) -- Look up the KR Legend at the player's level
- **01** (Process) -- Follow the pipeline steps if doing a full trait breakdown

**Steps (THIS ORDER IS MANDATORY):**

1. **Establish context.** Level, school, conference, position, class, height/weight. Use pool data and web search results from the Data Gathering Protocol.

2. **PHASE 3 -- PRODUCTION ANCHOR (this is the primary KR determinant).** Read the KR Legend at the player's level. Map the player's full production profile (PPG, RPG, APG, efficiency, usage, minutes, team role) against the legend tier descriptions. Find the tier whose PRODUCTION DESCRIPTION matches. That tier's KR range IS the anchor. Write it down before doing anything else.

   Example: A player averaging 22/10/4 on .570/.390/.800 as a freshman starter at D1 HM maps to the 95-97 tier based on the production description. The anchor is 95-97.

   **PHASE 3 ANCHORING RULES (apply to ALL evaluations, college and pro):**

   a. **Anchor against PRODUCTION PROFILE NUMBERS, not award labels.** The stats, efficiency, usage, minutes, and team role determine the tier. Awards confirm a tier placement — they do not determine it. A player averaging 15/4/9 is not automatically 95+ because he won national awards. A player averaging 22/10/4 on elite efficiency IS 95+ because the production maps there regardless of awards.

   b. **Awards are confirmation, not input.** All-American, Conference POY, DPOY — these confirm you're in the right tier. They do not push you into a higher tier if the production doesn't support it. A Conference POY who averages 15/4/9 can be a 92, not a 96.

   c. **Pedigree does not inflate current KR.** Five-star recruit, McDonald's All-American, top-3 recruit class — these set ceiling context for development projection (Mode 5/6). They do NOT inflate present-tense college KR. Rate what the player IS, not what he was rated coming out of high school.

   d. **Team success does not inflate individual KR.** A role player on a 35-3 team is still a role player. A star on a .500 team is still a star. Team record provides context (strength of schedule, competition level) but does not override individual production.

   e. **Historical comparisons are irrelevant.** "Best since Zion" or "comparable to Ja Morant's freshman year" — these are narratives, not data. Anchor on THIS player's production against THIS level's legend. Do not anchor on how this player compares to past players.

   f. **Read the numbers first. Check labels second.** When scanning the legend, find the tier where the NUMBERS match. Then read the label to confirm it makes sense. If the numbers say 92-94 but you feel like the player "deserves" 95+ because of awards or narrative, the numbers win.

3. **PHASE 6 -- COMPONENT KRs (this adjusts the anchor, it does not replace it).** Score the four component KRs from the data:
   - OKR (Offensive KR) -- scoring volume, efficiency, shooting, creation, passing
   - DKR (Defensive KR) -- steals, blocks, rebounding, defensive activity, team defense impact
   - TKR (Tools KR) -- height, weight, wingspan, athleticism, motor, endurance
   - IQKR (IQ KR) -- AST/TO, shot selection, role discipline, decision-making, processing under pressure

   Each component is a number on the same 0-100 scale. These tell you WHERE the player is strong and weak. The Phase 6 output tells you the DIRECTION within the anchor range -- whether the player sits at the top, middle, or bottom of their tier.

   DO NOT invent modifier systems, point additions, or arbitrary scoring formulas. Component KRs are estimated from the data using basketball judgment, not made-up math.

   All KR values use one decimal place (e.g. 95.2, not 95). This applies to the final KR and all four component KRs (OKR, DKR, TKR, IQKR). Decimal precision enables meaningful differentiation between players at the same tier.

4. **PHASE 6 ADJUSTS WITHIN PHASE 3 +/- 10.** The final KR must fall within the Phase 3 anchor range expanded by 10 in either direction. If Phase 6 math produces a number more than 10 points below the Phase 3 low, the trait scores are too conservative -- re-examine inferred traits. The component KRs NEVER override the production anchor.

   Example: Phase 3 anchor is 95-97. Phase 6 can push the final KR anywhere from 85 to 100. If Phase 6 produces 84, something is wrong with the trait scoring, not the anchor.

5. **LEVEL TIER MAP (MANDATORY).** Show what the final KR means at every relevant level. This is one of the most valuable outputs for recruiting. Format:
   - At [home level]: [tier label from that level's legend]
   - At [next level up]: [tier label]
   - At [next level up]: [tier label]
   - Continue for all relevant levels

6. **Output format.** Every evaluation MUST include ALL of the following:
   - Player identity (name, school, level, position, class, height/weight, hometown)
   - Season stats with context
   - Phase 3 production anchor with legend tier citation
   - Final KR (single number) with range and confidence %
   - Component KRs: OKR, DKR, TKR, IQKR (each with 1-2 sentence justification)
   - Level Tier Map (mandatory, see above)
   - Key strengths (2-4 observations)
   - Key weaknesses (2-4 observations)
   - Badges if applicable

**PROHIBITED IN COLLEGE EVALUATIONS:**
- NO pro projections, draft stock, NBA comparisons, or lottery language. College KR is present-tense only. Pro projection lives in Mode 6 (Pro Transition) and requires a separate request.
- NO invented modifier systems, arbitrary point additions, or made-up formulas. Use component KRs and basketball judgment.
- NO emojis, checkmarks, or marketing language ("Nexus out", "transformational", "program-changing"). Write like a scout, not a hype man.

**CRITICAL RULE: The legend anchor is truth. The math is confirmation. Not the other way around.**

### MODE 2: TEAM EVALUATION
**Trigger:** "Evaluate [team]", "What's [team]'s Team KR?", "Roster analysis", any request to assess a team's collective basketball identity.

**Files needed:**
- **03** (Team Intelligence) -- Team KR pipeline, OSIE/DSIE, team legends
- Player KR outputs (from Mode 1 evaluations of individual players)

**Steps:**
1. Pull File 03. Follow the 13-step Team KR execution pipeline.
2. Requires individual player System KRs as input (from Mode 1).
3. Run OSIE/DSIE if system identity not established.
4. Compute Team_Off_KR, Team_Def_KR, Team_KR.
5. Run diagnostics: Coverage Map, Missing Demands, Fragility Flags.
6. Interpret against Team KR Legend at appropriate level.

### MODE 3: SIMULATION
**Trigger:** "Simulate [Team A] vs [Team B]", "Who wins?", "Matchup analysis", any head-to-head or possession-level modeling request.

**Files needed:**
- **04** (Simulation Engine) -- Interaction tables + simulation math
- Team KR outputs (from Mode 2) for both teams

**Steps:**
1. Pull File 04.
2. Load System×System interaction for the two teams' offensive/defensive systems.
3. Load Archetype×System interactions for individual matchups.
4. Run possession-level simulation.
5. Output: win probability, key matchup drivers, variance.

### MODE 4: SCOUTING / GAME OPS
**Trigger:** "Scout [opponent]", "Pregame report", "Halftime adjustments", "Postgame analysis", any game-preparation or game-day request.

**Files needed:**
- **05** (Scouting & Game Ops) -- Confidence gates + 4-phase flow
- Player/Team truth outputs from upstream modes

**Steps:**
1. Pull File 05.
2. Determine which phase: Pregame / In-Game / Halftime / Postgame.
3. Follow the MUST OUTPUT requirements for that phase.
4. Reference player and team truth from prior evaluations (do not recompute).

### MODE 5: DEVELOPMENT / PLACEMENT / PORTAL
**Trigger:** "Where should [player] transfer?", "Development plan for [player]", "Portal evaluation", "What's [player] worth at [school]?", any placement, development, or transfer portal request.

**Files needed:**
- **06** (Downstream Engines) -- Development Intelligence Engine
- Player KR outputs (from Mode 1) as input

**Steps:**
1. Pull File 06. Follow Development Intelligence Engine structure.
2. Requires completed player evaluation as input.
3. Output the 6 outputs: Truth Summary, Placement Targeting, Player Value, Gap Analysis, Development Roadmap, Competitive Landscape.

### MODE 6: PRO TRANSITION / DRAFT
**Trigger:** "Should [player] go pro?", "Draft projection", "Pro KR for [player]", any college-to-pro translation request. Also auto-triggers as a snapshot within Mode 1 for draft-eligible players with KR 90+ at D1 HM (or equivalent top-of-level).

**Files needed:**
- **06** (Downstream Engines) -- Pro Transition Intelligence Engine
- **02** (Reference) -- Pro Player KR Legend, Pro position weights, Pro badge gates, Pro system risks/overrides, Pro League Registry, Pro KLVN Lambdas, Pro Salary Framework
- **07** (Pro KR Calibration) -- 12-player calibration reference, aging curves, system fit insights
- Player KR outputs (from Mode 1) as input

**Steps:**
1. Pull File 06. Follow Pro Transition Intelligence Engine structure.
2. Search File 02 for pro-specific reference tables (Pro Player KR Legend, pro badge gates, pro system risks, pro overrides).
3. Take the SAME component KRs from the college eval (OKR, DKR, TKR, IQKR). Apply pro-level adjustments (slight docks for NBA competition increase, slight bumps for traits that translate up). Then reweight through PRO positional OPF weights from File 02.
4. Compute: Entry KR, 3-Year Projection (Scenario A + B), Peak Ceiling, Floor, Median Outcome.
5. Determine the player's projected draft range. Use the draft range to decide which KR to LEAD with in the output (see Draft-Range Output Priority below).
6. Output: All pro KR numbers computed, but presentation order and emphasis shifts by draft range.

**DRAFT-RANGE OUTPUT PRIORITY:**

The PRIMARY KR shown depends on where the player is projected to be drafted. Teams at different draft positions are buying different things.

a. **Top of draft (#1-5) -- Lead with PEAK CEILING.**
Bad teams drafting here are buying the best possible outcome. Entry KR is almost irrelevant -- every rookie struggles. Show: Peak Ceiling KR first, 3-Year Projection second, Ceiling-Floor spread (the bet range), Key Dev Variable. Entry KR shown but de-emphasized.

b. **Mid-lottery (#6-15) -- Lead with 3-YEAR PROJECTION.**
These teams likely have a star and need a complementary piece who develops into a second or third option. Show: 3-Year Projection KR first (Scenario A and B), System Fit with likely drafting teams, Peak second. The 3-year version is the realistic outcome these teams are evaluating.

c. **Late first round (#16-30) -- Lead with MEDIAN OUTCOME.**
Good teams or playoff teams drafting here need contributors. They want the most likely version of the player, not the dream scenario. Show: Median Outcome KR first (midpoint of Scenario A and B at Year 3), Entry KR second (can they contribute now?), System Fit % with specific team, Role projection. Peak shown but de-emphasized.

d. **Second round and undrafted -- Lead with ENTRY KR + ROLE.**
These players need to earn a roster spot. What can they do Day 1? Show: Entry KR, specific role (3-and-D, floor general, rim protector), Best league fit (NBA, G-League, overseas + specific league), Salary range from Pro Salary Framework.

**PRO ANCHORING RULES:**

a. **Draft position CONFIRMS pro tier, it does not determine it.** A #1 pick with DKR 73 does not automatically get a high pro KR just because he goes #1. Draft slot sets salary expectations, not KR.

b. **Entry KR reflects Day 1 reality.** Most rookies, even lottery picks, are rotation players or young starters. Entry KR should be 82-89 for most first-round picks. An entry KR above 90 is extremely rare.

c. **Entry KR does NOT need to correlate with draft order.** A safe late-lottery pick can have a HIGHER entry KR than the #1 overall pick. That's correct -- the #1 pick is drafted for ceiling, not for Day 1 production. The system correctly captures this: same entry, different ceiling = different draft value.

d. **Peak Ceiling is what separates lottery picks from late picks.** Two players with entry KR 85 can be valued completely differently if one has a peak of 94 and the other peaks at 87. The draft pays for the gap between entry and peak.

e. **Age is a trajectory variable, not an entry variable.** An 18-year-old and a 22-year-old with identical stats get the same Entry KR. The 18-year-old gets a higher peak projection because of development runway.

f. **File 06 rules on development:** Max +8 KR per cluster per year. Max +15 over 3 years. Always show both upside and downside scenarios. Projections are directional, not precise.

g. **Salary projection uses cap % from Pro Salary Framework.** NBA salaries shown as % of cap (primary) with dollar amount (secondary). International salaries shown as raw dollars with league context from Pro League Registry.

h. **System fit uses Pro Team Registry.** When projecting to a specific team, reference that team's offensive and defensive system and run the archetype-vs-system interaction from File 04.

### MODE 7: LEGEND CALIBRATION
**Trigger:** "Calibrate the legend", "Test KR labels", "Does [KR] match [player's actual role]?", any request to validate or stress-test the KR legend tier labels.

**Files needed:**
- **02** (Reference) -- Legends section specifically
- Web search for player stats and awards
- Player evaluation outputs for comparison

**Steps:**
1. Search File 02 for the relevant legend (College Player KR Legends or Pro Player KR Legend).
2. Identify the player's actual role from public data (awards, stats, team performance, draft outcome).
3. Estimate KR range using Contextual Mode logic (File 01).
4. Map estimated KR to legend tier label.
5. Check: Does the label accurately describe what this player actually IS?
6. Flag mismatches for legend revision.

---

## GOVERNANCE RULES (Apply to ALL Modes)

1. **Deterministic:** Same inputs → same outputs. No randomness, no editorial override.
2. **Auditable:** Every step logged with inputs, outputs, confidence, and timestamps.
3. **No truth mutation:** Downstream engines NEVER modify upstream outputs (Player KR, Team KR, archetypes, system identity).
4. **Confidence transparency:** Every output includes confidence_pct. The system is transparent about uncertainty.
5. **No data fabrication:** If data is missing, the trait/metric is UNSCORED. The system never guesses.
6. **Legend is display-only:** Legend labels interpret KR values. They do not produce or modify KR values.
7. **KLVN normalization:** All cross-level comparisons use KLVN lambdas. A KR at one level means something specific at every other level.

---

## CROSS-REFERENCE: Key Components and Where They Live

| Component | File | Section to Search For |
|-----------|------|----------------------|
| Coach Context Setup | 01 | "COACH CONTEXT SETUP" |
| Player Profile template | 01 | "PLAYER PROFILE" |
| Master Execution Flow | 01 | "PLAYER EVALUATION ENGINE" |
| Contextual Mode | 01 | "CONTEXTUAL MODE" |
| Suppression Detection | 01 | "Suppression Detection Rules" |
| Multi-Level Protocol | 01 | "Multi-Level Player Protocol" |
| Confidence Gate | 01 | "PLAYER CONFIDENCE GATE" |
| Trait Library | 02 | "TRAIT LIBRARY" or specific cluster name |
| Archetype Library | 02 | "ARCHETYPE LIBRARY" |
| System Demand Profiles | 02 | "SYSTEM DEMAND PROFILES" |
| Badges | 02 | "BADGES" |
| Overrides | 02 | "OVERRIDES" |
| System Risks | 02 | "SYSTEM RISKS" |
| Impact Modifiers | 02 | "IMPACT MODIFIERS" |
| KLVN | 02 | "KLVN" |
| College Player KR Legends | 02 | "COLLEGE PLAYER KR LEGENDS" |
| Pro Player KR Legend | 02 | "PRO PLAYER KR LEGEND" |
| Pro Salary Framework | 02 | "PRO SALARY FRAMEWORK" |
| Pro KLVN Lambdas | 02 | "PRO KLVN LAMBDAS" |
| Pro League Registry | 02 | "PRO LEAGUE REGISTRY" |
| Pro Team Registry NBA | 03 | "PRO TEAM REGISTRY" |
| Pro KR Calibration Reference | 07 | "PRO KR CALIBRATION" |
| Position Trait Weighting (OPF) | 02 | "Position Trait Weighting" |
| Team KR Pipeline | 03 | "Team KR" |
| OSIE | 03 | "Offensive System Inference" |
| DSIE | 03 | "Defensive System Inference" |
| Team KR Legends | 03 | "TEAM KR TIERS" |
| Scholarship/NIL | 03 | "Scholarship" or "NIL" or "PTV" |
| Roster Decision Intelligence | 03 | "Roster Decision" |
| Interaction Library | 04 | "Interaction Library" |
| Simulation Engine | 04 | "Simulation Engine" |
| Physical Mismatch Modifiers | 04 | "Physical Mismatch" |
| Scouting Confidence Gates | 05 | "Scouting Confidence" |
| Game Ops | 05 | "Game Ops" |
| Development Intelligence Engine | 06 | "Development Intelligence" |
| Pro Transition Engine | 06 | "Pro Transition" |
| Coaching Impact Modifier | 06 | "Coaching Impact" |

---

## VERSION HISTORY
- v1.0: Original monolithic skill
- v2.0: Updated for System Risks v3.2, Overrides v3, Pro Transition, Suppression Protocol, Roster Decision v2, Physical Mismatch, CIM v1
- v3.0: Reorganized file structure. Split Player Intelligence megadoc into Process (01) and Reference (02). Separated Team Intelligence (03), Simulation (04), Scouting (05), and Downstream Engines (06) into standalone files. Added Mode 7 (Legend Calibration). Updated all cross-references.
- v4.0: Added Data Gathering Protocol (pool + web + social sequence). Added Enrichment Writeback rules. Rewrote Mode 1 (Player Evaluation) to enforce anchor-first evaluation: Phase 3 legend anchor is the primary KR determinant, Phase 6 trait math adjusts within +/- 10, never overrides. Nexus now gathers data from three sources before any evaluation or player inquiry and writes corrections back to the pool.
- v4.1: Added Phase 3 Anchoring Rules (6 rules) — anchor on production profile numbers, awards are confirmation not input, pedigree/team success/historical comparisons do not inflate KR. Fixed IQKR definition — removed awards/accolades, replaced with processing under pressure. Rewrote Mode 6 (Pro Transition) — auto-triggers for KR 90+ draft-eligible players, component KRs carried from college eval and reweighted through pro OPF, anchored against Pro Player KR Legend. Added 5 Pro Anchoring Rules (draft position confirms but doesn't determine, entry KR is Day 1 reality, trajectory is where ceiling lives, age is trajectory not entry variable, File 06 dev caps enforced).
- v4.2: Added Pro Intelligence Layer v2. Rewrote Mode 6 with Draft-Range Output Priority (#1-5 lead with peak, #6-15 lead with 3-year, #16-30 lead with median, 2nd round lead with entry). Expanded Pro Anchoring Rules from 5 to 8 (entry KR doesn't correlate with draft order, peak ceiling separates lottery from late picks, cap % salary framework, system fit via Pro Team Registry). Added FILE_07 (Pro KR Calibration Reference). Added 6 new pro docs to corpus: Pro KR Legend v2, Pro Salary Framework v2, Pro KLVN Lambdas v2, Pro Team Registry NBA v2, Pro League Registry v2, Pro KR Calibration Reference v1.`;

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

export const LEGEND_NCAA_D1_HM = `# NCAA DIVISION I -- HIGH-MAJOR PLAYER KR LEGEND v4
## λ = 1.000

Interpretation anchor: Power 5 + Big East. Deep rosters, national recruiting, sustained play vs Top-100 opponents. College KR reflects current college role and impact only. No draft language, no pro projection. All ratings assume KLVN normalization.

**98-100 -- National Player of the Year / Transcendent Superstar.**
Program-orbiting force. Elite usage AND elite efficiency simultaneously. Game-plan warps around stopping them and it still doesn't work. Drives wins against other elites. Conference POY lock. National awards finalist or winner. Reserved for generational single-season performers.

**95-97 -- Franchise Anchor / Elite All-American.**
Team's unquestioned alpha or co-alpha. Primary closer. All-American or Conference POY contender. Carries offensive OR defensive load nightly. 30+ MPG on a team that wins 25+ games or earns a top-4 seed. The team's identity is built around this player. Cannot be replaced.

**92-94 -- High-Impact Starter / Core Winner.**
Wins games at the highest level. Can be an offensive alpha whose production drives the team or a two-way anchor whose completeness stabilizes everything. Heavy-minute leader. All-Conference caliber. Trusted in late-game situations. Drives outcomes against elite competition.

**89-91 -- Solid Starter / Top-Five Rotation Lock.**
Firmly positive starter value at HM level. 25+ MPG. Consistent two-way impact. All-Conference honorable mention range. The starters on ranked teams who aren't the stars but who you can't win without. Complementary pieces that make the machine work.

**86-88 -- Trusted Rotation / High-Minute Role Player.**
Winning-role player who thrives in a defined role. 20+ MPG in meaningful games. Value comes from one or more specialties: shooting, rim protection, distribution, perimeter defense, rebounding. Lineups win with them on the floor.

**83-85 -- Reliable Bench / Rotation Contributor.**
True rotation depth on good teams. 15-20 MPG. Consistent energy or specialty. No major drop-off when on the floor. The 6th-7th man on a ranked team.

**80-82 -- Situational Specialist / Depth Piece.**
Matchup- and context-dependent contributor. 10-15 MPG. Role-specific value. The 7th-8th man on a ranked team.

**77-79 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 5-10 MPG sporadically. Not trusted in high-leverage moments.

**74-76 -- Fringe Roster / Non-Rotation.**
On the roster, not in the competitive plan. Garbage-time minutes only.

**71-73 -- Developmental / Project.**
Future-oriented roster slot. Physically or skill-wise incomplete. Not currently viable in HM games.

**68-70 -- Practice Squad / Walk-On.**
Roster filler for structure, not competition. No rotation pathway.

**Below 68 -- Below HM Viability.**
Below HM competitive threshold.
`;

export const LEGEND_NCAA_D1_MM = `# NCAA DIVISION I -- MID-MAJOR PLAYER KR LEGEND v4
## λ = 0.958

Interpretation anchor: AAC, A-10, Mountain West, WCC, MVC. Regional/national recruiting mix. Mostly mid-tier opponents with occasional high-major games. Less depth and athletic redundancy than HM.

**95-100 -- Mid-Major Player of the Year / Transcendent Star.**
Conference-transcendent force. Elite production AND efficiency at mid-major level. All-American candidate. Dominates conference and competes with HM talent. Carries team to NCAA Tournament contention.

**92-94 -- Franchise Anchor / Conference Star.**
Clear number-one option and identity driver. Conference POY contender. First Team All-Conference lock. Team is built around this player. 18+ PPG or equivalent impact.

**89-91 -- High-Impact Starter / Core Winner.**
Primary reason strong mid-major teams win. Heavy minutes leader. All-Conference caliber. Consistent production against conference and non-conference competition.

**86-88 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at mid-major level. 25+ MPG. Consistent two-way impact. Complementary piece on tournament teams.

**83-85 -- Trusted Rotation / High-Minute Role Player.**
Winning-role player. 20+ MPG. Specialist value. Lineups function well with them on the floor.

**80-82 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 15-20 MPG. Energy or specialty contribution.

**77-79 -- Situational Specialist / Depth.**
Context-dependent contributor. 10-15 MPG.

**74-76 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 5-10 MPG.

**71-73 -- Fringe Roster / Non-Rotation.**
On the roster, not in the competitive plan.

**68-70 -- Developmental / Project.**
Future-oriented. Not currently viable in MM games.

**65-67 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway.

**Below 65 -- Below MM Viability.**
Below mid-major competitive threshold.
`;

export const LEGEND_NCAA_D1_LM = `# NCAA DIVISION I -- LOW-MAJOR PLAYER KR LEGEND v4
## λ = 0.917

Interpretation anchor: Big South, Big Sky, Big West, SWAC, MEAC, NEC, Southland, Patriot, etc. Regional/local recruiting. Thin depth with sharp drop-offs after top 6-7. Teams often built around 1-2 primary creators.

**92-100 -- Low-Major Player of the Year / Dominant Star.**
Conference-defining force. Elite production at low-major level. All-Conference lock and conference POY. Drives team to conference championship and NCAA Tournament. Transfer value to mid-major or higher.

**89-91 -- Franchise Anchor / Conference Star.**
Clear number-one option. Conference POY contender. First Team All-Conference. Team identity is built around this player.

**86-88 -- High-Impact Starter / Core Winner.**
Primary reason strong low-major teams win. Heavy minutes leader. All-Conference caliber. Consistent production across full seasons.

**83-85 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at low-major level. 25+ MPG. Consistent two-way contribution. Complementary piece on winning teams.

**80-82 -- Trusted Rotation / High-Minute Role Player.**
Winning-role player. 20+ MPG. Specialist value in a defined role.

**77-79 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 15-20 MPG.

**74-76 -- Situational Specialist / Depth.**
Context-dependent contributor. 10-15 MPG.

**71-73 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 5-10 MPG.

**68-70 -- Fringe Roster / Non-Rotation.**
On the roster, not in the competitive plan.

**65-67 -- Developmental / Project.**
Future-oriented. Not currently viable.

**62-64 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway.

**Below 62 -- Below LM Viability.**
Below low-major competitive threshold.
`;

export const LEGEND_NCAA_D2 = `# NCAA DIVISION II PLAYER KR LEGEND v4
## λ = 0.875

Interpretation anchor: Top D2 programs in CCAA, MIAA, G-MAC, Sunshine State, PSAC, RMAC, PacWest. Regional recruiting with some national reach. Majority D2 competition with occasional D1 crossovers. Depth is solid at top programs but drops faster than D1.

**90-100 -- D2 Player of the Year / Dominant National Star.**
National-level D2 force. Elite production with sustainable efficiency. Carries team to national tournament contention. All-American lock. Transfer value to D1 programs.

**87-89 -- Franchise Anchor / Top D2 All-American.**
Clear number-one option and identity driver. Conference POY contender. First Team All-Conference lock. Team is built around this player.

**84-86 -- High-Impact Starter / Core Winner.**
Primary reason strong D2 teams win. Heavy minutes leader. All-Conference caliber. Consistent production across full seasons.

**81-83 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at D2 level. 25+ MPG. Consistent two-way contribution. Complementary piece on nationally ranked teams.

**78-80 -- Trusted Rotation / High-Minute Role Player.**
Winning-role player. 20+ MPG. Specialist value in a defined role.

**75-77 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 15-20 MPG.

**72-74 -- Situational Specialist / Depth.**
Context-dependent contributor. 10-15 MPG.

**69-71 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 5-10 MPG.

**66-68 -- Fringe Roster / Non-Rotation.**
On the roster, not in the competitive plan.

**63-65 -- Developmental / Project.**
Future-oriented. Not currently viable.

**60-62 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway.

**Below 60 -- Below D2 Viability.**
Below D2 competitive threshold.
`;

export const LEGEND_NCAA_D3 = `# NCAA DIVISION III PLAYER KR LEGEND v4
## λ = 0.667

Interpretation anchor: NESCAC, CNE, MAC Commonwealth, MAC Freedom, ODAC, MIAC, USA South, NAC, etc. No athletic scholarships. Academics-first institutions with strong local/regional recruiting. Emphasis on balance, development, and team execution. Top programs (Endicott, Randolph-Macon, Trine) sustain 8-10 playable pieces; most drop after core contributors.

**86-100 -- D3 Player of the Year / Generational Talent.**
National-level D3 force with elite two-way impact. Dominant production with sustainable efficiency on both ends. Leads nationally in multiple statistical categories. NABC All-American. Carries team to NCAA Tournament deep runs. Transfer value to D1 programs.

**83-85 -- Franchise Anchor / Conference Player of the Year.**
Clear number-one option and identity driver. Defines team success through scoring, defense, or all-around play. Conference POY. First Team All-Conference lock. 20+ PPG or equivalent impact. USBWA Player of the Week caliber. Programs set records around this player.

**78-82 -- High-Impact Starter / All-Conference.**
Primary reason strong D3 teams win. Heavy minutes leader. First or Second Team All-Conference. Consistent production across full seasons. 15+ PPG or double-double caliber. Starter on nationally ranked teams.

**74-77 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at D3 level. 25+ MPG. Consistent two-way contribution. Specialist value (rim protection, rebounding, outlet passing) that anchors a team identity. All-Conference Honorable Mention caliber.

**70-73 -- Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive D3 rosters. Top 6-8 rotation. 18-25 MPG. Clear specialist value.

**67-69 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 12-18 MPG. Energy or specialty contribution.

**63-66 -- Situational Specialist / Depth.**
Context-dependent bench contributor. 8-14 MPG. One skill that earns minutes.

**59-62 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 3-10 MPG. Physical tools or instincts may flash in limited time.

**55-58 -- Fringe Roster / Non-Rotation.**
On the roster, not in the plan.

**51-54 -- Developmental / Project.**
Future-oriented. Raw physical tools with no current competitive viability. Freshman projects with upside.

**47-50 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway at this level.

**Below 47 -- Below D3 Viability.**
Below D3 competitive threshold.
`;

export const LEGEND_NAIA = `# NAIA PLAYER KR LEGEND v4
## λ = 0.810

Interpretation anchor: Cascade, Heart, SSAC, Sun Conference, GPAC, Crossroads, Cal Pac, etc. Scholarship availability with academic-athletic balance. Majority NAIA competition with occasional D2 crossovers. Many players develop with intent to transfer upward. Depth is solid at the top but drops quickly beyond 6-7 contributors.

**86-100 -- NAIA Player of the Year / Elite National Standout.**
National-level NAIA force who overwhelms the ecosystem. Dominant production with sustainable efficiency or transformative defensive impact. Carries team to national tournament contention. All-American lock.

**82-85 -- Franchise Anchor / Top NAIA All-American.**
Clear number-one option and identity driver. Defines team success. Conference POY contender. The player the entire program is built around. 18+ PPG or equivalent impact with elite efficiency.

**78-81 -- High-Impact Starter / Core Winner.**
Primary reason strong NAIA teams win. Heavy minutes leader. All-Conference lock. Game-changer in conference play. Drives conference titles and national runs. Consistent two-way production.

**74-77 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at NAIA level. 25+ MPG. Consistent two-way contribution. All-Conference caliber. Trusted in high-leverage games.

**71-73 -- Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive NAIA rosters. Top 6-8 rotation. 18-25 MPG. Clear specialist value.

**68-70 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 12-18 MPG. Energy or specialty contribution.

**65-67 -- Situational Specialist / Depth.**
Context-dependent bench contributor. 8-12 MPG.

**62-64 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 5-10 MPG.

**59-61 -- Fringe Roster / Non-Rotation.**
On the roster, not in the plan.

**56-58 -- Developmental / Project.**
Future-oriented. Not viable at competitive NAIA level.

**53-55 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway.

**Below 53 -- Below NAIA Viability.**
Below NAIA competitive threshold.
`;

export const LEGEND_NJCAA_D1 = `# NJCAA DIVISION I PLAYER KR LEGEND v4
## λ = 0.833

Interpretation anchor: Top JUCO D1 programs (South Plains, Triton, Dodge City, Eastern Arizona, Indian Hills, Region 5/8 powers). Full scholarship availability. High athleticism and pace. Players often prioritize transfer value to NCAA D1/D2. Elite teams sustain 8-10 playable pieces, others drop sharply after 6-7. Heavy international recruiting at this level.

**86-100 -- NJCAA D1 Player of the Year / Elite National JUCO Star.**
National-level JUCO force who overwhelms the ecosystem. Dominant two-way production or generational specialist skill. Carries team to nationals and title contention. All-American lock. Transfer value to D1 mid-major or higher.

**82-85 -- Franchise Anchor / Top NJCAA D1 Standout.**
Clear number-one option and identity driver. Defines team success. Conference POY contender. All-Region lock. Double-double production or elite specialist impact (rim protection, scoring efficiency) at starter minutes. Transfer value to D1 low-major or D2 franchise role.

**78-81 -- High-Impact Starter / Core Winner.**
Primary reason strong JUCO D1 teams win. Heavy minutes leader. All-Conference caliber. Consistent production across full seasons. D1 transfer experience or equivalent pedigree. Game-changer in conference play.

**74-77 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at JUCO D1 level. 20+ MPG. Consistent two-way contribution or specialist value (shooting, defense, rebounding). Earns starting spot on competitive rosters.

**71-73 -- Trusted Rotation / Big-Minute Contributor.**
Winning-role player on strong JUCO D1 rosters. Top 6-8 rotation. 15-22 MPG. Clear specialist value. Volume scoring with efficiency concerns or defensive role player.

**68-70 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 10-18 MPG. Energy or specialty contribution.

**65-67 -- Situational Specialist / Depth.**
Context-dependent bench contributor. 5-12 MPG. One skill that earns minutes.

**62-64 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 3-8 MPG. Physical tools may exist but production is minimal.

**59-61 -- Fringe Roster / Non-Rotation.**
On the roster, not in the plan. International project or developmental redshirt.

**56-58 -- Developmental / Project.**
Future-oriented. Raw physical tools with no current competitive viability at JUCO D1.

**53-55 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway at this level.

**Below 53 -- Below NJCAA D1 Viability.**
Below JUCO D1 competitive threshold.
`;

export const LEGEND_NJCAA_D2 = `# NJCAA DIVISION II PLAYER KR LEGEND v4
## λ = 0.750

Interpretation anchor: MCCAA, Region 12/15/20 programs. Partial or no athletic scholarships. Regional recruiting focus with some national reach. Player development emphasized for transfer to NCAA D2, NAIA, or selective D1. Competition quality varies significantly by region.

**80-100 -- NJCAA D2 Player of the Year / Elite National Standout.**
National-level JUCO D2 force. Leads the level in major statistical categories. Dominant production with sustainable efficiency. Carries team regardless of supporting cast quality. Transfer value to D2 starter or NAIA franchise role.

**76-79 -- Franchise Anchor / Top NJCAA D2 All-Region.**
Clear number-one option and identity driver. Defines team success. Conference POY contender. All-Region lock. 20+ PPG or equivalent defensive impact at high efficiency. National tournament contributor.

**73-75 -- High-Impact Starter / Core Winner.**
Primary reason strong JUCO D2 teams win. Heavy minutes leader. All-Conference caliber. Consistent production across full seasons. Efficient scorer, elite per-minute producer, or specialist with clear transfer value.

**70-72 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at JUCO D2 level. 20+ MPG. Consistent two-way contribution. Creates or spaces effectively. Earns starting spot on competitive rosters.

**67-69 -- Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive JUCO D2 rosters. Top 6-8 rotation. 13-20 MPG. Clear specialist value.

**64-66 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 10-16 MPG. Role shooter, energy big, or defensive specialist.

**61-63 -- Situational Specialist / Depth.**
Context-dependent bench contributor. 5-12 MPG.

**58-60 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 3-8 MPG.

**55-57 -- Fringe Roster / Non-Rotation.**
On the roster, not in the plan.

**52-54 -- Developmental / Project.**
Future-oriented. Not viable at competitive JUCO D2 level.

**49-51 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway.

**Below 49 -- Below NJCAA D2 Viability.**
Below JUCO D2 competitive threshold.
`;

export const LEGEND_NJCAA_D3 = `# NJCAA DIVISION III PLAYER KR LEGEND v4
## λ = 0.625

Interpretation anchor: No athletic scholarships. Regional recruiting focus. GSAC, Region 19/20/21 programs. Schedules generally weaker than scholarship JUCO levels. Heavy emphasis on development and upward transfer (NJCAA D1/D2, NCAA D3, NAIA). Rosters often thin with sharp drop-offs after 5-6 contributors. Older players and international recruits common.

**83-100 -- NJCAA D3 Player of the Year / Elite National Standout.**
National-level JUCO D3 force. Leads all D3 programs in major statistical categories. Dominant two-way production or transformative defensive impact. All-American caliber. Transfer value to D2 starter or NAIA franchise role.

**80-82 -- Franchise Anchor / Top NJCAA D3 All-Region.**
Clear number-one option and identity driver. Defines team success. Region POY contender. All-Region First Team. 25+ PPG or equivalent impact. Back-to-back awards caliber.

**76-79 -- High-Impact Starter / Core Winner.**
Primary reason strong JUCO D3 teams win. Heavy minutes leader. All-Conference lock. Double-digit scorer with secondary production (rebounding, passing, defense).

**72-75 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at JUCO D3 level. 20+ MPG. Consistent contribution on one or both ends.

**69-71 -- Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive JUCO D3 rosters. Top 6-8 rotation. 13-20 MPG.

**66-68 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 10-15 MPG.

**63-65 -- Situational Specialist / Depth.**
Context-dependent bench contributor. 5-12 MPG.

**60-62 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 3-8 MPG.

**57-59 -- Fringe Roster / Non-Rotation.**
On the roster, not in the plan.

**54-56 -- Developmental / Project.**
Future-oriented. Not viable currently.

**51-53 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway.

**Below 51 -- Below NJCAA D3 Viability.**
Below JUCO D3 competitive threshold.
`;

export const LEGEND_CCCAA = `# CCCAA PLAYER KR LEGEND v4
## λ = 0.765

Interpretation anchor: South Coast, Orange Empire, Western State, PCAC, Coast Conference, etc. No athletic scholarships. Strong local/regional recruiting from California HS talent. Majority CCCAA competition. Primary focus on transfer preparation (NAIA, NCAA D2, selective D1). Top programs (CCSF, Citrus, Fullerton, SD City) sustain 8-10 playable pieces; most drop sharply after 6-7.

**84-100 -- CCCAA Player of the Year / Elite State Standout.**
State-level force who overwhelms the CCCAA ecosystem. Dominant production with sustainable efficiency or transformative defensive impact. Carries team to state tournament contention. Conference and state POY awards. Transfer value to D1 programs.

**80-83 -- Franchise Anchor / Top CCCAA All-State.**
Clear top-two option and identity driver. Defines team success through scoring, defense, or both. Conference POY contender. First Team All-Conference lock. Programs build around this player.

**76-79 -- High-Impact Starter / Core Winner.**
Primary reason strong CCCAA teams win. Heavy minutes leader. First or Second Team All-Conference. Consistent production across full seasons. Starter on state tournament teams.

**72-75 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at CCCAA level. 20+ MPG. Consistent contribution on one or both ends. Honorable Mention All-Conference caliber. Earns starting spot through efficiency, size, or specialist skill.

**69-71 -- Trusted Rotation / Big-Minute Contributor.**
Winning-role player on competitive CCCAA rosters. Top 6-8 rotation. 13-20 MPG. Clear specialist value. Per-minute production is real but opportunities are limited.

**66-68 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 10-15 MPG. Energy or specialty contribution. Doesn't hurt the team when on the floor.

**63-65 -- Situational Specialist / Depth.**
Context-dependent bench contributor. 5-12 MPG. One skill that earns minutes in specific matchups.

**60-62 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 3-8 MPG. Physical tools may exist but production doesn't justify minutes yet.

**57-59 -- Fringe Roster / Non-Rotation.**
On the roster, not in the plan. Practice player who occasionally sees garbage time.

**54-56 -- Developmental / Project.**
Future-oriented. Raw physical tools or international background with no current competitive viability.

**51-53 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway at this level.

**Below 51 -- Below CCCAA Viability.**
Below CCCAA competitive threshold.
`;

export const LEGEND_NCCAA_D1 = `# NCCAA DIVISION I PLAYER KR LEGEND v4
## λ = 0.542

Interpretation anchor: Faith-based institutional focus (character, academics, mission). Scholarship variability. Majority competition vs other NCCAA, small Christian, and independent programs. Occasional NAIA or NCAA crossover games. Heavy emphasis on development, culture, and upward transfer. Depth is limited with most teams operating 6-8 playable pieces and sharp drop-offs.

**74-100 -- NCCAA D1 Player of the Year / Elite National Standout.**
National-level NCCAA force. Dominant production with sustainable efficiency. Carries team to national tournament contention. Transfer value to NAIA or NCAA D2.

**70-73 -- Franchise Anchor / Top NCCAA D1 All-American.**
Clear number-one option and identity driver. Conference POY contender. The player the program is built around.

**66-69 -- High-Impact Starter / Core Winner.**
Primary reason strong NCCAA D1 teams win. Heavy minutes leader. All-Conference lock.

**62-65 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value. 25+ MPG. Consistent two-way contribution.

**59-61 -- Trusted Rotation / Big-Minute Contributor.**
Winning-role player. Top 6-8 rotation. 18-25 MPG.

**56-58 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 12-18 MPG.

**53-55 -- Situational Specialist / Depth.**
Context-dependent bench contributor. 8-12 MPG.

**50-52 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 5-10 MPG.

**47-49 -- Fringe Roster / Non-Rotation.**
On the roster, not in the plan.

**44-46 -- Developmental / Project.**
Future-oriented. Not viable currently.

**41-43 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway.

**Below 41 -- Below NCCAA D1 Viability.**
Below NCCAA D1 competitive threshold.
`;

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

export const LEGEND_USCAA = `# USCAA PLAYER KR LEGEND v4
## λ = 0.583

Interpretation anchor: Small-school and independent program focus. No or very limited athletic scholarships. Majority competition vs USCAA peers with some NAIA/NCAA D3 crossovers. Heavy emphasis on academics, development, and upward transfer. Depth is limited with most teams operating 6-8 playable pieces max and sharp drop-offs.

**76-100 -- USCAA Player of the Year / Elite National Standout.**
National-level USCAA force. Dominant production with sustainable efficiency. Carries team to national tournament contention. All-American lock.

**72-75 -- Franchise Anchor / Top USCAA All-American.**
Clear number-one option and identity driver. Conference POY contender. The player the program is built around.

**68-71 -- High-Impact Starter / Core Winner.**
Primary reason strong USCAA teams win. Heavy minutes leader. All-Conference lock.

**64-67 -- Solid Starter / Top-Five Rotation Lock.**
Reliable starter value at USCAA level. 25+ MPG. Consistent two-way contribution.

**61-63 -- Trusted Rotation / Big-Minute Contributor.**
Winning-role player. Top 6-8 rotation. 18-25 MPG. Clear specialist value.

**58-60 -- Reliable Bench / Rotation Piece.**
Depth that maintains quality. 12-18 MPG.

**55-57 -- Situational Specialist / Depth.**
Context-dependent bench contributor. 8-12 MPG.

**52-54 -- Limited Bench / Emergency Depth.**
Playable only under constraint. 5-10 MPG.

**49-51 -- Fringe Roster / Non-Rotation.**
On the roster, not in the plan.

**46-48 -- Developmental / Project.**
Future-oriented. Not viable currently.

**43-45 -- Practice Squad / Walk-On.**
Roster filler. No competitive pathway.

**Below 43 -- Below USCAA Viability.**
Below USCAA competitive threshold.
`;


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

| # | Player | Pos | Ht | Wt | **KR** | USCAA Label | NAIA Label | D2 Label | D1 LM Label |
|---|---|---|---|---|---|---|---|---|---|
| 11 | Kalejaiye, Laolu | G | 5'10 | 180 | **86** | POY Lock / Elite Standout | Franchise Anchor | Franchise Anchor | High-Impact Starter |
| 1 | Williams, Brandon | G | 6'4 | 180 | **79** | POY Lock / Elite Standout | High-Impact Starter | Solid Starter | Trusted Rotation |
| 3 | McKesey, Claude | G | 5'10 | 185 | **73** | Franchise Anchor | Trusted Rotation | Situational Specialist | Situational Specialist |
| 15 | Chatelain, Nathan | F | 6'7 | 195 | **73** | Franchise Anchor | Trusted Rotation | Situational Specialist | Situational Specialist |
| 10 | Hernandez, Adrian | G | 5'11 | 175 | **66** | Solid Starter | Situational Specialist | Limited Bench | — |
| 2 | Plantey, Chris | G | 5'8 | 165 | **63** | Trusted Rotation | Limited Bench | — | — |
| 6 | Wall, Samuel | G | 6'0 | 190 | **61** | Trusted Rotation | Fringe Roster | — | — |
| 21 | Diomande, Paul-Ismael | F | 6'6 | 210 | **59** | Reliable Bench | Fringe Roster | — | — |

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


export const FILE_02 = `# UI SYSTEM SET

UI SYSTEM SET — v2 (LOCKED)
Purpose
The UI System Set defines the valid offensive and defensive system selections available to
coaches during Coach Context Setup. No evaluation, weighting, or normalization logic lives
here. System trait weighting is governed by the System Fit docs.
Offensive Systems (12)
1. Spread Pick-and-Roll
2. 5-Out Motion
3. Motion / Read & React
4. Pace & Space
5. Dribble Drive
6. Princeton
7. Flex
8. Swing
9. Post-Centric / Inside-Out
10. Moreyball
11. Heliocentric
12. Coach K
Defensive Systems (10)
1. Containment Man
2. Pack Line
3. Pressure Man (Denial)
4. Switch Everything
5. ICE / No-Middle
6. Zone (Structured)
7. Matchup Zone / Hybrid
8. Press / Pressure Defense
9. Junk / Special
10. Coach K
Governance
System names must exactly match across all downstream docs: System Demand Profiles,
System Fit (Offensive + Defensive Trait Weighting), OSIE/DSIE, System × System Interaction,
Archetype × System Interaction. No aliases permitted. Any addition or removal requires
documentation, versioning, and approval.


# TRAIT LIBRARY

Trait Library

KaNeXT Trait Clusters — Canonical 8 (name set)
1. Shooting
(includes spacing/gravity/shot versatility as sub-traits — but cluster name stays
simple)
2. Finishing
(includes rim pressure, contact, foul draw, touch, transition finishing)
3. Playmaking
(includes advantage creation, handle, passing, creation reads)
4. POA Defense
(Point-of-Attack; on-ball, screen nav, containment, ball pressure)
5. Team Defense
(help, rotations, rim protection, communication, scheme execution)
6. Rebounding
(ORB/DRB, box-out, pursuit, contested boards)
7. Tools
(size/length, strength, speed, lateral, vertical, motor/endurance)
8. IQ
(decision quality + processing; avoids “vibes” by being tagged behaviors)

Shooting Cluster — Locked Traits (6)
1) 3PT Spot-Up
Synergy / PlayVision (TRUE)
● Counts: 3PA where dribble_count = 0 AND no movement-action tag (no off-screen,
no DHO chase, no relocation)
● Excludes: anything tagged as Movement; anything with dribble_count ≥ 1
● Inputs: Spot-Up 3P% ; Spot-Up 3PA/G
● Tags (for slicing/evidence): defender distance, contest class, location
(corner/wing/slot), shot clock, catch→release time, balance state
College bands (v0)
● 90: 42%+ & 3.5+
● 80: 38–41% & 2.5–3.4
● 70: 35–37% & 1.8–2.4
● 60: 31–34% & 1.0–1.7
● <60: <31% or low volume
Pro bands (v0)
● 90: 44%+ & 4.0+
● 80: 41–43% & 3.0–3.9
● 70: 38–40% & 2.0–2.9
● 60: 35–37% & 1.0–1.9
● <60: <35% or minimal volume
Box-score mode
● PROXY
● Inputs: overall 3P%, 3PA/G
● Score: round(0.70*Band(3P%) + 0.30*Band(3PA/G))
2) 3PT Movement
Synergy / PlayVision (TRUE)
● Counts: 3PA tagged as movement shot (off-screen / pindown / flare / stagger / DHO
chase / relocation drift-lift-shake) with dribble_count = 0
● Excludes: any self-created dribble shots (Pull-Up) and any no-action stationary C&S
(Spot-Up)

● Inputs: Movement 3P% ; Movement 3PA/G
● Tags: action type, screen type/angle, relocation type, sprint speed into catch, defender
distance, contest class, catch→release, balance state, shot clock
College bands (v0)
● 90: 40%+ & 2.5+
● 80: 37–39% & 1.8–2.4
● 70: 34–36% & 1.2–1.7
● 60: 30–33% & 0.6–1.1
● <60: <30% or minimal volume
Pro bands (v0)
● 90: 42%+ & 3.0+
● 80: 39–41% & 2.2–2.9
● 70: 36–38% & 1.5–2.1
● 60: 33–35% & 0.8–1.4
● <60: <33% or minimal volume
Box-score mode
● UNSCORED (null)
3) 3PT Pull-Up
Synergy / PlayVision (TRUE)
● Counts: 3PA where dribble_count ≥ 1 OR tagged as self-created 3 (iso / PnR BH /
stepback / sidestep / transition pull-up)
● Excludes: movement-tagged no-dribble shots (Movement) and stationary no-dribble
shots (Spot-Up)
● Inputs: Pull-Up 3P% ; Pull-Up 3PA/G
● Tags: dribble count, creation type, separation at release (if available), defender distance,
contest class, stepback/sidestep, shot clock, directionality
College bands (v0)
● 90: 38%+ & 2.0+
● 80: 35–37% & 1.4–1.9
● 70: 32–34% & 0.9–1.3
● 60: 28–31% & 0.4–0.8
● <60: <28% or minimal volume

Pro bands (v0)
● 90: 40%+ & 3.0+
● 80: 37–39% & 2.2–2.9
● 70: 34–36% & 1.6–2.1
● 60: 31–33% & 1.0–1.5
● <60: <31% or minimal volume
Box-score mode
● UNSCORED (null)
4) 3PT Deep Range
Synergy / PlayVision (TRUE)
● Counts: 3PA where shot_distance ≥ deep-range threshold (define once; e.g., NBA
range / “beyond line + X ft”) OR tagged as deep-range
● Allows: any creation type (spot / movement / pull-up) as long as it qualifies by
distance/tag
● Inputs: Deep Range 3P% ; Deep Range 3PA/G
● Tags: exact shot distance, location band, creation type (spot/move/pull), contest class,
shot clock, balance state
College bands (v0)
● 90: 38%+ & 1.5+
● 80: 35–37% & 1.0–1.4
● 70: 32–34% & 0.6–0.9
● 60: 28–31% & 0.3–0.5
● <60: <28% or minimal volume
Pro bands (v0)
● 90: 40%+ & 2.0+
● 80: 37–39% & 1.4–1.9
● 70: 34–36% & 0.9–1.3
● 60: 31–33% & 0.5–0.8
● <60: <31% or minimal volume
Box-score mode
● UNSCORED (null)

5) Midrange Shotmaking
Synergy / PlayVision (TRUE)
● Counts: all 2PT jumpers inside the midrange band (exclude rim attempts + exclude
3PA)
● Includes: pull-ups, turnarounds, post fades, short pull-ups, stepbacks in 2PT range
● Inputs: Midrange FG% ; Midrange FGA/G
● Tags: shot distance band, creation type (pull-up/post/iso/PnR), contest class, balance,
shot clock
College bands (v0)
● 90: 48%+ & 3.0+
● 80: 44–47% & 2.0–2.9
● 70: 40–43% & 1.3–1.9
● 60: 36–39% & 0.7–1.2
● <60: <36% or minimal volume
Pro bands (v0)
● 90: 52%+ & 3.5+
● 80: 47–51% & 2.4–3.4
● 70: 43–46% & 1.6–2.3
● 60: 39–42% & 0.9–1.5
● <60: <39% or minimal volume
Box-score mode
● UNSCORED (null) (unless you have 2PT jump-shot splits; most box feeds don’t)
6) Free Throw
Synergy / PlayVision (TRUE)
● Counts: all FT attempts
● Inputs: FT% ; FTA/G
● Tags: (optional) shooting foul type, end-of-game intentional, technicals (for evidence
only)
College bands (v0)

● 90: 88%+ & 4.0+
● 80: 80–87% & 3.0–3.9
● 70: 73–79% & 2.0–2.9
● 60: 65–72% & 1.0–1.9
● <60: <65% or low volume
Pro bands (v0)
● 90: 90%+ & 5.0+
● 80: 84–89% & 3.8–4.9
● 70: 77–83% & 2.6–3.7
● 60: 70–76% & 1.4–2.5
● <60: <70% or low volume
Box-score mode
● TRUE (not proxy)
● Inputs: FT% (FTM/FTA), FTA/G
● Score: round(0.70*Band(FT%) + 0.30*Band(FTA/G))

Finishing Cluster — Locked Traits (6)
1) Rim Pressure
Synergy / PlayVision (TRUE)
● Counts: possessions where player creates a rim attempt for self (drive to rim, cut to
rim, leakout to rim, post move to rim)
● Inputs: Rim Attempts / G ; Rim Attempts per Touch (or per 100 touches)
● Tags: drive, cut, post, transition; paint touch; rim attempt; help committed; defender at
rim; shot clock
College bands (v0)
● 90: 6.0+ rim att/G AND high rim frequency
● 80: 4.5–5.9
● 70: 3.2–4.4
● 60: 2.0–3.1
● <60: <2.0
Pro bands (v0)
● 90: 8.0+
● 80: 6.0–7.9
● 70: 4.5–5.9
● 60: 3.0–4.4
● <60: <3.0
Box-score mode
● PROXY
● Inputs: FTA/G + 2PA/G (if available) as rim-pressure proxy
● Score: 0.60*Band(FTA/G) + 0.40*Band(2PA/G) (or UNSCORED if 2PA not
available)
2) Contact Finishing
Synergy / PlayVision (TRUE)
● Counts: rim attempts tagged with contact (body contact at gather/release) or contest =
guarded/contested
● Inputs: Contact Rim FG% ; Contact Rim Attempts / G

● Tags: contact flag, contest class, defender at rim, angle, hand (R/L), body control,
balance
College bands (v0)
● 90: 65%+ & 2.0+
● 80: 58–64% & 1.4–1.9
● 70: 52–57% & 0.9–1.3
● 60: 45–51% & 0.4–0.8
● <60: <45% or low volume
Pro bands (v0)
● 90: 70%+ & 2.5+
● 80: 63–69% & 1.8–2.4
● 70: 56–62% & 1.2–1.7
● 60: 48–55% & 0.7–1.1
● <60: <48% or low volume
Box-score mode
● UNSCORED (null)
3) Touch / Craft
Synergy / PlayVision (TRUE)
● Counts: non-dunk finishes requiring touch: floaters/runners, wrong-foot, inside-hand,
reverses, high-glass, extension finishes
● Inputs: Touch FG% (defined shot set) ; Touch Attempts / G
● Tags: floater/runner, reverse, scoop, wrong-foot, inside-hand, angle, defender location,
balance
College bands (v0)
● 90: 55%+ & 1.8+
● 80: 50–54% & 1.2–1.7
● 70: 45–49% & 0.8–1.1
● 60: 40–44% & 0.4–0.7
● <60: <40% or low volume
Pro bands (v0)
● 90: 60%+ & 2.0+

● 80: 54–59% & 1.4–1.9
● 70: 48–53% & 0.9–1.3
● 60: 42–47% & 0.5–0.8
● <60: <42% or low volume
Box-score mode
● UNSCORED (null)
4) Foul Draw
Synergy / PlayVision (TRUE)
● Counts: shooting fouls drawn on drives/post/rim attempts (exclude intentional/tech)
● Inputs: And-1s + Shooting Fouls Drawn / G ; FTA per Rim Attempt
● Tags: foul type, location, defender position, bonus state, shot clock
College bands (v0)
● 90: FTA/RimAtt 0.45+ & high volume
● 80: 0.36–0.44
● 70: 0.28–0.35
● 60: 0.20–0.27
● <60: <0.20
Pro bands (v0)
● 90: 0.50+
● 80: 0.40–0.49
● 70: 0.32–0.39
● 60: 0.24–0.31
● <60: <0.24
Box-score mode
● PROXY
● Inputs: FTA/G + FT rate = FTA/FGA (if FGA available)
● Score: 0.70*Band(FTA/G) + 0.30*Band(FT rate)
5) Vertical Finishing
Synergy / PlayVision (TRUE)

● Counts: dunks + lob finishes + above-rim rim attempts
● Inputs: Dunk/Lob FG% ; Dunk/Lob Attempts / G
● Tags: dunk, lob, alley-oop, putback dunk, defender at rim, contest class
College bands (v0)
● 90: 85%+ & 1.8+
● 80: 78–84% & 1.2–1.7
● 70: 70–77% & 0.8–1.1
● 60: 62–69% & 0.4–0.7
● <60: <62% or low volume
Pro bands (v0)
● 90: 90%+ & 2.2+
● 80: 83–89% & 1.5–2.1
● 70: 75–82% & 1.0–1.4
● 60: 68–74% & 0.5–0.9
● <60: <68% or low volume
Box-score mode
● UNSCORED (null)
6) Transition Finishing
Synergy / PlayVision (TRUE)
● Counts: transition rim attempts (including leakouts, early offense)
● Inputs: Transition Rim FG% ; Transition Rim Attempts / G
● Tags: possession type = transition, advantage state (numbers), defender position,
gather type
College bands (v0)
● 90: 75%+ & 2.0+
● 80: 68–74% & 1.4–1.9
● 70: 60–67% & 0.9–1.3
● 60: 52–59% & 0.4–0.8
● <60: <52% or low volume
Pro bands (v0)
● 90: 80%+ & 2.5+

● 80: 72–79% & 1.8–2.4
● 70: 64–71% & 1.2–1.7
● 60: 56–63% & 0.6–1.1
● <60: <56% or low volume
Box-score mode
● UNSCORED (null)

Playmaking Cluster — Locked Traits (7)
1) Advantage Creation
Synergy / PlayVision (TRUE)
● Counts: on-ball possessions where player bends the defense (blow-by, forces help,
creates rotation) via iso / PnR BH / drive / post-face
● Inputs: Help-Commit Rate (help drawn per drive/touch) ; Advantage Drives / G (or
advantage events / G)
● Tags: drive, blow-by, help source (nail/low-man), two-on-ball, rotation triggered, paint
touch, separation, shot clock
College bands (v0)
● 90: high help rate + 7.0+ advantage events/G
● 80: 5.5–6.9
● 70: 4.0–5.4
● 60: 2.5–3.9
● <60: <2.5
Pro bands (v0)
● 90: high help rate + 10.0+
● 80: 8.0–9.9
● 70: 6.0–7.9
● 60: 4.0–5.9
● <60: <4.0
Box-score mode
● PROXY
● Inputs: FTA/G + AST/G (pressure + creation output)
● Score: 0.60*Band(FTA/G) + 0.40*Band(AST/G)
2) Passing Vision
Synergy / PlayVision (TRUE)
● Counts: attempts of high-value reads (skip, tag-reader, low-man hit, early-window
passes) regardless of completion
● Inputs: Correct-Read Rate ; High-Value Pass Attempts / G

● Tags: read type (skip/corner/roll/pocket/throwback), coverage faced, help source,
window timing (early/late), intended target advantage
College bands (v0)
● 90: elite correct-read + 8.0+ HV attempts/G
● 80: 6.0–7.9
● 70: 4.5–5.9
● 60: 3.0–4.4
● <60: <3.0
Pro bands (v0)
● 90: elite correct-read + 10.0+
● 80: 8.0–9.9
● 70: 6.0–7.9
● 60: 4.0–5.9
● <60: <4.0
Box-score mode
● UNSCORED (null)
3) Passing Execution
Synergy / PlayVision (TRUE)
● Counts: passes that require precision (velocity/location) under pressure; completion
quality matters
● Inputs: On-Target Rate (catchable, in-stride) ; Difficult Pass Volume / G
● Tags: pass difficulty (zip/skip/pocket/one-hand), pressure on passer, receiver advantage
state, catch quality (in-stride/off-line)
College bands (v0)
● 90: elite on-target + 6.0+ difficult/G
● 80: 4.5–5.9
● 70: 3.0–4.4
● 60: 1.8–2.9
● <60: <1.8
Pro bands (v0)
● 90: elite on-target + 7.0+

● 80: 5.5–6.9
● 70: 4.0–5.4
● 60: 2.5–3.9
● <60: <2.5
Box-score mode
● PROXY
● Inputs: AST/TO ratio + AST/G
● Score: 0.60*Band(AST/TO) + 0.40*Band(AST/G)
4) Advantage Passing
Synergy / PlayVision (TRUE)
● Counts: passes made after creating advantage (drive-and-kick, PnR reads,
paint-touch passes) that create shots
● Inputs: Advantage Assist Rate (assists + “created shots” from advantage passes) ;
Advantage Passes / G
● Tags: drive kick, paint touch pass, PnR pocket/skip, short-roll feed, help tag exploited,
corner lift hit
College bands (v0)
● 90: elite creation + 7.0+ advantage passes/G
● 80: 5.5–6.9
● 70: 4.0–5.4
● 60: 2.5–3.9
● <60: <2.5
Pro bands (v0)
● 90: 9.0+
● 80: 7.0–8.9
● 70: 5.0–6.9
● 60: 3.0–4.9
● <60: <3.0
Box-score mode
● PROXY
● Inputs: AST/G + TO/G (inverse)
● Score: 0.70*Band(AST/G) + 0.30*Band(InvTO/G)

5) Transition Playmaking
Synergy / PlayVision (TRUE)
● Counts: transition possessions where player creates advantage as advance passer /
hit-ahead / transition handler
● Inputs: Transition Assists+Creates / G ; Transition Playmaking Rate (per transition
touch)
● Tags: hit-ahead, advance pass, push dribble, early drag screen read, numbers
advantage
College bands (v0)
● 90: 2.5+ transition creates/G
● 80: 1.8–2.4
● 70: 1.2–1.7
● 60: 0.6–1.1
● <60: <0.6
Pro bands (v0)
● 90: 3.0+
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4
● <60: <0.8
Box-score mode
● UNSCORED (null)
6) Ball Security
Synergy / PlayVision (TRUE)
● Counts: possessions with live dribble pressure; focuses on mishandles/strips not bad
reads
● Inputs: Handle TO Rate (mishandle/strip per touch) ; Pressure Touch Volume / G
● Tags: strip, handle lost, dribble off-foot, trapped, pressure level, pickup forced
College bands (v0)

● 90: very low handle-TO rate on high pressure volume
● 80: low
● 70: average
● 60: shaky
● <60: liability
Pro bands (v0)
● same structure, stricter on TO rate
Box-score mode
● PROXY
● Inputs: TO/G + Usage proxy (FGA+FTA+AST)/G if you have it; otherwise TO/G only
● Score: 0.70*Band(InvTO/G) + 0.30*Band(UsageProxy) (or Band(InvTO/G)
alone)
7) Connector Creation
Synergy / PlayVision (TRUE)
● Counts: advantage created without dribbling: screen assists + hockey assists +
extra-pass leading to rotation/shot
● Inputs: Connector Creates / G (screen assists + hockey assists + “advantage passes”)
; Connector Rate (per touch)
● Tags: screen assist, re-screen, dribble-handoff keep, swing-swing, hockey assist,
extra-pass, 0–1 dribble decision, short-roll quick hit
College bands (v0)
● 90: 3.0+ connector creates/G
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4
● <60: <0.8
Pro bands (v0)
● 90: 3.5+
● 80: 2.6–3.4
● 70: 1.8–2.5
● 60: 1.0–1.7
● <60: <1.0

Box-score mode
● UNSCORED (null)
POA Defense Cluster — Locked Traits (7)
1) Containment
Synergy / PlayVision (TRUE)
● Counts: on-ball defensive possessions vs primary handler where defender is the on-ball
assignment
● Inputs: Blow-By Rate (inverse) ; Containment Stops / G (or per 100 on-ball
possessions)
● Tags: on-ball assignment, drive attempt, blow-by, forced pickup, forced retreat, rim line
breach, shot clock, side (L/R)
College bands (v0)
● 90: elite low blow-by on high volume
● 80: strong
● 70: average
● 60: attacked
● <60: liability
Pro bands (v0)
● same structure, stricter blow-by thresholds
Box-score mode
● UNSCORED (null)
2) Screen Navigation
Synergy / PlayVision (TRUE)
● Counts: on-ball possessions where defender must navigate a ball screen (PnR, DHO
chase, off-ball into on-ball)
● Inputs: Screen Win Rate ; Screen Events / G

● Tags: screen type (ball screen/DHO), coverage call, over/under/ice, hit/stuck, recover
time, re-screen, contact level
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: dies on screens
● <60: unplayable vs screening
Pro bands (v0)
● stricter win-rate thresholds
Box-score mode
● UNSCORED (null)
3) Ball Pressure
Synergy / PlayVision (TRUE)
● Counts: on-ball possessions with live dribble where defender applies pressure without
fouling
● Inputs: Forced Pickup Rate ; Pressure Touches / G
● Tags: pressure level, forced pickup, trap, deny dribble, retreat dribble forced, time to
initiate, clock bleed
College bands (v0)
● 90: elite forced pickups/clock burn
● 80: strong
● 70: average
● 60: passive
● <60: no pressure value
Pro bands (v0)
● stricter thresholds
Box-score mode
● UNSCORED (null)

4) Closeout & Recovery
Synergy / PlayVision (TRUE)
● Counts: closeouts to perimeter shooters where defender must recover to contest (from
stunt/help or rotation)
● Inputs: Closeout Win Rate ; Closeout Events / G
● Tags: closeout type (short/chop/run), contest class, fly-by, blow-by allowed, recovery
time, shooter type (C&S vs attack)
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: constant fly-bys
● <60: target
Pro bands (v0)
● stricter thresholds
Box-score mode
● UNSCORED (null)
5) Deflections
Synergy / PlayVision (TRUE)
● Counts: deflections/disruptions that do not necessarily become steals (tips, pokes,
blown-up passes)
● Inputs: Deflections / G ; Deflections per 100 defensive possessions
● Tags: deflection type (pass tip/ball poke), location, pressure context, outcome (reset/late
clock)
College bands (v0)
● 90: 3.0+ per G (high activity)
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4

● <60: <0.8
Pro bands (v0)
● bump volume up slightly (higher possession quality)
● 90: 3.5+ per G, etc.
Box-score mode
● UNSCORED (null)
6) Steal Timing
Synergy / PlayVision (TRUE)
● Counts: steals from strips + passing lane jumps + digs
● Inputs: Steals / G ; Steals per 100 defensive possessions
● Tags: steal type (strip/lane/dig), gamble vs within-scheme, foul on attempt, result
(runout)
College bands (v0)
● 90: 2.0+ STL/G
● 80: 1.5–1.9
● 70: 1.1–1.4
● 60: 0.6–1.0
● <60: <0.6
Pro bands (v0)
● 90: 1.8+ STL/G (rotation tighter, fewer chances)
● 80: 1.3–1.7
● 70: 0.9–1.2
● 60: 0.5–0.8
● <60: <0.5
Box-score mode
● TRUE
● Inputs: STL/G ; STL per 100 (if possessions available; else STL/G only)
7) Foul Discipline

Synergy / PlayVision (TRUE)
● Counts: on-ball / screen-action fouls: reach, hand-check, shooting foul on closeout, trail
foul
● Inputs: Avoidable POA Fouls / G (inverse) ; POA Foul Rate per 100
● Tags: foul type, context (on-ball/screen/closeout), bailout vs necessary, bonus state
College bands (v0)
● 90: very low avoidable fouls on high pressure
● 80: low
● 70: average
● 60: foul-prone
● <60: liability / constant bonus
Pro bands (v0)
● stricter thresholds
Box-score mode
● PROXY
● Inputs: PF/G (inverse) + STL/G (to normalize aggression)
● Score: 0.70*Band(InvPF/G) + 0.30*Band(STL/G)

Team Defense Cluster — Traits (7)
1) Help & Rotation
Synergy / PlayVision (TRUE)
● Counts: off-ball defensive possessions where player is in help position and must rotate
(tag/low-man/help stunt/x-out)
● Inputs: Rotation Win Rate ; Rotation Events / G
● Tags: help role (low-man/nail/tag), rotation type (tag→recover, x-out, stunt→recover),
timing (early/on-time/late), outcome (stop/advantage allowed)
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: late/slow
● <60: breakdown creator
Pro bands (v0)
● stricter timing/win-rate thresholds
Box-score mode
● UNSCORED (null)
2) Rim Protection
Synergy / PlayVision (TRUE)
● Counts: plays where player is the primary rim protector (at rim contest, help contest,
block, altered)
● Inputs: Rim Contest Win Rate ; Rim Contests / G
● Tags: rim contest, verticality, block, altered, opponent FG at rim against, help vs primary,
foul on contest
College bands (v0)
● 90: elite win rate + 5.0+ rim contests/G
● 80: 3.8–4.9
● 70: 2.6–3.7
● 60: 1.5–2.5

● <60: <1.5
Pro bands (v0)
● 90: elite + 6.0+ rim contests/G
● 80: 4.5–5.9
● 70: 3.2–4.4
● 60: 2.0–3.1
● <60: <2.0
Box-score mode
● PROXY
● Inputs: BLK/G + DRB/G
● Score: 0.60*Band(BLK/G) + 0.40*Band(DRB/G)
3) Closeout Execution
Synergy / PlayVision (TRUE)
● Counts: team-rotation closeouts (you’re closing from help, not POA primary)
● Inputs: Closeout Win Rate ; Team Closeout Events / G
● Tags: closeout type, contest class, blow-by allowed, drive-off-closeout, shot allowed,
recovery time
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: fly-by/drive allowed
● <60: hunted in rotations
Pro bands (v0)
● stricter thresholds
Box-score mode
● UNSCORED (null)
4) Off-Ball Positioning (Denial/Tagging)

Synergy / PlayVision (TRUE)
● Counts: off-ball possessions where player must execute positioning rules (deny,
top-lock, tag roller, low-man)
● Inputs: Assignment Win Rate ; Positioning Events / G
● Tags: denial/top-lock, tag roller, low-man, stunt position, spacing responsibility, missed
tag, late peel switch
College bands (v0)
● 90: elite win rate + high events
● 80: strong
● 70: average
● 60: frequent misses
● <60: constant breakdowns
Pro bands (v0)
● stricter
Box-score mode
● UNSCORED (null)
5) Communication & QB
Synergy / PlayVision (TRUE)
● Counts: possessions with called coverages, pre-rotations, and organizer behavior
(directing, early calls)
● Inputs: Call Accuracy Rate ; QB Events / G
● Tags: coverage call, early call vs late, pointing/directing, switch call, scram call, peel call,
miscommunication error
College bands (v0)
● 90: elite call accuracy + high involvement
● 80: strong
● 70: average
● 60: quiet/late
● <60: miscomm errors
Pro bands (v0)

● stricter
Box-score mode
● UNSCORED (null)
6) Versatility (Switch/Guard Up/Down)
Synergy / PlayVision (TRUE)
● Counts: possessions where player defends out of position (switch up/down, guards
multiple types)
● Inputs: Switch Stop Rate ; Switch Possessions / G
● Tags: switch event, matchup type (guard/wing/big), post switched, iso switched, foul on
switch, help needed
College bands (v0)
● 90: elite stop rate on high switch volume
● 80: strong
● 70: average
● 60: targeted on switches
● <60: cannot switch
Pro bands (v0)
● stricter
Box-score mode
● UNSCORED (null)
7) Team Foul Discipline
Synergy / PlayVision (TRUE)
● Counts: help/rotation/rim-protection fouls (late help hacks, verticality fouls, tag fouls,
over-the-back)
● Inputs: Avoidable Team Fouls / G (inverse) ; Team Foul Rate per 100
● Tags: foul type, context (help/rim/tag/rebound), bailout vs necessary, bonus state
College bands (v0)

● 90: very low avoidable fouls on high rotation volume
● 80: low
● 70: average
● 60: foul prone
● <60: constant bonus
Pro bands (v0)
● stricter
Box-score mode
● PROXY
● Inputs: PF/G (inverse) + BLK/G (to normalize rim aggression)
● Score: 0.70*Band(InvPF/G) + 0.30*Band(BLK/G)

Rebounding Cluster — Locked Traits (6)
1) Defensive Rebounding
Synergy / PlayVision (TRUE)
● Counts: defensive rebound opportunities where player is on floor
● Inputs: DRB Win Rate (DRB secured / DRB chances) ; Contested DRB / G
● Tags: rebound chance, contested flag, box-out present, location, high-point win, tip vs
secure
College bands (v0)
● 90: elite win rate + 4.0+ contested DRB/G
● 80: 3.0–3.9
● 70: 2.1–2.9
● 60: 1.2–2.0
● <60: <1.2
Pro bands (v0)
● 90: elite + 5.0+ contested DRB/G
● 80: 3.8–4.9
● 70: 2.6–3.7
● 60: 1.6–2.5
● <60: <1.6
Box-score mode
● PROXY
● Inputs: DRB/G + REB/G
● Score: 0.70*Band(DRB/G) + 0.30*Band(REB/G)
2) Offensive Rebounding
Synergy / PlayVision (TRUE)
● Counts: offensive rebound opportunities where player is on floor
● Inputs: ORB Win Rate (ORB secured / ORB chances) ; Contested ORB / G
● Tags: crash attempt, box-out avoided/won, tip vs secure, putback chance, location
College bands (v0)

● 90: elite win rate + 2.2+ contested ORB/G
● 80: 1.6–2.1
● 70: 1.1–1.5
● 60: 0.6–1.0
● <60: <0.6
Pro bands (v0)
● 90: elite + 2.6+ contested ORB/G
● 80: 1.9–2.5
● 70: 1.3–1.8
● 60: 0.7–1.2
● <60: <0.7
Box-score mode
● PROXY
● Inputs: ORB/G + REB/G
● Score: 0.70*Band(ORB/G) + 0.30*Band(REB/G)
3) Box-Out
Synergy / PlayVision (TRUE)
● Counts: box-out events on shot attempts (defensive + offensive box-outs)
● Inputs: Box-Out Win Rate ; Box-Outs / G
● Tags: box-out initiated, seal held, opponent displaced, team secures rebound, missed
box-out blame
College bands (v0)
● 90: elite win rate + 6.0+ box-outs/G
● 80: 4.8–5.9
● 70: 3.6–4.7
● 60: 2.4–3.5
● <60: <2.4
Pro bands (v0)
● 90: elite + 7.0+ box-outs/G
● 80: 5.5–6.9
● 70: 4.0–5.4
● 60: 2.6–3.9
● <60: <2.6

Box-score mode
● UNSCORED (null)
4) Rebound Range
Synergy / PlayVision (TRUE)
● Counts: rebounds secured outside immediate area (long rebounds, outside paint, to
corners/slots)
● Inputs: Out-of-Area Rebounds / G ; Range Win Rate (won long rebound chances)
● Tags: distance traveled, rebound location, long rebound flag, opponent proximity,
sprint/pursuit
College bands (v0)
● 90: 3.0+ out-of-area/G
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4
● <60: <0.8
Pro bands (v0)
● 90: 3.5+
● 80: 2.6–3.4
● 70: 1.8–2.5
● 60: 1.0–1.7
● <60: <1.0
Box-score mode
● UNSCORED (null)
5) Hands (Secure/High-Point)
Synergy / PlayVision (TRUE)
● Counts: rebound attempts where player gets two hands / secures vs bobbles/tips
● Inputs: Secure Rate (secured / contested chances) ; High-Point Wins / G
● Tags: bobble, tip, two-hand secure, one-hand, high-point, traffic, contact

College bands (v0)
● 90: elite secure + 3.0+ high-point wins/G
● 80: 2.2–2.9
● 70: 1.6–2.1
● 60: 0.9–1.5
● <60: <0.9
Pro bands (v0)
● 90: elite + 3.5+
● 80: 2.6–3.4
● 70: 1.9–2.5
● 60: 1.1–1.8
● <60: <1.1
Box-score mode
● PROXY
● Inputs: REB/G (weak proxy)
● Score: Band(REB/G) (low confidence)
6) Second-Jump / Tip Ability
Synergy / PlayVision (TRUE)
● Counts: second-effort rebound plays (tips to self/teammate, pogo repeats, multiple
jumps)
● Inputs: Tip Creates / G (tips that create possession/shot) ; Second-Effort Win Rate
● Tags: tip-out, tip-to-self, pogo repeat, putback off tip, time between jumps
College bands (v0)
● 90: 1.6+ tip creates/G
● 80: 1.1–1.5
● 70: 0.7–1.0
● 60: 0.3–0.6
● <60: <0.3
Pro bands (v0)
● 90: 1.8+
● 80: 1.3–1.7
● 70: 0.8–1.2

● 60: 0.4–0.7
● <60: <0.4
Box-score mode
● UNSCORED (null)

Tools Cluster — Locked Traits (8)
1) Height
Synergy / PlayVision (TRUE)
● Counts: measured player height (no event filter)
● Inputs: Height (inches) ; — (no volume input needed)
● Tags: verified source tier (official / measured / listed)
College bands (v0) (position-agnostic; later we can make position-aware)
● 90: 6'10"+
● 80: 6'7"–6'9"
● 70: 6'4"–6'6"
● 60: 6'1"–6'3"
● <60: under 6'1"
Pro bands (v0)
● 90: 6'11"+
● 80: 6'8"–6'10"
● 70: 6'5"–6'7"
● 60: 6'2"–6'4"
● <60: under 6'2"
Box-score mode
● TRUE (from roster bio)
2) Length
Synergy / PlayVision (TRUE)
● Counts: wingspan / standing reach proxy
● Inputs: Wingspan (inches) ; —
● Tags: wingspan verified (measured/listed), standing reach if available
College bands (v0)
● 90: 7'2"+ wingspan
● 80: 7'0"–7'1"
● 70: 6'9"–6'11"
● 60: 6'6"–6'8"

● <60: under 6'6"
Pro bands (v0)
● 90: 7'4"+
● 80: 7'1"–7'3"
● 70: 6'10"–7'0"
● 60: 6'7"–6'9"
● <60: under 6'7"
Box-score mode
● TRUE if available, else UNSCORED
3) Strength
Synergy / PlayVision (TRUE)
● Counts: physical holds vs dislodged outcomes in contact events
● Inputs: Strength Win Rate ; Strength Events / G
● Tags: post hold, drive contact, screen setting, screen absorption, box-out hold,
displacement
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: gets dislodged
● <60: physical liability
Pro bands (v0)
● stricter
Box-score mode
● PROXY
● Inputs: weight (if available) + ORB/G + FTA/G (contact proxy)
● Score: 0.40*Band(Weight) + 0.30*Band(ORB/G) + 0.30*Band(FTA/G)
4) Speed

Synergy / PlayVision (TRUE)
● Counts: sprint events (transition offense/defense)
● Inputs: Top Sprint Speed ; Speed Events / G
● Tags: end-to-end sprint, chase-down, rim-run, leakout, recovery sprint
College bands (v0)
● 90: elite top speed on high events
● 80: fast
● 70: average
● 60: slow
● <60: plodding
Pro bands (v0)
● stricter
Box-score mode
● UNSCORED (null)
5) Lateral Quickness
Synergy / PlayVision (TRUE)
● Counts: lateral containment/cutoff events
● Inputs: Lateral Win Rate ; Lateral Events / G
● Tags: slide stay-in-front, cutoff, hip turn recovery, close space, mirror dribble
College bands (v0)
● 90: elite
● 80: strong
● 70: average
● 60: slow feet
● <60: target
Pro bands (v0)
● stricter
Box-score mode
● UNSCORED (null)

6) Vertical Pop
Synergy / PlayVision (TRUE)
● Counts: above-rim plays (dunks, blocks at apex, high-point rebounds)
● Inputs: Above-Rim Wins / G ; Vertical Win Rate
● Tags: dunk, lob finish, block, high-point rebound, contest at apex
College bands (v0)
● 90: elite above-rim wins (2.5+/G)
● 80: 1.8–2.4
● 70: 1.2–1.7
● 60: 0.6–1.1
● <60: <0.6
Pro bands (v0)
● 90: 3.0+/G
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4
● <60: <0.8
Box-score mode
● PROXY
● Inputs: BLK/G + DUNK proxy (if dunk stats available; usually not)
● If no dunk stat: Band(BLK/G) only (low confidence)
7) Motor
Synergy / PlayVision (TRUE)
● Counts: high-activity events independent of minutes
● Inputs: Activity Events / Minute ; Sprint/Re-engage Events / G
● Tags: multiple efforts same possession, crash+recover, screen+rescreen,
closeout+second closeout, chase+recover, loose-ball pursuit
College bands (v0)
● 90: elite activity/min

● 80: high
● 70: average
● 60: low
● <60: poor
Pro bands (v0)
● stricter
Box-score mode
● PROXY
● Inputs: STL/G + ORB/G + BLK/G (stocks/activity proxy)
● Score: 0.40*Band(STL/G) + 0.30*Band(ORB/G) + 0.30*Band(BLK/G)
8) Endurance
Synergy / PlayVision (TRUE)
● Counts: performance drop-off across stints (late-game, 2nd stint, back-to-back high
load)
● Inputs: Late-Stint Dropoff (inverse) ; High-Load Minutes / G
● Tags: pace drop, defensive effort drop, missed rotations late, late closeouts, late fouls,
fatigue indicators
College bands (v0)
● 90: minimal dropoff at 32+ MPG
● 80: minimal at 28–31
● 70: ok at 24–27
● 60: fades at 20–23
● <60: cannot sustain
Pro bands (v0)
● stricter and higher MPG expectations
Box-score mode
● PROXY
● Inputs: MPG (banded) + foul rate late (if not available, MPG only)
● Score: Band(MPG) (low confidence)

IQ Cluster — Locked Traits (6)
1) Decision Speed
Definition: How fast the player makes the correct action after a defined decision trigger.
Counts: All tagged decision triggers where a “correct action” is defined (catch, paint touch, PnR
read, closeout catch, post touch).
Inputs (Primary — locked):
● Median Decision Time (seconds)
● Decision Events / G
Event Tagging Fields:
● trigger_type (catch / paint_touch / PnR_read / closeout_catch / post_touch)
● t0 (trigger timestamp)
● t_action (timestamp of chosen action)
● chosen_action (shoot / drive / pass / hold)
● correct_action (label)
● correctness (0/1)
● pressure_level (none / light / heavy) (for evidence only)
College bands (v0):
● 90: median ≤ 0.60s & 8.0+ events/G
● 80: ≤ 0.80s & 6.0–7.9
● 70: ≤ 1.00s & 4.0–5.9
● 60: ≤ 1.20s & 2.5–3.9
● <60: > 1.20s or low volume
Pro bands (v0):
● 90: ≤ 0.50s & 10.0+
● 80: ≤ 0.70s & 8.0–9.9
● 70: ≤ 0.90s & 6.0–7.9
● 60: ≤ 1.10s & 4.0–5.9
● <60: > 1.10s or low volume
Math:
● speed_band = Band(InvMedianDecisionTime)
● vol_band = Band(DecisionEvents/G)
● Score = round(0.70*speed_band + 0.30*vol_band)

2) Correct Read Rate
Definition: % of defined decision points where the player chooses the correct option.
Counts: All tagged decision points with a defined “correct” read.
Inputs (Primary — locked):
● Correct Read %
● Decision Points / G
Event Tagging Fields:
● decision_point_type (PnR / closeout / paint_touch / post / transition / DHO)
● correct_action label
● chosen_action label
● correctness (0/1)
● window_timing (early/on-time/late) (evidence)
College bands (v0):
● 90: 82%+ & 8.0+ points/G
● 80: 75–81% & 6.0–7.9
● 70: 68–74% & 4.0–5.9
● 60: 60–67% & 2.5–3.9
● <60: < 60% or low volume
Pro bands (v0):
● 90: 85%+ & 10.0+
● 80: 78–84% & 8.0–9.9
● 70: 70–77% & 6.0–7.9
● 60: 62–69% & 4.0–5.9
● <60: < 62% or low volume
Math:
● pct_band = Band(CorrectRead%)
● vol_band = Band(DecisionPoints/G)
● Score = round(0.70*pct_band + 0.30*vol_band)

3) Shot Selection Quality
Definition: Takes good shots, avoids bad shots, relative to context.
Counts: All shot attempts (2PA + 3PA) tagged with shot-quality class.
Inputs (Primary — locked):
● Bad Shot Rate (inverse)
● Bad Shots / G
Event Tagging Fields:
● shot_quality_class (good/ok/bad)
● clock_band (early/mid/late)
● contest_class
● location_band
● creation_type (spot/movement/pull-up/post/PnR)
● advantage_state (yes/no)
College bands (v0): (Bad Shot Rate = bad_shots / total_shots)
● 90: ≤ 8% bad & ≤ 1.0 bad/G
● 80: 9–12% & 1.1–1.6
● 70: 13–16% & 1.7–2.2
● 60: 17–22% & 2.3–3.0
● <60: >22% or >3.0 bad/G
Pro bands (v0):
● 90: ≤ 7% & ≤ 1.0
● 80: 8–11% & 1.1–1.7
● 70: 12–15% & 1.8–2.4
● 60: 16–20% & 2.5–3.2
● <60: >20% or >3.2
Math:
● rate_band = Band(InvBadShotRate)
● vol_band = Band(InvBadShots/G)
● Score = round(0.70*rate_band + 0.30*vol_band)

4) Turnover Decision Quality
Definition: Separates “bad decision” turnovers from forced/execution turnovers.
Counts: All turnovers with cause code.
Inputs (Primary — locked):
● Bad-Decision TO Rate (inverse)
● Bad-Decision TO / G
Event Tagging Fields:
● to_cause (bad_read / forced / mishandle_strip / offensive_foul / travel / out_of_bounds)
● pressure_level
● advantage_state
● decision_point_type (if applicable)
College bands (v0):
● 90: bad-decision TO ≤ 0.25/G and ≤ 20% of TOs
● 80: ≤ 0.45/G and ≤ 30%
● 70: ≤ 0.70/G and ≤ 40%
● 60: ≤ 1.00/G and ≤ 55%
● <60: worse than above
Pro bands (v0):
● 90: ≤ 0.20/G and ≤ 18%
● 80: ≤ 0.40/G and ≤ 28%
● 70: ≤ 0.65/G and ≤ 38%
● 60: ≤ 0.95/G and ≤ 52%
● <60: worse than above
Math:
● rate_band = Band(InvBadDecisionTOShare)
● vol_band = Band(InvBadDecisionTO/G)
● Score = round(0.70*rate_band + 0.30*vol_band)

5) Advantage Conversion
Definition: When advantage is created, how often it converts to a good outcome.
Counts: All tagged advantage events (help committed, rotation triggered, blow-by, paint touch
with collapse).
Inputs (Primary — locked):
● Advantage Conversion %
● Advantage Conversions / G
Event Tagging Fields:
● advantage_event_type
● help_committed (0/1)
● rotation_triggered (0/1)
● outcome_class (good_shot / paint_touch / foul / assist / turnover / reset)
● window_timing (early/on-time/late)
College bands (v0):
● 90: 65%+ conversion & 4.0+ conv/G
● 80: 58–64% & 3.0–3.9
● 70: 50–57% & 2.0–2.9
● 60: 42–49% & 1.2–1.9
● <60: < 42% or low volume
Pro bands (v0):
● 90: 68%+ & 5.0+
● 80: 60–67% & 3.8–4.9
● 70: 52–59% & 2.6–3.7
● 60: 44–51% & 1.6–2.5
● <60: < 44% or low volume
Math:
● pct_band = Band(AdvConv%)
● vol_band = Band(AdvConversions/G)
● Score = round(0.60*pct_band + 0.40*vol_band)

6) Role Discipline
Definition: Stays inside role constraints (shot profile, tempo rules, read rules, no “hijack”
possessions).
Counts: All “role check” events (shot attempts + decision points) evaluated against role ruleset.
Inputs (Primary — locked):
● Role Violation Rate (inverse)
● Role Violations / G
Event Tagging Fields:
● role_ruleset_version (coach-defined)
● violation_type (bad_shot_in_role / missed_read / early_pull / hero_possession /
ignored_spacing_rule / freelanced_action)
● severity (minor/major)
● clock_band
College bands (v0):
● 90: ≤ 0.40 violations/G and ≤ 6% violation rate
● 80: ≤ 0.70/G and ≤ 10%
● 70: ≤ 1.10/G and ≤ 14%
● 60: ≤ 1.70/G and ≤ 20%
● <60: worse than above
Pro bands (v0):
● 90: ≤ 0.35/G and ≤ 5%
● 80: ≤ 0.65/G and ≤ 9%
● 70: ≤ 1.05/G and ≤ 13%
● 60: ≤ 1.60/G and ≤ 18%
● <60: worse than above
Math:
● rate_band = Band(InvViolationRate)
● vol_band = Band(InvViolations/G)
● Score = round(0.70*rate_band + 0.30*vol_band)

7) Processing Under Pressure
Definition: Decision quality specifically when pressured (traps, tight closeouts, crowded paint).
Counts: All decision points tagged with pressure_level ≥ “heavy”.
Inputs (Primary — locked):
● Pressure Correct Read %
● Pressure Decision Points / G
Event Tagging Fields:
● pressure_level (light/heavy)
● pressure_type (trap/closeout/crowd/dig)
● correctness
● time_to_action
● outcome_class (good/bad/reset/turnover)
College bands (v0):
● 90: 78%+ & 4.0+ pressure points/G
● 80: 70–77% & 3.0–3.9
● 70: 62–69% & 2.0–2.9
● 60: 54–61% & 1.2–1.9
● <60: < 54% or low volume
Pro bands (v0):
● 90: 80%+ & 5.0+
● 80: 72–79% & 3.8–4.9
● 70: 64–71% & 2.6–3.7
● 60: 56–63% & 1.6–2.5
● <60: < 56% or low volume
Math:
● pct_band = Band(PressureCorrectRead%)
● vol_band = Band(PressureDecisionPoints/G)
● Score = round(0.70*pct_band + 0.30*vol_band)
Box-score mode: IQ cluster = UNSCORED (null) for all 7 (by design).



# ARCHETYPE LIBRARY

Archetype Library

ARCHETYPE LIBRARY v2 — NUMERIC
GATE RULES (College v1)
Global assignment rules (once)
Use these once at the top.
Primary archetype assignment
● Relevant Skill KR must clear the archetype floor.
● All primary traits must clear their gate.
● If support traits are listed, at least one support trait must clear its gate unless explicitly
stated otherwise.
● Required traits must be scored (non-null) in the active data layer.
Default floor by archetype type
● Engine / creator archetypes: relevant Skill KR ≥ 80
● Shooting / finishing / big-offense role archetypes: relevant Skill KR ≥ 78
● Defensive identity archetypes: relevant Skill KR ≥ 80
● Developmental Prospect: no strict Skill KR floor; this is the exception archetype
Secondary archetype assignment
● Same logic, but you may relax the relevant Skill KR floor by −5 if you want secondary
labels.
Non-Box-Score rule
● If an archetype depends on traits that are UNSCORED in box-score, it can only be
assigned in a non-box-score layer.
A) Engines + Connectors
1) Pick-and-Roll Operator
● Relevant Skill KR: Playmaking KR ≥ 80
● Primary traits:
○ Advantage Creation ≥ 80

○ Passing Vision ≥ 78
○ Passing Execution ≥ 78
● Support traits:
○ Ball Security ≥ 72
○ Decision Speed ≥ 70
● Non-box-score note: stronger with tagged reads, but box-score can still proxy parts of it.
2) Primary Ball-Handler (Offense-First)
● Relevant Skill KR: Playmaking KR ≥ 82
● Primary traits:
○ Advantage Creation ≥ 82
○ Ball Security ≥ 75
○ Passing Execution ≥ 75
● Support traits:
○ Passing Vision ≥ 72
○ 3PT Pull-Up ≥ 70 or Rim Pressure ≥ 72
● This is your high-usage engine label.
3) Secondary Creator Wing
● Relevant Skill KR: Playmaking KR ≥ 78
● Primary traits:
○ Advantage Creation ≥ 78
○ 3PT Pull-Up ≥ 72
● Support traits:
○ Rim Pressure ≥ 72
○ Passing Execution ≥ 70
4) Connector Guard / Wing
● Relevant Skill KR: Playmaking KR ≥ 76
● Primary traits:
○ Connector Creation ≥ 80
○ Passing Execution ≥ 75
● Support traits:
○ Decision Speed ≥ 75
○ Ball Security ≥ 72
○ Role Discipline ≥ 72
● This matches your “decision-speed connectors” language in Read & React.
5) DHO / Handoff Hub
● Relevant Skill KR: Playmaking KR ≥ 76

● Primary traits:
○ Passing Execution ≥ 75
○ Connector Creation ≥ 75
● Support traits:
○ Screen Navigation / screening-adjacent tagged input if you track it, otherwise
○ Decision Speed ≥ 72
○ Touch / Craft ≥ 70
● Non-box-score dependent if you want true handoff tagging.
6) Point Forward
● Relevant Skill KR: Playmaking KR ≥ 78
● Primary traits:
○ Advantage Creation ≥ 75
○ Passing Vision ≥ 75
○ Passing Execution ≥ 75
● Tools gate:
○ Height ≥ wing/forward band (use your roster field)
● Support traits:
○ Ball Security ≥ 70
7) Situational Ball-Handler (Bench Guard)
● Relevant Skill KR: Playmaking KR ≥ 72
● Primary traits:
○ Passing Execution ≥ 72
○ Ball Security ≥ 70
● Support traits:
○ Advantage Creation ≥ 68
○ Decision Speed ≥ 68
● Explicitly below “full engine” thresholds by design.
B) Shooting Archetypes
8) Off-Ball Shooter (Movement)
● Relevant Skill KR: Shooting KR ≥ 78
● Primary traits:
○ 3PT Movement ≥ 80
● Support traits:
○ 3PT Spot-Up ≥ 72
○ Endurance ≥ 70

● Non-box-score dependent if Movement is not scored in box-score. 3PT Movement is a
locked shooting trait.
9) Spot-Up Specialist
● Relevant Skill KR: Shooting KR ≥ 76
● Primary traits:
○ 3PT Spot-Up ≥ 80
● Support traits:
○ Free Throw ≥ 70
○ Role Discipline ≥ 68
● 3PT Spot-Up is a locked trait with box-score proxy support.
10) Situational Shooter (Specialist)
● Relevant Skill KR: Shooting KR ≥ 74
● Primary traits:
○ 3PT Spot-Up ≥ 84 or 3PT Movement ≥ 82
● Support traits:
○ Advantage Creation ≤ 65 (optional negative identity gate if you want this to stay
narrow)
● This is the narrow-role sniper label.
C) Rim Pressure / Finishing Roles
11) Slasher / Rim Pressure Wing
● Relevant Skill KR: Finishing KR ≥ 78
● Primary traits:
○ Rim Pressure ≥ 80
○ Foul Draw ≥ 75
● Support traits:
○ Contact Finishing ≥ 72
○ Transition Finishing ≥ 70
12) Vertical Spacer (Rim Runner)
● Relevant Skill KR: Finishing KR ≥ 78
● Primary traits:
○ Vertical Finishing ≥ 82
○ Rim Pressure ≥ 75
● Support traits:

○ Transition Finishing ≥ 70
● Tools support:
○ Vertical Pop ≥ 72 if scored
● Non-box-score dependent if Vertical Finishing is not scored in box-score.
D) Big Roles (Spacing / Hub / Scoring)
13) Stretch Big (Pick-and-Pop)
● Relevant Skill KR: Shooting KR ≥ 74
● Primary traits:
○ 3PT Spot-Up ≥ 78
● Support traits:
○ Free Throw ≥ 70
○ Passing Execution ≥ 65
● Tools gate:
○ frontcourt/big height band
● This cleanly maps to the archetype used across multiple systems.
14) Short-Roll Playmaker Big
● Relevant Skill KR: Playmaking KR ≥ 74
● Primary traits:
○ Passing Execution ≥ 78
○ Advantage Passing ≥ 75
● Support traits:
○ Touch / Craft ≥ 72
○ Decision Speed ≥ 70
● Tools gate:
○ big role / frontcourt band
15) Post Hub / Facilitator Big
● Relevant Skill KR: Playmaking KR ≥ 76
● Primary traits:
○ Passing Vision ≥ 78
○ Passing Execution ≥ 78
● Support traits:
○ Touch / Craft ≥ 72
○ Role Discipline ≥ 70
16) Post Scorer (Back-to-Basket)

● Relevant Skill KR: Finishing KR ≥ 78
● Primary traits:
○ Contact Finishing ≥ 80
○ Touch / Craft ≥ 78
● Support traits:
○ Foul Draw ≥ 72
● If you later add dedicated post-play-type tags, this gets even cleaner.
17) Small-Ball Big (Switch 5)
● Relevant Skill KR: Team Defense KR ≥ 78
● Primary traits:
○ Versatility ≥ 80
○ Closeout Execution ≥ 74
● Support traits:
○ Lateral Quickness ≥ 74
○ Rim Protection ≥ 68
● Non-box-score dependent unless your layer scores Versatility.
18) Offensive Big (Defense Liability)
● Relevant Skill KR:
○ Offensive Skill KR (Shooting or Finishing or Playmaking) ≥ 76
● Offensive primary traits: at least one of:
○ 3PT Spot-Up ≥ 75
○ Contact Finishing ≥ 75
○ Passing Execution ≥ 75
● Defensive liability gate: at least one of:
○ Containment ≤ 60
○ Versatility ≤ 60
○ Rim Protection ≤ 60
● This is one of the few archetypes that intentionally uses a negative defensive condition.
E) Defensive Identity Archetypes
19) POA Defender Guard
● Relevant Skill KR: POA Defense KR ≥ 80
● Primary traits:
○ Containment ≥ 80
○ Screen Navigation ≥ 78
○ Ball Pressure ≥ 75

● Support traits:
○ Foul Discipline ≥ 70
20) Switchable Defender Wing
● Relevant Skill KR: Team Defense KR ≥ 80
● Primary traits:
○ Versatility ≥ 80
○ Closeout Execution ≥ 75
● Support traits:
○ Containment ≥ 70
○ Lateral Quickness ≥ 72
● This aligns with your switchability language and Versatility trait.
21) Rim Protector Anchor
● Relevant Skill KR: Team Defense KR ≥ 82
● Primary traits:
○ Rim Protection ≥ 82
○ Help & Rotation ≥ 75
● Support traits:
○ Communication & QB ≥ 70
○ Defensive Rebounding ≥ 72
22) Rebounding / Interior Enforcer
● Relevant Skill KR: Rebounding KR ≥ 80
● Primary traits:
○ Defensive Rebounding ≥ 80
○ Box-Out ≥ 78
● Support traits:
○ Hands ≥ 72
○ Offensive Rebounding ≥ 68
23) Two-Way Wing
● Relevant Skill KR:
○ Shooting KR ≥ 74
○ Team Defense KR ≥ 76
● Primary traits:
○ 3PT Spot-Up ≥ 75
○ Versatility ≥ 75
● Support traits:
○ Closeout Execution ≥ 70

○ Rim Pressure ≥ 68 or Advantage Creation ≥ 68
● This is the broadest real-value wing archetype.
24) 3-and-D Wing
● Relevant Skill KR:
○ Shooting KR ≥ 76
○ Team Defense KR ≥ 76
● Primary traits:
○ 3PT Spot-Up ≥ 80
○ Versatility ≥ 72
● Support traits:
○ Closeout Execution ≥ 70
○ Role Discipline ≥ 70
● This one should be narrower and cleaner than Two-Way Wing.
25) Energy Bench Spark
● Relevant Skill KR: no single strict floor; use mixed identity
● Primary traits:
○ Motor ≥ 80
○ Endurance ≥ 75
● Support traits:
○ Ball Pressure ≥ 70 or Deflections ≥ 70
○ Transition Finishing ≥ 68
● This is intentionally chaos/tempo, not polished star skill.
F) Development
26) Developmental Prospect
● No hard Skill KR floor
● Primary traits:
○ at least two of the following ≥ 75
■ Height / Length / Speed / Lateral Quickness / Vertical Pop
● Production check:
○ at least one major offensive or defensive Skill KR below 72
● This is the “tools flash, inconsistent production” exception label, exactly matching your
definition.

Position Weighting

POINT GUARD (PG) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OKR — OFFENSE KR (100%)
Shooting — 34%
3PT Spot-Up: 8%
3PT Movement: 6%
3PT Pull-Up: 12%
3PT Deep Range: 4%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 22%
Rim Pressure: 6%
Contact Finishing: 4%
Touch / Craft: 4%
Foul Draw: 4%
Vertical Finishing: 1%
Transition Finishing: 3%
Playmaking — 44%
Advantage Creation: 12%
Passing Vision: 7%
Passing Execution: 7%
Advantage Passing: 8%
Transition Playmaking: 4%
Ball Security: 4%
Connector Creation: 2%
DKR — DEFENSE KR (100%)
POA Defense — 60%
Containment: 14%
Screen Navigation: 12%
Ball Pressure: 10%
Closeout & Recovery: 8%
Deflections: 6%

Steal Timing: 6%
Foul Discipline: 4%
Team Defense — 25%
Help & Rotation: 6%
Rim Protection: 2%
Closeout Execution: 4%
Off-Ball Positioning (Denial/Tagging): 5%
Communication & QB: 4%
Versatility (Switch/Guard Up/Down): 2%
Team Foul Discipline: 2%
Rebounding — 15%
Defensive Rebounding: 5%
Offensive Rebounding: 2%
Box-Out: 3%
Rebound Range: 2%
Hands: 2%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 6%
Length: 8%
Strength: 10%
Speed: 18%
Lateral Quickness: 22%
Vertical Pop: 8%
Motor: 18%
Endurance: 10%
IQKR — IQ KR (100%)
Decision Speed: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 15%
Role Discipline: 20%
Processing Under Pressure: 20%

POINT GUARD (PG) — PRO
OPF — Overall Position Framework
Offense (OKR): 58%
Defense (DKR): 28%
Tools (TKR): 5%
IQ (IQKR): 9%
OKR — OFFENSE KR (100%)
Shooting — 36%
3PT Spot-Up: 9%
3PT Movement: 7%
3PT Pull-Up: 12%
3PT Deep Range: 4%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 20%
Rim Pressure: 5%
Contact Finishing: 4%
Touch / Craft: 4%
Foul Draw: 4%
Vertical Finishing: 1%
Transition Finishing: 2%
Playmaking — 44%
Advantage Creation: 12%
Passing Vision: 7%
Passing Execution: 7%
Advantage Passing: 8%
Transition Playmaking: 4%
Ball Security: 4%
Connector Creation: 2%
DKR — DEFENSE KR (100%)
POA Defense — 62%
Containment: 14%
Screen Navigation: 13%
Ball Pressure: 10%
Closeout & Recovery: 9%
Deflections: 6%
Steal Timing: 6%
Foul Discipline: 4%

Team Defense — 23%
Help & Rotation: 5%
Rim Protection: 2%
Closeout Execution: 4%
Off-Ball Positioning (Denial/Tagging): 5%
Communication & QB: 3%
Versatility (Switch/Guard Up/Down): 2%
Team Foul Discipline: 2%
Rebounding — 15%
Defensive Rebounding: 5%
Offensive Rebounding: 2%
Box-Out: 3%
Rebound Range: 2%
Hands: 2%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 4%
Length: 6%
Strength: 8%
Speed: 22%
Lateral Quickness: 24%
Vertical Pop: 8%
Motor: 14%
Endurance: 14%
IQKR — IQ KR (100%)
Decision Speed: 18%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 14%
Role Discipline: 20%
Processing Under Pressure: 20%

SHOOTING GUARD (SG) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OKR — OFFENSE KR (100%)
Shooting — 44%
3PT Spot-Up: 14%
3PT Movement: 10%
3PT Pull-Up: 13%
3PT Deep Range: 4%
Midrange Shotmaking: 2%
Free Throw: 1%
Finishing — 26%
Rim Pressure: 7%
Contact Finishing: 5%
Touch / Craft: 4%
Foul Draw: 6%
Vertical Finishing: 2%
Transition Finishing: 2%
Playmaking — 30%
Advantage Creation: 7%
Passing Vision: 5%
Passing Execution: 5%
Advantage Passing: 6%
Transition Playmaking: 3%
Ball Security: 3%
Connector Creation: 1%
DKR — DEFENSE KR (100%)
POA Defense — 55%
Containment: 12%
Screen Navigation: 11%
Ball Pressure: 8%
Closeout & Recovery: 7%
Deflections: 6%
Steal Timing: 7%
Foul Discipline: 4%

Team Defense — 25%
Help & Rotation: 6%
Rim Protection: 2%
Closeout Execution: 4%
Off-Ball Positioning (Denial/Tagging): 5%
Communication & QB: 4%
Versatility (Switch/Guard Up/Down): 2%
Team Foul Discipline: 2%
Rebounding — 20%
Defensive Rebounding: 7%
Offensive Rebounding: 3%
Box-Out: 4%
Rebound Range: 2%
Hands: 3%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 8%
Length: 10%
Strength: 10%
Speed: 16%
Lateral Quickness: 18%
Vertical Pop: 10%
Motor: 18%
Endurance: 10%
IQKR — IQ KR (100%)
Decision Speed: 15%
Correct Read Rate: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 10%
Role Discipline: 15%
Processing Under Pressure: 15%

SHOOTING GUARD (SG) — PRO
OPF — Overall Position Framework
Offense (OKR): 60%
Defense (DKR): 28%
Tools (TKR): 6%
IQ (IQKR): 6%
OKR — OFFENSE KR (100%)
Shooting — 46%
3PT Spot-Up: 15%
3PT Movement: 11%
3PT Pull-Up: 13%
3PT Deep Range: 4%
Midrange Shotmaking: 2%
Free Throw: 1%
Finishing — 24%
Rim Pressure: 6%
Contact Finishing: 5%
Touch / Craft: 4%
Foul Draw: 5%
Vertical Finishing: 2%
Transition Finishing: 2%
Playmaking — 30%
Advantage Creation: 7%
Passing Vision: 5%
Passing Execution: 5%
Advantage Passing: 6%
Transition Playmaking: 3%
Ball Security: 3%
Connector Creation: 1%
DKR — DEFENSE KR (100%)
POA Defense — 58%
Containment: 13%
Screen Navigation: 12%
Ball Pressure: 8%
Closeout & Recovery: 8%
Deflections: 6%
Steal Timing: 7%
Foul Discipline: 4%

Team Defense — 24%
Help & Rotation: 5%
Rim Protection: 2%
Closeout Execution: 4%
Off-Ball Positioning (Denial/Tagging): 5%
Communication & QB: 4%
Versatility (Switch/Guard Up/Down): 2%
Team Foul Discipline: 2%
Rebounding — 18%
Defensive Rebounding: 6%
Offensive Rebounding: 3%
Box-Out: 4%
Rebound Range: 1%
Hands: 3%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 5%
Length: 7%
Strength: 8%
Speed: 18%
Lateral Quickness: 20%
Vertical Pop: 10%
Motor: 16%
Endurance: 16%
IQKR — IQ KR (100%)
Decision Speed: 16%
Correct Read Rate: 14%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 10%
Role Discipline: 16%
Processing Under Pressure: 16%

SMALL FORWARD (SF) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OKR — OFFENSE KR (100%)
Shooting — 40%
3PT Spot-Up: 14%
3PT Movement: 10%
3PT Pull-Up: 8%
3PT Deep Range: 3%
Midrange Shotmaking: 3%
Free Throw: 2%
Finishing — 32%
Rim Pressure: 10%
Contact Finishing: 7%
Touch / Craft: 5%
Foul Draw: 6%
Vertical Finishing: 2%
Transition Finishing: 2%
Playmaking — 28%
Advantage Creation: 6%
Passing Vision: 5%
Passing Execution: 5%
Advantage Passing: 5%
Transition Playmaking: 3%
Ball Security: 2%
Connector Creation: 2%
DKR — DEFENSE KR (100%)
POA Defense — 40%
Containment: 8%
Screen Navigation: 7%
Ball Pressure: 5%
Closeout & Recovery: 6%
Deflections: 5%
Steal Timing: 6%
Foul Discipline: 3%

Team Defense — 35%
Help & Rotation: 8%
Rim Protection: 6%
Closeout Execution: 5%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 5%
Versatility (Switch/Guard Up/Down): 4%
Team Foul Discipline: 1%
Rebounding — 25%
Defensive Rebounding: 9%
Offensive Rebounding: 4%
Box-Out: 5%
Rebound Range: 3%
Hands: 3%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 14%
Length: 16%
Strength: 14%
Speed: 10%
Lateral Quickness: 10%
Vertical Pop: 10%
Motor: 16%
Endurance: 10%
IQKR — IQ KR (100%)
Decision Speed: 15%
Correct Read Rate: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 10%
Role Discipline: 15%
Processing Under Pressure: 15%

SMALL FORWARD (SF) — PRO
OPF — Overall Position Framework
Offense (OKR): 54%
Defense (DKR): 32%
Tools (TKR): 7%
IQ (IQKR): 7%
OKR — OFFENSE KR (100%)
Shooting — 42%
3PT Spot-Up: 15%
3PT Movement: 11%
3PT Pull-Up: 9%
3PT Deep Range: 3%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 30%
Rim Pressure: 9%
Contact Finishing: 7%
Touch / Craft: 5%
Foul Draw: 6%
Vertical Finishing: 2%
Transition Finishing: 1%
Playmaking — 28%
Advantage Creation: 6%
Passing Vision: 5%
Passing Execution: 5%
Advantage Passing: 5%
Transition Playmaking: 3%
Ball Security: 2%
Connector Creation: 2%
DKR — DEFENSE KR (100%)
POA Defense — 40%
Containment: 8%
Screen Navigation: 7%
Ball Pressure: 5%
Closeout & Recovery: 6%
Deflections: 5%
Steal Timing: 6%
Foul Discipline: 3%

Team Defense — 36%
Help & Rotation: 8%
Rim Protection: 7%
Closeout Execution: 5%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 5%
Versatility (Switch/Guard Up/Down): 4%
Team Foul Discipline: 1%
Rebounding — 24%
Defensive Rebounding: 8%
Offensive Rebounding: 4%
Box-Out: 5%
Rebound Range: 2%
Hands: 4%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 10%
Length: 12%
Strength: 10%
Speed: 12%
Lateral Quickness: 12%
Vertical Pop: 12%
Motor: 16%
Endurance: 16%
IQKR — IQ KR (100%)
Decision Speed: 16%
Correct Read Rate: 14%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 10%
Role Discipline: 16%
Processing Under Pressure: 16%

POWER FORWARD (PF) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OKR — OFFENSE KR (100%)
Shooting — 26%
3PT Spot-Up: 12%
3PT Movement: 5%
3PT Pull-Up: 3%
3PT Deep Range: 2%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 44%
Rim Pressure: 14%
Contact Finishing: 10%
Touch / Craft: 6%
Foul Draw: 8%
Vertical Finishing: 4%
Transition Finishing: 2%
Playmaking — 30%
Advantage Creation: 5%
Passing Vision: 5%
Passing Execution: 6%
Advantage Passing: 5%
Transition Playmaking: 2%
Ball Security: 2%
Connector Creation: 5%
DKR — DEFENSE KR (100%)
POA Defense — 20%
Containment: 3%
Screen Navigation: 3%
Ball Pressure: 2%
Closeout & Recovery: 4%
Deflections: 3%
Steal Timing: 3%
Foul Discipline: 2%

Team Defense — 45%
Help & Rotation: 10%
Rim Protection: 10%
Closeout Execution: 6%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 6%
Versatility (Switch/Guard Up/Down): 5%
Team Foul Discipline: 2%
Rebounding — 35%
Defensive Rebounding: 14%
Offensive Rebounding: 6%
Box-Out: 7%
Rebound Range: 3%
Hands: 3%
Second-Jump / Tip Ability: 2%
TKR — TOOLS KR (100%)
Height: 20%
Length: 18%
Strength: 18%
Speed: 6%
Lateral Quickness: 6%
Vertical Pop: 10%
Motor: 14%
Endurance: 8%
IQKR — IQ KR (100%)
Decision Speed: 15%
Correct Read Rate: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 10%
Role Discipline: 15%
Processing Under Pressure: 15%

POWER FORWARD (PF) — PRO
OPF — Overall Position Framework
Offense (OKR): 46%
Defense (DKR): 40%
Tools (TKR): 10%
IQ (IQKR): 4%
OKR — OFFENSE KR (100%)
Shooting — 28%
3PT Spot-Up: 13%
3PT Movement: 6%
3PT Pull-Up: 3%
3PT Deep Range: 2%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 42%
Rim Pressure: 13%
Contact Finishing: 10%
Touch / Craft: 6%
Foul Draw: 7%
Vertical Finishing: 4%
Transition Finishing: 2%
Playmaking — 30%
Advantage Creation: 5%
Passing Vision: 5%
Passing Execution: 6%
Advantage Passing: 5%
Transition Playmaking: 2%
Ball Security: 2%
Connector Creation: 5%
DKR — DEFENSE KR (100%)
POA Defense — 18%
Containment: 3%
Screen Navigation: 3%
Ball Pressure: 2%
Closeout & Recovery: 3%
Deflections: 3%
Steal Timing: 2%
Foul Discipline: 2%

Team Defense — 47%
Help & Rotation: 10%
Rim Protection: 11%
Closeout Execution: 6%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 6%
Versatility (Switch/Guard Up/Down): 6%
Team Foul Discipline: 2%
Rebounding — 35%
Defensive Rebounding: 14%
Offensive Rebounding: 6%
Box-Out: 7%
Rebound Range: 3%
Hands: 3%
Second-Jump / Tip Ability: 2%
TKR — TOOLS KR (100%)
Height: 16%
Length: 16%
Strength: 18%
Speed: 6%
Lateral Quickness: 6%
Vertical Pop: 14%
Motor: 12%
Endurance: 12%
IQKR — IQ KR (100%)
Decision Speed: 16%
Correct Read Rate: 14%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 10%
Role Discipline: 16%
Processing Under Pressure: 16%

CENTER (C) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OKR — OFFENSE KR (100%)
Shooting — 14%
3PT Spot-Up: 8%
3PT Movement: 2%
3PT Pull-Up: 0%
3PT Deep Range: 1%
Midrange Shotmaking: 1%
Free Throw: 2%
Finishing — 60%
Rim Pressure: 16%
Contact Finishing: 16%
Touch / Craft: 8%
Foul Draw: 10%
Vertical Finishing: 8%
Transition Finishing: 2%
Playmaking — 26%
Advantage Creation: 3%
Passing Vision: 4%
Passing Execution: 6%
Advantage Passing: 4%
Transition Playmaking: 1%
Ball Security: 2%
Connector Creation: 6%
DKR — DEFENSE KR (100%)
POA Defense — 10%
Containment: 1%
Screen Navigation: 2%
Ball Pressure: 0%
Closeout & Recovery: 3%
Deflections: 2%
Steal Timing: 1%
Foul Discipline: 1%

Team Defense — 55%
Help & Rotation: 12%
Rim Protection: 18%
Closeout Execution: 6%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 6%
Versatility (Switch/Guard Up/Down): 5%
Team Foul Discipline: 2%
Rebounding — 35%
Defensive Rebounding: 16%
Offensive Rebounding: 6%
Box-Out: 6%
Rebound Range: 2%
Hands: 3%
Second-Jump / Tip Ability: 2%
TKR — TOOLS KR (100%)
Height: 26%
Length: 22%
Strength: 20%
Speed: 4%
Lateral Quickness: 4%
Vertical Pop: 10%
Motor: 8%
Endurance: 6%
IQKR — IQ KR (100%)
Decision Speed: 15%
Correct Read Rate: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 10%
Role Discipline: 15%
Processing Under Pressure: 15%

CENTER (C) — PRO
OPF — Overall Position Framework
Offense (OKR): 36%
Defense (DKR): 48%
Tools (TKR): 12%
IQ (IQKR): 4%
OKR — OFFENSE KR (100%)
Shooting — 16%
3PT Spot-Up: 9%
3PT Movement: 2%
3PT Pull-Up: 0%
3PT Deep Range: 2%
Midrange Shotmaking: 1%
Free Throw: 2%
Finishing — 58%
Rim Pressure: 15%
Contact Finishing: 16%
Touch / Craft: 8%
Foul Draw: 10%
Vertical Finishing: 7%
Transition Finishing: 2%
Playmaking — 26%
Advantage Creation: 3%
Passing Vision: 4%
Passing Execution: 6%
Advantage Passing: 4%
Transition Playmaking: 1%
Ball Security: 2%
Connector Creation: 6%
DKR — DEFENSE KR (100%)
POA Defense — 8%
Containment: 1%
Screen Navigation: 2%
Ball Pressure: 0%
Closeout & Recovery: 2%
Deflections: 1%
Steal Timing: 1%
Foul Discipline: 1%

Team Defense — 57%
Help & Rotation: 12%
Rim Protection: 19%
Closeout Execution: 6%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 6%
Versatility (Switch/Guard Up/Down): 6%
Team Foul Discipline: 2%
Rebounding — 35%
Defensive Rebounding: 16%
Offensive Rebounding: 6%
Box-Out: 6%
Rebound Range: 2%
Hands: 3%
Second-Jump / Tip Ability: 2%
TKR — TOOLS KR (100%)
Height: 22%
Length: 20%
Strength: 20%
Speed: 4%
Lateral Quickness: 4%
Vertical Pop: 14%
Motor: 8%
Endurance: 8%
IQKR — IQ KR (100%)
Decision Speed: 16%
Correct Read Rate: 14%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 10%
Role Discipline: 16%
Processing Under Pressure: 16%

System Profiles



# SYSTEM DEMAND PROFILES

OFFENSE — System Demand Profiles (12)
1) Spread Pick-and-Roll
A: Pick-and-Roll Operator; Vertical Spacer (Rim Runner); Spot-Up Specialist (2+)
B: Stretch Big (Pick-and-Pop); Connector Guard / Wing; 3-and-D Wing
C: Secondary Creator Wing; Short-Roll Playmaker Big
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no real PnR engine + no roll/pop gravity = empty possessions and
late-clock pull-ups.
2) 5-Out Motion
A: Connector Guard / Wing; Off-Ball Shooter (Movement); Slasher / Rim Pressure Wing; Stretch
Big (Pick-and-Pop) OR Small-Ball Big (Switch 5)
B: Spot-Up Specialist; Two-Way Wing
C: Secondary Creator Wing; DHO / Handoff Hub
Ideal Impact Modifiers: Force Multiplier; Secondary Engine
Critical-missing risk: no connector + no movement gravity = “passing to nowhere,” no
advantage chain.
3) Read & React
A: Connector Guard / Wing; Off-Ball Shooter (Movement); DHO / Handoff Hub; Slasher / Rim
Pressure Wing
B: Secondary Creator Wing; Two-Way Wing; Short-Roll Playmaker Big
C: Spot-Up Specialist; Stretch Big (Pick-and-Pop)
Ideal Impact Modifiers: Force Multiplier; Secondary Engine
Critical-missing risk: no decision-speed connectors = turnovers + stalled flow.
4) Pace & Space
A: Primary Ball-Handler (Offense-First) OR Pick-and-Roll Operator; Vertical Spacer (Rim
Runner); Spot-Up Specialist (2+)
B: Slasher / Rim Pressure Wing; 3-and-D Wing; Connector Guard / Wing
C: Stretch Big (Pick-and-Pop); Secondary Creator Wing
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no rim pressure (slasher or rim runner) = “air spacing” with no paint
collapse.

5) Dribble Drive
A: Primary Ball-Handler (Offense-First); Slasher / Rim Pressure Wing (2); Spot-Up Specialist
(2+)
B: Secondary Creator Wing; Vertical Spacer (Rim Runner); Connector Guard / Wing
C: Stretch Big (Pick-and-Pop)
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no true slasher pressure + weak spacing = drive lanes die, turnovers
spike.
6) Princeton
A: Post Hub / Facilitator Big OR Point Forward; Connector Guard / Wing; Off-Ball Shooter
(Movement)
B: Slasher / Rim Pressure Wing; Two-Way Wing
C: Spot-Up Specialist; Secondary Creator Wing
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (Post Hub)
Critical-missing risk: no hub passer = perimeter reversals with no trigger.
7) Flex
A: Post Hub / Facilitator Big OR Post Scorer (Back-to-Basket); Spot-Up Specialist (2);
Connector Guard / Wing
B: Off-Ball Shooter (Movement); Slasher / Rim Pressure Wing
C: Secondary Creator Wing; Stretch Big (Pick-and-Pop)
Ideal Impact Modifiers: Specialist Anchor (Post Hub/Scorer); Force Multiplier
Critical-missing risk: no post threat/hub = flex actions don’t force help; you get contested
jumpers.
8) Swing
A: Connector Guard / Wing; Spot-Up Specialist (2+); Secondary Creator Wing
B: Two-Way Wing; Stretch Big (Pick-and-Pop)
C: Slasher / Rim Pressure Wing; DHO / Handoff Hub
Ideal Impact Modifiers: Force Multiplier; Secondary Engine
Critical-missing risk: no secondary creator = ball reversals forever, can’t break set defense.
9) Inside-Out
A: Post Scorer (Back-to-Basket) OR Post Hub / Facilitator Big; Spot-Up Specialist (2+); 3-and-D
Wing

B: Slasher / Rim Pressure Wing; Rebounding / Interior Enforcer
C: Secondary Creator Wing; Stretch Big (Pick-and-Pop)
Ideal Impact Modifiers: Specialist Anchor (post); Force Multiplier
Critical-missing risk: no shooting around post = doubles win; post touches become turnovers.
10) Moreyball
A: Pick-and-Roll Operator; Vertical Spacer (Rim Runner); Spot-Up Specialist (2+); 3-and-D
Wing
B: Stretch Big (Pick-and-Pop); Slasher / Rim Pressure Wing
C: Secondary Creator Wing
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: can’t generate rim/3 volume (engine + spacing + rim gravity) = math
advantage disappears.
11) Heliocentric
A: Primary Ball-Handler (Offense-First); Spot-Up Specialist (2+); 3-and-D Wing (2)
B: Vertical Spacer (Rim Runner) OR Stretch Big (Pick-and-Pop); Secondary Creator Wing
C: Connector Guard / Wing
Ideal Impact Modifiers: Primary Engine (mandatory); Force Multiplier
Critical-missing risk: no true engine = system cannot exist; no spacers = engine gets
swarmed.
12) Coach K
Identity: Ultra-fast tempo + constant motion/read-react + Moreyball shot diet (rim + 3s,
especially transition + corners) + Spread PnR embedded (multiple handlers/bigs) + selective iso
inside flow (Heat-style), not heliocentric.
A: Off-Ball Shooter (Movement); Spot-Up Specialist (2+); Pick-and-Roll Operator; Slasher / Rim
Pressure Wing; Vertical Spacer (Rim Runner) OR Stretch Big (Pick-and-Pop)
B: Connector Guard / Wing (2+); Secondary Creator Wing; Short-Roll Playmaker Big
C: DHO / Handoff Hub; Point Forward
Ideal Impact Modifiers: Primary Engine OR Secondary Engine (must have one); Force
Multiplier (2+)
Critical-missing risk: if you don’t have (1) real 3-volume gravity and (2) rim pressure, the pace
becomes empty and you just take bad quick shots; if you don’t have (3) at least one real engine
and (4) connectors, the motion turns into turnovers/forced pull-ups.

DEFENSE — System Demand Profiles (10)
1) Containment
A: Rim Protector Anchor; POA Defender Guard; Switchable Defender Wing
B: Two-Way Wing; Rebounding / Interior Enforcer
C: Small-Ball Big (Switch 5)
Ideal Impact Modifiers: Specialist Anchor (rim); Force Multiplier
Critical-missing risk: no backline rim anchor = blow-bys become layup lines.
2) Pack Line
A: Rim Protector Anchor; Rebounding / Interior Enforcer; Two-Way Wing
B: 3-and-D Wing; POA Defender Guard
C: Switchable Defender Wing
Ideal Impact Modifiers: Specialist Anchor (paint+glass); Force Multiplier
Critical-missing risk: if the anchor can’t protect without fouling OR you can’t rebound, the pack
collapses.
3) Pressure Man
A: POA Defender Guard; Switchable Defender Wing; Energy Bench Spark
B: Rim Protector Anchor; Two-Way Wing
C: Small-Ball Big (Switch 5)
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (stopper)
Critical-missing risk: pressure without backline eraser = constant rim concessions.
4) Switch
A: Switchable Defender Wing (2+); Small-Ball Big (Switch 5); POA Defender Guard
B: Two-Way Wing
C: Rim Protector Anchor (optional)
Ideal Impact Modifiers: Force Multiplier
Critical-missing risk: if your 4/5 can’t survive switches, the identity breaks immediately.
5) No-Middle
A: POA Defender Guard; Rim Protector Anchor; Two-Way Wing
B: 3-and-D Wing; Rebounding / Interior Enforcer
C: Switchable Defender Wing

Ideal Impact Modifiers: Specialist Anchor (rim); Force Multiplier
Critical-missing risk: if POA can’t angle/contain or your low man rotations are weak, the
scheme gets split.
6) Zone
A: Rim Protector Anchor; Rebounding / Interior Enforcer; Two-Way Wing
B: 3-and-D Wing; POA Defender Guard (top pressure)
C: Energy Bench Spark
Ideal Impact Modifiers: Specialist Anchor (rim+glass); Force Multiplier
Critical-missing risk: zone without rebounding dominance = you lose by extra possessions.
7) Matchup Zone
A: Switchable Defender Wing; Two-Way Wing; Rim Protector Anchor
B: POA Defender Guard; Energy Bench Spark
C: Small-Ball Big (Switch 5)
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (matchup stopper)
Critical-missing risk: if wings can’t guard in space, it becomes scramble defense.
8) Full-Court Press
A: Energy Bench Spark; POA Defender Guard; Switchable Defender Wing
B: Rim Protector Anchor; Two-Way Wing
C: Rebounding / Interior Enforcer
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (backline)
Critical-missing risk: no rim protection behind press = layup drill.
9) Junk
A: Specialist “stopper” (POA Defender Guard OR Switchable Defender Wing); Rim Protector
Anchor
B: Two-Way Wing; 3-and-D Wing
C: Energy Bench Spark
Ideal Impact Modifiers: Specialist Anchor (stopper); Force Multiplier
Critical-missing risk: no true stopper = junk doesn’t steal possessions.

10) Coach K Defense
Identity: Pressure man/denial base + “no-threes” math (run shooters off the line) + funnel drives
into a real rim protector + charges as a weapon; selective 3/4-court pressure (not constant
full-court); occasional change-up zones (1-3-1 / 2-3) and selective switching as disruption, but
man is the identity.
A: POA Defender Guard (2+); Rim Protector Anchor; Switchable Defender Wing (2+); 3-and-D
Wing (2+)
B: Energy Bench Spark; Rebounding / Interior Enforcer; Two-Way Wing
C: Small-Ball Big (Switch 5); Junk / Special stopper variants (as personnel dictates); Matchup
Zone / Hybrid-capable wing
Ideal Impact Modifiers: Specialist Anchor (rim) or Specialist Anchor (stopper); Force Multiplier
(defense playmaking / disruption)
Critical-missing risk: if you can’t (1) deny/contain at the POA to take away threes and (2)
erase the rim behind it (without foul disaster), the whole math identity fails; if you don’t have (3)
multiple switchable wings, pressure turns into matchup hunting.

Offense

SPREAD PICK-AND-ROLL — NEUTRAL (ALL POSITIONS,
COLLEGE)
SPREAD PICK-AND-ROLL — POINT GUARD (PG)
TOTAL-PLAYER WEIGHTS ONLY (nothing “internal 100%”)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 23.52% TOTAL (56% × 42%)
● 3PT Spot-Up: 3.92% (23.52 × 7/42)
● 3PT Movement: 2.24% (23.52 × 4/42)
● 3PT Pull-Up: 10.08% (23.52 × 18/42)
● 3PT Deep Range: 3.36% (23.52 × 6/42)
● Midrange Shotmaking: 1.68% (23.52 × 3/42)
● Free Throw: 2.24% (23.52 × 4/42)
Finishing: 10.08% TOTAL (56% × 18%)
● Rim Pressure: 3.36% (10.08 × 6/18)
● Contact Finishing: 1.68% (10.08 × 3/18)
● Touch / Craft: 1.12% (10.08 × 2/18)
● Foul Draw: 2.80% (10.08 × 5/18)
● Vertical Finishing: 0.56% (10.08 × 1/18)
● Transition Finishing: 0.56% (10.08 × 1/18)
Playmaking: 22.40% TOTAL (56% × 40%)
● Advantage Creation: 6.72% (22.40 × 12/40)
● Passing Vision: 3.36% (22.40 × 6/40)
● Passing Execution: 3.36% (22.40 × 6/40)
● Advantage Passing: 3.92% (22.40 × 7/40)
● Transition Playmaking: 1.68% (22.40 × 3/40)
● Ball Security: 2.24% (22.40 × 4/40)
● Connector Creation: 1.12% (22.40 × 2/40)

TOOLS (TKR): 10% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.50%
● Motor: 2.00%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.50%
● Advantage Conversion: 1.50%
● Role Discipline: 0.90%
(Other IQ traits unchanged by offense system.)

SPREAD PICK-AND-ROLL — SHOOTING GUARD (SG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 26.68% (58% × 46%)
● 3PT Spot-Up: 8.12% (26.68 × 14/46)
● 3PT Movement: 4.64% (26.68 × 8/46)
● 3PT Pull-Up: 8.12% (26.68 × 14/46)
● 3PT Deep Range: 2.32% (26.68 × 4/46)
● Midrange Shotmaking: 1.74% (26.68 × 3/46)
● Free Throw: 1.74% (26.68 × 3/46)
Finishing: 10.44% (58% × 18%)
● Rim Pressure: 3.48% (10.44 × 6/18)
● Contact Finishing: 2.32% (10.44 × 4/18)
● Touch / Craft: 1.74% (10.44 × 3/18)
● Foul Draw: 2.32% (10.44 × 4/18)
● Vertical Finishing: 0.58% (10.44 × 1/18)
● Transition Finishing: 0.00% (10.44 × 0/18)
Playmaking: 20.88% (58% × 36%)
● Advantage Creation: 4.64% (20.88 × 8/36)
● Passing Vision: 2.90% (20.88 × 5/36)
● Passing Execution: 2.90% (20.88 × 5/36)
● Advantage Passing: 4.06% (20.88 × 7/36)
● Transition Playmaking: 2.32% (20.88 × 4/36)
● Ball Security: 2.90% (20.88 × 5/36)
● Connector Creation: 1.16% (20.88 × 2/36)
TOOLS (TKR): 12% TOTAL
● Speed: 3.50%
● Vertical Pop: 1.25%
● Motor: 2.75%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL

● Correct Read Rate: 1.40%
● Shot Selection Quality: 1.00%
● Advantage Conversion: 1.00%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

SPREAD PICK-and-ROLL — SMALL FORWARD (SF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 22.88% (52% × 44%)
● 3PT Spot-Up: 8.32% (22.88 × 16/44)
● 3PT Movement: 4.68% (22.88 × 9/44)
● 3PT Pull-Up: 5.20% (22.88 × 10/44)
● 3PT Deep Range: 1.56% (22.88 × 3/44)
● Midrange Shotmaking: 1.56% (22.88 × 3/44)
● Free Throw: 1.56% (22.88 × 3/44)
Finishing: 11.44% (52% × 22%)
● Rim Pressure: 4.16% (11.44 × 8/22)
● Contact Finishing: 3.12% (11.44 × 6/22)
● Touch / Craft: 1.56% (11.44 × 3/22)
● Foul Draw: 2.08% (11.44 × 4/22)
● Vertical Finishing: 0.52% (11.44 × 1/22)
● Transition Finishing: 0.00% (11.44 × 0/22)
Playmaking: 17.68% (52% × 34%)
● Advantage Creation: 3.64% (17.68 × 7/34)
● Passing Vision: 2.60% (17.68 × 5/34)
● Passing Execution: 2.60% (17.68 × 5/34)
● Advantage Passing: 3.12% (17.68 × 6/34)
● Transition Playmaking: 1.56% (17.68 × 3/34)
● Ball Security: 2.08% (17.68 × 4/34)
● Connector Creation: 2.08% (17.68 × 4/34)
TOOLS (TKR): 14% TOTAL
● Speed: 3.00%
● Vertical Pop: 1.25%
● Motor: 2.75%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL

● Correct Read Rate: 1.20%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 0.90%
● Role Discipline: 0.70%
(Other IQ traits unchanged by offense system.)

SPREAD PICK-and-ROLL — POWER FORWARD (PF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 14.08% (44% × 32%)
● 3PT Spot-Up: 6.16% (14.08 × 14/32)
● 3PT Movement: 2.20% (14.08 × 5/32)
● 3PT Pull-Up: 2.20% (14.08 × 5/32)
● 3PT Deep Range: 0.88% (14.08 × 2/32)
● Midrange Shotmaking: 1.32% (14.08 × 3/32)
● Free Throw: 1.32% (14.08 × 3/32)
Finishing: 16.72% (44% × 38%)
● Rim Pressure: 6.16% (16.72 × 14/38)
● Contact Finishing: 4.40% (16.72 × 10/38)
● Touch / Craft: 2.20% (16.72 × 5/38)
● Foul Draw: 3.08% (16.72 × 7/38)
● Vertical Finishing: 0.88% (16.72 × 2/38)
● Transition Finishing: 0.00% (16.72 × 0/38)
Playmaking: 13.20% (44% × 30%)
● Advantage Creation: 1.76% (13.20 × 4/30)
● Passing Vision: 1.76% (13.20 × 4/30)
● Passing Execution: 2.20% (13.20 × 5/30)
● Advantage Passing: 1.76% (13.20 × 4/30)
● Transition Playmaking: 0.88% (13.20 × 2/30)
● Ball Security: 1.32% (13.20 × 3/30)
● Connector Creation: 3.52% (13.20 × 8/30)
TOOLS (TKR): 18% TOTAL
● Speed: 2.25%
● Vertical Pop: 1.00%
● Motor: 2.75%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL

● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.40%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

SPREAD PICK-and-ROLL — CENTER (C)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 6.12% (34% × 18%)
● 3PT Spot-Up: 3.40% (6.12 × 10/18)
● 3PT Movement: 0.68% (6.12 × 2/18)
● 3PT Pull-Up: 0.00% (6.12 × 0/18)
● 3PT Deep Range: 0.68% (6.12 × 2/18)
● Midrange Shotmaking: 0.68% (6.12 × 2/18)
● Free Throw: 0.68% (6.12 × 2/18)
Finishing: 21.08% (34% × 62%)
● Rim Pressure: 5.44% (21.08 × 16/62)
● Contact Finishing: 5.44% (21.08 × 16/62)
● Touch / Craft: 2.72% (21.08 × 8/62)
● Foul Draw: 3.40% (21.08 × 10/62)
● Vertical Finishing: 2.72% (21.08 × 8/62)
● Transition Finishing: 1.36% (21.08 × 4/62)
Playmaking: 6.80% (34% × 20%)
● Advantage Creation: 1.02% (6.80 × 3/20)
● Passing Vision: 1.02% (6.80 × 3/20)
● Passing Execution: 1.36% (6.80 × 4/20)
● Advantage Passing: 1.02% (6.80 × 3/20)
● Transition Playmaking: 0.34% (6.80 × 1/20)
● Ball Security: 0.68% (6.80 × 2/20)
● Connector Creation: 1.36% (6.80 × 4/20)
TOOLS (TKR): 20% TOTAL
● Speed: 2.00%
● Vertical Pop: 1.50%
● Motor: 2.00%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL

● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.50%
● Advantage Conversion: 0.50%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

5-OUT MOTION — NEUTRAL (ALL POSITIONS, COLLEGE)
5-OUT MOTION — POINT GUARD (PG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 21.28% (56% × 38%)
● 3PT Spot-Up: 5.04%
● 3PT Movement: 4.20%
● 3PT Pull-Up: 5.04%
● 3PT Deep Range: 2.52%
● Midrange Shotmaking: 1.68%
● Free Throw: 2.80%
Finishing: 11.20% (56% × 20%)
● Rim Pressure: 3.08%
● Contact Finishing: 1.68%
● Touch / Craft: 2.24%
● Foul Draw: 2.24%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.40%

Playmaking: 23.52% (56% × 42%)
● Advantage Creation: 5.60%
● Passing Vision: 3.36%
● Passing Execution: 3.36%
● Advantage Passing: 4.20%
● Transition Playmaking: 2.24%
● Ball Security: 2.80%
● Connector Creation: 1.96%
TOOLS (TKR): 10% TOTAL
● Speed: 3.50%
● Vertical Pop: 1.00%
● Motor: 3.00%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.50%
● Role Discipline: 1.20%
(Other IQ traits unchanged by offense system.)

5-OUT MOTION — SHOOTING GUARD (SG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 25.52% (58% × 44%)
● 3PT Spot-Up: 6.96%
● 3PT Movement: 5.22%
● 3PT Pull-Up: 7.54%
● 3PT Deep Range: 2.32%
● Midrange Shotmaking: 1.74%
● Free Throw: 1.74%
Finishing: 15.08% (58% × 26%)
● Rim Pressure: 4.06%
● Contact Finishing: 2.90%
● Touch / Craft: 2.32%
● Foul Draw: 3.48%
● Vertical Finishing: 1.16%
● Transition Finishing: 1.16%

Playmaking: 17.40% (58% × 30%)
● Advantage Creation: 4.06%
● Passing Vision: 2.90%
● Passing Execution: 2.90%
● Advantage Passing: 3.48%
● Transition Playmaking: 1.74%
● Ball Security: 1.74%
● Connector Creation: 0.58%
TOOLS (TKR): 12% TOTAL
● Speed: 4.20%
● Vertical Pop: 1.20%
● Motor: 3.60%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.00%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)

5-OUT MOTION — SMALL FORWARD (SF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 20.80% (52% × 40%)
● 3PT Spot-Up: 7.28%
● 3PT Movement: 5.20%
● 3PT Pull-Up: 4.16%
● 3PT Deep Range: 1.56%
● Midrange Shotmaking: 1.56%
● Free Throw: 1.04%
Finishing: 16.64% (52% × 32%)
● Rim Pressure: 5.20%
● Contact Finishing: 3.64%
● Touch / Craft: 2.60%
● Foul Draw: 3.12%
● Vertical Finishing: 1.04%
● Transition Finishing: 1.04%
Playmaking: 14.56% (52% × 28%)

● Advantage Creation: 3.12%
● Passing Vision: 2.60%
● Passing Execution: 2.60%
● Advantage Passing: 2.60%
● Transition Playmaking: 1.56%
● Ball Security: 1.04%
● Connector Creation: 1.04%
TOOLS (TKR): 14% TOTAL
● Speed: 4.90%
● Vertical Pop: 1.40%
● Motor: 4.20%
● Endurance: 3.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.00%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)
5-OUT MOTION — POWER FORWARD (PF)

TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 11.44% (44% × 26%)
● 3PT Spot-Up: 5.28%
● 3PT Movement: 2.20%
● 3PT Pull-Up: 1.32%
● 3PT Deep Range: 0.88%
● Midrange Shotmaking: 0.88%
● Free Throw: 0.88%
Finishing: 19.36% (44% × 44%)
● Rim Pressure: 6.16%
● Contact Finishing: 4.40%
● Touch / Craft: 2.64%
● Foul Draw: 3.52%
● Vertical Finishing: 1.76%
● Transition Finishing: 0.88%
Playmaking: 13.20% (44% × 30%)

● Advantage Creation: 2.20%
● Passing Vision: 2.20%
● Passing Execution: 2.64%
● Advantage Passing: 2.20%
● Transition Playmaking: 0.88%
● Ball Security: 0.88%
● Connector Creation: 2.20%
TOOLS (TKR): 18% TOTAL
● Speed: 6.30%
● Vertical Pop: 1.80%
● Motor: 5.40%
● Endurance: 4.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)
5-OUT MOTION — CENTER (C)

TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 4.76% (34% × 14%)
● 3PT Spot-Up: 2.72%
● 3PT Movement: 0.68%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.34%
● Free Throw: 0.68%
Finishing: 20.40% (34% × 60%)
● Rim Pressure: 5.44%
● Contact Finishing: 5.44%
● Touch / Craft: 2.72%
● Foul Draw: 3.40%
● Vertical Finishing: 2.72%
● Transition Finishing: 0.68%
Playmaking: 8.84% (34% × 26%)

● Advantage Creation: 1.02%
● Passing Vision: 1.36%
● Passing Execution: 2.04%
● Advantage Passing: 1.36%
● Transition Playmaking: 0.34%
● Ball Security: 0.68%
● Connector Creation: 2.04%
TOOLS (TKR): 20% TOTAL
● Speed: 7.00%
● Vertical Pop: 2.00%
● Motor: 6.00%
● Endurance: 5.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

READ & REACT — NEUTRAL (ALL POSITIONS, COLLEGE)
READ & REACT — POINT GUARD (PG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 17.92%
● 3PT Spot-Up: 4.03%
● 3PT Movement: 3.58%
● 3PT Pull-Up: 4.03%
● 3PT Deep Range: 1.79%
● Midrange Shotmaking: 1.34%
● Free Throw: 3.13%
Finishing: 11.20%
● Rim Pressure: 2.80%
● Contact Finishing: 1.68%
● Touch / Craft: 2.24%
● Foul Draw: 2.24%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.68%

Playmaking: 26.88%
● Advantage Creation: 7.06%
● Passing Vision: 3.76%
● Passing Execution: 3.76%
● Advantage Passing: 4.71%
● Transition Playmaking: 2.82%
● Ball Security: 2.82%
● Connector Creation: 1.95%
TOOLS (TKR): 10% TOTAL
● Speed: 3.00%
● Vertical Pop: 1.00%
● Motor: 3.00%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.50%
● Role Discipline: 0.90%
(Other IQ traits unchanged by offense system.)

READ & REACT — SHOOTING GUARD (SG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 22.04%
● 3PT Spot-Up: 8.12%
● 3PT Movement: 6.96%
● 3PT Pull-Up: 4.06%
● 3PT Deep Range: 1.16%
● Midrange Shotmaking: 1.16%
● Free Throw: 0.58%
Finishing: 12.76%
● Rim Pressure: 4.06%
● Contact Finishing: 2.90%
● Touch / Craft: 2.32%
● Foul Draw: 2.32%
● Vertical Finishing: 0.58%
● Transition Finishing: 0.58%

Playmaking: 23.20%
● Advantage Creation: 5.22%
● Passing Vision: 3.48%
● Passing Execution: 3.48%
● Advantage Passing: 4.06%
● Transition Playmaking: 2.90%
● Ball Security: 2.32%
● Connector Creation: 1.74%
TOOLS (TKR): 12% TOTAL
● Speed: 3.60%
● Vertical Pop: 1.20%
● Motor: 3.60%
● Endurance: 3.60%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.00%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

READ & REACT — SMALL FORWARD (SF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 17.68%
● 3PT Spot-Up: 7.28%
● 3PT Movement: 5.20%
● 3PT Pull-Up: 3.12%
● 3PT Deep Range: 1.04%
● Midrange Shotmaking: 0.52%
● Free Throw: 0.52%
Finishing: 15.60%
● Rim Pressure: 5.20%
● Contact Finishing: 3.64%
● Touch / Craft: 2.60%
● Foul Draw: 2.60%
● Vertical Finishing: 0.52%
● Transition Finishing: 1.04%

Playmaking: 18.72%
● Advantage Creation: 3.12%
● Passing Vision: 2.60%
● Passing Execution: 2.60%
● Advantage Passing: 3.12%
● Transition Playmaking: 2.08%
● Ball Security: 2.08%
● Connector Creation: 3.12%
TOOLS (TKR): 14% TOTAL
● Speed: 4.20%
● Vertical Pop: 1.40%
● Motor: 4.20%
● Endurance: 4.20%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.00%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

READ & REACT — POWER FORWARD (PF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 8.80%
● 3PT Spot-Up: 4.40%
● 3PT Movement: 2.20%
● 3PT Pull-Up: 0.88%
● 3PT Deep Range: 0.44%
● Midrange Shotmaking: 0.44%
● Free Throw: 0.44%
Finishing: 19.36%
● Rim Pressure: 6.16%
● Contact Finishing: 4.40%
● Touch / Craft: 2.64%
● Foul Draw: 3.52%
● Vertical Finishing: 1.76%
● Transition Finishing: 0.88%

Playmaking: 15.84%
● Advantage Creation: 1.76%
● Passing Vision: 1.76%
● Passing Execution: 2.64%
● Advantage Passing: 1.76%
● Transition Playmaking: 1.32%
● Ball Security: 1.32%
● Connector Creation: 5.28%
TOOLS (TKR): 18% TOTAL
● Speed: 5.40%
● Vertical Pop: 1.80%
● Motor: 5.40%
● Endurance: 5.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.30%
(Other IQ traits unchanged by offense system.)

READ & REACT — CENTER (C)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 3.40%
● 3PT Spot-Up: 2.04%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.34%
● Free Throw: 0.34%
Finishing: 19.72%
● Rim Pressure: 5.44%
● Contact Finishing: 5.44%
● Touch / Craft: 2.72%
● Foul Draw: 2.72%
● Vertical Finishing: 2.72%
● Transition Finishing: 0.68%

Playmaking: 10.88%
● Advantage Creation: 1.02%
● Passing Vision: 1.36%
● Passing Execution: 2.04%
● Advantage Passing: 1.36%
● Transition Playmaking: 0.68%
● Ball Security: 0.68%
● Connector Creation: 3.74%
TOOLS (TKR): 20% TOTAL
● Speed: 6.00%
● Vertical Pop: 2.00%
● Motor: 6.00%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.30%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — NEUTRAL (ALL POSITIONS,
COLLEGE)
PACE & SPACE — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 20.16%
● 3PT Spot-Up: 4.48%
● 3PT Movement: 3.36%
● 3PT Pull-Up: 6.72%
● 3PT Deep Range: 2.24%
● Midrange Shotmaking: 1.12%
● Free Throw: 2.24%
Finishing: 10.08%
● Rim Pressure: 3.36%
● Contact Finishing: 1.68%
● Touch / Craft: 1.12%
● Foul Draw: 2.80%
● Vertical Finishing: 0.56%
● Transition Finishing: 0.56%

Playmaking: 25.76%
● Advantage Creation: 7.17%
● Passing Vision: 3.58%
● Passing Execution: 3.58%
● Advantage Passing: 4.48%
● Transition Playmaking: 2.46%
● Ball Security: 3.13%
● Connector Creation: 1.36%
TOOLS (TKR): 10% TOTAL
● Speed: 3.50%
● Vertical Pop: 1.00%
● Motor: 2.50%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.80%
● Advantage Conversion: 1.50%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 29.00%
● 3PT Spot-Up: 7.91%
● 3PT Movement: 5.93%
● 3PT Pull-Up: 8.57%
● 3PT Deep Range: 2.64%
● Midrange Shotmaking: 1.98%
● Free Throw: 1.98%
Finishing: 13.92%
● Rim Pressure: 3.75%
● Contact Finishing: 2.68%
● Touch / Craft: 2.14%
● Foul Draw: 3.21%
● Vertical Finishing: 1.07%
● Transition Finishing: 1.07%

Playmaking: 15.08%
● Advantage Creation: 3.52%
● Passing Vision: 2.51%
● Passing Execution: 2.51%
● Advantage Passing: 3.02%
● Transition Playmaking: 1.51%
● Ball Security: 1.51%
● Connector Creation: 0.50%
TOOLS (TKR): 12% TOTAL
● Speed: 4.20%
● Vertical Pop: 1.20%
● Motor: 3.00%
● Endurance: 3.60%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.00%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 23.92%
● 3PT Spot-Up: 8.37%
● 3PT Movement: 5.98%
● 3PT Pull-Up: 4.78%
● 3PT Deep Range: 1.79%
● Midrange Shotmaking: 1.79%
● Free Throw: 1.20%
Finishing: 15.60%
● Rim Pressure: 4.88%
● Contact Finishing: 3.41%
● Touch / Craft: 2.44%
● Foul Draw: 2.93%
● Vertical Finishing: 0.98%
● Transition Finishing: 0.98%

Playmaking: 12.48%
● Advantage Creation: 2.67%
● Passing Vision: 2.23%
● Passing Execution: 2.23%
● Advantage Passing: 2.23%
● Transition Playmaking: 1.34%
● Ball Security: 0.89%
● Connector Creation: 0.89%
TOOLS (TKR): 14% TOTAL
● Speed: 4.90%
● Vertical Pop: 1.40%
● Motor: 3.50%
● Endurance: 4.20%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.00%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 12.32%
● 3PT Spot-Up: 5.69%
● 3PT Movement: 2.37%
● 3PT Pull-Up: 1.42%
● 3PT Deep Range: 0.95%
● Midrange Shotmaking: 0.95%
● Free Throw: 0.95%
Finishing: 19.36%
● Rim Pressure: 6.16%
● Contact Finishing: 4.40%
● Touch / Craft: 2.64%
● Foul Draw: 3.52%
● Vertical Finishing: 1.76%
● Transition Finishing: 0.88%

Playmaking: 12.32%
● Advantage Creation: 2.05%
● Passing Vision: 2.05%
● Passing Execution: 2.46%
● Advantage Passing: 2.05%
● Transition Playmaking: 0.82%
● Ball Security: 0.82%
● Connector Creation: 2.05%
TOOLS (TKR): 18% TOTAL
● Speed: 6.30%
● Vertical Pop: 1.80%
● Motor: 4.50%
● Endurance: 5.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.50%
● Role Discipline: 0.20%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 5.44%
● 3PT Spot-Up: 3.11%
● 3PT Movement: 0.78%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.39%
● Midrange Shotmaking: 0.39%
● Free Throw: 0.78%
Finishing: 19.72%
● Rim Pressure: 5.26%
● Contact Finishing: 5.26%
● Touch / Craft: 2.63%
● Foul Draw: 3.29%
● Vertical Finishing: 2.63%
● Transition Finishing: 0.66%

Playmaking: 8.84%
● Advantage Creation: 1.02%
● Passing Vision: 1.36%
● Passing Execution: 2.04%
● Advantage Passing: 1.36%
● Transition Playmaking: 0.34%
● Ball Security: 0.68%
● Connector Creation: 2.04%
TOOLS (TKR): 20% TOTAL
● Speed: 7.00%
● Vertical Pop: 2.00%
● Motor: 5.00%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.50%
● Role Discipline: 0.20%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — NEUTRAL (ALL POSITIONS,
COLLEGE)
DRIBBLE DRIVE — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 16.80%
● 3PT Spot-Up: 4.20%
● 3PT Movement: 3.36%
● 3PT Pull-Up: 3.36%
● 3PT Deep Range: 1.68%
● Midrange Shotmaking: 0.84%
● Free Throw: 3.36%
Finishing: 15.68%
● Rim Pressure: 5.04%
● Contact Finishing: 2.24%
● Touch / Craft: 2.24%
● Foul Draw: 4.48%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.12%

Playmaking: 23.52%
● Advantage Creation: 6.72%
● Passing Vision: 3.36%
● Passing Execution: 3.36%
● Advantage Passing: 3.92%
● Transition Playmaking: 2.24%
● Ball Security: 2.80%
● Connector Creation: 1.12%
TOOLS (TKR): 10% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.00%
● Motor: 2.00%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 1.80%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 2.10%
● Role Discipline: 0.90%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 18.56% (58% × 32%)
● 3PT Spot-Up: 5.80% (18.56 × 10/32)
● 3PT Movement: 4.06% (18.56 × 7/32)
● 3PT Pull-Up: 2.90% (18.56 × 5/32)
● 3PT Deep Range: 1.16% (18.56 × 2/32)
● Midrange Shotmaking: 1.16% (18.56 × 2/32)
● Free Throw: 3.48% (18.56 × 6/32)
Finishing: 20.88% (58% × 36%)
● Rim Pressure: 6.38% (20.88 × 11/36)
● Contact Finishing: 4.06% (20.88 × 7/36)
● Touch / Craft: 2.90% (20.88 × 5/36)
● Foul Draw: 5.22% (20.88 × 9/36)
● Vertical Finishing: 1.16% (20.88 × 2/36)
● Transition Finishing: 1.16% (20.88 × 2/36)

Playmaking: 18.56% (58% × 32%)
● Advantage Creation: 5.80% (18.56 × 10/32)
● Passing Vision: 2.90% (18.56 × 5/32)
● Passing Execution: 2.90% (18.56 × 5/32)
● Advantage Passing: 2.90% (18.56 × 5/32)
● Transition Playmaking: 1.74% (18.56 × 3/32)
● Ball Security: 1.74% (18.56 × 3/32)
● Connector Creation: 0.58% (18.56 × 1/32)
TOOLS (TKR): 12% TOTAL
● Speed: 4.50%
● Vertical Pop: 1.00%
● Motor: 2.50%
● Endurance: 4.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.00%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.40%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 14.56% (52% × 28%)
● 3PT Spot-Up: 5.20% (14.56 × 10/28)
● 3PT Movement: 3.12% (14.56 × 6/28)
● 3PT Pull-Up: 2.08% (14.56 × 4/28)
● 3PT Deep Range: 1.04% (14.56 × 2/28)
● Midrange Shotmaking: 1.04% (14.56 × 2/28)
● Free Throw: 2.08% (14.56 × 4/28)
Finishing: 21.84% (52% × 42%)
● Rim Pressure: 6.76% (21.84 × 13/42)
● Contact Finishing: 4.68% (21.84 × 9/42)
● Touch / Craft: 3.12% (21.84 × 6/42)
● Foul Draw: 5.20% (21.84 × 10/42)
● Vertical Finishing: 1.04% (21.84 × 2/42)
● Transition Finishing: 1.04% (21.84 × 2/42)

Playmaking: 15.60% (52% × 30%)
● Advantage Creation: 3.64% (15.60 × 7/30)
● Passing Vision: 2.08% (15.60 × 4/30)
● Passing Execution: 2.08% (15.60 × 4/30)
● Advantage Passing: 2.08% (15.60 × 4/30)
● Transition Playmaking: 1.56% (15.60 × 3/30)
● Ball Security: 1.56% (15.60 × 3/30)
● Connector Creation: 2.60% (15.60 × 5/30)
TOOLS (TKR): 14% TOTAL
● Speed: 4.20%
● Vertical Pop: 1.40%
● Motor: 4.00%
● Endurance: 4.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.20%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.40%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 7.92% (44% × 18%)
● 3PT Spot-Up: 3.08% (7.92 × 7/18)
● 3PT Movement: 1.32% (7.92 × 3/18)
● 3PT Pull-Up: 0.44% (7.92 × 1/18)
● 3PT Deep Range: 0.44% (7.92 × 1/18)
● Midrange Shotmaking: 0.88% (7.92 × 2/18)
● Free Throw: 1.76% (7.92 × 4/18)
Finishing: 22.88% (44% × 52%)
● Rim Pressure: 7.04% (22.88 × 16/52)
● Contact Finishing: 5.72% (22.88 × 13/52)
● Touch / Craft: 3.52% (22.88 × 8/52)
● Foul Draw: 4.40% (22.88 × 10/52)
● Vertical Finishing: 1.76% (22.88 × 4/52)
● Transition Finishing: 0.44% (22.88 × 1/52)

Playmaking: 13.20% (44% × 30%)
● Advantage Creation: 1.76% (13.20 × 4/30)
● Passing Vision: 1.76% (13.20 × 4/30)
● Passing Execution: 2.64% (13.20 × 6/30)
● Advantage Passing: 1.76% (13.20 × 4/30)
● Transition Playmaking: 1.32% (13.20 × 3/30)
● Ball Security: 0.88% (13.20 × 2/30)
● Connector Creation: 3.08% (13.20 × 7/30)
TOOLS (TKR): 18% TOTAL
● Speed: 5.50%
● Vertical Pop: 1.80%
● Motor: 5.00%
● Endurance: 5.70%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.50%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.70%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 2.72% (34% × 8%)
● 3PT Spot-Up: 1.70% (2.72 × 5/8)
● 3PT Movement: 0.34% (2.72 × 1/8)
● 3PT Pull-Up: 0.00% (2.72 × 0/8)
● 3PT Deep Range: 0.34% (2.72 × 1/8)
● Midrange Shotmaking: 0.34% (2.72 × 1/8)
● Free Throw: 0.00% (2.72 × 0/8)
Finishing: 24.48% (34% × 72%)
● Rim Pressure: 6.12% (24.48 × 18/72)
● Contact Finishing: 7.48% (24.48 × 22/72)
● Touch / Craft: 3.06% (24.48 × 9/72)
● Foul Draw: 5.10% (24.48 × 15/72)
● Vertical Finishing: 2.04% (24.48 × 6/72)
● Transition Finishing: 0.68% (24.48 × 2/72)

Playmaking: 6.80% (34% × 20%)
● Advantage Creation: 0.68% (6.80 × 2/20)
● Passing Vision: 1.02% (6.80 × 3/20)
● Passing Execution: 1.36% (6.80 × 4/20)
● Advantage Passing: 1.02% (6.80 × 3/20)
● Transition Playmaking: 0.34% (6.80 × 1/20)
● Ball Security: 0.34% (6.80 × 1/20)
● Connector Creation: 2.04% (6.80 × 6/20)
TOOLS (TKR): 20% TOTAL
● Speed: 6.50%
● Vertical Pop: 2.00%
● Motor: 5.50%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.50%
● Shot Selection Quality: 0.30%
● Advantage Conversion: 0.80%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

PRINCETON — NEUTRAL (ALL POSITIONS, COLLEGE)
PRINCETON — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 15.68%
● 3PT Spot-Up: 4.70%
● 3PT Movement: 3.13%
● 3PT Pull-Up: 2.35%
● 3PT Deep Range: 1.57%
● Midrange Shotmaking: 1.57%
● Free Throw: 2.35%
Finishing: 10.08%
● Rim Pressure: 2.80%
● Contact Finishing: 1.68%
● Touch / Craft: 1.68%
● Foul Draw: 2.24%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.12%

Playmaking: 30.24%
● Advantage Creation: 6.72%
● Passing Vision: 4.70%
● Passing Execution: 4.70%
● Advantage Passing: 4.03%
● Transition Playmaking: 2.02%
● Ball Security: 3.36%
● Connector Creation: 4.71%
TOOLS (TKR): 10% TOTAL
● Speed: 2.50%
● Vertical Pop: 0.50%
● Motor: 3.00%
● Endurance: 4.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.20%
● Role Discipline: 1.20%
(Other IQ traits unchanged by offense system.)

PRINCETON — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 19.72%
● 3PT Spot-Up: 6.50%
● 3PT Movement: 4.73%
● 3PT Pull-Up: 2.36%
● 3PT Deep Range: 1.18%
● Midrange Shotmaking: 1.18%
● Free Throw: 3.77%
Finishing: 11.60%
● Rim Pressure: 3.22%
● Contact Finishing: 1.93%
● Touch / Craft: 1.93%
● Foul Draw: 2.58%
● Vertical Finishing: 0.64%
● Transition Finishing: 1.29%

Playmaking: 26.68%
● Advantage Creation: 5.34%
● Passing Vision: 4.45%
● Passing Execution: 4.45%
● Advantage Passing: 3.56%
● Transition Playmaking: 2.22%
● Ball Security: 2.67%
● Connector Creation: 4.00%
TOOLS (TKR): 12% TOTAL
● Speed: 2.70%
● Vertical Pop: 0.60%
● Motor: 3.60%
● Endurance: 5.10%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)

PRINCETON — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 14.56%
● 3PT Spot-Up: 5.46%
● 3PT Movement: 3.64%
● 3PT Pull-Up: 1.82%
● 3PT Deep Range: 0.91%
● Midrange Shotmaking: 1.82%
● Free Throw: 0.91%
Finishing: 11.44%
● Rim Pressure: 3.12%
● Contact Finishing: 2.08%
● Touch / Craft: 2.08%
● Foul Draw: 2.08%
● Vertical Finishing: 0.52%
● Transition Finishing: 1.56%

Playmaking: 26.00%
● Advantage Creation: 4.68%
● Passing Vision: 4.68%
● Passing Execution: 4.68%
● Advantage Passing: 3.64%
● Transition Playmaking: 2.60%
● Ball Security: 2.60%
● Connector Creation: 3.12%
TOOLS (TKR): 14% TOTAL
● Speed: 2.80%
● Vertical Pop: 0.70%
● Motor: 4.20%
● Endurance: 6.30%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)

PRINCETON — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 8.80%
● 3PT Spot-Up: 3.30%
● 3PT Movement: 1.54%
● 3PT Pull-Up: 0.88%
● 3PT Deep Range: 0.44%
● Midrange Shotmaking: 1.32%
● Free Throw: 1.32%
Finishing: 11.44%
● Rim Pressure: 3.08%
● Contact Finishing: 2.64%
● Touch / Craft: 1.76%
● Foul Draw: 1.76%
● Vertical Finishing: 0.88%
● Transition Finishing: 1.32%

Playmaking: 23.76%
● Advantage Creation: 3.30%
● Passing Vision: 3.96%
● Passing Execution: 3.96%
● Advantage Passing: 3.30%
● Transition Playmaking: 2.64%
● Ball Security: 2.64%
● Connector Creation: 3.96%
TOOLS (TKR): 18% TOTAL
● Speed: 2.70%
● Vertical Pop: 0.90%
● Motor: 5.40%
● Endurance: 9.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

PRINCETON — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 3.40%
● 3PT Spot-Up: 1.70%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.68%
● Free Throw: 0.34%
Finishing: 8.16%
● Rim Pressure: 2.04%
● Contact Finishing: 2.04%
● Touch / Craft: 1.36%
● Foul Draw: 1.36%
● Vertical Finishing: 0.68%
● Transition Finishing: 0.68%

Playmaking: 22.44%
● Advantage Creation: 3.06%
● Passing Vision: 4.08%
● Passing Execution: 4.08%
● Advantage Passing: 3.40%
● Transition Playmaking: 2.72%
● Ball Security: 2.72%
● Connector Creation: 2.38%
TOOLS (TKR): 20% TOTAL
● Speed: 2.00%
● Vertical Pop: 1.00%
● Motor: 7.00%
● Endurance: 10.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

FLEX — NEUTRAL (ALL POSITIONS, COLLEGE)
FLEX — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 16.80%
● 3PT Spot-Up: 4.70%
● 3PT Movement: 2.69%
● 3PT Pull-Up: 3.36%
● 3PT Deep Range: 1.68%
● Midrange Shotmaking: 1.68%
● Free Throw: 2.69%
Finishing: 11.20%
● Rim Pressure: 2.80%
● Contact Finishing: 1.68%
● Touch / Craft: 1.68%
● Foul Draw: 2.80%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.68%

Playmaking: 28.00%
● Advantage Creation: 5.60%
● Passing Vision: 4.20%
● Passing Execution: 4.20%
● Advantage Passing: 4.20%
● Transition Playmaking: 1.40%
● Ball Security: 2.80%
● Connector Creation: 5.60%
TOOLS (TKR): 10% TOTAL
● Speed: 2.50%
● Vertical Pop: 0.75%
● Motor: 3.25%
● Endurance: 3.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.20%
● Role Discipline: 1.50%
(Other IQ traits unchanged by offense system.)

FLEX — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 20.88% (58% × 36%)
● 3PT Spot-Up: 7.25%
● 3PT Movement: 5.80%
● 3PT Pull-Up: 4.35%
● 3PT Deep Range: 1.45%
● Midrange Shotmaking: 1.45%
● Free Throw: 0.58%
Finishing: 13.92% (58% × 24%)
● Rim Pressure: 4.06%
● Contact Finishing: 2.32%
● Touch / Craft: 2.32%
● Foul Draw: 2.32%
● Vertical Finishing: 1.16%
● Transition Finishing: 1.74%

Playmaking: 23.20% (58% × 40%)
● Advantage Creation: 4.64%
● Passing Vision: 3.48%
● Passing Execution: 3.48%
● Advantage Passing: 3.48%
● Transition Playmaking: 2.32%
● Ball Security: 2.32%
● Connector Creation: 6.96%
TOOLS (TKR): 12% TOTAL
● Speed: 3.00%
● Vertical Pop: 1.00%
● Motor: 3.80%
● Endurance: 4.20%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 1.00%
(Other IQ traits unchanged by offense system.)

FLEX — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 16.64% (52% × 32%)
● 3PT Spot-Up: 6.66%
● 3PT Movement: 4.68%
● 3PT Pull-Up: 3.12%
● 3PT Deep Range: 0.94%
● Midrange Shotmaking: 0.94%
● Free Throw: 0.30%
Finishing: 15.60% (52% × 30%)
● Rim Pressure: 4.68%
● Contact Finishing: 3.12%
● Touch / Craft: 2.34%
● Foul Draw: 2.34%
● Vertical Finishing: 1.04%
● Transition Finishing: 2.08%

Playmaking: 19.76% (52% × 38%)
● Advantage Creation: 3.12%
● Passing Vision: 2.60%
● Passing Execution: 2.60%
● Advantage Passing: 2.60%
● Transition Playmaking: 1.56%
● Ball Security: 1.56%
● Connector Creation: 5.72%
TOOLS (TKR): 14% TOTAL
● Speed: 3.10%
● Vertical Pop: 1.10%
● Motor: 4.50%
● Endurance: 5.30%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 1.00%
(Other Tools traits unchanged by offense system.)

FLEX — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 10.56% (44% × 24%)
● 3PT Spot-Up: 4.84%
● 3PT Movement: 2.20%
● 3PT Pull-Up: 1.32%
● 3PT Deep Range: 0.88%
● Midrange Shotmaking: 0.88%
● Free Throw: 0.44%
Finishing: 15.84% (44% × 36%)
● Rim Pressure: 4.84%
● Contact Finishing: 3.52%
● Touch / Craft: 2.20%
● Foul Draw: 2.64%
● Vertical Finishing: 1.32%
● Transition Finishing: 1.32%

Playmaking: 17.60% (44% × 40%)
● Advantage Creation: 1.76%
● Passing Vision: 1.76%
● Passing Execution: 2.64%
● Advantage Passing: 1.76%
● Transition Playmaking: 1.76%
● Ball Security: 0.88%
● Connector Creation: 7.04%
TOOLS (TKR): 18% TOTAL
● Speed: 3.60%
● Vertical Pop: 1.40%
● Motor: 6.00%
● Endurance: 7.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.60%
(Other Tools traits unchanged by offense system.)

FLEX — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 4.08% (34% × 12%)
● 3PT Spot-Up: 2.38%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.68%
● Free Throw: 0.34%
Finishing: 12.92% (34% × 38%)
● Rim Pressure: 3.74%
● Contact Finishing: 3.40%
● Touch / Craft: 1.70%
● Foul Draw: 1.70%
● Vertical Finishing: 1.36%
● Transition Finishing: 1.02%

Playmaking: **17.00% (34% × 50%)
● Advantage Creation: 1.70%
● Passing Vision: 2.72%
● Passing Execution: 2.72%
● Advantage Passing: 2.38%
● Transition Playmaking: 1.70%
● Ball Security: 1.70%
● Connector Creation: 4.08%
TOOLS (TKR): 20% TOTAL
● Speed: 2.50%
● Vertical Pop: 1.50%
● Motor: 7.50%
● Endurance: 8.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.60%
(Other Tools traits unchanged by offense system.)

SWING — NEUTRAL (ALL POSITIONS, COLLEGE)
SWING — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 17.92%
● 3PT Spot-Up: 5.38%
● 3PT Movement: 3.58%
● 3PT Pull-Up: 3.58%
● 3PT Deep Range: 1.79%
● Midrange Shotmaking: 1.34%
● Free Throw: 2.25%
Finishing: 10.08%
● Rim Pressure: 2.80%
● Contact Finishing: 1.68%
● Touch / Craft: 1.12%
● Foul Draw: 2.80%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.12%

Playmaking: 28.00%
● Advantage Creation: 5.60%
● Passing Vision: 4.20%
● Passing Execution: 4.20%
● Advantage Passing: 4.48%
● Transition Playmaking: 1.68%
● Ball Security: 2.52%
● Connector Creation: 5.32%
TOOLS (TKR): 10% TOTAL
● Speed: 2.75%
● Vertical Pop: 0.75%
● Motor: 3.00%
● Endurance: 3.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.20%
● Role Discipline: 1.50%
(Other IQ traits unchanged by offense system.)

SWING — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 26.68%
● 3PT Spot-Up: 7.28%
● 3PT Movement: 5.46%
● 3PT Pull-Up: 7.88%
● 3PT Deep Range: 2.43%
● Midrange Shotmaking: 1.82%
● Free Throw: 1.82%
Finishing: 12.76%
● Rim Pressure: 3.44%
● Contact Finishing: 2.45%
● Touch / Craft: 1.96%
● Foul Draw: 2.45%
● Vertical Finishing: 0.98%
● Transition Finishing: 1.47%

Playmaking: 18.56%
● Advantage Creation: 4.33%
● Passing Vision: 3.09%
● Passing Execution: 3.09%
● Advantage Passing: 3.71%
● Transition Playmaking: 1.86%
● Ball Security: 1.86%
● Connector Creation: 0.62%
TOOLS (TKR): 12% TOTAL
● Speed: 3.30%
● Vertical Pop: 1.00%
● Motor: 3.60%
● Endurance: 4.10%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 1.00%
(Other IQ traits unchanged by offense system.)

SWING — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 21.84%
● 3PT Spot-Up: 7.64%
● 3PT Movement: 5.46%
● 3PT Pull-Up: 4.37%
● 3PT Deep Range: 1.64%
● Midrange Shotmaking: 1.64%
● Free Throw: 1.09%
Finishing: 14.56%
● Rim Pressure: 4.55%
● Contact Finishing: 3.19%
● Touch / Craft: 2.27%
● Foul Draw: 2.73%
● Vertical Finishing: 0.91%
● Transition Finishing: 0.91%

Playmaking: 15.60%
● Advantage Creation: 3.34%
● Passing Vision: 2.79%
● Passing Execution: 2.79%
● Advantage Passing: 2.79%
● Transition Playmaking: 1.67%
● Ball Security: 1.11%
● Connector Creation: 1.11%
TOOLS (TKR): 14% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.40%
● Motor: 4.20%
● Endurance: 4.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 1.00%
(Other IQ traits unchanged by offense system.)

SWING — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 12.32%
● 3PT Spot-Up: 5.69%
● 3PT Movement: 2.37%
● 3PT Pull-Up: 1.42%
● 3PT Deep Range: 0.95%
● Midrange Shotmaking: 0.95%
● Free Throw: 0.95%
Finishing: 17.60%
● Rim Pressure: 5.60%
● Contact Finishing: 4.00%
● Touch / Craft: 2.40%
● Foul Draw: 3.20%
● Vertical Finishing: 1.60%
● Transition Finishing: 0.80%

Playmaking: 14.08%
● Advantage Creation: 2.35%
● Passing Vision: 2.35%
● Passing Execution: 2.82%
● Advantage Passing: 2.35%
● Transition Playmaking: 0.94%
● Ball Security: 0.94%
● Connector Creation: 2.35%
TOOLS (TKR): 18% TOTAL
● Speed: 5.00%
● Vertical Pop: 1.80%
● Motor: 5.40%
● Endurance: 5.80%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

SWING — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 5.44%
● 3PT Spot-Up: 3.11%
● 3PT Movement: 0.78%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.39%
● Midrange Shotmaking: 0.39%
● Free Throw: 0.78%
Finishing: 19.04%
● Rim Pressure: 5.08%
● Contact Finishing: 5.08%
● Touch / Craft: 2.54%
● Foul Draw: 3.17%
● Vertical Finishing: 2.54%
● Transition Finishing: 0.63%

Playmaking: 9.52%
● Advantage Creation: 1.10%
● Passing Vision: 1.46%
● Passing Execution: 2.20%
● Advantage Passing: 1.46%
● Transition Playmaking: 0.37%
● Ball Security: 0.73%
● Connector Creation: 2.20%
TOOLS (TKR): 20% TOTAL
● Speed: 6.00%
● Vertical Pop: 2.00%
● Motor: 6.00%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

INSIDE-OUT — NEUTRAL (ALL POSITIONS, COLLEGE)
INSIDE-OUT — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 15.68%
● 3PT Spot-Up: 5.49%
● 3PT Movement: 2.66%
● 3PT Pull-Up: 2.35%
● 3PT Deep Range: 1.57%
● Midrange Shotmaking: 1.57%
● Free Throw: 2.04%
Finishing: 10.08%
● Rim Pressure: 2.52%
● Contact Finishing: 1.68%
● Touch / Craft: 1.68%
● Foul Draw: 2.24%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.40%

Playmaking: 30.24%
● Advantage Creation: 5.38%
● Passing Vision: 4.70%
● Passing Execution: 4.70%
● Advantage Passing: 4.03%
● Transition Playmaking: 1.68%
● Ball Security: 3.36%
● Connector Creation: 6.39%
TOOLS (TKR): 10% TOTAL
● Speed: 2.50%
● Vertical Pop: 0.50%
● Motor: 3.00%
● Endurance: 4.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 0.90%
● Role Discipline: 1.50%
(Other IQ traits unchanged by offense system.)

INSIDE-OUT — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 18.56% (58% × 32%)
● 3PT Spot-Up: 7.54%
● 3PT Movement: 3.48%
● 3PT Pull-Up: 2.32%
● 3PT Deep Range: 1.16%
● Midrange Shotmaking: 1.16%
● Free Throw: 2.90%
Finishing: 12.76% (58% × 22%)
● Rim Pressure: 3.48%
● Contact Finishing: 2.32%
● Touch / Craft: 2.32%
● Foul Draw: 2.32%
● Vertical Finishing: 0.58%
● Transition Finishing: 1.74%

Playmaking: 26.68% (58% × 46%)
● Advantage Creation: 4.64%
● Passing Vision: 4.06%
● Passing Execution: 4.06%
● Advantage Passing: 3.48%
● Transition Playmaking: 1.74%
● Ball Security: 2.90%
● Connector Creation: 5.80%
TOOLS (TKR): 12% TOTAL
● Speed: 2.70%
● Vertical Pop: 0.60%
● Motor: 3.60%
● Endurance: 5.10%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.60%
● Role Discipline: 1.00%
(Other IQ traits unchanged by offense system.)

INSIDE-OUT — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 14.56% (52% × 28%)
● 3PT Spot-Up: 6.24%
● 3PT Movement: 2.60%
● 3PT Pull-Up: 1.82%
● 3PT Deep Range: 0.91%
● Midrange Shotmaking: 1.82%
● Free Throw: 1.17%
Finishing: 12.48% (52% × 24%)
● Rim Pressure: 3.12%
● Contact Finishing: 2.60%
● Touch / Craft: 2.08%
● Foul Draw: 2.08%
● Vertical Finishing: 0.52%
● Transition Finishing: 2.08%

Playmaking: 24.96% (52% × 48%)
● Advantage Creation: 3.64%
● Passing Vision: 4.16%
● Passing Execution: 4.16%
● Advantage Passing: 3.64%
● Transition Playmaking: 2.60%
● Ball Security: 3.12%
● Connector Creation: 3.64%
TOOLS (TKR): 14% TOTAL
● Speed: 2.80%
● Vertical Pop: 0.70%
● Motor: 4.20%
● Endurance: 6.30%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.60%
● Role Discipline: 1.00%
(Other Tools traits unchanged by offense system.)

INSIDE-OUT — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 7.92% (44% × 18%)
● 3PT Spot-Up: 3.08%
● 3PT Movement: 1.32%
● 3PT Pull-Up: 0.44%
● 3PT Deep Range: 0.44%
● Midrange Shotmaking: 1.32%
● Free Throw: 1.32%
Finishing: 13.20% (44% × 30%)
● Rim Pressure: 3.52%
● Contact Finishing: 3.08%
● Touch / Craft: 2.20%
● Foul Draw: 2.20%
● Vertical Finishing: 0.88%
● Transition Finishing: 1.32%

Playmaking: 22.88% (44% × 52%)
● Advantage Creation: 2.64%
● Passing Vision: 3.96%
● Passing Execution: 3.96%
● Advantage Passing: 3.52%
● Transition Playmaking: 2.64%
● Ball Security: 2.64%
● Connector Creation: 3.52%
TOOLS (TKR): 18% TOTAL
● Speed: 2.70%
● Vertical Pop: 0.90%
● Motor: 5.40%
● Endurance: 9.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.30%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

INSIDE-OUT — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 2.72% (34% × 8%)
● 3PT Spot-Up: 1.36%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.68%
● Free Throw: 0.00%
Finishing: 7.48% (34% × 22%)
● Rim Pressure: 1.70%
● Contact Finishing: 1.70%
● Touch / Craft: 1.36%
● Foul Draw: 1.36%
● Vertical Finishing: 0.68%
● Transition Finishing: 0.68%

Playmaking: 23.80% (34% × 70%)
● Advantage Creation: 3.06%
● Passing Vision: 4.42%
● Passing Execution: 4.42%
● Advantage Passing: 4.08%
● Transition Playmaking: 2.72%
● Ball Security: 2.72%
● Connector Creation: 2.38%
TOOLS (TKR): 20% TOTAL
● Speed: 2.00%
● Vertical Pop: 1.00%
● Motor: 7.00%
● Endurance: 10.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.30%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

MOREYBALL — NEUTRAL (ALL POSITIONS, COLLEGE)
MOREYBALL — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 26.88%
● 3PT Spot-Up: 6.72%
● 3PT Movement: 4.03%
● 3PT Pull-Up: 10.08%
● 3PT Deep Range: 4.03%
● Midrange Shotmaking: 0.67%
● Free Throw: 1.34%
Finishing: 7.84%
● Rim Pressure: 2.80%
● Contact Finishing: 1.12%
● Touch / Craft: 0.56%
● Foul Draw: 2.80%
● Vertical Finishing: 0.28%
● Transition Finishing: 0.28%

Playmaking: 21.28%
● Advantage Creation: 6.38%
● Passing Vision: 2.98%
● Passing Execution: 2.98%
● Advantage Passing: 3.72%
● Transition Playmaking: 1.49%
● Ball Security: 2.23%
● Connector Creation: 1.49%
TOOLS (TKR): 10% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.00%
● Motor: 2.50%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 1.80%
● Shot Selection Quality: 2.10%
● Advantage Conversion: 1.50%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

MOREYBALL — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 30.16%
● 3PT Spot-Up: 10.56%
● 3PT Movement: 6.03%
● 3PT Pull-Up: 7.54%
● 3PT Deep Range: 3.62%
● Midrange Shotmaking: 0.90%
● Free Throw: 1.51%
Finishing: 9.28%
● Rim Pressure: 3.06%
● Contact Finishing: 1.58%
● Touch / Craft: 0.93%
● Foul Draw: 2.79%
● Vertical Finishing: 0.46%
● Transition Finishing: 0.46%

Playmaking: 18.56%
● Advantage Creation: 4.45%
● Passing Vision: 2.23%
● Passing Execution: 2.23%
● Advantage Passing: 2.97%
● Transition Playmaking: 1.86%
● Ball Security: 1.86%
● Connector Creation: 2.97%
TOOLS (TKR): 12% TOTAL
● Speed: 4.50%
● Vertical Pop: 1.20%
● Motor: 3.00%
● Endurance: 3.30%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.10%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.20%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

MOREYBALL — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 24.96%
● 3PT Spot-Up: 9.98%
● 3PT Movement: 4.99%
● 3PT Pull-Up: 4.49%
● 3PT Deep Range: 2.50%
● Midrange Shotmaking: 1.00%
● Free Throw: 2.00%
Finishing: 11.44%
● Rim Pressure: 3.66%
● Contact Finishing: 2.29%
● Touch / Craft: 1.37%
● Foul Draw: 2.97%
● Vertical Finishing: 0.57%
● Transition Finishing: 0.57%

Playmaking: 15.60%
● Advantage Creation: 2.81%
● Passing Vision: 2.18%
● Passing Execution: 2.18%
● Advantage Passing: 2.18%
● Transition Playmaking: 1.56%
● Ball Security: 1.56%
● Connector Creation: 3.12%
TOOLS (TKR): 14% TOTAL
● Speed: 5.00%
● Vertical Pop: 1.40%
● Motor: 3.80%
● Endurance: 3.80%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.00%
● Shot Selection Quality: 1.10%
● Advantage Conversion: 1.30%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

MOREYBALL — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 14.08%
● 3PT Spot-Up: 7.74%
● 3PT Movement: 2.11%
● 3PT Pull-Up: 0.70%
● 3PT Deep Range: 1.13%
● Midrange Shotmaking: 0.99%
● Free Throw: 1.41%
Finishing: 22.00%
● Rim Pressure: 6.16%
● Contact Finishing: 5.28%
● Touch / Craft: 2.64%
● Foul Draw: 4.40%
● Vertical Finishing: 2.64%
● Transition Finishing: 0.88%

Playmaking: 7.92%
● Advantage Creation: 0.95%
● Passing Vision: 0.95%
● Passing Execution: 1.43%
● Advantage Passing: 0.95%
● Transition Playmaking: 0.48%
● Ball Security: 0.63%
● Connector Creation: 2.53%
TOOLS (TKR): 18% TOTAL
● Speed: 5.50%
● Vertical Pop: 1.80%
● Motor: 5.30%
● Endurance: 5.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.50%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.50%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

MOREYBALL — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 7.48%
● 3PT Spot-Up: 4.49%
● 3PT Movement: 1.12%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.75%
● Midrange Shotmaking: 0.37%
● Free Throw: 0.75%
Finishing: 21.76%
● Rim Pressure: 4.79%
● Contact Finishing: 6.53%
● Touch / Craft: 2.61%
● Foul Draw: 4.35%
● Vertical Finishing: 3.05%
● Transition Finishing: 0.44%

Playmaking: 4.76%
● Advantage Creation: 0.48%
● Passing Vision: 0.86%
● Passing Execution: 1.05%
● Advantage Passing: 0.86%
● Transition Playmaking: 0.24%
● Ball Security: 0.33%
● Connector Creation: 0.95%
TOOLS (TKR): 20% TOTAL
● Speed: 6.50%
● Vertical Pop: 2.00%
● Motor: 5.50%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.50%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.60%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — NEUTRAL (ALL POSITIONS,
COLLEGE)
HELIOCENTRIC — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 19.04%
● 3PT Spot-Up: 3.81%
● 3PT Movement: 1.90%
● 3PT Pull-Up: 7.62%
● 3PT Deep Range: 2.86%
● Midrange Shotmaking: 1.90%
● Free Throw: 0.95%
Finishing: 8.96%
● Rim Pressure: 3.36%
● Contact Finishing: 1.68%
● Touch / Craft: 0.90%
● Foul Draw: 2.24%
● Vertical Finishing: 0.45%
● Transition Finishing: 0.34%

Playmaking: 28.00%
● Advantage Creation: 9.80%
● Passing Vision: 3.92%
● Passing Execution: 3.92%
● Advantage Passing: 4.20%
● Transition Playmaking: 1.12%
● Ball Security: 3.36%
● Connector Creation: 1.68%
TOOLS (TKR): 10% TOTAL
● Speed: 4.50%
● Vertical Pop: 1.25%
● Motor: 1.75%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 1.50%
● Shot Selection Quality: 2.10%
● Advantage Conversion: 1.80%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 22.04%
● 3PT Spot-Up: 8.12%
● 3PT Movement: 4.64%
● 3PT Pull-Up: 5.80%
● 3PT Deep Range: 1.16%
● Midrange Shotmaking: 1.16%
● Free Throw: 1.16%
Finishing: 10.44%
● Rim Pressure: 2.90%
● Contact Finishing: 2.32%
● Touch / Craft: 1.74%
● Foul Draw: 2.32%
● Vertical Finishing: 0.58%
● Transition Finishing: 0.58%

Playmaking: 25.52%
● Advantage Creation: 8.12%
● Passing Vision: 3.48%
● Passing Execution: 3.48%
● Advantage Passing: 3.48%
● Transition Playmaking: 1.16%
● Ball Security: 3.48%
● Connector Creation: 2.32%
TOOLS (TKR): 12% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.20%
● Motor: 2.80%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.30%
● Shot Selection Quality: 1.40%
● Advantage Conversion: 0.90%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 17.68%
● 3PT Spot-Up: 7.28%
● 3PT Movement: 3.12%
● 3PT Pull-Up: 4.16%
● 3PT Deep Range: 1.04%
● Midrange Shotmaking: 1.04%
● Free Throw: 1.04%
Finishing: 11.44%
● Rim Pressure: 4.16%
● Contact Finishing: 3.12%
● Touch / Craft: 1.56%
● Foul Draw: 1.56%
● Vertical Finishing: 0.52%
● Transition Finishing: 0.52%

Playmaking: 22.88%
● Advantage Creation: 6.24%
● Passing Vision: 3.12%
● Passing Execution: 3.12%
● Advantage Passing: 3.12%
● Transition Playmaking: 1.04%
● Ball Security: 2.08%
● Connector Creation: 4.16%
TOOLS (TKR): 14% TOTAL
● Speed: 4.50%
● Vertical Pop: 1.40%
● Motor: 3.50%
● Endurance: 3.60%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.20%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.00%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 11.44%
● 3PT Spot-Up: 6.16%
● 3PT Movement: 2.20%
● 3PT Pull-Up: 1.32%
● 3PT Deep Range: 0.88%
● Midrange Shotmaking: 0.44%
● Free Throw: 0.44%
Finishing: 14.08%
● Rim Pressure: 4.40%
● Contact Finishing: 3.52%
● Touch / Craft: 2.20%
● Foul Draw: 2.20%
● Vertical Finishing: 1.32%
● Transition Finishing: 0.44%

Playmaking: 18.48%
● Advantage Creation: 2.64%
● Passing Vision: 2.64%
● Passing Execution: 3.52%
● Advantage Passing: 2.64%
● Transition Playmaking: 0.88%
● Ball Security: 1.76%
● Connector Creation: 4.40%
TOOLS (TKR): 18% TOTAL
● Speed: 3.50%
● Vertical Pop: 1.80%
● Motor: 5.50%
● Endurance: 5.20%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.50%
● Role Discipline: 0.30%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 3.40%
● 3PT Spot-Up: 2.04%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.34%
● Free Throw: 0.34%
Finishing: 18.36%
● Rim Pressure: 4.76%
● Contact Finishing: 5.44%
● Touch / Craft: 2.04%
● Foul Draw: 2.72%
● Vertical Finishing: 2.72%
● Transition Finishing: 0.68%

Playmaking: 12.24%
● Advantage Creation: 1.36%
● Passing Vision: 2.04%
● Passing Execution: 2.72%
● Advantage Passing: 2.04%
● Transition Playmaking: 0.68%
● Ball Security: 1.36%
● Connector Creation: 2.04%
TOOLS (TKR): 20% TOTAL
● Speed: 2.50%
● Vertical Pop: 2.00%
● Motor: 7.00%
● Endurance: 7.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

COACH K
COACH K — POINT GUARD (PG)
Buckets: OKR 62 | DKR 24 | TKR 6 | IQKR 8
OFFENSE (OKR): 62
Shooting: 36
● 3PT Spot-Up: 8
● 3PT Movement: 6
● 3PT Pull-Up: 14
● 3PT Deep Range: 7
● Midrange Shotmaking: 0.5
● Free Throw: 0.5
Finishing: 5
● Rim Pressure: 1.5
● Contact Finishing: 0.7
● Touch / Craft: 0.7
● Foul Draw: 1.2
● Vertical Finishing: 0.5
● Transition Finishing: 0.4
Playmaking: 21 (kickouts + 1-second reads, no long holds)
● Advantage Creation: 4.5
● Passing Vision: 3.5
● Passing Execution: 3.5
● Advantage Passing: 4.0
● Transition Playmaking: 3.0
● Ball Security: 1.5
● Connector Creation: 1.0
TOOLS (TKR): 6
● Speed: 2.2
● Vertical Pop: 0.5
● Motor: 1.3
● Endurance: 2.0

IQ (IQKR): 8
● Correct Read Rate: 2.6
● Shot Selection Quality: 2.0
● Advantage Conversion: 2.6
● Role Discipline: 0.8

COACH K — SHOOTING GUARD (SG)
Buckets: OKR 64 | DKR 22 | TKR 8 | IQKR 6
OFFENSE (OKR): 64
Shooting: 40
● 3PT Spot-Up: 14
● 3PT Movement: 8
● 3PT Pull-Up: 10
● 3PT Deep Range: 6
● Midrange Shotmaking: 1
● Free Throw: 1
Finishing: 6
● Rim Pressure: 1.5
● Contact Finishing: 1.2
● Touch / Craft: 0.6
● Foul Draw: 1.7
● Vertical Finishing: 0.5
● Transition Finishing: 0.5
Playmaking: 18 (quick swing decisions)
● Advantage Creation: 3.0
● Passing Vision: 3.0
● Passing Execution: 3.0
● Advantage Passing: 3.5
● Transition Playmaking: 2.5
● Ball Security: 1.5
● Connector Creation: 1.5
TOOLS (TKR): 8
● Speed: 2.8
● Vertical Pop: 0.8
● Motor: 2.0
● Endurance: 2.4
IQ (IQKR): 6
● Correct Read Rate: 1.8
● Shot Selection Quality: 1.2
● Advantage Conversion: 2.4
● Role Discipline: 0.6

COACH K — SMALL FORWARD (SF)
Buckets: OKR 48 | DKR 34 | TKR 10 | IQKR 8
OFFENSE (OKR): 48 (3&D connector wing)
Shooting: 24 (spot-up + deep range)
● 3PT Spot-Up: 10
● 3PT Movement: 4
● 3PT Pull-Up: 2
● 3PT Deep Range: 6
● Midrange Shotmaking: 1
● Free Throw: 1
Finishing: 10 (runouts / cuts / closeout attacks — not self-creation heavy)
● Rim Pressure: 3.0
● Contact Finishing: 2.5
● Touch / Craft: 1.5
● Foul Draw: 2.0
● Vertical Finishing: 0.5
● Transition Finishing: 0.5
Playmaking: 14 (quick reads, swing-swing, 0.5-second decisions)
● Advantage Creation: 1.5
● Passing Vision: 2.5
● Passing Execution: 2.5
● Advantage Passing: 2.5
● Transition Playmaking: 1.5
● Ball Security: 1.0
● Connector Creation: 2.5
TOOLS (TKR): 10
● Speed: 2.5
● Vertical Pop: 1.0
● Motor: 3.0
● Endurance: 3.5
IQ (IQKR): 8 (connector brain)
● Correct Read Rate: 2.0
● Shot Selection Quality: 1.6
● Advantage Conversion: 2.0
● Role Discipline: 2.4

COACH K — POWER FORWARD (PF)
Buckets: OKR 44 | DKR 36 | TKR 12 | IQKR 8
OFFENSE (OKR): 44 (big 3&D wing)
Shooting: 20 (spot-up heavy, deep range valuable)
● 3PT Spot-Up: 10.5
● 3PT Movement: 2.5
● 3PT Pull-Up: 0.8
● 3PT Deep Range: 4.0
● Midrange Shotmaking: 1.2
● Free Throw: 1.0
Finishing: 13 (roll/cut/closeout punish, not iso)
● Rim Pressure: 4.0
● Contact Finishing: 3.5
● Touch / Craft: 1.8
● Foul Draw: 2.0
● Vertical Finishing: 1.2
● Transition Finishing: 0.5
Playmaking: 11 (quick decisions, DHO/extra pass)
● Advantage Creation: 0.8
● Passing Vision: 1.7
● Passing Execution: 2.2
● Advantage Passing: 1.7
● Transition Playmaking: 0.8
● Ball Security: 0.4
● Connector Creation: 3.4
TOOLS (TKR): 12
● Speed: 3.0
● Vertical Pop: 1.2
● Motor: 3.6
● Endurance: 4.2
IQ (IQKR): 8
● Correct Read Rate: 2.0
● Shot Selection Quality: 1.6
● Advantage Conversion: 2.0
● Role Discipline: 2.4

COACH K — CENTER (C)
Buckets: OKR 30 | DKR 48 | TKR 14 | IQKR 8
OFFENSE (OKR): 30 (play finisher + short-roll creator; no self-creation required)
Shooting: 6 (catch & shoot only)
● 3PT Spot-Up: 3.6
● 3PT Movement: 0.4
● 3PT Pull-Up: 0.0
● 3PT Deep Range: 1.2
● Midrange Shotmaking: 0.3
● Free Throw: 0.5
Finishing: 15 (rolls, dump-offs, lobs, touch)
● Rim Pressure: 4.0
● Contact Finishing: 4.0
● Touch / Craft: 2.5
● Foul Draw: 2.0
● Vertical Finishing: 2.0
● Transition Finishing: 0.5
Playmaking: 9 (short-roll reads, quick decisions)
● Advantage Creation: 0.5
● Passing Vision: 1.8
● Passing Execution: 1.8
● Advantage Passing: 1.8
● Transition Playmaking: 0.5
● Ball Security: 0.6
● Connector Creation: 2.0
TOOLS (TKR): 14
● Speed: 2.2
● Vertical Pop: 2.1
● Motor: 4.5
● Endurance: 5.2
IQ (IQKR): 8
● Correct Read Rate: 2.0
● Shot Selection Quality: 1.6
● Advantage Conversion: 2.0
● Role Discipline: 2.4

Defense

CONTAINMENT — NEUTRAL (ALL
POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Defense-only Tools + Defense-only IQ only: Height/Length/Strength/Lateral Quickness +
Decision Speed/Turnover Decision Quality/Processing Under Pressure.)
CONTAINMENT — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
POA Defense: 12.6
● Containment / Angle: 3.6
● Screen Navigation: 2.8
● Closeout & Recovery: 2.0
● Ball Pressure (controlled): 1.4
● Denial / Off-ball Pressure: 1.0
● Deflections / Disruption: 0.9
● Steal Timing: 0.5
● Foul Discipline: 0.4
Team Defense: 11.2
● Help & Rotation: 3.2
● Communication / QB: 2.0
● Low-Man / Tag Responsibility: 2.0
● Rim Protection Support (verticality contests): 1.2
● No-3s Discipline (stunts/recover): 1.8
● Charges / Physicality: 1.0
Rebounding: 4.2
● Defensive Rebounding: 1.8
● Box Outs: 1.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4

TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.0
● Length: 2.5
● Strength: 2.0
● Height: 1.5
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.4
● Processing Under Pressure: 2.0
● Turnover Decision Quality: 1.6

CONTAINMENT — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
POA Defense: 11.2
● Containment / Angle: 3.0
● Screen Navigation: 2.4
● Closeout & Recovery: 2.0
● Ball Pressure (controlled): 1.2
● Denial / Off-ball Pressure: 1.0
● Deflections / Disruption: 0.8
● Steal Timing: 0.4
● Foul Discipline: 0.4
Team Defense: 10.4
● Help & Rotation: 3.0
● Communication / QB: 1.8
● Low-Man / Tag Responsibility: 1.8
● Rim Protection Support: 1.2
● No-3s Discipline (stunts/recover): 1.6
● Charges / Physicality: 1.0
Rebounding: 4.4
● Defensive Rebounding: 2.0
● Box Outs: 1.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.2
● Length: 3.2
● Strength: 2.4
● Height: 2.2
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.6
● Processing Under Pressure: 1.4
● Turnover Decision Quality: 1.0

CONTAINMENT — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
POA Defense: 10.5
● Containment / Angle: 2.6
● Screen Navigation: 1.8
● Closeout & Recovery: 2.6
● Ball Pressure (controlled): 0.9
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.2
Team Defense: 13.5
● Help & Rotation: 4.0
● Communication / QB: 2.4
● Low-Man / Tag Responsibility: 2.8
● Rim Protection Support: 2.0
● No-3s Discipline (stunts/recover): 1.5
● Charges / Physicality: 0.8
Rebounding: 6.0
● Defensive Rebounding: 3.0
● Box Outs: 1.8
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 3.5
● Length: 4.0
● Strength: 3.5
● Height: 3.0
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

CONTAINMENT — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
POA Defense: 10.8
● Containment / Angle: 2.6
● Screen Navigation: 1.4
● Closeout & Recovery: 3.0
● Ball Pressure (controlled): 0.6
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 0.8
● Steal Timing: 0.2
● Foul Discipline: 1.0
Team Defense: 16.2
● Help & Rotation: 4.6
● Communication / QB: 2.8
● Low-Man / Tag Responsibility: 3.8
● Rim Protection Support: 2.6
● No-3s Discipline (stunts/recover): 1.4
● Charges / Physicality: 1.0
Rebounding: 9.0
● Defensive Rebounding: 4.8
● Box Outs: 2.6
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.6
TOOLS (TKR): 18 (defense tools only)
● Height: 4.5
● Length: 4.5
● Strength: 5.0
● Lateral Quickness: 4.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.7
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.5

CONTAINMENT — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
POA Defense: 8.8 (coverage execution, not pressure)
● Containment / Angle (in space): 2.4
● Screen Navigation (coverage): 2.0
● Closeout & Recovery: 1.2
● Deflections / Disruption: 0.6
● Foul Discipline: 2.6
Team Defense: 24.2
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 5.0
● Low-Man / Tag Responsibility: 4.0
● Communication / QB: 3.0
● No-3s Discipline (stunts/recover): 1.6
● Charges / Physicality: 1.6
Rebounding: 11.0
● Defensive Rebounding: 6.2
● Box Outs: 3.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.6
TOOLS (TKR): 20 (defense tools only)
● Height: 6.0
● Length: 6.0
● Strength: 5.0
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

PACK LINE — Neutral (ALL POSITIONS,
COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
PACK LINE — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 14.0
● Help & Rotation: 4.0
● Communication / QB: 2.4
● Low-Man / Tag: 2.6
● Rim Protection Support (verticality contests): 1.4
● No-3s Discipline (stunts/recover): 2.6
● Charges / Physicality: 1.0
POA Defense: 9.8
● Containment / Angle: 2.8
● Screen Navigation: 2.0
● Closeout & Recovery: 1.6
● Ball Pressure (controlled): 0.8
● Denial / Off-ball Pressure: 0.8
● Deflections / Disruption: 0.7
● Steal Timing: 0.3
● Foul Discipline: 0.8
Rebounding: 4.2
● Defensive Rebounding: 1.8
● Box Outs: 1.3
● Rebound Range/Tracking: 0.7
● Hands/Secure: 0.4

TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.0
● Length: 2.5
● Strength: 2.0
● Height: 1.0
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.2
● Processing Under Pressure: 2.2
● Turnover Decision Quality: 1.6

PACK LINE — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 13.0
● Help & Rotation: 3.8
● Communication / QB: 2.1
● Low-Man / Tag: 2.2
● Rim Protection Support: 1.4
● No-3s Discipline (stunts/recover): 2.4
● Charges / Physicality: 1.1
POA Defense: 8.5
● Containment / Angle: 2.4
● Screen Navigation: 1.8
● Closeout & Recovery: 1.6
● Ball Pressure (controlled): 0.6
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 0.5
● Steal Timing: 0.2
● Foul Discipline: 0.8
Rebounding: 4.5
● Defensive Rebounding: 2.0
● Box Outs: 1.4
● Rebound Range/Tracking: 0.7
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.2
● Length: 3.4
● Strength: 2.4
● Height: 2.0
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.4
● Turnover Decision Quality: 1.2

PACK LINE — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 15.0
● Help & Rotation: 4.5
● Communication / QB: 2.4
● Low-Man / Tag: 3.0
● Rim Protection Support: 1.8
● No-3s Discipline (stunts/recover): 2.2
● Charges / Physicality: 1.1
POA Defense: 8.4
● Containment / Angle: 2.0
● Screen Navigation: 1.2
● Closeout & Recovery: 2.0
● Ball Pressure (controlled): 0.5
● Denial / Off-ball Pressure: 1.0
● Deflections / Disruption: 0.9
● Steal Timing: 0.2
● Foul Discipline: 0.6
Rebounding: 6.6
● Defensive Rebounding: 3.4
● Box Outs: 2.0
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 3.8
● Length: 4.2
● Strength: 3.4
● Height: 2.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.2

PACK LINE — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 17.3
● Help & Rotation: 5.0
● Communication / QB: 2.6
● Low-Man / Tag: 4.0
● Rim Protection Support: 3.0
● No-3s Discipline (stunts/recover): 1.7
● Charges / Physicality: 1.0
POA Defense: 7.9
● Containment / Angle: 1.6
● Screen Navigation: 0.8
● Closeout & Recovery: 1.8
● Ball Pressure (controlled): 0.3
● Denial / Off-ball Pressure: 0.8
● Deflections / Disruption: 0.7
● Steal Timing: 0.1
● Foul Discipline: 1.8
Rebounding: 10.8
● Defensive Rebounding: 6.0
● Box Outs: 3.0
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.8
TOOLS (TKR): 18 (defense tools only)
● Height: 4.8
● Length: 4.8
● Strength: 5.4
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

PACK LINE — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 26.4
● Rim Protection / Shot Blocking: 10.0
● Help & Rotation: 6.0
● Low-Man / Tag: 4.5
● Communication / QB: 3.5
● No-3s Discipline (stunts/recover): 1.4
● Charges / Physicality: 1.0
POA Defense: 5.8 (coverage execution, not pressure)
● Containment / Angle (in space): 1.4
● Screen Navigation (coverage): 1.0
● Closeout & Recovery: 0.8
● Ball Pressure (controlled): 0.1
● Denial / Off-ball Pressure: 0.2
● Deflections / Disruption: 0.3
● Steal Timing: 0.0
● Foul Discipline: 2.0
Rebounding: 11.8
● Defensive Rebounding: 7.0
● Box Outs: 3.4
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.6
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

PRESSURE MAN — Neutral (ALL POSITIONS,
COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
PRESSURE MAN — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 12.6
● Help & Rotation: 3.2
● No-3s Discipline (stunts/recover): 3.0
● Low-Man / Tag: 2.2
● Communication / QB: 2.0
● Charges / Physicality: 2.2
POA Defense: 12.6
● Ball Pressure: 3.4
● Screen Navigation: 3.2
● Containment / Angle: 2.2
● Denial / Off-ball Pressure: 1.8
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.8
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 2.8
● Defensive Rebounding: 1.2
● Box Outs: 0.8
● Rebound Range/Tracking: 0.5
● Hands/Secure: 0.3
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.6
● Length: 2.4
● Strength: 1.8
● Height: 1.2

IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.6
● Processing Under Pressure: 2.0
● Turnover Decision Quality: 1.4

PRESSURE MAN — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 11.7
● Help & Rotation: 3.0
● No-3s Discipline (stunts/recover): 2.6
● Low-Man / Tag: 2.0
● Communication / QB: 1.8
● Charges / Physicality: 2.3
POA Defense: 11.7
● Ball Pressure: 2.8
● Screen Navigation: 2.8
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.8
● Closeout & Recovery: 1.0
● Deflections / Disruption: 0.9
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 2.6
● Defensive Rebounding: 1.2
● Box Outs: 0.8
● Rebound Range/Tracking: 0.4
● Hands/Secure: 0.2
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.8
● Length: 3.2
● Strength: 2.4
● Height: 1.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.6
● Processing Under Pressure: 1.4
● Turnover Decision Quality: 1.0

PRESSURE MAN — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 13.8
● Help & Rotation: 3.6
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 2.6
● Communication / QB: 2.2
● Charges / Physicality: 2.6
POA Defense: 12.0
● Ball Pressure: 2.2
● Screen Navigation: 2.2
● Containment / Angle: 2.2
● Denial / Off-ball Pressure: 2.0
● Closeout & Recovery: 1.8
● Deflections / Disruption: 1.2
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 4.2
● Defensive Rebounding: 2.2
● Box Outs: 1.2
● Rebound Range/Tracking: 0.5
● Hands/Secure: 0.3
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 4.2
● Length: 4.2
● Strength: 3.2
● Height: 2.4
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

PRESSURE MAN — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 16.2
● Help & Rotation: 4.0
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 3.8
● Communication / QB: 2.6
● Charges / Physicality: 3.0
POA Defense: 12.6
● Ball Pressure: 1.2
● Screen Navigation: 1.6
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.6
● Closeout & Recovery: 2.6
● Deflections / Disruption: 1.4
● Steal Timing: 0.2
● Foul Discipline: 2.0
Rebounding: 7.2
● Defensive Rebounding: 4.0
● Box Outs: 2.0
● Rebound Range/Tracking: 0.7
● Hands/Secure: 0.5
TOOLS (TKR): 18 (defense tools only)
● Height: 4.8
● Length: 4.8
● Strength: 5.4
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

PRESSURE MAN — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 24.2
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 5.0
● Low-Man / Tag: 4.0
● Communication / QB: 3.0
● No-3s Discipline (stunts/recover): 1.2
● Charges / Physicality: 2.0
POA Defense: 6.6 (coverage execution, not pressure)
● Screen Navigation (coverage): 1.6
● Containment / Angle (in space): 2.0
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.4
● Foul Discipline: 1.8
Rebounding: 13.2
● Defensive Rebounding: 7.6
● Box Outs: 3.6
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.0
● Length: 6.0
● Strength: 5.5
● Lateral Quickness: 2.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

SWITCH — Neutral (ALL POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
SWITCH — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
POA Defense: 12.6
● Containment / Angle: 3.0
● Screen Navigation: 2.0
● Closeout & Recovery: 2.4
● Ball Pressure (controlled): 1.0
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 1.0
● Steal Timing: 0.6
● Foul Discipline: 1.4
Team Defense: 10.6
● Communication / QB (switch calls): 3.0
● Help & Rotation: 2.0
● No-3s Discipline (stunts/recover): 2.4
● Low-Man / Tag: 1.6
● Rim Protection Support: 0.8
● Charges / Physicality: 0.8
Rebounding: 4.8
● Defensive Rebounding: 2.2
● Box Outs: 1.4
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.5
● Length: 2.5
● Strength: 2.0
● Height: 1.0

IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.6
● Processing Under Pressure: 2.0
● Turnover Decision Quality: 1.4

SWITCH — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
POA Defense: 10.4
● Containment / Angle: 2.4
● Screen Navigation: 1.6
● Closeout & Recovery: 2.4
● Ball Pressure (controlled): 0.8
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 0.8
● Steal Timing: 0.4
● Foul Discipline: 0.8
Team Defense: 9.6
● Communication / QB (switch calls): 2.8
● Help & Rotation: 1.6
● No-3s Discipline (stunts/recover): 2.2
● Low-Man / Tag: 1.4
● Rim Protection Support: 0.8
● Charges / Physicality: 0.8
Rebounding: 6.0
● Defensive Rebounding: 3.0
● Box Outs: 1.8
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.2
● Length: 3.4
● Strength: 2.4
● Height: 2.0
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.6
● Processing Under Pressure: 1.4
● Turnover Decision Quality: 1.0

SWITCH — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
POA Defense: 10.5
● Containment / Angle: 2.6
● Screen Navigation: 1.4
● Closeout & Recovery: 2.8
● Ball Pressure (controlled): 0.6
● Denial / Off-ball Pressure: 1.6
● Deflections / Disruption: 1.0
● Steal Timing: 0.4
● Foul Discipline: 0.1
Team Defense: 10.5
● Communication / QB (switch calls): 3.2
● Help & Rotation: 1.6
● No-3s Discipline (stunts/recover): 2.4
● Low-Man / Tag: 1.4
● Rim Protection Support: 0.8
● Charges / Physicality: 1.1
Rebounding: 9.0
● Defensive Rebounding: 5.0
● Box Outs: 2.6
● Rebound Range/Tracking: 0.9
● Hands/Secure: 0.5
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 3.8
● Length: 4.2
● Strength: 3.4
● Height: 2.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

SWITCH — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
POA Defense: 10.8
● Containment / Angle: 2.6
● Screen Navigation: 0.8
● Closeout & Recovery: 3.2
● Ball Pressure (controlled): 0.3
● Denial / Off-ball Pressure: 1.6
● Deflections / Disruption: 0.7
● Steal Timing: 0.1
● Foul Discipline: 1.5
Team Defense: 12.6
● Communication / QB (switch calls): 3.8
● Help & Rotation: 2.0
● No-3s Discipline (stunts/recover): 2.4
● Low-Man / Tag: 2.0
● Rim Protection Support: 1.2
● Charges / Physicality: 1.2
Rebounding: 12.6
● Defensive Rebounding: 7.2
● Box Outs: 3.4
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 18 (defense tools only)
● Height: 4.8
● Length: 4.8
● Strength: 5.4
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

SWITCH — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
POA Defense: 8.8 (switch survive / contain in space)
● Containment / Angle (in space): 3.0
● Screen Navigation (switch coverage): 2.0
● Closeout & Recovery: 1.4
● Deflections / Disruption: 0.4
● Foul Discipline: 2.0
Team Defense: 17.6
● Communication / QB (switch calls): 5.0
● Help & Rotation: 3.6
● Low-Man / Tag: 3.2
● No-3s Discipline (stunts/recover): 2.2
● Rim Protection Support: 2.4
● Charges / Physicality: 1.2
Rebounding: 17.6
● Defensive Rebounding: 10.2
● Box Outs: 5.0
● Rebound Range/Tracking: 1.6
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.0
● Length: 6.0
● Strength: 5.0
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

NO-MIDDLE — Neutral (ALL POSITIONS,
COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
NO-MIDDLE — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
POA Defense: 12.6 (angle + contain + ICE discipline)
● Containment / Angle (no-middle): 4.0
● Screen Navigation: 2.6
● Closeout & Recovery: 1.8
● Ball Pressure (controlled): 1.0
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 0.8
● Steal Timing: 0.4
● Foul Discipline: 1.4
Team Defense: 11.2 (gap, tags, rotations, “low-man”)
● Help & Rotation: 3.4
● No-3s Discipline (stunts/recover): 2.4
● Low-Man / Tag: 2.4
● Communication / QB: 2.0
● Rim Protection Support: 0.6
● Charges / Physicality: 0.4
Rebounding: 4.2
● Defensive Rebounding: 1.8
● Box Outs: 1.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.2
● Length: 2.4
● Strength: 1.8

● Height: 1.6
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.2
● Processing Under Pressure: 2.4
● Turnover Decision Quality: 1.4

NO-MIDDLE — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
POA Defense: 10.4
● Containment / Angle (no-middle): 3.2
● Screen Navigation: 2.2
● Closeout & Recovery: 1.8
● Ball Pressure (controlled): 0.8
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 0.6
● Steal Timing: 0.2
● Foul Discipline: 1.0
Team Defense: 10.4
● Help & Rotation: 3.2
● No-3s Discipline (stunts/recover): 2.2
● Low-Man / Tag: 2.0
● Communication / QB: 1.8
● Rim Protection Support: 0.8
● Charges / Physicality: 0.4
Rebounding: 5.2
● Defensive Rebounding: 2.4
● Box Outs: 1.4
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.4
● Length: 3.2
● Strength: 2.2
● Height: 2.2
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

NO-MIDDLE — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
POA Defense: 10.5
● Containment / Angle (no-middle): 2.8
● Screen Navigation: 1.6
● Closeout & Recovery: 2.8
● Ball Pressure (controlled): 0.6
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 1.0
● Steal Timing: 0.1
● Foul Discipline: 0.4
Team Defense: 13.5
● Help & Rotation: 4.0
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 3.0
● Communication / QB: 2.2
● Rim Protection Support: 1.1
● Charges / Physicality: 0.4
Rebounding: 6.0
● Defensive Rebounding: 3.0
● Box Outs: 1.8
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 3.8
● Length: 4.2
● Strength: 3.4
● Height: 2.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 1.0

NO-MIDDLE — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
POA Defense: 10.8
● Containment / Angle (no-middle): 2.4
● Screen Navigation: 0.8
● Closeout & Recovery: 3.0
● Ball Pressure (controlled): 0.3
● Denial / Off-ball Pressure: 1.6
● Deflections / Disruption: 0.7
● Steal Timing: 0.1
● Foul Discipline: 1.9
Team Defense: 16.2
● Help & Rotation: 4.8
● No-3s Discipline (stunts/recover): 3.0
● Low-Man / Tag: 4.0
● Communication / QB: 2.4
● Rim Protection Support: 1.6
● Charges / Physicality: 0.4
Rebounding: 9.0
● Defensive Rebounding: 5.0
● Box Outs: 2.6
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.4
TOOLS (TKR): 18 (defense tools only)
● Height: 4.8
● Length: 4.8
● Strength: 5.4
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

NO-MIDDLE — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
POA Defense: 6.6 (coverage + contain at level, no-middle angles)
● Containment / Angle (in space): 2.0
● Screen Navigation (coverage): 1.6
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.2
● Foul Discipline: 2.0
Team Defense: 25.3
● Rim Protection / Shot Blocking: 9.5
● Help & Rotation: 5.5
● Low-Man / Tag: 4.5
● Communication / QB: 3.5
● No-3s Discipline (stunts/recover): 1.8
● Charges / Physicality: 0.5
Rebounding: 12.1
● Defensive Rebounding: 7.0
● Box Outs: 3.6
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.5
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

ZONE — Neutral (ALL POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
ZONE — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 14.0
● Help & Rotation: 4.2
● No-3s Discipline (zone closeouts): 3.2
● Communication / QB: 3.0
● Low-Man / Tag: 2.2
● Rim Protection Support: 0.8
● Charges / Physicality: 0.6
POA Defense: 8.4 (less on-ball; more closeouts/contain in space)
● Closeout & Recovery: 2.8
● Containment / Angle: 2.0
● Screen Navigation: 0.6
● Ball Pressure: 0.6
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 1.2
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 5.6 (zone = gang rebound requirement)
● Defensive Rebounding: 2.4
● Box Outs: 1.8
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)
● Height: 2.0
● Length: 3.0
● Strength: 2.0
● Lateral Quickness: 3.0

IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.0
● Processing Under Pressure: 2.4
● Turnover Decision Quality: 1.6

ZONE — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 13.0
● Help & Rotation: 3.8
● No-3s Discipline (zone closeouts): 2.8
● Communication / QB: 2.6
● Low-Man / Tag: 2.0
● Rim Protection Support: 1.0
● Charges / Physicality: 0.8
POA Defense: 6.5
● Closeout & Recovery: 2.0
● Containment / Angle: 1.6
● Screen Navigation: 0.4
● Ball Pressure: 0.4
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.0
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 6.5
● Defensive Rebounding: 3.0
● Box Outs: 2.0
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.5
TOOLS (TKR): 12 (defense tools only)
● Height: 2.4
● Length: 3.6
● Strength: 2.4
● Lateral Quickness: 3.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.2

ZONE — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 15.6
● Help & Rotation: 4.4
● No-3s Discipline (zone closeouts): 3.2
● Communication / QB: 3.0
● Low-Man / Tag: 2.8
● Rim Protection Support: 1.2
● Charges / Physicality: 1.0
POA Defense: 6.0
● Closeout & Recovery: 2.0
● Containment / Angle: 1.4
● Screen Navigation: 0.4
● Ball Pressure: 0.3
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 8.4
● Defensive Rebounding: 4.2
● Box Outs: 2.6
● Rebound Range/Tracking: 1.1
● Hands/Secure: 0.5
TOOLS (TKR): 14 (defense tools only)
● Height: 2.8
● Length: 4.2
● Strength: 3.5
● Lateral Quickness: 3.5
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.0
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 1.2

ZONE — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 19.8
● Help & Rotation: 5.6
● No-3s Discipline (zone closeouts): 3.8
● Communication / QB: 3.2
● Low-Man / Tag: 4.0
● Rim Protection Support: 2.2
● Charges / Physicality: 1.0
POA Defense: 5.4
● Closeout & Recovery: 1.8
● Containment / Angle: 1.2
● Screen Navigation: 0.3
● Ball Pressure: 0.2
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 10.8
● Defensive Rebounding: 6.0
● Box Outs: 3.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.6
TOOLS (TKR): 18 (defense tools only)
● Height: 4.5
● Length: 5.0
● Strength: 5.0
● Lateral Quickness: 3.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

ZONE — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 26.4
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 6.0
● Low-Man / Tag: 4.5
● Communication / QB: 3.5
● No-3s Discipline (zone closeouts): 2.4
● Charges / Physicality: 1.0
POA Defense: 3.6 (minimal; mostly closeouts in space)
● Closeout & Recovery: 1.2
● Containment / Angle: 0.8
● Screen Navigation: 0.2
● Ball Pressure: 0.1
● Denial / Off-ball Pressure: 0.2
● Deflections / Disruption: 0.6
● Steal Timing: 0.1
● Foul Discipline: 0.4
Rebounding: 14.0
● Defensive Rebounding: 8.0
● Box Outs: 4.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.4
● Processing Under Pressure: 1.0
● Turnover Decision Quality: 0.6

MATCHUP ZONE — Neutral (ALL POSITIONS,
COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
MATCHUP ZONE — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 14.0
● Help & Rotation: 3.6
● No-3s Discipline (matchup closeouts): 3.2
● Communication / QB: 3.0
● Low-Man / Tag: 2.4
● Rim Protection Support: 1.0
● Charges / Physicality: 0.8
POA Defense: 9.8 (more man principles than pure zone)
● Closeout & Recovery: 2.8
● Containment / Angle: 2.4
● Screen Navigation: 1.0
● Ball Pressure: 0.8
● Denial / Off-ball Pressure: 0.8
● Deflections / Disruption: 1.0
● Steal Timing: 0.6
● Foul Discipline: 0.4
Rebounding: 4.2
● Defensive Rebounding: 1.8
● Box Outs: 1.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)

● Height: 2.0
● Length: 3.0
● Strength: 2.0
● Lateral Quickness: 3.0
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.0
● Processing Under Pressure: 2.4
● Turnover Decision Quality: 1.6

MATCHUP ZONE — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 13.0
● Help & Rotation: 3.4
● No-3s Discipline (matchup closeouts): 2.8
● Communication / QB: 2.6
● Low-Man / Tag: 2.2
● Rim Protection Support: 1.2
● Charges / Physicality: 0.8
POA Defense: 7.8
● Closeout & Recovery: 2.0
● Containment / Angle: 2.0
● Screen Navigation: 0.8
● Ball Pressure: 0.6
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 1.0
● Steal Timing: 0.6
● Foul Discipline: 0.2
Rebounding: 5.2
● Defensive Rebounding: 2.4
● Box Outs: 1.6
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Height: 2.4
● Length: 3.6
● Strength: 2.4
● Lateral Quickness: 3.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.2

MATCHUP ZONE — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 15.6
● Help & Rotation: 4.0
● No-3s Discipline (matchup closeouts): 3.0
● Communication / QB: 3.0
● Low-Man / Tag: 3.0
● Rim Protection Support: 1.6
● Charges / Physicality: 1.0
POA Defense: 6.6
● Closeout & Recovery: 1.8
● Containment / Angle: 1.6
● Screen Navigation: 0.6
● Ball Pressure: 0.3
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.2
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 7.8
● Defensive Rebounding: 4.0
● Box Outs: 2.4
● Rebound Range/Tracking: 0.9
● Hands/Secure: 0.5
TOOLS (TKR): 14 (defense tools only)
● Height: 2.8
● Length: 4.2
● Strength: 3.5
● Lateral Quickness: 3.5
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.0
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 1.2

MATCHUP ZONE — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 19.8
● Help & Rotation: 5.2
● No-3s Discipline (matchup closeouts): 3.6
● Communication / QB: 3.2
● Low-Man / Tag: 4.4
● Rim Protection Support: 2.4
● Charges / Physicality: 1.0
POA Defense: 5.4
● Closeout & Recovery: 1.6
● Containment / Angle: 1.2
● Screen Navigation: 0.3
● Ball Pressure: 0.2
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.2
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 10.8
● Defensive Rebounding: 6.0
● Box Outs: 3.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.6
TOOLS (TKR): 18 (defense tools only)
● Height: 4.5
● Length: 5.0
● Strength: 5.0
● Lateral Quickness: 3.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

MATCHUP ZONE — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 26.4
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 6.0
● Low-Man / Tag: 4.8
● Communication / QB: 3.6
● No-3s Discipline (matchup closeouts): 2.2
● Charges / Physicality: 0.8
POA Defense: 4.4
● Closeout & Recovery: 1.2
● Containment / Angle: 0.8
● Screen Navigation: 0.4
● Ball Pressure: 0.1
● Denial / Off-ball Pressure: 0.2
● Deflections / Disruption: 1.2
● Steal Timing: 0.1
● Foul Discipline: 0.4
Rebounding: 13.2
● Defensive Rebounding: 7.6
● Box Outs: 3.8
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.4
● Processing Under Pressure: 1.0
● Turnover Decision Quality: 0.6

FULL-COURT PRESS — Neutral (ALL
POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
FULL-COURT PRESS — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
POA Defense: 14.0 (pressure + disruption + turn creation)
● Ball Pressure: 4.0
● Screen Navigation: 2.2
● Containment / Angle: 1.6
● Denial / Off-ball Pressure: 2.0
● Closeout & Recovery: 0.8
● Deflections / Disruption: 1.6
● Steal Timing: 1.2
● Foul Discipline: 0.6
Team Defense: 9.8 (scramble rotations + no-threes in chaos)
● Help & Rotation: 2.8
● No-3s Discipline (stunts/recover): 2.0
● Low-Man / Tag: 1.4
● Communication / QB: 1.6
● Rim Protection Support: 0.6
● Charges / Physicality: 1.4
Rebounding: 4.2
● Defensive Rebounding: 1.6
● Box Outs: 1.2
● Rebound Range/Tracking: 0.9
● Hands/Secure: 0.5
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.8
● Length: 2.4
● Strength: 1.6

● Height: 1.2
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.6
● Processing Under Pressure: 2.2
● Turnover Decision Quality: 1.2

FULL-COURT PRESS — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
POA Defense: 12.0
● Ball Pressure: 3.2
● Screen Navigation: 1.8
● Containment / Angle: 1.4
● Denial / Off-ball Pressure: 1.8
● Closeout & Recovery: 0.8
● Deflections / Disruption: 1.4
● Steal Timing: 0.8
● Foul Discipline: 0.8
Team Defense: 9.1
● Help & Rotation: 2.6
● No-3s Discipline (stunts/recover): 1.8
● Low-Man / Tag: 1.4
● Communication / QB: 1.4
● Rim Protection Support: 0.7
● Charges / Physicality: 1.2
Rebounding: 4.9
● Defensive Rebounding: 2.0
● Box Outs: 1.6
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.5
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.6
● Length: 3.2
● Strength: 2.2
● Height: 2.0
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.6
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 0.8

FULL-COURT PRESS — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
POA Defense: 12.0
● Ball Pressure: 2.0
● Screen Navigation: 1.6
● Containment / Angle: 1.6
● Denial / Off-ball Pressure: 2.0
● Closeout & Recovery: 1.4
● Deflections / Disruption: 2.0
● Steal Timing: 0.8
● Foul Discipline: 0.6
Team Defense: 11.4
● Help & Rotation: 3.4
● No-3s Discipline (stunts/recover): 2.2
● Low-Man / Tag: 2.0
● Communication / QB: 2.0
● Rim Protection Support: 0.8
● Charges / Physicality: 1.0
Rebounding: 6.6
● Defensive Rebounding: 3.2
● Box Outs: 2.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 4.4
● Length: 4.2
● Strength: 3.0
● Height: 2.4
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 0.8

FULL-COURT PRESS — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
POA Defense: 10.8 (traps/scramble, not true POA pressure)
● Ball Pressure: 1.0
● Screen Navigation: 1.0
● Containment / Angle: 1.6
● Denial / Off-ball Pressure: 1.6
● Closeout & Recovery: 2.2
● Deflections / Disruption: 2.0
● Steal Timing: 0.4
● Foul Discipline: 1.0
Team Defense: 15.1
● Help & Rotation: 4.4
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 3.8
● Communication / QB: 2.6
● Rim Protection Support: 0.9
● Charges / Physicality: 0.6
Rebounding: 10.1
● Defensive Rebounding: 5.6
● Box Outs: 3.0
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.5
TOOLS (TKR): 18 (defense tools only)
● Height: 4.6
● Length: 4.6
● Strength: 5.2
● Lateral Quickness: 3.6
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.7
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.5

FULL-COURT PRESS — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
POA Defense: 6.6 (press backline: contain + discipline)
● Containment / Angle (in space): 2.0
● Screen Navigation (coverage): 1.2
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.4
● Foul Discipline: 2.2
Team Defense: 24.2
● Rim Protection / Shot Blocking: 8.5
● Help & Rotation: 5.5
● Low-Man / Tag: 4.0
● Communication / QB: 3.2
● No-3s Discipline (stunts/recover): 1.5
● Charges / Physicality: 1.5
Rebounding: 13.2
● Defensive Rebounding: 7.4
● Box Outs: 3.8
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.0
● Length: 6.0
● Strength: 5.5
● Lateral Quickness: 2.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

JUNK — Neutral (ALL POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
JUNK — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 14.0 (game-plan execution + rotations)
● Help & Rotation: 3.6
● No-3s Discipline (deny/top-lock): 2.8
● Communication / QB: 3.0
● Low-Man / Tag: 2.2
● Rim Protection Support: 1.0
● Charges / Physicality: 1.4
POA Defense: 8.4 (situational stops, not constant pressure)
● Containment / Angle: 2.2
● Closeout & Recovery: 2.0
● Denial / Off-ball Pressure: 1.2
● Ball Pressure: 0.8
● Screen Navigation: 0.6
● Deflections / Disruption: 1.0
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 5.6
● Defensive Rebounding: 2.4
● Box Outs: 1.8
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)
● Height: 2.0
● Length: 3.0
● Strength: 2.0
● Lateral Quickness: 3.0

IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.2
● Processing Under Pressure: 2.4
● Turnover Decision Quality: 1.4

JUNK — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 13.0
● Help & Rotation: 3.2
● No-3s Discipline (deny/top-lock): 2.6
● Communication / QB: 2.6
● Low-Man / Tag: 2.2
● Rim Protection Support: 1.2
● Charges / Physicality: 1.2
POA Defense: 6.5
● Containment / Angle: 1.6
● Closeout & Recovery: 1.8
● Denial / Off-ball Pressure: 0.8
● Ball Pressure: 0.6
● Screen Navigation: 0.4
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.1
Rebounding: 6.5
● Defensive Rebounding: 3.0
● Box Outs: 2.0
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.5
TOOLS (TKR): 12 (defense tools only)
● Height: 2.4
● Length: 3.6
● Strength: 2.4
● Lateral Quickness: 3.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

JUNK — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 15.6
● Help & Rotation: 3.8
● No-3s Discipline (deny/top-lock): 3.0
● Communication / QB: 3.0
● Low-Man / Tag: 3.0
● Rim Protection Support: 1.8
● Charges / Physicality: 1.0
POA Defense: 6.0
● Containment / Angle: 1.4
● Closeout & Recovery: 1.8
● Denial / Off-ball Pressure: 0.8
● Ball Pressure: 0.3
● Screen Navigation: 0.4
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.1
Rebounding: 8.4
● Defensive Rebounding: 4.2
● Box Outs: 2.6
● Rebound Range/Tracking: 1.1
● Hands/Secure: 0.5
TOOLS (TKR): 14 (defense tools only)
● Height: 2.8
● Length: 4.2
● Strength: 3.5
● Lateral Quickness: 3.5
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 1.0

JUNK — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 19.8
● Help & Rotation: 5.0
● No-3s Discipline (deny/top-lock): 3.6
● Communication / QB: 3.2
● Low-Man / Tag: 4.4
● Rim Protection Support: 2.6
● Charges / Physicality: 1.0
POA Defense: 5.4
● Containment / Angle: 1.2
● Closeout & Recovery: 1.6
● Denial / Off-ball Pressure: 0.6
● Ball Pressure: 0.2
● Screen Navigation: 0.3
● Deflections / Disruption: 1.2
● Steal Timing: 0.2
● Foul Discipline: 0.1
Rebounding: 10.8
● Defensive Rebounding: 6.0
● Box Outs: 3.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.6
TOOLS (TKR): 18 (defense tools only)
● Height: 4.5
● Length: 5.0
● Strength: 5.0
● Lateral Quickness: 3.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

JUNK — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 26.4
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 5.8
● Low-Man / Tag: 5.0
● Communication / QB: 3.6
● No-3s Discipline (deny/top-lock): 2.0
● Charges / Physicality: 1.0
POA Defense: 3.6
● Closeout & Recovery: 1.0
● Containment / Angle: 0.8
● Screen Navigation: 0.2
● Ball Pressure: 0.1
● Denial / Off-ball Pressure: 0.3
● Deflections / Disruption: 0.8
● Steal Timing: 0.1
● Foul Discipline: 0.3
Rebounding: 14.0
● Defensive Rebounding: 8.0
● Box Outs: 4.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.4
● Processing Under Pressure: 1.0
● Turnover Decision Quality: 0.6

COACH K
COACH K — POINT GUARD (PG)
Buckets: OKR 62 | DKR 24 | TKR 6 | IQKR 8
DEFENSE (DKR): 24
Team Defense: 10.8
● Help & Rotation: 3.0
● No-3s Discipline (stunts/recover): 3.0
● Low-Man / Tag: 2.0
● Communication / QB: 1.6
● Charges / Physicality: 1.2
POA Defense: 9.6
● Ball Pressure: 2.0
● Screen Navigation: 2.4
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.2
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.6
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 3.6
● Defensive Rebounding: 1.6
● Box Outs: 1.0
● Rebound Range/Tracking: 0.6
● Hands/Secure: 0.4
TOOLS (TKR): 6 (defense tools only)
● Lateral Quickness: 3.2
● Length: 1.3
● Strength: 1.0
● Height: 0.5
IQ (IQKR): 8 (defense IQ only)
● Decision Speed: 3.2
● Processing Under Pressure: 2.6
● Turnover Decision Quality: 2.2

COACH K — SHOOTING GUARD (SG)
Buckets: OKR 64 | DKR 22 | TKR 8 | IQKR 6
DEFENSE (DKR): 22
Team Defense: 9.9
● Help & Rotation: 2.6
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 1.8
● Communication / QB: 1.5
● Charges / Physicality: 1.2
POA Defense: 8.8
● Ball Pressure: 1.6
● Screen Navigation: 2.0
● Containment / Angle: 1.8
● Denial / Off-ball Pressure: 1.2
● Closeout & Recovery: 1.0
● Deflections / Disruption: 0.6
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 3.3
● Defensive Rebounding: 1.4
● Box Outs: 1.0
● Rebound Range/Tracking: 0.6
● Hands/Secure: 0.3
TOOLS (TKR): 8 (defense tools only)
● Lateral Quickness: 3.2
● Length: 2.2
● Strength: 1.8
● Height: 0.8
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.2
● Processing Under Pressure: 2.0
● Turnover Decision Quality: 1.8

COACH K — SMALL FORWARD (SF)
Buckets: OKR 48 | DKR 34 | TKR 10 | IQKR 8
DEFENSE (DKR): 34
Team Defense: 15.3
● Help & Rotation: 4.0
● No-3s Discipline (stunts/recover): 4.0
● Low-Man / Tag: 3.0
● Communication / QB: 2.2
● Charges / Physicality: 2.1
POA Defense: 11.9
● Ball Pressure: 1.6
● Screen Navigation: 1.8
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.6
● Closeout & Recovery: 2.2
● Deflections / Disruption: 1.3
● Steal Timing: 0.8
● Foul Discipline: 0.6
Rebounding: 6.8
● Defensive Rebounding: 3.4
● Box Outs: 2.0
● Rebound Range/Tracking: 0.9
● Hands/Secure: 0.5
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 3.0
● Length: 3.0
● Strength: 2.5
● Height: 1.5
IQ (IQKR): 8 (defense IQ only)
● Decision Speed: 2.8
● Processing Under Pressure: 3.0
● Turnover Decision Quality: 2.2
COACH K — POWER FORWARD (PF)

Buckets: OKR 44 | DKR 36 | TKR 12 | IQKR 8
DEFENSE (DKR): 36
Team Defense: 18.0
● Help & Rotation: 5.0
● No-3s Discipline (stunts/recover): 4.0
● Low-Man / Tag: 4.0
● Communication / QB: 2.6
● Charges / Physicality: 2.4
POA Defense: 12.6
● Ball Pressure: 1.0
● Screen Navigation: 1.4
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.4
● Closeout & Recovery: 2.6
● Deflections / Disruption: 1.6
● Steal Timing: 0.6
● Foul Discipline: 2.0
Rebounding: 5.4
● Defensive Rebounding: 2.8
● Box Outs: 1.6
● Rebound Range/Tracking: 0.6
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 2.4
● Length: 3.6
● Strength: 3.6
● Height: 2.4
IQ (IQKR): 8 (defense IQ only)
● Decision Speed: 2.6
● Processing Under Pressure: 3.0
● Turnover Decision Quality: 2.4
COACH K — CENTER (C)

Buckets: OKR 30 | DKR 48 | TKR 14 | IQKR 8
DEFENSE (DKR): 48
Team Defense: 28.8
● Rim Protection / Shot Blocking: 10.0
● Help & Rotation: 5.5
● Communication / QB: 4.3
● No-3s Discipline (stunts/recover): 3.5
● Low-Man / Tag: 3.5
● Charges / Physicality: 2.0
POA Defense: 7.2 (coverage + contain in space, not pressure)
● Screen Navigation (coverage execution): 1.2
● Containment / Angle: 1.6
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.6
● Foul Discipline: 3.0
Rebounding: 12.0
● Defensive Rebounding: 6.8
● Box Outs: 3.2
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 14 (defense tools only)
● Height: 4.0
● Length: 4.5
● Strength: 3.5
● Lateral Quickness: 2.0
IQ (IQKR): 8 (defense IQ only)
● Decision Speed: 2.0
● Processing Under Pressure: 3.2
● Turnover Decision Quality: 2.8



# BADGES

Badges

BADGES — COLLEGE v1 (LOCKED)
Bronze: +0.5 KR
Silver: +1.0 KR
Gold: +1.5 KR
Total badge lift cap: +3.5 KR
Badge KR Lift Meaning (College v1)
Level
Bronze +0.5 High-major weapon (certified advantage skill)
Silver +1.0 High-major major-weapon (reliable schematic edge)
Gold +1.5 Elite high-major weapon (outlier skill that drives game plans)
Global Tier Gates (once)
● Bronze: Skill KR ≥ 90 AND each required trait ≥ 90
● Silver: Skill KR ≥ 94 AND each required trait ≥ 94
● Gold: Skill KR ≥ 97 AND each required trait ≥ 97
● Data-layer rule: each required trait must be scored (non-null) in the active layer
PRO — Global Tier Gates (once)
Bronze: Skill KR ≥ 93 AND each required trait ≥ 93
Silver: Skill KR ≥ 96 AND each required trait ≥ 96
Gold: Skill KR ≥ 98 AND each required trait ≥ 98

SHOOTING BADGES — COLLEGE v1 (gates only; uses Global Tier Gates)
1) Spot-Up Sniper
● Skill KR gate: Shooting KR
● Required traits: 3PT Spot-Up
● Tools gates: none
● Data-layer gate: 3PT Spot-Up must be scored (non-null)
○ Box-score: OK if scored via PROXY
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Movement Shooter
● Skill KR gate: Shooting KR
● Required traits: 3PT Movement
● Tools gates: none
● Data-layer gate: 3PT Movement must be scored (non-null)
○ Box-score: only if your box-score layer actually scores it (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Pull-Up Shotmaker
● Skill KR gate: Shooting KR
● Required traits: 3PT Pull-Up, Midrange Shotmaking
● Tools gates: none
● Data-layer gate: both traits must be scored (non-null) in the active data layer
○ Box-score: only if both are scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Limitless Range
● Skill KR gate: Shooting KR
● Required traits: 3PT Deep Range
● Tools gates: none
● Data-layer gate: 3PT Deep Range must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
5) Free Throw Bank
● Skill KR gate: Shooting KR
● Required traits: Free Throw
● Tools gates: none
● Data-layer gate: Free Throw must be scored (non-null)
○ Box-score: yes (standard)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

FINISHING BADGES — COLLEGE v1 (gates only; uses Global Tier Gates)
1) Rim Pressure
● Skill KR gate: Finishing KR
● Required traits: Rim Pressure
● Tools gates: none
● Data-layer gate: Rim Pressure must be scored (non-null)
○ Box-score: OK if scored via PROXY
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Whistle
● Skill KR gate: Finishing KR
● Required traits: Foul Draw, Rim Pressure
● Tools gates: none
● Data-layer gate: both traits must be scored (non-null) in the active data layer
○ Box-score: OK only if both are scored in box-score (Rim Pressure via PROXY is
fine; Foul Draw must also be scored/non-null)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Fearless Finisher
● Skill KR gate: Finishing KR
● Required traits: Contact Finishing
● Tools gates: Strength (gate, not a trait)
● Data-layer gate:
○ Contact Finishing must be scored (non-null)
○ Strength must be scored (non-null)
○ Box-score: eligible only if Contact Finishing + Strength are both scored in
box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Vertical Finisher
● Skill KR gate: Finishing KR
● Required traits: Vertical Finishing
● Tools gates: none
● Data-layer gate: Vertical Finishing must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

5) Touch Artist
● Skill KR gate: Finishing KR
● Required traits: Touch / Craft
● Tools gates: none
● Data-layer gate: Touch / Craft must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
PLAYMAKING BADGES — COLLEGE v1 (gates only; uses Global Tier
Gates)
1) Advantage Creator
● Skill KR gate: Playmaking KR
● Required traits: Advantage Creation
● Tools gates: none
● Data-layer gate: Advantage Creation must be scored (non-null)
○ Box-score: only if scored in box-score
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Dimer
● Skill KR gate: Playmaking KR
● Required traits: Passing Execution
● Tools gates: none
● Data-layer gate: Passing Execution must be scored (non-null)
○ Box-score: OK if your box-score layer scores it (common)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Needle Threader
● Skill KR gate: Playmaking KR
● Required traits: Advantage Passing
● Tools gates: none
● Data-layer gate: Advantage Passing must be scored (non-null)
○ Box-score: only if scored in box-score
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

4) Floor General
● Skill KR gate: Playmaking KR
● Required traits (base): Passing Vision
● Additional required traits: Correct Read Rate (IQ trait gate for top tiers)
● Tools gates: none
● Data-layer gate: required traits must be scored (non-null) in the active data layer:
○ Bronze tier: Passing Vision must be scored (non-null)
○ Silver/Gold tiers: Passing Vision and Correct Read Rate must both be scored
(non-null)
○ Box-score: only eligible if those traits are scored in box-score (usually not for
Correct Read Rate)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
5) Ball Security
● Skill KR gate: Playmaking KR
● Required traits: Ball Security
● Tools gates: none
● Data-layer gate: Ball Security must be scored (non-null)
○ Box-score: OK if your box-score layer scores it (common)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

POA DEFENSE BADGES — COLLEGE v1 (gates only; uses Global Tier
Gates)
1) Clamps
● Skill KR gate: POA Defense KR
● Required traits: Containment, Ball Pressure
● Tools gates: none
● Data-layer gate: both traits must be scored (non-null) in the active data layer
○ Box-score: eligible only if both are scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Screen Navigator
● Skill KR gate: POA Defense KR
● Required traits: Screen Navigation
● Tools gates: none
● Data-layer gate: Screen Navigation must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Interceptor
● Skill KR gate: POA Defense KR
● Required traits: Deflections
● Tools gates: none
● Data-layer gate: Deflections must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Ball Hawk
● Skill KR gate: POA Defense KR
● Required traits: Steal Timing
● Tools gates: none
● Data-layer gate: Steal Timing must be scored (non-null)
○ Box-score: eligible only if your box-score layer scores Steal Timing (often yes via
steals proxy)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

5) Discipline
● Skill KR gate: POA Defense KR
● Required traits: Foul Discipline
● Tools gates: none
● Data-layer gate: Foul Discipline must be scored (non-null)
○ Box-score: eligible if scored via fouls proxy (often yes)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
TEAM DEFENSE BADGES — COLLEGE v1 (gates only; uses Global Tier
Gates)
1) Anchor
● Skill KR gate: Team Defense KR
● Required traits: Rim Protection
● Tools gates: none
● Data-layer gate: Rim Protection must be scored (non-null)
○ Box-score: eligible only if your box-score layer scores Rim Protection (often yes
via proxy)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Low-Man Rotator
● Skill KR gate: Team Defense KR
● Required traits: Help & Rotation
● Tools gates: none
● Data-layer gate: Help & Rotation must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Closeout Pro
● Skill KR gate: Team Defense KR
● Required traits: Closeout Execution
● Tools gates: none
● Data-layer gate: Closeout Execution must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

4) Defensive QB
● Skill KR gate: Team Defense KR
● Required traits: Communication & QB
● Tools gates: none
● Data-layer gate: Communication & QB must be scored (non-null)
○ Box-score: only if scored in box-score (no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
5) Switchable
● Skill KR gate: Team Defense KR
● Required traits: Versatility
● Tools gates: none
● Data-layer gate: Versatility must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

REBOUNDING BADGES — COLLEGE v1 (gates only; uses Global Tier
Gates)
1) Rebound Chaser
● Skill KR gate: Rebounding KR
● Required traits: Defensive Rebounding, Rebound Range
● Tools gates: none
● Data-layer gate: both traits must be scored (non-null) in the active data layer
○ Box-score: eligible only if both are scored in box-score (Defensive Rebounding
often yes via proxy; Rebound Range usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Boxout Beast
● Skill KR gate: Rebounding KR
● Required traits: Box-Out
● Tools gates: none
● Data-layer gate: Box-Out must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Offensive Glass
● Skill KR gate: Rebounding KR
● Required traits: Offensive Rebounding
● Tools gates: none
● Data-layer gate: Offensive Rebounding must be scored (non-null)
○ Box-score: eligible if your box-score layer scores Offensive Rebounding (often
yes via proxy)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Strong Hands
● Skill KR gate: Rebounding KR
● Required traits: Hands
● Tools gates: none
● Data-layer gate: Hands must be scored (non-null)
○ Box-score: eligible only if your box-score layer scores Hands (often no / weak
proxy)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

IQ BADGES — COLLEGE v1 (gates only; uses Global Tier Gates)
NOTE: do not label these “film-only.”
These are Non-Box-Score Scored — eligible in any layer where these traits are scored
(Synergy / PlayVision / KaNeXT-tag, etc.).
1) Fast Processor
● Skill KR gate: IQ KR
● Required traits: Decision Speed
● Tools gates: none
● Data-layer gate: Decision Speed must be scored (non-null)
○ Box-score: not eligible unless you score Decision Speed in box-score (usually
no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Elite Shot Selector
● Skill KR gate: IQ KR
● Required traits: Shot Selection Quality
● Tools gates: none
● Data-layer gate: Shot Selection Quality must be scored (non-null)
○ Box-score: not eligible unless scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Low Mistake Rate
● Skill KR gate: IQ KR
● Required traits: Turnover Decision Quality
● Tools gates: none
● Data-layer gate: Turnover Decision Quality must be scored (non-null)
○ Box-score: not eligible unless scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Advantage Converter
● Skill KR gate: IQ KR
● Required traits: Advantage Conversion
● Tools gates: none
● Data-layer gate: Advantage Conversion must be scored (non-null)
○ Box-score: not eligible unless scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

5) Role Discipline
● Skill KR gate: IQ KR
● Required traits: Role Discipline
● Tools gates: none
● Data-layer gate: Role Discipline must be scored (non-null)
○ Box-score: not eligible unless scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there



# OVERRIDES

Overrides

OVERRIDES
v3 — AMENDED (No Gravity Redefined)
AMENDMENT LOG (v2 → v3)
Change 1 — No Gravity (Pro Negative Override) redefined. Trigger changed from vague
"consistent defensive sag; below-baseline gravity/attention" to a numeric multi-condition gate
requiring ALL four gravity types (perimeter, rim, short-roll, post) to be absent. This prevents the
override from penalizing rim-runners, roll men, playmaking bigs, and post scorers who
command real defensive attention through non-perimeter channels.
Change 2 — Anti-Stacking reference added. No Gravity override is suppressed when Range
Gap system risk is active for the same player (per System Risks v3 Anti-Stacking Rule).
All other overrides unchanged from v2.
Purpose
Overrides capture rare, real-world basketball realities that are not fully expressed by traits,
archetypes, badges, or system risks. They are exceptions, not features.
Authority
Overrides modify Final KR only. They do not change trait scores, archetypes, badges,
confidence, or system fit logic.
Application Order
Overrides are applied after Base KR, Badges, System Fit, and System Risks. They are the final
correction layer before Final KR lock.
Stacking Rules

Maximum one positive override per player. At Pro, negative overrides always apply and cannot
be overridden by positives. Positives and negatives do not stack against each other — if a
negative triggers, it applies regardless of any positive qualification.
[v3 ADDITION] Anti-Stacking with System Risks: No Gravity (negative override) is suppressed
when Range Gap (system risk) is active for the same player. See System Risks v3.
Determinism
Override application is rule-based, deterministic, and auditable. If conditions are met, the
override applies. If conditions are not met, it does not. There is no discretion inside the engine.
COLLEGE OVERRIDES (Positive Only — Max 1 Applies)
Unchanged from v2.
1) True 7-Footer — +2.0 to +5.0 KR (scaled)
Trigger: Height ≥ 7'0
KR Delta:
● 7'0–7'0.75 → +2.0
● 7'1–7'1.75 → +3.0
● 7'2–7'2.75 → +4.0
● 7'3+ → +5.0
2) Jumbo Initiator — +1.0 KR
Triggers: Height ≥ 6'6, Usage ≥ 20%, AST% ≥ 20, ≥ 50% possessions as primary initiator
Blocked by: Turnover Risk (Major), Decision-Making Collapse
3) Stretch 5 — +1.0 KR
Triggers: Height ≥ 6'9, ≥ 50% minutes at C, 3PA ≥ 7.0 / 100, 3P% ≥ 33%
Blocked by: No Gravity (Major)
4) Vertical Rim Threat — +1.0 KR
Triggers: ≥ 20% of FGA are dunks/lobs, Rim FG% ≥ 65%, ≥ 3.0 lob/dunk attempts / 100

5) Connector Wing — +1.0 KR
Triggers: Height 6'4–6'8, Usage ≤ 16%, AST% ≥ 12, DREB% ≥ 10, On/Off Net Rating Swing ≥
+5
6) Micro-5 (College-Only) — +1.0 KR
Triggers: Height < 6'8, ≥ 70% minutes at C, DREB% ≥ 15, ≥ 5 rim contests / 100, team
defensive rating improves on floor
Blocked by: Foul Machine (Major), Rim Protection below level baseline
Expires before Pro.
7) Small Bucket Getter (College-Only) — +0.75 KR
Triggers: Height ≤ 6'1, Points ≥ 25 / 100, Usage ≥ 22%, TS% ≥ league average, no Severe
Pull-Up Void
Blocked by: Turnover Risk (Major), No Gravity (Major)
8) Undersized Defensive Guard (College-Only) — +0.75 KR
Triggers: Height ≤ 6'1, Containment ≥ 75, Screen Navigation ≥ baseline, ≥ 4 rim contests / 100,
Opp FG% at rim ≤ −5% vs baseline
Blocked by: Switch Liability (Major), Foul Machine (Major)
PRO OVERRIDES — Positive (Max 1 Applies) — Each +1.0
KR
Unchanged from v2.
1) Jumbo Initiator (Pro) — +1.0 KR
Triggers: Height ≥ 6'6, AST ≥ 8.0 / 100, Usage ≥ 20%, ≥ 50% minutes as primary initiator
2) Stretch 5 (Pro) — +1.0 KR
Triggers: Height ≥ 6'9, ≥ 50% minutes at C, 3PA ≥ 12.0 / 100, 3P% ≥ 36%
3) Switch Big (Pro) — +1.0 KR

Triggers: Height ≥ 6'8, Lateral Quickness ≥ 75, Switch volume ≥ 8 / 100, Switch PPP ≤ 0.95
4) High-Movement Shooter (Pro) — +1.0 KR
Triggers: Off-screen 3PA ≥ 8 / 100, 3P% ≥ 37%, ≥ 50% minutes at SG/SF
PRO OVERRIDES — Negative (Always Apply, Cannot Be
Overridden)
1) No Gravity — −1.0 KR [AMENDED v3]
[AMENDED v3] Trigger redefined to measure total defensive attention across all gravity types.
Trigger: ALL of the following must be true:
● (a) Perimeter gravity is zero: 3PA < 1.0 per 100 OR (3P% < 20% AND 3PA < 2.0 per
100)
● (b) Rim gravity is zero: Lob/dunk/roll attempts < 2.0 per 100 AND Rim FG% < 55%
● (c) Short-roll / playmaking gravity is zero: AST% < 8% in screener/post/short-roll actions
● (d) Post gravity is zero: Post-up frequency < 5% of possessions OR post-up PPP < 0.85
Anti-Stacking: Suppressed when Range Gap system risk is active for same player.
2) Rim Pressure Limitation — −1.0 KR
Trigger: Rim attempts materially below positional baseline; no foul draw or collapse effect
Unchanged from v2.
3) Switch Liability — −1.0 KR
Trigger: Switch PPP ≥ 1.05 (with required switch volume)
Unchanged from v2.
4) Tweener (No Positional Home) — −1.5 KR
Trigger: Guard skills in wing body, undersized big with no switch value, or wing who can't
defend wings or space
Unchanged from v2.

Governance
Any change to override definitions, triggers, KR deltas, stacking rules, or blocking relationships
requires documentation, versioning, and approval.
v1 → v2: Initial locked structure. v2 → v3: No Gravity redefined (total gravity gate), Anti-Stacking
reference added.



# SYSTEM RISKS

System Risks

SYSTEM RISKS
v3.2 — AMENDED (Tiered Severity + Position-Scaled Range Gap + Suppression
Adjustment Protocol + Reduced Pro Minors)
AMENDMENT LOG
v2 → v3: Tiered severity, No Gravity redefinition, Anti-Stacking Rule.
v3 → v3.1: Position-scaled Range Gap.
v3.1 → v3.2: Reduced Pro Minor penalties (−2.0 → −1.0). Formal Suppression Adjustment
protocol for system risks added.
Change 6 — Pro Minor penalties reduced from −2.0 to −1.0. Pro Minors now match College
Minors. Rationale: Minor risks are by definition "marginal but measurable." The trait pipeline at
Pro already does more work than at College through heavier position-specific weighting — the
pipeline catches most of the damage proportionally. The Minor flag marks the issue; it should
not materially alter a player's value. Under the prior −2.0 penalty, two Pro Minors (−4.0) equaled
a Tier 1 Major — meaning two marginal issues produced a scheme-breaking-level penalty. That
was structurally wrong. At −1.0, even three stacked Minors (−3.0) remain below a single Tier 1
Major (−4.0), which correctly reflects the severity hierarchy.
Change 7 — Suppression Adjustment protocol formalized. When a system risk trigger is
met but Tier 3 evidence demonstrates the production driving the trigger is context-suppressed
rather than skill-representative, the system risk can be flagged as "Suppression-Adjusted" and
the penalty reduced or removed. This formalizes a process that was being applied informally,
ensuring consistent treatment across all players.
Purpose
System Risks identify specific weaknesses that break or limit how a system functions at the
team level. They capture damage that individual trait scores alone do not — spacing collapse,
scheme incompatibility, possession-level contagion, and role inflexibility.
System Risks are not general player weaknesses. If a weakness is already proportionally
punished by low trait scores through position weighting, it is not a system risk. System Risks
exist only where the team-level damage exceeds what the individual KR penalty captures.

Severity Levels
Three severities at each level: Tier 1 Major (Scheme-Breaking), Tier 2 Major
(Scheme-Limiting), and Minor.
KR Impact
Severity College Pro Category
Tier 1 Major −2.0 −4.0 Cannot be schemed
(Scheme-Breaking) around
Tier 2 Major Varies by risk (see Varies by risk (see Manageable with roster
(Scheme-Limiting) below) below) construction
Minor −1.0 −1.0 Marginal but measurable
Tier 2 Major — Default Penalties (non-position-scaled risks): College: −1.5 | Pro: −2.5
Tier 2 Major — Range Gap (position-scaled): See Range Gap section below.
Penalties are additive. Non-position-scaled penalties apply uniformly regardless of position or
archetype. Position-scaled penalties (Range Gap only) vary by position as specified.
Anti-Stacking Rule
If Range Gap (any severity) is active for a player, No Gravity cannot also fire for that
player. Range Gap is the higher-authority penalty for shooting-related spacing damage and fully
subsumes the gravity component.
This rule applies at both College and Pro. It is evaluated after all individual system risk triggers
are checked but before final KR application.
Suppression Adjustment Protocol [NEW in v3.2]
Purpose: Some system risk triggers are met based on production data that is
context-suppressed — the player's environment (roster, role, injury, coaching) artificially inflates
the metric that triggers the risk. The Suppression Adjustment protocol provides a governed
mechanism to reduce or remove penalties when evidence demonstrates the trigger is
context-driven rather than skill-driven.
When it applies: A system risk trigger is formally met by the production data, BUT Tier 3
evidence (and in some cases Tier 1 data from other contexts) demonstrates that the underlying
skill is not representative of the trigger.
Evidence requirements (must meet at least 2 of 4):

1. Multi-context contradiction: The player's pre-college, international, or prior-level data
shows the metric at a materially different level than the triggering context. Example:
player's pre-college AST/TO is consistently clean (3.5+ ratio) across 3+ competitions,
but college AST/TO triggers Turnover Risk due to sole-creator burden.
2. Role suppression confirmation: The player's role in the triggering context is
demonstrably extreme — sole offensive option, no secondary creator, heavy
double-team attention — and the metric in question is directly affected by that role.
Confirmed by roster context, coaching testimony, or opponent game-planning evidence.
3. Healthy-context data divergence: When the player was healthy, in rhythm, or in a
favorable lineup, the metric was materially different. Example: 5-game healthy stretch
shows TOV% of 12% vs season average of 18% driven by games played through injury.
4. Pro context projection: The specific context causing the trigger will not exist at the
professional level. Example: no NBA team will ask a SF to carry 32% usage as the sole
creator — the usage and role that drive the turnover rate will not replicate.
Adjustment levels:
● Full removal (penalty → 0): All 4 evidence requirements met, OR requirements 1 + 4
met with strong Tier 1 data from other contexts. The system risk is flagged as
"Suppression-Adjusted: Removed" with full evidence citation.
● 50% reduction (penalty halved): 2 of 4 requirements met. The system risk is flagged
as "Suppression-Adjusted: Reduced" with evidence citation and disclosure of which
requirements were not met.
● No adjustment: Fewer than 2 requirements met, or the evidence is ambiguous. The
system risk applies at full penalty. The suppression argument is noted in the evaluation
but does not modify the output.
Governance rules:
● Suppression Adjustment does not modify trait scores. It modifies system risk penalties
only.
● Every Suppression Adjustment must cite specific evidence for each requirement met.
● Suppression Adjustment is deterministic: same evidence → same adjustment.
● The adjustment is disclosed in the evaluation output. It is never silent.
● If new data arrives that contradicts the suppression evidence, the adjustment is
reversed.

Relationship to trait-level suppression: Trait-level Suppression Detection (in the Player
Evaluation Pipeline) modifies trait scores directly. System Risk Suppression Adjustment
modifies risk penalties. They operate on different layers and do not interact. A player can have
both trait suppression (e.g., Brown's shooting) and risk suppression (e.g., Dybantsa's turnovers)
applied independently.
What System Risks Do
Reduce Overall KR. Reduce System Fit KR. Force separation between similar players. Expose
system-breaking problems that trait scores under-punish.
What System Risks Do Not Do
Change trait scores. Change cluster weights. Override badge logic. Directly assign or remove
archetypes.
Application Order
System Risks are evaluated after trait scoring, position weighting, and Base KR computation.
Suppression Adjustment is evaluated during risk assessment (before final penalty application).
Risks are applied before Overrides.
COLLEGE TIER 1 MAJOR SYSTEM RISKS (−2.0 KR) — 5
Total
Scheme-Breaking risks that cannot be managed through roster construction.
1. Turnover Risk (Major)
Trigger: TOV% ≥ 20% OR turnovers ≥ 6.0 per 100 touches
System damage: Possession hemorrhage affects pace, transition defense exposure, and team
offensive rhythm. Turnovers are contagious — they compress shot clock behavior and erode
trust in ball movement.
2. Defensive Target
Trigger: Opponent PPP vs player (ISO + PnR) ≥ 1.15 OR on-court defensive rating −6.0 vs
team baseline

System damage: Opponents game-plan to attack one player. Team must over-help, rotations
break, defensive scheme identity collapses around protection duty.
3. Switch Liability
Trigger: Versatility trait < 55 AND Lateral Quickness trait below positional average
System damage: Switch-based defensive schemes cannot run with this player on the floor.
Binary system-breaking issue.
4. Foul Machine
Trigger: Foul Discipline trait < 55 (POA) AND Team Foul Discipline trait < 55 OR fouls ≥ 6.0 per
100 possessions
System damage: Early bonus pressure changes how the entire defense can play. Substitution
crises shorten rotation. Opponents attack the foul-prone player to manufacture free throws for
the team.
5. Role Collapse
Trigger: Usage change ±20% → efficiency drop ≥ 15% OR starter → bench Net Rating ≤ −8.0
System damage: System cannot adjust around this player. Injuries, foul trouble, and matchup
shifts require role flexibility — this player breaks when their role changes.
COLLEGE TIER 2 MAJOR SYSTEM RISKS — 4 Total
Scheme-Limiting risks. Manageable through roster construction, play design, and
complementary personnel.
6. Range Gap [POSITION-SCALED]
Trigger: 3PT Spot-Up trait < 60 AND 3PA < 3.0 per 100 possessions
College Penalty (by position):
Positio Penalty
n
PG −2.0

SG −2.0
SF −1.5
PF −1.5
C −1.0
Anti-Stacking: If active, suppresses No Gravity for same player.
7. No Gravity
Trigger: ALL of the following must be true:
● (a) Perimeter gravity is zero: 3PA < 1.0 per 100 possessions OR (3P% < 20% AND 3PA
< 2.0 per 100 possessions)
● (b) Rim gravity is zero: Lob/dunk/roll attempts < 2.0 per 100 AND Rim FG% < 55%
● (c) Short-roll / playmaking gravity is zero: AST% < 8% when in screener/post/short-roll
actions
● (d) Post gravity is zero: Post-up frequency < 5% of possessions OR post-up PPP < 0.85
College Penalty: −1.5 (flat)
Anti-Stacking: Suppressed if Range Gap is active for same player.
8. Severe Undersize
Trigger: Height trait OR Length trait ≥ 4 inches below positional average
College Penalty: −1.5 (flat)
9. System Locked (Severe)
Trigger: Positive Net Rating in only 1 system type AND Net Rating swing ≤ −6.0 outside that
system
College Penalty: −1.5 (flat)
COLLEGE MINOR SYSTEM RISKS (−1.0 KR) — 5 Total
10. Limited Range
Trigger: 3PT Spot-Up trait 60–69 AND 3PA 3.0–4.5 per 100 possessions

System damage: Spacing is marginal. Defenses respect the shot inconsistently, creating
unreliable geometry for teammates.
11. Low Shooting Volume
Trigger: Total 3PA < 4.0 per 100 possessions OR wide-open 3s declined ≥ 25%
System damage: Even when the skill exists, declining open shots teaches defenses to sag.
Spacing benefit degrades over time as opponents adjust.
12. Elevated Turnover Risk
Trigger: TOV% 17–19% OR turnovers 4.5–5.9 per 100 touches
System damage: Weaker version of Major Turnover Risk. Possession leakage is manageable
but measurable.
13. Partial System Lock
Trigger: Positive Net Rating in ≤ 2 system types AND Net Rating variance ≥ 6.0
System damage: Weaker version of System Locked. Player functions in limited schemes,
reducing coaching flexibility.
14. Role Fragility
Trigger: Usage change ±15% → efficiency drop 10–14%
System damage: Weaker version of Role Collapse. Player survives small role shifts but
degrades under moderate adjustment.
PRO TIER 1 MAJOR SYSTEM RISKS (−4.0 KR) — 5 Total
Scheme-Breaking risks. Unchanged from v3.1.
1. Turnover Risk (Major)
Trigger: TOV% ≥ 17% OR turnovers ≥ 5.0 per 100 touches
2. Defensive Target
Trigger: Opponent PPP vs player ≥ 1.10 OR targeted on ≥ 20% of halfcourt actions

3. Switch Liability
Trigger: Versatility trait < 60 AND Lateral Quickness trait below positional pro baseline
4. Foul Machine
Trigger: Foul Discipline trait < 60 (POA) AND Team Foul Discipline trait < 60 OR fouls ≥ 5.5 per
100 possessions
5. Role Collapse
Trigger: Usage change ±15% → efficiency drop ≥ 12% OR rotation role change → Net Rating ≤
−6.0
PRO TIER 2 MAJOR SYSTEM RISKS — 4 Total
Scheme-Limiting risks. Unchanged from v3.1.
6. Range Gap [POSITION-SCALED]
Trigger: 3PT Spot-Up trait < 65 AND 3PA < 4.0 per 100 possessions
Pro Penalty (by position):
Positio Penalty
n
PG −3.0
SG −3.0
SF −2.5
PF −2.0
C −1.5
Anti-Stacking: If active, suppresses No Gravity for same player.
7. No Gravity
Trigger: ALL of the following must be true:

● (a) Perimeter gravity is zero: 3PA < 1.0 per 100 OR (3P% < 20% AND 3PA < 2.0 per
100)
● (b) Rim gravity is zero: Lob/dunk/roll attempts < 2.0 per 100 AND Rim FG% < 55%
● (c) Short-roll / playmaking gravity is zero: AST% < 8% in screener/post/short-roll actions
● (d) Post gravity is zero: Post-up frequency < 5% of possessions OR post-up PPP < 0.85
Pro Penalty: −2.5 (flat)
Anti-Stacking: Suppressed if Range Gap is active for same player.
8. Severe Undersize
Trigger: Height trait OR Length trait ≥ 3 inches below positional pro average
Pro Penalty: −2.5 (flat)
9. System Locked (Severe)
Trigger: Positive Net Rating in only 1 system AND Net Rating swing ≤ −5.0 outside it
Pro Penalty: −2.5 (flat)
PRO MINOR SYSTEM RISKS (−1.0 KR) — 5 Total
[AMENDED v3.2] Penalty reduced from −2.0 to −1.0. Matches College Minor severity.
10. Limited Range
Trigger: 3PT Spot-Up trait 65–74 AND 3PA 4.0–5.5 per 100 possessions
11. Low Shooting Volume
Trigger: Total 3PA < 5.0 per 100 possessions
12. Elevated Turnover Risk
Trigger: TOV% 14–16% OR turnovers 4.0–4.9 per 100 touches
13. Partial System Lock
Trigger: Positive Net Rating in ≤ 2 systems AND Net Rating variance ≥ 5.0
14. Role Fragility

Trigger: Usage change ±10% → efficiency drop 8–11%
POSITION-SCALED RANGE GAP — QUICK REFERENCE
Positio College Trigger College Pro Trigger Pro
n Penalty Penalty
PG Spot-Up < 60, 3PA < −2.0 Spot-Up < 65, 3PA < −3.0
3.0/100 4.0/100
SG Spot-Up < 60, 3PA < −2.0 Spot-Up < 65, 3PA < −3.0
3.0/100 4.0/100
SF Spot-Up < 60, 3PA < −1.5 Spot-Up < 65, 3PA < −2.5
3.0/100 4.0/100
PF Spot-Up < 60, 3PA < −1.5 Spot-Up < 65, 3PA < −2.0
3.0/100 4.0/100
C Spot-Up < 60, 3PA < −1.0 Spot-Up < 65, 3PA < −1.5
3.0/100 4.0/100
Note: Trigger thresholds are the same at all positions. Only the penalty magnitude varies.
TIER CLASSIFICATION RATIONALE
Tier 1 — Scheme-Breaking (−4.0 Pro / −2.0 College)
These risks represent problems that coaching staffs cannot scheme around regardless of
personnel. When Defensive Target fires, opponents will hunt that player every possession — no
lineup change fixes it. When Foul Machine fires, the team enters the bonus early — no play
design prevents it. When Switch Liability fires, the defensive scheme literally cannot function.
When Turnover Risk fires, possessions hemorrhage at a rate that corrupts team rhythm. When
Role Collapse fires, the player becomes unplayable in any adjusted context.
Tier 2 — Scheme-Limiting (−2.5 Pro / −1.5 College, or position-scaled for Range Gap)
These risks represent real costs that limit what schemes the team can run, but a smart coaching
staff can mitigate them with lineup construction, play design, and complementary personnel.
Minor (−1.0 at both levels)

These risks are marginal but measurable. They flag a real limitation without materially altering a
player's value. The trait pipeline handles the proportional damage through position weighting.
The Minor flag marks the issue for scouting awareness and development targeting. At −1.0,
even three stacked Minors (−3.0) remain below a single Tier 1 Major (−4.0), correctly preserving
the severity hierarchy.
SEVERITY SUMMARY TABLE
Severity Colleg Pro Max 3 stacked
e
Tier 1 Major −2.0 −4.0 −6.0 / −12.0
Tier 2 Major (flat) −1.5 −2.5 −4.5 / −7.5
Tier 2 Major (Range Gap PG/SG) −2.0 −3.0 N/A (only 1 Range Gap)
Tier 2 Major (Range Gap C) −1.0 −1.5 N/A
Minor −1.0 −1.0 −3.0 / −3.0
Governance
Any change to system risk definitions, triggers, severity levels, tier classifications,
position-scaling tables, stacking rules, or suppression adjustment protocol requires
documentation, versioning, and approval. All amendments are tracked in the Amendment Log at
the top of this document.
v1 → v2: Initial locked structure. v2 → v3: Tiered severity, No Gravity redefinition, Anti-Stacking
Rule. v3 → v3.1: Position-scaled Range Gap. v3.1 → v3.2: Reduced Pro Minors (−2.0 → −1.0),
formal Suppression Adjustment protocol.



# IMPACT MODIFIERS

Impact Modifiers

IMPACT MODIFIERS — v2 (LOCKED)
Purpose
KR measures how much a player impacts winning. Impact Modifiers classify the mode by which
that impact is produced. KR answers magnitude. Impact Modifiers answer method.
Inputs
All rate stats are per-possession / per-100 / % as noted:
● USG — usage rate (% possessions)
● AST% — assist percentage
● TOV% — turnover percentage
● TS% — true shooting %
● SelfCreate% — % of FGA that are self-created (off-dribble / unassisted)
● OnOff_Net — team net rating on-court minus off-court (per 100)
● 3PAr — 3PA / FGA
● 3P%
● FTr — FTA / FGA
● STL%
● BLK%
● REB%
Derived
ELS (Engine Load Score) = 0.60 × USG + 0.40 × AST%
v1 Note
v1 uses raw stats. v2 will move to KLVN-normalized inputs when per-metric normalization is
available.
Sample Gate
If MP < 200, label = UNCLASSIFIED (LOW SAMPLE).
Assignment Rules
One modifier max per player. Evaluate in strict precedence order. First match wins.
1. Primary Engine
2. Secondary Engine
3. Force Multiplier

4. Specialist Anchor
5. Else → Unclassified
Impact Modifiers do not alter KR values. They are classification labels consumed by System
Demand Profiles, simulation, and scouting.
1) Primary Engine
Definition: A player whose offensive impact is structurally required for team function. Offense is
organized around them. Removal produces a measurable structural drop.
Assign PRIMARY ENGINE if ALL conditions hold:
● ELS ≥ 24.0
● SelfCreate% ≥ 45
● TS% ≥ 52.0
● TOV% ≤ 20.0
● (OnOff_Net ≥ +5.0) OR (OnOff_Net ≥ +3.0 AND ELS ≥ 26.0)
2) Secondary Engine
Definition: A player who creates advantages but does not anchor the offense continuously.
Creates in bursts or as a secondary option.
Assign SECONDARY ENGINE if ALL conditions hold:
● ELS between 18.0 and 23.9
● SelfCreate% ≥ 35
● TS% ≥ 54.0
● TOV% ≤ 22.0
● OnOff_Net ≥ +3.0
3) Force Multiplier
Definition: A player whose impact is driven by efficiency, spacing, defense, and connective play.
Makes teammates better without needing the ball.
Assign FORCE MULTIPLIER if ALL conditions hold:
● USG ≤ 22.0
● TS% ≥ 56.0

● OnOff_Net ≥ +5.0
● MultiplierTriggers ≥ 2
Multiplier Triggers (count how many are true):
Shooting Gravity: (3PAr ≥ 0.35 AND 3P% ≥ 36.0) OR (3PAr ≥ 0.45 AND 3P% ≥ 34.0)
Rim / Foul Pressure: FTr ≥ 0.35 OR (SelfCreate% ≥ 40 AND FTr ≥ 0.25)
Defensive Playmaking: STL% ≥ 2.0 OR BLK% ≥ 3.0
Rebound Leverage: REB% ≥ 15.0
4) Specialist Anchor
Definition: A player whose impact is elite in one narrow domain and matchup-dependent.
Dominates one thing.
Assign SPECIALIST ANCHOR if ALL conditions hold:
● USG ≤ 20.0
● OnOff_Net ≥ +2.0
● Exactly one Elite Signal is true
Elite Signals (exactly one must be true):
● Rim Protector Anchor: BLK% ≥ 6.0
● POA Disruptor: STL% ≥ 3.0
● Rebound Enforcer: REB% ≥ 20.0
● Pure Spacer: 3PAr ≥ 0.55 AND 3P% ≥ 38.0
● Foul Magnet Finisher: FTr ≥ 0.50
If 2+ Elite Signals are true, player is not Specialist Anchor — reroute to Force Multiplier
evaluation (or Unclassified if FM gates fail).
Governance
Impact Modifiers are deterministic. Same inputs produce the same label every time. No learning,
tuning, or adaptation. Changes to thresholds require documentation, versioning, and approval.



# KLVN

KLVN

KLVN — Level Normalization Ladder + D1
Conference Class Mapping
Status: Canonical (Active)
Audience: Founder, Nexus intelligence layer, builders implementing normalization
Scope: Production normalization + cross-level KR translation using a single per-level lambda
(λ_level[L]).
1) Purpose (Locked)
KLVN exists to ensure player performance is comparable across competitive environments and
to prevent level/pace/sample-size effects from distorting evaluation. KLVN performs
normalization only and does not rank, value, or project players.
2) Determinism (Locked)
KLVN is fully deterministic: identical inputs must produce identical outputs.
3) Canonical Level Order (by λ weight)
Rule: Higher λ = higher competition density (harder environment).
Note: “professional” is intentionally excluded in v1 until pro sub-levels exist.
Rank Level Key λ_leve
l
1 ncaa_d1_high_majo 1.000
r
2 ncaa_d1_mid_major 0.958
3 ncaa_d1_low_major 0.917
4 ncaa_d2 0.875

5 njcaa_d1 0.833
6 naia 0.810
7 cccaa 0.765
8 njcaa_d2 0.750
9 ncaa_d3 0.667
10 njcaa_d3 0.625
11 uscaa 0.583
12 nccaa_d1 0.542
13 nccaa_d2 0.500
14 hs_prep_postgrad 0.450
4) D1 Major Class Mapping (NEW — Required for KLVN)
Goal: deterministically assign NCAA D1 teams to High / Mid / Low so they map into the correct
KLVN level keys.
4.1 Season-scoped rule (Locked)
Conference realignment changes over time, so the D1 Major Class mapping is season-scoped.
Create a table/object:
d1_conference_class_map[season_id][conference_key] = {high|mid|low}
For KLVN v1 (starting 2025–26), use the following baseline lists:
High-Major (HM) conferences
● ACC
● Big Ten
● Big 12
● SEC
● Big East
Mid-Major (MM) conferences

● American (AAC)
● Atlantic 10 (A-10)
● Mountain West (MWC)
● West Coast (WCC)
● Missouri Valley (MVC)
Low-Major (LM) conferences
● All other D1 conferences not in HM or MM
(Explicitly keep Sun Belt and Conference USA as LM in v1.)
4.2 Level key assignment rule (Locked)
If governing_body = NCAA and division = D1:
● If conference ∈ HM → level_key = ncaa_d1_high_major
● Else if conference ∈ MM → level_key = ncaa_d1_mid_major
● Else → level_key = ncaa_d1_low_major
If conference is missing/unknown:
● require manual d1_major_class input for that team-season or block KLVN
assignment until resolved.
5) Application Rule (v1 Simplification)
Legacy KLVN may define metric-specific multipliers λ[S,L].
KLVN v1 simplification (Locked):
● Use λ_level[L] as a single multiplier applied uniformly across production-derived
translation needs.
● Future KLVN v2 may expand to λ[S,L] by metric (points vs rebounds vs assists, etc.).

6) Governance / Change Control (Locked)
Any change to:
● level definitions
● λ constants
● D1 conference class lists / mapping table
● normalization logic
requires documentation, versioning, and explicit approval.

7) CRITICAL CLARIFICATION — KR IS UNIVERSAL, NOT LEVEL-CONVERTED (Added March 2026)

KLVN lambda normalizes INPUTS (production stats) during evaluation so that trait scoring is comparable across levels. It does NOT convert KR OUTPUTS from one level to another.

A player's KR is a single universal number. It does not change based on what level you're viewing from. There is no "HM-equivalent KR" or "MM-equivalent KR." The KR is the KR.

What changes across levels is the LEGEND INTERPRETATION of that KR. Each level has its own legend with different tier labels at different KR ranges. A KR of 85 maps to different tier labels at different levels:
- At D1 HM: 83–85 = Reliable Bench / Rotation Contributor
- At D1 MM: 85–87 = Solid Starter / Top-Five Rotation Lock
- At D1 LM: 84–87 = High-Impact Starter / Core Winner
- At D2: 82–85 = High-Impact Starter / Core Winner
- At NAIA: 82–85 = Franchise Anchor / Top All-American

One player. One KR. Multiple legend reads depending on level context.

HOW KLVN LAMBDA IS CORRECTLY USED:
- During evaluation: lambda adjusts raw production stats before trait scoring so that 20 PPG at NAIA is not treated the same as 20 PPG at D1 HM
- During legend interpretation: the player's KR is read against EACH level's legend to show what that number means at every level (the Level Tier Map in the Development Engine)

HOW KLVN LAMBDA IS INCORRECTLY USED:
- DO NOT multiply a player's KR by lambda to create a "translated" KR at another level
- DO NOT report separate KR numbers for different levels (e.g., "85 MM / 81 HM")
- The KR is computed once, at the player's home level, using lambda-normalized inputs. That number is final and universal.



# COLLEGE PLAYER KR LEGENDS

COLLEGE PLAYER KR LEGENDS — v4 (MODULAR)

Governance Note: College legends have been moved to individual files per level for modularity and independent calibration. Each file is a standalone legend for one competitive level.

Legend files (14 total, stored as separate project knowledge files):
- Legend_NCAA_D1_HM_v4.md (λ = 1.000) — Calibrated: 48 players / 6 teams
- Legend_NCAA_D1_MM_v4.md (λ = 0.958) — Calibrated: 32 players / 4 teams
- Legend_NCAA_D1_LM_v4.md (λ = 0.917) — Calibrated: 32 players / 4 teams
- Legend_NCAA_D2_v4.md (λ = 0.875) — Calibrated: 16 players / 2 teams
- Legend_NCAA_D3_v4.md (λ = 0.667) — Tier breaks set, no calibration data yet
- Legend_NAIA_v4.md (λ = 0.810) — Calibrated: 16 players / 2 teams
- Legend_NJCAA_D1_v4.md (λ = 0.833) — Tier breaks set, no calibration data yet
- Legend_NJCAA_D2_v4.md (λ = 0.750) — Tier breaks set, no calibration data yet
- Legend_NJCAA_D3_v4.md (λ = 0.625) — Tier breaks set, no calibration data yet
- Legend_CCCAA_v4.md (λ = 0.765) — Tier breaks set, no calibration data yet
- Legend_USCAA_v4.md (λ = 0.583) — Calibrated: 8 players / 1 team
- Legend_NCCAA_D1_v4.md (λ = 0.542) — Tier breaks set, no calibration data yet
- Legend_NCCAA_D2_v3.md (λ = 0.500) — Tier breaks set, no calibration data yet

v4 changes from v3 (applied to ALL levels):
1. All draft/pro projection language removed. College KR is present-tense only.
2. BPR ranges removed from all tiers. Metrics are the pipeline's job, not the legend's.
3. 86-88 tier renamed from "Glue Guy" to "High-Minute Role Player" — covers facilitators.
4. 92-94 tier rewritten to accommodate spike AND complete profiles.
5. Calibration examples from 152-player study added where data exists.

To read a player's legend: use the player's home level key to select the correct legend file, then find the tier matching their KR.

For Level Tier Map (cross-level reads): read the same KR against multiple legend files to show what the number means at each level. One KR, multiple legend reads.


# PRO PLAYER KR LEGEND -- v2

Reference Cap: 2025-26 NBA Salary Cap = ~$141M

## KEY CONCEPT: ENTRY vs MEDIAN vs PEAK

- **Entry KR** = Day 1 as a rookie. Almost every rookie is 82-89 regardless of draft position. Entry KR is nearly useless for lottery evaluation.
- **Median Outcome** = Most likely version by Year 3. Midpoint of best and worst scenarios. What late-first teams draft for.
- **Peak Ceiling** = Best realistic outcome by Year 3-5. What lottery teams draft for.

Entry KR does NOT correlate with draft order. A safe late-lottery pick can have a HIGHER entry than the #1 overall pick. The #1 pick is drafted for ceiling, not Day 1. Two players with identical entry KR can have completely different draft values because their ceilings differ.

## DRAFT-RANGE OUTPUT PRIORITY

| Draft Range | Primary KR | What Team Is Buying |
|------------|-----------|-------------------|
| #1-5 | Peak Ceiling | Best player available. Franchise star potential. Fit/overlap less important -- team is bad, roster will change around this pick. |
| #6-15 | 3-Year Projection | Complementary star next to existing talent. Fit starts to matter. |
| #16-30 | Median Outcome | Contributors NOW. High floor, narrow range, role-ready. System fit critical. |
| 2nd round+ | Entry KR + Role | Earn a roster spot. What can you do Day 1? Specialists. |

PRO PLAYER KR TIERS (DISPLAY / READ-ONLY)

### 98-100 -- Global Apex / Transcendent Superstar
**Role:** League-defining icon who warps systems and wins titles.
**League:** NBA perennial MVP / All-NBA. National team legends.
**NBA Cap %:** 30-46%
**NBA Salary:** ~$42M-$65M+
**Draft context:** PEAK tier only. Almost no rookies enter here. Appears only in Peak Ceiling projections for generational talents. If a prospect's peak projects here, they go #1 regardless of entry KR.

### 94-97 -- Elite Franchise Anchor
**Role:** Primary star who carries teams. All-Star. Top-20 player.
**League:** NBA All-Stars. EuroLeague franchise imports.
**NBA Cap %:** 20-35%
**NBA Salary:** ~$28M-$50M
**International:** $2M-$6M
**Draft context:** PEAK tier for top-5 picks who fully develop. The ceiling #1-3 picks are drafted for. A 3-Year Scenario A landing here means the pick hit. Teams picking #1-5 want to see this number in the Peak column.

### 90-93 -- High-Impact Global Star
**Role:** Star starter who closes games. Franchise pillar.
**League:** NBA playoff starters / closers. EuroLeague/NBL MVPs.
**NBA Cap %:** 10-21%
**NBA Salary:** ~$14M-$30M
**International:** $800K-$4M
**Draft context:** PEAK for picks #3-10. 3-YEAR for top picks developing well. A median outcome here makes a player worth a top-5 pick. Mid-lottery teams (#6-15) want their 3-Year Projection here.

### 86-89 -- Core Professional Contributor
**Role:** Trusted high-minute rotation player. Starter or 6th man.
**League:** NBA rotation. Strong overseas starters.
**NBA Cap %:** 3-7%
**NBA Salary:** ~$4M-$10M
**International:** $300K-$1.5M
**Draft context:** ENTRY tier for most lottery picks (this is what rookies actually are Day 1). MEDIAN for mid-lottery. PEAK for late first round. This is what most first-round picks actually become by Year 3 -- a solid NBA career.

### 82-85 -- Stable Professional Role Player
**Role:** Dependable pro. Mid-level league starter.
**League:** NBA fringe / G-League standouts. BCL/B.League/NBL starters.
**NBA Cap %:** 1-3%
**NBA Salary:** ~$1.5M-$4M
**International:** $100K-$500K
**Draft context:** ENTRY for late-first and second-round. FLOOR for lottery picks who stall. Median here = career backup / journeyman.

### 78-81 -- Rotation-Level Professional
**Role:** Lower league starters. G-League rotation.
**League:** Lower Euro/domestic starters. G-League.
**NBA Cap %:** <1% (two-way / minimum)
**NBA Salary:** ~$500K-$2M
**International:** $50K-$300K
**Draft context:** ENTRY for second-round / undrafted. FLOOR for late-first who don't develop. Career overseas pro.

### 73-77 -- Fringe Professional
**Role:** Edge-of-roster. Variable job security. Churn band.
**League:** Lower global domestics.
**International:** $20K-$100K
**Draft context:** FLOOR for second-round picks. "Didn't work out" for late-first.

### 68-72 -- Entry-Level / Replacement Professional
**Role:** High churn. Replacement-level.
**League:** Bottom-tier global. Semi-pro overlap.
**International:** Expenses to ~$50K

Note: KR 68-77 = global professional churn band.

### 60-67 -- Semi-Professional / Local Level
**Role:** Below full pro viability.
**International:** Stipends up to ~$20K.

### Below 60 -- Non-Professional
**Role:** Not sustainable at professional levels.

---

UI / GOVERNANCE NOTE
Display legend only. Cap % is the primary economic unit for NBA. Dollar amounts derived from cap % x current cap, updated annually.

## BPR — Basketball Performance Rating

KaNeXT — Basketball Performance Rating (BPR)
(Underlying Metric: BPR — Basketball Performance Rating)
Interpretation & Governance Document (Internal)
Status: Internal / Confidential
Audience: Founder, Nexus intelligence layer, future system auditors
Not for: UI, builders, coaches, recruiting staff, or external distribution
1. Purpose of BPR
BPR (Basketball Performance Rating) exists to measure actual on-court impact in a single game,
relative to competition level.
It answers one question only:
When this player was on the floor in this game, how much better or worse
was the team because of them, relative to the expected average at that
level?
BPR is a game-only impact anchor, not an evaluation verdict, not a projection, and not a
recruiting ranking.
BPR (Basketball Performance Rating) is the single-game player impact metric. There is no alias or surface name. BPR is BPR.
2. Core Principles
2.1 Zero-Centered Meaning

● BPR = 0 → average impact for the player’s competitive level
● BPR > 0 → positive impact
● BPR < 0 → negative impact
BPR is level-relative, not universal.
A +4 at D1 High Major ≠ a +4 at NAIA.
2.2 Determinism
Given the same:
● player
● role
● minutes
● opponents
● outcomes
BPR must produce the same result every time.
No coach preference, system choice, or sandbox setting alters BPR.
3. What BPR Is (and Is Not)
BPR IS
● a single-game player impact signal
● outcome-aware

● opponent-aware
● role-aware
● possession-aware
● offense + defense combined
BPR IS NOT
● a box score stat
● a skill rating
● a projection
● a recruiting ranking
● a talent ceiling estimate
● a stylistic judgment
BPR reflects what happened, not what could happen.
4. Mental Model (Canonical)
BPR ≈ Box Plus-Minus, adjusted for:
● competition strength
● role expectation
● efficiency vs. volume
● lineup context

● repeatability across games
If traditional BPM asks:
“What did you do statistically?”
BPR asks:
“What happened when you played, given the environment?”
5. Internal Interpretation Bands (Non-UI)
These bands are internal anchors only.
They are used to sanity-check KR alignment and postgame narratives.
● +10 and above → Game-warping impact. Outcomes consistently swing with presence.
● +6 to +9 → Clear winning driver. Strong positive across matchups and lineups.
● +3 to +5 → Reliable positive contributor. Helps teams win more than lose.
● –2 to +2 → Neutral to slightly positive. Performing at expected level.
● –3 to –5 → Negative impact. Liability unless role-constrained.
● –6 to –9 → Strong negative impact. Consistently degrades lineup effectiveness.
● –10 and below → Severe negative impact. Game-shifting harm.
(These labels are for internal interpretation only; not UI copy.)
6. Relationship Between BPR and KR

KR = Player Identity
BPR = Single-Game On-Court Reality
They are related but not redundant.
Scenario Interpretation
High KR + High BPR True high-level player; impact translating
High KR + Low BPR Skill present; impact not translating
Low KR + High BPR Role player outperforming profile
Low KR + Low BPR Replacement-level or developmental
BPR checks KR.
KR does not derive from BPR.
7. Relationship Between BPR and TPQ
TPQ (Team Performance Quality) is team-level, single-game performance.
BPR (Basketball Performance Rating) explains who drove the TPQ outcome.
BPR rolls up into postgame summaries, but:
● BPR does not dictate TPQ directly (team context matters)
● TPQ does not overwrite BPR (individual impact is preserved)

8. Governance Rules
● BPR is never edited manually
● BPR is never coach-adjustable
● BPR is never sandbox-editable
● BPR is never recomputed “on open” as a UI side-effect
● Any change to:
○ methodology
○ inputs
○ scaling
○ normalization
requires documentation, versioning, and explicit approval
Outputs must store:
● bpr_value (same as bpr_value)
● bpr_version / bpr_version
● inputs_snapshot_hash (or equivalent audit reference)

9. Why BPR Is Referenced but Not
Exposed Raw
BPR exists to:
● keep KR honest
● prevent stat padding
● anchor evaluation to outcomes
It is intentionally not a default user-facing metric to avoid:
● misinterpretation
● misuse
● metric chasing
The system’s job is truth, not comfort.
10. Canonical Summary (Lock)
BPR measures single-game impact, not identity.
Zero is average for level.
Positive helps you win.
Negative hurts you win.
KR tells the story; BPR keeps it honest.

# PRO SALARY FRAMEWORK -- v2

## Purpose
Maps Pro KR tiers to salary using cap % as primary unit (NBA) and raw dollars for international. Structured around draft range -- what teams are paying for depends on where they pick.

## Reference Cap: 2025-26 NBA Salary Cap = ~$141M

## WHAT TEAMS PAY FOR BY DRAFT RANGE

| Draft Range | What They're Buying | Primary KR | Salary Basis |
|------------|-------------------|------------|-------------|
| #1-5 | Peak ceiling | Peak KR | Rookie scale (fixed by slot) |
| #6-15 | 3-year development | 3-Year Projection | Rookie scale (fixed by slot) |
| #16-30 | Median outcome + fit | Median Outcome | Rookie scale (fixed by slot) |
| 2nd round | Entry role / value | Entry KR | Minimum / two-way |
| Undrafted | Immediate role | Entry KR | Minimum / overseas market |

All rookies are on fixed salary scales. The PICK determines the salary. The KR determines whether that salary is a good investment.

## NBA ROOKIE SCALE BY DRAFT SLOT (2025-26)

| Pick | Year 1 Salary | Cap % | What You're Buying |
|------|--------------|-------|-------------------|
| 1 | ~$12.2M | 8.7% | Peak ceiling 93-95+. Franchise player bet. |
| 2 | ~$10.9M | 7.7% | Peak ceiling 91-94. Star upside. |
| 3 | ~$9.8M | 6.9% | Peak ceiling 90-93. High-end starter bet. |
| 4-5 | ~$7.9-$8.8M | 5.6-6.2% | Peak ceiling 89-92. Starter trajectory. |
| 6-10 | ~$5M-$7M | 3.5-5.0% | 3-Year 87-90. Complementary star. |
| 11-14 | ~$3.5M-$5M | 2.5-3.5% | 3-Year 85-88. Quality starter. |
| 15-20 | ~$2.5M-$3.5M | 1.8-2.5% | Median 84-87. Reliable rotation. |
| 21-30 | ~$1.8M-$2.5M | 1.3-1.8% | Median 82-86. Role player / specialist. |
| 31-40 | ~$1.5M-$2M | 1.0-1.4% | Entry 80-84. Contribute now. |
| 41-58 | ~$1M-$1.5M | 0.7-1.0% | Entry 78-82. Earn a roster spot. |
| Undrafted | $500K-$1.5M | <1% | Entry 75-80. Specific role or overseas. |

## NBA EXTENSION / SECOND CONTRACT (Year 3-4)

| Pro KR at Extension | Cap % | 2025-26 Dollar | What It Means |
|--------------------|-------|---------------|---------------|
| 94+ | 30-35% | $42M-$50M/yr | Designated max. Franchise player. Pick was a home run. |
| 90-93 | 22-30% | $31M-$42M/yr | Max. All-Star level. Pick hit. |
| 86-89 | 12-20% | $17M-$28M/yr | Near-max. Quality starter. Solid pick. |
| 82-85 | 5-10% | $7M-$14M/yr | Mid-level deal. Rotation player. Pick was okay. |
| 78-81 | 2-4% | $3M-$6M/yr | Role player deal. Below expectations for a first-rounder. |
| Below 78 | <2% | $1.5M-$3M/yr | Minimum. Pick didn't work out. |

## SALARY OUTPUT FORMAT BY DRAFT RANGE

**Top-5 picks -- show Peak scenario salary:**
"Peterson's Peak KR projects to 92-94. At peak, that's 22-30% of cap ($31-42M/yr max extension). Rookie salary at #2: $10.9M/yr (7.7% of cap). Total 4-year rookie deal: ~$45M."

**Mid-lottery (#6-15) -- show 3-Year scenario salary:**
"Acuff's 3-Year Projection (A) is 88.1. Extension at that KR: 12-20% of cap ($17-28M/yr). Scenario B (86.0): still 12-20% low end. Rookie salary at #6: ~$7M/yr."

**Late first (#16-30) -- show Median salary:**
"Smith's Median Outcome is 86.0. Extension: 12-20% of cap ($17-28M/yr). Even the downside (84.5) earns $7-14M/yr. Rookie salary at #28: ~$2M/yr."

**Second round / undrafted -- show Entry + league salary:**
"Martin's Entry KR 81.3 projects to $80-200K in France LNB, $100-300K in Israel BSL. G-League: $45-100K. Two-way NBA: ~$560K if earned."

## INTERNATIONAL SALARY BY LEAGUE AND PRO KR

| Pro KR | EuroLeague | ACB/BSL/Serie A | NBL/CBA/B.League | LNB/BBL | Lower Euro | G-League |
|--------|-----------|----------------|------------------|---------|------------|----------|
| 94+ | $3M-$6M | $1.5M-$3M | $800K-$2M | $500K-$1.5M | N/A | N/A |
| 90-93 | $1.5M-$4M | $800K-$2M | $400K-$1M | $300K-$800K | N/A | N/A |
| 86-89 | $600K-$1.5M | $300K-$1M | $200K-$600K | $150K-$400K | $80K-$200K | $100K-$350K |
| 82-85 | $200K-$800K | $150K-$500K | $100K-$300K | $80K-$200K | $50K-$120K | $45K-$200K |
| 78-81 | $100K-$300K | $80K-$200K | $50K-$150K | $40K-$100K | $30K-$80K | $45K-$100K |
| 73-77 | $50K-$150K | $40K-$100K | $30K-$80K | $20K-$60K | $15K-$50K | N/A |
| 68-72 | N/A | $20K-$50K | $15K-$40K | $10K-$30K | Stipend | N/A |

## GOVERNANCE
- Cap figures update annually. International ranges approximate, vary by team budget.
- Cap % is the stable unit. Dollars = cap % x current cap.
- Pick salary is fixed by CBA. KR determines whether the investment was worth it.

---

# PRO KLVN LAMBDAS -- v2

## Purpose
Pro lambdas normalize inputs during trait scoring so that a player's KR reflects actual basketball ability regardless of league. Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "NBA-equivalent KR."

When evaluating a pro player:
1. Identify their league
2. Look up the league lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the Pro Player KR Legend

## Pro Lambda Table (v0)

| League | Lambda | Tier | Calibration |
|--------|--------|------|-------------|
| NBA | 1.000 | 1 | Reference |
| EuroLeague | 0.920 | 1 | Estimate |
| ACB Spain | 0.860 | 2 | Estimate |
| NBL Australia | 0.850 | 2 | Estimate |
| BSL Turkey | 0.840 | 2 | Estimate |
| Adriatic ABA | 0.830 | 2 | Estimate |
| Serie A Italy | 0.830 | 2 | Estimate |
| LNB France | 0.820 | 2 | Estimate |
| Israel BSL | 0.810 | 2 | Estimate |
| EuroCup / BCL | 0.800 | 3 | Estimate |
| CBA China | 0.800 | 3 | Estimate |
| BBL Germany | 0.790 | 3 | Estimate |
| B.League Japan | 0.780 | 3 | Estimate |
| G-League | 0.780 | 3 | Estimate |
| KBL South Korea | 0.750 | 3 | Estimate |
| NBB Brazil | 0.730 | 4 | Estimate |
| PBA Philippines | 0.720 | 4 | Estimate |
| LNB France Pro B | 0.720 | 4 | Estimate |
| Liga Nacional Argentina | 0.720 | 4 | Estimate |
| Pro A Germany | 0.710 | 4 | Estimate |
| UK BBL | 0.700 | 4 | Estimate |
| Lower European domestic | 0.650-0.700 | 4/5 | Estimate |
| African leagues (BAL, domestic) | 0.600-0.650 | 5 | Estimate |
| Southeast Asian leagues | 0.620 | 5 | Estimate |
| Semi-pro / minor leagues | 0.550-0.600 | 5 | Estimate |

## College-to-Pro Note
There is NO lambda translation from college to pro. These are separate evaluation pipelines. The college-to-pro translation happens through component KR adjustments, pro OPF reweighting, and anchoring against the Pro Player KR Legend. Pro lambdas are for comparing BETWEEN pro leagues only.

## Governance
- All lambdas v0 provisional. Updates require versioning. NBA lambda always 1.000.

`;


export const FILE_03 = `Team KR Eval Order

Team KR — MATH, PIPELINE &
DIAGNOSTICS
0. Scope
This is the single authoritative document for Team KR computation. It replaces:
● Team KR Math & Weights
● Team KR — Eval Order
Team KR is the rotation-weighted aggregation of players' Final System KRs under the selected
Program Context, with system-role weighting, usage-informed offensive weights, physical
environment adjustment, and level-contextual offense/defense splits.
Team KR does not evaluate players. It consumes finalized player outputs from upstream.
1. Inputs (Non-Negotiable)
Team KR consumes only:
Per player in rotation:
● Final_System_Offense_KR_i (from Player System Fit layer)
● Final_System_Def_KR_i (from Player System Fit layer)
● Minutes played (official game logs or coach-entered)
● Usage% (actual from Synergy/PlayVision, estimated from box score, or unavailable)
● Offensive archetype demand tier (A/B/C/No-match) for selected offensive system
● Defensive archetype demand tier (A/B/C/No-match) for selected defensive system
● Matchup assignment data (if available from Synergy/PlayVision)
● Height (inches), Weight (lbs), Wingspan (inches, if available)
● Position group (PG, SG, SF, PF, C)
Per program (from Coach Context Setup):
● Governing Body / Division (and Major Class if NCAA D1)
● Offensive System + Defensive System (validated against UI System Set — 12 offense,
10 defense)
● Competitive level (from locked level list — 13 college levels)

Explicit exclusions (locked):
● No archetype recomputation
● No badge/label recomputation
● No trait recomputation
● No system-fit inference (already baked into Final System KR upstream)
● No injury/fatigue/foul trouble modeling
2. Participation Threshold
Rotation-only model. No starter/bench labels.
● MIN_PARTICIPATION = 0.05 (5% of total minutes)
● Include player i in Team KR math iff minutes_share_i ≥ MIN_PARTICIPATION
● Exclude all players below threshold from all Team KR calculations
● Evaluation window is the selected window (default: season-to-date)
3. Offensive Weight Per Player
Offensive weight determines how much each player's Final_System_Offense_KR pulls on Team
Offense KR. Three independent signals are blended based on data availability.
Three inputs:
● Usage% — who the offense runs through (50% of weight when available)
● Minutes% — who is on the court (25% of weight, or 75% when usage unavailable)
● System Role — how critical is this player's archetype to the selected offensive system
(25% of weight)
3.1 Data Tier Formulas
Tier 1 — Full data (Synergy/PlayVision tracked usage):
Off_Weight_Raw_i = (Usage%_i × 0.50) + (Minutes%_i × 0.25) + (Off_Role_Score_i × 0.25)
Tier 2 — Mid data (box score available, no film):
Off_Weight_Raw_i = (Est_Usage%_i × 0.50) + (Minutes%_i × 0.25) + (Off_Role_Score_i ×
0.25)

Where Est_Usage = (FGA + 0.44 × FTA + TOV) / (Team_FGA + 0.44 × Team_FTA +
Team_TOV)
Tier 3 — Low data (minutes only):
Off_Weight_Raw_i = (Minutes%_i × 0.75) + (Off_Role_Score_i × 0.25)
3.2 System Role Multipliers (Locked, Flat)
The Off_Role_Score_i is derived from the player's offensive archetype mapped against the
selected offensive system's demand profile:
Demand Tier Multiplier
A (Critical) 1.20
B (High) 1.00
C (Optional) 0.85
No match 0.70
Multipliers are flat. They do not scale with usage — usage already captures volume
independently. Scaling with usage would double-count.
3.3 Normalization
After computing Off_Weight_Raw for all included players:
Off_Weight_i = Off_Weight_Raw_i / Σ Off_Weight_Raw
All offensive weights sum to 1.0.
4. Defensive Weight Per Player
Defensive weight determines how much each player's Final_System_Def_KR pulls on Team
Defense KR. Two or three inputs are blended based on data availability.
Three inputs (when matchup data exists):
● Minutes% — defensive presence is about being on the court (50% of weight)
● System Role — how critical is this player's archetype to the selected defensive system
(40% of weight)
● Matchup Assignment — who are they guarding? (10% of weight)

Two inputs (no matchup data):
● Minutes% — 60% of weight
● System Role — 40% of weight
4.1 Data Tier Formulas
Tier 1 — Full data (Synergy/PlayVision matchup tracking available):
Def_Weight_Raw_i = (Minutes%_i × 0.50) + (Def_Role_Score_i × 0.40) +
(Matchup_Importance_i × 0.10)
Tier 2 — No matchup data:
Def_Weight_Raw_i = (Minutes%_i × 0.60) + (Def_Role_Score_i × 0.40)
Note: System Role stays at 40% in both tiers. The scheme's structural importance does not
change based on data availability. Only minutes and matchup trade off against each other.
4.2 System Role Multipliers
Same as offense: A = 1.20, B = 1.00, C = 0.85, No match = 0.70. Applied to the defensive
archetype mapped against the selected defensive system's demand profile.
4.3 Matchup Importance Score
Activates only when Synergy/PlayVision matchup tracking data is available.
Computation:
Step 1 — For each game in the evaluation window, rank opponent players by offensive
usage/production (offensive threat level). Opponent's #1 offensive option = hardest matchup.
Step 2 — For each of our rotation players, compute Assignment_Difficulty_i = weighted average
of (opponent player threat rank × possessions defended against them) across the evaluation
window.
Step 3 — Normalize across rotation so Assignment_Difficulty scores sum to 1.0. This becomes
Matchup_Importance_i.
What it captures: A player taking harder assignments than their archetype suggests gets a
defensive weight bump. A player hiding on the weakest perimeter player gets a reduction.
What it ignores: Defensive performance (PPP allowed, contest rates). Player quality is already
in the Final System Def KR. Matchup Importance captures deployment, not results.

4.4 Normalization
After computing Def_Weight_Raw for all included players:
Def_Weight_i = Def_Weight_Raw_i / Σ Def_Weight_Raw
All defensive weights sum to 1.0.
5. Coverage Modifier (Bench Adjustment)
The coverage modifier adjusts player weights based on whether bench players fill system
demands that the top rotation leaves uncovered.
5.1 Identify Top-5 and Bench
● Top 5 = five players with highest minutes share
● Bench = all other included players (above 5% threshold)
5.2 Map Gaps
Using the System Demand Profiles for the selected offensive and defensive systems:
● Map each A/B/C demand to the top-5 players' archetypes
● Identify uncovered demands (no top-5 player fills them)
5.3 Apply Coverage Modifiers to Bench Players
Bench Player Fills... Weight Bonus (applied to raw weight before
normalization)
An uncovered A (Critical) +0.10
demand
An uncovered B (High) demand +0.05
An uncovered C (Optional) +0.00
demand
No uncovered demand −0.03
(redundant)
Rules:
● Only one coverage bonus per player (highest applicable)

● Modifier applies to the side where the gap exists (offense, defense, or both)
● Redundant = player's archetype duplicates a top-5 player without filling any new demand
● Re-normalize all weights after coverage modifiers so sums remain 1.0
● Coverage modifiers apply after Steps 3 and 4, before Step 6
6. Physical Environment Modifier
The Physical Environment Modifier captures how much a player's size-dependent traits are
amplified or suppressed relative to the physical profile of the competitive level they're playing at.
This modifier does NOT change Player KR. Player KR is locked truth. This modifier adjusts the
player's WEIGHT in the Team KR computation to reflect how much impact their physical traits
produce at this specific level.
6.1 Why This Exists
A 7'1" 275 center has the same Player KR whether he plays at NAIA or D1 High-Major. But his
impact on Team KR is different:
● At NAIA (avg C: 6'7" 225), his rim protection, rebounding, and finishing are amplified by
the physical mismatch.
● At D1 HM (avg C: 6'10" 245), his traits produce expected impact — no amplification.
Without this modifier, Team KR underestimates teams with significant physical advantages and
overestimates teams with physical disadvantages relative to their level.
6.2 Level Physical Profile Reference
Preloaded reference data. Calibrated from actual roster data as the Global Database grows.
Level Avg PG Avg SG Avg SF Avg PF Avg C
D1 HM 6'2" 190 6'5" 205 6'7" 215 6'8" 230 6'10" 245
D1 MM 6'1" 185 6'4" 200 6'6" 210 6'7" 225 6'9" 235
D1 LM 6'0" 180 6'3" 195 6'5" 205 6'7" 220 6'8" 230
D2 6'0" 178 6'3" 192 6'5" 202 6'6" 218 6'8" 228
D3 6'0" 178 6'2" 190 6'4" 200 6'6" 215 6'8" 225
NAIA 5'11" 175 6'2" 188 6'4" 198 6'6" 212 6'7" 225

NJCAA D1 6'1" 182 6'3" 195 6'5" 205 6'7" 220 6'8" 230
NJCAA D2 5'11" 175 6'2" 188 6'4" 198 6'5" 210 6'7" 222
NJCAA D3 5'10" 172 6'1" 185 6'3" 195 6'5" 208 6'6" 218
CCCAA 6'0" 178 6'2" 190 6'4" 200 6'6" 215 6'7" 222
USCAA 5'10" 170 6'1" 183 6'3" 193 6'5" 205 6'6" 215
NCCAA D1 5'11" 175 6'2" 188 6'4" 198 6'5" 210 6'7" 222
NCCAA D2 5'10" 172 6'1" 185 6'3" 195 6'4" 205 6'6" 215
6.3 Size-Dependent Trait Ratio by Position
Not all traits benefit from size. The percentage of a position's impact that comes from
size-dependent traits:
Positio Size-Dep Offense % Size-Dep Defense
n %
PG 10% 15%
SG 15% 20%
SF 20% 25%
PF 30% 35%
C 40% 45%
Size-dependent traits: Finishing at rim, screen setting, post scoring, rebounding, roll finishing,
rim protection, shot blocking, post defense, contest rate, deterrence.
Non-size-dependent traits (NOT modified): Shooting, ball handling, passing, decision-making,
basketball IQ, lateral quickness, help positioning, communication.
6.4 Computation
Step 1: Physical Delta per player
Height_Delta_i = Player_Height_inches − Level_Avg_Height_at_Position (in inches)
Weight_Delta_i = Player_Weight_lbs − Level_Avg_Weight_at_Position (in lbs)
Step 2: Physical Environment Modifier per player

Physical_Env_Mod_i = 1.0 + (Height_Delta_inches × 0.008) + (Weight_Delta_lbs × 0.001)
Bounded: minimum 0.92, maximum 1.12.
Step 3: Apply to weights
For offense: Off_Weight_Adjusted_i = Off_Weight_i × (1.0 + (Physical_Env_Mod_i − 1.0) ×
Size_Dep_Off_Pct)
For defense: Def_Weight_Adjusted_i = Def_Weight_i × (1.0 + (Physical_Env_Mod_i − 1.0) ×
Size_Dep_Def_Pct)
Step 4: Re-normalize all offensive and defensive weights to sum to 1.0.
6.5 Cross-Level Matchup Rule
When Team A plays an opponent at a DIFFERENT competitive level:
● Physical Environment Modifier is recomputed against the OPPONENT'S level averages
● This means a team's Team KR is different in their NAIA games vs their D1 games
● The physical advantage is larger against NAIA and smaller against D1
● Team KR reflects the reality of each specific matchup
In simulation, when computing a cross-level game, both teams' Physical Environment Modifiers
are computed independently against the opposing team's level averages.
6.6 Rules (Locked)
● Does NOT change Player KR. Player KR is locked truth.
● Adjusts WEIGHTS only, not KR values.
● Bounded: 0.92 to 1.12 per player.
● Level averages are preloaded, calibrated from roster data, updated annually.
● Applies AFTER Coverage Modifier (Step 5), BEFORE final normalization (Step 7).
● Position-level Size-Dependent Trait % is fixed. Does not vary by system or archetype.
7. Final Normalization
After Steps 3–6 (offensive weights, defensive weights, coverage modifier, physical environment
modifier):
Re-normalize all offensive weights so Σ Off_Weight_i = 1.0.
Re-normalize all defensive weights so Σ Def_Weight_i = 1.0.

8. Team Offense KR
Team_Off_KR = Σ (Final_System_Off_KR_i × Off_Weight_i)
Where Off_Weight_i includes usage, minutes, system role, coverage modifier, and physical
environment modifier contributions, fully normalized.
Interpretation: reflects the offense you can run in your selected offensive system, weighted by
who the offense actually runs through, how critical each player is to the scheme, and how much
their physical profile amplifies their offensive impact at this level.
9. Team Defense KR
Team_Def_KR = Σ (Final_System_Def_KR_i × Def_Weight_i)
Where Def_Weight_i includes minutes, system role, matchup importance (if available), coverage
modifier, and physical environment modifier contributions, fully normalized.
Interpretation: reflects the defense you can sustain in your selected defensive system, weighted
by who the scheme depends on, who takes the hardest assignments, and how much their
physical profile amplifies their defensive impact at this level.
10. Overall Team KR (Level-Contextual Split)
Team_KR = (Team_Off_KR × Off_Pct) + (Team_Def_KR × Def_Pct)
The offense/defense split varies by level. At higher levels, offensive talent separates teams. At
lower levels, defense, structure, and rebounding become the primary differentiators.
Level Off% Def%
D1 High-Major 55 45
D1 Mid-Major 52 48
D1 Low-Major 48 52
NCAA D2 47 53

NCAA D3 46 54
NAIA 49 51
NJCAA D1 52 48
NJCAA D2 47 53
NJCAA D3 45 55
CCCAA 51 49
USCAA 45 55
NCCAA D1 48 52
NCCAA D2 45 55
Empirical basis (D1 HM): KenPom research shows offense has 64% control over points per
possession outcomes. NCAA.com nine-year analysis found offensive rating approximately 50%
more important than defensive rating for NCAA tournament success. Average national
champion ranks ~21st in offense, ~42nd in defense. 23 of 24 recent champions were top 21 in
adjusted offensive efficiency.
Lower levels: No equivalent empirical research exists. Splits are derived from basketball logic:
as you descend in level, elite offensive creators become scarcer, rosters are thinner, and games
are won by defensive structure, rebounding, and not beating yourself. The pattern follows the
established direction at the top.
11. Depth Handling
Depth is not a separate variable. It emerges deterministically:
● Deeper teams distribute weight across more playable contributors
● Shallow teams concentrate weight into fewer players
● The coverage modifier rewards bench players who fill structural gaps
● The physical environment modifier amplifies depth advantages at levels where physical
mismatches are larger
No artificial depth bonus or penalty exists. Injuries, fatigue, and foul trouble are not modeled in
Team KR math.

12. Diagnostics Layer
Diagnostics execute after Team KR is computed. They do not change any Team KR value. They
provide coach-facing explanation and actionable intelligence.
12.1 System Fit % (Three Outputs)
Answers: "How well does your roster fit the system you selected?"
Computation:
For the selected system (offense and defense separately), load the demand profile. For each
demand:
● Covered = a rotation player's archetype matches this demand
● Coverage_Score = 1.0 if covered by a top-5 player, 0.7 if covered by bench only, 0.0 if
uncovered
Demand priority weights:
● A (Critical) = 3x
● B (High) = 2x
● C (Optional) = 1x
Offensive_Fit% = Σ (Demand_Priority_Weight × Coverage_Score) / Max_Possible_Score × 100
Defensive_Fit% = same logic for defensive system.
Overall_Fit% = (Offensive_Fit% × Level_Off_Pct) + (Defensive_Fit% × Level_Def_Pct)
Using the same level-contextual split from Section 10.
Interpretation:
● 90–100% = roster is built for this system
● 75–89% = good fit, minor gaps
● 60–74% = functional but has real holes
● Below 60% = system mismatch
Rule: Fit% does not modify Team KR. A coach can use Fit% to decide whether to change
systems — which would trigger a re-evaluation of all Final System KRs upstream, producing a
different Team KR on the next computation.
12.2 Coverage Map
Answers: "Which system demands are covered, by whom, and how heavily?"

A table mapping each demand from both the offensive and defensive system profiles to the
rotation player(s) covering it, their participation weight, and coverage status (Covered /
Bench-Only / Uncovered).
Display object. Does not modify Team KR.
12.3 Missing Demands
Answers: "What does your roster NOT have that your system needs?"
Pulled from the Coverage Map. Two categories:
● Uncovered: no rotation player fills this demand
● Under-covered: demand filled only by a bench player with less than 8% participation
weight (fragile — one injury and it's gone)
Each missing demand includes priority level (A/B/C) and a plain-language basketball
consequence pulled from the "Critical-missing risk" notes in System Demand Profiles.
Display object. Does not modify Team KR.
12.4 Fragility Flags
Answers: "Where is your team one injury away from breaking?"
Condition Flag
An A-tier demand covered by only ONE Single-Point Failure — system identity breaks if
rotation player this player is out
A player carries >25% of total offensive Offensive Concentration — offense is heavily
weight dependent on one player
A player carries >25% of total defensive Defensive Concentration — defense disappears
weight when this player sits
Top 5 players carry >85% of combined Depth Fragility — bench provides minimal
weight (offense or defense) marginal value
Two or more A-tier demands covered by Role Overload — no single player can sustain
the same player both at full capacity over a season
Fragility flags are informational. They do not change Team KR. They compound — a team with
3+ flags is structurally fragile regardless of the Team KR number.
12.5 Physical Environment Summary

Answers: "How much does your team's physical profile amplify or suppress impact at this
level?"
Display object showing:
● Per-player physical delta vs level average at their position
● Per-player Physical Environment Modifier value
● Team-level net physical advantage (average modifier across rotation, weighted by
minutes)
● Positions with the largest advantage (e.g., "Center position: +6 inches, +50 lbs over level
average — largest physical mismatch on roster")
Does not modify Team KR (already applied in Step 6). Provides coach-facing transparency on
WHERE the physical advantage exists.
13. Level Interpretation
MUST PULL FROM: Team KR Legend
Using the locked level environment from Coach Context Setup:
● Translate Overall_Team_KR → tier label from Team KR Legend
● Output: "At [Level], this Team KR of [value] = [Tier Label]."
14. Team Confidence Gate (Final Stamp)
MUST PULL FROM: Team Confidence Gate table (locked ranges)
Outputs:
● team_kr_confidence_pct
● coverage_confidence_pct
Additional confidence adjustments based on data tier:
Data Tier Confidence Impact
Tier 1 — Full (Synergy/PlayVision tracked usage + No penalty (baseline from Confidence
matchup + minutes) Gate table)

Tier 2 — Mid (box score estimated usage, no Moderate penalty (usage is estimated,
matchup) matchup absent)
Tier 3 — Low (minutes only, no usage, no matchup) Larger penalty (offensive weighting
less precise)
Rule: Confidence does not change Team KR math. It communicates evidence completeness
and stability.
15. Output Summary
Team KR computation returns:
● Team_Off_KR
● Team_Def_KR
● Team_KR (overall)
● Offensive_Fit%
● Defensive_Fit%
● Overall_Fit%
● Coverage Map (diagnostic object)
● Missing Demands (diagnostic list)
● Fragility Flags (diagnostic list)
● Physical Environment Summary (diagnostic object)
● Tier Label (from Level Interpretation)
● team_kr_confidence_pct
● coverage_confidence_pct
All computational outputs are deterministic: same inputs → same outputs.
16. Execution Order (Pipeline)
Ste Operation Source
p
0 Coach Context Setup — lock program, level, systems Coach Inputs
1 System Load + Validation — validate system names UI System Set + System
(12 offense, 10 defense), load demand profiles Demand Profiles

2 Roster Player Outputs Loaded — Final System Off/Def Player System Fit (upstream)
KR per player
3 Participation Threshold — include players ≥ 5%, Minutes data
exclude below
4 Offensive Weights Built — usage + minutes + system Usage data + Minutes +
role, per data tier Demand Profiles
5 Defensive Weights Built — minutes + system role + Minutes + Demand Profiles +
matchup, per data tier Matchup data
6 Coverage Modifier Applied — bench adjustment for Demand Profiles + Archetype
gap-filling vs redundancy mapping
6.5 Physical Environment Modifier Applied — Player height/weight + Level
size-dependent trait amplification by level physical averages
7 Re-normalize all weights — offensive and defensive —
weights each sum to 1.0
8 Team Offense KR — weighted aggregation Final System Off KRs × Off
Weights
9 Team Defense KR — weighted aggregation Final System Def KRs × Def
Weights
10 Overall Team KR — level-contextual off/def split Off/Def split table
11 Diagnostics — Fit%, Coverage Map, Missing Demand Profiles + Coverage
Demands, Fragility Flags, Physical Environment data + Physical data
Summary
12 Level Interpretation — translate to tier label Team KR Legend
13 Team Confidence Gate — final stamp Confidence Gate table +
Data tier
Governance Notes
● Team KR is produced by Nexus. No manual override exists.
● Team KR Legend is display-only. No evaluation logic lives there.
● System Demand Profiles and UI System Set (12 offense, 10 defense) are consumed but
not modified by Team KR.

● All upstream player evaluations (traits, archetypes, badges, system fit, overrides) are
immutable by the time Team KR executes.
● Team KR is contextual: change the system selection, and all Final System KRs change
upstream, producing a different Team KR on re-computation. This is by design — it
allows coaches to test "what if we switched to Motion offense?" scenarios.
● The Physical Environment Modifier is contextual: the same team has different physical
environment adjustments when playing against different levels. This is by design — it
accurately reflects how physical mismatches vary by competition.
● Level physical averages are preloaded reference data that improves as more programs
join the platform and contribute roster data to the Global Database.
UI / GOVERNANCE NOTE
Computation document only. All values are produced by Nexus. No manual override of
computed values. Team KR Legend, Team Confidence Gate, System Demand Profiles, and UI
System Set are consumed but not modified here. The Physical Environment Modifier adjusts
weights only — it never modifies Player KR.

Team KR Legend

NCAA Division I — High-Major (HM)
Season-Level Output Interpretation
Context assumptions: Power-conference ecosystem (Big Ten, SEC, ACC, Big 12, Big East,
plus elite independents). National recruiting depth. Heavy Top-100 opponent load. Postseason
survival requirements across multi-game tournaments.
TEAM KR TIERS (DISPLAY / READ-ONLY)
96–100 — National Title Favorite
● Controls games on both ends
● Redundant creators and stoppers
● Survives variance across a 6-game tournament
● Title is a probable outcome, not an upset
93–95 — Final Four–Capable
● Top-2 seed profile
● Multiple high-level creators
● Some matchup risk, but deep run is realistic
90–92 — Tournament Lock (Top-4 Seed Range)
● Strong regular-season resume
● Multiple reliable options
● Ceiling depends on draw and health
88–89 — Tournament Team (5–8 Seed)
● One clear anchor
● Functional but matchup-sensitive
● Second-weekend upside, no margin for error
85–87 — Bubble Team / ~.500
● High volatility
● One or two real strengths, one fatal flaw
● Record often masks talent swings
82–84 — Likely Losing Record
● Upset wins possible
● Inconsistent execution

● Late-game fragility
78–81 — Clear Losing Record
● Structural limitations
● No tournament path
● Developmental or transitional season
Below 78 — Non-Competitive
● Talent ceiling caps outcomes
● Wins are situational, not sustainable
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCAA Division I — Mid-Major (MM)
Season-Level Output Interpretation
Context assumptions: High-end mid-major ecosystem (A-10, MVC, Mountain West, AAC,
WCC non-elite years, top C-USA, Big West, etc.). Regional + selective national recruiting, fewer
elite athletes than HM, thinner redundancy, heavier reliance on top 1–2 players. At-large access
exists but is fragile; auto-bids dominate postseason paths.
TEAM KR TIERS (DISPLAY / READ-ONLY)
96–100 — National Title Outlier (Rare)
● Extremely rare at MM level
● One of the best non-HM teams of the decade
● Can beat HM teams on neutral floors consistently
● Sweet 16+ is realistic; title path exists with bracket + variance
93–95 — Deep Tournament Threat
● Top-10 to top-15 caliber nationally
● Elite efficiency relative to schedule
● High-major upset expected, not shocking
● Sweet 16 ceiling; Elite Eight requires luck
90–92 — Tournament Lock (At-Large Profile)
● Clear at-large team

● Conference title contender
● Round-of-32 baseline; Sweet 16 possible
● Metrics carry more weight than resume volume
88–89 — Tournament Team (Auto-Bid / Bubble At-Large)
● One clear high-end anchor
● Solid rotation, limited redundancy
● One-game upset potential
● Ceiling highly matchup-dependent
85–87 — Bubble Team / High Variance
● Can win league, can miss tournament
● Flawed roster construction
● At-large hopes fragile
● Often finishes near .500 vs quality opponents
82–84 — Winning Record, No NCAA Tournament
● Strong regular season in-league
● Lacks top-end shot-making or depth
● Upsets occur, consistency does not
● NIT / secondary postseason profile
78–81 — Losing Record vs Quality Competition
● Wins mostly vs bottom-half teams
● Competitive in spurts
● No postseason path
● Developmental or rebuilding season
74–77 — Clear Losing Record
● Bottom-third of conference
● Structural roster limitations
● Upsets rare and situational
● Predictable season outcomes
Below 74 — Non-Competitive
● Conference cellar
● Negative efficiency margins
● Talent ceiling caps outcomes
● Development-only or reset year

UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCAA Division I — Low-Major (LM)
Season-Level Output Interpretation
Context assumptions: Low-resource D1 ecosystem (SWAC, MEAC, NEC, Southland, OVC
low tier, Big South low tier). Local/regional recruiting, thin margins, limited redundancy, and
heavy dependence on 1–2 players. Most teams cannot absorb injuries, foul trouble, or scouting
exposure.
TEAM KR TIERS (DISPLAY / READ-ONLY)
96–100 — National Title Outlier / Extreme Upset Path
● Extremely rare at LM level
● Can win multiple NCAA tournament games with perfect bracket + shooting variance
● Dominates league; metrics far exceed peers
● One of the best low-major teams of the decade
93–95 — Tournament Giant-Killer (Round-of-32 Ceiling)
● Clear best team in conference
● Elite efficiency relative to league
● First-round upset expected, not shocking
● Second-weekend run requires matchup luck
90–92 — Tournament Lock (Auto-Bid Favorite)
● Conference title favorite
● One true high-end anchor
● Wins league games consistently
● NCAA win possible; consistency fragile
88–89 — Tournament Team (Auto-Bid Contender)
● Top-2 or top-3 in conference
● Heavy reliance on star player
● Can win conference tournament
● NCAA ceiling depends on draw
85–87 — Winning Record / Conference Contender

● Above-average roster
● Flawed but competitive
● Finishes top-half of league
● No at-large path; auto-bid only
82–84 — Middle-of-Pack
● Inconsistent outcomes
● Can beat anyone in league, lose to anyone
● Record near .500
● Talent gaps exposed late in games
78–81 — Losing Record (Lower-Half Conference Team)
● Structural limitations
● Limited shot creation
● Wins mostly vs bottom teams
● Developmental or transition season
74–77 — Clear Losing Record
● Bottom-third of conference
● One-dimensional roster
● Rare upset potential
● Predictable season outcomes
Below 74 — Non-Competitive
● Conference cellar
● Negative margins most nights
● Roster talent caps outcomes
● No realistic postseason path
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCAA Division II
Season-Level Output Interpretation
Context assumptions: True D2 ecosystem (MIAA, G-MAC, Sunshine State, PSAC, GLIAC,
RMAC). Regional recruiting, strong coaching parity, solid depth at the top. Best teams can upset
bad D1 teams but are not season-competitive with average D1 rosters.

TEAM KR TIERS (DISPLAY / READ-ONLY)
84–100 — National Title Favorite
● Best teams in the country
● Multiple All-American–level D2 players
● Control games within D2; survive tournament variance
● Project as very bottom-tier D1 teams in one-off contexts
● Championship is the expected outcome within D2
80–83 — National Championship Contender
● Legit title path
● Deep, disciplined rosters
● Dominant vs most D2 peers
● Can upset bad D1 teams on neutral floors
76–79 — Elite Regional Power
● Regional title contender
● National semifinal upside
● Strong execution; ceiling capped by athleticism gaps
● Comparable to weak D1 rosters
72–75 — National Tournament Lock
● Safely in the field
● Can win regional games
● One or two exploitable weaknesses
● Ceiling depends on matchup draw
68–71 — Regional Tournament Team
● Above-average D2 program
● Competitive within conference
● Limited national impact
● Depth begins to thin
64–67 — Middle-of-Pack
● Near .500
● Can beat strong teams on good nights
● Inconsistent execution
● Development-focused season
60–63 — Losing Record

● Bottom half of conference
● Structural roster limitations
● No realistic tournament path
● Transition or rebuilding year
Below 60 — Non-Competitive
● Conference cellar
● Negative margins most nights
● Talent ceiling caps outcomes
● High roster-turnover risk
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCAA Division III
Season-Level Output Interpretation
Context assumptions: No athletic scholarships. Roster construction limited by academic fit and
willingness to play without athletic aid. Strong coaching and scheme execution separate top
programs (NESCAC, ODAC, MIAC, CCC, etc.). Depth varies widely; top programs are
disciplined and veteran-heavy, lower tiers are thin and volatile.
TEAM KR TIERS (DISPLAY / READ-ONLY)
72–100 — National Title Favorite
● Best D3 teams in the country
● Multiple standout players with strong two-way production
● Veteran cores, deep rotations relative to D3
● Championship is the expected outcome within D3
● Can compete with bottom-tier D2 teams in one-off contexts
68–71 — National Championship Contender
● Legit title path
● One or two high-end anchors + functional rotation
● Disciplined execution
● Ceiling capped vs elite D3 athleticism
64–67 — Elite Regional Power
● Conference / region title contender

● National semifinal upside
● Competitive nationally
● One or two exploitable weaknesses
60–63 — National Tournament Lock
● Safely qualifies
● Can win regional games
● Ceiling capped by depth or athleticism
● Matchup-dependent in tournament
56–59 — Regional Tournament Team
● Above-average D3 program
● Competitive within conference
● Limited national impact
● Depth thins quickly past top 6
52–55 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
● Talent gaps exposed against quality opponents
48–51 — Losing Record
● Bottom half of conference
● Structural roster limitations
● No realistic tournament path
● Rebuilding or transition year
Below 48 — Non-Competitive
● Conference cellar
● Negative margins most nights
● Roster talent caps outcomes
● Development or reset year
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NAIA

Season-Level Output Interpretation
Context assumptions: Merged single-division NAIA ecosystem (Heart, GPAC, SSAC,
Cascade, Crossroads, Sooner, Mid-South, KCAC, Frontier, Red River, etc.). Approximately 250
member institutions. Scholarship flexibility with up to 8 athletic scholarships per team. Older
rosters than JUCO, less depth than D2. Best teams are highly organized, physical, and
veteran-heavy. 64-team single-elimination national tournament. NAIA sits between D2 stability
and JUCO volatility.
TEAM KR TIERS (DISPLAY / READ-ONLY)
80–100 — National Title Favorite
● Best NAIA teams in the country
● Multiple All-American–level NAIA players
● Veteran-heavy, disciplined, physical
● Can beat bad D2 teams and compete with bottom-tier competent D2
● Championship is the expected outcome within NAIA
76–79 — National Championship Contender
● Legit title path
● Strong top-end + solid rotation
● Can make deep national runs
● Ceiling capped vs elite D2 athleticism
72–75 — Elite National Tournament Team
● National tournament lock
● Can win multiple games
● One or two real weaknesses
● Matchup-dependent ceiling
68–71 — National Tournament Team
● Consistent qualifier
● Competitive but flawed
● Upset potential present, consistency limited
64–67 — Regional Power
● Strong conference team
● Can qualify, struggles nationally
● Depth begins to thin
60–63 — Middle-of-Pack

● Near .500
● Can beat strong teams on good nights
● Inconsistent execution
56–59 — Losing Record
● Bottom half of conference
● Structural roster limitations
● No realistic title path
Below 56 — Non-Competitive
● Development or rebuild year
● Negative margins most nights
● Roster turnover common
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NJCAA Division I
Season-Level Output Interpretation
Context assumptions: Athletic, fast JUCO D1 ecosystem. Real NBA/D1 transfer pipeline talent
passes through. 2-year eligibility max creates high roster volatility. Best teams are explosive but
inconsistent season-to-season. Strong coaching can stabilize, but depth is fragile.
TEAM KR TIERS (DISPLAY / READ-ONLY)
78–100 — National Title Favorite
● Best NJCAA D1 teams nationally
● Multiple players with D1 upside or transfer pedigree
● Athletic, deep, well-coached
● Championship is the expected outcome within NJCAA D1
74–77 — National Championship Contender
● Legit title path
● One or two elite individual talents
● Deep enough to survive tournament variance
● Can beat bad D2 / low-major D1 teams in one-off contexts
70–73 — Elite Regional Power

● Conference / region title contender
● National semifinal upside
● Strong execution; ceiling capped by depth volatility
66–69 — National Tournament Lock
● Safely qualifies
● Can win tournament games
● One or two exploitable weaknesses
● Matchup-dependent ceiling
62–65 — Regional Tournament Team
● Above-average NJCAA D1 program
● Competitive within conference
● Limited national impact
● Depth thins quickly
58–61 — Middle-of-Pack
● Near .500
● Competitive in spurts
● High roster turnover impacts consistency
54–57 — Losing Record
● Bottom half of conference
● Structural roster limitations
● No realistic title path
Below 54 — Non-Competitive
● Development or reset year
● Negative margins most nights
● High roster churn
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NJCAA Division II
Season-Level Output Interpretation

Context assumptions: Step down in athleticism from NJCAA D1. More structure-dependent.
Regional recruiting with some transfer talent. Best teams are disciplined and veteran-heavy
relative to the division. Depth is thinner than NJCAA D1.
TEAM KR TIERS (DISPLAY / READ-ONLY)
76–100 — National Title Favorite
● Best NJCAA D2 teams nationally
● Strong guards + functional frontcourt
● Well-coached relative to division
● Championship is the expected outcome within NJCAA D2
72–75 — National Championship Contender
● Legit title path
● One or two standout players
● Limited depth but good execution
● Matchup-dependent ceiling
68–71 — Elite Regional Power
● Conference / region title contender
● Competitive nationally
● Can win tournament games, struggle vs disciplined opponents
64–67 — National Tournament Lock
● Safely qualifies
● Can win games
● Ceiling capped by athleticism and depth
60–63 — Regional Tournament Team
● Above-average NJCAA D2 program
● Can win locally
● Limited national impact
56–59 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
52–55 — Losing Record
● Bottom half of conference/region

● Structural roster limitations
● No realistic title path
Below 52 — Non-Competitive
● Development or reset year
● Negative margins most nights
● High roster churn
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
CCCAA (California Community Colleges)
Season-Level Output Interpretation
Context assumptions: California community college ecosystem (~110 member schools).
Strong California talent pipeline produces real athletes. No athletic scholarships but tuition is
minimal. 2-year eligibility. Regional conference structure. Best programs benefit from proximity
to D1/D2 transfer destinations. More athletic than NJCAA D2/D3 due to California talent base.
TEAM KR TIERS (DISPLAY / READ-ONLY)
74–100 — State / National Title Favorite
● Best CCCAA teams in the state
● Multiple players with D1/D2 transfer upside
● Athletic, well-coached, deep relative to CCCAA
● State championship is the expected outcome
70–73 — State Championship Contender
● Legit title path
● One or two standout players
● Can compete with bottom-tier NJCAA D1 teams
● Ceiling capped by depth
66–69 — Elite Regional Power
● Conference title contender
● State semifinal upside
● Strong execution; one or two exploitable weaknesses
62–65 — State Tournament Team

● Consistent qualifier
● Competitive within conference
● Limited impact at state level
● Matchup-dependent ceiling
58–61 — Regional Tournament Team
● Above-average CCCAA program
● Can win locally
● Struggles vs top-tier programs
54–57 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
50–53 — Losing Record
● Bottom half of conference
● Structural roster limitations
● No realistic title path
Below 50 — Non-Competitive
● Development or reset year
● Negative margins most nights
● High roster turnover
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NJCAA Division III
Season-Level Output Interpretation
Context assumptions: NJCAA D3 ecosystem (no athletic scholarships). Regional recruiting,
high roster churn, younger lineups, limited depth. Teams emphasize access, development, and
upward movement (to NAIA / D3 / CCCAA / NJCAA D2). Athletic ceiling is lower than CCCAA;
structure is weaker than NCAA D3.
TEAM KR TIERS (DISPLAY / READ-ONLY)
68–100 — National Title Favorite

● Best NJCAA D3 teams nationally
● Strong guards + functional frontcourt
● Well-coached relative to division
● Championship is the expected outcome within NJCAA D3
64–67 — National Championship Contender
● Legit title path
● One or two standout players
● Limited depth but good execution
● Matchup-dependent ceiling
60–63 — Elite Regional Power
● Conference / region title contender
● Competitive nationally
● Can win tournament games, struggle vs disciplined opponents
56–59 — National Tournament Lock
● Safely qualifies
● Can win games
● Ceiling capped by athleticism and depth
52–55 — Regional Tournament Team
● Above-average NJCAA D3 team
● Can win locally
● Limited national impact
48–51 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
44–47 — Losing Record
● Bottom half of conference/region
● Structural roster limitations
● No realistic title path
Below 44 — Non-Competitive
● Development or reset year
● Negative margins most nights
● High roster turnover

UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
USCAA
Season-Level Output Interpretation
Context assumptions: Small-school, independent ecosystem with limited or no athletic
scholarships. Wide variance in program seriousness and resources. Older rosters than JUCO
D3 at some schools, but thinner depth and lower athletic ceilings overall. Postseason exists, but
national outcomes are heavily talent-capped.
TEAM KR TIERS (DISPLAY / READ-ONLY)
64–100 — National Title Favorite
● Best USCAA teams nationally
● One or two clear high-end players
● Well-organized relative to division
● Championship is the expected outcome within USCAA
60–63 — National Championship Contender
● Legit title path
● Can win multiple postseason games
● Limited depth but functional execution
● Ceiling capped vs NJCAA D3 / NCAA D3 opponents
56–59 — Elite Tournament Team
● Regular postseason qualifier
● Competitive nationally
● One exploitable weakness (size, guard play, depth)
52–55 — Tournament Team
● Above-average USCAA program
● Can win games locally
● Struggles vs top-tier programs
48–51 — Middle-of-Pack
● Near .500
● Competitive in spurts

● Development-focused season
44–47 — Losing Record
● Bottom half of standings
● Structural roster limitations
● No realistic title path
Below 44 — Non-Competitive
● Minimal competitive intent
● Development, access, or club-adjacent season
● Negative margins most nights
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCCAA Division I
Season-Level Output Interpretation
Context assumptions: Faith-based athletic ecosystem with mixed scholarship rules (D1 allows
athletic aid). Programs range from serious national contenders (Grace, Bethel,
Campbellsville-type) to access-oriented institutions. Competition mostly vs NCCAA peers, with
some NAIA / USCAA / NCAA D3 crossover games. Depth varies widely; top programs are
disciplined and veteran-heavy, lower tiers are thin and volatile.
TEAM KR TIERS (DISPLAY / READ-ONLY)
66–100 — National Title Favorite
● Best NCCAA programs nationally
● Clear roster superiority within the association
● Veteran cores, strong guard play, disciplined execution
● Championship is the expected outcome within NCCAA
62–65 — National Championship Contender
● Legit title path
● One high-end anchor + functional rotation
● Can win nationals with execution and matchup luck
● Ceiling capped vs NAIA / NCAA D3 elites
58–61 — Elite Tournament Team

● Regular postseason qualifier
● Competitive nationally within NCCAA
● One or two exploitable weaknesses (size, depth, shot creation)
54–57 — Tournament Team
● Above-average NCCAA program
● Can win games locally
● Struggles vs top-tier NCCAA or crossover opponents
50–53 — Middle-of-Pack
● Near .500
● Competitive in spurts
● Development-focused season
46–49 — Losing Record
● Bottom half of standings
● Structural roster limitations
● No realistic title path
Below 46 — Non-Competitive
● Minimal competitive intent
● Development, access, or mission-first season
● Negative margins most nights
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.
NCCAA Division II
Season-Level Output Interpretation
Context assumptions: Faith-based, mission-first athletic ecosystem. No athletic scholarships
or extremely limited aid. Competition primarily vs NCCAA D2 peers, small Christian colleges,
and independents. Occasional crossover vs low-tier NCCAA D1, USCAA, or NAIA. Depth is
very thin; most teams rely on 5–7 playable pieces. Talent gaps within the division are wide.
Execution, experience, and cohesion matter more than raw athleticism.
TEAM KR TIERS (DISPLAY / READ-ONLY)
62–100 — National Title Favorite

● The elite tier of NCCAA D2 programs
● Clear roster superiority within D2
● Veteran-heavy cores with defined roles
● Disciplined guard play and low-variance execution
● Championship is a realistic expectation within NCCAA D2
● Can beat lower-tier NCCAA D1 teams in neutral settings
● Ceiling still capped vs strong NAIA / NCAA D3 programs
58–61 — National Championship Contender
● Legitimate path to winning NCCAA D2 nationals
● One high-end anchor plus functional rotation
● Clear identity on one end of the floor
● Can win nationals with execution + matchup luck
● Limited margin for error vs top-tier D2 opponents
54–57 — Elite Tournament Team
● Consistent postseason presence
● Regular national tournament qualifier
● Competitive with top D2 programs
● One or two exploitable weaknesses (depth, size, shot creation)
● Upset-capable, but not dominant
50–53 — Tournament Team
● Above-average NCCAA D2 program
● Competitive within conference play
● Can win early-round postseason games
● Lacks consistency or high-end talent to sustain deep runs
● Development-oriented roster with flashes
46–49 — Middle-of-Pack
● Functional but limited program
● Near .500 outcomes
● Competitive in spurts
● Depth issues exposed over season length
● Focused on development, culture, and retention
42–45 — Losing Record
● Bottom-half D2 program
● Structural roster limitations
● Thin rotations
● Struggles to close games

● No realistic national title path
Below 42 — Non-Competitive
● Below NCCAA D2 competitive threshold
● Minimal competitive intent
● Access- or mission-first seasons
● Large negative margins most nights
● Very high roster churn risk
UI / GOVERNANCE NOTE Display legend only. Team KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.

Team Confidence Gate

Team Confidence Gate — Full Confidence Table (Locked
Ranges)
Purpose
Confidence% is a single number that communicates evidence completeness + stability for the
team evaluation.
Outputs
● team_kr_confidence_pct ∈ [0,100]
● coverage_confidence_pct ∈ [0,100]
Computed at the end of team evaluation.
What it affects
Confidence% does not change any Team KR math. Confidence% is used for transparency and
(optionally) gating what the system is allowed to claim or trigger.
Data Tiers
V1 — Stats-Only Public box scores (league/team), roster minutes, publicly available stats.
Usage estimated from box score (FGA/FTA/TOV formula). No play-type data. No matchup
tracking. No film. Available for every organized basketball program.
V1+ — Stats + Licensed Granular V1 baseline plus third-party play-type data from a licensed
external provider. Adds actual usage tracking, play-type classification, shot profiles, and
possession-level efficiency. No matchup assignment tracking. Data quality not owned or verified
by KaNeXT. Bridge tier for opponents and portal players' former teams outside the PlayVision
camera network.
V2 — PlayVision (1 Season) KaNeXT-owned camera + processing pipeline. Single season of
processed data. Full play-type tagging, shot-type classification, possession-level data, actual
usage tracking, matchup assignment tracking, defensive assignment difficulty, spatial data. The
authoritative data source when available. Teams on the platform in year 1.
V3 — PlayVision Deep (Multi-Season) Multiple seasons of KaNeXT-owned PlayVision data
processed and archived. Full trend analysis, pattern recognition, system identity confidence
maximized. Film archive enables visual confirmation. The highest-fidelity evidence layer. Teams
on the platform in year 2+. The longer a program stays on KaNeXT, the smarter the system
gets.

Team KR Confidence %
Data available Team KR
confidence %
V1 stats-only + official rotation minutes, single season 75–84%
V1 stats-only + official rotation minutes, multi-year 78–86%
V1 stats-only + HS stats (MaxPreps etc.) + official rotation minutes 80–88%
V1 multi-year across levels (NJCAA→NAIA/NCAA, etc.) + official rotation 83–90%
minutes
V1+ licensed granular (1 year) + official stats + official rotation minutes. 86–93%
Starters mostly Full eval.
V1+ licensed granular (multi-year) + official stats + official rotation 90–96%
minutes. Rotation mostly Full eval.
V2 PlayVision (1 year) + official stats + official rotation minutes. Actual 88–95%
usage + matchup tracking. Starters mostly Full eval.
V3 PlayVision Deep (multi-year) + official stats + official rotation minutes. 92–97%
Actual usage + matchup tracking. Rotation mostly Full eval.
System Coverage Confidence %
Data available Coverage confidence
%
V1 stats-only + official rotation minutes, single season 45–60%
V1 stats-only + official rotation minutes, multi-year 50–65%
V1 stats-only + HS stats + official rotation minutes 55–70%
V1 multi-year across levels + official rotation minutes 60–75%
V1+ licensed granular (1 year) + official stats + official rotation 72–85%
minutes
V1+ licensed granular (multi-year) + official stats + official rotation 82–93%
minutes

V2 PlayVision (1 year) + official stats + official rotation minutes 75–88%
V3 PlayVision Deep (multi-year) + official stats + official rotation 85–95%
minutes
Data Tier → Weight Method Mapping (Reference)
Data Tier Offensive Weight Method Defensive Weight Method
V3 PlayVision Deep Actual usage (50%) + minutes Minutes (50%) + role (40%)
(25%) + role (25%) + matchup (10%)
V2 PlayVision Actual usage (50%) + minutes Minutes (50%) + role (40%)
(25%) + role (25%) + matchup (10%)
V1+ Licensed Granular Actual usage (50%) + minutes Minutes (60%) + role (40%)
(25%) + role (25%)
V1 Stats-Only (box score Estimated usage (50%) + Minutes (60%) + role (40%)
available) minutes (25%) + role (25%)
V1 Stats-Only (minutes Minutes (75%) + role (25%) Minutes (60%) + role (40%)
only, no box score)
Confidence Rules
● Confidence is computed once at the end of team evaluation
● Confidence does not change Team KR math
● V3 and V2 PlayVision are the only data tiers that enable matchup assignment tracking in
defensive weights
● V1+ licensed granular provides actual usage tracking but no matchup data — defensive
weights fall back to minutes + role only
● V1 stats-only uses estimated usage from box score — lower precision on offensive
weighting
● When multiple data sources are available for the same team, use the highest-fidelity
source
● Confidence ranges are defaults — the system may adjust within the range based on
sample size, roster stability, and evaluation completeness
● The product flywheel: V1 is what everyone has. V2 is what you get when you join
KaNeXT. V3 is what you get when you stay. Data depth compounds over time.

UI / GOVERNANCE NOTE
Display legend only. Confidence values are produced by Nexus. No evaluation, weighting, or
normalization logic lives here.
Lock it?

System Inference Engine

System Inference Engine — OSIE + DSIE + Protocol
0. Scope
This is the single authoritative document for system inference. It replaces:
● Offensive System Inference Engine (OSIE)
● Defensive System Inference Engine (DSIE)
● OSIE/DSIE Team System Inference Protocol
The System Inference Engine identifies what offensive and defensive systems a team actually
runs, how confidently those systems can be inferred, and how system identity evolves across a
season.
The engine is descriptive only. It labels structure. It does not evaluate quality.
1. Own Team vs Opponent Distinction
Own team: The coach selects the offensive and defensive system in Coach Context Setup.
That selection feeds Team KR — it determines system role weights, coverage map, fit%, and all
downstream outputs. OSIE/DSIE runs in the background on actual game data as an
observational diagnostic. If the observed system diverges from the coach's selection, the
system flags the gap. It does not override the coach's selection.
Opponents: OSIE/DSIE is the primary source. No coach input exists for opponent teams. The
engine infers system identity from data and that label feeds scouting, simulation, game ops, and
matchup preparation.
2. Data Tier Mapping
System inference operates at every data tier. Precision varies.
V1 — Stats-Only: Box scores, roster minutes, publicly available stats. System inference uses
proxy signals (3PA/FGA, FTA/FGA, assist rate, usage concentration, pace, rim attempt rate).
Can distinguish broad categories. Cannot distinguish fine-grained systems within a category.
System Mix is mandatory. Confidence capped at 55%.
V1+ — Stats + Licensed Granular: V1 plus third-party play-type data. Actual play-type
frequencies available. Can run full classification triggers. No PlayVision structural signals.
Confidence ceiling lower than V2/V3.

V2 — PlayVision (1 Season): Full play-type tagging, structural signals (FIVEOUT%, Ball
Screen Rate, Reversal Rate, etc.), spatial data. Full classification triggers plus PlayVision
support triggers. Highest single-season fidelity.
V3 — PlayVision Deep (Multi-Season): Multiple seasons of PlayVision data. Trend analysis,
system evolution tracking, coach identity profiling. Highest overall confidence.
PART 1: OFFENSIVE SYSTEM INFERENCE ENGINE (OSIE)
3. Purpose
OSIE identifies what offensive system a team actually runs, how fast they play, and how
confidently that system can be inferred.
OSIE is descriptive only.
OSIE does not:
● Modify player ratings or KRs
● Alter archetypes
● Affect system fit or valuation
● Influence usage or rotation
● Change any simulation logic
OSIE outputs labels + confidence, consumed downstream by:
● Team KR pipeline (system role weighting, coverage map, fit%)
● Simulation Engine
● Matchup interaction layers
● Calibration and variance logic
4. Outputs
4.1 Primary Offensive System One of the 11 locked offensive systems (Section 5).
4.2 System Confidence % Numeric confidence score (0–100%) representing certainty that the
Primary System is correct. Feeds variance inflation in simulation. Governs mixture simulation.
Does not change means.
4.3 System Mix (Conditional) Returned only if dominance criteria are not met. Top 2 (or top 3,
max) systems with mix shares (%) summing to 100%.
4.4 Offensive Pace Profile

● PACE100 (numeric)
● Pace Band: Fast ≥ 74.0 / Neutral 68.0–73.9 / Slow ≤ 67.9 PACE100 is always returned
even if band confidence is low.
4.5 Heliocentric Anchor Position (Conditional) Returned only if Primary System =
Heliocentric. Anchor position ∈ PG / CG / Wing / Forward / Big.
5. Offensive System Set (Locked)
1. Spread Pick-and-Roll
2. 5-Out Motion
3. Motion / Read & React
4. Pace & Space
5. Dribble Drive
6. Princeton
7. Flex
8. Swing
9. Post-Centric / Inside-Out
10. Moreyball
11. Heliocentric
System IDs must exactly match System × System interaction docs, Archetype × System
interaction docs, and Team KR pipeline references. No aliases permitted.
6. Classification Order (Locked)
To prevent false positives, systems are evaluated in this order. First system to meet dominance
criteria wins.
1. Heliocentric
2. Moreyball
3. Post-Centric / Inside-Out
4. Dribble Drive
5. Spread Pick-and-Roll
6. 5-Out Motion
7. Motion / Read & React
8. Princeton
9. Flex
10. Swing
11. Pace & Space
7. Offensive Classification Triggers
All percentages are half-court possession frequency (HC%) unless noted.

7.1 Spread Pick-and-Roll
Primary Triggers (all must be met):
● PnR Ball Handler % ≥ 18% HC
● PnR Roll Man % ≥ 7% HC
● 3PA/FGA ≥ 33%
● Spot-Up % ≥ 15% HC
Support Triggers:
● Isolation % ≤ 12%
● Assist Rate ≥ 48%
● 3+ players attempting 1.5+ threes per game
● Post-Up % ≤ 6%
PlayVision (V2/V3) Support:
● Ball Screen Rate ≥ 22%
● Re-screen Rate present
7.2 5-Out Motion
Primary Triggers:
● Post-Up % ≤ 4% HC
● 3PA/FGA ≥ 35%
● Cut % ≥ 8% HC
● Spot-Up % ≥ 18% HC
Support Triggers:
● Assist Rate ≥ 52%
● No single player usage ≥ 28%
● Off-Screen % ≥ 5%
● PnR Ball Handler % ≤ 16%
PlayVision (V2/V3) Support:
● FIVEOUT % ≥ 40%
● Reversal Rate ≥ 15%
● Continuity Rate ≥ 12%
7.3 Motion / Read & React
Primary Triggers:

● Assist Rate ≥ 55%
● Cut % ≥ 9% HC
● DHO % ≥ 5% HC
● No single player usage ≥ 26%
Support Triggers:
● Off-Screen % ≥ 5%
● Spot-Up % ≥ 15%
● PnR Ball Handler % ≤ 18%
● 3+ players with 12%+ usage
PlayVision (V2/V3) Support:
● Reversal Rate ≥ 18%
● Continuity Rate ≥ 15%
● Backdoor Rate ≥ 3%
● No single Primary Initiator dominance
7.4 Pace & Space
Primary Triggers:
● Transition % ≥ 18%
● 3PA/FGA ≥ 35%
● Spot-Up % ≥ 18% HC
● PACE100 ≥ 71.0
Support Triggers:
● Rim Attempts/FGA ≥ 30%
● PnR Ball Handler % ≥ 12%
● Post-Up % ≤ 5%
● Cut % ≥ 6%
PlayVision (V2/V3) Support:
● Early Offense Action Time ≤ 6 seconds
● FIVEOUT % ≥ 25%
7.5 Dribble Drive
Primary Triggers:
● Rim Attempts/FGA ≥ 35%
● Isolation % ≥ 8% HC
● Spot-Up % ≥ 16% HC

● Midrange Attempts/FGA ≤ 18%
Support Triggers:
● PnR Ball Handler % ≤ 15%
● Cut % ≥ 6%
● FTA/FGA ≥ 30%
● 3PA/FGA ≥ 28%
PlayVision (V2/V3) Support:
● Split Rate ≥ 5%
● Ball Screen Rate ≤ 18%
7.6 Princeton
Primary Triggers:
● Post-Up % ≥ 8% HC
● Cut % ≥ 10% HC
● Assist Rate ≥ 52%
● Spot-Up % ≥ 12% HC
Support Triggers:
● DHO % ≥ 5%
● Off-Screen % ≥ 5%
● PACE100 ≤ 70.0
● No single player usage ≥ 28%
PlayVision (V2/V3) Support:
● Post Hub Rate ≥ 10%
● Backdoor Rate ≥ 5%
● UCLA Cut Rate ≥ 4%
● Continuity Rate ≥ 10%
7.7 Flex
Primary Triggers:
● Off-Screen % ≥ 7% HC
● Post-Up % ≥ 7% HC
● Cut % ≥ 8% HC
● Spot-Up % ≥ 14% HC
Support Triggers:

● Assist Rate ≥ 48%
● PACE100 ≤ 71.0
● Midrange Attempts/FGA ≥ 12%
● PnR Ball Handler % ≤ 15%
PlayVision (V2/V3) Support:
● Flex Action Rate ≥ 8%
● Reversal Rate ≥ 10%
7.8 Swing
Primary Triggers:
● Spot-Up % ≥ 22% HC
● Assist Rate ≥ 50%
● 3PA/FGA ≥ 33%
● No single player usage ≥ 26%
Support Triggers:
● Cut % ≥ 6%
● Off-Screen % ≥ 4%
● Post-Up % ≤ 6%
● PnR Ball Handler % ≤ 16%
PlayVision (V2/V3) Support:
● Reversal Rate ≥ 20%
● Continuity Rate ≥ 10%
7.9 Post-Centric / Inside-Out
Primary Triggers:
● Post-Up % ≥ 12% HC
● Rim Attempts/FGA ≥ 33%
● Midrange Attempts/FGA ≥ 14%
Support Triggers:
● 3PA/FGA ≤ 36%
● Spot-Up % ≥ 10%
● Assist Rate ≥ 42%
● Isolation % ≤ 10%
PlayVision (V2/V3) Support:

● Post Hub Rate ≥ 12%
● FIVEOUT % ≤ 20%
7.10 Moreyball
Primary Triggers:
● 3PA/FGA ≥ 40%
● Rim Attempts/FGA ≥ 32%
● Midrange Attempts/FGA ≤ 12%
● PnR Ball Handler % ≥ 15% HC
Support Triggers:
● Spot-Up % ≥ 18%
● FTA/FGA ≥ 28%
● Transition % ≥ 14%
● Post-Up % ≤ 5%
PlayVision (V2/V3) Support:
● Ball Screen Rate ≥ 20%
● FIVEOUT % ≥ 30%
7.11 Heliocentric
Primary Triggers:
● Single player usage ≥ 28%
● That player's ISO + PnR BH % combined ≥ 22% of team HC possessions
● 3PA/FGA ≥ 28%
● Spot-Up % ≥ 14% HC
Support Triggers:
● That player responsible for ≥ 28% of team assists
● Post-Up % ≤ 6%
● 2+ other players with usage ≤ 15%
● Assist Rate ≥ 42%
PlayVision (V2/V3) Support:
● Primary Initiator Identification confirms single dominant initiator
● FIVEOUT % ≥ 35%
8. System Scoring (Locked)

For each system:
System Score = (Primary Triggers Met × 1.0) + (Support Triggers Met × 0.5)
PlayVision support triggers count as support triggers (× 0.5).
9. Dominance Rule (Locked)
A system is classified as Primary if:
● Primary Triggers are met AND
● One of: Score lead ≥ 0.10 over next system, OR key proxy margin ≥ 8.0 HC%
If not met → System Mix required.
10. System Mix Computation (Locked)
When System Mix is returned:
1. Take top N system scores (N = 2 or 3, max 3)
2. Normalize scores into percentage shares: Mix Share = System Score / Σ(System
Scores)
3. Shares must sum to 100%
4. Primary system = highest share
11. System Confidence % Computation (Locked)
Confidence derives from dominance margin, sample size, and data completeness.
Condition Confidence
Range
Clear dominance + V2/V3 data 85–95%
Clear dominance + V1+/V1 data 70–88%
Moderate dominance 60–84%
Mix required 45–69%
Sparse / missing data ≤ 45%
V1 only, no play-type data ≤ 55%
Confidence never alters system selection. It only affects downstream variance.

PART 2: DEFENSIVE SYSTEM INFERENCE ENGINE (DSIE)
12. Purpose
DSIE identifies what defensive system a team actually runs, how aggressively and where it is
applied, and how confidently that structure can be inferred.
DSIE is descriptive only. It labels defensive structure. It does not evaluate defensive quality.
DSIE does not:
● Modify player ratings or KRs
● Alter archetypes
● Affect system fit or valuation
● Influence usage or rotation
● Change any simulation logic
DSIE outputs labels + confidence, consumed downstream by:
● Team KR pipeline
● Simulation Engine
● System × System interaction matrices
● Archetype × System interaction matrices
● Calibration and variance logic
13. Outputs
13.1 Primary Defensive System One of the 9 locked defensive systems (Section 14).
13.2 System Confidence % Numeric confidence score (0–100%). Same governance as OSIE
confidence.
13.3 System Mix (Conditional) Returned only if dominance criteria are not met. Top 2 systems
(max). Mix shares sum to 100%.
13.4 Defensive Court Depth One of: Full-Court / Three-Quarter / Half-Court.
Derived from FULLCOURT_START % and PICKUP_DEPTH:
● Full-Court: FULLCOURT_START ≥ 20%
● Three-Quarter: 10–19%
● Half-Court: < 10%
Court depth is an orthogonal descriptor. It does not override system identity. Consumed by
possession pressure modeling, turnover pressure calibration, and pace interaction logic.

14. Defensive System Set (Locked)
1. Containment Man
2. Pack Line
3. Pressure Man (Denial)
4. Switch Everything
5. ICE / No-Middle
6. Zone (Structured)
7. Matchup Zone / Hybrid
8. Press / Pressure Defense
9. Junk / Special
System IDs must exactly match all interaction docs. No aliases permitted.
15. Classification Order (Locked)
1. Junk / Special
2. Press / Pressure Defense
3. Zone (Structured)
4. Matchup Zone / Hybrid
5. Switch Everything
6. ICE / No-Middle
7. Pack Line
8. Pressure Man (Denial)
9. Containment Man (Default)
16. Defensive Classification Triggers
16.1 Containment Man
Primary Triggers:
● Opponent ISO_FACED % baseline (no extreme denial or switching signals)
● ZONE_SHELL % ≤ 5%
● SWITCH_ON_BSCRN % ≤ 20%
● Team FOULR at or below league average
Support Triggers:
● Opponent RIMR_AG ≤ league average
● Opponent 3PAR_AG near league average
● Team TOV_FORCED % near league average
PlayVision (V2/V3) Support:

● PICKUP_DEPTH = Half-Court
● ICE_FORCE % ≤ 10%
● DENY_1PASS % ≤ 15%
16.2 Pack Line
Primary Triggers:
● Opponent RIMR_AG ≤ bottom 25th percentile
● Opponent MIDR_AG elevated
● ZONE_SHELL % ≤ 5%
● SWITCH_ON_BSCRN % ≤ 15%
Support Triggers:
● Team FOULR below league average
● Opponent 3PAR_AG may be elevated
● Team TOV_FORCED % below league average
PlayVision (V2/V3) Support:
● PAINT_OCC ≥ 2.5 avg defenders inside arc
● PICKUP_DEPTH = Half-Court
● DENY_1PASS % ≤ 12%
16.3 Pressure Man (Denial)
Primary Triggers:
● Team TOV_FORCED % ≥ top 25th percentile
● DENY_1PASS % ≥ 20%
● Team FOULR above league average
Support Triggers:
● Opponent ISO_FACED % may be elevated
● ZONE_SHELL % ≤ 5%
● SWITCH_ON_BSCRN % ≤ 20%
PlayVision (V2/V3) Support:
● PICKUP_DEPTH = Half-Court or Three-Quarter
● FULLCOURT_START % ≤ 15%
16.4 Switch Everything
Primary Triggers:

● SWITCH_ON_BSCRN % ≥ 35%
● SWITCH_OFFSCRN % ≥ 25%
● ZONE_SHELL % ≤ 5%
Support Triggers:
● Team FOULR near league average
● Opponent ISO_FACED % may be elevated
● Team TOV_FORCED % near league average
PlayVision (V2/V3) Support:
● PICKUP_DEPTH = Half-Court
● PAINT_OCC near league average
● ICE_FORCE % ≤ 8%
16.5 ICE / No-Middle
Primary Triggers:
● ICE_FORCE % ≥ 20%
● Opponent MIDR_AG elevated
● ZONE_SHELL % ≤ 5%
● SWITCH_ON_BSCRN % ≤ 20%
Support Triggers:
● Opponent RIMR_AG ≤ league average
● Team TOV_FORCED % near league average
● Team FOULR near league average
PlayVision (V2/V3) Support:
● PICKUP_DEPTH = Half-Court
● PAINT_OCC ≥ 2.0
16.6 Zone (Structured)
Primary Triggers:
● ZONE_SHELL % ≥ 25%
● Opponent 3PAR_AG elevated
● Opponent RIMR_AG ≤ bottom 30th percentile
Support Triggers:
● SWITCH_ON_BSCRN % ≤ 10%

● Team TOV_FORCED % may be elevated
● ICE_FORCE % ≤ 5%
PlayVision (V2/V3) Support:
● PAINT_OCC ≥ 2.5
● DENY_1PASS % low
● ZONE_HANDOFF % elevated
16.7 Matchup Zone / Hybrid
Primary Triggers:
● ZONE_SHELL % between 10–24%
● SWITCH_ON_BSCRN % between 15–30%
● Opponent 3PAR_AG slightly elevated
Support Triggers:
● Opponent RIMR_AG ≤ league average
● Team TOV_FORCED % near or slightly above league average
● Team FOULR near league average
PlayVision (V2/V3) Support:
● PAINT_OCC ≥ 2.0
● Mix of ZONE_SHELL and man indicators
16.8 Press / Pressure Defense
Primary Triggers:
● FULLCOURT_START % ≥ 20%
● Team TOV_FORCED % ≥ top 20th percentile
● Team FOULR above league average
Support Triggers:
● Transition % elevated
● PACE100 elevated
● Opponent ISO_FACED % may be elevated
PlayVision (V2/V3) Support:
● PICKUP_DEPTH = Full-Court or Three-Quarter
● DENY_1PASS % ≥ 15%

16.9 Junk / Special
Primary Triggers:
● No other system achieves dominance after full classification sweep
● OR: multiple defensive looks within the same game (box-and-one, triangle-and-two,
face-guarding)
● ZONE_SHELL % between 5–15% with high variance game-to-game
Support Triggers:
● Opponent shot profile shows extreme variance game-to-game
● Team defensive metrics don't cluster around any single system signature
PlayVision (V2/V3) Support:
● High variance across all defensive structure indicators
● Possible identification of box-and-one or triangle-and-two via spatial data
17. Defensive Scoring, Dominance, Mix, and Confidence
Same rules as OSIE (Sections 8–11). Defensive system scoring uses identical formula: System
Score = (Primary Triggers Met × 1.0) + (Support Triggers Met × 0.5). Same dominance rule,
same mix computation, same confidence bands.
PART 3: V1 FALLBACK RULES
18. Offensive Inference from V1 (Stats-Only)
When only box score data is available, OSIE uses proxy signals:
● 3PA/FGA ratio → separates perimeter-heavy (Moreyball, Pace & Space, 5-Out) from
interior-heavy (Post-Centric, Flex, Princeton)
● FTA/FGA → identifies drive-heavy offenses (Dribble Drive, Heliocentric)
● Assist Rate → separates motion/passing offenses from ISO-heavy
● Single player usage concentration → identifies Heliocentric
● PACE100 (estimable from game score/possessions) → separates Pace & Space from
deliberate offenses
● Rim Attempts/FGA (if available) → separates drive/rim offenses from jump-shooting
offenses
V1 offensive inference rules:

● Can distinguish broad categories: perimeter-oriented vs interior-oriented vs
drive-oriented vs balanced
● Cannot distinguish fine-grained systems within a category
● System Mix is mandatory
● Confidence capped at 55%
19. Defensive Inference from V1 (Stats-Only)
● Opponent 3PAR_AG → zone concedes threes, pack line forces midrange
● Opponent RIMR_AG → pack line/zone protect paint, pressure man leaves rim exposed
● Team TOV_FORCED % → press/pressure forces turnovers
● Team FOULR → pressure/press fouls more
V1 defensive inference rules:
● Can distinguish: zone-based vs man-based vs press/pressure
● Cannot distinguish: Containment Man vs ICE vs Pack Line from box score alone
● System Mix is mandatory
● Confidence capped at 55%
PART 4: PROTOCOL (PRESEASON → IN-SEASON → POSTSEASON)
20. System Identity Lifecycle
20.1 Preseason
No games played. System identity loaded from prior season or coach history.
Condition System Assignment Status
Same head coach + roster Use last season's locked PROVISIONAL
turnover < 70% systems (Coach-Continuity)
Same head coach + roster Use last season's locked PROVISIONAL
turnover ≥ 70% systems (High-Turnover)
New head coach Use coach's most recent 1–3 PROVISIONAL (New-Coach
seasons identity Prior)
No usable history Offense: Pace & Space. PROVISIONAL
Defense: Containment Man (Unknown/Balanced)
20.2 First 5 Games (Initial Observation)

After 5 games are complete:
● Run OSIE + DSIE on full 5-game sample
● If dominance criteria met → OBSERVED (LOCKED)
● If dominance criteria not met → OBSERVED (UNLOCKED), System Mix returned
20.3 Every 5 Games (Re-Evaluation Cadence)
After every subsequent 5-game window (games 6–10, 11–15, etc.):
● Run OSIE + DSIE on the most recent 5-game window
● Compare to current locked system identity
Result Action
New window confirms locked No change. Confidence may increase.
system
New window shows different Flag: DRIFT DETECTED. Do not change system yet.
system scoring higher Monitor next window.
2 consecutive 5-game windows REOPEN. Re-classify system. New system becomes
show same drift OBSERVED (UNLOCKED). Fresh lock cycle begins.
1 window drifted, next window Clear drift flag. Keep lock.
reverts to locked system
What updates every 5 games:
● System identity status
● System confidence %
● Team KR (if minutes/usage/roster shifted)
● Coverage map and fit %
● Fragility flags
20.4 Postseason (Freeze)
At conference tournament start (or end of regular season):
● Status: FROZEN
● No reclassification from small-sample variance
● Save season record as official identity:
○ Offense: Observed (Locked)
○ Defense: Observed (Locked)
○ Final Off Fit % / Def Fit % / Overall Fit %
○ Final system confidence %

● This saved identity feeds next season's preseason assignment
21. Status Labels (Locked)
Status Meaning
PROVISIONAL Preseason, using last year's systems, same coach, low
(Coach-Continuity) turnover
PROVISIONAL (High-Turnover) Preseason, using last year's systems, same coach, high
turnover
PROVISIONAL (New-Coach Preseason, using new coach's historical identity
Prior)
PROVISIONAL Preseason, no usable history, defaults loaded
(Unknown/Balanced)
OBSERVED (UNLOCKED) In-season, engine has run but dominance not achieved
OBSERVED (LOCKED) In-season, engine has run and dominance confirmed
DRIFT DETECTED In-season, one 5-game window diverged from locked
system
REOPENED In-season, two consecutive windows confirmed drift, fresh
classification cycle
FROZEN Postseason, no further reclassification, saved as official
record
22. Minimum Sample and Missing Data
● OSIE/DSIE may classify from a single game
● If < 40 half-court possessions: Primary System still returned, System Mix is mandatory,
Confidence capped at 65%
● If PlayVision missing → structure confidence reduced, PlayVision support triggers
unavailable
● If V1+ play-type data missing → force V1 fallback rules
● If all data partial → Primary + Mix, Confidence ≤ 50%
23. Governance Rules (Non-Negotiable)
The System Inference Engine may NOT:

● Modify player KRs or ratings
● Modify team KRs
● Affect usage or minutes
● Override archetypes
● Introduce simulation logic
● Change interaction math
The System Inference Engine outputs labels + confidence only.
All outputs are deterministic. Given the same inputs, the same system label, mix shares,
confidence values, and court depth classification are returned. There is no learning, tuning, or
adaptation.
UI / GOVERNANCE NOTE
Display and inference only. System identity values are produced by Nexus. No evaluation,
weighting, or normalization logic lives here.

Global Player + Team Database

Global Player + Team Database (Worldwide) — Locked
0. Global Master List (Database Table)
The Global Master List is the source-of-truth registry of all known basketball organizations
worldwide. It is maintained as a database table by Nexus, not as a governance document. The
former National Player Pool doc is retired — its content lives here as data.
Contains:
● Leagues / conferences / regions
● Teams inside each league
● Country / tier metadata
● "Independent / Unknown" buckets for teams outside formal league structures
Everything below references the Global Master List as the source-of-truth for what exists.
1. Team Master Record (Program-Season)
MUST PULL FROM: Global Master List
One row per team-season:
● Team / program identity (name, institution)
● League / conference / country
● Competitive level (from locked level list, Section 8)
● Conference (optional if league already implies it)
● Season year
2. Staff / Coach Record (Program-Season)
One row per team-season:
● Head coach identity
● Staff identity markers (assistants, when known)
● Continuity flags: same coach as prior season (yes/no)
● Coach-change flag: new hire, interim, mid-season change
● Roster turnover % (used by SIE Protocol for preseason system assignment)
3. System Identity Record (OSIE/DSIE)
MUST PULL FROM: System Inference Engine (merged doc)
Team-season system identity. No roster required.

● Offensive system label (from locked 11-system set)
● Defensive system label (from locked 9-system set)
● System confidence % (offense)
● System confidence % (defense)
● System Mix (if returned): systems + shares
● Offensive Pace Profile: PACE100 + Pace Band
● Defensive Court Depth: Full-Court / Three-Quarter / Half-Court
● Heliocentric Anchor Position (if applicable)
Status (from locked SIE status labels):
Status Meaning
PROVISIONAL (Coach-Continuity) Preseason, same coach, low turnover
PROVISIONAL (High-Turnover) Preseason, same coach, high turnover
PROVISIONAL (New-Coach Prior) Preseason, new coach's historical identity
PROVISIONAL (Unknown/Balanced) Preseason, no usable history
OBSERVED (UNLOCKED) In-season, dominance not achieved
OBSERVED (LOCKED) In-season, dominance confirmed
DRIFT DETECTED One 5-game window diverged
REOPENED Two consecutive windows confirmed drift
FROZEN Postseason, official record saved
Update cadence: Every 5 games. System identity does not change between checkpoints.
4. Current Roster Stack + Transfer Portal Feed
MUST PULL FROM: Global Master List
Continuously updated team-season state:
4.1 Roster (Game-by-Game Build)
● Current roster (all rostered players for this program-season)
● Participation / minutes per player (updated after every game)
● Usage % per player (actual from V2/V3, estimated from box score at V1/V1+, updated
after every game)
● Current season stats aggregates (updated after every game)
● Auto-run player evals → Player KR outputs (updated after every game):

○ Final_System_Off_KR
○ Final_System_Def_KR
○ Player eval mode (production-based vs full)
○ Player confidence_pct
○ Archetype assignment
○ Impact modifiers
○ Offensive archetype demand tier (A/B/C/No-match) for selected system
○ Defensive archetype demand tier (A/B/C/No-match) for selected system
● Auto-run Team KR outputs (updated after every game):
○ Team_Off_KR
○ Team_Def_KR
○ Team_KR (overall)
○ Offensive_Fit%
○ Defensive_Fit%
○ Overall_Fit%
○ Coverage Map (diagnostic object)
○ Missing Demands (diagnostic list)
○ Fragility Flags (diagnostic list)
○ Tier Label (from Level Interpretation)
○ team_kr_confidence_pct
○ coverage_confidence_pct
4.2 Transfer Portal Registry (Live View)
A live, continuously updated list of portal players:
● Portal entry event (timestamp)
● Current / previous team + level
● Class year / eligibility metadata (when available)
● Status: in-portal / withdrawn / committed
● Destination team (when committed)
● Source + verification
● Player KR at time of portal entry (snapshot)
● Archetype at time of portal entry
● System fit projections for inquiring programs (computed on demand when a coach
searches)
Views powered by Section 4:
● Roster view (current team roster with KRs, roles, minutes)
● Stats view (season stats, per-game, per-100 possessions)
● KR view (Player KRs, archetypes, system fit, confidence)
● Transfer Portal view (all portal players, filterable by position, archetype, KR range, level,
system fit)

5. Data Tier Record (Per Team-Season)
Tracks what data is available for each team, which determines evaluation precision and
confidence.
Tier What It Is Impact
V1 — Public box scores, roster Baseline. Production-based KR only.
Stats-Only minutes, estimated usage. Offensive weights use estimated usage.
Available for every organized Defensive weights use minutes + role
program. only. System inference uses proxy
signals. Confidence lowest.
V1+ — Stats + V1 + third-party play-type data. Bridge tier. Full classification triggers
Licensed Actual usage, shot profiles, available. No matchup tracking.
Granular possession-level efficiency. Not Defensive weights still minutes + role
owned by KaNeXT. only. Confidence between V1 and V2.
V2 — KaNeXT-owned camera data. High fidelity. Full evaluation. Matchup
PlayVision (1 Single season processed. Full importance activates in defensive
Season) play-type tagging, actual usage, weights. Year 1 on platform.
matchup assignment tracking,
spatial data.
V3 — Multiple seasons of PlayVision Highest fidelity. Trend analysis, system
PlayVision data + film archive. Full trend evolution, pattern recognition. Year 2+ on
Deep depth. platform. Confidence highest.
(Multi-Season)
Data tier is assigned per team-season and updates when new data sources become available
(e.g., PlayVision cameras installed mid-season upgrades V1 → V2 for remaining games).
6. Season Snapshot Timeline (History Ledger)
Saved checkpoints of Section 4 over time:
Post-game snapshots (after every game):
● Full roster state
● All player stats (season-to-date)
● All Player KRs
● Team KR (Off/Def/Overall)
● Team KR diagnostics (Fit%, Coverage Map, Missing Demands, Fragility Flags)
● Confidence values (player and team)
● Minutes / usage / participation weights

● "As-of date" timestamp
5-game checkpoint snapshots:
● Everything in post-game snapshot PLUS:
● System identity (OSIE/DSIE) status and labels
● System confidence %
● System Mix (if active)
● Drift flags
● Pace Profile / Court Depth
Transfer Portal snapshots:
● Portal state at each snapshot (who entered, withdrew, committed since last snapshot)
● Portal player KRs at time of status change
Purpose:
● Trend analysis (how has this team/player evolved over the season?)
● Audit trail (what did the system know at any given point?)
● Historical comparisons (this team vs last year's team at the same point in the season)
● "What we knew then" vs "what we know now" (post-hoc evaluation accuracy)
7. Game / Film Archive + Processor Layer
Game records + film links + processing status:
● Schedule + game IDs (linked to team master records for both teams)
● Film URLs (PlayVision replay layer when available)
● Processor outputs per game:
○ Play-type tags (offensive and defensive)
○ Shot-type classification
○ Possession-level efficiency data
○ Usage tracking (per player)
○ Matchup assignment tracking (per player, V2/V3 only)
○ Spatial data (V2/V3 only)
● Data tier assignment per game: V1 / V1+ / V2 / V3
● Processing status: unprocessed / processing / complete / error
Upgrade path: When PlayVision cameras are installed at a program, historical games can
begin processing. As games are processed, the data tier for those game records upgrades from
V1 → V2. When a full season of PlayVision data is processed, the team-season data tier
upgrades to V2. After 2+ seasons, V3. Confidence adjusts automatically as data tier improves.
8. Locked Competitive Levels (Global)

Pre-College (3)
● HS / Prep
● Postgrad
● AAU / Summer Circuits
College (US — 13 levels)
● NCAA D1 High-Major
● NCAA D1 Mid-Major
● NCAA D1 Low-Major
● NCAA D2
● NCAA D3
● NAIA
● NJCAA D1
● NJCAA D2
● NJCAA D3
● CCCAA
● USCAA
● NCCAA D1
● NCCAA D2
Pro / Overseas
● Professional (Domestic / Overseas)
These levels must match exactly across: Team KR Legend, Team KR Math (off/def split table),
Player KR Legend, System Inference Engine, and all downstream references.
9. Player Pool Scope
The Global Database contains every known basketball player worldwide. This is not aspirational
— it is the architectural requirement. Nexus is built to evaluate, store, and surface any player at
any level in any country.
What "every player" means:
● Every rostered player at every college program in the US (NCAA D1/D2/D3, NAIA,
NJCAA D1/D2/D3, CCCAA, USCAA, NCCAA D1/D2)
● Every rostered player at every professional and semi-professional league globally
● Every tracked high school, prep, and postgrad prospect
● Every AAU / summer circuit participant with available data
● Every transfer portal entrant
● Every international prospect with available data
How players enter the pool:

● Automatic ingestion from public roster feeds (college, pro)
● Transfer portal event triggers (portal entry creates or updates a record)
● Recruiting databases (HS/prep/postgrad/AAU)
● Manual entry (scouting staff, coach submission)
● International feeds (pro leagues, federation registries)
Every player record follows the Player Profile (Auto-Populated Record) schema.
Evaluation depth varies by data availability:
● V1 players: box score stats, basic profile. Production-based KR only.
● V1+ players: play-type data available from third party. Fuller KR possible.
● V2 players: PlayVision camera data (1 season). Full evaluation.
● V3 players: multi-season PlayVision. Highest confidence evaluation.
Players without enough data for any evaluation are stored as profile-only records (identity, roster
affiliation, career history) until data becomes available.
9.1 Pool Enrichment Protocol
The National Player Pool starts with box-score data from public roster feeds. Every time Nexus looks up a specific player, it enriches that player's record with data gathered from web search and social media. Over time, the pool becomes more complete and accurate through organic usage.

How Enrichment Works:
First lookup: Nexus runs the full Data Gathering Protocol (SKILL.md v4). Pool stats + official web search + social web search. All new data discovered is written back to the player record.
Subsequent lookups: Nexus checks last_enriched timestamp. If enriched within 7 days, skip web searches and use existing enriched data. If older than 7 days, re-enrich.

Enrichment Fields -- populated by Nexus during the Data Gathering Protocol:
- verified_height (string): Official roster page. Example: "6'4" (pool listed 6'7")"
- verified_weight (string): Official roster page. Example: "180 lbs"
- awards (text array): Athletics site, conference release. Example: ["MAC Freedom POY", "First Team All-Conference"]
- recruiting_status (enum): Web + social. Values: COMMITTED / IN_PORTAL / UNSIGNED / UNKNOWN
- committed_to (string): Web + social. Example: "Sacramento State"
- hometown (string): Official roster page. Example: "Allentown, PA"
- high_school (string): Official roster page. Example: "Parkland HS"
- social_links (text array): Social search. Example: ["@jaydenthomas6 on X", "hudl.com/profile/..."]
- notable_performances (text array): Game recaps. Example: ["36 pts (11-18, 13-14 FT) vs Moravian", "Triple-double: 23/10/12"]
- scouting_notes (text): Social search, coach quotes. Free text with source attribution.
- last_enriched (timestamp): System timestamp of last enrichment.

Enrichment Rules:
1. Never overwrite computed stats (PPG, RPG, APG, FG%, BPR, clusters, etc). Those come from the compute engine pipeline and are authoritative.
2. Only enrich metadata fields listed above.
3. If web data contradicts pool data on height or weight, store the verified value AND flag the discrepancy. Do not silently overwrite.
4. Awards are additive. Never delete a previously recorded award. Add new ones as discovered.
5. Recruiting status updates replace the previous value (a player can only have one current status).
6. Social intel goes in scouting_notes as free text with source attribution and date.
7. Enrichment is append-only for arrays (notable_performances, awards, social_links).
8. Timestamp every enrichment via last_enriched.

Enrichment Cadence:
- First Nexus lookup of a player: Full enrichment (web + social)
- Subsequent lookup within 7 days: Use cached enrichment data
- Subsequent lookup after 7 days: Re-enrich (web + social)
- Transfer portal event: Force re-enrich regardless of timestamp
- Postseason (conference tournament, NCAA tournament): Force re-enrich for all players on participating teams

Data Integrity:
- Enrichment never modifies upstream computed values (KR, BPR, Team KR, archetypes, system identity)
- Enrichment corrections that affect physical data (height, weight) are flagged for compute engine re-run
- All enrichment writes are logged with source, timestamp, and the Nexus query that triggered them
- If conflicting data is found across sources, store the most authoritative (official roster page > athletics site > social media)

The Flywheel:
V1 pool data (box scores from public feeds) is what every player starts with. Enrichment adds verified physical data, awards, recruiting status, scouting notes, and social intel. Each Nexus lookup makes the pool smarter. High-traffic players (stars, portal entrants, recruits) get enriched fastest because they're looked up most. Over time the pool evolves from a stat database into a complete scouting intelligence layer -- without any manual data entry.
10. Update Cadence Summary
What Cadence Trigger
Player KR Every game Post-game stats ingestion
Team KR (Off/Def/Overall + Every game Updated Player KRs + minutes/usage
Diagnostics)
System Identity (OSIE/DSIE) Every 5 5-game checkpoint
games
System Confidence % Every 5 5-game checkpoint
games
System Role Multipliers + Coverage Every 5 Tied to system identity
Map demands games
Coverage Map coverage Every game Rotation/minutes may shift game to
assignments game
Fit% Every game Coverage recalculated with current
rotation
Fragility Flags Every game Weight distribution recalculated
Roster Stack Continuous Roster moves, portal events, game
logs

Transfer Portal Registry Continuous Portal entry/withdrawal/commitment
events
Season Snapshots (post-game) Every game Post-game save
Season Snapshots (checkpoint) Every 5 5-game checkpoint save
games
Data Tier Assignment On change PlayVision installation, new data
source added
Film Archive Processing Continuous New film uploaded, processing
complete
Between 5-game checkpoints:
● Player KRs and Team KR update every game using the latest data
● System role multipliers (A/B/C) stay constant because they're tied to the system label
which only updates at checkpoints
● Coverage map recalculates every game using current rotation against the same system
demands
● Fit% recalculates every game because rotation weights shift
● Larger recalculation occurs at each 5-game checkpoint if system identity shifts — new
system label means new demand profile, new A/B/C assignments, new coverage map,
potentially significant Team KR movement
11. Governance
● The Global Database is maintained by Nexus. No manual override of computed values
(KRs, system identity, confidence).
● Coach inputs (system selection for own team, minutes projections, scholarship/NIL
constraints) are the only human-entered data that affects downstream computation.
● All computed outputs are deterministic: same inputs → same outputs.
● The Global Master List (league/conference/team registry) is a living database table
updated as leagues form, dissolve, or restructure.
● Player records are never deleted — they are archived when a player retires, becomes
inactive, or has no current affiliation. Historical data persists for trend analysis and audit.
● The product flywheel: V1 is what everyone has. V2 is what you get when you join
KaNeXT. V3 is what you get when you stay. Data depth compounds over time.
UI / GOVERNANCE NOTE
Database schema only. All values are produced by Nexus. No evaluation, weighting, or
normalization logic lives here. This doc defines what is stored and how it updates — not how
values are computed.

Scholarship & NIL Allocation Engine

Scholarship & NIL Allocation Engine
0. Scope
This engine computes two values for every player: Player Team Value (PTV) — how much this
player improves THIS specific team — and Player Market Value (PMV) — how much the market
values this player's brand and visibility. The gap between PTV and PMV is the competitive edge:
it tells a coach where they're overpaying and where bargains exist.
This engine is downstream of Player KR + Team KR. It recommends only. Coach confirms all
allocations.
This engine does not modify any Player KR or Team KR.
PART 1: PLAYER TEAM VALUE (PTV)
1. Purpose
PTV answers: "What is this specific player worth to THIS specific team, given the coach's
system, the current roster's gaps, and the player's evaluation confidence?"
PTV is the basketball intelligence layer. Nobody else can compute this because nobody else
has system-specific player evaluation, team need coverage, and confidence-gated allocation
logic.
2. PTV Inputs
A) Player Truth MUST PULL FROM: Player Eval outputs
● Final_System_Off_KR
● Final_System_Def_KR
● Overall Player KR
● confidence_pct
● Archetype assignment
● Impact modifiers (if applicable)
B) Team Context MUST PULL FROM: Team KR Diagnostics (Section 10 of Team KR doc)
● Missing Demands (uncovered A/B/C demands)
● Fragility Flags (single-point failures, concentration)
● Coverage Map (what's covered, by whom)
● Fit% (offensive, defensive, overall)

● Current rotation participation weights
C) System Context MUST PULL FROM: Coach Context Setup
● Offensive system + defensive system
● Player's offensive archetype demand tier (A/B/C/No-match)
● Player's defensive archetype demand tier (A/B/C/No-match)
3. PTV Formula
PTV_Raw = Player_KR_Contribution × System_Importance × Need_Multiplier
× Confidence_Factor
3.1 Player_KR_Contribution
The player's weighted pull on Team KR. For current roster players, this is their actual offensive +
defensive weight × their Final System KRs. For prospects (portal, recruits), this is projected
using their KR against projected minutes share.
Player_KR_Contribution = (Final_System_Off_KR × Projected_Off_Weight)
+ (Final_System_Def_KR × Projected_Def_Weight)
Where projected weights use the Team KR weighting formula (usage/minutes/system role) with
estimated minutes.
3.2 System_Importance
Same A/B/C multipliers from Team KR:
Demand Tier Multiplier
A (Critical) 1.20
B (High) 1.00
C (Optional) 0.85
No match 0.70
Applied as the higher of the player's offensive or defensive demand tier (their most important
role to the team).
3.3 Need_Multiplier
How much does this player fill a gap the team currently has?

Condition Multiplier
Fills an uncovered A (Critical) demand 1.50
Fills an uncovered B (High) demand 1.25
Fills a covered demand (redundant but competent) 1.00
Fills an uncovered C (Optional) demand 1.10
Redundant to a higher-KR player at same 0.85
archetype
If a player fills multiple gaps, use the highest applicable multiplier.
3.4 Confidence_Factor
Lower confidence = higher allocation risk.
Confidence Factor
Range
90%+ 1.00 (no discount)
75–89% 0.95
60–74% 0.90
45–59% 0.85
Below 45% 0.75
3.5 PTV Normalization
After computing PTV_Raw for every player on the roster (or every prospect being evaluated):
PTV_Share_i = PTV_Raw_i / Σ PTV_Raw
PTV_Share represents what percentage of the team's total value this player represents. This
share drives allocation recommendations.
PART 2: PLAYER MARKET VALUE (PMV)
4. Purpose

PMV answers: "What does the market think this player is worth based on their social presence,
visibility, athletic performance, and existing deal flow?"
PMV is the brand/marketability intelligence layer. It estimates what a player could command in
the open NIL market regardless of team-specific fit. The inputs and structure are
research-backed. The category weights are tunable defaults that calibrate over time as real deal
data flows through the platform.
5. PMV Input Categories
5.1 Social Score (Default Weight: 40%)
The most predictive factor for NIL market value. Engagement rate matters more than raw
follower count — brands pay for conversions, not eyeballs.
KaNeXT Native Inputs:
● In-app follower count
● In-app engagement rate (likes, comments, shares per post)
● KayTV content views + completion rate
● Content creation frequency (posts per week/month)
● Community participation score (activity within institution's brand)
Cross-Platform Inputs (API-pullable from public profiles):
● Instagram followers + engagement rate
● TikTok followers + engagement rate
● Twitter/X followers + engagement rate
● YouTube subscribers + average views (if applicable)
● Cross-platform consistency bonus (strong on 2+ platforms vs strong on 1)
Within Social Score, engagement is weighted 2x vs raw follower count. A player with 5K
followers and 8% engagement rate scores higher than a player with 50K followers and 0.5%
engagement rate.
KaNeXT native vs external weighting: Starts at 50/50. As platform adoption grows and
KaNeXT becomes the primary social layer for college athletes, the native weight naturally
increases. This is not forced — it's a function of where the engagement actually lives.
5.2 Exposure Score (Default Weight: 25%)
How visible is this player to the broader market?
Inputs:

● School exposure tier: Power conference (SEC/Big Ten/ACC/Big 12/Big East) = highest,
mid-major = moderate, low-major/D2/NAIA = lower
● Conference TV deal visibility: nationally televised games per season
● Position marketability: guards and wings score higher than bigs (historically more
marketable)
● Postseason appearances: NCAA Tournament, conference tournament runs, national
championship game
● Market size: school location (major metro vs small town)
5.3 Performance Score (Default Weight: 20%)
Athletic accomplishment and recognition. This is where our system adds value On3 doesn't
have — we can use Player KR percentile as a performance input, not just awards.
Inputs:
● Player KR percentile within their level (top 5% at HM = highest score)
● Awards: All-American, Conference POY, All-Conference, national award watch lists
● Statistical milestones: scoring leader, double-double machine, etc.
● Draft stock (for players with pro potential): projected draft position from public mock
drafts
● Improvement trajectory: year-over-year KR improvement signals a rising stock
5.4 Deal Flow Score (Default Weight: 15%)
Proven market validation — what has the market already paid for this player?
Inputs:
● Number of existing verified NIL deals
● Total verified deal value (annualized)
● Deal value trend (increasing, stable, decreasing)
● Brand tier of partners (national brand vs local business)
● Collective support level at their school (schools with bigger collectives inflate baseline)
If no deal data exists (new player, lower level), Deal Flow Score defaults to 0 and the remaining
categories absorb its weight proportionally.
6. PMV Formula
PMV = (Social_Score × W_social) + (Exposure_Score × W_exposure) +
(Performance_Score × W_performance) + (Deal_Flow_Score × W_deal)
Default weights: W_social = 0.40, W_exposure = 0.25, W_performance = 0.20, W_deal = 0.15

Each sub-score is normalized to a 0–100 scale before weighting. The combined PMV score is
then converted to a dollar value using a market calibration factor derived from known deal data
across the platform.
Dollar conversion:
PMV_Dollar = PMV_Score × Market_Rate_Per_Point
Market_Rate_Per_Point is calibrated from actual deal data. Initial default is set from research
benchmarks (e.g., $0.80/follower/year as a baseline anchor), then adjusts as real transactions
flow through KayPay and the commerce layer.
7. PMV Calibration Mechanism
The PMV weights (40/25/20/15) are defaults. They adjust over time:
● Every quarter, the system analyzes completed NIL deals on the platform
● It measures which input categories best predicted actual deal value
● Weights shift toward the categories with the strongest predictive correlation
● Weight adjustments are bounded: no single category can exceed 50% or drop below
10%
● Calibration is automatic, deterministic, and auditable
● The system logs every weight change with the data that drove it
This is a competitive advantage: On3 built their algorithm once and tweaks manually. KaNeXT's
PMV learns from real deal outcomes on the platform continuously.
PART 3: GAP ANALYSIS
8. The Gap
For every player, the engine displays:
● PTV: what this player is worth to YOUR team (basketball intelligence)
● PMV: what the market thinks this player is worth (brand/social intelligence)
● Gap: PTV minus PMV
Gap Interpretation Coach Action
PTV >> PMV Undervalued by the market. This Acquire. You're getting basketball
(large positive player improves your team more value at a brand discount.
gap) than the market prices him.

PTV ≈ PMV Fairly priced. Market value aligns Standard decision — evaluate on other
(near zero) with team value. factors (culture, character, fit).
PMV >> PTV Overpriced by the market. You're Caution. The market is paying for
(large negative paying for brand, not basketball fit. social presence or school exposure,
gap) not for what this player does for your
specific team.
9. Gap Display (Coach-Facing)
For current roster players:
● PTV allocation recommendation (scholarship % + NIL $) based on PTV share
● PMV market estimate (what the open market would pay)
● Gap flag: UNDERVALUED / FAIR / OVERPRICED
● If overpriced: "Market is paying for [social/exposure/deal history]. Basketball value to
your team is lower."
● If undervalued: "This player fills [Critical/High demand] that your roster is missing. Market
hasn't caught up."
For portal/recruit prospects:
● Same PTV/PMV/Gap analysis
● Plus: "Projected Team KR impact: +X.X if added to rotation at Y minutes"
● Plus: "Fills [demand] that is currently [uncovered/under-covered]"
PART 4: ALLOCATION ENGINE
10. Scholarship Allocation
Inputs:
● Governing body / division (determines scholarship cap)
● Available scholarship equivalents (default cap or coach-adjusted)
● PTV_Share for each rostered player
Formula:
Recommended_Scholarship_Pct_i = PTV_Share_i ×
Total_Available_Equivalencies
Rules:

● Cap each player at 1.00 (full scholarship)
● If formula recommends > 1.00 for top player, cap and redistribute excess down the PTV
stack
● Coach can set minimums (e.g., "every scholarship player gets at least 25%")
● Total_Equivalencies_Used must be ≤ Available_Equivalencies
● Output: per-player recommended_scholarship_pct + total equivalents used
Priority tiers (display labels):
PTV Rank Label
Top 3 by PTV Core
4–7 by PTV Rotation
8–10 by PTV Depth
11+ by PTV Development
11. NIL Allocation
Inputs:
● NIL pool amount (annual/cycle, coach-entered)
● PTV_Share for each rostered player
● PMV for each player (market context)
● Coach priority mode (optional): Win-Now vs Development vs Balanced
Formula:
Base_NIL_i = PTV_Share_i × NIL_Pool
Market adjustment (optional):
If a player's PMV significantly exceeds their PTV-based allocation, the coach may need to pay
market rate to retain them (competitive pressure). The engine flags this:
● If PMV_Dollar > Base_NIL × 1.5: "Market pressure: [player] may require above-PTV
allocation to retain. PMV suggests $X."
● The engine recommends PTV-based allocation by default but surfaces the PMV as
context
Rules:
● Total_NIL_Used must be ≤ NIL_Pool
● If Win-Now mode: weight shifts toward high-PTV players (top-heavy allocation)

● If Development mode: weight shifts toward high-confidence-improvement players
● If Balanced (default): pure PTV share distribution
12. Constraints and Warnings
After computing allocations:
Condition Warning
A Critical (A) demand player is "Unfunded critical demand: [archetype]. This gap
unfunded or underfunded suppresses Team KR."
A low-confidence player receives "Allocation risk: [player] at [confidence]%. Evaluation
significant resources uncertainty is high."
Top 3 players receive > 60% of "Concentration warning: resource allocation is top-heavy."
total resources
A redundant player receives "Efficiency flag: [player] is redundant to [starter] but
more than a gap-filler receiving higher allocation."
PMV >> PTV for a player "Market premium warning: paying above basketball value
receiving large allocation for [player]. Consider reallocation."
Total allocation exceeds caps "Cap exceeded. Reduce allocations or increase budget."
Critical demand unfunded AND "Structural deficit: roster construction requires more
cap is exhausted resources than available. Portal or recruiting needed."
PART 5: HARD RULES
● All recommendations are deterministic given the same inputs
● This engine does not modify any Player KR or Team KR
● Scholarship and NIL recommendations must respect governing body caps
● Low-confidence allocations can be produced but must be flagged
● Coach confirms all allocations — the engine recommends, it does not execute
● PTV structure and inputs are locked
● PMV category structure is locked (Social / Exposure / Performance / Deal Flow)
● PMV category weights are tunable defaults (40/25/20/15) that calibrate from real deal
data
● PMV calibration is automatic, bounded (10–50% per category), and auditable
● Gap analysis is always displayed — PTV, PMV, and the gap are never hidden from the
coach

PART 6: GOVERNING BODY SCHOLARSHIP CAPS (REFERENCE)
Governing Body / Max Athletic Scholarship Equivalents (Men's
Division Basketball)
NCAA D1 13.0
NCAA D2 10.0
NCAA D3 0 (no athletic scholarships)
NAIA 8.0
NJCAA D1 15.0
NJCAA D2 15.0
NJCAA D3 0 (no athletic scholarships)
CCCAA 0 (no athletic scholarships, tuition is minimal)
USCAA Varies by institution
NCCAA D1 Varies (follows dual-affiliation rules)
NCCAA D2 0 or limited
These caps are the hard ceiling. The engine cannot recommend allocations exceeding the cap.
Coach can reduce available equivalents below the cap but cannot exceed it.
UI / GOVERNANCE NOTE
Recommendation engine only. All values are produced by Nexus. Coach confirms all
allocations. This engine does not execute transactions, modify KRs, or change roster status.
PTV is locked logic. PMV weights are tunable defaults that calibrate from platform deal data
over time.

Roster Decision Intelligence

ROSTER DECISION INTELLIGENCE
v2 — Tab within Basketball Team Intelligence
0. Purpose
This framework answers the team-builder's question: "If I add this player to my roster, what
happens to my Team KR — and is that change worth the resources?"
It consumes the existing Team KR Pipeline and runs it with different roster configurations to
show how each personnel decision changes the team's overall quality. The Team KR Delta IS
the answer. This framework does not invent parallel scoring systems.
The framework has five components:
1. Team Profile — snapshot of current roster state, system, gaps, fragility
2. Impact Projection — add candidate, re-run Team KR, show delta and explain why
3. Resource Analysis — is the delta worth the roster spot, scholarship allocation, and NIL
cost
4. Roster Continuity Planning — portal risk, insurance targets, redshirt management,
multi-year outlook
5. Decision Matrix — ranked output for all candidates by Team KR Delta
This framework operates at two levels:
● College Mode (v2): Portal search, recruiting, NIL valuation, scholarship allocation,
redshirt planning. All inputs from locked college intelligence docs.
● Pro Mode (v0 — Directional): Draft intelligence, free agency. Extrapolated until Pro
Team KR Pipeline is built.
1. Team Profile
Before evaluating any candidate, snapshot the team's current state. This is the baseline that all
impact projections reference.
1.1 Current Roster Snapshot

Run the full Team KR Pipeline (Steps 1–12 from Team Intelligence) on the current roster.
Capture:
● Current Team KR (overall, offense, defense)
● Starting 5 with individual KRs, archetypes, eligibility remaining
● Rotation (all players ≥5% minutes) with KRs and eligibility remaining
● Non-rotation roster (redshirts, developmental players, walk-ons) with KRs
● Offensive System (from OSIE or Coach Context)
● Defensive System (from DSIE or Coach Context)
● System Fit % (from Team KR Pipeline diagnostics)
● Coverage Map (which system demands are filled, by whom)
● Missing Demands (uncovered Tier A = Critical Gap, uncovered Tier B = Priority Gap)
● Fragility Flags (single-point failures, starter-backup gaps ≥10 KR)
1.2 Roster Composition
None
ROSTER COMPOSITION: [Team Name]
Level: [D1 / D2 / NAIA / D3 / JUCO]
Roster Spots: [Used] / [Max] (e.g., 14/15 at D1)
Scholarship Status: [see level-specific rules in Section 3.2]
ROTATION (contributing this season):
| # | Player | Pos | KR | Archetype | MPG | Elig Remaining |
Scholarship % | NIL |
|---|---|---|---|---|---|---|---|---|
| 1 | [name] | [pos] | [KR] | [arch] | [mpg] | [years] | [%] |
[$] |
| ... |
REDSHIRTS (on roster, not contributing this season):
| # | Player | Pos | KR | Projected Year-2 KR | Elig After
Redshirt | Scholarship % |
|---|---|---|---|---|---|---|
| 1 | [name] | [pos] | [KR] | [projected] | [years] | [%] |
OPEN SPOTS: [X roster spots available]
1.3 Gap Summary

None
TOP NEEDS (ranked by Team KR impact):
1. [Position / Role / Specific Demand] — WHY: [what's missing and
what it costs]
2. [Position / Role / Specific Demand] — WHY: [explanation]
3. [Position / Role / Specific Demand] — WHY: [explanation]
DEPARTURES EXPECTED (eligibility exhausting, likely draft
declares, portal risks):
- [Player] — [reason] — KR lost: [X] — Position gap created: [Y]
- [Player] — [reason] — KR lost: [X] — Position gap created: [Y]
2. Impact Projection
For each candidate player:
2.1 Add Player to Roster
Insert the candidate into the roster at their projected position and minutes allocation. Determine:
● Who they displace (the player who loses the most minutes)
● What the new rotation looks like
● Whether they start, come off the bench, or redshirt
2.2 Re-Run Team KR
Run the full Team KR Pipeline (Steps 1–12) on the new roster with the candidate included and
minutes adjusted. Capture:
● New Team KR (overall, offense, defense)
● New System Fit %
● New Coverage Map
● New Fragility Flags
2.3 Compute Delta
Metric Before After Delta
Team KR (Overall) [X] [Y] [+/- Z]

Team Off KR [X] [Y] [+/- Z]
Team Def KR [X] [Y] [+/- Z]
System Fit % [X] [Y] [+/- Z]
Critical Gaps Filled [count] [count] [+/- Z]
Fragility Flags [count] [count] [+/- Z]
The Team KR Delta is the single most important number.
2.4 Explain the Delta
If positive delta — explain what improved:
● Which coverage gaps did this player fill?
● Which system demands moved from uncovered to covered?
● Which lineup combinations became viable that weren't before?
● Did the player raise the offensive ceiling, defensive ceiling, or both?
● How does this player interact with existing players? (Complement, coexist, or conflict?)
If negative or neutral delta — explain what went wrong:
● What redundancy was created?
● What weakness was compounded?
● What system demand is over-covered while another remains uncovered?
● Is the displaced player actually better for THIS system?
● Does the candidate's presence make an existing player worse?
Key interactions to always check:
● Does the candidate's shooting (or lack) change team spacing geometry?
● Does the candidate's defense (or lack) change what defensive scheme the team can
run?
● Does the candidate require the ball, and if so, who gives up touches?
● Does the candidate unlock new positional flexibility (e.g., small-ball lineups)?
2.5 Displacement Report
None
DISPLACED PLAYER: [Name]
Previous Role: [Starter / Key Rotation / Bench]
New Role: [Backup / Reduced Minutes / Off Rotation]

Minutes Change: [X] MPG → [Y] MPG
DISPLACEMENT QUALITY:
- Candidate KR vs Displaced KR: [+/- X]
- Clear upgrade? [Yes / Marginal / Lateral / Downgrade]
CASCADE EFFECTS:
- New gap created? [Yes / No — explain]
- Displaced player value in different role? [Yes / No — explain]
- Bench depth change? [Improved / Neutral / Weaker]
2.6 Multi-Candidate Comparison
When evaluating multiple candidates for the same need:
None
CANDIDATE COMPARISON: [Team Name] — [Position/Need]
| Metric | Candidate A | Candidate B | Candidate C |
|---|---|---|---|
| Individual KR | [X] | [X] | [X] |
| Team KR Delta | [+/- X] | [+/- X] | [+/- X] |
| New Team KR | [X] | [X] | [X] |
| Gaps Filled | [list] | [list] | [list] |
| Gaps Created | [list] | [list] | [list] |
| Displaces | [who] | [who] | [who] |
| Key Interaction | [1 line] | [1 line] | [1 line] |
| NIL Cost | [$] | [$] | [$] |
| Eligibility | [years] | [years] | [years] |
The candidate with the highest Team KR Delta is the best player FOR THIS TEAM —
regardless of raw individual KR.
2.7 Pro Mode Adaptation
At the pro level, the full Pro Team KR Pipeline doesn't exist yet. In Pro Mode (v0):

● Use Pro Projection KR from the Pro Transition Engine
● Estimate Team KR impact directionally using Pro System Mapping (Section 6) and roster
gap analysis
● Flag output as DIRECTIONAL — estimated, not computed from a governed pipeline
● Upgrades to full computation when Pro Team KR Pipeline is built
3. Resource Analysis
3.1 Three Independent Resource Layers
Adding a player at the college level involves three independent resource decisions:
Layer 1: Roster Spot (Coach's decision, NCAA-governed) Does this player get one of our
limited roster spots? This is the hard constraint — the NCAA caps roster size. Everything else
flows from having a spot.
Layer 2: Scholarship Allocation (Coach/AD decision, budget-governed) How much
scholarship aid does this player receive? The rules vary by level, but the allocation is a financial
decision within institutional budget constraints.
Layer 3: NIL Compensation (Collective/Admin decision, pool-governed) How much NIL
money does it take to land this player? This is a separate financial pool from scholarships —
funded by collectives, boosters, and/or the institution's revenue-sharing allocation (post-House
settlement). Revenue sharing is simply one funding source that feeds the NIL pool; it is not a
separate decision layer.
All three must align to land a player. The Team KR Delta informs all three decisions but each
has its own decision-maker and constraints.
3.2 Roster & Scholarship Rules by Level (Post-House Settlement, 2025-26)
CRITICAL CHANGE: The House v. NCAA settlement (effective July 1, 2025) eliminated
scholarship caps for D1 and replaced them with hard roster limits. All D1 sports are now
technically equivalency sports — coaches CAN offer partial scholarships. However, the practical
reality varies dramatically by sport.
D1 Men's Basketball:
Resource Rule Practical Reality

Roster spots 15 maximum This is the binding constraint. You cannot have more than
(hard cap, 15 players.
NCAA-enforced
)
Scholarship 15 (can be split In practice, every scholarship D1 basketball player
equivalencies into partial receives a full ride. No D1-caliber basketball talent
awards) would accept a partial scholarship — the market doesn't
work that way. The equivalency flexibility exists on paper
but is functionally irrelevant for basketball at the D1 level.
Walk-ons Can exist within With only 15 spots, walk-ons are rare. Most D1 programs
the 15 roster scholarship all 15. Some programs carry 13-14
spots scholarship players + 1-2 preferred walk-ons.
NIL Separate pool, Varies wildly: $500K pools at low-major to $20M+ at
no NCAA cap Kentucky. The NIL decision is the true variable cost at
D1.
The D1 basketball coach's real decision: "Is this player worth 1 of my 15 roster spots? If yes,
they get a full scholarship automatically — that's table stakes. The question is how much NIL it
takes to land them."
D2 Men's Basketball:
Resource Rule Practical Reality
Roster spots ~19-20 typical Larger rosters than D1. More players, fewer full
(varies by scholarships.
institution)
Scholarship 10.0 (must be This is where equivalency ACTUALLY matters. Coaches
equivalencies split) distribute 10 full equivalencies across 19-20 players. A
starter might get 85-100%, a bench player 40-60%, a
walk-on contributor 10-25%. The allocation decision is
genuinely strategic.
NIL Exists but NIL is a factor at D2 but the dollars are dramatically
much smaller smaller. Most D2 players are making decisions based on
pools scholarship percentage + academic aid, not NIL.
The D2 coach's real decision: "How much of my 10.0 equivalencies do I allocate to this
player? Is one player at 100% better than two players at 50% each? The system should show
the Team KR impact of both allocation scenarios."

NAIA Men's Basketball:
Resource Rule Practical Reality
Roster spots Varies by institution Similar to D2 in structure.
Scholarship 8.0 Same equivalency model as D2 but with fewer
equivalencies total equivalencies, making each allocation
decision more constrained.
NIL Minimal to Scholarship allocation is the primary financial
non-existent at most lever.
programs
D3 Men's Basketball:
Resource Rule Practical Reality
Roster spots Varies by No athletic scholarship constraint governs roster
institution size.
Scholarship 0 (no athletic Players attend for academic aid, need-based aid,
equivalencies scholarships) and/or love of the game. The coach's only lever is
the roster spot itself.
NIL Minimal Essentially non-existent at D3.
The D3 coach's decision is purely basketball: "Does this player make the team better? If yes,
roster spot. If no, cut."
JUCO:
Resource Rule Practical Reality
D1 JUCO Up to 15 Most JUCO players receive close to full rides because the
equivalencies cost of attendance is low.
D2/D3 Varies, partial or Similar to D2/NAIA equivalency model.
JUCO none
3.3 Equivalency Tradeoff Analysis (D2/NAIA Only)
At D2 and NAIA, the equivalency allocation is a real strategic decision. The framework should
always show the tradeoff:

None
EQUIVALENCY TRADEOFF: [Team Name]
Total Equivalencies: [X.X of 10.0 remaining]
Option A: [Player] at [X]% → Team KR Delta: +[Y]
Option B: [Player 1] at [X₁]% + [Player 2] at [X₂]% → Combined
Delta: +[Y']
Same equivalency consumed. Which produces higher Team KR?
RECOMMENDATION: [A or B] — [1-line explanation]
3.4 NIL Analysis
NIL is a separate resource pool from scholarship. It applies at all levels but matters most at D1
where scholarship is table stakes and NIL is the competitive differentiator.
NIL Pool Inputs:
● Total NIL budget available (from all sources: collective, revenue-sharing, institutional,
third-party deals)
● NIL already committed to current roster
● NIL remaining for new acquisitions
● Player's asking price or market rate
NIL Efficiency:
NIL_Cost_Per_TKR_Point = NIL_Amount / Team_KR_Delta
NIL Scenario Analysis (always show alternatives):
None
NIL SCENARIO ANALYSIS: [Team Name]
Scenario A: Sign [Player] at $[X]M
→ Team KR Delta: +[Y]
→ Budget remaining: $[Z]M ([%])
→ Can still afford: [other realistic targets]
Scenario B: Pass, allocate $[X]M across [2-3 targets]

→ Combined Team KR Delta: +[Y']
→ Budget remaining: $[Z']M
→ Higher or lower total delta than Scenario A?
Scenario C: [if applicable — different allocation mix]
3.5 Duration Value
A multi-year player is worth more than a 1-year rental because you don't have to replace them
and re-invest next year.
Years of Eligibility Remaining Value Multiplier
1 year (senior / final year) 1.0x
2 years 1.5x
3 years 2.0x
4 years (incoming freshman) 2.5x
Duration-Adjusted Value = Team_KR_Delta × Duration_Multiplier
This applies to all resource decisions:
● D1 scholarship: A freshman uses a spot for 4 years; you don't recruit that position
again.
● D2/NAIA equivalency: A multi-year player at 60% scholarship is more efficient than
replacing a one-year player at 80% annually.
● NIL: A sophomore at $500K/year for 3 years may be better total value than a senior at
$2M for 1 year.
3.6 Combined Resource Output
None
RESOURCE ANALYSIS: [Team Name] — Adding [Player Name]
Level: [D1 / D2 / NAIA / D3 / JUCO]
ROSTER SPOT:
Spots Used: [X of 15] (D1) OR [X of ~20] (D2/NAIA)

Open Spots: [X]
This Player Consumes: 1 spot
Spots Remaining After: [X]
SCHOLARSHIP: (D1: full ride — standard / D2-NAIA: [X]% of
equivalency)
Equivalency Remaining: [X.X of 10.0] (D2/NAIA only)
NIL:
Player Asking Price: $[X]
NIL Pool Remaining: $[X]
NIL Cost Per TKR Point: $[X] / +[delta] = $[Z] per point
Budget % Consumed: [X%]
TEAM KR IMPACT:
Current Team KR: [X]
Projected Team KR: [Y]
Delta: +[Z]
Duration: [X years eligibility]
Duration-Adjusted Value: [delta × multiplier]
VERDICT: [TARGET / STRONG ADD / SOLID ADD / DEPTH ADD / PASS /
AVOID]
3.7 Pro Mode Cost (v0)
At the pro level, costs are governed by salary cap, draft pick value, and contract structure per
the NBA CBA. The framework needs the Pro Team KR Pipeline to produce accurate deltas
before cost efficiency is meaningful. Until then, Pro Mode cost analysis is directional.
Pro Cost Input Source
Draft pick opportunity cost Value of the pick slot (higher picks = more value)
Rookie scale salary Fixed by CBA based on draft position
Cap space consumed Salary against the cap

Contract duration Rookie deals: 4 years (2 guaranteed + 2 team
options)
4. Roster Continuity Planning
In the portal era, roster construction is continuous — not a one-time offseason event. Players
can leave every spring. Coaches need to manage current-season performance AND
future-season risk simultaneously.
4.1 Fragility Exposure
For each rotation player, compute the departure damage — how much the Team KR drops if
they leave:
None
FRAGILITY EXPOSURE: [Team Name]
| Player | Pos | KR | Elig Left | Portal Risk | Departure TKR
Impact | Backup KR | Gap Severity |
|---|---|---|---|---|---|---|---|
| [name] | [pos] | [KR] | [years] | [Low/Med/High] | -[X] Team KR
| [backup KR] | [Critical/Moderate/Minor] |
| ... |
MOST FRAGILE POSITION: [position] — if [player] leaves, Team KR
drops [X] points
MOST REPLACEABLE POSITION: [position] — backup is within [X] KR
of starter
Portal Risk Indicators:
● High: 1 year of eligibility remaining (graduating/draft-eligible), NIL below market rate,
limited playing time, known to have explored options previously
● Medium: 2 years remaining, adequate NIL, starting role but coach relationship uncertain
● Low: 3-4 years remaining, strong NIL, defined role, publicly committed to program
4.2 Insurance Planning

For each High or Medium portal-risk player, identify insurance targets — players in the portal,
recruiting class, or existing roster who could absorb the minutes and role if the at-risk player
departs:
None
INSURANCE PLAN: [At-Risk Player]
Position: [pos] | KR: [X] | Portal Risk: [High/Medium]
If they leave, Team KR drops: -[X]
INSURANCE OPTIONS:
1. [Portal player] — KR [X], would recover [Y%] of lost Team KR,
NIL cost: $[Z]
2. [Current backup] — KR [X], would recover [Y%] if promoted to
starter
3. [Incoming recruit] — Projected KR [X], available if redshirt
is burned
4. [No viable insurance] — this departure would be catastrophic,
must retain
RECOMMENDATION: [Proactive action — retain via NIL increase /
recruit insurance / accept risk]
4.3 Redshirt Management
A redshirted player consumes 1 roster spot and (at D1) a full scholarship, but contributes zero
to current-season Team KR. The coach is investing a spot in future value.
When to redshirt (system recommendation):
The framework should recommend a redshirt when ALL of the following are true:
● The player's current KR is below the rotation threshold (they wouldn't play meaningful
minutes this season)
● The player's projected KR after 1 year of development is ≥10 points higher than current
(significant improvement expected)
● The roster spot is not urgently needed for a contributor this season (team has depth at
this position)
● The player has 4 years of eligibility (maximizes the duration value of the redshirt
investment)
When NOT to redshirt:

● The roster spot is needed for an immediate contributor (team is thin at this position)
● The player is close to rotation-level now and game experience would accelerate
development more than practice
● The player has only 2-3 years of eligibility (redshirting a junior transfer wastes a year of a
short window)
Redshirt Value Computation:
None
REDSHIRT ANALYSIS: [Player Name]
Current KR: [X]
Current rotation contribution: [None / Minimal — Y MPG]
Projected KR after redshirt year: [X + development] (from
Development Intelligence Engine)
Years of eligibility after redshirt: [X]
VALUE OF REDSHIRTING:
- Roster spot cost this season: 1 of 15 (produces 0 Team KR
delta)
- Projected Team KR delta NEXT season: +[Y] (when player enters
rotation)
- Duration remaining after redshirt: [X years]
- Total projected value: [delta × duration multiplier]
VALUE OF PLAYING NOW:
- Projected Team KR delta THIS season: +[Y] (small, bench
minutes)
- Development rate: [slower/faster] with game reps vs
practice-only
- Risk: [uses a year of eligibility for minimal contribution]
RECOMMENDATION: [Redshirt / Play] — [reasoning]
4.4 Multi-Year Roster Outlook
The framework should show not just this season's roster but a 2-3 year projection:

None
MULTI-YEAR ROSTER OUTLOOK: [Team Name]
THIS SEASON (2025-26):
Team KR: [X] | Roster spots used: [X/15]
Starters: [list with eligibility]
Key contributors: [list with eligibility]
NEXT SEASON (2026-27) — PROJECTED:
Departures (eligibility exhausted): [list with KR lost]
Departures (likely draft/portal): [list with KR lost,
probability]
Returning core: [list with projected KR after development]
Incoming commitments: [list with projected KR]
Redshirts entering rotation: [list with projected KR]
Projected Team KR: [range]
Projected gaps: [positions/roles that need filling]
SEASON AFTER (2027-28) — DIRECTIONAL:
[Higher-level view of who's left, what the program arc looks
like]
ROSTER CONSTRUCTION PRIORITY:
- This season: [win now / develop / both]
- Next season: [what you need to recruit for NOW to be ready]
- Long-term: [program trajectory — ascending / sustaining /
rebuilding]
This multi-year view prevents the Kentucky problem — spending $22M on a single season
without thinking about what the roster looks like next year when half of them leave.
5. Decision Matrix Output
5.1 The Board
For each team, the Decision Matrix re-ranks available players by Team KR Delta.

None
DECISION MATRIX: [Team Name]
Level: [D1 HM / D2 / NAIA / etc.]
Current Team KR: [Overall] (Off: [X] / Def: [X])
System: [Offense] / [Defense]
Top 3 Needs: [list]
Open Roster Spots: [X]
NIL Budget Remaining: [$X]
RANK | PLAYER | IND KR | TKR DELTA | NEW TKR | FILLS | DISPLACES
| NIL COST | COST/PT | ELIG | VERDICT
1 | [name] | [KR] | +[X] | [TKR] | [gap] | [who]
| [$] | [$/pt] | [yr] | [verdict]
2 | ...
3 | ...
TOP RECOMMENDATION:
Player: [name]
Why for THIS team: [2-3 sentences on specific roster interaction]
Team KR Impact: [current] → [projected] (+[delta])
Displaces: [who] — Net effect: [explanation]
Resource cost: [1 roster spot + full scholarship (D1) / X%
equivalency (D2)] + $[NIL] for [Y years]
Key Risk: [the one thing that could go wrong]
ALTERNATIVE:
Player: [name]
Why instead: [1-2 sentences on different strategic bet]
Team KR Impact: [current] → [projected] (+[delta])
5.2 Verdict Categories
Verdict Meaning
TARGET Highest Team KR Delta at efficient cost. Fills a critical gap. Pursue
aggressively.

STRONG ADD Meaningful Team KR Delta at reasonable cost. Pursue if TARGET
unavailable.
SOLID ADD Moderate Team KR Delta. Fills a need without transforming the
team.
DEPTH ADD Small Team KR Delta. Fills backup/depth need. Low-cost only.
REDSHIRT Low current-season impact but high projected future value. Invest
CANDIDATE the roster spot for year 2+.
PASS Minimal Team KR Delta. Poor fit or overpriced relative to
alternatives.
AVOID Negative Team KR Delta. Makes the team worse through
redundancy or compounding weakness.
6. Pro System Mapping (v0 — Directional)
Until the full Pro OSIE/DSIE is built, the following mapping provides directional guidance for Pro
Mode Impact Projections.
6.1 NBA Offensive Scheme Archetypes
NBA Description Primary Demands Example Teams
Scheme
Spread PnR dominant. 3+ PnR Engine, Spot-Up OKC, Cleveland,
PnR shooters. Ball-handler Shooters, Roll/Stretch 5 Boston
creates.
Motion / Ball movement. Off-ball Connectors, Denver, Golden
Flow cutting. Player-initiated Point-Forward/Center hub, State, Indiana
reads. Movement Shooters
Pace and Extreme transition. Score Speed, Conditioning, Sacramento,
Space in 8 seconds or early Transition Finishing, Quick Atlanta
offense. Decisions
ISO / 1-2 stars create. Everyone Primary Engine, 3-and-D Dallas, Phoenix
Star-Drive else spaces and defends. Wings, Stretch Big
n

DHO / Dribble handoff actions. Stretch 5, Off-Ball Shooters, Miami, some
Handoff Stretch bigs who handle + Cutters Boston
shoot.
6.2 NBA Defensive Scheme Archetypes
NBA Description Primary Demands Example Teams
Scheme
Switch Every screen switched. All Switchable Defenders, Lat Boston, OKC,
Everything 5 guard multiple positions. Quickness, Versatility Golden State
Drop Center drops on PnR. Elite Rim Protector, Cleveland, Utah
Coverage Guards fight through. Disciplined POA Guards (Gobert era)
Blitz / Trap Double ball-handler on Elite Rotators, Active Miami, some
PnR. Rotate behind. Hands, Communication Memphis
Contain and Stay home. Contest every Discipline, Length, Denver, Dallas
Contest shot. Win by discipline. Rebounding, Team Defense
IQ
6.3 Pro Archetype Demand Shifts
Archetype College Pro Tier Directio Why
Tier n
3-and-D Wing B A ↑ Every NBA team needs 2-3.
Stretch Big B-C A-B ↑ Spacing at 4/5 is premium.
Switch Big B A (switch ↑ Switch defense demands
schemes) versatile bigs.
POA Defender B A-B ↑ On-ball defense premium at
Guard pro.
Anchor Big A B-C ↓ Must be elite or irrelevant.
(rim-only)
Roll Man A-B B-C ↓ Pure rollers are replaceable at
pro.
Offensive Big (no B-C Avoid ↓↓ Unplayable in playoff
D) basketball.

7. Governance
7.1 What This Framework Does
● Profiles team roster state with gaps, fragility, and multi-year outlook
● Runs Team KR with candidate added and shows delta with explanation
● Separates resource analysis into roster spot, scholarship, and NIL layers
● Models redshirt decisions with current vs future value computation
● Plans for portal-era roster continuity with insurance targets
● Produces ranked Decision Matrix per team
7.2 What This Framework Does NOT Do
● Invent KR modifiers or parallel scoring. ALL KR computation flows through locked
pipelines.
● Override Player KR or Team KR. Both are locked truth.
● Predict which players will transfer or declare for the draft. It models the exposure if they
do.
● Make the decision. It recommends. The human decides.
7.3 Authority Chain
None
Player KR (from Player Intelligence)
↓ consumed by
Team KR Pipeline (from Team Intelligence)
↓ consumed by
Roster Decision Intelligence (this framework)
↓ produces
Decision Matrix + Recommendation + Continuity Plan
↓ consumed by
GM / Coach / AD (human decision)
No layer overrides the layer above it.
7.4 Dependencies
Document What This Framework Consumes
Player Intelligence (all tabs) Individual KR, archetype, trait vector, system
risks, badges

Pro Transition Engine (Development Pro Projection KR for draft candidates
Intelligence)
Development Intelligence Engine Development projections for redshirt value
computation
Team KR Pipeline (Team Intelligence) Team KR computation, coverage map,
diagnostics
System Profiles (Player Intelligence) Offensive/defensive system demand profiles
OSIE / DSIE (Team Intelligence) System identification
Scholarship & NIL Allocation (Team Budget constraints, allocation rules
Intelligence)
Pro System Mapping (Section 6, this doc) Directional pro scheme mapping (v0)
7.5 Future Build Requirements (Pro Mode v0 → v1)
Component What It Adds
Pro OSIE NBA offensive system taxonomy with governed demand profiles
Pro DSIE NBA defensive system taxonomy
Pro Interaction Library NBA system-vs-system interaction data
Pro Team KR Pipeline Team KR computation calibrated for NBA rosters
Pro Matchup NBA matchup modifiers, playoff weighting
Governance
Empirical cost calibration Real NIL + salary data to validate benchmarks
7.6 Versioning
v1: Initial framework with parallel modifier system. v1.1: Removed parallel modifiers — all fit
derived from Team KR re-computation. v2: Complete rewrite. Fixed scholarship rules to reflect
post-House settlement reality (D1 = 15 roster spots, full scholarship is market standard,
equivalency splitting relevant at D2/NAIA only). Added redshirt management with current vs
future value computation. Added roster continuity planning (fragility exposure, insurance targets,
multi-year outlook). Added REDSHIRT CANDIDATE verdict category. Separated resource
analysis into three layers (roster spot / scholarship / NIL). Consolidated revenue sharing as NIL
pool input.

# PRO TEAM REGISTRY -- NBA (2025-26) v2

## Purpose
Maps every NBA team's offensive/defensive system, roster context, and team window. Enables system fit % and draft-range-appropriate evaluation for any prospect against any NBA team.

## System Taxonomy
**Offense (12):** Spread Pick-and-Roll, 5-Out Motion, Read & React, Pace & Space, Dribble Drive, Princeton, Flex, Swing, Inside-Out, Moreyball, Heliocentric, Coach K
**Defense (10):** Containment Man, Pack Line, Pressure Man, Switch, No-Middle, Zone, Matchup Zone, Full-Court Press, Junk, Coach K

## HOW TEAM WINDOW AFFECTS DRAFT PRIORITY

| Window | Draft Position | What They Draft For |
|--------|---------------|-------------------|
| Rebuilding | Lottery (#1-5) | PEAK CEILING. Best player available. Fit/overlap secondary -- roster will change around this pick. |
| Rising | Mid-lottery (#6-14) | 3-YEAR PROJECTION + FIT. Have a young star, need complementary pieces. |
| Contending | Late first (#15-30) | MEDIAN OUTCOME + FIT. Need contributors now. High floor, system-ready. |
| Retooling | Varies | Depends on pick position. If lottery, lean peak. If late, lean fit. |

## EASTERN CONFERENCE

### Atlantic Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Boston Celtics | Joe Mazzulla | 5-Out Motion | Switch | Contending | Median + fit |
| New York Knicks | Tom Thibodeau | Spread PnR | Containment Man | Contending | Median + fit |
| Philadelphia 76ers | Nick Nurse | Spread PnR / Motion | Switch | Retooling | Depends on slot |
| Brooklyn Nets | Jordi Fernandez | Pace & Space | Containment Man | Rebuilding | Peak ceiling |
| Toronto Raptors | Darko Rajakovic | Pace & Space / Read & React | Switch | Rebuilding | Peak ceiling |

### Southeast Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Miami Heat | Erik Spoelstra | 5-Out Motion / Spread PnR | Switch / Zone | Contending | Median + fit |
| Orlando Magic | Jamahl Mosley | Pace & Space | Containment Man / Pack Line | Rising | 3-Year + fit |
| Atlanta Hawks | Quin Snyder | Spread PnR | Containment Man | Rising | 3-Year + fit. Building around Jalen Johnson (All-Star). Need franchise PG after Trae Young trade. Core: Johnson/Daniels/Risacher/Kuminga/Okongwu. |
| Charlotte Hornets | Charles Lee | Pace & Space | Switch | Rebuilding | Peak ceiling |
| Washington Wizards | Brian Keefe | Pace & Space | Containment Man | Rebuilding | Peak ceiling |

### Central Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Cleveland Cavaliers | Kenny Atkinson | 5-Out Motion | Pack Line / Switch | Contending | Median + fit |
| Milwaukee Bucks | Doc Rivers | Heliocentric | Containment Man | Contending | Median + fit |
| Indiana Pacers | Rick Carlisle | Pace & Space | Containment Man | Rebuilding (Haliburton Achilles) | Peak ceiling. 15-55 record. Haliburton returning. Need two-way wing to pair with Haliburton/Siakam. Core: Haliburton/Nembhard/Nesmith/Siakam/Zubac. |
| Chicago Bulls | Billy Donovan | Spread PnR | Switch | Rebuilding | Peak ceiling |
| Detroit Pistons | JB Bickerstaff | Pace & Space | Containment Man | Rebuilding | Peak ceiling |

## WESTERN CONFERENCE

### Northwest Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Oklahoma City Thunder | Mark Daigneault | Pace & Space / Motion | Switch | Contending | Median + fit |
| Denver Nuggets | Michael Malone | Heliocentric | Containment Man | Contending | Median + fit |
| Minnesota Timberwolves | Chris Finch | Spread PnR | Containment Man | Contending | Median + fit |
| Utah Jazz | Will Hardy | Pace & Space | Switch | Rebuilding | Peak ceiling |
| Portland Trail Blazers | Chauncey Billups | Pace & Space | Containment Man | Rebuilding | Peak ceiling |

### Pacific Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| Golden State Warriors | Steve Kerr | 5-Out Motion | Switch | Retooling | Depends on slot |
| LA Lakers | JJ Redick | Spread PnR / Motion | Containment Man | Contending | Median + fit |
| LA Clippers | Ty Lue | Spread PnR | Switch | Retooling | Depends on slot |
| Phoenix Suns | Mike Budenholzer | Spread PnR | Pack Line | Contending | Median + fit |
| Sacramento Kings | Doug Christie | Pace & Space / Dribble Drive | Containment Man | Rising | 3-Year + fit |

### Southwest Division

| Team | HC | Offense | Defense | Window | Draft Priority |
|------|-----|---------|---------|--------|---------------|
| San Antonio Spurs | Gregg Popovich | Inside-Out / Motion | Containment Man | Rising | 3-Year + fit |
| Dallas Mavericks | Jason Kidd | Heliocentric / Spread PnR | Switch | Contending | Median + fit |
| Houston Rockets | Ime Udoka | Pace & Space | Switch / Pressure Man | Rising | 3-Year + fit |
| Memphis Grizzlies | Taylor Jenkins | Pace & Space | Containment Man | Rebuilding | Peak ceiling |
| New Orleans Pelicans | Willie Green | Spread PnR | Switch | Retooling | Depends on slot |

## HOW TO USE FOR DRAFT / SYSTEM FIT

1. Identify the prospect's archetype from Mode 1 eval
2. Look up the drafting team's offensive and defensive system + window + draft priority
3. If team drafts for PEAK -- rank prospects by Peak Ceiling KR, de-emphasize fit
4. If team drafts for 3-YEAR -- rank by 3-Year Projection, weight system fit 30-40%
5. If team drafts for MEDIAN -- rank by Median Outcome, weight system fit 50%+
6. Run archetype-vs-system interaction from File 04 for fit %
7. Factor roster overlap (does this player's position conflict with existing core?)

---

# PRO LEAGUE REGISTRY -- v2

## Purpose
Source-of-truth for all professional basketball leagues worldwide. Provides context for pro evaluation, placement, salary projection, and draft pipeline analysis.

## TIER 1 -- ELITE GLOBAL LEAGUES

### NBA
- Lambda: 1.000 (reference level) | Country: USA/Canada | Teams: 30
- Salary cap: ~$141M (2025-26) | Rookie scale: Yes (slotted by draft position)
- Season: October -- June (82 games + playoffs)
- Draft pipeline: College (primary), G-League Ignite, international

### EuroLeague
- Lambda: 0.920 | Region: Europe (multi-country) | Teams: 18
- Draft pipeline: Regular NBA draft source. Luka, Sabonis, Manu all came through EuroLeague.

## TIER 2 -- STRONG PROFESSIONAL LEAGUES

| League | Lambda | Salary Range | Notes |
|--------|--------|-------------|-------|
| ACB Spain | 0.860 | $100K-$3M | Historically deepest European domestic league. Real Madrid/Barcelona feeder. |
| BSL Turkey | 0.840 | $100K-$2.5M | Strong import market. Fenerbahce/Anadolu Efes in EuroLeague. |
| Adriatic ABA | 0.830 | $50K-$1.5M | Jokic, Bogdanovic developed here. |
| Serie A Italy | 0.830 | $80K-$2M | Olimpia Milano, Virtus Bologna in EuroLeague. |
| LNB France | 0.820 | $80K-$1.5M | Tony Parker, Gobert, Wembanyama. Best development league in Europe. |
| Israel BSL | 0.810 | $80K-$2M | Strong import spending. Maccabi Tel Aviv in EuroLeague. |
| NBL Australia | 0.850 | $50K-$800K | Next Stars program. LaMelo, Giddey, Daniels came through. Primary NBA pathway outside NCAA. |

## TIER 3 -- MID-LEVEL PROFESSIONAL LEAGUES

| League | Lambda | Salary Range | Notes |
|--------|--------|-------------|-------|
| CBA China | 0.800 | $200K-$4M (imports) | High-paying for imports. Aging veteran destination. |
| EuroCup / BCL | 0.800 | -- | Second-tier European club competition. |
| BBL Germany | 0.790 | $50K-$1M | Schroder, Theis developed here. |
| B.League Japan | 0.780 | $100K-$1.5M | Expanding. Increasing budgets. |
| G-League | 0.780 | $45K-$560K (two-way) | Direct to NBA via two-way contracts. Primary NBA pathway for undrafted college players. |
| KBL South Korea | 0.750 | $50K-$500K | 1 import per team. |

## TIER 4 -- LOWER PROFESSIONAL LEAGUES

| League | Lambda | Salary Range |
|--------|--------|-------------|
| NBB Brazil | 0.730 | $30K-$300K |
| PBA Philippines | 0.720 | $20K-$200K |
| LNB France Pro B | 0.720 | $30K-$200K |
| Liga Nacional Argentina | 0.720 | $20K-$200K |
| Pro A Germany | 0.710 | $20K-$150K |
| UK BBL | 0.700 | $20K-$100K |

## TIER 5 -- ENTRY-LEVEL / SEMI-PROFESSIONAL

| League | Lambda |
|--------|--------|
| Southeast Asian leagues (ABL, various) | 0.620 |
| African leagues (BAL, domestic) | 0.600-0.650 |
| Lower European domestic | 0.650-0.700 |

## PLACEMENT GUIDANCE

| Pro KR | Best League Fit | Why |
|--------|----------------|-----|
| 90+ | NBA | Only league that matches their talent level |
| 86-89 | NBA rotation or EuroLeague | Can start overseas or rotate in NBA |
| 82-85 | G-League or strong domestic (ACB, BSL, NBL) | Develop toward NBA or start overseas |
| 78-81 | Mid-tier domestic (LNB, BBL, Serie A, B.League) | Solid pro career, unlikely NBA |
| 73-77 | Lower domestic or G-League camp | Edge of pro viability |
| 68-72 | Entry-level / semi-pro | High churn, short contracts |

`;


export const FILE_04 = `Interaction Library

Interaction Library
0. Scope
This is the single authoritative lookup table for all identity-clash interactions consumed by the
Simulation Engine. It replaces:
● SYSTEM × SYSTEM INTERACTION
● Offensive Archetype × Defensive Systems
● Defensive Archetype × Offensive System
Three tables in one doc:
● Part 1: System × System (12 offense × 10 defense = 120 entries)
● Part 2: Offensive Archetype × Defensive System (21 archetypes × 10 systems = 210
entries)
● Part 3: Defensive Archetype × Offensive System (21 archetypes × 12 systems = 252
entries)
Governance
● All archetype names MUST match the locked Archetype Library (21 archetypes) exactly
● All system names MUST match the locked System Sets (12 offense, 10 defense) exactly
● Delta values are bounded by the Modifier Framework
● This library produces interaction data only — it does not simulate, evaluate, or resolve
outcomes
● All deltas are relative to a neutral baseline (no defensive modifier)
● Deterministic: same identity inputs → same deltas returned
Archetype Library Reference (21 Locked Archetypes)
1. Two-Way Wing
2. 3-and-D Wing
3. POA Defender Guard
4. Primary Ball-Handler (Offense-First)
5. Switchable Defender Wing
6. Anchor Big
7. Stretch Big
8. Connector Guard
9. Offensive Wing Scorer

10. Gap / Team Defender Wing
11. Mobile Defensive Big
12. Chaos Disruptor Wing
13. Point Forward
14. Utility Forward
15. Roll Man / Vertical Threat
16. Offensive Big (Defense Liability)
17. Situational Shooter (Specialist)
18. Defensive Specialist (Non-Scoring)
19. Energy Big
20. Situational Ball-Handler (Bench Guard)
21. Developmental Prospect
System Set Reference
Offensive Systems (12): Spread Pick-and-Roll, 5-Out Motion, Motion / Read & React, Pace &
Space, Dribble Drive, Princeton, Flex, Swing, Post-Centric / Inside-Out, Moreyball, Heliocentric,
Coach K
Defensive Systems (10): Containment Man, Pack Line, Pressure Man (Denial), Switch
Everything, ICE / No-Middle, Zone (Structured), Matchup Zone / Hybrid, Press / Pressure
Defense, Junk / Special, Coach K
PART 1: SYSTEM × SYSTEM
INTERACTION
Each entry defines the macro game environment when these two systems clash. Outputs: Pace
impact, Shot Profile shifts, Turnover Pressure, Foul Rate, Explanation.
This table does not touch individual players. It establishes the team-level environment that
downstream archetype interactions operate within.
Offensive System 1: Spread Pick-and-Roll
vs Containment Man
● Pace: Neutral

● Shot Profile: Rim attempts +2pp, Pull-up midrange +2pp, Spot-up 3s −1pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Standard PnR reads remain intact; defense concedes controlled
advantages without overcommitting.
vs Pack Line
● Pace: −2%
● Shot Profile: Rim attempts −4pp, Kick-out 3s +4pp, Midrange pull-ups +1pp
● Turnover Pressure: Neutral
● Foul Rate: −1pp
● Explanation: Paint congestion suppresses rim pressure; offense shifts toward kick-out
shooting.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Early rim attempts +2pp, Pull-up jumpers +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Ball pressure disrupts entry timing but increases foul risk once the screen is
used.
vs Switch Everything
● Pace: −1%
● Shot Profile: Isolation pull-ups +3pp, Roll-man rim attempts −3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switches flatten roll advantages and redirect offense toward matchup
hunting.
vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Baseline drives +2pp, Short-roll floaters/midrange +3pp, Middle rim
attempts −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: Forcing the ball sideline suppresses middle penetration and increases
short-area scoring.
vs Zone (Structured)

● Pace: −3%
● Shot Profile: Pull-up 3s +3pp, Slot/wing spot-ups +3pp, Rim attempts −4pp
● Turnover Pressure: −1pp
● Foul Rate: −2pp
● Explanation: Zone absorbs drives, encourages perimeter creation, and lowers foul
generation.
vs Matchup Zone / Hybrid
● Pace: −2%
● Shot Profile: Late-clock pull-ups +2pp, Roll-man touches −2pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverage disrupts timing and increases indecision without fully
conceding space.
vs Press / Pressure Defense
● Pace: +4%
● Shot Profile: Early offense rim attempts +3pp, Transition 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure increases game speed, creating both early advantages and
mistakes.
vs Junk / Special
● Pace: −4%
● Shot Profile: Late-clock contested shots +4pp, Assisted shot rate −5pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Non-standard alignments break continuity and force improvisation.
vs Coach K Defense
● Pace: +1%
● Shot Profile: 3PA share −3pp, Rim attempts +1pp, Midrange pull-ups +3pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Coach K's "no-threes" math forces ball handlers off the line. PnR reads
exist but shooters are run off. Midrange leaks.
vs Coach K Defense

● Pace: +1%
● Shot Profile: 3PA share −3pp, Rim attempts +1pp, Midrange pull-ups +3pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Coach K's "no-threes" math forces ball handlers off the line. PnR reads
exist but shooters are run off. Midrange leaks.
Offensive System 2: 5-Out Motion
vs Containment Man
● Pace: Neutral
● Shot Profile: Rim attempts +2pp, Catch-and-shoot 3s +2pp, Midrange −2pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Spacing stretches containment without forcing rotations; offense flows into
balanced rim-and-kick reads.
vs Pack Line
● Pace: −3%
● Shot Profile: Rim attempts −5pp, Catch-and-shoot 3s +5pp
● Turnover Pressure: −1pp
● Foul Rate: −2pp
● Explanation: Heavy paint help neutralizes cuts and drives, pushing offense heavily
toward perimeter shooting.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Backdoor cuts/rim attempts +3pp, Spot-up 3s +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial creates backdoor opportunities but raises ball security risk during
reversals.
vs Switch Everything
● Pace: −2%
● Shot Profile: Isolation drives +3pp, Assisted shots −3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp

● Explanation: Switching disrupts motion continuity and shifts offense toward individual
creation.
vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Baseline drives +2pp, Corner 3s +2pp, Middle drives −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle principles redirect penetration toward baseline spacing actions.
vs Zone (Structured)
● Pace: −4%
● Shot Profile: Above-the-break 3s +4pp, Rim attempts −4pp
● Turnover Pressure: −2pp
● Foul Rate: −3pp
● Explanation: Zone absorbs motion actions, forcing perimeter ball movement and
lowering foul pressure.
vs Matchup Zone / Hybrid
● Pace: −3%
● Shot Profile: Late-clock pull-ups +2pp, Assisted shots −2pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages break rhythm and timing without fully conceding space.
vs Press / Pressure Defense
● Pace: +4%
● Shot Profile: Transition rim attempts +3pp, Transition 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates tempo and creates early-advantage opportunities
alongside mistakes.
vs Junk / Special
● Pace: −5%
● Shot Profile: Contested perimeter shots +4pp, Assisted shot rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular alignments disrupt spacing reads and continuity actions.

vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −4pp, Rim attempts +1pp, Midrange +3pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Denial disrupts spacing entries. 5-Out's perimeter-heavy diet is directly
attacked by no-threes philosophy.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −4pp, Rim attempts +1pp, Midrange +3pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Denial disrupts spacing entries. 5-Out's perimeter-heavy diet is directly
attacked by no-threes philosophy.
Offensive System 3: Motion / Read & React
vs Containment Man
● Pace: Neutral
● Shot Profile: Rim attempts +1pp, Assisted catch-and-shoot 3s +2pp, Midrange −2pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Containment allows reads to unfold; offense produces steady assisted
looks without forcing.
vs Pack Line
● Pace: −4%
● Shot Profile: Rim attempts −5pp, Assisted 3s +5pp
● Turnover Pressure: −1pp
● Foul Rate: −2pp
● Explanation: Paint congestion neutralizes cutting lanes and drives, pushing the offense
toward perimeter ball movement.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Backdoor rim attempts +3pp, Late-clock jumpers +1pp

● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial creates read-based counters but increases risk during reversals and
handoffs.
vs Switch Everything
● Pace: −3%
● Shot Profile: Isolation drives +3pp, Assisted shots −4pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switching breaks continuity and converts the offense into matchup-based
creation.
vs ICE / No-Middle
● Pace: −3%
● Shot Profile: Baseline drives +2pp, Short midrange attempts +2pp, Middle penetration
−4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: Forced sideline flow reduces central reads and shifts offense toward
baseline counters.
vs Zone (Structured)
● Pace: −5%
● Shot Profile: Ball-reversal 3s +4pp, Rim attempts −4pp
● Turnover Pressure: −2pp
● Foul Rate: −3pp
● Explanation: Zone absorbs read-based actions and slows the offense into perimeter
probing.
vs Matchup Zone / Hybrid
● Pace: −4%
● Shot Profile: Late-clock pull-ups +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid defenses disrupt timing and continuity reads, increasing indecision
late in possessions.
vs Press / Pressure Defense

● Pace: +3%
● Shot Profile: Early offense rim attempts +2pp, Transition 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure speeds the game up, compressing read time and increasing
volatility.
vs Junk / Special
● Pace: −5%
● Shot Profile: Contested jumpers +4pp, Assisted rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular alignments destroy read structure and force improvisation.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −3pp, Backdoor cuts +2pp, Midrange +2pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Motion reads punish overplay with backdoor cuts. But denial still
suppresses clean perimeter looks.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −3pp, Backdoor cuts +2pp, Midrange +2pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Motion reads punish overplay with backdoor cuts. But denial still
suppresses clean perimeter looks.
Offensive System 4: Dribble Drive
vs Containment Man
● Pace: Neutral
● Shot Profile: Rim attempts +3pp, Kick-out 3s +2pp, Pull-up midrange −2pp
● Turnover Pressure: Neutral
● Foul Rate: +2pp

● Explanation: Containment allows penetration angles without hard help, enabling
consistent rim pressure and drive-and-kick flow.
vs Pack Line
● Pace: −4%
● Shot Profile: Rim attempts −6pp, Kick-out 3s +6pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Heavy paint congestion suppresses rim finishes and forces extreme
reliance on kick-out shooting.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Early rim attempts +2pp, Pull-up jumpers +1pp
● Turnover Pressure: +4pp
● Foul Rate: +3pp
● Explanation: Ball pressure disrupts initiation but increases foul exposure once
penetration is achieved.
vs Switch Everything
● Pace: −2%
● Shot Profile: Isolation drives +4pp, Assisted shots −4pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching eliminates help advantages and turns the offense into individual
downhill attacks.
vs ICE / No-Middle
● Pace: −3%
● Shot Profile: Baseline drives +3pp, Short midrange attempts +2pp, Middle penetration
−5pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle rules redirect penetration toward baseline, reducing primary
advantage zones.
vs Zone (Structured)
● Pace: −5%
● Shot Profile: Kick-out 3s +5pp, Rim attempts −5pp

● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone walls off drives, forcing perimeter probing and lowering foul pressure.
vs Matchup Zone / Hybrid
● Pace: −4%
● Shot Profile: Late-clock pull-ups +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages disrupt driving lanes and timing without fully conceding
space.
vs Press / Pressure Defense
● Pace: +4%
● Shot Profile: Transition rim attempts +4pp, Transition 3s +2pp
● Turnover Pressure: +5pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates tempo, increasing both downhill opportunities and
ball-security risk.
vs Junk / Special
● Pace: −5%
● Shot Profile: Contested drives/jumpers +4pp, Assisted shot rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Non-standard alignments collapse driving reads and force improvisational
scoring.
vs Coach K Defense
● Pace: +1%
● Shot Profile: Rim attempts −1pp, Midrange pull-ups +3pp, 3PA share −1pp
● Turnover Pressure: +3pp
● Foul Rate: +1pp
● Explanation: Denial disrupts initiation. Rim protector funneling works against Dribble
Drive's downhill intent. Midrange leaks.
vs Coach K Defense
● Pace: +1%
● Shot Profile: Rim attempts −1pp, Midrange pull-ups +3pp, 3PA share −1pp

● Turnover Pressure: +3pp
● Foul Rate: +1pp
● Explanation: Denial disrupts initiation. Rim protector funneling works against Dribble
Drive's downhill intent. Midrange leaks.
Offensive System 5: Pace & Space
vs Containment Man
● Pace: +3%
● Shot Profile: Transition rim attempts +3pp, Above-the-break 3s +3pp, Midrange −3pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Containment concedes early advantages; spacing maximizes rim-and-3
efficiency without heavy resistance.
vs Pack Line
● Pace: +1%
● Shot Profile: Rim attempts −4pp, Above-the-break 3s +6pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Paint crowding suppresses rim pressure, pushing offense further toward
volume perimeter shooting.
vs Pressure Man (Denial)
● Pace: +4%
● Shot Profile: Early rim attempts +2pp, Pull-up 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Denial increases volatility — forcing faster decisions, more pull-ups, and
higher turnover risk.
vs Switch Everything
● Pace: −1%
● Shot Profile: Isolation pull-up 3s +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching neutralizes spacing advantages and shifts offense toward
individual shot-making.

vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Baseline drives +2pp, Corner 3s +2pp, Middle penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: Sideline forcing limits central drive-kick flow, redirecting offense to baseline
spacing reads.
vs Zone (Structured)
● Pace: −3%
● Shot Profile: Above-the-break 3s +5pp, Rim attempts −5pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone compresses the paint and slows tempo, increasing reliance on
perimeter shot volume.
vs Matchup Zone / Hybrid
● Pace: −2%
● Shot Profile: Late-clock pull-up 3s +3pp, Assisted shots −2pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages disrupt early flow and force more late-clock perimeter
creation.
vs Press / Pressure Defense
● Pace: +6%
● Shot Profile: Transition rim attempts +4pp, Transition 3s +3pp
● Turnover Pressure: +5pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates Pace & Space to its extreme — high tempo, high
volatility, high reward.
vs Junk / Special
● Pace: −4%
● Shot Profile: Contested perimeter shots +4pp, Assisted rate −5pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular defenses disrupt early flow and spacing discipline, forcing
improvisation.

vs Coach K Defense
● Pace: +2%
● Shot Profile: 3PA share −3pp, Transition rim +2pp, Midrange +2pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Pace & Space wants early offense but Coach K's selective 3/4-court
pressure increases turnovers. No-threes math suppresses perimeter diet.
vs Coach K Defense
● Pace: +2%
● Shot Profile: 3PA share −3pp, Transition rim +2pp, Midrange +2pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Pace & Space wants early offense but Coach K's selective 3/4-court
pressure increases turnovers. No-threes suppresses perimeter diet.
Offensive System 6: Princeton
vs Containment Man
● Pace: −4%
● Shot Profile: Backdoor rim attempts +3pp, Assisted midrange +2pp, Above-the-break 3s
−3pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Containment allows the offense to operate patiently, enabling reads and
backdoor timing without heavy disruption.
vs Pack Line
● Pace: −6%
● Shot Profile: Backdoor rim attempts −4pp, Midrange jumpers +3pp, Kick-out 3s +1pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Paint congestion removes cutting lanes and forces Princeton into
secondary scoring options.
vs Pressure Man (Denial)
● Pace: −2%

● Shot Profile: Backdoor cuts +4pp, Late-clock jumpers +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial increases risk but also enhances Princeton's signature counters if
reads are executed cleanly.
vs Switch Everything
● Pace: −3%
● Shot Profile: Isolation post-ups +3pp, Assisted shots −3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switching disrupts continuity actions and converts offense into
matchup-based execution.
vs ICE / No-Middle
● Pace: −4%
● Shot Profile: Baseline cuts +3pp, Middle actions −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle principles redirect actions toward baseline counters, partially
aligning with Princeton structure.
vs Zone (Structured)
● Pace: −7%
● Shot Profile: High-post touches +3pp, Short midrange attempts +3pp, Rim attempts
−4pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone absorbs backdoor actions and slows tempo, forcing Princeton to
operate from the high post.
vs Matchup Zone / Hybrid
● Pace: −6%
● Shot Profile: Late-clock jumpers +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid defenses disrupt read timing and continuity patterns.
vs Press / Pressure Defense

● Pace: +2%
● Shot Profile: Early rim attempts +2pp, Transition miscues +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure speeds the game slightly but increases turnover risk for a
precision-based offense.
vs Junk / Special
● Pace: −6%
● Shot Profile: Contested late-clock shots +4pp, Assisted rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular defenses break the offense's read hierarchy and force
improvisation.
vs Coach K Defense
● Pace: −2%
● Shot Profile: Backdoor cuts +3pp, 3PA share −2pp, Midrange +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Princeton punishes denial with backdoor cuts. But no-threes math
suppresses perimeter looks. Post hub contested by rim protector.
vs Coach K Defense
● Pace: −2%
● Shot Profile: Backdoor cuts +3pp, 3PA share −2pp, Midrange +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Princeton punishes denial with backdoor cuts. But no-threes math
suppresses perimeter looks. Post hub contested by rim protector.
Offensive System 7: Flex
vs Containment Man
● Pace: −3%
● Shot Profile: Baseline cut rim attempts +3pp, Assisted midrange jumpers +2pp,
Above-the-break 3s −3pp
● Turnover Pressure: Neutral

● Foul Rate: +1pp
● Explanation: Containment allows Flex continuity to operate cleanly, generating baseline
cuts and structured looks.
vs Pack Line
● Pace: −5%
● Shot Profile: Rim attempts −4pp, Midrange attempts +3pp, Kick-out 3s +1pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Packed paint removes baseline cut leverage, forcing Flex into secondary
midrange actions.
vs Pressure Man (Denial)
● Pace: −1%
● Shot Profile: Backdoor cuts +3pp, Late-clock jumpers +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial stresses timing but opens counter cuts if spacing discipline holds.
vs Switch Everything
● Pace: −3%
● Shot Profile: Post-ups after switches +3pp, Assisted shots −3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switching breaks the screening advantage and redirects offense toward
matchup exploitation.
vs ICE / No-Middle
● Pace: −4%
● Shot Profile: Baseline actions +3pp, Middle penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle principles funnel the ball into Flex's baseline-oriented counters.
vs Zone (Structured)
● Pace: −6%
● Shot Profile: High-post touches +3pp, Short midrange attempts +3pp, Rim attempts
−4pp
● Turnover Pressure: −1pp

● Foul Rate: −3pp
● Explanation: Zone absorbs baseline screening actions and slows continuity into probing
offense.
vs Matchup Zone / Hybrid
● Pace: −5%
● Shot Profile: Late-clock jumpers +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid defenses disrupt pattern timing and recognition.
vs Press / Pressure Defense
● Pace: +2%
● Shot Profile: Early rim attempts +2pp, Transition miscues +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure speeds entry into sets and increases ball-security stress.
vs Junk / Special
● Pace: −6%
● Shot Profile: Contested structured shots +4pp, Assisted rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Non-standard alignments break pattern recognition and force improvisation.
vs Coach K Defense
● Pace: −1%
● Shot Profile: 3PA share −2pp, Off-screen midrange +2pp, Baseline cuts +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Flex screening actions disrupted by denial. No-threes forces midrange that
Flex can execute but at lower efficiency.
vs Coach K Defense
● Pace: −1%
● Shot Profile: 3PA share −2pp, Off-screen midrange +2pp, Baseline cuts +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp

● Explanation: Flex screening actions disrupted by denial. No-threes forces midrange that
Flex can execute but at lower efficiency.
Offensive System 8: Swing
vs Containment Man
● Pace: −1%
● Shot Profile: Assisted catch-and-shoot 3s +3pp, Rim attempts +1pp, Midrange −2pp
● Turnover Pressure: Neutral
● Foul Rate: +1pp
● Explanation: Containment allows the ball to swing side-to-side, creating rhythm
perimeter looks and controlled drives.
vs Pack Line
● Pace: −4%
● Shot Profile: Rim attempts −4pp, Kick-out 3s +5pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Paint help suppresses drive lanes, increasing reliance on perimeter ball
reversal.
vs Pressure Man (Denial)
● Pace: +1%
● Shot Profile: Backdoor drives +2pp, Late-clock jumpers +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Denial stresses reversals but creates backdoor counters when overplayed.
vs Switch Everything
● Pace: −3%
● Shot Profile: Isolation pull-ups +3pp, Assisted shots −4pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching negates screening advantages and shifts offense toward
individual creation.
vs ICE / No-Middle

● Pace: −3%
● Shot Profile: Baseline drives +2pp, Corner 3s +2pp, Middle penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: Sideline forcing aligns with Swing's spacing but limits middle penetration.
vs Zone (Structured)
● Pace: −5%
● Shot Profile: Ball-reversal 3s +4pp, Rim attempts −4pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone slows reversals and compresses the paint, pushing volume perimeter
shooting.
vs Matchup Zone / Hybrid
● Pace: −4%
● Shot Profile: Late-clock pull-ups +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages disrupt reversal timing and continuity.
vs Press / Pressure Defense
● Pace: +3%
● Shot Profile: Transition rim attempts +3pp, Transition 3s +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates tempo and increases volatility in ball movement.
vs Junk / Special
● Pace: −5%
● Shot Profile: Contested perimeter shots +4pp, Assisted rate −6pp
● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Irregular alignments disrupt reversal patterns and spacing discipline.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −3pp, Wing drives +1pp, Midrange +2pp
● Turnover Pressure: +3pp

● Foul Rate: +1pp
● Explanation: Swing's ball reversal directly attacked by denial. Passing lane pressure
increases turnovers. No-threes suppresses perimeter diet.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: 3PA share −3pp, Wing drives +1pp, Midrange +2pp
● Turnover Pressure: +3pp
● Foul Rate: +1pp
● Explanation: Swing's ball reversal directly attacked by denial. Passing lane pressure
increases turnovers. No-threes suppresses perimeter diet.
Offensive System 9: Post-Centric / Inside-Out
vs Containment Man
● Pace: −2%
● Shot Profile: Post rim attempts +3pp, Kick-out 3s +2pp, Pull-up jumpers −2pp
● Turnover Pressure: Neutral
● Foul Rate: +3pp
● Explanation: Containment allows clean post feeds and controlled double timing,
increasing foul pressure.
vs Pack Line
● Pace: −5%
● Shot Profile: Post rim attempts −4pp, Kick-out 3s +4pp, Midrange +1pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Paint crowding suppresses post finishes and forces perimeter conversion.
vs Pressure Man (Denial)
● Pace: −1%
● Shot Profile: Quick post seals +2pp, Late-clock jumpers +1pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Denial stresses entry passes but increases foul risk once the ball enters the
post.
vs Switch Everything

● Pace: −3%
● Shot Profile: Mismatch post-ups +4pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching creates post mismatches while reducing off-ball advantage.
vs ICE / No-Middle
● Pace: −3%
● Shot Profile: Baseline post drives +2pp, Middle finishes −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle principles redirect post attacks to baseline counters.
vs Zone (Structured)
● Pace: −6%
● Shot Profile: High-post touches +3pp, Short midrange attempts +3pp, Rim attempts
−4pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone absorbs post gravity and forces inside-out play from the high post.
vs Matchup Zone / Hybrid
● Pace: −5%
● Shot Profile: Late-clock jumpers +3pp, Assisted shots −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid coverages delay post reads and increase indecision.
vs Press / Pressure Defense
● Pace: +2%
● Shot Profile: Early post seals +2pp, Transition miscues +2pp
● Turnover Pressure: +4pp
● Foul Rate: +1pp
● Explanation: Pressure speeds entry and increases ball-security stress before post
establishment.
vs Junk / Special
● Pace: −6%
● Shot Profile: Contested post touches +4pp, Assisted rate −5pp

● Turnover Pressure: +5pp
● Foul Rate: Neutral
● Explanation: Non-standard alignments distort post spacing and passing lanes.
vs Coach K Defense
● Pace: −1%
● Shot Profile: Post touches −1pp, Rim attempts −2pp, Midrange +2pp, 3PA share +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Rim protector limits post finishes. Inside-Out can work the high post if
anchor is disciplined. Less disruptive to post-heavy offense than perimeter offense.
vs Coach K Defense
● Pace: −1%
● Shot Profile: Post touches −1pp, Rim attempts −2pp, Midrange +2pp, 3PA share +1pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Rim protector limits post finishes. Inside-Out can work the high post. Less
disruptive to post-heavy offense than perimeter offense.
Offensive System 10: Moreyball
vs Containment Man
● Pace: +1%
● Shot Profile: Rim attempts +3pp, Pull-up 3s +2pp, Midrange −3pp
● Turnover Pressure: Neutral
● Foul Rate: +3pp
● Explanation: Conservative containment concedes drives and pull-up 3s, aligning with
Moreyball priorities.
vs Pack Line
● Pace: −3%
● Shot Profile: Rim attempts −5pp, Kick-out 3s +5pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Paint loading suppresses rim pressure and forces volume perimeter
shooting.

vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Drive frequency +2pp, Assisted 3s +1pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Denial increases volatility — higher foul draw but elevated turnover risk.
vs Switch Everything
● Pace: Neutral
● Shot Profile: Isolation 3s +3pp, Rim attempts (mismatch drives) +2pp
● Turnover Pressure: +2pp
● Foul Rate: +1pp
● Explanation: Switching invites iso hunting and mismatch exploitation without midrange
reliance.
vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Corner 3s +3pp, Middle drives −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: No-middle forces sideline drives and corner kick-outs — acceptable
outcomes for Moreyball.
vs Zone (Structured)
● Pace: −5%
● Shot Profile: Above-the-break 3s +4pp, Rim attempts −6pp
● Turnover Pressure: −1pp
● Foul Rate: −3pp
● Explanation: Zone reduces foul pressure and rim access, pushing heavy 3-point
dependency.
vs Matchup Zone / Hybrid
● Pace: −4%
● Shot Profile: Late-clock 3s +4pp, Assisted rate −3pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid rotations delay reads and reduce clean rim attacks.
vs Press / Pressure Defense

● Pace: +4%
● Shot Profile: Early rim attacks +2pp, Transition 3s +2pp
● Turnover Pressure: +5pp
● Foul Rate: +1pp
● Explanation: Pressure accelerates possessions, increasing both rim chances and
turnover variance.
vs Junk / Special
● Pace: −6%
● Shot Profile: Forced off-script 3s +3pp, Rim attempts −4pp
● Turnover Pressure: +5pp
● Foul Rate: −1pp
● Explanation: Non-standard coverages disrupt drive lanes and spacing geometry.
vs Coach K Defense
● Pace: +1%
● Shot Profile: 3PA share −4pp, Rim attempts −1pp, Midrange +4pp, FT rate +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Coach K defense specifically designed to break Moreyball. No-threes
directly attacks 3-point volume. Rim protector limits finishing. Moreyball degrades into
midrange.
vs Coach K Defense
● Pace: +1%
● Shot Profile: 3PA share −4pp, Rim attempts −1pp, Midrange +4pp, FT rate +1pp
● Turnover Pressure: +3pp
● Foul Rate: +2pp
● Explanation: Coach K defense specifically designed to break Moreyball. No-threes
directly attacks 3-point volume. Rim protector limits finishing.
Offensive System 11: Heliocentric
vs Containment Man
● Pace: Neutral
● Shot Profile: Anchor isolation +3pp, Pull-up midrange +2pp, Spot-up 3s +1pp,
Non-anchor rim −1pp
● Turnover Pressure: Neutral

● Foul Rate: +2pp
● Explanation: Containment respects the anchor without selling out. Anchor gets his looks
but at regulated advantage levels.
vs Pack Line
● Pace: −3%
● Shot Profile: Anchor rim attempts −4pp, Anchor midrange +3pp, Kick-out 3s +3pp
● Turnover Pressure: +1pp
● Foul Rate: −1pp
● Explanation: Paint congestion limits the anchor's downhill game. Offense must rely on
anchor's mid-range and passing to shooters.
vs Pressure Man (Denial)
● Pace: +2%
● Shot Profile: Anchor early drives +2pp, Pull-up jumpers +2pp, Transition +1pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Pressure on the anchor creates the highest turnover environment. If anchor
handles pressure, efficiency holds. If not, offense collapses.
vs Switch Everything
● Pace: Neutral
● Shot Profile: Anchor isolation +4pp, Anchor post-up mismatches +2pp, Roll-man touches
−3pp
● Turnover Pressure: +1pp
● Foul Rate: +1pp
● Explanation: Switching gives the anchor exactly what he wants — isolation against the
weakest available defender.
vs ICE / No-Middle
● Pace: −2%
● Shot Profile: Anchor baseline drives +2pp, Anchor floaters/midrange +3pp, Middle
penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: ICE redirects the anchor sideline. Effective if anchor is middle-dependent;
less effective if anchor has baseline game.
vs Zone (Structured)

● Pace: −4%
● Shot Profile: Anchor high-post facilitating +3pp, Spot-up 3s +3pp, Anchor rim attempts
−4pp
● Turnover Pressure: −1pp
● Foul Rate: −2pp
● Explanation: Zone turns the anchor into a facilitator rather than a scorer. If the anchor
can pass, offense adjusts. If not, it stalls.
vs Matchup Zone / Hybrid
● Pace: −3%
● Shot Profile: Anchor isolation +2pp, Pull-up midrange +2pp
● Turnover Pressure: +2pp
● Foul Rate: Neutral
● Explanation: Hybrid face-guards the anchor while zoning others. Anchor must score
through attention.
vs Press / Pressure Defense
● Pace: +4%
● Shot Profile: Anchor transition +3pp, Early drives +2pp
● Turnover Pressure: +5pp
● Foul Rate: +2pp
● Explanation: Maximum pressure on the single point of failure. If anchor breaks the press,
easy scores. If not, catastrophic turnovers.
vs Junk / Special
● Pace: −5%
● Shot Profile: Anchor isolation −2pp, Secondary players +2pp, Midrange +1pp
● Turnover Pressure: +4pp
● Foul Rate: Neutral
● Explanation: Junk (box-and-one, triangle-and-two) is specifically designed to neutralize
the anchor. Secondary players must produce — which they typically can't in a
Heliocentric system.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: Anchor 3PA −2pp, Anchor rim −1pp, Anchor midrange +3pp, Spot-up 3s
−1pp
● Turnover Pressure: +3pp
● Foul Rate: +1pp

● Explanation: Multiple POA defenders and switchable wings take turns on the anchor.
Denial suppresses clean looks. Rim protector erases drives. Anchor forced into
midrange.
vs Coach K Defense
● Pace: Neutral
● Shot Profile: Anchor 3PA −2pp, Anchor rim −1pp, Anchor midrange +3pp, Spot-up 3s
−1pp
● Turnover Pressure: +3pp
● Foul Rate: +1pp
● Explanation: Multiple POA defenders and switchable wings take turns on the anchor.
Denial suppresses clean looks. Rim protector erases drives.
Offensive System 12: Coach K
Identity: Ultra-fast tempo + constant motion/read-react + Moreyball shot diet (rim + 3s,
especially transition + corners) + Spread PnR embedded (multiple handlers/bigs) + selective iso
inside flow (Heat-style), not heliocentric.
vs Containment Man
● Pace: +3%
● Shot Profile: Transition rim +3pp, Corner 3s +3pp, Pull-up midrange −3pp
● Turnover Pressure: +1pp
● Foul Rate: +2pp
● Explanation: Containment can't handle Coach K's pace. Transition scoring + rim/3 diet
exploits conservative help.
vs Pack Line
● Pace: −1%
● Shot Profile: Rim attempts −4pp, Kick-out 3s +5pp, Corner 3s +2pp, Midrange −1pp
● Turnover Pressure: +1pp
● Foul Rate: −2pp
● Explanation: Pack Line suppresses rim pressure but Coach K's spacing and movement
create volume perimeter looks.
vs Pressure Man (Denial)
● Pace: +4%

● Shot Profile: Transition rim +3pp, Pull-up 3s +2pp, Backdoor cuts +2pp
● Turnover Pressure: +4pp
● Foul Rate: +3pp
● Explanation: Two aggressive systems collide. Coach K's pace + denial = highest
volatility. Turnovers spike but so do transition scores and fouls.
vs Switch Everything
● Pace: +1%
● Shot Profile: Isolation drives +3pp, Mismatch post-ups +2pp, Spot-up 3s −1pp
● Turnover Pressure: +2pp
● Foul Rate: +2pp
● Explanation: Switching neutralizes some motion but Coach K's multiple handlers and
bigs exploit mismatches. Iso within flow activates.
vs ICE / No-Middle
● Pace: +1%
● Shot Profile: Baseline drives +2pp, Corner 3s +3pp, Middle penetration −4pp
● Turnover Pressure: +1pp
● Foul Rate: Neutral
● Explanation: ICE redirects sideline but Coach K's corner 3 emphasis and baseline
spacing absorb it.
vs Zone (Structured)
● Pace: −2%
● Shot Profile: Above-the-break 3s +4pp, Corner 3s +3pp, Rim attempts −5pp
● Turnover Pressure: Neutral
● Foul Rate: −3pp
● Explanation: Zone slows Coach K's preferred tempo and suppresses rim pressure. But
motion/read-react foundation means volume 3s stay high.
vs Matchup Zone / Hybrid
● Pace: −1%
● Shot Profile: Pull-up 3s +3pp, Late-clock drives +2pp, Assisted shots −2pp
● Turnover Pressure: +2pp
● Foul Rate: −1pp
● Explanation: Hybrid disrupts motion timing. Coach K's pace absorbs some disruption but
read-react complexity increases turnover risk.
vs Press / Pressure Defense

● Pace: +6%
● Shot Profile: Transition rim +5pp, Transition 3s +3pp, Halfcourt rim −3pp
● Turnover Pressure: +5pp
● Foul Rate: +2pp
● Explanation: Two up-tempo systems at maximum. Coach K WANTS this pace.
Highest-scoring environment but also highest-turnover.
vs Junk / Special
● Pace: −3%
● Shot Profile: Contested pull-up 3s +3pp, Isolation drives +2pp, Assisted rate −5pp
● Turnover Pressure: +4pp
● Foul Rate: Neutral
● Explanation: Junk specifically disrupts flow offenses. Coach K's motion/read-react is
vulnerable to junk because it relies on reads that junk breaks.
vs Coach K Defense
● Pace: +4%
● Shot Profile: Transition rim +3pp, Corner 3s +2pp, Pull-up 3s +2pp, Midrange −2pp
● Turnover Pressure: +4pp
● Foul Rate: +2pp
● Explanation: Mirror match. Two high-pressure, high-pace systems. Extreme volatility.
Decided by depth, conditioning, and ball security.
END OF PART 1: SYSTEM × SYSTEM INTERACTION (120 entries complete)
PART 2: OFFENSIVE ARCHETYPE ×
DEFENSIVE SYSTEM
Each archetype's baseline is neutral — no defensive modifier applied. All deltas are relative to
that baseline. Usage is governed upstream. These deltas modify shot mix, efficiency, ball
security, and foul rates only.
Format per entry: Shot Mix (PP shifts), Efficiency (PP or % shifts), Ball Security / Fouls (PP
shifts), Rationale.
Offensive Archetype 1: Two-Way Wing

Identity: Scales on both ends. Spot-up shooting + on-ball containment. Not a primary creator —
contributes through spacing, cutting, and defensive versatility.
Offensive baseline: Moderate spot-up volume, some cutting, limited self-creation. Efficient but
low-usage.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp, Cut layups +1pp
● Efficiency: 3PT FG% +1pp, Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Containment doesn't pressure off-ball players aggressively. Clean
catch-and-shoot looks and cutting lanes stay open.
vs Pack Line
● Shot Mix: Rim attempts −2pp, Spot-up 3s +2pp, Midrange +1pp
● Efficiency: Rim FG% −2pp, 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Pack Line congests cutting lanes. Pushed to perimeter where shooting holds
but rim finishing drops.
vs Pressure Man (Denial)
● Shot Mix: Spot-up 3s −2pp, Backdoor cuts +2pp, Rim attempts +1pp
● Efficiency: 3PT FG% −1pp, Rim FG% +1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +1pp
● Rationale: Denial disrupts catch-and-shoot game but opens backdoor cuts. TO risk rises
on contested catches.
vs Switch Everything
● Shot Mix: Spot-up 3s Neutral, Isolation drives +1pp
● Efficiency: 3PT FG% Neutral, Midrange FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Switching doesn't heavily affect Two-Way Wing — not a primary screener or
initiator. Minor mismatch gains.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp, Baseline drives +1pp, Middle drives −2pp

● Efficiency: 3PT FG% Neutral, Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects ball handlers sideline, opening kickout lanes to the wing.
Minimal direct impact on off-ball players.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp, Short corner +1pp, Cut layups −2pp
● Efficiency: 3PT FG% +1pp, Rim FG% −1pp
● Turnover Rate: −1pp
● Foul-Draw Rate: −1pp
● Rationale: Zone gives spot-up shooters clean looks. Cutting lanes disappear against
zone structure.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp, Midrange +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid partially tracks but coverage confusion creates occasional open looks.
vs Press / Pressure Defense
● Shot Mix: Transition 3s +1pp, Early rim attempts +1pp
● Efficiency: 3PT FG% Neutral, Rim FG% +1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Reliable outlet in press-break situations. Gets early transition looks.
vs Junk / Special
● Shot Mix: Spot-up 3s Neutral, Midrange +1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Junk rarely targets Two-Way Wings specifically. Minor disruption to rhythm but
low-usage role is resilient.
vs Coach K Defense
● Shot Mix: Spot-up 3s −2pp, Backdoor cuts +1pp, Midrange +1pp
● Efficiency: 3PT FG% −1.5pp

● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Denial suppresses catch-and-shoot. Backdoor instinct provides some counter.
No-threes math directly targets perimeter value.
Offensive Archetype 2: 3-and-D Wing
Identity: Spacing + reliable defense. Low creation, high trust. Primary offensive role is
catch-and-shoot three-point shooting.
Offensive baseline: High spot-up volume, minimal self-creation, efficient from three, limited rim
finishing.
vs Containment Man
● Shot Mix: 3PT attempts +2pp, Rim attempts +1pp
● Efficiency: 3PT FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Help stays in drop; kick-outs and drift cuts available. Clean catch-and-shoot
rhythm.
vs Pack Line
● Shot Mix: 3PT attempts +3pp, Rim attempts −1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Paint loading prioritizes perimeter closeouts. More open threes.
vs Pressure Man (Denial)
● Shot Mix: 3PT attempts −3pp, Backdoor cuts +1pp
● Efficiency: 3PT FG% −2pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Denial is the hardest counter to 3-and-D Wing. Prevents clean catches. Lacks
handle to create off denial.
vs Switch Everything
● Shot Mix: 3PT attempts Neutral

● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Switching barely affects 3-and-D Wings — not involved in screen actions
offensively. Stand and shoot regardless.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp, Corner 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects ball handlers sideline, generating more kickout passes to
spotting wings.
vs Zone (Structured)
● Shot Mix: 3PT attempts +4pp, Short corner +1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Zone concedes volume threes but contests more aggressively. Best volume
environment for shooters.
vs Matchup Zone / Hybrid
● Shot Mix: 3PT attempts +2pp
● Efficiency: 3PT FG% −0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Hybrid partially tracks shooters but can lose them during rotations.
vs Press / Pressure Defense
● Shot Mix: Transition 3s +2pp, Early spot-ups +1pp
● Efficiency: 3PT FG% +1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Transition spot-ups offset pressure risk.
vs Junk / Special
● Shot Mix: 3PT attempts −3pp, Midrange +1pp
● Efficiency: 3PT FG% −3pp

● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Chasers and top-locks directly target 3-and-D Wings. Their primary weapon is
suppressed.
vs Coach K Defense
● Shot Mix: 3PT attempts −3pp, Backdoor cuts +1pp, Midrange +1pp
● Efficiency: 3PT FG% −2.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Coach K defense is the hardest counter to 3-and-D Wings. Run off the line,
denied catches, chased off screens. Primary weapon suppressed.
Offensive Archetype 3: POA Defender Guard
Identity: Defense-first guard who can take the toughest assignment. Limited offensive creation.
Contributes through defense, not scoring.
Offensive baseline: Very low usage. Spot-up 3s when open, occasional cuts. Limited
self-creation. Low efficiency variance because low volume.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp, Cut layups +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Containment ignores non-threats. POA Defender gets open looks by being
the 4th or 5th option.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp, Rim attempts −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line doesn't allocate help toward non-creators. Marginally open
perimeter.
vs Pressure Man (Denial)

● Shot Mix: Spot-up 3s −1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Even minimal denial disrupts a non-creator's catch rhythm. Low-volume
player is fragile offensively.
vs Switch Everything
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Switching has near-zero effect on a non-scoring guard. The defense gains
nothing by switching onto them.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects ball handlers, occasionally freeing weak-side outlets. Marginal
benefit.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp, Cut layups −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Zone ignores non-threats. POA Defender stands in gaps and gets open, but
rarely capitalizes at high rates.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Hybrid coverage confusion occasionally leaves the non-scorer open.
vs Press / Pressure Defense

● Shot Mix: Transition layups +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Press creates chaos. POA Defender can handle the ball in press-break but
isn't an offensive threat in transition.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Junk doesn't target non-scorers. Near-zero offensive interaction.
vs Coach K Defense
● Shot Mix: Spot-up 3s −1pp, Midrange +0.5pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer barely affected. Denial disrupts minimal catch-and-shoot.
Offensive Archetype 4: Primary Ball-Handler
(Offense-First)
Identity: Usage engine. Creates advantages; defense is secondary. PnR operator, pull-up
shooter, downhill creator.
Offensive baseline: Very high usage. Shot mix: rim + pull-up 3, secondary midrange. Efficiency:
skill-dependent, advantage-driven. Turnovers: moderate-high (creation load). Fouls drawn: high.
vs Containment Man
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp, Midrange Neutral
● Efficiency: Rim FG% +1pp, Pull-up 3P% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +2pp
● Rationale: Drop coverage invites downhill pressure and pull-ups.
vs Pack Line

● Shot Mix: Rim attempts −3pp, Pull-up 3 attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% −2pp, Pull-up 3P% −0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1.5pp
● Rationale: Paint crowding forces perimeter creation and tougher finishes.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp, Pull-up 3 attempts +1pp
● Efficiency: Rim FG% Neutral, Pull-up 3P% −0.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Ball pressure increases volatility and mistakes.
vs Switch Everything
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp, Midrange −1pp
● Efficiency: Rim FG% +1.5pp, Pull-up 3P% +0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +1.5pp
● Rationale: Isolation hunting and mismatch exploitation.
vs ICE / No-Middle
● Shot Mix: Rim attempts −2pp, Pull-up 3 attempts +1pp, Midrange +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1pp
● Rationale: Forces baseline drives and tougher angles.
vs Zone (Structured)
● Shot Mix: Rim attempts −4pp, Pull-up 3 attempts +2pp, Midrange +2pp
● Efficiency: Rim FG% −3pp, Pull-up 3P% −1pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −2pp
● Rationale: Paint protection limits rim pressure; jumpers rise.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts −2pp, Pull-up 3 attempts +1pp, Midrange +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1.5pp

● Rationale: Delayed switches disrupt rhythm without full paint collapse.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Early offense chances offset turnover risk.
vs Junk / Special
● Shot Mix: Rim attempts −3pp, Pull-up 3 attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% −2.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −2pp
● Rationale: Traps and shadows force contested pull-ups.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, Pull-up 3s −2pp, Midrange pull-ups +3pp
● Efficiency: Rim FG% −1pp, Pull-up 3P% −1.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: POA defenders contain. Rim protector erases drives. No-threes forces pull-up
midrange. Higher turnover rate.
Offensive Archetype 5: Switchable Defender Wing
Identity: Defense-first wing who can credibly switch across positions. Offensively limited —
contributes through spacing and occasional cuts, not creation.
Offensive baseline: Low usage. Spot-up 3s when open, opportunistic cuts. No self-creation.
Similar offensive profile to POA Defender Guard but at wing size.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp, Cut layups +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral

● Rationale: Containment ignores non-creators. Switchable Defender gets open as the
low-usage option.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp, Rim attempts −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line allocates help elsewhere. Marginal perimeter opening.
vs Pressure Man (Denial)
● Shot Mix: Spot-up 3s −1pp, Backdoor cuts +1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Denial disrupts catch timing for non-creators. Backdoor instinct provides some
counter.
vs Switch Everything
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Near-zero offensive interaction. Defense gains nothing by switching onto a
non-scorer.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Weak-side spacing occasionally opens. Marginal benefit.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp, Cut layups −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp

● Rationale: Zone ignores non-threats. Gets open in gaps but rarely maximizes
opportunity.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Coverage confusion occasionally leaves defender-wing open.
vs Press / Pressure Defense
● Shot Mix: Transition layups +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Length helps in press-break outlet but not an offensive weapon in transition.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Junk doesn't target non-scorers. Near-zero offensive interaction.
vs Coach K Defense
● Shot Mix: Spot-up 3s −1pp, Midrange +0.5pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer. Minimal interaction. Denial disrupts marginal catch-and-shoot.
Offensive Archetype 6: Anchor Big
Identity: Paint controller; drop coverage backbone. Offensively limited — scores on putbacks,
dump-offs, and occasional post touches. Not a self-creator.
Offensive baseline: Very low usage. Rim-only shot diet (putbacks, lobs, dump-offs). No
perimeter game. Fouls drawn through physical play.

vs Containment Man
● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Drop coverage yields soft box-outs and dump-off opportunities. Physical post
play draws fouls.
vs Pack Line
● Shot Mix: Rim attempts −1pp, Midrange face-ups +1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −0.5pp
● Rationale: Multiple bodies in the paint suppress putback opportunities.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Chaotic possessions create dump-off and putback chances.
vs Switch Everything
● Shot Mix: Post-up mismatches +2pp, Rim attempts +1pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1.5pp
● Rationale: Switches put smaller defenders on the Anchor Big, creating easy post-up and
seal opportunities.
vs ICE / No-Middle
● Shot Mix: Rim attempts Neutral
● Efficiency: Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE affects ball handlers more than post players. Minimal impact on Anchor
Big's rim-only game.
vs Zone (Structured)

● Shot Mix: Rim attempts +2pp, Short midrange +1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1pp
● Rationale: Zone rebounding assignments create crash seams. Anchor Big thrives on
putbacks against zone.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Delayed box-outs favor physical rebounders.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Broken possessions increase putback and dump-off chaos.
vs Junk / Special
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1pp
● Rationale: Pre-rotations and hit-first rules suppress crashers.
vs Coach K Defense
● Shot Mix: Rim attempts Neutral, Post touches Neutral
● Efficiency: Rim FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Coach K defense targets perimeter shooters and drivers, not post players.
Anchor Big's rim game relatively unaffected.
Offensive Archetype 7: Stretch Big

Identity: Spacing big; offense via gravity, defense via positioning. Pick-and-pop threat. Drags rim
protectors to perimeter.
Offensive baseline: Low-moderate usage. High 3PT (catch-and-shoot, pick-and-pop), moderate
midrange, low rim. Turnovers: low. Fouls drawn: low-moderate (closeouts).
vs Containment Man
● Shot Mix: 3PT attempts +3pp, Rim attempts −1pp
● Efficiency: 3P% +1.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Drop coverage concedes pick-and-pop spacing.
vs Pack Line
● Shot Mix: 3PT attempts +4pp, Rim attempts −2pp
● Efficiency: 3P% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Paint loading forces kick-outs to spacing bigs.
vs Pressure Man (Denial)
● Shot Mix: 3PT attempts +1pp
● Efficiency: 3P% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Ball pressure affects timing more than spacing.
vs Switch Everything
● Shot Mix: 3PT attempts +2pp, Rim attempts +1pp, Midrange −1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1pp
● Rationale: Short rolls and size mismatches create pop space.
vs ICE / No-Middle
● Shot Mix: 3PT attempts +2pp, Rim attempts −1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Baseline forcing opens weak-side pop windows.

vs Zone (Structured)
● Shot Mix: 3PT attempts +5pp, Midrange −1pp, Rim attempts −2pp
● Efficiency: 3P% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Zones concede high-volume above-the-break threes.
vs Matchup Zone / Hybrid
● Shot Mix: 3PT attempts +3pp, Rim attempts −1pp
● Efficiency: 3P% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid closeouts reduce shot quality but not volume.
vs Press / Pressure Defense
● Shot Mix: 3PT attempts +2pp
● Efficiency: 3P% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Early offense yields trailing-big pop threes.
vs Junk / Special
● Shot Mix: 3PT attempts −2pp, Midrange +1pp, Rim attempts −1pp
● Efficiency: 3P% −2pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Face-ups and stunts disrupt shooting rhythm.
vs Coach K Defense
● Shot Mix: 3PT attempts −3pp, Midrange face-ups +2pp, Rim attempts Neutral
● Efficiency: 3PT FG% −2pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: No-threes math runs Stretch Bigs off the line. Pop opportunities suppressed.
Forced into face-up midrange.
Offensive Archetype 8: Connector Guard

Identity: Low-usage organizer; keeps offense and defense coherent. Ball-mover, decision
accelerator, advantage extender.
Offensive baseline: Low-moderate usage. Balanced shot mix (spot-up 3s, cuts, opportunistic
rim). High efficiency via decision quality. Turnovers: low. Fouls drawn: low-moderate.
vs Containment Man
● Shot Mix: 3PT attempts +1pp, Rim attempts +1pp
● Efficiency: Overall FG% +1pp
● Turnover Rate: −0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Reads are clean; connectors thrive when help is predictable.
vs Pack Line
● Shot Mix: 3PT attempts +2pp, Rim attempts −1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Kick-out decisions increase connector value.
vs Pressure Man (Denial)
● Shot Mix: 3PT attempts −1pp, Rim attempts +1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Passing lanes tighten; processing speed is tested.
vs Switch Everything
● Shot Mix: Rim attempts +1pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Exploits mismatches through cuts and quick decisions.
vs ICE / No-Middle
● Shot Mix: 3PT attempts +1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Weak-side spacing opens simple reads.

vs Zone (Structured)
● Shot Mix: 3PT attempts +2pp, Rim attempts −1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Zone slows ball movement but still rewards quick decisions.
vs Matchup Zone / Hybrid
● Shot Mix: 3PT attempts +1pp, Rim attempts −1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Delayed rotations reduce clean advantage chains.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +1pp
● Efficiency: Overall FG% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Transition decisions matter more than half-court reads.
vs Junk / Special
● Shot Mix: 3PT attempts −1pp, Rim attempts −1pp, Midrange +1pp
● Efficiency: Overall FG% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Irregular coverage disrupts flow players.
vs Coach K Defense
● Shot Mix: 3PT attempts −1pp, Rim attempts Neutral, Midrange +0.5pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: Neutral
● Rationale: Denial stresses passing lanes. Connector's decision-making tested under
pressure. Turnover risk rises significantly.
Offensive Archetype 9: Offensive Wing Scorer

Identity: Shot-creation wing; offense drives value, defense is managed. Downhill attacker,
closeout killer, foul-draw engine.
Offensive baseline: Moderate-high usage. High rim, moderate pull-up 3, limited midrange.
Contact-dependent efficiency. Turnovers: moderate. Fouls drawn: high.
vs Containment Man
● Shot Mix: Rim attempts +3pp, Midrange Neutral, 3PT attempts −1pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +2pp
● Rationale: Drop-style containment allows straight-line drives.
vs Pack Line
● Shot Mix: Rim attempts −4pp, Midrange +2pp, 3PT Neutral
● Efficiency: Rim FG% −3pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −3pp
● Rationale: Loaded paint removes driving lanes.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Aggression creates both blow-bys and mistakes.
vs Switch Everything
● Shot Mix: Rim attempts +2pp, Midrange −1pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +1.5pp
● Rationale: Mismatches favor athletic downhill wings.
vs ICE / No-Middle
● Shot Mix: Rim attempts −2pp, Midrange +2pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Baseline forcing limits power drives.

vs Zone (Structured)
● Shot Mix: Rim attempts −5pp, Midrange +3pp
● Efficiency: Rim FG% −4pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −4pp
● Rationale: Zones erase straight-line penetration.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts −3pp, Midrange +2pp
● Efficiency: Rim FG% −2.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −3pp
● Rationale: Delayed help still loads the paint.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +2pp, 3PT −1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Open-floor attacks offset ball pressure.
vs Junk / Special
● Shot Mix: Rim attempts −4pp, Midrange +2pp
● Efficiency: Rim FG% −3.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −3.5pp
● Rationale: Gap rules, walls, and stunts neutralize slashers.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, 3PT −1pp, Midrange +2pp
● Efficiency: Rim FG% −1.5pp, 3PT FG% −1pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Rim protector contests drives. No-threes suppresses kick-out 3s. Funneled
into contested midrange. Still draws some fouls.
Offensive Archetype 10: Gap / Team Defender Wing

Identity: IQ-driven defender; wins with positioning and communication. Offensively minimal —
even less creation than 3-and-D since defense is the primary identity.
Offensive baseline: Very low usage. Occasional spot-up 3s, corner standing, rare cuts. Offense
is incidental.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Defensive help ignores this player completely. Gets open by being irrelevant
offensively.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line allocates all help elsewhere. Marginal perimeter opening.
vs Pressure Man (Denial)
● Shot Mix: Spot-up 3s −1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Even minimal denial disrupts a non-creator. Fragile offensive role.
vs Switch Everything
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zero offensive interaction. Defense gains nothing switching onto this
archetype.
vs ICE / No-Middle
● Shot Mix: Corner 3s +1pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral

● Foul-Draw Rate: Neutral
● Rationale: Weak-side corner opens marginally.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zone ignores non-threats. Gets open in gaps.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Coverage confusion occasionally leaves gap-defender open.
vs Press / Pressure Defense
● Shot Mix: Transition layups +0.5pp
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Minimal offensive role in press-break or transition.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Junk ignores non-scorers entirely.
vs Coach K Defense
● Shot Mix: Spot-up 3s −1pp, Midrange +0.5pp
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer. Minimal offensive interaction.

Offensive Archetype 11: Mobile Defensive Big
Identity: Big who survives space; P&R defender more than paint anchor. Offensively limited —
similar to Anchor Big but even less post game. Contributes rim rolls, putbacks, short-roll
passing.
Offensive baseline: Very low usage. Rim-only (rolls, putbacks, dump-offs). Occasionally shows
short-roll passing. No perimeter game.
vs Containment Man
● Shot Mix: Rim attempts +1pp, Short-roll passing +0.5pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Drop coverage yields soft help. Dump-offs available.
vs Pack Line
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −0.5pp
● Rationale: Multiple paint bodies suppress easy finishes.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Chaos creates dump-off and roll opportunities.
vs Switch Everything
● Shot Mix: Rim attempts +1pp, Post-up mismatches +1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Switches put smaller defenders on Mobile Big. Size advantage at rim.
vs ICE / No-Middle
● Shot Mix: Rim attempts Neutral

● Efficiency: Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE affects ball handlers, not roll men directly. Short-roll passing slightly
disrupted.
vs Zone (Structured)
● Shot Mix: Rim attempts +1pp, Short midrange +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Zone rebounding assignments create crash seams.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Delayed box-outs favor mobile rebounders.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Broken possessions create roll and putback chaos.
vs Junk / Special
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Pre-rotations suppress easy rim attempts.
vs Coach K Defense
● Shot Mix: Rim attempts Neutral
● Efficiency: Rim FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral

● Rationale: Minimal offensive role. Coach K defense doesn't target non-scoring bigs.
Offensive Archetype 12: Chaos Disruptor Wing
Identity: High-activity, high-variance defender; creates disorder. Offensively limited but provides
transition scoring, putbacks from deflections, and occasional open 3s from defensive activity
creating fast-break looks.
Offensive baseline: Low-moderate usage. Transition scoring, opportunistic rim attempts, some
spot-up 3s. High variance.
vs Containment Man
● Shot Mix: Transition rim +1pp, Spot-up 3s +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Containment allows offensive flow; Chaos Wing gets transition looks from
defensive activity.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp, Rim attempts −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line suppresses transition rim opportunities. Perimeter remains open.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: +0.5pp
● Rationale: Pressure creates chaotic possessions that Chaos Wing thrives in offensively.
vs Switch Everything
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp

● Rationale: Switches occasionally create driving lanes for athletic wings.
vs ICE / No-Middle
● Shot Mix: Wing 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Weak-side spacing marginally opens.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +2pp, Rim attempts −1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Zone suppresses transition scoring but opens perimeter.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid confusion occasionally benefits high-energy players.
vs Press / Pressure Defense
● Shot Mix: Transition rim +2pp, Transition 3s +1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Press creates the chaos this archetype thrives in. Highest offensive upside
environment.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Junk doesn't target Chaos Wings. Disruption is mutual.
vs Coach K Defense

● Shot Mix: Transition rim +1pp, Spot-up 3s −1pp
● Efficiency: 3PT FG% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +0.5pp
● Rationale: Gets some transition looks from pressure environment but no-threes
suppresses spot-up 3s.
Offensive Archetype 13: Point Forward
Identity: Size-based secondary creator; offense flows through them without full guard burden.
Playmaking vision + ball security at forward size.
Offensive baseline: Moderate usage. Balanced: post-up face-ups, drive-and-kick, pull-up
midrange, some spot-up 3s. High assist rate. Turnovers: moderate. Fouls drawn: moderate.
vs Containment Man
● Shot Mix: Post face-ups +1pp, Drive-and-kick 3s +1pp, Midrange +1pp
● Efficiency: Overall FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Containment gives Point Forwards clean reads and face-up opportunities at
their size.
vs Pack Line
● Shot Mix: Rim attempts −2pp, Midrange face-ups +2pp, Kick-out 3s +2pp
● Efficiency: Rim FG% −1pp, Midrange FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1pp
● Rationale: Paint congestion limits drives but face-up game and passing vision create
kick-out looks.
vs Pressure Man (Denial)
● Shot Mix: Post face-ups −1pp, Drive attempts +1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Pressure on the Point Forward's handle is the primary vulnerability. Turnovers
spike.

vs Switch Everything
● Shot Mix: Post-up mismatches +2pp, Rim attempts +1pp
● Efficiency: Rim FG% +1.5pp, Overall FG% +1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1.5pp
● Rationale: Size-based creation exploits switches onto smaller defenders. Best offensive
environment.
vs ICE / No-Middle
● Shot Mix: Baseline drives +1pp, Midrange face-ups +1pp, Middle drives −2pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects but Point Forward's face-up and passing game adapts to
baseline flow.
vs Zone (Structured)
● Shot Mix: High-post facilitating +3pp, Spot-up 3s +1pp, Rim attempts −2pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1pp
● Rationale: Point Forwards are zone-killers at the high post. Passing vision exploits zone
gaps.
vs Matchup Zone / Hybrid
● Shot Mix: High-post face-ups +2pp, Midrange +1pp
● Efficiency: Overall FG% Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid coverage partially tracks but Point Forward reads the confusion.
vs Press / Pressure Defense
● Shot Mix: Transition rim +1pp, Early drives +1pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Point Forward can advance the ball in press-break. Handle vulnerability
creates turnover risk.

vs Junk / Special
● Shot Mix: Midrange +1pp, Post face-ups +1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −1pp
● Rationale: Junk specifically targets creators. Point Forward's handle is tested.
vs Coach K Defense
● Shot Mix: Post face-ups Neutral, 3PT −1pp, Midrange +1pp, Drives −0.5pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Denial stresses Point Forward's handle. Rim protector contests drives. Size
helps survive but efficiency drops.
Offensive Archetype 14: Utility Forward
Identity: Lineup glue; fills gaps without being a focal point. Motor + positioning + ball security.
Not a scorer.
Offensive baseline: Very low usage. Spot-up 3s when open, screens, cuts, putbacks. No
self-creation. Efficiency via role acceptance.
vs Containment Man
● Shot Mix: Spot-up 3s +1pp, Cut layups +0.5pp
● Efficiency: 3PT FG% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Help ignores Utility Forward. Open looks in gaps.
vs Pack Line
● Shot Mix: Spot-up 3s +1pp, Rim attempts −1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line allocates help elsewhere. Marginal opening.
vs Pressure Man (Denial)

● Shot Mix: Spot-up 3s −1pp
● Efficiency: 3PT FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Even light denial disrupts non-creators.
vs Switch Everything
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Switching may create occasional size mismatch for Utility Forward to exploit
via cuts.
vs ICE / No-Middle
● Shot Mix: Corner 3s +0.5pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Weak-side corner marginally opens.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +1pp, Short corner +1pp
● Efficiency: 3PT FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zone ignores non-threats. Utility Forward plants in gaps.
vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +0.5pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Marginal benefit from coverage confusion.
vs Press / Pressure Defense
● Shot Mix: Transition layups +0.5pp
● Efficiency: Neutral
● Turnover Rate: +0.5pp

● Foul-Draw Rate: Neutral
● Rationale: Motor helps in press-break outlet. Not an offensive weapon.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Junk ignores non-scorers.
vs Coach K Defense
● Shot Mix: Spot-up 3s −1pp, Midrange +0.5pp
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer. Minimal interaction.
Offensive Archetype 15: Roll Man / Vertical Threat
Identity: Creates offensive gravity via rim pressure; finishes plays. Screen + roll + finish.
Putbacks and lobs.
Offensive baseline: Low-moderate usage. Very high rim (rolls, lobs, putbacks, dump-offs).
Minimal midrange. No 3PT. Fouls drawn: high (contact at rim).
vs Containment Man
● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1.5pp
● Rationale: Drop coverage yields soft box-outs and lob/dump-off opportunities.
vs Pack Line
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Multiple bodies in the paint suppress easy rolls and lobs.

vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Pressure on ball handler increases roll opportunities when screen is used.
vs Switch Everything
● Shot Mix: Rim attempts +3pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +2pp
● Rationale: Small defenders struggle with box-outs and vertical contests after switches.
vs ICE / No-Middle
● Shot Mix: Rim attempts −1pp, Short-roll +1pp
● Efficiency: Rim FG% −0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −0.5pp
● Rationale: ICE limits downhill roll angles but short-roll game activates.
vs Zone (Structured)
● Shot Mix: Rim attempts +3pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1.5pp
● Rationale: Zone rebounding assignments create crash seams. Roll Man dominates
offensive glass.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Delayed box-outs favor high-motor roll men.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +1pp

● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +0.5pp
● Rationale: Broken possessions increase lob and dump-off chaos.
vs Junk / Special
● Shot Mix: Rim attempts −2pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Pre-rotations and hit-first rules neutralize roll men.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, Short-roll +1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Rim protector contests roll finishes. Short-roll passing increases.
Offensive Archetype 16: Offensive Big (Defense Liability)
Identity: Offense-first interior scorer; requires protection. Post scoring, touch finishing, foul
drawing. Defense is a minus.
Offensive baseline: Moderate usage. Very high rim (post-ups, hooks, turnarounds), moderate
midrange, minimal 3PT. Efficiency: high on seals, variable vs doubles. Turnovers: moderate.
Fouls drawn: very high.
vs Containment Man
● Shot Mix: Rim attempts +3pp, Midrange +1pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +3pp
● Rationale: Single-coverage post defense rewards strength and seals.
vs Pack Line
● Shot Mix: Rim attempts −3pp, Midrange +2pp
● Efficiency: Rim FG% −2pp

● Turnover Rate: +1.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Crowded paint invites digs and early doubles.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp, Midrange +1pp
● Efficiency: Rim FG% Neutral
● Turnover Rate: +2pp
● Foul-Draw Rate: +1pp
● Rationale: Aggressive entry denial increases volatility once ball is caught.
vs Switch Everything
● Shot Mix: Rim attempts +4pp, Midrange −1pp
● Efficiency: Rim FG% +3pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +3pp
● Rationale: Small-on-big mismatches strongly favor post scorers.
vs ICE / No-Middle
● Shot Mix: Rim attempts −1pp, Midrange +2pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Baseline forcing alters post entry angles.
vs Zone (Structured)
● Shot Mix: Rim attempts −5pp, Midrange +3pp
● Efficiency: Rim FG% −4pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −4pp
● Rationale: Zone collapses neutralize post seals and reduce fouls.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts −3pp, Midrange +2pp
● Efficiency: Rim FG% −2.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −3pp
● Rationale: Late doubles and stunts disrupt rhythm.

vs Press / Pressure Defense
● Shot Mix: Rim attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +1.5pp
● Rationale: Early seals before defense sets increase scoring chances.
vs Junk / Special
● Shot Mix: Rim attempts −4pp, Midrange +2pp
● Efficiency: Rim FG% −3.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: −3pp
● Rationale: Fronts, traps, and scrams explicitly target post hubs.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, Midrange +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −0.5pp
● Rationale: Rim protector directly contests post finishes. Denial stresses entry passes.
Offensive Archetype 17: Situational Shooter (Specialist)
Identity: One-job player: spacing. Limited elsewhere. Catch-and-shoot specialist with movement
shooting.
Offensive baseline: Low usage. Very high 3PT (catch-and-shoot + movement), minimal rim, low
midrange. High efficiency when clean, fragile under disruption. Turnovers: very low. Fouls
drawn: low.
vs Containment Man
● Shot Mix: 3PT attempts +2pp
● Efficiency: 3P% +1.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +0.5pp
● Rationale: Drop coverage prioritizes paint; shooters gain clean perimeter looks.
vs Pack Line

● Shot Mix: 3PT attempts +3pp, Rim attempts −1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Help-heavy paint defense concedes kick-outs and relocations.
vs Pressure Man (Denial)
● Shot Mix: 3PT attempts −2pp, Midrange +1pp
● Efficiency: 3P% −2pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Face-guarding and denial suppress rhythm threes. Hardest counter to
shooters.
vs Switch Everything
● Shot Mix: 3PT attempts −1pp, Midrange +1pp
● Efficiency: 3P% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Switches remove screen advantage and limit separation.
vs ICE / No-Middle
● Shot Mix: 3PT attempts +1pp
● Efficiency: 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Ball containment shifts help toward handlers, freeing weak-side shooters.
vs Zone (Structured)
● Shot Mix: 3PT attempts +4pp, Midrange −1pp, Rim attempts −1pp
● Efficiency: 3P% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Zones concede volume threes but contest more aggressively.
vs Matchup Zone / Hybrid
● Shot Mix: 3PT attempts +2pp, Rim attempts −1pp
● Efficiency: 3P% −0.5pp
● Turnover Rate: +0.5pp

● Foul-Draw Rate: Neutral
● Rationale: Hybrid coverage limits clean movement windows.
vs Press / Pressure Defense
● Shot Mix: 3PT attempts +1pp
● Efficiency: 3P% Neutral
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Early offense produces transition spot-ups.
vs Junk / Special
● Shot Mix: 3PT attempts −3pp, Midrange +1pp
● Efficiency: 3P% −3pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Chasers and top-locks directly neutralize movement shooters.
vs Coach K Defense
● Shot Mix: 3PT attempts −4pp, Midrange +2pp
● Efficiency: 3PT FG% −3pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: No-threes math specifically designed to neutralize shooters. Chasers, denial,
top-locks all applied. Hardest defensive environment for Situational Shooters.
Offensive Archetype 18: Defensive Specialist
(Non-Scoring)
Identity: Defense-only contributor; offense minimized. On-ball containment + screen navigation
+ team defense. No creation.
Offensive baseline: Minimal usage. Rare spot-up 3s, occasional cuts. Offense is liability-level.
Near-zero scoring impact.
vs Containment Man
● Shot Mix: Spot-up 3s +0.5pp
● Efficiency: Neutral

● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Defense completely ignores this player offensively. Occasionally open by
default.
vs Pack Line
● Shot Mix: Spot-up 3s +0.5pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Pack Line allocates all help elsewhere.
vs Pressure Man (Denial)
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Even minimal pressure disrupts a non-scorer's catch. Fragile.
vs Switch Everything
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zero offensive interaction.
vs ICE / No-Middle
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: ICE affects ball handlers. This player isn't one.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +1pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Zone ignores non-threats. Open by default but rarely converts.

vs Matchup Zone / Hybrid
● Shot Mix: Spot-up 3s +0.5pp
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Coverage confusion occasionally leaves open.
vs Press / Pressure Defense
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Not an offensive threat in any context.
vs Junk / Special
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Junk completely ignores non-scorers.
vs Coach K Defense
● Shot Mix: Neutral
● Efficiency: Neutral
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: Non-scorer. Zero offensive interaction.
Offensive Archetype 19: Energy Big
Identity: Bench impact via effort, rebounding, rim pressure. Putback scorer, extra-possession
generator, screen + crash specialist.
Offensive baseline: Very low usage. Rim only (putbacks, dumps). Virtually no jumpers. Very high
efficiency on limited attempts. Turnovers: very low. Fouls drawn: moderate-high (scramble
finishes).
vs Containment Man

● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1.5pp
● Rationale: Drop coverage yields soft box-outs and rebound lanes.
vs Pack Line
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: −1pp
● Rationale: Multiple bodies in the paint suppress second chances.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Chaotic possessions create crash opportunities.
vs Switch Everything
● Shot Mix: Rim attempts +3pp
● Efficiency: Rim FG% +2pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +2pp
● Rationale: Small defenders struggle with box-outs.
vs ICE / No-Middle
● Shot Mix: Rim attempts Neutral
● Efficiency: Rim FG% Neutral
● Turnover Rate: Neutral
● Foul-Draw Rate: Neutral
● Rationale: Scheme affects ball containment more than rebounding lanes.
vs Zone (Structured)
● Shot Mix: Rim attempts +3pp
● Efficiency: Rim FG% +1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1.5pp

● Rationale: Zone rebounding assignments create crash seams.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts +2pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1pp
● Rationale: Delayed box-outs favor high-motor rebounders.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: +0.5pp
● Rationale: Broken possessions increase rebound chaos.
vs Junk / Special
● Shot Mix: Rim attempts −2pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Pre-rotations and hit-first rules neutralize crashers.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp
● Efficiency: Rim FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Rim protector limits putback quality. Energy Big's opportunities suppressed.
Offensive Archetype 20: Situational Ball-Handler (Bench
Guard)
Identity: Secondary handler; stabilizes units without full creation load. Off-ball creator, secondary
PnR operator, scoring + playmaking blend.

Offensive baseline: Moderate usage. Pull-up 3s, rim attacks, selective midrange. Efficiency
depends on matchup leverage. Turnovers: moderate. Fouls drawn: moderate.
vs Containment Man
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp
● Efficiency: Rim FG% +1pp, Pull-up 3P% +0.5pp
● Turnover Rate: Neutral
● Foul-Draw Rate: +1.5pp
● Rationale: Secondary attackers punish drop coverage when the primary draws help.
vs Pack Line
● Shot Mix: Rim attempts −2pp, Pull-up 3 attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Paint help forces perimeter creation.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +1pp, Pull-up 3 attempts +1pp
● Efficiency: Pull-up 3P% −0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Ball pressure increases volatility for secondary handlers.
vs Switch Everything
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp, Midrange −1pp
● Efficiency: Rim FG% +1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +1pp
● Rationale: Mismatch hunting favors skilled combo guards.
vs ICE / No-Middle
● Shot Mix: Rim attempts −1pp, Pull-up 3 attempts +1pp, Midrange +1pp
● Efficiency: Rim FG% −1pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Baseline forcing limits downhill angles.
vs Zone (Structured)

● Shot Mix: Rim attempts −3pp, Pull-up 3 attempts +2pp, Midrange +2pp
● Efficiency: Pull-up 3P% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1.5pp
● Rationale: Zone slows penetration and invites jumpers.
vs Matchup Zone / Hybrid
● Shot Mix: Rim attempts −2pp, Pull-up 3 attempts +1pp, Midrange +1pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Late switches disrupt secondary creation.
vs Press / Pressure Defense
● Shot Mix: Rim attempts +2pp, Pull-up 3 attempts +1pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: +1pp
● Rationale: Early offense favors attacking combo guards.
vs Junk / Special
● Shot Mix: Rim attempts −3pp, Pull-up 3 attempts +2pp, Midrange +1pp
● Efficiency: Rim FG% −2pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −1.5pp
● Rationale: Shadowing and traps target secondary initiators.
vs Coach K Defense
● Shot Mix: Rim attempts −1pp, Pull-up 3s −1pp, Midrange +2pp
● Efficiency: Rim FG% −1pp, Pull-up 3P% −1pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +0.5pp
● Rationale: Secondary handlers tested by denial and POA pressure. Rim protector
contests drives. No-threes forces midrange.
Offensive Archetype 21: Developmental Prospect

Identity: Tools > production; projection archetype. Physical tools composite ≥ 70. One offensive
trait ≥ 70, one defensive trait ≥ 70. Production is inconsistent.
Offensive baseline: Variable usage. Inconsistent shot mix — depends on which tool is most
developed. High variance game-to-game. Turnovers: moderate-high (decision-making still
developing). Fouls drawn: moderate.
vs Containment Man
● Shot Mix: Rim attempts +1pp, Spot-up 3s +0.5pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Containment gives space for tools to show. Developmental Prospect benefits
from soft coverage.
vs Pack Line
● Shot Mix: Rim attempts −2pp, Midrange +1pp, 3PT +1pp
● Efficiency: Rim FG% −1.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Pack Line exposes developing decision-making. Physical tools less useful in
congested paint.
vs Pressure Man (Denial)
● Shot Mix: Rim attempts +0.5pp
● Efficiency: Overall FG% −1pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +0.5pp
● Rationale: Pressure exploits underdeveloped handles and decision-making. Highest
turnover environment.
vs Switch Everything
● Shot Mix: Rim attempts +1pp, Midrange +0.5pp
● Efficiency: Overall FG% +0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Physical tools create mismatch advantages on switches. Size and athleticism
matter.
vs ICE / No-Middle

● Shot Mix: Baseline drives +1pp, Midrange +0.5pp, Middle drives −1.5pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +0.5pp
● Foul-Draw Rate: Neutral
● Rationale: ICE redirects developing ball handlers. Decision-making tested on baseline
reads.
vs Zone (Structured)
● Shot Mix: Spot-up 3s +1pp, Midrange +1pp, Rim attempts −2pp
● Efficiency: Overall FG% −1pp
● Turnover Rate: +1pp
● Foul-Draw Rate: −1pp
● Rationale: Zone exposes shooting and decision-making gaps. Tools less relevant
against structure.
vs Matchup Zone / Hybrid
● Shot Mix: Midrange +1pp, Spot-up 3s +0.5pp
● Efficiency: Overall FG% −0.5pp
● Turnover Rate: +1pp
● Foul-Draw Rate: Neutral
● Rationale: Hybrid confusion amplifies decision-making inconsistency.
vs Press / Pressure Defense
● Shot Mix: Transition rim +1pp, Early 3s +0.5pp
● Efficiency: Rim FG% +0.5pp
● Turnover Rate: +2pp
● Foul-Draw Rate: +0.5pp
● Rationale: Physical tools shine in transition but ball security suffers under pressure.
vs Junk / Special
● Shot Mix: Midrange +1pp
● Efficiency: Overall FG% −1pp
● Turnover Rate: +1.5pp
● Foul-Draw Rate: −0.5pp
● Rationale: Junk exposes every developmental gap. Inconsistency peaks against
unconventional looks.
vs Coach K Defense
● Shot Mix: 3PT −1pp, Rim attempts −1pp, Midrange +1pp

● Efficiency: Overall FG% −1.5pp
● Turnover Rate: +2.5pp
● Foul-Draw Rate: +0.5pp
● Rationale: Coach K defense exposes every developmental gap. Pressure creates
turnovers. Rim protection contests finishing. Worst defensive environment for raw
players.
END OF PART 2: OFFENSIVE ARCHETYPE × DEFENSIVE SYSTEM (210 entries complete)
PART 3: DEFENSIVE ARCHETYPE ×
OFFENSIVE SYSTEM
Each archetype's baseline is neutral — no offensive system modifier applied. All deltas
represent how this defensive archetype expresses pressure, disruption, or vulnerability inside
each offensive system structure.
Format per entry: Shot Profile Shift (PP), Efficiency Shift (%), Turnover Shift (PP), Foul/FT Shift
(PP).
All deltas are bounded by the Modifier Framework. Shot profile shifts must sum to ~0 across
rim/mid/3PA.
Defensive Archetype 1: Two-Way Wing
Identity: Scales on both ends. Reliable defender who also contributes offensively. Defensive
impact: solid on-ball, good team defense, doesn't dominate any single area but doesn't have
holes.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.4pp
● Rationale: Versatile enough to navigate screens and contest. Moderate across-the-board
suppression.

vs 5-Out Motion
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Tracks off-ball movement competently. Reduces clean looks without
dominating.
vs Motion / Read & React
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Good reads on continuity actions. Doesn't get lost in motion.
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Transitions well between halfcourt and transition defense.
vs Dribble Drive
● Shot Profile: Δ3PA −1pp | ΔRim −1.5pp | ΔMid +2.5pp
● Efficiency: −1.8%
● Turnovers: +0.6pp
● FTAR: −0.5pp
● Rationale: Lateral quickness helps contain drives. Pushes offense toward tougher
midrange.
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Reads backdoor cuts, positions well on off-ball screens. Solid but not
dominant.
vs Flex

● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Navigates screening actions and maintains positioning.
vs Swing
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Closes out on reversals without overcommitting.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.3pp
● FTAR: −0.4pp
● Rationale: Helps in post doubles and recovers. Not a post defender but team defense
holds.
vs Moreyball
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.5pp
● Rationale: Versatility matters against Moreyball's rim-and-3 focus. Contests both.
vs Heliocentric
● Shot Profile: Δ3PA −0.5pp | ΔRim −1.5pp | ΔMid +2pp
● Efficiency: −1.8%
● Turnovers: +0.6pp
● FTAR: −0.5pp
● Rationale: Can be assigned to the anchor or help off weak-side. Versatility is the asset.
vs Coach K Offense
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%

● Turnovers: +0.5pp
● FTAR: −0.4pp
● Rationale: Versatile enough to track motion and contest. Moderate suppression across
the board.
Defensive Archetype 2: 3-and-D Wing
Identity: Spacing + reliable defense. Perimeter shot contest + team positioning. Not a primary
stopper but reduces clean looks from wings.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Contests perimeter shots well. Limited help defense on roll man.
vs 5-Out Motion
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Tracks shooters through off-ball movement. Shot contest quality is high.
vs Motion / Read & React
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.2%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Positioning and closeout discipline limit clean movement threes.
vs Pace & Space
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.2pp
● FTAR: −0.2pp
● Rationale: Transition closeouts are tested. Solid but not elite in space.
vs Dribble Drive

● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Perimeter contest helps on kick-out 3s. Can contain drives but not a stopper.
vs Princeton
● Shot Profile: Δ3PA −1pp | ΔRim −0.5pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.2pp
● FTAR: −0.3pp
● Rationale: Adequate positioning on cuts. Perimeter contest matters less in Princeton's
post-heavy offense.
vs Flex
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Navigates screens and contests off-screen shots well.
vs Swing
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Closeout discipline on ball reversals is the primary defensive expression.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.1pp
● FTAR: −0.2pp
● Rationale: Limited impact against interior-focused offense. Helps on kick-outs only.
vs Moreyball
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp

● FTAR: −0.4pp
● Rationale: Perimeter contest directly attacks Moreyball's 3-point volume.
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.4pp
● FTAR: −0.4pp
● Rationale: Can guard the anchor's spot-up targets. Limited impact on the anchor directly.
vs Coach K Offense
● Shot Profile: Δ3PA −1.5pp | ΔRim −0.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.3pp
● Rationale: Perimeter contest helps against Coach K's 3-point volume. Limited help on
rim pressure.
Defensive Archetype 3: POA Defender Guard
Identity: Defense-first guard who takes the toughest perimeter assignment. Elite containment,
screen navigation, reduces paint touches and clean pull-ups.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.5pp
● FTAR: −0.6pp
● Rationale: POA kills initial PnR advantage → fewer downhill rim attempts, more stalled
midrange.
vs 5-Out Motion
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.8pp
● FTAR: −0.4pp
● Rationale: 5-out can re-flow, but POA reduces clean blow-bys that power drive-kick.

vs Motion / Read & React
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.6pp
● FTAR: −0.3pp
● Rationale: More distributed creation softens POA impact, but advantage creation still
drops.
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +1.0pp
● FTAR: −0.4pp
● Rationale: POA slows early advantage in semi-transition → fewer rim collisions, fewer
FTs.
vs Dribble Drive
● Shot Profile: Δ3PA −1pp | ΔRim −2.5pp | ΔMid +3.5pp
● Efficiency: −2.5%
● Turnovers: +1.2pp
● FTAR: −0.8pp
● Rationale: Dribble Drive depends on penetration; POA directly attacks the engine.
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.5pp
● FTAR: −0.2pp
● Rationale: Princeton's value is reads/cuts/post-hub — POA matters less than
off-ball/team defense.
vs Flex
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.2pp
● Rationale: Structured actions reduce on-ball burden; POA still disrupts entries/initiation
timing.

vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.7pp
● FTAR: −0.3pp
● Rationale: Swing creates advantages via reversal + re-screen; POA removes first-step
separation.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim −0.5pp | ΔMid Neutral
● Efficiency: −0.5%
● Turnovers: +0.3pp
● FTAR: −0.1pp
● Rationale: Offense runs through post touches; POA mainly affects entry pressure and
closeout quality.
vs Moreyball
● Shot Profile: Δ3PA −0.5pp | ΔRim −1.5pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.9pp
● FTAR: −0.6pp
● Rationale: POA reduces rim pressure + foul pressure; Moreyball degrades into more mid
attempts.
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.8pp
● FTAR: −0.7pp
● Rationale: Heliocentric systems are most vulnerable when the engine gets bottled. POA
directly shuts down the anchor.
vs Coach K Offense
● Shot Profile: Δ3PA −1.5pp | ΔRim −1.5pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.5pp
● FTAR: −0.6pp

● Rationale: POA containment critical against Coach K's multiple handlers. Reduces clean
initiations and suppresses transition. High-impact.
Defensive Archetype 4: Primary Ball-Handler
(Offense-First)
Identity: Usage engine on offense, but defense is secondary. On defense: gambles for steals,
inconsistent effort, loses focus off-ball. Liability against quality creators.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +1pp | ΔRim +1pp | ΔMid −2pp
● Efficiency: +1.5%
● Turnovers: −0.5pp
● FTAR: +0.5pp
● Rationale: Gets screened off easily. PnR handlers exploit poor navigation for clean
looks.
vs 5-Out Motion
● Shot Profile: Δ3PA +1pp | ΔRim +0.5pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Loses off-ball players in motion. Closeouts are late.
vs Motion / Read & React
● Shot Profile: Δ3PA +1pp | ΔRim +0.5pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Read-based offenses exploit ball-watching tendencies.
vs Pace & Space
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Transition defense effort is inconsistent.
vs Dribble Drive

● Shot Profile: Δ3PA +0.5pp | ΔRim +1.5pp | ΔMid −2pp
● Efficiency: +1.5%
● Turnovers: −0.5pp
● FTAR: +0.5pp
● Rationale: Gets beaten off the dribble by quality drivers. Rim attempts increase against
this defender.
vs Princeton
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Backdoor cuts exploit inattention. Princeton punishes ball-watchers.
vs Flex
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Screening actions exploit poor screen navigation.
vs Swing
● Shot Profile: Δ3PA +1pp | ΔRim +0.5pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Ball reversal exploits slow closeouts.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.2%
● Turnovers: −0.3pp
● FTAR: +0.4pp
● Rationale: Post doubles leave this defender's man open. Recovery is slow.
vs Moreyball
● Shot Profile: Δ3PA +1pp | ΔRim +1pp | ΔMid −2pp
● Efficiency: +1.5%
● Turnovers: −0.5pp

● FTAR: +0.5pp
● Rationale: Moreyball hunts the weakest perimeter defender. Primary Ball-Handler is the
target.
vs Heliocentric
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.5%
● Turnovers: −0.5pp
● FTAR: +0.5pp
● Rationale: If matched against the anchor, gets dominated. If off-ball, loses assignment in
help.
vs Coach K Offense
● Shot Profile: Δ3PA +1pp | ΔRim +1pp | ΔMid −2pp
● Efficiency: +1.5%
● Turnovers: −0.5pp
● FTAR: +0.5pp
● Rationale: Gets lost in Coach K's motion. Can't track off-ball movement. Closeouts late.
Defensive liability.
Defensive Archetype 5: Switchable Defender Wing
(Carry-forward from old Archetype 2, relabeled)
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
vs 5-Out Motion
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Motion / Read & React

● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Pace & Space
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Dribble Drive
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +2pp
● FTAR: −1.0pp
vs Princeton
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Flex
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Swing
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.0%

● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Moreyball
● Shot Profile: Δ3PA −2pp | ΔRim −2pp | ΔMid +4pp
● Efficiency: −2.5%
● Turnovers: +1pp
● FTAR: −1.0pp
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.0%
● Turnovers: +2pp
● FTAR: −1.0pp
vs Coach K Offense
● Shot Profile: Δ3PA −1.5pp | ΔRim −1pp | ΔMid +2.5pp
● Efficiency: −2.0%
● Turnovers: +1pp
● FTAR: −0.5pp
● Rationale: Switching capability helps against Coach K's PnR and motion. Can guard
multiple positions in flow.
Defensive Archetype 6: Anchor Big
Identity: Paint controller; drop coverage backbone. Rim protection + paint deterrence +
defensive rebounding. The defensive anchor.
(Carry-forward from old Archetype 4 — Help-Rim Protector, relabeled)
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +3pp | ΔRim −4pp | ΔMid +1pp
● Efficiency: −3.0%
● Turnovers: +0.5pp
● FTAR: −1.0pp
vs 5-Out Motion

● Shot Profile: Δ3PA +2pp | ΔRim −3pp | ΔMid +1pp
● Efficiency: −2.0%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Motion / Read & React
● Shot Profile: Δ3PA +2pp | ΔRim −3pp | ΔMid +1pp
● Efficiency: −2.0%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Pace & Space
● Shot Profile: Δ3PA +2pp | ΔRim −3pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Dribble Drive
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +0.5pp
● FTAR: −1.0pp
vs Princeton
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Flex
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: Neutral
● FTAR: −0.5pp
vs Swing
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −2.0%

● Turnovers: Neutral
● FTAR: −0.5pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +1pp | ΔRim −4pp | ΔMid +3pp
● Efficiency: −3.5%
● Turnovers: +0.5pp
● FTAR: −1.0pp
vs Moreyball
● Shot Profile: Δ3PA +3pp | ΔRim −4pp | ΔMid +1pp
● Efficiency: −2.5%
● Turnovers: +0.5pp
● FTAR: −1.0pp
vs Heliocentric
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +1.0pp
● FTAR: −1.0pp
vs Coach K Offense
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −2.5%
● Turnovers: +0.5pp
● FTAR: −1.0pp
● Rationale: Rim protection critical against Coach K's rim pressure. But can't chase
shooters to perimeter — 3s leak.
Defensive Archetype 7: Stretch Big
Identity: Spacing big; defense via positioning, not rim protection. Not a paint controller.
Adequate team defense but vulnerable at the rim.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +0.8%

● Turnovers: −0.2pp
● FTAR: +0.3pp
● Rationale: Not a rim protector. PnR roll man gets cleaner looks. Defensive liability in
drop.
vs 5-Out Motion
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Spacing offenses don't attack Stretch Big's weakness as aggressively.
vs Motion / Read & React
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Cutting actions find the Stretch Big's help defense lacking.
vs Pace & Space
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Transition defense requires mobility Stretch Big doesn't fully have.
vs Dribble Drive
● Shot Profile: Δ3PA +0.5pp | ΔRim +1.5pp | ΔMid −2pp
● Efficiency: +1.2%
● Turnovers: −0.3pp
● FTAR: +0.5pp
● Rationale: Dribble Drive specifically targets paint defenders. Stretch Big is the weak link.
vs Princeton
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Princeton's post hub tests positioning. Adequate but not dominant.

vs Flex
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Baseline screening actions test Stretch Big's interior presence.
vs Swing
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Ball reversal creates closeout tests. Adequate positioning.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim +2pp | ΔMid −2.5pp
● Efficiency: +1.5%
● Turnovers: −0.3pp
● FTAR: +0.6pp
● Rationale: Post-up mismatch directly targets Stretch Big's rim defense. Worst defensive
matchup.
vs Moreyball
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.3pp
● Rationale: Moreyball attacks the rim where Stretch Big is weakest.
vs Heliocentric
● Shot Profile: Δ3PA +0.5pp | ΔRim +1.5pp | ΔMid −2pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.4pp
● Rationale: Anchor exploits Stretch Big's rim defense in isolation and post-up.
vs Coach K Offense

● Shot Profile: Δ3PA +0.5pp | ΔRim +1.5pp | ΔMid −2pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.5pp
● Rationale: Can't protect the rim against Coach K's downhill attack. Rim pressure exploits
interior defense. Liability.
Defensive Archetype 8: Connector Guard
Identity: Low-usage organizer on offense. On defense: team defense IQ, gap awareness,
passing lane disruption. Not a stopper but rarely a liability.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Smart positioning but limited on-ball containment. Contributes through gap
awareness.
vs 5-Out Motion
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Reads off-ball movement adequately. Team defense intelligence shows.
vs Motion / Read & React
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Processes reads well on defense. Doesn't get lost in continuity.
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
● Rationale: Adequate transition defense. Not elite in space.

vs Dribble Drive
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Help positioning is good. Can get beaten on-ball but team defense holds.
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.2pp
● FTAR: −0.2pp
● Rationale: IQ-driven defense reads Princeton's passing game. Positions well off-ball.
vs Flex
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.2pp
● FTAR: −0.2pp
● Rationale: Navigates screens with positioning rather than athleticism.
vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.2pp
● FTAR: −0.2pp
● Rationale: Closeout discipline on reversals is solid.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −0.5pp | ΔMid +0.5pp
● Efficiency: −0.5%
● Turnovers: +0.1pp
● FTAR: −0.1pp
● Rationale: Limited impact against interior offense. Helps on kick-outs only.
vs Moreyball
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%

● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Gap awareness helps against Moreyball's drive-kick action.
vs Heliocentric
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Help defense IQ matters against anchor-driven offenses. Can't stop the
anchor but positions well.
vs Coach K Offense
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: IQ helps read motion but limited athleticism tested by Coach K's pace.
Defensive Archetype 9: Offensive Wing Scorer
Identity: Shot-creation wing on offense. Defense is managed, not elite. Effort inconsistent. Gets
beaten on-ball by quality creators. Help defense is average.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Gets screened off. Below-average screen navigation creates clean looks for
handlers.
vs 5-Out Motion
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Loses off-ball assignments in motion. Closeouts are late.

vs Motion / Read & React
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Read-based offenses exploit effort inconsistency.
vs Pace & Space
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Transition defense effort is variable.
vs Dribble Drive
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.2%
● Turnovers: −0.4pp
● FTAR: +0.4pp
● Rationale: Gets beaten off the dribble. Rim attempts increase.
vs Princeton
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Backdoor cuts exploit ball-watching.
vs Flex
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Screening actions exploit poor navigation.
vs Swing
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.8%

● Turnovers: −0.2pp
● FTAR: +0.2pp
● Rationale: Slow closeouts on reversals.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: −0.1pp
● FTAR: +0.2pp
● Rationale: Help defense is average. Kick-out recovery is slow.
vs Moreyball
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Moreyball targets the weakest perimeter defender for drives.
vs Heliocentric
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: If assigned to anchor, gets dominated. If off-ball, help defense is insufficient.
vs Coach K Offense
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Effort inconsistency exploited by Coach K's relentless motion. Gets screened
off and loses assignments.
Defensive Archetype 10: Gap / Team Defender Wing
(Carry-forward from old Archetype 7 — Gap Defender, relabeled)
vs Spread Pick-and-Roll

● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.2pp
● FTAR: −0.6pp
vs 5-Out Motion
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.1pp
● FTAR: −0.4pp
vs Motion / Read & React
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.1pp
● FTAR: −0.4pp
vs Pace & Space
● Shot Profile: Δ3PA +1pp | ΔRim −1pp | ΔMid Neutral
● Efficiency: −0.8%
● Turnovers: +0.1pp
● FTAR: −0.3pp
vs Dribble Drive
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.4pp
● FTAR: −0.8pp
vs Princeton
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −1.8%
● Turnovers: +0.3pp
● FTAR: −0.7pp
vs Flex
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −1.8%

● Turnovers: +0.3pp
● FTAR: −0.7pp
vs Swing
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −1.8%
● Turnovers: +0.3pp
● FTAR: −0.7pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −3pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +0.2pp
● FTAR: −1.0pp
vs Moreyball
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −1.6%
● Turnovers: +0.2pp
● FTAR: −0.6pp
vs Heliocentric
● Shot Profile: Δ3PA Neutral | ΔRim −3pp | ΔMid +3pp
● Efficiency: −2.2%
● Turnovers: +0.5pp
● FTAR: −0.9pp
vs Coach K Offense
● Shot Profile: Δ3PA +0.5pp | ΔRim −2pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.6pp
● Rationale: Gap awareness helps against drive-kick action. Positioning limits rim
attempts. Perimeter volume still leaks.
Defensive Archetype 11: Mobile Defensive Big

(Carry-forward from old Archetype 5 — Versatile Switch Defender, relabeled)
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +1.0pp
● FTAR: −0.5pp
vs 5-Out Motion
● Shot Profile: Δ3PA −1pp | ΔRim Neutral | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Motion / Read & React
● Shot Profile: Δ3PA −1pp | ΔRim Neutral | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Pace & Space
● Shot Profile: Δ3PA −1pp | ΔRim Neutral | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Dribble Drive
● Shot Profile: Δ3PA −2pp | ΔRim −1pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.0pp
● FTAR: −0.5pp
vs Princeton
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp

vs Flex
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Swing
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −3.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Moreyball
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.5pp
● FTAR: −0.5pp
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.0pp
● FTAR: −0.5pp
vs Coach K Offense
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −2.0%
● Turnovers: +0.8pp
● FTAR: −0.5pp
● Rationale: Mobility allows switching in Coach K's PnR actions. Can contain without
giving up rim. High-value archetype.

Defensive Archetype 12: Chaos Disruptor Wing
(Carry-forward from old Archetype 11 — Chaos / Disruptor Defender, relabeled)
Note: Chaos defenders trade structure for disruption. Expect volatility ↑, turnovers ↑, foul risk ↑,
efficiency ↓.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +1pp | ΔRim −1pp | ΔMid Neutral
● Efficiency: −1.8%
● Turnovers: +0.8pp
● FTAR: +0.3pp
vs 5-Out Motion
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −1.4%
● Turnovers: +0.7pp
● FTAR: +0.2pp
vs Motion / Read & React
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −1.4%
● Turnovers: +0.7pp
● FTAR: +0.2pp
vs Pace & Space
● Shot Profile: Δ3PA +1pp | ΔRim Neutral | ΔMid −1pp
● Efficiency: −1.2%
● Turnovers: +0.6pp
● FTAR: +0.1pp
vs Dribble Drive
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −2.4%
● Turnovers: +1.1pp
● FTAR: +0.5pp
vs Princeton

● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −2.2%
● Turnovers: +0.9pp
● FTAR: +0.4pp
vs Flex
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −2.2%
● Turnovers: +0.9pp
● FTAR: +0.4pp
vs Swing
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −2.2%
● Turnovers: +0.9pp
● FTAR: +0.4pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −3pp | ΔMid +3pp
● Efficiency: −3.0%
● Turnovers: +0.8pp
● FTAR: +0.6pp
vs Moreyball
● Shot Profile: Δ3PA +1pp | ΔRim −1pp | ΔMid Neutral
● Efficiency: −1.9%
● Turnovers: +0.8pp
● FTAR: +0.3pp
vs Heliocentric
● Shot Profile: Δ3PA Neutral | ΔRim −2pp | ΔMid +2pp
● Efficiency: −2.8%
● Turnovers: +1.3pp
● FTAR: +0.6pp
vs Coach K Offense
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp

● Efficiency: −2.0%
● Turnovers: +1.0pp
● FTAR: +0.4pp
● Rationale: Chaos meets chaos. Disruptor creates turnovers against motion but also fouls
more. High-variance.
Defensive Archetype 13: Point Forward
Identity: Size-based secondary creator on offense. On defense: adequate positioning, uses
length to disrupt passing lanes, average lateral quickness. Not a stopper but not a liability.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.5pp
● FTAR: −0.3pp
● Rationale: Length disrupts passing lanes. Adequate but not elite screen navigation at
forward size.
vs 5-Out Motion
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.2pp
● Rationale: Length helps in passing lanes. Adequate off-ball positioning.
vs Motion / Read & React
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.2pp
● Rationale: Reads continuity actions adequately.
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Transition defense adequate but not elite laterally.

vs Dribble Drive
● Shot Profile: Δ3PA −0.5pp | ΔRim −1.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.6pp
● FTAR: −0.4pp
● Rationale: Length deters drives at the rim. Gap coverage is solid.
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Size helps against Princeton's post hub. Passing lane disruption matters.
vs Flex
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Length disrupts screening actions and contesting around the basket.
vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −1.0%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Adequate closeout on reversals. Length helps contest.
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −1.5pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: −0.4pp
● Rationale: Size helps against post players. Not a true post defender but length disrupts.
vs Moreyball
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%

● Turnovers: +0.4pp
● FTAR: −0.3pp
● Rationale: Length contests both rim and perimeter. Versatile defensive expression.
vs Heliocentric
● Shot Profile: Δ3PA −0.5pp | ΔRim −1.5pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.6pp
● FTAR: −0.4pp
● Rationale: Can match up against the anchor at forward size. Length creates contested
looks.
vs Coach K Offense
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.5pp
● FTAR: −0.3pp
● Rationale: Length disrupts passing lanes in motion. Adequate versatility against multiple
actions.
Defensive Archetype 14: Utility Forward
Identity: Lineup glue. Motor + positioning. Not a stopper but fills defensive gaps. Rarely
targeted, rarely dominant.
vs All 11 Offensive Systems
● Shot Profile: Δ3PA Neutral | ΔRim −0.5pp | ΔMid +0.5pp
● Efficiency: −0.5%
● Turnovers: +0.1pp
● FTAR: −0.1pp
● Rationale: Near-neutral defensive interaction across all systems. Utility Forward is the
baseline — neither a plus nor a minus. Motor and positioning provide marginal benefit.
Applied uniformly.
vs Coach K Offense
● Shot Profile: Δ3PA Neutral | ΔRim −0.5pp | ΔMid +0.5pp

● Efficiency: −0.5%
● Turnovers: +0.1pp
● FTAR: −0.1pp
● Rationale: Near-neutral. Motor helps but doesn't dominate against pace.
Defensive Archetype 15: Roll Man / Vertical Threat
Identity: Rim pressure on offense. On defense: rim protection via verticality, blocks, and paint
presence. Not a perimeter defender. Drop coverage backbone.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +2pp | ΔRim −3pp | ΔMid +1pp
● Efficiency: −2.8%
● Turnovers: +0.1pp
● FTAR: −1.2pp
vs 5-Out Motion
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −2.0%
● Turnovers: +0.1pp
● FTAR: −0.8pp
vs Motion / Read & React
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −2.0%
● Turnovers: +0.1pp
● FTAR: −0.8pp
vs Pace & Space
● Shot Profile: Δ3PA +2pp | ΔRim −2pp | ΔMid Neutral
● Efficiency: −1.8%
● Turnovers: Neutral
● FTAR: −0.6pp
vs Dribble Drive
● Shot Profile: Δ3PA +1pp | ΔRim −5pp | ΔMid +4pp
● Efficiency: −3.5%
● Turnovers: +0.2pp
● FTAR: −1.5pp

vs Princeton
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +0.2pp
● FTAR: −1.3pp
vs Flex
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +0.2pp
● FTAR: −1.3pp
vs Swing
● Shot Profile: Δ3PA +1pp | ΔRim −3pp | ΔMid +2pp
● Efficiency: −3.0%
● Turnovers: +0.2pp
● FTAR: −1.3pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +1pp | ΔRim −6pp | ΔMid +5pp
● Efficiency: −4.0%
● Turnovers: +0.1pp
● FTAR: −2.0pp
vs Moreyball
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −2.6%
● Turnovers: +0.1pp
● FTAR: −1.0pp
vs Heliocentric
● Shot Profile: Δ3PA +1pp | ΔRim −5pp | ΔMid +4pp
● Efficiency: −3.6%
● Turnovers: +0.3pp
● FTAR: −1.6pp

vs Coach K Offense
● Shot Profile: Δ3PA +2pp | ΔRim −4pp | ΔMid +2pp
● Efficiency: −2.5%
● Turnovers: +0.2pp
● FTAR: −1.2pp
● Rationale: Rim protection via verticality limits Coach K's finishing. But can't switch or
chase — 3s leak.
Defensive Archetype 16: Offensive Big (Defense Liability)
Identity: Offense-first interior scorer. On defense: slow feet, poor lateral movement, can't switch,
fouls too much. Clear defensive minus.
vs All 11 Offensive Systems (Uniform Liability)
● Shot Profile: Δ3PA +0.5pp | ΔRim +2pp | ΔMid −2.5pp
● Efficiency: +2.0%
● Turnovers: −0.5pp
● FTAR: +0.8pp
● Rationale: Offensive Big is a defensive liability across all systems. Gets attacked at the
rim regardless of offensive structure. Fouls frequently. Applied uniformly with minor
variations:
○ vs Dribble Drive / Heliocentric: Efficiency penalty increases to +2.5% (rim-attack
offenses target this player)
○ vs Post-Centric: Efficiency penalty increases to +2.5% (direct post mismatch)
○ vs Zone / Princeton: Efficiency penalty decreases to +1.5% (less direct targeting)
vs Coach K Offense
● Shot Profile: Δ3PA +1pp | ΔRim +2pp | ΔMid −3pp
● Efficiency: +2.5%
● Turnovers: −0.5pp
● FTAR: +1.0pp
● Rationale: Coach K's pace and motion destroy slow-footed bigs. Gets targeted
relentlessly. Worst defensive matchup.
Defensive Archetype 17: Situational Shooter (Specialist)
Identity: One-job player on offense (shooting). On defense: below-average. Gets targeted by
quality creators. Poor lateral movement. Adequate effort but limited tools.

vs All 11 Offensive Systems (Uniform Minus)
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.0%
● Turnovers: −0.3pp
● FTAR: +0.3pp
● Rationale: Situational Shooter is a defensive minus across all systems. Gets hunted on
drives. Applied uniformly with minor variations:
○ vs Dribble Drive / Heliocentric: Efficiency penalty increases to +1.5% (direct
targeting of weak perimeter defenders)
○ vs Spread PnR: FTAR increases to +0.5pp (gets screened off and fouls on
recovery)
vs Coach K Offense
● Shot Profile: Δ3PA +0.5pp | ΔRim +1pp | ΔMid −1.5pp
● Efficiency: +1.2%
● Turnovers: −0.3pp
● FTAR: +0.4pp
● Rationale: Gets targeted on drives and screened off in motion. Coach K hunts weakest
perimeter defender.
Defensive Archetype 18: Defensive Specialist
(Non-Scoring)
Identity: Defense-only contributor. Elite on-ball containment + screen navigation + team
positioning. The purest defensive archetype.
(Similar profile to POA Defender Guard but can be applied at any position)
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −1.5pp | ΔRim −1.5pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.2pp
● FTAR: −0.6pp
vs 5-Out Motion
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%

● Turnovers: +0.7pp
● FTAR: −0.4pp
vs Motion / Read & React
● Shot Profile: Δ3PA −1pp | ΔRim −1pp | ΔMid +2pp
● Efficiency: −1.5%
● Turnovers: +0.6pp
● FTAR: −0.3pp
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.8pp
● FTAR: −0.4pp
vs Dribble Drive
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.0pp
● FTAR: −0.7pp
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.5pp
● FTAR: −0.3pp
vs Flex
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.2%
● Turnovers: +0.5pp
● FTAR: −0.3pp
vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.5%
● Turnovers: +0.5pp
● FTAR: −0.3pp

vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −1pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
vs Moreyball
● Shot Profile: Δ3PA −1pp | ΔRim −1.5pp | ΔMid +2.5pp
● Efficiency: −2.0%
● Turnovers: +0.8pp
● FTAR: −0.5pp
vs Heliocentric
● Shot Profile: Δ3PA −1pp | ΔRim −2pp | ΔMid +3pp
● Efficiency: −2.5%
● Turnovers: +1.5pp
● FTAR: −0.7pp
vs Coach K Offense
● Shot Profile: Δ3PA −1.5pp | ΔRim −1.5pp | ΔMid +3pp
● Efficiency: −2.2%
● Turnovers: +1.2pp
● FTAR: −0.5pp
● Rationale: Elite containment and screen navigation. Can slow Coach K's initiators.
High-value archetype.
Defensive Archetype 19: Energy Big
Identity: Bench impact via effort. On defense: motor-driven, crash the glass, block shots
occasionally, disrupt through activity not technique. Fouls more than disciplined bigs.
vs Spread Pick-and-Roll
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: +0.3pp

vs 5-Out Motion
● Shot Profile: Δ3PA +0.5pp | ΔRim −1pp | ΔMid +0.5pp
● Efficiency: −1.0%
● Turnovers: +0.2pp
● FTAR: +0.2pp
vs Motion / Read & React
● Shot Profile: Δ3PA +0.5pp | ΔRim −1pp | ΔMid +0.5pp
● Efficiency: −1.0%
● Turnovers: +0.2pp
● FTAR: +0.2pp
vs Pace & Space
● Shot Profile: Δ3PA +0.5pp | ΔRim −1pp | ΔMid +0.5pp
● Efficiency: −0.8%
● Turnovers: +0.2pp
● FTAR: +0.1pp
vs Dribble Drive
● Shot Profile: Δ3PA +1pp | ΔRim −2pp | ΔMid +1pp
● Efficiency: −1.8%
● Turnovers: +0.4pp
● FTAR: +0.4pp
vs Princeton
● Shot Profile: Δ3PA +0.5pp | ΔRim −1.5pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: +0.3pp
vs Flex
● Shot Profile: Δ3PA +0.5pp | ΔRim −1.5pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: +0.3pp
vs Swing

● Shot Profile: Δ3PA +0.5pp | ΔRim −1.5pp | ΔMid +1pp
● Efficiency: −1.5%
● Turnovers: +0.3pp
● FTAR: +0.3pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA +0.5pp | ΔRim −2pp | ΔMid +1.5pp
● Efficiency: −2.0%
● Turnovers: +0.3pp
● FTAR: +0.5pp
vs Moreyball
● Shot Profile: Δ3PA +1pp | ΔRim −1.5pp | ΔMid +0.5pp
● Efficiency: −1.2%
● Turnovers: +0.2pp
● FTAR: +0.2pp
vs Heliocentric
● Shot Profile: Δ3PA +0.5pp | ΔRim −2pp | ΔMid +1.5pp
● Efficiency: −1.8%
● Turnovers: +0.5pp
● FTAR: +0.4pp
vs Coach K Offense
● Shot Profile: Δ3PA +1pp | ΔRim −1.5pp | ΔMid +0.5pp
● Efficiency: −1.2%
● Turnovers: +0.3pp
● FTAR: +0.3pp
● Rationale: Motor helps with pace. Rim protection via activity. But can't switch onto
perimeter.
Defensive Archetype 20: Situational Ball-Handler (Bench
Guard)
Identity: Secondary handler on offense. On defense: adequate but not elite. Effort is solid. Can
contain some guards but gets beaten by quality creators. Average team defense.

vs Spread Pick-and-Roll
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
vs 5-Out Motion
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Motion / Read & React
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Pace & Space
● Shot Profile: Δ3PA −0.5pp | ΔRim Neutral | ΔMid +0.5pp
● Efficiency: −0.3%
● Turnovers: +0.1pp
● FTAR: −0.1pp
vs Dribble Drive
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.3pp
vs Princeton
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Flex

● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Swing
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.5%
● Turnovers: +0.2pp
● FTAR: −0.1pp
vs Post-Centric / Inside-Out
● Shot Profile: Δ3PA Neutral | ΔRim −0.5pp | ΔMid +0.5pp
● Efficiency: −0.3%
● Turnovers: +0.1pp
● FTAR: Neutral
vs Moreyball
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
vs Heliocentric
● Shot Profile: Δ3PA −0.5pp | ΔRim −1pp | ΔMid +1.5pp
● Efficiency: −1.0%
● Turnovers: +0.4pp
● FTAR: −0.3pp
vs Coach K Offense
● Shot Profile: Δ3PA −0.5pp | ΔRim −0.5pp | ΔMid +1pp
● Efficiency: −0.8%
● Turnovers: +0.3pp
● FTAR: −0.2pp
● Rationale: Adequate on-ball defense. Can contain some of the motion but not elite.
Defensive Archetype 21: Developmental Prospect

Identity: Tools > production. On defense: physical tools present (length, speed, vertical) but
technique, positioning, and IQ are underdeveloped. High variance — makes spectacular plays
and catastrophic mistakes in the same game.
vs All 11 Offensive Systems (Uniform High-Variance)
● Shot Profile: Δ3PA +0.5pp | ΔRim +0.5pp | ΔMid −1pp
● Efficiency: +0.5%
● Turnovers: Neutral (steals offset by blown assignments)
● FTAR: +0.3pp
● Rationale: Developmental Prospect is net-neutral to slightly negative across all systems.
Physical tools create occasional disruption (blocks, steals, length-based contests) but
technique gaps create equal-and-opposite breakdowns. Applied uniformly with minor
variations:
○ vs Dribble Drive / Heliocentric: Efficiency penalty increases to +1.0% (quality
creators exploit technique gaps)
○ vs Zone / Princeton: Efficiency penalty decreases to +0.2% (less direct targeting,
tools matter less in structured defenses)
vs Coach K Offense
● Shot Profile: Δ3PA +1pp | ΔRim +1pp | ΔMid −2pp
● Efficiency: +1.0%
● Turnovers: Neutral
● FTAR: +0.5pp
● Rationale: Physical tools help with pace but technique gaps exposed by motion and
read-react. High variance.
END OF PART 3: DEFENSIVE ARCHETYPE × OFFENSIVE SYSTEM (252 entries complete)

Matchup & Modifier Governance

Matchup & Modifier Governance
(Simulation Engine)
0. Scope
This is the single authoritative document for how identity clashes create probability pressure and
how that pressure is composed, bounded, and delivered to the Possession Engine. It replaces:
● Matchup Interaction Governance
● Modifier Framework
This layer sits between identity inference and possession resolution. It does not simulate
possessions, evaluate talent, or resolve outcomes. It produces a governed modifier bundle
consumed downstream.
Canonical Flow (Locked)
1. System Inference (OSIE/DSIE)
2. Interaction Library Lookup (System × System, Archetype × System)
3. Matchup & Modifier Governance (THIS DOCUMENT)
4. Possession Engine
5. Calibration, Aggregation, and Output Layers
System and Archetype Reference
Offensive Systems (12): Spread Pick-and-Roll, 5-Out Motion, Motion / Read & React, Pace &
Space, Dribble Drive, Princeton, Flex, Swing, Post-Centric / Inside-Out, Moreyball, Heliocentric,
Coach K
Defensive Systems (10): Containment Man, Pack Line, Pressure Man (Denial), Switch
Everything, ICE / No-Middle, Zone (Structured), Matchup Zone / Hybrid, Press / Pressure
Defense, Junk / Special, Coach K
Archetypes (21): Two-Way Wing, 3-and-D Wing, POA Defender Guard, Primary Ball-Handler
(Offense-First), Switchable Defender Wing, Anchor Big, Stretch Big, Connector Guard,
Offensive Wing Scorer, Gap / Team Defender Wing, Mobile Defensive Big, Chaos Disruptor
Wing, Point Forward, Utility Forward, Roll Man / Vertical Threat, Offensive Big (Defense
Liability), Situational Shooter (Specialist), Defensive Specialist (Non-Scoring), Energy Big,
Situational Ball-Handler (Bench Guard), Developmental Prospect

PART 1: MATCHUP INTERACTION
GOVERNANCE
1. Purpose
Matchup Interaction Governance defines how identity clashes create directional probability
pressure. It exists to explain WHY likelihoods shift, not to decide outcomes.
This layer:
● Does not simulate possessions
● Does not evaluate talent
● Does not resolve outcomes
● Produces governed modifier intents consumed downstream
2. Interaction Classes (Locked Order)
Three interaction classes applied in non-negotiable order:
Class 1 — System vs System (Global Environment)
● Offensive system × Defensive system
● Applies to every possession
● Establishes the macro environment: pace tendencies (system layer only), shot-diet
baselines, pressure level, foul environment
● Source: Interaction Library Part 1 (12 × 10 = 120 entries)
● Answers: "What kind of game does this matchup tend to produce?"
Class 2 — Offensive Archetype vs Defensive System (Tactical Interaction)
● Offensive archetype × Defensive system
● Applies per player on offense based on their archetype and the opponent's defensive
system
● Source: Interaction Library Part 2 (21 × 10 = 210 entries)
● Answers: "How does this defensive scheme affect what this offensive player can do?"
Class 3 — Defensive Archetype vs Offensive System (Defensive
Expression)

● Defensive archetype × Offensive system
● Applies per player on defense based on their archetype and the opponent's offensive
system
● Source: Interaction Library Part 3 (21 × 12 = 252 entries)
● Answers: "How does this defender express pressure or vulnerability inside this offensive
structure?"
Application Rule
● Class 1 applies first and establishes the environment
● Class 2 applies second and modifies offensive player outputs
● Class 3 applies third and modifies defensive player outputs
● Later classes may refine earlier pressure but may NOT override or negate them
Redundancy Rule
● If a variable is already explained by a higher-authority class, lower-authority classes do
NOT modify that same variable
● Class 1 > Class 2 > Class 3 in authority
● Example: if System × System already shifts 3PA share by +4pp, an Archetype × System
interaction cannot independently shift 3PA share by another +4pp for the same effect —
only residual (unexplained) pressure applies
3. Allowed Modifier Targets (Locked)
This layer may target ONLY the following variables:
● Shot-type distribution (rim / midrange / three-point attempt probability)
● Shot efficiency (by shot type: rim FG%, midrange FG%, three-point FG%)
● Turnover probability (live-ball, dead-ball)
● Foul-draw probability (shooting foul, non-shooting foul)
● Offensive rebound probability
● Pace (system layer only — Class 1 interactions only)
No other targets are permitted.
4. Governance Rules (Locked)
All modifier intents must be:
● Bounded downstream (bounds enforced in Part 2 of this document)
● Composed (never arbitrarily stacked)
● Directionally consistent (no sign-flips downstream)
● Consistent across systems/archetypes

Conflict Resolution (Locked)
● System × System intents take precedence over Archetype × System intents
● Archetype × Defensive System intents take precedence over Archetype × Offensive
System intents where they overlap
● Redundant intents are ignored (no double-counting)
● When Class 2 and Class 3 both modify the same variable for the same possession, the
higher-magnitude delta applies and the other is suppressed
5. Authority and Non-Authority (Locked)
Authorized to:
● Produce directional modifier intents (pressure direction + target variable)
● Condition modifier intents on identity clashes (system/archetype/coverage)
● Govern precedence and redundancy rules (prevent double-counting)
● Look up delta values from the Interaction Library
Not authorized to:
● Simulate possessions
● Force outcomes
● Change player/team ratings (KR), archetypes, badges, overrides
● Change usage or minutes
● Override possession resolution logic
● Create events
PART 2: MODIFIER FRAMEWORK
6. Purpose
The Modifier Framework governs how contextual pressure and interaction effects are
composed, bounded, and applied inside the Simulation Engine. It is the last place contextual
pressure may be introduced after governance and before possession resolution.
Modifiers exist to:
● Bend likelihoods
● Shape distributions
● Express structural lean

Modifiers do not create events. They do not force outcomes.
7. Canonical Definition (Locked)
A modifier is a bounded adjustment applied to a probability distribution or rate inside the
Possession Engine, prior to possession resolution.
Modifiers:
● Do not create actions
● Do not assign decisions
● Do not change ratings
● Do not override resolution logic
● Only adjust how likely outcomes are
8. Modifier Types (Locked)
Type 1 — Additive (Δ)
Adds/subtracts a fixed delta to a probability.
Use when: shifting distribution mix or nudging rates.
Examples:
● +3pp to three-point attempt probability
● −2pp to turnover probability
Type 2 — Multiplicative (×)
Scales a base probability or efficiency.
Use when: modifying conversion quality or reflecting efficiency punishments/boosts.
Examples:
● Three-point efficiency × 1.08
● Turnover probability × 1.12
9. Valid Modifier Targets (Locked)
A) Shot-Type Distribution (must renormalize to 100%)

● Rim attempt probability
● Midrange attempt probability
● Three-point attempt probability
B) Shot Efficiency (conditional by shot type)
● Rim FG%
● Midrange FG%
● Three-point FG%
C) Turnover Probability
● Live-ball turnover likelihood
● Dead-ball turnover likelihood
D) Foul-Draw Probability
● Shooting foul probability
● Non-shooting foul probability
E) Offensive Rebound Probability
● Probability a missed shot results in an offensive rebound
Clarification (locked): An offensive rebound ends the possession and initiates a new possession
(scramble carryover rules defined in Possession Engine).
F) Pace Modifier (System-Level Only)
● Possessions-per-game multiplier
● Applied only in Class 1 (System × System) interactions
● NOT applied at the archetype level (Classes 2 and 3)
No other targets are permitted.
10. Global Bounds (Hard Guardrails — Locked)
A) Shot-Type Distribution Bounds
● Max shift per layer: ±6 percentage points
● Max total shift across all layers: ±10 percentage points
B) Efficiency Bounds

● Max multiplicative shift per layer: ±12%
● Max total efficiency shift (all layers combined): ±18%
C) Turnover & Foul Bounds
● Max per-layer shift: ±15%
● Max combined shift: ±22%
D) Pace Bounds (System Layer Only)
● Max pace multiplier: ×1.08
● Min pace multiplier: ×0.92
These bounds are non-negotiable and enforced before possession resolution.
11. Composition Rules (How Modifiers Stack — Locked)
Modifiers are applied in fixed order and composed, not overwritten.
Order of Application (Locked)
1. System × System modifiers (Class 1 — from Interaction Library Part 1)
2. Offensive Archetype × Defensive System modifiers (Class 2 — from Interaction
Library Part 2)
3. Defensive Archetype × Offensive System modifiers (Class 3 — from Interaction
Library Part 3)
4. Matchup-approved residuals (only if governance permits; no double-count)
Composition Logic (Locked)
● Additive modifiers are summed → then bounded
● Multiplicative modifiers are multiplied → then bounded
● Additive adjustments occur before multiplicative scaling
12. Conflict & Precedence Rules (Locked)
To prevent double-counting:
● Higher-authority layer overrides lower: if a variable is explained at a higher-authority
layer (Class 1), lower-authority modifier for that variable is suppressed
● Residual application only: the last layer applies only what hasn't already been
accounted for

● No direction flips: later layers may attenuate earlier effects but may NOT reverse sign
(if Class 1 says 3PA goes up, Class 3 cannot make 3PA go down for the same
interaction)
● Maximum one coverage bonus per variable per possession: prevents stacking
multiple archetype interactions on the same shot-type shift
13. State Awareness (Hard Constraint — Locked)
Modifiers may be state-conditional but never state-creating.
Allowed:
● "In Scramble state, rim efficiency × 1.05"
● "In Advantage state, turnover probability −8%"
Forbidden:
● Forcing a state change
● Skipping state transitions
State creation belongs exclusively to the Possession Engine.
PART 3: DETERMINISM & DATA SOURCE
DISCIPLINE
14. Determinism (Locked)
The entire Matchup & Modifier Governance layer is fully deterministic.
Given the same:
● System identities (from OSIE/DSIE)
● Archetype labels (from Archetype Library)
● Interaction Library delta values
The same governed modifier-intent bundle is produced every time.
No learning, tuning, or adaptation occurs here. The Interaction Library provides the data. This
document provides the rules for how that data is consumed, composed, and bounded.

15. Data Source Discipline (Locked)
Modifiers:
● MUST reference delta values from the Interaction Library (12 offense × 10 defense × 21
archetypes)
● May reference inferred labels (system, archetype, matchup tags) from upstream
● May reference film-derived attributes (contest level, help presence) if provided upstream
● May NOT compute those attributes
● May NOT invent delta values not in the Interaction Library
All inputs are assumed to be supplied upstream.
16. Outputs (Locked)
The Modifier Framework outputs a single modifier_bundle consumed only by:
● Possession Engine
● Calibration & Guardrails
The modifier_bundle contains:
● All composed, bounded delta values organized by target variable
● The composition trace (which Interaction Library entries were used, in what order, with
what bounded values)
● The final bounded values ready for possession resolution
Modifiers may NOT be surfaced as standalone insights or interpreted as coaching advice.
UI / GOVERNANCE NOTE
Governance and composition logic only. All values are produced by Nexus. No possession
resolution, player evaluation, or coaching advice lives here. This doc defines how pressure is
structured and bounded — not how outcomes are decided. All delta values come from the
Interaction Library. This doc defines the RULES for consuming those deltas.

Possession Engine

Possession Engine (Simulation Engine)
Purpose
The Possession Engine defines how a single basketball possession is simulated and resolved.
It is the atomic execution engine of the Simulation Engine. All higher-order simulations (single
games, series, seasons, tournaments) are composed exclusively of repeated executions of this
engine plus aggregation logic handled elsewhere.
Canonical Role Within Simulation Engine (Locked)
The Possession Engine is the only component authorized to resolve possession outcomes.
Canonical Flow (Locked)
1. System Inference (OSIE/DSIE) — identifies the 12 offensive and 10 defensive systems
2. Interaction Library Lookup — retrieves delta values for system × system + archetype ×
system matchups
3. Matchup & Modifier Governance — composes, bounds, and delivers the modifier bundle
4. Possession Engine (THIS DOCUMENT) — consumes the modifier bundle and resolves
one possession
5. Calibration, Aggregation, and Output Layers — aggregates resolved possessions into
game/season/tournament outputs
Lock rule: No layer below this resolves basketball events. No layer above this produces
outcomes.
Core Execution Principles (Locked)
The Possession Engine enforces the following non-negotiable rules:
Possession is the atomic unit. All outcomes resolve possession-by-possession. No minutes,
plays, or lineups are simulated directly.
State-based, not play-based. The engine simulates advantage states, not named plays.
Basketball behavior emerges from probabilistic state transitions.
Probabilistic resolution. No outcome is deterministic. All results are drawn from governed
probability distributions.

Defense shifts probabilities only. Defensive systems and personnel do not force outcomes.
They alter likelihoods only (shot type, efficiency, turnovers, fouls, rebounds). All defensive
effects arrive via the modifier bundle from the Matchup & Modifier Governance layer.
No rating mutation. Player KRs, archetypes, badges, overrides, and valuation are read-only.
The engine never re-rates players.
These principles are binding.
Authority and Non-Authority (Locked)
Authorized to:
● Resolve a possession into exactly one terminal outcome
● Transition through governed possession states
● Apply the upstream modifier bundle (from Matchup & Modifier Governance)
● Attribute events to players probabilistically (shooter/assist/TO/foul/rebound)
Not authorized to:
● Evaluate player quality or change player outputs
● Modify Player Intelligence or Team Intelligence outputs
● Aggregate results or produce box scores/projections
● Optimize decisions or strategies
● Look up interaction deltas (that's done upstream in Matchup & Modifier Governance)
Resolution only — nothing else.
State Governance (Locked)
The Possession Engine operates through a fixed possession lifecycle:
● Initiation
● Advantage
● Resolution
State transitions are:
● Probabilistic
● Bounded
● Conditioned by the upstream modifier bundle

Lock rules:
● No state may be skipped
● No terminal outcome may be bypassed
Possession Lifecycle
1) Initiation State
Determines who initiates advantage on the possession.
Initiator selection is probabilistic. Probabilities are derived from:
● Rotation/usage translation layer (if available)
● Offensive system identity (from OSIE — one of 12 locked systems)
● Player archetype tendencies (from Archetype Library — 21 locked archetypes)
Definition lock: Initiation ≠ shot attempt. The initiator is the player who first creates advantage,
not necessarily the shooter.
2) Advantage State
Defines the tactical state of the possession after initiation.
Allowed states (Locked):
● Neutral
● Advantage
● Scramble
State transitions are influenced by:
● Offensive system
● Defensive system
● Initiator archetype
● Upstream modifier bundle (from Matchup & Modifier Governance)
The advantage state conditions all downstream probabilities.
3) Resolution State
The possession resolves into exactly one terminal outcome.

Terminal Outcome Set (Locked)
A possession must end as one of the following:
● Turnover
● Shot Attempt
○ Rim
○ Midrange
○ Three
● Foul
○ Shooting foul → free throws
○ Non-shooting foul → continuation handling
● Offensive Rebound → New Possession
Offensive Rebound Rule (Locked)
An offensive rebound ends the current possession. A new possession begins immediately.
Context Carryover Rules (Locked)
When a possession is spawned from an offensive rebound:
● Advantage state initializes as Scramble
● Shot clock baseline is reduced (implementation-defined constant)
● Defensive alignment modifiers persist
● Transition probability is suppressed
This preserves realism while maintaining clean possession accounting.
Shot Resolution Model (Governed)
Shot resolution is contextual, not binary.
Shot Context Inputs (consumed here; defined upstream)
● Shot type (rim / midrange / three)
● Shooter identity
● Defender identity
● Contest percentage
● Shot quality score
● Help defender presence
● Time-to-shot
● Advantage state

● Film/PlayVision-derived features (if available at V2/V3)
All probability modifiers for shot type distribution and efficiency arrive via the modifier bundle.
The Possession Engine does not compute these modifiers — it consumes them.
Resolution Outputs
● Make / miss
● Foul drawn (if applicable)
● Shot location classification
● Contest-adjusted efficiency outcome
Defensive Influence (Locked)
Defense influences possession outcomes by shifting probabilities in:
● Shot type distribution
● Shot efficiency
● Turnover likelihood
● Foul likelihood
● Offensive rebound probability
Defense never:
● Forces a specific outcome
● Changes player ratings
● Overrides offensive intent
All defensive effects are applied as probability modifiers only, delivered via the modifier bundle
from the Matchup & Modifier Governance layer. The modifier bundle is the ONLY input channel
for defensive effects.
Event Attribution (Locked)
For every resolved possession, the engine assigns:
● Shooter (if shot)
● Assister (probabilistic, if applicable)
● Turnover committer (if turnover)
● Fouled player (if foul)

● Rebounder (if rebound)
Attribution respects:
● Player archetypes (from the 21 locked archetypes)
● Role tendencies
● Advantage state context
● Usage/participation weights (from Team KR pipeline)
Engine Outputs (Raw Events Only)
The Possession Engine outputs raw possession events only:
● possession_id
● initiator_id
● advantage_state
● terminal_outcome_type
● shooter_id (if applicable)
● shot_type + location
● contest_level
● result (make/miss)
● foul_drawn (yes/no) + foul type (if applicable)
● turnover_type + turnover_committer_id (if applicable)
● rebounder_id (if applicable)
● points_scored
No aggregation, KRs, summaries, spreads, totals, or projections occur here.
Explicit Non-Responsibilities (Locked)
The Possession Engine does NOT:
● Aggregate statistics
● Produce box scores
● Calculate spreads/totals
● Evaluate player value
● Modify Player Intelligence outputs
● Modify Team Intelligence outputs
● Look up interaction deltas (done upstream)
● Compute modifier values (done upstream)

Those functions are handled by higher layers (Simulation Engine aggregation) or upstream
layers (Interaction Library + Matchup & Modifier Governance).
Data Tier Behavior
The Possession Engine operates at whatever data tier is available. Higher tiers provide richer
inputs to the shot resolution model:
● V1 (Stats-Only): Shot context inputs are estimated from box score proxies. Contest
percentage, help presence, and time-to-shot are modeled, not measured.
● V1+ (Licensed Granular): Play-type data improves shot context accuracy. Actual usage
and shot profiles available.
● V2 (PlayVision — 1 Season): Full shot context from camera data. Contest percentage,
help presence, spatial data measured directly.
● V3 (PlayVision Deep — Multi-Season): Multi-season context enables pattern
recognition and historical shot quality modeling.
The Possession Engine itself does not change based on data tier — it always runs the same
state machine. The QUALITY of inputs improves with higher tiers, which improves resolution
accuracy.
UI / GOVERNANCE NOTE
Atomic resolution engine only. All values consumed from upstream (modifier bundle from
Matchup & Modifier Governance). No evaluation, weighting, or normalization logic lives here.
This doc defines how a single possession is resolved — not how interactions are computed,
how modifiers are bounded, or how results are aggregated.

Simulation Engine

Simulation Engine — Master Contract
Purpose
The Simulation Engine is the master orchestrator of the KaNeXT Basketball Intelligence
System's prediction layer. It consumes player truth, team truth, system identity, and interaction
data to produce game projections, season forecasts, tournament simulations, and live halftime
decision support.
The Simulation Engine does not evaluate players or teams. It reads governed truth from
upstream and produces downstream projections only.
Canonical Flow (Locked)
1. System Inference (OSIE/DSIE) — identifies the 12 offensive and 10 defensive systems
2. Interaction Library — provides delta values for all 582 identity-clash matchups
3. Matchup & Modifier Governance — composes, bounds, and delivers the modifier
bundle
4. Possession Engine — resolves individual possessions using the modifier bundle
5. Simulation Engine (THIS DOCUMENT) — orchestrates the Possession Engine across
thousands of possessions, aggregates results, and produces structured outputs
6. Simulation Confidence Gate — stamps confidence on the output
A) Required Inputs (Simulation Cannot Run Without
These)
Simulation MUST PULL, per team:
From Team Intelligence (Team KR Pipeline)
● Team identity record (team + season)
● Team KR object: team_off_kr, team_def_kr, team_overall_kr
● Rotation participation % vector (players ≥5% only; stored as %)
● Per-rotation player outputs:
○ player_final_system_off_kr
○ player_final_system_def_kr
○ player_archetype (from 21 locked archetypes)

○ player_confidence_pct (if available)
● Team KR Diagnostics (Coverage Map, Missing Demands, Fragility Flags)
From System Identity (OSIE/DSIE)
● Offensive system identity (one of 12 locked systems)
● Defensive system identity (one of 10 locked systems)
● If provisional/uncertain, include:
○ System mixture weights
○ Inference confidence metadata
● Pace Profile (PACE100 + band)
● Defensive Court Depth
From Interaction Library (582 entries)
● System × System entries (Part 1: 120 entries)
● Offensive Archetype × Defensive System entries (Part 2: 210 entries)
● Defensive Archetype × Offensive System entries (Part 3: 252 entries)
From Matchup & Modifier Governance
● Allowed targets (pace, shot diet, efficiency, TO, foul, OREB)
● Bounds / caps / composition order
● Deterministic resolution rules
● Composed modifier bundle
From Simulation Confidence Gate
● sim_confidence_pct mapping table + adjusters
● Data tier determination (V1 / V1+ / V2 / V3)
From Calibration Layer (If Enabled)
● Calibration coefficients by competitive level
● Home/away/neutral adjustment
● Conference-strength adjustment
● Historical accuracy feedback (if available)
B) Simulation Run Types — LOCKED (7)
1) Single Game Simulation

Returns: expected result + drivers for Team A vs Team B.
Inputs: Both teams' full input packs. Environment (home/away/neutral, competitive level).
Process: Run the Possession Engine N thousand times for this matchup. Aggregate results into
expected score, margin band, five-factor projection, and driver summary.
2) Series / Multi-Game Set Simulation
Returns: aggregate expectation across N games + sensitivity/volatility.
Inputs: Same as Single Game, repeated for N matchups.
Process: Run Single Game simulation for each game in the set. Aggregate win probability
distribution, identify swing games, compute series outcome probabilities.
3) Season Simulation (Schedule)
Returns: expected record band + swing games + stretch risks.
Inputs: Full schedule of opponents. Each opponent requires their own input pack (or best
available estimate).
Process: Run Single Game simulation for each scheduled game. Aggregate into expected W-L
band, identify high-leverage games, flag fatigue/schedule stretches, compute conference
standings projections.
4) Tournament Simulation (Bracket)
Returns: advancement expectation by round + matchup vulnerabilities.
Inputs: Bracket structure + all teams' input packs.
Process: Simulate each round. Winners advance. Repeat through championship. Run N
thousand full brackets. Compute advancement probability by round, identify "avoid list" (worst
matchups), and flag upset vulnerability.
5) Box Score Projection Mode (Team + Player Statlines)
Returns: projected team totals + player statlines (minutes, shot diet, counting stats).
Inputs: Same as Single Game.
Process: Run the Possession Engine with full event attribution. Aggregate individual player
events into projected box scores: points, FGA by type, FGM by type, FTA/FTM, rebounds,
assists, turnovers, steals, blocks, fouls, minutes. Team totals computed from player aggregation.

This mode answers: "If these two teams play, what does each player's box score look like?" It
surfaces mismatches at the player level — e.g., "your stretch big projects 9 three-point attempts
against their drop coverage because the interaction library shifts his 3PA +4pp."
6) Line Translation Mode (Spread/Total Mirror)
Returns: implied win%, spread/total equivalents + sensitivity ("what moves the line").
Inputs: Same as Single Game.
Process: Convert expected margin and score into spread and total equivalents. Compute "what
moves the line" sensitivity: which single variable change (injury, system change, foul trouble)
produces the largest spread/total shift.
7) Halftime Live Simulation
Returns: win probability from current position + win probability under each proposed adjustment.
Inputs: Current game state (score, time remaining, period, foul trouble, lineup availability,
timeout count) + both teams' full input packs + first-half tag log (if available).
Process:
1. Snapshot current game state as the starting condition
2. Run the Possession Engine for remaining possessions only (not the full game)
3. Compute: Baseline win probability — if no adjustments are made, what's the projected
outcome?
4. For each proposed adjustment (from Game Ops Halftime Sandbox):
○ Apply the adjustment as a modifier override (e.g., "switch to Zone defense"
changes defensive system identity for remaining possessions)
○ Re-run remaining possessions with the new modifier bundle
○ Compute: Adjusted win probability — how does this change the projected
outcome?
5. Output: Baseline win% + up to 5 adjusted win% scenarios + key variable identification
("the single factor most likely to swing the outcome is [X]")
Constraints:
● Halftime Live Simulation is directional, not precise. It surfaces which adjustments have
the highest expected impact, not guaranteed outcomes.
● Confidence on halftime projections is governed by the Simulation Confidence Gate with
a halftime adjuster (reduced confidence due to smaller remaining sample and in-game
variance).
● This mode is consumed by Game Ops Section J (Simulation Projections) in the Halftime
Staff Packet.

C) Universal Output Rules (Applies to Every Run Type)
Every simulation output MUST include:
C1) Version + Confidence
● data_tier: V1 (stats-only) / V1+ (licensed granular) / V2 (PlayVision 1 season) / V3
(PlayVision Deep multi-season)
● sim_confidence_pct: [0–100] (from Simulation Confidence Gate)
● Confidence does not change math; it qualifies reliability.
C2) Determinism
Given the same inputs:
● The same output object is produced
● The same interaction trace is produced
C3) No Truth Mutation
Simulation:
● Does NOT modify Player KR, Team KR, archetypes, badges, overrides, or system
identities
● Reads governed truth and produces downstream projections only
C4) Interaction Trace Requirement (No Black Box)
Simulation MUST output an "applied interaction trace" that records:
● Which System × System interaction entries were used (from Interaction Library Part 1)
● Which Offensive Archetype × Defensive System entries were used (from Interaction
Library Part 2)
● Which Defensive Archetype × Offensive System entries were used (from Interaction
Library Part 3)
● Which modifier targets were affected (and by how much, within bounds)
● Composition order (from Matchup & Modifier Governance)
The trace is the audit trail. It explains WHY the simulation produced the result it did. No black
boxes.

D) Standard Simulation Output Object (Field Contract)
Every run type returns this top-level object:
D1) Header
● run_type (one of the 7)
● teams (Team A id, Team B id if applicable)
● environment (level/ruleset, season, neutral/home/away if known)
● data_tier (V1 / V1+ / V2 / V3)
● sim_confidence_pct
D2) Inputs Snapshot (Read-Only Echo)
● Team KRs (off/def/overall) for both teams
● Rotation participation % (players ≥5%)
● OSIE/DSIE identities (locked/provisional + confidence)
● System mix shares (if applicable)
● Any constraints applied (injury flags, foul trouble for Halftime Live)
D3) Matchup Interaction Trace (Required)
● system_system_applied[] — entries from Interaction Library Part 1
● off_archetype_vs_def_system_applied[] — entries from Interaction Library Part 2
● def_archetype_vs_off_system_applied[] — entries from Interaction Library Part 3
Each item must include:
● source (Interaction Library Part + entry key)
● targets_modified (pace / shot diet / efficiency / TO / foul / OREB)
● raw_delta (the value from the Interaction Library)
● bounded_delta (the value after Modifier Framework bounds)
● composition_step_order (1, 2, or 3)
D4) Outputs (Run-Type Specific)
● Single Game: result + margin band + projected pace + five-factor projection
● Series: aggregated result distribution + sensitivity summary
● Season: expected W-L band + swing games list + conference standings projection
● Tournament: advancement by round + "avoid list" + upset vulnerability flags
● Box Score Mode: team totals + player statlines (minutes + usage + shot diet + counting
stats)
● Line Mirror: implied win% + spread/total equivalents + "what moves line"
● Halftime Live: baseline win% + adjusted win% per scenario + key swing variable

D5) Driver Summary (Required)
● Top 3 outcome drivers (must reference trace objects)
● Top 3 vulnerabilities/risks (turnovers, foul/bonus, rebounding, shot diet collapse)
● "If we change X" sensitivity bullets (optional for standard runs, required for Halftime Live)
E) Calibration Layer
Calibration adjusts simulation outputs to align with observed real-world results. It does NOT
change the interaction deltas, modifier bounds, or possession resolution logic. It adjusts the
translation from simulated possessions to projected outcomes.
Calibration Inputs
● Competitive level: Different levels play different basketball. D1 High-Major games have
different scoring distributions than NAIA games. Calibration coefficients adjust for
level-specific baselines.
● Home/away/neutral: Home teams win approximately 60-65% of games in college
basketball. A home-court adjustment is applied as a modifier on top of the simulation
result.
● Conference strength: Schedule strength affects how simulation results translate to
expected records. A team simulated to win 75% of possessions against a weak schedule
is different from the same win rate against a strong schedule.
Calibration Rules (Locked)
● Calibration is applied AFTER the Possession Engine resolves and BEFORE the output
is finalized
● Calibration coefficients are set per competitive level and updated seasonally (not
mid-season)
● Calibration NEVER modifies Player KR, Team KR, system identity, interaction deltas, or
modifier bounds
● Calibration adjustments are logged in the output trace
● If no calibration data exists for a level (new program, new level), the simulation runs
uncalibrated and the confidence is reduced accordingly
Calibration Feedback Loop
● After each game, the simulation's pregame projection is compared to the actual result
● Over time, systematic biases are identified (e.g., "simulation consistently overestimates
rim efficiency at the D2 level")
● Calibration coefficients adjust to correct for identified biases

● Adjustments are bounded: no single calibration coefficient can shift a projection by more
than ±5 points
● Calibration is automatic, deterministic, and auditable
F) Data Tier Behavior
The Simulation Engine operates at whatever data tier is available for each team. When two
teams have different data tiers, the simulation uses the lower tier for the matchup interaction
(you can only be as precise as your least-informed team).
Tier What Simulation Gets Impact
V1 — Stats-Only Box score stats, estimated usage, Baseline simulation. Estimated
roster minutes. Production-based shot context. Confidence lowest
Player KRs. System identity from V1 (55-70%).
proxy signals.
V1+ — Licensed V1 + actual play-type data, actual Better shot diet modeling. More
Granular usage, shot profiles. System identity accurate interaction application.
from full classification triggers. Confidence improved (72-85%).
V2 — PlayVision Full camera data. Actual usage, High-fidelity simulation. Real
(1 Season) matchup tracking, spatial data. System shot context, real matchup data.
identity from full structural signals. Confidence high (83-95%).
V3 — PlayVision Multi-season camera data + film Highest-fidelity simulation.
Deep archive. Trend analysis, pattern Multi-year trend context.
(Multi-Season) recognition, historical comparison. Confidence highest (90-97%).
Mixed-Tier Matchups
When Team A is V3 and Team B is V1:
● System × System interaction uses both teams' identified systems (V3 confidence for A,
V1 confidence for B)
● Archetype interactions for Team A's offense use full V3 data
● Archetype interactions for Team B's offense use V1 proxy data
● sim_confidence_pct reflects the LOWER tier (V1 confidence range applies)
● Trace explicitly notes the tier mismatch

G) System Mix Handling
When OSIE or DSIE returns a System Mix (dominance criteria not met):
● Simulation runs multiple times — once per system in the mix
● Results are weighted by mix shares
● Example: Team A offense is 60% Spread PnR / 40% Motion. Simulation runs with
Spread PnR interactions (weighted 0.60) and Motion interactions (weighted 0.40). Final
output is the weighted blend.
● Interaction trace shows both runs and their weights
Example Output (Mock) — Single Game Simulation (V1)
Run Context
● Team A: Lincoln (Home)
● Team B: Opponent State (Away)
● Systems (from OSIE/DSIE):
○ Team A Off: Moreyball
○ Team A Def: Pressure Man
○ Team B Off: Pace & Space
○ Team B Def: Containment Man
● data_tier: V1 (stats-only)
● sim_confidence_pct: 68%
Interaction Trace (excerpt, simplified)
1. system_system_applied
○ source: Interaction Library Part 1, Moreyball vs Containment Man
○ targets_modified: { shot_diet_3pa: +, rim_attempts: +, ft_rate: + }
○ bounded_delta: { 3PA_share: +0.03, rim_share: +0.02, FT_rate: +0.02 }
2. system_system_applied
○ source: Interaction Library Part 1, Pace & Space vs Pressure Man
○ targets_modified: { turnovers: +, pace: + }
○ bounded_delta: { TO_rate: +0.02, pace: +1.5 possessions }
3. off_archetype_vs_def_system_applied
○ source: Interaction Library Part 2, Stretch Big vs Containment Man
○ targets_modified: { corner_3_volume: + }

○ bounded_delta: { 3PA: +0.03, 3P%: +0.015 }
Output (Single Game)
● projected_possessions: 71
● projected_score:
○ Team A: 78
○ Team B: 74
● expected_margin_band: Team A +1 to +7
● five factors (projected):
○ eFG: A slight edge
○ TO rate: B worse (pressure)
○ OREB: neutral
○ FT rate: A edge (Moreyball pressure points)
○ transition: B attempts higher pace but punished by TOs
Driver Summary
Top drivers:
1. Pressure Man → +TO pressure on Pace & Space ballhandlers (trace #2)
2. Moreyball vs Containment → A increases rim/FT volume (trace #1)
3. A's Stretch Big archetype creates corner-3 quality (trace #3)
Risks:
● If A's primary creator enters foul trouble → FT edge collapses
● If B breaks pressure early → pace swings against A
Example Output (Mock) — Halftime Live Simulation
Run Context
● Game: Lincoln vs Opponent State (same as above)
● Halftime score: Lincoln 32, Opponent State 35
● Lincoln's primary creator has 3 fouls
● data_tier: V1
● sim_confidence_pct: 62% (halftime adjuster applied)
Outputs
● Baseline win probability (no adjustments): 41%

● Scenario A — Switch to Zone defense: 46% (+5%)
○ Why: Reduces foul exposure for primary creator, suppresses Opponent State's
rim attempts
○ Risk: Gives up volume 3s to their shooters
● Scenario B — Reduce primary creator minutes by 25%: 38% (−3%)
○ Why: Protects from 4th foul but removes best offensive player
○ Risk: Offense loses its engine
● Scenario C — Maintain current approach, attack bonus aggressively: 44% (+3%)
○ Why: Opponent State in bonus, free throw generation increases
○ Risk: Primary creator still at foul risk
● Key swing variable: "Primary creator's foul status. If he picks up foul #4, win probability
drops to 31%. If he plays foul-free the rest of the way, win probability rises to 52%."
H) Governance (Non-Negotiable)
● Simulation is produced by Nexus. No manual override of computed outputs.
● All outputs are deterministic: same inputs → same outputs.
● Simulation does NOT modify any upstream truth (Player KR, Team KR, archetypes,
system identity).
● The interaction trace is REQUIRED on every output. No black boxes.
● Calibration adjustments are bounded and auditable.
● Halftime Live projections are directional aids, not prescriptions. Coach decides.
● Data tier determines confidence, not math. The simulation always runs the same logic —
the QUALITY of inputs varies by tier.
UI / GOVERNANCE NOTE
Master orchestration contract only. All interaction deltas come from the Interaction Library (582
entries). All composition rules come from Matchup & Modifier Governance. All possession
resolution comes from the Possession Engine. All confidence comes from the Simulation
Confidence Gate. This doc defines WHAT the simulation produces, not HOW each component
works internally.

Simulation Confidence Gate

Simulation Confidence Gate
Purpose
The Simulation Confidence Gate stamps a reliability score on every simulation output. It
communicates how much the user should trust the projection based on the quality,
completeness, and stability of the data feeding the simulation.
Confidence does NOT change simulation math. It does not alter projected scores, win
probabilities, or box score projections. It qualifies reliability only — telling the coach "we're 90%
confident in this projection" vs "we're 58% confident, take this with a grain of salt."
Where It Lives in the Pipeline
Confidence is computed at the END of every simulation run, AFTER all outputs are produced. It
is the final stamp before the output is delivered.
Canonical flow:
1. System Inference (OSIE/DSIE)
2. Interaction Library
3. Matchup & Modifier Governance
4. Possession Engine
5. Simulation Engine (produces outputs)
6. Simulation Confidence Gate (THIS DOCUMENT) — stamps confidence on outputs
Data Tier Reference
Tier Definition What Simulation Gets
V1 — Stats-Only Public box scores, roster minutes, Production-based Player KRs,
estimated usage. No play-type estimated shot context, system
data. identity from proxy signals.
Baseline.
V1+ — Stats + V1 + third-party play-type data. Actual play-type frequencies, full
Licensed Actual usage, shot profiles, classification triggers for
Granular possession-level efficiency. Not OSIE/DSIE, better shot diet
owned. modeling. Bridge tier.

V2 — PlayVision KaNeXT-owned camera data. Real shot context, real matchup
(1 Season) Single season processed. Full data, full structural signals for
play-type, usage, matchup tracking, system inference. High fidelity.
spatial data.
V3 — PlayVision Multiple seasons of PlayVision data Multi-year trend context, system
Deep + film archive. Trend analysis, evolution tracking, highest
(Multi-Season) pattern recognition, historical confidence on all inputs.
comparison.
Simulation Confidence Table (Locked Ranges)
Step 1: Choose the row that best matches the data available for the
simulation
Data Available (Simulation Inputs) sim_confidence_pct
(Default Range)
V1 stats-only: box scores + roster minutes/participation + 55–70%
Player KR (production-based) + Team KR
V1 stats-only + stable system identity (coach-continuity or 60–75%
OSIE/DSIE locked with high stability)
V1 stats-only + in-season OSIE/DSIE confirmation (identity 65–80%
inferred from actual games, not assumed from prior year)
V1+ licensed granular: play-type data + shot profile + efficiency 72–85%
+ OSIE/DSIE from full classification triggers
V1+ licensed granular + multi-game trend context (same 78–90%
opponent/system observed across multiple games)
V2 PlayVision (1 season): owned camera data processed + full 83–93%
tag log + lineup stint accuracy + OSIE/DSIE locked
V2 PlayVision + high completeness: accurate stints + stable 88–95%
identity + deep matchup samples + stable rotation
V3 PlayVision Deep (multi-season): multi-year processed data 90–97%
+ film archive + trend analysis + stable identity
Step 2: Apply adjusters within the chosen range

Rule (locked): Adjusters may only move the value WITHIN the row's range. Adjusters may NOT
push the final value below the row minimum or above the row maximum.
Downshifts (bounded):
Condition Adjustment
OSIE/DSIE uncertainty (identity not locked / system mix required / mixed −5 to −12
systems) pts
Rotation instability / injuries / unknown minutes distribution −5 to −10
pts
Lineup/stint accuracy weak (who played with who unclear) −5 to −10
pts
Small sample opponent context (few quality games / limited matchup −3 to −8 pts
evidence)
Mixed data tiers between the two teams (e.g., Team A is V3, Team B is V1) −3 to −8 pts
Preseason simulation (no current-season games played yet, using prior-year −5 to −10
identity) pts
Mid-season coaching change (system identity in flux) −5 to −10
pts
High roster turnover (>70% new players, system fit uncertain) −3 to −8 pts
Upshifts (bounded):
Condition Adjustment
High completeness + stable identity + strong sample size Move toward top of range
Both teams at same data tier (no mismatch penalty) +2 to +3 pts
Conference opponents with multiple prior meetings this +2 to +5 pts
season
Locked systems + stable top-7 rotation for both teams +3 to +5 pts
No upshift may exceed the row maximum.

Run-Type Confidence Modifiers
Different simulation run types have different inherent confidence levels. A single game
projection is more reliable than a full tournament bracket simulation because each additional
layer of simulation compounds uncertainty.
Step 3: Apply run-type modifier after Steps 1 and 2
Run Type Confidence Rationale
Modifier
Single Game No modifier Direct matchup, most reliable projection type
Simulation (baseline)
Box Score −2 to −5 pts Player-level attribution adds variance on top of game-level
Projection projection
Mode
Line No modifier Same math as Single Game, just translated to spread/total
Translation
Mode
Series / −3 to −5 pts Multi-game compounding of single-game uncertainty
Multi-Game Set
Season −5 to −10 pts Many opponents, some with limited data. Schedule effects
Simulation compound.
Tournament −5 to −12 pts Bracket variance + elimination format + multiple unknown
Simulation future opponents
Halftime Live −5 to −10 pts Reduced remaining sample (only second half). In-game
Simulation variance high. First-half data may not predict second-half
adjustments. Foul trouble and fatigue introduce additional
uncertainty.
Step 4: Compute final sim_confidence_pct
sim_confidence_pct = Row baseline (Step 1) + Adjusters (Step 2) +
Run-type modifier (Step 3)
Final value is bounded: minimum 0, maximum 100. In practice, no simulation should output
above 97% (even V3 + perfect conditions has irreducible basketball variance) or below 40%
(below that, the simulation adds little value over a coin flip).
Practical confidence bands for coach-facing display:

Confidence Display Label Coach Guidance
Range
90–97% Very High Strong projection. Trust the directionality and the
Confidence magnitude.
80–89% High Confidence Reliable projection. Trust the directionality. Magnitude
has some variance.
70–79% Moderate Directionally useful. Specific numbers may shift.
Confidence Consider the driver summary more than the exact
score.
60–69% Low-Moderate Use for general direction only. High uncertainty on
Confidence specifics. Weight the "risks" section heavily.
50–59% Low Confidence Limited data. Projection is better than nothing but
should not drive major decisions alone.
Below 50% Very Low Insufficient data for reliable projection. Treat as
Confidence illustrative only.
Mixed-Tier Matchup Confidence
When two teams have different data tiers, the simulation confidence reflects the LOWER tier
with a mismatch penalty.
Team A Tier Team B Tier Base Confidence Mismatch Penalty
Range
V3 V3 90–97% None
V3 V2 85–93% −2 to −3 pts
V3 V1+ 75–88% −3 to −5 pts
V3 V1 60–78% −5 to −8 pts
V2 V2 83–95% None
V2 V1+ 75–88% −2 to −3 pts
V2 V1 60–78% −3 to −5 pts
V1+ V1+ 72–90% None

V1+ V1 60–78% −2 to −3 pts
V1 V1 55–75% None
The simulation is only as confident as its least-informed team.
Halftime Live Confidence — Special Rules
Halftime Live Simulation has additional confidence considerations beyond the standard table:
Halftime Condition Additional Adjustment
First-half tag log available (V2/V3 +3 to +5 pts (real-time data improves second-half
in-game data) modeling)
First-half tag log NOT available −3 to −5 pts
(V1 box score only at half)
Game is within 5 points at No adjustment (competitive game, simulation most useful)
halftime
Game is a blowout (>20 point −5 pts (blowout dynamics are poorly modeled — garbage
margin) time, bench lineups, effort changes)
Key player in foul trouble −2 to −3 pts (foul trouble is binary — the player either
fouls out or doesn't, hard to probabilistically model)
Opponent made halftime Cannot be modeled — note in trace as uncertainty source
adjustment not yet observed
Preseason Confidence — Special Rules
Preseason simulations (before any current-season games) have unique confidence constraints:
Preseason Condition Confidence
Range
Both teams: same coach + low turnover + prior year V2/V3 55–70%
data
Both teams: same coach + high turnover 45–60%

One or both teams: new coach 40–55%
One or both teams: no usable prior data 35–50%
Preseason simulations are inherently less reliable because system identity is PROVISIONAL
(not OBSERVED) and roster composition may not reflect actual performance.
Confidence Over Time (Season Arc)
Simulation confidence naturally increases as the season progresses:
Season Phase Typical Confidence Trajectory
Preseason (0 games) 35–70% depending on data availability and coaching continuity
Early season (games 1–5) 50–75% — OSIE/DSIE begins observing, still PROVISIONAL or
early OBSERVED
Mid-season (games 6–15) 65–85% — System identity locked or approaching lock.
Rotation stabilizing.
Late season (games 75–92% — Full sample. Stable identity. Strong interaction data.
16–25)
Conference tournament / 80–97% — Maximum data. FROZEN system identity. Full
Postseason confidence on locked teams.
This trajectory assumes the team's data tier remains constant. Upgrading from V1 to V2
(PlayVision installation mid-season) creates a confidence jump independent of game count.
Output
● sim_confidence_pct ∈ [0, 100]
● Computed at end of every simulation run
● Included in every simulation output object (Section D1 of Simulation Engine)
● Does NOT change simulation math — qualifies reliability only
● The confidence value is displayed alongside every projection the coach sees

Governance
● Confidence values are produced by Nexus. No manual override.
● Confidence ranges are locked. Adding or modifying ranges requires documentation,
versioning, and approval.
● Adjusters are bounded — they cannot push confidence below the row minimum or above
the row maximum (before run-type modifiers).
● Run-type modifiers are applied AFTER adjusters.
● The Simulation Confidence Gate does not interact with the Interaction Library, Modifier
Framework, or Possession Engine. It only reads the data tier, system identity status, and
run type to produce a confidence stamp.
● The product flywheel: V1 is what everyone starts with. V2 is what you get when you join
KaNeXT. V3 is what you get when you stay. Simulation confidence compounds over time
— the longer a program is on the platform, the more the coach can trust the projections.
UI / GOVERNANCE NOTE
Reference table and confidence logic only. All values are produced by Nexus. No simulation
math, interaction deltas, or possession resolution logic lives here. This doc defines HOW MUCH
to trust the simulation output — not how the output is produced.

Physical Mismatch Modifiers

Physical Mismatch Modifiers v1.0
Classification
Simulation Engine — Modifier Framework Extension Authority Level: Class 4 — Physical
Mismatch Residuals Position in Canonical Flow: Applied AFTER Classes 1-3, BEFORE
Possession Resolution Status: LOCKED
Purpose
The existing Modifier Framework (Classes 1-3) governs identity-clash pressure: system vs
system, archetype vs system. These classes explain HOW teams play and how schemes
interact.
Physical Mismatch Modifiers explain what happens when the BODIES don't match — when one
team's physical profile creates structural advantages that identity-clash modifiers alone cannot
capture.
The KR pipeline scores individual Height and Length as TKR traits. These traits feed into each
player's overall KR, which feeds into Team KR, which feeds into simulation inputs. This pathway
captures HEIGHT AS TALENT but does NOT capture HEIGHT AS INTERACTION. A 7'2"
center's KR reflects his tools. It does not reflect what happens when that 7'2" center faces a 6'6"
forward — the DIFFERENTIAL effect on shot contest, rebound probability, interior scoring
geometry, and shot alteration.
Physical Mismatch Modifiers close this gap.
Governing Principles (Locked)
1. Modifier-only. These modifiers bend likelihoods. They do not create events, assign
decisions, change KRs, or override possession resolution.
2. Differential-driven. Every modifier activates based on the GAP between two players or
two teams — never on absolute height alone. A 7'0" center facing a 7'0" center
generates ZERO modifier. A 7'0" center facing a 6'4" forward generates significant
modifier.

3. Bounded. All modifiers obey the global bounds from Matchup & Modifier Governance.
Physical Mismatch Modifiers cannot exceed the global caps even when combined with
Classes 1-3.
4. Non-redundant with Classes 1-3. If a Class 1-3 modifier already explains a variable
shift (e.g., system vs system already shifts rim FG%), Physical Mismatch Modifiers apply
only the RESIDUAL not already captured. No double-counting.
5. Deterministic. Same inputs produce same outputs. No learning, tuning, or adaptation.
6. State-conditional, never state-creating. May modify probabilities in specific game
states (e.g., fourth quarter fatigue) but never force state transitions.
Modifier A: Height Differential Modifier (Position-Level)
What It Measures
The height gap between the offensive player and his primary defender at the point of shot
attempt, rebound contest, or post-up initiation.
Activation Threshold
Activates when the height differential at any matchup position exceeds 3 inches (7.6 cm).
Below 3 inches, the KR pipeline's Height trait adequately captures the difference.
Input
● attacker_height_inches (from roster data)
● defender_height_inches (from roster data)
● height_gap = attacker_height - defender_height
For defensive possessions (opponent attacking):
● attacker_height_inches = opponent player height
● defender_height_inches = your player height
● height_gap = defender_height - attacker_height (positive = your defender
is taller)
Modifier Values (Per Inch Beyond 3-Inch Threshold)
When YOUR player is TALLER (defensive advantage):
Target Variable Modifier Type Value Per Inch Max Cumulative

Opponent Interior FG% Multiplicative × 0.97 (−3% per × 0.85 (−15%)
inch)
Opponent Shot Contest Level Additive +0.5 tiers per 2 +2 tiers
inches
Block Probability Additive +1.2pp per inch +6pp
Defensive Rebound Probability Additive +2.5pp per inch +10pp
Opponent Rim Attempt Additive −1.5pp per inch −8pp
Probability
When YOUR player is SHORTER (defensive disadvantage):
Target Variable Modifier Value Per Inch Max Cumulative
Type
Own Interior FG% vs that Multiplicative × 0.98 (−2% per × 0.90 (−10%)
defender inch)
Opponent Post-Up Efficiency Multiplicative × 1.03 (+3% per × 1.15 (+15%)
inch)
Offensive Rebound Probability Additive −2.0pp per inch −8pp
When YOUR player is TALLER (offensive advantage):
Target Variable Modifier Value Per Inch Max
Type Cumulative
Own Interior FG% Multiplicative × 1.025 (+2.5% per × 1.12 (+12%)
inch)
Own Post-Up Efficiency Multiplicative × 1.03 (+3% per inch) × 1.15 (+15%)
Own Offensive Rebound Additive +2.0pp per inch +8pp
Probability
Own Foul-Draw Rate (interior) Additive +0.8pp per inch +4pp
Computation Example
Rosa (7'2" / 86 inches) defending Moratinos (6'8" / 80 inches):
● Gap = 6 inches. Threshold = 3. Active inches = 3.

● Opponent Interior FG%: × 0.97^3 = × 0.912 (−8.8%)
● Block Probability: +1.2 × 3 = +3.6pp
● Defensive Rebound Probability: +2.5 × 3 = +7.5pp
● Opponent Rim Attempt Probability: −1.5 × 3 = −4.5pp
Rosa's 6-inch height advantage over their tallest starter translates to an 8.8% reduction in their
interior FG%, a 3.6pp increase in block probability, and a 7.5pp shift in defensive rebound
probability. Per possession. Compounding over 85 possessions.
Modifier B: Team Height Aggregate Modifier (Team-Level)
What It Measures
The aggregate frontcourt height advantage across all active rotation bigs, not just the starting
matchup. This captures the TEAM-LEVEL effect of having multiple tall players — the
psychological and geometric reality that there is nowhere safe to go inside.
Activation Threshold
Activates when the average height of the top 3 rotation bigs on Team A exceeds the average
height of the top 3 rotation bigs on Team B by 2.0 inches or more.
Input
● team_a_top3_big_avg_height = average height of Team A's three tallest rotation
players
● team_b_top3_big_avg_height = average height of Team B's three tallest rotation
players
● frontcourt_height_gap = team_a_top3 - team_b_top3
Modifier Values (Applied at Team Level)
When YOUR team has the frontcourt height advantage:
Target Variable Modifier Value Max Rationale
Type Per Inch Cumulative
Opponent Interior Additive −2.0pp −10pp Opponent self-selects OUT of
Shot Attempt Rate per inch the paint because every drive
meets a taller defender

Opponent Additive +1.0pp +5pp Forced into longer, less
Midrange Attempt per inch efficient shots
Rate
Opponent 3PT Additive +1.0pp +5pp Forced to the perimeter
Attempt Rate per inch
Own Offensive Additive +1.5pp +8pp More boards = more second
Rebound Rate per inch chances
(team)
Opponent Fast Multiplicative × 0.97 × 0.85 Taller team controls defensive
Break Points per inch glass, limiting opponent
Probability transition
Own Paint Points Additive +2.0pp +10pp Taller team scores inside more
Rate per inch easily
Computation Example
Your FMU top 3 bigs: Rosa (7'2"), Kacem (7'1"), Roberts (7'0") → avg = 85.3 inches Current
FMU top 3 bigs: Asceric (6'10"), Moratinos (6'8"), Dues (6'9") → avg = 81.0 inches Frontcourt
height gap = 4.3 inches. Threshold = 2.0. Active inches = 2.3.
● Opponent Interior Attempt Rate: −2.0 × 2.3 = −4.6pp
● Opponent Midrange Rate: +1.0 × 2.3 = +2.3pp
● Opponent 3PT Rate: +1.0 × 2.3 = +2.3pp
● Own OREB Rate: +1.5 × 2.3 = +3.5pp
● Own Paint Points Rate: +2.0 × 2.3 = +4.6pp
The opponent's entire shot diet shifts AWAY from the rim (where they're inefficient against your
length) toward mid-range and 3-point shots (where NAIA-level shooters are even MORE
inefficient). Their offense degrades from both ends — they're taking worse shots AND making
them at lower rates.
Interaction with Modifier A
Modifier B operates at the team level. Modifier A operates at the position level. They target
overlapping but not identical variables:
● Modifier A adjusts interior FG% for the SPECIFIC player matchup
● Modifier B adjusts shot ATTEMPT DISTRIBUTION for the entire offense
These are complementary, not redundant. Modifier A says "when you DO shoot inside, you miss
more." Modifier B says "you try to shoot inside LESS OFTEN because the paint is terrifying."

Both apply. The composition rule: Modifier A applies to efficiency. Modifier B applies to
distribution. No double-counting on the same target variable.
Modifier C: Wave Rotation Fatigue Modifier
(Time-Dependent)
What It Measures
The cumulative fatigue differential when one team rotates significantly more bigs than the other.
Over 40 minutes, a team playing 4 fresh bigs in 10-minute shifts faces an opponent whose 1-2
bigs play 25-35 minutes. The fatigue gap widens as the game progresses.
Activation Threshold
Activates when one team's big rotation depth exceeds the other's by 2 or more players (e.g.,
Team A rotates 4 bigs, Team B rotates 2).
Input
● team_a_big_rotation_count = number of bigs getting 8+ minutes
● team_b_big_rotation_count = number of bigs getting 8+ minutes
● rotation_depth_gap = team_a_count - team_b_count
● game_period = 1st half / 3rd quarter / 4th quarter
Modifier Values (Time-Dependent, Applied to the Team with FEWER Bigs)
First Half: No modifier. Fatigue hasn't accumulated.
Third Quarter (minutes 21-30):
Target Variable Modifier Value Per Rotation Gap Max
Type Player
Fatigued team Interior FG% Multiplicative × 0.98 (−2%) per gap player ×
0.94
Fatigued team Defensive Rebound Additive −1.5pp per gap player −5pp
Rate
Fatigued team Turnover Rate Additive +0.5pp per gap player +2pp

Fresh team Interior FG% Multiplicative × 1.01 (+1%) per gap player ×
1.03
Fourth Quarter (minutes 31-40):
Target Variable Modifier Value Per Rotation Gap Max
Type Player
Fatigued team Interior FG% Multiplicative × 0.96 (−4%) per gap player ×
0.88
Fatigued team Defensive Rebound Additive −3.0pp per gap player −10p
Rate p
Fatigued team Turnover Rate Additive +1.5pp per gap player +5pp
Fatigued team Overall FG% Multiplicative × 0.98 (−2%) per gap player ×
0.94
Fatigued team 3PT% Multiplicative × 0.97 (−3%) per gap player ×
0.91
Fresh team Interior FG% Multiplicative × 1.02 (+2%) per gap player ×
1.06
Fresh team 3PT% Multiplicative × 1.01 (+1%) per gap player ×
1.03
Computation Example
Your FMU rotates 5 bigs (Rosa, Kacem, Pouncil, MacDonald, Roberts/Ellis): avg 12-15 min
each. Current FMU rotates 2 bigs (Moratinos 6'8", Dues 6'9"): avg 25-30 min each. Rotation gap
= 3 players.
Fourth Quarter modifiers applied to current FMU:
● Interior FG%: × 0.96^3 = × 0.885 (−11.5%)
● Defensive Rebound Rate: −3.0 × 3 = −9.0pp
● Turnover Rate: +1.5 × 3 = +4.5pp
● Overall FG%: × 0.98^3 = × 0.941 (−5.9%)
● 3PT%: × 0.97^3 = × 0.912 (−8.8%)
In the fourth quarter, current FMU's already overmatched bigs are now ALSO exhausted. Their
interior FG% drops an additional 11.5%. Their overall shooting drops 5.9%. They turn the ball
over 4.5pp more. Meanwhile your fresh bigs are still operating at baseline or better.

This explains why the simulated margins are LARGER than raw KR gaps suggest — the
advantage compounds over time.
Interaction with Modifiers A and B
● Modifier A (position-level height gap) applies all game at constant rate
● Modifier B (team height aggregate) applies all game at constant rate
● Modifier C (fatigue) AMPLIFIES both in the second half
These are additive on different axes:
● A and B create the BASE disadvantage (height makes them worse)
● C creates the TIME-DEPENDENT amplification (fatigue makes the height disadvantage
worse)
Composition: A and B apply first (constant). C applies on top in Q3/Q4 as a multiplicative
amplifier to the already-modified values. The exhausted 6'6" forward who was already −8.8% on
interior FG% from Modifier A is now ALSO −11.5% from fatigue = total interior FG% degradation
of ~20%.
Modifier D: Altered Shot Rate Modifier (Derived)
What It Measures
For every blocked shot, multiple additional shots are ALTERED — not blocked, but affected by
the presence of a rim protector. The shooter adjusts trajectory, rushes the release, pulls up
short, or avoids the paint entirely. These altered shots don't appear in box scores but
significantly affect shooting efficiency.
Current system counts blocks as events. It does not model the shadow effect of rim protection
— the shots that WEREN'T taken or were degraded because the rim protector existed.
Input
● defender_block_rate = projected BPG from Player Intelligence
● defender_height = height in inches
● baseline_alter_multiplier = 2.5 (empirical: for every block, approximately 2.5
additional shots are altered)
● height_bonus_multiplier = +0.3 per inch above 6'10" (taller rim protectors alter
more shots because their presence is visible earlier in the drive)
Modifier Computation

None
alter_rate = block_rate × (baseline_alter_multiplier +
height_bonus_per_inch)
For Rosa (3.5 BPG, 7'2"):
● Height above 6'10" = 4 inches
● Height bonus = 4 × 0.3 = 1.2
● Total multiplier = 2.5 + 1.2 = 3.7
● Altered shots per game = 3.5 × 3.7 = 12.95 → ~13 altered shots per game
Modifier Values (Applied to Opponent)
Target Variable Modifier Value Max
Type
Opponent Interior FG% (beyond Multiplicative × (1 − (alter_rate × × 0.88
block effect) 0.008)) (−12%)
Opponent Rim Attempt Willingness Additive −(alter_rate × 0.25)pp −5pp
For Rosa's 13 altered shots:
● Interior FG% modifier: × (1 − (13 × 0.008)) = × 0.896 (−10.4%)
● Rim Attempt Willingness: −(13 × 0.25) = −3.25pp
This means Rosa's PRESENCE (not just his blocks) reduces opponent interior FG% by an
additional 10.4% beyond what the block events themselves capture. And opponents attempt
3.25 fewer rim attempts per game because they SEE Rosa in the paint and choose not to drive.
Interaction with Modifiers A, B, C
● Modifier A captures the height DIFFERENTIAL effect on the specific matchup
● Modifier B captures the team-level shot distribution shift
● Modifier C captures the fatigue amplification over time
● Modifier D captures the SHADOW effect of rim protection beyond blocks
These are four different mechanisms:
1. A = "You miss more because he's taller than you"
2. B = "Your whole team shoots worse inside because THEY'RE ALL taller"
3. C = "It gets worse as you get tired and they stay fresh"
4. D = "You don't even TRY to go inside because the rim protector's shadow scares you"

Composition: D applies to shot WILLINGNESS (reducing rim attempts) and to shot QUALITY
(reducing FG% on the shots they do take). A applies to the specific matchup FG%. B applies to
team-level distribution. C amplifies all three over time.
The full chain for a fourth-quarter possession where a 6'6" forward drives against Rosa:
1. Modifier B already shifted his team's shot diet AWAY from the rim (−4.6pp rim attempts)
2. Modifier D further reduces his WILLINGNESS to drive (−3.25pp additional)
3. If he DOES drive: Modifier A reduces his FG% by −8.8%
4. Modifier D further reduces his FG% by −10.4% (altered shot quality)
5. Modifier C amplifies the defensive rebound probability by −9.0pp (his team doesn't get
the board if he misses)
6. Total interior FG% degradation: base × 0.912 × 0.896 × 0.885 = × 0.723 (−27.7%)
If baseline interior FG% was 55%, the modified FG% is 39.8% — and that's BEFORE the block
itself.
Integration with Existing Modifier Framework
Position in Composition Order (Updated)
1. System × System modifiers (Class 1 — from Interaction Library Part 1)
2. Offensive Archetype × Defensive System modifiers (Class 2 — from Interaction Library
Part 2)
3. Defensive Archetype × Offensive System modifiers (Class 3 — from Interaction Library
Part 3)
4. Physical Mismatch Modifiers (Class 4 — from this document)
○ A: Height Differential (position-level)
○ B: Team Height Aggregate (team-level)
○ C: Wave Rotation Fatigue (time-dependent)
○ D: Altered Shot Rate (derived from rim protection)
5. Matchup-approved residuals (only if governance permits; no double-count)
Precedence Rules
● Classes 1-3 retain full authority. Physical Mismatch Modifiers may NOT override or
negate Class 1-3 effects.
● Physical Mismatch Modifiers apply RESIDUAL pressure only — the physical effects not
already captured by identity-clash modifiers.
● If a Class 1-3 modifier already explains a variable (e.g., Coach K Defense already shifts
rim FG% via Class 3), Modifier A applies only the portion of the height differential effect
NOT already captured.

● No direction flips: if Classes 1-3 say interior FG% goes down, Modifiers A-D cannot
make it go up.
Global Bounds Compliance
All Physical Mismatch Modifiers obey existing global bounds:
● Shot-Type Distribution: Max total shift ±10pp (across ALL classes including Class 4)
● Efficiency: Max total shift ±18% (across ALL classes including Class 4)
● Turnover & Foul: Max combined shift ±22%
If Classes 1-3 have already consumed 12% of the 18% efficiency cap, Class 4 modifiers may
only contribute up to the remaining 6%.
Output Format
Physical Mismatch Modifiers produce entries in the same modifier_bundle format as Classes
1-3:
None
{
"class": 4,
"subclass": "A|B|C|D",
"target_variable": "[valid target]",
"modifier_type": "additive|multiplicative",
"value": [bounded value],
"source": "Physical_Mismatch_Modifiers_v1",
"activation_inputs": {
"height_gap": [inches],
"rotation_gap": [players],
"game_period": "[half|Q3|Q4]",
"block_rate": [BPG]
}
}
Interaction Trace Requirement
Per the Simulation Engine Master Contract, every simulation must output an applied interaction
trace. Physical Mismatch Modifiers add to this trace:
● Which sub-modifiers (A, B, C, D) activated

● What height/rotation gaps triggered activation
● What bounded values were applied
● How much of the global cap was consumed by Class 4
Data Requirements
Modifier Required Data Source Availability
A Player heights (both teams) Roster data Always
available
B Top 3 big heights (both Roster data Always
teams) available
C Rotation depth (bigs getting Rotation participation % from Team Always
8+ min) KR available
D Block rate per player Player Intelligence (DKR rim Always
protection traits) available
All inputs are available at V1 (stats-only) data tier. Physical Mismatch Modifiers do not require
play-by-play, tracking data, or film.
Confidence Note
Physical Mismatch Modifiers operate at reduced confidence compared to Classes 1-3
because:
● The multiplier values (e.g., −3% interior FG% per inch) are derived from empirical
estimation, not from a verified Interaction Library
● The altered shot rate baseline multiplier (2.5) is an approximation pending PlayVision
validation
● The fatigue curve (no effect in 1H, escalating in Q3/Q4) is a model assumption
When PlayVision (V2/V3) data becomes available, these multipliers should be calibrated against
actual tracking data: measured contest rates at different height differentials, actual shot
alteration rates near rim protectors, and fourth-quarter efficiency degradation curves.
Until calibration: apply Physical Mismatch Modifiers at 70% of stated values as a conservative
estimate. The direction is correct. The magnitude requires validation.`;


export const FILE_05 = `Scouting Confidence Gates

Scouting Confidence Gates — Scout + Postgame (Locked
Tables)
Purpose
Confidence% communicates evidence completeness + reliability for scouting (pregame) and
postgame analysis. Computed at the end of the respective packet. Does not change any
scouting content or KR values — it qualifies reliability only.
Data Tier Reference
Tier Definition
V1 — Stats-Only Public box scores, roster minutes, season stats. No play-type
data.
V1+ — Stats + Licensed V1 + third-party play-type data. Actual usage, shot profiles,
Granular possession-level efficiency. Not owned.
V2 — PlayVision (1 KaNeXT-owned camera data. Full play-type, usage, matchup
Season) tracking, spatial data.
V3 — PlayVision Deep Multiple seasons of PlayVision data + film archive. Highest
(Multi-Season) fidelity.
Scout Confidence Gate (Pregame)
Data available (opponent) Scout Confidence % (default
range)
V1 stats-only: official/team season stats + roster 55–70%
V1 stats-only + multi-year (returning core / stable identity) 60–75%
V1+ licensed granular: play-type data + shot profile (1 year) 70–85%
+ stats
V1+ licensed granular + multi-year 78–90%
V2 PlayVision (1 season): processed games ≥5 + stats 80–92%
V2 PlayVision high coverage: ≥10 games processed + 85–94%
stable rotation

V3 PlayVision Deep: multi-season processed + film archive 88–96%
+ stable identity
Scout Confidence Adjusters (apply within the chosen range)
● Sample size: fewer than 5 current-season games → use bottom of range
● Recency: last 3 games show clear shift (injuries / lineup change / scheme shift) →
downshift 5–10 pts
● Roster volatility: rotation not stable / unknown minutes → downshift 5–10 pts
● System ambiguity: OSIE/DSIE still provisional or unlocked → downshift 5–10 pts
● Multi-game continuity: prior game against same opponent exists in system → upshift 3–5
pts
● High stability: locked systems + stable top-7 rotation → upshift toward top of range
Output
● scout_confidence_pct ∈ [0,100]
● Computed at end of pregame scout packet
● Does not change scouting content — qualifies reliability only
Postgame Confidence Gate
Data available (postgame) Postgame Confidence %
(default range)
V1 stats-only: final box + team totals + basic splits (no film, no 55–70%
play tags)
V1 stats-only + manual staff tags (timeouts / key actions 60–75%
logged)
V1+ licensed granular: play types + shot profile + efficiencies 70–85%
(no owned film)
V1+ licensed granular + multi-game trend context (same 75–88%
opponent/system)
V2 PlayVision: owned film processed + full tag log + clip list 82–92%
V2 PlayVision + high completeness: accurate stints/lineups + 88–96%
≥10 teaching clips tied to tags

V3 PlayVision Deep: multi-season context + full film archive + 90–97%
trend analysis
Postgame Confidence Adjusters (apply within the chosen range)
● Tag completeness low (missing large chunks of actions/coverages) → downshift 5–10
pts
● Lineup/stint accuracy weak → downshift 5–10 pts
● Opponent identity ambiguity (OSIE/DSIE not locked) → downshift 5–10 pts
● Stable rotation + clear identity + high film coverage → upshift toward top of range
● Multi-game trend context available (prior games vs same opponent) → upshift 3–5 pts
Output
● postgame_confidence_pct ∈ [0,100]
● Computed at end of postgame staff packet
● Does not change postgame content — qualifies reliability only
UI / GOVERNANCE NOTE
Reference tables only. Confidence values are produced by Nexus. No evaluation, weighting, or
normalization logic lives here.
Now the big one. Game Ops:

Game Ops

Game Ops — Full Scouting Intelligence Flow
Global Rules (apply to all 4 phases)
Determinism Same inputs → same packet sections + ordering + outputs.
No Truth Mutation Game Ops may reference Player/Team Truth outputs but may not
recompute or change them.
Time Anchors
● Pregame: generated T-24h to T-0h (refreshable).
● In-Game: live updates each possession/dead ball, with anti-spam rules.
● Halftime: generated once at halftime whistle (refreshable once if tag corrections).
● Postgame: generated once after final (refreshable if new film tags land).
Universal Output Fields Every packet/stream MUST include:
● game_id, teams, date_time, venue, home_away_neutral
● data_tier (V1 / V1+ / V2 / V3)
● confidence_pct for that phase (scout_confidence_pct / postgame_confidence_pct)
● trace_notes (what inputs were missing / assumed)
Data Tier Behavior Game Ops operates at whatever data tier is available. Higher tiers unlock
richer outputs:
● V1: box score + roster. Manual tagging required in-game. Proxy-based analysis.
● V1+: play-type data adds shot profiles, action frequencies, efficiency breakdowns.
● V2: PlayVision camera data adds real-time tagging automation, matchup tracking, spatial
data. In-game experience is dramatically enhanced.
● V3: Multi-season PlayVision adds trend context, opponent pattern recognition, historical
comparison.
Multi-Game Opponent Continuity If a prior game against the same opponent exists in the
system (same season or prior season), Game Ops MUST reference it:
● Pregame: pull prior postgame audit, note what worked/failed, flag if opponent has
changed since last meeting (roster moves, system drift, coaching change)
● Halftime: compare current game patterns to prior game patterns
● Postgame: compare outcomes across both games, identify what adjusted and what
didn't

1. Pregame Scout Packet
1.1 Inputs — MUST PULL (read-only)
Opponent Player Truth (per rotation player ≥5%)
● Final System Off KR / Final System Def KR
● Archetype (from Archetype Library)
● Badges (from Badge Spec output)
● Overrides applied (from Overrides output)
● System risks (from System Risks)
● Player confidence_pct
Opponent Team Truth
● Rotation table + participation% (≥5%)
● Team Off KR / Team Def KR / Overall Team KR
● Offensive_Fit% / Defensive_Fit% / Overall_Fit%
● Coverage Map (demands → covered by whom → weight)
● Missing Demands (uncovered / under-covered demands with priority + basketball
consequence)
● Fragility Flags (single-point failures, concentration, depth fragility, role overload)
System Identity
● OSIE + DSIE outputs (status + primary system + mix if applicable + confidence)
● Pace Profile (PACE100 + band)
● Defensive Court Depth
Granular (V1+/V2/V3 — if available)
● Play-type outputs (PPP by play type, shot type, frequency)
● Film-derived tags: actions, coverages, triggers, ATO/EOH, press/zone usage
● Shot maps by player + by team
● Matchup assignment data (V2/V3 only)
Multi-Game Continuity (if applicable)
● Prior postgame packet against same opponent
● What worked / what failed from prior meeting
● Opponent changes since last meeting (roster, system, coaching)
1.2 Outputs — MUST OUTPUT (ordered, fixed)
A) Opponent Offensive Identity

MUST OUTPUT:
● off_system_name (from OSIE) + system confidence %
● pace_band (slow/avg/fast) + evidence notes
● primary_initiators[] (players + roles: PnR handler, iso creator, post hub, DHO hub)
● shot_diet_intent vs shot_diet_reality: rim share / mid share / 3 share / FT rate (or best
available proxy)
● pressure_points (where offense breaks): TO stress points, weak-hand, non-shooters,
late-clock tendencies
● system_vulnerabilities (pulled from opponent's Missing Demands + Fragility Flags):
"Their offense has no stretch big — pack the paint. Their PnR operator is a single-point
failure — if contained, no secondary creator exists."
B) Shot Profile (Team + Player)
MUST OUTPUT:
● Team shot map summary (zones + priorities)
● Player shot cards (top 6–8 rotation players):
○ preferred zones
○ volume indicators (attempt rate bands)
○ efficiency indicators (if granular; otherwise "unknown/box-score proxy")
○ "green / yellow / red" shot permissions by your defense (rule-based)
C) Actions + Triggers (If–Then Counter Library)
MUST OUTPUT:
● core_actions[] (ranked top 8–12): PnR types, DHO, stagger, floppy, horns, chin, zoom,
Spain, Iverson, etc. (whatever is tagged)
● For each action:
○ trigger (what starts it)
○ primary option
○ counter
○ late-clock bailout
○ our_counter (1–2 concise rules)
○ risk (what we give up)
D) Opponent Defensive Identity
MUST OUTPUT:
● def_system_name (from DSIE) + system confidence %
● pressure_level (none/light/medium/heavy)
● coverages used (PnR coverage, post coverage, closeout rules)
● help rules (nail/low man tags, stunt vs commit)

● rebounding behavior (gang vs leak, crash rules if known)
● foul profile tendencies (aggressive hands vs contain)
● defensive_vulnerabilities (pulled from opponent's defensive Missing Demands + Fragility
Flags): "Their defense has no switchable wing — attack screens involving their 4/5. Their
rim protector is their only interior presence — foul trouble collapses their scheme."
E) Required Situations Package
MUST OUTPUT (only if opponent uses these):
● ATO offense menu (what they like)
● ATO defense tells (switch calls, denial, top-lock, etc.)
● EOH (end of half) tendencies
● Late-game tendencies (foul discipline, tempo, matchup hunting)
● Press O/D (if used): triggers, alignments, pressure points
● Zone O/D (if used): alignments, shot gives, rebounding gaps
F) Leverage Plan (Attack / Deny / Stress / Fragility)
MUST OUTPUT:
● Top 5 "Attack" points (fed by opponent defensive vulnerabilities + Missing Demands)
● Top 5 "Deny" points (fed by opponent offensive strengths + primary initiators)
● Top 5 "Stress" points (turnovers, foul pressure, shot diet disruption)
● Fragility list: "If X sits / foul trouble → their Y collapses" (pulled directly from opponent
Fragility Flags)
● Hard rules ("no-middle," "no-corners," etc.) if coach sets them
● Prior game reference (if applicable): "Last meeting we attacked X — they adjusted by Y.
This time consider Z."
G) Rotation Board (≥5% participation)
MUST OUTPUT:
● rotation table sorted by participation%:
○ player, position group, off KR, def KR, archetype, key threat, key rule
● minutes bands if available; else participation% only
● substitution patterns if tagged
● coverage modifier status (gap-filler vs redundant, from Team KR diagnostics)
H) Player Cards (one per rotation player)
Each card MUST OUTPUT:
● threat type (shooter/slasher/post/connector/stopper/etc.)
● directionality ("left-heavy," "reject," "spin back," "no right")

● shot map + "take away" priority
● coverage response ("vs drop: pull," "vs switch: iso," etc.)
● TO stress points (handle risk, passing windows)
● foul profile (draws fouls / commits fouls)
● guard rules (screen navigation notes, closeout rules, gap vs touch)
I) scout_confidence_pct
MUST OUTPUT:
● scout_confidence_pct (from Scout Confidence Gate)
● data_tier for this opponent
● "why not higher" (missing granular, missing tags, small sample, unstable rotation, etc.)
2. In-Game Live Ops
2.1 Roles (Owners)
● HC: glance + decide (consumes, does not tag)
● AC1: opponent actions/coverages tagging + alerts owner
● AC2: our offense pulse tagging + alerts owner
● AC3 (optional): fouls/bonus/subs/matchups + alerts owner
2.2 Data Tier In-Game Behavior
V1 (Stats-Only): All tagging is manual. AC1/AC2/AC3 tag everything by hand. Panels show
only what staff enters + box score feed.
V1+ (Licensed Granular): Manual tagging supplemented by external play-type feed if available
in near-real-time. Most tagging still manual.
V2 (PlayVision — 1 Season): PlayVision cameras are in the gym. Automatic play-type
recognition, shot tracking, and action detection run in real-time. AC1/AC2 shift from primary
taggers to reviewers/correctors of automated tags. Panels auto-populate with live play-type
data. Matchup tracking is live. Shot maps update in real-time.
V3 (PlayVision Deep): Same as V2 plus historical pattern matching. System can surface "they
ran this same action 8 times in the last meeting and scored 1.2 PPP — watch for it." Trend
overlays on live data.
2.3 Tagging Language (minimal, structured)
MUST maintain a shared tag dictionary:

● OPP_ACTION: (Horns, Spain, Zoom, DHO, Stagger, etc.)
● OPP_COVERAGE: (drop/ice/switch/hedge/trap/zone/etc.)
● OUR_ACTION: (our set name)
● RESULT: (rim/mid/3/ft/to/foul/oreb)
● DAMAGE: (0/1/2/3) quick severity band
● REPEAT: (count in last X possessions)
At V2/V3, most OPP_ACTION and RESULT tags are auto-generated by PlayVision. Staff
corrects misclassifications rather than creating tags from scratch.
2.4 Panels (locked, always same order)
Panel 1 — Situation Strip (HC primary)
MUST show:
● score, time, possession, period
● team fouls + bonus status
● run tracker (last 5 possessions)
● timeout count
● "next critical situation" flags (2-for-1, final 1:00, etc.)
Panel 2 — Live Lineups + Matchups
MUST show:
● current 5 + positions + matchup assignments
● on-court Off/Def KR aggregate
● mismatch flags (size, foul risk, "target" defender)
● V2/V3 enhancement: live matchup efficiency (PPP allowed by each defender on current
assignment)
Panel 3 — Foul / Risk Monitor (AC3 owner)
MUST show:
● foul counts + who is at risk
● bonus pressure + "attack/avoid" recommendations
● tech/injury notes if applicable
● Fragility Flag alerts: "Their [player] at 3 fouls — if he sits, their [demand] is uncovered"
Panel 4 — Shot + Turnover Pulse (AC2 owner)
MUST show:
● our last 8 shots (type + quality band if available)
● our TOs and causes

● opponent shot diet trend vs our pregame plan
● V2/V3 enhancement: real-time shot map overlaid on pregame shot permissions
(green/yellow/red)
Panel 5 — Opponent Action/Coverage Tag Feed (AC1 owner)
MUST show:
● last 10 tagged opponent possessions
● repetition detection ("Horns x3 in last 7")
● coverage effectiveness notes (if tagged)
● V2/V3 enhancement: auto-tagged with confidence indicator (high/medium/low
classification confidence)
● V3 enhancement: "this action was their #2 play last game — they're leaning on it again"
Panel 6 — HC Overlay (locked caps)
MUST show:
● max 3 active alerts
● max 3 next-dead-ball bullets
● bullets are: one sentence + one action
2.5 Anti-Spam Rules (locked)
● ≤1 new alert / 90 seconds
● ≤3 alerts / 5 minutes
● max 3 active
● each alert expires after 3 possessions unless re-triggered
Alert Triggers (locked categories):
● repetition (same action/coverage repeatedly)
● damage (they are scoring from same thing)
● constraint (foul trouble, mismatch, injury)
● mismatch (targeting a weak link)
● fragility (opponent player in foul trouble whose absence triggers a Fragility Flag)
Manual Promote Rule (locked):
● 1 promoted item per 3 minutes
● format: "They're doing X. Do Y."
3. Halftime Staff Packet

3.1 Inputs — MUST PULL
● Game state + tag log
● First-half lineup table + stints
● Team totals (shot/TO/foul/rebound)
● Pregame leverage plan
● Player truths for context only (no KR recompute)
● Opponent Fragility Flags (for foul trouble / injury exploitation)
● Multi-game continuity data (if prior meeting exists)
3.2 Outputs (A–K, fixed order)
Top: Top-3 Decision Summary 3 bullets, ranked, each bullet = "problem → adjustment"
A) Game State Dashboard Score, pace estimate, foul/bonus, turnovers, OREB, points per
possession proxy
B) Five Factors eFG proxy / TO% proxy / OREB% proxy / FT rate proxy / transition (best
available)
C) Plan Adherence vs Pregame "We said deny X → did we?" Leverage plan checklist: hit/miss
+ consequence
D) Opponent Offense (OSIE lens) What they're running most. Where they're hurting us. What
they avoided. Late-clock tendencies.
E) Opponent Defense (DSIE lens) Their coverage plan vs us. What they're taking away. Where
they're vulnerable. Foul tendencies.
F) Our Offense Shot diet reality vs intent. Who is creating / who is being neutralized. What
action is working and why.
G) Our Defense Where we're breaking (POA, help, closeouts, glass). Mismatches they're
hunting. What coverage is failing.
H) Lineups / Matchups / Plus-Minus Top 3 lineups by performance. Worst 2 lineups (and
why). Matchup pain points (who can't guard who).
I) Constraints & Risk Foul trouble, fatigue, matchup constraints. "Cannot do" list (because of
personnel constraints). Fragility exploitation: "Their [player] has 3 fouls — attack him to force 4th
or force bench."
J) Simulation Projections
MUST PULL FROM: Simulation Engine
Given current game state (score, time, foul trouble, lineup availability):

● Win probability from current position (no adjustments)
● Win probability if Adjustment A is made (top option from sandbox)
● Win probability if Adjustment B is made (second option)
● Win probability if Adjustment C is made (third option)
● Key variable: "The single factor most likely to swing the outcome is [X]"
Simulation projections are directional, not precise. They surface which adjustments have the
highest expected impact, not guaranteed outcomes. Confidence on simulation projections is
governed by the Simulation Confidence Gate.
K) Adjustments Sandbox
2–5 defensive options (benefit + risk + projected win probability delta) 2–5 offensive options
(benefit + risk + projected win probability delta) Each option is one-liner: "Do X to get Y; risk Z;
projected impact: +/- W%"
3.3 Single-Page Layout (locked)
● Header: Top-3 Decision Summary
● Row1: A + B
● Row2: C + (D + E)
● Row3: F + G
● Row4: H + I
● Row5: J + K
● Footer: Simulation projection summary
4. Postgame Staff Packet
4.1 Confidence
MUST OUTPUT:
● postgame_confidence_pct (from Postgame Confidence Gate)
● data_tier for this game
4.2 Outputs — MUST OUTPUT (ordered)
1. Final dashboard + five factors (final)
2. Plan audit (what worked, what failed, why — mapped to pregame leverage plan)
3. Opponent O/D audits (OSIE/DSIE framing)
4. Our O/D audits
5. Lineup/matchup stint review (what combinations won/lost)
6. Player postgame cards (what happened vs pregame expectation)
7. Clip & teach list (priority clips, tags, teaching points)

8. Fragility audit: did the fragility flags we identified play out? Which ones mattered?
9. Multi-game continuity update: save this game's learnings for next meeting with this
opponent
10. Next actions:
○ Next game priorities
○ Practice seeds (3–8 drills/points)
○ Development prescriptions (player-specific)
○ Rotation considerations (if any)
4.3 KR Update Trigger
After the postgame packet is generated:
● Player KRs recalculate with new game data (per game cadence)
● Team KR recalculates with updated Player KRs + minutes/usage
● Coverage map, fit%, and fragility flags update
● If this game completes a 5-game window: system identity (OSIE/DSIE) re-evaluates at
checkpoint
● All updates feed into the next pregame packet for any future opponent
Governance
● Game Ops is produced by Nexus. No manual override of computed values.
● Staff tagging is human input that enhances the system but does not override automated
outputs.
● All packet outputs are deterministic: same inputs → same outputs.
● PlayVision enhanced modes (V2/V3) augment staff workflow — they do not replace
coaching judgment.
● Simulation projections at halftime are directional aids, not prescriptions.
● Multi-game continuity is automatic when prior game data exists in the system.
UI / GOVERNANCE NOTE
Scouting and game intelligence only. All values are produced by Nexus. No evaluation,
weighting, or normalization logic lives here. Game Ops consumes truth from Player Intelligence
and Team Intelligence — it does not produce or modify truth.
That's both docs — Scouting Confidence Gates and Game Ops. Lock them?`;


export const FILE_06 = `Development

Development Intelligence Engine (Locked)
0. Purpose
The Development Intelligence Engine is the final downstream consumer of the KaNeXT
Basketball Intelligence System. It takes everything the system knows about a player — their
evaluation, their archetype, their system fit, their confidence — and translates it into actionable
intelligence for placement, development, and decision-making.
It answers five questions for any evaluated player in the system:
1. Where are you now? — Truth summary across every level and system
2. Where should you be? — Best-fit targets ranked by actual team impact
3. What are you worth there? — Value at each target (PTV, scholarship/NIL implication)
4. What's the gap? — Specific traits holding you back, with exact deltas needed
5. What's the path? — Prioritized development roadmap with projected impact
This engine does NOT evaluate players. It does NOT modify Player KR, Team KR, archetypes,
system identity, or any upstream output. It reads governed truth and produces downstream
recommendations only.
All outputs are deterministic: same inputs → same outputs.
1. Consumers
The Development Intelligence Engine serves multiple users viewing the same player from
different angles:
● The player — "Where should I transfer? What should I work on? What am I worth?"
● The player's current coach — "How do I develop this player? What's his ceiling?
Where does he project if he improves?"
● Recruiting coordinators — "Does this player fit our system? Does he fill our gaps?
What's he worth to us vs other targets?"
● Transfer portal decision-makers — "Which portal players improve our Team KR the
most? Who's undervalued?"
● High school / prep / JUCO advisors — "What level should this kid play at? Which
programs are the best fit?"
● Pro scouts — "Where does this player project at the professional level? What needs to
develop?"

Same engine, same outputs, different decisions made from them.
2. MUST PULL (Inputs)
A) Player Identity + Record
MUST PULL FROM: Player Profile (Auto-Populated Record)
● Player name, identity, demographics
● Career history (schools, levels, seasons played)
● Current roster affiliation (if any)
● Eligibility status and remaining eligibility
● Class year / age
● Transfer portal status (if applicable: in-portal, withdrawn, committed)
● Recruiting classification (if applicable: HS class year, star rating from external sources)
B) Player KR Outputs (Truth)
MUST PULL FROM: Player Evaluation Pipeline (finalized outputs)
● Final_System_Off_KR (for current system context)
● Final_System_Def_KR (for current system context)
● Overall Player KR
● Base KR (pre-system-fit, locked truth)
● Player confidence_pct (from Player Confidence Gate)
● Evaluation mode (Full eval vs Production-based)
● Data tier (V1 / V1+ / V2 / V3)
C) Archetype + Badges + Impact Modifiers
MUST PULL FROM: Archetype Library, Badge Spec, Impact Modifier outputs
● Primary archetype assignment (from 21 locked archetypes)
● Secondary archetype(s) (if qualified for multiple)
● Badge list (bronze / silver / gold)
● Impact modifiers (if any)
● System risks (if any)
D) Full System Fit Profile
MUST PULL FROM: System Fit computation layer

● Offensive system fit score for ALL 12 offensive systems (not just the current coach's
selection)
● Defensive system fit score for ALL 10 defensive systems
● For each system: fit %, demand tier (A/B/C/No-match), and which demands the player
covers
This is critical. The current coach's system gives ONE system fit score. The Development
Intelligence Engine needs ALL 22 system fit scores to find where this player fits BEST across
the entire universe of programs.
E) Trait Scores (Raw)
MUST PULL FROM: Trait Library (54 traits, 7 clusters)
● All scored traits with current values
● Unscored traits flagged
● Cluster-level summaries (Shooting, Creation, Finishing, Playmaking, Defense,
Physicality, IQ)
Required for: Gap Analysis and Development Roadmap (computing which trait improvements
produce the largest KR lift).
F) Level Interpretation
MUST PULL FROM: Player KR Legend (all competitive levels) + KLVN normalization
● Player's KR tier label at EVERY competitive level (D1 HM, D1 MM, D1 LM, D2, D3,
NAIA, NJCAA D1/D2/D3, CCCAA, USCAA, NCCAA D1/D2, Professional)
● This shows the same player might be "Tournament Team starter" at D1 HM but "National
Title Favorite anchor" at D2
G) Team / League Universe
MUST PULL FROM: Global Database (Global Master List + Team Master Records)
● All leagues, conferences, teams, and their level tags
● Staff/coach records (coaching continuity, system history)
● Every team's current roster stack (who's there now)
H) Team System Identity
MUST PULL FROM: System Identity Record (OSIE/DSIE) for every team in the database
● Offensive system label + confidence
● Defensive system label + confidence

● System status (Provisional / Observed / Locked / Frozen)
I) Team KR Diagnostics (for every potential target)
MUST PULL FROM: Team KR Pipeline outputs (per team)
● Team_Off_KR, Team_Def_KR, Team_KR
● Coverage Map (which demands are covered, by whom)
● Missing Demands (uncovered A/B/C demands)
● Fragility Flags (single-point failures, concentration)
● Fit %
J) Scholarship / NIL Context (if available)
MUST PULL FROM: Scholarship & NIL Allocation Engine
● PTV (Player Team Value) at target teams — what this player is worth to THAT specific
team
● PMV (Player Market Value) — what the market values this player at
● Gap (PTV vs PMV) — undervalued or overpriced at each target
● Scholarship availability at target programs (if known)
● NIL pool estimates at target programs (if known)
K) Transfer Portal + Recruiting Pool (Competitive Context)
MUST PULL FROM: Global Database (Transfer Portal Registry + Recruiting databases)
● Other players in the portal or recruiting pool with similar archetypes
● Their KR, archetype, system fit profiles
● Where they've committed or are considering
● How they compare to the subject player
3. Outputs
OUTPUT A: Player Truth Summary — "Where Are You Now?"
A complete snapshot of the player's current evaluated state, translated into plain language.
A1) KR Identity Card
● Overall Player KR (with confidence %)
● Offensive KR / Defensive KR breakdown
● Base KR (system-neutral truth) vs System KR (current context)

● Archetype: primary + secondary (if applicable)
● Badges: list with tier (bronze/silver/gold)
● Impact Modifiers: list (if any)
● System Risks: list (if any)
● Data tier: V1 / V1+ / V2 / V3
● Evaluation mode: Full eval vs Production-based
A2) Level Tier Map
For every competitive level, show what this player's KR means:
Level KR Tier Label Interpretation
D1 High-Major e.g., "Rotation Player" Functional contributor, not a starter
D1 Mid-Major e.g., "Tournament Team Starter" Clear starter on a tournament-quality
team
D1 Low-Major e.g., "Conference POY Best player on most teams at this level
Candidate"
D2 e.g., "National Title Anchor" Dominant player at this level
NAIA e.g., "Best in Division" —
NJCAA D1 e.g., "D1 Transfer Pipeline" Ready to step up
... ... ...
This gives the player and their advisor an instant picture: "I'm a role player at HM but a star at
MM and dominant at D2."
A3) System Fit Heat Map

Show the player's fit score across ALL 22 systems (12 offense × 10 defense, displayed as a
matrix or ranked list):
● Top 3 best-fit offensive systems (with fit % and demand tier)
● Top 3 best-fit defensive systems (with fit % and demand tier)
● Bottom 3 worst-fit systems on each side
● "Sweet spot" systems where the player fills A-tier demands
This answers: "What kind of team should I play for?" before even looking at specific programs.
OUTPUT B: Placement Targeting — "Where Should You Be?"
Ranked list of best-fit programs/teams across the entire Global Database, sorted by how much
this player would improve that team.
B1) Best-Fit Colleges / Programs
For each target (top 20–50 results, filterable by level/conference/region):
● Target team / program name
● Competitive level (D1 HM/MM/LM, D2, D3, NAIA, NJCAA, etc.)
● Conference
● Current Team KR + tier label
● Offensive system + Defensive system (from OSIE/DSIE)
● Player's system fit % at that program (offense + defense)
● Player's archetype demand tier at that program (A/B/C/No-match)
● Demand Match — does this player fill an UNCOVERED demand? Which one?
● Projected Team KR Impact — if this player joins the rotation at projected minutes, how
does Team KR change? (computed using Team KR math with the player inserted)
● "Why" tags — top 2–3 reasons this is a good fit (e.g., "Fills uncovered Anchor Big
demand," "Top-3 system fit in Spread PnR," "Upgrades weakest rotation position")
● "Risk" tags — mismatches or concerns (e.g., "No match for defensive system," "Would
be redundant to current starter at same archetype," "Low confidence evaluation")
B2) Best-Fit Pro Leagues / Teams (if applicable)
Same structure as B1 but for professional teams:
● Target team / league
● Pro tier (NBA, G-League, EuroLeague, domestic leagues, etc.)
● Player's pro-level KR tier label
● System fit % (if pro team system identity is available)
● Projected role (starter / rotation / end of bench / developmental)
● Draft stock context (if applicable): projected draft range from public sources

B3) Sorting and Filtering
The placement list can be sorted by:
● Projected Team KR Impact (default — shows where the player helps the MOST)
● System Fit % (best schematic match)
● Demand Match Priority (A-tier uncovered demands first)
● Level (filter to specific division/level)
● Conference (filter to specific conference)
● Region (filter by geography)
OUTPUT C: Player Value at Target — "What Are You Worth There?"
For each target in the placement list, show the economic context:
C1) PTV (Player Team Value)
● PTV_Raw at this target (from Scholarship/NIL Engine formula)
● PTV_Share (what % of the team's total value this player would represent)
● Recommended scholarship % (based on PTV share × available equivalents)
● Recommended NIL allocation (based on PTV share × estimated NIL pool)
● Priority tier label: Core / Rotation / Depth / Development
C2) PMV (Player Market Value)
● PMV_Score (Social + Exposure + Performance + Deal Flow)
● PMV_Dollar estimate (market rate)
C3) Gap (PTV vs PMV)
● Gap flag: UNDERVALUED / FAIR / OVERPRICED at this specific target
● "This player is worth $X to [Target School] based on basketball value. The market prices
him at $Y. The gap is $Z."
C4) Comparative Value
● Rank this player's PTV against other available players (portal/recruits) who could fill the
same demand at this target
● "Among available Anchor Bigs who fit [Target School]'s Pack Line defense, this player
ranks #3 by PTV out of 47 options."
OUTPUT D: Gap Analysis — "What's Holding You Back?"

For a selected target tier or target program, show exactly what separates the player from the
next level.
D1) Tier Gap
● Current KR at target level: [value] = [tier label]
● Next tier threshold: [value] = [tier label]
● Gap: [delta] KR points needed
D2) Highest-Leverage Trait Improvements
Using the Player Evaluation Pipeline's trait-to-KR weighting structure, compute which trait
improvements produce the LARGEST KR lift per point of improvement:
● Trait 1: [trait name] — current score [X], target score [X + Δ] — projected KR lift: +[value]
● Trait 2: [trait name] — current score [X], target score [X + Δ] — projected KR lift: +[value]
● Trait 3: [trait name] — current score [X], target score [X + Δ] — projected KR lift: +[value]
Maximum 5 traits shown. Ranked by KR lift per point of improvement (highest leverage first).
Rules:
● Only traits from the canonical Trait Library (54 traits, 7 clusters)
● Does NOT invent traits
● Does NOT modify actual KR — shows projected KR IF the improvement happens
● Trait improvement deltas are realistic (bounded by position/age/level norms — no "+30
points on a trait")
D3) Archetype Unlock Analysis
If the player is close to qualifying for an additional archetype (meets some but not all must-have
thresholds):
● "You are [X] points away from qualifying for [archetype name]"
● "If you reach [trait] ≥ [threshold], you unlock [archetype], which opens [N] new A-tier
demand matches across [N] programs"
This shows the player that developing one specific skill could fundamentally change their
placement options.
D4) System Fit Unlock Analysis
If improving specific traits would shift the player's demand tier from C or No-match to B or A at
high-value systems:
● "Improving [trait] by +[Δ] would move your demand tier from C to B in [system name],
opening [N] additional programs as strong fits"

OUTPUT E: Development Roadmap — "What's the Path?"
A prioritized development plan that tells the player and their coach what to work on, in what
order, and what the expected impact is.
E1) Priority Stack
Ranked list of development priorities, ordered by:
1. Highest KR leverage (which improvements move the needle most)
2. Archetype unlock potential (which improvements open new archetypes)
3. System fit expansion (which improvements make you fit more systems)
4. Weakness mitigation (which improvements remove system risks or disqualifiers)
Each priority includes:
● Trait name
● Current score
● Target score
● Cluster (Shooting / Creation / Finishing / Playmaking / Defense / Physicality / IQ)
● Expected KR impact if achieved
● Expected archetype/system fit changes if achieved
● Priority label: Critical / High / Moderate / Low
E2) Cluster-Level Development Summary
Grouped by the 7 trait clusters:
● Cluster current average vs cluster target
● "Your shooting cluster averages 72. To unlock 3-and-D Wing archetype, you need
shooting cluster average ≥ 75. Focus: Spot-Up 3PT (+3 points) and Catch-and-Shoot
Volume (+2 points)."
E3) Risk Mitigation
If the player has system risks or auto-disqualifiers that suppress their KR:
● "System Risk: Turnover Risk (Major) — currently costing you approximately [X] KR
points. Improving Ball Security from [current] to [threshold] would remove this risk and
project a KR increase of +[value]."
E4) Ceiling Projection (Directional Only)

Given the player's age, position, current trait profile, and historical trait improvement rates at
their level:
● "Projected ceiling KR range: [low] – [high] at [level] over [timeframe]"
● "This projects as a [tier label] at D1 MM if development targets are met"
Rules:
● Ceiling projection is directional, not precise
● Based on trait improvement rate norms, not individual prediction
● Confidence on ceiling projection is always lower than current KR confidence
● Displayed with explicit uncertainty: "This is a projection based on typical development
rates, not a guarantee"
OUTPUT F: Competitive Landscape — "Who's Competing With You?"
For the player's target level and archetype, show the competitive context.
F1) Portal / Recruiting Pool Comparison
● Number of available players with the same primary archetype at the target level
● Their KR range (min / median / max)
● Where the subject player ranks within that pool
● "You are the #[X] ranked [archetype] available in the [level] transfer portal. There are [N]
players with higher KR at your archetype and [N] with lower."
F2) Target Program Competition
For each target program in the placement list:
● Other portal/recruit players targeting the same program
● Their archetype, KR, and system fit
● Whether they fill the same demand or a different one
● "Three other Anchor Bigs are in the portal and fit [Target School]'s system. You rank #2
among them by projected Team KR impact."
F3) Market Saturation
● Is this archetype oversupplied or undersupplied in the current portal/recruiting market?
● "Stretch Bigs are oversupplied in the D1 portal (87 available, 34 programs with open
demand). Your PTV may be compressed by market saturation."
● "POA Defender Guards are undersupplied (12 available, 58 programs with open
demand). Your PTV may be inflated by scarcity."

4. Hard Rules (Locked)
● This engine is downstream of Player KR and NEVER modifies Player KR, Team KR,
archetypes, system identity, or any upstream output
● All targeting must be derived ONLY from:
○ KR outputs + KR Legends
○ Archetype Library (21 locked archetypes)
○ Global Database (Global Master List + Team Master Records)
○ OSIE/DSIE system identity (12 offense, 10 defense)
○ System Fit definitions + System Demand Profiles
○ Scholarship/NIL Allocation Engine (PTV/PMV)
● All outputs must be explainable — show fit %, confidence %, demand match, and "why" /
"risk" tags
● Trait improvement projections use ONLY traits from the canonical Trait Library (54 traits,
7 clusters)
● Ceiling projections are always labeled as directional, not precise
● Competitive landscape data is factual (rankings, counts, comparisons) — never editorial
● All outputs are deterministic: same inputs → same outputs
5. Update Cadence
What Cadence Trigger
Player Truth Every game Player KR updates after every game
Summary (Output A)
Placement Targeting Every game + Team KR and roster changes affect demand
(Output B) on demand matching
Player Value at Every game + PTV changes as Team KR and demand shift
Target (Output C) on demand

Gap Analysis Every game KR changes affect gap calculations
(Output D)
Development Every 5 games Aligned with system identity checkpoint — trait
Roadmap (Output E) priorities may shift if system changes
Competitive Continuous Portal entries/withdrawals/commitments change the
Landscape (Output competitive pool constantly
F)
6. Governance
● The Development Intelligence Engine is produced by Nexus. No manual override of
computed outputs.
● All outputs are deterministic: same inputs → same outputs.
● Coaches, players, and advisors consume these outputs — they do not modify them.
● The engine references the Scholarship/NIL Allocation Engine for value outputs but does
not duplicate its logic. PTV/PMV are pulled, not recomputed.
● Placement targeting ranks by projected Team KR impact by default — this is the
objective measure of "where does this player help the most." Users can re-sort by other
criteria.
● The competitive landscape outputs are factual comparisons, not subjective rankings.
"You rank #3 by KR among available Anchor Bigs" is a fact. "You're better than Player X"
is editorial and is NOT produced.
UI / GOVERNANCE NOTE
Downstream intelligence engine only. All values are consumed from upstream engines (Player
KR, Team KR, System Identity, Scholarship/NIL, Global Database). No evaluation, weighting, or
normalization logic lives here. This engine translates existing truth into placement, development,
and competitive intelligence. It modifies nothing.

PRO TRANSITION

PRO TRANSITION INTELLIGENCE ENGINE
v1 — LOCKED
0. Purpose
The Pro Transition Intelligence Engine is the professional-level companion to the Development
Intelligence Engine. Where the Development Engine handles college-to-college movement
(portal, recruiting, transfers), this engine handles college-to-pro projection — translating a
college player's evaluated identity into professional context with development trajectory, draft
intelligence, and role projection.
It answers five questions for any college-evaluated player considering the professional level:
1. What are you as a pro right now? — Pro Projection KR (Entry) with full component
breakdown
2. What do you become? — Year 1 / Year 3 / Peak trajectory with scenario branching
3. What's the one thing? — The single highest-leverage development variable that
determines outcome range
4. How does your archetype evolve? — Archetype pathway from college identity to pro
ceiling
5. Where do you go? — Draft range, role projection, team fit context
This engine does NOT evaluate players. It does NOT modify Player KR, Team KR, archetypes,
system identity, or any upstream output. It reads governed truth from the Player Evaluation
Pipeline and produces downstream projections only.
All outputs are deterministic: same inputs → same outputs.
1. Consumers
● Pro scouts and front offices — "What does this player project as? What's the
development bet? What's the risk?"
● Agents and advisors — "Should this player declare? What's his draft range? What's his
earning trajectory?"
● The player — "Am I ready? What do I need to work on before going pro? What's my
ceiling?"

● The player's current college coach — "How do I develop this player for the next level?
What pro skills should we prioritize?"
● Media and analysts — Draft boards, prospect rankings, comparison context
Same engine, same outputs, different decisions made from them.
2. Inputs (MUST PULL)
A) Player Identity + Record
MUST PULL FROM: Player Profile (Auto-Populated Record)
● Player name, identity, demographics
● Age at time of draft / declaration
● Career history (schools, levels, seasons played)
● Current roster affiliation
● Eligibility remaining (relevant for "should I declare" decisions)
● Injury history (if available)
● International competition history (FIBA, Nike Hoop Summit, etc.)
B) College Player KR Outputs (Truth)
MUST PULL FROM: Player Evaluation Pipeline (finalized outputs)
● Overall Player KR (College)
● Base KR (pre-system-fit)
● Final System Off KR / Def KR
● Player confidence_pct
● Evaluation mode (Full eval vs Production-based)
● Data tier (V1 / V1+ / V2 / V3)
C) Full Trait Scores (Raw)
MUST PULL FROM: Trait Library (47 traits, 8 clusters)
● All 47 trait scores with current values
● UNSCORED traits flagged
● Cluster-level Skill KRs (Shooting, Finishing, Playmaking, POA Defense, Team Defense,
Rebounding, Tools, IQ)
● Data source per trait (TRUE / PROXY / UNSCORED)
This is critical. The Pro Transition Engine needs the raw trait vector to reweight through pro
positional demands and to identify which traits have the highest pro-level leverage.

D) Archetype + Badges + Impact Modifiers + System Risks
MUST PULL FROM: Archetype Library, Badge Spec, Impact Modifier outputs, System Risk
outputs
● Primary and secondary archetype assignments (college)
● Badge list (college tier gates)
● Impact modifier label
● Active system risks (college)
E) Full System Fit Profile
MUST PULL FROM: System Fit computation layer
● Offensive system fit scores for ALL 12 offensive systems
● Defensive system fit scores for ALL 10 defensive systems
● For each system: fit %, demand tier (A/B/C/No-match)
F) Physical Profile
MUST PULL FROM: Player Profile + Trait Scores
● Height, weight, wingspan (measured if available, listed if not)
● Age
● Physical trait scores: Height, Length, Strength, Speed, Lateral Quickness, Vertical Pop,
Motor, Endurance
G) Pro Positional Weights
MUST PULL FROM: Position Trait Weighting (Pro level, 5 positions)
● Pro OPF for the player's position
● Pro trait weight distributions within each cluster
● Pro badge gates (Bronze ≥ 93, Silver ≥ 96, Gold ≥ 98)
H) Pro System Risks + Overrides
MUST PULL FROM: System Risks v3, Overrides v3
● Pro Tier 1 Major triggers (−4.0)
● Pro Tier 2 Major triggers (−2.5)
● Pro Minor triggers (−2.0)
● Pro positive override triggers
● Pro negative override triggers
● Anti-Stacking rules

3. Outputs
OUTPUT G: Pro Projection KR (Entry) — "What Are You as a Pro Right
Now?"
The core translation. Take the college player's trait scores and run them through pro positional
weights, pro system risks, and pro overrides to produce a Pro Projection KR.
G1) Pro KR Identity Card
● Pro Projection KR (Entry): [value] ([range])
● Confidence: [%] — inherently lower than college confidence because translation adds
uncertainty
● Pro OKR / DKR / TKR / IQKR breakdown with pro positional weights applied
● College KR → Pro KR delta and explanation of what caused the shift (weight changes,
system risk triggers, badge loss/gain, override changes)
● Pro archetype: may differ from college archetype if pro weights change which gates are
met
● Pro badges: evaluated against pro tier gates (≥ 93 / ≥ 96 / ≥ 98)
● Pro system risks triggered: list with severity and KR impact
● Pro overrides applied: positive and negative, with governance notes
G2) Translation Breakdown
Show explicitly what changed from College to Pro and why:
● OPF shift (e.g., "PF College: OKR 44% / DKR 36% / TKR 18% / IQ 2% → PF Pro: OKR
46% / DKR 40% / TKR 10% / IQ 4%")
● Trait weight shifts within clusters (e.g., "Shooting weight inside OKR rose from 26% to
28% — this hurts/helps because...")
● Badge gate changes (e.g., "College Bronze at Skill KR ≥ 90 → Pro Bronze at ≥ 93.
Player's Finishing KR 91 qualified at College, does not qualify at Pro. Badge lift lost: −1.5
KR")
● System risk changes (e.g., "Range Gap was College Tier 2 Major (−1.5). Now Pro Tier 2
Major (−2.5). Additional penalty: −1.0 KR")
● Override changes (e.g., "College: Jumbo Initiator +1.0. Pro: Jumbo Initiator +1.0 —
unchanged" or "College: Vertical Rim Threat +1.0. Pro: not available as college-only.
Override lost.")
This transparency lets scouts see exactly where the translation helps or hurts.
G3) Pro KR Legend Interpretation

Map the Pro Projection KR (Entry) to the Pro Player KR Legend tiers. Display the tier label and
competitive/economic reality.
Note: This is the player's day-one pro identity — what they would be if dropped into the NBA
tomorrow. It is NOT their projected peak. The trajectory outputs (H, I) provide the development
path.
OUTPUT H: Development Trajectory — "What Do You Become?"
Year-by-year projection based on the player's current trait profile, archetype, age, and
archetype-typical development curves.
H1) Year 1 Projection
● Projected KR range after 1 NBA season
● Expected trait changes: Which traits typically improve in year 1 for this archetype? By
how much? (Bounded by historical norms, not individual prediction)
● Role expectation: Starter / Rotation / Bench / G-League based on entry KR and
archetype
● System risk status: Do any current system risks project to resolve in year 1? (Usually
no — shooting development takes 2+ years)
● Physical maturation: For players age ≤ 21, project strength and endurance
improvement from NBA training programs
H2) Year 3 Projection (Scenario Branch)
This is where the trajectory branches based on the Key Development Variable (Output I).
Scenario A — Key Variable Develops:
● Projected KR range
● Which system risks resolve
● Which badges unlock
● Archetype evolution
● Pro KR Legend tier
● Role projection (starter / closer / All-Star candidate)
Scenario B — Key Variable Does Not Develop:
● Projected KR range
● Which system risks persist
● Archetype stabilization
● Pro KR Legend tier
● Role projection (role player / specialist / scheme-dependent starter)

Both scenarios are always shown. The system does not pick a winner. It presents both paths
and lets the consumer decide which bet to make.
H3) Peak Projection (Directional)
● Ceiling KR range — the best realistic outcome given tools, age, and archetype-typical
peak curves
● Ceiling tier label from Pro KR Legend
● Timeline to peak — typically age 25–28 for most archetypes
● Ceiling confidence — always lower than current KR confidence. Labeled explicitly as
directional.
H4) Floor Projection
● Floor KR range — the worst realistic outcome assuming no major injury but limited
development
● Floor tier label from Pro KR Legend
● Floor scenario description — what the player looks like if development stalls
Rules for all trajectory projections:
● Projections are directional, not precise
● Based on archetype-typical development rates, not individual prediction
● No trait improvement may exceed +15 points over 3 years (historical ceiling for
high-development players)
● No trait improvement may exceed +8 points in a single year
● Confidence on trajectory projections is always lower than entry KR confidence
● Both upside and downside are always shown
● All projections are labeled with explicit uncertainty language
OUTPUT I: Key Development Variable — "What's the One Thing?"
The single highest-leverage skill improvement that most determines the player's outcome range.
Every pro projection has one.
I1) Variable Identification
● Trait name (from canonical Trait Library)
● Current score
● Target score (the threshold that unlocks the next tier of value)
● Cluster (Shooting / Finishing / Playmaking / Defense / Tools / IQ)
I2) KR Impact Analysis

● KR impact if achieved: How much does overall Pro KR move if this trait reaches the
target?
● System risk impact: Does achieving the target remove a system risk? Which one?
What's the KR penalty removed?
● Badge impact: Does achieving the target unlock a pro badge? Which tier?
● Archetype impact: Does achieving the target unlock a new archetype or shift the
primary?
● System fit impact: Does achieving the target shift demand tier from C to B or B to A in
any systems?
I3) Development Evidence
● FT% signal (for shooting variables): Does the player's FT% support or undermine the
projection that they can develop this skill? (FT% is the truth serum — per system rules)
● Age factor: How old is the player? Younger players have more development runway.
● Historical comp rate: What percentage of players with this archetype and this trait gap
have historically closed it within 3 years? (Directional estimate, not precise)
● Risk label: High confidence / Moderate confidence / Low confidence that the variable
develops
I4) Secondary Development Variable (if applicable)
If there's a second trait that meaningfully moves the KR needle (though less than the primary),
show it with the same structure. Maximum 2 variables shown. Most players have one clear
primary.
OUTPUT J: Archetype Evolution Path — "How Does Your Identity Change?"
J1) Current → Year 3 → Peak Archetype Map
Show the player's archetype trajectory:
● Current (College): [Primary archetype] | [Secondary archetype]
● Entry (Pro Day 1): [Primary archetype] | [Secondary archetype] — may shift from
college due to pro weight changes
● Year 3 (Scenario A — variable develops): [Projected primary] | [Projected secondary]
● Year 3 (Scenario B — variable doesn't develop): [Projected primary] | [Projected
secondary]
● Peak (if all development targets met): [Ceiling archetype]
J2) Archetype Unlock Proximity
For each archetype the player does NOT currently qualify for but is close to:

● Archetype name
● Which gates are met vs unmet
● How many trait points away from qualification
● Whether the Key Development Variable would unlock it
OUTPUT K: Draft and Team Fit Intelligence — "Where Do You Go?"
K1) Draft Range Projection
Based on Pro Projection KR (Entry) mapped to historical draft position data:
● Projected draft range (e.g., "Picks 3–6")
● Entry KR tier label with historical draft-position correlation
● Archetype demand in current draft class — is this archetype scarce or saturated
among the available prospects?
K2) Pro Team Fit (if pro team system data available)
For NBA teams with known system identities:
● Top 5 best-fit teams by system fit % (offense + defense)
● For each: system name, fit %, demand tier, projected role, "why" tags
● Bottom 3 worst-fit teams with "risk" tags
K3) Competitive Context
● Other prospects in the draft class with the same archetype
● Their Pro Projection KR (Entry) range
● How the subject player ranks among them
● Scarcity / saturation of this archetype in the current class
4. Hard Rules (Locked)
● This engine is downstream of Player KR and NEVER modifies Player KR, Team KR,
archetypes, system identity, or any upstream output
● Pro Projection KR (Entry) is a translation, not a new evaluation. It applies pro weights,
pro system risks, and pro overrides to existing college trait scores. It does not re-score
traits.
● All trait scores consumed are the SAME trait scores from the college evaluation. No trait
is re-scored for "pro potential" — traits reflect current demonstrated ability only
● Development trajectory projections are ALWAYS labeled as directional, not precise

● No trait improvement projection may exceed +15 points over 3 years or +8 points in 1
year
● Both upside and downside scenarios are ALWAYS shown for Year 3 and Peak
projections
● Confidence on all trajectory outputs is ALWAYS lower than entry KR confidence
● The Key Development Variable is identified through KR leverage math (which trait
improvement produces the largest KR swing), not editorial judgment
● All outputs must be explainable — show the math, show the reasoning, show the
uncertainty
● All outputs are deterministic: same inputs → same outputs
● Pro team fit outputs require pro team system identity data. If unavailable, Output K2 is
marked "Pro team system data not available — generic archetype demand shown
instead"
5. Relationship to Other Engines
Upstream (consumed, never modified)
● Player Evaluation Pipeline → trait scores, KR, archetypes, badges, system fit,
confidence
● System Risks v3 → pro tier assignments, anti-stacking rules
● Overrides v3 → pro positive/negative overrides
● Position Trait Weighting → pro OPF and trait weight distributions
● Pro Player KR Legend → tier interpretation for Pro Projection KR
Parallel (companion, not overlapping)
● Development Intelligence Engine → handles college-to-college movement (portal,
recruiting, transfers). This engine handles college-to-pro projection. They share the
same upstream inputs but serve different consumers and answer different questions. A
player in the portal would use BOTH: the Development Engine for "where should I
transfer" and this engine for "should I go pro instead."
Downstream (consumes this engine's outputs)
● Scouting and Game Operations Engine → may reference Pro Projection KR for
draft-eligible players in scouting reports
● Simulation Engine → may use pro-translated trait profiles for pro-level simulations
● Nexus UI → renders the outputs for end users (scouts, players, advisors)

6. Trigger Conditions
This engine fires when:
1. A college player's evaluation is complete (Player KR locked), AND
2. The player is draft-eligible (based on age/class year/eligibility rules), AND
3. A consumer requests pro projection (scout, player, advisor, or system auto-trigger for
draft-eligible players)
The engine does NOT fire for:
● Players with remaining college eligibility who have not declared or been requested for
pro projection
● Players who already have professional production data (use the standard Pro evaluation
pipeline instead)
● Players without a completed college evaluation (no KR = no projection)
7. Update Cadence
Output Cadence Trigger
Pro Projection KR (G) Every game + on College KR updates propagate
demand
Development Trajectory (H) Every 5 games Aligned with system identity
checkpoint
Key Development Variable Every 5 games Trait shifts may change leverage
(I) ranking
Archetype Evolution (J) On demand Typically stable within a season
Draft / Team Fit (K) Continuous Draft class pool changes, team needs
shift
8. Governance
● The Pro Transition Intelligence Engine is produced by Nexus. No manual override of
computed outputs.
● All outputs are deterministic: same inputs → same outputs.
● Scouts, players, agents, and advisors consume these outputs — they do not modify
them.

● Pro Projection KR (Entry) uses the same trait scores as the college evaluation. The only
differences are positional weights (pro vs college), system risk thresholds (pro vs
college), override triggers (pro vs college), and badge gates (pro vs college).
● Development trajectory projections are bounded by archetype-typical development
norms. The system cannot project a player improving faster than historical precedent
allows.
● The Key Development Variable is computed, not chosen. It is the trait with the highest
KR leverage per point of improvement at the pro level. If two traits are within 0.5 KR
leverage of each other, both are shown (primary + secondary).
v1: Initial locked structure. Companion to Development Intelligence Engine. Covers
college-to-pro translation, development trajectory, archetype evolution, and draft intelligence.

Coaching Impact Modifier

Coaching Impact Modifier v1.0 (Locked)
1. Purpose
Computes coaching-attributable player development residuals across all 8 trait clusters.
Standalone doc consumed by Development Intelligence Engine (Engine 06). Modifies
development PROJECTIONS only — never modifies Player KR, Team KR, traits, archetypes, or
any upstream output.
2. Inputs (Must Pull)
Per Player Per Season: All 47 trait scores (8 cluster KRs), overall Player KR, position, age,
level, minutes/usage, system identity (OSIE/DSIE), Team KR, data tier (V1/V1+/V2/V3).
Per Coach: Coach ID, head coach vs position coach, program affiliation per season, tenure
dates, continuity flag.
Departure Data: Players who left Coach X, pre-departure trait scores (last season under X),
post-departure trait scores (first full season under new coach), destination coach ID and system
identity.
3. Baseline Expected Development Curves
The baseline is the league-wide average year-over-year trait movement for a player of a given
age, position, and level. It represents what SHOULD happen through natural maturation and
standard reps alone. Movement above or below baseline = coaching residual.
Computation:
Baseline_Δ(cluster, age, position, level) = weighted mean of actual deltas across all players in
the Global Database matching that age bracket × position group × level tier, weighted by
minutes played.
Age brackets: 17–18, 19–20, 21–22, 23+ Position groups: Guards, Wings, Forwards, Centers
Levels: Grouped by KLVN lambda tiers
Properties:

● Recomputed annually as the Global Database grows
● Level-specific (D1 HM freshman guard ≠ JUCO freshman guard)
● Survivorship-controlled (only players with consecutive-season data)
● Tools cluster baselines expected smaller than skill clusters (genetic ceilings) but still
measured — S&C coaching is real
4. Coaching Residual Computation
4.1 Per-Player Residual
For Player P under Coach C for consecutive seasons (Year N → N+1):
Residual(P, C, cluster) = Actual_Δ(P, cluster) − Baseline_Δ(cluster, age, position, level)
Positive = improved more than expected. Negative = improved less or regressed. Zero =
developed at expected rate.
4.2 Coach Impact Profile (CIP)
Aggregated across all eligible player-seasons under Coach C:
CIP(C, cluster) = weighted_mean(all Residuals under C), weighted by minutes played
Output: 8-value vector — one per cluster.
Cluster CIP Interpretation
Shooting +4.2 Strong positive developer
Finishing +1.8 Moderate positive
Playmaking +2.4 Moderate positive
POA Defense +0.3 Near baseline
Team +1.1 Slight positive
Defense
Rebounding −0.4 Near baseline
Tools +2.9 Strong physical
developer
IQ +1.6 Moderate positive

Example values. Actual CIP computed from observed data.
4.3 Position-Specific CIP
CIP can be sliced by position group. A coach may develop guard shooting at +5.1 but center
shooting at +1.2. Position-specific CIP used when sample ≥ 6 player-seasons at that position.
Otherwise falls back to overall CIP.
4.4 System-Adjusted CIP
System identity changes explain some trait movement independently of coaching (e.g.,
Post-Centric → Spread PnR naturally increases 3PA). The system-adjusted CIP compares:
● PURE signal: Players who stayed in the same system under the same coach
● MIXED signal: Players whose system identity changed (coaching + system confound)
MIXED residuals flagged → Development Intelligence Engine applies lower confidence weight.
5. Evidence Thresholds
Threshold Minimum Below Minimum
Player-seasons under coach 8 Modifier inactive — baseline only
Unique players 4 Modifier inactive
Consecutive seasons per 2 Player excluded from
player computation
Minutes per player-season 10 MPG, 15+ games Player excluded
Position-specific CIP 6 player-seasons at Fall back to overall CIP
position
CIP Confidence Tiers
Tier Player-Season Unique Confidenc CIP/Baseline Blend
s Players e
Low 8–15 4–6 55–70% 30% CIP / 70%
baseline
Medium 16–30 7–15 70–85% 50% / 50%

High 31–60 16–30 85–93% 70% / 30%
Very High 61+ 31+ 93–97% 80% / 20%
Baseline is never fully replaced. Even at Very High, 20% baseline anchor remains.
6. Regression Detection (Departure Analysis)
6.1 Departure Residual
For Player P who leaves Coach C and plays under Coach D:
Departure_Residual(P) = Actual_Δ(P, first season under D) − Baseline_Δ(age, position,
level under D)
Negative departure residual = player regressed after leaving → strengthens Coach C's CIP.
Positive departure residual = player improved after leaving → weakens Coach C's CIP (or
strengthens D's).
6.2 Regression Ratio
Regression_Ratio(C) = count(negative departure residuals) / count(all departures from C)
Above 0.60 = strong coaching attribution signal. Below 0.40 = development was likely natural,
not coach-driven.
6.3 Level Change Control
When a player changes level upon departure (e.g., JUCO → D1), the departure residual is
computed against the NEW level's baseline. The system does not penalize a coach because
stats dropped at a harder level.
7. Application to Development Projections
7.1 Projection Formula
Projected_Δ(P, cluster) = Baseline_Δ(age, position, level) + (CIP(C, cluster) ×
Blend_Weight)
Blend_Weight from Section 5 confidence tiers.

7.2 Diminishing Returns
Players with high current trait scores get less CIP boost:
Improvement_Multiplier = (100 − Current_Trait_KR) / 50, capped at 1.0
● Player at 50 KR → full CIP applied (multiplier 1.0)
● Player at 75 KR → 50% of CIP applied
● Player at 90 KR → 20% of CIP applied
7.3 Bounds
All projections bounded by Development Intelligence Engine hard rules:
● Max +8 KR per cluster in 1 year
● Max +15 KR per cluster over 3 years
● Both upside and downside scenarios always shown
CIP can push toward bounds but never beyond.
8. Team KR Development Attribution
8.1 Separation
For each season-over-season Team KR change:
● Returning_Player_Contribution = sum(KR delta for each returning player × their
minutes share)
● New_Player_Contribution = sum(new player KR − departed player KR they replaced ×
minutes share)
8.2 Development Ratio
Development_Ratio(C, season) = Returning_Player_Contribution / Team_KR_Delta
Above 0.50 = coach builds through development. Below 0.30 = coach builds through
portal/recruiting.
Multi-season Development Ratio tracked under the same coach. Consistent high ratios =
strongest CIP environments.

9. Hard Rules
1. Computed by Nexus. No manual override.
2. Deterministic: same inputs → same outputs.
3. NEVER modifies Player KR, Team KR, traits, archetypes, system risks, badges, or any
upstream output.
4. CIP recomputed annually after season ends. No mid-season updates.
5. CIP always blended with baseline — never fully replaces it.
6. No single player-season residual may contribute more than 15% of total CIP weight.
7. Departure residuals require 1 full season at new program before activation.
8. Level changes controlled for in departure analysis.
9. Position coach CIP is secondary to head coach CIP unless position coach data is
independently available.
10. All CIP values accompanied by confidence level and sample size.
10. Relationship to Other Documents
Upstream (Consumed, Never Modified)
Document What This Pulls
Player Evaluation Pipeline 47 trait scores, 8 cluster KRs, Player KR, position, archetype
Global Database Career records, season stats, minutes, usage, rosters, level
metadata
Staff/Coach Record Coach ID, tenure, program affiliation, continuity
Transfer Portal Registry Departure events, destinations, destination coaches
System Identity System labels per team-season
(OSIE/DSIE)
KLVN Lambda values for level-specific baselines
Consumed By
Engine/Doc How It Uses CIP
Development Intelligence Engine Applies CIP to player development trajectory projections
(06)
Pro Transition Intelligence Engine References CIP for college-to-pro development trajectory

Nexus UI Surfaces Coach Impact Profile and Development Ratio to
end users
Parallel
Document Relationship
System Risks v3.2 Risks = NOW. CIP = FUTURE. Different time horizons.
Physical Mismatch Physical modifiers adjust Team KR for level-specific size. CIP adjusts
Modifiers v1 development projections for coaching. Different mechanisms.
Overrides v3 Overrides adjust Player KR instantly. CIP adjusts trajectory
longitudinally.
11. Update Cadence
Output Cadence Trigger
Baseline curves Annually End of season, full database rebuild
Coach Impact Annually End of season, after final trait scores locked
Profile
Departure residuals Annually After departing player completes 1 full season at new
program
Development Ratio Annually End of season, after Team KR and roster attribution
computed
Projection On Whenever Development Intelligence Engine runs a
application demand projection
v1.0: Initial locked structure. Standalone governance document. Consumed by Development
Intelligence Engine (Engine 06) and Pro Transition Intelligence Engine.`;

export const FILE_07 = `# PRO KR CALIBRATION REFERENCE -- v1

## 12 Players | 5 Tiers | 2025-26 Season Data

Calibrated March 30, 2026. All stats from 2025-26 regular season.

---

## TIER VALIDATION SUMMARY

| Tier | KR Range | Players | Validates |
|------|----------|---------|-----------|
| 98-100 | Global Apex | Jokic (98.5) | IQKR-driven dominance, passing + efficiency |
| 94-97 | Elite Franchise Anchor | Wemby (97.8), SGA (97.5), Luka (96.2), Giannis (94.8) | Two-way separates 97+ from 96. DKR is the differentiator. |
| 90-93 | High-Impact Star | KD (93.0), Cade (92.4), Curry (92.0), Reaves (90.2) | Star starters. Franchise players or elite #2s. |
| 86-89 | Core Contributor | LeBron (89.5), Knueppel (87.8), Flagg (86.4) | Aging stars declining into this tier + rookies entering here. |
| 82-85 | Role Player | Not yet calibrated | Next calibration pass needed. |

---

## FULL CALIBRATION DATA

### 1. NIKOLA JOKIC -- 98.5
Denver Nuggets | C | 6'11" / 284 | Age 31
28.0/12.9/10.8 | .677 TS% | 3x MVP | Champion

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 97 | 82 | 85 | 100 |

Best all-around player alive. IQKR 100 (highest ever calibrated). Triple-double machine. Passing vision historically unprecedented for a center. Cap %: 35%+ ($51M).

### 2. VICTOR WEMBANYAMA -- 97.8
San Antonio Spurs | C/PF | 7'4" / 210 | Age 21
24.2/11.3/3.1/1.1/3.1 BPG | .623 TS% | Spurs 56-18

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 93 | 99 | 99 | 90 |

Most physically dominant player alive. DKR/TKR 99 -- unprecedented combination. Led Spurs from lottery to 56-18. IQKR 90 still rising -- by age 25 projects to 99+. First player in history to average 3+ blocks and 3+ threes per game. 8'0" wingspan.

### 3. SHAI GILGEOUS-ALEXANDER -- 97.5
Oklahoma City Thunder | PG/SG | 6'6" / 195 | Age 27
31.4/4.3/6.5/1.4 SPG | .551 FG% / .379 3P% / .882 FT% | MVP | Champion | Thunder #1 net rating

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 97 | 92 | 91 | 96 |

Most BALANCED superstar. Narrowest component spread (6 points). No weakness. Most system-portable -- fits any team. MVP + champion. His floor on any team is 96+. 7'0" wingspan.

### 4. LUKA DONCIC -- 96.2
Los Angeles Lakers | PG | 6'8" / 230 | Age 27
33.7/7.8/8.2/1.6 SPG | .476/.366/.776 | Scoring champion | Lakers 48-26

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 98 | 75 | 88 | 95 |

Best pure scorer alive. OKR 98 highest of anyone calibrated. But DKR 75 is lowest among superstars -- gets targeted defensively. System-dependent: 98-99 impact with elite defense around him, 93-94 without. Widest component spread (23 points) among top tier.

### 5. GIANNIS ANTETOKOUNMPO -- 94.8
Milwaukee Bucks | PF | 6'11" / 243 | Age 31
27.6/9.8/5.4 | .624 FG% / .333 3P% / .650 FT% | Bucks 29-44

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 94 | 88 | 97 | 86 |

Physical freak declining. Peak was 98-99 (back-to-back MVP, DPOY, champion). DKR dropped from 96 to 88 -- defense ages fastest. OKR barely declined (96 to 94). TKR 97 still elite at 31. IQKR 86 was never his strength. Bucks 29-44 reflects roster collapse, not Giannis decline alone.

### 6. KEVIN DURANT -- 93.0
Houston Rockets | PF/SF | 6'11" / 240 | Age 37
25.9/5.4/4.6 | .517/.406/.879 | 71 GP

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 94 | 78 | 92 | 91 |

Ageless scorer. TKR 92 (7-footer mid-range) ages slowest because it was never athleticism-dependent. .406 3P% at 37. 71 games -- most available aging star. Peak was 98 (2017-18 Finals MVP). Declined 5 points over 10 years. Proves: height/length ages better than speed/quickness.

### 7. CADE CUNNINGHAM -- 92.4
Detroit Pistons | PG | 6'6" / 220 | Age 24
24.5/5.6/9.9/1.5 SPG/0.9 BPG | .461/.346/.814 | Pistons 54-20

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 93 | 86 | 89 | 94 |

Franchise PG ascending. 9.9 APG (2nd in NBA). Led Pistons from 28-game losing streak to 54-20 in 2 years. 6'6" 220 with 7'0" wingspan -- the ideal modern PG frame. All-Star starter. Proves the 6'6" PG archetype works (Peterson ceiling comp). Efficiency (.346 3P, 56.7% TS) is the gap between him and the superstars.

### 8. STEPHEN CURRY -- 92.0
Golden State Warriors | PG | 6'2" / 185 | Age 37
27.2/3.5/4.8 | .468/.391/.931 | 39 GP (injury-limited)

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 93 | 72 | 68 | 97 |

GOAT shooter. TKR 68 -- lowest of any player calibrated. Widest component spread (29 points: IQKR 97 vs TKR 68). Entire career is skill-over-tools. Peak was 97 (unanimous MVP). Declined 5 points. Only 39 games -- availability is critical. Proves: low TKR = faster decline.

### 9. AUSTIN REAVES -- 90.2
Los Angeles Lakers | SG | 6'5" / 197 | Age 27
24.0/4.8/5.5 | .502/.380/.880 | 64.4% TS | Lakers 48-26

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 93 | 80 | 76 | 94 |

Suppressed star. Averaged 30+ when Luka and LeBron were out -- proves he's a #1 option, not just a system beneficiary. Undrafted two-way to 90+ KR in 4 years. Skill-over-tools archetype (TKR 76). IQKR 94 reflects ability to scale up as #1 or down as #3 -- rarest basketball skill.

### 10. LEBRON JAMES -- 89.5
Los Angeles Lakers | SF | 6'9" / 250 | Age 41
21.1/5.8/6.8 | 59.5% TS | Year 23 | Third option

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 86 | 78 | 88 | 97 |

GOAT (or second-GOAT). Peak was 99 (Miami 2012-13). Declined 10 points over 12 years. Now the third option behind Luka and Reaves. IQKR 97 barely moved -- basketball mind doesn't age. TKR 88 at 41 is remarkable (was 99 at peak). Full aging curve documented: offense declines slowly, defense declines fast, IQ holds, tools decline medium.

### 11. KON KNUEPPEL -- 87.8
Charlotte Hornets | SF/SG | 6'7" / 210 | Age 20
19.0/5.4/3.5 | .487/.436 | 65.3% TS | ROY frontrunner | NBA leader in 3PM

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 90 | 78 | 80 | 92 |

Elite shooting transforms teams. Hornets from 55 losses to 38-34. .436 3P% leading the league as a rookie. All-time rookie record for threes. Higher current KR than Flagg despite lower physical tools. Proves: shooting + IQ can outperform athleticism + defense in the short term. Peak projection: 91-92 (Klay Thompson tier).

### 12. COOPER FLAGG -- 86.4
Dallas Mavericks | SF | 6'9" / 205 | Age 19
20.4/6.6/4.6/1.2/0.9 | .474/.286/.814 | 55.0% TS | #1 pick

| OKR | DKR | TKR | IQKR |
|-----|-----|-----|------|
| 85 | 88 | 90 | 86 |

Defense-first rookie. DKR 88 translating immediately. TKR 90 highest among rookies. .286 3P% is the critical development variable -- if it becomes .350+ he's a 95-96 player (Kawhi comp). Validates draft Entry KR projections (84-88 range for first-round picks). Peak projection: 95-96.

---

## KEY INSIGHTS FROM CALIBRATION

### 1. DKR separates tiers at the top
The difference between 98+ (Jokic, Wemby) and 94-97 (Luka, Giannis) is primarily defense. Luka's DKR 75 caps him at 96. SGA's DKR 92 pushes him to 97.5.

### 2. Offense ages slowest, defense fastest
Across all aging stars: OKR drops ~2-3 points per decade. DKR drops ~8-10 points. TKR drops ~5-10 points depending on original athleticism. IQKR barely moves.

### 3. TKR predicts aging curve speed
KD (TKR 92, skill-based height) declining slowest. Curry (TKR 68, speed-based game) declining fastest. Giannis (TKR 97, athleticism-based) will decline fast once explosiveness goes.

### 4. System fit creates 3-5 point impact swing
Luka: 98-99 on Dallas (defense around him) vs 93-94 on bad defensive team. Reaves: 90+ next to Luka vs 87-88 as solo #1. Knueppel: 87.8 next to LaMelo vs probably 84-85 without elite creator.

### 5. Entry KR for rookies is 84-88 regardless of draft position
Flagg (#1): 86.4. Knueppel (#4): 87.8. This validates 2026 draft projections (Boozer 86.8, Peterson 87.5, Dybantsa 84.2). Entry doesn't correlate with draft order -- ceiling does.

### 6. Suppression detection matters at pro level too
Reaves' true talent was hidden by playing with Luka/LeBron. When they sat, he averaged 30+. Always check role context before finalizing OKR.

### 7. Component spread predicts system dependency
Narrow spread (SGA: 6 points) = system-portable, high floor on any team.
Wide spread (Luka: 23 points, Curry: 29 points) = system-dependent, needs roster construction around weakness.

---

## GOVERNANCE

- v1 calibration: 12 players, March 2026
- Next calibration: add 18 more players to cover 82-85 tier and role player tier
- Update annually with new season data
- Pro KR Legend tiers validated against all 12 players -- no tier breaks need adjustment
- Aging curve insights should be incorporated into Mode 6 development projections`;
