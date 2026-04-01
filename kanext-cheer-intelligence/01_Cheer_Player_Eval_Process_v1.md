# CHEER/STUNT ATHLETE EVALUATION PROCESS
## v1.0

---

# COACH CONTEXT SETUP

## Purpose
Coach Context defines the binding environment for all downstream evaluation. No athlete evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

## Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Program Name** - school or organization name
2. **Governing Body** - NCAA, NAIA, USA Cheer, USASF (All-Star), NCA, UCA, Club
3. **Competition Format** - STUNT (head-to-head), Traditional Competition, Sideline + Competition, Game Day, All-Star
4. **Division/Level** (if applicable):
   - NCAA: D1/D2/D3 (STUNT is an NCAA Emerging Sport)
   - NAIA: single division
   - All-Star: Level 1 through Level 6 (International Open)
   - NCA/UCA: Small Coed, Large Coed, All-Girl, Division I/II/III
5. **Routine Style** - describes the team's strategic identity:
   - Difficulty-First (maximize difficulty values, accept execution risk)
   - Execution-First (prioritize clean execution, conservative difficulty)
   - Balanced (moderate difficulty with strong execution)
   - Showmanship-First (maximize performance score, creative choreography emphasis)
6. **Primary Competition** - the main event the team trains toward (Nationals, Conference Championship, STUNT Playoffs, Worlds)

These fields bind: KLVN normalization bands, KR legend interpretation, role trait weighting, routine system demand profiles, difficulty ceiling validation, and confidence gate ranges.

## Optional Metadata
1. Conference (if applicable)
2. Team size / roster count
3. Competition division within format (e.g., Large Coed D1 at NCA)

Non-blocking if blank. Used for context enrichment only.

## Optional Constraints (Downstream Only)
These fields do not alter trait scoring, role weighting, or Base KR computation. They are consumed only by downstream planning and recommendation systems (Scholarship Allocation, Recruiting, Roster Construction).

1. Scholarships Available
2. Roster Size Target
3. Budget (operating + travel)
4. Facility Access (practice mats, spring floor, pit availability)
5. Medical Staff Access (athletic trainer on-site, sports medicine referral)
6. Staffing Capacity Band - Lean (1-2 coaches), Standard (3-4), Elite (5+)

## Context Lock
When all required fields (1-6) are populated and validated, system state transitions to Coach Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

---

# ATHLETE PROFILE (Auto-Populated Record)

## A) Identity
- Full legal name
- Known aliases / nicknames
- Date of birth
- Age (derived)
- Height (current)
- Weight (current)
- Primary role(s) (Flyer, Base, Back Spot, Tumbler, All-Around)
- Secondary role(s) (if applicable)
- Handedness (relevant for basing side)
- City/Town of origin
- State/Province
- Country
- High school
- Club/All-Star program history
- Current team affiliation

## B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- Competition level (as reported)
- Role(s) performed
- Season/year label
- Competition format (STUNT, Traditional, All-Star, etc.)
- Dates active

## C) Competition Production (Season-by-Season)
For each season:
- Competitions entered
- Team placement at each competition (1st, 2nd, etc.)
- Team scores at each competition (total + category breakdowns if available)
- Individual role in routine (which stunts, which tumbling passes, which pyramid position)
- STUNT-specific (if applicable):
  - Quarters won/lost
  - Individual matchup record
  - Skill completion rate by category
- Notable performances (zero-deduction routines, hit routines at nationals, etc.)
- Awards received (All-American, conference awards, team MVP, etc.)

## D) Skills Inventory
This is unique to cheer - each athlete has a documented inventory of skills they can perform:

### Tumbling Skills (highest demonstrated)
- Standing: back handspring, back tuck, layout, full, double full
- Running: round-off back handspring series, back tuck, layout, full, double full, double layout
- Standing connected: back handspring back tuck, back handspring layout, etc.
- Running connected: full-to-layout, whip-to-double, etc.

### Stunt Skills (by role)
If Flyer:
- Highest liberty (single-leg stunt on one base)
- Body positions held (arabesque, scale, scorpion, needle, heel stretch, bow and arrow)
- Dismount difficulty (cradle, twist cradle, kick double, etc.)
- Toss difficulty (toe touch, kick full, kick double, etc.)
- Transition ability (tic-tock, switch-up, ball-up, etc.)
- Flexibility score (1-10 visual assessment)
- Body tightness score (1-10)

If Base:
- Highest stunt level executed cleanly
- One-arm capability (can single-base extended stunts)
- Toss power consistency
- Transition speed
- Grip strength / hand placement precision
- Partner weight capacity (safe max)

If Back Spot:
- Catch reliability (never drops, consistent catch position)
- Height reach (relevant for extension stunts)
- Strength rating
- Communication / calling ability

### Pyramid Skills
- Highest pyramid difficulty participated in
- Role in pyramid (top, middle, base)
- Braced flip experience
- Multi-level transition experience

### Jump Skills
- Toe touch height and technique
- Pike height and technique
- Hurdler technique
- Jump combinations (toe touch - pike, etc.)
- Jumps connected to tumbling

### Dance Skills
- Sharpness (1-10)
- Musicality (1-10)
- Performance quality (1-10)
- Choreography retention speed

## E) Academic Record (Public / Declared Only)
- GPA (if available)
- Academic honors (if available)
- Eligibility status (if available)

## F) Declared Medical Information (Public Only)
- Declared injuries (if available)
- Concussion history (critical for flyers)
- Joint/ligament history (ACL, ankle, wrist - common in cheer)
- Return-to-play clearance status

---

# CONFIDENCE GATE

## Purpose
Every evaluation output includes a confidence percentage reflecting how much data the system had available and how reliable that data is. In a judged sport, confidence must also account for scoring subjectivity.

## Data Completeness Tiers

### Tier 1 - Full Data (85-100% confidence ceiling)
- Complete competition video reviewed
- Full skills inventory documented
- Multiple competition scores available
- STUNT head-to-head records available
- Role history confirmed
- Physical measurements verified

### Tier 2 - Moderate Data (65-84% confidence ceiling)
- Partial competition video or highlight reel only
- Skills inventory from coach report (not verified by video)
- Limited competition scores (1-2 events)
- Role reported but not confirmed by video
- Physical measurements from roster (not verified)

### Tier 3 - Low Data (45-64% confidence ceiling)
- No video available
- Skills inventory self-reported or from recruiting profile only
- Single competition result or no results
- Role assumed from physical profile
- Measurements unverified

### Tier 4 - Minimal Data (below 45% confidence ceiling)
- Name and team only
- No skills inventory
- No competition results
- Role unknown

## Judging Variance Adjustment
Because cheer is a judged sport, all confidence percentages are reduced by a Judging Variance Penalty (JVP):
- Well-established rubric (STUNT official scoring): JVP = -3%
- Standard competition rubric (NCA/UCA): JVP = -5%
- Subjective panel (some regional competitions): JVP = -8%
- Unknown judging standard: JVP = -10%

Final Confidence = Data Tier Ceiling - JVP

---

# V1 EVALUATION PROTOCOL

V1 is the standard evaluation mode when working from competition results, roster data, video review, and publicly available information. This covers the vast majority of real-world evaluations.

## Step 1: Set Coach Context
Lock all required fields per Coach Context Setup above. If any field is missing, evaluation is blocked.

## Step 2: Build Athlete Profile
Populate the Athlete Profile from available data sources. Flag any missing sections. The Skills Inventory is the most critical section for cheer evaluation - without it, confidence drops sharply.

## Step 3: Phase 3 - Production Anchor
Map the athlete's competition production and skills inventory against the legend file for their competitive level.

### For STUNT athletes:
- Map individual matchup win rate against legend tier descriptions
- Map skill completion rate by STUNT quarter category
- Map team contribution (are they in the starting 4? Rotation player? Specialist?)
- Anchor: "An athlete with this matchup record and skill completion at this level maps to [legend tier]"

### For Traditional Competition athletes:
- Map the team's placement and scores (athlete is part of the team score)
- Map the athlete's specific role contribution (what skills do they perform in the routine?)
- Map individual skill difficulty against level norms
- Anchor: "An athlete performing these skills at this execution level on a team that places [X] at [competition] maps to [legend tier]"

### For All-Star athletes:
- Map team level and placement
- Map individual skill difficulty relative to level expectations
- Map role importance within the team
- Anchor against All-Star legend tiers

The Production Anchor sets the KR floor and ceiling. Phase 6 math adjusts within this range.

### Anchor Rule
Anchor against the production profile numbers, not award labels. "All-American" is a label. The skills inventory, competition results, and role contribution are the anchor. Award labels are confirmatory evidence, not primary anchors.

## Step 4: Phase 6 - OPF Math
Apply the role-based Outcome Prediction Function (OPF) weights to compute component KRs:

1. Score each of the 5 component KRs (SKR, TKR, JKR, AKR, IQKR) using the trait bands from File 02
2. Apply the OPF weights for the athlete's primary role
3. Compute weighted KR
4. Verify that weighted KR falls within Phase 3 anchor range (+/- 10)
5. If outside range, Phase 3 anchor overrides - investigate why the math diverged

### Composite Bounding (v0.3)
When data is incomplete (common in cheer due to team-based scoring), bound component KRs using available signals:
- SKR bounded by: stunt difficulty level demonstrated, partner group performance, role consistency
- TKR bounded by: highest tumbling pass demonstrated, standing vs running inventory, execution quality indicators
- JKR bounded by: jump height/technique observations, dance precision, performance energy
- AKR bounded by: physical profile, role demands met, endurance indicators
- IQKR bounded by: routine execution consistency, mistake recovery, leadership indicators

### Proxy Confidence Weighting (v0.2)
Each component KR carries its own confidence based on data availability:
- Direct observation (video of specific skill): 90-100% proxy confidence
- Competition result inference (team scored well in stunt category, athlete was the flyer): 60-80% proxy confidence
- Coach/self report without video: 40-60% proxy confidence
- Physical profile inference only: 20-40% proxy confidence

Weight component KRs by their proxy confidence when computing the final composite.

## Step 5: Final KR Output
Assemble the final evaluation:

### Required Output Fields
1. **Athlete Name**
2. **Role** (primary + secondary if applicable)
3. **Level** (competition level being evaluated at)
4. **Component KRs:**
   - SKR: [score] (confidence: [X]%)
   - TKR: [score] (confidence: [X]%)
   - JKR: [score] (confidence: [X]%)
   - AKR: [score] (confidence: [X]%)
   - IQKR: [score] (confidence: [X]%)
5. **Final KR:** [score]
6. **KR Range:** [low] - [high] (reflecting judging variance and data uncertainty)
7. **Overall Confidence:** [X]%
8. **Legend Read:** [tier label from appropriate legend file]
9. **Level Tier Map** (if requested or if cross-level projection is relevant):
   - At [Level A]: [legend tier]
   - At [Level B]: [legend tier]
   - At [Level C]: [legend tier]
10. **Archetype:** [from Archetype Library in File 02]
11. **Safety Notes:** [any flags from safety protocol]
12. **Key Strengths:** (2-3 bullet points)
13. **Development Areas:** (2-3 bullet points)
14. **Evaluation Narrative:** (2-4 sentences contextualizing the rating)

---

# CONTEXTUAL MODE

## Purpose
Contextual Mode applies when the evaluator (coach) is evaluating athletes for a specific purpose: recruiting, roster construction, or competition planning. The evaluation math does not change, but the output framing adjusts.

### Recruiting Context
When Coach Context is locked and the query is about a prospective recruit:
- Level Tier Map is mandatory (show how the athlete reads across multiple levels)
- Role fit assessment against current roster needs is included
- Development projection (what skills could this athlete gain in 1-2 years) is included
- Safety assessment for role transition (e.g., All-Star flyer transitioning to STUNT) is included

### Roster Construction Context
When the query is about optimizing an existing roster:
- Partner/group chemistry scores are included
- Role redundancy analysis is included
- Routine composition impact is included (how does adding/removing this athlete change what the team can do?)

### Competition Planning Context
When the query is about preparing for a specific competition:
- Difficulty ceiling assessment (what's the hardest routine this roster can execute safely?)
- Execution probability at each difficulty level
- Deduction risk modeling for the planned routine

---

# ROLE SUPPRESSION DETECTION

## Purpose
In cheer, athletes are often placed in roles that do not showcase their full ability. A talented tumbler placed exclusively as a base may appear to have limited tumbling - but their skills are suppressed by role assignment, not by actual ability.

## Detection Signals
- Athlete has documented tumbling skills but performs no tumbling in current routine
- Athlete has flyer experience but is currently basing (or vice versa)
- Athlete performs lower-difficulty skills than their inventory shows they can execute
- Athlete's All-Star background suggests higher skill level than current college role requires

## Resolution
When suppression is detected:
1. Note it explicitly in the evaluation narrative
2. Score the athlete's component KRs based on DEMONSTRATED ability (skills inventory), not just current-routine contribution
3. Apply a Suppression Adjustment: if the athlete's skills inventory shows capability beyond their current role, IQKR and the suppressed component get a confidence penalty (we know they CAN do it but we haven't seen them do it IN THIS CONTEXT) rather than a score penalty
4. The Level Tier Map should reflect both the current-role KR and the full-ability KR with appropriate confidence labels

---

# MULTI-FORMAT PROTOCOL

## Purpose
An athlete may compete in multiple formats (STUNT + Traditional Competition, College + All-Star club, etc.). The system must handle this without double-counting or conflicting evaluations.

## Rules
1. One KR per athlete. Period. KR is universal.
2. Data from all formats is gathered and used as input
3. The PRIMARY format (the one matching Coach Context) determines legend interpretation
4. Secondary format data is used as supporting evidence with appropriate KLVN adjustment
5. If an athlete competes at two different levels simultaneously (e.g., college STUNT + All-Star L6), the higher-competition data is weighted more heavily for component KRs where it provides stronger signal
6. Conflicts between formats are noted in the evaluation narrative with explanation of which data was prioritized and why

---

# FOUNDING TEST CASES

## Purpose
These are reference evaluations that anchor the system's calibration. They represent known-quantity athletes at specific levels whose KR is established by expert consensus.

### Test Case 1: Elite STUNT Flyer (NCAA D1)
- Profile: 5'2", 105 lbs, 4-year starter, All-American, team won STUNT national championship
- Skills: Full-up liberty, scorpion, kick double basket, all standing tumbling through full
- Expected KR: 92-95
- Legend read: "Elite National Standout / STUNT All-American"
- This athlete sets the ceiling for NCAA STUNT flyer evaluation

### Test Case 2: Solid STUNT Base (NCAA D1)
- Profile: 5'7", 155 lbs, 2-year starter, consistent partner stunt execution
- Skills: One-arm extended stunts, clean tosses, reliable catches, standing back tuck
- Expected KR: 78-82
- Legend read: "High-Impact Starter / Core Contributor"
- This athlete represents the reliable, valued contributor tier

### Test Case 3: All-Star Level 6 Flyer (Elite All-Star)
- Profile: 5'0", 98 lbs, 5+ years elite All-Star experience, Worlds medalist
- Skills: Elite body positions, braced flips in pyramid, double-down dismounts, standing full tumbling
- Expected KR: 93-97
- Legend read: "Worlds-Level Elite / Franchise Talent"
- This athlete sets the All-Star ceiling

### Test Case 4: Developmental College Athlete (NAIA)
- Profile: 5'5", 130 lbs, former high school cheerleader, limited competition experience
- Skills: Back handspring standing, round-off back handspring running, basic lib, toe touch
- Expected KR: 58-62
- Legend read: "Developmental / Limited Competition Depth"
- This athlete represents the lower bound of competitive viability

These test cases are reference anchors. Real evaluations should produce KRs that are internally consistent with these benchmarks.
