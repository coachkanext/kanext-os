# BASEBALL DOWNSTREAM ENGINES
## File 06 -- v2.0 (Full Operational Spec)

---

# DEVELOPMENT INTELLIGENCE ENGINE (LOCKED)

## 0. Purpose
Takes everything the system knows about a player and translates it into actionable development, placement, and decision-making intelligence. Answers five questions for any evaluated player.

This engine does NOT evaluate players. It reads governed truth and produces downstream recommendations only. All outputs are deterministic.

## 1. Consumers
- The player: "Where should I transfer? What should I work on?"
- The player's current coach: "How do I develop this player? What's his ceiling?"
- Recruiting coordinators: "Does this player fit our system? What's he worth?"
- Transfer portal decision-makers: "Which portal players improve our Team KR most?"
- JUCO/Prep advisors: "What level should this kid play at?"
- Pro scouts: "Where does this player project professionally?"

## 2. MUST PULL (Inputs)

### A) Player Identity + Record
From Player Profile: name, career history, eligibility, class year, age, bats/throws, transfer portal status, draft eligibility status, wood bat experience.

### B) Player KR Outputs (Truth)
Overall Player KR, Base KR, Final System KR, component KRs (hitter or pitcher pipeline), confidence_pct, evaluation mode, data tier.

### C) Archetype + Badges + Impact Modifiers + System Risks
Primary/secondary archetypes, badge list, impact modifier, active system risks.

### D) Full System Fit Profile
Hitters: system fit scores for ALL 5 offensive systems.
Pitchers: philosophy fit scores for ALL 5 pitching philosophies.

### E) Trait Scores (Raw)
All scored traits with values, unscored flags, cluster summaries, data source per trait.

### F) Level Interpretation
KR read against every level legend (Level Tier Map).

## 3. Outputs

### OUTPUT A: Truth Summary -- "Where Are You Now?"
Player identity card:
- KR, component breakdown, archetype, badges, system risks
- Level Tier Map (what this player IS at every relevant level)
- System fit rankings across all 5 systems (offense) or 5 philosophies (pitching)
- Key stat profile with level context

### OUTPUT B: Placement Targeting -- "Where Should You Be?"
Best-fit programs ranked by:
1. Level match (KR maps to starting role at target level)
2. System fit (offensive system or pitching philosophy alignment)
3. Positional need (does program need this position/role?)
4. Competitive context (program trajectory: rising vs declining)
5. Conference strength (SOS at target program)
6. Park factor (for hitters: park dimensions and environment at target)

### OUTPUT C: Player Value -- "What Are You Worth?"
Per target:
- Scholarship allocation recommendation (% of equivalency this player merits)
- Lineup/rotation impact (projected Team KR lift)
- Draft stock context (if draft-eligible: projected round/selection based on File 02 Pro Legend)
- Replacement value (what team loses if this player leaves)

### OUTPUT D: Gap Analysis -- "What's Holding You Back?"
Per component KR, identify highest-leverage trait improvement:
- Trait name, current score, target score for next tier
- KR impact if trait reaches target
- Difficulty rating: Easy (1 season), Moderate (2 seasons), Hard (3+ seasons), Physical ceiling (unlikely to change)

**Hitter development difficulty ratings:**
- Contact rate improvement: Moderate (can be taught through approach work)
- Power development: Hard (largely physical; peaks at age 26-28)
- Plate discipline improvement: Easy-to-Moderate (one of the most coachable skills)
- Speed improvement: Physical ceiling (speed doesn't improve significantly past age 22)
- Fielding improvement: Moderate (range is physical, reliability is coachable)
- Arm strength: Physical ceiling
- Baserunning IQ: Easy (experience and coaching)

**Pitcher development difficulty ratings:**
- Velocity improvement: Hard (1-2 mph possible through mechanics/strength, more requires physical development years)
- Command improvement: Moderate (improves through repetition and maturity through late 20s)
- Adding a pitch: Hard (12-18 months to develop a quality new pitch)
- Durability improvement: Moderate-to-Hard (workload management, mechanics, S&C)
- Platoon resistance: Moderate (requires offspeed development to same-side hitters)
- Pitch sequencing / IQ: Easy-to-Moderate (experience-driven, coachable)

### OUTPUT E: Development Roadmap -- "What's the Path?"
Prioritized development plan:
1. Primary development priority (highest-leverage trait improvement)
2. Secondary priority
3. 3-month / 6-month / 12-month milestones
4. Specific training focus areas

**Hitter development tracks:**
- Approach refinement: pitch recognition drills, two-strike approach work, count leverage training
- Power development: bat speed training, launch angle optimization, weight room focus on rotational power
- Contact improvement: tee work, soft toss variations, wood bat training
- Speed/baserunning: sprint technique, lead optimization, read development, steal timing
- Defensive improvement: footwork drills, throwing mechanics, position-specific work, game reps

**Pitcher development tracks:**
- Velocity development: long toss program, weighted ball protocol (Driveline/similar), lower half mechanics, S&C programming
- Secondary pitch development: grip experimentation, bullpen sessions (50+ throws of new pitch), in-game usage progression (show -> competitive -> primary)
- Command refinement: targeted location work, pitch tunneling awareness, tempo/rhythm consistency
- Durability building: progressive workload increase, recovery protocol, pitch count management, arm care program
- Pitcher IQ: hitter film study, pitch sequencing instruction, situational awareness coaching

### OUTPUT F: Competitive Landscape -- "Who Else Is Out There?"
Players at same level, position, and KR range:
- Comparable portal players
- Comparable recruits in current class
- How the player stacks against alternatives

## 4. Transfer Portal Intelligence

### Portal Value Scoring
For each portal player, compute:
- KR fit score: does the player's KR fill a need in the target team's lineup/rotation?
- System fit score: alignment with target team's offensive system or pitching philosophy
- Positional scarcity: is this position hard to fill?
- Immediate readiness: can this player contribute immediately (vs development needed)?
- Eligibility remaining: 1 year left = low investment ceiling, 3 years = high ceiling

Portal_Value = (KR_Fit x 0.35) + (System_Fit x 0.25) + (Positional_Scarcity x 0.15) + (Immediate_Readiness x 0.15) + (Eligibility_Factor x 0.10)

### Portal Risk Factors
- Level-up risk: JUCO -> D1 Power transfers fail at ~40% rate (competition jump)
- Level-down risk: D1 -> D2/NAIA transfers usually succeed at higher rate (competition easier)
- System mismatch: player thrived in Contact/Speed system, transferring to Launch Angle/Power team = adjustment needed
- Role change: starter at prior school, may be platoon/bench at new school

## 5. Redshirt / Academic Year Decision

### When to Redshirt (Preserve Eligibility Year)
- Player's current KR < 78 at their level (not ready to contribute)
- Freshman with physical projection (height/weight still developing)
- Pitcher returning from injury (TJ rehab year)
- Academic transition needed (transfer student adjusting)
- KR trajectory steep upward (player improving rapidly, extra development year valuable)

### When NOT to Redshirt
- Player's KR >= 82 (can contribute now)
- Player is junior or senior (limited remaining time)
- Program has immediate roster need at player's position
- Player's development curve is flat (another year won't change trajectory)

---

# MINOR LEAGUE PROGRESSION ENGINE

## Purpose
Track and project a professional player's development through the minor league system from draft to MLB.

## Minor League Level Hierarchy

| Level | Lambda | Age Range (Typical) | Purpose |
|-------|--------|-------------------|---------|
| Complex / DSL / Rookie | 0.400-0.450 | 17-19 | First pro experience. Instruction focus. |
| Single-A | 0.600 | 19-21 | Full-season ball. Mechanical refinement. |
| High-A | 0.660 | 20-22 | Advanced A-ball. Facing quality arms/hitters. |
| AA (Double-A) | 0.720 | 21-24 | "Make or break" level. Best MLB readiness indicator. |
| AAA (Triple-A) | 0.780 | 22-27 | Final step. Near-MLB competition. MLB shuttle. |
| MLB | 1.000 | 23-40 | Major leagues. |

## Promotion Triggers

### Promote When:
- Player is **dominating** current level for >= 200 AB (hitters) or >= 50 IP (pitchers)
- Domination indicators (hitters): BA >= .300, OPS >= .900, wRC+ >= 140 at level for sustained period
- Domination indicators (pitchers): ERA <= 2.50, K/9 >= 10.0, WHIP <= 1.00 at level for sustained period
- Age-appropriate: player is at or below median age for current level
- No development goals remaining at this level

### Hold When:
- Player is **performing well but not dominating**: BA .270-.300, OPS .780-.899 (hitters) or ERA 2.50-3.50, K/9 8.0-9.9 (pitchers)
- Specific development goal not yet achieved (e.g., "add changeup" for pitcher, "reduce K rate" for hitter)
- Player is young for level (ahead of schedule, no rush)

### Demote When:
- Player is **struggling significantly** for >= 100 AB or >= 30 IP at level
- Struggle indicators (hitters): BA <= .220, OPS <= .650, K% >= 30%
- Struggle indicators (pitchers): ERA >= 5.00, BB/9 >= 5.0, WHIP >= 1.50
- Mental health / confidence concerns require lower pressure environment
- Exception: do NOT demote for small samples (< 50 AB or < 15 IP) -- slumps are normal

## Level-Appropriate Development Goals

### Complex / Rookie Ball
- Learn pro routine (daily schedule, nutrition, recovery)
- Hitters: refine swing mechanics, adjust to wood bat, learn to track velocity
- Pitchers: establish consistent delivery, develop secondary pitch, build arm strength

### Single-A
- Hitters: develop plate discipline, learn to hit breaking balls, establish approach identity
- Pitchers: command primary pitch, throw secondary for strikes, build innings/pitch count endurance
- Both: compete against quality opponents for first time, learn to adjust to failure

### High-A
- Hitters: prove power translates to advanced competition, demonstrate defensive consistency
- Pitchers: develop putaway pitch, demonstrate ability to get through lineup twice effectively
- Both: facing older, more polished opponents. Separates prospects from org filler.

### AA (Double-A)
- **THE critical level.** Performance here is the best predictor of MLB success.
- Hitters: compete vs near-MLB pitching, demonstrate bat-to-ball with wood, maintain approach under pressure
- Pitchers: face advanced hitters who don't chase, demonstrate command consistency, prove durability
- Rule of thumb: if a player can succeed at AA, they can likely succeed in MLB.

### AAA (Triple-A)
- Fine-tuning, not development. Player should be near-complete.
- Hitters: optimize approach, handle MLB-caliber breaking balls, prove consistency over full season
- Pitchers: dial in game-calling, refine sequencing vs advanced hitters, demonstrate 5th-6th inning durability
- Many AAA players shuttle to/from MLB. AAA is the "on deck" circle for the big leagues.

---

# PRO TRANSITION INTELLIGENCE ENGINE

## 0. Purpose
Translates college baseball evaluation into professional projection. Accounts for the 3-5 year minor league development timeline unique to baseball.

## 1. CRITICAL BASEBALL DISTINCTION

**Entry KR = Minor League starting point, NOT MLB Day 1 value.**

A first-round college hitter starts at High-A or AA, not MLB. Their Entry KR reflects what they are when they first enter professional baseball. Peak KR reflects their projected MLB ceiling after 3-5 years of development.

This is fundamentally different from basketball, where Entry KR = NBA Day 1 value.

## 2. Inputs
Same as basketball Pro Transition Engine: college KR + traits, pro OPF, pro system risks/overrides, physical profile, draft context. PLUS:
- Wood bat data (if available from Cape Cod, summer leagues, showcases)
- Arm injury history (critical for pitchers -- TJ surgery adds 12-18 months to timeline)
- Mechanical assessment (effort delivery for pitchers = injury risk flag)

## 3. Outputs

### OUTPUT G: Pro Projection KR (Entry)

**G1) Pro KR Identity Card**
- Pro Entry KR: [value] ([range])
- Projected Starting Level: [Complex / A / High-A / AA / AAA]
- Confidence: [%]
- Pro component KRs with pro positional weights applied
- College KR -> Pro Entry KR delta with explanation

**G2) Aluminum-to-Wood Bat Adjustment (Hitters Only)**
Mandatory for all college hitter pro projections.

| Stat | College (Aluminum) | Pro Projection (Wood) | Adjustment |
|------|-------------------|----------------------|------------|
| BA | Player's college BA | BA - .025 to -.045 | -15-20% contact quality reduction |
| SLG | Player's college SLG | SLG - .060 to -.090 | Power systematically reduced |
| ISO | Player's college ISO | ISO - .040 to -.070 | Aluminum barrel inflates power |
| HR | Player's college HR | HR x 0.65-0.80 | 20-35% HR reduction |
| K% | Player's college K% | K% + .030 to +.050 | Wood bat has smaller sweet spot |
| BB% | Player's college BB% | BB% (unchanged) | Plate discipline doesn't change |
| SB/CS | Player's college SB | SB (unchanged) | Speed doesn't change with bat |

If wood bat data exists (Cape Cod, summer league): use ACTUAL wood bat stats as primary input, apply smaller adjustment. Confidence increases +8-12%.

If NO wood bat data: apply full adjustment range. Confidence remains at standard level.

**G3) College Closer to Pro Starter Conversion**
When a college closer/reliever projects as a pro starter:
- VKR adjustment: closer VKR scores inflated by max-effort 1-inning usage. Reduce VKR by 3-5 points for starter projection (velocity typically drops 2-3 mph when stretched to 6+ innings).
- DKR adjustment: closers have no DKR endurance data. Project DKR from physical profile + health history. Confidence on DKR is LOW.
- RKR adjustment: closers typically throw 2 pitches. Need to add 1-2 pitches for starter role. RKR projection based on arsenal development potential (arm action, feel for spin, etc.).
- Timeline: closer-to-starter conversion adds 1-2 years to MLB timeline.

**G4) Pro KR Legend Interpretation**
Map Entry KR to Pro Legend (hitter or pitcher track). Display tier label and what it means at projected starting level.

### OUTPUT H: Development Timeline

**H1) Minor League Progression Path**

| Year | Level | Projected KR Range | Key Focus | Promotion Trigger |
|------|-------|--------------------|-----------|-------------------|
| Year 1 | [level] | [range] | [primary] | [threshold] |
| Year 2 | [level] | [range] | [primary] | [threshold] |
| Year 3 | [level] | [range] | [primary] | [threshold] |
| Year 4 | [level or MLB] | [range] | [refinement] | [MLB readiness] |
| Year 5 (if needed) | [MLB] | [range] | [establishment] | -- |

**H2) MLB Readiness Projection**
- Estimated time to MLB debut: [X] years
- Projected age at debut
- Readiness confidence: High (>= 70%) / Moderate (50-69%) / Low (30-49%) / Speculative (< 30%)

**H3) Development Risk Factors**
- **Injury risk (pitchers):** TJ surgery probability based on workload, delivery mechanics, velocity. TJ recovery adds 12-18 months. Second TJ = career-threatening.
- **Aluminum-to-wood transition risk (hitters):** High flyball / high HR profiles face biggest adjustment. Low contact rates are red flags.
- **Mechanical risk (pitchers):** Effort deliveries, cross-body action, high elbow = elevated injury probability. Flag and discount durability projection.
- **Age risk:** HS draftees have more runway (drafted at 18, debut at 22-23). College seniors have less (drafted at 22, debut at 24-25, peak window shorter).

### OUTPUT I: Peak KR Projection

**I1) Peak Scenario (Best Realistic Outcome)**
- Peak KR range + legend tier label
- Timeline to peak: hitters age 26-30, pitchers age 25-29
- Peak archetype (may evolve from entry)
- Salary projection at peak

**I2) Scenario Branching**
Scenario A -- Key Variable develops: KR range, role, salary
Scenario B -- Key Variable does NOT develop: KR range, role
Both ALWAYS shown.

**I3) Floor Projection (Worst Realistic Outcome)**
- Floor KR range + role description
- "Didn't work out" scenario: what happens if development stalls

### OUTPUT J: Key Development Variable

**J1) Hitter Key Variables (most common):**
- Hit tool (can they hit with wood?)
- Power development (does raw power become game power?)
- Plate discipline maturation (lay off breaking balls at advanced levels?)
- Defensive position sustainability (can they stay at SS/CF long-term or move to corner?)

**J2) Pitcher Key Variables (most common):**
- Command development (can they locate consistently under fatigue?)
- Secondary pitch (does the slider/change become a weapon?)
- Velocity sustainment (maintain velo over 180 IP?)
- Health (can they stay on the mound for 3 consecutive seasons?)

**J3) KR Impact Analysis**
- KR impact if achieved
- System risk removal
- Badge unlock / archetype evolution

### OUTPUT K: Draft & Org Fit

**K1) Draft Range Projection**
Based on Entry KR + Peak KR + development timeline:
- Projected draft round and pick range
- Comparable historical picks at same KR/archetype intersection
- Signing bonus range (by round: 1st round $1M-$8M+, 2nd round $500K-$1.5M, 3rd-5th round $200K-$700K, later rounds $125K-$300K)

**K2) Org Fit Analysis**
Per drafting org:
- Offensive system alignment (hitters) or pitching philosophy alignment (pitchers)
- Minor league development quality rating (from Coaching Impact Modifier)
- Positional need at MLB level (3-5 year window)
- Park factor at MLB home park
- Organizational patience (do they rush prospects or let them develop?)

**K3) International Signing Projection**
For Latin American / Asian amateur pipeline:
- International signing bonus pool implications
- Development timeline (DSL -> A-ball typically 2-3 years)
- Visa/logistical considerations
- Cultural adjustment factor (non-zero impact on first 1-2 years)

---

# COACHING IMPACT MODIFIER -- v1.0 (LOCKED)

## 1. Purpose
Computes coaching-attributable player development residuals. Standalone doc consumed by Development Engine. Modifies development PROJECTIONS only -- never modifies Player KR, Team KR, traits, or upstream outputs.

## 2. Baseball-Specific Coaching Hierarchy

**Pitching coach quality is the single most impactful coaching variable in baseball.** More impactful than hitting coach or manager. A great pitching coach can add 1-3 mph to a pitcher's velocity development curve, refine command 2-3 years faster, and reduce injury risk through workload management.

### Coach Impact Categories

**Pitching Development:**
- Velocity development: long-toss program quality, weighted ball protocols, mechanical efficiency coaching
- Secondary pitch development: grip experimentation, pitch design (TrackMan-informed), bullpen session quality
- Command refinement: location work, pitch tunneling instruction, tempo consistency
- Health management: workload monitoring, arm care protocols, recovery programs

**Hitting Development:**
- Approach refinement: pitch recognition training, count leverage instruction
- Power development: bat speed training, launch angle optimization, rotational mechanics
- Contact improvement: wood bat training quality, tee/cage work structure
- Discipline: zone management, chase rate reduction coaching

**Position-Specific Coaching:**
- Catcher development: receiving, framing, game-calling, blocking, throwing mechanics
- Infield development: footwork, double-play turns, arm angles, positioning
- Outfield development: routes, reads, arm accuracy, relay positioning

## 3. Coaching Residual Computation

Same structure as basketball:
Residual(P, C, cluster) = Actual_Δ(P, cluster) - Baseline_Δ(cluster, age, position, level)

### Baseline Expected Development Curves (Baseball-Specific)

**Hitter Development Curves by Age:**
- Age 18-20: Rapid improvement. +4-8 points per cluster per year expected. Swing mechanics solidifying.
- Age 21-23: Moderate improvement. +2-4 points per year. Approach maturing. Power emerging.
- Age 24-26: Peak approaching. +1-2 points per year. Refinement phase.
- Age 27-30: Peak zone. +/- 1 point. Maintenance. Power peak at 27-28.
- Age 31+: Decline begins. -1 to -3 points per year. Speed declines first, then contact, then power.

**Pitcher Development Curves by Age:**
- Age 18-20: Velocity development window. +2-4 mph possible. Command still inconsistent. +3-6 points per cluster.
- Age 21-24: Prime velocity development. Velocity peaks 24-27 for most pitchers. Command improves steadily. +2-4 points per year.
- Age 25-28: Command peak zone. Velocity stable or slight decline begins. Secondary pitches mature. +1-2 points.
- Age 29-32: Pitch IQ peak (experience). Physical decline beginning. Velocity -1 to -2 mph. Command may hold.
- Age 33+: Decline phase. Must compensate for lost stuff with craft/IQ.

**Tommy John Recovery Timeline:**
- Surgery: KR drops 15-25 points immediately (player is out 12-18 months)
- Return Year 1: 60-70% of pre-injury velocity. KR recovering. Expect KR to be 8-12 points below pre-injury.
- Return Year 2: 85-95% recovery typical. KR within 3-5 points of pre-injury for most. Some exceed pre-injury velocity.
- Return Year 3+: Full recovery for most. Some never fully regain pre-injury effectiveness.
- Second TJ: recovery rate drops to 50-60%. Career-threatening.

## 4. Elite Development Organizations (Baseball)

### Tier 1 -- Elite (Modifier: +1.5 to +3.0 KR development acceleration)
- **Tampa Bay Rays:** League's best at developing pitchers from nothing. Elite analytics integration. Turn late-round picks into quality starters.
- **LA Dodgers:** Premier development infrastructure. Consistently develop both hitters and pitchers. Best farm system development track record.
- **Cleveland Guardians:** Elite pitching development. Consistently produce quality arms from mid-round picks.
- **Milwaukee Brewers:** Punch above weight class. Develop overlooked players into contributors.

### Tier 2 -- Strong (Modifier: +0.5 to +1.5)
- **Atlanta Braves:** Strong pitching pipeline. Good at developing young position players.
- **Houston Astros:** Analytics-driven development. Excels at swing optimization for hitters.
- **San Diego Padres:** Rising development track record.
- **Baltimore Orioles:** Improving quickly under new leadership.
- **Pittsburgh Pirates:** Pitching development specifically (Paul Skenes pathway).

### Tier 3 -- Average (Modifier: 0.0 to +0.5)
Most organizations fall here.

### Tier 4 -- Below Average (Modifier: -0.5 to -1.0)
Organizations with poor track records of developing draft picks into MLB contributors. Not named specifically (changes year-to-year), but identified by: high prospect attrition rate, coaching staff turnover at minor league level, lack of analytics integration.

### College-Level Elite Development Programs
- **Vanderbilt:** Premier pitching development factory. David Price, Sonny Gray, Jack Leiter, Kumar Rocker pipeline.
- **LSU:** Consistent CWS contender. Develops both hitters and pitchers at elite level.
- **Oregon State:** Strong development program. Multiple CWS titles.
- **Virginia:** Pitching development strength.
- **Wake Forest:** Emerging elite program.
- **Stanford:** Develops polished, high-IQ players.

## 5. Evidence Thresholds

| Threshold | Minimum | Below Minimum |
|---|---|---|
| Player-seasons under coach | 8 | Modifier inactive -- baseline only |
| Unique players | 4 | Modifier inactive |
| Consecutive seasons per player | 2 | Player excluded from computation |
| AB (hitters) / IP (pitchers) per season | 100 AB / 30 IP | Player excluded |

CIP Confidence tiers: Same structure as basketball (Low / Medium / High / Very High), with baseline always partially retained (never fully replaced by CIP).

## 6. Application Rules
- CIP modifies TRAJECTORY only, not current KR
- Pitching coach CIP is PRIMARY for pitcher development (weighted 2x vs head coach CIP for pitcher traits)
- Hitting coach CIP is PRIMARY for hitter development (weighted 2x vs head coach)
- CIP recomputed annually after season ends
- All CIP values accompanied by confidence level and sample size
- No single player-season may contribute > 15% of total CIP weight

---

## GOVERNANCE
- Development Intelligence Engine reads governed truth only -- no upstream mutation
- Pro Transition Engine accounts for 3-5 year minor league timeline
- Aluminum-to-wood adjustment MANDATORY for all college hitter pro projections
- All trajectory projections are directional with explicit uncertainty
- Max trait improvement: +15 KR points over 5 years (baseball's longer development window)
- Max trait improvement per year: +6 points
- TJ recovery protocol is standardized: 12-18 month return, 24-month full recovery
- Both upside and downside ALWAYS shown in projections
- Coaching Impact Modifier is additive to trajectory, never modifies current evaluation
- Pitching coach is the most impactful coaching variable -- weighted accordingly
