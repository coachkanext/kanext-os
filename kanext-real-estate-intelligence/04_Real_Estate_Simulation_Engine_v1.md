# REAL ESTATE SIMULATION ENGINE
## v1.0

---

## 0. Scope

This is the single authoritative document for real estate simulation: deal scenario modeling, development scenario simulation, market cycle stress testing, and portfolio-level stress testing. The Simulation Engine consumes upstream outputs from Property Evaluation (File 01), Reference (File 02), and Portfolio Intelligence (File 03). It never modifies upstream data.

Simulation answers "what if" questions. Evaluation (File 01) answers "what is." These are separate functions. Simulation outputs are projections with explicit uncertainty ranges, not deterministic ratings.

---

## 1. DEAL SCENARIO MODELING

Deal Scenario Modeling projects the financial outcome of an acquisition under multiple scenarios before committing capital.

### 1.1 Scenario Structure

Every deal simulation runs three scenarios:

**Bull Case (Upside):**
- Acquisition at or below asking price
- Construction/renovation on time and on budget
- Occupancy reaches stabilized target within 6 months of completion
- Market appreciation at 5%+ annually
- Operating expenses held flat or declining
- No environmental, regulatory, or legal surprises

**Base Case (Expected):**
- Acquisition at asking price
- Construction/renovation 10% over budget, 2 months behind schedule
- Occupancy reaches 85% of stabilized target within 12 months
- Market appreciation at 2-3% annually
- Operating expenses grow at 2% annually
- Minor environmental or regulatory friction resolved without material cost

**Bear Case (Downside):**
- Acquisition at asking price (no renegotiation leverage)
- Construction/renovation 25% over budget, 6 months behind schedule
- Occupancy reaches 70% of stabilized target within 18 months
- Market flat or declining 1-2% annually
- Operating expenses grow at 4% annually
- Environmental remediation required ($X additional cost)
- Regulatory delay adds 12 months to entitlement timeline

### 1.2 Financial Projections Per Scenario

For each scenario, compute over a 5-year and 10-year horizon:

**Acquisition phase:**
- Total acquisition cost (purchase price + closing + transaction costs)
- Due diligence cost (appraisal, environmental, survey, legal)

**Development phase (if applicable):**
- Total development cost (construction + soft costs + contingency)
- Development timeline (months to completion)
- Carry cost during development (taxes, insurance, interest on construction financing, opportunity cost of capital)

**Operating phase:**
- Year 1 through Year 10 revenue projection
- Year 1 through Year 10 operating expense projection
- Year 1 through Year 10 NOI
- Year 1 through Year 10 cash flow after debt service
- Cumulative cash flow

**Exit/terminal value:**
- Projected market value at Year 5 and Year 10
- Cap rate reversion assumption (current cap rate + 50bps for bull, +100bps for base, +150bps for bear)
- Net proceeds after selling costs

**Return metrics:**
- IRR (internal rate of return) for each scenario
- Cash-on-cash return (Year 1 and stabilized)
- Equity multiple (total return / total invested)
- Payback period (months until cumulative cash flow turns positive)
- Break-even occupancy (minimum occupancy to cover operating expenses and debt service)

### 1.3 Sensitivity Variables

Each scenario can be further stress-tested by adjusting one variable at a time while holding others at base case:

| Variable | Range | Impact Measured |
|----------|-------|----------------|
| Acquisition price | +/- 10% | IRR, equity multiple |
| Construction cost | +/- 25% | IRR, total capital required |
| Construction timeline | +/- 6 months | Carry cost, cash flow timing |
| Occupancy rate | 60% to 100% | Revenue, NOI, DSCR |
| Rental rate | +/- 15% | Revenue, NOI |
| Operating expense ratio | 25% to 55% | NOI, cash flow |
| Market appreciation | -3% to +8% annually | Terminal value, equity multiple |
| Interest rate (if financed) | +/- 200 bps | Debt service, cash flow, DSCR |
| Cap rate at exit | +/- 150 bps | Terminal value, IRR |

### 1.4 Deal Scenario Output

```
DEAL SCENARIO MODEL: [Property Name]

Acquisition Cost: $[X]
Development Cost: $[X] (if applicable)
Total Capital Required: $[X]
Financing: [Cash / HBCU Capital / Other] at [rate] for [term]

                    BULL        BASE        BEAR
Construction Cost:  $[X]       $[X]        $[X]
Timeline:           [M] months [M] months  [M] months
Year 1 Occupancy:   [%]        [%]         [%]
Stabilized NOI:     $[X]       $[X]        $[X]
5-Year IRR:         [%]        [%]         [%]
10-Year IRR:        [%]        [%]         [%]
Equity Multiple:    [X]x       [X]x        [X]x
Payback Period:     [M] months [M] months  [M] months
Break-Even Occ:     [%]        [%]         [%]
DSCR (stabilized):  [X]x       [X]x        [X]x

DECISION INPUTS:
- Base case IRR vs fund target return: [Above / Below / At]
- Bear case DSCR: [Above 1.2x = proceed / Below 1.2x = caution]
- Bear case break-even occupancy vs mandate demand: [Covered / Gap of X units]

RECOMMENDATION: [Proceed / Proceed with conditions / Do not proceed]
```

---

## 2. DEVELOPMENT SCENARIO SIMULATION

Development Scenario Simulation models the construction and buildout of campus facilities under different execution assumptions. This is distinct from the Development Timeline Engine in File 06, which tracks actual progress. Simulation models hypothetical scenarios before construction begins.

### 2.1 Construction Scenario Variables

| Variable | Bull | Base | Bear |
|----------|------|------|------|
| Contractor mobilization | Immediate | 30-day delay | 90-day delay |
| Permitting timeline | On schedule | 60 days late | 180 days late |
| Material cost inflation | 0% | 5% | 15% |
| Labor availability | Full crew | 85% staffed | 70% staffed |
| Weather delays | 0 days | 15 days | 45 days |
| Change orders | 0% of budget | 5% of budget | 15% of budget |
| Subcontractor performance | All on time | 1 critical sub late | 3 subs late or replaced |
| Inspection failures | 0 | 1 minor re-inspection | Major re-inspection or design revision |

### 2.2 Phased Development Simulation

For the 596-acre Miami Lakes campus, simulate the entire phased buildout:

**Phase 1 Simulation (Year 1):**
- Input: $200M construction budget, IOA Phase 1 triggers
- Simulate: infrastructure, first academic building, first dormitory, first athletic facility
- Variables: permitting timeline in Miami-Dade, contractor availability in South Florida, hurricane season impact (June-November), material supply chain
- Output: Projected completion dates for each facility, total Phase 1 cost under each scenario, carry cost during construction

**Phase 2 Simulation (Year 2-3):**
- Input: Remaining campus facilities, enrollment growth assumptions
- Simulate: additional housing, dining, student center, expanded athletics
- Variables: Phase 1 completion status (delays cascade), enrollment growth rate, HBCU Capital Financing drawdown timing
- Output: Phase 2 timeline, cost, revenue impact from completed Phase 1 facilities

**Phase 3 Simulation (Year 3-5):**
- Input: Full campus buildout, institutional maturation
- Simulate: remaining academic buildings, commercial perimeter, expanded housing
- Variables: Phase 1 and 2 completion status, market conditions, operating revenue from completed facilities
- Output: Full campus projected completion, total capital deployed, stabilized operating profile

### 2.3 Parallel Development Capacity

Simulate the maximum number of concurrent construction projects the operation can sustain:

| Concurrent Projects | Management Load | Risk Profile |
|--------------------|----------------|--------------|
| 1-2 | LOW - dedicated PM per project, full oversight | LOW - focused attention |
| 3-4 | MODERATE - PMs managing multiple projects, weekly status required | MODERATE - some divided attention |
| 5-6 | HIGH - requires construction management firm, daily status | HIGH - coordination complexity, increased change order risk |
| 7+ | CRITICAL - exceeds typical institutional capacity, significant quality risk | VERY HIGH - recommend phased starts, not concurrent |

The simulation flags when the proposed development sequence exceeds 5 concurrent projects and recommends staggered starts.

### 2.4 Development Simulation Output

```
DEVELOPMENT SCENARIO SIMULATION: [Campus / Site]

Total Development Budget: $[X]
Number of Projects: [N]
Simulation Period: [Months]

                        BULL           BASE           BEAR
Total Cost:            $[X]           $[X]            $[X]
Completion Date:       [Date]         [Date]          [Date]
Peak Concurrent:       [N] projects   [N] projects    [N] projects
Carry Cost:            $[X]           $[X]            $[X]
Total Capital Required: $[X]          $[X]            $[X]
Budget Contingency Used: [%]          [%]             [%]

PHASE COMPLETION DATES:
Phase 1: [Bull date] / [Base date] / [Bear date]
Phase 2: [Bull date] / [Base date] / [Bear date]
Phase 3: [Bull date] / [Base date] / [Bear date]

CRITICAL PATH: [Which project sequence determines overall timeline]
BOTTLENECK: [Which resource constraint is most likely to cause delay]
```

---

## 3. MARKET CYCLE STRESS TESTING

Market Cycle Stress Testing projects portfolio performance under adverse market conditions. Real estate markets are cyclical. The intelligence system must model what happens when the cycle turns.

### 3.1 Market Stress Scenarios

**Scenario A: Mild Recession (2001-type)**
- Property values decline 5-10% over 18 months
- Rental rates decline 3-5%
- Vacancy increases 5-8 percentage points
- Construction costs decline 5% (less demand for contractors)
- Interest rates decline 100-200 bps (Fed stimulus)
- Recovery within 24 months

**Scenario B: Moderate Recession (2008-type, real estate specific)**
- Property values decline 20-35% over 24-36 months
- Rental rates decline 10-15%
- Vacancy increases 10-15 percentage points
- Construction costs initially stable then decline 10-15%
- Credit markets freeze: no new financing available for 6-12 months
- Interest rates volatile: initial spike then aggressive cuts
- Recovery takes 48-72 months

**Scenario C: Interest Rate Shock**
- Rates increase 300-400 bps over 12 months
- Property values decline 10-20% (cap rate expansion)
- Rental rates stable or slightly increasing (inflation environment)
- Construction costs increase 10-20% (material and labor inflation)
- No credit freeze but financing terms significantly worse
- Duration depends on inflation trajectory

**Scenario D: Local Market Disruption**
- Major employer leaves the area or industry contraction
- Population declines 2-5% over 3 years
- Property values decline 15-25%
- Rental rates decline 10-20%
- Vacancy increases 15-20 percentage points
- Recovery depends on economic diversification

**Scenario E: Natural Disaster (Hurricane)**
- Physical damage to properties (repair cost: 5-30% of property value depending on severity)
- 30-90 day operational disruption
- Insurance claims and recovery timeline
- Temporary vacancy increase during repairs
- Long-term: market either recovers (most Florida hurricanes) or permanently impaired (rare, catastrophic)

### 3.2 Portfolio Stress Test Methodology

For each stress scenario:

1. Apply the scenario's property value adjustment to each property's current estimated market value.
2. Apply the scenario's vacancy adjustment to each income-producing property's occupancy rate.
3. Apply the scenario's rental rate adjustment to each property's revenue projection.
4. Recalculate NOI for each property under stress conditions.
5. Recalculate DSCR for each financed property.
6. Identify properties where DSCR falls below 1.0x (debt service not covered by income).
7. Calculate total portfolio value under stress.
8. Calculate portfolio cash flow under stress.
9. Determine if the fund can meet its obligations (LP returns, debt service, operating costs) under stress.

### 3.3 KaNeXT-Specific Stress Mitigants

The KaNeXT real estate portfolio has structural differences from a typical real estate fund that mitigate some stress scenarios:

**Mandate-backed occupancy:** Student and athlete housing demand is driven by institutional enrollment mandates, not open-market demand. As long as the mandate schools are operational, occupancy has a floor. This mitigates Scenarios A, B, and D for housing properties.

**Institutional use properties:** Academic buildings, athletic facilities, and campus infrastructure are not valued on cap rate. Their value is institutional utility, not market-rate income. Market value declines do not impair their usefulness.

**Zero fund-level debt at deployment:** The fund has no drawn debt at closing. HBCU Capital Financing is accessed through FMU (institutional debt, not fund debt). This eliminates margin call risk and forced disposition under Scenarios B and C.

**Long-term hold strategy:** The fund is not a value-add or opportunistic fund that depends on selling properties at a profit within 3-5 years. Properties are held for institutional use over 10-30+ year horizons. Short-term market declines do not trigger disposition.

These mitigants do not eliminate risk. They change the risk profile. The simulation must model both the raw stress impact and the mitigated impact.

### 3.4 Stress Test Output

```
PORTFOLIO STRESS TEST: [Scenario Name]

Scenario: [Description]
Duration: [Months]
Property Value Impact: [-%]
Occupancy Impact: [-X percentage points]
Rental Rate Impact: [-%]

PORTFOLIO IMPACT:
Current Portfolio Value: $[X]
Stressed Portfolio Value: $[X] (decline of $[X], [-%])
Current Portfolio NOI: $[X]
Stressed Portfolio NOI: $[X] (decline of $[X], [-%])
Current Portfolio DSCR: [X]x
Stressed Portfolio DSCR: [X]x

PROPERTIES AT RISK (DSCR < 1.0x under stress):
[List properties with stressed DSCR]

MITIGANTS:
[List applicable KaNeXT-specific mitigants and their effect]

MITIGATED IMPACT:
Adjusted NOI (after mandate-backed occupancy floor): $[X]
Adjusted DSCR: [X]x

FUND OBLIGATION CAPACITY UNDER STRESS:
Can the fund meet LP obligations? [Yes / No / Partial]
Can the fund service HBCU Capital Financing? [Yes / No - identify shortfall]
Months of operating runway from reserves: [N]

RECOMMENDED ACTIONS IF STRESS MATERIALIZES:
1. [Action]
2. [Action]
3. [Action]
```

---

## 4. PORTFOLIO OPTIMIZATION SIMULATION

Portfolio Optimization Simulation models alternative portfolio compositions to determine whether the current allocation is optimal or if rebalancing would improve risk-adjusted returns.

### 4.1 Alternative Portfolio Scenarios

**Scenario 1: Current Plan (Baseline)**
- $330M Miami Lakes campus land
- $100M FMU campus (philanthropic transfer)
- $200M construction
- Total: $630M as deployed per Capital Deployment schedule

**Scenario 2: Smaller Campus, More Housing**
- $200M smaller campus site (fewer acres, lower cost)
- $100M FMU campus
- $150M construction
- $180M cluster housing portfolio (60-90 properties across mandate school markets)
- Total: $630M

**Scenario 3: Phase Campus Acquisition**
- $100M Phase 1 land (100 acres, sufficient for first campus buildings)
- $100M FMU campus
- $200M construction
- $130M cluster housing and commercial
- $100M reserved for Phase 2 land acquisition (additional acreage when needed)
- Total: $630M

**Scenario 4: Diversified Market Entry**
- $250M Miami Lakes campus (negotiate lower or smaller footprint)
- $100M FMU campus
- $150M construction
- $130M cluster housing across 5+ markets (not just Miami)
- Total: $630M

### 4.2 Portfolio Comparison Metrics

For each scenario, compute:
- Portfolio KR (from File 03 methodology)
- Portfolio System Fit %
- Geographic concentration score
- Property type diversification score
- Year 1 revenue projection
- Year 3 revenue projection
- 5-year IRR
- Break-even timeline (when portfolio generates positive cash flow)
- Risk diversification score (composite from File 03)
- Resilience under Scenario B stress test (moderate recession)

### 4.3 Optimization Constraints

Any alternative portfolio must satisfy:
- Campus sufficient for IOA Phase 1 through Phase 4 buildout
- FMU campus acquisition is non-negotiable (IOA structural requirement)
- Minimum $150M construction budget for Year 1 facilities
- Reserve of at least $50M for contingency
- Must support 16-sport athletic program infrastructure
- Must house at least 500 students/athletes by end of Year 2

### 4.4 Portfolio Optimization Output

```
PORTFOLIO OPTIMIZATION COMPARISON

                    CURRENT     SCENARIO 2   SCENARIO 3   SCENARIO 4
Portfolio KR:       [X]         [X]          [X]          [X]
System Fit:         [%]         [%]          [%]          [%]
Geo Concentration:  [Score]     [Score]      [Score]      [Score]
Type Diversification: [Score]   [Score]      [Score]      [Score]
Year 1 Revenue:     $[X]        $[X]         $[X]         $[X]
Year 3 Revenue:     $[X]        $[X]         $[X]         $[X]
5-Year IRR:         [%]         [%]          [%]          [%]
Break-Even:         Month [X]   Month [X]    Month [X]    Month [X]
Risk Score:         [X]         [X]          [X]          [X]
Recession Resilience: [Rating]  [Rating]     [Rating]     [Rating]

OPTIMAL PORTFOLIO: [Which scenario and why]
CURRENT PLAN ASSESSMENT: [Justified / Suboptimal - specify what would improve it]
```

---

## 5. CLUSTER HOUSING DEMAND SIMULATION

Cluster Housing Demand Simulation models student and athlete housing demand near each mandate school to determine optimal acquisition volume and timing.

### 5.1 Demand Model Inputs

Per mandate school:
- Current enrollment (undergraduate + graduate)
- Projected enrollment growth (Year 1, Year 3, Year 5)
- Athletic roster size (all sports, all levels)
- Current on-campus housing capacity
- Current housing occupancy rate
- Percentage of students requiring off-campus housing
- Percentage of athletes requiring off-campus housing (typically higher than general student body)
- Average household size for student renters

### 5.2 Demand Calculation

```
Total_Housing_Demand = Students_Needing_Housing + Athletes_Needing_Housing

Students_Needing_Housing = Enrollment x Off_Campus_Housing_% x (1 - Current_Capacity_Coverage)
Athletes_Needing_Housing = Total_Athletes x Off_Campus_Housing_%

Units_Needed = Total_Housing_Demand / Avg_Household_Size

Beds_Needed = Total_Housing_Demand (1 bed per person)
```

### 5.3 Supply Model

Within the defined search radius (1, 3, 5 miles):
- Available rental inventory (units on market)
- Average vacancy rate
- Average rent per unit by bedroom count
- Property condition distribution (good, fair, poor)
- Foreclosure or distressed inventory (acquisition opportunity)

### 5.4 Gap Analysis

```
Housing_Gap = Units_Needed - KaNeXT_Units_Owned
```

If Housing_Gap > 0: acquisition opportunity exists. Prioritize by proximity and Property KR.
If Housing_Gap <= 0: current portfolio meets demand. Monitor for enrollment growth.

### 5.5 Acquisition Phasing Simulation

Model the optimal acquisition pace:

**Aggressive:** Acquire all needed units in Year 1. Higher upfront capital, immediate occupancy revenue, but risk of over-acquisition if enrollment grows slower than projected.

**Moderate:** Acquire 60% of needed units in Year 1, 40% in Year 2. Balances capital deployment with demand verification.

**Conservative:** Acquire 40% in Year 1, 30% in Year 2, 30% in Year 3. Lowest risk but slowest revenue ramp and risk of losing available inventory to other buyers.

### 5.6 Demand Simulation Output

```
CLUSTER HOUSING DEMAND: [Mandate School Name]

Enrollment: [Current] -> [Year 3 projected] -> [Year 5 projected]
Athletes: [Total across all sports]
Housing Demand: [Units needed]
Current KaNeXT Supply: [Units owned]
Gap: [Units]

ACQUISITION PLAN:
                    AGGRESSIVE   MODERATE    CONSERVATIVE
Year 1 Units:       [N]          [N]         [N]
Year 2 Units:       [N]          [N]         [N]
Year 3 Units:       [N]          [N]         [N]
Total Capital:      $[X]         $[X]        $[X]
Year 1 Revenue:     $[X]         $[X]        $[X]
Year 3 Revenue:     $[X]         $[X]        $[X]
Break-Even:         Month [X]    Month [X]   Month [X]

RECOMMENDED PACE: [Aggressive / Moderate / Conservative]
Rationale: [2-3 sentences]
```

---

## GOVERNANCE RULES (Simulation Engine)

1. **Simulations are projections, not predictions.** Every simulation output includes explicit uncertainty ranges and scenario labels. No simulation output is presented as a single deterministic number.
2. **No truth mutation.** Simulation outputs do not modify upstream Property KRs, component KRs, or portfolio metrics. Simulations are advisory.
3. **Assumptions must be documented.** Every scenario specifies its assumptions. Changing an assumption requires re-running the simulation with the new assumption documented.
4. **Stress tests must include mitigants.** Raw stress impact is shown alongside mitigated impact. The decision-maker sees both.
5. **Scenarios must bracket reality.** Bull and bear cases must be plausible, not extreme. A bear case where all properties simultaneously lose 80% of value is not useful. A bear case based on historical recession data is useful.
6. **Simulation does not replace due diligence.** A favorable simulation result does not authorize acquisition. The property must still pass the File 01 evaluation pipeline and confidence gate.

---

## VERSION HISTORY
- v1.0: Initial build. Deal Scenario Modeling (bull/base/bear, sensitivity variables, 9 return metrics). Development Scenario Simulation (construction variables, phased campus simulation, parallel development capacity). Market Cycle Stress Testing (5 stress scenarios, KaNeXT-specific mitigants, fund obligation capacity). Portfolio Optimization Simulation (4 alternative compositions, comparison metrics, optimization constraints). Cluster Housing Demand Simulation (demand model, gap analysis, acquisition phasing).
