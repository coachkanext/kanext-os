# NEXUS FOOTBALL INTELLIGENCE -- FILE 02: PLAYER EVAL REFERENCE
## v1.0

---

# UI SYSTEM SET

UI SYSTEM SET — v1 (LOCKED)

Purpose: The UI System Set defines the valid offensive and defensive system selections available to coaches during Coach Context Setup. No evaluation, weighting, or normalization logic lives here. System trait weighting is governed by the System Fit docs.

Offensive Systems (8)
1. Spread
2. Air Raid
3. RPO (Run-Pass Option)
4. Pro Style
5. West Coast
6. Power Run
7. Option / Triple Option
8. Pistol

Defensive Systems (6)
1. 4-3 (Over/Under)
2. 3-4 (Odd Front)
3. Nickel / 4-2-5
4. 3-3-5 (Wide Tackle Six)
5. 4-4 (Eight-Man Front)
6. 46 Defense

Governance: System names must exactly match across all downstream docs: System Demand Profiles, System Fit (Offensive + Defensive Trait Weighting), OSIE/DSIE, Scheme × Scheme Interaction, Archetype × Scheme Interaction. No aliases permitted. Any addition or removal requires documentation, versioning, and approval.

---

# TRAIT LIBRARY

Trait Library

KaNeXT Football Trait Clusters — Canonical 8 (name set)
1. Passing (QB-centric but also TE/RB/trick play; includes accuracy, arm talent, timing, platform)
2. Rushing / Carrying (includes vision, contact balance, elusiveness, power, burst)
3. Receiving (includes route running, hands, RAC, contested catches, release)
4. Blocking (includes pass protection, run blocking, technique, sustain, movement)
5. Pass Rush / Pressures (includes get-off, bend, hand usage, counter moves, motor)
6. Coverage / Tackling (includes man coverage, zone coverage, tackling, pursuit, ball skills)
7. Tools (size, length, speed, agility, explosiveness, strength, motor, endurance)
8. IQ (pre-snap reads, processing speed, assignment discipline, situational awareness, leadership)

---

## PASSING CLUSTER — Locked Traits (8)

1) Accuracy -- Short (0-9 yards)
Definition: Completion accuracy on throws 0-9 air yards.
Inputs: Short-range completion %, adjusted completion % (drops removed), on-target %
College bands (v0):
● 90: 78%+ comp & 85%+ on-target
● 80: 73-77% comp & 80-84% on-target
● 70: 68-72% comp & 75-79% on-target
● 60: 63-67% comp & 70-74% on-target
● <60: <63% or poor on-target
Box-score mode: PROXY — Inputs: overall completion %, YPA. Score: round(0.65*Band(Comp%) + 0.35*Band(YPA_short_proxy))

2) Accuracy -- Intermediate (10-19 yards)
Definition: Completion accuracy on throws 10-19 air yards.
Inputs: Intermediate completion %, on-target %, big-time throw rate at intermediate depth
College bands (v0):
● 90: 68%+ comp & 80%+ on-target
● 80: 62-67% comp & 75-79% on-target
● 70: 56-61% comp & 70-74% on-target
● 60: 50-55% comp & 65-69% on-target
● <60: <50% or poor on-target
Box-score mode: PROXY — Inputs: overall completion %, YPA. Score: round(0.60*Band(Comp%) + 0.40*Band(YPA))

3) Accuracy -- Deep (20+ yards)
Definition: Completion accuracy on throws 20+ air yards.
Inputs: Deep ball completion %, on-target %, big-time throw rate deep
College bands (v0):
● 90: 52%+ comp & 65%+ on-target & 25%+ BTT rate
● 80: 45-51% comp & 58-64% on-target
● 70: 38-44% comp & 50-57% on-target
● 60: 32-37% comp & 43-49% on-target
● <60: <32% or poor on-target
Box-score mode: PROXY — Inputs: yards per attempt, TD rate on 20+ yd completions

4) Arm Talent
Definition: Raw arm strength, velocity, and ability to make throws from multiple platforms and arm angles.
Inputs: Ball velocity (if available), off-platform completion %, throw-on-the-run accuracy, sidearm/underhand success rate
College bands (v0):
● 90: Elite velocity + accurate from multiple platforms + throw-on-run comp 70%+
● 80: Above-average velocity + functional off-platform
● 70: Average velocity + occasional off-platform
● 60: Below-average velocity + limited platform variety
● <60: Weak arm, single-platform only
Box-score mode: UNSCORED (null) — requires film evaluation

5) Timing / Anticipation
Definition: Ability to deliver the ball before the receiver's break, throwing to spots rather than reacting to separation.
Inputs: Time to throw, anticipation throw %, receiver-in-stride delivery rate
College bands (v0):
● 90: Consistently elite timing, 70%+ anticipation throws, sub-2.5s average release
● 80: Strong anticipation, 60-69% anticipation, 2.5-2.7s release
● 70: Average timing, 50-59% anticipation
● 60: Inconsistent timing, 40-49% anticipation
● <60: Late thrower, reacts to separation rather than anticipating
Box-score mode: UNSCORED (null)

6) Pocket Presence
Definition: Ability to navigate the pocket, sense pressure, climb/slide, and maintain throwing platform under duress.
Inputs: Pressure-to-sack rate (lower = better), pressured completion %, sack avoidance rate, time to throw under pressure
College bands (v0):
● 90: Pressure-to-sack ≤12%, pressured comp 55%+, elite pocket movement
● 80: Pressure-to-sack 13-16%, pressured comp 48-54%
● 70: Pressure-to-sack 17-20%, pressured comp 42-47%
● 60: Pressure-to-sack 21-25%, pressured comp 36-41%
● <60: Pressure-to-sack >25% or pressured comp <36%
Box-score mode: PROXY — Inputs: sack rate, sacks per game, pressure data if available

7) Ball Placement
Definition: Ability to locate the ball precisely to protect the receiver, lead in stride, and place away from coverage.
Inputs: Catchable ball %, turnover-worthy play rate, receiver-in-stride %, back-shoulder/fade accuracy
College bands (v0):
● 90: 82%+ catchable, ≤1.5% TWP rate
● 80: 78-81% catchable, 1.6-2.2% TWP
● 70: 74-77% catchable, 2.3-3.0% TWP
● 60: 70-73% catchable, 3.1-4.0% TWP
● <60: <70% catchable or >4.0% TWP
Box-score mode: PROXY — Inputs: INT rate, completion %, YPA

8) Play-Action Execution
Definition: Ability to sell the run fake and deliver accurately off play-action.
Inputs: Play-action completion %, YPA on play-action, play-action rate, EPA on play-action
College bands (v0):
● 90: PA comp 72%+, PA YPA 10.5+
● 80: PA comp 66-71%, PA YPA 9.0-10.4
● 70: PA comp 60-65%, PA YPA 7.5-8.9
● 60: PA comp 54-59%, PA YPA 6.0-7.4
● <60: PA comp <54% or PA YPA <6.0
Box-score mode: UNSCORED (null) unless PA stats are available

---

## RUSHING / CARRYING CLUSTER — Locked Traits (7)

1) Vision / Patience
Definition: Ability to read blocks, identify creases, and make decisive cuts.
Inputs: PFF rushing grade (vision component), yards before contact, explosive run rate (10+ yards), missed hole rate
College bands (v0):
● 90: Elite vision, consistent identification of cutback lanes, explosive rate 18%+
● 80: Strong vision, rarely misreads, explosive rate 14-17%
● 70: Average vision, occasional misreads, explosive rate 10-13%
● 60: Below-average vision, frequent hesitation, explosive rate 7-9%
● <60: Poor vision, consistently misreads blocks
Box-score mode: PROXY — Inputs: YPC, explosive run rate (10+ yd runs / attempts)

2) Contact Balance / Power
Definition: Ability to absorb contact and continue gaining yards. Broken tackles, yards after contact.
Inputs: Yards after contact per attempt, broken tackle rate, forced missed tackles per attempt
College bands (v0):
● 90: YAC/att 4.0+, forced missed tackles 0.30+/att
● 80: YAC/att 3.3-3.9, FMT 0.24-0.29
● 70: YAC/att 2.6-3.2, FMT 0.18-0.23
● 60: YAC/att 2.0-2.5, FMT 0.12-0.17
● <60: YAC/att <2.0 or FMT <0.12
Box-score mode: PROXY — Inputs: YPC, size/weight as proxy for power

3) Elusiveness
Definition: Ability to make defenders miss in space. Jukes, spins, jump cuts, lateral agility.
Inputs: Elusive rating (PFF), missed tackles forced on designed outside/space runs, juke rate
College bands (v0):
● 90: Elusive rating 110+, elite lateral agility
● 80: Elusive rating 90-109
● 70: Elusive rating 70-89
● 60: Elusive rating 50-69
● <60: Elusive rating <50
Box-score mode: UNSCORED (null) — requires film or PFF data

4) Burst / Acceleration
Definition: Short-area quickness from standing start or through the hole. First 10 yards of a run.
Inputs: 10-yard split (combine/pro day), PFF burst grade, breakaway run rate (20+ yard runs)
College bands (v0):
● 90: 10-yd split ≤1.52s, breakaway rate 5%+
● 80: 10-yd split 1.53-1.57, breakaway rate 3.5-4.9%
● 70: 10-yd split 1.58-1.62, breakaway rate 2.0-3.4%
● 60: 10-yd split 1.63-1.68, breakaway rate 1.0-1.9%
● <60: 10-yd split >1.68 or breakaway rate <1.0%
Box-score mode: PROXY — Inputs: long run, 20+ yd runs, 40 time if available

5) Pass Protection (RB)
Definition: Ability to identify and pick up blitzers, pass protect effectively.
Inputs: PFF pass-blocking grade, pressures allowed per pass-block snap, blitz pickup rate
College bands (v0):
● 90: PFF PB grade 85+, pressure rate ≤3%
● 80: PFF PB grade 75-84, pressure rate 4-6%
● 70: PFF PB grade 65-74, pressure rate 7-10%
● 60: PFF PB grade 55-64, pressure rate 11-15%
● <60: PFF PB grade <55 or pressure rate >15%
Box-score mode: UNSCORED (null)

6) Ball Security
Definition: Ability to protect the football. Fumble rate, high-traffic ball security.
Inputs: Fumbles per touch, fumbles per carry, ball-security grade
College bands (v0):
● 90: Fumbles per 100 touches ≤0.3
● 80: Fumbles per 100 touches 0.4-0.7
● 70: Fumbles per 100 touches 0.8-1.2
● 60: Fumbles per 100 touches 1.3-2.0
● <60: Fumbles per 100 touches >2.0
Box-score mode: PROXY — Inputs: fumbles, carries, receptions

7) Receiving Ability (RB/FB)
Definition: Route running, hands, and receiving production from the backfield.
Inputs: Receptions, receiving yards per game, drop rate, routes run, yards per route run
College bands (v0):
● 90: 45+ rec, YPRR 2.0+, drop rate ≤4%
● 80: 35-44 rec, YPRR 1.5-1.9, drop rate 5-7%
● 70: 25-34 rec, YPRR 1.1-1.4, drop rate 8-10%
● 60: 15-24 rec, YPRR 0.7-1.0, drop rate 11-14%
● <60: <15 rec or YPRR <0.7 or drop rate >14%
Box-score mode: PROXY — Inputs: receptions, receiving yards, receiving TDs

---

## RECEIVING CLUSTER — Locked Traits (7)

1) Route Running -- Precision
Definition: Route technique, breaks, stem quality, and ability to create separation through craft.
Inputs: Separation rate, route grade (PFF), jab/stem effectiveness, break quality
College bands (v0):
● 90: Elite separation rate 75%+, consistent clean breaks, wins vs press and off
● 80: Strong separation 68-74%, clean breaks against most coverage
● 70: Average separation 60-67%, adequate technique
● 60: Below-average separation 52-59%, inconsistent breaks
● <60: Poor route runner, limited separation ability
Box-score mode: UNSCORED (null)

2) Route Running -- Route Tree Breadth
Definition: Number and variety of routes run effectively. Full-tree or limited-tree receiver.
Inputs: Number of route types with positive EPA, route distribution, success rate by route type
College bands (v0):
● 90: Effective on 8+ route types, wins at all three levels
● 80: Effective on 6-7 route types, wins at two levels
● 70: Effective on 4-5 route types, one-level specialist
● 60: Effective on 2-3 route types
● <60: One-trick route tree
Box-score mode: UNSCORED (null)

3) Hands / Catch Radius
Definition: Ability to catch the ball, including contested catches, off-target catches, and body control.
Inputs: Drop rate, contested catch rate, catch rate vs expected, catch radius grade
College bands (v0):
● 90: Drop rate ≤3%, contested catch rate 60%+, elite catch radius
● 80: Drop rate 4-5%, contested catch rate 52-59%
● 70: Drop rate 6-8%, contested catch rate 44-51%
● 60: Drop rate 9-11%, contested catch rate 36-43%
● <60: Drop rate >11% or contested catch rate <36%
Box-score mode: PROXY — Inputs: drop rate (if available), catch rate, contested catches

4) Yards After Catch (RAC)
Definition: Ability to create yards after the catch through elusiveness, power, and vision.
Inputs: YAC per reception, YAC above expected, broken tackles after catch, RAC grade
College bands (v0):
● 90: YAC/rec 8.0+, broken tackles 0.25+/rec
● 80: YAC/rec 6.5-7.9, broken tackles 0.18-0.24
● 70: YAC/rec 5.0-6.4, broken tackles 0.12-0.17
● 60: YAC/rec 3.5-4.9, broken tackles 0.06-0.11
● <60: YAC/rec <3.5 or broken tackles <0.06
Box-score mode: PROXY — Inputs: receiving yards, receptions, TDs (YAC inferred)

5) Release
Definition: Ability to defeat press coverage at the line of scrimmage.
Inputs: Release grade, success rate vs press, snap-to-stem time, release move variety
College bands (v0):
● 90: Dominates press, multiple release moves, success rate 80%+
● 80: Wins most press battles, 2-3 release moves, 70-79%
● 70: Adequate vs press, 1-2 moves, 60-69%
● 60: Struggles vs physical press, limited moves, 50-59%
● <60: Regularly jammed, <50% success
Box-score mode: UNSCORED (null)

6) Deep Ball Tracking
Definition: Ability to track and adjust to deep throws, over-the-shoulder catches, ball-in-air adjustment.
Inputs: Deep catch rate (20+ air yards), contested deep catch rate, adjustment grade
College bands (v0):
● 90: Deep catch rate 60%+, contested deep rate 50%+
● 80: Deep catch rate 50-59%, contested deep 40-49%
● 70: Deep catch rate 40-49%, contested deep 30-39%
● 60: Deep catch rate 30-39%, contested deep 20-29%
● <60: Deep catch rate <30%
Box-score mode: PROXY — Inputs: long receptions, deep targets (if available)

7) Blocking (WR/TE)
Definition: Willingness and effectiveness as a blocker in the run game and on screens.
Inputs: PFF run-block grade, screen-block grade, sustain rate, effort grade
College bands (v0):
● 90: PFF RB grade 80+, consistently seeks and sustains blocks
● 80: PFF RB grade 70-79, willing and effective
● 70: PFF RB grade 60-69, adequate effort
● 60: PFF RB grade 50-59, inconsistent effort
● <60: PFF RB grade <50, poor or unwilling blocker
Box-score mode: UNSCORED (null)

---

## BLOCKING CLUSTER — Locked Traits (6) [Offensive Line]

1) Pass Protection -- Technique
Definition: Hand placement, anchor, kick slide, mirror ability in pass protection.
Inputs: PFF pass-block grade, pressures allowed per pass-block snap, technique grade
College bands (v0):
● 90: PFF PBG 90+, pressures ≤2.5% of snaps
● 80: PFF PBG 80-89, pressures 2.6-4.0%
● 70: PFF PBG 70-79, pressures 4.1-6.0%
● 60: PFF PBG 60-69, pressures 6.1-8.5%
● <60: PFF PBG <60 or pressures >8.5%
Box-score mode: PROXY — Inputs: sacks allowed, team sack rate, penalties

2) Pass Protection -- Power / Anchor
Definition: Ability to absorb bull rush and power moves without giving ground.
Inputs: PFF bull-rush resistance grade, knockback rate, sack-on-power rate
College bands (v0):
● 90: Elite anchor, rarely moved, knockback rate ≤3%
● 80: Strong anchor, occasional give, knockback 4-7%
● 70: Average anchor, gives ground under elite rush, knockback 8-12%
● 60: Below-average anchor, vulnerable to power, knockback 13-18%
● <60: Weak anchor, consistently displaced
Box-score mode: UNSCORED (null)

3) Run Blocking -- Drive / Movement
Definition: Ability to drive defenders off the ball in run blocking. Generating movement at the point of attack.
Inputs: PFF run-block grade (drive component), yards before contact team average, run block win rate
College bands (v0):
● 90: PFF RBG 90+, consistently creates movement, RBWR 85%+
● 80: PFF RBG 80-89, good movement, RBWR 78-84%
● 70: PFF RBG 70-79, adequate movement, RBWR 70-77%
● 60: PFF RBG 60-69, limited movement, RBWR 62-69%
● <60: PFF RBG <60 or RBWR <62%
Box-score mode: PROXY — Inputs: team YPC, team rushing rank, rushing success rate

4) Run Blocking -- Second Level
Definition: Ability to disengage from first-level blocks and reach linebackers at the second level.
Inputs: PFF second-level grade, combo block to LB success rate, reach block success rate
College bands (v0):
● 90: Consistently reaches LBs, athletic enough to mirror in space
● 80: Usually reaches second level, functional in space
● 70: Gets to second level but limited sustain
● 60: Struggles to reach LBs, stiff in space
● <60: Cannot consistently reach second level
Box-score mode: UNSCORED (null)

5) Pulling / Movement Skills
Definition: Ability to pull, trap, and lead block on designed movement plays.
Inputs: PFF pulling grade, success rate on pull blocks, lead block effectiveness
College bands (v0):
● 90: Elite puller, arrives on target with force, grade 85+
● 80: Good puller, functional in movement scheme, grade 75-84
● 70: Average puller, adequate speed and targeting, grade 65-74
● 60: Below-average puller, slow or inaccurate, grade 55-64
● <60: Cannot effectively pull, grade <55
Box-score mode: UNSCORED (null)

6) Penalty Discipline (OL)
Definition: Ability to play technique-sound football without drawing flags.
Inputs: Penalties per game, false starts per game, holding calls per game
College bands (v0):
● 90: ≤0.15 penalties/game
● 80: 0.16-0.30 penalties/game
● 70: 0.31-0.50 penalties/game
● 60: 0.51-0.75 penalties/game
● <60: >0.75 penalties/game
Box-score mode: PROXY — Inputs: penalties committed (if tracked)

---

## PASS RUSH / PRESSURES CLUSTER — Locked Traits (7)

1) Get-Off / First Step
Definition: Explosive first step off the snap. Timing and burst.
Inputs: Time to pressure, first-step quickness grade, snap-to-contact time
College bands (v0):
● 90: Consistently wins the edge on first step, top-5% get-off timing
● 80: Quick first step, wins 65%+ of initial engagements
● 70: Average first step, wins 55-64% of initial engagements
● 60: Below-average first step, wins 45-54%
● <60: Slow off the ball, <45% initial wins
Box-score mode: UNSCORED (null)

2) Bend / Flexibility
Definition: Ability to turn the corner with hip flexibility and lean, especially on speed rush.
Inputs: Bend grade, corner-turn success rate, speed-to-power conversion rate
College bands (v0):
● 90: Elite bend, consistent corner-turns, grade 90+
● 80: Good bend, functional corner-turn, grade 80-89
● 70: Average bend, occasional corner-turn, grade 70-79
● 60: Below-average bend, limited flexibility, grade 60-69
● <60: Stiff, cannot consistently turn the corner
Box-score mode: UNSCORED (null)

3) Hand Usage
Definition: Ability to use hands effectively as a pass rusher — swipes, rips, chops, stab, club.
Inputs: Hand-win rate, hand technique variety, counter rate
College bands (v0):
● 90: Multiple effective hand moves, consistently wins hand battles, 3+ counters
● 80: Strong hand usage, 2-3 effective moves
● 70: Average hand usage, 1-2 moves
● 60: Limited hand moves, power-dependent
● <60: Poor hand usage, no counter ability
Box-score mode: UNSCORED (null)

4) Counter Moves
Definition: Ability to transition from a primary rush move to a counter when the primary is stopped.
Inputs: Counter rate, counter success rate, move-to-counter conversion rate
College bands (v0):
● 90: Elite counter ability, 3+ effective counters, conversion rate 40%+
● 80: Good counter, 2 effective counters, conversion 30-39%
● 70: Average counter, 1 effective counter, conversion 22-29%
● 60: Below-average counter, limited repertoire, conversion 15-21%
● <60: No effective counter, <15% conversion
Box-score mode: UNSCORED (null)

5) Pass Rush Productivity
Definition: Aggregate pass-rush production per snap. Sacks, hits, hurries per pass-rush snap.
Inputs: PRP (pass rush productivity), pressure rate, sack rate, QB hits per game
College bands (v0):
● 90: PRP 12.0+, pressure rate 16%+
● 80: PRP 9.0-11.9, pressure rate 12-15%
● 70: PRP 6.5-8.9, pressure rate 9-11%
● 60: PRP 4.5-6.4, pressure rate 6-8%
● <60: PRP <4.5 or pressure rate <6%
Box-score mode: PROXY — Inputs: sacks, TFL, total pressures (if available)

6) Run Defense (DL/EDGE)
Definition: Ability to set the edge, hold point of attack, and stop the run.
Inputs: PFF run-defense grade, run-stop rate, tackles for loss on run plays, gap discipline
College bands (v0):
● 90: PFF RDG 90+, run-stop rate 10%+, sets edge consistently
● 80: PFF RDG 80-89, run-stop rate 7.5-9.9%
● 70: PFF RDG 70-79, run-stop rate 5.5-7.4%
● 60: PFF RDG 60-69, run-stop rate 3.5-5.4%
● <60: PFF RDG <60 or run-stop rate <3.5%
Box-score mode: PROXY — Inputs: TFL, tackles, run stop wins

7) Motor / Relentlessness
Definition: Sustained effort through all four quarters. Chase speed, second-effort plays, never-quit mentality.
Inputs: Snap count, pressures in Q4, effort grade, chase-down plays
College bands (v0):
● 90: Elite motor, 90%+ snap share with no drop-off in Q4 production
● 80: Strong motor, 85%+ snap share, consistent Q4
● 70: Average motor, 75-84% snap share, slight Q4 drop
● 60: Below-average motor, 65-74% snap share, noticeable fatigue
● <60: Poor motor, <65% snap share or significant Q4 fall-off
Box-score mode: PROXY — Inputs: snap count, games played, production consistency

---

## COVERAGE / TACKLING CLUSTER — Locked Traits (8)

1) Man Coverage
Definition: Ability to play man-to-man coverage. Mirroring, hip flip, phase, trail technique.
Inputs: PFF man coverage grade, passer rating allowed in man, yards per coverage snap in man, targets per coverage snap
College bands (v0):
● 90: PFF man grade 90+, passer rating allowed ≤55
● 80: PFF man grade 80-89, passer rating allowed 56-72
● 70: PFF man grade 70-79, passer rating allowed 73-88
● 60: PFF man grade 60-69, passer rating allowed 89-105
● <60: PFF man grade <60 or passer rating allowed >105
Box-score mode: PROXY — Inputs: INTs, PBU, total pass breakups, completion % allowed (if available)

2) Zone Coverage
Definition: Ability to play zone defense. Zone awareness, pattern recognition, break on the ball.
Inputs: PFF zone grade, passer rating allowed in zone, zone EPA
College bands (v0):
● 90: PFF zone grade 90+, elite pattern reads, passer rating ≤60
● 80: PFF zone grade 80-89, passer rating 61-75
● 70: PFF zone grade 70-79, passer rating 76-90
● 60: PFF zone grade 60-69, passer rating 91-105
● <60: PFF zone grade <60 or passer rating >105
Box-score mode: PROXY — Inputs: INTs (zone INTs suggest pattern reads), PBU

3) Ball Skills
Definition: Ability to create turnovers. Interceptions, deflections, forced fumbles, ball tracking.
Inputs: INTs, PBU per coverage snap, forced fumbles, INT rate on targets, ball-skills grade
College bands (v0):
● 90: INT rate 5%+, PBU rate 18%+, creates 10+ turnover-worthy plays
● 80: INT rate 3.5-4.9%, PBU rate 14-17%
● 70: INT rate 2.5-3.4%, PBU rate 10-13%
● 60: INT rate 1.5-2.4%, PBU rate 7-9%
● <60: INT rate <1.5% or PBU rate <7%
Box-score mode: PROXY — Inputs: INTs, PBU, forced fumbles

4) Tackling -- Open Field
Definition: Ability to make tackles in space. Wrap-up rate, missed tackle rate in open field.
Inputs: Missed tackle rate, tackles per game, open-field tackle grade
College bands (v0):
● 90: Missed tackle rate ≤5%, 8+ solo tackles/game
● 80: Missed tackle rate 6-8%, 6-7.9 solo/game
● 70: Missed tackle rate 9-12%, 4.5-5.9 solo/game
● 60: Missed tackle rate 13-16%, 3-4.4 solo/game
● <60: Missed tackle rate >16%
Box-score mode: PROXY — Inputs: total tackles, solo tackles, missed tackles (if available)

5) Tackling -- Run Fits
Definition: Ability to execute run-fit assignments, fill gaps, and tackle in the box.
Inputs: Run-stop rate, gap discipline grade, tackles at or behind LOS on run plays
College bands (v0):
● 90: Run-stop rate 10%+, elite gap discipline
● 80: Run-stop rate 7.5-9.9%, strong gap fills
● 70: Run-stop rate 5.5-7.4%, adequate gap discipline
● 60: Run-stop rate 3.5-5.4%, occasional missed fits
● <60: Run-stop rate <3.5% or poor gap discipline
Box-score mode: PROXY — Inputs: TFL, total tackles, tackles for loss

6) Pursuit / Range
Definition: Ability to chase plays sideline to sideline. Pursuit angles, range, closing speed.
Inputs: Pursuit grade, tackles beyond 5 yards from alignment, sideline-to-sideline plays
College bands (v0):
● 90: Elite range, consistently makes plays outside assignment area, grade 90+
● 80: Good range, functional pursuit, grade 80-89
● 70: Average range, occasional pursuit plays, grade 70-79
● 60: Below-average range, limited to assignment area, grade 60-69
● <60: No range, grade <60
Box-score mode: UNSCORED (null)

7) Blitz Effectiveness
Definition: Ability to generate pressure when sent as a blitzer (LB/DB blitzes).
Inputs: Blitz pressure rate, blitz-to-sack rate, blitz snaps per game
College bands (v0):
● 90: Blitz pressure rate 30%+, blitz sack rate 10%+
● 80: Blitz pressure rate 22-29%, blitz sack rate 7-9%
● 70: Blitz pressure rate 16-21%, blitz sack rate 4-6%
● 60: Blitz pressure rate 10-15%, blitz sack rate 2-3%
● <60: Blitz pressure rate <10%
Box-score mode: PROXY — Inputs: sacks (non-DL), pressures, blitz frequency

8) Pass Rush (LB/DB)
Definition: For non-DL players, ability to rush the passer when called upon.
Inputs: PRP for non-DL, pressure rate as blitzer, pass-rush grade
College bands (v0):
● 90: PRP 10.0+ as LB/DB, elite blitz timing
● 80: PRP 7.0-9.9, strong blitz ability
● 70: PRP 4.5-6.9, functional blitzer
● 60: PRP 2.5-4.4, limited rush ability
● <60: PRP <2.5
Box-score mode: PROXY — Inputs: sacks, pressures from non-DL positions

---

## TOOLS CLUSTER — Locked Traits (9)

1) Height
Inputs: Verified roster height, combine measurement
Position-specific evaluation — see OPF for thresholds by position.

2) Weight
Inputs: Verified roster weight, combine measurement
Position-specific evaluation — see OPF for thresholds by position.

3) Arm Length
Inputs: Combine measurement, pro day measurement
Critical for OL, DL, EDGE, CB, WR. Less critical for RB, S, LB.

4) Hand Size
Inputs: Combine measurement
Critical for QB (ball security), OL (punch), DL (hand usage), WR/TE (catch radius).

5) Speed (40-yard dash)
Inputs: Combine 40, pro day 40, laser-timed 40
College bands (v0) — position-adjusted:
● 90: Top 5th percentile at position
● 80: Top 15th percentile
● 70: 25th-50th percentile
● 60: 50th-75th percentile
● <60: Below 75th percentile
Box-score mode: PROXY — Inputs: breakaway plays, long TDs, chase-down plays

6) Agility (Short Shuttle + 3-Cone)
Inputs: Combine shuttle, combine 3-cone, pro day numbers
Position-critical for: CB, WR, RB, LB, TE

7) Explosiveness (Vertical Jump + Broad Jump)
Inputs: Combine vertical, combine broad, pro day numbers
Position-critical for: WR, TE, EDGE, DL, CB, S

8) Strength (Bench Press + Functional)
Inputs: Combine bench reps (225 lbs), functional strength indicators (pancakes, knockbacks, bull-rush resistance)
Position-critical for: OL, DL, LB, TE, RB

9) Motor / Endurance
Definition: Sustained effort, snap count, and consistency across games.
Inputs: Snap count per game, games played, production consistency early-to-late season, Q4 production
College bands (v0):
● 90: 95%+ snap share, zero drop-off, 12+ games
● 80: 90-94% snap share, minimal drop-off
● 70: 80-89% snap share, slight late-season fade
● 60: 70-79% snap share or notable fatigue patterns
● <60: <70% snap share or significant durability concerns
Box-score mode: PROXY — Inputs: games played, games started, snap counts

---

## IQ CLUSTER — Locked Traits (7)

1) Pre-Snap Recognition
Definition: Ability to identify defensive/offensive alignments, make adjustments, and diagnose pre-snap.
Inputs: Audible success rate, hot-route adjustments, protection adjustments, pre-snap penalty rate
College bands (v0):
● 90: Consistently identifies blitz, coverage, and front, adjusts correctly 85%+
● 80: Strong pre-snap reads, adjusts 75-84%
● 70: Average pre-snap reads, adjusts 65-74%
● 60: Below-average, adjusts 55-64%
● <60: Poor pre-snap recognition, <55% correct adjustments
Box-score mode: UNSCORED (null)

2) Processing Speed
Definition: Speed of decision-making post-snap. Time from read to action.
Inputs: Time to throw (QB), time to decision, reaction time to play development
College bands (v0) — QB-specific:
● 90: Average time to throw ≤2.5s with elite accuracy
● 80: 2.5-2.7s with strong accuracy
● 70: 2.7-2.9s with adequate accuracy
● 60: 2.9-3.2s, holds ball
● <60: >3.2s average, consistently late
For non-QB: Assessed via film evaluation only.
Box-score mode: PROXY (QB only) — Inputs: time to throw, sack rate

3) Assignment Discipline
Definition: Consistency in executing assignment. Gap integrity, coverage responsibility, blocking assignment.
Inputs: Assignment grade, busted plays caused, blown coverage rate, gap discipline grade
College bands (v0):
● 90: ≤1 busted assignment per 100 snaps
● 80: 1.1-2.0 busts per 100 snaps
● 70: 2.1-3.5 busts per 100 snaps
● 60: 3.6-5.0 busts per 100 snaps
● <60: >5.0 busts per 100 snaps
Box-score mode: UNSCORED (null)

4) Situational Awareness
Definition: Performance in critical situations. Third down, red zone, two-minute, 4th quarter.
Inputs: Third-down conversion rate (by role), red-zone production, clutch performance index, 4th quarter production
College bands (v0):
● 90: Elite situational performance, production increases in critical situations
● 80: Strong situational awareness, consistent in big moments
● 70: Average, no significant situational splits
● 60: Below-average, production dips in key situations
● <60: Poor situational performance, significant negative splits
Box-score mode: PROXY — Inputs: 3rd down stats, red zone stats, 4th quarter stats (if available)

5) Penalty Avoidance
Definition: Ability to play clean football without committing penalties.
Inputs: Penalties per game, penalty yards per game, pre-snap penalties per game
College bands (v0):
● 90: ≤0.15 penalties/game
● 80: 0.16-0.30 penalties/game
● 70: 0.31-0.50 penalties/game
● 60: 0.51-0.80 penalties/game
● <60: >0.80 penalties/game
Box-score mode: PROXY — Inputs: penalties (if tracked individually)

6) Leadership / Intangibles
Definition: Captain status, team-first behaviors, huddle presence, ability to elevate teammates.
Inputs: Captain designation, team awards, coach testimony, culture indicators
College bands (v0):
● 90: Multi-year captain, documented culture driver, team-first leader
● 80: Captain, strong locker room presence
● 70: Respected teammate, occasional leadership moments
● 60: Neutral presence, follows but doesn't lead
● <60: Reported character/effort concerns
Box-score mode: PROXY — Inputs: captain status, team awards

7) Play Recognition (Defense)
Definition: Ability to read offensive formations, recognize play types, and react accordingly.
Inputs: Play-recognition grade, read-and-react time, correct fit rate on run plays, coverage recognition rate
College bands (v0):
● 90: Elite play recognition, consistently diagnoses before the ball is out, grade 90+
● 80: Strong recognition, beats blocks to the play, grade 80-89
● 70: Average recognition, functional reads, grade 70-79
● 60: Below-average, slow to diagnose, grade 60-69
● <60: Poor recognition, grade <60
Box-score mode: UNSCORED (null)

---

# ARCHETYPE LIBRARY

Archetype Library

ARCHETYPE LIBRARY v1 — NUMERIC
GATE RULES (College v1)

Global assignment rules (once):
Primary archetype assignment:
● Relevant Skill KR must clear the archetype floor.
● All primary traits must clear their gate.
● If support traits are listed, at least one support trait must clear its gate unless explicitly stated otherwise.
● Required traits must be scored (non-null) in the active data layer.

Default floor by archetype type:
● Franchise / alpha archetypes: relevant Skill KR ≥ 82
● Starter / core role archetypes: relevant Skill KR ≥ 78
● Developmental archetypes: no strict Skill KR floor

Secondary archetype assignment:
● Same logic, but you may relax the relevant Skill KR floor by −5.

---

## A) QUARTERBACK ARCHETYPES (6)

1) Dual-Threat QB
● Relevant Skill KR: Passing Cluster KR ≥ 78 AND Rushing Cluster KR ≥ 78
● Primary traits: Arm Talent ≥ 75, Accuracy-Intermediate ≥ 75, Burst/Acceleration ≥ 80, Vision/Patience ≥ 75
● Support traits: Pocket Presence ≥ 70, Elusiveness ≥ 75
● Identity: Can beat you with arm and legs. Creates with both. Not a runner who throws or a thrower who scrambles — genuinely dangerous in both dimensions.

2) Pocket Passer
● Relevant Skill KR: Passing Cluster KR ≥ 82
● Primary traits: Accuracy-Short ≥ 82, Accuracy-Intermediate ≥ 80, Pocket Presence ≥ 82, Ball Placement ≥ 80
● Support traits: Arm Talent ≥ 78, Timing/Anticipation ≥ 80
● Identity: Classic drop-back distributor. Wins from the pocket with accuracy, timing, and reads. Does not need to run to create.

3) Scrambler / Improviser
● Relevant Skill KR: Rushing Cluster KR ≥ 80
● Primary traits: Elusiveness ≥ 82, Burst/Acceleration ≥ 80, Arm Talent ≥ 72
● Support traits: Accuracy-Short ≥ 72, Pocket Presence ≥ 65
● Identity: Extends plays and creates off-script. More runner than passer in terms of primary weapon, but can make throws when he creates time.

4) Game Manager
● Relevant Skill KR: IQ Cluster KR ≥ 80
● Primary traits: Pre-Snap Recognition ≥ 82, Assignment Discipline ≥ 80, Accuracy-Short ≥ 78, Ball Placement ≥ 78
● Support traits: Penalty Avoidance ≥ 78, Situational Awareness ≥ 78
● Identity: Won't lose you the game. Efficient, disciplined, makes the right reads. Ceiling is limited but floor is high. Wins with the team around him.

5) Gunslinger
● Relevant Skill KR: Passing Cluster KR ≥ 80
● Primary traits: Arm Talent ≥ 85, Accuracy-Deep ≥ 80, Play-Action Execution ≥ 78
● Support traits: Accuracy-Intermediate ≥ 75, Pocket Presence ≥ 72
● Identity: Pushes the ball downfield aggressively. Elite arm talent, willing to take shots. Higher variance — big plays and turnovers.

6) RPO Specialist
● Relevant Skill KR: Passing Cluster KR ≥ 75 AND IQ Cluster KR ≥ 80
● Primary traits: Pre-Snap Recognition ≥ 82, Accuracy-Short ≥ 78, Play-Action Execution ≥ 80
● Support traits: Rushing/Burst ≥ 72, Processing Speed ≥ 78
● Identity: Built for RPO-heavy systems. Reads the unblocked defender, makes the correct give/pull/throw decision consistently. Not a pure passer or runner but a system-optimized decision-maker.

---

## B) RUNNING BACK ARCHETYPES (5)

7) Power Back
● Relevant Skill KR: Rushing Cluster KR ≥ 80
● Primary traits: Contact Balance/Power ≥ 82, Vision/Patience ≥ 78
● Support traits: Ball Security ≥ 75, Burst ≥ 72
● Tools gate: Weight ≥ 215
● Identity: Runs through contact. Between-the-tackles pounder. Moves the pile.

8) Speed / Home-Run Back
● Relevant Skill KR: Rushing Cluster KR ≥ 78
● Primary traits: Burst/Acceleration ≥ 85, Speed (40) ≥ 85, Elusiveness ≥ 78
● Support traits: Vision/Patience ≥ 72, Ball Security ≥ 72
● Identity: Turns the corner and is gone. One cut, accelerate, score. Big-play dependent.

9) All-Purpose Back
● Relevant Skill KR: Rushing Cluster KR ≥ 78 AND Receiving Cluster KR ≥ 75
● Primary traits: Receiving Ability ≥ 78, Vision/Patience ≥ 78, Burst ≥ 75
● Support traits: Pass Protection ≥ 70, Elusiveness ≥ 72, Contact Balance ≥ 72
● Identity: Three-down back. Runs, catches, and protects. Complete skill set.

10) Scat Back / Change-of-Pace
● Relevant Skill KR: Rushing Cluster KR ≥ 75
● Primary traits: Elusiveness ≥ 82, Receiving Ability ≥ 78
● Support traits: Burst ≥ 78, Speed ≥ 78
● Identity: Complementary piece. Creates in space, not between tackles. Best in 10-15 touch range.

11) Short-Yardage / Goal-Line Specialist
● Relevant Skill KR: Rushing Cluster KR ≥ 72
● Primary traits: Contact Balance/Power ≥ 85
● Support traits: Vision ≥ 70
● Tools gate: Weight ≥ 225
● Identity: Gets you 1-2 yards when you need it. Red zone and short-yardage weapon.

---

## C) WIDE RECEIVER ARCHETYPES (5)

12) X-Receiver / Boundary WR
● Relevant Skill KR: Receiving Cluster KR ≥ 80
● Primary traits: Route Running-Precision ≥ 80, Release ≥ 80, Hands ≥ 78
● Support traits: Deep Ball Tracking ≥ 75, Route Tree Breadth ≥ 75
● Tools gate: Height ≥ 6'1 OR Hands ≥ 85 (can compensate with catch radius)
● Identity: Wins 1-on-1 outside. Primary target. Beats press, runs full route tree, wins contested catches.

13) Z-Receiver / Field WR
● Relevant Skill KR: Receiving Cluster KR ≥ 78
● Primary traits: Route Running-Precision ≥ 78, Deep Ball Tracking ≥ 78, Speed ≥ 80
● Support traits: Hands ≥ 75, YAC ≥ 72
● Identity: Vertical threat from the field side. Speed and route running combination. Pre-snap motion weapon.

14) Slot Receiver
● Relevant Skill KR: Receiving Cluster KR ≥ 78
● Primary traits: Route Running-Precision ≥ 80, YAC ≥ 80, Hands ≥ 78
● Support traits: Elusiveness ≥ 75, Route Tree Breadth ≥ 78
● Identity: Works the middle of the field. YAC monster. Quick-game and intermediate route specialist.

15) Deep Threat / Burner
● Relevant Skill KR: Receiving Cluster KR ≥ 75
● Primary traits: Speed ≥ 88, Deep Ball Tracking ≥ 80
● Support traits: Route Running ≥ 70, Hands ≥ 72
● Identity: Takes the top off the defense. One-trick that must be respected. Opens everything else underneath.

16) Possession Receiver
● Relevant Skill KR: Receiving Cluster KR ≥ 78
● Primary traits: Hands ≥ 85, Route Running-Precision ≥ 80, Route Tree Breadth ≥ 80
● Support traits: Situational Awareness ≥ 78
● Identity: Moves the chains. Reliable hands, precise routes, finds soft spots in zone. Not a big-play threat but never drops a pass.

---

## D) TIGHT END ARCHETYPES (3)

17) Receiving TE (Move/Flex)
● Relevant Skill KR: Receiving Cluster KR ≥ 78
● Primary traits: Route Running-Precision ≥ 78, Hands ≥ 78, YAC ≥ 75
● Support traits: Blocking ≥ 65, Release ≥ 70
● Identity: Matchup weapon. Lines up in-line, slot, and detached. Creates mismatches against LBs and safeties. Average to poor blocker.

18) Blocking TE (Y-TE / Inline)
● Relevant Skill KR: Blocking Cluster KR ≥ 78
● Primary traits: Run Blocking-Drive ≥ 80, Pass Protection ≥ 75
● Support traits: Hands ≥ 68, Receiving ≥ 65
● Tools gate: Weight ≥ 245
● Identity: Extra offensive lineman. Seals the edge, moves people in the run game. Limited receiving tree but catches what's thrown to him.

19) Complete TE
● Relevant Skill KR: Receiving Cluster KR ≥ 78 AND Blocking Cluster KR ≥ 75
● Primary traits: Route Running ≥ 78, Hands ≥ 78, Run Blocking ≥ 78, Pass Protection ≥ 72
● Support traits: YAC ≥ 72, Release ≥ 70
● Identity: Does everything. Blocks, catches, creates mismatches. Does not tip run/pass by alignment. Rare.

---

## E) OFFENSIVE LINE ARCHETYPES (4)

20) Mauler / Road Grader
● Relevant Skill KR: Blocking Cluster KR ≥ 80
● Primary traits: Run Blocking-Drive ≥ 85, Pass Protection-Power ≥ 80
● Support traits: Pulling ≥ 72
● Tools gate: Weight ≥ 305, Strength ≥ 82
● Identity: Wins at the point of attack with brute force. Creates movement in the run game. Can anchor in pass pro but not a technician.

21) Technician / Pass Protector
● Relevant Skill KR: Blocking Cluster KR ≥ 80
● Primary traits: Pass Protection-Technique ≥ 85, Penalty Discipline ≥ 80
● Support traits: Run Blocking-Second Level ≥ 72, Pass Protection-Power ≥ 75
● Identity: Elite hand placement and footwork. Wins with technique, not always power. Best in pass-first schemes.

22) Athletic OL / Zone Blocker
● Relevant Skill KR: Blocking Cluster KR ≥ 78
● Primary traits: Run Blocking-Second Level ≥ 82, Pulling ≥ 80, Agility ≥ 78
● Support traits: Pass Protection-Technique ≥ 75, Run Blocking-Drive ≥ 72
● Identity: Moves well in space. Built for zone run schemes. Reaches LBs, pulls effectively, screens. May sacrifice pure power.

23) Versatile OL
● Relevant Skill KR: Blocking Cluster KR ≥ 76
● Primary traits: Pass Protection-Technique ≥ 76, Run Blocking-Drive ≥ 76, Penalty Discipline ≥ 76
● Support traits: Multiple position experience (T/G/C)
● Identity: Can play multiple OL positions competently. Valuable roster depth. Not elite at any one thing but good enough everywhere.

---

## F) DEFENSIVE LINE ARCHETYPES (4)

24) Interior Pass Rusher (3-Technique)
● Relevant Skill KR: Pass Rush Cluster KR ≥ 80
● Primary traits: Get-Off ≥ 82, Hand Usage ≥ 80, Pass Rush Productivity ≥ 80
● Support traits: Counter Moves ≥ 75, Run Defense ≥ 70
● Identity: Disrupts the pocket from the interior. Quick twitch, hand speed, multiple moves. Aaron Donald archetype.

25) Nose Tackle / Run Stuffer
● Relevant Skill KR: Coverage/Tackling Cluster KR ≥ 78 (run defense component)
● Primary traits: Run Defense ≥ 85, Strength ≥ 85
● Support traits: Motor ≥ 75, Pass Rush Productivity ≥ 65
● Tools gate: Weight ≥ 300
● Identity: Eats double teams. Controls the A-gap. Frees up LBs. Run game anchor.

26) Two-Gap DL
● Relevant Skill KR: Combined run defense + pass rush ≥ 78
● Primary traits: Run Defense ≥ 80, Strength ≥ 82, Hand Usage ≥ 78
● Support traits: Motor ≥ 75, Pass Rush ≥ 72
● Identity: Controls two gaps. Reads and reacts rather than attacking. Classic 3-4 DE or 4-3 DT in a two-gap scheme.

27) Edge Rusher
● Relevant Skill KR: Pass Rush Cluster KR ≥ 80
● Primary traits: Get-Off ≥ 82, Bend ≥ 80, Pass Rush Productivity ≥ 82
● Support traits: Hand Usage ≥ 75, Counter Moves ≥ 72, Run Defense ≥ 68
● Identity: Gets to the QB from the edge. Speed-to-power conversion. Multiple rush moves. The most valuable non-QB archetype.

---

## G) LINEBACKER ARCHETYPES (4)

28) Off-Ball Thumper (MIKE)
● Relevant Skill KR: Coverage/Tackling Cluster KR ≥ 80
● Primary traits: Tackling-Run Fits ≥ 82, Play Recognition ≥ 80, Pursuit ≥ 78
● Support traits: Blitz Effectiveness ≥ 72, Man Coverage ≥ 65
● Identity: Downhill run defender. Fills gaps, stacks blocks, makes tackles. Limited in coverage but dominant against the run.

29) Coverage LB (WILL)
● Relevant Skill KR: Coverage component ≥ 78
● Primary traits: Man Coverage ≥ 78, Zone Coverage ≥ 78, Pursuit ≥ 78
● Support traits: Tackling-Open Field ≥ 75, Ball Skills ≥ 72
● Identity: Can match up with TEs and RBs in coverage. Range player. Modern LB who doesn't come off the field on passing downs.

30) Edge-Setting LB (SAM/STAR)
● Relevant Skill KR: Combined tackling + blitz ≥ 78
● Primary traits: Run Defense (edge set) ≥ 80, Blitz Effectiveness ≥ 78, Tackling-Run Fits ≥ 78
● Support traits: Coverage ≥ 68, Motor ≥ 75
● Identity: Hybrid LB/EDGE. Sets the edge against the run, blitzes effectively, drops into short zone. Versatile piece in multiple schemes.

31) Three-Down LB
● Relevant Skill KR: Coverage/Tackling ≥ 78 AND Blitz ≥ 75
● Primary traits: Tackling-Run Fits ≥ 78, Man Coverage ≥ 75, Zone Coverage ≥ 78, Play Recognition ≥ 80
● Support traits: Pursuit ≥ 75, Blitz Effectiveness ≥ 72
● Identity: Does everything at a high level. Runs, covers, and blitzes. Stays on the field for all three downs. Rare.

---

## H) DEFENSIVE BACK ARCHETYPES (6)

32) Shutdown Corner
● Relevant Skill KR: Coverage Cluster KR ≥ 82
● Primary traits: Man Coverage ≥ 85, Zone Coverage ≥ 78, Ball Skills ≥ 78
● Support traits: Tackling-Open Field ≥ 70, Speed ≥ 80
● Identity: Erases one side of the field. Can be left on an island. Opposing QBs avoid his receiver. Shadow ability.

33) Zone Corner
● Relevant Skill KR: Coverage Cluster KR ≥ 78
● Primary traits: Zone Coverage ≥ 82, Ball Skills ≥ 80, Play Recognition ≥ 78
● Support traits: Man Coverage ≥ 70, Tackling ≥ 72
● Identity: Pattern-read specialist. Baits throws, creates turnovers from zone. Not a man-to-man shadow but thrives in zone schemes.

34) Nickel / Slot Corner
● Relevant Skill KR: Coverage Cluster KR ≥ 78
● Primary traits: Man Coverage ≥ 80, Tackling-Open Field ≥ 78, Agility ≥ 80
● Support traits: Zone Coverage ≥ 75, Blitz Effectiveness ≥ 70
● Identity: Defends the slot. Tough enough to tackle in the box, quick enough to cover inside receivers. Hybrid run/pass defender.

35) Ball-Hawking Safety (FS)
● Relevant Skill KR: Coverage Cluster KR ≥ 80
● Primary traits: Zone Coverage ≥ 82, Ball Skills ≥ 82, Pursuit ≥ 78
● Support traits: Man Coverage ≥ 72, Tackling-Open Field ≥ 72
● Identity: Center fielder. Reads QB eyes, breaks on the ball, creates turnovers. Range to cover deep middle and half. Playmaker.

36) Box Safety (SS)
● Relevant Skill KR: Combined coverage + tackling ≥ 78
● Primary traits: Tackling-Run Fits ≥ 80, Tackling-Open Field ≥ 80, Man Coverage ≥ 75
● Support traits: Blitz Effectiveness ≥ 75, Zone Coverage ≥ 72
● Identity: Run-support safety. Fills the box, tackles in space, covers TEs. Physical presence. Less range but more impact near LOS.

37) Versatile Safety / Hybrid
● Relevant Skill KR: Coverage ≥ 78 AND Tackling ≥ 78
● Primary traits: Man Coverage ≥ 78, Zone Coverage ≥ 78, Tackling-Open Field ≥ 78, Tackling-Run Fits ≥ 75
● Support traits: Blitz Effectiveness ≥ 72, Ball Skills ≥ 72
● Identity: Can play FS, SS, nickel, and dime roles. Does everything. Alignment-versatile. Defensive coordinators' dream piece.

---

## I) SPECIAL TEAMS ARCHETYPES (3)

38) Precision Kicker
● Primary traits: FG% (all distances), FG% 40+ yards, clutch FG conversion
● Identity: Reliable from distance. Money in clutch situations.

39) Booming Punter
● Primary traits: Punt average, net punt average, inside-20 %, hangtime
● Identity: Flips the field. Controls field position. Directional and hangtime weapon.

40) Dynamic Returner
● Primary traits: Return average, return TDs, fumble rate, decision-making on fair catch/return
● Identity: Changes field position and scores on returns. Explosive in space.

---

# SYSTEM DEMAND PROFILES

System Demand Profiles

SYSTEM DEMAND PROFILES define which archetypes each offensive and defensive system requires at the A (critical), B (important), and C (complementary) tiers, along with ideal impact modifiers and critical-missing risks.

---

## OFFENSIVE SYSTEM DEMAND PROFILES

### 1) SPREAD
Identity: 3-4 WR sets, spread the field horizontally, RPO elements, tempo, numbers advantages in the box.
A: Dual-Threat QB OR RPO Specialist; Speed/Home-Run Back; X-Receiver; Slot Receiver
B: Z-Receiver; Receiving TE; Athletic OL / Zone Blocker
C: Scat Back; Deep Threat; Versatile OL
Ideal Impact Modifiers: Primary Engine (QB); Force Multiplier (slot WR)
Critical-missing risk: If QB can't make RPO reads or the OL can't sustain tempo, the whole system stalls.

### 2) AIR RAID
Identity: 4 WR, quick game, mesh concepts, vertical shots, high-volume passing, minimal run game.
A: Pocket Passer OR Gunslinger; X-Receiver; Slot Receiver (2); Z-Receiver
B: Possession Receiver; Scat Back; Technician OL / Pass Protector
C: Receiving TE; Speed Back; Versatile OL
Ideal Impact Modifiers: Primary Engine (QB); Specialist Anchor (outside WR)
Critical-missing risk: If the OL can't protect, the high-volume passing collapses. If WRs can't separate quickly, timing breaks down.

### 3) RPO (RUN-PASS OPTION)
Identity: Pre-snap reads, packaged plays, QB decides give/keep/throw based on conflict player. Run-heavy DNA with pass elements.
A: Dual-Threat QB OR RPO Specialist; Power Back OR All-Purpose Back; Athletic OL (3+)
B: Slot Receiver; X-Receiver; Blocking TE OR Complete TE
C: Z-Receiver; Speed Back; Mauler OL
Ideal Impact Modifiers: Primary Engine (QB decision-making); Force Multiplier (TE)
Critical-missing risk: If QB can't read the conflict player, or if OL can't block while QB holds the ball, the packaged element dies.

### 4) PRO STYLE
Identity: Under-center, play-action, multiple formations, balanced run/pass, 2-TE/1-RB and 1-TE/2-WR packages. Requires a QB who can manage the full playbook.
A: Pocket Passer OR Game Manager; All-Purpose Back OR Power Back; Complete TE; Technician OL (3+)
B: X-Receiver; Blocking TE; Z-Receiver; Mauler OL
C: Slot Receiver; Scat Back; Versatile OL
Ideal Impact Modifiers: Secondary Engine (TE); Force Multiplier (blocking TE)
Critical-missing risk: If TE group can't block AND catch, the formation versatility breaks down. If the OL can't play-action sell, the passing game loses its advantage.

### 5) WEST COAST
Identity: Short-to-intermediate passing game as the run game. Timing routes, high completion %, YAC-dependent, play-action built off horizontal passing game.
A: Pocket Passer OR Game Manager; All-Purpose Back; Slot Receiver; Possession Receiver
B: Complete TE OR Receiving TE; X-Receiver; Technician OL
C: Z-Receiver; Scat Back; Zone Blocker OL
Ideal Impact Modifiers: Primary Engine (QB); Force Multiplier (slot WR)
Critical-missing risk: If receivers can't create YAC, the short passing game doesn't generate enough explosive plays. If QB timing is off, the whole rhythm collapses.

### 6) POWER RUN
Identity: Downhill run game, gap scheme, pulling guards, fullback lead plays, play-action off heavy run. Physical identity.
A: Power Back; Mauler OL (3+); Blocking TE
B: Pocket Passer OR Game Manager; Short-Yardage Specialist; X-Receiver
C: Z-Receiver; Complete TE; Possession Receiver
Ideal Impact Modifiers: Force Multiplier (blocking TE); Specialist Anchor (mauler OL)
Critical-missing risk: If the OL can't generate movement at the point of attack, the entire identity dies. If there's no play-action threat, defenses load the box with impunity.

### 7) OPTION / TRIPLE OPTION
Identity: QB reads unblocked defenders, pitch/keep/give decisions. Minimal passing game. Speed at skill positions. Assignment football.
A: Dual-Threat QB OR Scrambler; Speed Back; Scat Back
B: Athletic OL (3+); Blocking TE; Slot Receiver
C: X-Receiver; Power Back; Versatile OL
Ideal Impact Modifiers: Primary Engine (QB); Force Multiplier (slot/pitch back)
Critical-missing risk: If QB can't execute the mesh and read the pitch key, the system doesn't function. If backs can't hit the edge with speed, the option is useless.

### 8) PISTOL
Identity: QB aligned behind center at 4 yards. Run-game versatility (zone, power, option looks from same formation). Can go under center or shotgun. Play-action focused.
A: Dual-Threat QB; All-Purpose Back OR Power Back; Athletic OL OR Mauler OL (3+)
B: Complete TE; X-Receiver; Z-Receiver
C: Slot Receiver; Speed Back; Versatile OL
Ideal Impact Modifiers: Primary Engine (QB); Force Multiplier (run game identity)
Critical-missing risk: Requires a QB who can run and throw effectively. If the run game isn't credible, play-action has no teeth.

---

## DEFENSIVE SYSTEM DEMAND PROFILES

### 1) 4-3 (OVER/UNDER)
Identity: 4 down linemen, 3 LBs. Aggressive DL, LBs flow to the ball. Even front, gap-sound.
A: Edge Rusher (2); Interior Pass Rusher (3T); Off-Ball Thumper (MIKE); Shutdown Corner OR Zone Corner
B: Nose Tackle; Three-Down LB OR Coverage LB; Ball-Hawking Safety; Box Safety
C: Nickel Corner; Two-Gap DL; Versatile Safety
Ideal Impact Modifiers: Specialist Anchor (edge); Force Multiplier (MIKE)
Critical-missing risk: Without edge pressure, the back end is exposed. Without a MIKE who can run-fit AND cover, offenses exploit the middle.

### 2) 3-4 (ODD FRONT)
Identity: 3 down linemen, 4 LBs. Versatility in blitz packages. Two-gap DL, multiple LB roles.
A: Two-Gap DL OR Nose Tackle; Edge-Setting LB (SAM) (2); Edge Rusher (as OLB)
B: Three-Down LB; Coverage LB; Shutdown Corner; Ball-Hawking Safety
C: Interior Pass Rusher; Box Safety; Nickel Corner; Versatile Safety
Ideal Impact Modifiers: Force Multiplier (EDGE OLB); Specialist Anchor (NT)
Critical-missing risk: If the NT can't hold the point and eat doubles, the whole front collapses. If OLBs can't rush AND drop, the scheme becomes predictable.

### 3) NICKEL / 4-2-5
Identity: 5 DBs as base. Built for the modern passing game. Lighter, faster, better in space.
A: Interior Pass Rusher; Edge Rusher; Nickel Corner; Shutdown Corner; Ball-Hawking Safety
B: Coverage LB; Three-Down LB; Zone Corner; Box Safety OR Versatile Safety
C: Nose Tackle; Off-Ball Thumper; Versatile Safety
Ideal Impact Modifiers: Force Multiplier (nickel); Specialist Anchor (edge)
Critical-missing risk: Lighter front means run defense is vulnerable. If interior DL can't hold up, offenses run at will in nickel.

### 4) 3-3-5 (WIDE TACKLE SIX)
Identity: 3 DL, 3 LB, 5 DB. Hybrid front, multiple looks, overload blitzes, versatility.
A: Versatile Safety; Edge-Setting LB; Nickel Corner; Interior Pass Rusher
B: Three-Down LB; Coverage LB; Shutdown Corner; Ball-Hawking Safety
C: Nose Tackle; Edge Rusher; Box Safety
Ideal Impact Modifiers: Force Multiplier (hybrid safety/LB); Specialist Anchor (interior DL)
Critical-missing risk: If the safeties can't play in the box AND cover, the scheme is exposed. Requires elite versatility across the back seven.

### 5) 4-4 (EIGHT-MAN FRONT)
Identity: 8 in the box. Stop the run first. Heavy, physical, downhill. Vulnerable to passing game by design — bet on physicality.
A: Nose Tackle; Edge Rusher; Off-Ball Thumper (2); Two-Gap DL
B: Edge-Setting LB; Shutdown Corner (must survive on island); Box Safety
C: Ball-Hawking Safety; Zone Corner; Interior Pass Rusher
Ideal Impact Modifiers: Force Multiplier (MIKE/run game); Specialist Anchor (NT/DL)
Critical-missing risk: If corners can't survive in man without safety help, the passing game torches you. If LBs can't tackle in space, the physicality identity is wasted.

### 6) 46 DEFENSE
Identity: Aggressive, pressure-based. 6 men near LOS, man coverage behind it. SS in the box. Gap control + QB pressure as identity.
A: Edge Rusher; Interior Pass Rusher; Box Safety; Off-Ball Thumper; Shutdown Corner (2 — must survive on island)
B: Nose Tackle; Three-Down LB; Ball-Hawking Safety
C: Coverage LB; Nickel Corner; Versatile Safety
Ideal Impact Modifiers: Specialist Anchor (edge pressure); Force Multiplier (box safety)
Critical-missing risk: If corners can't play man without help, the aggressive box look is exploited deep. Requires elite corner play.

---

# POSITION TRAIT WEIGHTING (OPF) -- FOOTBALL

Position Trait Weighting

All weights are TOTAL-PLAYER percentages. Each position has an Overall Position Framework (OPF) that allocates total weight across the four component KRs: AKR (Attack/Offense), DKR (Defense), TKR (Tools), IQKR (IQ).

Within each component KR, the relevant trait clusters are weighted to sum to 100% of that component.

---

## QUARTERBACK (QB) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 62%
Defense (DKR): 2% (effort plays, scramble discipline)
Tools (TKR): 14%
IQ (IQKR): 22%

AKR — ATTACK/OFFENSE KR (100%)
Passing — 72%
● Accuracy-Short: 14%
● Accuracy-Intermediate: 16%
● Accuracy-Deep: 10%
● Arm Talent: 12%
● Timing/Anticipation: 8%
● Pocket Presence: 6%
● Ball Placement: 4%
● Play-Action Execution: 2%
Rushing — 18%
● Burst/Acceleration: 6%
● Elusiveness: 5%
● Vision/Patience: 4%
● Ball Security: 3%
Playmaking (pass creation) — 10%
● Extending plays / off-script production: 5%
● Designed QB runs: 3%
● Screen / RPO execution: 2%

DKR — DEFENSE KR (100%) [minimal weight for QB]
● Effort on scramble/interception returns: 50%
● Willingness to block on trick plays: 50%

TKR — TOOLS KR (100%)
● Height: 15%
● Weight: 5%
● Arm Length: 5%
● Hand Size: 15%
● Speed (40): 15%
● Agility: 10%
● Explosiveness: 5%
● Strength: 5%
● Motor/Endurance: 25%

IQKR — IQ KR (100%)
● Pre-Snap Recognition: 25%
● Processing Speed: 25%
● Assignment Discipline: 10%
● Situational Awareness: 20%
● Penalty Avoidance: 10%
● Leadership: 10%

---

## RUNNING BACK (RB) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 60%
Defense (DKR): 4% (blocking effort, fumble recovery)
Tools (TKR): 20%
IQ (IQKR): 16%

AKR — ATTACK/OFFENSE KR (100%)
Rushing — 55%
● Vision/Patience: 14%
● Contact Balance/Power: 12%
● Elusiveness: 10%
● Burst/Acceleration: 10%
● Ball Security: 5%
● Pass Protection (RB): 4%
Receiving — 30%
● Receiving Ability (RB): 12%
● Route Running: 8%
● Hands: 6%
● YAC: 4%
Blocking — 15%
● Pass Protection: 10%
● Run Blocking (lead): 5%

TKR — TOOLS KR (100%)
● Speed (40): 22%
● Agility: 15%
● Explosiveness: 15%
● Strength: 12%
● Weight: 10%
● Height: 6%
● Motor/Endurance: 20%

IQKR — IQ KR (100%)
● Pre-Snap Recognition: 15%
● Processing Speed: 15%
● Assignment Discipline: 20%
● Situational Awareness: 20%
● Penalty Avoidance: 10%
● Leadership: 10%
● Play Recognition (blitz pickup): 10%

---

## WIDE RECEIVER -- X/Z/SLOT (WR) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 65%
Defense (DKR): 3% (blocking, effort)
Tools (TKR): 20%
IQ (IQKR): 12%

AKR — ATTACK/OFFENSE KR (100%)
Receiving — 80%
● Route Running-Precision: 20%
● Route Tree Breadth: 10%
● Hands/Catch Radius: 18%
● YAC: 12%
● Release: 10%
● Deep Ball Tracking: 6%
● Blocking (WR): 4%
Rushing (end-arounds, jet sweeps) — 5%
● Burst/Acceleration: 3%
● Elusiveness: 2%
Creation — 15%
● Separation creation: 8%
● Contested catch ability: 7%

TKR — TOOLS KR (100%)
● Speed (40): 25%
● Agility: 15%
● Explosiveness: 15%
● Height: 12%
● Weight: 5%
● Arm Length: 3%
● Hand Size: 5%
● Motor/Endurance: 20%

IQKR — IQ KR (100%)
● Pre-Snap Recognition: 15%
● Processing Speed: 10%
● Assignment Discipline: 20%
● Situational Awareness: 25%
● Penalty Avoidance: 15%
● Leadership: 15%

---

## TIGHT END (TE) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 55%
Defense (DKR): 3% (effort, scramble drill)
Tools (TKR): 24%
IQ (IQKR): 18%

AKR — ATTACK/OFFENSE KR (100%)
Receiving — 50%
● Route Running-Precision: 12%
● Hands/Catch Radius: 12%
● YAC: 8%
● Release: 6%
● Deep Ball Tracking: 4%
● Route Tree Breadth: 8%
Blocking — 40%
● Run Blocking-Drive: 16%
● Pass Protection: 12%
● Second-Level Blocking: 6%
● Pulling/Movement: 6%
Rushing (TE power, end-arounds) — 10%
● Contact Balance: 5%
● Burst: 5%

TKR — TOOLS KR (100%)
● Height: 12%
● Weight: 12%
● Arm Length: 8%
● Hand Size: 8%
● Speed (40): 15%
● Agility: 10%
● Explosiveness: 10%
● Strength: 15%
● Motor/Endurance: 10%

IQKR — IQ KR (100%)
● Pre-Snap Recognition: 18%
● Assignment Discipline: 25%
● Situational Awareness: 20%
● Penalty Avoidance: 12%
● Leadership: 15%
● Processing Speed: 10%

---

## OFFENSIVE TACKLE (LT/RT) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 55%
Defense (DKR): 2% (hustle, effort downfield)
Tools (TKR): 28%
IQ (IQKR): 15%

AKR — ATTACK/OFFENSE KR (100%)
Blocking — 100%
● Pass Protection-Technique: 30%
● Pass Protection-Power/Anchor: 20%
● Run Blocking-Drive: 20%
● Run Blocking-Second Level: 12%
● Pulling/Movement: 10%
● Penalty Discipline: 8%

TKR — TOOLS KR (100%)
● Height: 12%
● Weight: 10%
● Arm Length: 18%
● Hand Size: 8%
● Speed (40): 5%
● Agility: 12%
● Explosiveness: 8%
● Strength: 18%
● Motor/Endurance: 9%

IQKR — IQ KR (100%)
● Pre-Snap Recognition: 25%
● Assignment Discipline: 30%
● Penalty Avoidance: 20%
● Situational Awareness: 15%
● Leadership: 10%

Note: LT receives a +2% premium on Pass Protection-Technique weighting vs RT due to blind-side protection value. RT receives a +2% premium on Run Blocking-Drive.

---

## INTERIOR OFFENSIVE LINE (IOL — C/G) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 55%
Defense (DKR): 2%
Tools (TKR): 26%
IQ (IQKR): 17%

AKR — ATTACK/OFFENSE KR (100%)
Blocking — 100%
● Pass Protection-Technique: 22%
● Pass Protection-Power/Anchor: 22%
● Run Blocking-Drive: 22%
● Run Blocking-Second Level: 10%
● Pulling/Movement: 14%
● Penalty Discipline: 10%

TKR — TOOLS KR (100%)
● Height: 8%
● Weight: 12%
● Arm Length: 12%
● Hand Size: 10%
● Speed (40): 4%
● Agility: 10%
● Explosiveness: 8%
● Strength: 24%
● Motor/Endurance: 12%

IQKR — IQ KR (100%)
● Pre-Snap Recognition: 28%
● Assignment Discipline: 30%
● Penalty Avoidance: 18%
● Situational Awareness: 12%
● Leadership: 12%

Note: Center receives a +3% premium on Pre-Snap Recognition (line calls, protection adjustments). Guards receive a +3% premium on Pulling/Movement.

---

## EDGE RUSHER (EDGE) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 3% (effort, special teams)
Defense (DKR): 62%
Tools (TKR): 22%
IQ (IQKR): 13%

DKR — DEFENSE KR (100%)
Pass Rush — 60%
● Get-Off/First Step: 14%
● Bend/Flexibility: 12%
● Hand Usage: 10%
● Counter Moves: 8%
● Pass Rush Productivity: 10%
● Motor/Relentlessness: 6%
Run Defense — 30%
● Run Defense (set edge): 16%
● Tackling-Run Fits: 8%
● Pursuit: 6%
Coverage — 10%
● Zone Coverage (short zone drop): 5%
● Man Coverage (TE/RB): 3%
● Ball Skills: 2%

TKR — TOOLS KR (100%)
● Height: 10%
● Weight: 10%
● Arm Length: 15%
● Hand Size: 5%
● Speed (40): 12%
● Agility: 10%
● Explosiveness: 14%
● Strength: 14%
● Motor/Endurance: 10%

IQKR — IQ KR (100%)
● Pre-Snap Recognition: 15%
● Processing Speed: 10%
● Assignment Discipline: 20%
● Situational Awareness: 15%
● Penalty Avoidance: 15%
● Play Recognition: 15%
● Leadership: 10%

---

## INTERIOR DL — 3-TECHNIQUE (IDL-3T) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 2%
Defense (DKR): 60%
Tools (TKR): 26%
IQ (IQKR): 12%

DKR — DEFENSE KR (100%)
Pass Rush — 50%
● Get-Off/First Step: 12%
● Hand Usage: 12%
● Counter Moves: 8%
● Pass Rush Productivity: 10%
● Motor/Relentlessness: 8%
Run Defense — 45%
● Run Defense (hold POA): 20%
● Tackling-Run Fits: 12%
● Pursuit: 8%
● Gap Discipline: 5%
Coverage — 5%
● Zone Drop (spy/short zone): 5%

TKR — TOOLS KR (100%)
● Height: 8%
● Weight: 14%
● Arm Length: 12%
● Hand Size: 8%
● Speed (40): 8%
● Agility: 8%
● Explosiveness: 14%
● Strength: 20%
● Motor/Endurance: 8%

---

## INTERIOR DL — NOSE TACKLE (IDL-NT) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 2%
Defense (DKR): 58%
Tools (TKR): 30%
IQ (IQKR): 10%

DKR — DEFENSE KR (100%)
Run Defense — 70%
● Run Defense (hold POA / eat doubles): 30%
● Tackling-Run Fits: 15%
● Gap Discipline: 15%
● Pursuit: 10%
Pass Rush — 25%
● Pass Rush Productivity: 10%
● Hand Usage: 8%
● Motor: 7%
Coverage — 5%
● Spy / short zone: 5%

TKR — TOOLS KR (100%)
● Weight: 18%
● Strength: 25%
● Height: 8%
● Arm Length: 12%
● Hand Size: 7%
● Explosiveness: 12%
● Motor/Endurance: 10%
● Speed: 4%
● Agility: 4%

---

## MIKE LINEBACKER (MIKE) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 2%
Defense (DKR): 58%
Tools (TKR): 22%
IQ (IQKR): 18%

DKR — DEFENSE KR (100%)
Tackling — 35%
● Tackling-Run Fits: 18%
● Tackling-Open Field: 10%
● Pursuit/Range: 7%
Coverage — 30%
● Zone Coverage: 14%
● Man Coverage: 10%
● Ball Skills: 6%
Pass Rush — 15%
● Blitz Effectiveness: 10%
● Pass Rush (LB): 5%
Run Defense — 20%
● Play Recognition: 12%
● Gap Discipline: 8%

TKR — TOOLS KR (100%)
● Speed (40): 18%
● Agility: 12%
● Weight: 12%
● Strength: 14%
● Explosiveness: 10%
● Height: 8%
● Arm Length: 6%
● Motor/Endurance: 20%

IQKR — IQ KR (100%)
● Play Recognition: 25%
● Pre-Snap Recognition: 20%
● Assignment Discipline: 20%
● Processing Speed: 15%
● Leadership: 12%
● Penalty Avoidance: 8%

---

## WILL LINEBACKER (WILL) — COLLEGE
OPF: AKR 2% | DKR 58% | TKR 22% | IQKR 18%
Same structure as MIKE with coverage weights increased:
Coverage — 40% (Zone 18%, Man 14%, Ball Skills 8%)
Tackling — 28% (Run Fits 12%, Open Field 10%, Pursuit 6%)
Pass Rush — 12% (Blitz 8%, Pass Rush LB 4%)
Run Defense — 20% (Play Recognition 12%, Gap Discipline 8%)

---

## SAM / STAR LINEBACKER (SAM/STAR) — COLLEGE
OPF: AKR 2% | DKR 58% | TKR 24% | IQKR 16%
Run Defense — 30% (Edge setting 16%, Gap Discipline 8%, Tackling-Run Fits 6%)
Pass Rush — 28% (Blitz Effectiveness 16%, Pass Rush LB 8%, Motor 4%)
Coverage — 22% (Zone 10%, Man 8%, Ball Skills 4%)
Tackling — 20% (Open Field 10%, Run Fits 6%, Pursuit 4%)

---

## OUTSIDE CORNER (CB-Outside) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 2%
Defense (DKR): 62%
Tools (TKR): 22%
IQ (IQKR): 14%

DKR — DEFENSE KR (100%)
Coverage — 65%
● Man Coverage: 28%
● Zone Coverage: 18%
● Ball Skills: 12%
● Release Disruption (press): 7%
Tackling — 20%
● Tackling-Open Field: 12%
● Pursuit: 8%
Run Support — 15%
● Tackling-Run Fits: 8%
● Force / Contain: 7%

TKR — TOOLS KR (100%)
● Speed (40): 22%
● Agility: 16%
● Height: 12%
● Weight: 6%
● Arm Length: 10%
● Explosiveness: 12%
● Motor/Endurance: 16%
● Strength: 6%

IQKR — IQ KR (100%)
● Play Recognition: 22%
● Pre-Snap Recognition: 18%
● Assignment Discipline: 18%
● Processing Speed: 14%
● Penalty Avoidance: 18%
● Leadership: 10%

---

## SLOT CORNER (CB-Slot / Nickel) — COLLEGE
OPF: AKR 2% | DKR 60% | TKR 22% | IQKR 16%
Coverage — 55% (Man 24%, Zone 16%, Ball Skills 10%, Release Disruption 5%)
Tackling — 28% (Open Field 14%, Run Fits 8%, Pursuit 6%)
Run Support — 17% (Run Fits 10%, Force/Contain 7%)
Blitz — bonus: Blitz Effectiveness 8% (added from run support/coverage reallocation for nickel-specific blitz role)

---

## FREE SAFETY (FS) — COLLEGE
OPF — Overall Position Framework
Attack/Offense (AKR): 2%
Defense (DKR): 60%
Tools (TKR): 22%
IQ (IQKR): 16%

DKR — DEFENSE KR (100%)
Coverage — 60%
● Zone Coverage: 25%
● Man Coverage: 14%
● Ball Skills: 14%
● Pursuit/Range: 7%
Tackling — 25%
● Tackling-Open Field: 14%
● Pursuit: 8%
● Tackling-Run Fits: 3%
Run Support — 15%
● Run Fits (alley fill): 8%
● Force/Contain: 7%

TKR — TOOLS KR (100%)
● Speed (40): 22%
● Agility: 12%
● Explosiveness: 12%
● Height: 8%
● Weight: 6%
● Arm Length: 6%
● Strength: 8%
● Motor/Endurance: 26%

IQKR — IQ KR (100%)
● Play Recognition: 25%
● Pre-Snap Recognition: 20%
● Processing Speed: 18%
● Assignment Discipline: 15%
● Leadership: 12%
● Penalty Avoidance: 10%

---

## STRONG SAFETY (SS) — COLLEGE
OPF: AKR 2% | DKR 60% | TKR 24% | IQKR 14%
Tackling — 35% (Run Fits 16%, Open Field 12%, Pursuit 7%)
Coverage — 40% (Zone 16%, Man 14%, Ball Skills 10%)
Run Support — 25% (Run Fits 12%, Force/Contain 8%, Blitz Effectiveness 5%)

---

# KLVN

KLVN — Level Normalization Ladder (Football)

Status: Canonical (Active)
Scope: Production normalization + cross-level KR translation using a single per-level lambda (λ_level[L]).

1) Purpose (Locked)
KLVN exists to ensure player performance is comparable across competitive environments and to prevent level/pace/sample-size effects from distorting evaluation. KLVN performs normalization only and does not rank, value, or project players.

2) Determinism (Locked)
KLVN is fully deterministic: identical inputs must produce identical outputs.

3) Canonical Level Order (by λ weight)
Rule: Higher λ = higher competition density (harder environment).

| Rank | Level | Key | λ_level |
|------|-------|-----|---------|
| 1 | FBS Power 5 (SEC/Big Ten/Big 12/ACC) | fbs_p5 | 1.000 |
| 2 | FBS Group of 5 (AAC/MWC/SBC/MAC/CUSA) | fbs_g5 | 0.935 |
| 3 | FBS Independent (strong) | fbs_ind | 0.920 |
| 4 | FCS (Top Tier — MVFC/Big Sky/CAA/SoCon) | fcs_top | 0.870 |
| 5 | FCS (Mid Tier) | fcs_mid | 0.830 |
| 6 | FCS (Lower Tier) | fcs_low | 0.790 |
| 7 | NCAA Division II | ncaa_d2 | 0.750 |
| 8 | NAIA | naia | 0.700 |
| 9 | NCAA Division III | ncaa_d3 | 0.660 |
| 10 | NJCAA Division I | njcaa_d1 | 0.720 |
| 11 | NJCAA Division II | njcaa_d2 | 0.640 |
| 12 | NJCAA Division III | njcaa_d3 | 0.580 |
| 13 | NCCAA | nccaa | 0.520 |
| 14 | High School / Prep / Postgrad | hs_prep | 0.430 |

4) FBS Conference Class Mapping (v1 — Season 2025-26)
Power 5 (P5): SEC, Big Ten, Big 12, ACC
Group of 5 (G5): AAC, Mountain West, Sun Belt, MAC, Conference USA
FBS Independent: Notre Dame (→ P5 equivalent λ), UConn, UMass (→ G5 equivalent λ)

5) FCS Conference Tier Mapping (v1)
Top Tier: Missouri Valley (MVFC), Big Sky, CAA, Southern Conference (SoCon)
Mid Tier: Ohio Valley, Patriot League, Pioneer, Southland, WAC (FCS)
Lower Tier: All other FCS conferences

6) Application Rule (v1 Simplification)
KLVN v1 simplification (Locked): Use λ_level[L] as a single multiplier applied uniformly across production-derived translation needs.

7) CRITICAL CLARIFICATION — KR IS UNIVERSAL, NOT LEVEL-CONVERTED
KLVN lambda normalizes INPUTS (production stats) during evaluation so that trait scoring is comparable across levels. It does NOT convert KR OUTPUTS from one level to another.

A player's KR is a single universal number. It does not change based on what level you're viewing from. There is no "P5-equivalent KR" or "G5-equivalent KR." The KR is the KR.

What changes across levels is the LEGEND INTERPRETATION of that KR. Each level has its own legend with different tier labels at different KR ranges. One player. One KR. Multiple legend reads depending on level context.

---

# COLLEGE PLAYER KR LEGENDS

## FBS POWER 5 PLAYER KR LEGEND v1
### λ = 1.000

Interpretation anchor: SEC, Big Ten, Big 12, ACC. Deep rosters, 85 scholarships, national recruiting, sustained play vs Top-25 opponents. College KR reflects current college role and impact only. No draft language, no pro projection. All ratings assume KLVN normalization.

**98-100 -- Heisman-Caliber / Transcendent Superstar.**
Program-defining force. Elite production AND elite efficiency simultaneously. Game-plan warps around stopping them and it still doesn't work. Drives wins against other elites. Conference POY lock. National awards finalist or winner. Reserved for generational single-season performers. Historic stat lines. Consensus All-American.

**95-97 -- Franchise Anchor / Elite All-American.**
Team's unquestioned alpha. Primary game-plan centerpiece. All-American or Conference POY contender. Carries offensive OR defensive load nightly. Starter on a team that wins 10+ games or earns a top-4 CFP seed. The team's identity is built around this player. Cannot be replaced.

**92-94 -- High-Impact Starter / Core Winner.**
Wins games at the highest level. Can be an offensive alpha whose production drives the team or a two-way anchor whose completeness stabilizes everything. Full-time starter. All-Conference caliber. Trusted in critical situations. Drives outcomes against elite competition.

**89-91 -- Solid Starter / Top-Five Unit Lock.**
Firmly positive starter value at P5 level. Full-time starter. Consistent two-way impact. All-Conference honorable mention range. The starters on ranked teams who aren't the stars but who you can't win without. Complementary pieces that make the machine work.

**86-88 -- Trusted Starter / High-Value Role Player.**
Starting-caliber player who thrives in a defined role. Value comes from one or more specialties: pass rushing, coverage, blocking, receiving, run game. Lineups are better with them on the field.

**83-85 -- Reliable Backup / Rotation Contributor.**
True rotation depth on good teams. Consistent energy or specialty. No major drop-off when on the field. The key backup who plays 30-50% of snaps on a ranked team.

**80-82 -- Situational Specialist / Depth Piece.**
Matchup- and context-dependent contributor. Plays in specific packages: nickel, goal-line, special teams, pass-rush specialist. 15-30% snap share.

**77-79 -- Limited Rotation / Emergency Depth.**
Playable only under constraint. Not trusted in high-leverage moments. 5-15% snap share.

**74-76 -- Fringe Roster / Non-Rotation.**
On the roster, not in the competitive plan. Garbage-time snaps only.

**71-73 -- Developmental / Project.**
Future-oriented roster slot. Physically or skill-wise incomplete. Not currently viable in P5 games. Redshirt candidate.

**68-70 -- Practice Squad / Walk-On.**
Roster filler for structure, not competition. No rotation pathway.

**Below 68 -- Below P5 Viability.**
Below P5 competitive threshold.

---

## FBS GROUP OF 5 PLAYER KR LEGEND v1
### λ = 0.935

Interpretation anchor: AAC, Mountain West, Sun Belt, MAC, Conference USA. Competitive programs with fewer resources than P5. Occasional CFP/NY6 contenders. Strong top-end talent but thinner depth.

**96-100 -- Program-Transcendent / G5 Heisman Contender.**
Best player in the conference. National recognition. Production that would translate to P5 All-Conference. Drives a G5 program to undefeated/NY6/CFP contention. Historic season at this level.

**93-95 -- Conference Dominant / Elite G5 Player.**
All-Conference lock. Best at position in conference. Consistent game-plan target that opponents scheme around. Carries the program.

**90-92 -- High-Impact Starter / Core Winner.**
Wins games at the G5 level. Full-time starter on a ranked or near-ranked G5 team. All-Conference caliber. Drives outcomes.

**87-89 -- Solid Starter / Top-Five Unit Lock.**
Positive starter value. Consistent performer. All-Conference honorable mention range. Dependable.

**84-86 -- Trusted Starter / Role Player.**
Starting-caliber. Specialty value. Does his job.

**81-83 -- Reliable Backup / Rotation.**
Rotation depth. Contributes without drop-off.

**78-80 -- Situational / Depth.**
Package-specific. Special teams contributor.

**75-77 -- Limited / Emergency.**
Minimal role. Backup's backup.

**72-74 -- Fringe / Non-Rotation.**
Roster presence only.

**69-71 -- Developmental.**
Future-oriented. Not game-ready.

**Below 69 -- Below G5 Viability.**

---

## FCS PLAYER KR LEGEND v1
### λ = 0.870 (Top Tier) / 0.830 (Mid) / 0.790 (Low)

**95-100 -- Walter Payton / Buck Buchanan Caliber.**
FCS national award contender. Best player at the level. P5 transfer portal caliber. Transcendent production.

**91-94 -- All-American / Conference Dominant.**
All-American. Best at position in conference. Consistent All-Conference first team.

**87-90 -- High-Impact Starter / Core Winner.**
Wins games. Full-time starter on playoff-caliber FCS team.

**83-86 -- Solid Starter.**
Positive starter value. Dependable.

**79-82 -- Trusted Rotation.**
Rotation player. Does his job.

**75-78 -- Backup / Depth.**
Depth piece. Special teams.

**71-74 -- Limited.**
Minimal competitive role.

**Below 71 -- Below FCS Viability.**

---

## NCAA DIVISION II PLAYER KR LEGEND v1
### λ = 0.750

**94-100 -- Harlon Hill Caliber / D2 Transcendent.**
National award contender. Best player at the level. FCS/G5 transfer caliber.

**90-93 -- All-American / Conference Dominant.**

**86-89 -- High-Impact Starter.**

**82-85 -- Solid Starter.**

**78-81 -- Trusted Rotation.**

**74-77 -- Backup / Depth.**

**Below 74 -- Below D2 Viability.**

---

## NCAA DIVISION III PLAYER KR LEGEND v1
### λ = 0.660

**93-100 -- Gagliardi Trophy Caliber / D3 Transcendent.**
National award contender. Best at the level. D2 transfer caliber.

**89-92 -- All-American / Conference Dominant.**

**85-88 -- High-Impact Starter.**

**81-84 -- Solid Starter.**

**77-80 -- Trusted Rotation.**

**73-76 -- Backup / Depth.**

**Below 73 -- Below D3 Viability.**

---

## NAIA PLAYER KR LEGEND v1
### λ = 0.700

**93-100 -- NAIA National Award Caliber / Transcendent.**
Best at the level. D2/FCS transfer caliber.

**89-92 -- All-American / Conference Dominant.**

**85-88 -- High-Impact Starter.**

**81-84 -- Solid Starter.**

**77-80 -- Trusted Rotation.**

**73-76 -- Backup / Depth.**

**Below 73 -- Below NAIA Viability.**

---

## NJCAA DIVISION I PLAYER KR LEGEND v1
### λ = 0.720

**93-100 -- NJCAA All-American / Transcendent.**
Best JUCO player at position. FBS scholarship caliber immediately. National recognition.

**89-92 -- All-Region / Conference Dominant.**

**85-88 -- High-Impact Starter.**

**81-84 -- Solid Starter.**

**77-80 -- Trusted Rotation.**

**73-76 -- Backup / Depth.**

**Below 73 -- Below NJCAA D1 Viability.**

---

## NJCAA DIVISION II PLAYER KR LEGEND v1 — λ = 0.640
## NJCAA DIVISION III PLAYER KR LEGEND v1 — λ = 0.580
## NCCAA PLAYER KR LEGEND v1 — λ = 0.520

(Same tier structure as NJCAA D1, with tier thresholds shifted down 2-4 KR points per level step.)

---

# PRO PLAYER KR LEGENDS

## NFL PLAYER KR LEGEND v1

**98-100 -- All-Time Great / MVP Caliber.**
Hall of Fame trajectory. Perennial All-Pro. MVP candidate every year. Top-5 player in the league. Franchise-defining force.

**95-97 -- Perennial All-Pro / Elite Starter.**
Consistent All-Pro. Top-10 at position. Game-plan centerpiece. Drives playoff runs. 1st-round value.

**92-94 -- High-Quality Starter / Pro Bowl Caliber.**
Pro Bowl level. Consistent positive starter. Drives unit performance. Top-15 at position.

**89-91 -- Solid NFL Starter.**
Reliable starter. Not elite but clearly starting-caliber. Fills a role effectively. Wins his matchups more often than not.

**86-88 -- Low-End Starter / High-End Backup.**
Fringe starter. Capable of starting if needed but ideally a high-end backup or rotational piece. Bridge starter in a rebuild.

**83-85 -- Quality Backup / Rotational Piece.**
Reliable backup. Plays in packages. Not a liability when on the field but not driving outcomes.

**80-82 -- Roster Depth / Special Teams.**
Makes a 53-man roster on special teams value or depth. Limited defensive/offensive role.

**77-79 -- Practice Squad / Fringe 53.**
Bubble player. Practice squad candidate. Occasional game-day elevation.

**74-76 -- Camp Body.**
Unlikely to make a 53-man roster. Training camp depth.

**Below 74 -- Below NFL Viability.**

---

## CFL PLAYER KR LEGEND v1

**92-100 -- CFL All-Star / MVP Caliber.** Dominant in the CFL. Drives a Grey Cup contender. Could be an NFL practice squad or low-end roster player.

**86-91 -- CFL Starter / Impact Player.** Reliable CFL starter. Positive contributor. Could compete for an NFL roster spot.

**80-85 -- CFL Rotation / Backup.** Depth in the CFL.

**Below 80 -- Below CFL Viability.**

---

## UFL PLAYER KR LEGEND v1

**88-100 -- UFL Star / NFL Audition.** Best players in the UFL. Active NFL pipeline. Could earn a practice squad or 53-man spot.

**82-87 -- UFL Starter.** Reliable UFL contributor.

**76-81 -- UFL Rotation.** Depth piece.

**Below 76 -- Below UFL Viability.**

---

## INTERNATIONAL (European Leagues / CIF) PLAYER KR LEGEND v1

**85-100 -- International Star / CFL/UFL Caliber.** Top international player. Could compete in CFL/UFL.

**78-84 -- International Starter.** Reliable at international level.

**Below 78 -- Below International Competitive Viability.**

---

# BADGES

Badges

BADGES — COLLEGE v1 (LOCKED)

Bronze: +0.5 KR
Silver: +1.0 KR
Gold: +1.5 KR
Total badge lift cap: +3.5 KR

Global Tier Gates (once):
● Bronze: Skill KR ≥ 90 AND each required trait ≥ 90
● Silver: Skill KR ≥ 94 AND each required trait ≥ 94
● Gold: Skill KR ≥ 97 AND each required trait ≥ 97
● Data-layer rule: each required trait must be scored (non-null) in the active layer

PRO — Global Tier Gates:
● Bronze: Skill KR ≥ 93 AND each required trait ≥ 93
● Silver: Skill KR ≥ 96 AND each required trait ≥ 96
● Gold: Skill KR ≥ 98 AND each required trait ≥ 98

## PASSING BADGES (5)
1) Deep Ball Artist — Required: Accuracy-Deep
2) Anticipation Thrower — Required: Timing/Anticipation
3) Pocket Surgeon — Required: Pocket Presence, Ball Placement
4) Cannon Arm — Required: Arm Talent
5) Play-Action Master — Required: Play-Action Execution

## RUSHING BADGES (5)
6) Contact Machine — Required: Contact Balance/Power
7) Home Run Hitter — Required: Burst/Acceleration, Speed
8) Vision King — Required: Vision/Patience
9) Fumble-Proof — Required: Ball Security
10) Pass Pro Specialist — Required: Pass Protection (RB)

## RECEIVING BADGES (5)
11) Route Technician — Required: Route Running-Precision
12) Hands of Stone (negative badge, -0.5/-1.0/-1.5) — Required: Drop rate above threshold
13) YAC Monster — Required: YAC
14) Contested Catch King — Required: Hands/Catch Radius
15) Release Artist — Required: Release

## BLOCKING BADGES (4)
16) Pancake Machine — Required: Run Blocking-Drive
17) Brick Wall — Required: Pass Protection-Technique, Pass Protection-Power
18) Road Grader — Required: Pulling/Movement
19) Clean Player — Required: Penalty Discipline (OL)

## PASS RUSH BADGES (5)
20) Speed Demon — Required: Get-Off/First Step, Bend
21) Hand Technician — Required: Hand Usage, Counter Moves
22) Sack Artist — Required: Pass Rush Productivity
23) Relentless Motor — Required: Motor/Relentlessness
24) Edge Setter — Required: Run Defense (DL/EDGE)

## COVERAGE BADGES (5)
25) Lockdown — Required: Man Coverage
26) Zone Hawk — Required: Zone Coverage, Ball Skills
27) Ball Magnet — Required: Ball Skills
28) Eraser — Required: Pursuit/Range, Tackling-Open Field
29) Sure Tackler — Required: Tackling-Run Fits, Tackling-Open Field

## IQ BADGES (4)
30) Pre-Snap Genius — Required: Pre-Snap Recognition
31) Assignment Perfect — Required: Assignment Discipline
32) Clutch Gene — Required: Situational Awareness
33) Captain — Required: Leadership

## TOOLS BADGES (4)
34) Freak Athlete — Required: Speed + Explosiveness + Agility (all ≥ gate)
35) Ironman — Required: Motor/Endurance, Games Started
36) Measurables Monster — Required: Height + Arm Length + Weight (all ≥ 90th percentile at position)
37) Speed Kill — Required: Speed (40) at ≥ 98th percentile for position

## NEGATIVE BADGES (3)
38) Hands of Stone — (WR/TE) Drop rate above threshold. Bronze: -0.5, Silver: -1.0, Gold: -1.5
39) Penalty Magnet — Penalties per game above threshold. Same negative scaling.
40) Turnover Machine — (QB) INT rate or fumble rate above threshold. Same negative scaling.

---

# SYSTEM RISKS

System Risks

SYSTEM RISKS — FOOTBALL v1
Severity Levels: Tier 1 Major (Scheme-Breaking), Tier 2 Major (Scheme-Limiting), Minor.
KR Impact:
● Tier 1 Major: College -2.0, Pro -4.0
● Tier 2 Major: College -1.5, Pro -2.5 (default, or position-scaled where noted)
● Minor: College -1.0, Pro -1.0

Anti-Stacking Rule: Where noted, higher-authority risks subsume lower ones for the same player.

COLLEGE TIER 1 MAJOR SYSTEM RISKS (-2.0 KR) — 6

1. Turnover Machine (QB)
Trigger: INT rate ≥ 4.0% OR fumbles lost ≥ 6 per season OR total turnovers ≥ 18
System damage: Possession hemorrhage. Turnovers are the single most correlated stat to winning in football.

2. Pass Protection Liability (OL)
Trigger: Pressures allowed ≥ 10% of pass-block snaps OR sacks allowed ≥ 6
System damage: QB cannot operate. Passing game collapses. Changes play-calling entirely.

3. Coverage Liability (DB/LB)
Trigger: Passer rating allowed ≥ 115 OR completion % allowed ≥ 75% on 40+ targets
System damage: Opponents target this player every play. Cannot run man or zone with this player on the field.

4. Missed Tackle Epidemic
Trigger: Missed tackle rate ≥ 18% on 50+ tackle attempts
System damage: Defense cannot get off the field. Extends drives. Breaks the tackle chain.

5. Penalty Machine
Trigger: Penalties per game ≥ 0.8 AND penalty yards per game ≥ 8
System damage: Drive-extending penalties, negated plays. Discipline failure is contagious.

6. Assignment Collapse
Trigger: Busted assignments ≥ 5 per 100 snaps AND resulted in 3+ explosive plays allowed
System damage: One player's failure creates schematic breakdown. Cannot be schemed around.

COLLEGE TIER 2 MAJOR SYSTEM RISKS (-1.5 KR) — 4

7. Limited Arm (QB) [POSITION-SCALED]
Trigger: Deep ball completion % < 30% AND deep attempts > 15% of throws
College Penalty: -1.5 for QB
System damage: Cannot threaten vertically. Defense plays two-high with impunity.

8. No Run Threat (QB)
Trigger: QB designed rush attempts < 2 per game AND scramble rate < 5%
College Penalty: -1.5
System damage: Defense never has to account for QB as runner. Eliminates RPO, read option, and designed QB run elements.

9. Speed Deficit (Skill Positions)
Trigger: 40-time > 75th percentile (slow end) at position AND breakaway play rate < 1%
College Penalty: -1.5
System damage: Cannot create explosive plays. Defense does not respect speed. Compresses the field.

10. One-Dimensional OL
Trigger: PFF pass-block grade ≥ 75 but run-block grade ≤ 55 (or vice versa)
College Penalty: -1.5
System damage: Offense becomes predictable. Formation/personnel tips run/pass.

COLLEGE MINOR SYSTEM RISKS (-1.0 KR) — 5

11. Elevated Turnover Risk (QB)
Trigger: INT rate 3.0-3.9% OR fumbles lost 4-5 per season

12. Limited Route Tree (WR/TE)
Trigger: Effective on ≤ 3 route types

13. Pursuit Deficit (LB/S)
Trigger: Pursuit grade < 65 on 500+ snaps

14. Partial Scheme Lock
Trigger: Production drops ≥ 20% when team changes offensive/defensive scheme mid-game

15. Durability Concern
Trigger: Missed 3+ games in 2 of last 3 seasons OR played < 70% of possible snaps

PRO TIER 1 MAJOR (-4.0 KR): Same triggers with tightened thresholds (INT rate ≥ 3.5%, pressure rate ≥ 8%, etc.)
PRO TIER 2 MAJOR (-2.5 KR): Same structure, tightened thresholds.
PRO MINOR (-1.0 KR): Same structure, tightened thresholds.

---

# IMPACT MODIFIERS

Impact Modifiers

IMPACT MODIFIERS — FOOTBALL v1 (LOCKED)

Purpose: KR measures how much a player impacts winning. Impact Modifiers classify the mode by which that impact is produced.

Assignment Rules: One modifier max per player. Evaluate in strict precedence order. First match wins.
1. Primary Engine
2. Secondary Engine
3. Force Multiplier
4. Specialist Anchor
5. Else → Unclassified

1) Primary Engine
Definition: Player whose impact is structurally required for team function. Offense/defense is organized around them.
Assign PRIMARY ENGINE if ALL conditions hold:
● For QBs: EPA per play ≥ 0.15, total QBR ≥ 70, team win improvement ≥ +3 wins attributed
● For non-QBs: Usage/snap share ≥ 85%, production share ≥ 25% of unit production, on/off field differential ≥ +5.0 EPA

2) Secondary Engine
Definition: Creates advantages but does not anchor the unit continuously.
Assign SECONDARY ENGINE if ALL conditions hold:
● Snap share ≥ 75%, production share 15-24% of unit, on/off ≥ +3.0 EPA

3) Force Multiplier
Definition: Impact driven by efficiency, scheme-enabling play, and connective value. Makes teammates better.
Assign FORCE MULTIPLIER if ALL conditions hold:
● Snap share ≥ 70%, team unit improves ≥ 10% with player on field, ≥ 2 Multiplier Triggers
Multiplier Triggers: Elite blocking (run/pass), coverage shadow (reduces target rate to covered WR), turnover creation (3+ INTs or forced fumbles), red zone efficiency, special teams impact.

4) Specialist Anchor
Definition: Elite in one narrow domain.
Assign SPECIALIST ANCHOR if ALL conditions hold:
● Snap share ≥ 50%, exactly one Elite Signal is true
Elite Signals: Sack leader (10+ sacks), INT leader (5+ INTs), return TD specialist, FG kicker (90%+), punter (45+ net avg), elite run-stuffer (run-stop rate 12%+).

---

# OVERRIDES

Overrides

OVERRIDES — FOOTBALL v1

Purpose: Overrides handle edge cases where standard evaluation logic produces demonstrably wrong outputs. They are exception handlers, not tuning knobs.

Override Types:
1. Injury Override — Player evaluation is suppressed by documented injury. Requires medical documentation or official missed-game confirmation.
2. Role Suppression Override — Player's statistical production is artificially suppressed by role constraints (e.g., RB in a committee, WR in a run-first offense). Requires evidence of production when given opportunity.
3. System Mismatch Override — Player's stats underperform because of poor scheme fit, not lack of talent. Requires evidence from prior system or context.
4. Sample Size Override — Insufficient data for reliable evaluation. Flags evaluation as LOW CONFIDENCE. Does not modify KR but attaches confidence penalty.
5. Transfer Context Override — Player in transition between programs. Stats may not reflect capability. Requires prior-context evidence.

Governance: Every override must cite specific evidence. Overrides are disclosed in evaluation output. Overrides do not modify trait scores — they modify the confidence level or provide context for the KR interpretation.

---

# GOVERNANCE

All changes to any section of this document — trait definitions, archetype gates, system demand profiles, OPF weights, KLVN lambdas, legends, badges, system risks, impact modifiers, or overrides — require documentation, versioning, and explicit approval. All amendments are tracked in this document's version history.

v1.0: Initial football architecture. Mirrors basketball File 02 structure exactly. Contains: UI System Set (8 offensive + 6 defensive systems), Trait Library (8 clusters, 59 locked traits), Archetype Library (40 archetypes across O/D/ST), System Demand Profiles (14 schemes), Position Trait Weighting/OPF (16 position profiles covering all 22 positions), KLVN (14 levels), College Legends (FBS P5, FBS G5, FCS, D2, D3, NAIA, NJCAA D1/D2/D3, NCCAA), Pro Legends (NFL, CFL, UFL, International), Badges (40), System Risks (15 college + pro), Impact Modifiers (4 types), Overrides (5 types).
