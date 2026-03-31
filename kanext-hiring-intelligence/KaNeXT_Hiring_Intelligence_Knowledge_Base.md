# KaNeXT Hiring Intelligence - Complete Knowledge Base

## Version 1.0 - March 2026

This is the comprehensive reference document for the KaNeXT Hiring Intelligence system. It covers every concept, every metric, every process, and every decision framework in the hiring intelligence layer. Nexus references this document to answer any question about how the hiring intelligence works - from investors, HR leadership, department heads, athletic directors, and anyone interacting with the system.

---

# PART 1: THE INTELLIGENCE SYSTEM

---

## 1. What is KaNeXT Hiring Intelligence

KaNeXT Hiring Intelligence is a universal candidate and employee evaluation system that produces deterministic, auditable ratings for every person KaNeXT considers hiring or currently employs across the entire institutional operation. It was built to solve a fundamental problem: hiring has always been subjective, fragmented, and impossible to compare across roles.

A department head interviews a candidate and says "she's great." The CEO asks "but how great? Is she better than the other finalist? Will she actually perform in our environment?" There is no honest answer because there is no common language. The department head's "great" might mean "strong communicator" while the CEO needs "can operate with zero infrastructure in a startup institution." Every evaluation lives in someone's head, filtered through their biases, their experience, and whatever interview they happened to conduct.

KaNeXT Hiring Intelligence replaces this with a system. Not a personality test. Not a keyword-matching algorithm. A complete intelligence framework that takes raw candidate data - resume, career record, interviews, references, work product - and produces a single universal number that means the same thing regardless of who computed it, when they computed it, or what role the candidate is being evaluated for.

That number is the Candidate KR.

The system was designed by a founder who built a basketball intelligence system validated across 152+ players at 7 teams with zero rank inversions, then applied the same architecture - KR, KLVN normalization, legends, system fit, component KRs, Phase 3 anchoring, Phase 6 adjustment, suppression detection, confidence gates - to human capital evaluation. The same principles that make basketball evaluation honest make hiring evaluation honest: anchor against production (career record), not labels (where they went to school); detect suppression (great people trapped in bad organizations); and always show confidence (how much should you trust this rating given the data available).

The hiring intelligence system is not just a candidate rating. It includes team composition analysis, candidate comparison modeling, structured interview operations, compensation intelligence, development planning, retention monitoring, and succession planning. All of these engines are downstream of the same core evaluation pipeline, meaning they all speak the same language and reference the same truth.

The intelligence lives inside the KaNeXT app through Nexus AI. Department heads, coaches, and HR staff do not read spreadsheets or navigate dashboards. They talk to Nexus. They ask questions in plain language - "evaluate this candidate," "who should we hire," "what should we pay," "who is at risk of leaving," "who replaces our CFO if she leaves" - and Nexus references the intelligence files to produce structured, honest answers.

The core philosophy: same inputs produce the same outputs, every time. No randomness. No editorial override. No truth mutation. The system is transparent about what it knows, what it does not know, and how confident it is in every output.

### Why This Matters for KaNeXT

KaNeXT is hiring hundreds of people in Year 1. Coaching staff across up to 13 sports at up to 4 levels each. Faculty across academic departments. Admissions staff to drive enrollment. Campus operations to run a 52-acre campus. Technology to build and maintain the OS. Executive leadership to run the institution. Every one of these hires either strengthens or weakens the institution. Bad hires at an established university are painful but survivable. Bad hires at a startup institution building from near-zero are potentially fatal.

The Hiring Intelligence system ensures that every hire is evaluated against the same standard, every department's talent quality is measured and tracked, every gap is identified before it becomes a crisis, and every coaching hire is cross-referenced against the sports intelligence system to ensure system identity coherence across the athletic pipeline.

The same intelligence architecture that ensures KaNeXT never misjudges a basketball player also ensures KaNeXT never misjudges a hire.

---

## 2. The Candidate KR System - Universal 0-100 Rating

Candidate KR is a single number on a 0-100 scale that represents a candidate's total evaluated quality for a specific role at the time of evaluation. KR is the atomic unit of the entire hiring intelligence system. Every downstream engine - team composition, candidate comparison, retention monitoring, succession planning - consumes Candidate KR as its primary input.

### What Candidate KR Measures

Candidate KR captures the complete professional: competency, leadership, institutional fit, and growth trajectory, weighted by role type. A C-Suite executive's KR weights leadership heavily (35%) because executives are hired to lead, not execute. A technology engineer's KR weights competency heavily (45%) because technical skill is the non-negotiable foundation.

Candidate KR is not years of experience. It is not where they went to school. It is not how impressive their resume looks. KR is a composite of four component KR scores, weighted by role type, adjusted for system fit, checked for suppression, and validated against confidence gates. The number reflects everything the candidate brings to the role.

### How Candidate KR is Computed

The Candidate KR is computed through four component KRs:

**CKR - Competency KR:** Technical skills for the role, domain expertise, relevant experience depth, education and credentials, demonstrated results, and industry knowledge. This measures whether the candidate can DO the job.

**LKR - Leadership KR:** Management experience, team building track record, decision-making quality, communication skills, conflict resolution, strategic thinking, and ability to operate under constraint. This measures whether the candidate can LEAD within the job.

**FKR - Fit KR:** Alignment with KaNeXT institutional values (Christian identity, excellence, innovation, accountability), alignment with department culture, alignment with direct manager's operating style, geographic willingness, and compensation expectations alignment. This measures whether the candidate BELONGS in this environment.

**GKR - Growth KR:** Learning velocity, adaptability, career trajectory (ascending, plateaued, or descending), coachability, self-awareness, and ambition level relative to role scope. This measures whether the candidate will IMPROVE over time.

These four components combine through role-type-specific weights to produce the final Candidate KR.

### Component KR Weights by Role Type

The weights shift because different roles demand different capability mixes:

C-Suite/Executive: CKR 25%, LKR 35%, FKR 25%, GKR 15%. Executives are hired to lead. Leadership is the dominant factor.

Head Coach: CKR 30%, LKR 25%, FKR 25%, GKR 20%. Coaching knowledge is non-negotiable, but leadership and institutional fit are nearly equal because culture building and alignment define long-term success.

Assistant Coach: CKR 35%, LKR 15%, FKR 25%, GKR 25%. Skill development and recruiting are paramount. Growth trajectory matters more because you are developing future head coaches.

Faculty (tenure-track): CKR 45%, LKR 15%, FKR 20%, GKR 20%. Academic credentials and research output are gatekeeping requirements.

Faculty (adjunct): CKR 50%, LKR 10%, FKR 25%, GKR 15%. Teaching competency dominates. Institutional fit matters for adjuncts who interact heavily with students.

Admissions/Enrollment: CKR 30%, LKR 20%, FKR 30%, GKR 20%. Enrollment staff ARE the institutional brand to prospective students. Fit is critical.

Campus Operations: CKR 35%, LKR 20%, FKR 30%, GKR 15%. Operations requires both technical competency and cultural integration.

Technology/Engineering: CKR 45%, LKR 15%, FKR 20%, GKR 20%. Technical skill is the floor. Growth trajectory matters because technology evolves constantly.

Administrative/Support: CKR 30%, LKR 15%, FKR 35%, GKR 20%. Support roles require deep cultural integration and are the most visible daily touchpoints for students and families.

### What Different KR Ranges Mean

To give a sense of scale using the C-Suite legend as the reference:

- 95-100: Transformational Leader. Has led institutional transformation at scale. Built or rebuilt organizations from the ground up. National or industry-wide reputation. Think university president who doubled enrollment and endowment.
- 90-94: Elite Operator. Deep institutional experience at the VP/SVP/C-level. Strong decision-making under pressure. Builds high-performing teams. Proven fundraiser or revenue driver.
- 85-89: Strong Executive. Solid executive track record. Has led a department or division successfully. Good strategic thinker. May lack experience at the current scale but has demonstrated the judgment and work ethic to grow into it.
- 80-84: Capable Leader. Experienced manager ready for executive step-up. Strong operational skills. Would benefit from mentorship.
- 75-79: Developing Executive. Mid-career professional with leadership potential. Not ready for C-suite without 2-3 years of development.
- 70-74: Functional Expert. Deep domain expertise but limited executive presence. Not C-suite ready.
- Below 70: Does not meet minimum threshold for executive consideration.

Different role types have their own legends with role-appropriate descriptions at each KR range. A KR of 85 for a Head Coach means something different than a KR of 85 for a Technology Engineer, just as a KR of 85 in basketball means something different at D1 High-Major than at NAIA. The number is universal, but the legend interprets it in context.

---

## 3. The Evaluation Pipeline - How a Candidate Gets Rated

The candidate evaluation engine takes raw data about a person and produces a Candidate KR through a deterministic pipeline. The pipeline mirrors the basketball intelligence system exactly, with domain-appropriate content at each step.

### The V1 Evaluation Protocol

Most initial candidate evaluations use public data - resume, LinkedIn, and web-searchable career information. This is the V1 data tier. The V1 protocol has five steps, executed in strict order.

**Step 1: Hiring Context.** Set the role title, role type, department, institution, reporting line, and criticality tier. This binds all downstream computation - which component KR weights to use, which role type legend to reference, which KLVN lambdas to apply.

**Step 2: Phase 3 - Production Anchor.** This is the primary KR determinant. Read the Role Type Legend for the target role. Map the candidate's full career production - responsibilities, results, scope, trajectory - against the legend tier descriptions. Find the tier whose description matches the candidate's actual career record. That tier's KR range IS the anchor.

Example: A candidate who served as VP of Enrollment at a comparable institution, grew enrollment 25% over three years, built a 12-person team from scratch, and implemented a CRM-driven funnel optimization process maps to the 90-94 tier on the Admissions legend. The anchor is 90-94. Write it down before doing anything else.

**Step 3: Phase 6 - Component KRs.** Score the four component KRs from the data: CKR (competency), LKR (leadership), FKR (fit), and GKR (growth). Each component is on the same 0-100 scale. These tell you WHERE the candidate is strong and weak. The Phase 6 output tells the DIRECTION within the anchor range.

At V1, many component dimensions cannot be scored reliably. FKR requires conversation to assess culture fit. LKR sub-dimensions like conflict resolution require behavioral evidence. GKR sub-dimensions like coachability require interview observation. Proxy confidence weights handle this by blending scored dimensions with estimated bounds.

**Step 4: Phase 6 Adjusts Within Phase 3 +/- 10.** The final KR must fall within the Phase 3 anchor range expanded by 10 in either direction. If Phase 3 anchor is 90-94, Phase 6 can push the final KR anywhere from 80 to 100. If Phase 6 produces 79, something is wrong with the component scoring, not the anchor. The component KRs NEVER override the production anchor.

**Step 5: Final KR.** The adjusted number is the V1 Candidate KR. Output includes the final KR, KR range, confidence percentage, Phase 3 anchor (for transparency), Phase 6 raw (for transparency), component KRs, system fit score, suppression assessment, risk flags, and role type legend tier label.

### The Anchoring Rules

These rules apply to ALL evaluations and prevent the most common hiring errors.

**Rule 1: Anchor against career production, not pedigree labels.** The career record - responsibilities, results, scope, trajectory - determines the tier. School name, company brand, and network connections confirm a tier placement. They do not determine it. A candidate from a no-name company who grew revenue 300% anchors higher than a candidate from Google who maintained a stable team.

**Rule 2: Awards and titles are confirmation, not input.** "VP of Engineering" confirms you are in an executive tier. It does not push you into a higher tier if the actual scope of responsibility was a 3-person team.

**Rule 3: Pedigree does not inflate current KR.** Harvard MBA, McKinsey alumni, Fortune 500 experience - these set context. They do NOT inflate present-tense capability assessment. Rate what the candidate CAN DO, not where they have been.

**Rule 4: Team success does not inflate individual KR.** A mid-level manager at a company that went public is still a mid-level manager. A department head who personally drove a turnaround at a struggling company gets credit for the turnaround, not just for being there.

**Rule 5: Read the career record first. Check labels second.** Find the tier where the actual results match. Then read the label to confirm it makes sense. If the career record says 85-89 but you feel like the candidate "deserves" 90+ because of their school or their network, the career record wins.

**The core principle: The production anchor is truth. The component math is confirmation. Not the other way around.**

### Data Tier Progression

As data quality improves through the hiring process, the balance of authority shifts from Phase 3 (production anchor) to Phase 6 (component math):

V1 (resume plus public record): 16-21 dimensions scorable. Phase 3 is primary - anchors the range. Phase 6 is secondary - adjusts within range. Confidence: 25-55%.

V2 (resume plus interviews plus references): All four components scorable with moderate to high confidence. Phase 3 and Phase 6 share authority. Confidence: 55-82%.

V3 (full loop plus work product plus on-site plus deep references): All components scored at full depth. Phase 6 drives the KR. Phase 3 is a sanity check. Confidence: 78-95%.

At V3, with all components scored from rich data, the math drives everything and the legend is just a sanity check. At V1, with limited data, the production anchor does most of the work and the math adjusts within the anchor's range. This is identical to the basketball system where V1 box-score evaluations rely on the legend anchor while V3 PlayVision evaluations rely on the trait math.

---

## 4. Component KRs - CKR, LKR, FKR, GKR

Every candidate evaluation produces four component KRs that break down the overall rating into its constituent parts. These are the building blocks of the final KR and the most useful outputs for understanding a candidate's professional identity.

### CKR - Competency KR

CKR measures total technical and domain capability for the specific role being evaluated.

What different CKR values look like:

- CKR 90-100: Elite domain expert. Top of field. Published, recognized, or demonstrated at the highest level. Results that materially moved organizations. For a coach, this means proven system mastery, elite recruiting network, and consistent player development to the next level.
- CKR 80-89: Strong expert. Deep domain knowledge with clear demonstrated results. Could lead a function at this level.
- CKR 70-79: Solid practitioner. Competent across core requirements. Some gaps in depth or breadth but functional.
- CKR 60-69: Developing. Meets minimum requirements. Gaps in either experience or demonstrated results.
- CKR 50-59: Below threshold. Significant gaps. Would require substantial investment.
- Below 50: Does not meet minimum qualifications.

For coaching candidates, CKR is enhanced with four additional sub-scores: Coaching Philosophy Alignment, System Identity, Recruiting Network Value, and Player Development Track Record. These are critical because a coach's competency is not just basketball knowledge - it is the ability to install a system, recruit talent into that system, and develop that talent within it.

### LKR - Leadership KR

LKR measures leadership capability, management capacity, and organizational influence.

What different LKR values look like:

- LKR 90-100: Organizational leader. Can run an institution. Builds culture, develops leaders, makes bet-the-company decisions correctly. Rare.
- LKR 80-89: Strong leader. Can run a department or major function. Develops people. Navigates complexity. Trusted to operate autonomously.
- LKR 70-79: Effective manager. Runs a team well. Communicates clearly. Makes good decisions within defined scope.
- LKR 60-69: Developing leader. Can manage a small team with oversight. Decision-making inconsistent under pressure.
- LKR 50-59: Individual contributor. Leadership is aspirational, not demonstrated.
- Below 50: No leadership evidence. Not a disqualifier for individual contributor roles.

Key insight: LKR is the hardest component to assess at V1 because leadership is demonstrated in action, not on paper. A resume can list "managed 12 direct reports" but cannot tell you whether those 12 people thrived or left. LKR confidence jumps dramatically from V1 to V2 because behavioral interviews and references specifically targeting leadership are the richest data sources.

### FKR - Fit KR

FKR measures alignment with the KaNeXT institutional operating environment and culture.

FKR is not a personality test. It is a structural assessment of five dimensions:

**Operating Style Fit:** Does this person thrive in startup environments or established institutions? KaNeXT in Year 1 is a startup building an institution. People who need clear process, defined roles, and stable environments will struggle. People who thrive in ambiguity, wear multiple hats, and build from scratch will excel.

**Faith Alignment:** Can this person operate comfortably within a Christian institutional framework? This is not a religious test. It assesses comfort and alignment, not belief. The question is whether the candidate can operate within a culture that includes prayer, chapel, and Christian values without friction. A score below 60 is a hard block on hiring regardless of other scores.

**Autonomy Level:** Can this person operate with high autonomy and minimal supervision? Year 1 has no deep management layer. People must self-direct, self-prioritize, and deliver without handholding. A score below 50 is a hard block for Year 1 hires.

**Pressure Tolerance:** Can this person perform under the intensity of building an institution from near-zero? The pace is relentless. Deadlines are aggressive. Resources are constrained. People who have only worked in stable, low-pressure environments will struggle. A score below 50 is a hard block for Year 1 hires.

**Multi-Role Flexibility:** Is this person willing and able to operate outside their strict job description? Year 1 requires everyone to do everything. The CFO helps move furniture. The admissions director staffs game-day operations. The head coach recruits, fundraises, and speaks at chapel.

System Fit Composite = (Operating Style x 0.25) + (Faith Alignment x 0.20) + (Autonomy x 0.25) + (Pressure Tolerance x 0.15) + (Multi-Role Flexibility x 0.15)

### GKR - Growth KR

GKR measures trajectory, learning capacity, and development ceiling.

What different GKR values look like:

- GKR 90-100: Exceptional trajectory. Rapid ascent. Multiple successful transitions. Learns anything fast. Will outgrow most roles quickly.
- GKR 80-89: Strong growth. Clear upward trajectory. Adapts well. Coachable. 2-3 year runway before needing larger scope.
- GKR 70-79: Steady growth. Improving but at a normal pace. Will develop within role.
- GKR 60-69: Plateauing. Growth has slowed. May be at their level. Some roles need stability, not growth.
- GKR 50-59: Stagnant. No evidence of growth in recent years.
- Below 50: Declining. Career trajectory is downward.

Key insight: GKR is the basketball equivalent of a player's development ceiling. A KR 75 player with GKR 92 may be more valuable than a KR 82 player with GKR 65 because the first player's ceiling is dramatically higher. The same logic applies in hiring: a developing candidate with an exceptional growth trajectory may outperform a steady veteran within 12-18 months.

---

## 5. KLVN Normalization - Cross-Context Fairness

KLVN exists in the hiring system for the same reason it exists in basketball: to ensure that achievements are comparable across different environments. A Director-level achievement at a Fortune 500 company and a Director-level achievement at a 10-person startup are different accomplishments in different contexts. KLVN normalizes the environment so the candidate's underlying capability is assessed fairly.

### Three Lambda Dimensions

**Lambda by Previous Employer Tier:** Ranges from 0.85 (Fortune 100 / Global Institution, where individual contribution is hard to isolate from institutional momentum) to 1.25 (Solo / Freelance / Volunteer, where producing results with zero organizational support is the strongest signal of individual capability). The midpoint is 1.00 for mid-market and regional institutions.

**Lambda by Career Stage:** Ranges from 1.15 (entry-level, where early-career achievements carry extra weight because they happened with minimal experience) to 0.90 (late career, where 25 years of experience should produce larger results than 10 years).

**Lambda by Industry Transition:** Ranges from 1.00 (same industry, same role type - direct comparison) to 1.20 (different industry, different role type - maximum amplification for career changers demonstrating transferable capability).

**Composite Lambda** = Employer Lambda x Career Stage Lambda x Industry Transition Lambda. Applied to CKR inputs during competency scoring. NOT applied to LKR, FKR, or GKR because those are assessed independently of employer context.

### The Lincoln University Pattern

The most important KLVN application in hiring mirrors the most important application in basketball. In basketball, a player averaging 20/8/5 at USCAA (lambda 0.583) has their production normalized upward because producing those numbers against weaker competition with zero resources is a different achievement than producing them at D1 HM with full scholarships and facilities.

In hiring, the same principle applies. A coach at a USCAA program with zero scholarships, a $5K recruiting budget, and no dedicated gym who wins conference championships and places players at D2/NAIA programs is performing at a level that the raw "USCAA conference champion" label dramatically understates. KLVN amplifies this coach's CKR inputs by the employer tier lambda (1.20 for under-resourced programs) to capture the true underlying capability.

This is the core of KaNeXT's institutional thesis: talent is universally distributed but opportunity is not. KLVN ensures the hiring system sees through the opportunity gap to the talent underneath.

---

## 6. Suppression Detection - Finding Hidden Talent

### Why Suppression Detection is Mandatory

KaNeXT's entire institutional thesis is that environment suppresses talent. The basketball intelligence system identifies players whose production was suppressed by bad teams, limited roles, or insufficient resources. The hiring intelligence system does the same for people.

Every candidate evaluation MUST assess whether the candidate's career record was suppressed by factors outside their control. A suppressed candidate with a raw KR of 72 and evidence of environment suppression may project to 80-87 in a functional environment. Missing this means missing the best hires available - people who are undervalued by every other employer because they are trapped in bad situations.

### Four Types of Suppression

**Environment Suppression:** A great candidate was at a bad organization. Their results were suppressed by dysfunction, not their ability. Indicators include organizational layoffs, leadership turnover, budget cuts, and toxic culture. The strongest signal is achieving notable results DESPITE the dysfunction. A basketball assistant coach at a program with no recruiting budget and a toxic head coach who drives players away may have "only" placed 3 players in 5 years - but given the environment, that is exceptional.

Typical uplift: +5 to +15 KR points.

**Role Suppression:** The candidate was underutilized in their previous role. An assistant who should have been a head coach. A senior engineer doing junior work. A department head doing administrative tasks. The strongest signal is references saying "they were the best person on the team but never got the title." This is the Lincoln University pattern - the person is performing two levels above their position.

Typical uplift: +5 to +10 KR points.

**Resource Suppression:** The candidate produced results with no budget, no staff, and no infrastructure. Their output was constrained by resources, not capability. One person doing the work of three. Growing enrollment without marketing spend. Building systems by hand that larger organizations automate. This is the strongest suppression signal because it isolates individual capability from organizational support most cleanly.

Typical uplift: +8 to +15 KR points.

**Bias Suppression:** The candidate was overlooked due to age, gender, race, pedigree, or school name. Career history shows consistent underpromotion relative to results. Comparable peers advanced faster. This is the hardest to quantify but the most important for KaNeXT's mission.

Typical uplift: +3 to +10 KR points.

### Suppression Rules

Suppression types stack. A candidate can have environment + resource + bias suppression simultaneously. Maximum total uplift is +20 KR points. Suppression must be evidenced, not assumed. The raw Candidate KR is always reported first. The Suppression-Adjusted KR Range is the secondary output with reduced confidence.

---

# PART 2: ROLE TYPE LEGENDS

---

## 7. The Legend System

Role Type Legends define what a given KR range means for each role category. They are the hiring equivalent of basketball KR legends by competitive level. A KR of 85 means something different for a C-Suite executive than for an adjunct instructor, just as it means something different at D1 High-Major than at NAIA.

Legends are display-only. They interpret KR. They do not produce KR.

### Nine Role Type Legends

The system maintains nine role type legends:

1. C-Suite/Executive (described in Section 2)
2. Head Coach
3. Assistant Coach
4. Faculty (tenure-track)
5. Faculty (adjunct/instructor)
6. Admissions/Enrollment Staff
7. Campus Operations Staff
8. Technology/Engineering
9. Administrative/Support

Each legend contains tier descriptions with KR ranges, role language, scope markers, and outcome anchors. When evaluating a candidate, the evaluator reads the legend for the target role type and finds the tier whose description matches the candidate's actual career production. That tier's KR range becomes the Phase 3 anchor.

### Head Coach Legend Highlights

The Head Coach legend deserves special attention because KaNeXT is hiring coaches across up to 13 sports at up to 4 levels each. At full scale, this is 52+ teams with 150-200+ coaching positions.

- KR 95-100 (Program Builder): Has built or rebuilt a program from the ground up and sustained success. National championship contender at their level. Recruits at the highest level. Player development pipeline produces next-level athletes consistently. System identity is clear, transferable, and effective. Culture is self-sustaining. Zero compliance issues.
- KR 90-94 (Elite Coach): Consistent winner. Conference contender every year. Strong recruiting network with national reach. Develops players to the next level regularly. Assistants get promoted from their staff.
- KR 85-89 (Strong Coach): Winning record. Has elevated a program measurably. System identity is coherent and adaptive. Recruiting network is solid regionally. May lack a signature achievement but trajectory is clearly upward.
- KR 80-84 (Capable Coach): Solid record. Holds a program steady or makes incremental improvements. Recruiting is adequate.
- KR 75-79 (Developing Coach): Has had some success but inconsistent. May be a strong assistant stepping into a HC role.
- KR 70-74 (Unproven Coach): Limited HC experience. May be a career assistant with clear readiness signals but no opportunity yet. This is a suppression candidate.
- Below 70: Not HC ready. May be an excellent assistant.

### Technology Legend Highlights

The Technology legend is calibrated against the Miami tech market, not the education market. KaNeXT competes for engineers against tech companies, not against other universities.

- KR 95-100 (Principal/Distinguished or CTO-Level): Architected systems at scale. Deep expertise across multiple domains. Can make technology strategy decisions for an institution.
- KR 90-94 (Senior Staff / Tech Lead): Deep expertise. Has led technical projects end-to-end. Can design systems, not just build them.
- KR 85-89 (Senior Engineer): Productive, reliable, high-quality. Can own major features or subsystems.
- KR 80-84 (Mid-Level Engineer): Solid developer. Ships features. Needs architectural guidance on complex problems.
- KR 75-79 (Junior Engineer): Early-career. Can build features with guidance.
- KR 70-74 (Entry-Level): Trained but untested in production.

---

# PART 3: THE COACHING STAFF MODULE

---

## 8. Why Coaching Hires Get Special Treatment

Coaching staff evaluation is the deepest section of the Hiring Intelligence system for two reasons. First, the volume: up to 200+ coaching hires across 13 sports and 4 levels. Second, the stakes: coaching hires directly determine athletic performance, which drives enrollment, media content, revenue, and institutional visibility. A bad coaching hire at a startup institution is not just a bad hire - it collapses an entire sport's pipeline.

### Cross-Reference with Sports Intelligence

Every coaching hire MUST be evaluated against the relevant sports intelligence system. This is non-negotiable.

For basketball coaching candidates: The basketball intelligence system defines 12 offensive systems (Spread Pick-and-Roll, 5-Out Motion, Motion/Read and React, Pace and Space, Dribble Drive, Princeton, Flex, Swing, Post-Centric/Inside-Out, Moreyball, Heliocentric, Coach K) and 10 defensive systems (Containment Man, Pack Line, Pressure Man, Switch Everything, ICE/No-Middle, Zone, Matchup Zone/Hybrid, Press/Pressure, Junk/Special, Coach K). A basketball head coach candidate's system identity must be mapped against these definitions.

If KaNeXT wants to run Pace and Space offense with Containment Man defense at FMU Basketball, and the HC candidate runs Princeton offense with Pack Line defense, that is a system identity mismatch. It does not mean the candidate is a bad coach. It means the candidate's coaching philosophy conflicts with the institutional athletic identity. This conflict must be surfaced in the evaluation, and the candidate must demonstrate adaptability or the mismatch must be accepted as a trade-off.

For other sports: System identity evaluation uses general coaching philosophy assessment until sport-specific intelligence systems are built. Football, soccer, and baseball intelligence systems are in development.

### Coaching-Specific CKR Enhancement

For coaching candidates, the standard CKR is enhanced with four additional sub-scores:

**Coaching Philosophy Alignment:** Does their offensive and defensive system identity match what KaNeXT wants to build? Perfect match = 95+. Compatible = 80-94. Adaptable = 65-79. Misaligned = below 65.

**System Identity:** What system do they actually run? Not what they claim - what does their coaching history, game film, and results show? Coaches claim systems they do not actually run. The evidence must be in the results.

**Recruiting Network Value:** Geographic reach (local, regional, national, international), level of contacts (HS coaches, club directors, international scouts), relationship quality (do recruits actually take their calls), pipeline access (do they have access to feeder programs), international pipeline (critical for KaNeXT's global recruiting strategy), and portal/transfer relationships.

**Player Development Track Record:** Players who advanced to the next level, players who improved measurably under their coaching, players who earned awards, development timeline (quick or slow).

### Coaching-Specific FKR Enhancement

For coaching candidates, FKR is enhanced with two additional sub-scores:

**Compliance History:** Clean record = no penalty. Minor violation = FKR -5. Major violation = FKR -15 to -25. Active investigation = evaluation paused until resolution.

**Retention and Culture:** Transfer rates from their program, player retention across eligibility, former player testimony, assistant coach retention, and public culture indicators.

### Pipeline Coherence

Within each sport, the coaching staffs across all four levels (Varsity, JV1, JV2, Prep Academy) must share a coherent system identity. The Prep Academy coach and the Varsity coach must run compatible systems so player development transfers seamlessly across levels.

System Identity Coherence Score (per sport):
- 95-100%: Perfect alignment. Same core system across all levels.
- 85-94%: High alignment. Minor variations. Transition is smooth.
- 70-84%: Moderate alignment. Different systems but compatible principles.
- Below 70%: Misaligned. Players trained in one system at Prep must learn a different system at Varsity. This is development inefficiency and must be flagged.

When hiring a development-level coach (JV2, Prep), the candidate's system identity must be evaluated against the Varsity head coach's system. A mismatch at development levels is more damaging than a mismatch at Varsity because athletes trained in a conflicting system must unlearn before they can advance.

---

# PART 4: THE CANDIDATE COMPARISON ENGINE

---

## 9. Comparing Finalists - The Six-Dimension Framework

When a search produces 2-5 finalists for a role, leadership needs more than "this person scored 84 and that person scored 82." The Candidate Comparison Engine answers six questions with governed, traceable math.

### Dimension 1: Immediate Impact

Who gives us the most Department KR lift? The engine recomputes Department KR with each candidate inserted at the role's criticality weight. The candidate whose insertion produces the highest delta is the most immediately impactful hire.

### Dimension 2: Strategic Gap Fill

Who fills the biggest skill gap? The engine pulls the department's Skill Gap Analysis, identifies the top 3 competency gaps by priority score, and assesses how many gaps each candidate addresses. A candidate who addresses the number-one priority gap at CKR 85 is more valuable than one who addresses the number-three priority gap at CKR 90.

### Dimension 3: Growth Ceiling

Who has the highest ceiling? Growth Ceiling = GKR + Suppression Uplift Midpoint (if applicable). This captures both intrinsic growth trajectory AND environment-unlocked potential. A candidate with GKR 78 and a Suppression-Adjusted range of +8 to +12 has the same Growth Ceiling as a candidate with GKR 88 and no suppression.

### Dimension 4: Risk Profile

Who carries the most risk? Risk Score = sum of all risk flag severity points. Job hopping, termination history, reference gaps, compensation misalignment, over-qualification, under-qualification, low confidence data, culture fit concerns, and compliance issues all contribute. Lower Risk Score is better.

### Dimension 5: System Fit

Who fits the institutional culture best? System Fit Score pulled directly from the five-dimension assessment. For coaching hires, System Fit also includes Coaching Philosophy Alignment and Pipeline Coherence Impact.

### Dimension 6: Opportunity Cost

What do we lose by picking one over another? For each finalist pair, the engine produces a narrative comparison: component KR deltas, gap coverage delta, risk delta, timeline delta, and cost delta. This prevents the trap of only looking at the top-line KR number.

### Composite Ranking

The six dimensions combine through criticality-tier-specific weights:

Mission-Critical: Immediate Impact 25%, Gap Fill 20%, Growth 15%, Risk 15%, System Fit 25%.
High-Impact: Immediate Impact 30%, Gap Fill 20%, Growth 15%, Risk 15%, System Fit 20%.
Core Staff: Immediate Impact 35%, Gap Fill 15%, Growth 20%, Risk 15%, System Fit 15%.
Support Staff: Immediate Impact 40%, Gap Fill 10%, Growth 20%, Risk 15%, System Fit 15%.

Mission-Critical roles weight System Fit highest because a misaligned executive or head coach is catastrophic regardless of competency.

### Scenario Modeling

Beyond standard finalist ranking, the Comparison Engine models complex scenarios:

**Multiple Roles, Candidate Pool:** When hiring for multiple positions simultaneously, the engine finds the optimal candidate-to-role assignment that maximizes total Department KR lift. This is the "draft optimization" problem.

**Hire Now vs Wait:** One finalist is available now; a stronger candidate may become available in 60 days. The engine models vacancy cost during the wait period and computes the break-even point - how much better does the future candidate need to be to justify the vacancy.

**Promote Internal vs Hire External:** Models the cost of passing over an internal succession candidate (morale impact, flight risk increase, succession plan reset) against the KR benefit of the external hire.

### Batch Mode for Athletic Hiring

When KaNeXT is hiring 100+ coaches across 13 sports and 4 levels in Year 1, individual comparisons are insufficient. Batch mode runs the Comparison Engine across all open coaching positions simultaneously, optimizing total Athletic Department KR while maintaining system identity coherence within each sport and maximizing recruiting network coverage across the institution.

---

# PART 5: INTERVIEW AND HIRING OPERATIONS

---

## 10. The Five-Phase Hiring Process

Hiring Ops defines the operational playbook for running the hiring process. It mirrors the four-phase Game Ops structure from basketball (Pregame, In-Game, Halftime, Postgame) with five phases: Pre-Screen, Interview Execution, Debrief, Offer Stage, and Close/Onboard.

### Phase 1: Pre-Screen (Pregame)

Every candidate who passes an initial hard filter (minimum credentials, geographic alignment, no hard-block disqualifiers) receives a V1 evaluation. The Pre-Screen Packet is then generated - the hiring equivalent of the Pregame Scout Packet.

The Pre-Screen Packet includes:
- Candidate Summary: V1 KR, range, confidence, key strengths, key concerns
- Interview Focus Areas: 3-5 areas the interview must investigate to upgrade from V1 to V2 (targeted at the specific uncertainty in this candidate's profile)
- Suggested Interview Questions: Tailored to the role type and the candidate's V1 profile, not generic. Each question includes what it measures, what a strong answer looks like, and what a weak answer looks like.
- Risk Investigation Targets: Specific follow-ups on any V1 risk flags

For coaching candidates, the Pre-Screen Packet adds a Coaching Record Summary, System Alignment Assessment, and Recruiting Network Map.

### Phase 2: Interview Execution (In-Game)

Every interview follows a structured behavioral protocol. Questions are predetermined. Scoring rubrics are standardized. Interviewers score independently before the debrief. No "anchoring" from a senior interviewer's opinion before others have scored. This is non-negotiable because unstructured interviews are the single largest source of hiring error.

Interview loops are defined by role type:
- C-Suite: Screen + Hiring Manager deep dive + Cross-functional panel + Founder/CEO + 5+ references + On-site/dinner
- Head Coach: Screen + AD deep dive + Basketball Ops panel + Founder/CEO + 5+ references + Campus visit + Practice/film session
- Technology: Screen + Technical interview + System design/code review + Team panel + 3+ references

Coaching interviews include additional required components that do not exist for other roles: a film session (show clips, ask them to diagnose and prescribe), a recruiting scenario role-play, a player development demonstration (design a workout), and a compliance awareness check.

Every interviewer completes a structured scorecard with five dimensions (Technical Competency, Leadership Capability, Culture Fit, Growth Trajectory, Role-Specific Assessment), each scored 1-5 with mandatory evidence notes. A score without evidence is invalid and not counted.

### Phase 3: Debrief (Halftime)

Debrief occurs within 24 hours of the last interview. All interviewers submit scorecards independently first. The Pre-Debrief Summary shows average scores per dimension, areas of agreement, and areas of disagreement.

The debrief meeting follows a locked structure: Score Reveal (no discussion), Convergence Confirmation (agree and move on), Divergence Investigation (each interviewer shares evidence for disagreements), Suppression Discussion (did the interview reveal environmental or role suppression), Risk Flag Update (resolved or new), and Decision (Advance, Advance with Conditions, Hold, or Cut).

Multi-candidate debriefs require each candidate be debriefed independently before any comparison is made. The Comparison Engine runs only after all individual debriefs are complete.

### Phase 4: Offer Stage (Late Game)

Offer construction follows the Compensation Intelligence framework. Base salary is positioned within the pay band based on the candidate's KR relative to the role legend. Higher KR candidates are positioned higher in the band.

Total compensation packages vary by role type: standard full-time, executive (base + bonus + equity), coaching (base + bonus + camp revenue + housing + multi-year contract + buyout), faculty (base + research support + sabbatical), technology (base + equity + remote flexibility + dev budget).

Internal equity is checked before every offer. If the offer would create a pay disparity within the department (equity ratio above 1.15 for the same role type and experience band), either the offer is adjusted or existing compensation is adjusted to maintain equity.

### Phase 5: Close and Onboard (Postgame)

Upon acceptance, the Onboarding Intelligence engine (downstream) generates a customized 30/60/90 day plan based on the candidate's evaluation profile. Unsuccessful candidates are treated with respect - finalists get a personal phone call, strong candidates (KR 75+ with no disqualifying flags) are added to the talent pool for future roles.

At 90 days, a Post-Hire Audit runs: Is the hire performing to projected KR? Were interview scores predictive? Were risk flags manifesting? Were there issues the interview process missed? This calibration loop feeds back into the system to improve future hiring.

---

# PART 6: TEAM INTELLIGENCE

---

## 11. Department KR

Department KR is the hiring equivalent of Team KR in basketball. It is the rotation-weighted aggregation of individual Employee KRs within a department, weighted by role criticality.

### How Department KR is Computed

Not all roles contribute equally. A department with one elite leader and four average support staff scores differently than a department with five average staff.

Criticality weights: Mission-Critical roles carry a 2.0 multiplier. High-Impact roles carry 1.5. Core Staff carry 1.0. Support Staff carry 0.7.

Department KR = SUM(Employee KR x Criticality Weight) / SUM(Criticality Weights)

In addition to the aggregate score, the system computes Department CKR, LKR, FKR, and GKR averages. These reveal whether a department's quality is driven by competency, leadership, fit, or growth - and where the gaps are.

### Department KR Tiers

- 90-100 (Elite Department): Top-tier talent across all roles. Can operate autonomously.
- 85-89 (Strong Department): High-quality team with minor gaps.
- 80-84 (Solid Department): Competent. Needs 1-2 key hires.
- 75-79 (Developing Department): Mixed quality. Significant hiring needed.
- 70-74 (Below Standard): Multiple capability gaps. Priority hiring required.
- Below 70 (Critical): Non-functional or near non-functional. Rebuilding required.

### Skill Gap Analysis

For each department, the system defines the Required Competency Profile (the "ideal roster"), maps current employees against it, identifies headcount gaps (position does not exist), competency gaps (position filled but below KR 70), and depth gaps (single point of failure), and prioritizes gaps by criticality, Department KR impact, urgency, and market availability.

### Succession Depth Chart

For every mission-critical and high-impact role, the system maintains a succession plan: Ready-Now successor (KR within 5 points), Development successor (ready in 12-24 months), and Emergency plan (no internal candidate, requires external search). Succession Risk Score = (Mission-Critical roles without Ready-Now successor) / (Total Mission-Critical roles).

### Athletic Department KR

The athletic department gets special weighting. Revenue sports (Football, Men's Basketball, Women's Basketball) carry a 2.0 sport-category weight. Within each sport, Varsity carries 2.0, JV1 carries 1.2, JV2 carries 0.8, and Prep Academy carries 0.6.

The system also maintains a Recruiting Network Coverage Map aggregating all coaching staff networks to identify geographic blind spots. If no current coach has West African contacts and that is a strategic recruiting market, the next assistant coach hire should prioritize candidates with West African pipeline access.

---

## 12. Institutional KR

Institutional KR is the weighted average of all Department KRs, weighted by department strategic priority.

Priority 1 departments (Athletics, Enrollment, Technology) carry a 2.0 weight. Priority 2 (Academic Affairs, Campus Operations) carry 1.5. Priority 3 (Finance, HR, Marketing) carry 1.2. Priority 4 (Administrative, Support) carry 1.0.

Institutional KR is a single number that represents the overall talent quality of the institution. The weakest department is the institution's bottleneck.

The system produces a Component KR Heatmap across all departments, revealing institutional patterns. Low CKR institution-wide means hiring standards are too low. Low LKR institution-wide means a leadership vacuum. Low FKR institution-wide means a culture problem. Low GKR institution-wide means a stagnating workforce.

---

# PART 7: DOWNSTREAM ENGINES

---

## 13. Onboarding Intelligence

The Onboarding Intelligence engine generates a structured onboarding plan tailored to each specific hire based on their evaluation profile. No two onboarding experiences are identical because no two hires have the same strengths, gaps, and needs.

### Customized 30/60/90

**Day 1-30 (Foundation):** Universal elements (system access, orientation, manager cadence, culture mentor) plus customized elements based on evaluation gaps. If FKR is below 80, extended values immersion and additional culture mentor sessions. If CKR gaps exist, targeted training plan. If Operating Style Fit is below 70 (institutional-to-startup transition), explicit startup culture briefing and small wins framework.

**Day 31-60 (Ramp):** Universal elements (first performance touchpoint, cross-functional introductions, first independent deliverable) plus customized elements. If GKR is 85+, accelerated scope expansion. If over-qualification risk flag was triggered, engagement check and growth pathway discussion.

**Day 61-90 (Performance):** Formal 90-day review. First Employee KR computation. Manager assessment against hiring projection. If the hire was a suppression candidate, specific assessment of whether the new environment is unlocking capability.

---

## 14. Performance Monitoring

Employee KR is recomputed quarterly based on ongoing performance data. The system tracks three trajectories:

- **Ascending:** KR increased 3+ points since hire. Employee is growing into or beyond their role.
- **Stable:** KR within +/-3 of hire KR. Performing to projection.
- **Declining:** KR decreased 3+ points since hire. Investigation required.

Projection accuracy is tracked: at 6, 12, and 24 months, actual Employee KR is compared against the original Candidate KR. If 30% of hires are underperforming projections, the evaluation system is miscalibrated.

---

## 15. Retention Intelligence

The Retention Engine computes Flight Risk from five signal categories:

**Compensation Signal:** Paid below band, below market, or recently learned about a pay disparity.

**Engagement Signal:** Declining performance, reduced participation, increased PTO, manager-reported disengagement.

**Market Signal:** Skill set in high demand, contacted by recruiters, competitors hiring aggressively.

**Tenure Signal:** At the 18-24 month peak departure window, or 3+ years with no promotion.

**Event Signal:** Major life event, manager departure, reorganization, passed over for promotion.

Flight Risk Tiers: Low (0-25, no action), Moderate (26-50, career conversation), High (51-75, senior leadership engagement and retention offer), Critical (76-100, immediate intervention and simultaneous succession planning).

Not all departures should be prevented. The system identifies healthy attrition: employees with declining KR, persistent culture misalignment, or who were always going to leave. For these, the recommendation is: begin succession planning, provide a respectful off-ramp, and capture institutional knowledge.

---

## 16. Succession Engine

For every priority role, the system maintains three succession components:

**Immediate Successor (Ready Now):** Internal candidate within 5 KR points of incumbent. Could step in within 2 weeks.

**Development Successor (Ready in 12-24 months):** Internal candidate on a development pathway. Current KR, projected KR at readiness, development actions in progress.

**Emergency Plan:** Interim leadership assignment, pre-written external search specifications, knowledge preservation protocol.

Coaching succession has unique dynamics. The associate HC or top assistant is the natural Varsity HC successor. The level pipeline (Prep HC develops into JV2 HC, JV2 HC into JV1 HC, JV1 HC into Varsity HC) only works if system identity coherence is maintained. When a coach leaves, recruiting relationships may leave with them - the succession plan must assign relationship handoffs before departure.

Executive succession is uniquely high-stakes at an early-stage institution. Every executive role requires a "hit by a bus" document that captures everything someone would need to know on Day 1 in the role.

---

## 17. Development Planning

The Development Engine generates individualized development plans based on Employee KR profile, career goals, and institutional need.

For each component KR, the system identifies the gap between current score and the score required for the next level. Priority is determined by gap size multiplied by component weight for the target role. Development actions are prescribed for each gap: technical training, stretch assignments, mentorship, cross-functional rotation for CKR gaps; progressive scope expansion, leadership programs, executive mentorship for LKR gaps; culture immersion, community engagement, peer integration for FKR gaps.

For coaching staff, development planning includes a defined pathway from entry-level assistant to HC readiness, typically 3-5 years: master current role, take on expanded responsibilities, lead a development-level team, demonstrate results, move to associate HC, then HC ready.

---

# PART 8: COMPENSATION INTELLIGENCE

---

## 18. Market Rate Framework

Compensation analysis considers three layers:

**Geographic Market:** Miami, FL metro area. High-cost, high-growth market.

**Institutional Context:** HBCU/faith-based/startup institution. Creates both compression (HBCU pay historically below PWI equivalents) and opportunity (mission-driven candidates may accept below-market base for mission alignment and upside).

**Role-Specific Market:** Coaching salaries vary by sport, level, and division. Technology salaries are driven by the Miami tech market, not the education market. Executive salaries must compete with both higher-ed and private-sector equivalents.

### Compensation Positioning

Mission-Critical roles (C-Suite, Revenue Sport HC, Lead Engineers): 75th-90th percentile. Must attract best available.

High-Impact roles (Department Heads, Revenue Sport Assistants, Senior Faculty): 60th-75th percentile. Competitive. Mission alignment supplements base.

Core Staff (Faculty, Admissions, Operations, Technology): 50th-65th percentile. Market rate. Benefits and culture differentiate.

Support Staff (Administrative, Entry-Level, Student Workers): 50th percentile. Fair market. Growth opportunity is the draw.

### Total Compensation Components

Base Salary. Housing Allowance (campus-based staff). Education Benefits (tuition waiver for employee and dependents at FMU). Health and Benefits. Performance Bonus (enrollment targets, win/loss, fundraising, engineering milestones). Equity/Upside (executives and technology - the primary tool for attracting talent above institutional pay scale). Relocation.

### Internal Equity Rules

No employee in the same role type and experience band can be paid more than 115% of the lowest-paid person in that band. Compensation decisions are documented with market data justification. Coaching salaries within the same sport and level cannot vary by more than 20% unless justified. Annual market refresh is mandatory.

---

# PART 9: RISK AND GOVERNANCE

---

## 19. Hiring Risk Flags

Risk flags are candidate-level warning signals that do not automatically disqualify but require investigation.

**Job Hopping:** 3+ moves in 5 years without clear upward progression. Pattern with upward moves = no risk. Lateral moves without logic = high risk (flight risk near-certain).

**Termination History:** Any involuntary separation in the last 10 years. Layoff/restructuring = low risk if consistent with organizational context. Performance termination = high risk. Termination for cause = very high risk, may be a hard block.

**Reference Gaps:** Cannot provide references from most recent 2 employers. Single employer gap with explanation = low risk. Multiple employers, no explanation = high risk.

**Compensation Misalignment:** Expectation exceeds 150% of role budget. 150-175% with flexibility = moderate risk. 175%+ with firm position = high risk.

**Over-Qualification:** Experience significantly exceeds requirements. Clear motivation (mission, geography, career pivot) = low risk. No clear motivation = high risk (will leave within 12 months).

**Under-Qualification:** Does not meet minimum in 2+ core areas. Gap closeable with training and high GKR = moderate risk. Structural gap = high risk.

---

## 20. Confidence Gates

Confidence percentage communicates evidence completeness. It answers "how much should you trust this KR?"

### Confidence by Data Tier

Resume only: 25-35%. Resume + LinkedIn + public record: 35-45%. Resume + public + 1 interview: 45-55%. Full interview loop + partial references: 55-70%. Full loop + full references: 70-80%. Full loop + work product review: 80-88%. Full loop + work product + on-site + deep references: 88-95%.

### Coaching Confidence Boosters

Verified win/loss record: +3-5%. Verified recruiting classes: +2-3%. Player placement verification: +3-5%. Film session (observed coaching): +5-8%. Practice observation: +5-8%.

Maximum confidence: 97%. No hire can be evaluated with 100% confidence because humans are inherently unpredictable.

---

## 21. Governance Rules

These rules apply to the entire Hiring Intelligence system:

1. **Deterministic:** Same inputs produce same outputs. No randomness, no discretion.
2. **No fabrication:** Missing data = UNSCORED. Never guess.
3. **Confidence always shown.** Low-confidence evaluations are never presented as high-confidence.
4. **Downstream never modifies upstream.** Development planning, retention monitoring, and succession planning consume Employee KR but never change it.
5. **KLVN normalizes inputs, not outputs.** The final KR is a universal number.
6. **Legends are display-only.** They interpret KR. They do not produce KR.
7. **Suppression detection is mandatory.** Every evaluation must assess environment, role, resource, and bias suppression.
8. **Coaching cross-reference is mandatory.** Every coaching hire must be evaluated against the relevant sports intelligence system.
9. **Interviewers score independently.** No anchoring before debrief. Non-negotiable.
10. **Post-hire audits are mandatory.** 90-day calibration loop feeds back into the system.
11. **Every output is traceable to its inputs** through the Phase 3 anchor and Phase 6 component scores.
12. **Any change** to evaluation pipeline, component definitions, weights, legends, KLVN lambdas, system fit dimensions, suppression rules, risk flags, compensation framework, or process flow requires documentation, versioning, and approval.

---

# PART 10: INSTITUTIONAL INTELLIGENCE DASHBOARD

---

## 22. Key Metrics for Leadership

The Hiring Intelligence system surfaces the most important workforce metrics in a single view for the CEO and executive team.

### Talent Quality

Institutional KR (current, 90-day trend). Department KR by department (ranked). New hire KR average (are recent hires above or below institutional average). Top 10 highest-KR employees across institution.

### Hiring Velocity

Open positions (count, by department, by urgency). Average time to fill (by role type). Offer acceptance rate. Pipeline depth (candidates in evaluation per open position).

### Retention

Institutional flight risk score. High-risk employees (names, roles, risk drivers). Departures in last 90 days (voluntary vs involuntary, KR of departed employees). Regretted vs non-regretted attrition ratio.

### Development

Employees on active development plans. Average KR change over 12 months. Promotion rate (internal promotions as percentage of all role fills).

### Succession

Mission-Critical roles without Ready-Now successor. Succession coverage score.

### Compensation

Institutional compensation vs market position. Pay equity ratio by department. Budget utilization.

### Athletic Department Specific

Coaching staff KR by sport and level. System identity coherence score by sport. Recruiting network coverage map (geographic, international). Player development rate by coaching staff.

---

## 23. Reporting Cadence

Weekly: New hire tracking, integration load, immediate risk flags.

Monthly: Department KR updates, skill gap status, succession depth chart.

Quarterly: Full organizational intelligence report (Institutional KR, cross-department analysis, compensation equity, composition metrics, hiring pipeline analytics).

Annually: Strategic workforce planning (projected headcount, projected Department KR targets, compensation market refresh).

---

# PART 11: INTEGRATION WITH OTHER INTELLIGENCE SYSTEMS

---

## 24. Sports Intelligence Cross-Reference

The Hiring Intelligence system integrates with the sports intelligence systems (basketball, football, soccer, baseball) at several points:

**Coaching System Identity:** Every coaching hire's system identity is evaluated against the sports intelligence system's definitions of offensive and defensive systems.

**Player Development Track Record:** A coaching candidate's player development history can be validated against KR evaluations of the players they coached.

**Coaching Impact Modifier:** The basketball intelligence system's CIM (Coaching Impact Modifier) measures coaching-attributable player development residuals across trait clusters. This data can inform coaching candidate evaluations - a coach whose former players consistently improved their shooting by +4 points above expected has a measurable development advantage.

**Recruiting Network Value:** The sports intelligence system's player evaluation data can validate a coaching candidate's claimed recruiting network. If a coach claims they recruited a KR-90 player, the system can verify.

### Admissions Intelligence Cross-Reference

The Admissions Intelligence system (separate build) evaluates prospective students. Hiring Intelligence evaluates the admissions staff who recruit those students. The two systems connect: if the admissions team's Department KR is low, enrollment outcomes will suffer regardless of market conditions. If the admissions team's Recruiting Network Coverage Map has geographic blind spots, those regions will be under-recruited.

### Acquisition Intelligence Cross-Reference

When KaNeXT acquires an institution, the Hiring Intelligence system evaluates the existing staff. Every employee at the acquired institution gets a V1 evaluation to establish baseline Department KRs. This immediately surfaces which departments are strong, which need reinforcement, and which need rebuilding.

---

## 25. The KaNeXT Institutional Thesis - How Hiring Intelligence Embodies It

KaNeXT's core thesis is that talent is universally distributed but opportunity is not. The basketball intelligence system proves this by identifying players at USCAA and NCCAA levels whose production, when properly normalized and evaluated, reveals D1-caliber talent trapped in under-resourced programs.

The Hiring Intelligence system proves the same thesis for people. Great coaches are trapped at programs with no budget. Great administrators are trapped at dysfunctional organizations. Great engineers are trapped at companies that do not recognize their contributions. Great faculty are trapped at institutions that do not support their research.

The suppression detection framework, the KLVN normalization system, the confidence-gated evaluation pipeline, and the cross-context fairness architecture all exist to see through the noise of environment, pedigree, and label to the signal of actual human capability.

Every time the Hiring Intelligence system identifies a suppressed candidate - someone whose KR of 72 would be an 85 in the right environment - it validates the thesis. Every time an institution hires based on school name, company brand, or network connections instead of demonstrated production, they miss the best available talent.

KaNeXT does not miss them. The intelligence system sees them.

---

# END OF DOCUMENT

---

## Document Statistics

- **Total sections:** 25 main sections
- **Parts:** 11
- **Covers:** Candidate evaluation, component KRs (CKR/LKR/FKR/GKR), 9 role type legends, KLVN normalization (3 lambda dimensions), system fit (5 dimensions), suppression detection (4 types), coaching staff deep module (6 sub-scores, pipeline coherence, recruiting network mapping), candidate comparison engine (6 dimensions, composite ranking, scenario modeling, batch mode), interview operations (5 phases, structured protocols, scoring rubrics), team intelligence (Department KR, Institutional KR, skill gap analysis, succession depth chart), downstream engines (onboarding, performance monitoring, retention, succession, development planning), compensation intelligence (market framework, positioning strategy, internal equity), hiring risk flags (6 categories), confidence gates, and institutional intelligence dashboard
- **Version:** 1.0
- **Date:** March 2026
- **Source files:** Hiring SKILL.md v1, Files 01-06 (Hiring Eval Process, Hiring Eval Reference, Hiring Team Intelligence, Hiring Comparison Engine, Interview and Hiring Ops, Hiring Downstream Engines)
- **Architecture:** Mirrors KaNeXT Basketball Intelligence system exactly (KR, KLVN, legends, Phase 3 anchor, Phase 6 adjustment, suppression detection, confidence gates)
- **For use by:** Nexus AI (internal reference), investors, HR leadership, department heads, athletic directors, coaching search committees, and anyone asking about KaNeXT Hiring Intelligence
