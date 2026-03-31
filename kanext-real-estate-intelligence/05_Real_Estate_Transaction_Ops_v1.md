# REAL ESTATE TRANSACTION OPS
## v1.0

---

## 0. Scope

This document governs the operational execution of real estate transactions: due diligence protocol, site visit procedures, closing process management, and appraisal review. This is the "nothing gets missed" engine. Every acquisition, disposition, and major lease follows this protocol.

Transaction Ops consumes the evaluation output from File 01 (Property KR, component KRs, confidence gate) and operationalizes the path from evaluation to close. It does not modify evaluation outputs.

---

## 1. DUE DILIGENCE PROTOCOL

Due diligence is the systematic investigation of a property before committing capital. The protocol is structured as a checklist with mandatory and conditional items. Every mandatory item must be completed and documented before closing. Conditional items are triggered by property type, transaction type, or findings from mandatory items.

### 1.1 Due Diligence Phases

**Phase DD-1: Desktop Review (Days 1-7)**
Performed before any capital commitment or letter of intent. Uses publicly available data to determine if the property warrants further investigation.

| Item | Source | Status Options |
|------|--------|---------------|
| Parcel ID and legal description confirmed | County property appraiser | Complete / Incomplete |
| Current owner of record confirmed | County clerk | Complete / Incomplete |
| Assessed value and tax history (5 years) | County property appraiser | Complete / Incomplete |
| Current zoning designation confirmed | Municipal zoning department | Complete / Incomplete |
| Future land use designation confirmed | Municipal planning department | Complete / Incomplete |
| FEMA flood zone determination | FEMA Flood Map Service Center | Complete / Incomplete |
| Satellite imagery review | Google Maps / Google Earth | Complete / Incomplete |
| Preliminary comparable sales (3+ within 3 miles) | MLS, CoStar, public records | Complete / Incomplete |
| Environmental records search (EPA, state DEP) | EPA Envirofacts, state database | Complete / Incomplete |
| Preliminary title search (liens, mortgages, judgments) | County clerk, title company | Complete / Incomplete |
| Demographic and market data pull | Census, BLS, local chamber | Complete / Incomplete |
| Municipal disposition assessment (institutional use) | Municipal staff, public records | Complete / Incomplete |

**Phase DD-1 Gate:** If desktop review reveals a fatal flaw (property in floodway, active Superfund site, disputed ownership, zoning prohibits intended use with no legal pathway), STOP. Do not proceed to Phase DD-2. Document the finding and issue a PASS recommendation.

---

**Phase DD-2: Physical Inspection (Days 7-21)**
Performed after desktop review clears and before formal offer or during the due diligence period of a purchase contract.

| Item | Performed By | Status Options |
|------|-------------|---------------|
| Site visit - exterior inspection | KaNeXT representative | Complete / Incomplete |
| Site visit - interior inspection (if structures exist) | KaNeXT representative | Complete / Incomplete |
| Photographic documentation (exterior, all sides, access points, adjacent properties) | KaNeXT representative | Complete / Incomplete |
| Photographic documentation (interior, all rooms, systems, condition) | KaNeXT representative | Complete / Incomplete |
| Video walkthrough (for remote review by team) | KaNeXT representative | Complete / Incomplete |
| Neighborhood drive-around (surrounding uses, condition, traffic patterns) | KaNeXT representative | Complete / Incomplete |
| Access verification (all entry/exit points, road conditions, signage) | KaNeXT representative | Complete / Incomplete |
| Utility verification at boundary (visual confirmation of water, sewer, electric, telecom) | KaNeXT representative | Complete / Incomplete |
| Topography observation (drainage patterns, grade changes, standing water) | KaNeXT representative | Complete / Incomplete |
| Adjacent property observation (what is next door, compatibility with intended use) | KaNeXT representative | Complete / Incomplete |
| Noise/odor/nuisance assessment | KaNeXT representative | Complete / Incomplete |

**Phase DD-2 Gate:** If physical inspection reveals a material condition not visible in desktop review (structural failure, active dumping, unmapped water feature, hostile adjacent use), reassess. Update the Property KR with new data. If Property KR drops below 75, issue a PASS recommendation unless strategic value justifies continued pursuit.

---

**Phase DD-3: Professional Assessment (Days 14-45)**
Third-party professional reports ordered concurrently where possible.

| Item | Performed By | Mandatory / Conditional | Trigger |
|------|-------------|------------------------|---------|
| Phase I Environmental Site Assessment | Licensed environmental firm | MANDATORY for all | Always |
| Phase II Environmental Site Assessment | Licensed environmental firm | CONDITIONAL | Triggered by Phase I findings (recognized environmental conditions) |
| Full appraisal (MAI-certified) | Licensed appraiser | MANDATORY for all acquisitions over $1M | Always over $1M; recommended for all |
| ALTA/NSPS land title survey | Licensed surveyor | MANDATORY for all campus land | Always for campus land and athletic facilities; recommended for all |
| Boundary survey | Licensed surveyor | MANDATORY if no ALTA survey | Alternative to ALTA for smaller properties |
| Title commitment and title search | Title company | MANDATORY for all | Always |
| Structural engineering assessment | Licensed structural engineer | CONDITIONAL | Triggered for existing structures over 20 years old or with visible condition issues |
| Roof inspection | Licensed roofing contractor | CONDITIONAL | Triggered for existing structures with flat or aging roof |
| HVAC assessment | Licensed HVAC contractor | CONDITIONAL | Triggered for existing structures with commercial HVAC systems |
| Geotechnical report (soil borings) | Geotechnical engineer | CONDITIONAL | Triggered for new construction on previously undeveloped land |
| Traffic study | Traffic engineer | CONDITIONAL | Triggered when intended use generates significant traffic (campus, arena, commercial) |
| Wetlands delineation | Environmental scientist | CONDITIONAL | Triggered by presence of potential wetlands on or adjacent to property |
| Asbestos/lead paint inspection | Licensed inspector | CONDITIONAL | Triggered for structures built before 1980 |
| ADA compliance assessment | Accessibility consultant | CONDITIONAL | Triggered for existing structures to be used for public or institutional purposes |
| Zoning confirmation letter | Municipal zoning department | MANDATORY for all | Always. Written confirmation, not just map review |

**Phase DD-3 Gate:** If professional assessments reveal material risk not previously identified, update the Property KR with new data and recalculate. Common scenarios:

- Phase I reveals recognized environmental conditions: order Phase II. If remediation cost exceeds 10% of acquisition price, renegotiate or PASS.
- Appraisal comes in below contract price: renegotiate to appraised value or below, or justify the premium in writing.
- Survey reveals encroachment, easement, or boundary dispute: resolve before closing or negotiate price reduction.
- Title search reveals lien, judgment, or encumbrance: seller must clear before closing.
- Geotechnical report reveals unsuitable soil: add foundation cost to development budget. If foundation cost exceeds 20% of construction budget, reassess feasibility.

---

**Phase DD-4: Legal and Regulatory Review (Days 21-45)**

| Item | Performed By | Status Options |
|------|-------------|---------------|
| Purchase and sale agreement review | Real estate counsel | Complete / Incomplete |
| Title commitment review (exceptions, exclusions) | Real estate counsel | Complete / Incomplete |
| Zoning code analysis (permitted uses, density, setbacks, parking requirements) | Real estate counsel or zoning consultant | Complete / Incomplete |
| Building code requirements for intended use | Architect or code consultant | Complete / Incomplete |
| Impact fee calculation | Municipal planning department | Complete / Incomplete |
| Concurrency review (roads, water, sewer capacity for intended use) | Municipal planning department | Complete / Incomplete |
| HOA/POA restrictions review (if applicable) | Real estate counsel | Complete / Incomplete |
| Existing lease review (if tenants in place) | Real estate counsel | Complete / Incomplete |
| Insurance requirements and preliminary quote | Insurance broker | Complete / Incomplete |
| Entity formation for property holding (if needed) | Corporate counsel | Complete / Incomplete |

---

### 1.2 Due Diligence Checklist - Summary Dashboard

```
DUE DILIGENCE STATUS: [Property Name]
Transaction Type: [Acquisition / Disposition / Lease]
Contract Date: [Date]
Due Diligence Deadline: [Date]
Days Remaining: [N]

Phase DD-1 (Desktop):     [X/12 items complete] [PASS / CLEAR]
Phase DD-2 (Physical):    [X/11 items complete] [PASS / CLEAR / NOT STARTED]
Phase DD-3 (Professional): [X/Y items complete]  [PASS / CLEAR / IN PROGRESS]
Phase DD-4 (Legal):       [X/10 items complete] [PASS / CLEAR / IN PROGRESS]

OPEN ITEMS REQUIRING RESOLUTION:
1. [Item] - Status: [Pending / In Progress] - Due: [Date] - Risk: [Low/Med/High]
2. [Item] - ...

FATAL FLAWS IDENTIFIED: [None / List]
MATERIAL RISKS IDENTIFIED: [None / List with mitigation plan]

RECOMMENDATION: [Proceed to Close / Extend DD Period / Renegotiate / PASS]
```

---

## 2. SITE VISIT PROTOCOL

The site visit is the most important single step in physical due diligence. A thorough site visit catches issues that desktop review and even professional reports miss. This protocol ensures consistency across all KaNeXT site visits.

### 2.1 Pre-Visit Preparation

Before arriving at the property:

1. Print or save the Property Profile from File 01 (all available data).
2. Print the parcel map from the county property appraiser showing boundaries, dimensions, and adjacent parcels.
3. Print the FEMA flood map panel for the property location.
4. Print the zoning map showing the property and surrounding parcels.
5. Review satellite imagery and note specific areas to inspect (potential wetlands, drainage paths, access points, neighboring uses).
6. Charge camera/phone. Bring measuring tape, notepad, flashlight, appropriate footwear.
7. If meeting the seller or broker, prepare a list of questions not answerable from public records.

### 2.2 On-Site Inspection Sequence

**Exterior (30-60 minutes for vacant land, 60-120 for existing structures):**

1. **Perimeter walk.** Walk (or drive, for large parcels) the entire property boundary. Confirm the boundary generally matches the survey or parcel map. Note any fencing, encroachments, or boundary disputes visible from the ground.

2. **Access points.** Identify all entry/exit points. Note road frontage, curb cuts, driveway conditions, sight lines for turning vehicles, and any access via private roads or easements.

3. **Topography.** Walk the interior of the site noting grade changes, low spots, drainage patterns, standing water, and any evidence of flooding (water lines, debris). On large parcels, note areas that would require significant grading for construction.

4. **Utilities.** Locate utility connections at the property boundary (water meter, sewer manhole, electric transformer, telecom pedestal). Note condition and approximate distance from the building envelope or intended building location.

5. **Vegetation and natural features.** Note tree coverage (large trees may require removal permits or design around), wetland indicators (cattails, standing water, hydric soil), and any water bodies (ponds, streams, drainage canals).

6. **Adjacent properties.** Note what is on each side. Identify any adjacent uses that could create conflict (industrial noise, nightlife, waste facility, highway noise) or opportunity (complementary commercial, existing institutional use).

7. **Structures (if present).** Inspect exterior walls, roof, foundation (where visible), windows, doors, parking area, signage. Note visible damage, deferred maintenance, age indicators.

**Interior (if structures exist, 60-180 minutes):**

8. **Walk every room.** Note condition of floors, walls, ceilings, doors, windows. Look for water damage (stains, bubbling paint, mold), structural issues (cracks, sagging floors, uneven walls), and pest evidence.

9. **Systems.** Locate and visually inspect the electrical panel (age, capacity, condition), HVAC equipment (age, type, condition), water heater, plumbing (visible pipes, water pressure at fixtures), and fire suppression system (if present).

10. **Roof access.** If safe to access (flat commercial roof with roof hatch), inspect the roof membrane, drainage, HVAC equipment on roof, and overall condition. Note ponding water.

11. **Below grade.** If basement, crawl space, or mechanical space exists, inspect for water intrusion, foundation condition, and utility routing.

### 2.3 Site Visit Documentation

**Photo requirements (minimum):**
- Each side of the property from the boundary looking in
- Each side looking out (what do you see from the property)
- Every access point
- Utility connection points
- Any notable topographic features (grade changes, water, wetlands)
- Every room interior (structures)
- All mechanical systems
- Roof (from above if accessible, from ground if not)
- Any visible damage, deferred maintenance, or condition issues
- Adjacent properties

**Video requirement:**
- One continuous exterior walkthrough (5-10 minutes)
- One continuous interior walkthrough (10-20 minutes for structures)
- Narrate observations during video

### 2.4 Site Visit Report

```
SITE VISIT REPORT: [Property Address]
Date: [Date]
Inspector: [Name]
Weather: [Conditions]
Duration: [Hours]

PROPERTY CONDITION ASSESSMENT: [1-5 scale]
5 = Excellent (move-in ready, no deferred maintenance)
4 = Good (minor cosmetic issues, systems functional)
3 = Fair (moderate deferred maintenance, some systems aging)
2 = Poor (significant deferred maintenance, systems need replacement)
1 = Critical (structural issues, uninhabitable, or demolition candidate)

EXTERIOR OBSERVATIONS:
- Access: [Description]
- Topography: [Description]
- Utilities: [Description]
- Vegetation/Natural: [Description]
- Adjacent Uses: [Description]
- Structural Condition (if applicable): [Description]

INTERIOR OBSERVATIONS (if applicable):
- Overall Condition: [Description]
- Systems: [Description]
- Notable Issues: [Description]

ITEMS NOT VISIBLE / NOT ACCESSIBLE:
[List anything that could not be inspected and why]

FINDINGS THAT IMPACT PROPERTY KR:
[List any new information that should update the evaluation]

PHOTOS: [Attached / Referenced by file name]
VIDEO: [Attached / Referenced by file name]
```

---

## 3. CLOSING PROCESS MANAGEMENT

Closing Process Management tracks every step from executed purchase contract to recorded deed. Missed steps or missed deadlines can kill deals or create post-closing liability.

### 3.1 Closing Timeline (Standard Acquisition)

| Day | Milestone | Responsible Party | Status |
|-----|-----------|------------------|--------|
| 0 | Purchase contract executed | Buyer + Seller | Complete / Pending |
| 1-3 | Earnest money deposited | Buyer | Complete / Pending |
| 1-7 | Due diligence Phase DD-1 (desktop) | KaNeXT team | Complete / Pending |
| 1-5 | Title search ordered | Title company | Complete / Pending |
| 1-5 | Phase I Environmental ordered | Environmental firm | Complete / Pending |
| 1-5 | Survey ordered (ALTA or boundary) | Surveyor | Complete / Pending |
| 1-5 | Appraisal ordered | Appraiser | Complete / Pending |
| 7-14 | Site visit completed | KaNeXT representative | Complete / Pending |
| 14-21 | Title commitment received and reviewed | Title company + counsel | Complete / Pending |
| 14-30 | Phase I Environmental report received | Environmental firm | Complete / Pending |
| 21-35 | Survey received and reviewed | Surveyor + counsel | Complete / Pending |
| 21-35 | Appraisal received and reviewed | Appraiser + team | Complete / Pending |
| 30-40 | All due diligence complete | KaNeXT team | Complete / Pending |
| 30-40 | Due diligence objections submitted (if any) | Counsel | Complete / Pending / N/A |
| 35-45 | Seller response to objections | Seller | Complete / Pending / N/A |
| 40-50 | Closing documents prepared | Title company + counsel | Complete / Pending |
| 45-55 | Final walkthrough / re-inspection | KaNeXT representative | Complete / Pending |
| 50-60 | Closing funds wired | KaNeXT | Complete / Pending |
| 50-60 | Closing (deed transfer, recording) | Title company | Complete / Pending |
| 60-65 | Title policy issued | Title company | Complete / Pending |
| 60-70 | Property insurance effective | Insurance broker | Complete / Pending |
| 60-70 | Property management transition (if applicable) | Operations team | Complete / Pending |

### 3.2 Closing Timeline (Philanthropic Transfer - FMU Model)

| Day | Milestone | Responsible Party | Status |
|-----|-----------|------------------|--------|
| 0 | IOA executed | KaNeXT + University | Complete / Pending |
| 1-30 | Philanthropic capital structuring | Counsel + accountant | Complete / Pending |
| 1-30 | Property appraisal for gift valuation | Licensed appraiser | Complete / Pending |
| 1-45 | Title search and clearance | Title company | Complete / Pending |
| 1-45 | Environmental assessment | Environmental firm | Complete / Pending |
| 30-60 | University board approval of deed transfer | University board | Complete / Pending |
| 30-60 | Leaseback agreement drafted and negotiated | Counsel | Complete / Pending |
| 45-75 | Philanthropic capital disbursed to University | KaNeXT | Complete / Pending |
| 45-75 | Deed transferred to Provider | University + Title company | Complete / Pending |
| 60-90 | Leaseback effective | Both parties | Complete / Pending |
| 60-90 | Title policy issued | Title company | Complete / Pending |
| 60-90 | Insurance transition | Insurance broker | Complete / Pending |

### 3.3 Closing Document Checklist

**Buyer (KaNeXT) must have before closing:**
- [ ] Signed purchase agreement or IOA
- [ ] Proof of funds or financing commitment
- [ ] Entity formation documents (LLC operating agreement, articles of organization)
- [ ] Resolution authorizing the purchase (if required by fund operating agreement)
- [ ] Insurance binder effective as of closing date
- [ ] Wire instructions confirmed with title company (call to verify, never rely on email alone)

**Must be received from seller before closing:**
- [ ] Clear title commitment (all objections resolved)
- [ ] Warranty deed or special warranty deed (executed, notarized)
- [ ] Seller's affidavit (no undisclosed liens, leases, or claims)
- [ ] Foreign Investment in Real Property Tax Act (FIRPTA) certification or withholding
- [ ] Tenant estoppel certificates (if tenants in place)
- [ ] Existing lease assignments (if tenants in place)
- [ ] Utility transfer authorizations
- [ ] Keys, access codes, gate remotes, building plans (if applicable)

**Must be completed at or after closing:**
- [ ] Deed recorded with county clerk
- [ ] Property tax account updated to new owner
- [ ] Utility accounts transferred
- [ ] Insurance policy effective
- [ ] Title policy issued
- [ ] Post-closing escrow items released (if any)
- [ ] Property entered into KaNeXT portfolio management system

### 3.4 Closing Tracker Output

```
CLOSING TRACKER: [Property Name]
Contract Date: [Date]
Closing Date (scheduled): [Date]
Days to Close: [N]

MILESTONE STATUS: [X/Y complete]
NEXT MILESTONE: [Item] - Due: [Date] - Responsible: [Party]

OPEN ISSUES:
1. [Issue] - Status: [Resolution path] - Risk to closing: [Low/Med/High]

AT RISK? [Yes / No]
[If yes: what is the risk and what is the mitigation plan]
```

---

## 4. APPRAISAL REVIEW PROTOCOL

Every appraisal must be reviewed before it informs acquisition decisions. Appraisals are opinions of value, not facts. They can contain errors, inappropriate comparables, or assumptions that do not reflect the property's intended use.

### 4.1 Appraisal Review Checklist

| Review Item | What to Check | Red Flag |
|------------|---------------|----------|
| Property identification | Correct address, parcel ID, legal description, acreage | Wrong parcel or acreage discrepancy |
| Highest and best use analysis | Does appraiser's conclusion match intended use? | Appraiser values as-is use when KaNeXT intends different use |
| Comparable sales selection | Are comps truly comparable (size, type, location, date)? | Comps more than 12 months old, more than 5 miles away, or materially different property type |
| Adjustments | Are adjustments reasonable and documented? | Single adjustment exceeding 25% of comp value, or net adjustment exceeding 15% |
| Income approach (if used) | Are rent assumptions, vacancy, and cap rate supported by market data? | Cap rate unsupported by market comps, vacancy assumption below market vacancy |
| Cost approach (if used) | Is replacement cost reasonable for the area? Is depreciation properly calculated? | Replacement cost per sqft inconsistent with local construction indices |
| Value conclusion | Is the final value consistent with the approaches used? Is reconciliation logical? | Value conclusion does not follow from the three approaches, or appraiser selects the highest approach without justification |
| Extraordinary assumptions | Are any extraordinary assumptions disclosed? Do they affect value? | Assumptions that the appraiser cannot verify (e.g., "assuming no environmental contamination") |
| Limiting conditions | Are limiting conditions standard or unusual? | Unusual limitations that reduce the report's reliability |

### 4.2 Appraisal Challenge Protocol

If the appraisal review identifies material issues:

1. **Document the specific concern** with reference to the appraisal page/section.
2. **Provide counter-evidence** (better comparable sales, alternative market data, updated information the appraiser may not have had).
3. **Request reconsideration** from the appraiser in writing with the supporting data.
4. **If reconsideration is denied and the concern is material (affecting value by 10%+):** order a second appraisal from a different firm. If two appraisals differ by more than 15%, use the lower value for acquisition budgeting.
5. **Never pressure an appraiser to hit a target value.** The appraisal is independent. KaNeXT can disagree with the conclusion and choose not to rely on it, but cannot direct the outcome.

### 4.3 Appraisal vs. Acquisition Price

| Scenario | Action |
|----------|--------|
| Appraisal >= contract price | Proceed. Property valued at or above purchase price. |
| Appraisal 5-10% below contract price | Assess. Is the premium justified by strategic value (SKR)? If SKR > 85, the premium may be justified. Document the rationale. |
| Appraisal 10-20% below contract price | Renegotiate. Request price reduction to appraised value. If seller refuses, the acquisition must be approved with explicit documentation of strategic justification for paying above appraised value. |
| Appraisal 20%+ below contract price | Strong renegotiation or PASS. Paying 20%+ above appraised value requires extraordinary strategic justification and CEO approval with documented rationale. |

---

## 5. POST-CLOSING INTEGRATION CHECKLIST

After closing, the property must be integrated into the KaNeXT portfolio management system and operational infrastructure.

### 5.1 Integration Steps (First 30 Days)

| Day | Action | Responsible |
|-----|--------|-------------|
| 0-1 | Record deed and confirm recording number | Title company |
| 0-3 | Add property to portfolio management system with all data from File 01 evaluation | Operations |
| 0-3 | Activate insurance coverage, confirm policy received | Insurance broker |
| 0-7 | Transfer utility accounts to KaNeXT or property manager | Operations |
| 0-7 | Change locks and access credentials (if structures exist) | Operations / Property manager |
| 0-14 | Engage property manager (if third-party management) | Operations |
| 0-14 | Establish property bank account for revenue collection (through KayPay where applicable) | Finance |
| 0-14 | Set up recurring expense payments (taxes, insurance, HOA if applicable) | Finance |
| 0-30 | Complete property condition assessment (if not done in DD) | Property manager |
| 0-30 | Establish maintenance schedule | Property manager |
| 0-30 | If income-producing: lease vacant units, onboard tenants, activate KayPay rent collection | Operations |
| 0-30 | If development planned: engage architect/engineer, begin design | Development team |

### 5.2 Integration Confirmation

```
POST-CLOSING INTEGRATION: [Property Name]
Closing Date: [Date]
Integration Status: [Complete / In Progress]

[X/12 items complete]

OUTSTANDING ITEMS:
1. [Item] - Due: [Date] - Status: [In Progress / Blocked]

PROPERTY FULLY INTEGRATED: [Yes / No]
[If No: expected completion date and blockers]
```

---

## GOVERNANCE RULES (Transaction Ops)

1. **No shortcuts.** Every mandatory due diligence item must be completed before closing. If the due diligence deadline is approaching and items are incomplete, extend the deadline. Do not close with open items.
2. **Document everything.** Every site visit, phone call, negotiation point, and decision is documented in the transaction file. If it is not in the file, it did not happen.
3. **Independent appraisal.** KaNeXT does not direct appraisal outcomes. The appraisal is an independent opinion. KaNeXT can challenge it with data but cannot direct it.
4. **Wire fraud prevention.** Closing funds are wired only after verbal confirmation of wire instructions with the title company at a known phone number. Never rely on email-only wire instructions.
5. **Counsel review.** All purchase agreements, deeds, leases, and closing documents are reviewed by real estate counsel before execution. No exceptions.
6. **Post-closing integration is not optional.** A property is not "acquired" until it is integrated into the portfolio management system, insured, and operational. Closing is the midpoint, not the endpoint.

---

## VERSION HISTORY
- v1.0: Initial build. Due Diligence Protocol (4 phases, 45+ checklist items, phase gates). Site Visit Protocol (pre-visit, on-site sequence, documentation requirements, report template). Closing Process Management (standard and philanthropic timelines, document checklist, tracker). Appraisal Review Protocol (9-item checklist, challenge process, price vs appraisal decision framework). Post-Closing Integration Checklist (12 items, 30-day timeline).
