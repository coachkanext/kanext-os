# ADMISSIONS RECRUITMENT OPS & ENROLLMENT OPS
## v1.0 - Application Intelligence, Decision Framework & Enrollment Event Operations

---

# RECRUITMENT CONFIDENCE GATES

## Recruitment Confidence Gates - Prospect + Post-Decision (Locked Tables)

### Purpose
Confidence % communicates evidence completeness and reliability for recruitment intelligence (pre-admission) and post-decision analysis (after enrollment outcome is known). Computed at the end of the respective packet. Does not change any KR values or admission recommendations - it qualifies reliability only.

### Data Tier Reference
| Tier | Definition |
|------|-----------|
| T1 - Inquiry Only | Name and contact info, maybe self-reported GPA and intended major. No transcript, no test scores, no engagement data. |
| T2 - Application Received | Self-reported data plus application materials (essay, recommendations, activities list). No official transcript yet. |
| T3 - Complete Application | Official transcript, test scores (if submitting), verified activities, recommendation letters, application essay. |
| T4 - Complete + Engagement | T3 plus campus visit, interview, demonstrated interest signals (email engagement, portal activity, event attendance). |
| T5 - Enrolled Student | Full institutional data: registrar records, LMS engagement, attendance, advising notes, financial aid actuals, multi-semester trend. |

### Recruitment Confidence Gate (Pre-Admission)
| Data Available | Confidence % |
|---------------|-------------|
| T1: Inquiry only (name, self-reported interest) | 15-30% |
| T1 + geographic/demographic overlay from purchased lists | 20-35% |
| T2: Application received, self-reported data | 30-45% |
| T2 + strong recommendation letters with specific academic detail | 35-50% |
| T3: Complete application with official transcript | 55-70% |
| T3 + standardized test scores | 60-75% |
| T3 + test scores + multi-year transcript trend visible | 65-80% |
| T4: Complete + campus visit conducted | 70-82% |
| T4 + interview completed with structured assessment | 75-88% |
| T4 + financial aid package offered and response received | 78-90% |

### Recruitment Confidence Adjusters
- **High school profile available:** School report with class rank context, grading rigor data, college-going rate. Upshift 3-5%.
- **Naviance or Scoir data match:** Can compare this student to historical applicants from the same school who enrolled. Upshift 5-8%.
- **Contradictory signals:** Self-reported GPA differs from transcript, recommendation tone does not match grades, engagement signals conflict (high visit activity but no portal login). Downshift 5-10%.
- **Legacy applicant or alumni connection:** Additional context available from alumni records. Upshift 2-3% (for data completeness, not preference).
- **International applicant without credential evaluation:** Transcript from unfamiliar system, no WES/ECE evaluation. Downshift 10-15%.
- **Test-optional with no scores:** Missing one data dimension entirely. Downshift 5-8%.

### Post-Decision Confidence Gate
| Data Available | Confidence % |
|---------------|-------------|
| Enrollment outcome only (enrolled/not enrolled) | 40-55% |
| Enrollment outcome + survey response (why they chose/declined) | 55-70% |
| Enrollment outcome + competitive admit data (where else accepted) | 60-72% |
| Enrollment outcome + first semester performance data | 70-82% |
| Full first-year data (academic, engagement, retention, financial) | 80-90% |
| Multi-year enrolled student data | 85-95% |

### Post-Decision Confidence Adjusters
- **High yield rate from this school/segment historically:** Pattern data increases projection accuracy. Upshift 3-5%.
- **Non-response to yield survey:** Cannot confirm reason for decision. Downshift 5-10%.
- **Unusual cycle (pandemic, policy change, competitor action):** Historical patterns less reliable. Downshift 5-10%.

---

# APPLICATION REVIEW PROTOCOL

## Purpose
The Application Review Protocol standardizes how applications are evaluated using the Student KR framework. It ensures every application goes through the same deterministic process, reducing bias and increasing consistency.

This protocol does NOT make admission decisions. It produces intelligence that informs decisions. Humans decide.

## Phase 1: Application Triage

### Purpose
Quickly categorize applications into review tracks based on data completeness and preliminary KR estimate.

### Triage Categories
| Category | Criteria | Review Track |
|----------|---------|-------------|
| Express Admit | Complete application, Student KR estimate above institutional auto-admit threshold (if set), no flags | Fast-track review (1 reviewer) |
| Standard Review | Complete application, Student KR estimate within normal range | Standard review (2 reviewers) |
| Holistic Review | Complete application but KR below standard threshold AND suppression flags OR compelling qualitative factors | Committee review (3+ reviewers, holistic context) |
| Incomplete | Missing required materials | Hold with outreach to complete |
| Ineligible | Does not meet absolute minimum requirements (e.g., no diploma, criminal background disqualifier if applicable) | Deny with explanation |

### Auto-Admit Threshold (Institution-Set)
Institutions that use auto-admit (common at larger schools) set a KR threshold above which applicants are automatically admitted without holistic review. This threshold is institution-specific and typically maps to a Student KR that predicts high retention and academic success.

Example: A Regional State University might set auto-admit at Student KR 85+ with complete application. An open-admission CC would not use auto-admit (all applicants are admitted by policy).

The engine computes the KR estimate and flags applications that meet the threshold. A human confirms.

## Phase 2: Structured Application Review

### Review Template
Each reviewer completes the same structured review, scored against the component KRs:

```
APPLICATION REVIEW - [Applicant Name]
Reviewer: [Name]
Date: [Date]
Data Tier: [T2/T3/T4]

A) ACADEMIC ASSESSMENT (maps to AKR)
   GPA (UW): [X.XX]  GPA (W): [X.XX]
   Test Scores: [SAT/ACT or N/A]
   Course Rigor: [# AP/IB/Honors/DE]
   Grade Trend: [Up/Flat/Down]
   Academic Awards: [List]
   High School Profile: [Type, rigor assessment]
   AKR Estimate: [XX] / 100
   Notes: [Free text - specific academic observations]

B) PROFESSIONAL ASSESSMENT (maps to PKR)
   Work Experience: [Summary]
   Internships: [Summary]
   Certifications/Skills: [List]
   Portfolio/Projects: [Summary]
   Entrepreneurial Activity: [Summary]
   Military Service: [If applicable]
   PKR Estimate: [XX] / 100
   Notes: [Free text]

C) ENGAGEMENT ASSESSMENT (maps to EKR)
   Extracurriculars: [List with duration and depth]
   Leadership Roles: [List]
   Community Service: [Hours and type]
   Demonstrated Interest: [Campus visit, events, portal activity]
   EKR Estimate: [XX] / 100
   Notes: [Free text]

D) GROWTH ASSESSMENT (maps to IQKR)
   Trajectory: [Direction and evidence]
   Self-Advocacy: [Evidence from essay, interview, recommendations]
   Adaptability: [Evidence of overcoming challenges]
   First-Generation: [Yes/No]
   ESL: [Yes/No, proficiency level]
   IQKR Estimate: [XX] / 100
   Notes: [Free text]

E) SUPPRESSION FLAGS
   [List any detected suppression factors with supporting evidence]

F) SYSTEM FIT ASSESSMENT
   Learning Style Fit: [Estimate]
   Campus Culture Fit: [Estimate]
   Academic Support Fit: [Estimate]
   Financial Fit: [Estimate based on available info]
   Overall Fit Estimate: [XX]%

G) QUALITATIVE FACTORS (Not Scored, Contextual)
   Essay Quality: [Weak / Adequate / Strong / Exceptional]
   Recommendation Strength: [Weak / Adequate / Strong / Exceptional]
   Interview Impression: [If conducted]
   Special Circumstances: [Any context not captured above]

H) REVIEWER RECOMMENDATION
   [ ] Admit
   [ ] Waitlist
   [ ] Deny
   [ ] Defer to committee
   Rationale: [1-3 sentences]
```

### Inter-Reviewer Calibration
When two reviewers produce Student KR estimates that differ by more than 8 points, the application is flagged for calibration discussion. The purpose is not to force agreement but to understand the source of disagreement (different data interpretation, different suppression assessment, different qualitative weight).

## Phase 3: Admission Decision Framework

### Decision Matrix
The admission decision integrates the Student KR estimate, System Fit, institutional need, and enrollment targets.

| Student KR | System Fit 75%+ | System Fit 50-74% | System Fit Below 50% |
|-----------|----------------|-------------------|---------------------|
| 85+ | Admit | Admit (flag fit concern for advising) | Admit with fit counseling |
| 75-84 | Admit | Admit if enrollment target not met | Waitlist or counsel to better-fit institution |
| 65-74 | Admit if holistic factors are strong | Waitlist | Deny or redirect |
| Below 65 | Holistic review required | Deny (with compassion and alternative suggestions) | Deny |

This matrix is a GUIDE, not an algorithm. Institutions adjust thresholds based on:
- Selectivity level (open admission schools admit everyone; elite schools have higher KR thresholds)
- Enrollment needs (a school 200 students short of target is more flexible than one at capacity)
- Program-specific needs (a nursing program at capacity is less flexible than an underenrolled program)
- Mission alignment (faith-based schools may weight mission fit differently; HBCUs may weight cultural engagement)

### Waitlist Management
Students placed on the waitlist are ranked by a Waitlist Priority Score:

Waitlist_Priority = (Student_KR * 0.40) + (System_Fit * 0.25) + (Yield_Probability * 0.20) + (Net_Revenue_Projected * 0.15)

The highest-priority waitlist students are those who are strong (high KR), likely to enroll if admitted (high yield probability), good fits (high System Fit), and financially viable (positive net revenue).

As admitted students decline and seats open, waitlist students are admitted in priority order.

### Deny with Dignity
For denied applicants, the system generates a redirect recommendation:
- If the student's KR qualifies for a different institution type, suggest it: "This student has a KR of 72 which is strong for a Regional State or Community College. Consider recommending [specific schools]."
- If the student has strong suppression factors, note the ceiling: "This student's AKR of 62 reflects significant work suppression (35 hrs/week). Estimated ceiling without suppression is 72-78. A program with strong support services would serve this student well."
- If the fit is the issue, not the quality: "This student has KR 80 but System Fit of 38% at this institution. They would likely thrive at a [different institution type]. Consider redirecting rather than denying."

---

# ENROLLMENT OPS - FULL ENROLLMENT INTELLIGENCE FLOW

## Global Rules (Apply to All 5 Phases)

**Determinism:** Same inputs produce same packet sections, ordering, and outputs.

**No Truth Mutation:** Enrollment Ops may reference Student KR, Class KR, and retention outputs but may not recompute or change them.

**Time Anchors:**
- Pre-Admission: generated during application review cycle (refreshable as new applications arrive)
- Post-Admission: generated after admission decisions are released (refreshable as yield data comes in)
- Pre-Enrollment: generated during orientation/registration period
- Early Semester: generated weeks 1-4 of the first semester
- End of Term: generated after first term grades post

**Universal Output Fields:** Every packet MUST include:
- cohort_id, term, institution
- data_tier (T1-T5)
- confidence_pct for that phase
- trace_notes (what inputs were missing or assumed)

---

## PHASE 1: RECRUITMENT INTELLIGENCE PACKET

### 1.1 Inputs - MUST PULL (Read-Only)
- Prospect pool (all inquiries, applicants, and purchased list contacts)
- Institutional enrollment targets (total and by program)
- Historical yield data by student segment
- Current cycle admit pool status
- Competitor landscape (where do our admits also get accepted?)
- Financial aid budget and allocation strategy

### 1.2 Outputs - MUST OUTPUT (Ordered, Fixed)

**A) Pipeline Summary**
| Stage | Count | Conversion Rate (Historical) | Projected Converts |
|-------|-------|------------------------------|-------------------|
| Inquiries | | | |
| Applicants (started) | | | |
| Applicants (complete) | | | |
| Admitted | | | |
| Deposited | | | |
| Enrolled (projected) | | | |

**B) Pipeline Health Assessment**
- Is the pipeline large enough to meet enrollment targets at historical conversion rates?
- Where are the bottleneck stages (conversion rate significantly below historical)?
- Which segments are strong (above target) and which are weak (below target)?

**C) Prospect Quality Distribution**
- Distribution of prospect pool by estimated KR tier (from Contextual Mode estimates where full data is unavailable)
- Comparison to prior year prospect quality
- Programs with strongest/weakest prospect pipelines

**D) Geographic Heat Map**
- Where are prospects coming from?
- Are there geographic gaps relative to target?
- Travel/event recommendations: where should recruiters focus?

**E) Competitive Intelligence**
- Which competitor schools appear most frequently as co-admits?
- For students who declined last year, where did they go?
- Price comparison: how does our net price compare to top competitors for key segments?

**F) Recruitment Action Plan**
- Top 20 high-value prospects (high KR, high fit, high yield potential) for personal outreach
- Segment-specific messaging recommendations (different messages for KR 90+ vs KR 70-79)
- Event calendar recommendations (campus visit days, virtual info sessions, program-specific events)
- Communication cadence (when and how often to contact at each pipeline stage)

---

## PHASE 2: YIELD INTELLIGENCE PACKET

### Purpose
Generated after admission decisions are released. Focuses on converting admits to enrollees.

### 2.1 Inputs - MUST PULL
- All admitted students with Student KR, System Fit, financial aid offer, yield probability
- Deposit deadline and current deposit status
- Historical yield patterns by segment
- Engagement signals post-admission (campus visit post-admit, email opens, portal logins)

### 2.2 Outputs - MUST OUTPUT (Ordered)

**A) Yield Projection Dashboard**
| Segment | Admitted | Projected Yield | Projected Enrolled | vs Target | Gap |
|---------|---------|----------------|-------------------|-----------|-----|

**B) High-Risk High-Value Admits**
List of admitted students with high KR (85+) and low yield probability (below 50%). These are the students you most want but are most likely to lose. Each includes:
- Student name and program
- Student KR and System Fit
- Estimated yield probability
- Primary barrier to enrollment (financial gap, competitive admit elsewhere, fit concern)
- Recommended intervention (personal call from faculty, additional aid, campus visit invitation, peer connection)

**C) Melt Risk Analysis**
"Melt" is when a deposited student does not actually show up for the first day of class. The engine identifies deposited students with melt risk signals:
- Deposited late (close to deadline)
- Low engagement post-deposit (no orientation registration, no housing selection, no email opens)
- Financial gap still unresolved
- Competitive institution also holding deposit (if known)

**D) Yield Intervention Calendar**
Week-by-week actions from admission release to enrollment:
```
WEEK 1 (Post-Admission):
- Send personalized congratulations from program faculty
- Invite to admitted student social media group
- Financial aid package confirmation email

WEEK 2-3:
- Campus visit day invitation (for non-visitors)
- Peer connector outreach (match with current student in same program)
- Financial aid counseling invitation (for students with unmet need)

WEEK 4-6:
- Deposit deadline reminder sequence
- Personal phone call to top 20 high-value undecided admits
- Virtual Q&A with department chairs for program-specific questions

POST-DEPOSIT (Week 6+):
- Orientation registration push
- Housing selection guidance
- Summer bridge program invitation (for students flagged for support needs)
- Course registration assistance
```

**E) Aid Adjustment Recommendations**
For students where a financial aid adjustment would materially improve yield probability:
| Student | Current Aid | Recommended Adjustment | Estimated Yield Impact | Net Revenue Impact |
|---------|-----------|----------------------|----------------------|-------------------|

---

## PHASE 3: ORIENTATION & REGISTRATION INTELLIGENCE

### Purpose
Generated during the orientation and registration period. Focuses on setting up new students for success from day one.

### 3.1 Inputs - MUST PULL
- All enrolled (deposited and confirmed) students with full evaluation profiles
- Course availability and section capacity
- Advising assignments
- Housing assignments (if residential)
- Support service capacity

### 3.2 Outputs - MUST OUTPUT

**A) New Student Risk Dashboard**
Aggregate the incoming class by retention risk tier. Identify the students who need immediate intervention connections at orientation, not after they struggle.

**B) Advising Load Optimization**
Assign students to advisors based on risk profile and advisor capacity:
- High-risk students assigned to experienced advisors with lower caseloads
- Students with specific suppression factors (first-gen, ESL, work suppression) assigned to advisors trained in those areas
- No advisor exceeds recommended caseload for their risk mix

**C) Course Registration Guidance**
Per-student course recommendations based on:
- Program requirements and prerequisite chains
- Student's AKR and academic readiness (do they need developmental courses?)
- Work schedule compatibility (if work suppression flagged)
- Credit load recommendation (from Student Success Engine)

**D) Support Service Pre-Matching**
Before the semester starts, connect at-risk students to support services:
| Student | Risk Flags | Pre-Matched Services |
|---------|-----------|---------------------|
| [Name] | Financial Strain, First-Gen | Financial aid counseling, peer mentor, first-gen workshop |
| [Name] | Work Suppression, ESL | ESL tutoring, flexible schedule advising, writing center |

**E) Orientation Programming Recommendations**
Based on the incoming class profile:
- If 40%+ are first-generation: prioritize "How to Succeed in College" sessions
- If 60%+ are commuters: emphasize campus connection opportunities available within class schedule
- If significant ESL population: offer language-specific orientation tracks
- If high suppression prevalence: dedicate orientation time to support service introductions

---

## PHASE 4: EARLY SEMESTER INTELLIGENCE (Weeks 1-4)

### Purpose
The first four weeks are the highest-risk period for new student attrition. This packet catches problems before they become permanent.

### 4.1 Inputs - MUST PULL
- All new students with pre-semester evaluation profiles
- Week 1-4 engagement data: attendance, LMS logins, assignment submissions
- Financial data: payment status, balance due, aid disbursement status
- Advising contact: has the student met with their advisor?
- Course adds/drops/withdrawals

### 4.2 Outputs - MUST OUTPUT

**A) Engagement Heatmap**
Visual grid of all new students by engagement level (high/medium/low/none) across dimensions:
- Class attendance
- LMS activity
- Advising contact
- Financial clearance
- Social engagement (events, organizations)

Students showing "none" or "low" across multiple dimensions are flagged immediately.

**B) No-Show List**
Students who enrolled but have not attended any classes in the first week. Immediate outreach required.

**C) Early Warning Escalations**
Students whose Week 1-4 behavior triggers retention risk flags not present at admission:
| Student | New Signal | Pre-Existing Risk | Updated Risk Tier | Recommended Action |
|---------|-----------|-------------------|-------------------|-------------------|

**D) Financial Clearance Report**
Students with unresolved financial holds that may prevent continued enrollment:
- Balance due with no payment plan
- Aid not yet disbursed (processing delay vs eligibility issue)
- Dropped from courses due to non-payment

**E) Early Academic Alerts**
From faculty or automated systems:
- Students failing to submit assignments
- Students performing significantly below expected level (based on AKR)
- Students who have already withdrawn from a course

**F) Advisor Action Queue**
Prioritized list of students each advisor should contact this week, ranked by urgency:
```
ADVISOR: [Name] - WEEK 2 ACTION QUEUE

CRITICAL (Contact within 48 hours):
1. [Student] - No-show, balance due $4,200, no advisor contact
2. [Student] - Attended 1 of 6 classes, LMS activity zero, first-gen

HIGH (Contact this week):
3. [Student] - Attendance 50%, submitted 1 of 3 assignments
4. [Student] - Financial hold, aid disbursement delayed

MODERATE (Contact within 2 weeks):
5. [Student] - Low LMS engagement, commuter, no organizations
6. [Student] - Dropped 1 course, now at 12 credits (minimum full-time)
```

---

## PHASE 5: END-OF-TERM INTELLIGENCE

### Purpose
Generated after first-term grades post. Validates pre-enrollment predictions, updates student evaluations, and sets up the retention strategy for the next term.

### 5.1 Inputs - MUST PULL
- Final grades for all new students
- Semester GPA vs predicted performance
- Credit completion (passed vs attempted)
- Engagement data (full semester)
- Financial status (balance, aid renewal, registration for next term)
- Advising notes
- Retention risk flags (updated with actual semester data)

### 5.2 Outputs - MUST OUTPUT

**A) Prediction Accuracy Audit**
Compare pre-enrollment KR estimates to actual first-semester performance:
| Student | Pre-Enrollment KR Estimate | First-Semester GPA | Prediction Accuracy | Notes |
|---------|--------------------------|-------------------|-------------------|-------|

Aggregate accuracy metrics:
- Mean prediction error (how far off were KR estimates from actual performance?)
- Prediction bias (did we systematically over-estimate or under-estimate?)
- Accuracy by segment (which student types did we predict well, which poorly?)

This feeds back into the evaluation system to improve future estimates.

**B) Retention Forecast Update**
With actual semester data, update the retention projection for the cohort:
- How many students are registered for next term?
- How many are NOT registered and need outreach?
- Updated risk tier distribution based on actual performance (vs pre-enrollment estimates)
- Revenue forecast adjustment based on actual retention

**C) Suppression Validation**
For students with pre-enrollment suppression flags, did the suppression play out as expected?
- Work suppression: did work hours correlate with GPA below ceiling estimate?
- First-gen suppression: did first-gen students underperform relative to AKR, and did support services help?
- Environmental suppression: did students connected to support services outperform those who were not?

This validates the suppression model and calibrates estimates for future cohorts.

**D) Intervention Effectiveness Audit**
For students who received early-semester interventions:
- What was their risk tier before intervention?
- What is their risk tier now?
- Did they persist to next term?
- What was the most effective intervention type?

This feeds into the Simulation Engine (File 04) to calibrate intervention effectiveness estimates.

**E) Next-Term Strategy Packet**
Based on everything learned from the first term:
- Which students need increased support next term?
- Which support services were most impactful and should be expanded?
- Where did the institution fail to intervene in time, and how can we move earlier next cycle?
- Financial aid adjustments recommended for returning students based on first-term performance
- Advisor assignments and caseload adjustments for next term

**F) Cohort KR Update**
With first-term data, recompute Student KR for all students in the cohort using actual institutional performance rather than pre-enrollment estimates. This is the first "real" KR based on institutional data.

Class KR is updated accordingly. Compare the actual Class KR to the projected Class KR from the pre-enrollment estimates.

---

## GOVERNANCE RULES (Apply to All Phases)

1. **Deterministic.** Same inputs produce same packet outputs.
2. **No Truth Mutation.** Enrollment Ops may reference but never modify Student KR, Class KR, or retention outputs from upstream.
3. **Time-Anchored.** Each phase has a defined time window. Data from outside the window is noted but does not override within-window intelligence.
4. **Confidence-Qualified.** Every output includes confidence %. Early phases (T1-T2 data) carry low confidence and wide ranges. Later phases (T4-T5 data) carry high confidence and narrow ranges.
5. **Human Decision Final.** The system produces intelligence. Humans make admission decisions, yield interventions, and support assignments. The system never admits, denies, or withdraws a student.
6. **Privacy-Preserving.** Individual student data is visible only to authorized staff. Aggregate reports do not expose individual records. Financial details are restricted to financial aid roles.
7. **FERPA-Compliant.** All student data handling complies with FERPA.

---

## VERSION HISTORY
- v1.0: Initial build. Recruitment Confidence Gates (pre-admission and post-decision), Application Review Protocol (3-phase: triage, structured review, decision framework with waitlist and deny-with-dignity), Enrollment Ops 5-phase flow (Recruitment Intelligence, Yield Intelligence, Orientation & Registration, Early Semester Weeks 1-4, End-of-Term), with advisor action queues, early warning escalation, prediction accuracy audit, and intervention effectiveness feedback loops. Architecture mirrors basketball File 05 (Scouting & Game Ops) with domain-appropriate 5-phase enrollment lifecycle replacing 4-phase game day operations.
