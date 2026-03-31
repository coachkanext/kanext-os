# ACQUISITION SIMULATION ENGINE
## v1.0

---

## 0. Scope

This is the single authoritative document for acquisition simulation. It replaces no prior document (first version).

The Acquisition Simulation Engine models outcomes before they happen. It answers "what if" questions across three domains:

1. **Deal Simulation** - What happens if we acquire target X at price Y with structure Z?
2. **Portfolio Simulation** - What happens to the overall portfolio if we add, remove, or change a target?
3. **Stress Testing** - What happens if key assumptions break? Revenue misses, integration stalls, regulation blocks, market shifts.

The Simulation Engine does not evaluate targets. It does not modify Target KR, component KRs, System Fit, or any upstream output. It consumes governed truth from upstream and projects forward under stated assumptions. Every simulation output includes the assumptions that produced it.

All outputs are deterministic: same inputs and same assumptions produce same outputs.

---

## 1. Inputs (Non-Negotiable)

The Simulation Engine consumes only:

**From Target Evaluation (upstream truth):**
- Final Target KR for each target in the simulation
- Component KRs (FKR, OKR, SKR, RKR)
- System Fit score
- Integration complexity tier
- Risk flags triggered

**From Portfolio Intelligence (upstream truth):**
- Portfolio KR (current)
- Concentration metrics (current)
- Synergy map (current)
- Integration load (current)
- Capital deployed and remaining

**From Deal Context:**
- Budget allocation per target
- Deal structure (from templates in File 02)
- Deployment timeline
- Fund capital constraints ($500M LP, $1B total)
- Integration team capacity

**From User (simulation parameters):**
- Scenario definition (what is being simulated)
- Assumption overrides (e.g., "assume revenue comes in 30% below projection")
- Time horizon (how far forward to project)

Explicit exclusions (locked):
- No Target KR recomputation
- No component KR modification
- No upstream truth mutation
- No assumptions treated as facts

---

## 2. Deal Simulation

### 2.1 Purpose
Model the outcome of a specific acquisition deal before committing capital. Answer: What does the portfolio look like after this deal closes?

### 2.2 Deal Simulation Inputs

Per deal being simulated:
- Target name and Target KR (from evaluation)
- Purchase price and deal structure
- Integration complexity and timeline
- Projected revenue contribution (Year 1, Year 3, Year 5)
- Projected cost (operating cost, integration cost, ongoing capital needs)
- Synergy pairs activated by this acquisition

### 2.3 Deal Simulation Outputs

**Portfolio Impact:**
- Portfolio KR before deal: [current]
- Portfolio KR after deal: [projected]
- Delta: [change in Portfolio KR]
- Concentration change: [new concentration metrics vs current]
- Integration load change: [new load ratio vs current]
- Synergy activation: [which synergy pairs are activated or strengthened]

**Capital Impact:**
- Capital deployed for this deal: [amount]
- Remaining fund capital after deal: [amount]
- % of total fund deployed: [percentage]
- Capital efficiency of this deal: [Target KR / capital deployed, raw and KLVN-adjusted]

**Return Projection (Base Case):**
- Year 1 revenue contribution: [projected]
- Year 3 revenue contribution: [projected]
- Year 5 revenue contribution: [projected]
- Payback period: [months until cumulative revenue equals capital deployed]
- IRR estimate: [if sufficient data for DCF, else INSUFFICIENT DATA]

**Risk Profile:**
- Integration risk flags triggered: [list]
- Concentration risk change: [better / worse / neutral]
- Regulatory approval risk: [timeline and probability estimate]
- Key person dependency exposure: [if applicable]

### 2.4 Deal Comparison Mode

When evaluating multiple potential deals (e.g., "should we buy VoIP Company A or VoIP Company B"), run Deal Simulation for each and produce a comparison table:

| Dimension | Deal A | Deal B | Winner |
|-----------|--------|--------|--------|
| Target KR | | | Higher KR |
| Capital required | | | Lower capital |
| Portfolio KR impact | | | Higher delta |
| System Fit | | | Higher fit |
| Integration complexity | | | Lower complexity |
| Revenue projection (Y3) | | | Higher revenue |
| Risk flags | | | Fewer flags |
| Capital efficiency | | | Lower cost per KR |
| Synergy activation | | | More synergies |

Winner column identifies the superior option per dimension. Overall recommendation weighs all dimensions with SKR (strategic value) as the tiebreaker.

---

## 3. Portfolio Simulation

### 3.1 Purpose
Model what the overall portfolio looks like under different composition scenarios. Answer: What is the best allocation of our $1B across available targets?

### 3.2 Simulation Types

**Type A: Addition Simulation**
"What happens if we add [target] to the portfolio?"
- Run Deal Simulation (Section 2) for the new target
- Recompute Portfolio KR with the new target included
- Recompute concentration metrics
- Recompute synergy map
- Recompute integration load
- Output: before/after comparison across all portfolio dimensions

**Type B: Removal Simulation**
"What happens if we remove [target] from the portfolio?"
- Remove target from portfolio computation
- Recompute Portfolio KR without the target
- Identify broken synergy pairs
- Calculate capital freed
- Output: before/after comparison, synergy impact, capital reallocation options

**Type C: Swap Simulation**
"What happens if we replace [target A] with [target B]?"
- Run Removal Simulation for target A
- Run Addition Simulation for target B against the post-removal portfolio
- Output: net change across all portfolio dimensions

**Type D: Budget Reallocation Simulation**
"What happens if we shift $X from [target A] to [target B]?"
- Adjust capital weights
- Recompute Portfolio KR with new weights
- Check if reallocation changes integration load or synergy activation
- Output: before/after comparison with capital efficiency analysis

**Type E: Full Portfolio Optimization**
"Given our targets and budget, what is the optimal allocation?"
- Rank all targets by system fit-weighted capital efficiency
- Allocate capital starting from highest-efficiency targets
- Check concentration constraints (flag if any type exceeds 60%)
- Check integration load constraints (flag if simultaneous integrations exceed capacity)
- Check synergy activation (prioritize targets that complete synergy pairs)
- Output: recommended allocation with Portfolio KR, concentration, synergy, and load analysis

### 3.3 Portfolio Simulation Constraints

Every portfolio simulation respects these hard constraints:
- Total capital cannot exceed $1B (all sources)
- Fund LP capital cannot exceed $500M
- No individual target budget can exceed its Capital Deployment allocation without explicit override
- Integration team capacity limits simultaneous active integrations
- Regulatory timelines are not compressible (bank approval takes as long as it takes)

---

## 4. Stress Testing

### 4.1 Purpose
Model what happens when key assumptions break. Every acquisition thesis rests on assumptions. Stress testing identifies which assumptions, if wrong, would materially damage the portfolio.

### 4.2 Standard Stress Scenarios

The following scenarios are run as standard practice for every major acquisition decision. Each scenario modifies one or more assumptions and recomputes all downstream outputs.

**Scenario 1: Revenue Miss**
- Assumption override: Target revenue comes in at 70% of projection (30% miss)
- Impact computed: FKR change, Target KR change, Portfolio KR change, payback period extension, capital efficiency degradation
- Threshold question: At 70% revenue, is this still a worthwhile acquisition?

**Scenario 2: Deep Revenue Miss**
- Assumption override: Target revenue comes in at 50% of projection
- Impact computed: same as Scenario 1 but more severe
- Threshold question: At 50% revenue, does the acquisition require additional capital? Does it trigger disposition analysis?

**Scenario 3: Integration Delay**
- Assumption override: Integration takes 2x the projected timeline
- Impact computed: Integration load penalty duration extended, synergy activation delayed, opportunity cost of management bandwidth, delayed revenue contribution
- Threshold question: At 2x integration timeline, does the deal still make sense? What is the cost of the delay?

**Scenario 4: Key Person Departure**
- Assumption override: Founder or CEO of acquired company leaves within 6 months of close
- Impact computed: OKR degradation, Target KR change, integration risk, customer retention impact, knowledge loss
- Threshold question: Can the acquisition survive this departure? What is the cost of retention vs replacement?

**Scenario 5: Regulatory Block**
- Assumption override: Regulatory approval is denied or delayed by 12+ months
- Impact computed: Deal cannot close (for regulated targets), capital frozen, integration plan stalled, opportunity cost
- Threshold question: Is there a Plan B (different structure, different target, appeal process)? What is the cost of the delay?

**Scenario 6: Market Downturn**
- Assumption override: Target's industry experiences 20% revenue decline across the sector
- Impact computed: FKR degradation across all targets in that sector, Portfolio KR change, concentration risk amplified
- Threshold question: Is the portfolio resilient to sector-wide decline? Which targets are most exposed?

**Scenario 7: Interest Rate Shock**
- Assumption override: Interest rates increase 200bps, affecting construction financing, bank capitalization cost, and real estate valuations
- Impact computed: Construction budget increase, bank NIM change, real estate valuation change, total capital requirement change
- Threshold question: Does the fund have sufficient reserve to absorb the cost increase?

**Scenario 8: Enrollment Shortfall (FMU-specific)**
- Assumption override: FMU enrollment reaches only 60% of Year 1 projection (1,260 instead of 2,100 on-campus)
- Impact computed: Tuition revenue shortfall, housing revenue shortfall, athletics budget pressure, enrollment company ROI degradation, portfolio revenue concentration shifts
- Threshold question: At 60% enrollment, is the institutional thesis still viable? What is the burn rate and how long can the fund sustain it?

**Scenario 9: Simultaneous Stress**
- Assumption override: Revenue miss (70%) AND integration delay (1.5x) AND key person departure at one target
- Impact computed: Combined degradation across all dimensions
- Threshold question: Can the portfolio survive multiple simultaneous adverse events? This is the "bad year" scenario.

### 4.3 Custom Stress Scenarios

Beyond the standard nine, the user can define custom stress scenarios by specifying:
1. Which assumption(s) to override
2. The override value(s)
3. Which target(s) are affected (single target, target type, or entire portfolio)

The engine runs the same computation: modify assumption, recompute all downstream outputs, compare to base case, identify threshold breach.

### 4.4 Stress Test Output Format

Each stress test produces:

**Scenario Summary:**
- Name and description
- Assumptions overridden (original value and stress value)
- Targets affected

**Impact Analysis:**
- Target KR change (per affected target)
- Portfolio KR change
- Capital impact (additional capital required, if any)
- Timeline impact (delays, if any)
- Risk flag changes (new flags triggered)

**Threshold Assessment:**
- Does the deal still meet minimum acceptable return? (Yes/No with data)
- Does the portfolio maintain acceptable diversification? (Yes/No with data)
- Is additional capital required beyond current allocation? (Yes/No, amount)
- Are new risk flags triggered? (Yes/No, list)

**Resilience Score (0-100):**
Composite measure of how well the portfolio withstands the stress scenario.
- 90-100: Portfolio absorbs the stress with minimal impact. Thesis intact.
- 75-89: Portfolio impacted but recoverable. No structural damage. Minor adjustments needed.
- 60-74: Portfolio materially impacted. Recovery requires active intervention. Some targets may need restructuring.
- 40-59: Portfolio significantly damaged. Multiple targets underperforming. Capital reserves strained. Strategic review required.
- Below 40: Portfolio thesis challenged. Multiple targets in distress. Capital may be insufficient. Major restructuring needed.

---

## 5. Interaction Library (Deal Structure x Target Type)

Like the basketball Interaction Library (System x System, Archetype x System), the Acquisition Simulation Engine maintains an interaction table mapping Deal Structures against Target Types. Each interaction describes the expected friction, risk profile, and timeline characteristics.

### 5.1 Deal Structure x Target Type Matrix

**Cash Acquisition x Bank**
- Friction: HIGH. Regulatory approval required regardless of deal structure. Cash purchase may trigger additional FDIC review if purchase price implies charter premium.
- Timeline: 6-12 months for regulatory approval. Cannot accelerate.
- Risk: Regulatory denial. Conditions imposed. Capital requirements above purchase price.
- Recommendation: Zero-upfront with deposit commitment is almost always superior for bank targets. Cash acquisition only if seller insists and charter value justifies premium.

**Cash Acquisition x Technology Company**
- Friction: LOW. Standard M&A process. No regulatory approval (typically).
- Timeline: 60-90 days from LOI to close.
- Risk: IP ownership disputes surface in DD. Key person departs post-close.
- Recommendation: Cash with holdback (10-15%) for rep and warranty coverage. Escrow for IP indemnification.

**Cash Acquisition x School/University**
- Friction: VERY HIGH. Accreditation agency approval required. State authorization review. Title IV implications. Board approval. Community stakeholder process.
- Timeline: 12-24 months from LOI to operational control.
- Risk: Accreditation agency blocks or conditions transfer. Title IV eligibility disrupted. Community opposition.
- Recommendation: Philanthropic transfer or IOA structure almost always superior. Cash acquisition of a university is rarely the right structure.

**Cash Acquisition x Infrastructure (VoIP, Camera, Fulfillment)**
- Friction: LOW to MODERATE. Standard M&A. VoIP may require FCC notification. Camera and fulfillment are straightforward.
- Timeline: 60-120 days from LOI to close. VoIP may add 30-60 days for FCC process.
- Risk: Customer concentration. Technology debt discovered in DD. Inventory valuation disputes.
- Recommendation: Cash with earnout component if valuation uncertain. Asset purchase if liability exposure elevated.

**Cash Acquisition x Real Estate**
- Friction: LOW. Standard real estate transaction. Title search, environmental assessment, survey, zoning confirmation.
- Timeline: 60-120 days from contract to close. Longer if zoning requires modification.
- Risk: Environmental issues. Title defects. Zoning denial. Market value decline between contract and close.
- Recommendation: Cash at close with standard contingencies (inspection, environmental, financing if applicable).

**Cash Acquisition x Media Company**
- Friction: LOW to MODERATE. Standard M&A. Content licensing agreements may complicate transfer.
- Timeline: 60-90 days.
- Risk: Content rights reversion on change of control. Talent departure. Audience fragility.
- Recommendation: Cash with holdback for content rights verification. Equity rollover if talent retention critical.

**Zero-Upfront with Deposit Commitment x Bank**
- Friction: MODERATE. Regulatory process still required but FDIC and OCC are generally supportive of acquirers willing to recapitalize distressed or small banks.
- Timeline: 6-12 months regulatory. The $0 purchase price actually simplifies seller negotiation.
- Risk: Regulatory conditions on capitalization levels. Ongoing compliance obligations. Deposit commitment is a real capital deployment.
- Recommendation: Preferred structure for bank acquisitions. Capital deployed as bank capitalization is an asset on the balance sheet, not sunk cost.

**Philanthropic Transfer x School**
- Friction: MODERATE to HIGH. Requires willing institutional partner, board approval, accreditation notification, legal structuring. But avoids adversarial negotiation.
- Timeline: 6-18 months depending on institutional readiness and accreditation agency timeline.
- Risk: Accreditation agency imposes conditions. Donor/contributor requirements. Deed transfer complexity.
- Recommendation: Preferred structure for university partnerships. The IOA model (operational partnership + philanthropic campus acquisition) is the KaNeXT standard.

**Earnout x Technology Company**
- Friction: LOW for deal execution. MODERATE for post-close management.
- Timeline: 60-90 days to close. 2-3 year earnout period.
- Risk: Earnout disputes. Seller manages to metrics, not long-term value. Integration complicated by seller incentive misalignment during earnout period.
- Recommendation: Use when valuation gap exceeds 30% between buyer and seller. Define milestones precisely. Include integration cooperation as an earnout condition.

**Earnout x Enrollment Company**
- Friction: LOW for deal execution. LOW for post-close (enrollment metrics are clean and measurable).
- Timeline: 60-90 days to close. 2-year earnout tied to enrollment growth.
- Risk: Seller cherry-picks easy enrollments during earnout period. Quality of enrolled students may suffer if seller is incentivized on volume only.
- Recommendation: Strong fit. Enrollment growth is directly measurable. Include retention (not just enrollment) in earnout metrics to prevent quality degradation.

**Equity Rollover x Any Target with Founder Dependency**
- Friction: MODERATE. Requires negotiation of minority rights, governance provisions, put/call terms.
- Timeline: 90-120 days (more complex documentation).
- Risk: Minority holder disputes. Governance friction. Founder disengagement despite retained equity.
- Recommendation: Use when founder retention is critical to deal value. Keep minority stake small (10-20%). No board seat. Information rights only. Clean put/call at 3-5 years.

---

## 6. Simulation Governance Rules

1. **Assumptions are explicit.** Every simulation output includes the full set of assumptions that produced it. No hidden defaults. No implicit optimism.
2. **No truth mutation.** Simulations project from upstream truth. They never modify Target KR, component KRs, System Fit, or Portfolio KR. Simulation outputs are labeled as PROJECTED, not as evaluations.
3. **Deterministic.** Same inputs + same assumptions produce same outputs. Simulations are repeatable.
4. **No single-scenario decisions.** Every major acquisition decision requires at minimum: base case simulation, 2 stress scenarios, and 1 comparison (either deal comparison or portfolio simulation). Single-scenario analysis is insufficient for capital deployment.
5. **Stress tests are honest.** The engine does not soften stress scenarios to make deals look better. A 30% revenue miss is modeled as a 30% revenue miss, not as "temporary underperformance with rapid recovery."
6. **Resilience over return.** When stress tests reveal fragility, the system flags it even if the base case return is attractive. A deal that looks great in the base case but collapses under mild stress is a bad deal.
7. **Time value acknowledged.** All projections beyond 2 years carry increasing uncertainty. Year 1 projections are weighted more heavily than Year 5 projections in simulation outputs. The system does not pretend to know what happens in Year 5.
8. **Capital is finite.** Every simulation respects fund capital constraints. A deal that requires more capital than is available is not modeled as feasible regardless of its attractiveness.

---

## VERSION HISTORY
- v1.0: Initial build. Three simulation domains: Deal Simulation (single deal and comparison mode), Portfolio Simulation (five types: addition, removal, swap, reallocation, optimization), Stress Testing (nine standard scenarios plus custom). Deal Structure x Target Type Interaction Library with friction, timeline, risk, and recommendation per combination. Simulation governance rules emphasizing assumption transparency, no truth mutation, and resilience over return.
