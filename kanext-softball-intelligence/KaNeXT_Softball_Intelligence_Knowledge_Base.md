# KaNeXT Softball Intelligence - Complete Knowledge Base

## Version 1.0 - March 2026

This is the comprehensive reference document for the KaNeXT Softball Intelligence system. It covers every concept, every metric, every process, and every decision framework in the softball intelligence layer. Nexus references this document to answer any question about how the softball intelligence works - from investors, coaches, scouts, analysts, and anyone interacting with the system.

---

# PART 1: THE INTELLIGENCE SYSTEM

---

## 1. What is KaNeXT Softball Intelligence

KaNeXT Softball Intelligence is a universal player and team evaluation system that produces deterministic, auditable ratings for softball players at every competitive level. It was built to solve the same fundamental problem as the basketball and baseball systems: softball evaluation has always been fragmented across tools, subjective across evaluators, and impossible to compare across levels.

A JUCO coach sees a pitcher with a 1.50 ERA throwing 63 mph and says "she can pitch." A D1 Power coordinator asks "but can she pitch HERE? Can she be our ace? Can she handle 300 innings?" There is no honest answer because there is no common language. The JUCO 1.50 ERA might mean "dominant" there but "back-of-rotation" at D1 Power. Every evaluation lives in someone's head, filtered through bias, experience, and whatever games they happened to scout.

KaNeXT Softball Intelligence replaces this with a system. Not a model. Not a projection algorithm. A complete intelligence framework that takes raw softball data - box scores, advanced metrics, pitch-tracking data - and produces a single universal number that means the same thing regardless of who computed it, when they computed it, or what level the player competes at.

That number is the KR.

Softball intelligence is the third sport built on the KaNeXT architecture, after basketball and baseball. The architecture was validated across 152+ basketball players at 7 teams spanning multiple competitive levels with zero rank inversions. Softball inherits the identical structural framework - the same KR scale, the same KLVN normalization, the same anchor-first evaluation protocol, the same governance rules - with all content adapted for softball's unique characteristics.

The single biggest structural similarity to baseball: softball uses TWO parallel evaluation pipelines. Hitters and pitchers are fundamentally different athletes performing fundamentally different tasks, so they are evaluated on separate trait libraries, separate component KRs, and separate archetypes. They share the same 0-100 KR scale and the same legends, but the path to that number is different for a shortstop than for a starting pitcher.

The single biggest difference from baseball: softball has critical sport-specific distinctions that change everything about how players are evaluated. Pitching is underhand from 43 feet, not overhand from 60'6". Slap hitting is a major offensive strategy with no baseball equivalent. Pitchers routinely throw 250-350+ innings per season. The professional landscape is dramatically different - no minor league system, a much smaller pro market, and the Olympic pathway as the highest-profile opportunity.

The intelligence lives inside the KaNeXT app through Nexus AI. Coaches do not read spreadsheets. They talk to Nexus. "Evaluate this pitcher." "What's our Team KR?" "Simulate Saturday's doubleheader." "Who should we recruit from the portal?" Nexus references the intelligence files and produces structured, honest answers.

The core philosophy: same inputs produce the same outputs, every time. No randomness. No editorial override. No truth mutation.

---

## 2. The KR System - Universal 0-100 Rating

KR stands for KaNeXT Rating. It is a single number on a 0-100 scale that represents a softball player's total evaluated ability at the time of evaluation. KR is the atomic unit of the intelligence system. Every downstream engine - team evaluation, simulation, scouting, development, pro transition - consumes KR as its primary input.

### What KR Measures

KR captures the complete softball player, but through the appropriate pipeline:

For hitters, KR captures hitting ability (including slap hitting for left-handed batters), power and plate discipline, fielding, speed/baserunning/slap game execution, and softball IQ, weighted by defensive position. A shortstop's KR weights fielding heavily (30%) because defense is what makes a shortstop a shortstop. A DP's KR weights hitting and power heavily (74% combined) because a DP exists solely to hit.

For pitchers, KR captures velocity/stuff quality (underhand-specific), command/spin control, durability/workload capacity, repertoire depth, and pitching IQ, weighted by role. A starting pitcher's KR weights durability heavily (24%) because softball aces must handle 250-350+ innings per season. A reliever's KR weights velocity/stuff most heavily (34%) because relievers need to provide a contrasting, impactful look in shorter outings.

KR is not batting average. It is not ERA. It is not WAR. KR is a composite of trait scores weighted by position, adjusted for system fit, modified by badges and overrides, and checked against system risks. The number reflects everything the player does on a softball field.

### KR is Universal

A KR of 88 means the same thing regardless of what level the player competes at. A KR of 88 at NCAA D1 Power is the same number as a KR of 88 at NAIA. The number does not change based on level context.

What changes is the interpretation. Each competitive level has its own legend - a lookup table that translates KR values into tier labels describing what that number means at that specific level. An 88 KR reads differently depending on where you look it up:

- At D1 Power: 86-88 = Strong Starter / Conference Elite
- At D1 Mid-Major: 86-88 = All-Conference / Strong Starter
- At NCAA D2: 86-88 = All-Conference / Strong Starter
- At NAIA: 86-88 = All-Conference / Starter
- At NJCAA D1: 86-88 = Starting Caliber / D1 Low-Major Transfer Prospect

One player. One KR. Multiple legend reads depending on level context. This is the Level Tier Map - one of the most valuable outputs for recruiting, because it instantly tells a coach "this player is a solid starter at your level but an All-Conference performer two levels down."

Every legend has TWO TRACKS - one for hitters, one for pitchers. A KR 92 hitter and a KR 92 pitcher are the same overall quality but their legend descriptions reflect position-appropriate production: the hitter's description references BA/OPS/HR, the pitcher's description references ERA/K per 7/WHIP.

### How KR Stays Universal: KLVN Lambda Normalization

The reason KR can be universal is that raw production stats are normalized before they enter the evaluation pipeline. A player hitting .340 at NAIA is not producing the same softball output as a player hitting .340 at D1 Power. The pitching quality, the defensive quality, the level of competition, and the schedule strength are all different.

KLVN (pronounced "Calvin") adjusts production inputs so trait scoring is comparable across levels. Each competitive level has a lambda value between 0 and 1, where D1 Power is the college reference point at 1.000 and Athletes Unlimited is the professional reference at 1.000.

Lambda normalizes INPUTS during trait scoring. It does NOT convert KR OUTPUTS. There is no "D1 Power-equivalent KR." The KR is computed once, at the player's home level, using lambda-normalized inputs. That number is final and universal.

Incorrect usage: "Her KR is 88 at NAIA, which would be 82 at D1 Power." This is wrong. Her KR is 88, period. The Level Tier Map shows what 88 means at every level.

### What Different KR Ranges Mean

Using NCAA D1 Power as the reference:

- 98-100: National Player of the Year. Generational. USA Softball Player of the Year finalist. .380+/.480+/.700+ (hitter) or sub-0.80 ERA / 12+ K/7 (pitcher). Once every 3-5 years nationally.
- 95-97: Franchise Player / Elite All-American. Best player in the conference. .340+/.420+/.580+ or 1.00-1.50 ERA / 10+ K/7. Drives WCWS berths.
- 92-94: All-American Caliber. Top 3 at position in conference. .320+/.400+/.520+ or 1.50-2.00 ERA / 9+ K/7.
- 89-91: All-Conference First Team. Core of competitive program. .300+/.380+/.480+ or 2.00-2.50 ERA / 8+ K/7.
- 86-88: Strong Starter / Conference Elite. Reliable everyday player or solid rotation arm.
- 82-85: Starter / Rotation. Starts most games. Contributing member.
- 78-81: Role Player / Contributor. Spot starts, platoon, key reserve.
- 74-77: Developmental. Has tools but not producing at starter level yet.
- 70-73: Roster depth. Practice contributor with limited game impact.
- Below 70: Walk-on level at D1 Power.

These tiers shift at every level. A KR 82 that reads "Starter" at D1 Power reads "All-Conference" at NJCAA D1.

---

## 3. The Dual Pipeline - Hitters and Pitchers

Softball, like baseball, evaluates hitters and pitchers through completely separate pipelines. This is not optional. A shortstop and a starting pitcher produce value in fundamentally different ways, and the KR system reflects this with distinct trait libraries, distinct component KRs, distinct archetypes, and distinct positional weights.

### Hitter Pipeline
Produces: HKR (Hitting), PKR (Power/Plate Discipline), FKR (Fielding), SKR (Speed/Baserunning/Slap), IQKR (Softball IQ)
Weighted by: Position-specific OPF (a catcher's FKR matters more than a DP's FKR)
Archetype library: 14 hitter archetypes including softball-specific Slapper and Dual-Threat Slapper

### Pitcher Pipeline
Produces: VKR (Velocity/Stuff - underhand-specific), CKR (Command/Spin Control), DKR (Durability/Workload), RKR (Repertoire), IQKR (Pitching IQ)
Weighted by: Role-specific OPF (SP weights DKR much higher than RP because aces pitch 250-350+ IP)
Archetype library: 10 pitcher archetypes including softball-specific Spin Pitcher, Movement Pitcher, Two-Way Star, and Tournament Closer

### Two-Way Players
More common in softball than baseball. A player with significant production as both hitter and pitcher receives BOTH evaluations. Combined KR is a weighted average based on contribution split (default: 55% primary role / 45% secondary role). Two-Way Premium badge awarded if both KRs >= 80.

---

## 4. Hitter Component KRs - HKR, PKR, FKR, SKR, IQKR

Five component KRs capture the complete softball hitter.

### HKR - Hitting KR
What it measures: Pure hit tool and contact ability. Batting average, contact rate, bat-to-ball quality, situational hitting, two-strike approach, and slap hitting proficiency (for left-handed batters who employ slap technique).

Key softball distinction: Slap hitting proficiency (sub-trait 1f) is a first-class evaluation input. A left-handed batter who hits .400 with a slap approach, converts 85% of bunt-for-hit attempts, and has elite drag bunt success scores extremely high on HKR even with zero home runs. Slap hitting has no baseball equivalent and must be evaluated on its own merits.

### PKR - Power/Plate Discipline KR
What it measures: Walk rate, plate discipline, raw power (HR, ISO), hard hit rate, exit velocity, slugging efficiency. The combination of approach quality and power output.

Key softball distinction: Power output is lower than baseball due to larger ball and underhand pitching. 20+ HR in a D1 season is elite. ISO bands and HR thresholds are calibrated to softball norms, not baseball norms.

### FKR - Fielding KR
What it measures: Range, fielding percentage, arm strength/accuracy, double play ability, and catcher-specific skills (receiving, blocking, throwing/CS%).

Key softball distinctions: (1) Softball distances are shorter - 60-foot bases and shorter outfield throws. Arm strength is calibrated to softball distances. (2) Blocking is MORE critical than in baseball because the rise ball creates high missed pitches and 60-foot basepaths allow rapid advancement. (3) Catcher pop times are compressed compared to baseball due to shorter distances.

### SKR - Speed/Baserunning/Slap KR
What it measures: Stolen bases, stolen base success rate, sprint speed, slap game execution (for LHB slappers), extra bases taken, and overall baserunning value.

Key softball distinctions: (1) 60-foot basepaths make stolen bases more achievable; SB numbers are generally higher per game than baseball. 35+ SB is elite. (2) Slap game execution (sub-trait 4c) evaluates the full slap repertoire: soft slap, hard slap, drag bunt, and the hitter's ability to mix these approaches so defense cannot commit. Applies ONLY to left-handed batters. (3) Home-to-first times are faster for slappers because they start running during the swing.

### IQKR - Softball IQ KR
What it measures: Plate approach adjustments, situational awareness, bunt/slap decision-making, baserunning decisions, defensive positioning instincts, and clutch performance.

Key softball distinction: Bunt/slap decision-making (sub-trait 5c) is a first-class IQ metric. Knowing when to slap vs. swing, when to bunt vs. hit away, and reading sacrifice vs. bunt-for-hit situations are critical softball-specific IQ skills.

---

## 5. Pitcher Component KRs - VKR, CKR, DKR, RKR, IQKR

Five component KRs capture the complete softball pitcher.

### VKR - Velocity/Stuff KR
What it measures: Pitch speed, rise ball action, drop ball depth, and overall movement quality.

Key softball distinctions: (1) Pitching is UNDERHAND from 43 feet, not overhand from 60'6". This changes everything about how stuff quality is evaluated. 70+ mph from 43 feet gives hitters roughly the same reaction time as 95+ mph from 60'6" in baseball. Elite velocity in college softball is 66-72 mph. (2) The rise ball is the signature pitch of softball. True rise requires backspin exceeding the rate of gravity-induced drop, creating apparent upward movement. No equivalent exists in baseball. (3) The drop ball is softball's equivalent of a sinker - thrown with topspin for sharp downward break.

### CKR - Command/Spin Control KR
What it measures: Walk rate, zone control, first-pitch strike rate, location precision, spin axis consistency, and WHIP control.

Key softball distinction: Spin axis consistency evaluates the ability to throw the rise ball and drop ball from the same arm slot and release point. Elite pitchers tunnel these two pitches identically for 35 of 43 feet before the ball breaks in opposite directions. This tunneling ability is the most devastating pitch combination in softball.

### DKR - Durability/Workload KR
What it measures: Innings volume, complete game rate, tournament endurance, fatigue resistance, and health history.

Key softball distinction: THIS IS THE MOST DIFFERENT COMPONENT FROM BASEBALL. Softball aces routinely pitch 250-350+ innings per season. A single pitcher can throw every game of a tournament weekend (3-5 games in 2-3 days). 300+ IP is the NORM for elite aces, not an overwork concern. DKR is weighted 24% for college SP (vs 20% in baseball) because durability is not optional in softball - it is essential. A pitcher who cannot handle 200+ IP in a college season has a legitimate durability concern.

### RKR - Repertoire KR
What it measures: Arsenal size, pitch mix diversity, rise/drop tunnel quality, change-up quality, and platoon resistance.

Key softball distinction: The rise/drop tunnel is a softball-specific sub-trait. The ability to throw a rise ball and drop ball from the same release point, forcing the hitter to decide up or down, is the foundation of elite softball pitching. A pitcher with elite rise/drop tunnel can succeed without top-end velocity.

### IQKR - Pitching IQ KR
What it measures: Pitch sequencing, speed changes/tempo, hitter memory and adjustment, tournament management, holding runners, and fielding position.

Key softball distinctions: (1) Tournament management is a softball-specific sub-trait - knowing when to conserve energy in blowouts, pace differently in must-win vs. comfortable leads, and manage workload across a tournament weekend. (2) Fielding position matters more because the pitcher at 43 feet is much closer to the batter than in baseball at 60'6". Comebackers and bunts are fielded at close range.

---

## 6. Player Evaluation Engine - The Full Protocol

Every player evaluation follows the V1 Evaluation Protocol. The protocol is mandatory and deterministic.

### The Anchor-First Principle

Phase 3 (Production Anchor) is the PRIMARY KR determinant. Phase 6 (Component KRs) adjusts the anchor, it does not replace it.

This means: read the legend at the player's level, map the player's full production profile against the legend tier descriptions, find the matching tier. That tier's KR range IS the anchor. Write it down before doing anything else. Then score the five component KRs. The components tell you WHERE within the anchor range the player sits. Phase 6 adjusts within Phase 3 +/- 10.

The critical rule: the legend anchor is truth. The math is confirmation. Not the other way around.

### Slap Hitter Evaluation

When evaluating a slap hitter, do NOT anchor on traditional power metrics. Anchor on: BA, OBP, SB, bunt-for-hit success, slap contact rate, ability to manufacture runs. A .420 BA / .490 OBP / 40 SB / 85% bunt success slapper is elite regardless of zero HR. Slappers are evaluated through their own production profile within the legend tiers.

### Pitcher Workload Evaluation

Evaluate pitcher workload in softball context, not baseball context. 250-350 IP is normal for a college softball ace. A pitcher who CANNOT handle 200+ IP has a legitimate durability concern. Do not apply baseball pitch count or innings limit thinking to softball pitchers.

### Mandatory Outputs

Every evaluation MUST include: player identity, season stats with context, Phase 3 production anchor with legend tier citation, Final KR with range and confidence %, all five component KRs with justification, Level Tier Map (what the KR means at every relevant level), key strengths, key weaknesses, and applicable badges.

### Suppression Detection

13 suppression rules cover scenarios where production understates true ability: injury suppression, role change suppression, level-up suppression, system mismatch suppression, platoon suppression, coaching change suppression, freshman adjustment suppression, slap suppression (slapper in a non-slap system), pregnancy/motherhood suppression (mandatory - extended absence due to pregnancy is a recognized suppression event), and others.

### Pregnancy/Motherhood Suppression

This is mandatory in softball evaluation. When production gaps are pregnancy-related, the system detects this and adjusts accordingly. Pre-pregnancy KR is preserved as the talent anchor, with return-to-play data evaluated for trajectory. Pregnancy is a life event, not an injury. Development trajectory resumes, not restarts.

---

## 7. The Hitter Trait Library

The hitter trait library contains 5 clusters with multiple sub-traits each:

### Cluster 1: Hitting (HKR)
Sub-traits: Contact Rate (1a), Batting Average/Hit Tool (1b), Bat-to-Ball Quality (1c), Situational Hitting (1d), Two-Strike Hitting (1e), Slap Hitting Proficiency (1f - SOFTBALL-SPECIFIC, LHB only).

### Cluster 2: Power/Plate Discipline (PKR)
Sub-traits: Walk Rate/Plate Discipline (2a), Chase Rate/Swing Decisions (2b), Raw Power (2c), Hard Hit Rate/Exit Velocity (2d), Slugging Efficiency (2e).

### Cluster 3: Fielding (FKR)
Sub-traits: Range/Defensive Value (3a), Fielding Percentage/Reliability (3b), Arm Strength/Accuracy (3c), Double Play Ability (3d, IF only), Catcher Receiving/Blocking (3e, C only), Catcher Throwing/CS% (3f, C only).

### Cluster 4: Speed/Baserunning/Slap (SKR)
Sub-traits: Stolen Bases/Success Rate (4a), Sprint Speed/Raw Speed (4b), Slap Game Execution (4c - SOFTBALL-SPECIFIC, LHB only), Extra Bases Taken (4d), Baserunning Value (4e).

### Cluster 5: Softball IQ (IQKR)
Sub-traits: Plate Approach Adjustments (5a), Situational Awareness (5b), Bunt/Slap Decision-Making (5c - SOFTBALL-SPECIFIC), Baserunning Decisions (5d), Defensive Positioning (5e), Clutch Performance (5f).

Each sub-trait has defined inputs, college bands (v0), and a box-score mode classification: PROXY (can be estimated from box-score data), INFERRED (weak estimation possible), or UNSCORED (requires advanced data not in box scores).

---

## 8. The Pitcher Trait Library

The pitcher trait library contains 5 clusters with multiple sub-traits each:

### Cluster 1: Velocity/Stuff (VKR)
Sub-traits: Pitch Speed (1a - underhand context: 66+ mph elite), Rise Ball Action (1b - SOFTBALL-SPECIFIC, the signature pitch), Drop Ball Depth (1c - SOFTBALL-SPECIFIC), Movement Quality (1d).

### Cluster 2: Command/Spin Control (CKR)
Sub-traits: Walk Rate/Zone Control (2a), Location Precision (2b), Spin Axis Consistency (2c - SOFTBALL-SPECIFIC, rise/drop tunneling), WHIP Control (2d).

### Cluster 3: Durability/Workload (DKR)
Sub-traits: Innings Volume (3a - 300+ IP is elite norm), Complete Game Rate (3b), Tournament Endurance (3c - SOFTBALL-SPECIFIC, 3-5 games in 2-3 days), Fatigue Resistance (3d), Health History (3e).

### Cluster 4: Repertoire (RKR)
Sub-traits: Arsenal Size (4a), Pitch Mix Diversity (4b), Rise/Drop Tunnel (4c - SOFTBALL-SPECIFIC, most devastating combination), Change-Up Quality (4d), Platoon Resistance (4e).

### Cluster 5: Pitching IQ (IQKR)
Sub-traits: Pitch Sequencing (5a), Speed Changes/Tempo (5b), Hitter Memory/Adjustment (5c), Tournament Management (5d - SOFTBALL-SPECIFIC), Hold Runners (5e), Fielding Position (5f).

---

## 9. Archetypes

### 14 Hitter Archetypes
Power Hitter, Contact Hitter, Table Setter, Slapper (softball-specific), Dual-Threat Slapper (softball-specific - the most dangerous offensive archetype), Five-Tool Player, OBP Machine, Run Producer, Premium Defender, Speed Merchant, Utility Weapon, Gap-to-Gap Hitter, Balanced Contributor, Defensive Specialist.

The Dual-Threat Slapper is unique to softball. A left-handed hitter who can slap AND swing for power is the most dangerous offensive archetype because the defense cannot commit to slap defense alignment when the hitter can drive the ball over their heads.

### 10 Pitcher Archetypes
Ace/Workhorse, Power Pitcher, Spin Pitcher (softball-specific), Movement Pitcher (softball-specific), Strikeout Artist, Command Pitcher, Pitchability, Two-Way Star (softball-specific), Reliever/Change-of-Pace, Tournament Closer (softball-specific).

The Ace/Workhorse is the single most valuable player type on a softball team. An ace who can pitch 300+ IP with sub-2.00 ERA carries the entire program.

---

## 10. Badges, Overrides, and System Risks

### Badges
17 hitter badges and 13 pitcher badges across three tiers (Gold +1.5, Silver +1.0, Bronze +0.5). Cap: +3.5 KR max from badges.

Softball-specific badges: Elite Slapper (Gold), Dual-Threat Slap (Silver), Workhorse (Gold, IP >= 300 with ERA <= 2.00), Strikeout Queen (Gold, K/7 >= 12.0 with 200+ K), Tournament Ace (Gold, ERA <= 1.00 in 30+ tournament IP), Two-Way Premium (Gold, both KRs >= 80).

### Overrides
5 positive overrides (max 1 at college): Conference Tournament MVP, WCWS Performance, USA Softball/National Team, Olympics/World Championship, Record-Setting Performance.
3 negative overrides (always apply): Postseason Collapse, Late-Season Fade, Disciplinary.

### System Risks
12 hitter risks and 10 pitcher risks across three severity tiers. Softball-specific risks: Slap Dependency (slap hitter who cannot hit traditionally), Fatigue Collapse (ERA in final third >= 2x first two-thirds), Tournament Endurance Failure.

---

## 11. Offensive Systems and Pitching Philosophies

### 5 Offensive Systems
Power/Launch, Slap-and-Run (softball-specific - manufacturing runs through slap hitting, speed, and baserunning pressure), Contact/Speed, Balanced, Small Ball.

The Slap-and-Run system is unique to softball. Programs with 3-4 left-handed slappers who can disrupt defensive alignment, combined with elite team speed (100+ SB), create an offensive identity that has no baseball equivalent.

### 5 Pitching Philosophies
Ace-Dominant (one pitcher carries 60-70% of innings), Dual-Ace (two co-aces split workload), Committee (three or more share innings), Strikeout-Dominant, Movement/Deception.

The Ace-Dominant philosophy is far more common in softball than baseball because softball aces can handle 300+ IP workloads. Most elite programs are built around a single dominant pitcher.

---

## 12. KLVN Lambda Normalization

### College Softball Lambdas

| Level | Lambda |
|-------|--------|
| NCAA D1 Power (SEC, Pac-12, Big 12, ACC, Big Ten) | 1.000 |
| NCAA D1 Non-Power (other D1 conferences) | 0.870 |
| NCAA D2 | 0.740 |
| NCAA D3 | 0.650 |
| NAIA | 0.710 |
| NJCAA D1 | 0.690 |
| NJCAA D2 | 0.580 |
| NJCAA D3 | 0.500 |

### Pro Softball Lambdas

| League | Lambda |
|--------|--------|
| Athletes Unlimited (US) | 1.000 |
| USA Softball National Team | 1.050 |
| Japan Softball League | 0.920 |
| Women's Professional Fastpitch | 0.900 |
| Canadian Wild Pitch League | 0.750 |
| Australian Softball League | 0.720 |
| Italian Softball League | 0.680 |
| Mexican Softball League | 0.650 |

Lambda normalizes INPUTS, not OUTPUTS. A KR is never multiplied by lambda.

---

## 13. The Legend System

Seven college legend files (NCAA D1 through NJCAA D3) and one pro legend file. Each legend has DUAL TRACKS - separate tier descriptions for hitters and pitchers.

The D1 Power legend is the most detailed, with production benchmarks for each tier:

Hitter example at D1 Power, Tier 95-97: "Franchise Player / Elite All-American. .340+/.420+/.580+, 15+ HR, 50+ RBI, All-American, drives WCWS berths."

Pitcher example at D1 Power, Tier 95-97: "Elite Ace. 1.00-1.50 ERA, 10+ K/7, sub-0.80 WHIP, 250+ IP, All-American. Carries team through tournament weekends single-handedly."

The Level Tier Map is one of the most valuable outputs for recruiting. For any player, it shows what their KR means at every relevant level, enabling instant cross-level comparison.

---

## 14. Team KR

Team KR measures the collective softball quality of a roster. The formula weights offense at 45% and pitching at 55% (pitching weighted higher than baseball because the ace's influence is even more dominant in softball).

### Lineup KR
Weights: 1 (leadoff): 14%, 2: 13%, 3: 14%, 4: 13%, 5: 12%, 6: 10%, 7: 10%, 8: 8%, 9: 6%. The lineup KR reflects the offensive identity.

### Circle KR
The pitching staff evaluation. Ace weight: 0.60 (because softball aces pitch 60-70% of innings), #2 pitcher: 0.25, remaining pitchers: 0.15. Circle KR reflects pitching depth and ace dominance.

### System Fit
System Fit% measures how well the roster matches the offensive system and pitching philosophy. Teams above 97% fit consistently overperform raw Team KR by 3-4 points - the same finding validated in basketball.

### Team KR Legends
D1 Power Team KR tiers: 95+ = National Championship contender, 91-94 = WCWS contender, 87-90 = Regional/Super Regional, 83-86 = Conference competitive / NCAA bubble, 79-82 = Middle of conference, 75-78 = Bottom of conference, Below 75 = Rebuilding.

---

## 15. Offensive System Identification (OSIE)

OSIE automatically identifies a team's offensive system from roster data. It classifies teams into one of the 5 offensive systems based on team-level metrics: team BA, OPS, HR rate, SB rate, K%, slapper count, bunt frequency. The classification drives downstream analysis including system fit scoring and matchup simulation.

The Slap-and-Run classification requires 3+ left-handed slappers on the roster, team SB >= 100, and team BA >= .300.

---

## 16. Pitching System Inference (PSIE)

PSIE automatically identifies a team's pitching philosophy from staff data. It classifies teams into one of the 5 pitching philosophies based on staff-level metrics: ace IP share, #2 pitcher IP share, staff K/7, staff GB%, number of pitchers with 50+ IP.

The Ace-Dominant classification requires one pitcher throwing 60%+ of team innings.

---

## 17. Simulation Engine

The simulation engine produces game-level predictions using archetype matchup interactions and system-level interactions.

### Two Interaction Layers
1. Pitcher Archetype x Hitter Archetype matchups (e.g., Dual-Threat Slapper is the most dangerous hitter archetype for any pitcher to face because the defense cannot commit to one approach)
2. Offensive System x Pitching Philosophy interactions (e.g., Slap-and-Run vs. Movement/Deception creates neutral-to-favorable matchup for the slappers because ground balls through a pulled-in infield create hits)

### 7-Inning Game Simulation
Softball games are 7 innings, not 9. The simulation models:
- Plate appearance resolution (9 outcomes calibrated to D1 softball: single, double, triple, HR, walk, HBP, K, ground out, fly out)
- Run rule: game ends if one team leads by 8+ after 5 innings
- International tiebreaker: runner starts on second in extra innings (used in some tournament formats)
- Pitcher fatigue model: aces can throw complete games routinely, but performance may degrade in second complete game of a doubleheader or third game of a tournament weekend

### Win Probability
Win probability factors: Team KR differential, pitcher matchup, system interaction, home/away, park factor, recent form.

---

## 18. Scouting and Game Ops

Four-phase game ops flow: Pregame Scout Packet, In-Game Live Ops, Mid-Game Staff Packet (at 4th inning in softball, not 5th - shorter game), Postgame Staff Packet.

### Mandatory Slap Defense Scouting
Any opponent with slappers requires mandatory slap defense alignment analysis in the Pregame Scout Packet. This includes: which hitters are slappers, their slap tendencies (soft slap, hard slap, drag bunt distribution), recommended defensive alignment adjustments (infield depth, corner positioning, outfield shade), and situational slap defense (runner on first with slapper at bat).

### In-Game Panels
6 panels: Real-Time Pitcher Tracking, Lineup Optimization, Defensive Alignment, Pitching Strategy, Base Running, and Tournament Workload Tracker (softball-specific - tracks pitcher IP across tournament games to project fatigue).

---

## 19. Development Intelligence Engine

Six outputs: Truth Summary ("Where Are You Now?"), Placement Targeting ("Where Should You Be?"), Player Value ("What Are You Worth?"), Gap Analysis ("What's Holding You Back?"), Development Roadmap ("What's the Path?"), Competitive Landscape ("Who Else Is Out There?").

### Softball-Specific Development
Slap development is a recognized development track (can be taught to left-handed batters with speed, 6-12 months for competency). Rise ball development is a recognized but difficult pitcher development track (requires specific spin rate and release, not all pitchers can develop a true rise).

### Transfer Portal Intelligence
Portal Value scoring factors: KR Fit (35%), System Fit (25%), Positional Scarcity (15%), Immediate Readiness (15%), Eligibility (10%). Portal risks include system mismatch (slapper from Slap-and-Run transferring to Power/Launch team) and role change (ace at prior school may be #2 at new school).

---

## 20. Pro Transition Engine

Translates college softball evaluation into professional projection.

### Critical Softball Distinction
There is no minor league system in professional softball. Players go directly from college to professional competition (Athletes Unlimited, WPF) or international leagues (Japan, Australia). The transition is more like basketball than baseball - immediate professional play.

### Entry KR
Professional starting point. Typical college-to-pro adjustment: -3 to -8 KR points from D1 Power college KR. Smaller adjustment than baseball because fewer physical variables change (same field, same ball, same pitching style, same bats).

### Peak KR
Professional ceiling over 2-3 years. Max +8 KR improvement over 3 years (shorter window than baseball's +15 over 3 years due to shorter pro careers and already-peaked physical development).

### Pro Pathway Analysis
Domestic: Athletes Unlimited (primary), WPF.
International: Japan Softball League (highest pay), Australian Softball League, Italian/Mexican leagues.
Olympic: 2028 Los Angeles. USA Softball national team selection (approximately 15-20 roster spots). KR threshold for consideration: approximately KR >= 90 at college level.

---

## 21. Suppression Detection

13 rules detect when production understates true ability:
1. Injury suppression
2. Role change suppression
3. Level-up suppression (first season at new level)
4. System mismatch suppression
5. Platoon suppression
6. Coaching change suppression
7. Freshman adjustment suppression
8. Slap suppression (slapper in non-slap system - SOFTBALL-SPECIFIC)
9. Pregnancy/motherhood suppression (MANDATORY - SOFTBALL-SPECIFIC)
10. Workload management suppression (ace rested in non-conference games)
11. Equipment/field change
12. Teammate quality suppression
13. Schedule strength suppression

Pregnancy/motherhood suppression is mandatory. Pre-pregnancy KR is preserved as the talent anchor. Return-to-play data is evaluated for trajectory. Not an injury - a life event.

---

## 22. Coaching Impact Modifier

Computes coaching-attributable development residuals. Modifies development PROJECTIONS only, never current KR.

### Softball-Specific
Pitching coach quality is the single most impactful coaching variable because the ace pitches 60-70% of all innings. The pitching coach's influence on that one player determines the team's ceiling.

Slap coaching is a specialized skill. Not all hitting coaches can teach slap technique. Programs with dedicated slap instruction develop elite slappers at a higher rate.

### Elite Development Programs (Tier 1)
Oklahoma (Patty Gasso - dynasty), UCLA, Alabama, Florida State. These programs consistently produce USA Softball players and drive WCWS outcomes.

---

## 23. Professional Softball Leagues

### Domestic
- **Athletes Unlimited:** Individual player-driven format. Weekly redraft. Performance-based compensation ($30K-$60K for top earners in 5-week season). Most visible domestic league.
- **Women's Professional Fastpitch (WPF):** Team-based traditional format. Lower salary but more traditional experience.

### International
- **Japan Softball League (JSL):** 12 corporate-sponsored teams. Highest international pay ($50K-$100K+ for top imports). Strongest international league.
- **Australian Softball League:** Growing, off-season (November-February). Lambda: 0.720.
- **Italian Softball League:** Top European league. Lambda: 0.680.
- **Mexican Softball League:** Emerging. Lambda: 0.650.

### Olympic Pathway
Softball returns to Olympics in 2028 (Los Angeles). Approximately 15-20 national team roster spots per country. The highest-profile opportunity in women's softball.

---

## 24. How It All Connects

The system flows in one direction: upstream truth feeds downstream engines.

Player Evaluation (Mode 1/1P) produces Player KR -> Team Evaluation (Mode 2) consumes Player KRs to produce Team KR -> Simulation (Mode 3) consumes Team KRs and archetypes to produce game predictions -> Scouting/Game Ops (Mode 4) consumes all upstream truth for game preparation -> Development/Portal (Mode 5) consumes Player KR for placement and development -> Pro Transition (Mode 6) consumes Player KR for professional projection.

No downstream engine ever modifies upstream truth. Team KR never changes a Player KR. Simulation never changes a Team KR. Development projections are not current evaluations.

---

## 25. The KaNeXT OS Context

Softball intelligence is one of multiple intelligence verticals within the KaNeXT Operating System. The OS serves institutions - schools, churches, businesses, sports programs - across five modes: Community, Personal, Business, Education, and Sports.

Softball intelligence lives in Sports Mode alongside basketball, baseball, football, soccer, women's basketball, women's volleyball, and women's soccer intelligence systems. Each sport shares the same KR architecture but with sport-specific content. A coach running both a softball and basketball program at the same institution uses the same KaNeXT OS with different intelligence layers activated per sport.

Nexus AI is the intelligence layer that accesses these files and produces evaluations. Coaches talk to Nexus. Nexus executes the protocols. The intelligence files are the system prompt, not the output.

---

## 26. Core Governance Principles

1. Deterministic: Same inputs produce same outputs
2. Auditable: Every step logged with inputs, outputs, confidence
3. No truth mutation: Downstream never modifies upstream
4. Confidence transparency: Every output includes confidence_pct
5. No data fabrication: Missing data = UNSCORED, never guessed
6. Legend is display-only: Legends interpret KR, they do not produce KR
7. KLVN normalization: All cross-level comparisons use lambdas
8. Pipeline separation: Hitter and pitcher pipelines are independent
9. Anchor against production profile numbers, not award labels
10. Slap hitting is first-class: Zero HR does not suppress a slapper's KR
11. Pitcher workload is softball-contextualized: 250-350 IP is normal
12. Pregnancy/motherhood suppression detection is mandatory

---

## 27. Confidence and Data Tiers

### Data Tier 1 - High Confidence
Official box-score stats from verified sources. Season-level aggregates with sufficient sample (75+ AB hitter, 50+ IP pitcher). These produce PROXY-level trait scores.

### Data Tier 2 - Moderate Confidence
Awards, honors, team records, coach quotes, recruiting rankings. These supplement Tier 1 data and inform contextual evaluation.

### Data Tier 3 - Low Confidence
Social media scouting opinions, unofficial measurements, unverified stats. Used for enrichment only, never as primary evaluation data.

### Confidence Thresholds
Full evaluation (confidence >= 65%): requires Tier 1 data with sufficient sample size.
Contextual evaluation (confidence 40-64%): limited data, partial season, or inference-heavy.
Preliminary assessment (confidence < 40%): insufficient data for formal evaluation. Flag as preliminary.

Physical data (height, weight, measurements) requires Tier 3 confirmation before finalizing. Listed data is frequently wrong - always seek official roster verification.

---

## 28. Glossary

**Athletes Unlimited (AU):** Primary US domestic professional softball league. Individual performance-based format with weekly team redraft.

**BBCOR:** Bat performance standard. Softball uses composite bats, not BBCOR bats, so there is no bat transition between college and pro softball (unlike baseball's aluminum-to-wood transition).

**Circle KR:** Pitching staff evaluation within Team KR. Named for the pitcher's circle on the softball field.

**CKR:** Command/Spin Control KR. Pitcher component measuring precision and spin consistency.

**DKR:** Durability/Workload KR. Pitcher component measuring innings capacity and tournament endurance.

**DP (Designated Player):** Softball-specific lineup position. Unlike baseball's DH, the DP CAN play defense. Paired with the FLEX player.

**Drop Ball:** Softball pitch thrown with topspin for sharp downward break. Softball's equivalent of a sinker.

**Dual-Threat Slapper:** Softball-specific archetype. Left-handed hitter who can slap AND swing for power. Most dangerous offensive archetype.

**FLEX:** Softball-specific lineup position. Defensive-only player paired with the DP. Can optionally bat.

**FKR:** Fielding KR. Hitter component measuring defensive value.

**HKR:** Hitting KR. Hitter component measuring hit tool and contact ability.

**IQKR:** Softball IQ KR. Component measuring mental game and situational intelligence (used for both hitters and pitchers).

**JSL (Japan Softball League):** Highest-paying international professional softball league. 12 corporate-sponsored teams.

**K/7:** Strikeouts per 7 innings. Softball uses this instead of K/9 because games are 7 innings.

**KLVN:** Lambda normalization system. Pronounced "Calvin." Adjusts inputs for cross-level comparison.

**KR:** KaNeXT Rating. Universal 0-100 player rating.

**Level Tier Map:** Shows what a KR means at every competitive level. Key recruiting output.

**NFCA:** National Fastpitch Coaches Association. Primary awards body for college softball.

**OPF:** Overall Position Framework. Position-specific component KR weights.

**OSIE:** Offensive System Inference Engine. Automatically classifies team offensive identity.

**PKR:** Power/Plate Discipline KR. Hitter component measuring approach quality and power output.

**PSIE:** Pitching System Inference Engine. Automatically classifies team pitching philosophy.

**Rise Ball:** Softball-specific pitch. Thrown with backspin exceeding gravity, creating apparent upward movement. The signature pitch of softball. No baseball equivalent.

**RKR:** Repertoire KR. Pitcher component measuring arsenal depth and pitch variety.

**Run Rule:** Game ends if one team leads by 8+ runs after 5 innings in college softball.

**SKR:** Speed/Baserunning/Slap KR. Hitter component measuring speed, baserunning, and slap game execution.

**Slap Hitting:** Softball-specific offensive technique. Left-handed batter uses running start to put ball in play through ground contact (soft slap, hard slap) or bunt (drag bunt). Speed is the primary weapon. No baseball equivalent.

**Two-Way Player:** Player who produces significant value as both hitter and pitcher. More common in softball than baseball.

**USA Softball:** National governing body. Selects national team for Olympics, World Championship, Pan American Games.

**VKR:** Velocity/Stuff KR. Pitcher component measuring underhand pitch quality.

**WCWS:** Women's College World Series. Softball's equivalent of the CWS/March Madness.

**WPF (Women's Professional Fastpitch):** US domestic professional softball league. Team-based traditional format.

---

## Document Statistics

- Total intelligence files: 17 (01-07 core + 7 college legends + college KLVN + pro legend + pro KLVN + knowledge base)
- Total hitter component KRs: 5 (HKR, PKR, FKR, SKR, IQKR)
- Total pitcher component KRs: 5 (VKR, CKR, DKR, RKR, IQKR)
- Hitter positions with OPF: 11 (C, 1B, 2B, 3B, SS, LF, CF, RF, DP, FLEX, UTIL)
- Pitcher roles with OPF: 2 (SP, RP)
- Hitter archetypes: 14
- Pitcher archetypes: 10
- Offensive systems: 5
- Pitching philosophies: 5
- Hitter badges: 17
- Pitcher badges: 13
- College legend levels: 7 (NCAA D1/D2/D3, NAIA, NJCAA D1/D2/D3)
- Suppression rules: 13
- Governance rules: 12
