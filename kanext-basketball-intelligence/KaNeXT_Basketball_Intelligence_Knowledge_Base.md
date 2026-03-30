# KaNeXT Basketball Intelligence - Complete Knowledge Base

## Version 1.0 - March 2026

This is the comprehensive reference document for the KaNeXT Basketball Intelligence system. It covers every concept, every metric, every process, and every decision framework in the intelligence layer. Nexus references this document to answer any question about how the basketball intelligence works - from investors, coaches, scouts, analysts, and anyone interacting with the system.

---

# PART 1: THE INTELLIGENCE SYSTEM

---

## 1. What is KaNeXT Basketball Intelligence

KaNeXT Basketball Intelligence is a universal player and team evaluation system that produces deterministic, auditable ratings for basketball players at every competitive level in the world. It was built to solve a fundamental problem: basketball evaluation has always been subjective, fragmented, and impossible to compare across levels.

A scout watches a player at a mid-major school and says "he's good." A coach at a high-major program asks "but how good? Would he start for us? Would he be a role player?" There is no honest answer because there is no common language. The scout's "good" at the mid-major might mean "star" there but "bench player" at the high-major. Every evaluation lives in someone's head, filtered through their biases, their experience, and whatever games they happened to watch.

KaNeXT Basketball Intelligence replaces this with a system. Not a model. Not an algorithm. A complete intelligence framework that takes raw basketball data - box scores, advanced metrics, play-type data, film tracking - and produces a single universal number that means the same thing regardless of who computed it, when they computed it, or what level the player competes at.

That number is the KR.

The system was designed by a coach with 10+ years of experience developing 40+ college placements and 10+ professional placements, including multiple NBA-level players. It was validated across 152+ real players at 7 different teams spanning multiple competitive levels. It produces zero rank inversions - meaning every player ranks correctly relative to their peers when tested against reality.

The intelligence system is not just a rating. It includes team evaluation, game simulation, scouting reports, development planning, pro transition projections, and roster construction tools. All of these engines are downstream of the same core evaluation pipeline, meaning they all speak the same language and reference the same truth.

The intelligence lives inside the KaNeXT app through Nexus AI. Coaches do not read spreadsheets or navigate dashboards. They talk to Nexus. They ask questions in plain language - "evaluate this player," "who should we recruit," "simulate our next game," "what should we adjust at halftime" - and Nexus references the intelligence files to produce structured, honest answers.

The core philosophy: same inputs produce the same outputs, every time. No randomness. No editorial override. No truth mutation. The system is transparent about what it knows, what it does not know, and how confident it is in every output.

---

## 2. The KR System - Universal 0-100 Rating

KR stands for KaNeXT Rating. It is a single number on a 0-100 scale that represents a basketball player's total evaluated ability at the time of evaluation. KR is the atomic unit of the entire intelligence system. Every downstream engine - team evaluation, simulation, scouting, development, pro transition - consumes KR as its primary input.

### What KR Measures

KR captures the complete basketball player: offense, defense, physical tools, and basketball IQ, weighted by position. A point guard's KR weights offense heavily (56%) because that is what point guards are paid to do. A center's KR weights defense heavily (44%) because rim protection and rebounding are the center's primary job.

KR is not points per game. It is not PER. It is not a box score formula. KR is a composite of 47 individual trait scores, weighted by position, adjusted for system fit, modified by badges and overrides, and checked against system risks. The number reflects everything the player does on a basketball court.

### KR is Universal

This is the most important property of KR: a KR of 85 means the same thing regardless of what level the player competes at. A KR of 85 at NCAA D1 High-Major is the same number as a KR of 85 at NAIA. The number does not change based on level context.

What changes is the interpretation. Each competitive level has its own legend - a lookup table that translates KR values into tier labels describing what that number means at that specific level. An 85 KR reads differently depending on where you look it up:

- At D1 High-Major: 83-85 = Reliable Bench / Rotation Contributor
- At D1 Mid-Major: 85-87 = Solid Starter / Top-Five Rotation Lock
- At D1 Low-Major: 84-87 = High-Impact Starter / Core Winner
- At NCAA D2: 82-85 = High-Impact Starter / Core Winner
- At NAIA: 82-85 = Franchise Anchor / Top All-American

One player. One KR. Multiple legend reads depending on level context. This is the Level Tier Map - one of the most valuable outputs for recruiting, because it instantly tells a coach "this player is a role player at your level but a star two levels down."

### How KR Stays Universal: KLVN Lambda Normalization

The reason KR can be universal is that raw production stats are normalized before they enter the evaluation pipeline. A player averaging 20 points per game at NAIA is not producing the same basketball output as a player averaging 20 points per game at D1 High-Major. The competition, the athleticism, the defensive quality, and the pace are all different.

KLVN (pronounced "Calvin") is the normalization layer that adjusts production inputs so trait scoring is comparable across levels. Each competitive level has a lambda value between 0 and 1, where D1 High-Major is the reference point at 1.000.

Lambda normalizes INPUTS during trait scoring. It does NOT convert KR OUTPUTS. There is no "HM-equivalent KR." The KR is computed once, at the player's home level, using lambda-normalized inputs. That number is final and universal.

Incorrect usage: "His KR is 85 at MM, which would be 81 at HM." This is wrong. His KR is 85, period. The Level Tier Map shows what 85 means at every level.

### What Different KR Ranges Mean

To give a sense of scale using D1 High-Major as the reference:

- 98-100: National Player of the Year. Transcendent. Game warps around them and it still does not work. Reserved for generational single-season performers.
- 95-97: Franchise Anchor / Elite All-American. Team's unquestioned alpha. All-American caliber. Cannot be replaced.
- 92-94: High-Impact Starter / Core Winner. Wins games at the highest level. All-Conference caliber. Trusted in late-game situations.
- 89-91: Solid Starter. Firmly positive starter value. 25+ minutes per game. Consistent two-way impact.
- 86-88: Trusted Rotation / High-Minute Role Player. Thrives in a defined role. 20+ minutes in meaningful games.
- 83-85: Reliable Bench / Rotation Contributor. True rotation depth on good teams. 15-20 minutes per game.
- 80-82: Situational Specialist / Depth Piece. Matchup-dependent. 10-15 minutes per game.
- 77-79: Limited Bench / Emergency Depth. Playable only under constraint.
- Below 77: Fringe roster to non-competitive.

At the professional level, the KR scale shifts because the talent floor is higher:

- 98-100: Global Apex / Transcendent Superstar (Jokic at 98.5 is the reference)
- 94-97: Elite Franchise Anchor (Wembanyama 97.8, SGA 97.5, Luka 96.2, Giannis 94.8)
- 90-93: High-Impact Global Star (KD 93.0, Cade 92.4, Curry 92.0, Reaves 90.2)
- 86-89: Core Professional Contributor (LeBron 89.5 at age 41, Knueppel 87.8 as a rookie, Flagg 86.4 as a rookie)
- 82-85: Stable Professional Role Player
- 78-81: Rotation-Level Professional
- 73-77: Fringe Professional
- Below 73: Below sustained professional viability

---

## 3. Player Evaluation Engine - The Full Protocol

The player evaluation engine is the core of the intelligence system. It takes raw data about a basketball player and produces a KR through a deterministic pipeline. The pipeline has two blocks: Base Truth (who the player is regardless of system) and System Context (how the player fits within a specific coach's system).

### The V1 Evaluation Protocol

Most evaluations of real players use public data - box scores and advanced composites. This is the V1 data tier. The V1 protocol has five steps, executed in strict order.

**Step 1: Coach Context.** Set the program, level, governing body, division, major class (if D1), offensive system, and defensive system. This binds all downstream computation - which KLVN lambda to use, which legend to reference, which position weights to apply.

**Step 2: Phase 3 - Production Anchor.** This is the primary KR determinant. Read the KR Legend at the player's level. Map the player's full production profile - points, rebounds, assists, efficiency, usage, minutes, team role - against the legend tier descriptions. Find the tier whose production description matches. That tier's KR range IS the anchor.

Example: A player averaging 22/10/4 on .570/.390/.800 as a freshman starter at D1 HM maps to the 95-97 tier based on the production description. The anchor is 95-97. Write it down before doing anything else.

**Step 3: Phase 6 - Component KRs.** Score the four component KRs from the data: OKR (Offensive KR), DKR (Defensive KR), TKR (Tools KR), and IQKR (IQ KR). Each component is on the same 0-100 scale. These tell you WHERE the player is strong and weak. The Phase 6 output tells the DIRECTION within the anchor range.

At V1, Phase 6 uses composite bounding to handle the 31 of 47 traits that cannot be scored from box-score data. NULL traits are bounded by composite metrics (BPM, Usage%, TS%, etc.) so that the OPF math has something to work with. Proxy confidence weights blend scored traits with their cluster's composite bound.

**Step 4: Phase 6 Adjusts Within Phase 3 +/- 10.** The final KR must fall within the Phase 3 anchor range expanded by 10 in either direction. If Phase 3 anchor is 95-97, Phase 6 can push the final KR anywhere from 85 to 100. If Phase 6 produces 84, something is wrong with the trait scoring, not the anchor. The component KRs NEVER override the production anchor.

**Step 5: Final KR.** The adjusted number is the V1 KR. Output includes the final KR, KR range, confidence percentage, Phase 3 anchor (for transparency), Phase 6 raw (for transparency), component KRs with justification, Level Tier Map, key strengths, key weaknesses, and badges if applicable.

### The Six Anchoring Rules

These rules apply to ALL evaluations, college and pro. They prevent the most common evaluation errors.

**Rule 1: Anchor against production profile numbers, not award labels.** The stats, efficiency, usage, minutes, and team role determine the tier. Awards confirm a tier placement - they do not determine it. A player averaging 15/4/9 is not automatically 95+ because he won national awards. A player averaging 22/10/4 on elite efficiency IS 95+ because the production maps there regardless of awards.

**Rule 2: Awards are confirmation, not input.** All-American, Conference POY, DPOY - these confirm you are in the right tier. They do not push you into a higher tier if the production does not support it. A Conference POY who averages 15/4/9 can be a 92, not a 96.

**Rule 3: Pedigree does not inflate current KR.** Five-star recruit, McDonald's All-American, top-3 recruit class - these set ceiling context for development projection. They do NOT inflate present-tense college KR. Rate what the player IS, not what he was rated coming out of high school.

**Rule 4: Team success does not inflate individual KR.** A role player on a 35-3 team is still a role player. A star on a .500 team is still a star. Team record provides context (strength of schedule, competition level) but does not override individual production.

**Rule 5: Historical comparisons are irrelevant.** "Best since Zion" or "comparable to Ja Morant's freshman year" - these are narratives, not data. Anchor on THIS player's production against THIS level's legend.

**Rule 6: Read the numbers first. Check labels second.** Find the tier where the numbers match. Then read the label to confirm it makes sense. If the numbers say 92-94 but you feel like the player "deserves" 95+ because of awards or narrative, the numbers win.

### What is Prohibited in College Evaluations

- NO pro projections, draft stock, NBA comparisons, or lottery language. College KR is present-tense only.
- NO invented modifier systems, arbitrary point additions, or made-up formulas.
- NO emojis, checkmarks, or marketing language.

**The core principle: The legend anchor is truth. The math is confirmation. Not the other way around.**

### Data Tier Progression

As data quality improves, the balance of authority shifts from Phase 3 (production anchor) to Phase 6 (trait math):

| Data Tier | Traits Scored | Phase 3 Authority | Phase 6 Authority |
|---|---|---|---|
| V1 (box score) | 16-21 | Primary - anchors range | Secondary - adjusts within range |
| V1+ (play-type) | 25-35 | Shared - validates Phase 6 | Shared - growing authority |
| V2 (PlayVision 1 season) | 40-45 | Secondary - validation check | Primary - drives the KR |
| V3 (PlayVision multi-season) | 45-47 | Minimal - sanity check only | Full authority - KR is the math |

At V3, with all 47 traits scored from real tracking data, the math drives everything and the legend is just a sanity check. At V1, with only 16-21 traits scored, the production anchor does most of the work and the math adjusts within the anchor's range.

---

## 4. Component KRs - OKR, DKR, TKR, IQKR

Every player evaluation produces four component KRs that break down the overall rating into its constituent parts. These are the building blocks of the final KR and the most useful outputs for understanding a player's basketball identity.

### OKR - Offensive KR

OKR measures total offensive basketball ability. It includes shooting (spot-up, movement, pull-up, deep range, midrange, free throw), finishing (rim pressure, contact finishing, touch/craft, foul draw, vertical finishing, transition finishing), and playmaking (advantage creation, passing vision, passing execution, advantage passing, transition playmaking, ball security, connector creation).

What different OKR values look like at D1 HM:

- OKR 95+: Elite offensive engine. Creates shots for himself and others at will. Forces game plans. Think of a player who averages 22+ PPG on elite efficiency while also distributing 5+ assists.
- OKR 90-94: High-level offensive player. Can be the primary option on a tournament team. Creates advantages consistently.
- OKR 85-89: Solid offensive contributor. One or two real offensive skills. Reliable in a role.
- OKR 80-84: Limited offensive player. One-dimensional or inconsistent. Functions in a specific role.
- OKR 75-79: Below-average offense. Defensive or energy player whose offense is a weakness.
- Below 75: Offensive liability. Defenders leave him to help elsewhere.

At the pro level, Luka Doncic's OKR of 98 is the highest calibrated - the best pure scorer alive. SGA's OKR of 97 is close behind but more balanced. Cooper Flagg's rookie OKR of 85 reflects a player whose offense has not yet translated - his .286 3P% is the critical gap.

### DKR - Defensive KR

DKR measures total defensive basketball ability. It includes point-of-attack defense (containment, screen navigation, ball pressure, closeout/recovery, deflections, steal timing, foul discipline), team defense (help/rotation, rim protection, closeout execution, off-ball positioning, communication, versatility, team foul discipline), and rebounding (defensive rebounding, offensive rebounding, box-out, rebound range, hands, second-jump).

What different DKR values look like:

- DKR 95+: Elite defensive anchor. Changes the game on that end. Teams avoid him. Think Wembanyama (DKR 99) - 3+ blocks per game while contesting everything at the rim.
- DKR 90-94: Excellent defender. All-Defensive team caliber. Can guard multiple positions or single-handedly protect the rim. SGA (DKR 92) at the guard position.
- DKR 85-89: Above-average defender. Does not hurt you and often helps. Flagg (DKR 88) as a rookie - defense translating immediately.
- DKR 80-84: Average to slightly above-average. Adequate but not a weapon.
- DKR 75-79: Below-average. Gets targeted. Luka (DKR 75) is the reference - his defense caps his overall KR despite elite offense.
- Below 75: Defensive liability. Gets hunted in the playoffs.

Key calibration insight: DKR separates tiers at the top. The difference between the 98+ tier (Jokic, Wembanyama) and the 94-97 tier (Luka, Giannis) is primarily defense.

### TKR - Tools KR

TKR measures physical tools: height, length/wingspan, strength, speed, lateral quickness, vertical pop, motor, and endurance. TKR is the most position-variable component because physical demands differ dramatically by position.

For a center, TKR is heavily weighted toward height (26%), length (22%), and strength (20%). For a point guard, TKR is weighted toward lateral quickness (22%), speed (18%), and motor (18%).

What different TKR values look like:

- TKR 95+: Elite physical specimen. Wembanyama (TKR 99) with his 7'4" frame and 8'0" wingspan is the reference. Giannis (TKR 97) with his combination of size, speed, and length.
- TKR 90-94: Excellent physical tools. Above the norm for the position in multiple categories. KD (TKR 92) - 6'11" with guard skills.
- TKR 85-89: Good tools. Adequate for the position with one or two standout attributes. LeBron (TKR 88) at age 41 - remarkable that tools are this high at his age.
- TKR 80-84: Average tools for the level. Nothing that stands out positively or negatively.
- TKR 75-79: Below-average tools. Must compensate with skill. Reaves (TKR 76) proves skill can overcome limited tools.
- Below 75: Significant physical limitations. Curry (TKR 68) has the lowest TKR of any calibrated player - his entire career is skill-over-tools.

Key calibration insight: TKR predicts aging curve speed. KD (TKR 92, skill-based height) is declining slowest. Curry (TKR 68, speed-based game) is declining fastest. Giannis (TKR 97, athleticism-based) will decline fast once explosiveness goes. Low TKR means faster decline because speed and quickness deteriorate before height and length.

### IQKR - IQ KR

IQKR measures basketball intelligence: decision speed, shot selection quality, turnover decision quality, advantage conversion, role discipline, and processing under pressure. IQKR is the hardest component to measure from box scores because most IQ traits require film analysis.

What different IQKR values look like:

- IQKR 97+: Basketball genius. Jokic (IQKR 100) is the highest ever calibrated - his triple-double production comes from processing the game faster than anyone else. LeBron (IQKR 97) and Curry (IQKR 97) are in this range. IQKR at this level barely declines with age.
- IQKR 90-96: Elite basketball mind. Makes the right play consistently. High assist-to-turnover ratios. Luka (IQKR 95), SGA (IQKR 96), Cade (IQKR 94), Reaves (IQKR 94). Reaves' IQKR 94 reflects his ability to scale up as a number-one option or down as a number-three - the rarest basketball skill.
- IQKR 85-89: Smart player. Rarely makes bad decisions. Good shot selection. Giannis (IQKR 86) - never his strength, but adequate.
- IQKR 80-84: Average decision-maker. Makes some mistakes but generally functional.
- Below 80: Poor decision-making. High turnover rates, bad shot selection, or inability to process pressure.

Key calibration insight: IQKR barely moves with age. LeBron's IQKR went from 99 at peak to 97 at age 41. Basketball IQ does not age. This makes IQKR the most stable predictor of long-term career value.

### How Component KRs Combine Into Final KR

The four components combine through the Overall Position Framework (OPF), which assigns different weights by position:

| Position | OKR Weight | DKR Weight | TKR Weight | IQKR Weight |
|---|---|---|---|---|
| PG - College | 56% | 28% | 10% | 6% |
| SG - College | 58% | 26% | 12% | 4% |
| SF - College | 52% | 30% | 14% | 4% |
| PF - College | 44% | 36% | 18% | 2% |
| C - College | 34% | 44% | 20% | 2% |
| PG - Pro | 58% | 28% | 5% | 9% |
| SG - Pro | 60% | 28% | 6% | 6% |
| SF - Pro | 54% | 32% | 7% | 7% |
| PF - Pro | 46% | 40% | 10% | 4% |
| C - Pro | 36% | 48% | 12% | 4% |

Key differences between college and pro weights: at the pro level, Tools weight decreases (because everyone is athletic) and IQ weight increases (because decision-making separates players against elite competition). Defense weight increases for bigs at the pro level because rim protection becomes more critical against NBA-level offenses.

---

## 5. The Trait Library

The trait library defines the 47 individual traits organized into 8 clusters that feed into the four component KRs. Every trait has defined scoring bands for both college and pro levels, a data source classification (TRUE, PROXY, or UNSCORED depending on the data tier), and specific measurement criteria.

### Shooting Cluster (6 traits)

**3PT Spot-Up:** Stationary catch-and-shoot threes with no dribble and no movement action. The most measurable shooting trait. College band 90: 42%+ on 3.5+ attempts per game. Box-score mode: PROXY using overall 3P% and 3PA/G.

**3PT Movement:** Off-screen, pindown, flare, stagger, DHO chase, relocation shots. Measures ability to shoot while moving. College band 90: 40%+ on 2.5+ attempts. Box-score mode: UNSCORED (requires play-type tagging).

**3PT Pull-Up:** Self-created threes off the dribble. Includes iso, PnR ball-handler, stepback, sidestep. College band 90: 38%+ on 2.0+ attempts. Box-score mode: UNSCORED.

**3PT Deep Range:** Threes from beyond standard range (NBA range or deeper). College band 90: 38%+ on 1.5+ attempts. Box-score mode: UNSCORED.

**Midrange Shotmaking:** All two-point jumpers inside the midrange band. Includes pull-ups, turnarounds, post fades, stepbacks. College band 90: 48%+ on 3.0+ attempts. Box-score mode: UNSCORED unless shot-type splits are available.

**Free Throw:** All free throw attempts. College band 90: 88%+ on 4.0+ attempts. This is a TRUE score at every data tier because FT% is always available. Free throw percentage is also the "truth serum" for shooting development projection - a player's FT% is the best predictor of whether their three-point shooting will develop.

### Finishing Cluster (6 traits)

**Rim Pressure:** Frequency and effectiveness of attacks at the rim. College band 90: rim FG% 65%+ on 5.0+ attempts. Box-score mode: PROXY using FTA rate and two-point attempt volume.

**Contact Finishing:** Ability to finish through contact. College band 90: and-one rate 12%+ on rim attempts, plus completion through contests. Box-score mode: UNSCORED.

**Touch/Craft:** Floaters, runners, hook shots, reverse layups, scoop finishes. The finesse finishing package. Box-score mode: UNSCORED.

**Foul Draw:** Ability to draw fouls through physical play. College band 90: FTA/FGA ratio 0.50+. Box-score mode: PROXY using FTA rate.

**Vertical Finishing:** Dunks, lobs, alley-oops, above-the-rim finishes. Box-score mode: UNSCORED.

**Transition Finishing:** Fast-break scoring. Box-score mode: UNSCORED unless transition play-type data exists.

### Playmaking Cluster (7 traits)

**Advantage Creation:** Ability to create offensive advantages through dribble penetration, pick-and-roll navigation, or isolation. The engine of offense. Box-score mode: PROXY (weak, 0.50 confidence) blending multiple signals.

**Passing Vision:** Ability to see and anticipate passing lanes. Box-score mode: PROXY (0.40 confidence - heavily role/system dependent).

**Passing Execution:** Accuracy and timing of passes. Box-score mode: PROXY (0.40 confidence).

**Advantage Passing:** Passes that directly create scoring advantages for teammates - skip passes, pocket passes, lob entries. Box-score mode: UNSCORED.

**Transition Playmaking:** Decision-making and execution in the open court. Box-score mode: UNSCORED.

**Ball Security:** Ability to protect the ball under pressure. College band 90: TOV% below 10% with usage above 20%. Box-score mode: PROXY (0.55 confidence).

**Connector Creation:** Off-ball passing, DHO initiation, secondary creation that does not show up in traditional assist stats. Box-score mode: UNSCORED.

### POA Defense Cluster (7 traits)

Point-of-attack defense measures a player's ability to defend the ball-handler directly.

**Containment:** Preventing the offensive player from getting to their spots. Box-score mode: UNSCORED.

**Screen Navigation:** Getting through or around screens. Box-score mode: UNSCORED.

**Ball Pressure:** Active hands, disruption, forcing tough decisions. Box-score mode: UNSCORED.

**Closeout and Recovery:** Ability to close on shooters and recover to assignment. Box-score mode: UNSCORED.

**Deflections:** Tipping passes and disrupting passing lanes. Box-score mode: PROXY (0.45 confidence using steals as a weak signal).

**Steal Timing:** Converting deflections and loose balls into steals. Box-score mode: PROXY (0.40 confidence).

**Foul Discipline:** Avoiding unnecessary fouls while playing physical defense. Box-score mode: PROXY (0.80 confidence - PF/G is a direct measurement).

### Team Defense Cluster (7 traits)

Team defense measures how a player contributes to the defensive scheme beyond their individual matchup.

**Help and Rotation:** Rotating to help on drives and recovering. Box-score mode: UNSCORED.

**Rim Protection / Shot Blocking:** Protecting the rim through blocks, contests, and deterrence. Box-score mode: PROXY (0.75 for bigs, 0.40 for guards - blocks are a stronger signal for bigs).

**Closeout Execution:** Closing out on shooters in the help position. Box-score mode: UNSCORED.

**Off-Ball Positioning:** Denial, tagging, and positional awareness away from the ball. Box-score mode: UNSCORED.

**Communication and QB:** Directing defensive traffic, calling switches, organizing the defense. Box-score mode: UNSCORED.

**Versatility (Switch/Guard Up/Down):** Ability to defend multiple positions. Box-score mode: UNSCORED.

**Team Foul Discipline:** Avoiding fouls in team defensive contexts (help side, transition, dead ball). Box-score mode: UNSCORED.

### Rebounding Cluster (6 traits)

**Defensive Rebounding:** Securing missed opponent shots. Box-score mode: PROXY (0.85 confidence - direct measurement).

**Offensive Rebounding:** Creating second chances. Box-score mode: PROXY (0.80 confidence).

**Box-Out:** Positioning to secure boards. Box-score mode: UNSCORED.

**Rebound Range:** Ability to rebound outside the immediate area. Box-score mode: UNSCORED.

**Hands / Secure:** Catching and securing the ball cleanly. Box-score mode: UNSCORED.

**Second-Jump / Tip Ability:** Quick second effort on the glass. Box-score mode: UNSCORED.

### Tools Cluster (8 traits)

**Height:** Measured height. TRUE score at all data tiers.

**Length / Wingspan:** Measured wingspan. TRUE score when available.

**Strength:** Physical power. Box-score mode: PROXY (0.55 confidence - weight is fact but strength is not equal to weight).

**Speed:** Straight-line quickness. Box-score mode: UNSCORED.

**Lateral Quickness:** Side-to-side movement. Box-score mode: UNSCORED.

**Vertical Pop:** Jumping ability. Box-score mode: PROXY (0.55 for bigs using blocks as a signal, 0.35 for guards).

**Motor:** Effort and energy. Box-score mode: PROXY (0.50 confidence - stocks capture activity but miss hustle plays).

**Endurance:** Stamina across a game and season. Box-score mode: PROXY (0.35 confidence - MPG reflects coach decision as much as stamina).

### IQ Cluster (7 traits)

**Decision Speed:** How quickly a player processes and acts. Box-score mode: UNSCORED.

**Correct Read Rate:** Percentage of possessions where the player makes the right read. Box-score mode: UNSCORED.

**Shot Selection Quality:** Whether the player takes good shots. Box-score mode: UNSCORED.

**Turnover Decision Quality:** Quality of decisions that lead to or avoid turnovers. Box-score mode: UNSCORED.

**Advantage Conversion:** Ability to convert advantages into scoring. Box-score mode: UNSCORED.

**Role Discipline:** Staying within the role the team needs. Box-score mode: UNSCORED.

**Processing Under Pressure:** Decision-making in late-game, high-leverage situations. Box-score mode: UNSCORED.

At V1 (box score only), 16 traits are solidly scorable and 5 are weak proxies, leaving 31 traits NULL. This is why Phase 3 (production anchor) is the primary KR determinant at V1 - the trait math does not have enough data to drive the evaluation on its own.

---

## 6. Archetypes

Archetypes are descriptive labels that classify a player's basketball identity based on their trait profile. They do not change KR. They do not change traits or badges. They describe WHO a player is in basketball terms - what role they fill, what value they bring, and what systems they fit into.

The archetype library contains 26 archetypes organized into six categories.

### A) Engines and Connectors (7 archetypes)

**1. Pick-and-Roll Operator:** The PnR ball-handler. Requires Playmaking KR 80+, Advantage Creation 80+, Passing Vision 78+, Passing Execution 78+. The engine of modern basketball offenses.

**2. Primary Ball-Handler (Offense-First):** High-usage offensive engine. Requires Playmaking KR 82+, Advantage Creation 82+, Ball Security 75+, Passing Execution 75+. This is your star guard label.

**3. Secondary Creator Wing:** Creates offense as a second option. Requires Playmaking KR 78+, Advantage Creation 78+, 3PT Pull-Up 72+. Wings who can create their own shot.

**4. Connector Guard/Wing:** Decision-speed connector who keeps the offense flowing. Requires Playmaking KR 76+, Connector Creation 80+, Passing Execution 75+. The player who makes the extra pass.

**5. DHO/Handoff Hub:** Initiates through dribble handoffs and screen actions. Requires Playmaking KR 76+, Passing Execution 75+, Connector Creation 75+. Often a big who passes.

**6. Point Forward:** Wing or forward who initiates offense. Requires Playmaking KR 78+, Advantage Creation 75+, Passing Vision 75+, Passing Execution 75+, plus a height gate requiring wing/forward size.

**7. Situational Ball-Handler (Bench Guard):** Below "full engine" thresholds. Requires Playmaking KR 72+, Passing Execution 72+, Ball Security 70+. Bench-level creation.

### B) Shooting Archetypes (3 archetypes)

**8. Off-Ball Shooter (Movement):** Shoots on the move off screens. Requires Shooting KR 78+, 3PT Movement 80+. Non-box-score dependent.

**9. Spot-Up Specialist:** Stationary shooter. Requires Shooting KR 76+, 3PT Spot-Up 80+. Box-score scorable.

**10. Situational Shooter (Specialist):** Narrow-role sniper. Requires Shooting KR 74+, 3PT Spot-Up 84+ or 3PT Movement 82+. Optional negative gate: Advantage Creation 65 or below.

### C) Rim Pressure / Finishing Roles (2 archetypes)

**11. Slasher / Rim Pressure Wing:** Attacks the basket. Requires Finishing KR 78+, Rim Pressure 80+, Foul Draw 75+.

**12. Vertical Spacer (Rim Runner):** Finishes above the rim on lobs and rolls. Requires Finishing KR 78+, Vertical Finishing 82+, Rim Pressure 75+.

### D) Big Roles (6 archetypes)

**13. Stretch Big (Pick-and-Pop):** Shooting big who spaces the floor. Requires Shooting KR 74+, 3PT Spot-Up 78+, plus frontcourt height.

**14. Short-Roll Playmaker Big:** Creates from the short-roll position. Requires Playmaking KR 74+, Passing Execution 78+, Advantage Passing 75+.

**15. Post Hub / Facilitator Big:** Passes from the post. Requires Playmaking KR 76+, Passing Vision 78+, Passing Execution 78+.

**16. Post Scorer (Back-to-Basket):** Traditional low-post scoring. Requires Finishing KR 78+, Contact Finishing 80+, Touch/Craft 78+.

**17. Small-Ball Big (Switch 5):** Undersized big who switches onto guards. Requires Team Defense KR 78+, Versatility 80+, Closeout Execution 74+.

**18. Offensive Big (Defense Liability):** Scores but cannot defend. Requires an offensive Skill KR 76+ AND at least one defensive trait (Containment, Versatility, or Rim Protection) at 60 or below. One of the few archetypes with a negative defensive gate.

### E) Defensive Identity Archetypes (6 archetypes)

**19. POA Defender Guard:** On-ball defensive stopper. Requires POA Defense KR 80+, Containment 80+, Screen Navigation 78+, Ball Pressure 75+.

**20. Switchable Defender Wing:** Guards multiple positions. Requires Team Defense KR 80+, Versatility 80+, Closeout Execution 75+.

**21. Rim Protector Anchor:** Protects the rim. Requires Team Defense KR 82+, Rim Protection 82+, Help and Rotation 75+.

**22. Rebounding / Interior Enforcer:** Dominates the glass. Requires Rebounding KR 80+, Defensive Rebounding 80+, Box-Out 78+.

**23. Two-Way Wing:** Does everything on both ends. Requires Shooting KR 74+, Team Defense KR 76+, 3PT Spot-Up 75+, Versatility 75+. The broadest real-value wing archetype.

**24. 3-and-D Wing:** Shoots and defends. Requires Shooting KR 76+, Team Defense KR 76+, 3PT Spot-Up 80+, Versatility 72+. Narrower than Two-Way Wing.

### F) Development (1 archetype)

**25. Energy Bench Spark:** Chaos and tempo player. Requires Motor 80+, Endurance 75+. Intentionally disruptive, not polished.

**26. Developmental Prospect:** Tools flash, inconsistent production. No hard Skill KR floor. Requires at least two physical traits (Height, Length, Speed, Lateral Quickness, Vertical Pop) at 75+, plus at least one major offensive or defensive Skill KR below 72. This is the "raw tools" exception label.

### Archetype Assignment Rules

Primary archetype: player must meet all gates (Skill KR floor, primary trait gates, at least one support trait). Secondary archetype: same logic but the Skill KR floor is relaxed by 5 points. A player can have zero, one, or multiple archetypes. Archetypes are descriptive - they do not change KR.

---

## 7. Badges

Badges certify elite skill expression. They are earned when a player's Skill KR and specific trait scores exceed high thresholds. Badges provide a small KR lift because elite-level skills have disproportionate impact that the standard trait weighting does not fully capture.

### Badge Tier Gates

**College:**
- Bronze: Skill KR 90+ AND each required trait 90+ (lift: +0.5 KR)
- Silver: Skill KR 94+ AND each required trait 94+ (lift: +1.0 KR)
- Gold: Skill KR 97+ AND each required trait 97+ (lift: +1.5 KR)

**Pro:**
- Bronze: Skill KR 93+ AND each required trait 93+ (lift: +0.5 KR)
- Silver: Skill KR 96+ AND each required trait 96+ (lift: +1.0 KR)
- Gold: Skill KR 98+ AND each required trait 98+ (lift: +1.5 KR)

Total badge lift cap: +3.5 KR. Badges do not change trait scores, archetypes, or system fit.

### Badge Categories (34 total)

**Shooting Badges (5):** Spot-Up Sniper, Movement Shooter, Pull-Up Shotmaker, Limitless Range, Free Throw Bank.

**Finishing Badges (5):** Rim Pressure, Whistle, Fearless Finisher, Vertical Finisher, Touch Artist.

**Playmaking Badges (5):** Advantage Creator, Dimer, Needle Threader, Floor General, Ball Security.

**POA Defense Badges (5):** Clamps, Screen Navigator, Interceptor, Ball Hawk, Discipline.

**Team Defense Badges (5):** Anchor, Low-Man Rotator, Closeout Pro, Defensive QB, Switchable.

**Rebounding Badges (4):** Rebound Chaser, Boxout Beast, Offensive Glass, Strong Hands.

**IQ Badges (5):** Fast Processor, Elite Shot Selector, Low Mistake Rate, Advantage Converter, Role Discipline.

Each badge requires specific traits to be scored (non-null) in the active data layer. Many badges are unavailable at V1 (box score) because the required traits are UNSCORED.

---

## 8. Overrides

Overrides capture rare, real-world basketball realities that are not fully expressed by traits, archetypes, badges, or system risks. They are exceptions, not features. Overrides are applied after Base KR, Badges, System Fit, and System Risks. They are the final correction layer before Final KR lock.

### College Overrides (Positive Only - Max 1 Applies)

**1. True 7-Footer:** +2.0 to +5.0 KR (scaled by height). Trigger: Height 7'0" or above. 7'0"-7'0.75" gets +2.0. 7'1"-7'1.75" gets +3.0. 7'2"-7'2.75" gets +4.0. 7'3"+ gets +5.0. Height is so rare and impactful that it deserves its own override.

**2. Jumbo Initiator:** +1.0 KR. Trigger: Height 6'6"+, Usage 20%+, AST% 20%+, 50%+ possessions as primary initiator. A big player who also runs the offense is extremely valuable. Blocked by Turnover Risk (Major) or Decision-Making Collapse.

**3. Stretch 5:** +1.0 KR. Trigger: Height 6'9"+, 50%+ minutes at center, 3PA 7.0+ per 100, 3P% 33%+. A center who shoots threes changes floor spacing for everyone. Blocked by No Gravity (Major).

**4. Vertical Rim Threat:** +1.0 KR. Trigger: 20%+ of FGA are dunks/lobs, Rim FG% 65%+, 3.0+ lob/dunk attempts per 100.

**5. Connector Wing:** +1.0 KR. Trigger: Height 6'4"-6'8", Usage 16% or below, AST% 12%+, DREB% 10%+, On/Off Net Rating Swing +5 or better.

**6. Micro-5 (College-Only):** +1.0 KR. Trigger: Height under 6'8", 70%+ minutes at center, DREB% 15%+, 5+ rim contests per 100, team defensive rating improves on floor. Expires before pro.

**7. Small Bucket Getter (College-Only):** +0.75 KR. Trigger: Height 6'1" or shorter, Points 25+ per 100, Usage 22%+, TS% at or above league average.

**8. Undersized Defensive Guard (College-Only):** +0.75 KR. Trigger: Height 6'1" or shorter, Containment 75+, Screen Navigation at or above baseline.

### Pro Overrides

**Positive (Max 1, each +1.0 KR):** Jumbo Initiator (Pro), Stretch 5 (Pro), Switch Big (Pro), High-Movement Shooter (Pro).

**Negative (Always Apply, Cannot Be Overridden):**

**No Gravity:** -1.0 KR. Trigger: ALL four gravity types (perimeter, rim, short-roll, post) must be zero. This means the player commands zero defensive attention from any channel. Suppressed when Range Gap system risk is active (anti-stacking).

**Rim Pressure Limitation:** -1.0 KR. Trigger: Rim attempts materially below positional baseline with no foul draw or collapse effect.

**Switch Liability:** -1.0 KR. Trigger: Switch PPP 1.05+ with required switch volume.

**Tweener (No Positional Home):** -1.5 KR. Trigger: Guard skills in wing body, undersized big with no switch value, or wing who cannot defend wings or space the floor.

---

## 9. System Risks

System risks identify specific weaknesses that break or limit how a system functions at the team level. They capture damage that individual trait scores alone do not - spacing collapse, scheme incompatibility, possession-level contagion, and role inflexibility.

System risks are NOT general player weaknesses. If a weakness is already proportionally punished by low trait scores through position weighting, it is not a system risk. System risks exist only where the team-level damage exceeds what the individual KR penalty captures.

### Severity Levels

| Severity | College Penalty | Pro Penalty |
|---|---|---|
| Tier 1 Major (Scheme-Breaking) | -2.0 | -4.0 |
| Tier 2 Major (Scheme-Limiting) | -1.5 (or position-scaled) | -2.5 (or position-scaled) |
| Minor | -1.0 | -1.0 |

### Tier 1 Major System Risks (5 total)

**1. Turnover Risk (Major):** Trigger: TOV% 20%+ OR turnovers 6.0+ per 100 touches. Possessions hemorrhage at a rate that corrupts team rhythm.

**2. Defensive Target:** Trigger: Opponent PPP vs player 1.10+ OR targeted on 20%+ of halfcourt actions. Opponents will hunt this player every possession.

**3. Switch Liability:** Trigger: Versatility trait below 60 AND Lateral Quickness trait below positional baseline. The defensive scheme literally cannot function.

**4. Foul Machine:** Trigger: Foul Discipline trait below 60 (POA) AND Team Foul Discipline trait below 60 OR fouls 5.5+ per 100 possessions. The team enters the bonus early.

**5. Role Collapse:** Trigger: Usage change of 15%+ causes efficiency drop of 15%+ OR rotation role change causes Net Rating of -8.0 or worse.

### Tier 2 Major System Risks (4 total)

**6. Range Gap (Position-Scaled):** Trigger: 3PT Spot-Up trait below 60 AND 3PA below 3.0 per 100 possessions.

College penalties by position: PG -2.0, SG -2.0, SF -1.5, PF -1.5, C -1.0. The penalty is higher for guards because perimeter players who cannot shoot collapse spacing for the entire offense.

Pro penalties are higher: PG -3.0, SG -3.0, SF -2.5, PF -2.0, C -1.5.

Anti-stacking: If Range Gap is active, it suppresses No Gravity for the same player.

**7. No Gravity:** Trigger: ALL four gravity types (perimeter, rim, short-roll, post) must be zero. College penalty: -1.5 flat.

**8. Severe Undersize:** Trigger: Height or Length trait 4+ inches below positional average. College penalty: -1.5.

**9. System Locked (Severe):** Trigger: Positive Net Rating in only 1 system type AND Net Rating swing of -6.0 or worse outside that system. College penalty: -1.5.

### Minor System Risks (5 total, -1.0 at both college and pro)

**10. Limited Range:** 3PT Spot-Up 60-69 AND 3PA 3.0-4.5 per 100.

**11. Low Shooting Volume:** Total 3PA below 4.0 per 100 OR wide-open threes declined 25%+.

**12. Elevated Turnover Risk:** TOV% 17-19% OR turnovers 4.5-5.9 per 100.

**13. Partial System Lock:** Positive Net Rating in 2 or fewer systems AND Net Rating variance 6.0+.

**14. Role Fragility:** Usage change of 15%+ causes efficiency drop of 10-14%.

### Suppression Adjustment Protocol

When a system risk trigger is met but evidence demonstrates the production is context-suppressed rather than skill-representative, the system risk can be flagged as "Suppression-Adjusted" and the penalty reduced or removed. This requires Tier 3 evidence (coach intel, scouting confirmation, or demonstrated production in different contexts).

---

## 10. Position Intelligence (OPF)

The Overall Position Framework (OPF) determines how the four component KRs combine into the final KR. Every position has different weights because basketball demands different things from different positions.

### Why Weights Differ by Position

A point guard's primary job is running the offense - creating shots for himself and his teammates, handling the ball under pressure, and making decisions. That is why PG OKR weight is 56% at college. A center's primary job is protecting the rim, rebounding, and providing physical presence. That is why C DKR weight is 44% at college.

The weights are not arbitrary. They reflect how basketball actually works: what a coach needs most from each position, and what produces the most team-level impact from that position.

### Why Pro Weights Differ from College

At the professional level, several shifts occur:

- **Tools weight decreases** for every position. At the pro level, almost everyone is athletic. Physical tools are table stakes, not differentiators. PG TKR drops from 10% to 5%. PF TKR drops from 18% to 10%.

- **IQ weight increases.** Against elite NBA competition, the players who make the right decisions consistently are the ones who last. PG IQKR rises from 6% to 9%. PF IQKR rises from 2% to 4%.

- **Defense weight increases for bigs.** Rim protection is more critical in the NBA because driving lanes are more lethal. C DKR rises from 44% to 48%. PF DKR rises from 36% to 40%.

### Trait Weight Distributions Within Component KRs

Within each component KR, individual traits are weighted differently by position. For example, within OKR:

- PG Playmaking weight: 44% (playmaking is the PG's primary offensive job)
- SG Shooting weight: 44% (shooting is the SG's primary offensive contribution)
- SF Shooting weight: 40% (wings need to shoot but also create)
- PF Finishing weight: 44% (power forwards finish at the rim)
- C Finishing weight: 60% (centers are primarily rim finishers)

Within DKR:
- PG POA Defense: 60% (guards defend the ball)
- C Team Defense: 55% (centers protect the rim and help)

These distributions ensure that a player's KR accurately reflects how their skills translate to on-court impact at their specific position.

### Impact Modifiers

Impact Modifiers classify the MODE by which a player produces impact. They do not alter KR - they describe how impact is produced. Every player receives exactly one modifier.

**Primary Engine:** The team's primary offensive creator. Requires Usage 28%+, AST/G 3.0+, 200+ minutes played. This is the player the offense runs through.

**Secondary Engine:** The second option. Requires Usage 20-27%, AST/G 2.5+. Creates offense but is not the primary generator.

**Force Multiplier:** A player whose impact is disproportionate to their usage. High On/Off net rating despite moderate or low usage. Makes everyone around them better.

**Specialist Anchor:** Dominant impact in one specific area (defense, rebounding, shooting). Low usage but high impact in their specialty.

**Unclassified:** Does not clearly fit any category, or insufficient minutes (below 200) to classify.

Impact Modifiers are useful for roster construction: a team needs 1 Primary Engine, 1-2 Secondary Engines, 1-2 Force Multipliers, and 1-2 Specialist Anchors to be complete. Having 3 Primary Engines and no Specialist Anchors is a roster construction problem regardless of aggregate KR.

### How OPF Differs from College to Pro - Complete Table

The full OPF differences between college and pro reflect the evolution of what matters at higher competition:

| Position | College OKR | Pro OKR | College DKR | Pro DKR | College TKR | Pro TKR | College IQKR | Pro IQKR |
|---|---|---|---|---|---|---|---|---|
| PG | 56% | 58% | 28% | 28% | 10% | 5% | 6% | 9% |
| SG | 58% | 60% | 26% | 28% | 12% | 6% | 4% | 6% |
| SF | 52% | 54% | 30% | 32% | 14% | 7% | 4% | 7% |
| PF | 44% | 46% | 36% | 40% | 18% | 10% | 2% | 4% |
| C | 34% | 36% | 44% | 48% | 20% | 12% | 2% | 4% |

The pattern is consistent across all positions: offense weight increases slightly (pros can exploit offensive advantages more), defense weight increases for bigs (rim protection is more critical against NBA offenses), tools weight drops substantially (physical tools are table stakes at the pro level), and IQ weight increases (decision-making separates against elite competition).

---

## 10A. System Demand Profiles - Offensive

Each offensive system has a formal demand profile listing the archetypes it needs at three priority levels. These profiles drive System Fit computation, Coverage Map diagnostics, and roster construction recommendations.

**1. Spread Pick-and-Roll**
- A (Critical): Pick-and-Roll Operator, Vertical Spacer (Rim Runner), Spot-Up Specialist (2+ needed)
- B (High): Stretch Big, 3-and-D Wing
- C (Optional): Secondary Creator Wing, Slasher/Rim Pressure Wing
- Critical-missing risk: No PnR operator equals no offense engine. No floor spacing equals packed paint, PnR is neutralized.

**2. 5-Out Motion**
- A (Critical): Connector Guard/Wing (2+), Stretch Big, Off-Ball Shooter (Movement)
- B (High): Two-Way Wing, Secondary Creator Wing
- C (Optional): Point Forward, DHO/Handoff Hub
- Critical-missing risk: No connectors equals motion stalls into isolations. No stretch big equals paint congestion kills cutting lanes.

**3. Motion / Read and React**
- A (Critical): Connector Guard/Wing (2+), Pick-and-Roll Operator, 3-and-D Wing
- B (High): Point Forward, Short-Roll Playmaker Big
- C (Optional): Stretch Big, Off-Ball Shooter
- Critical-missing risk: No decision-speed connectors equals reads are wrong; motion becomes chaos.

**4. Pace and Space**
- A (Critical): Primary Ball-Handler, Spot-Up Specialist (2+), Vertical Spacer
- B (High): Slasher/Rim Pressure Wing, Stretch Big
- C (Optional): Secondary Creator Wing, Energy Bench Spark
- Critical-missing risk: No transition finishers equals pace advantage dies in halfcourt. No spacing equals halfcourt offense is stagnant.

**5. Dribble Drive**
- A (Critical): Primary Ball-Handler, Spot-Up Specialist (3+), Slasher/Rim Pressure Wing
- B (High): Stretch Big, 3-and-D Wing
- C (Optional): Secondary Creator Wing, Connector Guard
- Critical-missing risk: No shooters equals pack the paint; drives become turnovers. Three spotters are critical.

**6. Princeton**
- A (Critical): Post Hub/Facilitator Big, Connector Guard/Wing, Off-Ball Shooter
- B (High): Point Forward, Stretch Big
- C (Optional): Secondary Creator Wing, Two-Way Wing
- Critical-missing risk: No post hub equals no fulcrum; backdoors have no starting point.

**7. Flex**
- A (Critical): Spot-Up Specialist (2+), Rebounding/Interior Enforcer, Connector Guard/Wing
- B (High): Off-Ball Shooter (Movement), Slasher/Rim Pressure Wing
- C (Optional): Secondary Creator Wing, Stretch Big
- Critical-missing risk: No post threat/hub equals flex actions do not force help; you get contested jumpers.

**8. Swing**
- A (Critical): Connector Guard/Wing, Spot-Up Specialist (2+), Secondary Creator Wing
- B (High): Two-Way Wing, Stretch Big
- C (Optional): Slasher/Rim Pressure Wing, DHO/Handoff Hub
- Critical-missing risk: No secondary creator equals ball reversals forever, cannot break set defense.

**9. Inside-Out (Post-Centric)**
- A (Critical): Post Scorer OR Post Hub/Facilitator Big, Spot-Up Specialist (2+), 3-and-D Wing
- B (High): Slasher/Rim Pressure Wing, Rebounding/Interior Enforcer
- C (Optional): Secondary Creator Wing, Stretch Big
- Critical-missing risk: No shooting around post equals doubles win; post touches become turnovers.

**10. Moreyball**
- A (Critical): Pick-and-Roll Operator, Vertical Spacer, Spot-Up Specialist (2+), 3-and-D Wing
- B (High): Slasher/Rim Pressure Wing, Stretch Big
- C (Optional): Off-Ball Shooter, Secondary Creator Wing
- Critical-missing risk: No volume shooters equals the entire philosophy fails. Need minimum 3 players willing to shoot 5+ threes per game.

**11. Heliocentric**
- A (Critical): Primary Ball-Handler (the star), Spot-Up Specialist (3+), Vertical Spacer
- B (High): 3-and-D Wing, Stretch Big
- C (Optional): Connector Guard, Two-Way Wing
- Critical-missing risk: Without the heliocentric star, there is no offense. Literally zero engine. This system has the highest single-point-failure risk of any system.

**12. Coach K**
- Demand profile varies by the specific system the coach selects for each game/opponent. The demands are whatever the chosen system requires.

---

## 11. BPR - Basketball Performance Rating

BPR (Basketball Performance Rating) measures actual on-court impact relative to competition level. It answers one question: when this player was on the floor, how much better or worse was the team because of them, relative to the expected average at that level?

BPR is zero-centered (+0 = average impact), level-normalized (+5 at D1 HM means the same percentile impact as +5 at CCCAA), and deterministic. It is computed by the system and never manually edited.

### How BPR is Computed

BPR v2 is computed in six stages:

**Stage 1: Position-Adjusted Base Production.** Scale all counting stats to per-100 possessions, then apply position-adjusted coefficients. Assists from a center are more valuable (rarer) than assists from a PG. Blocks from a PG are more valuable than blocks from a center. The position adjustment rewards above-expectation production.

**Stage 2: Efficiency-Volume Interaction.** High usage demands high efficiency. A player with 38.9% usage and .490 TS% gets penalized (inefficient volume). A player with 17.7% usage and .560 TS% gets rewarded (efficient role production). A player with 33.7% usage and .640 TS% gets a large reward (efficient volume).

**Stage 3: Role Context Multiplier.** Defensive anchors (1.15x), efficient role players (1.10x), specialist shooters (1.10x) get credit for specialist impact. Volume scorers with low efficiency get a slight discount (0.95x).

**Stage 4: Supporting Cast Adjustment.** Players on weak rosters carry disproportionate loads. A player carrying a thin team gets suppression credit (up to +1.0) acknowledging that their efficiency and turnovers are inflated by defensive attention and lack of secondary options.

**Stage 5: Per-Minute Scaling.** Players in limited minutes often have inflated per-100 numbers. A credibility factor scales from 1.00 (30+ MPG) down to 0.55 (below 5 MPG).

**Stage 6: Level Normalization.** Raw BPR is divided by a level-specific normalization divisor so that +5 means the same percentile impact at every level. Final BPR is clamped to [-10, +10].

### BPR Interpretation Bands

| BPR Range | Interpretation |
|---|---|
| +8 to +10 | Generational impact. Best player at the level. |
| +5 to +7.9 | Elite impact. Clear winning driver. All-Conference/All-American. |
| +3 to +4.9 | Strong positive contributor. Starter on winning teams. |
| +1 to +2.9 | Above-average impact. Solid rotation player. |
| -1 to +0.9 | Average. Neutral impact. |
| -3 to -0.9 | Below average. Mild liability in expanded role. |
| -5 to -2.9 | Negative impact. Bench depth or developmental. |
| Below -5 | Severe negative. Below competitive viability at the level. |

### BPR-KR Cross-Reference

BPR is an impact anchor that sanity-checks KR. KR tells the story. BPR keeps it honest.

- High KR + High BPR: True high-level player. Identity matches impact.
- High KR + Low BPR: Skill present, impact not translating. Investigate system fit or suppression.
- Low KR + High BPR: Role player outperforming profile. Flag for re-evaluation.
- Low KR + Low BPR: Replacement-level or developmental. Rating is accurate.

---

## 12. TPQ - Team Performance Quality

TPQ (Team Performance Quality) measures single-game team performance quality relative to expectation and environment. It answers: given the opponent's strength and the game context, how well did this team actually play?

TPQ is a game-only signal on a 0-10 scale where 5.0 is neutral (performed as expected). It is computed postgame when the box score is finalized.

### Four Components

**Component 1: Result vs Expectation (RVE) - 40% weight.** Calculate expected point margin from Team KR difference plus home/away adjustment. Each point above or below expectation shifts RVE by 0.20. A win bonus of +0.5 and a loss penalty of -0.3 are applied because winning matters beyond margin.

**Component 2: Efficiency Margin (EFF) - 30% weight.** Measures net points per possession advantage. Each 0.10 net PPP advantage shifts EFF by 0.5 points.

**Component 3: Control Factors (CTRL) - 20% weight.** The Four Factors of basketball: effective field goal percentage margin (35%), turnover rate margin (25%), offensive rebound margin (20%), and free throw rate margin (20%).

**Component 4: Context Stakes (CTX) - 10% weight.** Game type multiplier (postseason games weighted higher) and opponent quality multiplier.

### TPQ Interpretation

| TPQ Range | Interpretation |
|---|---|
| 9.0-10.0 | Dominant. Championship-level performance. |
| 8.0-8.9 | Elite. Significantly exceeded expectations. |
| 7.0-7.9 | Strong. Clear overperformance. |
| 6.0-6.9 | Solid. Slightly above expected. |
| 5.0-5.9 | Neutral. Performed as expected. |
| 4.0-4.9 | Below standard. Underperformed. |
| 3.0-3.9 | Poor. Significant underperformance. |
| 0.0-2.9 | Collapse. Severe underperformance. |

TPQ tells you how the team played. BPR tells you who drove it. In the postgame flow, TPQ gives the headline ("We played a 7.2 tonight against a strong opponent") and player game BPR values explain why.

---

# PART 2: LEVELS AND CROSS-LEVEL INTELLIGENCE

---

## 13. The Legend System

Legends are lookup tables that translate KR values into tier labels describing what that number means at a specific competitive level. Every competitive level has its own legend. Legends are display-only - they do not produce or modify KR values. They interpret them.

### How Legends Work

Each legend file contains 10-12 tiers, each defined by a KR range and a detailed description of what a player at that tier looks like in terms of role, production, and impact. When evaluating a player, you read the legend at their home level to find the tier whose description matches the player's actual production and role. That tier's KR range becomes the Phase 3 anchor.

For example, the D1 HM legend's 95-97 tier reads: "Team's unquestioned alpha or co-alpha. Primary closer. All-American or Conference POY contender. Carries offensive OR defensive load nightly. 30+ MPG on a team that wins 25+ games or earns a top-4 seed."

If a player matches this description, their Phase 3 anchor is 95-97. The description includes role language, statistical anchors, and outcome markers.

### How Legends Were Calibrated

The legend system was calibrated with 152+ real players across 7 teams:

- Kansas 2025-26 (D1 HM): 8 players, KR spread 93-75
- Florida 2025-26 (D1 HM): 8 players, KR spread 93-80
- Kentucky 2025-26 (D1 HM): 8 players, KR spread 91-80
- Michigan 2025-26 (D1 HM): 8 players, KR spread 96-81
- Arizona 2025-26 (D1 HM): 8 players, KR spread 94-81
- Arkansas 2025-26 (D1 HM): 8 players, KR spread 96-81
- Memphis 2025-26 (D1 MM): 8 players, KR spread 85-77

All rosters showed correct hierarchy (best player rated highest), clean tier breaks (no player straddling two tiers incorrectly), and legend labels matching observed reality. KR stacks correlate with team success across all 7 teams. Zero rank inversions.

### v4 Legend Changes (Applied to All Levels)

1. All draft/pro projection language removed. College KR is present-tense only.
2. BPR ranges removed from all tiers. Metrics are the pipeline's job, not the legend's.
3. 86-88 tier renamed from "Glue Guy" to "High-Minute Role Player" to cover facilitators.
4. 92-94 tier rewritten to accommodate spike AND complete profiles.
5. Calibration examples from the 152-player study added where data exists.

---

## 14. Every Competitive Level Described

The KaNeXT intelligence system covers 14 college competitive levels, each with its own legend, lambda value, and physical profile norms.

### NCAA Division I - High-Major (lambda 1.000)

The reference level. Power 5 conferences (ACC, Big Ten, Big 12, SEC, Big East). National recruiting depth. Deep rosters with heavy Top-100 opponent loads. This is where the best college basketball happens. KR 98-100 here means National Player of the Year. KR 83-85 means a reliable bench player on a ranked team.

### NCAA Division I - Mid-Major (lambda 0.958)

High-end mid-major conferences: American (AAC), Atlantic 10, Mountain West, WCC, Missouri Valley. Regional plus selective national recruiting. Fewer elite athletes than HM, thinner roster redundancy, heavier reliance on top 1-2 players. At-large NCAA Tournament access exists but is fragile. KR 93-95 here means Deep Tournament Threat that can beat HM teams.

### NCAA Division I - Low-Major (lambda 0.917)

All other D1 conferences not in HM or MM, including Sun Belt, Conference USA, and similar. More limited recruiting reach. Auto-bids dominate postseason paths. Games are frequently decided by one or two individual talents rather than roster depth.

### NCAA Division II (lambda 0.875)

Scholarship basketball with strong regional identities. Smaller budgets than D1 but legitimate competitive depth. Physical profile averages are slightly below D1 but the gap is smaller than people think. KR 86-100 at D2 represents national-level NAIA/D2 force.

### NCAA Division III (lambda 0.667)

No scholarships. Academic-athletic balance is primary. Talent depth drops significantly from D2. Games are won through coaching, system execution, and player development more than raw talent. Physical profiles average 2-3 inches shorter and 20-30 lbs lighter than D1 HM at each position.

### NAIA (lambda 0.810)

Cascade, Heart, SSAC, Sun Conference, GPAC, Crossroads, Cal Pac, and other conferences. Scholarship availability with academic-athletic balance. Many players develop here with intent to transfer upward to D1 or D2. Depth is solid at the top but drops quickly beyond 6-7 contributors per team.

### NJCAA Division I (lambda 0.833)

The premier junior college level. Strong D1 transfer pipeline. Players here are often D1 talents who needed academic qualification time or wanted to improve before transferring up. Competitive quality can approach D1 Low-Major in the best conferences.

### NJCAA Division II (lambda 0.750)

Smaller programs, more regional competition. Talent pipeline exists to D2 and NAIA primarily. Less visibility than NJCAA D1.

### NJCAA Division III (lambda 0.625)

No scholarships at the JUCO level. Academic-focused institutions. Talent floor is lower but developmental opportunities exist for late bloomers.

### CCCAA (lambda 0.765)

California Community College Athletic Association. Unique system - California's community colleges operate their own athletic governance. Competitive quality sits between NJCAA D1 and D2 for basketball. Strong pipeline to California D1 programs.

### USCAA (lambda 0.583)

United States Collegiate Athletic Association. Small colleges, often with enrollments under 1,000 students. Limited budgets and recruiting reach. Competition quality is lower, but individual talents can emerge who are significantly better than their level.

### NCCAA Division I (lambda 0.542)

National Christian College Athletic Association. Faith-based institutions. Competition quality varies widely. Some programs field competitive teams that play D1 opponents; others are closer to club level.

### NCCAA Division II (lambda 0.500)

The lowest competitive level in the formal college basketball hierarchy. Smallest schools, most limited resources. KR evaluations at this level require the most context because the supporting cast quality creates the most suppression.

### HS/Prep/Postgrad (lambda 0.450)

High school, prep school, and postgraduate year competition. Not a formal college level but included in the KLVN ladder for multi-level players who compete across amateur levels before college enrollment.

---

## 15. KLVN Lambda Normalization

KLVN exists to ensure player performance is comparable across competitive environments and to prevent level/pace/sample-size effects from distorting evaluation. It is fully deterministic: identical inputs must produce identical outputs.

### The Lambda Table

| Rank | Level | Lambda |
|---|---|---|
| 1 | NCAA D1 High-Major | 1.000 |
| 2 | NCAA D1 Mid-Major | 0.958 |
| 3 | NCAA D1 Low-Major | 0.917 |
| 4 | NCAA D2 | 0.875 |
| 5 | NJCAA D1 | 0.833 |
| 6 | NAIA | 0.810 |
| 7 | CCCAA | 0.765 |
| 8 | NJCAA D2 | 0.750 |
| 9 | NCAA D3 | 0.667 |
| 10 | NJCAA D3 | 0.625 |
| 11 | USCAA | 0.583 |
| 12 | NCCAA D1 | 0.542 |
| 13 | NCCAA D2 | 0.500 |
| 14 | HS/Prep/Postgrad | 0.450 |

Higher lambda = higher competition density (harder environment). D1 High-Major is the reference point at 1.000.

### How Lambda Works (Correctly)

During evaluation, lambda adjusts raw production stats before trait scoring so that 20 PPG at NAIA is not treated the same as 20 PPG at D1 HM. The competition, athleticism, defensive quality, and pace are all different. Lambda accounts for this.

During legend interpretation, the player's KR is read against EACH level's legend to show what that number means at every level. This is the Level Tier Map.

### How Lambda Does NOT Work

- Do NOT multiply a player's KR by lambda to create a "translated" KR at another level.
- Do NOT report separate KR numbers for different levels ("85 MM / 81 HM").
- The KR is computed once, at the player's home level, using lambda-normalized inputs. That number is final and universal.

### D1 Major Class Mapping

Because NCAA D1 is split into High-Major, Mid-Major, and Low-Major, the system needs a deterministic way to classify D1 conferences:

- **High-Major:** ACC, Big Ten, Big 12, SEC, Big East
- **Mid-Major:** American (AAC), Atlantic 10 (A-10), Mountain West (MWC), West Coast (WCC), Missouri Valley (MVC)
- **Low-Major:** All other D1 conferences

This mapping is season-scoped because conference realignment changes over time.

---

## 16. Level Tier Map

The Level Tier Map is one of the most valuable outputs of the intelligence system. It shows what a player's KR means at every relevant competitive level. One player, one KR, multiple interpretations.

### How to Read It

A player with KR 85 would have a Level Tier Map like:

- At D1 High-Major: Reliable Bench / Rotation Contributor
- At D1 Mid-Major: Solid Starter / Top-Five Rotation Lock
- At D1 Low-Major: High-Impact Starter / Core Winner
- At NCAA D2: High-Impact Starter / Core Winner
- At NAIA: Franchise Anchor / Top All-American
- At NJCAA D1: Franchise Anchor
- At NJCAA D2: Elite National Standout
- At CCCAA: Elite / National Standout
- At NCAA D3: National-Level Force

### Why It Matters for Recruiting

The Level Tier Map answers the most common question in basketball recruiting: "Is this player good enough for our program?" A recruiting coordinator at a D1 Mid-Major can instantly see that a player with KR 85 would be a starter in their program. A D1 High-Major coach can see the same player would be a bench contributor. The NAIA program can see the player would be their franchise anchor.

This eliminates the guesswork of cross-level scouting. A coach no longer needs to guess whether a JUCO player would start at their D2 program. The Level Tier Map reads the player's KR against both legends and gives the answer.

### Level Tier Map in Practice

The founding test case for the Level Tier Map was Laolu Kalejaiye, a multi-level player competing across D1, NAIA, USCAA, and NCCAA levels in a single season. His Level Tier Map showed KR 86 reading as a rotation contributor at D1 HM, a quality starter at D1 MM, a high-impact starter at D2, and a dominant force at NAIA and below. This single output replaced pages of scouting notes and gave every recruiting coordinator in the country an instant read on where this player fits.

---

# PART 3: TEAM INTELLIGENCE

---

## 17. Team KR

Team KR is the rotation-weighted aggregation of individual player Final System KRs. It represents the total basketball quality of a team's competitive roster under their selected systems. Team KR does not evaluate players - it consumes finalized player outputs from the player evaluation pipeline.

### How Team KR is Computed

The computation follows a 13-step pipeline:

1. **Coach Context Setup** - lock program, level, offensive and defensive systems.
2. **Roster Player Outputs Loaded** - load each player's Final System Off KR and Def KR.
3. **Participation Threshold** - include only players with 5%+ of total minutes.
4. **Offensive Weights Built** - combine Usage% (50%), Minutes% (25%), and System Role (25%) for each player. When usage data is unavailable, minutes takes a larger share.
5. **Defensive Weights Built** - combine Minutes% (50-60%), System Role (40%), and Matchup Importance (10% when tracking data exists).
6. **Coverage Modifier Applied** - bench players who fill uncovered system demands get weight bonuses (+0.10 for uncovered A-tier demands). Redundant bench players get a slight penalty (-0.03).
7. **Physical Environment Modifier Applied** - adjusts weights based on how much a player's size amplifies their impact at this specific level. A 7'1" 275 lb center has more physical impact at NAIA (where the average center is 6'7" 225) than at D1 HM (where the average center is 6'10" 245). This modifier adjusts WEIGHTS only, never Player KR.
8. **Re-normalize all weights** to sum to 1.0 on each side.
9. **Team Offense KR** = weighted sum of all players' System Off KRs.
10. **Team Defense KR** = weighted sum of all players' System Def KRs.
11. **Overall Team KR** = (Team Off KR x Off%) + (Team Def KR x Def%).

The offense/defense split varies by level:

| Level | Off% | Def% |
|---|---|---|
| D1 High-Major | 55% | 45% |
| D1 Mid-Major | 52% | 48% |
| D1 Low-Major | 48% | 52% |
| NCAA D2 | 47% | 53% |
| NAIA | 49% | 51% |

At higher levels, offensive talent separates teams. At lower levels, defense, structure, and rebounding become the primary differentiators.

12. **Diagnostics** - System Fit%, Coverage Map, Missing Demands, Fragility Flags.
13. **Level Interpretation** - translate to tier label from Team KR Legend.

### Team KR Tier Labels (D1 HM Reference)

- 96-100: National Title Favorite. Controls games on both ends. Redundant creators and stoppers.
- 93-95: Final Four-Capable. Top-2 seed profile. Multiple high-level creators.
- 90-92: Tournament Lock (Top-4 Seed Range). Strong resume. Multiple reliable options.
- 88-89: Tournament Team (5-8 Seed). One clear anchor. Matchup-sensitive.
- 85-87: Bubble Team / ~.500. High volatility. One fatal flaw.
- 82-84: Likely Losing Record. Upset wins possible but inconsistent.
- 78-81: Clear Losing Record. No tournament path.
- Below 78: Non-Competitive.

### Team KR Tier Labels (D1 MM Reference)

- 96-100: National Title Outlier (extremely rare at MM). One of the best non-HM teams of the decade. Can beat HM teams consistently on neutral floors.
- 93-95: Deep Tournament Threat. Top 10-15 nationally. High-major upset expected, not shocking. Sweet 16 ceiling.
- 90-92: Tournament Lock (At-Large Profile). Clear at-large team. Regular-season conference champion likely.
- 88-89: Conference Tournament Contender (Auto-Bid Range). Needs the auto-bid. Could steal a game in the NCAA Tournament.
- 85-87: Upper Conference. Above .500 in conference. Competitive but not dominant.
- 82-84: Mid-Conference. .500 range. Some competitive nights, some clear losses.
- 78-81: Lower Conference. Below .500. Limited competitive path.
- Below 78: Non-Competitive at MM level.

### Team KR Tier Labels (D1 LM Reference)

- 93-100: Conference Dominant / NCAA Tournament Caliber. Can compete with MM and some HM teams.
- 90-92: Conference Favorite. Expected to win the conference and get the auto-bid.
- 87-89: Tournament Contender. In the mix for the conference tournament title and auto-bid.
- 84-86: Upper Conference. Competitive record. Postseason threat.
- 80-83: Mid-Conference. Functional but not a title contender.
- 77-79: Lower Conference. Below .500.
- Below 77: Non-Competitive at LM level.

### Team KR Tier Labels (NCAA D2 Reference)

- 90-100: Elite Eight / National Title Contender. Top program in the country.
- 87-89: Regional Powerhouse. Deep tournament run expected.
- 84-86: Conference Champion Caliber. Strong regular season, tournament contender.
- 80-83: Competitive Conference Team. Above .500, postseason hopeful.
- 76-79: Mid-Conference. Average team at the level.
- Below 76: Below competitive standard at D2.

### Team KR Tier Labels (NAIA Reference)

- 88-100: National Tournament Contender. Top 20-30 programs nationally.
- 84-87: Conference Champion Caliber. Dominant within conference.
- 80-83: Competitive Conference Team. Strong record, postseason contender.
- 76-79: Mid-Conference. Average NAIA team.
- 72-75: Lower Conference.
- Below 72: Below competitive standard at NAIA.

---

## 18. Offensive System Identification (OSIE)

OSIE determines which of the 12 defined offensive systems a team runs. This is critical because system identity drives all downstream analysis - system fit, demand profiles, interaction tables, and scouting reports.

### The 12 Offensive Systems

**1. Spread Pick-and-Roll:** The most common modern offense. Ball-handler creates advantages off ball screens. Critical demands: elite PnR operator and roll man. High demands: floor-spacing shooters and a rim-running center. The PnR handler controls the offense's ceiling. If you do not have an elite PnR handler, this system cannot reach its potential. Examples: most NBA teams run some form of Spread PnR. College programs like Kentucky under Calipari historically ran PnR-heavy offenses.

**2. 5-Out Motion:** Five perimeter players, constant cutting, screening, and ball movement. Critical demands: high-IQ connectors at every position, a stretch big who can shoot from the perimeter. This system requires the highest collective basketball IQ of any offense because all five players must read and react simultaneously. No single player carries the offense - it is distributed creation. Examples: the Boston Celtics under Mazzulla. College programs like Wisconsin and Butler historically.

**3. Motion / Read and React:** Continuous ball and player movement based on reads. Players make decisions based on how the defense reacts rather than following set plays. Critical demands: decision-speed connectors who process quickly, players who can read the defense in real time. More structured than 5-Out but more free-flowing than Spread PnR. Examples: Virginia under Bennett, many European-influenced coaches.

**4. Pace and Space:** Push the pace, space the floor, attack before the defense sets. Critical demands: athletes who can run the floor, shooters who can catch and shoot in transition. This system prioritizes speed of decision-making over complexity of action. Get up the court fast, get a good shot quickly. Examples: many rebuilding NBA teams, college programs like Memphis historically.

**5. Dribble Drive:** Penetration-first offense. Drive gaps, kick to shooters, attack closeouts. Critical demands: rim pressure guards who can collapse defenses, floor-spacing shooters on the perimeter. The driver needs to draw two defenders so the kick-out creates an open shot. If the shooters cannot knock them down, the system breaks. Examples: Memphis under John Calipari's early years, modern derivative systems.

**6. Princeton:** Backdoor cuts, misdirection, patient ball movement. Critical demands: high-IQ passers, disciplined cutters, and a post hub who can facilitate. Slower pace, methodical execution. The "beautiful game" of college basketball. Punishes defenses that overplay and take away the obvious action. Examples: Princeton University (namesake), Georgetown historically, Air Force.

**7. Flex:** Down-screen and cross-screen actions creating layups off cuts. Structured, repetitive, player-interchangeable. Critical demands: disciplined screeners and cutters. The system is designed to work regardless of individual talent because the actions are repeatable and do not depend on one player creating. Examples: common at mid-major and lower D1 levels where structured execution compensates for talent gaps.

**8. Swing:** Wing-initiated offense with ball reversals and baseline actions. Critical demands: versatile wings who can catch, face up, drive, and pass. The offense flows through the wings rather than the point guard. Examples: some European-influenced college programs.

**9. Post-Centric / Inside-Out:** Start in the post, work from the inside. Critical demands: a dominant post player and shooters who can space around them. The post player is the fulcrum - everything starts with the entry pass. If the post player cannot finish or pass out of doubles, the system stalls. Examples: Kansas under Bill Self with Hunter Dickinson, Purdue with Zach Edey.

**10. Moreyball:** Analytics-driven shot selection - threes and layups only, no midrange. Critical demands: high-volume three-point shooters and rim attackers who can get to the basket. The philosophy eliminates midrange shots (the least efficient shot in basketball) in favor of threes and layups (the most efficient). Examples: Houston Rockets under D'Antoni (namesake inspiration), modern analytics-heavy programs.

**11. Heliocentric:** Offense revolves entirely around one player. That player handles, creates, and dictates everything. The team's job is to space around the star and convert the opportunities the star creates. Critical demand: a transcendent talent who can sustain 30%+ usage with elite efficiency. Without that player, the system has no engine. Examples: Luka Doncic in Dallas, Giannis Antetokounmpo in Milwaukee, Nikola Jokic in Denver, Trae Young in Atlanta.

**12. Coach K:** Hybrid/adaptive system that changes based on personnel. Named for the coaching philosophy (not specifically for Mike Krzyzewski) of adapting systems to talent rather than forcing talent into a system. Critical demand: coaching staff flexibility and player versatility. The system is whatever the roster's strengths dictate.

---

## 19. Defensive System Identification (DSIE)

DSIE determines which of the 10 defined defensive systems a team runs.

### The 10 Defensive Systems

**1. Containment Man:** The default man-to-man defense. Keep the ball in front, contest shots, limit penetration. Does not overcommit. Critical demand: disciplined individual defenders at every position. The most common college defense because it requires the least specialized talent - you just need players who can guard their man. Weaknesses: vulnerable to elite individual creators who can beat their man off the dribble. Examples: most college programs default to some form of containment man.

**2. Pack Line:** Wall of defenders inside the three-point line. Shrinks driving lanes dramatically. Critical demand: disciplined help defenders who stay in the pack rather than gambling for steals, plus long/active bigs who can contest without fouling. Gives up some three-point looks in exchange for eliminating rim attempts. The defense accepts that opponents will shoot threes and bets that most teams cannot sustain elite three-point shooting over 40 minutes. Weaknesses: elite three-point shooting teams can torch it. Examples: Virginia under Tony Bennett (inventor of the modern version). Teams that beat Pack Line consistently are elite shooting teams.

**3. Pressure Man (Denial):** Aggressive ball denial, face-guarding, extended pressure. Forces turnovers but requires elite POA defenders and risks fouling. Critical demand: guards with elite on-ball defensive skills and the conditioning to sustain high-effort denial for the full shot clock. This is the most physically demanding defensive system. Weaknesses: foul trouble and backdoor cuts when pressure is overzealous. Examples: Louisville historically, some Arkansas teams.

**4. Switch Everything:** All five defenders switch all ball screens. Critical demand: five players of similar size and defensive versatility who can guard multiple positions. This eliminates PnR advantages entirely but creates potential mismatches if any defender is significantly weaker. The defense is only as strong as its weakest switch. At the NBA level, this is the dominant modern defense. At the college level, it requires unusually versatile rosters. Weaknesses: size mismatches after switches, post-ups by bigger players against smaller defenders after switches. Examples: Oklahoma City Thunder (elite switching), Boston Celtics, many modern NBA defenses.

**5. ICE / No-Middle:** Forces the ball-handler baseline on pick-and-rolls. The screener's defender drops to protect the paint. Eliminates middle penetration - the most dangerous type of drive because it accesses both sides of the court. Critical demand: strong baseline defenders and a rim protector who can play drop coverage. Weaknesses: baseline pull-up jumpers and short-roll floaters. Examples: Dallas Mavericks historically, many NBA teams use ICE on specific actions.

**6. Zone (Structured):** 2-3 or 3-2 zone defense. Players guard areas rather than individual matchups. Critical demand: length and activity at every position. Zone hides weak individual defenders by placing them in areas where they have help. Weaknesses: patient ball movement, skip passes to the weak side, and elite three-point shooting (which zones concede). Examples: Jim Boeheim's Syracuse 2-3 zone (iconic), Miami Heat's situational zone.

**7. Matchup Zone / Hybrid:** Starts in zone principles but matches up to offensive actions. Combines zone coverage with man-to-man accountability. Critical demand: high defensive IQ across all five positions because players must recognize when to play zone and when to match up. The most intellectually demanding defensive system. Weaknesses: offensive teams that mix screening actions and isolations to create confusion about coverage assignments. Examples: Miami Heat frequently use matchup zone elements.

**8. Press / Pressure Defense:** Full-court or three-quarter-court pressure. Forces turnovers before the offense sets up. Critical demand: depth and elite conditioning. You need 10+ players who can sustain high-effort pressing because fatigue is the primary cost. Weaknesses: teams with excellent ball-handlers who can break the press for easy layups. One good passer and one good ball-handler can turn a press into a disadvantage. Examples: Arkansas under Nolan Richardson ("40 Minutes of Hell"), VCU under Shaka Smart ("Havoc").

**9. Junk / Special:** Box-and-one, triangle-and-two, diamond, or other specialty defenses designed for specific opponents. Used situationally, not as a primary system. Critical demand: players who can execute both man and zone principles within the same defensive possession. Effective when the opponent has one or two dominant players and the rest of the team cannot score. Weaknesses: offenses that have multiple capable scorers, because junk defenses sacrifice coverage of secondary threats to shut down the primary threat. Examples: the Raptors famously used a box-and-one against Steph Curry in the 2019 Finals.

**10. Coach K:** Adaptive defensive system that changes based on opponent and personnel. Similar to the offensive Coach K system - the defense is whatever the coaching staff determines is best for this opponent on this night. Critical demand: roster versatility and coaching staff preparation.

---

## 20. System Fit

System Fit measures how well a player's archetype and trait profile match the demands of a specific offensive and defensive system. It is one of the most predictive variables in the intelligence system - more predictive than raw talent alone.

### How System Fit is Calculated

Each offensive and defensive system has a demand profile listing the archetypes it needs, classified as A (Critical), B (High), or C (Optional). When a player's archetype matches an A-tier demand, they have high system fit. When they match a C-tier demand, fit is moderate. When they match no demand, fit is low.

System Fit% is computed by mapping rotation players' archetypes against the system's demand profile:

- A (Critical) demand covered by a top-5 player: Coverage Score 1.0
- A (Critical) demand covered by bench only: Coverage Score 0.7
- Demand uncovered: Coverage Score 0.0

Demand priority weights: A = 3x, B = 2x, C = 1x.

Overall Fit% = weighted coverage score / maximum possible score x 100.

- 90-100%: Roster is built for this system.
- 75-89%: Good fit, minor gaps.
- 60-74%: Functional but has real holes.
- Below 60%: System mismatch.

### Why System Fit is a Multiplier on Player Impact

The pro calibration data proves that system fit creates 3-5 point impact swings:

- **Luka Doncic:** 98-99 effective impact on Dallas (elite defense around him compensates for his DKR 75) vs 93-94 on a bad defensive team. A 5-point swing.
- **Austin Reaves:** 90+ KR playing next to Luka (complementary pieces that maximize his skills) vs 87-88 as a solo number-one option.
- **Kon Knueppel:** 87.8 next to LaMelo Ball (elite creator feeds him open looks) vs probably 84-85 without an elite creator.

Teams with System Fit above 97% consistently overperform their raw Team KR by 3-4 points. A team with KR 88 and 98% system fit plays like a 91-92 team. A team with KR 91 and 70% system fit plays like an 88-89 team.

This is why roster construction matters as much as individual talent.

---

## 21. The Interaction Library

The Interaction Library is the core lookup table for how basketball identities clash. It provides delta values for every possible matchup between offensive systems, defensive systems, offensive archetypes, and defensive archetypes. The Simulation Engine consumes these deltas to resolve possessions and produce game projections.

### Three Tables

**Part 1: System x System (120 entries).** 12 offensive systems x 10 defensive systems. Each entry defines the macro game environment: pace impact, shot profile shifts (which shots increase or decrease), turnover pressure changes, and foul rate changes.

Selected examples showing how system matchups create different game environments:

Spread Pick-and-Roll vs Containment Man: Neutral pace. Rim attempts +2pp, pull-up midrange +2pp, spot-up threes -1pp. Foul rate +1pp. Standard PnR reads remain intact; defense concedes controlled advantages without overcommitting.

Spread Pick-and-Roll vs Pack Line: Pace -2%. Rim attempts -4pp, kick-out threes +4pp, midrange +1pp. Paint congestion suppresses rim pressure; offense shifts toward kick-out shooting.

Spread Pick-and-Roll vs Switch Everything: Pace -1%. Isolation pull-ups +3pp, roll-man rim attempts -3pp. Switches flatten roll advantages and redirect offense toward matchup hunting.

5-Out Motion vs Zone (Structured): Pace -4%. Three-point volume +5pp, rim attempts -3pp. Ball reversals pick apart zone rotations but pace slows significantly.

Pace and Space vs Pack Line: Pace -3%. Transition attempts -2pp, halfcourt three-point volume +3pp. The defense neutralizes the pace advantage and forces a shooting contest.

Heliocentric vs Switch Everything: Pace -2%. Isolation possessions +6pp, PnR actions -4pp. Switching eliminates the roll threat and forces the star into isolation, which is exactly what heliocentric wants if the star is good enough.

Dribble Drive vs Zone: Pace -3%. Gap drives -3pp, kick-out threes +4pp. Zone closes driving lanes but creates open perimeter looks for kick-outs.

**Part 2: Offensive Archetype x Defensive System (210 entries).** 21 offensive archetypes x 10 defensive systems. Each entry defines how a specific type of offensive player performs against a specific defensive system.

Selected examples:

Primary Ball-Handler vs Pack Line: Rim pressure opportunities decrease, but pull-up midrange opportunities increase. The packed paint takes away drives but the handler can pull up from the elbow.

Stretch Big vs Switch Everything: High value. Switching creates mismatches where the big can attack slower defenders off the dribble or shoot over smaller defenders.

Spot-Up Specialist vs Zone: High value. Zone defenses create open catch-and-shoot opportunities on rotations.

Slasher / Rim Pressure Wing vs Pack Line: Low value. The packed paint is designed to eliminate exactly this type of player.

Rim Protector Anchor vs Spread Pick-and-Roll: High defensive value. The PnR creates driving attempts that the anchor can contest and deter.

**Part 3: Defensive Archetype x Offensive System (252 entries).** 21 defensive archetypes x 12 offensive systems. Each entry defines how a specific type of defensive player performs against a specific offensive system.

Selected examples:

POA Defender Guard vs Heliocentric: Extremely high value. If your POA defender can contain the heliocentric star, you neutralize the entire offense. This is the single highest-leverage individual matchup in the library.

Switchable Defender Wing vs 5-Out Motion: High value. The constant screening and cutting requires defenders who can switch without creating mismatches. A switchable wing thrives.

Rim Protector Anchor vs 5-Out Motion: Reduced value compared to PnR offenses. The five-out spacing pulls the big away from the rim, reducing shot-blocking opportunities.

### How Interactions Combine

In a real game, multiple interactions layer: the system-vs-system environment sets the baseline, individual offensive archetype-vs-defensive system interactions modify specific players, and defensive archetype-vs-offensive system interactions add further modification. The Simulation Engine composes these layers with bounded modifiers to produce possession-level resolution.

---

## 22. Roster Construction

The intelligence system includes a complete framework for allocating basketball resources - scholarships, NIL money, and roster spots. This framework connects player evaluation directly to resource decisions.

### Player Total Value (PTV)

PTV measures what a specific player is worth to a specific team. It is NOT a general market value - it is team-specific. A player worth 25% of one team's total value might be worth 8% of another team's total value because of system fit, demand coverage, and existing roster composition.

PTV considers: the player's Final System KR, their system fit at the target program, whether they fill an uncovered demand (especially A-tier critical demands), their projected Team KR impact (how much does Team KR change if they join), and their archetype scarcity in the current market.

### Scholarship Allocation

Scholarship allocation is proportional to PTV share. A player who represents 25% of the team's total PTV should receive approximately 25% of available scholarship resources. The system provides recommended scholarship percentages for each roster player and flags over-allocation (paying more than a player's impact justifies) and under-allocation (risking portal loss by undervaluing a key contributor).

### NIL Allocation

NIL allocation follows the same PTV framework. The system distinguishes between Player Market Value (PMV) - what the open market values a player at based on social following, exposure, and performance - and PTV - what the player is worth to the specific team.

When PTV exceeds PMV, the player is undervalued by the market (a recruiting opportunity). When PMV exceeds PTV, the player is overpriced relative to their on-court value at that program.

---

## 23. Roster Continuity Planning

In the transfer portal era, roster management is as important as recruiting. The intelligence system provides structured tools for managing roster continuity.

### Fragility Exposure

The diagnostics layer identifies structural risks:

- **Single-Point Failure:** An A-tier demand covered by only one rotation player. If that player leaves or gets injured, the system identity breaks.
- **Offensive Concentration:** One player carries more than 25% of total offensive weight. The offense disappears when they sit.
- **Defensive Concentration:** One player carries more than 25% of total defensive weight.
- **Depth Fragility:** Top 5 players carry more than 85% of combined weight. The bench provides minimal value.
- **Role Overload:** Two or more A-tier demands covered by the same player. No single player can sustain both at full capacity over a season.

A team with 3+ fragility flags is structurally fragile regardless of the Team KR number.

### Insurance Targets

The system identifies which portal or recruiting targets would reduce fragility exposure. If the Coverage Map shows an uncovered A-tier demand, the Placement Targeting output ranks available players who fill that demand, sorted by projected Team KR impact.

---

# PART 4: GAME INTELLIGENCE

---

## 24. Scouting and Pregame Reports

The scouting system operates across four game-day phases, each producing a structured packet of intelligence.

### Pregame Scout Packet

Generated 24 hours to game time (refreshable). The pregame packet reads opponent truth from the intelligence system and produces:

**A) Opponent Offensive Identity:** System name, pace band, primary initiators, shot diet (what they want vs what they actually shoot), pressure points (where offense breaks), system vulnerabilities pulled from their Missing Demands and Fragility Flags.

**B) Shot Profile:** Team shot map summary plus individual player shot cards for the top 6-8 rotation players. Each player card shows preferred zones, volume, efficiency, and green/yellow/red shot permissions for your defense.

**C) Actions and Triggers:** Top 8-12 opponent actions ranked by frequency, with trigger, primary option, counter, late-clock bailout, and our counter for each.

**D) Leverage Plan:** Maximum 5 bullet points. If you do nothing else, these 5 things define the game plan. Examples: "Deny Player X's middle drive - force baseline", "Switch all Horns actions", "Crash the offensive glass - they are 13th in defensive rebounding."

**E) Matchup Matrix:** Player-to-player matchup recommendations with advantage/disadvantage markers.

### Confidence Gates

Scout Confidence ranges from 55-96% depending on data availability:
- V1 stats-only: 55-70%
- V1+ with play-type data: 70-85%
- V2 PlayVision (1 season): 80-92%
- V3 PlayVision Deep (multi-season): 88-96%

---

## 25. In-Game Intelligence

In-game intelligence provides real-time support through a structured panel system with anti-spam rules to prevent information overload.

### Six Panels (Fixed Order)

1. **Situation Strip:** Score, time, possession, period, foul/bonus status, run tracker, timeout count.
2. **Live Lineups and Matchups:** Current five, positions, matchup assignments, on-court Off/Def KR aggregate, mismatch flags.
3. **Foul/Risk Monitor:** Foul counts, bonus pressure, attack/avoid recommendations, fragility alerts ("Their center has 3 fouls - if he sits, their rim protection is uncovered").
4. **Shot and Turnover Pulse:** Last 8 shots, turnovers and causes, opponent shot diet trend vs pregame plan.
5. **Opponent Action/Coverage Tag Feed:** Last 10 tagged opponent possessions, repetition detection, coverage effectiveness.
6. **HC Overlay:** Maximum 3 active alerts, maximum 3 next-dead-ball bullets. Each bullet: one sentence plus one action.

### Anti-Spam Rules

- Maximum 1 new alert per 90 seconds
- Maximum 3 alerts per 5 minutes
- Maximum 3 active alerts at once
- Each alert expires after 3 possessions unless re-triggered
- 1 promoted item per 3 minutes, format: "They're doing X. Do Y."

---

## 26. Halftime Analysis

The halftime staff packet is generated at the halftime whistle and provides the coaching staff with a structured analysis of the first half plus adjustment options.

### Structure (Fixed Order)

**Top: Top-3 Decision Summary.** Three bullets, ranked, each bullet = "problem leads to adjustment."

**A-B:** Game state dashboard plus Five Factors.

**C:** Plan adherence vs pregame - what did we say we would do, and did we do it?

**D-E:** Opponent offense and defense audits through the OSIE/DSIE lens.

**F-G:** Our offense and defense audits.

**H:** Lineups, matchups, and plus-minus analysis.

**I:** Constraints and risk - foul trouble, fatigue, matchup constraints.

**J:** Simulation Projections from the Simulation Engine. Given the current game state: win probability with no adjustments, win probability for each of the top 3 adjustments, and the key variable most likely to swing the outcome.

**K:** Adjustments Sandbox. 2-5 defensive options and 2-5 offensive options, each with benefit, risk, and projected win probability delta.

---

## 27. Postgame Analysis

The postgame staff packet provides the final assessment and feeds future preparation.

### Key Outputs

1. Final dashboard and Five Factors
2. Plan audit (what worked, what failed, why - mapped to pregame leverage plan)
3. Opponent offense/defense audits
4. Our offense/defense audits
5. Lineup/matchup stint review
6. Player postgame cards (actual performance vs pregame expectation)
7. Clip and teach list (priority clips with teaching points)
8. Fragility audit (did the fragility flags we identified play out?)
9. Multi-game continuity update (save learnings for next meeting with this opponent)
10. Next actions: next game priorities, practice seeds (3-8 drills/points), development prescriptions (player-specific), rotation considerations

After the postgame packet, player KRs recalculate with new game data, Team KR updates, and system identity re-evaluates at the 5-game checkpoint.

---

## 28. Simulation Engine

The Simulation Engine orchestrates game projections by consuming player truth, team truth, system identity, and interaction data from the library.

### Seven Run Types

**1. Single Game Simulation:** Expected result and drivers for Team A vs Team B. Run the Possession Engine thousands of times, aggregate into expected score, margin band, five-factor projection, and driver summary.

**2. Series / Multi-Game Set:** Aggregate expectation across N games plus sensitivity and volatility.

**3. Season Simulation:** Expected record band plus swing games and stretch risks for a full schedule.

**4. Tournament Simulation:** Advancement expectation by round plus matchup vulnerabilities for a bracket.

**5. Box Score Projection:** Projected team totals plus individual player statlines (minutes, shot diet, counting stats). Surfaces mismatches at the player level.

**6. Line Translation:** Implied win%, spread/total equivalents, plus sensitivity analysis showing which single variable change produces the largest spread/total shift.

**7. Halftime Live Simulation:** Win probability from current position plus win probability under each proposed adjustment. Consumed by Game Ops Section J in the Halftime Staff Packet.

### Physical Mismatch Modifiers

The simulation accounts for physical mismatches between opposing players. When one player has a significant height, weight, or wingspan advantage over their matchup, the possession resolution shifts in their favor. The modifiers are bounded (minimum 0.92, maximum 1.12) to prevent extreme distortion.

### Every Simulation Output Includes

- Data tier and confidence percentage
- Deterministic guarantee (same inputs produce same outputs)
- Interaction trace showing which library entries were used and how they affected the result
- No truth mutation (simulation never modifies Player KR, Team KR, or system identity)

---

# PART 5: DEVELOPMENT AND PRO TRANSITION

---

## 29. Development Intelligence Engine

The Development Intelligence Engine is the final downstream consumer of the intelligence system. It takes everything the system knows about a player and translates it into actionable intelligence for placement, development, and decision-making.

### Six Outputs

**Output A: Player Truth Summary ("Where Are You Now?").** Complete snapshot including KR Identity Card (overall KR, component KRs, archetype, badges, impact modifiers, system risks), Level Tier Map (what the KR means at every competitive level), and System Fit Heat Map (fit score across all 22 systems, showing which systems the player fits best and worst).

**Output B: Placement Targeting ("Where Should You Be?").** Ranked list of best-fit programs across the entire database, sorted by how much this player would improve that team. For each target: Team KR impact, system fit%, demand match, and "Why" / "Risk" tags.

**Output C: Player Value at Target ("What Are You Worth There?").** For each target: PTV, recommended scholarship percentage, recommended NIL allocation, PMV, and gap analysis (UNDERVALUED / FAIR / OVERPRICED).

**Output D: Gap Analysis ("What's Holding You Back?").** For a selected target tier, shows the exact KR gap to the next level and the highest-leverage trait improvements. Maximum 5 traits, ranked by KR lift per point of improvement. Also includes archetype unlock analysis (how close the player is to qualifying for new archetypes) and system fit unlock analysis (what trait improvements would shift demand tiers).

**Output E: Development Roadmap ("What's the Path?").** Prioritized development plan ordered by KR leverage, development feasibility, and timeline. Each priority includes: trait name, current score, target score, projected KR lift, realistic timeline, and training recommendations.

**Output F: Competitive Landscape.** Other players in the portal or recruiting pool with similar archetypes, their KR, system fit profiles, and where they have committed or are considering.

---

## 30. Suppression Detection

Suppression occurs when a player's statistics understate their true ability due to environmental factors. The intelligence system formally identifies and adjusts for four types of suppression.

### Role Suppression

The player's role on the team limits their statistical output. Example: a player who is a natural primary creator but plays as a third option on a stacked roster. Their 8 PPG and 2 APG understate their ability because they are not getting enough touches or creation opportunities.

### System Suppression

The coach's system limits the player's statistical expression. Example: a guard with elite passing vision playing in a Post-Centric offense that does not run pick-and-roll. Their low assist numbers reflect the system, not their ability.

### Teammate Suppression

The quality (or lack) of teammates suppresses the player's output. Example: a shooter playing with no creator who can get them open looks. Their low 3P% reflects receiving bad passes and taking contested shots, not their shooting ability. Or a passer playing with teammates who cannot convert assists.

### Injury Suppression

A current or recent injury limits the player's physical expression. Example: a player who was dunking at 5'10" before a calcaneus (heel) fracture, received zero professional rehabilitation, and now plays on a compromised heel. Their current athletic production does not reflect their true physical tools.

### Real Example: Austin Reaves

The pro calibration data provides the clearest suppression example. Austin Reaves averaged 24.0 PPG playing alongside Luka Doncic and LeBron James as the third option on the Lakers. When both stars sat, Reaves averaged 30+ points per game. His regular-season OKR was initially scored lower because his counting stats reflected his role, not his ability. Suppression analysis corrected his OKR upward from approximately 89-90 to 93.

The lesson: always check role context before finalizing OKR. A player who averages 15 PPG as a third option might be a 25 PPG player as a first option. The suppression detection protocol flags this and adjusts.

### Contextual Mode

For players who cannot be evaluated through the full trait pipeline due to extreme suppression or limited data, Contextual Mode produces a KR range estimate with explicit uncertainty. It produces both the visible stat-based estimate (what the box score says) and the context-adjusted estimate (what the player likely is), reported transparently.

Contextual Mode was validated on three founding test cases:
- Darius Acuff (Arkansas, D1 HM): 95-97 KR range confirmed correct.
- Scotty Washington (High Point, D1 MM): 76-79 KR range confirmed correct.
- Laolu Kalejaiye (Lincoln University, NCCAA): 80-86 KR range with extreme suppression indicators. This case forced the creation of the multi-level player protocol, suppression detection rules, and degree of difficulty adjustment.

---

## 31. Pro Transition Engine

The Pro Transition Engine takes a completed college evaluation and translates it into a professional projection. It does not re-evaluate the player - it takes the same 47 trait scores from the college evaluation and runs them through pro-level weights, pro system risks, and pro overrides.

### The Four Steps

**Step 1: Take college component KRs.** The same OKR, DKR, TKR, IQKR from the college evaluation.

**Step 2: Apply pro-level adjustments.** Slight docks for NBA competition increase on traits that scale with opponent quality (defensive traits, finishing through contact). Slight bumps for traits that translate up (shooting mechanics, IQ).

**Step 3: Reweight through pro positional OPF.** Pro weights differ from college weights. Tools weight decreases (everyone is athletic in the NBA). IQ weight increases (decision-making separates at elite level). Defense weight increases for bigs.

**Step 4: Compute pro KR outputs.** Entry KR (Day 1 as a rookie), 3-Year Projection (Scenario A if key variable develops, Scenario B if it does not), Peak Ceiling (best realistic outcome by Year 3-5), Floor (worst realistic outcome), and Median Outcome (midpoint of A and B at Year 3).

### Key Rules

- Max +8 KR per cluster per year of development
- Max +15 KR over 3 years total
- Always show both upside and downside scenarios
- Confidence on projections is always lower than college KR confidence

---

## 32. Draft-Range Output Priority

The PRIMARY KR shown in pro transition output depends on where the player is projected to be drafted. Teams at different draft positions are buying different things.

### Top of Draft (#1-5): Lead with PEAK CEILING

Bad teams drafting here are buying the best possible outcome. Entry KR is almost irrelevant - every rookie struggles. Show Peak Ceiling KR first, 3-Year Projection second, Ceiling-Floor spread (the bet range), Key Development Variable. Entry KR shown but de-emphasized.

### Mid-Lottery (#6-15): Lead with 3-YEAR PROJECTION

These teams likely have a star and need a complementary piece. Show 3-Year Projection KR first (Scenario A and B), System Fit with likely drafting teams, Peak second. The 3-year version is what these teams are actually evaluating.

### Late First Round (#16-30): Lead with MEDIAN OUTCOME

Good teams or playoff teams need contributors. They want the most likely version of the player, not the dream scenario. Show Median Outcome KR first, Entry KR second, System Fit with specific team, role projection.

### Second Round and Undrafted: Lead with ENTRY KR + ROLE

These players need to earn a roster spot. What can they do Day 1? Show Entry KR, specific role (3-and-D, floor general, rim protector), best league fit (NBA, G-League, overseas plus specific league), salary range.

### Why Entry KR Does Not Correlate with Draft Order

This is a critical insight validated by the pro calibration data. The 2025 NBA Draft demonstrated:

- Cooper Flagg (#1 pick): Entry KR 86.4
- Kon Knueppel (#4 pick): Entry KR 87.8

Knueppel has a HIGHER entry KR than the #1 overall pick. This is correct. Flagg was drafted for ceiling (Peak 95-96), not Day 1 production. Knueppel's floor is higher but his ceiling is lower.

The validated 2026 draft projections show the same pattern:
- AJ Dybantsa: Entry 84.2, Peak 93-95 (drafted for ceiling)
- Tre'Davious Peterson: Entry 87.5, Peak 92-94 (higher entry, lower peak)
- Cameron Boozer: Entry 86.8, Peak 91-93
- Darius Acuff: Entry 85.6, Peak 90-92
- Noah Wagler: Entry 86.4, Peak 89-91

Two players with identical entry KR can have completely different draft values because their ceilings differ. The draft pays for the gap between entry and peak.

---

## 33. Draft Intelligence

The intelligence system produces team-specific draft boards that account for roster context, system fit, and positional need. The same prospect can rank completely differently for different teams.

### How Roster Context Changes Rankings

Consider two teams drafting in the same range:

**Indiana Pacers (15-55, Haliburton returning from Achilles):** Need a two-way wing to pair with Haliburton and Siakam. Their system is Pace and Space offense with Containment Man defense. A prospect who fits that system and fills the wing gap ranks higher than a guard with better raw KR.

**Atlanta Hawks (building around Jalen Johnson):** Need a franchise PG after the Trae Young trade. Their core is Johnson/Daniels/Risacher/Kuminga/Okongwu. A PG prospect who can run Spread PnR ranks highest regardless of whether a wing has higher KR.

The same prospect might rank #2 on Indiana's board and #8 on Atlanta's board - or vice versa - because what each team needs is different. Raw KR is not a draft board. Draft boards are KR filtered through team context.

---

## 34. Pro KR Calibration

The pro KR system was calibrated against 12 NBA players across 5 tiers using 2025-26 season data.

### Tier 1: Global Apex (98-100)

**Nikola Jokic - 98.5.** Denver Nuggets, C, 6'11"/284, Age 31. 28.0/12.9/10.8 on .677 TS%. OKR 97, DKR 82, TKR 85, IQKR 100. The best all-around player alive. IQKR 100 is the highest ever calibrated. Triple-double machine with historically unprecedented passing vision for a center. 3x MVP, Champion.

### Tier 2: Elite Franchise Anchor (94-97)

**Victor Wembanyama - 97.8.** San Antonio Spurs, C/PF, 7'4"/210, Age 21. 24.2/11.3/3.1/1.1/3.1 BPG on .623 TS%. OKR 93, DKR 99, TKR 99, IQKR 90. Most physically dominant player alive. DKR/TKR 99 is an unprecedented combination. Led Spurs from lottery to 56-18. First player in history to average 3+ blocks and 3+ threes per game. 8'0" wingspan.

**Shai Gilgeous-Alexander - 97.5.** Oklahoma City Thunder, PG/SG, 6'6"/195, Age 27. 31.4/4.3/6.5/1.4 SPG. OKR 97, DKR 92, TKR 91, IQKR 96. Most BALANCED superstar. Narrowest component spread (6 points). No weakness anywhere. Most system-portable player - fits any team. MVP plus Champion. 7'0" wingspan.

**Luka Doncic - 96.2.** Los Angeles Lakers, PG, 6'8"/230, Age 27. 33.7/7.8/8.2/1.6 SPG. OKR 98, DKR 75, TKR 88, IQKR 95. Best pure scorer alive. OKR 98 is the highest of anyone calibrated. But DKR 75 is the lowest among superstars - gets targeted defensively. System-dependent: 98-99 impact with elite defense around him, 93-94 without. Widest component spread (23 points) among top tier.

**Giannis Antetokounmpo - 94.8.** Milwaukee Bucks, PF, 6'11"/243, Age 31. 27.6/9.8/5.4 on .624 FG%/.333 3P%/.650 FT%. OKR 94, DKR 88, TKR 97, IQKR 86. Physical freak declining. Peak was 98-99 (back-to-back MVP, DPOY, Champion). DKR dropped from 96 to 88 - defense ages fastest. TKR 97 still elite at 31. Shooting (.333 3P/.650 FT) is career-long limitation.

### Tier 3: High-Impact Global Star (90-93)

**Kevin Durant - 93.0.** Houston Rockets, PF/SF, 6'11"/240, Age 37. 25.9/5.4/4.6 on .517/.406/.879. OKR 94, DKR 78, TKR 92, IQKR 91. Ageless scorer. TKR 92 (7-footer mid-range) ages slowest because it was never athleticism-dependent. .406 3P% at 37. Declined 5 points from peak 98 over 10 years. Proves: height/length ages better than speed/quickness.

**Cade Cunningham - 92.4.** Detroit Pistons, PG, 6'6"/220, Age 24. 24.5/5.6/9.9/1.5 SPG/0.9 BPG. OKR 93, DKR 86, TKR 89, IQKR 94. Franchise PG ascending. Led Pistons from 28-game losing streak to 54-20 in 2 years. The ideal modern PG frame. Efficiency (.346 3P, 56.7% TS) is the gap between him and the superstars.

**Stephen Curry - 92.0.** Golden State Warriors, PG, 6'2"/185, Age 37. 27.2/3.5/4.8 on .468/.391/.931. OKR 93, DKR 72, TKR 68, IQKR 97. GOAT shooter. TKR 68 is the lowest of any calibrated player. Widest component spread (29 points). Entire career is skill-over-tools. Peak was 97 (unanimous MVP). .931 FT% - most efficient shooter alive. Proves: low TKR equals faster decline.

**Austin Reaves - 90.2.** Los Angeles Lakers, SG, 6'5"/197, Age 27. 24.0/4.8/5.5 on .502/.380/.880, 64.4% TS. OKR 93, DKR 80, TKR 76, IQKR 94. Suppressed star. Averaged 30+ when Luka and LeBron sat. Undrafted two-way to 90+ KR in 4 years. IQKR 94 reflects ability to scale up as #1 or down as #3 - rarest basketball skill.

### Tier 4: Core Professional Contributor (86-89)

**LeBron James - 89.5.** Los Angeles Lakers, SF, 6'9"/250, Age 41. 21.1/5.8/6.8 on 59.5% TS. OKR 86, DKR 78, TKR 88, IQKR 97. Peak was 99 (Miami 2012-13). Declined 10 points over 12 years. Now the third option. IQKR 97 barely moved - basketball mind does not age. TKR 88 at 41 is remarkable. Full aging curve documented.

**Kon Knueppel - 87.8.** Charlotte Hornets, SF/SG, 6'7"/210, Age 20. 19.0/5.4/3.5 on .487/.436, 65.3% TS. OKR 90, DKR 78, TKR 80, IQKR 92. Elite shooting transforms teams. .436 3P% leading the league as a rookie. All-time rookie record for threes. Higher current KR than Flagg despite lower physical tools. Proves: shooting plus IQ can outperform athleticism plus defense in the short term. Peak projection: 91-92.

**Cooper Flagg - 86.4.** Dallas Mavericks, SF, 6'9"/205, Age 19. 20.4/6.6/4.6/1.2/0.9 on .474/.286/.814, 55.0% TS. OKR 85, DKR 88, TKR 90, IQKR 86. Defense-first rookie. DKR 88 translating immediately. .286 3P% is the critical development variable - if it becomes .350+ he is a 95-96 player. Peak projection: 95-96.

### Key Insights from Calibration

1. **DKR separates tiers at the top.** Luka's DKR 75 caps him at 96. SGA's DKR 92 pushes him to 97.5.
2. **Offense ages slowest, defense fastest.** OKR drops 2-3 points per decade. DKR drops 8-10 points. IQKR barely moves.
3. **TKR predicts aging curve speed.** Skill-based height (KD) declines slowest. Speed-based game (Curry) declines fastest.
4. **System fit creates 3-5 point impact swing.**
5. **Entry KR for rookies is 84-88 regardless of draft position.**
6. **Component spread predicts system dependency.** Narrow spread (SGA: 6 points) = portable, high floor. Wide spread (Luka: 23 points) = system-dependent.

---

## 35. Aging Curves

The pro calibration data provides the clearest picture of how basketball skills age at the professional level.

### Offense Ages Slowest

OKR drops approximately 2-3 points per decade. Scoring mechanics, shooting form, playmaking reads, and offensive instincts are deeply ingrained skills that persist well into a player's 30s. KD at 37 still has OKR 94. LeBron at 41 still has OKR 86. Curry at 37 has OKR 93.

### Defense Ages Fastest

DKR drops approximately 8-10 points per decade. Defense requires lateral quickness, recovery speed, explosiveness, and effort that all decline with age. Giannis went from DKR 96 at peak to DKR 88 at 31. LeBron went from DKR 93+ at peak to DKR 78 at 41. Curry went from DKR ~82 at peak to DKR 72 at 37.

### IQ Holds

IQKR barely moves with age. LeBron's IQKR: 99 at peak, 97 at 41. Jokic's IQKR: 100 at 31. Curry's IQKR: 97 at 37. Basketball intelligence is accumulated knowledge that compounds rather than decays. The brain does not lose basketball IQ the way the body loses speed.

### Tools Decline at Medium Speed

TKR drops approximately 5-10 points per decade, depending on what the tools are. Height and length never decline. Strength declines slowly with proper training. Speed and explosiveness decline fast. Motor and endurance decline medium.

This is why TKR composition matters: a player whose TKR is built on height and length (KD, TKR 92 at 37) ages better than a player whose TKR is built on speed and explosiveness (Curry, TKR 68 declining faster). Giannis (TKR 97, athleticism-based) will decline rapidly once his explosiveness goes.

### Practical Application

These aging curves inform the Pro Transition Engine's development trajectory projections. When projecting how a rookie will develop, the system uses archetype-typical aging curves to estimate peak timing, decline rate, and career arc.

---

## 36. System Fit at Pro Level

System fit at the professional level works the same way as at college - matching player archetypes and trait profiles against team system demands. The 30-team Pro Team Registry provides offensive and defensive system classifications for every NBA team.

### How NBA Team Systems Affect Player Impact

The most dramatic example from the calibration data is Luka Doncic:

- On Dallas (2024, strong defensive roster): Luka's DKR 75 was masked by elite perimeter defenders around him. His effective impact was 98-99 because the team was constructed to cover his weakness.
- On a team without elite defense: His DKR 75 gets exposed and his effective impact drops to 93-94.

That is a 5-point swing from system fit alone. The same player, the same skills, different impact based on roster context.

### Portability vs Dependency

SGA has the narrowest component spread (6 points between OKR 97 and TKR 91). He has no weakness. He produces elite impact on ANY team. His floor is 96+ regardless of roster construction. This is what "system-portable" means.

Luka has the widest component spread among superstars (23 points between OKR 98 and DKR 75). He needs a specific roster around him to maximize impact. His ceiling is 98-99 with the right pieces but his floor is 93-94 without them. This is what "system-dependent" means.

When evaluating draft prospects, the system computes fit against the likely drafting team's offensive and defensive system using the Pro Team Registry. A prospect who fits a team's system might be more valuable to that team at pick #12 than a higher-KR prospect who does not fit.

---

## 36A. Coaching Impact Modifier

The Coaching Impact Modifier (CIM) v1.0 is a downstream engine that computes coaching-attributable player development residuals across all 8 trait clusters. It answers: how much of a player's improvement (or decline) is attributable to coaching versus natural maturation, competition level change, or role change?

### How CIM Works

CIM compares a player's trait trajectory before and after joining a coaching staff, controlling for expected development by age and level. If a player's shooting traits improve 8 points in one season when the expected improvement for their age and archetype is 3 points, the residual of +5 points is attributed to coaching impact.

CIM computes these residuals across all 8 trait clusters for every player on a coaching staff's roster who has multi-season evaluation data. The aggregate residuals across all players form the coach's development profile: which skills does this coach consistently develop better than expected?

### What CIM Enables

- Coaches can demonstrate their development track record with data, not stories.
- Recruiting targets can see which programs develop specific skills.
- The Development Engine uses CIM to adjust development roadmap timelines - if a coach has a history of developing three-point shooting at +4 points above expected, the roadmap for a player who needs shooting improvement can be more optimistic at that program.
- The Pro Transition Engine can factor coaching development probability into trajectory projections.

### Limitations

CIM v1.0 requires multi-season data for the same player under the same coach. It cannot attribute improvement to a specific assistant coach or position coach. It does not account for external training (private trainers, summer work). It is a directional signal, not a precise measurement.

---

## 36B. The Multi-Level Player Protocol

Some players compete across multiple competitive levels in a single season - for example, an NCCAA player who also plays games against NAIA, D2, and D1 opponents. The Multi-Level Player Protocol handles these cases.

### Key Rules

1. Do NOT blend stats across levels into a single average. Each level produces its own stat line with its own KLVN lambda.
2. Separate data by competition level and tag each game with the appropriate lambda.
3. Phase 3 legend anchor mapping runs independently for each level segment.
4. Cross-level stat divergence (50%+ difference in assists, steals, or rebounds between highest and lowest competition levels) is a suppression indicator - the lower-level numbers may reflect true ability that higher-level context suppresses.
5. The final KR synthesizes all level segments, weighted by game count and competition quality, with the highest-level performance given the most weight.

### Founding Test Case

The Multi-Level Protocol was developed through the evaluation of Laolu Kalejaiye, who competed at D1, NAIA, USCAA, and NCCAA levels in a single season. His stats diverged dramatically by level: 38 points and 12 threes at Pepperdine (D1) vs season averages at NCCAA that reflected extreme teammate suppression. The protocol ensured each level's data was treated appropriately rather than blended into a meaningless average.

---

## 36C. Degree of Difficulty Adjustment

Standard trait bands assume a normal distribution of shot types, distances, and creation methods. Some players operate outside these assumptions. When a player's shot profile is materially different from the assumed norm, the intelligence system applies a Degree of Difficulty disclosure.

### Examples

- A player whose every three-pointer comes from 25+ feet (not a mix of corner/wing/slot). Standard 3P% bands assume normal distance distribution. Shooting 37% exclusively from deep range is harder than 37% from a normal mix of distances.

- A player who is face-guarded and full-court denied on every possession. Standard efficiency bands assume normal defensive attention. This player's production comes against maximum pressure.

- A player who is the only ball handler against D1 pressure with no outlet pass options. Standard turnover bands assume normal team context.

Degree of Difficulty does not change the data. It adds a structured note to each affected trait explaining why the raw number understates or overstates the true trait level, and by approximately how much.

---

---

# PART 6: PRO LEAGUE INTELLIGENCE

---

## 37. Pro League Registry

The Pro League Registry is the source-of-truth for all professional basketball leagues worldwide. It provides context for pro evaluation, placement, salary projection, and draft pipeline analysis. Every pro-level output references this registry.

### Tier 1 - Elite Global Leagues

**NBA (National Basketball Association).** Lambda 1.000 (reference level). USA/Canada. 30 teams. Salary cap approximately $141M (2025-26). Rookie scale slotted by draft position. 82-game season plus playoffs (October through June). The reference league - all other lambdas are relative to NBA.

**EuroLeague.** Lambda 0.920. Europe (multi-country). 18 teams. No hard salary cap (budget-driven). 34-game season plus playoffs (October through May). The best non-NBA competition. Multiple NBA-caliber players compete here. Regular NBA draft source - Luka Doncic, Domantas Sabonis, and Manu Ginobili all came through EuroLeague systems.

### Tier 2 - Strong Professional Leagues

**ACB (Liga Endesa) - Spain.** Lambda 0.860. 18 teams. Salary range $100K-$3M. Historically the deepest European domestic league. Real Madrid and Barcelona serve as feeder systems to the NBA.

**NBL (National Basketball League) - Australia.** Lambda 0.850. 10 teams. Salary range $50K-$800K. The Next Stars program serves as a primary NBA development pathway for international players outside the NCAA. LaMelo Ball, Josh Giddey, and Dyson Daniels all came through Next Stars.

**BSL (Basketbol Super Ligi) - Turkey.** Lambda 0.840. 16 teams. Salary range $100K-$2.5M. Strong import market. Fenerbahce and Anadolu Efes compete in EuroLeague.

**Adriatic League (ABA).** Lambda 0.830. 16 teams. Salary range $50K-$1.5M. Regional competition across former Yugoslav nations. Consistent NBA talent developer - Jokic and Bogdanovic came from this league system.

**Lega Basket (Serie A) - Italy.** Lambda 0.830. 16 teams. Salary range $80K-$2M. Historic league. Olimpia Milano and Virtus Bologna compete in EuroLeague.

**LNB (Pro A) - France.** Lambda 0.820. 18 teams. Salary range $80K-$1.5M. Best development league in Europe for NBA-bound players. Tony Parker, Rudy Gobert, and Victor Wembanyama all developed here.

**ISL (Israeli Basketball Super League).** Lambda 0.810. 12 teams. Salary range $80K-$2M. Strong import spending. Maccabi Tel Aviv competes in EuroLeague.

### Tier 3 - Mid-Level Professional Leagues

**CBA (Chinese Basketball Association).** Lambda 0.800. 20 teams. Salary range $200K-$4M for imports. 2 foreign players per team. High-paying for imports but weaker domestic talent. Aging veteran destination.

**EuroCup / BCL (Basketball Champions League).** Lambda 0.800. Second-tier European club competitions.

**BBL (Basketball Bundesliga) - Germany.** Lambda 0.790. 18 teams. Salary range $50K-$1M. Growing league. Dennis Schroder and Daniel Theis developed here.

**B.League - Japan.** Lambda 0.780. 24 teams (Division 1). Salary range $100K-$1.5M. Expanding league with strong import market and increasing budgets.

**G-League (NBA G League).** Lambda 0.780. 31 teams (NBA-affiliated). Salary range $45K-$500K (two-way contracts up to approximately $560K). The primary NBA development league. Two-way contracts bridge G-League and NBA. For undrafted college players, G-League is the most direct NBA pathway.

**KBL - South Korea.** Lambda 0.750. 10 teams. Salary range $50K-$500K. Smaller market with 1 import per team.

### Tier 4 - Lower Professional Leagues

**NBB (Novo Basquete Brasil) - Brazil.** Lambda 0.730. Salary range $30K-$300K.

**PBA (Philippine Basketball Association).** Lambda 0.720. Salary range $20K-$200K.

**Liga Nacional - Argentina.** Lambda 0.720. Salary range $20K-$200K.

**France Pro B.** Lambda 0.720. Salary range $30K-$200K.

**Germany Pro A.** Lambda 0.710. Salary range $20K-$150K.

**UK BBL (British Basketball League).** Lambda 0.700. Salary range $20K-$100K.

### Tier 5 - Entry-Level / Semi-Professional

**Lower European domestic (Poland, Greece D2, Czech, etc.).** Lambda 0.650-0.700. Salary range $15K-$100K.

**Southeast Asian leagues.** Lambda 0.620. Salary range $10K-$80K.

**African leagues (BAL, domestic).** Lambda 0.600-0.650. Salary range $5K-$50K.

**Semi-pro / minor leagues.** Lambda 0.550-0.600.

### Placement Guidance

When recommending a league for a player:

| Pro KR | Best League Fit | Rationale |
|---|---|---|
| 90+ | NBA | Only league that matches their talent level |
| 86-89 | NBA rotation or EuroLeague | Can start overseas or rotate in NBA |
| 82-85 | G-League or strong domestic (ACB, BSL, NBL) | Develop toward NBA or start overseas |
| 78-81 | Mid-tier domestic (LNB, BBL, Serie A, B.League) | Solid pro career, unlikely NBA |
| 73-77 | Lower domestic or G-League camp | Edge of pro viability |
| 68-72 | Entry-level / semi-pro | High churn, short contracts |

---

## 38. Pro KLVN Lambdas

Pro lambdas serve the same function as college lambdas: they normalize production inputs during trait scoring so that a player's KR reflects actual basketball ability regardless of league.

### The Complete Pro Lambda Table

| League | Lambda | Tier |
|---|---|---|
| NBA | 1.000 | 1 |
| EuroLeague | 0.920 | 1 |
| ACB Spain | 0.860 | 2 |
| NBL Australia | 0.850 | 2 |
| BSL Turkey | 0.840 | 2 |
| Adriatic ABA | 0.830 | 2 |
| Serie A Italy | 0.830 | 2 |
| LNB France | 0.820 | 2 |
| Israel BSL | 0.810 | 2 |
| EuroCup / BCL | 0.800 | 3 |
| CBA China | 0.800 | 3 |
| BBL Germany | 0.790 | 3 |
| B.League Japan | 0.780 | 3 |
| G-League | 0.780 | 3 |
| KBL South Korea | 0.750 | 3 |
| NBB Brazil | 0.730 | 4 |
| PBA Philippines | 0.720 | 4 |
| LNB France Pro B | 0.720 | 4 |
| Liga Nacional Argentina | 0.720 | 4 |
| Pro A Germany | 0.710 | 4 |
| UK BBL | 0.700 | 4 |
| Lower European domestic | 0.650-0.700 | 4/5 |
| African leagues | 0.600-0.650 | 5 |
| Southeast Asian leagues | 0.620 | 5 |
| Semi-pro / minor leagues | 0.550-0.600 | 5 |

### Cross-League Comparison Example

Player A: 18 PPG in NBA (lambda 1.000).
Player B: 24 PPG in ACB Spain (lambda 0.860).

After lambda normalization, Player B's 24 PPG normalizes closer to approximately 20 PPG at NBA-equivalent competition. Player A's 18 PPG stays at 18. The trait scores and final KRs reflect this - Player A may still rate higher because their production came against stronger competition.

### College-to-Pro Note

There is NO lambda translation from college to pro. These are separate evaluation pipelines. College-to-pro translation happens through component KR adjustments, pro OPF reweighting, anchoring against the Pro Player KR Legend, and development trajectory projections. Pro lambdas are for comparing BETWEEN pro leagues only.

### Calibration Status

All pro lambdas are v0 provisional estimates based on NBA-to-international talent flow patterns, draft pick performance by league of origin, cross-league transfer production shifts, and public analytics. Empirical calibration requires tracking 50+ players who move between leagues and measuring production shifts.

---

## 39. Pro Team Intelligence - All 30 NBA Teams

The Pro Team Registry maps every NBA team's offensive and defensive system, roster context, competitive window, and draft priority. This enables system fit computation and draft-range-appropriate evaluation for any prospect against any NBA team.

### How Team Window Affects Draft Priority

| Window | Typical Draft Position | What They Draft For |
|---|---|---|
| Rebuilding | Lottery (#1-5) | Peak Ceiling. Best player available. Fit/overlap secondary. |
| Rising | Mid-lottery (#6-14) | 3-Year Projection plus Fit. Have a young star, need complementary pieces. |
| Contending | Late first (#15-30) | Median Outcome plus Fit. Need contributors now. |
| Retooling | Varies | Depends on pick position. |

### Eastern Conference

**Atlantic Division:**

Boston Celtics - HC Joe Mazzulla. Offense: 5-Out Motion. Defense: Switch. Window: Contending. Draft priority: Median plus fit.

New York Knicks - HC Tom Thibodeau. Offense: Spread PnR. Defense: Containment Man. Window: Contending. Draft priority: Median plus fit.

Philadelphia 76ers - HC Nick Nurse. Offense: Spread PnR / Motion. Defense: Switch. Window: Retooling. Draft priority: Depends on slot.

Brooklyn Nets - HC Jordi Fernandez. Offense: Pace and Space. Defense: Containment Man. Window: Rebuilding. Draft priority: Peak ceiling.

Toronto Raptors - HC Darko Rajakovic. Offense: Pace and Space / Read and React. Defense: Switch. Window: Rebuilding. Draft priority: Peak ceiling.

**Southeast Division:**

Miami Heat - HC Erik Spoelstra. Offense: 5-Out Motion / Spread PnR. Defense: Switch / Zone. Window: Contending. Draft priority: Median plus fit.

Orlando Magic - HC Jamahl Mosley. Offense: Pace and Space. Defense: Containment Man / Pack Line. Window: Rising. Draft priority: 3-Year plus fit.

Atlanta Hawks - HC Quin Snyder. Offense: Spread PnR. Defense: Containment Man. Window: Rising. Building around Jalen Johnson (All-Star). Need franchise PG after Trae Young trade. Core: Johnson/Daniels/Risacher/Kuminga/Okongwu. Draft priority: 3-Year plus fit.

Charlotte Hornets - HC Charles Lee. Offense: Pace and Space. Defense: Switch. Window: Rebuilding. Draft priority: Peak ceiling.

Washington Wizards - HC Brian Keefe. Offense: Pace and Space. Defense: Containment Man. Window: Rebuilding. Draft priority: Peak ceiling.

**Central Division:**

Cleveland Cavaliers - HC Kenny Atkinson. Offense: 5-Out Motion. Defense: Pack Line / Switch. Window: Contending. Draft priority: Median plus fit.

Milwaukee Bucks - HC Doc Rivers. Offense: Heliocentric. Defense: Containment Man. Window: Contending. Draft priority: Median plus fit.

Indiana Pacers - HC Rick Carlisle. Offense: Pace and Space. Defense: Containment Man. Window: Rebuilding (Haliburton Achilles). 15-55 record. Haliburton returning. Need two-way wing to pair with Haliburton/Siakam. Core: Haliburton/Nembhard/Nesmith/Siakam/Zubac. Draft priority: Peak ceiling.

Chicago Bulls - HC Billy Donovan. Offense: Spread PnR. Defense: Switch. Window: Rebuilding. Draft priority: Peak ceiling.

Detroit Pistons - HC JB Bickerstaff. Offense: Pace and Space. Defense: Containment Man. Window: Rebuilding. Draft priority: Peak ceiling.

### Western Conference

**Northwest Division:**

Oklahoma City Thunder - HC Mark Daigneault. Offense: Pace and Space / Motion. Defense: Switch. Window: Contending. Draft priority: Median plus fit.

Denver Nuggets - HC Michael Malone. Offense: Heliocentric. Defense: Containment Man. Window: Contending. Draft priority: Median plus fit.

Minnesota Timberwolves - HC Chris Finch. Offense: Spread PnR. Defense: Containment Man. Window: Contending. Draft priority: Median plus fit.

Utah Jazz - HC Will Hardy. Offense: Pace and Space. Defense: Switch. Window: Rebuilding. Draft priority: Peak ceiling.

Portland Trail Blazers - HC Chauncey Billups. Offense: Pace and Space. Defense: Containment Man. Window: Rebuilding. Draft priority: Peak ceiling.

**Pacific Division:**

Golden State Warriors - HC Steve Kerr. Offense: 5-Out Motion. Defense: Switch. Window: Retooling. Draft priority: Depends on slot.

LA Lakers - HC JJ Redick. Offense: Spread PnR / Motion. Defense: Containment Man. Window: Contending. Draft priority: Median plus fit.

LA Clippers - HC Ty Lue. Offense: Spread PnR. Defense: Switch. Window: Retooling. Draft priority: Depends on slot.

Phoenix Suns - HC Mike Budenholzer. Offense: Spread PnR. Defense: Pack Line. Window: Contending. Draft priority: Median plus fit.

Sacramento Kings - HC Doug Christie. Offense: Pace and Space / Dribble Drive. Defense: Containment Man. Window: Rising. Draft priority: 3-Year plus fit.

**Southwest Division:**

San Antonio Spurs - HC Gregg Popovich. Offense: Inside-Out / Motion. Defense: Containment Man. Window: Rising. Draft priority: 3-Year plus fit.

Dallas Mavericks - HC Jason Kidd. Offense: Heliocentric / Spread PnR. Defense: Switch. Window: Contending. Draft priority: Median plus fit.

Houston Rockets - HC Ime Udoka. Offense: Pace and Space. Defense: Switch / Pressure Man. Window: Rising. Draft priority: 3-Year plus fit.

Memphis Grizzlies - HC Taylor Jenkins. Offense: Pace and Space. Defense: Containment Man. Window: Rebuilding. Draft priority: Peak ceiling.

New Orleans Pelicans - HC Willie Green. Offense: Spread PnR. Defense: Switch. Window: Retooling. Draft priority: Depends on slot.

### How to Use for Draft / System Fit

1. Identify the prospect's archetype from Mode 1 evaluation
2. Look up the drafting team's offensive and defensive system, window, and draft priority
3. If team drafts for PEAK - rank prospects by Peak Ceiling KR, de-emphasize fit
4. If team drafts for 3-YEAR - rank by 3-Year Projection, weight system fit 30-40%
5. If team drafts for MEDIAN plus FIT - rank by Median Outcome, weight system fit 50%+

---

## 40. Pro Salary Framework

The Pro Salary Framework maps Pro KR tiers to salary using cap percentage as the primary unit for NBA and raw dollars for international leagues. Cap percentage is the stable unit because it does not change with annual cap increases - a player worth 25% of the cap is worth 25% of the cap regardless of whether the cap is $141M or $180M.

### Reference Cap: 2025-26 NBA Salary Cap = approximately $141M

### What Teams Pay For By Draft Range

| Draft Range | What They Buy | Primary KR | Salary Basis |
|---|---|---|---|
| #1-5 | Peak ceiling | Peak KR | Rookie scale (fixed by slot) |
| #6-15 | 3-year development | 3-Year Projection | Rookie scale (fixed by slot) |
| #16-30 | Median outcome plus fit | Median Outcome | Rookie scale (fixed by slot) |
| 2nd round | Entry role / value | Entry KR | Minimum / two-way |
| Undrafted | Immediate role | Entry KR | Minimum / overseas market |

All rookies are on fixed salary scales. The PICK determines the salary. The KR determines whether that salary is a good investment.

### NBA Rookie Scale By Draft Slot (2025-26)

| Pick | Year 1 Salary | Cap % | What You Buy |
|---|---|---|---|
| 1 | ~$12.2M | 8.7% | Peak ceiling 93-95+. Franchise player bet. |
| 2 | ~$10.9M | 7.7% | Peak ceiling 91-94. Star upside. |
| 3 | ~$9.8M | 6.9% | Peak ceiling 90-93. High-end starter bet. |
| 4-5 | ~$7.9-$8.8M | 5.6-6.2% | Peak ceiling 89-92. Starter trajectory. |
| 6-10 | ~$5M-$7M | 3.5-5.0% | 3-Year 87-90. Complementary star. |
| 11-14 | ~$3.5M-$5M | 2.5-3.5% | 3-Year 85-88. Quality starter. |
| 15-20 | ~$2.5M-$3.5M | 1.8-2.5% | Median 84-87. Reliable rotation. |
| 21-30 | ~$1.8M-$2.5M | 1.3-1.8% | Median 82-86. Role player / specialist. |
| 31-40 | ~$1.5M-$2M | 1.0-1.4% | Entry 80-84. Contribute now. |
| 41-58 | ~$1M-$1.5M | 0.7-1.0% | Entry 78-82. Earn a roster spot. |
| Undrafted | $500K-$1.5M | <1% | Entry 75-80. Specific role or overseas. |

### NBA Extension / Second Contract (Year 3-4)

The extension pays based on what the player BECAME, not what he was drafted as. This is where the real money is.

| Pro KR at Extension | Cap % | 2025-26 Dollar | What It Means |
|---|---|---|---|
| 94+ | 30-35% | $42M-$50M/yr | Designated max. Franchise player. Pick was a home run. |
| 90-93 | 22-30% | $31M-$42M/yr | Max. All-Star level. Pick hit. |
| 86-89 | 12-20% | $17M-$28M/yr | Near-max. Quality starter. Solid pick. |
| 82-85 | 5-10% | $7M-$14M/yr | Mid-level deal. Rotation player. Pick was okay. |
| 78-81 | 2-4% | $3M-$6M/yr | Role player deal. Below expectations for first-rounder. |
| Below 78 | <2% | $1.5M-$3M/yr | Minimum. Pick did not work out. |

### International Salary By League and Pro KR

Net salary estimates (many international contracts are tax-free):

| Pro KR | EuroLeague | ACB/BSL/Serie A | NBL/CBA/B.League | LNB/BBL | Lower Euro | G-League |
|---|---|---|---|---|---|---|
| 94+ | $3M-$6M | $1.5M-$3M | $800K-$2M | $500K-$1.5M | N/A | N/A |
| 90-93 | $1.5M-$4M | $800K-$2M | $400K-$1M | $300K-$800K | N/A | N/A |
| 86-89 | $600K-$1.5M | $300K-$1M | $200K-$600K | $150K-$400K | $80K-$200K | $100K-$350K |
| 82-85 | $200K-$800K | $150K-$500K | $100K-$300K | $80K-$200K | $50K-$120K | $45K-$200K |
| 78-81 | $100K-$300K | $80K-$200K | $50K-$150K | $40K-$100K | $30K-$80K | $45K-$100K |
| 73-77 | $50K-$150K | $40K-$100K | $30K-$80K | $20K-$60K | $15K-$50K | N/A |
| 68-72 | N/A | $20K-$50K | $15K-$40K | $10K-$30K | Stipend | N/A |

### Salary Output Format By Draft Range

For top-5 picks, lead with peak scenario salary: "Peterson's Peak KR projects to 92-94. At peak, that is 22-30% of cap ($31-42M/yr max extension). Rookie salary at #2: $10.9M/yr (7.7% of cap)."

For mid-lottery (#6-15), lead with 3-year scenario salary: "Acuff's 3-Year Projection (A) is 88.1. Extension at that KR: 12-20% of cap ($17-28M/yr)."

For late first (#16-30), lead with median salary: "Smith's Median Outcome is 86.0. Extension: 12-20% of cap ($17-28M/yr)."

For second round / undrafted, lead with entry plus league salary: "Martin's Entry KR 81.3 projects to $80-200K in France LNB, $100-300K in Israel BSL. G-League: $45-100K. Two-way NBA: approximately $560K if earned."

---

# PART 7: THE GLOBAL DATABASE

---

## 41. The Player Pool

The KaNeXT intelligence system maintains a comprehensive player pool that serves as the data foundation for all evaluations, team analysis, simulations, and downstream engines.

### College Player Pool

The college player pool contains 31,924 players with season averages, game logs, and derived metrics. Coverage spans all 14 competitive levels from NCAA D1 High-Major through NCCAA D2. Each player record includes identity information (name, position, height, weight, school, class year), raw production data (per-game and per-100 possession stats), derived metrics (TS%, Usage%, BPM, PER, AST/TO, etc.), BPR (computed through the v2 formula), and enrichment metadata (awards, recruiting status, hometown, high school, social links).

The pool is refreshed through the compute engine pipeline during export/refresh cycles. BPR is computed automatically from box score data. KR is not stored in the pool - Nexus computes KR live from raw stats using the V1 Evaluation Protocol, because KR requires basketball judgment (Phase 3 anchoring) that the compute engine cannot replicate.

### Pro Player Pool

The pro player pool contains 539 NBA players plus expanding international coverage. NBA data includes full box score stats, advanced metrics, and salary information. International data is growing as more leagues are integrated.

### Game Logs

Over 500,000 individual game logs power BPR computation, trend analysis, and postgame intelligence. Each game log includes per-game box score data, opponent identification, competition level, and derived per-possession metrics.

### Enrichment Flywheel

The Data Gathering Protocol creates a 7-day cache/writeback flywheel. When Nexus evaluates a player, it searches the pool first, then conducts official web searches and social web searches, responds to the user, and writes corrections and new data back to the pool. This means each evaluation makes the pool better for the next one. Ten new enrichment fields track verified height, verified weight, awards, recruiting status, committed school, hometown, high school, social links, scouting notes with source attribution, and last enrichment timestamp.

Enrichment rules: never overwrite computed stats (PPG, RPG, etc. come from the compute engine), only enrich metadata fields, flag height/weight discrepancies rather than silently changing them, timestamp every enrichment, and never delete existing enriched data.

---

## 42. StatKeeper

StatKeeper is the real-time stat tracking system built into the KaNeXT app. It allows coaches and staff to track game statistics live during games, feeding data directly into the intelligence pipeline.

### How StatKeeper Feeds Intelligence

When a coach tracks stats through StatKeeper during a game, those stats flow into the player pool and power:

- Real-time BPR computation (game-level)
- Postgame staff packet generation (immediately after the game)
- Player KR update triggers (with new game data)
- Team KR recalculation (with updated player KRs and minutes/usage)
- TPQ computation (team game performance quality)

StatKeeper data is V1 tier (box score) but with the advantage of being immediate and coach-verified. It bridges the gap between delayed official stat feeds and real-time coaching intelligence.

### StatKeeper in the App

StatKeeper lives in the Hub's Game Day tab within the KaNeXT app. It is not in the Agenda tab. During games, the coaching staff uses StatKeeper to log possessions, and the intelligence system processes those inputs in real-time to power the In-Game Intelligence panels and the postgame analysis.

---

# PART 8: HOW IT LIVES IN THE APP

---

## 43. How Intelligence Lives in the KaNeXT App

The basketball intelligence system does not exist as a standalone product. It lives inside the KaNeXT app through Nexus AI - the intelligence layer that users interact with conversationally.

### Nexus AI is the Interface

Coaches, scouts, players, and investors do not navigate dashboards or read spreadsheets. They talk to Nexus. They ask questions in plain language:

- "Evaluate Cameron Boozer" triggers Mode 1 (Player Evaluation)
- "What's Kansas's Team KR?" triggers Mode 2 (Team Evaluation)
- "Simulate our next game against Arizona" triggers Mode 3 (Simulation)
- "Pregame report for tomorrow" triggers Mode 4 (Scouting / Game Ops)
- "Where should Laolu transfer?" triggers Mode 5 (Development)
- "What's Dybantsa's pro projection?" triggers Mode 6 (Pro Transition)

Nexus references the 6 intelligence files (Process, Reference, Team Intelligence, Simulation, Scouting, Downstream Engines) plus the 14 legend files plus the pro reference files to produce structured, honest answers. The intelligence files are the system prompt - they are what make Nexus an expert rather than a general chatbot.

### The App IS the Data Room

For investors, the KaNeXT app is the data room. Instead of reading PDFs about the intelligence system, investors open the app and interact with Nexus directly. They can ask Nexus to evaluate any player, explain how the KR system works, demonstrate the evaluation protocol live, or show team intelligence in action. The executive summary document is the only thing investors receive as a traditional PDF - its job is to prove the founder is real, prove the product is real, and make them open the app. Once they are in the app, Nexus takes over.

All 33 data room documents are loaded into Nexus as knowledge. The fund raise happens through traditional channels (PPM, DocuSign, wire), not through in-app payment. The app is the pitch tool.

### Five Modes in the KaNeXT OS

The KaNeXT app is a multi-mode operating system. Basketball intelligence lives primarily in the Sports mode, but the OS serves five modes:

1. **Community (ICCLA)** - church and community institution management
2. **Personal (@sammyk)** - individual profile and identity
3. **Business (KaNeXT LLC)** - company operations
4. **Education (Lincoln University)** - academic institution management
5. **Sports (LU Men's Basketball)** - athletics and basketball intelligence

Each mode has its own Hub, Agenda, KayTV (passive content consumption), and KayStudios (interactive content / game engine). The basketball intelligence layer powers the Sports mode but the OS architecture is designed to serve any institution with people to evaluate and decisions to make.

### Key App Components

**Hub:** The command center for each mode. Contains Operations (documents, SOPs, announcements), People (roster, staff, contacts), and the Game Day tab (where StatKeeper lives during games).

**Agenda:** Calendar, tasks, scheduling, and workflow management.

**KayTV:** Passive content consumption. Training videos, game film, content feeds. Watch, do not interact.

**KayStudios:** Interactive content and game engine. Oregon Trail, Carmen Sandiego, Football Manager, Millsberry, Roblox-style experiences scoped per mode. Interactive courses with quizzes and decision-making exercises.

**KayPay:** Payments rail for all financial transactions within the app.

---

## 44. How Intelligence Extends to Other Sports

The same intelligence architecture - KR, KLVN, legends, OPF, system fit, component KRs, Phase 3 anchor, Phase 6 adjustment - applies to every sport. Three additional sports are already in development with complete v1 specifications.

### Football (v1 complete - SKILL.md plus Reference file, 2,533 lines)

Football intelligence covers 22 positions with individual OPF weights. Component KRs are adapted for football: AKR (Athletic KR), SKR (Skill KR), FKR (Football IQ KR), and PKR (Production KR).

8 offensive systems defined: Spread, Air Raid, RPO, Pro Style, West Coast, Power Run, Option, and Pistol. 6 defensive systems defined: 4-3, 3-4, Nickel 4-2-5, 3-3-5, 4-4, and 46.

College lambdas: FBS = 1.000 (reference), FCS, D2, D3, NAIA, JUCO. Pro lambdas: NFL = 1.000, CFL, UFL, XFL.

85 scholarship spots with a full roster decision framework paralleling the basketball scholarship/NIL allocation engine.

### Soccer (v1 complete - SKILL.md plus Reference file, 1,897 lines)

Soccer intelligence covers 10 positions: GK, CB, FB, WB, CDM, CM, CAM, W, SS, and ST. Component KRs: AKR (Attack), DKR (Defense), TKR (Technical), PKR (Physical), and IQKR (Tactical IQ).

Offensive systems include Tiki-taka, Gegenpressing, Counter-Attack, Possession, Direct, and Low Block. League lambdas: Premier League = 1.000 (reference), La Liga, Bundesliga, Serie A, Ligue 1, MLS, Championship, and lower divisions.

The framework includes transfer market intelligence, loan system modeling, and youth academy pipeline analysis - reflecting the unique economics of global soccer.

### Baseball (v1 complete - SKILL.md plus Reference file, 1,980 lines)

Baseball intelligence uses a dual pipeline because hitters and pitchers are evaluated separately.

Hitter KRs: HKR (Hitting), PKR (Power/Plate Discipline), FKR (Fielding), SKR (Speed), and IQKR (Baseball IQ). Pitcher KRs: VKR (Velocity/Stuff), CKR (Command/Control), DKR (Durability), RKR (Repertoire), and IQKR (Pitching IQ).

Offensive systems: Launch Angle, Contact/Speed, Balanced, Small Ball, OBP-focused. League lambdas: MLB = 1.000 (reference), NPB, KBO, AAA, AA, High-A, Single-A.

The framework includes minor league development timeline modeling (3-5 year progression from draft through the minor leagues to MLB).

### Why This Proves the Architecture is Sport-Agnostic

All three additional sports use the identical intelligence architecture. The KR system, KLVN normalization, legend structure, system fit computation, and evaluation protocol transfer directly. Only the sport-specific content changes: positions, traits, systems, and lambdas.

This means the KaNeXT intelligence layer is not a basketball product that might work for other sports. It is a universal evaluation framework that happens to have launched with basketball first. Any sport with positions, skills, systems, and competitive levels can use this architecture.

---

## 45. How Intelligence Extends to All Institutions

The KaNeXT OS serves schools, churches, businesses, and sports programs. The intelligence layer is the differentiator - it is what makes KaNeXT an operating system rather than just another SaaS tool.

### The Universal Pattern

Every institution has people to evaluate, decisions to make, and resources to allocate:

- A **school** evaluates students (academic performance, engagement, risk), makes decisions (course placement, intervention, graduation requirements), and allocates resources (financial aid, tutoring, counseling).
- A **church** evaluates members (engagement, volunteer capacity, leadership potential), makes decisions (ministry placement, event planning, community outreach), and allocates resources (pastoral care, volunteer hours, budget).
- A **business** evaluates employees (performance, skill gaps, growth trajectory), makes decisions (hiring, promotion, team assignment), and allocates resources (compensation, training, project budgets).
- A **sports program** evaluates players (KR, component KRs, system fit), makes decisions (recruiting, roster construction, game planning), and allocates resources (scholarships, NIL, coaching time).

The basketball intelligence system is the most developed instance of this universal pattern. It proves that a structured evaluation framework with deterministic outputs, confidence transparency, and multi-level interpretation can produce actionable intelligence at scale. The same architecture - define traits, weight by role, anchor against reference standards, adjust for context, produce confidence-stamped outputs - applies to any domain.

### Intelligence Stays In-House

A critical strategic decision: the intelligence layer stays in-house at KaNeXT. Schools and institutions that sign Institutional Operating Agreements (IOAs) get the full KaNeXT OS - Hub, Agenda, KayTV, KayStudios, KayPay, and Nexus. But the intelligence engine (the evaluation protocols, the legends, the system fit computation, the simulation engine) remains proprietary to KaNeXT. Institutions benefit from the intelligence through Nexus without owning or replicating the underlying system.

This is the moat. The OS is valuable. The intelligence is irreplaceable.

---

# PART 9: GOVERNANCE AND REFERENCE

---

## 46. Core Governance Principles

Seven principles govern every output of the intelligence system. These are non-negotiable and apply to all modes, all levels, and all sports.

### 1. Deterministic

Same inputs produce the same outputs. No randomness, no editorial override, no discretion inside the engine. If you feed the system the same player data, the same Coach Context, and the same data tier, it will produce the identical KR every time.

### 2. Auditable

Every step is logged with inputs, outputs, confidence, and timestamps. The system produces an audit trail that shows exactly how it arrived at every number. Phase 3 anchor is logged alongside Phase 6 raw. Every interaction trace in the simulation shows which library entries were used. Every badge earned shows which gates were checked.

### 3. No Truth Mutation

Downstream engines NEVER modify upstream outputs. Player KR is locked when it is computed. Team KR cannot change Player KR. Simulation cannot change Team KR. Scouting reports cannot change simulation outputs. Development projections cannot change college KR. The truth flows in one direction: Player Evaluation produces Player KR, Team Intelligence consumes Player KR to produce Team KR, Simulation consumes both to produce projections, and so on.

### 4. Confidence Transparency

Every output includes a confidence percentage. The system is transparent about uncertainty. A KR with 85% confidence means something different than a KR with 55% confidence. The confidence does not change the KR math - it communicates how much you should trust the number.

### 5. No Data Fabrication

If data is missing, the trait or metric is UNSCORED. The system never guesses. At V1 data tier, 31 of 47 traits are NULL. The system acknowledges this and compensates through composite bounding and production anchoring. It does not invent numbers to fill the gaps.

### 6. Legend is Display-Only

Legend labels interpret KR values. They do not produce or modify KR values. The legend tells you what a KR of 85 means at D1 HM ("Reliable Bench / Rotation Contributor"). It does not make the KR 85. If the evaluation pipeline produces 85, that is the number, and the legend interprets it. No one edits the legend to make a player's tier label sound better.

### 7. KLVN Normalization

All cross-level comparisons use KLVN lambdas. A KR at one level means something specific at every other level through the Level Tier Map. The lambda normalizes inputs, not outputs. The KR is universal.

---

## 47. Confidence and Data Tiers

The intelligence system operates across four data tiers, each providing different levels of trait coverage and confidence.

### V1 - Box Score (Current Primary Tier)

**Available data:** Official stats (FGM/FGA, 3PM/3PA, FTM/FTA, REB, AST, STL, BLK, TO, PF, MPG, GP) plus derived advanced metrics (TS%, eFG%, Usage%, BPM, PER, ORTG, DRTG, AST/TO).

**Trait coverage:** 16 traits solidly scorable, 5 weak proxies, 31 NULL.

**Phase authority:** Phase 3 (production anchor) is primary. Phase 6 (trait math) is secondary - adjusts within the anchor range.

**Confidence range:** 45-55% for single-season box score. Up to 85-90% with multi-year, multi-level data and strong Tier 3 contextual inputs.

**What V1 can do well:** Produce honest KR ranges anchored against legends. Identify where a player fits in the hierarchy. Generate Level Tier Maps. Compare players at the same level. Flag strengths and weaknesses visible in counting stats.

**What V1 cannot do well:** Score individual defensive traits, IQ traits, or movement-based shooting traits. Distinguish between similar-stat players with very different skill profiles (two players averaging 15 PPG on 45% shooting may have completely different shot profiles).

### V1+ - Stats Plus Licensed Granular Data

**Available data:** V1 plus third-party play-type data (Synergy, equivalent). Actual usage, shot profiles (rim vs midrange vs three), possession-level efficiency by play type.

**Trait coverage:** 25-35 traits scored.

**Phase authority:** Shared between Phase 3 and Phase 6. The play-type data gives Phase 6 real signal for offensive traits.

**Confidence range:** 65-84%.

### V2 - PlayVision (1 Season)

**Available data:** KaNeXT-owned camera data. Full play-type tagging, usage tracking, matchup tracking, spatial data, defensive positioning, screen navigation tracking.

**Trait coverage:** 40-45 of 47 traits scored.

**Phase authority:** Phase 6 is primary. Phase 3 becomes a validation check.

**Confidence range:** 75-92%.

### V3 - PlayVision Deep (Multi-Season)

**Available data:** Multiple seasons of PlayVision data plus film archive. Trend analysis, seasonal comparison, opponent pattern recognition.

**Trait coverage:** 45-47 of 47 traits scored.

**Phase authority:** Phase 6 has full authority. Phase 3 is a minimal sanity check only.

**Confidence range:** 85-97%.

### Contextual Intelligence (Tier 3 Inputs)

Across all data tiers, Tier 3 contextual inputs can adjust interpretation:

- **Roster Context:** Teammate quality, number of viable offensive options, spacing quality.
- **Defensive Attention:** Is this player the primary scouting target? Confirmed by opposing coaching staff.
- **Role Suppression:** Is the player handling responsibilities far beyond their natural role?
- **Coach Direct Knowledge:** First-hand observation from a coach who has coached or scouted the player directly.
- **Scouting Confirmation:** Specific defensive or strategic behaviors confirmed by opposing coaching staffs.
- **Prospect Pedigree:** Verifiable recruiting history (McDonald's All-American nominee, ranked recruit, offer sheet).

Trust hierarchy: Tier 1 (box score) > Tier 2 (advanced metrics) > Tier 3 (contextual). Tier 3 cannot override Tier 1 data. Tier 3 can change the interpretation of Tier 1 data.

---

## 48. Glossary

Every term used in the KaNeXT Basketball Intelligence system, defined.

**Archetype:** A descriptive label classifying a player's basketball identity based on their trait profile. 26 archetypes organized in 6 categories. Does not change KR.

**Badge:** A certification of elite skill expression. Earned when Skill KR and specific trait scores exceed high thresholds. Provides small KR lift (+0.5 to +1.5). 34 total badges across 7 categories.

**Base KR:** The player's system-agnostic KR computed from traits, position weights, badges, and overrides. Does not include System Fit or System Risk adjustments. Same regardless of what system the coach selects.

**Base Truth:** Block 1 of the evaluation pipeline. Everything about the player that is system-independent: traits, component KRs, badges, archetypes, overrides, impact modifiers. Locked and immutable once computed.

**BPR (Basketball Performance Rating):** A per-game or per-season impact metric measuring actual on-court contribution relative to competition level. Zero-centered, level-normalized, clamped to [-10, +10]. BPR is an impact anchor that sanity-checks KR.

**Coach Context:** The binding environment for all evaluation. Includes program name, governing body, division, major class (if D1), offensive system, defensive system. Must be locked before any evaluation proceeds.

**Component KR:** One of four sub-ratings that compose the final KR: OKR (Offense), DKR (Defense), TKR (Tools), IQKR (IQ). Each on the 0-100 scale.

**Confidence (confidence_pct):** A number from 0-100 communicating evidence completeness and stability. Does not change KR math. Communicates how much to trust the output.

**Contextual Mode:** An evaluation mode for players who cannot be evaluated through the full trait pipeline due to extreme suppression or limited data. Produces a KR range with explicit uncertainty rather than a single number.

**Coverage Map:** A diagnostic showing which system demands are covered by which rotation players, and whether coverage is strong (top-5 player), fragile (bench-only), or absent.

**DKR (Defensive KR):** Component KR measuring total defensive ability. Includes POA Defense, Team Defense, and Rebounding clusters.

**DSIE (Defensive System Identification Engine):** Determines which of the 10 defined defensive systems a team runs.

**Entry KR:** A pro player's projected KR on Day 1 as a rookie. Most first-round picks have Entry KR 84-88 regardless of draft position.

**Final System Player KR:** The player's KR after both Base Truth (Block 1) and System Context (Block 2) are applied. This is the number used in Team KR computation.

**Fragility Flag:** A diagnostic identifying structural risks in a team's roster. Includes single-point failure, offensive/defensive concentration, depth fragility, and role overload.

**Impact Modifier:** A classification of HOW a player produces impact (Primary Engine, Secondary Engine, Force Multiplier, Specialist Anchor, or Unclassified). Does not alter KR.

**Interaction Library:** The lookup table containing 582 entries defining how basketball identities clash. Three parts: System x System (120), Offensive Archetype x Defensive System (210), Defensive Archetype x Offensive System (252).

**IQKR (IQ KR):** Component KR measuring basketball intelligence. Includes decision speed, shot selection, turnover quality, advantage conversion, role discipline, processing under pressure.

**KLVN:** The level normalization system. Uses lambda values (0-1) to normalize production inputs so trait scoring is comparable across competitive levels. D1 HM = 1.000. Lambda normalizes INPUTS, not KR OUTPUTS.

**KR (KaNeXT Rating):** The universal 0-100 player rating. The atomic unit of the intelligence system. Computed from 47 traits weighted by position, adjusted for system fit, modified by badges and overrides, checked against system risks.

**Lambda:** The KLVN normalization coefficient for a given competitive level. Higher lambda = harder competition. Range: 0.450 (HS/Prep) to 1.000 (D1 HM) for college. 0.550 (semi-pro) to 1.000 (NBA) for pro.

**Legend:** A display-only lookup table translating KR values into tier labels at a specific competitive level. 14 college legends, 1 pro legend. Legends interpret KR; they do not produce or modify it.

**Level Tier Map:** The output showing what a single KR means at every relevant competitive level. One player, one KR, multiple legend reads. One of the most valuable outputs for recruiting.

**Median Outcome:** The midpoint of the best-case (Scenario A) and worst-case (Scenario B) 3-year pro projections. What teams drafting #16-30 are buying.

**Missing Demands:** Diagnostic showing which system demands are uncovered or under-covered in the current rotation.

**OKR (Offensive KR):** Component KR measuring total offensive ability. Includes Shooting, Finishing, and Playmaking clusters.

**OPF (Overall Position Framework):** The position-specific weight distribution that determines how OKR, DKR, TKR, and IQKR combine into the final KR. Different for each of 5 positions at both college and pro levels.

**OSIE (Offensive System Identification Engine):** Determines which of the 12 defined offensive systems a team runs.

**Override:** A rare, rule-based KR modification capturing basketball realities not expressed by traits, archetypes, or badges. 8 college positive overrides (max 1 applies), 4 pro positive (max 1), 4 pro negative (always apply).

**Peak Ceiling:** The best realistic KR outcome by Year 3-5 of a pro career. What teams drafting #1-5 are buying.

**Phase 3 (Production Anchor):** The step in player evaluation where the player's production profile is mapped against legend tier descriptions to establish a KR anchor range. The primary KR determinant at V1 data tier.

**Phase 6 (Component KR Math):** The step in player evaluation where individual traits are scored, weighted by position, and composited into component KRs. Adjusts within Phase 3 anchor +/- 10 at V1. Gains authority at higher data tiers.

**Physical Environment Modifier:** An adjustment to player weights in Team KR computation based on how much their size amplifies impact at a specific competitive level. Adjusts weights, never Player KR.

**PTV (Player Total Value):** What a specific player is worth to a specific team. Team-specific, not a general market value.

**PMV (Player Market Value):** What the open market values a player at based on social following, exposure, and performance.

**Suppression:** When a player's statistics understate their true ability due to environmental factors. Four types: role suppression, system suppression, teammate suppression, injury suppression.

**System Context:** Block 2 of the evaluation pipeline. How the player fits within the coach's selected systems. Includes System Fit reweighting and System Risk penalties.

**System Demand Profile:** The list of archetypes each offensive and defensive system needs, classified as A (Critical), B (High), or C (Optional).

**System Fit:** A measure of how well a player's archetype and trait profile match the demands of a specific offensive and defensive system. Expressed as a percentage.

**System Fit%:** The team-level diagnostic showing how well the entire roster fits the selected systems. 90-100% = roster built for this system. Below 60% = system mismatch.

**System Risk:** A specific weakness that breaks or limits how a system functions at the team level. Three severities: Tier 1 Major (scheme-breaking), Tier 2 Major (scheme-limiting), Minor. 14 total system risks defined.

**TKR (Tools KR):** Component KR measuring physical tools. Includes height, length, strength, speed, lateral quickness, vertical pop, motor, endurance.

**TPQ (Team Performance Quality):** A single-game team performance metric on a 0-10 scale. 5.0 = performed as expected. Computed from four components: Result vs Expectation (40%), Efficiency Margin (30%), Control Factors (20%), Context Stakes (10%).

**Trait:** An individual measurable basketball skill or physical attribute. 47 traits organized in 8 clusters. Each scored on 0-100 or marked UNSCORED if data is insufficient.

**Trait Cluster:** A grouping of related traits: Shooting (6), Finishing (6), Playmaking (7), POA Defense (7), Team Defense (7), Rebounding (6), Tools (8), IQ (7).

**V1 / V1+ / V2 / V3:** Data tiers representing increasing data quality. V1 = box score. V1+ = play-type data. V2 = PlayVision (1 season). V3 = PlayVision (multi-season).

---

# APPENDIX A: V1 EVALUATION PROTOCOL - DETAILED MECHANICS

---

## A1. Composite Banding at V1

At V1 (box score), 31 of 47 traits are NULL. To prevent the OPF math from producing meaningless numbers, NULL traits are bounded using composite advanced metrics. Each composite is classified into bands (90/80/70/60/50) using level-specific thresholds.

### D1 HM Composite Bands (v0)

| Composite | Band 90 | Band 80 | Band 70 | Band 60 | Band 50 |
|---|---|---|---|---|---|
| Off BPM | +7.0+ | +4.0 to +6.9 | +1.5 to +3.9 | -0.5 to +1.4 | Below -0.5 |
| Def BPM | +4.0+ | +2.0 to +3.9 | 0.0 to +1.9 | -2.0 to -0.1 | Below -2.0 |
| Overall BPM | +9.0+ | +5.0 to +8.9 | +1.5 to +4.9 | -1.0 to +1.4 | Below -1.0 |
| Usage% | 28%+ | 23-27% | 18-22% | 14-17% | Below 14% |
| TS% | 62%+ | 58-61% | 54-57% | 50-53% | Below 50% |
| ORTG | 120+ | 112-119 | 104-111 | 96-103 | Below 96 |
| PER | 25+ | 20-24 | 15-19 | 11-14 | Below 11 |
| STL% | 3.0%+ | 2.2-2.9% | 1.5-2.1% | 0.8-1.4% | Below 0.8% |
| BLK% | 6.0%+ | 4.0-5.9% | 2.0-3.9% | 0.8-1.9% | Below 0.8% |

Other levels scale via KLVN lambda. These thresholds are v0 estimates that need calibration from actual stat distributions at each level.

### NULL Trait Bounding Formulas

**Offensive NULLs (Standard, USG% 20%+):**
Off_Bound = 0.50 x Band(Off BPM) + 0.30 x Band(USG%) + 0.20 x Band(TS%)

**Offensive NULLs (Low-usage, USG% below 20%):**
Off_Bound = 0.30 x Band(Off BPM) + 0.15 x Band(USG%) + 0.55 x Band(TS%)

The low-usage formula prevents TS%-efficient role players from being penalized by low usage that reflects role, not ability. A spot-up shooter with 14% usage and 63% TS% should not be dragged down by low usage.

**Defensive NULLs:**
Def_Bound = 0.50 x Band(Def BPM) + 0.30 x Band(STL%) + 0.20 x Band(BLK%)

**IQ NULLs:**
IQ_Bound = 0.40 x Band(Overall BPM) + 0.35 x Band(AST/TO) + 0.25 x Band(inverse TOV%)

**Tools NULLs (Speed, Lateral Quickness):**
Bounded by the average of the player's own scored Tools traits (Height, Length, Strength, Vertical Pop) plus or minus 3, capped by position ceilings. Center Speed cap: 78. Center Lateral Quickness cap: 76. PF Speed cap: 80. PF Lateral Quickness cap: 78. SF/SG/PG: no caps.

**Rebounding NULLs (Box Outs, Rebound Range, Hands/Secure):**
Bounded by average of Band(DRB%) and Band(ORB%).

Each NULL trait estimate equals the midpoint of the bounded range.

## A2. Proxy Confidence Weights

Each PROXY trait is blended with its cluster's composite bound. The blending formula:

Effective_Score = (Confidence_Weight x PROXY_Score) + ((1 - Confidence_Weight) x Composite_Bound_Midpoint)

TRUE traits: Confidence = 1.0 (no blending needed).
NULL traits: Confidence = 0.0 (full bound applies).

| Trait | Confidence | Notes |
|---|---|---|
| 3PT Spot-Up | 0.90 | 3P% directly measures shooting |
| Free Throw | 1.00 | TRUE score |
| Rim Pressure | 0.70 | FTA plus 2PA decent but includes non-rim 2PA |
| Foul Draw | 0.75 | FTA rate is strong signal |
| Advantage Creation | 0.50 | Blends multiple actions - directional only |
| Passing Vision | 0.40 | Heavily role/system dependent |
| Passing Execution | 0.40 | Same role dependency |
| Ball Security | 0.55 | Moderately reliable with usage adjustment |
| Deflections | 0.45 | STL does not equal deflections but correlated |
| Steal Timing | 0.40 | Same input as Deflections, redundant |
| Foul Discipline | 0.80 | PF/G is direct measurement |
| Rim Protection | 0.75 (big) / 0.40 (guard) | BLK/G strong for bigs, weak for guards |
| Defensive Rebounding | 0.85 | Direct measurement |
| Offensive Rebounding | 0.80 | Direct measurement, slight role discount |
| Height | 1.00 | TRUE |
| Length | 1.00 | TRUE (if available) |
| Strength | 0.55 | Weight is fact but strength does not equal weight |
| Vertical Pop | 0.55 (big) / 0.35 (guard) | BLK proxy better for bigs |
| Motor | 0.50 | Stocks capture activity but miss hustle plays |
| Endurance | 0.35 | MPG reflects coach decision as much as stamina |

## A3. Phase 6 Adjustment Method

Starting from Phase 3 midpoint, apply directional pressure from Phase 6. Each OPF component pushes UP or DOWN relative to expectations for a player at the Phase 3 midpoint, weighted by OPF percentage.

- Strong confirmed weaknesses push down harder
- Strong confirmed strengths push up
- Total adjustment bounded: maximum -10 from Phase 3 low, maximum +10 from Phase 3 high

Example walkthrough: Player with Phase 3 anchor 89-91 (midpoint 90). Phase 6 produces OKR 92, DKR 85, TKR 82, IQKR 88 at PG position. OKR is above expectation for an 89-91 player (pushes up), DKR is slightly below (pushes down), TKR is below (pushes down), IQKR is near midpoint (neutral). Net directional pressure is slightly downward. Final KR: 89. Within the anchor range, at the low end because defense and tools pull it down.

## A4. Confidence Caps by Data Coverage

| Trait Coverage | Confidence Cap |
|---|---|
| 40+ of 47 scored (V2/V3) | 85-97% |
| 25-39 scored (V1+/StatKeeper) | 65-84% |
| 16-24 scored (V1 box score) | 45-55% |
| Below 16 scored | Below 45% |

---

# APPENDIX B: SYSTEM DEMAND PROFILES - COMPLETE REFERENCE

---

## B1. Offensive System Demand Profiles (All 12)

Each offensive system lists archetypes by demand tier and the critical-missing risk if key demands are uncovered.

**1. Spread Pick-and-Roll**
- A (Critical): Pick-and-Roll Operator, Vertical Spacer (Rim Runner), Spot-Up Specialist (2+)
- B (High): Stretch Big, Connector Guard/Wing, 3-and-D Wing
- C (Optional): Secondary Creator Wing, Short-Roll Playmaker Big
- Critical-missing risk: No real PnR engine plus no roll/pop gravity equals empty possessions and late-clock pull-ups.

**2. 5-Out Motion**
- A: Connector Guard/Wing, Off-Ball Shooter (Movement), Slasher/Rim Pressure Wing, Stretch Big OR Small-Ball Big
- B: Spot-Up Specialist, Two-Way Wing
- C: Secondary Creator Wing, DHO/Handoff Hub
- Critical-missing risk: No connector plus no movement gravity equals "passing to nowhere," no advantage chain.

**3. Read and React**
- A: Connector Guard/Wing, Off-Ball Shooter (Movement), DHO/Handoff Hub, Slasher/Rim Pressure Wing
- B: Secondary Creator Wing, Two-Way Wing, Short-Roll Playmaker Big
- C: Spot-Up Specialist, Stretch Big
- Critical-missing risk: No decision-speed connectors equals turnovers plus stalled flow.

**4. Pace and Space**
- A: Primary Ball-Handler OR Pick-and-Roll Operator, Vertical Spacer, Spot-Up Specialist (2+)
- B: Slasher/Rim Pressure Wing, 3-and-D Wing, Connector Guard/Wing
- C: Stretch Big, Secondary Creator Wing
- Critical-missing risk: No rim pressure (slasher or rim runner) equals "air spacing" with no paint collapse.

**5. Dribble Drive**
- A: Primary Ball-Handler, Slasher/Rim Pressure Wing (2), Spot-Up Specialist (2+)
- B: Secondary Creator Wing, Vertical Spacer, Connector Guard/Wing
- C: Stretch Big
- Critical-missing risk: No true slasher pressure plus weak spacing equals drive lanes die, turnovers spike.

**6. Princeton**
- A: Post Hub/Facilitator Big OR Point Forward, Connector Guard/Wing, Off-Ball Shooter (Movement)
- B: Slasher/Rim Pressure Wing, Two-Way Wing
- C: Spot-Up Specialist, Secondary Creator Wing
- Critical-missing risk: No hub passer equals perimeter reversals with no trigger.

**7. Flex**
- A: Post Hub/Facilitator Big OR Post Scorer, Spot-Up Specialist (2), Connector Guard/Wing
- B: Off-Ball Shooter (Movement), Slasher/Rim Pressure Wing
- C: Secondary Creator Wing, Stretch Big
- Critical-missing risk: No post threat/hub equals flex actions do not force help; you get contested jumpers.

**8. Swing**
- A: Connector Guard/Wing, Spot-Up Specialist (2+), Secondary Creator Wing
- B: Two-Way Wing, Stretch Big
- C: Slasher/Rim Pressure Wing, DHO/Handoff Hub
- Critical-missing risk: No secondary creator equals ball reversals forever, cannot break set defense.

**9. Inside-Out (Post-Centric)**
- A: Post Scorer OR Post Hub/Facilitator Big, Spot-Up Specialist (2+), 3-and-D Wing
- B: Slasher/Rim Pressure Wing, Rebounding/Interior Enforcer
- C: Secondary Creator Wing, Stretch Big
- Critical-missing risk: No shooting around post equals doubles win; post touches become turnovers.

**10. Moreyball**
- A: Pick-and-Roll Operator, Vertical Spacer, Spot-Up Specialist (2+), 3-and-D Wing
- B: Stretch Big, Slasher/Rim Pressure Wing
- C: Secondary Creator Wing
- Critical-missing risk: Cannot generate rim/three volume (engine plus spacing plus rim gravity) equals math advantage disappears.

**11. Heliocentric**
- A: Primary Ball-Handler, Spot-Up Specialist (2+), 3-and-D Wing (2)
- B: Vertical Spacer OR Stretch Big, Secondary Creator Wing
- C: Connector Guard/Wing
- Critical-missing risk: No true engine equals system cannot exist; no spacers equals engine gets swarmed.

**12. Coach K**
- A: Off-Ball Shooter (Movement), Spot-Up Specialist (2+), Pick-and-Roll Operator, Slasher/Rim Pressure Wing, Vertical Spacer OR Stretch Big
- B: Connector Guard/Wing (2+), Secondary Creator Wing, Short-Roll Playmaker Big
- C: DHO/Handoff Hub, Point Forward
- Critical-missing risk: Without real three-volume gravity, rim pressure, at least one real engine, and connectors, the pace becomes empty quick shots and the motion turns into turnovers.

## B2. Defensive System Demand Profiles (All 10)

**1. Containment Man**
- A: Rim Protector Anchor, POA Defender Guard, Switchable Defender Wing
- B: Two-Way Wing, Rebounding/Interior Enforcer
- C: Small-Ball Big
- Critical-missing risk: No backline rim anchor equals blow-bys become layup lines.

**2. Pack Line**
- A: Rim Protector Anchor, Rebounding/Interior Enforcer, Two-Way Wing
- B: 3-and-D Wing, POA Defender Guard
- C: Switchable Defender Wing
- Critical-missing risk: If the anchor cannot protect without fouling OR you cannot rebound, the pack collapses.

**3. Pressure Man (Denial)**
- A: POA Defender Guard, Switchable Defender Wing, Energy Bench Spark
- B: Rim Protector Anchor, Two-Way Wing
- C: Small-Ball Big
- Critical-missing risk: Pressure without a backline eraser equals constant rim concessions.

**4. Switch Everything**
- A: Switchable Defender Wing (2+), Small-Ball Big, POA Defender Guard
- B: Two-Way Wing
- C: Rim Protector Anchor (optional)
- Critical-missing risk: If your 4/5 cannot survive switches, the identity breaks immediately.

**5. ICE / No-Middle**
- A: POA Defender Guard, Rim Protector Anchor, Two-Way Wing
- B: 3-and-D Wing, Rebounding/Interior Enforcer
- C: Switchable Defender Wing
- Critical-missing risk: If POA cannot angle/contain or low man rotations are weak, the scheme gets split.

**6. Zone (Structured)**
- A: Rim Protector Anchor, Rebounding/Interior Enforcer, Two-Way Wing
- B: 3-and-D Wing, POA Defender Guard (top pressure)
- C: Energy Bench Spark
- Critical-missing risk: Zone without rebounding dominance equals losing by extra possessions.

**7. Matchup Zone / Hybrid**
- A: Switchable Defender Wing, Two-Way Wing, Rim Protector Anchor
- B: POA Defender Guard, Energy Bench Spark
- C: Small-Ball Big
- Critical-missing risk: If wings cannot guard in space, it becomes scramble defense.

**8. Full-Court Press**
- A: Energy Bench Spark, POA Defender Guard, Switchable Defender Wing
- B: Rim Protector Anchor, Two-Way Wing
- C: Rebounding/Interior Enforcer
- Critical-missing risk: No rim protection behind press equals layup drill.

**9. Junk / Special**
- A: Specialist stopper (POA Defender Guard OR Switchable Defender Wing), Rim Protector Anchor
- B: Two-Way Wing, 3-and-D Wing
- C: Energy Bench Spark
- Critical-missing risk: No true stopper equals junk does not steal possessions.

**10. Coach K Defense**
- A: POA Defender Guard (2+), Rim Protector Anchor, Switchable Defender Wing (2+), 3-and-D Wing (2+)
- B: Energy Bench Spark, Rebounding/Interior Enforcer, Two-Way Wing
- C: Small-Ball Big, Junk/Special stopper variants, Matchup Zone-capable wing
- Critical-missing risk: Without denial/containment at POA to take away threes AND rim erasure behind it, the whole math identity fails; without multiple switchable wings, pressure turns into matchup hunting.

## B2. Defensive System Demand Profiles (10 Systems)

**1. Containment Man**
- A (Critical): POA Defender Guard, Two-Way Wing, Rim Protector Anchor
- B (High): Switchable Defender Wing, 3-and-D Wing
- C (Optional): Rebounding/Interior Enforcer, Energy Bench Spark
- Critical-missing risk: No rim protector equals help side collapses on drives. No POA defender equals ball-handlers get to their spots consistently.

**2. Pack Line**
- A (Critical): Rim Protector Anchor, Rebounding/Interior Enforcer, Two-Way Wing
- B (High): POA Defender Guard, Switchable Defender Wing
- C (Optional): 3-and-D Wing, Energy Bench Spark
- Critical-missing risk: No rim protector equals drives into packed paint still score. No rebounders equals second chances kill the defensive advantage.

**3. Pressure Man (Denial)**
- A (Critical): POA Defender Guard (2+), Switchable Defender Wing, Energy Bench Spark (depth required)
- B (High): Two-Way Wing, Rim Protector Anchor
- C (Optional): 3-and-D Wing, Rebounding/Interior Enforcer
- Critical-missing risk: No elite POA defenders equals pressure gets beaten off the dribble for easy baskets. No depth equals fatigue turns pressure into liability.

**4. Switch Everything**
- A (Critical): Switchable Defender Wing (3+), Small-Ball Big (Switch 5)
- B (High): Two-Way Wing, POA Defender Guard
- C (Optional): Rim Protector Anchor (only if they can switch), 3-and-D Wing
- Critical-missing risk: Any non-switchable defender breaks the entire scheme. Opponents will hunt the weakest switch repeatedly. Need 5 defenders who can guard 1-4.

**5. ICE / No-Middle**
- A (Critical): POA Defender Guard, Rim Protector Anchor, Two-Way Wing
- B (High): Switchable Defender Wing, Rebounding/Interior Enforcer
- C (Optional): 3-and-D Wing, Energy Bench Spark
- Critical-missing risk: No rim protector in drop coverage equals baseline drives finish at the rim. No strong POA defender equals ball-handler gets to the middle despite the ICE.

**6. Zone (Structured)**
- A (Critical): Rim Protector Anchor, Rebounding/Interior Enforcer, Two-Way Wing (length at the top)
- B (High): Switchable Defender Wing, 3-and-D Wing
- C (Optional): Energy Bench Spark, POA Defender Guard (less critical in zone)
- Critical-missing risk: No length at the top equals skip passes create open threes. No rim protector equals penetration through seams finishes at the basket.

**7. Matchup Zone / Hybrid**
- A (Critical): Switchable Defender Wing (2+), Rim Protector Anchor, POA Defender Guard
- B (High): Two-Way Wing, 3-and-D Wing
- C (Optional): Small-Ball Big, Energy Bench Spark
- Critical-missing risk: No high-IQ defenders equals coverage confusion between zone and man assignments. Opponent exploits the indecision.

**8. Press / Pressure Defense**
- A (Critical): POA Defender Guard (2+), Energy Bench Spark (3+, depth is non-negotiable), Two-Way Wing
- B (High): Switchable Defender Wing, Rim Protector Anchor
- C (Optional): 3-and-D Wing, Rebounding/Interior Enforcer
- Critical-missing risk: No depth equals fatigue collapses the press by the second half. No ball-pressure guards equals press is broken easily for layups.

**9. Junk / Special**
- A (Critical): POA Defender Guard (to face-guard the star), Rim Protector Anchor, Switchable Defender Wing
- B (High): Two-Way Wing, 3-and-D Wing
- C (Optional): Any defenders with IQ to execute both man and zone within the same possession
- Critical-missing risk: If secondary defenders cannot execute zone responsibilities while the best defender face-guards, the junk defense creates wide-open shots for non-stars.

**10. Coach K (Adaptive)**
- Demand profile mirrors whichever defensive system the coaching staff selects for a given game. Requires roster versatility to execute multiple systems.

---

# APPENDIX B2: COMPLETE COLLEGE OPF REFERENCE

---

## All Five Positions - College Level OPF Breakdown

### Point Guard (PG) - College
- OPF: OKR 56% / DKR 28% / TKR 10% / IQKR 6%
- OKR internal: Shooting 34%, Finishing 22%, Playmaking 44%
- DKR internal: POA Defense 60%, Team Defense 25%, Rebounding 15%
- TKR internal: Height 6%, Length 8%, Strength 10%, Speed 18%, Lateral Quickness 22%, Vertical Pop 8%, Motor 18%, Endurance 10%

### Shooting Guard (SG) - College
- OPF: OKR 58% / DKR 26% / TKR 12% / IQKR 4%
- OKR internal: Shooting 44%, Finishing 26%, Playmaking 30%
- DKR internal: POA Defense 55%, Team Defense 25%, Rebounding 20%
- TKR internal: Height 8%, Length 10%, Strength 10%, Speed 16%, Lateral Quickness 18%, Vertical Pop 10%, Motor 18%, Endurance 10%

### Small Forward (SF) - College
- OPF: OKR 52% / DKR 30% / TKR 14% / IQKR 4%
- OKR internal: Shooting 40%, Finishing 32%, Playmaking 28%
- DKR internal: POA Defense 40%, Team Defense 35%, Rebounding 25%
- TKR internal: Height 14%, Length 16%, Strength 14%, Speed 10%, Lateral Quickness 10%, Vertical Pop 10%, Motor 16%, Endurance 10%

### Power Forward (PF) - College
- OPF: OKR 44% / DKR 36% / TKR 18% / IQKR 2%
- OKR internal: Shooting 26%, Finishing 44%, Playmaking 30%
- DKR internal: POA Defense 20%, Team Defense 45%, Rebounding 35%
- TKR internal: Height 20%, Length 18%, Strength 18%, Speed 6%, Lateral Quickness 6%, Vertical Pop 10%, Motor 14%, Endurance 8%

### Center (C) - College
- OPF: OKR 34% / DKR 44% / TKR 20% / IQKR 2%
- OKR internal: Shooting 14%, Finishing 60%, Playmaking 26%
- DKR internal: POA Defense 10%, Team Defense 55%, Rebounding 35%
- TKR internal: Height 26%, Length 22%, Strength 20%, Speed 4%, Lateral Quickness 4%, Vertical Pop 10%, Motor 8%, Endurance 6%

## All Five Positions - Pro Level OPF Breakdown

### Point Guard (PG) - Pro
- OPF: OKR 58% / DKR 28% / TKR 5% / IQKR 9%
- Key shift from college: TKR drops 5pp (tools are table stakes), IQKR gains 3pp (decisions separate at elite level)

### Shooting Guard (SG) - Pro
- OPF: OKR 60% / DKR 28% / TKR 6% / IQKR 6%
- Key shift: TKR drops 6pp, IQKR gains 2pp, DKR gains 2pp

### Small Forward (SF) - Pro
- OPF: OKR 54% / DKR 32% / TKR 7% / IQKR 7%
- Key shift: TKR drops 7pp, DKR gains 2pp, IQKR gains 3pp

### Power Forward (PF) - Pro
- OPF: OKR 46% / DKR 40% / TKR 10% / IQKR 4%
- Key shift: DKR gains 4pp (rim protection critical at NBA level), TKR drops 8pp, IQKR gains 2pp

### Center (C) - Pro
- OPF: OKR 36% / DKR 48% / TKR 12% / IQKR 4%
- Key shift: DKR gains 4pp (centers are defensive anchors in NBA), TKR drops 8pp, IQKR gains 2pp

---

# APPENDIX C: IMPACT MODIFIERS - DETAILED REFERENCE

---

## C1. What Impact Modifiers Are

KR measures how much a player impacts winning. Impact Modifiers classify the MODE by which that impact is produced. KR answers magnitude. Impact Modifiers answer method. They do not alter KR values. They are classification labels consumed by System Demand Profiles, simulation, and scouting.

One modifier per player maximum. Evaluated in strict precedence order: Primary Engine, Secondary Engine, Force Multiplier, Specialist Anchor, then Unclassified.

## C2. The Four Modifier Types

### Primary Engine

A player whose offensive impact is structurally required for team function. Offense is organized around them. Removal produces a measurable structural drop.

Requirements (ALL must hold):
- ELS (Engine Load Score = 0.60 x USG + 0.40 x AST%) 24.0 or above
- SelfCreate% 45% or above
- TS% 52.0% or above
- TOV% 20.0% or below
- OnOff_Net +5.0 or above (OR +3.0 with ELS 26.0+)

Example: A point guard averaging 22 PPG, 7.5 APG, 28% usage, 55% TS%, with a +7.2 on/off swing. The offense fundamentally changes when he sits. This is a Primary Engine.

### Secondary Engine

A player who creates advantages but does not anchor the offense continuously. Creates in bursts or as a secondary option.

Requirements (ALL must hold):
- ELS between 18.0 and 23.9
- SelfCreate% 35% or above
- TS% 54.0% or above
- TOV% 22.0% or below
- OnOff_Net +3.0 or above

Example: A wing averaging 16 PPG, 4 APG, 22% usage, who creates offense in spurts and as a second option. The offense works without him but is clearly better with him.

### Force Multiplier

A player whose impact is driven by efficiency, spacing, defense, and connective play. Makes teammates better without needing the ball.

Requirements (ALL must hold):
- USG 22.0% or below
- TS% 56.0% or above
- OnOff_Net +5.0 or above
- At least 2 of 4 Multiplier Triggers:
  - Shooting Gravity: 3PAr 0.35+ AND 3P% 36.0%+ (OR 3PAr 0.45+ AND 3P% 34.0%+)
  - Rim/Foul Pressure: FTr 0.35+ (OR SelfCreate% 40+ AND FTr 0.25+)
  - Defensive Playmaking: STL% 2.0%+ OR BLK% 3.0%+
  - Rebound Leverage: REB% 15.0%+

Example: A 3-and-D wing averaging 11 PPG on 63% TS%, shooting 40% from three, with 2.5 SPG, and the team is +8.3 per 100 with him on the floor. He does not create offense but makes everyone around him better through spacing and defense.

### Specialist Anchor

A player whose impact is elite in one narrow domain and matchup-dependent. Dominates one thing.

Requirements (ALL must hold):
- USG 20.0% or below
- OnOff_Net +2.0 or above
- Exactly one Elite Signal:
  - Rim Protector Anchor: BLK% 6.0%+
  - POA Disruptor: STL% 3.0%+
  - Rebound Enforcer: REB% 20.0%+
  - Pure Spacer: 3PAr 0.55+ AND 3P% 38.0%+
  - Foul Magnet Finisher: FTr 0.50+

If 2+ Elite Signals are true, the player is not a Specialist Anchor - reroute to Force Multiplier evaluation.

---

# APPENDIX D: COACHING IMPACT MODIFIER

---

## D1. Purpose

The Coaching Impact Modifier (CIM) computes coaching-attributable player development residuals across all 8 trait clusters. It modifies development PROJECTIONS only - it never modifies Player KR, Team KR, traits, archetypes, or any upstream output.

## D2. How It Works

The CIM compares actual year-over-year trait development under a specific coach against the league-wide baseline expected development for players of the same age, position, and level.

**Baseline:** The average year-over-year trait movement for all players matching that demographic. Represents what should happen through natural maturation and standard training.

**Residual:** Actual development minus baseline. Positive means the player improved more than expected. Negative means less or regressed.

**Coach Impact Profile (CIP):** The aggregated residual across all player-seasons under a specific coach, weighted by minutes played. Produces an 8-value vector - one per trait cluster.

Example CIP: Shooting +4.2, Finishing +1.8, Playmaking +2.4, POA Defense +0.3, Team Defense +1.1, Rebounding -0.4, Tools +2.9, IQ +1.6. This coach is an excellent shooting developer (players improve shooting 4.2 points more than expected under them) and strong physical developer.

## D3. Evidence Thresholds

| Threshold | Minimum | If Below |
|---|---|---|
| Player-seasons under coach | 8 | CIM inactive - baseline only |
| Unique players | 4 | CIM inactive |
| Consecutive seasons per player | 2 | Player excluded |
| Minutes per player-season | 10 MPG, 15+ games | Player excluded |

### CIP Confidence Tiers

| Tier | Player-Seasons | Unique Players | Confidence | Blend |
|---|---|---|---|---|
| Low | 8-15 | 4-6 | 55-70% | 30% CIP / 70% baseline |
| Medium | 16-30 | 7-15 | 70-85% | 50% / 50% |
| High | 31-60 | 16-30 | 85-93% | 70% / 30% |
| Very High | 61+ | 31+ | 93-97% | 80% / 20% |

Baseline is never fully replaced. Even at Very High confidence, 20% baseline anchor remains.

## D4. Departure Analysis (Regression Detection)

When a player leaves Coach C and plays under Coach D, the system tracks what happens. A negative departure residual (player regressed after leaving) strengthens Coach C's CIP. A positive departure residual (player improved after leaving) weakens it.

Regression_Ratio = count(negative departure residuals) / count(all departures). Above 0.60 means strong coaching attribution - players consistently get worse when they leave. Below 0.40 means development was likely natural, not coach-driven.

## D5. Development Ratio

For each season-over-season Team KR change under a coach, the system separates returning player improvement from new player acquisition. Development_Ratio = Returning Player Contribution / Team KR Delta. Above 0.50 means the coach builds through development. Below 0.30 means the coach builds through portal/recruiting.

## D6. Application to Projections

When the Development Intelligence Engine projects a player's future development, it incorporates the CIP of the coach they are playing for:

Projected_Delta(cluster) = Baseline_Delta(age, position, level) + (CIP(coach, cluster) x Blend_Weight)

Diminishing returns apply: players with high current trait scores get less CIP boost. A player at 50 KR gets full CIP. A player at 75 gets 50%. A player at 90 gets 20%. All projections remain bounded by the hard rules: max +8 KR per cluster per year, max +15 over 3 years.

---

# APPENDIX E: LEGEND TIER EXAMPLES ACROSS LEVELS

---

## E1. What KR 85 Means at Every Level

To illustrate the Level Tier Map concept with a concrete example, here is what a KR of 85 means at every competitive level:

| Level | Lambda | Tier Label | Plain Language |
|---|---|---|---|
| NCAA D1 HM | 1.000 | Reliable Bench / Rotation Contributor | 6th-7th man on a ranked team. 15-20 MPG. |
| NCAA D1 MM | 0.958 | Solid Starter / Top-Five Rotation Lock | Firmly positive starter. 25+ MPG. All-Conference range. |
| NCAA D1 LM | 0.917 | High-Impact Starter / Core Winner | Primary reason teams win. Heavy minutes leader. |
| NCAA D2 | 0.875 | High-Impact Starter / Core Winner | Best player on most D2 teams. Conference POY range. |
| NJCAA D1 | 0.833 | Franchise Anchor | Program-defining talent. All-American lock. |
| NAIA | 0.810 | Franchise Anchor / Top All-American | Clear number-one option. Defines team success. |
| CCCAA | 0.765 | Elite National Standout | Dominant force in the CCCAA ecosystem. |
| NJCAA D2 | 0.750 | Elite National Standout | Overwhelms the level. |
| NCAA D3 | 0.667 | National-Level Force | Among the very best in all of D3. |
| NJCAA D3 | 0.625 | National-Level Force / Beyond Level | Exceeds what the level normally produces. |
| USCAA | 0.583 | Beyond Level Ceiling | Dominant beyond the level's capacity. |
| NCCAA D1 | 0.542 | Beyond Level Ceiling | Significantly above the competitive range. |
| NCCAA D2 | 0.500 | Beyond Level Ceiling | Far above the level. |

This single table communicates more than any scouting report. A coach at NAIA sees "franchise anchor" and knows this player would be their best player. A coach at D1 HM sees "rotation contributor" and knows this player would be their 7th man. Same player, same KR, completely different roles at different levels.

## E2. What KR 92 Means at Every Level

| Level | Tier Label | Plain Language |
|---|---|---|
| NCAA D1 HM | High-Impact Starter / Core Winner | Wins games. All-Conference caliber. Trusted late-game. |
| NCAA D1 MM | Franchise Anchor / Elite All-American | Team's identity built around this player. |
| NCAA D1 LM | National Player of the Year Candidate | Transcendent force at this level. |
| NCAA D2 | National Title Favorite Anchor | Program-orbiting force. |
| NAIA | Beyond Level Ceiling | Exceeds what NAIA competition normally produces. |

## E3. What KR 78 Means at Every Level

| Level | Tier Label | Plain Language |
|---|---|---|
| NCAA D1 HM | Limited Bench / Emergency Depth | Playable only under constraint. 5-10 MPG. |
| NCAA D1 MM | Situational Specialist | Matchup-dependent. 10-15 MPG. |
| NCAA D1 LM | Trusted Rotation / High-Minute Role Player | 20+ MPG in a defined role. |
| NCAA D2 | Solid Starter | Firmly positive starter value. 25+ MPG. |
| NAIA | High-Impact Starter / Core Winner | Primary reason strong teams win. |
| NJCAA D1 | High-Impact Starter | Heavy minutes leader. All-Conference lock. |
| CCCAA | Franchise Anchor | Best player on most teams. |

---

# APPENDIX F: SYSTEM x SYSTEM INTERACTION EXAMPLES

---

## F1. How System Interactions Work

When two teams play, their offensive and defensive systems interact to create a macro game environment. The Interaction Library captures these interactions as delta values that modify pace, shot profiles, turnover pressure, and foul rates.

### Example 1: Spread Pick-and-Roll vs Pack Line

- Pace: -2% (Pack Line slows the game)
- Shot Profile: Rim attempts -4pp (packed paint suppresses driving), Kick-out 3s +4pp (offense adjusts by shooting more threes), Midrange pull-ups +1pp
- Turnover Pressure: Neutral
- Foul Rate: -1pp

What this means in practice: The Pack Line defense takes away the PnR's primary weapon (rim pressure). The offense compensates by creating more three-point attempts through kick-outs. The game becomes a shooting contest rather than a driving contest. If the PnR team has elite shooters, they can beat the Pack Line. If they rely on rim finishing, the Pack Line wins.

### Example 2: Spread Pick-and-Roll vs Switch Everything

- Pace: -1%
- Shot Profile: Isolation pull-ups +3pp (offense hunts mismatches created by switches), Roll-man rim attempts -3pp (switching eliminates the roll)
- Turnover Pressure: +1pp
- Foul Rate: +1pp

What this means: Switching neutralizes the roll man (no advantage off the screen) but creates isolation mismatches. The PnR becomes an iso-creation machine rather than a roll-and-pop action. If the PnR team has a ball-handler who can attack mismatches in isolation, they thrive. If they depend on the roll man, they struggle.

### Example 3: Heliocentric vs Zone (Structured)

- Pace: -3%
- Shot Profile: Iso attempts -2pp (zone does not provide individual matchups to attack), Short-roll/high-post opportunities +3pp, Corner 3s +2pp
- Turnover Pressure: +2pp (heliocentric player forced to make decisions against zone reads, which are different from man reads)

What this means: Zone disrupts heliocentric offense because the star player cannot hunt individual matchups. The offense must adapt to find open shooters and short-roll opportunities. If the heliocentric player is also a great passer (like Jokic or Luka), the zone backfires. If the star is a pure scorer, the zone can work.

---

# APPENDIX G: MULTI-LEVEL PLAYER PROTOCOL

---

## G1. When It Activates

The Multi-Level Player Protocol activates when a player competes across multiple governing body levels in a single season. This commonly occurs at small schools that schedule games against opponents from different divisions (NCCAA teams playing D1, NAIA, and USCAA opponents in the same season).

## G2. Key Rules

**Never blend stats across levels.** Each level produces its own stat line. A player averaging 25 PPG against USCAA opponents and 12 PPG against D1 opponents has two separate data points, not an 18 PPG average.

**Tag each game with KLVN lambda.** Every game log is associated with the competition level of the opponent. Stats from D1 games are normalized at lambda 1.000. Stats from NCCAA games are normalized at lambda 0.542.

**Phase 3 anchor uses the most relevant level.** If the player has significant games at multiple levels, the Phase 3 anchor considers production at the highest level with sufficient sample size. Production at lower levels provides supporting evidence and ceiling context.

**Cross-Level Stat Divergence flags suppression.** If a player's assists, steals, or rebounds diverge 50%+ between their highest and lowest competition levels, this flags suppression at the higher level. The lower-level numbers may reflect true ability that higher-level context suppresses.

## G3. Founding Test Case: Laolu Kalejaiye

The Multi-Level Player Protocol was developed and validated through the evaluation of Laolu Kalejaiye at Lincoln University (NCCAA Independent). In a single season, Kalejaiye competed against D1, NAIA, USCAA, and NCCAA opponents.

His stat lines diverged dramatically by level: against lower competition, he produced 20+ PPG with 5+ APG; against D1 opponents, production compressed due to a massive team quality gap (approximately 66 KR teammates versus D1 competition). Every suppression indicator triggered: sole-threat suppression (confirmed by opposing D1 coaching staff), level mismatch (NCCAA team playing D1 games), role overload (sole ball handler AND primary scorer AND only perimeter threat), and cross-level stat divergence.

Additionally, Kalejaiye was playing on a compromised calcaneus (heel) fracture with zero professional rehabilitation - injury suppression on top of everything else. His 38 points and 12 threes against Pepperdine (D1) in a game where he hit shots from 25+ feet under full-court denial demonstrated that the visible production was significantly below true ability.

The protocol produced a KR range of 80-86 at home level with an effective KR of 85-90 in a system with adequate supporting cast - proving that the intelligence system can correctly evaluate players in the most extreme evaluation circumstances.

---

# APPENDIX H: CALIBRATION STATUS AND KNOWN GAPS

---

## H1. What Has Been Calibrated

**152+ college players across 7 teams** at D1 HM and D1 MM. All showed correct hierarchy, clean tier breaks, and legend labels matching reality. Zero rank inversions.

**12 pro players across 5 tiers** from Global Apex (Jokic, 98.5) through Core Contributor (Flagg, 86.4). Pro KR Legend tiers validated against all 12 - no tier breaks need adjustment.

**6 2026 draft prospects** with full pro transition projections: Dybantsa, Peterson, Boozer C., Acuff, Wagler, and Rob Martin.

**3 Contextual Mode founding test cases:** Acuff (D1 HM), Washington (D1 MM), and Kalejaiye (NCCAA multi-level).

**1 Kansas team evaluation** (Team KR approximately 88, Offense 85 / Defense 92) validated against actual 4-seed tournament placement.

## H2. Calibration Validation Method

The calibration process follows a specific method to ensure KR values match reality:

1. Evaluate each player on the roster independently using the V1 protocol.
2. Compare the resulting KR stack (ranked list of players by KR) against the actual rotation hierarchy observed in games.
3. Check that the star player has the highest KR, the starters are above bench players, and the bench hierarchy matches observed playing time.
4. Check that legend tier labels match observed roles. A player labeled "Solid Starter" should actually be a solid starter. A player labeled "Rotation Contributor" should actually be a bench player getting meaningful minutes.
5. Check that the Team KR computed from the individual player KRs produces a tier label consistent with the team's actual season performance (tournament team, bubble team, losing record, etc.).

If any rank inversion exists (a bench player rated above a starter, or a team labeled as a tournament contender when they are clearly rebuilding), the evaluation is reviewed and the source of error is identified. In all 152+ calibration cases, zero rank inversions were found.

## H3. Known Limitations

The V1 evaluation protocol operates on box-score data plus advanced composites. This means 31 of 47 traits are NULL and bounded by composite metrics rather than directly scored. The practical impact:

- Defensive evaluation is the weakest link because most defensive traits are UNSCORED at V1. DKR relies heavily on steals, blocks, and defensive BPM as proxies, which miss positioning, communication, and scheme execution.

- IQ evaluation is limited because most IQ traits require film analysis. IQKR at V1 relies on AST/TO ratio and shot selection proxies, which miss processing speed, read quality, and pressure performance.

- System fit computation is approximate because many of the traits that drive system-specific value (movement shooting, screen navigation, versatility) are UNSCORED at V1.

These limitations are disclosed through the confidence percentage. A V1 evaluation with 45-55% confidence tells the consumer "this rating has significant uncertainty due to limited data." As data tiers improve (V1+ through V3), these gaps close and confidence increases.

## H4. Future Calibration Priorities

1. Extend college calibration to D2, NAIA, NJCAA, CCCAA, USCAA, and NCCAA levels
2. Calibrate the Pro KR 82-85 (Role Player) tier with specific NBA players
3. Empirically calibrate composite band thresholds from actual stat distributions at each level
4. Test proxy confidence weights with role-conditional adjustments for primary ball-handlers
5. Calibrate pro lambdas from cross-league player movement data (50+ data points per lambda pair needed)
6. Formally incorporate aging curve patterns into Mode 6 development trajectory projections
7. Test Phase 3 plus or minus 10 window against a larger sample to determine if it should be tightened or widened

- Composite band thresholds (v0) need calibration from actual stat distributions at each level
- Proxy confidence weights are role-agnostic and may need role-conditional adjustment for primary ball-handlers
- Only tested at D1 HM and D1 MM - lower levels (D2, D3, NAIA, NJCAA, CCCAA, USCAA, NCCAA) need testing
- Phase 3 plus or minus 10 window is provisional
- Pro tier 82-85 (Role Player) not yet calibrated with specific players
- Pro lambdas are all v0 estimates needing empirical calibration from cross-league player movement data
- Aging curve insights should be formally incorporated into Mode 6 development projections
- International salary ranges are approximate and vary by team budget

---

# APPENDIX I: BPR v2 - COMPLETE COEFFICIENT REFERENCE

---

## I1. Base Coefficients (Per 100 Possessions)

| Stat | Base Coefficient | Notes |
|---|---|---|
| PTS | +0.027 | Raw scoring contribution |
| AST | +0.135 | Playmaking value |
| OREB | +0.100 | Second chance creation |
| DREB | +0.035 | Defensive possession end |
| STL | +0.170 | Highest value - creates live-ball turnovers |
| BLK | +0.100 | Rim deterrence plus possession end |
| TO | -0.135 | Lost possession value |
| PF | -0.040 | Foul cost (free throw attempts given) |
| FTA | +0.015 | Paint aggression signal |

## I2. Position Adjustment Multipliers

| Stat | PG | SG | SF | PF | C |
|---|---|---|---|---|---|
| AST | 0.85 | 1.00 | 1.15 | 1.25 | 1.30 |
| OREB | 1.30 | 1.25 | 1.10 | 0.95 | 0.85 |
| DREB | 1.25 | 1.15 | 1.00 | 0.90 | 0.80 |
| STL | 0.90 | 0.95 | 1.00 | 1.10 | 1.20 |
| BLK | 1.40 | 1.30 | 1.15 | 1.00 | 0.85 |
| PTS | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| TO | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| PF | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| FTA | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |

Logic: Assists from a center (multiplier 1.30) are more valuable than assists from a PG (0.85) because they are rarer and harder. Blocks from a PG (1.40) are more valuable than blocks from a center (0.85) because they indicate unusual perimeter disruption. Offensive rebounds from a guard (1.30) indicate elite motor.

## I3. Efficiency-Volume Interaction

Expected TS% by usage band:

| Usage Band | Expected TS% |
|---|---|
| 35%+ | 0.540 |
| 28-34% | 0.530 |
| 22-27% | 0.520 |
| 16-21% | 0.510 |
| Below 16% | 0.500 |

EV adjustment formula: ts_delta x usage_weight x 12, where usage_weight = (USG% / 25) to the power of 1.5. Clamped to [-3.0, +3.0].

## I4. Role Context Multipliers

| Role | Detection Criteria | Multiplier |
|---|---|---|
| Primary Creator | Usage 28%+ AND AST/G 3.0+ | 1.00 |
| Volume Scorer | Usage 28%+ AND AST/G below 3.0 | 0.95 |
| Secondary Creator | 20-27% usage AND AST/G 2.5+ | 1.05 |
| Efficient Role Player | Usage below 22% AND TS% 0.550+ | 1.10 |
| Defensive Anchor | BLK/G 2.0+ OR (STL/G 2.0+ AND RPG 7.0+) | 1.15 |
| Rebounder/Motor | OREB/G 2.5+ OR (RPG 10.0+ AND usage below 25%) | 1.10 |
| Specialist Shooter | 3P% 0.380+ AND 3PA/G 3.0+ AND usage below 25% | 1.10 |
| Low-Impact Role | Usage below 15% AND no specialist qualifier | 0.90 |

## I5. Minutes Credibility Factor

| MPG | Credibility Factor |
|---|---|
| 30+ | 1.00 (full credit) |
| 25-29 | 0.97 |
| 20-24 | 0.93 |
| 15-19 | 0.88 |
| 10-14 | 0.82 |
| 5-9 | 0.72 |
| Below 5 | 0.55 |

## I6. BPR Level Normalization Divisors

| Level | Lambda | BPR Normalization Divisor |
|---|---|---|
| NCAA D1 HM | 1.000 | 1.00 |
| NCAA D1 MM | 0.958 | 0.98 |
| NCAA D1 LM | 0.917 | 0.95 |
| NCAA D2 | 0.875 | 0.90 |
| NJCAA D1 | 0.833 | 0.85 |
| NAIA | 0.810 | 0.83 |
| CCCAA | 0.765 | 0.78 |
| NJCAA D2 | 0.750 | 0.77 |
| NCAA D3 | 0.667 | 0.70 |
| NJCAA D3 | 0.625 | 0.66 |
| USCAA | 0.583 | 0.62 |
| NCCAA D1 | 0.542 | 0.58 |
| NCCAA D2 | 0.500 | 0.55 |

Final BPR is clamped to [-10, +10] after normalization.

---

# APPENDIX J: PHYSICAL ENVIRONMENT MODIFIER - COMPLETE REFERENCE

---

## J1. Level Physical Profile Averages

These are the average heights and weights by position at each competitive level. Used to compute the Physical Environment Modifier in Team KR.

| Level | PG | SG | SF | PF | C |
|---|---|---|---|---|---|
| D1 HM | 6'2" 190 | 6'5" 205 | 6'7" 215 | 6'8" 230 | 6'10" 245 |
| D1 MM | 6'1" 185 | 6'4" 200 | 6'6" 210 | 6'7" 225 | 6'9" 235 |
| D1 LM | 6'0" 180 | 6'3" 195 | 6'5" 205 | 6'7" 220 | 6'8" 230 |
| D2 | 6'0" 178 | 6'3" 192 | 6'5" 202 | 6'6" 218 | 6'8" 228 |
| D3 | 6'0" 178 | 6'2" 190 | 6'4" 200 | 6'6" 215 | 6'8" 225 |
| NAIA | 5'11" 175 | 6'2" 188 | 6'4" 198 | 6'6" 212 | 6'7" 225 |
| NJCAA D1 | 6'1" 182 | 6'3" 195 | 6'5" 205 | 6'7" 220 | 6'8" 230 |
| NJCAA D2 | 5'11" 175 | 6'2" 188 | 6'4" 198 | 6'5" 210 | 6'7" 222 |
| NJCAA D3 | 5'10" 172 | 6'1" 185 | 6'3" 195 | 6'5" 208 | 6'6" 218 |
| CCCAA | 6'0" 178 | 6'2" 190 | 6'4" 200 | 6'6" 215 | 6'7" 222 |
| USCAA | 5'10" 170 | 6'1" 183 | 6'3" 193 | 6'5" 205 | 6'6" 215 |
| NCCAA D1 | 5'11" 175 | 6'2" 188 | 6'4" 198 | 6'5" 210 | 6'7" 222 |
| NCCAA D2 | 5'10" 172 | 6'1" 185 | 6'3" 195 | 6'4" 205 | 6'6" 215 |

## J2. Size-Dependent Trait Percentage by Position

Not all traits benefit from size. This table shows what percentage of each position's impact comes from size-dependent traits:

| Position | Size-Dep Offense % | Size-Dep Defense % |
|---|---|---|
| PG | 10% | 15% |
| SG | 15% | 20% |
| SF | 20% | 25% |
| PF | 30% | 35% |
| C | 40% | 45% |

Size-dependent traits: Finishing at rim, screen setting, post scoring, rebounding, roll finishing, rim protection, shot blocking, post defense, contest rate, deterrence.

Non-size-dependent traits (NOT modified): Shooting, ball handling, passing, decision-making, basketball IQ, lateral quickness, help positioning, communication.

## J3. Computation

Physical_Env_Mod = 1.0 + (Height_Delta_inches x 0.008) + (Weight_Delta_lbs x 0.001)

Bounded: minimum 0.92, maximum 1.12.

Example: A 7'1" 275 center at NAIA (average C: 6'7" 225):
- Height delta: +6 inches x 0.008 = +0.048
- Weight delta: +50 lbs x 0.001 = +0.050
- Physical_Env_Mod = 1.0 + 0.048 + 0.050 = 1.098
- This player's size-dependent traits are amplified by 9.8% at this level

Same player at D1 HM (average C: 6'10" 245):
- Height delta: +3 inches x 0.008 = +0.024
- Weight delta: +30 lbs x 0.001 = +0.030
- Physical_Env_Mod = 1.0 + 0.024 + 0.030 = 1.054
- Only 5.4% amplification at this level

The physical advantage is real at both levels but nearly twice as impactful at NAIA because the physical gap is larger. This correctly models reality: a huge center dominates NAIA games more than the same center dominates D1 HM games.

---

# APPENDIX K: COMPOSITE BAND THRESHOLDS (V0)

---

## K1. D1 HM Composite Bands

Used in Phase 6 to bound NULL traits. These are v0 estimates that need empirical calibration.

| Composite | Band 90 | Band 80 | Band 70 | Band 60 | Band 50 |
|---|---|---|---|---|---|
| Off BPM | +7.0+ | +4.0 to +6.9 | +1.5 to +3.9 | -0.5 to +1.4 | Below -0.5 |
| Def BPM | +4.0+ | +2.0 to +3.9 | 0.0 to +1.9 | -2.0 to -0.1 | Below -2.0 |
| Overall BPM | +9.0+ | +5.0 to +8.9 | +1.5 to +4.9 | -1.0 to +1.4 | Below -1.0 |
| Usage% | 28%+ | 23-27% | 18-22% | 14-17% | Below 14% |
| TS% | 62%+ | 58-61% | 54-57% | 50-53% | Below 50% |
| ORTG | 120+ | 112-119 | 104-111 | 96-103 | Below 96 |
| PER | 25+ | 20-24 | 15-19 | 11-14 | Below 11 |
| STL% | 3.0%+ | 2.2-2.9% | 1.5-2.1% | 0.8-1.4% | Below 0.8% |
| BLK% | 6.0%+ | 4.0-5.9% | 2.0-3.9% | 0.8-1.9% | Below 0.8% |

Other levels scale via KLVN lambda.

## K2. NULL Trait Bounding Formulas

**Offensive NULLs (standard, USG% 20%+):**
Off_Bound = 0.50 x Band(Off BPM) + 0.30 x Band(USG%) + 0.20 x Band(TS%)

**Offensive NULLs (low-usage, USG% below 20%):**
Off_Bound = 0.30 x Band(Off BPM) + 0.15 x Band(USG%) + 0.55 x Band(TS%)

The low-usage formula prevents TS%-efficient role players from being penalized by low usage that reflects role, not ability.

**Defensive NULLs:**
Def_Bound = 0.50 x Band(Def BPM) + 0.30 x Band(STL%) + 0.20 x Band(BLK%)

**IQ NULLs:**
IQ_Bound = 0.40 x Band(Overall BPM) + 0.35 x Band(AST/TO) + 0.25 x Band(inverse TOV%)

**Tools NULLs (Speed, Lateral Quickness):**
Bounded by the average of the player's own scored Tools traits (Height, Length, Strength, Vertical Pop) plus or minus 3, capped by position ceilings:
- Center: Speed cap 78, Lateral Quickness cap 76
- PF: Speed cap 80, Lateral Quickness cap 78
- SF/SG/PG: no caps

**Rebounding NULLs (Box Outs, Rebound Range, Hands/Secure):**
Bounded by average of Band(DRB%) and Band(ORB%).

Each NULL trait estimate = midpoint of bounded range.

## K3. Proxy Confidence Weights

Each PROXY trait is blended with its cluster's composite bound:

Effective_Score = (Confidence_Weight x PROXY_Score) + ((1 - Confidence_Weight) x Composite_Bound_Midpoint)

| Trait | Confidence Weight | Notes |
|---|---|---|
| 3PT Spot-Up | 0.90 | 3P% directly measures shooting |
| Free Throw | 1.00 | TRUE score |
| Rim Pressure | 0.70 | FTA plus 2PA decent but includes non-rim 2PA |
| Foul Draw | 0.75 | FTA rate is strong signal |
| Advantage Creation | 0.50 | Blends multiple actions - directional only |
| Passing Vision | 0.40 | Heavily role/system dependent |
| Passing Execution | 0.40 | Same role dependency |
| Ball Security | 0.55 | Moderately reliable with usage adjustment |
| Deflections | 0.45 | STL does not equal deflections but correlated |
| Steal Timing | 0.40 | Same input as Deflections, redundant |
| Foul Discipline | 0.80 | PF/G is direct measurement |
| Rim Protection | 0.75 (big) / 0.40 (guard) | BLK/G strong for bigs, weak for guards |
| Defensive Rebounding | 0.85 | Direct measurement |
| Offensive Rebounding | 0.80 | Direct measurement, slight role discount |
| Height | 1.00 | TRUE |
| Length | 1.00 | TRUE (if available) |
| Strength | 0.55 | Weight is fact but strength does not equal weight |
| Vertical Pop | 0.55 (big) / 0.35 (guard) | BLK proxy better for bigs |
| Motor | 0.50 | Stocks capture activity but miss hustle plays |
| Endurance | 0.35 | MPG reflects coach decision as much as stamina |

---

# END OF DOCUMENT

---

## Document Statistics

- **Total sections:** 48 main sections plus 11 appendices
- **Parts:** 9
- **Covers:** Player evaluation, team evaluation, game simulation, scouting, development, pro transition, all 14 college levels, all professional leagues worldwide, all 30 NBA teams, 12 NBA calibration players, 12 offensive systems, 10 defensive systems, 26 archetypes, 34 badges, 8 college overrides, 8 pro overrides, 14 system risks, 47 traits in 8 clusters, 5 positions at college and pro, BPR v2 (complete coefficients), TPQ v1, KLVN normalization, physical environment modifiers, composite band thresholds, proxy confidence weights, and 4 sports (basketball, football, soccer, baseball)
- **Version:** 1.0
- **Date:** March 2026
- **Source files:** SKILL.md v4, Files 01-06, BPR v2 Spec, TPQ v1 Spec, Pro KR Legend v2, Pro KR Calibration Reference v1, Pro Salary Framework v2, Pro League Registry v2, Pro KLVN Lambdas v2, Pro Team Registry NBA v2, 14 College KR Legend files (v4), KaNeXT Product Knowledge Base
- **Calibration:** 152+ college players across 7 teams, 12 NBA players across 5 tiers, zero rank inversions
- **For use by:** Nexus AI (internal reference), investors, coaches, scouts, analysts, and anyone asking about KaNeXT Basketball Intelligence
