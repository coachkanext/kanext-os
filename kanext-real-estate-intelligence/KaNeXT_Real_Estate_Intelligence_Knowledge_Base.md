# KaNeXT Real Estate Intelligence - Complete Knowledge Base

## Version 1.0 - March 2026

This is the comprehensive reference document for the KaNeXT Real Estate Intelligence system. It covers every concept, every metric, every process, and every decision framework in the intelligence layer. Nexus references this document to answer any question about how the real estate intelligence works - from investors, the real estate team, institutional partners, and anyone interacting with the system.

---

# PART 1: THE INTELLIGENCE SYSTEM

---

## 1. What is KaNeXT Real Estate Intelligence

KaNeXT Real Estate Intelligence is a universal property evaluation and portfolio management system that produces deterministic, auditable ratings for every real estate asset KaNeXT acquires, develops, or manages. It was built to solve a fundamental problem: real estate decisions at the institutional scale are fragmented across appraisals, broker opinions, gut feelings, and spreadsheets that do not talk to each other.

A developer looks at a parcel and says "it's a good site." The CEO asks "but how good? Is it better than the other three parcels we're considering? Does it fit the master plan? Can we develop it within our IOA phase timeline? What happens to the portfolio if we buy it?" There is no honest answer because there is no common language. The developer's "good" means something different from the appraiser's "good" means something different from the financial analyst's "good." Every evaluation lives in someone's head, filtered through their specialty, their experience, and whatever comparable sales they happened to pull.

KaNeXT Real Estate Intelligence replaces this with a system. Not a model. Not an appraisal. A complete intelligence framework that takes raw property data - public records, environmental assessments, market comparables, site inspections, financial projections - and produces a single universal number that means the same thing regardless of who computed it, when they computed it, or what type of property is being evaluated.

That number is the Property KR.

The system was designed to govern $630M+ in real estate deployment in Year 1 alone. It covers the 596-acre Miami Lakes campus acquisition ($330M), the FMU 52.6-acre campus transfer ($100M), $200M in campus construction, and an expanding portfolio of cluster housing properties near mandate schools. Every dollar passes through the intelligence system before it is committed.

The intelligence system is not just a rating. It includes portfolio management, development sequencing, market analysis, financial modeling, cluster housing demand simulation, risk assessment, deal scenario modeling, stress testing, transaction execution, and post-acquisition monitoring. All of these engines are downstream of the same core evaluation pipeline, meaning they all speak the same language and reference the same truth.

The intelligence lives inside the KaNeXT app through Nexus AI. The real estate team does not navigate dashboards or flip through appraisal PDFs. They talk to Nexus. They ask questions in plain language - "evaluate this property," "what should we build first," "model the cluster housing demand near FMU," "stress test the portfolio under a recession" - and Nexus references the intelligence files to produce structured, honest answers.

The core philosophy: same inputs produce the same outputs, every time. No randomness. No editorial override. No truth mutation. The system is transparent about what it knows, what it does not know, and how confident it is in every output.

---

## 2. The Property KR System - Universal 0-100 Rating

Property KR stands for Property KaNeXT Rating. It is a single number on a 0-100 scale that represents a real estate asset's total evaluated quality at the time of evaluation. Property KR is the atomic unit of the entire real estate intelligence system. Every downstream engine - portfolio analysis, development sequencing, financial modeling, disposition intelligence - consumes Property KR as its primary input.

### What Property KR Measures

Property KR captures the complete real estate asset across four dimensions: location, financial profile, development readiness, and strategic alignment with the KaNeXT institutional mission. These four dimensions are the component KRs - LKR, FKR, DKR, and SKR - and they combine into the final Property KR through a weighted evaluation process anchored against property type legends.

Property KR is not price per acre. It is not assessed value. It is not cap rate. It is a composite of all measurable property attributes, weighted by their importance to KaNeXT's institutional mission, and anchored against what "good" looks like for that specific property type.

### Property KR is Universal Across Property Types

A Property KR of 85 means the same thing regardless of whether the property is campus land, cluster housing, or an athletic facility. The number does not change based on property type. What changes is the interpretation. Each property type has its own legend - a lookup table that translates Property KR values into tier labels describing what that number means for that specific property type.

An 85 Property KR reads differently depending on the property type:

- Campus Land: 85-89 = Strong Campus Site. Good road access, utilities available, zoning requires variance but pathway is clear.
- Urban Campus: 85-89 = Strong Adaptive Reuse. Large commercial or industrial property with good bones, 50-70% of space adaptable.
- Cluster Housing: 85-89 = Strong Housing. Single-family cluster or small multi-family within 3 miles, good condition, 6-7% gross yield.
- Commercial/Mixed Use: 85-89 = Near-Campus Commercial. Within 0.5 miles, visible from campus, suitable for student-serving businesses.
- Athletic Facilities: 85-89 = Training Facility. Existing gymnasium suitable for practice and training, not competition-grade.

One property. One KR. Multiple legend reads depending on property type context.

### How Property KR Stays Universal: KLVN Lambda Normalization

The reason Property KR can be universal is that raw property metrics are normalized across three dimensions before they enter the evaluation pipeline. A property in Miami-Dade County exists in a fundamentally different cost, regulatory, and demand environment than a property in rural Georgia. Raw metrics are not comparable without normalization.

KLVN normalization operates across three axes:

**Market Tier Lambda:** Normalizes for geographic market conditions. Miami-Dade County (Tier 1) is the reference at lambda 1.000. Secondary metros like Broward County or Atlanta are Tier 2 at 0.925. Tertiary metros at 0.850. Small cities at 0.775. Rural at 0.700.

**Property Type Lambda:** Normalizes for risk and capital profile differences between property types. Campus Land (raw) is the reference at 1.000. Cluster Housing at 0.825 reflects lower capital requirements and more predictable demand. Athletic Facilities (new build) at 0.950 reflects specialized construction risk.

**Development Stage Lambda:** Normalizes for where the property sits in the development lifecycle. Raw unentitled land at 1.000 carries maximum uncertainty. Stabilized operating assets at 0.750 carry the lowest development risk.

Lambda normalizes INPUTS during component KR scoring. It does NOT convert Property KR outputs. There is no "Miami-equivalent KR" for a property in Jacksonville. The Property KR is computed once using lambda-normalized inputs. That number is final and universal.

### What Different Property KR Ranges Mean

Using Campus Land as the reference:

- 95-100: Generational Asset. 200+ acres, highway frontage, all utilities, zoned by right, clean environmental, flat terrain, growth corridor, expansion parcels available. The 596-acre Miami Lakes site is this archetype.
- 90-94: Premier Campus Site. 100+ acres, highway access, utilities available, zoning compatible, clean environmental, mostly flat, in a growth corridor.
- 85-89: Strong Campus Site. 50-100 acres, good access, utilities within 0.5 miles, zoning requires variance, clean environmental, moderate topography.
- 80-84: Viable Campus Site. 50-100 acres, adequate access, utilities within 1 mile, rezoning with reasonable probability, some terrain challenges.
- 75-79: Marginal Campus Site. 50+ acres with significant constraints: utility extension, uncertain rezoning, environmental conditions, or above-market pricing.
- 70-74: Below Threshold. Multiple material deficiencies. Proceed only if no better alternatives exist.
- Below 70: Do Not Pursue. Fundamental issues that cannot be reasonably mitigated.

---

## 3. Property Evaluation Engine - The Full Protocol

The property evaluation engine is the core of the intelligence system. It takes raw data about a real estate asset and produces a Property KR through a deterministic pipeline. The pipeline has two blocks: Base Evaluation (what the property IS regardless of buyer) and Strategic Context (how the property fits within KaNeXT's specific institutional mission).

### The V1 Evaluation Protocol

Every property evaluation follows a 10-step pipeline executed in strict order. No step can be skipped. Order matters.

**Step 1: Lock Site Context.** Set the property address, county, property type, acreage, current zoning, and intended use. These six required fields bind all downstream computation - which KLVN lambdas to use, which legend to reference, which component KR weights to apply, and which System Fit dimensions are relevant.

**Step 2: Build Property Profile.** Populate identity (address, parcel ID, GPS, legal description), physical characteristics (topography, structures, utilities, access), environmental record (Phase I/II, contamination, flood zone), market context (assessed value, comparable sales, development pipeline), strategic context (proximity to KaNeXT properties and mandate schools), and financial context (income, occupancy, NOI if applicable).

**Step 3: Compute Confidence.** Rate the available data against the Confidence Gate. HIGH confidence (85-100%) requires full appraisal, Phase I Environmental, title search, ALTA survey, site visit, zoning confirmation, and comparable sales. MEDIUM (60-84%) requires at least four of those items. LOW (30-59%) relies on public records and satellite imagery only. INSUFFICIENT (below 30%) means evaluation cannot proceed - flag what data must be gathered.

**Step 4: Phase 3 - Production Anchor.** This is the primary Property KR determinant. Read the Property Type Legend for the appropriate property type. Map the property's full profile against the legend tier descriptions. Find the tier whose description matches. That tier's KR range IS the anchor. Write it down before doing anything else.

Example: A 596-acre parcel adjacent to major highways with clean zoning, utility access, in a growth corridor, priced at market, with direct alignment to the KaNeXT master plan maps to the 95-100 tier (Generational Asset) based on the campus land legend. The anchor is 95-100.

**Step 5: Phase 6 - Component KRs.** Score the four component KRs from the data: LKR (Location), FKR (Financial), DKR (Development), SKR (Strategic). Each component is scored 0-100 using weighted dimensions. These tell you WHERE the property is strong and weak. The Phase 6 output tells the DIRECTION within the anchor range.

**Step 6: Compute Final Property KR.** The Phase 3 anchor sets the range. The component KR average determines position within that range. Final Property KR cannot exceed anchor ceiling + 5 or fall below anchor floor - 5. If the components would push outside this band, the anchor wins.

**Step 7: System Fit.** Score four dimensions of institutional alignment: Campus Master Plan Fit (30% weight), Student Population Fit (25%), Revenue Model Fit (25%), Construction Timeline Fit (20%). Weighted average produces System Fit %. Properties above 90% are strategic priorities. Properties below 70% require explicit justification.

**Step 8: Integration Risk Assessment.** Check each Integration Risk Flag against known conditions. Assign severity: LOW, MEDIUM, HIGH, or CRITICAL.

**Step 9: Deal Structure Recommendation.** Based on property type and fund position, recommend one of six deal structure templates.

**Step 10: Generate Output.** Compile the complete evaluation: Property KR, component KRs, System Fit %, confidence %, key strengths, key risks, integration risk flags, deal structure recommendation, and final recommendation (ACQUIRE, PASS, or CONDITIONAL).

### Phase 3 Anchoring Rules

These rules are mandatory for every evaluation:

a. **Anchor against property profile, not price alone.** Location, buildability, zoning, strategic alignment, and market position determine the tier. Price confirms a tier placement - it does not determine it.

b. **Seller narrative does not inflate Property KR.** "Once-in-a-lifetime opportunity" is marketing, not data.

c. **Adjacent property value does not inflate current Property KR.** Future development next door creates upside potential but does not change the current property's physical characteristics.

d. **Zoning is current reality, not future promise.** A property zoned residential that "could be rezoned" is evaluated at its current zoning.

e. **Environmental risk is a hard ceiling.** Known contamination caps the property at the tier ceiling for its risk category.

f. **Read the property attributes first. Check comparable sales second.** Find the tier where the ATTRIBUTES match, then check comps to confirm pricing.

---

## 4. Component KRs - LKR, FKR, DKR, SKR

Every property evaluation produces four component KRs that break down the overall rating into its constituent parts. These are the building blocks of the final Property KR and the most useful outputs for understanding a property's investment identity.

### LKR - Location KR

LKR measures the intrinsic locational value of the property independent of what is built on it. Location is the one attribute that cannot be changed after acquisition.

LKR has six scoring dimensions:

- **Proximity to institutional assets (25%):** Distance to KaNeXT-affiliated schools, mandate campuses, FMU, or other KaNeXT properties. Within 1 mile of a mandate school scores 90+. Beyond 5 miles with no institutional proximity scores below 60.
- **Transportation access (20%):** Highway frontage, public transit, airport proximity. Direct highway access with multiple transit options scores 90+.
- **Neighborhood quality (20%):** Crime rates, median income, property value trends, visual condition. Below-average crime with rising incomes scores 80+.
- **Growth trajectory (15%):** Population growth, employment growth, new construction, business formation. Areas with 2%+ annual population growth score 85+.
- **Walkability and amenity proximity (10%):** Walk Score, grocery, pharmacy, restaurants, parks, medical. Campus properties need student-serving amenities nearby.
- **Safety metrics (10%):** Crime index, sex offender proximity, emergency response, flood/hurricane risk. Properties in high-crime areas or FEMA flood zones score below 60 regardless.

What different LKR values mean:

- LKR 95+: Premier location. Multiple institutional assets nearby, highway frontage, excellent transit, safe, growing, walkable. The 596-acre Miami Lakes parcel between I-75 and Florida Turnpike is this archetype.
- LKR 90-94: Excellent location. Strong on most dimensions. One or two minor gaps (e.g., no transit but excellent highway access).
- LKR 85-89: Good location. Adequate access, acceptable neighborhood, moderate growth. Some compromises.
- LKR 80-84: Acceptable location. Functional but not ideal. May require investment in surrounding area.
- LKR 75-79: Below-average location. Significant trade-offs on safety, access, or growth trajectory.
- Below 75: Poor location. Multiple deficiencies. Property must have extraordinary other attributes to justify.

### FKR - Financial KR

FKR measures the economic value proposition: what the property costs, what it generates, and what it will be worth.

FKR has seven scoring dimensions:

- **Acquisition cost vs market (25%):** Price per acre or sqft compared to comparable sales. At or below market scores 80+. At 20%+ premium caps FKR at 70.
- **Projected appreciation (15%):** Based on submarket trends and demographic drivers. Markets with 5%+ annual appreciation score 85+.
- **Rental yield potential (15%):** For income-producing properties. Gross yield above 8% scores 85+. Non-income properties redistribute this weight.
- **Development cost estimates (15%):** Cost to develop per sqft of buildable area. Below-market construction costs score 80+.
- **Operating expense ratio (10%):** OpEx as a percentage of revenue. Below 35% scores 85+. Non-operating properties redistribute.
- **Cap rate (10%):** NOI divided by acquisition cost. Above 7% scores 85+. Institutional properties benchmark against higher-ed comparables.
- **Debt service coverage (10%):** For financed properties. DSCR above 1.5x scores 85+. Below 1.2x triggers a risk flag.

Key calibration context: The 596-acre Miami Lakes acquisition at $330M represents approximately $554K per acre. For undeveloped land in a Tier 1 market (Miami-Dade) with highway frontage and growth corridor positioning, this is at or near market. FKR reflects the cost relative to what you get, not the absolute dollar amount.

### DKR - Development KR

DKR measures how ready the property is to become what KaNeXT needs it to be.

DKR has six scoring dimensions:

- **Zoning compatibility (25%):** Current zoning vs intended use. Permitted by right scores 90+. Full rezoning required scores 50-69.
- **Environmental clearance (20%):** Phase I results. Clean scores 90+. Known contamination requiring remediation scores below 60. No assessment conducted caps DKR at 65.
- **Utility availability (20%):** Water, sewer, electric, gas, fiber at boundary. All present with capacity scores 90+. Extension over 0.5 miles scores below 70.
- **Topography and buildability (15%):** Flat, well-drained, stable soil scores 90+. Significant grade changes or drainage issues score below 70.
- **Existing structures (10%):** Structures that are assets (usable buildings) score 80+. Raw land scores 70 (neutral). Structures requiring demolition score below 60.
- **Entitlement timeline (10%):** Time from acquisition to construction permit. Under 6 months scores 90+. Over 24 months scores below 60.

### SKR - Strategic KR

SKR measures how well the property serves the KaNeXT institutional mission and long-term vision.

SKR has five scoring dimensions:

- **Campus master plan alignment (30%):** Properties that ARE part of the primary campus footprint score 95+. Properties adjacent with expansion potential score 80-94. Properties with no master plan connection score below 60.
- **Proximity to other KaNeXT properties (15%):** Contiguous parcels score 90+. Same submarket scores 60-74. Isolated properties score below 60.
- **Student/athlete housing demand (20%):** Areas with 200+ students/athletes needing housing score 85+. Non-housing properties redistribute.
- **Institutional visibility and brand value (15%):** Highway frontage and landmark potential score 85+. Hidden or industrial locations score below 65.
- **Expansion potential (20%):** Three or more adjacent parcels available score 85+. Landlocked scores below 60.

### How Component KRs Combine Into Final Property KR

The four components are averaged and then mapped to a position within the Phase 3 anchor range:

1. Component Average = (LKR + FKR + DKR + SKR) / 4
2. If Component Average >= 85: property sits in the upper third of the anchor range
3. If Component Average is 70-84: middle of the anchor range
4. If Component Average < 70: lower third of the anchor range
5. Final Property KR is a single number, one decimal, within the anchor range +/- 5

The anchor is the truth. The components are confirmation. Not the other way around.

---

## 5. Property Type Legends

Property type legends translate Property KR values into tier labels that describe what each rating range means for a specific property type. There are five property type legends covering every asset class in the KaNeXT real estate portfolio.

### Campus Land Legend (50+ Acres for Institutional Development)

| KR Range | Tier Label | Description |
|----------|-----------|-------------|
| 95-100 | Generational Asset | 200+ acres, highway frontage on multiple corridors, all utilities at boundary, zoned by right, clean environmental, flat terrain, growth corridor, expansion parcels available, below-market price. The 596-acre Miami Lakes site. |
| 90-94 | Premier Campus Site | 100+ acres, highway access within 0.25 miles, utilities available with minor extension, zoning compatible, clean or minor environmental, mostly flat, growth corridor, some expansion potential, at or slightly above market. |
| 85-89 | Strong Campus Site | 50-100 acres, good road access, utilities within 0.5 miles, zoning requires variance, clean environmental, moderate topography, stable or growing submarket, within 10 miles of institutional assets, limited expansion, at market. |
| 80-84 | Viable Campus Site | 50-100 acres, adequate access, utilities within 1 mile, rezoning with reasonable probability, Phase I clean, some terrain challenges, stable submarket, within 15 miles of institutional assets. |
| 75-79 | Marginal Campus Site | 50+ acres with significant constraints: utility extension over 1 mile, uncertain rezoning, environmental conditions, or above-market pricing. Buildable but elevated risk and cost. |
| 70-74 | Below Threshold | Multiple material deficiencies. Extensive remediation, political opposition, declining submarket, or significant premium. Proceed only if no better alternatives exist. |
| Below 70 | Do Not Pursue | Fundamental issues: contamination, flood zone, hostile regulatory environment, declining market, or unrecoverable pricing. |

### Urban Campus Legend (Existing Structures, Renovation Opportunity)

| KR Range | Tier Label | Description |
|----------|-----------|-------------|
| 95-100 | Turnkey Institution | Existing campus or educational facility with structures in good condition. Classrooms, offices, athletic space, dining, housing present. ADA compliant. Zoned institutional. Systems within 10 years of useful life. Within 3 miles of mandate school. Below replacement cost. FMU 52.6-acre campus is this archetype. |
| 90-94 | Near-Turnkey | Existing institutional or commercial structures with 70%+ usable space. Some renovation needed but structures sound. Zoned correctly. Good location. At or below replacement cost. |
| 85-89 | Strong Adaptive Reuse | Large commercial or industrial with good bones. 50-70% adaptable. Significant renovation required but structurally sound. Viable submarket. Renovation below new construction cost. |
| 80-84 | Standard Adaptive Reuse | Substantial renovation required. 30-50% usable. Structural modifications needed. Acceptable location. Renovation approaching new construction cost. |
| 75-79 | Marginal Reuse | Near-total renovation. Demolition may be more cost-effective. Some strategic value. |
| Below 75 | Demolition Candidate | Structures have no adaptive reuse value. Valued for land only. |

### Cluster Housing Legend (Residential Near Mandate Schools)

| KR Range | Tier Label | Description |
|----------|-----------|-------------|
| 95-100 | Ideal Student Housing | Multi-family (8-20 units) within 1 mile of mandate school. Walking distance. Functional, no major maintenance. Below market per unit. 8%+ gross yield. 90%+ occupancy from mandate demand. Safe, student-friendly neighborhood. |
| 90-94 | Premium Housing | Multi-family or townhome cluster within 2 miles. Good condition. At market. 7-8% yield. 85%+ mandate occupancy. Safe neighborhood. Transit-friendly. |
| 85-89 | Strong Housing | Single-family cluster or small multi-family within 3 miles. Good condition or light renovation. At market. 6-7% yield. 75-85% mandate occupancy. Acceptable neighborhood. Vehicle required. |
| 80-84 | Standard Housing | Within 5 miles. Moderate renovation. At market. 5-6% yield. 60-75% mandate occupancy. Adequate neighborhood. |
| 75-79 | Marginal Housing | Beyond 5 miles or significant renovation. Below 5% yield. Under 60% mandate occupancy. Neighborhood concerns. |
| Below 75 | Do Not Pursue for Housing | Too far, unsafe, major structural work, or financial metrics unsupportable. |

### Commercial/Mixed Use Legend (Retail, Office, Campus-Adjacent)

| KR Range | Tier Label | Description |
|----------|-----------|-------------|
| 95-100 | Campus Gateway | Directly adjacent to campus entry. Mixed-use with retail and office. High visibility. Revenue-generating tenants. Integrates with master plan. Below-market relative to revenue. |
| 90-94 | Campus-Adjacent Commercial | Within 0.25 miles. Good retail/office mix. Strong foot traffic from campus. Stable or easily leasable. At market with strong revenue. |
| 85-89 | Near-Campus Commercial | Within 0.5 miles. Visible from campus. Suitable for student-serving businesses. Standard condition. |
| 80-84 | Institutional Support | Within 1 mile. Office or flex space for staff and administration. May not generate significant external revenue. |
| 75-79 | Marginal Commercial | Beyond 1 mile. Limited institutional connection. No strategic advantage. |
| Below 75 | No Strategic Value | No meaningful connection to KaNeXT operations. Pure financial investment only. |

### Athletic Facilities Legend (Gyms, Fields, Arenas)

| KR Range | Tier Label | Description |
|----------|-----------|-------------|
| 95-100 | Competition-Ready Venue | Existing arena or gymnasium meeting competition standards. 2,000+ seats. Locker rooms, media, training rooms. Broadcast infrastructure. Within 3 miles. Below replacement cost. |
| 90-94 | Near-Competition Venue | 75%+ of competition requirements met. Upgrades needed but structure supports them. Within 5 miles. At or below replacement cost. |
| 85-89 | Training Facility | Existing gymnasium or fieldhouse suitable for practice and training. Not competition-grade. Could host non-televised games. Within 5 miles. |
| 80-84 | Convertible Space | Large warehouse or industrial space convertible to athletic use. Adequate ceiling height (30'+), floor space (15,000+ sqft). Conversion below new construction. |
| 75-79 | Athletic Site Only | Vacant land ideal for athletic facility construction but no existing structures. Value is in the site. |
| Below 75 | Inadequate for Athletics | Too small, wrong topography, insufficient height, or too far from campus. |

---

## 6. KLVN Lambda Normalization

KLVN normalization ensures Property KR is universal across markets, property types, and development stages. Without normalization, raw metrics are not comparable - a $500K-per-acre price in Miami-Dade is a fundamentally different proposition than $500K per acre in rural Alabama.

### Market Tier Lambdas

| Tier | Lambda | Description | Examples |
|------|--------|-------------|----------|
| Tier 1 - Primary Metro | 1.000 | Major metro, high cost, high regulation, high demand | Miami-Dade County |
| Tier 2 - Secondary Metro | 0.925 | Mid-size metro, moderate cost, strong demand | Broward, Palm Beach, Orlando, Atlanta |
| Tier 3 - Tertiary Metro | 0.850 | Smaller metro, lower cost, moderate regulation | Jacksonville, Tampa suburbs, Charlotte |
| Tier 4 - Small City | 0.775 | Small city or exurban, low cost, variable demand | College towns, rural-adjacent suburbs |
| Tier 5 - Rural | 0.700 | Rural, lowest cost, minimal regulation | Rural campus sites, agricultural land |

### Property Type Lambdas

| Property Type | Lambda | Rationale |
|--------------|--------|-----------|
| Campus Land (raw) | 1.000 | Baseline. Highest capital, longest timeline, highest risk, highest strategic value. |
| Campus Land (entitled) | 0.950 | Entitlement removes major uncertainty. |
| Urban Campus | 0.900 | Lower development risk (structures exist), renovation risk variable. |
| Cluster Housing | 0.825 | Lower capital per unit, predictable demand from mandates. |
| Commercial/Mixed Use | 0.850 | Moderate capital, market-rate revenue, standard risk. |
| Athletic Facilities (existing) | 0.875 | Specialized use reduces liquidity but lowers construction risk. |
| Athletic Facilities (new build) | 0.950 | High cost, specialized construction, limited alternative use. |

### Development Stage Lambdas

| Stage | Lambda | Rationale |
|-------|--------|-----------|
| Raw Land (unentitled) | 1.000 | Maximum uncertainty across all dimensions. |
| Entitled Land | 0.900 | Major regulatory risk removed. |
| Under Construction | 0.825 | Active value creation but budget/timeline risk. |
| Stabilized/Operating | 0.750 | Revenue-producing. Lowest development risk. |
| Value-Add (needs renovation) | 0.875 | Existing asset with bounded renovation risk. |

Lambda normalizes inputs during component KR scoring. A Property KR of 85 in a Tier 1 market means the same quality level as 85 in a Tier 4 market - the normalization happened before the KR was computed.

---

## 7. System Fit

System Fit measures how well a property integrates with the KaNeXT institutional ecosystem. A high-KR property with low System Fit may be a good real estate investment but a poor strategic acquisition for KaNeXT. System Fit is the differentiator between "good property" and "right property for us."

### Four Dimensions of System Fit

**Campus Master Plan Fit (30% weight):**

| Score | Description |
|-------|-------------|
| 95-100 | Property IS part of the primary campus footprint (596-acre Miami Lakes or FMU 52.6-acre campus). |
| 85-94 | Contiguous to or within 0.5 miles of a primary campus and directly serves campus expansion. |
| 70-84 | Within 3 miles of a campus and serves a defined institutional function. |
| 50-69 | Same metro area but not physically connected. Secondary function. |
| Below 50 | No geographic or functional relationship to any campus. |

**Student Population Fit (25% weight):**

| Score | Description |
|-------|-------------|
| 95-100 | Within 1 mile of a mandate school with 500+ students. Immediate guaranteed demand. |
| 85-94 | Within 2 miles, 200+ students. Strong demand with some transportation. |
| 70-84 | Within 5 miles, 100+ students. Moderate demand, vehicle dependent. |
| 50-69 | Within 10 miles. Demand exists but distance reduces utilization. |
| Below 50 | No mandate school within 10 miles. No guaranteed institutional demand. |

**Revenue Model Fit (25% weight):**

| Score | Description |
|-------|-------------|
| 95-100 | Multiple recurring revenue streams flowing through KayPay (rent, dining, parking, retail). |
| 85-94 | One primary revenue stream through KayPay (e.g., rent only). |
| 70-84 | Revenue generated but KayPay integration requires modification. |
| 50-69 | Cost-center only (campus building, athletic facility). Value is institutional, not financial. |
| Below 50 | No revenue and no institutional cost-offset. Pure capital expenditure. |

**Construction Timeline Fit (20% weight):**

| Score | Description |
|-------|-------------|
| 95-100 | Ready for occupancy immediately. No construction. Aligns with current IOA phase. |
| 85-94 | Minor renovation (3-6 months). Aligns with current or next IOA phase. |
| 70-84 | Moderate development (6-18 months). Aligns with Phase 2 or 3. |
| 50-69 | Significant development (18-36 months). Phase 3 or 4. |
| Below 50 | Multi-year development (36+ months). Does not align with any current phase. Acquisition premature. |

System Fit % = (Campus x 0.30) + (Student x 0.25) + (Revenue x 0.25) + (Timeline x 0.20)

---

## 8. Integration Risk Flags

Integration Risk Flags identify conditions that elevate the risk of bringing a property into the KaNeXT ecosystem. Any HIGH or CRITICAL flag requires explicit discussion and mitigation plan before proceeding.

### Risk Flag Definitions

**Zoning Incompatibility:** Current zoning does not permit intended use. LOW: variance needed (likely). MEDIUM: rezoning needed (uncertain). HIGH: rezoning needed (politically opposed). CRITICAL: intended use prohibited with no legal pathway.

**Environmental Contamination:** LOW: Phase I clean. MEDIUM: Phase I conditions, Phase II needed. HIGH: known contamination, remediation plan exists. CRITICAL: known contamination with no plan, or Superfund-listed.

**Title Defect:** LOW: minor encumbrances (utility easements). MEDIUM: material encumbrances requiring negotiation. HIGH: liens or judgments to clear before close. CRITICAL: disputed ownership or ongoing litigation.

**Flood/Natural Hazard:** LOW: outside all flood zones. MEDIUM: 500-year flood zone with mitigation. HIGH: 100-year flood zone. CRITICAL: floodway or coastal high-hazard area.

**Infrastructure Gap:** LOW: all utilities at boundary. MEDIUM: extension under 0.5 miles. HIGH: extension over 1 mile or capacity upgrade needed. CRITICAL: no utility access feasible without major public investment.

**Access Limitation:** LOW: multiple access points. MEDIUM: single access point. HIGH: access via private road or easement. CRITICAL: landlocked with no legal access.

**Community Opposition:** LOW: no known opposition. MEDIUM: informal neighbor concern. HIGH: organized opposition. CRITICAL: active litigation or injunction.

**Construction Cost Escalation:** LOW: stable costs. MEDIUM: 5-10% above national average. HIGH: 10-20% above average or contractor scarcity. CRITICAL: 20%+ above average or no qualified contractors.

---

## 9. Deal Structure Templates

Six deal structure templates cover every transaction type in the KaNeXT real estate portfolio.

### Template 1: Cash Acquisition
Standard market purchase. Full price at closing. Title insurance, survey, Phase I required. 30-60 day due diligence. Closing costs 2-3%. Current KaNeXT target: 596 acres Miami Lakes ($330M).

### Template 2: Philanthropic Transfer
Property transferred as charitable contribution. KaNeXT provides philanthropic capital to the institution in exchange for deed. Tax-deductible for institution. Leaseback during transition. Current KaNeXT target: FMU 52.6 acres ($100M philanthropic capital).

### Template 3: Leaseback Arrangement
Property acquired but seller continues to occupy for a defined period. Nominal rent ($1/year in FMU model). Integrated with IOA phase transition timeline. FMU operates on existing campus until new campus ready.

### Template 4: Portfolio Acquisition
Bundle multiple residential properties for cluster housing. Negotiate 5-15% portfolio discount. Phase acquisitions by Property KR (highest first). Property management established before closing.

### Template 5: Land Bank / Option Agreement
Secure right to purchase without deploying full capital now. Option fee 1-5% of price. Purchase price locked. Option period aligned with IOA triggers. Current use case: adjacent parcels to Miami Lakes for phased expansion.

### Template 6: Development Joint Venture
KaNeXT contributes land or capital, development partner contributes expertise. KaNeXT retains majority ownership and operational control. Partner compensated through fees and/or minority equity. KaNeXT manages completed property through KaNeXT OS.

---

## 10. Confidence Gate

Confidence measures how much verified data backs the evaluation. Low confidence does not mean a bad property - it means the evaluation carries more uncertainty.

### Confidence Tiers

**HIGH (85-100%):** Full appraisal (within 12 months) + Phase I Environmental (within 12 months) + title search and commitment + ALTA survey + site visit by KaNeXT representative + zoning confirmation letter + three or more comparable sales within 1 mile + flood zone determination.

**MEDIUM (60-84%):** At least four of: public records data, drive-by inspection, at least one comparable sale within 3 miles, zoning map review, flood zone check, Phase I (may be older than 12 months).

**LOW (30-59%):** Public records data + satellite imagery + limited comparable sales (submarket-wide) + no environmental assessment + no site visit + no appraisal.

**INSUFFICIENT (Below 30%):** Critical data missing. No verified acreage, no zoning confirmation, no environmental data, no comparable sales, no site visit. Evaluation cannot proceed.

### Key Confidence Rules

- No Phase I Environmental caps confidence at 65% regardless of other data
- No site visit reduces confidence by 15 points
- Zoning uncertainty (maps only, no formal confirmation) reduces by 10 points
- No comparable sales within 3 miles reduces by 10 points

---

# PART 2: PORTFOLIO INTELLIGENCE

---

## 11. Portfolio KR

Portfolio KR is the capital-weighted aggregation of individual Property KRs across all holdings. It tells you the overall quality of the real estate portfolio and whether new acquisitions improve or dilute it.

### Computation

Capital Weight per property = Capital Deployed in property / Total Capital Deployed

Portfolio KR = Sum of (Property KR x Capital Weight) for all properties

The same capital-weighting applies to each component KR, producing Portfolio LKR, Portfolio FKR, Portfolio DKR, and Portfolio SKR.

### Diagnostics

After computing Portfolio KR, the system generates:

- **Strongest property:** Highest individual Property KR
- **Weakest property:** Lowest individual Property KR
- **KR Range:** Difference between highest and lowest. Ranges over 25 points indicate high variance.
- **Capital-weighted vs equal-weighted KR:** If these differ by 3+ points, capital allocation is skewed toward higher or lower KR properties.
- **Component KR imbalance:** If any portfolio component is 10+ points below the highest, it flags a portfolio-level weakness.

---

## 12. Geographic Concentration Analysis

Geographic concentration measures how much capital is deployed in each submarket. High concentration increases risk from a single-market downturn.

### County-Level Concentration

County Concentration = Capital in County / Total Portfolio Capital

Flags: Single county above 80% = HIGH. Single county above 90% = CRITICAL. No county above 50% = HEALTHY.

### Year 1 Expected Profile

The Year 1 portfolio is intentionally concentrated: Miami Lakes (596 acres + construction) at approximately $530M (84% of $630M) and Miami Gardens (FMU campus) at approximately $100M (16%). This concentration is expected and strategically justified because both are core institutional assets. Geographic diversification comes in later phases as mandate schools in other markets generate cluster housing demand.

The intelligence system flags the concentration without recommending against it. The flag ensures awareness, not avoidance.

---

## 13. Capital Allocation Optimization

Capital allocation answers: given finite capital, how should the portfolio be constructed to maximize strategic value per dollar?

### Capital Efficiency Score

Capital Efficiency = Property KR / (Capital Deployed / $1M)

Benchmarks: Campus land at $330M with KR 94 = 0.28 KR per $M (low efficiency but highest strategic value). Cluster housing at $200K with KR 87 = 435 KR per $M (extremely high efficiency). FMU campus at $100M with KR 90 = 0.90 KR per $M.

Capital efficiency is informational, not prescriptive. A low-efficiency property with 95+ System Fit is still mandatory.

### Marginal KR Impact

Before acquiring a new property: New Portfolio KR = (Current Portfolio KR x Current Capital + New Property KR x New Capital) / (Current Capital + New Capital)

If the new property dilutes Portfolio KR, document whether strategic justification supports the dilution.

### Deployment Capacity Tracking

Total real estate budget: $630M. Deployed: $X. Committed but not closed: $Y. Truly available: $630M - $X - $Y. Every acquisition recommendation verifies remaining capacity.

---

## 14. Development Sequencing

Development sequencing determines the order in which properties should be developed, balancing institutional need, IOA phase triggers, capital efficiency, and construction logistics.

### Sequencing Algorithm

1. **Identify blocking dependencies.** Infrastructure (roads, utilities, drainage) before buildings. Always.
2. **Align to IOA phases.** Phase 1 facilities begin immediately. Phase 2 begins within 6 months to allow construction lead time.
3. **Prioritize revenue-generating facilities.** Within the same phase, housing and dining before academic buildings where construction permits.
4. **Balance construction load.** No more than 3-5 major projects simultaneously to avoid contractor scarcity and management overload.
5. **Reserve contingency.** Hold 10-15% of construction budget for overruns.

### Year 1 Expected Sequence (Illustrative)

Immediate (Month 0-3): Site infrastructure on 596 acres. FMU campus renovations for Phase 1 operations.

Near-term (Month 3-12): Athletic facilities (practice courts, training rooms). First student housing. First academic/administrative building.

Parallel (Month 6-18): Dining facility. Student center. Additional housing.

---

## 15. Revenue Projection

Revenue projection models income the real estate portfolio generates over time. All revenue flows through KayPay.

### Revenue Sources

Housing revenue (dormitories, cluster housing), dining revenue (meal plans, casual), parking revenue (permits, events), retail/commercial revenue (campus-adjacent leases, bookstore), facility rental revenue (athletic venues, conference space, summer camps).

### Mandate-Backed Occupancy

This is the key differentiator from traditional student housing. Demand is institutional, not market-driven. Mandate school students and athletes generate predictable demand. Base occupancy assumes 85% of units filled by mandate demand.

### HBCU Capital Financing Impact

At $200M, 3.25% rate, 30-year term: annual debt service approximately $10.4M. Required NOI at 1.2x DSCR: approximately $12.5M. The revenue projection must demonstrate that financed facilities generate at least this NOI.

---

## 16. Risk Diversification Scoring

Risk diversification measures portfolio protection against concentrated risk. Five dimensions scored 0-100, with the minimum score defining the portfolio's risk floor.

**Geographic risk:** Single county above 80% = HIGH.

**Property type risk:** Single type above 70% = HIGH.

**Development stage risk:** Healthy mix is 30-50% operating, 20-30% under development, 20-30% entitled/planned.

**Revenue concentration risk:** Single property generating 50%+ of revenue = HIGH.

**Financing risk:** Over 50% financed = ELEVATED. Under 30% = CONSERVATIVE. Year 1 target: 32% financed (conservative).

Composite Risk Diversification Score = MIN across all dimensions. Year 1 expected: 30-40 (concentrated, expected for greenfield build). Target Year 3: 60+.

---

# PART 3: SIMULATION AND STRESS TESTING

---

## 17. Deal Scenario Modeling

Every potential acquisition runs three financial scenarios before capital is committed.

### Bull Case (Upside)
Acquisition at or below asking. Construction on time and budget. Occupancy reaches stabilized target within 6 months. Market appreciation 5%+. Operating expenses flat. No surprises.

### Base Case (Expected)
Acquisition at asking. Construction 10% over budget, 2 months late. Occupancy reaches 85% of target within 12 months. Appreciation 2-3%. OpEx grows 2% annually. Minor friction resolved without material cost.

### Bear Case (Downside)
Acquisition at asking. Construction 25% over, 6 months late. Occupancy reaches 70% of target within 18 months. Market flat or declining 1-2%. OpEx grows 4%. Environmental remediation required. Regulatory delay adds 12 months.

### Return Metrics Per Scenario

IRR (5-year and 10-year), cash-on-cash return, equity multiple, payback period, break-even occupancy, DSCR at stabilization.

### Decision Framework

Base case IRR must meet fund target return. Bear case DSCR must exceed 1.2x. Bear case break-even occupancy must be coverable by mandate demand.

---

## 18. Development Scenario Simulation

Development simulation models construction outcomes before groundbreaking. It is distinct from the Development Timeline Engine (which tracks actual progress). Simulation models hypothetical scenarios.

### Construction Variables

Contractor mobilization (immediate to 90-day delay), permitting (on schedule to 180 days late), material cost inflation (0% to 15%), labor availability (full crew to 70% staffed), weather delays (0 to 45 days), change orders (0% to 15% of budget), subcontractor performance, inspection failures.

### Phased Campus Simulation

The 596-acre Miami Lakes campus buildout is simulated across IOA phases:

- Phase 1 (Year 1): Infrastructure, first academic building, first dormitory, first athletic facility. $200M construction budget.
- Phase 2 (Year 2-3): Additional housing, dining, student center, expanded athletics.
- Phase 3 (Year 3-5): Remaining academic buildings, commercial perimeter, expanded housing.

Each phase is modeled under bull, base, and bear construction scenarios with cascading impacts (Phase 1 delays cascade into Phase 2 timelines).

### Parallel Development Capacity

1-2 concurrent projects: LOW management load. 3-4: MODERATE. 5-6: HIGH (requires construction management firm). 7+: CRITICAL (recommend phased starts).

---

## 19. Market Cycle Stress Testing

The intelligence system models portfolio performance under five adverse market scenarios.

### Scenario A: Mild Recession (2001-type)
Values decline 5-10% over 18 months. Rental rates decline 3-5%. Vacancy increases 5-8 points. Recovery within 24 months.

### Scenario B: Moderate Recession (2008-type)
Values decline 20-35% over 24-36 months. Rental rates decline 10-15%. Vacancy increases 10-15 points. Credit freeze for 6-12 months. Recovery takes 48-72 months.

### Scenario C: Interest Rate Shock
Rates increase 300-400 bps over 12 months. Values decline 10-20% (cap rate expansion). Construction costs increase 10-20%.

### Scenario D: Local Market Disruption
Major employer departure. Population declines 2-5% over 3 years. Values decline 15-25%.

### Scenario E: Natural Disaster (Hurricane)
Physical damage 5-30% of value. 30-90 day operational disruption. Insurance claims. Temporary vacancy increase.

### KaNeXT-Specific Stress Mitigants

**Mandate-backed occupancy:** Student housing demand is institutional, not market-driven. As long as mandate schools operate, occupancy has a floor. Mitigates Scenarios A, B, and D for housing.

**Institutional use properties:** Academic buildings and athletic facilities are valued by institutional utility, not cap rate. Market declines do not impair usefulness.

**Zero fund-level debt at deployment:** No drawn debt at closing. HBCU financing is institutional (through FMU), not fund-level. Eliminates margin call risk.

**Long-term hold strategy:** Properties held 10-30+ years for institutional use. Short-term market declines do not trigger disposition.

Every stress test shows both raw impact and mitigated impact side by side.

---

## 20. Portfolio Optimization Simulation

Models alternative portfolio compositions to determine if rebalancing improves risk-adjusted returns.

### Alternative Scenarios Compared

Scenario 1 (Current): $330M campus + $100M FMU + $200M construction = $630M.

Scenario 2 (More Housing): $200M smaller campus + $100M FMU + $150M construction + $180M cluster housing = $630M.

Scenario 3 (Phased Campus): $100M Phase 1 land + $100M FMU + $200M construction + $130M housing + $100M reserved = $630M.

Scenario 4 (Geographic Diversification): $250M campus + $100M FMU + $150M construction + $130M housing across 5+ markets = $630M.

Each compared on: Portfolio KR, System Fit, geographic diversification, property type mix, revenue projection, IRR, break-even timeline, risk score, recession resilience.

Any alternative must satisfy: campus sufficient for IOA Phases 1-4, FMU acquisition non-negotiable, minimum $150M construction, minimum $50M reserve, support 16-sport athletic program, house 500+ students by Year 2.

---

## 21. Cluster Housing Demand Simulation

Models student and athlete housing demand near each mandate school.

### Demand Model

Total Housing Demand = Students Needing Housing + Athletes Needing Housing

Units Needed = Total Housing Demand / Average Household Size

### Guaranteed Occupancy Model

Mandate school students generate predictable demand. If a school has 200 athletes and 50% need housing, that is 100 guaranteed tenants. Model at 85%, 90%, and 95% occupancy scenarios.

### Acquisition Phasing

Aggressive: all units Year 1 (highest capital, immediate revenue, risk of over-acquisition). Moderate: 60% Year 1, 40% Year 2 (balanced). Conservative: 40%/30%/30% over 3 years (lowest risk, slowest revenue).

---

# PART 4: TRANSACTION EXECUTION

---

## 22. Due Diligence Protocol

Due diligence is the systematic investigation of a property before committing capital. Four phases, 45+ checklist items, with gates between each phase.

### Phase DD-1: Desktop Review (Days 1-7)

12 items using publicly available data: parcel confirmation, ownership, assessed value and tax history, zoning, future land use, FEMA flood zone, satellite imagery, comparable sales, environmental records search, preliminary title search, demographic data, municipal disposition.

**DD-1 Gate:** Fatal flaw (floodway, Superfund, disputed ownership, prohibited zoning) = STOP.

### Phase DD-2: Physical Inspection (Days 7-21)

11 items requiring site presence: exterior inspection, interior inspection (if structures), photographic documentation, video walkthrough, neighborhood drive-around, access verification, utility verification, topography observation, adjacent property observation, noise/nuisance assessment.

**DD-2 Gate:** Material condition not visible in desktop review = reassess. Property KR below 75 after update = PASS unless strategic value justifies.

### Phase DD-3: Professional Assessment (Days 14-45)

15 items, mix of mandatory and conditional: Phase I Environmental (mandatory), Phase II (conditional on Phase I), MAI appraisal (mandatory over $1M), ALTA survey (mandatory for campus land), boundary survey, title commitment (mandatory), structural engineering (conditional for structures over 20 years), roof inspection, HVAC assessment, geotechnical report, traffic study, wetlands delineation, asbestos/lead inspection, ADA compliance, zoning confirmation letter (mandatory).

**DD-3 Gate:** Phase I reveals remediation exceeding 10% of price = renegotiate or PASS. Appraisal below contract price = renegotiate. Survey reveals encroachment = resolve before close.

### Phase DD-4: Legal and Regulatory Review (Days 21-45)

10 items: purchase agreement review, title commitment review, zoning code analysis, building code requirements, impact fee calculation, concurrency review, HOA/POA restrictions, existing lease review, insurance requirements, entity formation.

---

## 23. Site Visit Protocol

The site visit catches issues that desktop review and professional reports miss.

### Pre-Visit Preparation

Print Property Profile, parcel map, FEMA flood map, zoning map. Review satellite imagery. Note specific areas to inspect. Bring camera, measuring tape, notepad, flashlight.

### On-Site Sequence

Exterior (30-60 minutes for land, 60-120 for structures): Perimeter walk confirming boundaries. Access points and road frontage. Topography and drainage patterns. Utility connections at boundary. Vegetation and natural features. Adjacent properties. Structures if present.

Interior (if structures, 60-180 minutes): Walk every room noting condition. Inspect electrical panel, HVAC, plumbing, water heater, fire suppression. Roof access if safe. Below-grade spaces if present.

### Documentation Requirements

Photos: each side of property, each access point, utilities, topographic features, every room interior, all mechanical systems, roof, damage or condition issues, adjacent properties. Minimum 20+ photos.

Video: continuous exterior walkthrough (5-10 minutes) and interior walkthrough (10-20 minutes for structures). Narrate observations.

### Site Visit Report

Property condition assessment (1-5 scale), exterior observations, interior observations, items not accessible, findings that impact Property KR, attached photos and video.

---

## 24. Closing Process Management

Tracks every step from executed contract to recorded deed.

### Standard Acquisition Timeline (60 days)

Day 0: Contract executed. Days 1-3: Earnest money deposited. Days 1-7: Desktop DD. Days 1-5: Title search, Phase I, survey, appraisal ordered. Days 7-14: Site visit. Days 14-35: Professional reports received. Days 30-40: DD complete, objections submitted. Days 40-50: Closing documents prepared. Days 45-55: Final walkthrough. Days 50-60: Closing (deed transfer, recording). Days 60-70: Post-closing (title policy, insurance, property management transition).

### Philanthropic Transfer Timeline (FMU Model, 90 days)

Day 0: IOA executed. Days 1-30: Philanthropic capital structuring, appraisal for gift valuation. Days 1-45: Title and environmental. Days 30-60: University board approval, leaseback agreement. Days 45-75: Capital disbursed, deed transferred. Days 60-90: Leaseback effective, insurance transition.

### Wire Fraud Prevention

Closing funds wired only after verbal confirmation of wire instructions at a known phone number. Never rely on email-only instructions.

---

## 25. Appraisal Review Protocol

Every appraisal is reviewed before informing acquisition decisions.

### Review Checklist

9 items: property identification (correct parcel, acreage), highest and best use analysis, comparable sales selection (truly comparable in size, type, location, date), adjustments (reasonable, documented), income approach assumptions, cost approach assumptions, value conclusion consistency, extraordinary assumptions, limiting conditions.

### Appraisal vs Acquisition Price

Appraisal >= contract price: proceed. Appraisal 5-10% below: assess strategic justification (SKR > 85 may justify premium). Appraisal 10-20% below: renegotiate. Appraisal 20%+ below: strong renegotiation or PASS, requires CEO approval with documented rationale.

---

## 26. Post-Closing Integration

A property is not "acquired" until integrated into the portfolio management system, insured, and operational.

### First 30 Days

Record deed. Add to portfolio system. Activate insurance. Transfer utilities. Change locks. Engage property manager. Set up KayPay rent collection (if income-producing). Establish maintenance schedule. Begin design for development (if applicable).

---

# PART 5: POST-ACQUISITION INTELLIGENCE

---

## 27. Development Timeline Engine

Tracks construction progress for every property under active development. Monitors schedule, budget, quality, and dependencies in real time.

### Milestone Tracking

New construction follows an 11-milestone sequence: entitlement, design, permit, site prep, foundation, structural, enclosed, systems, finish, certificate of occupancy, operational. Renovation follows a 9-milestone sequence.

### Schedule Variance

Actual date minus planned date per milestone. 1-2 weeks behind: MONITOR. 2-4 weeks: ALERT. 4-8 weeks: WARNING (escalate to project manager). 8+ weeks: CRITICAL (escalate to CEO, assess IOA phase impact).

### Budget Tracking

Budget variance = actual cost to date minus budgeted cost to date. Under 5% over: MONITOR. 5-10%: ALERT (identify causes). 10-20%: WARNING (value engineering required). Over 20%: CRITICAL (scope review required).

### Dependency Tracking

Hard dependencies: Project B cannot start until Project A completes (e.g., building cannot begin until infrastructure is in place). Soft dependencies: Project B is more efficient if A completes first. External dependencies: municipality, utility company, permit authority.

If a hard dependency predecessor is 4+ weeks behind, the successor project is automatically flagged at risk.

---

## 28. Asset Performance Monitoring

Tracks operational performance of completed properties against projections.

### Monthly Metrics (Income-Producing Properties)

Occupancy rate, gross revenue, operating expenses, NOI, NOI margin, delinquency rate, turnover rate (quarterly), CapEx (quarterly), actual cap rate (annual), DSCR (monthly if financed).

### Monthly Metrics (Non-Income Properties)

Utilization rate, maintenance cost, CapEx (quarterly), condition score (annual, 1-5 scale), deferred maintenance backlog (annual).

### Variance Analysis

Occupancy below projected by 5%+: ALERT. By 10%+: WARNING. NOI below projected by 10%+: WARNING. By 20%+: CRITICAL. DSCR below 1.2x: WARNING. Below 1.0x: CRITICAL.

### Performance Diagnosis

Revenue shortfall causes: market-driven (rental rates declined), operational (poor management), structural (property condition), institutional (mandate school enrollment declined).

Expense overrun causes: aging systems, insurance increases, tax reassessment, utility rates, staffing costs.

### KR Re-evaluation Trigger

If a property underperforms for 6+ consecutive months, trigger a full Property KR re-evaluation. Re-evaluated KR is presented alongside original with variance noted. If re-evaluated KR drops below 75, trigger disposition analysis.

---

## 29. Disposition Intelligence

Determines when to sell, wind down, or repurpose a property.

### Disposition Triggers

Financial underperformance (NOI below projected 12+ months). Strategic misalignment (mandate school closed, demand evaporated). Capital redeployment (selling frees capital for higher-KR acquisition). Maintenance burden (CapEx exceeds 30% of value within 5 years). Market peak (property appreciated significantly). Forced (regulatory action, eminent domain).

### Hold vs Sell Analysis

Hold: project 5-year cash flows + terminal value. Compute hold IRR.

Sell: estimate net proceeds after selling costs and remaining debt. Compute redeployment IRR (invest proceeds into best available acquisition).

Decision: Hold IRR > Sell + Redeploy IRR = HOLD. Sell + Redeploy exceeds Hold by 200+ bps = SELL. Within 200 bps = consider strategic factors.

### Disposition Methods

Market sale (6-12 month marketing), off-market sale (direct negotiation), 1031 exchange (defer capital gains, reinvest within 180 days), ground lease conversion (retain ownership, generate recurring income), demolition and redevelopment (if land value exceeds improvement value).

---

## 30. Expansion Intelligence

Identifies when and how to grow the portfolio.

### Expansion Triggers

Enrollment-driven: mandate school enrollment exceeds housing/facility capacity. Market-driven: submarket conditions create acquisition opportunity. IOA phase-driven: new phase triggers new facility requirements. Adjacent parcel assembly: parcels next to existing holdings become available.

### New Market Entry Protocol

When a mandate school signs in a new market: 1) Market scan. 2) Housing demand model. 3) Supply scan. 4) Evaluate top 3-5 candidates. 5) Portfolio fit assessment. 6) Recommend: acquire, defer, or pass.

### Campus Expansion Playbook

Phase 1: use only portions of 596 acres needed for immediate construction. Adjacent parcel monitoring: watchlist all parcels within 0.5 miles, evaluate immediately when one hits market. Density optimization: expand vertically before acquiring new land. Mixed-use perimeter: develop campus perimeter facing public roads for commercial revenue and campus gateway effect.

---

# PART 6: CURRENT KANEXT REAL ESTATE TARGETS

---

## 31. 596 Acres, Miami Lakes, FL

Property Type: Campus Land. Asking price: $330,000,000. Location: between I-75 and Florida Turnpike, Graham Companies ownership. Intended use: primary campus and institutional development site. 100-year ground lease to FMU at $1/year. KaNeXT owns land and all improvements.

Key attributes: highway frontage on two major corridors, Miami-Dade County (Tier 1 market), undeveloped land in high-growth submarket, large enough for full campus buildout (academic, athletic, residential, dining, commercial).

Deal structure: cash acquisition from fund capital. IOA Phase alignment: acquisition Phase 1, construction Phase 1 through Phase 3, substantial relocation Phase 4. This is the centerpiece acquisition - 66% of the $500M fund raise and 51% of the $630M real estate allocation.

Expected Property KR range: 92-96 (Generational Asset tier). Expected System Fit: 95%+.

---

## 32. 52.6 Acres, Miami Gardens, FL (FMU Campus)

Property Type: Urban Campus. Transfer basis: $100,000,000 philanthropic capital directed to FMU in exchange for deed transfer. Location: current FMU campus.

Intended use: leaseback to FMU at $1/year during transition (Phase 1 through Phase 3). Post-relocation converts to Provider-controlled use (headquarters, redevelopment).

Key attributes: existing institutional campus with buildings, classrooms, administrative facilities. Accredited HBCU campus. Existing infrastructure for 436 students. Largest single financial event in FMU's institutional history.

Deal structure: philanthropic transfer. Not a traditional sale. Leaseback at $1/year until relocation. IOA Phase alignment: transfer Phase 1, FMU operates through Phase 2, relocation Phase 3, full conversion Phase 4.

Expected Property KR range: 88-93 (Turnkey Institution tier). Expected System Fit: 90%+.

---

## 33. Cluster Housing Near Mandate Schools

Property Type: Cluster Housing. Budget: TBD (from operations or reserve). Location: within 1-5 miles of each mandate school campus.

Intended use: student and athlete housing. Guaranteed occupancy from mandate enrollment. Rent through KayPay. Multiple small residential properties clustered near each institution. Revenue-generating from Day 1.

Deal structure: portfolio acquisition (bulk discount). Phase by school priority (FMU first). IOA alignment: Phase 1 for FMU-area housing, subsequent phases as schools activate.

This is the lowest-risk, most predictable revenue stream. Each mandate school creates guaranteed demand. As the network grows, the housing portfolio grows with it.

---

## 34. Adjacent Parcels to Miami Lakes

Property Type: Campus Land. Budget: TBD (from reserve or future capital). Location: adjacent to 596-acre site.

Intended use: phased campus expansion. Securable through option agreements to lock pricing without deploying full capital. Prevents third-party development on adjacent parcels. Locks in pricing before campus drives appreciation.

Deal structure: land bank/option agreement. Options secured Phase 1, exercised Phase 3 or 4 based on growth.

---

# PART 7: FINANCIAL MODELING

---

## 35. Financial Modeling Framework

Every real estate investment is modeled through a standardized framework producing consistent, comparable outputs.

### Acquisition Cost Model

Total acquisition cost = purchase price + closing costs (2-3%) + transaction costs (legal, advisory, due diligence). For the FMU philanthropic transfer: cost = $100M philanthropic capital + legal/structuring costs.

### Development Cost Model

Total development cost = hard costs (construction) + soft costs (architecture, engineering, permitting, 15-20% of hard costs) + contingency (10-15% of hard costs) + carry costs (taxes, insurance, interest during construction).

### Operating Cost Model

Annual operating expenses = property taxes + insurance + maintenance + management + utilities + reserves for replacement. For institutional properties: add institutional operating costs (staffing, programming).

### Revenue Model

For income-producing properties: annual gross revenue = units x rate x occupancy x 12. For campus properties: value measured by institutional utility (cost avoidance vs leasing equivalent space commercially).

### Key Financial Metrics

Cap rate: NOI / acquisition cost. Cash-on-cash return: annual cash flow / total cash invested. IRR: internal rate of return over hold period. DSCR: NOI / annual debt service. Cost per student housed: total cost / student beds. Cost per seat: facility cost / seating capacity.

---

## 36. HBCU Capital Financing

$200M accessed through FMU's accredited HBCU status. Expected terms: 3.0-3.5% interest, 25-30 year maturity.

At $200M, 3.25%, 30 years: monthly payment approximately $870K. Annual debt service approximately $10.4M.

KaNeXT (as Provider under the IOA) is responsible for servicing this debt. It does not reduce FMU's tuition revenue allocation, does not impact the Academic and Faculty Excellence Fund, and does not create direct liability for the University beyond its role as borrower.

Required NOI at 1.2x DSCR: approximately $12.5M. The facilities financed by this capital must generate at least this NOI to maintain healthy debt coverage.

---

# PART 8: HOW IT LIVES IN THE APP

---

## 37. How Real Estate Intelligence Lives in the KaNeXT App

Real estate intelligence lives inside the KaNeXT app through Nexus AI, the same conversational interface that powers basketball intelligence. The real estate team does not navigate separate dashboards or review PDF appraisals in isolation. They interact with Nexus.

### Conversational Interface

A real estate team member opens the KaNeXT app in Business Mode and asks Nexus:

"Evaluate the property at 123 Main Street, Miami Lakes" - Nexus runs the full 10-step evaluation pipeline and returns the Property KR, components, System Fit, risks, and recommendation.

"What should we build first on the 596 acres?" - Nexus references the development sequencing algorithm and IOA phases to produce a prioritized construction schedule.

"Stress test the portfolio under a 2008-type recession" - Nexus runs Scenario B and shows raw impact, mitigated impact, and recommended actions.

"Find cluster housing near FMU" - Nexus runs the demand model, identifies the search radius, and evaluates candidate properties.

"How is our Miami Lakes construction tracking?" - Nexus pulls the Development Timeline Engine output for active projects.

"Should we sell the property on Oak Street?" - Nexus runs the disposition analysis comparing hold vs sell IRR.

### Data Room Integration

Real estate intelligence is part of the KaNeXT data room. Investors asking about the real estate strategy talk to Nexus instead of reading spreadsheets. Nexus can explain the portfolio composition, the development timeline, the financial projections, and the risk profile in conversational language backed by the intelligence system's deterministic outputs.

The executive summary's job is to make investors open the app. Once inside, Nexus handles the conversation.

### Cross-Intelligence Integration

Real estate intelligence connects to other intelligence systems within KaNeXT:

- **Admissions Intelligence:** Enrollment projections drive cluster housing demand models.
- **Hiring Intelligence:** Staffing plans drive campus facility sizing (office space, training rooms).
- **Basketball/Sports Intelligence:** Athletic roster sizes drive housing demand and facility requirements.
- **Acquisition Intelligence:** Real estate acquisitions are a subset of the broader acquisition portfolio and appear in the Acquisition Portfolio Intelligence system.

The KaNeXT OS is a single operating system. Real estate intelligence does not exist in isolation. It is one module in the institutional intelligence layer, connected to every other module through shared data and shared governance.

---

## 38. How Real Estate Intelligence Extends Across the Mandate Network

As KaNeXT signs additional mandate schools, the real estate intelligence system scales:

Each new mandate school triggers a New Market Entry assessment (Section 30). The cluster housing demand model runs automatically. Candidate properties are evaluated through the standard pipeline. Portfolio impact is assessed.

The system is designed to work for a $330M campus acquisition and a $200K cluster housing unit. The same Property KR, the same component KRs, the same System Fit, the same confidence gate. Scale does not change the methodology - it changes the inputs.

By Year 5, the real estate portfolio may span dozens of properties across multiple markets. The intelligence system tracks every property, monitors every development project, forecasts every revenue stream, and stress tests the entire portfolio continuously. One system. One truth. Universal ratings.

---

# PART 9: GOVERNANCE AND REFERENCE

---

## 39. Core Governance Principles

1. **Deterministic:** Same inputs produce same outputs. No randomness. No editorial override.
2. **Auditable:** Every step logged with inputs, outputs, confidence, and timestamps.
3. **No truth mutation:** Downstream engines NEVER modify upstream outputs. Development Timeline does not change Property KR. Disposition analysis does not change System Fit. Portfolio KR does not override individual Property KRs.
4. **Confidence transparency:** Every output includes confidence percentage. The system never hides uncertainty.
5. **No data fabrication:** If data is missing, the metric is UNSCORED. No invented comparable sales. No guessed environmental conditions. No fabricated occupancy projections.
6. **Legend is display-only:** Legend labels interpret Property KR. They do not produce or modify it.
7. **KLVN normalization:** All cross-market and cross-type comparisons use lambdas. A Property KR at one market tier means something specific at every other tier.
8. **Fund-level constraint awareness:** Every financial model accounts for the fund's total capital position. $330M consumes 66% of the $500M raise. The system flags concentration at the fund level.
9. **IOA phase alignment:** Development recommendations reference the IOA schedule. Construction not aligned with a phase trigger is premature capital deployment.
10. **Escalation protocol:** CRITICAL flags escalate to CEO. WARNING flags escalate to real estate team lead. ALERT flags are tracked in reporting.

---

## 40. Suppression Detection

Suppression detection identifies properties whose apparent KR is artificially depressed by temporary or correctable conditions.

### Deferred Maintenance Suppression

Strong fundamentals (location, zoning, strategic alignment) but poor physical condition from deferred maintenance. If cure cost is less than 15% of acquisition price and the cured property would score 5+ points higher, flag as suppressed.

### Market Cycle Suppression

Property in a temporarily depressed submarket. FKR is low from recent comps in a down market, not from property-specific deficiency. Model both current and recovery scenarios.

### Zoning Misclassification Suppression

Property zoned for a lower-value use than location supports. If rezoning probability exceeds 70% based on comprehensive plan alignment, model at post-rezoning potential with current zoning noted as correctable.

### Distressed Seller Suppression

Property available below market because the seller is under financial pressure. The property is not distressed - the seller is. True Property KR reflects fundamentals, not distressed pricing. The discount is captured in FKR as a financial benefit.

---

## 41. Glossary

**ALTA Survey:** American Land Title Association survey. The highest standard of boundary survey, including all improvements, easements, and encroachments.

**BRT:** Bus rapid transit. Dedicated bus lanes with station infrastructure, faster than conventional bus service.

**Cap Rate:** Capitalization rate. Net operating income divided by property value. Measures the return rate independent of financing.

**Certificate of Occupancy (CO):** Official permit from the jurisdiction allowing a building to be occupied. Issued after final inspection confirms compliance with building codes.

**Cluster Housing:** Multiple small residential properties acquired near a specific institution to house students and athletes. Not a single large dormitory but a portfolio of proximate residential units.

**Comparable Sales (Comps):** Recent sales of similar properties in the same submarket used to estimate market value.

**Concurrency:** Local government requirement that infrastructure (roads, water, sewer) must have capacity to support new development before permits are issued.

**DSCR:** Debt Service Coverage Ratio. Net operating income divided by annual debt payments. 1.0x means income exactly covers debt. 1.2x+ is the minimum for healthy coverage.

**Due Diligence:** The investigation period between contract execution and closing where the buyer verifies all property conditions.

**Earnest Money:** Good-faith deposit made with the purchase contract. Typically 1-3% of price. Forfeited if buyer defaults without contractual right to terminate.

**Entitlement:** The legal right to develop property for a specific use. Includes zoning approval, variances, special exceptions, and any required regulatory permits.

**FEMA:** Federal Emergency Management Agency. Produces flood maps showing flood zone designations for every property in the US.

**FMU:** Florida Memorial University. 52.6-acre campus in Miami Gardens. Current KaNeXT institutional partner under IOA.

**HBCU Capital Financing:** Financing programs available to accredited Historically Black Colleges and Universities. Typically 3.0-3.5% interest, 25-30 year terms.

**Impact Fee:** One-time charge levied by local government on new development to fund public infrastructure (roads, schools, parks, emergency services).

**IOA:** Institutional Operating Agreement. The contract between KaNeXT and a university governing all operational services, campus development, and revenue sharing.

**IRR:** Internal Rate of Return. The annualized return that makes the net present value of all cash flows equal to zero. The standard measure of investment performance.

**KayPay:** KaNeXT's integrated payment rail. All campus revenue (rent, dining, parking, retail) flows through KayPay.

**KLVN:** KaNeXT Level Normalization (pronounced "Calvin"). Adjusts raw metrics so they are comparable across markets, property types, and development stages using lambda multipliers.

**KR:** KaNeXT Rating. Universal 0-100 rating. Property KR for real estate assets.

**Lambda:** The KLVN normalization multiplier. Values between 0 and 1 where the reference category equals 1.000.

**Leaseback:** Arrangement where the buyer acquires a property and immediately leases it back to the seller for continued use. FMU leases back its campus at $1/year until relocation.

**LKR:** Location KR. Component measuring intrinsic locational value.

**FKR:** Financial KR. Component measuring economic value proposition.

**DKR:** Development KR. Component measuring development readiness.

**SKR:** Strategic KR. Component measuring alignment with KaNeXT mission.

**Mandate School:** An institution whose governing body has signed a mandate agreement requiring all member schools to operate on the KaNeXT OS platform.

**MDI:** Minority Depository Institution. Bank designation providing access to federal capital programs.

**NOI:** Net Operating Income. Gross revenue minus operating expenses, before debt service.

**Phase I ESA:** Phase I Environmental Site Assessment. Desktop study and site walkthrough to identify recognized environmental conditions. Does not involve soil or water sampling.

**Phase II ESA:** Phase II Environmental Site Assessment. Physical sampling of soil, groundwater, or building materials triggered by Phase I findings. Confirms or rules out contamination.

**Property KR:** KaNeXT Rating for a real estate asset. 0-100 scale. Universal across property types.

**System Fit:** Measures how well a property integrates with the KaNeXT institutional ecosystem across four dimensions.

**Title Commitment:** A title company's promise to issue a title insurance policy, listing all exceptions and requirements that must be met before closing.

---

# APPENDIX A: COMPLETE COMPONENT KR SCORING DIMENSIONS

---

## A1. LKR Scoring Dimensions (Weights)

| Dimension | Weight | Band 90+ | Band 80-89 | Band 70-79 | Band 60-69 | Below 60 |
|-----------|--------|----------|------------|------------|------------|----------|
| Institutional proximity | 25% | Within 1 mile of mandate school | Within 2 miles | Within 5 miles | Within 10 miles | Beyond 10 miles |
| Transportation access | 20% | Highway frontage + transit | Highway access, no transit | Local roads, some transit | Local roads only | Limited access |
| Neighborhood quality | 20% | Below-avg crime, rising income | Average crime, stable income | Slightly above-avg crime | Above-avg crime | High crime |
| Growth trajectory | 15% | 2%+ population growth | 1-2% growth | Stable (0-1%) | Slight decline | Declining |
| Walkability/amenities | 10% | Walk Score 80+ | Walk Score 60-79 | Walk Score 40-59 | Walk Score 20-39 | Walk Score below 20 |
| Safety metrics | 10% | Low crime, no flood | Low crime, minor flood mitigation | Moderate crime or flood zone | High crime or flood | Both high crime and flood |

## A2. FKR Scoring Dimensions (Weights)

| Dimension | Weight | Band 90+ | Band 80-89 | Band 70-79 | Band 60-69 | Below 60 |
|-----------|--------|----------|------------|------------|------------|----------|
| Cost vs market | 25% | 10%+ below market | At market | 5-10% above | 10-20% above | 20%+ above |
| Appreciation | 15% | 5%+ annual | 3-5% annual | 1-3% annual | Flat | Declining |
| Rental yield | 15% | 8%+ gross | 6-8% gross | 5-6% gross | 3-5% gross | Below 3% |
| Development cost | 15% | Below market/sqft | At market | 10% above | 20% above | 30%+ above |
| OpEx ratio | 10% | Below 35% | 35-42% | 42-50% | 50-60% | Above 60% |
| Cap rate | 10% | Above 7% | 5.5-7% | 4-5.5% | 3-4% | Below 3% |
| DSCR | 10% | Above 1.5x | 1.3-1.5x | 1.2-1.3x | 1.0-1.2x | Below 1.0x |

## A3. DKR Scoring Dimensions (Weights)

| Dimension | Weight | Band 90+ | Band 80-89 | Band 70-79 | Band 60-69 | Below 60 |
|-----------|--------|----------|------------|------------|------------|----------|
| Zoning compatibility | 25% | Permitted by right | Minor variance | Special exception | Full rezoning (likely) | Rezoning (unlikely) |
| Environmental | 20% | Clean Phase I | Minor conditions | Phase II needed | Remediation needed | No assessment |
| Utility availability | 20% | All at boundary | Minor extension | Extension 0.5+ miles | Capacity upgrade | No access |
| Topography | 15% | Flat, well-drained | Moderate grading | Significant grade change | Drainage issues | Major obstacles |
| Existing structures | 10% | Usable buildings | Neutral (raw land) | Demo + rebuild | Hazmat present | Structural failure |
| Entitlement timeline | 10% | Under 6 months | 6-12 months | 12-18 months | 18-24 months | Over 24 months |

## A4. SKR Scoring Dimensions (Weights)

| Dimension | Weight | Band 90+ | Band 80-89 | Band 70-79 | Band 60-69 | Below 60 |
|-----------|--------|----------|------------|------------|------------|----------|
| Master plan alignment | 30% | IS the campus | Contiguous/adjacent | Within 3 miles, defined function | Same metro, secondary | No relationship |
| KaNeXT proximity | 15% | Contiguous | Within 1 mile | Same submarket | Same county | Isolated |
| Housing demand | 20% | 200+ needing housing | 100-199 | 50-99 | Under 50 | No mandate school |
| Visibility/brand | 15% | Highway frontage, landmark | Prominent street | Standard street | Industrial/hidden | Detracts from image |
| Expansion potential | 20% | 3+ adjacent parcels | 1-2 parcels | None but not landlocked | Limited by neighbors | Landlocked |

---

# APPENDIX B: MARKET CYCLE STRESS TEST PARAMETERS

---

| Parameter | Scenario A (Mild) | Scenario B (Moderate) | Scenario C (Rate Shock) | Scenario D (Local) | Scenario E (Hurricane) |
|-----------|------------------|----------------------|------------------------|-------------------|----------------------|
| Value decline | 5-10% | 20-35% | 10-20% | 15-25% | 5-30% (damage) |
| Duration | 18 months | 24-36 months | 12+ months | 36+ months | 30-90 days disruption |
| Rental rate impact | -3-5% | -10-15% | Stable to slight increase | -10-20% | Temporary |
| Vacancy increase | +5-8 pts | +10-15 pts | Stable | +15-20 pts | Temporary |
| Construction cost | -5% | Initially stable, then -10-15% | +10-20% | Stable | Repair costs |
| Credit availability | Normal | Frozen 6-12 months | Tighter terms | Normal | Insurance delays |
| Recovery timeline | 24 months | 48-72 months | Rate dependent | Economic diversification | Usually 6-12 months |

---

# APPENDIX C: IOA PHASE ALIGNMENT REFERENCE

---

## Phase 1: Platform Deployment, Athletics, and Enrollment

Trigger: IOA execution.

Real estate actions: Land acquisition (596 acres). FMU campus transfer and leaseback. Begin site infrastructure on new campus. FMU campus renovations. Initial cluster housing near FMU.

## Phase 2: Institutional Migration and Expanded Intelligence

Trigger: Operational stability of core systems across athletics and enrollment.

Real estate actions: Continued construction on new campus. Expanded housing. Broader campus facility development.

## Phase 3: Campus Operations

Trigger: Certificate of occupancy for first operational facility on new campus.

Real estate actions: Activate housing and dormitory operations. Deploy dining, parking, security, transportation. Transition campus operations to new site. Begin relocation from Miami Gardens.

## Phase 4: Full Operations

Trigger: 50%+ of enrolled students on new campus.

Real estate actions: Full campus operations across all facilities. Miami Gardens campus converts to Provider-controlled use. Long-term campus maturation and expansion.

---

# APPENDIX D: FOUNDING TEST CASES

---

## Test Case 1: 596 Acres Miami Lakes

Property Type: Campus Land. Expected KR: 92-96 (Generational Asset). Expected LKR: 90+ (highway frontage, growth corridor). Expected FKR: 80-85 (at market, significant capital). Expected DKR: 88-93 (large buildable parcel). Expected SKR: 95+ (IS the master plan). System Fit: 95%+. Confidence: MEDIUM (no Phase I in portfolio, public data based).

## Test Case 2: 52.6 Acres FMU Campus

Property Type: Urban Campus. Expected KR: 88-93 (Turnkey Institution). Expected LKR: 80-85 (Miami Gardens, Tier 1 but not premium submarket). Expected FKR: 85-90 ($100M transfer for existing campus, favorable). Expected DKR: 85-90 (existing, zoned institutional). Expected SKR: 90-95 (IS the FMU campus). System Fit: 90%+. Confidence: MEDIUM-HIGH (existing campus, known conditions).

## Test Case 3: Cluster Housing Near FMU

Property Type: Cluster Housing. Expected KR: Variable. Key criteria: proximity, unit count, condition, price per unit, mandate-demand occupancy. System Fit: 80-90%. Confidence: LOW-MEDIUM (initial identification).

---

# APPENDIX E: COMPLETE DEAL STRUCTURE REFERENCE

---

| Template | Use Case | Key Terms | Current Target |
|----------|----------|-----------|---------------|
| Cash Acquisition | Standard market purchase | Full price at close, title insurance, 30-60 day DD | 596 acres Miami Lakes ($330M) |
| Philanthropic Transfer | Charitable deed transfer | Tax-deductible, leaseback, appraisal for gift value | FMU 52.6 acres ($100M) |
| Leaseback | Seller continues occupancy | Nominal rent, defined period, maintenance terms | FMU campus transition |
| Portfolio Acquisition | Multiple residential properties | Bulk discount 5-15%, phased, PM before close | Cluster housing |
| Land Bank/Option | Secure future right to buy | Option fee 1-5%, price locked, aligned to IOA phase | Adjacent parcels Miami Lakes |
| Development JV | Construction partnership | KaNeXT majority ownership, partner fees/equity | Large-scale campus construction |

---

# END OF DOCUMENT

---

## Document Statistics

- **Total sections:** 41 main sections plus 5 appendices
- **Parts:** 9
- **Covers:** Property evaluation (10-step pipeline), 4 component KRs (LKR, FKR, DKR, SKR) with weighted scoring dimensions, 5 property type legends (Campus Land, Urban Campus, Cluster Housing, Commercial/Mixed Use, Athletic Facilities), KLVN normalization across 3 axes (market tier, property type, development stage), System Fit across 4 dimensions, 8 integration risk flags, 6 deal structure templates, 4-tier confidence gate, portfolio intelligence (Portfolio KR, geographic concentration, capital allocation, development sequencing, revenue projection, risk diversification), simulation and stress testing (deal scenarios, development simulation, 5 market stress scenarios, portfolio optimization, cluster housing demand), transaction execution (4-phase due diligence with 45+ items, site visit protocol, closing management, appraisal review, post-closing integration), post-acquisition intelligence (development timeline, asset performance monitoring, disposition, expansion), 4 current KaNeXT targets with full context, financial modeling framework, HBCU Capital Financing, suppression detection, complete glossary
- **Version:** 1.0
- **Date:** March 2026
- **Source files:** SKILL.md v1 (File 07), Real Estate Eval Process v1 (File 01), Real Estate Eval Reference v1 (File 02), Real Estate Portfolio Intelligence v1 (File 03), Real Estate Simulation Engine v1 (File 04), Real Estate Transaction Ops v1 (File 05), Real Estate Downstream Engines v1 (File 06), KaNeXT Data Room, IOA FMU, Capital Deployment, Asset Coverage, Term Sheet
- **For use by:** Nexus AI (internal reference), investors, real estate team, institutional partners, and anyone asking about KaNeXT Real Estate Intelligence
