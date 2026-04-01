# Beach Volleyball Player Evaluation Reference v1

---

## 0. SCOPE

This is the single authoritative reference document for all beach volleyball evaluation data: trait definitions, trait bands, archetype library, position OPF weights, badges, overrides, system risks, KLVN college lambdas, college legends, pro KLVN lambdas, pro player KR legend, pro pair registry, and prize/salary framework.

**This file is large. Search by section header, not full load.**

Beach volleyball benchmarks are provided for BOTH men's and women's competition. Where benchmarks differ by gender, both are listed. Where a benchmark is universal (e.g., hitting percentage efficiency thresholds), one set is used.

---

# SECTION 1: TRAIT LIBRARY

Traits are organized by the 4 component KR clusters. Each trait has a definition, V1 measurement method, scoring bands (0-100 scale), and KLVN normalization notes.

## 1.1 ATTACK CLUSTER (AKR)

### Trait: Kill Efficiency (kills/match)
**Definition:** Rate of kills per match played. The primary volume indicator for attackers in beach volleyball.
**V1 measurement:** Kills / Matches played
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | Women's NCAA Benchmark | Men's Club Benchmark | AVP Pro Benchmark (W) | AVP Pro Benchmark (M) |
|------|-----------|----------------------|---------------------|-----------------------|-----------------------|
| Elite | 90-100 | 9.0+ kills/match | 11.0+ kills/match | 12.0+ kills/match | 14.0+ kills/match |
| Above Average | 75-89 | 7.0-8.99 | 8.5-10.99 | 9.0-11.99 | 11.0-13.99 |
| Average | 55-74 | 5.0-6.99 | 6.0-8.49 | 6.5-8.99 | 8.0-10.99 |
| Below Average | 35-54 | 3.0-4.99 | 4.0-5.99 | 4.0-6.49 | 5.0-7.99 |
| Poor | 0-34 | Under 3.0 | Under 4.0 | Under 4.0 | Under 5.0 |

**Role context:** Blockers typically have higher kill totals (they attack from the left side where sets are more consistent). Defenders attack from the right side and may use more finesse. Do not penalize defenders for lower kill volume - evaluate their attack efficiency and shot selection instead.

### Trait: Hitting Percentage
**Definition:** (Kills - Errors) / Attempts. THE key offensive efficiency metric.
**V1 measurement:** Directly available in most stat lines.
**KLVN normalization:** Not normalized (efficiency is level-independent).

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | .400+ |
| Above Average | 75-89 | .300-.399 |
| Average | 55-74 | .200-.299 |
| Below Average | 35-54 | .120-.199 |
| Poor | 0-34 | Under .120 |

**Context:** Beach hitting percentages tend to be lower than indoor because there is no middle quick attack (which inflates indoor hitting%). In beach, every attack is contested. A .300+ hitting% in beach is excellent.

### Trait: Shot Variety
**Definition:** Ability to hit multiple shot types: power line, power angle, cut shot, high line, jumbo (roll shot over the block), cobra (knuckle ball), rainbow, pokey (finger tip), and tool (using the block).
**V1 measurement:** Not available at V1. Requires V2+ video data.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Tool Usage
**Definition:** Ability to intentionally use the block (hit off the blocker's hands to score). This is one of the most important skills in beach volleyball because blocking is so prevalent.
**V1 measurement:** Not available at V1. Requires V2+ video data.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Attack in Wind
**Definition:** Ability to maintain attack effectiveness in windy conditions. Wind changes ball flight, timing, and shot selection.
**V1 measurement:** Not available at V1. Requires V2+ video data or tournament-specific weather logs.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Transition Attack
**Definition:** Kills scored in transition (after a dig, not on serve receive). Transition offense in beach is harder because the "setter" is often the player who just dug the ball.
**V1 measurement:** Not available at V1. Proxy: teams with high rally-win % likely have strong transition. Full measurement requires V2+.
**V1 proxy confidence:** 0.4

### Trait: Setting Ability (Attack Cluster Sub-Trait)
**Definition:** In beach volleyball, both players must be able to set. Setting quality directly determines attack quality. This is scored within AKR because it enables attack production.
**V1 measurement:** Not directly measured at V1. Proxy: partner's hitting% when this player sets (if available). Full measurement requires V2+.
**V1 proxy confidence:** 0.3

---

## 1.2 DEFENSE/DIG CLUSTER (DKR)

### Trait: Dig Rate (digs/match)
**Definition:** Rate of digs per match played. The primary defensive volume indicator.
**V1 measurement:** Digs / Matches played
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | Women's NCAA Benchmark | Men's Club Benchmark | AVP Pro Benchmark (W) | AVP Pro Benchmark (M) |
|------|-----------|----------------------|---------------------|-----------------------|-----------------------|
| Elite | 90-100 | 10.0+ digs/match | 8.0+ digs/match | 12.0+ digs/match | 10.0+ digs/match |
| Above Average | 75-89 | 7.5-9.99 | 6.0-7.99 | 9.0-11.99 | 7.5-9.99 |
| Average | 55-74 | 5.5-7.49 | 4.5-5.99 | 6.5-8.99 | 5.5-7.49 |
| Below Average | 35-54 | 3.5-5.49 | 3.0-4.49 | 4.0-6.49 | 3.5-5.49 |
| Poor | 0-34 | Under 3.5 | Under 3.0 | Under 4.0 | Under 3.5 |

**Role context:** Defenders typically have higher dig totals than blockers. A blocker with strong dig numbers is an exceptional two-way player. Do not penalize blockers for lower dig volume.

### Trait: Serve Receive Quality
**Definition:** Ability to pass serve receive to target, enabling the partner to set or attack.
**V1 measurement:** Not typically tracked as a standalone stat in beach at V1. Proxy: pair's side-out% (if available). Full measurement requires V2+.
**V1 proxy confidence:** 0.3

### Trait: Pursuit Range
**Definition:** How far the defender can cover on sand. Sand makes lateral and forward movement harder. Range on sand is a premium skill.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Read Speed
**Definition:** How quickly the defender reads the opponent's attack intention and positions accordingly.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Positioning Discipline
**Definition:** Correct defensive positioning based on the blocker's call and the opponent's tendencies.
**V1 measurement:** Not available at V1. Proxy: low errors and consistent dig production suggest discipline.
**V1 proxy confidence:** 0.2

---

## 1.3 SERVE CLUSTER (SVR)

### Trait: Ace Rate (aces/match)
**Definition:** Rate of service aces per match played. Aces are high-value points because they require zero rally effort.
**V1 measurement:** Aces / Matches played
**KLVN normalization:** Multiply raw by level lambda before scoring.

| Band | Score Range | Women's NCAA Benchmark | Men's Club Benchmark | AVP Pro Benchmark (W) | AVP Pro Benchmark (M) |
|------|-----------|----------------------|---------------------|-----------------------|-----------------------|
| Elite | 90-100 | 2.5+ aces/match | 3.0+ aces/match | 3.5+ aces/match | 4.0+ aces/match |
| Above Average | 75-89 | 1.5-2.49 | 2.0-2.99 | 2.0-3.49 | 2.5-3.99 |
| Average | 55-74 | 0.8-1.49 | 1.0-1.99 | 1.0-1.99 | 1.5-2.49 |
| Below Average | 35-54 | 0.3-0.79 | 0.5-0.99 | 0.4-0.99 | 0.7-1.49 |
| Poor | 0-34 | Under 0.3 | Under 0.5 | Under 0.4 | Under 0.7 |

### Trait: Ace-to-Error Ratio
**Definition:** Aces divided by service errors. Measures serve risk management.
**V1 measurement:** Aces / Service Errors (if both tracked)

| Band | Score Range | Benchmark |
|------|-----------|-----------|
| Elite | 90-100 | 1.50+ |
| Above Average | 75-89 | 1.00-1.49 |
| Average | 55-74 | 0.60-0.99 |
| Below Average | 35-54 | 0.35-0.59 |
| Poor | 0-34 | Under 0.35 |

### Trait: Serve Type Versatility
**Definition:** Ability to serve multiple types (float serve, jump serve, jump float, standing topspin, short serve) and use them tactically.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Serving in Wind
**Definition:** Ability to maintain serve effectiveness in wind. Float serves are heavily affected by wind. Some players switch to topspin serves in wind.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Tactical Serving
**Definition:** Ability to serve to specific locations/players to create advantages. Includes short serves (to pull opponents to the net), deep corner serves, and body serves.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

---

## 1.4 BEACH IQ CLUSTER (IQKR)

### Trait: Blocking Strategy
**Definition:** Quality of blocking decisions. Includes: when to block line, when to block angle, when to pull (no block, play 2-back defense), when to bait (fake one direction, jump the other).
**V1 measurement:** Not available at V1. Proxy: pair's defensive effectiveness suggests good blocking strategy. Blocks/match provides some signal.
**V1 proxy confidence:** 0.3 (blocks/match gives partial signal)

| Band | Score Range | Women's NCAA Benchmark (blocks/match) | Men's Club Benchmark | AVP Pro Benchmark (W) | AVP Pro Benchmark (M) |
|------|-----------|--------------------------------------|---------------------|-----------------------|-----------------------|
| Elite | 90-100 | 3.0+ blocks/match | 2.5+ blocks/match | 4.0+ blocks/match | 3.5+ blocks/match |
| Above Average | 75-89 | 2.0-2.99 | 1.5-2.49 | 2.5-3.99 | 2.0-3.49 |
| Average | 55-74 | 1.0-1.99 | 0.8-1.49 | 1.5-2.49 | 1.0-1.99 |
| Below Average | 35-54 | 0.5-0.99 | 0.3-0.79 | 0.5-1.49 | 0.5-0.99 |
| Poor | 0-34 | Under 0.5 | Under 0.3 | Under 0.5 | Under 0.5 |

**Note:** Blocks/match is a rough proxy for blocking strategy. A player can have low block totals but excellent blocking strategy (channeling attacks to the defender). V2+ video analysis is needed for true blocking strategy evaluation.

### Trait: Defensive Positioning Calls
**Definition:** Quality of communication between blocker and defender about defensive positioning. The blocker calls defensive assignments via hand signals and verbal cues.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Shot Selection Intelligence
**Definition:** Choosing the right shot for the situation: when to swing hard, when to use a cut shot, when to tool the block, when to play safe.
**V1 measurement:** Not available at V1. Proxy: high hitting% suggests smart shot selection.
**V1 proxy confidence:** 0.3

### Trait: Wind/Sun Adaptation
**Definition:** Ability to adjust game plan based on environmental conditions. Includes: serving with/against wind, attacking in swirling conditions, managing sun position (eye discipline).
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Tournament Management
**Definition:** Ability to pace energy across multiple matches in a single day. Beach tournaments often require 3-5 matches in one day. Managing effort, intensity, and recovery between matches is a strategic skill.
**V1 measurement:** Proxy: performance in late-round matches vs early-round matches. Players who maintain production throughout a tournament day show strong tournament management.
**V1 proxy confidence:** 0.3

### Trait: Partnership Communication
**Definition:** Quality and frequency of verbal and non-verbal communication with partner. Includes: hand signals, verbal calls during rallies, timeouts, between-point strategy.
**V1 measurement:** Not available at V1.
**V1 proxy confidence:** 0.0 (UNSCORED at V1)

### Trait: Opponent Reading
**Definition:** Ability to identify and exploit opponent tendencies. In beach, you play against the same 2 people all match - learning their tendencies mid-match is critical.
**V1 measurement:** Not available at V1. Proxy: performance that improves from set 1 to set 2 suggests opponent reading.
**V1 proxy confidence:** 0.2

---

# SECTION 2: ARCHETYPE LIBRARY

Archetypes are locked role-specific profiles. Each player is assigned ONE primary archetype with an optional secondary.

## 2.1 BLOCKER ARCHETYPES

### Power Blocker
**Definition:** A blocker who dominates at the net through physical tools and aggressive blocking. Tall, long, with a high block touch. Stuffs blocks and intimidates attackers.
**Trait signature:** Elite blocking numbers, strong net attack with power shots, high block touch. May sacrifice some defensive ability for net dominance.
**Partner fit:** Best paired with an elite defender who can cover the court behind the block.
**Example profile (Pro W):** 4.0+ blocks/match, 10.0+ kills/match, .350+ hitting%, 6'1"+.

### Finesse Blocker
**Definition:** A blocker who uses read speed, positioning, and tactical blocking rather than raw physical dominance. Channels attackers into the defender's zone. Uses bait blocks and strategic pulls.
**Trait signature:** Strong blocking strategy (even if raw block numbers are not elite), excellent hand signals and communication, smart shot selection on offense. May not have elite height.
**Partner fit:** Works with any defender but especially effective with a disciplined positional defender.
**Example profile (Pro W):** 2.5+ blocks/match but high defensive effectiveness for the pair, strong hitting% (.320+), excellent tool usage.

### Attacking Blocker
**Definition:** A blocker whose primary value is offensive production. They block competently but their attack is the differentiator - they terminate rallies from the left side with power and variety.
**Trait signature:** Elite AKR, strong kill volume, shot variety. Above-average blocking. The offensive engine of the pair.
**Partner fit:** Needs a partner who can play strong defense and deliver hittable sets.
**Example profile (Pro M):** 14.0+ kills/match, .380+ hitting%, 2.5+ blocks/match. Offense runs through this player.

## 2.2 DEFENDER ARCHETYPES

### All-Around Defender
**Definition:** A defender who excels in every phase of the game from the back. Elite digging, strong serve receive, capable attacker from the right side, reliable setting. The complete defender.
**Trait signature:** High DKR across all defensive traits, strong AKR from the right side, reliable SVR. No weaknesses. The kind of partner any blocker wants.
**Partner fit:** Pairs with any blocker archetype. Makes the blocker's job easier across the board.
**Example profile (Pro W):** 11.0+ digs/match, 8.0+ kills/match, .280+ hitting%, 2.5+ aces/match.

### Speed Defender
**Definition:** A defender whose primary weapon is court coverage and pursuit. Gets to balls that other defenders cannot reach. Makes up for what the blocker does not cover through sheer range and athleticism.
**Trait signature:** Elite pursuit range, strong dig numbers, fast lateral movement on sand. May sacrifice some attack power for defensive range.
**Partner fit:** Especially effective with an aggressive blocker who takes big swings at the block (and therefore gives up some court coverage).
**Example profile (Pro M):** 10.0+ digs/match, exceptional pursuit on sand, 6.0+ kills/match from the right side.

### Serving Defender
**Definition:** A defender whose serve is a primary weapon. The combination of strong defense plus elite serving creates an asymmetric advantage - they earn free points on serve and then extend rallies on defense.
**Trait signature:** Elite SVR (3.0+ aces/match at pro level), strong DKR. The serve changes the match. Opponents are on their heels from the first contact.
**Partner fit:** Any blocker benefits from a serving-dominant defender because the serve puts pressure on opponents before the rally begins.
**Example profile (Pro W):** 3.5+ aces/match, 9.0+ digs/match, strong float and jump serve arsenal.

## 2.3 UNIVERSAL ARCHETYPES

### Complete Player
**Definition:** A player who can block AND defend at a high level. This is the rarest and most valuable archetype in beach volleyball. They can play either side, switch roles, and adapt to any partner.
**Trait signature:** Above-average in all 4 component KRs. Strong at the net AND in the backcourt. Can block, defend, set, attack from both sides, and serve at a high level.
**Partner fit:** Pairs with anyone. The ultimate versatile partner.
**Example profile (Pro M):** 12.0+ kills/match, 8.0+ digs/match, 3.0+ blocks/match, 3.0+ aces/match. Plays both sides.

### Specialist
**Definition:** A player who is elite at one phase of the game but has clear weaknesses in others. Their specialty is so dominant that it compensates.
**Trait signature:** One component KR at 90+ with at least one component KR below 70. Extreme profile.
**Partner fit:** Must be paired with a partner who covers their weakness.
**Example profile:** Server with 5.0+ aces/match but mediocre dig numbers. Or a blocker with 5.0+ blocks/match but limited attack variety.

---

# SECTION 3: POSITION OPF WEIGHTS

## 3.1 College OPF Weights

### Blocker (College)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 30% |
| DKR (Defense/Dig) | 20% |
| SVR (Serve) | 20% |
| IQKR (Beach IQ) | 30% |

### Defender (College)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 22% |
| DKR (Defense/Dig) | 35% |
| SVR (Serve) | 18% |
| IQKR (Beach IQ) | 25% |

### Switch Player (College)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 27% |
| DKR (Defense/Dig) | 27% |
| SVR (Serve) | 18% |
| IQKR (Beach IQ) | 28% |

## 3.2 Pro OPF Weights

At the pro level, specialization and IQ are weighted more heavily.

### Blocker (Pro)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 28% |
| DKR (Defense/Dig) | 18% |
| SVR (Serve) | 18% |
| IQKR (Beach IQ) | 36% |

Note: IQKR increases at pro level because blocking strategy, opponent reading, and tactical decision-making separate elite pro blockers from good ones.

### Defender (Pro)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 20% |
| DKR (Defense/Dig) | 35% |
| SVR (Serve) | 17% |
| IQKR (Beach IQ) | 28% |

### Switch Player (Pro)
| Component | Weight |
|-----------|--------|
| AKR (Attack) | 25% |
| DKR (Defense/Dig) | 25% |
| SVR (Serve) | 18% |
| IQKR (Beach IQ) | 32% |

---

# SECTION 4: BADGES

Badges are binary achievement flags. A player either earns a badge or does not. Badges do not modify KR. They communicate profile dimensions that raw numbers do not capture.

### Wind Warrior
**Criteria:** Maintains hitting% within .050 of season average in wind-affected matches (V2+ required). Or: tournament wins/podiums in notoriously windy venues.
**V1 proxy:** Tournament results from wind-prone venues (Hermosa Beach, Huntington Beach, Gulf Coast).

### Court Commander
**Criteria:** IQKR 85+ AND evidence of leadership (captain, team communication leader, hand signal quality).
**V1 proxy:** Captain designation, All-Conference or award recognition that cites leadership.

### Iron Player
**Criteria:** 30+ matches in a season with no significant performance dropoff in late-round matches (tournament management).
**V1 proxy:** High match count with consistent per-match production.

### Transition Artist
**Criteria:** Transition attack efficiency at or above .300 (V2+ required).
**V1 proxy:** Not available at V1.

### Serve Weapon
**Criteria:** SVR 88+ AND ace-to-error ratio 1.20+.
**V1 proxy:** Ace rate and ratio stats.

### Block Wall
**Criteria:** 3.5+ blocks/match (women's pro) or 3.0+ blocks/match (men's pro) at pro level.
**V1 proxy:** Block rate stats.

### Sand Mover
**Criteria:** Pursuit range top 10% at their level (V2+ required). Gets to balls others cannot reach.
**V1 proxy:** Not available at V1.

### Crossover Threat
**Criteria:** Player also competes in indoor volleyball at a high level (KR 80+ indoor) AND KR 80+ beach. Dual-threat.
**V1 proxy:** Active on both indoor and beach rosters with strong production in both.

### Partnership Chameleon
**Criteria:** Maintained KR within 3 points across 3+ different partnerships. Their performance does not depend on one partner.
**V1 proxy:** Consistent production across different partners.

### Clutch Closer
**Criteria:** Win percentage in third sets (deciding sets) above 55% with a minimum of 10 third sets played.
**V1 proxy:** Tournament bracket results showing third-set wins.

---

# SECTION 5: OVERRIDES AND SYSTEM RISKS

## 5.1 Overrides

### Small Sample Override
**Condition:** Player has fewer than 15 matches played and claims elite per-match rates.
**Action:** Reduce confidence by 15%. Small samples produce misleading rates in beach more than indoor because each match is only 2-3 sets.
**Rationale:** 5 kills in 2 sets across 1 match = 5.0 kills/match but means nothing.

### Partnership Inflation Override
**Condition:** Player has elite stats ONLY when paired with a top-10% partner at their level.
**Action:** Reduce individual AKR and DKR by 5 points from baseline when evaluating partner-independent ability. Flag for additional data.
**Rationale:** Playing with an elite partner inflates both players' stats. The question is what does THIS player do independently?

### Blocker Dig Override
**Condition:** Blocker claims 9.0+ digs/match at college level or 10.0+ at pro level.
**Action:** Verify role. If truly a blocker (not actually playing defender), confirm via V2+ data. Blocker dig rates this high are extremely rare and may indicate role misclassification.
**Rationale:** Role classification accuracy matters for OPF application.

### Serving Volume Override
**Condition:** Player has elite ace-to-error ratio but fewer than 2.0 serve attempts per set average (barely serving).
**Action:** Cap SVR at 75. Cannot earn elite SVR on minimal volume.
**Rationale:** Small serving samples produce unstable ratios.

## 5.2 System Risks

### Blocker Mismatch Risk
**Risk:** A pair whose blocker is significantly shorter than the opponent's primary attacker, creating a persistent net disadvantage.
**Detection:** Blocker height vs opponent attacker height differential of 3+ inches at women's level, 4+ inches at men's level.
**Impact:** Partnership KR downshift of 2-3 points when facing taller opponents.

### One-Dimensional Serve Risk
**Risk:** A pair where both players serve the same style (both float or both jump), making the serve receive predictable.
**Detection:** Both partners with identical serve type.
**Impact:** SVR downshift of 2-3 points for predictability.

### Communication Breakdown Risk
**Risk:** A newly formed partnership without established communication patterns.
**Detection:** Partnership under 10 matches, declining performance in close sets.
**Impact:** IQKR downshift of 3-5 points.

### Heat/Endurance Risk
**Risk:** A pair that fades in late-round matches or in high-heat tournaments due to conditioning.
**Detection:** Per-match production declining in afternoon matches vs morning matches at multi-match tournament days.
**Impact:** IQKR downshift of 2-3 points (tournament management).

### Indoor-Only Training Risk
**Risk:** A college player who trains primarily on indoor courts and only plays beach in competition. Limited sand training limits development.
**Detection:** Indoor-primary program where beach is secondary. V2+ data would show movement inefficiency on sand.
**Impact:** DKR downshift of 2-3 points, flag for development plan.

---

# SECTION 6: IMPACT MODIFIERS

Impact modifiers are context adjustments that modify how KR is interpreted but do not change the KR number itself.

### Height Advantage Modifier
**Context:** Height at the net matters in beach just as in indoor. A 6'3" blocker vs 5'9" blocker is a significant advantage.
**Modifier:** For every 2 inches above the median height at the position, role, and level, +1 to AKR and IQKR (blocking) for system fit purposes.
**Does NOT change KR.** Changes how the player is projected in physical mismatch simulations.

### Left-Handed Modifier
**Context:** Left-handed attackers create different angles, especially when playing the right side (defender role). The ball spins differently and is harder to read.
**Modifier:** +2 to system fit score when placed in a role that leverages handedness.
**Does NOT change KR.** Changes system fit calculation.

### International Experience Modifier
**Context:** Players with national team beach volleyball experience (youth or senior, particularly FIVB tour or Olympic participation) have been exposed to elite competition and conditions.
**Modifier:** +3 to IQKR proxy confidence. International experience is a data signal.
**Does NOT change KR.** Adjusts confidence.

### Indoor-to-Beach Transition Modifier
**Context:** Players in their first 1-2 years of beach after an indoor career are on a development trajectory. Their current beach numbers underrepresent their ceiling.
**Modifier:** Widen confidence range by 5-8 points. Note indoor KR as ceiling context.
**Does NOT change KR.** Adjusts confidence and narrative.

---

# SECTION 7: KLVN COLLEGE LAMBDAS

KLVN normalizes production stats across competitive levels. The reference level (lambda = 1.000) is AVP Pro Tour, as the highest domestic standard.

**How it works:**
- A player at a level with lambda 0.700 who records 8.0 kills/match has a KLVN-normalized value of 8.0 * 0.700 = 5.60 kills/match for scoring purposes
- A player at the reference level who records 8.0 kills/match stays at 8.0
- KLVN adjusts INPUTS (raw stats during trait scoring). It NEVER adjusts OUTPUTS (final KR).

### Lambda Table - Women's

| Level | Lambda | Rationale |
|-------|--------|-----------|
| AVP Pro Tour | 1.000 | Reference. Top domestic beach volleyball competition. |
| NCAA Women's Beach (Top Programs) | 0.820 | Top programs (USC, UCLA, LSU, Loyola Marymount, TCU, Florida State) produce AVP and FIVB-level players. Competition level is strong. |
| NCAA Women's Beach (Mid-Tier) | 0.720 | Growing programs with competitive rosters. Some pairs transfer up to top programs or go pro. |
| NCAA Women's Beach (Developing) | 0.620 | Newer programs building their beach volleyball identity. Limited recruiting depth. |
| Junior/Club Beach | 0.550 | Youth competitions (USAV Junior Beach, AAU, p1440 juniors). Highly variable quality. |

### Lambda Table - Men's

| Level | Lambda | Rationale |
|-------|--------|-----------|
| AVP Pro Tour | 1.000 | Reference. |
| Club Men's Beach (Top Programs) | 0.680 | No NCAA sponsorship for men's beach. Top club programs (UCLA, USC club teams, Pepperdine club) play against strong competition but without NCAA infrastructure. |
| Club Men's Beach (Standard) | 0.580 | Average club programs. Limited organized competition. |
| Junior/Club Beach | 0.520 | Youth competitions. Variable quality. |

### NCAA Women's Beach Program Tier Mapping

**Top Programs (lambda 0.820):**
USC, UCLA, LSU, Loyola Marymount, Florida State, TCU, Cal Poly, Stanford, Pepperdine, Hawai'i, Arizona, Long Beach State, Grand Canyon, Florida Atlantic

**Mid-Tier Programs (lambda 0.720):**
FIU, Stetson, South Carolina, Georgia State, Cal State Bakersfield, Tulane, Arizona State, Mercer, Louisiana-Monroe, New Orleans, Spring Hill, Coastal Carolina

**Developing Programs (lambda 0.620):**
Programs in their first 3-5 years of sponsoring beach volleyball, or programs with minimal recruiting investment.

**Notes:**
- NCAA Women's Beach was added as a championship sport in 2016. The landscape is evolving rapidly.
- The CCSA (Coastal Collegiate Sports Association) has been a leading conference in beach volleyball.
- Some top programs recruit specifically for beach (not just pulling indoor players). These programs trend toward higher lambdas.
- The National Collegiate Championship format pools all divisions together - there is no separate D1/D2/D3 championship for beach.

---

# SECTION 8: COLLEGE LEGENDS

Legends define what each KR tier means at each competitive level. They are display-only - they interpret KR, they do not produce it.

All production benchmarks are per-match rates unless noted.

## LEGEND: NCAA WOMEN'S BEACH (TOP PROGRAMS)

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | National Dominant | 10.0+ kills/match, .400+ hitting%, 3.0+ aces/match, 10.0+ digs/match (if defender). National Championship pair. AVCA All-American 1st team. Immediate AVP/FIVB pro. Best player in college beach. |
| 95-97 | National Elite | 9.0+ kills/match, .370+ hitting%, 2.5+ aces/match. AVCA All-American. National semifinal caliber. Multi-phase dominance. |
| 92-94 | All-American Caliber | 8.0+ kills/match, .340+ hitting%. All-American selection. Top-4 pair on a top-10 team. Two strong component KRs (85+). |
| 89-91 | Conference Star | 7.5+ kills/match, .310+ hitting%. All-Conference 1st pair. Top pair on a conference contender. |
| 86-88 | High-Impact Starter | 7.0+ kills/match, .280+ hitting%. Plays 1-3 pair on a ranked team. Consistent contributor. |
| 83-85 | Strong Starter | 6.0+ kills/match, .250+ hitting%. Reliable 2-4 pair on a competitive program. |
| 80-82 | Rotation Starter | 5.5+ kills/match, .230+ hitting%. Starter on a top program. One clear strength. |
| 75-79 | Depth Pair | 4.5+ kills/match, .200+ hitting%. 5-6 pair or rotational player on strong program. |
| 70-74 | Developing | Lower pair or limited-match player. Below average production at the top level. |
| 65-69 | Project | Walk-on or first-year beach transition from indoor. Not yet contributing at top program level. |
| Below 65 | Below Level | Not producing at this level. |

---

## LEGEND: NCAA WOMEN'S BEACH (MID-TIER)

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Program Dominant | 10.0+ kills/match, .380+ hitting%. Best player on a mid-tier program. Transfer target for top programs. |
| 95-97 | Program Elite | 9.0+ kills/match, .350+ hitting%. Could compete at top program level. |
| 92-94 | All-Conference | 8.0+ kills/match, .320+ hitting%. All-Conference caliber. |
| 89-91 | Conference Star | 7.0+ kills/match, .290+ hitting%. Top 3 pair on competitive mid-tier team. |
| 86-88 | High-Impact Starter | 6.5+ kills/match, .260+ hitting%. |
| 83-85 | Starter | 5.5+ kills/match, .240+ hitting%. |
| 80-82 | Rotation Starter | 5.0+ kills/match, .220+ hitting%. |
| 75-79 | Contributing | 4.0+ kills/match. |
| 70-74 | Developing | Limited production. |
| Below 70 | Below Level | Not contributing. |

---

## LEGEND: NCAA WOMEN'S BEACH (DEVELOPING PROGRAMS)

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Program Dominant | 9.0+ kills/match, .350+ hitting%. Best player on a developing program. Transfer portal target. |
| 95-97 | Program Elite | 8.0+ kills/match, .320+ hitting%. |
| 92-94 | Strong Starter | 7.0+ kills/match, .290+ hitting%. |
| 89-91 | Starter | 6.0+ kills/match, .260+ hitting%. |
| 86-88 | Contributing | 5.0+ kills/match, .240+ hitting%. |
| 83-85 | Rotation | 4.5+ kills/match. |
| 80-82 | Depth | 3.5+ kills/match. |
| Below 80 | Developing | Limited. |

---

## LEGEND: CLUB MEN'S BEACH

| KR Range | Label | Profile |
|----------|-------|---------|
| 98-100 | Level Dominant | 12.0+ kills/match, .400+ hitting%. Best in club competition. AVP qualifier caliber. |
| 95-97 | Club Elite | 11.0+ kills/match, .370+ hitting%. |
| 92-94 | Strong Club | 10.0+ kills/match, .340+ hitting%. |
| 89-91 | Good Club | 8.5+ kills/match, .300+ hitting%. |
| 86-88 | Competitive | 7.0+ kills/match, .270+ hitting%. |
| 83-85 | Average | 6.0+ kills/match, .240+ hitting%. |
| 80-82 | Below Average | 5.0+ kills/match, .210+ hitting%. |
| 75-79 | Recreational+ | 4.0+ kills/match. |
| Below 75 | Recreational | Limited organized competition experience. |

---

# SECTION 9: PRO KLVN LAMBDAS

Pro lambdas normalize production across professional beach volleyball tours. The reference tour (lambda = 1.000) is the FIVB Beach Pro Tour Elite 16 level.

| Tour/Level | Lambda | Rationale |
|-----------|--------|-----------|
| FIVB Beach Pro Tour - Elite 16 | 1.000 | Reference. Top international beach volleyball competition. Olympic-level fields. |
| FIVB Beach Pro Tour - Challenge | 0.920 | Strong international competition, slightly below Elite 16 fields. |
| FIVB Beach Pro Tour - Futures | 0.840 | Development-tier international events. Emerging pairs and veterans on the way down. |
| Olympics | 1.000 | Same reference as Elite 16. 24-pair field of the world's best. |
| AVP Pro Tour | 0.900 | Top US domestic tour. Strong fields but smaller international representation than FIVB. Top AVP pairs are world-class; depth varies. |
| AVP Next | 0.750 | Qualifying/development tier of AVP. Emerging US players. |
| Athletes Unlimited Beach | 0.780 | Innovative format. Attracts strong players but format limits traditional evaluation. |
| NVA (National Volleyball Association) | 0.700 | Alternative US tour. Variable competition levels. |
| Continental Tour Events (NORCECA, CSV, AVC) | 0.860 | Regional championship events. Strong but continent-specific depth. |

---

# SECTION 10: PRO PLAYER KR LEGEND

## Women's Pro

| KR Range | Label | Profile | Approximate Annual Earnings (Prize + Sponsorship) |
|----------|-------|---------|--------------------------------------------------|
| 96-100 | World-Class | Among the best in the world. Olympic medalist or consistent Elite 16 podium finisher. National team star. Top 5 in world ranking. | $200K-$1M+ |
| 92-95 | Elite Tour | Consistent Elite 16 main draw. Podium finishes. Top 20 in world ranking. US national team regular. | $80K-$250K |
| 88-91 | Tour Starter | Regular Elite 16 and Challenge main draw qualifier. Competitive in every event entered. Top 40 world. | $40K-$100K |
| 84-87 | Solid Professional | Challenge main draw regular. Competitive on AVP. Top AVP finisher. | $20K-$60K |
| 80-83 | Professional Rotation | AVP main draw regular. Challenge qualifier. Capable of upsets. | $10K-$30K |
| 75-79 | Fringe Professional | AVP Next standout. FIVB Futures competitor. Developing toward full-time pro. | $5K-$15K |
| 70-74 | Developmental Pro | Occasional AVP main draw via qualifier. Primarily FIVB Futures or regional events. | Under $10K |
| Below 70 | Below Pro Level | Does not project as a sustainable professional. | N/A |

## Men's Pro

| KR Range | Label | Profile | Approximate Annual Earnings (Prize + Sponsorship) |
|----------|-------|---------|--------------------------------------------------|
| 96-100 | World-Class | Among the best in the world. Olympic medalist or consistent Elite 16 podium. Top 5 world ranking. | $300K-$1.5M+ |
| 92-95 | Elite Tour | Consistent Elite 16 main draw. Top 20 world. | $100K-$350K |
| 88-91 | Tour Starter | Regular Elite 16/Challenge main draw. Top 40 world. | $50K-$120K |
| 84-87 | Solid Professional | Challenge regular. AVP podium finisher. | $25K-$70K |
| 80-83 | Professional Rotation | AVP main draw regular. | $10K-$35K |
| 75-79 | Fringe Professional | AVP Next, FIVB Futures. | $5K-$15K |
| 70-74 | Developmental Pro | Occasional main draw qualifier. | Under $10K |
| Below 70 | Below Pro Level | Not sustainable as a professional. | N/A |

**Notes on beach volleyball earnings:**
- Beach volleyball prize money is split between partners (typically 50/50).
- Top pairs earn significantly through sponsorships and endorsements beyond prize money.
- The US market (AVP) pays less in prize money than FIVB but offers more sponsorship opportunities for US-based athletes.
- Olympic medal bonuses from national federations can be significant.
- Many professional beach volleyball players supplement income with coaching, clinics, and appearances.

---

# SECTION 11: PRO PAIR REGISTRY

## AVP Pro Tour - Notable Active Pairs (Women's)
*Note: Beach volleyball partnerships change frequently. Always search web for current partnerships.*

| Pair | Notes |
|------|-------|
| Sara Hughes / Kelly Cheng | 2024 Olympic gold medalists. Top US women's pair. |
| Taryn Kloth / Kristen Nuss | Former NCAA champions. Consistent AVP and FIVB contenders. |
| Terese Cannon / Caitlin Ledoux | Rising US pair. Strong on AVP and FIVB circuits. |
| Betsi Flint / Julia Scoles | Experienced AVP competitors. |

## AVP Pro Tour - Notable Active Pairs (Men's)
*Note: Partnerships change frequently. Search web for current.*

| Pair | Notes |
|------|-------|
| Miles Partain / Andy Benesh | Top US men's pair. Olympic competitors. |
| Chase Budinger / Miles Evans | Budinger is a former NBA player who transitioned to beach volleyball. |
| Taylor Crabb / Taylor Sander | Crabb from a beach volleyball family dynasty. |
| Theo Brunner / Chaim Schalk | Veteran pair on AVP and international circuits. |

## FIVB Beach Pro Tour - Notable Active Pairs
*International partnerships. Search web for current.*

| Pair | Country | Notes |
|------|---------|-------|
| Melissa / Carol (Ana Patricia) | Brazil | Perennial contenders on the women's FIVB tour. |
| Mol/Sorum | Norway | Men's Olympic gold medalists (2020). Among the best ever. |
| Ahman/Hellvig | Sweden | Dominant young men's pair. Multiple Elite 16 wins. |
| Humana-Paredes/Wilkerson | Canada | Strong women's FIVB pair. |

---

# SECTION 12: COMPOSITE BOUNDING AND PROXY CONFIDENCE

## 12.1 Composite Bounding v0.3
No single component KR can contribute more than 45% of the final OPF composite, even if the assigned OPF weight exceeds 45%.

**Example:** A defender's OPF assigns DKR at 35%. This is under the 45% cap, so it applies as-is. If a hypothetical adjustment pushed DKR to 48%, it would be capped at 45% and the excess redistributed proportionally.

## 12.2 Proxy Confidence Weighting v0.2
When a trait is scored from proxy data (not directly measured), its weight in the component KR is reduced.

| Proxy Confidence | Weight Multiplier |
|-----------------|------------------|
| 1.0 (Direct measurement) | 1.00 |
| 0.8 | 0.80 |
| 0.6 | 0.60 |
| 0.5 | 0.50 |
| 0.4 | 0.40 |
| 0.3 | 0.30 |
| 0.2 | 0.20 |
| 0.0 (UNSCORED) | Excluded from component |

When traits are excluded (proxy confidence 0.0), the remaining scored traits within that component are re-weighted proportionally to sum to 1.0.

---

# END OF FILE 02
