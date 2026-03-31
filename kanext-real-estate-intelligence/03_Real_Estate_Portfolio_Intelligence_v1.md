# REAL ESTATE PORTFOLIO INTELLIGENCE
## v1.0

---

## 0. Scope

This is the single authoritative document for Portfolio KR computation, geographic concentration analysis, capital allocation optimization, development sequencing, revenue projection, and risk diversification scoring for the KaNeXT real estate portfolio.

Portfolio KR does not evaluate individual properties. It consumes finalized Property KR outputs from upstream (File 01 evaluation pipeline).

---

## 1. Inputs (Non-Negotiable)

Portfolio KR consumes only:

**Per property in portfolio:**
- Final Property KR (from File 01 pipeline)
- Component KRs (LKR, FKR, DKR, SKR)
- System Fit %
- Acquisition cost or transfer basis
- Current estimated market value
- Property type (one of 5 defined types)
- Development stage (raw, entitled, under construction, stabilized, value-add)
- Market tier (Tier 1-5 from KLVN)
- Acreage or square footage
- Location (county, submarket)
- Revenue (annual gross, if income-producing)
- NOI (if income-producing)
- Capital deployed (acquisition + development to date)

**Portfolio-level context:**
- Total fund capital raised ($500M)
- Total real estate allocation ($630M including HBCU Capital Financing and philanthropy)
- Current capital deployed to real estate
- Remaining real estate deployment capacity
- IOA phase (current phase and next phase trigger)

**Explicit exclusions:**
- No re-evaluation of individual Property KRs
- No modification of component KRs
- No override of System Fit scores
- No financial restatement of acquisition cost or transfer basis

---

## 2. Portfolio KR Computation

Portfolio KR is the capital-weighted aggregation of individual Property KRs across all holdings.

### 2.1 Capital Weight Per Property

Each property's contribution to Portfolio KR is weighted by capital deployed relative to total portfolio capital.

```
Capital_Weight_i = Capital_Deployed_i / Total_Capital_Deployed
```

Where Capital_Deployed_i = acquisition cost + development capital invested to date.

All capital weights sum to 1.0.

### 2.2 Portfolio KR Formula

```
Portfolio_KR = SUM(Property_KR_i x Capital_Weight_i) for all i in portfolio
```

### 2.3 Portfolio Component KRs

Same capital-weighting applied to each component:

```
Portfolio_LKR = SUM(LKR_i x Capital_Weight_i)
Portfolio_FKR = SUM(FKR_i x Capital_Weight_i)
Portfolio_DKR = SUM(DKR_i x Capital_Weight_i)
Portfolio_SKR = SUM(SKR_i x Capital_Weight_i)
```

### 2.4 Portfolio System Fit

```
Portfolio_System_Fit = SUM(System_Fit_i x Capital_Weight_i)
```

### 2.5 Diagnostic Outputs

After computing Portfolio KR, generate:

- **Strongest property:** Highest individual Property KR in the portfolio.
- **Weakest property:** Lowest individual Property KR in the portfolio.
- **KR Range:** Difference between highest and lowest Property KR. Ranges over 25 points indicate high variance in portfolio quality.
- **Capital-weighted vs equal-weighted KR:** If the capital-weighted KR is more than 3 points different from the equal-weighted average, it means capital allocation is skewed toward higher-KR or lower-KR properties. Note which direction.
- **Component KR imbalance:** If any portfolio component KR is more than 10 points below the highest component KR, flag it as a portfolio-level weakness. Example: Portfolio LKR 88, Portfolio FKR 75 indicates the portfolio is locationally strong but financially stressed.

---

## 3. Geographic Concentration Analysis

Geographic concentration measures how much of the portfolio's capital is deployed in each submarket. High geographic concentration increases market risk (a downturn in one submarket affects a large share of portfolio value).

### 3.1 Concentration by County

```
County_Concentration_i = Capital_in_County_i / Total_Portfolio_Capital
```

**Threshold flags:**
- Single county above 80%: HIGH concentration. This is expected in Year 1 (Miami-Dade dominates) but should be monitored as the portfolio grows.
- Single county above 90%: CRITICAL concentration. Portfolio is effectively a single-market bet.
- No county above 50%: HEALTHY diversification.

### 3.2 Concentration by Submarket

Within a county, further decompose by submarket (Miami Lakes, Miami Gardens, Coral Gables, etc.).

```
Submarket_Concentration_i = Capital_in_Submarket_i / Total_Portfolio_Capital
```

**Threshold flags:**
- Single submarket above 60%: HIGH concentration. Again, expected in Year 1 with the 596-acre Miami Lakes acquisition.
- Two or fewer submarkets contain 90%+ of capital: MODERATE concentration. Normal for early-stage institutional portfolio.

### 3.3 Year 1 Expected Profile

The Year 1 KaNeXT real estate portfolio is intentionally concentrated:
- Miami Lakes (596 acres + construction): approximately $530M (84% of $630M)
- Miami Gardens (FMU campus): approximately $100M (16% of $630M)

This concentration is expected and strategically justified because both properties are core institutional assets, not speculative investments. Geographic diversification comes in later phases as mandate schools in other markets generate cluster housing demand.

The intelligence system flags the concentration without recommending against it. The flag ensures awareness, not avoidance.

---

## 4. Capital Allocation Optimization

Capital allocation optimization answers: given finite capital, how should the portfolio be constructed to maximize strategic value per dollar deployed?

### 4.1 Capital Efficiency Score

```
Capital_Efficiency_i = Property_KR_i / (Capital_Deployed_i / $1,000,000)
```

This produces "KR points per million dollars deployed." Higher is better.

**Benchmarks:**
- Campus land at $330M with KR 94: efficiency = 94 / 330 = 0.28 KR per $M. Low efficiency but highest strategic value.
- Cluster housing unit at $200K with KR 87: efficiency = 87 / 0.2 = 435 KR per $M. Extremely high efficiency.
- FMU campus at $100M with KR 90: efficiency = 90 / 100 = 0.90 KR per $M.

Capital efficiency is informational, not prescriptive. A low-efficiency property with 95+ System Fit is still a mandatory acquisition. A high-efficiency property with 50 System Fit may not be worth pursuing.

### 4.2 Marginal KR Impact

Before acquiring a new property, compute the impact on Portfolio KR:

```
New_Portfolio_KR = (Current_Portfolio_KR x Current_Capital + New_Property_KR x New_Capital) / (Current_Capital + New_Capital)
```

If New_Portfolio_KR > Current_Portfolio_KR, the acquisition improves portfolio quality.
If New_Portfolio_KR < Current_Portfolio_KR, the acquisition dilutes portfolio quality.

**Dilution is acceptable** when the property has high System Fit or serves a strategic purpose that the numeric KR does not capture (e.g., preventing hostile adjacent development). Note the dilution and the strategic justification.

### 4.3 Remaining Deployment Capacity

At any point, the system tracks:
- Total real estate budget: $630M
- Capital deployed to date: $X
- Remaining capacity: $630M - $X
- Committed but not yet deployed: $Y (properties under contract but not closed)
- Truly available: $630M - $X - $Y

Every acquisition recommendation must verify that the remaining capacity supports the acquisition. If the acquisition would exceed remaining capacity, flag it and specify which reserve or financing source would cover the shortfall.

---

## 5. Development Sequencing

Development sequencing determines the order in which properties should be developed, balancing institutional need, IOA phase triggers, capital efficiency, and construction logistics.

### 5.1 Sequencing Inputs

For each property requiring development:
- **IOA Phase trigger:** Which phase requires this facility? (Phase 1, 2, 3, or 4)
- **Institutional priority:** Is this a blocking dependency? (e.g., dormitory blocks student enrollment growth, practice facility blocks athletic program launch)
- **Construction timeline:** Estimated months from groundbreaking to occupancy.
- **Construction budget:** Estimated cost.
- **Revenue impact:** Will this facility generate revenue when complete? How much?
- **Dependencies:** Does this project depend on another project completing first? (e.g., dormitory requires roads, utilities, and dining hall)

### 5.2 Sequencing Algorithm

1. **Identify blocking dependencies.** Any facility that blocks another facility's completion must be sequenced first. Infrastructure (roads, utilities, drainage) always comes before buildings.

2. **Align to IOA phases.** Facilities needed for Phase 1 must begin construction immediately. Facilities needed for Phase 2 must begin construction within 6 months of IOA execution to allow construction timeline. And so on.

3. **Prioritize revenue-generating facilities.** Within the same IOA phase, facilities that generate revenue (housing, dining, parking, retail) should be sequenced before pure cost-center facilities (academic buildings, administrative offices) where construction logistics permit.

4. **Balance construction load.** No more than 3-5 major construction projects should be active simultaneously to avoid contractor scarcity, management bandwidth overload, and quality control issues. Stagger starts by 2-3 months where possible.

5. **Reserve contingency.** Hold 10-15% of the construction budget as contingency for cost overruns. Do not sequence projects that would consume 100% of the budget with no margin.

### 5.3 Year 1 Sequencing (Expected)

Based on the $200M campus construction budget and IOA Phase 1 triggers:

**Immediate (Month 0-3):**
- Site infrastructure: roads, utilities, drainage, grading for the 596-acre site
- Temporary or modular facilities for immediate institutional use
- FMU campus renovations for Phase 1 operations

**Near-term (Month 3-12):**
- Athletic facilities (practice courts, training rooms) - blocks athletic program launch
- Student housing (first dormitory or housing cluster) - blocks enrollment growth
- Administrative/academic building (first permanent structure)

**Parallel (Month 6-18):**
- Dining facility
- Student center
- Additional housing

This sequencing is illustrative. Actual sequencing depends on site-specific engineering, permitting timelines, and contractor availability determined during pre-development.

### 5.4 Sequencing Output Format

```
DEVELOPMENT SEQUENCE: [Campus/Site Name]

Phase 1 Projects (IOA Phase 1 alignment):
1. [Project] - Start: [Month] - Duration: [Months] - Budget: [$] - Revenue impact: [$/year or N/A]
   Dependencies: [None / List]
2. [Project] - ...

Phase 2 Projects (IOA Phase 2 alignment):
...

Total Construction Budget: $[X]
Contingency Reserve: $[X] ([%])
Peak Concurrent Projects: [N]
Estimated Full Build Completion: Month [X]
```

---

## 6. Revenue Projection

Revenue projection models the income the real estate portfolio generates over time. Revenue comes from multiple sources, all flowing through KayPay.

### 6.1 Revenue Sources

**Housing revenue:**
- Student dormitories (room charges per semester)
- Cluster housing (monthly rent)
- Athlete housing (may be subsidized by athletic department budget - model net cost to institution vs market rent)

**Dining revenue:**
- Meal plans (per semester)
- Casual dining and retail food (per transaction)

**Parking revenue:**
- Student/staff permits (per semester)
- Event parking (per event)

**Retail/commercial revenue:**
- Campus-adjacent commercial leases
- Bookstore, convenience stores, services

**Facility rental revenue:**
- Athletic venue rental for events
- Conference and meeting space rental
- Summer camps and programming

### 6.2 Revenue Model Structure

For each revenue-generating property or facility:

```
Annual_Gross_Revenue = Units x Rate x Occupancy x 12 (or semesters)
Annual_Operating_Expenses = Fixed_Costs + Variable_Costs
Annual_NOI = Gross_Revenue - Operating_Expenses
Annual_Debt_Service = (if financed) principal + interest per year
Annual_Cash_Flow = NOI - Debt_Service
```

### 6.3 Occupancy Assumptions

**Mandate-backed occupancy:** For cluster housing and dormitories serving mandate school students, base occupancy assumes 85% of units filled by mandate-school demand. This is the key differentiator from traditional student housing: demand is institutional, not market-driven.

**Sensitivity scenarios:**
- **Bull case:** 95% occupancy, 3% annual rent growth, operating expenses held flat
- **Base case:** 85% occupancy, 2% annual rent growth, 2% operating expense growth
- **Bear case:** 70% occupancy, 0% rent growth, 3% operating expense growth

### 6.4 HBCU Capital Financing Impact

For facilities financed through HBCU Capital Financing ($200M at 3.0-3.5% over 25-30 years):

```
At $200M, 3.25% rate, 30-year term:
Monthly payment: approximately $870,000
Annual debt service: approximately $10,440,000
```

This debt service must be covered by the revenue generated from the financed facilities. The DSCR (debt service coverage ratio) must exceed 1.2x for the financed portfolio segment.

```
Required NOI to cover debt at 1.2x DSCR: $10,440,000 x 1.2 = $12,528,000
```

The revenue projection must demonstrate that the financed facilities generate at least this NOI.

### 6.5 Portfolio Revenue Aggregation

```
Total_Portfolio_Revenue = SUM(Annual_Gross_Revenue_i) for all income-producing properties
Total_Portfolio_NOI = SUM(Annual_NOI_i)
Total_Portfolio_Cash_Flow = SUM(Annual_Cash_Flow_i)
Portfolio_Operating_Expense_Ratio = Total_Expenses / Total_Revenue
Portfolio_DSCR = Total_NOI / Total_Debt_Service
```

---

## 7. Risk Diversification Scoring

Risk diversification measures how well the portfolio is protected against concentrated risk exposure.

### 7.1 Risk Dimensions

**Geographic risk:** Concentration in a single county or submarket (see Section 3).

**Property type risk:** Concentration in a single property type.
```
Type_Concentration_i = Capital_in_Type_i / Total_Portfolio_Capital
```
Flags: Single type above 70% = HIGH. Expected in Year 1 (campus land dominates).

**Development stage risk:** Concentration in a single development stage.
- Portfolio heavily in raw/unentitled land: HIGH development risk (long timeline, uncertain entitlement)
- Portfolio heavily in stabilized/operating assets: LOW development risk but may indicate under-investment in growth
- Healthy mix: 30-50% operating, 20-30% under development, 20-30% entitled/planned

**Revenue concentration risk:** What percentage of portfolio revenue comes from a single property or a single revenue type?
- Single property generates 50%+ of portfolio revenue: HIGH concentration
- Single revenue type (e.g., housing only) generates 80%+ of portfolio revenue: MODERATE concentration

**Financing risk:** What percentage of portfolio value is financed (vs cash-acquired)?
- Over 50% financed: ELEVATED leverage risk
- Under 30% financed: CONSERVATIVE leverage
- Year 1 target: $200M financed / $630M total = 32% financed. Conservative.

### 7.2 Composite Risk Diversification Score

Score each dimension 0-100 (100 = fully diversified, 0 = fully concentrated). Take the minimum score across all dimensions as the portfolio's risk diversification floor.

```
Risk_Diversification_Score = MIN(Geographic_Score, Type_Score, Stage_Score, Revenue_Score, Financing_Score)
```

The minimum score is the binding constraint. A portfolio with 95 geographic diversification but 30 type diversification scores 30. The weakest dimension defines the risk.

### 7.3 Year 1 Expected Profile

- Geographic: 30-40 (concentrated in Miami-Dade, expected)
- Property type: 30-40 (concentrated in campus land, expected)
- Development stage: 40-50 (mostly raw land and early construction)
- Revenue: LOW (minimal revenue in Year 1, most properties are in development)
- Financing: 70-80 (conservative leverage)

Composite: 30-40. This is expected and acceptable for Year 1 of a greenfield institutional build. The score should improve to 60+ by Year 3 as cluster housing generates revenue, campus facilities reach stabilization, and the mandate network adds geographic diversity.

---

## VERSION HISTORY
- v1.0: Initial build. Portfolio KR Pipeline (capital-weighted aggregation, component KRs, diagnostics). Geographic Concentration Analysis (county and submarket level, Year 1 expected profile). Capital Allocation Optimization (efficiency score, marginal KR impact, deployment capacity tracking). Development Sequencing (5-step algorithm, IOA phase alignment, Year 1 illustrative sequence). Revenue Projection (6 revenue sources, occupancy assumptions, HBCU financing impact, portfolio aggregation). Risk Diversification Scoring (5 dimensions, composite floor score).
