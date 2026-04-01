# SOFTBALL DOWNSTREAM ENGINES
## File 06 - v1.0 (Full Operational Spec)

---

# DEVELOPMENT INTELLIGENCE ENGINE (LOCKED)

## 0. Purpose
Takes everything the system knows about a player and translates it into actionable development, placement, and decision-making intelligence. This engine does NOT evaluate players. It reads governed truth and produces downstream recommendations only.

## 1. Consumers
- The player, current coach, recruiting coordinators, portal decision-makers, JUCO/prep advisors, pro scouts, national team selectors

## 2. MUST PULL (Inputs)
A) Player Identity + Record (from Profile)
B) Player KR Outputs (truth): Overall KR, Base KR, Final System KR, component KRs, confidence_pct
C) Archetype + Badges + Impact Modifiers + System Risks
D) Full System Fit Profile (fit scores for all 5 offensive systems or 5 pitching philosophies)
E) Trait Scores (raw, with unscored flags)
F) Level Interpretation (Level Tier Map)

## 3. Outputs

### OUTPUT A: Truth Summary - "Where Are You Now?"
KR, component breakdown, archetype, badges, system risks. Level Tier Map. System fit rankings. Key stat profile.

### OUTPUT B: Placement Targeting - "Where Should You Be?"
Best-fit programs ranked by: level match, system fit, positional need, competitive context, conference strength, park factor.

### OUTPUT C: Player Value - "What Are You Worth?"
Per target: scholarship allocation recommendation, lineup/circle impact (projected Team KR lift), replacement value.

### OUTPUT D: Gap Analysis - "What's Holding You Back?"
Per component KR: highest-leverage trait improvement, current score, target score, KR impact, difficulty rating.

**Hitter development difficulty ratings:**
- Contact rate improvement: Moderate (approach work)
- Power development: Hard (peaks age 22-26 for women)
- Plate discipline: Easy-to-Moderate (most coachable skill)
- Speed improvement: Physical ceiling (speed peaks by age 20-21)
- Fielding improvement: Moderate (range is physical, reliability is coachable)
- Arm strength: Physical ceiling
- Slap development: Moderate (can be taught to LHB with speed, 6-12 months for competency)
- Slap refinement (adding varieties): Moderate-to-Hard (12-18 months for elite-level slap variety)

**Pitcher development difficulty ratings:**
- Speed improvement: Hard (1-2 mph possible through mechanics/strength, more requires physical development)
- Command improvement: Moderate (improves through repetition)
- Adding a pitch: Moderate-to-Hard (6-12 months for a new pitch in softball, shorter than baseball because underhand mechanics are simpler to replicate)
- Rise ball development: Hard (requires specific spin rate and release, not all pitchers can develop a true rise)
- Durability improvement: Moderate (workload management, S&C, recovery protocols)
- Platoon resistance: Moderate (requires secondary pitch development to opposite hand)
- Pitch sequencing / IQ: Easy-to-Moderate (experience-driven)

### OUTPUT E: Development Roadmap - "What's the Path?"
1. Primary development priority
2. Secondary priority
3. 3-month / 6-month / 12-month milestones
4. Specific training focus areas

**Hitter development tracks:**
- Approach refinement: pitch recognition, two-strike approach, count leverage
- Power development: bat speed training, rotational power, strength work
- Contact improvement: tee work, soft toss, live-pitch repetition
- Speed/baserunning: sprint technique, lead optimization, steal timing
- Slap development (SOFTBALL-SPECIFIC): slap technique instruction (soft slap, hard slap, drag bunt), left-side of infield ground ball placement, running start timing
- Defensive improvement: footwork, throwing mechanics, position-specific work

**Pitcher development tracks:**
- Speed development: long-toss equivalent, resistance training, hip drive mechanics
- New pitch development: grip experimentation, bullpen sessions, in-game progression
- Rise ball development (SOFTBALL-SPECIFIC): backspin rate training, release point consistency, wrist snap mechanics
- Drop ball development: topspin training, release angle adjustment
- Command refinement: location work, tunneling awareness, tempo consistency
- Durability building: progressive workload increase, recovery protocols, arm care
- Pitcher IQ: hitter film study, sequencing instruction, tournament energy management

### OUTPUT F: Competitive Landscape - "Who Else Is Out There?"
Comparable players at same level, position, and KR range.

## 4. Transfer Portal Intelligence

### Portal Value Scoring
Portal_Value = (KR_Fit x 0.35) + (System_Fit x 0.25) + (Positional_Scarcity x 0.15) + (Immediate_Readiness x 0.15) + (Eligibility_Factor x 0.10)

### Portal Risk Factors
- Level-up risk: JUCO -> D1 Power transfers have adjustment period
- System mismatch: slapper from Slap-and-Run system transferring to Power/Launch team
- Role change: ace at prior school may be #2 at new school
- Pregnancy/motherhood return: player returning from pregnancy leave entering portal - evaluate pre-pregnancy KR as talent anchor

## 5. Redshirt / Academic Year Decision
Redshirt when: KR < 78, freshman with physical projection, returning from injury, academic transition needed.
Do NOT redshirt when: KR >= 82, junior/senior, immediate roster need, flat development curve.

---

# PRO TRANSITION INTELLIGENCE ENGINE

## 0. Purpose
Translates college softball evaluation into professional projection.

## 1. CRITICAL SOFTBALL DISTINCTION

**Entry KR = Professional starting point (immediate, not after minor league development).**

Unlike baseball, there is no minor league system in professional softball. Players go directly from college to professional competition (Athletes Unlimited, WPF) or international leagues (Japan, Australia, Italy). The transition is more like basketball than baseball - immediate professional play.

However, the professional softball market is MUCH smaller than NBA or MLB:
- Total professional roster spots in US domestic leagues: approximately 100-150
- Average professional salary: significantly below livable wage for most players
- Career length: most professional careers are 2-5 years
- Many elite college players never play professionally because the financial model doesn't support it
- Olympic pathway is the highest-profile professional opportunity

## 2. Inputs
College KR + traits, pro OPF, pro system risks/overrides, physical profile, draft/selection context.

## 3. Outputs

### OUTPUT G: Pro Projection KR (Entry)

**G1) Pro KR Identity Card**
- Pro Entry KR (the player's immediate professional value)
- Confidence %
- Pro component KRs with pro positional weights
- College KR -> Pro Entry KR delta with explanation

**G2) College-to-Pro Adjustment**
Softball's college-to-pro transition involves:
- SAME ball size (12 inch)
- SAME field dimensions (60-foot bases, 43-foot pitching distance)
- SAME pitching style (underhand)
- Higher-quality opposition consistently (every opponent is elite)
- No aluminum bat adjustment needed (softball uses composite bats at all levels, with some leagues using specific ball/bat combinations)
- Adjustment is primarily about COMPETITION QUALITY, not equipment or physical changes

Typical adjustment: college KR translates closely to pro Entry KR with a -3 to -8 point adjustment for competition quality increase (D1 Power to professional).

**G3) Pro KR Legend Interpretation**
Map Entry KR to Pro Legend. Display tier label.

### OUTPUT H: Development Timeline

**H1) Professional Career Path**
- Year 1: Adjustment year. Learning professional competition level.
- Year 2-3: Peak performance window. Best years.
- Year 4-5: Sustained or declining. Career decisions.
- Beyond: exceptional athletes only.

**H2) Peak KR Projection**
- Hitters: peak age 23-27
- Pitchers: peak age 22-26 (pitching durability is the limiting factor)
- Peak KR = Entry KR + development ceiling (max +8 KR over 3 years - shorter window than baseball)

### OUTPUT I: Peak KR + Scenario Branching
Peak scenario, floor scenario, key variable. Both ALWAYS shown.

### OUTPUT J: Key Development Variable
**Hitter:** Can she hit professional-level pitching consistently? Adjust to elite speed and spin?
**Pitcher:** Can she sustain workload against professional-level lineups? Maintain stuff as body ages?

### OUTPUT K: Pro Pathway Analysis (SOFTBALL-SPECIFIC)

**K1) Domestic Professional Options**
- **Athletes Unlimited Softball:** Individual player-driven format. Players drafted each week by team captains. Performance-based compensation. Higher average salary than traditional leagues. Most visible domestic league.
- **Women's Professional Fastpitch (WPF):** Team-based traditional format. Lower salary but more traditional experience.
- Legacy: NPF (National Pro Fastpitch) folded. Athletes Unlimited emerged as primary domestic option.

**K2) International Professional Options**
- **Japan Softball League (JSL):** Highest-paying international option. 12 teams. Strong competition level. Corporate-sponsored teams. Some players earn $50K-$100K+. Lambda: 0.900.
- **Australian Softball League:** Growing competition. Off-season option (November-February). Lambda: 0.700.
- **Italian Softball League:** Top European league. Lambda: 0.650.
- **Mexican Softball League:** Emerging. Lambda: 0.620.

**K3) Olympic Pathway (SOFTBALL-SPECIFIC - HIGH PRIORITY)**
- Softball returns to Olympics in 2028 (Los Angeles). This is the highest-profile opportunity in women's softball.
- USA Softball national team selection is intensely competitive. Approximately 15-20 roster spots.
- Olympic cycle training: 2-3 years of national team camps, international competitions, and selection events.
- Players on Olympic trajectory may prioritize national team over domestic pro league schedule.
- International competition experience (World Championship, Pan American Games) is a critical development pathway.
- KR threshold for USA Softball consideration: approximately KR >= 90 at college level, with pro-adjusted KR >= 85.

**K4) Org/League Fit Analysis**
Per league option: system alignment, playing time projection, salary range, development quality, visibility/exposure.

---

# COACHING IMPACT MODIFIER - v1.0 (LOCKED)

## 1. Purpose
Computes coaching-attributable player development residuals. Modifies development PROJECTIONS only - never current KR.

## 2. Softball-Specific Coaching Hierarchy

**Pitching coach quality is the single most impactful coaching variable in softball.** Even more impactful than in baseball because the ace pitches 60-70% of all innings - the pitching coach's influence on that one player determines the team's ceiling.

### Coach Impact Categories

**Pitching Development:**
- Speed development: hip drive mechanics, resistance training, delivery efficiency
- Spin development: rise ball spin rate improvement, drop ball depth, screwball action
- New pitch development: grip experimentation, bullpen sessions
- Tournament management: workload pacing, energy conservation, recovery protocols
- Command refinement: location work, tunneling instruction

**Hitting Development:**
- Approach refinement: pitch recognition, count leverage, two-strike approach
- Power development: bat speed, rotational mechanics, strength training
- Slap development (SOFTBALL-SPECIFIC): slap technique coaching is a specialized skill. Not all hitting coaches can teach it. Programs with dedicated slap instruction develop elite slappers at a higher rate.
- Contact improvement: tee work, live-pitch repetition

**Position-Specific:**
- Catcher development: blocking (critical for rise ball), receiving, throwing, game-calling
- Infield development: footwork, slap defense positioning, double-play turns
- Outfield development: routes, reads, arm accuracy

## 3. Coaching Residual Computation
Residual(P, C, cluster) = Actual_Delta(P, cluster) - Baseline_Delta(cluster, age, position, level)

### Baseline Development Curves (Softball-Specific)

**Hitter Development by Age:**
- Age 17-19: Rapid improvement. +4-8 points per cluster per year. Mechanics solidifying.
- Age 20-22: Moderate improvement. +2-4 points. Approach maturing. Power emerging.
- Age 23-25: Peak zone. +1-2 points. Refinement.
- Age 26-28: Peak to slight decline. +/- 1 point.
- Age 29+: Decline begins. Speed first, then contact.

**Pitcher Development by Age:**
- Age 17-19: Speed development window. +2-3 mph possible. Spin development. +3-6 points per cluster.
- Age 20-22: Prime development. Speed peaks 21-24 for most pitchers. Spin matures. +2-4 points.
- Age 23-25: Command peak. Speed stable or slight decline. +1-2 points.
- Age 26+: Decline phase. Must compensate for lost speed with craft/IQ.

**Injury Recovery (Softball-Specific):**
- Shoulder injury: 3-6 months recovery. KR drops 8-15 points immediately. Most recover within 1-2 seasons.
- UCL/elbow (rare in underhand pitching but occurs): 6-12 months. Recovery rate higher than baseball TJ.
- Knee injury (ACL): 9-12 months. Impacts speed traits first. Most athletes return to 90-95% within 2 seasons.
- **Pregnancy/postpartum recovery:** 6-18 months full return. Physical traits (speed, power) return progressively. Most elite athletes return to pre-pregnancy KR within 1-2 competitive seasons. Not an injury - a life event. Development trajectory resumes, not restarts.

## 4. Elite Development Programs (Softball)

### Tier 1 - Elite (Modifier: +1.5 to +3.0 KR development acceleration)
- **Oklahoma:** Dynasty program. Patty Gasso. Consistently produces USA Softball players. Elite pitching and hitting development.
- **UCLA:** Premier West Coast program. Develops complete players. Strong Olympic pipeline.
- **Alabama:** SEC powerhouse. Develops power hitters and elite pitchers.
- **Florida State:** Consistent WCWS contender. Strong pitching development.

### Tier 2 - Strong (Modifier: +0.5 to +1.5)
- **Florida, Arizona, Texas, Washington, LSU, Virginia Tech, Stanford, Oregon**

### Tier 3 - Average (Modifier: 0.0 to +0.5)
Most programs.

### Tier 4 - Below Average (Modifier: -0.5 to -1.0)
Programs with poor development track records. Not named (changes year-to-year).

## 5. Evidence Thresholds

| Threshold | Minimum | Below Minimum |
|---|---|---|
| Player-seasons under coach | 8 | Modifier inactive |
| Unique players | 4 | Modifier inactive |
| Consecutive seasons per player | 2 | Player excluded |
| AB (hitters) / IP (pitchers) per season | 75 AB / 50 IP | Player excluded |

## 6. Application Rules
- CIP modifies TRAJECTORY only, not current KR
- Pitching coach CIP is PRIMARY for pitcher development (weighted 2x vs HC)
- Hitting coach / slap coach CIP is PRIMARY for hitter development
- CIP recomputed annually
- No single player-season > 15% of total weight

---

## GOVERNANCE
- Development Intelligence Engine reads governed truth only
- Pro Transition Engine: no minor league pipeline (direct college-to-pro)
- Olympic pathway is a first-class output
- Pregnancy/motherhood recovery is a recognized development trajectory event, not an injury
- All trajectory projections show upside and downside
- Max trait improvement: +12 KR points over 3 years (shorter pro window than baseball)
- Max trait improvement per year: +5 points
- Coaching Impact Modifier is additive to trajectory only
- Pitching coach is the most impactful coaching variable
