# Men's Volleyball Player Evaluation Process v1

---

## 0. SCOPE

This is the single authoritative document for the men's volleyball player evaluation pipeline. It defines how a player enters the system, how data is gathered, how the evaluation proceeds through phases, how suppression is detected, and how the final KR is produced.

This file defines the PROCESS. File 02 (Player Eval Reference) contains the DATA (trait bands, OPF weights, legends, archetypes, KLVN lambdas).

---

## 1. COACH CONTEXT SETUP

Coach Context defines the binding environment for all downstream evaluation. No player evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Program Name**
2. **Governing Body** - NCAA (primary), NAIA (limited men's VB programs), or club/independent
3. **Division** (if applicable) - NCAA: D1/D2/D3
4. **Conference** (critical for men's VB due to limited programs) - MPSF, EIVA, Big West, MIVA, Conference Carolinas, or other
5. **Offensive System** - must match one of the 6 defined offensive systems: 5-1, 6-2, Swing Offense, Fast Tempo, Slide-Heavy, Pipe-Heavy
6. **Defensive System** - must match one of the 5 defined defensive systems: Rotation Defense, Perimeter Defense, Man-Up, Read Block, Commit Block

These fields bind: KLVN normalization bands, KR legend interpretation, position trait weighting, system fit computation, system demand profiles, and confidence gate ranges.

### Optional Metadata
1. Home Arena / Facility Notes
2. Spring season schedule conflicts (baseball, track sharing gym time or recruits)

### Optional Constraints (Downstream Only)
These fields do not alter trait scoring, position weighting, system fit, or Base KR computation. They are consumed only by downstream planning and recommendation systems.

1. Scholarships Available (NCAA D1/D2 max 4.5 full equivalents - this is critical context)
2. Operating Budget
3. Recruiting Budget
4. Roster Size Target (typical: 18-22 for men's programs, larger due to walk-on dependence)
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
- Country (international players are common in men's college volleyball)
- High school
- Club volleyball program (USAV, AAU, or equivalent)
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
1. Pull the legend for the player's level (from Legend files)
2. Map each major statistical category against legend tier benchmarks
3. Consider role context: starter? six-rotation player? specialist?
4. Consider team context: ranked team? conference contender? rebuilding?
5. Set the Phase 3 anchor range (e.g., "85-90" based on production profile)

**The Phase 3 anchor is truth.** It is the production-based reality of what this player does at his level. Phase 6 math can adjust within +/-10 of this anchor but cannot override it.

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
4. Apply proxy confidence weighting (v0.2) for traits not directly measured
5. Compute the component KR as the weighted average of scored traits

### Step 5: Compute Base KR
Apply the position OPF (Overall Performance Formula) to weight the 6 component KRs:

```
Base_KR = SUM(Component_KR_i * OPF_Weight_i) for all 6 components
```

### Step 6: Phase 3/Phase 6 Reconciliation
Compare Base_KR to the Phase 3 anchor range.

- If Base_KR is within the Phase 3 anchor range: Final_KR = Base_KR
- If Base_KR is up to 10 points above the Phase 3 anchor range: Final_KR = top of anchor range + partial credit (50% of the overshoot)
- If Base_KR is up to 10 points below the Phase 3 anchor range: Final_KR = bottom of anchor range - partial credit (50% of the undershoot)
- If Base_KR is more than 10 points outside the Phase 3 anchor: FLAG - reevaluate both Phase 3 and Phase 6. Something is wrong.

### Step 7: System Fit
Compute system fit for the locked offensive and defensive systems:

```
System_Fit_Score = f(archetype match, component KR alignment with system demands, position demand tier)
```

```
Final_System_Off_KR = Final_KR + System_Off_Fit_Modifier
Final_System_Def_KR = Final_KR + System_Def_Fit_Modifier
```

System fit modifiers range from -5 to +5.

### Step 8: Output
Produce the full evaluation card with all mandatory fields (see Section 8 for format).

---

## 5. FULL EVALUATION OUTPUT FORMAT

```
PLAYER EVALUATION CARD
=======================
Player: [Full Name]
Position: [Position]
Height: [X'X"] | Reach: [XX"] | Block Touch: [XX"] | Jump Touch: [XX"]
Team: [School/Club]
Level: [Level] | Conference: [Conference]
Season: [Year]
Data Tier: V[X]

FINAL KR: [XX.X]
  Confidence: [XX]%
  Phase 3 Anchor: [XX-XX]

COMPONENT KRs:
  AKR (Attack):     [XX.X] | Weight: [XX]%
  BKR (Block):      [XX.X] | Weight: [XX]%
  DKR (Dig/Defense): [XX.X] | Weight: [XX]%
  SVR (Serve):      [XX.X] | Weight: [XX]%
  SKR (Set):        [XX.X] | Weight: [XX]%
  IQKR (VB IQ):     [XX.X] | Weight: [XX]%

ARCHETYPE: [Primary] (Secondary: [if applicable])
BADGES: [List]

SYSTEM FIT:
  Offensive System ([System]): [XX]% fit
  Defensive System ([System]): [XX]% fit
  System Off KR: [XX.X] | System Def KR: [XX.X]

LEVEL TIER MAP:
  NCAA D1:  [Legend tier label]
  NCAA D2:  [Legend tier label]
  NCAA D3:  [Legend tier label]
  Pro:      [Legend tier label]

KEY PRODUCTION (per set):
  [Kills/set] | [Hitting%] | [Assists/set] | [Aces/set] | [Digs/set] | [Blocks/set]

NARRATIVE:
  [2-4 sentences describing the player's game, strengths, limitations, and projection]

SUPPRESSION FLAGS: [If any]
```

---

## 6. SUPPRESSION DETECTION

### 6.1 Role Suppression
**Definition:** Player's stats are artificially low because the coaching staff limits his role, not because of inability.

**Detection signals:**
- High per-attempt efficiency but low volume (kills/set low, hitting% high)
- Strong production in limited appearances (comes in and produces immediately)
- Starter on a loaded roster with multiple high-KR players at the same position
- Prior season production significantly higher at same or similar level
- Known recruit ranking or transfer pedigree inconsistent with current role

**Adjustment:**
- Use per-attempt efficiency as the primary scoring input, not volume
- Widen the confidence range
- Flag: "ROLE SUPPRESSION DETECTED - evaluate per-attempt efficiency, not volume"

### 6.2 System Suppression
**Definition:** Player's production is limited by the system he plays in, not his ability.

**Detection signals:**
- Team runs a system that does not feature his position (e.g., a power OH in a system that runs everything through the middle)
- Low attack attempts despite being the most athletic attacker
- Setter is not running sets to his position
- Transfer from a different system showed different production profile

**Adjustment:**
- Project production in optimal system
- Use system-neutral component scoring where possible
- Flag: "SYSTEM SUPPRESSION DETECTED - project in optimal system: [XX-XX]"

### 6.3 Injury Suppression
**Definition:** Player is playing through an injury that limits production.

**Detection signals:**
- Clear statistical drop-off mid-season (check game logs)
- Reduced sets played in recent matches
- Known injury report
- Pre-injury production significantly higher

**Adjustment:**
- Evaluate pre-injury production as a valid anchor
- Current production establishes the floor
- Flag: "INJURY SUPPRESSION DETECTED - pre-injury anchor: [XX], current floor: [XX]"

### 6.4 Teammate Quality Suppression
**Definition:** Player's individual stats are depressed because his teammates cannot get him the ball effectively, or team-level dysfunction limits everyone's production.

**Detection signals:**
- High-talent player on a low-winning-percentage team
- Poor setting quality depresses hitter stats
- Transfer from a weak program shows immediate statistical improvement at new school
- Strong club/national team production vs poor college production

**Adjustment:**
- Consider club, national team, or prior school production as supplementary evidence
- Widen confidence range
- Flag: "TEAMMATE QUALITY SUPPRESSION - evaluate individual skill level independent of team context"

### 6.5 International Transition Suppression
**Definition:** International players (common in men's college volleyball) may show depressed early-season stats due to adjusting to NCAA rules, American ball, different training culture, or language barriers.

**Detection signals:**
- International player in first US season
- Stats improving significantly as season progresses
- Strong international club or national team pedigree
- Game log shows marked improvement after first 10-15 sets

**Adjustment:**
- Weight second-half-of-season production more heavily
- Consider international pedigree as a data signal
- Flag: "INTERNATIONAL TRANSITION SUPPRESSION - weight recent production, consider pedigree"

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
- **Level transition:** first year at new level (transfer, freshman, international arrival) -> downshift 5 pts until mid-season sample established
- **Multi-year stability:** 2+ seasons of consistent production at same level -> upshift 3-5 pts toward top of range
- **Suppression detected:** any suppression flag -> widen range by 5 pts in each direction
- **Small program factor:** if program has fewer than 5 years of history, reduce confidence by 3-5 pts (less baseline data)

---

## 8. POSITION-SPECIFIC EVALUATION FLOW

### 8.1 Setter Evaluation
The setter is the most important position in volleyball. Setter evaluation is fundamentally different from all other positions.

**Primary evaluation axis:** Does this setter make the hitters around him better?

**Setter-specific data points (V1):**
- Assists/set (context-dependent)
- Assist-to-error ratio (ball handling errors)
- Set distribution: does he spread the offense or lean on one hitter?
- Dump/tip kills (setter attacks - men's setters dump more aggressively due to higher net position when jumping)
- Digs/set (setters must defend in back row)
- Serve metrics (men's setters often have strong serves)
- Team hitting percentage (the setter's offense is reflected in the team's collective hitting%)

**Setter-specific evaluation questions:**
1. Does the team hit better or worse when this setter is on vs off?
2. Does he distribute to all hitters or telegraph to one?
3. Can he set out of system (bad pass -> still a hittable set)?
4. Does he make good decisions under pressure?
5. Is he a serving liability or asset?
6. Can he run a fast tempo offense?
7. How effective is his dump/tip game? (Men's setters are more physically imposing at the net)

**SKR is weighted 40% in setter OPF.** No other position weights any single component above 30%.

### 8.2 Outside Hitter Evaluation
The most versatile position. Must hit, pass, serve, dig, and block.

**OH-specific evaluation focus:**
- Six-rotation capability: can he play all 6 rotations or does he sub out in back row?
- Serve receive: OHs are primary passers. Serve receive rating is critical.
- Transition attack: kills out of system and in transition
- Left-side hitting: can he hit effectively against a double block from the left pin?
- Back-row attack capability (pipe)
- Arm swing speed and power (men's OHs generate significantly more power than women's)

**Key question:** Is this a six-rotation OH or a front-row-only OH? Six-rotation OHs are dramatically more valuable.

### 8.3 Middle Blocker Evaluation
The rim protector of volleyball. Quick attacks and blocking.

**MB-specific evaluation focus:**
- Block rate (solo + assists per set): the primary stat
- Quick attack hitting percentage: men's middles should hit .350+ at high levels
- Slide attack capability
- Transition off the block: can he land from a block and immediately transition to attack?
- Athleticism at the higher net (2.43m demands more from middles)
- Back row: most MBs sub out for a libero in back row

**Key consideration:** Men's middles have higher hitting percentages than women's middles because the quick attack tempo is faster and more aggressive in the men's game. Benchmark accordingly.

### 8.4 Opposite/Right Side Evaluation
Primary scoring option from the right side. Often the most powerful attacker on the team.

**OPP-specific evaluation focus:**
- Kill volume and efficiency from right side
- Ability to hit against a set double or triple block
- Right-side blocking (blocking the opponent's OH from position 2)
- Back-row attack capability (right-side pipe)
- In men's volleyball, the opposite is often the primary scorer (more than OH in many systems)
- Jump serve capability (many OPPs are also the team's best servers)

**Key question:** The men's opposite is often THE go-to scorer. Evaluate both volume and efficiency heavily.

### 8.5 Libero Evaluation
Defensive specialist who cannot attack above net height.

**Libero-specific evaluation focus:**
- Digs/set: the primary stat
- Serve receive pass rating: this is often THE most important skill for a libero
- Platform consistency
- Range and pursuit: can he get to balls outside his primary zone?
- Communication and leadership
- Handling the men's jump serve: men's liberos face significantly harder serves than women's liberos. The ability to receive a 70+ mph jump serve cleanly is elite.

**Libero evaluation has NO AKR and minimal BKR.** The OPF for liberos weights DKR at 55%, IQKR at 25%, SVR at 15% (liberos can serve in one rotation), SKR at 5% (emergency sets).

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
  NCAA D1:    [Legend tier label at this level]
  NCAA D2:    [Legend tier label]
  NCAA D3:    [Legend tier label]
  Pro:        [Legend tier label]
```

**Rules:**
- KR is ONE number. The Level Tier Map shows how that ONE number is INTERPRETED at different levels.
- Do NOT produce multiple KRs. Do NOT "convert" KR between levels.
- The Level Tier Map is a display tool for understanding where a player fits across the competitive landscape.
- Men's volleyball has fewer levels than women's (no NJCAA, CCCAA, or NAIA programs of significance). The map reflects this smaller landscape.

---

## 10. GOVERNANCE

- All process changes require versioning (v1 -> v2 etc.)
- The Phase 3 anchor is truth. The math is confirmation. Not the other way around.
- No evaluation can proceed without Coach Context locked
- All outputs must include confidence %
- Suppression detection is mandatory, not optional
- International transition suppression handling is particularly important for men's volleyball given the high percentage of international players
- Position-specific OPF weights are governed in File 02 and cannot be modified here
- Men's benchmarks are distinct from women's. Never cross-apply.
