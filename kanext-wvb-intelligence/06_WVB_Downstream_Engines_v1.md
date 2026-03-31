# Women's Volleyball Downstream Engines v1

---

## 0. SCOPE

This is the single authoritative document for all downstream intelligence engines in women's volleyball: Development Intelligence, Pro Transition, Coaching Impact Modifier, and Recruiting Intelligence.

These engines consume upstream outputs (Player KR, Team KR, archetypes, system fit). They NEVER modify upstream values. They produce recommendations, projections, and planning intelligence only.

---

# PART 1: DEVELOPMENT INTELLIGENCE ENGINE

## 1.0 Purpose

The Development Intelligence Engine answers five questions for any evaluated player:

1. **Where are you now?** - Truth summary across every level and system
2. **Where should you be?** - Best-fit targets ranked by actual team impact
3. **What are you worth there?** - Value at each target (PTV, scholarship implication)
4. **What is the gap?** - Specific traits holding you back, with exact deltas needed
5. **What is the path?** - Prioritized development roadmap with projected impact

This engine does NOT evaluate players. It reads governed truth and produces downstream recommendations only. All outputs are deterministic.

## 1.1 Consumers

- **The player** - "Where should I transfer? What should I work on?"
- **The player's current coach** - "How do I develop this player? What is her ceiling?"
- **Recruiting coordinators** - "Does this player fit our system? What is she worth to us?"
- **Transfer portal decision-makers** - "Which portal players improve our Team KR the most?"
- **Club/high school advisors** - "What level should this player target?"
- **Pro scouts** - "Where does this player project professionally?"

## 1.2 Inputs (Must Pull)

### A) Player Identity + Record
- Name, position, height, reach measurements
- Career history (schools, levels, seasons)
- Current roster affiliation
- Eligibility status and remaining eligibility
- Transfer portal status (if applicable)

### B) Player KR Outputs
- Final Player KR
- All 6 component KRs (AKR, BKR, DKR, SVR, SKR, IQKR)
- Base KR (pre-system fit)
- Confidence %
- Data tier (V1/V1+/V2/V3)

### C) Archetype + Badges + Impact Modifiers
- Primary archetype
- Secondary archetype (if qualified)
- Badge list
- Impact modifiers
- System risks

### D) Full System Fit Profile
- System fit score for ALL 6 offensive systems
- System fit score for ALL 5 defensive systems
- For each system: fit %, demand tier (A/B/C/No-match)

### E) Trait Scores
- All scored traits with current values
- Unscored traits flagged
- Cluster-level summaries

### F) Level Interpretation
- Level Tier Map (KR read against every level legend)

## 1.3 Development Roadmap

### Gap Analysis
For each component KR, compute the delta between current score and the score needed to move up one legend tier at the player's current level.

```
Gap_Component_X = Target_Component_Score - Current_Component_Score
```

Rank components by:
1. **KR lift per point of improvement** - which component, given its OPF weight, produces the most KR improvement per point gained?
2. **Trainability** - some skills are more trainable than others

### Trainability Ratings by Component

| Component | Trainability | Notes |
|-----------|-------------|-------|
| SVR (Serve) | High | Serving is one of the most trainable skills. Repetition-based. Players can improve ace rate and placement significantly with focused training. |
| DKR (Dig/Defense) | High | Platform technique, positioning, and serve receive are highly trainable. Takes time but is responsive to coaching. |
| AKR (Attack) | Medium-High | Shot selection, timing, and approach can be trained. Raw power/athleticism is less trainable. |
| SKR (Set) | Medium | Setting technique improves with reps, but elite decision-making and touch are partially innate. Setter development is a multi-year process. |
| BKR (Block) | Medium | Timing and read speed improve with training. Height and reach are fixed. Positioning and seal can be coached. |
| IQKR (VB IQ) | Medium-Low | Game sense improves with experience and film study, but the elite-level processing speed is partially innate. |

### Development Timeline Projections

| Current KR | Projected KR Gain in 1 Year | Projected KR Gain in 2 Years |
|-----------|---------------------------|----------------------------|
| 90+ | +1 to +3 (diminishing returns at the top) | +2 to +5 |
| 80-89 | +3 to +6 | +5 to +10 |
| 70-79 | +5 to +9 | +8 to +14 |
| 60-69 | +6 to +12 | +10 to +18 |

These projections assume: appropriate level of competition, quality coaching, full health, and player commitment to development.

### Skill Development Plans by Position

#### Setter Development Path
1. **Year 1 focus:** Consistency. Master the basic set to every position. Zero ball-handling errors per set. Pass rating 2.20+.
2. **Year 2 focus:** Tempo. Develop first-tempo setting with middles. Run 3 or more different plays per rotation.
3. **Year 3 focus:** Decision-making. Distribute based on defensive alignment, not habit. Develop dump/tip threat. Out-of-system setting.
4. **Year 4 focus:** Command. Run the entire offense. Adjust between sets. Manage game situations. Lead.

#### Outside Hitter Development Path
1. **Year 1 focus:** Serve receive. Get the pass rating to 2.20+. Develop platform consistency.
2. **Year 2 focus:** Attack variety. Add line shot, tip, tool. Hit .250+ with shot selection.
3. **Year 3 focus:** Transition game. Kill in transition, not just on serve receive. Back-row attack.
4. **Year 4 focus:** Six-rotation dominance. Serve at an elite level. Dig, pass, hit, block at above-average in every phase.

#### Middle Blocker Development Path
1. **Year 1 focus:** Block timing. Read the setter, not the ball. Get touches on outside sets.
2. **Year 2 focus:** Quick attack efficiency. Hit .300+ on ones and slides. Transition off the block to attack.
3. **Year 3 focus:** Blocking range. Move from pin to pin. Seal with adjacents. Shut down the opponent's primary attacker.
4. **Year 4 focus:** Two-way impact. Dominate at the net offensively and defensively. Anchor the team's defensive front.

#### Opposite Development Path
1. **Year 1 focus:** Right-side hitting mechanics. Adjust approach angle from OH (if transitioning). Hit .230+ from right side.
2. **Year 2 focus:** Scoring volume. Increase attempts per set. Hit against a double block. Right-side blocking.
3. **Year 3 focus:** Serving weapon. Develop an elite serve. Back-row attack from right-side pipe.
4. **Year 4 focus:** Complete right side. Score, block, serve at an above-average level across all three.

#### Libero Development Path
1. **Year 1 focus:** Serve receive fundamentals. Pass rating 2.20+. Read server tendencies.
2. **Year 2 focus:** Defensive range. Pursue balls outside the primary zone. Emergency technique (pancake, sprawl, overhead dig).
3. **Year 3 focus:** Leadership. Quarterback the defense. Call plays. Direct traffic. Communicate blocking assignments.
4. **Year 4 focus:** Floor general. Anticipate every play. Maintain 2.40+ pass rating. 5.0+ digs/set. Elevate the entire defense around you.

## 1.4 Transfer Portal Fit Assessment

For each potential transfer destination, compute:

1. **System Fit Score** - how well does the player's archetype match the target program's offensive and defensive systems?
2. **Roster Impact** - what would adding this player do to the target program's Team KR?
3. **Role Projection** - starter? rotation player? specialist?
4. **Development Fit** - does the coaching staff and program culture support her development needs?
5. **Competitive Level Alignment** - is the player's KR appropriate for this level? (Level Tier Map)

**Output format:**
```
TRANSFER FIT ASSESSMENT
========================
Player: [Name] | KR: [XX.X] | Position: [Pos]

Target: [School] | [Level] | [Conference]
System: [Offense] / [Defense]
System Fit: [XX.X]%
Roster Impact: Team KR [Before] -> [After] (+[Delta])
Projected Role: [Starter/Rotation/Specialist]
Scholarship Projection: [XX]% of full scholarship
Development Fit: [Strong/Moderate/Weak]
Overall Recommendation: [Excellent/Good/Fair/Poor]
```

---

# PART 2: PRO TRANSITION ENGINE

## 2.0 Purpose

The Pro Transition Engine projects a college player's professional readiness, optimal league placement, and salary range. It consumes the player's KR evaluation and maps it against pro league standards.

## 2.1 Pro Readiness Assessment

### Minimum Thresholds

| Component | Minimum for Pro Readiness |
|-----------|-------------------------|
| Overall KR | 78+ |
| Primary Component KR (position-specific) | 80+ |
| IQKR | 72+ |
| Confidence % | 65%+ |

Players below these thresholds are not recommended for professional play. The development engine should identify what needs to improve.

### Pro Readiness Tiers

| Tier | KR Range | Projection |
|------|----------|-----------|
| Immediate Impact | 90+ | Can contribute immediately in a top-tier league (Turkey, Italy, Brazil). PVF franchise player. |
| Starter Quality | 85-89 | Can start in a top-tier league or be an impact player in PVF. |
| Rotation Professional | 80-84 | Rotation player in top leagues. PVF starter. Strong starter in mid-tier leagues (Japan, Korea). |
| Developmental Pro | 75-79 | Fringe roster in top leagues. PVF rotation. Strong in lower-tier leagues. Athletes Unlimited caliber. |
| Below Pro Level | Below 75 | Not projected as a sustainable professional. May try overseas lower divisions or domestic semi-pro. |

## 2.2 League-by-League Placement

For each pro league, compute the player's projected role and salary:

```
Pro_League_KR_Read = Player_KR (apply Pro KLVN lambda for the league)
Pro_Role = map Pro_League_KR_Read against Pro Player KR Legend
Pro_Salary_Range = map Pro_Role against Pro Salary Framework for the league
```

**Output for each league:**
```
League: [Name]
Lambda: [X.XXX]
Projected Role: [Franchise/Star/Starter/Rotation/Fringe]
Salary Range: [$XXK - $XXK]
Fit Notes: [Why this league is or is not a good fit]
```

## 2.3 PVF Draft Projection

The Pro Volleyball Federation (PVF) conducts a draft for college players and available free agents.

**Draft Round Projection by KR:**

| KR Range | Draft Projection |
|----------|-----------------|
| 92+ | Round 1 pick. Franchise-level talent. |
| 88-91 | Round 1-2 pick. Impact starter from day one. |
| 84-87 | Round 2-3 pick. Starter or high-end rotation. |
| 80-83 | Round 3-4 pick. Rotation player. |
| 76-79 | Late round or undrafted free agent. |
| Below 76 | Unlikely to be drafted. May try open tryouts. |

**Draft Stock Factors:**
- Position scarcity (setters and middles are in higher demand)
- Athletic measurables (height, reach, vertical)
- Age (younger players have more development runway)
- Injury history (reduces draft stock)
- International experience (increases stock)
- College program pedigree (Power 4 players get more draft attention)

## 2.4 Overseas Placement Intelligence

**Top destination leagues by player profile:**

| Player Profile | Best Fit Leagues |
|---------------|-----------------|
| Power attacker (OH/OPP) with KR 90+ | Turkish Sultanlar Ligi, Italian Serie A1, Brazilian Superliga |
| Complete OH with strong defense, KR 85+ | Italian Serie A1, Japanese V.League, Korean V-League |
| Elite setter, KR 88+ | Turkish Sultanlar Ligi (highest setter salaries), Italian Serie A1 |
| Strong middle with KR 85+ | Any top league (middles are universally valued) |
| Defensive specialist/libero with KR 88+ | Italian Serie A1 (values defense), Japanese V.League |
| Young developmental player, KR 78-84 | Polish liga, Chinese league, lower-tier Turkish clubs |

**Overseas Considerations:**
- Visa and work permit requirements vary by country
- Language barriers (Turkey and Italy often have English-speaking team environments due to international rosters)
- Cultural adjustment factor
- Season timing (European seasons overlap with PVF, requiring a choice)
- Tax implications vary significantly by country

## 2.5 Pro Transition Output

```
PRO TRANSITION ASSESSMENT
==========================
Player: [Name] | KR: [XX.X] | Position: [Pos] | Age: [XX]

PRO READINESS TIER: [Immediate Impact / Starter Quality / Rotation / Developmental / Below Pro]

PVF DRAFT PROJECTION: Round [X] | Projected salary: $[XX]K - $[XX]K

LEAGUE PLACEMENT MAP:
  Turkish Sultanlar Ligi: [Role] - $[XX]K-$[XX]K
  Italian Serie A1: [Role] - $[XX]K-$[XX]K
  Brazilian Superliga: [Role] - $[XX]K-$[XX]K
  Japanese V.League: [Role] - $[XX]K-$[XX]K
  Korean V-League: [Role] - $[XX]K-$[XX]K
  PVF (US): [Role] - $[XX]K-$[XX]K
  Athletes Unlimited: [Role] - $[XX]K-$[XX]K

RECOMMENDATION: [Best fit league and why]

DEVELOPMENT NEEDS FOR PRO:
  [What trait improvements would move her up a pro tier]
  [Timeline for development]

CAREER EARNINGS PROJECTION (5 years):
  Conservative: $[XXX]K total
  Moderate: $[XXX]K total
  Optimistic: $[XXX]K total
```

---

# PART 3: COACHING IMPACT MODIFIER

## 3.0 Purpose

The Coaching Impact Modifier quantifies a coaching staff's effect on player development. It does not change any individual KR. It is used as a modifier in the Development Engine to project realistic development timelines under different coaching contexts.

## 3.1 Coaching Impact Score (0-100)

### Input Signals

1. **Player Development Rate:**
   - Average KR improvement per year for players who stay 2+ seasons
   - Percentage of players who improve vs stagnate vs decline

2. **Transfer Success Rate:**
   - Players who transfer in: do they maintain or improve KR?
   - Players who transfer out: do they maintain or improve at the new school?

3. **Pro Placement Rate:**
   - Percentage of seniors/graduates who play professionally
   - Average pro KR of graduates

4. **System Effectiveness:**
   - Does the team's System Fit% match the available talent?
   - Does the coaching staff adapt the system to the personnel, or force personnel into a rigid system?

5. **Roster Management:**
   - Scholarship allocation efficiency (PMV relative to available scholarships)
   - Recruiting hit rate (percentage of recruits who become rotation players)

### Coaching Impact Score Tiers

| Score | Label | Meaning |
|-------|-------|---------|
| 90-100 | Elite Developer | Players consistently improve 5+ KR points per year. High pro placement rate. Strong transfer success. National championship-caliber coaching. |
| 80-89 | Strong Developer | Players improve 3-5 KR points per year. Regular postseason appearances. Good player development culture. |
| 70-79 | Average Developer | Players improve 2-3 KR points per year. Competitive program. Standard development. |
| 60-69 | Below Average | Players improve 0-2 KR points per year. Inconsistent development. Some players stagnate. |
| Below 60 | Weak Developer | Players frequently stagnate or decline. High transfer-out rate. Poor pro placement. System rigidity. |

### Application
The Coaching Impact Score modifies development projections in the Development Engine:

```
Adjusted_Development_Rate = Base_Development_Rate * (Coaching_Impact_Score / 80)
```

A score of 80 is neutral (1.0x multiplier). Elite coaches (90+) accelerate development by ~12%. Weak coaches (below 60) slow development by ~25%.

---

# PART 4: RECRUITING INTELLIGENCE ENGINE

## 4.0 Purpose

The Recruiting Intelligence Engine evaluates high school and club volleyball players for college placement. Recruiting evaluation is fundamentally different from college evaluation because:

1. **Data is sparse.** Most high school and club stats are not standardized or verified.
2. **Physical development is ongoing.** A 16-year-old's measurements and athleticism will change.
3. **Club volleyball is the primary evaluation context.** Most top recruits play club volleyball (USAV, JVA, AAU) year-round, and club performance is more indicative than high school.
4. **Projection is more important than current production.** A recruit is evaluated for what she will become, not just what she is.

## 4.1 Recruiting Data Sources

| Source | Reliability | Notes |
|--------|-----------|-------|
| Club volleyball stats (USAV events) | Medium | Quality varies. National qualifiers are highest level. |
| PrepDig.com rankings | Medium | Industry-standard recruiting rankings. Useful but not definitive. |
| MaxPreps high school stats | Low-Medium | High school level varies enormously. Stats are not KLVN-normalized. |
| PrepVolleyball.com rankings | Medium | Legacy recruiting service. Rankings provide positional context. |
| NCSA/recruiting profiles | Low | Self-reported, often inflated. |
| College coach assessments | High | If available (from camp evaluations, offers list). |
| Video (highlight reel) | Medium | Self-selected footage. Shows potential, not complete picture. |
| Video (full match film) | High | Rare for recruiting. If available, strongest data source. |

## 4.2 Recruiting Evaluation Process

### Step 1: Establish Physical Profile
- Height, standing reach, approach jump touch
- Projected adult height (if under 16, project based on family history)
- Position fit based on physical profile

### Step 2: Determine Data Tier
Most recruiting evaluations are V1 or lower. Club stats + highlight video = V1 at best. Full match film = V1+.

### Step 3: Project KR
Use available data to project a KR range (not a single number). Wider confidence interval than college evaluation.

```
Projected_KR_Range = [Low estimate, High estimate]
Confidence: 35-55% (recruiting data is inherently uncertain)
```

### Step 4: Positional Projection
Some recruits will change positions in college:
- A 5'9" OH in high school may become a libero or DS in college
- A 5'11" setter in high school may move to OH if a college already has a setter
- A strong MB recruit may transition to OPP if she has right-side hitting ability

Flag potential position changes and evaluate for both current and projected positions.

### Step 5: Level Fit Assessment
Based on projected KR and physical profile, determine appropriate competitive level:

| Projected KR Range | Level Fit |
|-------------------|-----------|
| 88+ | NCAA D1 Power 4 |
| 83-87 | NCAA D1 (Mid-Major or Power 4 developmental) |
| 78-82 | NCAA D1 (Low-Major) or strong D2/NAIA |
| 73-77 | NCAA D2, NAIA, or strong NJCAA D1 |
| 68-72 | NCAA D3 or NJCAA |
| Below 68 | NJCAA D2/D3 or CCCAA |

### Step 6: System Fit Projection
Compute projected system fit against target programs' offensive and defensive systems. Flag the systems where the recruit's archetype projects strongest.

## 4.3 Recruiting Star System Mapping

For context, map KR projections against the common 5-star recruiting scale:

| Stars | Projected KR Range | Description |
|-------|-------------------|-------------|
| 5-star | 90+ | Top 25 national recruit. Power 4 programs competing for her. |
| 4-star | 84-89 | Top 100-150 national recruit. Power 4 or top mid-major target. |
| 3-star | 78-83 | Solid D1 recruit. Mid-major or low-major D1 target. |
| 2-star | 72-77 | D2, NAIA, or bottom-tier D1 target. |
| 1-star | Below 72 | D3, NJCAA, or CCCAA target. |

## 4.4 Recruiting Output

```
RECRUITING EVALUATION
=====================
Player: [Name]
Club: [Club team] | High School: [HS]
Class: [20XX]
Position: [Current] (Projected: [Projected position if different])
Height: [X'X"] | Reach: [XX"] | Jump Touch: [XX"]

PROJECTED KR RANGE: [XX] - [XX]
Confidence: [XX]%
Data Tier: [V1 / Sub-V1]

PHYSICAL PROJECTION:
  Current height: [X'X"] | Projected adult: [X'X"-X'X"]
  Athletic profile: [Description]

COMPONENT KR PROJECTIONS:
  AKR: [XX-XX] | BKR: [XX-XX] | DKR: [XX-XX]
  SVR: [XX-XX] | SKR: [XX-XX] | IQKR: [XX-XX]

ARCHETYPE PROJECTION: [Projected archetype]

LEVEL FIT: [Best fit level]
  Reach: [Aspirational level if she develops fully]
  Floor: [Likely landing spot if development is average]

TOP SYSTEM FITS:
  Offense: [System 1] ([XX]% fit) | [System 2] ([XX]% fit)
  Defense: [System 1] ([XX]% fit) | [System 2] ([XX]% fit)

DEVELOPMENT NEEDS:
  1. [Primary development area]
  2. [Secondary development area]

COMPARISON PLAYERS: [Named players at the same level with similar profiles]

RECRUITING RECOMMENDATION:
  [For coaches: whether to offer, visit, monitor, or pass]
```

## 4.5 Pregnancy/Motherhood Considerations in Recruiting
Recruiting evaluations never penalize a player for pregnancy, maternity leave, or motherhood. If a recruit has a gap in her playing history due to pregnancy:
- Evaluate based on pre-pregnancy production and physical profile
- Do not speculate on future pregnancy
- Do not reduce projected KR or level fit
- Note the gap factually if it affects data availability (reduces confidence %)

---

# PART 5: ATHLETES UNLIMITED EVALUATION

Athletes Unlimited Volleyball uses a unique format (individual scoring, rotating captains, 4-set matches with point multipliers). The evaluation approach:

1. Individual stats are valid for per-set evaluation (kills/set, digs/set, etc.)
2. Team context is unstable (rosters change weekly) - reduce confidence by 10%
3. Player quality is generally high (most are current or former national team members)
4. Use AU stats as supplementary data, not primary, for KR evaluation
5. AU-only players (no other pro league experience) receive a maximum confidence of 65%

---

## GOVERNANCE

- All downstream engines consume upstream outputs. They NEVER modify Player KR, Team KR, or any upstream value.
- Development projections are estimates with stated confidence ranges, not guarantees.
- Pro salary projections are ranges based on current market data and will require periodic updating.
- Coaching Impact Score is a rolling metric that should be recomputed annually.
- Recruiting evaluation confidence is inherently lower than college evaluation confidence. Always state the wider range.
- Pregnancy/motherhood handling is mandatory and handled with care in all downstream contexts.
