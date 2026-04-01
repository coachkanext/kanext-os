# Men's Volleyball Player Evaluation Reference v1

---

## 0. SCOPE

This is the single authoritative reference document for all men's volleyball evaluation data: trait definitions, trait bands (with men's-specific benchmarks), archetype library, position OPF weights, system demand profiles, badges, overrides, system risks, and composite bounding/proxy confidence rules.

College legends, KLVN lambdas, pro legends, pro KLVN, and pro team registry are in separate files.

**This file is large. Search by section header, not full load.**

---

# SECTION 1: TRAIT LIBRARY

Traits are organized by the 6 component KR clusters. Each trait has a definition, V1 measurement method, scoring bands (0-100 scale), and KLVN normalization notes. All benchmarks are men's-specific and reflect the higher net (2.43m), faster tempo, and greater power of the men's game.

## 1.1 ATTACK CLUSTER (AKR)

### Trait: Kill Efficiency (kills/set)
**Definition:** Rate of kills per set played. The primary volume indicator for attackers.
**V1 measurement:** Kills / Sets played
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | D1 Benchmark (OH/OPP) |
|------|-----------|----------------------|
| Elite | 90-100 | 5.0+ kills/set |
| Above Average | 75-89 | 3.8-4.99 kills/set |
| Average | 55-74 | 2.8-3.79 kills/set |
| Below Average | 35-54 | 1.8-2.79 kills/set |
| Poor | 0-34 | Under 1.8 kills/set |

**Position context:** MBs have lower volume but higher efficiency. Liberos/DS are exempt. Men's kill rates are higher than women's due to the power-oriented game.

### Trait: Hitting Percentage
**Definition:** (Kills - Errors) / Attempts. THE key offensive efficiency metric.
**V1 measurement:** Directly available in most stat lines.
**KLVN normalization:** Not normalized (efficiency is level-independent).

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | .400+ |
| Above Average | 75-89 | .310-.399 |
| Average | 55-74 | .230-.309 |
| Below Average | 35-54 | .150-.229 |
| Poor | 0-34 | Under .150 |

**Position context:** Men's MBs typically hit .350+ (quick attack efficiency). Men's OHs hitting .280+ is excellent. Men's OPPs should hit .300+ as primary scorers. Hitting percentages are generally higher in men's volleyball due to higher contact point and faster approach.

### Trait: Attack Attempts (volume)
**Definition:** Total attack attempts per set. Indicates how much the offense runs through this player.
**V1 measurement:** Attempts / Sets played

| Band | Score Range | D1 Benchmark (OH/OPP) |
|------|-----------|----------------------|
| Elite | 90-100 | 11.0+ attempts/set |
| Above Average | 75-89 | 9.0-10.99 attempts/set |
| Average | 55-74 | 7.0-8.99 attempts/set |
| Below Average | 35-54 | 5.0-6.99 attempts/set |
| Poor | 0-34 | Under 5.0 attempts/set |

### Trait: Out-of-System Kills
**Definition:** Kills scored when the pass is off-target and the setter delivers a non-ideal set.
**V1 measurement:** Not directly available at V1. Proxy: high kills/set with moderate team passing suggests ability to convert out-of-system.
**V1 proxy confidence:** 0.5

### Trait: Transition Kills
**Definition:** Kills scored in transition (after a dig, not on serve receive).
**V1 measurement:** Not directly available at V1. Full measurement requires V2+.
**V1 proxy confidence:** 0.5

### Trait: Shot Variety
**Definition:** Ability to hit line, cross, sharp angle, tip, and tool the block.
**V1 measurement:** Not available at V1. Requires V2+ video data.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Tool/Tip Usage
**Definition:** Ability to use the block (tool shots off blocker's hands) and tip/roll shots to change speed. In men's volleyball, tooling the block is a more developed skill due to the higher block.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Approach Speed and Timing
**Definition:** Quality of hitting approach, timing with the set, and acceleration through contact.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Arm Swing Velocity
**Definition:** Speed of the attack. Men's top attackers generate 60-80 mph attacks. Elite power is a differentiator.
**V1 measurement:** Not available at V1. Requires radar or video tracking.
**V1 proxy confidence:** 0.0

---

## 1.2 BLOCK CLUSTER (BKR)

### Trait: Block Rate (blocks/set)
**Definition:** Total blocks per set (solo + assists). Primary blocking volume indicator.
**V1 measurement:** (Solo Blocks + Block Assists) / Sets Played
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | D1 Benchmark |
|------|-----------|-------------|
| Elite | 90-100 | 1.50+ blocks/set |
| Above Average | 75-89 | 1.10-1.49 blocks/set |
| Average | 55-74 | 0.70-1.09 blocks/set |
| Below Average | 35-54 | 0.40-0.69 blocks/set |
| Poor | 0-34 | Under 0.40 blocks/set |

**Position context:** Men's blocking rates are higher than women's due to the higher net and greater reach. MBs lead in blocks. OPPs block from right side against opponent OHs.

### Trait: Solo Blocks
**Definition:** Blocks where this player alone stops the attack.
**V1 measurement:** Solo blocks / Sets played

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 0.45+ solo blocks/set |
| Above Average | 75-89 | 0.30-0.44/set |
| Average | 55-74 | 0.15-0.29/set |
| Below Average | 35-54 | 0.07-0.14/set |
| Poor | 0-34 | Under 0.07/set |

### Trait: Block Assists
**Definition:** Blocks involving this player and at least one teammate.
**V1 measurement:** Block assists / Sets played

### Trait: Stuff Block Rate
**Definition:** Blocks that result in a direct point.
**V1 measurement:** Not always separated in stats. Solo blocks are a proxy.
**V1 proxy confidence:** 0.6

### Trait: Touch Rate
**Definition:** Percentage of opposing attacks where this blocker gets a touch on the ball.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Seal/Close Positioning
**Definition:** Ability to close the block with the adjacent blocker, eliminating the seam.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Read Speed
**Definition:** How quickly the blocker reads the setter and moves to the correct hitter.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Transition Off Block
**Definition:** Ability to land from a block attempt and immediately transition to attack.
**V1 measurement:** Not directly available. Proxy: MBs with high kill rates AND high block rates.
**V1 proxy confidence:** 0.4

---

## 1.3 DIG/DEFENSE CLUSTER (DKR)

### Trait: Dig Rate (digs/set)
**Definition:** Digs per set played. Primary defensive volume indicator.
**V1 measurement:** Digs / Sets Played
**KLVN normalization:** Multiply raw by level lambda.

| Band | Score Range | D1 Benchmark |
|------|-----------|-------------|
| Elite | 90-100 | 4.5+ digs/set |
| Above Average | 75-89 | 3.2-4.49 digs/set |
| Average | 55-74 | 2.2-3.19 digs/set |
| Below Average | 35-54 | 1.3-2.19 digs/set |
| Poor | 0-34 | Under 1.3 digs/set |

**Position context:** Men's dig rates are slightly lower than women's because the ball is hit harder and rallies can be shorter. Liberos lead in digs. Men's liberos who consistently dig hard-driven attacks are elite.

### Trait: Serve Receive Pass Rating
**Definition:** Quality of serve reception on a 0-3 scale. 3 = perfect pass. 0 = ace/unplayable.
**V1 measurement:** Available from some stat services.
**This is especially critical in men's volleyball** because jump serves are so dominant. Receiving a 70+ mph jump serve cleanly requires elite skill.

| Band | Score Range | Pass Rating Benchmark |
|------|-----------|---------------------|
| Elite | 90-100 | 2.35+ |
| Above Average | 75-89 | 2.15-2.34 |
| Average | 55-74 | 1.95-2.14 |
| Below Average | 35-54 | 1.75-1.94 |
| Poor | 0-34 | Under 1.75 |

**Note:** Men's pass ratings are slightly lower than women's because jump serves are harder to receive. A 2.35+ pass rating against top men's jump servers is truly elite.

### Trait: Serve Receive Volume
**Definition:** Number of serve receive attempts per set.
**V1 measurement:** Serve receive attempts / Sets played (when available)

### Trait: Platform Consistency
**Definition:** Consistency of defensive platform across different ball speeds and angles.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Range and Pursuit
**Definition:** Ability to cover ground and make plays outside the primary defensive zone.
**V1 measurement:** Not directly available. Proxy: high dig rate relative to position.
**V1 proxy confidence:** 0.4

### Trait: Emergency Technique
**Definition:** Ability to make one-arm digs, overhead digs, barrel rolls, and other non-standard plays.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

---

## 1.4 SERVE CLUSTER (SVR)

### Trait: Ace Rate (aces/set)
**Definition:** Service aces per set. Direct points from serving.
**V1 measurement:** Aces / Sets played
**KLVN normalization:** Multiply raw by level lambda.

| Band | Score Range | D1 Benchmark |
|------|-----------|-------------|
| Elite | 90-100 | 0.55+ aces/set |
| Above Average | 75-89 | 0.40-0.54 aces/set |
| Average | 55-74 | 0.25-0.39 aces/set |
| Below Average | 35-54 | 0.12-0.24 aces/set |
| Poor | 0-34 | Under 0.12 aces/set |

**Men's serving context:** Jump serves are the dominant serve type in men's college volleyball. Elite men's jump serves reach 70-85 mph. Ace rates are higher in men's volleyball because the serve is a more lethal weapon. Float serves are tactical tools used for variation, not the default.

### Trait: Ace-to-Error Ratio
**Definition:** Aces divided by service errors. Measures aggressiveness vs reliability.
**V1 measurement:** Aces / Service errors

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 1.40+ |
| Above Average | 75-89 | 0.95-1.39 |
| Average | 55-74 | 0.65-0.94 |
| Below Average | 35-54 | 0.35-0.64 |
| Poor | 0-34 | Under 0.35 |

**Note:** Men's ace-to-error ratios are slightly lower than women's because aggressive jump serving produces more errors. This is acceptable because the pressure created by an 80 mph jump serve, even when it does not ace, disrupts the opponent's passing.

### Trait: Service Error Rate
**Definition:** Service errors per set. Lower is better.
**V1 measurement:** Service errors / Sets played

Men's volleyball tolerates higher service error rates than women's because the jump serve creates more pressure. A player with 0.50 aces/set and 0.50 errors/set is valuable because every serve creates defensive difficulty.

### Trait: Serve Velocity
**Definition:** Speed of serve in mph.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Jump Serve Consistency
**Definition:** Ability to maintain effective jump serve throughout a match without deteriorating mechanics or accuracy.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Float vs Jump Serve Mix
**Definition:** Ability to vary between float and jump serves. Float serves are underused in men's volleyball and can be tactically devastating because passers practice against jump serves.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

---

## 1.5 SET CLUSTER (SKR)

### Trait: Assist Rate (assists/set)
**Definition:** Assists per set played. Primary volume indicator for setters.
**V1 measurement:** Assists / Sets played
**KLVN normalization:** Multiply raw by level lambda.

| Band | Score Range | D1 Benchmark (Setters) |
|------|-----------|----------------------|
| Elite | 90-100 | 11.5+ assists/set |
| Above Average | 75-89 | 10.0-11.49 assists/set |
| Average | 55-74 | 8.5-9.99 assists/set |
| Below Average | 35-54 | 7.0-8.49 assists/set |
| Poor | 0-34 | Under 7.0 assists/set |

**Men's context:** Men's assist rates are slightly higher than women's because the kill rate is higher (more assists generated per offensive sequence). Evaluate alongside team hitting percentage.

### Trait: Distribution Balance
**Definition:** How evenly the setter distributes sets across all available hitters.
**V1 measurement:** Not directly in box score. Proxy: if a team has 3+ hitters with 2.5+ kills/set, the setter is distributing.
**V1 proxy confidence:** 0.5

### Trait: Set Accuracy/Location
**Definition:** Percentage of sets that are hittable.
**V1 measurement:** Not available at V1. Proxy: team hitting percentage.
**V1 proxy confidence:** 0.5

### Trait: Tempo Control
**Definition:** Ability to run quick sets, medium, and high sets.
**V1 measurement:** Not directly available. Proxy: middle blocker kill rates and hitting%.
**V1 proxy confidence:** 0.4

### Trait: Out-of-System Setting
**Definition:** Quality of sets when the pass is off-target.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Dump/Tip Effectiveness
**Definition:** Setter's ability to score on second contact. Men's setters can be more physically dominant at the net and generate harder dumps.
**V1 measurement:** Available in some stat lines.

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 0.45+ setter kills/set |
| Above Average | 75-89 | 0.30-0.44/set |
| Average | 55-74 | 0.15-0.29/set |
| Below Average | 35-54 | 0.05-0.14/set |
| Rare | 0-34 | Under 0.05/set |

### Trait: Decision Quality
**Definition:** Quality of set selection given the game situation.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0

### Trait: Ball Handling Errors
**Definition:** Setting errors (double contacts, lifts, mishandles). Lower is better.
**V1 measurement:** Ball handling errors / Sets played

---

## 1.6 VOLLEYBALL IQ CLUSTER (IQKR)

### Trait: Rotation Discipline
**Definition:** Correct positioning in all 6 rotations.
**V1 measurement:** Not available at V1. Proxy: low positional errors.
**V1 proxy confidence:** 0.3

### Trait: Court Awareness and Communication
**Definition:** Ability to read the game, call shots, direct teammates.
**V1 measurement:** Not available at V1. Inferred from leadership roles.
**V1 proxy confidence:** 0.3

### Trait: Adjustment Speed
**Definition:** How quickly the player adapts between sets and matches.
**V1 measurement:** Not available at V1. Proxy: postseason performance, multi-match consistency.
**V1 proxy confidence:** 0.3

### Trait: Clutch Performance
**Definition:** Performance in critical moments (set point, match point, fifth set).
**V1 measurement:** Partially available. Conference tournament/NCAA tournament stats.
**V1 proxy confidence:** 0.4

### Trait: Serve Strategy
**Definition:** Ability to serve tactically (targeting weak passers, changing serve type based on situation).
**V1 measurement:** Not directly available at V1.
**V1 proxy confidence:** 0.2

---

# SECTION 2: ARCHETYPE LIBRARY

## 2.1 SETTER ARCHETYPES

### Floor General
**Definition:** A setter who controls the entire offense through distribution, tempo management, and leadership. The classic setter archetype.
**Trait signature:** Elite assist rate, balanced distribution, strong tempo control.
**System fit:** Ideal for 5-1 where one setter runs the show.
**Example profile:** 11.0+ assists/set, team hitting .280+, 3+ hitters with 2.5+ kills/set.

### Tempo Setter
**Definition:** A setter whose primary weapon is speed. Runs a fast-tempo offense that overwhelms opposing blockers.
**Trait signature:** Elite tempo control, high quick-set accuracy, strong rapport with middles.
**System fit:** Ideal for Fast Tempo and Slide-Heavy offenses.
**Example profile:** MB hitters hitting .380+, high percentage of first-tempo sets.

### Dump Threat
**Definition:** A setter who is a legitimate scoring threat. Men's setters can be more physical at the net, making the dump/tip game more dangerous.
**Trait signature:** High dump/tip effectiveness, strong attack instincts when front row.
**System fit:** Especially valuable in 5-1 where he is front row for 3 rotations.
**Example profile:** 0.35+ setter kills/set, creates 1-on-1 hitting opportunities by freezing the MB.

### Defensive Setter
**Definition:** A setter whose defensive contribution is exceptional. Strong back-row defender and reliable passer.
**Trait signature:** High DKR for a setter, strong digs/set, consistent setting over flashy.
**System fit:** Valuable in any system but especially defensive-minded programs.
**Example profile:** 2.5+ digs/set (unusual for a setter), reliable passing.

---

## 2.2 OUTSIDE HITTER ARCHETYPES

### Power OH
**Definition:** Primary scoring weapon from the left side. Generates kills through power and the ability to hit over/through the block.
**Trait signature:** Elite AKR, strong arm swing velocity, high attack volume.
**System fit:** Anchors any offensive system as the go-to attacker.
**Example profile:** 4.5+ kills/set, .300+ hitting%, 10.0+ attempts/set.

### All-Around OH
**Definition:** The complete outside hitter. Contributes in every phase. The gold standard.
**Trait signature:** Above-average in all 6 component KRs. Six-rotation player.
**System fit:** Fits everywhere. Coaches build around this player.
**Example profile:** 4.0+ kills/set, .280+ hitting%, 2.5+ digs/set, 2.20+ pass rating, 0.35+ aces/set.

### Serve Receive Specialist OH
**Definition:** An OH whose primary value is elite serve receive against men's jump serves.
**Trait signature:** Elite serve receive (2.30+ pass rating against jump serves), reliable platform.
**System fit:** Critical in Fast Tempo systems.
**Example profile:** 2.35+ pass rating, 3.0+ kills/set, .250+ hitting%.

### Six-Rotation Force
**Definition:** An OH who dominates in all 6 rotations without any substitution.
**Trait signature:** Strong across AKR, DKR, SVR. Back-row attack capable.
**System fit:** Maximum value in 5-1 systems.
**Example profile:** 4.0+ kills/set, 3.0+ digs/set, 0.35+ aces/set, never substituted out.

---

## 2.3 MIDDLE BLOCKER ARCHETYPES

### Quick Attacker
**Definition:** A middle whose primary weapon is the quick attack at first tempo.
**Trait signature:** Elite hitting percentage (.380+), high quick-attack conversion.
**System fit:** Essential in Fast Tempo offenses.
**Example profile:** .400+ hitting%, 2.5+ kills/set on 5.0 or fewer attempts/set.

### Block Anchor
**Definition:** A middle whose blocking is the defensive centerpiece.
**Trait signature:** Elite BKR (1.40+ blocks/set), strong read speed, excellent seal technique.
**System fit:** Critical in Read Block defensive systems.
**Example profile:** 1.50+ blocks/set, 0.35+ solo blocks/set. Team holding opponents to .200 or lower hitting%.

### Slide Specialist
**Definition:** A middle who excels at the slide attack.
**Trait signature:** High kill efficiency on slides, strong lateral movement.
**System fit:** Ideal for Slide-Heavy and Swing Offense systems.

### Two-Way Middle
**Definition:** A middle who impacts the game equally on offense and defense. Rare and extremely valuable.
**Trait signature:** Above-average in both AKR and BKR. .320+ hitting%, 1.20+ blocks/set.
**System fit:** Fits any system.
**Example profile:** .350+ hitting%, 1.30+ blocks/set, 2.5+ kills/set.

---

## 2.4 OPPOSITE/RIGHT SIDE ARCHETYPES

### Power Opposite
**Definition:** A right-side hitter who generates kills through raw power. In men's volleyball, the opposite is often the team's primary scoring weapon.
**Trait signature:** Elite AKR from right side, high kill volume, strong jump serve.
**System fit:** Anchors the right-side attack in any system.
**Example profile:** 4.5+ kills/set from right side, .310+ hitting%, 1.10+ blocks/set.

### Scoring Opposite
**Definition:** An opposite whose sole job is to terminate. May not pass or dig at an elite level.
**Trait signature:** Dominant AKR, very high kill rate per set. Limited DKR.
**System fit:** Best in systems where the OPP does not have serve receive responsibility.
**Example profile:** 5.0+ kills/set, .300+ hitting%, 10.0+ attempts/set.

### Serving Opposite
**Definition:** An opposite whose jump serve is a primary weapon. The combination of right-side attack plus elite serving creates a dual threat.
**Trait signature:** High SVR (0.50+ aces/set), strong AKR.
**System fit:** Maximized when serving strategy is central to the game plan.
**Example profile:** 0.50+ aces/set, 1.20+ ace-to-error ratio, 4.0+ kills/set.

### Complete Opposite
**Definition:** A right-side player who scores, blocks, and serves at above-average levels and contributes in all phases.
**Trait signature:** No single elite component but strong across AKR, BKR, SVR.
**System fit:** Fits everywhere. Defensive versatility makes this archetype valuable.
**Example profile:** 3.5+ kills/set, .280+ hitting%, 1.00+ blocks/set, 0.40+ aces/set.

---

## 2.5 LIBERO ARCHETYPES

### Pass-First Libero
**Definition:** A libero whose primary value is elite serve receive against men's jump serves.
**Trait signature:** Elite serve receive (2.35+ pass rating), high reception volume.
**System fit:** Critical in Fast Tempo systems.
**Example profile:** 2.35+ pass rating against jump serves, team runs quick tempo at 80%+ when he passes.

### Defensive Libero
**Definition:** A libero whose digging and floor defense is the standout skill.
**Trait signature:** Elite dig rate (4.5+ digs/set), exceptional range.
**System fit:** Maximized on teams that play rally-heavy volleyball.
**Example profile:** 5.0+ digs/set, multiple 15+ dig matches per season.

### Floor Leader Libero
**Definition:** A libero who is the defensive quarterback.
**Trait signature:** High IQKR, strong communication, consistent stats.
**System fit:** Valuable everywhere. Especially impactful on young teams.
**Example profile:** Team captain, consistently solid dig and pass numbers.

---

## 2.6 DEFENSIVE SPECIALIST ARCHETYPES

### Serve Receive DS
**Definition:** A DS who enters primarily to improve serve receive in specific rotations.
**Trait signature:** Elite serve receive pass rating.
**Example profile:** 2.30+ pass rating, limited sets played.

### Defensive DS
**Definition:** A DS who enters primarily for back-row defense.
**Trait signature:** Strong dig rate and defensive positioning.

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
| DKR (Dig/Defense) | 23% |
| SVR (Serve) | 17% |
| BKR (Block) | 12% |
| IQKR (VB IQ) | 13% |
| SKR (Set) | 5% |

Note: SVR is weighted higher for men's OHs than women's (17% vs 15%) because serving is a more dominant weapon in the men's game.

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
| AKR (Attack) | 36% |
| BKR (Block) | 18% |
| SVR (Serve) | 17% |
| IQKR (VB IQ) | 12% |
| DKR (Dig/Defense) | 12% |
| SKR (Set) | 5% |

Note: Men's opposites have SVR weighted higher (17% vs 15%) because the opposite is often the team's best jump server.

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

At the pro level, physical dominance and specialized skills are weighted more heavily.

### Setter (Pro)
| Component | Weight |
|-----------|--------|
| SKR (Set) | 42% |
| IQKR (VB IQ) | 22% |
| DKR (Dig/Defense) | 12% |
| SVR (Serve) | 10% |
| AKR (Attack) | 11% |
| BKR (Block) | 3% |

Note: AKR increases at pro level because setter dumps against elite pro defenses require more physicality.

### Outside Hitter (Pro)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 32% |
| DKR (Dig/Defense) | 20% |
| SVR (Serve) | 18% |
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
| AKR (Attack) | 38% |
| BKR (Block) | 18% |
| SVR (Serve) | 16% |
| IQKR (VB IQ) | 12% |
| DKR (Dig/Defense) | 11% |
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
DS role is rare at the pro level. Most pro teams use a single libero.

---

# SECTION 4: SYSTEM DEMAND PROFILES

## 4.1 Offensive System Demands
Same 6 systems as women's volleyball but with men's-specific notes.

### 5-1 System
**Core demands:**
- One elite setter who plays all 6 rotations (SKR 80+)
- Two strong outside hitters (AKR 75+, DKR 70+)
- Two middles who can run quick tempo (AKR 70+ with .320+ hitting%)
- One opposite who can score from right side (AKR 78+ - higher threshold in men's game)
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
- Six front-row attackers at all times
- Less common in elite men's programs (5-1 dominates)

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | B (High) - two needed |
| OH | A (Critical) |
| MB | A (Critical) |
| OPP | A (Critical) |
| Libero | B (High) |
| DS | C (Optional) |

### Swing Offense
**Core demands:**
- Hitters who can attack from multiple positions
- Elite setter (SKR 85+)
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
- Elite first-ball passing (libero and OHs with 2.25+ pass rating)
- Setter who can run quick sets consistently
- Middles who can convert first-tempo attacks (.350+ hitting%)
- System breaks down when passing is poor (fragile)

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | A (Critical) |
| OH | B (High) - must pass at 2.25+ |
| MB | A (Critical) - quick attack is the core |
| OPP | B (High) |
| Libero | A (Critical) - passing makes or breaks |
| DS | B (High) |

### Slide-Heavy
**Core demands:**
- Middles who can run slide attacks
- Opposites who can also run slides
- Setter who can deliver slide sets accurately

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | A (Critical) |
| OH | B (High) |
| MB | A (Critical) |
| OPP | A (Critical) |
| Libero | B (High) |
| DS | C (Optional) |

### Pipe-Heavy
**Core demands:**
- Back-row attackers (OHs and OPPs with back-row attack capability)
- Men's back-row attacks are more powerful due to higher vertical and arm swing
- Setter who can set behind him (pipe set accuracy)
- Strong passing to enable back-row attack

**Position demand tiers:**
| Position | Demand Tier |
|----------|------------|
| Setter | A (Critical) |
| OH | A (Critical) - must attack from back row |
| MB | B (High) |
| OPP | A (Critical) - back-row attack dimension |
| Libero | B (High) |
| DS | C (Optional) |

## 4.2 Defensive System Demands
Same 5 systems as women's. See File 04 (Simulation Engine) for interaction details. Key difference: men's attacks come faster and harder, making read block more challenging and commit block riskier.

---

# SECTION 5: BADGES

## 5.1 Performance Badges

### Triple-Double (Bronze/Silver/Gold)
- **Bronze:** 1 triple-double in a season
- **Silver:** 3+ triple-doubles in a season
- **Gold:** 5+ triple-doubles in a season

### Ace Machine (Bronze/Silver/Gold)
- **Bronze:** 0.45+ aces/set for the season
- **Silver:** 0.55+ aces/set for the season
- **Gold:** 0.65+ aces/set AND 1.30+ ace-to-error ratio

### Serve Receive Anchor (Bronze/Silver/Gold)
- **Bronze:** 2.25+ pass rating on 5.0+ receptions/set
- **Silver:** 2.35+ pass rating on 6.0+ receptions/set
- **Gold:** 2.45+ pass rating on 7.0+ receptions/set

### Block Party (Bronze/Silver/Gold)
- **Bronze:** 1.30+ blocks/set for the season
- **Silver:** 1.50+ blocks/set for the season
- **Gold:** 1.70+ blocks/set AND 0.40+ solo blocks/set

### Floor General (Silver/Gold only)
- **Silver:** 11.0+ assists/set, team hitting .280+, 3+ hitters with 3.0+ kills/set
- **Gold:** 12.0+ assists/set, team hitting .310+, 4+ hitters with 3.0+ kills/set, top-10 nationally

### Six-Rotation Force (Silver/Gold only)
- **Silver:** Never subbed out, above-average in AKR + DKR + SVR
- **Gold:** Never subbed out, above-average in all 6 component KRs, 3.5+ kills/set AND 2.5+ digs/set

### Jump Serve Weapon (Bronze/Silver/Gold) - Men's Specific
- **Bronze:** 0.40+ aces/set AND estimated serve speed 65+ mph
- **Silver:** 0.50+ aces/set AND opponent pass rating drops below 2.00 on his serve
- **Gold:** 0.60+ aces/set AND consistently disrupts opponent's offense from the service line

## 5.2 Award Badges

### Conference Player of the Year
- Awarded automatically based on verified award

### All-Conference
- **First Team:** Full badge
- **Second Team:** Half badge
- **Honorable Mention:** Quarter badge

### All-American (AVCA)
- **First Team:** Gold All-American badge
- **Second Team:** Silver All-American badge
- **Third Team/HM:** Bronze All-American badge

### National POY
- Gold badge, automatically

---

# SECTION 6: OVERRIDES AND SYSTEM RISKS

## 6.1 Overrides

### Hitting Percentage Override
**Condition:** Player has 4.0+ kills/set but hitting percentage is below .200
**Action:** Cap AKR at 70. High kills on terrible efficiency = volume chucker.

### Setter Without Distribution Override
**Condition:** Setter has 10.5+ assists/set but one hitter has 50%+ of team kills
**Action:** Cap SKR at 75. One-read setters are scouted easily.

### Libero Passing Override
**Condition:** Libero has 4.5+ digs/set but serve receive pass rating is below 1.95
**Action:** Cap DKR at 72. A libero who digs but cannot pass jump serves has a critical weakness.

### Volume Floor Override
**Condition:** Player has fewer than 50 sets played and claims elite per-set rates
**Action:** Reduce confidence by 15%.

## 6.2 System Risks

### One-Tempo Risk
**Risk:** Team relies exclusively on quick attacks. When passing breaks down, the offense collapses.
**Detection:** 60%+ of kills from middles
**Impact:** Team KR downshift of 2-4 points

### Serve Receive Fragility Risk
**Risk:** Team with weak serve receive (sub-1.95 pass rating) cannot handle men's jump serves.
**Detection:** Team pass rating below 2.00
**Impact:** Team KR downshift of 3-5 points

### Single-Attacker Dependency Risk
**Risk:** One player accounts for 45%+ of all kills.
**Detection:** One player with 45%+ of team kills
**Impact:** Team KR downshift of 2-3 points

### Blocking Void Risk
**Risk:** Team with weak blocking gives up free swings.
**Detection:** Team blocks/set below 2.2 at D1 level
**Impact:** Team KR downshift of 1-3 points on defensive side

### Setter Depth Risk
**Risk:** In a 5-1, if the setter goes down, there is no backup.
**Detection:** 5-1 system with no capable backup setter
**Impact:** Fragility flag

---

# SECTION 7: IMPACT MODIFIERS

### Left-Handed Hitter Modifier
**Context:** Left-handed outside hitters and opposites create a tactical advantage (different spin, angle).
**Modifier:** +2 to system fit score when placed in a position that leverages handedness.
**Does NOT change KR.**

### Height Advantage Modifier
**Context:** Height at the net is the primary physical advantage. Men's net is 2.43m.
**Modifier:** For every 2 inches above the median height at the position and level, +1 to BKR and AKR for system fit purposes.
**Does NOT change KR.**

### International Experience Modifier
**Context:** Players with national team experience (especially common in men's college VB - many international players).
**Modifier:** +3 to IQKR proxy confidence.
**Does NOT change KR.**

### Postseason Performance Modifier
**Context:** Players who perform at or above regular-season level in NCAA tournament.
**Modifier:** +2 to IQKR if postseason production meets or exceeds regular-season per-set rates.
**Does NOT change KR.**

---

# SECTION 8: COMPOSITE BOUNDING AND PROXY CONFIDENCE

## 8.1 Composite Bounding v0.3
No single component KR can contribute more than 45% of the final OPF composite, even if the assigned OPF weight exceeds 45%.

## 8.2 Proxy Confidence Weighting v0.2
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
