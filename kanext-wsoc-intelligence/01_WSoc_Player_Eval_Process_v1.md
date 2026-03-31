# COACH CONTEXT SETUP

COACH CONTEXT SETUP -- Women's Soccer v1 (LOCKED)

Purpose
Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. Program Name
2. Governing Body -- NCAA, NAIA, NJCAA, CCCAA, USCAA, NCCAA (college) OR Professional League (pro)
3. Division (if applicable) -- NCAA: D1/D2/D3, NJCAA: D1/D2/D3, NCCAA: D1/D2
4. Major Class (required only if NCAA D1) -- High-Major, Mid-Major, Low-Major
5. Formation -- primary match formation (e.g., 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2)
6. Offensive System -- must match one of the 14 defined offensive systems in the UI System Set
7. Defensive System -- must match one of the 10 defined defensive systems in the UI System Set

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

Optional Metadata
1. Conference -- non-blocking if blank. Used by KLVN for D1 Major Class auto-assignment.
2. League (pro only) -- NWSL, WSL, Liga F, etc.

Optional Constraints (Downstream Only)
These fields do not alter trait scoring, position weighting, system fit, or Base KR computation. Consumed only by downstream planning and recommendation systems.

1. Scholarships Available (cannot exceed preloaded max for governing body/division)
2. Roster Cap (28 for opt-in D1 schools, varies by level)
3. NIL Pool (default $0)
4. Institutional / Merit Aid Capacity
5. Need-Based Aid Availability
6. Operating Budget
7. Recruiting Budget
8. Roster Size Target
9. Staffing Capacity Band -- Lean, Standard, Elite
10. Transfer Budget (pro only)
11. Wage Budget (pro only)
12. Salary Cap Space (NWSL only)

Context Lock
When all required fields (1-7) are populated and validated, system state transitions to Coach Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

Governance
System names in fields 6 and 7 must exactly match the UI System Set. Governing body, division, and major class must exactly match KLVN level keys. Formation must be a valid football formation. Any change to required fields, validation rules, or downstream bindings requires documentation, versioning, and approval.

Women's Soccer-Specific Notes:
- Nearly every D1 school sponsors women's soccer. The D1 landscape is substantially larger than men's (~320+ programs vs ~200).
- Scholarship limits changed in 2025-26 (House v. NCAA settlement). Opt-in D1 schools: roster cap 28, no scholarship cap. Non-opt-in: traditional 14 equivalency scholarships.
- D2: 9.9 equivalency scholarships. NAIA: 12 scholarships. NJCAA D1: 18 scholarships.
- Pro leagues have varying squad size rules (NWSL: 22-26 roster).


# PLAYER PROFILE

Player Profile (Auto-Populated Record) -- Women's Soccer

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
- Youth club / academy (ECNL, GA, US Soccer DA legacy, club system)
- College (if applicable) -- program, conference, years
- Current team affiliation (if applicable)
- Passport(s) held (relevant for international registration rules)

B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- League / competition level (as reported)
- Season/year label
- Dates active (if available)
- Contract status (pro: expiry date, loan status; college: eligibility remaining, transfer portal status)

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

Note: Advanced metrics availability is more limited in women's soccer than men's. FBref covers NWSL and major European women's leagues. College women's soccer has minimal advanced stat coverage outside of goals/assists/minutes.

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
- ACL history (critical -- ACL injury rates are 2-6x higher in women's soccer than men's)
- Pregnancy/maternity leave (if publicly disclosed -- relevant for suppression detection)

G) Youth/Senior National Team Record
- Youth national team call-ups by age group (U-15, U-17, U-20, U-23)
- Youth national team caps and goals
- Youth World Cup participation
- Senior national team caps and goals
- Senior tournament participation (World Cup, Olympics, continental championships)
- FIFA ranking of national team

H) Off-Pitch Public Record (Observable Only)
- Public statements (if captured)
- Social media presence (handles only)
- Verifiable public incidents (if applicable)
- Awards and honors (All-Conference, All-American, Golden Boot, MVP, NWSL Best XI, WSL POTM, etc.)

I) Source Attribution + Trust Metadata (Per Field)
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
- Pregnancy status (unless publicly disclosed by the player)


# PLAYER CONFIDENCE GATE

PLAYER CONFIDENCE GATE -- Women's Soccer v1 (LOCKED STRUCTURE, PROVISIONAL RANGES)

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
- Event-level data present (Opta/StatsBomb/Wyscout tagged actions) -> V2 Mode
- Multi-season event-level data + tracking data -> V3 Full Player KR Mode

Note: Women's soccer data availability lags men's by approximately one tier. Most NWSL/WSL data is at V1+. Most college women's soccer data is at V1 (box-score only). Event-level and tracking data coverage is expanding but not yet universal.

Trait Coverage by Mode
The Trait Library defines 54 traits across 8 clusters. Each trait is marked as TRUE, PROXY, or UNSCORED per data layer.

In V1 (box-score only): ~7-8 traits produce scores at college level, ~12-15 at NWSL/WSL level. UNSCORED traits return null. Position weighting renormalizes around scored traits only. Confidence reflects reduced trait coverage.

In V3 (full event + tracking data): all 54 traits are scoreable. Confidence reflects data depth, sample size, and multi-year stability.

Confidence Ranges (Provisional -- v1)

| Data Available | V1 Confidence % | Full KR Confidence % |
|---|---|---|
| College box score only, single season | 38-48% | 18-33% |
| College box score, multi-year with awards context | 45-58% | 28-42% |
| College box score + YNT context | 48-62% | 32-48% |
| NWSL/WSL box score + composites, single season | 50-62% | 35-50% |
| NWSL/WSL multi-season box score + composites | 55-68% | 42-58% |
| NWSL/WSL advanced metrics (xG, xA, progressive) | 60-75% | 48-65% |
| Event-level data (1 season, 10+ matches) | 70-82% | 55-72% |
| Multi-season event + tracking | 80-92% | 70-88% |

Note: YNT context (youth national team history) adds 3-8% confidence because it provides cross-level validation of ability against elite competition.


# PLAYER EVALUATION ENGINE -- CONTEXTUAL MODE

Contextual Mode (Soccer-Specific)

Contextual Mode is the default evaluation mode at V1 data tier. It produces KR estimates from limited data by combining production anchoring (Phase 3) with contextual inference (Phase 6).

When It Activates
Any time data availability prevents full 54-trait scoring. This includes virtually all college evaluations and many pro evaluations where event-level data is unavailable.

How It Works
1. Read full production profile from Player Profile + web-gathered data.
2. Match production to legend tier (Phase 3 anchor).
3. Estimate component KRs (AKR, DKR, TKR, IQKR) from available data.
4. Apply suppression detection if triggered.
5. Apply multi-level protocol if player has data at multiple levels.
6. Synthesize into final KR range. Report component KR estimates, confidence, legend interpretation at each level, "What We Know," "What We Don't Know," "What Changes If."


# SUPPRESSION DETECTION RULES

Suppression Detection Rules (Women's Soccer-Specific)

Suppression occurs when a player's production is artificially depressed by factors external to their ability. Detected suppression adjusts interpretation, not data.

1. Role Suppression
Trigger: Creative player (CAM/W archetype) deployed in a defensive system where their attacking contribution is constrained by tactical role.
Evidence: Player's assist/chance creation numbers are below career norms despite no injury. System change correlates with production drop.
Example: A natural Advanced Playmaker producing 0.12 xA/90 in a Low Block system when career average in possession systems was 0.28 xA/90.

2. System Suppression
Trigger: Striker in a possession-heavy system that does not create clear chances, or a winger in a narrow formation where width is not used.
Evidence: Low shot volume / low touches in box despite good movement and positioning (from video/scouting). Team's overall xG is low despite high possession.
Example: Pressing Forward scoring 3 goals in a Tiki-Taka system where the team refuses to cross. Career average in Wing Play systems was 10 goals/season.

3. Teammate Suppression
Trigger: Winger playing with a fullback who never overlaps, or a striker receiving no service because midfield lacks progressive passing ability.
Evidence: Player's production is significantly below career norms. Teammate quality gap is 15+ KR points below the evaluated player.
Example: Traditional Winger with 1 assist in a season where the fullback behind them has 0 progressive carries and 52% pass accuracy.

4. Injury Suppression
Trigger: Player returning from significant injury, minutes managed, or visibly not at full fitness.
Evidence: Post-injury production significantly below pre-injury career norms. Minutes restricted (subbed off before 65' consistently). Speed/stamina metrics (if tracked) below pre-injury baselines.
Example: Player with career 0.45 G/90 producing 0.18 G/90 in 10 appearances after ACL reconstruction, averaging 55 minutes per match.

ACL-Specific Note: ACL injuries are 2-6x more common in women's soccer than men's. Return-to-play timelines often extend 12-18 months with additional ramp-up. The system must apply ACL suppression detection with a longer expected recovery window than for men's evaluations.

5. Managerial Suppression
Trigger: New manager mid-season changed system, position, or role significantly.
Evidence: Production diverges before/after managerial change. Clear system shift confirmed by OSIE/DSIE.
Example: Inverted Winger producing 7 goals in 12 matches under Manager A (Inside Forward system), then 1 goal in 10 matches under Manager B (Wing Play system requiring crossing instead of cutting inside).

6. Sole Threat (College-Specific)
Trigger: Player accounts for 40%+ of team goals AND no other teammate scores more than 3 goals/season.
Evidence: All defensive attention focused on this player. Opposition scouting reports confirm.
Example: D2 forward with 16 goals but facing double-teams and man-marking every match because no other teammate can score.

7. Level Mismatch
Trigger: Player's home institution competes at a level 3+ KLVN tiers below the matches being analyzed.
Evidence: Team quality gap compounds individual suppression. Player faces higher-level competition with lower-level teammates.

8. Pregnancy/Motherhood Suppression (Women's Soccer-Specific -- MANDATORY)
Trigger: Player has returned from pregnancy/maternity leave within the last 18 months.
Evidence: Post-return production significantly below pre-pregnancy career norms. Physical metrics (if tracked) show reduced speed, stamina, or strength relative to pre-pregnancy baselines. Minutes managed more carefully. Player may still be regaining match fitness.

Detection signals:
- Known pregnancy/maternity leave (publicly disclosed)
- Gap of 4-12 months in career record followed by return
- Post-return production 25%+ below career averages in first 6-12 months back
- Gradual improvement trend across first 12-18 months post-return

Adjustment:
- First 6 months post-return: production weighted at 50% for KR estimation; pre-pregnancy career norms weighted at 50%
- 6-12 months post-return: production weighted at 70%; pre-pregnancy norms at 30%
- 12-18 months post-return: production weighted at 85%; pre-pregnancy norms at 15%
- After 18 months: full current production used; pre-pregnancy norms for context only

CRITICAL: Pregnancy/motherhood status is only used when publicly disclosed by the player. The system never speculates about pregnancy. If a gap in career record is unexplained, the system notes "career gap - reason undisclosed" and uses general injury suppression logic.

9. National Team Duty Suppression
Trigger: Player's club production drops during windows when they are regularly called up for international duty (travel, fatigue, missed training sessions, fixture congestion).
Evidence: Production decline correlates with international windows. Player performs well for national team but club form dips.
This is particularly relevant in women's soccer where national team commitment is often higher (more camps, longer tournaments, mandatory release).

When suppression is detected, Contextual Mode produces BOTH the visible stat-based estimate AND the context-adjusted estimate. Both reported transparently.


# MULTI-LEVEL PROTOCOL

Multi-Level Player Protocol (Women's Soccer)

When a player competes across multiple levels in a single period (e.g., college conference play + nonconference against higher opponents, or club + international duty):

1. Each level's data is evaluated separately through Phases 1-3.
2. Highest-level data carries the most interpretive weight for KR estimation.
3. Lower-level data CONFIRMS capabilities that higher-level data cannot show due to suppression.
4. Cross-level stat divergence is a signal, not noise.
5. Final KR range is anchored to the highest level with meaningful data.
6. KLVN lambdas applied when translating final KR to each level's legend.

Women's Soccer-Specific Multi-Level Scenarios:
- College player with youth national team duty (club + U-20 or U-23 NT)
- College player with senior national team duty (increasingly common at top D1 programs)
- NJCAA player who transferred mid-year to NAIA/D2
- Player with both college and semi-pro/amateur experience (e.g., USL W League summer)
- NWSL player with international duty (club + senior NT)
- Player loaned from NWSL to overseas league or vice versa
- College player who signed NWSL contract mid-year (increasingly common post-draft elimination)
- Player with college, NWSL reserve/second division, and first-team data


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
- Youth National Team history (if any)

At D1 with advanced stats available:
- Goals/90, Assists/90, Shot conversion, xG, xA (some sources)
- Pass completion %, Tackles, Interceptions (some sources via FBref)

At NWSL/WSL with advanced stats:
- Full per-90 metrics from FBref/American Soccer Analysis
- xG, xA, progressive actions, defensive actions, pressures

## THE FIVE STEPS

### STEP 1: COACH CONTEXT
Set the program, level, governing body, division, major class (if D1), formation, offensive system, defensive system. Coach Context is Step 0 regardless of data tier. Binds: KLVN level key, KR legend selection, position OPF.

### STEP 2: PHASE 3 -- PRODUCTION ANCHOR
Map the player's production profile against the KR legend tiers at their level.

Inputs: Goals, assists, minutes, appearances, shot conversion, awards, team success context, role on team, YNT history.

Process: Read the legend tier descriptions at the player's level. Find the tier whose description matches the player's actual production and role.

Output: A KR range (e.g., 82-85) representing where production fits in the legend.

Rules:
- Phase 3 uses the FULL production picture, not just goals
- Phase 3 does NOT project -- evaluates current season only
- Phase 3 does NOT use recruiting rankings, draft projections, or future potential
- For defenders/GKs: team defensive record (GA/match, clean sheets) is a primary input alongside individual stats
- YNT context can validate Phase 3 anchor (player with U-20 USWNT history performing at D1 MM confirms higher-end ability)

### STEP 3: PHASE 6 -- COMPONENT KR ESTIMATION
Score the four component KRs from available data:

AKR estimation:
- Goals/season and shot conversion (strongest signals)
- Assists/season (creation evidence)
- xG/xA overperformance (if available at D1/pro)
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
- ACL history (critical for women's soccer -- prior ACL = elevated re-injury risk)
- Speed/strength: UNSCORED unless scouting data provides qualitative assessment

Women's-specific TKR note: Physical tool benchmarks differ from men's. Speed, strength, and stamina norms are calibrated to women's-specific ranges. A 170cm, 63kg forward is at a very different physical profile point than a 183cm, 78kg male forward. TKR scoring bands in File 02 reflect this.

IQKR estimation:
- Largely UNSCORED at college V1. Estimated from indirect signals:
  - For midfielders: assists relative to position norms (passing intelligence proxy)
  - For defenders: team defensive record relative to roster quality (organizational proxy)
  - For forwards: shot conversion relative to volume (shot selection proxy)
  - YNT experience adds IQKR signal (players who succeed at international level typically have higher tactical IQ)

Each component bounded by Phase 3 anchor expectations.

### STEP 4: PHASE 6 ADJUSTS WITHIN PHASE 3 +/- 10
Same rule as men's soccer and basketball. Phase 3 established anchor. Phase 6 adjusts within that window.

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
Same as men's soccer and basketball. One KR, multiple legend reads. KLVN normalizes inputs, not outputs.

## DATA TIER PROGRESSION

| Data Tier | Traits Scored | Phase 3 Authority | Phase 6 Authority |
|---|---|---|---|
| V1 (college box score) | 7-10 | Primary -- anchors range | Secondary -- adjusts within range |
| V1 (NWSL/WSL box score + composites) | 12-18 | Primary -- anchors range | Growing -- more signals available |
| V1+ (advanced metrics: xG, xA, progressive) | 18-28 | Shared -- validates Phase 6 | Shared -- growing authority |
| V2 (event-level: StatsBomb/Opta 1 season) | 32-42 | Secondary -- validation check | Primary -- drives the KR |
| V3 (multi-season event + tracking) | 45-54 | Minimal -- sanity check only | Full authority -- KR is the math |

## Governance
- V1 Protocol supplements the standard pipeline
- When data tier upgrades, V1 output is superseded
- All V1 outputs flagged as V1_EVALUATION with confidence cap
- Phase 3 anchor logged alongside Phase 6 for audit trail
