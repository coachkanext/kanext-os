# Women's Volleyball Player Evaluation Reference v1

---

## 0. SCOPE

This is the single authoritative reference document for all women's volleyball evaluation data: trait definitions, trait bands, archetype library, position OPF weights, system demand profiles, badges, overrides, system risks, KLVN college lambdas, college legends (all levels), pro KLVN lambdas, pro player KR legend, pro team registry, and pro salary framework.

**This file is large. Search by section header, not full load.**

---

# SECTION 1: TRAIT LIBRARY

Traits are organized by the 6 component KR clusters. Each trait has a definition, V1 measurement method, scoring bands (0-100 scale), and KLVN normalization notes.

## 1.1 ATTACK CLUSTER (AKR)

### Trait: Kill Efficiency (kills/set)
**Definition:** Rate of kills per set played. The primary volume indicator for attackers.
**V1 measurement:** Kills / Sets played
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 4.5+ kills/set |
| Above Average | 75-89 | 3.5-4.49 kills/set |
| Average | 55-74 | 2.5-3.49 kills/set |
| Below Average | 35-54 | 1.5-2.49 kills/set |
| Poor | 0-34 | Under 1.5 kills/set |

**Position context:** MBs and Liberos/DS should NOT be scored on this trait with the same expectations as OHs and OPPs. MB kill efficiency bands are lower volume, higher efficiency. Liberos/DS are exempt.

### Trait: Hitting Percentage
**Definition:** (Kills - Errors) / Attempts. THE key offensive efficiency metric.
**V1 measurement:** Directly available in most stat lines.
**KLVN normalization:** Not normalized (efficiency is level-independent).

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | .370+ |
| Above Average | 75-89 | .280-.369 |
| Average | 55-74 | .200-.279 |
| Below Average | 35-54 | .120-.199 |
| Poor | 0-34 | Under .120 |

**Position context:** MBs typically hit .300+ (quick attack efficiency). OHs hitting .250+ is excellent. OPPs vary widely. Setters are scored separately (dump kills only).

### Trait: Attack Attempts (volume)
**Definition:** Total attack attempts per set. Indicates how much the offense runs through this player.
**V1 measurement:** Attempts / Sets played

| Band | Score Range | D1 Power 4 Benchmark (OH/OPP) |
|------|-----------|-------------------------------|
| Elite | 90-100 | 10.0+ attempts/set |
| Above Average | 75-89 | 8.0-9.99 attempts/set |
| Average | 55-74 | 6.0-7.99 attempts/set |
| Below Average | 35-54 | 4.0-5.99 attempts/set |
| Poor | 0-34 | Under 4.0 attempts/set |

### Trait: Out-of-System Kills
**Definition:** Kills scored when the pass is off-target and the setter delivers a non-ideal set.
**V1 measurement:** Not directly available at V1. Proxy: high kills/set with moderate team passing suggests ability to convert out-of-system. Full measurement requires V2+.
**V1 proxy confidence:** 0.5

### Trait: Transition Kills
**Definition:** Kills scored in transition (after a dig, not on serve receive). Transition kills are harder than first-ball kills.
**V1 measurement:** Not directly available at V1. Proxy: kill efficiency on teams that play many long rallies. Full measurement requires V2+.
**V1 proxy confidence:** 0.5

### Trait: Shot Variety
**Definition:** Ability to hit line, cross, sharp angle, tip, and tool the block. One-dimensional hitters are easier to defend.
**V1 measurement:** Not available at V1. Requires V2+ video data.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Tool/Tip Usage
**Definition:** Ability to use the block (tool shots off blocker's hands) and tip/roll shots to change speed.
**V1 measurement:** Not available at V1. Requires V2+ video data.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Approach Speed and Timing
**Definition:** Quality of hitting approach, timing with the set, and acceleration through contact.
**V1 measurement:** Not available at V1. Requires V2+ video data.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

---

## 1.2 BLOCK CLUSTER (BKR)

### Trait: Block Rate (blocks/set)
**Definition:** Total blocks per set (solo + assists). Primary blocking volume indicator.
**V1 measurement:** (Solo Blocks + Block Assists) / Sets Played
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 1.40+ blocks/set |
| Above Average | 75-89 | 1.00-1.39 blocks/set |
| Average | 55-74 | 0.65-0.99 blocks/set |
| Below Average | 35-54 | 0.35-0.64 blocks/set |
| Poor | 0-34 | Under 0.35 blocks/set |

**Position context:** MBs are expected to lead in blocks. OPPs block from right side. OHs block from left. Liberos/DS are exempt.

### Trait: Solo Blocks
**Definition:** Blocks where this player alone stops the attack. Rarer than assists.
**V1 measurement:** Solo blocks / Sets played

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 0.40+ solo blocks/set |
| Above Average | 75-89 | 0.25-0.39/set |
| Average | 55-74 | 0.12-0.24/set |
| Below Average | 35-54 | 0.05-0.11/set |
| Poor | 0-34 | Under 0.05/set |

### Trait: Block Assists
**Definition:** Blocks involving this player and at least one teammate. Indicates ability to close the block and work with adjacents.
**V1 measurement:** Block assists / Sets played

### Trait: Stuff Block Rate
**Definition:** Blocks that result in a direct point (ball stays on opponent's side). Subset of total blocks.
**V1 measurement:** Not always separated in stats. Solo blocks are a proxy. V2+ for precise data.
**V1 proxy confidence:** 0.6

### Trait: Touch Rate
**Definition:** Percentage of opposing attacks where this blocker gets a touch on the ball (including deflections that are dug by teammates). Measures blocking activity beyond just stuff blocks.
**V1 measurement:** Not available at V1. Requires V2+ video tracking.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Seal/Close Positioning
**Definition:** Ability to close the block with the adjacent blocker, eliminating the seam. Poor seal = hitters find the gap.
**V1 measurement:** Not available at V1. Requires video.
**V1 proxy confidence:** 0.0

### Trait: Read Speed
**Definition:** How quickly the blocker reads the setter and moves to the correct hitter.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Transition Off Block
**Definition:** Ability to land from a block attempt and immediately transition to attack or defensive position.
**V1 measurement:** Not directly available. Proxy: MBs with high kill rates AND high block rates demonstrate good transition.
**V1 proxy confidence:** 0.4

---

## 1.3 DIG/DEFENSE CLUSTER (DKR)

### Trait: Dig Rate (digs/set)
**Definition:** Digs per set played. Primary defensive volume indicator.
**V1 measurement:** Digs / Sets Played
**KLVN normalization:** Multiply raw by level lambda.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 5.0+ digs/set |
| Above Average | 75-89 | 3.5-4.99 digs/set |
| Average | 55-74 | 2.5-3.49 digs/set |
| Below Average | 35-54 | 1.5-2.49 digs/set |
| Poor | 0-34 | Under 1.5 digs/set |

**Position context:** Liberos lead in digs. OHs who play back row should have strong dig numbers. MBs typically sub out in back row.

### Trait: Serve Receive Pass Rating
**Definition:** Quality of serve reception on a 0-3 scale. 3 = perfect pass to target. 0 = ace/unplayable.
**V1 measurement:** Available from some stat services. Team-level passing efficiency is a proxy if individual data unavailable.
**This is the most underrated skill in volleyball.** A team that cannot pass cannot run its offense. Elite serve receive is the foundation of every offensive system.

| Band | Score Range | Pass Rating Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 2.40+ |
| Above Average | 75-89 | 2.20-2.39 |
| Average | 55-74 | 2.00-2.19 |
| Below Average | 35-54 | 1.80-1.99 |
| Poor | 0-34 | Under 1.80 |

### Trait: Serve Receive Volume
**Definition:** Number of serve receive attempts per set. High volume = trusted passer, targeted by opponents, or both.
**V1 measurement:** Serve receive attempts / Sets played (when available)

### Trait: Platform Consistency
**Definition:** Consistency of defensive platform (forearm angle, body position) across different ball speeds and angles.
**V1 measurement:** Not available at V1. Requires video.
**V1 proxy confidence:** 0.0

### Trait: Range and Pursuit
**Definition:** Ability to cover ground and make plays outside the primary defensive zone. Includes sprawl, pancake, and chase-down digs.
**V1 measurement:** Not directly available. Proxy: high dig rate relative to position suggests strong range.
**V1 proxy confidence:** 0.4

### Trait: Emergency Technique
**Definition:** Ability to make one-arm digs, overhead digs, barrel rolls, and other non-standard defensive plays.
**V1 measurement:** Not available at V1. Requires video.
**V1 proxy confidence:** 0.0

### Trait: Defensive Positioning
**Definition:** Pre-contact positioning relative to the attacker and blocking scheme. Good positioning reduces the need for spectacular plays.
**V1 measurement:** Not available at V1. Requires video.
**V1 proxy confidence:** 0.0

---

## 1.4 SERVE CLUSTER (SVR)

### Trait: Ace Rate (aces/set)
**Definition:** Service aces per set. Direct points from serving.
**V1 measurement:** Aces / Sets played
**KLVN normalization:** Multiply raw by level lambda.

| Band | Score Range | D1 Power 4 Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 0.50+ aces/set |
| Above Average | 75-89 | 0.35-0.49 aces/set |
| Average | 55-74 | 0.20-0.34 aces/set |
| Below Average | 35-54 | 0.10-0.19 aces/set |
| Poor | 0-34 | Under 0.10 aces/set |

### Trait: Ace-to-Error Ratio
**Definition:** Aces divided by service errors. Measures serve aggressiveness vs reliability.
**V1 measurement:** Aces / Service errors

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 1.50+ |
| Above Average | 75-89 | 1.00-1.49 |
| Average | 55-74 | 0.70-0.99 |
| Below Average | 35-54 | 0.40-0.69 |
| Poor | 0-34 | Under 0.40 |

### Trait: Service Error Rate
**Definition:** Service errors per set. Lower is better. Must be considered alongside aggressiveness.
**V1 measurement:** Service errors / Sets played

A player with 0.50 aces/set and 0.40 errors/set is more valuable than a player with 0.10 aces/set and 0.05 errors/set. The first creates pressure; the second is just getting the ball in play.

### Trait: Serve Velocity
**Definition:** Speed of serve in mph/kph. Jump serves are faster than float serves.
**V1 measurement:** Not available at V1. Requires radar or video tracking.
**V1 proxy confidence:** 0.0

### Trait: Placement Consistency
**Definition:** Ability to serve to specific zones consistently. Tactical serving is as important as power.
**V1 measurement:** Not available at V1. Requires video.
**V1 proxy confidence:** 0.0

### Trait: Float vs Jump Serve Mix
**Definition:** Ability to vary between float (unpredictable movement) and jump (power/topspin) serves.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Pressure Serving
**Definition:** Performance on serves at critical moments (set point, match point, after timeout).
**V1 measurement:** Not directly available. Proxy from clutch reputation/awards. V2+ for precise data.
**V1 proxy confidence:** 0.3

---

## 1.5 SET CLUSTER (SKR)

### Trait: Assist Rate (assists/set)
**Definition:** Assists per set played. Primary volume indicator for setters.
**V1 measurement:** Assists / Sets played
**KLVN normalization:** Multiply raw by level lambda.

| Band | Score Range | D1 Power 4 Benchmark (Setters) |
|------|-----------|-------------------------------|
| Elite | 90-100 | 11.0+ assists/set |
| Above Average | 75-89 | 9.5-10.99 assists/set |
| Average | 55-74 | 8.0-9.49 assists/set |
| Below Average | 35-54 | 6.5-7.99 assists/set |
| Poor | 0-34 | Under 6.5 assists/set |

**Critical context:** Assist rate is partially a function of team quality. A setter on a team with bad hitters has fewer assists because her sets result in fewer kills. Always evaluate assist rate alongside team hitting percentage.

### Trait: Distribution Balance
**Definition:** How evenly the setter distributes sets across all available hitters. A balanced attack is harder to defend.
**V1 measurement:** Not directly in box score. Proxy: if a team has 3+ hitters with 2.0+ kills/set, the setter is distributing. V2+ for precise distribution charts.
**V1 proxy confidence:** 0.5

### Trait: Set Accuracy/Location
**Definition:** Percentage of sets that are hittable (in the zone where the hitter can attack effectively).
**V1 measurement:** Not available at V1. Proxy: team hitting percentage reflects setter quality.
**V1 proxy confidence:** 0.5

### Trait: Tempo Control
**Definition:** Ability to run quick sets (first tempo), medium (second tempo), and high sets. A setter who can run a fast tempo forces the other team's blockers to commit.
**V1 measurement:** Not directly available. Proxy: middle blocker kill rates and hitting% suggest tempo quality.
**V1 proxy confidence:** 0.4

### Trait: Out-of-System Setting
**Definition:** Quality of sets when the pass is off-target. The elite differentiator for setters.
**V1 measurement:** Not available at V1. Requires video.
**V1 proxy confidence:** 0.0

### Trait: Dump/Tip Effectiveness
**Definition:** Setter's ability to score on second contact (dump over the net or tip to open court when front row).
**V1 measurement:** Available in some stat lines as "setter attacks" or setter kill totals.

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 0.40+ setter kills/set |
| Above Average | 75-89 | 0.25-0.39/set |
| Average | 55-74 | 0.10-0.24/set |
| Below Average | 35-54 | 0.05-0.09/set |
| Rare | 0-34 | Under 0.05/set |

### Trait: Decision Quality
**Definition:** Quality of set selection given the game situation, blockers' positioning, and hitter availability.
**V1 measurement:** Not available at V1. Requires V2+ video analysis.
**V1 proxy confidence:** 0.0

### Trait: Ball Handling Errors
**Definition:** Setting errors (double contacts, lifts, mishandles). Lower is better.
**V1 measurement:** Ball handling errors / Sets played

---

## 1.6 VOLLEYBALL IQ CLUSTER (IQKR)

### Trait: Rotation Discipline
**Definition:** Correct positioning in all 6 rotations, both pre-serve and during play. Includes overlap avoidance.
**V1 measurement:** Not available at V1. Proxy: low ball-handling/positional errors suggests discipline.
**V1 proxy confidence:** 0.3

### Trait: Court Awareness and Communication
**Definition:** Ability to read the game, call shots, direct teammates, and maintain situational awareness.
**V1 measurement:** Not available at V1. Inferred from leadership roles (captain, awards).
**V1 proxy confidence:** 0.3

### Trait: Adjustment Speed
**Definition:** How quickly the player adapts between sets and matches. Includes mid-match tactical adjustments.
**V1 measurement:** Not available at V1. Proxy: teams that win after losing set 1 may have strong adjustment culture.
**V1 proxy confidence:** 0.2

### Trait: Film Study Application
**Definition:** Evidence that the player applies scouting information to in-match decision-making.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Clutch Performance
**Definition:** Performance in high-leverage moments (set point, fifth set, match point, NCAA tournament).
**V1 measurement:** Proxy from team success in close matches, postseason awards, tournament performance.
**V1 proxy confidence:** 0.4

### Trait: Serve Receive Rotation Intelligence
**Definition:** Understanding of serve receive formations and adjustments based on opponent's serving patterns.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Blocking Scheme Execution
**Definition:** Ability to execute team blocking assignments (who to front, when to swing block, when to drop off).
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

---

# SECTION 2: ARCHETYPE LIBRARY

Archetypes are locked position-specific profiles. Each player is assigned ONE primary archetype with an optional secondary.

## 2.1 SETTER ARCHETYPES

### Floor General
**Definition:** The setter who controls the entire offense through distribution, tempo, and leadership. Makes everyone better. May not have the flashiest individual stats but her team's collective offense hums.
**Trait signature:** High distribution balance, high tempo control, elite IQKR, above-average DKR. SKR dominant.
**System fit:** Thrives in 5-1 systems where she controls all rotations. Best in complex offenses (swing, fast tempo).
**Example profile:** 10.5+ assists/set, team hitting .250+, 3+ hitters with 2.0+ kills/set.

### Tempo Setter
**Definition:** A setter whose primary weapon is speed. Runs a fast-tempo offense that overwhelms opposing blockers. Middles feast in this system.
**Trait signature:** Elite tempo control, high quick-set accuracy, strong rapport with middles. May sacrifice back-row defense for speed.
**System fit:** Ideal for Fast Tempo and Slide-Heavy offenses. Less effective in slower, high-ball systems.
**Example profile:** MB hitters hitting .330+, high percentage of first-tempo sets, team produces kills before blockers can set up.

### Dump Threat
**Definition:** A setter who is a legitimate scoring threat. Defenses must account for her dump/tip ability, which opens up hitters.
**Trait signature:** High dump/tip effectiveness, strong attack instincts when front row. Uses scoring threat to keep blockers honest.
**System fit:** Especially valuable in 5-1 where she is front row for 3 rotations. Less impactful in 6-2 (always back row).
**Example profile:** 0.30+ setter kills/set, hitting .300+ on own attacks, creates 1-on-1 hitting opportunities for outsides by freezing the middle blocker.

### Defensive Setter
**Definition:** A setter whose defensive contribution is exceptional. Strong back-row defender, reliable serve receiver. May not have the fastest tempo but is a complete player.
**Trait signature:** High DKR for a setter, strong digs/set, reliable serve receive, consistent setting over flashy.
**System fit:** Valuable in any system but especially in programs that prioritize ball control and defensive rallying.
**Example profile:** 3.0+ digs/set (unusual for a setter), reliable passing, team rarely has defensive breakdowns in setter rotations.

---

## 2.2 OUTSIDE HITTER ARCHETYPES

### Power OH
**Definition:** Primary scoring weapon from the left side. Generates kills through power, approach speed, and the ability to hit over/through the block.
**Trait signature:** Elite AKR (kills/set and hitting%), strong approach speed, high attack volume. May sacrifice some defensive skills for offensive dominance.
**System fit:** Anchors any offensive system as the go-to attacker. Especially valued in Pipe-Heavy systems where back-row attack adds another dimension.
**Example profile:** 4.0+ kills/set, .280+ hitting%, 9.0+ attempts/set.

### All-Around OH
**Definition:** The complete outside hitter. Contributes meaningfully in every phase: attack, serve receive, defense, serve, blocking. The gold standard for the position.
**Trait signature:** Above-average in all 6 component KRs. No single elite component but no weaknesses either. Six-rotation player.
**System fit:** Fits everywhere. Coaches build around this player.
**Example profile:** 3.5+ kills/set, .250+ hitting%, 3.0+ digs/set, 2.20+ pass rating, 0.30+ aces/set.

### Serve Receive Specialist OH
**Definition:** An OH whose primary value is elite serve receive. She may not be the top scorer, but her passing allows the offense to run at full speed.
**Trait signature:** Elite serve receive (2.40+ pass rating), high volume of receptions, reliable platform. Solid but not elite attack.
**System fit:** Critical in Fast Tempo systems where first-ball passing determines if the quick offense can run. Less differentiated in slow-tempo systems.
**Example profile:** 2.40+ pass rating on 8.0+ receptions/set, 2.5+ kills/set, .220+ hitting%.

### Six-Rotation Force
**Definition:** An OH who dominates in all 6 rotations without any substitution. Does not come out for a DS. Her back-row presence is as impactful as her front-row attack.
**Trait signature:** Strong across AKR, DKR, SVR. Back-row attack capable. Serves as a defensive anchor when in back row.
**System fit:** Maximum value in 5-1 systems and any system that benefits from having a full-rotation player at the position. Eliminates the need for a DS substitution.
**Example profile:** 3.5+ kills/set, 3.5+ digs/set, 0.30+ aces/set, never substituted out.

---

## 2.3 MIDDLE BLOCKER ARCHETYPES

### Quick Attacker
**Definition:** A middle whose primary weapon is the quick attack (one-ball, slide). Hits at first tempo before the block can set up.
**Trait signature:** Elite hitting percentage (.340+), high quick-attack conversion rate. Strong timing with the setter. May not be the strongest blocker.
**System fit:** Essential in Fast Tempo and Slide-Heavy offenses. Her quick attack freezes the opposing MB, opening up outside hitters.
**Example profile:** .350+ hitting%, 2.0+ kills/set on 4.0 or fewer attempts/set (pure efficiency).

### Block Anchor
**Definition:** A middle whose blocking is the defensive centerpiece. She reads the setter, moves laterally, and seals the block. Her blocking transforms the team defense.
**Trait signature:** Elite BKR (1.30+ blocks/set), strong read speed, excellent seal technique. Solid but not dominant attack.
**System fit:** Critical in Read Block defensive systems. Anchors the entire defensive front.
**Example profile:** 1.40+ blocks/set, 0.30+ solo blocks/set. Team holding opponents to .180 or lower hitting%.

### Slide Specialist
**Definition:** A middle who excels at the slide attack (running approach along the net to attack from the right side). Adds a dimension that confuses blocking schemes.
**Trait signature:** High kill efficiency on slide attacks, strong lateral movement, good timing on non-standard approaches.
**System fit:** Ideal for Slide-Heavy and Swing Offense systems. Less impactful if the team does not run slides.
**Example profile:** High slide attack attempts relative to total attempts, strong hitting% on slides.

### Two-Way Middle
**Definition:** A middle who impacts the game equally on offense and defense. Rare and extremely valuable.
**Trait signature:** Above-average in both AKR and BKR. .280+ hitting%, 1.10+ blocks/set. The complete middle.
**System fit:** Fits any system. Her dual impact means no tradeoff between attack and defense.
**Example profile:** .300+ hitting%, 1.20+ blocks/set, 2.0+ kills/set.

---

## 2.4 OPPOSITE/RIGHT SIDE ARCHETYPES

### Power Opposite
**Definition:** A right-side hitter who generates kills through raw power and the ability to score against a set block from the right side.
**Trait signature:** Elite AKR from right side, high kill volume, ability to hit over a double block. Strong right-side blocking as well.
**System fit:** Anchors the right-side attack in any system. Especially valuable in 5-1 when she is the primary option opposite the setter.
**Example profile:** 3.5+ kills/set from right side, .270+ hitting%, 1.00+ blocks/set.

### Scoring Opposite
**Definition:** An opposite whose sole job is to terminate. She may not pass, may not dig at an elite level, but she puts the ball on the floor.
**Trait signature:** Dominant AKR, very high kill rate per set. Limited DKR. SVR varies.
**System fit:** Best in systems where the OPP does not have serve receive responsibility. Thrives in 5-1 with a strong libero and OH passers.
**Example profile:** 4.0+ kills/set, .260+ hitting%, 9.0+ attempts/set. May sub out in back row.

### Serving Opposite
**Definition:** An opposite whose serve is a primary weapon. The combination of right-side attack plus elite serving creates a dual threat.
**Trait signature:** High SVR (0.45+ aces/set), strong AKR. Serving pressure creates easy transition opportunities.
**System fit:** Maximized when serving strategy is central to the game plan. Strong in systems that prioritize serving runs.
**Example profile:** 0.45+ aces/set, 1.20+ ace-to-error ratio, 3.0+ kills/set.

---

## 2.5 LIBERO ARCHETYPES

### Pass-First Libero
**Definition:** A libero whose primary value is elite serve receive. She makes the offense go by delivering perfect passes.
**Trait signature:** Elite serve receive (2.40+ pass rating), high reception volume. Solid but not spectacular digging. Her passing makes the first-ball offense unstoppable.
**System fit:** Critical in Fast Tempo systems where first-ball passing is the foundation. In any system, elite passing makes the setter's job easier.
**Example profile:** 2.45+ pass rating on 8.0+ receptions/set, team runs quick tempo at 80%+ when she passes.

### Defensive Libero
**Definition:** A libero whose digging and floor defense is the standout skill. She extends rallies and turns would-be kills into opportunities.
**Trait signature:** Elite dig rate (5.0+ digs/set), exceptional range and pursuit, strong emergency technique. Serve receive may be good but not elite.
**System fit:** Maximized on teams that play defensive, rally-heavy volleyball. Less differentiated on teams that dominate in first-ball attacking.
**Example profile:** 5.5+ digs/set, multiple 20+ dig matches per season.

### Floor Leader Libero
**Definition:** A libero who is the defensive quarterback. Her communication, court awareness, and leadership define the team's defensive identity.
**Trait signature:** High IQKR, strong communication (captain/leader designation), consistent if not spectacular raw stats. Her impact is partly invisible in the box score.
**System fit:** Valuable everywhere. Especially impactful on young teams or teams with complex defensive schemes (Man-Up, Rotation Defense).
**Example profile:** Team captain, consistently solid dig and pass numbers, team defense improves when she is on court. Leadership awards.

---

## 2.6 DEFENSIVE SPECIALIST ARCHETYPES

### Serve Receive DS
**Definition:** A DS who enters primarily to improve serve receive in specific rotations.
**Trait signature:** Elite serve receive pass rating. Enters for back-row rotations where the front-row attacker is a weak passer.
**System fit:** Common in systems where an OPP or MB needs to be replaced in back row for passing purposes.
**Example profile:** 2.35+ pass rating, limited sets played (enters for 2-3 rotations).

### Defensive DS
**Definition:** A DS who enters primarily for back-row defense, often replacing a front-row attacker who is a weak defender.
**Trait signature:** Strong dig rate and defensive positioning. May also serve.
**System fit:** Valued on teams where an OPP or MB is a defensive liability in back row.
**Example profile:** 3.0+ digs/set in limited rotations, strong serving.

---

# SECTION 3: POSITION OPF WEIGHTS

## 3.1 College OPF Weights

### Setter (College)
| Component | Weight |
|-----------|--------|
| SKR (Set) | 40% |
| IQKR (VB IQ) | 25% |
| DKR (Dig/Defense) | 15% |
| SVR (Serve) | 10% |
| AKR (Attack) | 7% |
| BKR (Block) | 3% |

### Outside Hitter (College)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 30% |
| DKR (Dig/Defense) | 25% |
| SVR (Serve) | 15% |
| BKR (Block) | 12% |
| IQKR (VB IQ) | 13% |
| SKR (Set) | 5% |

### Middle Blocker (College)
| Component | Weight |
|-----------|--------|
| BKR (Block) | 35% |
| AKR (Attack) | 30% |
| IQKR (VB IQ) | 15% |
| DKR (Dig/Defense) | 10% |
| SVR (Serve) | 7% |
| SKR (Set) | 3% |

### Opposite/Right Side (College)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 38% |
| BKR (Block) | 20% |
| SVR (Serve) | 15% |
| IQKR (VB IQ) | 12% |
| DKR (Dig/Defense) | 10% |
| SKR (Set) | 5% |

### Libero (College)
| Component | Weight |
|-----------|--------|
| DKR (Dig/Defense) | 55% |
| IQKR (VB IQ) | 25% |
| SVR (Serve) | 15% |
| SKR (Set) | 5% |
| AKR (Attack) | 0% |
| BKR (Block) | 0% |

### Defensive Specialist (College)
| Component | Weight |
|-----------|--------|
| DKR (Dig/Defense) | 50% |
| SVR (Serve) | 20% |
| IQKR (VB IQ) | 20% |
| SKR (Set) | 10% |
| AKR (Attack) | 0% |
| BKR (Block) | 0% |

---

## 3.2 Pro OPF Weights

At the pro level, physical dominance and specialized skills are weighted more heavily than at the college level.

### Setter (Pro)
| Component | Weight |
|-----------|--------|
| SKR (Set) | 42% |
| IQKR (VB IQ) | 22% |
| DKR (Dig/Defense) | 13% |
| SVR (Serve) | 10% |
| AKR (Attack) | 10% |
| BKR (Block) | 3% |

Note: AKR increases at pro level because setter attacking (dumps/tips) becomes a bigger weapon against elite defenses.

### Outside Hitter (Pro)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 32% |
| DKR (Dig/Defense) | 22% |
| SVR (Serve) | 16% |
| BKR (Block) | 12% |
| IQKR (VB IQ) | 13% |
| SKR (Set) | 5% |

### Middle Blocker (Pro)
| Component | Weight |
|-----------|--------|
| BKR (Block) | 38% |
| AKR (Attack) | 28% |
| IQKR (VB IQ) | 14% |
| DKR (Dig/Defense) | 10% |
| SVR (Serve) | 7% |
| SKR (Set) | 3% |

### Opposite/Right Side (Pro)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 40% |
| BKR (Block) | 20% |
| SVR (Serve) | 14% |
| IQKR (VB IQ) | 12% |
| DKR (Dig/Defense) | 9% |
| SKR (Set) | 5% |

### Libero (Pro)
| Component | Weight |
|-----------|--------|
| DKR (Dig/Defense) | 55% |
| IQKR (VB IQ) | 22% |
| SVR (Serve) | 18% |
| SKR (Set) | 5% |
| AKR (Attack) | 0% |
| BKR (Block) | 0% |

### Defensive Specialist (Pro)
Same as college DS. DS role is rare at the pro level; most pro teams use a single libero rather than DS rotations.

---

# SECTION 4: SYSTEM DEMAND PROFILES

## 4.1 Offensive System Demands

### 5-1 System
**Core demands:**
- One elite setter who plays all 6 rotations (SKR 80+)
- Two strong outside hitters (AKR 75+, DKR 70+)
- Two middles who can run quick tempo (AKR 70+ with .280+ hitting%)
- One opposite who can score from right side (AKR 75+)
- Strong libero for serve receive (DKR 75+)

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | A (Critical) |
| OH | A (Critical) |
| MB | B (High) |
| OPP | A (Critical) |
| Libero | B (High) |
| DS | C (Optional) |

### 6-2 System
**Core demands:**
- Two setters who can hit from front row and set from back row
- Six front-row attackers at all times (more firepower)
- Setters must be strong enough attackers to contribute as hitters when front row
- Less setting consistency (two different setters means two different tempos)

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | B (High) - two needed, neither needs to be as elite as a 5-1 setter |
| OH | A (Critical) |
| MB | A (Critical) - always have 3 front-row attackers |
| OPP | A (Critical) |
| Libero | B (High) |
| DS | C (Optional) |

### Swing Offense
**Core demands:**
- Hitters who can attack from multiple positions (OHs who can hit right side, OPPs who can hit left)
- Elite setter who can run the misdirection (SKR 85+)
- Middles who are mobile enough to run different approaches
- Requires high volleyball IQ across all attackers (IQKR 75+)

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | A (Critical) |
| OH | A (Critical) |
| MB | B (High) |
| OPP | B (High) |
| Libero | B (High) |
| DS | C (Optional) |

### Fast Tempo
**Core demands:**
- Elite first-ball passing (libero and OHs with 2.30+ pass rating)
- Setter who can run quick sets consistently (tempo control elite)
- Middles who can convert first-tempo attacks (.300+ hitting%)
- System breaks down when passing is poor (fragile)

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | A (Critical) - tempo control is the system |
| OH | B (High) - must pass at 2.30+ to feed the system |
| MB | A (Critical) - quick attack is the core weapon |
| OPP | B (High) |
| Libero | A (Critical) - passing makes or breaks the system |
| DS | B (High) - passing quality in back-row rotations matters |

### Slide-Heavy
**Core demands:**
- Middles who can run slide attacks (lateral mobility, timing)
- Opposites who can also run slides from right side
- Setter who can deliver slide sets accurately
- Strong block-out and transition game

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | A (Critical) |
| OH | B (High) |
| MB | A (Critical) - slide attack is the system |
| OPP | A (Critical) - right-side slide dimension |
| Libero | B (High) |
| DS | C (Optional) |

### Pipe-Heavy
**Core demands:**
- Back-row attackers (OHs and OPPs with back-row attack capability)
- Setter who can set behind her (pipe set accuracy)
- Strong passing to enable back-row attack opportunities
- At least 2 players capable of back-row attacking

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | A (Critical) |
| OH | A (Critical) - must attack from back row |
| MB | B (High) |
| OPP | A (Critical) - back-row attack dimension |
| Libero | B (High) |
| DS | C (Optional) |

---

## 4.2 Defensive System Demands

### Rotation Defense (Perimeter)
**Core demands:**
- Defenders who rotate to cover tips and off-speed shots
- Strong positional discipline (IQKR 70+)
- Libero who can cover ground in rotation
- Blockers who channel the attack predictably

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| MB (Blocking) | A (Critical) - block must channel the ball |
| Libero | A (Critical) |
| OH (Back row) | B (High) |
| DS | B (High) |

### Perimeter Defense
**Core demands:**
- Defenders stay on the perimeter (power defense)
- Strong against hard-driven attacks
- Vulnerable to tips and off-speed (needs blockers to take that away)
- Blockers must be disciplined to take away specific zones

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| MB (Blocking) | A (Critical) |
| Libero | A (Critical) |
| OH (Back row) | B (High) |
| DS | B (High) |

### Man-Up (Dedicated Tip Coverage)
**Core demands:**
- One player dedicated to short/tip coverage (often an OH or DS)
- Remaining defenders cover deep
- Requires athletes who can read the attacker and differentiate power vs off-speed
- Strong blocker who takes away one shot, freeing the floor defenders

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| MB (Blocking) | A (Critical) |
| Libero | A (Critical) |
| OH/DS (Tip coverage) | A (Critical) |

### Read Block
**Core demands:**
- Blockers read the setter and react to the actual set before committing
- Requires disciplined, smart blockers (IQKR 75+)
- Slower lateral movement is fine if read speed is excellent
- Most common at high levels (D1 Power 4)

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| MB (Read + Block) | A (Critical) |
| OH (Block) | B (High) |
| OPP (Block) | B (High) |
| Libero | B (High) |

### Commit Block
**Core demands:**
- One blocker commits to a specific hitter before the set is made
- High risk/high reward (if the set goes elsewhere, the commit blocker is out of position)
- Used selectively against teams with dominant quick attackers
- Requires strong defensive back-row to compensate for potential one-on-one situations

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| MB (Commit timing) | A (Critical) |
| Libero | A (Critical) - must cover more court |
| OH/DS (Back row) | A (Critical) - must defend without full block |

---

# SECTION 5: BADGES

Badges are recognition markers that enhance the evaluation narrative. They do not change KR math. They are earned based on threshold conditions.

## 5.1 Performance Badges

### Triple-Double (Bronze/Silver/Gold)
**Definition:** Recording double-digit numbers in three statistical categories in a single match.
- **Bronze:** 1 triple-double in a season (kills/digs/blocks OR assists/digs/aces for setters)
- **Silver:** 3+ triple-doubles in a season
- **Gold:** 5+ triple-doubles in a season

### Ace Machine (Bronze/Silver/Gold)
**Definition:** Elite serving production.
- **Bronze:** 0.40+ aces/set for the season
- **Silver:** 0.50+ aces/set for the season
- **Gold:** 0.60+ aces/set AND 1.30+ ace-to-error ratio

### Serve Receive Anchor (Bronze/Silver/Gold)
**Definition:** Elite serve receive passing.
- **Bronze:** 2.30+ pass rating on 6.0+ receptions/set
- **Silver:** 2.40+ pass rating on 7.0+ receptions/set
- **Gold:** 2.50+ pass rating on 8.0+ receptions/set

### Clutch Server (Bronze/Silver/Gold)
**Definition:** Serving effectiveness in high-pressure moments.
- **Bronze:** 3+ aces in set-deciding situations (set point, match point)
- **Silver:** 5+ clutch aces AND zero service errors in those situations
- **Gold:** 8+ clutch aces AND ace-to-error ratio of 2.0+ in pressure situations

### Block Party (Bronze/Silver/Gold)
**Definition:** Dominant blocking production.
- **Bronze:** 1.20+ blocks/set for the season
- **Silver:** 1.40+ blocks/set for the season
- **Gold:** 1.60+ blocks/set AND 0.35+ solo blocks/set

### Floor General (Silver/Gold only)
**Definition:** Setter who controls the offense at an elite level.
- **Silver:** 10.5+ assists/set, team hitting .260+, 3+ hitters with 2.5+ kills/set
- **Gold:** 11.5+ assists/set, team hitting .280+, 4+ hitters with 2.5+ kills/set, team top-25 nationally in hitting%

### Six-Rotation Force (Silver/Gold only)
**Definition:** Player who plays all 6 rotations at an elite level without substitution.
- **Silver:** Never subbed out, above-average in AKR + DKR + SVR
- **Gold:** Never subbed out, above-average in all 6 component KRs, 3.0+ kills/set AND 3.0+ digs/set

## 5.2 Award Badges

### Conference Player of the Year
**Definition:** Named conference POY.
- Awarded automatically based on verified award

### All-Conference
**Definition:** Named to all-conference team.
- **First Team:** Full badge
- **Second Team:** Half badge
- **Honorable Mention:** Quarter badge

### All-American (AVCA)
**Definition:** Named to AVCA All-America team.
- **First Team:** Gold All-American badge
- **Second Team:** Silver All-American badge
- **Third Team/HM:** Bronze All-American badge

### National POY
**Definition:** Named national player of the year (any major award).
- Gold badge, automatically

---

# SECTION 6: OVERRIDES AND SYSTEM RISKS

## 6.1 Overrides

### Hitting Percentage Override
**Condition:** Player has 3.5+ kills/set but hitting percentage is below .180
**Action:** Cap AKR at 70 regardless of kill volume. High kills on terrible efficiency = volume chucker, not an elite attacker.
**Rationale:** Hitting percentage is THE efficiency metric. A player who attacks 12 times per set and hits .170 is hurting her team despite the raw kill count.

### Setter Without Distribution Override
**Condition:** Setter has 10.0+ assists/set but one hitter has 50%+ of team kills
**Action:** Cap SKR at 75. An assist total built by feeding one player is not elite setting.
**Rationale:** Elite setters distribute. One-read setters are scouted easily.

### Libero Passing Override
**Condition:** Libero has 5.0+ digs/set but serve receive pass rating is below 2.00
**Action:** Cap DKR at 72. A libero who digs but cannot pass serve receive has a critical weakness.
**Rationale:** Serve receive is the first priority for a libero. Digging without passing is incomplete.

### Volume Floor Override
**Condition:** Player has fewer than 50 sets played and claims elite per-set rates
**Action:** Reduce confidence by 15%. Small samples can produce misleading per-set numbers.
**Rationale:** 3 kills in 2 sets = 1.5 kills/set but means nothing.

## 6.2 System Risks

### One-Tempo Risk
**Risk:** A team that relies exclusively on first-tempo (quick) attacks is fragile. When passing breaks down, the quick offense cannot run, and the team has no alternative.
**Detection:** 60%+ of kills from middles; OHs and OPPs have low kill rates
**Impact:** Team KR downshift of 2-4 points for offensive fragility

### Serve Receive Fragility Risk
**Risk:** A team with weak serve receive (sub-2.00 pass rating) cannot run its offense consistently.
**Detection:** Team pass rating below 2.05; high percentage of out-of-system sets
**Impact:** Team KR downshift of 3-5 points

### Single-Attacker Dependency Risk
**Risk:** A team where one player accounts for 45%+ of all kills is predictable and fragile.
**Detection:** One player with 45%+ of team kills
**Impact:** Team KR downshift of 2-3 points

### Blocking Void Risk
**Risk:** A team with weak blocking (under 2.0 team blocks/set at D1 Power 4) gives up free swings.
**Detection:** Team blocks/set below level-adjusted threshold
**Impact:** Team KR downshift of 1-3 points on the defensive side

### Setter Depth Risk
**Risk:** In a 5-1, if the setter is injured or has a bad match, there is no backup plan.
**Detection:** 5-1 system with no capable backup setter (no player with 3.0+ assists/set in limited action)
**Impact:** Fragility flag (affects simulation engine, not direct KR math)

---

# SECTION 7: KLVN COLLEGE LAMBDAS

KLVN normalizes production stats across competitive levels. The reference level (lambda = 1.000) is NCAA D1 Power 4.

**How it works:**
- A player at a level with lambda 0.850 who records 4.0 kills/set has a KLVN-normalized value of 4.0 * 0.850 = 3.40 kills/set for scoring purposes
- A player at a level with lambda 1.000 who records 4.0 kills/set stays at 4.0
- KLVN adjusts INPUTS (raw stats during trait scoring). It NEVER adjusts OUTPUTS (final KR).

### Lambda Table

| Level | Lambda | Rationale |
|-------|--------|-----------|
| NCAA D1 Power 4 | 1.000 | Reference. Big Ten, SEC, ACC, Big 12 are the pinnacle of college volleyball. |
| NCAA D1 Mid-Major | 0.890 | Strong volleyball conferences (WCC, MVC, A-10, AAC, Mountain West). Many produce PVF players. |
| NCAA D1 Low-Major | 0.800 | Smaller D1 conferences. Competitive but thinner rosters. |
| NCAA D2 | 0.740 | Strong programs exist but average competition is a step down. Limited recruiting budgets. |
| NCAA D3 | 0.680 | No athletic scholarships. Pure student-athletes. Some excellent programs. |
| NAIA | 0.720 | Wide range. Top NAIA volleyball programs (Park, Columbia MO, Concordia) are very competitive. Some overlap with low D1. |
| NJCAA D1 | 0.700 | Strong JUCO volleyball. Players transfer to D1 regularly. |
| NJCAA D2 | 0.620 | Regional competition. Limited travel. |
| NJCAA D3 | 0.550 | Smallest JUCO programs. Limited competition. |
| CCCAA | 0.660 | California community colleges. Strong volleyball tradition in CA. Some programs rival NJCAA D1. |

### D1 Conference Class Mapping (Power 4 vs Mid-Major vs Low-Major)

**Power 4 Conferences:**
Big Ten, SEC, ACC, Big 12

**Mid-Major Conferences:**
WCC, MVC, A-10, AAC, Mountain West, Sun Belt, Conference USA, CAA, Patriot League, Big Sky, Big West, WAC, Horizon League, Summit League, MAAC, Ohio Valley, Southland

**Low-Major Conferences:**
America East, Big South, ASUN, Ivy League, MEAC, NEC, SWAC

**Notes:**
- Volleyball conference strength does not perfectly mirror basketball. The Big Ten is by far the strongest volleyball conference. The SEC has grown rapidly. The Pac-12's dissolution redistributed elite volleyball programs across Power 4 conferences.
- Some mid-major conferences (WCC with BYU's legacy, MVC, Big West) have historically strong volleyball programs that punch above their classification.

---

# SECTION 8: COLLEGE LEGENDS

Legends define what each KR tier means at each competitive level. They are display-only - they interpret KR, they do not produce it.

All production benchmarks are per-set rates unless noted.

## LEGEND: NCAA D1 POWER 4

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Generational | 5.0+ kills/set OR 12.0+ assists/set (setter). .370+ hitting%. National POY. Team is Final Four contender. 1.5+ blocks/set (front row). Consensus All-American. Dominates every phase she touches. Once-in-a-decade player at this level. |
| 95-97 | Elite | 4.5+ kills/set OR 11.5+ assists/set. .330+ hitting%. AVCA All-American (1st/2nd team). Conference POY. Team is top-10 nationally. Multi-phase dominance. PVF/overseas pro immediately. |
| 92-94 | All-American Caliber | 4.0+ kills/set OR 11.0+ assists/set. .300+ hitting%. All-American (any team). All-Conference 1st team. Team is regionally ranked. Two or more strong component KRs (85+). |
| 89-91 | Conference Star | 3.5+ kills/set OR 10.5+ assists/set. .275+ hitting%. All-Conference 1st team. Team is conference contender. One component KR at 85+. |
| 86-88 | High-Impact Starter | 3.2+ kills/set OR 10.0+ assists/set. .250+ hitting%. All-Conference 2nd team or HM. Consistent starter on ranked team. |
| 83-85 | Rotation Starter (Strong) | 3.0+ kills/set OR 9.5+ assists/set. .235+ hitting%. Starter on Power 4 team. Solid contributor in at least 2 phases. |
| 80-82 | Rotation Starter (Solid) | 2.5+ kills/set OR 9.0+ assists/set. .220+ hitting%. Starter or heavy-rotation player. One clear strength, no crippling weakness. |
| 75-79 | Rotation Player | 2.0+ kills/set OR 8.0+ assists/set. .200+ hitting%. Rotational player or spot starter. Contributes in limited role. |
| 70-74 | Role Player | 1.5+ kills/set. Limited role (specialist, DS, matchup player). One useful skill. |
| 65-69 | Developing | Freshman or RS adjusting to level. Below rotation-level production. Potential evident but production not there yet. |
| 60-64 | Project | Walk-on or developmental player. Not yet contributing at Power 4 level. |
| Below 60 | Below Level | Production does not warrant a roster spot at this level. |

---

## LEGEND: NCAA D1 MID-MAJOR

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Conference Dominant | 5.0+ kills/set OR 12.0+ assists/set. .350+ hitting%. Conference POY, likely All-American. Could start at Power 4. Transfer portal target. |
| 95-97 | Conference Elite | 4.5+ kills/set OR 11.5+ assists/set. .320+ hitting%. All-Conference 1st team. Conference tournament MVP. PVF draft candidate. |
| 92-94 | All-Conference First Team | 4.0+ kills/set OR 11.0+ assists/set. .290+ hitting%. All-Conference 1st team. Leader of a conference contender. |
| 89-91 | Conference Star | 3.5+ kills/set OR 10.5+ assists/set. .270+ hitting%. All-Conference caliber. Impact starter. |
| 86-88 | High-Impact Starter | 3.2+ kills/set OR 10.0+ assists/set. .250+ hitting%. Strong starter on competitive team. |
| 83-85 | Rotation Starter (Strong) | 3.0+ kills/set OR 9.5+ assists/set. .235+ hitting%. Consistent starter. |
| 80-82 | Rotation Starter (Solid) | 2.5+ kills/set OR 9.0+ assists/set. .220+ hitting%. Starter with one strength. |
| 75-79 | Rotation Player | 2.0+ kills/set. Rotational contributor. |
| 70-74 | Role Player | 1.5+ kills/set. Limited but useful. |
| 65-69 | Developing | Below rotation-level production. |
| Below 65 | Below Level | Not contributing at this level. |

---

## LEGEND: NCAA D1 LOW-MAJOR

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Conference Dominant | 5.0+ kills/set. .340+ hitting%. Best player in conference. Transfer portal priority. |
| 95-97 | Conference Elite | 4.5+ kills/set. .310+ hitting%. All-Conference, conference contender leader. |
| 92-94 | All-Conference | 4.0+ kills/set. .280+ hitting%. All-Conference selection. |
| 89-91 | Conference Star | 3.5+ kills/set. .260+ hitting%. Top performer. |
| 86-88 | High-Impact Starter | 3.0+ kills/set. .240+ hitting%. Strong starter. |
| 83-85 | Rotation Starter | 2.5+ kills/set. .220+ hitting%. |
| 80-82 | Solid Starter | 2.2+ kills/set. .200+ hitting%. |
| 75-79 | Rotation Player | 1.8+ kills/set. Contributing. |
| 70-74 | Role Player | Limited role, useful. |
| Below 70 | Developing / Below Level | Not yet contributing. |

---

## LEGEND: NCAA D2

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Level Dominant | 5.0+ kills/set. .340+ hitting%. Best in conference, possible D1 transfer. |
| 95-97 | Conference Elite | 4.5+ kills/set. .310+ hitting%. All-Conference, leader of ranked team. |
| 92-94 | All-Conference | 4.0+ kills/set. .280+ hitting%. All-Conference, strong team contributor. |
| 89-91 | Conference Star | 3.5+ kills/set. .260+ hitting%. |
| 86-88 | High-Impact Starter | 3.0+ kills/set. .240+ hitting%. |
| 83-85 | Rotation Starter | 2.5+ kills/set. .220+ hitting%. |
| 80-82 | Solid Starter | 2.2+ kills/set. .200+ hitting%. |
| 75-79 | Rotation Player | 1.8+ kills/set. |
| 70-74 | Role Player | Useful role. |
| Below 70 | Developing | Not yet contributing. |

---

## LEGEND: NCAA D3

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Level Dominant | 5.0+ kills/set. .350+ hitting%. Best in conference. D2/NAIA transfer target. |
| 95-97 | Conference Elite | 4.5+ kills/set. .320+ hitting%. All-Conference, conference contender. |
| 92-94 | All-Conference | 3.8+ kills/set. .280+ hitting%. |
| 89-91 | Strong Starter | 3.2+ kills/set. .260+ hitting%. |
| 86-88 | Starter | 2.8+ kills/set. .240+ hitting%. |
| 83-85 | Rotation Starter | 2.3+ kills/set. .220+ hitting%. |
| 80-82 | Rotation Player | 2.0+ kills/set. |
| 75-79 | Contributing Player | 1.5+ kills/set. |
| Below 75 | Developing / Below Level | Limited contribution. |

---

## LEGEND: NAIA

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Level Dominant | 5.0+ kills/set. .350+ hitting%. Conference POY. D1 transfer caliber. Best NAIA programs (Park, Columbia MO, etc.) |
| 95-97 | Conference Elite | 4.5+ kills/set. .310+ hitting%. All-Conference, top player on strong program. |
| 92-94 | All-Conference | 3.8+ kills/set. .280+ hitting%. |
| 89-91 | Strong Starter | 3.2+ kills/set. .255+ hitting%. |
| 86-88 | Starter | 2.8+ kills/set. .235+ hitting%. |
| 83-85 | Rotation Starter | 2.3+ kills/set. .215+ hitting%. |
| 80-82 | Rotation Player | 2.0+ kills/set. |
| 75-79 | Contributing | 1.5+ kills/set. |
| Below 75 | Developing | Limited. |

---

## LEGEND: NJCAA D1

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Level Dominant | 5.0+ kills/set. .350+ hitting%. National tournament contender. D1 transfer target. |
| 95-97 | Conference Elite | 4.5+ kills/set. .310+ hitting%. |
| 92-94 | All-Conference | 3.8+ kills/set. .280+ hitting%. |
| 89-91 | Strong Starter | 3.2+ kills/set. .255+ hitting%. |
| 86-88 | Starter | 2.8+ kills/set. .235+ hitting%. |
| 83-85 | Rotation Starter | 2.3+ kills/set. |
| 80-82 | Rotation Player | 2.0+ kills/set. |
| 75-79 | Contributing | 1.5+ kills/set. |
| Below 75 | Developing | Limited. |

---

## LEGEND: NJCAA D2

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Level Dominant | 4.5+ kills/set. .330+ hitting%. Best in region. |
| 95-97 | Regional Elite | 4.0+ kills/set. .290+ hitting%. |
| 92-94 | All-Conference | 3.5+ kills/set. .265+ hitting%. |
| 89-91 | Strong Starter | 3.0+ kills/set. .240+ hitting%. |
| 86-88 | Starter | 2.5+ kills/set. .220+ hitting%. |
| 83-85 | Rotation Starter | 2.2+ kills/set. |
| 80-82 | Rotation Player | 1.8+ kills/set. |
| Below 80 | Developing | Limited. |

---

## LEGEND: NJCAA D3

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Level Dominant | 4.0+ kills/set. .310+ hitting%. |
| 95-97 | Regional Elite | 3.5+ kills/set. .280+ hitting%. |
| 92-94 | Strong Starter | 3.0+ kills/set. .255+ hitting%. |
| 89-91 | Starter | 2.5+ kills/set. .230+ hitting%. |
| 86-88 | Rotation Starter | 2.2+ kills/set. |
| 83-85 | Rotation Player | 1.8+ kills/set. |
| Below 83 | Developing | Limited. |

---

## LEGEND: CCCAA

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Level Dominant | 4.5+ kills/set. .340+ hitting%. All-State caliber. D1 transfer target. CA volleyball tradition. |
| 95-97 | Regional Elite | 4.0+ kills/set. .300+ hitting%. |
| 92-94 | All-Conference | 3.5+ kills/set. .270+ hitting%. |
| 89-91 | Strong Starter | 3.0+ kills/set. .250+ hitting%. |
| 86-88 | Starter | 2.5+ kills/set. .230+ hitting%. |
| 83-85 | Rotation Starter | 2.2+ kills/set. |
| 80-82 | Rotation Player | 1.8+ kills/set. |
| Below 80 | Developing | Limited. |

---

# SECTION 9: IMPACT MODIFIERS

Impact modifiers are context adjustments that modify how KR is interpreted but do not change the KR number itself.

### Left-Handed Hitter Modifier
**Context:** Left-handed outside hitters and opposites create a tactical advantage (different spin, different angle, harder to block from the right side).
**Modifier:** +2 to system fit score when placed in a position that leverages handedness.
**Does NOT change KR.** Changes system fit calculation.

### Height Advantage Modifier
**Context:** Height at the net is the primary physical advantage in volleyball. A 6'4" MB vs 5'10" MB creates a mismatch that raw stats may not fully capture.
**Modifier:** For every 2 inches above the median height at the position and level, +1 to BKR and AKR for system fit purposes.
**Does NOT change KR.** Changes how the player is projected in physical mismatch simulations.

### International Experience Modifier
**Context:** Players with national team experience (youth or senior) have been exposed to higher-level training and competition.
**Modifier:** +3 to IQKR proxy confidence. National team experience is a data signal.
**Does NOT change KR.** Adjusts confidence.

### Postseason Performance Modifier
**Context:** Players who perform at or above their regular-season level in postseason (conference tournament, NCAA tournament) demonstrate clutch ability.
**Modifier:** +2 to IQKR if postseason production meets or exceeds regular-season per-set rates.
**Does NOT change KR.** Adjusts IQKR confidence and narrative.

---

# SECTION 10: PRO KLVN LAMBDAS

Pro lambdas normalize production across professional leagues worldwide. The reference league (lambda = 1.000) is the Turkish Sultanlar Ligi, widely regarded as the strongest women's club volleyball league in the world.

| League | Lambda | Rationale |
|--------|--------|-----------|
| Turkish Sultanlar Ligi | 1.000 | Reference. Deepest rosters, highest import spending, Champions League dominance. VakifBank, Eczacibasi, Fenerbahce are global standard-bearers. |
| Italian Serie A1 | 0.970 | Historically dominant. Slightly less depth than Turkey in recent years but top clubs (Conegliano, Scandicci, Milano) are world-class. |
| Brazilian Superliga | 0.940 | Strong domestic league powered by Brazil's volleyball culture. Top clubs competitive internationally. |
| CEV Champions League | 1.000 | Cross-league competition. Uses team-level assessment, not league-level lambda. Treated same as Turkish reference. |
| Japanese V.League | 0.880 | Professional, well-organized. Strong Asian volleyball tradition. Slightly below top European leagues in depth. |
| Korean V-League | 0.860 | Competitive Asian league. Fewer international imports than Turkey/Italy. |
| Chinese Volleyball Super League | 0.870 | Improving rapidly. Government investment. Top clubs have world-class Chinese national team players. |
| Polish Liga Siatkowki (Women) | 0.900 | Strong European league. Growing investment. |
| Pro Volleyball Federation (PVF) | 0.850 | US league launched 2024. Growing rapidly. Rosters mix US national teamers, college stars, and international veterans. Still establishing depth. |
| Athletes Unlimited Volleyball | 0.800 | Innovative format (individual scoring, rotating captains). More of a showcase than a traditional league. Attracts strong players but format limits traditional team chemistry evaluation. |

---

# SECTION 11: PRO PLAYER KR LEGEND

| KR Range | Label | Profile | Approximate Salary Range (Top League) |
|----------|-------|---------|--------------------------------------|
| 96-100 | Franchise Player | Best in the world at her position. National team star. Carries a club to Champions League contention. VakifBank/Conegliano caliber. | $500K-$1.5M+ (Turkey/Italy) |
| 92-95 | All-League Star | Among the best in any league she plays in. Multi-year national team contributor. Anchors a title contender. | $250K-$600K |
| 88-91 | Impact Starter | Quality starter on a top-half club. Strong national team roster candidate. Import-caliber for most leagues. | $120K-$300K |
| 84-87 | Solid Professional | Reliable starter or high-end rotation player at the top professional level. Strong domestic league player. | $60K-$150K |
| 80-83 | Professional Rotation | Rotation player in a top league or starter in a second-tier league. PVF starter quality. | $30K-$80K |
| 75-79 | Fringe Professional | Roster player in top leagues or impact player in developing leagues. PVF roster player. Athletes Unlimited caliber. | $20K-$40K |
| 70-74 | Developmental Pro | Practice squad, reserve list, or lower-tier domestic league. | $10K-$25K |
| Below 70 | Below Pro Level | Does not project as a sustainable professional. | N/A |

---

# SECTION 12: PRO TEAM REGISTRY

## 12.1 Pro Volleyball Federation (PVF) - United States

| Team | City | Arena |
|------|------|-------|
| Atlanta Vibe | Atlanta, GA | Gas South Arena |
| Columbus Fury | Columbus, OH | Nationwide Arena |
| Grand Rapids Rise | Grand Rapids, MI | Van Andel Arena |
| Indy Ignite | Indianapolis, IN | Gainbridge Fieldhouse |
| Omaha Supernovas | Omaha, NE | CHI Health Center |
| Orlando Valkyries | Orlando, FL | Addition Financial Arena |
| San Diego Mojo | San Diego, CA | Viejas Arena |
| Vegas Thrill | Las Vegas, NV | Lee's Family Forum |
| Brooklyn Rise (expansion) | Brooklyn, NY | Barclays Center |
| Houston Crescendo (expansion) | Houston, TX | TBD |

Note: PVF launched in 2024 and is expanding. Roster and team count may change. Search web for current season information.

## 12.2 Turkish Sultanlar Ligi - Top Clubs

| Team | City | Notes |
|------|------|-------|
| VakifBank Istanbul | Istanbul | Most decorated women's club in world history. Multiple Champions League titles. |
| Eczacibasi Istanbul | Istanbul | Perennial contender. Massive budget. |
| Fenerbahce Istanbul | Istanbul | Growing volleyball investment. Competing for top imports. |
| Turk Hava Yollari (THY) | Istanbul | National airline-sponsored. Strong roster. |
| Galatasaray | Istanbul | Traditional power, volleyball program fluctuates. |
| Kuzeyboru Ankara | Ankara | Strong program outside Istanbul. |

## 12.3 Italian Serie A1 - Top Clubs

| Team | City | Notes |
|------|------|-------|
| Prosecco DOC Imoco Conegliano | Conegliano | Dominant Italian and European club. Multiple Champions League titles. |
| Savino Del Bene Scandicci | Scandicci | Consistent top-4 finisher. Strong imports. |
| Vero Volley Milano | Milan | Large market, growing program. |
| Numia Vero Volley Milano | Milan | Top investment. |
| Igor Gorgonzola Novara | Novara | Historical power. |

---

# SECTION 13: PRO SALARY FRAMEWORK

Pro volleyball salaries vary dramatically by league, position, and nationality. Foreign import players typically earn more than domestic players in most leagues.

## 13.1 Salary Ranges by KR Tier (Annual)

### Turkish Sultanlar Ligi
| KR Range | Import Salary | Domestic Salary |
|----------|--------------|----------------|
| 96-100 | $700K-$1.5M | $200K-$500K |
| 92-95 | $350K-$700K | $120K-$250K |
| 88-91 | $150K-$350K | $60K-$130K |
| 84-87 | $80K-$150K | $30K-$70K |
| 80-83 | $40K-$80K | $15K-$35K |

### Italian Serie A1
| KR Range | Import Salary | Domestic Salary |
|----------|--------------|----------------|
| 96-100 | $600K-$1.2M | $150K-$400K |
| 92-95 | $300K-$600K | $100K-$200K |
| 88-91 | $130K-$300K | $50K-$120K |
| 84-87 | $70K-$130K | $25K-$60K |
| 80-83 | $35K-$70K | $12K-$30K |

### Pro Volleyball Federation (PVF)
| KR Range | Salary |
|----------|--------|
| 96-100 | $150K-$300K |
| 92-95 | $80K-$150K |
| 88-91 | $50K-$90K |
| 84-87 | $30K-$55K |
| 80-83 | $20K-$35K |

Note: PVF salaries are growing year over year as the league expands and revenue increases. These ranges reflect early-era PVF and will need updating.

### Brazilian Superliga
| KR Range | Salary |
|----------|--------|
| 96-100 | $300K-$800K |
| 92-95 | $150K-$350K |
| 88-91 | $70K-$180K |
| 84-87 | $35K-$80K |
| 80-83 | $15K-$40K |

### Athletes Unlimited
| KR Range | Salary |
|----------|--------|
| All tiers | $15K-$50K per season (short format, supplementary income) |

---

# SECTION 14: COMPOSITE BOUNDING AND PROXY CONFIDENCE

## 14.1 Composite Bounding v0.3
No single component KR can contribute more than 45% of the final OPF composite, even if the assigned OPF weight exceeds 45%.

**Example:** A setter's OPF assigns SKR at 40%. This is under the 45% cap, so it applies as-is. If a future OPF adjustment pushed SKR to 48%, it would be capped at 45% and the excess redistributed proportionally to other components.

## 14.2 Proxy Confidence Weighting v0.2
When a trait is scored from proxy data (not directly measured), its weight in the component KR is reduced.

| Proxy Confidence | Weight Multiplier |
|-----------------|------------------|
| 1.0 (Direct measurement) | 1.00 |
| 0.8 | 0.80 |
| 0.6 | 0.60 |
| 0.5 | 0.50 |
| 0.4 | 0.40 |
| 0.3 | 0.30 |
| 0.0 (UNSCORED) | Excluded from component |

When traits are excluded (proxy confidence 0.0), the remaining scored traits within that component are re-weighted proportionally to sum to 1.0.

---

# END OF FILE 02
