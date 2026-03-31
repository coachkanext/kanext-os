# WBB DOWNSTREAM ENGINES
## v1.0 - Women's Basketball Intelligence

---

# DEVELOPMENT INTELLIGENCE ENGINE

## 0. Purpose
The Development Intelligence Engine takes everything the system knows about a women's basketball player and translates it into actionable intelligence for placement, development, and decision-making. Same structure and purpose as men's basketball Development Intelligence Engine.

It answers five questions for any evaluated player:
1. Where are you now? - Truth summary across every level and system
2. Where should you be? - Best-fit targets ranked by actual team impact
3. What are you worth there? - Value at each target (PTV, scholarship/NIL implication)
4. What's the gap? - Specific traits holding you back, with exact deltas needed
5. What's the path? - Prioritized development roadmap with projected impact

This engine does NOT evaluate players. It does NOT modify Player KR, Team KR, archetypes, system identity, or any upstream output.

## 1. Consumers
- The player - "Where should I transfer? What should I work on?"
- The player's current coach - "How do I develop this player?"
- Recruiting coordinators - "Does this player fit our system?"
- Transfer portal decision-makers - "Which portal players improve our Team KR?"
- High school / prep / JUCO advisors - "What level should she play at?"
- Pro scouts - "Where does this player project at the professional level?"
- NIL collectives - "Is this player worth the investment?"

## 2. MUST PULL (Inputs)
Same input structure as men's Development Intelligence Engine:
A) Player Identity + Record
B) Player KR Outputs (Truth)
C) Archetype + Badges + Impact Modifiers
D) Full System Fit Profile (all 22 systems)
E) Trait Scores (Raw)
F) Level Interpretation (all 14 college levels + professional)
G) Team / League Universe
H) Team System Identity
I) Team KR Diagnostics

## 3. Output 1: TRUTH SUMMARY
Multi-level interpretation of the player's KR. Shows what the player IS at every relevant level using the Level Tier Map (women's legends).

Example output:
"Player KR: 87. At D1 HM: Trusted Rotation / High-Minute Role Player. At D1 MM: Starter / Key Rotation. At D1 LM: High-Impact Starter. At D2: High-Impact Starter / Core Winner. At NAIA: Conference Star."

## 4. Output 2: PLACEMENT TARGETING
Rank the best-fit programs for this player based on:
- System Fit% (how well her archetype fits each program's system)
- Team KR Impact (how much her addition raises Team KR)
- Competitive Level Match (is she a role player or a star at this level?)
- Scholarship/Financial Fit (does the program have scholarship capacity?)
- Geographic and cultural fit (if data available)

Women's-specific placement considerations:
- Transfer portal volume is extremely high. More players in the portal means more options but also more competition for roster spots.
- International opportunities: some players may be better served playing overseas before or instead of transferring up domestically.
- Graduate program availability: many women's basketball transfers use graduate eligibility, which ties the basketball decision to academic program availability.
- NIL opportunities vary significantly by school and market. Top programs in major markets offer NIL packages that can influence placement decisions.

## 5. Output 3: PLAYER VALUE (PTV)
Player Transfer Value estimates the financial value a player deserves based on KR, system fit, and replacement cost. Same framework as men's.

Women's basketball PTV considerations:
- Scholarship value is the same ($0-full at D1)
- NIL value is growing rapidly but remains lower on average than men's basketball
- International signing opportunities provide an alternative value floor for elite players
- Housing, meal plans, and academic support benefits are standardized across programs

## 6. Output 4: GAP ANALYSIS
Identifies the specific trait improvements that would produce the largest KR lift. Structured by trait cluster.

Example:
"Current OKR: 82. If 3PT Spot-Up improves from 72 to 80 (+8 points), OKR projects to 86 and Overall KR rises from 87 to 89.5. This single-cluster improvement would shift her from 'Rotation' to 'Starter' at D1 HM."

## 7. Output 5: DEVELOPMENT ROADMAP
Prioritized development plan with projected timeline and impact.

Structure:
- Priority 1: Highest-impact trait improvement (specific drills, measurable goals)
- Priority 2: Second-highest impact
- Priority 3: Third-highest impact
- Timeline: off-season, pre-season, in-season phases
- Projected KR impact at each milestone

Development constraints (same as men's):
- Max +8 KR per cluster per year
- Max +15 KR total over 3 years
- Physical tools (height, wingspan) are fixed. Speed, vertical, strength can improve within bounds.

## 8. Output 6: COMPETITIVE LANDSCAPE
Shows where the player ranks among comparable players at her position and level. Identifies who she competes with for roster spots, playing time, and scholarships.

---

# PRO TRANSITION INTELLIGENCE ENGINE

## 0. Purpose
Translates a women's college basketball evaluation into professional projection. Accounts for the unique dual-path structure of women's professional basketball: WNBA and overseas.

## 1. DUAL PATH PROJECTION (MANDATORY)

Every pro transition evaluation MUST project BOTH paths:

### Path A: WNBA
- Draft projection (round, pick range)
- Entry KR (Day 1 WNBA reality)
- 3-Year Projection (Scenario A + B)
- Peak Ceiling KR
- Best team fit (using WNBA Team Registry)
- WNBA salary projection (new CBA framework)
- EPIC provision impact for young players

### Path B: Overseas
- Best league fit (by playing style and archetype)
- Projected overseas salary range
- Role projection (starter, import player, domestic-level)
- Career path recommendation (overseas first then WNBA? WNBA primary with overseas offseason? Overseas-only?)

### Path C: Combined (WNBA + Overseas)
- Total annual earning potential
- Optimal schedule (WNBA season May-October, overseas November-April)
- Physical load and rest considerations
- Long-term career earnings projection

## 2. Inputs
Same as men's Pro Transition Engine:
- Completed college evaluation (KR, component KRs, archetype, badges, system fit)
- Pro Player KR Legend (women's)
- Pro Position Trait Weighting (women's OPF)
- WNBA Team Registry
- Pro KLVN Lambdas (women's)
- Pro Salary Framework (women's)

## 3. Process

### Step 1: Component KR Adjustment
Take the SAME component KRs from the college eval (OKR, DKR, TKR, IQKR). Apply pro-level adjustments:
- OKR: slight dock for WNBA competition increase (-2 to -5 points depending on current level)
- DKR: slight dock for pro defensive intensity (-1 to -3 points)
- TKR: no change (physical tools are physical tools)
- IQKR: slight bump for players with high processing speed and role discipline (+1 to +3 for high-IQ players)

Women's-specific adjustment: The OKR dock is slightly smaller than men's (WNBA talent pool is more concentrated, but the top-end talent gap between college and WNBA is smaller than between college and NBA).

### Step 2: Pro OPF Reweighting
Apply women's PRO OPF weights (from File 02) to produce Pro Entry KR.

### Step 3: Entry KR Determination
Pro Entry KR = reweighted component KRs with pro adjustments. This represents Day 1 professional reality.

Entry KR ranges for WNBA draft picks:
- #1-3 picks: Entry KR typically 82-87
- #4-12 picks: Entry KR typically 79-85
- #13-24 picks (second round): Entry KR typically 76-82
- #25-36 picks (third round): Entry KR typically 73-79
- Undrafted: Entry KR typically 70-77

Note: WNBA Entry KRs are generally lower than NBA Entry KRs for equivalent draft positions because the WNBA is a smaller league with higher per-player competition density.

### Step 4: Development Projection
Same development rules as men's:
- Max +8 KR per cluster per year
- Max +15 KR total over 3 years
- 3-Year Projection: Scenario A (upside) and Scenario B (floor)
- Peak Ceiling: maximum projected KR assuming optimal development

### Step 5: Draft Range Mapping
Map the player's Entry KR, 3-Year Projection, and Peak Ceiling to a WNBA draft range.

| Draft Range | Entry KR | 3-Year Projection | Peak Ceiling | What Teams Buy |
|------------|---------|-------------------|-------------|---------------|
| #1-4 | 83-87 | 88-93 | 92-97 | Franchise player upside |
| #5-12 | 80-85 | 85-90 | 88-94 | Star development |
| #13-24 | 77-82 | 82-87 | 85-91 | Starter development |
| #25-36 | 74-79 | 79-84 | 82-88 | Rotation development |
| Undrafted | 70-77 | 76-82 | 80-86 | Role player / overseas |

### Step 6: Salary Projection
Reference the Pro Salary Framework (File 02) to project:
- WNBA salary based on draft position and new CBA
- Overseas salary based on archetype and best league fit
- Total annual earning potential
- EPIC provision eligibility and timeline for young players

### Step 7: Team Fit Analysis
For each WNBA team in the registry:
- Run system fit % against the team's offensive and defensive systems
- Identify which system demands the player fills
- Project Team KR impact of adding this player
- Identify the best 3-5 team fits

### Step 8: Overseas Fit Analysis
For each major women's overseas league:
- Identify the playing style and system demands
- Project role (star import, rotation import, developmental)
- Project salary range
- Identify the 2-3 best league fits

## 4. WNBA DRAFT-RANGE OUTPUT PRIORITY

Same structure as men's draft-range output priority, adapted for WNBA's 3-round, 36-pick draft:

**#1-4 - Lead with PEAK CEILING.**
Show: Peak Ceiling KR first, 3-Year Projection second, Key Dev Variable.

**#5-12 - Lead with 3-YEAR PROJECTION.**
Show: 3-Year Projection first, System Fit with likely drafting teams, Peak second.

**#13-24 - Lead with MEDIAN OUTCOME.**
Show: Median Outcome KR first, Entry KR second, System Fit %, Role projection.

**#25-36 and Undrafted - Lead with ENTRY KR + ROLE.**
Show: Entry KR, specific role, Best league fit (WNBA vs overseas), Salary range.

## 5. Pregnancy/Motherhood Career Impact Modeling

Unique to women's pro transition: the system must account for potential career interruptions due to pregnancy without discriminating.

Treatment:
- Pregnancy is NOT modeled as a negative in pro projection. It is modeled as a temporary development pause.
- Players who have already returned from pregnancy at the college level (rare but possible) receive the Motherhood Return Override (+1.0 KR) if they returned to pre-pregnancy production.
- Career earnings projections should include a note that the new WNBA CBA includes "enhanced benefits for players with children or who are family planning" including expanded family-related provisions.
- The system does NOT predict or assume pregnancy. It only accounts for it when it has already occurred and is publicly disclosed.

## 6. Pro Anchoring Rules (Women's Basketball)

a. **Draft position CONFIRMS pro tier, it does not determine it.** A #1 pick with DKR 73 does not automatically get a high pro KR.

b. **Entry KR reflects Day 1 reality.** Most WNBA rookies are developing into their roles. Entry KR should be 80-87 for most first-round picks.

c. **The WNBA's smaller roster size means faster rotation access.** A WNBA roster has 12 players (vs NBA's 15+). Third-round picks get more opportunity than NBA second-round picks.

d. **Overseas development is a valid alternative path.** Some players develop faster playing 30+ MPG overseas than sitting on a WNBA bench. The system should project this path when appropriate.

e. **Age and eligibility matter differently.** Many women's basketball players use all 5 years of college eligibility (including COVID year and redshirts). A 23-year-old WNBA rookie is normal, not old. Development runway is still significant.

f. **International players have a different trajectory.** Players coming from EuroLeague Women, Turkish KBSL, or other top leagues may already have professional experience that changes the Entry KR calculation.

---

# COACHING IMPACT MODIFIER (CIM) v1.0

## Purpose
Quantifies the impact of coaching quality on player development and team performance. Same framework as men's CIM.

## Methodology
CIM is computed from observable coaching outputs:
- Player development rate (how much do players improve KR under this coach?)
- System implementation quality (how quickly does a new system reach Locked status?)
- Tactical adjustment quality (how effectively does the team adjust mid-game and game-to-game?)
- Recruiting success (what quality of players does the coach attract relative to program resources?)

## CIM Tiers
| Tier | CIM | Description | Women's Examples (Illustrative) |
|------|-----|-------------|-------------------------------|
| Elite | +3 to +5 | Consistently develops players beyond projection. System maximizes talent. | Geno Auriemma (UConn), Dawn Staley (South Carolina), Kim Mulkey (LSU), Tara VanDerveer (Stanford, retired) |
| Strong | +1 to +2 | Above-average development and system implementation. | Joni Taylor (Texas A&M), Curt Miller, Kelly Graves |
| Average | 0 | Players develop at expected rates. System is competently implemented. | Most coaches |
| Below Average | -1 to -2 | Players develop slower than expected. System issues. | |
| Poor | -3 to -5 | Players regress or fail to develop. System is poorly implemented. | |

## CIM Application
CIM is applied as a modifier to development projections in the Development Intelligence Engine. It does NOT modify Player KR or Team KR directly.

Example: A player with projected +5 KR development over 2 years under an average coach would project +7 KR under an Elite CIM coach and +3 KR under a Below Average CIM coach.

## Women's Basketball Coaching Context
- Coaching stability is a major factor in women's basketball. Programs with long-tenured coaches (UConn, South Carolina, Stanford historically) produce more consistent development.
- Coaching changes are frequent in the WNBA. The new CBA and expansion have created significant coaching movement.
- College coaching hires from outside women's basketball (men's coaching backgrounds, NBA assistants) are increasing. CIM should not assume a men's basketball coaching background is automatically positive or negative - evaluate outcomes.
- The correlation between coaching quality and player development is stronger in women's basketball than men's because the AAU/grassroots infrastructure is less developed, meaning more development happens at the college level.
