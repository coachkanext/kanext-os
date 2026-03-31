# Hiring Downstream Engines

KaNeXT Hiring Intelligence System - File 06

---

## 0. Purpose

The Hiring Downstream Engines are the final downstream consumers of the KaNeXT Hiring Intelligence System. They take everything the system knows about a candidate or employee - their evaluation, their component KRs, their system fit, their suppression profile, their risk flags - and translate it into actionable intelligence for onboarding, development, performance monitoring, retention, and succession.

These engines answer five questions for any hire in the system:
1. How do we onboard this person optimally? (Onboarding Intelligence)
2. Are they performing to projected level? (Performance Monitoring)
3. What do they need to grow? (Development Planning)
4. Are we going to lose them? (Retention Intelligence)
5. Who replaces them? (Succession Engine)

These engines do NOT evaluate candidates. They do NOT modify Candidate KR, Employee KR, component KRs, or any upstream output. They read governed truth and produce downstream recommendations only.

All outputs are deterministic: same inputs produce same outputs.

---

## 1. ONBOARDING INTELLIGENCE

### 1.1 Purpose

Generate a structured onboarding plan tailored to the specific candidate based on their evaluation profile. No two onboarding experiences should be identical because no two hires have the same strengths, gaps, and needs.

### 1.2 Inputs

Must pull from:
- Final Candidate KR and all component KRs (CKR, LKR, FKR, GKR)
- System Fit assessment (all five dimensions)
- Suppression assessment (if applicable)
- Risk flags (if any)
- Hiring Context (role, department, reporting line, institution)
- Department composition (from File 03)

### 1.3 30/60/90 Day Plan Generation

The onboarding plan is generated from the candidate's evaluation profile:

#### Day 1-30: Foundation

**Universal (all hires):**
- Administrative setup (KaNeXT OS onboarding, identity provisioning, system access, KayPay enrollment)
- Institutional orientation (mission, values, history, org structure, key stakeholders)
- Role-specific orientation (department structure, immediate responsibilities, tools and systems)
- Manager 1:1 cadence established (weekly minimum)
- Culture mentor assigned (separate from manager - a peer who helps navigate the informal organization)

**Customized based on evaluation:**

If FKR is below 80 (culture fit concerns):
- Extended institutional values immersion
- Additional 1:1s with culture mentor (twice weekly)
- Faith community integration (chapel attendance, campus ministry introduction)
- Explicit operating style alignment sessions with manager

If CKR gap exists in specific areas:
- Targeted training plan for competency gaps identified in evaluation
- Shadowing assignments with department experts in gap areas
- Self-study curriculum with milestones

If LKR is below 75 and role requires management:
- Leadership development track begins immediately
- Observation of institutional leadership meetings
- Management mentorship pairing with a senior leader outside their department

If Operating Style Fit is below 70 (institutional-to-startup transition):
- Explicit startup culture briefing (ambiguity tolerance, pace expectations, scope flexibility)
- Small wins framework (early deliverables that build confidence in the new environment)
- Weekly check-ins specifically about environment adjustment

#### Day 31-60: Ramp

**Universal:**
- First performance touchpoint (informal - how is it going, what's working, what's not)
- Cross-functional introductions (meet stakeholders in adjacent departments)
- First independent deliverable expected

**Customized based on evaluation:**

If GKR is 85+ (high growth trajectory):
- Accelerated scope expansion
- Early exposure to stretch assignments
- Leadership pipeline identification flagged

If Risk Flag (over-qualification) was triggered:
- Engagement check at Day 45 (is this person challenged enough)
- Discussion of growth pathway and expanded scope opportunities
- Ensure they see the 2-3 year vision for the role

If this is a coaching hire:
- System identity alignment check with varsity HC (are they installing compatible concepts)
- First recruiting territory assignment and initial outreach
- First player development session observed by varsity staff

#### Day 61-90: Performance

**Universal:**
- Formal 90-day performance review
- Employee KR computation (first post-hire evaluation)
- Manager assessment against hiring projection (is this hire performing to the KR we expected)
- Goal setting for the next quarter
- Onboarding completion flag

**Customized based on evaluation:**

If Suppression-Adjusted KR was higher than Raw KR (suppression candidate):
- Specific assessment of whether the new environment is unlocking suppressed capability
- Compare actual performance against suppression-adjusted projection
- Document evidence of environment-driven improvement (or lack thereof)

If Autonomy Level was borderline (60-70):
- Gradually increase independence with explicit milestones
- Manager confirms autonomy readiness before reducing supervision cadence

### 1.4 Onboarding Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Administrative completion | 100% by Day 7 | System access, benefits enrollment, policy acknowledgments |
| First deliverable shipped | By Day 45 | Defined by manager at onboarding start |
| Culture mentor check-in completion | 4+ sessions in 90 days | Logged in system |
| 90-day Employee KR vs Candidate KR | Within +/-5 points | Computed at Day 90 |
| Manager confidence rating | 7+/10 | Manager survey at Day 90 |
| Employee satisfaction | 7+/10 | New hire survey at Day 90 |

---

## 2. PERFORMANCE MONITORING

### 2.1 Purpose

Track Employee KR over time to assess whether hires are performing to projected level, improving, or declining. This is the hiring equivalent of tracking a basketball player's KR across seasons.

### 2.2 Inputs

Must pull from:
- Employee KR (computed at Day 90, then quarterly)
- Original Candidate KR (the projection at time of hire)
- Component KRs over time (CKR, LKR, FKR, GKR trajectory)
- Suppression-Adjusted KR (if applicable at hire)
- Performance review data (quarterly/annual)
- Manager feedback
- Peer feedback (if 360 review is active)

### 2.3 KR Tracking

Employee KR is recomputed quarterly based on:
- Ongoing performance review data
- New achievements, certifications, results
- Expanded scope or reduced scope
- Manager and peer feedback

KR Trajectory Categories:
- **Ascending:** KR has increased 3+ points since hire. This employee is growing into or beyond their role.
- **Stable:** KR is within +/-3 points of hire KR. Performing to projection.
- **Declining:** KR has decreased 3+ points since hire. Performance is below projection. Investigation required.

### 2.4 Projection Accuracy

Compare actual Employee KR at 6 months, 12 months, and 24 months against the original Candidate KR.

| Projection Accuracy | Interpretation |
|---|---|
| Actual within +/-5 of projected | Accurate evaluation. Hiring process worked. |
| Actual 5+ above projected | Undervalued at hire. Possible suppression was correctly identified. Or the environment is unlocking capability. |
| Actual 5+ below projected | Overvalued at hire. Evaluate: was the interview deceptive, was suppression misidentified, or is the environment not supporting the hire? |

Systematic projection inaccuracy across multiple hires indicates a flaw in the evaluation pipeline, not in individual candidates. If 30% of hires are underperforming projections, the evaluation system is miscalibrated.

### 2.5 Performance Alert Triggers

**Improvement Alert (positive):**
- Employee KR increases 5+ points in 6 months -> Promotion readiness assessment triggered
- CKR increases 10+ points -> Role expansion consideration
- GKR trajectory is 90+ -> Fast-track development pipeline

**Concern Alert (negative):**
- Employee KR decreases 5+ points in 6 months -> Manager intervention required
- FKR decreases below 65 -> Culture misalignment investigation
- LKR decreases while scope increases -> May be in over their head
- Multiple risk flags emerging post-hire -> Retention engine activated

---

## 3. DEVELOPMENT PLANNING

### 3.1 Purpose

Generate individualized development plans based on Employee KR profile, career goals, and institutional need. This is the hiring equivalent of the basketball Development Intelligence Engine.

### 3.2 Inputs

Must pull from:
- Employee KR and all component KRs
- Skill gap analysis for their department (from File 03)
- Succession depth chart (from File 03)
- Employee career goals (from performance review discussions)
- Role requirements for the next level up

### 3.3 Development Plan Structure

#### Gap Analysis

For each component KR, identify the gap between current score and the score required for the next level:

| Component | Current | Required for Next Level | Gap | Priority |
|---|---|---|---|---|
| CKR | 78 | 85 | -7 | High |
| LKR | 72 | 80 | -8 | High |
| FKR | 85 | 85 | 0 | Met |
| GKR | 82 | 80 | +2 | Met |

Priority is determined by: Gap size x Component weight for the target role.

#### Development Actions

For each gap, prescribe specific development actions:

**CKR Development:**
- Technical training (courses, certifications, conferences)
- Stretch assignments that require the missing competency
- Mentorship from a department expert in the gap area
- Self-study with structured milestones
- Cross-functional rotation (exposure to competency in another department)

**LKR Development:**
- Progressive management scope expansion (start with 1 direct report, grow to 3, then 5)
- Leadership development program (internal or external)
- Shadowing senior leaders
- Leading a cross-functional project
- Executive mentorship pairing

**FKR Development:**
- Culture immersion activities
- Community engagement (faith community, campus life, institutional events)
- Direct manager coaching on operating style alignment
- Peer group integration

**GKR Development:**
- This is harder to "develop" because it reflects intrinsic trajectory
- Exposure to new challenges and domains
- Feedback loops that accelerate self-awareness
- Career coaching and planning

#### Timeline

Each development action has:
- Start date
- Target completion date
- Expected KR impact (estimated lift per component)
- Checkpoint cadence (monthly for active development, quarterly for maintenance)

### 3.4 Coaching Staff Development (Specific)

For coaching staff, development planning includes sport-specific components:

- System mastery: Can they install and teach the full system at their level?
- Recruiting skill: Are they building relationships and closing recruits?
- Player development: Are athletes improving under their coaching?
- Compliance: Are they operating within rules?
- Communication: Are they effective with athletes, parents, administration?

Development pathway for assistant coaches targeting head coach roles:
1. Master their current role (CKR 85+ in all coaching-specific dimensions)
2. Take on expanded responsibilities (recruiting coordinator, defensive coordinator)
3. Lead a development-level team as HC (JV2 or Prep)
4. Demonstrate results at development level
5. Move to JV1 HC or Varsity associate HC
6. Ready for Varsity HC

This pipeline typically takes 3-5 years from entry-level assistant to HC readiness.

---

## 4. RETENTION INTELLIGENCE

### 4.1 Purpose

Identify employees at risk of leaving before they leave. Intervene early enough to retain valuable people. Accept that some departures are healthy and should not be prevented.

### 4.2 Flight Risk Model

Flight Risk is computed from multiple signals:

#### Compensation Signal
- Employee paid below 85th percentile of their KR-appropriate band: +15 flight risk points
- Employee paid below 75th percentile: +25 points
- Employee paid below market median for comparable roles: +30 points
- Employee recently learned about a pay disparity: +20 points

#### Engagement Signal
- Declining performance ratings: +15 points
- Reduced participation in institutional events: +10 points
- Increased PTO usage (especially Mondays/Fridays): +10 points
- Manager reports reduced engagement: +20 points
- Employee has not taken on new challenges in 12+ months: +10 points

#### Market Signal
- Employee's skill set is in high market demand: +15 points
- Employee has been contacted by recruiters (if known): +20 points
- Competitor institutions are hiring aggressively in employee's domain: +10 points

#### Tenure Signal
- Tenure at 18-24 months (peak departure window): +10 points
- Tenure at 3+ years with no promotion or scope expansion: +15 points

#### Event Signal
- Major life event (marriage, divorce, child, parent illness): +5 points
- Manager departure: +15 points
- Reorganization affecting their role: +15 points
- Passed over for promotion: +20 points

### 4.3 Flight Risk Tiers

| Risk Score | Tier | Action |
|---|---|---|
| 0-25 | Low Risk | No intervention needed. Continue standard engagement. |
| 26-50 | Moderate Risk | Manager should initiate career development conversation. Compensation check recommended. |
| 51-75 | High Risk | Senior leadership engagement. Retention offer evaluation. Career pathway discussion mandatory within 2 weeks. |
| 76-100 | Critical Risk | Immediate intervention. Retention package. Executive 1:1. Accept that departure may be inevitable and begin succession planning simultaneously. |

### 4.4 Retention Intervention Toolkit

**Compensation Adjustment:** Market rate correction, bonus, equity grant. Most effective when compensation is genuinely below market.

**Scope Expansion:** New responsibilities, new title, new challenges. Most effective for high-GKR employees who are bored.

**Career Pathway:** Explicit promotion timeline with milestones. Most effective for employees who feel stuck.

**Environmental Adjustment:** Manager change, department transfer, remote work flexibility, schedule modification. Most effective for FKR-driven departures.

**Mission Reconnection:** Institutional mission reminder, impact visibility, student/athlete success stories. Most effective for faith/mission-aligned employees who have lost sight of the "why."

### 4.5 Healthy Attrition

Not all departures should be prevented. The system identifies departures that are healthy for the institution:

- Employee KR below 65 with declining trajectory: Replacement will improve Department KR
- FKR below 60: Cultural misalignment that won't improve
- Over-qualified employee who was always going to leave: Accept and plan succession
- Employee whose growth has plateaued and role requires growth: Dignified transition

For healthy attrition cases, the system recommends: Begin succession planning, provide a respectful off-ramp, capture institutional knowledge before departure, maintain the relationship (alumni network).

---

## 5. SUCCESSION ENGINE

### 5.1 Purpose

Ensure institutional continuity by maintaining a ready succession plan for every mission-critical and high-impact role. This is the macro version of the depth chart in File 03.

### 5.2 Inputs

Must pull from:
- Employee KR and component KRs for all employees
- Role Type Legend for each position
- Department composition and Skill Gap Analysis (File 03)
- Development Plan status (Section 3 of this file)
- Flight Risk score (Section 4 of this file)

### 5.3 Succession Priority Matrix

Not every role needs a succession plan. Prioritize based on:

| Priority Factor | Weight |
|---|---|
| Role criticality tier | 40% |
| Incumbent flight risk score | 25% |
| Difficulty of external replacement (market scarcity for this role type) | 20% |
| Institutional knowledge concentration (does this person have knowledge that exists nowhere else) | 15% |

Roles scoring above 70 on this matrix MUST have an active succession plan. Roles scoring 50-69 SHOULD have a plan. Below 50 can be managed reactively.

### 5.4 Succession Plan Components

For each role requiring a succession plan:

**Immediate Successor (Ready Now):**
- Internal candidate who could step in within 2 weeks
- KR within 5 points of incumbent
- Gap analysis for any remaining development needed
- Interim authority plan (what decisions they can and cannot make immediately)

**Development Successor (Ready in 12-24 months):**
- Internal candidate on a development pathway toward the role
- Current KR, projected KR at readiness, development actions in progress
- Timeline to readiness with milestones

**Emergency Plan (No Internal Successor):**
- Interim leadership assignment (who covers the role temporarily)
- External search specifications (pre-written job description, pre-identified firms or networks)
- Knowledge preservation protocol (what institutional knowledge must be documented NOW, before a departure happens)

### 5.5 Coaching Succession (Specific)

Coaching succession has unique dynamics:

- **Varsity HC Succession:** The associate head coach or top assistant is the natural successor. If they are not HC-ready (KR below 80 on HC legend), an external search is required. HC succession must be planned 2+ years in advance because coaching searches mid-season are destructive.

- **Level Pipeline:** The JV1 HC is the succession candidate for Varsity HC. The JV2 HC is the succession candidate for JV1. The Prep HC is the succession candidate for JV2. This pipeline only works if system identity coherence is maintained (File 03 Section 9.3).

- **Recruiting Network Preservation:** When a coach leaves, their recruiting relationships may leave with them. The succession plan must identify which recruit relationships are held by the departing coach vs the institution, and assign relationship handoffs before departure.

- **Player Relationship Continuity:** Athletes are loyal to their coach. A coaching departure can trigger player transfers. The succession plan must include a player retention component (institutional leadership meets with team, successor coach builds relationships immediately).

### 5.6 Executive Succession (Specific)

Executive succession at an early-stage institution is uniquely high-stakes:

- The founder/CEO succession plan is the most important succession plan in the organization. It must exist even if it is "no one can replace the founder in Year 1-5" - the plan for that scenario is: what happens if the founder is incapacitated for 30/60/90 days.

- CFO succession must include access to all financial systems, banking relationships, fund management authority, and investor communication protocols.

- CTO succession must include code access, infrastructure credentials, vendor relationships, and architectural knowledge.

For all executive roles: The succession plan includes a "hit by a bus" document that captures everything someone would need to know on Day 1 in the role.

### 5.7 Annual Succession Review

Full succession plan review annually. Updated with:
- New hires who are succession candidates
- Development progress of existing candidates
- Changes in incumbent flight risk
- Departures that created gaps
- Market changes that affect external replacement difficulty

---

## 6. INSTITUTIONAL INTELLIGENCE DASHBOARD

### 6.1 Purpose

Surface the most important hiring intelligence metrics in a single view for the CEO and executive team.

### 6.2 Key Metrics

**Talent Quality:**
- Institutional KR (current, 90-day trend)
- Department KR by department (ranked)
- New hire KR average (are recent hires above or below institutional average)
- Highest KR employees (top 10 across institution)

**Hiring Velocity:**
- Open positions (count, by department, by urgency)
- Average time to fill (by role type)
- Offer acceptance rate
- Pipeline depth (candidates in evaluation per open position)

**Retention:**
- Institutional flight risk score (average across all employees)
- High-risk employees (names, roles, risk drivers)
- Departures in the last 90 days (voluntary vs involuntary, KR of departed employees)
- Regretted vs non-regretted attrition ratio

**Development:**
- Employees on active development plans (count, by department)
- Average KR change over 12 months (ascending, stable, declining distribution)
- Promotion rate (internal promotions as % of all role fills)

**Succession:**
- Mission-Critical roles without a Ready-Now successor (count, list)
- Succession coverage score (% of priority roles with active plans)

**Compensation:**
- Institutional compensation vs market position (percentile)
- Pay equity ratio (by department)
- Budget utilization (compensation spend vs budget)

**Athletic Department Specific:**
- Coaching staff KR by sport and level
- System identity coherence score by sport
- Recruiting network coverage map (geographic, international)
- Player development rate by coaching staff

---

## 7. GOVERNANCE

- Downstream engines consume upstream Employee KR and never modify it
- All outputs are deterministic: same inputs produce same outputs
- Retention intelligence surfaces risk but does not mandate action (leadership decides)
- Development plans are recommendations, not orders (manager and employee agree on execution)
- Succession plans are confidential (accessible only to R0 and R2 within the department)
- Performance monitoring is continuous but formal reviews are quarterly
- Any change to engine logic, triggers, thresholds, or scoring requires documentation, versioning, and approval
- No em dashes in any output generated by these engines
