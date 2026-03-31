# KaNeXT Admissions Intelligence - Complete Knowledge Base

## Version 1.0 - March 2026

This is the comprehensive reference document for the KaNeXT Admissions Intelligence system. It covers every concept, every metric, every process, and every decision framework in the admissions intelligence layer. Nexus references this document to answer any question about how the admissions intelligence works - from institutional leadership, admissions directors, enrollment managers, provosts, CFOs, presidents, and anyone interacting with the system.

---

# PART 1: THE INTELLIGENCE SYSTEM

---

## 1. What is KaNeXT Admissions Intelligence

KaNeXT Admissions Intelligence is a universal student evaluation and enrollment optimization system that produces deterministic, auditable ratings for students at every type of institution in the United States. It was built to solve a fundamental problem: student evaluation in higher education has always been fragmented, inconsistent, and impossible to compare across institutional contexts.

An admissions director reads an application and says "she's a strong candidate." A provost asks "but strong compared to what? Will she graduate? Will she pay tuition for four years? Is she in the right program?" There is no honest answer because there is no common language. The director's "strong" at a community college means something completely different than "strong" at an Ivy League school. Every evaluation lives in someone's head, filtered through their biases, their experience, and whatever applications they happened to read that day.

KaNeXT Admissions Intelligence replaces this with a system. Not a model. Not an algorithm. A complete intelligence framework that takes raw student data - transcripts, test scores, engagement records, financial profiles, advising notes - and produces a single universal number that means the same thing regardless of who computed it, when they computed it, or what institution type the student is at.

That number is the Student KR.

The system was designed on the same architecture as the KaNeXT Basketball Intelligence system, which was validated across 152+ players at 7 competitive levels with zero rank inversions. The admissions intelligence applies the same core principles - deterministic evaluation, production anchoring, KLVN normalization, component KRs, system fit, suppression detection, and downstream engines - to the domain of student admissions, enrollment, retention, and institutional revenue.

The intelligence system is not just a rating. It includes class composition analysis, yield prediction, retention intelligence, financial aid optimization, revenue modeling, transfer intelligence, pathway planning, enrollment simulation, and recruitment operations. All of these engines are downstream of the same core evaluation pipeline, meaning they all speak the same language and reference the same truth.

The intelligence lives inside the KaNeXT app through Nexus AI. Admissions directors do not read spreadsheets or navigate dashboards. They talk to Nexus. They ask questions in plain language - "evaluate this applicant," "who should we recruit," "optimize our financial aid," "which students are at risk of leaving," "what does our incoming class look like" - and Nexus references the intelligence files to produce structured, honest answers.

The core philosophy: same inputs produce the same outputs, every time. No randomness. No editorial override. No truth mutation. The system is transparent about what it knows, what it does not know, and how confident it is in every output.

### Who It Serves

The primary customers are institutional leaders:

- **Admissions Directors:** Evaluate applicants consistently, predict yield, optimize recruitment strategy
- **Enrollment Managers:** Model class composition, simulate enrollment scenarios, manage pipeline
- **Financial Aid Officers:** Optimize aid allocation for maximum yield and retention impact per dollar
- **Provosts and Deans:** Assess program health, academic quality, and class composition against targets
- **CFOs and Business Officers:** Project revenue, model tuition pricing, analyze retention ROI
- **Presidents:** Institutional health dashboard - enrollment, revenue, retention, quality, sustainability
- **Academic Advisors:** Identify at-risk students early, match students to support resources, plan pathways
- **Retention Specialists:** Early warning intelligence, intervention recommendations, effectiveness tracking

### Scale

The system is designed to work for a 400-student institution (like Lincoln University Oakland at 436 enrolled students, no FAFSA, $13,150/year tuition) just as well as it works for a state university with 40,000 students. The math scales. The legends differ by institution type, not by size. The intelligence adapts to the data available - a school with a full SIS, LMS, and advising system gets higher-confidence evaluations than a school with only transcripts, but both get honest, useful intelligence.

---

## 2. The Student KR System - Universal 0-100 Rating

Student KR is a single number on a 0-100 scale that represents a student's total evaluated quality at the time of evaluation. KR is the atomic unit of the entire admissions intelligence system. Every downstream engine - class composition, yield prediction, retention, financial aid optimization, revenue modeling, transfer intelligence, pathway planning - consumes Student KR as its primary input.

### What Student KR Measures

Student KR captures the complete student across four dimensions: academic production (AKR), professional readiness (PKR), engagement and community contribution (EKR), and growth trajectory and adaptability (IQKR). These four components are weighted differently depending on the student's program/major, because different programs demand different strengths.

Student KR does NOT measure human worth. It measures institutional fit, academic production, professional readiness, engagement quality, and growth trajectory as they relate to a student's likelihood of succeeding at and contributing to a specific institution.

### Student KR is Universal

This is the most important property of Student KR: a KR of 85 means the same thing regardless of what institution type the student is at. A KR of 85 at an Ivy is the same number as a KR of 85 at a community college. The number does not change based on institutional context.

What changes is the interpretation. Each institution type has its own legend - a lookup table that translates KR values into tier labels describing what that number means at that specific institution type. An 85 KR reads differently depending on where you look it up:

- At Elite Private (Ivy+): 85-89 = Strong Contributor. Active in 2+ organizations, solid professional preparation, will graduate on time, good career outcomes.
- At Research University (R1): 85-89 = Above Average. Active campus citizen, good professional preparation, solid retention, will graduate on time.
- At Regional State: 85-89 = Strong Student. Good engagement, solid preparation, reliable graduation path.
- At Community College: 85-89 = Above Average. Solid completion rate, some engagement, on track for transfer or workforce entry.
- At HBCU: 85-89 = Strong Contributor. Engaged in campus life, solid academic preparation, contributes to institutional culture.

One student. One KR. Multiple legend reads depending on institutional context. This is the equivalent of the basketball Level Tier Map - one of the most valuable outputs for recruitment, because it instantly tells an admissions director "this student is average at your institution but would be a star at the institution down the road."

### How Student KR Stays Universal: KLVN Lambda Normalization

The reason KR can be universal is that raw academic production data is normalized before it enters the evaluation pipeline. A 3.5 GPA at an elite prep school with grade deflation is not the same academic output as a 3.5 GPA at an open-admission community college. The rigor, the grading standards, and the peer group are all different.

KLVN (pronounced "Kelvin") is the normalization layer that adjusts production inputs so scoring is comparable across institution types. Each institution type has a lambda value, and each high school type has a lambda value, both applied to the AKR (Academic KR) component during scoring.

Lambda normalizes INPUTS during AKR scoring. It does NOT convert KR OUTPUTS. There is no "Ivy-equivalent KR." The KR is computed once, using lambda-normalized inputs. That number is final and universal.

### Lambda by Institution Type

| Institution Type | Lambda | Rationale |
|---|---|---|
| Elite Private (Ivy+) | 1.00 | Baseline. Grade deflation and extreme rigor. |
| Research University (R1) | 0.97 | Slight discount. Some grade inflation at large research universities. |
| HBCU | 0.95 | Slight discount. Variable by institution, many maintain rigorous standards. |
| Faith-Based | 0.94 | Moderate discount. Depends heavily on specific institution. |
| Regional State | 0.93 | Moderate discount. More accessible grading standards. |
| Online/Non-Traditional | 0.90 | Moderate discount. Asynchronous format and variable assessment standards. |
| Community College | 0.88 | Significant discount. Open admission means wider grade distribution. |
| Trade/Technical | 0.85 | Large discount. Competency-based assessment maps poorly to traditional GPA. |

### Lambda by High School Type

For incoming students, the high school they attended affects how to interpret their GPA:

| High School Type | Lambda | Rationale |
|---|---|---|
| Elite College Prep (Phillips Exeter, Sidwell Friends) | 1.08 | Grade deflation, extreme rigor. A 3.2 here may equal 3.8 elsewhere. |
| Competitive Public (Thomas Jefferson, Stuyvesant) | 1.05 | High rigor, competitive peer group. |
| Strong Suburban Public | 1.00 | Baseline high school rigor. |
| Average Public | 0.97 | Average rigor and grading standards. |
| Under-resourced Public | 0.94 | Fewer AP/IB offerings, larger classes, less support. |
| Alternative/Charter (Variable) | 0.95-1.02 | Depends heavily on specific school. |
| Homeschool | 0.93-1.05 | Wide range of rigor, no standardization. |
| International | 0.90-1.05 | Depends on country and school, credential evaluation needed. |

High school lambda stacks on top of institution lambda. A student from an elite prep school applying to a community college would have: AKR_final = AKR_raw * 0.88 (CC lambda) * 1.08 (HS lambda).

---

## 3. Component KRs - AKR, PKR, EKR, IQKR

Every student evaluation produces four component KRs that break down the overall rating into its constituent parts. These are the building blocks of the final KR and the most useful outputs for understanding a student's profile and planning their development.

### AKR - Academic KR

AKR measures academic production and trajectory. It is the primary component for most program types. AKR captures what the student has actually produced in the classroom - GPA, test scores, course rigor, grade trend, credit completion rate, and academic awards.

What different AKR values mean:

- AKR 95-100: Elite academic. 4.0 unweighted, high test scores, maximum course rigor, consistent performance across years. Dean's List fixture. Graduate school bound without question.
- AKR 88-94: Strong academic. 3.70+ unweighted, good test scores, substantial AP/IB work. Honors eligible. Solid graduate school candidate.
- AKR 80-87: Solid academic. 3.50+ unweighted, moderate course rigor. Will complete the program without academic difficulty. Average to above-average in the classroom.
- AKR 72-79: Average academic. 3.20-3.49 unweighted. Meets requirements but does not distinguish themselves. May need support in challenging courses.
- AKR 65-71: Below average. 3.00-3.19 unweighted. At-risk for academic probation in demanding programs. Needs academic support.
- AKR 55-64: At risk. 2.70-2.99 unweighted. Likely needs developmental coursework or intensive support.
- AKR Below 55: Critical. Below 2.70 unweighted. Significant academic intervention needed.

**AKR computation:** GPA band score + test score modifier (if available) + course rigor modifier + grade trend modifier + credit completion modifier + academic award modifier. All bounded to 0-100. KLVN normalization applied to GPA band score. Test-optional students computed without test modifier, with confidence reduced 5-10%.

### PKR - Professional KR

PKR measures professional readiness and real-world experience. It captures what the student has done outside the classroom that prepares them for career success - work experience, internships, certifications, technical skills, portfolio, entrepreneurial activity, military service.

What different PKR values mean:

- PKR 90+: Career-ready. Full-time professional experience in field, industry certifications, strong portfolio. Will be recruited by employers before graduation.
- PKR 80-89: Strong professional preparation. Completed internship in field, relevant skills, some portfolio work. Competitive for entry-level professional positions.
- PKR 70-79: Adequate professional preparation. Some work experience, developing skills. Needs additional preparation for competitive career entry.
- PKR 60-69: Limited professional experience. Part-time employment outside of field. Career preparation is a gap.
- PKR Below 60: Minimal professional readiness. No internships, limited work experience, no demonstrated technical skills.

PKR is the dominant component for trade/technical programs (50% weight) and business programs (35% weight). For STEM programs, PKR carries 25%. For education programs, only 15%.

### EKR - Engagement KR

EKR measures how actively and meaningfully a student engages with their community - campus, civic, and extracurricular. It captures effort, commitment, leadership, and community contribution that do not show up in academic or professional metrics.

What different EKR values mean:

- EKR 90+: Campus leader. Multiple organizations, leadership positions, sustained community service. Drives institutional culture. High sense of belonging.
- EKR 80-89: Strongly engaged. Active in organizations, some leadership, regular service. Visible campus presence.
- EKR 65-79: Moderately engaged. Member of an organization, some participation. Adequate campus connection.
- EKR 50-64: Minimally engaged. Attends class but limited campus involvement. At risk for social isolation.
- EKR Below 50: Disengaged. No campus involvement, declining attendance. High risk for departure.

EKR is the strongest retention predictor after financial fit. Students with high EKR rarely leave because they have social connections holding them to the institution. EKR carries the highest weight for education (35%), social work (35%), and theology/ministry (40%) programs.

### IQKR - Growth IQ

IQKR measures a student's capacity for growth, adaptation, and self-directed development. It captures the intangible cognitive and behavioral patterns that predict whether a student will improve over time or plateau - trajectory, self-advocacy, resource utilization, adaptability, and contextual adjustments for first-generation and ESL status.

What different IQKR values mean:

- IQKR 90+: High-growth student. Consistent upward trajectory, proactive help-seeking, uses every available resource, recovers from setbacks with improved performance. These students often outperform their initial KR within 2-3 semesters.
- IQKR 80-89: Good growth potential. Upward trend, uses some resources, adapts to new environments. Will improve with support.
- IQKR 65-79: Average adaptability. Flat trajectory, seeks help when prompted but not proactively. Will maintain current performance but unlikely to improve dramatically.
- IQKR 50-64: Low growth trajectory. Declining or flat despite available resources. Does not self-advocate. May need intensive structured support to avoid further decline.
- IQKR Below 50: Critical. Declining across dimensions, not responding to outreach, not using available resources. Intervention needed to stabilize.

IQKR is the hardest component to measure from data alone. Many inputs require advising notes, interview observations, or behavioral data from LMS/engagement systems. When these are unavailable, IQKR carries lower confidence and higher uncertainty.

IQKR carries the highest weight for undeclared/exploratory students (35%) because adaptability matters most when the student has not yet committed to a path. It is also elevated for online/non-traditional students because self-direction is the primary success predictor in asynchronous formats.

### How Component KRs Combine Into Final Student KR

The four component KRs combine through the Program Trait Weighting (OPF - Outcome Profile Formula). Each program type weights the components differently based on what matters most for success in that field.

| Program Type | AKR | PKR | EKR | IQKR |
|---|---|---|---|---|
| STEM | 45% | 25% | 10% | 20% |
| Business/Finance/Accounting | 30% | 35% | 15% | 20% |
| Education/Teaching | 25% | 15% | 35% | 25% |
| Nursing/Allied Health | 40% | 30% | 10% | 20% |
| Liberal Arts/Humanities | 35% | 15% | 25% | 25% |
| Fine Arts/Performing Arts | 20% | 40% | 20% | 20% |
| Trade/Technical/Vocational | 15% | 50% | 10% | 25% |
| Criminal Justice/Public Safety | 25% | 30% | 25% | 20% |
| Social Work/Human Services | 25% | 15% | 35% | 25% |
| Theology/Ministry | 25% | 10% | 40% | 25% |
| Undeclared/Exploratory | 30% | 15% | 20% | 35% |

Final Student KR = (AKR * OPF_akr) + (PKR * OPF_pkr) + (EKR * OPF_ekr) + (IQKR * OPF_iqkr)

If a student changes their major, their KR is recomputed with the new OPF. This may change their KR. The same student with AKR 72, PKR 88, EKR 65, IQKR 78 produces KR 75 in a STEM program but KR 82 in a Business program because Business weights PKR higher.

Graduate students use the same program OPF categories but with PKR shifted +10% and AKR and EKR each shifted -5%, reflecting the expectation that graduate students bring professional experience.

---

## 4. The Evaluation Pipeline - How Student KR is Computed

The student evaluation engine is the core of the intelligence system. It takes raw data about a student and produces a KR through a deterministic pipeline. The pipeline has two blocks: Base Truth (who the student is regardless of institution) and Institutional Context (how the student fits within a specific institution's environment).

### The Evaluation Protocol

**Step 1: Institutional Context.** Set the institution type, accreditation, degree levels, Title IV status, delivery mode, and enrollment size band. This binds all downstream computation - which KLVN lambda to use, which legend to reference, which System Fit parameters apply.

**Step 2: Data Tier Detection.** The system auto-detects how much data is available: Tier 1 (self-reported only, 25-40% confidence), Tier 2 (application materials, 35-50%), Tier 3 (official transcript + test scores, 55-80%), Tier 4 (full transcript + engagement + advising + interview, 80-95%). This determines which component inputs produce scores vs return UNSCORED.

**Step 3: Phase 3 - Production Anchor.** This is the primary KR determinant. Read the Institution Legend at the school's type. Map the student's full academic and engagement profile against the legend tier descriptions. Find the tier whose profile description matches. That tier's KR range IS the anchor. Write it down before doing anything else.

Example: A student with a 3.8 weighted GPA, 1350 SAT, 6 AP courses, strong extracurriculars, and leadership roles at a Regional State University maps to the 85-89 tier based on the profile description. The anchor is 85-89.

**Step 4: Phase 6 - Component KRs.** Score the four component KRs from the data: AKR, PKR, EKR, IQKR. Each component is on the same 0-100 scale. These tell you WHERE the student is strong and weak. The Phase 6 output tells the DIRECTION within the anchor range - whether the student sits at the top, middle, or bottom of their tier.

**Step 5: Phase 6 adjusts within Phase 3 +/- 5.** The final KR must fall within the Phase 3 anchor range expanded by 5 in either direction. If Phase 3 anchor is 85-89, Phase 6 can push the final KR anywhere from 80 to 94. If Phase 6 produces 79, something is wrong with the component scoring, not the anchor.

**Step 6: Suppression check.** If the student has documented suppression factors (working 30+ hours, caretaker responsibilities, food insecurity, ESL, first-generation), flag them. Suppression does NOT change the KR - it adds context about what the KR might be if suppression were removed.

**Step 7: System Fit.** Compute fit between the student's profile and the institution's learning environment. Learning style fit, campus culture fit, academic support fit, financial fit. System Fit % is separate from KR.

**Step 8: Confidence gate.** Score confidence based on data completeness. Full transcript + test scores + engagement data + interview + multi-semester trend = 85-95%. GPA only = 40-55%. Self-reported only = 25-40%.

**Step 9: Final output.** Final Student KR, component KRs, legend tier label, suppression flags with estimated ceiling, system fit %, confidence %, badges, retention risk flags.

### The Five Anchoring Rules

These rules apply to ALL evaluations. They prevent the most common evaluation errors.

**Rule 1: Anchor against academic profile numbers, not prestige labels.** The GPA, test scores, course rigor, and completion rate determine the tier. Awards confirm placement - they do not determine it. A student who was "valedictorian" with a 3.5 GPA and no test scores is not automatically 95+ because of the title.

**Rule 2: Awards are confirmation, not input.** National Merit Scholar, AP Scholar, Honor Roll - these confirm you are in the right tier. They do not push into a higher tier if the underlying numbers do not support it.

**Rule 3: High school prestige does not inflate KR.** Attending Phillips Exeter or a top magnet school is a KLVN input, not a KR input. It adjusts how we interpret GPA (normalization), not the KR itself.

**Rule 4: Legacy and connections are invisible to KR.** The system evaluates academic production, professional readiness, engagement, and growth potential. Nothing else. A legacy applicant with a 2.8 GPA is still a 2.8 GPA student.

**Rule 5: Read the numbers first. Check labels second.** Find the tier where the production numbers match. Then verify the label makes sense. If the numbers say 75-79 but the student has a compelling essay, the numbers win. The essay informs IQKR, not the anchor.

**The core principle: The legend anchor is truth. The math is confirmation. Not the other way around.**

---

## 5. Suppression Detection

Suppression detection is MORE IMPORTANT in admissions intelligence than in sports intelligence because socioeconomic factors suppress academic performance more pervasively and more severely than physical limitations suppress athletic performance. A student working 35 hours per week at a gas station while taking 15 credits and caring for a younger sibling is operating under suppression that is invisible in a GPA number.

### What Suppression Is

Suppression identifies factors that systematically reduce a student's observable academic production below their actual cognitive ability and growth potential. Suppression does NOT change the KR. It provides context that informs downstream decisions: financial aid allocation, support service referrals, retention intervention, and advising strategy.

### The Six Suppression Types

**Work Suppression:** Student employed 20+ hours/week during academic terms.
- Moderate (20-29 hours): 0.2-0.4 GPA suppression
- Severe (30-39 hours): 0.4-0.7 GPA suppression
- Extreme (40+ hours): 0.6-1.0 GPA suppression

**Family Suppression:** Caretaker responsibilities or significant family obligations.
- Moderate (part-time caretaker): 0.1-0.3 GPA suppression
- Severe (primary caretaker): 0.3-0.6 GPA suppression
- Extreme (single parent, no support): 0.5-0.8 GPA suppression

**Health Suppression:** Documented physical or mental health conditions.
- Moderate (managed chronic condition): 0.1-0.3 GPA suppression
- Severe (active crisis or unmanaged condition): 0.3-0.6 GPA suppression
- Extreme (hospitalization, extended treatment): 0.5-1.0 GPA suppression

**Environmental Suppression:** Food insecurity, housing instability, transportation barriers.
- Food insecurity: 0.2-0.5 GPA suppression
- Housing instability: 0.3-0.7 GPA suppression
- Transportation barriers: 0.1-0.4 GPA suppression

**Language Suppression:** Primary language is not English at an English-medium institution.
- Mild (conversationally fluent, academic writing below speaking): 0.1-0.3 GPA suppression
- Moderate (functional English, struggles with academic vocabulary): 0.3-0.5 GPA suppression
- Severe (limited proficiency, taking ESL concurrently): 0.5-0.8 GPA suppression

**First-Generation Suppression:** First in family to attend college.
- Mild (attended college-prep HS or had strong mentorship): 0.0-0.2 GPA suppression
- Moderate (average HS, limited guidance): 0.2-0.4 GPA suppression
- Severe (under-resourced school, no mentorship, family does not understand college): 0.3-0.6 GPA suppression

### Suppression Rules

1. Suppression is documented, never assumed. If there is no data, it is not flagged.
2. Suppression does NOT change the computed KR. It adds an estimated ceiling and contextual flags.
3. Multiple types are additive but capped at 1.5 GPA points total.
4. Estimates are always presented as ranges, not exact numbers.
5. Suppression informs downstream engines: financial aid should prioritize high-suppression students (they are undervalued), retention should target them (they are at elevated risk), advising should address specific factors (connect to food pantry, adjust work-study, provide childcare resources).
6. The suppression ceiling is a projection: "If suppression factors were removed, KR would likely land in the [X-Y] range."

### Why Suppression Matters for Admissions

A student with KR 72 and severe work suppression (35 hours/week employment) with an estimated ceiling of 79-84 is a fundamentally different investment than a student with KR 72 and no suppression. The first student is underperforming relative to ability and will likely improve if the suppression is addressed (through work-study, aid increase, or schedule adjustment). The second student is performing at their level.

Financial aid optimization should favor the suppressed student because the marginal return on investment is higher: $3,000 in additional aid that allows the first student to reduce work hours from 35 to 15 could produce a 5-10 point KR increase and dramatically improve retention probability. The same $3,000 given to the unsuppressed student produces no KR change and minimal retention impact.

This is the single most powerful insight the admissions intelligence provides: it identifies students who are better than their numbers suggest, and it quantifies how much better they would be if the barriers were removed.

---

## 6. System Fit

System Fit measures how well a student matches the specific learning environment, culture, and support structure of the institution they are at or applying to. It is separate from Student KR - a high-KR student can be a poor fit and a moderate-KR student can be an excellent fit.

System Fit is the single strongest predictor of retention outside of financial stability. A student who fits the institution's culture, learning style, and support model is dramatically more likely to persist.

### The Four Fit Dimensions

**Learning Style Fit (25% weight):** Does the student perform well in the institution's primary instructional mode? A strong lecture student may struggle in a project-based program. A self-directed student thrives online but may flounder in a structured cohort model.

**Campus Culture Fit (20% weight):** Does the student match the institution's setting, size, and culture? Urban vs rural, large vs small, residential vs commuter, faith-based vs secular. A commuter student assigned to a residential campus with no commuter support structure has a culture fit gap.

**Academic Support Fit (20% weight):** Does the student's self-direction level match the institution's support model? High-support environments (mandatory advising, structured schedules, intensive tutoring) work best for students with lower IQKR. Independent environments work best for high-IQKR students who seek help proactively.

**Financial Fit (35% weight):** Can the student afford this institution without excessive, unsustainable debt? This is the single most predictive retention variable.

| Financial Coverage | Score |
|---|---|
| Full coverage (scholarships + family + savings cover all costs) | 95-100 |
| Minimal gap (less than $2,000/year unmet need) | 85-94 |
| Moderate gap ($2,000-$8,000/year) | 70-84 |
| Significant gap ($8,000-$15,000/year) | 50-69 |
| Large gap ($15,000+/year) | 25-49 |
| Extreme gap (no realistic financial plan) | 0-24 |

Financial fit gets the highest weight because financial barriers are the number one reason students leave.

**System Fit Computation:**
System_Fit_Pct = (Learning_Fit * 0.25) + (Culture_Fit * 0.20) + (Support_Fit * 0.20) + (Financial_Fit * 0.35)

A student with KR 90 and Financial Fit 30 is at higher retention risk than a student with KR 70 and Financial Fit 95.

---

## 7. Badges

Badges certify specific student attributes or achievements not fully captured by the four component KRs. They are binary - the student qualifies or does not. Unlike basketball badges, student badges do not modify KR. They are descriptive labels that add context for admissions decisions, retention intervention, and advising.

### Badge Library (12 Badges)

**First Generation:** First in immediate family to attend a four-year college. Signals resilience and self-direction.

**Working Student:** Employed 20+ hours/week during academic terms. Triggers work suppression flag.

**Veteran:** Completed active military service. Strong PKR signal, triggers specific VA support routing.

**Multilingual:** Fluent in 2+ languages. Cognitive flexibility indicator, may indicate language suppression.

**Community Leader:** Significant leadership position in a community organization outside of school.

**Entrepreneur:** Founded and operated a business, nonprofit, or significant project with documented impact.

**Overcomer:** Documented significant life obstacle overcome - homelessness, foster care, serious illness, family crisis, refugee experience. Strong IQKR signal for resilience.

**Dean's List:** Achieved Dean's List standing for 2+ semesters. Confirms sustained academic excellence.

**Perfect Attendance:** Zero unexcused absences for a full academic year. Strong EKR signal.

**Transfer Success:** Transferred institutions and maintained or improved GPA. Strong IQKR signal for adaptability.

**Peer Mentor:** Served as official peer mentor or tutor for 1+ semesters. EKR and IQKR signal.

**Research Participant:** Participated in faculty-led or independent research with documented output. AKR and PKR signal.

---

## 8. Retention Risk Flags

Retention Risk Flags identify specific conditions that predict a student leaving before completing their program. Unlike suppression (which contextualizes current performance), retention flags predict FUTURE behavior - the likelihood that a student will not return next semester.

### Eight Risk Flags

**Financial Strain (30 points):** Unpaid balance, aid gap exceeding $3,000, payment plan delinquency, expressed financial hardship. The number one cause of attrition.

**Academic Probation (25 points):** GPA below institutional good standing threshold (typically 2.0) for one or more semesters.

**Registration Gap (25 points):** Not registered for upcoming semester despite eligibility. The single strongest predictor of attrition at the semester boundary.

**Engagement Drop (20 points):** Measurable decline in attendance (15%+), LMS activity (50%+ reduction), missed advising appointments (2+ consecutive), dropped organizations.

**Life Event (20 points):** Documented family crisis, health emergency, housing loss, legal issue, or other acute disruption.

**Transfer Intent (15 points):** Expressed interest in transferring, browsing competitor programs, transcript request to another institution, not registering despite eligibility.

**Social Isolation (10 points):** Not a member of any campus organization, no documented peer connections, commuter with no on-campus presence outside class.

**Credit Velocity Decline (10 points):** Completing fewer credits per semester than historical average, falling behind pace for on-time graduation.

### Risk Tiers

| Total Score | Tier | Response Timeline |
|---|---|---|
| 50+ | Critical | Intervention within 48 hours |
| 35-49 | High | Intervention this week |
| 20-34 | Moderate | Check-in within 2 weeks |
| 10-19 | Low-Moderate | Standard advising cycle |
| 0-9 | Low | On track |

Flags are additive. Financial Strain (30) + Engagement Drop (20) = 50 = Critical, even though neither flag alone triggers Critical.

---

# PART 2: INSTITUTION TYPES AND THE LEGEND SYSTEM

---

## 9. The Legend System

Legends are lookup tables that translate KR values into tier labels describing what that number means at a specific institution type. Every institution type has its own legend. Legends are display-only - they do not produce or modify KR values. They interpret them.

### How Legends Work

Each legend contains tiers from 95-100 down to below 60, each defined by a KR range and a detailed description of what a student at that tier looks like in terms of academic profile, engagement, professional readiness, retention probability, and institutional contribution. When evaluating a student, you read the legend at the target institution type to find the tier whose description matches the student's actual profile. That tier's KR range becomes the Phase 3 anchor.

### Eight Institution Types

**Elite Private (Ivy+, Stanford, MIT, Caltech, Duke):** The most selective institutions. KR 95-100 here means a 4.0 unweighted, 1550+ SAT, 10+ AP/IB, national-level achievement, near-certain to graduate with honors. KR 80-84 means a "Solid Admit" - 3.50-3.69 unweighted, 1350-1399 SAT, adequate but not distinguished. Below KR 70 is not competitive at this institution type.

**Research University (R1 - Large State Flagships):** Selective but larger, more variance in student quality. KR 95-100 is the Honors Program Star - full-ride candidate, graduate school bound. KR 80-84 is the Average Admit. KR 70-74 is Conditional Admit territory.

**Regional State University:** Moderate selectivity, wider distribution. KR 95-100 is the Institutional Star who chose this school by choice. KR 80-84 is Average. KR 70-74 is At Risk.

**HBCU (Historically Black Colleges and Universities):** Mission-driven, culturally specific. Cultural fit (EKR) carries additional weight. Greek life, band/marching arts, and cultural organizations are high-impact engagement channels. First-generation prevalence is high, making suppression detection critical. KR 95-100 is the Legacy Builder. KR 75-79 is the Growing Student who responds well to HBCU community structure.

**Faith-Based Institution:** Mission alignment is a stronger retention predictor here than at secular schools. A student with moderate AKR but high mission alignment may have better retention outcomes than a high-AKR student with no faith engagement. Theology/Ministry programs weight EKR at 40%.

**Community College:** Open admission. The legend describes quality within the enrolled population, not selectivity. Suppression factors are pervasive - the majority of CC students work, many are parents, many are first-generation. Stop-out (temporary departure with intent to return) is more common than permanent dropout. KR 95-100 is the Transfer Star on track for competitive 4-year institution.

**Trade/Technical School:** PKR dominates (50% OPF weight). GPA may not exist in the traditional sense. Employment placement rate is the primary outcome metric, not graduation rate. KR 95-100 means employer-ready before graduation.

**Online/Non-Traditional:** IQKR is the strongest retention predictor. Self-direction and time management matter more than raw academic ability. Engagement is measured differently: LMS activity, discussion quality, assignment submission timeliness. Completion rate is the primary institutional metric.

---

## 10. Institution-Specific Context Notes

### Community College Context

Community colleges represent the most complex evaluation context because the student population is the most diverse and the most suppressed. Key considerations:

- Open admission means no selectivity filter. The entire range of student quality is present.
- Transfer intent vs workforce intent changes the evaluation frame entirely.
- Average student age is higher. Many are working adults, parents, career changers.
- Stop-out patterns mean that a student who disappears for a semester may return.
- Course completion rate matters more than GPA at many CCs because the primary barrier is completion, not quality.
- Suppression is the baseline, not the exception. The system must assume suppression is present and look for evidence confirming it rather than look for evidence that it exists.

### HBCU Context

HBCUs serve a unique population with specific cultural dynamics that affect evaluation and retention:

- Many HBCUs are test-optional. Test score bands apply only when scores are submitted.
- Greek organizations are a primary engagement and retention mechanism. A student's Greek involvement can be the single strongest predictor of persistence.
- First-generation students represent a larger share of HBCU enrollment than the national average.
- The HBCU "family" effect - smaller campuses with close faculty relationships - acts as an informal retention mechanism that is difficult to quantify but powerful.

### Faith-Based Context

Faith-based institutions have a retention advantage that secular institutions do not: mission alignment creates community bonds that hold students even through academic or financial difficulty. The system must account for this:

- Chapel attendance, missions participation, and ministry leadership are engagement signals specific to this context.
- Students who are engaged in the faith community but struggling academically may have higher retention probability than students with strong academics but no faith engagement.
- The institution's mission is a filter that self-selects for cultural fit, which simplifies the System Fit computation.

### Small Institution Context (Under 1,000 Students)

Small institutions like Lincoln University Oakland (436 students) have specific dynamics:

- Every student matters disproportionately. Losing 20 students at a 40,000-student school is a rounding error. Losing 20 students at a 436-student school is a 4.6% enrollment decline with significant revenue impact.
- Data is thinner. Smaller cohorts make statistical modeling less reliable. The system increases confidence ranges for small-N analysis.
- Relationships are stronger. Faculty and staff know students by name. This creates informal early warning systems that supplement the formal retention engine.
- Financial vulnerability is higher. Small schools have less reserve and less room for enrollment miss. The revenue engine must account for this fragility.

---

# PART 3: CLASS INTELLIGENCE

---

## 11. Class KR

Class KR is the aggregate quality measure for a cohort of students, analogous to Team KR in basketball. It is the enrollment-weighted sum of individual Student KRs within a defined group.

### Computation

Raw_Class_KR = SUM(Student_KR_i * Student_Weight_i) for all students in cohort

Students are weighted by credit load: full-time overload (15+ credits) = 1.10, standard full-time (12-14) = 1.00, three-quarter (9-11) = 0.75, half-time (6-8) = 0.50, less than half-time = 0.25. All weights normalized to sum to 1.0.

Component Class KRs (Class_AKR, Class_PKR, Class_EKR, Class_IQKR) are computed the same way - enrollment-weighted averages of individual component KRs.

### Class KR Tiers

| Class KR | Label | Description |
|---|---|---|
| 90-100 | Elite Class | Across-the-board excellence. Exceptional graduation rates, strong outcomes. Rare outside elite privates and honors programs. |
| 85-89 | Strong Class | Above-average quality. Some gaps but overall strong. Good graduation rate projected. |
| 80-84 | Solid Class | Meets expectations. Adequate quality, reasonable retention, revenue achievable. |
| 75-79 | Average Class | Meets minimum standards but has gaps. Needs attention but not crisis. |
| 70-74 | Below Average | Noticeable quality gaps. Revenue targets may not be met. |
| 65-69 | Weak Class | Significant quality concerns. Institutional strategy conversation needed. |
| Below 65 | Critical | Below sustainability threshold. Enrollment crisis likely. |

### Expected Class KR by Institution Type

| Institution Type | Expected Range |
|---|---|
| Elite Private | 88-96 |
| Research University (R1) | 82-90 |
| Regional State | 74-82 |
| HBCU | 72-82 |
| Faith-Based | 74-84 |
| Community College | 60-72 |
| Trade/Technical | 65-78 |
| Online/Non-Traditional | 62-75 |

A Class KR of 78 means very different things at different institution types. At an Ivy it would be a crisis. At a Regional State it is average. At a Community College it is strong.

### Class Diagnostics

The system produces seven diagnostic categories for any class:

1. **Academic Distribution:** Students binned by KR tier. Shows whether the class is top-heavy, bottom-heavy, or even.
2. **Program Distribution:** Enrollment per program vs capacity. Identifies underenrolled and overenrolled programs.
3. **Geographic Distribution:** Where students come from. Identifies concentration risk.
4. **Financial Aid Distribution:** Aid categories, discount rate, net revenue per student.
5. **Retention Risk Distribution:** Students in each risk tier. Projects attrition.
6. **System Fit Distribution:** How well the class matches the institution.
7. **Suppression Prevalence:** How much of the class is operating under documented suppression.

---

## 12. Composition Analysis

Composition Analysis evaluates whether the class meets institutional strategic goals. It compares actual enrollment against targets across five dimensions:

**Academic Composition:** Distribution of KR tiers vs institutional target (e.g., "we want 15% at KR 90+, 40% at 80-89, 30% at 70-79, 15% below 70").

**Program Composition:** Per-program enrollment vs target. Identifies underenrolled programs (revenue risk, may need recruitment), overenrolled programs (resource strain), and program deserts (may need sun-setting).

**Diversity Composition:** Demographic distribution for federal reporting and mission alignment. The system reports actuals vs targets but does NOT optimize for demographics in KR computation. Demographics never modify a student's KR.

**Financial Composition:** Net tuition revenue vs target, discount rate vs target, full-pay vs aided ratio.

**Geographic Composition:** Geographic diversity and concentration risk.

---

## 13. Revenue Projection

### Lifetime Student Value (LSV)

LSV is the total expected revenue from a student over their enrollment lifecycle:

LSV = SUM over each semester: [(Tuition - Aid) + Fees + Room/Board + Auxiliary] * Retention_Probability

Retention probability declines each semester based on the student's risk tier:

| Risk Tier | Year 1 Retention | Year 2 | Year 3 | Year 4 Graduation |
|---|---|---|---|---|
| Low | 95% | 90% | 87% | 80% |
| Low-Moderate | 88% | 82% | 77% | 68% |
| Moderate | 78% | 70% | 63% | 52% |
| High | 65% | 52% | 42% | 30% |
| Critical | 50% | 35% | 25% | 15% |

### Three-Scenario Revenue Model

**Best Case:** All students persist to graduation. Theoretical maximum.
**Expected Case:** Historical retention rates applied per risk tier. Most likely outcome.
**Worst Case:** Retention rates 10 points below historical. Downside scenario.

Revenue at Risk = Expected - Worst. This quantifies the financial value of retention investment.

---

# PART 4: FINANCIAL AID INTELLIGENCE

---

## 14. Financial Aid Optimization

Financial aid optimization allocates the institution's aid budget to maximize the combined outcome of yield (for prospects) and retention (for enrolled students) subject to budget constraints.

### The Core Optimization

Maximize: SUM(Yield_Probability * Enrollment_Value) + SUM(Retention_Probability * Continuation_Value)

Subject to: Total_Aid <= Budget

### Yield Sensitivity

How much does enrollment probability change per $1,000 of additional aid?

| Student Profile | Yield Sensitivity per $1K |
|---|---|
| High need, high fit, high KR | +8-12% yield probability |
| High need, high fit, moderate KR | +6-10% |
| Low need, high fit | +1-3% |
| High need, low fit | +3-6% |
| Low need, low fit | +0-2% |

Students with high financial need and high System Fit are the highest-leverage yield investments. They want to come but cannot afford it.

### Retention Sensitivity

How much does persistence probability change per $1,000 of additional aid?

| Student Profile | Retention Sensitivity per $1K |
|---|---|
| Financial Strain flag + otherwise engaged | +10-15% retention probability |
| Financial Strain flag + disengaged | +5-8% |
| No Financial Strain + engaged | +0-2% |
| No Financial Strain + disengaged | +0-1% |

Aid has the highest retention impact on students whose PRIMARY barrier is financial. If the student is disengaged for non-financial reasons, additional aid has minimal retention effect.

### Constraint Handling

The optimizer respects: total budget ceiling, merit vs need split requirements, endowed scholarship restrictions, federal/state compliance (Title IV), minimum meaningful award thresholds ($1,000 minimum to impact behavior), diversity targets, and program-specific allocations.

### Tuition Discount Rate

Discount Rate = Total Institutional Aid / Total Gross Tuition

The system computes the current rate, trend, breakeven rate, and per-segment analysis. The optimal discount rate maximizes TOTAL net revenue (net revenue per student times number of students). Lower discount rate means higher per-student revenue but lower yield. Higher discount rate means lower per-student revenue but higher yield.

---

# PART 5: RETENTION INTELLIGENCE

---

## 15. Early Warning System

The Retention Engine monitors four signal categories at defined intervals to catch problems before students have decided to leave.

### Academic Signals (After Every Grading Period)
- GPA decline of 0.3+ triggers flag
- Midterm D or F in any course
- Course withdrawal (W grade)
- Credit completion rate below 85%
- Academic probation status change

### Financial Signals (Monthly)
- Balance due increase
- Payment plan delinquency
- Financial aid change (reduced, lost eligibility)
- FAFSA non-renewal
- External scholarship loss

### Engagement Signals (Bi-Weekly)
- Attendance drop 15%+ from previous period
- LMS login frequency decline 50%+
- Missed advising appointments (2+ consecutive)
- Organization dropout
- Campus event attendance drops to zero

### Administrative Signals (Registration Milestones)
- Non-registration for upcoming term within window
- Transcript request to another institution
- Housing cancellation
- Meal plan cancellation
- Parking pass non-renewal

### Escalation

| Risk Tier | Response | Who Is Notified |
|---|---|---|
| Critical (50+) | Within 48 hours | Advisor + Dean + Financial Aid |
| High (35-49) | This week | Advisor + relevant support office |
| Moderate (20-34) | Within 2 weeks | Advisor |
| Low-Moderate (10-19) | Standard cycle | Advisor at next meeting |
| Low (0-9) | No action needed | None |

### Intervention Windows

- **Pre-registration:** 4-6 weeks before registration opens
- **Early semester:** First 3 weeks of classes
- **Midterm:** After midterm grades post
- **Financial deadlines:** 2-4 weeks before payment deadlines
- **End of semester:** Last 3 weeks

### Retention ROI

Per-Student ROI = (LSV_if_retained - LSV_if_lost) / Cost_of_intervention

Example: Student has $52,000 remaining LSV. Intervention costs $3,000. At 60% success rate, expected ROI = ($52,000 * 0.60) / $3,000 = 10.4x return. A $200,000 retention program that keeps 40 students (average $45,000 remaining LSV) generates $1.8M in retained revenue.

---

## 16. Intervention Matching

The engine matches intervention type to risk flag type with specific, actionable recommendations assigned to a responsible party.

### Financial Interventions
Balance due: payment plan setup. Aid gap: emergency aid, external scholarship search, work-study. FAFSA non-renewal: completion assistance. Scholarship loss: replacement search, appeal guidance.

### Academic Interventions
GPA decline: tutoring referral, study skills workshop, course load review. Midterm D/F: faculty outreach, supplemental instruction. Academic probation: mandatory advising, reduced load, support contract.

### Engagement Interventions
Attendance drop: outreach, root cause exploration. LMS decline: faculty awareness, technology check. Organization dropout: peer mentor outreach, alternatives. Social isolation: peer mentor assignment, study group facilitation.

### Life Event Interventions
Family crisis: counseling referral, academic accommodation, emergency support. Health emergency: medical leave, incomplete coordination, return plan. Housing loss: emergency housing, referral. Legal issue: legal resources, accommodation.

---

# PART 6: SIMULATION AND SCENARIO MODELING

---

## 17. Enrollment Simulation Engine

The Simulation Engine projects outcomes under different scenarios. It answers: "If we change X, what happens to enrollment, revenue, retention, and class quality?"

### Seven Scenario Types

**1. Admit Volume Adjustment:** "What happens if we admit more or fewer students?" Projects impact on class size, Class KR, revenue, retention, and discount rate.

**2. Financial Aid Reallocation:** "What happens if we redistribute aid?" Six pre-built sub-scenarios: Merit Shift (move budget between merit and need), Top-Load (concentrate on strongest admits), Spread Thin (distribute evenly for volume), Program Target (extra aid to fill a specific program), Retention Reinvestment (redirect to enrolled at-risk students), Discount Rate Target (find allocation that achieves specific discount rate).

**3. Tuition Pricing Adjustment:** "What happens if we change tuition?" Models price elasticity by student segment. High-KR students with multiple admits are most price-sensitive (elasticity -1.2 to -1.5). Aided high-need students are less sensitive IF aid adjusts.

**4. Class Composition Targeting:** "What admit decisions achieve our target composition?" Identifies gaps and models actions to close them: waitlist admits, aid increases, recruitment outreach.

**5. Retention Intervention Simulation:** "What is the projected impact of a specific intervention?" Models emergency aid effectiveness (35-55% for financially strained), tutoring (20-35% academic improvement), peer mentoring (15-30% first-year retention improvement), advising caseload reduction (10-20%), food pantry (25-40% for environmentally suppressed).

**6. Program Launch/Closure:** Models enrollment ramp-up, revenue vs cost, breakeven timing, impact on class composition. For closure: teach-out timeline, student reallocation, cost savings.

**7. Enrollment Shock:** Models external disruptions: demographic cliff (WICHE projections), competitor entry, economic recession, regulatory change (Title IV loss), facilities loss.

### Simulation Confidence

Every projection includes confidence range, key assumptions, and sensitivity analysis.

| Scenario Type | Typical Confidence |
|---|---|
| Aid Reallocation (current admits) | 65-80% |
| Admit Volume (current waitlist) | 55-75% |
| Retention Intervention (current students) | 55-70% |
| Tuition Pricing | 50-70% |
| Class Composition Targeting | 45-65% |
| Program Launch/Closure | 35-55% |
| Enrollment Shock | 25-50% |

The engine projects. It never recommends. Humans decide.

---

# PART 7: RECRUITMENT AND ENROLLMENT OPERATIONS

---

## 18. Application Review Protocol

The Application Review Protocol standardizes how applications are evaluated using the Student KR framework. It does NOT make admission decisions. It produces intelligence that informs decisions.

### Phase 1: Triage

| Category | Criteria | Track |
|---|---|---|
| Express Admit | KR above auto-admit threshold, complete application, no flags | Fast-track (1 reviewer) |
| Standard Review | KR in normal range, complete application | Standard (2 reviewers) |
| Holistic Review | KR below threshold but suppression flags or compelling qualitative factors | Committee (3+ reviewers) |
| Incomplete | Missing materials | Hold with outreach |
| Ineligible | Does not meet absolute minimums | Deny with explanation |

### Phase 2: Structured Review

Each reviewer completes an 8-section template mapping directly to component KRs: Academic Assessment (AKR), Professional Assessment (PKR), Engagement Assessment (EKR), Growth Assessment (IQKR), Suppression Flags, System Fit Assessment, Qualitative Factors, and Reviewer Recommendation.

When two reviewers produce KR estimates differing by 8+ points, the application is flagged for calibration discussion.

### Phase 3: Decision Framework

The admission decision integrates Student KR, System Fit, institutional need, and enrollment targets. The decision matrix is a guide:

| Student KR | Fit 75%+ | Fit 50-74% | Fit Below 50% |
|---|---|---|---|
| 85+ | Admit | Admit (flag fit concern) | Admit with counseling |
| 75-84 | Admit | Admit if target not met | Waitlist or counsel elsewhere |
| 65-74 | Admit if holistic strong | Waitlist | Deny or redirect |
| Below 65 | Holistic required | Deny with compassion | Deny |

Institutions adjust thresholds based on selectivity level, enrollment needs, program-specific capacity, and mission alignment.

### Waitlist Priority

Waitlist_Priority = (KR * 0.40) + (System_Fit * 0.25) + (Yield_Probability * 0.20) + (Net_Revenue * 0.15)

### Deny with Dignity

For denied applicants, the system generates redirect recommendations: suggesting better-fitting institution types, noting suppression ceilings that indicate the student would thrive with more support, and identifying when fit (not quality) is the issue.

---

## 19. Enrollment Operations - Five-Phase Flow

### Phase 1: Recruitment Intelligence

Generated during the recruitment cycle. Pipeline summary (inquiries through enrolled, with conversion rates), pipeline health assessment, prospect quality distribution, geographic heat map, competitive intelligence (which schools are co-admits), and recruitment action plan (top 20 high-value prospects, segment messaging, event calendar, communication cadence).

### Phase 2: Yield Intelligence

Generated after admission decisions release. Yield projection dashboard by segment, high-risk high-value admits (high KR but low yield probability - the students you most want but are most likely to lose), melt risk analysis (deposited students who may not show up), week-by-week yield intervention calendar, and aid adjustment recommendations.

### Phase 3: Orientation and Registration Intelligence

Generated during orientation. New student risk dashboard, advising load optimization (high-risk students to experienced advisors), per-student course registration guidance, and support service pre-matching (connecting at-risk students to resources before the semester starts).

### Phase 4: Early Semester Intelligence (Weeks 1-4)

The highest-risk period for new student attrition. Engagement heatmap (all new students by engagement level across dimensions), no-show list (enrolled but not attending - immediate outreach), early warning escalations, financial clearance report, early academic alerts, and prioritized advisor action queue.

### Phase 5: End-of-Term Intelligence

Generated after first-term grades. Prediction accuracy audit (compare pre-enrollment KR estimates to actual performance), retention forecast update (how many are registered for next term), suppression validation (did suppression factors play out as expected), intervention effectiveness audit (which interventions worked), next-term strategy packet, and cohort KR update (recompute KR with actual institutional data).

The End-of-Term packet creates a feedback loop: what we predicted vs what actually happened calibrates the system for future cohorts.

---

## 20. Recruitment Confidence Gates

### Data Tiers

| Tier | Definition | Confidence Range |
|---|---|---|
| T1 - Inquiry Only | Name and contact, maybe self-reported GPA | 15-30% |
| T2 - Application Received | Self-reported data, essay, recommendations | 30-45% |
| T3 - Complete Application | Official transcript, test scores, activities verified | 55-75% |
| T4 - Complete + Engagement | T3 plus campus visit, interview, demonstrated interest | 70-88% |
| T5 - Enrolled Student | Full institutional data: registrar, LMS, advising, financial | 80-95% |

Confidence increases as data depth increases. A T1 evaluation is a rough estimate. A T5 evaluation is the full truth.

---

# PART 8: TRANSFER AND PATHWAY INTELLIGENCE

---

## 21. Transfer Intelligence

Transfer Intelligence manages two-directional student movement: students transferring IN (recruitment opportunity) and students transferring OUT (retention loss).

### Outgoing Transfer Risk

Strong signals (high confidence): transcript request to another institution, stated transfer intent, non-registration despite eligibility, housing cancellation mid-year.

Moderate signals: declining engagement, GPA capable of higher-tier institution (underplaced student), satisfaction decline, browsing competitors.

The system generates targeted retention plans for students at transfer risk 35+. Critically, it includes an honest assessment: if the student would genuinely be better served at another institution, the system acknowledges this rather than retaining at all costs.

### Incoming Transfer Evaluation

Transfer students are evaluated using the same Student KR pipeline with additional factors: credit transferability (how many credits actually transfer), time-to-degree impact (does the transfer add semesters), program fit at the new institution, and financial fit.

Credit transfer rates vary widely: same institution type (80-100%), CC to 4-year with articulation (70-90%), CC to 4-year without agreement (50-80%), international (30-70% pending credential evaluation).

### Net Transfer Impact

For each potential transfer, compute the impact on Class KR, program composition, and revenue. Compare incoming transfer gains to outgoing transfer losses. Generate a recruitment targeting profile based on institutional gaps.

---

## 22. Pathway Intelligence

Pathway Intelligence projects what happens after the student completes their program. It connects current student performance to career outcomes, graduate school readiness, and workforce placement.

### Career Pathways by Program

Each program has a pathway map: typical career placements, entry salary ranges, KR thresholds for competitive placement, and key PKR requirements. Example: Business Administration maps to management trainee, sales, analyst, and small business roles at $40K-$55K entry salary requiring KR 75+ with internship experience.

### Individual Pathway Projection

Per-student: pathway fit score (how well current profile matches target pathway requirements), gap analysis (what is missing - internships, certifications, GPA threshold, portfolio), and semester-by-semester development plan prioritized by impact and urgency.

### Institutional Pathway Effectiveness

Across all students: placement rate by program, salary outcomes vs peers, pathway completion rate (what % of students who declared a target pathway achieved it), and bottleneck analysis (where are the institutional barriers).

### Alumni Pipeline

Connect current students to alumni through mentor matching. Track employer pipeline relationships. Correlate pathway satisfaction with alumni giving (students who achieve their target pathway are more likely to become donors).

---

# PART 9: GOVERNANCE AND DATA INTEGRITY

---

## 23. Governance Rules

These rules apply to every mode, every engine, every output in the system.

1. **Deterministic:** Same inputs produce same outputs. No randomness, no editorial override.
2. **Auditable:** Every step logged with inputs, outputs, confidence, and timestamps.
3. **No truth mutation:** Downstream engines NEVER modify upstream outputs. Student KR, Class KR, component KRs, and suppression flags are computed once and consumed downstream. They are never altered by yield prediction, retention modeling, financial aid optimization, or any other downstream process.
4. **Confidence transparency:** Every output includes confidence %. The system is transparent about uncertainty.
5. **No data fabrication:** If data is missing, the component is UNSCORED. The system never guesses.
6. **Legend is display-only:** Legend labels interpret KR values. They do not produce or modify them.
7. **KLVN normalization:** All cross-institution comparisons use KLVN lambdas.
8. **Suppression is context, not override:** Suppression flags add interpretive context. They never change the computed KR.
9. **Financial privacy:** Financial data is visible only to authorized roles. Student-facing outputs never expose other students' financial information.
10. **FERPA compliance:** All student data handling complies with FERPA.
11. **Human decision final:** The system produces intelligence. Humans make admission decisions, yield interventions, support assignments, and financial aid allocations. The system never admits, denies, or withdraws a student.

---

## 24. Data Gathering Protocol

Before any mode runs, Nexus gathers data following a defined sequence.

**Step 1 - Record Lookup:** Search student records by name or ID. Pull academic history, test scores, enrollment status, financial aid, engagement data, program/major, retention flags. Check enrichment timestamp. If enriched within 30 days, use existing data.

**Step 2 - Academic Verification:** Cross-reference transcript against registrar, financial aid against bursar, enrollment against SIS, attendance and engagement against LMS, advising notes from advising system.

**Step 3 - External Context (Prospective Students Only):** High school profile data, test score verification, extracurricular verification, recommendation letter themes, application essay quality indicators.

**Step 4 - Respond:** Use all gathered data to answer the question. Format depends on request type.

**Step 5 - Enrichment Writeback:** Flag corrections or new data for record update. Never overwrite registrar data. Only enrich metadata. Timestamp every enrichment.

### Enrichment Rules

- Never overwrite SIS data (official GPA, credits, enrollment status)
- Only enrich metadata: verified test scores, engagement metrics, advising notes, employment status, financial aid changes
- If external data contradicts institutional data, flag discrepancy, do not silently change
- Enrichment is additive - never delete existing data, only add or update

---

## 25. Mode Routing - What To Do For Each Request

| Request Type | Mode | Primary Files |
|---|---|---|
| "Evaluate this applicant" / "What's this student's KR?" | Mode 1: Prospect Evaluation | 01 (Process), 02 (Reference) |
| "Analyze the incoming class" / "Class profile" | Mode 2: Class Composition | 03 (Class Intelligence) |
| "Who will enroll?" / "Predict yield" | Mode 3: Yield Prediction | 03, 02 |
| "Who's at risk?" / "Retention analysis" | Mode 4: Retention Intelligence | 06 (Downstream), 02 |
| "Optimize financial aid" / "Scholarship allocation" | Mode 5: Financial Aid Optimization | 03, 06 |
| "Revenue projection" / "Student lifetime value" | Mode 6: Revenue Modeling | 06, 03 |
| "Transfer students" / "Who's likely to leave?" | Mode 7: Transfer Intelligence | 06, 02 |
| "Career readiness" / "Pathway planning" | Mode 8: Pathway Intelligence | 06, 02 |
| "What if we admit more students?" / "Simulate enrollment" | Simulation | 04 (Simulation) |
| "Evaluate this application" / "Review applicant pool" | Recruitment Ops | 05 (Recruitment Ops) |
| "Yield interventions" / "Orientation planning" | Enrollment Ops | 05 |

---

## 26. Contextual Mode

When a student cannot be evaluated through the full pipeline because data is insufficient (application materials only, self-reported GPA, no transcript), Contextual Mode produces an honest KR range estimate with explicit uncertainty.

Contextual Mode answers: given everything available, what KR range is defensible?

**Output format:** "Estimated KR: [low]-[high] at [Institution Type]. Confidence: [X]%."

Plus: "What We Know" (scored components), "What We Don't Know" (unscored components), "What Would Narrow the Estimate" (specific data that would increase confidence).

When full pipeline data arrives, Contextual Mode output is SUPERSEDED entirely. It is not averaged or blended with the full evaluation.

---

# PART 10: THE STUDENT SUCCESS ENGINE

---

## 27. Student Success - Five Outputs

The Student Success Engine takes everything the system knows about a student and translates it into actionable intelligence. It answers five questions:

### Output A: Student Truth Summary - "Where Are You Now?"
Complete snapshot: KR, component KRs, strengths, gaps, suppression, badges, system fit, retention risk. In plain language, not numbers.

### Output B: Academic Path Optimization - "Where Should You Be?"
Program fit analysis (would a different major produce a higher KR?), course load optimization (how many credits should you take given your risk profile and work hours?), graduation path projection (when will you graduate at current pace?).

### Output C: Gap Analysis - "What Are the Gaps?"
For each component KR, specific inputs dragging the score down with exact targets. "AKR is 68. GPA is 2.85 (band score 58). To reach AKR 75, need GPA 3.10 (+0.25). Reversing grade decline would add +3. Priority: reverse grade decline."

### Output D: Development Plan - "What's the Path?"
Semester-by-semester action plan prioritized by: retention risk flags (highest urgency), lowest component KR (biggest lift), addressable suppression factors, system fit gaps, pathway goals.

### Output E: Resource Matching - "What Support Do You Need?"
Match the student to specific institutional resources based on their profile. Financial strain maps to emergency aid and payment plan. Academic difficulty maps to tutoring and supplemental instruction. Engagement gap maps to organizations and peer mentors. Resource matching uses the institution's actual available resources - if a resource does not exist, the system does not recommend it.

---

# APPENDIX A: FIRST-GENERATION AND SOCIOECONOMIC ADJUSTMENTS

First-generation and socioeconomic adjustments are KLVN-level inputs that contextualize production, not bonuses for demographics.

**First-Generation:**
- Both parents no college degree: IQKR +5, flag for suppression detection
- One parent some college (no degree): IQKR +3, flag
- Sibling attended college: IQKR +2
- Not first-gen: no adjustment

**Socioeconomic:**
- Working 30+ hours/week: AKR +3, flag for work suppression
- Working 20-29 hours/week: AKR +2, flag
- Documented food or housing insecurity: AKR +3, IQKR +3, flag for environmental suppression
- Primary caretaker: AKR +2, EKR +2, flag for family suppression

---

# APPENDIX B: AKR SCORING BANDS AND MODIFIERS

### GPA Bands (Pre-KLVN)
| GPA | AKR Band |
|---|---|
| 3.90-4.00 | 95-100 |
| 3.70-3.89 | 88-94 |
| 3.50-3.69 | 80-87 |
| 3.20-3.49 | 72-79 |
| 3.00-3.19 | 65-71 |
| 2.70-2.99 | 55-64 |
| 2.50-2.69 | 45-54 |
| 2.00-2.49 | 30-44 |
| Below 2.00 | 0-29 |

### Test Score Modifiers
| SAT | ACT | Modifier |
|---|---|---|
| 1500-1600 | 34-36 | +8 to +12 |
| 1400-1499 | 32-33 | +5 to +8 |
| 1300-1399 | 29-31 | +3 to +5 |
| 1200-1299 | 26-28 | +1 to +3 |
| 1100-1199 | 23-25 | 0 |
| 1000-1099 | 20-22 | -1 to -3 |
| Below 1000 | Below 20 | -3 to -8 |

### Course Rigor Modifiers
8+ AP/IB: +4 to +6. 5-7: +2 to +4. 3-4: +1 to +2. 1-2: 0 to +1. Honors only: 0. Standard only: -1 to -2. Below level: -3 to -5.

### Grade Trend Modifiers
Strong upward: +3 to +5. Moderate upward: +1 to +3. Flat: 0. Moderate decline: -1 to -3. Strong decline: -3 to -5.

### Completion Rate Modifiers
100%: +2. 95-99%: +1. 90-94%: 0. 85-89%: -1. 80-84%: -2. 70-79%: -3 to -5. Below 70%: -5 to -10.

### Academic Award Modifiers
National recognition: +3 to +5. Dean's List 3+ semesters: +2 to +3. Departmental honors: +1 to +2. Single Dean's List: +1. None: 0.

AKR = GPA_Band + Test_Modifier + Rigor_Modifier + Trend_Modifier + Completion_Modifier + Award_Modifier. Bounded to [0, 100].

---

# APPENDIX C: CONFIDENCE GATE RANGES

| Data Available | Confidence % |
|---|---|
| Self-reported data only | 25-40% |
| Application materials only | 35-50% |
| GPA only (official transcript) | 40-55% |
| GPA + test scores | 55-70% |
| GPA + test scores + course-level data | 65-78% |
| Full transcript + test scores + engagement | 75-85% |
| Full transcript + test scores + engagement + advising | 80-90% |
| Full transcript + test scores + engagement + advising + interview + multi-semester trend | 85-95% |

---

# APPENDIX D: INTERVENTION EFFECTIVENESS ESTIMATES (PROVISIONAL)

| Intervention | Estimated Effectiveness | Notes |
|---|---|---|
| Emergency financial aid ($500-$2,000) | 35-55% of financially strained retained | Small grants have outsized impact |
| Academic tutoring (1:1) | 20-35% improvement in at-risk outcomes | Conditional on student engagement |
| Peer mentoring (structured) | 15-30% first-year retention improvement | Strongest for first-gen and isolated |
| Advising caseload reduction (500:1 to 300:1) | 10-20% retention improvement | Depends on quality, not just quantity |
| Food pantry / basic needs | 25-40% for environmentally suppressed | Addresses fundamental barrier |
| Mental health counseling | 15-25% for health-suppressed | Conditional on availability |
| Course load adjustment (to 12 credits) | 20-35% for overloaded | Extends time-to-degree |

These are cross-institutional averages. Calibrate against institutional data when available.

---

# APPENDIX E: PRICE ELASTICITY DEFAULTS (PROVISIONAL)

| Student Segment | Elasticity | Interpretation |
|---|---|---|
| Full-pay, high KR, multiple admits | -1.2 to -1.5 | 10% tuition increase loses 12-15% of segment |
| Full-pay, moderate KR, few alternatives | -0.5 to -0.8 | Moderately sensitive |
| Aided, high need, high KR | -0.3 to -0.6 | Less sensitive IF aid adjusts |
| Aided, high need, moderate KR | -0.2 to -0.4 | Limited alternatives |
| In-state at public institution | -0.4 to -0.7 | CC alternative always available |
| Out-of-state at public institution | -1.0 to -1.4 | Many alternative states |
| Online/non-traditional | -0.8 to -1.2 | Competitive market |
| Graduate/professional | -0.3 to -0.6 | Credential value outweighs price |

---

# END OF DOCUMENT

---

## Document Statistics

- **Total sections:** 27 main sections plus 5 appendices
- **Parts:** 10
- **Covers:** Student evaluation, class composition, yield prediction, retention intelligence, financial aid optimization, revenue modeling, transfer intelligence, pathway planning, enrollment simulation (7 scenario types), recruitment operations (5-phase enrollment lifecycle), 8 institution types, 4 component KRs (AKR, PKR, EKR, IQKR), 11 program OPF weights, KLVN normalization (institution + high school + first-gen + socioeconomic), System Fit (4 dimensions), 6 suppression types, 12 badges, 8 retention risk flags, confidence gates, governance rules, and data gathering protocol
- **Version:** 1.0
- **Date:** March 2026
- **Source files:** SKILL.md v1 (File 07), Files 01-06 (Admissions Eval Process, Admissions Eval Reference, Admissions Class Intelligence, Admissions Simulation Engine, Admissions Recruitment Ops, Admissions Downstream Engines)
- **Architecture:** Mirrors KaNeXT Basketball Intelligence (KR, KLVN, legends, system fit, component KRs, Phase 3 anchor, Phase 6 adjustment, suppression detection, downstream engines) with domain-appropriate content for US higher education
- **Scale:** Designed to work for 400-student institutions (Lincoln University Oakland) through 40,000-student state universities
- **For use by:** Nexus AI (internal reference), institutional leadership, admissions directors, enrollment managers, financial aid officers, provosts, CFOs, presidents, academic advisors, retention specialists, and anyone asking about KaNeXT Admissions Intelligence
