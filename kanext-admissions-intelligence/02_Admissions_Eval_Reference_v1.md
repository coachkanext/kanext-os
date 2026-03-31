# ADMISSIONS EVALUATION REFERENCE
## v1.0 - Student Intelligence Reference Library

---

# STUDENT KR - UNIVERSAL STUDENT RATING (0-100)

## Purpose
Student KR is a single number (0-100) that represents the overall quality and readiness of a student relative to a specific institutional context. Like basketball KR, it is universal across institution types through KLVN normalization - a KR of 85 means the same thing whether the student is at an Ivy or a community college, because the legend tiers at each institution type translate the number into context-specific meaning.

Student KR does NOT measure human worth. It measures institutional fit, academic production, professional readiness, engagement quality, and growth trajectory as they relate to a student's likelihood of succeeding at and contributing to a specific institution.

## Component KRs

Student KR is computed from four component KRs, each scored 0-100. The components are weighted differently by program type (see Program Trait Weighting / OPF below).

---

# AKR - ACADEMIC KR

## Purpose
AKR measures academic production and trajectory. It is the primary component for most program types and the closest equivalent to OKR in basketball - it captures what the student has actually produced in the classroom.

## Inputs

### GPA (Weighted and Unweighted)
- Weighted GPA: includes AP/IB/Honors/Dual Enrollment weighting per high school or institution policy
- Unweighted GPA: raw 4.0 scale performance
- Both are captured. Weighted GPA is the primary input. Unweighted GPA provides context for KLVN normalization (a 3.5 unweighted from a school that does not weight is different from a 3.5 unweighted from a school that does).

### Scoring Bands (Unweighted GPA - Pre-KLVN)
| GPA Range | AKR Band | Label |
|-----------|----------|-------|
| 3.90-4.00 | 95-100 | Elite Academic |
| 3.70-3.89 | 88-94 | Strong Academic |
| 3.50-3.69 | 80-87 | Solid Academic |
| 3.20-3.49 | 72-79 | Average Academic |
| 3.00-3.19 | 65-71 | Below Average Academic |
| 2.70-2.99 | 55-64 | At Risk Academic |
| 2.50-2.69 | 45-54 | High Risk Academic |
| 2.00-2.49 | 30-44 | Critical Academic |
| Below 2.00 | 0-29 | Academic Crisis |

These are PRE-KLVN bands. After KLVN normalization, a 3.2 from a rigorous school may score higher than a 3.5 from a lenient school.

### Test Scores (SAT/ACT - When Available)
Not all institutions require or consider test scores. When available, they contribute to AKR. When unavailable, AKR relies on GPA, course rigor, and completion rate with adjusted confidence.

| SAT Range | ACT Range | AKR Modifier |
|-----------|-----------|-------------|
| 1500-1600 | 34-36 | +8 to +12 |
| 1400-1499 | 32-33 | +5 to +8 |
| 1300-1399 | 29-31 | +3 to +5 |
| 1200-1299 | 26-28 | +1 to +3 |
| 1100-1199 | 23-25 | 0 (neutral) |
| 1000-1099 | 20-22 | -1 to -3 |
| Below 1000 | Below 20 | -3 to -8 |

Test score modifier is additive to the GPA-based AKR band. It cannot push AKR above 100 or below 0.

**Test-Optional Protocol:** When an institution is test-optional or the student did not submit scores, test score modifier is NULL (not zero). AKR is computed from GPA, course rigor, and completion rate only. Confidence is reduced by 5-10% to reflect the missing data dimension.

### Course Rigor
Course rigor measures the difficulty of the academic path the student chose, independent of the grades earned.

| Rigor Level | AKR Modifier |
|------------|-------------|
| 8+ AP/IB courses (or equivalent Dual Enrollment) | +4 to +6 |
| 5-7 AP/IB courses | +2 to +4 |
| 3-4 AP/IB courses | +1 to +2 |
| 1-2 AP/IB courses | 0 to +1 |
| Honors-heavy but no AP/IB | 0 |
| Standard curriculum only | -1 to -2 |
| Below grade-level courses | -3 to -5 |

For enrolled college students, course rigor is measured by: credit load per semester (12 vs 15 vs 18+), upper-division vs lower-division ratio, prerequisite progression pace, elective vs required course balance.

### Grade Trend
Grade trend measures direction over time. It is the academic equivalent of a player's trajectory.

| Trend | AKR Modifier |
|-------|-------------|
| Strong upward (0.3+ GPA improvement over 2+ semesters) | +3 to +5 |
| Moderate upward (0.1-0.3 GPA improvement) | +1 to +3 |
| Flat (steady performance) | 0 |
| Moderate decline (0.1-0.3 GPA decline) | -1 to -3 |
| Strong decline (0.3+ GPA decline) | -3 to -5 |

Upward trends are especially valuable in suppression contexts. A student whose GPA improved from 2.5 to 3.2 while working 30 hours/week shows far more than the 3.2 suggests.

### Credit Completion Rate
The percentage of attempted credits that are completed with passing grades.

| Completion Rate | AKR Modifier |
|----------------|-------------|
| 100% | +2 |
| 95-99% | +1 |
| 90-94% | 0 |
| 85-89% | -1 |
| 80-84% | -2 |
| 70-79% | -3 to -5 |
| Below 70% | -5 to -10 |

Withdrawals count as non-completions unless documented as medical or institutional withdrawals with extenuating circumstances.

### Academic Awards
| Award Type | AKR Modifier |
|-----------|-------------|
| National academic recognition (National Merit, Goldwater, etc.) | +3 to +5 |
| Institutional Dean's List (3+ semesters) | +2 to +3 |
| Departmental honors | +1 to +2 |
| Single semester Dean's List | +1 |
| No awards | 0 |

Awards are confirmation, not input. They confirm a tier placement but do not override the underlying numbers.

### AKR Computation
AKR = GPA_Band_Score + Test_Score_Modifier + Rigor_Modifier + Trend_Modifier + Completion_Modifier + Award_Modifier

Bounded to [0, 100]. If test scores are unavailable, AKR is computed without that modifier and confidence is adjusted.

---

# PKR - PROFESSIONAL KR

## Purpose
PKR measures professional readiness and real-world experience. It captures what the student has done outside the classroom that prepares them for career success. PKR is the equivalent of a player's measurables and physical tools - raw capability that translates differently depending on the system (program) they are in.

## Inputs

### Work Experience
| Level | PKR Band |
|-------|----------|
| Full-time professional role in field of study (1+ years) | 85-95 |
| Part-time professional role in field (6+ months) | 75-85 |
| Internship in field of study (completed) | 65-80 |
| Internship outside field (completed) | 55-70 |
| Part-time employment (any field, 1+ years) | 45-60 |
| Part-time employment (any field, under 1 year) | 35-50 |
| Volunteer work only | 30-45 |
| No work experience | 20-35 |

### Certifications and Technical Skills
| Level | PKR Modifier |
|-------|-------------|
| Industry-recognized certification in field (CPA, AWS, PMP, etc.) | +8 to +12 |
| Professional license or credential | +6 to +10 |
| Technical bootcamp completion (with portfolio) | +4 to +8 |
| Software/tool proficiency (demonstrated, not self-reported) | +2 to +5 |
| Self-reported skills only | +0 to +2 |
| No technical skills documented | 0 |

### Portfolio and Projects
| Level | PKR Modifier |
|-------|-------------|
| Published research or creative work | +5 to +8 |
| Substantial portfolio (5+ completed projects with documentation) | +4 to +7 |
| Capstone/thesis project completed | +3 to +5 |
| Class projects only | +1 to +2 |
| No portfolio | 0 |

### Entrepreneurial Activity
| Level | PKR Modifier |
|-------|-------------|
| Founded and operated a business (revenue-generating) | +8 to +12 |
| Founded a nonprofit or community organization | +5 to +8 |
| Side project or freelance work (documented clients/revenue) | +3 to +6 |
| Business plan or pitch competition participation | +1 to +3 |
| No entrepreneurial activity | 0 |

### Military Service
| Level | PKR Modifier |
|-------|-------------|
| Active duty (2+ years) with leadership role | +10 to +15 |
| Active duty (2+ years) | +8 to +12 |
| Reserves/National Guard (active) | +5 to +8 |
| ROTC completion | +3 to +5 |
| No military service | 0 |

### PKR Computation
PKR = Work_Band_Score + Cert_Modifier + Portfolio_Modifier + Entrepreneurial_Modifier + Military_Modifier

Bounded to [0, 100].

---

# EKR - ENGAGEMENT KR

## Purpose
EKR measures how actively and meaningfully a student engages with their community - campus, civic, and extracurricular. It is the equivalent of DKR in basketball - it captures the effort, commitment, and impact dimensions that do not show up in academic or professional metrics alone.

## Inputs

### Extracurricular Involvement
| Level | EKR Band |
|-------|----------|
| 3+ organizations with sustained multi-year commitment | 80-90 |
| 2-3 organizations with meaningful involvement | 65-80 |
| 1 organization with active participation | 50-65 |
| Casual involvement (attends but does not contribute) | 35-50 |
| No extracurricular involvement | 20-35 |

### Leadership Roles
| Level | EKR Modifier |
|-------|-------------|
| President/founder of campus or community organization | +8 to +12 |
| Vice president, treasurer, or board member | +5 to +8 |
| Team captain, project lead, committee chair | +3 to +6 |
| Active member with informal leadership | +1 to +3 |
| No leadership roles | 0 |

### Community Service
| Level | EKR Modifier |
|-------|-------------|
| 200+ documented hours (sustained, multi-year) | +6 to +10 |
| 100-199 documented hours | +4 to +6 |
| 50-99 documented hours | +2 to +4 |
| Under 50 documented hours | +1 to +2 |
| No documented service | 0 |

### Campus Involvement (Enrolled Students)
| Level | EKR Modifier |
|-------|-------------|
| RA, orientation leader, peer mentor, student government | +5 to +8 |
| Tutoring, study groups, campus employment | +3 to +5 |
| Regular event attendance and participation | +1 to +3 |
| Minimal campus presence | 0 |
| Commuter with no campus engagement | -2 to -4 |

Commuter penalty applies only when evaluating institutional fit for retention purposes. It does not reduce absolute EKR for admissions evaluation.

### Attendance Rate (Enrolled Students)
| Level | EKR Modifier |
|-------|-------------|
| 95%+ attendance | +3 to +5 |
| 90-94% attendance | +1 to +3 |
| 85-89% attendance | 0 |
| 80-84% attendance | -1 to -3 |
| Below 80% attendance | -3 to -8 |

### Participation Quality (When Observable)
Assessed from advising notes, faculty evaluations, or LMS engagement data. Scored only when data exists.

| Level | EKR Modifier |
|-------|-------------|
| Consistently high engagement (active in discussions, collaborative, initiative-taking) | +3 to +5 |
| Moderate engagement | +1 to +2 |
| Passive presence | 0 |
| Disruptive or disengaged | -2 to -5 |

### EKR Computation
EKR = Extracurricular_Band + Leadership_Modifier + Service_Modifier + Campus_Modifier + Attendance_Modifier + Participation_Modifier

Bounded to [0, 100].

---

# IQKR - GROWTH IQ

## Purpose
IQKR measures a student's capacity for growth, adaptation, and self-directed development. It is the equivalent of basketball IQKR - it captures the intangible cognitive and behavioral patterns that predict whether a student will improve over time or plateau.

IQKR is the hardest component to measure from data alone. Many of its inputs require advising notes, interview observations, or behavioral data from LMS/engagement systems. When these are unavailable, IQKR carries lower confidence and higher uncertainty.

## Inputs

### Trajectory (Direction Over Time)
| Pattern | IQKR Band |
|---------|----------|
| Consistent upward trajectory across multiple dimensions (GPA rising, engagement increasing, skills expanding) | 85-95 |
| Upward academic trajectory with stable engagement | 75-85 |
| Flat but solid performance across all areas | 65-75 |
| Mixed signals (improving in one area, declining in another) | 50-65 |
| Flat with low performance | 40-55 |
| Declining trajectory across multiple dimensions | 25-40 |
| Sharp decline or crisis pattern | 0-25 |

### Self-Advocacy
Measured from advising notes, support service utilization, and behavioral data.

| Level | IQKR Modifier |
|-------|-------------|
| Proactively seeks help, communicates with professors, uses all available resources | +5 to +8 |
| Seeks help when prompted, uses some resources | +2 to +4 |
| Rarely seeks help but responds to outreach | 0 to +1 |
| Does not seek help and does not respond to outreach | -3 to -5 |

### Resource Utilization
| Level | IQKR Modifier |
|-------|-------------|
| Regular use of tutoring, office hours, writing center, career center, advising | +5 to +8 |
| Occasional use of support services | +2 to +4 |
| Aware of services but does not use them | 0 |
| Unaware of available services | -2 to -4 |

### Adaptability
Measured from responses to academic setbacks, program changes, and life disruptions.

| Level | IQKR Modifier |
|-------|-------------|
| Recovered from major setback (failed course, personal crisis) with improved performance | +5 to +10 |
| Adjusted to new academic demands (transferred, changed major) successfully | +3 to +5 |
| Maintained steady performance through transitions | +1 to +3 |
| Struggled with transitions but stabilized | 0 |
| Failed to adapt to new demands or environments | -3 to -8 |

### First-Generation Adjustment
First-generation college students operate without family knowledge of college navigation. This is a KLVN-level adjustment that contextualizes their production, not a bonus for being first-gen.

| Status | IQKR Modifier |
|--------|-------------|
| First-generation AND demonstrating college navigation skills (self-taught) | +5 to +8 |
| First-generation with some family support (older sibling attended) | +2 to +4 |
| First-generation with no family support | +0 (flagged for suppression detection) |
| Not first-generation | 0 |

The first-gen modifier rewards demonstrated navigation in the absence of inherited knowledge. It does not reward the status itself - it rewards the skill acquisition that the status requires.

### ESL Adjustment
English as a Second Language students may produce academic work below their cognitive ability due to language barriers. Like the first-gen adjustment, this contextualizes production.

| Status | IQKR Modifier |
|--------|-------------|
| ESL student performing at or above institutional average | +5 to +8 |
| ESL student within 0.3 GPA of institutional average | +2 to +4 |
| ESL student more than 0.3 GPA below average | +0 (flagged for suppression detection) |
| Native English speaker | 0 |

### IQKR Computation
IQKR = Trajectory_Band + SelfAdvocacy_Modifier + ResourceUtil_Modifier + Adaptability_Modifier + FirstGen_Modifier + ESL_Modifier

Bounded to [0, 100].

---

# PROGRAM TRAIT WEIGHTING (OPF - Outcome Profile Formula)

## Purpose
Just as basketball positions weight offensive, defensive, tools, and IQ differently, academic programs weight the four student components differently. A STEM major needs AKR more than a trade school student needs EKR. The OPF captures this.

## OPF by Program Type

| Program Type | AKR Weight | PKR Weight | EKR Weight | IQKR Weight |
|-------------|-----------|-----------|-----------|------------|
| STEM (Science, Technology, Engineering, Math) | 45% | 25% | 10% | 20% |
| Business / Finance / Accounting | 30% | 35% | 15% | 20% |
| Education / Teaching | 25% | 15% | 35% | 25% |
| Nursing / Allied Health | 40% | 30% | 10% | 20% |
| Liberal Arts / Humanities | 35% | 15% | 25% | 25% |
| Fine Arts / Performing Arts | 20% | 40% | 20% | 20% |
| Trade / Technical / Vocational | 15% | 50% | 10% | 25% |
| Criminal Justice / Public Safety | 25% | 30% | 25% | 20% |
| Social Work / Human Services | 25% | 15% | 35% | 25% |
| Theology / Ministry | 25% | 10% | 40% | 25% |
| Undeclared / Exploratory | 30% | 15% | 20% | 35% |

### OPF Rules
- Weights must sum to 100% for every program type.
- If a student is undeclared, the Undeclared profile applies. When they declare a major, KR is recomputed with the new OPF. This may change their KR.
- Double majors use the primary major's OPF. If no primary is declared, use the average of both OPFs.
- Graduate programs use the same OPF categories but with PKR and IQKR weighted higher across the board (graduate students are expected to have professional experience and demonstrated adaptability).

### Graduate OPF Adjustment
For master's and doctoral students, apply the following shift to the base program OPF:
- AKR: -5%
- PKR: +10%
- EKR: -5%
- IQKR: same

This reflects the expectation that graduate students bring professional experience (higher PKR) and that engagement patterns differ from undergraduate life.

---

# INSTITUTION LEGENDS

## Purpose
Institution Legends translate Student KR into context-specific meaning, just as basketball KR Legends translate a number into "what does this player look like at this level." A KR of 85 means something different at an Ivy than at a community college, not because the student is different, but because the institution's expectations, peer group, and success criteria are different.

## How to Read the Legend
Each institution type has tiers from 95-100 down to 0-29. Each tier describes what a student at that KR level looks like in that institutional context: their academic profile, their engagement, their professional readiness, their likelihood of persisting to graduation, and their contribution to the institution.

---

## ELITE PRIVATE (Ivy+, Stanford, MIT, Caltech, Duke, etc.)

| KR Range | Tier Label | Profile Description |
|----------|-----------|-------------------|
| 95-100 | Institutional Anchor | 4.0 UW / 4.5+ W, 1550+ SAT or 35+ ACT, 10+ AP/IB, national-level achievement (published research, national competition winner, founded significant organization), near-certain to graduate with honors, likely graduate school or elite career placement, legacy-defining student who elevates the institution's profile |
| 90-94 | Dean's List Fixture | 3.85-3.99 UW, 1480-1549 SAT or 33-34 ACT, 8+ AP/IB, strong extracurriculars with leadership, departmental honors likely, graduate school competitive, high retention probability, contributes meaningfully to campus intellectual life |
| 85-89 | Strong Contributor | 3.70-3.84 UW, 1400-1479 SAT or 31-32 ACT, 6-8 AP/IB, active in 2+ organizations, solid professional preparation, will graduate on time, good career outcomes, reliable member of the academic community |
| 80-84 | Solid Admit | 3.50-3.69 UW, 1350-1399 SAT or 29-30 ACT, 4-6 AP/IB, some extracurriculars, adequate professional preparation, will likely graduate but may not distinguish themselves, average retention risk |
| 75-79 | Stretch Admit | 3.30-3.49 UW, 1280-1349 SAT or 27-28 ACT, 3-4 AP/IB, limited extracurriculars, may struggle with rigor initially, needs academic support, moderate retention risk, admitted for diversity/talent/potential rather than academic profile |
| 70-74 | High Support Needed | 3.10-3.29 UW, 1200-1279 SAT or 25-26 ACT, minimal AP/IB, significant academic support needed, higher retention risk, will need advising intervention, may take longer to graduate |
| 60-69 | Unlikely Admit | Below typical admission thresholds for this institution type. Would require exceptional circumstances (recruited athlete, major donor, extraordinary talent) to gain admission. If admitted, very high risk without intensive support. |
| Below 60 | Not Competitive | Well below institutional thresholds. Not a realistic applicant for this institution type. Better served at a different institutional tier. |

---

## RESEARCH UNIVERSITY (R1 - Large State Flagships, Major Research Institutions)

| KR Range | Tier Label | Profile Description |
|----------|-----------|-------------------|
| 95-100 | Honors Program Star | 3.90+ UW, 1450+ SAT or 33+ ACT, 8+ AP/IB, research experience, national recognition, full-ride scholarship candidate, will graduate with distinction, graduate school bound, enhances department reputation |
| 90-94 | Honors Track | 3.75-3.89 UW, 1380-1449 SAT or 31-32 ACT, 6-8 AP/IB, strong engagement, honors-eligible, high retention, competitive for research assistantships and graduate school |
| 85-89 | Above Average | 3.55-3.74 UW, 1300-1379 SAT or 28-30 ACT, 4-6 AP/IB, active campus citizen, good professional preparation, solid retention, will graduate on time |
| 80-84 | Average Admit | 3.30-3.54 UW, 1200-1299 SAT or 25-27 ACT, 2-4 AP/IB, some engagement, adequate preparation, standard retention risk |
| 75-79 | Below Average | 3.10-3.29 UW, 1100-1199 SAT or 22-24 ACT, 1-2 AP/IB, limited engagement, may need academic support, elevated retention risk |
| 70-74 | Conditional Admit | 2.80-3.09 UW, 1000-1099 SAT or 20-21 ACT, no AP/IB, will need bridge program or conditional admission with support requirements, high retention risk |
| 60-69 | Provisional | 2.50-2.79 UW, below 1000 SAT, minimal preparation, very high retention risk, likely needs developmental coursework, significant support required |
| Below 60 | Not Competitive | Below admission thresholds. Would need open-admission pathway or community college transfer pipeline to access this institution type. |

---

## REGIONAL STATE UNIVERSITY

| KR Range | Tier Label | Profile Description |
|----------|-----------|-------------------|
| 95-100 | Institutional Star | 3.85+ UW, 1350+ SAT or 30+ ACT, strong extracurriculars, this student chose this school (not a safety school consolation), will anchor honors program, full scholarship candidate, graduate school competitive |
| 90-94 | Top Performer | 3.65-3.84 UW, 1250-1349 SAT or 27-29 ACT, active engagement, honors-eligible, high retention, will graduate with distinction |
| 85-89 | Strong Student | 3.45-3.64 UW, 1150-1249 SAT or 24-26 ACT, good engagement, solid preparation, reliable graduation path |
| 80-84 | Average Student | 3.20-3.44 UW, 1050-1149 SAT or 21-23 ACT, some engagement, adequate preparation, standard retention risk |
| 75-79 | Below Average | 2.90-3.19 UW, 950-1049 SAT or 19-20 ACT, limited engagement, needs some support, elevated retention risk |
| 70-74 | At Risk Admit | 2.60-2.89 UW, below 950 SAT, will need developmental courses and advising support, high retention risk |
| 60-69 | High Risk | 2.30-2.59 UW, minimal preparation, very high attrition probability without intensive intervention |
| Below 60 | Critical Risk | Below 2.30 UW, may need pre-college preparation, community college bridge recommended |

---

## HBCU (Historically Black Colleges and Universities)

| KR Range | Tier Label | Profile Description |
|----------|-----------|-------------------|
| 95-100 | Legacy Builder | 3.85+ UW, 1350+ SAT or 30+ ACT (if test-submitting), strong leadership in community organizations, cultural engagement, this student chose the HBCU mission deliberately, will anchor honors program and campus leadership, graduate school or elite career bound |
| 90-94 | Campus Leader | 3.65-3.84 UW, 1250-1349 SAT or 27-29 ACT, active in Greek life, student government, or cultural organizations, honors-eligible, high retention, strong institutional ambassador |
| 85-89 | Strong Contributor | 3.45-3.64 UW, 1150-1249 SAT or 24-26 ACT, engaged in campus life, solid academic preparation, reliable graduation path, contributes to institutional culture |
| 80-84 | Solid Student | 3.20-3.44 UW, 1050-1149 SAT or 21-23 ACT, some campus involvement, adequate preparation, standard retention risk |
| 75-79 | Growing Student | 2.90-3.19 UW, limited test scores, developing engagement, needs mentoring and support, responds well to HBCU community structure, moderate retention risk |
| 70-74 | Support Dependent | 2.60-2.89 UW, academic support needed, benefits significantly from HBCU's smaller class sizes and faculty accessibility, elevated retention risk |
| 60-69 | High Risk | 2.30-2.59 UW, significant gaps, will need bridge program and intensive advising, high attrition risk |
| Below 60 | Critical Risk | Below 2.30 UW, may need pre-college preparation, community college pipeline recommended |

**HBCU Context Notes:**
- Many HBCUs are test-optional. Test score bands apply only when scores are submitted.
- Cultural fit (EKR) carries additional weight at HBCUs. Students who are actively engaged in the HBCU mission and culture have higher retention rates regardless of AKR.
- First-generation students represent a significant portion of HBCU enrollment. Suppression detection is critical here.
- Greek life, band/marching arts, and cultural organizations are high-impact engagement channels specific to the HBCU context.

---

## FAITH-BASED INSTITUTION

| KR Range | Tier Label | Profile Description |
|----------|-----------|-------------------|
| 95-100 | Mission Exemplar | 3.85+ UW, strong test scores (if submitting), deep faith community engagement, leadership in ministry or service, academic excellence combined with spiritual maturity, will be institution's showcase graduate |
| 90-94 | Honors and Ministry | 3.65-3.84 UW, active in campus ministry, missions, or faith-based service, honors-eligible, high retention (faith community is a powerful retention mechanism), graduate school or ministry placement likely |
| 85-89 | Strong Contributor | 3.45-3.64 UW, engaged in faith community and academics, solid preparation, reliable graduation path |
| 80-84 | Good Fit | 3.20-3.44 UW, alignment with institutional mission, some faith community engagement, standard retention risk |
| 75-79 | Developing | 2.90-3.19 UW, exploring faith alongside academics, needs mentoring, moderate retention risk |
| 70-74 | Support Needed | 2.60-2.89 UW, academic support required, faith community engagement may provide retention benefit, elevated risk |
| 60-69 | High Risk | 2.30-2.59 UW, significant academic gaps, retention depends heavily on community connections |
| Below 60 | Critical Risk | Below 2.30 UW, may need developmental preparation |

**Faith-Based Context Notes:**
- Mission alignment (a dimension of System Fit) is a stronger retention predictor at faith-based institutions than at secular schools. A student with moderate AKR but high mission alignment may have better retention outcomes than a high-AKR student with no faith engagement.
- Theology/Ministry programs use a distinct OPF with EKR weighted at 40%.
- Chapel attendance, missions participation, and ministry leadership are engagement signals specific to this context.

---

## COMMUNITY COLLEGE

| KR Range | Tier Label | Profile Description |
|----------|-----------|-------------------|
| 95-100 | Transfer Star | 3.85+ GPA, full-time enrollment, honors program participant, on track for competitive transfer to 4-year institution, leadership in student organizations, may have chosen CC deliberately for financial reasons (suppression context) |
| 90-94 | High Performer | 3.65-3.84 GPA, strong course completion, engaged, transfer-ready, honors-eligible |
| 85-89 | Above Average | 3.45-3.64 GPA, solid completion rate, some engagement, on track for transfer or workforce entry |
| 80-84 | Average Student | 3.20-3.44 GPA, adequate completion, standard retention risk, will complete associate degree or transfer with moderate support |
| 75-79 | Below Average | 2.90-3.19 GPA, some course withdrawals or failures, needs advising support, moderate attrition risk |
| 70-74 | At Risk | 2.60-2.89 GPA, elevated withdrawal rate, needs intervention, high risk of stop-out (temporary departure with intent to return) |
| 60-69 | High Risk | 2.30-2.59 GPA, multiple course failures or withdrawals, significant barriers, very high attrition risk |
| 50-59 | Developmental | 2.00-2.29 GPA, in developmental/remedial coursework, may complete with sustained intervention |
| Below 50 | Critical | Below 2.00 GPA, academic suspension likely, needs fundamental skill building |

**Community College Context Notes:**
- Community colleges are open-admission. The legend describes student quality within the enrolled population, not admission selectivity.
- Suppression factors are pervasive: the majority of CC students work, many are parents, many are first-generation. Suppression detection is not an edge case here - it is the baseline.
- Transfer intent vs workforce intent changes the evaluation frame. A KR 85 student planning to transfer to a UC is evaluated differently than a KR 85 student completing an associate degree for immediate employment.
- Stop-out is more common than full dropout at CCs. Retention intelligence must distinguish between students who leave permanently and those who pause.

---

## TRADE / TECHNICAL SCHOOL

| KR Range | Tier Label | Profile Description |
|----------|-----------|-------------------|
| 95-100 | Program Star | High technical aptitude, relevant certifications or prior experience, strong attendance and hands-on performance, employer-ready before graduation, likely to receive job offers during program |
| 90-94 | Top Performer | Strong technical skills, good attendance, completes projects at high quality, professional demeanor, competitive for top employer placements |
| 85-89 | Above Average | Solid technical performance, reliable attendance, adequate professional skills, will complete program and find employment |
| 80-84 | Average Student | Meets program requirements, some skill gaps, standard completion probability |
| 75-79 | Below Average | Needs additional practice and support, some attendance concerns, moderate completion risk |
| 70-74 | At Risk | Significant skill gaps, attendance issues, may need extended program time |
| 60-69 | High Risk | Multiple performance deficiencies, high risk of non-completion |
| Below 60 | Critical | Not meeting program minimums, intervention or program change needed |

**Trade/Technical Context Notes:**
- AKR matters less here. PKR dominates (50% OPF weight). Certifications, hands-on competency, and attendance are the primary drivers.
- GPA may not exist in the traditional sense. Many trade programs use competency-based assessments. AKR should be computed from completion rates and assessment scores when traditional GPA is unavailable.
- Employment placement rate is the institution's primary outcome metric, not graduation rate or GPA.

---

## ONLINE / NON-TRADITIONAL

| KR Range | Tier Label | Profile Description |
|----------|-----------|-------------------|
| 95-100 | Self-Directed Star | High GPA in asynchronous environment, strong time management demonstrated through completion rates, active in virtual discussions and group projects, professional development concurrent with studies, likely career advancer using degree for promotion/transition |
| 90-94 | High Performer | Strong academic performance, consistent engagement with online platform, good course completion pace, professional growth evident |
| 85-89 | Above Average | Solid performance, mostly on track with completion timeline, some engagement with virtual community |
| 80-84 | Average Student | Adequate performance, standard completion pace, minimal community engagement |
| 75-79 | Below Average | Some course extensions or withdrawals, pacing behind schedule, needs check-ins |
| 70-74 | At Risk | Multiple course pauses, engagement declining, high risk of program abandonment |
| 60-69 | High Risk | Significant completion gaps, minimal platform activity, very high abandonment risk |
| Below 60 | Critical | Has essentially stopped progressing, intervention needed to determine if continuation is viable |

**Online/Non-Traditional Context Notes:**
- IQKR is the strongest retention predictor for online students. Self-direction, time management, and resource utilization are more important than raw academic ability in this format.
- Suppression factors are especially common: online students are disproportionately working adults, parents, military, and career changers.
- Engagement is measured differently: LMS login frequency, discussion post quality, assignment submission timeliness, virtual office hours attendance, peer interaction volume.
- Completion rate (not graduation rate) is the primary institutional metric. Many online programs have longer time-to-degree norms.

---

# KLVN NORMALIZATION

## Purpose
KLVN (pronounced "Kelvin") normalizes student production across different contexts so that Student KR is truly universal. A 3.5 GPA does not mean the same thing at every institution or from every high school. KLVN ensures that the system accounts for these differences without penalizing or inflating students based on context they did not choose.

## Lambda by Institution Type

Institution type lambda adjusts the AKR band score to account for grading standards and academic rigor differences across institution types.

| Institution Type | Lambda | Direction | Rationale |
|-----------------|--------|-----------|-----------|
| Elite Private (Ivy+) | 1.00 | Baseline | Grade deflation and extreme rigor at these schools means GPA is already a demanding metric |
| Research University (R1) | 0.97 | Slight discount | Some grade inflation at large research universities, but overall rigor is high |
| Regional State | 0.93 | Moderate discount | More accessible grading standards, less competitive peer group |
| HBCU | 0.95 | Slight discount | Variable by institution, many HBCUs maintain rigorous standards |
| Faith-Based | 0.94 | Moderate discount | Variable, depends heavily on specific institution |
| Community College | 0.88 | Significant discount | Open admission means wider grade distribution, less competitive peer group |
| Trade/Technical | 0.85 | Large discount | Competency-based assessment often maps poorly to traditional GPA |
| Online/Non-Traditional | 0.90 | Moderate discount | Asynchronous format and variable assessment standards |

### Application
AKR_normalized = AKR_raw * lambda_institution

Lambda adjusts the raw AKR band score. It does NOT adjust PKR, EKR, or IQKR - those are institution-agnostic by design.

## Lambda by High School Type (For Incoming Students)

For prospective and incoming students, the high school they attended affects how to interpret their GPA.

| High School Type | Lambda | Direction | Rationale |
|-----------------|--------|-----------|-----------|
| Elite College Prep (Phillips Exeter, Sidwell Friends, etc.) | 1.08 | Boost | Grade deflation, extreme rigor, a 3.2 here may equal 3.8 elsewhere |
| Competitive Public (Thomas Jefferson, Stuyvesant, etc.) | 1.05 | Boost | High rigor, competitive peer group |
| Strong Suburban Public | 1.00 | Baseline | Standard high school rigor benchmark |
| Average Public | 0.97 | Slight discount | Average rigor and grading standards |
| Under-resourced Public | 0.94 | Discount | Fewer AP/IB offerings, larger classes, less individualized attention. Students may have lower GPA not because of lower ability but because of lower support. |
| Alternative/Charter (Variable) | 0.95-1.02 | Variable | Depends heavily on specific school, needs case-by-case assessment |
| Homeschool | 0.93-1.05 | Variable | Wide range of rigor, no standardization, needs additional data points for confidence |
| International | 0.90-1.05 | Variable | Depends on country and school, transcript evaluation services (WES, ECE) should inform |

### Application
AKR_hs_adjusted = AKR_normalized * lambda_hs

High school lambda stacks on top of institution lambda. A student from an elite prep school applying to a community college would have: AKR_final = AKR_raw * 0.88 (CC lambda) * 1.08 (HS lambda).

## First-Generation Adjustment

First-generation status is a contextual factor, not a bonus. Students without family college experience navigate the application and enrollment process with less inherited knowledge, less academic coaching, and less understanding of institutional norms. This systematically suppresses production relative to ability.

| Context | Adjustment |
|---------|-----------|
| First-gen, both parents no college degree | IQKR +5, flag for suppression detection |
| First-gen, one parent some college (no degree) | IQKR +3, flag for suppression detection |
| First-gen, sibling attended college | IQKR +2 |
| Not first-gen | No adjustment |

These are NOT bonuses. They are corrections that partially account for the systematic disadvantage of navigating college without family context. The full suppression analysis (Suppression Detection section) may add additional context.

## Socioeconomic Adjustment

Students from lower socioeconomic backgrounds often work significant hours, lack quiet study space, lack reliable transportation, and experience food or housing insecurity. These factors suppress academic production.

| Context | Adjustment |
|---------|-----------|
| Working 30+ hours/week during school | AKR +3, flag for work suppression |
| Working 20-29 hours/week during school | AKR +2, flag for work suppression |
| Documented food or housing insecurity | AKR +3, IQKR +3, flag for environmental suppression |
| Primary caretaker (children, elderly family) | AKR +2, EKR +2, flag for family suppression |
| No documented socioeconomic barriers | No adjustment |

These adjustments are conservative. Suppression Detection (below) provides the full contextual analysis.

---

# SYSTEM FIT

## Purpose
System Fit measures how well a student matches the specific learning environment, culture, and support structure of the institution they are applying to or enrolled in. It is separate from Student KR - a high-KR student can be a poor fit and a moderate-KR student can be an excellent fit.

System Fit is the single strongest predictor of retention outside of financial stability. A student who fits the institution's culture, learning style, and support model is dramatically more likely to persist.

## Fit Dimensions

### Learning Style Fit
| Dimension | Assessment |
|-----------|-----------|
| Lecture-heavy environment | Does the student perform well in passive learning? High AKR from lecture-based coursework = good fit |
| Discussion-based / Seminar | Does the student show strong participation quality? High EKR participation scores = good fit |
| Project-based / Experiential | Does the student have portfolio, hands-on work, or lab experience? High PKR = good fit |
| Online / Asynchronous | Does the student show self-direction, time management, consistent LMS engagement? High IQKR = good fit |
| Hybrid / Flexible | Adaptability matters most. High IQKR with balanced other components = good fit |

### Campus Culture Fit
| Dimension | Assessment |
|-----------|-----------|
| Urban campus | Student from urban background or expressed urban preference; commuter-friendly if needed |
| Rural campus | Student comfortable with smaller community, fewer off-campus distractions |
| Large institution (5,000+) | Student comfortable navigating bureaucracy, self-advocating, finding community in scale |
| Small institution (under 1,000) | Student benefits from close faculty relationships, small class sizes, tight community |
| Residential | Student able and willing to live on campus; this predicts higher engagement |
| Commuter | Student has reliable transportation, schedule flexibility, does not need residential community for retention |
| Faith-based | Student aligned with institutional mission, values faith community as a support structure |
| Secular | Student prefers academic environment without religious programming requirements |

### Academic Support Fit
| Dimension | Assessment |
|-----------|-----------|
| High-support environment | Institution offers intensive advising, mandatory tutoring, structured schedules. Best for students with lower IQKR who need external structure. |
| Moderate-support | Standard advising and optional services. Best for students with moderate IQKR who use resources when prompted. |
| Independent / Self-directed | Minimal handholding, student-driven engagement. Best for high IQKR students who seek help proactively. |
| Structured cohort model | Lock-step progression with a peer group. Strong for students who benefit from community accountability. |
| Flexible / Self-paced | Student sets own timeline. Requires very high IQKR (self-direction, time management). |

### Financial Fit
| Assessment | Score |
|-----------|-------|
| Full financial coverage (scholarships + family + savings cover all costs) | 95-100 |
| Minimal gap (less than $2,000/year unmet need) | 85-94 |
| Moderate gap ($2,000-$8,000/year unmet need) | 70-84 |
| Significant gap ($8,000-$15,000/year unmet need) | 50-69 |
| Large gap ($15,000+/year unmet need) | 25-49 |
| Extreme gap (no realistic financial plan) | 0-24 |

Financial fit is the single most predictive retention variable. A student with KR 90 and financial fit 30 is at higher retention risk than a student with KR 70 and financial fit 95.

### System Fit Computation
System_Fit_Pct = (Learning_Fit * 0.25) + (Culture_Fit * 0.20) + (Support_Fit * 0.20) + (Financial_Fit * 0.35)

Financial fit gets the highest weight because financial barriers are the #1 reason students leave.

---

# SUPPRESSION DETECTION

## Purpose
Suppression detection identifies factors that systematically reduce a student's observable academic production below their actual cognitive ability and growth potential. Suppression does NOT change the KR. It provides context that informs downstream decisions: financial aid allocation, support service referrals, retention intervention, and advising strategy.

Suppression detection is MORE IMPORTANT in admissions intelligence than in sports intelligence because socioeconomic factors suppress academic performance more pervasively and more severely than physical limitations suppress athletic performance. A student working 35 hours per week at a gas station while taking 15 credits and caring for a younger sibling is operating under suppression that is invisible in a GPA number.

## Suppression Types

### Work Suppression
**Trigger:** Student employed 20+ hours/week during academic terms.

| Level | Hours/Week | Estimated GPA Suppression | Suppression Label |
|-------|-----------|--------------------------|------------------|
| Moderate | 20-29 | 0.2-0.4 GPA points | Work Suppression (Moderate) |
| Severe | 30-39 | 0.4-0.7 GPA points | Work Suppression (Severe) |
| Extreme | 40+ | 0.6-1.0 GPA points | Work Suppression (Extreme) |

Estimated GPA suppression is based on research showing that students working 20+ hours per week earn lower GPAs on average, controlling for prior academic ability. These are estimates, not exact measurements.

**Suppression ceiling:** "This student's KR is 72. With work suppression removed (35 hours/week employment), estimated ceiling is 79-84."

### Family Suppression
**Trigger:** Student has documented caretaker responsibilities or significant family obligations.

| Level | Context | Estimated Impact |
|-------|---------|-----------------|
| Moderate | Part-time caretaker, family obligations limiting study time | 0.1-0.3 GPA suppression |
| Severe | Primary caretaker for children or family member | 0.3-0.6 GPA suppression |
| Extreme | Single parent or sole caretaker with no support system | 0.5-0.8 GPA suppression |

### Health Suppression
**Trigger:** Documented physical or mental health conditions affecting academic performance.

| Level | Context | Estimated Impact |
|-------|---------|-----------------|
| Moderate | Managed chronic condition with accommodations in place | 0.1-0.3 GPA suppression |
| Severe | Active health crisis or unmanaged condition during academic term | 0.3-0.6 GPA suppression |
| Extreme | Hospitalization, extended treatment, or disability without adequate accommodation | 0.5-1.0 GPA suppression |

Health suppression is ONLY flagged when documented through official channels (disability services, medical withdrawal records, advising notes). The system never diagnoses or infers health conditions.

### Environmental Suppression
**Trigger:** Documented food insecurity, housing instability, or transportation barriers.

| Level | Context | Estimated Impact |
|-------|---------|-----------------|
| Food insecurity | Student uses campus food pantry, reports food insecurity, or qualifies for SNAP/emergency food assistance | 0.2-0.5 GPA suppression |
| Housing instability | Student has experienced homelessness, couch-surfing, or unstable housing during academic term | 0.3-0.7 GPA suppression |
| Transportation barriers | Student lacks reliable transportation to campus, misses classes due to transit issues | 0.1-0.4 GPA suppression |

Multiple environmental suppression factors are additive. A student with food insecurity AND housing instability faces compounding suppression.

### Language Suppression
**Trigger:** Student's primary language is not English and they are enrolled in an English-medium institution.

| Level | Context | Estimated Impact |
|-------|---------|-----------------|
| Mild | Conversationally fluent but academic writing is below speaking ability | 0.1-0.3 GPA suppression |
| Moderate | Functional English but struggles with academic vocabulary and writing conventions | 0.3-0.5 GPA suppression |
| Severe | Limited English proficiency, taking ESL courses concurrently with academic courses | 0.5-0.8 GPA suppression |

Language suppression is especially important at institutions with significant international or immigrant student populations. A student with high cognitive ability who writes a B-minus paper because of language barriers is not a B-minus student - they are a suppressed A student.

### First-Generation Suppression
**Trigger:** Student is the first in their family to attend college.

| Level | Context | Estimated Impact |
|-------|---------|-----------------|
| Mild | First-gen but attended college-prep high school or had strong mentorship | 0.0-0.2 GPA suppression |
| Moderate | First-gen from average high school, limited guidance on college navigation | 0.2-0.4 GPA suppression |
| Severe | First-gen from under-resourced school, no college mentorship, family may not understand or support college attendance | 0.3-0.6 GPA suppression |

First-generation suppression is often invisible because it manifests as missed deadlines, unused resources, and poor course selection rather than poor performance in individual classes.

## Suppression Rules
1. Suppression is documented, never assumed. If there is no data to support a suppression flag, it is not flagged.
2. Suppression does NOT change the computed KR. It adds an estimated ceiling and contextual flags.
3. Multiple suppression types are additive but capped. Total estimated GPA suppression cannot exceed 1.5 points (even if the theoretical sum is higher) because compounding factors eventually overlap.
4. Suppression estimates are RANGES, not exact numbers. Always present as a range.
5. Suppression informs downstream engines: financial aid should prioritize students with high suppression (they are undervalued). Retention intervention should target students with high suppression (they are at elevated risk). Advising should address the specific suppression factors (connect to food pantry, adjust work-study, provide childcare resources).
6. The suppression ceiling is a PROJECTION, not a guarantee. "Estimated ceiling 84-87" means "if suppression factors were removed, this student's KR would likely land in the 84-87 range based on trajectory, adaptability, and comparable students."

---

# BADGES

## Purpose
Badges certify specific student attributes or achievements that are not fully captured by the four component KRs. Like basketball badges, they are binary (the student either qualifies or does not) and add context to the evaluation without changing the underlying KR math.

## Badge Library

### First Generation
**Criteria:** First in immediate family (parents) to attend a four-year college or university.
**Verification:** Self-reported on application, verified against FAFSA/financial aid data where available.
**Significance:** Signals resilience and self-direction. High-value signal for retention intervention targeting.

### Working Student
**Criteria:** Employed 20+ hours per week during academic terms.
**Verification:** Self-reported or documented through work-study, employment verification, or financial aid records.
**Significance:** Triggers work suppression flag. Indicates real-world experience (PKR context) but also time constraint (retention risk).

### Veteran
**Criteria:** Completed active military service (any branch).
**Verification:** DD-214 or military transcript.
**Significance:** Strong PKR signal. Veterans bring discipline, leadership, and maturity. Also triggers specific support service routing (VA benefits, veteran student organizations).

### Multilingual
**Criteria:** Fluent (conversational and written) in 2+ languages.
**Verification:** Self-reported, verified through language proficiency assessment if available.
**Significance:** Cognitive flexibility indicator (IQKR context). May also indicate language suppression if English is not primary language.

### Community Leader
**Criteria:** Held a significant leadership position (president, founder, director) in a community organization outside of school.
**Significance:** Strong EKR signal. Indicates initiative, organizational ability, and community engagement beyond campus.

### Entrepreneur
**Criteria:** Founded and operated a business, nonprofit, or significant project with documented impact (revenue, users, beneficiaries).
**Significance:** Strong PKR signal. Indicates self-direction, risk tolerance, and practical skill application.

### Overcomer
**Criteria:** Documented significant life obstacle overcome - homelessness, foster care, serious illness, family crisis, refugee/immigration experience, incarceration history - with demonstrated recovery and forward trajectory.
**Verification:** Application essay, advising documentation, or verified self-report.
**Significance:** Strong IQKR signal (resilience, adaptability). Triggers suppression detection. High-value for holistic admissions.

### Dean's List
**Criteria:** Achieved Dean's List standing (institutional definition, typically 3.5+ GPA) for 2+ semesters.
**Significance:** Confirms sustained academic excellence (AKR confirmation). Distinguished from one-semester performance.

### Perfect Attendance
**Criteria:** Zero unexcused absences for a full academic year.
**Significance:** Strong EKR signal. Indicates commitment and reliability. Especially significant for commuter students and those with work suppression.

### Transfer Success
**Criteria:** Successfully transferred from one institution to another and maintained or improved GPA.
**Significance:** Strong IQKR signal (adaptability). Indicates the student can navigate institutional change.

### Peer Mentor
**Criteria:** Served as an official peer mentor, tutor, or supplemental instruction leader for 1+ semesters.
**Significance:** Strong EKR and IQKR signal. Teaching others demonstrates mastery and leadership.

### Research Participant
**Criteria:** Participated in faculty-led or independent research project with documented output (poster, paper, presentation).
**Significance:** Strong AKR and PKR signal. Indicates readiness for graduate school or research-intensive career.

---

# RETENTION RISK FLAGS

## Purpose
Retention Risk Flags identify specific conditions that predict a student leaving the institution before completing their program. Unlike suppression (which contextualizes current performance), retention flags predict FUTURE behavior - the likelihood that a student will not return next semester.

Flags are binary: present or absent. When present, they trigger the retention engine to generate intervention recommendations.

## Flag Library

### Financial Strain
**Trigger:** Student has unpaid balance, financial aid gap exceeding $3,000, payment plan delinquency, or has expressed financial hardship to advising/financial aid office.
**Severity:** Critical - financial barriers are the #1 cause of attrition
**Intervention path:** Emergency aid, payment plan restructure, work-study placement, external scholarship search, basic needs referral

### Academic Probation
**Trigger:** GPA below institutional good standing threshold (typically 2.0) for one or more semesters.
**Severity:** High - academic probation is a strong predictor of departure
**Intervention path:** Academic advising (course load reduction, major exploration), tutoring referral, study skills workshop, potential course retake strategy

### Engagement Drop
**Trigger:** Measurable decline in attendance (15%+ drop from previous semester), LMS activity decline (50%+ reduction in login frequency), missed advising appointments (2+ consecutive), dropped from campus organizations.
**Severity:** High - engagement decline often precedes academic decline by 4-6 weeks
**Intervention path:** Proactive outreach (advisor, faculty, peer mentor), engagement re-invitation, root cause exploration (financial? health? social? academic?)

### Social Isolation
**Trigger:** Student is not a member of any campus organization, has no documented peer connections, is a commuter with no on-campus presence outside of class, has not attended any campus events.
**Severity:** Moderate - social isolation reduces sense of belonging, which is a key retention driver
**Intervention path:** Peer mentor assignment, organization referral (based on interests), living-learning community invitation, study group facilitation

### Transfer Intent
**Trigger:** Student has expressed interest in transferring (to advising, in surveys, or through transcript request to other institutions), is browsing competitor programs, has not registered for the next semester despite being eligible.
**Severity:** Moderate to High - depends on whether the student has a specific destination or is generally dissatisfied
**Intervention path:** Exit interview (why are they considering leaving?), targeted retention offer (aid adjustment, program change, housing improvement), honest assessment (if the student would be better served elsewhere, the system acknowledges this rather than retaining at all costs)

### Life Event
**Trigger:** Documented family crisis (death, divorce, illness in family), personal health emergency, housing loss, legal issue, pregnancy/childbirth, or other acute life disruption.
**Severity:** Variable - depends on severity and support system
**Intervention path:** Immediate support services (counseling, emergency aid, housing assistance), academic accommodation (incomplete grades, reduced course load), re-engagement plan for return

### Registration Gap
**Trigger:** Student has not registered for the upcoming semester within the registration window, despite being academically eligible and financially cleared.
**Severity:** High - non-registration is the strongest single predictor of attrition at the semester boundary
**Intervention path:** Immediate outreach (phone, email, text), advising appointment, registration assistance, address underlying barrier (often financial or academic uncertainty)

### Credit Velocity Decline
**Trigger:** Student is completing fewer credits per semester than their historical average, or has fallen behind the credit pace required for on-time graduation.
**Severity:** Moderate - credit slowdown extends time-to-degree, which increases total cost and decreases completion probability
**Intervention path:** Advising review (is the slowdown intentional?), course planning for catch-up, summer/winter session options, potential program adjustment

---

## Retention Risk Scoring

Each flag has a base risk score. Flags are additive. Total risk score maps to a risk tier.

| Flag | Base Risk Score |
|------|----------------|
| Financial Strain | 30 |
| Academic Probation | 25 |
| Engagement Drop | 20 |
| Registration Gap | 25 |
| Life Event | 20 |
| Transfer Intent | 15 |
| Social Isolation | 10 |
| Credit Velocity Decline | 10 |

### Risk Tiers
| Total Risk Score | Tier | Response Timeline |
|-----------------|------|------------------|
| 50+ | Critical | Intervention within 48 hours |
| 35-49 | High | Intervention this week |
| 20-34 | Moderate | Monitor, check in within 2 weeks |
| 10-19 | Low-Moderate | Standard advising cycle |
| 0-9 | Low | On track, no intervention needed |

Multiple flags compound. A student with Financial Strain (30) + Engagement Drop (20) = 50 = Critical, even though neither flag alone would trigger Critical.

---

# FINAL KR COMPUTATION

## Master Formula

Student_KR = (AKR_final * OPF_akr) + (PKR * OPF_pkr) + (EKR * OPF_ekr) + (IQKR * OPF_iqkr)

Where:
- AKR_final = AKR_raw * lambda_institution * lambda_hs (if applicable) + socioeconomic adjustments
- OPF weights come from the Program Trait Weighting table based on declared major
- All components bounded to [0, 100]
- Final Student KR bounded to [0, 100]

## Interpretation
Student KR is ALWAYS interpreted against the Institution Legend for the student's current or target institution. A KR of 82 means one thing at an Ivy (Solid Admit) and another at a Community College (Average Student). The number is universal; the meaning is contextual.

---

## VERSION HISTORY
- v1.0: Initial build. Four component KRs (AKR, PKR, EKR, IQKR), 11 program OPF weights, 8 institution legends, KLVN normalization (institution + HS + first-gen + socioeconomic), System Fit (4 dimensions), Suppression Detection (6 types), 12 badges, 8 retention risk flags with scoring. Architecture mirrors basketball File 02 with domain-appropriate content.
