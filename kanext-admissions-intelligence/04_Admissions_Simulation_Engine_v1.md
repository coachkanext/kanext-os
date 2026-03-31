# ADMISSIONS SIMULATION ENGINE
## v1.0 - Enrollment Scenario Modeling & Outcome Projection

---

# SIMULATION ENGINE

## 0. Scope
This is the single authoritative document for enrollment simulation. It replaces ad hoc spreadsheet modeling, gut-feel enrollment projections, and disconnected financial aid scenario planning.

The Simulation Engine takes governed truth from upstream (Student KRs, Class Intelligence, System Fit, Retention Risk, Financial Aid parameters) and projects outcomes under different scenarios. It answers: "If we change X, what happens to enrollment, revenue, retention, and class quality?"

The engine does NOT evaluate students. It does NOT modify Student KR, Class KR, or any upstream output. It consumes truth and produces projections only.

All outputs are deterministic: same inputs and same scenario parameters produce the same projections every time.

### Governance
- All input values MUST match the locked upstream outputs exactly. No rounding, no manual override.
- Scenario parameters are defined by the user (admissions leadership, CFO, enrollment manager). The engine does not choose scenarios.
- Projections are directional, not precise. Every projection includes a confidence range.
- The engine never recommends. It projects. Humans decide.

---

# PART 1: ENROLLMENT SCENARIO LIBRARY

## Purpose
The Enrollment Scenario Library defines the standard scenario types the engine can run. Each scenario has defined inputs, a simulation method, and defined outputs. Custom scenarios can be built by combining scenario types.

---

## SCENARIO TYPE 1: ADMIT VOLUME ADJUSTMENT

### Question Answered
"What happens if we admit more (or fewer) students?"

### Inputs
- Current admit pool (all admitted students with Student KR, System Fit, yield probability, financial aid offer)
- Proposed adjustment: +/- N admits, with KR profile of the additional or removed admits
- Institutional constraints (capacity, faculty load, housing, financial aid budget)

### Simulation Method
1. Start with the current admit pool and its projected yield.
2. Add or remove the specified students from the pool.
3. For added students: assign yield probability based on their KR, System Fit, and financial aid offer using the yield sensitivity model (from File 03).
4. Recompute: projected enrolled class size, projected Class KR, projected revenue, projected retention risk distribution, projected financial aid spend.
5. Compare to baseline (current admit pool without adjustment).

### Outputs
| Metric | Baseline | Scenario | Delta |
|--------|----------|----------|-------|
| Admitted students | | | |
| Projected enrolled (yield) | | | |
| Projected Class KR | | | |
| Net tuition revenue | | | |
| Financial aid spend | | | |
| Tuition discount rate | | | |
| % students in High/Critical retention risk | | | |
| Projected Year 1 retention rate | | | |

### Confidence
Confidence on yield projection is lower for hypothetical admits (no real engagement signal data). Confidence range widens by 5-10% for hypothetical students vs real admits.

---

## SCENARIO TYPE 2: FINANCIAL AID REALLOCATION

### Question Answered
"What happens if we redistribute our financial aid budget differently?"

### Inputs
- Current aid allocation (per-student aid offers for all admitted/enrolled students)
- Proposed reallocation: change in merit/need split, change in total budget, targeted aid to specific KR tiers or programs, across-the-board increase/decrease
- Yield sensitivity model (from File 03)
- Retention sensitivity model (from File 06)

### Simulation Method
1. Start with current aid allocation and its projected yield/retention.
2. Apply the proposed reallocation to each student's aid package.
3. Recompute yield probability for each prospective student using yield sensitivity.
4. Recompute retention probability for each enrolled student using retention sensitivity.
5. Aggregate to class-level: projected enrollment, projected retention, projected net revenue.
6. Check constraint satisfaction: total aid within budget? Endowed scholarship criteria met? Federal compliance maintained?

### Outputs
| Metric | Baseline | Scenario | Delta |
|--------|----------|----------|-------|
| Total aid spend | | | |
| Merit aid spend | | | |
| Need-based aid spend | | | |
| Projected yield rate | | | |
| Projected enrolled class size | | | |
| Projected Class KR | | | |
| Net tuition revenue | | | |
| Tuition discount rate | | | |
| Projected Year 1 retention rate | | | |
| Constraint violations | None | [Any?] | |

### Sub-Scenarios (Pre-Built)
The engine includes pre-built sub-scenarios for common reallocation questions:

**2A: Merit Shift.** Move X% of budget from need-based to merit-based (or vice versa).
**2B: Top-Load.** Concentrate aid on the top N students by KR to maximize yield of the strongest admits.
**2C: Spread Thin.** Distribute aid more evenly across all admits to maximize total yield volume.
**2D: Program Target.** Allocate additional aid to students in a specific program to fill enrollment gaps.
**2E: Retention Reinvestment.** Redirect aid from prospective students to enrolled students at high retention risk.
**2F: Discount Rate Target.** Find the aid allocation that achieves a specific tuition discount rate while maximizing yield.

---

## SCENARIO TYPE 3: TUITION PRICING ADJUSTMENT

### Question Answered
"What happens if we change tuition?"

### Inputs
- Current tuition rate (per credit and/or flat rate)
- Proposed adjustment: +/- X% or +/- $X per credit
- Price elasticity estimates by student segment (in-state, out-of-state, online, graduate)
- Current aid structure (does aid adjust with tuition?)

### Simulation Method
1. Compute new cost of attendance under proposed tuition.
2. If aid does not adjust: financial gap increases for all students by the tuition increase amount. Recompute yield and retention using sensitivity models.
3. If aid adjusts proportionally: financial gap stays constant but institutional net revenue changes. Recompute revenue.
4. Apply price elasticity by segment: some segments are more price-sensitive than others.
5. Project: enrollment change, revenue change, retention change, composition change (which segments shrink or grow?).

### Outputs
| Metric | Baseline | Scenario | Delta |
|--------|----------|----------|-------|
| Sticker price tuition | | | |
| Average net tuition (after aid) | | | |
| Projected enrollment | | | |
| Projected gross tuition revenue | | | |
| Projected net tuition revenue | | | |
| Projected yield rate | | | |
| Projected retention rate | | | |
| Enrollment change by segment | | | |

### Price Elasticity Defaults (Provisional - v1)
| Student Segment | Elasticity | Interpretation |
|----------------|-----------|---------------|
| Full-pay, high KR, multiple admits | -1.2 to -1.5 | Highly sensitive. 10% tuition increase loses 12-15% of this segment. |
| Full-pay, moderate KR, few alternatives | -0.5 to -0.8 | Moderately sensitive. Some alternatives but fewer options. |
| Aided, high need, high KR | -0.3 to -0.6 | Less sensitive IF aid adjusts. Very sensitive if it doesn't. |
| Aided, high need, moderate KR | -0.2 to -0.4 | Limited alternatives. Will absorb some increase. |
| In-state at public institution | -0.4 to -0.7 | Moderate sensitivity. CC alternative is always available. |
| Out-of-state at public institution | -1.0 to -1.4 | High sensitivity. Many alternative states/schools. |
| Online/non-traditional | -0.8 to -1.2 | High sensitivity. Market is competitive with many options. |
| Graduate/professional | -0.3 to -0.6 | Lower sensitivity. Credential value outweighs price for many. |

These are v1 defaults. The engine calibrates against the institution's actual enrollment response to past tuition changes when data is available.

---

## SCENARIO TYPE 4: CLASS COMPOSITION TARGETING

### Question Answered
"What admit decisions would achieve our target class composition?"

### Inputs
- Target composition (by KR tier, by program, by demographic, by geographic, by financial profile)
- Current admit pool with yield probabilities
- Waitlist pool (if applicable)
- Available recruitment pipeline (prospective students not yet admitted)

### Simulation Method
1. Start with the current projected class (admits * yield probability).
2. Compare projected composition to target composition.
3. Identify gaps: which targets are not met?
4. For each gap, identify the admit or waitlist actions that would close it:
   - Admit additional students from waitlist who match the gap profile
   - Increase aid to admitted students in the gap segment to improve yield
   - Target recruitment outreach to the gap profile for future cycles
5. For each action, project the impact on overall class composition, Class KR, revenue, and retention.

### Outputs
```
COMPOSITION TARGETING RESULTS

Target: 15% of class at KR 90+ | Projected: 11% | Gap: -4% (approximately 18 students)

OPTIONS TO CLOSE GAP:
A) Admit 8 waitlist students at KR 90+ (yield probability 45-55%)
   Impact: +4 projected enrollees at KR 90+, Class KR +0.8, revenue +$38K net
   Trade-off: 3 of these students need $12K+ aid, increases discount rate by 0.3%

B) Increase aid by $3K for 12 admitted KR 90+ students with low yield probability
   Impact: +5 projected enrollees (yield improvement from 30% to 55%), Class KR +0.6
   Trade-off: $36K additional aid spend, discount rate +0.4%

C) Accept gap for this cycle, target recruitment for next cycle
   Impact: No change. Build pipeline: identify 25 KR 90+ prospects for early engagement.
   Trade-off: No cost now. Gap persists for one year.
```

---

## SCENARIO TYPE 5: RETENTION INTERVENTION SIMULATION

### Question Answered
"What is the projected impact of a specific retention intervention on persistence and revenue?"

### Inputs
- Target student population (all High/Critical risk, specific program, specific risk flag type)
- Intervention type (emergency aid, tutoring expansion, advising caseload reduction, peer mentoring, food pantry, etc.)
- Intervention cost (total and per-student)
- Estimated intervention effectiveness (% of targeted students whose risk tier improves)

### Simulation Method
1. Identify all students in the target population.
2. Apply estimated effectiveness: for each targeted student, model the probability that their risk tier improves by one level (e.g., Critical to High, High to Moderate).
3. Recompute retention probability for students whose risk tier improved.
4. Compute retained revenue: the additional revenue generated by keeping students who would have otherwise left.
5. Compute ROI: retained revenue / intervention cost.

### Outputs
| Metric | Without Intervention | With Intervention | Delta |
|--------|---------------------|-------------------|-------|
| Students in target population | | Same | |
| Projected students retained (additional) | 0 | | + |
| Revenue retained | $0 | | + |
| Intervention cost | $0 | | + |
| Net financial impact | $0 | | +/- |
| ROI | N/A | | X |
| Projected Year 1 retention rate | | | + |

### Effectiveness Estimates (Provisional - v1)
| Intervention Type | Estimated Effectiveness | Evidence Basis |
|------------------|------------------------|---------------|
| Emergency financial aid ($500-$2,000) | 35-55% of financially strained students retained | Multiple studies show small emergency grants have outsized retention impact |
| Academic tutoring (1:1) | 20-35% improvement in at-risk academic outcomes | Conditional on student engagement with tutoring |
| Peer mentoring (structured program) | 15-30% improvement in first-year retention | Strongest for first-generation and socially isolated students |
| Advising caseload reduction (from 500:1 to 300:1) | 10-20% improvement in retention for the advised population | Depends on advising quality, not just quantity |
| Food pantry / basic needs support | 25-40% improvement for students with environmental suppression | Addresses a fundamental barrier |
| Mental health counseling (accessible) | 15-25% improvement for students with health suppression | Conditional on availability and stigma reduction |
| Course load adjustment (reducing to 12 credits) | 20-35% improvement for overloaded students | Extends time-to-degree but improves semester completion |

These are cross-institutional averages. The engine calibrates against the institution's actual intervention outcome data when available.

---

## SCENARIO TYPE 6: PROGRAM LAUNCH / CLOSURE SIMULATION

### Question Answered
"What happens if we launch a new program or close an existing one?"

### Inputs
- For launch: projected enrollment (Year 1-3), tuition revenue, startup costs (faculty, curriculum, accreditation, facilities), recruitment pipeline
- For closure: current enrollment, teach-out timeline, reallocation of students to other programs, cost savings
- Impact on overall enrollment, revenue, Class KR, and institutional composition

### Simulation Method

**Program Launch:**
1. Model enrollment ramp-up: Year 1 (cohort 1), Year 2 (cohort 1 retained + cohort 2), Year 3 (steady state).
2. Project revenue per year based on enrollment * net tuition.
3. Subtract startup and ongoing costs.
4. Compute breakeven point: what year does cumulative revenue exceed cumulative cost?
5. Project impact on Class KR: what KR tier do new program students come from? Does this raise or lower the overall class quality?
6. Project impact on institutional composition: does this diversify programs or cannibalize existing enrollment?

**Program Closure:**
1. Model teach-out: how many current students need to complete? Over how many semesters?
2. Project revenue decline per semester as no new students enter.
3. Project cost savings (faculty reallocation or reduction, facility repurposing).
4. Model student reallocation: can displaced students transfer to other internal programs? If so, impact on those programs.
5. Compute net financial impact over the teach-out period.

### Outputs
| Year | Enrollment | Revenue | Cost | Net | Cumulative Net |
|------|-----------|---------|------|-----|---------------|
| 0 (launch) | | | | | |
| 1 | | | | | |
| 2 | | | | | |
| 3 (steady state) | | | | | |

---

## SCENARIO TYPE 7: ENROLLMENT SHOCK SIMULATION

### Question Answered
"What happens if something disrupts our enrollment unexpectedly?"

### Purpose
Model the institutional impact of external shocks: economic recession, pandemic, competitor school launching a program, demographic cliff, major employer leaving the area, regulatory change (e.g., Title IV loss), natural disaster.

### Inputs
- Shock type and estimated magnitude (e.g., "20% enrollment decline over 2 years", "50% drop in out-of-state enrollment", "loss of federal financial aid")
- Current enrollment and financial baseline
- Institutional reserves and financial runway

### Simulation Method
1. Apply the shock to the relevant enrollment segment.
2. Recompute: total enrollment, revenue, financial aid burden (if some students become needier), retention (stress events increase attrition), class composition.
3. Model recovery timeline: how many semesters to return to pre-shock enrollment, given recruitment pipeline and market conditions?
4. Compute financial runway: at the shocked revenue level, how many semesters of reserves does the institution have?
5. Identify critical thresholds: at what enrollment level does the institution fall below accreditation minimums, debt covenant thresholds, or operational breakeven?

### Outputs
| Semester | Enrollment | Revenue | Costs (adj) | Net | Reserves Remaining |
|----------|-----------|---------|-------------|-----|-------------------|
| Pre-shock | | | | | |
| Shock +1 | | | | | |
| Shock +2 | | | | | |
| Shock +3 | | | | | |
| Recovery target | | | | | |

### Pre-Built Shock Scenarios
**7A: Demographic Cliff.** WICHE projections show high school graduate decline of X% in region over Y years. Apply to freshman enrollment pipeline.
**7B: Competitor Entry.** New program at nearby school draws X% of target admits. Apply to specific program or KR segment.
**7C: Economic Recession.** Employment uncertainty increases need-based aid demand by X% while reducing family ability to pay. Yield sensitivity increases.
**7D: Regulatory Change.** Loss of Title IV eligibility (or accreditation warning) eliminates federal financial aid. Model impact on enrollment of students who require FAFSA.
**7E: Housing/Facilities Loss.** Dormitory closure or campus damage reduces residential capacity by X beds. Commuter-only model for affected students.

---

# PART 2: SIMULATION CONFIDENCE

## Simulation Confidence Gate

Every simulation output includes a confidence range. The engine is transparent about how much to trust each projection.

### Confidence Factors
| Factor | Impact on Confidence |
|--------|---------------------|
| Historical data available (3+ years of enrollment, retention, yield data) | +15-20% confidence |
| Current cycle data (real admits with real engagement signals) | +10-15% confidence |
| Hypothetical inputs (students not yet in pipeline, programs not yet launched) | -15-25% confidence |
| Large sample (1,000+ students in cohort) | +5-10% confidence |
| Small sample (under 100 students in cohort) | -10-15% confidence |
| Stable environment (no major external changes) | +5-10% confidence |
| Volatile environment (recent shocks, regulatory uncertainty) | -10-20% confidence |

### Confidence Ranges by Scenario Type
| Scenario Type | Typical Confidence Range |
|--------------|------------------------|
| Aid Reallocation (current admits) | 65-80% |
| Admit Volume Adjustment (current waitlist) | 55-75% |
| Retention Intervention (current students) | 55-70% |
| Tuition Pricing (existing student base) | 50-70% |
| Class Composition Targeting | 45-65% |
| Program Launch/Closure (Year 1) | 35-55% |
| Enrollment Shock | 25-50% |

### Presentation Rule
Every simulation output MUST include:
- Point estimate (the most likely outcome)
- Confidence range (the plausible range of outcomes)
- Key assumptions (what must be true for the projection to hold)
- Sensitivity (which input variable has the biggest impact on the outcome)

---

# PART 3: MULTI-SCENARIO COMPARISON

## Purpose
Institutional leaders rarely evaluate a single scenario in isolation. They compare options. The engine supports side-by-side comparison of up to 5 scenarios.

## Comparison Output Format
```
SCENARIO COMPARISON - [Institution Name] - [Date]

                        | Baseline | Scenario A | Scenario B | Scenario C |
Enrolled class size     |          |            |            |            |
Class KR                |          |            |            |            |
Net tuition revenue     |          |            |            |            |
Tuition discount rate   |          |            |            |            |
Year 1 retention (proj) |          |            |            |            |
4-year graduation (proj)|          |            |            |            |
Aid spend               |          |            |            |            |
% KR 90+                |          |            |            |            |
% High/Critical risk    |          |            |            |            |
Confidence              |          |            |            |            |

KEY TRADE-OFFS:
- Scenario A maximizes [metric] but sacrifices [metric]
- Scenario B balances [metric] and [metric] but at higher cost
- Scenario C is lowest risk but also lowest upside

RECOMMENDATION: [None - the engine projects, humans decide]
```

---

## GOVERNANCE RULES (Apply to ALL Simulations)

1. **Deterministic.** Same inputs and same scenario parameters produce the same projections. No randomness.
2. **No truth mutation.** Simulations NEVER modify Student KR, Class KR, retention risk scores, or any upstream output. They consume truth and project outcomes.
3. **Transparency.** Every projection includes confidence range, key assumptions, and sensitivity analysis. The engine never presents a projection as certain.
4. **No recommendations.** The engine projects outcomes under scenarios. It does not recommend which scenario to choose. That is a human decision informed by institutional mission, values, and context the engine cannot fully capture.
5. **Auditability.** Every simulation can be rerun with the same inputs to produce the same outputs. Input parameters are logged with timestamps.
6. **Bounded projections.** No projection produces an enrollment number above institutional capacity or below zero. No projection produces a retention rate above 100% or below 0%. No projection produces negative revenue without explicitly flagging it as a deficit scenario.

---

## VERSION HISTORY
- v1.0: Initial build. Seven scenario types (Admit Volume, Financial Aid Reallocation, Tuition Pricing, Class Composition Targeting, Retention Intervention, Program Launch/Closure, Enrollment Shock), Simulation Confidence Gate, Multi-Scenario Comparison framework. Pre-built sub-scenarios for common aid and shock questions. Architecture mirrors basketball File 04 (Simulation Engine) with domain-appropriate interaction libraries replaced by enrollment scenario modeling.
