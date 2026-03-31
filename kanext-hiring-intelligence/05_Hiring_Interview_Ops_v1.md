# Interview and Hiring Operations

KaNeXT Hiring Intelligence System - File 05

---

## 0. Scope

This is the single authoritative document for the operational execution of the KaNeXT hiring process. It defines what happens at every stage from initial candidate identification through offer acceptance. It is the hiring equivalent of Game Ops (File 05) in the basketball intelligence system.

Where Game Ops has four phases (Pregame, In-Game, Halftime, Postgame), Hiring Ops has five phases:

1. **Pre-Screen** (Pregame) - candidate identification, initial filtering, V1 evaluation
2. **Interview Execution** (In-Game) - structured behavioral interviews, scoring, real-time assessment
3. **Debrief** (Halftime) - post-interview evaluation, scoring reconciliation, decision to advance or cut
4. **Offer Stage** (Late Game) - compensation modeling, offer construction, negotiation
5. **Close and Onboard** (Postgame) - acceptance, transition, handoff to Downstream Engines (File 06)

This file does NOT evaluate candidates (that is File 01). It does NOT compare finalists (that is File 04). It operates the process through which candidate data is gathered, structured, and fed into the evaluation pipeline.

All processes are deterministic and auditable.

---

## Global Rules (Apply to All 5 Phases)

**Determinism:** Same process, same structure, every time. No ad hoc interviews. No improvised questions. No gut-feel decisions without structured scoring to accompany them.

**No Truth Mutation:** Hiring Ops gathers data and feeds it into the evaluation pipeline. It does not independently produce KR scores, component ratings, or hire/no-hire decisions. All scoring flows through File 01.

**Data Tier Progression:** The hiring process is designed to systematically upgrade the candidate from V1 (resume only) to V2 (resume + interview + references) to V3 (full loop). Each phase adds data that increases evaluation confidence.

**Universal Output Fields:** Every phase must produce:
- candidate_id
- role_id (linked to Hiring Context)
- phase_name
- data_tier after this phase (V1/V2/V3)
- confidence_pct after this phase
- phase_output (structured, not free-text)
- next_action (advance, cut, hold, or request additional data)

**Bias Mitigation:** Structured interviews with predetermined questions and scoring rubrics reduce interviewer bias. All interviewers score independently before the debrief. No "anchoring" from a senior interviewer's opinion before others have scored.

---

## 1. PRE-SCREEN PHASE (Pregame)

### 1.1 Inputs

**Role Definition (from Hiring Context Setup, File 01 Section 1):**
- Role title, type, department, institution
- Criticality tier
- Required competencies (must-have list)
- Preferred competencies (nice-to-have list)
- Compensation range
- Start date target
- Hiring urgency

**Candidate Source:**
- Inbound application (job posting response)
- Referral (internal employee or network referral)
- Sourced (recruiter-identified, executive search)
- Portal (coaching-specific: candidates in the coaching carousel or recently let go)

### 1.2 Initial Filter

Before any evaluation effort, apply the hard filter:

**Automatic Advance (meets all):**
- Meets minimum education/credential requirement for the role type
- Has relevant experience in the role type or adjacent role type
- Geographic alignment (willing to be in Miami or remote-eligible role)

**Automatic Cut (any one):**
- Does not meet minimum credential requirement (e.g., no PhD for tenure-track faculty, no teaching certificate for K-12 roles)
- Explicitly misaligned on a hard-block dimension (e.g., refuses to work in a faith-based institution)
- Compensation expectation exceeds 200% of role budget with no flexibility

**Hold for Review:**
- Missing data (incomplete application, unclear credentials)
- Edge case (meets some requirements but not all, suppression candidate may explain gaps)

### 1.3 V1 Evaluation

All candidates who pass the initial filter receive a V1 evaluation (File 01 Section 5):
- Resume review
- LinkedIn/public record web search
- Phase 3 Production Anchor
- V1 Component KR scoring with proxy confidence
- Suppression detection
- Risk flag check

Output: V1 Candidate KR with confidence cap per data tier.

### 1.4 Pre-Screen Packet (per candidate)

The Pre-Screen Packet is the Hiring Ops equivalent of the Pregame Scout Packet. It prepares the interview team before they meet the candidate.

**Must Output:**

**A) Candidate Summary**
- Name, current role, location
- V1 Candidate KR and range
- Confidence %
- Key strengths (top 2-3 from component KRs)
- Key concerns (top 2-3 from risk flags or low component scores)
- Suppression indicators (if any)

**B) Interview Focus Areas**
Based on V1 evaluation gaps, identify 3-5 areas that the interview must investigate to upgrade from V1 to V2:
- If CKR proxy confidence is low: "Investigate technical depth in [specific area]"
- If LKR is unscored/low: "Assess leadership experience through behavioral scenarios"
- If FKR is uncertain: "Probe culture fit, faith alignment, autonomy comfort"
- If GKR trajectory is unclear: "Explore career progression decisions and adaptability evidence"
- If suppression is suspected: "Investigate environment at [previous employer] to confirm suppression"

**C) Suggested Interview Questions**
Tailored to the role type and the candidate's specific V1 profile. These are not generic questions - they are targeted at the specific areas of uncertainty.

Format: Each question includes:
- The question
- What it's measuring (which component KR and sub-dimension)
- What a strong answer looks like
- What a weak answer looks like

**D) Risk Investigation Targets**
If risk flags were triggered at V1, specify what the interview must clarify:
- Job hopping: "Ask about the transition from [Company A] to [Company B]. What drove that decision?"
- Reference gap: "Note that the candidate did not list a reference from [Employer]. Ask why."
- Compensation: "The candidate's expected comp is [X]. Role budget is [Y]. Assess flexibility."

### 1.5 Coaching Pre-Screen (Additional)

For coaching candidates, the Pre-Screen Packet includes additional sections:

**E) Coaching Record Summary**
- Win/loss by program
- Recruiting class rankings
- Player placement list
- System identity identification (offensive, defensive)

**F) System Alignment Assessment**
- Candidate's system vs program's desired system
- Compatibility rating
- Questions to probe system flexibility

**G) Recruiting Network Map**
- Candidate's primary recruiting territory
- Overlap with existing staff territory
- Gaps this candidate would fill

### 1.6 Pre-Screen Decision

Based on V1 evaluation:

| V1 KR Range | Action |
|---|---|
| Above Role Legend "Strong" tier | Advance to interview. Priority scheduling. |
| Within Role Legend "Capable" to "Strong" | Advance to interview. Standard scheduling. |
| Within Role Legend "Developing" tier | Advance only if suppression detected or candidate pool is thin. |
| Below Role Legend "Developing" tier | Cut. Notify candidate. |

For roles with 10+ candidates above the "Capable" tier: rank by V1 KR and advance the top 5-8 to interview. Additional candidates are held in reserve.

---

## 2. INTERVIEW EXECUTION PHASE (In-Game)

### 2.1 Interview Structure by Role Type

| Role Type | Interview Loop |
|---|---|
| C-Suite/Executive | Screen (30 min) + Hiring Manager deep dive (60 min) + Cross-functional panel (60 min) + Founder/CEO (60 min) + Reference check (5+ refs) + On-site/dinner |
| Head Coach | Screen (30 min) + AD deep dive (60 min) + Basketball Ops panel (60 min) + Founder/CEO (45 min) + Reference check (5+ refs) + Campus visit + Practice/film session |
| Assistant Coach | Screen (30 min) + HC interview (45 min) + AD interview (30 min) + Reference check (3+ refs) |
| Faculty (tenure-track) | Screen (30 min) + Department chair (45 min) + Faculty panel (45 min) + Teaching demonstration + Research presentation + Reference check (3+ refs) |
| Faculty (adjunct) | Screen (20 min) + Department chair (30 min) + Reference check (2+ refs) |
| Admissions/Enrollment | Screen (30 min) + Director interview (45 min) + Team panel (30 min) + Reference check (3+ refs) |
| Campus Operations | Screen (30 min) + Director interview (45 min) + Reference check (2-3 refs) |
| Technology/Engineering | Screen (30 min) + Technical interview (60 min) + System design or code review (60 min) + Team panel (30 min) + Reference check (3+ refs) |
| Administrative/Support | Screen (20 min) + Hiring manager interview (30 min) + Reference check (2 refs) |

### 2.2 Structured Behavioral Interview Protocol

Every interview (except reference checks) follows a structured format:

**Opening (5 minutes):**
- Introduce the role, institution, and interview structure
- Set expectations ("I'll be asking specific behavioral questions. Take your time.")
- DO NOT share the evaluation criteria or what constitutes a "good" answer

**Core Questions (70% of interview time):**
Each question targets a specific component KR dimension. Questions are pulled from the Pre-Screen Packet (Section 1.4C) plus the standardized question bank for the role type.

Question format: "Tell me about a time when [situation]. What did you do? What was the outcome?"

Follow-up probes:
- "What was your specific role vs the team's?"
- "What would you do differently now?"
- "What did you learn from that?"

**Role-Specific Assessment (20% of interview time):**
- For coaches: Whiteboard session (draw up a play, explain a defensive scheme, walk through a recruiting conversation)
- For faculty: Teaching philosophy discussion, research agenda overview
- For technology: Technical problem-solving (live, collaborative, not gotcha)
- For admissions: Role-play an enrollment conversation with a prospective student and family
- For executives: Strategic scenario (here is the institution's current state, walk me through your first 90 days)

**Candidate Questions (10% of interview time):**
- Allow the candidate to ask questions
- Note what they ask (questions reveal priorities and values)

### 2.3 Interview Scoring

Every interviewer completes a structured scorecard INDEPENDENTLY before the debrief. No discussion between interviewers until all scorecards are submitted.

Scorecard dimensions (per interviewer):

| Dimension | Score (1-5) | Evidence Notes (required) |
|---|---|---|
| Technical Competency (CKR) | | "Specific example or observation" |
| Leadership Capability (LKR) | | "Specific example or observation" |
| Culture and Values Fit (FKR) | | "Specific example or observation" |
| Growth Trajectory (GKR) | | "Specific example or observation" |
| Role-Specific Assessment | | "Specific example or observation" |
| Overall Recommendation | | Advance / Hold / Cut |

Scoring rubric:
- 5: Exceptional. Among the best I've seen for this dimension. Clear, compelling evidence.
- 4: Strong. Above expectations. Solid evidence.
- 3: Adequate. Meets expectations. Evidence is present but not differentiated.
- 2: Below expectations. Concerns. Weak evidence or contradictory signals.
- 1: Unacceptable. Clear red flag. Recommend cut.

Evidence Notes are REQUIRED. A score without evidence is invalid and will not be counted in the debrief.

### 2.4 Reference Check Protocol

Reference checks are scored, not just conducted. Each reference call follows a structured format:

**Reference Scorecard:**

| Dimension | Score (1-5) | Reference Quote/Paraphrase |
|---|---|---|
| Competency confirmation | | |
| Leadership observation | | |
| Culture and work style | | |
| Growth and trajectory | | |
| Would you hire them again? | | Yes/No/Conditional |
| Anything that would prevent you from recommending them? | | |

Reference Call Rules:
- Minimum 3 references for Core Staff+ roles, minimum 5 for Mission-Critical
- At least 1 reference must be a former direct supervisor (not just a peer or direct report)
- At least 1 reference must be from the most recent employer (reference gaps from the most recent employer are a risk flag)
- For coaching hires: at least 1 reference must be a former player AND at least 1 must be a fellow coach at the same program
- Back-channel references (people you know who know the candidate, not provided by the candidate) are permitted and encouraged for Mission-Critical hires. Note that these are back-channel in the reference record.

### 2.5 Coaching Interview Specific

Coaching interviews include additional required components:

**Film Session (30-60 minutes):**
- Show the candidate 5-10 clips of your current team (or the program they'd be joining)
- Ask them to diagnose what's happening offensively and defensively
- Ask them what they would change
- This tests both basketball IQ AND coaching communication ability

**Recruiting Scenario:**
- Role-play a recruiting phone call: "You're calling a 4-star guard's parent. The kid has offers from [three competitors]. Make your pitch."
- Assesses communication, relationship-building, institutional knowledge, and authenticity

**Player Development Demonstration:**
- Ask the candidate to design a 30-minute skill development workout for a specific player archetype
- Assesses teaching ability, basketball knowledge, and development philosophy

**Compliance Awareness:**
- Ask about specific compliance scenarios relevant to the sport and level
- "A booster offers to take a recruit to dinner. What do you do?"
- Assesses compliance knowledge and judgment

### 2.6 In-Process Data Tier Upgrade

After each interview stage, the candidate's data tier upgrades:

| Stage Completed | New Data Tier | Confidence Boost |
|---|---|---|
| Screen only | Still V1 | +3-5% |
| Screen + 1 deep interview | V2 (partial) | +10-15% |
| Full interview loop (no references) | V2 | +15-25% |
| Full loop + references | V2 (full) | +25-35% |
| Full loop + references + work product + on-site | V3 | +35-45% |

At each upgrade, the evaluation pipeline (File 01) can be re-run with higher confidence inputs, producing a tighter KR range and more reliable component scores.

---

## 3. DEBRIEF PHASE (Halftime)

### 3.1 Timing

Debrief occurs within 24 hours of the last interview in the loop. Delay beyond 24 hours degrades interviewer recall and introduces bias.

### 3.2 Debrief Structure

**Pre-Debrief (before the meeting):**
- All interviewers submit scorecards independently
- Hiring Ops aggregates scores and identifies convergence/divergence
- Pre-Debrief Summary distributed: average scores per dimension, areas of agreement, areas of disagreement

**Debrief Meeting (30-60 minutes per candidate):**

**Step 1: Score Reveal (5 minutes)**
Display all interviewer scores side by side. No discussion yet.

**Step 2: Convergence Confirmation (5 minutes)**
For dimensions where all interviewers agree (within 1 point): confirm and move on.

**Step 3: Divergence Investigation (15-30 minutes)**
For dimensions where interviewers disagree (spread of 2+ points):
- Each interviewer shares their evidence
- Identify whether the divergence is due to different information, different standards, or different interpretation
- Resolve to a consensus score with documentation of the reasoning

**Step 4: Suppression Discussion (5 minutes)**
- Does any interviewer see evidence of suppression not captured in V1?
- Did the interview reveal environmental, role, resource, or bias suppression?

**Step 5: Risk Flag Update (5 minutes)**
- Did the interview resolve any V1 risk flags?
- Did the interview surface new risk flags?

**Step 6: Decision (5 minutes)**

| Decision | Criteria |
|---|---|
| Advance to Offer | Average score 3.5+ across all dimensions, no dimension below 3.0, no unresolved major risk flags |
| Advance with Conditions | Average score 3.0+ but 1-2 dimensions below 3.0. Conditions: additional reference, specific question addressed, work product review |
| Hold | Mixed signals. Need additional data. Schedule follow-up interview or additional references. |
| Cut | Average score below 3.0, or any dimension at 1.0, or unresolved disqualifying risk flag |

### 3.3 Debrief Output

**Must Output:**

- candidate_id, role_id
- Interview scores (per interviewer, per dimension)
- Consensus scores (post-debrief)
- Areas of agreement
- Areas of disagreement and resolution
- Suppression update (confirmed, rejected, or no change from V1)
- Risk flag update (resolved, new, or no change)
- Decision: Advance / Advance with Conditions / Hold / Cut
- If Advance: trigger V2 re-evaluation in File 01 with interview + reference data
- If Cut: notification drafted with appropriate feedback level

### 3.4 Multi-Candidate Debrief

When debriefing multiple finalists for the same role in the same session:

1. Debrief each candidate independently first (no comparisons)
2. After all individual debriefs are complete, run the Comparison Engine (File 04) with updated V2 data
3. Review Comparison Engine output as a group
4. Make advancement/offer decision

This prevents the trap of evaluating a candidate relative to the previous one instead of against the absolute standard.

---

## 4. OFFER STAGE (Late Game)

### 4.1 Inputs

- Final Candidate KR (V2 or V3, post-interview)
- Comparison Engine ranking (if multiple finalists)
- Compensation Intelligence (File 02 Section 8)
- Department budget
- Candidate's compensation expectations (gathered in interview)
- Role criticality tier
- Hiring urgency

### 4.2 Offer Construction

Pull the appropriate Deal Structure Template from File 02 Section 9 based on role type.

**Step 1: Base Compensation**

Determine base salary offer using the Compensation Positioning Strategy (File 02 Section 8.3):
- Map candidate KR against the role's pay band
- Higher KR candidates should be positioned higher in the band
- Account for KLVN context (a candidate from a higher-cost market may need premium positioning)

| Candidate KR vs Role Legend | Band Position |
|---|---|
| Above "Strong" tier | 75th-90th percentile of band |
| Within "Strong" tier | 60th-75th percentile |
| Within "Capable" tier | 50th-60th percentile |
| Within "Developing" tier | 40th-50th percentile (hire only if suppression case or thin market) |

**Step 2: Total Compensation Package**

Assemble the full package per the Deal Structure Template:
- Base salary
- Benefits (standard institutional package)
- Performance bonus (if applicable for role type)
- Equity/profit participation (for executives, technology hires)
- Housing allowance (for campus-based roles)
- Education benefits
- Relocation (if out-of-market)
- Signing bonus (only for Mission-Critical hires in competitive markets)

**Step 3: Internal Equity Check**

Before finalizing the offer, run the Compensation Equity Analysis (File 03 Section 6):
- Does this offer create a pay disparity within the department?
- Is the equity ratio within bounds (below 1.15 within the same role type and experience band)?
- If the offer would create inequity: either adjust the offer or adjust existing compensation to maintain equity

**Step 4: Offer Approval**

| Role Criticality | Approval Authority |
|---|---|
| Mission-Critical | Founder/CEO |
| High-Impact | Department head + CFO |
| Core Staff | Department head |
| Support Staff | Hiring manager |

### 4.3 Offer Presentation

The offer is presented with:
- Written offer letter (role, compensation, start date, reporting line, at-will status or contract terms)
- Total compensation summary (base + benefits + bonus + equity, annualized and projected over 3 years)
- Institutional overview (mission, growth plan, the "why" behind the role)
- For coaching hires: recruiting territory assignment, facility overview, roster overview, system identity alignment discussion

### 4.4 Negotiation Intelligence

If the candidate negotiates:

**Acceptable Negotiation Levers** (things we can adjust):
- Base salary within 10% of initial offer
- Signing bonus
- Start date flexibility
- Title adjustment (within institutional framework)
- Professional development budget
- Remote/hybrid flexibility (if applicable)
- Relocation package enhancement

**Non-Negotiable Items** (things we do not adjust):
- Benefits package (institutional, not individual)
- Equity structure (standardized by role level)
- Reporting line
- Performance metrics
- Faith-based institutional requirements

**Walk-Away Point:**
If the candidate's final counter exceeds 120% of the approved compensation budget for the role: escalate to approval authority for exception or walk away.

The Comparison Engine (File 04) should have identified the #2 candidate. If the #1 candidate walks away, pivot to #2 within 48 hours.

### 4.5 Coaching Offer Specific

Coaching offers include additional terms:
- Contract term (2-4 years for HC, 1-2 years for assistants)
- Buyout clause (both directions: institution buyout and coach buyout)
- Performance incentives (wins, tournament appearances, academic performance, recruiting metrics)
- Camp and clinic revenue sharing
- Non-compete for recruiting territory (coach cannot recruit players to a competitor for X months after departure)
- Moral turpitude clause

---

## 5. CLOSE AND ONBOARD PHASE (Postgame)

### 5.1 Offer Acceptance

Upon acceptance:
1. Signed offer letter filed in HR system
2. Background check initiated (if not already completed)
3. Start date confirmed
4. Onboarding Intelligence (File 06 Section 1) triggered with final Candidate KR
5. Department head notified
6. New hire announcement prepared (internal and external as appropriate)

### 5.2 Unsuccessful Candidates

For candidates who were cut or received but declined an offer:

**Candidate Disposition:**
- Cut at Pre-Screen: Automated notification. No detailed feedback.
- Cut at Interview: Personalized notification within 3 business days. Brief feedback if requested.
- Cut at Debrief (finalist): Personal phone call from hiring manager. Honest feedback. Relationship preservation.
- Declined our offer: Personal follow-up from hiring manager. Understand why. Preserve relationship for future opportunities.

**Talent Pool:**
Candidates who were strong but not selected (KR 75+ and no disqualifying risk flags) are added to the institutional talent pool for future roles. Their evaluation data is preserved (with appropriate data governance) for 18 months.

### 5.3 Post-Hire Audit

90 days after hire, the Hiring Ops system runs a post-hire audit:

**Audit Questions:**
1. Was the hire performing to projected KR? (File 06 Section 2)
2. Did the onboarding plan address the right areas? (File 06 Section 1)
3. Were the interview scores predictive of actual performance?
4. Were risk flags that were identified pre-hire actually manifesting?
5. Were there issues that the interview process MISSED?

**Calibration Feedback:**
Audit results feed back into the system to calibrate:
- Interview question effectiveness (which questions predicted performance and which didn't)
- Interviewer accuracy (which interviewers' scores most closely predicted actual performance)
- Pre-Screen filter accuracy (are we cutting people we should have advanced, or advancing people we should have cut)
- Suppression detection accuracy (did suppressed candidates actually unlock in the new environment)

This calibration loop is what makes the hiring system improve over time. Without it, the same mistakes repeat.

### 5.4 Hiring Pipeline Analytics

Ongoing metrics tracked by Hiring Ops:

| Metric | Target | Purpose |
|---|---|---|
| Time to fill (by role type) | Mission-Critical: 45 days. Core: 30 days. Support: 21 days. | Identify bottlenecks |
| Candidates per open role | 5+ qualified per role | Measure sourcing effectiveness |
| Interview-to-offer ratio | 3:1 (3 interviews per offer) | Measure pre-screen effectiveness |
| Offer acceptance rate | 80%+ | Measure competitiveness |
| 90-day retention | 95%+ | Measure hiring accuracy |
| KR projection accuracy | +/-5 at 12 months | Measure evaluation accuracy |
| Interviewer calibration | Score within 0.5 of consensus | Identify miscalibrated interviewers |

### 5.5 Coaching Hire Close (Specific)

Coaching hires have additional close activities:
- Recruiting handoff: outgoing coach's recruiting relationships transitioned to new coach or preserved by AD
- Roster meeting: new coach meets current players within 72 hours of announcement
- System installation timeline: new coach provides practice plan framework within first 2 weeks
- Staff coordination: new coach meets existing staff (across all levels in the sport's pipeline) within first week
- Media introduction: press conference or institutional announcement within 48 hours

---

## 6. CONFIDENCE GATES (Hiring Ops)

### 6.1 Pre-Screen Confidence

| Data Available | Pre-Screen Confidence % |
|---|---|
| Resume only | 25-35% |
| Resume + LinkedIn + public web | 35-45% |
| Resume + public + coaching record (coaches) | 40-55% |

### 6.2 Interview Confidence

| Data Available | Interview Confidence % |
|---|---|
| Screen only completed | V1 + 3-5% |
| Screen + 1 deep interview | 45-55% |
| Full interview loop (no references) | 55-70% |
| Full loop + 3 references | 65-78% |
| Full loop + 5+ references | 70-82% |
| Full loop + references + work product | 78-88% |
| Full loop + references + work product + on-site | 85-95% |

### 6.3 Coaching Confidence Boosters

| Additional Data | Boost |
|---|---|
| Verified win/loss record | +3-5% |
| Verified recruiting classes | +2-3% |
| Player placement verification | +3-5% |
| Film session (observed coaching) | +5-8% |
| Practice observation (live) | +5-8% |

Cap: 97% (no hire can be evaluated with 100% confidence because humans are inherently unpredictable).

---

## 7. GOVERNANCE

- Hiring Ops is the process, not the evaluation. It gathers data and feeds File 01.
- All interviews follow structured protocols. No ad hoc interviews for scored positions.
- Interviewers score independently before debriefs. This is non-negotiable.
- Reference checks are scored, not just conducted.
- Offer construction follows the Compensation Intelligence framework (File 02 Section 8) and must pass internal equity check (File 03 Section 6).
- Post-hire audits are mandatory at 90 days. Calibration feedback loops into future hiring.
- Unsuccessful candidates are treated with respect. Relationships are preserved. Strong candidates are pooled for future roles.
- Coaching hires include mandatory sport-specific assessment components.
- Any change to interview structures, scoring rubrics, decision criteria, or process flow requires documentation, versioning, and approval.
- No em dashes in any output generated by this system.
