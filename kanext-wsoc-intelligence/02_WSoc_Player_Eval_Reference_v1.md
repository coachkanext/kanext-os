# TACTICAL SYSTEM SET

TACTICAL SYSTEM SET -- Women's Soccer v1 (LOCKED)

Purpose
The Tactical System Set defines the valid offensive and defensive system selections available to coaches during Coach Context Setup. Identical to men's soccer system set. No evaluation, weighting, or normalization logic lives here. System trait weighting is governed by the System Fit docs.

Offensive Systems (14)
1. Tiki-Taka (Positional Play)
2. Gegenpressing (High Press Transition)
3. Counter-Attack (Direct Transition)
4. Possession (Build-Up Dominant)
5. Direct / Long Ball
6. Wing Play (Traditional Width)
7. Inside Forward / Inverted Wing
8. False 9 / Fluid Front
9. Target Man / Route One
10. Overlap / Underlap Width
11. Half-Space Exploitation
12. 3-2-5 Build-Up (Positional)
13. Heliocentric (Single Creator Hub)
14. Manager K

Defensive Systems (10)
1. High Press (Aggressive)
2. Mid-Block (Compact)
3. Low Block (Deep Defensive)
4. Gegenpressing (Counter-Press)
5. Man-Marking (Individual)
6. Zonal Marking (Positional)
7. Hybrid Press (Pressing Triggers)
8. Park the Bus (Ultra-Defensive)
9. Offside Trap (High Line)
10. Manager K

Note: All 14 offensive and 10 defensive systems are present in women's soccer. Some systems are more common at certain levels. Gegenpressing and High Press are particularly prevalent in NWSL and top college programs. Tiki-Taka and Positional Play are more common in WSL (Chelsea, Arsenal, Man City) and Liga F (Barcelona Femeni). Counter-Attack and Direct/Long Ball appear more frequently at lower college levels where technical quality is uneven.

Governance
System names must exactly match across all downstream docs. No aliases permitted.


---

# TRAIT LIBRARY

Trait Library -- Women's Soccer v1

KaNeXT Trait Clusters -- Canonical 8 (name set, identical to men's)
1. Shooting
   (includes finishing inside the box, long-range shooting, heading accuracy, first-time finishing, shot power/placement)
2. Chance Creation
   (includes through balls, key passes, crossing, progressive passing, final third entries, set piece delivery)
3. Dribbling & Carrying
   (includes progressive carries, 1v1 dribbling, close control, ball retention under pressure, transition carrying)
4. Defending (Individual)
   (includes tackling, 1v1 duels, aerial duels, interceptions, ball recovery, pressing intensity)
5. Defending (Collective)
   (includes positioning, cover shadow, defensive line discipline, pressing coordination, transition defense, set piece marking)
6. Distribution
   (includes short passing accuracy, long passing accuracy, switching play, build-up progression, passing under pressure, pass range)
7. Tools
   (includes height, weight, speed, acceleration, stamina, strength, agility, preferred foot versatility, injury resilience)
8. Tactical IQ
   (includes off-ball movement, pressing triggers, spatial awareness, role discipline, game management, set piece intelligence)

---

## Shooting Cluster -- Locked Traits (7)

### 1) Clinical Finishing (Inside Box)
Definition: Conversion of chances from inside the penalty area.
Inputs: Goals/Shot inside box, npxG overperformance, Shot volume inside box/90
- Women's Pro Top-League bands (WSL/NWSL, v0):
  - 90: conversion >= 16% AND >= 2.5 shots inside box/90
  - 80: 12-15% AND 1.8-2.4
  - 70: 9-11% AND 1.2-1.7
  - 60: 6-8% AND 0.6-1.1
  - <60: <6% or low volume
- Box-score mode: PROXY -- Inputs: G/90, shots/90, npxG/90. Score: round(0.60 x Band(G/Shot) + 0.40 x Band(npxG_overperf))

Note: Women's conversion rates are slightly lower on average than men's pro leagues due to pace/power differentials in shot generation. Bands calibrated accordingly.

### 2) Long-Range Shooting
Definition: Goals and shot quality from outside the penalty area.
Inputs: Goals from outside box/90, shots outside box/90, conversion rate
- Women's Pro Top-League bands (v0):
  - 90: >= 0.12 goals outside box/90 AND >= 1.2 shots outside/90 AND conversion >= 7%
  - 80: 0.08-0.11 G/90 AND 0.8-1.1 shots/90
  - 70: 0.04-0.07 G/90 AND 0.5-0.7 shots/90
  - 60: 0.02-0.03 G/90 AND 0.3-0.4 shots/90
  - <60: below thresholds
- Box-score mode: PROXY -- Inputs: total goals, total shots, shooting accuracy. Low confidence.

### 3) Heading Accuracy (Attacking)
Definition: Aerial goal threat from crosses, corners, and set pieces.
Inputs: Headed goals/90, aerial duels won % (attacking third), headed shot accuracy
- Women's Pro Top-League bands (v0):
  - 90: >= 0.10 headed goals/90 AND aerial win % >= 60% in attacking third
  - 80: 0.06-0.09 AND 50-59%
  - 70: 0.03-0.05 AND 40-49%
  - 60: 0.01-0.02 AND 30-39%
  - <60: below thresholds
- Box-score mode: PROXY -- aerial duels won + goals only

Note: Heading is less frequent in women's soccer due to average height differentials and ongoing concussion research. Aerial prowess remains valuable but the distribution of headed goals is lower than men's.

### 4) First-Time Finishing
Definition: Ability to score on first touch without taking a controlling touch.
Inputs: First-time shot conversion, first-time shots/90
- Requires event-level data (Opta/StatsBomb tags)
- Box-score mode: UNSCORED (null)

### 5) Penalty Taking
Definition: Conversion and composure from the penalty spot.
Inputs: Penalty conversion %, penalties taken (career volume)
- Women's pro bands (v0):
  - 90: >= 83% AND >= 15 career pens
  - 80: 76-82% AND >= 8 career pens
  - 70: 68-75% AND >= 4 career pens
  - 60: 58-67%
  - <60: below 58% or <= 2 pens

### 6) Shot Power & Placement
Definition: Ability to generate velocity and accuracy on strikes.
Inputs: Shot accuracy %, goals from driven shots vs placed shots
- Requires event-level data for shot type classification
- Box-score mode: PROXY -- shot accuracy % only (low confidence)

### 7) Free Kick Shooting
Definition: Direct free kick goal threat.
Inputs: FK goals/season, FK on target %, FK attempts/season
- Women's pro bands (v0):
  - 90: >= 2 FK goals/season AND on target >= 45%
  - 80: 1-2 FK goals AND on target >= 38%
  - 70: 1 FK goal AND on target >= 32%
  - 60: 0 FK goals AND on target >= 28%
  - <60: no FK goals AND < 28% on target

---

## Chance Creation Cluster -- Locked Traits (7)

### 1) Through Ball Delivery
Inputs: Through balls completed/90, through ball accuracy %, key passes from through balls/90
- Women's Pro Top-League bands (v0):
  - 90: >= 0.35 completed/90 AND accuracy >= 42%
  - 80: 0.24-0.34 AND 35-41%
  - 70: 0.15-0.23 AND 28-34%
  - 60: 0.07-0.14 AND 20-27%
  - <60: below thresholds
- Box-score mode: PROXY -- key passes/90, xA/90

### 2) Crossing Delivery
Inputs: Crosses completed/90, cross accuracy %, xA from crosses/90
- Women's Pro Top-League bands (v0):
  - 90: >= 2.2 completed/90 AND accuracy >= 32%
  - 80: 1.5-2.1 AND 26-31%
  - 70: 0.9-1.4 AND 20-25%
  - 60: 0.4-0.8 AND 15-19%
  - <60: below thresholds
- Box-score mode: PROXY -- assists from wide positions

### 3) Progressive Passing
Inputs: Progressive passes/90, pass completion in final third, xA from progressive sequences
- Women's Pro Top-League bands (v0):
  - 90: >= 6.5 progressive passes/90 AND final third completion >= 72%
  - 80: 5.0-6.4 AND 65-71%
  - 70: 3.5-4.9 AND 58-64%
  - 60: 2.0-3.4 AND 50-57%
  - <60: below thresholds

### 4) Key Passes
Inputs: Key passes/90, shot-creating actions/90
- Women's Pro Top-League bands (v0):
  - 90: >= 2.8 key passes/90 AND >= 4.5 SCA/90
  - 80: 2.0-2.7 AND 3.2-4.4
  - 70: 1.3-1.9 AND 2.2-3.1
  - 60: 0.7-1.2 AND 1.3-2.1
  - <60: below thresholds

### 5) Set Piece Delivery (Corners + Free Kicks)
Inputs: xA from set pieces/90, corner delivery accuracy, FK delivery quality
- Requires event-level data for full scoring
- Box-score mode: PROXY -- assists from set piece situations

### 6) Final Third Entries
Inputs: Final third entries/90 (carries + passes), progressive actions leading to final third
- Requires event-level or advanced stat tracking
- Box-score mode: UNSCORED

### 7) Build-Up Contribution
Inputs: Involvement in build-up sequences, touches in middle third, progressive pass reception
- Requires event-level data
- Box-score mode: PROXY -- pass completion %, touches if available

---

## Dribbling & Carrying Cluster -- Locked Traits (7)

### 1) Progressive Carrying
Inputs: Progressive carries/90, carry distance/90, successful carries %
- Women's Pro Top-League bands (v0):
  - 90: >= 5.0 progressive carries/90 AND success >= 72%
  - 80: 3.5-4.9 AND 65-71%
  - 70: 2.2-3.4 AND 58-64%
  - 60: 1.0-2.1 AND 50-57%
  - <60: below thresholds

### 2) 1v1 Dribbling
Inputs: Successful dribbles/90, dribble success %, dribbles in final third
- Women's Pro Top-League bands (v0):
  - 90: >= 3.8 successful dribbles/90 AND success >= 62%
  - 80: 2.6-3.7 AND 55-61%
  - 70: 1.5-2.5 AND 48-54%
  - 60: 0.7-1.4 AND 40-47%
  - <60: below thresholds

### 3) Close Control Under Pressure
Inputs: Pressure success rate, dispossessions/90 (inverse), ball retention under press
- Requires event-level data
- Box-score mode: UNSCORED

### 4) Ball Retention
Inputs: Dispossessions/90 (inverse), turnovers/90 (inverse), possession kept %
- Requires event-level or advanced tracking
- Box-score mode: PROXY -- from pass completion % and turnover data if available

### 5) Transition Carrying
Inputs: Carries in transition sequences, speed of carry in transition, progressive distance in transition
- Requires tracking data
- Box-score mode: UNSCORED

### 6) Foul Drawing
Inputs: Fouls drawn/90
- Women's Pro bands (v0):
  - 90: >= 3.0 fouls drawn/90
  - 80: 2.2-2.9
  - 70: 1.5-2.1
  - 60: 0.8-1.4
  - <60: below 0.8

### 7) Creativity Under Pressure
Inputs: Chance creation actions in tight spaces, key passes from high-pressure situations
- Requires event-level data
- Box-score mode: UNSCORED

---

## Defending (Individual) Cluster -- Locked Traits (7)

### 1) Tackling
Inputs: Tackles won/90, tackle success %, tackles in defensive third
- Women's Pro Top-League bands (v0):
  - 90: >= 3.2 tackles won/90 AND success >= 68%
  - 80: 2.3-3.1 AND 62-67%
  - 70: 1.5-2.2 AND 55-61%
  - 60: 0.8-1.4 AND 48-54%
  - <60: below thresholds

### 2) 1v1 Defensive Duels
Inputs: Defensive duel success %, ground duels won/90
- Requires event-level data for full breakdown
- Box-score mode: PROXY -- from tackles + fouls data

### 3) Aerial Duels (Defensive)
Inputs: Aerial duels won/90 in defensive third, aerial duel win %
- Women's Pro bands (v0):
  - 90: >= 3.5 won/90 AND win % >= 68%
  - 80: 2.5-3.4 AND 60-67%
  - 70: 1.5-2.4 AND 52-59%
  - 60: 0.8-1.4 AND 44-51%
  - <60: below thresholds

### 4) Interceptions
Inputs: Interceptions/90
- Women's Pro bands (v0):
  - 90: >= 2.5 interceptions/90
  - 80: 1.8-2.4
  - 70: 1.2-1.7
  - 60: 0.6-1.1
  - <60: below 0.6

### 5) Ball Recovery
Inputs: Ball recoveries/90, recovery location (high/mid/low)
- Women's Pro bands (v0):
  - 90: >= 8.0 recoveries/90
  - 80: 6.0-7.9
  - 70: 4.5-5.9
  - 60: 3.0-4.4
  - <60: below 3.0

### 6) Pressing Intensity
Inputs: Pressures/90, press success %, pressures in attacking/middle third
- Women's Pro bands (v0):
  - 90: >= 22.0 pressures/90 AND success >= 32%
  - 80: 17.0-21.9 AND 27-31%
  - 70: 12.0-16.9 AND 22-26%
  - 60: 7.0-11.9 AND 18-21%
  - <60: below thresholds

### 7) Blocks
Inputs: Blocks/90 (shots + passes blocked)
- Women's Pro bands (v0):
  - 90: >= 2.8 blocks/90
  - 80: 2.0-2.7
  - 70: 1.3-1.9
  - 60: 0.7-1.2
  - <60: below 0.7

---

## Defending (Collective) Cluster -- Locked Traits (7)

### 1) Defensive Positioning
- Requires tracking/event data
- Box-score mode: UNSCORED

### 2) Cover Shadow
- Requires tracking data (passing lane denial metrics)
- Box-score mode: UNSCORED

### 3) Defensive Line Discipline
- Requires tracking data (line height consistency, compactness)
- Box-score mode: PROXY -- team GA/match + clean sheet rate as rough proxy

### 4) Pressing Coordination
- Requires tracking data (press trap success, coordinated press timing)
- Box-score mode: UNSCORED

### 5) Transition Defense
Inputs: Defensive actions within 10 sec of possession loss, counter-attack xG conceded
- Requires event-level data
- Box-score mode: UNSCORED

### 6) Set Piece Marking
Inputs: Goals conceded from set pieces, aerial duels won from set pieces
- Box-score mode: PROXY -- from team set piece GA data

### 7) Communication / Organization
- Requires qualitative scouting assessment
- Box-score mode: UNSCORED

---

## Distribution Cluster -- Locked Traits (6)

### 1) Short Passing Accuracy
Inputs: Short pass completion %
- Women's Pro bands (v0):
  - 90: >= 92%
  - 80: 88-91%
  - 70: 84-87%
  - 60: 80-83%
  - <60: below 80%

### 2) Long Passing Accuracy
Inputs: Long pass completion %
- Women's Pro bands (v0):
  - 90: >= 72%
  - 80: 65-71%
  - 70: 58-64%
  - 60: 50-57%
  - <60: below 50%

### 3) Switching Play
Inputs: Switches/90, switch accuracy
- Requires event-level data
- Box-score mode: UNSCORED

### 4) Build-Up Progression
Inputs: Progressive passes from own/middle third, build-up involvement
- Women's Pro bands (v0):
  - 90: >= 7.0 progressive passes/90
  - 80: 5.5-6.9
  - 70: 4.0-5.4
  - 60: 2.5-3.9
  - <60: below 2.5

### 5) Passing Under Pressure
Inputs: Pass completion under pressure %, turnovers under pressure
- Requires event-level data
- Box-score mode: UNSCORED

### 6) Pass Range
- Qualitative assessment of variety (short, medium, long, lofted, driven)
- Box-score mode: UNSCORED

---

## Tools Cluster -- Locked Traits (9)

Women's-specific note: Physical benchmarks are calibrated to women's soccer norms. Height, weight, speed, and strength distributions differ meaningfully from men's. These bands reflect what is exceptional, average, and below-average within the women's game specifically.

### 1) Height
- Bands (women's soccer):
  - 90: >= 180cm (elite height for women's soccer, GK/CB advantage)
  - 80: 173-179cm
  - 70: 168-172cm (average for women's pro)
  - 60: 163-167cm
  - <60: below 163cm
- Position-adjusted: GKs and CBs weight height more heavily. Short wingers/CAMs are not penalized.

### 2) Weight / Build
- Bands are position-relative. No universal band. Evaluated as strength-to-weight ratio for position demands.

### 3) Sprint Speed
- Requires tracking data for absolute measurement
- Box-score mode: PROXY -- from scouting notes, counterattack involvement, recovery run frequency
- Qualitative bands (women's soccer):
  - Elite: consistently first to loose balls, outruns defenders in transition
  - Above average: noticeable pace advantage in most matchups
  - Average: keeps pace with opponents
  - Below average: regularly caught or outrun

### 4) Acceleration
- Requires tracking data
- Box-score mode: UNSCORED (separate from speed, measures burst over 0-5m)

### 5) Stamina
- PROXY from minutes/match average:
  - 90: >= 88 min/match average AND high-intensity actions sustained into final 15 min
  - 80: 82-87 min/match
  - 70: 75-81 min/match
  - 60: 65-74 min/match
  - <60: below 65 min/match or regularly subbed before 65'

### 6) Strength
- Requires tracking/physical testing data
- Box-score mode: PROXY -- from aerial duel win %, fouls drawn, ability to hold off defenders (qualitative)

### 7) Agility
- Requires tracking data
- Box-score mode: UNSCORED

### 8) Preferred Foot Versatility
- Bands:
  - 90: Truly two-footed (scores/assists/passes equally with both feet, verified)
  - 80: Strong weak foot (comfortable receiving, passing, and shooting with weaker foot)
  - 70: Adequate weak foot (can pass and receive but prefers strong foot for shooting)
  - 60: Limited weak foot (avoids weaker side when possible)
  - <60: One-footed (consistently cuts onto strong foot, predictable)

### 9) Injury Resilience
- PROXY from matches missed:
  - 90: 0-1 matches missed to injury in last 2 seasons
  - 80: 2-5 matches missed
  - 70: 6-10 matches missed
  - 60: 11-20 matches missed
  - <60: 20+ matches missed or recurring injury pattern
- ACL flag: Any prior ACL injury automatically caps Injury Resilience at 75 unless 2+ full seasons post-return without recurrence

---

## Tactical IQ Cluster -- Locked Traits (6)

### 1) Off-Ball Movement
- Requires event-level/tracking data
- Box-score mode: PROXY -- from goals scored relative to shot volume (efficiency suggests good positioning)

### 2) Pressing Trigger Recognition
- Requires event-level data
- Box-score mode: UNSCORED

### 3) Spatial Awareness
- Requires tracking data
- Box-score mode: UNSCORED

### 4) Role Discipline
- Qualitative scouting assessment
- Box-score mode: UNSCORED

### 5) Game Management
- Qualitative scouting assessment. Minutes managed, tempo control, situational awareness.
- Box-score mode: PROXY -- cards, late-game performance splits if available

### 6) Set Piece Intelligence
- From set piece offensive/defensive contribution
- Box-score mode: PROXY -- set piece goals + assists, team set piece record


---

# ARCHETYPE LIBRARY

Archetype Library -- Women's Soccer v1

Archetypes are identical to men's soccer in name and definition. Prevalence differs in women's game.

## Forward Archetypes (6)

### 1) Complete Forward
Definition: Scores, creates, presses, links play, aerially competitive. Can play as lone striker or alongside a partner. The most versatile forward archetype.
Women's prevalence: Common at top levels. Examples: Sophia Smith (USWNT), Vivianne Miedema (Man City), Kadidiatou Diani.
Key traits: Clinical Finishing >= 75, Key Passes >= 65, Pressing Intensity >= 68, Aerial Duels >= 60, Progressive Carrying >= 65

### 2) Poacher
Definition: Penalty-box predator. Lives on the shoulder of the last defender. Minimal build-up involvement but ruthless in the box.
Women's prevalence: Less common as a pure type in women's game. Many forwards asked to press and contribute more broadly.
Key traits: Clinical Finishing >= 82, Off-Ball Movement >= 80, First-Time Finishing >= 75 (if scored)

### 3) Target Man
Definition: Aerial focal point. Holds up play, wins headers, brings others into play through physicality.
Women's prevalence: Rare as a primary system identity due to average height profiles. Appears more in Direct/Wing Play systems.
Key traits: Heading Accuracy >= 78, Aerial Duels >= 78, Ball Retention >= 68, Strength >= 75

### 4) Pressing Forward
Definition: Leads the press from the front. Harasses defenders, forces turnovers, triggers the team's defensive press. Goals are secondary to pressing contribution.
Women's prevalence: Very common, especially in NWSL and top college programs where high-pressing systems dominate.
Key traits: Pressing Intensity >= 80, Stamina >= 78, Ball Recovery >= 65, Tackling >= 55

### 5) Shadow Striker
Definition: Operates between the lines. Arrives late in the box. Creates and scores from central pockets. Not a traditional #9.
Women's prevalence: Common. Many top women's forwards operate in this zone (Aitana Bonmati when pushed forward, Rose Lavelle).
Key traits: Off-Ball Movement >= 78, Clinical Finishing >= 72, Key Passes >= 70, Spatial Awareness >= 75

### 6) False 9
Definition: Drops deep to create overloads in midfield. Pulls CBs out of position. More creator than finisher.
Women's prevalence: Present at top tactical levels (Barcelona Femeni, Chelsea). Requires very high IQ.
Key traits: Key Passes >= 78, Progressive Passing >= 75, Ball Retention >= 78, Off-Ball Movement >= 80, Close Control >= 75

## Midfield Archetypes (8)

### 7) Regista
Definition: Deep-lying creative hub. Dictates tempo from deep. Elite passing range. Minimal defensive responsibility.
Key traits: Long Passing >= 82, Short Passing >= 85, Build-Up Progression >= 80, Spatial Awareness >= 78

### 8) Mezzala
Definition: Half-space midfielder. Carries forward, arrives in the box, combines creation with goalscoring from central positions.
Key traits: Progressive Carrying >= 75, Key Passes >= 70, Clinical Finishing >= 65, 1v1 Dribbling >= 68

### 9) Advanced Playmaker
Definition: #10 role. Creates from the final third. Vision and passing are primary weapons. Less physical than a Mezzala.
Key traits: Key Passes >= 80, Through Ball Delivery >= 75, Progressive Passing >= 78, Spatial Awareness >= 78

### 10) Box-to-Box Engine
Definition: Covers ground in both directions. Tackles, runs, passes, and occasionally scores. The workhorse.
Women's prevalence: Extremely common. NWSL and WSL heavily favor this profile.
Key traits: Stamina >= 82, Tackling >= 70, Progressive Carrying >= 65, Pressing Intensity >= 72, Ball Recovery >= 68

### 11) Destroyer
Definition: Pure defensive midfielder. Breaks up play, shields the backline, wins duels. Minimal creative responsibility.
Key traits: Tackling >= 82, Interceptions >= 78, Aerial Duels >= 70, Ball Recovery >= 78, Pressing Intensity >= 72

### 12) Deep-Lying Playmaker
Definition: Hybrid between Regista and Destroyer. Defends AND distributes. The metronome.
Key traits: Short Passing >= 80, Tackling >= 68, Interceptions >= 68, Build-Up Progression >= 75

### 13) Wide Playmaker
Definition: Operates from wide positions but as a creator rather than a dribbler. Crosses, switches play, delivers set pieces.
Key traits: Crossing Delivery >= 78, Key Passes >= 72, Set Piece Delivery >= 70, Progressive Passing >= 70

### 14) Half-Space Operator
Definition: Finds and exploits half-space channels. Combines late runs, one-two passing, and positional intelligence.
Key traits: Off-Ball Movement >= 78, Key Passes >= 72, Progressive Carrying >= 68, Spatial Awareness >= 78

## Defensive Archetypes (8)

### 15) Ball-Playing CB
Definition: Comfortable on the ball. Starts attacks from deep. Progressive passing and carrying out from the back.
Women's prevalence: Increasingly important as top programs demand build-up from the back.
Key traits: Short Passing >= 78, Long Passing >= 72, Build-Up Progression >= 70, Progressive Carrying >= 60, Tackling >= 70

### 16) Stopper CB
Definition: Aggressive, front-foot defender. Wins duels, heads everything, physically dominant. Less comfortable distributing.
Key traits: Tackling >= 80, Aerial Duels >= 80, Strength >= 75, Interceptions >= 70

### 17) Sweeper/Cover CB
Definition: Reads the game, covers space behind the line, intercepts through balls. Positional excellence.
Key traits: Interceptions >= 78, Defensive Positioning >= 80, Spatial Awareness >= 78, Sprint Speed >= 65

### 18) Overlapping Fullback
Definition: Provides width in attack by overlapping the winger. Crosses, gets to the byline, joins the attack.
Key traits: Crossing Delivery >= 70, Stamina >= 80, Sprint Speed >= 72, Progressive Carrying >= 65

### 19) Inverted Fullback
Definition: Tucks inside to form a double pivot or occupy half-spaces in possession. Build-up focused.
Key traits: Short Passing >= 78, Build-Up Progression >= 72, Spatial Awareness >= 72, Tackling >= 65

### 20) Wing-Back
Definition: Full-flank coverage. Attacks and defends the entire wing. Requires elite stamina.
Key traits: Stamina >= 85, Crossing Delivery >= 68, Sprint Speed >= 72, Tackling >= 65, Progressive Carrying >= 65

### 21) Sweeper Keeper
Definition: Commands the area behind a high defensive line. Sweeps through balls, distributes, acts as an extra defender.
Key traits: Actions Outside Box/90 >= 1.0, Distribution Accuracy >= 72, Positioning >= 80

### 22) Shot-Stopper
Definition: Stays on the line. Elite reflexes and saving ability. Less comfortable sweeping or distributing.
Key traits: PSxG overperformance >= +3.0, Save % >= 72%, Reflexes >= 80

## Hybrid/Specialist Archetypes (6)

### 23) Traditional Winger
Definition: Hugs the touchline, beats defenders 1v1, delivers crosses. Width provider.
Key traits: 1v1 Dribbling >= 78, Crossing Delivery >= 72, Sprint Speed >= 72

### 24) Inverted Winger
Definition: Starts wide, cuts inside onto stronger foot. Scores rather than crosses. Half-space penetrator from wide positions.
Women's prevalence: Very common. Many top women's forwards operate as inverted wingers.
Key traits: 1v1 Dribbling >= 75, Clinical Finishing >= 72, Progressive Carrying >= 70, Cut-Inside frequency (qualitative)

### 25) Inside Forward
Definition: Wide position but primary function is goalscoring. Runs in behind, arrives in the box, finishes.
Key traits: Clinical Finishing >= 78, Off-Ball Movement >= 75, Sprint Speed >= 72

### 26) Heliocentric Creator
Definition: The single player through whom 35%+ of the team's creative output flows. System architect.
Women's examples: Aitana Bonmati at Barcelona, Sam Kerr at peak (Chelsea).
Key traits: Key Passes >= 85, Progressive Passing >= 82, Through Ball Delivery >= 78, xA >= 0.35/90

### 27) Carrier (Transition Specialist)
Definition: Primarily creates through carrying the ball at speed in transition. Less about passing, more about direct dribbling progression.
Key traits: Progressive Carrying >= 82, Sprint Speed >= 75, 1v1 Dribbling >= 78, Transition Carrying >= 78

### 28) Set Piece Specialist
Definition: Player whose primary impact comes from set piece delivery (corners, free kicks). Often a secondary archetype.
Key traits: Set Piece Delivery >= 82, Crossing Delivery >= 75, Free Kick Shooting >= 72


---

# TACTICAL SYSTEM DEMAND PROFILES

TACTICAL SYSTEM DEMAND PROFILES -- Women's Soccer v1 (LOCKED)

Identical structure to men's soccer. A = Critical demand (system fails without it), B = High (significant value), C = Optional (nice to have). Each system lists the archetypes that fill its demands.

OFFENSE -- Tactical System Demand Profiles (14)

### 1) Tiki-Taka (Positional Play)
A: Regista; Ball-Playing CB (2); Mezzala; Advanced Playmaker; Inverted Fullback
B: False 9; Half-Space Operator; Deep-Lying Playmaker
C: Box-to-Box Engine; Wide Playmaker
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no press-resistant build-up from back = possession turns over in dangerous areas. No creative hub in midfield = sterile possession.

### 2) Gegenpressing (High Press Transition)
A: Pressing Forward; Box-to-Box Engine (2); Mezzala; Complete Forward OR Inside Forward
B: Destroyer; Ball-Playing CB; Overlapping Fullback
C: Inverted Winger; Stopper CB
Ideal Impact Modifiers: Primary Engine OR Secondary Engine; Force Multiplier
Critical-missing risk: no pressing forward + no high-stamina midfield = press dies after 60 minutes. Recovery pace insufficient = counter-exposed.

### 3) Counter-Attack (Direct Transition)
A: Inverted Winger OR Traditional Winger (pace); Poacher OR Shadow Striker; Destroyer; Deep-Lying Playmaker
B: Box-to-Box Engine; Stopper CB
C: Overlapping Fullback
Ideal Impact Modifiers: Specialist Anchor (pace); Force Multiplier
Critical-missing risk: no pace on the break = transitions die. No ball-winner to trigger = can't win possession in dangerous areas.

### 4) Possession (Build-Up Dominant)
A: Regista; Ball-Playing CB; Mezzala; Advanced Playmaker
B: Inverted Fullback; False 9; Wide Playmaker
C: Overlapping Fullback; Pressing Forward
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no progressive passer from deep = sterile possession. No movement ahead of the ball = passing sideways.

### 5) Direct / Long Ball
A: Target Man; Stopper CB; Box-to-Box Engine; Traditional Winger
B: Overlapping Fullback; Poacher (second striker); Destroyer
C: Deep-Lying Playmaker
Ideal Impact Modifiers: Specialist Anchor (aerial); Force Multiplier
Critical-missing risk: no target man = long balls go nowhere. No runners off second balls = direct play without purpose.

### 6) Wing Play (Traditional Width)
A: Traditional Winger (2); Overlapping Fullback (2); Target Man OR Complete Forward
B: Box-to-Box Engine; Deep-Lying Playmaker
C: Stopper CB; Poacher
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (crossing)
Critical-missing risk: no crossers = width is wasted. No aerial threat = crosses go to nobody.

### 7) Inside Forward / Inverted Wing
A: Inverted Winger (2); Overlapping Fullback (2); Complete Forward OR Poacher
B: Mezzala; Regista; Ball-Playing CB
C: Shadow Striker; Pressing Forward
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no inverted wingers = system identity doesn't exist. No overlapping FBs = no width, easy to defend narrow.

### 8) False 9 / Fluid Front
A: False 9; Inside Forward (2); Mezzala; Inverted Fullback
B: Regista; Ball-Playing CB; Half-Space Operator
C: Box-to-Box Engine; Wide Playmaker
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no false 9 = no dropping movement to pull CBs. No runners in behind = dropping forward with nobody filling the space.

### 9) Target Man / Route One
A: Target Man; Box-to-Box Engine; Traditional Winger; Stopper CB; Destroyer
B: Overlapping Fullback; Poacher; Shadow Striker
C: Deep-Lying Playmaker
Ideal Impact Modifiers: Specialist Anchor (aerial); Force Multiplier
Critical-missing risk: no aerial dominance = entire system fails. No second ball winners = isolated target man.

### 10) Overlap / Underlap Width
A: Overlapping Fullback (2) OR Wing-Back (2); Inside Forward OR Inverted Winger; Mezzala
B: Ball-Playing CB; Regista; Complete Forward
C: Traditional Winger; Box-to-Box Engine
Ideal Impact Modifiers: Force Multiplier; Primary Engine
Critical-missing risk: no attacking FBs/WBs = no overlap/underlap trigger. No inverted forward cutting in = FBs overlap into dead space.

### 11) Half-Space Exploitation
A: Half-Space Operator (2); Inverted Fullback; Regista; False 9 OR Shadow Striker
B: Box-to-Box Engine; Ball-Playing CB; Inverted Winger
C: Wide Playmaker; Mezzala
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no half-space specialists = exploitation doesn't happen. No width manipulation = half-spaces stay congested.

### 12) 3-2-5 Build-Up (Positional)
A: Ball-Playing CB (2-3); Inverted Fullback; Regista; Mezzala; Wing-Back (2)
B: False 9; Advanced Playmaker; Half-Space Operator
C: Complete Forward; Wide Playmaker
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no ball-playing CBs who can step into midfield = 3-2 build-up collapses. No wing-backs with crossing AND defensive recovery = exposed on transition.

### 13) Heliocentric (Single Creator Hub)
A: Heliocentric Creator; Inside Forward (2); Destroyer; Overlapping Fullback (2)
B: Poacher; Shadow Striker; Stopper CB
C: Box-to-Box Engine
Ideal Impact Modifiers: Primary Engine (mandatory -- the heliocentric creator); Force Multiplier
Critical-missing risk: no true heliocentric engine = system cannot exist. No finishers around the creator = creation without conversion.

### 14) Manager K
Identity: Ultra-high pressing intensity + positional play build-up + direct vertical progression + selective pressing triggers + inverted fullbacks / wing-backs in build-up + wide overloads in final third.
A: Ball-Playing CB (2); Inverted Fullback; Regista OR Deep-Lying Playmaker; Inside Forward OR Inverted Winger; Complete Forward OR Pressing Forward; Box-to-Box Engine OR Mezzala
B: Wing-Back; Half-Space Operator; Shadow Striker
C: Traditional Winger; Overlapping Fullback
Ideal Impact Modifiers: Primary Engine OR Secondary Engine (must have one); Force Multiplier (2+)
Critical-missing risk: if you don't have (1) press-resistant build-up from the back and (2) vertical progression through midfield, possession becomes sterile; if you don't have (3) wide overloads in the final third and (4) a clinical finisher, creation doesn't convert.


DEFENSE -- Tactical System Demand Profiles (10)

### 1) High Press (Aggressive)
A: Pressing Forward; Box-to-Box Engine; Destroyer; Ball-Playing CB
B: Wing-Back; Inside Forward; Mezzala
C: Stopper CB
Critical-missing risk: no pressing forward to lead the press = press lacks a trigger. Insufficient stamina across midfield = press fades, game becomes open.

### 2) Mid-Block (Compact)
A: Stopper CB; Sweeper/Cover CB; Deep-Lying Playmaker; Box-to-Box Engine
B: Destroyer; Inverted Winger (tracks back)
C: Overlapping Fullback; Traditional Winger
Critical-missing risk: no compact midfield pair = gaps between lines. No disciplined shape = mid-block becomes porous.

### 3) Low Block (Deep Defensive)
A: Stopper CB (2); Destroyer; Overlapping Fullback (defensive); Sweeper/Cover CB
B: Box-to-Box Engine; Target Man (hold-up on transition)
C: Traditional Winger (counter-pace)
Critical-missing risk: no aerial dominance in the box = set pieces and crosses kill you. No counter-attack pace = sitting deep with no way out.

### 4) Gegenpressing (Counter-Press)
A: Pressing Forward; Box-to-Box Engine (2); Mezzala; Inverted Winger
B: Destroyer; Ball-Playing CB
C: Overlapping Fullback
Critical-missing risk: same as High Press but with emphasis on immediate regain -- no counter-pressing intensity within 5 seconds of loss = transition defense exposed.

### 5) Man-Marking (Individual)
A: Stopper CB; 1v1 Defensive Duels specialists across positions; Destroyer
B: Box-to-Box Engine; Overlapping Fullback
C: Sweeper/Cover CB (insurance)
Critical-missing risk: one player beaten = entire structure collapses. No cover behind man-markers = goals from individual errors.

### 6) Zonal Marking (Positional)
A: Sweeper/Cover CB; Deep-Lying Playmaker (positional); Box-to-Box Engine; Role-disciplined fullbacks
B: Ball-Playing CB; Destroyer
C: Pressing Forward (pressing triggers)
Critical-missing risk: poor spatial awareness = zones left empty. No communication = runners between zones unchecked.

### 7) Hybrid Press (Pressing Triggers)
A: Pressing Forward (lead trigger); Destroyer; Mezzala OR Box-to-Box Engine; Ball-Playing CB
B: Inside Forward (counter-pressing); Stopper CB
C: Overlapping Fullback
Critical-missing risk: no clear trigger recognition = press is random, not coordinated. No recovery pace behind = trigger press with no safety net.

### 8) Park the Bus (Ultra-Defensive)
A: Stopper CB (2); Sweeper/Cover CB; Destroyer (2)
B: Overlapping Fullback (defensive); Box-to-Box Engine
C: Target Man (outlet)
Critical-missing risk: no aerial dominance = crosses into the box cause chaos. No outlet whatsoever = pressure becomes constant.

### 9) Offside Trap (High Line)
A: Ball-Playing CB (2); Sweeper Keeper; Destroyer
B: Stopper CB (recovery pace); Pressing Forward (triggers)
C: Box-to-Box Engine
Critical-missing risk: no sweeper keeper = balls over the top kill you. CBs without pace = offside trap broken, 1v1 with keeper.

### 10) Manager K
Identity: Selective pressing with defined triggers + mid-block recovery shape + high defensive line + offside trap elements + aggressive counter-pressing within 5 seconds of loss.
A: Pressing Forward; Destroyer OR Deep-Lying Playmaker; Box-to-Box Engine; Ball-Playing CB (2); Sweeper Keeper
B: Mezzala; Inside Forward (counter-pressing); Stopper CB
C: Overlapping Fullback; Traditional Winger
Critical-missing risk: if defenders lack pace for high line = offside trap breaks constantly; if no counter-pressing intensity in first 5 seconds = transitions against are lethal; if keeper doesn't sweep = balls behind the line are goals.


---

# BADGES

BADGE CAP & EFFECT SPEC -- Women's Soccer v1 (36 Badges)

Badge Tiers:
- Bronze: Skill KR >= 90 AND relevant trait(s) >= 90. KR lift: +0.5
- Silver: Skill KR >= 94 AND relevant trait(s) >= 94. KR lift: +1.0
- Gold: Skill KR >= 97 AND relevant trait(s) >= 97. KR lift: +1.5
- Total badge lift cap: +3.5 KR

(Badge list identical to men's soccer - 36 badges across all 8 clusters + GK. See men's File 02 for complete badge definitions. All badge names, gates, and lift values are the same. The trait scoring bands that feed into badge gates differ per the women's-specific trait bands above.)


---

# OVERRIDES

OVERRIDES -- Women's Soccer v1

Override triggers capture rare football realities not fully expressed by traits, archetypes, or badges.

## Positive Overrides (max 1 applies)

### 1) Generational Athlete (+5.0 KR)
Trigger: Player demonstrates physical tools so rare that positional norms do not apply within women's soccer. Pace, power, and agility combination that warps defensive structures by mere presence.
Gate: TKR >= 95 AND at least 2 physical traits >= 95

### 2) Dual-Threat Captain (+3.0 KR)
Trigger: Player is both the team's primary offensive creator AND defensive organizer. Leadership, production, and two-way dominance measurable across both phases.
Gate: AKR >= 85 AND DKR >= 85 AND captain/vice-captain designation AND top-3 team in both chance creation and defensive actions

### 3) System Transcendence (+2.5 KR)
Trigger: Player produces at elite level across multiple tactical systems (verified by production under 2+ different managers/systems in last 3 seasons). Portability is the signal.
Gate: KR >= 88 in current context AND verifiable elite production in at least 1 prior distinct tactical system

### 4) Set Piece Weapon (+2.0 KR)
Trigger: Player's set piece delivery is so elite it adds measurable xG to the team's overall offensive output beyond open play contribution.
Gate: Set Piece Delivery badge >= Silver AND team xG from set pieces in top 10% of league

### 5) International Pedigree (+1.5 KR)
Trigger: Player is a starter for a top-15 FIFA Women's World Ranked national team, confirming evaluation against global competition.
Gate: >= 15 senior international caps AND starter in most recent major tournament (World Cup, Olympics, continental championship)

### 6) Youth Prodigy Premium (+1.5 KR)
Trigger: Player is under 21 and producing at a level that typically requires 3+ years more experience.
Gate: Age <= 21 AND KR >= 85 AND minutes >= 1200 in a top women's pro league (NWSL/WSL/Liga F/D1F)

### 7) Clutch Performer (+1.0 KR)
Trigger: Player's production rises measurably in high-leverage situations (knockouts, rivalry matches, title-deciding matches).
Gate: xG+xA overperformance >= +25% in designated high-leverage matches (minimum 6 such matches)

### 8) Loyalty Value (+0.75 KR)
Trigger: Player has been at the same club for 4+ seasons, provides dressing room leadership, and has not requested a transfer despite being valued above current squad level.
Gate: >= 4 seasons at current club AND KR >= 80 AND no transfer request filed

## Negative Overrides (always apply, cannot be overridden)

### 1) Chronic Injury Liability (-3.0 KR)
Trigger: Player has missed 50+ matches over the last 3 seasons due to recurring injury to the same body part.
Gate: Confirmed via medical data or public reporting
ACL-specific: Two ACL injuries to same knee = automatic trigger regardless of match count.

### 2) Disciplinary Liability (-2.0 KR)
Trigger: Player averages >= 1.5 yellow cards/90 or >= 3 red cards in last 2 seasons combined. Discipline issues measurably cost the team.
Gate: Statistical verification from match data

### 3) Regression Signal (-2.0 KR)
Trigger: Player's key production metrics have declined >= 20% year-over-year for 2 consecutive seasons with no injury or pregnancy explanation.
Gate: Statistical verification across core production stats (G/90, xG/90, key passes/90, etc.)

### 4) Attitude / Professionalism Flag (-1.5 KR)
Trigger: Verified pattern of attitude issues impacting team performance (training absences, public conflicts, downing tools). Must be corroborated by multiple sources.
Gate: Minimum 3 separate verified incidents in last 2 seasons


---

# SYSTEM RISKS

SYSTEM RISKS -- Women's Soccer v1 (14 total: 9 Major, 5 Minor)

(Identical to men's soccer system risks in structure and trigger logic. Same 14 risks, same KR penalties. See men's File 02 for complete definitions.)

Major risks: -2.0 KR. Minor risks: -1.0 KR. Penalties are additive, applied to Final System Player KR.


---

# IMPACT MODIFIERS

IMPACT MODIFIERS -- Women's Soccer v1

(Identical to men's soccer impact modifiers in structure. Same 5 classifications: Primary Engine, Secondary Engine, Force Multiplier, Specialist Anchor, Unclassified. Same gates adapted for women's production norms.)

### Primary Engine
Gate: >= 0.50 (xG+xA)/90 AND >= 2.2 key passes/90 AND >= 1600 minutes in current season AND team offensive output improves measurably when on field.

### Secondary Engine
Gate: >= 0.35 (xG+xA)/90 AND >= 1.5 key passes/90 AND >= 1200 minutes.

### Force Multiplier
Gate: >= 3 component KRs >= 78 AND system fit >= 85% AND off-ball contribution measurably raises teammates' production.

### Specialist Anchor
Gate: One component KR >= 92 AND that component represents >= 50% of the player's total value.

### Unclassified
Default when no other modifier's gates are met, or minutes < 700 (Low Sample).


---

# COLLEGE KLVN

KLVN -- Women's College Soccer Level Normalization Ladder + D1 Conference Class Mapping
Status: Canonical (Active)

## 1) Purpose (Locked)
KLVN exists to ensure player performance is comparable across competitive environments and to prevent level/pace/sample-size effects from distorting evaluation. KLVN performs normalization only.

## 2) Determinism (Locked)
KLVN is fully deterministic: identical inputs must produce identical outputs.

## 3) Canonical Level Order (by lambda weight)
Rule: Higher lambda = higher competition density (harder environment).

| Rank | Level Key | Lambda |
|------|----------|--------|
| 1 | ncaa_d1_high_major | 1.000 |
| 2 | ncaa_d1_mid_major | 0.955 |
| 3 | ncaa_d1_low_major | 0.912 |
| 4 | ncaa_d2 | 0.870 |
| 5 | njcaa_d1 | 0.828 |
| 6 | naia | 0.805 |
| 7 | cccaa | 0.760 |
| 8 | njcaa_d2 | 0.745 |
| 9 | ncaa_d3 | 0.660 |
| 10 | njcaa_d3 | 0.620 |
| 11 | uscaa | 0.578 |
| 12 | nccaa_d1 | 0.538 |
| 13 | nccaa_d2 | 0.498 |
| 14 | hs_prep_postgrad | 0.445 |

Note: Lambdas are slightly lower at most levels than men's college soccer due to the larger number of programs diluting average competitive density at each tier. D1 HM remains the anchor at 1.000.

## 4) D1 Conference Class Mapping (Required for KLVN)

### 4.1 Season-scoped rule (Locked)
d1_conference_class_map[season_id][conference_key] = {high|mid|low}

For KLVN v1 (starting 2025-26), use the following baseline lists for women's soccer:

**High-Major (HM) conferences:**
- ACC
- Big Ten
- Big 12
- SEC
- Pac-12 (where applicable post-realignment)
- Big East

Note: Unlike men's soccer, all six power conferences sponsor women's soccer. The SEC and Big 12 both have full women's soccer sponsorship.

**Mid-Major (MM) conferences:**
- American Athletic (AAC)
- Atlantic 10 (A-10)
- West Coast (WCC)
- Mountain West (MWC)
- Missouri Valley (MVC)
- Colonial Athletic (CAA)
- Sun Belt
- Conference USA
- Horizon League
- Southern Conference (SoCon)
- Patriot League
- Ivy League

**Low-Major (LM) conferences:**
- All other D1 conferences not in HM or MM

### 4.2 Level key assignment rule (Locked)
If governing_body = NCAA and division = D1:
- If conference is in HM list -> level_key = ncaa_d1_high_major
- Else if conference is in MM list -> level_key = ncaa_d1_mid_major
- Else -> level_key = ncaa_d1_low_major

Women's Soccer-Specific Conference Notes:
- 320+ NCAA D1 programs exist for women's soccer (vs ~200 for men's). This is the largest college soccer landscape.
- The SEC is a women's soccer HM conference (all 16 schools sponsor women's soccer). This differs from men's soccer where SEC sponsorship is minimal.
- The Big 12 fully sponsors women's soccer across member schools.
- Conference realignment affects soccer conference membership differently than revenue sports. Always verify the actual women's soccer conference.

## 5-8) Application Rule, Governance, Critical Clarification
(Identical to men's college soccer KLVN. KR is universal, not level-converted. Lambda normalizes inputs, not outputs. One KR, multiple legend reads.)


---

# COLLEGE KR LEGENDS

COLLEGE WOMEN'S SOCCER PLAYER KR LEGENDS -- v1 (MODULAR)

## Governance Note
Each level has its own legend with KR tier descriptions anchored to women's soccer-specific production (goals, assists, minutes, awards, team success). All ratings assume KLVN normalization. College KR reflects current college role and impact only. No pro projection language.

Production benchmarks differ from men's college soccer: women's college soccer has lower average scoring rates per match (typical D1 match might see 2-4 total goals vs 2-5 for men's), but more programs means wider variance.

Note on 2025-26 scholarship changes: The House v. NCAA settlement eliminated scholarship caps for opt-in schools. Roster cap is now 28 for D1. This affects roster composition and depth but does not change KR evaluation (KR measures on-pitch production, not scholarship allocation).

---

## NCAA DIVISION I -- HIGH-MAJOR WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 1.000

Interpretation anchor: ACC, Big Ten, Big 12, SEC, Big East, Pac-12. Deep rosters, national recruiting, sustained play vs Top-50 RPI opponents. College KR reflects current college role and impact only. No pro language.

**98-100 -- National Player of the Year / Hermann Trophy Contender.**
Program-defining force. Elite goal output AND elite creation simultaneously. Warps opposing game plans. Drives team to College Cup contention. MAC Hermann Trophy finalist or winner. Reserved for generational single-season performers.
- F benchmark: 16+ goals, 7+ assists, 39+ points season, first-choice on a top-10 RPI side.
- M benchmark: 8+ goals, 10+ assists, All-American first team, drives possession AND scores in tournament play.
- D benchmark: Not typical at this tier. Would require an elite ball-playing CB/FB who anchors the #1 defensive record AND contributes 4+ goals/assists from the back.

**95-97 -- Franchise Anchor / Elite All-American.**
Team's unquestioned alpha. All-American lock. Conference Offensive or Defensive POY contender. Carries the attacking or defensive load nightly. 80+ minutes/match on a team that reaches the NCAA Tournament Sweet 16 or deeper.
- F benchmark: 12-15 goals, 5-7 assists, 29-38 points, starter every match on a top-15 side.
- M benchmark: 6-8 goals, 7-10 assists, All-Conference first team, drives tempo for a tournament-caliber team.
- D benchmark: All-American CB/FB. Team concedes fewest goals in conference. Anchors the defensive identity.

**92-94 -- High-Impact Starter / Core Winner.**
Wins matches at the highest college level. Heavy-minute leader. All-Conference first team. Trusted in tournament play.
- F benchmark: 8-11 goals, 3-5 assists. Regular starter on a ranked team.
- M benchmark: 4-6 goals, 5-7 assists. Two-way dominance.
- D benchmark: All-Conference defender. Team is top-25 in goals allowed.

**89-91 -- Solid Starter / Top-Five Rotation Lock.**
Firmly positive starter value at D1 HM. 80+ minutes in most matches. All-Conference second team or HM range.
- F benchmark: 5-7 goals, 2-4 assists.
- M benchmark: 2-4 goals, 3-5 assists.
- D benchmark: Reliable starter. Clean in 1v1 duels. Comfortable on the ball.

**86-88 -- Trusted Rotation / High-Minute Role Player.**
Winning-role player who thrives in a defined role. 60+ minutes in meaningful matches.
- F benchmark: 3-5 goals, 1-3 assists.
- M benchmark: 1-2 goals, 2-3 assists.
- D benchmark: Dependable. Low error rate.

**83-85 -- Reliable Bench / Rotation Contributor.**
True rotation depth on good teams. 40-60 minutes average.

**80-82 -- Situational Specialist / Depth Piece.**
Matchup- and context-dependent contributor. 20-40 minutes.

**77-79 -- Limited Bench / Emergency Depth.**
Playable only under constraint. Spot minutes.

**74-76 -- Fringe Roster / Non-Rotation.**
On the roster, not in the competitive plan.

**71-73 -- Developmental / Project.**
Future-oriented roster slot.

**68-70 -- Practice Roster / Walk-On.**
Roster filler for structure. (Note: walk-on category may phase out at opt-in schools under new roster rules.)

**Below 68 -- Below D1 HM Viability.**

---

## NCAA DIVISION I -- MID-MAJOR WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.955

Interpretation anchor: AAC, A-10, WCC, MWC, MVC, CAA, Sun Belt, C-USA, Horizon, SoCon, Patriot, Ivy. Strong programs with national tournament access.

**95-100 -- Conference Player of the Year / All-American.**
Best player in the conference. All-American contender. Drives team to NCAA Tournament.
- F benchmark: 14+ goals, 6+ assists.
- M benchmark: 8+ goals, 8+ assists.

**90-94 -- Elite Conference Performer / All-Conference First Team.**
Top-3 player in the conference at their position. Tournament-caliber performer.
- F benchmark: 10-13 goals, 4-6 assists.
- M benchmark: 5-8 goals, 5-8 assists.
- D benchmark: All-Conference. Anchors defense.

**86-89 -- High-Impact Starter.**
Nailed-on starter. All-Conference second team or HM range.

**82-85 -- Solid Starter / Rotation Lock.**
Reliable starter. 75+ minutes most matches.

**78-81 -- Trusted Rotation / Role Player.**

**74-77 -- Bench / Depth.**

**71-73 -- Situational / Emergency.**

**68-70 -- Fringe Roster.**

**65-67 -- Developmental.**

**Below 65 -- Below D1 MM Viability.**

---

## NCAA DIVISION I -- LOW-MAJOR WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.912

**92-100 -- Conference Dominant / All-American Contender.**
Overwhelms the level. Best player in the conference by a clear margin.
- F benchmark: 13+ goals, 5+ assists.

**87-91 -- Elite Conference / All-Conference First Team.**
Top-3 at position in conference.

**84-86 -- High-Impact Starter.**

**80-83 -- Solid Starter.**

**76-79 -- Rotation / Role Player.**

**72-75 -- Bench Depth.**

**68-71 -- Situational.**

**64-67 -- Fringe.**

**Below 64 -- Below D1 LM Viability.**

---

## NCAA DIVISION II WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.870

**90-100 -- D2 Player of the Year / National Standout.**
Dominates the D2 ecosystem. All-American.
- F benchmark: 16+ goals, 7+ assists in ~20-match season.

**85-89 -- Franchise Anchor / Top D2 All-American.**
- F benchmark: 10-15 goals, 4-7 assists.

**81-84 -- High-Impact Starter / Core Winner.**

**77-80 -- Solid Starter.**

**73-76 -- Rotation / Role Player.**

**69-72 -- Bench Depth.**

**65-68 -- Situational.**

**Below 65 -- Below D2 Viability.**

---

## NAIA WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.805

**88-100 -- NAIA Player of the Year / National Tournament Force.**
- F benchmark: 18+ goals, 8+ assists.

**83-87 -- Franchise Anchor / All-American.**

**79-82 -- High-Impact Starter.**

**75-78 -- Solid Starter.**

**71-74 -- Rotation.**

**67-70 -- Bench.**

**Below 67 -- Below NAIA Viability.**

---

## NCAA DIVISION III WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.660

**85-100 -- D3 Player of the Year / All-American.**
- F benchmark: 18+ goals, 8+ assists.

**80-84 -- Elite Conference / All-Conference.**

**75-79 -- High-Impact Starter.**

**70-74 -- Solid Starter.**

**65-69 -- Rotation.**

**60-64 -- Bench.**

**Below 60 -- Below D3 Competitive Viability.**

---

## NJCAA DIVISION I WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.828

**87-100 -- NJCAA D1 Player of the Year / National Tournament Force.**
- F benchmark: 20+ goals, 9+ assists.

**82-86 -- Franchise Anchor / All-American.**

**78-81 -- High-Impact Starter.**

**74-77 -- Solid Starter.**

**70-73 -- Rotation.**

**66-69 -- Bench.**

**Below 66 -- Below NJCAA D1 Viability.**

---

## NJCAA DIVISION II WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.745

**84-100 -- NJCAA D2 Dominant.**

**79-83 -- Franchise Anchor.**

**74-78 -- High-Impact Starter.**

**69-73 -- Solid Starter.**

**64-68 -- Rotation.**

**Below 64 -- Below NJCAA D2 Viability.**

---

## NJCAA DIVISION III WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.620

**80-100 -- NJCAA D3 Dominant.**

**75-79 -- Franchise Anchor.**

**70-74 -- High-Impact Starter.**

**65-69 -- Solid Starter.**

**Below 65 -- Below NJCAA D3 Viability.**

---

## CCCAA WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.760

**85-100 -- CCCAA Dominant / State Champion Caliber.**

**80-84 -- Franchise Anchor.**

**75-79 -- High-Impact Starter.**

**70-74 -- Solid Starter.**

**65-69 -- Rotation.**

**Below 65 -- Below CCCAA Viability.**

---

## USCAA WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.578

**78-100 -- USCAA Dominant.**

**73-77 -- Elite Conference.**

**68-72 -- High-Impact Starter.**

**63-67 -- Solid Starter.**

**Below 63 -- Below USCAA Viability.**

---

## NCCAA DIVISION I WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.538

**76-100 -- NCCAA D1 Dominant.**

**71-75 -- Elite Conference.**

**66-70 -- High-Impact Starter.**

**61-65 -- Solid Starter.**

**Below 61 -- Below NCCAA D1 Viability.**

---

## NCCAA DIVISION II WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.498

**73-100 -- NCCAA D2 Dominant.**

**68-72 -- Elite Conference.**

**63-67 -- High-Impact Starter.**

**58-62 -- Solid Starter.**

**Below 58 -- Below NCCAA D2 Viability.**

---

## HS/PREP/POSTGRAD WOMEN'S SOCCER PLAYER KR LEGEND v1
### lambda = 0.445

**70-100 -- Elite Prospect / National Team Pool.**

**65-69 -- Top Regional / College Recruit.**

**60-64 -- Solid College Prospect.**

**55-59 -- Developmental Prospect.**

**Below 55 -- Below College Recruiting Viability.**


---

# PRO KLVN

KLVN -- Women's Pro Soccer Level Normalization Ladder
Status: Canonical (Active)

## Lambda Anchor Decision: WSL = 1.000

The WSL (England) is the lambda anchor for women's professional soccer. Rationale:
- Deepest top-to-bottom competitive quality in a women's domestic league
- Chelsea's sustained dominance (6 consecutive titles) with squad depth comparable to men's top sides structurally
- Arsenal, Man City, Man United investment creating genuine 4-6 team competition
- Attracts global talent across positions (not just forwards)
- Fully professional since 2018 with rapidly growing infrastructure
- Higher average competitive density per match than NWSL (12 teams, shorter season = more concentrated)

The NWSL is close and growing rapidly but has more variance in competitive quality across 16 teams and is still developing its salary/infrastructure parity.

| Rank | League Key | Lambda |
|------|-----------|---------|
| 1 | wsl (England) | 1.000 |
| 2 | liga_f (Spain) | 0.975 |
| 3 | nwsl (USA) | 0.950 |
| 4 | d1_feminine (France) | 0.940 |
| 5 | frauen_bundesliga (Germany) | 0.930 |
| 6 | serie_a_femminile (Italy) | 0.890 |
| 7 | damallsvenskan (Sweden) | 0.860 |
| 8 | a_league_women (Australia) | 0.820 |
| 9 | liga_mx_femenil (Mexico) | 0.810 |
| 10 | toppserien (Norway) | 0.840 |
| 11 | eredivisie_vrouwen (Netherlands) | 0.830 |
| 12 | primeira_liga_feminina (Portugal) | 0.790 |
| 13 | scottish_womens_pl | 0.750 |
| 14 | k_league_women (South Korea) | 0.740 |
| 15 | wsl_2 (England 2nd tier) | 0.780 |
| 16 | segunda_federacion_f (Spain 2nd) | 0.760 |
| 17 | frauen_2_bundesliga (Germany 2nd) | 0.750 |
| 18 | uwcl_group (Champions League) | 0.990 |
| 19 | youth_nt_u20_top10 | 0.700 |
| 20 | youth_nt_u17_top10 | 0.600 |
| 21 | youth_nt_u20_other | 0.580 |
| 22 | youth_nt_u17_other | 0.500 |

Notes:
- NWSL lambda at 0.950 reflects rapid growth but still lower average competitive density at the bottom of the 16-team league. Expected to rise as expansion stabilizes and salary cap increases.
- Liga F is rated high due to Barcelona Femeni's dominance at the top (UWCL winners) pulling up the overall league quality through competition effects.
- UWCL group stage lambda applies to tournament-specific production only. Domestic league lambda remains primary.
- Youth NT lambdas reflect talent density in competitive international youth tournaments. Top-10 FIFA-ranked nations' YNTs have higher lambda.


---

# PRO LEAGUE KR LEGENDS

## WSL (ENGLAND) PLAYER KR LEGEND (Anchor, lambda = 1.000)

**98-100 -- Global Apex / Transcendent**
One of the best women's players in world football. Ballon d'Or Feminin contender. Warps systems and wins titles as the decisive individual.
League Anchors: Aitana Bonmati (if WSL), Sam Kerr peak
Economic Reality: GBP 300K-500K+ per year, transfer fee GBP 500K+

**94-97 -- Elite Franchise Star**
All-league first XI. Top-5 positional player in the WSL. Decisive in big matches and UWCL.
League Anchors: Lauren James, Alessia Russo, Leah Williamson, Beth Mead
Economic Reality: GBP 150K-350K per year

**90-93 -- High-Impact Star / Best XI Lock**
First-choice starter on a title-contending side. Best XI most weeks.
League Anchors: Strong starters at Chelsea, Arsenal, Man City
Economic Reality: GBP 80K-180K per year

**86-89 -- Core Starter / Reliable First-Choice**
Nailed-on starter. Could start for most WSL sides.
Economic Reality: GBP 45K-100K per year

**82-85 -- Rotation / Squad Contributor**
Regular rotation player.
Economic Reality: GBP 25K-55K per year

**78-81 -- Fringe First-Team / Depth**
Occasional starter.
Economic Reality: GBP 18K-35K per year

**73-77 -- WSL Survival Level / Lower-Table Starter**
Starter for a relegation-battling side.

**68-72 -- WSL 2 Level / WSL Fringe**
Below WSL standard in most contexts.

**60-67 -- Lower League / Semi-Professional Level**

**Below 60 -- Non-Professional**

---

## NWSL PLAYER KR LEGEND (lambda = 0.950)

**96-100 -- League-Defining Superstar / MVP**
Best player in the NWSL. Golden Boot / MVP contender. Franchise-defining.
League Anchors: Trinity Rodman, Sophia Smith, Barbra Banda peak, Naomi Girma (before Chelsea move)
Economic Reality: $300K-$1M+ (with HIP rule), transfer fee $500K-$1.5M+

**92-95 -- Elite Star / Best XI Lock**
NWSL Best XI regular. Decisive impact. National team starter.
League Anchors: NWSL Best XI selections, USWNT/international starters
Economic Reality: $150K-$350K

**88-91 -- High-Impact Starter**
First-choice starter on a playoff team. Reliable high-level contributor.
Economic Reality: $80K-$180K

**84-87 -- Core Starter / Solid Professional**
Consistent starter across the league.
Economic Reality: $55K-$100K

**80-83 -- Rotation / Squad Player**
Regular contributor. Starts 12-18 matches.
Economic Reality: $48K-$70K

**76-79 -- Fringe Starter / Depth**
Occasional starts.
Economic Reality: $48K-$60K (near minimum)

**72-75 -- NWSL Minimum Level**
Edge of roster.
Economic Reality: $48K-$55K (minimum salary range)

**68-71 -- Below NWSL Standard**
Would need to drop to reserve/second division or overseas.

**Below 68 -- Non-NWSL Level**

---

## LIGA F (SPAIN) PLAYER KR LEGEND (lambda = 0.975)

**97-100 -- Barcelona Femeni Elite / League MVP**
Global star at the Barca level. UWCL decisive.
League Anchors: Aitana Bonmati, Alexia Putellas, Salma Paralluelo
Economic Reality: EUR 400K-835K+

**93-96 -- Elite Liga F Star**
All-league. Barca/Real Madrid/Atletico star.
Economic Reality: EUR 100K-400K

**89-92 -- High-Impact Starter**
First-choice at a top-6 Liga F side.

**85-88 -- Core Starter**

**81-84 -- Rotation / Squad**

**77-80 -- Depth / Lower-Table Starter**

**73-76 -- Liga F Fringe**

**Below 73 -- Below Liga F Standard**

---

## DIVISION 1 FEMININE (FRANCE) PLAYER KR LEGEND (lambda = 0.940)

**96-100 -- Lyon/PSG Superstar**
League-defining.
Economic Reality: EUR 150K-400K+

**92-95 -- Elite D1F Star**

**88-91 -- High-Impact Starter**

**84-87 -- Core Starter**

**80-83 -- Rotation**

**76-79 -- Depth**

**Below 76 -- Below D1F Standard**

---

## FRAUEN-BUNDESLIGA (GERMANY) PLAYER KR LEGEND (lambda = 0.930)

**95-100 -- Bayern/Wolfsburg Superstar**

**91-94 -- Elite Frauen-BL Star**

**87-90 -- High-Impact Starter**

**83-86 -- Core Starter**

**79-82 -- Rotation**

**75-78 -- Depth**

**Below 75 -- Below Frauen-BL Standard**

---

## SERIE A FEMMINILE (ITALY) PLAYER KR LEGEND (lambda = 0.890)

**93-100 -- Juventus Women / League Star**

**89-92 -- Elite Serie A Femminile**

**85-88 -- High-Impact Starter**

**81-84 -- Core Starter**

**77-80 -- Rotation**

**Below 77 -- Below Serie A Femminile Standard**

---

## A-LEAGUE WOMEN (AUSTRALIA) PLAYER KR LEGEND (lambda = 0.820)

**90-100 -- League MVP / Matildas Star**

**86-89 -- Elite ALW**

**82-85 -- High-Impact Starter**

**78-81 -- Core Starter**

**74-77 -- Rotation**

**Below 74 -- Below ALW Standard**

---

## DAMALLSVENSKAN (SWEDEN) PLAYER KR LEGEND (lambda = 0.860)

**92-100 -- League Star / International-Caliber**

**88-91 -- Elite Damallsvenskan**

**84-87 -- High-Impact Starter**

**80-83 -- Core Starter**

**76-79 -- Rotation**

**Below 76 -- Below Damallsvenskan Standard**

---

## LIGA MX FEMENIL (MEXICO) PLAYER KR LEGEND (lambda = 0.810)

**90-100 -- League Star / El Tri Femenil Starter**

**86-89 -- Elite Liga MX Femenil**

**82-85 -- High-Impact Starter**

**78-81 -- Core Starter**

**74-77 -- Rotation**

**Below 74 -- Below Liga MX Femenil Standard**


---

# PRO PLAYER KR LEGEND

Pro Player KR Legend -- Women's Soccer

Global Women's Professional Football
Player-Level Output Interpretation

**98-100 -- Global Apex / Transcendent Superstar**
Ballon d'Or Feminin contender. One of the absolute best women's players in the world.
League Anchors: Perennial Ballon d'Or nominees, World Cup MVPs
Economic Reality: GBP 300K-835K+ per year; transfer fee GBP 500K-1.5M+

**94-97 -- Elite Franchise Anchor**
Primary star who carries clubs in elite competition. Decisive in UWCL knockouts and league title races.
Economic Reality: GBP 100K-400K per year; fee GBP 200K-800K

**90-93 -- High-Impact Global Star**
Reliable star starter who elevates teams. MVP-caliber in most pro environments.
Economic Reality: GBP 50K-150K per year; fee GBP 100K-500K

**86-89 -- Core Professional Contributor**
Trusted high-minute starter with system value.
Economic Reality: GBP 25K-80K per year; fee GBP 50K-250K

**82-85 -- Stable Professional Role Player**
Dependable pro with recurring contracts.
Economic Reality: GBP 18K-40K per year; fee nominal-GBP 100K

**78-81 -- Rotation-Level Professional**
Established player who fits rotations reliably.
Economic Reality: GBP 12K-25K per year

**73-77 -- Fringe Professional**
Edge-of-squad pro with variable job security.

**68-72 -- Entry-Level / Replacement Professional**
Can land pro deals, but high churn.

**60-67 -- Semi-Professional / Local Level**
Below full pro viability.

**Below 60 -- Non-Professional**

Note: Women's soccer transfer fees and wages are growing rapidly (2024-2026 has seen exponential growth). These ranges reflect 2025-26 market realities and will likely increase significantly year-over-year.


---

# PRO TEAM REGISTRY

## NWSL (16 Teams, 2026 Season, lambda = 0.950)

| Club | Head Coach | Offense | Defense | Window | Budget | Notes |
|------|-----------|---------|---------|--------|--------|-------|
| Angel City FC | Becki Tweed | Possession / Inside Forward | Mid-Block / Hybrid Press | Rebuilding | Mid | LA market. Star-heavy marketing. |
| Bay FC | Emma Coates | Possession / 3-2-5 Build-Up | High Press | Developing | Mid | New coaching staff 2026. Data-driven. San Jose. |
| Boston Legacy FC | Filipa Patao | TBD - expansion | TBD | Rebuilding | Mid | Expansion 2026. Casey Murphy in goal. Nichelle Prince. |
| Chicago Red Stars | Lorne Donaldson | Counter-Attack / Gegenpressing | Mid-Block / High Press | Retooling | Mid | Rebuilding phase. |
| Denver Summit FC | TBD | TBD - expansion | TBD | Rebuilding | Mid | Expansion 2026. Lindsey Heaps (USWNT captain) arriving mid-season from Lyon. |
| Houston Dash | Fran Alonso | Possession / Overlap | Mid-Block | Rebuilding | Low | Rebuilding. |
| Kansas City Current | Chris Armas | Gegenpressing / Possession | High Press / Hybrid | Contending | High | 2025 Shield winners. CPKC Stadium (first purpose-built NWSL stadium). New coach 2026. |
| NJ/NY Gotham FC | Juan Carlos Amoros | Possession / Inside Forward | Hybrid Press / Zonal | Contending | High | Defending 2025 NWSL Champions. Rose Lavelle. |
| North Carolina Courage | Mak Lind | Gegenpressing / Overlap | High Press | Rising | Mid | Three-time champions (2016-19). New coach 2026. |
| Orlando Pride | Seb Hines | Possession / Overlap | Mid-Block / High Press | Contending | High | Barbra Banda. Lizbeth Ovalle ($1.5M record transfer). |
| Portland Thorns | Robert Vilahamn | Possession / Inside Forward | High Press | Retooling | Mid | Sophia Wilson returning from maternity leave. New coach 2026. |
| Racing Louisville FC | TBD | Counter-Attack / Direct | Mid-Block / Low Block | Rebuilding | Low | Developing market. |
| San Diego Wave FC | Landon Donovan | Counter-Attack / Gegenpressing | Mid-Block | Retooling | Mid | Lost Naomi Girma and Jaedyn Shaw to transfers. |
| Seattle Reign FC | TBD | Possession / Overlap | High Press | Retooling | Mid | |
| Utah Royals FC | TBD | Gegenpressing / Overlap | High Press | Rising | Mid | Second-year franchise. |
| Washington Spirit | Jonatan Giraldez | Tiki-Taka / Positional Play | High Press / Offside Trap | Contending | Elite | Trinity Rodman (HIP rule contract). 2025 Championship runner-up. |

Note: Coaching carousel was significant entering 2026 -- 9 of 16 head coaches hired within the last year. Many systems are provisional and may shift as coaches establish identity.

## WSL (12 Teams, 2025-26 Season, lambda = 1.000)

| Club | Offense | Defense | Window | Notes |
|------|---------|---------|--------|-------|
| Chelsea | Tiki-Taka / Inside Forward | High Press / Offside Trap | Contending | 6 consecutive titles. Naomi Girma, Alyssa Thompson acquired from NWSL. Deepest squad in WSL. |
| Arsenal | Possession / 3-2-5 Build-Up | High Press / Hybrid | Contending | Perennial contenders. Strong academy pipeline. |
| Manchester City | Possession / Overlap | Gegenpressing / High Press | Contending | Vivianne Miedema signed. Investment rising. |
| Manchester United | Gegenpressing / Overlap | Hybrid Press | Rising | Fridolina Rolfo from Barca. Growing investment. |
| Tottenham | Counter-Attack / Gegenpressing | Mid-Block | Rising | |
| Brighton | Possession / 3-2-5 | High Press | Developing | Data-driven. Mirror men's model. |
| Aston Villa | Gegenpressing / Overlap | High Press | Developing | |
| Liverpool | Gegenpressing / Possession | High Press | Rising | |
| West Ham | Counter-Attack / Direct | Mid-Block | Retooling | |
| Leicester City | Counter-Attack | Mid-Block / Low Block | Rebuilding | |
| Crystal Palace | Counter-Attack | Mid-Block | Rebuilding | |
| London City Lionesses | TBD | TBD | Rebuilding | Promoted 2025. |

## LIGA F TOP CLUBS (lambda = 0.975)

| Club | Notes |
|------|-------|
| FC Barcelona Femeni | Dominant force. Tiki-Taka / Positional Play. UWCL contenders. Bonmati, Putellas, Paralluelo. |
| Real Madrid Femenino | Rising rapidly. Investment growing. Inside Forward / Possession. |
| Atletico Madrid Femenino | Competitive. Gegenpressing / Counter-Attack. |
| Real Sociedad | Strong. Possession-based. |
| Levante | Competitive mid-table. |

## D1 FEMININE TOP CLUBS (lambda = 0.940)

| Club | Notes |
|------|-------|
| Olympique Lyonnais Feminin | Historic power. 8x UWCL winners. Possession / Tiki-Taka. Lindsey Heaps (departing mid-2026 to Denver Summit). |
| Paris Saint-Germain Feminines | Rising. Investment growing. Inside Forward / Gegenpressing. |
| Paris FC | Competitive. |

## FRAUEN-BUNDESLIGA TOP CLUBS (lambda = 0.930)

| Club | Notes |
|------|-------|
| Bayern Munich Frauen | Dominant domestic. Gegenpressing / Possession. |
| VfL Wolfsburg Frauen | UWCL contenders. Possession / Overlap. |
| Eintracht Frankfurt Frauen | Rising. |


---

# PRO SALARY FRAMEWORK

PRO SALARY & TRANSFER FEE FRAMEWORK -- Women's Soccer v1

## Key Structural Differences From Men's Soccer
- Women's soccer transfer market is still developing. Record fee as of 2025 is ~$1.5M (Ovalle to Orlando).
- NWSL operates with a salary cap ($3.5M in 2026, rising to $5.1M by 2030). High-Impact Player rule adds $1M per team.
- WSL has a soft salary cap (40% of club revenue). Massive disparity between big clubs (Chelsea, Arsenal, Man City) and smaller sides.
- Liga F has a minimum salary (~EUR 23,500) but no cap.
- Wages are growing exponentially year-over-year. 2025-26 ranges will likely be outdated by 2027-28.

## NWSL SALARY FRAMEWORK (2025-26)

| KR Tier | Salary Range (Annual) | Contract Notes |
|---------|----------------------|---------------|
| 96+ | $300K-$1M+ | High-Impact Player rule territory. Rodman-level. |
| 92-95 | $150K-$350K | Star-level. National team starters. |
| 88-91 | $80K-$180K | Established starters. |
| 84-87 | $55K-$100K | Core contributors. |
| 80-83 | $48K-$70K | Rotation/squad players. |
| 76-79 | $48K-$60K | Near minimum. Fringe. |
| 72-75 | $48K-$55K | Minimum salary range ($48,500 in 2025). |

NWSL Transfer Fees (2025-26 Market):
- Record: ~$1.5M (Ovalle to Orlando, 2025)
- Typical star-level: $200K-$800K
- Mid-level: $50K-$200K
- Most moves: free agency (no draft, full free agency since 2025 CBA)

Note: NWSL eliminated the draft in 2025. Players enter through free agency, international signings, or short-term contracts. No expansion draft either.

## WSL SALARY FRAMEWORK (2025-26)

| KR Tier | Salary Range (Annual GBP) | Notes |
|---------|--------------------------|-------|
| 96+ | GBP 300K-500K+ | Sam Kerr tier. Rare. |
| 92-95 | GBP 100K-350K | Star level. Chelsea/Arsenal/Man City. |
| 88-91 | GBP 50K-120K | Established starters at top clubs. |
| 84-87 | GBP 30K-60K | Core starters. |
| 80-83 | GBP 20K-35K | Rotation. |
| 76-79 | GBP 18K-25K | Minimum salary territory (introduced 2025-26). |

WSL Transfer Fees:
- Growing but still modest. Biggest moves tend to be from NWSL to WSL (Girma, Thompson to Chelsea).
- Most transfers are still free or nominal fees. Emerging market.

## LIGA F SALARY FRAMEWORK (2025-26)

| KR Tier | Salary Range (Annual EUR) | Notes |
|---------|--------------------------|-------|
| 96+ | EUR 400K-835K+ | Bonmati/Putellas tier. Barca premium. |
| 92-95 | EUR 100K-400K | Star level. |
| 88-91 | EUR 40K-100K | Starters at top clubs. |
| 84-87 | EUR 25K-45K | Core. |
| 80-83 | EUR 23K-30K | Near minimum. |
| Below 80 | EUR 23,500 (minimum) | League minimum. |

## D1 FEMININE SALARY FRAMEWORK (2025-26)

| KR Tier | Salary Range (Annual EUR) | Notes |
|---------|--------------------------|-------|
| 95+ | EUR 100K-400K+ | Lyon/PSG star level. |
| 90-94 | EUR 50K-120K | |
| 85-89 | EUR 25K-60K | |
| 80-84 | EUR 15K-30K | |
| Below 80 | EUR 10K-18K | Many players still part-time at smaller clubs. |

## FRAUEN-BUNDESLIGA SALARY FRAMEWORK (2025-26)

Average salary ~EUR 42,000/year. Range from EUR 15K (lower clubs) to EUR 150K+ (Bayern/Wolfsburg stars).


---

# POSITION TRAIT WEIGHTING (OPF)

POSITION TRAIT WEIGHTING -- Women's Soccer v1 (LOCKED)

## OPF Definition
OPF (Offensive-Defensive-Tools-IQ Positional Framework) defines how the four component KRs combine into Base Player KR for each position.

Base Player KR = (AKR x OPF_att) + (DKR x OPF_def) + (TKR x OPF_tools) + (IQKR x OPF_iq)

OPF varies by position. Each row sums to 100%.

## Outfield Positions (10)

| Position | AKR (Attack) | DKR (Defense) | TKR (Tools) | IQKR (Tactical IQ) |
|----------|-------------|--------------|-------------|-------------------|
| ST (Striker) | 56% | 10% | 18% | 16% |
| SS (Second Striker) | 50% | 12% | 16% | 22% |
| W (Winger) | 46% | 16% | 22% | 16% |
| CAM (Attacking Mid) | 44% | 14% | 14% | 28% |
| CM (Central Mid) | 28% | 28% | 16% | 28% |
| CDM (Defensive Mid) | 14% | 40% | 16% | 30% |
| WB (Wing-Back) | 28% | 30% | 26% | 16% |
| FB (Fullback) | 18% | 38% | 24% | 20% |
| CB (Centre-Back) | 8% | 46% | 24% | 22% |
| GK (Goalkeeper) | 0% | 48% | 22% | 30% |

### Design Notes (Women's Soccer-Specific Adjustments)

**ST:** Slightly lower attack weight than men's (56% vs 58%), slightly higher IQ (16% vs 14%). Women's strikers are more frequently asked to contribute to build-up and pressing than men's pure poachers.

**CM:** Higher IQ weight (28% vs 26% men's). Central midfield in women's soccer places even more emphasis on game reading and decision-making because physical differences between top and average players are smaller -- IQ differentiates more.

**CDM:** Higher IQ (30% vs 28%). Same reasoning as CM. Tactical positioning and reading is more important relative to pure physicality.

**CB:** Slightly lower defense (46% vs 48%), slightly higher IQ (22% vs 20%). Modern women's CBs increasingly need ball-playing ability and tactical sophistication in addition to pure defending.

**GK:** Higher IQ (30% vs 28%). Distribution, sweeping, and tactical positioning are increasingly important in women's goalkeeping as the tactical level rises.

## GK-Specific Component Mapping
(Identical to men's. See men's File 02.)


---

# PLAYER GAME IMPACT SCORE (PGIS)

(Identical structure to men's soccer PGIS. See men's File 02. Same 0-centered scale, same interpretation bands, same governance. PGIS is level-relative and gender-neutral in structure -- the bands measure relative impact at whatever competitive level the player competes.)


---

## GOVERNANCE NOTE
All reference data in this file is read-only. It does not produce or modify KR values. Changes to any section require documentation, versioning, and approval.
