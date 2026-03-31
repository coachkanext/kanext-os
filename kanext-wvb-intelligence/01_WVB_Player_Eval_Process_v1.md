# Women's Volleyball Player Evaluation Process v1

---

## 0. SCOPE

This is the single authoritative document for the women's volleyball player evaluation pipeline. It defines how a player enters the system, how data is gathered, how the evaluation proceeds through phases, how suppression is detected, and how the final KR is produced.

This file defines the PROCESS. File 02 (Player Eval Reference) contains the DATA (trait bands, OPF weights, legends, archetypes, KLVN lambdas).

---

## 1. COACH CONTEXT SETUP

Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Program Name**
2. **Governing Body** - NCAA, NAIA, NJCAA, CCCAA
3. **Division** (if applicable) - NCAA: D1/D2/D3, NJCAA: D1/D2/D3
4. **Major Class** (required only if NCAA D1) - Power 4, Mid-Major, Low-Major
5. **Offensive System** - must match one of the 6 defined offensive systems: 5-1, 6-2, Swing Offense, Fast Tempo, Slide-Heavy, Pipe-Heavy
6. **Defensive System** - must match one of the 5 defined defensive systems: Rotation Defense, Perimeter Defense, Man-Up, Read Block, Commit Block

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

### Optional Metadata
1. Conference - non-blocking if blank. Used by KLVN for D1 Major Class auto-assignment.
2. Home Arena / Facility Notes

### Optional Constraints (Downstream Only)
These fields do not alter trait scoring, position weighting, system fit, or Base KR computation. They are consumed only by downstream planning and recommendation systems.

1. Scholarships Available (NCAA D1/D2 max 12 full equivalents; NAIA max 8; NJCAA D1 max 14 tuition-only)
2. Operating Budget
3. Recruiting Budget
4. Roster Size Target (typical: 16-20)
5. Staffing Capacity Band - Lean, Standard, Elite

### Context Lock
When all required fields (1-6) are populated and validated, system state transitions to Coach Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

---

## 2. PLAYER PROFILE (Auto-Populated Record)

### A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth
- Age (derived)
- Height (current) + height history (if available)
- Standing reach / block touch height (if available)
- Approach jump touch (if available)
- Handedness (left-handed hitters are tactically valuable, especially as opposites)
- Declared position(s) (source-listed only)
- City/Town of origin
- State/Province
- Country
- High school
- Club volleyball program (USAV, AAU, JVA, or equivalent)
- Current team affiliation

### B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- League / competition level
- Season/year label
- Sets played
- Matches played
- Role (starter, rotation player, specialist)

### C) Raw On-Court Production (Season-by-Season)
For each season, per-set and total:
- Sets played
- Kills
- Attack attempts
- Attack errors
- Hitting percentage = (Kills - Errors) / Attempts
- Assists
- Set attempts (if available)
- Aces
- Service errors
- Serve attempts (if available)
- Digs
- Solo blocks
- Block assists
- Block errors (if available)
- Ball handling errors
- Points (kills + aces + solo blocks)
- Serve receive attempts and pass rating (0-3 scale, if available)
- Per-set rates: kills/set, assists/set, aces/set, digs/set, blocks/set

### D) Academic Record (Public/Declared Only)
- GPA (if available)
- Academic honors (if available)
- Eligibility status (if available)

### E) Declared Medical Information (Public Only)
- Declared injuries (if available)
- Pregnancy/maternity leave (if publicly stated)
- Return timeline (if available)

### F) Awards and Recognition
- All-Conference selections
- Conference Player of the Year
- All-American selections (AVCA)
- All-Region
- Conference weekly honors
- National statistical rankings
- National team / youth national team selections

---

## 3. DATA TIERS

| Tier | Definition |
|------|-----------|
| V1 - Stats Only | Public box scores, per-set stats, season totals. No video data. |
| V1+ - Stats + Licensed | V1 + third-party data (DataVolley exports, synergy-equivalent). Play-by-play level data. |
| V2 - Video (1 Season) | KaNeXT-owned or partner video data. Full rotation tracking, serve receive grading, shot selection. |
| V3 - Video Deep (Multi-Season) | Multiple seasons of video data + historical film. Highest fidelity. |

---

## 4. V1 EVALUATION PROTOCOL

This is the standard protocol for evaluating a player using publicly available statistics. Most evaluations of real players using web-sourced data are V1.

### Step 1: Set Coach Context
Lock all required fields (program, level, systems). If evaluating a player at a different program than the locked context, note the discrepancy and evaluate against BOTH the player's actual context and the locked program context (for fit assessment).

### Step 2: Gather Data
Follow the Data Gathering Protocol (SKILL.md):
1. Pool check for cached data
2. Web search for current season stats (NCAA stats, school website, conference stats)
3. Secondary sources if needed
4. Compile per-set production rates

**Minimum data for V1 evaluation:**
- Sets played (minimum 30 sets for full confidence; 15-29 = reduced confidence; under 15 = provisional only)
- Kills/set, hitting percentage, assists/set, aces/set, digs/set, blocks/set
- Position and role context (starter, rotation, specialist)
- Team record and competitive context

### Step 3: Phase 3 - Production Anchor
This is the foundation. Map the player's per-set production and role against the legend for their competitive level.

**Process:**
1. Pull the legend for the player's level (from File 02)
2. Map each major statistical category against legend tier benchmarks
3. Consider role context: starter? six-rotation player? specialist?
4. Consider team context: ranked team? conference contender? rebuilding?
5. Set the Phase 3 anchor range (e.g., "85-90" based on production profile)

**The Phase 3 anchor is truth.** It is the production-based reality of what this player does at her level. Phase 6 math can adjust within +/-10 of this anchor but cannot override it.

**Anchor against production profile numbers, not award labels.** "All-American = 95+" is a label trap. The production profile numbers are the anchor. An All-American at a weak program with inflated stats anchors lower than the label suggests. A non-All-American on a loaded roster running a balanced attack may anchor higher than the label suggests.

### Step 4: Phase 6 - Component KR Scoring
Score all 6 component KRs using the trait bands and OPF weights from File 02.

**6 Component KRs:**

| Component | Abbreviation | Primary Stats (V1) |
|-----------|-------------|-------------------|
| Attack | AKR | Kills/set, hitting%, attack attempts, kill efficiency |
| Block | BKR | Blocks/set (solo + assists), block errors |
| Dig/Defense | DKR | Digs/set, serve receive pass rating (if available) |
| Serve | SVR | Aces/set, ace-to-error ratio, service errors |
| Set | SKR | Assists/set, assist-to-error ratio, set distribution |
| Volleyball IQ | IQKR | Inferred from context: clutch performance, consistency, leadership awards, coach quotes |

**Scoring each component:**
1. Pull the trait bands for the component from File 02
2. KLVN-normalize the raw stats using the player's level lambda
3. Score each available trait within the component
4. Weight the traits per the component structure in File 02
5. Produce the component KR (0-100 scale)

**OPF (Overall Performance Formula):**
Apply position-specific OPF weights to produce the composite KR.
- OPF weights differ by position (a setter weights SKR at 40%; an OH weights AKR at 30%)
- OPF weights differ by level (college vs pro)
- Pull exact weights from File 02 "POSITION OPF WEIGHTS"

**Composite Bounding v0.3:**
No single component can contribute more than 45% of the final composite, even if OPF assigns higher weight. This prevents a dominant single skill from inflating overall KR.

**Proxy Confidence Weighting v0.2:**
- Stats with direct measurement (kills, blocks, aces) get full weight (1.0)
- Stats inferred from proxy data (serve receive rating from team context, IQ from awards) get reduced weight (0.6-0.8)
- IQKR at V1 is always proxy-weighted at 0.6 (cannot directly measure IQ from box score)

### Step 5: Phase 6 Adjusts Within Phase 3 +/-10
The Phase 6 composite KR must fall within +/-10 of the Phase 3 anchor range midpoint.

- If Phase 6 math produces a KR more than 10 points above the Phase 3 anchor midpoint, cap at anchor midpoint + 10
- If Phase 6 math produces a KR more than 10 points below the Phase 3 anchor midpoint, floor at anchor midpoint - 10
- If within range, use Phase 6 math as the final KR

**If a significant gap exists between Phase 3 and Phase 6, investigate:**
- Is there a suppression factor not yet detected?
- Is the legend calibration off for this level?
- Is the player in a role that limits statistical production?
- Are the stats misleading (e.g., high kills/set on terrible hitting percentage)?

### Step 6: Final KR Output
Produce the final evaluation card:

```
PLAYER EVALUATION CARD
======================
Player: [Name]
Position: [Position]
Level: [Level] | Conference: [Conference]
Team: [School] | Record: [W-L]
Data Tier: V1 | Sets Played: [N]

FINAL KR: [XX.X]
Confidence: [XX]%

Component KRs:
  AKR (Attack):      [XX.X]
  BKR (Block):       [XX.X]
  DKR (Dig/Defense): [XX.X]
  SVR (Serve):       [XX.X]
  SKR (Set):         [XX.X]
  IQKR (VB IQ):      [XX.X]

Phase 3 Anchor: [XX-XX]
Phase 6 Composite: [XX.X]
Adjustment: [None / Capped at +10 / Floored at -10]

Archetype: [Primary Archetype]
Badges: [List]
System Fit: [Current system fit%]

LEVEL TIER MAP:
  [Level 1]: [Legend tier label]
  [Level 2]: [Legend tier label]
  [Level 3]: [Legend tier label]

KEY PRODUCTION (per set):
  [Stat 1]: [Value] | [Stat 2]: [Value] | [Stat 3]: [Value]
  Hitting%: [.XXX] | [Other key stats]

SCOUTING NOTES:
  [2-3 sentences of evaluative context]

SUPPRESSION FLAGS: [None / List]
```

---

## 5. MASTER EXECUTION FLOW (V1+ / V2 / V3)

For evaluations with video data or advanced tracking available:

### Phase 1: Data Intake
- Ingest all available data (box score + video metrics + serve receive grading + shot charts)
- Validate data completeness
- Flag missing components

### Phase 2: Trait Scoring
- Score every available trait in the Trait Library (File 02)
- KLVN-normalize raw inputs
- Flag unscored traits
- Produce cluster-level scores for all 6 clusters

### Phase 3: Production Anchor
- Same as V1 Phase 3 but with higher confidence
- Use per-set production + video-derived context
- Set anchor range

### Phase 4: Archetype Assignment
- Map trait profile against Archetype Library (File 02)
- Assign primary archetype
- Flag secondary archetype if applicable (must meet 80%+ match threshold)

### Phase 5: Badge and Override Check
- Check all badge conditions (File 02 "BADGES")
- Check override conditions (File 02 "OVERRIDES")
- Check system risk conditions (File 02 "SYSTEM RISKS")

### Phase 6: OPF Composite
- Apply position-specific OPF weights
- Apply composite bounding v0.3
- Apply proxy confidence weighting v0.2 (less impactful at V2/V3 since more data is direct)
- Produce composite KR
- Adjust within Phase 3 +/-10

### Phase 7: System Fit
- Compute system fit against ALL 6 offensive and 5 defensive systems
- Produce system-specific offensive and defensive KRs
- Final_System_Off_KR = Base_Off_KR * System_Fit_Offense modifier
- Final_System_Def_KR = Base_Def_KR * System_Fit_Defense modifier

### Phase 8: Confidence Gate
- Compute evaluation confidence % based on data tier, sample size, and recency
- Output final evaluation card

---

## 6. SUPPRESSION DETECTION

Suppression occurs when a player's production is artificially depressed by factors outside her control. If detected, the evaluation must flag the suppression type and adjust the confidence range (widen it).

### 6.1 Role Suppression
**Definition:** Player's production is limited because she plays behind a senior starter, an All-American at her position, or shares rotations with another strong player.

**Detection signals:**
- Low sets played relative to team total (starter plays ~100+ sets in a 30-match season)
- Strong production rates in limited sets (e.g., high kills/set in only 40 sets played)
- Transfer from a loaded program
- Known depth chart position (redshirt, backup)
- Conference weekly honors or tournament MVPs in spot starts

**Adjustment:**
- Do NOT inflate KR to compensate
- Widen the confidence range (+/-5 additional points)
- Note projected range if given full starter sets
- Flag: "ROLE SUPPRESSION DETECTED - production evaluated against opportunity, not volume"

### 6.2 System Suppression
**Definition:** Player's production is depressed because the team runs a system that limits her role.

**Detection signals:**
- A 6-2 system limits setter scoring opportunities vs 5-1
- A perimeter-heavy offense limits middle blocker attack attempts
- A team that does not run pipe attacks limits back-row scoring from OHs
- An offense that runs mostly high sets limits a middle who excels at quick tempo

**Adjustment:**
- Widen confidence range
- Evaluate opportunity production (what she does when she gets chances) against volume production
- Flag: "SYSTEM SUPPRESSION DETECTED - offensive system limits [specific aspect]"

### 6.3 Injury Suppression
**Definition:** Player's production is depressed due to playing through injury or returning from injury.

**Detection signals:**
- Known injury history (ACL, shoulder, ankle are common in volleyball)
- Production drop-off mid-season or year-over-year
- Reduced role after return from injury
- Physical limitations noted in reports (reduced jump height, limited mobility)

**Adjustment:**
- Evaluate pre-injury production as the primary anchor if sufficient sample exists
- Current production establishes the floor
- Widen confidence range significantly
- Flag: "INJURY SUPPRESSION DETECTED - [injury type], pre-injury anchor: [XX], current floor: [XX]"

### 6.4 Pregnancy/Motherhood Suppression
**Definition:** Player's production is depressed due to pregnancy, postpartum recovery, or the demands of motherhood affecting training and competition.

**This is mandatory to detect and handle with care.**

**Detection signals:**
- Gap in competitive record (1-2 seasons missing)
- Return to competition after absence with reduced production
- Public information about pregnancy/maternity
- Age pattern suggesting maternity leave window

**Adjustment:**
- Evaluate pre-pregnancy production as a valid baseline
- Current production establishes the post-return floor
- Project a recovery trajectory (most athletes who return regain 85-95% of pre-pregnancy production within 1-2 full seasons)
- Do NOT penalize the gap in the career record
- Widen confidence range
- Flag: "PREGNANCY/MOTHERHOOD SUPPRESSION DETECTED - pre-pregnancy baseline: [XX], current floor: [XX], projected recovery trajectory: [XX-XX over N seasons]"

### 6.5 Teammate Quality Suppression
**Definition:** Player's individual stats are depressed because her teammates cannot get her the ball effectively, or team-level dysfunction limits everyone's production.

**Detection signals:**
- High-talent player on a low-winning-percentage team
- Poor setting quality depresses hitter stats (low hitting% on a team with a weak setter)
- Transfer from a weak program shows immediate statistical improvement at new school
- Strong club/national team production vs poor college production

**Adjustment:**
- Consider club, national team, or prior school production as supplementary evidence
- Widen confidence range
- Flag: "TEAMMATE QUALITY SUPPRESSION - evaluate individual skill level independent of team context"

---

## 7. CONFIDENCE GATE

### Evaluation Confidence Table

| Data Available | Confidence % Range |
|---------------|-------------------|
| V1 stats only: season stats + per-set rates, 30+ sets | 55-70% |
| V1 stats only + multi-year (returning starter) | 60-78% |
| V1+ licensed data: DataVolley + play-by-play (1 year) | 72-85% |
| V1+ licensed + multi-year | 78-90% |
| V2 Video (1 season): 10+ matches processed | 82-92% |
| V2 Video high coverage: 20+ matches + stable rotation | 87-95% |
| V3 Video Deep: multi-season + full film archive | 90-97% |

### Confidence Adjusters (apply within the chosen range)
- **Sample size:** fewer than 30 sets this season -> use bottom of range
- **Recency:** last 5 matches show clear shift (injury, lineup change, system change) -> downshift 5-10 pts
- **Roster volatility:** rotation not stable or significant lineup changes -> downshift 5-10 pts
- **Level transition:** first year at new level (transfer, freshman) -> downshift 5 pts until mid-season sample established
- **Multi-year stability:** 2+ seasons of consistent production at same level -> upshift 3-5 pts toward top of range
- **Suppression detected:** any suppression flag -> widen range by 5 pts in each direction

---

## 8. POSITION-SPECIFIC EVALUATION FLOW

### 8.1 Setter Evaluation
The setter is the most important position in volleyball. Setter evaluation is fundamentally different from all other positions.

**Primary evaluation axis:** Does this setter make the hitters around her better?

**Setter-specific data points (V1):**
- Assists/set (context-dependent: a setter on a team that wins in 3 sets has fewer assist opportunities than one who goes to 5)
- Assist-to-error ratio (ball handling errors)
- Set distribution: does she spread the offense or lean on one hitter?
- Dump/tip kills (setter attacks)
- Digs/set (setters must defend in back row)
- Serve metrics (some setters are also strong servers)
- Team hitting percentage (the setter's offense is reflected in the team's collective hitting%)

**Setter-specific evaluation questions:**
1. Does the team hit better or worse when this setter is on vs off?
2. Does she distribute to all hitters or telegraph to one?
3. Can she set out of system (bad pass -> still a hittable set)?
4. Does she make good decisions under pressure (tight set scores, fifth set)?
5. Is she a serving liability or asset?
6. Can she run a quick tempo offense?

**SKR is weighted 40% in setter OPF.** No other position weights any single component above 30%.

### 8.2 Outside Hitter Evaluation
The most versatile position. Must hit, pass, serve, dig, and block.

**OH-specific evaluation focus:**
- Six-rotation capability: can she play all 6 rotations or does she sub out in back row?
- Serve receive: OHs are primary passers. Serve receive rating is critical.
- Transition attack: kills out of system and in transition
- Left-side hitting: can she hit effectively against a double block?
- Defensive floor play in back row

**Key question:** Is this a six-rotation OH or a front-row-only OH? Six-rotation OHs are dramatically more valuable.

### 8.3 Middle Blocker Evaluation
Rim protector of volleyball. Quick attacks and blocking.

**MB-specific evaluation focus:**
- Block rate (solo + assists per set): the primary stat
- Quick attack hitting percentage: middles should hit .300+ at high levels
- Slide attack capability
- Transition off the block: can she land from a block and immediately transition to attack?
- Back row limitations: most MBs sub out for a libero in back row

**Key consideration:** Middles have the fewest attack attempts of any attacker because they hit quick sets. Per-attempt efficiency (hitting%) matters more than volume (kills/set).

### 8.4 Opposite/Right Side Evaluation
Primary scoring option from the right side.

**OPP-specific evaluation focus:**
- Kill volume and efficiency from right side
- Ability to hit against a double or triple block
- Right-side blocking
- Back-row attack capability (right-side pipe)
- Less defensive responsibility than OH - but some programs ask OPPs to pass

**Key question:** Is this a pure scorer or does she contribute in other phases?

### 8.5 Libero Evaluation
Defensive specialist who cannot attack above net height.

**Libero-specific evaluation focus:**
- Digs/set: the primary stat
- Serve receive pass rating: this is often THE most important skill for a libero
- Platform consistency: does she pass to target consistently?
- Range and pursuit: can she get to balls outside her primary zone?
- Communication and leadership: liberos are often the defensive quarterback

**Libero evaluation has NO AKR and minimal BKR (by rule, liberos cannot block or attack above net height).** The OPF for liberos weights DKR at 55%, IQKR at 25%, SVR at 15% (liberos can serve in one rotation), SKR at 5% (emergency sets).

### 8.6 Defensive Specialist Evaluation
Comes in for back-row rotations.

**DS-specific evaluation focus:**
- Digs/set in limited rotations
- Serve receive quality (often the primary reason a DS enters)
- Serving quality
- Limited sample size is inherent - adjust confidence accordingly

---

## 9. LEVEL TIER MAP

After producing the Final KR, generate the Level Tier Map showing how this player's KR reads against every relevant level legend.

**Format:**
```
LEVEL TIER MAP:
  NCAA D1 Power 4:  [Legend tier label at this level]
  NCAA D1 Mid-Major: [Legend tier label]
  NCAA D1 Low-Major: [Legend tier label]
  NCAA D2:          [Legend tier label]
  NCAA D3:          [Legend tier label]
  NAIA:             [Legend tier label]
  NJCAA D1:         [Legend tier label]
  PVF (Pro):        [Legend tier label]
```

**Rules:**
- KR is ONE number. The Level Tier Map shows how that ONE number is INTERPRETED at different levels.
- Do NOT produce multiple KRs. Do NOT "convert" KR between levels.
- The Level Tier Map is a display tool for understanding where a player fits across the competitive landscape.

---

## 10. GOVERNANCE

- All process changes require versioning (v1 -> v2 etc.)
- The Phase 3 anchor is truth. The math is confirmation. Not the other way around.
- No evaluation can proceed without Coach Context locked
- All outputs must include confidence %
- Suppression detection is mandatory, not optional
- Pregnancy/motherhood suppression handling is mandatory
- Position-specific OPF weights are governed in File 02 and cannot be modified here
