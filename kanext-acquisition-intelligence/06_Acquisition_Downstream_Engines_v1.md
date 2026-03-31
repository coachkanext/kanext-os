# ACQUISITION DOWNSTREAM ENGINES
## v1.0

---

## 0. Purpose

The Acquisition Downstream Engines are the final downstream consumers of the KaNeXT Acquisition Intelligence System. They take everything the system knows about an acquired target - its evaluation, its component KRs, its System Fit, its integration plan - and translate it into actionable intelligence for post-close management.

These engines answer four questions for any completed acquisition:
1. **How is it performing?** - Actual vs projected across all dimensions
2. **Is the integration on track?** - Milestone completion, blockers, timeline adherence
3. **Should we exit?** - When to sell, wind down, or restructure an underperforming acquisition
4. **Should we expand?** - When to invest more capital into an outperforming acquisition

These engines do NOT evaluate targets. They do NOT modify Target KR, component KRs, System Fit, or any upstream output. They read governed truth and produce downstream recommendations only.

All outputs are deterministic: same inputs produce same outputs.

---

## 1. Post-Acquisition Monitoring Engine

### 1.1 Purpose
Track actual performance of each acquired target against pre-acquisition projections. Identify deviations early. Trigger intervention when performance degrades. Confirm value thesis when performance meets or exceeds projections.

### 1.2 Inputs (Must Pull)

**From Target Evaluation (upstream truth):**
- Final Target KR at time of acquisition
- Component KRs (FKR, OKR, SKR, RKR) at time of acquisition
- System Fit score at time of acquisition
- Pre-acquisition projections (revenue, profitability, customer retention, employee retention, integration milestones)
- Deal structure and capital deployed

**From Post-Close Operations (new data):**
- Monthly financial reports (revenue, expenses, profitability, cash flow)
- Quarterly management updates (operational metrics, team changes, market developments)
- Integration milestone status (from Integration Tracking Engine)
- Customer metrics (retention, satisfaction, growth)
- Employee metrics (retention, satisfaction, headcount changes)

### 1.3 Performance Monitoring Cadence

**Monthly:** Financial performance vs projection
- Revenue actual vs projected
- Expense actual vs projected
- Cash burn or cash generation vs projected
- Customer count vs projected
- Any material event (key person departure, regulatory action, major customer loss)

**Quarterly:** Comprehensive performance review
- Full Target KR re-evaluation using same pipeline as initial evaluation
- Component KR update (FKR, OKR, SKR, RKR) with current data
- System Fit re-assessment based on integration progress
- Integration milestone review
- Employee retention vs projected
- Customer retention vs projected
- Market position update (competitive changes, industry developments)

**Annual:** Strategic review
- Full evaluation refresh with latest audited financials (if available)
- Portfolio context update (does this target still fit the portfolio thesis)
- Expansion or disposition decision
- Capital efficiency review (actual return on deployed capital)
- Synergy realization assessment (are the projected synergies materializing)

### 1.4 Performance Deviation Triggers

Performance deviations trigger escalation based on severity and duration.

**Green Zone (no action):** Actual within +/- 10% of projection across all metrics.

**Yellow Zone (monitor closely):**
- Revenue 10-20% below projection for 1 quarter
- Key employee departure (not founder/CEO)
- Minor regulatory finding
- Customer retention 5-10% below projection
- Action: Increase monitoring frequency to bi-weekly. Document root cause. Develop corrective action plan.

**Orange Zone (intervention required):**
- Revenue 20-30% below projection for 1 quarter, OR 10-20% below for 2 consecutive quarters
- Founder/CEO departure or announced departure
- Regulatory enforcement action
- Customer retention 10-20% below projection
- Integration milestone missed by 60+ days
- Action: Executive review. Corrective action plan with 90-day milestones. Consider additional capital or team resources. Re-evaluate Target KR.

**Red Zone (strategic review):**
- Revenue 30%+ below projection for 1 quarter, OR 20%+ below for 2 consecutive quarters
- Multiple key person departures
- Severe regulatory action (consent order, license suspension)
- Customer retention 20%+ below projection
- Integration fundamentally stalled
- Action: Immediate strategic review. Disposition analysis triggered. Capital commitment re-evaluation. Board-level briefing if applicable.

### 1.5 Target KR Trajectory Tracking

Track Target KR over time to identify trends.

| Trajectory | Definition | Implication |
|-----------|-----------|-------------|
| Ascending | Target KR improved 3+ points over 2 consecutive quarterly re-evaluations | Investment thesis confirmed. Consider expansion. |
| Stable | Target KR within +/- 2 points over 2 consecutive quarterly re-evaluations | Performing as expected. Maintain current plan. |
| Declining | Target KR decreased 3+ points over 2 consecutive quarterly re-evaluations | Performance deteriorating. Investigate root cause. Intervention required. |
| Volatile | Target KR swings 5+ points between consecutive quarterly re-evaluations | Underlying instability. Investigate operational consistency. May indicate data quality issues. |

### 1.6 Monitoring Output Format

**Monthly Report:**
- Revenue actual vs projected (absolute and %)
- Key financial metrics (margin, cash, burn rate)
- Material events (if any)
- Zone status (Green/Yellow/Orange/Red)

**Quarterly Report:**
- Updated Target KR with component breakdown
- Performance vs projection across all dimensions
- Integration status summary
- Zone status with trend
- Recommendations (if deviation detected)

**Annual Report:**
- Full evaluation refresh
- Target KR trajectory (chart: KR over time since acquisition)
- Cumulative capital return (actual revenue and value creation vs capital deployed)
- Portfolio fit assessment
- Expansion or disposition recommendation
- Synergy realization scorecard

---

## 2. Integration Tracking Engine

### 2.1 Purpose
Track progress against the integration plan established in Mode 4 (Integration Intelligence). Ensure milestones are met. Identify blockers early. Adjust timeline and resources when needed.

### 2.2 Integration Phase Framework

Every operating company integration (excludes real estate purchases which have no operating integration) proceeds through five phases:

**Phase 0: Pre-Close Preparation (close minus 60 days to close)**
- Integration plan finalized
- Team assignments made
- Day 1 communication plan drafted
- Technology migration plan documented
- Customer communication strategy approved
- Regulatory approvals obtained (or timeline confirmed)
- Milestones: Integration plan signed off, team assembled, Day 1 playbook complete

**Phase 1: Day 1 - 30 (Stabilization)**
- Legal close executed
- Day 1 communications sent (employees, customers, vendors, regulators)
- Immediate operational continuity confirmed (nothing breaks)
- Key employee retention agreements executed
- Financial reporting established (target now reports into KaNeXT financial cadence)
- Milestones: Close complete, communications sent, operations stable, reporting active

**Phase 2: Day 31 - 90 (Foundation)**
- KaNeXT OS account activation for all acquired employees
- Initial workflow migration (email, calendar, communication onto KaNeXT platform)
- Financial integration (banking, payroll, AP/AR transition to KaNeXT systems)
- Customer transition begins (if applicable - payment methods, communication channels)
- Technology assessment complete (what migrates, what replaces, what sunsets)
- Milestones: Employees on KaNeXT OS, financials integrated, technology roadmap finalized

**Phase 3: Day 91 - 180 (Migration)**
- Core system migration (CRM, ERP, production systems onto KaNeXT OS or KaNeXT-approved platforms)
- Customer migration in progress (KayPay activation, communication channel transition)
- Data migration (historical data imported into KaNeXT intelligence systems)
- Process standardization (SOPs aligned with KaNeXT operating model)
- Milestones: Core systems migrated, 50%+ customers transitioned, data migration complete

**Phase 4: Day 181+ (Optimization)**
- Full operational integration complete
- All systems on KaNeXT OS or KaNeXT-managed platforms
- All revenue flowing through KayPay (where applicable)
- Data feeding intelligence engines
- Performance optimization (now that integration is complete, focus on improving operations)
- Milestones: Integration complete, KayPay active, intelligence data flowing, optimization underway

### 2.3 Integration Milestone Tracking

Each milestone is tracked with:
- Description
- Target date
- Actual completion date
- Status: COMPLETE / ON TRACK / AT RISK / MISSED / BLOCKED
- Owner (person responsible)
- Blocker description (if BLOCKED or AT RISK)
- Resolution plan (if BLOCKED or AT RISK)

### 2.4 Integration Health Score

Integration Health Score (0-100) is computed from milestone completion rates and blocker severity.

Health_Score = (Milestones_Complete / Milestones_Due) x 80 + Timeline_Adjustment + Blocker_Adjustment

**Timeline Adjustment:**
- All milestones on time or ahead: +10
- Average delay under 15 days: +5
- Average delay 15-30 days: 0
- Average delay 31-60 days: -5
- Average delay above 60 days: -10

**Blocker Adjustment:**
- No active blockers: +10
- 1 blocker with resolution plan: +5
- 2+ blockers with resolution plans: 0
- Any blocker without resolution plan: -10
- Blocker active for 30+ days without resolution: -15

### 2.5 Integration Health Interpretation

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | Healthy | On track. Continue current plan. |
| 75-89 | Adequate | Minor delays or issues. Monitor closely. Ensure blockers are being resolved. |
| 60-74 | Strained | Multiple delays or unresolved blockers. Escalate. Consider additional resources. |
| 40-59 | Distressed | Integration fundamentally behind. Executive intervention required. Re-plan timeline. |
| Below 40 | Failed | Integration has stalled. Strategic review required. Consider whether integration should continue, pivot, or target should remain standalone. |

---

## 3. Disposition Intelligence Engine

### 3.1 Purpose
Determine when to sell, wind down, or restructure an acquired company that is not meeting its investment thesis. This is the hardest decision in portfolio management. The system provides data-driven recommendations but the final decision is always human.

### 3.2 Disposition Triggers

Disposition analysis is triggered (not disposition itself, just the analysis) when any of the following conditions are met:

**Financial Triggers:**
- Actual revenue below 70% of projected for 2 consecutive quarters
- Negative cash flow exceeding projections by 50%+ for 2 consecutive quarters
- Capital required to sustain operations exceeds original budget by 50%+
- Acquired entity requires capital injection not budgeted in fund deployment

**Operational Triggers:**
- Integration Health Score below 40 for 2 consecutive months
- Key person departure (founder/CEO/CTO) with no qualified replacement within 90 days
- Customer retention below 60% (losing more than 4 in 10 customers)
- Technology platform failure requiring rebuild (not upgrade)

**Strategic Triggers:**
- KaNeXT strategy pivot makes the acquisition non-strategic
- Regulatory environment change makes the business model non-viable
- Competitive disruption eliminates the target's market position
- System Fit score declined below 50 (integration value no longer justifies portfolio inclusion)

**Market Triggers:**
- Unsolicited offer at 2x+ acquisition cost (worth evaluating even if target is performing)
- Industry consolidation creating opportunity for strategic exit
- Market conditions favorable for sale (seller's market in the target's sector)

### 3.3 Disposition Options

**Option 1: Hold and Fix**
- Diagnosis: Performance issues are correctable. Root cause identified. Fix is achievable with defined investment of time, capital, and management attention.
- Cost: Additional capital (quantified), management bandwidth (quantified in person-months), timeline (months to recovery)
- Expected outcome: Target KR recovery to projected level within defined timeline
- Decision criteria: Cost of fix is less than 30% of original investment AND projected recovery timeline under 12 months AND root cause is not structural

**Option 2: Restructure**
- Diagnosis: Current business model or operating structure is not working, but the underlying asset (team, technology, customer relationships, regulatory status) has value. Fundamental change in operations, market focus, or team is needed.
- Cost: Restructuring cost (severance, write-downs, system replacement), management bandwidth (significant), timeline (6-18 months)
- Expected outcome: Restructured entity achieves a revised (lower) Target KR that is acceptable within portfolio context
- Decision criteria: Asset value exceeds restructuring cost AND restructured entity still serves portfolio thesis

**Option 3: Sell**
- Diagnosis: Target is not fixable at acceptable cost, but has market value to a different buyer. Assets, technology, customer relationships, or regulatory status are valuable to someone else.
- Estimated sale value: Based on current financial performance, asset value, and market conditions
- Cost: Transaction costs (legal, broker, tax implications), management distraction, portfolio disruption
- Expected outcome: Capital recovery (partial or full), portfolio simplification
- Decision criteria: Sale proceeds exceed estimated hold value (present value of future cash flows under restructured plan) AND buyer is available AND sale does not disrupt critical portfolio synergies

**Option 4: Wind Down**
- Diagnosis: Target has no sale value and no path to acceptable performance. Assets should be liquidated, operations ceased, and capital preserved.
- Cost: Wind-down costs (severance, lease termination, vendor obligations, regulatory closure requirements)
- Capital recovery: Liquidation value of assets
- Expected outcome: Loss crystallized, capital freed for redeployment
- Decision criteria: Wind-down cost is less than 12 months of continued operating losses AND no buyer available AND no restructuring path viable

### 3.4 Disposition Decision Framework

1. Run all four options through the framework above
2. Rank by expected value (capital recovery + strategic value) net of costs
3. Evaluate portfolio impact (does disposition break a critical synergy pair)
4. Consider timing (is this the right moment to act, or would waiting 90 days change the calculus)
5. Present recommendation with Option 1 (hold and fix) as the default unless evidence clearly favors another option. The system biases toward patience because acquisition value often takes longer to materialize than projected.

### 3.5 Sunk Cost Rule
The amount of capital already deployed in the acquisition is IRRELEVANT to the disposition decision. The only relevant inputs are: current value, future projected value, cost to achieve that future value, and opportunity cost of capital. "We already spent $15M" is not a reason to spend another $5M. The disposition decision is made on forward-looking economics only.

---

## 4. Expansion Intelligence Engine

### 4.1 Purpose
Determine when an acquired company should receive additional investment - new capital, new locations, expanded scope, new products, or increased team - based on demonstrated performance and market opportunity.

### 4.2 Expansion Triggers

Expansion analysis is triggered when any of the following conditions are met:

**Performance Triggers:**
- Actual revenue exceeds projection by 20%+ for 2 consecutive quarters
- Target KR improved 5+ points from acquisition KR (ascending trajectory confirmed)
- Integration complete ahead of schedule (Phase 4 reached before target date)
- Customer demand exceeds current capacity
- Gross margin improving (operational efficiency gains realized)

**Market Triggers:**
- Adjacent market opportunity identified that leverages existing assets
- Competitor exit creating market share opportunity
- Regulatory change creating new market access
- Geographic expansion opportunity aligned with KaNeXT footprint

**Portfolio Triggers:**
- Synergy pair partner acquired, creating combined expansion opportunity
- Portfolio gap that this target could fill with expanded scope
- Fund capital available and deployment timeline permits additional investment

### 4.3 Expansion Types

**Type 1: Capital Expansion (More Investment in Existing Operations)**
- Use case: Operations at or near capacity. Customer demand exceeds supply. Unit economics proven. More capital = more revenue.
- Examples: Fulfillment center expanding warehouse capacity. Camera company increasing production run. VoIP expanding network capacity.
- Decision criteria: Incremental ROI exceeds 25% within 18 months. Operational team can absorb expansion without degradation. Capital available in fund reserve.

**Type 2: Geographic Expansion (New Locations)**
- Use case: Business model proven in current geography. Adjacent geographies have similar demand characteristics. Expansion serves KaNeXT footprint strategy.
- Examples: Enrollment company opening satellite offices in school network cities. Bank opening additional branches in MDI-designated communities.
- Decision criteria: Market analysis supports demand in new geography. Operating model is replicable. Expansion aligns with KaNeXT physical footprint. Capital and team capacity available.

**Type 3: Scope Expansion (New Products or Services)**
- Use case: Existing customer base has adjacent needs not being served. New product leverages existing infrastructure. Scope expansion strengthens competitive moat.
- Examples: Camera company developing new product tier (Broadcast model). VoIP adding video capability. Enrollment company adding retention services (not just recruitment).
- Decision criteria: Customer demand validated. Product development cost reasonable. Expansion strengthens the KaNeXT ecosystem (increases System Fit). Does not dilute core competency.

**Type 4: Acquisition Expansion (Bolt-On Acquisition)**
- Use case: A smaller company in the same industry would accelerate the acquired target's growth faster than organic expansion. The bolt-on fills a specific gap (technology, customer base, geographic reach, team).
- Examples: VoIP company acquiring a smaller competitor for customer base. Camera company acquiring a component supplier for vertical integration.
- Decision criteria: Bolt-on passes its own Target KR evaluation (Mode 1). Combined entity Target KR exceeds current Target KR. Integration complexity is manageable within existing capacity. Capital available.

### 4.4 Expansion Proposal Format

Every expansion recommendation includes:

1. **Opportunity Summary** - What is the expansion and why now
2. **Performance Evidence** - What data supports the expansion (performance vs projection, market data, customer demand)
3. **Expansion Type** - Which of the four types
4. **Capital Required** - Total investment and timeline
5. **Expected Return** - Revenue impact, Target KR impact, System Fit impact, Portfolio KR impact
6. **Risk Assessment** - What could go wrong. Downside scenario.
7. **Portfolio Impact** - How does this expansion affect concentration, integration load, synergy map
8. **Recommendation** - Proceed / Defer / Decline with rationale

### 4.5 Expansion Governance

- Expansion proposals are treated as mini-evaluations. They follow the same deterministic, auditable, no-fabrication rules as initial target evaluations.
- Expansion capital comes from fund reserve or operational cash flow, not from reallocating committed acquisition budgets.
- Expansion does not proceed while Integration Health Score is below 75 for the target in question. Finish integration before expanding.
- Each expansion is tracked as a separate investment with its own performance monitoring cadence.

---

## 5. Cross-Engine Dependencies

The four downstream engines interact but maintain strict information flow:

```
Post-Acquisition Monitoring
    |
    |--> Performance data feeds Integration Tracking (is integration causing performance issues?)
    |--> Performance deviations trigger Disposition Analysis (is it time to exit?)
    |--> Performance outperformance triggers Expansion Analysis (is it time to invest more?)

Integration Tracking
    |
    |--> Integration health feeds Monitoring (integration status is a performance dimension)
    |--> Stalled integration feeds Disposition (can we integrate or should we exit?)

Disposition Intelligence
    |
    |--> Disposition decision feeds Portfolio KR (if target exits, recompute portfolio)
    |--> Disposition frees capital for Expansion or new acquisition

Expansion Intelligence
    |
    |--> Expansion changes Target KR (expanded target re-evaluated)
    |--> Expansion changes Portfolio KR (recompute with updated target and capital)
    |--> Expansion adds integration load (new integration tracked)
```

### Information Flow Rules
- Monitoring feeds all other engines (it is the data source)
- Integration Tracking feeds Monitoring and Disposition (it is a performance dimension and a disposition trigger)
- Disposition and Expansion are mutually exclusive per target per quarter (you do not simultaneously plan to exit and expand the same target)
- All engines read from upstream truth (Target KR, component KRs, System Fit) and never modify it

---

## GOVERNANCE RULES

1. **No truth mutation.** Downstream engines never modify Target KR, component KRs, System Fit, or any upstream evaluation output. When these engines recommend a Target KR re-evaluation, the re-evaluation follows the full upstream pipeline.
2. **Deterministic.** Same inputs produce same outputs. Performance monitoring, integration tracking, disposition analysis, and expansion analysis are all repeatable and auditable.
3. **No data fabrication.** If performance data is missing for a period, that period is flagged as UNREPORTED, not estimated. Monitoring gaps are a risk flag, not a gap to fill with assumptions.
4. **Sunk cost independence.** Capital already deployed is never a factor in forward-looking decisions. Only current value, projected future value, cost to achieve that value, and opportunity cost matter.
5. **Patience bias.** The system defaults to patience. Acquisition value often takes longer than projected to materialize. Disposition is a last resort, not a first response to a bad quarter. But patience has limits - 2+ consecutive quarters in the Red Zone demands strategic review.
6. **Integration before expansion.** No expansion proceeds while integration is incomplete or distressed. Finish building the foundation before adding floors.
7. **Portfolio awareness.** Every disposition and expansion decision is evaluated in portfolio context, not in isolation. Exiting a target that breaks a critical synergy pair has portfolio-wide consequences. Expanding a target that increases concentration risk must be weighed against diversification value.

---

## VERSION HISTORY
- v1.0: Initial build. Four downstream engines: Post-Acquisition Monitoring (monthly/quarterly/annual cadence, deviation zones, Target KR trajectory tracking), Integration Tracking (five-phase framework, milestone tracking, Integration Health Score), Disposition Intelligence (four triggers, four options, sunk cost rule, decision framework), Expansion Intelligence (four triggers, four types, proposal format, governance). Cross-engine dependency map with information flow rules.
