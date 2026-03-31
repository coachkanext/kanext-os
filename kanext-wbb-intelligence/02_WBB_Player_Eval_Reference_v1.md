# WBB PLAYER EVALUATION REFERENCE
## v1.0 - Women's Basketball Intelligence

---

# UI SYSTEM SET

UI SYSTEM SET - v1 (LOCKED)

## Purpose
The UI System Set defines the valid offensive and defensive system selections available to coaches during Coach Context Setup. Identical to men's basketball. No evaluation, weighting, or normalization logic lives here.

**Offensive Systems (12):**
1. Spread Pick-and-Roll
2. 5-Out Motion
3. Motion / Read & React
4. Pace & Space
5. Dribble Drive
6. Princeton
7. Flex
8. Swing
9. Post-Centric / Inside-Out
10. Moreyball
11. Heliocentric
12. Coach K

**Defensive Systems (10):**
1. Containment Man
2. Pack Line
3. Pressure Man (Denial)
4. Switch Everything
5. ICE / No-Middle
6. Zone (Structured)
7. Matchup Zone / Hybrid
8. Press / Pressure Defense
9. Junk / Special
10. Coach K

### Women's Basketball System Distribution Notes
Post-Centric / Inside-Out is more common in women's basketball than men's at most levels, particularly at D2, D3, NAIA, and NJCAA where post play remains a dominant offensive strategy. Zone (Structured) is used more frequently in women's basketball at all levels. Switch Everything is less common due to greater physical mismatches between guard and post positions in women's basketball. Heliocentric is emerging at elite programs (UConn with Paige Bueckers, Iowa with Caitlin Clark were examples) but remains rare.

---

# TRAIT LIBRARY

KaNeXT Women's Basketball Trait Clusters - Canonical 8

1. **Shooting** (includes spacing/gravity/shot versatility as sub-traits)
2. **Finishing** (includes rim pressure, contact, foul draw, touch, transition finishing)
3. **Playmaking** (includes advantage creation, handle, passing, creation reads)
4. **POA Defense** (Point-of-Attack; on-ball, screen nav, containment, ball pressure)
5. **Team Defense** (help, rotations, rim protection, communication, scheme execution)
6. **Rebounding** (ORB/DRB, box-out, pursuit, contested boards)
7. **Tools** (size/length, strength, speed, lateral, vertical, motor/endurance)
8. **IQ** (decision quality + processing; avoids "vibes" by being tagged behaviors)

## WOMEN'S SPECIFIC SCORING BANDS

All trait scoring bands are calibrated to women's basketball distributions. League-wide averages for shooting, scoring, rebounding, and assists are different from men's basketball. The bands below reflect what constitutes elite, above-average, average, and below-average performance in the women's game specifically.

### THREE-POINT LINE HISTORICAL NOTE
NCAA women's basketball moved the three-point line from 20'9" to 22'1.75" (FIBA distance) starting in the 2021-22 season. The WNBA has used the FIBA distance (22'1.75") since 2013. All historical three-point data from before the relevant line change must be flagged and adjusted. Pre-2021-22 college percentages are expected to be 2-4% higher than post-2021-22 percentages for the same shooting ability.

### Shooting Cluster - Locked Traits (6)

**1) 3PT Spot-Up**
Synergy / PlayVision (TRUE)
- Counts: 3PA where dribble_count = 0 AND no movement-action tag
- Inputs: Spot-Up 3P%; Spot-Up 3PA/G

Women's College bands (v0) - Post-2021-22 line
- 90: 40%+ & 3.0+
- 80: 36-39% & 2.0-2.9
- 70: 33-35% & 1.4-1.9
- 60: 29-32% & 0.8-1.3
- <60: <29% or low volume

Women's Pro bands (v0) - WNBA/overseas
- 90: 41%+ & 3.5+
- 80: 37-40% & 2.5-3.4
- 70: 34-36% & 1.5-2.4
- 60: 30-33% & 0.8-1.4
- <60: <30% or minimal volume

Box-score mode: PROXY
- Inputs: overall 3P%, 3PA/G
- Score: round(0.70*Band(3P%) + 0.30*Band(3PA/G))

**2) 3PT Movement**
Synergy / PlayVision (TRUE)

Women's College bands (v0)
- 90: 38%+ & 2.0+
- 80: 35-37% & 1.4-1.9
- 70: 32-34% & 1.0-1.3
- 60: 28-31% & 0.6-0.9
- <60: <28% or low volume

Women's Pro bands (v0)
- 90: 40%+ & 2.5+
- 80: 37-39% & 1.8-2.4
- 70: 34-36% & 1.2-1.7
- 60: 30-33% & 0.8-1.1
- <60: <30% or minimal volume

Box-score mode: UNSCORED (cannot isolate movement shots from box score)

**3) 3PT Pull-Up**
Synergy / PlayVision (TRUE)

Women's College bands (v0)
- 90: 38%+ & 2.5+
- 80: 34-37% & 1.8-2.4
- 70: 30-33% & 1.2-1.7
- 60: 26-29% & 0.7-1.1
- <60: <26% or low volume

Women's Pro bands (v0)
- 90: 39%+ & 3.0+
- 80: 35-38% & 2.0-2.9
- 70: 31-34% & 1.5-1.9
- 60: 27-30% & 0.8-1.4
- <60: <27% or minimal volume

Box-score mode: UNSCORED (cannot isolate pull-up threes from box score)

**4) Midrange**
Synergy / PlayVision (TRUE)

Women's College bands (v0)
- 90: 48%+ & 3.0+
- 80: 43-47% & 2.0-2.9
- 70: 38-42% & 1.4-1.9
- 60: 33-37% & 0.8-1.3
- <60: <33% or low volume

Women's Pro bands (v0)
- 90: 50%+ & 3.5+
- 80: 45-49% & 2.5-3.4
- 70: 40-44% & 1.5-2.4
- 60: 35-39% & 0.8-1.4
- <60: <35% or minimal volume

Box-score mode: PROXY (estimate from 2PT% minus rim attempts if available)

**5) Free Throw Shooting**
Box-score (TRUE)

Women's College bands (v0) - same as men's, FT% is position/gender-neutral
- 90: 85%+ & 4.0+ FTA/G
- 80: 80-84% & 3.0-3.9
- 70: 75-79% & 2.0-2.9
- 60: 70-74% & 1.0-1.9
- <60: <70% or low volume

Women's Pro bands (v0)
- 90: 88%+ & 4.5+ FTA/G
- 80: 83-87% & 3.5-4.4
- 70: 78-82% & 2.5-3.4
- 60: 72-77% & 1.5-2.4
- <60: <72% or low volume

**6) Shot Versatility**
Synergy / PlayVision (TRUE)

Women's College bands (v0) - based on shot type diversity score
- 90: Elite creation from 3+ zones, 3+ shot types, self-created AND assisted
- 80: Strong versatility, 2-3 zones, multiple creation methods
- 70: Moderate versatility, 2 zones, primarily one creation method
- 60: Limited, primarily one zone or one shot type
- <60: One-dimensional shooter

Box-score mode: PROXY (derived from shooting splits and volume)

### Finishing Cluster - Locked Traits (6)

**7) Rim Pressure**
Women's College bands (v0)
- 90: 65%+ at rim & 4.0+ rim FGA/G
- 80: 60-64% & 3.0-3.9
- 70: 55-59% & 2.0-2.9
- 60: 50-54% & 1.2-1.9
- <60: <50% or low volume

Note: Women's rim finishing percentages are generally 3-5% lower than men's due to differences in athleticism above the rim. These bands are calibrated accordingly.

**8) Contact Finishing**
Synergy / PlayVision (TRUE)
Bands follow same structure as Rim Pressure with contest-adjusted percentages.
Box-score mode: PROXY (FTA/FGA ratio as proxy for contact finishing)

**9) Touch / Craft**
Synergy / PlayVision (TRUE)
Women's-specific: post players with elite touch around the rim are especially valuable in women's basketball where post play is more prominent. Floaters, hook shots, up-and-under moves all fall here.
Box-score mode: UNSCORED

**10) Foul Drawing**
Box-score (TRUE)
Women's College bands (v0)
- 90: 6.0+ FTA/G
- 80: 4.5-5.9 FTA/G
- 70: 3.0-4.4 FTA/G
- 60: 2.0-2.9 FTA/G
- <60: <2.0 FTA/G

**11) Transition Finishing**
Synergy / PlayVision (TRUE)
Women's College bands follow same structure. Transition frequency may be lower in women's game depending on system.
Box-score mode: UNSCORED

**12) Post Scoring**
Synergy / PlayVision (TRUE)
Women's College bands (v0) - MORE WEIGHT than men's due to post play prevalence
- 90: 55%+ post efficiency & 4.0+ post FGA/G
- 80: 50-54% & 3.0-3.9
- 70: 45-49% & 2.0-2.9
- 60: 40-44% & 1.2-1.9
- <60: <40% or low volume

Box-score mode: PROXY (post scoring estimated from 2PT% for bigs)

### Playmaking Cluster - Locked Traits (8)

**13) Advantage Creation**
Synergy / PlayVision (TRUE)
Box-score mode: PROXY (estimated from USG%, AST/TO, FGA volume)

**14) Passing Vision**
Synergy / PlayVision (TRUE)
Box-score mode: PROXY (AST/G, AST%)

Women's College bands (v0) - Box-score proxy
- 90: 6.0+ APG OR AST% 30%+
- 80: 4.5-5.9 APG OR AST% 24-29%
- 70: 3.0-4.4 APG OR AST% 18-23%
- 60: 2.0-2.9 APG OR AST% 12-17%
- <60: <2.0 APG

**15) Passing Execution**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**16) Ball Security**
Box-score (TRUE)
Women's College bands (v0)
- 90: AST/TO 3.0+ with USG% 20%+
- 80: AST/TO 2.2-2.9 with USG% 20%+
- 70: AST/TO 1.6-2.1
- 60: AST/TO 1.1-1.5
- <60: AST/TO <1.1

**17) Connector Creation**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**18) Decision Speed**
PlayVision only (TRUE)
Box-score mode: UNSCORED

**19) Screen Navigation (Offensive)**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**20) Handle Quality**
Synergy / PlayVision (TRUE)
Box-score mode: PROXY (TOV% relative to USG%, creation-heavy possessions)

### POA Defense Cluster - Locked Traits (5)

**21) On-Ball Containment**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**22) Ball Pressure**
Synergy / PlayVision (TRUE)
Box-score mode: PROXY (STL/G as directional signal)

Women's College bands (v0) - Box-score proxy (STL/G)
- 90: 2.5+ STL/G
- 80: 2.0-2.4 STL/G
- 70: 1.4-1.9 STL/G
- 60: 1.0-1.3 STL/G
- <60: <1.0 STL/G

Note: Women's basketball steal rates are slightly higher than men's on average. Bands are calibrated accordingly.

**23) Screen Navigation (Defensive)**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**24) Closeout Discipline**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**25) Matchup Versatility**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

### Team Defense Cluster - Locked Traits (6)

**26) Help Positioning**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**27) Rotation Execution**
PlayVision only (TRUE)
Box-score mode: UNSCORED

**28) Rim Protection**
Box-score (PROXY)
Women's College bands (v0) - BLK/G as proxy
- 90: 3.0+ BLK/G (extremely rare in women's basketball)
- 80: 2.0-2.9 BLK/G
- 70: 1.2-1.9 BLK/G
- 60: 0.7-1.1 BLK/G
- <60: <0.7 BLK/G

Note: Blocks per game in women's basketball are slightly lower on average than men's, but elite rim protectors (Aliyah Boston, Kamilla Cardoso type) produce 2.0+ BLK/G consistently.

**29) Communication**
PlayVision + coach tag (TRUE)
Box-score mode: UNSCORED

**30) Scheme Execution**
PlayVision + coach tag (TRUE)
Box-score mode: UNSCORED

**31) Weakside Activity**
Synergy / PlayVision (TRUE)
Box-score mode: PROXY (DRB% as directional signal for defensive engagement)

### Rebounding Cluster - Locked Traits (5)

**32) Offensive Rebounding**
Box-score (TRUE)
Women's College bands (v0)
- 90: 3.5+ ORB/G OR ORB% 14%+
- 80: 2.5-3.4 ORB/G OR ORB% 10-13%
- 70: 1.5-2.4 ORB/G OR ORB% 7-9%
- 60: 0.8-1.4 ORB/G OR ORB% 4-6%
- <60: <0.8 ORB/G

**33) Defensive Rebounding**
Box-score (TRUE)
Women's College bands (v0)
- 90: 8.0+ DRB/G OR DRB% 25%+
- 80: 6.0-7.9 DRB/G OR DRB% 20-24%
- 70: 4.5-5.9 DRB/G OR DRB% 15-19%
- 60: 3.0-4.4 DRB/G OR DRB% 10-14%
- <60: <3.0 DRB/G

**34) Box-Out Quality**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**35) Pursuit / Hustle Boards**
Synergy / PlayVision (TRUE)
Box-score mode: PROXY (ORB% as partial signal)

**36) Contested Rebound Rate**
PlayVision only (TRUE)
Box-score mode: UNSCORED

### Tools Cluster - Locked Traits (6)

CRITICAL: All Tools traits are scored against WOMEN'S physical distributions. These benchmarks are fundamentally different from men's basketball.

**37) Height**
Measured (TRUE)
Women's College bands (v0) - BY POSITION
- PG: 90 = 5'11"+, 80 = 5'9"-5'10", 70 = 5'7"-5'8", 60 = 5'5"-5'6", <60 = <5'5"
- SG: 90 = 6'0"+, 80 = 5'10"-5'11", 70 = 5'8"-5'9", 60 = 5'6"-5'7", <60 = <5'6"
- SF: 90 = 6'2"+, 80 = 6'0"-6'1", 70 = 5'10"-5'11", 60 = 5'8"-5'9", <60 = <5'8"
- PF: 90 = 6'4"+, 80 = 6'2"-6'3", 70 = 6'0"-6'1", 60 = 5'10"-5'11", <60 = <5'10"
- C: 90 = 6'6"+, 80 = 6'4"-6'5", 70 = 6'2"-6'3", 60 = 6'0"-6'1", <60 = <6'0"

**38) Wingspan**
Measured (TRUE) - when available
Women's-specific: wingspan data is less consistently reported for women's players than men's. When unavailable, trait = UNSCORED.
Bands: Position-relative, similar spread structure to height bands. Positive wingspan differential (wingspan > height) is a positive signal at all positions.

**39) Speed / Quickness**
Observed / timed (TRUE in testing; PROXY from film)
Women's College bands: scored relative to women's speed distribution. A women's guard with elite speed is scored 90+ even though her absolute 3/4 court time would be slower than a men's guard with elite speed.
Box-score mode: UNSCORED (no box-score proxy for speed)

**40) Lateral Quickness**
Observed / timed (TRUE in testing; PROXY from film)
Box-score mode: UNSCORED

**41) Vertical Athleticism**
Observed / tested (TRUE)
Women's College bands (v0)
- 90: Standing vertical 28"+, Max vertical 32"+ (extremely rare)
- 80: Standing 24-27", Max 28-31"
- 70: Standing 20-23", Max 24-27"
- 60: Standing 17-19", Max 20-23"
- <60: Standing <17"

Note: Women's vertical leap averages are significantly lower than men's. A 28" standing vertical for a women's player is elite. Dunking in women's basketball is extremely rare and represents truly exceptional athleticism.

**42) Motor / Endurance**
Observed (TRUE from film; PROXY from minutes + activity)
Box-score mode: PROXY (minutes played per game, games missed, activity rate in available minutes)

### IQ Cluster - Locked Traits (5)

**43) Shot Selection Quality**
Box-score (PROXY)
Women's College bands (v0) - TS% relative to usage
- 90: TS% 62%+ with USG% 25%+
- 80: TS% 58-61% with USG% 22%+
- 70: TS% 54-57% with USG% 18%+
- 60: TS% 50-53%
- <60: TS% <50%

**44) Role Discipline**
Synergy / PlayVision (TRUE)
Box-score mode: PROXY (shot distribution alignment with role)

**45) Decision Quality Under Pressure**
PlayVision (TRUE)
Box-score mode: PROXY (late-game splits if available; clutch performance data)

**46) Pace Management**
Synergy / PlayVision (TRUE)
Box-score mode: UNSCORED

**47) Processing Speed**
PlayVision only (TRUE)
Box-score mode: UNSCORED

---

# ARCHETYPE LIBRARY

ARCHETYPE LIBRARY v1 - WOMEN'S BASKETBALL

Same 21 archetypes as men's basketball, adapted for women's game with women's-specific gate thresholds and notes on archetype prevalence.

## Gate Rules (College v1)
Same structure as men's:
- Primary archetype: relevant Skill KR >= floor, all primary traits clear gates, at least one support trait clears gate
- Secondary archetype: Skill KR floor relaxed by -5
- Non-box-score rule: archetypes dependent on UNSCORED traits can only be assigned in non-box-score layer

## A) Engines + Connectors

**1) Pick-and-Roll Operator** - Playmaking KR >= 80. Primary: Advantage Creation >= 80, Passing Vision >= 78, Passing Execution >= 78.
Women's note: Less common than in men's game at lower levels. Increasingly prominent at D1 HM with the rise of elite point guard play (Clark, Bueckers, Paopao).

**2) Primary Ball-Handler (Offense-First)** - Playmaking KR >= 82. Primary: Advantage Creation >= 82, Ball Security >= 75, Passing Execution >= 75.

**3) Secondary Creator Wing** - Playmaking KR >= 78. Primary: Advantage Creation >= 78, 3PT Pull-Up >= 72.

**4) Connector Guard / Wing** - Playmaking KR >= 76. Primary: Connector Creation >= 80, Passing Execution >= 75.

**5) DHO / Handoff Hub** - Playmaking KR >= 76. Primary: Passing Execution >= 75, Connector Creation >= 75.
Women's note: Handoff actions are common in women's basketball, particularly at the elbow.

**6) Point Forward** - Playmaking KR >= 78. Primary: Advantage Creation >= 75, Passing Vision >= 75, Passing Execution >= 75. Tools gate: Height >= forward band.
Women's note: Increasingly valued. Players like NaLyssa Smith, Cameron Brink type who can initiate from the forward position.

**7) Situational Ball-Handler (Bench Guard)** - Playmaking KR >= 72. Primary: Passing Execution >= 72, Ball Security >= 70.

## B) Shooting Archetypes

**8) Off-Ball Shooter (Movement)** - Shooting KR >= 78. Primary: 3PT Movement >= 80, 3PT Spot-Up >= 78.
Women's note: Highly valued in women's basketball. Movement shooters are premium role players at every level.

**9) Spot-Up / Floor Spacer** - Shooting KR >= 78. Primary: 3PT Spot-Up >= 82.

**10) Shot Creator (Self-Generated)** - Shooting KR >= 80. Primary: 3PT Pull-Up >= 80, Midrange >= 78, Advantage Creation >= 75.

## C) Finishing / Post Archetypes

**11) Rim Finisher / Roll Threat** - Finishing KR >= 78. Primary: Rim Pressure >= 80, Contact Finishing >= 78.

**12) Post Scorer** - Finishing KR >= 78. Primary: Post Scoring >= 80, Touch/Craft >= 78.
Women's note: MORE COMMON and MORE VALUED in women's basketball than men's. Elite post scoring is a premium skill. This archetype is a primary archetype in many women's systems, not a secondary or niche label.

**13) Stretch Big** - Shooting KR >= 76 AND Finishing KR >= 72. Primary: 3PT Spot-Up >= 78. Tools gate: Height >= PF/C band.
Women's note: Increasingly valued as the women's game modernizes. Still less common than in men's game.

## D) Defensive Archetypes

**14) Two-Way Wing** - Offense KR >= 78 AND Defense KR >= 80. Primary: must clear gates in both offensive and defensive categories.

**15) 3-and-D Wing** - Shooting KR >= 78 AND Defense KR >= 78. Primary: 3PT Spot-Up >= 78, On-Ball Containment >= 75.

**16) POA Defender Guard** - POA Defense KR >= 82. Primary: On-Ball Containment >= 82, Ball Pressure >= 78.

**17) Switchable Defender Wing** - Defense KR >= 80. Primary: On-Ball Containment >= 78, Matchup Versatility >= 80.
Women's note: Less common in women's basketball due to greater physical differentiation between guard and post positions. When present, extremely valuable.

**18) Anchor Big (Rim Protector)** - Team Defense KR >= 82. Primary: Rim Protection >= 85, Help Positioning >= 78.
Women's note: Elite rim protectors are extremely valuable in women's basketball. Fewer players can protect the rim at an elite level, making this archetype premium.

## E) Utility / Developmental

**19) Energy Big** - Rebounding KR >= 78 AND Defense KR >= 75. Primary: ORB >= 78, Motor >= 80.

**20) Utility Forward** - No single KR >= 82, but KR >= 72 in at least 3 of 4 component areas.

**21) Developmental Prospect** - No strict Skill KR floor. Tagged when physical tools suggest significant upside but current production does not yet support assignment to any specific archetype.

---

# SYSTEM DEMAND PROFILES

## OFFENSE - System Demand Profiles (12)

Same 12 offensive systems as men's basketball. Each system defines which archetypes it demands (A = Critical, B = High, C = Optional, No Match = no system role).

Demand profiles are identical to men's basketball with the following women's-specific notes:

**Post-Centric / Inside-Out:** Higher baseline demand tier. In women's basketball, Post Scorer is elevated to Demand A (Critical) rather than Demand B. Rim Finisher also elevated. This system is more common and more impactful in women's basketball.

**Zone (Structured):** Higher defensive demand for Anchor Big. Zone defense is more common in women's basketball. Rim Protection demand elevated to A.

**Switch Everything:** Demand for Switchable Defender Wing is higher threshold. Fewer women's players can genuinely switch 1-5, making this system harder to staff.

All other system demand profiles follow the same structure as men's basketball.

## DEFENSE - System Demand Profiles (10)

Same 10 defensive systems. Demand profiles identical to men's with the zone-specific and switch-specific adjustments noted above.

---

# POSITION TRAIT WEIGHTING (OPF)

## Women's College OPF

| Position | Offense (OPF_off) | Defense (OPF_def) | Tools (OPF_tools) | IQ (OPF_iq) |
|----------|-------------------|-------------------|-------------------|-------------|
| PG | 54% | 28% | 10% | 8% |
| SG | 52% | 30% | 12% | 6% |
| SF | 46% | 34% | 14% | 6% |
| PF | 38% | 40% | 18% | 4% |
| C | 36% | 42% | 18% | 4% |

### Women's OPF vs Men's OPF Differences:
- PG offense weight is slightly lower than men's (54% vs 56%) because women's PGs are more often two-way contributors
- C defense weight is slightly lower than men's (42% vs 44%) while offense weight is higher (36% vs 34%) because post scoring is more prominent and valuable in women's basketball
- SF weights shift slightly toward defense reflecting the two-way wing value in women's game
- Tools weight is slightly higher for PF/C positions reflecting the premium on physical tools in the women's post game

## Women's Pro OPF

| Position | Offense (OPF_off) | Defense (OPF_def) | Tools (OPF_tools) | IQ (OPF_iq) |
|----------|-------------------|-------------------|-------------------|-------------|
| PG | 52% | 30% | 10% | 8% |
| SG | 50% | 32% | 12% | 6% |
| SF | 44% | 36% | 14% | 6% |
| PF | 36% | 40% | 18% | 6% |
| C | 34% | 42% | 18% | 6% |

Pro OPF shifts slightly toward defense and IQ at all positions, reflecting the increased tactical demands of professional women's basketball. Post play remains more prominent than in men's pro basketball.

---

# BADGES

BADGES - WOMEN'S COLLEGE v1 (LOCKED)

Same 34 badges as men's basketball organized by cluster. Same tier gates structure:
- College: Bronze (Skill KR >= 90, traits >= 90), Silver (>= 94), Gold (>= 97)
- Pro: Bronze (>= 93), Silver (>= 96), Gold (>= 98)
- KR lift: Bronze +0.5, Silver +1.0, Gold +1.5. Total badge lift cap: +3.5

Badge names, gate structures, and effect sizes are identical to men's basketball. The TRAIT THRESHOLDS that feed into badge gates differ because the underlying trait scoring bands are women's-specific.

### Shooting Badges (6)
1. Deadeye Shooter - 3PT Spot-Up, 3PT Movement, FT Shooting
2. Pull-Up Assassin - 3PT Pull-Up, Midrange, Advantage Creation
3. Movement Specialist - 3PT Movement, Screen Navigation (Off), Decision Speed
4. Catch-and-Shoot - 3PT Spot-Up, Decision Speed
5. Midrange Technician - Midrange, Touch/Craft
6. Gravity Generator - Shot Versatility, 3PT Spot-Up, 3PT Movement

### Finishing Badges (5)
7. Rim Pressure Elite - Rim Pressure, Contact Finishing, Foul Drawing
8. Craft Finisher - Touch/Craft, Contact Finishing
9. Transition Finisher - Transition Finishing, Speed, Motor
10. Post Dominator - Post Scoring, Touch/Craft, Rim Pressure (MORE RELEVANT in women's game)
11. Foul Magnet - Foul Drawing, Rim Pressure

### Playmaking Badges (5)
12. Floor General - Passing Vision, Passing Execution, Ball Security, Decision Speed
13. Pick-and-Roll Maestro - Advantage Creation, Passing Vision, Passing Execution
14. Shot Creator - Advantage Creation, Handle Quality, Shot Versatility
15. Connector Elite - Connector Creation, Passing Execution, Decision Speed
16. Ball Security Lock - Ball Security, Decision Speed, Handle Quality

### POA Defense Badges (4)
17. Lockdown Defender - On-Ball Containment, Ball Pressure, Lateral Quickness
18. Screen Navigator - Screen Navigation (Def), On-Ball Containment
19. Hands Active - Ball Pressure, Closeout Discipline
20. Matchup Eraser - Matchup Versatility, On-Ball Containment, Lateral Quickness

### Team Defense Badges (4)
21. Rim Protector - Rim Protection, Help Positioning (PREMIUM in women's game)
22. Help Defender Elite - Help Positioning, Rotation Execution, Communication
23. Weakside Watcher - Weakside Activity, Rotation Execution
24. Defensive Communicator - Communication, Scheme Execution

### Rebounding Badges (4)
25. Glass Cleaner - ORB, DRB, Box-Out Quality
26. Offensive Board Specialist - ORB, Pursuit, Motor
27. Defensive Board Anchor - DRB, Box-Out Quality
28. Pursuit Rebounder - Pursuit, Motor, Vertical

### IQ Badges (6)
29. Decision Maker - Decision Quality, Shot Selection, Processing Speed
30. Floor Spacer IQ - Shot Selection, Role Discipline, Pace Management
31. Clutch Performer - Decision Quality Under Pressure, Shot Selection
32. Pace Controller - Pace Management, Decision Speed, Ball Security
33. Role Discipline Elite - Role Discipline, Scheme Execution
34. Two-Way IQ - Decision Quality, Scheme Execution, Role Discipline (offense + defense)

---

# OVERRIDES

OVERRIDES - WOMEN'S BASKETBALL v1

Same structure as men's: college overrides (positive only, max 1 applies) and pro overrides.

## COLLEGE OVERRIDES (Positive Only - Max 1 Applies)

1. **Generational Athlete** (+5.0 KR): TKR >= 96 AND at least two of (Speed 95+, Vertical 95+, Height 95+ for position). Extremely rare in women's basketball. Applies to transcendent physical profiles.

2. **Unicorn Skill Profile** (+3.5 KR): Player qualifies for 3+ archetypes at primary level AND no system risk triggers. Versatile, well-rounded players who can do everything.

3. **Ultimate Winner** (+2.5 KR): Player has been the best player on a team that won a conference championship AND advanced deep in the NCAA tournament in 2+ seasons.

4. **Defensive Anchor Override** (+2.0 KR): DKR >= 93 AND Rim Protection >= 90 AND the player's team defense rating improves by 5+ points with them on floor. Rim protection is especially scarce and valuable in women's basketball.

5. **Creation Engine Override** (+2.0 KR): OKR >= 93 AND AST/TO >= 2.5 AND USG >= 28% AND TS% >= 58%. Elite offensive engines who create for themselves and others at scale.

6. **Iron Woman Override** (+1.5 KR): 35+ MPG for 3+ consecutive seasons with no significant games missed. Durability and availability at elite minutes.

7. **Leadership/Culture Override** (+1.0 KR): Team captain for 2+ seasons AND team has overperformed pre-season projections by 5+ wins per season. Must be confirmed by coaching staff.

8. **Clutch Performance Override** (+0.75 KR): Documented pattern of elevated performance in conference tournament and NCAA tournament games. Late-game scoring, big defensive plays in elimination games.

## PRO OVERRIDES - Positive (Max 1 Applies) - Each +1.0

1. **International Pedigree** (+1.0 KR): National team experience for a top-10 FIBA-ranked nation. Adjusts for international competition exposure.

2. **Multi-League Success** (+1.0 KR): Performed at high level in 2+ professional leagues (e.g., WNBA + EuroLeague Women + Turkish league).

3. **Playoff Performer** (+1.0 KR): Documented pattern of elevated production in WNBA playoffs or international tournament knockout rounds.

4. **Motherhood Return** (+1.0 KR): Returned to pre-pregnancy production level within 2 seasons of childbirth. Confirms elite mental and physical resilience.

## PRO OVERRIDES - Negative (Always Apply, Cannot Be Overridden)

1. **Chronic Injury Pattern** (-1.5 KR): 3+ significant injuries in 4 seasons resulting in 30%+ games missed.

2. **Age Decline Signal** (-1.0 KR): Age 34+ AND production declining 10%+ year-over-year for 2+ consecutive seasons.

3. **Conditioning / Availability Risk** (-1.0 KR): Consistent pattern of missing training camp, arriving out of shape, or mid-season absences unrelated to injury.

4. **League Departure Risk** (-0.5 KR): Player has publicly expressed intent to retire, reduce commitment, or prioritize overseas play over WNBA. Adjusts pro KR for availability uncertainty.

---

# SYSTEM RISKS

SYSTEM RISKS - WOMEN'S BASKETBALL v1

Same 14 system risks as men's basketball (9 major, 5 minor). College penalties: Major -2.0 KR, Minor -1.0 KR. Pro penalties: Major -4.0 KR, Minor -2.0 KR.

### College Tier 1 Major System Risks (-2.0 KR) - 5

1. **Range Gap** - Primary ball handler or wing cannot shoot 30%+ from three in a spacing-dependent system. Forces help defenders to sag and clogs driving lanes.

2. **Switch Liability** - Player cannot defend 2+ positions in a switch-based defensive scheme. Physical mismatch too severe. More common in women's basketball due to greater physical differentiation between positions.

3. **Turnover Risk Major** - Primary ball handler with AST/TO below 1.2 in a system that requires ball handler creation (Spread PnR, Heliocentric, Dribble Drive).

4. **Pace Incompatibility** - Post-centric player in a Pace & Space system with no ability to run the floor or space the perimeter. Slows system to a halt.

5. **Free Throw Liability** - Primary scorer shooting below 60% FT in any system. Leads to intentional fouling strategy.

### College Tier 2 Major System Risks - 4

6. **Help Defense Void** - Perimeter player assigned to a help-heavy scheme (Pack Line, Zone) who cannot execute rotations. Creates systematic defensive breakdowns.

7. **Post Defense Void** - Frontcourt player in a system requiring rim protection who cannot protect the rim (BLK rate < 1.0 per game, no contest rate data). Critical in women's basketball where post play is prominent.

8. **Single Skill Dependency** - Player's value is entirely concentrated in one trait cluster, and the system does not amplify that cluster. One-dimensional player in a multidimensional system.

9. **Creation Desert** - System requires a primary creator (Heliocentric, Spread PnR) and the assigned player cannot create advantages off the dribble.

### College Minor System Risks (-1.0 KR) - 5

10. **Transition Drag** - Slow player in a pace-pushing system. Team offensive efficiency drops when this player is in transition.

11. **Rebounding Void** - Starting-five player in a physical system (Inside-Out, Pack Line) who averages fewer than 3.0 RPG.

12. **Foul Trouble Pattern** - Starter averaging 3.5+ fouls per game. Limits availability in key stretches.

13. **Shot Selection Risk** - Player takes 25%+ of shots from below-average efficiency zones. Does not align with system shot distribution.

14. **Communication Gap** - Player in a defense-first system who does not communicate switches, screens, or rotations. More relevant in zone-heavy women's schemes.

### Pro System Risks
Same 14 risks at Pro level with doubled penalties: Major -4.0 KR, Minor -2.0 KR.

---

# IMPACT MODIFIERS

IMPACT MODIFIERS - WOMEN'S BASKETBALL v1 (LOCKED)

Same structure as men's. One modifier max per player. Does not alter KR.

**Primary Engine:** USG% >= 28% AND TS% >= 56% AND the team's offensive rating is 5+ points better with them on floor. THE primary offensive driver.

**Secondary Engine:** USG% 22-27% AND TS% >= 54% AND positive on/off. Important secondary creator.

**Force Multiplier:** USG% < 22% AND team offensive rating is 4+ points better with them on floor. Makes teammates better without dominating usage.

**Specialist Anchor:** One component KR >= 90 AND at least one other component KR <= 75. Extreme specialist whose value is entirely concentrated.

**Unclassified:** Does not meet any of the above thresholds OR MP < 200 (Low Sample).

---

# KLVN - WOMEN'S BASKETBALL COLLEGE LAMBDAS

KLVN - Level Normalization Ladder + D1 Conference Class Mapping
Status: Canonical (Active)

## Purpose
Same as men's: ensures player performance is comparable across competitive environments. KLVN performs normalization only and does not rank, value, or project players. Fully deterministic.

## Canonical Level Order (by lambda weight)

| Rank | Level Key | Lambda | Notes |
|------|-----------|--------|-------|
| 1 | ncaa_d1_high_major | 1.000 | Reference |
| 2 | ncaa_d1_mid_major | 0.955 | Slightly tighter gap vs men's due to more parity in WBB |
| 3 | ncaa_d1_low_major | 0.910 | |
| 4 | ncaa_d2 | 0.870 | |
| 5 | njcaa_d1 | 0.825 | |
| 6 | naia | 0.800 | |
| 7 | cccaa | 0.755 | |
| 8 | njcaa_d2 | 0.740 | |
| 9 | ncaa_d3 | 0.660 | |
| 10 | njcaa_d3 | 0.620 | |
| 11 | uscaa | 0.575 | |
| 12 | nccaa_d1 | 0.535 | |
| 13 | nccaa_d2 | 0.495 | |
| 14 | hs_prep_postgrad | 0.440 | |

### Women's Lambda vs Men's Lambda Differences
Lambda values for women's basketball are very close to men's but not identical. Key differences:
- D1 MM lambda is slightly closer to D1 HM (0.955 vs 0.958 for men's) reflecting the slightly greater competitive parity in women's D1 basketball
- NAIA lambda is slightly lower than men's (0.800 vs 0.810) reflecting a slightly wider gap between NAIA and D1 in women's basketball
- All lambdas are estimates (v0) and will be empirically calibrated as the system processes real player data

## D1 Major Class Mapping - Women's Basketball (2025-26)

**High-Major (HM) conferences:**
- ACC
- Big Ten
- Big 12
- SEC
- Big East

**Mid-Major (MM) conferences:**
- American (AAC)
- Atlantic 10 (A-10)
- Mountain West (MWC)
- West Coast (WCC)
- Missouri Valley (MVC)

**Low-Major (LM) conferences:**
- All other D1 conferences not in HM or MM

Note: Women's basketball conference strength does not always mirror men's. The WCC (Gonzaga, Portland, BYU) is stronger in women's basketball relative to men's in some seasons. Conference class mapping is season-scoped and will be updated as competitive landscapes shift.

## CRITICAL CLARIFICATION - KR IS UNIVERSAL
KLVN lambda normalizes INPUTS (production stats) during evaluation. It does NOT convert KR OUTPUTS. A player's KR is a single universal number. There is no "HM-equivalent KR." The Level Tier Map reads the same KR against different legends.

---

# COLLEGE PLAYER KR LEGENDS - WOMEN'S BASKETBALL

COLLEGE PLAYER KR LEGENDS - WOMEN'S BASKETBALL v1

Governance Note: Legends describe what players at each tier look like in terms of role, production, and impact for women's basketball specifically. Production benchmarks differ significantly from men's legends.

## NCAA DIVISION I - HIGH-MAJOR (lambda = 1.000)

**98-100 - National Player of the Year / Transcendent Superstar.**
Program-orbiting force. 22+ PPG on elite efficiency (TS% 62%+), plus significant secondary contributions (8+ RPG or 5+ APG). NPOY finalist or winner. Team is a Final Four contender built around this player. Warps opposing game plans. Reserved for generational single-season performers. Think A'ja Wilson's senior year, Caitlin Clark's record-breaking season.

**95-97 - Franchise Anchor / Elite All-American.**
Team's unquestioned alpha. 18+ PPG or double-double production with elite efficiency. All-American or Conference POY contender. 30+ MPG on a team that wins 25+ games. The team's identity is built around this player. Cannot be replaced. Think Paige Bueckers' healthy season, Aliyah Boston's NPOY year.

**92-94 - High-Impact Starter / Core Winner.**
Wins games at the highest level. Can be an offensive alpha or a two-way anchor. All-Conference caliber. 16+ PPG or dominant defensive/rebounding production. Trusted in late-game situations. Think the second-best player on a Final Four team or the best player on a top-20 team.

**89-91 - Solid Starter / Top-Five Rotation Lock.**
Firmly positive starter value at HM level. 25+ MPG. Consistent two-way impact. 12+ PPG with solid efficiency or elite defense/rebounding. All-Conference honorable mention range. The starters on ranked teams who aren't the stars but who you can't win without.

**86-88 - Trusted Rotation / High-Minute Role Player.**
Winning-role player who thrives in a defined role. 20+ MPG in meaningful games. Value comes from specialties: shooting, rim protection, distribution, perimeter defense, rebounding. Lineups improve with them on the floor.

**83-85 - Reliable Bench / Rotation Contributor.**
True rotation depth on good teams. 15-20 MPG. Consistent energy or specialty. The 6th-7th player on a ranked team.

**80-82 - Situational Specialist / Depth Piece.**
Matchup- and context-dependent contributor. 10-15 MPG.

**77-79 - Limited Bench / Emergency Depth.**
Playable only under constraint. 5-10 MPG sporadically.

**74-76 - Fringe Roster / Non-Rotation.**
On the roster, not in the competitive plan.

**71-73 - Developmental / Project.**
Future-oriented roster slot. Not currently viable in HM games.

**68-70 - Practice Squad / Walk-On.**
Roster filler for structure, not competition.

**Below 68 - Below HM Viability.**
Below HM competitive threshold.

## NCAA DIVISION I - MID-MAJOR (lambda = 0.955)

**98-100 - Conference Transcendent / National Attention.**
Dominant beyond the conference. 22+ PPG with 8+ RPG or 6+ APG on elite efficiency. Conference POY lock. National award watchlist. Could start and impact at any HM program.

**95-97 - Conference Dominant / All-American Candidate.**
Clear best player in the conference. 18+ PPG with elite secondary stats. All-Conference lock, possible All-American. Team wins the conference built around this player.

**92-94 - High-Impact Starter / Conference Star.**
One of the 3-5 best players in the conference. 15+ PPG with strong efficiency. All-Conference caliber.

**89-91 - Quality Starter / Conference Caliber.**
Solid starter. 12+ PPG. Consistent contributor on a winning team. Honorable mention all-conference.

**86-88 - Starter / Key Rotation.**
Starting-caliber player. 10+ PPG or elite role production.

**83-85 - Rotation Player.**
Solid rotation contributor. 15-22 MPG.

**80-82 - Bench Contributor.**
Role player off the bench.

**77-79 - Depth.**
Limited contributor.

**Below 77 - Fringe to non-competitive.**

## NCAA DIVISION I - LOW-MAJOR (lambda = 0.910)

**98-100 - Transcendent / Transfer Up Candidate.**
Best player in the conference by a wide margin. 22+ PPG with dominant secondary stats. Could be an immediate-impact transfer to any HM or MM program.

**95-97 - Conference Dominant.**
Clear conference star. 18+ PPG. All-Conference lock.

**92-94 - High-Impact Starter.**
Among the best in the conference. 15+ PPG.

**89-91 - Quality Starter.**
Strong starter. 12+ PPG.

**86-88 - Starter.**
Starting-caliber. 10+ PPG.

**83-85 - Rotation.**
Key rotation player.

**80-82 - Bench.**
Bench contributor.

**Below 80 - Depth to fringe.**

## NCAA DIVISION II (lambda = 0.870)

**98-100 - Transcendent / D1 Transfer Caliber.**
Generational D2 talent. 24+ PPG with elite all-around production. National POY candidate. Could transfer to D1 and immediately impact.

**95-97 - Franchise Anchor / Top All-American.**
Elite D2 player. 20+ PPG with dominant secondary contributions. All-American caliber.

**92-94 - High-Impact Starter / Core Winner.**
Star player. 17+ PPG. All-Region caliber.

**89-91 - Quality Starter.**
Strong starter. 14+ PPG with solid efficiency.

**86-88 - Starter.**
Reliable starter. 11+ PPG.

**83-85 - Rotation.**
Rotation contributor.

**80-82 - Bench.**
Bench player.

**Below 80 - Depth to fringe.**

## NCAA DIVISION III (lambda = 0.660)

**98-100 - Transcendent D3 talent.** 24+ PPG with dominant all-around. National POY candidate.
**95-97 - All-American caliber.** 20+ PPG. Conference dominant.
**92-94 - All-Region.** 17+ PPG. Among conference best.
**89-91 - Quality Starter.** 14+ PPG.
**86-88 - Starter.** 11+ PPG.
**83-85 - Rotation.**
**Below 83 - Bench to fringe.**

## NAIA (lambda = 0.800)

**98-100 - Transcendent NAIA talent.** 24+ PPG with elite efficiency. National tournament star. D1 transfer caliber.
**95-97 - All-American.** 20+ PPG. Conference dominant.
**92-94 - All-Conference Star.** 17+ PPG.
**89-91 - Quality Starter.** 14+ PPG.
**86-88 - Starter.** 11+ PPG.
**83-85 - Rotation.**
**Below 83 - Bench to fringe.**

## NJCAA D1 (lambda = 0.825)

**98-100 - Transcendent JUCO talent.** 24+ PPG. D1 scholarship caliber.
**95-97 - Elite JUCO.** 20+ PPG. High-major transfer target.
**92-94 - Star.** 17+ PPG. Mid-major or higher transfer target.
**89-91 - Quality Starter.** 14+ PPG.
**86-88 - Starter.** 11+ PPG.
**83-85 - Rotation.**
**Below 83 - Bench to fringe.**

## NJCAA D2 (lambda = 0.740)

**98-100 - Transcendent.** 26+ PPG. D2/NAIA transfer caliber.
**95-97 - Star.** 22+ PPG.
**92-94 - High-Impact.** 18+ PPG.
**89-91 - Quality Starter.** 15+ PPG.
**86-88 - Starter.** 12+ PPG.
**Below 86 - Rotation to fringe.**

## NJCAA D3 (lambda = 0.620)

**98-100 - Transcendent.** 26+ PPG.
**95-97 - Star.** 22+ PPG.
**92-94 - High-Impact.** 18+ PPG.
**89-91 - Quality Starter.** 15+ PPG.
**Below 89 - Starter to fringe.**

## CCCAA (lambda = 0.755)

**98-100 - Transcendent California CC talent.** 24+ PPG. D1 transfer caliber.
**95-97 - Star.** 20+ PPG.
**92-94 - High-Impact.** 17+ PPG.
**89-91 - Quality Starter.** 14+ PPG.
**86-88 - Starter.** 11+ PPG.
**Below 86 - Rotation to fringe.**

## USCAA (lambda = 0.575)

**98-100 - Dominant USCAA player.** 26+ PPG with elite all-around.
**95-97 - Star.** 22+ PPG.
**92-94 - High-Impact.** 18+ PPG.
**89-91 - Quality Starter.** 15+ PPG.
**Below 89 - Starter to fringe.**

## NCCAA D1 (lambda = 0.535)

**98-100 - Dominant.** 26+ PPG.
**95-97 - Star.** 22+ PPG.
**92-94 - High-Impact.** 18+ PPG.
**89-91 - Starter.** 15+ PPG.
**Below 89 - Rotation to fringe.**

## NCCAA D2 (lambda = 0.495)

**98-100 - Dominant.** 28+ PPG.
**95-97 - Star.** 24+ PPG.
**92-94 - High-Impact.** 20+ PPG.
**89-91 - Starter.** 16+ PPG.
**Below 89 - Rotation to fringe.**

---

# PRO PLAYER KR LEGEND - WOMEN'S BASKETBALL

KaNeXT - Pro Player KR Legend
Global Professional Women's Basketball
Player-Level Output Interpretation

## Scope
This legend provides a universal KaNeXT Rating (KR) for professional women's basketball players worldwide on a 0-100 scale. KR reflects global basketball value, role viability, and portability across professional environments.

## Context Assumptions
- Global women's pro ecosystem (WNBA, EuroLeague Women, Turkish KBSL, Australian WNBL, Chinese WCBA, and domestic leagues worldwide)
- Economic references reflect the NEW WNBA CBA (2026+) realities AND overseas salary markets
- The WNBA is the most competitive women's basketball league in the world, but NOT always the highest-paying for individual players

## PRO PLAYER KR TIERS (DISPLAY / READ-ONLY)

**98-100 - Global Apex / Transcendent Superstar.**
League-defining icon. One of the absolute best players in the world. Perennial MVP candidate. Warps systems and wins championships. WNBA: 22+ PPG with 9+ RPG or 5+ APG, elite efficiency.
Economic Reality: WNBA supermax ~$1.4M (2026). Overseas winter earnings can add $300K-$800K. Total annual earning potential $1.5M-$2.5M+. Endorsement potential significant.
Examples: A'ja Wilson, Breanna Stewart caliber.

**94-97 - Elite Franchise Anchor.**
Primary star who carries teams. Decisive impact in high-stakes games. WNBA All-Star or All-WNBA selection. 18+ PPG or dominant two-way production.
Economic Reality: WNBA max ~$1.3M. Overseas $200K-$600K. Total $1.2M-$2M+.
Examples: Napheesa Collier, Alyssa Thomas, Caitlin Clark (projected) caliber.

**90-93 - High-Impact WNBA Star.**
Reliable star starter who closes games and elevates teams. WNBA starter on a playoff team. 15+ PPG with strong secondary contributions.
Economic Reality: WNBA $600K-$1.2M. Overseas $150K-$400K. Total $700K-$1.5M.

**86-89 - Core Professional Contributor.**
Trusted high-minute rotation player with system value. WNBA starter or high-impact bench piece. 10+ PPG with role-specific impact.
Economic Reality: WNBA $400K-$700K. Overseas $100K-$300K. Total $400K-$900K.

**82-85 - Stable Professional Role Player.**
Dependable pro with recurring contracts. Starter in top overseas leagues or rotation in WNBA.
Economic Reality: WNBA $300K-$500K (near minimum). Overseas $80K-$200K. Total $300K-$600K.

**78-81 - Rotation-Level Professional.**
Established player who fits rotations reliably. WNBA end-of-bench or strong overseas starter.
Economic Reality: WNBA minimum ~$270K-$300K if rostered. Overseas primary salary $50K-$150K.

**73-77 - Fringe Professional.**
Edge-of-roster pro with variable job security. WNBA camp invitee or roster bubble. Strong starter in lower-tier overseas leagues.
Economic Reality: Overseas $30K-$100K. WNBA roster spot not guaranteed.

**68-72 - Entry-Level / Replacement Professional.**
Can land pro deals overseas but high churn. Below WNBA viability in most cases.
Economic Reality: $15K-$50K in lower overseas leagues.

**60-67 - Semi-Professional / Local Level.**
Below full pro viability. Competitive in semi-pro or lower domestic leagues.

**Below 60 - Non-Professional.**
Not sustainable at professional levels.

---

# PRO KLVN LAMBDAS - WOMEN'S BASKETBALL

## Purpose
Women's pro lambdas normalize inputs during trait scoring so that a player's KR reflects actual basketball ability regardless of league.

## Pro Lambda Table (v0) - Women's Basketball

| League | Lambda | Tier | Calibration |
|--------|--------|------|-------------|
| WNBA | 1.000 | 1 | Reference |
| EuroLeague Women | 0.900 | 1 | Estimate |
| Turkish KBSL | 0.860 | 2 | Estimate |
| Spanish Liga Femenina | 0.840 | 2 | Estimate |
| French LFB | 0.830 | 2 | Estimate |
| Italian Serie A1 | 0.820 | 2 | Estimate |
| Australian WNBL | 0.810 | 2 | Estimate |
| Chinese WCBA | 0.800 | 3 | Estimate |
| Russian Premier League | 0.790 | 3 | Estimate - geopolitical risk |
| Hungarian NB I | 0.760 | 3 | Estimate |
| Polish Basket Liga Kobiet | 0.750 | 3 | Estimate |
| Greek A1 Women | 0.740 | 3 | Estimate |
| German DBBL | 0.730 | 3 | Estimate |
| Israeli Women's Premier | 0.720 | 4 | Estimate |
| Brazilian LBF | 0.700 | 4 | Estimate |
| Korean WKBL | 0.700 | 4 | Estimate |
| Japanese W League | 0.690 | 4 | Estimate |
| UK WBBL | 0.660 | 4 | Estimate |
| Lower European domestic | 0.600-0.650 | 5 | Estimate |
| African leagues | 0.550-0.600 | 5 | Estimate |
| Southeast Asian leagues | 0.560 | 5 | Estimate |
| Unrivaled (3v3, US offseason) | N/A | N/A | Not evaluated - different format |

### Women's Pro Lambda Notes
- EuroLeague Women lambda is lower relative to WNBA than EuroLeague is relative to NBA, reflecting the wider talent concentration gap in women's basketball
- Russian Premier League was historically one of the strongest women's leagues but has been affected by geopolitical instability and FIBA sanctions since 2022. Lambda reflects basketball quality, not geopolitical risk (which is handled separately in risk assessment)
- WNBA expansion (13 teams in 2025, 15 in 2026, 18 by 2030) will gradually dilute per-team talent concentration, which may affect lambda calibration over time
- Unrivaled (US-based 3v3 league) is not included in lambda table because it uses a different format. Stats from Unrivaled are not directly comparable.

---

# WNBA TEAM REGISTRY (2026)

## Purpose
Maps every WNBA team's system identity, coaching, and competitive context. Enables system fit % and draft-appropriate evaluation for women's pro projections.

## 15 Teams (2026 Season)

| Team | HC | Offense | Defense | Window | Notes |
|------|-----|---------|---------|--------|-------|
| Las Vegas Aces | Becky Hammon | 5-Out Motion / Spread PnR | Switch | Contending | 3-time champion (2022-23, 2025). A'ja Wilson anchors everything. New CBA means retaining core is harder. |
| Minnesota Lynx | Cheryl Reeve | Motion / Read & React | Containment Man | Contending | Napheesa Collier, DiJonai Carrington core. Top-seeded in 2025. Veteran-laden. |
| New York Liberty | Chris DeMarco | Spread PnR / 5-Out | Switch | Contending | Breanna Stewart anchor. New coach from Warriors staff. Championship roster from 2024. |
| Connecticut Sun | Stephanie White | Post-Centric / Inside-Out | Pack Line | Contending | Physical, defense-first identity. Alyssa Thomas anchor. |
| Phoenix Mercury | Nate Tibbetts | Pace & Space | Containment Man | Rising | Rebuilding around young core post-Taurasi era. Kahleah Copper anchor. |
| Indiana Fever | Christie Sides | Spread PnR | Containment Man | Rising | Caitlin Clark and Aliyah Boston core. Both on rookie deals. Kelsey Mitchell re-signing key. |
| Atlanta Dream | Karl Smesko | Motion / Read & React | Zone | Rising | Franchise-record 30 wins in 2025. Allisha Gray, Rhyne Howard core. |
| Seattle Storm | Pokey Chatman/Raman* | Pace & Space / Motion | Switch | Retooling | Jewell Loyd anchor. Added Dominique Malonga (All-Rookie 2025). New coach. |
| Los Angeles Sparks | Lynne Roberts | Pace & Space | Containment Man | Rebuilding | Kelsey Plum addition. Young roster. |
| Chicago Sky | Tyler Marsh | Spread PnR | Pressure Man | Rebuilding | Angel Reese. Developing young core. |
| Dallas Wings | Jose Fernandez | TBD (new coach) | TBD | Rebuilding | Paige Bueckers (2025 #1 pick). 2026 lottery pick. New college coach. |
| Washington Mystics | Eric Thibault | Spread PnR / Motion | Pack Line | Rebuilding | Post-Delle Donne era rebuild. |
| Golden State Valkyries | Natalie Nakase | Motion / Read & React | Switch | Rising | Expansion team made playoffs in 2025. Veronica Burton anchor. Coach of the Year. |
| Portland Fire | Alex Samara | TBD (expansion) | TBD | Expansion | Debut 2026 season. Building through expansion draft + college draft + free agency. |
| Toronto Tempo | Sandy Brondello | TBD (expansion) | TBD | Expansion | Debut 2026 season. Brondello is 2x championship coach (Phoenix 2014, Liberty 2024). |

*Seattle coaching situation to be confirmed for 2026.

### WNBA Expansion Timeline
- 2025: Golden State Valkyries (13th team)
- 2026: Portland Fire, Toronto Tempo (15 teams)
- 2028: Cleveland (16 teams)
- 2029: Detroit (17 teams)
- 2030: Philadelphia (18 teams)

---

# PRO SALARY FRAMEWORK - WOMEN'S BASKETBALL

## WNBA Salary Structure - New CBA (2026+)

### Salary Cap: $7M (2026), projected to exceed $10M by end of 7-year deal

| Category | 2025 (Old CBA) | 2026 (New CBA) | Projected 2032 |
|----------|----------------|----------------|----------------|
| Salary Cap | $1.5M | $7.0M | $10M+ |
| Supermax | $249,244 | $1,400,000 | $2,400,000+ |
| Standard Max | $214,466 | ~$1,300,000 | ~$2,000,000+ |
| Average Salary | $120,000 | ~$583,000 | $1,000,000+ |
| Veteran Minimum (10+ yrs) | $78,831 | $300,000 | $380,000 |
| Minimum (1-3 yrs) | $66,079 | $270,000-$277,500 | $340,000+ |
| Rookie #1 Pick | $78,066 | ~$530,000 | TBD |

### EPIC Provision (Exceptional Performance on Initial Contract)
Under the new CBA, players on rookie contracts can renegotiate what would have been the fourth year of their deal:
- All-WNBA first or second team -> eligible for max deal
- MVP -> eligible for supermax deal
- Example: Caitlin Clark (All-WNBA as a rookie 2024) projected to earn $530K in 2026, max ($1.3M) in 2027, supermax ($1.7M) in 2028

### WNBA Salary Output by Pro KR Tier

| Pro KR | WNBA Salary Range (2026) | Role |
|--------|-------------------------|------|
| 94+ | $1.3M-$1.4M (max/supermax) | Franchise player |
| 90-93 | $700K-$1.2M | Star starter |
| 86-89 | $400K-$700K | Key starter/high-impact rotation |
| 82-85 | $300K-$500K | Rotation player |
| 78-81 | $270K-$350K | Near-minimum / end of bench |
| Below 78 | Not guaranteed WNBA roster | Overseas or out of league |

### Overseas Salary Ranges - Women's Basketball (2025-26 estimates)

| League | Star Import | Solid Import | Domestic Star | Notes |
|--------|------------|-------------|--------------|-------|
| Turkish KBSL | $300K-$600K | $100K-$250K | $50K-$150K | Historically one of highest-paying women's leagues |
| Russian Premier | $300K-$800K | $100K-$300K | N/A | Pre-2022 paid the most. Geopolitical risk since 2022. Few WNBA stars return. |
| Chinese WCBA | $200K-$500K | $80K-$200K | N/A | Short season (4-5 months). High per-month rate. |
| Spanish Liga F | $100K-$300K | $50K-$150K | $30K-$80K | Strong competition quality |
| French LFB | $100K-$250K | $50K-$120K | $30K-$70K | |
| Italian Serie A1 | $80K-$250K | $40K-$120K | $25K-$60K | |
| EuroLeague Women | $150K-$400K | $80K-$200K | Varies | Top European club competition |
| Australian WNBL | $50K-$150K | $30K-$80K | $20K-$50K | WNBA offseason aligned |
| Israeli Women's | $60K-$150K | $30K-$80K | N/A | Geopolitical risk since 2023 |
| Hungarian NB I | $50K-$120K | $25K-$60K | $15K-$40K | |
| Unrivaled (US 3v3) | $100K-$250K | $50K-$100K | N/A | New US offseason league. 2026 Season 2. |

### The Overseas vs WNBA Decision
Under the old CBA, top WNBA players routinely earned 2-5x their WNBA salary playing overseas in the offseason. The new CBA narrows this gap significantly:
- Old CBA: WNBA supermax $249K + overseas $500K = $749K total
- New CBA: WNBA supermax $1.4M + overseas $300K = $1.7M total (WNBA is now the primary income)

However, for non-star players:
- WNBA minimum ($270K) + overseas ($50K-$100K) = $320K-$370K
- Overseas-only star in Turkey ($400K) = more than WNBA minimum alone

The system must project BOTH paths for every pro evaluation. The economics have shifted but overseas play remains a significant factor in career planning.

### Salary Output Format
When projecting salaries, show:
- WNBA salary range based on Pro KR tier
- Best overseas league fit based on archetype and playing style
- Total annual earning potential (WNBA + overseas or overseas-only)
- How the new CBA EPIC provision affects earning timeline for young players

---

## BPR - Basketball Performance Rating

Identical structure to men's basketball BPR. Zero-centered, level-relative, single-game impact metric. See men's File 02 for full specification.

Women's BPR interpretation bands are the same:
- +10 and above: Game-warping impact
- +6 to +9: Clear winning driver
- +3 to +5: Reliable positive contributor
- -2 to +2: Neutral to slightly positive
- -3 to -5: Negative impact
- -6 and below: Strong negative impact

BPR is internal only. Not a UI metric.
