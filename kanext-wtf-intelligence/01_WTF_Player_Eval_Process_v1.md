# Women's Track and Field Player Evaluation Process v1

---

## 0. SCOPE

This is the single authoritative document for the women's track and field player evaluation pipeline. It defines how an athlete enters the system, how data is gathered, how the evaluation proceeds through phases, how suppression is detected (including pregnancy/motherhood suppression), and how the final KR is produced.

This file defines the PROCESS. File 02 (Player Eval Reference) contains the DATA (trait bands, OPF weights, legends, KLVN lambdas, event benchmarks).

**This is the WOMEN'S system.** All events, implement weights, hurdle heights, and benchmarks are women's-specific. 100m hurdles (not 110m). Heptathlon (not decathlon). Shot put 4kg. Discus 1kg. Hammer 4kg. Javelin 600g.

---

## 1. COACH CONTEXT SETUP

Coach Context defines the binding environment for all downstream evaluation. No athlete evaluation, team evaluation, simulation, or scouting output can execute until Coach Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Program Name**
2. **Governing Body** - NCAA, NAIA, NJCAA
3. **Division** (if applicable) - NCAA: D1/D2/D3, NJCAA: D1/D2/D3
4. **Major Class** (required only if NCAA D1) - Power 4, Mid-Major, Low-Major
5. **Event Focus** - Sprint/Hurdles, Middle Distance, Distance, Jumps, Throws, Multi-Event (Heptathlon), or Full Program (all event groups)
6. **Facility Type** - Indoor-only, Outdoor-only, Indoor+Outdoor, No dedicated facility

These fields bind: KLVN normalization bands, KR legend interpretation, event-specific trait weighting, system fit computation, and confidence gate ranges.

### Optional Metadata
1. Conference - non-blocking if blank. Used by KLVN for D1 Major Class auto-assignment.
2. Altitude (meters above sea level) - affects sprint/jump marks at altitude venues
3. Indoor facility specifications

### Optional Constraints (Downstream Only)
These fields do not alter trait scoring or Base KR computation. They are consumed only by downstream planning and recommendation systems.

1. Scholarships Available (NCAA D1 max 18 equivalency; D2 max 12.6; D3 = 0; NAIA max 12; NJCAA varies)
2. NIL Pool
3. Institutional / Merit Aid Capacity
4. Need-Based Aid Availability
5. Operating Budget
6. Recruiting Budget
7. Roster Size Target (typical: 30-80 depending on program scope)
8. Staffing Capacity Band - Lean (1-2 coaches), Standard (3-5), Elite (6+ including event-specific coaches)
9. Indoor Season Priorities vs Outdoor Season Priorities

### Context Lock
When all required fields (1-6) are populated and validated, system state transitions to Coach Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

---

## 2. ATHLETE PROFILE (Auto-Populated Record)

### A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth
- Age (derived)
- Height (current)
- Weight (current)
- Declared event(s) (source-listed only)
- City/Town of origin
- State/Province
- Country
- High school
- Club program (USATF, AAU, or equivalent)
- Current team affiliation
- Recruiting stars/rankings (if applicable)

### B) Career Record (Season-by-Season)
For each competitive season:
- Team name
- League / competition level
- Season/year label (indoor or outdoor designated)
- Dates active
- Redshirt status (RS, medical RS, COVID year)
- Events contested

### C) Raw Production (Season-by-Season)

#### C1: Sprint Events (100m, 200m, 400m)
Per event, per season:
- Personal best (wind-legal, +2.0 m/s or less)
- Personal best (wind-aided, if applicable, with wind reading)
- Season best
- Indoor conversion marks (60m for 100m/200m; 400m indoor)
- Number of competitions
- Finals appearances (conference, regional, national)
- Place finishes in championship meets
- Relay splits (4x100m, 4x400m) with context
- Altitude notation (if applicable)
- FAT (fully automatic timing) confirmation

#### C2: Hurdle Events (100m H, 400m H)
Per event, per season:
- Personal best (wind-legal)
- Personal best (wind-aided, if applicable)
- Season best
- Indoor conversion marks (60m H)
- Number of competitions
- Finals appearances
- Place finishes in championship meets
- DNF rate (hurdle events have higher DNF rates)
- Hurdle height confirmed: 100mH = 0.838m/33", 400mH = 0.762m/30"

#### C3: Middle Distance Events (800m, 1500m)
Per event, per season:
- Personal best
- Season best
- Indoor marks (800m indoor, mile for 1500m context)
- Number of competitions
- Split data (400m split for 800m, 800m split for 1500m if available)
- Negative split vs positive split pattern
- Finals appearances
- Place finishes in championship meets
- Doubling pattern (800m/1500m double, or 1500m/event double)

#### C4: Distance Events (3000m SC, 5000m, 10000m)
Per event, per season:
- Personal best
- Season best
- Indoor marks (3000m, 5000m indoor)
- Number of competitions
- Split data (1000m/mile splits if available)
- Cross country results (5k/6k times, course context)
- Finals appearances
- Place finishes in championship meets
- 3000m SC barrier clearance consistency (if observable)

#### C5: Jump Events (HJ, LJ, TJ, PV)
Per event, per season:
- Personal best
- Season best
- Indoor marks
- Number of competitions
- Clearance/attempt history at key heights/distances
- Consistency (number of first-attempt clearances, miss patterns)
- Finals appearances
- Place finishes in championship meets
- For LJ/TJ: wind readings on best marks
- For PV: grip height and pole stiffness (if available)
- For TJ: phase ratios (hop:step:jump) if available

#### C6: Throw Events (SP, DT, HT, JT)
Per event, per season:
- Personal best (with implement weight confirmed: SP 4kg, DT 1kg, HT 4kg, JT 600g)
- Season best
- Indoor marks (SP indoor; weight throw 20lb/9.07kg for throwers)
- Number of competitions
- Foul rate
- Consistency (spread between best and average marks)
- Finals appearances
- Place finishes in championship meets
- Technique style (glide vs rotational for SP; if known)

#### C7: Heptathlon
Per competition:
- Total points (World Athletics scoring tables)
- Individual event marks within the heptathlon (100mH, HJ, SP 4kg, 200m, LJ, JT 600g, 800m)
- Individual event point contributions
- Day 1 vs Day 2 balance
- Personal bests in individual events (both standalone and within heptathlon)

#### C8: Relays
- 4x100m team times and place finishes
- 4x400m team times and place finishes
- Individual relay splits (leg times)
- Relay position (leadoff, backside legs, anchor)
- Baton exchange quality (if observable)

### D) Academic Record (Public/Declared Only)
- GPA (if available)
- Academic honors (if available)
- Eligibility status (if available)
- Major / field of study

### E) Declared Medical Information (Public Only)
- Declared injuries (if available)
- Pregnancy/maternity leave (if publicly disclosed)
- Return timeline from pregnancy (if available)
- Medical redshirt designations
- Competitions missed by season
- Chronic injury history (hamstring, Achilles, stress fractures are common in track)

### F) Awards and Recognition
- All-Conference selections
- Conference champion titles
- All-American selections (USTFCCCA)
- All-Region selections
- Conference weekly/monthly honors
- National statistical rankings (TFRRS rankings)
- National team / youth national team selections
- Olympic/World Championship participation

---

## 3. DATA TIERS

| Tier | Definition |
|------|-----------|
| V1 - Marks Only | Public results databases (TFRRS, World Athletics, athletic.net). Times, distances, heights, meet results. |
| V1+ - Marks + Context | V1 + split data, relay splits, wind readings, attempt-by-attempt field event data. More granular meet results. |
| V2 - Biomechanics (1 Season) | V1+ plus biomechanical analysis (stride length/frequency, block clearance, release angles, approach speeds). Training load data. |
| V3 - Biomechanics Deep (Multi-Season) | Multiple seasons of biomechanical data + training periodization records. Highest fidelity. |

**Auto-detection:** Nexus auto-detects evaluation mode based on data availability. No user choice.

**Women's T&F data context:** TFRRS (Track and Field Results Reporting System) is the primary source for US college results. World Athletics database covers elite/professional. Athletic.net covers high school. Most college evaluations are V1. Biomechanical data (V2/V3) is rare outside elite programs.

---

## 4. V1 EVALUATION PROTOCOL

This is the standard protocol for evaluating an athlete using publicly available marks and results. Most evaluations of real athletes using web-sourced data are V1.

### Step 1: Set Coach Context
Lock all required fields (program, level, event focus). If evaluating an athlete at a different program than the locked context, note the discrepancy and evaluate against BOTH the athlete's actual context and the locked program context (for fit assessment).

### Step 2: Gather Data
Follow the Data Gathering Protocol:
1. Pool check for cached data
2. Web search for current season marks (TFRRS, school athletics page, conference results)
3. Secondary sources if needed (athletic.net for HS marks, World Athletics for elite)
4. Compile season bests, personal bests, championship meet results

**Minimum data for V1 evaluation:**
- Primary event personal best (wind-legal for sprint/jump events)
- Season best in primary event
- Number of competitions this season (minimum 3 for adequate confidence; 5+ preferred)
- Championship meet results (conference, regional if applicable)
- At least 1 season of marks at current level

### Step 3: Phase 3 - Production Anchor
This is the foundation. Map the athlete's marks and results against the legend for their competitive level.

**Process:**
1. Pull the legend for the athlete's level and event (from level legend file)
2. Map the personal best and season best against legend tier benchmarks
3. Consider competition context: championship meet performer? Regular season only?
4. Consider progression: improving trajectory or plateaued?
5. Set the Phase 3 anchor range (e.g., "88-92" based on marks profile)

**The Phase 3 anchor is truth.** In track and field, the mark IS the production. A wind-legal 11.15 100m is a wind-legal 11.15 100m. Phase 6 math can adjust within +/-10 of this anchor but cannot override it.

**Anchor against marks, not award labels.** "All-American = 95+" is a label trap. The marks are the anchor. An All-American with a wind-aided PR who ran 0.15 slower at nationals anchors at the nationals mark. A non-All-American with a legal 11.10 who missed nationals due to injury anchors at the legal mark.

**Wind-legal marks are the primary anchor.** Wind-aided marks (>+2.0 m/s) are supplementary evidence only. Indoor marks serve as cross-reference but outdoor wind-legal marks take priority for outdoor evaluation.

### Step 4: Phase 6 - Component KR Scoring
Score all applicable component KRs using the trait bands and OPF weights from File 02.

**Component KRs by Event Group:**

| Event Group | Components | Primary Stats (V1) |
|-------------|-----------|-------------------|
| Sprints | PKR, TKR, AKR, CKR, IQKR | Times (PB, SB), finals appearances, championship results |
| Hurdles | PKR, TKR, AKR, CKR, IQKR | Times (PB, SB), DNF rate, hurdle-specific technique indicators |
| Middle Distance | PKR, EKR, TKR, CKR, IQKR | Times (PB, SB), split patterns, doubling success, championship results |
| Distance | PKR, EKR, TKR, CKR, IQKR | Times (PB, SB), XC results, split patterns, championship results |
| Jumps | PKR, TKR, AKR, CKR, IQKR | Heights/distances (PB, SB), consistency, attempt efficiency |
| Throws | PKR, TKR, AKR, CKR, IQKR | Distances (PB, SB), consistency (spread), foul rate, technique indicators |
| Heptathlon | WA composite | Individual event marks, total points, event balance |

**Scoring each component:**
1. Pull the trait bands for the component from File 02
2. KLVN-normalize the raw marks using the athlete's level lambda
3. Score each available trait within the component
4. Weight the traits per the component structure in File 02
5. Produce the component KR (0-100 scale)

**OPF (Overall Performance Formula):**
Apply event-group-specific OPF weights to produce the composite KR.
- OPF weights differ by event group (sprinters weight PKR and AKR higher; distance runners weight PKR and EKR higher)
- OPF weights differ by level (college vs pro)
- Pull exact weights from File 02 "EVENT GROUP OPF WEIGHTS"

**Composite Bounding v0.3:**
No single component can contribute more than 45% of the final composite, even if OPF assigns higher weight. This prevents a dominant single metric from inflating overall KR.

**Proxy Confidence Weighting v0.2:**
- Marks with direct measurement (FAT times, measured distances/heights) get full weight (1.0)
- Stats inferred from proxy data (technique from results patterns, IQ from race tactics) get reduced weight (0.6-0.8)
- IQKR at V1 is always proxy-weighted at 0.6 (cannot directly measure race IQ from results alone)
- TKR at V1 is proxy-weighted at 0.7 for running events (technique inferred from splits and consistency, not directly observed)

### Step 5: Phase 6 Adjusts Within Phase 3 +/-10
The Phase 6 composite KR must fall within +/-10 of the Phase 3 anchor range midpoint.

- If Phase 6 math produces a KR more than 10 points above the Phase 3 anchor midpoint, cap at anchor midpoint + 10
- If Phase 6 math produces a KR more than 10 points below the Phase 3 anchor midpoint, floor at anchor midpoint - 10
- If within range, use Phase 6 math as the final KR

**If a significant gap exists between Phase 3 and Phase 6, investigate:**
- Is there a suppression factor not yet detected?
- Is the legend calibration off for this event at this level?
- Is the athlete a multi-event specialist whose individual marks underrepresent her composite ability?
- Are wind-aided marks creating a misleading picture?
- Is altitude affecting the marks?

### Step 6: Final KR Output
Produce the final evaluation card:

```
ATHLETE EVALUATION CARD
========================
Athlete: [Name]
Event Group: [Sprints/Hurdles/MD/Distance/Jumps/Throws/Heptathlon]
Primary Event: [Event]
Level: [Level] | Conference: [Conference]
Team: [School] | Season: [Year]
Data Tier: V1 | Competitions: [N]

FINAL KR: [XX.X]
Confidence: [XX]%

Component KRs:
  PKR (Performance):   [XX.X]
  TKR (Technical):     [XX.X]
  AKR/EKR (Athletic/Endurance): [XX.X]
  CKR (Competitive):   [XX.X]
  IQKR (Track IQ):     [XX.X]

Phase 3 Anchor: [XX-XX]
Phase 6 Composite: [XX.X]
Adjustment: [None / Capped at +10 / Floored at -10]

Archetype: [Primary Archetype]
Badges: [List]

LEVEL TIER MAP:
  NCAA D1: [Legend tier label]
  NCAA D2: [Legend tier label]
  NCAA D3: [Legend tier label]
  NAIA:    [Legend tier label]
  NJCAA:   [Legend tier label]
  Pro:     [Legend tier label]

KEY MARKS:
  Primary Event PB: [Mark] (wind: [reading], [date])
  Primary Event SB: [Mark] (wind: [reading], [date])
  Secondary Event(s): [Mark(s)]
  Indoor Best: [Mark] ([event])

CHAMPIONSHIP RESULTS:
  [Conference/Regional/National results]

SCOUTING NOTES:
  [2-3 sentences of evaluative context]

SUPPRESSION FLAGS: [None / List]
```

---

## 5. MASTER EXECUTION FLOW (V1+ / V2 / V3)

For evaluations with biomechanical data or training data available:

### Phase 1: Data Intake
- Ingest all available data (marks + biomechanics + training logs)
- Validate data completeness
- Flag missing components
- Confirm implement weights and hurdle heights match women's specifications

### Phase 2: Trait Scoring
- Score every available trait in the Trait Library (File 02)
- KLVN-normalize raw inputs
- Flag unscored traits
- Produce cluster-level scores

### Phase 3: Production Anchor
- Same as V1 Phase 3 but with higher confidence
- Use marks + biomechanical context
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
- Apply event-group-specific OPF weights
- Apply composite bounding v0.3
- Apply proxy confidence weighting v0.2 (less impactful at V2/V3 since more data is direct)
- Produce composite KR
- Adjust within Phase 3 +/-10

### Phase 7: System Fit
- Compute system fit against program needs (event group coverage, relay utility, multi-event versatility)
- System fit in track is less about tactical systems and more about: event coverage, scoring potential at the conference/regional/national level, relay contribution, multi-event versatility

### Phase 8: Confidence Gate
- Compute evaluation confidence % based on data tier, sample size, and recency
- Output final evaluation card

---

## 6. SUPPRESSION DETECTION

Suppression occurs when an athlete's marks are artificially depressed by factors outside her control. If detected, the evaluation must flag the suppression type and adjust the confidence range (widen it).

### 6.1 Injury Suppression
**Definition:** Athlete's marks are depressed due to competing through injury or returning from injury.

**Detection signals:**
- Known injury history (hamstring strains, stress fractures, Achilles issues, ACL tears are common in women's track)
- Mark regression mid-season or year-over-year
- Reduced competition schedule after injury
- Shift from primary event to secondary event (e.g., 200m specialist drops to 400m after hamstring issue)
- Medical redshirt season

**Common women's track injuries with high suppression impact:**
- Hamstring strain: affects all sprint/hurdle/jump events; 3-8 week recovery; subconscious braking for months
- Stress fracture (tibia, metatarsal, femoral neck): affects all events; 6-12 weeks; running mechanics altered during recovery
- ACL tear: 9-12 month recovery; disproportionately affects women (2-8x higher rate than men); jump and sprint events most impacted
- Achilles tendinopathy: chronic, affects push-off power in all running and jumping events
- Plantar fasciitis: chronic, affects all weight-bearing events

**Adjustment:**
- Evaluate pre-injury marks as the primary anchor if sufficient sample exists
- Current marks establish the floor
- Widen confidence range significantly
- Flag: "INJURY SUPPRESSION DETECTED - [injury type], pre-injury anchor: [XX], current floor: [XX]"

### 6.2 Pregnancy/Motherhood Suppression
**Definition:** Athlete's marks are depressed due to pregnancy, postpartum recovery, or the demands of motherhood affecting training, competition, and physiology.

**THIS IS MANDATORY TO DETECT AND HANDLE. Pregnancy/motherhood suppression is a significant factor in women's track careers and must be evaluated with accuracy and respect.**

**Detection signals:**
- Gap in competitive record (1-3 seasons missing)
- Return to competition after extended absence
- Public information about pregnancy/maternity
- Age pattern suggesting maternity leave window (typically 24-35 in professional track)
- Mark regression after return that is inconsistent with injury pattern
- Reduced competition volume post-return
- Shift in body composition noted in post-return results

**Physiological context for pregnancy suppression in track and field:**
- Pregnancy causes cardiovascular, musculoskeletal, and hormonal changes that require 6-18 months for full competitive recovery
- Sprint/power events: return timeline typically 8-14 months post-delivery for near-baseline performance
- Distance events: aerobic base often recovers faster (some distance runners report improved VO2max post-pregnancy); competitive marks may return in 6-12 months
- Throws: upper body and rotational power may return relatively quickly; lower body stability and technique timing take longer
- Jumps: impact loading is the last to normalize; approach speed recovers before takeoff confidence
- Heptathlon: each component recovers on its own timeline; total points recovery is the longest

**Historical evidence:**
- Allyson Felix: returned to elite sprint performance post-pregnancy, winning Olympic and World Championship medals
- Alysia Montano: competed at US Championships while pregnant; returned to near-elite 800m post-pregnancy
- Shelly-Ann Fraser-Pryce: returned to world-leading 100m performance post-pregnancy
- These examples confirm that world-class performance post-pregnancy is achievable; suppression during the return window is temporary, not permanent

**Adjustment:**
- Evaluate pre-pregnancy marks as a valid baseline
- Current marks establish the post-return floor
- Project a recovery trajectory:
  - Sprint/hurdle events: 85-95% of pre-pregnancy marks within 12-18 months post-return
  - Distance events: 88-97% of pre-pregnancy marks within 9-15 months post-return
  - Field events: 82-93% of pre-pregnancy marks within 12-20 months post-return (highly variable by event)
  - Heptathlon: 80-92% of pre-pregnancy points within 15-24 months post-return
- Do NOT penalize the gap in the career record
- Widen confidence range significantly (+/-8 minimum)
- Flag: "PREGNANCY/MOTHERHOOD SUPPRESSION DETECTED - pre-pregnancy baseline: [XX], current floor: [XX], projected recovery trajectory: [XX-XX over N months]"
- If athlete has not yet returned: evaluate on pre-pregnancy marks with wide confidence range and projected return window

### 6.3 Role/Opportunity Suppression
**Definition:** Athlete's marks are depressed because she has limited competition opportunities, poor training environment, or lack of quality competition.

**Detection signals:**
- Competing at a program with minimal meet schedule
- No access to high-level invitationals
- Training without event-specific coaching (e.g., a thrower at a distance-focused program)
- Competing unattached
- Limited indoor season access (no indoor facility)

**Adjustment:**
- Widen confidence range
- Evaluate best available marks against opportunity context
- Flag: "OPPORTUNITY SUPPRESSION - limited competition access at [context]"

### 6.4 Environmental Suppression
**Definition:** Athlete's marks are suppressed by environmental factors.

**Detection signals:**
- Home venue at altitude (>1000m) - sprints/jumps benefit but distance marks may be suppressed
- Home venue at sea level in cold/windy region - outdoor marks suppressed
- No indoor facility - missing entire indoor season of development
- Poor facility quality (soft track surface, short runways for jumps/vault)

**Adjustment:**
- Note altitude/environment context
- Widen confidence range for affected events
- Flag: "ENVIRONMENTAL SUPPRESSION - [specific factor]"

### 6.5 Training Transition Suppression
**Definition:** Athlete's marks are temporarily suppressed during a coaching or technique transition.

**Detection signals:**
- Recent transfer with coaching change
- Known technique change (e.g., switching from glide to rotational shot put)
- New event addition (e.g., adding heptathlon after being an individual event specialist)
- First year at a higher competitive level (high school to college, JC to D1)

**Adjustment:**
- Current marks establish floor
- Pre-transition marks establish ceiling context
- Project adaptation timeline (typically 1-2 seasons for technique changes)
- Flag: "TRAINING TRANSITION SUPPRESSION - [specific change], adaptation timeline: [N seasons]"

### 6.6 Teammate/Depth Suppression
**Definition:** In relay contexts, an athlete's relay contribution is suppressed by weaker relay partners or poor baton exchanges.

**Detection signals:**
- Strong individual open 100m/400m but slow relay splits
- Known weak link(s) on relay team
- Baton exchange issues visible in relay-vs-individual time differential

**Adjustment:**
- Evaluate individual open marks independently from relay contribution
- Relay splits only supplement individual evaluation when the relay team is competitive
- Flag: "RELAY SUPPRESSION - individual marks are the primary evaluation; relay context is [weak/competitive]"

---

## 7. CONFIDENCE GATE

### Evaluation Confidence Table

| Data Available | Confidence % Range |
|---------------|-------------------|
| V1 marks only: 3-4 competitions, current season | 45-60% |
| V1 marks only: 5+ competitions, season best + PB | 55-70% |
| V1 marks + multi-year (returning veteran) | 62-78% |
| V1+ marks + context: splits, attempt data, wind readings | 70-85% |
| V2 Biomechanics (1 season): training data + meets | 80-90% |
| V2 Biomechanics high coverage: full season | 85-93% |
| V3 Biomechanics Deep: multi-season + periodization | 90-97% |

### Confidence Adjusters (apply within the chosen range)
- **Sample size:** fewer than 3 competitions this season -> use bottom of range
- **Recency:** last 3 meets show clear shift (injury, form breakdown) -> downshift 5-10 pts
- **Wind-legal marks available:** If PB is wind-aided only, no wind-legal PB at same caliber -> downshift 3-5 pts
- **Level transition:** first year at new level (HS to college, JC to D1, D2 to D1) -> downshift 5 pts until mid-season sample
- **Multi-year stability:** 2+ seasons of consistent marks at same level -> upshift 3-5 pts
- **Suppression detected:** any suppression flag -> widen range by 5 pts in each direction
- **Pregnancy/motherhood suppression:** widen range by 8 pts minimum in each direction
- **Championship meet data available:** Conference or national meet results -> upshift 3-5 pts (championship performance is high-signal)

---

## 8. EVENT-GROUP-SPECIFIC EVALUATION FLOW

### 8.1 Sprint Evaluation (100m, 200m, 400m)
Sprint evaluation centers on the mark. The time is the truth.

**Sprint-specific evaluation focus:**
- Wind-legal personal best is the primary evaluation metric
- Season best trajectory (improving, flat, regressing)
- Championship meet performance relative to season best
- 100m-to-200m speed maintenance ratio (elite ratio: ~2.03-2.06x)
- 200m-to-400m speed endurance (400m specialists: 200m PB x ~2.15-2.20)
- Indoor-to-outdoor conversion (60m to 100m, indoor 200m/400m context)
- Relay split utility
- Reaction time consistency (if available from championship meet data)

**Key question:** Is this a pure speed sprinter (100m/200m), a speed-endurance sprinter (200m/400m), or a true 400m specialist? Event range determines archetype.

### 8.2 Hurdle Evaluation (100m H, 400m H)
Hurdles add a technical dimension on top of sprint speed.

**Women's hurdle specifications (MANDATORY):**
- 100m Hurdles: 0.838m (33 inches) height, 13.00m to first hurdle, 8.50m between hurdles, 10.50m from last hurdle to finish, 10 hurdles total
- 400m Hurdles: 0.762m (30 inches) height, 45.00m to first hurdle, 35.00m between hurdles, 40.00m from last hurdle to finish, 10 hurdles total

**Hurdle-specific evaluation focus:**
- Wind-legal hurdle PB is primary
- Flat sprint speed as context (100m flat time vs 100mH time; the gap indicates technical efficiency)
- Technical efficiency: time differential between flat sprint and hurdle event
- 100mH: typical elite differential is 2.0-2.5 seconds over flat 100m (e.g., 11.00 flat / 12.80 100mH)
- 400mH: stride pattern consistency, ability to maintain 13-15 strides between hurdles through the race
- DNF rate (hurdle events have higher DNF frequency; chronic DNFs signal technical weakness)
- Championship meet performance

**Key question:** Is the limiting factor speed or technique? A fast flat sprinter with a large hurdle differential has technical upside. A technically clean hurdler with slow flat speed has a lower ceiling.

### 8.3 Middle Distance Evaluation (800m, 1500m)
Middle distance bridges speed and endurance.

**MD-specific evaluation focus:**
- Personal best and season best in primary event
- 800m split pattern: even splits (elite) vs positive splits (frontrunner) vs negative splits (kicker)
- 1500m tactical range: can she lead, sit and kick, or only one style?
- Doubling ability: 800m/1500m double at conference meet
- Indoor mile time as 1500m context
- Cross country results (demonstrates aerobic base)
- Final 200m/400m speed in tactical races

**Key question:** Is this a speed-based middle distance runner (comes from 400m background, closes fast) or an endurance-based middle distance runner (comes from 1500m/XC background, frontrunner)? This determines archetype and development trajectory.

### 8.4 Distance Evaluation (3000m SC, 5000m, 10000m)
Distance evaluation balances marks with tactical acumen and durability.

**Distance-specific evaluation focus:**
- Personal bests across distance events
- Cross country performance (5k/6k; NCAA XC is a major competitive marker)
- Steeplechase-specific: barrier technique, water jump efficiency, 3000m flat time as context
- 5000m vs 10000m specialization
- Championship meet performance (distance events are highly tactical at championship level)
- Split consistency over the race
- Last-mile/last-kilometer acceleration ability
- Altitude adjustment for marks set at altitude venues

**Key question:** Is this a 5000m specialist, a 10000m specialist, a steeplechaser, or a distance generalist? Event specialization matters for development pathway.

### 8.5 Jump Evaluation (HJ, LJ, TJ, PV)
Jumps combine athleticism with highly technical execution.

**Jump-specific evaluation focus:**
- Personal best height/distance (wind-legal for LJ/TJ)
- Season best trajectory
- Consistency: how often does she clear/reach near her best? What is the spread?
- Attempt efficiency: first-attempt clearance rate (HJ/PV), foul rate (LJ/TJ)
- Indoor vs outdoor differential
- Competition count and progression pattern
- Height/distance at which she entered competition vs final mark
- For HJ: approach pattern, bar clearance efficiency
- For LJ: approach speed, takeoff consistency, flight mechanics
- For TJ: phase balance (hop:step:jump ratio; optimal is roughly 35:30:35)
- For PV: grip height, pole stiffness rating, runway approach consistency

**Key question:** Is the limiting factor athletic ability (speed, power, explosiveness) or technical execution (approach, takeoff, flight, landing)? This determines the development trajectory.

### 8.6 Throw Evaluation (SP, DT, HT, JT)
Throws are the most technique-dependent event group.

**WOMEN'S IMPLEMENT WEIGHTS (MANDATORY):**
- Shot Put: 4 kg (8.82 lbs)
- Discus: 1 kg (2.2 lbs), 180mm-182mm diameter
- Hammer: 4 kg (8.82 lbs), 1.067m wire length (shorter than men's 1.175m)
- Javelin: 600 g (1.32 lbs), 2.20-2.30m length

**Throw-specific evaluation focus:**
- Personal best with correct implement weight confirmed
- Season best trajectory
- Consistency: spread between best and average marks (tight spread = reliable; wide spread = inconsistent)
- Foul rate (high foul rate indicates aggressive technique not yet controlled)
- Indoor marks (SP indoor; weight throw 20lb as cross-reference for HT throwers)
- Competition count
- Technique identification: glide vs rotational for SP; identified technique for all throws
- Multi-throw versatility: does she compete in multiple throw events?

**Key question:** Is she a power thrower (raw strength, less technical) or a technical thrower (efficient mechanics, maximizing implement speed)? Power throwers have a lower ceiling; technical throwers have more upside but more variability.

### 8.7 Heptathlon Evaluation
The heptathlon is the ultimate test of athletic versatility.

**Heptathlon events (in order):**
- Day 1: 100m Hurdles (0.838m), High Jump, Shot Put (4kg), 200m
- Day 2: Long Jump, Javelin (600g), 800m

**Heptathlon-specific evaluation focus:**
- Total points (World Athletics scoring tables)
- Individual event point contributions (identify strengths and weaknesses)
- Day 1 vs Day 2 balance (consistent athletes maintain or improve Day 2)
- Event spread: how many events contribute 800+ points? (Elite heptathletes have 5+ events above 800)
- Comparison of heptathlon event marks vs standalone event marks (heptathlon fatigue typically costs 2-5% vs fresh)
- Specific weakness identification: is there a "point leak" event pulling the total down?
- 800m finishing ability (the final event; strong closers gain significant points)

**Heptathlon scoring is NOT standard OPF.** It uses World Athletics point tables where each event mark converts to points, and total points determine the evaluation. PKR for heptathlon is the total points. Component analysis is per-event point contribution.

**Key question:** Is this a balanced heptathlete (6-7 events above 750 points) or a specialist-turned-heptathlete (2-3 dominant events carrying weaker ones)? Balanced athletes have higher ceilings and more consistent scoring.

---

## 9. LEVEL TIER MAP

After producing the Final KR, generate the Level Tier Map showing how this athlete's KR reads against every relevant level legend.

**Format:**
```
LEVEL TIER MAP:
  NCAA D1:  [Legend tier label at this level]
  NCAA D2:  [Legend tier label]
  NCAA D3:  [Legend tier label]
  NAIA:     [Legend tier label]
  NJCAA:    [Legend tier label]
  Pro:      [Legend tier label]
```

**Rules:**
- KR is ONE number. The Level Tier Map shows how that ONE number is INTERPRETED at different levels.
- Do NOT produce multiple KRs. Do NOT "convert" KR between levels.
- The Level Tier Map is a display tool for understanding where an athlete fits across the competitive landscape.

---

## 10. GOVERNANCE

- All process changes require versioning (v1 -> v2 etc.)
- The Phase 3 anchor is truth. The math is confirmation. Not the other way around.
- No evaluation can proceed without Coach Context locked
- All outputs must include confidence %
- Suppression detection is mandatory, not optional
- Pregnancy/motherhood suppression handling is MANDATORY and must be handled with accuracy and respect
- Event-group-specific OPF weights are governed in File 02 and cannot be modified here
- Women's implement weights, hurdle heights, and event specifications are LOCKED and must be verified in every evaluation
- Wind-legal marks are the primary evaluation anchor; wind-aided marks are supplementary only
