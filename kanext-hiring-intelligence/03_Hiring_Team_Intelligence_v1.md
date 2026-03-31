# Hiring Team Intelligence

KaNeXT Hiring Intelligence System - File 03

---

## 0. Scope

This is the single authoritative document for Department KR computation, skill gap analysis, succession planning, compensation equity, and organizational intelligence. It is the hiring equivalent of Team Intelligence (File 03) in the basketball system.

Department KR is the rotation-weighted aggregation of individual Employee KRs within a department, division, or function. It does not evaluate individuals. It consumes finalized employee outputs from upstream.

---

## 1. Inputs (Non-Negotiable)

Department KR consumes only:

Per employee in department:
- Final Candidate KR (from hiring evaluation, becomes Employee KR after hire)
- Component KRs: CKR, LKR, FKR, GKR
- Role type
- Role criticality tier (Mission-Critical, High-Impact, Core Staff, Support Staff)
- Time in role (months)
- Performance rating (if available from performance review cycle)
- Compensation data (base, total comp, pay band position)

Per department (from Hiring Context):
- Department name and function
- Institution (FMU, KaNeXT corporate, future mandate school)
- Department head
- Headcount (current and target)
- Budget (current and target)
- Strategic priority level (1-5, set by CEO/executive team)

Explicit exclusions (locked):
- No individual re-evaluation (Employee KR is upstream truth)
- No component KR recomputation
- No suppression re-assessment
- No compensation modification

---

## 2. DEPARTMENT KR COMPUTATION

### 2.1 Participation Threshold

All active employees in the department are included. No minimum tenure threshold for inclusion - even a Day 1 hire is part of the department composition.

However, employees with less than 90 days in role carry a Provisional flag. Their KR is included in Department KR math but their confidence contributes a discount to overall department confidence.

### 2.2 Role Criticality Weighting

Not all roles contribute equally to department effectiveness. A department with one elite leader and four average support staff should score differently than a department with five average staff.

| Criticality Tier | Weight Multiplier |
|---|---|
| Mission-Critical | 2.0 |
| High-Impact | 1.5 |
| Core Staff | 1.0 |
| Support Staff | 0.7 |

### 2.3 Computation

Department KR (Raw) = SUM(Employee_KR_i x Criticality_Weight_i) / SUM(Criticality_Weight_i)

This is a weighted average where mission-critical roles pull harder on the department score.

### 2.4 Department Component KRs

In addition to the aggregate Department KR, compute department-level component averages:

- Department CKR: Weighted average of all employee CKRs (how technically competent is this department)
- Department LKR: Weighted average of all employee LKRs (how much leadership capacity exists)
- Department FKR: Weighted average of all employee FKRs (how culturally aligned is this department)
- Department GKR: Weighted average of all employee GKRs (what is the growth trajectory of this department)

These reveal whether a department's overall KR is driven by competency, leadership, fit, or growth - and where the gaps are.

### 2.5 Department KR Legend

| Department KR Range | Tier Label | Description |
|---|---|---|
| 90-100 | Elite Department | Top-tier talent across all roles. Strong leadership. Deep bench. Culture is self-sustaining. This department can operate autonomously and deliver consistently. |
| 85-89 | Strong Department | High-quality team with clear leadership. Minor gaps may exist in one or two positions. Overall execution is reliable and improving. |
| 80-84 | Solid Department | Competent team that delivers. Some roles are below standard. Leadership is present but may lack depth. Department needs investment in 1-2 key hires. |
| 75-79 | Developing Department | Mixed quality. Some strong performers carrying weaker ones. Leadership may be stretched thin. Significant hiring or development needed. |
| 70-74 | Below Standard | Multiple capability gaps. Leadership is insufficient or absent. Department cannot reliably deliver its mandate without intervention. Priority hiring required. |
| Below 70 | Critical | Department is non-functional or near non-functional. Rebuilding required. May need new leadership before individual hires can be effective. |

---

## 3. SKILL GAP ANALYSIS

### 3.1 Purpose

Skill Gap Analysis identifies what competencies are missing from a department and prioritizes hiring to fill those gaps. It is the hiring equivalent of roster construction intelligence in basketball.

### 3.2 Method

**Step 1: Define Required Competency Profile**

For each department, define the competency profile that a fully-staffed, high-performing department requires. This is the "ideal roster."

Example - FMU Admissions Department (target: 12 staff):
- 1 Director of Enrollment (Mission-Critical): CRM mastery, funnel optimization, yield management, financial aid packaging, data analytics, team leadership
- 2 Regional Recruiters (High-Impact): Territory management, relationship building, event planning, CRM proficiency, communication
- 2 Digital Marketing/Enrollment Specialists (High-Impact): Digital advertising, content creation, social media, email marketing, analytics
- 1 Financial Aid Specialist (Core Staff): FAFSA processing (when available), institutional aid packaging, compliance, student counseling
- 2 Enrollment Counselors (Core Staff): Student advising, application processing, campus tours, follow-up communication
- 1 Data Analyst (Core Staff): CRM reporting, funnel analytics, enrollment forecasting, dashboard creation
- 1 International Admissions Specialist (Core Staff): International student recruitment, visa/immigration knowledge, credential evaluation
- 2 Administrative Support (Support Staff): Scheduling, correspondence, data entry, event logistics

**Step 2: Map Current Employees Against Required Profile**

For each required competency, identify which current employees cover it and at what level (strong, adequate, gap).

**Step 3: Identify Gaps**

Gaps fall into three categories:

- **Headcount Gap:** Position does not exist. No one is covering this function.
- **Competency Gap:** Position is filled but the employee's CKR in the required area is below 70 (the minimum for "adequate" in most legends).
- **Depth Gap:** Position is filled by one person with no backup. If they leave, the competency disappears.

**Step 4: Prioritize Gaps**

Priority scoring:

| Factor | Weight |
|---|---|
| Criticality of the missing competency (1-5 scale) | 40% |
| Impact on Department KR if filled (estimated KR lift) | 30% |
| Urgency (is something failing NOW because of this gap) | 20% |
| Availability of market candidates (can we fill this quickly) | 10% |

Output: Ranked list of hiring priorities with estimated Department KR impact per hire.

---

## 4. ROLE REDUNDANCY DETECTION

### 4.1 Purpose

Identify roles where multiple employees cover the same competency without adding incremental value. This is not about eliminating jobs - it is about ensuring every role adds unique capability.

### 4.2 Method

For each competency in the Required Competency Profile, count the number of employees who score 70+ CKR in that area.

- 0 coverage: Gap (see Section 3)
- 1 coverage: Single point of failure (see Succession, Section 5)
- 2 coverage: Healthy depth
- 3+ coverage: Potential redundancy (investigate whether all three are needed)

Redundancy does NOT automatically mean a role should be eliminated. It means the department should evaluate whether the headcount could be redeployed to fill an open gap elsewhere.

---

## 5. SUCCESSION DEPTH CHART

### 5.1 Purpose

For every mission-critical and high-impact role, identify who replaces the incumbent if they leave. This is the organizational equivalent of a basketball team's depth chart.

### 5.2 Structure

For each key role:

| Position | Incumbent | KR | Ready-Now Successor | Successor KR | Gap | Development Needed |
|---|---|---|---|---|---|---|
| Director of Enrollment | [Name] | 87 | [Name] - Regional Recruiter | 79 | -8 | Yield management, financial aid, team leadership |
| Head Basketball Coach | [Name] | 91 | [Name] - Associate HC | 84 | -7 | HC decision-making, media relations, donor cultivation |
| CFO | [Name] | 89 | None identified | - | Critical | External search required |

### 5.3 Succession Readiness Tiers

- **Ready Now:** Successor KR is within 5 points of incumbent. Could step in immediately with minimal disruption.
- **Ready in 1-2 Years:** Successor KR is 6-10 points below incumbent. Needs development but trajectory is clear.
- **Not Ready / No Successor:** Gap exceeds 10 points or no internal candidate exists. This is an organizational risk.

### 5.4 Succession Risk Score

Department Succession Risk = (Number of Mission-Critical roles with no Ready-Now successor) / (Total Mission-Critical roles)

- 0.00-0.10: Low risk. Succession coverage is strong.
- 0.11-0.25: Moderate risk. 1-2 key roles lack coverage.
- 0.26-0.50: High risk. Multiple critical roles have no succession plan.
- 0.50+: Critical. Department continuity is at risk.

---

## 6. COMPENSATION EQUITY ANALYSIS

### 6.1 Purpose

Ensure compensation is fair and consistent within departments. Identify pay inequities before they become retention risks.

### 6.2 Method

**Step 1: Band Mapping**

Map each employee's total compensation against the pay band for their role type, experience level, and market.

- At band (90-110% of midpoint): Normal
- Below band (below 90% of midpoint): Underpaid - retention risk
- Above band (above 110% of midpoint): Overpaid - investigate justification

**Step 2: Equity Ratio Check**

Within each department, for employees in the same role type and experience band:

Equity Ratio = Highest Paid / Lowest Paid

- Ratio below 1.15: Equitable
- Ratio 1.15-1.30: Investigate - may be justified by performance differential, may be inequity
- Ratio above 1.30: Red flag - requires immediate review and justification

**Step 3: KR-to-Comp Correlation**

Plot Employee KR against total compensation within the department. In a well-managed department, higher KR should correlate with higher compensation.

If a low-KR employee is paid more than a high-KR employee in the same role type: flag for review. Either the KR is wrong (re-evaluate) or the compensation is wrong (adjust).

**Step 4: Market Check**

Compare department compensation against market data (from Compensation Intelligence, File 02 Section 8).

- Departments paid below 25th percentile market-wide: Retention risk. Expect turnover.
- Departments paid above 75th percentile market-wide: Investigate value. Are we overpaying for the talent quality?

---

## 7. DIVERSITY AND COMPOSITION METRICS

### 7.1 Purpose

Track department composition across dimensions relevant to institutional goals. This is not quota-based - it is visibility-based. The intelligence surface shows composition so leadership can make informed decisions.

### 7.2 Tracked Dimensions

- Role type distribution (are we top-heavy, bottom-heavy, or balanced)
- Tenure distribution (new hires vs veterans - too much of either is a risk)
- KR distribution (is the talent concentrated in a few people or distributed)
- Career stage distribution (entry, mid, senior, late - balanced departments have a pipeline)
- Internal promotion rate (are we developing people or always hiring externally)

### 7.3 Healthy Composition Benchmarks

These are guidelines, not mandates:

- Tenure: No more than 40% of department hired in the last 12 months (culture stability). No more than 30% with 5+ years (prevent stagnation).
- KR distribution: Standard deviation of Employee KRs within a department should be below 12 points. High standard deviation means talent is concentrated (one star, many average) - which is fragile.
- Career stage: At least 20% entry/early-career (pipeline), at least 30% mid-career (execution), at least 20% senior (leadership and mentorship).

---

## 8. ORGANIZATIONAL INTELLIGENCE

### 8.1 Purpose

Cross-department analysis that surfaces institutional-level patterns.

### 8.2 Institutional KR

Institutional KR = Weighted average of all Department KRs, weighted by department strategic priority.

| Strategic Priority | Weight |
|---|---|
| Priority 1 (Athletics, Enrollment, Technology) | 2.0 |
| Priority 2 (Academic Affairs, Campus Operations) | 1.5 |
| Priority 3 (Finance, HR, Marketing) | 1.2 |
| Priority 4 (Administrative, Support Functions) | 1.0 |

Institutional KR is a single number that represents the overall talent quality of the institution.

### 8.3 Cross-Department Analysis

**Strongest/Weakest Department:** Rank all departments by Department KR. The weakest department is the institution's bottleneck.

**Component KR Heatmap:** Show CKR/LKR/FKR/GKR across all departments. Reveals institutional patterns:
- Low CKR institution-wide: Competency problem. Hiring standards are too low.
- Low LKR institution-wide: Leadership vacuum. Need to invest in management development.
- Low FKR institution-wide: Culture problem. Either the culture is undefined or it's not being selected for.
- Low GKR institution-wide: Stagnation. The workforce is not growing. Need fresh talent.

**Integration Load:** Track how many new hires are in the first 90 days across the institution. Too many simultaneous new hires overwhelm management capacity and dilute culture.

Maximum recommended integration load: No department should have more than 30% of its staff in the first 90 days simultaneously (unless the department is brand new).

Institutional integration load: No more than 20% of total institutional staff in the first 90 days simultaneously.

### 8.4 Reporting Cadence

- Weekly: New hire tracking, integration load, immediate risk flags
- Monthly: Department KR updates, skill gap status, succession depth chart
- Quarterly: Full organizational intelligence report (Institutional KR, cross-department analysis, compensation equity, composition metrics)
- Annually: Strategic workforce planning (projected headcount, projected Department KR targets, compensation market refresh)

---

## 9. ATHLETIC DEPARTMENT SPECIFIC

### 9.1 Purpose

The athletic department at FMU is the single largest hiring operation: 13 sports x up to 4 levels = up to 52 teams. Each team needs a head coach and 1-3 assistant coaches. This is 100-200+ coaching hires.

### 9.2 Athletic Department KR

Athletic Department KR is computed with sport-level weighting:

| Sport Category | Weight |
|---|---|
| Revenue Sports (Football, Men's Basketball, Women's Basketball) | 2.0 |
| Olympic Sports (Soccer, Volleyball, Track, Baseball, Softball, etc.) | 1.0 |
| Emerging Sports (Beach Volleyball, Flag Football, Cheer) | 0.8 |

Within each sport, level weighting:

| Level | Weight |
|---|---|
| Varsity | 2.0 |
| JV1 (National Development) | 1.2 |
| JV2 (Association Development) | 0.8 |
| Prep Academy | 0.6 |

### 9.3 System Identity Coherence

Within each sport, the coaching staffs across all four levels must share a coherent system identity. The Prep Academy coach and the Varsity coach must run compatible systems so player development transfers seamlessly across levels.

System Identity Coherence Score (per sport): Assess whether all coaching staffs in the pipeline run compatible offensive and defensive systems.

- 95-100%: Perfect alignment. Same core system across all levels. Player transition is seamless.
- 85-94%: High alignment. Minor variations across levels (simplified version at Prep, full version at Varsity). Transition is smooth.
- 70-84%: Moderate alignment. Different systems but compatible principles. Players need adjustment time when advancing.
- Below 70%: Misaligned. Players trained in one system at Prep must learn a different system at Varsity. Development inefficiency.

This directly informs coaching hiring: when filling a JV2 head coach position, the candidate's system identity must be evaluated against the Varsity head coach's system identity. A mismatch is a disqualifying factor unless the candidate demonstrates adaptability.

### 9.4 Recruiting Network Coverage Map

Aggregate all coaching staff recruiting networks to create an institutional Recruiting Network Coverage Map:

- Domestic: Map recruiting territory coverage by state/region. Identify blind spots (no coaching staff has contacts in a high-talent region).
- International: Map international pipeline access by country/region. Critical for KaNeXT's global recruiting strategy.
- Level: Map contacts by competitive level (HS, club/AAU, prep, JUCO, portal).

Gaps in the coverage map directly inform coaching hiring priorities. If no current coach has West African contacts and that's a strategic recruiting market, the next assistant coach hire should prioritize candidates with West African pipeline access.

---

## 10. GOVERNANCE

- Department KR consumes upstream Employee KR and never modifies it
- All computations are deterministic: same inputs produce same outputs
- Compensation equity analysis is advisory, not prescriptive (it surfaces data, leadership makes decisions)
- Succession planning is updated with every hire, departure, or promotion
- Skill gap analysis is refreshed quarterly or triggered by any departure
- Athletic department system identity coherence is evaluated with every coaching hire
- Any change to computation weights, legend tiers, or analysis methods requires documentation, versioning, and approval
