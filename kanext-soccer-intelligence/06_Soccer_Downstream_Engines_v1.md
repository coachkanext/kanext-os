# SOCCER DOWNSTREAM ENGINES -- v1

---

# DEVELOPMENT INTELLIGENCE ENGINE

## 0. Purpose
Takes everything the system knows about a player and translates it into actionable intelligence for placement, development, and decision-making.

It answers five questions:
1. Where are you now? -- Truth summary across every level and system
2. Where should you be? -- Best-fit targets ranked by actual team impact
3. What are you worth there? -- Value at each target (scholarship, transfer fee, or wage)
4. What's the gap? -- Specific traits holding you back, with exact deltas needed
5. What's the path? -- Prioritized development roadmap with projected impact

This engine does NOT evaluate players. It reads governed truth and produces downstream recommendations.

## 1. Consumers
- The player: "Where should I transfer? What should I work on?"
- The player's current coach: "How do I develop this player? What's the ceiling?"
- Recruiting coordinators: "Does this player fit our system? What's the value?"
- Transfer portal decision-makers (college): "Which portal players improve our Team KR most?"
- Pro scouts: "Where does this player project professionally?"

## 2. MUST PULL (Inputs)

A) Player Identity + Record (from Player Profile)
B) Player KR Outputs (from evaluation pipeline)
C) Archetype + Badges + Impact Modifiers (from upstream)
D) Full System Fit Profile -- for ALL 12 offensive + 10 defensive systems
E) Trait Scores (Raw) -- all 54 traits with current values
F) Level Interpretation -- KR tier label at EVERY competitive level
G) Team/League Universe -- all teams and their system identities
H) Team KR Diagnostics for every potential target
I) Scholarship / Financial Context (college: scholarship allocation; pro: transfer fee + wages)

## 3. Outputs

### OUTPUT A: Player Truth Summary -- "Where Are You Now?"

A1) KR Identity Card
- Overall Player KR (with confidence%)
- AKR / DKR / TKR / IQKR breakdown
- Base KR (system-neutral) vs System KR (current context)
- Archetype: primary + secondary
- Badges, Impact Modifiers, System Risks
- Data tier, evaluation mode

A2) Level Tier Map
For every competitive level, show what this player's KR means:

| Level | KR Tier Label | Interpretation |
|---|---|---|
| D1 High-Major | e.g., "Rotation Player" | Functional contributor, not starter |
| D1 Mid-Major | e.g., "All-Conference" | Key starter on tournament team |
| NAIA | e.g., "Franchise Anchor" | Best player at this level |
| MLS | e.g., "Depth / Rotation" | Bench contributor |
| Championship | e.g., "Lower-Table Starter" | Starting XI for lower half |
| Premier League | e.g., "Below PL Viability" | Not at this level |

A3) System Fit Heat Map
Player's fit score across ALL 22 systems:
- Top 3 best-fit offensive + defensive systems
- Bottom 3 worst-fit systems
- "Sweet spot" systems where player fills A-tier demands

### OUTPUT B: Placement Targeting -- "Where Should You Be?"

B1) Best-Fit Programs/Clubs (top 20-50, filterable by level/conference/region/league)
Per target:
- Team name, level, conference/league
- Current Team KR + tier label
- Offensive + Defensive system
- Player's system fit% at that program
- Demand tier (A/B/C/No-match)
- Demand Match: does this player fill an uncovered demand?
- Projected Team KR Impact: if this player joins, how does Team KR change?
- "Why" tags (top 2-3 reasons)
- "Risk" tags (mismatches or concerns)

B2) Best-Fit Pro Leagues/Teams (if applicable)
Same structure for professional targets.

### OUTPUT C: Player Value at Target -- "What Are You Worth?"

College:
- Recommended scholarship % (based on KR share x available equivalents)
- Priority tier: Core / Rotation / Depth / Development

Pro:
- Estimated transfer fee range (from Salary Framework by KR tier x age x contract)
- Estimated wage range
- Market comparison (similar KR + archetype + age players and their fees/wages)

### OUTPUT D: Gap Analysis -- "What's Holding You Back?"

D1) Trait Gap Table
For each unmet archetype gate or next-tier badge threshold:
- Trait name, current score, target score, gap
- KR impact if gap closed

D2) Component KR Gaps
- Which component (AKR/DKR/TKR/IQKR) is the weakest relative to position expectations?
- What traits within that component have the most room for improvement?
- Priority ranking: which gap closure produces the largest KR lift?

### OUTPUT E: Development Roadmap -- "What's the Path?"

E1) Priority Development Targets (max 3 per period)
Each target:
- Trait name
- Current -> Target score
- Training methodology (position-specific drills, match exposure, physical program)
- Timeline (months)
- Expected KR impact

E2) Soccer-Specific Development Windows

| Development Area | Peak Development Age | Notes |
|---|---|---|
| Technical (first touch, passing, dribbling) | 14-20 | Must be established early. Hard to develop after 22. |
| Tactical (positioning, pressing triggers, game reading) | 18-24 | Develops with match experience and coaching quality. |
| Physical (speed, strength, stamina) | 20-27 | Peaks mid-to-late 20s. Speed peaks earliest (~24). |
| Set piece (delivery, routine execution) | 18-26 | Trainable at any age but peak learning mid-career. |
| Mental (decision speed, composure, leadership) | 22-30 | Develops with experience. Often peaks late 20s. |

E3) Position-Specific Development Plans
- ST: finishing mechanics, movement patterns, pressing triggers, aerial development
- W: 1v1 beating, end product (crossing OR cutting inside), defensive tracking
- CM: passing range, pressing discipline, positional awareness, stamina base
- CB: aerial dominance, distribution under pressure, defensive line management
- FB: crossing quality, recovery pace, overlapping/underlapping timing
- GK: shot-stopping, distribution, sweeping, set piece command

---

# PRO TRANSITION INTELLIGENCE ENGINE

## 0. Purpose
Translates college soccer evaluation into professional projection. Answers: "What is this player as a pro today, and what could they become?"

## 1. Inputs (MUST PULL)

A) Player identity, career history, international background
B) College Player KR outputs
C) Full trait scores (54 traits)
D) Archetype + badges + impact modifiers + system risks (college)
E) Full system fit profile (all 22 systems)
F) Physical profile (height, weight, age, preferred foot)
G) Pro Position Trait Weighting (10 positions, pro level)
H) Pro system risks + overrides
I) Pro KR Legend, Pro KLVN Lambdas

## 2. Translation Process

### Step 1: Reweight through Pro OPF
Take college trait scores, apply pro positional weights (different from college -- see File 02 College Addendum). Tools drops from 24-30% (college) to 18-24% (pro). Tactical IQ rises.

### Step 2: Apply Pro Badge Gates
Pro gates are higher than college (Bronze >= 90, Silver >= 94, Gold >= 97 vs college Bronze >= 88, Silver >= 92, Gold >= 96). Some college badges may be lost.

### Step 3: Apply Pro System Risks + Overrides
Pro system risks are more severe. Pro overrides may differ from college.

### Step 4: Anchor Against Pro Legend
Map the resulting Pro KR against the Pro Player KR Legend.

## 3. Outputs

### OUTPUT G: Pro Projection KR (Entry)

G1) Pro KR Identity Card
- Pro Projection KR (Entry): [value] ([range])
- Confidence: inherently lower than college confidence
- Pro AKR / DKR / TKR / IQKR with pro weights
- College KR -> Pro KR delta and explanation
- Pro archetype (may differ from college)
- Pro badges, system risks, overrides

G2) Translation Breakdown
Show what changed from College to Pro and why:
- OPF shift
- Badge gate changes
- System risk changes
- Override changes

G3) Pro KR Legend Interpretation
Map Pro Projection KR to Pro Player KR Legend tiers.

### OUTPUT H: Development Trajectory

H1) Year 1 Projection
- Expected trait changes for this archetype
- Role expectation (starter / rotation / bench / loan)
- Physical maturation projection (age-dependent)

H2) Year 3 Projection (Scenario Branch)
Scenario A -- Key Variable Develops:
- Projected KR range, resolved system risks, unlocked badges, archetype evolution

Scenario B -- Key Variable Does Not Develop:
- Projected KR range, persistent risks, archetype stabilization

Both scenarios always shown. System does not pick a winner.

H3) Peak Projection (Directional)
- Ceiling KR range
- Timeline to peak (typically age 26-29 for outfield, 28-32 for GK)
- Ceiling confidence (always lower than entry confidence)

H4) Floor Projection
- Floor KR range (limited development outcome)

Rules:
- No trait improvement exceeds +15 points over 3 years
- No trait improvement exceeds +8 points in a single year
- Both upside and downside always shown
- All projections labeled with explicit uncertainty

### OUTPUT I: Key Development Variable
The single highest-leverage skill improvement.
- Trait name, current score, target score
- KR impact if achieved
- System risk resolved, badge unlocked, archetype shifted
- FT% / penalty conversion / passing accuracy as "truth serum" signals for development likelihood

### OUTPUT J: Pro Pathway Intelligence

J1) MLS Pathway
- MLS SuperDraft projection (if applicable -- draft is declining in relevance)
- MLS Homegrown / Generation adidas eligibility
- MLS NEXT Pro (reserve league) loan pathway
- USL Championship loan pathway

J2) International Pathway
- European academy/B-team opportunities based on nationality + passport
- Scandinavian / Eredivisie / Liga Portugal as development leagues
- South American pathway for dual-national players

J3) Lower-Division Pro
- USL Championship, USL League One, MLS NEXT Pro
- National Independent Soccer Association
- International lower-division options

---

# TRANSFER MARKET INTELLIGENCE ENGINE

## 0. Purpose
Provides transfer fee valuation, sell/hold/buy recommendations, replacement identification, and market timing intelligence.

## 1. Player Valuation Model

Value = f(KR, Age, Contract_Remaining, Market_Conditions, Nationality, Sell_Pressure)

### KR-to-Base-Value Mapping
Uses Salary Framework (Pro) as the baseline, adjusted by:
- Age modifier (from Age-Adjusted Transfer Fee Modifiers in Salary Framework)
- Contract modifier (from Contract Length Modifier in Salary Framework)
- Market heat: if 3+ clubs interested, +15-25% premium
- Sell pressure: if club MUST sell (financial, player request), -15-30% discount

### 2. Sell / Hold / Buy Recommendations

**Sell Signal:**
- Player KR is declining (Regression Override triggered or trending)
- Player's contract is entering final 18 months and no renewal expected
- Player's market value exceeds their Team KR contribution value
- Replacement at similar or higher KR available at lower cost

**Hold Signal:**
- Player's KR is stable or improving
- Contract length provides security (2+ years remaining)
- No replacement of similar quality available at reasonable cost
- Player fills an A-tier system demand that is hard to replace

**Buy Signal:**
- Target player fills an uncovered A/B demand in the team's system
- Target player's KR would improve Team KR by >= 1.0 point
- Target player's value is at or below market rate (good deal)
- Target player's age + contract length provide multi-year value

### 3. Replacement Player Identification
Given a player departing (sold or released):
1. Identify archetype + system demand tier being vacated
2. Search player database for matches: same archetype, KR >= departing player's KR - 3, age <= 28, cost <= budget
3. Rank by: (System Fit% x 0.40) + (KR x 0.30) + (Age Value x 0.15) + (Cost Efficiency x 0.15)
4. Output top 10 replacement candidates with full comparison

---

# LOAN SYSTEM ENGINE

## 0. Purpose
Optimizes loan destinations for player development. Matches player's development needs with receiving club's system, minutes availability, and competitive level.

## 1. Loan Destination Optimization

For each potential loan destination, compute:

**Minutes Probability Score (40% weight):**
- Will the player start? (KR vs current incumbent at their position)
- Will the player get 1500+ minutes? (rotation depth at their position)
- Is the manager known for playing young loanees?

**System Fit Score (30% weight):**
- Does the receiving club's system match the player's strengths?
- Does the system develop the Key Development Variable?
- Is the system complexity appropriate for the player's current level?

**Level Appropriateness Score (20% weight):**
- Is the league level right? (Player should be competitive but challenged)
- Rule of thumb: loan to a level where player's KR projects to 82-88 range (solid starter, not dominant, not overwhelmed)

**Development Environment Score (10% weight):**
- Quality of coaching staff
- Training facilities
- League physicality / tactical sophistication match

### 2. Loan Recall Triggers
- Player's KR drops 5+ points mid-loan (something is wrong)
- Player is not getting minutes (<500 minutes by mid-season)
- Player suffers significant injury at loan club
- Parent club has injury crisis at player's position

### 3. Loan-to-Buy Conversion Analysis
- If loan includes buy option: is the option price fair relative to projected KR at option exercise date?
- If no option: should parent club offer one? At what price?
- Compute: Expected KR at season end x Age value modifier = Fair option price from Salary Framework

---

# YOUTH ACADEMY PIPELINE

## 0. Purpose
Projects academy player development, assesses integration readiness, and plans pathways from U18 -> U21 -> first team.

## 1. Academy Player Projection

### Age-Relative KR Assessment
Standard KR evaluation but with age-adjustment context:
- U16-U17: KR evaluated against youth legend (lambda 0.450-0.600). Production benchmarks adjusted for age.
- U18-U19: KR evaluated against youth top academy legend (lambda 0.600-0.650). Approaching first-team pathway decisions.
- U20-U21: KR evaluated against reserve/B-team legend (lambda 0.650) or loan league legend. Should be competing at near-professional level.

### Development Trajectory Projection
Based on current KR + age + archetype + development window:
- Project KR at age 21 (first-team readiness assessment)
- Project KR at age 24 (peak development outcome)
- Identify Key Development Variable (same as pro projection but age-adjusted)

### 2. Integration Readiness Assessment

**Ready for First Team (integrate):**
- Current KR would be in top-18 of first-team squad
- System fit >= 70% with first-team tactical setup
- Physical readiness (stamina, strength at professional level)
- Mental readiness (can handle pressure of first-team competition)

**Ready for Loan:**
- Current KR projects to starter level at an appropriate loan destination
- Key Development Variable is best developed through competitive match experience, not training
- Age 18-21 (prime loan window)

**Ready for Cup / Rotation:**
- Current KR is below first-team starter level but above squad depth
- Can contribute in domestic cup matches and low-stakes league matches
- Age 17-20

**Not Ready (continue development):**
- Current KR is below professional threshold
- Key traits still developing (technical or physical)
- Needs more time in academy environment
- Age 16-18 typically

### 3. Pathway Planning

For each academy player, output:
- Current pathway: Academy / Reserve / Loan / Cup rotation / First team
- Recommended pathway for next season
- Timeline to first-team integration (estimated months/years)
- Key Development Variables with target scores
- Recommended loan destination (if applicable, from Loan System Engine)

### 4. Sell / Release Decision
- If projected peak KR < 78 (below professional viability): recommend release at age 19-20
- If projected peak KR 78-84 (professional but not first-team quality): recommend sell with sell-on clause or buy-back option
- If projected peak KR 85+ (first-team potential): retain and develop

---

# COACHING IMPACT MODIFIER

## 0. Purpose
Quantifies how manager quality and tactical sophistication affect player development and team performance.

## 1. Manager Impact Factors

### Development Impact
- Manager track record with young players (% of academy players integrated, loan success rate)
- Tactical system complexity (more complex = more development ceiling but slower integration)
- Training methodology reputation
- Historical KR improvement of players under their management

### Performance Impact
- Manager's historical win rate relative to squad KR (overperformance vs underperformance)
- System fit% achievement (does the manager build squads that fit their system?)
- Seasonal trajectory (does the team improve or decline over the season?)

### 2. Manager Sacking Probability
Factors:
- Current league position vs expectation (based on Team KR)
- Results trajectory (last 5 matches)
- Board patience (club history of managerial changes)
- Contract length remaining
- Public/media pressure

Impact on squad value:
- Managerial instability depresses transfer value of players (uncertainty premium)
- System change risk: new manager may not value the same archetypes
- Development disruption: young players suffer most from system changes

### 3. CIM (Coaching Impact Modifier) Score
CIM is a single modifier applied to Team KR diagnostics:
- CIM > 0: Manager adds value beyond squad quality (overperformer)
- CIM = 0: Manager performs at expected level for squad quality
- CIM < 0: Manager underperforms relative to squad quality

CIM is estimated from: actual results vs expected results (from Team KR), controlling for fixture difficulty, injuries, and squad rotation.

CIM does NOT modify Player KR. It modifies Team KR interpretation and development projections only.

---

## GOVERNANCE NOTE
All downstream engines read governed truth from upstream. They do not produce or modify Player KR, Team KR, archetypes, system identity, or any upstream output. All outputs are deterministic: same inputs -> same outputs. Changes to engine logic require documentation, versioning, and approval.
