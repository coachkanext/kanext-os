# ADMISSIONS DOWNSTREAM ENGINES
## v1.0 - Student Success, Retention, Revenue, Transfer & Pathway Intelligence

---

# STUDENT SUCCESS ENGINE (LOCKED)

## 0. Purpose
The Student Success Engine is the primary downstream consumer of the student evaluation pipeline. It takes everything the system knows about a student - their KR, component KRs, system fit, suppression flags, retention risk, and badges - and translates it into actionable intelligence for advising, support, and development planning.

It answers five questions for any evaluated student in the system:
1. **Where are you now?** - Truth summary across all dimensions
2. **Where should you be?** - Optimal academic path based on production and fit
3. **What are the gaps?** - Specific areas holding the student back, with exact targets
4. **What's the path?** - Prioritized development plan with projected impact
5. **What support do you need?** - Specific institutional resources matched to the student's profile

This engine does NOT evaluate students. It does NOT modify Student KR, component KRs, suppression flags, or any upstream output. It reads governed truth and produces downstream recommendations only.

All outputs are deterministic: same inputs, same outputs.

## 1. Consumers
The Student Success Engine serves multiple users viewing the same student from different angles:
- **The student** - "What should I focus on? Am I on track? What resources should I use?"
- **Academic advisors** - "What does this student need? What courses should they take? Are they in the right program?"
- **Financial aid officers** - "Is this student's aid package adequate? Are they at financial risk? What aid adjustment would improve retention?"
- **Retention specialists** - "Is this student at risk? What intervention is most likely to work? When do I intervene?"
- **Faculty** - "How can I support this student in my course? What accommodations or resources should I be aware of?"
- **Institutional leadership** - "What are the aggregate patterns? Where do we need to invest?"

Same engine, same outputs, different decisions made from them.

## 2. MUST PULL (Inputs)

### A) Student Identity + Record
MUST PULL FROM: Student Profile (Auto-Populated Record)
- Student name, identity, demographics
- Academic history (institutions attended, programs, GPA history)
- Current enrollment (program, credit load, class standing)
- Financial aid status
- Employment status
- Advising history

### B) Student KR Outputs (Truth)
MUST PULL FROM: Student Evaluation Pipeline (finalized outputs)
- Final Student KR
- Component KRs: AKR, PKR, EKR, IQKR
- Confidence %
- Data tier

### C) Suppression + Badges
MUST PULL FROM: Suppression Detection, Badge Library
- Active suppression flags with severity and estimated ceiling
- Badge list
- Suppression ceiling estimate

### D) System Fit Profile
MUST PULL FROM: System Fit computation
- Overall System Fit %
- Per-dimension scores: Learning Style, Campus Culture, Academic Support, Financial Fit
- Fit gaps (dimensions where fit is below 60%)

### E) Retention Risk
MUST PULL FROM: Retention Risk scoring
- Risk tier (Critical/High/Moderate/Low-Moderate/Low)
- Active risk flags with severity
- Total risk score

### F) Institution Context
MUST PULL FROM: Institutional Context (locked)
- Institution type, size, programs, support services
- Advising model (proactive/reactive, caseload size)
- Available support resources (tutoring, counseling, food pantry, housing, emergency aid)

## 3. Outputs

### OUTPUT A: Student Truth Summary - "Where Are You Now?"
A complete snapshot of the student's current state, translated into plain language.

Format:
```
STUDENT TRUTH SUMMARY
Name: [Name]
Program: [Major], [Class Standing]
Student KR: [XX.X] - [Legend Tier Label] at [Institution Type]

STRENGTHS:
- [Component] ([Score]): [What this means in plain language]
- [Component] ([Score]): [What this means]

GAPS:
- [Component] ([Score]): [What this means, what's needed to improve]
- [Component] ([Score]): [What this means]

CONTEXT:
- Suppression: [Flags with estimated ceiling]
- Badges: [List]
- System Fit: [XX]% ([per-dimension breakdown])
- Retention Risk: [Tier] - [Active flags]
```

### OUTPUT B: Academic Path Optimization - "Where Should You Be?"
Based on the student's component KR profile, identify whether they are in the optimal program and academic path.

**Program Fit Analysis:**
For the student's current program, compute the OPF-weighted KR. Then compute what their KR would be under every other program OPF at the institution. If a different program produces a significantly higher KR (5+ points), flag it as a potential better fit.

Example: A student with AKR 72, PKR 88, EKR 65, IQKR 78 in a STEM program (AKR-heavy OPF) produces KR 75. In a Business program (PKR-heavy OPF), they would produce KR 82. Flag Business as a potential better fit.

This is a recommendation, not an override. The student may have strong reasons for their current program. But the system surfaces the data.

**Course Load Optimization:**
Based on the student's credit completion rate, GPA trend, work hours, and retention risk, recommend optimal credit load per semester:
- High retention risk + work suppression: recommend 12 credits (minimum full-time)
- Moderate retention risk + upward trend: recommend 15 credits
- Low risk + strong AKR: recommend 15-18 credits to accelerate

**Graduation Path Projection:**
Based on current credit velocity, project time-to-degree. If the student is behind pace, recommend: summer/winter courses, course substitutions, accelerated options, or realistic timeline adjustment.

### OUTPUT C: Gap Analysis - "What Are the Gaps?"
For each component KR, identify the specific inputs that are dragging the score down and quantify what improvement is needed.

Format:
```
GAP ANALYSIS
Component: AKR (Current: 68)
- GPA: 2.85 (band score: 58). To reach AKR 75, need GPA 3.10 (+0.25)
- Course Rigor: Standard only (-2 modifier). Taking 1-2 honors courses next semester would add +1-2
- Grade Trend: Declining (-3 modifier). Reversing to flat would add +3
- Priority: Reverse grade decline (highest impact per effort)

Component: EKR (Current: 42)
- No campus organizations. Joining 1 organization would move band from 20-35 to 50-65
- No documented leadership. Not addressable until organization membership established
- Attendance: 82% (-2 modifier). Improving to 90%+ would add +1-3
- Priority: Join one organization (largest single-action impact on EKR)
```

### OUTPUT D: Development Plan - "What's the Path?"
A semester-by-semester action plan prioritized by impact and urgency.

**Priority Ranking Logic:**
1. Actions that address retention risk flags (highest urgency)
2. Actions that address the lowest component KR (biggest KR lift)
3. Actions that address suppression factors (if addressable - e.g., connecting to food pantry, adjusting work hours through work-study)
4. Actions that improve System Fit gaps
5. Actions that build toward pathway goals (career readiness, graduate school prep)

Format:
```
DEVELOPMENT PLAN - [Semester]

PRIORITY 1 (Retention): Address Financial Strain flag
- Action: Apply for emergency aid fund ($1,500 available)
- Action: Explore work-study to replace off-campus job (reduce hours, gain campus connection)
- Expected impact: Reduce risk tier from High to Moderate

PRIORITY 2 (KR Lift): Improve EKR (current 42, target 60)
- Action: Join [recommended organization based on interests]
- Action: Attend 2+ campus events this month
- Expected impact: EKR +15-20 points over one semester

PRIORITY 3 (Suppression): Address work suppression
- Action: Meet with financial aid to explore work-study options
- Action: Meet with advisor to adjust course schedule around work commitments
- Expected impact: If work hours reduce from 35 to 20, estimated AKR ceiling improves 4-7 points
```

### OUTPUT E: Resource Matching - "What Support Do You Need?"
Based on the student's profile, match them to specific institutional resources.

| Student Need | Matched Resource | Priority |
|-------------|-----------------|---------|
| Financial strain | Emergency aid, payment plan, work-study, external scholarship search | Critical |
| Academic difficulty | Tutoring center, supplemental instruction, faculty office hours, study skills workshop | High |
| Engagement gap | Student activities, organization fair, peer mentor program, living-learning community | High |
| Mental health | Counseling center, peer support groups, crisis line | High |
| Food insecurity | Campus food pantry, SNAP enrollment assistance, meal plan subsidy | Critical |
| Housing instability | Emergency housing, housing assistance referral, off-campus housing resources | Critical |
| Transportation | Shuttle service, transit pass subsidy, carpool coordination | Moderate |
| Career preparation | Career center, internship database, resume workshop, alumni mentor matching | Standard |
| Language support | ESL tutoring, writing center, language exchange program | High (if ESL flag) |
| Childcare | Campus childcare, childcare subsidy referral, schedule accommodation | Critical (if family suppression) |

Resource matching uses the institution's actual available resources (from Institutional Context). If a resource does not exist at the institution, the system does not recommend it.

---

# RETENTION ENGINE (LOCKED)

## 0. Purpose
The Retention Engine is an early warning and intervention intelligence system. It continuously monitors enrolled students for risk indicators, escalates when thresholds are crossed, and recommends specific interventions matched to each student's risk profile.

The engine operates on a simple principle: **intervene before the student has decided to leave.** By the time a student submits a withdrawal form, the retention battle is already lost. The engine aims to intervene 4-8 weeks before that point.

## 1. Early Warning System

### Signal Detection
The engine monitors four signal categories at defined intervals:

**Academic Signals (checked after every grading period):**
- GPA change from previous term (decline of 0.3+ triggers flag)
- Midterm grade alerts (D or F in any course)
- Course withdrawal (any W grade during the semester)
- Credit completion rate drop (below 85% triggers flag)
- Academic probation status change

**Financial Signals (checked monthly):**
- Balance due increase
- Payment plan delinquency (missed payment)
- Financial aid change (aid reduced, lost eligibility, unmet need increase)
- FAFSA non-renewal for upcoming year
- External scholarship loss

**Engagement Signals (checked bi-weekly):**
- Attendance drop (15%+ from previous period)
- LMS login frequency decline (50%+ reduction)
- Missed advising appointments (2+ consecutive)
- Organization dropout
- Campus event attendance decline to zero

**Administrative Signals (checked at registration milestones):**
- Non-registration for upcoming term (within registration window)
- Transcript request to another institution
- Housing cancellation (for residential students)
- Meal plan cancellation
- Parking pass non-renewal

### Signal Aggregation
Each signal carries a risk weight (defined in Retention Risk Flags, File 02). Signals are additive. When the cumulative risk score crosses a tier threshold, the system escalates.

### Escalation Timeline
| Risk Tier | Response | Who Is Notified |
|-----------|----------|----------------|
| Critical (50+) | Intervention within 48 hours | Advisor + Dean of Students + Financial Aid (if financial flag) |
| High (35-49) | Intervention this week | Advisor + relevant support office |
| Moderate (20-34) | Check-in within 2 weeks | Advisor |
| Low-Moderate (10-19) | Note in advising system, standard cycle | Advisor (at next scheduled meeting) |
| Low (0-9) | No action needed | None |

### Intervention Windows
The engine identifies optimal intervention windows:
- **Pre-registration:** 4-6 weeks before registration opens. Address barriers before the student decides not to register.
- **Early semester:** First 3 weeks of classes. Catch engagement declines before they become patterns.
- **Midterm:** After midterm grades post. Address academic concerns while there is still time to recover.
- **Financial deadlines:** 2-4 weeks before payment deadlines. Ensure financial plans are in place.
- **End of semester:** Last 3 weeks. Protect students who are close to completing the term but at risk of giving up.

## 2. Intervention Recommendations

The engine matches intervention type to risk flag type. Interventions are specific, actionable, and assigned to a responsible party.

### Financial Interventions
| Risk Signal | Intervention | Responsible Party |
|------------|-------------|------------------|
| Balance due | Payment plan setup or restructure | Bursar/Financial Aid |
| Aid gap | Emergency aid application, external scholarship search, work-study placement | Financial Aid |
| FAFSA non-renewal | Outreach to complete FAFSA, deadline reminder, completion assistance | Financial Aid |
| Scholarship loss | Aid replacement search, appeal process guidance | Financial Aid |

### Academic Interventions
| Risk Signal | Intervention | Responsible Party |
|------------|-------------|------------------|
| GPA decline | Tutoring referral, study skills workshop, course load review | Advisor |
| Midterm D/F | Faculty outreach, supplemental instruction, potential course substitution | Advisor + Faculty |
| Course withdrawal | Check for pattern (first W vs repeated), address root cause | Advisor |
| Academic probation | Probation action plan (mandatory advising, reduced load, support contract) | Advisor + Dean |

### Engagement Interventions
| Risk Signal | Intervention | Responsible Party |
|------------|-------------|------------------|
| Attendance drop | Outreach (phone/text), root cause exploration | Advisor or Peer Mentor |
| LMS decline | Faculty awareness, outreach, technology barrier check | Faculty + Advisor |
| Organization dropout | Peer mentor outreach, alternative engagement options | Student Activities |
| Social isolation | Peer mentor assignment, group study facilitation, event invitation | Retention Specialist |

### Life Event Interventions
| Risk Signal | Intervention | Responsible Party |
|------------|-------------|------------------|
| Family crisis | Counseling referral, academic accommodation, emergency support | Dean of Students |
| Health emergency | Medical leave process, incomplete grade coordination, return plan | Dean of Students + Registrar |
| Housing loss | Emergency housing, off-campus referral, food pantry | Dean of Students |
| Legal issue | Legal resources referral, academic accommodation if needed | Dean of Students |

## 3. Retention ROI Analysis

The engine computes the financial return on retention investment:

**Per-Student Retention ROI:**
ROI = (LSV_if_retained - LSV_if_lost) / Cost_of_intervention

Example: Student has LSV of $52,000 remaining. If they leave now, LSV is $0. Intervention costs $3,000 (emergency aid + advising hours). If the intervention has a 60% success rate, expected ROI = ($52,000 * 0.60) / $3,000 = 10.4x return.

**Institutional Retention ROI:**
Aggregate across all at-risk students to determine the total institutional return on retention investment.

This helps leadership justify retention budgets. A $200,000 retention program that keeps 40 students who would have otherwise left (average $45,000 remaining LSV) generates $1.8M in retained revenue - a 9x return.

---

# REVENUE ENGINE (LOCKED)

## 0. Purpose
The Revenue Engine translates student intelligence into financial projections and optimization recommendations. It serves CFOs, enrollment managers, and institutional leadership who need to understand the financial implications of admissions, retention, and financial aid decisions.

## 1. Lifetime Student Value (LSV)

### LSV Computation
LSV is computed per student in the Class Intelligence file (File 03). The Revenue Engine consumes these values and adds optimization intelligence.

### LSV Segmentation
The engine segments the student population by LSV to identify financial profiles:

| LSV Segment | Description | Strategy |
|------------|-------------|----------|
| High LSV + Low Risk | Full-pay or high-net-revenue students with strong retention. The institution's financial foundation. | Protect. Ensure satisfaction and engagement. Do not over-invest aid. |
| High LSV + High Risk | High-revenue students at risk of leaving. Every departure is a significant financial loss. | Invest in retention. High ROI on intervention. |
| Low LSV + Low Risk | Low-revenue students who will persist. They fill seats but contribute minimally to revenue. | Maintain. No additional investment. Consider tuition adjustment at re-enrollment. |
| Low LSV + High Risk | Low-revenue students at risk of leaving. Financial loss from departure is small. | Triage carefully. If intervention cost exceeds remaining LSV, may not be financially justified (though may be mission-justified). |

### LSV Sensitivity Analysis
For each student, compute how LSV changes under different scenarios:
- What if their aid package increases by $2,000? (LSV decreases by $2,000 * remaining semesters, but retention probability may increase)
- What if they switch from full-time to part-time? (LSV decreases proportionally, time-to-degree extends)
- What if they change programs? (Revenue per credit may change, retention probability may change)

## 2. Optimal Class Size Modeling

### Marginal Revenue vs Marginal Cost
For each additional student enrolled, compute:
- **Marginal revenue:** Tuition - aid + fees + auxiliary. Varies by student profile (full-pay vs aided).
- **Marginal cost:** Additional instruction cost (if sections must be added), additional advising load, additional support services, additional infrastructure (if capacity is constrained).

At some enrollment level, marginal cost exceeds marginal revenue. That is the economic enrollment ceiling.

### Enrollment Floor
The institution also has an enrollment floor - the minimum number of students needed to cover fixed costs (facilities, core staff, debt service, accreditation compliance).

Enrollment_Floor = Fixed_Costs / (Average_Net_Revenue_Per_Student)

### Optimal Range
The optimal enrollment range is between the floor and the ceiling. The system computes this range and shows where the current class falls within it.

### Program-Level Optimization
Each program has its own floor and ceiling:
- A Nursing program with a clinical site contract for 30 students has a ceiling of 30
- A Business program with one faculty member covering all sections has a different constraint than one with five
- An online program may have near-zero marginal cost per additional student

The system identifies programs where additional enrollment would generate the highest marginal revenue and programs where the institution is over-enrolled relative to capacity.

## 3. Tuition Discounting Strategy

### Discount Rate Analysis
Tuition discount rate = Total institutional aid / Total gross tuition

The system computes:
- Current discount rate
- Discount rate trend (is it increasing year over year?)
- Discount rate by student segment (high KR vs low KR, in-state vs out-of-state, program)
- Breakeven discount rate (the rate at which net tuition per student covers the institution's per-student cost)

### Discount Optimization
The system models the trade-off between discount rate and yield:
- Lower discount rate = higher net revenue per student but lower yield (fewer students enroll)
- Higher discount rate = lower net revenue per student but higher yield (more students enroll)

The optimal discount rate maximizes TOTAL net revenue (net revenue per student * number of students).

### Price Sensitivity by Segment
Different student segments have different price sensitivity:
- High-KR students with multiple admits: high price sensitivity (they have options)
- Low-KR students with few admits: low price sensitivity (they have fewer options)
- In-state students at a public institution: lower sensitivity (tuition is already subsidized)
- International students: variable (some are price-insensitive, others are highly sensitive)

The system identifies which segments are over-discounted (receiving more aid than needed to enroll) and which are under-discounted (losing yield because of insufficient aid).

---

# TRANSFER INTELLIGENCE (LOCKED)

## 0. Purpose
Transfer Intelligence is the admissions equivalent of the basketball transfer portal engine. It manages two-directional student movement: students transferring IN (recruitment opportunity) and students transferring OUT (retention loss).

## 1. Outgoing Transfer Risk

### Risk Signal Detection
The engine monitors for signals that a student is considering leaving:

**Strong signals (high confidence):**
- Transcript request sent to another institution
- Stated transfer intent to advisor
- Non-registration for upcoming term despite eligibility
- Housing/meal plan cancellation mid-year

**Moderate signals (medium confidence):**
- Declining engagement (attendance, LMS, organizations)
- Browsing competitor programs (if tracked through portal)
- Declining satisfaction in surveys or advising conversations
- GPA capable of admission to higher-tier institution (underplaced student)

**Weak signals (low confidence, monitor only):**
- General expression of dissatisfaction without specific transfer intent
- Peer group attrition (if a student's friend group is leaving, they may follow)
- Program dissatisfaction without active exploration of alternatives

### Transfer Risk Scoring
Signals are weighted and summed to produce a transfer risk score (separate from general retention risk, though related).

| Signal Category | Weight |
|----------------|--------|
| Transcript request | 40 |
| Stated intent | 35 |
| Non-registration | 30 |
| Housing cancellation | 25 |
| Engagement decline | 15 |
| Underplacement (KR significantly above institutional average) | 10 |
| Satisfaction decline | 10 |
| Peer attrition | 5 |

Transfer Risk Tier:
- 50+: Very High (likely to leave)
- 35-49: High (actively exploring)
- 20-34: Moderate (considering but not committed)
- Under 20: Low (not actively considering)

### Retention Response for Transfer Risk
For students with transfer risk 35+, the system generates a targeted retention plan:
- **Address root cause:** Why are they leaving? Financial? Academic? Social? Fit?
- **Counter-offer assessment:** Is there an aid adjustment, program change, or experience improvement that would change their decision?
- **Honest evaluation:** If the student would genuinely be better served at another institution, acknowledge this. Retaining a student at the wrong school is not a success. The system flags when a student's KR and fit profile suggest they belong at a different institution type.

## 2. Incoming Transfer Evaluation

### Transfer Student KR
Transfer students are evaluated using the same Student KR pipeline as all other students. Additional factors:

**Credit Transferability:**
| Transfer Scenario | Credit Transfer Rate | Impact on KR Evaluation |
|------------------|---------------------|------------------------|
| Same institution type (CC to CC, state to state) | 80-100% | Standard evaluation |
| CC to 4-year (articulation agreement exists) | 70-90% | Standard, verify agreement |
| CC to 4-year (no agreement) | 50-80% | Flag credit loss risk in advising |
| 4-year to 4-year (same level) | 60-85% | Standard evaluation |
| 4-year downward (e.g., R1 to Regional) | 85-100% | KLVN adjustment applies |
| 4-year upward (e.g., Regional to R1) | 50-75% | KLVN adjustment applies, flag rigor gap |
| International | 30-70% | Credential evaluation required (WES, ECE) |

**Time-to-Degree Impact:**
Compute the number of credits that will transfer and the number that will not. Calculate the new time-to-degree estimate. If the transfer adds more than 1 semester to the expected timeline, flag for advising.

**Program Fit at New Institution:**
Recompute System Fit for the receiving institution. A student who was a poor fit at their origin school may be an excellent fit at the destination, or vice versa.

### Net Transfer Impact
For each potential incoming transfer, compute:
- Student KR contribution to the class
- Revenue impact (net tuition - aid over remaining semesters)
- Program fill impact (does this student fill an underenrolled program?)
- Retention projection at the new institution

For each potential outgoing transfer, compute the inverse:
- KR loss to the class
- Revenue loss
- Program vacancy created
- Domino effect (if this student leaves, will their peer group follow?)

### Recruitment Targeting
Based on institutional gaps (programs needing students, KR tiers underrepresented, revenue needs), generate a transfer recruitment profile:

```
IDEAL TRANSFER PROFILE
Programs needed: Nursing (5 seats), Business (8 seats), Education (3 seats)
KR target: 78+ (above current class average of 76)
Financial target: Students with modest aid need (net revenue $8,000+/year)
Fit target: Commuter-friendly (institution is 80% commuter), adult learner friendly
Geographic target: Within 50-mile radius (based on current student geography)
```

This profile guides admissions outreach for transfer recruitment.

---

# PATHWAY INTELLIGENCE (LOCKED)

## 0. Purpose
Pathway Intelligence projects what happens AFTER the student completes their program. It connects current student performance to career outcomes, graduate school readiness, and workforce placement. For the institution, it connects student outcomes to institutional effectiveness metrics (placement rate, salary data, alumni engagement).

## 1. Pathway Mapping

### Career Pathways by Program
For each program at the institution, the system maintains a pathway map:

| Program | Primary Pathways | Typical Entry Salary | KR Threshold | Key PKR Requirements |
|---------|-----------------|---------------------|-------------|---------------------|
| Business Administration | Management trainee, sales, analyst, small business | $40K-$55K | 75+ | Internship, communication skills |
| Nursing (BSN) | Registered Nurse, clinical roles | $55K-$75K | 80+ | Clinical hours, NCLEX prep |
| Education | K-12 teaching, educational support | $38K-$52K | 75+ | Student teaching, certification |
| Computer Science | Software engineering, data analysis, IT | $55K-$80K | 80+ | Portfolio, internship, certifications |
| Criminal Justice | Law enforcement, corrections, probation | $38K-$55K | 70+ | Physical fitness, background clear |
| Liberal Arts | Varied (publishing, nonprofit, government, further education) | $35K-$50K | 70+ | Writing portfolio, internship |

These are institutional defaults. The system calibrates against the institution's actual alumni outcome data when available.

### Graduate School Readiness
For students targeting graduate school, the system evaluates readiness:

| Factor | Threshold | Student Status | Gap |
|--------|----------|---------------|-----|
| GPA | 3.2+ (program dependent) | Current GPA | Delta |
| Research experience | 1+ projects | Research participation status | Missing? |
| Test scores | GRE/GMAT/LSAT/MCAT | Taken? Score? | Prep needed? |
| Recommendations | 2-3 faculty who know student well | Faculty relationships | Number/quality of relationships |
| Statement of purpose | Clear, compelling narrative | Career clarity level | Coaching needed? |

## 2. Individual Pathway Projection

For each student, the system projects:

**Pathway Fit Score:** How well does the student's current profile match the requirements of their target pathway?

Pathway_Fit = f(KR, PKR, relevant_certifications, internship_status, portfolio_status, GPA_vs_threshold)

**Timeline Projection:** What does the student need to accomplish in each remaining semester to be ready for their target pathway at graduation?

```
PATHWAY PROJECTION - [Student Name]
Target Pathway: Software Engineering
Current Readiness: 62%

SEMESTER 3 (Now):
- Complete Data Structures course (required for technical interviews)
- Apply to summer internship (deadline: Feb 15)
- Start building GitHub portfolio (target: 3 projects by end of semester)

SEMESTER 4:
- Complete internship
- Take Algorithms and Operating Systems
- Add internship project to portfolio

SEMESTER 5:
- Begin interview preparation
- Complete capstone project
- Attend career fair (October)

SEMESTER 6:
- Apply to full-time positions (September-November)
- Complete remaining electives
- Graduate

RISKS:
- No internship yet (most hires at target companies have internship experience)
- GitHub portfolio empty (technical employers will check)
- GPA at 3.1 (below 3.2 threshold for some employers' automatic screening)
```

## 3. Institutional Pathway Effectiveness

At the institutional level, the system tracks:

**Placement Rate by Program:** What percentage of graduates find employment or enroll in graduate school within 6 months of graduation?

**Salary Outcome by Program:** What is the median starting salary for graduates of each program? How does it compare to peer institutions and national benchmarks?

**Pathway Completion Rate:** What percentage of students who declared a target pathway at intake actually achieved that pathway?

**Pathway Gap Analysis:** Where are the institutional bottlenecks? Common issues:
- Insufficient internship placements for the number of students who need them
- Faculty shortage in a high-demand program
- Certification pass rates below industry benchmarks
- Alumni network weak in certain industries or geographies

The system surfaces these gaps so institutional leadership can invest strategically.

## 4. Alumni Pipeline Intelligence

For institutions that track alumni outcomes, the system connects current students to alumni:

**Mentor Matching:** Match current students to alumni in their target field, geography, or industry based on pathway alignment.

**Employer Pipeline:** Identify which employers hire the institution's graduates consistently. Flag when a key employer relationship weakens (fewer hires this year than last).

**Giving Correlation:** Higher pathway satisfaction correlates with higher alumni giving. Students who achieve their target pathway are more likely to become donors. This connects student success to institutional advancement.

---

## GOVERNANCE RULES (Apply to ALL Downstream Engines)

1. **No truth mutation.** Downstream engines NEVER modify Student KR, component KRs, suppression flags, badges, or any upstream output. They consume truth and produce recommendations.
2. **Deterministic.** Same inputs produce same outputs. No randomness, no editorial discretion.
3. **Auditable.** Every recommendation includes the inputs that produced it. An advisor can trace any recommendation back to specific data points.
4. **Actionable.** Every output includes a specific action, a responsible party, and a timeline. "This student is at risk" is not an output. "This student is at risk (Financial Strain + Engagement Drop = score 50, Critical tier). Recommended: advisor outreach within 48 hours to address balance due of $3,200 and connect to emergency aid fund. Financial Aid to review package for potential adjustment." - that is an output.
5. **Honest.** If the system determines that a student would be better served at a different institution, it says so. If a program is not producing good outcomes, it flags it. The system does not optimize for institutional vanity metrics at the expense of student welfare.
6. **Privacy-preserving.** Student financial details, health information, and personal circumstances are visible only to authorized roles. Aggregate reports do not expose individual student data.
7. **FERPA-compliant.** All data handling, reporting, and recommendations comply with FERPA requirements. Student records are not shared outside authorized educational purposes without consent.

---

## VERSION HISTORY
- v1.0: Initial build. Five downstream engines: Student Success (5-output truth summary, path optimization, gap analysis, development plan, resource matching), Retention (early warning system with 4 signal categories, escalation timeline, intervention matching, ROI analysis), Revenue (LSV segmentation, optimal class size, tuition discounting strategy), Transfer Intelligence (outgoing risk detection, incoming evaluation, net impact analysis, recruitment targeting), Pathway Intelligence (career mapping, individual projection, institutional effectiveness, alumni pipeline). Architecture mirrors basketball File 06 (Downstream Engines) with domain-appropriate content.
