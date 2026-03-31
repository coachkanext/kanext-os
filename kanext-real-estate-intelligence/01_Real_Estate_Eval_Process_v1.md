# REAL ESTATE EVALUATION PROCESS
## v1.0

---

## SITE CONTEXT SETUP

Site Context Setup defines the binding environment for all downstream property evaluation. No property evaluation, portfolio analysis, financial model, or development plan can execute until Site Context is locked.

### Required Fields
All required fields must be populated before evaluation proceeds. If any required field is missing, evaluation is blocked.

1. **Property Address or Parcel ID** - Legal description or street address sufficient to identify the property in public records.
2. **County and State** - Jurisdiction governing zoning, taxes, and environmental regulation.
3. **Property Type** - Must match one of the five defined types: Campus Land, Urban Campus, Cluster Housing, Commercial/Mixed Use, Athletic Facilities.
4. **Acreage or Square Footage** - Total land area. For condominiums or units within larger buildings, both unit sqft and building/parcel total.
5. **Current Zoning Designation** - As recorded by the municipal or county zoning authority.
6. **Intended Use** - What KaNeXT intends to do with the property. Must be specific: "campus academic building", "student housing for 200 athletes", "practice gymnasium", etc.

These fields bind: KLVN normalization bands, Property KR legend selection, component KR weighting, System Fit computation, and confidence gate ranges.

### Optional Metadata (Non-Blocking)
1. Asking price or estimated market value
2. Current owner
3. Year built (for existing structures)
4. Existing tenants or occupants
5. Known environmental conditions
6. Flood zone designation
7. Proximity to nearest KaNeXT property (miles)
8. Proximity to nearest mandate school (miles)

### Optional Constraints (Downstream Only)
These fields do not alter component KR scoring or Property KR computation. They are consumed only by downstream planning and financial modeling engines.

1. Maximum acquisition budget for this property
2. Target closing date
3. Financing structure (cash, HBCU Capital Financing, option agreement, etc.)
4. Development budget (post-acquisition construction/renovation)
5. Target completion date for development
6. IOA Phase alignment (which phase triggers this acquisition/development)

### Context Lock
When all required fields (1-6) are populated and validated, system state transitions to Site Context Locked. This locked context is the binding reference for all downstream evaluation. It cannot be modified mid-evaluation without restarting the pipeline.

### Governance
Property types must exactly match the five defined types in File 02. Zoning designations must match the jurisdiction's actual designation codes. Any change to required fields, validation rules, or downstream bindings requires documentation, versioning, and approval.

---

## PROPERTY PROFILE

### A) Identity
- Property address (street, city, state, zip)
- Parcel ID / folio number
- County
- Legal description
- Acreage / square footage
- GPS coordinates (latitude, longitude)
- Current zoning designation
- Future land use designation (if different from current zoning)
- Flood zone designation (FEMA panel number and zone)
- Current owner of record
- Year of last transfer and transfer price

### B) Physical Characteristics
- Topography (flat, sloped, hilly, waterfront)
- Soil type and bearing capacity (if available)
- Existing structures (type, sqft, year built, condition)
- Existing infrastructure (roads, parking, sidewalks, lighting)
- Utility connections (water, sewer, electric, gas, fiber - at boundary or on-site)
- Tree coverage and wetlands (if any)
- Frontage (road frontage in linear feet, highway visibility)
- Access points (number and type of entry/exit)

### C) Environmental Record
- Phase I Environmental Site Assessment (date, findings, firm)
- Phase II Environmental Site Assessment (if triggered by Phase I)
- Known contamination (type, extent, remediation status)
- Underground storage tanks (current or historical)
- Adjacent property environmental conditions (if known)
- Brownfield status
- Protected habitat or species (if any)

### D) Market Context
- Assessed value (county property appraiser)
- Tax assessment and millage rate
- Recent comparable sales (within 1 mile, 3 miles)
- Median price per acre/sqft for the submarket
- Days on market (if actively listed)
- Listing history
- Development pipeline within 3 miles (approved projects, under construction)

### E) Strategic Context
- Distance to nearest KaNeXT property
- Distance to nearest mandate school
- Distance to nearest highway interchange
- Distance to nearest public transit stop/station
- Distance to nearest airport
- Surrounding land use (residential, commercial, industrial, institutional, agricultural)
- Municipal disposition toward institutional development (supportive, neutral, hostile)

### F) Financial Context (if income-producing)
- Current rental income (gross)
- Vacancy rate
- Operating expenses
- Net operating income (NOI)
- Cap rate
- Existing leases (terms, tenants, expiration dates)
- Deferred maintenance estimate

---

## PROPERTY CONFIDENCE GATE

Confidence measures how much verified data backs the evaluation. Low confidence does not mean a bad property - it means the evaluation carries more uncertainty.

### Confidence Tiers

**HIGH (85-100%)**
All of the following are available:
- Full appraisal by licensed appraiser (within 12 months)
- Phase I Environmental Site Assessment (within 12 months)
- Title search and title commitment
- ALTA survey
- Site visit by KaNeXT representative
- Zoning confirmation letter from municipality
- Three or more verified comparable sales within 1 mile
- Flood zone determination

**MEDIUM (60-84%)**
At least four of the following are available:
- Public records data (assessed value, tax history, owner, zoning)
- Drive-by or virtual site inspection
- At least one comparable sale within 3 miles
- Zoning map review (not formal confirmation)
- Flood zone check (FEMA map, not formal determination)
- Phase I Environmental (may be older than 12 months)

**LOW (30-59%)**
Only the following are available:
- Public records data (assessed value, owner, zoning from county website)
- Satellite imagery review
- Limited comparable sales (submarket-wide, not property-specific)
- No environmental assessment
- No site visit
- No appraisal

**INSUFFICIENT (Below 30%)**
Critical data is missing:
- No verified acreage or parcel boundaries
- No zoning confirmation
- No environmental data of any kind
- No comparable sales data
- No site visit or even satellite review
- Evaluation cannot proceed. Flag missing data and specify what must be gathered before a Property KR can be assigned.

### Confidence Adjustments
- Each missing HIGH-tier data point reduces confidence by 5-10 points.
- Environmental uncertainty is the largest single confidence penalty. No Phase I assessment caps confidence at 65% regardless of other data.
- Zoning uncertainty (relying on maps rather than formal confirmation) reduces confidence by 10 points.
- No site visit reduces confidence by 15 points.
- Comparable sales gap (no comps within 3 miles) reduces confidence by 10 points.

---

## PROPERTY EVALUATION ENGINE - MASTER EXECUTION FLOW

This is the step-by-step pipeline for producing a complete property evaluation. Every step is mandatory. No step can be skipped. Order matters.

### Step 1: Lock Site Context
Populate all required fields. Validate property type, zoning, and jurisdiction. Lock context. If any required field is missing, stop and request the data before proceeding.

### Step 2: Build Property Profile
Populate all available sections of the Property Profile (A through F). Use the Data Gathering Protocol from File 07 (SKILL.md) to collect data from public records, market sources, and web search. Flag any fields that could not be populated.

### Step 3: Compute Confidence
Apply the Confidence Gate. Determine which tier the available data supports. If INSUFFICIENT, stop evaluation and report what data must be gathered. If LOW, proceed but note all uncertainty in the output.

### Step 4: Phase 3 - Production Anchor
Read the Property Type Legend from File 02 for the appropriate property type. Map the property's full profile against the legend tier descriptions. Identify the tier whose description matches the property's overall characteristics. The KR range of that tier IS the anchor. Write it down.

**Anchoring rules (from File 07 SKILL.md):**
- Anchor against property profile, not price alone.
- Seller narrative does not inflate Property KR.
- Adjacent property value does not inflate current Property KR.
- Zoning is current reality, not future promise.
- Environmental risk is a hard ceiling.
- Read attributes first, check comparables second.

### Step 5: Phase 6 - Component KRs
Score each component KR using the definitions in File 02:
- LKR (Location KR)
- FKR (Financial KR)
- DKR (Development KR)
- SKR (Strategic KR)

Each component is scored 0-100 using the dimension definitions and weights in File 02. Document the rationale for each score. If a dimension cannot be scored due to missing data, mark it UNSCORED and note the impact on the component KR.

### Step 6: Compute Final Property KR
The Phase 3 anchor sets the range (e.g., 85-89). The component KRs determine where within that range the property lands.

**Computation logic:**
1. Average the four component KRs: Component_Avg = (LKR + FKR + DKR + SKR) / 4
2. Map Component_Avg to a position within the anchor range:
   - If Component_Avg >= 85: property sits in the upper third of the anchor range
   - If Component_Avg is 70-84: property sits in the middle of the anchor range
   - If Component_Avg < 70: property sits in the lower third of the anchor range
3. Final Property KR is a single number within the anchor range, adjusted up to 5 points outside the range if component KRs strongly support it.

**Hard constraints:**
- Final Property KR cannot exceed anchor ceiling + 5.
- Final Property KR cannot fall below anchor floor - 5.
- If the component average would push the KR more than 5 points outside the anchor, the anchor wins and the output notes the tension between production anchor and component analysis.

### Step 7: System Fit
Score each System Fit dimension using the tables in File 02:
- Campus master plan fit
- Student population fit
- Revenue model fit
- Construction timeline fit

Compute weighted average: System Fit % = (Campus 0.30 + Student 0.25 + Revenue 0.25 + Timeline 0.20) x 100

### Step 8: Integration Risk Assessment
Check each Integration Risk Flag from File 02 against the property's known conditions. Assign severity (LOW, MEDIUM, HIGH, CRITICAL) to each applicable flag.

### Step 9: Deal Structure Recommendation
Based on the property type, seller situation, and fund capital position, recommend one of the six deal structure templates from File 02. Provide rationale.

### Step 10: Generate Output
Compile the complete evaluation output:

```
PROPERTY EVALUATION: [Address / Property Name]

Property Type: [Type]
Intended Use: [Intended use]
Market Tier: [Tier and lambda]
Development Stage: [Stage and lambda]

PHASE 3 ANCHOR: [Range] ([Tier Label])
Anchor Rationale: [2-3 sentences explaining why this tier was selected]

COMPONENT KRs:
- LKR (Location): [Score] - [1-sentence rationale]
- FKR (Financial): [Score] - [1-sentence rationale]
- DKR (Development): [Score] - [1-sentence rationale]
- SKR (Strategic): [Score] - [1-sentence rationale]
Component Average: [Score]

FINAL PROPERTY KR: [Score]
KR Range: [Anchor range]
Confidence: [Percentage and tier]

SYSTEM FIT: [Percentage]
- Campus Master Plan: [Score]
- Student Population: [Score]
- Revenue Model: [Score]
- Construction Timeline: [Score]

KEY STRENGTHS:
1. [Strength]
2. [Strength]
3. [Strength]

KEY RISKS:
1. [Risk - Severity]
2. [Risk - Severity]
3. [Risk - Severity]

INTEGRATION RISK FLAGS: [List any HIGH or CRITICAL flags]

DEAL STRUCTURE RECOMMENDATION: [Template name]
Rationale: [1-2 sentences]

RECOMMENDATION: [ACQUIRE / PASS / CONDITIONAL]
[If CONDITIONAL: specify conditions that must be met]
```

---

## SUPPRESSION DETECTION

Suppression detection identifies properties whose apparent KR is artificially depressed by temporary or correctable conditions. A suppressed property has higher true value than its current profile suggests.

### Types of Suppression

**Deferred Maintenance Suppression**
Property with strong fundamentals (location, zoning, strategic alignment) but poor physical condition due to deferred maintenance by current owner. The property profile looks worse than the underlying asset justifies.
- Detection: Strong LKR and SKR paired with weak FKR or DKR due to condition-related factors.
- Adjustment: Estimate cost to cure deferred maintenance. If cure cost is less than 15% of acquisition price and the cured property would score 5+ points higher, flag as suppressed.

**Market Cycle Suppression**
Property in a temporarily depressed submarket that will recover. The current FKR is low because of recent comparable sales in a down market, not because of property-specific deficiency.
- Detection: FKR depressed by recent comps while demographic and employment trends remain positive. New development pipeline exists (builders believe in the market even if current sales are soft).
- Adjustment: Note the suppression. Model both current-market and recovery-market scenarios.

**Zoning Misclassification Suppression**
Property zoned for a lower-value use than its location and characteristics support. A property zoned agricultural in a rapidly urbanizing area is suppressed by its zoning classification.
- Detection: High LKR and SKR paired with low DKR due to zoning incompatibility. Surrounding properties have been rezoned to higher uses. Municipal comprehensive plan designates the area for future institutional or mixed use.
- Adjustment: Assess rezoning probability. If greater than 70% probability based on comprehensive plan alignment and precedent, model the property at its post-rezoning potential and note the current zoning as a correctable constraint.

**Distressed Seller Suppression**
Property available below market because the seller is under financial pressure (foreclosure, estate sale, bankruptcy, partnership dissolution). The property itself is not distressed - the seller is.
- Detection: Asking price significantly below assessed value and recent comps. Property condition and location do not explain the discount. Seller circumstances suggest urgency.
- Adjustment: This is not suppression to correct - it is an opportunity to acquire. The true Property KR should reflect the property's fundamentals, not the distressed pricing. The financial benefit is captured in FKR (below-market acquisition cost) and in the deal structure recommendation.

---

## MULTI-PROPERTY PROTOCOL

When evaluating multiple properties for the same purpose (e.g., five cluster housing candidates near a mandate school, or three campus sites under consideration), use the Multi-Property Protocol.

### Steps:
1. Evaluate each property independently through the full pipeline (Steps 1-10).
2. Normalize all evaluations to the same KLVN lambdas (market tier, property type, development stage).
3. Rank by Final Property KR.
4. If two or more properties are within 3 KR points of each other, break ties by:
   a. System Fit % (higher wins)
   b. Confidence % (higher wins)
   c. Integration Risk Flag count (fewer HIGH/CRITICAL flags wins)
   d. FKR (lower cost per unit of strategic value wins)
5. Present ranked list with recommendation for which property or properties to acquire.
6. If acquiring multiple properties (cluster housing portfolio), compute the portfolio-level metrics:
   - Total acquisition cost
   - Total unit count
   - Average Property KR
   - Average System Fit %
   - Portfolio-level occupancy model
   - Portfolio-level revenue projection

---

## FOUNDING TEST CASES

### Test Case 1: 596 Acres Miami Lakes
- Property Type: Campus Land
- Expected KR Range: 92-96 (Generational Asset tier)
- Expected LKR: 90+ (highway frontage, growth corridor, Miami-Dade)
- Expected FKR: 80-85 (at market price for the area, $330M is significant capital deployment)
- Expected DKR: 88-93 (large undeveloped parcel, utility access, buildable)
- Expected SKR: 95+ (IS the campus master plan)
- Expected System Fit: 95%+
- Expected Confidence: MEDIUM (no Phase I environmental known, no formal appraisal in portfolio, based on public data and market knowledge)

### Test Case 2: 52.6 Acres FMU Campus Miami Gardens
- Property Type: Urban Campus
- Expected KR Range: 88-93 (Turnkey Institution tier)
- Expected LKR: 80-85 (Miami Gardens is Tier 1 market but not premium submarket)
- Expected FKR: 85-90 ($100M philanthropic transfer for existing institutional campus is favorable)
- Expected DKR: 85-90 (existing campus, zoned institutional, structures present)
- Expected SKR: 90-95 (IS the FMU campus, direct alignment with IOA)
- Expected System Fit: 90%+
- Expected Confidence: MEDIUM-HIGH (existing campus with known conditions, but formal appraisal and Phase I status not confirmed)

### Test Case 3: Cluster Housing Near FMU
- Property Type: Cluster Housing
- Expected KR Range: Variable (depends on specific properties identified)
- Key evaluation criteria: proximity to FMU campus, unit count, condition, price per unit, mandate-demand occupancy potential
- Expected System Fit: 80-90% (depends on distance and unit configuration)
- Expected Confidence: LOW-MEDIUM (initial identification, no site visits or formal analysis)

---

## VERSION HISTORY
- v1.0: Initial build. Site Context Setup, Property Profile, Confidence Gate (4 tiers), Master Execution Flow (10 steps), Suppression Detection (4 types), Multi-Property Protocol, Founding Test Cases (3).
