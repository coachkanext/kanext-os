# WOMEN'S SOCCER DOWNSTREAM ENGINES -- v1

---

# DEVELOPMENT INTELLIGENCE ENGINE

## 0. Purpose
Takes everything the system knows about a player and translates it into actionable intelligence for placement, development, and decision-making.

Architecture identical to men's soccer Development Intelligence Engine. Same 5 questions, same output structure. Women's soccer-specific content in placement targeting, value calculations, and development windows.

## 1. Consumers
- The player: "Where should I transfer? What should I work on?"
- The player's current coach: "How do I develop this player? What's the ceiling?"
- Recruiting coordinators: "Does this player fit our system? What's the value?"
- Transfer portal decision-makers (college): "Which portal players improve our Team KR most?"
- Pro scouts: "Where does this player project professionally?"
- Youth national team staff: "Should this player be in the pool?"

## 2. MUST PULL (Inputs)

(Identical to men's soccer. See men's File 06.)
Women's addition: Youth National Team history, ACL history, pregnancy/return status.

## 3. Outputs

### OUTPUT A: Player Truth Summary -- "Where Are You Now?"
(Identical structure to men's. KR Identity Card, Level Tier Map, System Fit Heat Map.)

### OUTPUT B: Placement Targeting -- "Where Should You Be?"
(Identical structure. Best-fit programs/clubs ranked by system fit, demand match, projected Team KR impact.)

Women's-specific placement notes:
- College women's soccer has 320+ D1 programs. Placement universe is larger than men's.
- NWSL has 16 teams with no draft. Entry is through free agency, international signing, or short-term contract.
- European leagues (WSL, Liga F, D1F) are increasingly viable destinations for top American college players.
- USL W League (pre-professional) serves as a summer development league for college players.

### OUTPUT C: Player Value at Target -- "What Are You Worth?"

College:
- Recommended scholarship % (based on KR share x available equivalents under new 2025-26 rules)
- For opt-in schools with 28 scholarship slots: value calculation spreads across larger pool
- Priority tier: Core / Rotation / Depth / Development

Pro:
- Estimated salary range (from WSoc Salary Framework by KR tier x age x contract)
- NWSL salary cap implications (what % of the cap does this player consume?)
- Transfer fee range (still developing -- see Salary Framework)
- Market comparison (similar KR + archetype + age players and their contracts)

### OUTPUT D: Gap Analysis -- "What's Holding You Back?"
(Identical structure to men's. Trait Gap Table, Component KR Gaps.)

### OUTPUT E: Development Roadmap -- "What's the Path?"

E1) Priority Development Targets (max 3 per period)
(Same structure as men's.)

E2) Women's Soccer-Specific Development Windows

| Development Area | Peak Development Age | Notes |
|---|---|---|
| Technical (first touch, passing, dribbling) | 13-19 | Must be established early. US development system (ECNL/GA) targets this window. |
| Tactical (positioning, pressing triggers, game reading) | 17-23 | Develops with match experience and coaching quality. College years are critical. |
| Physical (speed, strength, stamina) | 19-26 | Peaks mid-20s. Speed peaks earliest (~22-24). Strength trainable longer. |
| Set piece (delivery, routine execution) | 17-25 | Trainable at any age. |
| Mental (decision speed, composure, leadership) | 21-29 | Develops with experience. Often peaks late 20s. |

Note: ACL injury risk is highest in the 15-25 age range for women's soccer. Development plans must account for ACL prevention protocols (neuromuscular training, load management) as a mandatory component.

E3) Position-Specific Development Plans
(Same structure as men's. ST, W, CM, CB, FB, GK development prescriptions.)

Women's addition: ACL prevention protocol integrated into all physical development plans. Mandatory neuromuscular warm-up, landing mechanics, deceleration training.

---

# PRO TRANSITION INTELLIGENCE ENGINE

## 0. Purpose
Translates college women's soccer evaluation into professional projection. Answers: "What is this player as a pro today, and what could they become?"

Women's soccer-specific note: The college-to-pro pathway changed dramatically in 2025. The NWSL Draft was eliminated. Players now enter the NWSL through free agency, direct signing, or international pathways. Top college players may also bypass NWSL entirely and sign with European clubs (WSL, Liga F, D1F).

## 1. Inputs (MUST PULL)

(Same as men's plus:)
- Youth National Team history (U-17, U-20, U-23, senior caps)
- ECNL/GA academy history (pre-college development pathway)
- International passport/eligibility (for European league placement)

## 2. Translation Process

### Step 1: Reweight through Pro OPF
Take college trait scores, apply pro positional weights (different from college). Tools drops from college to pro levels. Tactical IQ rises.

### Step 2: Apply Pro Badge Gates
Pro gates are higher than college.

### Step 3: Apply Pro System Risks + Overrides

### Step 4: Anchor Against Pro Legend
Map the resulting Pro KR against the WSoc Pro Player KR Legend.

## 3. Outputs

### OUTPUT F: Pro Destination Intelligence

F1) NWSL Pathway
- Pro Projection KR (Entry): [value] ([range])
- Best-fit NWSL teams by system fit + roster need
- Salary projection from NWSL Salary Framework
- Salary cap implications for target teams
- Free agency timing (when to sign, which window)

F2) European Pathway
- WSL viability assessment (is KR sufficient for WSL? Which clubs?)
- Liga F / D1F / Frauen-BL options
- Work permit / visa considerations
- Salary comparison: NWSL vs European options
- Development benefit: which league environment best develops the Key Development Variable?

F3) Recommendation: NWSL vs Europe
Based on:
- KR tier (players KR 92+ may benefit more from WSL/Liga F competition)
- Development needs (tactical development may accelerate in European systems)
- Financial (NWSL salary cap vs European wages -- currently converging)
- Personal (location, language, family -- noted but not scored)

### OUTPUT G: Pro Projection KR

G1) Pro KR Identity Card
- Pro Projection KR (Entry): day-one pro reality
- Pro Projection KR (Peak): development ceiling
- Peak KR window: age at which peak is projected
- Confidence: inherently lower than college confidence
- Pro AKR / DKR / TKR / IQKR with pro weights

G2) Translation Breakdown
Show what changed from College to Pro and why.

G3) Pro KR Legend Interpretation
Map Pro Projection KR to Pro Player KR Legend tiers.

### OUTPUT H: Development Trajectory

H1) Year 1 Projection
- Expected minutes (starter / rotation / depth)
- Key Development Variable (the single trait with most impact on KR growth)
- Projected Year 1 KR: Entry KR +/- adjustment based on environment quality

H2) Year 3 Projection (Peak Window)
- Expected role
- Projected KR at peak
- Key Development Variables by year
- Risk factors (injury history, system fit, competition for minutes)

H3) Career Arc
- Entry -> Peak -> Decline projection
- Peak window: typical 25-31 for women's pro soccer (varies by position)
- Longevity factors: injury history, position (GKs peak latest, wingers decline earliest)
- International career impact (World Cup, Olympics cycle)

---

# YOUTH NATIONAL TEAM PIPELINE

## 0. Purpose
Projects youth national team trajectory, assesses readiness for senior call-up, and plans development pathway through the international system.

This engine is more prominent in women's soccer than men's because:
- The YNT pathway directly feeds NWSL/pro signing (top YNT players sign pro contracts out of college or before college)
- U-20 World Cup and U-17 World Cup participation is a major evaluation signal
- Senior national team integration happens earlier in careers (many USWNT players debut at 18-20)
- Olympic qualifying creates a U-23 pathway that doesn't exist in men's soccer in the same way

## 1. YNT Pool Assessment

For each player evaluated:
- Current KR vs age-adjusted expectations for YNT pool
- Position need at each YNT age group
- System fit with national team tactical setup
- International experience level (camps attended, caps earned, tournament minutes)

### YNT KR Thresholds (Approximate)

| Age Group | Minimum KR for Pool Consideration | Competitive KR for Starter | Notes |
|---|---|---|---|
| U-17 | 72+ (with age adjustment) | 78+ | Technical ceiling matters more than current production. |
| U-20 | 78+ | 84+ | Production at college/early pro level matters. |
| U-23 (Olympic) | 84+ | 88+ | Must be competitive at pro level. |
| Senior NT | 88+ | 92+ | Must be a difference-maker at the highest pro level. |

### YNT-to-Pro Pipeline Signals
- Player selected for U-20 World Cup at age 18-19: strong signal for pro readiness (KR typically 82+)
- Player starting for senior NT while in college: exceptional signal (KR typically 90+, rare)
- Player called to senior camp but not capped: development signal (KR 86-90 range)

## 2. Senior National Team Projection

For established pro players:
- Current KR vs senior NT starter threshold (92+ for top-15 FIFA nations)
- Position competition map (who currently holds the position, what KR, what age)
- Tournament cycle timing (next World Cup, Olympics, continental championship)
- Projected KR at next major tournament vs competition

## 3. Development Pathway Recommendations

| Current Level | Recommendation | Rationale |
|---|---|---|
| Elite college + U-20 NT | Sign pro contract immediately | Development accelerates in pro environment. |
| Strong college + U-20 camp invitee | Complete junior/senior year, sign pro | More development time needed before pro transition. |
| College starter + no YNT | Focus on college production | Build the resume. YNT invitation follows production. |
| YNT pool + injured | Recovery + managed return | Protect long-term development. No rush. |

---

# COACHING IMPACT MODIFIER

## 0. Purpose
Quantifies how manager quality and tactical sophistication affect player development and team performance.

(Identical structure to men's soccer CIM. See men's File 06.)

### Women's Soccer-Specific CIM Factors

#### Development Impact
- Manager track record with young players (% of college-to-pro transitions, YNT development success)
- Tactical system complexity (more complex = more development ceiling but slower integration)
- ACL prevention protocol quality (managers who invest in injury prevention protect player development)
- Historical KR improvement of players under their management

#### Performance Impact
- Manager's historical win rate relative to squad KR
- System fit% achievement
- Seasonal trajectory

#### Managerial Instability (NWSL-Specific)
- NWSL has significant coaching turnover (9 of 16 coaches hired within last year entering 2026 season)
- New coach = system change risk = development disruption
- CIM penalizes unstable coaching environments

### CIM Score
- CIM > 0: Manager adds value beyond squad quality
- CIM = 0: Manager performs at expected level
- CIM < 0: Manager underperforms

CIM does NOT modify Player KR. It modifies Team KR interpretation and development projections only.

---

# TRANSFER MARKET INTELLIGENCE ENGINE

## 0. Purpose
Provides transfer fee valuation, sell/hold/buy recommendations, replacement identification, and market timing intelligence.

(Identical structure to men's soccer. See men's File 06.)

Women's Soccer-Specific Adaptations:

### Transfer Market Context (2025-26)
- Women's soccer transfer market is in exponential growth phase
- Record fee as of 2025: ~$1.5M (Ovalle to Orlando)
- Most NWSL player movement is through free agency, not transfers
- WSL and Liga F are emerging as destinations that will pay transfer fees
- NWSL-to-Europe pipeline growing (Girma, Thompson to Chelsea)
- No salary arbitrage exists in traditional sense -- NWSL salary cap constrains, European wages growing

### Buy/Sell/Hold Signals
(Same logic as men's, adapted for women's market realities.)

Buy Signal additions:
- Free agency window timing (NWSL contracts expire Dec 31; negotiations begin Jul 1)
- HIP rule availability (does the team have HIP room for a star signing?)
- International signing window alignment (NWSL + FIFA windows)

### Replacement Identification
(Same algorithm as men's. Archetype match + KR match + system fit + cost efficiency.)

---

# LOAN SYSTEM ENGINE

## 0. Purpose
Optimizes loan destinations for player development.

Women's Soccer Note: Intra-league loans were introduced in NWSL for the first time in 2026. This is a new mechanism that mirrors standard global practice. Inter-league loans (NWSL to/from European clubs) also exist under standard FIFA loan regulations.

### NWSL Loan Rules (2026)
- Player consent required
- Receiving team must pay at least minimum salary on prorated basis
- Player cannot be traded, transferred, or re-loaned during loan
- Loaning team receives salary cap relief up to amount covered by receiving team
- FIFA duration requirements apply

(Loan destination optimization: same algorithm as men's. Minutes probability, system fit, level appropriateness, development environment.)

---

## GOVERNANCE NOTE
All downstream engines read governed truth from upstream. They do not produce or modify Player KR, Team KR, archetypes, system identity, or any upstream output. All outputs are deterministic. Changes require documentation, versioning, and approval.
