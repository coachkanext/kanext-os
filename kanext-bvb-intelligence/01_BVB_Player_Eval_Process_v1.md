# Beach Volleyball Player Evaluation Process v1

---

## 0. SCOPE

This is the single authoritative document for the beach volleyball player evaluation pipeline. It defines how a player enters the system, how data is gathered, how the evaluation proceeds through phases, how suppression is detected, and how the final KR is produced.

This file defines the PROCESS. File 02 (Player Eval Reference) contains the DATA (trait bands, OPF weights, legends, archetypes, KLVN lambdas).

Beach volleyball evaluates INDIVIDUALS first, then PARTNERSHIPS. Individual KR captures what a player brings regardless of partner. Partnership KR (File 03) captures the synergy between two specific players.

---

## 1. COACH CONTEXT SETUP

Coach Context defines the binding environment for all downstream evaluation. No player evaluation, partnership evaluation, simulation, or scouting output can execute until Coach Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Program Name** (for college) or **Pair Identity** (for pro/club)
2. **Governing Body** - NCAA, AVP, FIVB, Club/Recreational
3. **Level** - NCAA Women's Beach, Club Men's Beach, AVP Pro, FIVB Beach Pro Tour, International (Olympics/World Championships)
4. **Gender** - Men's or Women's (production benchmarks differ significantly)

These fields bind: KLVN normalization bands, KR legend interpretation, trait weighting, and confidence gate ranges.

### Optional Metadata (College-Specific)
1. Conference (non-blocking if blank)
2. Home venue type (permanent sand court vs temporary setup)
3. Indoor volleyball program affiliation (many college beach players also play indoor)

### Optional Constraints (Downstream Only)
These fields do not alter trait scoring or Base KR computation. They are consumed only by downstream planning and recommendation systems.

1. Scholarships Available (NCAA Women's Beach max 6 full equivalents)
2. Operating Budget
3. Recruiting Budget
4. Squad Size Target (6 pairs = 12 athletes minimum, most carry 14-16)
5. Indoor Program Overlap (how many roster spots are shared with indoor program)

### Context Lock
When all required fields (1-4) are populated and validated, system state transitions to Coach Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

---

## 2. PLAYER PROFILE (Auto-Populated Record)

### A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth
- Age (derived)
- Height (current)
- Wingspan / reach (if available)
- Standing reach and block touch (if available)
- Vertical jump on sand (if available - significantly different from indoor/hardcourt vertical)
- Handedness (left-handed attackers create different angles on the right side)
- Primary role: Blocker, Defender, or Switch (plays both sides)
- City/Town of origin
- State/Province
- Country
- High school (if applicable)
- Indoor volleyball program (current or former)
- Current beach partner(s)
- Beach volleyball club or tour affiliation

### B) Career Record (Season-by-Season)
For each competitive season:
- Partner name(s) - critical for context
- Tour/league/level
- Season/year label
- Matches played
- Sets played
- Win-loss record (individual/pair)
- Tournament results (finishes, placement)

### C) Raw On-Court Production (Season-by-Season)
For each season, per-match and total:
- Matches played
- Sets played
- Kills
- Attack attempts
- Attack errors
- Hitting percentage = (Kills - Errors) / Attempts
- Aces
- Service errors
- Serve attempts (if available)
- Digs
- Blocks (solo and assist - in beach, solo blocks are far more common)
- Ball handling errors
- Points (kills + aces + blocks)
- Per-match rates: kills/match, aces/match, digs/match, blocks/match
- Per-set rates (secondary): kills/set, aces/set, digs/set, blocks/set

### D) Partnership Record
For each partnership:
- Partner name
- Duration (seasons/matches together)
- Win-loss record as a pair
- Best tournament finish
- Head-to-head record against notable opponents
- Notes on role distribution (who blocks, who defends, do they switch)

### E) Academic Record (Public/Declared Only - College)
- GPA (if available)
- Academic honors (if available)
- Eligibility status (if available)
- Indoor volleyball eligibility overlap

### F) Declared Medical Information (Public Only)
- Declared injuries (if available) - knee injuries particularly impactful on sand movement
- Pregnancy/maternity leave (if publicly stated)
- Return timeline (if available)

### G) Awards and Recognition
- All-Conference/All-Region selections
- Conference Player/Pair of the Year
- AVCA All-American (beach)
- CCSA/Big West/Pac-12/other conference awards
- AVP tour wins/podiums
- FIVB tour results
- National team selections (beach or indoor)
- Olympic participation
- NCAA Championship appearances/wins

---

## 3. DATA TIERS

| Tier | Definition |
|------|-----------|
| V1 - Stats Only | Public box scores, per-match stats, season totals, tournament results. No video data. |
| V1+ - Stats + Licensed | V1 + advanced tracking data (if available from tour providers). Rally-level data. |
| V2 - Video (1 Season) | KaNeXT-owned or partner video data. Full match analysis including shot selection, blocking tendencies, positioning. |
| V3 - Video Deep (Multi-Season) | Multiple seasons of video data + historical film. Highest fidelity. Multiple partnerships analyzed. |

---

## 4. V1 EVALUATION PROTOCOL

This is the standard protocol for evaluating a player using publicly available statistics. Most evaluations of real players using web-sourced data are V1.

### Step 1: Set Coach Context
Lock all required fields (program/pair, level, gender). If evaluating a player at a different program than the locked context, note the discrepancy and evaluate against BOTH the player's actual context and the locked program context (for fit assessment).

### Step 2: Gather Data
Follow the Data Gathering Protocol (SKILL.md):
1. Pool check for cached data
2. Web search for current season stats (NCAA stats, AVP results, FIVB results, school website)
3. Secondary sources if needed
4. Compile per-match production rates

**Minimum data for V1 evaluation:**
- Matches played (minimum 15 matches for full confidence; 8-14 = reduced confidence; under 8 = provisional only)
- Kills/match, hitting percentage, aces/match, digs/match, blocks/match
- Role context (blocker, defender, or switch)
- Partner context (who they played with)
- Win-loss record
- Level of competition

### Step 3: Phase 3 - Production Anchor
This is the foundation. Map the player's per-match production and role against the legend for their competitive level.

**Process:**
1. Pull the legend for the player's level and gender (from File 02)
2. Map each major statistical category against legend tier benchmarks
3. Consider role context: blocker? defender? switch player?
4. Consider partnership context: playing with a strong partner inflates some stats; playing with a weak partner depresses some stats
5. Consider competition level: tournament wins against strong fields vs weak fields
6. Set the Phase 3 anchor range (e.g., "82-87" based on production profile)

**The Phase 3 anchor is truth.** It is the production-based reality of what this player does at their level. Phase 6 math can adjust within +/-10 of this anchor but cannot override it.

**Anchor against production profile numbers, not award labels.** "All-American = 95+" is a label trap. The production profile numbers are the anchor. An All-American on a stacked squad who plays the 5th pair anchors lower than the label suggests. A non-All-American who plays the 1 pair on a competitive program against elite opponents may anchor higher.

**Partnership inflation/deflation detection:** A player whose stats improve dramatically with one specific partner (vs other partners) may have inflated production. A player who maintains strong production across multiple partners has more reliable individual numbers.

### Step 4: Phase 6 - Component KR Scoring
Score all 4 component KRs using the trait bands and OPF weights from File 02.

**4 Component KRs:**

| Component | Abbreviation | Primary Stats (V1) |
|-----------|-------------|-------------------|
| Attack | AKR | Kills/match, hitting%, attack volume, shot variety (V2+), tool usage (V2+) |
| Defense/Dig | DKR | Digs/match, serve receive quality (inferred), pursuit range (V2+), positioning (V2+) |
| Serve | SVR | Aces/match, ace-to-error ratio, service errors, serve placement (V2+) |
| Beach IQ | IQKR | Blocking strategy (V2+), defensive positioning calls, shot selection, partnership communication, tournament management, wind/weather adaptation |

**Scoring each component:**
1. Pull the trait bands for the component from File 02
2. KLVN-normalize the raw stats using the player's level lambda
3. Score each available trait within the component
4. Apply proxy confidence weighting (v0.2) for traits that are inferred rather than directly measured
5. Composite the scored traits within the component using the defined intra-component weights
6. The result is the raw component KR (0-100 scale)

### Step 5: OPF Composite
Apply the OPF (Overall Performance Formula) weights for the player's role (Blocker or Defender) from File 02.

```
Base_KR = (AKR * w_AKR) + (DKR * w_DKR) + (SVR * w_SVR) + (IQKR * w_IQKR)
```

Where w values are the OPF weights for the player's role.

**Composite Bounding v0.3:** No single component KR can contribute more than 45% of the final OPF composite, even if the assigned OPF weight exceeds 45%.

### Step 6: Phase 3 Bounding
Compare Base_KR to the Phase 3 anchor range.

- If Base_KR falls within Phase 3 anchor +/-10: Final KR = Base_KR
- If Base_KR exceeds Phase 3 anchor + 10: Final KR = Phase 3 anchor + 10
- If Base_KR is below Phase 3 anchor - 10: Final KR = Phase 3 anchor - 10

If bounding is triggered, flag it. This indicates a disconnect between production reality and component math that needs investigation.

### Step 7: Final Output
Produce the complete evaluation output:

```
BEACH VOLLEYBALL PLAYER EVALUATION
===================================
Player: [Name]
Gender: [M/F]
Role: [Blocker / Defender / Switch]
Level: [Level]
Current Partner: [Partner Name]
Data Tier: [V1/V1+/V2/V3]
Confidence: [XX]%

FINAL KR: [XX.X]
  AKR: [XX.X]
  DKR: [XX.X]
  SVR: [XX.X]
  IQKR: [XX.X]

Phase 3 Anchor: [XX-XX]
OPF Composite: [XX.X]
Bounding Applied: [Yes/No]

Archetype: [Primary] / [Secondary if applicable]
Badges: [List]

LEVEL TIER MAP:
  NCAA Women's Beach:  [Tier label] (women only)
  Club Men's Beach:    [Tier label] (men only)
  AVP Pro:             [Tier label]
  FIVB Beach Pro Tour: [Tier label]

Key Strengths: [Bullet points]
Key Weaknesses: [Bullet points]
Partnership Notes: [Context about current partnership and how it affects production]
Suppression Flags: [If any]
```

---

## 5. MULTI-PARTNERSHIP EVALUATION

Beach volleyball players frequently change partners across seasons and even within a season. This creates a unique evaluation challenge.

### 5.1 Multi-Partner Data Handling
When a player has competed with multiple partners in the evaluation window:

1. **Aggregate stats by partnership:** Break down per-match production by partner
2. **Weight by match count:** More matches with a partner = more weight in individual evaluation
3. **Partnership-independent traits:** Some traits (serving, individual shot-making, physical tools) are relatively partner-independent. Weight these normally.
4. **Partnership-dependent traits:** Some traits (digs, transition offense, blocking effectiveness) are heavily influenced by partner quality. Flag these with wider confidence bands.
5. **Production variance across partners:** If a player's kills/match varies from 8.0 (Partner A) to 4.5 (Partner B), investigate why. Role switch? Competition level? Partner quality?

### 5.2 Partnership Independence Score
For each trait, assess how much the trait depends on the partner:

| Trait Category | Partnership Independence |
|---------------|------------------------|
| Serving | Very High (0.95) - serving is almost entirely individual |
| Individual attack power | High (0.85) - raw hitting ability is individual |
| Shot selection/variety | Medium-High (0.75) - some partner dependency (set quality) |
| Digging | Medium (0.60) - depends heavily on blocking partner's strategy |
| Blocking | Medium (0.60) - depends on defender's positioning |
| Transition offense | Medium-Low (0.50) - depends on partner's ability to set and create opportunities |
| Communication/IQ | Low (0.40) - directly partner-dependent |

Apply partnership independence as a multiplier to trait confidence when evaluating production from specific partnerships.

---

## 6. SUPPRESSION DETECTION

### 6.1 Role Suppression
**Definition:** Player's individual statistics are depressed because their role within the partnership limits their opportunities.

**Detection signals:**
- Defender role with low attack numbers (expected - the blocker gets more attack opportunities)
- Player was a primary attacker with previous partner but switched to defender role with current partner
- Strong indoor attacking resume but modest beach attack numbers

**Adjustment:**
- Evaluate role-specific production (did they excel at their assigned role?)
- Reference prior partnerships or indoor data for attack baseline
- Widen confidence range
- Flag: "ROLE SUPPRESSION DETECTED - current role: [Defender], evaluate attacking ability from prior partnership/indoor data"

### 6.2 Partnership Suppression
**Definition:** Player's production is depressed because their partner is significantly weaker, creating systematic disadvantages.

**Detection signals:**
- Player on a losing pair where their individual stats are strong relative to the level
- Partner's serve receive or setting is weak, limiting the player's attack opportunities
- Player shows dramatic improvement when paired with stronger partners in side-out tournaments or practice

**Adjustment:**
- Weight individual traits (serving, shot-making, physical tools) more heavily
- Discount partnership-dependent metrics
- Widen confidence range
- Flag: "PARTNERSHIP SUPPRESSION - evaluate individual skill independent of current partner context"

### 6.3 Injury Suppression
**Definition:** Player's production is depressed due to injury or playing through pain.

**Detection signals:**
- Drop in per-match production mid-season with no partnership change
- Known injury declaration (knee, shoulder, ankle - all high-impact for beach)
- Reduced match load (skipping tournaments)
- Reduction in jumping (fewer blocks, more ground-based shots)

**Adjustment:**
- Establish pre-injury baseline from earlier-season or prior-season data
- Current production establishes a floor
- Project recovery trajectory based on injury type
- Widen confidence range
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
- Project a recovery trajectory (most beach volleyball athletes who return regain 80-90% of pre-pregnancy production within 1-2 full seasons; beach volleyball is more physically demanding on return due to sand surface)
- Do NOT penalize the gap in the career record
- Widen confidence range
- Flag: "PREGNANCY/MOTHERHOOD SUPPRESSION DETECTED - pre-pregnancy baseline: [XX], current floor: [XX], projected recovery trajectory: [XX-XX over N seasons]"

### 6.5 Weather/Venue Suppression
**Definition:** Player's production appears depressed because they competed primarily in difficult conditions (heavy wind, extreme heat, deep sand).

**Detection signals:**
- Stats from tournaments known for difficult conditions (e.g., Hermosa Beach wind, Gulf Coast humidity)
- Stats significantly worse in outdoor events vs indoor beach facilities
- Ace rate drops in windy conditions (float serves become unreliable)

**Adjustment:**
- This is informational context, not a KR adjustment
- Note conditions in the evaluation narrative
- Use as positive signal for IQKR (players who maintain production in difficult conditions demonstrate high beach IQ)
- Flag: "WEATHER CONTEXT - majority of production in [conditions]. Consider IQKR upside."

### 6.6 Indoor-to-Beach Transition Suppression
**Definition:** Player is transitioning from indoor to beach and their early beach stats underrepresent their true ability.

**Detection signals:**
- First or second season of beach play after indoor career
- Strong indoor KR but modest beach numbers
- Beach-specific skills (hand setting, sand movement, shot selection) still developing
- Improving production trend across the season

**Adjustment:**
- Use indoor KR as a ceiling reference (not all indoor ability translates)
- Apply indoor-to-beach translation factors from File 06
- Widen confidence range significantly (first-year beach transition players are inherently uncertain)
- Flag: "INDOOR-TO-BEACH TRANSITION - Year [X] of transition. Indoor KR: [XX]. Beach production is expected to lag. Evaluate trajectory."

---

## 7. CONFIDENCE GATE

### Evaluation Confidence Table

| Data Available | Confidence % Range |
|---------------|-------------------|
| V1 stats only: season stats + per-match rates, 15+ matches | 50-65% |
| V1 stats only + multi-year (returning player, same partner) | 55-72% |
| V1+ licensed data: rally-level data (1 year) | 68-82% |
| V1+ licensed + multi-year | 75-88% |
| V2 Video (1 season): 8+ matches processed | 80-90% |
| V2 Video high coverage: 15+ matches + stable partnership | 85-93% |
| V3 Video Deep: multi-season + multiple partnerships analyzed | 88-96% |

### Confidence Adjusters (apply within the chosen range)
- **Sample size:** fewer than 15 matches this season -> use bottom of range
- **Recency:** last 3 tournaments show clear shift (injury, partner change, weather) -> downshift 5-10 pts
- **Partnership stability:** new partnership (under 10 matches together) -> downshift 5 pts
- **Multi-partner evaluation:** data from 3+ partnerships -> upshift 3-5 pts (more independent data)
- **Level transition:** first year at new level (college to pro, indoor to beach) -> downshift 5-8 pts
- **Multi-year stability:** 2+ seasons of consistent production with same partner -> upshift 3-5 pts toward top of range
- **Suppression detected:** any suppression flag -> widen range by 5 pts in each direction
- **Tournament format:** double-elimination with losers bracket matches = more data points than single-elimination

---

## 8. ROLE-SPECIFIC EVALUATION FLOW

### 8.1 Blocker Evaluation
The blocker is typically the taller player who plays at the net. In beach volleyball, the blocker also attacks from the left side, sets when the first contact comes to them, and serves.

**Blocker-specific evaluation focus:**
- Block effectiveness: does the block channel the attacker predictably? Does the blocker stuff blocks or get tooled?
- Block strategy: read blocking, commit blocking, pull (no block) decision-making
- Hand signals: quality of blocking calls (communicated behind the back to the defender)
- Net attack: kills from the left side, ability to hit around or over a block
- Setting: when the blocker receives the first contact, can they deliver a hittable set to their partner?
- Serving: all players serve in beach. Blocker serve quality matters.
- Transition: how quickly does the blocker transition from blocking to offense (or from offense to blocking)?
- Physical tools: height, reach, block touch, lateral speed on sand

**Key question:** Does this blocker control the net? A dominant blocker makes their partner's defensive job dramatically easier by eliminating hitting angles.

### 8.2 Defender Evaluation
The defender plays behind the blocker. They dig, pass, pursue, and often set more frequently.

**Defender-specific evaluation focus:**
- Dig rate and quality: can they dig hard-driven attacks and off-speed shots?
- Serve receive: the defender handles more serve receive in most partnerships
- Pursuit range: how far can they cover on sand? Speed and endurance on sand surface.
- Setting ability: when the defender takes the first ball, can they set their partner for an attack?
- Attack from the right side: the defender typically attacks from the right side of the court
- Shot variety: defenders often use more finesse shots (cut shots, line shots, cobra, rainbow) rather than power
- Reading: ability to read the opponent's hitter and position accordingly
- Court coverage: with only 2 players covering the entire court, the defender's range is critical

**Key question:** Does this defender cover enough court to make the blocker's job clean? An elite defender who reads well allows the blocker to take riskier blocking strategies.

### 8.3 Switch Player Evaluation
Some elite pairs switch sides on every serve receive or even mid-rally. Both players can block and defend.

**Switch-specific evaluation focus:**
- Versatility: strong enough to block AND defend at a high level
- Seamless transitions: no confusion or hesitation when switching roles
- Communication: switch pairs must communicate constantly about who takes what role
- Physical profile: switch players tend to be mid-height (tall enough to block, mobile enough to defend)

**Key question:** Does this player's versatility create a strategic advantage, or does their lack of specialization mean they are average at both roles?

---

## 9. LEVEL TIER MAP

After producing the Final KR, generate the Level Tier Map showing how this player's KR reads against every relevant level legend.

**Format (Women's):**
```
LEVEL TIER MAP:
  NCAA Women's Beach:   [Legend tier label at this level]
  AVP Pro:              [Legend tier label]
  FIVB Beach Pro Tour:  [Legend tier label]
```

**Format (Men's):**
```
LEVEL TIER MAP:
  Club Men's Beach:     [Legend tier label at this level]
  AVP Pro:              [Legend tier label]
  FIVB Beach Pro Tour:  [Legend tier label]
```

**Rules:**
- KR is ONE number. The Level Tier Map shows how that ONE number is INTERPRETED at different levels.
- Do NOT produce multiple KRs. Do NOT "convert" KR between levels.
- The Level Tier Map is a display tool for understanding where a player fits across the competitive landscape.
- Men's and women's legends have different benchmarks. Always use the gender-appropriate legend.

---

## 10. GOVERNANCE

- All process changes require versioning (v1 -> v2 etc.)
- The Phase 3 anchor is truth. The math is confirmation. Not the other way around.
- No evaluation can proceed without Coach Context locked
- All outputs must include confidence %
- Suppression detection is mandatory, not optional
- Pregnancy/motherhood suppression handling is mandatory
- Partnership context must be noted in every individual evaluation
- Indoor crossover data is supplementary context, not a substitute for beach-specific evaluation
- Weather/venue context should be noted when available
