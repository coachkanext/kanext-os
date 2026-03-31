# Candidate Comparison Engine

KaNeXT Hiring Intelligence System - File 04

---

## 0. Scope

This is the single authoritative document for head-to-head candidate comparison, finalist ranking, and hire recommendation modeling. It replaces ad hoc "who should we pick" discussions with a deterministic, auditable framework.

The Candidate Comparison Engine is the hiring equivalent of the basketball Simulation Engine. Where the Simulation Engine asks "if these two teams play, who wins," the Comparison Engine asks "if these candidates fill this role, who gives us the best outcome."

This engine does NOT evaluate candidates. It consumes finalized Candidate KR outputs from upstream (File 01) and produces comparative analysis and ranked recommendations.

All outputs are deterministic: same inputs produce same outputs.

---

## 1. Purpose

When a search produces 2-5 finalists for a role, leadership needs more than "this person scored 84 and that person scored 82." They need to know:

1. **Who gives us the most Department KR lift?** (immediate impact)
2. **Who fills the biggest skill gap?** (strategic value)
3. **Who has the highest ceiling?** (growth trajectory)
4. **Who carries the most risk?** (downside exposure)
5. **Who fits the system best?** (culture and operating alignment)
6. **What do we lose by picking one over the other?** (opportunity cost)

The Comparison Engine answers all six questions with governed, traceable math.

---

## 2. Inputs (Non-Negotiable)

### 2.1 Per Candidate (from File 01 Pipeline)

- Final Candidate KR
- KR Range (confidence interval)
- Confidence %
- Component KRs: CKR, LKR, FKR, GKR
- System Fit score and sub-dimension scores
- Suppression assessment (type, severity, uplift range) if applicable
- Suppression-Adjusted KR Range if applicable
- Risk flags (all triggered flags with severity)
- Phase 3 anchor range (transparency)
- Phase 6 raw (transparency)
- Data tier (V1/V2/V3)

### 2.2 Per Role (from Hiring Context)

- Role Type
- Department
- Criticality Tier
- Component KR weights for this role type (from File 02 Section 1.3)

### 2.3 Per Department (from File 03)

- Current Department KR
- Current Department Component KRs (CKR, LKR, FKR, GKR)
- Skill Gap Analysis (what competencies are missing)
- Succession depth chart position (is this role a succession gap)
- Department composition metrics

### 2.4 Coaching Hires Additional (from File 02 Section 5)

- Coaching Philosophy Alignment score
- System Identity assessment
- Recruiting Network Value score
- Player Development Track Record score
- Compliance History assessment
- Retention and Culture assessment
- System Identity Coherence impact (from File 03 Section 9.3)

---

## 3. COMPARISON FRAMEWORK

### 3.1 Six-Dimensional Comparison

Every finalist comparison produces scores across six dimensions. Each dimension answers one of the six core questions.

#### Dimension 1: Immediate Impact (Who lifts Department KR the most?)

Computation:

Projected_Dept_KR_With_Candidate = Recompute Department KR (File 03 Section 2) with the candidate's KR inserted at the role's criticality weight, replacing the current occupant (if backfill) or adding to headcount (if new position).

Impact_Delta = Projected_Dept_KR_With_Candidate - Current_Dept_KR

The candidate with the highest Impact_Delta provides the most immediate Department KR lift.

For new positions (no incumbent): Impact_Delta is the pure additive effect.
For backfills: Impact_Delta is the net change from swapping the incumbent's KR for the candidate's KR.

If the role being filled is currently vacant (departed, unfilled), use the department's current KR with the vacancy gap as baseline.

#### Dimension 2: Strategic Gap Fill (Who fills the biggest skill gap?)

Computation:

Pull the department's Skill Gap Analysis (File 03 Section 3). Identify the top 3 competency gaps by priority score.

For each candidate, assess how many of the top 3 gaps they address:

Gap_Coverage_Score = SUM(Candidate_CKR_in_gap_area x Gap_Priority_Weight) for each of the top 3 gaps

A candidate who addresses the #1 priority gap at CKR 85 is more valuable than one who addresses the #3 priority gap at CKR 90.

Scoring:
- Candidate addresses #1 gap at CKR 80+: +30 points
- Candidate addresses #1 gap at CKR 70-79: +20 points
- Candidate addresses #2 gap at CKR 80+: +20 points
- Candidate addresses #2 gap at CKR 70-79: +12 points
- Candidate addresses #3 gap at CKR 80+: +12 points
- Candidate addresses #3 gap at CKR 70-79: +8 points
- Candidate does not address any top-3 gap: 0 points

Maximum Gap_Coverage_Score: 62 points (addresses all three at 80+).

#### Dimension 3: Growth Ceiling (Who has the highest ceiling?)

Computation:

Growth_Ceiling = GKR + Suppression_Uplift_Midpoint (if applicable)

Where Suppression_Uplift_Midpoint = midpoint of the Suppression-Adjusted KR Range minus the Raw KR.

A candidate with GKR 88 and no suppression has a Growth Ceiling of 88.
A candidate with GKR 78 and a Suppression-Adjusted range of +8 to +12 has a Growth Ceiling of 78 + 10 = 88.

The Growth Ceiling captures both intrinsic growth trajectory AND environment-unlocked potential.

For coaching hires: Growth Ceiling also factors in the candidate's Player Development Track Record score, because a coach who develops players is likely to develop themselves.

Coaching_Growth_Ceiling = (GKR x 0.70) + (Player_Dev_Track_Record_Score x 0.30) + Suppression_Uplift_Midpoint

#### Dimension 4: Risk Profile (Who carries the most risk?)

Computation:

Risk_Score = SUM of all risk flag severity points

| Risk Flag | Severity Points |
|---|---|
| Job Hopping (lateral, no logic) | 15 |
| Job Hopping (with upward moves) | 0 |
| Termination for cause | 25 |
| Performance termination | 15 |
| Layoff/restructuring | 5 |
| Reference gaps (multiple) | 20 |
| Reference gaps (single, explained) | 5 |
| Compensation misalignment (150-175%) | 10 |
| Compensation misalignment (175%+) | 20 |
| Over-qualification (no clear motivation) | 15 |
| Over-qualification (clear motivation) | 3 |
| Under-qualification (closeable gap) | 10 |
| Under-qualification (structural gap) | 25 |

Additional risk factors:

| Factor | Points |
|---|---|
| Confidence % below 50% | +10 (low data = high uncertainty) |
| FKR below 70 | +10 (culture fit concern) |
| System Fit hard block triggered (any dimension) | +25 (near-disqualification) |
| Coaching: Compliance history (minor) | +10 |
| Coaching: Compliance history (major) | +25 |

Risk_Score is inverted for ranking: lower is better. The candidate with the LOWEST Risk_Score is the safest hire.

Risk tiers:
- 0-10: Low risk. Clean profile.
- 11-25: Moderate risk. Manageable concerns. Proceed with mitigation plan.
- 26-50: High risk. Significant concerns. Hire only if upside justifies the risk.
- 51+: Critical risk. Not recommended unless extraordinary circumstances.

#### Dimension 5: System Fit (Who fits the institutional culture best?)

Computation:

System_Fit_Score is pulled directly from the candidate's System Fit assessment (File 02 Section 4).

System_Fit_Composite = (Operating_Style x 0.25) + (Faith_Alignment x 0.20) + (Autonomy x 0.25) + (Pressure_Tolerance x 0.15) + (Multi_Role x 0.15)

For coaching hires, System Fit also includes System Identity Coherence impact:

Coaching_System_Fit = (System_Fit_Composite x 0.60) + (Coaching_Philosophy_Alignment x 0.25) + (System_Identity_Coherence_Impact x 0.15)

Where System_Identity_Coherence_Impact measures whether hiring this coach improves or degrades the sport's pipeline coherence (File 03 Section 9.3).

#### Dimension 6: Opportunity Cost (What do we lose by picking one over another?)

This is not a score - it is a narrative comparison computed for each finalist pair.

For each pair of finalists (A vs B):

Opportunity_Cost_A = "By hiring A instead of B, we gain [A's advantages] but lose [B's advantages]."

Specifically:
- Component KR deltas: "A's CKR is 7 points higher, but B's LKR is 12 points higher"
- Gap coverage delta: "A fills our #1 gap (admissions CRM expertise), B fills our #2 gap (digital marketing)"
- Risk delta: "A carries no risk flags, B has a compensation misalignment flag"
- Timeline delta: "A is available immediately, B needs 60-day notice period"
- Cost delta: "A's expected compensation is $15K above B's"

This is the section that prevents the trap of only looking at the top-line KR number.

---

## 4. COMPOSITE RANKING

### 4.1 Dimension Weights by Role Criticality

| Dimension | Mission-Critical | High-Impact | Core Staff | Support Staff |
|---|---|---|---|---|
| Immediate Impact | 25% | 30% | 35% | 40% |
| Strategic Gap Fill | 20% | 20% | 15% | 10% |
| Growth Ceiling | 15% | 15% | 20% | 20% |
| Risk Profile | 15% | 15% | 15% | 15% |
| System Fit | 25% | 20% | 15% | 15% |

Rationale:
- Mission-Critical roles weight System Fit highest because a misaligned executive or head coach is catastrophic regardless of competency. Immediate Impact and Gap Fill are balanced.
- High-Impact roles weight Immediate Impact slightly higher because these roles need to perform now.
- Core Staff weights Immediate Impact highest because these are execution roles.
- Support Staff weights Immediate Impact highest because the role is defined and the need is concrete.

### 4.2 Composite Score Computation

For each candidate:

Normalize each dimension to 0-100 scale:
- Immediate Impact: (Candidate_Impact_Delta / Max_Impact_Delta_Among_Finalists) x 100
- Strategic Gap Fill: (Candidate_Gap_Score / 62) x 100
- Growth Ceiling: Direct score (already 0-100 scale)
- Risk Profile: ((100 - Risk_Score) / 100) x 100 (inverted: lower risk = higher score)
- System Fit: Direct score (already 0-100 scale)

Composite_Score = SUM(Normalized_Dimension_i x Dimension_Weight_i)

### 4.3 Ranking Output

Finalists ranked by Composite_Score, with:
- Rank
- Candidate name
- Composite Score
- Raw Candidate KR
- Each dimension score
- Confidence % (lower confidence = wider uncertainty band around the ranking)
- Key differentiator (one sentence: what makes this candidate uniquely valuable)
- Key risk (one sentence: the primary concern)

---

## 5. COACHING HIRE COMPARISON (SPECIFIC)

### 5.1 Additional Dimensions for Coaching Comparisons

When comparing coaching candidates, the six standard dimensions are supplemented with sport-specific analysis:

#### Recruiting Network Complementarity

Assessment: Does this candidate's recruiting network overlap with existing staff, or does it open new territory?

Overlap_Score = Percentage of the candidate's primary recruiting territory that is already covered by current coaching staff.

- Overlap below 30%: High complementarity. This candidate opens new territory. +15 bonus points to Strategic Gap Fill.
- Overlap 30-60%: Moderate complementarity. Some new territory. +5 bonus points.
- Overlap above 60%: Low complementarity. Redundant network. No bonus. Flag for consideration.

#### Pipeline Coherence Impact

Assessment: Does hiring this candidate improve or degrade the sport's developmental pipeline?

Evaluated against File 03 Section 9.3 (System Identity Coherence).

If the candidate's system identity is compatible with the varsity HC's system:
- Pipeline coherence maintained or improved. No penalty.

If the candidate's system identity conflicts with the varsity HC's system:
- Pipeline coherence degraded. -10 to -20 points on System Fit dimension depending on severity.
- This is particularly damaging for development-level hires (JV2, Prep) because athletes trained in a conflicting system must unlearn before they can advance.

#### Multi-Sport Coaching Comparison

When hiring head coaches across multiple sports simultaneously (as KaNeXT will in Year 1), the Comparison Engine can run cross-sport analysis:

- Which coaching hires collectively provide the best institutional recruiting network coverage?
- Which combination of hires produces the best aggregate athletic department KR?
- Are there hires whose recruiting territories overlap excessively, creating redundancy?

This requires running the Comparison Engine for each sport independently, then aggregating results at the athletic department level.

---

## 6. SCENARIO MODELING

### 6.1 Purpose

Beyond ranking finalists for a single role, the Comparison Engine can model scenarios for complex hiring decisions.

### 6.2 Scenario Types

#### Single Role, Multiple Finalists (Standard)
- 2-5 candidates for one role
- Produce ranked recommendation
- This is the default mode

#### Multiple Roles, Candidate Pool
- Multiple open positions, candidate pool larger than the number of roles
- Some candidates may be viable for more than one role
- The engine models optimal candidate-to-role assignment to maximize total Department KR lift

Computation: For each candidate x role combination, compute Immediate Impact. Find the assignment matrix that maximizes total Impact_Delta across all roles.

Constraint: Each candidate can only fill one role. A candidate who is viable for both the HC and the Associate HC cannot be assigned to both.

This is the "draft optimization" problem. It answers: "Given these 8 candidates and these 3 open roles, which assignment gives us the best team?"

#### Hire Now vs Wait
- One finalist is available now; a stronger candidate may become available in 30/60/90 days
- Model the cost of the vacancy during the wait period
- Model the KR difference between the available candidate and the projected future candidate
- Produce a recommendation: hire now or wait

Vacancy Cost estimation:
- Department KR decline during vacancy (functions handled by overloaded existing staff, quality degrades)
- Recruitment pipeline stall (for coaching hires: every day without a coach is a day without recruiting)
- Institutional momentum loss (for executive hires: decisions delayed, strategy paused)

Break-Even Analysis: How much better does the future candidate need to be to justify the vacancy cost?

If Future_Candidate_KR - Available_Candidate_KR > Vacancy_Cost_in_KR_equivalent: Wait.
Otherwise: Hire now.

#### Succession Promotion vs External Hire
- Internal succession candidate is ready (or nearly ready)
- External candidate is stronger on paper
- Model the cost of passing over the internal candidate (morale impact, flight risk increase, succession plan reset) vs the KR benefit of the external hire

Internal Candidate Advantages (not captured in KR):
- Institutional knowledge (already knows the systems, people, culture)
- Cultural continuity (no onboarding friction)
- Signal to organization (promotes from within, investment in development is rewarded)
- Succession plan preserved (promotes the next person up, maintains the depth chart)

External Candidate Advantages (captured in KR):
- Higher raw competency (if true)
- Fresh perspective (no institutional blind spots)
- New network (especially valuable for coaching hires - new recruiting territory)

The engine surfaces both sides. It does not make the decision - leadership does. But it ensures the decision is informed.

---

## 7. INTERACTION TABLES

### 7.1 Purpose

The basketball Simulation Engine uses interaction tables (System x System, Archetype x System) to model how identities clash. The Hiring Comparison Engine uses a parallel concept: how do different candidate profiles interact with different departmental environments?

### 7.2 Candidate Profile x Department Environment Interactions

| Candidate Profile | High-Autonomy Dept | High-Structure Dept | High-Growth Dept | Stable Dept |
|---|---|---|---|---|
| High CKR, High LKR, High FKR | +5 impact (can lead anywhere) | +3 impact (may be constrained) | +5 impact (can build) | +2 impact (may be bored) |
| High CKR, Low LKR, High FKR | +3 impact (executes, needs direction) | +5 impact (thrives with structure) | +2 impact (limited leadership bandwidth) | +4 impact (stable producer) |
| High CKR, High LKR, Low FKR | +2 impact (friction risk) | +1 impact (will clash with structure) | +3 impact (may reshape culture, risky) | -1 impact (misaligned, retention risk) |
| High GKR, Low CKR (developing) | +2 impact (grows fast in open env) | +3 impact (structure accelerates growth) | +4 impact (grows with the department) | +1 impact (slow environment limits growth) |
| Suppression Candidate (high uplift) | +5 impact (new environment unlocks potential) | +3 impact (depends on suppression type) | +5 impact (ideal environment for upside) | +1 impact (may re-suppress in static env) |

These interaction modifiers adjust the Immediate Impact dimension by +/- the indicated points. They capture the reality that the same candidate performs differently in different environments.

### 7.3 Coaching Philosophy Interaction Table

| Candidate's Offensive System | Program's Desired Offensive System | Compatibility |
|---|---|---|
| Same system | Same system | Perfect (+10 System Fit) |
| Same family (e.g., both motion-based) | Different variant within family | High (+5 System Fit) |
| Compatible principles (e.g., pace-oriented + spacing-oriented) | Related but distinct | Moderate (+0 System Fit) |
| Different family (e.g., post-centric coach + spread program) | Conflicting identity | Low (-10 System Fit) |
| Candidate is system-flexible (has run multiple systems successfully) | Any | Adaptable (+3 System Fit) |

Same table applies to defensive system alignment.

For basketball hires specifically: Use the 12 offensive systems and 10 defensive systems from the basketball intelligence SKILL.md as the authoritative compatibility reference.

---

## 8. OUTPUT FORMAT

### 8.1 Comparison Report Structure

**Header:**
- Role title, department, institution
- Number of finalists compared
- Data tier summary (V1/V2/V3 per candidate)
- Comparison date

**Section 1: Rankings Table**

| Rank | Candidate | Composite | KR | CKR | LKR | FKR | GKR | Conf% | Risk |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [Name] | 87.3 | 86 | 88 | 84 | 85 | 82 | 72% | Low |
| 2 | [Name] | 83.1 | 84 | 90 | 78 | 80 | 86 | 68% | Mod |
| 3 | [Name] | 79.6 | 82 | 82 | 80 | 75 | 78 | 75% | Low |

**Section 2: Dimension Breakdown**

Per dimension: who ranks #1 and why, who ranks last and why.

**Section 3: Head-to-Head Comparisons**

For each finalist pair: Opportunity Cost analysis. What you gain and lose with each choice.

**Section 4: Recommendation**

Primary recommendation with justification (2-3 sentences).
Alternative recommendation with conditions ("If budget is constrained, Candidate B offers 90% of the value at 75% of the cost").
Risk advisory ("The primary risk with the top-ranked candidate is X. Mitigation: Y.").

**Section 5: Coaching-Specific (if applicable)**

Recruiting network complementarity analysis.
Pipeline coherence impact.
System identity compatibility matrix.

**Footer:**
- Confidence disclosure: "This comparison is based on V[X] data. Confidence ranges from [low]% to [high]% across finalists. Rankings may shift with additional data."
- Audit trail: all inputs sourced and traceable.

---

## 9. BATCH COMPARISON MODE

### 9.1 Purpose

When KaNeXT is hiring 100+ coaches across 13 sports and 4 levels in Year 1, individual comparisons are insufficient. Batch mode runs the Comparison Engine across all open coaching positions simultaneously to optimize the entire athletic department.

### 9.2 Method

1. Input: All open coaching positions + all finalist candidates across all sports
2. For each candidate x position combination: compute Composite Score
3. Run assignment optimization: maximize total Athletic Department KR
4. Constraint: each candidate fills one role only
5. Constraint: system identity coherence within each sport's pipeline
6. Constraint: recruiting network coverage across the institution (minimize overlap, maximize territory)

Output: Recommended assignment matrix with total projected Athletic Department KR, recruiting network coverage map, and system identity coherence scores per sport.

### 9.3 Limitations

Batch mode is computationally intensive and depends on all candidates being evaluated at the same data tier. In practice, some candidates will be at V1 and others at V3. The batch output should be re-run as data tiers improve.

Batch mode recommendations are advisory. It may recommend assigning a strong candidate to a lower-level position (JV2 HC instead of Varsity assistant) because the Department KR math shows greater total impact there. Leadership may override this for retention or development reasons. The engine surfaces the math; humans make the call.

---

## 10. GOVERNANCE

- The Comparison Engine consumes upstream Candidate KR and never modifies it
- All computations are deterministic: same inputs produce same outputs
- Composite Score weights are locked by role criticality tier (Section 4.1)
- Interaction table modifiers are bounded (+/-10 points maximum)
- Scenario modeling produces recommendations, not mandates
- Batch mode is advisory; leadership retains override authority
- Every comparison report includes confidence disclosure and audit trail
- Any change to dimension weights, interaction tables, or scoring methods requires documentation, versioning, and approval
- No em dashes in any output generated by this engine
