# ADMISSIONS EVALUATION PROCESS
## v1.0 - Student Evaluation Pipeline

---

# INSTITUTIONAL CONTEXT SETUP

## Institutional Context Setup - v1 (LOCKED)

### Purpose
Institutional Context defines the binding environment for all downstream evaluation. No student evaluation, class analysis, retention scoring, or financial aid optimization can execute until Institutional Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Institution Name**
2. **Institution Type** - Must match one of: Elite Private, Research University (R1), Regional State, HBCU, Faith-Based, Community College, Trade/Technical, Online/Non-Traditional
3. **Accreditation Body** - Regional (HLC, MSCHE, NECHE, NWCCU, SACSCOC, WSCUC) or National (ACICS, DEAC, ABHES, etc.)
4. **Degree Levels Offered** - Certificate, Associate, Bachelor's, Master's, Doctoral
5. **Title IV Status** - Yes/No (determines FAFSA eligibility and federal financial aid availability)
6. **Primary Delivery Mode** - In-Person, Online, Hybrid
7. **Enrollment Size Band** - Micro (under 500), Small (500-2,000), Medium (2,000-10,000), Large (10,000-25,000), Very Large (25,000+)

These fields bind: KLVN normalization bands, Institution Legend selection, System Fit computation, retention risk thresholds, and financial aid optimization parameters.

### Optional Metadata
1. Conference/Athletic Association (if applicable)
2. Religious Affiliation (if applicable)
3. Minority-Serving Institution designation (HBCU, HSI, TCU, AANAPISI, PBI)
4. Carnegie Classification
5. US News Tier/Ranking (for context, not for KR computation)
6. State/Region

Non-blocking if blank. Used for contextual enrichment and peer comparison but does not affect evaluation math directly.

### Optional Constraints (Downstream Only)
These fields do not alter component KR scoring or Student KR computation. They are consumed only by downstream planning and recommendation systems (Financial Aid Optimization, Revenue Modeling, Retention Intervention, Class Composition targets).

1. Total Enrollment Target (by term)
2. Total Financial Aid Budget
3. Merit Aid Pool
4. Need-Based Aid Pool
5. Endowed Scholarship Parameters
6. Tuition Rate (per credit and/or flat rate)
7. Room and Board Rate (if applicable)
8. Fee Schedule
9. Target Tuition Discount Rate
10. Target Retention Rate
11. Target Graduation Rate
12. Program-specific enrollment targets

### Context Lock
When all required fields (1-7) are populated and validated, system state transitions to Institutional Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

### Governance
Institution Type must exactly match the 8 defined types. Enrollment Size Band must exactly match defined bands. Any change to required fields, validation rules, or downstream bindings requires documentation, versioning, and approval.

---

# STUDENT PROFILE

## Student Profile (Auto-Populated Record)

### A) Identity
- Full legal name
- Known aliases / alternate spellings
- Date of birth
- Age (derived)
- Gender (self-reported)
- Race/Ethnicity (self-reported, for institutional reporting only)
- Citizenship/Residency status (citizen, permanent resident, international, undocumented)
- In-state/Out-of-state (for tuition classification)
- City/Town of origin
- State/Province
- Country
- High school name and type
- High school graduation date
- Current institution affiliation (if enrolled)

### B) Academic Record
For each institution attended:
- Institution name
- Dates of attendance
- Degree program / Major / Minor
- Credits attempted
- Credits earned
- GPA (institutional)
- GPA (cumulative, if multi-institution)
- Class standing (freshman, sophomore, junior, senior)
- Academic honors (Dean's List, awards, recognitions)
- Academic standing (good standing, probation, suspension)
- Course-level data (if available): course name, grade, credits, term

### C) Test Scores (If Available)
- SAT (total, EBRW, Math)
- ACT (composite, English, Math, Reading, Science)
- AP/IB exam scores
- Placement test scores (Accuplacer, ALEKS, institutional)
- Graduate admission tests (GRE, GMAT, LSAT, MCAT - if applicable)

### D) Financial Profile
- Expected Family Contribution (EFC) or Student Aid Index (SAI)
- FAFSA completion status
- Financial aid package (grants, scholarships, loans, work-study)
- Unmet need
- Balance due
- Payment plan status
- External scholarship amounts

### E) Engagement Record
- Campus organizations (membership, leadership roles, dates)
- Community service hours (documented)
- Employment (employer, position, hours/week, dates)
- Internships (organization, role, dates, paid/unpaid)
- Attendance records (if tracked)
- LMS engagement metrics (login frequency, discussion posts, assignment submission timeliness)
- Campus event attendance (if tracked)
- Advising meeting attendance

### F) Advising Notes
- Academic advising notes (with dates and advisor name)
- Financial aid counseling notes
- Career counseling notes
- Personal counseling referrals (existence noted, content confidential)
- Faculty referrals or concerns

### G) Application Materials (Prospective Students)
- Application essay themes (scored, not stored verbatim)
- Recommendation letter themes (scored, not stored verbatim)
- Interview assessment (if conducted)
- Campus visit record
- Engagement signals (email opens, portal logins, event RSVPs)

### H) Source Attribution + Trust Metadata (Per Field)
- Source for each element (SIS, application, self-report, external verification)
- Verification status: verified / unverified / self-reported
- Known coverage gaps (missing semesters, missing test scores, etc.)

### Locked Exclusions (never in Student Profile)
- KR ratings or evaluations
- Badges or labels
- System fit scores
- Retention risk predictions
- Revenue projections
- Subjective admissions opinions
- Private medical records (only documented accommodations)
- Family financial details beyond what FAFSA/aid process provides

---

# STUDENT CONFIDENCE GATE

## Student Confidence Gate - v1 (LOCKED STRUCTURE, PROVISIONAL RANGES)

### Purpose
Confidence % is a single number that communicates evidence completeness and stability for a student evaluation. It answers: "how much should you trust this KR?"

### Output
confidence_pct in [0, 100]. Computed at the end of student evaluation.

### What It Affects
Confidence % does not change any KR math. It is used for transparency and optionally for gating what the system is allowed to claim or trigger downstream.

### Confidence Ranges (Provisional - v1)

| Data Available | Confidence % |
|---------------|-------------|
| Self-reported data only (name, estimated GPA, no transcript) | 25-40% |
| Application materials only (self-reported + essay + recs, no transcript) | 35-50% |
| GPA only (official transcript, no test scores, no engagement data) | 40-55% |
| GPA + test scores (official) | 55-70% |
| GPA + test scores + course-level data | 65-78% |
| Full transcript + test scores + engagement data | 75-85% |
| Full transcript + test scores + engagement data + advising notes | 80-90% |
| Full transcript + test scores + engagement + advising + interview + multi-semester trend | 85-95% |

### Provisional Note
These ranges are v1 placeholders. They will be empirically calibrated once the system has processed real student data across multiple institution types. Calibration method: compute KR from complete data, recompute from partial data, measure gap distribution. The gap distribution sets honest confidence ranges.

### Governance
Any change to confidence ranges or gating rules requires documentation, versioning, and approval.

---

# STUDENT EVALUATION ENGINE - MASTER EXECUTION FLOW

## Student Evaluation Engine - Master Execution Flow (LOCKED)

### Purpose
This document defines the complete execution order for producing a student's Final Student KR. It is the single source of truth for what runs, in what order, what each phase consumes, and what each phase produces. Every phase is deterministic - same inputs, same outputs, every time.

### Architecture
The pipeline has two blocks.

Block 1 builds the student's Base Truth - who they are independent of any specific institutional context. This never changes regardless of which institution is evaluating them. A student's Base Truth is the same whether they apply to Harvard or a community college.

Block 2 applies Institutional Context - how this student fits within the specific institution's environment, programs, culture, and financial structure. This reruns when the institutional context changes. Base Truth does not.

---

## BLOCK 1 - BASE TRUTH (Institution-Agnostic)

### Phase 0: Institutional Context Setup
**Must pull from:** Institutional Context Setup

Institution completes all required fields: Institution Name, Institution Type, Accreditation, Degree Levels, Title IV Status, Delivery Mode, Enrollment Size Band. Optional metadata and constraints stored for downstream use.

System state after completion: Institutional Context Locked. No evaluation proceeds until this lock is achieved.

Binds: KLVN institution lambda, Institution Legend selection, System Fit parameters, retention thresholds.

### Phase 1: Data Tier Detection
**Must pull from:** Student Confidence Gate

Nexus auto-detects the available data tier based on what is in the Student Profile:
- **Tier 1 (Minimal):** Self-reported data or application materials only. Confidence 25-50%.
- **Tier 2 (Partial):** Official GPA, possibly test scores, limited engagement data. Confidence 40-70%.
- **Tier 3 (Standard):** Full transcript, test scores (if test-submitting), some engagement data. Confidence 65-85%.
- **Tier 4 (Complete):** Full transcript, test scores, engagement data, advising notes, multi-semester trends, interview. Confidence 80-95%.

This determines which component KR inputs produce scores vs return UNSCORED (null).

### Phase 2: Student Profile Build
**Must pull from:** Student Profile (Auto-Populated Record)

Nexus builds the factual record: identity, academic history, test scores, financial profile, engagement record, application materials. No KRs. No badges. No evaluations of any kind.

### Phase 3: Production Anchor
**Must pull from:** Institution Legend (at the target institution's type)

This is the PRIMARY KR determinant. Before computing any component KRs, map the student's overall academic and engagement profile against the Institution Legend tier descriptions. Find the tier whose PROFILE DESCRIPTION matches this student's production. That tier's KR range IS the anchor.

**Phase 3 Anchoring Rules:**

a. **Anchor against PRODUCTION PROFILE, not labels.** The GPA, test scores, course rigor, engagement level, and completion rate determine the tier. Awards, titles, and prestige labels confirm placement - they do not determine it.

b. **Awards are confirmation, not input.** National Merit Scholar, valedictorian, Eagle Scout - these confirm you are in the right tier. They do not override the underlying production numbers.

c. **High school prestige does not inflate KR.** Attending a prestigious high school is a KLVN input, not a KR input. It adjusts how we interpret GPA (normalization), not the KR itself.

d. **Legacy, donor status, and connections are invisible to KR.** The system evaluates academic production, professional readiness, engagement, and growth potential. Nothing else.

e. **Read the numbers first. Check labels second.** Find the tier where the production numbers match. Then verify the label makes sense. If the numbers say 75-79 but you feel the student "deserves" more because of a compelling essay, the numbers win. The essay informs IQKR, not the anchor.

f. **Test-optional students are anchored on available data.** If no test scores exist, anchor on GPA, rigor, and completion rate. Do not penalize for missing test data - adjust confidence instead.

**Output:** Anchor KR range (e.g., 80-84 at Regional State University)

### Phase 4: Component KR Scoring
**Must pull from:** Component KR definitions (AKR, PKR, EKR, IQKR) in File 02
**Must pull from:** KLVN normalization tables in File 02

Score all four component KRs against the available data:
- **AKR:** GPA band + test score modifier + rigor modifier + trend modifier + completion modifier + award modifier, with KLVN normalization applied
- **PKR:** Work experience band + certification modifier + portfolio modifier + entrepreneurial modifier + military modifier
- **EKR:** Extracurricular band + leadership modifier + service modifier + campus modifier + attendance modifier + participation modifier
- **IQKR:** Trajectory band + self-advocacy modifier + resource utilization modifier + adaptability modifier + first-gen modifier + ESL modifier

Each component bounded to [0, 100]. Components with insufficient data return UNSCORED (null) rather than a guess.

**KLVN normalization applied during AKR scoring:**
- Institution lambda adjusts for grading standards across institution types
- High school lambda adjusts for incoming students' HS context
- Socioeconomic adjustments applied where documented

**Output:** AKR, PKR, EKR, IQKR (each 0-100 or null)

### Phase 5: Program Weighting + Base KR
**Must pull from:** Program Trait Weighting (OPF) in File 02

Apply program-specific OPF weights to compute Base Student KR:

Base_Student_KR = (AKR_final * OPF_akr) + (PKR * OPF_pkr) + (EKR * OPF_ekr) + (IQKR * OPF_iqkr)

UNSCORED components contribute zero weight. Remaining scored components renormalize to carry the full weight within their category.

If the student is undeclared, use the Undeclared OPF (AKR 30%, PKR 15%, EKR 20%, IQKR 35%).

**Output:** Base Student KR

### Phase 6: Anchor Adjustment
**Must pull from:** Phase 3 anchor range

Phase 5 produced a math-derived Base Student KR. Phase 3 produced a production-anchored KR range. Phase 6 reconciles them.

**Rules:**
- If Base Student KR falls within the Phase 3 anchor range: Final = Base Student KR. No adjustment needed.
- If Base Student KR is above the anchor range by 5 or less: Final = top of anchor range. The math ran slightly hot, but within tolerance.
- If Base Student KR is below the anchor range by 5 or less: Final = bottom of anchor range. The math ran slightly cold, but within tolerance.
- If Base Student KR diverges from the anchor range by more than 5: Flag for manual review. Something is misaligned - either the legend mapping was wrong or the component scoring has a data issue. Do NOT auto-adjust. Surface the discrepancy.

The anchor is the center of gravity. The math adjusts within it. The math never overrides it.

**Output:** Adjusted Student KR

### Phase 7: Suppression Detection
**Must pull from:** Suppression Library in File 02

Evaluate all suppression triggers against the student's profile data:
- Work suppression (20+ hours/week employment)
- Family suppression (caretaker responsibilities)
- Health suppression (documented conditions)
- Environmental suppression (food insecurity, housing instability, transportation barriers)
- Language suppression (ESL)
- First-generation suppression (no family college experience)

For each detected suppression factor:
1. Document the suppression type and severity level
2. Estimate GPA suppression range
3. Compute estimated ceiling KR (what the student's KR would likely be without the suppression factor)
4. Flag for downstream consumption (financial aid, retention, advising)

Suppression does NOT change the computed KR. It adds interpretive context.

**Output:** Suppression flags with estimated ceiling, no KR modification

### Phase 8: Badge Assignment
**Must pull from:** Badge Library in File 02

Evaluate each badge against the student's profile data. Badges are binary - the student qualifies or does not.

Unlike basketball badges, student badges do not have tiered effects (Bronze/Silver/Gold) and do not modify KR. They are descriptive labels that add context for admissions decisions, retention intervention, and advising.

**Output:** Badge list

### Base Truth Lock
At this point, the following are locked and cannot change without restarting the pipeline:
- Four component KRs (AKR, PKR, EKR, IQKR, including UNSCORED flags)
- Program-weighted Base Student KR
- Anchor-adjusted Student KR
- Suppression flags and estimated ceilings
- Badge list

This is the student's institution-agnostic identity. It is the same regardless of which institution evaluates them.

---

## BLOCK 2 - INSTITUTIONAL CONTEXT

### Phase 9: System Fit
**Must pull from:** System Fit definitions in File 02
**Must pull from:** Institutional Context (locked)

Compute System Fit across four dimensions:
- **Learning Style Fit:** Match student's learning patterns against institution's primary delivery mode and pedagogy
- **Campus Culture Fit:** Match student's background and preferences against institution's size, setting, and culture
- **Academic Support Fit:** Match student's IQKR and self-direction level against institution's support model
- **Financial Fit:** Compute gap between cost of attendance and student's financial resources

System_Fit_Pct = (Learning_Fit * 0.25) + (Culture_Fit * 0.20) + (Support_Fit * 0.20) + (Financial_Fit * 0.35)

System Fit does NOT change Student KR. It is a separate metric that informs admissions decisions, yield prediction, and retention modeling.

**Output:** System Fit % (0-100), per-dimension scores

### Phase 10: Retention Risk Scoring
**Must pull from:** Retention Risk Flags in File 02

Evaluate all retention risk triggers against the student's profile:
- Financial strain
- Academic probation
- Engagement drop
- Social isolation
- Transfer intent
- Life event
- Registration gap
- Credit velocity decline

Score each flag, sum to total risk score, assign risk tier (Critical / High / Moderate / Low-Moderate / Low).

For enrolled students, this runs against current-semester data. For prospective students, this runs as a projection based on profile characteristics (e.g., high financial gap = Financial Strain flag projected).

**Output:** Risk flags, total risk score, risk tier, intervention recommendations

### Phase 11: Finalization
**Must pull from:** Institution Legend (from Institutional Context)
**Must pull from:** Student Confidence Gate

1. Interpret the Anchor-Adjusted Student KR against the Institution Legend: "At [Institution Type], this KR = [Legend Tier Label]."
2. Compute confidence_pct from the Confidence Gate table based on data tier.
3. Assemble the complete evaluation output.

**Output:**
- Final Student KR (locked)
- Component KRs: AKR, PKR, EKR, IQKR
- Legend tier label at current institution type
- System Fit % with per-dimension breakdown
- Suppression flags with estimated ceilings
- Badge list
- Retention risk tier with flag details
- Confidence %
- Full audit trail (every input, every computation, every output)

---

# CONTEXTUAL MODE

## Contextual Mode - Student KR Estimation From Limited Data

### v1 (LOCKED)

### Purpose
Contextual Mode exists to produce an honest KR range for students who cannot be evaluated through the full pipeline because required data does not exist. This is common for prospective students evaluated from application materials alone, transfer students with incomplete transcript transfers, or early inquiries where only self-reported data is available.

Contextual Mode answers one question: Given everything available about this student, what KR range is defensible, and what is the confidence boundary around it?

### Authority
Contextual Mode sits outside the Student Evaluation Engine Master Flow (Block 1 + Block 2). It does not execute the full pipeline. It produces ESTIMATES of what the pipeline outputs would likely be, with explicit confidence and uncertainty disclosure.

When full data becomes available, Contextual Mode output is archived and replaced by the full pipeline output.

### Execution

**Step 1: Gather all available data.** Application materials, self-reported GPA, test scores (if any), engagement descriptions, recommendation themes, essay quality indicators, campus visit observations.

**Step 2: Map against Institution Legend.** Using the available data, identify the 2-3 most likely legend tiers. If the data is very limited, the range may span 3+ tiers.

**Step 3: Estimate component KRs.** For each component with available data, score it. For components without data, mark UNSCORED and note the impact on confidence.

**Step 4: Produce range estimate.** Output format: "Estimated KR: [low]-[high] at [Institution Type]. Confidence: [X]%."

**Step 5: Document uncertainty.** "What We Know: [list of scored components and data points]. What We Don't Know: [list of unscored components and missing data]. What Would Change the Estimate: [list of data that would narrow the range]."

### Contextual Mode Rules
1. Never produce a single-point estimate from Contextual Mode. Always a range.
2. The range must be honest. If data only supports a 15-point range, say so. Do not narrow artificially.
3. Confidence from Contextual Mode is always lower than confidence from the full pipeline. If the full pipeline would produce 80% confidence, Contextual Mode produces 55-65%.
4. When full pipeline data arrives, Contextual Mode output is SUPERSEDED entirely. It is not averaged, blended, or combined with the full output.

---

# SUPPRESSION DETECTION RULES

## Purpose
Detailed rules for identifying, documenting, and surfacing academic suppression. These rules govern how suppression is detected in Phase 7 of the pipeline.

### Rule 1: Documentation Required
Suppression is ONLY flagged when supported by documented evidence: financial aid records (work hours, EFC), advising notes (family responsibilities, health issues), disability services registration, self-report on application or intake survey, LMS/attendance data showing pattern consistent with external demands.

The system never infers suppression from demographics alone. Being from a low-income zip code does not automatically trigger socioeconomic suppression. Having a Hispanic surname does not automatically trigger first-generation suppression. Only documented individual-level data triggers flags.

### Rule 2: Multiple Suppressions Are Additive But Capped
A student may experience multiple simultaneous suppression factors. Total estimated GPA suppression is capped at 1.5 points (on a 4.0 scale) even if the theoretical sum exceeds this. Rationale: beyond a certain point, suppression factors overlap and interact rather than stacking independently.

### Rule 3: Ceiling Estimates Are Conservative
The suppression ceiling estimate (what the student's KR would be without suppression) always uses the LOWER bound of the estimated recovery range. If removing work suppression might add 0.3-0.6 GPA points, the ceiling estimate uses the 0.3 addition for the lower bound and 0.6 for the upper bound.

### Rule 4: Suppression Never Changes KR
This is absolute. Suppression adds context. It never modifies the number. The KR reflects what the student HAS PRODUCED, not what they might produce in a different context. The suppression ceiling tells downstream engines what is POSSIBLE.

### Rule 5: Suppression Is Time-Bound
Suppression factors must be current or recent (within the most recent academic year) to be flagged. A student who worked 40 hours/week three years ago but has not worked during the most recent year does not carry a current work suppression flag - though their historical suppression may be noted in advising context.

### Rule 6: Recovery Trajectory Is a Signal
A student whose GPA improved after a suppression factor was removed (quit job, received housing, got accommodation) provides real-world calibration data. The magnitude of the GPA improvement validates the suppression estimate for similar students.

---

# MULTI-INSTITUTION PROTOCOL

## Purpose
When a student is being evaluated by or for multiple institutions simultaneously (common for prospective students applying to several schools, or transfer students exploring options), the Multi-Institution Protocol ensures consistent evaluation across contexts.

### Rules

1. **Base Truth is computed once.** The student's component KRs, Base Student KR, suppression flags, and badges are institution-agnostic. They are computed once and reused across all institutional contexts.

2. **System Fit reruns per institution.** Each institution has its own learning environment, campus culture, support model, and financial structure. System Fit is computed separately for each.

3. **Legend interpretation differs per institution.** The same KR of 82 is interpreted differently at an Ivy (Solid Admit) vs a Community College (Average Student). Each institution reads the KR against its own legend.

4. **Retention risk projection differs per institution.** Financial fit varies by tuition cost. Support model varies by institution type. The same student may be Low Risk at one school and High Risk at another.

5. **The student's KR does not change across institutions.** A student is a KR 82 everywhere. What changes is the INTERPRETATION of that KR and the FIT with each institution's environment.

---

# EVALUATION OUTPUT FORMAT

## Standard Output (Full Pipeline)

```
STUDENT EVALUATION - [Student Name]
Institution: [Name] ([Type])
Program: [Major/Program]
Evaluation Date: [Date]
Data Tier: [1/2/3/4]

STUDENT KR: [XX.X]
Legend Tier: [Label] at [Institution Type]

COMPONENT KRs:
- AKR (Academic): [XX.X] / 100
- PKR (Professional): [XX.X] / 100
- EKR (Engagement): [XX.X] / 100
- IQKR (Growth IQ): [XX.X] / 100

SYSTEM FIT: [XX]%
- Learning Style: [XX]%
- Campus Culture: [XX]%
- Academic Support: [XX]%
- Financial: [XX]%

SUPPRESSION: [None / List with severity and estimated ceiling]
BADGES: [List]
RETENTION RISK: [Tier] (Score: [XX])
- Active Flags: [List]

CONFIDENCE: [XX]%

PHASE 3 ANCHOR: [Range] at [Institution Type]
PHASE 6 ADJUSTMENT: [Direction and magnitude]
```

## Contextual Mode Output

```
STUDENT EVALUATION (CONTEXTUAL MODE) - [Student Name]
Institution: [Name] ([Type])
Program: [Major/Program]
Evaluation Date: [Date]

ESTIMATED KR RANGE: [XX] - [XX]
Estimated Legend Tier: [Label(s)] at [Institution Type]

WHAT WE KNOW:
- [Scored components with data points]

WHAT WE DON'T KNOW:
- [Unscored components and missing data]

WHAT WOULD NARROW THE ESTIMATE:
- [Specific data that would increase confidence]

CONFIDENCE: [XX]%
```

---

## VERSION HISTORY
- v1.0: Initial build. Institutional Context Setup, Student Profile, Confidence Gate, 11-phase Master Execution Flow (Block 1: Base Truth, Block 2: Institutional Context), Contextual Mode, Suppression Detection Rules, Multi-Institution Protocol, output format templates. Architecture mirrors basketball File 01.
