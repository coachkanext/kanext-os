# MEN'S GOLF PLAYER EVALUATION REFERENCE
## File 02 - v1.0
## MEN'S BENCHMARKS ONLY

---

# OVERALL POSITION FRAMEWORK (OPF)

## OPF - Golfers

Golf has no positions. All golfers are evaluated on the same 5 component KRs with the same weights. OPF varies only between college and pro levels.

### COLLEGE OPF
- BKR (Ball-Striking): 35%
- SKR (Short Game): 30%
- CKR (Course Management): 15%
- MKR (Mental): 12%
- AKR (Athletic): 8%

### PRO OPF
- BKR (Ball-Striking): 30%
- SKR (Short Game): 30%
- CKR (Course Management): 18%
- MKR (Mental): 15%
- AKR (Athletic): 7%

### OPF Rationale
At the college level, ball-striking and short game together account for 65% because raw skill execution drives scoring. Course management and mental fortitude are less differentiated at lower levels. At the pro level, course management and mental performance gain weight because physical skill gaps compress and the ability to think, manage pressure, and make strategic decisions separates tiers.

---

# TRAIT LIBRARY

## 5 Clusters, 25 Traits

### CLUSTER 1: BALL-STRIKING (BKR)
Weight in BKR computation: each trait equally weighted within cluster unless data availability forces renormalization.

| # | Trait | V1 (Stats-Only) | V1+ (Golfstat+) | V2 (ShotLink) | Description |
|---|-------|-----------------|-----------------|---------------|-------------|
| 1 | Driving Distance | PROXY | TRUE | TRUE | Average distance off the tee. Proxy from course length performance in V1. |
| 2 | Driving Accuracy | PROXY | TRUE | TRUE | Fairways hit %. Proxy from GIR correlation in V1. |
| 3 | Greens in Regulation | TRUE | TRUE | TRUE | GIR %. Core ball-striking metric available at all tiers. |
| 4 | Approach Shot Quality | UNSCORED | PROXY | TRUE | Proximity to hole from various distances. Requires approach-level data. |
| 5 | Iron Play Consistency | UNSCORED | PROXY | TRUE | Dispersion and miss patterns with irons. Requires shot-level data. |
| 6 | Tee-to-Green Strokes Gained | UNSCORED | PROXY | TRUE | Strokes gained from tee to green. Requires ShotLink or equivalent. |

### CLUSTER 2: SHORT GAME (SKR)

| # | Trait | V1 | V1+ | V2 | Description |
|---|-------|-----|-----|-----|-------------|
| 7 | Putts Per Round | TRUE | TRUE | TRUE | Average putts per round. Available at all tiers. |
| 8 | One-Putt Percentage | UNSCORED | TRUE | TRUE | Frequency of one-putting. Requires putting detail. |
| 9 | Three-Putt Avoidance | UNSCORED | TRUE | TRUE | Three-putt frequency (lower is better). |
| 10 | Scrambling | PROXY | TRUE | TRUE | Up-and-down % when missing GIR. Proxy from bogey rate in V1. |
| 11 | Sand Save Percentage | UNSCORED | TRUE | TRUE | Bunker recovery rate. Requires bunker-specific data. |
| 12 | Putting Strokes Gained | UNSCORED | UNSCORED | TRUE | Strokes gained on the putting surface. Requires ShotLink. |

### CLUSTER 3: COURSE MANAGEMENT (CKR)

| # | Trait | V1 | V1+ | V2 | Description |
|---|-------|-----|-----|-----|-------------|
| 13 | Par-5 Scoring | TRUE | TRUE | TRUE | Average score on par-5s. Measures ability to capitalize on birdie opportunities. |
| 14 | Par-3 Scoring | TRUE | TRUE | TRUE | Average score on par-3s. Measures precision under pressure (no margin for error). |
| 15 | Big Number Avoidance | TRUE | TRUE | TRUE | Double bogey or worse frequency. Lower is better. Core management metric. |
| 16 | Birdie Conversion | TRUE | TRUE | TRUE | Birdies per round. Measures scoring ability. |
| 17 | Risk-Reward Decision Quality | UNSCORED | PROXY | TRUE | Quality of go/no-go decisions on reachable par-5s, driveable par-4s. |
| 18 | Bogey Recovery | PROXY | TRUE | TRUE | Frequency of bouncing back with birdie or par after bogey. Proxy from bogey-to-par sequences in V1. |

### CLUSTER 4: MENTAL (MKR)

| # | Trait | V1 | V1+ | V2 | Description |
|---|-------|-----|-----|-----|-------------|
| 19 | Final Round Performance | TRUE | TRUE | TRUE | Scoring differential in final rounds vs early rounds. Pressure indicator. |
| 20 | Round-to-Round Consistency | TRUE | TRUE | TRUE | Standard deviation of round scores. Lower = more consistent. |
| 21 | Comeback Ability | PROXY | TRUE | TRUE | Frequency of improving position from round to round when behind. |
| 22 | Close-Out Performance | PROXY | TRUE | TRUE | Performance when leading or in contention entering final round. |

### CLUSTER 5: ATHLETIC (AKR)

| # | Trait | V1 | V1+ | V2 | Description |
|---|-------|-----|-----|-----|-------------|
| 23 | Swing Speed | UNSCORED | PROXY | TRUE | Clubhead speed. Proxy from driving distance in V1+. |
| 24 | Endurance | PROXY | PROXY | TRUE | Performance maintenance across 4 rounds or multi-day events. Proxy from R4 scoring vs R1. |
| 25 | Injury Resilience | UNSCORED | UNSCORED | PROXY | History of playing through / recovering from golf-specific injuries. |

### Trait Scoring Notes
- All traits scored 0-100 or null (UNSCORED)
- UNSCORED traits contribute zero weight; remaining traits renormalize
- PROXY traits carry wider uncertainty bands than TRUE traits
- KLVN lambda is applied to production-based trait inputs before scoring

---

# ARCHETYPE LIBRARY

## 5 Golfer Archetypes

### 1. BOMBER
**Identity:** Power-dominant player who uses distance as a primary weapon. Attacks courses with length, turns par-5s into birdie machines, and shortens par-4s with driver.
**Component KR signature:** BKR significantly above SKR and CKR. Driving distance trait in top tier.
**Trait gates:**
- Driving Distance >= 85
- Par-5 Scoring >= 80
- BKR >= SKR + 8
**Strengths:** Long courses, reachable par-5s, wide fairways, soft conditions
**Weaknesses:** Tight courses, heavy rough, premium on accuracy, windy conditions (distance less valuable)
**College examples:** The player who averages 305+ off the tee and leads the team in eagles and par-5 birdies
**Pro archetype reference:** Bryson DeChambeau, Dustin Johnson (prime), Cameron Champ, Rory McIlroy

### 2. PRECISION PLAYER
**Identity:** Accuracy-first player who controls the ball, finds fairways, hits greens, and lets consistent ball-striking carry the scoring. Does not rely on distance.
**Component KR signature:** BKR driven by accuracy traits (driving accuracy, GIR) rather than distance. CKR elevated.
**Trait gates:**
- Driving Accuracy >= 85
- GIR >= 85
- Big Number Avoidance >= 85
**Strengths:** Tight courses, heavy rough, tree-lined fairways, firm conditions, links-style courses
**Weaknesses:** Courses where length is required to reach par-5s in two, wide-open bomb-friendly setups
**College examples:** The player who hits 70%+ fairways and 70%+ greens, rarely makes double bogey
**Pro archetype reference:** Matt Fitzpatrick, Corey Conners, Brian Harman, Zach Johnson

### 3. SHORT GAME WIZARD
**Identity:** Elite touch and feel around and on the greens. Scrambles at exceptional rates, converts putts at high percentages, and rescues rounds that ball-striking alone could not save.
**Component KR signature:** SKR significantly above BKR. Scrambling and putting traits dominant.
**Trait gates:**
- Scrambling >= 88
- Putts Per Round >= 85
- SKR >= BKR + 5
**Strengths:** Firm greens, heavy rough (scrambling matters more), courses with small/undulating greens, windy conditions (recovery more frequent)
**Weaknesses:** Courses where ball-striking to GIR is the only path to par (very long, very open)
**College examples:** The player who scrambles at 65%+ and averages under 29 putts per round
**Pro archetype reference:** Jordan Spieth, Phil Mickelson, Jason Day (short game peak years)

### 4. COMPLETE PLAYER
**Identity:** Balanced excellence across all phases of the game. No dominant weakness, competitive across all component KRs. The most valuable and rarest archetype.
**Component KR signature:** All 5 component KRs within 10 points of each other. No component below 80.
**Trait gates:**
- BKR >= 82
- SKR >= 82
- CKR >= 80
- MKR >= 78
- AKR >= 75
- Max component KR spread <= 12 (highest minus lowest)
**Strengths:** Adapts to any course. Consistent across conditions. No exploitable weakness.
**Weaknesses:** None structural. May not dominate bombers on long courses or wizards on greens-heavy courses, but always competitive.
**College examples:** The player who is top-3 on the team in driving, GIR, putting, and scrambling
**Pro archetype reference:** Scottie Scheffler, Tiger Woods (prime), Jon Rahm, Xander Schauffele

### 5. GRINDER
**Identity:** Mental toughness as the primary weapon. Does not have elite physical tools or flashy skills but maximizes every shot through course management, composure, and relentless consistency. Avoids big numbers, grinds out pars, and lets others make mistakes.
**Component KR signature:** MKR and CKR elevated relative to BKR and SKR. Big Number Avoidance elite.
**Trait gates:**
- MKR >= 83
- CKR >= 83
- Big Number Avoidance >= 88
- Round-to-Round Consistency >= 85
**Strengths:** Difficult conditions (wind, rain, firm), tournaments that punish mistakes, match play, pressure situations
**Weaknesses:** Birdie-heavy courses where aggressive play is rewarded, long courses that require power to keep up
**College examples:** The player who never shoots worse than 76 but rarely shoots better than 68 - steady, reliable, always counting
**Pro archetype reference:** Luke Donald (prime), Jim Furyk, Kevin Kisner, Russell Henley

---

# BADGE SPEC

## Badge System - Men's Golf

Badges certify elite skill expression within specific traits or trait clusters. They do not change trait scores, archetypes, or component KRs. Each badge carries a KR lift.

### Badge Tier Gates

| Tier | College Gate | Pro Gate | KR Lift |
|------|------------|---------|---------|
| Bronze | Component KR >= 90, key trait >= 90 | Component KR >= 93, key trait >= 93 | +0.5 |
| Silver | Component KR >= 94, key trait >= 94 | Component KR >= 96, key trait >= 96 | +1.0 |
| Gold | Component KR >= 97, key trait >= 97 | Component KR >= 98, key trait >= 98 | +1.5 |

Total badge lift cap: +3.5 KR.

### Badge Library (12 Badges)

| Badge | Component | Key Traits Required | Description |
|-------|-----------|-------------------|-------------|
| Dead-Eye | BKR | Driving Accuracy, GIR | Exceptional accuracy from tee to green |
| Bomber | BKR | Driving Distance, Swing Speed | Elite distance off the tee |
| Iron Master | BKR | Approach Shot Quality, Iron Play Consistency | Precision iron player |
| Flat Stick | SKR | Putts Per Round, Putting SG | Elite putter |
| Magician | SKR | Scrambling, Sand Save | Exceptional touch and recovery around greens |
| Eagle Eye | CKR | Par-5 Scoring, Birdie Conversion | Elite scoring on scoring holes |
| No Blow-Up | CKR | Big Number Avoidance, Bogey Recovery | Refuses to make big numbers |
| Closer | MKR | Final Round Performance, Close-Out | Elite under pressure in final rounds |
| Metronome | MKR | Consistency, Comeback Ability | Machine-like consistency round to round |
| Workhorse | AKR | Endurance, Injury Resilience | Physical durability across long seasons |
| Clutch Putter | SKR + MKR | Putts Per Round + Final Round Performance | Makes the putts that matter when it matters |
| Course Crusher | BKR + CKR | GIR + Par-5 Scoring + Big Number Avoidance | Dominates a course from tee to green with smart play |

---

# OVERRIDES

## Override System - Men's Golf

Overrides capture rare golf realities not fully expressed by traits, archetypes, or badges.

### College Positive Overrides (max 1 applies)

| Override | Trigger | KR Lift |
|----------|---------|---------|
| National Amateur Champion | Won US Amateur, NCAA Individual Championship, or other Tier-1 national amateur event | +3.0 |
| Multi-Win Season | 3+ individual tournament wins in a single college season at current level | +2.0 |
| Dominant Streak | 5+ consecutive tournaments with top-10 finish | +1.5 |
| Low-Round Ceiling | Shot 62 or lower in a competitive round at current level | +1.5 |
| Major Amateur Medalist | Qualified for or advanced deep in US Open/Open Championship as amateur | +2.5 |
| Match Play Dominance | Undefeated record in match play over full season (min 8 matches) | +1.0 |

### Pro Positive Overrides (max 1, each +1.0)

| Override | Trigger |
|----------|---------|
| Tour Winner | Won a PGA Tour/DP World Tour event in current season |
| Major Contender | Top-10 finish in a major championship in current season |
| Korn Ferry Graduate | Earned PGA Tour card through Korn Ferry Tour in current cycle |
| International Winner | Won a top-tier international event (Asian Tour Order of Merit event, Sunshine Tour flagship) |

### Pro Negative Overrides (always apply, cannot be overridden)

| Override | Trigger | KR Penalty |
|----------|---------|-----------|
| Missed-Cut Epidemic | Missed cut in 50%+ of starts (min 10 starts) | -2.0 |
| Collapse Pattern | Lost 3+ stroke lead in final round 2+ times in a season | -1.5 |
| Withdrawal Pattern | 3+ mid-tournament withdrawals in a season (non-injury) | -1.0 |

---

# SYSTEM RISKS

## System Risk Triggers - Men's Golf

Unlike team sports, golf "system risks" relate to course-type vulnerabilities and competitive format weaknesses rather than offensive/defensive scheme mismatches.

### Major Risks (College: -2.0 KR, Pro: -3.0 KR when triggered)

| Risk | Trigger | Description |
|------|---------|-------------|
| Distance Deficit | Driving distance bottom 25% at level AND par-5 scoring below average | Cannot compete on long courses. Par-5s become liabilities instead of scoring opportunities. |
| Green-Side Collapse | Scrambling below 50% AND three-putt rate above 5% | Falls apart around the greens. Missed GIR becomes automatic bogey or worse. |
| Pressure Meltdown | Final round scoring average 2+ strokes worse than R1-R3 average | Cannot close. Team cannot count on this player when it matters most. |
| Big Number Liability | Double-bogey-or-worse rate above 1.0 per round | One blow-up hole ruins entire rounds. Unreliable in best-4-of-5 team scoring. |

### Minor Risks (College: -1.0 KR, Pro: -1.5 KR when triggered)

| Risk | Trigger | Description |
|------|---------|-------------|
| Weather Fragility | Scoring average 3+ strokes worse in wind/rain events vs calm conditions | Conditions-dependent. Liability in spring tournaments with variable weather. |
| Slow Starter | R1 scoring average 1.5+ strokes worse than R2-R4 | Burns a stroke the team cannot recover in first rounds. |
| Course-Type Narrow | Top-20 finishes concentrated on one course type (all long OR all short) | Limited versatility. Cannot be counted on at diverse tournament venues. |
| Par-3 Bleeder | Par-3 scoring average 0.30+ strokes above field average at level | Gives back strokes on holes where the field makes par. Silent scoring leak. |
| Match Play Liability | Losing record in match play (min 6 matches) | Cannot be relied on in match play team formats. |

---

# IMPACT MODIFIERS

## Impact Modifier System - Men's Golf

Impact Modifiers classify HOW a golfer produces their value. They do not alter KR. One modifier per player.

### Modifier Library

| Modifier | Criteria | Description |
|----------|----------|-------------|
| Alpha Scorer | Leads team in scoring average AND top-10 finishes | The go-to scorer. Team's scoring engine. |
| Steady Eddie | Lowest standard deviation on team AND counting score 80%+ of rounds | The reliable counter. Always posts a number the team can use. |
| Momentum Builder | Best R1 scoring average on team | Gets the team off to good starts. First-round reliability. |
| Closer | Best final round scoring average on team | Finishes strong. Brings the score home. |
| Swiss Army Knife | Top-3 on team in 3+ of: driving distance, GIR, scrambling, putting | Does everything well. Fills any gap in the lineup. |
| X-Factor | Highest variance (highest high and lowest low) on team | Capable of shooting lights-out or blowing up. Upside play when team needs a miracle. |
| Unclassified | Does not meet criteria for any modifier | No clear impact profile established. |
| Unclassified (Low Sample) | Fewer than 8 competitive rounds in current season | Insufficient data to classify impact mode. |

---

# KLVN - LEVEL NORMALIZATION (COLLEGE)

## How College Golf Lambdas Work

Lambda normalizes INPUTS (production stats) during trait scoring so that a golfer's KR reflects actual ability regardless of competitive level. NCAA D1 Power Conference is the reference point at lambda = 1.000.

When evaluating a college golfer:
1. Identify their level and conference
2. Look up the level lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the appropriate level's legend

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

### College Lambda Table (v1)

| Rank | Level | Key | Lambda | Calibration | Legend File |
|------|-------|-----|--------|-------------|-------------|
| 1 | NCAA D1 Power | ncaa_d1_power | 1.000 | Reference | Legend_NCAA_D1_MGolf_v1.md |
| 2 | NCAA D1 Mid-Major | ncaa_d1_mid | 0.925 | Estimate | Legend_NCAA_D1_MGolf_v1.md (adjusted reads) |
| 3 | NCAA D1 Low-Major | ncaa_d1_low | 0.860 | Estimate | Legend_NCAA_D1_MGolf_v1.md (adjusted reads) |
| 4 | NCAA D2 | ncaa_d2 | 0.820 | Estimate | Legend_NCAA_D2_MGolf_v1.md |
| 5 | NAIA | naia | 0.740 | Estimate | Legend_NAIA_MGolf_v1.md |
| 6 | NCAA D3 | ncaa_d3 | 0.710 | Estimate | Legend_NCAA_D3_MGolf_v1.md |
| 7 | NJCAA D1 | njcaa_d1 | 0.700 | Estimate | Legend_NJCAA_MGolf_v1.md |
| 8 | NJCAA D2 | njcaa_d2 | 0.620 | Estimate | Legend_NJCAA_MGolf_v1.md (adjusted reads) |
| 9 | NJCAA D3 | njcaa_d3 | 0.540 | Estimate | Legend_NJCAA_MGolf_v1.md (adjusted reads) |

### Normalization Example
A golfer at NAIA averaging 73.0 (lambda 0.740). The normalized input for trait scoring would reflect that 73.0 at NAIA is not the same as 73.0 at D1 Power. The lambda adjusts the production input so trait scores reflect the actual difficulty of the achievement. A 73.0 at NAIA on courses rated 71.5 is meaningfully different from a 73.0 at D1 Power on courses rated 73.5.

### Course Difficulty Double-Adjustment Note
KLVN lambda captures LEVEL difficulty (quality of competition, tournament field strength). Course difficulty (course rating/slope) is a SEPARATE adjustment applied within trait scoring. These are independent: a hard course at NAIA is still at a lower competitive level than an easy course at D1 Power, but the course difficulty adjustment ensures the golfer is not penalized for playing a difficult home course.

### D1 Conference Class Mapping (2025-26 Season)

#### Power Conferences (lambda = 1.000)
- SEC
- ACC
- Big 12
- Big Ten
- Pac-12 (or successor)

#### Mid-Major Conferences (lambda = 0.925)
- American (AAC)
- Sun Belt
- Conference USA
- Colonial Athletic Association (CAA)
- Missouri Valley Conference (MVC)
- West Coast Conference (WCC)
- Atlantic 10 (A-10)
- Mountain West (MWC)

#### Low-Major Conferences (lambda = 0.860)
- All other D1 conferences not listed above
- Northeast Conference (NEC)
- Patriot League
- Ivy League
- Horizon League
- MAAC
- America East
- Big South
- Southland
- Summit League
- MEAC
- SWAC

---

# KLVN - LEVEL NORMALIZATION (PRO)

## How Pro Golf Lambdas Work

Same function as college lambdas but for the professional ecosystem. PGA Tour is the reference point at lambda = 1.000.

### Pro Lambda Table (v1)

| Rank | Level | Key | Lambda | Calibration |
|------|-------|-----|--------|-------------|
| 1 | PGA Tour | pga_tour | 1.000 | Reference |
| 2 | LIV Golf | liv_golf | 0.960 | Estimate (comparable talent, shorter fields, no cut) |
| 3 | DP World Tour | dp_world | 0.920 | Estimate |
| 4 | Korn Ferry Tour | korn_ferry | 0.880 | Estimate |
| 5 | PGA Tour Americas | pga_americas | 0.780 | Estimate |
| 6 | Japan Golf Tour | japan_tour | 0.820 | Estimate |
| 7 | Asian Tour | asian_tour | 0.760 | Estimate |
| 8 | Sunshine Tour | sunshine | 0.720 | Estimate |
| 9 | Challenge Tour (DP World dev) | challenge | 0.740 | Estimate |
| 10 | PGA Tour Canada | pga_canada | 0.700 | Estimate |
| 11 | Latin America Tour | lat_am | 0.640 | Estimate |
| 12 | Mini-tours (US) | mini_tour | 0.580 | Estimate |

### LIV Golf Lambda Note
LIV Golf is rated at 0.960 rather than 1.000 despite having top-tier talent because: shorter fields (48 vs 144-156 on PGA Tour), no cut line (all players complete 54 holes), 54-hole events vs 72-hole events (less variance, less endurance demand), and limited course rotation. The talent at the top of LIV is PGA-level, but the competitive structure provides structural advantages that inflate scoring averages.

---

# COLLEGE PLAYER KR LEGENDS

See separate legend files for full tier descriptions:
- Legend_NCAA_D1_MGolf_v1.md
- Legend_NCAA_D2_MGolf_v1.md
- Legend_NCAA_D3_MGolf_v1.md
- Legend_NAIA_MGolf_v1.md
- Legend_NJCAA_MGolf_v1.md

---

# PRO PLAYER KR LEGEND

See separate file: Pro_MGolf_KR_Legend_v1.md

---

# SCORING AVERAGE BENCHMARKS (MEN'S ONLY)

## NCAA D1 Power Conference Benchmarks (2025-26 reference)

| Tier | Adjusted Scoring Avg (relative to par) | Context |
|------|---------------------------------------|---------|
| Elite (KR 95+) | Under par to +0.5 | National Player of the Year contenders. Jack Nicklaus Award finalists. |
| High-Impact (KR 90-94) | +0.5 to +1.5 | All-American caliber. Top players on ranked teams. |
| Strong Starter (KR 86-89) | +1.5 to +2.5 | Solid counting players on competitive teams. All-Conference range. |
| Lineup Regular (KR 82-85) | +2.5 to +3.5 | Top-5 contributor. Reliable counter most rounds. |
| Fringe Lineup (KR 78-81) | +3.5 to +5.0 | Competes for 5th spot. Sometimes counts, sometimes does not. |
| Roster Depth (KR 74-77) | +5.0 to +7.0 | On the team but rarely in tournament lineup. Practice player. |
| Below Viability (below 74) | +7.0 or worse | Below competitive threshold at this level. |

## PGA Tour Benchmarks (2025-26 reference)

| Tier | Scoring Avg (relative to par) | Context |
|------|------------------------------|---------|
| Elite (KR 95+) | Under par to -1.5 | Multiple wins. Major contender. Top-10 in world. |
| Tour Anchor (KR 90-94) | -0.5 to +0.5 | Consistent top-25 finishes. Keeps full card comfortably. |
| Solid Tour Pro (KR 85-89) | +0.5 to +1.0 | Makes most cuts. Occasional top-10. |
| Card Holder (KR 80-84) | +1.0 to +2.0 | Keeps card but marginal. Bubble territory. |
| Fringe Tour (KR 75-79) | +2.0 to +3.0 | Conditional status. Korn Ferry/Q-School cycle. |
| Below PGA Viability (below 75) | +3.0 or worse | Cannot maintain PGA Tour status. |
