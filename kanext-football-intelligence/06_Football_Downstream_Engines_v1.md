# NEXUS FOOTBALL INTELLIGENCE -- FILE 06: DOWNSTREAM ENGINES
## v1.0

---

# DEVELOPMENT INTELLIGENCE ENGINE

## 0. Purpose
Takes everything the system knows about a player and translates it into actionable intelligence for placement, development, and decision-making.

Answers five questions:
1. Where are you now? -- Truth summary across every level and system
2. Where should you be? -- Best-fit targets ranked by actual team impact
3. What are you worth there? -- Value at each target (scholarship, NIL implication)
4. What's the gap? -- Specific traits holding you back, with exact deltas needed
5. What's the path? -- Prioritized development roadmap with projected impact

Does NOT evaluate players. Does NOT modify Player KR, Team KR, archetypes, or any upstream output.

## 1. Inputs (Non-Negotiable)
A) Player Identity + Record
B) Player KR Outputs (Truth): Final System AKR/DKR, Overall Player KR, Base KR, confidence_pct
C) Archetype + Badges + Impact Modifiers + System Risks
D) Full System Fit Profile (all 8 offensive + 6 defensive system fit scores)
E) Trait Scores (Raw): All 59 traits
F) Level Interpretation: Level Tier Map at every relevant level
G) Physical Profile: height, weight, arm length, hand size, combine measurables, age

## 2. Outputs

### OUTPUT A: Truth Summary -- "Where Are You Now?"
A1) KR Identity Card: Final KR, range, confidence, component KRs, archetype, badges, impact modifier, system risks.
A2) Level Tier Map: What the KR means at every relevant level. One player, one KR, multiple legend reads.
A3) System Fit Profile: Top-3 best-fit offensive systems and top-3 best-fit defensive systems, with fit % and demand tier.

### OUTPUT B: Placement Targeting -- "Where Should You Be?"
B1) Level-Appropriate Targets: Programs where this player's KR falls in the "High-Impact Starter" or "Solid Starter" tier. Playing at a level where you're a backup is development death.
B2) System-Fit Targets: Programs running systems where this player's archetype is A or B tier demand.
B3) Scholarship Probability: Likelihood of full, partial, or no scholarship at each target level.

### OUTPUT C: Player Value -- "What Are You Worth?"
C1) Transfer Portal Value: KR x System Fit% x Eligibility Remaining x Position Value. Higher for QBs and EDGE. Lower for K/P.
C2) NIL Value Estimate: Based on position, production, market size of potential landing spots.
C3) Scholarship Value: Full ride vs partial at each level.

### OUTPUT D: Gap Analysis -- "What's Holding You Back?"
D1) Trait Gap Table: For each scored trait, show current value, target value for the next tier, and the delta.
D2) Highest-Leverage Gaps: The 3-5 traits where improvement would produce the largest KR lift, accounting for position weighting.
D3) System Risk Resolution: Which trait improvements would remove current system risks? What's the threshold?

### OUTPUT E: Development Roadmap -- "What's the Path?"

#### Position-Specific Development Plans

**QB Development:**
- Year 1 priorities: Accuracy (short/intermediate), Pre-Snap Recognition, Processing Speed
- Year 2 priorities: Accuracy (deep), Pocket Presence, Play-Action Execution
- Year 3 priorities: Arm Talent refinement, Timing/Anticipation, Leadership
- Measurable targets: Completion % progression, INT rate decline, passer rating improvement
- Film study requirements: 10+ hours/week minimum for elite development

**RB Development:**
- Year 1: Vision/Patience, Ball Security, Pass Protection
- Year 2: Contact Balance refinement, Receiving Ability expansion
- Year 3: Elusiveness polish, route tree as receiver
- Measurable targets: YPC progression, fumble rate, receptions per game
- Physical targets: Weight maintenance, 40 time, bench press progression

**WR Development:**
- Year 1: Route Running-Precision (one route tree level per year), Hands, Release
- Year 2: Route Tree Breadth expansion, YAC improvement, Contested Catch
- Year 3: Deep Ball Tracking, Blocking willingness, Full route tree
- Measurable targets: Separation rate, drop rate decline, YPR progression
- Physical targets: Speed maintenance, agility improvement

**OL Development:**
- Year 1: Pass Protection-Technique (hand placement, kick slide), Penalty Discipline
- Year 2: Run Blocking-Drive (generating movement), Pulling/Movement
- Year 3: Pass Protection-Power (anchor development), Second-Level blocking
- Measurable targets: Pressures allowed decline, penalty reduction, PFF grade progression
- Physical targets: Weight gain (10-15 lbs over 2 years for young OL), bench press, functional strength
- NOTE: OL development is the SLOWEST of all position groups. 3-year minimum to NFL readiness.

**DL/EDGE Development:**
- Year 1: Get-Off/First Step, Hand Usage (primary move), Run Defense fundamentals
- Year 2: Counter Moves (add 1-2 counters per year), Bend refinement
- Year 3: Motor/Relentlessness, Pass Rush Productivity maximization
- Measurable targets: Pressure rate progression, sack rate, TFL
- Physical targets: Maintain speed while adding 10-15 lbs of functional mass

**LB Development:**
- Year 1: Tackling technique (open field + run fits), Play Recognition
- Year 2: Coverage skills (zone first, then man), Blitz effectiveness
- Year 3: Processing Speed, three-down capability
- Measurable targets: Tackle rate, missed tackle reduction, coverage grades
- Physical targets: Speed maintenance while adding functional strength

**DB Development:**
- Year 1: Man Coverage technique (press, trail, mirror), Tackling fundamentals
- Year 2: Zone Coverage (pattern reads, break on ball), Ball Skills
- Year 3: Versatility (play both man and zone), Blitz/run support
- Measurable targets: Passer rating allowed decline, PBU rate, INT rate
- Physical targets: Speed maintenance, agility improvement

### OUTPUT F: Competitive Landscape -- "Who Are You Competing Against?"
F1) Positional rankings at current level (where does this player rank among peers?)
F2) Portal competition (who else at this position is in the portal at similar KR?)
F3) Incoming competition (high school recruits at this position committed to the player's program)

---

# PRO TRANSITION INTELLIGENCE ENGINE

## Purpose
Translates college football identity into professional football projection. Uses same Entry/Median/Peak framework as basketball.

## Key Concept: Entry vs Median vs Peak
- **Entry KR** = Day 1 as a rookie. Most rookies are 80-87 regardless of draft position.
- **Median Outcome** = Most likely version by Year 3.
- **Peak Ceiling** = Best realistic outcome by Year 3-5.

## Draft-Range Output Priority

| Draft Range | Primary KR | What Team Is Buying |
|---|---|---|
| #1-5 | Peak Ceiling | Franchise player potential. QB or generational defender. |
| #6-15 | 3-Year Projection | Complementary star. Fit starts to matter. |
| #16-32 | Median Outcome | Contributors NOW. High floor, system-ready. |
| 2nd-3rd round | Entry KR + Role | Earn a roster spot. What can you do Day 1? |
| 4th-7th round | Entry KR + Upside | Lottery tickets. One elite trait. |
| UDFA | Entry KR only | Make the 53. Special teams first. |

## Inputs
A) Player KR Outputs (College Truth)
B) Full Trait Scores (59 traits)
C) Archetype + Badges + Impact Modifiers + System Risks
D) Full System Fit Profile (all 14 systems)
E) Physical Profile + Combine/Pro Day Measurables
F) Pro Positional Weights (from File 02)
G) Pro System Risks + Overrides
H) Pro Player KR Legend

## NFL Combine Measurable Thresholds by Position (v1)

### QB
- Height: 6'1+ (threshold). 6'3+ (elite).
- Hand size: 9.0+ (threshold). 9.5+ (elite).
- 40: 4.80 or better (threshold for mobility). 4.60 (elite dual-threat).

### RB
- 40: 4.50 (threshold). 4.40 (elite).
- Weight: 195+ (threshold). 215+ (power).
- Bench: 18+ reps (threshold). 24+ (elite power).

### WR
- 40: 4.50 (threshold). 4.35 (elite speed).
- Height + Weight: position-specific (X needs 6'0+/195+, Slot can be 5'9+/180+).
- Vertical: 35+ (threshold). 38+ (elite).

### TE
- 40: 4.65 (threshold). 4.55 (elite athletic TE).
- Weight: 240+ (threshold). 250+ (inline).
- Bench: 20+ (threshold).

### OL
- Arm Length: 33+ (threshold for OT). 32+ (IOL).
- Bench: 25+ (threshold). 30+ (elite).
- Short Shuttle: 4.60 or better (threshold). 4.40 (elite).
- Weight: 300+ (threshold). 315+ (preferred for interior).

### EDGE
- 40: 4.65 (threshold). 4.50 (elite speed rusher).
- Arm Length: 33+ (threshold). 34.5+ (elite).
- Bench: 22+ (threshold).
- 3-cone: 7.10 or better (threshold). 6.80 (elite).

### IDL
- Weight: 280+ (3T threshold). 310+ (NT threshold).
- Bench: 28+ (threshold). 35+ (elite).
- Arm Length: 33+ (threshold).

### LB
- 40: 4.65 (threshold). 4.50 (elite range).
- Weight: 225+ (threshold). 240+ (thumper).
- Vertical: 34+ (threshold).

### CB
- 40: 4.50 (threshold). 4.35 (elite).
- Height: 5'10+ (outside threshold). 5'9+ (nickel).
- Arm Length: 31+ (threshold). 32.5+ (elite press).

### S
- 40: 4.55 (threshold). 4.40 (elite).
- Weight: 195+ (FS). 210+ (SS).
- Bench: 15+ (threshold).

## Outputs

### OUTPUT G: Pro Projection KR (Entry)
G1) Pro KR Identity Card: Pro Projection KR (Entry), range, confidence, Pro AKR/DKR/TKR/IQKR, college→pro delta explanation.
G2) Translation Breakdown: OPF shift, trait weight shifts, badge gate changes, system risk changes, override changes.
G3) Pro KR Legend Interpretation: Day-one pro identity. NOT projected peak.

### OUTPUT H: Development Trajectory
H1) Year 1 Projection: Projected KR range, role expectation, physical maturation projections.
H2) Year 3 Projection (Scenario Branch):
- Scenario A (key variable develops): Projected KR, resolved risks, unlocked badges, archetype evolution, role.
- Scenario B (key variable doesn't develop): Projected KR, persistent risks, stabilized archetype, role.
H3) Peak Projection: Ceiling KR range, timeline to peak (typically age 25-28), ceiling confidence.
H4) Floor Projection: Worst realistic outcome.

Rules: No trait improvement > +15 over 3 years. No > +8 in a single year. Both upside and downside always shown.

### OUTPUT I: Key Development Variable
I1) Variable Identification: The single highest-leverage trait improvement. Current score, target, cluster.
I2) KR Impact: How much Pro KR moves if achieved. System risk resolution. Badge unlocks. Archetype evolution.
I3) Development Evidence: Combine data signal, age factor, historical comp rate, risk label.

### OUTPUT J: Archetype Evolution Path
Current → Entry → Year 3A → Year 3B → Peak archetype map.

### OUTPUT K: Draft and Team Fit Intelligence
K1) Draft Range Projection: Based on Entry KR + Peak mapped to historical draft position.
K2) Team Fit Scoring: For each NFL team (from Pro Team Registry): system fit %, roster overlap, need match.
K3) Top-5 Best-Fit Teams: Ranked by combined fit, need, and window alignment.

### OUTPUT L: Non-NFL Professional Placement (if applicable)
If Entry Pro KR < 77 (below NFL viability): CFL, UFL, or International placement recommendation with league-specific fit assessment.

---

# TRANSFER PORTAL INTELLIGENCE

## Portal Value Assessment
Portal_Value = (Player_KR x System_Fit% x Eligibility_Remaining x Position_Value_Weight) / Risk_Factor

Position Value Weights: QB (1.4x), EDGE (1.2x), OT (1.15x), CB (1.1x), WR (1.05x), all others (1.0x), K/P (0.7x).

Risk Factors: Multi-transfer (+20% risk per additional transfer), Late portal entry (+15%), Injury history (+10-25% depending on severity), Character concerns (+20%).

## Fit Scoring vs Receiving Program
1. System Fit: Does archetype match receiving team's system at A or B tier?
2. Positional Need: Is the receiving team below minimum viable depth or conference-average KR at this position?
3. Competitive Level Match: Is the player's KR appropriate for the receiving team's level? (KR 85 player going to a level where 85 = backup is a bad fit)
4. Academic Fit: Does the player meet academic transfer requirements? Graduate transfer? Sit-out waiver needed?

## Transfer Eligibility Rules (Summary)
- One-time transfer: immediate eligibility (NCAA rule since 2021)
- Second transfer: sit-out year required unless waiver
- Graduate transfer: immediate eligibility
- Academic requirements: must be in good standing at previous institution
- Mid-year transfers: spring enrollment → eligible for fall

---

# COACHING IMPACT MODIFIER

## Purpose
Coaching quality affects player development rate and team performance. Football coaching impact is MORE position-specific than basketball because position coaches are specialists.

## Coaching Impact Tiers

| Tier | Label | Development Rate Modifier | Team KR Impact |
|---|---|---|---|
| 1 | Elite | +8-12% faster development | +1.5 to +2.5 Team KR |
| 2 | Strong | +4-7% faster | +0.5 to +1.5 |
| 3 | Average | Baseline | Baseline |
| 4 | Below Average | -4-7% slower | -0.5 to -1.5 |
| 5 | Poor | -8-12% slower | -1.5 to -2.5 |

## Position Coach Quality Indicators

**QB Coach Impact (highest individual impact):**
- Track record of QB development (QBs improved under this coach?)
- Scheme complexity managed (did QBs regress or improve in this system?)
- QB passer rating improvement year-over-year
- Historical: QBs coached who reached NFL

**OL Coach Impact (highest collective impact):**
- OL unit improvement year-over-year (sack rate, YPC)
- Track record of developing draft picks from OL
- Technique development visible on film
- Historical: Jeff Stoutland-tier OL coaches produce +3 Team KR vs average OL coach

**DB Coach Impact:**
- Secondary improvement year-over-year (passer rating allowed, INT rate)
- Press technique development
- Ball production (INTs, PBU rate)

**DL/EDGE Coach Impact:**
- Pass rush improvement (pressure rate, sack rate)
- Run defense improvement
- Hand usage development visible on film

## Head Coach Impact
Head coach quality is captured through:
- Team KR vs expected Team KR (based on roster talent)
- Close-game win rate (coaching impact in high-leverage situations)
- Recruiting class quality relative to program resources
- Player retention rate (do players transfer out?)
- NFL draft picks produced per scholarship cycle

---

# REDSHIRT DECISION ENGINE

## Purpose
Determines when to redshirt vs play a true freshman based on depth chart, development stage, and scholarship clock.

## Decision Framework

### PLAY (do not redshirt) if ANY of the following:
1. Player's KR is within 5 points of the current starter (competitive for the job)
2. Position group is at or below Critical Threshold depth (File 03)
3. Player is at a premium position (QB, EDGE, OT) AND immediately contributes to special teams
4. Player's archetype fills an A-tier system demand that no one else on the roster fills

### REDSHIRT if ALL of the following:
1. Player's KR is 10+ points below the starter
2. Position group is at or above minimum viable depth
3. Player's TKR suggests significant physical development needed (weight gain, speed improvement)
4. The position has a 3+ year development timeline (OL, QB project, DL)

### FOUR-GAME RULE (NCAA)
Players can appear in up to 4 games and maintain redshirt eligibility. Use these 4 games for:
- Week 1-2: Evaluate in live action (special teams, mop-up situations)
- Conference championship / rivalry game: depth insurance
- Bowl game: reward and development opportunity

### Redshirt Override: Injury
If a starter goes down and the redshirt freshman is the next-best option, burn the redshirt. Winning NOW takes priority over development when the team is competing for championships.

### Scholarship Clock Consideration
5 years to play 4 seasons. Redshirting uses a year of clock but preserves a season of eligibility. For players who may need a 5th year of development (OL, QB projects), redshirting Year 1 is almost always correct.

---

# GOVERNANCE

All downstream engines consume upstream truth. They do not modify Player KR, Team KR, archetypes, system identity, or any upstream output. All outputs are deterministic. Changes to development rates, portal value formulas, coaching impact tiers, redshirt decision logic, or pro transition methodology require documentation, versioning, and approval.
