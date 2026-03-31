# Hiring Evaluation Process

KaNeXT Hiring Intelligence System - File 01

---

## 0. Purpose

This document defines the complete execution pipeline for producing a Candidate KR. It is the single source of truth for what runs, in what order, what each phase consumes, and what each phase produces. Every phase is deterministic - same inputs, same outputs, every time.

---

## 1. HIRING CONTEXT SETUP

### 1.1 Required Fields

All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. Role Title (exact position being hired for)
2. Role Type (one of: C-Suite/Executive, Head Coach, Assistant Coach, Faculty Tenure-Track, Faculty Adjunct, Admissions/Enrollment, Campus Operations, Technology/Engineering, Administrative/Support)
3. Department (academic department, athletic program, operational division, or corporate function)
4. Institution (FMU, KaNeXT corporate, or future mandate school)
5. Reporting Line (who the hire reports to)
6. Criticality Tier (Mission-Critical, High-Impact, Core Staff, Support Staff)

These fields bind: component KR weights (from Role Type), KLVN normalization bands, Role Type Legend selection, System Fit assessment dimensions, and Compensation Intelligence parameters.

### 1.2 Optional Fields

These do not alter candidate evaluation math. They are consumed by downstream engines (compensation, team composition, succession planning):

1. Budget Range (salary band for the position)
2. Start Date Target
3. Hiring Urgency (standard, expedited, emergency)
4. Backfill vs New Position
5. Team Size (current team the hire joins)
6. Key Relationships (critical internal stakeholders)

### 1.3 Context Lock

When all required fields (1-6) are populated and validated, system state transitions to Hiring Context Locked. This locked context is the binding reference for all downstream evaluation. It cannot be modified mid-evaluation without restarting the pipeline.

---

## 2. CANDIDATE PROFILE BUILD

### 2.1 Identity

- Full legal name
- Known aliases, maiden name, or alternate spellings
- Date of birth (if available)
- Current location
- Willingness to relocate (if out-of-market)

### 2.2 Career Record

For each professional role:
- Employer name
- Title/role
- Start and end dates
- Scope of responsibility (team size, budget authority, geographic scope)
- Key achievements (quantifiable where possible)
- Reason for departure (if known)

### 2.3 Education

- Degrees earned (institution, field, year)
- Certifications and licenses (active/expired, issuing body)
- Continuing education (relevant courses, executive programs)

### 2.4 For Coaching Candidates (Additional)

- Coaching history by program (school, level, role, years)
- Win/loss record by program
- Recruiting classes (rankings, key commits they were primary on)
- Player placements (players who advanced to next level under their coaching)
- System identity (offensive and defensive schemes they have run)
- Compliance record (violations, sanctions, investigations)

### 2.5 Public Record

- Published work (articles, research, patents - for faculty and technology)
- Public speaking (conferences, clinics, keynotes)
- Awards and honors
- Media presence
- Board memberships or advisory roles

### 2.6 Source Attribution

Every data element is tagged with:
- Source (resume, LinkedIn, web search, reference, interview, work product)
- Verification status (verified, unverified, conflicting)
- Date of information

### 2.7 Locked Exclusions (Never in Candidate Profile)

- KR scores or evaluations
- Subjective impressions not backed by evidence
- Protected class information beyond what the candidate voluntarily discloses
- Salary history (unless the candidate volunteers it and the jurisdiction permits)
- Private medical information
- Social media content unrelated to professional capability

---

## 3. CANDIDATE CONFIDENCE GATE

### 3.1 Purpose

Confidence % communicates evidence completeness and stability for a candidate evaluation. It answers: "how much should you trust this KR?"

### 3.2 Output

confidence_pct is a value from 0 to 100. Computed at the end of candidate evaluation.

### 3.3 What It Affects

Confidence % does not change any KR math. It is used for transparency and optionally for gating what the system is allowed to claim or trigger downstream.

### 3.4 Data Tier Auto-Detection

Nexus auto-detects evaluation tier based on data availability. No user choice, no asking.

- Resume + public record only -> V1 (Production-Based)
- Resume + interview(s) + references -> V2 (Interview-Enhanced)
- Full loop (resume + interview + references + work product + on-site) -> V3 (Full Evaluation)

### 3.5 Confidence Ranges

| Data Available | Confidence % |
|---|---|
| Resume only | 25-35% |
| Resume + LinkedIn + public record | 35-45% |
| Resume + public record + 1 interview | 45-55% |
| Resume + 2+ interviews + partial references | 55-70% |
| Full interview loop + full references | 70-80% |
| Full loop + work product review | 80-88% |
| Full loop + work product + on-site + deep references (5+) | 88-95% |

### 3.6 Coaching Candidate Confidence Boost

Coaching candidates benefit from additional verifiable data sources:
- Win/loss record: +3-5% confidence (publicly verifiable)
- Recruiting class rankings: +2-3% confidence (publicly verifiable)
- Player placement history: +3-5% confidence (publicly verifiable)
- Film review of their teams: +5-8% confidence (direct evidence of coaching quality)

These stack with the base confidence from interviews and references, capped at 97%.

### 3.7 Provisional Note

These ranges are v1 placeholders based on structural reasoning. They will be empirically calibrated once the system has processed real candidate data across multiple hiring cycles.

---

## 4. PLAYER EVALUATION ENGINE - MASTER EXECUTION FLOW

Note: In Hiring Intelligence, "Player" is replaced by "Candidate." The pipeline mirrors the basketball intelligence system exactly.

### BLOCK 1 - BASE TRUTH (Role-Agnostic)

Base Truth captures who the candidate IS independent of any specific role context. A candidate's core competencies, leadership capacity, growth trajectory, and suppression history are the same whether they're being evaluated for a Head Coach role or an Athletic Director role.

#### Phase 0: Hiring Context Lock
Must pull from: Hiring Context Setup (Section 1)
All required fields validated. Context locked.
Binds: Role Type, Component KR Weights, Legend Selection, KLVN Level Key

#### Phase 1: Data Tier Detection
Must pull from: Candidate Confidence Gate (Section 3)
Auto-detect V1/V2/V3 based on data available.
Determines which component KR dimensions can be scored at full confidence vs estimated.

#### Phase 2: Candidate Profile Build
Must pull from: Candidate Profile (Section 2)
Build the factual record. No evaluations. No scores. No impressions.

#### Phase 3: Production Anchor (Legend Tier Mapping)

**This is the most important step.** Phase 3 establishes the anchor range by mapping the candidate's career record against the Role Type Legend.

Process: Read the legend tier descriptions for the candidate's target role type. Find the tier whose description matches the candidate's actual career production and demonstrated capability. The description includes achievement language, scope markers, and outcome anchors.

Output: A KR range (e.g., 82-87) representing where this candidate's career profile fits in the legend.

Rules:
- Phase 3 uses the FULL career picture, not just the most recent role
- Phase 3 evaluates demonstrated production, not potential
- Phase 3 does NOT use where the candidate went to school, their age, their network, or their pedigree as primary inputs (these are Tier 3 confirmers, not anchors)
- Tier 3 inputs (school prestige, network connections, reputation) can CONFIRM a range but cannot push it higher than production supports

For Coaching Candidates:
- Phase 3 MUST evaluate the coaching record (wins, player development, recruiting) not just the resume
- A coach with a losing record at an under-resourced program may anchor higher than a coach with a winning record at a stacked program - context matters
- Cross-reference with sports intelligence system for production anchoring

#### Phase 4: Suppression Detection

Must pull from: Suppression Detection framework (File 02, Section 6)

Run BEFORE Phase 6 scoring. Suppression affects how inputs are interpreted.

For each suppression type (Environment, Role, Resource, Bias):
1. Assess whether indicators are present in the candidate's profile
2. If present, quantify the suppression severity (mild, moderate, severe)
3. Compute suppression uplift range
4. Document specific evidence for each suppression claim

Output: Suppression assessment (type, severity, uplift range, evidence) or "No suppression detected."

Suppression does NOT change Phase 3 anchor. It is applied AFTER Phase 6 as an additive adjustment.

#### Phase 5: Component KR Scoring

Score each component KR using available data:

**CKR (Competency KR):**
V1 (resume): Score from career record, credentials, published results. Proxy confidence: 0.50-0.65.
V2 (interview): Add behavioral interview data, scenario responses, reference checks on technical capability. Proxy confidence: 0.70-0.85.
V3 (full loop): Add work product review, on-site assessment, deep reference validation. Confidence: 0.85-0.95.

For coaching candidates: CKR includes Coaching Philosophy Alignment, System Identity, Recruiting Network, Player Development Track Record scored from File 02 Section 5.

**LKR (Leadership KR):**
V1: Score from title progression, team size growth, published outcomes. Proxy confidence: 0.40-0.55.
V2: Add leadership behavioral interview, references specifically on leadership. Proxy confidence: 0.65-0.80.
V3: Add 360 reference feedback, direct observation, peer assessment. Confidence: 0.80-0.92.

**FKR (Fit KR):**
V1: Score from employer history (startup vs corporate), public values indicators. Proxy confidence: 0.30-0.45.
V2: Add culture interview, values discussion, geographic/compensation alignment check. Proxy confidence: 0.60-0.75.
V3: Add on-site visit (did they like the campus, the team, the environment), deep reference on culture fit. Confidence: 0.75-0.90.

For coaching candidates: FKR includes Compliance History and Retention/Culture scored from File 02 Section 5.

**GKR (Growth KR):**
V1: Score from career trajectory (ascending, plateaued, descending), education/training pattern. Proxy confidence: 0.35-0.50.
V2: Add interview assessment of learning velocity, adaptability, self-awareness. Proxy confidence: 0.55-0.70.
V3: Add reference validation of growth pattern, direct evidence of adaptation. Confidence: 0.70-0.85.

**KLVN Application:**
Apply Composite Lambda (Employer Tier x Career Stage x Industry Transition) to CKR inputs only, per File 02 Section 3.

**System Fit Computation:**
Compute System Fit score from five dimensions (Operating Style, Faith Alignment, Autonomy, Pressure Tolerance, Multi-Role Flexibility) per File 02 Section 4. Feed into FKR.

#### Phase 6: OPF Math (Overall Position Factor)

Compute Candidate KR using role-type-specific component weights:

Candidate KR = (CKR x W_ckr) + (LKR x W_lkr) + (FKR x W_fkr) + (GKR x W_gkr)

Where weights are pulled from File 02 Section 1.3 based on Role Type.

This is the Phase 6 Raw output.

### STEP 7: PHASE 6 ADJUSTS WITHIN PHASE 3 +/-10

Phase 3 established the anchor range. Phase 6 produced a raw number. The allowable window = Phase 3 low - 10 through Phase 3 high + 10 (capped at 100).

Phase 6 raw tells the DIRECTION within the window:
- If Phase 6 raw is near or above Phase 3 midpoint: scored components confirm the production anchor. Final KR at or above midpoint.
- If Phase 6 raw is below Phase 3 low: scored components reveal weaknesses not visible in the career record. Final KR at or below midpoint, adjusted by downward signal strength.

Adjustment method: Starting from Phase 3 midpoint, apply directional pressure from Phase 6. Each component KR pushes UP or DOWN relative to expectations for a candidate at the Phase 3 midpoint, weighted by role-type OPF. Strong confirmed weaknesses push down harder. Strong confirmed strengths push up. Total adjustment bounded: maximum -10 from Phase 3 low, maximum +10 from Phase 3 high.

### STEP 8: SUPPRESSION ADJUSTMENT

If suppression was detected in Phase 4, apply the suppression uplift range to the Final KR.

Output: Raw KR and Suppression-Adjusted KR Range.

The Raw KR is the primary output. The Suppression-Adjusted KR Range is the secondary output with reduced confidence.

### STEP 9: RISK FLAG CHECK

Evaluate all Hiring Risk Flags (File 02 Section 7) against candidate data.

If any risk flags trigger:
- Document the flag, the evidence, and the severity
- Risk flags do NOT change KR
- Risk flags are surfaced as companion information alongside the KR

### STEP 10: FINAL CANDIDATE KR

The adjusted number is the Final Candidate KR.

Output includes:
- Final Candidate KR
- KR Range (reflecting confidence interval)
- Confidence %
- Phase 3 anchor (transparency)
- Phase 6 raw (transparency)
- Component KRs: CKR, LKR, FKR, GKR
- System Fit score
- Suppression assessment (if applicable)
- Suppression-Adjusted KR Range (if applicable)
- Risk flags (if any)
- Role Type Legend tier label
- Key strengths and development areas

---

## 5. V1 EVALUATION PROTOCOL (Resume + Public Record Only)

### 5.1 Purpose

V1 is the fast-screen evaluation for candidates where only resume and publicly available information exist. It produces a defensible KR range with explicit confidence limitations.

### 5.2 V1 Pipeline

**Step 1: Set Hiring Context** (Section 1)

**Step 2: Phase 3 - Production Anchor**
Map the candidate's career record against the Role Type Legend.
For coaching candidates: web search for win/loss record, recruiting classes, player placements.
For all candidates: web search for LinkedIn profile, published work, public achievements.

Output: KR anchor range.

**Step 3: Phase 6 - Component KR Scoring with Proxy Confidence**

Score CKR from: resume achievements, credentials, published outcomes. Apply KLVN.
Score LKR from: title progression, team size, scope of responsibility.
Score FKR from: employer type (startup/corporate/institutional), geographic history, public values indicators.
Score GKR from: career trajectory shape (ascending/plateaued/descending).

All scores carry proxy confidence weights (lower confidence than V2/V3).

Compute Candidate KR using role-type OPF weights.

**Step 4: Phase 6 Adjusts Within Phase 3 +/-10**

Same bounding logic as full pipeline.

**Step 5: Suppression Check**

Check for environment, role, resource, and bias suppression from the career record.

**Step 6: Risk Flag Check**

Check for job hopping, termination signals, reference gaps (if applicable), over/under-qualification.

**Step 7: Final V1 KR**

Output with confidence cap per data coverage:

| V1 Data Coverage | Confidence Cap |
|---|---|
| Resume only | 35% |
| Resume + LinkedIn | 40% |
| Resume + LinkedIn + web search results | 45% |
| Resume + LinkedIn + web + coaching record (for coaches) | 55% |

### 5.3 V1 Limitations

V1 CANNOT reliably score:
- FKR (Fit) - culture alignment, faith alignment, operating style preference require conversation
- LKR (Leadership) sub-dimensions like conflict resolution, communication quality, strategic thinking depth
- GKR (Growth) sub-dimensions like coachability, self-awareness, ambition calibration

These dimensions are estimated with low proxy confidence in V1 and refined in V2/V3.

---

## 6. COACHING CANDIDATE EVALUATION PROTOCOL

### 6.1 Purpose

Coaching candidates follow the standard pipeline with mandatory additional steps and cross-references.

### 6.2 Additional Required Steps

1. **System Identity Identification:** Before Phase 3, determine the candidate's coaching system identity (offensive and defensive). This requires web search for their coaching history, clinic presentations, and team performance data.

2. **System Alignment Scoring:** Cross-reference the candidate's system identity against the target program's desired system identity. This feeds directly into CKR_Enhanced.

3. **Recruiting Network Mapping:** Web search for the candidate's recruiting territory, key placements, and pipeline relationships. This feeds into CKR_Enhanced.

4. **Player Development Audit:** Web search for players who developed under this coach. Track advancement to next level, statistical improvement, award accumulation. This feeds into CKR_Enhanced.

5. **Compliance Check:** Web search for the candidate's name in association with violations, sanctions, investigations, or program penalties. This feeds into FKR_Enhanced.

6. **Culture and Retention Check:** Web search for transfer rates from their program, player testimony, assistant coach retention. This feeds into FKR_Enhanced.

### 6.3 Sport-Specific Cross-Reference

For basketball coaching candidates: The basketball intelligence system's offensive system definitions (12 systems) and defensive system definitions (10 systems) are the authoritative reference. The candidate's system identity must be mapped against these definitions.

For football coaching candidates: The football intelligence system's scheme definitions are the authoritative reference.

For all other sports: System identity evaluation uses general coaching philosophy assessment until sport-specific intelligence systems are built.

---

## 7. DATA TIER PROGRESSION

| Data Tier | Components Scored Reliably | Phase 3 Authority | Phase 6 Authority |
|---|---|---|---|
| V1 (resume + public) | CKR (partial), GKR (trajectory only) | Primary - anchors range | Secondary - adjusts within range |
| V2 (+ interviews + references) | CKR, LKR, FKR (partial), GKR | Shared - validates Phase 6 | Shared - growing authority |
| V3 (full loop + work product) | All four at full depth | Secondary - validation check | Primary - drives the KR |

---

## 8. GOVERNANCE

- Same inputs produce same outputs. No randomness, no discretion.
- Every output is traceable to inputs through the Phase 3 anchor and Phase 6 component scores.
- Suppression adjustments are documented with specific evidence.
- Risk flags are surfaced, never hidden.
- Confidence is always disclosed. Low-confidence evaluations are never presented as high-confidence.
- Any change to pipeline steps, confidence ranges, or scoring methods requires documentation, versioning, and approval.
