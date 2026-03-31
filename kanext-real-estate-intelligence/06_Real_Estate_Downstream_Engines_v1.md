# REAL ESTATE DOWNSTREAM ENGINES
## v1.0

---

## 0. Scope

This document governs all post-acquisition real estate intelligence: development timeline tracking, asset performance monitoring, disposition (sell/hold) intelligence, and expansion intelligence. These engines consume upstream outputs from the Property Evaluation (File 01), Reference (File 02), and Portfolio Intelligence (File 03). They never modify upstream data.

---

## 1. DEVELOPMENT TIMELINE ENGINE

The Development Timeline Engine tracks construction progress for every property under active development. It monitors schedule, budget, quality, and dependencies in real time.

### 1.1 Project Structure

Every development project is structured as:

```
PROJECT: [Name]
Property: [Address / Parcel ID]
Project Type: [New construction / Renovation / Infrastructure / Tenant improvement]
IOA Phase Alignment: [Phase 1 / 2 / 3 / 4]
Start Date: [Actual or projected]
Target Completion: [Date]
Budget: [$]
Contractor: [Name]
Project Manager: [Name]
```

### 1.2 Milestone Tracking

Each project has a defined milestone sequence. Milestones are binary: complete or incomplete. No partial credit.

**Standard milestone sequence for new construction:**

| Milestone | Description | Typical Timeline |
|-----------|-------------|-----------------|
| M1: Entitlement | Zoning approval, variance, or rezoning complete | Month 0-6 |
| M2: Design Complete | Architectural and engineering drawings approved | Month 3-9 |
| M3: Permit Issued | Building permit in hand | Month 6-12 |
| M4: Site Prep | Grading, drainage, utility connection complete | Month 8-14 |
| M5: Foundation | Foundation poured and cured | Month 10-16 |
| M6: Structural | Framing / structural steel / concrete complete | Month 14-22 |
| M7: Enclosed | Roof, exterior walls, windows installed (weather-tight) | Month 18-26 |
| M8: Systems | HVAC, electrical, plumbing rough-in and inspection | Month 20-28 |
| M9: Finish | Interior finishes, fixtures, flooring, paint | Month 24-32 |
| M10: Certificate of Occupancy | CO issued by jurisdiction | Month 28-36 |
| M11: Operational | Facility open and in use | Month 29-37 |

**Standard milestone sequence for renovation:**

| Milestone | Description | Typical Timeline |
|-----------|-------------|-----------------|
| M1: Assessment | Structural and systems assessment complete | Month 0-2 |
| M2: Design Complete | Renovation plans approved | Month 1-4 |
| M3: Permit Issued | Renovation permit in hand | Month 2-5 |
| M4: Demolition | Selective demolition and hazmat abatement (if needed) | Month 3-6 |
| M5: Structural | Structural modifications complete | Month 4-8 |
| M6: Systems | Updated HVAC, electrical, plumbing | Month 5-10 |
| M7: Finish | Interior finishes | Month 7-12 |
| M8: Certificate of Occupancy | CO issued | Month 8-14 |
| M9: Operational | Facility open and in use | Month 9-15 |

### 1.3 Schedule Variance

For each milestone:

```
Schedule_Variance = Actual_Date - Planned_Date
```

- Negative variance: ahead of schedule
- Zero: on schedule
- Positive variance: behind schedule

**Severity flags:**
- 1-2 weeks behind: MONITOR. Normal construction variance.
- 2-4 weeks behind: ALERT. Assess cause and mitigation.
- 4-8 weeks behind: WARNING. Escalate to project manager. Assess downstream milestone impact.
- 8+ weeks behind: CRITICAL. Escalate to CEO. Assess IOA phase impact. Identify acceleration options or scope reduction.

### 1.4 Budget Tracking

```
Budget_Variance = Actual_Cost_to_Date - Budgeted_Cost_to_Date
Budget_Variance_% = Budget_Variance / Total_Budget x 100
```

**Severity flags:**
- Under 5% over budget: MONITOR. Normal construction variance.
- 5-10% over budget: ALERT. Identify causes (change orders, material cost, labor escalation).
- 10-20% over budget: WARNING. Value engineering required. Identify scope reductions that preserve functionality.
- Over 20%: CRITICAL. Project scope or feasibility review required. Assess whether to continue, pause, or restructure.

**Cost-at-completion forecast:**

```
Forecasted_Total = Actual_Cost_to_Date + (Remaining_Budget x (1 + Variance_%))
```

This assumes the current variance rate continues. If specific causes have been addressed, the forecast can be manually adjusted with documented justification.

### 1.5 Dependency Tracking

Dependencies are links between projects where one cannot proceed until another completes.

**Dependency types:**
- **Hard dependency:** Project B literally cannot start until Project A completes (e.g., building cannot begin until site infrastructure is in place).
- **Soft dependency:** Project B is more efficient or less risky if Project A completes first, but can proceed independently with added cost or complexity.
- **External dependency:** Project depends on a third party (utility company, municipality, permit authority) whose timeline KaNeXT does not control.

For each dependency:
```
Dependency_Risk = Schedule_Variance_of_Predecessor x Impact_on_Successor
```

If a hard dependency predecessor is 4+ weeks behind schedule, automatically flag the successor project as at risk.

### 1.6 Development Timeline Output

```
DEVELOPMENT STATUS REPORT: [Date]

Active Projects: [N]
Total Budget: $[X]
Total Spent: $[X] ([%] of budget)
Projects On Schedule: [N] / [Total]
Projects On Budget: [N] / [Total]

PROJECT DETAILS:
[For each active project]
Project: [Name]
Status: [On Track / Alert / Warning / Critical]
Schedule: [Days ahead/behind] | Next Milestone: [M#] due [Date]
Budget: $[Spent] of $[Budget] ([%]) | Forecast at completion: $[X]
Key Risk: [Primary risk factor]
```

---

## 2. ASSET PERFORMANCE MONITORING

Asset Performance Monitoring tracks operational performance of completed, stabilized properties against their projected performance at time of acquisition.

### 2.1 Performance Metrics (Tracked Monthly)

**For income-producing properties (housing, commercial, dining):**

| Metric | Definition | Frequency |
|--------|-----------|-----------|
| Occupancy Rate | Occupied units / total units | Monthly |
| Gross Revenue | Total rent + fees + other income | Monthly |
| Operating Expenses | Maintenance + management + insurance + taxes + utilities | Monthly |
| NOI | Gross Revenue - Operating Expenses | Monthly |
| NOI Margin | NOI / Gross Revenue | Monthly |
| Delinquency Rate | Past-due receivables / total receivables | Monthly |
| Turnover Rate | Units vacated / total units (annualized) | Quarterly |
| CapEx Spend | Capital expenditure on maintenance and improvements | Quarterly |
| Cap Rate (actual) | Trailing 12-month NOI / acquisition cost | Annually |
| DSCR | NOI / annual debt service (if financed) | Monthly |

**For non-income properties (academic buildings, athletic facilities):**

| Metric | Definition | Frequency |
|--------|-----------|-----------|
| Utilization Rate | Hours in use / total available hours | Monthly |
| Maintenance Cost | Total maintenance spend | Monthly |
| CapEx Spend | Capital expenditure | Quarterly |
| Condition Score | Physical condition assessment (1-5 scale) | Annually |
| Deferred Maintenance Backlog | Estimated cost of deferred maintenance | Annually |

### 2.2 Variance Analysis

For each metric, compare actual to projected:

```
Variance = Actual - Projected
Variance_% = (Actual - Projected) / Projected x 100
```

**Severity flags for income properties:**
- Occupancy below projected by 5%+: ALERT
- Occupancy below projected by 10%+: WARNING
- NOI below projected by 10%+: WARNING
- NOI below projected by 20%+: CRITICAL
- DSCR below 1.2x: WARNING
- DSCR below 1.0x: CRITICAL (debt service not covered by property income)

**Severity flags for non-income properties:**
- Maintenance cost above projected by 15%+: ALERT
- Maintenance cost above projected by 30%+: WARNING
- Condition score below 3: ALERT (deferred maintenance accumulating)
- Condition score below 2: WARNING (facility degradation)

### 2.3 Performance Diagnosis

When a property underperforms, diagnose the cause:

**Revenue shortfall causes:**
- Market-driven: local rental rates declined, competing supply entered market
- Operational: poor management, slow leasing, inadequate marketing
- Structural: property condition deterring tenants, location became less desirable
- Institutional: mandate school enrollment declined, reducing guaranteed demand

**Expense overrun causes:**
- Maintenance: aging systems requiring more frequent repair
- Insurance: rate increases due to claims history or market conditions
- Taxes: reassessment at higher value
- Utilities: rate increases or inefficient systems
- Management: staffing costs higher than projected

### 2.4 Property KR Re-evaluation Trigger

If a stabilized property underperforms projections for 6+ consecutive months across multiple metrics, trigger a Property KR re-evaluation:

1. Re-run the Phase 3 anchor with updated data.
2. Re-score component KRs with actual operating data (replaces projected data).
3. If re-evaluated KR is 5+ points below original KR, flag for portfolio review.
4. If re-evaluated KR drops below 75, trigger disposition analysis (Section 3).

The re-evaluated KR does NOT automatically replace the original KR in portfolio calculations. It is presented alongside the original with variance noted. Portfolio KR uses the re-evaluated number only after formal approval.

### 2.5 Performance Output

```
ASSET PERFORMANCE REPORT: [Property Name] - [Period]

Property KR (original): [Score]
Property KR (current, if re-evaluated): [Score]

FINANCIAL PERFORMANCE:
Occupancy: [%] (projected: [%]) | Variance: [+/- %]
Gross Revenue: $[X] (projected: $[X]) | Variance: [+/- %]
Operating Expenses: $[X] (projected: $[X]) | Variance: [+/- %]
NOI: $[X] (projected: $[X]) | Variance: [+/- %]
DSCR: [X]x (minimum: 1.2x) | Status: [OK / Warning / Critical]

OPERATIONAL PERFORMANCE:
Delinquency: [%]
Turnover: [%] (annualized)
Maintenance Cost: $[X]
Condition Score: [1-5]

DIAGNOSIS: [If underperforming, root cause]
RECOMMENDATION: [Hold / Intervene / Trigger disposition analysis]
```

---

## 3. DISPOSITION INTELLIGENCE

Disposition Intelligence determines when to sell, wind down, or repurpose an underperforming or non-strategic property.

### 3.1 Disposition Triggers

A property enters disposition analysis when any of the following occur:

- **Financial underperformance:** NOI below projected for 12+ consecutive months with no improvement trajectory.
- **Strategic misalignment:** Property no longer serves a KaNeXT institutional function (e.g., mandate school in the area closed, student demand evaporated).
- **Capital redeployment opportunity:** Selling the property frees capital for a higher-KR, higher-System-Fit acquisition.
- **Maintenance burden:** CapEx requirements exceed 30% of property value within the next 5 years.
- **Market peak:** Property value has appreciated significantly and selling captures maximum value.
- **Forced disposition:** Regulatory action, eminent domain, or legal encumbrance makes continued ownership impractical.

### 3.2 Hold vs Sell Analysis

For each property in disposition analysis:

**Hold scenario:**
- Projected cash flow over 5 years (NOI - debt service)
- Projected terminal value at Year 5 (based on cap rate reversion)
- Total projected return = cash flows + terminal value - remaining capital invested
- IRR of hold scenario

**Sell scenario:**
- Current estimated market value (based on recent comps and appraisal)
- Estimated selling costs (broker commission 3-6%, closing costs 1-2%)
- Net proceeds = market value - selling costs - remaining debt
- Capital available for redeployment
- Projected return on redeployed capital (using the best available acquisition target's projected return)

**Decision framework:**
- If Hold IRR > Sell + Redeploy IRR: HOLD
- If Sell + Redeploy IRR > Hold IRR by 200+ basis points: SELL
- If within 200 basis points: consider strategic factors (System Fit, institutional need, brand impact of selling)

### 3.3 Disposition Methods

**Market sale:** List on open market through commercial broker. Maximize sale price. Allow 6-12 months for marketing and close.

**Off-market sale:** Negotiate directly with known buyer (adjacent landowner, developer, institution). Faster close, potentially lower price, less disruption.

**1031 Exchange:** Sell and reinvest proceeds into a like-kind property within 180 days to defer capital gains. Preserves capital for redeployment.

**Ground lease conversion:** Instead of selling, convert to a ground lease. Retain ownership, generate recurring income, tenant handles operations. Useful for properties with strong location but misaligned use.

**Demolition and redevelopment:** If the land value exceeds the value of current improvements, demolish and develop for highest-and-best use under current zoning.

### 3.4 Disposition Output

```
DISPOSITION ANALYSIS: [Property Name]

Trigger: [What triggered the analysis]
Property KR (current): [Score]
System Fit (current): [%]

HOLD SCENARIO:
5-Year Projected NOI: $[X]
Terminal Value: $[X]
Total Return: $[X]
Hold IRR: [%]

SELL SCENARIO:
Estimated Market Value: $[X]
Net Proceeds: $[X]
Redeployment Target: [Best available acquisition]
Redeployment Projected IRR: [%]

RECOMMENDATION: [HOLD / SELL / GROUND LEASE / REDEVELOP]
Rationale: [2-3 sentences]
```

---

## 4. EXPANSION INTELLIGENCE

Expansion Intelligence identifies when and how to grow the real estate portfolio through additional acquisitions, adjacent parcel assembly, campus expansion, and new market entry.

### 4.1 Expansion Triggers

**Enrollment-driven expansion:**
When a mandate school's enrollment grows beyond the current housing and facility capacity, expansion is triggered. Monitor: enrollment vs housing units, classroom utilization above 80%, athletic facility scheduling conflicts.

**Market-driven expansion:**
When submarket conditions create acquisition opportunity (distressed seller, price decline, new inventory), expansion may be opportunistic even if not enrollment-driven.

**IOA phase-driven expansion:**
Each IOA phase may trigger new facility requirements. Phase 3 (campus operations) triggers housing, dining, parking. Phase 4 (full operations) triggers the complete campus build.

**Adjacent parcel assembly:**
When parcels adjacent to existing KaNeXT properties become available, evaluate for assembly. Contiguous land is exponentially more valuable than isolated parcels.

### 4.2 Expansion Evaluation

Every expansion opportunity runs through the full evaluation pipeline (File 01, Steps 1-10). Additionally:

**Portfolio impact assessment:**
- How does this acquisition change Portfolio KR?
- How does it change geographic concentration?
- How does it change property type concentration?
- How does it change development stage mix?
- Does the portfolio have capacity to absorb another property under active development?

**Capital capacity check:**
- Is there remaining deployment capacity in the real estate budget?
- If not, which financing source covers the acquisition (reserve, operating cash flow, refinance, new capital)?
- Does this acquisition delay or jeopardize any other planned deployment?

**Operational capacity check:**
- Does the team have bandwidth to manage another acquisition, development project, or operating property?
- Integration load: how many active development projects are underway? If more than 5, flag operational strain.

### 4.3 New Market Entry

When a mandate school is signed in a new geographic market, Real Estate Intelligence initiates a market entry assessment:

1. **Market scan:** Identify the submarket around the mandate school. Pull demographic, economic, and real estate data.
2. **Housing demand model:** Based on school enrollment and athletic roster, estimate housing unit demand within 1, 3, and 5 miles.
3. **Supply scan:** Identify available residential inventory (single-family, multi-family, apartment complexes) within the search radius.
4. **Evaluate top candidates:** Run File 01 pipeline on the 3-5 most promising properties.
5. **Portfolio fit:** Assess how the new market properties would change the portfolio's geographic diversification, property type mix, and risk profile.
6. **Recommend:** Acquire, defer, or pass on the market. If acquire, specify which properties and in what order.

### 4.4 Campus Expansion Playbook

For the 596-acre Miami Lakes campus specifically:

**Phase 1 expansion:** Use only the portions of the 596 acres needed for immediate construction. Reserve remaining acreage for future phases.

**Adjacent parcel monitoring:** Maintain a watchlist of all parcels adjacent to or within 0.5 miles of the 596-acre site. When any parcel hits the market, immediately evaluate using File 01 pipeline. Secure options on high-priority parcels before market exposure drives price up.

**Density optimization:** As the campus matures, evaluate whether existing facilities can be expanded vertically (additional floors, expanded footprints) before acquiring new land. Vertical expansion is almost always cheaper per sqft than new land acquisition.

**Mixed-use perimeter:** The campus perimeter facing public roads is the highest commercial-value land. Sequence commercial/mixed-use development on the perimeter to generate revenue and create a campus gateway while reserving interior land for institutional use.

### 4.5 Expansion Output

```
EXPANSION OPPORTUNITY: [Property/Market]

Trigger: [What initiated the evaluation]
Market: [City/Submarket]
Property Type: [Type]
Estimated Cost: $[X]

Portfolio Impact:
- Portfolio KR change: [+/- X points]
- Geographic diversification change: [Improves / Neutral / Reduces]
- Capital remaining after acquisition: $[X]
- Active development projects after acquisition: [N]

Operational Capacity: [Sufficient / Strained / Overloaded]

RECOMMENDATION: [ACQUIRE / DEFER / PASS]
Priority: [Immediate / Within 6 months / Within 12 months / Monitor only]
Rationale: [2-3 sentences]
```

---

## GOVERNANCE RULES (Downstream Engines)

1. **No truth mutation:** Downstream engines never modify upstream Property KRs, component KRs, or System Fit scores. Re-evaluations create new records alongside originals.
2. **Confidence inheritance:** Downstream outputs inherit the confidence level of their upstream inputs. A development timeline based on a LOW-confidence property evaluation carries LOW confidence in its projections.
3. **Escalation protocol:** CRITICAL flags in any engine escalate to the CEO/founder. WARNING flags escalate to the real estate team lead. ALERT flags are tracked in reporting but do not require escalation.
4. **Audit trail:** Every disposition recommendation, expansion decision, and development scope change is logged with date, rationale, data inputs, and decision-maker.
5. **Fund constraint awareness:** Every downstream recommendation must verify it does not exceed the fund's capital position, debt capacity, or operational bandwidth.

---

## VERSION HISTORY
- v1.0: Initial build. Development Timeline Engine (milestone tracking, schedule variance, budget tracking, dependency management). Asset Performance Monitoring (monthly metrics, variance analysis, performance diagnosis, KR re-evaluation trigger). Disposition Intelligence (6 triggers, hold vs sell framework, 5 disposition methods). Expansion Intelligence (4 trigger types, portfolio impact assessment, new market entry protocol, campus expansion playbook).
