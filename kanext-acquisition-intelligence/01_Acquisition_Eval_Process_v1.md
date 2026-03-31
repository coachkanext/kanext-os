# ACQUISITION EVALUATION PROCESS
## v1.0

---

## TARGET CONTEXT SETUP

Target Context Setup defines the binding environment for all downstream evaluation. No target evaluation, portfolio analysis, valuation model, or deal recommendation can execute until Target Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Target Name** - Legal entity name of the acquisition target
2. **Target Type** - Must match one of the six defined types: Bank/Financial Institution, Technology Company, School/University, Infrastructure Company, Real Estate/Land, Media/Content Company
3. **Industry** - Specific industry or sub-industry within the target type
4. **Transaction Size Tier** - Must match one of the five KLVN size tiers: Micro (under $5M), Small ($5M-25M), Mid ($25M-100M), Large ($100M-500M), Mega (above $500M)
5. **Geographic Location** - Primary operating location(s)
6. **Current Ownership Structure** - Private, public, nonprofit, government, family-owned, PE-backed

These fields bind: KLVN normalization bands, Target Type Legend selection, component KR weighting, System Fit computation, Deal Structure Template eligibility, and confidence gate ranges.

### Optional Metadata
Non-blocking if blank. Used for enriched evaluation when available.

1. Employee count
2. Year founded
3. Revenue (if known)
4. Number of locations
5. Regulatory status (licenses, charter, accreditation)
6. Existing debt or obligations
7. Seller motivation (succession, distress, strategic, mandate)

### Optional Constraints (Downstream Only)
These fields do not alter component KR scoring or Target KR computation. They are consumed only by downstream planning and recommendation systems (Portfolio Intelligence, Valuation Modeling, Deal Structure).

1. Maximum budget allocation (from Capital Deployment schedule)
2. Target close date
3. Integration priority (immediate, phased, standalone)
4. Regulatory approval timeline estimate
5. Available integration team capacity

### Context Lock
When all required fields (1-6) are populated and validated, system state transitions to Target Context Locked. This locked context is the binding reference for all downstream engines. It cannot be modified mid-evaluation without restarting the pipeline.

### Governance
Target types must exactly match the six defined categories. Transaction size tiers must exactly match KLVN size keys. Any change to required fields, validation rules, or downstream bindings requires documentation, versioning, and approval.

---

## TARGET PROFILE

Target Profile (Data Record)

### A) Entity Identity
- Legal entity name
- DBA / trade names
- Entity type (LLC, Corp, LP, nonprofit, etc.)
- State of incorporation / formation
- Date of incorporation
- EIN / Tax ID
- Primary business address
- Additional locations
- Website
- Key contact (owner, CEO, broker)

### B) Ownership and Capitalization
- Current ownership structure (names, percentages)
- Cap table (if applicable)
- Outstanding equity (common, preferred, options, warrants)
- Debt schedule (all outstanding obligations with terms)
- Liens and encumbrances
- Change-of-control provisions in existing agreements

### C) Financial Summary (Most Recent Available)
- Annual revenue (3 years if available)
- Revenue growth rate
- Gross margin
- Operating margin
- EBITDA
- Net income
- Total assets
- Total liabilities
- Cash and equivalents
- Accounts receivable
- Accounts payable
- Working capital
- Capital expenditure (annual)
- Source: audited, unaudited, management-prepared, estimated

### D) Operational Profile
- Employee count (FT, PT, contractor)
- Organization chart (if available)
- Key personnel (names, roles, tenure)
- Technology stack summary
- Customer count
- Top customer concentration (% of revenue)
- Vendor/supplier dependencies
- Facility description (owned vs leased, condition, capacity)
- Process maturity level (documented SOPs, certifications, audits)

### E) Regulatory Status
- Licenses and permits (federal, state, local)
- Regulatory body oversight (FDIC, OCC, FCC, accreditation agencies, state boards)
- Compliance history (any findings, enforcement actions, consent orders)
- Pending regulatory applications or reviews
- Required approvals for change of control

### F) Legal Status
- Pending litigation (plaintiff and defendant)
- Threatened claims
- Outstanding liens
- Contractual obligations that transfer with entity
- Non-compete or non-solicitation agreements
- IP ownership (patents, trademarks, copyrights, trade secrets)
- Environmental liability (if real property involved)

### G) Market Position
- Market size (total addressable market)
- Market share (estimated)
- Primary competitors
- Competitive advantages/disadvantages
- Industry growth rate
- Pricing power
- Customer acquisition cost
- Customer lifetime value

### H) Source Attribution
- Source for each data element (audited financials, management representation, public filing, broker package, web research, estimate)
- Verification status: verified / unverified
- Known data gaps (missing financials, missing legal records, etc.)
- Date of most recent data point per category

### Locked Exclusions (never in Target Profile)
- Target KR or component KRs
- System Fit scores
- Valuation estimates
- Deal recommendations
- Integration assessments

These are computed outputs, never stored as input data.

---

## TARGET CONFIDENCE GATE

Every evaluation carries a confidence percentage reflecting the quality and completeness of available data. Confidence gates determine what outputs are permitted at each confidence level.

### Confidence Tiers

**Tier 1: Full Diligence (confidence 90-100%)**
Data available: Audited financials (3 years), completed site visit, management interviews, legal review complete, regulatory status confirmed, customer references obtained, technology audit complete, employment records reviewed.
Permitted outputs: Full Target KR with component KRs, System Fit score, integration assessment, valuation model with DCF, deal structure recommendation, close recommendation.

**Tier 2: Deep Assessment (confidence 75-89%)**
Data available: Unaudited financials (2+ years), management conversations conducted, public records reviewed, regulatory status confirmed, no site visit or partial site visit, no technology audit.
Permitted outputs: Full Target KR with component KRs, System Fit score, integration assessment (preliminary), valuation model (multiples-based, no DCF), deal structure options (not recommendation), no close recommendation.

**Tier 3: Informed Estimate (confidence 60-74%)**
Data available: Partial financials (1 year or management-prepared), limited management interaction, public data, industry benchmarks applied where gaps exist.
Permitted outputs: Target KR with component KRs (flagged as estimated), System Fit score (preliminary), integration complexity tier (not detailed assessment), valuation range (broad), no deal structure recommendation.

**Tier 4: Directional Assessment (confidence 40-59%)**
Data available: Public data only. Revenue estimated from industry comps or public sources. No proprietary financial information. No management access.
Permitted outputs: Target KR range (10-point band, not decimal), component KRs as ranges, System Fit estimate (high/medium/low), integration complexity estimate (light/moderate/heavy/transformational), valuation order of magnitude only. All outputs flagged as DIRECTIONAL.

**Tier 5: Insufficient Data (confidence below 40%)**
Data available: Name, type, general industry context. Minimal verifiable information.
Permitted outputs: Target type classification, preliminary research agenda (what data is needed to elevate confidence). No Target KR, no component KRs, no valuation, no deal recommendation. The ONLY output at this tier is a data collection plan.

### Confidence Degradation Rules
- Each unscored component KR dimension drops confidence by 5%
- Financial data older than 24 months drops confidence by 15%
- Financial data between 12-24 months drops confidence by 10%
- No site visit caps confidence at 85%
- No management interaction caps confidence at 75%
- No legal review caps confidence at 80%
- Multiple degradation factors stack (minimum confidence = 20%)

---

## TARGET EVALUATION ENGINE (Master Execution Flow)

This is the step-by-step pipeline for evaluating any acquisition target. Every step must execute in order. No step may be skipped. If a step cannot complete due to missing data, the evaluation proceeds with reduced confidence and the step is flagged as INCOMPLETE.

### Step 1: Context Lock
- Populate all required fields in Target Context Setup
- Validate target type against the six defined categories
- Validate transaction size tier against KLVN bands
- Lock context. No changes permitted after lock without pipeline restart.

### Step 2: Data Gathering
- Execute Data Gathering Protocol from SKILL.md (File 07)
- Internal lookup: check target registry for existing data
- Public data search: financials, news, regulatory, competitive position
- Industry context search: market size, growth rate, comparable transactions
- Populate Target Profile with all gathered data
- Note all data gaps for confidence gate calculation

### Step 3: Confidence Gate Assessment
- Calculate initial confidence_pct based on data availability
- Apply degradation rules for missing data categories
- Determine confidence tier (1-5)
- If Tier 5 (below 40%): STOP. Output data collection plan only. No evaluation proceeds.
- If Tier 4 (40-59%): Proceed with DIRECTIONAL flag on all outputs
- If Tier 3+ (60%+): Proceed with standard evaluation

### Step 4: Phase 3 - Target Type Anchor
- Read the Target Type Legend for this target's type (File 02)
- Map the target's operational profile against legend tier descriptions
- Identify the tier whose PROFILE DESCRIPTION matches the target
- Record the anchor range (e.g., 75-79)
- Write the anchor and justification BEFORE proceeding to Phase 6

**Anchoring Rules (MANDATORY):**
a. Anchor against operational profile, not brand reputation
b. Revenue quality matters more than revenue size
c. Strategic fit does not inflate Target KR
d. Deal structure does not affect Target KR
e. Comparable transactions are context, not anchors
f. Read the profile first, check the category second

### Step 5: Phase 6 - Component KR Scoring
- Score FKR using the Financial KR rubric (File 02)
- Score OKR using the Operational KR rubric (File 02)
- Score SKR using the Strategic KR rubric (File 02)
- Score RKR using the Risk KR rubric (File 02)
- Each component scored to one decimal place
- Each component includes 2-3 sentence justification
- Unscored dimensions flagged with reason

### Step 6: Phase 6 Adjustment
- Calculate composite component KR: (FKR + OKR + SKR + RKR) / 4
- Compare composite to anchor midpoint
- If composite is above anchor midpoint: adjust upward within anchor range
- If composite is below anchor midpoint: adjust downward within anchor range
- Maximum adjustment: +/- 10 points from anchor range edges
- Adjustments beyond +/- 5 require written justification
- Phase 6 NEVER overrides Phase 3

### Step 7: Suppression Check
- Review Suppression Detection framework (File 02)
- Check for: environment suppression, resource suppression, market suppression, ownership suppression
- If suppression detected: document evidence, project performance under KaNeXT ownership
- Suppression adjustment: up to +5 KR with written justification and reduced confidence

### Step 8: Final Target KR
- Apply Phase 6 adjustment to Phase 3 anchor
- Apply suppression adjustment (if any)
- Final Target KR reported to one decimal place
- Include anchor range, component KRs, adjustments, and confidence_pct

### Step 9: System Fit Computation
- Score all five System Fit dimensions (File 02)
- Compute weighted composite
- Include dimensional breakdown in output

### Step 10: KLVN Contextualization
- Calculate composite lambda (size x industry x regulatory)
- Report lambda-adjusted interpretation alongside raw Target KR
- Example: "Target KR 76.2 with composite lambda 1.21 reads as operationally equivalent to 92.2 in an unregulated mid-size context"

### Step 11: Integration Risk Flag Check
- Review all six Integration Risk Flags (File 02)
- Flag any triggered flags with evidence
- Require mitigation plan for each triggered flag

### Step 12: Output Assembly
- Compile all outputs per the Mode 1 output format specified in SKILL.md
- Include confidence_pct prominently
- Flag all estimated or directional values
- Include data gaps and recommended next steps to improve confidence

---

## MULTI-TYPE PROTOCOL

When a target spans multiple types (e.g., a university that also operates a media company, or a technology company with real estate assets), use the following protocol:

1. Identify the primary type based on revenue source (what generates the most revenue)
2. Use the primary type legend for Phase 3 anchoring
3. Score component KRs with awareness of secondary type characteristics
4. In SKR (Strategic KR), credit the secondary type value in the "KaNeXT Mission Alignment" and "KaNeXT OS Integration Potential" dimensions
5. Note the multi-type classification in the output with both types and the rationale for primary selection

---

## SUPPRESSION DETECTION RULES

Suppression detection follows the same logic as basketball intelligence: identify targets whose observable performance is artificially depressed by factors external to the target's intrinsic capability.

### Detection Triggers
- Target's financial performance is below industry median AND there is a documented external constraint (regulatory action, ownership dispute, capital starvation, management vacancy)
- Target has strong assets (technology, team, customer relationships, licenses) but poor financial results
- Target is in a turnaround situation where the cause of decline has been addressed but results have not yet recovered
- Target is operating in a temporarily depressed market where structural demand is intact

### Evidence Requirements
Suppression cannot be claimed based on optimism alone. Each suppression claim requires:
1. Identification of the specific suppression factor
2. Evidence that the factor is external (not intrinsic to the business)
3. Evidence that removing the factor would improve performance
4. Quantification of the projected improvement (approximate range, not precise)
5. Timeline for improvement realization
6. Precedent (has a similar suppression been resolved at a comparable company)

### Adjustment Limits
- Maximum suppression adjustment: +5 KR points (approximately 1 tier)
- Suppression adjustment reduces confidence by 10-15% (reflecting the projection uncertainty)
- Multiple suppression factors do not stack beyond +5 total
- Suppression adjustment must be separately reported in the output (not blended silently into Final Target KR)

### Governance
- Suppression adjustments are flagged for review
- If suppression is claimed, the evaluation output must include both the unadjusted Target KR and the suppression-adjusted Target KR
- The unadjusted KR is the official record. The suppression-adjusted KR is the projected value under improved conditions.

---

## EVALUATION OUTPUT FORMAT

Every Mode 1 evaluation outputs a structured document with the following sections. No section may be omitted. If a section cannot be completed due to data limitations, it is included with an INCOMPLETE flag and explanation.

### Section 1: Target Summary
- Target name, type, industry, location
- Transaction size tier
- Key facts (revenue, employees, founding date, ownership)
- Evaluation date and evaluator

### Section 2: Confidence Gate
- confidence_pct (number)
- Confidence tier (1-5)
- Data sources used
- Known data gaps
- Recommended next steps to improve confidence

### Section 3: Phase 3 Anchor
- Anchor tier and range
- Legend reference (which legend, which tier)
- Justification (2-4 sentences mapping the target's profile to the tier description)

### Section 4: Component KRs
- FKR: score, justification (2-3 sentences), unscored dimensions if any
- OKR: score, justification, unscored dimensions if any
- SKR: score, justification, unscored dimensions if any
- RKR: score, justification, unscored dimensions if any
- Composite: average of scored components

### Section 5: Phase 6 Adjustment
- Direction (up/down/neutral)
- Magnitude (points)
- Justification

### Section 6: Suppression Assessment
- Suppression detected: Yes/No
- If yes: type, evidence, projected adjustment, confidence impact
- Unadjusted Target KR
- Suppression-adjusted Target KR (if applicable)

### Section 7: Final Target KR
- Final Target KR (decimal, one place)
- Range (low-high based on confidence band)
- KLVN composite lambda
- Lambda-adjusted interpretation

### Section 8: System Fit
- Composite score (0-100)
- Dimensional breakdown (OS Integration, Revenue Integration, Data Integration, Cultural Fit, Geographic Fit)
- Integration complexity tier (Light/Moderate/Heavy/Transformational)

### Section 9: Integration Risk Flags
- List of all six flags with triggered/not-triggered status
- Evidence for each triggered flag
- Required mitigation plan for triggered flags

### Section 10: Deal Context
- Budget allocation from Capital Deployment schedule
- Preliminary deal structure note (which template applies)
- Capital impact (% of remaining fund capital)
- Regulatory approvals required

---

## VERSION HISTORY
- v1.0: Initial build. Target Context Setup with six required fields. Target Profile with eight data categories. Five-tier Confidence Gate with degradation rules. Twelve-step Master Execution Flow. Multi-Type Protocol. Suppression Detection Rules with evidence requirements and adjustment limits. Structured evaluation output format with ten mandatory sections.
