# MEN'S TRACK AND FIELD - ATHLETE EVALUATION PROCESS v1

## COACH CONTEXT SETUP

### Purpose
Coach Context defines the binding environment for all downstream evaluation. No athlete evaluation, team analysis, simulation, or scouting output can execute until Coach Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Program Name** - e.g., "University of Oregon Men's Track and Field"
2. **Governing Body** - NCAA, NAIA, NJCAA
3. **Division** (if applicable) - NCAA: D1/D2/D3, NJCAA: D1/D2/D3
4. **Conference** - Required for scheduling context and conference standard lookup
5. **Event Group Focus** (optional) - Which event groups the program prioritizes for recruiting/scoring
6. **Facility Context** - Indoor facility (banked/flat), outdoor stadium, altitude (if >1000m)

These fields bind: KLVN normalization, KR legend interpretation, qualifying standard lookups, conference championship context, and confidence gate ranges.

### Optional Constraints (Downstream Only)
These do not alter KR computation. Consumed only by downstream planning systems.

1. Scholarships Available (cannot exceed 12.6 for NCAA D1 men's track)
2. Operating Budget
3. Recruiting Budget
4. Roster Size Target (by event group)
5. Staffing Capacity - event group coaching coverage
6. Training Facility Quality Band - Basic, Standard, Elite

### Context Lock
When all required fields are populated and validated, system state transitions to Coach Context Locked. Cannot be modified mid-evaluation without restarting the pipeline.

---

## ATHLETE PROFILE (Auto-Populated Record)

### A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth
- Age (derived)
- Height (current)
- Weight (current)
- Primary event(s)
- Secondary event(s)
- City/Town of origin
- State/Province
- Country
- High school
- Club program (if applicable)
- Current team affiliation

### B) Career Record (Season-by-Season)
For each competitive season (indoor and outdoor tracked separately):
- Team name
- Competition level
- Season/year label (e.g., 2025 Indoor, 2025 Outdoor)
- Conference
- Eligibility year (Fr/So/Jr/Sr/RS)

### C) Performance Record (The Core Data)

**Personal Records (PRs) - Indoor and Outdoor tracked separately:**
For each event contested:
- Indoor PR (mark, date, meet, location, altitude, timing method)
- Outdoor PR (mark, date, meet, location, altitude, wind reading, timing method)
- Season Best (SB) for current season
- Wind-legal status for each mark
- Altitude flag for each mark (>1000m)
- FAT confirmation for each mark

**Meet Results History:**
For each competition:
- Meet name and level (invitational, dual, conference champs, regionals, nationals)
- Date and location
- Event(s) entered
- Mark(s) achieved
- Place finished
- Round (prelim/semifinal/final)
- Wind reading (sprints, hurdles, horizontal jumps)
- Conditions (temperature, weather)
- Competition quality (field strength)

**Relay Participation:**
- Relay events (4x100m, 4x400m)
- Split times (if available)
- Relay team composition
- Relay marks and placements

### D) Physical Data
- Height, weight, wingspan (if available)
- Body composition notes (if available)
- Injury history (declared/public only)

### E) Academic Record (Public Only)
- GPA (if available)
- Academic eligibility status
- Graduation timeline
- Major/program of study

### F) Recruiting Data (if applicable)
- Recruiting class year
- External rankings (if any)
- Offers list (if public)
- Official/unofficial visits (if public)
- Commitment status

---

## V1 EVALUATION PROTOCOL

V1 is the standard evaluation tier for real athletes using publicly available data: PRs, meet results, competition history.

### Step 1: Set Coach Context
Lock all required fields. Identify the athlete's level and event group.

### Step 2: Collect Performance Data
Search for the athlete's current season and career PRs. For each event:
- Confirm indoor PR and outdoor PR separately
- Confirm wind-legal status for each sprint/hurdle/horizontal jump mark
- Confirm altitude status for each distance mark
- Confirm FAT timing for all marks
- Collect season-best marks for current season
- Collect meet results from championship meets (conference, regionals, nationals)

**Data Sources (priority order):**
1. TFRRS (Track and Field Results Reporting System) - primary source for NCAA results
2. World Athletics database - for international and professional results
3. Athletic.net - for high school results
4. MileSplit - for high school and club results
5. Program/conference websites - for roster and meet result verification
6. Direct Athletics - for meet entries and results

### Step 3: Performance Anchor (Phase 3)

**This is the core difference from team sports: the performance IS the anchor.**

In basketball, the anchor is a production profile mapped against a legend. In track and field, the anchor is the PR itself mapped against event-specific performance tiers.

**Anchoring Protocol:**
1. Take the athlete's best wind-legal, altitude-adjusted, FAT-confirmed PR in their primary event
2. Map it against the event-specific legend for their competitive level
3. This sets the KR floor and ceiling range (the "anchor range")

**Example:** Athlete runs 10.35 wind-legal 100m at NCAA D1.
- Legend lookup: 10.30-10.45 = KR 89-91 (Conference Scorer tier)
- Anchor range: 89-91
- Phase 6 component KRs adjust within this range +/-10

**Multi-Event Athletes:**
- If the athlete competes in multiple events within the same group (e.g., 100m and 200m), anchor off the PRIMARY event (best relative performance vs legend)
- If the athlete competes across event groups (e.g., 200m sprinter who also long jumps), evaluate the primary event group and note secondary event capability

**Indoor vs Outdoor Anchoring:**
- Outdoor PRs are the primary anchor for all outdoor events
- Indoor PRs anchor indoor evaluations
- Indoor marks can inform outdoor projections using standard conversion factors, but the outdoor PR is always the definitive anchor for outdoor evaluation
- Indoor-to-outdoor conversion factors by event are listed in File 02

### Step 4: Component KR Scoring (Phase 6)

Score each component KR for the athlete's event group using the OPF weights in File 02.

**Sprints (100m, 200m, 400m) Component KRs:**

| Component | Weight | Primary Inputs |
|-----------|--------|---------------|
| PKR (Performance) | 0.45 | PR, SB, PR progression, wind-legal marks |
| TKR (Technical) | 0.15 | Start reaction time, drive phase evidence, mechanics notes |
| AKR (Athletic) | 0.15 | Speed profile across distances, anthropometrics, power indicators |
| CKR (Competition) | 0.15 | Championship meet marks, round improvement, consistency |
| IQKR (Race IQ) | 0.10 | Pace execution (esp. 400m), lane adaptation, race management |

**Hurdles (110mH, 400mH) Component KRs:**

| Component | Weight | Primary Inputs |
|-----------|--------|---------------|
| PKR (Performance) | 0.40 | PR, SB, PR progression, wind-legal marks |
| TKR (Technical) | 0.20 | Hurdle clearance, lead leg mechanics, trail leg, rhythm |
| AKR (Athletic) | 0.15 | Sprint speed (flat), flexibility, stride pattern |
| CKR (Competition) | 0.15 | Championship meet marks, consistency, DQ history |
| IQKR (Race IQ) | 0.10 | Hurdle rhythm maintenance, race management, wind adjustment |

**Middle Distance (800m, 1500m) Component KRs:**

| Component | Weight | Primary Inputs |
|-----------|--------|---------------|
| PKR (Performance) | 0.40 | PR, SB, PR progression |
| EKR (Endurance) | 0.15 | Ability to race multiple distances, negative split capability |
| TKR (Tactical) | 0.15 | Race tactics, positioning, move timing |
| CKR (Competition) | 0.20 | Championship performance, tactical racing in big fields |
| IQKR (Race IQ) | 0.10 | Pace judgment, kick timing, response to surges |

**Distance (3000mSC, 5000m, 10000m) Component KRs:**

| Component | Weight | Primary Inputs |
|-----------|--------|---------------|
| PKR (Performance) | 0.35 | PR, SB, PR progression |
| EKR (Endurance) | 0.20 | XC performance, multi-distance capability, altitude performance |
| TKR (Tactical) | 0.15 | Race tactics, positioning, surge responses |
| CKR (Competition) | 0.20 | Championship performance, XC nationals, conference performance |
| IQKR (Race IQ) | 0.10 | Pace judgment, when to lead/follow, kick execution |

**Jumps (HJ, LJ, TJ, PV) Component KRs:**

| Component | Weight | Primary Inputs |
|-----------|--------|---------------|
| PKR (Performance) | 0.40 | PR, SB, PR progression, wind-legal marks (LJ, TJ) |
| TKR (Technical) | 0.20 | Approach, takeoff, flight mechanics, event-specific technique |
| AKR (Athletic) | 0.15 | Explosive power, approach speed, body control |
| CKR (Competition) | 0.15 | Championship marks, consistency (SD of attempts), pass strategy |
| IQKR (Approach IQ) | 0.10 | Adjustment between attempts, height/distance progression strategy |

**Throws (SP, DT, HT, JT) Component KRs:**

| Component | Weight | Primary Inputs |
|-----------|--------|---------------|
| PKR (Performance) | 0.40 | PR, SB, PR progression |
| TKR (Technical) | 0.20 | Delivery mechanics, release angle, ring/runway discipline |
| AKR (Power) | 0.15 | Raw strength indicators, rotational power, size/frame |
| CKR (Competition) | 0.15 | Championship marks, consistency, foul rate |
| IQKR (Implement IQ) | 0.10 | Attempt management, adjustment between throws, implement selection |

**Decathlon Component KR:**
Composite of event-group KRs weighted by World Athletics scoring table contribution. See File 02 for decathlon-specific evaluation protocol.

### Step 5: Phase 6 Adjusts Within Phase 3 +/-10

Phase 6 component KR composite is bounded by the Phase 3 anchor range +/-10 points.

**Example:**
- Phase 3 anchor: 89-91 (from 10.35 100m)
- Phase 6 composite: 87 (strong CKR from championship performance, but lower TKR from mechanical inefficiency)
- Bounded range: 79-101 (anchor +/-10)
- 87 falls within bounds -> Final KR = 87

If Phase 6 composite falls outside the bounded range, flag for review. The performance anchor is truth - if the math disagrees with the mark, the math needs explanation.

### Step 6: Final KR Output

**Required output fields:**
- Athlete name
- Primary event(s)
- Event group
- Level (NCAA D1, D2, D3, NAIA, NJCAA)
- Program
- Indoor PR / Outdoor PR (for primary event)
- Wind status (if applicable)
- Altitude status (if applicable)
- Final KR (single number, one decimal)
- Component KRs: PKR, TKR, AKR/EKR, CKR, IQKR (each one decimal)
- Confidence % (see Confidence Gate below)
- Level Tier Map (KR read against multiple level legends)
- Archetype assignment (from File 02)
- Badges earned (from File 02)
- KR Range (low-high reflecting uncertainty)
- Key strengths
- Key development areas
- Notes (wind, altitude, timing, injury, any data flags)

---

## CONFIDENCE GATE

Confidence reflects data completeness. Higher confidence = more data points informing the evaluation.

### Confidence Bands

**90-100% (High Confidence):**
- Multiple seasons of verified results
- Championship meet data available
- Wind-legal PRs confirmed
- FAT timing confirmed
- Round-by-round data from major meets
- Split times or sector data available
- Consistent pattern across meets

**75-89% (Moderate Confidence):**
- At least one full season of results
- PR verified through TFRRS or equivalent
- Championship meet data may be limited
- Some component KRs informed by fewer data points

**60-74% (Low-Moderate Confidence):**
- Limited meet results (fewer than 5 competitions)
- PR from single meet only
- No championship meet data
- Some component KRs rely on inference

**Below 60% (Low Confidence):**
- Very limited data
- PR unverified or from non-standard conditions
- Hand timing, unknown wind, altitude concerns
- Evaluation should be flagged as provisional

### Confidence Adjustments
- Wind-aided PR only (no wind-legal equivalent): -10% confidence
- No championship meet data: -5% confidence
- Single season only: -5% confidence
- Hand timing not converted: evaluation blocked (must convert to FAT equivalent)
- Altitude-assisted marks with no sea-level equivalent: -5% confidence

---

## WIND, ALTITUDE, AND TIMING PROTOCOLS

### Wind Protocol (Sprints: 100m, 200m; Hurdles: 110mH; Jumps: LJ, TJ)
- Wind-legal: wind reading of +2.0 m/s or less
- Wind-aided: wind reading greater than +2.0 m/s
- Wind-aided marks are reported but CANNOT anchor PKR at face value
- Wind adjustment formula: For every +1.0 m/s above legal, subtract approximately 0.05s (100m) or 0.10s (200m) from the mark
- These are approximations - exact adjustment depends on the mark range. File 02 contains detailed wind conversion tables.
- If only wind-aided marks exist, use converted mark and flag confidence reduction

### Altitude Protocol (Distance events: 800m+, and throws)
- Sea level = standard reference (0-300m elevation)
- Moderate altitude: 300-1000m - negligible adjustment
- Significant altitude: 1000-1500m - flag, minor adjustment for distance events
- High altitude: >1500m - mandatory adjustment for distance events
- Sprint events benefit minimally from altitude (lower air resistance)
- Throws benefit from altitude (lower air resistance on implement)
- Altitude-adjusted conversions are in File 02

**Key altitude venues to flag:**
- Albuquerque, NM (~1600m) - major indoor venue
- Colorado Springs, CO (~1840m)
- Flagstaff, AZ (~2100m) - training base, some competitions
- Mexico City (~2240m)
- Nairobi, Kenya (~1795m)
- Addis Ababa, Ethiopia (~2355m)

### Timing Protocol
- FAT (Fully Automatic Timing) is the only valid timing method for KR evaluation
- Hand timing adjustment: add +0.24s to hand-timed marks for events up to and including 400m
- Hand timing beyond 400m: add +0.14s
- If timing method is unknown, assume hand timing and apply adjustment (conservative approach)
- Photo finish confirmation preferred for sprint events

---

## MULTI-EVENT ATHLETE EVALUATION

### Athletes Competing in Multiple Events Within One Group
- Evaluate the primary event (best legend-relative performance)
- Note secondary event marks as supporting evidence
- Component KRs may be informed by performance across events (e.g., a 100m/200m sprinter's 200m time informs speed endurance within AKR)

### Athletes Competing Across Event Groups
- Evaluate the primary event group
- Secondary event group noted but not merged into primary KR
- Exception: Decathletes are evaluated under the Decathlon framework (File 02)

### Relay-Only Athletes
- Relay split times can inform individual evaluation if verified
- Relay splits are less reliable than individual marks (running start, adrenaline, non-standard conditions)
- Confidence reduction of -10% if relay split is the only mark available

---

## PR PROGRESSION AND TRAJECTORY

PR trajectory is a critical input for development projection (File 06) but also informs current evaluation:

### Trajectory Categories
- **Rapid Improver:** PR improved by >2% in current season vs previous season
- **Steady Improver:** PR improved by 0.5-2% in current season
- **Plateaued:** PR within 0.5% of previous season best
- **Regressing:** Current season best is worse than previous season PR

### Trajectory Impact on Component KRs
- Rapid improvement trajectory adds +1-2 to AKR (physical development still occurring)
- Plateau or regression flags injury review or training ceiling assessment
- First-year college athletes with HS PRs only: trajectory assessment deferred until mid-season

---

## CROSS COUNTRY AS DISTANCE EVALUATION INPUT

For middle distance and distance athletes, cross country (XC) performance is a valid input:
- XC results inform EKR (endurance) and CKR (competition performance)
- XC does not produce a standalone PKR because courses are non-standard (distance, terrain, elevation vary)
- XC national meet results are high-value CKR inputs
- XC conference results inform CKR at the conference level
- XC improvement from season to season informs trajectory assessment
